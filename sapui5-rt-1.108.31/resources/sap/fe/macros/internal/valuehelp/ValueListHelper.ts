import { Property } from "@sap-ux/vocabularies-types";
import Log, { Level } from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import CommonUtils from "sap/fe/core/CommonUtils";
import BusyLocker from "sap/fe/core/controllerextensions/BusyLocker";
import messageHandling from "sap/fe/core/controllerextensions/messageHandler/messageHandling";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import {
	getAssociatedCurrencyProperty,
	getAssociatedTextProperty,
	getAssociatedTimezoneProperty,
	getAssociatedUnitProperty
} from "sap/fe/core/templating/PropertyHelper";
import { getDisplayMode, getTypeConfig } from "sap/fe/core/templating/UIFormatters";
import ODataMetaModelUtil from "sap/fe/macros/ODataMetaModelUtil";
import Util from "sap/m/table/Util";
import Core from "sap/ui/core/Core";
import Fragment from "sap/ui/core/Fragment";
import Item from "sap/ui/core/Item";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import { system } from "sap/ui/Device";
import Rem from "sap/ui/dom/units/Rem";
import InParameter from "sap/ui/mdc/field/InParameter";
import OutParameter from "sap/ui/mdc/field/OutParameter";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import FilterType from "sap/ui/model/FilterType";
import JSONModel from "sap/ui/model/json/JSONModel";

const waitForPromise: any = {};
let aCachedValueHelp: any[] = [];
let aSuggestCachedValueHelp: any[] = [];

function _hasImportanceHigh(oValueListContext: any) {
	return oValueListContext.Parameters.some(function (oParameter: any) {
		return (
			oParameter["@com.sap.vocabularies.UI.v1.Importance"] &&
			oParameter["@com.sap.vocabularies.UI.v1.Importance"].$EnumMember === "com.sap.vocabularies.UI.v1.ImportanceType/High"
		);
	});
}
function _entityIsSearchable(oValueListInfo: any, oPropertyAnnotations: any) {
	const bSearchSupported =
			oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"] &&
			oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"].SearchSupported,
		oCollectionAnnotations =
			oValueListInfo.valueListInfo.$model.getMetaModel().getObject(`/${oValueListInfo.valueListInfo.CollectionPath}@`) || {},
		bSearchable =
			oCollectionAnnotations["@Org.OData.Capabilities.V1.SearchRestrictions"] &&
			oCollectionAnnotations["@Org.OData.Capabilities.V1.SearchRestrictions"].Searchable;

	if (
		(bSearchable === undefined && bSearchSupported === false) ||
		(bSearchable === true && bSearchSupported === false) ||
		bSearchable === false
	) {
		return false;
	}
	return true;
}
function _getCachedValueHelp(sValueHelpId: any) {
	return aCachedValueHelp.find(function (oVHElement: any) {
		return oVHElement.sVHId === sValueHelpId;
	});
}
function _getSuggestCachedValueHelp(sValueHelpId: any) {
	return aSuggestCachedValueHelp.find(function (oVHElement: any) {
		return oVHElement.sVHId === sValueHelpId;
	});
}
function _getValueHelpColumnDisplayFormat(oPropertyAnnotations: any, isValueHelpWithFixedValues: any) {
	const sDisplayMode = CommonUtils.computeDisplayMode(oPropertyAnnotations, undefined);
	const oTextAnnotation = oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"];
	const oTextArrangementAnnotation =
		oTextAnnotation && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"];
	if (isValueHelpWithFixedValues) {
		return oTextAnnotation && typeof oTextAnnotation !== "string" && oTextAnnotation.$Path ? sDisplayMode : "Value";
	} else {
		// Only explicit defined TextArrangements in a Value Help with Dialog are considered
		return oTextArrangementAnnotation ? sDisplayMode : "Value";
	}
}
function _redundantDescription(oVLParameter: any, aColumnInfo: any[]) {
	const oColumnInfo = aColumnInfo.find(function (columnInfo: any) {
		return oVLParameter.ValueListProperty === columnInfo.textColumnName;
	});
	if (
		oVLParameter.ValueListProperty === oColumnInfo?.textColumnName &&
		!oColumnInfo.keyColumnHidden &&
		oColumnInfo.keyColumnDisplayFormat !== "Value"
	) {
		return true;
	}
	return undefined;
}
function _getDefaultSortPropertyName(oValueList: any) {
	let sSortFieldName: string | undefined;
	const metaModel = oValueList.$model.getMetaModel();
	const mEntitySetAnnotations = metaModel.getObject(`/${oValueList.CollectionPath}@`) || {};
	const oSortRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"] || {};
	const oSortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(oSortRestrictions);
	const oFoundElement = oValueList.Parameters.find(function (oElement: any) {
		return (
			(oElement.$Type == "com.sap.vocabularies.Common.v1.ValueListParameterInOut" ||
				oElement.$Type == "com.sap.vocabularies.Common.v1.ValueListParameterOut" ||
				oElement.$Type == "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly") &&
			!(metaModel.getObject(`/${oValueList.CollectionPath}/${oElement.ValueListProperty}@com.sap.vocabularies.UI.v1.Hidden`) === true)
		);
	});
	if (oFoundElement) {
		if (
			metaModel.getObject(
				`/${oValueList.CollectionPath}/${oFoundElement.ValueListProperty}@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement/$EnumMember`
			) === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly"
		) {
			sSortFieldName = metaModel.getObject(
				`/${oValueList.CollectionPath}/${oFoundElement.ValueListProperty}@com.sap.vocabularies.Common.v1.Text/$Path`
			);
		} else {
			sSortFieldName = oFoundElement.ValueListProperty;
		}
	}
	if (sSortFieldName && (!oSortRestrictionsInfo[sSortFieldName] || oSortRestrictionsInfo[sSortFieldName].sortable)) {
		return sSortFieldName;
	} else {
		return undefined;
	}
}
function _build$SelectString(control: any) {
	const oViewData = control.getModel("viewData");
	if (oViewData) {
		const oData = oViewData.getData();
		if (oData) {
			const aColumns = oData.columns;
			if (aColumns) {
				return aColumns.reduce(function (sQuery: any, oProperty: any) {
					// Navigation properties (represented by X/Y) should not be added to $select.
					// TODO : They should be added as $expand=X($select=Y) instead
					if (oProperty.path && oProperty.path.indexOf("/") === -1) {
						sQuery = sQuery ? `${sQuery},${oProperty.path}` : oProperty.path;
					}
					return sQuery;
				}, undefined);
			}
		}
	}
	return undefined;
}
function _getConditionPath(oMetaModel: any, sEntitySet: any, sProperty: any) {
	const aParts = sProperty.split("/");
	let sPartialPath,
		sConditionPath = "";

	while (aParts.length) {
		let sPart = aParts.shift();
		sPartialPath = sPartialPath ? `${sPartialPath}/${sPart}` : sPart;
		const oProperty = oMetaModel.getObject(`${sEntitySet}/${sPartialPath}`);
		if (oProperty && oProperty.$kind === "NavigationProperty" && oProperty.$isCollection) {
			sPart += "*";
		}
		sConditionPath = sConditionPath ? `${sConditionPath}/${sPart}` : sPart;
	}
	return sConditionPath;
}
function _getColumnDefinitionFromSelectionFields(oMetaModel: any, sEntitySet: any) {
	const aColumnDefs: any[] = [],
		aSelectionFields = oMetaModel.getObject(`${sEntitySet}/@com.sap.vocabularies.UI.v1.SelectionFields`);

	if (aSelectionFields) {
		aSelectionFields.forEach(function (oSelectionField: any) {
			const sSelectionFieldPath = `${sEntitySet}/${oSelectionField.$PropertyPath}`,
				sConditionPath = _getConditionPath(oMetaModel, sEntitySet, oSelectionField.$PropertyPath),
				oPropertyAnnotations = oMetaModel.getObject(`${sSelectionFieldPath}@`),
				oColumnDef = {
					path: sConditionPath,
					label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sSelectionFieldPath,
					sortable: true,
					filterable: CommonUtils.isPropertyFilterable(oMetaModel, sEntitySet, oSelectionField.$PropertyPath, false),
					$Type: oMetaModel.getObject(sSelectionFieldPath).$Type
				};
			aColumnDefs.push(oColumnDef);
		});
	}

	return aColumnDefs;
}

const ValueListHelper = {
	ALLFRAGMENTS: undefined as any,
	logFragment: undefined as any,
	initializeCachedValueHelp: function () {
		// Destroy existing MDC value help objects
		aCachedValueHelp.forEach(function (oValueHelp: any) {
			if (!oValueHelp.oVHFilterBar.isDestroyed()) {
				oValueHelp.oVHFilterBar.destroy();
			}
			if (!oValueHelp.oVHDialogTable.isDestroyed()) {
				oValueHelp.oVHDialogTable.destroy();
			}
		});
		// initialize cache
		aCachedValueHelp = [];
		aSuggestCachedValueHelp = [];
	},

	getColumnVisibilityInfo: function (oValueList: any, sPropertyFullPath: any, bIsDropDownListe: any, isDialogTable: any) {
		const oMetaModel = oValueList.$model.getMetaModel();
		const aColumnInfos: any[] = [];
		const oColumnInfos = {
			isDialogTable: isDialogTable,
			columnInfos: aColumnInfos
		};

		oValueList.Parameters.forEach(function (oParameter: any) {
			const oPropertyAnnotations = oMetaModel.getObject(`/${oValueList.CollectionPath}/${oParameter.ValueListProperty}@`);
			const oTextAnnotation = oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"];
			let columnInfo: any = {};
			if (oTextAnnotation) {
				columnInfo = {
					keyColumnHidden: oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false,
					keyColumnDisplayFormat: oTextAnnotation && _getValueHelpColumnDisplayFormat(oPropertyAnnotations, bIsDropDownListe),
					textColumnName: oTextAnnotation && oTextAnnotation.$Path,
					columnName: oParameter.ValueListProperty,
					hasHiddenAnnotation: oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false
				};
			} else if (oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"]) {
				columnInfo = {
					columnName: oParameter.ValueListProperty,
					hasHiddenAnnotation: oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false
				};
			}
			oColumnInfos.columnInfos.push(columnInfo);
		});

		return oColumnInfos;
	},

	// This function is used for value help m-table and mdc-table
	getColumnVisibility: function (oValueList: any, oVLParameter: any, oSource: any) {
		const isDropDownList = oSource && !!oSource.valueHelpWithFixedValues,
			oColumnInfo = oSource.columnInfo,
			isVisible = !_redundantDescription(oVLParameter, oColumnInfo.columnInfos),
			isDialogTable = oColumnInfo.isDialogTable;

		if (isDropDownList || (!isDropDownList && isDialogTable) || (!isDropDownList && !_hasImportanceHigh(oValueList))) {
			const columnWithHiddenAnnotation = oColumnInfo.columnInfos.find(function (columnInfo: any) {
				return oVLParameter.ValueListProperty === columnInfo.columnName && columnInfo.hasHiddenAnnotation === true;
			});
			return !columnWithHiddenAnnotation ? isVisible : false;
		} else if (!isDropDownList && _hasImportanceHigh(oValueList)) {
			return oVLParameter &&
				oVLParameter["@com.sap.vocabularies.UI.v1.Importance"] &&
				oVLParameter["@com.sap.vocabularies.UI.v1.Importance"].$EnumMember === "com.sap.vocabularies.UI.v1.ImportanceType/High"
				? true
				: false;
		}
		return true;
	},

	getSortConditionsFromPresentationVariant: function (oValueList: any, bSuggestion: any) {
		const sPresentationVariantQualifier =
				oValueList.PresentationVariantQualifier === "" ? "" : `#${oValueList.PresentationVariantQualifier}`,
			sPresentationVariantPath = `/${oValueList.CollectionPath}/@com.sap.vocabularies.UI.v1.PresentationVariant${sPresentationVariantQualifier}`;
		const oPresentationVariant = oValueList.$model.getMetaModel().getObject(sPresentationVariantPath);
		if (oPresentationVariant && oPresentationVariant.SortOrder) {
			const sSortConditions: any = {
				sorters: []
			};
			if (bSuggestion) {
				oPresentationVariant.SortOrder.forEach(function (oCondition: any) {
					const oSorter: any = {};
					oSorter.path = oCondition.Property.$PropertyPath;
					if (oCondition.Descending) {
						oSorter.descending = true;
					} else {
						oSorter.ascending = true;
					}
					sSortConditions.sorters.push(oSorter);
				});
				return `sorter: ${JSON.stringify(sSortConditions.sorters)}`;
			} else {
				oPresentationVariant.SortOrder.forEach(function (oCondition: any) {
					const oSorter: any = {};
					oSorter.name = oCondition.Property.$PropertyPath;
					if (oCondition.Descending) {
						oSorter.descending = true;
					} else {
						oSorter.ascending = true;
					}
					sSortConditions.sorters.push(oSorter);
				});
				return JSON.stringify(sSortConditions);
			}
		}
		return undefined;
	},
	hasImportance: function (oValueListContext: any) {
		return _hasImportanceHigh(oValueListContext.getObject()) ? "Importance/High" : "None";
	},
	getMinScreenWidth: function (oValueList: any) {
		return _hasImportanceHigh(oValueList) ? "{= ${_VHUI>/minScreenWidth}}" : "416px";
	},
	getTableItemsParameters: function (oValueList: any, sRequestGroupId: any, bSuggestion: any, bValueHelpWithFixedValues: any) {
		let sParameters = "";
		const bSuspended = oValueList.Parameters.some(function (oParameter: any) {
			return bSuggestion || oParameter.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterIn";
		});

		if (sRequestGroupId) {
			sParameters = ", parameters: {$$groupId: '" + sRequestGroupId + "'";
		}

		// add select to oBindingInfo (BCP 2180255956 / 2170163012)
		const sSelect = _build$SelectString(this);
		if (sSelect) {
			if (sParameters.length > 0) {
				sParameters = sParameters + ", '" + sSelect + "'";
			} else {
				sParameters = ", parameters: {$select: '" + sSelect + "'";
			}
		}

		if (sParameters.length > 0) {
			sParameters = sParameters + " }";
		}

		const sLengthParameter = bValueHelpWithFixedValues ? "" : ", length: 10",
			sSortConditionsFromPresentationVariant = ValueListHelper.getSortConditionsFromPresentationVariant(oValueList, bSuggestion),
			sSortConditionsParameter = sSortConditionsFromPresentationVariant ? ", " + sSortConditionsFromPresentationVariant + "}" : "}";

		return (
			"{path: '/" +
			oValueList.CollectionPath +
			"'" +
			sParameters +
			", suspended : " +
			bSuspended +
			sLengthParameter +
			sSortConditionsParameter
		);
	},
	getTableDelegate: function (oValueList: any) {
		let sDefaultSortPropertyName = _getDefaultSortPropertyName(oValueList);
		if (sDefaultSortPropertyName) {
			sDefaultSortPropertyName = `'${sDefaultSortPropertyName}'`;
		}
		return (
			"{name: 'sap/fe/macros/internal/valuehelp/TableDelegate', payload: {collectionName: '" +
			oValueList.CollectionPath +
			"'" +
			(sDefaultSortPropertyName ? ", defaultSortPropertyName: " + sDefaultSortPropertyName : "") +
			"}}"
		);
	},
	getPropertyPath: function (oParameters: any) {
		return !oParameters.UnboundAction
			? `${oParameters.EntityTypePath}/${oParameters.Action}/${oParameters.Property}`
			: `/${oParameters.Action.substring(oParameters.Action.lastIndexOf(".") + 1)}/${oParameters.Property}`;
	},
	getWaitForPromise: function () {
		return waitForPromise;
	},
	getValueListCollectionEntitySet: function (oValueListContext: any) {
		const mValueList = oValueListContext.getObject();
		return mValueList.$model.getMetaModel().createBindingContext(`/${mValueList.CollectionPath}`);
	},
	getValueListProperty: function (oPropertyContext: any) {
		const oValueListModel = oPropertyContext.getModel();
		const mValueList = oValueListModel.getObject("/");
		return mValueList.$model.getMetaModel().createBindingContext(`/${mValueList.CollectionPath}/${oPropertyContext.getObject()}`);
	},
	getValueListInfoWithUseCaseSensitive: function (oValueListInfo: any) {
		const sCollectionPath: string = oValueListInfo.valueListInfo.CollectionPath,
			oMetaModel: any = oValueListInfo.valueListInfo.$model.getMetaModel();
		return Promise.all([
			oMetaModel.requestObject(`/${sCollectionPath}@Org.OData.Capabilities.V1.FilterFunctions`),
			oMetaModel.requestObject(`/@Org.OData.Capabilities.V1.FilterFunctions`)
		])
			.then(([entityFilterFunctions, containerFilterFunctions]: [string | undefined, string | undefined]) => {
				const filterFunctions = entityFilterFunctions || containerFilterFunctions;
				oValueListInfo.useCaseSensitive = filterFunctions ? filterFunctions.indexOf("tolower") === -1 : true;
				return oValueListInfo;
			})
			.catch(function (err: any) {
				Log.error("error trying to get the value help entitySet capabilities");
				throw err;
			});
	},
	getValueListInfo: function (oFVH: any, oMetaModel: any, propertyPath: any, sConditionModel?: any, oProperties?: any) {
		let sKey: string,
			sDescriptionPath: string,
			sPropertyPath,
			sFieldPropertyPath = "";
		const sPropertyName: string = oMetaModel.getObject(`${propertyPath}@sapui.name`) as string,
			aInParameters: any[] = [],
			aOutParameters: any[] = [];
		// Adding bAutoExpandSelect (second parameter of requestValueListInfo) as true by default
		return oMetaModel
			.requestValueListInfo(propertyPath, true, oFVH.getBindingContext())
			.then(function (mValueListInfo: any) {
				const bProcessInOut = oFVH.getInParameters().length + oFVH.getOutParameters().length === 0,
					oVHUIModel = oFVH.getModel("_VHUI"),
					qualifierForValidation = oFVH.data("valuelistForValidation"),
					bSuggestion = oVHUIModel.getProperty("/isSuggestion"),
					hasValueListRelevantQualifiers = oVHUIModel.getProperty("/hasValueListRelevantQualifiers"),
					aCollectiveSearchItems = oFVH.getAggregation("collectiveSearchItems") || [],
					aValueHelpKeys = Object.keys(mValueListInfo),
					indexDefaultVH = aValueHelpKeys.indexOf(""),
					isValueListWithFixedValues = oFVH.getModel().getMetaModel().getObject(`${propertyPath}@`)[
						"@com.sap.vocabularies.Common.v1.ValueListWithFixedValues"
					];
				let sValueHelpId,
					sValueHelpQualifier = aValueHelpKeys[0];
				// ValueHelp w/o qualifier should be the first
				if (indexDefaultVH && indexDefaultVH > 0) {
					aValueHelpKeys.unshift(aValueHelpKeys[indexDefaultVH]);
					aValueHelpKeys.splice(indexDefaultVH + 1, 1);
				}
				// No valid qualifier should be handled in mdc
				if (sValueHelpQualifier === undefined) {
					return oFVH.getModel("_VHUI").setProperty("/noValidValueHelp", true);
				}
				// Multiple/Collective ValueHelp and/or ContextDependentValueHelp (ContextDependentValueHelp not used in LR-Filterbar, Action/Create-Dialog)
				if (hasValueListRelevantQualifiers || aValueHelpKeys.length > 1 || aCollectiveSearchItems.length > 1) {
					// Value help with ValueListWithFixedValues returns always key "", the $qualifier contains the value help qualifier
					if (isValueListWithFixedValues) {
						sValueHelpId =
							mValueListInfo[""].$qualifier === ""
								? `${oFVH.getId()}::non-qualifier`
								: `${oFVH.getId()}::qualifier::${mValueListInfo[""].$qualifier}`;
						// Store in ValueHelp model
						oVHUIModel.setProperty("/valueHelpId", sValueHelpId);
						mValueListInfo = mValueListInfo[""];
					} else if (bSuggestion && aValueHelpKeys.indexOf(qualifierForValidation) > -1) {
						// In case of type-ahead the avaiable qualifer for validation is used
						sValueHelpId =
							qualifierForValidation === ""
								? `${oFVH.getId()}::non-qualifier`
								: `${oFVH.getId()}::qualifier::${qualifierForValidation}`;
						// Store in ValueHelp model
						oVHUIModel.setProperty("/valueHelpId", sValueHelpId);
						oVHUIModel.setProperty("/collectiveSearchKey", qualifierForValidation);
						mValueListInfo = mValueListInfo[qualifierForValidation];
						oFVH.setProperty("validateInput", true);
					} else {
						// In case of context is changes --> may be collectiveSearchItem needs to be removed
						aCollectiveSearchItems.forEach(function (oItem: any) {
							if (!aValueHelpKeys.includes(oItem.getKey())) {
								oFVH.removeAggregation("collectiveSearchItems", oItem);
							}
						});
						// Drop-down (vh selection) only visible if more then 1 VH
						if (aValueHelpKeys.length === 1) {
							oFVH.removeAllAggregation("collectiveSearchItems");
							oProperties.collectiveSearchKey = undefined;
						} else {
							aValueHelpKeys.forEach(function (sValueHelpKey: string) {
								if (
									aCollectiveSearchItems.filter(function (oItem: any) {
										return oItem.getKey() === sValueHelpKey;
									}).length === 0
								) {
									oFVH.addAggregation(
										"collectiveSearchItems",
										new Item({
											key: sValueHelpKey,
											text: mValueListInfo[sValueHelpKey].Label,
											enabled: true
										})
									);
								}
							});
						}
						if (oProperties && oProperties.collectiveSearchKey !== undefined) {
							sValueHelpQualifier = oProperties.collectiveSearchKey;
						} else if (oProperties && oProperties.collectiveSearchKey === undefined) {
							sValueHelpQualifier = aValueHelpKeys[0];
							oProperties.collectiveSearchKey = aValueHelpKeys[0];
						}
						// Build ValueHelp Id
						sValueHelpId =
							sValueHelpQualifier === ""
								? `${oFVH.getId()}::non-qualifier`
								: `${oFVH.getId()}::qualifier::${sValueHelpQualifier}`;
						// Store in ValueHelp model
						oFVH.getModel("_VHUI").setProperty("/valueHelpId", sValueHelpId);
						oFVH.getModel("_VHUI").setProperty("/collectiveSearchKey", sValueHelpQualifier);
						// Get ValueHelp by qualifier
						mValueListInfo = mValueListInfo[sValueHelpQualifier];
						if (
							!oFVH.getParent().isA("sap.ui.mdc.FilterBar") &&
							bSuggestion &&
							qualifierForValidation !== sValueHelpQualifier
						) {
							oFVH.setProperty("validateInput", false);
						}
					}
				} else {
					// Default ValueHelp (the first/only one) is normally ValueHelp w/o qualifier
					mValueListInfo = mValueListInfo[sValueHelpQualifier];
				}
				let sContextPrefix = "";

				const bConsiderInOut = ValueListHelper.considerInOutParameter(oFVH, propertyPath);

				if (oFVH.data("useMultiValueField") === "true" && oFVH.getBindingContext() && oFVH.getBindingContext().getPath()) {
					const aBindigContextParts = oFVH.getBindingContext().getPath().split("/");
					const aPropertyBindingParts = propertyPath.split("/");
					if (aPropertyBindingParts.length - aBindigContextParts.length > 1) {
						const aContextPrefixParts = [];
						for (let i = aBindigContextParts.length; i < aPropertyBindingParts.length - 1; i++) {
							aContextPrefixParts.push(aPropertyBindingParts[i]);
						}
						sContextPrefix = `${aContextPrefixParts.join("/")}/`;
					}
				}

				// Add column definitions for properties defined as Selection fields on the CollectionPath entity set.
				const oSubMetaModel = mValueListInfo.$model.getMetaModel(),
					sEntitySetPath = `/${mValueListInfo.CollectionPath}`,
					aColumnDefs = _getColumnDefinitionFromSelectionFields(oSubMetaModel, sEntitySetPath),
					aParentFFNames = ValueListHelper.getParentFilterFieldNames(oFVH);

				// Determine the settings
				// TODO: since this is a static function we can't store the infos when filterbar is requested later
				mValueListInfo.Parameters.forEach(function (entry: any) {
					//All String fields are allowed for filter
					sPropertyPath = `/${mValueListInfo.CollectionPath}/${entry.ValueListProperty}`;
					const oProperty = mValueListInfo.$model.getMetaModel().getObject(sPropertyPath),
						oPropertyAnnotations = mValueListInfo.$model.getMetaModel().getObject(`${sPropertyPath}@`) || {};

					// If oProperty is undefined, then the property coming for the entry isn't defined in
					// the metamodel, therefore we don't need to add it in the in/out parameters
					if (oProperty) {
						// Search for the *out Parameter mapped to the local property
						if (!sKey && entry.$Type.indexOf("Out") > 48 && entry.LocalDataProperty.$PropertyPath === sPropertyName) {
							//"com.sap.vocabularies.Common.v1.ValueListParameter".length = 49
							sFieldPropertyPath = sPropertyPath;
							sKey = entry.ValueListProperty;
							//Only the text annotation of the key can specify the description
							sDescriptionPath =
								oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] &&
								oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path;
						}

						if (bConsiderInOut) {
							//Collect In and Out Parameter (except the field in question)
							if (
								bProcessInOut &&
								entry.$Type !== "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly" &&
								entry.$Type !== "com.sap.vocabularies.Common.v1.ValueListParameterConstant" &&
								entry.LocalDataProperty &&
								entry.LocalDataProperty.$PropertyPath !== sPropertyName
							) {
								let sValuePath = "";

								if (sConditionModel && sConditionModel.length > 0) {
									if (
										oFVH.getParent().isA("sap.ui.mdc.Table") &&
										oFVH.getBindingContext() &&
										entry.$Type.indexOf("In") > 48
									) {
										// Special handling for value help used in filter dialog
										const aParts = entry.LocalDataProperty.$PropertyPath.split("/");
										if (aParts.length > 1) {
											const sFirstNavigationProperty = aParts[0];
											const oBoundEntity = oFVH
												.getModel()
												.getMetaModel()
												.getMetaContext(oFVH.getBindingContext().getPath());
											const sPathOfTable = oFVH.getParent().getRowBinding().getPath();
											if (oBoundEntity.getObject(`${sPathOfTable}/$Partner`) === sFirstNavigationProperty) {
												// Using the condition model doesn't make any sense in case an in-parameter uses a navigation property
												// referring to the partner. Therefore reducing the path and using the FVH context instead of the condition model
												sValuePath =
													"{" +
													entry.LocalDataProperty.$PropertyPath.replace(sFirstNavigationProperty + "/", "") +
													"}";
											}
										}
									}

									if (!sValuePath) {
										sValuePath = "{" + sConditionModel + ">/conditions/" + entry.LocalDataProperty.$PropertyPath + "}";
									}
								} else {
									sValuePath = "{" + sContextPrefix + entry.LocalDataProperty.$PropertyPath + "}";
								}

								//Out and InOut
								if (entry.$Type.indexOf("Out") > 48) {
									if (!aParentFFNames || aParentFFNames.indexOf(entry.LocalDataProperty.$PropertyPath) > -1) {
										// Filterbar inside VH doesn't have Adapt Filters dialog. Getting Filterfields for which out parameters can be applied.
										aOutParameters.push(
											new OutParameter({
												value: sValuePath,
												helpPath: entry.ValueListProperty
											})
										);
									}
								}
								//In and InOut
								if (entry.$Type.indexOf("In") > 48) {
									aInParameters.push(
										new InParameter({
											value: sValuePath,
											helpPath: entry.ValueListProperty,
											initialValueFilterEmpty: entry.InitialValueIsSignificant
										})
									);
								}
								//otherwise displayOnly and therefor not considered
							}
						}
						// Collect Constant Parameter
						// We manage constants parameters as in parameters so this the value list table is filtered properly
						if (entry.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterConstant") {
							aInParameters.push(
								new InParameter({
									value: entry.Constant,
									helpPath: entry.ValueListProperty
								})
							);
						}

						let sColumnPath = entry.ValueListProperty,
							sColumnPropertyType = oProperty.$Type;
						const sLabel = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sColumnPath;

						if (
							oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] &&
							oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"] &&
							oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]
								.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly"
						) {
							// the column property is the one coming from the text annotation
							sColumnPath = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path;
							const sTextPropertyPath = `/${mValueListInfo.CollectionPath}/${sColumnPath}`;
							sColumnPropertyType = mValueListInfo.$model.getMetaModel().getObject(sTextPropertyPath).$Type;
						}
						const bColumnNotAlreadyDefined =
							aColumnDefs.findIndex(function (oCol: any) {
								return oCol.path === sColumnPath;
							}) === -1;
						if (bColumnNotAlreadyDefined) {
							const oColumnDef = {
								path: sColumnPath,
								label: sLabel,
								sortable: true,
								filterable: !oPropertyAnnotations["@com.sap.vocabularies.UI.v1.HiddenFilter"],
								$Type: sColumnPropertyType
							};
							aColumnDefs.push(oColumnDef);
						}
					}
				});
				// Find DescriptionPath in column definition if not add it
				if (
					sDescriptionPath &&
					aColumnDefs.findIndex(function (oColumn: any) {
						return oColumn.path === sDescriptionPath;
					}) === -1
				) {
					const oColumnDef = {
						path: sDescriptionPath,
						label: sDescriptionPath,
						sortable: false,
						filterable: false,
						$Type: "Edm.String"
					};
					aColumnDefs.push(oColumnDef);
				}
				return {
					keyValue: sKey,
					descriptionValue: sDescriptionPath,
					fieldPropertyPath: sFieldPropertyPath,
					inParameters: aInParameters,
					outParameters: aOutParameters,
					valueListInfo: mValueListInfo,
					columnDefs: aColumnDefs
				};
			})
			.catch(function (exc: any) {
				const sMsg =
					exc.status && exc.status === 404
						? `Metadata not found (${exc.status}) for value help of property ${propertyPath}`
						: exc.message;
				Log.error(sMsg);
				oFVH.destroyContent();
			});
	},

	// For value helps in the filter bar on List Report, In/Out parameters of a navigation property
	// like "SalesorderManage/_Item/Material" are not supported (yet) as they cannot be easily resolved.
	considerInOutParameter: function (oFVH: any, propertyPath: any) {
		const bindingContext = oFVH.getBindingContext(),
			metaModel = oFVH.getModel().getMetaModel();
		// on the Listreport there is no bindingContext
		if (!bindingContext) {
			let subPath = propertyPath;
			let metaModelFromsubPath = metaModel.getObject(subPath);
			let checkBeAction = null;
			while (subPath.length > 0) {
				checkBeAction = Array.isArray(metaModelFromsubPath) ? metaModelFromsubPath[0] : metaModelFromsubPath;
				// In/Out parameters shall be considered if we handle a Action aParameter
				if (checkBeAction?.$kind === "Action") {
					return true;
				} else if (checkBeAction.$kind === "NavigationProperty") {
					return false;
				}
				subPath = subPath.substring(0, subPath.lastIndexOf("/"));
				metaModelFromsubPath = metaModel.getObject(subPath);
			}
		}
		return true;
	},

	getParentFilterFieldNames: function (oFVH: any) {
		let aParentFFNames;
		if (oFVH.getParent().isA("sap.ui.mdc.filterbar.vh.FilterBar") || oFVH.getParent().isA("sap.fe.core.controls.FilterBar")) {
			const oFB = oFVH.getParent();
			const aParentFilterFields = oFB.getFilterItems();
			aParentFFNames = aParentFilterFields.map(function (oFF: any) {
				return oFF.getFieldPath();
			});
		}
		return aParentFFNames;
	},

	_templateFragment: function (sFragmentName: any, oValueListInfo: any, oSourceModel: any, propertyPath: any, oAdditionalViewData?: any) {
		const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"),
			mValueListInfo = oValueListInfo.valueListInfo,
			oValueListModel = new JSONModel(mValueListInfo),
			oValueListServiceMetaModel = mValueListInfo.$model.getMetaModel(),
			oViewData = new JSONModel(
				Object.assign(
					{
						converterType: "ListReport",
						columns: oValueListInfo.columnDefs || null
					},
					oAdditionalViewData
				)
			);

		return Promise.resolve(
			XMLPreprocessor.process(
				oFragment,
				{ name: sFragmentName },
				{
					//querySelector("*")
					bindingContexts: {
						valueList: oValueListModel.createBindingContext("/"),
						contextPath: oValueListServiceMetaModel.createBindingContext(`/${mValueListInfo.CollectionPath}/`),
						source: oSourceModel.createBindingContext("/")
					},
					models: {
						valueList: oValueListModel,
						contextPath: oValueListServiceMetaModel,
						source: oSourceModel,
						metaModel: oValueListServiceMetaModel,
						viewData: oViewData
					}
				}
			)
		).then(function (oSubFragment: any) {
			const oLogInfo = { path: propertyPath, fragmentName: sFragmentName, fragment: oSubFragment };
			if (Log.getLevel() === Level.DEBUG) {
				//In debug mode we log all generated fragments
				ValueListHelper.ALLFRAGMENTS = ValueListHelper.ALLFRAGMENTS || [];
				ValueListHelper.ALLFRAGMENTS.push(oLogInfo);
			}
			if (ValueListHelper.logFragment) {
				//One Tool Subscriber allowed
				setTimeout(function () {
					ValueListHelper.logFragment(oLogInfo);
				}, 0);
			}
			return Fragment.load({ definition: oSubFragment });
		});
	},
	createValueHelpDialog: function (propertyPath: any, oFVH: any, oTable: any, oFilterBar: any, oValueListInfo: any, bSuggestion: any) {
		const sFVHClass = oFVH.getMetadata().getName(),
			oWrapper = oFVH.getDialogContent && oFVH.getDialogContent(),
			sWrapperId = oWrapper && oWrapper.getId(),
			sValueHelpId = oFVH.getModel("_VHUI").getProperty("/valueHelpId");
		const oPropertyAnnotations = oFVH.getModel().getMetaModel().getObject(`${propertyPath}@`);

		//Only do this in case of context dependent value helps or other VH called the first time
		if ((!oTable || sValueHelpId !== undefined) && sFVHClass.indexOf("FieldValueHelp") > -1) {
			//Complete the field value help control
			oFVH.setTitle(oValueListInfo.valueListInfo.Label);
			oFVH.setKeyPath(oValueListInfo.keyValue);
			oFVH.setDescriptionPath(oValueListInfo.descriptionValue);
			oFVH.setFilterFields(_entityIsSearchable(oValueListInfo, oPropertyAnnotations) ? "$search" : "");
		}
		const isDialogTable = true;
		const bIsDropDownListe = false;
		const oColumnInfo = ValueListHelper.getColumnVisibilityInfo(
			oValueListInfo.valueListInfo,
			propertyPath,
			bIsDropDownListe,
			isDialogTable
		);
		const oSourceModel = new JSONModel({
			id: sValueHelpId || oFVH.getId(),
			groupId: oFVH.data("requestGroupId") || undefined,
			bSuggestion: bSuggestion,
			columnInfo: oColumnInfo,
			valueHelpWithFixedValues: bIsDropDownListe,
			isFieldValueHelp: true
		});

		oTable =
			oTable ||
			ValueListHelper._templateFragment(
				"sap.fe.macros.internal.valuehelp.ValueListDialogTable",
				oValueListInfo,
				oSourceModel,
				propertyPath,
				{
					enableAutoColumnWidth: !system.phone
				}
			);

		oFilterBar =
			oFilterBar ||
			ValueListHelper._templateFragment(
				"sap.fe.macros.internal.valuehelp.ValueListFilterBar",
				oValueListInfo,
				oSourceModel,
				propertyPath
			);

		return Promise.all([oTable, oFilterBar]).then((aControls: [any, any]) => {
			const sInValueHelpId = oFVH.getModel("_VHUI").getProperty("/valueHelpId"),
				oInTable = aControls[0],
				oInFilterBar = aControls[1];
			if (oInTable) {
				oInTable.setModel(oValueListInfo.valueListInfo.$model);
				Log.info(
					`Value List - Dialog Table - XML content created [${propertyPath}]`,
					oInTable.getMetadata().getName(),
					"MDC Templating"
				);
			}
			if (oInFilterBar) {
				oInFilterBar.setModel(oValueListInfo.valueListInfo.$model);
				Log.info(
					`Value List- Filterbar - XML content created [${propertyPath}]`,
					oInFilterBar.getMetadata().getName(),
					"MDC Templating"
				);
			}

			if ((oInFilterBar && oInFilterBar !== oFVH.getFilterBar()) || (oInFilterBar && sInValueHelpId !== undefined)) {
				oFVH.setFilterBar(oInFilterBar);
			} else {
				oFVH.addDependent(oInFilterBar);
			}
			if (oInTable !== oWrapper.getTable() || sInValueHelpId !== undefined) {
				oWrapper.setTable(oInTable);
				if (oInFilterBar) {
					oInTable.setFilter(oInFilterBar.getId());
				}
				oInTable.initialized();
				delete waitForPromise[sWrapperId];
			}
			// Different table width for type-ahead or dialog
			const sTableWidth = this.getTableWidth(oInTable, this._getWidthInRem(oFVH._getField()));
			oFVH.getModel("_VHUI").setProperty("/tableWidth", sTableWidth);
			oInTable.setWidth("100%");
			// VH-Cache: In case of type-ahead only table is created, in case of VH-dialog the filterbar is created and needs to be cached
			if (sInValueHelpId !== undefined) {
				const oSelectedCacheItem = _getCachedValueHelp(sInValueHelpId);
				if (!oSelectedCacheItem) {
					aCachedValueHelp.push({
						sVHId: sInValueHelpId,
						oVHDialogTable: oInTable,
						oVHFilterBar: oInFilterBar
					});
				} else if (oSelectedCacheItem && oSelectedCacheItem.oVHFilterBar === false) {
					aCachedValueHelp[aCachedValueHelp.indexOf(oSelectedCacheItem)].oVHFilterBar = oInFilterBar;
				}
			}
			// Do not rebind in case of fetch eq 2 and table is already bound, autoBindOnInit is always false
			if (!oInTable.isTableBound() && ValueListHelper.fetchValuesOnInitialLoad(oValueListInfo.valueListInfo)) {
				oInTable.rebind();
			}
		});
	},
	createValueHelpSuggest: function (propertyPath: any, oFVH: any, oTable: any, oValueListInfo: any, bSuggestion: any) {
		const oWrapper = oFVH.getSuggestContent && oFVH.getSuggestContent(),
			sWrapperId = oWrapper && oWrapper.getId(),
			sFVHClass = oFVH.getMetadata().getName(),
			sValueHelpId = oFVH.getModel("_VHUI").getProperty("/valueHelpId");
		const oPropertyAnnotations = oFVH.getModel().getMetaModel().getObject(`${propertyPath}@`);

		//Only do this in case of context dependent value helps or other VH called the first time
		if ((!oTable || sValueHelpId !== undefined) && sFVHClass.indexOf("FieldValueHelp") > -1) {
			//Complete the field value help control
			oFVH.setTitle(oValueListInfo.valueListInfo.Label);
			oFVH.setKeyPath(oValueListInfo.keyValue);
			oFVH.setDescriptionPath(oValueListInfo.descriptionValue);
			oFVH.setFilterFields(_entityIsSearchable(oValueListInfo, oPropertyAnnotations) ? "$search" : "");
		}
		const bIsDropDownListe = oFVH.getModel().getMetaModel().getObject(`${propertyPath}@`)[
			"@com.sap.vocabularies.Common.v1.ValueListWithFixedValues"
		];
		const isDialogTable = false;
		const oColumnInfo = ValueListHelper.getColumnVisibilityInfo(
			oValueListInfo.valueListInfo,
			propertyPath,
			bIsDropDownListe,
			isDialogTable
		);
		const oSourceModel = new JSONModel({
			id: sValueHelpId || oFVH.getId(),
			groupId: oFVH.data("requestGroupId") || undefined,
			bSuggestion: bSuggestion,
			propertyPath: propertyPath,
			columnInfo: oColumnInfo,
			valueHelpWithFixedValues: bIsDropDownListe
		});
		oTable =
			oTable ||
			ValueListHelper._templateFragment(
				"sap.fe.macros.internal.valuehelp.ValueListTable",
				oValueListInfo,
				oSourceModel,
				propertyPath
			);

		return Promise.all([oTable]).then((aControls: any[]) => {
			let sTableWidth;
			const oInTable = aControls[0];

			if (oInTable) {
				oInTable.setModel(oValueListInfo.valueListInfo.$model);
				const oBinding = oInTable.getBinding("items");
				oBinding.attachEventOnce("dataRequested", function () {
					BusyLocker.lock(oInTable);
				});
				oBinding.attachEvent("dataReceived", function (oEvent: any) {
					const sParentId = oFVH.getParent().getId();
					const oMessageManager = Core.getMessageManager();
					if (BusyLocker.isLocked(oInTable)) {
						BusyLocker.unlock(oInTable);
					}
					// Handle messages related to input with invalid token
					if (oEvent.getParameter("error")) {
						const sErrorMessage = oEvent.getParameter("error").error.message;
						const _updateMessage = function (oMessage: any) {
							if (sParentId.indexOf("APD_::") === 0 && sErrorMessage === oMessage.message) {
								oMessage.target = sParentId;
								oFVH._oConditions.$search = undefined;
							}
							return oMessage;
						};
						// use timeout as the messages are otherwise not yet in the message model
						setTimeout(function () {
							messageHandling.getMessages().forEach(function (oMessage: any) {
								_updateMessage(oMessage);
							});
						}, 0);
					} else {
						oMessageManager
							.getMessageModel()
							.getData()
							.forEach(function (oMessage: any) {
								if (oMessage.target.includes(sParentId) && oMessage.controlIds.length === 0) {
									oMessage.target = "";
								}
							});
					}
				});

				//If the entity is DraftEnabled add a DraftFilter
				if (ModelHelper.isDraftSupported(oBinding.getModel().getMetaModel(), oBinding.getPath())) {
					oBinding.filter(new Filter("IsActiveEntity", FilterOperator.EQ, true), FilterType.Control);
				}

				Log.info(
					`Value List- suggest Table XML content created [${propertyPath}]`,
					oInTable.getMetadata().getName(),
					"MDC Templating"
				);
			}

			if (oInTable !== oWrapper.getTable() || sValueHelpId !== undefined) {
				oWrapper.setTable(oInTable);
				oInTable.attachEventOnce("updateFinished", function () {
					oWrapper.invalidate(oInTable);
				});
				delete waitForPromise[sWrapperId];
			}
			const isUnitValueHelp = oFVH.data("sourcePath") !== oFVH.data("originalPropertyPath");

			// handling of table-width for special case of predefined filter-bar variant where filter-field is not available yet
			const oFilterField = oFVH._getField();
			if (
				oFilterField.isA("sap.ui.mdc.FilterField") ||
				oFilterField.isA("sap.ui.mdc.Field") ||
				oFilterField.isA("sap.ui.mdc.MultiValueField")
			) {
				sTableWidth = this.getTableWidth(oInTable, this._getWidthInRem(oFilterField, isUnitValueHelp));
				oFVH.getModel("_VHUI").setProperty("/tableWidth", sTableWidth);
				oInTable.setWidth(sTableWidth);
			} else {
				oFVH.getModel("_VHUI").setProperty("/tableWidth", undefined); // set to undefined in order to be checked later in showValueListInfo
			}

			if (sValueHelpId !== undefined) {
				const oSelectedCacheItem = _getSuggestCachedValueHelp(sValueHelpId);
				if (!oSelectedCacheItem) {
					aSuggestCachedValueHelp.push({
						sVHId: sValueHelpId,
						oVHSuggestTable: oInTable
					});
				}
			}
		});
	},
	_getWidthInRem: function (oControl: any, isUnitValueHelp?: any) {
		let $width = oControl.$().width();
		if (isUnitValueHelp && $width) {
			$width = 0.3 * $width;
		}
		const fWidth = $width ? parseFloat(Rem.fromPx($width)) : 0;
		return isNaN(fWidth) ? 0 : fWidth;
	},
	getTableWidth: function (oTable: any, fMinWidth: any) {
		let sWidth;
		const aColumns = oTable.getColumns(),
			aVisibleColumns =
				(aColumns &&
					aColumns.filter(function (oColumn: any) {
						return oColumn && oColumn.getVisible && oColumn.getVisible();
					})) ||
				[],
			iSumWidth = aVisibleColumns.reduce(function (fSum: any, oColumn: any) {
				sWidth = oColumn.getWidth();
				if (sWidth && sWidth.endsWith("px")) {
					sWidth = Rem.fromPx(sWidth);
				}
				const fWidth = parseFloat(sWidth);
				return fSum + (isNaN(fWidth) ? 9 : fWidth);
			}, aVisibleColumns.length);
		return `${Math.max(iSumWidth, fMinWidth)}em`;
	},

	createVHUIModel: function (propertyPath: any, oFVH: any, bSuggestion?: any) {
		// setting the _VHUI model evaluated in the ValueListTable fragment
		const oModel = oFVH.getModel(),
			oMetaModel = oModel.getMetaModel();
		let oVHUIModel = oFVH.getModel("_VHUI");

		if (!oVHUIModel) {
			oVHUIModel = new JSONModel({});
			oFVH.setModel(oVHUIModel, "_VHUI");
			// Identifies the "ContextDependent-Scenario"
			oVHUIModel.setProperty(
				"/hasValueListRelevantQualifiers",
				!!oMetaModel.getObject(`${propertyPath}@`)["@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"]
			);
		}
		oVHUIModel.setProperty("/isSuggestion", bSuggestion);
		oVHUIModel.setProperty("/minScreenWidth", !bSuggestion ? "418px" : undefined);

		return oVHUIModel;
	},

	showValueListInfo: function (propertyPath: any, oFVH: any, bSuggestion: any, sConditionModel: any, oProperties: any) {
		const oModel = oFVH.getModel(),
			oMetaModel = oModel ? oModel.getMetaModel() : CommonUtils.getAppComponent(oFVH).getModel().getMetaModel(),
			oWrapper = oFVH.getDialogContent && oFVH.getDialogContent(),
			oSuggestWrapper = oFVH.getSuggestContent && oFVH.getSuggestContent();
		let sWrapperId, oDialogTable: any, oFilterBar: any, oSuggestTable, bExists;
		if (bSuggestion) {
			sWrapperId = oSuggestWrapper && oSuggestWrapper.getId();
			oSuggestTable = oSuggestWrapper && oSuggestWrapper.getTable && oSuggestWrapper.getTable();
			bExists = oSuggestTable;
		} else {
			oDialogTable = oWrapper && oWrapper.getTable && oWrapper.getTable();
			oFilterBar = oFVH && oFVH.getFilterBar && oFVH.getFilterBar();
			sWrapperId = oWrapper && oWrapper.getId();
			bExists = oDialogTable && oFilterBar;
		}

		// setting the _VHUI model evaluated in the ValueListTable fragment
		const oVHUIModel = ValueListHelper.createVHUIModel(propertyPath, oFVH, bSuggestion);

		const sValueHelpId = oFVH.getModel("_VHUI").getProperty("/valueHelpId");
		if (oDialogTable) {
			oDialogTable.setWidth("100%");
		}

		// handling of special case of predefined variant: the table width can only be set late when field is available (see function createValueHelpSuggest)
		if (oSuggestTable) {
			let sTableWidth = oVHUIModel.getProperty("/tableWidth");
			if (!sTableWidth) {
				const isUnitValueHelp = oFVH.data("sourcePath") !== oFVH.data("originalPropertyPath");
				sTableWidth = this.getTableWidth(oSuggestTable, this._getWidthInRem(oFVH._getField(), isUnitValueHelp));
				oFVH.getModel("_VHUI").setProperty("/tableWidth", sTableWidth);
				oSuggestTable.setWidth(sTableWidth);
			}
		}

		// switch off internal caching
		if (
			(sValueHelpId !== undefined && oFVH.getBindingContext()) ||
			(oFVH.getModel("_VHUI").getProperty("/collectiveSearchKey") !== undefined &&
				oFVH.getModel("_VHUI").getProperty("/collectiveSearchKey") !== oProperties.collectiveSearchKey)
		) {
			oDialogTable = undefined;
			oFilterBar = undefined;
			oSuggestTable = undefined;
			bExists = undefined;
			delete waitForPromise[sWrapperId];
		}

		if (!bSuggestion && !oFilterBar && oFVH.getDependents().length > 0) {
			const oPotentialFilterBar = oFVH.getDependents()[0];
			if (oPotentialFilterBar.isA("sap.ui.mdc.filterbar.vh.FilterBar")) {
				oFilterBar = oPotentialFilterBar;
			}
		}
		if (waitForPromise[sWrapperId] || bExists) {
			return waitForPromise[`promise${sWrapperId}`];
		} else {
			if ((bSuggestion && !oSuggestTable) || (!bSuggestion && !oDialogTable)) {
				waitForPromise[sWrapperId] = true;
			}
			const oPromise = ValueListHelper.getValueListInfo(oFVH, oMetaModel, propertyPath, sConditionModel, oProperties)
				.then(ValueListHelper.getValueListInfoWithUseCaseSensitive)
				.then(function (oValueListInfo: any) {
					const sInValueHelpId = oFVH.getModel("_VHUI").getProperty("/valueHelpId");
					if (oFVH.getModel("_VHUI").getProperty("/noValidValueHelp")) {
						Log.error("Context dependent value help not found");
						return oFVH.close();
					}
					const aInParameters = oValueListInfo && oValueListInfo.inParameters,
						aOutParameters = oValueListInfo && oValueListInfo.outParameters;
					if (oFVH.getOutParameters().length !== aOutParameters.length) {
						aOutParameters.forEach(function (oOutParameter: any) {
							oFVH.addOutParameter(oOutParameter);
						});
					}
					if (oFVH.getInParameters().length !== aInParameters.length) {
						aInParameters.forEach(function (oInParameter: any) {
							oFVH.addInParameter(oInParameter);
						});
					}
					oFVH.setCaseSensitive(oValueListInfo.useCaseSensitive);
					if (bSuggestion) {
						const oSelectedSuggestCacheItem = _getSuggestCachedValueHelp(sInValueHelpId);

						const oInSuggestTable = oSelectedSuggestCacheItem ? oSelectedSuggestCacheItem.oVHSuggestTable : undefined;
						return (
							oValueListInfo &&
							ValueListHelper.createValueHelpSuggest(propertyPath, oFVH, oInSuggestTable, oValueListInfo, bSuggestion)
						);
					} else {
						const oSelectedCacheItem = _getCachedValueHelp(sInValueHelpId);
						if (oSelectedCacheItem) {
							oDialogTable = oSelectedCacheItem.oVHDialogTable;
							oFilterBar = oSelectedCacheItem.oVHFilterBar;
						}
						return (
							oValueListInfo &&
							ValueListHelper.createValueHelpDialog(propertyPath, oFVH, oDialogTable, oFilterBar, oValueListInfo, bSuggestion)
						);
					}
				})
				.catch(function (exc: any) {
					const sMsg =
						exc.status && exc.status === 404
							? `Metadata not found (${exc.status}) for value help of property ${propertyPath}`
							: exc.message;
					Log.error(sMsg);
					oFVH.destroyContent();
				});
			waitForPromise[`promise${sWrapperId}`] = oPromise;
			return oPromise;
		}
	},
	setValueListFilterFields: function (propertyPath: any, oFVH: any, bSuggestion: any, sConditionModel: any) {
		const oModel = oFVH.getModel(),
			oMetaModel = oModel.getMetaModel();
		// For ContextDependentValueHelp the func getValueListInfo is also called
		if (
			oFVH.getBindingContext() &&
			oFVH.getModel().getMetaModel().getObject(`${propertyPath}@`)["@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"]
		) {
			return;
		}
		return ValueListHelper.getValueListInfo(oFVH, oMetaModel, propertyPath, sConditionModel).then(function (oValueListInfo: any) {
			const oPropertyAnnotations = oFVH.getModel().getMetaModel().getObject(`${propertyPath}@`);
			if (oValueListInfo) {
				oFVH.setFilterFields(_entityIsSearchable(oValueListInfo, oPropertyAnnotations) ? "$search" : "");
			}
		});
	},

	/**
	 * Retrieves the column width for a given property.
	 *
	 * @param propertyPath The propertyPath
	 * @returns The width as a string.
	 */
	getColumnWidth: function (propertyPath: DataModelObjectPath) {
		const property = propertyPath.targetObject;
		let relatedProperty: Property[] = [property];
		// The additional property could refer to the text, currency, unit or timezone
		const additionalProperty =
				getAssociatedTextProperty(property) ||
				getAssociatedCurrencyProperty(property) ||
				getAssociatedUnitProperty(property) ||
				getAssociatedTimezoneProperty(property),
			textAnnotation = property.annotations?.Common?.Text,
			textArrangement = textAnnotation?.annotations?.UI?.TextArrangement?.toString(),
			displayMode = textArrangement && getDisplayMode(propertyPath);
		if (additionalProperty) {
			if (displayMode === "Description") {
				relatedProperty = [additionalProperty];
			} else if (!textAnnotation || (displayMode && displayMode !== "Value")) {
				relatedProperty.push(additionalProperty);
			}
		}
		let size = 0;
		relatedProperty.forEach((prop: Property) => {
			const propertyTypeConfig = getTypeConfig(prop, undefined);
			const PropertyODataConstructor = ObjectPath.get(propertyTypeConfig.type);
			const instance = new PropertyODataConstructor(propertyTypeConfig.formatOptions, propertyTypeConfig.constraints);
			const sWidth = instance ? Util.calcColumnWidth(instance) : null;
			size += sWidth ? parseFloat(sWidth.replace("rem", "")) : 0;
		});
		if (!size) {
			Log.error(`Cannot compute the column width for property: ${property.name}`);
		}
		return size <= 20 ? size.toString() + "rem" : "20rem";
	},
	fetchValuesOnInitialLoad: function (oValueListInfo: any) {
		if (oValueListInfo.FetchValues && oValueListInfo.FetchValues == 2) {
			return false;
		}
		return true;
	},
	getOutParameterPaths: function (aParameters: any) {
		let sPath = "";
		aParameters.forEach(function (oParameter: any) {
			if (oParameter.$Type.endsWith("Out")) {
				sPath += `{${oParameter.ValueListProperty}}`;
			}
		});
		return sPath;
	}
};

export default ValueListHelper;
