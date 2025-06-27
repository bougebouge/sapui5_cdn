import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import type { AnnotationValueListParameter, ValueHelpPayload } from "sap/fe/macros/internal/valuehelp/ValueListHelperNew";
import Field from "sap/ui/mdc/Field";
import MDCFieldBaseDelegate from "sap/ui/mdc/field/FieldBaseDelegate";
import FieldHelpBase from "sap/ui/mdc/field/FieldHelpBase";
import FieldBaseDelegate from "sap/ui/mdc/odata/v4/FieldBaseDelegate";
import Filter from "sap/ui/model/Filter";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";

type ValueList = {
	CollectionPath: string;
	Parameters: [AnnotationValueListParameter];
	$model: ODataModel;
};

/**
 * Determine all parameters in a value help that use a specific property.
 *
 * @param oValueList Value help that is used
 * @param sPropertyName Name of the property
 * @returns List of all found parameters
 */
function _getValueListParameter(oValueList: ValueList, sPropertyName: object) {
	//determine path to value list property
	return oValueList.Parameters.filter(function (entry: any) {
		if (entry.LocalDataProperty) {
			return entry.LocalDataProperty.$PropertyPath === sPropertyName;
		} else {
			return false;
		}
	});
}
/**
 * Build filters for each in-parameter.
 *
 * @param oValueList Value help that is used
 * @param sPropertyName Name of the property
 * @param sValueHelpProperty Name of the value help property
 * @param vKey Value of the property
 * @param vhPayload Payload of the value help
 * @returns List of filters
 */
function _getFilter(oValueList: ValueList, sPropertyName: string, sValueHelpProperty: string, vKey: string, vhPayload: ValueHelpPayload) {
	const aFilters = [];
	const parameters = oValueList.Parameters.filter(function (parameter: any) {
		return parameter.$Type.indexOf("In") > 48 ||
		(parameter.LocalDataProperty?.$PropertyPath === sPropertyName && parameter.ValueListProperty === sValueHelpProperty);
	});
	for (const parameter of parameters) {
		if (parameter.LocalDataProperty.$PropertyPath === sPropertyName) {
			aFilters.push(new Filter({ path: sValueHelpProperty, operator: "EQ", value1: vKey }));
		} else if (parameter.$Type.indexOf("In") > 48 && vhPayload?.isActionParameterDialog) {
			const apdFieldPath = `APD_::${parameter.LocalDataProperty.$PropertyPath}`;
			const apdField = sap.ui.getCore().byId(apdFieldPath) as Field;
			const apdFieldValue = apdField?.getValue();
			if (apdFieldValue != null) {
				aFilters.push(new Filter({ path: parameter.ValueListProperty, operator: "EQ", value1: apdFieldValue }));
			}
		}
	}
	return aFilters;
}

export default Object.assign({}, FieldBaseDelegate, {
	getItemForValue: function (oPayload: object, oFieldHelp: FieldHelpBase, oConfig: any) {
		//BCP: 2270162887 . The MDC field should not try to get the item when the field is emptied
		if (oConfig.value !== "") {
			return MDCFieldBaseDelegate.getItemForValue(oPayload, oFieldHelp, oConfig);
		}
	},
	getDescription: function (oPayload: any, oFieldHelp: any, vKey: string) {
		//JIRA: FIORITECHP1-22022 . The MDC field should not  tries to determine description with the initial GET of the data.
		// it should rely on the data we already received from the backend
		// But The getDescription function is also called in the FilterField case if a variant is loaded.
		// As the description text could be language dependent it is not stored in the variant, so it needs to be read on rendering.

		if (oPayload?.retrieveTextFromValueList || oPayload?.isFilterField) {
			const oODataModel = oFieldHelp.getModel();
			const oMetaModel = oODataModel ? oODataModel.getMetaModel() : CommonUtils.getAppComponent(oFieldHelp).getModel().getMetaModel();
			const vhPayload = oFieldHelp?.getPayload();
			const sPropertyPath = vhPayload?.propertyPath;
			let sTextProperty: string;
			return oMetaModel
				.requestValueListInfo(sPropertyPath, true, oFieldHelp.getBindingContext())
				.then(function (mValueListInfo: any) {
					const sPropertyName = oMetaModel.getObject(`${sPropertyPath}@sapui.name`);
					// take the first value list annotation - alternatively take the one without qualifier or the first one
					const oValueList = mValueListInfo[Object.keys(mValueListInfo)[0]];
					let sValueHelpProperty;
					const aValueHelpParameters = _getValueListParameter(oValueList, sPropertyName);
					if (aValueHelpParameters && aValueHelpParameters[0]) {
						sValueHelpProperty = aValueHelpParameters[0].ValueListProperty;
					} else {
						return Promise.reject(`Inconsistent value help annotation for ${sPropertyName}`);
					}
					// get text annotation for this value list property
					const oModel = oValueList.$model;
					const oTextAnnotation = oModel
						.getMetaModel()
						.getObject(`/${oValueList.CollectionPath}/${sValueHelpProperty}@com.sap.vocabularies.Common.v1.Text`);
					if (oTextAnnotation && oTextAnnotation.$Path) {
						sTextProperty = oTextAnnotation.$Path;
						/* Build the filter for each in-parameter */
						const aFilters = _getFilter(oValueList, sPropertyName, sValueHelpProperty, vKey, vhPayload);
						const oListBinding = oModel.bindList(`/${oValueList.CollectionPath}`, undefined, undefined, aFilters, {
							"$select": sTextProperty
						});
						return oListBinding.requestContexts(0, 2);
					} else {
						return Promise.reject(`Text Annotation for ${sValueHelpProperty}is not defined`);
					}
				})
				.then(function (aContexts: any) {
					// return aContexts && aContexts[0] ? aContexts[0].getObject()[sTextProperty] : "";
					return aContexts?.[0]?.getObject(sTextProperty);
				})
				.catch(function (e: any) {
					const sMsg =
						e.status && e.status === 404
							? `Metadata not found (${e.status}) for value help of property ${sPropertyPath}`
							: e.message;
					Log.error(sMsg);
				});
		}
	}
});
