import type { Property } from "@sap-ux/vocabularies-types";
import { DataFieldAbstractTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import type { FormElement } from "sap/fe/core/converters/controls/Common/Form";
import { UI } from "sap/fe/core/converters/helpers/BindingHelper";
import { KeyHelper } from "sap/fe/core/converters/helpers/Key";
import type { BindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, constant, equal, ifElse, or, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import SideEffectsHelper from "sap/fe/core/helpers/SideEffectsHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { isRequiredExpression } from "sap/fe/core/templating/FieldControlHelper";
import { isProperty } from "sap/fe/core/templating/PropertyHelper";
import { getAlignmentExpression } from "sap/fe/core/templating/UIFormatters";
import CommonHelper from "sap/fe/macros/CommonHelper";
import ValueListHelper from "sap/fe/macros/internal/valuehelp/ValueListHelper";
import type { ValueHelpPayload } from "sap/fe/macros/internal/valuehelp/ValueListHelperNew";
import ResourceModel from "sap/fe/macros/ResourceModel";
import ManagedObject from "sap/ui/base/ManagedObject";
import DateFormat from "sap/ui/core/format/DateFormat";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ODataMetaModel from "sap/ui/model/odata/ODataMetaModel";
import AnnotationHelper from "sap/ui/model/odata/v4/AnnotationHelper";
import type Context from "sap/ui/model/odata/v4/Context";

const ISOCurrency = "@Org.OData.Measures.V1.ISOCurrency",
	Unit = "@Org.OData.Measures.V1.Unit";

/**
 * What does the map look like?
 *    {
 *  	'namespace.of.entityType' : [
 * 			[namespace.of.entityType1#Qualifier,namespace.of.entityType2#Qualifier], --> Search For: mappingSourceEntities
 * 			{
 * 				'property' : [namespace.of.entityType3#Qualifier,namespace.of.entityType4#Qualifier] --> Search For: mappingSourceProperties
 * 			}
 * 	}.
 *
 * @param oInterface Interface instance
 * @returns Promise resolved when the map is ready and provides the map
 */
async function _generateSideEffectsMap(oInterface: any) {
	const oMetaModel = oInterface.getModel();
	const oFieldSettings = oInterface.getSetting("sap.fe.macros.internal.Field");
	const oSideEffects = oFieldSettings.sideEffects;

	// Generate map once
	if (oSideEffects) {
		return oSideEffects;
	}

	return SideEffectsHelper.generateSideEffectsMapFromMetaModel(oMetaModel);
}

const FieldHelper = {
	/**
	 * Determine how to show the value by analyzing Text and TextArrangement Annotations.
	 *
	 * @function
	 * @name sap.fe.macros.field.FieldHelper#displayMode
	 * @memberof sap.fe.macros.field.FieldHelper
	 * @static
	 * @param oPropertyAnnotations The Property annotations
	 * @param oCollectionAnnotations The EntityType annotations
	 * @returns The display mode of the field
	 * @private
	 * @ui5-restricted
	 */
	displayMode: function (oPropertyAnnotations: any, oCollectionAnnotations: any) {
		const oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"],
			oTextArrangementAnnotation =
				oTextAnnotation &&
				((oPropertyAnnotations &&
					oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]) ||
					(oCollectionAnnotations && oCollectionAnnotations["@com.sap.vocabularies.UI.v1.TextArrangement"]));

		if (oTextArrangementAnnotation) {
			if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
				return "Description";
			} else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
				return "ValueDescription";
			}
			//Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
			return "DescriptionValue";
		}
		return oTextAnnotation ? "DescriptionValue" : "Value";
	},
	buildExpressionForTextValue: function (sPropertyPath: any, oDataField: any) {
		const oMetaModel = oDataField.context.getModel();
		const sPath = oDataField.context.getPath();
		const oTextAnnotationContext = oMetaModel.createBindingContext(`${sPath}@com.sap.vocabularies.Common.v1.Text`);
		const oTextAnnotation = oTextAnnotationContext.getProperty();
		const sTextExpression = oTextAnnotation ? AnnotationHelper.value(oTextAnnotation, { context: oTextAnnotationContext }) : undefined;
		let sExpression: string | undefined = "";
		sPropertyPath = AnnotationHelper.getNavigationPath(sPropertyPath);
		if (sPropertyPath.indexOf("/") > -1 && sTextExpression) {
			sExpression = sPropertyPath.replace(/[^\/]*$/, sTextExpression.substr(1, sTextExpression.length - 2));
		} else {
			sExpression = sTextExpression;
		}
		if (sExpression) {
			sExpression = "{ path : '" + sExpression.replace(/^\{+/g, "").replace(/\}+$/g, "") + "', parameters: {'$$noPatch': true}}";
		}
		return sExpression;
	},

	buildTargetPathFromDataModelObjectPath: function (oDataModelObjectPath: any) {
		const sSartEntitySet = oDataModelObjectPath.startingEntitySet.name;
		let sPath = `/${sSartEntitySet}`;
		const aNavigationProperties = oDataModelObjectPath.navigationProperties;
		for (let i = 0; i < aNavigationProperties.length; i++) {
			sPath += `/${aNavigationProperties[i].name}`;
		}
		return sPath;
	},
	hasSemanticObjectTargets: function (oPropertyDataModelObjectPath: DataModelObjectPath) {
		const oPropertyDefinition = isProperty(oPropertyDataModelObjectPath.targetObject)
			? oPropertyDataModelObjectPath.targetObject
			: (oPropertyDataModelObjectPath.targetObject.$target as Property);
		const sSemanticObject = oPropertyDefinition.annotations?.Common?.SemanticObject;
		const aSemanticObjectUnavailableActions = oPropertyDefinition.annotations?.Common?.SemanticObjectUnavailableActions;
		const sPropertyLocationPath = FieldHelper.buildTargetPathFromDataModelObjectPath(oPropertyDataModelObjectPath);
		const sPropertyPath = `${sPropertyLocationPath}/${oPropertyDefinition.name}`;
		let sBindingExpression;
		if ((sSemanticObject as any)?.path) {
			sBindingExpression = compileExpression(pathInModel((sSemanticObject as any).path));
		}
		if (sPropertyPath && (sBindingExpression || (sSemanticObject?.valueOf() as any)?.length > 0)) {
			const sAlternatePath = sPropertyPath.replace(/\//g, "_"); //replaceAll("/","_");
			if (!sBindingExpression) {
				const sBindingPath =
					"pageInternal>semanticsTargets/" +
					sSemanticObject?.valueOf() +
					"/" +
					sAlternatePath +
					(!aSemanticObjectUnavailableActions ? "/HasTargetsNotFiltered" : "/HasTargets");
				return "{parts:[{path:'" + sBindingPath + "'}], formatter:'FieldRuntime.hasTargets'}";
			} else {
				// Semantic Object Name is a path we return undefined
				// this will be updated later via modelContextChange
				return undefined;
			}
		} else {
			return false;
		}
	},
	getStateDependingOnSemanticObjectTargets: function (oPropertyDataModelObjectPath: DataModelObjectPath) {
		const oPropertyDefinition = isProperty(oPropertyDataModelObjectPath.targetObject)
			? oPropertyDataModelObjectPath.targetObject
			: (oPropertyDataModelObjectPath.targetObject.$target as Property);
		const sSemanticObject = oPropertyDefinition.annotations?.Common?.SemanticObject;
		const aSemanticObjectUnavailableActions = oPropertyDefinition.annotations?.Common?.SemanticObjectUnavailableActions;
		const sPropertyLocationPath = FieldHelper.buildTargetPathFromDataModelObjectPath(oPropertyDataModelObjectPath);
		const sPropertyPath = `${sPropertyLocationPath}/${oPropertyDefinition.name}`;
		let sBindingExpression;
		if ((sSemanticObject as any)?.path) {
			sBindingExpression = compileExpression(pathInModel((sSemanticObject as any).path));
		}
		if (sPropertyPath && (sBindingExpression || (sSemanticObject?.valueOf() as any)?.length > 0)) {
			const sAlternatePath = sPropertyPath.replace(/\//g, "_");
			if (!sBindingExpression) {
				const sBindingPath = `pageInternal>semanticsTargets/${sSemanticObject?.valueOf()}/${sAlternatePath}${
					!aSemanticObjectUnavailableActions ? "/HasTargetsNotFiltered" : "/HasTargets"
				}`;
				return `{parts:[{path:'${sBindingPath}'}], formatter:'FieldRuntime.getStateDependingOnSemanticObjectTargets'}`;
			} else {
				return "Information";
			}
		} else {
			return "None";
		}
	},
	isNotAlwaysHidden: function (oDataField: any, oDetails: any) {
		const oContext = oDetails.context;
		let isAlwaysHidden: any = false;
		if (oDataField.Value && oDataField.Value.$Path) {
			isAlwaysHidden = oContext.getObject("Value/$Path@com.sap.vocabularies.UI.v1.Hidden");
		}
		if (!isAlwaysHidden || isAlwaysHidden.$Path) {
			isAlwaysHidden = oContext.getObject("@com.sap.vocabularies.UI.v1.Hidden");
			if (!isAlwaysHidden || isAlwaysHidden.$Path) {
				isAlwaysHidden = false;
			}
		}
		return !isAlwaysHidden;
	},
	isDraftIndicatorVisibleInFieldGroup: function (column: any) {
		if (
			column &&
			column.formatOptions &&
			column.formatOptions.fieldGroupDraftIndicatorPropertyPath &&
			column.formatOptions.fieldGroupName
		) {
			return (
				"{parts: [" +
				"{value: '" +
				column.formatOptions.fieldGroupName +
				"'}," +
				"{path: 'internal>semanticKeyHasDraftIndicator'} , " +
				"{path: 'HasDraftEntity', targetType: 'any'}, " +
				"{path: 'IsActiveEntity', targetType: 'any'}, " +
				"{path: 'pageInternal>hideDraftInfo', targetType: 'any'}], " +
				"formatter: 'sap.fe.macros.field.FieldRuntime.isDraftIndicatorVisible'}"
			);
		} else {
			return false;
		}
	},
	isRequired: function (oFieldControl: any, sEditMode: any) {
		if (sEditMode === "Display" || sEditMode === "ReadOnly" || sEditMode === "Disabled") {
			return false;
		}
		if (oFieldControl) {
			if ((ManagedObject as any).bindingParser(oFieldControl)) {
				return "{= %" + oFieldControl + " === 7}";
			} else {
				return oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory";
			}
		}
		return false;
	},

	getActionParameterVisibility: function (oParam: any, oContext: any) {
		// To use the UI.Hidden annotation for controlling visibility the value needs to be negated
		if (typeof oParam === "object") {
			if (oParam && oParam.$If && oParam.$If.length === 3) {
				// In case the UI.Hidden contains a dynamic expression we do this
				// by just switching the "then" and "else" part of the erpression
				// oParam.$If[0] <== Condition part
				// oParam.$If[1] <== Then part
				// oParam.$If[2] <== Else part
				const oNegParam: any = { $If: [] };
				oNegParam.$If[0] = oParam.$If[0];
				oNegParam.$If[1] = oParam.$If[2];
				oNegParam.$If[2] = oParam.$If[1];
				return AnnotationHelper.value(oNegParam, oContext);
			} else {
				return "{= !%{" + oParam.$Path + "} }";
			}
		} else if (typeof oParam === "boolean") {
			return AnnotationHelper.value(!oParam, oContext);
		} else {
			return undefined;
		}
	},

	/**
	 * Computed annotation that returns vProperty for a string and @sapui.name for an object.
	 *
	 * @param vProperty The property
	 * @param oInterface The interface instance
	 * @returns The property name
	 */
	propertyName: function (vProperty: any, oInterface: any) {
		let sPropertyName;
		if (typeof vProperty === "string") {
			if (oInterface.context.getPath().indexOf("$Path") > -1 || oInterface.context.getPath().indexOf("$PropertyPath") > -1) {
				// We could end up with a pure string property (no $Path), and this is not a real property in that case
				sPropertyName = vProperty;
			}
		} else if (vProperty.$Path || vProperty.$PropertyPath) {
			const sPath = vProperty.$Path ? "/$Path" : "/$PropertyPath";
			const sContextPath = oInterface.context.getPath();
			sPropertyName = oInterface.context.getObject(`${sContextPath + sPath}/$@sapui.name`);
		} else if (vProperty.Value && vProperty.Value.$Path) {
			sPropertyName = vProperty.Value.$Path;
		} else {
			sPropertyName = oInterface.context.getObject("@sapui.name");
		}

		return sPropertyName;
	},

	/**
	 * This method getFieldGroupIDs uses a map stored in preprocessing data for the macro Field
	 * _generateSideEffectsMap generates this map once during templating for the first macro field
	 * and then reuses it. Map exists only during templating.
	 * The map is used to set the field group IDs for the macro field.
	 * A field group ID has the format -- namespace.of.entityType#Qualifier
	 * where 'namespace.of.entityType' is the target entity type of the side effect annotation
	 * and 'Qualifier' is the qualififer of the side effect annotation.
	 * This information is enough to identify the side effect annotation.
	 *
	 * @param oContext Context instance
	 * @param sPropertyPath Property path
	 * @returns A promise which provides a string of field group IDs separated by a comma
	 */
	getFieldGroupIds: function (oContext: any, sPropertyPath: string) {
		if (!sPropertyPath) {
			return undefined;
		}
		const oInterface = oContext.getInterface(0);
		// generate the mapping for side effects or get the generated map if it is already generated
		return _generateSideEffectsMap(oInterface).then(function (oSideEffects: any) {
			const oFieldSettings = oInterface.getSetting("sap.fe.macros.internal.Field");
			oFieldSettings.sideEffects = oSideEffects;
			const sOwnerEntityType = oContext.getPath(1).substr(1);
			const aFieldGroupIds = FieldHelper.getSideEffectsOnEntityAndProperty(sPropertyPath, sOwnerEntityType, oSideEffects);
			let sFieldGroupIds;

			if (aFieldGroupIds.length) {
				sFieldGroupIds = aFieldGroupIds.reduce(function (sResult: any, sId: any) {
					return (sResult && `${sResult},${sId}`) || sId;
				});
			}
			return sFieldGroupIds; //"ID1,ID2,ID3..."
		});
	},

	/**
	 * Generate map which has data from source entity as well as source property for a given field.
	 *
	 * @param sPath
	 * @param sOwnerEntityType
	 * @param oSideEffects
	 * @returns An array of side Effect Ids.
	 */
	getSideEffectsOnEntityAndProperty: function (sPath: string, sOwnerEntityType: string, oSideEffects: any) {
		const bIsNavigationPath = sPath.indexOf("/") > 0;
		sPath = bIsNavigationPath ? sPath.substr(sPath.lastIndexOf("/") + 1) : sPath;
		// add to fieldGroupIds, all side effects which mention sPath as source property or sOwnerEntityType as source entity
		return (
			(oSideEffects[sOwnerEntityType] && oSideEffects[sOwnerEntityType][0].concat(oSideEffects[sOwnerEntityType][1][sPath] || [])) ||
			[]
		);
	},

	fieldControl: function (sPropertyPath: any, oInterface: any) {
		const oModel = oInterface && oInterface.context.getModel();
		const sPath = oInterface && oInterface.context.getPath();
		const oFieldControlContext = oModel && oModel.createBindingContext(`${sPath}@com.sap.vocabularies.Common.v1.FieldControl`);
		const oFieldControl = oFieldControlContext && oFieldControlContext.getProperty();
		if (oFieldControl) {
			if (oFieldControl.hasOwnProperty("$EnumMember")) {
				return oFieldControl.$EnumMember;
			} else if (oFieldControl.hasOwnProperty("$Path")) {
				return AnnotationHelper.value(oFieldControl, { context: oFieldControlContext });
			}
		} else {
			return undefined;
		}
	},
	/**
	 * Method to get the navigation entity(the entity where should i look for the available quick view facets)
	 *    -Loop over all navigation property
	 *    -Look into ReferentialConstraint constraint
	 *    -If ReferentialConstraint.Property = property(Semantic Object) ==> success QuickView Facets from this entity type can be retrieved
	 *
	 * @function
	 * @name getNavigationEntity
	 * @memberof sap.fe.macros.field.FieldHelper.js
	 * @param {object} oProperty property object on which semantic object is configured
	 * @param {object} oContext Metadata Context(Not passed when called with template:with)
	 * @returns {string|undefined} - if called with context then navigation entity relative binding like "{supplier}" is returned
	 *    else context path for navigation entity for templating is returned  e.g “/Products/$Type/supplier”
	 *  where Products - Parent entity, supplier - Navigation entity name
	 */

	getNavigationEntity: function (oProperty: any, oContext: any) {
		const oContextObject = (oContext && oContext.context) || oProperty;
		//Get the entity type path ex. /Products/$Type from /Products/$Type@com.sap.vocabularies.UI.v1.HeaderInfo/Description/Value...
		let sNavigationPart = "";
		let sNavigationPath = `${AnnotationHelper.getNavigationPath(oContextObject.getPath())}/`;
		const sPropertyPath = oContextObject.getObject().$Path;
		const sPropertyName = sPropertyPath.split("/").pop();

		if (sNavigationPath.indexOf(sPropertyPath) > -1) {
			sNavigationPath = sNavigationPath.split(sPropertyPath)[0];
		}

		if (sPropertyPath.indexOf("/") > -1) {
			// Navigation property detected.
			sNavigationPart = `${sPropertyPath.substring(0, sPropertyPath.lastIndexOf("/"))}/`;
			sNavigationPath += sNavigationPart;
		}

		//Get the entity type object
		const oEntityType = oContextObject.getObject(sNavigationPath),
			//Get the navigation entity details
			aKeys = Object.keys(oEntityType),
			length = aKeys.length;

		for (let index = 0; index < length; index++) {
			if (
				oEntityType[aKeys[index]].$kind === "NavigationProperty" &&
				oEntityType[aKeys[index]].$ReferentialConstraint &&
				oEntityType[aKeys[index]].$ReferentialConstraint.hasOwnProperty(sPropertyName)
			) {
				return oContext ? AnnotationHelper.getNavigationBinding(sNavigationPart + aKeys[index]) : sNavigationPath + aKeys[index];
			}
		}
		if (oEntityType["$Key"].includes(sPropertyName)) {
			//return sNavigationPath + sPropertyName;
			return oContext ? AnnotationHelper.getNavigationBinding(sNavigationPart) : sNavigationPath;
		}
		const oAnnotations = oContextObject.getObject(sNavigationPath + "@");
		for (const singleAnnotation in oAnnotations) {
			if (singleAnnotation.includes("SemanticKey")) {
				if (oAnnotations[singleAnnotation][0].$PropertyPath === sPropertyName) {
					return oContext ? AnnotationHelper.getNavigationBinding(sNavigationPart) : sNavigationPath;
				}
			}
		}
		return undefined;
	},

	/**
	 * Method to get the value help property from a DataField or a PropertyPath (in case a SelectionField is used)
	 * Priority from where to get the property value of the field (examples are "Name" and "Supplier"):
	 * 1. If oPropertyContext.getObject() has key '$Path', then we take the value at '$Path'.
	 * 2. Else, value at oPropertyContext.getObject().
	 * If there is an ISOCurrency or if there are Unit annotations for the field property,
	 * then the Path at the ISOCurrency or Unit annotations of the field property is considered.
	 *
	 * @memberof sap.fe.macros.field.FieldHelper.js
	 * @param oPropertyContext The context from which value help property need to be extracted.
	 * @param bInFilterField Whether or not we're in the filter field and should ignore
	 * @returns The value help property path
	 */
	valueHelpProperty: function (oPropertyContext: Context, bInFilterField?: boolean) {
		/* For currency (and later Unit) we need to forward the value help to the annotated field */
		const sContextPath = oPropertyContext.getPath();
		const oContent = oPropertyContext.getObject() || {};
		let sPath = oContent.$Path ? `${sContextPath}/$Path` : sContextPath;
		const sAnnoPath = `${sPath}@`;
		const oPropertyAnnotations = oPropertyContext.getObject(sAnnoPath);
		let sAnnotation;
		if (oPropertyAnnotations) {
			sAnnotation =
				(oPropertyAnnotations.hasOwnProperty(ISOCurrency) && ISOCurrency) || (oPropertyAnnotations.hasOwnProperty(Unit) && Unit);
			if (sAnnotation && !bInFilterField) {
				const sUnitOrCurrencyPath = `${sPath + sAnnotation}/$Path`;
				// we check that the currency or unit is a Property and not a fixed value
				if (oPropertyContext.getObject(sUnitOrCurrencyPath)) {
					sPath = sUnitOrCurrencyPath;
				}
			}
		}
		return sPath;
	},

	/**
	 * Dedicated method to avoid looking for unit properties.
	 *
	 * @param oPropertyContext
	 * @returns The value help property path
	 */
	valueHelpPropertyForFilterField: function (oPropertyContext: any) {
		return FieldHelper.valueHelpProperty(oPropertyContext, true);
	},

	/**
	 * Method to generate the ID for Value Help.
	 *
	 * @function
	 * @name getIDForFieldValueHelp
	 * @memberof sap.fe.macros.field.FieldHelper.js
	 * @param sFlexId Flex ID of the current object
	 * @param sIdPrefix Prefix for the ValueHelp ID
	 * @param sOriginalPropertyName Name of the property
	 * @param sPropertyName Name of the ValueHelp Property
	 * @returns The ID generated for the ValueHelp
	 */
	getIDForFieldValueHelp: function (sFlexId: string | null, sIdPrefix: string, sOriginalPropertyName: string, sPropertyName: string) {
		if (sFlexId) {
			return sFlexId;
		}
		let sProperty = sPropertyName;
		if (sOriginalPropertyName !== sPropertyName) {
			sProperty = `${sOriginalPropertyName}::${sPropertyName}`;
		}
		return generate([sIdPrefix, sProperty]);
	},

	/**
	 * Method to get the fieldHelp property of the FilterField.
	 *
	 * @function
	 * @name getFieldHelpPropertyForFilterField
	 * @memberof sap.fe.macros.field.FieldHelper.js
	 * @param iContext The interface instance of the context
	 * @param oProperty The object of the FieldHelp property
	 * @param sPropertyType The $Type of the property
	 * @param sVhIdPrefix The ID prefix of the value help
	 * @param sPropertyName The name of the property
	 * @param sValueHelpPropertyName The property name of the value help
	 * @param bHasValueListWithFixedValues `true` if there is a value list with a fixed value annotation
	 * @param bUseSemanticDateRange `true` if the semantic date range is set to 'true' in the manifest
	 * @returns The field help property of the value help
	 */
	getFieldHelpPropertyForFilterField: function (
		iContext: any,
		oProperty: any,
		sPropertyType: string,
		sVhIdPrefix: string,
		sPropertyName: string,
		sValueHelpPropertyName: string,
		bHasValueListWithFixedValues: boolean,
		bUseSemanticDateRange: boolean | string
	) {
		const oContext = iContext.getInterface(0).getModel(1).createBindingContext(iContext.getInterface(0).getPath(1));
		const sProperty = FieldHelper.propertyName(oProperty, { context: oContext }),
			bSemanticDateRange = bUseSemanticDateRange === "true" || bUseSemanticDateRange === true;
		const oModel = oContext.getModel(),
			sPropertyPath = oContext.getPath(),
			sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
			oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sPropertyLocationPath, oContext);
		if (
			((sPropertyType === "Edm.DateTimeOffset" || sPropertyType === "Edm.Date") &&
				bSemanticDateRange &&
				oFilterRestrictions &&
				oFilterRestrictions.FilterAllowedExpressions &&
				oFilterRestrictions.FilterAllowedExpressions[sProperty] &&
				(oFilterRestrictions.FilterAllowedExpressions[sProperty].indexOf("SingleRange") !== -1 ||
					oFilterRestrictions.FilterAllowedExpressions[sProperty].indexOf("SingleValue") !== -1)) ||
			(sPropertyType === "Edm.Boolean" && !bHasValueListWithFixedValues)
		) {
			return undefined;
		}
		return FieldHelper.getIDForFieldValueHelp(null, sVhIdPrefix || "FilterFieldValueHelp", sPropertyName, sValueHelpPropertyName);
	},
	/**
	 * Method to get semantic key title
	 *
	 * @function
	 * @name getSemanticKeyTitle
	 * @memberof sap.fe.macros.field.FieldHelper.js
	 * @param {string} sPropertyTextValue String containing the binding of text associated to the property
	 * @param {string} sPropertyValue String containing the binding of a property
	 * @param {string} sDataField String containing the name of a data field
	 * @param {object} oTextArrangement Object containing the text arrangement
	 * @param {string} sSemanticKeyStyle enum containing the style of the semantic key
	 * @param {object} oDraftRoot Draft root object
	 * @returns {string} - Binding that resolves to the title of the semantic key
	 */

	getSemanticKeyTitle: function (
		sPropertyTextValue: string,
		sPropertyValue: string,
		sDataField: string,
		oTextArrangement: any,
		sSemanticKeyStyle: string,
		oDraftRoot: any
	) {
		const sNewObject = ResourceModel.getText("T_NEW_OBJECT");
		const sUnnamedObject = ResourceModel.getText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO");
		let sNewObjectExpression, sUnnnamedObjectExpression;
		let sSemanticKeyTitleExpression;
		const addNewObjectUnNamedObjectExpression = function (sValue: string) {
			sNewObjectExpression =
				"($" +
				sValue +
				" === '' || $" +
				sValue +
				" === undefined || $" +
				sValue +
				" === null ? '" +
				sNewObject +
				"': $" +
				sValue +
				")";
			sUnnnamedObjectExpression =
				"($" +
				sValue +
				" === '' || $" +
				sValue +
				" === undefined || $" +
				sValue +
				" === null ? '" +
				sUnnamedObject +
				"': $" +
				sValue +
				")";
			return (
				"(!%{IsActiveEntity} ? !%{HasActiveEntity} ? " +
				sNewObjectExpression +
				" : " +
				sUnnnamedObjectExpression +
				" : " +
				sUnnnamedObjectExpression +
				")"
			);
		};
		const buildExpressionForSemantickKeyTitle = function (sValue: string, bIsExpressionBinding: boolean) {
			let sExpression;
			if (oDraftRoot) {
				//check if it is draft root so that we can add NewObject and UnnamedObject feature
				sExpression = addNewObjectUnNamedObjectExpression(sValue);
				return bIsExpressionBinding ? "{= " + sExpression + "}" : sExpression;
			} else {
				return bIsExpressionBinding ? sValue : "$" + sValue;
			}
		};

		if (sPropertyTextValue) {
			// check for text association
			if (oTextArrangement && sSemanticKeyStyle !== "ObjectIdentifier") {
				// check if text arrangement is present and table type is GridTable
				const sTextArrangement = oTextArrangement.$EnumMember;
				if (sTextArrangement === "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst") {
					// Eg: English (EN)
					sSemanticKeyTitleExpression = buildExpressionForSemantickKeyTitle(sPropertyTextValue, false);
					return (
						"{= " +
						sSemanticKeyTitleExpression +
						" +' (' + " +
						"($" +
						sPropertyValue +
						(sDataField ? " || ${" + sDataField + "}" : "") +
						") +')' }"
					);
				} else if (sTextArrangement === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
					// Eg: EN (English)
					sSemanticKeyTitleExpression = buildExpressionForSemantickKeyTitle(sPropertyTextValue, false);
					return (
						"{= ($" +
						sPropertyValue +
						(sDataField ? " || ${" + sDataField + "}" : "") +
						")" +
						" + ' (' + " +
						sSemanticKeyTitleExpression +
						" +')' }"
					);
				} else {
					// for a Grid table when text is available and text arrangement is TextOnly or TextSeperate or no text arrangement then we return Text
					return buildExpressionForSemantickKeyTitle(sPropertyTextValue, true);
				}
			} else {
				return buildExpressionForSemantickKeyTitle(sPropertyTextValue, true);
			}
		} else {
			// if there is no text association then we return the property value
			return buildExpressionForSemantickKeyTitle(sPropertyValue, true);
		}
	},

	getObjectIdentifierText: function (
		oTextAnnotation: any,
		oTextArrangementAnnotation: any,
		sPropertyValueBinding: any,
		sDataFieldName: any
	) {
		if (oTextAnnotation) {
			// There is a text annotation. In this case, the ObjectIdentifier shows:
			//  - the *text* as the ObjectIdentifier's title
			//  - the *value* as the ObjectIdentifier's text
			//
			// So if the TextArrangement is #TextOnly or #TextSeparate, do not set the ObjectIdentifier's text
			// property
			if (
				oTextArrangementAnnotation &&
				(oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" ||
					oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate" ||
					oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst")
			) {
				return undefined;
			} else {
				return sPropertyValueBinding || `{${sDataFieldName}}`;
			}
		}

		// no text annotation: the property value is part of the ObjectIdentifier's title already
		return undefined;
	},

	getSemanticObjectsList: function (propertyAnnotations: any) {
		// look for annotations SemanticObject with and without qualifier
		// returns : list of SemanticObjects
		const annotations = propertyAnnotations;
		const aSemanticObjects = [];
		for (const key in annotations.getObject()) {
			// var qualifier;
			if (
				key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject") > -1 &&
				key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectMapping") === -1 &&
				key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions") === -1
			) {
				let semanticObjectValue = annotations.getObject()[key];
				if (typeof semanticObjectValue === "object") {
					semanticObjectValue = AnnotationHelper.value(semanticObjectValue, { context: propertyAnnotations });
				}
				if (aSemanticObjects.indexOf(semanticObjectValue) === -1) {
					aSemanticObjects.push(semanticObjectValue);
				}
			}
		}
		const oSemanticObjectsModel = new JSONModel(aSemanticObjects);
		(oSemanticObjectsModel as any).$$valueAsPromise = true;
		return oSemanticObjectsModel.createBindingContext("/");
	},
	getSemanticObjectsQualifiers: function (propertyAnnotations: any) {
		// look for annotations SemanticObject, SemanticObjectUnavailableActions, SemanticObjectMapping
		// returns : list of qualifiers (array of objects with qualifiers : {qualifier, SemanticObject, SemanticObjectUnavailableActions, SemanticObjectMapping for this qualifier}
		const annotations = propertyAnnotations;
		let qualifiersAnnotations: any[] = [];
		const findObject = function (qualifier: any) {
			return qualifiersAnnotations.find(function (object: any) {
				return object.qualifier === qualifier;
			});
		};
		for (const key in annotations.getObject()) {
			// var qualifier;
			if (
				key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject#") > -1 ||
				key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectMapping#") > -1 ||
				key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions#") > -1
			) {
				const annotationContent = annotations.getObject()[key],
					annotation = key.split("#")[0],
					qualifier = key.split("#")[1];
				let qualifierObject = findObject(qualifier);

				if (!qualifierObject) {
					qualifierObject = {
						qualifier: qualifier
					};
					qualifierObject[annotation] = annotationContent;
					qualifiersAnnotations.push(qualifierObject);
				} else {
					qualifierObject[annotation] = annotationContent;
				}
			}
		}
		qualifiersAnnotations = qualifiersAnnotations.filter(function (oQualifier: any) {
			return !!oQualifier["@com.sap.vocabularies.Common.v1.SemanticObject"];
		});
		const oQualifiersModel = new JSONModel(qualifiersAnnotations);
		(oQualifiersModel as any).$$valueAsPromise = true;
		return oQualifiersModel.createBindingContext("/");
	},
	// returns array of semanticObjects including main and additional, with their mapping and unavailable Actions
	getSemanticObjectsWithAnnotations: function (propertyAnnotations: any) {
		// look for annotations SemanticObject, SemanticObjectUnavailableActions, SemanticObjectMapping
		let annotationContent;
		let listItem: any;
		// returns : list of qualifiers (array of objects with qualifiers : {qualifier, SemanticObject, SemanticObjectUnavailableActions, SemanticObjectMapping for this qualifier}
		const annotations = propertyAnnotations;
		let semanticObjectList: any[] = [];
		const findObject = function (qualifier: any) {
			return semanticObjectList.find(function (object: any) {
				return object.qualifier === qualifier;
			});
		};
		for (const key in annotations.getObject()) {
			// var qualifier;
			if (
				key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject") > -1 ||
				key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectMapping") > -1 ||
				key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions") > -1
			) {
				if (key.indexOf("#") > -1) {
					annotationContent = annotations.getObject()[key];
					const annotation = key.split("#")[0],
						qualifier = key.split("#")[1];
					listItem = findObject(qualifier);
					if (key === "@com.sap.vocabularies.Common.v1.SemanticObject" && typeof annotationContent === "object") {
						annotationContent = AnnotationHelper.value(annotationContent[0], { context: propertyAnnotations });
					}
					if (!listItem) {
						listItem = {
							qualifier: qualifier
						};
						listItem[annotation] = annotationContent;
						semanticObjectList.push(listItem);
					} else {
						listItem[annotation] = annotationContent;
					}
				} else {
					annotationContent = annotations.getObject()[key];
					let annotation: any;
					if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectMapping") > -1) {
						annotation = "@com.sap.vocabularies.Common.v1.SemanticObjectMapping";
					} else if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions") > -1) {
						annotation = "@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions";
					} else if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject") > -1) {
						annotation = "@com.sap.vocabularies.Common.v1.SemanticObject";
					}
					listItem = findObject("main");
					if (key === "@com.sap.vocabularies.Common.v1.SemanticObject" && typeof annotationContent === "object") {
						annotationContent = AnnotationHelper.value(annotationContent, { context: propertyAnnotations });
					}
					if (!listItem) {
						listItem = {
							qualifier: "main"
						};
						listItem[annotation] = annotationContent;
						semanticObjectList.push(listItem);
					} else {
						listItem[annotation] = annotationContent;
					}
				}
			}
		}
		// filter if no semanticObject was defined
		semanticObjectList = semanticObjectList.filter(function (oQualifier: any) {
			return !!oQualifier["@com.sap.vocabularies.Common.v1.SemanticObject"];
		});
		const oSemanticObjectsModel = new JSONModel(semanticObjectList);
		(oSemanticObjectsModel as any).$$valueAsPromise = true;
		return oSemanticObjectsModel.createBindingContext("/");
	},
	computeSemanticLinkModelContextChange: function (aSemanticObjects: any, oDataModelObjectPath: any) {
		if (FieldHelper.hasSemanticObjectsWithPath(aSemanticObjects)) {
			const sPathToProperty = FieldHelper.buildTargetPathFromDataModelObjectPath(oDataModelObjectPath);
			return `FieldRuntime.LinkModelContextChange($event, '${
				(oDataModelObjectPath.targetObject as Property).name
			}', '${sPathToProperty}')`;
		} else {
			return undefined;
		}
	},
	hasSemanticObjectsWithPath: function (aSemanticObjects: any) {
		let bSemanticObjectHasAPath = false;
		if (aSemanticObjects && aSemanticObjects.length) {
			for (let i = 0; i < aSemanticObjects.length; i++) {
				if (aSemanticObjects[i] && aSemanticObjects[i].value && aSemanticObjects[i].value.indexOf("{") === 0) {
					bSemanticObjectHasAPath = true;
					break;
				}
			}
		}
		return bSemanticObjectHasAPath;
	},
	isSemanticKeyHasFieldGroupColumn: function (isFieldGroupColumn: any) {
		return isFieldGroupColumn;
	},
	_checkCustomSemanticObjectHasAnnotations: function (_semanticObjectsWithAnnotations: any[] | undefined) {
		if (_semanticObjectsWithAnnotations && _semanticObjectsWithAnnotations.length == 0) {
			_semanticObjectsWithAnnotations = undefined;
		}
		return _semanticObjectsWithAnnotations;
	},
	_manageCustomSemanticObjects: function (
		customSemanticObject: string,
		semanticObjectsList: string[] | undefined,
		semanticObjectsWithAnnotations: any[] | undefined
	) {
		if (customSemanticObject) {
			// the custom semantic objects are either a single string/key to custom data or a stringified array
			if (!(customSemanticObject[0] === "[")) {
				// customSemanticObject = "semanticObject" | "{pathInModel}"
				if (semanticObjectsList && semanticObjectsList.indexOf(customSemanticObject) === -1) {
					semanticObjectsList.push(customSemanticObject);
				}
			} else {
				// customSemanticObject = '["semanticObject1","semanticObject2"]'
				JSON.parse(customSemanticObject).forEach(function (semanticObject: any) {
					if (semanticObjectsList && semanticObjectsList.indexOf(semanticObject) === -1) {
						semanticObjectsList.push(semanticObject);
					}
				});
			}
			semanticObjectsWithAnnotations = this._checkCustomSemanticObjectHasAnnotations(semanticObjectsWithAnnotations);
		}
		return {
			semanticObjectsList: semanticObjectsList,
			semanticObjectsWithAnnotations: semanticObjectsWithAnnotations
		};
	},
	// returns the list of parameters to pass to the Link delegates
	computeLinkParameters: function (
		delegateName: string,
		entityType: string,
		semanticObjectsList: string[] | undefined,
		semanticObjectsWithAnnotations: any[] | undefined,
		dataField: string,
		contact: string,
		mainSemanticObject: string,
		navigationPath: string,
		propertyPathLabel: string,
		customSemanticObject: string,
		hasQuickViewFacets: boolean | false
	) {
		const _CustomSemanticObjectsFound = this._manageCustomSemanticObjects(
			customSemanticObject,
			semanticObjectsList,
			semanticObjectsWithAnnotations
		);
		semanticObjectsList = _CustomSemanticObjectsFound.semanticObjectsList;
		semanticObjectsWithAnnotations = _CustomSemanticObjectsFound.semanticObjectsWithAnnotations;
		return Promise.resolve().then(function () {
			const semanticObjectMappings: any[] = [],
				semanticObjectUnavailableActions: any[] = [];
			const aResolvedMainSemanticObject = semanticObjectsWithAnnotations?.filter(function (annotation: any) {
				return annotation.qualifier === "main";
			});
			const sResolveMainSemanticObject =
				aResolvedMainSemanticObject && aResolvedMainSemanticObject[0]
					? aResolvedMainSemanticObject[0]["@com.sap.vocabularies.Common.v1.SemanticObject"]
					: undefined;

			if (semanticObjectsWithAnnotations) {
				semanticObjectsWithAnnotations.forEach(function (semObject: any) {
					let annotationContent = semObject["@com.sap.vocabularies.Common.v1.SemanticObject"];
					if (typeof annotationContent === "object") {
						annotationContent = compileExpression(pathInModel(annotationContent.$Path));
					}
					if (semObject["@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"]) {
						const unAvailableAction = {
							semanticObject: annotationContent,
							actions: semObject["@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"]
						};
						semanticObjectUnavailableActions.push(unAvailableAction);
					}
					if (semObject["@com.sap.vocabularies.Common.v1.SemanticObjectMapping"]) {
						const items: any[] = [];
						semObject["@com.sap.vocabularies.Common.v1.SemanticObjectMapping"].forEach(function (mappingItem: any) {
							items.push({
								key: mappingItem.LocalProperty.$PropertyPath,
								value: mappingItem.SemanticObjectProperty
							});
						});
						const mapping = {
							semanticObject: annotationContent,
							items: items
						};
						semanticObjectMappings.push(mapping);
					}
				});
				return JSON.stringify({
					name: delegateName,
					payload: {
						semanticObjects: semanticObjectsList,
						entityType: entityType,
						semanticObjectUnavailableActions: semanticObjectUnavailableActions,
						semanticObjectMappings: semanticObjectMappings,
						semanticPrimaryActions: [],
						mainSemanticObject: sResolveMainSemanticObject,
						propertyPathLabel: propertyPathLabel,
						dataField: dataField,
						contact: contact,
						navigationPath: navigationPath,
						hasQuickViewFacets: hasQuickViewFacets !== null ? hasQuickViewFacets : false
					}
				});
			} else {
				return JSON.stringify({
					name: delegateName,
					payload: {
						semanticObjects: semanticObjectsList,
						entityType: entityType,
						semanticObjectUnavailableActions: semanticObjectUnavailableActions,
						semanticObjectMappings: semanticObjectMappings,
						semanticPrimaryActions: [],
						mainSemanticObject: sResolveMainSemanticObject,
						propertyPathLabel: propertyPathLabel,
						dataField: dataField,
						contact: contact,
						navigationPath: navigationPath,
						hasQuickViewFacets: hasQuickViewFacets !== null ? hasQuickViewFacets : false
					}
				});
			}
		});
	},
	/*
	 * Method to compute the delegate with payload
	 * @function
	 * @param {object} delegateName - name of the delegate methode
	 * @param {boolean} retrieveTextFromValueList - added to the payload of the delegate methode
	 * @return {object} - returns the delegate with payload
	 */
	computeFieldBaseDelegate: function (delegateName: string, retrieveTextFromValueList: boolean) {
		if (retrieveTextFromValueList) {
			return JSON.stringify({
				name: delegateName,
				payload: {
					retrieveTextFromValueList: retrieveTextFromValueList
				}
			});
		}
		return `{name: '${delegateName}'}`;
	},
	_getPrimaryIntents: function (aSemanticObjectsList: any[]): Promise<any[]> {
		const aPromises: any[] = [];
		if (aSemanticObjectsList) {
			const oUshellContainer = sap.ushell && sap.ushell.Container;
			const oService = oUshellContainer && oUshellContainer.getService("CrossApplicationNavigation");
			aSemanticObjectsList.forEach(function (semObject) {
				if (typeof semObject === "string") {
					aPromises.push(oService.getPrimaryIntent(semObject, {}));
				}
			});
		}
		return Promise.all(aPromises)
			.then(function (aSemObjectPrimaryAction) {
				return aSemObjectPrimaryAction;
			})
			.catch(function (oError) {
				Log.error("Error fetching primary intents", oError);
				return [];
			});
	},
	_SemanticObjectsHasPrimaryAction: function (oSemantics: any, aSemanticObjectsPrimaryActions: any): boolean {
		const _fnIsSemanticObjectActionUnavailable = function (_oSemantics: any, _oPrimaryAction: any, _index: string) {
			for (const unavailableActionsIndex in _oSemantics.semanticObjectUnavailableActions[_index].actions) {
				if (
					_oPrimaryAction.intent
						.split("-")[1]
						.indexOf(_oSemantics.semanticObjectUnavailableActions[_index].actions[unavailableActionsIndex]) === 0
				) {
					return false;
				}
			}
			return true;
		};
		oSemantics.semanticPrimaryActions = aSemanticObjectsPrimaryActions;
		const oPrimaryAction =
			oSemantics.semanticObjects &&
			oSemantics.mainSemanticObject &&
			oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)];
		const sCurrentHash = CommonUtils.getHash();
		if (oSemantics.mainSemanticObject && oPrimaryAction !== null && oPrimaryAction.intent !== sCurrentHash) {
			for (const index in oSemantics.semanticObjectUnavailableActions) {
				if (oSemantics.mainSemanticObject.indexOf(oSemantics.semanticObjectUnavailableActions[index].semanticObject) === 0) {
					return _fnIsSemanticObjectActionUnavailable(oSemantics, oPrimaryAction, index);
				}
			}
			return true;
		} else {
			return false;
		}
	},
	checkPrimaryActions: function (oSemantics: any, bGetTitleLink: boolean) {
		return this._getPrimaryIntents(oSemantics && oSemantics.semanticObjects)
			.then((aSemanticObjectsPrimaryActions: any[]) => {
				return bGetTitleLink
					? {
							titleLink: aSemanticObjectsPrimaryActions,
							hasTitleLink: this._SemanticObjectsHasPrimaryAction(oSemantics, aSemanticObjectsPrimaryActions)
					  }
					: this._SemanticObjectsHasPrimaryAction(oSemantics, aSemanticObjectsPrimaryActions);
			})
			.catch(function (oError) {
				Log.error("Error in checkPrimaryActions", oError);
			});
	},
	_getTitleLinkWithParameters: function (_oSemanticObjectModel: any, _linkIntent: string) {
		if (_oSemanticObjectModel && _oSemanticObjectModel.titlelink) {
			return _oSemanticObjectModel.titlelink;
		} else {
			return _linkIntent;
		}
	},

	getPrimaryAction: function (oSemantics: any) {
		return oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)].intent
			? FieldHelper._getTitleLinkWithParameters(
					oSemantics,
					oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)].intent
			  )
			: oSemantics.primaryIntentAction;
	},
	/**
	 * Method to fetch the filter restrictions. Filter restrictions can be annotated on an entity set or a navigation property.
	 * Depending on the path to which the control is bound, we check for filter restrictions on the context path of the control,
	 * or on the navigation property (if there is a navigation).
	 * Eg. If the table is bound to '/EntitySet', for property path '/EntitySet/_Association/PropertyName', the filter restrictions
	 * on '/EntitySet' win over filter restrictions on '/EntitySet/_Association'.
	 * If the table is bound to '/EntitySet/_Association', the filter restrictions on '/EntitySet/_Association' win over filter
	 * retrictions on '/AssociationEntitySet'.
	 *
	 * @param iContext Context used during templating
	 * @param oProperty Property object in the metadata
	 * @param bUseSemanticDateRange Boolean Suggests if semantic date range should be used
	 * @param sSettings Stringified object of the property settings
	 * @param contextPath Path to which the parent control (the table or the filter bar) is bound
	 * @returns String containing comma-separated list of operators for filtering
	 */
	operators: function (iContext: any, oProperty: any, bUseSemanticDateRange: boolean, sSettings: string, contextPath: string) {
		if (!oProperty || !contextPath) {
			return undefined;
		}
		let operators: string | undefined;
		const oContext = iContext.getInterface(0).getModel(1).createBindingContext(iContext.getInterface(0).getPath(1));
		const sProperty = FieldHelper.propertyName(oProperty, { context: oContext });
		const oModel = oContext.getModel(),
			sPropertyPath = oContext.getPath(),
			sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
			propertyType = oProperty.$Type;

		if (propertyType === "Edm.Guid") {
			return CommonUtils.getOperatorsForGuidProperty();
		}

		// remove '/'
		contextPath = contextPath.slice(0, -1);
		const isTableBoundToNavigation: Boolean = contextPath.lastIndexOf("/") > 0;
		const isNavigationPath: Boolean =
			(isTableBoundToNavigation && contextPath !== sPropertyLocationPath) ||
			(!isTableBoundToNavigation && sPropertyLocationPath.lastIndexOf("/") > 0);
		const navigationPath: string =
			(isNavigationPath && sPropertyLocationPath.substr(sPropertyLocationPath.indexOf(contextPath) + contextPath.length + 1)) || "";
		const propertyPath: string = (isNavigationPath && navigationPath + "/" + sProperty) || sProperty;

		if (!isTableBoundToNavigation) {
			if (!isNavigationPath) {
				// /SalesOrderManage/ID
				operators = CommonUtils.getOperatorsForProperty(
					sProperty,
					sPropertyLocationPath,
					oContext,
					propertyType,
					bUseSemanticDateRange,
					sSettings
				);
			} else {
				// /SalesOrderManange/_Item/Material
				//let operators
				operators =
					CommonUtils.getOperatorsForProperty(
						propertyPath,
						contextPath,
						oContext,
						propertyType,
						bUseSemanticDateRange,
						sSettings
					) ||
					CommonUtils.getOperatorsForProperty(
						sProperty,
						sPropertyLocationPath,
						oContext,
						propertyType,
						bUseSemanticDateRange,
						sSettings
					);
			}
		} else if (!isNavigationPath) {
			// /SalesOrderManage/_Item/Material
			operators =
				CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oContext, propertyType, bUseSemanticDateRange, sSettings) ||
				CommonUtils.getOperatorsForProperty(
					sProperty,
					ModelHelper.getEntitySetPath(contextPath),
					oContext,
					propertyType,
					bUseSemanticDateRange,
					sSettings
				);
			return operators;
		} else {
			// /SalesOrderManage/_Item/_Association/PropertyName
			// This is currently not supported for tables
			operators =
				CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oContext, propertyType, bUseSemanticDateRange, sSettings) ||
				CommonUtils.getOperatorsForProperty(
					propertyPath,
					ModelHelper.getEntitySetPath(contextPath),
					oContext,
					propertyType,
					bUseSemanticDateRange,
					sSettings
				);
		}

		if (!operators && (propertyType === "Edm.Date" || propertyType === "Edm.DateTimeOffset")) {
			operators = CommonUtils.getOperatorsForDateProperty(propertyType);
		}

		return operators;
	},
	/**
	 * Return the property context for usage in QuickViewForm.
	 *
	 * @param oDataFieldContext Context of the data field or associated property
	 * @returns Binding context
	 */
	getPropertyContextForQuickViewForm: function (oDataFieldContext: any) {
		if (oDataFieldContext.getObject("Value") !== undefined) {
			// Create a binding context to the property from the data field.
			const oInterface = oDataFieldContext.getInterface(),
				oModel = oInterface.getModel();
			let sPath = oInterface.getPath();
			sPath = sPath + (sPath.endsWith("/") ? "Value" : "/Value");
			return oModel.createBindingContext(sPath);
		} else {
			// It is a property. Just return the context as it is.
			return oDataFieldContext;
		}
	},
	/**
	 * Return the binding context corresponding to the property path.
	 *
	 * @param oPropertyContext Context of the property
	 * @returns Binding context
	 */
	getPropertyPathForQuickViewForm: function (oPropertyContext: any) {
		if (oPropertyContext && oPropertyContext.getObject("$Path")) {
			const oInterface = oPropertyContext.getInterface(),
				oModel = oInterface.getModel();
			let sPath = oInterface.getPath();
			sPath = sPath + (sPath.endsWith("/") ? "$Path" : "/$Path");
			return oModel.createBindingContext(sPath);
		}

		return oPropertyContext;
	},
	/**
	 * Return the path of the DaFieldDefault (if any). Otherwise, the DataField path is returned.
	 *
	 * @param oDataFieldContext Context of the DataField
	 * @returns Object path
	 */
	getDataFieldDefault: function (oDataFieldContext: any) {
		const oDataFieldDefault = oDataFieldContext
			.getModel()
			.getObject(`${oDataFieldContext.getPath()}@com.sap.vocabularies.UI.v1.DataFieldDefault`);
		return oDataFieldDefault
			? `${oDataFieldContext.getPath()}@com.sap.vocabularies.UI.v1.DataFieldDefault`
			: oDataFieldContext.getPath();
	},
	/*
	 * Method to get visible expression for DataFieldActionButton
	 * @function
	 * @name isDataFieldActionButtonVisible
	 * @param {object} oThis - Current Object
	 * @param {object} oDataField - DataPoint's Value
	 * @param {boolean} bIsBound - DataPoint action bound
	 * @param {object} oActionContext - ActionContext Value
	 * @return {boolean} - returns boolean
	 */
	isDataFieldActionButtonVisible: function (oThis: any, oDataField: any, bIsBound: any, oActionContext: any) {
		return oDataField["@com.sap.vocabularies.UI.v1.Hidden"] !== true && (bIsBound !== true || oActionContext !== false);
	},
	/**
	 * Method to get press event for DataFieldActionButton.
	 *
	 * @function
	 * @name getPressEventForDataFieldActionButton
	 * @param oThis Current Object
	 * @param oDataField DataPoint's Value
	 * @returns The binding expression for the DataFieldActionButton press event
	 */
	getPressEventForDataFieldActionButton: function (oThis: any, oDataField: any) {
		let sInvocationGrouping = "Isolated";
		if (
			oDataField.InvocationGrouping &&
			oDataField.InvocationGrouping.$EnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet"
		) {
			sInvocationGrouping = "ChangeSet";
		}
		let bIsNavigable = oThis.navigateAfterAction;
		bIsNavigable = bIsNavigable === "false" ? false : true;

		const entities: Array<string> = oThis?.entitySet?.getPath().split("/");
		const entitySetName: string = entities[entities.length - 1];

		const oParams = {
			contexts: "${$source>/}.getBindingContext()",
			invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGrouping),
			model: "${$source>/}.getModel()",
			label: CommonHelper.addSingleQuotes(oDataField.Label, true),
			isNavigable: bIsNavigable,
			entitySetName: CommonHelper.addSingleQuotes(entitySetName)
		};

		return CommonHelper.generateFunction(
			".editFlow.invokeAction",
			CommonHelper.addSingleQuotes(oDataField.Action),
			CommonHelper.objectToString(oParams)
		);
	},

	isNumericDataType: function (sDataFieldType: any) {
		const _sDataFieldType = sDataFieldType;
		if (_sDataFieldType !== undefined) {
			const aNumericDataTypes = [
				"Edm.Int16",
				"Edm.Int32",
				"Edm.Int64",
				"Edm.Byte",
				"Edm.SByte",
				"Edm.Single",
				"Edm.Decimal",
				"Edm.Double"
			];
			return aNumericDataTypes.indexOf(_sDataFieldType) === -1 ? false : true;
		} else {
			return false;
		}
	},

	isDateOrTimeDataType: function (sPropertyType: any) {
		if (sPropertyType !== undefined) {
			const aDateTimeDataTypes = ["Edm.DateTimeOffset", "Edm.DateTime", "Edm.Date", "Edm.TimeOfDay", "Edm.Time"];
			return aDateTimeDataTypes.indexOf(sPropertyType) > -1;
		} else {
			return false;
		}
	},
	isDateTimeDataType: function (sPropertyType: any) {
		if (sPropertyType !== undefined) {
			const aDateDataTypes = ["Edm.DateTimeOffset", "Edm.DateTime"];
			return aDateDataTypes.indexOf(sPropertyType) > -1;
		} else {
			return false;
		}
	},
	isDateDataType: function (sPropertyType: any) {
		return sPropertyType === "Edm.Date";
	},
	isTimeDataType: function (sPropertyType: any) {
		if (sPropertyType !== undefined) {
			const aDateDataTypes = ["Edm.TimeOfDay", "Edm.Time"];
			return aDateDataTypes.indexOf(sPropertyType) > -1;
		} else {
			return false;
		}
	},

	/**
	 * Method to return the underlying property data type in case TextArrangement annotation of Text annotation 'TextOnly' exists.
	 *
	 * @param oAnnotations All the annotations of a property
	 * @param oModel An instance of OData v4 model
	 * @param sEntityPath The path to root Entity
	 * @param sType The property data type
	 * @returns The underlying property data type for TextOnly annotated property, otherwise the original data type.
	 * @private
	 */
	getUnderlyingPropertyDataType: function (oAnnotations: any, oModel: ODataMetaModel, sEntityPath: string, sType: string) {
		const sTextAnnotation = "@com.sap.vocabularies.Common.v1.Text",
			sTextArrangementAnnotation = "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement";
		if (
			!!oAnnotations &&
			!!oAnnotations[sTextArrangementAnnotation] &&
			oAnnotations[sTextArrangementAnnotation].$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" &&
			!!oAnnotations[sTextAnnotation] &&
			!!oAnnotations[sTextAnnotation].$Path
		) {
			return oModel.getObject(`${sEntityPath}/${oAnnotations[sTextAnnotation].$Path}/$Type`);
		}

		return sType;
	},

	getColumnAlignment: function (oDataField: any, oTable: any) {
		const sEntityPath = oTable.collection.sPath,
			oModel = oTable.collection.oModel;
		if (
			(oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
				oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") &&
			oDataField.Inline &&
			oDataField.IconUrl
		) {
			return "Center";
		}
		// Columns containing a Semantic Key must be Begin aligned
		const aSemanticKeys = oModel.getObject(`${sEntityPath}/@com.sap.vocabularies.Common.v1.SemanticKey`);
		if (oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataField") {
			const sPropertyPath = oDataField.Value.$Path;
			const bIsSemanticKey =
				aSemanticKeys &&
				!aSemanticKeys.every(function (oKey: any) {
					return oKey.$PropertyPath !== sPropertyPath;
				});
			if (bIsSemanticKey) {
				return "Begin";
			}
		}
		return FieldHelper.getDataFieldAlignment(oDataField, oModel, sEntityPath);
	},
	/**
	 * Get alignment based only on the property.
	 *
	 * @param sType The property's type
	 * @param oFormatOptions The field format options
	 * @param [oComputedEditMode] The computed Edit mode of the property is empty when directly called from the ColumnProperty fragment
	 * @returns The property alignment
	 */
	getPropertyAlignment: function (sType: string, oFormatOptions: any, oComputedEditMode?: BindingToolkitExpression<string>) {
		let sDefaultAlignment = "Begin" as any;
		const sTextAlignment = oFormatOptions ? oFormatOptions.textAlignMode : "";
		switch (sTextAlignment) {
			case "Form":
				if (this.isNumericDataType(sType)) {
					sDefaultAlignment = "Begin";
					if (oComputedEditMode) {
						sDefaultAlignment = getAlignmentExpression(oComputedEditMode, "Begin", "End");
					}
				}
				break;
			default:
				if (this.isNumericDataType(sType) || this.isDateOrTimeDataType(sType)) {
					sDefaultAlignment = "Right";
				}
				break;
		}
		return sDefaultAlignment;
	},

	getDataFieldAlignment: function (oDataField: any, oModel: any, sEntityPath: any, oFormatOptions?: any, oComputedEditMode?: any) {
		let sDataFieldPath,
			sDefaultAlignment = "Begin",
			sType,
			oAnnotations;

		if (oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
			sDataFieldPath = oDataField.Target.$AnnotationPath;
			if (
				oDataField.Target["$AnnotationPath"] &&
				oDataField.Target["$AnnotationPath"].indexOf("com.sap.vocabularies.UI.v1.FieldGroup") >= 0
			) {
				const oFieldGroup = oModel.getObject(`${sEntityPath}/${sDataFieldPath}`);

				for (let i = 0; i < oFieldGroup.Data.length; i++) {
					sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Data/${i.toString()}/Value/$Path/$Type`);
					oAnnotations = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Data/${i.toString()}/Value/$Path@`);
					sType = this.getUnderlyingPropertyDataType(oAnnotations, oModel, sEntityPath, sType);
					sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);

					if (sDefaultAlignment === "Begin") {
						break;
					}
				}
				return sDefaultAlignment;
			} else if (
				oDataField.Target["$AnnotationPath"] &&
				oDataField.Target["$AnnotationPath"].indexOf("com.sap.vocabularies.UI.v1.DataPoint") >= 0 &&
				oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Visualization/$EnumMember`) ===
					"com.sap.vocabularies.UI.v1.VisualizationType/Rating"
			) {
				return sDefaultAlignment;
			} else {
				sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/$Type`);
				if (sType === "com.sap.vocabularies.UI.v1.DataPointType") {
					sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Value/$Path/$Type`);
					oAnnotations = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/Value/$Path@`);
					sType = this.getUnderlyingPropertyDataType(oAnnotations, oModel, sEntityPath, sType);
				}
				sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
			}
		} else {
			sDataFieldPath = oDataField.Value.$Path;
			sType = oModel.getObject(`${sEntityPath}/${sDataFieldPath}/$Type`);
			oAnnotations = oModel.getObject(`${sEntityPath}/${sDataFieldPath}@`);
			sType = this.getUnderlyingPropertyDataType(oAnnotations, oModel, sEntityPath, sType);
			if (!(oModel.getObject(`${sEntityPath}/`)["$Key"].indexOf(sDataFieldPath) === 0)) {
				sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
			}
		}
		return sDefaultAlignment;
	},
	getTypeAlignment: function (
		oContext: any,
		oDataField: any,
		oFormatOptions: any,
		sEntityPath: string,
		oComputedEditMode: any,
		oProperty: any
	) {
		const oInterface = oContext.getInterface(0);
		const oModel = oInterface.getModel();

		if (sEntityPath === "/undefined" && oProperty && oProperty.$target) {
			sEntityPath = `/${oProperty.$target.fullyQualifiedName.split("/")[0]}`;
		}
		return FieldHelper.getDataFieldAlignment(oDataField, oModel, sEntityPath, oFormatOptions, oComputedEditMode);
	},

	/**
	 * Method to get enabled expression for DataFieldActionButton.
	 *
	 * @function
	 * @name isDataFieldActionButtonEnabled
	 * @param oDataField DataPoint's Value
	 * @param bIsBound DataPoint action bound
	 * @param oActionContext ActionContext Value
	 * @param sActionContextFormat Formatted value of ActionContext
	 * @returns A boolean or string expression for enabled property
	 */
	isDataFieldActionButtonEnabled: function (oDataField: any, bIsBound: boolean, oActionContext: any, sActionContextFormat: string) {
		if (bIsBound !== true) {
			return "true";
		}
		return (oActionContext === null ? "{= !${#" + oDataField.Action + "} ? false : true }" : oActionContext)
			? sActionContextFormat
			: "true";
	},
	/**
	 * Method to get labelText for DataField.
	 *
	 * @function
	 * @name getLabelTextForDataField
	 * @param oEntitySetModel The EntitySet model Object
	 * @param oPropertyPath The Property path's object
	 * @param sPropertyPathBuildExpression The evaluated value of expression @@FIELD.buildExpressionForTextValue
	 * @param sPropertyValue Property value from model
	 * @param sUiName The sapui.name annotation value
	 * @param sSemanticKeyStyle
	 * @returns The binding expression for datafield label.
	 */
	getLabelTextForDataField: function (
		oEntitySetModel: any,
		oPropertyPath: any,
		sPropertyPathBuildExpression: string,
		sPropertyValue: string,
		sUiName: string,
		sSemanticKeyStyle: string
	) {
		const oDraftRoot = oEntitySetModel["@com.sap.vocabularies.Common.v1.DraftRoot"];
		return FieldHelper.getSemanticKeyTitle(
			oPropertyPath["@com.sap.vocabularies.Common.v1.Text"] && sPropertyPathBuildExpression,
			sPropertyValue,
			sUiName,
			oPropertyPath["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"],
			sSemanticKeyStyle,
			oDraftRoot
		);
	},

	/**
	 * Method to retrieve text from value list for DataField.
	 *
	 * @function
	 * @name retrieveTextFromValueList
	 * @param oEntitySetModel The EntitySet model Object
	 * @param sPropertyPath The property path's name
	 * @param oFormatOptions The evaluated informations for the format option
	 * @returns The binding expression for datafield text.
	 */
	retrieveTextFromValueList: function (oEntitySetModel: any, sPropertyPath: string, oFormatOptions: any) {
		const sPropertyFullPath = `${oEntitySetModel.sPath}/${sPropertyPath}`;
		const sDisplayFormat = oFormatOptions.displayMode;
		CommonHelper.setMetaModel(oEntitySetModel.getModel());
		return "{= FieldRuntime.retrieveTextFromValueList(%{" + sPropertyPath + "},'" + sPropertyFullPath + "','" + sDisplayFormat + "')}";
	},

	/**
	 * Method to compute the label for a DataField.
	 * If the DataField's label is an empty string, it's not rendered even if a fallback exists.
	 *
	 * @function
	 * @name computeLabelText
	 * @param {object} oDataField The DataField being processed
	 * @param {object} oInterface The interface for context instance
	 * @returns {string} The computed text for the DataField label.
	 */

	computeLabelText: function (oDataField: any, oInterface: any) {
		const oModel = oInterface.context.getModel();
		let sContextPath = oInterface.context.getPath();
		if (sContextPath.endsWith("/")) {
			sContextPath = sContextPath.slice(0, sContextPath.lastIndexOf("/"));
		}
		const sDataFieldLabel = oModel.getObject(`${sContextPath}/Label`);
		//We do not show an additional label text for a button:
		if (
			oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
			oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"
		) {
			return undefined;
		}
		if (sDataFieldLabel) {
			return sDataFieldLabel;
		} else if (sDataFieldLabel === "") {
			return "";
		}
		let sDataFieldTargetTitle;
		if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
			if (
				oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 ||
				oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1
			) {
				sDataFieldTargetTitle = oModel.getObject(`${sContextPath}/Target/$AnnotationPath@/Title`);
			}
			if (oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.Communication.v1.Contact") > -1) {
				sDataFieldTargetTitle = oModel.getObject(
					`${sContextPath}/Target/$AnnotationPath@/fn/$Path@com.sap.vocabularies.Common.v1.Label`
				);
			}
		}
		if (sDataFieldTargetTitle) {
			return sDataFieldTargetTitle;
		}
		let sDataFieldTargetLabel;
		if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
			sDataFieldTargetLabel = oModel.getObject(`${sContextPath}/Target/$AnnotationPath@/Label`);
		}
		if (sDataFieldTargetLabel) {
			return sDataFieldTargetLabel;
		}

		const sDataFieldValueLabel = oModel.getObject(`${sContextPath}/Value/$Path@com.sap.vocabularies.Common.v1.Label`);
		if (sDataFieldValueLabel) {
			return sDataFieldValueLabel;
		}

		let sDataFieldTargetValueLabel;
		if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
			sDataFieldTargetValueLabel = oModel.getObject(
				`${sContextPath}/Target/$AnnotationPath/Value/$Path@com.sap.vocabularies.Common.v1.Label`
			);
		}
		if (sDataFieldTargetValueLabel) {
			return sDataFieldTargetValueLabel;
		}
		return "";
	},
	/**
	 * Method to align the data fields with their label.
	 *
	 * @function
	 * @name buildExpressionForAlignItems
	 * @param sVisualization
	 * @returns Expression binding for alignItems property
	 */
	buildExpressionForAlignItems: function (sVisualization: string) {
		const fieldVisualizationBindingExpression = constant(sVisualization);
		const progressVisualizationBindingExpression = constant("com.sap.vocabularies.UI.v1.VisualizationType/Progress");
		const ratingVisualizationBindingExpression = constant("com.sap.vocabularies.UI.v1.VisualizationType/Rating");
		return compileExpression(
			ifElse(
				or(
					equal(fieldVisualizationBindingExpression, progressVisualizationBindingExpression),
					equal(fieldVisualizationBindingExpression, ratingVisualizationBindingExpression)
				),
				constant("Center"),
				ifElse(UI.IsEditable, constant("Center"), constant("Stretch"))
			)
		);
	},

	/**
	 * Method to check ValueListReferences, ValueListMapping and ValueList inside ActionParameters for FieldHelp.
	 *
	 * @function
	 * @name hasValueHelp
	 * @param oPropertyAnnotations Action parameter object
	 * @returns `true` if there is a ValueList* annotation defined
	 */
	hasValueHelpAnnotation: function (oPropertyAnnotations: any) {
		if (oPropertyAnnotations) {
			return (
				oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListReferences"] ||
				oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListMapping"] ||
				oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"]
			);
		}
	},
	/**
	 * Method to get display property for ActionParameter dialog.
	 *
	 * 	@function
	 * @name getAPDialogDisplayFormat
	 * @param oProperty The action parameter instance
	 * @param oInterface The interface for the context instance
	 * @returns The display format  for an action parameter Field
	 */
	getAPDialogDisplayFormat: function (oProperty: any, oInterface: any) {
		let oAnnotation;
		const oModel = oInterface.context.getModel();
		const sContextPath = oInterface.context.getPath();
		const sPropertyName = oProperty.$Name || oInterface.context.getProperty(`${sContextPath}@sapui.name`);
		const oActionParameterAnnotations = oModel.getObject(`${sContextPath}@`);
		const oValueHelpAnnotation =
			oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueList"] ||
			oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueListMapping"] ||
			oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueListReferences"];
		const getValueListPropertyName = function (oValueList: any) {
			const oValueListParameter = oValueList.Parameters.find(function (oParameter: any) {
				return oParameter.LocalDataProperty && oParameter.LocalDataProperty.$PropertyPath === sPropertyName;
			});
			return oValueListParameter && oValueListParameter.ValueListProperty;
		};
		let sValueListPropertyName;
		if (
			oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.TextArrangement"] ||
			oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]
		) {
			return CommonUtils.computeDisplayMode(oActionParameterAnnotations, undefined);
		} else if (oValueHelpAnnotation) {
			if (oValueHelpAnnotation.CollectionPath) {
				// get the name of the corresponding property in value list collection
				sValueListPropertyName = getValueListPropertyName(oValueHelpAnnotation);
				if (!sValueListPropertyName) {
					return "Value";
				}
				// get text for this property
				oAnnotation = oModel.getObject(`/${oValueHelpAnnotation.CollectionPath}/${sValueListPropertyName}@`);
				return oAnnotation && oAnnotation["@com.sap.vocabularies.Common.v1.Text"]
					? CommonUtils.computeDisplayMode(oAnnotation, undefined)
					: "Value";
			} else {
				return oModel.requestValueListInfo(sContextPath, true).then(function (oValueListInfo: any) {
					// get the name of the corresponding property in value list collection
					sValueListPropertyName = getValueListPropertyName(oValueListInfo[""]);
					if (!sValueListPropertyName) {
						return "Value";
					}
					// get text for this property
					oAnnotation = oValueListInfo[""].$model
						.getMetaModel()
						.getObject(`/${oValueListInfo[""]["CollectionPath"]}/${sValueListPropertyName}@`);
					return oAnnotation && oAnnotation["@com.sap.vocabularies.Common.v1.Text"]
						? CommonUtils.computeDisplayMode(oAnnotation, undefined)
						: "Value";
				});
			}
		} else {
			return "Value";
		}
	},
	/**
	 * Method to get display property for ActionParameter dialog FieldHelp.
	 *
	 * @function
	 * @name getActionParameterDialogFieldHelp
	 * @param oActionParameter Action parameter object
	 * @param sSapUIName Action sapui name
	 * @param sParamName The parameter name
	 * @returns The ID of the fieldHelp used by this action parameter
	 */
	getActionParameterDialogFieldHelp: function (oActionParameter: object, sSapUIName: string, sParamName: string) {
		return this.hasValueHelpAnnotation(oActionParameter) ? generate([sSapUIName, sParamName]) : undefined;
	},
	/**
	 * Method to get display property for ActionParameter dialog delegate.
	 *
	 * @function
	 * @name getFieldValueHelpDelegate
	 * @param bIsBound Action is bound
	 * @param sETypePath The EntityType Path
	 * @param sSapUIName The name of the Action
	 * @param sParamName The name of the ActionParameter
	 * @returns The delegate configuration object as a stirng
	 */
	getFieldValueHelpDelegate: function (bIsBound: boolean, sETypePath: string, sSapUIName: string, sParamName: string) {
		return CommonHelper.objectToString({
			name: CommonHelper.addSingleQuotes("sap/fe/macros/field/FieldValueHelpDelegate"),
			payload: {
				propertyPath: CommonHelper.addSingleQuotes(
					ValueListHelper.getPropertyPath({
						UnboundAction: !bIsBound,
						EntityTypePath: sETypePath,
						Action: sSapUIName,
						Property: sParamName
					})
				)
			}
		});
	},
	/**
	 * Method to get the delegate configuration for ActionParameter dialog.
	 *
	 * @function
	 * @name getValueHelpDelegate
	 * @param isBound Action is bound
	 * @param entityTypePath The EntityType Path
	 * @param sapUIName The name of the Action
	 * @param paramName The name of the ActionParameter
	 * @returns The delegate configuration object as a string
	 */
	getValueHelpDelegate: function (isBound: boolean, entityTypePath: string, sapUIName: string, paramName: string) {
		const delegateConfiguration: { name: string; payload: ValueHelpPayload } = {
			name: CommonHelper.addSingleQuotes("sap/fe/macros/valuehelp/ValueHelpDelegate"),
			payload: {
				propertyPath: CommonHelper.addSingleQuotes(
					ValueListHelper.getPropertyPath({
						UnboundAction: !isBound,
						EntityTypePath: entityTypePath,
						Action: sapUIName,
						Property: paramName
					})
				),
				qualifiers: {},
				valueHelpQualifier: CommonHelper.addSingleQuotes(""),
				isActionParameterDialog: true
			}
		};
		return CommonHelper.objectToString(delegateConfiguration);
	},
	/**
	 * Method to get the delegate configuration for NonComputedVisibleKeyField dialog.
	 *
	 * @function
	 * @name getValueHelpDelegateForNonComputedVisibleKeyField
	 * @param propertyPath The current property path
	 * @returns The delegate configuration object as a string
	 */
	getValueHelpDelegateForNonComputedVisibleKeyField: function (propertyPath: string) {
		const delegateConfiguration: { name: string; payload: ValueHelpPayload } = {
			name: CommonHelper.addSingleQuotes("sap/fe/macros/valuehelp/ValueHelpDelegate"),
			payload: {
				propertyPath: CommonHelper.addSingleQuotes(propertyPath),
				qualifiers: {},
				valueHelpQualifier: CommonHelper.addSingleQuotes("")
			}
		};
		return CommonHelper.objectToString(delegateConfiguration);
	},

	/**
	 * Method to fetch entity from a path containing multiple associations.
	 *
	 * @function
	 * @name _getEntitySetFromMultiLevel
	 * @param oContext The context whose path is to be checked
	 * @param sPath The path from which entity has to be fetched
	 * @param sSourceEntity The entity path in which nav entity exists
	 * @param iStart The start index : beginning parts of the path to be ignored
	 * @param iDiff The diff index : end parts of the path to be ignored
	 * @returns The path of the entity set
	 */
	_getEntitySetFromMultiLevel: function (oContext: Context, sPath: string, sSourceEntity: string, iStart: any, iDiff: any) {
		let aNavParts = sPath.split("/").filter(Boolean);
		aNavParts = aNavParts.filter(function (sPart: string) {
			return sPart !== "$NavigationPropertyBinding";
		});
		if (aNavParts.length > 0) {
			for (let i = iStart; i < aNavParts.length - iDiff; i++) {
				sSourceEntity = `/${oContext.getObject(`${sSourceEntity}/$NavigationPropertyBinding/${aNavParts[i]}`)}`;
			}
		}
		return sSourceEntity;
	},
	/**
	 * Method to find the entity of the property.
	 *
	 * @function
	 * @name getPropertyCollection
	 * @param oProperty The context from which datafield's path needs to be extracted.
	 * @param oContextObject The Metadata Context(Not passed when called with template:with)
	 * @returns The entity set path of the property
	 */
	getPropertyCollection: function (oProperty: object, oContextObject: any) {
		const oContext = (oContextObject && oContextObject.context) || oProperty;
		const sPath = oContext.getPath();
		const aMainEntityParts = sPath.split("/").filter(Boolean);
		const sMainEntity = aMainEntityParts[0];
		const sPropertyPath = oContext.getObject("$Path");
		let sFieldSourceEntity = `/${sMainEntity}`;
		// checking against prefix of annotations, ie. @com.sap.vocabularies.
		// as annotation path can be of a line item, field group or facet
		if (sPath.indexOf("/@com.sap.vocabularies.") > -1) {
			const iAnnoIndex = sPath.indexOf("/@com.sap.vocabularies.");
			const sInnerPath = sPath.substring(0, iAnnoIndex);
			// the facet or line item's entity could be a navigation entity
			sFieldSourceEntity = FieldHelper._getEntitySetFromMultiLevel(oContext, sInnerPath, sFieldSourceEntity, 1, 0);
		}
		if (sPropertyPath && sPropertyPath.indexOf("/") > -1) {
			// the field within facet or line item could be from a navigation entity
			sFieldSourceEntity = FieldHelper._getEntitySetFromMultiLevel(oContext, sPropertyPath, sFieldSourceEntity, 0, 1);
		}
		return sFieldSourceEntity;
	},
	/**
	 * Method used in a template with to retrieve the currency or the unit property inside a templating variable.
	 *
	 * @param oPropertyAnnotations
	 * @returns The annotationPath to be dealt with by template:with
	 */
	getUnitOrCurrency: function (oPropertyAnnotations: any) {
		const oPropertyAnnotationsObject = oPropertyAnnotations.getObject();
		let sAnnotationPath = oPropertyAnnotations.sPath;
		if (oPropertyAnnotationsObject["@Org.OData.Measures.V1.ISOCurrency"]) {
			sAnnotationPath = `${sAnnotationPath}Org.OData.Measures.V1.ISOCurrency`;
		} else {
			sAnnotationPath = `${sAnnotationPath}Org.OData.Measures.V1.Unit`;
		}

		return sAnnotationPath;
	},
	hasStaticUnitOrCurrency: function (oPropertyAnnotations: any) {
		return oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"]
			? !oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"].$Path
			: !oPropertyAnnotations["@Org.OData.Measures.V1.Unit"].$Path;
	},
	getStaticUnitOrCurrency: function (oPropertyAnnotations: any, oFormatOptions: any) {
		if (oFormatOptions && oFormatOptions.measureDisplayMode !== "Hidden") {
			const unit = oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"] || oPropertyAnnotations["@Org.OData.Measures.V1.Unit"];

			const dateFormat = DateFormat.getDateInstance() as any;
			const localeData = dateFormat.oLocaleData.mData;

			if (
				localeData &&
				localeData.units &&
				localeData.units.short &&
				localeData.units.short[unit] &&
				localeData.units.short[unit].displayName
			) {
				return localeData.units.short[unit].displayName;
			}

			return unit;
		}
	},
	getEmptyIndicatorTrigger: function (bActive: any, sBinding: any, sFullTextBinding: any) {
		if (sFullTextBinding) {
			return bActive ? sFullTextBinding : "inactive";
		}
		return bActive ? sBinding : "inactive";
	},
	/**
	 * When the value displayed is in text arrangement TextOnly we also want to retrieve the Text value for tables even if we don't show it.
	 * This method will return the value of the original data field.
	 *
	 * @param oThis The current object
	 * @param oDataFieldTextArrangement DataField using text arrangement annotation
	 * @param oDataField DataField containing the value using text arrangement annotation
	 * @returns The binding to the value
	 */
	getBindingInfoForTextArrangement: function (oThis: object, oDataFieldTextArrangement: any, oDataField: any) {
		if (
			oDataFieldTextArrangement &&
			oDataFieldTextArrangement.$EnumMember &&
			oDataFieldTextArrangement.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" &&
			oDataField
		) {
			return `{${oDataField.Value.$Path}}`;
		}
	},

	semanticKeyFormat: function (vRaw: any, oInterface: any) {
		// The Empty argument ensures that "groupingEnabled" is added to "formatOptions"
		oInterface.arguments = [{}, { groupingEnabled: false }];
		return AnnotationHelper.format(vRaw, oInterface);
	},
	getIsMediaContentTypeNullExpr: function (sPropertyPath: any, sOperator: any) {
		sOperator = sOperator || "===";
		return "{= %{" + sPropertyPath + "@odata.mediaContentType} " + sOperator + " null }";
	},
	getPathForIconSource: function (sPropertyPath: any) {
		return "{= FIELDRUNTIME.getIconForMimeType(%{" + sPropertyPath + "@odata.mediaContentType})}";
	},
	getFilenameExpr: function (sFilename: any, sNoFilenameText: any) {
		if (sFilename) {
			if (sFilename.indexOf("{") === 0) {
				// filename is referenced via path, i.e. @Core.ContentDisposition.Filename : path
				return "{= $" + sFilename + " ? $" + sFilename + " : $" + sNoFilenameText + "}";
			}
			// static filename, i.e. @Core.ContentDisposition.Filename : 'someStaticName'
			return sFilename;
		}
		// no @Core.ContentDisposition.Filename
		return sNoFilenameText;
	},

	calculateMBfromByte: function (iByte: any) {
		return iByte ? (iByte / (1024 * 1024)).toFixed(6) : undefined;
	},
	getDownloadUrl: function (propertyPath: string) {
		return propertyPath + "{= ${internal>/stickySessionToken} ? ('?SAP-ContextId=' + ${internal>/stickySessionToken}) : '' }";
	},
	getMarginClass: function (compactSemanticKey: string | boolean) {
		return compactSemanticKey === "true" || compactSemanticKey === true ? "sapMTableContentMargin" : undefined;
	},
	getRequired: function (immutableKey: any, target: any, requiredProperties: any) {
		let targetRequiredExpression: any = constant(false);
		if (target !== null) {
			targetRequiredExpression = isRequiredExpression(target?.targetObject);
		}
		return compileExpression(or(targetRequiredExpression, requiredProperties.indexOf(immutableKey) > -1));
	},

	/**
	 * The method checks if the field is already part of a form.
	 *
	 * @param dataFieldCollection The list of the fields of the form
	 * @param dataField The data field which needs to be checked in the form
	 * @returns `true` if the field is already part of the form, `false` otherwise
	 */
	isFieldPartOfForm: function (dataFieldCollection: FormElement[], dataField: DataFieldAbstractTypes) {
		//generating key for the received data field
		const connectedDataFieldKey = KeyHelper.generateKeyFromDataField(dataField);
		// trying to find the generated key in already existing form elements
		const isFieldFound = dataFieldCollection.find((field) => {
			return field.key === connectedDataFieldKey;
		});
		return isFieldFound ? true : false;
	}
};
(FieldHelper.buildExpressionForTextValue as any).requiresIContext = true;
(FieldHelper.getFieldGroupIds as any).requiresIContext = true;
(FieldHelper.fieldControl as any).requiresIContext = true;
(FieldHelper.getTypeAlignment as any).requiresIContext = true;
(FieldHelper.getPropertyCollection as any).requiresIContext = true;
(FieldHelper.getAPDialogDisplayFormat as any).requiresIContext = true;
(FieldHelper.operators as any).requiresIContext = true;
(FieldHelper.semanticKeyFormat as any).requiresIContext = true;
(FieldHelper.computeLabelText as any).requiresIContext = true;
(FieldHelper.getFieldHelpPropertyForFilterField as any).requiresIContext = true;
(FieldHelper.retrieveTextFromValueList as any).requiresIContext = true;
(FieldHelper.getActionParameterVisibility as any).requiresIContext = true;
(FieldHelper.computeLinkParameters as any).requiresIContext = true;

export default FieldHelper;
