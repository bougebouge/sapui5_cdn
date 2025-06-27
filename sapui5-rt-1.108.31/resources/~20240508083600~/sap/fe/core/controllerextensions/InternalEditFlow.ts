import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";
import BusyLocker from "sap/fe/core/controllerextensions/BusyLocker";
import { send } from "sap/fe/core/controllerextensions/collaboration/ActivitySync";
import { Activity } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import sticky from "sap/fe/core/controllerextensions/editFlow/sticky";
import TransactionHelper from "sap/fe/core/controllerextensions/editFlow/TransactionHelper";
import {
	defineUI5Class,
	extensible,
	finalExtension,
	methodOverride,
	privateExtension,
	publicExtension
} from "sap/fe/core/helpers/ClassSupport";
import EditState from "sap/fe/core/helpers/EditState";
import FELibrary from "sap/fe/core/library";
import type PageController from "sap/fe/core/PageController";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import Text from "sap/m/Text";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import OverrideExecution from "sap/ui/core/mvc/OverrideExecution";
import type View from "sap/ui/core/mvc/View";
import type Table from "sap/ui/mdc/Table";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type Model from "sap/ui/model/Model";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";

const ProgrammingModel = FELibrary.ProgrammingModel,
	DraftStatus = FELibrary.DraftStatus,
	EditMode = FELibrary.EditMode,
	CreationMode = FELibrary.CreationMode;

@defineUI5Class("sap.fe.core.controllerextensions.InternalEditFlow")
class InternalEditFlow extends ControllerExtension {
	protected base!: PageController;
	private _oAppComponent!: AppComponent;
	private _pTasks: any;
	private oActionPromise?: Promise<any>;
	private _oTransactionHelper?: TransactionHelper;
	private fnDirtyStateProvider?: Function;
	private fnHandleSessionTimeout?: Function;
	private fnStickyDiscardAfterNavigation?: Function;
	@methodOverride()
	onInit() {
		this._oAppComponent = this.base.getAppComponent();
	}

	/**
	 * Override to set the creation mode.
	 *
	 * @param bCreationMode
	 * @memberof sap.fe.core.controllerextensions.InternalEditFlow
	 * @alias sap.fe.core.controllerextensions.InternalEditFlow#setCreationMode
	 * @since 1.90.0
	 */
	@privateExtension()
	@extensible(OverrideExecution.After)
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	setCreationMode(bCreationMode: boolean) {
		// to be overridden
	}
	@publicExtension()
	@finalExtension()
	createMultipleDocuments(
		oListBinding: any,
		aData: any,
		bCreateAtEnd: any,
		bFromCopyPaste: boolean,
		beforeCreateCallBack: any,
		bInactive = false
	) {
		const transactionHelper = this.getTransactionHelper(),
			oLockObject = this.getGlobalUIModel(),
			oResourceBundle = (this.getView().getController() as any).oResourceBundle;

		BusyLocker.lock(oLockObject);
		let aFinalContexts: any[] = [];
		return this.syncTask()
			.then(function () {
				return beforeCreateCallBack
					? beforeCreateCallBack({ contextPath: oListBinding && oListBinding.getPath() })
					: Promise.resolve();
			})
			.then(() => {
				const oModel = oListBinding.getModel(),
					oMetaModel = oModel.getMetaModel();
				let sMetaPath: string;

				if (oListBinding.getContext()) {
					sMetaPath = oMetaModel.getMetaPath(`${oListBinding.getContext().getPath()}/${oListBinding.getPath()}`);
				} else {
					sMetaPath = oMetaModel.getMetaPath(oListBinding.getPath());
				}

				this.handleCreateEvents(oListBinding);

				// Iterate on all items and store the corresponding creation promise
				const aCreationPromises = aData.map((mPropertyValues: any) => {
					const mParameters: any = { data: {} };

					mParameters.keepTransientContextOnFailed = false; // currently not fully supported
					mParameters.busyMode = "None";
					mParameters.creationMode = CreationMode.CreationRow;
					mParameters.parentControl = this.getView();
					mParameters.createAtEnd = bCreateAtEnd;
					mParameters.inactive = bInactive;

					// Remove navigation properties as we don't support deep create
					for (const sPropertyPath in mPropertyValues) {
						const oProperty = oMetaModel.getObject(`${sMetaPath}/${sPropertyPath}`);
						if (oProperty && oProperty.$kind !== "NavigationProperty" && mPropertyValues[sPropertyPath]) {
							mParameters.data[sPropertyPath] = mPropertyValues[sPropertyPath];
						}
					}

					return transactionHelper.createDocument(
						oListBinding,
						mParameters,
						oResourceBundle,
						this.getMessageHandler(),
						bFromCopyPaste,
						this.getView()
					);
				});

				return Promise.all(aCreationPromises);
			})
			.then(function (aContexts: any) {
				// transient contexts are reliably removed once oNewContext.created() is resolved
				aFinalContexts = aContexts;
				return Promise.all(
					aContexts.map(function (oNewContext: any) {
						if (!oNewContext.bInactive) {
							return oNewContext.created();
						}
					})
				);
			})
			.then(() => {
				const oBindingContext = this.getView().getBindingContext();

				// if there are transient contexts, we must avoid requesting side effects
				// this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
				// if list binding is refreshed, transient contexts might be lost
				if (!CommonUtils.hasTransientContext(oListBinding)) {
					this._oAppComponent
						.getSideEffectsService()
						.requestSideEffectsForNavigationProperty(oListBinding.getPath(), oBindingContext as Context);
				}
			})
			.catch(function (err: any) {
				Log.error("Error while creating multiple documents.");
				return Promise.reject(err);
			})
			.finally(function () {
				BusyLocker.unlock(oLockObject);
			})
			.then(() => {
				return aFinalContexts;
			});
	}
	@publicExtension()
	@finalExtension()
	deleteMultipleDocuments(aContexts: any, mParameters: any) {
		const oLockObject = this.getGlobalUIModel();
		const oControl = this.getView().byId(mParameters.controlId);
		if (!oControl) {
			throw new Error("parameter controlId missing or incorrect");
		} else {
			mParameters.parentControl = oControl;
		}
		const oListBinding = oControl.getBinding("items") || ((oControl as Table).getRowBinding() as any);
		mParameters.bFindActiveContexts = true;
		BusyLocker.lock(oLockObject);

		return this.deleteDocumentTransaction(aContexts, mParameters)
			.then(() => {
				let oResult;

				// Multiple object deletion is triggered from a list
				// First clear the selection in the table as it's not valid any more
				if (oControl.isA("sap.ui.mdc.Table")) {
					(oControl as any).clearSelection();
				}

				// Then refresh the list-binding (LR), or require side-effects (OP)
				const oBindingContext = this.getView().getBindingContext();
				if ((oListBinding as any).isRoot()) {
					// keep promise chain pending until refresh of listbinding is completed
					oResult = new Promise<void>((resolve) => {
						oListBinding.attachEventOnce("dataReceived", function () {
							resolve();
						});
					});
					oListBinding.refresh();
				} else if (oBindingContext) {
					// if there are transient contexts, we must avoid requesting side effects
					// this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
					// if list binding is refreshed, transient contexts might be lost
					if (!CommonUtils.hasTransientContext(oListBinding)) {
						this._oAppComponent
							.getSideEffectsService()
							.requestSideEffectsForNavigationProperty(oListBinding.getPath(), oBindingContext as Context);
					}
				}

				if (!this._isFclEnabled()) {
					// deleting at least one object should also set the UI to dirty
					EditState.setEditStateDirty();
				}

				send(
					this.getView(),
					Activity.Delete,
					aContexts.map((context: Context) => context.getPath())
				);

				return oResult;
			})
			.catch(function (oError: any) {
				Log.error("Error while deleting the document(s)", oError);
			})
			.finally(function () {
				BusyLocker.unlock(oLockObject);
			});
	}

	/**
	 * Decides if a document is to be shown in display or edit mode.
	 *
	 * @function
	 * @name _computeEditMode
	 * @memberof sap.fe.core.controllerextensions.InternalEditFlow
	 * @param {sap.ui.model.odata.v4.Context} oContext The context to be displayed or edited
	 * @returns {Promise} Promise resolves once the edit mode is computed
	 */

	@publicExtension()
	@finalExtension()
	async computeEditMode(oContext: any): Promise<void> {
		const sCustomAction = this.getInternalModel().getProperty("/sCustomAction");
		const sProgrammingModel = this.getProgrammingModel(oContext);

		if (sProgrammingModel === ProgrammingModel.Draft) {
			try {
				this.setDraftStatus(DraftStatus.Clear);

				const bIsActiveEntity = await oContext.requestObject("IsActiveEntity");
				if (bIsActiveEntity === false) {
					// in case the document is draft set it in edit mode
					this.setEditMode(EditMode.Editable);
					const bHasActiveEntity = await oContext.requestObject("HasActiveEntity");
					this.setEditMode(undefined, !bHasActiveEntity);
				} else {
					// active document, stay on display mode
					this.setEditMode(EditMode.Display, false);
				}
			} catch (oError: any) {
				Log.error("Error while determining the editMode for draft", oError);
				throw oError;
			}
		} else if (sProgrammingModel === ProgrammingModel.Sticky) {
			if (sCustomAction && sCustomAction !== "" && this._hasNewActionForSticky(oContext, this.getView(), sCustomAction)) {
				this.getTransactionHelper()._bCreateMode = true;
				this.getTransactionHelper().handleDocumentModifications();
				this.setEditMode(EditMode.Editable, true);
				EditState.setEditStateDirty();
				this.handleStickyOn(oContext);
				this.getInternalModel().setProperty("/sCustomAction", "");
			}
		}
	}

	/**
	 * Sets the edit mode.
	 *
	 * @param sEditMode
	 * @param bCreationMode CreateMode flag to identify the creation mode
	 */
	@publicExtension()
	@finalExtension()
	setEditMode(sEditMode?: string, bCreationMode?: boolean) {
		// at this point of time it's not meant to release the edit flow for freestyle usage therefore we can
		// rely on the global UI model to exist
		const oGlobalModel = this.getGlobalUIModel();

		if (sEditMode) {
			oGlobalModel.setProperty("/isEditable", sEditMode === "Editable", undefined, true);
		}

		if (bCreationMode !== undefined) {
			// Since setCreationMode is public in EditFlow and can be overriden, make sure to call it via the controller
			// to ensure any overrides are taken into account
			this.setCreationMode(bCreationMode);
		}
	}

	@publicExtension()
	@finalExtension()
	setDraftStatus(sDraftState: any) {
		// at this point of time it's not meant to release the edit flow for freestyle usage therefore we can
		// rely on the global UI model to exist
		(this.base.getView().getModel("ui") as JSONModel).setProperty("/draftStatus", sDraftState, undefined, true);
	}

	@publicExtension()
	@finalExtension()
	getRoutingListener() {
		// at this point of time it's not meant to release the edit flow for FPM custom pages and the routing
		// listener is not yet public therefore keep the logic here for now

		if (this.base._routing) {
			return this.base._routing;
		} else {
			throw new Error("Edit Flow works only with a given routing listener");
		}
	}

	@publicExtension()
	@finalExtension()
	getGlobalUIModel(): JSONModel {
		// at this point of time it's not meant to release the edit flow for freestyle usage therefore we can
		// rely on the global UI model to exist
		return this.base.getView().getModel("ui") as JSONModel;
	}

	/**
	 * Performs a task in sync with other tasks created via this function.
	 * Returns the promise chain of the task.
	 *
	 * @function
	 * @name sap.fe.core.controllerextensions.EditFlow#syncTask
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @static
	 * @param [vTask] Optional, a promise or function to be executed synchronously
	 * @returns Promise resolves once the task is completed
	 * @ui5-restricted
	 * @final
	 */
	@publicExtension()
	@finalExtension()
	syncTask(vTask?: Function | Promise<any>) {
		let fnNewTask;
		if (vTask instanceof Promise) {
			fnNewTask = function () {
				return vTask;
			};
		} else if (typeof vTask === "function") {
			fnNewTask = vTask;
		}

		this._pTasks = this._pTasks || Promise.resolve();
		if (fnNewTask) {
			this._pTasks = this._pTasks.then(fnNewTask).catch(function () {
				return Promise.resolve();
			});
		}

		return this._pTasks;
	}

	@publicExtension()
	@finalExtension()
	getProgrammingModel(oContext?: any): typeof ProgrammingModel {
		return this.getTransactionHelper().getProgrammingModel(oContext);
	}

	@publicExtension()
	@finalExtension()
	deleteDocumentTransaction(oContext: any, mParameters: any) {
		const oResourceBundle = (this.getView().getController() as any).oResourceBundle,
			transactionHelper = this.getTransactionHelper();

		mParameters = mParameters || {};

		// TODO: this setting and removing of contexts shouldn't be in the transaction helper at all
		// for the time being I kept it and provide the internal model context to not break something
		mParameters.internalModelContext = mParameters.controlId
			? sap.ui.getCore().byId(mParameters.controlId)?.getBindingContext("internal")
			: null;

		return this.syncTask()
			.then(
				transactionHelper.deleteDocument.bind(transactionHelper, oContext, mParameters, oResourceBundle, this.getMessageHandler())
			)
			.then(() => {
				const internalModel = this.getInternalModel();
				internalModel.setProperty("/sessionOn", false);
				internalModel.setProperty("/stickySessionToken", undefined);
			})
			.catch(function (oError: any) {
				return Promise.reject(oError);
			});
	}

	/**
	 * Handles the create event: shows messages and in case of a draft, updates the draft indicator.
	 *
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param oBinding OData list binding object
	 */
	@publicExtension()
	@finalExtension()
	handleCreateEvents(oBinding: any) {
		const transactionHelper = this.getTransactionHelper();

		this.setDraftStatus(DraftStatus.Clear);

		oBinding = (oBinding.getBinding && oBinding.getBinding()) || oBinding;
		const sProgrammingModel = this.getProgrammingModel(oBinding);

		oBinding.attachEvent("createSent", () => {
			transactionHelper.handleDocumentModifications();
			if (sProgrammingModel === ProgrammingModel.Draft) {
				this.setDraftStatus(DraftStatus.Saving);
			}
		});
		oBinding.attachEvent("createCompleted", (oEvent: any) => {
			const bSuccess = oEvent.getParameter("success");
			if (sProgrammingModel === ProgrammingModel.Draft) {
				this.setDraftStatus(bSuccess ? DraftStatus.Saved : DraftStatus.Clear);
			}
			this.getMessageHandler().showMessageDialog();
		});
	}

	@publicExtension()
	@finalExtension()
	getTransactionHelper() {
		if (!this._oTransactionHelper) {
			// currently also the transaction helper is locking therefore passing lock object
			this._oTransactionHelper = new TransactionHelper(this._oAppComponent, this.getGlobalUIModel());
		}

		return this._oTransactionHelper;
	}

	@publicExtension()
	@finalExtension()
	getInternalModel(): JSONModel {
		return this.base.getView().getModel("internal") as JSONModel;
	}

	/**
	 * Creates a new promise to wait for an action to be executed
	 *
	 * @function
	 * @name _createActionPromise
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @returns {Function} The resolver function which can be used to externally resolve the promise
	 */

	@publicExtension()
	@finalExtension()
	createActionPromise(sActionName: any, sControlId: any) {
		let fResolver, fRejector;
		this.oActionPromise = new Promise((resolve, reject) => {
			fResolver = resolve;
			fRejector = reject;
		}).then((oResponse: any) => {
			return Object.assign({ controlId: sControlId }, this.getActionResponseDataAndKeys(sActionName, oResponse));
		});
		return { fResolver: fResolver, fRejector: fRejector };
	}

	/**
	 * Gets the getCurrentActionPromise object.
	 *
	 * @function
	 * @name _getCurrentActionPromise
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @returns Returns the promise
	 */
	@publicExtension()
	@finalExtension()
	getCurrentActionPromise() {
		return this.oActionPromise;
	}

	@publicExtension()
	@finalExtension()
	deleteCurrentActionPromise() {
		this.oActionPromise = undefined;
	}

	/**
	 * @function
	 * @name getActionResponseDataAndKeys
	 * @memberof sap.fe.core.controllerextensions.EditFlow
	 * @param sActionName The name of the action that is executed
	 * @param oResponse The bound action's response data or response context
	 * @returns Object with data and names of the key fields of the response
	 */
	@publicExtension()
	@finalExtension()
	getActionResponseDataAndKeys(sActionName: string, oResponse: any) {
		if (Array.isArray(oResponse)) {
			if (oResponse.length === 1) {
				oResponse = oResponse[0].value;
			} else {
				return null;
			}
		}
		if (!oResponse) {
			return null;
		}
		const oView = this.getView(),
			oMetaModel = (oView.getModel().getMetaModel() as any).getData(),
			sActionReturnType =
				oMetaModel && oMetaModel[sActionName] && oMetaModel[sActionName][0] && oMetaModel[sActionName][0].$ReturnType
					? oMetaModel[sActionName][0].$ReturnType.$Type
					: null,
			aKey = sActionReturnType && oMetaModel[sActionReturnType] ? oMetaModel[sActionReturnType].$Key : null;

		return {
			oData: oResponse.getObject(),
			keys: aKey
		};
	}

	@publicExtension()
	@finalExtension()
	getMessageHandler() {
		// at this point of time it's not meant to release the edit flow for FPM custom pages therefore keep
		// the logic here for now

		if (this.base.messageHandler) {
			return this.base.messageHandler;
		} else {
			throw new Error("Edit Flow works only with a given message handler");
		}
	}

	@publicExtension()
	@finalExtension()
	handleStickyOn(oContext: Context) {
		const oAppComponent = CommonUtils.getAppComponent(this.getView());

		try {
			if (oAppComponent === undefined || oContext === undefined) {
				throw new Error("undefined AppComponent or Context for function handleStickyOn");
			}

			if (!oAppComponent.getRouterProxy().hasNavigationGuard()) {
				const sHashTracker = oAppComponent.getRouterProxy().getHash(),
					oInternalModel = this.getInternalModel();

				// Set a guard in the RouterProxy
				// A timeout is necessary, as with deferred creation the hashChanger is not updated yet with
				// the new hash, and the guard cannot be found in the managed history of the router proxy
				setTimeout(function () {
					oAppComponent.getRouterProxy().setNavigationGuard(oContext.getPath().substring(1));
				}, 0);

				// Setting back navigation on shell service, to get the dicard message box in case of sticky
				oAppComponent.getShellServices().setBackNavigation(this.onBackNavigationInSession.bind(this));

				this.fnDirtyStateProvider = this._registerDirtyStateProvider(oAppComponent, oInternalModel, sHashTracker);
				oAppComponent.getShellServices().registerDirtyStateProvider(this.fnDirtyStateProvider);

				// handle session timeout
				const i18nModel = this.getView().getModel("sap.fe.i18n");
				this.fnHandleSessionTimeout = this._attachSessionTimeout(oContext, i18nModel);
				(this.getView().getModel() as any).attachSessionTimeout(this.fnHandleSessionTimeout);

				this.fnStickyDiscardAfterNavigation = this._attachRouteMatched(this, oContext, oAppComponent);
				oAppComponent.getRoutingService().attachRouteMatched(this.fnStickyDiscardAfterNavigation);
			}
		} catch (error) {
			Log.info(error as any);
			return undefined;
		}
		return true;
	}

	@publicExtension()
	@finalExtension()
	handleStickyOff() {
		const oAppComponent = CommonUtils.getAppComponent(this.getView());
		try {
			if (oAppComponent === undefined) {
				throw new Error("undefined AppComponent for function handleStickyOff");
			}

			if (oAppComponent && oAppComponent.getRouterProxy) {
				// If we have exited from the app, CommonUtils.getAppComponent doesn't return a
				// sap.fe.core.AppComponent, hence the 'if' above
				oAppComponent.getRouterProxy().discardNavigationGuard();
			}

			if (this.fnDirtyStateProvider) {
				oAppComponent.getShellServices().deregisterDirtyStateProvider(this.fnDirtyStateProvider);
				this.fnDirtyStateProvider = undefined;
			}

			if (this.getView().getModel() && this.fnHandleSessionTimeout) {
				(this.getView().getModel() as any).detachSessionTimeout(this.fnHandleSessionTimeout);
			}

			oAppComponent.getRoutingService().detachRouteMatched(this.fnStickyDiscardAfterNavigation);
			this.fnStickyDiscardAfterNavigation = undefined;

			this.getTransactionHelper()._bCreateMode = false;
			this.setEditMode(EditMode.Display, false);

			if (oAppComponent) {
				// If we have exited from the app, CommonUtils.getAppComponent doesn't return a
				// sap.fe.core.AppComponent, hence the 'if' above
				oAppComponent.getShellServices().setBackNavigation();
			}
		} catch (error) {
			Log.info(error as any);
			return undefined;
		}
		return true;
	}

	/**
	 * @description Method to display a 'discard' popover when exiting a sticky session.
	 * @function
	 * @name onBackNavigationInSession
	 * @memberof sap.fe.core.controllerextensions.InternalEditFlow
	 */
	@publicExtension()
	@finalExtension()
	onBackNavigationInSession() {
		const oView = this.getView(),
			oAppComponent = CommonUtils.getAppComponent(oView),
			oRouterProxy = oAppComponent.getRouterProxy();

		if (oRouterProxy.checkIfBackIsOutOfGuard()) {
			const oBindingContext = oView && oView.getBindingContext();

			sticky.processDataLossConfirmation(
				() => {
					this.discardStickySession(oBindingContext);
					history.back();
				},
				oView,
				this.getProgrammingModel(oBindingContext)
			);

			return;
		}
		history.back();
	}

	@publicExtension()
	@finalExtension()
	discardStickySession(oContext: any) {
		sticky.discardDocument(oContext);
		this.handleStickyOff();
	}

	_hasNewActionForSticky(oContext: any, oView: View, sCustomAction: string) {
		try {
			if (oContext === undefined || oView === undefined) {
				throw new Error("Invalid input parameters for function _hasNewActionForSticky");
			}

			const oMetaModel = oView.getModel().getMetaModel(),
				sMetaPath = oContext.getPath().substring(0, oContext.getPath().indexOf("(")),
				oStickySession = oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Session.v1.StickySessionSupported`);

			if (oStickySession && oStickySession.NewAction && oStickySession.NewAction === sCustomAction) {
				return true;
			} else if (oStickySession && oStickySession.AdditionalNewActions) {
				return sCustomAction ===
					oStickySession.AdditionalNewActions.find(function (sAdditionalAction: string) {
						return sAdditionalAction === sCustomAction;
					})
					? true
					: false;
			} else {
				return false;
			}
		} catch (error) {
			Log.info(error as any);
			return undefined;
		}
	}

	_registerDirtyStateProvider(oAppComponent: AppComponent, oInternalModel: JSONModel, sHashTracker: string) {
		return function fnDirtyStateProvider(oNavigationContext: any) {
			try {
				if (oNavigationContext === undefined) {
					throw new Error("Invalid input parameters for function fnDirtyStateProvider");
				}

				const sTargetHash = oNavigationContext.innerAppRoute,
					oRouterProxy = oAppComponent.getRouterProxy();
				let sLclHashTracker = "";
				let bDirty: boolean;
				const bSessionON = oInternalModel.getProperty("/sessionOn");

				if (!bSessionON) {
					// If the sticky session was terminated before hand.
					// Eexample in case of navigating away from application using IBN.
					return undefined;
				}

				if (!oRouterProxy.isNavigationFinalized()) {
					// If navigation is currently happening in RouterProxy, it's a transient state
					// (not dirty)
					bDirty = false;
					sLclHashTracker = sTargetHash;
				} else if (sHashTracker === sTargetHash) {
					// the hash didn't change so either the user attempts to refresh or to leave the app
					bDirty = true;
				} else if (oRouterProxy.checkHashWithGuard(sTargetHash) || oRouterProxy.isGuardCrossAllowedByUser()) {
					// the user attempts to navigate within the root object
					// or crossing the guard has already been allowed by the RouterProxy
					sLclHashTracker = sTargetHash;
					bDirty = false;
				} else {
					// the user attempts to navigate within the app, for example back to the list report
					bDirty = true;
				}

				if (bDirty) {
					// the FLP doesn't call the dirty state provider anymore once it's dirty, as they can't
					// change this due to compatibility reasons we set it back to not-dirty
					setTimeout(function () {
						oAppComponent.getShellServices().setDirtyFlag(false);
					}, 0);
				} else {
					sHashTracker = sLclHashTracker;
				}

				return bDirty;
			} catch (error) {
				Log.info(error as any);
				return undefined;
			}
		};
	}

	_attachSessionTimeout(oContext: any, i18nModel: Model) {
		return () => {
			try {
				if (oContext === undefined) {
					throw new Error("Context missing for function fnHandleSessionTimeout");
				}
				// remove transient messages since we will showing our own message
				this.getMessageHandler().removeTransitionMessages();

				const oDialog = new Dialog({
					title: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_TITLE}",
					state: "Warning",
					content: new Text({ text: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_MESSAGE}" }),
					beginButton: new Button({
						text: "{sap.fe.i18n>C_COMMON_DIALOG_OK}",
						type: "Emphasized",
						press: () => {
							// remove sticky handling after navigation since session has already been terminated
							this.handleStickyOff();
							this.getRoutingListener().navigateBackFromContext(oContext);
						}
					}),
					afterClose: function () {
						oDialog.destroy();
					}
				});
				oDialog.addStyleClass("sapUiContentPadding");
				oDialog.setModel(i18nModel, "sap.fe.i18n");
				this.getView().addDependent(oDialog);
				oDialog.open();
			} catch (error) {
				Log.info(error as any);
				return undefined;
			}
			return true;
		};
	}

	_attachRouteMatched(oFnContext: any, oContext: any, oAppComponent: AppComponent) {
		return function fnStickyDiscardAfterNavigation() {
			const sCurrentHash = oAppComponent.getRouterProxy().getHash();
			// either current hash is empty so the user left the app or he navigated away from the object
			if (!sCurrentHash || !oAppComponent.getRouterProxy().checkHashWithGuard(sCurrentHash)) {
				oFnContext.discardStickySession(oContext);
			}
		};
	}
	scrollAndFocusOnInactiveRow(oTable: Table) {
		const oRowBinding = oTable.getRowBinding() as ODataListBinding;
		const iActiveRowIndex = oRowBinding.getCount() || 0;
		if (iActiveRowIndex > 0) {
			oTable.scrollToIndex(iActiveRowIndex - 1);
			oTable.focusRow(iActiveRowIndex, true);
		} else {
			oTable.focusRow(iActiveRowIndex, true);
		}
	}
	_isFclEnabled(): boolean {
		return this.base.getAppComponent()._isFclEnabled();
	}
}

export default InternalEditFlow;
