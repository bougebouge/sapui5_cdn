/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/EditState", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/fe/core/library", "sap/fe/templates/Feedback", "sap/fe/core/converters/MetaModelConverter", "sap/ui/core/Core", "sap/ui/core/library", "sap/ui/core/message/Message", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/odata/v4/ODataListBinding", "../ActionRuntime"], function (Log, CommonUtils, BusyLocker, ActivitySync, CollaborationCommon, draft, ClassSupport, EditState, ModelHelper, SemanticKeyHelper, FELibrary, Feedback, MetaModelConverter, Core, coreLibrary, Message, ControllerExtension, OverrideExecution, ODataListBinding, ActionRuntime) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _class, _class2;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var TriggerType = Feedback.TriggerType;
  var triggerConfiguredSurvey = Feedback.triggerConfiguredSurvey;
  var StandardActions = Feedback.StandardActions;
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var shareObject = CollaborationCommon.shareObject;
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
  function _finallyRethrows(body, finalizer) {
    try {
      var result = body();
    } catch (e) {
      return finalizer(true, e);
    }
    if (result && result.then) {
      return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
    }
    return finalizer(false, result);
  }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  var CreationMode = FELibrary.CreationMode,
    ProgrammingModel = FELibrary.ProgrammingModel,
    Constants = FELibrary.Constants,
    DraftStatus = FELibrary.DraftStatus,
    EditMode = FELibrary.EditMode,
    StartupMode = FELibrary.StartupMode,
    MessageType = coreLibrary.MessageType;

  /**
   * A controller extension offering hooks into the edit flow of the application
   *
   * @hideconstructor
   * @public
   * @since 1.90.0
   */
  var EditFlow = (_dec = defineUI5Class("sap.fe.core.controllerextensions.EditFlow"), _dec2 = publicExtension(), _dec3 = finalExtension(), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = finalExtension(), _dec8 = publicExtension(), _dec9 = finalExtension(), _dec10 = publicExtension(), _dec11 = extensible(OverrideExecution.After), _dec12 = publicExtension(), _dec13 = extensible(OverrideExecution.After), _dec14 = publicExtension(), _dec15 = extensible(OverrideExecution.After), _dec16 = publicExtension(), _dec17 = extensible(OverrideExecution.After), _dec18 = publicExtension(), _dec19 = extensible(OverrideExecution.After), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = finalExtension(), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = finalExtension(), _dec28 = publicExtension(), _dec29 = finalExtension(), _dec30 = publicExtension(), _dec31 = finalExtension(), _dec32 = publicExtension(), _dec33 = finalExtension(), _dec34 = publicExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(EditFlow, _ControllerExtension);
    function EditFlow() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = EditFlow.prototype;
    //////////////////////////////////////
    // Public methods
    //////////////////////////////////////
    /**
     * Creates a draft document for an existing active document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext Context of the active document
     * @returns Promise resolves once the editable document is available
     * @alias sap.fe.core.controllerextensions.EditFlow#editDocument
     * @public
     * @since 1.90.0
     */
    _proto.editDocument = function editDocument(oContext) {
      try {
        var _this2 = this;
        var bDraftNavigation = true;
        var transactionHelper = _this2._getTransactionHelper();
        var oRootViewController = _this2._getRootViewController();
        var model = oContext.getModel();
        var rightmostContext;
        var _temp8 = _catch(function () {
          return Promise.resolve(_this2.base.editFlow.onBeforeEdit({
            context: oContext
          })).then(function () {
            return Promise.resolve(transactionHelper.editDocument(oContext, _this2.getView(), _this2._getMessageHandler())).then(function (oNewDocumentContext) {
              var sProgrammingModel = _this2._getProgrammingModel(oContext);
              _this2._setStickySessionInternalProperties(sProgrammingModel, model);
              var _temp6 = function () {
                if (oNewDocumentContext) {
                  _this2._setEditMode(EditMode.Editable, false);
                  _this2._getMessageHandler().showMessageDialog();
                  var _temp9 = function () {
                    if (oNewDocumentContext !== oContext) {
                      function _temp10() {
                        return Promise.resolve(_this2._handleNewContext(_contextToNavigate, true, false, bDraftNavigation, true)).then(function () {
                          var _temp2 = function () {
                            if (sProgrammingModel === ProgrammingModel.Sticky) {
                              // The stickyOn handler must be set after the navigation has been done,
                              // as the URL may change in the case of FCL
                              _this2._handleStickyOn(oNewDocumentContext);
                            } else {
                              var _temp12 = function () {
                                if (ModelHelper.isCollaborationDraftSupported(model.getMetaModel())) {
                                  // according to UX in case of enabled collaboration draft we share the object immediately
                                  return Promise.resolve(shareObject(oNewDocumentContext)).then(function () {});
                                }
                              }();
                              if (_temp12 && _temp12.then) return _temp12.then(function () {});
                            }
                          }();
                          if (_temp2 && _temp2.then) return _temp2.then(function () {});
                        });
                      }
                      var _contextToNavigate = oNewDocumentContext;
                      var _temp11 = function () {
                        if (_this2._isFclEnabled()) {
                          rightmostContext = oRootViewController.getRightmostContext();
                          return Promise.resolve(_this2._computeSiblingInformation(oContext, rightmostContext, sProgrammingModel, true)).then(function (siblingInfo) {
                            var _siblingInfo;
                            siblingInfo = (_siblingInfo = siblingInfo) !== null && _siblingInfo !== void 0 ? _siblingInfo : _this2._createSiblingInfo(oContext, oNewDocumentContext);
                            _this2._updatePathsInHistory(siblingInfo.pathMapping);
                            if (siblingInfo.targetContext.getPath() != oNewDocumentContext.getPath()) {
                              _contextToNavigate = siblingInfo.targetContext;
                            }
                          });
                        }
                      }();
                      return _temp11 && _temp11.then ? _temp11.then(_temp10) : _temp10(_temp11);
                    }
                  }();
                  if (_temp9 && _temp9.then) return _temp9.then(function () {});
                }
              }();
              if (_temp6 && _temp6.then) return _temp6.then(function () {});
            });
          });
        }, function (oError) {
          Log.error("Error while editing the document", oError);
        });
        return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto.deleteMultipleDocuments = function deleteMultipleDocuments(aContexts, mParameters) {
      if (mParameters) {
        mParameters.beforeDeleteCallBack = this.base.editFlow.onBeforeDelete;
      } else {
        mParameters = {
          beforeDeleteCallBack: this.base.editFlow.onBeforeDelete
        };
      }
      return this.base.getView().getController()._editFlow.deleteMultipleDocuments(aContexts, mParameters);
    }

    /**
     * Updates the draft status and displays the error messages if there are errors during an update.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext Context of the updated field
     * @param oPromise Promise to determine when the update operation is completed. The promise should be resolved when the update operation is completed, so the draft status can be updated.
     * @returns Promise resolves once draft status has been updated
     * @alias sap.fe.core.controllerextensions.EditFlow#updateDocument
     * @public
     * @since 1.90.0
     */;
    _proto.updateDocument = function updateDocument(oContext, oPromise) {
      var _this3 = this;
      var transactionHelper = this._getTransactionHelper();
      var originalBindingContext = this.getView().getBindingContext();
      var bIsDraft = this._getProgrammingModel(oContext) === ProgrammingModel.Draft;
      this._getMessageHandler().removeTransitionMessages();
      return this._syncTask(function () {
        try {
          if (originalBindingContext) {
            transactionHelper.handleDocumentModifications();
            if (!_this3._isFclEnabled()) {
              EditState.setEditStateDirty();
            }
            if (bIsDraft) {
              _this3._setDraftStatus(DraftStatus.Saving);
            }
          }
          var _temp17 = _finallyRethrows(function () {
            return _catch(function () {
              return Promise.resolve(oPromise).then(function () {
                // If a navigation happened while oPromise was being resolved, the binding context of the page changed
                // In that case, we shouldn't do anything
                var oBindingContext = _this3.getView().getBindingContext();
                var _temp15 = function () {
                  if (bIsDraft && oBindingContext && oBindingContext === originalBindingContext) {
                    var oMetaModel = oBindingContext.getModel().getMetaModel(),
                      sEntitySetName = oMetaModel.getMetaContext(oBindingContext.getPath()).getObject("@sapui.name"),
                      aSemanticKeys = SemanticKeyHelper.getSemanticKeys(oMetaModel, sEntitySetName);
                    var _temp18 = function () {
                      if (aSemanticKeys && aSemanticKeys.length) {
                        var oCurrentSemanticMapping = _this3._getSemanticMapping(),
                          sCurrentSemanticPath = oCurrentSemanticMapping && oCurrentSemanticMapping.semanticPath,
                          sChangedPath = SemanticKeyHelper.getSemanticPath(oBindingContext, true);
                        // sCurrentSemanticPath could be null if we have navigated via deep link then there are no semanticMappings to calculate it from
                        var _temp19 = function () {
                          if (sCurrentSemanticPath && sCurrentSemanticPath !== sChangedPath) {
                            return Promise.resolve(_this3._handleNewContext(oBindingContext, true, false, true)).then(function () {
                              _this3._setDraftStatus(DraftStatus.Saved);
                            });
                          } else {
                            _this3._setDraftStatus(DraftStatus.Saved);
                          }
                        }();
                        if (_temp19 && _temp19.then) return _temp19.then(function () {});
                      } else {
                        _this3._setDraftStatus(DraftStatus.Saved);
                      }
                    }();
                    if (_temp18 && _temp18.then) return _temp18.then(function () {});
                  }
                }();
                if (_temp15 && _temp15.then) return _temp15.then(function () {});
              });
            }, function (oError) {
              Log.error("Error while updating the document", oError);
              if (bIsDraft && originalBindingContext) {
                _this3._setDraftStatus(DraftStatus.Clear);
              }
            });
          }, function (_wasThrown, _result) {
            return Promise.resolve(_this3._getMessageHandler().showMessages()).then(function () {
              if (_wasThrown) throw _result;
              return _result;
            });
          });
          return Promise.resolve(_temp17 && _temp17.then ? _temp17.then(function () {}) : void 0);
        } catch (e) {
          return Promise.reject(e);
        }
      });
    }

    // Internal only params ---
    // * @param {string} mParameters.creationMode The creation mode using one of the following:
    // *                    Sync - the creation is triggered and once the document is created, the navigation is done
    // *                    Async - the creation and the navigation to the instance are done in parallel
    // *                    Deferred - the creation is done on the target page
    // *                    CreationRow - The creation is done inline async so the user is not blocked
    // mParameters.creationRow Instance of the creation row - (TODO: get rid but use list bindings only)

    // eslint-disable-next-line jsdoc/require-param
    /**
     * Creates a new document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param vListBinding  ODataListBinding object or the binding path for a temporary list binding
     * @param mInParameters Contains the following attributes:
     * @param mInParameters.creationMode The creation mode using one of the following:
     *                    NewPage - the created document is shown in a new page, depending on whether metadata 'Sync', 'Async' or 'Deferred' is used
     *                    Inline - The creation is done inline (in a table)
     *                    External - The creation is done in a different application specified via the parameter 'outbound'
     * @param mInParameters.outbound The navigation target where the document is created in case of creationMode 'External'
     * @param mInParameters.createAtEnd Specifies if the new entry should be created at the top or bottom of a table in case of creationMode 'Inline'
     * @returns Promise resolves once the object has been created
     * @alias sap.fe.core.controllerextensions.EditFlow#createDocument
     * @public
     * @since 1.90.0
     */;
    _proto.createDocument = function createDocument(vListBinding, mInParameters) {
      try {
        var _exit2 = false;
        var _this5 = this;
        function _temp35(_result2) {
          if (_exit2) return _result2;
          if (mParameters.creationMode === CreationMode.CreationRow && mParameters.creationRow) {
            var oCreationRowObjects = mParameters.creationRow.getBindingContext().getObject();
            delete oCreationRowObjects["@$ui5.context.isTransient"];
            oTable = mParameters.creationRow.getParent();
            oExecCustomValidation = transactionHelper.validateDocument(oTable.getBindingContext(), {
              data: oCreationRowObjects,
              customValidationFunction: oTable.getCreationRow().data("customValidationFunction")
            }, _this5.base.getView());

            // disableAddRowButtonForEmptyData is set to false in manifest converter (Table.ts) if customValidationFunction exists
            if (oTable.getCreationRow().data("disableAddRowButtonForEmptyData") === "true") {
              var oInternalModelContext = oTable.getBindingContext("internal");
              oInternalModelContext.setProperty("creationRowFieldValidity", {});
            }
          }
          if (mParameters.creationMode === CreationMode.Inline && mParameters.tableId) {
            oTable = _this5.getView().byId(mParameters.tableId);
          }
          if (oTable && oTable.isA("sap.ui.mdc.Table")) {
            var fnFocusOrScroll = mParameters.creationMode === CreationMode.Inline ? oTable.focusRow.bind(oTable) : oTable.scrollToIndex.bind(oTable);
            oTable.getRowBinding().attachEventOnce("change", function () {
              fnFocusOrScroll(mParameters.createAtEnd ? oTable.getRowBinding().getLength() : 0, true);
            });
          }
          var handleSideEffects = function (oListBinding, oCreationPromise) {
            try {
              var _temp30 = _catch(function () {
                return Promise.resolve(oCreationPromise).then(function (oNewContext) {
                  // transient contexts are reliably removed once oNewContext.created() is resolved
                  return Promise.resolve(oNewContext.created()).then(function () {
                    var oBindingContext = _this5.getView().getBindingContext();
                    // if there are transient contexts, we must avoid requesting side effects
                    // this is avoid a potential list refresh, there could be a side effect that refreshes the list binding
                    // if list binding is refreshed, transient contexts might be lost
                    if (!CommonUtils.hasTransientContext(oListBinding)) {
                      var appComponent = CommonUtils.getAppComponent(_this5.getView());
                      appComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(oListBinding.getPath(), oBindingContext);
                    }
                  });
                });
              }, function (oError) {
                Log.error("Error while creating the document", oError);
              });
              return Promise.resolve(_temp30 && _temp30.then ? _temp30.then(function () {}) : void 0);
            } catch (e) {
              return Promise.reject(e);
            }
          };

          /**
           * @param aValidationMessages Error messages from custom validation function
           */
          var createCustomValidationMessages = function (aValidationMessages) {
            var _oTable$getBindingCon;
            var sCustomValidationFunction = oTable && oTable.getCreationRow().data("customValidationFunction");
            var mCustomValidity = oTable && ((_oTable$getBindingCon = oTable.getBindingContext("internal")) === null || _oTable$getBindingCon === void 0 ? void 0 : _oTable$getBindingCon.getProperty("creationRowCustomValidity"));
            var oMessageManager = Core.getMessageManager();
            var aCustomMessages = [];
            var oFieldControl;
            var sTarget;

            // Remove existing CustomValidation message
            oMessageManager.getMessageModel().getData().forEach(function (oMessage) {
              if (oMessage.code === sCustomValidationFunction) {
                oMessageManager.removeMessages(oMessage);
              }
            });
            aValidationMessages.forEach(function (oValidationMessage) {
              // Handle Bound CustomValidation message
              if (oValidationMessage.messageTarget) {
                var _oFieldControl$getBin;
                oFieldControl = Core.getControl(mCustomValidity[oValidationMessage.messageTarget].fieldId);
                sTarget = "".concat((_oFieldControl$getBin = oFieldControl.getBindingContext()) === null || _oFieldControl$getBin === void 0 ? void 0 : _oFieldControl$getBin.getPath(), "/").concat(oFieldControl.getBindingPath("value"));
                // Add validation message if still not exists
                if (oMessageManager.getMessageModel().getData().filter(function (oMessage) {
                  return oMessage.target === sTarget;
                }).length === 0) {
                  oMessageManager.addMessages(new Message({
                    message: oValidationMessage.messageText,
                    processor: _this5.getView().getModel(),
                    type: MessageType.Error,
                    code: sCustomValidationFunction,
                    technical: false,
                    persistent: false,
                    target: sTarget
                  }));
                }
                // Add controlId in order to get the focus handling of the error popover runable
                var aExistingValidationMessages = oMessageManager.getMessageModel().getData().filter(function (oMessage) {
                  return oMessage.target === sTarget;
                });
                aExistingValidationMessages[0].addControlId(mCustomValidity[oValidationMessage.messageTarget].fieldId);

                // Handle Unbound CustomValidation message
              } else {
                aCustomMessages.push({
                  code: sCustomValidationFunction,
                  text: oValidationMessage.messageText,
                  persistent: true,
                  type: MessageType.Error
                });
              }
            });
            if (aCustomMessages.length > 0) {
              _this5._getMessageHandler().showMessageDialog({
                customMessages: aCustomMessages
              });
            }
          };
          var resolveCreationMode = function (initialCreationMode, programmingModel, oListBinding, oMetaModel) {
            if (initialCreationMode && initialCreationMode !== CreationMode.NewPage) {
              // use the passed creation mode
              return initialCreationMode;
            } else {
              // NewAction is not yet supported for NavigationProperty collection
              if (!oListBinding.isRelative()) {
                var sPath = oListBinding.getPath(),
                  // if NewAction with parameters is present, then creation is 'Deferred'
                  // in the absence of NewAction or NewAction with parameters, creation is async
                  sNewAction = programmingModel === ProgrammingModel.Draft ? oMetaModel.getObject("".concat(sPath, "@com.sap.vocabularies.Common.v1.DraftRoot/NewAction")) : oMetaModel.getObject("".concat(sPath, "@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction"));
                if (sNewAction) {
                  var aParameters = oMetaModel.getObject("/".concat(sNewAction, "/@$ui5.overload/0/$Parameter")) || [];
                  // binding parameter (eg: _it) is not considered
                  if (aParameters.length > 1) {
                    return CreationMode.Deferred;
                  }
                }
              }
              var sMetaPath = oMetaModel.getMetaPath(oListBinding.getHeaderContext().getPath());
              var aNonComputedVisibleKeyFields = CommonUtils.getNonComputedVisibleFields(oMetaModel, sMetaPath, _this5.getView());
              if (aNonComputedVisibleKeyFields.length > 0) {
                return CreationMode.Deferred;
              }
              return CreationMode.Async;
            }
          };
          if (bShouldBusyLock) {
            BusyLocker.lock(oLockObject);
          }
          return _finallyRethrows(function () {
            return Promise.resolve(_this5._syncTask(oExecCustomValidation)).then(function (aValidationMessages) {
              function _temp26() {
                var oNavigation;
                switch (resolvedCreationMode) {
                  case CreationMode.Deferred:
                    oNavigation = oRoutingListener.navigateForwardToContext(oListBinding, {
                      bDeferredContext: true,
                      editable: true,
                      bForceFocus: true
                    });
                    break;
                  case CreationMode.Async:
                    oNavigation = oRoutingListener.navigateForwardToContext(oListBinding, {
                      asyncContext: oCreation,
                      editable: true,
                      bForceFocus: true
                    });
                    break;
                  case CreationMode.Sync:
                    mArgs = {
                      editable: true,
                      bForceFocus: true
                    };
                    if (sProgrammingModel == ProgrammingModel.Sticky || mParameters.createAction) {
                      mArgs.transient = true;
                    }
                    oNavigation = oCreation.then(function (oNewDocumentContext) {
                      if (!oNewDocumentContext) {
                        var coreResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
                        return oRoutingListener.navigateToMessagePage(coreResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR"), {
                          title: coreResourceBundle.getText("C_COMMON_SAPFE_ERROR"),
                          description: coreResourceBundle.getText("C_EDITFLOW_SAPFE_CREATION_FAILED_DESCRIPTION")
                        });
                      } else {
                        // In case the Sync creation was triggered for a deferred creation, we don't navigate forward
                        // as we're already on the corresponding ObjectPage
                        return mParameters.bFromDeferred ? oRoutingListener.navigateToContext(oNewDocumentContext, mArgs) : oRoutingListener.navigateForwardToContext(oNewDocumentContext, mArgs);
                      }
                    });
                    break;
                  case CreationMode.Inline:
                    handleSideEffects(oListBinding, oCreation);
                    _this5._syncTask(oCreation);
                    break;
                  case CreationMode.CreationRow:
                    // the creation row shall be cleared once the validation check was successful and
                    // therefore the POST can be sent async to the backend
                    try {
                      var oCreationRowListBinding = oCreationRowContext.getBinding();
                      if (!mParameters.bSkipSideEffects) {
                        handleSideEffects(oListBinding, oCreation);
                      }
                      var oNewTransientContext = oCreationRowListBinding.create();
                      oCreationRow.setBindingContext(oNewTransientContext);

                      // this is needed to avoid console errors TO be checked with model colleagues
                      oNewTransientContext.created().catch(function () {
                        Log.trace("transient fast creation context deleted");
                      });
                      oNavigation = oCreationRowContext.delete("$direct");
                    } catch (oError) {
                      // Reset busy indicator after a validation error
                      if (BusyLocker.isLocked(_this5.getView().getModel("ui"))) {
                        BusyLocker.unlock(_this5.getView().getModel("ui"));
                      }
                      Log.error("CreationRow navigation error: ", oError);
                    }
                    break;
                  default:
                    oNavigation = Promise.reject("Unhandled creationMode ".concat(resolvedCreationMode));
                    break;
                }
                var bIsNewPageCreation = mParameters.creationMode !== CreationMode.CreationRow && mParameters.creationMode !== CreationMode.Inline;
                return function () {
                  if (oCreation) {
                    return _catch(function () {
                      return Promise.resolve(Promise.all([oCreation, oNavigation])).then(function (aParams) {
                        _this5._setStickySessionInternalProperties(sProgrammingModel, oModel);
                        if (bIsNewPageCreation) {
                          _this5._setEditMode(EditMode.Editable, bIsNewPageCreation);
                        } else {
                          _this5._setEditMode(EditMode.Editable);
                        }
                        var oNewDocumentContext = aParams[0];
                        var _temp24 = function () {
                          if (oNewDocumentContext) {
                            if (!_this5._isFclEnabled()) {
                              EditState.setEditStateDirty();
                            }
                            _this5._sendActivity(Activity.Create, oNewDocumentContext);
                            var _temp31 = function () {
                              if (sProgrammingModel === ProgrammingModel.Sticky) {
                                _this5._handleStickyOn(oNewDocumentContext);
                              } else {
                                var _temp32 = function () {
                                  if (ModelHelper.isCollaborationDraftSupported(oModel.getMetaModel())) {
                                    // according to UX in case of enabled collaboration draft we share the object immediately
                                    return Promise.resolve(shareObject(oNewDocumentContext)).then(function () {});
                                  }
                                }();
                                if (_temp32 && _temp32.then) return _temp32.then(function () {});
                              }
                            }();
                            if (_temp31 && _temp31.then) return _temp31.then(function () {});
                          }
                        }();
                        if (_temp24 && _temp24.then) return _temp24.then(function () {});
                      });
                    }, function (error) {
                      // TODO: currently, the only errors handled here are raised as string - should be changed to Error objects
                      if (error === Constants.CancelActionDialog || error === Constants.ActionExecutionFailed || error === Constants.CreationFailed) {
                        // creation has been cancelled by user or failed in backend => in case we have navigated to transient context before, navigate back
                        // the switch-statement above seems to indicate that this happens in creationModes deferred and async. But in fact, in these cases after the navigation from routeMatched in OP component
                        // createDeferredContext is triggerd, which calls this method (createDocument) again - this time with creationMode sync. Therefore, also in that mode we need to trigger back navigation.
                        // The other cases might still be needed in case the navigation fails.
                        if (resolvedCreationMode === CreationMode.Sync || resolvedCreationMode === CreationMode.Deferred || resolvedCreationMode === CreationMode.Async) {
                          oRoutingListener.navigateBackFromTransientState();
                        }
                      }
                      throw error;
                    });
                  }
                }();
              }
              if (aValidationMessages.length > 0) {
                createCustomValidationMessages(aValidationMessages);
                Log.error("Custom Validation failed");
                // if custom validation fails, we leave the method immediately
                return;
              }
              var oListBinding;
              mParameters = mParameters || {};
              if (vListBinding && typeof vListBinding === "object") {
                // we already get a list binding use this one
                oListBinding = vListBinding;
              } else if (typeof vListBinding === "string") {
                oListBinding = new ODataListBinding(_this5.getView().getModel(), vListBinding);
                mParameters.creationMode = CreationMode.Sync;
                delete mParameters.createAtEnd;
              } else {
                throw new Error("Binding object or path expected");
              }
              var oModel = oListBinding.getModel();
              var sProgrammingModel = _this5._getProgrammingModel(oListBinding);
              var resolvedCreationMode = resolveCreationMode(mParameters.creationMode, sProgrammingModel, oListBinding, oModel.getMetaModel());
              var oCreation;
              var mArgs;
              var oCreationRow = mParameters.creationRow;
              var oCreationRowContext;
              var oPayload;
              var sMetaPath;
              var oMetaModel = oModel.getMetaModel();
              var oRoutingListener = _this5._getRoutingListener();
              var _temp25 = function () {
                if (resolvedCreationMode !== CreationMode.Deferred) {
                  function _temp33() {
                    if (resolvedCreationMode === CreationMode.CreationRow || resolvedCreationMode === CreationMode.Inline) {
                      var _oTable, _oTable$getParent, _oTable$getParent$get;
                      mParameters.keepTransientContextOnFailed = false; // currently not fully supported
                      // busy handling shall be done locally only
                      mParameters.busyMode = "Local";
                      mParameters.busyId = (_oTable = oTable) === null || _oTable === void 0 ? void 0 : (_oTable$getParent = _oTable.getParent()) === null || _oTable$getParent === void 0 ? void 0 : (_oTable$getParent$get = _oTable$getParent.getTableDefinition()) === null || _oTable$getParent$get === void 0 ? void 0 : _oTable$getParent$get.annotation.id;

                      // take care on message handling, draft indicator (in case of draft)
                      // Attach the create sent and create completed event to the object page binding so that we can react
                      _this5._handleCreateEvents(oListBinding);
                    }
                    if (!mParameters.parentControl) {
                      mParameters.parentControl = _this5.getView();
                    }
                    mParameters.beforeCreateCallBack = _this5.base.editFlow.onBeforeCreate;

                    // In case the application was called with preferredMode=autoCreateWith, we want to skip the
                    // action parameter dialog
                    mParameters.skipParameterDialog = oAppComponent.getStartupMode() === StartupMode.AutoCreate;
                    oCreation = transactionHelper.createDocument(oListBinding, mParameters, oResourceBundle, _this5._getMessageHandler(), false, _this5.getView());
                  }
                  var _temp34 = function () {
                    if (resolvedCreationMode === CreationMode.CreationRow) {
                      oCreationRowContext = oCreationRow.getBindingContext();
                      sMetaPath = oMetaModel.getMetaPath(oCreationRowContext.getPath());
                      // prefill data from creation row
                      oPayload = oCreationRowContext.getObject();
                      mParameters.data = {};
                      Object.keys(oPayload).forEach(function (sPropertyPath) {
                        var oProperty = oMetaModel.getObject("".concat(sMetaPath, "/").concat(sPropertyPath));
                        // ensure navigation properties are not part of the payload, deep create not supported
                        if (oProperty && oProperty.$kind === "NavigationProperty") {
                          return;
                        }
                        mParameters.data[sPropertyPath] = oPayload[sPropertyPath];
                      });
                      return Promise.resolve(_this5._checkForValidationErrors( /*oCreationRowContext*/)).then(function () {});
                    }
                  }();
                  return _temp34 && _temp34.then ? _temp34.then(_temp33) : _temp33(_temp34);
                }
              }();
              return _temp25 && _temp25.then ? _temp25.then(_temp26) : _temp26(_temp25);
            });
          }, function (_wasThrown2, _result3) {
            if (bShouldBusyLock) {
              BusyLocker.unlock(oLockObject);
            }
            if (_wasThrown2) throw _result3;
            return _result3;
          });
        }
        var transactionHelper = _this5._getTransactionHelper(),
          oLockObject = _this5._getGlobalUIModel();
        var oTable; //should be Table but there are missing methods into the def
        var mParameters = mInParameters;
        var oResourceBundle = _this5._getResourceBundle();
        var bShouldBusyLock = !mParameters || mParameters.creationMode !== CreationMode.Inline && mParameters.creationMode !== CreationMode.CreationRow && mParameters.creationMode !== CreationMode.External;
        var oExecCustomValidation = Promise.resolve([]);
        var oAppComponent = CommonUtils.getAppComponent(_this5.getView());
        oAppComponent.getRouterProxy().removeIAppStateKey();
        var _temp36 = function () {
          if (mParameters.creationMode === CreationMode.External) {
            // Create by navigating to an external target
            // TODO: Call appropriate function (currently using the same as for outbound chevron nav, and without any context - 3rd param)
            return Promise.resolve(_this5._syncTask()).then(function () {
              var oController = _this5.getView().getController();
              var sCreatePath = ModelHelper.getAbsoluteMetaPathForListBinding(_this5.getView(), vListBinding);
              oController.handlers.onChevronPressNavigateOutBound(oController, mParameters.outbound, undefined, sCreatePath);
              _exit2 = true;
            });
          }
        }();
        return Promise.resolve(_temp36 && _temp36.then ? _temp36.then(_temp35) : _temp35(_temp36));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * This function can be used to intercept the 'Save' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Save' action.
     * If you reject the promise, the 'Save' action is stopped and the user stays in edit mode.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param mParameters Object containing the parameters passed to onBeforeSave
     * @param mParameters.context Page context that is going to be saved.
     * @returns A promise to be returned by the overridden method. If resolved, the 'Save' action is triggered. If rejected, the 'Save' action is not triggered and the user stays in edit mode.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeSave
     * @public
     * @since 1.90.0
     */
    ;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeSave = function onBeforeSave(mParameters) {
      // to be overridden
      return Promise.resolve();
    }
    /**
     * This function can be used to intercept the 'Create' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Create' action.
     * If you reject the promise, the 'Create' action is stopped.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param  mParameters Object containing the parameters passed to onBeforeCreate
     * @param mParameters.contextPath Path pointing to the context on which Create action is triggered
     * @param mParameters.createParameters Array of values that are filled in the Action Parameter Dialog
     * @returns A promise to be returned by the overridden method. If resolved, the 'Create' action is triggered. If rejected, the 'Create' action is not triggered.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeCreate
     * @public
     * @since 1.98.0
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeCreate = function onBeforeCreate(mParameters) {
      // to be overridden
      return Promise.resolve();
    }
    /**
     * This function can be used to intercept the 'Edit' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Edit' action.
     * If you reject the promise, the 'Edit' action is stopped and the user stays in display mode.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param mParameters Object containing the parameters passed to onBeforeEdit
     * @param mParameters.context Page context that is going to be edited.
     * @returns A promise to be returned by the overridden method. If resolved, the 'Edit' action is triggered. If rejected, the 'Edit' action is not triggered and the user stays in display mode.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeEdit
     * @public
     * @since 1.98.0
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeEdit = function onBeforeEdit(mParameters) {
      // to be overridden
      return Promise.resolve();
    }
    /**
     * This function can be used to intercept the 'Discard' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Discard' action.
     * If you reject the promise, the 'Discard' action is stopped and the user stays in edit mode.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param mParameters Object containing the parameters passed to onBeforeDiscard
     * @param mParameters.context Page context that is going to be discarded.
     * @returns A promise to be returned by the overridden method. If resolved, the 'Discard' action is triggered. If rejected, the 'Discard' action is not triggered and the user stays in edit mode.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeDiscard
     * @public
     * @since 1.98.0
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeDiscard = function onBeforeDiscard(mParameters) {
      // to be overridden
      return Promise.resolve();
    }
    /**
     * This function can be used to intercept the 'Delete' action. You can execute custom coding in this function.
     * The framework waits for the returned promise to be resolved before continuing the 'Delete' action.
     * If you reject the promise, the 'Delete' action is stopped.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param mParameters Object containing the parameters passed to onBeforeDelete
     * @param mParameters.contexts An array of contexts that are going to be deleted
     * @returns A promise to be returned by the overridden method. If resolved, the 'Delete' action is triggered. If rejected, the 'Delete' action is not triggered.
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @alias sap.fe.core.controllerextensions.EditFlow#onBeforeDelete
     * @public
     * @since 1.98.0
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeDelete = function onBeforeDelete(mParameters) {
      // to be overridden
      return Promise.resolve();
    }

    // Internal only params ---
    // @param {boolean} mParameters.bExecuteSideEffectsOnError Indicates whether SideEffects need to be ignored when user clicks on Save during an Inline creation
    // @param {object} mParameters.bindings List bindings of the tables in the view.
    // Both of the above parameters are for the same purpose. User can enter some information in the creation row(s) but does not 'Add row', instead clicks Save.
    // There can be more than one in the view.

    // eslint-disable-next-line jsdoc/require-param
    /**
     * Saves a new document after checking it.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the editable document
     * @returns Promise resolves once save is complete
     * @alias sap.fe.core.controllerextensions.EditFlow#saveDocument
     * @public
     * @since 1.90.0
     */;
    _proto.saveDocument = function saveDocument(oContext, mParameters) {
      try {
        var _this7 = this;
        mParameters = mParameters || {};
        var bExecuteSideEffectsOnError = mParameters.bExecuteSideEffectsOnError || undefined;
        var bDraftNavigation = true;
        var transactionHelper = _this7._getTransactionHelper();
        var oResourceBundle = _this7._getResourceBundle();
        var aBindings = mParameters.bindings;
        return Promise.resolve(_catch(function () {
          return Promise.resolve(_this7._syncTask()).then(function () {
            return Promise.resolve(_this7._submitOpenChanges(oContext)).then(function () {
              return Promise.resolve(_this7._checkForValidationErrors()).then(function () {
                return Promise.resolve(_this7.base.editFlow.onBeforeSave({
                  context: oContext
                })).then(function () {
                  function _temp39() {
                    return Promise.resolve(transactionHelper.saveDocument(oContext, oResourceBundle, bExecuteSideEffectsOnError, aBindings, _this7._getMessageHandler())).then(function (activeDocumentContext) {
                      _this7._removeStickySessionInternalProperties(sProgrammingModel);
                      _this7._sendActivity(Activity.Activate, activeDocumentContext);
                      _this7._triggerConfiguredSurvey(StandardActions.save, TriggerType.standardAction);
                      _this7._setEditMode(EditMode.Display, false);
                      _this7._getMessageHandler().showMessageDialog();
                      var _temp37 = function () {
                        if (activeDocumentContext !== oContext) {
                          var _contextToNavigate2 = activeDocumentContext;
                          if (oRootViewController.isFclEnabled()) {
                            var _siblingInfo2;
                            siblingInfo = (_siblingInfo2 = siblingInfo) !== null && _siblingInfo2 !== void 0 ? _siblingInfo2 : _this7._createSiblingInfo(oContext, activeDocumentContext);
                            _this7._updatePathsInHistory(siblingInfo.pathMapping);
                            if (siblingInfo.targetContext.getPath() !== activeDocumentContext.getPath()) {
                              _contextToNavigate2 = siblingInfo.targetContext;
                            }
                          }
                          return Promise.resolve(_this7._handleNewContext(_contextToNavigate2, false, false, bDraftNavigation, true)).then(function () {});
                        }
                      }();
                      if (_temp37 && _temp37.then) return _temp37.then(function () {});
                    });
                  }
                  var sProgrammingModel = _this7._getProgrammingModel(oContext);
                  var oRootViewController = _this7._getRootViewController();
                  var siblingInfo;
                  var _temp38 = function () {
                    if ((sProgrammingModel === ProgrammingModel.Sticky || oContext.getProperty("HasActiveEntity")) && oRootViewController.isFclEnabled()) {
                      // No need to try to get rightmost context in case of a new object
                      return Promise.resolve(_this7._computeSiblingInformation(oContext, oRootViewController.getRightmostContext(), sProgrammingModel, true)).then(function (_this6$_computeSiblin) {
                        siblingInfo = _this6$_computeSiblin;
                      });
                    }
                  }();
                  return _temp38 && _temp38.then ? _temp38.then(_temp39) : _temp39(_temp38);
                });
              });
            });
          });
        }, function (oError) {
          if (!(oError && oError.canceled)) {
            Log.error("Error while saving the document", oError);
          }
          return Promise.reject(oError);
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto.toggleDraftActive = function toggleDraftActive(oContext) {
      try {
        var _this9 = this;
        var oContextData = oContext.getObject();
        var bEditable;
        var bIsDraft = oContext && _this9._getProgrammingModel(oContext) === ProgrammingModel.Draft;

        //toggle between draft and active document is only available for edit drafts and active documents with draft)
        if (!bIsDraft || !(!oContextData.IsActiveEntity && oContextData.HasActiveEntity || oContextData.IsActiveEntity && oContextData.HasDraftEntity)) {
          return Promise.resolve();
        }
        if (!oContextData.IsActiveEntity && oContextData.HasActiveEntity) {
          //start Point: edit draft
          bEditable = false;
        } else {
          // start point active document
          bEditable = true;
        }
        return Promise.resolve(_catch(function () {
          var oRootViewController = _this9._getRootViewController();
          var oRightmostContext = oRootViewController.isFclEnabled() ? oRootViewController.getRightmostContext() : oContext;
          return Promise.resolve(_this9._computeSiblingInformation(oContext, oRightmostContext, ProgrammingModel.Draft, false)).then(function (siblingInfo) {
            function _temp41() {
              return function () {
                if (siblingInfo) {
                  _this9._setEditMode(bEditable ? EditMode.Editable : EditMode.Display, false); //switch to edit mode only if a draft is available

                  if (oRootViewController.isFclEnabled()) {
                    var lastSemanticMapping = _this9._getSemanticMapping();
                    if ((lastSemanticMapping === null || lastSemanticMapping === void 0 ? void 0 : lastSemanticMapping.technicalPath) === oContext.getPath()) {
                      var targetPath = siblingInfo.pathMapping[siblingInfo.pathMapping.length - 1].newPath;
                      siblingInfo.pathMapping.push({
                        oldPath: lastSemanticMapping.semanticPath,
                        newPath: targetPath
                      });
                    }
                    _this9._updatePathsInHistory(siblingInfo.pathMapping);
                  }
                  return Promise.resolve(_this9._handleNewContext(siblingInfo.targetContext, bEditable, true, true, true)).then(function () {});
                } else {
                  return Promise.reject("Error in EditFlow.toggleDraftActive - Cannot find sibling");
                }
              }();
            }
            var _temp40 = function () {
              if (!siblingInfo && oContext !== oRightmostContext) {
                // Try to compute sibling info for the root context if it fails for the rightmost context
                // --> In case of FCL, if we try to switch between draft and active but a child entity has no sibling, the switch will close the child column
                return Promise.resolve(_this9._computeSiblingInformation(oContext, oContext, ProgrammingModel.Draft, false)).then(function (_this8$_computeSiblin) {
                  siblingInfo = _this8$_computeSiblin;
                });
              }
            }();
            return _temp40 && _temp40.then ? _temp40.then(_temp41) : _temp41(_temp40);
          });
        }, function (oError) {
          return Promise.reject("Error in EditFlow.toggleDraftActive:".concat(oError));
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    } // Internal only params ---
    // @param {sap.m.Button} mParameters.cancelButton - Currently this is passed as cancelButton internally (replaced by mParameters.control in the JSDoc below). Currently it is also mandatory.
    // Plan - This should not be mandatory. If not provided, we should have a default that can act as reference control for the discard popover OR we can show a dialog instead of a popover.
    /**
     * Discard the editable document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the editable document
     * @param mParameters Can contain the following attributes:
     * @param mParameters.control This is the control used to open the discard popover
     * @param mParameters.skipDiscardPopover Optional, supresses the discard popover and allows custom handling
     * @returns Promise resolves once editable document has been discarded
     * @alias sap.fe.core.controllerextensions.EditFlow#cancelDocument
     * @public
     * @since 1.90.0
     */
    ;
    _proto.cancelDocument = function cancelDocument(oContext, mParameters) {
      try {
        var _this11 = this;
        var transactionHelper = _this11._getTransactionHelper();
        var oResourceBundle = _this11._getResourceBundle();
        var mInParameters = mParameters;
        var _siblingInfo3;
        mInParameters.cancelButton = mParameters.control || mInParameters.cancelButton;
        mInParameters.beforeCancelCallBack = _this11.base.editFlow.onBeforeDiscard;
        return Promise.resolve(_catch(function () {
          return Promise.resolve(_this11._syncTask()).then(function () {
            function _temp44() {
              return Promise.resolve(transactionHelper.cancelDocument(oContext, mInParameters, oResourceBundle, _this11._getMessageHandler())).then(function (cancelResult) {
                var bDraftNavigation = true;
                _this11._removeStickySessionInternalProperties(sProgrammingModel);
                _this11._setEditMode(EditMode.Display, false);
                _this11._setDraftStatus(DraftStatus.Clear);
                // we force the edit state even for FCL because the draft discard might not be implemented
                // and we may just delete the draft
                EditState.setEditStateDirty();
                return function () {
                  if (!cancelResult) {
                    _this11._sendActivity(Activity.Discard, undefined);
                    //in case of a new document, no activeContext is returned --> navigate back.
                    var _temp45 = function () {
                      if (!mInParameters.skipBackNavigation) {
                        return Promise.resolve(_this11._getRoutingListener().navigateBackFromContext(oContext)).then(function () {});
                      }
                    }();
                    if (_temp45 && _temp45.then) return _temp45.then(function () {});
                  } else {
                    var oActiveDocumentContext = cancelResult;
                    _this11._sendActivity(Activity.Discard, oActiveDocumentContext);
                    var _contextToNavigate3 = oActiveDocumentContext;
                    if (_this11._isFclEnabled()) {
                      var _siblingInfo4;
                      _siblingInfo3 = (_siblingInfo4 = _siblingInfo3) !== null && _siblingInfo4 !== void 0 ? _siblingInfo4 : _this11._createSiblingInfo(oContext, oActiveDocumentContext);
                      _this11._updatePathsInHistory(_siblingInfo3.pathMapping);
                      if (_siblingInfo3.targetContext.getPath() !== oActiveDocumentContext.getPath()) {
                        _contextToNavigate3 = _siblingInfo3.targetContext;
                      }
                    }
                    return function () {
                      if (sProgrammingModel === ProgrammingModel.Draft) {
                        // We need to load the semantic keys of the active context, as we need them
                        // for the navigation
                        return Promise.resolve(_this11._fetchSemanticKeyValues(oActiveDocumentContext)).then(function () {
                          // We force the recreation of the context, so that it's created and bound in the same microtask,
                          // so that all properties are loaded together by autoExpandSelect, so that when switching back to Edit mode
                          // $$inheritExpandSelect takes all loaded properties into account (BCP 2070462265)
                          return function () {
                            if (!mInParameters.skipBindingToView) {
                              return Promise.resolve(_this11._handleNewContext(_contextToNavigate3, false, true, bDraftNavigation, true)).then(function () {});
                            } else {
                              return oActiveDocumentContext;
                            }
                          }();
                        });
                      } else {
                        //active context is returned in case of cancel of existing document
                        return Promise.resolve(_this11._handleNewContext(_contextToNavigate3, false, false, bDraftNavigation, true)).then(function () {});
                      }
                    }();
                  }
                }();
              });
            }
            var sProgrammingModel = _this11._getProgrammingModel(oContext);
            var _temp43 = function () {
              if ((sProgrammingModel === ProgrammingModel.Sticky || oContext.getProperty("HasActiveEntity")) && _this11._isFclEnabled()) {
                var _oRootViewController = _this11._getRootViewController();

                // No need to try to get rightmost context in case of a new object
                return Promise.resolve(_this11._computeSiblingInformation(oContext, _oRootViewController.getRightmostContext(), sProgrammingModel, true)).then(function (_this10$_computeSibli) {
                  _siblingInfo3 = _this10$_computeSibli;
                });
              }
            }();
            return _temp43 && _temp43.then ? _temp43.then(_temp44) : _temp44(_temp43);
          });
        }, function (oError) {
          Log.error("Error while discarding the document", oError);
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    } // Internal only params ---
    // @param {string} mParameters.entitySetName Name of the EntitySet to which the object belongs
    /**
     * Checks if a context corresponds to a draft root.
     *
     * @param context The context to check
     * @returns True if the context points to a draft root
     * @private
     */
    ;
    _proto.isDraftRoot = function isDraftRoot(context) {
      var metaModel = context.getModel().getMetaModel();
      var metaContext = metaModel.getMetaContext(context.getPath());
      return ModelHelper.isDraftRoot(getInvolvedDataModelObjects(metaContext).targetEntitySet);
    }

    /**
     * Deletes the document.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the document
     * @param mInParameters Can contain the following attributes:
     * @param mInParameters.title Title of the object being deleted
     * @param mInParameters.description Description of the object being deleted
     * @returns Promise resolves once document has been deleted
     * @alias sap.fe.core.controllerextensions.EditFlow#deleteDocument
     * @public
     * @since 1.90.0
     */;
    _proto.deleteDocument = function deleteDocument(oContext, mInParameters) {
      try {
        var _this13 = this;
        var oAppComponent = CommonUtils.getAppComponent(_this13.getView());
        var mParameters = mInParameters;
        if (!mParameters) {
          mParameters = {
            bFindActiveContexts: false
          };
        } else {
          mParameters.bFindActiveContexts = false;
        }
        mParameters.beforeDeleteCallBack = _this13.base.editFlow.onBeforeDelete;
        var _temp47 = _catch(function () {
          if (_this13._isFclEnabled() && _this13.isDraftRoot(oContext) && oContext.getIndex() === undefined && oContext.getProperty("IsActiveEntity") === true && oContext.getProperty("HasDraftEntity") === true) {
            // Deleting an active entity which has a draft that could potentially be displayed in the ListReport (FCL case)
            // --> need to remove the draft from the LR and replace it with the active version, so that the ListBinding is properly refreshed
            // The condition 'oContext.getIndex() === undefined' makes sure the active version isn't already displayed in the LR
            mParameters.beforeDeleteCallBack = function (parameters) {
              try {
                return Promise.resolve(_this13.base.editFlow.onBeforeDelete(parameters)).then(function () {
                  var _temp48 = _catch(function () {
                    var model = oContext.getModel();
                    var siblingContext = model.bindContext("".concat(oContext.getPath(), "/SiblingEntity")).getBoundContext();
                    return Promise.resolve(siblingContext.requestCanonicalPath()).then(function (draftPath) {
                      var draftContextToRemove = model.getKeepAliveContext(draftPath);
                      draftContextToRemove === null || draftContextToRemove === void 0 ? void 0 : draftContextToRemove.replaceWith(oContext);
                    });
                  }, function (error) {
                    Log.error("Error while replacing the draft instance in the LR ODLB", error);
                  });
                  if (_temp48 && _temp48.then) return _temp48.then(function () {});
                });
              } catch (e) {
                return Promise.reject(e);
              }
            };
          }
          return Promise.resolve(_this13._deleteDocumentTransaction(oContext, mParameters)).then(function () {
            // Single objet deletion is triggered from an OP header button (not from a list)
            // --> Mark UI dirty and navigate back to dismiss the OP
            if (!_this13._isFclEnabled()) {
              EditState.setEditStateDirty();
            }
            _this13._sendActivity(Activity.Delete, oContext);

            // After delete is successfull, we need to detach the setBackNavigation Methods
            if (oAppComponent) {
              oAppComponent.getShellServices().setBackNavigation();
            }
            if ((oAppComponent === null || oAppComponent === void 0 ? void 0 : oAppComponent.getStartupMode()) === StartupMode.Deeplink && !_this13._isFclEnabled()) {
              // In case the app has been launched with semantic keys, deleting the object we've landed on shall navigate back
              // to the app we came from (except for FCL, where we navigate to LR as usual)
              oAppComponent.getRouterProxy().exitFromApp();
            } else {
              _this13._getRoutingListener().navigateBackFromContext(oContext);
            }
          });
        }, function (error) {
          Log.error("Error while deleting the document", error);
        });
        return Promise.resolve(_temp47 && _temp47.then ? _temp47.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Submit the current set of changes and navigate back.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oContext  Context of the document
     * @returns Promise resolves once the changes have been saved
     * @alias sap.fe.core.controllerextensions.EditFlow#applyDocument
     * @public
     * @since 1.90.0
     */
    ;
    _proto.applyDocument = function applyDocument(oContext) {
      try {
        var _this15 = this;
        var oLockObject = _this15._getGlobalUIModel();
        BusyLocker.lock(oLockObject);
        var _temp50 = _finallyRethrows(function () {
          return Promise.resolve(_this15._syncTask()).then(function () {
            return Promise.resolve(_this15._submitOpenChanges(oContext)).then(function () {
              return Promise.resolve(_this15._checkForValidationErrors()).then(function () {
                return Promise.resolve(_this15._getMessageHandler().showMessageDialog()).then(function () {
                  return Promise.resolve(_this15._getRoutingListener().navigateBackFromContext(oContext)).then(function () {});
                });
              });
            });
          });
        }, function (_wasThrown3, _result13) {
          if (BusyLocker.isLocked(oLockObject)) {
            BusyLocker.unlock(oLockObject);
          }
          if (_wasThrown3) throw _result13;
          return _result13;
        });
        return Promise.resolve(_temp50 && _temp50.then ? _temp50.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    } // Internal only params ---
    // @param {boolean} [mParameters.bStaticAction] Boolean value for static action, undefined for other actions
    // @param {boolean} [mParameters.isNavigable] Boolean value indicating whether navigation is required after the action has been executed
    // Currently the parameter isNavigable is used internally and should be changed to requiresNavigation as it is a more apt name for this param
    /**
     * Invokes an action (bound or unbound) and tracks the changes so that other pages can be refreshed and show the updated data upon navigation.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param sActionName The name of the action to be called
     * @param mInParameters Contains the following attributes:
     * @param mInParameters.parameterValues A map of action parameter names and provided values
     * @param mInParameters.parameterValues.name Name of the parameter
     * @param mInParameters.parameterValues.value Value of the parameter
     * @param mInParameters.skipParameterDialog Skips the action parameter dialog if values are provided for all of them in parameterValues
     * @param mInParameters.contexts For a bound action, a context or an array with contexts for which the action is to be called must be provided
     * @param mInParameters.model For an unbound action, an instance of an OData V4 model must be provided
     * @param mInParameters.requiresNavigation Boolean value indicating whether navigation is required after the action has been executed. Navigation takes place to the context returned by the action
     * @param mInParameters.label A human-readable label for the action. This is needed in case the action has a parameter and a parameter dialog is shown to the user. The label will be used for the title of the dialog and for the confirmation button
     * @param mInParameters.invocationGrouping Mode how actions are to be called: 'ChangeSet' to put all action calls into one changeset, 'Isolated' to put them into separate changesets
     * @param mExtraParams PRIVATE
     * @returns A promise which resolves once the action has been executed, providing the response
     * @alias sap.fe.core.controllerextensions.EditFlow#invokeAction
     * @public
     * @since 1.90.0
     * @final
     */
    ;
    _proto.invokeAction = function invokeAction(sActionName, mInParameters, mExtraParams) {
      try {
        var _this17 = this;
        var oControl;
        var transactionHelper = _this17._getTransactionHelper();
        var aParts;
        var sOverloadEntityType;
        var oCurrentActionCallBacks;
        var oView = _this17.getView();
        var mParameters = mInParameters || {};

        // Due to a mistake the invokeAction in the extensionAPI had a different API than this one.
        // The one from the extensionAPI doesn't exist anymore as we expose the full edit flow now but
        // due to compatibility reasons we still need to support the old signature
        if (mParameters.isA && mParameters.isA("sap.ui.model.odata.v4.Context") || Array.isArray(mParameters) || mExtraParams !== undefined) {
          var contexts = mParameters;
          mParameters = mExtraParams || {};
          if (contexts) {
            mParameters.contexts = contexts;
          } else {
            mParameters.model = _this17.getView().getModel();
          }
        }
        mParameters.isNavigable = mParameters.requiresNavigation || mParameters.isNavigable;
        if (!mParameters.parentControl) {
          mParameters.parentControl = _this17.getView();
        }
        if (mParameters.controlId) {
          oControl = _this17.getView().byId(mParameters.controlId);
          if (oControl) {
            // TODO: currently this selected contexts update is done within the operation, should be moved out
            mParameters.internalModelContext = oControl.getBindingContext("internal");
          }
        } else {
          mParameters.internalModelContext = oView.getBindingContext("internal");
        }
        if (sActionName && sActionName.indexOf("(") > -1) {
          // get entity type of action overload and remove it from the action path
          // Example sActionName = "<ActionName>(Collection(<OverloadEntityType>))"
          // sActionName = aParts[0] --> <ActionName>
          // sOverloadEntityType = aParts[2] --> <OverloadEntityType>
          aParts = sActionName.split("(");
          sActionName = aParts[0];
          sOverloadEntityType = aParts[aParts.length - 1].replaceAll(")", "");
        }
        if (mParameters.bStaticAction) {
          if (oControl.isTableBound()) {
            mParameters.contexts = oControl.getRowBinding().getHeaderContext();
          } else {
            var sBindingPath = oControl.data("rowsBindingInfo").path,
              _oListBinding = new ODataListBinding(_this17.getView().getModel(), sBindingPath);
            mParameters.contexts = _oListBinding.getHeaderContext();
          }
          if (sOverloadEntityType && oControl.getBindingContext()) {
            mParameters.contexts = _this17._getActionOverloadContextFromMetadataPath(oControl.getBindingContext(), oControl.getRowBinding(), sOverloadEntityType);
          }
          if (mParameters.enableAutoScroll) {
            oCurrentActionCallBacks = _this17._createActionPromise(sActionName, oControl.sId);
          }
        }
        mParameters.bGetBoundContext = _this17._getBoundContext(oView, mParameters);
        // Need to know that the action is called from ObjectPage for changeSet Isolated workaround
        mParameters.bObjectPage = oView.getViewData().converterType === "ObjectPage";
        return Promise.resolve(_catch(function () {
          return Promise.resolve(_this17._syncTask()).then(function () {
            return Promise.resolve(transactionHelper.callAction.bind(transactionHelper, sActionName, mParameters, _this17.getView(), _this17._getMessageHandler())()).then(function (oResponse) {
              function _temp52() {
                _this17._sendActivity(Activity.Action, mParameters.contexts);
                _this17._triggerConfiguredSurvey(sActionName, TriggerType.action);
                if (oCurrentActionCallBacks) {
                  oCurrentActionCallBacks.fResolver(oResponse);
                }
                /*
                		We set the (upper) pages to dirty after an execution of an action
                		TODO: get rid of this workaround
                		This workaround is only needed as long as the model does not support the synchronization.
                		Once this is supported we don't need to set the pages to dirty anymore as the context itself
                		is already refreshed (it's just not reflected in the object page)
                		we explicitly don't call this method from the list report but only call it from the object page
                		as if it is called in the list report it's not needed - as we anyway will remove this logic
                		we can live with this
                		we need a context to set the upper pages to dirty - if there are more than one we use the
                		first one as they are anyway siblings
                		*/
                if (mParameters.contexts) {
                  if (!_this17._isFclEnabled()) {
                    EditState.setEditStateDirty();
                  }
                  _this17._getInternalModel().setProperty("/sCustomAction", sActionName);
                }
                if (mParameters.isNavigable) {
                  var vContext = oResponse;
                  if (Array.isArray(vContext) && vContext.length === 1) {
                    vContext = vContext[0].value;
                  }
                  if (vContext && !Array.isArray(vContext)) {
                    var oMetaModel = oView.getModel().getMetaModel();
                    var sContextMetaPath = oMetaModel.getMetaPath(vContext.getPath());
                    var _fnValidContexts = function (contexts, applicableContexts) {
                      return contexts.filter(function (element) {
                        if (applicableContexts) {
                          return applicableContexts.indexOf(element) > -1;
                        }
                        return true;
                      });
                    };
                    var oActionContext = Array.isArray(mParameters.contexts) ? _fnValidContexts(mParameters.contexts, mParameters.applicableContext)[0] : mParameters.contexts;
                    var sActionContextMetaPath = oActionContext && oMetaModel.getMetaPath(oActionContext.getPath());
                    if (sContextMetaPath != undefined && sContextMetaPath === sActionContextMetaPath) {
                      if (oActionContext.getPath() !== vContext.getPath()) {
                        _this17._getRoutingListener().navigateForwardToContext(vContext, {
                          checkNoHashChange: true,
                          noHistoryEntry: false
                        });
                      } else {
                        Log.info("Navigation to the same context is not allowed");
                      }
                    }
                  }
                }
                return oResponse;
              }
              var _temp51 = function () {
                if (mParameters.contexts) {
                  return Promise.resolve(_this17._refreshListIfRequired(_this17._getActionResponseDataAndKeys(sActionName, oResponse), mParameters.contexts[0])).then(function () {});
                }
              }();
              return _temp51 && _temp51.then ? _temp51.then(_temp52) : _temp52(_temp51);
            });
          });
        }, function (err) {
          if (oCurrentActionCallBacks) {
            oCurrentActionCallBacks.fRejector();
          }
          // FIXME: in most situations there is no handler for the rejected promises returnedq
          if (err === Constants.CancelActionDialog) {
            // This leads to console error. Actually the error is already handled (currently directly in press handler of end button in dialog), so it should not be forwarded
            // up to here. However, when dialog handling and backend execution are separated, information whether dialog was cancelled, or backend execution has failed needs
            // to be transported to the place responsible for connecting these two things.
            // TODO: remove special handling one dialog handling and backend execution are separated
            throw new Error("Dialog cancelled");
          } else if (!(err && (err.canceled || err.rejectedItems && err.rejectedItems[0].canceled))) {
            // TODO: analyze, whether this is of the same category as above
            throw new Error("Error in EditFlow.invokeAction:".concat(err));
          }
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Secured execution of the given function. Ensures that the function is only executed when certain conditions are fulfilled.
     *
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param fnFunction The function to be executed. Should return a promise that is settled after completion of the execution. If nothing is returned, immediate completion is assumed.
     * @param mParameters Definitions of the preconditions to be checked before execution
     * @param mParameters.busy Defines the busy indicator
     * @param mParameters.busy.set Triggers a busy indicator when the function is executed.
     * @param mParameters.busy.check Executes function only if application isn't busy.
     * @param mParameters.updatesDocument This operation updates the current document without using the bound model and context. As a result, the draft status is updated if a draft document exists, and the user has to confirm the cancellation of the editing process.
     * @returns A promise that is rejected if the execution is prohibited and resolved by the promise returned by the fnFunction.
     * @alias sap.fe.core.controllerextensions.EditFlow#securedExecution
     * @public
     * @experimental As of version 1.90.0
     * @since 1.90.0
     */
    ;
    _proto.securedExecution = function securedExecution(fnFunction, mParameters) {
      var _this18 = this;
      var bBusySet = mParameters && mParameters.busy && mParameters.busy.set !== undefined ? mParameters.busy.set : true,
        bBusyCheck = mParameters && mParameters.busy && mParameters.busy.check !== undefined ? mParameters.busy.check : true,
        bUpdatesDocument = mParameters && mParameters.updatesDocument || false,
        oLockObject = this._getGlobalUIModel(),
        oContext = this.base.getView().getBindingContext(),
        bIsDraft = oContext && this._getProgrammingModel(oContext) === ProgrammingModel.Draft;
      if (bBusyCheck && BusyLocker.isLocked(oLockObject)) {
        return Promise.reject("Application already busy therefore execution rejected");
      }

      // we have to set busy and draft indicator immediately also the function might be executed later in queue
      if (bBusySet) {
        BusyLocker.lock(oLockObject);
      }
      if (bUpdatesDocument && bIsDraft) {
        this._setDraftStatus(DraftStatus.Saving);
      }
      this._getMessageHandler().removeTransitionMessages();
      return this._syncTask(fnFunction).then(function () {
        if (bUpdatesDocument) {
          _this18._getTransactionHelper().handleDocumentModifications();
          if (!_this18._isFclEnabled()) {
            EditState.setEditStateDirty();
          }
          if (bIsDraft) {
            _this18._setDraftStatus(DraftStatus.Saved);
          }
        }
      }).catch(function (oError) {
        if (bUpdatesDocument && bIsDraft) {
          _this18._setDraftStatus(DraftStatus.Clear);
        }
        return Promise.reject(oError);
      }).finally(function () {
        if (bBusySet) {
          BusyLocker.unlock(oLockObject);
        }
        _this18._getMessageHandler().showMessageDialog();
      });
    }

    /**
     * Handles the patchSent event: register document modification.
     *
     * @param oEvent
     */;
    _proto.handlePatchSent = function handlePatchSent(oEvent) {
      var _this$base$getView,
        _this$base$getView$ge,
        _this19 = this;
      if (!((_this$base$getView = this.base.getView()) !== null && _this$base$getView !== void 0 && (_this$base$getView$ge = _this$base$getView.getBindingContext("internal")) !== null && _this$base$getView$ge !== void 0 && _this$base$getView$ge.getProperty("skipPatchHandlers"))) {
        // Create a promise that will be resolved or rejected when the path is completed
        var oPatchPromise = new Promise(function (resolve, reject) {
          oEvent.getSource().attachEventOnce("patchCompleted", function (patchCompletedEvent) {
            if (oEvent.getSource().isA("sap.ui.model.odata.v4.ODataListBinding")) {
              var _this19$base$getView;
              ActionRuntime.setActionEnablementAfterPatch(_this19.base.getView(), oEvent.getSource(), (_this19$base$getView = _this19.base.getView()) === null || _this19$base$getView === void 0 ? void 0 : _this19$base$getView.getBindingContext("internal"));
            }
            var bSuccess = patchCompletedEvent.getParameter("success");
            if (bSuccess) {
              resolve();
            } else {
              reject();
            }
          });
        });
        this.updateDocument(oEvent.getSource(), oPatchPromise);
      }
    }

    /**
     * Handles the CreateActivate event.
     *
     * @param oEvent
     */;
    _proto.handleCreateActivate = function handleCreateActivate(oEvent) {
      var oBinding = oEvent.getSource();
      var transactionHelper = this._getTransactionHelper();
      var bAtEnd = true;
      var bInactive = true;
      var oResourceBundle = this._getResourceBundle();
      var oParams = {
        creationMode: CreationMode.Inline,
        createAtEnd: bAtEnd,
        inactive: bInactive,
        keepTransientContextOnFailed: false,
        // currently not fully supported
        busyMode: "None"
      };
      transactionHelper.createDocument(oBinding, oParams, oResourceBundle, this._getMessageHandler(), false, this.getView());
    }

    //////////////////////////////////////
    // Private methods
    //////////////////////////////////////

    /*
    		 TO BE CHECKED / DISCUSSED
    		 _createMultipleDocuments and deleteMultiDocument - couldn't we combine them with create and delete document?
    		 _createActionPromise and deleteCurrentActionPromise -> next step
    			 */;
    _proto._setEditMode = function _setEditMode(sEditMode, bCreationMode) {
      this.base.getView().getController()._editFlow.setEditMode(sEditMode, bCreationMode);
    };
    _proto._setDraftStatus = function _setDraftStatus(sDraftState) {
      this.base.getView().getController()._editFlow.setDraftStatus(sDraftState);
    };
    _proto._getRoutingListener = function _getRoutingListener() {
      return this.base.getView().getController()._editFlow.getRoutingListener();
    };
    _proto._getGlobalUIModel = function _getGlobalUIModel() {
      return this.base.getView().getController()._editFlow.getGlobalUIModel();
    };
    _proto._syncTask = function _syncTask(vTask) {
      return this.base.getView().getController()._editFlow.syncTask(vTask);
    };
    _proto._getProgrammingModel = function _getProgrammingModel(oContext) {
      return this.base.getView().getController()._editFlow.getProgrammingModel(oContext);
    };
    _proto._deleteDocumentTransaction = function _deleteDocumentTransaction(oContext, mParameters) {
      return this.base.getView().getController()._editFlow.deleteDocumentTransaction(oContext, mParameters);
    };
    _proto._handleCreateEvents = function _handleCreateEvents(oBinding) {
      this.base.getView().getController()._editFlow.handleCreateEvents(oBinding);
    };
    _proto._getTransactionHelper = function _getTransactionHelper() {
      return this.base.getView().getController()._editFlow.getTransactionHelper();
    };
    _proto._getInternalModel = function _getInternalModel() {
      return this.base.getView().getController()._editFlow.getInternalModel();
    };
    _proto._getRootViewController = function _getRootViewController() {
      return this.base.getAppComponent().getRootViewController();
    };
    _proto._getResourceBundle = function _getResourceBundle() {
      return this.getView().getController().oResourceBundle;
    };
    _proto._getSemanticMapping = function _getSemanticMapping() {
      return this.base.getAppComponent().getRoutingService().getLastSemanticMapping();
    }

    /**
     * Creates a new promise to wait for an action to be executed
     *
     * @function
     * @name _createActionPromise
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @returns {Function} The resolver function which can be used to externally resolve the promise
     */;
    _proto._createActionPromise = function _createActionPromise(sActionName, sControlId) {
      return this.base.getView().getController()._editFlow.createActionPromise(sActionName, sControlId);
    };
    _proto._getCurrentActionPromise = function _getCurrentActionPromise() {
      return this.base.getView().getController()._editFlow.getCurrentActionPromise();
    };
    _proto._deleteCurrentActionPromise = function _deleteCurrentActionPromise() {
      return this.base.getView().getController()._editFlow.deleteCurrentActionPromise();
    };
    _proto._getMessageHandler = function _getMessageHandler() {
      return this.base.getView().getController()._editFlow.getMessageHandler();
    };
    _proto._sendActivity = function _sendActivity(action, relatedContexts) {
      var content = Array.isArray(relatedContexts) ? relatedContexts.map(function (context) {
        return context.getPath();
      }) : relatedContexts === null || relatedContexts === void 0 ? void 0 : relatedContexts.getPath();
      send(this.getView(), action, content);
    };
    _proto._triggerConfiguredSurvey = function _triggerConfiguredSurvey(sActionName, triggerType) {
      triggerConfiguredSurvey(this.getView(), sActionName, triggerType);
    }

    /**
     * @function
     * @name _getActionResponseDataAndKeys
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param sActionName The name of the action that is executed
     * @param oResponse The bound action's response data or response context
     * @returns Object with data and names of the key fields of the response
     */;
    _proto._getActionResponseDataAndKeys = function _getActionResponseDataAndKeys(sActionName, oResponse) {
      return this.base.getView().getController()._editFlow.getActionResponseDataAndKeys(sActionName, oResponse);
    };
    _proto._submitOpenChanges = function _submitOpenChanges(oContext) {
      try {
        var _this21 = this;
        var _oModel = oContext.getModel(),
          oLockObject = _this21._getGlobalUIModel();
        return Promise.resolve(_finallyRethrows(function () {
          // Submit any leftover changes that are not yet submitted
          // Currently we are using only 1 updateGroupId, hence submitting the batch directly here
          return Promise.resolve(_oModel.submitBatch("$auto")).then(function () {
            // Wait for all currently running changes
            // For the time being we agreed with the v4 model team to use an internal method. We'll replace it once
            // a public or restricted method was provided
            return Promise.resolve(_oModel.oRequestor.waitForRunningChangeRequests("$auto")).then(function () {
              if (_oModel.hasPendingChanges("$auto")) {
                throw new Error("submit of open changes failed");
              }
            }); // Check if all changes were submitted successfully
          });
        }, function (_wasThrown4, _result15) {
          if (BusyLocker.isLocked(oLockObject)) {
            BusyLocker.unlock(oLockObject);
          }
          if (_wasThrown4) throw _result15;
          return _result15;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._handleStickyOn = function _handleStickyOn(oContext) {
      return this.base.getView().getController()._editFlow.handleStickyOn(oContext);
    };
    _proto._handleStickyOff = function _handleStickyOff() {
      return this.base.getView().getController()._editFlow.handleStickyOff();
    };
    _proto._onBackNavigationInSession = function _onBackNavigationInSession() {
      return this.base.getView().getController()._editFlow.onBackNavigationInSession();
    };
    _proto._discardStickySession = function _discardStickySession(oContext) {
      return this.base.getView().getController()._editFlow.discardStickySession(oContext);
    };
    _proto._setStickySessionInternalProperties = function _setStickySessionInternalProperties(programmingModel, model) {
      if (programmingModel === ProgrammingModel.Sticky) {
        var internalModel = this._getInternalModel();
        internalModel.setProperty("/sessionOn", true);
        internalModel.setProperty("/stickySessionToken", model.getHttpHeaders(true)["SAP-ContextId"]);
      }
    };
    _proto._removeStickySessionInternalProperties = function _removeStickySessionInternalProperties(programmingModel) {
      if (programmingModel === ProgrammingModel.Sticky) {
        var internalModel = this._getInternalModel();
        internalModel.setProperty("/sessionOn", false);
        internalModel.setProperty("/stickySessionToken", undefined);
        this._handleStickyOff( /*oContext*/);
      }
    };
    _proto._handleNewContext = function _handleNewContext(oContext, bEditable, bRecreateContext, bDraftNavigation) {
      var bForceFocus = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      try {
        var _this23 = this;
        if (!_this23._isFclEnabled()) {
          EditState.setEditStateDirty();
        }
        return Promise.resolve(_this23._getRoutingListener().navigateToContext(oContext, {
          checkNoHashChange: true,
          editable: bEditable,
          bPersistOPScroll: true,
          bRecreateContext: bRecreateContext,
          bDraftNavigation: bDraftNavigation,
          showPlaceholder: false,
          bForceFocus: bForceFocus,
          keepCurrentLayout: true
        })).then(function () {});
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._getBoundContext = function _getBoundContext(view, params) {
      var viewLevel = view.getViewData().viewLevel;
      var bRefreshAfterAction = viewLevel > 1 || viewLevel === 1 && params.controlId;
      return !params.isNavigable || !!bRefreshAfterAction;
    }

    /**
     * Checks if there are validation (parse) errors for controls bound to a given context
     *
     * @function
     * @name _checkForValidationErrors
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @returns {Promise} Promise resolves if there are no validation errors, and rejects if there are validation errors
     */;
    _proto._checkForValidationErrors = function _checkForValidationErrors() {
      var _this24 = this;
      return this._syncTask().then(function () {
        var sViewId = _this24.base.getView().getId();
        var aMessages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
        var oControl;
        var oMessage;
        if (!aMessages.length) {
          return Promise.resolve("No validation errors found");
        }
        for (var i = 0; i < aMessages.length; i++) {
          oMessage = aMessages[i];
          if (oMessage.validation) {
            oControl = Core.byId(oMessage.getControlId());
            while (oControl) {
              if (oControl.getId() === sViewId) {
                return Promise.reject("validation errors exist");
              }
              oControl = oControl.getParent();
            }
          }
        }
      });
    }

    /**
     * @function
     * @name _refreshListIfRequired
     * @memberof sap.fe.core.controllerextensions.EditFlow
     * @param oResponse The response of the bound action and the names of the key fields
     * @param oContext The bound context on which the action was executed
     * @returns Always resolves to param oResponse
     */;
    _proto._refreshListIfRequired = function _refreshListIfRequired(oResponse, oContext) {
      var _this25 = this;
      if (!oContext || !oResponse || !oResponse.oData) {
        return Promise.resolve();
      }
      var oBinding = oContext.getBinding();
      // refresh only lists
      if (oBinding && oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
        var oContextData = oResponse.oData;
        var aKeys = oResponse.keys;
        var oCurrentData = oContext.getObject();
        var bReturnedContextIsSame = true;
        // ensure context is in the response
        if (Object.keys(oContextData).length) {
          // check if context in response is different than the bound context
          bReturnedContextIsSame = aKeys.every(function (sKey) {
            return oCurrentData[sKey] === oContextData[sKey];
          });
          if (!bReturnedContextIsSame) {
            return new Promise(function (resolve) {
              if (oBinding.isRoot()) {
                oBinding.attachEventOnce("dataReceived", function () {
                  resolve();
                });
                oBinding.refresh();
              } else {
                var oAppComponent = CommonUtils.getAppComponent(_this25.getView());
                oAppComponent.getSideEffectsService().requestSideEffects([{
                  $NavigationPropertyPath: oBinding.getPath()
                }], oBinding.getContext()).then(function () {
                  resolve();
                }, function () {
                  Log.error("Error while refreshing the table");
                  resolve();
                }).catch(function (e) {
                  Log.error("Error while refreshing the table", e);
                });
              }
            });
          }
        }
      }
      // resolve with oResponse to not disturb the promise chain afterwards
      return Promise.resolve();
    };
    _proto._fetchSemanticKeyValues = function _fetchSemanticKeyValues(oContext) {
      var oMetaModel = oContext.getModel().getMetaModel(),
        sEntitySetName = oMetaModel.getMetaContext(oContext.getPath()).getObject("@sapui.name"),
        aSemanticKeys = SemanticKeyHelper.getSemanticKeys(oMetaModel, sEntitySetName);
      if (aSemanticKeys && aSemanticKeys.length) {
        var aRequestPromises = aSemanticKeys.map(function (oKey) {
          return oContext.requestObject(oKey.$PropertyPath);
        });
        return Promise.all(aRequestPromises);
      } else {
        return Promise.resolve();
      }
    }

    /**
     * Provides the latest context in the metadata hierarchy from rootBinding to given context pointing to given entityType
     * if any such context exists. Otherwise, it returns the original context.
     * Note: It is only needed as work-around for incorrect modelling. Correct modelling would imply a DataFieldForAction in a LineItem
     * to point to an overload defined either on the corresponding EntityType or a collection of the same.
     *
     * @param rootContext The context to start searching from
     * @param listBinding The listBinding of the table
     * @param overloadEntityType The ActionOverload entity type to search for
     * @returns Returns the context of the ActionOverload entity
     */;
    _proto._getActionOverloadContextFromMetadataPath = function _getActionOverloadContextFromMetadataPath(rootContext, listBinding, overloadEntityType) {
      var model = rootContext.getModel();
      var metaModel = model.getMetaModel();
      var contextSegments = listBinding.getPath().split("/");
      var currentContext = rootContext;

      // We expect that the last segment of the listBinding is the ListBinding of the table. Remove this from contextSegments
      // because it is incorrect to execute bindContext on a list. We do not anyway need to search this context for the overload.
      contextSegments.pop();
      if (contextSegments.length === 0) {
        contextSegments = [""]; // Don't leave contextSegments undefined
      }

      if (contextSegments[0] !== "") {
        contextSegments.unshift(""); // to also get the root context, i.e. the bindingContext of the table
      }
      // load all the parent contexts into an array
      var parentContexts = contextSegments.map(function (pathSegment) {
        if (pathSegment !== "") {
          currentContext = model.bindContext(pathSegment, currentContext).getBoundContext();
        } else {
          // Creating a new context using bindContext(...).getBoundContext() does not work if the etag is needed. According to model colleagues,
          // we should always use an existing context if possible.
          // Currently, the only example we know about is using the rootContext - and in this case, we can obviously reuse that existing context.
          // If other examples should come up, the best possible work around would be to request some data to get an existing context. To keep the
          // request as small and fast as possible, we should request only the first key property. As this would introduce asynchronism, and anyway
          // the whole logic is only part of work-around for incorrect modelling, we wait until we have an example needing it before implementing this.
          currentContext = rootContext;
        }
        return currentContext;
      }).reverse();
      // search for context backwards
      var overloadContext = parentContexts.find(function (parentContext) {
        return metaModel.getMetaContext(parentContext.getPath()).getObject("$Type") === overloadEntityType;
      });
      return overloadContext || listBinding.getHeaderContext();
    };
    _proto._createSiblingInfo = function _createSiblingInfo(currentContext, newContext) {
      return {
        targetContext: newContext,
        pathMapping: [{
          oldPath: currentContext.getPath(),
          newPath: newContext.getPath()
        }]
      };
    };
    _proto._updatePathsInHistory = function _updatePathsInHistory(mappings) {
      var oAppComponent = this.base.getAppComponent();
      oAppComponent.getRouterProxy().setPathMapping(mappings);

      // Also update the semantic mapping in the routing service
      var lastSemanticMapping = this._getSemanticMapping();
      if (mappings.length && (lastSemanticMapping === null || lastSemanticMapping === void 0 ? void 0 : lastSemanticMapping.technicalPath) === mappings[mappings.length - 1].oldPath) {
        lastSemanticMapping.technicalPath = mappings[mappings.length - 1].newPath;
      }
    }

    /**
     * This methods creates a sibling context for a subobject page, and calculates a sibling path for
     * all intermediates paths between the OP and the sub-OP.
     *
     * @param rootCurrentContext The context for the root of the draft
     * @param rightmostCurrentContext The context of the subobject
     * @param sProgrammingModel The programming model
     * @param doNotComputeIfRoot If true, we don't compute siblingInfo if the root and the rightmost contexts are the same
     * @returns Returns the siblingInformation object
     */;
    _proto._computeSiblingInformation = function _computeSiblingInformation(rootCurrentContext, rightmostCurrentContext, sProgrammingModel, doNotComputeIfRoot) {
      try {
        var _rightmostCurrentCont;
        rightmostCurrentContext = (_rightmostCurrentCont = rightmostCurrentContext) !== null && _rightmostCurrentCont !== void 0 ? _rightmostCurrentCont : rootCurrentContext;
        if (!rightmostCurrentContext.getPath().startsWith(rootCurrentContext.getPath())) {
          // Wrong usage !!
          Log.error("Cannot compute rightmost sibling context");
          throw new Error("Cannot compute rightmost sibling context");
        }
        if (doNotComputeIfRoot && rightmostCurrentContext.getPath() === rootCurrentContext.getPath()) {
          return Promise.resolve(undefined);
        }
        var model = rootCurrentContext.getModel();
        if (sProgrammingModel === ProgrammingModel.Draft) {
          return Promise.resolve(draft.computeSiblingInformation(rootCurrentContext, rightmostCurrentContext));
        } else {
          // If not in draft mode, we just recreate a context from the path of the rightmost context
          // No path mapping is needed
          return Promise.resolve({
            targetContext: model.bindContext(rightmostCurrentContext.getPath()).getBoundContext(),
            pathMapping: []
          });
        }
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._isFclEnabled = function _isFclEnabled() {
      return CommonUtils.getAppComponent(this.getView())._isFclEnabled();
    };
    return EditFlow;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "editDocument", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "editDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteMultipleDocuments", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteMultipleDocuments"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "updateDocument", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "updateDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "createDocument", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "createDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeSave", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeSave"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeCreate", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeCreate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeEdit", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeEdit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeDiscard", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeDiscard"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeDelete", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeDelete"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "saveDocument", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "saveDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "toggleDraftActive", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "toggleDraftActive"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "cancelDocument", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "cancelDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "deleteDocument", [_dec26, _dec27], Object.getOwnPropertyDescriptor(_class2.prototype, "deleteDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyDocument", [_dec28, _dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "applyDocument"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "invokeAction", [_dec30, _dec31], Object.getOwnPropertyDescriptor(_class2.prototype, "invokeAction"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "securedExecution", [_dec32, _dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "securedExecution"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "handlePatchSent", [_dec34], Object.getOwnPropertyDescriptor(_class2.prototype, "handlePatchSent"), _class2.prototype)), _class2)) || _class);
  return EditFlow;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiZmluYWxpemVyIiwiYmluZCIsIkNyZWF0aW9uTW9kZSIsIkZFTGlicmFyeSIsIlByb2dyYW1taW5nTW9kZWwiLCJDb25zdGFudHMiLCJEcmFmdFN0YXR1cyIsIkVkaXRNb2RlIiwiU3RhcnR1cE1vZGUiLCJNZXNzYWdlVHlwZSIsImNvcmVMaWJyYXJ5IiwiRWRpdEZsb3ciLCJkZWZpbmVVSTVDbGFzcyIsInB1YmxpY0V4dGVuc2lvbiIsImZpbmFsRXh0ZW5zaW9uIiwiZXh0ZW5zaWJsZSIsIk92ZXJyaWRlRXhlY3V0aW9uIiwiQWZ0ZXIiLCJlZGl0RG9jdW1lbnQiLCJvQ29udGV4dCIsImJEcmFmdE5hdmlnYXRpb24iLCJ0cmFuc2FjdGlvbkhlbHBlciIsIl9nZXRUcmFuc2FjdGlvbkhlbHBlciIsIm9Sb290Vmlld0NvbnRyb2xsZXIiLCJfZ2V0Um9vdFZpZXdDb250cm9sbGVyIiwibW9kZWwiLCJnZXRNb2RlbCIsInJpZ2h0bW9zdENvbnRleHQiLCJiYXNlIiwiZWRpdEZsb3ciLCJvbkJlZm9yZUVkaXQiLCJjb250ZXh0IiwiZ2V0VmlldyIsIl9nZXRNZXNzYWdlSGFuZGxlciIsIm9OZXdEb2N1bWVudENvbnRleHQiLCJzUHJvZ3JhbW1pbmdNb2RlbCIsIl9nZXRQcm9ncmFtbWluZ01vZGVsIiwiX3NldFN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMiLCJfc2V0RWRpdE1vZGUiLCJFZGl0YWJsZSIsInNob3dNZXNzYWdlRGlhbG9nIiwiX2hhbmRsZU5ld0NvbnRleHQiLCJjb250ZXh0VG9OYXZpZ2F0ZSIsIlN0aWNreSIsIl9oYW5kbGVTdGlja3lPbiIsIk1vZGVsSGVscGVyIiwiaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQiLCJnZXRNZXRhTW9kZWwiLCJzaGFyZU9iamVjdCIsIl9pc0ZjbEVuYWJsZWQiLCJnZXRSaWdodG1vc3RDb250ZXh0IiwiX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24iLCJzaWJsaW5nSW5mbyIsIl9jcmVhdGVTaWJsaW5nSW5mbyIsIl91cGRhdGVQYXRoc0luSGlzdG9yeSIsInBhdGhNYXBwaW5nIiwidGFyZ2V0Q29udGV4dCIsImdldFBhdGgiLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsImRlbGV0ZU11bHRpcGxlRG9jdW1lbnRzIiwiYUNvbnRleHRzIiwibVBhcmFtZXRlcnMiLCJiZWZvcmVEZWxldGVDYWxsQmFjayIsIm9uQmVmb3JlRGVsZXRlIiwiZ2V0Q29udHJvbGxlciIsIl9lZGl0RmxvdyIsInVwZGF0ZURvY3VtZW50Iiwib1Byb21pc2UiLCJvcmlnaW5hbEJpbmRpbmdDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJiSXNEcmFmdCIsIkRyYWZ0IiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwiX3N5bmNUYXNrIiwiaGFuZGxlRG9jdW1lbnRNb2RpZmljYXRpb25zIiwiRWRpdFN0YXRlIiwic2V0RWRpdFN0YXRlRGlydHkiLCJfc2V0RHJhZnRTdGF0dXMiLCJTYXZpbmciLCJvQmluZGluZ0NvbnRleHQiLCJvTWV0YU1vZGVsIiwic0VudGl0eVNldE5hbWUiLCJnZXRNZXRhQ29udGV4dCIsImdldE9iamVjdCIsImFTZW1hbnRpY0tleXMiLCJTZW1hbnRpY0tleUhlbHBlciIsImdldFNlbWFudGljS2V5cyIsImxlbmd0aCIsIm9DdXJyZW50U2VtYW50aWNNYXBwaW5nIiwiX2dldFNlbWFudGljTWFwcGluZyIsInNDdXJyZW50U2VtYW50aWNQYXRoIiwic2VtYW50aWNQYXRoIiwic0NoYW5nZWRQYXRoIiwiZ2V0U2VtYW50aWNQYXRoIiwiU2F2ZWQiLCJDbGVhciIsInNob3dNZXNzYWdlcyIsImNyZWF0ZURvY3VtZW50Iiwidkxpc3RCaW5kaW5nIiwibUluUGFyYW1ldGVycyIsImNyZWF0aW9uTW9kZSIsIkNyZWF0aW9uUm93IiwiY3JlYXRpb25Sb3ciLCJvQ3JlYXRpb25Sb3dPYmplY3RzIiwib1RhYmxlIiwiZ2V0UGFyZW50Iiwib0V4ZWNDdXN0b21WYWxpZGF0aW9uIiwidmFsaWRhdGVEb2N1bWVudCIsImRhdGEiLCJjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24iLCJnZXRDcmVhdGlvblJvdyIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsInNldFByb3BlcnR5IiwiSW5saW5lIiwidGFibGVJZCIsImJ5SWQiLCJpc0EiLCJmbkZvY3VzT3JTY3JvbGwiLCJmb2N1c1JvdyIsInNjcm9sbFRvSW5kZXgiLCJnZXRSb3dCaW5kaW5nIiwiYXR0YWNoRXZlbnRPbmNlIiwiY3JlYXRlQXRFbmQiLCJnZXRMZW5ndGgiLCJoYW5kbGVTaWRlRWZmZWN0cyIsIm9MaXN0QmluZGluZyIsIm9DcmVhdGlvblByb21pc2UiLCJvTmV3Q29udGV4dCIsImNyZWF0ZWQiLCJDb21tb25VdGlscyIsImhhc1RyYW5zaWVudENvbnRleHQiLCJhcHBDb21wb25lbnQiLCJnZXRBcHBDb21wb25lbnQiLCJnZXRTaWRlRWZmZWN0c1NlcnZpY2UiLCJyZXF1ZXN0U2lkZUVmZmVjdHNGb3JOYXZpZ2F0aW9uUHJvcGVydHkiLCJjcmVhdGVDdXN0b21WYWxpZGF0aW9uTWVzc2FnZXMiLCJhVmFsaWRhdGlvbk1lc3NhZ2VzIiwic0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiIsIm1DdXN0b21WYWxpZGl0eSIsImdldFByb3BlcnR5Iiwib01lc3NhZ2VNYW5hZ2VyIiwiQ29yZSIsImdldE1lc3NhZ2VNYW5hZ2VyIiwiYUN1c3RvbU1lc3NhZ2VzIiwib0ZpZWxkQ29udHJvbCIsInNUYXJnZXQiLCJnZXRNZXNzYWdlTW9kZWwiLCJnZXREYXRhIiwiZm9yRWFjaCIsIm9NZXNzYWdlIiwiY29kZSIsInJlbW92ZU1lc3NhZ2VzIiwib1ZhbGlkYXRpb25NZXNzYWdlIiwibWVzc2FnZVRhcmdldCIsImdldENvbnRyb2wiLCJmaWVsZElkIiwiZ2V0QmluZGluZ1BhdGgiLCJmaWx0ZXIiLCJ0YXJnZXQiLCJhZGRNZXNzYWdlcyIsIk1lc3NhZ2UiLCJtZXNzYWdlIiwibWVzc2FnZVRleHQiLCJwcm9jZXNzb3IiLCJ0eXBlIiwiRXJyb3IiLCJ0ZWNobmljYWwiLCJwZXJzaXN0ZW50IiwiYUV4aXN0aW5nVmFsaWRhdGlvbk1lc3NhZ2VzIiwiYWRkQ29udHJvbElkIiwicHVzaCIsInRleHQiLCJjdXN0b21NZXNzYWdlcyIsInJlc29sdmVDcmVhdGlvbk1vZGUiLCJpbml0aWFsQ3JlYXRpb25Nb2RlIiwicHJvZ3JhbW1pbmdNb2RlbCIsIk5ld1BhZ2UiLCJpc1JlbGF0aXZlIiwic1BhdGgiLCJzTmV3QWN0aW9uIiwiYVBhcmFtZXRlcnMiLCJEZWZlcnJlZCIsInNNZXRhUGF0aCIsImdldE1ldGFQYXRoIiwiZ2V0SGVhZGVyQ29udGV4dCIsImFOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZHMiLCJnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMiLCJBc3luYyIsImJTaG91bGRCdXN5TG9jayIsIkJ1c3lMb2NrZXIiLCJsb2NrIiwib0xvY2tPYmplY3QiLCJvTmF2aWdhdGlvbiIsInJlc29sdmVkQ3JlYXRpb25Nb2RlIiwib1JvdXRpbmdMaXN0ZW5lciIsIm5hdmlnYXRlRm9yd2FyZFRvQ29udGV4dCIsImJEZWZlcnJlZENvbnRleHQiLCJlZGl0YWJsZSIsImJGb3JjZUZvY3VzIiwiYXN5bmNDb250ZXh0Iiwib0NyZWF0aW9uIiwiU3luYyIsIm1BcmdzIiwiY3JlYXRlQWN0aW9uIiwidHJhbnNpZW50IiwiY29yZVJlc291cmNlQnVuZGxlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwibmF2aWdhdGVUb01lc3NhZ2VQYWdlIiwiZ2V0VGV4dCIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJiRnJvbURlZmVycmVkIiwibmF2aWdhdGVUb0NvbnRleHQiLCJvQ3JlYXRpb25Sb3dMaXN0QmluZGluZyIsIm9DcmVhdGlvblJvd0NvbnRleHQiLCJnZXRCaW5kaW5nIiwiYlNraXBTaWRlRWZmZWN0cyIsIm9OZXdUcmFuc2llbnRDb250ZXh0IiwiY3JlYXRlIiwib0NyZWF0aW9uUm93Iiwic2V0QmluZGluZ0NvbnRleHQiLCJjYXRjaCIsInRyYWNlIiwiZGVsZXRlIiwiaXNMb2NrZWQiLCJ1bmxvY2siLCJQcm9taXNlIiwicmVqZWN0IiwiYklzTmV3UGFnZUNyZWF0aW9uIiwiYWxsIiwiYVBhcmFtcyIsIm9Nb2RlbCIsIl9zZW5kQWN0aXZpdHkiLCJBY3Rpdml0eSIsIkNyZWF0ZSIsIkNhbmNlbEFjdGlvbkRpYWxvZyIsIkFjdGlvbkV4ZWN1dGlvbkZhaWxlZCIsIkNyZWF0aW9uRmFpbGVkIiwibmF2aWdhdGVCYWNrRnJvbVRyYW5zaWVudFN0YXRlIiwiT0RhdGFMaXN0QmluZGluZyIsIm9QYXlsb2FkIiwiX2dldFJvdXRpbmdMaXN0ZW5lciIsImtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQiLCJidXN5TW9kZSIsImJ1c3lJZCIsImdldFRhYmxlRGVmaW5pdGlvbiIsImFubm90YXRpb24iLCJpZCIsIl9oYW5kbGVDcmVhdGVFdmVudHMiLCJwYXJlbnRDb250cm9sIiwiYmVmb3JlQ3JlYXRlQ2FsbEJhY2siLCJvbkJlZm9yZUNyZWF0ZSIsInNraXBQYXJhbWV0ZXJEaWFsb2ciLCJvQXBwQ29tcG9uZW50IiwiZ2V0U3RhcnR1cE1vZGUiLCJBdXRvQ3JlYXRlIiwib1Jlc291cmNlQnVuZGxlIiwiT2JqZWN0Iiwia2V5cyIsInNQcm9wZXJ0eVBhdGgiLCJvUHJvcGVydHkiLCIka2luZCIsIl9jaGVja0ZvclZhbGlkYXRpb25FcnJvcnMiLCJfZ2V0R2xvYmFsVUlNb2RlbCIsIl9nZXRSZXNvdXJjZUJ1bmRsZSIsIkV4dGVybmFsIiwicmVzb2x2ZSIsImdldFJvdXRlclByb3h5IiwicmVtb3ZlSUFwcFN0YXRlS2V5Iiwib0NvbnRyb2xsZXIiLCJzQ3JlYXRlUGF0aCIsImdldEFic29sdXRlTWV0YVBhdGhGb3JMaXN0QmluZGluZyIsImhhbmRsZXJzIiwib25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kIiwib3V0Ym91bmQiLCJ1bmRlZmluZWQiLCJvbkJlZm9yZVNhdmUiLCJvbkJlZm9yZURpc2NhcmQiLCJzYXZlRG9jdW1lbnQiLCJiRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvciIsImFCaW5kaW5ncyIsImJpbmRpbmdzIiwiX3N1Ym1pdE9wZW5DaGFuZ2VzIiwiYWN0aXZlRG9jdW1lbnRDb250ZXh0IiwiX3JlbW92ZVN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMiLCJBY3RpdmF0ZSIsIl90cmlnZ2VyQ29uZmlndXJlZFN1cnZleSIsIlN0YW5kYXJkQWN0aW9ucyIsInNhdmUiLCJUcmlnZ2VyVHlwZSIsInN0YW5kYXJkQWN0aW9uIiwiRGlzcGxheSIsImlzRmNsRW5hYmxlZCIsImNhbmNlbGVkIiwidG9nZ2xlRHJhZnRBY3RpdmUiLCJvQ29udGV4dERhdGEiLCJiRWRpdGFibGUiLCJJc0FjdGl2ZUVudGl0eSIsIkhhc0FjdGl2ZUVudGl0eSIsIkhhc0RyYWZ0RW50aXR5Iiwib1JpZ2h0bW9zdENvbnRleHQiLCJsYXN0U2VtYW50aWNNYXBwaW5nIiwidGVjaG5pY2FsUGF0aCIsInRhcmdldFBhdGgiLCJuZXdQYXRoIiwib2xkUGF0aCIsImNhbmNlbERvY3VtZW50IiwiY2FuY2VsQnV0dG9uIiwiY29udHJvbCIsImJlZm9yZUNhbmNlbENhbGxCYWNrIiwiY2FuY2VsUmVzdWx0IiwiRGlzY2FyZCIsInNraXBCYWNrTmF2aWdhdGlvbiIsIm5hdmlnYXRlQmFja0Zyb21Db250ZXh0Iiwib0FjdGl2ZURvY3VtZW50Q29udGV4dCIsIl9mZXRjaFNlbWFudGljS2V5VmFsdWVzIiwic2tpcEJpbmRpbmdUb1ZpZXciLCJpc0RyYWZ0Um9vdCIsIm1ldGFNb2RlbCIsIm1ldGFDb250ZXh0IiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwidGFyZ2V0RW50aXR5U2V0IiwiZGVsZXRlRG9jdW1lbnQiLCJiRmluZEFjdGl2ZUNvbnRleHRzIiwiZ2V0SW5kZXgiLCJwYXJhbWV0ZXJzIiwic2libGluZ0NvbnRleHQiLCJiaW5kQ29udGV4dCIsImdldEJvdW5kQ29udGV4dCIsInJlcXVlc3RDYW5vbmljYWxQYXRoIiwiZHJhZnRQYXRoIiwiZHJhZnRDb250ZXh0VG9SZW1vdmUiLCJnZXRLZWVwQWxpdmVDb250ZXh0IiwicmVwbGFjZVdpdGgiLCJfZGVsZXRlRG9jdW1lbnRUcmFuc2FjdGlvbiIsIkRlbGV0ZSIsImdldFNoZWxsU2VydmljZXMiLCJzZXRCYWNrTmF2aWdhdGlvbiIsIkRlZXBsaW5rIiwiZXhpdEZyb21BcHAiLCJhcHBseURvY3VtZW50IiwiaW52b2tlQWN0aW9uIiwic0FjdGlvbk5hbWUiLCJtRXh0cmFQYXJhbXMiLCJvQ29udHJvbCIsImFQYXJ0cyIsInNPdmVybG9hZEVudGl0eVR5cGUiLCJvQ3VycmVudEFjdGlvbkNhbGxCYWNrcyIsIm9WaWV3IiwiQXJyYXkiLCJpc0FycmF5IiwiY29udGV4dHMiLCJpc05hdmlnYWJsZSIsInJlcXVpcmVzTmF2aWdhdGlvbiIsImNvbnRyb2xJZCIsImludGVybmFsTW9kZWxDb250ZXh0IiwiaW5kZXhPZiIsInNwbGl0IiwicmVwbGFjZUFsbCIsImJTdGF0aWNBY3Rpb24iLCJpc1RhYmxlQm91bmQiLCJzQmluZGluZ1BhdGgiLCJwYXRoIiwiX2dldEFjdGlvbk92ZXJsb2FkQ29udGV4dEZyb21NZXRhZGF0YVBhdGgiLCJlbmFibGVBdXRvU2Nyb2xsIiwiX2NyZWF0ZUFjdGlvblByb21pc2UiLCJzSWQiLCJiR2V0Qm91bmRDb250ZXh0IiwiX2dldEJvdW5kQ29udGV4dCIsImJPYmplY3RQYWdlIiwiZ2V0Vmlld0RhdGEiLCJjb252ZXJ0ZXJUeXBlIiwiY2FsbEFjdGlvbiIsIm9SZXNwb25zZSIsIkFjdGlvbiIsImFjdGlvbiIsImZSZXNvbHZlciIsIl9nZXRJbnRlcm5hbE1vZGVsIiwidkNvbnRleHQiLCJ2YWx1ZSIsInNDb250ZXh0TWV0YVBhdGgiLCJfZm5WYWxpZENvbnRleHRzIiwiYXBwbGljYWJsZUNvbnRleHRzIiwiZWxlbWVudCIsIm9BY3Rpb25Db250ZXh0IiwiYXBwbGljYWJsZUNvbnRleHQiLCJzQWN0aW9uQ29udGV4dE1ldGFQYXRoIiwiY2hlY2tOb0hhc2hDaGFuZ2UiLCJub0hpc3RvcnlFbnRyeSIsImluZm8iLCJfcmVmcmVzaExpc3RJZlJlcXVpcmVkIiwiX2dldEFjdGlvblJlc3BvbnNlRGF0YUFuZEtleXMiLCJlcnIiLCJmUmVqZWN0b3IiLCJyZWplY3RlZEl0ZW1zIiwic2VjdXJlZEV4ZWN1dGlvbiIsImZuRnVuY3Rpb24iLCJiQnVzeVNldCIsImJ1c3kiLCJzZXQiLCJiQnVzeUNoZWNrIiwiY2hlY2siLCJiVXBkYXRlc0RvY3VtZW50IiwidXBkYXRlc0RvY3VtZW50IiwiZmluYWxseSIsImhhbmRsZVBhdGNoU2VudCIsIm9FdmVudCIsIm9QYXRjaFByb21pc2UiLCJnZXRTb3VyY2UiLCJwYXRjaENvbXBsZXRlZEV2ZW50IiwiQWN0aW9uUnVudGltZSIsInNldEFjdGlvbkVuYWJsZW1lbnRBZnRlclBhdGNoIiwiYlN1Y2Nlc3MiLCJnZXRQYXJhbWV0ZXIiLCJoYW5kbGVDcmVhdGVBY3RpdmF0ZSIsIm9CaW5kaW5nIiwiYkF0RW5kIiwiYkluYWN0aXZlIiwib1BhcmFtcyIsImluYWN0aXZlIiwic0VkaXRNb2RlIiwiYkNyZWF0aW9uTW9kZSIsInNldEVkaXRNb2RlIiwic0RyYWZ0U3RhdGUiLCJzZXREcmFmdFN0YXR1cyIsImdldFJvdXRpbmdMaXN0ZW5lciIsImdldEdsb2JhbFVJTW9kZWwiLCJ2VGFzayIsInN5bmNUYXNrIiwiZ2V0UHJvZ3JhbW1pbmdNb2RlbCIsImRlbGV0ZURvY3VtZW50VHJhbnNhY3Rpb24iLCJoYW5kbGVDcmVhdGVFdmVudHMiLCJnZXRUcmFuc2FjdGlvbkhlbHBlciIsImdldEludGVybmFsTW9kZWwiLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJnZXRSb3V0aW5nU2VydmljZSIsImdldExhc3RTZW1hbnRpY01hcHBpbmciLCJzQ29udHJvbElkIiwiY3JlYXRlQWN0aW9uUHJvbWlzZSIsIl9nZXRDdXJyZW50QWN0aW9uUHJvbWlzZSIsImdldEN1cnJlbnRBY3Rpb25Qcm9taXNlIiwiX2RlbGV0ZUN1cnJlbnRBY3Rpb25Qcm9taXNlIiwiZGVsZXRlQ3VycmVudEFjdGlvblByb21pc2UiLCJnZXRNZXNzYWdlSGFuZGxlciIsInJlbGF0ZWRDb250ZXh0cyIsImNvbnRlbnQiLCJtYXAiLCJzZW5kIiwidHJpZ2dlclR5cGUiLCJ0cmlnZ2VyQ29uZmlndXJlZFN1cnZleSIsImdldEFjdGlvblJlc3BvbnNlRGF0YUFuZEtleXMiLCJzdWJtaXRCYXRjaCIsIm9SZXF1ZXN0b3IiLCJ3YWl0Rm9yUnVubmluZ0NoYW5nZVJlcXVlc3RzIiwiaGFzUGVuZGluZ0NoYW5nZXMiLCJoYW5kbGVTdGlja3lPbiIsIl9oYW5kbGVTdGlja3lPZmYiLCJoYW5kbGVTdGlja3lPZmYiLCJfb25CYWNrTmF2aWdhdGlvbkluU2Vzc2lvbiIsIm9uQmFja05hdmlnYXRpb25JblNlc3Npb24iLCJfZGlzY2FyZFN0aWNreVNlc3Npb24iLCJkaXNjYXJkU3RpY2t5U2Vzc2lvbiIsImludGVybmFsTW9kZWwiLCJnZXRIdHRwSGVhZGVycyIsImJSZWNyZWF0ZUNvbnRleHQiLCJiUGVyc2lzdE9QU2Nyb2xsIiwic2hvd1BsYWNlaG9sZGVyIiwia2VlcEN1cnJlbnRMYXlvdXQiLCJ2aWV3IiwicGFyYW1zIiwidmlld0xldmVsIiwiYlJlZnJlc2hBZnRlckFjdGlvbiIsInNWaWV3SWQiLCJnZXRJZCIsImFNZXNzYWdlcyIsInNhcCIsInVpIiwiZ2V0Q29yZSIsImkiLCJ2YWxpZGF0aW9uIiwiZ2V0Q29udHJvbElkIiwib0RhdGEiLCJhS2V5cyIsIm9DdXJyZW50RGF0YSIsImJSZXR1cm5lZENvbnRleHRJc1NhbWUiLCJldmVyeSIsInNLZXkiLCJpc1Jvb3QiLCJyZWZyZXNoIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJnZXRDb250ZXh0IiwiYVJlcXVlc3RQcm9taXNlcyIsIm9LZXkiLCJyZXF1ZXN0T2JqZWN0IiwiJFByb3BlcnR5UGF0aCIsInJvb3RDb250ZXh0IiwibGlzdEJpbmRpbmciLCJvdmVybG9hZEVudGl0eVR5cGUiLCJjb250ZXh0U2VnbWVudHMiLCJjdXJyZW50Q29udGV4dCIsInBvcCIsInVuc2hpZnQiLCJwYXJlbnRDb250ZXh0cyIsInBhdGhTZWdtZW50IiwicmV2ZXJzZSIsIm92ZXJsb2FkQ29udGV4dCIsImZpbmQiLCJwYXJlbnRDb250ZXh0IiwibmV3Q29udGV4dCIsIm1hcHBpbmdzIiwic2V0UGF0aE1hcHBpbmciLCJyb290Q3VycmVudENvbnRleHQiLCJyaWdodG1vc3RDdXJyZW50Q29udGV4dCIsImRvTm90Q29tcHV0ZUlmUm9vdCIsInN0YXJ0c1dpdGgiLCJkcmFmdCIsImNvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24iLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJFZGl0Rmxvdy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBCdXN5TG9ja2VyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9CdXN5TG9ja2VyXCI7XG5pbXBvcnQgeyBzZW5kIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQWN0aXZpdHlTeW5jXCI7XG5pbXBvcnQgeyBBY3Rpdml0eSwgc2hhcmVPYmplY3QgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSB7IFNpYmxpbmdJbmZvcm1hdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9kcmFmdFwiO1xuaW1wb3J0IGRyYWZ0IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9kcmFmdFwiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBFZGl0U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRWRpdFN0YXRlXCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFNlbWFudGljS2V5SGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NlbWFudGljS2V5SGVscGVyXCI7XG5pbXBvcnQgRkVMaWJyYXJ5IGZyb20gXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIHsgU2VtYW50aWNNYXBwaW5nIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1JvdXRpbmdTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHsgU3RhbmRhcmRBY3Rpb25zLCB0cmlnZ2VyQ29uZmlndXJlZFN1cnZleSwgVHJpZ2dlclR5cGUgfSBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9GZWVkYmFja1wiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IGNvcmVMaWJyYXJ5IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgdHlwZSBUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIHsgVjRDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuaW1wb3J0IEFjdGlvblJ1bnRpbWUgZnJvbSBcIi4uL0FjdGlvblJ1bnRpbWVcIjtcblxuY29uc3QgQ3JlYXRpb25Nb2RlID0gRkVMaWJyYXJ5LkNyZWF0aW9uTW9kZSxcblx0UHJvZ3JhbW1pbmdNb2RlbCA9IEZFTGlicmFyeS5Qcm9ncmFtbWluZ01vZGVsLFxuXHRDb25zdGFudHMgPSBGRUxpYnJhcnkuQ29uc3RhbnRzLFxuXHREcmFmdFN0YXR1cyA9IEZFTGlicmFyeS5EcmFmdFN0YXR1cyxcblx0RWRpdE1vZGUgPSBGRUxpYnJhcnkuRWRpdE1vZGUsXG5cdFN0YXJ0dXBNb2RlID0gRkVMaWJyYXJ5LlN0YXJ0dXBNb2RlLFxuXHRNZXNzYWdlVHlwZSA9IGNvcmVMaWJyYXJ5Lk1lc3NhZ2VUeXBlO1xuXG4vKipcbiAqIEEgY29udHJvbGxlciBleHRlbnNpb24gb2ZmZXJpbmcgaG9va3MgaW50byB0aGUgZWRpdCBmbG93IG9mIHRoZSBhcHBsaWNhdGlvblxuICpcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjkwLjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcIilcbmNsYXNzIEVkaXRGbG93IGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cblx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0Ly8gUHVibGljIG1ldGhvZHNcblx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXHRwcml2YXRlIGZuRGlydHlTdGF0ZVByb3ZpZGVyPzogRnVuY3Rpb247XG5cdHByaXZhdGUgZm5IYW5kbGVTZXNzaW9uVGltZW91dD86IEZ1bmN0aW9uO1xuXHRwcml2YXRlIG1QYXRjaFByb21pc2VzPzogYW55O1xuXHRwcml2YXRlIF9mblN0aWNreURpc2NhcmRBZnRlck5hdmlnYXRpb24/OiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGRyYWZ0IGRvY3VtZW50IGZvciBhbiBleGlzdGluZyBhY3RpdmUgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50XG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgb25jZSB0aGUgZWRpdGFibGUgZG9jdW1lbnQgaXMgYXZhaWxhYmxlXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNlZGl0RG9jdW1lbnRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgZWRpdERvY3VtZW50KG9Db250ZXh0OiBWNENvbnRleHQpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBiRHJhZnROYXZpZ2F0aW9uID0gdHJ1ZTtcblx0XHRjb25zdCB0cmFuc2FjdGlvbkhlbHBlciA9IHRoaXMuX2dldFRyYW5zYWN0aW9uSGVscGVyKCk7XG5cdFx0Y29uc3Qgb1Jvb3RWaWV3Q29udHJvbGxlciA9IHRoaXMuX2dldFJvb3RWaWV3Q29udHJvbGxlcigpIGFzIGFueTtcblx0XHRjb25zdCBtb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCk7XG5cdFx0bGV0IHJpZ2h0bW9zdENvbnRleHQ7XG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuYmFzZS5lZGl0Rmxvdy5vbkJlZm9yZUVkaXQoeyBjb250ZXh0OiBvQ29udGV4dCB9KTtcblx0XHRcdGNvbnN0IG9OZXdEb2N1bWVudENvbnRleHQgPSBhd2FpdCB0cmFuc2FjdGlvbkhlbHBlci5lZGl0RG9jdW1lbnQob0NvbnRleHQsIHRoaXMuZ2V0VmlldygpLCB0aGlzLl9nZXRNZXNzYWdlSGFuZGxlcigpKTtcblxuXHRcdFx0Y29uc3Qgc1Byb2dyYW1taW5nTW9kZWwgPSB0aGlzLl9nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KTtcblxuXHRcdFx0dGhpcy5fc2V0U3RpY2t5U2Vzc2lvbkludGVybmFsUHJvcGVydGllcyhzUHJvZ3JhbW1pbmdNb2RlbCwgbW9kZWwpO1xuXG5cdFx0XHRpZiAob05ld0RvY3VtZW50Q29udGV4dCkge1xuXHRcdFx0XHR0aGlzLl9zZXRFZGl0TW9kZShFZGl0TW9kZS5FZGl0YWJsZSwgZmFsc2UpO1xuXHRcdFx0XHR0aGlzLl9nZXRNZXNzYWdlSGFuZGxlcigpLnNob3dNZXNzYWdlRGlhbG9nKCk7XG5cblx0XHRcdFx0aWYgKG9OZXdEb2N1bWVudENvbnRleHQgIT09IG9Db250ZXh0KSB7XG5cdFx0XHRcdFx0bGV0IGNvbnRleHRUb05hdmlnYXRlID0gb05ld0RvY3VtZW50Q29udGV4dDtcblx0XHRcdFx0XHRpZiAodGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRcdHJpZ2h0bW9zdENvbnRleHQgPSBvUm9vdFZpZXdDb250cm9sbGVyLmdldFJpZ2h0bW9zdENvbnRleHQoKTtcblx0XHRcdFx0XHRcdGxldCBzaWJsaW5nSW5mbyA9IGF3YWl0IHRoaXMuX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24ob0NvbnRleHQsIHJpZ2h0bW9zdENvbnRleHQsIHNQcm9ncmFtbWluZ01vZGVsLCB0cnVlKTtcblx0XHRcdFx0XHRcdHNpYmxpbmdJbmZvID0gc2libGluZ0luZm8gPz8gdGhpcy5fY3JlYXRlU2libGluZ0luZm8ob0NvbnRleHQsIG9OZXdEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0XHRcdFx0dGhpcy5fdXBkYXRlUGF0aHNJbkhpc3Rvcnkoc2libGluZ0luZm8ucGF0aE1hcHBpbmcpO1xuXHRcdFx0XHRcdFx0aWYgKHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQuZ2V0UGF0aCgpICE9IG9OZXdEb2N1bWVudENvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnRleHRUb05hdmlnYXRlID0gc2libGluZ0luZm8udGFyZ2V0Q29udGV4dDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVOZXdDb250ZXh0KGNvbnRleHRUb05hdmlnYXRlLCB0cnVlLCBmYWxzZSwgYkRyYWZ0TmF2aWdhdGlvbiwgdHJ1ZSk7XG5cdFx0XHRcdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSkge1xuXHRcdFx0XHRcdFx0Ly8gVGhlIHN0aWNreU9uIGhhbmRsZXIgbXVzdCBiZSBzZXQgYWZ0ZXIgdGhlIG5hdmlnYXRpb24gaGFzIGJlZW4gZG9uZSxcblx0XHRcdFx0XHRcdC8vIGFzIHRoZSBVUkwgbWF5IGNoYW5nZSBpbiB0aGUgY2FzZSBvZiBGQ0xcblx0XHRcdFx0XHRcdHRoaXMuX2hhbmRsZVN0aWNreU9uKG9OZXdEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoTW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQobW9kZWwuZ2V0TWV0YU1vZGVsKCkpKSB7XG5cdFx0XHRcdFx0XHQvLyBhY2NvcmRpbmcgdG8gVVggaW4gY2FzZSBvZiBlbmFibGVkIGNvbGxhYm9yYXRpb24gZHJhZnQgd2Ugc2hhcmUgdGhlIG9iamVjdCBpbW1lZGlhdGVseVxuXHRcdFx0XHRcdFx0YXdhaXQgc2hhcmVPYmplY3Qob05ld0RvY3VtZW50Q29udGV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAob0Vycm9yKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBlZGl0aW5nIHRoZSBkb2N1bWVudFwiLCBvRXJyb3IgYXMgYW55KTtcblx0XHR9XG5cdH1cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGRlbGV0ZU11bHRpcGxlRG9jdW1lbnRzKGFDb250ZXh0czogYW55LCBtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0aWYgKG1QYXJhbWV0ZXJzKSB7XG5cdFx0XHRtUGFyYW1ldGVycy5iZWZvcmVEZWxldGVDYWxsQmFjayA9IHRoaXMuYmFzZS5lZGl0Rmxvdy5vbkJlZm9yZURlbGV0ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bVBhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdGJlZm9yZURlbGV0ZUNhbGxCYWNrOiB0aGlzLmJhc2UuZWRpdEZsb3cub25CZWZvcmVEZWxldGVcblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiAodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLl9lZGl0Rmxvdy5kZWxldGVNdWx0aXBsZURvY3VtZW50cyhhQ29udGV4dHMsIG1QYXJhbWV0ZXJzKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGVzIHRoZSBkcmFmdCBzdGF0dXMgYW5kIGRpc3BsYXlzIHRoZSBlcnJvciBtZXNzYWdlcyBpZiB0aGVyZSBhcmUgZXJyb3JzIGR1cmluZyBhbiB1cGRhdGUuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgdXBkYXRlZCBmaWVsZFxuXHQgKiBAcGFyYW0gb1Byb21pc2UgUHJvbWlzZSB0byBkZXRlcm1pbmUgd2hlbiB0aGUgdXBkYXRlIG9wZXJhdGlvbiBpcyBjb21wbGV0ZWQuIFRoZSBwcm9taXNlIHNob3VsZCBiZSByZXNvbHZlZCB3aGVuIHRoZSB1cGRhdGUgb3BlcmF0aW9uIGlzIGNvbXBsZXRlZCwgc28gdGhlIGRyYWZ0IHN0YXR1cyBjYW4gYmUgdXBkYXRlZC5cblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBvbmNlIGRyYWZ0IHN0YXR1cyBoYXMgYmVlbiB1cGRhdGVkXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyN1cGRhdGVEb2N1bWVudFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHR1cGRhdGVEb2N1bWVudChvQ29udGV4dDogb2JqZWN0LCBvUHJvbWlzZTogUHJvbWlzZTxhbnk+KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgdHJhbnNhY3Rpb25IZWxwZXIgPSB0aGlzLl9nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXHRcdGNvbnN0IG9yaWdpbmFsQmluZGluZ0NvbnRleHQgPSB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGNvbnN0IGJJc0RyYWZ0ID0gdGhpcy5fZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQ29udGV4dCkgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQ7XG5cblx0XHR0aGlzLl9nZXRNZXNzYWdlSGFuZGxlcigpLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdHJldHVybiB0aGlzLl9zeW5jVGFzayhhc3luYyAoKSA9PiB7XG5cdFx0XHRpZiAob3JpZ2luYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0XHR0cmFuc2FjdGlvbkhlbHBlci5oYW5kbGVEb2N1bWVudE1vZGlmaWNhdGlvbnMoKTtcblx0XHRcdFx0aWYgKCF0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKGJJc0RyYWZ0KSB7XG5cdFx0XHRcdFx0dGhpcy5fc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuU2F2aW5nKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHR0cnkge1xuXHRcdFx0XHRhd2FpdCBvUHJvbWlzZTtcblx0XHRcdFx0Ly8gSWYgYSBuYXZpZ2F0aW9uIGhhcHBlbmVkIHdoaWxlIG9Qcm9taXNlIHdhcyBiZWluZyByZXNvbHZlZCwgdGhlIGJpbmRpbmcgY29udGV4dCBvZiB0aGUgcGFnZSBjaGFuZ2VkXG5cdFx0XHRcdC8vIEluIHRoYXQgY2FzZSwgd2Ugc2hvdWxkbid0IGRvIGFueXRoaW5nXG5cdFx0XHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0XHRcdGlmIChiSXNEcmFmdCAmJiBvQmluZGluZ0NvbnRleHQgJiYgb0JpbmRpbmdDb250ZXh0ID09PSBvcmlnaW5hbEJpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0c0VudGl0eVNldE5hbWUgPSAob01ldGFNb2RlbCBhcyBhbnkpLmdldE1ldGFDb250ZXh0KG9CaW5kaW5nQ29udGV4dC5nZXRQYXRoKCkpLmdldE9iamVjdChcIkBzYXB1aS5uYW1lXCIpLFxuXHRcdFx0XHRcdFx0YVNlbWFudGljS2V5cyA9IFNlbWFudGljS2V5SGVscGVyLmdldFNlbWFudGljS2V5cyhvTWV0YU1vZGVsLCBzRW50aXR5U2V0TmFtZSk7XG5cdFx0XHRcdFx0aWYgKGFTZW1hbnRpY0tleXMgJiYgYVNlbWFudGljS2V5cy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9DdXJyZW50U2VtYW50aWNNYXBwaW5nID0gdGhpcy5fZ2V0U2VtYW50aWNNYXBwaW5nKCksXG5cdFx0XHRcdFx0XHRcdHNDdXJyZW50U2VtYW50aWNQYXRoID0gb0N1cnJlbnRTZW1hbnRpY01hcHBpbmcgJiYgb0N1cnJlbnRTZW1hbnRpY01hcHBpbmcuc2VtYW50aWNQYXRoLFxuXHRcdFx0XHRcdFx0XHRzQ2hhbmdlZFBhdGggPSBTZW1hbnRpY0tleUhlbHBlci5nZXRTZW1hbnRpY1BhdGgob0JpbmRpbmdDb250ZXh0LCB0cnVlKTtcblx0XHRcdFx0XHRcdC8vIHNDdXJyZW50U2VtYW50aWNQYXRoIGNvdWxkIGJlIG51bGwgaWYgd2UgaGF2ZSBuYXZpZ2F0ZWQgdmlhIGRlZXAgbGluayB0aGVuIHRoZXJlIGFyZSBubyBzZW1hbnRpY01hcHBpbmdzIHRvIGNhbGN1bGF0ZSBpdCBmcm9tXG5cdFx0XHRcdFx0XHRpZiAoc0N1cnJlbnRTZW1hbnRpY1BhdGggJiYgc0N1cnJlbnRTZW1hbnRpY1BhdGggIT09IHNDaGFuZ2VkUGF0aCkge1xuXHRcdFx0XHRcdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVOZXdDb250ZXh0KG9CaW5kaW5nQ29udGV4dCBhcyBDb250ZXh0LCB0cnVlLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdHRoaXMuX3NldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLlNhdmVkKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuX3NldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLlNhdmVkKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0dGhpcy5fc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuU2F2ZWQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgdXBkYXRpbmcgdGhlIGRvY3VtZW50XCIsIG9FcnJvcik7XG5cdFx0XHRcdGlmIChiSXNEcmFmdCAmJiBvcmlnaW5hbEJpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRcdFx0dGhpcy5fc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuQ2xlYXIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLl9nZXRNZXNzYWdlSGFuZGxlcigpLnNob3dNZXNzYWdlcygpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0Ly8gSW50ZXJuYWwgb25seSBwYXJhbXMgLS0tXG5cdC8vICogQHBhcmFtIHtzdHJpbmd9IG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSBUaGUgY3JlYXRpb24gbW9kZSB1c2luZyBvbmUgb2YgdGhlIGZvbGxvd2luZzpcblx0Ly8gKiAgICAgICAgICAgICAgICAgICAgU3luYyAtIHRoZSBjcmVhdGlvbiBpcyB0cmlnZ2VyZWQgYW5kIG9uY2UgdGhlIGRvY3VtZW50IGlzIGNyZWF0ZWQsIHRoZSBuYXZpZ2F0aW9uIGlzIGRvbmVcblx0Ly8gKiAgICAgICAgICAgICAgICAgICAgQXN5bmMgLSB0aGUgY3JlYXRpb24gYW5kIHRoZSBuYXZpZ2F0aW9uIHRvIHRoZSBpbnN0YW5jZSBhcmUgZG9uZSBpbiBwYXJhbGxlbFxuXHQvLyAqICAgICAgICAgICAgICAgICAgICBEZWZlcnJlZCAtIHRoZSBjcmVhdGlvbiBpcyBkb25lIG9uIHRoZSB0YXJnZXQgcGFnZVxuXHQvLyAqICAgICAgICAgICAgICAgICAgICBDcmVhdGlvblJvdyAtIFRoZSBjcmVhdGlvbiBpcyBkb25lIGlubGluZSBhc3luYyBzbyB0aGUgdXNlciBpcyBub3QgYmxvY2tlZFxuXHQvLyBtUGFyYW1ldGVycy5jcmVhdGlvblJvdyBJbnN0YW5jZSBvZiB0aGUgY3JlYXRpb24gcm93IC0gKFRPRE86IGdldCByaWQgYnV0IHVzZSBsaXN0IGJpbmRpbmdzIG9ubHkpXG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGpzZG9jL3JlcXVpcmUtcGFyYW1cblx0LyoqXG5cdCAqIENyZWF0ZXMgYSBuZXcgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gdkxpc3RCaW5kaW5nICBPRGF0YUxpc3RCaW5kaW5nIG9iamVjdCBvciB0aGUgYmluZGluZyBwYXRoIGZvciBhIHRlbXBvcmFyeSBsaXN0IGJpbmRpbmdcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMgQ29udGFpbnMgdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5jcmVhdGlvbk1vZGUgVGhlIGNyZWF0aW9uIG1vZGUgdXNpbmcgb25lIG9mIHRoZSBmb2xsb3dpbmc6XG5cdCAqICAgICAgICAgICAgICAgICAgICBOZXdQYWdlIC0gdGhlIGNyZWF0ZWQgZG9jdW1lbnQgaXMgc2hvd24gaW4gYSBuZXcgcGFnZSwgZGVwZW5kaW5nIG9uIHdoZXRoZXIgbWV0YWRhdGEgJ1N5bmMnLCAnQXN5bmMnIG9yICdEZWZlcnJlZCcgaXMgdXNlZFxuXHQgKiAgICAgICAgICAgICAgICAgICAgSW5saW5lIC0gVGhlIGNyZWF0aW9uIGlzIGRvbmUgaW5saW5lIChpbiBhIHRhYmxlKVxuXHQgKiAgICAgICAgICAgICAgICAgICAgRXh0ZXJuYWwgLSBUaGUgY3JlYXRpb24gaXMgZG9uZSBpbiBhIGRpZmZlcmVudCBhcHBsaWNhdGlvbiBzcGVjaWZpZWQgdmlhIHRoZSBwYXJhbWV0ZXIgJ291dGJvdW5kJ1xuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5vdXRib3VuZCBUaGUgbmF2aWdhdGlvbiB0YXJnZXQgd2hlcmUgdGhlIGRvY3VtZW50IGlzIGNyZWF0ZWQgaW4gY2FzZSBvZiBjcmVhdGlvbk1vZGUgJ0V4dGVybmFsJ1xuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5jcmVhdGVBdEVuZCBTcGVjaWZpZXMgaWYgdGhlIG5ldyBlbnRyeSBzaG91bGQgYmUgY3JlYXRlZCBhdCB0aGUgdG9wIG9yIGJvdHRvbSBvZiBhIHRhYmxlIGluIGNhc2Ugb2YgY3JlYXRpb25Nb2RlICdJbmxpbmUnXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgb25jZSB0aGUgb2JqZWN0IGhhcyBiZWVuIGNyZWF0ZWRcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I2NyZWF0ZURvY3VtZW50XG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIGNyZWF0ZURvY3VtZW50KFxuXHRcdHZMaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyB8IHN0cmluZyxcblx0XHRtSW5QYXJhbWV0ZXJzOiB7XG5cdFx0XHRjcmVhdGlvbk1vZGU6IHN0cmluZztcblx0XHRcdG91dGJvdW5kPzogc3RyaW5nO1xuXHRcdFx0Y3JlYXRlQXRFbmQ/OiBib29sZWFuO1xuXHRcdH1cblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgdHJhbnNhY3Rpb25IZWxwZXIgPSB0aGlzLl9nZXRUcmFuc2FjdGlvbkhlbHBlcigpLFxuXHRcdFx0b0xvY2tPYmplY3QgPSB0aGlzLl9nZXRHbG9iYWxVSU1vZGVsKCk7XG5cdFx0bGV0IG9UYWJsZTogYW55OyAvL3Nob3VsZCBiZSBUYWJsZSBidXQgdGhlcmUgYXJlIG1pc3NpbmcgbWV0aG9kcyBpbnRvIHRoZSBkZWZcblx0XHRsZXQgbVBhcmFtZXRlcnM6IGFueSA9IG1JblBhcmFtZXRlcnM7XG5cdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gdGhpcy5fZ2V0UmVzb3VyY2VCdW5kbGUoKTtcblx0XHRjb25zdCBiU2hvdWxkQnVzeUxvY2sgPVxuXHRcdFx0IW1QYXJhbWV0ZXJzIHx8XG5cdFx0XHQobVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlICE9PSBDcmVhdGlvbk1vZGUuSW5saW5lICYmXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93ICYmXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLkV4dGVybmFsKTtcblx0XHRsZXQgb0V4ZWNDdXN0b21WYWxpZGF0aW9uID0gUHJvbWlzZS5yZXNvbHZlKFtdKTtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuZ2V0VmlldygpKTtcblx0XHRvQXBwQ29tcG9uZW50LmdldFJvdXRlclByb3h5KCkucmVtb3ZlSUFwcFN0YXRlS2V5KCk7XG5cblx0XHRpZiAobVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuRXh0ZXJuYWwpIHtcblx0XHRcdC8vIENyZWF0ZSBieSBuYXZpZ2F0aW5nIHRvIGFuIGV4dGVybmFsIHRhcmdldFxuXHRcdFx0Ly8gVE9ETzogQ2FsbCBhcHByb3ByaWF0ZSBmdW5jdGlvbiAoY3VycmVudGx5IHVzaW5nIHRoZSBzYW1lIGFzIGZvciBvdXRib3VuZCBjaGV2cm9uIG5hdiwgYW5kIHdpdGhvdXQgYW55IGNvbnRleHQgLSAzcmQgcGFyYW0pXG5cdFx0XHRhd2FpdCB0aGlzLl9zeW5jVGFzaygpO1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSB0aGlzLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCk7XG5cdFx0XHRjb25zdCBzQ3JlYXRlUGF0aCA9IE1vZGVsSGVscGVyLmdldEFic29sdXRlTWV0YVBhdGhGb3JMaXN0QmluZGluZyh0aGlzLmdldFZpZXcoKSwgdkxpc3RCaW5kaW5nKTtcblxuXHRcdFx0KG9Db250cm9sbGVyIGFzIGFueSkuaGFuZGxlcnMub25DaGV2cm9uUHJlc3NOYXZpZ2F0ZU91dEJvdW5kKG9Db250cm9sbGVyLCBtUGFyYW1ldGVycy5vdXRib3VuZCwgdW5kZWZpbmVkLCBzQ3JlYXRlUGF0aCk7XG5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAobVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuQ3JlYXRpb25Sb3cgJiYgbVBhcmFtZXRlcnMuY3JlYXRpb25Sb3cpIHtcblx0XHRcdGNvbnN0IG9DcmVhdGlvblJvd09iamVjdHMgPSBtUGFyYW1ldGVycy5jcmVhdGlvblJvdy5nZXRCaW5kaW5nQ29udGV4dCgpLmdldE9iamVjdCgpO1xuXHRcdFx0ZGVsZXRlIG9DcmVhdGlvblJvd09iamVjdHNbXCJAJHVpNS5jb250ZXh0LmlzVHJhbnNpZW50XCJdO1xuXHRcdFx0b1RhYmxlID0gbVBhcmFtZXRlcnMuY3JlYXRpb25Sb3cuZ2V0UGFyZW50KCk7XG5cdFx0XHRvRXhlY0N1c3RvbVZhbGlkYXRpb24gPSB0cmFuc2FjdGlvbkhlbHBlci52YWxpZGF0ZURvY3VtZW50KFxuXHRcdFx0XHRvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoKSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGRhdGE6IG9DcmVhdGlvblJvd09iamVjdHMsXG5cdFx0XHRcdFx0Y3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uOiBvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKS5kYXRhKFwiY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uXCIpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRoaXMuYmFzZS5nZXRWaWV3KClcblx0XHRcdCk7XG5cblx0XHRcdC8vIGRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGEgaXMgc2V0IHRvIGZhbHNlIGluIG1hbmlmZXN0IGNvbnZlcnRlciAoVGFibGUudHMpIGlmIGN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbiBleGlzdHNcblx0XHRcdGlmIChvVGFibGUuZ2V0Q3JlYXRpb25Sb3coKS5kYXRhKFwiZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YVwiKSA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImNyZWF0aW9uUm93RmllbGRWYWxpZGl0eVwiLCB7fSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLklubGluZSAmJiBtUGFyYW1ldGVycy50YWJsZUlkKSB7XG5cdFx0XHRvVGFibGUgPSB0aGlzLmdldFZpZXcoKS5ieUlkKG1QYXJhbWV0ZXJzLnRhYmxlSWQpIGFzIFRhYmxlO1xuXHRcdH1cblxuXHRcdGlmIChvVGFibGUgJiYgb1RhYmxlLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdGNvbnN0IGZuRm9jdXNPclNjcm9sbCA9XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLklubGluZSA/IG9UYWJsZS5mb2N1c1Jvdy5iaW5kKG9UYWJsZSkgOiBvVGFibGUuc2Nyb2xsVG9JbmRleC5iaW5kKG9UYWJsZSk7XG5cdFx0XHRvVGFibGUuZ2V0Um93QmluZGluZygpLmF0dGFjaEV2ZW50T25jZShcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGZuRm9jdXNPclNjcm9sbChtUGFyYW1ldGVycy5jcmVhdGVBdEVuZCA/IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkuZ2V0TGVuZ3RoKCkgOiAwLCB0cnVlKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGNvbnN0IGhhbmRsZVNpZGVFZmZlY3RzID0gYXN5bmMgKG9MaXN0QmluZGluZzogYW55LCBvQ3JlYXRpb25Qcm9taXNlOiBQcm9taXNlPENvbnRleHQ+KSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBvTmV3Q29udGV4dCA9IGF3YWl0IG9DcmVhdGlvblByb21pc2U7XG5cdFx0XHRcdC8vIHRyYW5zaWVudCBjb250ZXh0cyBhcmUgcmVsaWFibHkgcmVtb3ZlZCBvbmNlIG9OZXdDb250ZXh0LmNyZWF0ZWQoKSBpcyByZXNvbHZlZFxuXHRcdFx0XHRhd2FpdCBvTmV3Q29udGV4dC5jcmVhdGVkKCk7XG5cdFx0XHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRcdFx0Ly8gaWYgdGhlcmUgYXJlIHRyYW5zaWVudCBjb250ZXh0cywgd2UgbXVzdCBhdm9pZCByZXF1ZXN0aW5nIHNpZGUgZWZmZWN0c1xuXHRcdFx0XHQvLyB0aGlzIGlzIGF2b2lkIGEgcG90ZW50aWFsIGxpc3QgcmVmcmVzaCwgdGhlcmUgY291bGQgYmUgYSBzaWRlIGVmZmVjdCB0aGF0IHJlZnJlc2hlcyB0aGUgbGlzdCBiaW5kaW5nXG5cdFx0XHRcdC8vIGlmIGxpc3QgYmluZGluZyBpcyByZWZyZXNoZWQsIHRyYW5zaWVudCBjb250ZXh0cyBtaWdodCBiZSBsb3N0XG5cdFx0XHRcdGlmICghQ29tbW9uVXRpbHMuaGFzVHJhbnNpZW50Q29udGV4dChvTGlzdEJpbmRpbmcpKSB7XG5cdFx0XHRcdFx0Y29uc3QgYXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuZ2V0VmlldygpKTtcblx0XHRcdFx0XHRhcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCkucmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5KG9MaXN0QmluZGluZy5nZXRQYXRoKCksIG9CaW5kaW5nQ29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGNyZWF0aW5nIHRoZSBkb2N1bWVudFwiLCBvRXJyb3IpO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBAcGFyYW0gYVZhbGlkYXRpb25NZXNzYWdlcyBFcnJvciBtZXNzYWdlcyBmcm9tIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uXG5cdFx0ICovXG5cdFx0Y29uc3QgY3JlYXRlQ3VzdG9tVmFsaWRhdGlvbk1lc3NhZ2VzID0gKGFWYWxpZGF0aW9uTWVzc2FnZXM6IGFueVtdKSA9PiB7XG5cdFx0XHRjb25zdCBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uID0gb1RhYmxlICYmIG9UYWJsZS5nZXRDcmVhdGlvblJvdygpLmRhdGEoXCJjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb25cIik7XG5cdFx0XHRjb25zdCBtQ3VzdG9tVmFsaWRpdHkgPSBvVGFibGUgJiYgb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik/LmdldFByb3BlcnR5KFwiY3JlYXRpb25Sb3dDdXN0b21WYWxpZGl0eVwiKTtcblx0XHRcdGNvbnN0IG9NZXNzYWdlTWFuYWdlciA9IENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKTtcblx0XHRcdGNvbnN0IGFDdXN0b21NZXNzYWdlczogYW55W10gPSBbXTtcblx0XHRcdGxldCBvRmllbGRDb250cm9sO1xuXHRcdFx0bGV0IHNUYXJnZXQ6IHN0cmluZztcblxuXHRcdFx0Ly8gUmVtb3ZlIGV4aXN0aW5nIEN1c3RvbVZhbGlkYXRpb24gbWVzc2FnZVxuXHRcdFx0b01lc3NhZ2VNYW5hZ2VyXG5cdFx0XHRcdC5nZXRNZXNzYWdlTW9kZWwoKVxuXHRcdFx0XHQuZ2V0RGF0YSgpXG5cdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChvTWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdFx0aWYgKG9NZXNzYWdlLmNvZGUgPT09IHNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdG9NZXNzYWdlTWFuYWdlci5yZW1vdmVNZXNzYWdlcyhvTWVzc2FnZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblxuXHRcdFx0YVZhbGlkYXRpb25NZXNzYWdlcy5mb3JFYWNoKChvVmFsaWRhdGlvbk1lc3NhZ2U6IGFueSkgPT4ge1xuXHRcdFx0XHQvLyBIYW5kbGUgQm91bmQgQ3VzdG9tVmFsaWRhdGlvbiBtZXNzYWdlXG5cdFx0XHRcdGlmIChvVmFsaWRhdGlvbk1lc3NhZ2UubWVzc2FnZVRhcmdldCkge1xuXHRcdFx0XHRcdG9GaWVsZENvbnRyb2wgPSBDb3JlLmdldENvbnRyb2wobUN1c3RvbVZhbGlkaXR5W29WYWxpZGF0aW9uTWVzc2FnZS5tZXNzYWdlVGFyZ2V0XS5maWVsZElkKSBhcyBDb250cm9sO1xuXHRcdFx0XHRcdHNUYXJnZXQgPSBgJHtvRmllbGRDb250cm9sLmdldEJpbmRpbmdDb250ZXh0KCk/LmdldFBhdGgoKX0vJHtvRmllbGRDb250cm9sLmdldEJpbmRpbmdQYXRoKFwidmFsdWVcIil9YDtcblx0XHRcdFx0XHQvLyBBZGQgdmFsaWRhdGlvbiBtZXNzYWdlIGlmIHN0aWxsIG5vdCBleGlzdHNcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRvTWVzc2FnZU1hbmFnZXJcblx0XHRcdFx0XHRcdFx0LmdldE1lc3NhZ2VNb2RlbCgpXG5cdFx0XHRcdFx0XHRcdC5nZXREYXRhKClcblx0XHRcdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAob01lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvTWVzc2FnZS50YXJnZXQgPT09IHNUYXJnZXQ7XG5cdFx0XHRcdFx0XHRcdH0pLmxlbmd0aCA9PT0gMFxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0b01lc3NhZ2VNYW5hZ2VyLmFkZE1lc3NhZ2VzKFxuXHRcdFx0XHRcdFx0XHRuZXcgTWVzc2FnZSh7XG5cdFx0XHRcdFx0XHRcdFx0bWVzc2FnZTogb1ZhbGlkYXRpb25NZXNzYWdlLm1lc3NhZ2VUZXh0LFxuXHRcdFx0XHRcdFx0XHRcdHByb2Nlc3NvcjogdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRcdFx0XHR0eXBlOiBNZXNzYWdlVHlwZS5FcnJvcixcblx0XHRcdFx0XHRcdFx0XHRjb2RlOiBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLFxuXHRcdFx0XHRcdFx0XHRcdHRlY2huaWNhbDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0cGVyc2lzdGVudDogZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0dGFyZ2V0OiBzVGFyZ2V0XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBBZGQgY29udHJvbElkIGluIG9yZGVyIHRvIGdldCB0aGUgZm9jdXMgaGFuZGxpbmcgb2YgdGhlIGVycm9yIHBvcG92ZXIgcnVuYWJsZVxuXHRcdFx0XHRcdGNvbnN0IGFFeGlzdGluZ1ZhbGlkYXRpb25NZXNzYWdlcyA9IG9NZXNzYWdlTWFuYWdlclxuXHRcdFx0XHRcdFx0LmdldE1lc3NhZ2VNb2RlbCgpXG5cdFx0XHRcdFx0XHQuZ2V0RGF0YSgpXG5cdFx0XHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChvTWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBvTWVzc2FnZS50YXJnZXQgPT09IHNUYXJnZXQ7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRhRXhpc3RpbmdWYWxpZGF0aW9uTWVzc2FnZXNbMF0uYWRkQ29udHJvbElkKG1DdXN0b21WYWxpZGl0eVtvVmFsaWRhdGlvbk1lc3NhZ2UubWVzc2FnZVRhcmdldF0uZmllbGRJZCk7XG5cblx0XHRcdFx0XHQvLyBIYW5kbGUgVW5ib3VuZCBDdXN0b21WYWxpZGF0aW9uIG1lc3NhZ2Vcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRhQ3VzdG9tTWVzc2FnZXMucHVzaCh7XG5cdFx0XHRcdFx0XHRjb2RlOiBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uLFxuXHRcdFx0XHRcdFx0dGV4dDogb1ZhbGlkYXRpb25NZXNzYWdlLm1lc3NhZ2VUZXh0LFxuXHRcdFx0XHRcdFx0cGVyc2lzdGVudDogdHJ1ZSxcblx0XHRcdFx0XHRcdHR5cGU6IE1lc3NhZ2VUeXBlLkVycm9yXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXG5cdFx0XHRpZiAoYUN1c3RvbU1lc3NhZ2VzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZURpYWxvZyh7XG5cdFx0XHRcdFx0Y3VzdG9tTWVzc2FnZXM6IGFDdXN0b21NZXNzYWdlc1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3QgcmVzb2x2ZUNyZWF0aW9uTW9kZSA9IChcblx0XHRcdGluaXRpYWxDcmVhdGlvbk1vZGU6IHN0cmluZyxcblx0XHRcdHByb2dyYW1taW5nTW9kZWw6IHN0cmluZyxcblx0XHRcdG9MaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHRcdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsXG5cdFx0KTogc3RyaW5nID0+IHtcblx0XHRcdGlmIChpbml0aWFsQ3JlYXRpb25Nb2RlICYmIGluaXRpYWxDcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5OZXdQYWdlKSB7XG5cdFx0XHRcdC8vIHVzZSB0aGUgcGFzc2VkIGNyZWF0aW9uIG1vZGVcblx0XHRcdFx0cmV0dXJuIGluaXRpYWxDcmVhdGlvbk1vZGU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBOZXdBY3Rpb24gaXMgbm90IHlldCBzdXBwb3J0ZWQgZm9yIE5hdmlnYXRpb25Qcm9wZXJ0eSBjb2xsZWN0aW9uXG5cdFx0XHRcdGlmICghb0xpc3RCaW5kaW5nLmlzUmVsYXRpdmUoKSkge1xuXHRcdFx0XHRcdGNvbnN0IHNQYXRoID0gb0xpc3RCaW5kaW5nLmdldFBhdGgoKSxcblx0XHRcdFx0XHRcdC8vIGlmIE5ld0FjdGlvbiB3aXRoIHBhcmFtZXRlcnMgaXMgcHJlc2VudCwgdGhlbiBjcmVhdGlvbiBpcyAnRGVmZXJyZWQnXG5cdFx0XHRcdFx0XHQvLyBpbiB0aGUgYWJzZW5jZSBvZiBOZXdBY3Rpb24gb3IgTmV3QWN0aW9uIHdpdGggcGFyYW1ldGVycywgY3JlYXRpb24gaXMgYXN5bmNcblx0XHRcdFx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRcdFx0XHRwcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0XG5cdFx0XHRcdFx0XHRcdFx0PyBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdC9OZXdBY3Rpb25gKVxuXHRcdFx0XHRcdFx0XHRcdDogb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZC9OZXdBY3Rpb25gKTtcblx0XHRcdFx0XHRpZiAoc05ld0FjdGlvbikge1xuXHRcdFx0XHRcdFx0Y29uc3QgYVBhcmFtZXRlcnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7c05ld0FjdGlvbn0vQCR1aTUub3ZlcmxvYWQvMC8kUGFyYW1ldGVyYCkgfHwgW107XG5cdFx0XHRcdFx0XHQvLyBiaW5kaW5nIHBhcmFtZXRlciAoZWc6IF9pdCkgaXMgbm90IGNvbnNpZGVyZWRcblx0XHRcdFx0XHRcdGlmIChhUGFyYW1ldGVycy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBDcmVhdGlvbk1vZGUuRGVmZXJyZWQ7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0xpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKS5nZXRQYXRoKCkpO1xuXHRcdFx0XHRjb25zdCBhTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzID0gQ29tbW9uVXRpbHMuZ2V0Tm9uQ29tcHV0ZWRWaXNpYmxlRmllbGRzKG9NZXRhTW9kZWwsIHNNZXRhUGF0aCwgdGhpcy5nZXRWaWV3KCkpO1xuXHRcdFx0XHRpZiAoYU5vbkNvbXB1dGVkVmlzaWJsZUtleUZpZWxkcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0cmV0dXJuIENyZWF0aW9uTW9kZS5EZWZlcnJlZDtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gQ3JlYXRpb25Nb2RlLkFzeW5jO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRpZiAoYlNob3VsZEJ1c3lMb2NrKSB7XG5cdFx0XHRCdXN5TG9ja2VyLmxvY2sob0xvY2tPYmplY3QpO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgYVZhbGlkYXRpb25NZXNzYWdlcyA9IGF3YWl0IHRoaXMuX3N5bmNUYXNrKG9FeGVjQ3VzdG9tVmFsaWRhdGlvbik7XG5cdFx0XHRpZiAoYVZhbGlkYXRpb25NZXNzYWdlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNyZWF0ZUN1c3RvbVZhbGlkYXRpb25NZXNzYWdlcyhhVmFsaWRhdGlvbk1lc3NhZ2VzKTtcblx0XHRcdFx0TG9nLmVycm9yKFwiQ3VzdG9tIFZhbGlkYXRpb24gZmFpbGVkXCIpO1xuXHRcdFx0XHQvLyBpZiBjdXN0b20gdmFsaWRhdGlvbiBmYWlscywgd2UgbGVhdmUgdGhlIG1ldGhvZCBpbW1lZGlhdGVseVxuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cblx0XHRcdGxldCBvTGlzdEJpbmRpbmc6IGFueTtcblx0XHRcdG1QYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMgfHwge307XG5cblx0XHRcdGlmICh2TGlzdEJpbmRpbmcgJiYgdHlwZW9mIHZMaXN0QmluZGluZyA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHQvLyB3ZSBhbHJlYWR5IGdldCBhIGxpc3QgYmluZGluZyB1c2UgdGhpcyBvbmVcblx0XHRcdFx0b0xpc3RCaW5kaW5nID0gdkxpc3RCaW5kaW5nO1xuXHRcdFx0fSBlbHNlIGlmICh0eXBlb2Ygdkxpc3RCaW5kaW5nID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdG9MaXN0QmluZGluZyA9IG5ldyAoT0RhdGFMaXN0QmluZGluZyBhcyBhbnkpKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCksIHZMaXN0QmluZGluZyk7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSA9IENyZWF0aW9uTW9kZS5TeW5jO1xuXHRcdFx0XHRkZWxldGUgbVBhcmFtZXRlcnMuY3JlYXRlQXRFbmQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJCaW5kaW5nIG9iamVjdCBvciBwYXRoIGV4cGVjdGVkXCIpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBvTW9kZWwgPSBvTGlzdEJpbmRpbmcuZ2V0TW9kZWwoKTtcblx0XHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsOiBzdHJpbmcgPSB0aGlzLl9nZXRQcm9ncmFtbWluZ01vZGVsKG9MaXN0QmluZGluZyk7XG5cdFx0XHRjb25zdCByZXNvbHZlZENyZWF0aW9uTW9kZSA9IHJlc29sdmVDcmVhdGlvbk1vZGUoXG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNyZWF0aW9uTW9kZSxcblx0XHRcdFx0c1Byb2dyYW1taW5nTW9kZWwsXG5cdFx0XHRcdG9MaXN0QmluZGluZyxcblx0XHRcdFx0b01vZGVsLmdldE1ldGFNb2RlbCgpXG5cdFx0XHQpO1xuXG5cdFx0XHRsZXQgb0NyZWF0aW9uOiBhbnk7XG5cdFx0XHRsZXQgbUFyZ3M6IGFueTtcblx0XHRcdGNvbnN0IG9DcmVhdGlvblJvdyA9IG1QYXJhbWV0ZXJzLmNyZWF0aW9uUm93O1xuXHRcdFx0bGV0IG9DcmVhdGlvblJvd0NvbnRleHQ6IGFueTtcblx0XHRcdGxldCBvUGF5bG9hZDogYW55O1xuXHRcdFx0bGV0IHNNZXRhUGF0aDogc3RyaW5nO1xuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGNvbnN0IG9Sb3V0aW5nTGlzdGVuZXIgPSB0aGlzLl9nZXRSb3V0aW5nTGlzdGVuZXIoKTtcblxuXHRcdFx0aWYgKHJlc29sdmVkQ3JlYXRpb25Nb2RlICE9PSBDcmVhdGlvbk1vZGUuRGVmZXJyZWQpIHtcblx0XHRcdFx0aWYgKHJlc29sdmVkQ3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuQ3JlYXRpb25Sb3cpIHtcblx0XHRcdFx0XHRvQ3JlYXRpb25Sb3dDb250ZXh0ID0gb0NyZWF0aW9uUm93LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0XHRcdFx0c01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChvQ3JlYXRpb25Sb3dDb250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRcdFx0Ly8gcHJlZmlsbCBkYXRhIGZyb20gY3JlYXRpb24gcm93XG5cdFx0XHRcdFx0b1BheWxvYWQgPSBvQ3JlYXRpb25Sb3dDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmRhdGEgPSB7fTtcblx0XHRcdFx0XHRPYmplY3Qua2V5cyhvUGF5bG9hZCkuZm9yRWFjaChmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvUHJvcGVydHkgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9LyR7c1Byb3BlcnR5UGF0aH1gKTtcblx0XHRcdFx0XHRcdC8vIGVuc3VyZSBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgYXJlIG5vdCBwYXJ0IG9mIHRoZSBwYXlsb2FkLCBkZWVwIGNyZWF0ZSBub3Qgc3VwcG9ydGVkXG5cdFx0XHRcdFx0XHRpZiAob1Byb3BlcnR5ICYmIG9Qcm9wZXJ0eS4ka2luZCA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5kYXRhW3NQcm9wZXJ0eVBhdGhdID0gb1BheWxvYWRbc1Byb3BlcnR5UGF0aF07XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5fY2hlY2tGb3JWYWxpZGF0aW9uRXJyb3JzKC8qb0NyZWF0aW9uUm93Q29udGV4dCovKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmVzb2x2ZWRDcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdyB8fCByZXNvbHZlZENyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLklubGluZSkge1xuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQgPSBmYWxzZTsgLy8gY3VycmVudGx5IG5vdCBmdWxseSBzdXBwb3J0ZWRcblx0XHRcdFx0XHQvLyBidXN5IGhhbmRsaW5nIHNoYWxsIGJlIGRvbmUgbG9jYWxseSBvbmx5XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuYnVzeU1vZGUgPSBcIkxvY2FsXCI7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuYnVzeUlkID0gb1RhYmxlPy5nZXRQYXJlbnQoKT8uZ2V0VGFibGVEZWZpbml0aW9uKCk/LmFubm90YXRpb24uaWQ7XG5cblx0XHRcdFx0XHQvLyB0YWtlIGNhcmUgb24gbWVzc2FnZSBoYW5kbGluZywgZHJhZnQgaW5kaWNhdG9yIChpbiBjYXNlIG9mIGRyYWZ0KVxuXHRcdFx0XHRcdC8vIEF0dGFjaCB0aGUgY3JlYXRlIHNlbnQgYW5kIGNyZWF0ZSBjb21wbGV0ZWQgZXZlbnQgdG8gdGhlIG9iamVjdCBwYWdlIGJpbmRpbmcgc28gdGhhdCB3ZSBjYW4gcmVhY3Rcblx0XHRcdFx0XHR0aGlzLl9oYW5kbGVDcmVhdGVFdmVudHMob0xpc3RCaW5kaW5nKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmICghbVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCkge1xuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wgPSB0aGlzLmdldFZpZXcoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRtUGFyYW1ldGVycy5iZWZvcmVDcmVhdGVDYWxsQmFjayA9IHRoaXMuYmFzZS5lZGl0Rmxvdy5vbkJlZm9yZUNyZWF0ZTtcblxuXHRcdFx0XHQvLyBJbiBjYXNlIHRoZSBhcHBsaWNhdGlvbiB3YXMgY2FsbGVkIHdpdGggcHJlZmVycmVkTW9kZT1hdXRvQ3JlYXRlV2l0aCwgd2Ugd2FudCB0byBza2lwIHRoZVxuXHRcdFx0XHQvLyBhY3Rpb24gcGFyYW1ldGVyIGRpYWxvZ1xuXHRcdFx0XHRtUGFyYW1ldGVycy5za2lwUGFyYW1ldGVyRGlhbG9nID0gb0FwcENvbXBvbmVudC5nZXRTdGFydHVwTW9kZSgpID09PSBTdGFydHVwTW9kZS5BdXRvQ3JlYXRlO1xuXG5cdFx0XHRcdG9DcmVhdGlvbiA9IHRyYW5zYWN0aW9uSGVscGVyLmNyZWF0ZURvY3VtZW50KFxuXHRcdFx0XHRcdG9MaXN0QmluZGluZyxcblx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0dGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKSxcblx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHR0aGlzLmdldFZpZXcoKVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRsZXQgb05hdmlnYXRpb247XG5cdFx0XHRzd2l0Y2ggKHJlc29sdmVkQ3JlYXRpb25Nb2RlKSB7XG5cdFx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLkRlZmVycmVkOlxuXHRcdFx0XHRcdG9OYXZpZ2F0aW9uID0gb1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQob0xpc3RCaW5kaW5nLCB7XG5cdFx0XHRcdFx0XHRiRGVmZXJyZWRDb250ZXh0OiB0cnVlLFxuXHRcdFx0XHRcdFx0ZWRpdGFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHRiRm9yY2VGb2N1czogdHJ1ZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5Bc3luYzpcblx0XHRcdFx0XHRvTmF2aWdhdGlvbiA9IG9Sb3V0aW5nTGlzdGVuZXIubmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0KG9MaXN0QmluZGluZywge1xuXHRcdFx0XHRcdFx0YXN5bmNDb250ZXh0OiBvQ3JlYXRpb24sXG5cdFx0XHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdGJGb3JjZUZvY3VzOiB0cnVlXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLlN5bmM6XG5cdFx0XHRcdFx0bUFyZ3MgPSB7XG5cdFx0XHRcdFx0XHRlZGl0YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRcdGJGb3JjZUZvY3VzOiB0cnVlXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kgfHwgbVBhcmFtZXRlcnMuY3JlYXRlQWN0aW9uKSB7XG5cdFx0XHRcdFx0XHRtQXJncy50cmFuc2llbnQgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRvTmF2aWdhdGlvbiA9IG9DcmVhdGlvbi50aGVuKGZ1bmN0aW9uIChvTmV3RG9jdW1lbnRDb250ZXh0OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmICghb05ld0RvY3VtZW50Q29udGV4dCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjb3JlUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZVRvTWVzc2FnZVBhZ2UoXG5cdFx0XHRcdFx0XHRcdFx0Y29yZVJlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9EQVRBX1JFQ0VJVkVEX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdHRpdGxlOiBjb3JlUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IGNvcmVSZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19FRElURkxPV19TQVBGRV9DUkVBVElPTl9GQUlMRURfREVTQ1JJUFRJT05cIilcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvLyBJbiBjYXNlIHRoZSBTeW5jIGNyZWF0aW9uIHdhcyB0cmlnZ2VyZWQgZm9yIGEgZGVmZXJyZWQgY3JlYXRpb24sIHdlIGRvbid0IG5hdmlnYXRlIGZvcndhcmRcblx0XHRcdFx0XHRcdFx0Ly8gYXMgd2UncmUgYWxyZWFkeSBvbiB0aGUgY29ycmVzcG9uZGluZyBPYmplY3RQYWdlXG5cdFx0XHRcdFx0XHRcdHJldHVybiBtUGFyYW1ldGVycy5iRnJvbURlZmVycmVkXG5cdFx0XHRcdFx0XHRcdFx0PyBvUm91dGluZ0xpc3RlbmVyLm5hdmlnYXRlVG9Db250ZXh0KG9OZXdEb2N1bWVudENvbnRleHQsIG1BcmdzKVxuXHRcdFx0XHRcdFx0XHRcdDogb1JvdXRpbmdMaXN0ZW5lci5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQob05ld0RvY3VtZW50Q29udGV4dCwgbUFyZ3MpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5JbmxpbmU6XG5cdFx0XHRcdFx0aGFuZGxlU2lkZUVmZmVjdHMob0xpc3RCaW5kaW5nLCBvQ3JlYXRpb24pO1xuXHRcdFx0XHRcdHRoaXMuX3N5bmNUYXNrKG9DcmVhdGlvbik7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93OlxuXHRcdFx0XHRcdC8vIHRoZSBjcmVhdGlvbiByb3cgc2hhbGwgYmUgY2xlYXJlZCBvbmNlIHRoZSB2YWxpZGF0aW9uIGNoZWNrIHdhcyBzdWNjZXNzZnVsIGFuZFxuXHRcdFx0XHRcdC8vIHRoZXJlZm9yZSB0aGUgUE9TVCBjYW4gYmUgc2VudCBhc3luYyB0byB0aGUgYmFja2VuZFxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvQ3JlYXRpb25Sb3dMaXN0QmluZGluZyA9IG9DcmVhdGlvblJvd0NvbnRleHQuZ2V0QmluZGluZygpO1xuXG5cdFx0XHRcdFx0XHRpZiAoIW1QYXJhbWV0ZXJzLmJTa2lwU2lkZUVmZmVjdHMpIHtcblx0XHRcdFx0XHRcdFx0aGFuZGxlU2lkZUVmZmVjdHMob0xpc3RCaW5kaW5nLCBvQ3JlYXRpb24pO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRjb25zdCBvTmV3VHJhbnNpZW50Q29udGV4dCA9IG9DcmVhdGlvblJvd0xpc3RCaW5kaW5nLmNyZWF0ZSgpO1xuXHRcdFx0XHRcdFx0b0NyZWF0aW9uUm93LnNldEJpbmRpbmdDb250ZXh0KG9OZXdUcmFuc2llbnRDb250ZXh0KTtcblxuXHRcdFx0XHRcdFx0Ly8gdGhpcyBpcyBuZWVkZWQgdG8gYXZvaWQgY29uc29sZSBlcnJvcnMgVE8gYmUgY2hlY2tlZCB3aXRoIG1vZGVsIGNvbGxlYWd1ZXNcblx0XHRcdFx0XHRcdG9OZXdUcmFuc2llbnRDb250ZXh0LmNyZWF0ZWQoKS5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdExvZy50cmFjZShcInRyYW5zaWVudCBmYXN0IGNyZWF0aW9uIGNvbnRleHQgZGVsZXRlZFwiKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0b05hdmlnYXRpb24gPSBvQ3JlYXRpb25Sb3dDb250ZXh0LmRlbGV0ZShcIiRkaXJlY3RcIik7XG5cdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdC8vIFJlc2V0IGJ1c3kgaW5kaWNhdG9yIGFmdGVyIGEgdmFsaWRhdGlvbiBlcnJvclxuXHRcdFx0XHRcdFx0aWYgKEJ1c3lMb2NrZXIuaXNMb2NrZWQodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKSkpIHtcblx0XHRcdFx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sodGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJDcmVhdGlvblJvdyBuYXZpZ2F0aW9uIGVycm9yOiBcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0b05hdmlnYXRpb24gPSBQcm9taXNlLnJlamVjdChgVW5oYW5kbGVkIGNyZWF0aW9uTW9kZSAke3Jlc29sdmVkQ3JlYXRpb25Nb2RlfWApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBiSXNOZXdQYWdlQ3JlYXRpb24gPVxuXHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdyAmJiBtUGFyYW1ldGVycy5jcmVhdGlvbk1vZGUgIT09IENyZWF0aW9uTW9kZS5JbmxpbmU7XG5cdFx0XHRpZiAob0NyZWF0aW9uKSB7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3QgYVBhcmFtcyA9IGF3YWl0IFByb21pc2UuYWxsKFtvQ3JlYXRpb24sIG9OYXZpZ2F0aW9uXSk7XG5cdFx0XHRcdFx0dGhpcy5fc2V0U3RpY2t5U2Vzc2lvbkludGVybmFsUHJvcGVydGllcyhzUHJvZ3JhbW1pbmdNb2RlbCwgb01vZGVsKTtcblxuXHRcdFx0XHRcdGlmIChiSXNOZXdQYWdlQ3JlYXRpb24pIHtcblx0XHRcdFx0XHRcdHRoaXMuX3NldEVkaXRNb2RlKEVkaXRNb2RlLkVkaXRhYmxlLCBiSXNOZXdQYWdlQ3JlYXRpb24pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0aGlzLl9zZXRFZGl0TW9kZShFZGl0TW9kZS5FZGl0YWJsZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IG9OZXdEb2N1bWVudENvbnRleHQgPSBhUGFyYW1zWzBdO1xuXHRcdFx0XHRcdGlmIChvTmV3RG9jdW1lbnRDb250ZXh0KSB7XG5cdFx0XHRcdFx0XHRpZiAoIXRoaXMuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0dGhpcy5fc2VuZEFjdGl2aXR5KEFjdGl2aXR5LkNyZWF0ZSwgb05ld0RvY3VtZW50Q29udGV4dCk7XG5cdFx0XHRcdFx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuX2hhbmRsZVN0aWNreU9uKG9OZXdEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChNb2RlbEhlbHBlci5pc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZChvTW9kZWwuZ2V0TWV0YU1vZGVsKCkpKSB7XG5cdFx0XHRcdFx0XHRcdC8vIGFjY29yZGluZyB0byBVWCBpbiBjYXNlIG9mIGVuYWJsZWQgY29sbGFib3JhdGlvbiBkcmFmdCB3ZSBzaGFyZSB0aGUgb2JqZWN0IGltbWVkaWF0ZWx5XG5cdFx0XHRcdFx0XHRcdGF3YWl0IHNoYXJlT2JqZWN0KG9OZXdEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBjYXRjaCAoZXJyb3I6IHVua25vd24pIHtcblx0XHRcdFx0XHQvLyBUT0RPOiBjdXJyZW50bHksIHRoZSBvbmx5IGVycm9ycyBoYW5kbGVkIGhlcmUgYXJlIHJhaXNlZCBhcyBzdHJpbmcgLSBzaG91bGQgYmUgY2hhbmdlZCB0byBFcnJvciBvYmplY3RzXG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0ZXJyb3IgPT09IENvbnN0YW50cy5DYW5jZWxBY3Rpb25EaWFsb2cgfHxcblx0XHRcdFx0XHRcdGVycm9yID09PSBDb25zdGFudHMuQWN0aW9uRXhlY3V0aW9uRmFpbGVkIHx8XG5cdFx0XHRcdFx0XHRlcnJvciA9PT0gQ29uc3RhbnRzLkNyZWF0aW9uRmFpbGVkXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHQvLyBjcmVhdGlvbiBoYXMgYmVlbiBjYW5jZWxsZWQgYnkgdXNlciBvciBmYWlsZWQgaW4gYmFja2VuZCA9PiBpbiBjYXNlIHdlIGhhdmUgbmF2aWdhdGVkIHRvIHRyYW5zaWVudCBjb250ZXh0IGJlZm9yZSwgbmF2aWdhdGUgYmFja1xuXHRcdFx0XHRcdFx0Ly8gdGhlIHN3aXRjaC1zdGF0ZW1lbnQgYWJvdmUgc2VlbXMgdG8gaW5kaWNhdGUgdGhhdCB0aGlzIGhhcHBlbnMgaW4gY3JlYXRpb25Nb2RlcyBkZWZlcnJlZCBhbmQgYXN5bmMuIEJ1dCBpbiBmYWN0LCBpbiB0aGVzZSBjYXNlcyBhZnRlciB0aGUgbmF2aWdhdGlvbiBmcm9tIHJvdXRlTWF0Y2hlZCBpbiBPUCBjb21wb25lbnRcblx0XHRcdFx0XHRcdC8vIGNyZWF0ZURlZmVycmVkQ29udGV4dCBpcyB0cmlnZ2VyZCwgd2hpY2ggY2FsbHMgdGhpcyBtZXRob2QgKGNyZWF0ZURvY3VtZW50KSBhZ2FpbiAtIHRoaXMgdGltZSB3aXRoIGNyZWF0aW9uTW9kZSBzeW5jLiBUaGVyZWZvcmUsIGFsc28gaW4gdGhhdCBtb2RlIHdlIG5lZWQgdG8gdHJpZ2dlciBiYWNrIG5hdmlnYXRpb24uXG5cdFx0XHRcdFx0XHQvLyBUaGUgb3RoZXIgY2FzZXMgbWlnaHQgc3RpbGwgYmUgbmVlZGVkIGluIGNhc2UgdGhlIG5hdmlnYXRpb24gZmFpbHMuXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdHJlc29sdmVkQ3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuU3luYyB8fFxuXHRcdFx0XHRcdFx0XHRyZXNvbHZlZENyZWF0aW9uTW9kZSA9PT0gQ3JlYXRpb25Nb2RlLkRlZmVycmVkIHx8XG5cdFx0XHRcdFx0XHRcdHJlc29sdmVkQ3JlYXRpb25Nb2RlID09PSBDcmVhdGlvbk1vZGUuQXN5bmNcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRvUm91dGluZ0xpc3RlbmVyLm5hdmlnYXRlQmFja0Zyb21UcmFuc2llbnRTdGF0ZSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHR0aHJvdyBlcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAoYlNob3VsZEJ1c3lMb2NrKSB7XG5cdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9Mb2NrT2JqZWN0KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgdXNlZCB0byBpbnRlcmNlcHQgdGhlICdTYXZlJyBhY3Rpb24uIFlvdSBjYW4gZXhlY3V0ZSBjdXN0b20gY29kaW5nIGluIHRoaXMgZnVuY3Rpb24uXG5cdCAqIFRoZSBmcmFtZXdvcmsgd2FpdHMgZm9yIHRoZSByZXR1cm5lZCBwcm9taXNlIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nIHRoZSAnU2F2ZScgYWN0aW9uLlxuXHQgKiBJZiB5b3UgcmVqZWN0IHRoZSBwcm9taXNlLCB0aGUgJ1NhdmUnIGFjdGlvbiBpcyBzdG9wcGVkIGFuZCB0aGUgdXNlciBzdGF5cyBpbiBlZGl0IG1vZGUuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBPYmplY3QgY29udGFpbmluZyB0aGUgcGFyYW1ldGVycyBwYXNzZWQgdG8gb25CZWZvcmVTYXZlXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5jb250ZXh0IFBhZ2UgY29udGV4dCB0aGF0IGlzIGdvaW5nIHRvIGJlIHNhdmVkLlxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdG8gYmUgcmV0dXJuZWQgYnkgdGhlIG92ZXJyaWRkZW4gbWV0aG9kLiBJZiByZXNvbHZlZCwgdGhlICdTYXZlJyBhY3Rpb24gaXMgdHJpZ2dlcmVkLiBJZiByZWplY3RlZCwgdGhlICdTYXZlJyBhY3Rpb24gaXMgbm90IHRyaWdnZXJlZCBhbmQgdGhlIHVzZXIgc3RheXMgaW4gZWRpdCBtb2RlLlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I29uQmVmb3JlU2F2ZVxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRvbkJlZm9yZVNhdmUobVBhcmFtZXRlcnM/OiB7IGNvbnRleHQ/OiBDb250ZXh0IH0pOiBQcm9taXNlPHZvaWQ+IHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG5cdC8qKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGNhbiBiZSB1c2VkIHRvIGludGVyY2VwdCB0aGUgJ0NyZWF0ZScgYWN0aW9uLiBZb3UgY2FuIGV4ZWN1dGUgY3VzdG9tIGNvZGluZyBpbiB0aGlzIGZ1bmN0aW9uLlxuXHQgKiBUaGUgZnJhbWV3b3JrIHdhaXRzIGZvciB0aGUgcmV0dXJuZWQgcHJvbWlzZSB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZyB0aGUgJ0NyZWF0ZScgYWN0aW9uLlxuXHQgKiBJZiB5b3UgcmVqZWN0IHRoZSBwcm9taXNlLCB0aGUgJ0NyZWF0ZScgYWN0aW9uIGlzIHN0b3BwZWQuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSAgbVBhcmFtZXRlcnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHBhcmFtZXRlcnMgcGFzc2VkIHRvIG9uQmVmb3JlQ3JlYXRlXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5jb250ZXh0UGF0aCBQYXRoIHBvaW50aW5nIHRvIHRoZSBjb250ZXh0IG9uIHdoaWNoIENyZWF0ZSBhY3Rpb24gaXMgdHJpZ2dlcmVkXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5jcmVhdGVQYXJhbWV0ZXJzIEFycmF5IG9mIHZhbHVlcyB0aGF0IGFyZSBmaWxsZWQgaW4gdGhlIEFjdGlvbiBQYXJhbWV0ZXIgRGlhbG9nXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0byBiZSByZXR1cm5lZCBieSB0aGUgb3ZlcnJpZGRlbiBtZXRob2QuIElmIHJlc29sdmVkLCB0aGUgJ0NyZWF0ZScgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnQ3JlYXRlJyBhY3Rpb24gaXMgbm90IHRyaWdnZXJlZC5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZUNyZWF0ZVxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjk4LjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRvbkJlZm9yZUNyZWF0ZShtUGFyYW1ldGVycz86IHsgY29udGV4dFBhdGg/OiBzdHJpbmc7IGNyZWF0ZVBhcmFtZXRlcnM/OiBhbnlbXSB9KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgdXNlZCB0byBpbnRlcmNlcHQgdGhlICdFZGl0JyBhY3Rpb24uIFlvdSBjYW4gZXhlY3V0ZSBjdXN0b20gY29kaW5nIGluIHRoaXMgZnVuY3Rpb24uXG5cdCAqIFRoZSBmcmFtZXdvcmsgd2FpdHMgZm9yIHRoZSByZXR1cm5lZCBwcm9taXNlIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nIHRoZSAnRWRpdCcgYWN0aW9uLlxuXHQgKiBJZiB5b3UgcmVqZWN0IHRoZSBwcm9taXNlLCB0aGUgJ0VkaXQnIGFjdGlvbiBpcyBzdG9wcGVkIGFuZCB0aGUgdXNlciBzdGF5cyBpbiBkaXNwbGF5IG1vZGUuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBPYmplY3QgY29udGFpbmluZyB0aGUgcGFyYW1ldGVycyBwYXNzZWQgdG8gb25CZWZvcmVFZGl0XG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5jb250ZXh0IFBhZ2UgY29udGV4dCB0aGF0IGlzIGdvaW5nIHRvIGJlIGVkaXRlZC5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRvIGJlIHJldHVybmVkIGJ5IHRoZSBvdmVycmlkZGVuIG1ldGhvZC4gSWYgcmVzb2x2ZWQsIHRoZSAnRWRpdCcgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnRWRpdCcgYWN0aW9uIGlzIG5vdCB0cmlnZ2VyZWQgYW5kIHRoZSB1c2VyIHN0YXlzIGluIGRpc3BsYXkgbW9kZS5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZUVkaXRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45OC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0b25CZWZvcmVFZGl0KG1QYXJhbWV0ZXJzPzogeyBjb250ZXh0PzogQ29udGV4dCB9KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgdXNlZCB0byBpbnRlcmNlcHQgdGhlICdEaXNjYXJkJyBhY3Rpb24uIFlvdSBjYW4gZXhlY3V0ZSBjdXN0b20gY29kaW5nIGluIHRoaXMgZnVuY3Rpb24uXG5cdCAqIFRoZSBmcmFtZXdvcmsgd2FpdHMgZm9yIHRoZSByZXR1cm5lZCBwcm9taXNlIHRvIGJlIHJlc29sdmVkIGJlZm9yZSBjb250aW51aW5nIHRoZSAnRGlzY2FyZCcgYWN0aW9uLlxuXHQgKiBJZiB5b3UgcmVqZWN0IHRoZSBwcm9taXNlLCB0aGUgJ0Rpc2NhcmQnIGFjdGlvbiBpcyBzdG9wcGVkIGFuZCB0aGUgdXNlciBzdGF5cyBpbiBlZGl0IG1vZGUuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBPYmplY3QgY29udGFpbmluZyB0aGUgcGFyYW1ldGVycyBwYXNzZWQgdG8gb25CZWZvcmVEaXNjYXJkXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5jb250ZXh0IFBhZ2UgY29udGV4dCB0aGF0IGlzIGdvaW5nIHRvIGJlIGRpc2NhcmRlZC5cblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRvIGJlIHJldHVybmVkIGJ5IHRoZSBvdmVycmlkZGVuIG1ldGhvZC4gSWYgcmVzb2x2ZWQsIHRoZSAnRGlzY2FyZCcgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnRGlzY2FyZCcgYWN0aW9uIGlzIG5vdCB0cmlnZ2VyZWQgYW5kIHRoZSB1c2VyIHN0YXlzIGluIGVkaXQgbW9kZS5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZURpc2NhcmRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45OC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0b25CZWZvcmVEaXNjYXJkKG1QYXJhbWV0ZXJzPzogeyBjb250ZXh0PzogQ29udGV4dCB9KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlblxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgdXNlZCB0byBpbnRlcmNlcHQgdGhlICdEZWxldGUnIGFjdGlvbi4gWW91IGNhbiBleGVjdXRlIGN1c3RvbSBjb2RpbmcgaW4gdGhpcyBmdW5jdGlvbi5cblx0ICogVGhlIGZyYW1ld29yayB3YWl0cyBmb3IgdGhlIHJldHVybmVkIHByb21pc2UgdG8gYmUgcmVzb2x2ZWQgYmVmb3JlIGNvbnRpbnVpbmcgdGhlICdEZWxldGUnIGFjdGlvbi5cblx0ICogSWYgeW91IHJlamVjdCB0aGUgcHJvbWlzZSwgdGhlICdEZWxldGUnIGFjdGlvbiBpcyBzdG9wcGVkLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHBhcmFtZXRlcnMgcGFzc2VkIHRvIG9uQmVmb3JlRGVsZXRlXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5jb250ZXh0cyBBbiBhcnJheSBvZiBjb250ZXh0cyB0aGF0IGFyZSBnb2luZyB0byBiZSBkZWxldGVkXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0byBiZSByZXR1cm5lZCBieSB0aGUgb3ZlcnJpZGRlbiBtZXRob2QuIElmIHJlc29sdmVkLCB0aGUgJ0RlbGV0ZScgYWN0aW9uIGlzIHRyaWdnZXJlZC4gSWYgcmVqZWN0ZWQsIHRoZSAnRGVsZXRlJyBhY3Rpb24gaXMgbm90IHRyaWdnZXJlZC5cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNvbkJlZm9yZURlbGV0ZVxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjk4LjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRvbkJlZm9yZURlbGV0ZShtUGFyYW1ldGVycz86IHsgY29udGV4dHM/OiBDb250ZXh0W10gfSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW5cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblxuXHQvLyBJbnRlcm5hbCBvbmx5IHBhcmFtcyAtLS1cblx0Ly8gQHBhcmFtIHtib29sZWFufSBtUGFyYW1ldGVycy5iRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvciBJbmRpY2F0ZXMgd2hldGhlciBTaWRlRWZmZWN0cyBuZWVkIHRvIGJlIGlnbm9yZWQgd2hlbiB1c2VyIGNsaWNrcyBvbiBTYXZlIGR1cmluZyBhbiBJbmxpbmUgY3JlYXRpb25cblx0Ly8gQHBhcmFtIHtvYmplY3R9IG1QYXJhbWV0ZXJzLmJpbmRpbmdzIExpc3QgYmluZGluZ3Mgb2YgdGhlIHRhYmxlcyBpbiB0aGUgdmlldy5cblx0Ly8gQm90aCBvZiB0aGUgYWJvdmUgcGFyYW1ldGVycyBhcmUgZm9yIHRoZSBzYW1lIHB1cnBvc2UuIFVzZXIgY2FuIGVudGVyIHNvbWUgaW5mb3JtYXRpb24gaW4gdGhlIGNyZWF0aW9uIHJvdyhzKSBidXQgZG9lcyBub3QgJ0FkZCByb3cnLCBpbnN0ZWFkIGNsaWNrcyBTYXZlLlxuXHQvLyBUaGVyZSBjYW4gYmUgbW9yZSB0aGFuIG9uZSBpbiB0aGUgdmlldy5cblxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUganNkb2MvcmVxdWlyZS1wYXJhbVxuXHQvKipcblx0ICogU2F2ZXMgYSBuZXcgZG9jdW1lbnQgYWZ0ZXIgY2hlY2tpbmcgaXQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgIENvbnRleHQgb2YgdGhlIGVkaXRhYmxlIGRvY3VtZW50XG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgb25jZSBzYXZlIGlzIGNvbXBsZXRlXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNzYXZlRG9jdW1lbnRcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgc2F2ZURvY3VtZW50KG9Db250ZXh0OiBWNENvbnRleHQsIG1QYXJhbWV0ZXJzOiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRtUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzIHx8IHt9O1xuXHRcdGNvbnN0IGJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yID0gbVBhcmFtZXRlcnMuYkV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3IgfHwgdW5kZWZpbmVkO1xuXHRcdGNvbnN0IGJEcmFmdE5hdmlnYXRpb24gPSB0cnVlO1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5fZ2V0VHJhbnNhY3Rpb25IZWxwZXIoKTtcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSB0aGlzLl9nZXRSZXNvdXJjZUJ1bmRsZSgpO1xuXHRcdGNvbnN0IGFCaW5kaW5ncyA9IG1QYXJhbWV0ZXJzLmJpbmRpbmdzO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuX3N5bmNUYXNrKCk7XG5cdFx0XHRhd2FpdCB0aGlzLl9zdWJtaXRPcGVuQ2hhbmdlcyhvQ29udGV4dCk7XG5cdFx0XHRhd2FpdCB0aGlzLl9jaGVja0ZvclZhbGlkYXRpb25FcnJvcnMoKTtcblx0XHRcdGF3YWl0IHRoaXMuYmFzZS5lZGl0Rmxvdy5vbkJlZm9yZVNhdmUoeyBjb250ZXh0OiBvQ29udGV4dCB9KTtcblxuXHRcdFx0Y29uc3Qgc1Byb2dyYW1taW5nTW9kZWwgPSB0aGlzLl9nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KTtcblx0XHRcdGNvbnN0IG9Sb290Vmlld0NvbnRyb2xsZXIgPSB0aGlzLl9nZXRSb290Vmlld0NvbnRyb2xsZXIoKSBhcyBhbnk7XG5cdFx0XHRsZXQgc2libGluZ0luZm86IFNpYmxpbmdJbmZvcm1hdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRcdGlmIChcblx0XHRcdFx0KHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSB8fCBvQ29udGV4dC5nZXRQcm9wZXJ0eShcIkhhc0FjdGl2ZUVudGl0eVwiKSkgJiZcblx0XHRcdFx0b1Jvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIE5vIG5lZWQgdG8gdHJ5IHRvIGdldCByaWdodG1vc3QgY29udGV4dCBpbiBjYXNlIG9mIGEgbmV3IG9iamVjdFxuXHRcdFx0XHRzaWJsaW5nSW5mbyA9IGF3YWl0IHRoaXMuX2NvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24oXG5cdFx0XHRcdFx0b0NvbnRleHQsXG5cdFx0XHRcdFx0b1Jvb3RWaWV3Q29udHJvbGxlci5nZXRSaWdodG1vc3RDb250ZXh0KCksXG5cdFx0XHRcdFx0c1Byb2dyYW1taW5nTW9kZWwsXG5cdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBhY3RpdmVEb2N1bWVudENvbnRleHQgPSBhd2FpdCB0cmFuc2FjdGlvbkhlbHBlci5zYXZlRG9jdW1lbnQoXG5cdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdGJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yLFxuXHRcdFx0XHRhQmluZGluZ3MsXG5cdFx0XHRcdHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKClcblx0XHRcdCk7XG5cdFx0XHR0aGlzLl9yZW1vdmVTdGlja3lTZXNzaW9uSW50ZXJuYWxQcm9wZXJ0aWVzKHNQcm9ncmFtbWluZ01vZGVsKTtcblxuXHRcdFx0dGhpcy5fc2VuZEFjdGl2aXR5KEFjdGl2aXR5LkFjdGl2YXRlLCBhY3RpdmVEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0dGhpcy5fdHJpZ2dlckNvbmZpZ3VyZWRTdXJ2ZXkoU3RhbmRhcmRBY3Rpb25zLnNhdmUsIFRyaWdnZXJUeXBlLnN0YW5kYXJkQWN0aW9uKTtcblxuXHRcdFx0dGhpcy5fc2V0RWRpdE1vZGUoRWRpdE1vZGUuRGlzcGxheSwgZmFsc2UpO1xuXHRcdFx0dGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZURpYWxvZygpO1xuXG5cdFx0XHRpZiAoYWN0aXZlRG9jdW1lbnRDb250ZXh0ICE9PSBvQ29udGV4dCkge1xuXHRcdFx0XHRsZXQgY29udGV4dFRvTmF2aWdhdGUgPSBhY3RpdmVEb2N1bWVudENvbnRleHQ7XG5cdFx0XHRcdGlmIChvUm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0c2libGluZ0luZm8gPSBzaWJsaW5nSW5mbyA/PyB0aGlzLl9jcmVhdGVTaWJsaW5nSW5mbyhvQ29udGV4dCwgYWN0aXZlRG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0XHR0aGlzLl91cGRhdGVQYXRoc0luSGlzdG9yeShzaWJsaW5nSW5mby5wYXRoTWFwcGluZyk7XG5cdFx0XHRcdFx0aWYgKHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQuZ2V0UGF0aCgpICE9PSBhY3RpdmVEb2N1bWVudENvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0VG9OYXZpZ2F0ZSA9IHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0YXdhaXQgdGhpcy5faGFuZGxlTmV3Q29udGV4dChjb250ZXh0VG9OYXZpZ2F0ZSwgZmFsc2UsIGZhbHNlLCBiRHJhZnROYXZpZ2F0aW9uLCB0cnVlKTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0aWYgKCEob0Vycm9yICYmIG9FcnJvci5jYW5jZWxlZCkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgc2F2aW5nIHRoZSBkb2N1bWVudFwiLCBvRXJyb3IpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG9FcnJvcik7XG5cdFx0fVxuXHR9XG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyB0b2dnbGVEcmFmdEFjdGl2ZShvQ29udGV4dDogVjRDb250ZXh0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgb0NvbnRleHREYXRhID0gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0bGV0IGJFZGl0YWJsZTogYm9vbGVhbjtcblx0XHRjb25zdCBiSXNEcmFmdCA9IG9Db250ZXh0ICYmIHRoaXMuX2dldFByb2dyYW1taW5nTW9kZWwob0NvbnRleHQpID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0O1xuXG5cdFx0Ly90b2dnbGUgYmV0d2VlbiBkcmFmdCBhbmQgYWN0aXZlIGRvY3VtZW50IGlzIG9ubHkgYXZhaWxhYmxlIGZvciBlZGl0IGRyYWZ0cyBhbmQgYWN0aXZlIGRvY3VtZW50cyB3aXRoIGRyYWZ0KVxuXHRcdGlmIChcblx0XHRcdCFiSXNEcmFmdCB8fFxuXHRcdFx0IShcblx0XHRcdFx0KCFvQ29udGV4dERhdGEuSXNBY3RpdmVFbnRpdHkgJiYgb0NvbnRleHREYXRhLkhhc0FjdGl2ZUVudGl0eSkgfHxcblx0XHRcdFx0KG9Db250ZXh0RGF0YS5Jc0FjdGl2ZUVudGl0eSAmJiBvQ29udGV4dERhdGEuSGFzRHJhZnRFbnRpdHkpXG5cdFx0XHQpXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCFvQ29udGV4dERhdGEuSXNBY3RpdmVFbnRpdHkgJiYgb0NvbnRleHREYXRhLkhhc0FjdGl2ZUVudGl0eSkge1xuXHRcdFx0Ly9zdGFydCBQb2ludDogZWRpdCBkcmFmdFxuXHRcdFx0YkVkaXRhYmxlID0gZmFsc2U7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHN0YXJ0IHBvaW50IGFjdGl2ZSBkb2N1bWVudFxuXHRcdFx0YkVkaXRhYmxlID0gdHJ1ZTtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgb1Jvb3RWaWV3Q29udHJvbGxlciA9IHRoaXMuX2dldFJvb3RWaWV3Q29udHJvbGxlcigpIGFzIGFueTtcblx0XHRcdGNvbnN0IG9SaWdodG1vc3RDb250ZXh0ID0gb1Jvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKSA/IG9Sb290Vmlld0NvbnRyb2xsZXIuZ2V0UmlnaHRtb3N0Q29udGV4dCgpIDogb0NvbnRleHQ7XG5cdFx0XHRsZXQgc2libGluZ0luZm8gPSBhd2FpdCB0aGlzLl9jb21wdXRlU2libGluZ0luZm9ybWF0aW9uKG9Db250ZXh0LCBvUmlnaHRtb3N0Q29udGV4dCwgUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCwgZmFsc2UpO1xuXHRcdFx0aWYgKCFzaWJsaW5nSW5mbyAmJiBvQ29udGV4dCAhPT0gb1JpZ2h0bW9zdENvbnRleHQpIHtcblx0XHRcdFx0Ly8gVHJ5IHRvIGNvbXB1dGUgc2libGluZyBpbmZvIGZvciB0aGUgcm9vdCBjb250ZXh0IGlmIGl0IGZhaWxzIGZvciB0aGUgcmlnaHRtb3N0IGNvbnRleHRcblx0XHRcdFx0Ly8gLS0+IEluIGNhc2Ugb2YgRkNMLCBpZiB3ZSB0cnkgdG8gc3dpdGNoIGJldHdlZW4gZHJhZnQgYW5kIGFjdGl2ZSBidXQgYSBjaGlsZCBlbnRpdHkgaGFzIG5vIHNpYmxpbmcsIHRoZSBzd2l0Y2ggd2lsbCBjbG9zZSB0aGUgY2hpbGQgY29sdW1uXG5cdFx0XHRcdHNpYmxpbmdJbmZvID0gYXdhaXQgdGhpcy5fY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihvQ29udGV4dCwgb0NvbnRleHQsIFByb2dyYW1taW5nTW9kZWwuRHJhZnQsIGZhbHNlKTtcblx0XHRcdH1cblx0XHRcdGlmIChzaWJsaW5nSW5mbykge1xuXHRcdFx0XHR0aGlzLl9zZXRFZGl0TW9kZShiRWRpdGFibGUgPyBFZGl0TW9kZS5FZGl0YWJsZSA6IEVkaXRNb2RlLkRpc3BsYXksIGZhbHNlKTsgLy9zd2l0Y2ggdG8gZWRpdCBtb2RlIG9ubHkgaWYgYSBkcmFmdCBpcyBhdmFpbGFibGVcblxuXHRcdFx0XHRpZiAob1Jvb3RWaWV3Q29udHJvbGxlci5pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRcdGNvbnN0IGxhc3RTZW1hbnRpY01hcHBpbmcgPSB0aGlzLl9nZXRTZW1hbnRpY01hcHBpbmcoKTtcblx0XHRcdFx0XHRpZiAobGFzdFNlbWFudGljTWFwcGluZz8udGVjaG5pY2FsUGF0aCA9PT0gb0NvbnRleHQuZ2V0UGF0aCgpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB0YXJnZXRQYXRoID0gc2libGluZ0luZm8ucGF0aE1hcHBpbmdbc2libGluZ0luZm8ucGF0aE1hcHBpbmcubGVuZ3RoIC0gMV0ubmV3UGF0aDtcblx0XHRcdFx0XHRcdHNpYmxpbmdJbmZvLnBhdGhNYXBwaW5nLnB1c2goeyBvbGRQYXRoOiBsYXN0U2VtYW50aWNNYXBwaW5nLnNlbWFudGljUGF0aCwgbmV3UGF0aDogdGFyZ2V0UGF0aCB9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhpcy5fdXBkYXRlUGF0aHNJbkhpc3Rvcnkoc2libGluZ0luZm8ucGF0aE1hcHBpbmcpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0YXdhaXQgdGhpcy5faGFuZGxlTmV3Q29udGV4dChzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0LCBiRWRpdGFibGUsIHRydWUsIHRydWUsIHRydWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KFwiRXJyb3IgaW4gRWRpdEZsb3cudG9nZ2xlRHJhZnRBY3RpdmUgLSBDYW5ub3QgZmluZCBzaWJsaW5nXCIpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKG9FcnJvcikge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGBFcnJvciBpbiBFZGl0Rmxvdy50b2dnbGVEcmFmdEFjdGl2ZToke29FcnJvcn1gIGFzIGFueSk7XG5cdFx0fVxuXHR9XG5cblx0Ly8gSW50ZXJuYWwgb25seSBwYXJhbXMgLS0tXG5cdC8vIEBwYXJhbSB7c2FwLm0uQnV0dG9ufSBtUGFyYW1ldGVycy5jYW5jZWxCdXR0b24gLSBDdXJyZW50bHkgdGhpcyBpcyBwYXNzZWQgYXMgY2FuY2VsQnV0dG9uIGludGVybmFsbHkgKHJlcGxhY2VkIGJ5IG1QYXJhbWV0ZXJzLmNvbnRyb2wgaW4gdGhlIEpTRG9jIGJlbG93KS4gQ3VycmVudGx5IGl0IGlzIGFsc28gbWFuZGF0b3J5LlxuXHQvLyBQbGFuIC0gVGhpcyBzaG91bGQgbm90IGJlIG1hbmRhdG9yeS4gSWYgbm90IHByb3ZpZGVkLCB3ZSBzaG91bGQgaGF2ZSBhIGRlZmF1bHQgdGhhdCBjYW4gYWN0IGFzIHJlZmVyZW5jZSBjb250cm9sIGZvciB0aGUgZGlzY2FyZCBwb3BvdmVyIE9SIHdlIGNhbiBzaG93IGEgZGlhbG9nIGluc3RlYWQgb2YgYSBwb3BvdmVyLlxuXG5cdC8qKlxuXHQgKiBEaXNjYXJkIHRoZSBlZGl0YWJsZSBkb2N1bWVudC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEBwYXJhbSBvQ29udGV4dCAgQ29udGV4dCBvZiB0aGUgZWRpdGFibGUgZG9jdW1lbnRcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIENhbiBjb250YWluIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLmNvbnRyb2wgVGhpcyBpcyB0aGUgY29udHJvbCB1c2VkIHRvIG9wZW4gdGhlIGRpc2NhcmQgcG9wb3ZlclxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMuc2tpcERpc2NhcmRQb3BvdmVyIE9wdGlvbmFsLCBzdXByZXNzZXMgdGhlIGRpc2NhcmQgcG9wb3ZlciBhbmQgYWxsb3dzIGN1c3RvbSBoYW5kbGluZ1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIG9uY2UgZWRpdGFibGUgZG9jdW1lbnQgaGFzIGJlZW4gZGlzY2FyZGVkXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNjYW5jZWxEb2N1bWVudFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBjYW5jZWxEb2N1bWVudChvQ29udGV4dDogVjRDb250ZXh0LCBtUGFyYW1ldGVyczogeyBjb250cm9sOiBvYmplY3Q7IHNraXBEaXNjYXJkUG9wb3Zlcj86IGJvb2xlYW4gfSk6IFByb21pc2U8YW55PiB7XG5cdFx0Y29uc3QgdHJhbnNhY3Rpb25IZWxwZXIgPSB0aGlzLl9nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IHRoaXMuX2dldFJlc291cmNlQnVuZGxlKCk7XG5cdFx0Y29uc3QgbUluUGFyYW1ldGVyczogYW55ID0gbVBhcmFtZXRlcnM7XG5cdFx0bGV0IHNpYmxpbmdJbmZvOiBTaWJsaW5nSW5mb3JtYXRpb24gfCB1bmRlZmluZWQ7XG5cblx0XHRtSW5QYXJhbWV0ZXJzLmNhbmNlbEJ1dHRvbiA9IG1QYXJhbWV0ZXJzLmNvbnRyb2wgfHwgbUluUGFyYW1ldGVycy5jYW5jZWxCdXR0b247XG5cdFx0bUluUGFyYW1ldGVycy5iZWZvcmVDYW5jZWxDYWxsQmFjayA9IHRoaXMuYmFzZS5lZGl0Rmxvdy5vbkJlZm9yZURpc2NhcmQ7XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdGhpcy5fc3luY1Rhc2soKTtcblx0XHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsID0gdGhpcy5fZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQ29udGV4dCk7XG5cdFx0XHRpZiAoKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSB8fCBvQ29udGV4dC5nZXRQcm9wZXJ0eShcIkhhc0FjdGl2ZUVudGl0eVwiKSkgJiYgdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0Y29uc3Qgb1Jvb3RWaWV3Q29udHJvbGxlciA9IHRoaXMuX2dldFJvb3RWaWV3Q29udHJvbGxlcigpIGFzIGFueTtcblxuXHRcdFx0XHQvLyBObyBuZWVkIHRvIHRyeSB0byBnZXQgcmlnaHRtb3N0IGNvbnRleHQgaW4gY2FzZSBvZiBhIG5ldyBvYmplY3Rcblx0XHRcdFx0c2libGluZ0luZm8gPSBhd2FpdCB0aGlzLl9jb21wdXRlU2libGluZ0luZm9ybWF0aW9uKFxuXHRcdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHRcdG9Sb290Vmlld0NvbnRyb2xsZXIuZ2V0UmlnaHRtb3N0Q29udGV4dCgpLFxuXHRcdFx0XHRcdHNQcm9ncmFtbWluZ01vZGVsLFxuXHRcdFx0XHRcdHRydWVcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgY2FuY2VsUmVzdWx0ID0gYXdhaXQgdHJhbnNhY3Rpb25IZWxwZXIuY2FuY2VsRG9jdW1lbnQoXG5cdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHRtSW5QYXJhbWV0ZXJzLFxuXHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKClcblx0XHRcdCk7XG5cdFx0XHRjb25zdCBiRHJhZnROYXZpZ2F0aW9uID0gdHJ1ZTtcblx0XHRcdHRoaXMuX3JlbW92ZVN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMoc1Byb2dyYW1taW5nTW9kZWwpO1xuXG5cdFx0XHR0aGlzLl9zZXRFZGl0TW9kZShFZGl0TW9kZS5EaXNwbGF5LCBmYWxzZSk7XG5cdFx0XHR0aGlzLl9zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5DbGVhcik7XG5cdFx0XHQvLyB3ZSBmb3JjZSB0aGUgZWRpdCBzdGF0ZSBldmVuIGZvciBGQ0wgYmVjYXVzZSB0aGUgZHJhZnQgZGlzY2FyZCBtaWdodCBub3QgYmUgaW1wbGVtZW50ZWRcblx0XHRcdC8vIGFuZCB3ZSBtYXkganVzdCBkZWxldGUgdGhlIGRyYWZ0XG5cdFx0XHRFZGl0U3RhdGUuc2V0RWRpdFN0YXRlRGlydHkoKTtcblxuXHRcdFx0aWYgKCFjYW5jZWxSZXN1bHQpIHtcblx0XHRcdFx0dGhpcy5fc2VuZEFjdGl2aXR5KEFjdGl2aXR5LkRpc2NhcmQsIHVuZGVmaW5lZCk7XG5cdFx0XHRcdC8vaW4gY2FzZSBvZiBhIG5ldyBkb2N1bWVudCwgbm8gYWN0aXZlQ29udGV4dCBpcyByZXR1cm5lZCAtLT4gbmF2aWdhdGUgYmFjay5cblx0XHRcdFx0aWYgKCFtSW5QYXJhbWV0ZXJzLnNraXBCYWNrTmF2aWdhdGlvbikge1xuXHRcdFx0XHRcdGF3YWl0IHRoaXMuX2dldFJvdXRpbmdMaXN0ZW5lcigpLm5hdmlnYXRlQmFja0Zyb21Db250ZXh0KG9Db250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb0FjdGl2ZURvY3VtZW50Q29udGV4dCA9IGNhbmNlbFJlc3VsdCBhcyBWNENvbnRleHQ7XG5cdFx0XHRcdHRoaXMuX3NlbmRBY3Rpdml0eShBY3Rpdml0eS5EaXNjYXJkLCBvQWN0aXZlRG9jdW1lbnRDb250ZXh0KTtcblx0XHRcdFx0bGV0IGNvbnRleHRUb05hdmlnYXRlID0gb0FjdGl2ZURvY3VtZW50Q29udGV4dDtcblx0XHRcdFx0aWYgKHRoaXMuX2lzRmNsRW5hYmxlZCgpKSB7XG5cdFx0XHRcdFx0c2libGluZ0luZm8gPSBzaWJsaW5nSW5mbyA/PyB0aGlzLl9jcmVhdGVTaWJsaW5nSW5mbyhvQ29udGV4dCwgb0FjdGl2ZURvY3VtZW50Q29udGV4dCk7XG5cdFx0XHRcdFx0dGhpcy5fdXBkYXRlUGF0aHNJbkhpc3Rvcnkoc2libGluZ0luZm8ucGF0aE1hcHBpbmcpO1xuXHRcdFx0XHRcdGlmIChzaWJsaW5nSW5mby50YXJnZXRDb250ZXh0LmdldFBhdGgoKSAhPT0gb0FjdGl2ZURvY3VtZW50Q29udGV4dC5nZXRQYXRoKCkpIHtcblx0XHRcdFx0XHRcdGNvbnRleHRUb05hdmlnYXRlID0gc2libGluZ0luZm8udGFyZ2V0Q29udGV4dDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQpIHtcblx0XHRcdFx0XHQvLyBXZSBuZWVkIHRvIGxvYWQgdGhlIHNlbWFudGljIGtleXMgb2YgdGhlIGFjdGl2ZSBjb250ZXh0LCBhcyB3ZSBuZWVkIHRoZW1cblx0XHRcdFx0XHQvLyBmb3IgdGhlIG5hdmlnYXRpb25cblx0XHRcdFx0XHRhd2FpdCB0aGlzLl9mZXRjaFNlbWFudGljS2V5VmFsdWVzKG9BY3RpdmVEb2N1bWVudENvbnRleHQpO1xuXHRcdFx0XHRcdC8vIFdlIGZvcmNlIHRoZSByZWNyZWF0aW9uIG9mIHRoZSBjb250ZXh0LCBzbyB0aGF0IGl0J3MgY3JlYXRlZCBhbmQgYm91bmQgaW4gdGhlIHNhbWUgbWljcm90YXNrLFxuXHRcdFx0XHRcdC8vIHNvIHRoYXQgYWxsIHByb3BlcnRpZXMgYXJlIGxvYWRlZCB0b2dldGhlciBieSBhdXRvRXhwYW5kU2VsZWN0LCBzbyB0aGF0IHdoZW4gc3dpdGNoaW5nIGJhY2sgdG8gRWRpdCBtb2RlXG5cdFx0XHRcdFx0Ly8gJCRpbmhlcml0RXhwYW5kU2VsZWN0IHRha2VzIGFsbCBsb2FkZWQgcHJvcGVydGllcyBpbnRvIGFjY291bnQgKEJDUCAyMDcwNDYyMjY1KVxuXHRcdFx0XHRcdGlmICghbUluUGFyYW1ldGVycy5za2lwQmluZGluZ1RvVmlldykge1xuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5faGFuZGxlTmV3Q29udGV4dChjb250ZXh0VG9OYXZpZ2F0ZSwgZmFsc2UsIHRydWUsIGJEcmFmdE5hdmlnYXRpb24sIHRydWUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0FjdGl2ZURvY3VtZW50Q29udGV4dDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly9hY3RpdmUgY29udGV4dCBpcyByZXR1cm5lZCBpbiBjYXNlIG9mIGNhbmNlbCBvZiBleGlzdGluZyBkb2N1bWVudFxuXHRcdFx0XHRcdGF3YWl0IHRoaXMuX2hhbmRsZU5ld0NvbnRleHQoY29udGV4dFRvTmF2aWdhdGUsIGZhbHNlLCBmYWxzZSwgYkRyYWZ0TmF2aWdhdGlvbiwgdHJ1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGRpc2NhcmRpbmcgdGhlIGRvY3VtZW50XCIsIG9FcnJvciBhcyBhbnkpO1xuXHRcdH1cblx0fVxuXG5cdC8vIEludGVybmFsIG9ubHkgcGFyYW1zIC0tLVxuXHQvLyBAcGFyYW0ge3N0cmluZ30gbVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZSBOYW1lIG9mIHRoZSBFbnRpdHlTZXQgdG8gd2hpY2ggdGhlIG9iamVjdCBiZWxvbmdzXG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIGNvbnRleHQgY29ycmVzcG9uZHMgdG8gYSBkcmFmdCByb290LlxuXHQgKlxuXHQgKiBAcGFyYW0gY29udGV4dCBUaGUgY29udGV4dCB0byBjaGVja1xuXHQgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBjb250ZXh0IHBvaW50cyB0byBhIGRyYWZ0IHJvb3Rcblx0ICogQHByaXZhdGVcblx0ICovXG5cdHByb3RlY3RlZCBpc0RyYWZ0Um9vdChjb250ZXh0OiBDb250ZXh0KTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gY29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdGNvbnN0IG1ldGFDb250ZXh0ID0gbWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KGNvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRyZXR1cm4gTW9kZWxIZWxwZXIuaXNEcmFmdFJvb3QoZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG1ldGFDb250ZXh0KS50YXJnZXRFbnRpdHlTZXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIERlbGV0ZXMgdGhlIGRvY3VtZW50LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIG9Db250ZXh0ICBDb250ZXh0IG9mIHRoZSBkb2N1bWVudFxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycyBDYW4gY29udGFpbiB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLnRpdGxlIFRpdGxlIG9mIHRoZSBvYmplY3QgYmVpbmcgZGVsZXRlZFxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5kZXNjcmlwdGlvbiBEZXNjcmlwdGlvbiBvZiB0aGUgb2JqZWN0IGJlaW5nIGRlbGV0ZWRcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBvbmNlIGRvY3VtZW50IGhhcyBiZWVuIGRlbGV0ZWRcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93I2RlbGV0ZURvY3VtZW50XG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIGRlbGV0ZURvY3VtZW50KG9Db250ZXh0OiBDb250ZXh0LCBtSW5QYXJhbWV0ZXJzOiB7IHRpdGxlOiBzdHJpbmc7IGRlc2NyaXB0aW9uOiBzdHJpbmcgfSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5nZXRWaWV3KCkpO1xuXHRcdGxldCBtUGFyYW1ldGVyczogYW55ID0gbUluUGFyYW1ldGVycztcblx0XHRpZiAoIW1QYXJhbWV0ZXJzKSB7XG5cdFx0XHRtUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0YkZpbmRBY3RpdmVDb250ZXh0czogZmFsc2Vcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1QYXJhbWV0ZXJzLmJGaW5kQWN0aXZlQ29udGV4dHMgPSBmYWxzZTtcblx0XHR9XG5cdFx0bVBhcmFtZXRlcnMuYmVmb3JlRGVsZXRlQ2FsbEJhY2sgPSB0aGlzLmJhc2UuZWRpdEZsb3cub25CZWZvcmVEZWxldGU7XG5cblx0XHR0cnkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHR0aGlzLl9pc0ZjbEVuYWJsZWQoKSAmJlxuXHRcdFx0XHR0aGlzLmlzRHJhZnRSb290KG9Db250ZXh0KSAmJlxuXHRcdFx0XHRvQ29udGV4dC5nZXRJbmRleCgpID09PSB1bmRlZmluZWQgJiZcblx0XHRcdFx0b0NvbnRleHQuZ2V0UHJvcGVydHkoXCJJc0FjdGl2ZUVudGl0eVwiKSA9PT0gdHJ1ZSAmJlxuXHRcdFx0XHRvQ29udGV4dC5nZXRQcm9wZXJ0eShcIkhhc0RyYWZ0RW50aXR5XCIpID09PSB0cnVlXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gRGVsZXRpbmcgYW4gYWN0aXZlIGVudGl0eSB3aGljaCBoYXMgYSBkcmFmdCB0aGF0IGNvdWxkIHBvdGVudGlhbGx5IGJlIGRpc3BsYXllZCBpbiB0aGUgTGlzdFJlcG9ydCAoRkNMIGNhc2UpXG5cdFx0XHRcdC8vIC0tPiBuZWVkIHRvIHJlbW92ZSB0aGUgZHJhZnQgZnJvbSB0aGUgTFIgYW5kIHJlcGxhY2UgaXQgd2l0aCB0aGUgYWN0aXZlIHZlcnNpb24sIHNvIHRoYXQgdGhlIExpc3RCaW5kaW5nIGlzIHByb3Blcmx5IHJlZnJlc2hlZFxuXHRcdFx0XHQvLyBUaGUgY29uZGl0aW9uICdvQ29udGV4dC5nZXRJbmRleCgpID09PSB1bmRlZmluZWQnIG1ha2VzIHN1cmUgdGhlIGFjdGl2ZSB2ZXJzaW9uIGlzbid0IGFscmVhZHkgZGlzcGxheWVkIGluIHRoZSBMUlxuXHRcdFx0XHRtUGFyYW1ldGVycy5iZWZvcmVEZWxldGVDYWxsQmFjayA9IGFzeW5jIChwYXJhbWV0ZXJzPzogeyBjb250ZXh0cz86IENvbnRleHRbXSB9KSA9PiB7XG5cdFx0XHRcdFx0YXdhaXQgdGhpcy5iYXNlLmVkaXRGbG93Lm9uQmVmb3JlRGVsZXRlKHBhcmFtZXRlcnMpO1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBtb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbDtcblx0XHRcdFx0XHRcdGNvbnN0IHNpYmxpbmdDb250ZXh0ID0gbW9kZWwuYmluZENvbnRleHQoYCR7b0NvbnRleHQuZ2V0UGF0aCgpfS9TaWJsaW5nRW50aXR5YCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRcdFx0XHRjb25zdCBkcmFmdFBhdGggPSBhd2FpdCBzaWJsaW5nQ29udGV4dC5yZXF1ZXN0Q2Fub25pY2FsUGF0aCgpO1xuXHRcdFx0XHRcdFx0Y29uc3QgZHJhZnRDb250ZXh0VG9SZW1vdmUgPSBtb2RlbC5nZXRLZWVwQWxpdmVDb250ZXh0KGRyYWZ0UGF0aCk7XG5cdFx0XHRcdFx0XHRkcmFmdENvbnRleHRUb1JlbW92ZT8ucmVwbGFjZVdpdGgob0NvbnRleHQpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXBsYWNpbmcgdGhlIGRyYWZ0IGluc3RhbmNlIGluIHRoZSBMUiBPRExCXCIsIGVycm9yIGFzIGFueSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHRhd2FpdCB0aGlzLl9kZWxldGVEb2N1bWVudFRyYW5zYWN0aW9uKG9Db250ZXh0LCBtUGFyYW1ldGVycyk7XG5cblx0XHRcdC8vIFNpbmdsZSBvYmpldCBkZWxldGlvbiBpcyB0cmlnZ2VyZWQgZnJvbSBhbiBPUCBoZWFkZXIgYnV0dG9uIChub3QgZnJvbSBhIGxpc3QpXG5cdFx0XHQvLyAtLT4gTWFyayBVSSBkaXJ0eSBhbmQgbmF2aWdhdGUgYmFjayB0byBkaXNtaXNzIHRoZSBPUFxuXHRcdFx0aWYgKCF0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHRFZGl0U3RhdGUuc2V0RWRpdFN0YXRlRGlydHkoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX3NlbmRBY3Rpdml0eShBY3Rpdml0eS5EZWxldGUsIG9Db250ZXh0KTtcblxuXHRcdFx0Ly8gQWZ0ZXIgZGVsZXRlIGlzIHN1Y2Nlc3NmdWxsLCB3ZSBuZWVkIHRvIGRldGFjaCB0aGUgc2V0QmFja05hdmlnYXRpb24gTWV0aG9kc1xuXHRcdFx0aWYgKG9BcHBDb21wb25lbnQpIHtcblx0XHRcdFx0b0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCkuc2V0QmFja05hdmlnYXRpb24oKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9BcHBDb21wb25lbnQ/LmdldFN0YXJ0dXBNb2RlKCkgPT09IFN0YXJ0dXBNb2RlLkRlZXBsaW5rICYmICF0aGlzLl9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0XHQvLyBJbiBjYXNlIHRoZSBhcHAgaGFzIGJlZW4gbGF1bmNoZWQgd2l0aCBzZW1hbnRpYyBrZXlzLCBkZWxldGluZyB0aGUgb2JqZWN0IHdlJ3ZlIGxhbmRlZCBvbiBzaGFsbCBuYXZpZ2F0ZSBiYWNrXG5cdFx0XHRcdC8vIHRvIHRoZSBhcHAgd2UgY2FtZSBmcm9tIChleGNlcHQgZm9yIEZDTCwgd2hlcmUgd2UgbmF2aWdhdGUgdG8gTFIgYXMgdXN1YWwpXG5cdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5leGl0RnJvbUFwcCgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5fZ2V0Um91dGluZ0xpc3RlbmVyKCkubmF2aWdhdGVCYWNrRnJvbUNvbnRleHQob0NvbnRleHQpO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGVycm9yKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBkZWxldGluZyB0aGUgZG9jdW1lbnRcIiwgZXJyb3IgYXMgYW55KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU3VibWl0IHRoZSBjdXJyZW50IHNldCBvZiBjaGFuZ2VzIGFuZCBuYXZpZ2F0ZSBiYWNrLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIG9Db250ZXh0ICBDb250ZXh0IG9mIHRoZSBkb2N1bWVudFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIG9uY2UgdGhlIGNoYW5nZXMgaGF2ZSBiZWVuIHNhdmVkXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0RmxvdyNhcHBseURvY3VtZW50XG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIGFwcGx5RG9jdW1lbnQob0NvbnRleHQ6IG9iamVjdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IG9Mb2NrT2JqZWN0ID0gdGhpcy5fZ2V0R2xvYmFsVUlNb2RlbCgpO1xuXHRcdEJ1c3lMb2NrZXIubG9jayhvTG9ja09iamVjdCk7XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdGhpcy5fc3luY1Rhc2soKTtcblx0XHRcdGF3YWl0IHRoaXMuX3N1Ym1pdE9wZW5DaGFuZ2VzKG9Db250ZXh0KTtcblx0XHRcdGF3YWl0IHRoaXMuX2NoZWNrRm9yVmFsaWRhdGlvbkVycm9ycygpO1xuXHRcdFx0YXdhaXQgdGhpcy5fZ2V0TWVzc2FnZUhhbmRsZXIoKS5zaG93TWVzc2FnZURpYWxvZygpO1xuXHRcdFx0YXdhaXQgdGhpcy5fZ2V0Um91dGluZ0xpc3RlbmVyKCkubmF2aWdhdGVCYWNrRnJvbUNvbnRleHQob0NvbnRleHQpO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvTG9ja09iamVjdCkpIHtcblx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob0xvY2tPYmplY3QpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIEludGVybmFsIG9ubHkgcGFyYW1zIC0tLVxuXHQvLyBAcGFyYW0ge2Jvb2xlYW59IFttUGFyYW1ldGVycy5iU3RhdGljQWN0aW9uXSBCb29sZWFuIHZhbHVlIGZvciBzdGF0aWMgYWN0aW9uLCB1bmRlZmluZWQgZm9yIG90aGVyIGFjdGlvbnNcblx0Ly8gQHBhcmFtIHtib29sZWFufSBbbVBhcmFtZXRlcnMuaXNOYXZpZ2FibGVdIEJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIG5hdmlnYXRpb24gaXMgcmVxdWlyZWQgYWZ0ZXIgdGhlIGFjdGlvbiBoYXMgYmVlbiBleGVjdXRlZFxuXHQvLyBDdXJyZW50bHkgdGhlIHBhcmFtZXRlciBpc05hdmlnYWJsZSBpcyB1c2VkIGludGVybmFsbHkgYW5kIHNob3VsZCBiZSBjaGFuZ2VkIHRvIHJlcXVpcmVzTmF2aWdhdGlvbiBhcyBpdCBpcyBhIG1vcmUgYXB0IG5hbWUgZm9yIHRoaXMgcGFyYW1cblxuXHQvKipcblx0ICogSW52b2tlcyBhbiBhY3Rpb24gKGJvdW5kIG9yIHVuYm91bmQpIGFuZCB0cmFja3MgdGhlIGNoYW5nZXMgc28gdGhhdCBvdGhlciBwYWdlcyBjYW4gYmUgcmVmcmVzaGVkIGFuZCBzaG93IHRoZSB1cGRhdGVkIGRhdGEgdXBvbiBuYXZpZ2F0aW9uLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgY2FsbGVkXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzIENvbnRhaW5zIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzIEEgbWFwIG9mIGFjdGlvbiBwYXJhbWV0ZXIgbmFtZXMgYW5kIHByb3ZpZGVkIHZhbHVlc1xuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXMubmFtZSBOYW1lIG9mIHRoZSBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzLnZhbHVlIFZhbHVlIG9mIHRoZSBwYXJhbWV0ZXJcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMuc2tpcFBhcmFtZXRlckRpYWxvZyBTa2lwcyB0aGUgYWN0aW9uIHBhcmFtZXRlciBkaWFsb2cgaWYgdmFsdWVzIGFyZSBwcm92aWRlZCBmb3IgYWxsIG9mIHRoZW0gaW4gcGFyYW1ldGVyVmFsdWVzXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLmNvbnRleHRzIEZvciBhIGJvdW5kIGFjdGlvbiwgYSBjb250ZXh0IG9yIGFuIGFycmF5IHdpdGggY29udGV4dHMgZm9yIHdoaWNoIHRoZSBhY3Rpb24gaXMgdG8gYmUgY2FsbGVkIG11c3QgYmUgcHJvdmlkZWRcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMubW9kZWwgRm9yIGFuIHVuYm91bmQgYWN0aW9uLCBhbiBpbnN0YW5jZSBvZiBhbiBPRGF0YSBWNCBtb2RlbCBtdXN0IGJlIHByb3ZpZGVkXG5cdCAqIEBwYXJhbSBtSW5QYXJhbWV0ZXJzLnJlcXVpcmVzTmF2aWdhdGlvbiBCb29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciBuYXZpZ2F0aW9uIGlzIHJlcXVpcmVkIGFmdGVyIHRoZSBhY3Rpb24gaGFzIGJlZW4gZXhlY3V0ZWQuIE5hdmlnYXRpb24gdGFrZXMgcGxhY2UgdG8gdGhlIGNvbnRleHQgcmV0dXJuZWQgYnkgdGhlIGFjdGlvblxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5sYWJlbCBBIGh1bWFuLXJlYWRhYmxlIGxhYmVsIGZvciB0aGUgYWN0aW9uLiBUaGlzIGlzIG5lZWRlZCBpbiBjYXNlIHRoZSBhY3Rpb24gaGFzIGEgcGFyYW1ldGVyIGFuZCBhIHBhcmFtZXRlciBkaWFsb2cgaXMgc2hvd24gdG8gdGhlIHVzZXIuIFRoZSBsYWJlbCB3aWxsIGJlIHVzZWQgZm9yIHRoZSB0aXRsZSBvZiB0aGUgZGlhbG9nIGFuZCBmb3IgdGhlIGNvbmZpcm1hdGlvbiBidXR0b25cblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMuaW52b2NhdGlvbkdyb3VwaW5nIE1vZGUgaG93IGFjdGlvbnMgYXJlIHRvIGJlIGNhbGxlZDogJ0NoYW5nZVNldCcgdG8gcHV0IGFsbCBhY3Rpb24gY2FsbHMgaW50byBvbmUgY2hhbmdlc2V0LCAnSXNvbGF0ZWQnIHRvIHB1dCB0aGVtIGludG8gc2VwYXJhdGUgY2hhbmdlc2V0c1xuXHQgKiBAcGFyYW0gbUV4dHJhUGFyYW1zIFBSSVZBVEVcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHdoaWNoIHJlc29sdmVzIG9uY2UgdGhlIGFjdGlvbiBoYXMgYmVlbiBleGVjdXRlZCwgcHJvdmlkaW5nIHRoZSByZXNwb25zZVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjaW52b2tlQWN0aW9uXG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKiBAZmluYWxcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBpbnZva2VBY3Rpb24oXG5cdFx0c0FjdGlvbk5hbWU6IHN0cmluZyxcblx0XHRtSW5QYXJhbWV0ZXJzPzoge1xuXHRcdFx0cGFyYW1ldGVyVmFsdWVzPzogeyBuYW1lOiBzdHJpbmc7IHZhbHVlOiBhbnkgfTtcblx0XHRcdHNraXBQYXJhbWV0ZXJEaWFsb2c/OiBib29sZWFuO1xuXHRcdFx0Y29udGV4dHM/OiBDb250ZXh0IHwgQ29udGV4dFtdO1xuXHRcdFx0bW9kZWw/OiBPRGF0YU1vZGVsO1xuXHRcdFx0cmVxdWlyZXNOYXZpZ2F0aW9uPzogYm9vbGVhbjtcblx0XHRcdGxhYmVsPzogc3RyaW5nO1xuXHRcdFx0aW52b2NhdGlvbkdyb3VwaW5nPzogc3RyaW5nO1xuXHRcdH0sXG5cdFx0bUV4dHJhUGFyYW1zPzogYW55XG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGxldCBvQ29udHJvbDogYW55O1xuXHRcdGNvbnN0IHRyYW5zYWN0aW9uSGVscGVyID0gdGhpcy5fZ2V0VHJhbnNhY3Rpb25IZWxwZXIoKTtcblx0XHRsZXQgYVBhcnRzO1xuXHRcdGxldCBzT3ZlcmxvYWRFbnRpdHlUeXBlO1xuXHRcdGxldCBvQ3VycmVudEFjdGlvbkNhbGxCYWNrczogYW55O1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCk7XG5cblx0XHRsZXQgbVBhcmFtZXRlcnM6IGFueSA9IG1JblBhcmFtZXRlcnMgfHwge307XG5cblx0XHQvLyBEdWUgdG8gYSBtaXN0YWtlIHRoZSBpbnZva2VBY3Rpb24gaW4gdGhlIGV4dGVuc2lvbkFQSSBoYWQgYSBkaWZmZXJlbnQgQVBJIHRoYW4gdGhpcyBvbmUuXG5cdFx0Ly8gVGhlIG9uZSBmcm9tIHRoZSBleHRlbnNpb25BUEkgZG9lc24ndCBleGlzdCBhbnltb3JlIGFzIHdlIGV4cG9zZSB0aGUgZnVsbCBlZGl0IGZsb3cgbm93IGJ1dFxuXHRcdC8vIGR1ZSB0byBjb21wYXRpYmlsaXR5IHJlYXNvbnMgd2Ugc3RpbGwgbmVlZCB0byBzdXBwb3J0IHRoZSBvbGQgc2lnbmF0dXJlXG5cdFx0aWYgKFxuXHRcdFx0KG1QYXJhbWV0ZXJzLmlzQSAmJiBtUGFyYW1ldGVycy5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dFwiKSkgfHxcblx0XHRcdEFycmF5LmlzQXJyYXkobVBhcmFtZXRlcnMpIHx8XG5cdFx0XHRtRXh0cmFQYXJhbXMgIT09IHVuZGVmaW5lZFxuXHRcdCkge1xuXHRcdFx0Y29uc3QgY29udGV4dHMgPSBtUGFyYW1ldGVycztcblx0XHRcdG1QYXJhbWV0ZXJzID0gbUV4dHJhUGFyYW1zIHx8IHt9O1xuXHRcdFx0aWYgKGNvbnRleHRzKSB7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNvbnRleHRzID0gY29udGV4dHM7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRtUGFyYW1ldGVycy5tb2RlbCA9IHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bVBhcmFtZXRlcnMuaXNOYXZpZ2FibGUgPSBtUGFyYW1ldGVycy5yZXF1aXJlc05hdmlnYXRpb24gfHwgbVBhcmFtZXRlcnMuaXNOYXZpZ2FibGU7XG5cblx0XHRpZiAoIW1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wpIHtcblx0XHRcdG1QYXJhbWV0ZXJzLnBhcmVudENvbnRyb2wgPSB0aGlzLmdldFZpZXcoKTtcblx0XHR9XG5cblx0XHRpZiAobVBhcmFtZXRlcnMuY29udHJvbElkKSB7XG5cdFx0XHRvQ29udHJvbCA9IHRoaXMuZ2V0VmlldygpLmJ5SWQobVBhcmFtZXRlcnMuY29udHJvbElkKTtcblx0XHRcdGlmIChvQ29udHJvbCkge1xuXHRcdFx0XHQvLyBUT0RPOiBjdXJyZW50bHkgdGhpcyBzZWxlY3RlZCBjb250ZXh0cyB1cGRhdGUgaXMgZG9uZSB3aXRoaW4gdGhlIG9wZXJhdGlvbiwgc2hvdWxkIGJlIG1vdmVkIG91dFxuXHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9Db250cm9sLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHR9XG5cblx0XHRpZiAoc0FjdGlvbk5hbWUgJiYgc0FjdGlvbk5hbWUuaW5kZXhPZihcIihcIikgPiAtMSkge1xuXHRcdFx0Ly8gZ2V0IGVudGl0eSB0eXBlIG9mIGFjdGlvbiBvdmVybG9hZCBhbmQgcmVtb3ZlIGl0IGZyb20gdGhlIGFjdGlvbiBwYXRoXG5cdFx0XHQvLyBFeGFtcGxlIHNBY3Rpb25OYW1lID0gXCI8QWN0aW9uTmFtZT4oQ29sbGVjdGlvbig8T3ZlcmxvYWRFbnRpdHlUeXBlPikpXCJcblx0XHRcdC8vIHNBY3Rpb25OYW1lID0gYVBhcnRzWzBdIC0tPiA8QWN0aW9uTmFtZT5cblx0XHRcdC8vIHNPdmVybG9hZEVudGl0eVR5cGUgPSBhUGFydHNbMl0gLS0+IDxPdmVybG9hZEVudGl0eVR5cGU+XG5cdFx0XHRhUGFydHMgPSBzQWN0aW9uTmFtZS5zcGxpdChcIihcIik7XG5cdFx0XHRzQWN0aW9uTmFtZSA9IGFQYXJ0c1swXTtcblx0XHRcdHNPdmVybG9hZEVudGl0eVR5cGUgPSAoYVBhcnRzW2FQYXJ0cy5sZW5ndGggLSAxXSBhcyBhbnkpLnJlcGxhY2VBbGwoXCIpXCIsIFwiXCIpO1xuXHRcdH1cblxuXHRcdGlmIChtUGFyYW1ldGVycy5iU3RhdGljQWN0aW9uKSB7XG5cdFx0XHRpZiAob0NvbnRyb2wuaXNUYWJsZUJvdW5kKCkpIHtcblx0XHRcdFx0bVBhcmFtZXRlcnMuY29udGV4dHMgPSBvQ29udHJvbC5nZXRSb3dCaW5kaW5nKCkuZ2V0SGVhZGVyQ29udGV4dCgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gb0NvbnRyb2wuZGF0YShcInJvd3NCaW5kaW5nSW5mb1wiKS5wYXRoLFxuXHRcdFx0XHRcdG9MaXN0QmluZGluZyA9IG5ldyAoT0RhdGFMaXN0QmluZGluZyBhcyBhbnkpKHRoaXMuZ2V0VmlldygpLmdldE1vZGVsKCksIHNCaW5kaW5nUGF0aCk7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmNvbnRleHRzID0gb0xpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHNPdmVybG9hZEVudGl0eVR5cGUgJiYgb0NvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0XHRtUGFyYW1ldGVycy5jb250ZXh0cyA9IHRoaXMuX2dldEFjdGlvbk92ZXJsb2FkQ29udGV4dEZyb21NZXRhZGF0YVBhdGgoXG5cdFx0XHRcdFx0b0NvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoKSxcblx0XHRcdFx0XHRvQ29udHJvbC5nZXRSb3dCaW5kaW5nKCksXG5cdFx0XHRcdFx0c092ZXJsb2FkRW50aXR5VHlwZVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobVBhcmFtZXRlcnMuZW5hYmxlQXV0b1Njcm9sbCkge1xuXHRcdFx0XHRvQ3VycmVudEFjdGlvbkNhbGxCYWNrcyA9IHRoaXMuX2NyZWF0ZUFjdGlvblByb21pc2Uoc0FjdGlvbk5hbWUsIG9Db250cm9sLnNJZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdG1QYXJhbWV0ZXJzLmJHZXRCb3VuZENvbnRleHQgPSB0aGlzLl9nZXRCb3VuZENvbnRleHQob1ZpZXcsIG1QYXJhbWV0ZXJzKTtcblx0XHQvLyBOZWVkIHRvIGtub3cgdGhhdCB0aGUgYWN0aW9uIGlzIGNhbGxlZCBmcm9tIE9iamVjdFBhZ2UgZm9yIGNoYW5nZVNldCBJc29sYXRlZCB3b3JrYXJvdW5kXG5cdFx0bVBhcmFtZXRlcnMuYk9iamVjdFBhZ2UgPSAob1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmNvbnZlcnRlclR5cGUgPT09IFwiT2JqZWN0UGFnZVwiO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGF3YWl0IHRoaXMuX3N5bmNUYXNrKCk7XG5cdFx0XHRjb25zdCBvUmVzcG9uc2UgPSBhd2FpdCB0cmFuc2FjdGlvbkhlbHBlci5jYWxsQWN0aW9uLmJpbmQoXG5cdFx0XHRcdHRyYW5zYWN0aW9uSGVscGVyLFxuXHRcdFx0XHRzQWN0aW9uTmFtZSxcblx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0XHR0aGlzLl9nZXRNZXNzYWdlSGFuZGxlcigpXG5cdFx0XHQpKCk7XG5cdFx0XHRpZiAobVBhcmFtZXRlcnMuY29udGV4dHMpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5fcmVmcmVzaExpc3RJZlJlcXVpcmVkKHRoaXMuX2dldEFjdGlvblJlc3BvbnNlRGF0YUFuZEtleXMoc0FjdGlvbk5hbWUsIG9SZXNwb25zZSksIG1QYXJhbWV0ZXJzLmNvbnRleHRzWzBdKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX3NlbmRBY3Rpdml0eShBY3Rpdml0eS5BY3Rpb24sIG1QYXJhbWV0ZXJzLmNvbnRleHRzKTtcblx0XHRcdHRoaXMuX3RyaWdnZXJDb25maWd1cmVkU3VydmV5KHNBY3Rpb25OYW1lLCBUcmlnZ2VyVHlwZS5hY3Rpb24pO1xuXG5cdFx0XHRpZiAob0N1cnJlbnRBY3Rpb25DYWxsQmFja3MpIHtcblx0XHRcdFx0b0N1cnJlbnRBY3Rpb25DYWxsQmFja3MuZlJlc29sdmVyKG9SZXNwb25zZSk7XG5cdFx0XHR9XG5cdFx0XHQvKlxuXHRcdFx0XHRcdFdlIHNldCB0aGUgKHVwcGVyKSBwYWdlcyB0byBkaXJ0eSBhZnRlciBhbiBleGVjdXRpb24gb2YgYW4gYWN0aW9uXG5cdFx0XHRcdFx0VE9ETzogZ2V0IHJpZCBvZiB0aGlzIHdvcmthcm91bmRcblx0XHRcdFx0XHRUaGlzIHdvcmthcm91bmQgaXMgb25seSBuZWVkZWQgYXMgbG9uZyBhcyB0aGUgbW9kZWwgZG9lcyBub3Qgc3VwcG9ydCB0aGUgc3luY2hyb25pemF0aW9uLlxuXHRcdFx0XHRcdE9uY2UgdGhpcyBpcyBzdXBwb3J0ZWQgd2UgZG9uJ3QgbmVlZCB0byBzZXQgdGhlIHBhZ2VzIHRvIGRpcnR5IGFueW1vcmUgYXMgdGhlIGNvbnRleHQgaXRzZWxmXG5cdFx0XHRcdFx0aXMgYWxyZWFkeSByZWZyZXNoZWQgKGl0J3MganVzdCBub3QgcmVmbGVjdGVkIGluIHRoZSBvYmplY3QgcGFnZSlcblx0XHRcdFx0XHR3ZSBleHBsaWNpdGx5IGRvbid0IGNhbGwgdGhpcyBtZXRob2QgZnJvbSB0aGUgbGlzdCByZXBvcnQgYnV0IG9ubHkgY2FsbCBpdCBmcm9tIHRoZSBvYmplY3QgcGFnZVxuXHRcdFx0XHRcdGFzIGlmIGl0IGlzIGNhbGxlZCBpbiB0aGUgbGlzdCByZXBvcnQgaXQncyBub3QgbmVlZGVkIC0gYXMgd2UgYW55d2F5IHdpbGwgcmVtb3ZlIHRoaXMgbG9naWNcblx0XHRcdFx0XHR3ZSBjYW4gbGl2ZSB3aXRoIHRoaXNcblx0XHRcdFx0XHR3ZSBuZWVkIGEgY29udGV4dCB0byBzZXQgdGhlIHVwcGVyIHBhZ2VzIHRvIGRpcnR5IC0gaWYgdGhlcmUgYXJlIG1vcmUgdGhhbiBvbmUgd2UgdXNlIHRoZVxuXHRcdFx0XHRcdGZpcnN0IG9uZSBhcyB0aGV5IGFyZSBhbnl3YXkgc2libGluZ3Ncblx0XHRcdFx0XHQqL1xuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmNvbnRleHRzKSB7XG5cdFx0XHRcdGlmICghdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRFZGl0U3RhdGUuc2V0RWRpdFN0YXRlRGlydHkoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLl9nZXRJbnRlcm5hbE1vZGVsKCkuc2V0UHJvcGVydHkoXCIvc0N1c3RvbUFjdGlvblwiLCBzQWN0aW9uTmFtZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAobVBhcmFtZXRlcnMuaXNOYXZpZ2FibGUpIHtcblx0XHRcdFx0bGV0IHZDb250ZXh0ID0gb1Jlc3BvbnNlO1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2Q29udGV4dCkgJiYgdkNvbnRleHQubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdFx0dkNvbnRleHQgPSB2Q29udGV4dFswXS52YWx1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAodkNvbnRleHQgJiYgIUFycmF5LmlzQXJyYXkodkNvbnRleHQpKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9WaWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0XHRcdFx0Y29uc3Qgc0NvbnRleHRNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgodkNvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdFx0XHRjb25zdCBfZm5WYWxpZENvbnRleHRzID0gKGNvbnRleHRzOiBhbnksIGFwcGxpY2FibGVDb250ZXh0czogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY29udGV4dHMuZmlsdGVyKChlbGVtZW50OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0aWYgKGFwcGxpY2FibGVDb250ZXh0cykge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBhcHBsaWNhYmxlQ29udGV4dHMuaW5kZXhPZihlbGVtZW50KSA+IC0xO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRjb25zdCBvQWN0aW9uQ29udGV4dCA9IEFycmF5LmlzQXJyYXkobVBhcmFtZXRlcnMuY29udGV4dHMpXG5cdFx0XHRcdFx0XHQ/IF9mblZhbGlkQ29udGV4dHMobVBhcmFtZXRlcnMuY29udGV4dHMsIG1QYXJhbWV0ZXJzLmFwcGxpY2FibGVDb250ZXh0KVswXVxuXHRcdFx0XHRcdFx0OiBtUGFyYW1ldGVycy5jb250ZXh0cztcblx0XHRcdFx0XHRjb25zdCBzQWN0aW9uQ29udGV4dE1ldGFQYXRoID0gb0FjdGlvbkNvbnRleHQgJiYgb01ldGFNb2RlbC5nZXRNZXRhUGF0aChvQWN0aW9uQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0XHRcdGlmIChzQ29udGV4dE1ldGFQYXRoICE9IHVuZGVmaW5lZCAmJiBzQ29udGV4dE1ldGFQYXRoID09PSBzQWN0aW9uQ29udGV4dE1ldGFQYXRoKSB7XG5cdFx0XHRcdFx0XHRpZiAob0FjdGlvbkNvbnRleHQuZ2V0UGF0aCgpICE9PSB2Q29udGV4dC5nZXRQYXRoKCkpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5fZ2V0Um91dGluZ0xpc3RlbmVyKCkubmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0KHZDb250ZXh0LCB7XG5cdFx0XHRcdFx0XHRcdFx0Y2hlY2tOb0hhc2hDaGFuZ2U6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0bm9IaXN0b3J5RW50cnk6IGZhbHNlXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0TG9nLmluZm8oXCJOYXZpZ2F0aW9uIHRvIHRoZSBzYW1lIGNvbnRleHQgaXMgbm90IGFsbG93ZWRcIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb1Jlc3BvbnNlO1xuXHRcdH0gY2F0Y2ggKGVycjogYW55KSB7XG5cdFx0XHRpZiAob0N1cnJlbnRBY3Rpb25DYWxsQmFja3MpIHtcblx0XHRcdFx0b0N1cnJlbnRBY3Rpb25DYWxsQmFja3MuZlJlamVjdG9yKCk7XG5cdFx0XHR9XG5cdFx0XHQvLyBGSVhNRTogaW4gbW9zdCBzaXR1YXRpb25zIHRoZXJlIGlzIG5vIGhhbmRsZXIgZm9yIHRoZSByZWplY3RlZCBwcm9taXNlcyByZXR1cm5lZHFcblx0XHRcdGlmIChlcnIgPT09IENvbnN0YW50cy5DYW5jZWxBY3Rpb25EaWFsb2cpIHtcblx0XHRcdFx0Ly8gVGhpcyBsZWFkcyB0byBjb25zb2xlIGVycm9yLiBBY3R1YWxseSB0aGUgZXJyb3IgaXMgYWxyZWFkeSBoYW5kbGVkIChjdXJyZW50bHkgZGlyZWN0bHkgaW4gcHJlc3MgaGFuZGxlciBvZiBlbmQgYnV0dG9uIGluIGRpYWxvZyksIHNvIGl0IHNob3VsZCBub3QgYmUgZm9yd2FyZGVkXG5cdFx0XHRcdC8vIHVwIHRvIGhlcmUuIEhvd2V2ZXIsIHdoZW4gZGlhbG9nIGhhbmRsaW5nIGFuZCBiYWNrZW5kIGV4ZWN1dGlvbiBhcmUgc2VwYXJhdGVkLCBpbmZvcm1hdGlvbiB3aGV0aGVyIGRpYWxvZyB3YXMgY2FuY2VsbGVkLCBvciBiYWNrZW5kIGV4ZWN1dGlvbiBoYXMgZmFpbGVkIG5lZWRzXG5cdFx0XHRcdC8vIHRvIGJlIHRyYW5zcG9ydGVkIHRvIHRoZSBwbGFjZSByZXNwb25zaWJsZSBmb3IgY29ubmVjdGluZyB0aGVzZSB0d28gdGhpbmdzLlxuXHRcdFx0XHQvLyBUT0RPOiByZW1vdmUgc3BlY2lhbCBoYW5kbGluZyBvbmUgZGlhbG9nIGhhbmRsaW5nIGFuZCBiYWNrZW5kIGV4ZWN1dGlvbiBhcmUgc2VwYXJhdGVkXG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkRpYWxvZyBjYW5jZWxsZWRcIik7XG5cdFx0XHR9IGVsc2UgaWYgKCEoZXJyICYmIChlcnIuY2FuY2VsZWQgfHwgKGVyci5yZWplY3RlZEl0ZW1zICYmIGVyci5yZWplY3RlZEl0ZW1zWzBdLmNhbmNlbGVkKSkpKSB7XG5cdFx0XHRcdC8vIFRPRE86IGFuYWx5emUsIHdoZXRoZXIgdGhpcyBpcyBvZiB0aGUgc2FtZSBjYXRlZ29yeSBhcyBhYm92ZVxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYEVycm9yIGluIEVkaXRGbG93Lmludm9rZUFjdGlvbjoke2Vycn1gKTtcblx0XHRcdH1cblx0XHRcdC8vIFRPRE86IEFueSB1bmV4cGVjdGVkIGVycm9ycyBwcm9iYWJseSBzaG91bGQgbm90IGJlIGlnbm9yZWQhXG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFNlY3VyZWQgZXhlY3V0aW9uIG9mIHRoZSBnaXZlbiBmdW5jdGlvbi4gRW5zdXJlcyB0aGF0IHRoZSBmdW5jdGlvbiBpcyBvbmx5IGV4ZWN1dGVkIHdoZW4gY2VydGFpbiBjb25kaXRpb25zIGFyZSBmdWxmaWxsZWQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gZm5GdW5jdGlvbiBUaGUgZnVuY3Rpb24gdG8gYmUgZXhlY3V0ZWQuIFNob3VsZCByZXR1cm4gYSBwcm9taXNlIHRoYXQgaXMgc2V0dGxlZCBhZnRlciBjb21wbGV0aW9uIG9mIHRoZSBleGVjdXRpb24uIElmIG5vdGhpbmcgaXMgcmV0dXJuZWQsIGltbWVkaWF0ZSBjb21wbGV0aW9uIGlzIGFzc3VtZWQuXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBEZWZpbml0aW9ucyBvZiB0aGUgcHJlY29uZGl0aW9ucyB0byBiZSBjaGVja2VkIGJlZm9yZSBleGVjdXRpb25cblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLmJ1c3kgRGVmaW5lcyB0aGUgYnVzeSBpbmRpY2F0b3Jcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLmJ1c3kuc2V0IFRyaWdnZXJzIGEgYnVzeSBpbmRpY2F0b3Igd2hlbiB0aGUgZnVuY3Rpb24gaXMgZXhlY3V0ZWQuXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5idXN5LmNoZWNrIEV4ZWN1dGVzIGZ1bmN0aW9uIG9ubHkgaWYgYXBwbGljYXRpb24gaXNuJ3QgYnVzeS5cblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLnVwZGF0ZXNEb2N1bWVudCBUaGlzIG9wZXJhdGlvbiB1cGRhdGVzIHRoZSBjdXJyZW50IGRvY3VtZW50IHdpdGhvdXQgdXNpbmcgdGhlIGJvdW5kIG1vZGVsIGFuZCBjb250ZXh0LiBBcyBhIHJlc3VsdCwgdGhlIGRyYWZ0IHN0YXR1cyBpcyB1cGRhdGVkIGlmIGEgZHJhZnQgZG9jdW1lbnQgZXhpc3RzLCBhbmQgdGhlIHVzZXIgaGFzIHRvIGNvbmZpcm0gdGhlIGNhbmNlbGxhdGlvbiBvZiB0aGUgZWRpdGluZyBwcm9jZXNzLlxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCBpcyByZWplY3RlZCBpZiB0aGUgZXhlY3V0aW9uIGlzIHByb2hpYml0ZWQgYW5kIHJlc29sdmVkIGJ5IHRoZSBwcm9taXNlIHJldHVybmVkIGJ5IHRoZSBmbkZ1bmN0aW9uLlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3cjc2VjdXJlZEV4ZWN1dGlvblxuXHQgKiBAcHVibGljXG5cdCAqIEBleHBlcmltZW50YWwgQXMgb2YgdmVyc2lvbiAxLjkwLjBcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHNlY3VyZWRFeGVjdXRpb24oXG5cdFx0Zm5GdW5jdGlvbjogRnVuY3Rpb24sXG5cdFx0bVBhcmFtZXRlcnM/OiB7XG5cdFx0XHRidXN5Pzoge1xuXHRcdFx0XHRzZXQ/OiBib29sZWFuO1xuXHRcdFx0XHRjaGVjaz86IGJvb2xlYW47XG5cdFx0XHR9O1xuXHRcdFx0dXBkYXRlc0RvY3VtZW50PzogYm9vbGVhbjtcblx0XHR9XG5cdCk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGJCdXN5U2V0ID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuYnVzeSAmJiBtUGFyYW1ldGVycy5idXN5LnNldCAhPT0gdW5kZWZpbmVkID8gbVBhcmFtZXRlcnMuYnVzeS5zZXQgOiB0cnVlLFxuXHRcdFx0YkJ1c3lDaGVjayA9IG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmJ1c3kgJiYgbVBhcmFtZXRlcnMuYnVzeS5jaGVjayAhPT0gdW5kZWZpbmVkID8gbVBhcmFtZXRlcnMuYnVzeS5jaGVjayA6IHRydWUsXG5cdFx0XHRiVXBkYXRlc0RvY3VtZW50ID0gKG1QYXJhbWV0ZXJzICYmIChtUGFyYW1ldGVycyBhcyBhbnkpLnVwZGF0ZXNEb2N1bWVudCkgfHwgZmFsc2UsXG5cdFx0XHRvTG9ja09iamVjdCA9IHRoaXMuX2dldEdsb2JhbFVJTW9kZWwoKSxcblx0XHRcdG9Db250ZXh0ID0gdGhpcy5iYXNlLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpLFxuXHRcdFx0YklzRHJhZnQgPSBvQ29udGV4dCAmJiB0aGlzLl9nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KSA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdDtcblxuXHRcdGlmIChiQnVzeUNoZWNrICYmIEJ1c3lMb2NrZXIuaXNMb2NrZWQob0xvY2tPYmplY3QpKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoXCJBcHBsaWNhdGlvbiBhbHJlYWR5IGJ1c3kgdGhlcmVmb3JlIGV4ZWN1dGlvbiByZWplY3RlZFwiKTtcblx0XHR9XG5cblx0XHQvLyB3ZSBoYXZlIHRvIHNldCBidXN5IGFuZCBkcmFmdCBpbmRpY2F0b3IgaW1tZWRpYXRlbHkgYWxzbyB0aGUgZnVuY3Rpb24gbWlnaHQgYmUgZXhlY3V0ZWQgbGF0ZXIgaW4gcXVldWVcblx0XHRpZiAoYkJ1c3lTZXQpIHtcblx0XHRcdEJ1c3lMb2NrZXIubG9jayhvTG9ja09iamVjdCk7XG5cdFx0fVxuXHRcdGlmIChiVXBkYXRlc0RvY3VtZW50ICYmIGJJc0RyYWZ0KSB7XG5cdFx0XHR0aGlzLl9zZXREcmFmdFN0YXR1cyhEcmFmdFN0YXR1cy5TYXZpbmcpO1xuXHRcdH1cblxuXHRcdHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKCkucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cblx0XHRyZXR1cm4gdGhpcy5fc3luY1Rhc2soZm5GdW5jdGlvbilcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0aWYgKGJVcGRhdGVzRG9jdW1lbnQpIHtcblx0XHRcdFx0XHR0aGlzLl9nZXRUcmFuc2FjdGlvbkhlbHBlcigpLmhhbmRsZURvY3VtZW50TW9kaWZpY2F0aW9ucygpO1xuXHRcdFx0XHRcdGlmICghdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdFx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoYklzRHJhZnQpIHtcblx0XHRcdFx0XHRcdHRoaXMuX3NldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLlNhdmVkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goKG9FcnJvcjogYW55KSA9PiB7XG5cdFx0XHRcdGlmIChiVXBkYXRlc0RvY3VtZW50ICYmIGJJc0RyYWZ0KSB7XG5cdFx0XHRcdFx0dGhpcy5fc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuQ2xlYXIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChvRXJyb3IpO1xuXHRcdFx0fSlcblx0XHRcdC5maW5hbGx5KCgpID0+IHtcblx0XHRcdFx0aWYgKGJCdXN5U2V0KSB7XG5cdFx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob0xvY2tPYmplY3QpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKCkuc2hvd01lc3NhZ2VEaWFsb2coKTtcblx0XHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEhhbmRsZXMgdGhlIHBhdGNoU2VudCBldmVudDogcmVnaXN0ZXIgZG9jdW1lbnQgbW9kaWZpY2F0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0V2ZW50XG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0aGFuZGxlUGF0Y2hTZW50KG9FdmVudDogYW55KSB7XG5cdFx0aWYgKCEodGhpcy5iYXNlLmdldFZpZXcoKT8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCk/LmdldFByb3BlcnR5KFwic2tpcFBhdGNoSGFuZGxlcnNcIikpIHtcblx0XHRcdC8vIENyZWF0ZSBhIHByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIG9yIHJlamVjdGVkIHdoZW4gdGhlIHBhdGggaXMgY29tcGxldGVkXG5cdFx0XHRjb25zdCBvUGF0Y2hQcm9taXNlID0gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0XHRvRXZlbnQuZ2V0U291cmNlKCkuYXR0YWNoRXZlbnRPbmNlKFwicGF0Y2hDb21wbGV0ZWRcIiwgKHBhdGNoQ29tcGxldGVkRXZlbnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdGlmIChvRXZlbnQuZ2V0U291cmNlKCkuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTGlzdEJpbmRpbmdcIikpIHtcblx0XHRcdFx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudEFmdGVyUGF0Y2goXG5cdFx0XHRcdFx0XHRcdHRoaXMuYmFzZS5nZXRWaWV3KCksXG5cdFx0XHRcdFx0XHRcdG9FdmVudC5nZXRTb3VyY2UoKSxcblx0XHRcdFx0XHRcdFx0dGhpcy5iYXNlLmdldFZpZXcoKT8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgYlN1Y2Nlc3MgPSBwYXRjaENvbXBsZXRlZEV2ZW50LmdldFBhcmFtZXRlcihcInN1Y2Nlc3NcIik7XG5cdFx0XHRcdFx0aWYgKGJTdWNjZXNzKSB7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJlamVjdCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9KTtcblx0XHRcdHRoaXMudXBkYXRlRG9jdW1lbnQob0V2ZW50LmdldFNvdXJjZSgpLCBvUGF0Y2hQcm9taXNlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogSGFuZGxlcyB0aGUgQ3JlYXRlQWN0aXZhdGUgZXZlbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRXZlbnRcblx0ICovXG5cdGhhbmRsZUNyZWF0ZUFjdGl2YXRlKG9FdmVudDogYW55KSB7XG5cdFx0Y29uc3Qgb0JpbmRpbmcgPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0Y29uc3QgdHJhbnNhY3Rpb25IZWxwZXIgPSB0aGlzLl9nZXRUcmFuc2FjdGlvbkhlbHBlcigpO1xuXHRcdGNvbnN0IGJBdEVuZCA9IHRydWU7XG5cdFx0Y29uc3QgYkluYWN0aXZlID0gdHJ1ZTtcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSB0aGlzLl9nZXRSZXNvdXJjZUJ1bmRsZSgpO1xuXHRcdGNvbnN0IG9QYXJhbXM6IGFueSA9IHtcblx0XHRcdGNyZWF0aW9uTW9kZTogQ3JlYXRpb25Nb2RlLklubGluZSxcblx0XHRcdGNyZWF0ZUF0RW5kOiBiQXRFbmQsXG5cdFx0XHRpbmFjdGl2ZTogYkluYWN0aXZlLFxuXHRcdFx0a2VlcFRyYW5zaWVudENvbnRleHRPbkZhaWxlZDogZmFsc2UsIC8vIGN1cnJlbnRseSBub3QgZnVsbHkgc3VwcG9ydGVkXG5cdFx0XHRidXN5TW9kZTogXCJOb25lXCJcblx0XHR9O1xuXHRcdHRyYW5zYWN0aW9uSGVscGVyLmNyZWF0ZURvY3VtZW50KG9CaW5kaW5nLCBvUGFyYW1zLCBvUmVzb3VyY2VCdW5kbGUsIHRoaXMuX2dldE1lc3NhZ2VIYW5kbGVyKCksIGZhbHNlLCB0aGlzLmdldFZpZXcoKSk7XG5cdH1cblxuXHQvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLyBQcml2YXRlIG1ldGhvZHNcblx0Ly8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuXHQvKlxuXHRcdFx0IFRPIEJFIENIRUNLRUQgLyBESVNDVVNTRURcblx0XHRcdCBfY3JlYXRlTXVsdGlwbGVEb2N1bWVudHMgYW5kIGRlbGV0ZU11bHRpRG9jdW1lbnQgLSBjb3VsZG4ndCB3ZSBjb21iaW5lIHRoZW0gd2l0aCBjcmVhdGUgYW5kIGRlbGV0ZSBkb2N1bWVudD9cblx0XHRcdCBfY3JlYXRlQWN0aW9uUHJvbWlzZSBhbmQgZGVsZXRlQ3VycmVudEFjdGlvblByb21pc2UgLT4gbmV4dCBzdGVwXG5cblx0XHRcdCAqL1xuXG5cdF9zZXRFZGl0TW9kZShzRWRpdE1vZGU6IGFueSwgYkNyZWF0aW9uTW9kZT86IGJvb2xlYW4pIHtcblx0XHQodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLl9lZGl0Rmxvdy5zZXRFZGl0TW9kZShzRWRpdE1vZGUsIGJDcmVhdGlvbk1vZGUpO1xuXHR9XG5cblx0X3NldERyYWZ0U3RhdHVzKHNEcmFmdFN0YXRlOiBhbnkpIHtcblx0XHQodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLl9lZGl0Rmxvdy5zZXREcmFmdFN0YXR1cyhzRHJhZnRTdGF0ZSk7XG5cdH1cblxuXHRfZ2V0Um91dGluZ0xpc3RlbmVyKCkge1xuXHRcdHJldHVybiAodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLl9lZGl0Rmxvdy5nZXRSb3V0aW5nTGlzdGVuZXIoKTtcblx0fVxuXG5cdF9nZXRHbG9iYWxVSU1vZGVsKCkge1xuXHRcdHJldHVybiAodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLl9lZGl0Rmxvdy5nZXRHbG9iYWxVSU1vZGVsKCk7XG5cdH1cblx0X3N5bmNUYXNrKHZUYXNrPzogYW55KSB7XG5cdFx0cmV0dXJuICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX2VkaXRGbG93LnN5bmNUYXNrKHZUYXNrKTtcblx0fVxuXG5cdF9nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gKHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKS5fZWRpdEZsb3cuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQ29udGV4dCk7XG5cdH1cblxuXHRfZGVsZXRlRG9jdW1lbnRUcmFuc2FjdGlvbihvQ29udGV4dDogYW55LCBtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0cmV0dXJuICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX2VkaXRGbG93LmRlbGV0ZURvY3VtZW50VHJhbnNhY3Rpb24ob0NvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0fVxuXG5cdF9oYW5kbGVDcmVhdGVFdmVudHMob0JpbmRpbmc6IGFueSkge1xuXHRcdCh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX2VkaXRGbG93LmhhbmRsZUNyZWF0ZUV2ZW50cyhvQmluZGluZyk7XG5cdH1cblxuXHRfZ2V0VHJhbnNhY3Rpb25IZWxwZXIoKSB7XG5cdFx0cmV0dXJuICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX2VkaXRGbG93LmdldFRyYW5zYWN0aW9uSGVscGVyKCk7XG5cdH1cblxuXHRfZ2V0SW50ZXJuYWxNb2RlbCgpIHtcblx0XHRyZXR1cm4gKHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKS5fZWRpdEZsb3cuZ2V0SW50ZXJuYWxNb2RlbCgpO1xuXHR9XG5cblx0X2dldFJvb3RWaWV3Q29udHJvbGxlcigpIHtcblx0XHRyZXR1cm4gdGhpcy5iYXNlLmdldEFwcENvbXBvbmVudCgpLmdldFJvb3RWaWV3Q29udHJvbGxlcigpO1xuXHR9XG5cblx0X2dldFJlc291cmNlQnVuZGxlKCkge1xuXHRcdHJldHVybiAodGhpcy5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkub1Jlc291cmNlQnVuZGxlO1xuXHR9XG5cblx0X2dldFNlbWFudGljTWFwcGluZygpOiBTZW1hbnRpY01hcHBpbmcgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLmJhc2UuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGluZ1NlcnZpY2UoKS5nZXRMYXN0U2VtYW50aWNNYXBwaW5nKCk7XG5cdH1cblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIG5ldyBwcm9taXNlIHRvIHdhaXQgZm9yIGFuIGFjdGlvbiB0byBiZSBleGVjdXRlZFxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgX2NyZWF0ZUFjdGlvblByb21pc2Vcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEByZXR1cm5zIHtGdW5jdGlvbn0gVGhlIHJlc29sdmVyIGZ1bmN0aW9uIHdoaWNoIGNhbiBiZSB1c2VkIHRvIGV4dGVybmFsbHkgcmVzb2x2ZSB0aGUgcHJvbWlzZVxuXHQgKi9cblxuXHRfY3JlYXRlQWN0aW9uUHJvbWlzZShzQWN0aW9uTmFtZTogYW55LCBzQ29udHJvbElkOiBhbnkpIHtcblx0XHRyZXR1cm4gKHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKS5fZWRpdEZsb3cuY3JlYXRlQWN0aW9uUHJvbWlzZShzQWN0aW9uTmFtZSwgc0NvbnRyb2xJZCk7XG5cdH1cblxuXHRfZ2V0Q3VycmVudEFjdGlvblByb21pc2UoKSB7XG5cdFx0cmV0dXJuICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX2VkaXRGbG93LmdldEN1cnJlbnRBY3Rpb25Qcm9taXNlKCk7XG5cdH1cblxuXHRfZGVsZXRlQ3VycmVudEFjdGlvblByb21pc2UoKSB7XG5cdFx0cmV0dXJuICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX2VkaXRGbG93LmRlbGV0ZUN1cnJlbnRBY3Rpb25Qcm9taXNlKCk7XG5cdH1cblxuXHRfZ2V0TWVzc2FnZUhhbmRsZXIoKSB7XG5cdFx0cmV0dXJuICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikuX2VkaXRGbG93LmdldE1lc3NhZ2VIYW5kbGVyKCk7XG5cdH1cblxuXHRfc2VuZEFjdGl2aXR5KGFjdGlvbjogQWN0aXZpdHksIHJlbGF0ZWRDb250ZXh0czogQ29udGV4dCB8IENvbnRleHRbXSB8IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IGNvbnRlbnQgPSBBcnJheS5pc0FycmF5KHJlbGF0ZWRDb250ZXh0cykgPyByZWxhdGVkQ29udGV4dHMubWFwKChjb250ZXh0KSA9PiBjb250ZXh0LmdldFBhdGgoKSkgOiByZWxhdGVkQ29udGV4dHM/LmdldFBhdGgoKTtcblx0XHRzZW5kKHRoaXMuZ2V0VmlldygpLCBhY3Rpb24sIGNvbnRlbnQpO1xuXHR9XG5cblx0X3RyaWdnZXJDb25maWd1cmVkU3VydmV5KHNBY3Rpb25OYW1lOiBzdHJpbmcsIHRyaWdnZXJUeXBlOiBUcmlnZ2VyVHlwZSkge1xuXHRcdHRyaWdnZXJDb25maWd1cmVkU3VydmV5KHRoaXMuZ2V0VmlldygpLCBzQWN0aW9uTmFtZSwgdHJpZ2dlclR5cGUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfZ2V0QWN0aW9uUmVzcG9uc2VEYXRhQW5kS2V5c1xuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuRWRpdEZsb3dcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdGhhdCBpcyBleGVjdXRlZFxuXHQgKiBAcGFyYW0gb1Jlc3BvbnNlIFRoZSBib3VuZCBhY3Rpb24ncyByZXNwb25zZSBkYXRhIG9yIHJlc3BvbnNlIGNvbnRleHRcblx0ICogQHJldHVybnMgT2JqZWN0IHdpdGggZGF0YSBhbmQgbmFtZXMgb2YgdGhlIGtleSBmaWVsZHMgb2YgdGhlIHJlc3BvbnNlXG5cdCAqL1xuXHRfZ2V0QWN0aW9uUmVzcG9uc2VEYXRhQW5kS2V5cyhzQWN0aW9uTmFtZTogc3RyaW5nLCBvUmVzcG9uc2U6IG9iamVjdCkge1xuXHRcdHJldHVybiAodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLl9lZGl0Rmxvdy5nZXRBY3Rpb25SZXNwb25zZURhdGFBbmRLZXlzKHNBY3Rpb25OYW1lLCBvUmVzcG9uc2UpO1xuXHR9XG5cblx0YXN5bmMgX3N1Ym1pdE9wZW5DaGFuZ2VzKG9Db250ZXh0OiBhbnkpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRvTG9ja09iamVjdCA9IHRoaXMuX2dldEdsb2JhbFVJTW9kZWwoKTtcblxuXHRcdHRyeSB7XG5cdFx0XHQvLyBTdWJtaXQgYW55IGxlZnRvdmVyIGNoYW5nZXMgdGhhdCBhcmUgbm90IHlldCBzdWJtaXR0ZWRcblx0XHRcdC8vIEN1cnJlbnRseSB3ZSBhcmUgdXNpbmcgb25seSAxIHVwZGF0ZUdyb3VwSWQsIGhlbmNlIHN1Ym1pdHRpbmcgdGhlIGJhdGNoIGRpcmVjdGx5IGhlcmVcblx0XHRcdGF3YWl0IG9Nb2RlbC5zdWJtaXRCYXRjaChcIiRhdXRvXCIpO1xuXG5cdFx0XHQvLyBXYWl0IGZvciBhbGwgY3VycmVudGx5IHJ1bm5pbmcgY2hhbmdlc1xuXHRcdFx0Ly8gRm9yIHRoZSB0aW1lIGJlaW5nIHdlIGFncmVlZCB3aXRoIHRoZSB2NCBtb2RlbCB0ZWFtIHRvIHVzZSBhbiBpbnRlcm5hbCBtZXRob2QuIFdlJ2xsIHJlcGxhY2UgaXQgb25jZVxuXHRcdFx0Ly8gYSBwdWJsaWMgb3IgcmVzdHJpY3RlZCBtZXRob2Qgd2FzIHByb3ZpZGVkXG5cdFx0XHRhd2FpdCBvTW9kZWwub1JlcXVlc3Rvci53YWl0Rm9yUnVubmluZ0NoYW5nZVJlcXVlc3RzKFwiJGF1dG9cIik7XG5cblx0XHRcdC8vIENoZWNrIGlmIGFsbCBjaGFuZ2VzIHdlcmUgc3VibWl0dGVkIHN1Y2Nlc3NmdWxseVxuXHRcdFx0aWYgKG9Nb2RlbC5oYXNQZW5kaW5nQ2hhbmdlcyhcIiRhdXRvXCIpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcInN1Ym1pdCBvZiBvcGVuIGNoYW5nZXMgZmFpbGVkXCIpO1xuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvTG9ja09iamVjdCkpIHtcblx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob0xvY2tPYmplY3QpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdF9oYW5kbGVTdGlja3lPbihvQ29udGV4dDogQ29udGV4dCkge1xuXHRcdHJldHVybiAodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLl9lZGl0Rmxvdy5oYW5kbGVTdGlja3lPbihvQ29udGV4dCk7XG5cdH1cblxuXHRfaGFuZGxlU3RpY2t5T2ZmKCkge1xuXHRcdHJldHVybiAodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLl9lZGl0Rmxvdy5oYW5kbGVTdGlja3lPZmYoKTtcblx0fVxuXG5cdF9vbkJhY2tOYXZpZ2F0aW9uSW5TZXNzaW9uKCkge1xuXHRcdHJldHVybiAodGhpcy5iYXNlLmdldFZpZXcoKS5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLl9lZGl0Rmxvdy5vbkJhY2tOYXZpZ2F0aW9uSW5TZXNzaW9uKCk7XG5cdH1cblxuXHRfZGlzY2FyZFN0aWNreVNlc3Npb24ob0NvbnRleHQ6IENvbnRleHQpIHtcblx0XHRyZXR1cm4gKHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKS5fZWRpdEZsb3cuZGlzY2FyZFN0aWNreVNlc3Npb24ob0NvbnRleHQpO1xuXHR9XG5cblx0X3NldFN0aWNreVNlc3Npb25JbnRlcm5hbFByb3BlcnRpZXMocHJvZ3JhbW1pbmdNb2RlbDogYW55LCBtb2RlbDogT0RhdGFNb2RlbCkge1xuXHRcdGlmIChwcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSkge1xuXHRcdFx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IHRoaXMuX2dldEludGVybmFsTW9kZWwoKTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvc2Vzc2lvbk9uXCIsIHRydWUpO1xuXHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcIi9zdGlja3lTZXNzaW9uVG9rZW5cIiwgKG1vZGVsLmdldEh0dHBIZWFkZXJzKHRydWUpIGFzIGFueSlbXCJTQVAtQ29udGV4dElkXCJdKTtcblx0XHR9XG5cdH1cblxuXHRfcmVtb3ZlU3RpY2t5U2Vzc2lvbkludGVybmFsUHJvcGVydGllcyhwcm9ncmFtbWluZ01vZGVsOiBhbnkpIHtcblx0XHRpZiAocHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5TdGlja3kpIHtcblx0XHRcdGNvbnN0IGludGVybmFsTW9kZWwgPSB0aGlzLl9nZXRJbnRlcm5hbE1vZGVsKCk7XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3Nlc3Npb25PblwiLCBmYWxzZSk7XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiL3N0aWNreVNlc3Npb25Ub2tlblwiLCB1bmRlZmluZWQpO1xuXHRcdFx0dGhpcy5faGFuZGxlU3RpY2t5T2ZmKC8qb0NvbnRleHQqLyk7XG5cdFx0fVxuXHR9XG5cblx0YXN5bmMgX2hhbmRsZU5ld0NvbnRleHQoXG5cdFx0b0NvbnRleHQ6IENvbnRleHQsXG5cdFx0YkVkaXRhYmxlOiBib29sZWFuLFxuXHRcdGJSZWNyZWF0ZUNvbnRleHQ6IGJvb2xlYW4sXG5cdFx0YkRyYWZ0TmF2aWdhdGlvbjogYm9vbGVhbixcblx0XHRiRm9yY2VGb2N1cyA9IGZhbHNlXG5cdCkge1xuXHRcdGlmICghdGhpcy5faXNGY2xFbmFibGVkKCkpIHtcblx0XHRcdEVkaXRTdGF0ZS5zZXRFZGl0U3RhdGVEaXJ0eSgpO1xuXHRcdH1cblxuXHRcdGF3YWl0IHRoaXMuX2dldFJvdXRpbmdMaXN0ZW5lcigpLm5hdmlnYXRlVG9Db250ZXh0KG9Db250ZXh0LCB7XG5cdFx0XHRjaGVja05vSGFzaENoYW5nZTogdHJ1ZSxcblx0XHRcdGVkaXRhYmxlOiBiRWRpdGFibGUsXG5cdFx0XHRiUGVyc2lzdE9QU2Nyb2xsOiB0cnVlLFxuXHRcdFx0YlJlY3JlYXRlQ29udGV4dDogYlJlY3JlYXRlQ29udGV4dCxcblx0XHRcdGJEcmFmdE5hdmlnYXRpb246IGJEcmFmdE5hdmlnYXRpb24sXG5cdFx0XHRzaG93UGxhY2Vob2xkZXI6IGZhbHNlLFxuXHRcdFx0YkZvcmNlRm9jdXM6IGJGb3JjZUZvY3VzLFxuXHRcdFx0a2VlcEN1cnJlbnRMYXlvdXQ6IHRydWVcblx0XHR9KTtcblx0fVxuXG5cdF9nZXRCb3VuZENvbnRleHQodmlldzogYW55LCBwYXJhbXM6IGFueSkge1xuXHRcdGNvbnN0IHZpZXdMZXZlbCA9IHZpZXcuZ2V0Vmlld0RhdGEoKS52aWV3TGV2ZWw7XG5cdFx0Y29uc3QgYlJlZnJlc2hBZnRlckFjdGlvbiA9IHZpZXdMZXZlbCA+IDEgfHwgKHZpZXdMZXZlbCA9PT0gMSAmJiBwYXJhbXMuY29udHJvbElkKTtcblx0XHRyZXR1cm4gIXBhcmFtcy5pc05hdmlnYWJsZSB8fCAhIWJSZWZyZXNoQWZ0ZXJBY3Rpb247XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZXJlIGFyZSB2YWxpZGF0aW9uIChwYXJzZSkgZXJyb3JzIGZvciBjb250cm9scyBib3VuZCB0byBhIGdpdmVuIGNvbnRleHRcblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIF9jaGVja0ZvclZhbGlkYXRpb25FcnJvcnNcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkVkaXRGbG93XG5cdCAqIEByZXR1cm5zIHtQcm9taXNlfSBQcm9taXNlIHJlc29sdmVzIGlmIHRoZXJlIGFyZSBubyB2YWxpZGF0aW9uIGVycm9ycywgYW5kIHJlamVjdHMgaWYgdGhlcmUgYXJlIHZhbGlkYXRpb24gZXJyb3JzXG5cdCAqL1xuXG5cdF9jaGVja0ZvclZhbGlkYXRpb25FcnJvcnMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX3N5bmNUYXNrKCkudGhlbigoKSA9PiB7XG5cdFx0XHRjb25zdCBzVmlld0lkID0gdGhpcy5iYXNlLmdldFZpZXcoKS5nZXRJZCgpO1xuXHRcdFx0Y29uc3QgYU1lc3NhZ2VzID0gc2FwLnVpLmdldENvcmUoKS5nZXRNZXNzYWdlTWFuYWdlcigpLmdldE1lc3NhZ2VNb2RlbCgpLmdldERhdGEoKTtcblx0XHRcdGxldCBvQ29udHJvbDtcblx0XHRcdGxldCBvTWVzc2FnZTtcblxuXHRcdFx0aWYgKCFhTWVzc2FnZXMubGVuZ3RoKSB7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoXCJObyB2YWxpZGF0aW9uIGVycm9ycyBmb3VuZFwiKTtcblx0XHRcdH1cblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTWVzc2FnZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0b01lc3NhZ2UgPSBhTWVzc2FnZXNbaV07XG5cdFx0XHRcdGlmIChvTWVzc2FnZS52YWxpZGF0aW9uKSB7XG5cdFx0XHRcdFx0b0NvbnRyb2wgPSBDb3JlLmJ5SWQob01lc3NhZ2UuZ2V0Q29udHJvbElkKCkpO1xuXHRcdFx0XHRcdHdoaWxlIChvQ29udHJvbCkge1xuXHRcdFx0XHRcdFx0aWYgKG9Db250cm9sLmdldElkKCkgPT09IHNWaWV3SWQpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KFwidmFsaWRhdGlvbiBlcnJvcnMgZXhpc3RcIik7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvQ29udHJvbCA9IG9Db250cm9sLmdldFBhcmVudCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfcmVmcmVzaExpc3RJZlJlcXVpcmVkXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5FZGl0Rmxvd1xuXHQgKiBAcGFyYW0gb1Jlc3BvbnNlIFRoZSByZXNwb25zZSBvZiB0aGUgYm91bmQgYWN0aW9uIGFuZCB0aGUgbmFtZXMgb2YgdGhlIGtleSBmaWVsZHNcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBib3VuZCBjb250ZXh0IG9uIHdoaWNoIHRoZSBhY3Rpb24gd2FzIGV4ZWN1dGVkXG5cdCAqIEByZXR1cm5zIEFsd2F5cyByZXNvbHZlcyB0byBwYXJhbSBvUmVzcG9uc2Vcblx0ICovXG5cdF9yZWZyZXNoTGlzdElmUmVxdWlyZWQob1Jlc3BvbnNlOiBhbnksIG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0aWYgKCFvQ29udGV4dCB8fCAhb1Jlc3BvbnNlIHx8ICFvUmVzcG9uc2Uub0RhdGEpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9XG5cdFx0Y29uc3Qgb0JpbmRpbmcgPSBvQ29udGV4dC5nZXRCaW5kaW5nKCk7XG5cdFx0Ly8gcmVmcmVzaCBvbmx5IGxpc3RzXG5cdFx0aWYgKG9CaW5kaW5nICYmIG9CaW5kaW5nLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpKSB7XG5cdFx0XHRjb25zdCBvQ29udGV4dERhdGEgPSBvUmVzcG9uc2Uub0RhdGE7XG5cdFx0XHRjb25zdCBhS2V5cyA9IG9SZXNwb25zZS5rZXlzO1xuXHRcdFx0Y29uc3Qgb0N1cnJlbnREYXRhID0gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRsZXQgYlJldHVybmVkQ29udGV4dElzU2FtZSA9IHRydWU7XG5cdFx0XHQvLyBlbnN1cmUgY29udGV4dCBpcyBpbiB0aGUgcmVzcG9uc2Vcblx0XHRcdGlmIChPYmplY3Qua2V5cyhvQ29udGV4dERhdGEpLmxlbmd0aCkge1xuXHRcdFx0XHQvLyBjaGVjayBpZiBjb250ZXh0IGluIHJlc3BvbnNlIGlzIGRpZmZlcmVudCB0aGFuIHRoZSBib3VuZCBjb250ZXh0XG5cdFx0XHRcdGJSZXR1cm5lZENvbnRleHRJc1NhbWUgPSBhS2V5cy5ldmVyeShmdW5jdGlvbiAoc0tleTogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9DdXJyZW50RGF0YVtzS2V5XSA9PT0gb0NvbnRleHREYXRhW3NLZXldO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0aWYgKCFiUmV0dXJuZWRDb250ZXh0SXNTYW1lKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlKSA9PiB7XG5cdFx0XHRcdFx0XHRpZiAoKG9CaW5kaW5nIGFzIGFueSkuaXNSb290KCkpIHtcblx0XHRcdFx0XHRcdFx0b0JpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwiZGF0YVJlY2VpdmVkXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRvQmluZGluZy5yZWZyZXNoKCk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuZ2V0VmlldygpKTtcblx0XHRcdFx0XHRcdFx0b0FwcENvbXBvbmVudFxuXHRcdFx0XHRcdFx0XHRcdC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKVxuXHRcdFx0XHRcdFx0XHRcdC5yZXF1ZXN0U2lkZUVmZmVjdHMoW3sgJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IG9CaW5kaW5nLmdldFBhdGgoKSB9XSwgb0JpbmRpbmcuZ2V0Q29udGV4dCgpIGFzIENvbnRleHQpXG5cdFx0XHRcdFx0XHRcdFx0LnRoZW4oXG5cdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlZnJlc2hpbmcgdGhlIHRhYmxlXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZWZyZXNoaW5nIHRoZSB0YWJsZVwiLCBlKTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyByZXNvbHZlIHdpdGggb1Jlc3BvbnNlIHRvIG5vdCBkaXN0dXJiIHRoZSBwcm9taXNlIGNoYWluIGFmdGVyd2FyZHNcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblxuXHRfZmV0Y2hTZW1hbnRpY0tleVZhbHVlcyhvQ29udGV4dDogQ29udGV4dCk6IFByb21pc2U8YW55PiB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgYW55LFxuXHRcdFx0c0VudGl0eVNldE5hbWUgPSBvTWV0YU1vZGVsLmdldE1ldGFDb250ZXh0KG9Db250ZXh0LmdldFBhdGgoKSkuZ2V0T2JqZWN0KFwiQHNhcHVpLm5hbWVcIiksXG5cdFx0XHRhU2VtYW50aWNLZXlzID0gU2VtYW50aWNLZXlIZWxwZXIuZ2V0U2VtYW50aWNLZXlzKG9NZXRhTW9kZWwsIHNFbnRpdHlTZXROYW1lKTtcblxuXHRcdGlmIChhU2VtYW50aWNLZXlzICYmIGFTZW1hbnRpY0tleXMubGVuZ3RoKSB7XG5cdFx0XHRjb25zdCBhUmVxdWVzdFByb21pc2VzID0gYVNlbWFudGljS2V5cy5tYXAoZnVuY3Rpb24gKG9LZXk6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRleHQucmVxdWVzdE9iamVjdChvS2V5LiRQcm9wZXJ0eVBhdGgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdHJldHVybiBQcm9taXNlLmFsbChhUmVxdWVzdFByb21pc2VzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBQcm92aWRlcyB0aGUgbGF0ZXN0IGNvbnRleHQgaW4gdGhlIG1ldGFkYXRhIGhpZXJhcmNoeSBmcm9tIHJvb3RCaW5kaW5nIHRvIGdpdmVuIGNvbnRleHQgcG9pbnRpbmcgdG8gZ2l2ZW4gZW50aXR5VHlwZVxuXHQgKiBpZiBhbnkgc3VjaCBjb250ZXh0IGV4aXN0cy4gT3RoZXJ3aXNlLCBpdCByZXR1cm5zIHRoZSBvcmlnaW5hbCBjb250ZXh0LlxuXHQgKiBOb3RlOiBJdCBpcyBvbmx5IG5lZWRlZCBhcyB3b3JrLWFyb3VuZCBmb3IgaW5jb3JyZWN0IG1vZGVsbGluZy4gQ29ycmVjdCBtb2RlbGxpbmcgd291bGQgaW1wbHkgYSBEYXRhRmllbGRGb3JBY3Rpb24gaW4gYSBMaW5lSXRlbVxuXHQgKiB0byBwb2ludCB0byBhbiBvdmVybG9hZCBkZWZpbmVkIGVpdGhlciBvbiB0aGUgY29ycmVzcG9uZGluZyBFbnRpdHlUeXBlIG9yIGEgY29sbGVjdGlvbiBvZiB0aGUgc2FtZS5cblx0ICpcblx0ICogQHBhcmFtIHJvb3RDb250ZXh0IFRoZSBjb250ZXh0IHRvIHN0YXJ0IHNlYXJjaGluZyBmcm9tXG5cdCAqIEBwYXJhbSBsaXN0QmluZGluZyBUaGUgbGlzdEJpbmRpbmcgb2YgdGhlIHRhYmxlXG5cdCAqIEBwYXJhbSBvdmVybG9hZEVudGl0eVR5cGUgVGhlIEFjdGlvbk92ZXJsb2FkIGVudGl0eSB0eXBlIHRvIHNlYXJjaCBmb3Jcblx0ICogQHJldHVybnMgUmV0dXJucyB0aGUgY29udGV4dCBvZiB0aGUgQWN0aW9uT3ZlcmxvYWQgZW50aXR5XG5cdCAqL1xuXHRfZ2V0QWN0aW9uT3ZlcmxvYWRDb250ZXh0RnJvbU1ldGFkYXRhUGF0aChyb290Q29udGV4dDogQ29udGV4dCwgbGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcsIG92ZXJsb2FkRW50aXR5VHlwZTogc3RyaW5nKTogQ29udGV4dCB7XG5cdFx0Y29uc3QgbW9kZWw6IE9EYXRhTW9kZWwgPSByb290Q29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWw7XG5cdFx0Y29uc3QgbWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCA9IG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdGxldCBjb250ZXh0U2VnbWVudHM6IHN0cmluZ1tdID0gbGlzdEJpbmRpbmcuZ2V0UGF0aCgpLnNwbGl0KFwiL1wiKTtcblx0XHRsZXQgY3VycmVudENvbnRleHQ6IENvbnRleHQgPSByb290Q29udGV4dDtcblxuXHRcdC8vIFdlIGV4cGVjdCB0aGF0IHRoZSBsYXN0IHNlZ21lbnQgb2YgdGhlIGxpc3RCaW5kaW5nIGlzIHRoZSBMaXN0QmluZGluZyBvZiB0aGUgdGFibGUuIFJlbW92ZSB0aGlzIGZyb20gY29udGV4dFNlZ21lbnRzXG5cdFx0Ly8gYmVjYXVzZSBpdCBpcyBpbmNvcnJlY3QgdG8gZXhlY3V0ZSBiaW5kQ29udGV4dCBvbiBhIGxpc3QuIFdlIGRvIG5vdCBhbnl3YXkgbmVlZCB0byBzZWFyY2ggdGhpcyBjb250ZXh0IGZvciB0aGUgb3ZlcmxvYWQuXG5cdFx0Y29udGV4dFNlZ21lbnRzLnBvcCgpO1xuXHRcdGlmIChjb250ZXh0U2VnbWVudHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRjb250ZXh0U2VnbWVudHMgPSBbXCJcIl07IC8vIERvbid0IGxlYXZlIGNvbnRleHRTZWdtZW50cyB1bmRlZmluZWRcblx0XHR9XG5cblx0XHRpZiAoY29udGV4dFNlZ21lbnRzWzBdICE9PSBcIlwiKSB7XG5cdFx0XHRjb250ZXh0U2VnbWVudHMudW5zaGlmdChcIlwiKTsgLy8gdG8gYWxzbyBnZXQgdGhlIHJvb3QgY29udGV4dCwgaS5lLiB0aGUgYmluZGluZ0NvbnRleHQgb2YgdGhlIHRhYmxlXG5cdFx0fVxuXHRcdC8vIGxvYWQgYWxsIHRoZSBwYXJlbnQgY29udGV4dHMgaW50byBhbiBhcnJheVxuXHRcdGNvbnN0IHBhcmVudENvbnRleHRzOiBDb250ZXh0W10gPSBjb250ZXh0U2VnbWVudHNcblx0XHRcdC5tYXAoKHBhdGhTZWdtZW50OiBzdHJpbmcpID0+IHtcblx0XHRcdFx0aWYgKHBhdGhTZWdtZW50ICE9PSBcIlwiKSB7XG5cdFx0XHRcdFx0Y3VycmVudENvbnRleHQgPSBtb2RlbC5iaW5kQ29udGV4dChwYXRoU2VnbWVudCwgY3VycmVudENvbnRleHQpLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIENyZWF0aW5nIGEgbmV3IGNvbnRleHQgdXNpbmcgYmluZENvbnRleHQoLi4uKS5nZXRCb3VuZENvbnRleHQoKSBkb2VzIG5vdCB3b3JrIGlmIHRoZSBldGFnIGlzIG5lZWRlZC4gQWNjb3JkaW5nIHRvIG1vZGVsIGNvbGxlYWd1ZXMsXG5cdFx0XHRcdFx0Ly8gd2Ugc2hvdWxkIGFsd2F5cyB1c2UgYW4gZXhpc3RpbmcgY29udGV4dCBpZiBwb3NzaWJsZS5cblx0XHRcdFx0XHQvLyBDdXJyZW50bHksIHRoZSBvbmx5IGV4YW1wbGUgd2Uga25vdyBhYm91dCBpcyB1c2luZyB0aGUgcm9vdENvbnRleHQgLSBhbmQgaW4gdGhpcyBjYXNlLCB3ZSBjYW4gb2J2aW91c2x5IHJldXNlIHRoYXQgZXhpc3RpbmcgY29udGV4dC5cblx0XHRcdFx0XHQvLyBJZiBvdGhlciBleGFtcGxlcyBzaG91bGQgY29tZSB1cCwgdGhlIGJlc3QgcG9zc2libGUgd29yayBhcm91bmQgd291bGQgYmUgdG8gcmVxdWVzdCBzb21lIGRhdGEgdG8gZ2V0IGFuIGV4aXN0aW5nIGNvbnRleHQuIFRvIGtlZXAgdGhlXG5cdFx0XHRcdFx0Ly8gcmVxdWVzdCBhcyBzbWFsbCBhbmQgZmFzdCBhcyBwb3NzaWJsZSwgd2Ugc2hvdWxkIHJlcXVlc3Qgb25seSB0aGUgZmlyc3Qga2V5IHByb3BlcnR5LiBBcyB0aGlzIHdvdWxkIGludHJvZHVjZSBhc3luY2hyb25pc20sIGFuZCBhbnl3YXlcblx0XHRcdFx0XHQvLyB0aGUgd2hvbGUgbG9naWMgaXMgb25seSBwYXJ0IG9mIHdvcmstYXJvdW5kIGZvciBpbmNvcnJlY3QgbW9kZWxsaW5nLCB3ZSB3YWl0IHVudGlsIHdlIGhhdmUgYW4gZXhhbXBsZSBuZWVkaW5nIGl0IGJlZm9yZSBpbXBsZW1lbnRpbmcgdGhpcy5cblx0XHRcdFx0XHRjdXJyZW50Q29udGV4dCA9IHJvb3RDb250ZXh0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBjdXJyZW50Q29udGV4dDtcblx0XHRcdH0pXG5cdFx0XHQucmV2ZXJzZSgpO1xuXHRcdC8vIHNlYXJjaCBmb3IgY29udGV4dCBiYWNrd2FyZHNcblx0XHRjb25zdCBvdmVybG9hZENvbnRleHQ6IENvbnRleHQgfCB1bmRlZmluZWQgPSBwYXJlbnRDb250ZXh0cy5maW5kKFxuXHRcdFx0KHBhcmVudENvbnRleHQ6IENvbnRleHQpID0+XG5cdFx0XHRcdChtZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQocGFyZW50Q29udGV4dC5nZXRQYXRoKCkpLmdldE9iamVjdChcIiRUeXBlXCIpIGFzIHVua25vd24gYXMgc3RyaW5nKSA9PT0gb3ZlcmxvYWRFbnRpdHlUeXBlXG5cdFx0KTtcblx0XHRyZXR1cm4gb3ZlcmxvYWRDb250ZXh0IHx8IGxpc3RCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKTtcblx0fVxuXG5cdF9jcmVhdGVTaWJsaW5nSW5mbyhjdXJyZW50Q29udGV4dDogVjRDb250ZXh0LCBuZXdDb250ZXh0OiBWNENvbnRleHQpOiBTaWJsaW5nSW5mb3JtYXRpb24ge1xuXHRcdHJldHVybiB7XG5cdFx0XHR0YXJnZXRDb250ZXh0OiBuZXdDb250ZXh0LFxuXHRcdFx0cGF0aE1hcHBpbmc6IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdG9sZFBhdGg6IGN1cnJlbnRDb250ZXh0LmdldFBhdGgoKSxcblx0XHRcdFx0XHRuZXdQYXRoOiBuZXdDb250ZXh0LmdldFBhdGgoKVxuXHRcdFx0XHR9XG5cdFx0XHRdXG5cdFx0fTtcblx0fVxuXG5cdF91cGRhdGVQYXRoc0luSGlzdG9yeShtYXBwaW5nczogeyBvbGRQYXRoOiBzdHJpbmc7IG5ld1BhdGg6IHN0cmluZyB9W10pIHtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gdGhpcy5iYXNlLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdG9BcHBDb21wb25lbnQuZ2V0Um91dGVyUHJveHkoKS5zZXRQYXRoTWFwcGluZyhtYXBwaW5ncyk7XG5cblx0XHQvLyBBbHNvIHVwZGF0ZSB0aGUgc2VtYW50aWMgbWFwcGluZyBpbiB0aGUgcm91dGluZyBzZXJ2aWNlXG5cdFx0Y29uc3QgbGFzdFNlbWFudGljTWFwcGluZyA9IHRoaXMuX2dldFNlbWFudGljTWFwcGluZygpO1xuXHRcdGlmIChtYXBwaW5ncy5sZW5ndGggJiYgbGFzdFNlbWFudGljTWFwcGluZz8udGVjaG5pY2FsUGF0aCA9PT0gbWFwcGluZ3NbbWFwcGluZ3MubGVuZ3RoIC0gMV0ub2xkUGF0aCkge1xuXHRcdFx0bGFzdFNlbWFudGljTWFwcGluZy50ZWNobmljYWxQYXRoID0gbWFwcGluZ3NbbWFwcGluZ3MubGVuZ3RoIC0gMV0ubmV3UGF0aDtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBtZXRob2RzIGNyZWF0ZXMgYSBzaWJsaW5nIGNvbnRleHQgZm9yIGEgc3Vib2JqZWN0IHBhZ2UsIGFuZCBjYWxjdWxhdGVzIGEgc2libGluZyBwYXRoIGZvclxuXHQgKiBhbGwgaW50ZXJtZWRpYXRlcyBwYXRocyBiZXR3ZWVuIHRoZSBPUCBhbmQgdGhlIHN1Yi1PUC5cblx0ICpcblx0ICogQHBhcmFtIHJvb3RDdXJyZW50Q29udGV4dCBUaGUgY29udGV4dCBmb3IgdGhlIHJvb3Qgb2YgdGhlIGRyYWZ0XG5cdCAqIEBwYXJhbSByaWdodG1vc3RDdXJyZW50Q29udGV4dCBUaGUgY29udGV4dCBvZiB0aGUgc3Vib2JqZWN0XG5cdCAqIEBwYXJhbSBzUHJvZ3JhbW1pbmdNb2RlbCBUaGUgcHJvZ3JhbW1pbmcgbW9kZWxcblx0ICogQHBhcmFtIGRvTm90Q29tcHV0ZUlmUm9vdCBJZiB0cnVlLCB3ZSBkb24ndCBjb21wdXRlIHNpYmxpbmdJbmZvIGlmIHRoZSByb290IGFuZCB0aGUgcmlnaHRtb3N0IGNvbnRleHRzIGFyZSB0aGUgc2FtZVxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRoZSBzaWJsaW5nSW5mb3JtYXRpb24gb2JqZWN0XG5cdCAqL1xuXHRhc3luYyBfY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihcblx0XHRyb290Q3VycmVudENvbnRleHQ6IFY0Q29udGV4dCxcblx0XHRyaWdodG1vc3RDdXJyZW50Q29udGV4dDogVjRDb250ZXh0IHwgbnVsbCB8IHVuZGVmaW5lZCxcblx0XHRzUHJvZ3JhbW1pbmdNb2RlbDogc3RyaW5nLFxuXHRcdGRvTm90Q29tcHV0ZUlmUm9vdDogYm9vbGVhblxuXHQpOiBQcm9taXNlPFNpYmxpbmdJbmZvcm1hdGlvbiB8IHVuZGVmaW5lZD4ge1xuXHRcdHJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0ID0gcmlnaHRtb3N0Q3VycmVudENvbnRleHQgPz8gcm9vdEN1cnJlbnRDb250ZXh0O1xuXHRcdGlmICghcmlnaHRtb3N0Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpLnN0YXJ0c1dpdGgocm9vdEN1cnJlbnRDb250ZXh0LmdldFBhdGgoKSkpIHtcblx0XHRcdC8vIFdyb25nIHVzYWdlICEhXG5cdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgY29tcHV0ZSByaWdodG1vc3Qgc2libGluZyBjb250ZXh0XCIpO1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGNvbXB1dGUgcmlnaHRtb3N0IHNpYmxpbmcgY29udGV4dFwiKTtcblx0XHR9XG5cdFx0aWYgKGRvTm90Q29tcHV0ZUlmUm9vdCAmJiByaWdodG1vc3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkgPT09IHJvb3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodW5kZWZpbmVkKTtcblx0XHR9XG5cblx0XHRjb25zdCBtb2RlbCA9IHJvb3RDdXJyZW50Q29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdGlmIChzUHJvZ3JhbW1pbmdNb2RlbCA9PT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0cmV0dXJuIGRyYWZ0LmNvbXB1dGVTaWJsaW5nSW5mb3JtYXRpb24ocm9vdEN1cnJlbnRDb250ZXh0LCByaWdodG1vc3RDdXJyZW50Q29udGV4dCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIElmIG5vdCBpbiBkcmFmdCBtb2RlLCB3ZSBqdXN0IHJlY3JlYXRlIGEgY29udGV4dCBmcm9tIHRoZSBwYXRoIG9mIHRoZSByaWdodG1vc3QgY29udGV4dFxuXHRcdFx0Ly8gTm8gcGF0aCBtYXBwaW5nIGlzIG5lZWRlZFxuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dGFyZ2V0Q29udGV4dDogbW9kZWwuYmluZENvbnRleHQocmlnaHRtb3N0Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpKS5nZXRCb3VuZENvbnRleHQoKSxcblx0XHRcdFx0cGF0aE1hcHBpbmc6IFtdXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXHRfaXNGY2xFbmFibGVkKCk6IGJvb2xlYW4ge1xuXHRcdHJldHVybiBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5nZXRWaWV3KCkpLl9pc0ZjbEVuYWJsZWQoKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBFZGl0RmxvdztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQWtqQk8sZ0JBQWdCQSxJQUFJLEVBQUVDLE9BQU8sRUFBRTtJQUNyQyxJQUFJO01BQ0gsSUFBSUMsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU1HLENBQUMsRUFBRTtNQUNWLE9BQU9GLE9BQU8sQ0FBQ0UsQ0FBQyxDQUFDO0lBQ2xCO0lBQ0EsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLElBQUksRUFBRTtNQUMxQixPQUFPRixNQUFNLENBQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRUgsT0FBTyxDQUFDO0lBQ3BDO0lBQ0EsT0FBT0MsTUFBTTtFQUNkO0VBR08sMEJBQTBCRixJQUFJLEVBQUVLLFNBQVMsRUFBRTtJQUNqRCxJQUFJO01BQ0gsSUFBSUgsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU9HLENBQUMsRUFBRTtNQUNYLE9BQU9FLFNBQVMsQ0FBQyxJQUFJLEVBQUVGLENBQUMsQ0FBQztJQUMxQjtJQUNBLElBQUlELE1BQU0sSUFBSUEsTUFBTSxDQUFDRSxJQUFJLEVBQUU7TUFDMUIsT0FBT0YsTUFBTSxDQUFDRSxJQUFJLENBQUNDLFNBQVMsQ0FBQ0MsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRUQsU0FBUyxDQUFDQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVFO0lBQ0EsT0FBT0QsU0FBUyxDQUFDLEtBQUssRUFBRUgsTUFBTSxDQUFDO0VBQ2hDO0VBQUM7RUFBQTtFQUFBO0VBMWlCRCxJQUFNSyxZQUFZLEdBQUdDLFNBQVMsQ0FB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