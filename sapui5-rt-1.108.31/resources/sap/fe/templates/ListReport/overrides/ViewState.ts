import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import type ViewState from "sap/fe/core/controllerextensions/ViewState";
import KeepAliveHelper from "sap/fe/core/helpers/KeepAliveHelper";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import CoreLibrary from "sap/fe/core/library";
import * as PropertyFormatters from "sap/fe/core/templating/PropertyFormatters";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import NavLibrary from "sap/fe/navigation/library";
import type ListReportController from "sap/fe/templates/ListReport/ListReportController.controller";
import { system } from "sap/ui/Device";
import ControlVariantApplyAPI from "sap/ui/fl/apply/api/ControlVariantApplyAPI";
import type VariantManagement from "sap/ui/fl/variants/VariantManagement";
import ConditionValidated from "sap/ui/mdc/enum/ConditionValidated";
import FilterBar from "sap/ui/mdc/FilterBar";
import StateUtil from "sap/ui/mdc/p13n/StateUtil";
import type JSONModel from "sap/ui/model/json/JSONModel";

const NavType = NavLibrary.NavType,
	VariantManagementType = CoreLibrary.VariantManagement,
	TemplateContentView = CoreLibrary.TemplateContentView,
	InitialLoadMode = CoreLibrary.InitialLoadMode;
const FilterRestrictions = CommonUtils.FilterRestrictions,
	CONDITION_PATH_TO_PROPERTY_PATH_REGEX = /\+|\*/g;

const ViewStateOverride: any = {
	_bSearchTriggered: false,
	applyInitialStateOnly: function () {
		return true;
	},
	onBeforeStateApplied: function (this: ViewState & typeof ViewStateOverride, aPromises: any) {
		const oView = this.getView(),
			oController = oView.getController() as ListReportController,
			oFilterBar = oController._getFilterBarControl(),
			aTables = oController._getControls("table");
		if (oFilterBar) {
			oFilterBar.setSuspendSelection(true);
			aPromises.push((oFilterBar as any).waitForInitialization());
		}
		aTables.forEach(function (oTable: any) {
			aPromises.push(oTable.initialized());
		});

		delete this._bSearchTriggered;
	},
	onAfterStateApplied: function (this: ViewState) {
		const oController = this.getView().getController() as ListReportController;
		const oFilterBar = oController._getFilterBarControl();
		if (oFilterBar) {
			oFilterBar.setSuspendSelection(false);
		} else if (oController._isFilterBarHidden()) {
			const oInternalModelContext = oController.getView().getBindingContext("internal") as InternalModelContext;
			oInternalModelContext.setProperty("hasPendingFilters", false);
			if (oController._isMultiMode()) {
				oController._getMultiModeControl().setCountsOutDated(true);
			}
		}
	},
	adaptBindingRefreshControls: function (this: ViewState, aControls: any) {
		const oView = this.getView(),
			oController = oView.getController() as ListReportController,
			aViewControls = oController._getControls(),
			aControlsToRefresh = KeepAliveHelper.getControlsForRefresh(oView, aViewControls);

		Array.prototype.push.apply(aControls, aControlsToRefresh);
	},
	adaptStateControls: function (this: ViewState & typeof ViewStateOverride, aStateControls: any) {
		const oView = this.getView(),
			oController = oView.getController() as ListReportController,
			oViewData = oView.getViewData(),
			bControlVM = oViewData.variantManagement === VariantManagementType.Control;

		const oFilterBarVM = this._getFilterBarVM(oView);
		if (oFilterBarVM) {
			aStateControls.push(oFilterBarVM);
		}
		if (oController._isMultiMode()) {
			aStateControls.push(oController._getMultiModeControl());
		}
		oController._getControls("table").forEach(function (oTable: any) {
			const oQuickFilter = oTable.getQuickFilter();
			if (oQuickFilter) {
				aStateControls.push(oQuickFilter);
			}
			if (bControlVM) {
				aStateControls.push(oTable.getVariant());
			}
			aStateControls.push(oTable);
		});
		if (oController._getControls("Chart")) {
			oController._getControls("Chart").forEach(function (oChart: any) {
				aStateControls.push(oChart);
			});
		}
		if (oController._hasMultiVisualizations()) {
			aStateControls.push(oController._getSegmentedButton(TemplateContentView.Chart));
			aStateControls.push(oController._getSegmentedButton(TemplateContentView.Table));
		}
		const oFilterBar = oController._getFilterBarControl();
		if (oFilterBar) {
			aStateControls.push(oFilterBar);
		}
		aStateControls.push(oView.byId("fe::ListReport"));
	},
	retrieveAdditionalStates: function (this: ViewState & typeof ViewStateOverride, mAdditionalStates: any) {
		const oView = this.getView(),
			oController = oView.getController() as ListReportController,
			bPendingFilter = (oView.getBindingContext("internal") as InternalModelContext).getProperty("hasPendingFilters");

		mAdditionalStates.dataLoaded = !bPendingFilter || !!this._bSearchTriggered;
		if (oController._hasMultiVisualizations()) {
			const sAlpContentView = oView.getBindingContext("internal").getProperty("alpContentView");
			mAdditionalStates.alpContentView = sAlpContentView;
		}

		delete this._bSearchTriggered;
	},
	applyAdditionalStates: function (this: ViewState & typeof ViewStateOverride, oAdditionalStates: any) {
		const oView = this.getView(),
			oController = oView.getController() as ListReportController,
			oFilterBar = oController._getFilterBarControl();

		if (oAdditionalStates) {
			// explicit check for boolean values - 'undefined' should not alter the triggered search property
			if (oAdditionalStates.dataLoaded === false && oFilterBar) {
				// without this, the data is loaded on navigating back
				(oFilterBar as any)._bSearchTriggered = false;
			} else if (oAdditionalStates.dataLoaded === true) {
				if (oFilterBar) {
					oFilterBar.triggerSearch();
				}
				this._bSearchTriggered = true;
			}
			if (oController._hasMultiVisualizations()) {
				const oInternalModelContext = oView.getBindingContext("internal") as InternalModelContext;
				if (!system.desktop && oAdditionalStates.alpContentView == TemplateContentView.Hybrid) {
					oAdditionalStates.alpContentView = TemplateContentView.Chart;
				}
				(oInternalModelContext.getModel() as JSONModel).setProperty(
					`${oInternalModelContext.getPath()}/alpContentView`,
					oAdditionalStates.alpContentView
				);
			}
		}
	},
	_applyNavigationParametersToFilterbar: function (this: ViewState & typeof ViewStateOverride, oNavigationParameter: any, aResults: any) {
		const oView = this.getView();
		const oController = oView.getController() as ListReportController;
		const oAppComponent = oController.getAppComponent();
		const oComponentData = oAppComponent.getComponentData();
		const oStartupParameters = (oComponentData && oComponentData.startupParameters) || {};
		const oVariantPromise = this.handleVariantIdPassedViaURLParams(oStartupParameters);
		let bFilterVariantApplied: boolean;
		aResults.push(
			oVariantPromise
				.then((aVariants: any[]) => {
					if (aVariants && aVariants.length > 0) {
						if (aVariants[0] === true || aVariants[1] === true) {
							bFilterVariantApplied = true;
						}
					}
					return this._applySelectionVariant(oView, oNavigationParameter, bFilterVariantApplied);
				})
				.then(() => {
					const oDynamicPage = oController._getDynamicListReportControl();
					let bPreventInitialSearch = false;
					const oFilterBarVM = this._getFilterBarVM(oView);
					const oFilterBarControl = oController._getFilterBarControl();
					if (oFilterBarControl) {
						if (
							(oNavigationParameter.navigationType !== NavType.initial && oNavigationParameter.requiresStandardVariant) ||
							(!oFilterBarVM && oView.getViewData().initialLoad === InitialLoadMode.Enabled) ||
							oController._shouldAutoTriggerSearch(oFilterBarVM)
						) {
							oFilterBarControl.triggerSearch();
						} else {
							bPreventInitialSearch = this._preventInitialSearch(oFilterBarVM);
						}
						// reset the suspend selection on filter bar to allow loading of data when needed (was set on LR Init)
						oFilterBarControl.setSuspendSelection(false);
						this._bSearchTriggered = !bPreventInitialSearch;
						oDynamicPage.setHeaderExpanded(system.desktop || bPreventInitialSearch);
					}
				})
				.catch(function () {
					Log.error("Variant ID cannot be applied");
				})
		);
	},

	handleVariantIdPassedViaURLParams: function (this: ViewState & typeof ViewStateOverride, oUrlParams: any) {
		const aPageVariantId = oUrlParams["sap-ui-fe-variant-id"],
			aFilterBarVariantId = oUrlParams["sap-ui-fe-filterbar-variant-id"],
			aTableVariantId = oUrlParams["sap-ui-fe-table-variant-id"];
		let oVariant;
		if (aPageVariantId || aFilterBarVariantId || aTableVariantId) {
			oVariant = {
				sPageVariantId: aPageVariantId && aPageVariantId[0],
				sFilterBarVariantId: aFilterBarVariantId && aFilterBarVariantId[0],
				sTableVariantId: aTableVariantId && aTableVariantId[0]
			};
		}
		return this._handleControlVariantId(oVariant);
	},

	_handleControlVariantId: function (this: ViewState & typeof ViewStateOverride, oVariantIDs: any) {
		let oVM: VariantManagement;
		const oView = this.getView(),
			aPromises: any[] = [];
		const sVariantManagement = oView.getViewData().variantManagement;
		if (oVariantIDs && oVariantIDs.sPageVariantId && sVariantManagement === "Page") {
			oVM = oView.byId("fe::PageVariantManagement");
			oVM.getVariants().forEach((oVariant: any) => {
				if (oVariant.key === oVariantIDs.sPageVariantId) {
					aPromises.push(this._applyControlVariant(oVM, oVariantIDs.sPageVariantId, true));
				}
			});
		} else if (oVariantIDs && sVariantManagement === "Control") {
			if (oVariantIDs.sFilterBarVariantId) {
				oVM = oView.getController()._getFilterBarVariantControl();
				if (oVM) {
					oVM.getVariants().forEach((oVariant: any) => {
						if (oVariant.key === oVariantIDs.sFilterBarVariantId) {
							aPromises.push(this._applyControlVariant(oVM, oVariantIDs.sFilterBarVariantId, true));
						}
					});
				}
			}
			if (oVariantIDs.sTableVariantId) {
				const oController = oView.getController(),
					aTables = oController._getControls("table");
				aTables.forEach((oTable: any) => {
					const oTableVariant = oTable.getVariant();
					if (oTable && oTableVariant) {
						oTableVariant.getVariants().forEach((oVariant: any) => {
							if (oVariant.key === oVariantIDs.sTableVariantId) {
								aPromises.push(this._applyControlVariant(oTableVariant, oVariantIDs.sTableVariantId));
							}
						});
					}
				});
			}
		}
		return Promise.all(aPromises);
	},

	_applyControlVariant: function (oVariant: any, sVariantID: any, bFilterVariantApplied: any) {
		const sVariantReference = this._checkIfVariantIdIsAvailable(oVariant, sVariantID) ? sVariantID : oVariant.getStandardVariantKey();
		const oVM = ControlVariantApplyAPI.activateVariant({
			element: oVariant,
			variantReference: sVariantReference
		});
		return oVM.then(function () {
			return bFilterVariantApplied;
		});
	},
	/************************************* private helper *****************************************/

	_getFilterBarVM: function (oView: any) {
		const oViewData = oView.getViewData();
		switch (oViewData.variantManagement) {
			case VariantManagementType.Page:
				return oView.byId("fe::PageVariantManagement");
			case VariantManagementType.Control:
				return oView.getController()._getFilterBarVariantControl();
			case VariantManagementType.None:
				return null;
			default:
				throw new Error(`unhandled variant setting: ${oViewData.variantManagement}`);
		}
	},

	_preventInitialSearch: function (oVariantManagement: any) {
		if (!oVariantManagement) {
			return true;
		}
		const aVariants = oVariantManagement.getVariants();
		const oCurrentVariant = aVariants.find(function (oItem: any) {
			return oItem.key === oVariantManagement.getCurrentVariantKey();
		});
		return !oCurrentVariant.executeOnSelect;
	},

	_applySelectionVariant: function (oView: any, oNavigationParameter: any, bFilterVariantApplied: any) {
		const oFilterBar = oView.getController()._getFilterBarControl(),
			oSelectionVariant = oNavigationParameter.selectionVariant,
			oSelectionVariantDefaults = oNavigationParameter.selectionVariantDefaults;
		if (!oFilterBar || !oSelectionVariant) {
			return Promise.resolve();
		}
		let oConditions = {};
		const oMetaModel = oView.getModel().getMetaModel();
		const oViewData = oView.getViewData();
		const sContextPath = oViewData.contextPath || `/${oViewData.entitySet}`;
		const aMandatoryFilterFields = CommonUtils.getMandatoryFilterFields(oMetaModel, sContextPath);
		const bUseSemanticDateRange = oFilterBar.data("useSemanticDateRange");
		let oVariant;
		switch (oViewData.variantManagement) {
			case VariantManagementType.Page:
				oVariant = oView.byId("fe::PageVariantManagement");
				break;
			case VariantManagementType.Control:
				oVariant = oView.getController()._getFilterBarVariantControl();
				break;
			case VariantManagementType.None:
			default:
				break;
		}
		const bRequiresStandardVariant = oNavigationParameter.requiresStandardVariant;
		// check if FLP default values are there and is it standard variant
		const bIsFLPValuePresent: boolean =
			oSelectionVariantDefaults &&
			oSelectionVariantDefaults.getSelectOptionsPropertyNames().length > 0 &&
			oVariant.getDefaultVariantKey() === oVariant.getStandardVariantKey() &&
			oNavigationParameter.bNavSelVarHasDefaultsOnly;

		// get conditions when FLP value is present
		if (bFilterVariantApplied || bIsFLPValuePresent) {
			oConditions = oFilterBar.getConditions();
		}
		CommonUtils.addDefaultDisplayCurrency(aMandatoryFilterFields, oSelectionVariant, oSelectionVariantDefaults);
		CommonUtils.addSelectionVariantToConditions(
			oSelectionVariant,
			oConditions,
			oMetaModel,
			sContextPath,
			bIsFLPValuePresent,
			bUseSemanticDateRange,
			oViewData
		);

		return this._activateSelectionVariant(
			oFilterBar,
			oConditions,
			oVariant,
			bRequiresStandardVariant,
			bFilterVariantApplied,
			bIsFLPValuePresent
		);
	},
	_activateSelectionVariant: function (
		oFilterBar: any,
		oConditions: any,
		oVariant: any,
		bRequiresStandardVariant: any,
		bFilterVariantApplied: any,
		bIsFLPValuePresent?: boolean
	) {
		let oPromise;

		if (oVariant && !bFilterVariantApplied) {
			let oVariantKey = bRequiresStandardVariant ? oVariant.getStandardVariantKey() : oVariant.getDefaultVariantKey();
			if (oVariantKey === null) {
				oVariantKey = oVariant.getId();
			}
			oPromise = ControlVariantApplyAPI.activateVariant({
				element: oVariant,
				variantReference: oVariantKey
			}).then(function () {
				return bRequiresStandardVariant || oVariant.getDefaultVariantKey() === oVariant.getStandardVariantKey();
			});
		} else {
			oPromise = Promise.resolve(true);
		}
		return oPromise.then((bClearFilterAndReplaceWithAppState: any) => {
			if (bClearFilterAndReplaceWithAppState) {
				return this._fnApplyConditions(oFilterBar, oConditions, bIsFLPValuePresent);
			}
		});
	},

	/*
	 * Sets filtered: false flag to every field so that it can be cleared out
	 *
	 * @param oFilterBar filterbar control is used to display filter properties in a user-friendly manner to populate values for a query
	 * @returns promise which will be resolved to object
	 * @private
	 */
	_fnClearStateBeforexAppNav: async function (oFilterBar: FilterBar) {
		return await StateUtil.retrieveExternalState(oFilterBar)
			.then((oExternalState: any) => {
				const oCondition = oExternalState.filter;
				for (const field in oCondition) {
					if (field !== "$editState" && field !== "$search" && oCondition[field]) {
						oCondition[field].forEach((condition: Record<string, boolean>) => {
							condition["filtered"] = false;
						});
					}
				}
				return Promise.resolve(oCondition);
			})
			.catch(function (oError: any) {
				Log.error("Error while retrieving the external state", oError);
			});
	},

	_fnApplyConditions: async function (oFilterBar: any, oConditions: any, bIsFLPValuePresent?: boolean) {
		const mFilter: any = {},
			aItems: any[] = [],
			fnAdjustValueHelpCondition = function (oCondition: any) {
				// in case the condition is meant for a field having a VH, the format required by MDC differs
				oCondition.validated = ConditionValidated.Validated;
				if (oCondition.operator === "Empty") {
					oCondition.operator = "EQ";
					oCondition.values = [""];
				} else if (oCondition.operator === "NotEmpty") {
					oCondition.operator = "NE";
					oCondition.values = [""];
				}
				delete oCondition.isEmpty;
			};
		const fnGetPropertyInfo = function (oFilterControl: any, sEntityTypePath: any) {
			const sEntitySetPath = ModelHelper.getEntitySetPath(sEntityTypePath),
				oMetaModel = oFilterControl.getModel().getMetaModel(),
				oFR = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oMetaModel),
				aNonFilterableProps = oFR[FilterRestrictions.NON_FILTERABLE_PROPERTIES],
				mFilterFields = FilterUtils.getConvertedFilterFields(oFilterControl, sEntityTypePath),
				aPropertyInfo: any[] = [];
			Object.keys(mFilterFields).forEach(function (sFilterFieldKey: string) {
				const oConvertedProperty = mFilterFields[sFilterFieldKey];
				const sPropertyPath = oConvertedProperty.conditionPath.replace(CONDITION_PATH_TO_PROPERTY_PATH_REGEX, "");
				if (aNonFilterableProps.indexOf(sPropertyPath) === -1) {
					const sAnnotationPath = oConvertedProperty.annotationPath;
					const oPropertyContext = oMetaModel.createBindingContext(sAnnotationPath);
					aPropertyInfo.push({
						path: oConvertedProperty.conditionPath,
						hiddenFilter: oConvertedProperty.availability === "Hidden",
						hasValueHelp: !sAnnotationPath
							? false
							: PropertyFormatters.hasValueHelp(oPropertyContext.getObject(), { context: oPropertyContext })
					});
				}
			});
			return aPropertyInfo;
		};

		return oFilterBar.waitForInitialization().then(async () => {
			const sEntityTypePath = DelegateUtil.getCustomData(oFilterBar, "entityType");
			// During external app navigation, we have to clear the existing conditions to avoid merging of values coming from annotation and context
			// Condition !bIsFLPValuePresent indicates it's external app navigation
			if (!bIsFLPValuePresent) {
				const oClearConditions = await this._fnClearStateBeforexAppNav(oFilterBar);
				await StateUtil.applyExternalState(oFilterBar, {
					filter: oClearConditions,
					items: aItems
				});
			}
			const aPropertyInfo = fnGetPropertyInfo(oFilterBar, sEntityTypePath);
			aPropertyInfo
				.filter(function (oPropertyInfo: any) {
					return oPropertyInfo.path !== "$editState" && oPropertyInfo.path !== "$search";
				})
				.forEach(function (oPropertyInfo: any) {
					if (oPropertyInfo.path in oConditions) {
						mFilter[oPropertyInfo.path] = oConditions[oPropertyInfo.path];
						if (!oPropertyInfo.hiddenFilter) {
							aItems.push({ name: oPropertyInfo.path });
						}
						if (oPropertyInfo.hasValueHelp) {
							mFilter[oPropertyInfo.path].forEach(fnAdjustValueHelpCondition);
						} else {
							mFilter[oPropertyInfo.path].forEach(function (oCondition: any) {
								oCondition.validated = oCondition.filtered ? ConditionValidated.NotValidated : oCondition.validated;
							});
						}
					} else {
						mFilter[oPropertyInfo.path] = [];
					}
				});
			return StateUtil.applyExternalState(oFilterBar, { filter: mFilter, items: aItems });
		});
	}
};

export default ViewStateOverride;
