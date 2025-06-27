/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/sticky", "sap/fe/core/controllerextensions/editFlow/TransactionHelper", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/library", "sap/m/Button", "sap/m/Dialog", "sap/m/Text", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution"], function (Log, CommonUtils, BusyLocker, ActivitySync, CollaborationCommon, sticky, TransactionHelper, ClassSupport, EditState, FELibrary, Button, Dialog, Text, ControllerExtension, OverrideExecution) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _dec48, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var Activity = CollaborationCommon.Activity;
  var send = ActivitySync.send;
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  var ProgrammingModel = FELibrary.ProgrammingModel,
    DraftStatus = FELibrary.DraftStatus,
    EditMode = FELibrary.EditMode,
    CreationMode = FELibrary.CreationMode;
  var InternalEditFlow = (_dec = defineUI5Class("sap.fe.core.controllerextensions.InternalEditFlow"), _dec2 = methodOverride(), _dec3 = privateExtension(), _dec4 = extensible(OverrideExecution.After), _dec5 = publicExtension(), _dec6 = finalExtension(), _dec7 = publicExtension(), _dec8 = finalExtension(), _dec9 = publicExtension(), _dec10 = finalExtension(), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = publicExtension(), _dec14 = finalExtension(), _dec15 = publicExtension(), _dec16 = finalExtension(), _dec17 = publicExtension(), _dec18 = finalExtension(), _dec19 = publicExtension(), _dec20 = finalExtension(), _dec21 = publicExtension(), _dec22 = finalExtension(), _dec23 = publicExtension(), _dec24 = finalExtension(), _dec25 = publicExtension(), _dec26 = finalExtension(), _dec27 = publicExtension(), _dec28 = finalExtension(), _dec29 = publicExtension(), _dec30 = finalExtension(), _dec31 = publicExtension(), _dec32 = finalExtension(), _dec33 = publicExtension(), _dec34 = finalExtension(), _dec35 = publicExtension(), _dec36 = finalExtension(), _dec37 = publicExtension(), _dec38 = finalExtension(), _dec39 = publicExtension(), _dec40 = finalExtension(), _dec41 = publicExtension(), _dec42 = finalExtension(), _dec43 = publicExtension(), _dec44 = finalExtension(), _dec45 = publicExtension(), _dec46 = finalExtension(), _dec47 = publicExtension(), _dec48 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(InternalEditFlow, _ControllerExtension);
    function InternalEditFlow() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = InternalEditFlow.prototype;
    _proto.onInit = function onInit() {
      this._oAppComponent = this.base.getAppComponent();
    }

    /**
     * Override to set the creation mode.
     *
     * @param bCreationMode
     * @memberof sap.fe.core.controllerextensions.InternalEditFlow
     * @alias sap.fe.core.controllerextensions.InternalEditFlow#setCreationMode
     * @since 1.90.0
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setCreationMode = function setCreationMode(bCreationMode) {
      // to be overridden
    };
    _proto.createMultipleDocuments = function createMultipleDocuments(oListBinding, aData, bCreateAtEnd, bFromCopyPaste, beforeCreateCallBack) {
      var _this = this;
      var bInactive = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
      var transactionHelper = this.getTransactionHelper(),
        oLockObject = this.getGlobalUIModel(),
        oResourceBundle = this.getView().getController().oResourceBundle;
      BusyLocker.lock(oLockObject);
      var aFinalContexts = [];
      return this.syncTask().then(function () {
        return beforeCreateCallBack ? beforeCreateCallBack({
          contextPath: oListBinding && oListBinding.getPath()
        }) : Promise.resolve();
      }).then(function () {
        var oModel = oListBinding.getModel(),
          oMetaModel = oModel.getMetaModel();
        var sMetaPath;
        if (oListBinding.getContext()) {
          sMetaPath = oMetaModel.getMetaPath("".concat(oListBinding.getContext().getPath(), "/").concat(oListBinding.getPath()));
        } else {
          sMetaPath = oMetaModel.getMetaPath(oListBinding.getPath());
        }
        _this.handleCreateEvents(oListBinding);

        // Iterate on all items and store the corresponding creation promise
        var aCreationPromises = aData.map(function (mPropertyValues) {
          var mParameters = {
            data: {}
          };
          mParameters.keepTransientContextOnFailed = false; // currently not fully supported
          mParameters.busyMode = "None";
          mParameters.creationMode = CreationMode.CreationRow;
          mParameters.parentControl = _this.getView();
          mParameters.createAtEnd = bCreateAtEnd;
          mParameters.inactive = bInactive;

          // Remove navigation properties as we don't support deep create
          for (var sPropertyPath in mPropertyValues) {
            var oProperty = oMetaModel.getObject("".concat(sMetaPath, "/").concat(sPropertyPath));
            if (oProperty && oProperty.$kind !== "NavigationProperty" && mPropertyValues[sPropertyPath]) {
              mParameters.data[sPropertyPath] = mPropertyValues[sPropertyPath];
            }
          }
          return transactionHelper.createDocument(oListBinding, mParameters, oResourceBundle, _this.getMessageHandler(), bFromCopyPaste, _this.getView());
        });
        return Promise.all(aCreationPromises);
      }).then(function (aContexts) {
        // transient contexts are reliably removed once oNewContext.created() is resolved
        aFinalContexts = aContexts;
        return Promise.all(aContexts.map(function (oNewContext) {
          if (!oNewContext.bInactive) {
            return oNewContext.created();
          }
        }));
      }).then(function () {
        var oBindingContext = _this.getView().getBindingContext();

        // if there are transient contexts, we must avoid requesting side effects
        // this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
        // if list binding is refreshed, transient contexts might be lost
        if (!CommonUtils.hasTransientContext(oListBinding)) {
          _this._oAppComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(oListBinding.getPath(), oBindingContext);
        }
      }).catch(function (err) {
        Log.error("Error while creating multiple documents.");
        return Promise.reject(err);
      }).finally(function () {
        BusyLocker.unlock(oLockObject);
      }).then(function () {
        return aFinalContexts;
      });
    };
    _proto.deleteMultipleDocuments = function deleteMultipleDocuments(aContexts, mParameters) {
      var _this2 = this;
      var oLockObject = this.getGlobalUIModel();
      var oControl = this.getView().byId(mParameters.controlId);
      if (!oControl) {
        throw new Error("parameter controlId missing or incorrect");
      } else {
        mParameters.parentControl = oControl;
      }
      var oListBinding = oControl.getBinding("items") || oControl.getRowBinding();
      mParameters.bFindActiveContexts = true;
      BusyLocker.lock(oLockObject);
      return this.deleteDocumentTransaction(aContexts, mParameters).then(function () {
        var oResult;

        // Multiple object deletion is triggered from a list
        // First clear the selection in the table as it's not valid any more
        if (oControl.isA("sap.ui.mdc.Table")) {
          oControl.clearSelection();
        }

        // Then refresh the list-binding (LR), or require side-effects (OP)
        var oBindingContext = _this2.getView().getBindingContext();
        if (oListBinding.isRoot()) {
          // keep promise chain pending until refresh of listbinding is completed
          oResult = new Promise(function (resolve) {
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
            _this2._oAppComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(oListBinding.getPath(), oBindingContext);
          }
        }
        if (!_this2._isFclEnabled()) {
          // deleting at least one object should also set the UI to dirty
          EditState.setEditStateDirty();
        }
        send(_this2.getView(), Activity.Delete, aContexts.map(function (context) {
          return context.getPath();
        }));
        return oResult;
      }).catch(function (oError) {
        Log.error("Error while deleting the document(s)", oError);
      }).finally(function () {
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
     */;
    _proto.computeEditMode = function computeEditMode(oContext) {
      try {
        var _this4 = this;
        var sCustomAction = _this4.getInternalModel().getProperty("/sCustomAction");
        var sProgrammingModel = _this4.getProgrammingModel(oContext);
        return Promise.resolve(function () {
          if (sProgrammingModel === ProgrammingModel.Draft) {
            return _catch(function () {
              _this4.setDraftStatus(DraftStatus.Clear);
              return Promise.resolve(oContext.requestObject("IsActiveEntity")).then(function (bIsActiveEntity) {
                var _temp = function () {
                  if (bIsActiveEntity === false) {
                    // in case the document is draft set it in edit mode
                    _this4.setEditMode(EditMode.Editable);
                    return Promise.resolve(oContext.requestObject("HasActiveEntity")).then(function (bHasActiveEntity) {
                      _this4.setEditMode(undefined, !bHasActiveEntity);
                    });
                  } else {
                    // active document, stay on display mode
                    _this4.setEditMode(EditMode.Display, false);
                  }
                }();
                if (_temp && _temp.then) return _temp.then(function () {});
              });
            }, function (oError) {
              Log.error("Error while determining the editMode for draft", oError);
              throw oError;
            });
          } else if (sProgrammingModel === ProgrammingModel.Sticky) {
            if (sCustomAction && sCustomAction !== "" && _this4._hasNewActionForSticky(oContext, _this4.getView(), sCustomAction)) {
              _this4.getTransactionHelper()._bCreateMode = true;
              _this4.getTransactionHelper().handleDocumentModifications();
              _this4.setEditMode(EditMode.Editable, true);
              EditState.setEditStateDirty();
              _this4.handleStickyOn(oContext);
              _this4.getInternalModel().setProperty("/sCustomAction", "");
            }
          }
        }());
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Sets the edit mode.
     *
     * @param sEditMode
     * @param bCreationMode CreateMode flag to identify the creation mode
     */
    ;
    _proto.setEditMode = function setEditMode(sEditMode, bCreationMode) {
      // at this point of time it's not meant to release the edit flow for freestyle usage therefore we can
      // rely on the global UI model to exist
      var oGlobalModel = this.getGlobalUIModel();
      if (sEditMode) {
        oGlobalModel.setProperty("/isEditable", sEditMode === "Editable", undefined, true);
      }
      if (bCreationMode !== undefined) {
        // Since setCreationMode is public in EditFlow and can be overriden, make sure to call it via the controller
        // to ensure any overrides are taken into account
        this.setCreationMode(bCreationMode);
      }
    };
    _proto.setDraftStatus = function setDraftStatus(sDraftState) {
      // at this point of time it's not meant to release the edit flow for freestyle usage therefore we can
      // rely on the global UI model to exist
      this.base.getView().getModel("ui").setProperty("/draftStatus", sDraftState, undefined, true);
    };
    _proto.getRoutingListener = function getRoutingListener() {
      // at this point of time it's not meant to release the edit flow for FPM custom pages and the routing
      // listener is not yet public therefore keep the logic here for now

      if (this.base._routing) {
        return this.base._routing;
      } else {
        throw new Error("Edit Flow works only with a given routing listener");
      }
    };
    _proto.getGlobalUIModel = function getGlobalUIModel() {
      // at this point of time it's not meant to release the edit flow for freestyle usage therefore we can
      // rely on the global UI model to exist
      return this.base.getView().getModel("ui");
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
     */;
    _proto.syncTask = function syncTask(vTask) {
      var fnNewTask;
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
    };
    _proto.getProgrammingModel = function getProgrammingModel(oContext) {
      return this.getTransactionHelper().getProgrammingModel(oContext);
    };
    _proto.deleteDocumentTransaction = function deleteDocumentTransaction(oContext, mParameters) {
      var _sap$ui$getCore$byId,
        _this5 = this;
      var oResourceBundle = this.getView().getController().oResourceBundle,
        transactionHelper = this.getTransactionHelper();
      mParameters = mParameters || {};

      // TODO: this setting and removing of contexts shouldn't be in the transaction helper at all
      // for the time being I kept it and provide the internal model context to not break something
      mParameters.internalModelContext = mParameters.controlId ? (_sap$ui$getCore$byId = sap.ui.getCore().byId(mParameters.controlId)) === null || _sap$ui$getCore$byId === void 0 ? void 0 : _sap$ui$getCore$byId.getBindingContext("internal") : null;
      return this.syncTask().then(transactionHelper.deleteDocument.bind(transactionHelper, oContext, mParameters, oResourceBundle, this.getMessageHandler())).then(function () {
        var internalModel = _this5.getInternalModel();
        internalModel.setProperty("/sessionOn", false);
        internalModel.setProperty("/stickySessionToken", undefined);
      }).catch(function (oError) {
        return Promise.reject(oError);
      });
    }

    /**
     * Handles the create event: shows messages and in case of a draft, updates the draft indicator.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oBinding OData list binding object
     */;
    _proto.handleCreateEvents = function handleCreateEvents(oBinding) {
      var _this6 = this;
      var transactionHelper = this.getTransactionHelper();
      this.setDraftStatus(DraftStatus.Clear);
      oBinding = oBinding.getBinding && oBinding.getBinding() || oBinding;
      var sProgrammingModel = this.getProgrammingModel(oBinding);
      oBinding.attachEvent("createSent", function () {
        transactionHelper.handleDocumentModifications();
        if (sProgrammingModel === ProgrammingModel.Draft) {
          _this6.setDraftStatus(DraftStatus.Saving);
        }
      });
      oBinding.attachEvent("createCompleted", function (oEvent) {
        var bSuccess = oEvent.getParameter("success");
        if (sProgrammingModel === ProgrammingModel.Draft) {
          _this6.setDraftStatus(bSuccess ? DraftStatus.Saved : DraftStatus.Clear);
        }
        _this6.getMessageHandler().showMessageDialog();
      });
    };
    _proto.getTransactionHelper = function getTransactionHelper() {
      if (!this._oTransactionHelper) {
        // currently also the transaction helper is locking therefore passing lock object
        this._oTransactionHelper = new TransactionHelper(this._oAppComponent, this.getGlobalUIModel());
      }
      return this._oTransactionHelper;
    };
    _proto.getInternalModel = function getInternalModel() {
      return this.base.getView().getModel("internal");
    }

    /**
     * Creates a new promise to wait for an action to be executed
     *
     * @function
     * @name _createActionPromise
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @returns {Function} The resolver function which can be used to externally resolve the promise
     */;
    _proto.createActionPromise = function createActionPromise(sActionName, sControlId) {
      var _this7 = this;
      var fResolver, fRejector;
      this.oActionPromise = new Promise(function (resolve, reject) {
        fResolver = resolve;
        fRejector = reject;
      }).then(function (oResponse) {
        return Object.assign({
          controlId: sControlId
        }, _this7.getActionResponseDataAndKeys(sActionName, oResponse));
      });
      return {
        fResolver: fResolver,
        fRejector: fRejector
      };
    }

    /**
     * Gets the getCurrentActionPromise object.
     *
     * @function
     * @name _getCurrentActionPromise
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @returns Returns the promise
     */;
    _proto.getCurrentActionPromise = function getCurrentActionPromise() {
      return this.oActionPromise;
    };
    _proto.deleteCurrentActionPromise = function deleteCurrentActionPromise() {
      this.oActionPromise = undefined;
    }

    /**
     * @function
     * @name getActionResponseDataAndKeys
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param sActionName The name of the action that is executed
     * @param oResponse The bound action's response data or response context
     * @returns Object with data and names of the key fields of the response
     */;
    _proto.getActionResponseDataAndKeys = function getActionResponseDataAndKeys(sActionName, oResponse) {
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
      var oView = this.getView(),
        oMetaModel = oView.getModel().getMetaModel().getData(),
        sActionReturnType = oMetaModel && oMetaModel[sActionName] && oMetaModel[sActionName][0] && oMetaModel[sActionName][0].$ReturnType ? oMetaModel[sActionName][0].$ReturnType.$Type : null,
        aKey = sActionReturnType && oMetaModel[sActionReturnType] ? oMetaModel[sActionReturnType].$Key : null;
      return {
        oData: oResponse.getObject(),
        keys: aKey
      };
    };
    _proto.getMessageHandler = function getMessageHandler() {
      // at this point of time it's not meant to release the edit flow for FPM custom pages therefore keep
      // the logic here for now

      if (this.base.messageHandler) {
        return this.base.messageHandler;
      } else {
        throw new Error("Edit Flow works only with a given message handler");
      }
    };
    _proto.handleStickyOn = function handleStickyOn(oContext) {
      var oAppComponent = CommonUtils.getAppComponent(this.getView());
      try {
        if (oAppComponent === undefined || oContext === undefined) {
          throw new Error("undefined AppComponent or Context for function handleStickyOn");
        }
        if (!oAppComponent.getRouterProxy().hasNavigationGuard()) {
          var sHashTracker = oAppComponent.getRouterProxy().getHash(),
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
          var i18nModel = this.getView().getModel("sap.fe.i18n");
          this.fnHandleSessionTimeout = this._attachSessionTimeout(oContext, i18nModel);
          this.getView().getModel().attachSessionTimeout(this.fnHandleSessionTimeout);
          this.fnStickyDiscardAfterNavigation = this._attachRouteMatched(this, oContext, oAppComponent);
          oAppComponent.getRoutingService().attachRouteMatched(this.fnStickyDiscardAfterNavigation);
        }
      } catch (error) {
        Log.info(error);
        return undefined;
      }
      return true;
    };
    _proto.handleStickyOff = function handleStickyOff() {
      var oAppComponent = CommonUtils.getAppComponent(this.getView());
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
          this.getView().getModel().detachSessionTimeout(this.fnHandleSessionTimeout);
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
        Log.info(error);
        return undefined;
      }
      return true;
    }

    /**
     * @description Method to display a 'discard' popover when exiting a sticky session.
     * @function
     * @name onBackNavigationInSession
     * @memberof sap.fe.core.controllerextensions.InternalEditFlow
     */;
    _proto.onBackNavigationInSession = function onBackNavigationInSession() {
      var _this8 = this;
      var oView = this.getView(),
        oAppComponent = CommonUtils.getAppComponent(oView),
        oRouterProxy = oAppComponent.getRouterProxy();
      if (oRouterProxy.checkIfBackIsOutOfGuard()) {
        var oBindingContext = oView && oView.getBindingContext();
        sticky.processDataLossConfirmation(function () {
          _this8.discardStickySession(oBindingContext);
          history.back();
        }, oView, this.getProgrammingModel(oBindingContext));
        return;
      }
      history.back();
    };
    _proto.discardStickySession = function discardStickySession(oContext) {
      sticky.discardDocument(oContext);
      this.handleStickyOff();
    };
    _proto._hasNewActionForSticky = function _hasNewActionForSticky(oContext, oView, sCustomAction) {
      try {
        if (oContext === undefined || oView === undefined) {
          throw new Error("Invalid input parameters for function _hasNewActionForSticky");
        }
        var oMetaModel = oView.getModel().getMetaModel(),
          sMetaPath = oContext.getPath().substring(0, oContext.getPath().indexOf("(")),
          oStickySession = oMetaModel.getObject("".concat(sMetaPath, "@com.sap.vocabularies.Session.v1.StickySessionSupported"));
        if (oStickySession && oStickySession.NewAction && oStickySession.NewAction === sCustomAction) {
          return true;
        } else if (oStickySession && oStickySession.AdditionalNewActions) {
          return sCustomAction === oStickySession.AdditionalNewActions.find(function (sAdditionalAction) {
            return sAdditionalAction === sCustomAction;
          }) ? true : false;
        } else {
          return false;
        }
      } catch (error) {
        Log.info(error);
        return undefined;
      }
    };
    _proto._registerDirtyStateProvider = function _registerDirtyStateProvider(oAppComponent, oInternalModel, sHashTracker) {
      return function fnDirtyStateProvider(oNavigationContext) {
        try {
          if (oNavigationContext === undefined) {
            throw new Error("Invalid input parameters for function fnDirtyStateProvider");
          }
          var sTargetHash = oNavigationContext.innerAppRoute,
            oRouterProxy = oAppComponent.getRouterProxy();
          var sLclHashTracker = "";
          var bDirty;
          var bSessionON = oInternalModel.getProperty("/sessionOn");
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
          Log.info(error);
          return undefined;
        }
      };
    };
    _proto._attachSessionTimeout = function _attachSessionTimeout(oContext, i18nModel) {
      var _this9 = this;
      return function () {
        try {
          if (oContext === undefined) {
            throw new Error("Context missing for function fnHandleSessionTimeout");
          }
          // remove transient messages since we will showing our own message
          _this9.getMessageHandler().removeTransitionMessages();
          var oDialog = new Dialog({
            title: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_TITLE}",
            state: "Warning",
            content: new Text({
              text: "{sap.fe.i18n>C_EDITFLOW_OBJECT_PAGE_SESSION_EXPIRED_DIALOG_MESSAGE}"
            }),
            beginButton: new Button({
              text: "{sap.fe.i18n>C_COMMON_DIALOG_OK}",
              type: "Emphasized",
              press: function () {
                // remove sticky handling after navigation since session has already been terminated
                _this9.handleStickyOff();
                _this9.getRoutingListener().navigateBackFromContext(oContext);
              }
            }),
            afterClose: function () {
              oDialog.destroy();
            }
          });
          oDialog.addStyleClass("sapUiContentPadding");
          oDialog.setModel(i18nModel, "sap.fe.i18n");
          _this9.getView().addDependent(oDialog);
          oDialog.open();
        } catch (error) {
          Log.info(error);
          return undefined;
        }
        return true;
      };
    };
    _proto._attachRouteMatched = function _attachRouteMatched(oFnContext, oContext, oAppComponent) {
      return function fnStickyDiscardAfterNavigation() {
        var sCurrentHash = oAppComponent.getRouterProxy().getHash();
        // either current hash is empty so the user left the app or he navigated away from the object
        if (!sCurrentHash || !oAppComponent.getRouterProxy().checkHashWithGuard(sCurrentHash)) {
          oFnContext.discardStickySession(oContext);
        }
      };
    };
    _proto.scrollAndFocusOnInactiveRow = function scrollAndFocusOnInactiveRow(oTable) {
      var oRowBinding = oTable.getRowBinding();
      var iActiveRowIndex = oRowBinding.getCount() || 0;
      if (iActiveRowIndex > 0) {
        oTable.scrollToIndex(iActiveRowIndex - 1);
        oTable.focusRow(iActiveRowIndex, true);
      } else {
        oTable.focusRow(iActiveRowIndex, true);
      }
    };
    _proto._isFclEnabled = function _isFclEnabled() {
      return this.base.getAppComponent()._isFclEnabled();
    };
    return InternalEditFlow;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setCreationMode", [_dec3, _dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "setCreationMode"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "createMultipleDocuments", [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "createMultipleDocuments"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteMultipleDocuments", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteMultipleDocuments"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "computeEditMode", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "computeEditMode"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setEditMode", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "setEditMode"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "setDraftStatus", [_dec13, _dec14], Object.getOwnPropertyDescriptor(_class2.prototype, "setDraftStatus"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getRoutingListener", [_dec15, _dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "getRoutingListener"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getGlobalUIModel", [_dec17, _dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "getGlobalUIModel"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "syncTask", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "syncTask"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getProgrammingModel", [_dec21, _dec22], Object.getOwnPropertyDescriptor(_class2.prototype, "getProgrammingModel"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteDocumentTransaction", [_dec23, _dec24], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteDocumentTransaction"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleCreateEvents", [_dec25, _dec26], Object.getOwnPropertyDescriptor(_class2.prototype, "handleCreateEvents"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getTransactionHelper", [_dec27, _dec28], Object.getOwnPropertyDescriptor(_class2.prototype, "getTransactionHelper"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getInternalModel", [_dec29, _dec30], Object.getOwnPropertyDescriptor(_class2.prototype, "getInternalModel"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "createActionPromise", [_dec31, _dec32], Object.getOwnPropertyDescriptor(_class2.prototype, "createActionPromise"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getCurrentActionPromise", [_dec33, _dec34], Object.getOwnPropertyDescriptor(_class2.prototype, "getCurrentActionPromise"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteCurrentActionPromise", [_dec35, _dec36], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteCurrentActionPromise"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getActionResponseDataAndKeys", [_dec37, _dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "getActionResponseDataAndKeys"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getMessageHandler", [_dec39, _dec40], Object.getOwnPropertyDescriptor(_class2.prototype, "getMessageHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleStickyOn", [_dec41, _dec42], Object.getOwnPropertyDescriptor(_class2.prototype, "handleStickyOn"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handleStickyOff", [_dec43, _dec44], Object.getOwnPropertyDescriptor(_class2.prototype, "handleStickyOff"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBackNavigationInSession", [_dec45, _dec46], Object.getOwnPropertyDescriptor(_class2.prototype, "onBackNavigationInSession"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "discardStickySession", [_dec47, _dec48], Object.getOwnPropertyDescriptor(_class2.prototype, "discardStickySession"), _class2.prototype)), _class2)) || _class);
  return InternalEditFlow;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiUHJvZ3JhbW1pbmdNb2RlbCIsIkZFTGlicmFyeSIsIkRyYWZ0U3RhdHVzIiwiRWRpdE1vZGUiLCJDcmVhdGlvbk1vZGUiLCJJbnRlcm5hbEVkaXRGbG93IiwiZGVmaW5lVUk1Q2xhc3MiLCJtZXRob2RPdmVycmlkZSIsInByaXZhdGVFeHRlbnNpb24iLCJleHRlbnNpYmxlIiwiT3ZlcnJpZGVFeGVjdXRpb24iLCJBZnRlciIsInB1YmxpY0V4dGVuc2lvbiIsImZpbmFsRXh0ZW5zaW9uIiwib25Jbml0IiwiX29BcHBDb21wb25lbnQiLCJiYXNlIiwiZ2V0QXBwQ29tcG9uZW50Iiwic2V0Q3JlYXRpb25Nb2RlIiwiYkNyZWF0aW9uTW9kZSIsImNyZWF0ZU11bHRpcGxlRG9jdW1lbnRzIiwib0xpc3RCaW5kaW5nIiwiYURhdGEiLCJiQ3JlYXRlQXRFbmQiLCJiRnJvbUNvcHlQYXN0ZSIsImJlZm9yZUNyZWF0ZUNhbGxCYWNrIiwiYkluYWN0aXZlIiwidHJhbnNhY3Rpb25IZWxwZXIiLCJnZXRUcmFuc2FjdGlvbkhlbHBlciIsIm9Mb2NrT2JqZWN0IiwiZ2V0R2xvYmFsVUlNb2RlbCIsIm9SZXNvdXJjZUJ1bmRsZSIsImdldFZpZXciLCJnZXRDb250cm9sbGVyIiwiQnVzeUxvY2tlciIsImxvY2siLCJhRmluYWxDb250ZXh0cyIsInN5bmNUYXNrIiwiY29udGV4dFBhdGgiLCJnZXRQYXRoIiwiUHJvbWlzZSIsInJlc29sdmUiLCJvTW9kZWwiLCJnZXRNb2RlbCIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJzTWV0YVBhdGgiLCJnZXRDb250ZXh0IiwiZ2V0TWV0YVBhdGgiLCJoYW5kbGVDcmVhdGVFdmVudHMiLCJhQ3JlYXRpb25Qcm9taXNlcyIsIm1hcCIsIm1Qcm9wZXJ0eVZhbHVlcyIsIm1QYXJhbWV0ZXJzIiwiZGF0YSIsImtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQiLCJidXN5TW9kZSIsImNyZWF0aW9uTW9kZSIsIkNyZWF0aW9uUm93IiwicGFyZW50Q29udHJvbCIsImNyZWF0ZUF0RW5kIiwiaW5hY3RpdmUiLCJzUHJvcGVydHlQYXRoIiwib1Byb3BlcnR5IiwiZ2V0T2JqZWN0IiwiJGtpbmQiLCJjcmVhdGVEb2N1bWVudCIsImdldE1lc3NhZ2VIYW5kbGVyIiwiYWxsIiwiYUNvbnRleHRzIiwib05ld0NvbnRleHQiLCJjcmVhdGVkIiwib0JpbmRpbmdDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJDb21tb25VdGlscyIsImhhc1RyYW5zaWVudENvbnRleHQiLCJnZXRTaWRlRWZmZWN0c1NlcnZpY2UiLCJyZXF1ZXN0U2lkZUVmZmVjdHNGb3JOYXZpZ2F0aW9uUHJvcGVydHkiLCJjYXRjaCIsImVyciIsIkxvZyIsImVycm9yIiwicmVqZWN0IiwiZmluYWxseSIsInVubG9jayIsImRlbGV0ZU11bHRpcGxlRG9jdW1lbnRzIiwib0NvbnRyb2wiLCJieUlkIiwiY29udHJvbElkIiwiRXJyb3IiLCJnZXRCaW5kaW5nIiwiZ2V0Um93QmluZGluZyIsImJGaW5kQWN0aXZlQ29udGV4dHMiLCJkZWxldGVEb2N1bWVudFRyYW5zYWN0aW9uIiwib1Jlc3VsdCIsImlzQSIsImNsZWFyU2VsZWN0aW9uIiwiaXNSb290IiwiYXR0YWNoRXZlbnRPbmNlIiwicmVmcmVzaCIsIl9pc0ZjbEVuYWJsZWQiLCJFZGl0U3RhdGUiLCJzZXRFZGl0U3RhdGVEaXJ0eSIsInNlbmQiLCJBY3Rpdml0eSIsIkRlbGV0ZSIsImNvbnRleHQiLCJvRXJyb3IiLCJjb21wdXRlRWRpdE1vZGUiLCJvQ29udGV4dCIsInNDdXN0b21BY3Rpb24iLCJnZXRJbnRlcm5hbE1vZGVsIiwiZ2V0UHJvcGVydHkiLCJzUHJvZ3JhbW1pbmdNb2RlbCIsImdldFByb2dyYW1taW5nTW9kZWwiLCJEcmFmdCIsInNldERyYWZ0U3RhdHVzIiwiQ2xlYXIiLCJyZXF1ZXN0T2JqZWN0IiwiYklzQWN0aXZlRW50aXR5Iiwic2V0RWRpdE1vZGUiLCJFZGl0YWJsZSIsImJIYXNBY3RpdmVFbnRpdHkiLCJ1bmRlZmluZWQiLCJEaXNwbGF5IiwiU3RpY2t5IiwiX2hhc05ld0FjdGlvbkZvclN0aWNreSIsIl9iQ3JlYXRlTW9kZSIsImhhbmRsZURvY3VtZW50TW9kaWZpY2F0aW9ucyIsImhhbmRsZVN0aWNreU9uIiwic2V0UHJvcGVydHkiLCJzRWRpdE1vZGUiLCJvR2xvYmFsTW9kZWwiLCJzRHJhZnRTdGF0ZSIsImdldFJvdXRpbmdMaXN0ZW5lciIsIl9yb3V0aW5nIiwidlRhc2siLCJmbk5ld1Rhc2siLCJfcFRhc2tzIiwiaW50ZXJuYWxNb2RlbENvbnRleHQiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJkZWxldGVEb2N1bWVudCIsImJpbmQiLCJpbnRlcm5hbE1vZGVsIiwib0JpbmRpbmciLCJhdHRhY2hFdmVudCIsIlNhdmluZyIsIm9FdmVudCIsImJTdWNjZXNzIiwiZ2V0UGFyYW1ldGVyIiwiU2F2ZWQiLCJzaG93TWVzc2FnZURpYWxvZyIsIl9vVHJhbnNhY3Rpb25IZWxwZXIiLCJUcmFuc2FjdGlvbkhlbHBlciIsImNyZWF0ZUFjdGlvblByb21pc2UiLCJzQWN0aW9uTmFtZSIsInNDb250cm9sSWQiLCJmUmVzb2x2ZXIiLCJmUmVqZWN0b3IiLCJvQWN0aW9uUHJvbWlzZSIsIm9SZXNwb25zZSIsIk9iamVjdCIsImFzc2lnbiIsImdldEFjdGlvblJlc3BvbnNlRGF0YUFuZEtleXMiLCJnZXRDdXJyZW50QWN0aW9uUHJvbWlzZSIsImRlbGV0ZUN1cnJlbnRBY3Rpb25Qcm9taXNlIiwiQXJyYXkiLCJpc0FycmF5IiwibGVuZ3RoIiwidmFsdWUiLCJvVmlldyIsImdldERhdGEiLCJzQWN0aW9uUmV0dXJuVHlwZSIsIiRSZXR1cm5UeXBlIiwiJFR5cGUiLCJhS2V5IiwiJEtleSIsIm9EYXRhIiwia2V5cyIsIm1lc3NhZ2VIYW5kbGVyIiwib0FwcENvbXBvbmVudCIsImdldFJvdXRlclByb3h5IiwiaGFzTmF2aWdhdGlvbkd1YXJkIiwic0hhc2hUcmFja2VyIiwiZ2V0SGFzaCIsIm9JbnRlcm5hbE1vZGVsIiwic2V0VGltZW91dCIsInNldE5hdmlnYXRpb25HdWFyZCIsInN1YnN0cmluZyIsImdldFNoZWxsU2VydmljZXMiLCJzZXRCYWNrTmF2aWdhdGlvbiIsIm9uQmFja05hdmlnYXRpb25JblNlc3Npb24iLCJmbkRpcnR5U3RhdGVQcm92aWRlciIsIl9yZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlciIsInJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyIiwiaTE4bk1vZGVsIiwiZm5IYW5kbGVTZXNzaW9uVGltZW91dCIsIl9hdHRhY2hTZXNzaW9uVGltZW91dCIsImF0dGFjaFNlc3Npb25UaW1lb3V0IiwiZm5TdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uIiwiX2F0dGFjaFJvdXRlTWF0Y2hlZCIsImdldFJvdXRpbmdTZXJ2aWNlIiwiYXR0YWNoUm91dGVNYXRjaGVkIiwiaW5mbyIsImhhbmRsZVN0aWNreU9mZiIsImRpc2NhcmROYXZpZ2F0aW9uR3VhcmQiLCJkZXJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyIiwiZGV0YWNoU2Vzc2lvblRpbWVvdXQiLCJkZXRhY2hSb3V0ZU1hdGNoZWQiLCJvUm91dGVyUHJveHkiLCJjaGVja0lmQmFja0lzT3V0T2ZHdWFyZCIsInN0aWNreSIsInByb2Nlc3NEYXRhTG9zc0NvbmZpcm1hdGlvbiIsImRpc2NhcmRTdGlja3lTZXNzaW9uIiwiaGlzdG9yeSIsImJhY2siLCJkaXNjYXJkRG9jdW1lbnQiLCJpbmRleE9mIiwib1N0aWNreVNlc3Npb24iLCJOZXdBY3Rpb24iLCJBZGRpdGlvbmFsTmV3QWN0aW9ucyIsImZpbmQiLCJzQWRkaXRpb25hbEFjdGlvbiIsIm9OYXZpZ2F0aW9uQ29udGV4dCIsInNUYXJnZXRIYXNoIiwiaW5uZXJBcHBSb3V0ZSIsInNMY2xIYXNoVHJhY2tlciIsImJEaXJ0eSIsImJTZXNzaW9uT04iLCJpc05hdmlnYXRpb25GaW5hbGl6ZWQiLCJjaGVja0hhc2hXaXRoR3VhcmQiLCJpc0d1YXJkQ3Jvc3NBbGxvd2VkQnlVc2VyIiwic2V0RGlydHlGbGFnIiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwib0RpYWxvZyIsIkRpYWxvZyIsInRpdGxlIiwic3RhdGUiLCJjb250ZW50IiwiVGV4dCIsInRleHQiLCJiZWdpbkJ1dHRvbiIsIkJ1dHRvbiIsInR5cGUiLCJwcmVzcyIsIm5hdmlnYXRlQmFja0Zyb21Db250ZXh0IiwiYWZ0ZXJDbG9zZSIsImRlc3Ryb3kiLCJhZGRTdHlsZUNsYXNzIiwic2V0TW9kZWwiLCJhZGREZXBlbmRlbnQiLCJvcGVuIiwib0ZuQ29udGV4dCIsInNDdXJyZW50SGFzaCIsInNjcm9sbEFuZEZvY3VzT25JbmFjdGl2ZVJvdyIsIm9UYWJsZSIsIm9Sb3dCaW5kaW5nIiwiaUFjdGl2ZVJvd0luZGV4IiwiZ2V0Q291bnQiLCJzY3JvbGxUb0luZGV4IiwiZm9jdXNSb3ciLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJJbnRlcm5hbEVkaXRGbG93LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBCdXN5TG9ja2VyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9CdXN5TG9ja2VyXCI7XG5pbXBvcnQgeyBzZW5kIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQWN0aXZpdHlTeW5jXCI7XG5pbXBvcnQgeyBBY3Rpdml0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25Db21tb25cIjtcbmltcG9ydCBzdGlja3kgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L3N0aWNreVwiO1xuaW1wb3J0IFRyYW5zYWN0aW9uSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9UcmFuc2FjdGlvbkhlbHBlclwiO1xuaW1wb3J0IHtcblx0ZGVmaW5lVUk1Q2xhc3MsXG5cdGV4dGVuc2libGUsXG5cdGZpbmFsRXh0ZW5zaW9uLFxuXHRtZXRob2RPdmVycmlkZSxcblx0cHJpdmF0ZUV4dGVuc2lvbixcblx0cHVibGljRXh0ZW5zaW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEVkaXRTdGF0ZSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9FZGl0U3RhdGVcIjtcbmltcG9ydCBGRUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL01vZGVsXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcblxuY29uc3QgUHJvZ3JhbW1pbmdNb2RlbCA9IEZFTGlicmFyeS5Qcm9ncmFtbWluZ01vZGVsLFxuXHREcmFmdFN0YXR1cyA9IEZFTGlicmFyeS5EcmFmdFN0YXR1cyxcblx0RWRpdE1vZGUgPSBGRUxpYnJhcnkuRWRpdE1vZGUsXG5cdENyZWF0aW9uTW9kZSA9IEZFTGlicmFyeS5DcmVhdGlvbk1vZGU7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVybmFsRWRpdEZsb3dcIilcbmNsYXNzIEludGVybmFsRWRpdEZsb3cgZXh0ZW5kcyBDb250cm9sbGVyRXh0ZW5zaW9uIHtcblx0cHJvdGVjdGVkIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblx0cHJpdmF0ZSBfb0FwcENvbXBvbmVudCE6IEFwcENvbXBvbmVudDtcblx0cHJpdmF0ZSBfcFRhc2tzOiBhbnk7XG5cdHByaXZhdGUgb0FjdGlvblByb21pc2U/OiBQcm9taXNlPGFueT47XG5cdHByaXZhdGUgX29UcmFuc2FjdGlvbkhlbHBlcj86IFRyYW5zYWN0aW9uSGVscGVyO1xuXHRwcml2YXRlIGZuRGlydHlTdGF0ZVByb3ZpZGVyPzogRnVuY3Rpb247XG5cdHByaXZhdGUgZm5IYW5kbGVTZXNzaW9uVGltZW91dD86IEZ1bmN0aW9uO1xuXHRwcml2YXRlIGZuU3RpY2t5RGlzY2FyZEFmdGVyTmF2aWdhdGlvbj86IEZ1bmN0aW9uO1xuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRvbkluaXQoKSB7XG5cdFx0dGhpcy5fb0FwcENvbXBvbmVudCA9IHRoaXMuYmFzZS5nZXRBcHBDb21wb25lbnQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBPdmVycmlkZSB0byBzZXQgdGhlIGNyZWF0aW9uIG1vZGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBiQ3JlYXRpb25Nb2RlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5JbnRlcm5hbEVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5JbnRlcm5hbEVkaXRGbG93I3NldENyZWF0aW9uTW9kZVxuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdHNldENyZWF0aW9uTW9kZShiQ3JlYXRpb25Nb2RlOiBib29sZWFuKSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlblxuXHR9XG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRjcmVhdGVNdWx0aXBsZURvY3VtZW50cyhcblx0XHRvTGlzdEJpbmRpbmc6IGFueSxcblx0XHRhRGF0YTogYW55LFxuXHRcdGJDcmVhdGVBdEVuZDogYW55LFxuXHRcdGJGcm9tQ29weVBhc3RlOiBib29sZWFuLFxuXHRcdGJlZm9yZUNyZWF0ZUNhbGxCYWNrOiBhbnksXG5cdFx0YkluYWN0aXZlID0gZmFsc2Vcblx0KSB7XG5cdFx0Y29uc3QgdHJhbnNhY3Rpb25IZWxwZXIgPSB0aGlzLmdldFRyYW5zYWN0aW9uSGVscGVyKCksXG5cdFx0XHRvTG9ja09iamVjdCA9IHRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpLFxuXHRcdFx0b1Jlc291cmNlQnVuZGxlID0gKHRoaXMuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLm9SZXNvdXJjZUJ1bmRsZTtcblxuXHRcdEJ1c3lMb2NrZXIubG9jayhvTG9ja09iamVjdCk7XG5cdFx0bGV0IGFGaW5hbENvbnRleHRzOiBhbnlbXSA9IFtdO1xuXHRcdHJldHVybiB0aGlzLnN5bmNUYXNrKClcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIGJlZm9yZUNyZWF0ZUNhbGxCYWNrXG5cdFx0XHRcdFx0PyBiZWZvcmVDcmVhdGVDYWxsQmFjayh7IGNvbnRleHRQYXRoOiBvTGlzdEJpbmRpbmcgJiYgb0xpc3RCaW5kaW5nLmdldFBhdGgoKSB9KVxuXHRcdFx0XHRcdDogUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBvTW9kZWwgPSBvTGlzdEJpbmRpbmcuZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRsZXQgc01ldGFQYXRoOiBzdHJpbmc7XG5cblx0XHRcdFx0aWYgKG9MaXN0QmluZGluZy5nZXRDb250ZXh0KCkpIHtcblx0XHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKGAke29MaXN0QmluZGluZy5nZXRDb250ZXh0KCkuZ2V0UGF0aCgpfS8ke29MaXN0QmluZGluZy5nZXRQYXRoKCl9YCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChvTGlzdEJpbmRpbmcuZ2V0UGF0aCgpKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMuaGFuZGxlQ3JlYXRlRXZlbnRzKG9MaXN0QmluZGluZyk7XG5cblx0XHRcdFx0Ly8gSXRlcmF0ZSBvbiBhbGwgaXRlbXMgYW5kIHN0b3JlIHRoZSBjb3JyZXNwb25kaW5nIGNyZWF0aW9uIHByb21pc2Vcblx0XHRcdFx0Y29uc3QgYUNyZWF0aW9uUHJvbWlzZXMgPSBhRGF0YS5tYXAoKG1Qcm9wZXJ0eVZhbHVlczogYW55KSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgbVBhcmFtZXRlcnM6IGFueSA9IHsgZGF0YToge30gfTtcblxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQgPSBmYWxzZTsgLy8gY3VycmVudGx5IG5vdCBmdWxseSBzdXBwb3J0ZWRcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5idXN5TW9kZSA9IFwiTm9uZVwiO1xuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSA9IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdztcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRlQXRFbmQgPSBiQ3JlYXRlQXRFbmQ7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuaW5hY3RpdmUgPSBiSW5hY3RpdmU7XG5cblx0XHRcdFx0XHQvLyBSZW1vdmUgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIGFzIHdlIGRvbid0IHN1cHBvcnQgZGVlcCBjcmVhdGVcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHNQcm9wZXJ0eVBhdGggaW4gbVByb3BlcnR5VmFsdWVzKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvUHJvcGVydHkgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9LyR7c1Byb3BlcnR5UGF0aH1gKTtcblx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHkgJiYgb1Byb3BlcnR5LiRraW5kICE9PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIG1Qcm9wZXJ0eVZhbHVlc1tzUHJvcGVydHlQYXRoXSkge1xuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5kYXRhW3NQcm9wZXJ0eVBhdGhdID0gbVByb3BlcnR5VmFsdWVzW3NQcm9wZXJ0eVBhdGhdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHJldHVybiB0cmFuc2FjdGlvbkhlbHBlci5jcmVhdGVEb2N1bWVudChcblx0XHRcdFx0XHRcdG9MaXN0QmluZGluZyxcblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0dGhpcy5nZXRNZXNzYWdlSGFuZGxlcigpLFxuXHRcdFx0XHRcdFx0YkZyb21Db3B5UGFzdGUsXG5cdFx0XHRcdFx0XHR0aGlzLmdldFZpZXcoKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLmFsbChhQ3JlYXRpb25Qcm9taXNlcyk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGFDb250ZXh0czogYW55KSB7XG5cdFx0XHRcdC8vIHRyYW5zaWVudCBjb250ZXh0cyBhcmUgcmVsaWFibHkgcmVtb3ZlZCBvbmNlIG9OZXdDb250ZXh0LmNyZWF0ZWQoKSBpcyByZXNvbHZlZFxuXHRcdFx0XHRhRmluYWxDb250ZXh0cyA9IGFDb250ZXh0cztcblx0XHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKFxuXHRcdFx0XHRcdGFDb250ZXh0cy5tYXAoZnVuY3Rpb24gKG9OZXdDb250ZXh0OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmICghb05ld0NvbnRleHQuYkluYWN0aXZlKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBvTmV3Q29udGV4dC5jcmVhdGVkKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cblx0XHRcdFx0Ly8gaWYgdGhlcmUgYXJlIHRyYW5zaWVudCBjb250ZXh0cywgd2UgbXVzdCBhdm9pZCByZXF1ZXN0aW5nIHNpZGUgZWZmZWN0c1xuXHRcdFx0XHQvLyB0aGlzIGlzIGF2b2lkIGEgcG90ZW50aWFsIGxpc3QgcmVmcmVzaCwgdGhlcmUgY291bGQgYmUgYSBzaWRlIGVmZmVjdCB0aGF0IHJlZnJlc2hlcyB0aGUgbGlzdCBiaW5kaW5nXG5cdFx0XHRcdC8vIGlmIGxpc3QgYmluZGluZyBpcyByZWZyZXNoZWQsIHRyYW5zaWVudCBjb250ZXh0cyBtaWdodCBiZSBsb3N0XG5cdFx0XHRcdGlmICghQ29tbW9uVXRpbHMuaGFzVHJhbnNpZW50Q29udGV4dChvTGlzdEJpbmRpbmcpKSB7XG5cdFx0XHRcdFx0dGhpcy5fb0FwcENvbXBvbmVudFxuXHRcdFx0XHRcdFx0LmdldFNpZGVFZmZlY3RzU2VydmljZSgpXG5cdFx0XHRcdFx0XHQucmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5KG9MaXN0QmluZGluZy5nZXRQYXRoKCksIG9CaW5kaW5nQ29udGV4dCBhcyBDb250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgY3JlYXRpbmcgbXVsdGlwbGUgZG9jdW1lbnRzLlwiKTtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGVycik7XG5cdFx0XHR9KVxuXHRcdFx0LmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRCdXN5TG9ja2VyLnVubG9jayhvTG9ja09iamVjdCk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gYUZpbmFsQ29udGV4dHM7XG5cdFx0XHR9KTtcblx0fVxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0ZGVsZXRlTXVsdGlwbGVEb2N1bWVudHMoYUNvbnRleHRzOiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRjb25zdCBvTG9ja09iamVjdCA9IHRoaXMuZ2V0R2xvYmFsVUlNb2RlbCgpO1xuXHRcdGNvbnN0IG9Db250cm9sID0gdGhpcy5nZXRWaWV3KCkuYnlJZChtUGFyYW1ldGVycy5jb250cm9sSWQpO1xuXHRcdGlmICghb0NvbnRyb2wpIHtcblx0XHRcdHRocm93IG5ldyBFcnJvcihcInBhcmFtZXRlciBjb250cm9sSWQgbWlzc2luZyBvciBpbmNvcnJlY3RcIik7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wgPSBvQ29udHJvbDtcblx0XHR9XG5cdFx0Y29uc3Qgb0xpc3RCaW5kaW5nID0gb0NvbnRyb2wuZ2V0QmluZGluZyhcIml0ZW1zXCIpIHx8ICgob0NvbnRyb2wgYXMgVGFibGUpLmdldFJvd0JpbmRpbmcoKSBhcyBhbnkpO1xuXHRcdG1QYXJhbWV0ZXJzLmJGaW5kQWN0aXZlQ29udGV4dHMgPSB0cnVlO1xuXHRcdEJ1c3lMb2NrZXIubG9jayhvTG9ja09iamVjdCk7XG5cblx0XHRyZXR1cm4gdGhpcy5kZWxldGVEb2N1bWVudFRyYW5zYWN0aW9uKGFDb250ZXh0cywgbVBhcmFtZXRlcnMpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdGxldCBvUmVzdWx0O1xuXG5cdFx0XHRcdC8vIE11bHRpcGxlIG9iamVjdCBkZWxldGlvbiBpcyB0cmlnZ2VyZWQgZnJvbSBhIGxpc3Rcblx0XHRcdFx0Ly8gRmlyc3QgY2xlYXIgdGhlIHNlbGVjdGlvbiBpbiB0aGUgdGFibGUgYXMgaXQncyBub3QgdmFsaWQgYW55IG1vcmVcblx0XHRcdFx0aWYgKG9Db250cm9sLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0XHQob0NvbnRyb2wgYXMgYW55KS5jbGVhclNlbGVjdGlvbigpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gVGhlbiByZWZyZXNoIHRoZSBsaXN0LWJpbmRpbmcgKExSKSwgb3IgcmVxdWlyZSBzaWRlLWVmZmVjdHMgKE9QKVxuXHRcdFx0XHRjb25zdCBvQmluZGluZ0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0XHRpZiAoKG9MaXN0QmluZGluZyBhcyBhbnkpLmlzUm9vdCgpKSB7XG5cdFx0XHRcdFx0Ly8ga2VlcCBwcm9taXNlIGNoYWluIHBlbmRpbmcgdW50aWwgcmVmcmVzaCBvZiBsaXN0YmluZGluZyBpcyBjb21wbGV0ZWRcblx0XHRcdFx0XHRvUmVzdWx0ID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcblx0XHRcdFx0XHRcdG9MaXN0QmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRvTGlzdEJpbmRpbmcucmVmcmVzaCgpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0XHRcdC8vIGlmIHRoZXJlIGFyZSB0cmFuc2llbnQgY29udGV4dHMsIHdlIG11c3QgYXZvaWQgcmVxdWVzdGluZyBzaWRlIGVmZmVjdHNcblx0XHRcdFx0XHQvLyB0aGlzIGlzIGF2b2lkIGEgcG90ZW50aWFsIGxpc3QgcmVmcmVzaCwgdGhlcmUgY291bGQgYmUgYSBzaWRlIGVmZmVjdCB0aGF0IHJlZnJlc2hlcyB0aGUgbGlzdCBiaW5kaW5nXG5cdFx0XHRcdFx0Ly8gaWYgbGlzdCBiaW5kaW5nIGlzIHJlZnJlc2hlZCwgdHJhbnNpZW50IGNvbnRleHRzIG1pZ2h0IGJlIGxvc3Rcblx0XHRcdFx0XHRpZiAoIUNvbW1vblV0aWxzLmhhc1RyYW5zaWVudENvbnRleHQob0xpc3RCaW5kaW5nKSkge1xuXHRcdFx0XHRcdFx0dGhpcy5fb0FwcENvbXBvbmVudFxuXHRcdFx0XHRcdFx0XHQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKClcblx0XHRcdFx0XHRcdFx0LnJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eShvTGlzdEJpbmRpbmcuZ2V0UGF0aCgpLCBvQmluZGluZ0NvbnRleHQgYXMgQ29udGV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKCF0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdC8vIGRlbGV0aW5nIGF0IGxlYXN0IG9uZSBvYmplY3Qgc2hvdWxkIGFsc28gc2V0IHRoZSBVSSB0byBkaXJ0eVxuXHRcdFx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c2VuZChcblx0XHRcdFx0XHR0aGlzLmdldFZpZXcoKSxcblx0XHRcdFx0XHRBY3Rpdml0eS5EZWxldGUsXG5cdFx0XHRcdFx0YUNvbnRleHRzLm1hcCgoY29udGV4dDogQ29udGV4dCkgPT4gY29udGV4dC5nZXRQYXRoKCkpXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0cmV0dXJuIG9SZXN1bHQ7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBkZWxldGluZyB0aGUgZG9jdW1lbnQocylcIiwgb0Vycm9yKTtcblx0XHRcdH0pXG5cdFx0XHQuZmluYWxseShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlY2lkZXMgaWYgYSBkb2N1bWVudCBpcyB0byBiZSBzaG93biBpbiBkaXNwbGF5IG9yIGVkaXQgbW9kZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIF9jb21wdXRlRWRpdE1vZGVcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVybmFsRWRpdEZsb3dcblx0ICogQHBhcmFtIHtzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0gb0NvbnRleHQgVGhlIGNvbnRleHQgdG8gYmUgZGlzcGxheWVkIG9yIGVkaXRlZFxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZSByZXNvbHZlcyBvbmNlIHRoZSBlZGl0IG1vZGUgaXMgY29tcHV0ZWRcblx0ICovXG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIGNvbXB1dGVFZGl0TW9kZShvQ29udGV4dDogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgc0N1c3RvbUFjdGlvbiA9IHRoaXMuZ2V0SW50ZXJuYWxNb2RlbCgpLmdldFByb3BlcnR5KFwiL3NDdXN0b21BY3Rpb25cIik7XG5cdFx0Y29uc3Qgc1Byb2dyYW1taW5nTW9kZWwgPSB0aGlzLmdldFByb2dyYW1taW5nTW9kZWwob0NvbnRleHQpO1xuXG5cdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0KSB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHR0aGlzLnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLkNsZWFyKTtcblxuXHRcdFx0XHRjb25zdCBiSXNBY3RpdmVFbnRpdHkgPSBhd2FpdCBvQ29udGV4dC5yZXF1ZXN0T2JqZWN0KFwiSXNBY3RpdmVFbnRpdHlcIik7XG5cdFx0XHRcdGlmIChiSXNBY3RpdmVFbnRpdHkgPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0Ly8gaW4gY2FzZSB0aGUgZG9jdW1lbnQgaXMgZHJhZnQgc2V0IGl0IGluIGVkaXQgbW9kZVxuXHRcdFx0XHRcdHRoaXMuc2V0RWRpdE1vZGUoRWRpdE1vZGUuRWRpdGFibGUpO1xuXHRcdFx0XHRcdGNvbnN0IGJIYXNBY3RpdmVFbnRpdHkgPSBhd2FpdCBvQ29udGV4dC5yZXF1ZXN0T2JqZWN0KFwiSGFzQWN0aXZlRW50aXR5XCIpO1xuXHRcdFx0XHRcdHRoaXMuc2V0RWRpdE1vZGUodW5kZWZpbmVkLCAhYkhhc0FjdGl2ZUVudGl0eSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gYWN0aXZlIGRvY3VtZW50LCBzdGF5IG9uIGRpc3BsYXkgbW9kZVxuXHRcdFx0XHRcdHRoaXMuc2V0RWRpdE1vZGUoRWRpdE1vZGUuRGlzcGxheSwgZmFsc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBkZXRlcm1pbmluZyB0aGUgZWRpdE1vZGUgZm9yIGRyYWZ0XCIsIG9FcnJvcik7XG5cdFx0XHRcdHRocm93IG9FcnJvcjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSkge1xuXHRcdFx0aWYgKHNDdXN0b21BY3Rpb24gJiYgc0N1c3RvbUFjdGlvbiAhPT0gXCJcIiAmJiB0aGlzLl9oYXNOZXdBY3Rpb25Gb3JTdGlja3kob0NvbnRleHQsIHRoaXMuZ2V0VmlldygpLCBzQ3VzdG9tQWN0aW9uKSkge1xuXHRcdFx0XHR0aGlzLmdldFRyYW5zYWN0aW9uSGVscGVyKCkuX2JDcmVhdGVNb2RlID0gdHJ1ZTtcblx0XHRcdFx0dGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpLmhhbmRsZURvY3VtZW50TW9kaWZpY2F0aW9ucygpO1xuXHRcdFx0XHR0aGlzLnNldEVkaXRNb2RlKEVkaXRNb2RlLkVkaXRhYmxlLCB0cnVlKTtcblx0XHRcdFx0RWRpdFN0YXRlLnNldEVkaXRTdGF0ZURpcnR5KCk7XG5cdFx0XHRcdHRoaXMuaGFuZGxlU3RpY2t5T24ob0NvbnRleHQpO1xuXHRcdFx0XHR0aGlzLmdldEludGVybmFsTW9kZWwoKS5zZXRQcm9wZXJ0eShcIi9zQ3VzdG9tQWN0aW9uXCIsIFwiXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBlZGl0IG1vZGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzRWRpdE1vZGVcblx0ICogQHBhcmFtIGJDcmVhdGlvbk1vZGUgQ3JlYXRlTW9kZSBmbGFnIHRvIGlkZW50aWZ5IHRoZSBjcmVhdGlvbiBtb2RlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0c2V0RWRpdE1vZGUoc0VkaXRNb2RlPzogc3RyaW5nLCBiQ3JlYXRpb25Nb2RlPzogYm9vbGVhbikge1xuXHRcdC8vIGF0IHRoaXMgcG9pbnQgb2YgdGltZSBpdCdzIG5vdCBtZWFudCB0byByZWxlYXNlIHRoZSBlZGl0IGZsb3cgZm9yIGZyZWVzdHlsZSB1c2FnZSB0aGVyZWZvcmUgd2UgY2FuXG5cdFx0Ly8gcmVseSBvbiB0aGUgZ2xvYmFsIFVJIG1vZGVsIHRvIGV4aXN0XG5cdFx0Y29uc3Qgb0dsb2JhbE1vZGVsID0gdGhpcy5nZXRHbG9iYWxVSU1vZGVsKCk7XG5cblx0XHRpZiAoc0VkaXRNb2RlKSB7XG5cdFx0XHRvR2xvYmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiLCBzRWRpdE1vZGUgPT09IFwiRWRpdGFibGVcIiwgdW5kZWZpbmVkLCB0cnVlKTtcblx0XHR9XG5cblx0XHRpZiAoYkNyZWF0aW9uTW9kZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBTaW5jZSBzZXRDcmVhdGlvbk1vZGUgaXMgcHVibGljIGluIEVkaXRGbG93IGFuZCBjYW4gYmUgb3ZlcnJpZGVuLCBtYWtlIHN1cmUgdG8gY2FsbCBpdCB2aWEgdGhlIGNvbnRyb2xsZXJcblx0XHRcdC8vIHRvIGVuc3VyZSBhbnkgb3ZlcnJpZGVzIGFyZSB0YWtlbiBpbnRvIGFjY291bnRcblx0XHRcdHRoaXMuc2V0Q3JlYXRpb25Nb2RlKGJDcmVhdGlvbk1vZGUpO1xuXHRcdH1cblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRzZXREcmFmdFN0YXR1cyhzRHJhZnRTdGF0ZTogYW55KSB7XG5cdFx0Ly8gYXQgdGhpcyBwb2ludCBvZiB0aW1lIGl0J3Mgbm90IG1lYW50IHRvIHJlbGVhc2UgdGhlIGVkaXQgZmxvdyBmb3IgZnJlZXN0eWxlIHVzYWdlIHRoZXJlZm9yZSB3ZSBjYW5cblx0XHQvLyByZWx5IG9uIHRoZSBnbG9iYWwgVUkgbW9kZWwgdG8gZXhpc3Rcblx0XHQodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRNb2RlbChcInVpXCIpIGFzIEpTT05Nb2RlbCkuc2V0UHJvcGVydHkoXCIvZHJhZnRTdGF0dXNcIiwgc0RyYWZ0U3RhdGUsIHVuZGVmaW5lZCwgdHJ1ZSk7XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0Um91dGluZ0xpc3RlbmVyKCkge1xuXHRcdC8vIGF0IHRoaXMgcG9pbnQgb2YgdGltZSBpdCdzIG5vdCBtZWFudCB0byByZWxlYXNlIHRoZSBlZGl0IGZsb3cgZm9yIEZQTSBjdXN0b20gcGFnZXMgYW5kIHRoZSByb3V0aW5nXG5cdFx0Ly8gbGlzdGVuZXIgaXMgbm90IHlldCBwdWJsaWMgdGhlcmVmb3JlIGtlZXAgdGhlIGxvZ2ljIGhlcmUgZm9yIG5vd1xuXG5cdFx0aWYgKHRoaXMuYmFzZS5fcm91dGluZykge1xuXHRcdFx0cmV0dXJuIHRoaXMuYmFzZS5fcm91dGluZztcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiRWRpdCBGbG93IHdvcmtzIG9ubHkgd2l0aCBhIGdpdmVuIHJvdXRpbmcgbGlzdGVuZXJcIik7XG5cdFx0fVxuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldEdsb2JhbFVJTW9kZWwoKTogSlNPTk1vZGVsIHtcblx0XHQvLyBhdCB0aGlzIHBvaW50IG9mIHRpbWUgaXQncyBub3QgbWVhbnQgdG8gcmVsZWFzZSB0aGUgZWRpdCBmbG93IGZvciBmcmVlc3R5bGUgdXNhZ2UgdGhlcmVmb3JlIHdlIGNhblxuXHRcdC8vIHJlbHkgb24gdGhlIGdsb2JhbCBVSSBtb2RlbCB0byBleGlzdFxuXHRcdHJldHVybiB0aGlzLmJhc2UuZ2V0VmlldygpLmdldE1vZGVsKFwidWlcIikgYXMgSlNPTk1vZGVsO1xuXHR9XG5cblx0LyoqXG5cdCAqIFBlcmZvcm1zIGEgdGFzayBpbiBzeW5jIHdpdGggb3RoZXIgdGFza3MgY3JlYXRlZCB2aWEgdGhpcyBmdW5jdGlvbi5cblx0ICogUmV0dXJucyB0aGUgcHJvbWlzZSBjaGFpbiBvZiB0aGUgdGFzay5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I3N5bmNUYXNrXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBbdlRhc2tdIE9wdGlvbmFsLCBhIHByb21pc2Ugb3IgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQgc3luY2hyb25vdXNseVxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIG9uY2UgdGhlIHRhc2sgaXMgY29tcGxldGVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRzeW5jVGFzayh2VGFzaz86IEZ1bmN0aW9uIHwgUHJvbWlzZTxhbnk+KSB7XG5cdFx0bGV0IGZuTmV3VGFzaztcblx0XHRpZiAodlRhc2sgaW5zdGFuY2VvZiBQcm9taXNlKSB7XG5cdFx0XHRmbk5ld1Rhc2sgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiB2VGFzaztcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgdlRhc2sgPT09IFwiZnVuY3Rpb25cIikge1xuXHRcdFx0Zm5OZXdUYXNrID0gdlRhc2s7XG5cdFx0fVxuXG5cdFx0dGhpcy5fcFRhc2tzID0gdGhpcy5fcFRhc2tzIHx8IFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdGlmIChmbk5ld1Rhc2spIHtcblx0XHRcdHRoaXMuX3BUYXNrcyA9IHRoaXMuX3BUYXNrcy50aGVuKGZuTmV3VGFzaykuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fcFRhc2tzO1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldFByb2dyYW1taW5nTW9kZWwob0NvbnRleHQ/OiBhbnkpOiB0eXBlb2YgUHJvZ3JhbW1pbmdNb2RlbCB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VHJhbnNhY3Rpb25IZWxwZXIoKS5nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRkZWxldGVEb2N1bWVudFRyYW5zYWN0aW9uKG9Db250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSAodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkub1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0dHJhbnNhY3Rpb25IZWxwZXIgPSB0aGlzLmdldFRyYW5zYWN0aW9uSGVscGVyKCk7XG5cblx0XHRtUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXG5cdFx0Ly8gVE9ETzogdGhpcyBzZXR0aW5nIGFuZCByZW1vdmluZyBvZiBjb250ZXh0cyBzaG91bGRuJ3QgYmUgaW4gdGhlIHRyYW5zYWN0aW9uIGhlbHBlciBhdCBhbGxcblx0XHQvLyBmb3IgdGhlIHRpbWUgYmVpbmcgSSBrZXB0IGl0IGFuZCBwcm92aWRlIHRoZSBpbnRlcm5hbCBtb2RlbCBjb250ZXh0IHRvIG5vdCBicmVhayBzb21ldGhpbmdcblx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCA9IG1QYXJhbWV0ZXJzLmNvbnRyb2xJZFxuXHRcdFx0PyBzYXAudWkuZ2V0Q29yZSgpLmJ5SWQobVBhcmFtZXRlcnMuY29udHJvbElkKT8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKVxuXHRcdFx0OiBudWxsO1xuXG5cdFx0cmV0dXJuIHRoaXMuc3luY1Rhc2soKVxuXHRcdFx0LnRoZW4oXG5cdFx0XHRcdHRyYW5zYWN0aW9uSGVscGVyLmRlbGV0ZURvY3VtZW50LmJpbmQodHJhbnNhY3Rpb25IZWxwZXIsIG9Db250ZXh0LCBtUGFyYW1ldGVycywgb1Jlc291cmNlQnVuZGxlLCB0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkpXG5cdFx0XHQpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGludGVybmFsTW9kZWwgPSB0aGlzLmdldEludGVybmFsTW9kZWwoKTtcblx0XHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcIi9zZXNzaW9uT25cIiwgZmFsc2UpO1xuXHRcdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3N0aWNreVNlc3Npb25Ub2tlblwiLCB1bmRlZmluZWQpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG9FcnJvcik7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHRoZSBjcmVhdGUgZXZlbnQ6IHNob3dzIG1lc3NhZ2VzIGFuZCBpbiBjYXNlIG9mIGEgZHJhZnQsIHVwZGF0ZXMgdGhlIGRyYWZ0IGluZGljYXRvci5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvQmluZGluZyBPRGF0YSBsaXN0IGJpbmRpbmcgb2JqZWN0XG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0aGFuZGxlQ3JlYXRlRXZlbnRzKG9CaW5kaW5nOiBhbnkpIHtcblx0XHRjb25zdCB0cmFuc2FjdGlvbkhlbHBlciA9IHRoaXMuZ2V0VHJhbnNhY3Rpb25IZWxwZXIoKTtcblxuXHRcdHRoaXMuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuQ2xlYXIpO1xuXG5cdFx0b0JpbmRpbmcgPSAob0JpbmRpbmcuZ2V0QmluZGluZyAmJiBvQmluZGluZy5nZXRCaW5kaW5nKCkpIHx8IG9CaW5kaW5nO1xuXHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsID0gdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKG9CaW5kaW5nKTtcblxuXHRcdG9CaW5kaW5nLmF0dGFjaEV2ZW50KFwiY3JlYXRlU2VudFwiLCAoKSA9PiB7XG5cdFx0XHR0cmFuc2FjdGlvbkhlbHBlci5oYW5kbGVEb2N1bWVudE1vZGlmaWNhdGlvbnMoKTtcblx0XHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0XHR0aGlzLnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLlNhdmluZyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0b0JpbmRpbmcuYXR0YWNoRXZlbnQoXCJjcmVhdGVDb21wbGV0ZWRcIiwgKG9FdmVudDogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBiU3VjY2VzcyA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJzdWNjZXNzXCIpO1xuXHRcdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0KSB7XG5cdFx0XHRcdHRoaXMuc2V0RHJhZnRTdGF0dXMoYlN1Y2Nlc3MgPyBEcmFmdFN0YXR1cy5TYXZlZCA6IERyYWZ0U3RhdHVzLkNsZWFyKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZURpYWxvZygpO1xuXHRcdH0pO1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldFRyYW5zYWN0aW9uSGVscGVyKCkge1xuXHRcdGlmICghdGhpcy5fb1RyYW5zYWN0aW9uSGVscGVyKSB7XG5cdFx0XHQvLyBjdXJyZW50bHkgYWxzbyB0aGUgdHJhbnNhY3Rpb24gaGVscGVyIGlzIGxvY2tpbmcgdGhlcmVmb3JlIHBhc3NpbmcgbG9jayBvYmplY3Rcblx0XHRcdHRoaXMuX29UcmFuc2FjdGlvbkhlbHBlciA9IG5ldyBUcmFuc2FjdGlvbkhlbHBlcih0aGlzLl9vQXBwQ29tcG9uZW50LCB0aGlzLmdldEdsb2JhbFVJTW9kZWwoKSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMuX29UcmFuc2FjdGlvbkhlbHBlcjtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRJbnRlcm5hbE1vZGVsKCk6IEpTT05Nb2RlbCB7XG5cdFx0cmV0dXJuIHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBwcm9taXNlIHRvIHdhaXQgZm9yIGFuIGFjdGlvbiB0byBiZSBleGVjdXRlZFxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2NyZWF0ZUFjdGlvblByb21pc2Vcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIHJlc29sdmVyIGZ1bmN0aW9uIHdoaWNoIGNhbiBiZSB1c2VkIHRvIGV4dGVybmFsbHkgcmVzb2x2ZSB0aGUgcHJvbWlzZVxuXHQgKi9cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Y3JlYXRlQWN0aW9uUHJvbWlzZShzQWN0aW9uTmFtZTogYW55LCBzQ29udHJvbElkOiBhbnkpIHtcblx0XHRsZXQgZlJlc29sdmVyLCBmUmVqZWN0b3I7XG5cdFx0dGhpcy5vQWN0aW9uUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdGZSZXNvbHZlciA9IHJlc29sdmU7XG5cdFx0XHRmUmVqZWN0b3IgPSByZWplY3Q7XG5cdFx0fSkudGhlbigob1Jlc3BvbnNlOiBhbnkpID0+IHtcblx0XHRcdHJldHVybiBPYmplY3QuYXNzaWduKHsgY29udHJvbElkOiBzQ29udHJvbElkIH0sIHRoaXMuZ2V0QWN0aW9uUmVzcG9uc2VEYXRhQW5kS2V5cyhzQWN0aW9uTmFtZSwgb1Jlc3BvbnNlKSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHsgZlJlc29sdmVyOiBmUmVzb2x2ZXIsIGZSZWplY3RvcjogZlJlamVjdG9yIH07XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgZ2V0Q3VycmVudEFjdGlvblByb21pc2Ugb2JqZWN0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2dldEN1cnJlbnRBY3Rpb25Qcm9taXNlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBwcm9taXNlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0Q3VycmVudEFjdGlvblByb21pc2UoKSB7XG5cdFx0cmV0dXJuIHRoaXMub0FjdGlvblByb21pc2U7XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0ZGVsZXRlQ3VycmVudEFjdGlvblByb21pc2UoKSB7XG5cdFx0dGhpcy5vQWN0aW9uUHJvbWlzZSA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0QWN0aW9uUmVzcG9uc2VEYXRhQW5kS2V5c1xuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdGhhdCBpcyBleGVjdXRlZFxuXHQgKiBAcGFyYW0gb1Jlc3BvbnNlIFRoZSBib3VuZCBhY3Rpb24ncyByZXNwb25zZSBkYXRhIG9yIHJlc3BvbnNlIGNvbnRleHRcblx0ICogQHJldHVybnMgT2JqZWN0IHdpdGggZGF0YSBhbmQgbmFtZXMgb2YgdGhlIGtleSBmaWVsZHMgb2YgdGhlIHJlc3BvbnNlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0QWN0aW9uUmVzcG9uc2VEYXRhQW5kS2V5cyhzQWN0aW9uTmFtZTogc3RyaW5nLCBvUmVzcG9uc2U6IGFueSkge1xuXHRcdGlmIChBcnJheS5pc0FycmF5KG9SZXNwb25zZSkpIHtcblx0XHRcdGlmIChvUmVzcG9uc2UubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdG9SZXNwb25zZSA9IG9SZXNwb25zZVswXS52YWx1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBudWxsO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIW9SZXNwb25zZSkge1xuXHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0fVxuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRvTWV0YU1vZGVsID0gKG9WaWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgYW55KS5nZXREYXRhKCksXG5cdFx0XHRzQWN0aW9uUmV0dXJuVHlwZSA9XG5cdFx0XHRcdG9NZXRhTW9kZWwgJiYgb01ldGFNb2RlbFtzQWN0aW9uTmFtZV0gJiYgb01ldGFNb2RlbFtzQWN0aW9uTmFtZV1bMF0gJiYgb01ldGFNb2RlbFtzQWN0aW9uTmFtZV1bMF0uJFJldHVyblR5cGVcblx0XHRcdFx0XHQ/IG9NZXRhTW9kZWxbc0FjdGlvbk5hbWVdWzBdLiRSZXR1cm5UeXBlLiRUeXBlXG5cdFx0XHRcdFx0OiBudWxsLFxuXHRcdFx0YUtleSA9IHNBY3Rpb25SZXR1cm5UeXBlICYmIG9NZXRhTW9kZWxbc0FjdGlvblJldHVyblR5cGVdID8gb01ldGFNb2RlbFtzQWN0aW9uUmV0dXJuVHlwZV0uJEtleSA6IG51bGw7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0b0RhdGE6IG9SZXNwb25zZS5nZXRPYmplY3QoKSxcblx0XHRcdGtleXM6IGFLZXlcblx0XHR9O1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldE1lc3NhZ2VIYW5kbGVyKCkge1xuXHRcdC8vIGF0IHRoaXMgcG9pbnQgb2YgdGltZSBpdCdzIG5vdCBtZWFudCB0byByZWxlYXNlIHRoZSBlZGl0IGZsb3cgZm9yIEZQTSBjdXN0b20gcGFnZXMgdGhlcmVmb3JlIGtlZXBcblx0XHQvLyB0aGUgbG9naWMgaGVyZSBmb3Igbm93XG5cblx0XHRpZiAodGhpcy5iYXNlLm1lc3NhZ2VIYW5kbGVyKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5iYXNlLm1lc3NhZ2VIYW5kbGVyO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFZGl0IEZsb3cgd29ya3Mgb25seSB3aXRoIGEgZ2l2ZW4gbWVzc2FnZSBoYW5kbGVyXCIpO1xuXHRcdH1cblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRoYW5kbGVTdGlja3lPbihvQ29udGV4dDogQ29udGV4dCkge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5nZXRWaWV3KCkpO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGlmIChvQXBwQ29tcG9uZW50ID09PSB1bmRlZmluZWQgfHwgb0NvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJ1bmRlZmluZWQgQXBwQ29tcG9uZW50IG9yIENvbnRleHQgZm9yIGZ1bmN0aW9uIGhhbmRsZVN0aWNreU9uXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIW9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5oYXNOYXZpZ2F0aW9uR3VhcmQoKSkge1xuXHRcdFx0XHRjb25zdCBzSGFzaFRyYWNrZXIgPSBvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkuZ2V0SGFzaCgpLFxuXHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsID0gdGhpcy5nZXRJbnRlcm5hbE1vZGVsKCk7XG5cblx0XHRcdFx0Ly8gU2V0IGEgZ3VhcmQgaW4gdGhlIFJvdXRlclByb3h5XG5cdFx0XHRcdC8vIEEgdGltZW91dCBpcyBuZWNlc3NhcnksIGFzIHdpdGggZGVmZXJyZWQgY3JlYXRpb24gdGhlIGhhc2hDaGFuZ2VyIGlzIG5vdCB1cGRhdGVkIHlldCB3aXRoXG5cdFx0XHRcdC8vIHRoZSBuZXcgaGFzaCwgYW5kIHRoZSBndWFyZCBjYW5ub3QgYmUgZm91bmQgaW4gdGhlIG1hbmFnZWQgaGlzdG9yeSBvZiB0aGUgcm91dGVyIHByb3h5XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5zZXROYXZpZ2F0aW9uR3VhcmQob0NvbnRleHQuZ2V0UGF0aCgpLnN1YnN0cmluZygxKSk7XG5cdFx0XHRcdH0sIDApO1xuXG5cdFx0XHRcdC8vIFNldHRpbmcgYmFjayBuYXZpZ2F0aW9uIG9uIHNoZWxsIHNlcnZpY2UsIHRvIGdldCB0aGUgZGljYXJkIG1lc3NhZ2UgYm94IGluIGNhc2Ugb2Ygc3RpY2t5XG5cdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldEJhY2tOYXZpZ2F0aW9uKHRoaXMub25CYWNrTmF2aWdhdGlvbkluU2Vzc2lvbi5iaW5kKHRoaXMpKTtcblxuXHRcdFx0XHR0aGlzLmZuRGlydHlTdGF0ZVByb3ZpZGVyID0gdGhpcy5fcmVnaXN0ZXJEaXJ0eVN0YXRlUHJvdmlkZXIob0FwcENvbXBvbmVudCwgb0ludGVybmFsTW9kZWwsIHNIYXNoVHJhY2tlcik7XG5cdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnJlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKHRoaXMuZm5EaXJ0eVN0YXRlUHJvdmlkZXIpO1xuXG5cdFx0XHRcdC8vIGhhbmRsZSBzZXNzaW9uIHRpbWVvdXRcblx0XHRcdFx0Y29uc3QgaTE4bk1vZGVsID0gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJzYXAuZmUuaTE4blwiKTtcblx0XHRcdFx0dGhpcy5mbkhhbmRsZVNlc3Npb25UaW1lb3V0ID0gdGhpcy5fYXR0YWNoU2Vzc2lvblRpbWVvdXQob0NvbnRleHQsIGkxOG5Nb2RlbCk7XG5cdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRNb2RlbCgpIGFzIGFueSkuYXR0YWNoU2Vzc2lvblRpbWVvdXQodGhpcy5mbkhhbmRsZVNlc3Npb25UaW1lb3V0KTtcblxuXHRcdFx0XHR0aGlzLmZuU3RpY2t5RGlzY2FyZEFmdGVyTmF2aWdhdGlvbiA9IHRoaXMuX2F0dGFjaFJvdXRlTWF0Y2hlZCh0aGlzLCBvQ29udGV4dCwgb0FwcENvbXBvbmVudCk7XG5cdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0Um91dGluZ1NlcnZpY2UoKS5hdHRhY2hSb3V0ZU1hdGNoZWQodGhpcy5mblN0aWNreURpc2NhcmRBZnRlck5hdmlnYXRpb24pO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRMb2cuaW5mbyhlcnJvciBhcyBhbnkpO1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0aGFuZGxlU3RpY2t5T2ZmKCkge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5nZXRWaWV3KCkpO1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAob0FwcENvbXBvbmVudCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcInVuZGVmaW5lZCBBcHBDb21wb25lbnQgZm9yIGZ1bmN0aW9uIGhhbmRsZVN0aWNreU9mZlwiKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9BcHBDb21wb25lbnQgJiYgb0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSkge1xuXHRcdFx0XHQvLyBJZiB3ZSBoYXZlIGV4aXRlZCBmcm9tIHRoZSBhcHAsIENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCBkb2Vzbid0IHJldHVybiBhXG5cdFx0XHRcdC8vIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudCwgaGVuY2UgdGhlICdpZicgYWJvdmVcblx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLmRpc2NhcmROYXZpZ2F0aW9uR3VhcmQoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuZm5EaXJ0eVN0YXRlUHJvdmlkZXIpIHtcblx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkuZGVyZWdpc3RlckRpcnR5U3RhdGVQcm92aWRlcih0aGlzLmZuRGlydHlTdGF0ZVByb3ZpZGVyKTtcblx0XHRcdFx0dGhpcy5mbkRpcnR5U3RhdGVQcm92aWRlciA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCkgJiYgdGhpcy5mbkhhbmRsZVNlc3Npb25UaW1lb3V0KSB7XG5cdFx0XHRcdCh0aGlzLmdldFZpZXcoKS5nZXRNb2RlbCgpIGFzIGFueSkuZGV0YWNoU2Vzc2lvblRpbWVvdXQodGhpcy5mbkhhbmRsZVNlc3Npb25UaW1lb3V0KTtcblx0XHRcdH1cblxuXHRcdFx0b0FwcENvbXBvbmVudC5nZXRSb3V0aW5nU2VydmljZSgpLmRldGFjaFJvdXRlTWF0Y2hlZCh0aGlzLmZuU3RpY2t5RGlzY2FyZEFmdGVyTmF2aWdhdGlvbik7XG5cdFx0XHR0aGlzLmZuU3RpY2t5RGlzY2FyZEFmdGVyTmF2aWdhdGlvbiA9IHVuZGVmaW5lZDtcblxuXHRcdFx0dGhpcy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpLl9iQ3JlYXRlTW9kZSA9IGZhbHNlO1xuXHRcdFx0dGhpcy5zZXRFZGl0TW9kZShFZGl0TW9kZS5EaXNwbGF5LCBmYWxzZSk7XG5cblx0XHRcdGlmIChvQXBwQ29tcG9uZW50KSB7XG5cdFx0XHRcdC8vIElmIHdlIGhhdmUgZXhpdGVkIGZyb20gdGhlIGFwcCwgQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50IGRvZXNuJ3QgcmV0dXJuIGFcblx0XHRcdFx0Ly8gc2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50LCBoZW5jZSB0aGUgJ2lmJyBhYm92ZVxuXHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKS5zZXRCYWNrTmF2aWdhdGlvbigpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRMb2cuaW5mbyhlcnJvciBhcyBhbnkpO1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogQGRlc2NyaXB0aW9uIE1ldGhvZCB0byBkaXNwbGF5IGEgJ2Rpc2NhcmQnIHBvcG92ZXIgd2hlbiBleGl0aW5nIGEgc3RpY2t5IHNlc3Npb24uXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBvbkJhY2tOYXZpZ2F0aW9uSW5TZXNzaW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5JbnRlcm5hbEVkaXRGbG93XG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0b25CYWNrTmF2aWdhdGlvbkluU2Vzc2lvbigpIHtcblx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0b0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvVmlldyksXG5cdFx0XHRvUm91dGVyUHJveHkgPSBvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCk7XG5cblx0XHRpZiAob1JvdXRlclByb3h5LmNoZWNrSWZCYWNrSXNPdXRPZkd1YXJkKCkpIHtcblx0XHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IG9WaWV3ICYmIG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cblx0XHRcdHN0aWNreS5wcm9jZXNzRGF0YUxvc3NDb25maXJtYXRpb24oXG5cdFx0XHRcdCgpID0+IHtcblx0XHRcdFx0XHR0aGlzLmRpc2NhcmRTdGlja3lTZXNzaW9uKG9CaW5kaW5nQ29udGV4dCk7XG5cdFx0XHRcdFx0aGlzdG9yeS5iYWNrKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG9WaWV3LFxuXHRcdFx0XHR0aGlzLmdldFByb2dyYW1taW5nTW9kZWwob0JpbmRpbmdDb250ZXh0KVxuXHRcdFx0KTtcblxuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRoaXN0b3J5LmJhY2soKTtcblx0fVxuXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRkaXNjYXJkU3RpY2t5U2Vzc2lvbihvQ29udGV4dDogYW55KSB7XG5cdFx0c3RpY2t5LmRpc2NhcmREb2N1bWVudChvQ29udGV4dCk7XG5cdFx0dGhpcy5oYW5kbGVTdGlja3lPZmYoKTtcblx0fVxuXG5cdF9oYXNOZXdBY3Rpb25Gb3JTdGlja3kob0NvbnRleHQ6IGFueSwgb1ZpZXc6IFZpZXcsIHNDdXN0b21BY3Rpb246IHN0cmluZykge1xuXHRcdHRyeSB7XG5cdFx0XHRpZiAob0NvbnRleHQgPT09IHVuZGVmaW5lZCB8fCBvVmlldyA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5wdXQgcGFyYW1ldGVycyBmb3IgZnVuY3Rpb24gX2hhc05ld0FjdGlvbkZvclN0aWNreVwiKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9WaWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRcdHNNZXRhUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKS5zdWJzdHJpbmcoMCwgb0NvbnRleHQuZ2V0UGF0aCgpLmluZGV4T2YoXCIoXCIpKSxcblx0XHRcdFx0b1N0aWNreVNlc3Npb24gPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZGApO1xuXG5cdFx0XHRpZiAob1N0aWNreVNlc3Npb24gJiYgb1N0aWNreVNlc3Npb24uTmV3QWN0aW9uICYmIG9TdGlja3lTZXNzaW9uLk5ld0FjdGlvbiA9PT0gc0N1c3RvbUFjdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAob1N0aWNreVNlc3Npb24gJiYgb1N0aWNreVNlc3Npb24uQWRkaXRpb25hbE5ld0FjdGlvbnMpIHtcblx0XHRcdFx0cmV0dXJuIHNDdXN0b21BY3Rpb24gPT09XG5cdFx0XHRcdFx0b1N0aWNreVNlc3Npb24uQWRkaXRpb25hbE5ld0FjdGlvbnMuZmluZChmdW5jdGlvbiAoc0FkZGl0aW9uYWxBY3Rpb246IHN0cmluZykge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHNBZGRpdGlvbmFsQWN0aW9uID09PSBzQ3VzdG9tQWN0aW9uO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0PyB0cnVlXG5cdFx0XHRcdFx0OiBmYWxzZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0TG9nLmluZm8oZXJyb3IgYXMgYW55KTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cblx0X3JlZ2lzdGVyRGlydHlTdGF0ZVByb3ZpZGVyKG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgb0ludGVybmFsTW9kZWw6IEpTT05Nb2RlbCwgc0hhc2hUcmFja2VyOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gZm5EaXJ0eVN0YXRlUHJvdmlkZXIob05hdmlnYXRpb25Db250ZXh0OiBhbnkpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChvTmF2aWdhdGlvbkNvbnRleHQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5wdXQgcGFyYW1ldGVycyBmb3IgZnVuY3Rpb24gZm5EaXJ0eVN0YXRlUHJvdmlkZXJcIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBzVGFyZ2V0SGFzaCA9IG9OYXZpZ2F0aW9uQ29udGV4dC5pbm5lckFwcFJvdXRlLFxuXHRcdFx0XHRcdG9Sb3V0ZXJQcm94eSA9IG9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKTtcblx0XHRcdFx0bGV0IHNMY2xIYXNoVHJhY2tlciA9IFwiXCI7XG5cdFx0XHRcdGxldCBiRGlydHk6IGJvb2xlYW47XG5cdFx0XHRcdGNvbnN0IGJTZXNzaW9uT04gPSBvSW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShcIi9zZXNzaW9uT25cIik7XG5cblx0XHRcdFx0aWYgKCFiU2Vzc2lvbk9OKSB7XG5cdFx0XHRcdFx0Ly8gSWYgdGhlIHN0aWNreSBzZXNzaW9uIHdhcyB0ZXJtaW5hdGVkIGJlZm9yZSBoYW5kLlxuXHRcdFx0XHRcdC8vIEVleGFtcGxlIGluIGNhc2Ugb2YgbmF2aWdhdGluZyBhd2F5IGZyb20gYXBwbGljYXRpb24gdXNpbmcgSUJOLlxuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoIW9Sb3V0ZXJQcm94eS5pc05hdmlnYXRpb25GaW5hbGl6ZWQoKSkge1xuXHRcdFx0XHRcdC8vIElmIG5hdmlnYXRpb24gaXMgY3VycmVudGx5IGhhcHBlbmluZyBpbiBSb3V0ZXJQcm94eSwgaXQncyBhIHRyYW5zaWVudCBzdGF0ZVxuXHRcdFx0XHRcdC8vIChub3QgZGlydHkpXG5cdFx0XHRcdFx0YkRpcnR5ID0gZmFsc2U7XG5cdFx0XHRcdFx0c0xjbEhhc2hUcmFja2VyID0gc1RhcmdldEhhc2g7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc0hhc2hUcmFja2VyID09PSBzVGFyZ2V0SGFzaCkge1xuXHRcdFx0XHRcdC8vIHRoZSBoYXNoIGRpZG4ndCBjaGFuZ2Ugc28gZWl0aGVyIHRoZSB1c2VyIGF0dGVtcHRzIHRvIHJlZnJlc2ggb3IgdG8gbGVhdmUgdGhlIGFwcFxuXHRcdFx0XHRcdGJEaXJ0eSA9IHRydWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAob1JvdXRlclByb3h5LmNoZWNrSGFzaFdpdGhHdWFyZChzVGFyZ2V0SGFzaCkgfHwgb1JvdXRlclByb3h5LmlzR3VhcmRDcm9zc0FsbG93ZWRCeVVzZXIoKSkge1xuXHRcdFx0XHRcdC8vIHRoZSB1c2VyIGF0dGVtcHRzIHRvIG5hdmlnYXRlIHdpdGhpbiB0aGUgcm9vdCBvYmplY3Rcblx0XHRcdFx0XHQvLyBvciBjcm9zc2luZyB0aGUgZ3VhcmQgaGFzIGFscmVhZHkgYmVlbiBhbGxvd2VkIGJ5IHRoZSBSb3V0ZXJQcm94eVxuXHRcdFx0XHRcdHNMY2xIYXNoVHJhY2tlciA9IHNUYXJnZXRIYXNoO1xuXHRcdFx0XHRcdGJEaXJ0eSA9IGZhbHNlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIHRoZSB1c2VyIGF0dGVtcHRzIHRvIG5hdmlnYXRlIHdpdGhpbiB0aGUgYXBwLCBmb3IgZXhhbXBsZSBiYWNrIHRvIHRoZSBsaXN0IHJlcG9ydFxuXHRcdFx0XHRcdGJEaXJ0eSA9IHRydWU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoYkRpcnR5KSB7XG5cdFx0XHRcdFx0Ly8gdGhlIEZMUCBkb2Vzbid0IGNhbGwgdGhlIGRpcnR5IHN0YXRlIHByb3ZpZGVyIGFueW1vcmUgb25jZSBpdCdzIGRpcnR5LCBhcyB0aGV5IGNhbid0XG5cdFx0XHRcdFx0Ly8gY2hhbmdlIHRoaXMgZHVlIHRvIGNvbXBhdGliaWxpdHkgcmVhc29ucyB3ZSBzZXQgaXQgYmFjayB0byBub3QtZGlydHlcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpLnNldERpcnR5RmxhZyhmYWxzZSk7XG5cdFx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c0hhc2hUcmFja2VyID0gc0xjbEhhc2hUcmFja2VyO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0cmV0dXJuIGJEaXJ0eTtcblx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdExvZy5pbmZvKGVycm9yIGFzIGFueSk7XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fTtcblx0fVxuXG5cdF9hdHRhY2hTZXNzaW9uVGltZW91dChvQ29udGV4dDogYW55LCBpMThuTW9kZWw6IE1vZGVsKSB7XG5cdFx0cmV0dXJuICgpID0+IHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdGlmIChvQ29udGV4dCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ29udGV4dCBtaXNzaW5nIGZvciBmdW5jdGlvbiBmbkhhbmRsZVNlc3Npb25UaW1lb3V0XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIHJlbW92ZSB0cmFuc2llbnQgbWVzc2FnZXMgc2luY2Ugd2Ugd2lsbCBzaG93aW5nIG91ciBvd24gbWVzc2FnZVxuXHRcdFx0XHR0aGlzLmdldE1lc3NhZ2VIYW5kbGVyKCkucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cblx0XHRcdFx0Y29uc3Qgb0RpYWxvZyA9IG5ldyBEaWFsb2coe1xuXHRcdFx0XHRcdHRpdGxlOiBcIntzYXAuZmUuaTE4bj5DX0VESVRGTE9XX09CSkVDVF9QQUdFX1NFU1NJT05fRVhQSVJFRF9ESUFMT0dfVElUTEV9XCIsXG5cdFx0XHRcdFx0c3RhdGU6IFwiV2FybmluZ1wiLFxuXHRcdFx0XHRcdGNvbnRlbnQ6IG5ldyBUZXh0KHsgdGV4dDogXCJ7c2FwLmZlLmkxOG4+Q19FRElURkxPV19PQkpFQ1RfUEFHRV9TRVNTSU9OX0VYUElSRURfRElBTE9HX01FU1NBR0V9XCIgfSksXG5cdFx0XHRcdFx0YmVnaW5CdXR0b246IG5ldyBCdXR0b24oe1xuXHRcdFx0XHRcdFx0dGV4dDogXCJ7c2FwLmZlLmkxOG4+Q19DT01NT05fRElBTE9HX09LfVwiLFxuXHRcdFx0XHRcdFx0dHlwZTogXCJFbXBoYXNpemVkXCIsXG5cdFx0XHRcdFx0XHRwcmVzczogKCkgPT4ge1xuXHRcdFx0XHRcdFx0XHQvLyByZW1vdmUgc3RpY2t5IGhhbmRsaW5nIGFmdGVyIG5hdmlnYXRpb24gc2luY2Ugc2Vzc2lvbiBoYXMgYWxyZWFkeSBiZWVuIHRlcm1pbmF0ZWRcblx0XHRcdFx0XHRcdFx0dGhpcy5oYW5kbGVTdGlja3lPZmYoKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5nZXRSb3V0aW5nTGlzdGVuZXIoKS5uYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dChvQ29udGV4dCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0YWZ0ZXJDbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0b0RpYWxvZy5kZXN0cm95KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0b0RpYWxvZy5hZGRTdHlsZUNsYXNzKFwic2FwVWlDb250ZW50UGFkZGluZ1wiKTtcblx0XHRcdFx0b0RpYWxvZy5zZXRNb2RlbChpMThuTW9kZWwsIFwic2FwLmZlLmkxOG5cIik7XG5cdFx0XHRcdHRoaXMuZ2V0VmlldygpLmFkZERlcGVuZGVudChvRGlhbG9nKTtcblx0XHRcdFx0b0RpYWxvZy5vcGVuKCk7XG5cdFx0XHR9IGNhdGNoIChlcnJvcikge1xuXHRcdFx0XHRMb2cuaW5mbyhlcnJvciBhcyBhbnkpO1xuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0fVxuXG5cdF9hdHRhY2hSb3V0ZU1hdGNoZWQob0ZuQ29udGV4dDogYW55LCBvQ29udGV4dDogYW55LCBvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHRyZXR1cm4gZnVuY3Rpb24gZm5TdGlja3lEaXNjYXJkQWZ0ZXJOYXZpZ2F0aW9uKCkge1xuXHRcdFx0Y29uc3Qgc0N1cnJlbnRIYXNoID0gb0FwcENvbXBvbmVudC5nZXRSb3V0ZXJQcm94eSgpLmdldEhhc2goKTtcblx0XHRcdC8vIGVpdGhlciBjdXJyZW50IGhhc2ggaXMgZW1wdHkgc28gdGhlIHVzZXIgbGVmdCB0aGUgYXBwIG9yIGhlIG5hdmlnYXRlZCBhd2F5IGZyb20gdGhlIG9iamVjdFxuXHRcdFx0aWYgKCFzQ3VycmVudEhhc2ggfHwgIW9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5jaGVja0hhc2hXaXRoR3VhcmQoc0N1cnJlbnRIYXNoKSkge1xuXHRcdFx0XHRvRm5Db250ZXh0LmRpc2NhcmRTdGlja3lTZXNzaW9uKG9Db250ZXh0KTtcblx0XHRcdH1cblx0XHR9O1xuXHR9XG5cdHNjcm9sbEFuZEZvY3VzT25JbmFjdGl2ZVJvdyhvVGFibGU6IFRhYmxlKSB7XG5cdFx0Y29uc3Qgb1Jvd0JpbmRpbmcgPSBvVGFibGUuZ2V0Um93QmluZGluZygpIGFzIE9EYXRhTGlzdEJpbmRpbmc7XG5cdFx0Y29uc3QgaUFjdGl2ZVJvd0luZGV4ID0gb1Jvd0JpbmRpbmcuZ2V0Q291bnQoKSB8fCAwO1xuXHRcdGlmIChpQWN0aXZlUm93SW5kZXggPiAwKSB7XG5cdFx0XHRvVGFibGUuc2Nyb2xsVG9JbmRleChpQWN0aXZlUm93SW5kZXggLSAxKTtcblx0XHRcdG9UYWJsZS5mb2N1c1JvdyhpQWN0aXZlUm93SW5kZXgsIHRydWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvVGFibGUuZm9jdXNSb3coaUFjdGl2ZVJvd0luZGV4LCB0cnVlKTtcblx0XHR9XG5cdH1cblx0X2lzRmNsRW5hYmxlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5iYXNlLmdldEFwcENvbXBvbmVudCgpLl9pc0ZjbEVuYWJsZWQoKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnRlcm5hbEVkaXRGbG93O1xuIl0sIm1hcHBpbmdz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