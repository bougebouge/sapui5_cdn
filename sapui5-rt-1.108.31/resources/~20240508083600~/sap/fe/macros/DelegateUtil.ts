import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import { ColumnExportSettings, configType, VisualSettings } from "sap/fe/core/converters/controls/Common/Table";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import type PageController from "sap/fe/core/PageController";
import { DisplayMode } from "sap/fe/core/templating/DisplayModeFormatter";
import { getRelativePropertyPath } from "sap/fe/core/templating/PropertyFormatters";
import FieldHelper from "sap/fe/macros/field/FieldHelper";
import { generateID } from "sap/fe/macros/internal/valuehelp/ValueHelpTemplating";
import type Control from "sap/ui/core/Control";
import type ResourceModel from "sap/ui/model/resource/ResourceModel";

const NS_MACRODATA = "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1";

export type PropertyInfo = {
	additionalLabels?: string[];
	caseSensitive?: boolean;
	description?: string;
	descriptionProperty?: string;
	exportSettings?: ColumnExportSettings | null;
	filterable?: boolean;
	group?: string;
	groupable?: boolean;
	groupLabel?: string;
	key?: boolean;
	label?: string;
	maxConditions?: number;
	metadataPath: string;
	mode?: DisplayMode;
	name: string;
	path?: string;
	propertyInfos?: string[];
	relativePath?: string;
	sortable?: boolean;
	sortDirection?: string;
	text?: string;
	tooltip?: string;
	typeConfig: configType;
	unit?: string;
	valueProperty?: string;
	visible: boolean;
	visualSettings?: VisualSettings;
	exportDataPointTargetValue?: string;
	isParameter?: boolean;
};

export const mDefaultTypeForEdmType = {
	"Edm.Boolean": {
		modelType: "Bool"
	},
	"Edm.Byte": {
		modelType: "Int"
	},
	"Edm.Date": {
		modelType: "Date"
	},
	"Edm.DateTime": {
		modelType: "Date"
	},
	"Edm.DateTimeOffset": {
		modelType: "DateTimeOffset"
	},
	"Edm.Decimal": {
		modelType: "Decimal"
	},
	"Edm.Double": {
		modelType: "Float"
	},
	"Edm.Float": {
		modelType: "Float"
	},
	"Edm.Guid": {
		modelType: "Guid"
	},
	"Edm.Int16": {
		modelType: "Int"
	},
	"Edm.Int32": {
		modelType: "Int"
	},
	"Edm.Int64": {
		modelType: "Int"
	},
	"Edm.SByte": {
		modelType: "Int"
	},
	"Edm.Single": {
		modelType: "Float"
	},
	"Edm.String": {
		modelType: "String"
	},
	"Edm.Time": {
		modelType: "TimeOfDay"
	},
	"Edm.TimeOfDay": {
		modelType: "TimeOfDay"
	},
	"Edm.Stream": {
		//no corresponding modelType - ignore for filtering
		modelType: undefined
	}
};
function _retrieveModel(this: { modelName: string; control: any; resolve: Function }) {
	this.control.detachModelContextChange(_retrieveModel, this);
	const sModelName = this.modelName,
		oModel = this.control.getModel(sModelName);

	if (oModel) {
		this.resolve(oModel);
	} else {
		this.control.attachModelContextChange(_retrieveModel, this);
	}
}
async function getCustomDataWithModifier(oControl: any, sProperty: any, oModifier: any) {
	const aCustomData: any[] = [];

	const aRetrievedCustomData = await Promise.resolve().then(
		oModifier.getAggregation.bind(oModifier, oControl, "customData") as () => any[]
	);

	const oPromise = aRetrievedCustomData.reduce((oPreviousPromise: Promise<void>, oCustomData) => {
		return oPreviousPromise.then(oModifier.getProperty.bind(oModifier, oCustomData, "key")).then(function (sKey: any) {
			if (sKey === sProperty) {
				aCustomData.push(oCustomData);
			}
		});
	}, Promise.resolve());
	await oPromise;

	if (aCustomData.length === 1) {
		return oModifier.getProperty(aCustomData[0], "value");
	} else {
		return undefined;
	}
}

const DelegateUtil = {
	getLocalizedText(sTextOrToken: string, oControl: Control | PageController) {
		const aMatch = /{([A-Za-z0-9_.|@]+)>([A-Za-z0-9_.|]+)}/.exec(sTextOrToken);
		if (aMatch) {
			try {
				const oResourceBundle = (oControl.getModel(aMatch[1]) as ResourceModel).getResourceBundle() as ResourceBundle;
				return oResourceBundle.getText(aMatch[2]);
			} catch (e) {
				Log.info(`Unable to retrieve localized text ${sTextOrToken}`);
			}
		}
		return sTextOrToken;
	},
	getCustomData(oControl: any, sProperty: any, oModifier?: any) {
		// If Modifier is given, the method must execute asynchronously and return a Promise
		if (oModifier) {
			return getCustomDataWithModifier(oControl, sProperty, oModifier);
		} else {
			// Delegate invoked from a non-flex change - FilterBarDelegate._addP13nItem for OP table filtering, FilterBarDelegate.fetchProperties etc.
			if (oControl && sProperty) {
				if (oControl instanceof window.Element) {
					return oControl.getAttributeNS(NS_MACRODATA, sProperty);
				}
				if (oControl.data instanceof Function) {
					return oControl.data(sProperty);
				}
			}
			return undefined;
		}
	},
	setCustomData(oControl: any, sProperty: any, vValue: any) {
		if (oControl && sProperty) {
			if (oControl instanceof window.Element) {
				return oControl.setAttributeNS(NS_MACRODATA, `customData:${sProperty}`, vValue);
			}
			if (oControl.data instanceof Function) {
				return oControl.data(sProperty, vValue);
			}
		}
	},
	fetchPropertiesForEntity(sEntitySet: any, oMetaModel: any) {
		return oMetaModel.requestObject(`${sEntitySet}/`);
	},
	fetchAnnotationsForEntity(sEntitySet: any, oMetaModel: any) {
		return oMetaModel.requestObject(`${sEntitySet}@`);
	},
	fetchModel(oControl: any) {
		return new Promise((resolve) => {
			const sModelName = oControl.getDelegate().payload && oControl.getDelegate().payload.modelName,
				oContext = { modelName: sModelName, control: oControl, resolve: resolve };
			_retrieveModel.call(oContext);
		});
	},
	loadMacroLibrary(): Promise<void> {
		return new Promise((resolve) => {
			sap.ui.require(["sap/fe/macros/macroLibrary"], function (/*macroLibrary*/) {
				resolve();
			});
		});
	},
	templateControlFragment(sFragmentName: any, oPreprocessorSettings: any, oOptions: any, oModifier?: any) {
		return CommonUtils.templateControlFragment(sFragmentName, oPreprocessorSettings, oOptions, oModifier);
	},
	doesValueHelpExist(mParameters: any) {
		const sPropertyName = mParameters.sPropertyName || "";
		const sValueHelpType = mParameters.sValueHelpType || "";
		const oMetaModel = mParameters.oMetaModel;
		const oModifier = mParameters.oModifier;
		const sOriginalProperty = `${mParameters.sBindingPath}/${sPropertyName}`;
		const oPropertyContext = oMetaModel.createBindingContext(sOriginalProperty);
		let sValueHelpProperty = FieldHelper.valueHelpProperty(oPropertyContext);
		const bIsAbsolute = mParameters.sBindingPath && mParameters.sBindingPath.indexOf("/") === 0;

		// unit/currency
		if (sValueHelpProperty.indexOf("$Path") > -1) {
			sValueHelpProperty = oMetaModel.getObject(sValueHelpProperty);
		}
		if (bIsAbsolute && sValueHelpProperty.indexOf("/") !== 0) {
			sValueHelpProperty = `${mParameters.sBindingPath}/${sValueHelpProperty}`;
		}

		const sGeneratedId = generateID(
			mParameters.flexId,
			generate([oModifier ? oModifier.getId(mParameters.oControl) : mParameters.oControl.getId(), sValueHelpType]),
			getRelativePropertyPath(oPropertyContext.getProperty(sOriginalProperty), {
				context: {
					getModel: () => {
						return mParameters.oMetaModel;
					},
					getPath: () => {
						return sOriginalProperty;
					}
				} as any
			}),
			getRelativePropertyPath(oPropertyContext.getProperty(sValueHelpProperty), {
				context: {
					getModel: () => {
						return mParameters.oMetaModel;
					},
					getPath: () => {
						return sValueHelpProperty;
					}
				} as any
			})
		);

		return Promise.resolve()
			.then(function () {
				if (oModifier) {
					return oModifier.getAggregation(mParameters.oControl, "dependents");
				}
				return mParameters.oControl.getAggregation("dependents");
			})
			.then(function (aDependents: any) {
				return Promise.resolve(
					aDependents &&
						aDependents.some(function (oDependent: any) {
							return oModifier ? oModifier.getId(oDependent) === sGeneratedId : oDependent.getId() === sGeneratedId;
						})
				);
			});
	},
	isValueHelpRequired(mParameters: any, bInFilterField?: boolean) {
		const sPropertyName = mParameters.sPropertyName || "",
			oMetaModel = mParameters.oMetaModel,
			sProperty = `${mParameters.sBindingPath}/${sPropertyName}`,
			oPropertyContext = oMetaModel.createBindingContext(sProperty),
			sValueHelpProperty = FieldHelper.valueHelpProperty(oPropertyContext, bInFilterField);

		return this.getCustomData(mParameters.oControl, "displayModePropertyBinding", mParameters.oModifier)
			.then(function (bReadOnly: any) {
				// Check whether the control is read-only. If yes, no need of a value help.
				bReadOnly = typeof bReadOnly === "boolean" ? bReadOnly : bReadOnly === "true";
				if (bReadOnly) {
					return false;
				}
				// Else, check whether Value Help relevant annotation exists for the property.
				// TODO use PropertyFormatter.hasValueHelp () => if doing so, QUnit tests fail due to mocked model implementation
				return Promise.all([
					oMetaModel.requestObject(`${sValueHelpProperty}@com.sap.vocabularies.Common.v1.ValueListWithFixedValues`),
					oMetaModel.requestObject(`${sValueHelpProperty}@com.sap.vocabularies.Common.v1.ValueListReferences`),
					oMetaModel.requestObject(`${sValueHelpProperty}@com.sap.vocabularies.Common.v1.ValueListMapping`),
					oMetaModel.requestObject(`${sValueHelpProperty}@com.sap.vocabularies.Common.v1.ValueList`)
				]);
			})
			.then(function (aResults: any[]) {
				return !!aResults[0] || !!aResults[1] || !!aResults[2] || !!aResults[3];
			})
			.catch(function (oError: any) {
				Log.warning("Error while retrieving custom data / value list annotation values", oError);
			});
	},
	isTypeFilterable(sType: keyof typeof mDefaultTypeForEdmType) {
		return sType && sType in mDefaultTypeForEdmType && !!mDefaultTypeForEdmType[sType].modelType;
	},
	getModelType(sType: keyof typeof mDefaultTypeForEdmType) {
		return sType && sType in mDefaultTypeForEdmType && mDefaultTypeForEdmType[sType].modelType;
	},
	isMultiValue(oProperty: any) {
		let bIsMultiValue = true;
		//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
		switch (oProperty.filterExpression) {
			case "SearchExpression":
			case "SingleRange":
			case "SingleValue":
				bIsMultiValue = false;
				break;
			default:
				break;
		}
		if (oProperty.type && oProperty.type.indexOf("Boolean") > 0) {
			bIsMultiValue = false;
		}
		return bIsMultiValue;
	}
};
export default DelegateUtil;
