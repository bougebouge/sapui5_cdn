import CommonUtils from "sap/fe/core/CommonUtils";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { EDM_TYPE_MAPPING } from "sap/fe/core/templating/DisplayModeFormatter";
import CommonHelper from "sap/fe/macros/CommonHelper";
import AnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";
import JSTokenizer from "sap/base/util/JSTokenizer";

const FilterFieldHelper = {
	//FilterField
	isRequiredInFilter: function (path: any, oDetails: any) {
		const oModel = oDetails.context.getModel(),
			sPropertyPath = oDetails.context.getPath(),
			sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath);
		const entitySetPath = ModelHelper.getEntitySetPath(sPropertyLocationPath, oModel);

		let sProperty: string,
			oFR,
			bIsRequired = oModel.getObject(entitySetPath + "/@com.sap.vocabularies.Common.v1.ResultContext");

		if (!bIsRequired) {
			if (typeof path === "string") {
				sProperty = path;
			} else {
				sProperty = oModel.getObject(`${sPropertyPath}@sapui.name`);
			}
			oFR = CommonUtils.getFilterRestrictionsByPath(entitySetPath, oModel);
			bIsRequired = oFR && oFR.RequiredProperties && oFR.RequiredProperties.indexOf(sProperty) > -1;
		}
		return bIsRequired;
	},
	maxConditions: function (path: any, oDetails: any) {
		let sProperty,
			maxConditions = -1;
		const oModel = oDetails.context.getModel(),
			sPropertyPath = oDetails.context.getPath();

		const sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath);
		if (oModel.getObject(`${sPropertyLocationPath}/@com.sap.vocabularies.Common.v1.ResultContext`) === true) {
			return 1;
		}

		if (typeof path === "string") {
			sProperty = path;
		} else {
			sProperty = oModel.getObject(`${sPropertyPath}@sapui.name`);
		}
		const oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sPropertyLocationPath, oModel);
		let oProperty = oModel.getObject(`${sPropertyLocationPath}/${sProperty}`);
		if (!oProperty) {
			oProperty = oModel.getObject(sPropertyPath);
		}
		if (oProperty.$Type === "Edm.Boolean") {
			maxConditions = 1;
		} else if (
			oFilterRestrictions &&
			oFilterRestrictions.FilterAllowedExpressions &&
			oFilterRestrictions.FilterAllowedExpressions[sProperty]
		) {
			const sAllowedExpression = CommonUtils.getSpecificAllowedExpression(oFilterRestrictions.FilterAllowedExpressions[sProperty]);
			if (sAllowedExpression === "SingleValue" || sAllowedExpression === "SingleRange") {
				maxConditions = 1;
			}
		}
		return maxConditions;
	},
	/**
	 * To Create binding for mdc:filterfield conditions.
	 *
	 * @param iContext An interface with context to the path to be considered for binding
	 * @param vProperty The property to create the condition binding for
	 * @param oEntityType The EntityType
	 * @returns Expression binding for conditions for the field
	 */
	getConditionsBinding: function (iContext: any, vProperty: string | any, oEntityType: any) {
		const oPropertyInterface = iContext.getInterface(0),
			oMetaModel = oPropertyInterface.getModel(),
			sFullPropertyPath = oPropertyInterface.getPath();
		let sConditionPath = "",
			sEntityTypePath = iContext.getInterface(1).getPath(),
			aPropertyPathParts,
			i;

		if (oEntityType && oEntityType["$kind"] === "EntityType" && sFullPropertyPath.startsWith(sEntityTypePath)) {
			// in case:
			// 1. sFullPropertyPath is '/SOM/Name' and sEntityTypePath is '/SOM/'(normal scenario)
			// 2. sFullPropertyPath is '/Customer/Set/Name' and sEntityTypePath is '/Customer/Set/'(main entitytype proerty in parameterized case)
			sEntityTypePath = iContext.getInterface(1).getPath();
			const sPropertyPath = sFullPropertyPath.replace(sEntityTypePath, "");
			aPropertyPathParts = sPropertyPath.split("/");
		} else {
			// 1. sFullPropertyPath is '/Customer/Set/Name' and sEntityTypePath is '/Customer/P_CC'(parameter proerty in parameterized case)
			aPropertyPathParts = sFullPropertyPath.substring(1).split("/");
			sEntityTypePath = `/${aPropertyPathParts.shift()}/`;
		}

		for (i = 0; i < aPropertyPathParts.length; ++i) {
			vProperty = oMetaModel.getProperty(sEntityTypePath + aPropertyPathParts.slice(0, i + 1).join("/"));
			if (vProperty.$kind === "NavigationProperty" && vProperty.$isCollection) {
				sConditionPath += `${aPropertyPathParts[i]}*/`;
			} else if (typeof vProperty !== "string") {
				sConditionPath += `${aPropertyPathParts[i]}/`;
			}
		}
		// remove the last slash from the conditionPath
		return `{$filters>/conditions/${sConditionPath.substring(0, sConditionPath.length - 1)}}`;
	},
	constraints: function (oProperty: any, oInterface: any) {
		const sValue = AnnotationHelper.format(oProperty, oInterface) as string,
			aMatches = sValue && sValue.match(/constraints:.*?({.*?})/);
		const oConstraints = aMatches ? JSTokenizer.parseJS(aMatches[1]) : {};
		// Workaround. Add "V4: true" to DateTimeOffset constraints. AnnotationHelper is not aware of this flag.
		if (sValue.includes("sap.ui.model.odata.type.DateTimeOffset")) {
			// Ensure that V4:true is there. With the openUI5 BLI: CPOUI5ODATAV4-2131 the constraints are already include 'V4':true
			oConstraints.V4 = true;
		}
		// Remove {nullable:false} from the constraints as it prevents from having an empty filter field
		// in the case of a single-value filter
		if (oConstraints.nullable === false) {
			delete oConstraints.nullable;
		}
		// Unfortunately, JSTokenizer does not provide a method to stringify (reversing parseJS).
		// Using JSON.stringify and replacing double quotes with single quotes works at least in the known simple cases (flat objects not containing quotes in property names or values).
		// If special cases should occur in future, this might need some adoption (depending on the required string format in that case).
		return Object.keys(oConstraints).length === 0 ? undefined : JSON.stringify(oConstraints).replaceAll('"', "'");
	},
	formatOptions: function (oProperty: any, oInterface: any) {
		// as the Annotation helper always returns "parseKeepsEmptyString: true" we need to prevent this in case a property (of type string) is nullable
		// Filling oInterface.arguments with an array where the first parameter is null, and the second contains the "expected"
		// parseKeepsEmptyString value follows a proposal from the model colleagues to "overrule" the behavior of the AnnotationHelper
		if (oProperty.$Type === "Edm.String" && (!oProperty.hasOwnProperty("$Nullable") || oProperty.$Nullable === true)) {
			oInterface.arguments = [null, { parseKeepsEmptyString: false }];
		}
		const sValue = AnnotationHelper.format(oProperty, oInterface) as string,
			aMatches = sValue && sValue.match(/formatOptions:.*?({.*?})/);
		return (aMatches && aMatches[1]) || undefined;
	},
	getDataType: function (sPropertyType: any) {
		const oTypeMapping = EDM_TYPE_MAPPING[sPropertyType];
		return oTypeMapping ? oTypeMapping.type : sPropertyType;
	}
};
(FilterFieldHelper.getConditionsBinding as any).requiresIContext = true;

export default FilterFieldHelper;
