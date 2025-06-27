import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { SelectionVariant } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";
import { getRangeDefinition } from "sap/fe/core/converters/helpers/SelectionVariantHelper";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import { compileExpression, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import type PageController from "sap/fe/core/PageController";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import FieldRuntime from "sap/fe/macros/field/FieldRuntime";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import type TableAPI from "sap/fe/macros/table/TableAPI";
import Component from "sap/ui/core/Component";
import type Control from "sap/ui/core/Control";
import NumberFormat from "sap/ui/core/format/NumberFormat";
import type Table from "sap/ui/mdc/Table";
import type Context from "sap/ui/model/Context";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import type ODataV4ListBinding from "sap/ui/model/odata/v4/ODataListBinding";

/**
 * Get filter information for a SelectionVariant annotation.
 *
 * @param oTable The table instance
 * @param sSvPath Relative SelectionVariant annotation path
 * @returns Information on filters
 *  filters: array of sap.ui.model.filters
 * text: selection Variant text property
 * @private
 * @ui5-restricted
 */
function getFiltersInfoForSV(oTable: any, sSvPath: string) {
	const metaModel = CommonUtils.getAppComponent(oTable).getMetaModel();
	const svContext = metaModel.getMetaContext(`${oTable.data("entityType")}${sSvPath}`),
		oSelectionVariant = getInvolvedDataModelObjects(svContext).targetObject as SelectionVariant,
		mPropertyFilters: any = {},
		aFilters = [],
		aPaths: any[] = [];
	let sText = "";
	if (oSelectionVariant) {
		sText = oSelectionVariant.Text as string;
		(oSelectionVariant.SelectOptions || []).forEach(function (oSelectOption) {
			if (oSelectOption.PropertyName?.$target && oSelectOption.Ranges?.length > 0) {
				const propertyType = oSelectOption.PropertyName.$target.type;
				const sPath = oSelectOption.PropertyName.value;
				if (!aPaths.includes(sPath)) {
					aPaths.push(sPath);
				}
				for (const j in oSelectOption.Ranges) {
					const range = getRangeDefinition(oSelectOption.Ranges[j], propertyType);
					mPropertyFilters[sPath] = (mPropertyFilters[sPath] || []).concat(
						new Filter(sPath, range.operator as FilterOperator, range.rangeLow, range.rangeHigh)
					);
				}
			}
		});

		for (const sPropertyPath in mPropertyFilters) {
			aFilters.push(
				new Filter({
					filters: mPropertyFilters[sPropertyPath],
					and: false
				})
			);
		}
	}

	return {
		properties: aPaths,
		filters: aFilters,
		text: sText
	};
}
function getHiddenFilters(oTable: Control) {
	let aFilters: any[] = [];
	const hiddenFilters = oTable.data("hiddenFilters");
	if (hiddenFilters && Array.isArray(hiddenFilters.paths)) {
		hiddenFilters.paths.forEach(function (mPath: any) {
			const oSvFilter = getFiltersInfoForSV(oTable, mPath.annotationPath);
			aFilters = aFilters.concat(oSvFilter.filters);
		});
	}
	return aFilters;
}
function getQuickFilter(oTable: Control) {
	let aFilters: any[] = [];
	const sQuickFilterKey = DelegateUtil.getCustomData(oTable, "quickFilterKey");
	if (sQuickFilterKey) {
		aFilters = aFilters.concat(getFiltersInfoForSV(oTable, sQuickFilterKey).filters);
	}
	return aFilters;
}
function getTableFilters(oTable: Control) {
	return getQuickFilter(oTable).concat(getHiddenFilters(oTable));
}
function getListBindingForCount(oTable: Table, oPageBinding: any, oParams: any) {
	let countBinding!: any;
	const oBindingInfo = oTable.data("rowsBindingInfo"),
		oDataModel = oTable.getModel();
	const sBatchId = oParams.batchGroupId || "",
		oFilterInfo = getFilterInfo(oTable);
	let aFilters = Array.isArray(oParams.additionalFilters) ? oParams.additionalFilters : [];
	const sBindingPath = oFilterInfo.bindingPath ? oFilterInfo.bindingPath : oBindingInfo.path;

	aFilters = aFilters.concat(oFilterInfo.filters).concat(getP13nFilters(oTable));
	const oTableContextFilter = new Filter({
		filters: aFilters,
		and: true
	});

	// Need to pass by a temporary ListBinding in order to get $filter query option (as string) thanks to fetchFilter of OdataListBinding
	const oListBinding = oDataModel.bindList(
		(oPageBinding ? `${oPageBinding.getPath()}/` : "") + sBindingPath,
		oTable.getBindingContext() as Context,
		[],
		oTableContextFilter
	) as ODataV4ListBinding;

	return (oListBinding as any)
		.fetchFilter(oListBinding.getContext())
		.then(function (aStringFilters: string[]) {
			countBinding = oDataModel.bindProperty(`${oListBinding.getPath()}/$count`, oListBinding.getContext(), {
				$$groupId: sBatchId || "$auto",
				$filter: aStringFilters[0],
				$search: oFilterInfo.search
			});
			return countBinding.requestValue();
		})
		.then(function (iValue: any) {
			countBinding.destroy();
			oListBinding.destroy();
			return iValue;
		});
}
function getCountFormatted(iCount: any) {
	const oCountFormatter = NumberFormat.getIntegerInstance({ groupingEnabled: true });
	return oCountFormatter.format(iCount);
}
function getFilterInfo(oTable: any) {
	const oTableDefinition = oTable.getParent().getTableDefinition();
	let aIgnoreProperties: any[] = [];

	function _getRelativePathArrayFromAggregates(oSubTable: Table) {
		const mAggregates = (oSubTable.getParent() as TableAPI).getTableDefinition().aggregates as any;
		return Object.keys(mAggregates).map(function (sAggregateName) {
			return mAggregates[sAggregateName].relativePath;
		});
	}

	if (oTableDefinition.enableAnalytics) {
		aIgnoreProperties = aIgnoreProperties.concat(_getRelativePathArrayFromAggregates(oTable));

		if (!oTableDefinition.enableAnalyticsSearch) {
			// Search isn't allow as a $apply transformation for this table
			aIgnoreProperties = aIgnoreProperties.concat(["search"]);
		}
	}
	return FilterUtils.getFilterInfo(oTable.getFilter(), {
		ignoredProperties: aIgnoreProperties,
		targetControl: oTable
	});
}

/**
 * Retrieves all filters configured in Table filter personalization dialog.
 *
 * @param oTable Table instance
 * @returns Filters configured in table personalization dialog
 * @private
 * @ui5-restricted
 */
function getP13nFilters(oTable: Table) {
	const aP13nMode = oTable.getP13nMode();
	if (aP13nMode && aP13nMode.indexOf("Filter") > -1) {
		const aP13nProperties = (DelegateUtil.getCustomData(oTable, "sap_fe_TableDelegate_propertyInfoMap") || []).filter(function (
				oTableProperty: any
			) {
				return oTableProperty && !(oTableProperty.filterable === false);
			}),
			oFilterInfo = FilterUtils.getFilterInfo(oTable, { propertiesMetadata: aP13nProperties });
		if (oFilterInfo && oFilterInfo.filters) {
			return oFilterInfo.filters;
		}
	}
	return [];
}

function getAllFilterInfo(oTable: Table) {
	const oIFilterInfo = getFilterInfo(oTable);
	return {
		filters: oIFilterInfo.filters.concat(getTableFilters(oTable), getP13nFilters(oTable)),
		search: oIFilterInfo.search,
		bindingPath: oIFilterInfo.bindingPath
	};
}

/**
 * Returns a promise that is resolved with the table itself when the table was bound.
 *
 * @param oTable The table to check for binding
 * @returns A Promise that will be resolved when table is bound
 */
function whenBound(oTable: Table) {
	return _getOrCreateBoundPromiseInfo(oTable).promise;
}

/**
 * If not yet happened, it resolves the table bound promise.
 *
 * @param oTable The table that was bound
 */
function onTableBound(oTable: Table) {
	const oBoundPromiseInfo = _getOrCreateBoundPromiseInfo(oTable);
	if (oBoundPromiseInfo.resolve) {
		oBoundPromiseInfo.resolve(oTable);
		oTable.data("boundPromiseResolve", null);
	}
}

function _getOrCreateBoundPromiseInfo(oTable: Table) {
	if (!oTable.data("boundPromise")) {
		let fnResolve: any;
		oTable.data(
			"boundPromise",
			new Promise(function (resolve) {
				fnResolve = resolve;
			})
		);
		if ((oTable as any).isBound()) {
			fnResolve(oTable);
		} else {
			oTable.data("boundPromiseResolve", fnResolve);
		}
	}
	return { promise: oTable.data("boundPromise"), resolve: oTable.data("boundPromiseResolve") };
}

function updateBindingInfo(oBindingInfo: any, oFilterInfo: any, oFilter: any) {
	oBindingInfo.filters = oFilter;
	if (oFilterInfo.search) {
		oBindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(oFilterInfo.search);
	} else {
		oBindingInfo.parameters.$search = undefined;
	}
}

function fnGetSemanticTargetsFromTable(oController: PageController, oTable: Table) {
	const oView = oController.getView();
	const oInternalModelContext = oView.getBindingContext("internal");
	if (oInternalModelContext) {
		const sEntitySet = DelegateUtil.getCustomData(oTable, "targetCollectionPath");
		if (sEntitySet) {
			const oComponent = oController.getOwnerComponent();
			const oAppComponent = Component.getOwnerComponentFor(oComponent) as AppComponent;
			const oMetaModel = oAppComponent.getMetaModel();
			const oShellServiceHelper = CommonUtils.getShellServices(oAppComponent);
			const sCurrentHash = FieldRuntime._fnFixHashQueryString(CommonUtils.getHash());
			const oColumns = (oTable.getParent() as TableAPI).getTableDefinition().columns;
			const aSemanticObjectsForGetLinks = [];
			const aSemanticObjects: any[] = [];
			const aPathAlreadyProcessed: string[] = [];
			let sPath: string = "",
				sAnnotationPath,
				oProperty;
			let _oSemanticObject;
			const aSemanticObjectsPromises: Promise<any>[] = [];
			let sQualifier: string, regexResult;

			for (let i = 0; i < oColumns.length; i++) {
				sAnnotationPath = (oColumns[i] as any).annotationPath;
				//this check is required in cases where custom columns are configured via manifest where there is no provision for an annotation path.
				if (sAnnotationPath) {
					oProperty = oMetaModel.getObject(sAnnotationPath);
					if (oProperty && oProperty.$kind === "Property") {
						sPath = (oColumns[i] as any).annotationPath;
					} else if (oProperty && oProperty.$Type === "com.sap.vocabularies.UI.v1.DataField") {
						sPath = `${sEntitySet}/${oMetaModel.getObject(`${sAnnotationPath}/Value/$Path`)}`;
					}
				}
				if (sPath !== "") {
					const _Keys = Object.keys(oMetaModel.getObject(sPath + "@"));
					for (let index = 0; index < _Keys.length; index++) {
						if (
							!aPathAlreadyProcessed.includes(sPath) &&
							_Keys[index].indexOf(`@${CommonAnnotationTerms.SemanticObject}`) === 0 &&
							_Keys[index].indexOf(`@${CommonAnnotationTerms.SemanticObjectMapping}`) === -1 &&
							_Keys[index].indexOf(`@${CommonAnnotationTerms.SemanticObjectUnavailableActions}`) === -1
						) {
							regexResult = /#(.*)/.exec(_Keys[index]);
							sQualifier = regexResult ? regexResult[1] : "";
							aSemanticObjectsPromises.push(
								CommonUtils.getSemanticObjectPromise(oAppComponent, oView, oMetaModel, sPath, sQualifier)
							);
							aPathAlreadyProcessed.push(sPath);
						}
					}
				}
				sPath = "";
			}

			if (aSemanticObjectsPromises.length === 0) {
				return Promise.resolve();
			} else {
				Promise.all(aSemanticObjectsPromises)
					.then(function (aValues: any[]) {
						const aGetLinksPromises = [];
						let sSemObjExpression;
						const aSemanticObjectsResolved = aValues.filter(function (element: any) {
							if (element.semanticObject && typeof element.semanticObject.semanticObject === "object") {
								sSemObjExpression = compileExpression(pathInModel(element.semanticObject.semanticObject.$Path));
								element.semanticObject.semanticObject = sSemObjExpression;
								element.semanticObjectForGetLinks[0].semanticObject = sSemObjExpression;
								return true;
							} else if (element) {
								return element.semanticObject !== undefined;
							} else {
								return false;
							}
						});
						for (let j = 0; j < aSemanticObjectsResolved.length; j++) {
							_oSemanticObject = aSemanticObjectsResolved[j];
							if (
								_oSemanticObject &&
								_oSemanticObject.semanticObject &&
								!(_oSemanticObject.semanticObject.semanticObject.indexOf("{") === 0)
							) {
								aSemanticObjectsForGetLinks.push(_oSemanticObject.semanticObjectForGetLinks);
								aSemanticObjects.push({
									semanticObject: _oSemanticObject.semanticObject && _oSemanticObject.semanticObject.semanticObject,
									unavailableActions: _oSemanticObject.unavailableActions,
									path: aSemanticObjectsResolved[j].semanticObjectPath
								});
								aGetLinksPromises.push(oShellServiceHelper.getLinksWithCache([_oSemanticObject.semanticObjectForGetLinks])); //aSemanticObjectsForGetLinks));
							}
						}
						return CommonUtils.updateSemanticTargets(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash);
					})
					.catch(function (oError: any) {
						Log.error("fnGetSemanticTargetsFromTable: Cannot get Semantic Objects", oError);
					});
			}
		}
	}
}
function clearSelection(oTable: any) {
	oTable.clearSelection();
	const oInternalModelContext = oTable.getBindingContext("internal");
	if (oInternalModelContext) {
		oInternalModelContext.setProperty("deleteEnabled", false);
		oInternalModelContext.setProperty("numberOfSelectedContexts", 0);
		oInternalModelContext.setProperty("selectedContexts", []);
		oInternalModelContext.setProperty("deletableContexts", []);
	}
}

const oTableUtils = {
	getCountFormatted: getCountFormatted,
	getHiddenFilters: getHiddenFilters,
	getFiltersInfoForSV: getFiltersInfoForSV,
	getTableFilters: getTableFilters,
	getListBindingForCount: getListBindingForCount,
	getFilterInfo: getFilterInfo,
	getP13nFilters: getP13nFilters,
	getAllFilterInfo: getAllFilterInfo,
	whenBound: whenBound,
	onTableBound: onTableBound,
	getSemanticTargetsFromTable: fnGetSemanticTargetsFromTable,
	updateBindingInfo: updateBindingInfo,
	clearSelection: clearSelection
};

export default oTableUtils;
