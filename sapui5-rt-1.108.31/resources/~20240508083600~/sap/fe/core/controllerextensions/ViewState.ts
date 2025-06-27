import Log from "sap/base/Log";
import mergeObjects from "sap/base/util/merge";
import CommonUtils from "sap/fe/core/CommonUtils";
import { defineUI5Class, extensible, finalExtension, privateExtension, publicExtension } from "sap/fe/core/helpers/ClassSupport";
import KeepAliveHelper from "sap/fe/core/helpers/KeepAliveHelper";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import type PageController from "sap/fe/core/PageController";
import NavLibrary from "sap/fe/navigation/library";
import type ManagedObject from "sap/ui/base/ManagedObject";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import ControlVariantApplyAPI from "sap/ui/fl/apply/api/ControlVariantApplyAPI";
import { ConditionObject } from "sap/ui/mdc/condition/Condition";
import StateUtil from "sap/ui/mdc/p13n/StateUtil";
// additionalStates are stored next to control IDs, so name clash avoidance needed. Fortunately IDs have restrictions:
// "Allowed is a sequence of characters (capital/lowercase), digits, underscores, dashes, points and/or colons."
// Therefore adding a symbol like # or @
const ADDITIONAL_STATES_KEY = "#additionalStates",
	NavType = NavLibrary.NavType;
///////////////////////////////////////////////////////////////////
// methods to retrieve & apply states for the different controls //
///////////////////////////////////////////////////////////////////
const _mControlStateHandlerMap: Record<string, any> = {
	"sap.ui.fl.variants.VariantManagement": {
		retrieve: function (oVM: any) {
			return {
				"variantId": oVM.getCurrentVariantKey()
			};
		},
		apply: function (oVM: any, oControlState: any) {
			if (oControlState && oControlState.variantId !== undefined && oControlState.variantId !== oVM.getCurrentVariantKey()) {
				const sVariantReference = this._checkIfVariantIdIsAvailable(oVM, oControlState.variantId)
					? oControlState.variantId
					: oVM.getStandardVariantKey();
				return ControlVariantApplyAPI.activateVariant({
					element: oVM,
					variantReference: sVariantReference
				});
			}
		}
	},
	"sap.m.IconTabBar": {
		retrieve: function (oTabBar: any) {
			return {
				selectedKey: oTabBar.getSelectedKey()
			};
		},
		apply: function (oTabBar: any, oControlState: any) {
			if (oControlState && oControlState.selectedKey) {
				const oSelectedItem = oTabBar.getItems().find(function (oItem: any) {
					return oItem.getKey() === oControlState.selectedKey;
				});
				if (oSelectedItem) {
					oTabBar.setSelectedItem(oSelectedItem);
				}
			}
		}
	},
	"sap.ui.mdc.FilterBar": {
		retrieve: function (oFilterBar: any) {
			return StateUtil.retrieveExternalState(oFilterBar).then(function (mFilterBarState: any) {
				// remove sensitive or view state irrelevant fields
				const aPropertiesInfo = oFilterBar.getPropertyInfoSet(),
					mFilter = mFilterBarState.filter || {};
				aPropertiesInfo
					.filter(function (oPropertyInfo: any) {
						return (
							mFilter[oPropertyInfo.path] && (oPropertyInfo.removeFromAppState || mFilter[oPropertyInfo.path].length === 0)
						);
					})
					.forEach(function (oPropertyInfo: any) {
						delete mFilter[oPropertyInfo.path];
					});
				return mFilterBarState;
			});
		},
		apply: async function (oFilterBar: any, oControlState: any) {
			if (oControlState) {
				// When we have a single valued filterfield then it is FE responsibility to clear the default conditions and apply the state
				const aPropertiesInfo = oFilterBar.getPropertyInfoSet();
				//fetching default conditions
				try {
					const oState = await StateUtil.retrieveExternalState(oFilterBar);
					Object.keys(oState.filter).forEach(function (sKey: string) {
						for (let i = 0; i < aPropertiesInfo.length; i++) {
							const propertyInfo = aPropertiesInfo[i];
							//clear the conditions only if it is single valued field
							if (
								sKey !== "$editState" &&
								sKey !== "$search" &&
								propertyInfo["key"] === sKey &&
								propertyInfo["maxConditions"] <= 1
							) {
								oState.filter[sKey].forEach(function (oCondition: ConditionObject) {
									oCondition.filtered = false;
								});
								// merge the cleared conditions with the apstate conditions
								if (oControlState.filter[sKey]) {
									oControlState.filter[sKey] = [...oControlState.filter[sKey], ...oState.filter[sKey]];
								} else {
									oControlState.filter[sKey] = oState.filter[sKey] || [];
								}
							}
						}
					});
					return StateUtil.applyExternalState(oFilterBar, oControlState);
				} catch (e: any) {
					Log.error("Filterbar apply failed because of StateUtil.retrieveExternalState: " + e);
				}
			}
		}
	},
	"sap.ui.mdc.Table": {
		retrieve: function (oTable: any) {
			return StateUtil.retrieveExternalState(oTable);
		},
		apply: function (oTable: any, oControlState: any) {
			if (oControlState) {
				if (!oControlState.supplementaryConfig) {
					oControlState.supplementaryConfig = {};
				}
				return StateUtil.applyExternalState(oTable, oControlState);
			}
		},
		refreshBinding: function (oTable: any) {
			const oTableBinding = oTable.getRowBinding();
			if (oTableBinding) {
				const oRootBinding = oTableBinding.getRootBinding();
				if (oRootBinding === oTableBinding) {
					// absolute binding
					oTableBinding.refresh();
				} else {
					// relative binding
					const oHeaderContext = oTableBinding.getHeaderContext();
					const sGroupId = oTableBinding.getGroupId();

					if (oHeaderContext) {
						oHeaderContext.requestSideEffects([{ $NavigationPropertyPath: "" }], sGroupId);
					}
				}
			} else {
				Log.info(`Table: ${oTable.getId()} was not refreshed. No binding found!`);
			}
		}
	},
	"sap.ui.mdc.Chart": {
		retrieve: function (oChart: any) {
			return StateUtil.retrieveExternalState(oChart);
		},
		apply: function (oChart: any, oControlState: any) {
			if (oControlState) {
				return StateUtil.applyExternalState(oChart, oControlState);
			}
		}
	},
	"sap.uxap.ObjectPageLayout": {
		retrieve: function (oOPLayout: any) {
			return {
				selectedSection: oOPLayout.getSelectedSection()
			};
		},
		apply: function (oOPLayout: any, oControlState: any) {
			if (oControlState) {
				oOPLayout.setSelectedSection(oControlState.selectedSection);
			}
		},
		refreshBinding: function (oOPLayout: any) {
			const oBindingContext = oOPLayout.getBindingContext();
			const oBinding = oBindingContext && oBindingContext.getBinding();
			if (oBinding) {
				const sMetaPath = ModelHelper.getMetaPathForContext(oBindingContext);
				const sStrategy = KeepAliveHelper.getControlRefreshStrategyForContextPath(oOPLayout, sMetaPath);
				if (sStrategy === "self") {
					// Refresh main context and 1-1 navigation properties or OP
					const oModel = oBindingContext.getModel(),
						oMetaModel = oModel.getMetaModel(),
						oNavigationProperties =
							CommonUtils.getContextPathProperties(oMetaModel, sMetaPath, {
								$kind: "NavigationProperty"
							}) || {},
						aNavPropertiesToRequest = Object.keys(oNavigationProperties).reduce(function (aPrev: any[], sNavProp: string) {
							if (oNavigationProperties[sNavProp].$isCollection !== true) {
								aPrev.push({ $NavigationPropertyPath: sNavProp });
							}
							return aPrev;
						}, []),
						aProperties = [{ $PropertyPath: "*" }],
						sGroupId = oBinding.getGroupId();

					oBindingContext.requestSideEffects(aProperties.concat(aNavPropertiesToRequest), sGroupId);
				} else if (sStrategy === "includingDependents") {
					// Complete refresh
					oBinding.refresh();
				}
			} else {
				Log.info(`ObjectPage: ${oOPLayout.getId()} was not refreshed. No binding found!`);
			}
		}
	},
	"sap.fe.macros.table.QuickFilterContainer": {
		retrieve: function (oQuickFilter: any) {
			return {
				selectedKey: oQuickFilter.getSelectorKey()
			};
		},
		apply: function (oQuickFilter: any, oControlState: any) {
			if (oControlState) {
				oQuickFilter.setSelectorKey(oControlState.selectedKey);
			}
		}
	},
	"sap.m.SegmentedButton": {
		retrieve: function (oSegmentedButton: any) {
			return {
				selectedKey: oSegmentedButton.getSelectedKey()
			};
		},
		apply: function (oSegmentedButton: any, oControlState: any) {
			if (oControlState) {
				oSegmentedButton.setSelectedKey(oControlState.selectedKey);
			}
		}
	},
	"sap.m.Select": {
		retrieve: function (oSelect: any) {
			return {
				selectedKey: oSelect.getSelectedKey()
			};
		},
		apply: function (oSelect: any, oControlState: any) {
			if (oControlState) {
				oSelect.setSelectedKey(oControlState.selectedKey);
			}
		}
	},
	"sap.f.DynamicPage": {
		retrieve: function (oDynamicPage: any) {
			return {
				headerExpanded: oDynamicPage.getHeaderExpanded()
			};
		},
		apply: function (oDynamicPage: any, oControlState: any) {
			if (oControlState) {
				oDynamicPage.setHeaderExpanded(oControlState.headerExpanded);
			}
		}
	},
	"sap.ui.core.mvc.View": {
		retrieve: function (oView: any) {
			const oController = oView.getController();
			if (oController && oController.viewState) {
				return oController.viewState.retrieveViewState(oController.viewState);
			}
			return {};
		},
		apply: function (oView: any, oControlState: any, oNavParameters: any) {
			const oController = oView.getController();
			if (oController && oController.viewState) {
				return oController.viewState.applyViewState(oControlState, oNavParameters);
			}
		},
		refreshBinding: function (oView: any) {
			const oController = oView.getController();
			if (oController && oController.viewState) {
				return oController.viewState.refreshViewBindings();
			}
		}
	},
	"sap.ui.core.ComponentContainer": {
		retrieve: function (oComponentContainer: any) {
			const oComponent = oComponentContainer.getComponentInstance();
			if (oComponent) {
				return this.retrieveControlState(oComponent.getRootControl());
			}
			return {};
		},
		apply: function (oComponentContainer: any, oControlState: any, oNavParameters: any) {
			const oComponent = oComponentContainer.getComponentInstance();
			if (oComponent) {
				return this.applyControlState(oComponent.getRootControl(), oControlState, oNavParameters);
			}
		}
	}
};
/**
 * A controller extension offering hooks for state handling
 *
 * If you need to maintain a specific state for your application, you can use the controller extension.
 *
 * @hideconstructor
 * @public
 * @since 1.85.0
 */
@defineUI5Class("sap.fe.core.controllerextensions.ViewState")
class ViewState extends ControllerExtension {
	private _iRetrievingStateCounter: number;
	private _pInitialStateApplied: Promise<unknown>;
	private _pInitialStateAppliedResolve?: Function;
	private base!: PageController;

	/**
	 * Constructor.
	 */
	constructor() {
		super();
		this._iRetrievingStateCounter = 0;
		this._pInitialStateApplied = new Promise((resolve) => {
			this._pInitialStateAppliedResolve = resolve;
		});
	}

	@publicExtension()
	@finalExtension()
	async refreshViewBindings() {
		const aControls = await this.collectResults(this.base.viewState.adaptBindingRefreshControls);
		let oPromiseChain = Promise.resolve();
		aControls
			.filter((oControl: any) => {
				return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
			})
			.forEach((oControl: any) => {
				oPromiseChain = oPromiseChain.then(this.refreshControlBinding.bind(this, oControl));
			});
		return oPromiseChain;
	}
	/**
	 * This function should add all controls relevant for refreshing to the provided control array.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param aCollectedControls The collected controls
	 * @alias sap.fe.core.controllerextensions.ViewState#adaptBindingRefreshControls
	 * @protected
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	adaptBindingRefreshControls(aCollectedControls: ManagedObject[]) {
		// to be overriden
	}

	@privateExtension()
	@finalExtension()
	refreshControlBinding(oControl: any) {
		const oControlRefreshBindingHandler = this.getControlRefreshBindingHandler(oControl);
		let oPromiseChain = Promise.resolve();
		if (typeof oControlRefreshBindingHandler.refreshBinding !== "function") {
			Log.info(`refreshBinding handler for control: ${oControl.getMetadata().getName()} is not provided`);
		} else {
			oPromiseChain = oPromiseChain.then(oControlRefreshBindingHandler.refreshBinding.bind(this, oControl));
		}
		return oPromiseChain;
	}

	/**
	 * Returns a map of <code>refreshBinding</code> function for a certain control.
	 *
	 * @param {sap.ui.base.ManagedObject} oControl The control to get state handler for
	 * @returns {object} A plain object with one function: <code>refreshBinding</code>
	 */

	@privateExtension()
	@finalExtension()
	getControlRefreshBindingHandler(oControl: any): any {
		const oRefreshBindingHandler: any = {};
		if (oControl) {
			for (const sType in _mControlStateHandlerMap) {
				if (oControl.isA(sType)) {
					// pass only the refreshBinding handler in an object so that :
					// 1. Application has access only to refreshBinding and not apply and reterive at this stage
					// 2. Application modifications to the object will be reflected here (as we pass by reference)
					oRefreshBindingHandler["refreshBinding"] = _mControlStateHandlerMap[sType].refreshBinding || {};
					break;
				}
			}
		}
		this.base.viewState.adaptBindingRefreshHandler(oControl, oRefreshBindingHandler);
		return oRefreshBindingHandler;
	}
	/**
	 * Customize the <code>refreshBinding</code> function for a certain control.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param oControl The control for which the refresh handler is adapted.
	 * @param oControlHandler A plain object which can have one function: <code>refreshBinding</code>
	 * @alias sap.fe.core.controllerextensions.ViewState#adaptBindingRefreshHandler
	 * @protected
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	adaptBindingRefreshHandler(oControl: ManagedObject, oControlHandler: any[]) {
		// to be overriden
	}

	/**
	 * Called when the application is suspended due to keep-alive mode.
	 *
	 * @alias sap.fe.core.controllerextensions.ViewState#onSuspend
	 * @public
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	onSuspend() {
		// to be overriden
	}

	/**
	 * Called when the application is restored due to keep-alive mode.
	 *
	 * @alias sap.fe.core.controllerextensions.ViewState#onRestore
	 * @public
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	onRestore() {
		// to be overriden
	}

	/**
	 * Destructor method for objects.
	 */
	destroy() {
		delete this._pInitialStateAppliedResolve;
		super.destroy();
	}

	/**
	 * Helper function to enable multi override. It is adding an additional parameter (array) to the provided
	 * function (and its parameters), that will be evaluated via <code>Promise.all</code>.
	 *
	 * @param fnCall The function to be called
	 * @param args
	 * @returns A promise to be resolved with the result of all overrides
	 */
	@privateExtension()
	@finalExtension()
	collectResults(fnCall: Function, ...args: any[]) {
		const aResults: any[] = [];
		args.push(aResults);
		fnCall.apply(this, args);
		return Promise.all(aResults);
	}

	/**
	 * Customize the <code>retrieve</code> and <code>apply</code> functions for a certain control.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param oControl The control to get state handler for
	 * @param aControlHandler A list of plain objects with two functions: <code>retrieve</code> and <code>apply</code>
	 * @alias sap.fe.core.controllerextensions.ViewState#adaptControlStateHandler
	 * @protected
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	adaptControlStateHandler(oControl: ManagedObject, aControlHandler: object[]) {
		// to be overridden if needed
	}

	/**
	 * Returns a map of <code>retrieve</code> and <code>apply</code> functions for a certain control.
	 *
	 * @param oControl The control to get state handler for
	 * @returns A plain object with two functions: <code>retrieve</code> and <code>apply</code>
	 */
	@privateExtension()
	@finalExtension()
	getControlStateHandler(oControl: any) {
		const aInternalControlStateHandler = [],
			aCustomControlStateHandler: any[] = [];
		if (oControl) {
			for (const sType in _mControlStateHandlerMap) {
				if (oControl.isA(sType)) {
					// avoid direct manipulation of internal _mControlStateHandlerMap
					aInternalControlStateHandler.push(Object.assign({}, _mControlStateHandlerMap[sType]));
					break;
				}
			}
		}
		this.base.viewState.adaptControlStateHandler(oControl, aCustomControlStateHandler);
		return aInternalControlStateHandler.concat(aCustomControlStateHandler);
	}

	/**
	 * This function should add all controls for given view that should be considered for the state handling to the provided control array.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param aCollectedControls The collected controls
	 * @alias sap.fe.core.controllerextensions.ViewState#adaptStateControls
	 * @protected
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	adaptStateControls(aCollectedControls: ManagedObject[]) {
		// to be overridden if needed
	}

	/**
	 * Returns the key to be used for given control.
	 *
	 * @param oControl The control to get state key for
	 * @returns The key to be used for storing the controls state
	 */
	@publicExtension()
	@finalExtension()
	getStateKey(oControl: any) {
		return this.getView().getLocalId(oControl.getId()) || oControl.getId();
	}

	/**
	 * Retrieve the view state of this extensions view.
	 * When this function is called more than once before finishing, all but the final response will resolve to <code>undefined</code>.
	 *
	 * @returns A promise resolving the view state
	 * @alias sap.fe.core.controllerextensions.ViewState#retrieveViewState
	 * @public
	 */
	@publicExtension()
	@finalExtension()
	async retrieveViewState() {
		++this._iRetrievingStateCounter;
		let oViewState: any;

		try {
			await this._pInitialStateApplied;
			const aControls = await this.collectResults(this.base.viewState.adaptStateControls);
			const aResolvedStates = await Promise.all(
				aControls
					.filter(function (oControl: any) {
						return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
					})
					.map((oControl: any) => {
						return this.retrieveControlState(oControl).then((vResult: any) => {
							return {
								key: this.getStateKey(oControl),
								value: vResult
							};
						});
					})
			);
			oViewState = aResolvedStates.reduce(function (oStates: any, mState: any) {
				const oCurrentState: any = {};
				oCurrentState[mState.key] = mState.value;
				return mergeObjects(oStates, oCurrentState);
			}, {});
			const mAdditionalStates = await Promise.resolve(this._retrieveAdditionalStates());
			if (mAdditionalStates && Object.keys(mAdditionalStates).length) {
				oViewState[ADDITIONAL_STATES_KEY] = mAdditionalStates;
			}
		} finally {
			--this._iRetrievingStateCounter;
		}

		return this._iRetrievingStateCounter === 0 ? oViewState : undefined;
	}

	/**
	 * Extend the map of additional states (not control bound) to be added to the current view state of the given view.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param mAdditionalStates The additional state
	 * @alias sap.fe.core.controllerextensions.ViewState#retrieveAdditionalStates
	 * @protected
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	retrieveAdditionalStates(mAdditionalStates: object) {
		// to be overridden if needed
	}

	/**
	 * Returns a map of additional states (not control bound) to be added to the current view state of the given view.
	 *
	 * @returns Additional view states
	 */
	_retrieveAdditionalStates() {
		const mAdditionalStates = {};
		this.base.viewState.retrieveAdditionalStates(mAdditionalStates);
		return mAdditionalStates;
	}

	/**
	 * Returns the current state for the given control.
	 *
	 * @param oControl The object to get the state for
	 * @returns The state for the given control
	 */
	@privateExtension()
	@finalExtension()
	retrieveControlState(oControl: any) {
		const aControlStateHandlers = this.getControlStateHandler(oControl);
		return Promise.all(
			aControlStateHandlers.map((mControlStateHandler: any) => {
				if (typeof mControlStateHandler.retrieve !== "function") {
					throw new Error(`controlStateHandler.retrieve is not a function for control: ${oControl.getMetadata().getName()}`);
				}
				return mControlStateHandler.retrieve.call(this, oControl);
			})
		).then((aStates: any[]) => {
			return aStates.reduce(function (oFinalState: any, oCurrentState: any) {
				return mergeObjects(oFinalState, oCurrentState);
			}, {});
		});
	}

	/**
	 * Defines whether the view state should only be applied once initially.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.Instead}.
	 *
	 * Important:
	 * You should only override this method for custom pages and not for the standard ListReportPage and ObjectPage!
	 *
	 * @returns If <code>true</code>, only the initial view state is applied once,
	 * else any new view state is also applied on follow-up calls (default)
	 * @alias sap.fe.core.controllerextensions.ViewState#applyInitialStateOnly
	 * @protected
	 */
	@publicExtension()
	@extensible(OverrideExecution.Instead)
	applyInitialStateOnly() {
		return true;
	}
	/**
	 * Applies the given view state to this extensions view.
	 *
	 * @param oViewState The view state to apply (can be undefined)
	 * @param oNavParameter The current navigation parameter
	 * @param oNavParameter.navigationType The actual navigation type
	 * @param oNavParameter.selectionVariant The selectionVariant from the navigation
	 * @param oNavParameter.selectionVariantDefaults The selectionVariant defaults from the navigation
	 * @param oNavParameter.requiresStandardVariant Defines whether the standard variant must be used in variant management
	 * @returns Promise for async state handling
	 * @alias sap.fe.core.controllerextensions.ViewState#applyViewState
	 * @public
	 */
	@publicExtension()
	@finalExtension()
	async applyViewState(
		oViewState: any,
		oNavParameter: {
			navigationType: any;
			selectionVariant?: object;
			selectionVariantDefaults?: object;
			requiresStandardVariant?: boolean;
		}
	): Promise<any> {
		if (this.base.viewState.applyInitialStateOnly() && this._getInitialStateApplied()) {
			return;
		}

		try {
			await this.collectResults(this.base.viewState.onBeforeStateApplied);
			const aControls = await this.collectResults(this.base.viewState.adaptStateControls);
			let oPromiseChain = Promise.resolve();
			aControls
				.filter(function (oControl: any) {
					return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
				})
				.forEach((oControl: any) => {
					const sKey = this.getStateKey(oControl);
					oPromiseChain = oPromiseChain.then(
						this.applyControlState.bind(this, oControl, oViewState ? oViewState[sKey] : undefined, oNavParameter)
					);
				});
			await oPromiseChain;
			if (oNavParameter.navigationType === NavType.iAppState) {
				await this.collectResults(
					this.base.viewState.applyAdditionalStates,
					oViewState ? oViewState[ADDITIONAL_STATES_KEY] : undefined
				);
			} else {
				await this.collectResults(this.base.viewState.applyNavigationParameters, oNavParameter);
				await this.collectResults(this.base.viewState._applyNavigationParametersToFilterbar, oNavParameter);
			}
		} finally {
			try {
				await this.collectResults(this.base.viewState.onAfterStateApplied);
				this._setInitialStateApplied();
			} catch (e: any) {
				Log.error(e);
			}
		}
	}

	@privateExtension()
	_checkIfVariantIdIsAvailable(oVM: any, sVariantId: any) {
		const aVariants = oVM.getVariants();
		let bIsControlStateVariantAvailable = false;
		aVariants.forEach(function (oVariant: any) {
			if (oVariant.key === sVariantId) {
				bIsControlStateVariantAvailable = true;
			}
		});
		return bIsControlStateVariantAvailable;
	}

	_setInitialStateApplied() {
		if (this._pInitialStateAppliedResolve) {
			const pInitialStateAppliedResolve = this._pInitialStateAppliedResolve;
			delete this._pInitialStateAppliedResolve;
			pInitialStateAppliedResolve();
		}
	}
	_getInitialStateApplied() {
		return !this._pInitialStateAppliedResolve;
	}

	/**
	 * Hook to react before a state for given view is applied.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param aPromises Extensible array of promises to be resolved before continuing
	 * @alias sap.fe.core.controllerextensions.ViewState#onBeforeStateApplied
	 * @protected
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onBeforeStateApplied(aPromises: Promise<any>) {
		// to be overriden
	}

	/**
	 * Hook to react when state for given view was applied.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param aPromises Extensible array of promises to be resolved before continuing
	 * @alias sap.fe.core.controllerextensions.ViewState#onAfterStateApplied
	 * @protected
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onAfterStateApplied(aPromises: Promise<any>) {
		// to be overriden
	}

	/**
	 * Applying additional, not control related, states - is called only if navigation type is iAppState.
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param oViewState The current view state
	 * @param aPromises Extensible array of promises to be resolved before continuing
	 * @alias sap.fe.core.controllerextensions.ViewState#applyAdditionalStates
	 * @protected
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	applyAdditionalStates(oViewState: object, aPromises: Promise<any>) {
		// to be overridden if needed
	}

	@privateExtension()
	_applyNavigationParametersToFilterbar(
		_oNavParameter: {
			navigationType: any;
			selectionVariant?: object | undefined;
			selectionVariantDefaults?: object | undefined;
			requiresStandardVariant?: boolean | undefined;
		},
		_aPromises: Promise<any>
	) {
		// to be overridden if needed
	}

	/**
	 * Apply navigation parameters is not called if the navigation type is iAppState
	 *
	 * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
	 * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
	 *
	 * @param oNavParameter The current navigation parameter
	 * @param oNavParameter.navigationType The actual navigation type
	 * @param [oNavParameter.selectionVariant] The selectionVariant from the navigation
	 * @param [oNavParameter.selectionVariantDefaults] The selectionVariant defaults from the navigation
	 * @param [oNavParameter.requiresStandardVariant] Defines whether the standard variant must be used in variant management
	 * @param aPromises Extensible array of promises to be resolved before continuing
	 * @alias sap.fe.core.controllerextensions.ViewState#applyNavigationParameters
	 * @protected
	 */
	@publicExtension()
	@extensible(OverrideExecution.After)
	applyNavigationParameters(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		oNavParameter: {
			navigationType: any;
			selectionVariant?: object | undefined;
			selectionVariantDefaults?: object | undefined;
			requiresStandardVariant?: boolean | undefined;
		},
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		aPromises: Promise<any>
	) {
		// to be overridden if needed
	}

	/**
	 * Applying the given state to the given control.
	 *
	 * @param oControl The object to apply the given state
	 * @param oControlState The state for the given control
	 * @param [oNavParameters] The current navigation parameters
	 * @returns Return a promise for async state handling
	 */
	@privateExtension()
	@finalExtension()
	applyControlState(oControl: any, oControlState: object, oNavParameters?: object) {
		const aControlStateHandlers = this.getControlStateHandler(oControl);
		let oPromiseChain = Promise.resolve();
		aControlStateHandlers.forEach((mControlStateHandler: any) => {
			if (typeof mControlStateHandler.apply !== "function") {
				throw new Error(`controlStateHandler.apply is not a function for control: ${oControl.getMetadata().getName()}`);
			}
			oPromiseChain = oPromiseChain.then(mControlStateHandler.apply.bind(this, oControl, oControlState, oNavParameters));
		});
		return oPromiseChain;
	}
	getInterface() {
		return this;
	}
}

export default ViewState;
