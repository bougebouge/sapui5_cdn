/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controllerextensions/editFlow/operations", "sap/fe/core/controllerextensions/editFlow/sticky", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/FPMHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/library", "sap/m/Button", "sap/m/CheckBox", "sap/m/Dialog", "sap/m/MessageBox", "sap/m/MessageToast", "sap/m/Popover", "sap/m/Text", "sap/m/VBox", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel", "../../helpers/ToES6Promise"], function (Log, CommonUtils, BusyLocker, draft, operations, sticky, messageHandling, FPMHelper, ModelHelper, FELibrary, Button, CheckBox, Dialog, MessageBox, MessageToast, Popover, Text, VBox, Core, Fragment, coreLibrary, XMLPreprocessor, XMLTemplateProcessor, JSONModel, toES6Promise) {
  "use strict";

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
  function _settle(pact, state, value) {
    if (!pact.s) {
      if (value instanceof _Pact) {
        if (value.s) {
          if (state & 1) {
            state = value.s;
          }
          value = value.v;
        } else {
          value.o = _settle.bind(null, pact, state);
          return;
        }
      }
      if (value && value.then) {
        value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
        return;
      }
      pact.s = state;
      pact.v = value;
      var observer = pact.o;
      if (observer) {
        observer(pact);
      }
    }
  }
  var _Pact = /*#__PURE__*/function () {
    function _Pact() {}
    _Pact.prototype.then = function (onFulfilled, onRejected) {
      var result = new _Pact();
      var state = this.s;
      if (state) {
        var callback = state & 1 ? onFulfilled : onRejected;
        if (callback) {
          try {
            _settle(result, 1, callback(this.v));
          } catch (e) {
            _settle(result, 2, e);
          }
          return result;
        } else {
          return this;
        }
      }
      this.o = function (_this) {
        try {
          var value = _this.v;
          if (_this.s & 1) {
            _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
          } else if (onRejected) {
            _settle(result, 1, onRejected(value));
          } else {
            _settle(result, 2, value);
          }
        } catch (e) {
          _settle(result, 2, e);
        }
      };
      return result;
    };
    return _Pact;
  }();
  function _switch(discriminant, cases) {
    var dispatchIndex = -1;
    var awaitBody;
    outer: {
      for (var i = 0; i < cases.length; i++) {
        var test = cases[i][0];
        if (test) {
          var testValue = test();
          if (testValue && testValue.then) {
            break outer;
          }
          if (testValue === discriminant) {
            dispatchIndex = i;
            break;
          }
        } else {
          // Found the default case, set it as the pending dispatch case
          dispatchIndex = i;
        }
      }
      if (dispatchIndex !== -1) {
        do {
          var body = cases[dispatchIndex][1];
          while (!body) {
            dispatchIndex++;
            body = cases[dispatchIndex][1];
          }
          var result = body();
          if (result && result.then) {
            awaitBody = true;
            break outer;
          }
          var fallthroughCheck = cases[dispatchIndex][2];
          dispatchIndex++;
        } while (fallthroughCheck && !fallthroughCheck());
        return result;
      }
    }
    var pact = new _Pact();
    var reject = _settle.bind(null, pact, 2);
    (awaitBody ? result.then(_resumeAfterBody) : testValue.then(_resumeAfterTest)).then(void 0, reject);
    return pact;
    function _resumeAfterTest(value) {
      for (;;) {
        if (value === discriminant) {
          dispatchIndex = i;
          break;
        }
        if (++i === cases.length) {
          if (dispatchIndex !== -1) {
            break;
          } else {
            _settle(pact, 1, result);
            return;
          }
        }
        test = cases[i][0];
        if (test) {
          value = test();
          if (value && value.then) {
            value.then(_resumeAfterTest).then(void 0, reject);
            return;
          }
        } else {
          dispatchIndex = i;
        }
      }
      do {
        var body = cases[dispatchIndex][1];
        while (!body) {
          dispatchIndex++;
          body = cases[dispatchIndex][1];
        }
        var result = body();
        if (result && result.then) {
          result.then(_resumeAfterBody).then(void 0, reject);
          return;
        }
        var fallthroughCheck = cases[dispatchIndex][2];
        dispatchIndex++;
      } while (fallthroughCheck && !fallthroughCheck());
      _settle(pact, 1, result);
    }
    function _resumeAfterBody(result) {
      for (;;) {
        var fallthroughCheck = cases[dispatchIndex][2];
        if (!fallthroughCheck || fallthroughCheck()) {
          break;
        }
        dispatchIndex++;
        var body = cases[dispatchIndex][1];
        while (!body) {
          dispatchIndex++;
          body = cases[dispatchIndex][1];
        }
        result = body();
        if (result && result.then) {
          result.then(_resumeAfterBody).then(void 0, reject);
          return;
        }
      }
      _settle(pact, 1, result);
    }
  }
  var CreationMode = FELibrary.CreationMode;
  var ProgrammingModel = FELibrary.ProgrammingModel;
  var ValueState = coreLibrary.ValueState;
  /* Make sure that the mParameters is not the oEvent */
  function getParameters(mParameters) {
    if (mParameters && mParameters.getMetadata && mParameters.getMetadata().getName() === "sap.ui.base.Event") {
      mParameters = {};
    }
    return mParameters || {};
  }
  var TransactionHelper = /*#__PURE__*/function () {
    function TransactionHelper(oAppComponent, oLockObject) {
      this._bIsModified = false;
      this._bCreateMode = false;
      this._bContinueDiscard = false;
      this._oAppComponent = oAppComponent;
      this.oLockObject = oLockObject;
    }
    var _proto = TransactionHelper.prototype;
    _proto.getProgrammingModel = function getProgrammingModel(oContext) {
      if (!this.sProgrammingModel && oContext) {
        var sPath;
        if (oContext.isA("sap.ui.model.odata.v4.Context")) {
          sPath = oContext.getPath();
        } else {
          sPath = oContext.isRelative() ? oContext.getResolvedPath() : oContext.getPath();
        }
        if (ModelHelper.isDraftSupported(oContext.getModel().getMetaModel(), sPath)) {
          this.sProgrammingModel = ProgrammingModel.Draft;
        } else if (ModelHelper.isStickySessionSupported(oContext.getModel().getMetaModel())) {
          this.sProgrammingModel = ProgrammingModel.Sticky;
        } else {
          // as the transaction helper is a singleton we don't store the non draft as the user could
          // start with a non draft child page and navigates back to a draft enabled one
          return ProgrammingModel.NonDraft;
        }
      }
      return this.sProgrammingModel;
    }

    /**
     * Validates a document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the document to be validated
     * @param [mParameters] Can contain the following attributes:
     * @param [mParameters.data] A map of data that should be validated
     * @param [mParameters.customValidationFunction] A string representing the path to the validation function
     * @param oView Contains the object of the current view
     * @returns Promise resolves with result of the custom validation function
     * @ui5-restricted
     * @final
     */;
    _proto.validateDocument = function validateDocument(oContext, mParameters, oView) {
      var sCustomValidationFunction = mParameters && mParameters.customValidationFunction;
      if (sCustomValidationFunction) {
        var sModule = sCustomValidationFunction.substring(0, sCustomValidationFunction.lastIndexOf(".") || -1).replace(/\./gi, "/"),
          sFunctionName = sCustomValidationFunction.substring(sCustomValidationFunction.lastIndexOf(".") + 1, sCustomValidationFunction.length),
          mData = mParameters.data;
        delete mData["@$ui5.context.isTransient"];
        return FPMHelper.validationWrapper(sModule, sFunctionName, mData, oView, oContext);
      }
      return Promise.resolve([]);
    }

    /**
     * Creates a new document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oMainListBinding OData V4 ListBinding object
     * @param [mInParameters] Optional, can contain the following attributes:
     * @param [mInParameters.data] A map of data that should be sent within the POST
     * @param [mInParameters.busyMode] Global (default), Local, None TODO: to be refactored
     * @param [mInParameters.busyId] ID of the local busy indicator
     * @param [mInParameters.keepTransientContextOnFailed] If set, the context stays in the list if the POST failed and POST will be repeated with the next change
     * @param [mInParameters.inactive] If set, the context is set as inactive for empty rows
     * @param [mInParameters.skipParameterDialog] Skips the action parameter dialog
     * @param oResourceBundle
     * @param messageHandler
     * @param bFromCopyPaste
     * @param oView The current view
     * @returns Promise resolves with new binding context
     * @ui5-restricted
     * @final
     */;
    _proto.createDocument = function createDocument(oMainListBinding, mInParameters, oResourceBundle, messageHandler) {
      var bFromCopyPaste = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
      var oView = arguments.length > 5 ? arguments[5] : undefined;
      try {
        var _exit2 = false;
        var _this2 = this;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var oModel = oMainListBinding.getModel(),
          oMetaModel = oModel.getMetaModel(),
          sMetaPath = oMetaModel.getMetaPath(oMainListBinding.getHeaderContext().getPath()),
          sCreateHash = _this2._getAppComponent().getRouterProxy().getHash(),
          oComponentData = _this2._getAppComponent().getComponentData(),
          oStartupParameters = oComponentData && oComponentData.startupParameters || {},
          sNewAction = !oMainListBinding.isRelative() ? _this2._getNewAction(oStartupParameters, sCreateHash, oMetaModel, sMetaPath) : undefined;
        var mBindingParameters = {
          "$$patchWithoutSideEffects": true
        };
        var sMessagesPath = oMetaModel.getObject("".concat(sMetaPath, "/@com.sap.vocabularies.Common.v1.Messages/$Path"));
        var sBusyPath = "/busy";
        var sFunctionName = oMetaModel.getObject("".concat(sMetaPath, "@com.sap.vocabularies.Common.v1.DefaultValuesFunction")) || oMetaModel.getObject("".concat(ModelHelper.getTargetEntitySet(oMetaModel.getContext(sMetaPath)), "@com.sap.vocabularies.Common.v1.DefaultValuesFunction"));
        var bFunctionOnNavProp;
        var oNewDocumentContext;
        if (sFunctionName) {
          if (oMetaModel.getObject("".concat(sMetaPath, "@com.sap.vocabularies.Common.v1.DefaultValuesFunction")) && ModelHelper.getTargetEntitySet(oMetaModel.getContext(sMetaPath)) !== sMetaPath) {
            bFunctionOnNavProp = true;
          } else {
            bFunctionOnNavProp = false;
          }
        }
        if (sMessagesPath) {
          mBindingParameters["$select"] = sMessagesPath;
        }
        var mParameters = getParameters(mInParameters);
        if (!oMainListBinding) {
          throw new Error("Binding required for new document creation");
        }
        var sProgrammingModel = _this2.getProgrammingModel(oMainListBinding);
        if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
          throw new Error("Create document only allowed for draft or sticky session supported services");
        }
        if (mParameters.busyMode === "Local") {
          sBusyPath = "/busyLocal/".concat(mParameters.busyId);
        }
        mParameters.beforeCreateCallBack = bFromCopyPaste ? null : mParameters.beforeCreateCallBack;
        BusyLocker.lock(_this2.oLockObject, sBusyPath);
        var oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
        var oResult;
        return Promise.resolve(_finallyRethrows(function () {
          return _catch(function () {
            function _temp8(_result) {
              if (_exit2) return _result;
              if (!oMainListBinding.isRelative()) {
                // the create mode shall currently only be set on creating a root document
                _this2._bCreateMode = true;
              }
              oNewDocumentContext = oNewDocumentContext || oResult;
              // TODO: where does this one coming from???

              if (bConsiderDocumentModified) {
                _this2.handleDocumentModifications();
              }
              return Promise.resolve(messageHandler.showMessageDialog()).then(function () {
                return oNewDocumentContext;
              });
            }
            var bConsiderDocumentModified = false;
            var _temp7 = function () {
              if (sNewAction) {
                bConsiderDocumentModified = true;
                return Promise.resolve(_this2.callAction(sNewAction, {
                  contexts: oMainListBinding.getHeaderContext(),
                  showActionParameterDialog: true,
                  label: _this2._getSpecificCreateActionDialogLabel(oMetaModel, sMetaPath, sNewAction, oResourceBundleCore),
                  bindingParameters: mBindingParameters,
                  parentControl: mParameters.parentControl,
                  bIsCreateAction: true,
                  skipParameterDialog: mParameters.skipParameterDialog
                }, null, messageHandler)).then(function (_this$callAction) {
                  oResult = _this$callAction;
                });
              } else {
                var bIsNewPageCreation = mParameters.creationMode !== CreationMode.CreationRow && mParameters.creationMode !== CreationMode.Inline;
                var aNonComputedVisibleKeyFields = bIsNewPageCreation ? CommonUtils.getNonComputedVisibleFields(oMetaModel, sMetaPath, oView) : [];
                sFunctionName = bFromCopyPaste ? null : sFunctionName;
                var sFunctionPath, oFunctionContext;
                if (sFunctionName) {
                  //bound to the source entity:
                  if (bFunctionOnNavProp) {
                    sFunctionPath = oMainListBinding.getContext() && "".concat(oMetaModel.getMetaPath(oMainListBinding.getContext().getPath()), "/").concat(sFunctionName);
                    oFunctionContext = oMainListBinding.getContext();
                  } else {
                    sFunctionPath = oMainListBinding.getHeaderContext() && "".concat(oMetaModel.getMetaPath(oMainListBinding.getHeaderContext().getPath()), "/").concat(sFunctionName);
                    oFunctionContext = oMainListBinding.getHeaderContext();
                  }
                }
                var oFunction = sFunctionPath && oMetaModel.createBindingContext(sFunctionPath);
                return _catch(function () {
                  function _temp6(_result2) {
                    if (_exit2) return _result2;
                    mParameters.data = oData ? Object.assign({}, oData, mParameters.data) : mParameters.data;
                    if (mParameters.data) {
                      delete mParameters.data["@odata.context"];
                    }
                    var _temp4 = function () {
                      if (aNonComputedVisibleKeyFields.length > 0) {
                        return Promise.resolve(_this2._launchDialogWithKeyFields(oMainListBinding, aNonComputedVisibleKeyFields, oModel, mParameters, messageHandler)).then(function (_this$_launchDialogWi) {
                          oResult = _this$_launchDialogWi;
                          oNewDocumentContext = oResult.newContext;
                        });
                      } else {
                        function _temp9() {
                          oNewDocumentContext = oMainListBinding.create(mParameters.data, true, mParameters.createAtEnd, mParameters.inactive);
                          var _temp = function () {
                            if (!mParameters.inactive) {
                              return Promise.resolve(_this2.onAfterCreateCompletion(oMainListBinding, oNewDocumentContext, mParameters)).then(function (_this$onAfterCreateCo) {
                                oResult = _this$onAfterCreateCo;
                              });
                            }
                          }();
                          if (_temp && _temp.then) return _temp.then(function () {});
                        }
                        var _temp10 = function () {
                          if (mParameters.beforeCreateCallBack) {
                            return Promise.resolve(toES6Promise(mParameters.beforeCreateCallBack({
                              contextPath: oMainListBinding && oMainListBinding.getPath()
                            }))).then(function () {});
                          }
                        }();
                        return _temp10 && _temp10.then ? _temp10.then(_temp9) : _temp9(_temp10);
                      }
                    }();
                    if (_temp4 && _temp4.then) return _temp4.then(function () {});
                  }
                  var oData;
                  var _temp5 = _catch(function () {
                    return Promise.resolve(oFunction && oFunction.getObject() && oFunction.getObject()[0].$IsBound ? operations.callBoundFunction(sFunctionName, oFunctionContext, oModel) : operations.callFunctionImport(sFunctionName, oModel)).then(function (oContext) {
                      if (oContext) {
                        oData = oContext.getObject();
                      }
                    });
                  }, function (oError) {
                    Log.error("Error while executing the function ".concat(sFunctionName), oError);
                    throw oError;
                  });
                  return _temp5 && _temp5.then ? _temp5.then(_temp6) : _temp6(_temp5);
                }, function (oError) {
                  Log.error("Error while creating the new document", oError);
                  throw oError;
                });
              }
            }();
            return _temp7 && _temp7.then ? _temp7.then(_temp8) : _temp8(_temp7);
          }, function (error) {
            // TODO: currently, the only errors handled here are raised as string - should be changed to Error objects
            return Promise.resolve(messageHandler.showMessageDialog()).then(function () {
              var _oNewDocumentContext;
              if ((error === FELibrary.Constants.ActionExecutionFailed || error === FELibrary.Constants.CancelActionDialog) && (_oNewDocumentContext = oNewDocumentContext) !== null && _oNewDocumentContext !== void 0 && _oNewDocumentContext.isTransient()) {
                // This is a workaround suggested by model as Context.delete results in an error
                // TODO: remove the $direct once model resolves this issue
                // this line shows the expected console error Uncaught (in promise) Error: Request canceled: POST Travel; group: submitLater
                oNewDocumentContext.delete("$direct");
              }
              throw error;
            });
          });
        }, function (_wasThrown, _result4) {
          BusyLocker.unlock(_this2.oLockObject, sBusyPath);
          if (_wasThrown) throw _result4;
          return _result4;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Find the active contexts of the documents, only for the draft roots.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param aContexts Contexts Either one context or an array with contexts to be deleted
     * @param bFindActiveContexts
     * @returns Array of the active contexts
     */
    ;
    _proto.findActiveDraftRootContexts = function findActiveDraftRootContexts(aContexts, bFindActiveContexts) {
      if (!bFindActiveContexts) {
        return Promise.resolve();
      }
      var activeContexts = aContexts.reduce(function (aResult, oContext) {
        var oMetaModel = oContext.getModel().getMetaModel();
        var sMetaPath = oMetaModel.getMetaPath(oContext.getPath());
        if (oMetaModel.getObject("".concat(sMetaPath, "@com.sap.vocabularies.Common.v1.DraftRoot"))) {
          var bIsActiveEntity = oContext.getObject().IsActiveEntity,
            bHasActiveEntity = oContext.getObject().HasActiveEntity;
          if (!bIsActiveEntity && bHasActiveEntity) {
            var oActiveContext = oContext.getModel().bindContext("".concat(oContext.getPath(), "/SiblingEntity")).getBoundContext();
            aResult.push(oActiveContext);
          }
        }
        return aResult;
      }, []);
      return Promise.all(activeContexts.map(function (oContext) {
        return oContext.requestCanonicalPath().then(function () {
          return oContext;
        });
      }));
    };
    _proto.afterDeleteProcess = function afterDeleteProcess(mParameters, checkBox, aContexts, oResourceBundle) {
      var oInternalModelContext = mParameters.internalModelContext;
      if (oInternalModelContext && oInternalModelContext.getProperty("deleteEnabled") != undefined) {
        if (checkBox.isCheckBoxVisible === true && checkBox.isCheckBoxSelected === false) {
          //if unsaved objects are not deleted then we need to set the enabled to true and update the model data for next deletion
          oInternalModelContext.setProperty("deleteEnabled", true);
          var obj = Object.assign(oInternalModelContext.getObject(), {});
          obj.selectedContexts = obj.selectedContexts.filter(function (element) {
            return obj.deletableContexts.indexOf(element) === -1;
          });
          obj.deletableContexts = [];
          obj.selectedContexts = [];
          obj.numberOfSelectedContexts = obj.selectedContexts.length;
          oInternalModelContext.setProperty("", obj);
        } else {
          oInternalModelContext.setProperty("deleteEnabled", false);
          oInternalModelContext.setProperty("selectedContexts", []);
          oInternalModelContext.setProperty("numberOfSelectedContexts", 0);
        }
      }
      if (aContexts.length === 1) {
        MessageToast.show(CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DELETE_TOAST_SINGULAR", oResourceBundle, null, mParameters.entitySetName));
      } else {
        MessageToast.show(CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DELETE_TOAST_PLURAL", oResourceBundle, null, mParameters.entitySetName));
      }
    }
    /**
     * Delete one or multiple document(s).
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param vInContexts Contexts Either one context or an array with contexts to be deleted
     * @param mParameters Optional, can contain the following attributes:
     * @param mParameters.title Title of the object to be deleted
     * @param mParameters.description Description of the object to be deleted
     * @param mParameters.numberOfSelectedContexts Number of objects selected
     * @param mParameters.noDialog To disable the confirmation dialog
     * @param oResourceBundle
     * @param messageHandler
     * @returns A Promise resolved once the document are deleted
     */;
    _proto.deleteDocument = function deleteDocument(vInContexts, mParameters, oResourceBundle, messageHandler) {
      var _this3 = this;
      var aDeletableContexts = [],
        isCheckBoxVisible = false,
        isLockedTextVisible = false,
        cannotBeDeletedTextVisible = false,
        isCheckBoxSelected,
        bDialogConfirmed = false;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this,
        oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
      var aParams;
      var oDeleteMessage = {
        title: oResourceBundleCore.getText("C_COMMON_DELETE")
      };
      BusyLocker.lock(this.oLockObject);
      var vContexts;
      if (Array.isArray(vInContexts)) {
        vContexts = vInContexts;
      } else {
        vContexts = [vInContexts];
      }
      return new Promise(function (resolve, reject) {
        try {
          var sProgrammingModel = _this3.getProgrammingModel(vContexts[0]);
          if (mParameters) {
            if (!mParameters.numberOfSelectedContexts) {
              if (sProgrammingModel === ProgrammingModel.Draft) {
                for (var i = 0; i < vContexts.length; i++) {
                  var oContextData = vContexts[i].getObject();
                  if (oContextData.IsActiveEntity === true && oContextData.HasDraftEntity === true && oContextData.DraftAdministrativeData && oContextData.DraftAdministrativeData.InProcessByUser && !oContextData.DraftAdministrativeData.DraftIsCreatedByMe) {
                    var sLockedUser = "";
                    var draftAdminData = oContextData && oContextData.DraftAdministrativeData;
                    if (draftAdminData) {
                      sLockedUser = draftAdminData["InProcessByUser"];
                    }
                    aParams = [sLockedUser];
                    MessageBox.show(CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_OBJECT_LOCKED", oResourceBundle, aParams), {
                      title: oResourceBundleCore.getText("C_COMMON_DELETE"),
                      onClose: reject
                    });
                    return;
                  }
                }
              }
              mParameters = getParameters(mParameters);
              if (mParameters.title) {
                if (mParameters.description) {
                  aParams = [mParameters.title + " ", mParameters.description];
                } else {
                  aParams = [mParameters.title, ""];
                }
                oDeleteMessage.text = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO", oResourceBundle, aParams, mParameters.entitySetName);
              } else {
                oDeleteMessage.text = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", oResourceBundle, null, mParameters.entitySetName);
              }
              aDeletableContexts = vContexts;
            } else {
              oDeleteMessage = {
                title: oResourceBundleCore.getText("C_COMMON_DELETE")
              };
              if (mParameters.numberOfSelectedContexts === 1 && mParameters.numberOfSelectedContexts === vContexts.length) {
                aDeletableContexts = vContexts;
                var oLineContextData = vContexts[0].getObject();
                var oTable = mParameters.parentControl;
                var sKey = oTable && oTable.getParent().getIdentifierColumn();
                if (sKey) {
                  var sKeyValue = sKey ? oLineContextData[sKey] : undefined;
                  var sDescription = mParameters.description && mParameters.description.path ? oLineContextData[mParameters.description.path] : undefined;
                  if (sKeyValue) {
                    if (sDescription && mParameters.description && sKey !== mParameters.description.path) {
                      aParams = [sKeyValue + " ", sDescription];
                    } else {
                      aParams = [sKeyValue, ""];
                    }
                    oDeleteMessage.text = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO", oResourceBundle, aParams, mParameters.entitySetName);
                  } else if (sKeyValue) {
                    aParams = [sKeyValue, ""];
                    oDeleteMessage.text = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO", oResourceBundle, aParams, mParameters.entitySetName);
                  } else {
                    oDeleteMessage.text = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", oResourceBundle, null, mParameters.entitySetName);
                  }
                } else {
                  oDeleteMessage.text = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", oResourceBundle, null, mParameters.entitySetName);
                }
              } else if (mParameters.numberOfSelectedContexts === 1 && mParameters.unSavedContexts.length === 1) {
                //only one unsaved object
                aDeletableContexts = mParameters.unSavedContexts;
                var _draftAdminData = aDeletableContexts[0].getObject()["DraftAdministrativeData"];
                var sLastChangedByUser = "";
                if (_draftAdminData) {
                  sLastChangedByUser = _draftAdminData["LastChangedByUserDescription"] || _draftAdminData["LastChangedByUser"] || "";
                }
                aParams = [sLastChangedByUser];
                oDeleteMessage.text = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES", oResourceBundle, aParams);
              } else if (mParameters.numberOfSelectedContexts === mParameters.unSavedContexts.length) {
                //only multiple unsaved objects
                aDeletableContexts = mParameters.unSavedContexts;
                oDeleteMessage.text = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES_MULTIPLE_OBJECTS", oResourceBundle);
              } else if (mParameters.numberOfSelectedContexts === vContexts.concat(mParameters.unSavedContexts.concat(mParameters.lockedContexts)).length) {
                //only unsaved, locked ,deletable objects but not non-deletable objects
                aDeletableContexts = vContexts.concat(mParameters.unSavedContexts);
                oDeleteMessage.text = aDeletableContexts.length === 1 ? CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR", oResourceBundle, null, mParameters.entitySetName) : CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL", oResourceBundle, null, mParameters.entitySetName);
              } else {
                //if non-deletable objects exists along with any of unsaved ,deletable objects
                aDeletableContexts = vContexts.concat(mParameters.unSavedContexts);
                cannotBeDeletedTextVisible = true;
                oDeleteMessage.text = aDeletableContexts.length === 1 ? CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR_NON_DELETABLE", oResourceBundle, null, mParameters.entitySetName) : CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL_NON_DELETABLE", oResourceBundle, [aDeletableContexts.length], mParameters.entitySetName);
                oDeleteMessage.nonDeletableText = that._getNonDeletableText(mParameters, vContexts, oResourceBundle);
              }
              if (mParameters.lockedContexts.length == 1) {
                //setting the locked text if locked objects exist
                isLockedTextVisible = true;
                oDeleteMessage.nonDeletableText = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_LOCKED", oResourceBundle, [mParameters.numberOfSelectedContexts]);
              }
              if (mParameters.lockedContexts.length > 1) {
                //setting the locked text if locked objects exist
                isLockedTextVisible = true;
                oDeleteMessage.nonDeletableText = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED", oResourceBundle, [mParameters.lockedContexts.length, mParameters.numberOfSelectedContexts]);
              }
              if (mParameters.unSavedContexts.length > 0 && mParameters.unSavedContexts.length !== mParameters.numberOfSelectedContexts) {
                if ((cannotBeDeletedTextVisible || isLockedTextVisible) && aDeletableContexts.length === mParameters.unSavedContexts.length) {
                  //if only unsaved and either or both of locked and non-deletable objects exist then we hide the check box
                  isCheckBoxVisible = false;
                  aDeletableContexts = mParameters.unSavedContexts;
                  if (mParameters.unSavedContexts.length === 1) {
                    oDeleteMessage.text = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_SINGULAR", oResourceBundle);
                  } else {
                    oDeleteMessage.text = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_PLURAL", oResourceBundle);
                  }
                } else {
                  if (mParameters.unSavedContexts.length === 1) {
                    oDeleteMessage.checkBoxText = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_SINGULAR", oResourceBundle);
                  } else {
                    oDeleteMessage.checkBoxText = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_PLURAL", oResourceBundle);
                  }
                  isCheckBoxVisible = true;
                }
              }
              if (cannotBeDeletedTextVisible && isLockedTextVisible) {
                //if non-deletable objects exist along with deletable objects
                var sNonDeletableContextText = that._getNonDeletableText(mParameters, vContexts, oResourceBundle);
                //if both locked and non-deletable objects exist along with deletable objects
                if (mParameters.unSavedContexts.length > 1) {
                  oDeleteMessage.nonDeletableText = sNonDeletableContextText + " " + CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED", oResourceBundle, [mParameters.lockedContexts.length, mParameters.numberOfSelectedContexts]);
                }
                if (mParameters.unSavedContexts.length == 1) {
                  oDeleteMessage.nonDeletableText = sNonDeletableContextText + " " + CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_LOCKED", oResourceBundle, [mParameters.numberOfSelectedContexts]);
                }
              }
            }
          }
          var oNonDeletableMessageTextControl, oDeleteMessageTextControl;
          var oContent = new VBox({
            items: [oNonDeletableMessageTextControl = new Text({
              text: oDeleteMessage.nonDeletableText,
              visible: isLockedTextVisible || cannotBeDeletedTextVisible
            }), oDeleteMessageTextControl = new Text({
              text: oDeleteMessage.text
            }), new CheckBox({
              text: oDeleteMessage.checkBoxText,
              selected: true,
              select: function (oEvent) {
                var selected = oEvent.getSource().getSelected();
                if (selected) {
                  aDeletableContexts = vContexts.concat(mParameters.unSavedContexts);
                  isCheckBoxSelected = true;
                } else {
                  aDeletableContexts = vContexts;
                  isCheckBoxSelected = false;
                }
              },
              visible: isCheckBoxVisible
            })]
          });
          var sTitle = oResourceBundleCore.getText("C_COMMON_DELETE");
          var fnConfirm = function () {
            try {
              bDialogConfirmed = true;
              BusyLocker.lock(that.oLockObject);
              var aContexts = aDeletableContexts;
              return Promise.resolve(_finallyRethrows(function () {
                return _catch(function () {
                  function _temp15() {
                    return Promise.resolve(that.findActiveDraftRootContexts(aContexts, mParameters.bFindActiveContexts)).then(function (activeContexts) {
                      var _exit3 = false;
                      function _temp13(_result5) {
                        if (_exit3) return _result5;
                        var checkBox = {
                          "isCheckBoxVisible": isCheckBoxVisible,
                          "isCheckBoxSelected": isCheckBoxSelected
                        };
                        var _temp11 = function () {
                          if (activeContexts && activeContexts.length) {
                            return Promise.resolve(Promise.all(activeContexts.map(function (oContext) {
                              return oContext.delete();
                            }))).then(function () {
                              that.afterDeleteProcess(mParameters, checkBox, aContexts, oResourceBundle);
                              return Promise.resolve(messageHandler.showMessageDialog()).then(function () {
                                resolve();
                              });
                            });
                          } else {
                            that.afterDeleteProcess(mParameters, checkBox, aContexts, oResourceBundle);
                            return Promise.resolve(messageHandler.showMessageDialog()).then(function () {
                              resolve();
                            });
                          }
                        }();
                        if (_temp11 && _temp11.then) return _temp11.then(function () {});
                      }
                      var _temp12 = _catch(function () {
                        return Promise.resolve(Promise.all(aContexts.map(function (oContext) {
                          //delete the draft
                          var bEnableStrictHandling = aContexts.length === 1 ? true : false;
                          return draft.deleteDraft(oContext, that._oAppComponent, bEnableStrictHandling);
                        }))).then(function () {});
                      }, function (oError) {
                        return Promise.resolve(messageHandler.showMessages()).then(function () {
                          // re-throw error to enforce rejecting the general promise
                          throw oError;
                        });
                      });
                      return _temp12 && _temp12.then ? _temp12.then(_temp13) : _temp13(_temp12);
                    });
                  }
                  var _temp14 = function () {
                    if (mParameters.beforeDeleteCallBack) {
                      return Promise.resolve(mParameters.beforeDeleteCallBack({
                        contexts: aContexts
                      })).then(function () {});
                    }
                  }();
                  return _temp14 && _temp14.then ? _temp14.then(_temp15) : _temp15(_temp14);
                }, function () {
                  reject();
                });
              }, function (_wasThrown2, _result6) {
                BusyLocker.unlock(that.oLockObject);
                if (_wasThrown2) throw _result6;
                return _result6;
              }));
            } catch (e) {
              return Promise.reject(e);
            }
          };
          var oDialog = new Dialog({
            title: sTitle,
            state: "Warning",
            content: [oContent],
            ariaLabelledBy: oNonDeletableMessageTextControl.getVisible() ? [oNonDeletableMessageTextControl, oDeleteMessageTextControl] : oDeleteMessageTextControl,
            beginButton: new Button({
              text: oResourceBundleCore.getText("C_COMMON_DELETE"),
              type: "Emphasized",
              press: function () {
                messageHandling.removeBoundTransitionMessages();
                oDialog.close();
                fnConfirm();
              }
            }),
            endButton: new Button({
              text: CommonUtils.getTranslatedText("C_COMMON_DIALOG_CANCEL", oResourceBundle),
              press: function () {
                oDialog.close();
              }
            }),
            afterClose: function () {
              oDialog.destroy();
              // if dialog is closed unconfirmed (e.g. via "Cancel" or Escape button), ensure to reject promise
              if (!bDialogConfirmed) {
                reject();
              }
            }
          });
          if (mParameters.noDialog) {
            fnConfirm();
          } else {
            oDialog.addStyleClass("sapUiContentPadding");
            oDialog.open();
          }
        } finally {
          BusyLocker.unlock(that.oLockObject);
        }
      });
    }
    /**
     * Edits a document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the active document
     * @param oView Current view
     * @param messageHandler
     * @returns Promise resolves with the new draft context in case of draft programming model
     * @ui5-restricted
     * @final
     */;
    _proto.editDocument = function editDocument(oContext, oView, messageHandler) {
      try {
        var _this5 = this;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = _this5;
        var sProgrammingModel = _this5.getProgrammingModel(oContext);
        if (!oContext) {
          throw new Error("Binding context to active document is required");
        }
        if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
          throw new Error("Edit is only allowed for draft or sticky session supported services");
        }
        _this5._bIsModified = false;
        BusyLocker.lock(that.oLockObject);
        // before triggering the edit action we'll have to remove all bound transition messages
        messageHandler.removeTransitionMessages();
        return Promise.resolve(_finallyRethrows(function () {
          return _catch(function () {
            return Promise.resolve(sProgrammingModel === ProgrammingModel.Draft ? draft.createDraftFromActiveDocument(oContext, _this5._getAppComponent(), {
              bPreserveChanges: true,
              oView: oView
            }) : sticky.editDocumentInStickySession(oContext, _this5._getAppComponent())).then(function (oNewContext) {
              _this5._bCreateMode = false;
              return Promise.resolve(messageHandler.showMessageDialog()).then(function () {
                return oNewContext;
              });
            });
          }, function (err) {
            return Promise.resolve(messageHandler.showMessages({
              concurrentEditFlag: true
            })).then(function () {
              throw err;
            });
          });
        }, function (_wasThrown3, _result7) {
          BusyLocker.unlock(that.oLockObject);
          if (_wasThrown3) throw _result7;
          return _result7;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Cancel 'edit' mode of a document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the document to be canceled or deleted
     * @param [mInParameters] Optional, can contain the following attributes:
     * @param mInParameters.cancelButton Cancel Button of the discard popover (mandatory for now)
     * @param mInParameters.skipDiscardPopover Optional, supresses the discard popover incase of draft applications while navigating out of OP
     * @param oResourceBundle
     * @param messageHandler
     * @returns Promise resolves with ???
     * @ui5-restricted
     * @final
     */
    ;
    _proto.cancelDocument = function cancelDocument(oContext, mInParameters, oResourceBundle, messageHandler) {
      try {
        var _this7 = this;
        //context must always be passed - mandatory parameter
        if (!oContext) {
          throw new Error("No context exists. Pass a meaningful context");
        }
        BusyLocker.lock(_this7.oLockObject);
        var mParameters = getParameters(mInParameters);
        var oModel = oContext.getModel();
        var sProgrammingModel = _this7.getProgrammingModel(oContext);
        return Promise.resolve(_finallyRethrows(function () {
          return _catch(function () {
            function _temp26() {
              function _temp24() {
                function _temp22() {
                  var _exit4 = false,
                    _interrupt = false;
                  function _temp20(_result8) {
                    if (_exit4) return _result8;
                    _this7._bIsModified = false;
                    // remove existing bound transition messages
                    messageHandler.removeTransitionMessages();
                    // show unbound messages
                    return Promise.resolve(messageHandler.showMessages()).then(function () {
                      return returnedValue;
                    });
                  }
                  var _temp19 = _switch(sProgrammingModel, [[function () {
                    return ProgrammingModel.Draft;
                  }, function () {
                    return Promise.resolve(oContext.requestObject("HasActiveEntity")).then(function (bHasActiveEntity) {
                      function _temp18() {
                        _interrupt = true;
                      }
                      var _temp17 = function () {
                        if (!bHasActiveEntity) {
                          if (oContext && oContext.hasPendingChanges()) {
                            oContext.getBinding().resetChanges();
                          }
                          return Promise.resolve(draft.deleteDraft(oContext, _this7._oAppComponent)).then(function (_draft$deleteDraft) {
                            returnedValue = _draft$deleteDraft;
                          });
                        } else {
                          var oSiblingContext = oModel.bindContext("".concat(oContext.getPath(), "/SiblingEntity")).getBoundContext();
                          var _temp27 = _finallyRethrows(function () {
                            return Promise.resolve(oSiblingContext.requestCanonicalPath()).then(function (sCanonicalPath) {
                              if (oContext && oContext.hasPendingChanges()) {
                                oContext.getBinding().resetChanges();
                              }
                              returnedValue = oModel.bindContext(sCanonicalPath).getBoundContext();
                            });
                          }, function (_wasThrown4, _result9) {
                            return Promise.resolve(draft.deleteDraft(oContext, _this7._oAppComponent)).then(function () {
                              if (_wasThrown4) throw _result9;
                              return _result9;
                            });
                          });
                          if (_temp27 && _temp27.then) return _temp27.then(function () {});
                        }
                      }();
                      return _temp17 && _temp17.then ? _temp17.then(_temp18) : _temp18(_temp17);
                    });
                  }], [function () {
                    return ProgrammingModel.Sticky;
                  }, function () {
                    return Promise.resolve(sticky.discardDocument(oContext)).then(function (discardedContext) {
                      if (discardedContext) {
                        if (discardedContext.hasPendingChanges()) {
                          discardedContext.getBinding().resetChanges();
                        }
                        if (!_this7._bCreateMode) {
                          discardedContext.refresh();
                          returnedValue = discardedContext;
                        }
                      }
                      _interrupt = true;
                    });
                  }], [void 0, function () {
                    throw new Error("Cancel document only allowed for draft or sticky session supported services");
                  }]]);
                  return _temp19 && _temp19.then ? _temp19.then(_temp20) : _temp20(_temp19);
                }
                if (oContext.isKeepAlive()) {
                  // if the context is kept alive we set it again to detach the onBeforeDestroy callback and handle navigation here
                  // the context needs to still be kept alive to be able to reset changes properly
                  oContext.setKeepAlive(true, undefined);
                }
                var _temp21 = function () {
                  if (mParameters.beforeCancelCallBack) {
                    return Promise.resolve(mParameters.beforeCancelCallBack({
                      context: oContext
                    })).then(function () {});
                  }
                }();
                return _temp21 && _temp21.then ? _temp21.then(_temp22) : _temp22(_temp21);
              }
              var _temp23 = function () {
                if (!mParameters.skipDiscardPopover) {
                  return Promise.resolve(_this7._showDiscardPopover(mParameters.cancelButton, _this7._bIsModified, oResourceBundle)).then(function () {});
                }
              }();
              return _temp23 && _temp23.then ? _temp23.then(_temp24) : _temp24(_temp23);
            }
            var returnedValue = false;
            var _temp25 = function () {
              if (sProgrammingModel === ProgrammingModel.Draft && !_this7._bIsModified) {
                var draftDataContext = oModel.bindContext("".concat(oContext.getPath(), "/DraftAdministrativeData")).getBoundContext();
                return Promise.resolve(draftDataContext.requestObject()).then(function (draftAdminData) {
                  if (draftAdminData) {
                    _this7._bIsModified = !(draftAdminData.CreationDateTime === draftAdminData.LastChangeDateTime);
                  }
                });
              }
            }();
            return _temp25 && _temp25.then ? _temp25.then(_temp26) : _temp26(_temp25);
          }, function (err) {
            return Promise.resolve(messageHandler.showMessages()).then(function () {
              throw err;
            });
          });
        }, function (_wasThrown5, _result10) {
          BusyLocker.unlock(_this7.oLockObject);
          if (_wasThrown5) throw _result10;
          return _result10;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Saves the document.
     *
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @param oContext Context of the document to be saved
     * @param oResourceBundle
     * @param bExecuteSideEffectsOnError
     * @param aBindings
     * @param messageHandler
     * @returns Promise resolves with ???
     * @ui5-restricted
     * @final
     */
    ;
    _proto.saveDocument = function saveDocument(oContext, oResourceBundle, bExecuteSideEffectsOnError, aBindings, messageHandler) {
      try {
        var _this9 = this;
        if (!oContext) {
          return Promise.reject(new Error("Binding context to draft document is required"));
        }
        var sProgrammingModel = _this9.getProgrammingModel(oContext);
        if (sProgrammingModel !== ProgrammingModel.Sticky && sProgrammingModel !== ProgrammingModel.Draft) {
          throw new Error("Save is only allowed for draft or sticky session supported services");
        }
        // in case of saving / activating the bound transition messages shall be removed before the PATCH/POST
        // is sent to the backend
        messageHandler.removeTransitionMessages();
        return Promise.resolve(_finallyRethrows(function () {
          return _catch(function () {
            BusyLocker.lock(_this9.oLockObject);
            return Promise.resolve(sProgrammingModel === ProgrammingModel.Draft ? draft.activateDocument(oContext, _this9._getAppComponent(), {}, messageHandler) : sticky.activateDocument(oContext, _this9._getAppComponent())).then(function (oActiveDocument) {
              var bNewObject = sProgrammingModel === ProgrammingModel.Sticky ? _this9._bCreateMode : !oContext.getObject().HasActiveEntity;
              var messagesReceived = messageHandling.getMessages().concat(messageHandling.getMessages(true, true)); // get unbound and bound messages present in the model
              if (!(messagesReceived.length === 1 && messagesReceived[0].type === coreLibrary.MessageType.Success)) {
                // show our object creation toast only if it is not coming from backend
                MessageToast.show(bNewObject ? CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_OBJECT_CREATED", oResourceBundle) : CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_OBJECT_SAVED", oResourceBundle));
              }
              _this9._bIsModified = false;
              return oActiveDocument;
            });
          }, function (err) {
            if (aBindings && aBindings.length > 0) {
              /* The sideEffects are executed only for table items in transient state */
              aBindings.forEach(function (oListBinding) {
                if (!CommonUtils.hasTransientContext(oListBinding) && bExecuteSideEffectsOnError) {
                  var oAppComponent = _this9._getAppComponent();
                  oAppComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(oListBinding.getPath(), oContext);
                }
              });
            }
            return Promise.resolve(messageHandler.showMessages()).then(function () {
              throw err;
            });
          });
        }, function (_wasThrown6, _result11) {
          BusyLocker.unlock(_this9.oLockObject);
          if (_wasThrown6) throw _result11;
          return _result11;
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Calls a bound or unbound action.
     *
     * @function
     * @static
     * @name sap.fe.core.TransactionHelper.callAction
     * @memberof sap.fe.core.TransactionHelper
     * @param sActionName The name of the action to be called
     * @param [mParameters] Contains the following attributes:
     * @param [mParameters.parameterValues] A map of action parameter names and provided values
     * @param [mParameters.skipParameterDialog] Skips the parameter dialog if values are provided for all of them
     * @param [mParameters.contexts] Mandatory for a bound action: Either one context or an array with contexts for which the action is to be called
     * @param [mParameters.model] Mandatory for an unbound action: An instance of an OData V4 model
     * @param [mParameters.invocationGrouping] Mode how actions are to be called: 'ChangeSet' to put all action calls into one changeset, 'Isolated' to put them into separate changesets
     * @param [mParameters.label] A human-readable label for the action
     * @param [mParameters.bGetBoundContext] If specified, the action promise returns the bound context
     * @param oView Contains the object of the current view
     * @param messageHandler
     * @returns Promise resolves with an array of response objects (TODO: to be changed)
     * @ui5-restricted
     * @final
     */
    ;
    _proto.callAction = function callAction(sActionName, mParameters, oView, messageHandler) {
      try {
        var _this11 = this;
        mParameters = getParameters(mParameters);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        var that = _this11;
        var oContext, oModel;
        var mBindingParameters = mParameters.bindingParameters;
        if (!sActionName) {
          throw new Error("Provide name of action to be executed");
        }
        // action imports are not directly obtained from the metaModel by it is present inside the entityContainer
        // and the acions it refers to present outside the entitycontainer, hence to obtain kind of the action
        // split() on its name was required
        var sName = sActionName.split("/")[1];
        sActionName = sName || sActionName;
        oContext = sName ? undefined : mParameters.contexts;
        //checking whether the context is an array with more than 0 length or not an array(create action)
        if (oContext && (Array.isArray(oContext) && oContext.length || !Array.isArray(oContext))) {
          oContext = Array.isArray(oContext) ? oContext[0] : oContext;
          oModel = oContext.getModel();
        }
        if (mParameters.model) {
          oModel = mParameters.model;
        }
        if (!oModel) {
          throw new Error("Pass a context for a bound action or pass the model for an unbound action");
        }
        // get the binding parameters $select and $expand for the side effect on this action
        // also gather additional property paths to be requested such as text associations
        var oAppComponent = that._getAppComponent();
        var mSideEffectsParameters = oAppComponent.getSideEffectsService().getODataActionSideEffects(sActionName, oContext) || {};
        var displayUnapplicableContextsDialog = function () {
          if (!mParameters.notApplicableContext || mParameters.notApplicableContext.length === 0) {
            return Promise.resolve(mParameters.contexts);
          }
          return new Promise(function (resolve, reject) {
            try {
              var fnOpenAndFillDialog = function (oDlg) {
                var oDialogContent;
                var nNotApplicable = mParameters.notApplicableContext.length,
                  aNotApplicableItems = [];
                for (var i = 0; i < mParameters.notApplicableContext.length; i++) {
                  oDialogContent = mParameters.notApplicableContext[i].getObject();
                  aNotApplicableItems.push(oDialogContent);
                }
                var oNotApplicableItemsModel = new JSONModel(aNotApplicableItems);
                var oTotals = new JSONModel({
                  total: nNotApplicable,
                  label: mParameters.label
                });
                oDlg.setModel(oNotApplicableItemsModel, "notApplicable");
                oDlg.setModel(oTotals, "totals");
                oDlg.open();
              };
              // Show the contexts that are not applicable and will not therefore be processed
              var sFragmentName = "sap.fe.core.controls.ActionPartial";
              var oDialogFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
              var oMetaModel = oModel.getMetaModel();
              var sCanonicalPath = mParameters.contexts[0].getCanonicalPath();
              var sEntitySet = "".concat(sCanonicalPath.substr(0, sCanonicalPath.indexOf("(")), "/");
              var oDialogLabelModel = new JSONModel({
                title: mParameters.label
              });
              var _temp32 = _catch(function () {
                return Promise.resolve(XMLPreprocessor.process(oDialogFragment, {
                  name: sFragmentName
                }, {
                  bindingContexts: {
                    entityType: oMetaModel.createBindingContext(sEntitySet),
                    label: oDialogLabelModel.createBindingContext("/")
                  },
                  models: {
                    entityType: oMetaModel,
                    metaModel: oMetaModel,
                    label: oDialogLabelModel
                  }
                })).then(function (oFragment) {
                  // eslint-disable-next-line prefer-const
                  var oDialog;
                  var oController = {
                    onClose: function () {
                      // User cancels action
                      oDialog.close();
                      resolve();
                    },
                    onContinue: function () {
                      // Users continues the action with the bound contexts
                      oDialog.close();
                      resolve(mParameters.applicableContext);
                    }
                  };
                  return Promise.resolve(Fragment.load({
                    definition: oFragment,
                    controller: oController
                  })).then(function (_Fragment$load) {
                    oDialog = _Fragment$load;
                    oController.onClose = function () {
                      // User cancels action
                      oDialog.close();
                      resolve();
                    };
                    oController.onContinue = function () {
                      // Users continues the action with the bound contexts
                      oDialog.close();
                      resolve(mParameters.applicableContext);
                    };
                    mParameters.parentControl.addDependent(oDialog);
                    fnOpenAndFillDialog(oDialog);
                  });
                });
              }, function (oError) {
                reject(oError);
              });
              return Promise.resolve(_temp32 && _temp32.then ? _temp32.then(function () {}) : void 0);
            } catch (e) {
              return Promise.reject(e);
            }
          });
        };
        return Promise.resolve(_catch(function () {
          function _temp30() {
            return Promise.resolve(_this11._handleActionResponse(messageHandler, mParameters, sActionName)).then(function () {
              return oResult;
            });
          }
          var oResult;
          var _temp29 = function () {
            if (oContext && oModel) {
              return Promise.resolve(displayUnapplicableContextsDialog()).then(function (contextToProcess) {
                var _temp28 = function () {
                  if (contextToProcess) {
                    return Promise.resolve(operations.callBoundAction(sActionName, contextToProcess, oModel, oAppComponent, {
                      parameterValues: mParameters.parameterValues,
                      invocationGrouping: mParameters.invocationGrouping,
                      label: mParameters.label,
                      skipParameterDialog: mParameters.skipParameterDialog,
                      mBindingParameters: mBindingParameters,
                      entitySetName: mParameters.entitySetName,
                      additionalSideEffect: mSideEffectsParameters,
                      onSubmitted: function () {
                        messageHandler.removeTransitionMessages();
                        BusyLocker.lock(that.oLockObject);
                      },
                      onResponse: function () {
                        BusyLocker.unlock(that.oLockObject);
                      },
                      parentControl: mParameters.parentControl,
                      controlId: mParameters.controlId,
                      internalModelContext: mParameters.internalModelContext,
                      operationAvailableMap: mParameters.operationAvailableMap,
                      bIsCreateAction: mParameters.bIsCreateAction,
                      bGetBoundContext: mParameters.bGetBoundContext,
                      bObjectPage: mParameters.bObjectPage,
                      messageHandler: messageHandler,
                      defaultValuesExtensionFunction: mParameters.defaultValuesExtensionFunction,
                      selectedItems: mParameters.contexts
                    })).then(function (_operations$callBound) {
                      oResult = _operations$callBound;
                    });
                  } else {
                    oResult = null;
                  }
                }();
                if (_temp28 && _temp28.then) return _temp28.then(function () {});
              });
            } else {
              return Promise.resolve(operations.callActionImport(sActionName, oModel, oAppComponent, {
                parameterValues: mParameters.parameterValues,
                label: mParameters.label,
                skipParameterDialog: mParameters.skipParameterDialog,
                bindingParameters: mBindingParameters,
                entitySetName: mParameters.entitySetName,
                onSubmitted: function () {
                  BusyLocker.lock(that.oLockObject);
                },
                onResponse: function () {
                  BusyLocker.unlock(that.oLockObject);
                },
                parentControl: mParameters.parentControl,
                internalModelContext: mParameters.internalModelContext,
                operationAvailableMap: mParameters.operationAvailableMap,
                messageHandler: messageHandler,
                bObjectPage: mParameters.bObjectPage
              })).then(function (_operations$callActio) {
                oResult = _operations$callActio;
              });
            }
          }();
          return _temp29 && _temp29.then ? _temp29.then(_temp30) : _temp30(_temp29);
        }, function (err) {
          return Promise.resolve(_this11._handleActionResponse(messageHandler, mParameters, sActionName)).then(function () {
            throw err;
          });
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Handles messages for action call.
     *
     * @function
     * @name sap.fe.core.TransactionHelper#_handleActionResponse
     * @memberof sap.fe.core.TransactionHelper
     * @param messageHandler
     * @param mParameters Parameters to be considered for the action.
     * @param sActionName The name of the action to be called
     * @returns Promise after message dialog is opened if required.
     * @ui5-restricted
     * @final
     */
    ;
    _proto._handleActionResponse = function _handleActionResponse(messageHandler, mParameters, sActionName) {
      var aTransientMessages = messageHandling.getMessages(true, true);
      if (aTransientMessages.length > 0 && mParameters && mParameters.internalModelContext) {
        mParameters.internalModelContext.setProperty("sActionName", mParameters.label ? mParameters.label : sActionName);
      }
      return messageHandler.showMessages();
    }
    /**
     * Handles validation errors for the 'Discard' action.
     *
     * @function
     * @name sap.fe.core.TransactionHelper#handleValidationError
     * @memberof sap.fe.core.TransactionHelper
     * @static
     * @ui5-restricted
     * @final
     */;
    _proto.handleValidationError = function handleValidationError() {
      var oMessageManager = Core.getMessageManager(),
        errorToRemove = oMessageManager.getMessageModel().getData().filter(function (error) {
          // only needs to handle validation messages, technical and persistent errors needs not to be checked here.
          if (error.validation) {
            return error;
          }
        });
      oMessageManager.removeMessages(errorToRemove);
    }
    /**
     * Shows a popover if it needs to be shown.
     * TODO: Popover is shown if user has modified any data.
     * TODO: Popover is shown if there's a difference from draft admin data.
     *
     * @static
     * @name sap.fe.core.TransactionHelper._showDiscardPopover
     * @memberof sap.fe.core.TransactionHelper
     * @param oCancelButton The control which will open the popover
     * @param bIsModified
     * @param oResourceBundle
     * @returns Promise resolves if user confirms discard, rejects if otherwise, rejects if no control passed to open popover
     * @ui5-restricted
     * @final
     */;
    _proto._showDiscardPopover = function _showDiscardPopover(oCancelButton, bIsModified, oResourceBundle) {
      // TODO: Implement this popover as a fragment as in v2??
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      that._bContinueDiscard = false;
      // to be implemented
      return new Promise(function (resolve, reject) {
        if (!oCancelButton) {
          reject("Cancel button not found");
        }
        //Show popover only when data is changed.
        if (bIsModified) {
          var fnOnAfterDiscard = function () {
            oCancelButton.setEnabled(true);
            if (that._bContinueDiscard) {
              resolve();
            } else {
              reject("Discard operation was rejected. Document has not been discarded");
            }
            that._oPopover.detachAfterClose(fnOnAfterDiscard);
          };
          if (!that._oPopover) {
            var oText = new Text({
                //This text is the same as LR v2.
                //TODO: Display message provided by app developer???
                text: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DRAFT_DISCARD_MESSAGE", oResourceBundle)
              }),
              oButton = new Button({
                text: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON", oResourceBundle),
                width: "100%",
                press: function () {
                  that.handleValidationError();
                  that._bContinueDiscard = true;
                  that._oPopover.close();
                },
                ariaLabelledBy: oText
              });
            that._oPopover = new Popover({
              showHeader: false,
              placement: "Top",
              content: [new VBox({
                items: [oText, oButton]
              })],
              beforeOpen: function () {
                // make sure to NOT trigger multiple cancel flows
                oCancelButton.setEnabled(false);
                that._oPopover.setInitialFocus(oButton);
              }
            });
            that._oPopover.addStyleClass("sapUiContentPadding");
          }
          that._oPopover.attachAfterClose(fnOnAfterDiscard);
          that._oPopover.openBy(oCancelButton, false);
        } else {
          that.handleValidationError();
          resolve();
        }
      });
    }
    /**
     * Sets the document to modified state on patch event.
     *
     * @function
     * @static
     * @name sap.fe.core.TransactionHelper.handleDocumentModifications
     * @memberof sap.fe.core.TransactionHelper
     * @ui5-restricted
     * @final
     */;
    _proto.handleDocumentModifications = function handleDocumentModifications() {
      this._bIsModified = true;
    }
    /**
     * Retrieves the owner component.
     *
     * @function
     * @static
     * @private
     * @name sap.fe.core.TransactionHelper._getOwnerComponent
     * @memberof sap.fe.core.TransactionHelper
     * @returns The app component
     * @ui5-restricted
     * @final
     */;
    _proto._getAppComponent = function _getAppComponent() {
      return this._oAppComponent;
    };
    _proto._onFieldChange = function _onFieldChange(oEvent, oCreateButton, messageHandler, fnValidateRequiredProperties) {
      messageHandler.removeTransitionMessages();
      var oField = oEvent.getSource();
      var oFieldPromise = oEvent.getParameter("promise");
      if (oFieldPromise) {
        return oFieldPromise.then(function (value) {
          // Setting value of field as '' in case of value help and validating other fields
          oField.setValue(value);
          fnValidateRequiredProperties();
          return oField.getValue();
        }).catch(function (value) {
          if (value !== "") {
            //disabling the continue button in case of invalid value in field
            oCreateButton.setEnabled(false);
          } else {
            // validating all the fields in case of empty value in field
            oField.setValue(value);
            fnValidateRequiredProperties();
          }
        });
      }
    };
    _proto._getNonDeletableText = function _getNonDeletableText(mParameters, vContexts, oResourceBundle) {
      var aNonDeletableContexts = mParameters.numberOfSelectedContexts - vContexts.concat(mParameters.unSavedContexts).length;
      return aNonDeletableContexts === 1 ? CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_NON_DELETABLE", oResourceBundle, [mParameters.numberOfSelectedContexts]) : CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_NON_DELETABLE", oResourceBundle, [mParameters.numberOfSelectedContexts - vContexts.concat(mParameters.unSavedContexts).length, mParameters.numberOfSelectedContexts]);
    };
    _proto._launchDialogWithKeyFields = function _launchDialogWithKeyFields(oListBinding, mFields, oModel, mParameters, messageHandler) {
      var _this12 = this;
      var oDialog;
      var oParentControl = mParameters.parentControl;

      // Crate a fake (transient) listBinding and context, just for the binding context of the dialog
      var oTransientListBinding = oModel.bindList(oListBinding.getPath(), oListBinding.getContext(), [], [], {
        $$updateGroupId: "submitLater"
      });
      oTransientListBinding.refreshInternal = function () {
        /* */
      };
      var oTransientContext = oTransientListBinding.create(mParameters.data, true);
      return new Promise(function (resolve, reject) {
        try {
          var sFragmentName = "sap/fe/core/controls/NonComputedVisibleKeyFieldsDialog";
          var oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"),
            oResourceBundle = oParentControl.getController().oResourceBundle,
            oMetaModel = oModel.getMetaModel(),
            aImmutableFields = [],
            oAppComponent = _this12._getAppComponent(),
            sPath = oListBinding.isRelative() ? oListBinding.getResolvedPath() : oListBinding.getPath(),
            oEntitySetContext = oMetaModel.createBindingContext(sPath),
            sMetaPath = oMetaModel.getMetaPath(sPath);
          for (var i in mFields) {
            aImmutableFields.push(oMetaModel.createBindingContext("".concat(sMetaPath, "/").concat(mFields[i])));
          }
          var oImmutableCtxModel = new JSONModel(aImmutableFields);
          var oImmutableCtx = oImmutableCtxModel.createBindingContext("/");
          var aRequiredProperties = CommonUtils.getRequiredPropertiesFromInsertRestrictions(sMetaPath, oMetaModel);
          var oRequiredPropertyPathsCtxModel = new JSONModel(aRequiredProperties);
          var oRequiredPropertyPathsCtx = oRequiredPropertyPathsCtxModel.createBindingContext("/");
          return Promise.resolve(XMLPreprocessor.process(oFragment, {
            name: sFragmentName
          }, {
            bindingContexts: {
              entitySet: oEntitySetContext,
              fields: oImmutableCtx,
              requiredProperties: oRequiredPropertyPathsCtx
            },
            models: {
              entitySet: oEntitySetContext.getModel(),
              fields: oImmutableCtx.getModel(),
              metaModel: oMetaModel,
              requiredProperties: oRequiredPropertyPathsCtxModel
            }
          })).then(function (oNewFragment) {
            var aFormElements = [];
            var mFieldValueMap = {};
            // eslint-disable-next-line prefer-const
            var oCreateButton;
            var validateRequiredProperties = function () {
              try {
                function _temp35() {
                  oCreateButton.setEnabled(bEnabled);
                }
                var bEnabled = false;
                var _temp36 = _catch(function () {
                  return Promise.resolve(Promise.all(aFormElements.map(function (oFormElement) {
                    return oFormElement.getFields()[0];
                  }).filter(function (oField) {
                    // The continue button should remain disabled in case of empty required fields.
                    return oField.getRequired() || oField.getValueState() === ValueState.Error;
                  }).map(function (oField) {
                    try {
                      var _exit6 = false;
                      function _temp40(_result13) {
                        return _exit6 ? _result13 : oField.getValue() === "" ? undefined : oField.getValue();
                      }
                      var sFieldId = oField.getId();
                      var _temp41 = function () {
                        if (sFieldId in mFieldValueMap) {
                          return _catch(function () {
                            return Promise.resolve(mFieldValueMap[sFieldId]).then(function (vValue) {
                              var _temp37 = oField.getValue() === "" ? undefined : vValue;
                              _exit6 = true;
                              return _temp37;
                            });
                          }, function () {
                            _exit6 = true;
                            return undefined;
                          });
                        }
                      }();
                      return Promise.resolve(_temp41 && _temp41.then ? _temp41.then(_temp40) : _temp40(_temp41));
                    } catch (e) {
                      return Promise.reject(e);
                    }
                  }))).then(function (aResults) {
                    bEnabled = aResults.every(function (vValue) {
                      if (Array.isArray(vValue)) {
                        vValue = vValue[0];
                      }
                      return vValue !== undefined && vValue !== null && vValue !== "";
                    });
                  });
                }, function () {
                  bEnabled = false;
                });
                return Promise.resolve(_temp36 && _temp36.then ? _temp36.then(_temp35) : _temp35(_temp36));
              } catch (e) {
                return Promise.reject(e);
              }
            };
            var oController = {
              /*
              					fired on focus out from field or on selecting a value from the valuehelp.
              					the create button is enabled when a value is added.
              					liveChange is not fired when value is added from valuehelp.
              					value validation is not done for create button enablement.
              				*/
              handleChange: function (oEvent) {
                var sFieldId = oEvent.getParameter("id");
                mFieldValueMap[sFieldId] = _this12._onFieldChange(oEvent, oCreateButton, messageHandler, validateRequiredProperties);
              },
              /*
              					fired on key press. the create button is enabled when a value is added.
              					liveChange is not fired when value is added from valuehelp.
              					value validation is not done for create button enablement.
              				*/
              handleLiveChange: function (oEvent) {
                var sFieldId = oEvent.getParameter("id");
                var vValue = oEvent.getParameter("value");
                mFieldValueMap[sFieldId] = vValue;
                validateRequiredProperties();
              }
            };
            return Promise.resolve(Fragment.load({
              definition: oNewFragment,
              controller: oController
            })).then(function (oDialogContent) {
              var oResult;
              oDialog = new Dialog({
                title: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE", oResourceBundle),
                content: [oDialogContent],
                beginButton: {
                  text: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE_BUTTON", oResourceBundle),
                  type: "Emphasized",
                  press: function (oEvent) {
                    try {
                      var createButton = oEvent.getSource();
                      createButton.setEnabled(false);
                      BusyLocker.lock(oDialog);
                      mParameters.bIsCreateDialog = true;
                      var _temp45 = _finallyRethrows(function () {
                        return _catch(function () {
                          return Promise.resolve(Promise.all(Object.keys(mFieldValueMap).map(function (sKey) {
                            try {
                              return Promise.resolve(mFieldValueMap[sKey]).then(function (oValue) {
                                var oDialogValue = {};
                                oDialogValue[sKey] = oValue;
                                return oDialogValue;
                              });
                            } catch (e) {
                              return Promise.reject(e);
                            }
                          }))).then(function (aValues) {
                            function _temp43() {
                              var transientData = oTransientContext.getObject();
                              var createData = {};
                              Object.keys(transientData).forEach(function (sPropertyPath) {
                                var oProperty = oMetaModel.getObject("".concat(sMetaPath, "/").concat(sPropertyPath));
                                // ensure navigation properties are not part of the payload, deep create not supported
                                if (oProperty && oProperty.$kind === "NavigationProperty") {
                                  return;
                                }
                                createData[sPropertyPath] = transientData[sPropertyPath];
                              });
                              var oNewDocumentContext = oListBinding.create(createData, true, mParameters.createAtEnd, mParameters.inactive);
                              var oPromise = _this12.onAfterCreateCompletion(oListBinding, oNewDocumentContext, mParameters);
                              return Promise.resolve(oPromise).then(function (oResponse) {
                                if (!oResponse || oResponse && oResponse.bKeepDialogOpen !== true) {
                                  var _oResponse;
                                  oResponse = (_oResponse = oResponse) !== null && _oResponse !== void 0 ? _oResponse : {};
                                  oDialog.setBindingContext(null);
                                  oResponse.newContext = oNewDocumentContext;
                                  oResult = {
                                    response: oResponse
                                  };
                                  oDialog.close();
                                }
                              });
                            }
                            var _temp42 = function () {
                              if (mParameters.beforeCreateCallBack) {
                                return Promise.resolve(toES6Promise(mParameters.beforeCreateCallBack({
                                  contextPath: oListBinding && oListBinding.getPath(),
                                  createParameters: aValues
                                }))).then(function () {});
                              }
                            }();
                            return _temp42 && _temp42.then ? _temp42.then(_temp43) : _temp43(_temp42);
                          });
                        }, function (oError) {
                          if (oError !== FELibrary.Constants.CreationFailed) {
                            // other errors are not expected
                            oResult = {
                              error: oError
                            };
                            oDialog.close();
                          }
                        });
                      }, function (_wasThrown7, _result14) {
                        BusyLocker.unlock(oDialog);
                        createButton.setEnabled(true);
                        messageHandler.showMessages();
                        if (_wasThrown7) throw _result14;
                        return _result14;
                      });
                      return Promise.resolve(_temp45 && _temp45.then ? _temp45.then(function () {}) : void 0);
                    } catch (e) {
                      return Promise.reject(e);
                    }
                  }
                },
                endButton: {
                  text: CommonUtils.getTranslatedText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL", oResourceBundle),
                  press: function () {
                    oResult = {
                      error: FELibrary.Constants.CancelActionDialog
                    };
                    oDialog.close();
                  }
                },
                afterClose: function () {
                  var _oDialog$getBindingCo;
                  // show footer as per UX guidelines when dialog is not open
                  (_oDialog$getBindingCo = oDialog.getBindingContext("internal")) === null || _oDialog$getBindingCo === void 0 ? void 0 : _oDialog$getBindingCo.setProperty("isCreateDialogOpen", false);
                  oDialog.destroy();
                  oTransientListBinding.destroy();
                  if (oResult.error) {
                    reject(oResult.error);
                  } else {
                    resolve(oResult.response);
                  }
                }
              });
              aFormElements = oDialogContent === null || oDialogContent === void 0 ? void 0 : oDialogContent.getAggregation("form").getAggregation("formContainers")[0].getAggregation("formElements");
              if (oParentControl && oParentControl.addDependent) {
                // if there is a parent control specified add the dialog as dependent
                oParentControl.addDependent(oDialog);
              }
              oCreateButton = oDialog.getBeginButton();
              oDialog.setBindingContext(oTransientContext);
              return _catch(function () {
                return Promise.resolve(CommonUtils.setUserDefaults(oAppComponent, aImmutableFields, oTransientContext, false, mParameters.createAction, mParameters.data)).then(function () {
                  validateRequiredProperties();
                  // footer must not be visible when the dialog is open as per UX guidelines
                  oDialog.getBindingContext("internal").setProperty("isCreateDialogOpen", true);
                  oDialog.open();
                });
              }, function (oError) {
                return Promise.resolve(messageHandler.showMessages()).then(function () {
                  throw oError;
                });
              });
            });
          });
        } catch (e) {
          return Promise.reject(e);
        }
      });
    };
    _proto.onAfterCreateCompletion = function onAfterCreateCompletion(oListBinding, oNewDocumentContext, mParameters) {
      var _this13 = this;
      var fnResolve;
      var oPromise = new Promise(function (resolve) {
        fnResolve = resolve;
      });
      var fnCreateCompleted = function (oEvent) {
        var oContext = oEvent.getParameter("context"),
          bSuccess = oEvent.getParameter("success");
        if (oContext === oNewDocumentContext) {
          oListBinding.detachCreateCompleted(fnCreateCompleted, _this13);
          fnResolve(bSuccess);
        }
      };
      var fnSafeContextCreated = function () {
        oNewDocumentContext.created().then(undefined, function () {
          Log.trace("transient creation context deleted");
        }).catch(function (contextError) {
          Log.trace("transient creation context deletion error", contextError);
        });
      };
      oListBinding.attachCreateCompleted(fnCreateCompleted, this);
      return oPromise.then(function (bSuccess) {
        if (!bSuccess) {
          if (!mParameters.keepTransientContextOnFailed) {
            // Cancel the pending POST and delete the context in the listBinding
            fnSafeContextCreated(); // To avoid a 'request cancelled' error in the console
            oListBinding.resetChanges();
            oListBinding.getModel().resetChanges(oListBinding.getUpdateGroupId());
            throw FELibrary.Constants.CreationFailed;
          }
          return {
            bKeepDialogOpen: true
          };
        } else {
          return oNewDocumentContext.created();
        }
      });
    }
    /**
     * Retrieves the name of the NewAction to be executed.
     *
     * @function
     * @static
     * @private
     * @name sap.fe.core.TransactionHelper._getNewAction
     * @memberof sap.fe.core.TransactionHelper
     * @param oStartupParameters Startup parameters of the application
     * @param sCreateHash Hash to be checked for action type
     * @param oMetaModel The MetaModel used to check for NewAction parameter
     * @param sMetaPath The MetaPath
     * @returns The name of the action
     * @ui5-restricted
     * @final
     */;
    _proto._getNewAction = function _getNewAction(oStartupParameters, sCreateHash, oMetaModel, sMetaPath) {
      var sNewAction;
      if (oStartupParameters && oStartupParameters.preferredMode && sCreateHash.toUpperCase().indexOf("I-ACTION=CREATEWITH") > -1) {
        var sPreferredMode = oStartupParameters.preferredMode[0];
        sNewAction = sPreferredMode.toUpperCase().indexOf("CREATEWITH:") > -1 ? sPreferredMode.substr(sPreferredMode.lastIndexOf(":") + 1) : undefined;
      } else if (oStartupParameters && oStartupParameters.preferredMode && sCreateHash.toUpperCase().indexOf("I-ACTION=AUTOCREATEWITH") > -1) {
        var _sPreferredMode = oStartupParameters.preferredMode[0];
        sNewAction = _sPreferredMode.toUpperCase().indexOf("AUTOCREATEWITH:") > -1 ? _sPreferredMode.substr(_sPreferredMode.lastIndexOf(":") + 1) : undefined;
      } else {
        sNewAction = oMetaModel && oMetaModel.getObject !== undefined ? oMetaModel.getObject("".concat(sMetaPath, "@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction")) || oMetaModel.getObject("".concat(sMetaPath, "@com.sap.vocabularies.Common.v1.DraftRoot/NewAction")) : undefined;
      }
      return sNewAction;
    }
    /**
     * Retrieves the label for the title of a specific create action dialog, e.g. Create Sales Order from Quotation.
     *
     * The following priority is applied:
     * 1. label of line-item annotation.
     * 2. label annotated in the action.
     * 3. "Create" as a constant from i18n.
     *
     * @function
     * @static
     * @private
     * @name sap.fe.core.TransactionHelper._getSpecificCreateActionDialogLabel
     * @memberof sap.fe.core.TransactionHelper
     * @param oMetaModel The MetaModel used to check for the NewAction parameter
     * @param sMetaPath The MetaPath
     * @param sNewAction Contains the name of the action to be executed
     * @param oResourceBundleCore ResourceBundle to access the default Create label
     * @returns The label for the Create Action Dialog
     * @ui5-restricted
     * @final
     */;
    _proto._getSpecificCreateActionDialogLabel = function _getSpecificCreateActionDialogLabel(oMetaModel, sMetaPath, sNewAction, oResourceBundleCore) {
      var fnGetLabelFromLineItemAnnotation = function () {
        if (oMetaModel && oMetaModel.getObject("".concat(sMetaPath, "/@com.sap.vocabularies.UI.v1.LineItem"))) {
          var iLineItemIndex = oMetaModel.getObject("".concat(sMetaPath, "/@com.sap.vocabularies.UI.v1.LineItem")).findIndex(function (oLineItem) {
            var aLineItemAction = oLineItem.Action ? oLineItem.Action.split("(") : undefined;
            return aLineItemAction ? aLineItemAction[0] === sNewAction : false;
          });
          return iLineItemIndex > -1 ? oMetaModel.getObject("".concat(sMetaPath, "/@com.sap.vocabularies.UI.v1.LineItem"))[iLineItemIndex].Label : undefined;
        } else {
          return undefined;
        }
      };
      return fnGetLabelFromLineItemAnnotation() || oMetaModel && oMetaModel.getObject("".concat(sMetaPath, "/").concat(sNewAction, "@com.sap.vocabularies.Common.v1.Label")) || oResourceBundleCore && oResourceBundleCore.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE");
    };
    return TransactionHelper;
  }();
  return TransactionHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiZmluYWxpemVyIiwiYmluZCIsInBhY3QiLCJzdGF0ZSIsInZhbHVlIiwicyIsInYiLCJvIiwib2JzZXJ2ZXIiLCJwcm90b3R5cGUiLCJvbkZ1bGZpbGxlZCIsIm9uUmVqZWN0ZWQiLCJjYWxsYmFjayIsIl90aGlzIiwiZGlzY3JpbWluYW50IiwiY2FzZXMiLCJkaXNwYXRjaEluZGV4IiwiYXdhaXRCb2R5Iiwib3V0ZXIiLCJpIiwibGVuZ3RoIiwidGVzdCIsInRlc3RWYWx1ZSIsImZhbGx0aHJvdWdoQ2hlY2siLCJyZWplY3QiLCJfcmVzdW1lQWZ0ZXJCb2R5IiwiX3Jlc3VtZUFmdGVyVGVzdCIsIkNyZWF0aW9uTW9kZSIsIkZFTGlicmFyeSIsIlByb2dyYW1taW5nTW9kZWwiLCJWYWx1ZVN0YXRlIiwiY29yZUxpYnJhcnkiLCJnZXRQYXJhbWV0ZXJzIiwibVBhcmFtZXRlcnMiLCJnZXRNZXRhZGF0YSIsImdldE5hbWUiLCJUcmFuc2FjdGlvbkhlbHBlciIsIm9BcHBDb21wb25lbnQiLCJvTG9ja09iamVjdCIsIl9iSXNNb2RpZmllZCIsIl9iQ3JlYXRlTW9kZSIsIl9iQ29udGludWVEaXNjYXJkIiwiX29BcHBDb21wb25lbnQiLCJnZXRQcm9ncmFtbWluZ01vZGVsIiwib0NvbnRleHQiLCJzUHJvZ3JhbW1pbmdNb2RlbCIsInNQYXRoIiwiaXNBIiwiZ2V0UGF0aCIsImlzUmVsYXRpdmUiLCJnZXRSZXNvbHZlZFBhdGgiLCJNb2RlbEhlbHBlciIsImlzRHJhZnRTdXBwb3J0ZWQiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsIkRyYWZ0IiwiaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkIiwiU3RpY2t5IiwiTm9uRHJhZnQiLCJ2YWxpZGF0ZURvY3VtZW50Iiwib1ZpZXciLCJzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uIiwiY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uIiwic01vZHVsZSIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwicmVwbGFjZSIsInNGdW5jdGlvbk5hbWUiLCJtRGF0YSIsImRhdGEiLCJGUE1IZWxwZXIiLCJ2YWxpZGF0aW9uV3JhcHBlciIsIlByb21pc2UiLCJyZXNvbHZlIiwiY3JlYXRlRG9jdW1lbnQiLCJvTWFpbkxpc3RCaW5kaW5nIiwibUluUGFyYW1ldGVycyIsIm9SZXNvdXJjZUJ1bmRsZSIsIm1lc3NhZ2VIYW5kbGVyIiwiYkZyb21Db3B5UGFzdGUiLCJvTW9kZWwiLCJvTWV0YU1vZGVsIiwic01ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJnZXRIZWFkZXJDb250ZXh0Iiwic0NyZWF0ZUhhc2giLCJfZ2V0QXBwQ29tcG9uZW50IiwiZ2V0Um91dGVyUHJveHkiLCJnZXRIYXNoIiwib0NvbXBvbmVudERhdGEiLCJnZXRDb21wb25lbnREYXRhIiwib1N0YXJ0dXBQYXJhbWV0ZXJzIiwic3RhcnR1cFBhcmFtZXRlcnMiLCJzTmV3QWN0aW9uIiwiX2dldE5ld0FjdGlvbiIsInVuZGVmaW5lZCIsIm1CaW5kaW5nUGFyYW1ldGVycyIsInNNZXNzYWdlc1BhdGgiLCJnZXRPYmplY3QiLCJzQnVzeVBhdGgiLCJnZXRUYXJnZXRFbnRpdHlTZXQiLCJnZXRDb250ZXh0IiwiYkZ1bmN0aW9uT25OYXZQcm9wIiwib05ld0RvY3VtZW50Q29udGV4dCIsIkVycm9yIiwiYnVzeU1vZGUiLCJidXN5SWQiLCJiZWZvcmVDcmVhdGVDYWxsQmFjayIsIkJ1c3lMb2NrZXIiLCJsb2NrIiwib1Jlc291cmNlQnVuZGxlQ29yZSIsIkNvcmUiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJvUmVzdWx0IiwiYkNvbnNpZGVyRG9jdW1lbnRNb2RpZmllZCIsImhhbmRsZURvY3VtZW50TW9kaWZpY2F0aW9ucyIsInNob3dNZXNzYWdlRGlhbG9nIiwiY2FsbEFjdGlvbiIsImNvbnRleHRzIiwic2hvd0FjdGlvblBhcmFtZXRlckRpYWxvZyIsImxhYmVsIiwiX2dldFNwZWNpZmljQ3JlYXRlQWN0aW9uRGlhbG9nTGFiZWwiLCJiaW5kaW5nUGFyYW1ldGVycyIsInBhcmVudENvbnRyb2wiLCJiSXNDcmVhdGVBY3Rpb24iLCJza2lwUGFyYW1ldGVyRGlhbG9nIiwiYklzTmV3UGFnZUNyZWF0aW9uIiwiY3JlYXRpb25Nb2RlIiwiQ3JlYXRpb25Sb3ciLCJJbmxpbmUiLCJhTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzIiwiQ29tbW9uVXRpbHMiLCJnZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMiLCJzRnVuY3Rpb25QYXRoIiwib0Z1bmN0aW9uQ29udGV4dCIsIm9GdW5jdGlvbiIsImNyZWF0ZUJpbmRpbmdDb250ZXh0Iiwib0RhdGEiLCJPYmplY3QiLCJhc3NpZ24iLCJfbGF1bmNoRGlhbG9nV2l0aEtleUZpZWxkcyIsIm5ld0NvbnRleHQiLCJjcmVhdGUiLCJjcmVhdGVBdEVuZCIsImluYWN0aXZlIiwib25BZnRlckNyZWF0ZUNvbXBsZXRpb24iLCJ0b0VTNlByb21pc2UiLCJjb250ZXh0UGF0aCIsIiRJc0JvdW5kIiwib3BlcmF0aW9ucyIsImNhbGxCb3VuZEZ1bmN0aW9uIiwiY2FsbEZ1bmN0aW9uSW1wb3J0Iiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJDb25zdGFudHMiLCJBY3Rpb25FeGVjdXRpb25GYWlsZWQiLCJDYW5jZWxBY3Rpb25EaWFsb2ciLCJpc1RyYW5zaWVudCIsImRlbGV0ZSIsInVubG9jayIsImZpbmRBY3RpdmVEcmFmdFJvb3RDb250ZXh0cyIsImFDb250ZXh0cyIsImJGaW5kQWN0aXZlQ29udGV4dHMiLCJhY3RpdmVDb250ZXh0cyIsInJlZHVjZSIsImFSZXN1bHQiLCJiSXNBY3RpdmVFbnRpdHkiLCJJc0FjdGl2ZUVudGl0eSIsImJIYXNBY3RpdmVFbnRpdHkiLCJIYXNBY3RpdmVFbnRpdHkiLCJvQWN0aXZlQ29udGV4dCIsImJpbmRDb250ZXh0IiwiZ2V0Qm91bmRDb250ZXh0IiwicHVzaCIsImFsbCIsIm1hcCIsInJlcXVlc3RDYW5vbmljYWxQYXRoIiwiYWZ0ZXJEZWxldGVQcm9jZXNzIiwiY2hlY2tCb3giLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJpbnRlcm5hbE1vZGVsQ29udGV4dCIsImdldFByb3BlcnR5IiwiaXNDaGVja0JveFZpc2libGUiLCJpc0NoZWNrQm94U2VsZWN0ZWQiLCJzZXRQcm9wZXJ0eSIsIm9iaiIsInNlbGVjdGVkQ29udGV4dHMiLCJmaWx0ZXIiLCJlbGVtZW50IiwiZGVsZXRhYmxlQ29udGV4dHMiLCJpbmRleE9mIiwibnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzIiwiTWVzc2FnZVRvYXN0Iiwic2hvdyIsImdldFRyYW5zbGF0ZWRUZXh0IiwiZW50aXR5U2V0TmFtZSIsImRlbGV0ZURvY3VtZW50IiwidkluQ29udGV4dHMiLCJhRGVsZXRhYmxlQ29udGV4dHMiLCJpc0xvY2tlZFRleHRWaXNpYmxlIiwiY2Fubm90QmVEZWxldGVkVGV4dFZpc2libGUiLCJiRGlhbG9nQ29uZmlybWVkIiwidGhhdCIsImFQYXJhbXMiLCJvRGVsZXRlTWVzc2FnZSIsInRpdGxlIiwiZ2V0VGV4dCIsInZDb250ZXh0cyIsIkFycmF5IiwiaXNBcnJheSIsIm9Db250ZXh0RGF0YSIsIkhhc0RyYWZ0RW50aXR5IiwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEiLCJJblByb2Nlc3NCeVVzZXIiLCJEcmFmdElzQ3JlYXRlZEJ5TWUiLCJzTG9ja2VkVXNlciIsImRyYWZ0QWRtaW5EYXRhIiwiTWVzc2FnZUJveCIsIm9uQ2xvc2UiLCJkZXNjcmlwdGlvbiIsInRleHQiLCJvTGluZUNvbnRleHREYXRhIiwib1RhYmxlIiwic0tleSIsImdldFBhcmVudCIsImdldElkZW50aWZpZXJDb2x1bW4iLCJzS2V5VmFsdWUiLCJzRGVzY3JpcHRpb24iLCJwYXRoIiwidW5TYXZlZENvbnRleHRzIiwic0xhc3RDaGFuZ2VkQnlVc2VyIiwiY29uY2F0IiwibG9ja2VkQ29udGV4dHMiLCJub25EZWxldGFibGVUZXh0IiwiX2dldE5vbkRlbGV0YWJsZVRleHQiLCJjaGVja0JveFRleHQiLCJzTm9uRGVsZXRhYmxlQ29udGV4dFRleHQiLCJvTm9uRGVsZXRhYmxlTWVzc2FnZVRleHRDb250cm9sIiwib0RlbGV0ZU1lc3NhZ2VUZXh0Q29udHJvbCIsIm9Db250ZW50IiwiVkJveCIsIml0ZW1zIiwiVGV4dCIsInZpc2libGUiLCJDaGVja0JveCIsInNlbGVjdGVkIiwic2VsZWN0Iiwib0V2ZW50IiwiZ2V0U291cmNlIiwiZ2V0U2VsZWN0ZWQiLCJzVGl0bGUiLCJmbkNvbmZpcm0iLCJiRW5hYmxlU3RyaWN0SGFuZGxpbmciLCJkcmFmdCIsImRlbGV0ZURyYWZ0Iiwic2hvd01lc3NhZ2VzIiwiYmVmb3JlRGVsZXRlQ2FsbEJhY2siLCJvRGlhbG9nIiwiRGlhbG9nIiwiY29udGVudCIsImFyaWFMYWJlbGxlZEJ5IiwiZ2V0VmlzaWJsZSIsImJlZ2luQnV0dG9uIiwiQnV0dG9uIiwidHlwZSIsInByZXNzIiwibWVzc2FnZUhhbmRsaW5nIiwicmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJjbG9zZSIsImVuZEJ1dHRvbiIsImFmdGVyQ2xvc2UiLCJkZXN0cm95Iiwibm9EaWFsb2ciLCJhZGRTdHlsZUNsYXNzIiwib3BlbiIsImVkaXREb2N1bWVudCIsInJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyIsImNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50IiwiYlByZXNlcnZlQ2hhbmdlcyIsInN0aWNreSIsImVkaXREb2N1bWVudEluU3RpY2t5U2Vzc2lvbiIsIm9OZXdDb250ZXh0IiwiZXJyIiwiY29uY3VycmVudEVkaXRGbGFnIiwiY2FuY2VsRG9jdW1lbnQiLCJyZXR1cm5lZFZhbHVlIiwicmVxdWVzdE9iamVjdCIsImhhc1BlbmRpbmdDaGFuZ2VzIiwiZ2V0QmluZGluZyIsInJlc2V0Q2hhbmdlcyIsIm9TaWJsaW5nQ29udGV4dCIsInNDYW5vbmljYWxQYXRoIiwiZGlzY2FyZERvY3VtZW50IiwiZGlzY2FyZGVkQ29udGV4dCIsInJlZnJlc2giLCJpc0tlZXBBbGl2ZSIsInNldEtlZXBBbGl2ZSIsImJlZm9yZUNhbmNlbENhbGxCYWNrIiwiY29udGV4dCIsInNraXBEaXNjYXJkUG9wb3ZlciIsIl9zaG93RGlzY2FyZFBvcG92ZXIiLCJjYW5jZWxCdXR0b24iLCJkcmFmdERhdGFDb250ZXh0IiwiQ3JlYXRpb25EYXRlVGltZSIsIkxhc3RDaGFuZ2VEYXRlVGltZSIsInNhdmVEb2N1bWVudCIsImJFeGVjdXRlU2lkZUVmZmVjdHNPbkVycm9yIiwiYUJpbmRpbmdzIiwiYWN0aXZhdGVEb2N1bWVudCIsIm9BY3RpdmVEb2N1bWVudCIsImJOZXdPYmplY3QiLCJtZXNzYWdlc1JlY2VpdmVkIiwiZ2V0TWVzc2FnZXMiLCJNZXNzYWdlVHlwZSIsIlN1Y2Nlc3MiLCJmb3JFYWNoIiwib0xpc3RCaW5kaW5nIiwiaGFzVHJhbnNpZW50Q29udGV4dCIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsInJlcXVlc3RTaWRlRWZmZWN0c0Zvck5hdmlnYXRpb25Qcm9wZXJ0eSIsInNBY3Rpb25OYW1lIiwic05hbWUiLCJzcGxpdCIsIm1vZGVsIiwibVNpZGVFZmZlY3RzUGFyYW1ldGVycyIsImdldE9EYXRhQWN0aW9uU2lkZUVmZmVjdHMiLCJkaXNwbGF5VW5hcHBsaWNhYmxlQ29udGV4dHNEaWFsb2ciLCJub3RBcHBsaWNhYmxlQ29udGV4dCIsImZuT3BlbkFuZEZpbGxEaWFsb2ciLCJvRGxnIiwib0RpYWxvZ0NvbnRlbnQiLCJuTm90QXBwbGljYWJsZSIsImFOb3RBcHBsaWNhYmxlSXRlbXMiLCJvTm90QXBwbGljYWJsZUl0ZW1zTW9kZWwiLCJKU09OTW9kZWwiLCJvVG90YWxzIiwidG90YWwiLCJzZXRNb2RlbCIsInNGcmFnbWVudE5hbWUiLCJvRGlhbG9nRnJhZ21lbnQiLCJYTUxUZW1wbGF0ZVByb2Nlc3NvciIsImxvYWRUZW1wbGF0ZSIsImdldENhbm9uaWNhbFBhdGgiLCJzRW50aXR5U2V0Iiwic3Vic3RyIiwib0RpYWxvZ0xhYmVsTW9kZWwiLCJYTUxQcmVwcm9jZXNzb3IiLCJwcm9jZXNzIiwibmFtZSIsImJpbmRpbmdDb250ZXh0cyIsImVudGl0eVR5cGUiLCJtb2RlbHMiLCJtZXRhTW9kZWwiLCJvRnJhZ21lbnQiLCJvQ29udHJvbGxlciIsIm9uQ29udGludWUiLCJhcHBsaWNhYmxlQ29udGV4dCIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJjb250cm9sbGVyIiwiYWRkRGVwZW5kZW50IiwiX2hhbmRsZUFjdGlvblJlc3BvbnNlIiwiY29udGV4dFRvUHJvY2VzcyIsImNhbGxCb3VuZEFjdGlvbiIsInBhcmFtZXRlclZhbHVlcyIsImludm9jYXRpb25Hcm91cGluZyIsImFkZGl0aW9uYWxTaWRlRWZmZWN0Iiwib25TdWJtaXR0ZWQiLCJvblJlc3BvbnNlIiwiY29udHJvbElkIiwib3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiYkdldEJvdW5kQ29udGV4dCIsImJPYmplY3RQYWdlIiwiZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uIiwic2VsZWN0ZWRJdGVtcyIsImNhbGxBY3Rpb25JbXBvcnQiLCJhVHJhbnNpZW50TWVzc2FnZXMiLCJoYW5kbGVWYWxpZGF0aW9uRXJyb3IiLCJvTWVzc2FnZU1hbmFnZXIiLCJnZXRNZXNzYWdlTWFuYWdlciIsImVycm9yVG9SZW1vdmUiLCJnZXRNZXNzYWdlTW9kZWwiLCJnZXREYXRhIiwidmFsaWRhdGlvbiIsInJlbW92ZU1lc3NhZ2VzIiwib0NhbmNlbEJ1dHRvbiIsImJJc01vZGlmaWVkIiwiZm5PbkFmdGVyRGlzY2FyZCIsInNldEVuYWJsZWQiLCJfb1BvcG92ZXIiLCJkZXRhY2hBZnRlckNsb3NlIiwib1RleHQiLCJvQnV0dG9uIiwid2lkdGgiLCJQb3BvdmVyIiwic2hvd0hlYWRlciIsInBsYWNlbWVudCIsImJlZm9yZU9wZW4iLCJzZXRJbml0aWFsRm9jdXMiLCJhdHRhY2hBZnRlckNsb3NlIiwib3BlbkJ5IiwiX29uRmllbGRDaGFuZ2UiLCJvQ3JlYXRlQnV0dG9uIiwiZm5WYWxpZGF0ZVJlcXVpcmVkUHJvcGVydGllcyIsIm9GaWVsZCIsIm9GaWVsZFByb21pc2UiLCJnZXRQYXJhbWV0ZXIiLCJzZXRWYWx1ZSIsImdldFZhbHVlIiwiY2F0Y2giLCJhTm9uRGVsZXRhYmxlQ29udGV4dHMiLCJtRmllbGRzIiwib1BhcmVudENvbnRyb2wiLCJvVHJhbnNpZW50TGlzdEJpbmRpbmciLCJiaW5kTGlzdCIsIiQkdXBkYXRlR3JvdXBJZCIsInJlZnJlc2hJbnRlcm5hbCIsIm9UcmFuc2llbnRDb250ZXh0IiwiZ2V0Q29udHJvbGxlciIsImFJbW11dGFibGVGaWVsZHMiLCJvRW50aXR5U2V0Q29udGV4dCIsIm9JbW11dGFibGVDdHhNb2RlbCIsIm9JbW11dGFibGVDdHgiLCJhUmVxdWlyZWRQcm9wZXJ0aWVzIiwiZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyIsIm9SZXF1aXJlZFByb3BlcnR5UGF0aHNDdHhNb2RlbCIsIm9SZXF1aXJlZFByb3BlcnR5UGF0aHNDdHgiLCJlbnRpdHlTZXQiLCJmaWVsZHMiLCJyZXF1aXJlZFByb3BlcnRpZXMiLCJvTmV3RnJhZ21lbnQiLCJhRm9ybUVsZW1lbnRzIiwibUZpZWxkVmFsdWVNYXAiLCJ2YWxpZGF0ZVJlcXVpcmVkUHJvcGVydGllcyIsImJFbmFibGVkIiwib0Zvcm1FbGVtZW50IiwiZ2V0RmllbGRzIiwiZ2V0UmVxdWlyZWQiLCJnZXRWYWx1ZVN0YXRlIiwic0ZpZWxkSWQiLCJnZXRJZCIsInZWYWx1ZSIsImFSZXN1bHRzIiwiZXZlcnkiLCJoYW5kbGVDaGFuZ2UiLCJoYW5kbGVMaXZlQ2hhbmdlIiwiY3JlYXRlQnV0dG9uIiwiYklzQ3JlYXRlRGlhbG9nIiwia2V5cyIsIm9WYWx1ZSIsIm9EaWFsb2dWYWx1ZSIsImFWYWx1ZXMiLCJ0cmFuc2llbnREYXRhIiwiY3JlYXRlRGF0YSIsInNQcm9wZXJ0eVBhdGgiLCJvUHJvcGVydHkiLCIka2luZCIsIm9Qcm9taXNlIiwib1Jlc3BvbnNlIiwiYktlZXBEaWFsb2dPcGVuIiwic2V0QmluZGluZ0NvbnRleHQiLCJyZXNwb25zZSIsImNyZWF0ZVBhcmFtZXRlcnMiLCJDcmVhdGlvbkZhaWxlZCIsImdldEJpbmRpbmdDb250ZXh0IiwiZ2V0QWdncmVnYXRpb24iLCJnZXRCZWdpbkJ1dHRvbiIsInNldFVzZXJEZWZhdWx0cyIsImNyZWF0ZUFjdGlvbiIsImZuUmVzb2x2ZSIsImZuQ3JlYXRlQ29tcGxldGVkIiwiYlN1Y2Nlc3MiLCJkZXRhY2hDcmVhdGVDb21wbGV0ZWQiLCJmblNhZmVDb250ZXh0Q3JlYXRlZCIsImNyZWF0ZWQiLCJ0cmFjZSIsImNvbnRleHRFcnJvciIsImF0dGFjaENyZWF0ZUNvbXBsZXRlZCIsImtlZXBUcmFuc2llbnRDb250ZXh0T25GYWlsZWQiLCJnZXRVcGRhdGVHcm91cElkIiwicHJlZmVycmVkTW9kZSIsInRvVXBwZXJDYXNlIiwic1ByZWZlcnJlZE1vZGUiLCJmbkdldExhYmVsRnJvbUxpbmVJdGVtQW5ub3RhdGlvbiIsImlMaW5lSXRlbUluZGV4IiwiZmluZEluZGV4Iiwib0xpbmVJdGVtIiwiYUxpbmVJdGVtQWN0aW9uIiwiQWN0aW9uIiwiTGFiZWwiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRyYW5zYWN0aW9uSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIFJlc291cmNlQnVuZGxlIGZyb20gXCJzYXAvYmFzZS9pMThuL1Jlc291cmNlQnVuZGxlXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgQnVzeUxvY2tlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvQnVzeUxvY2tlclwiO1xuaW1wb3J0IGRyYWZ0IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9lZGl0Rmxvdy9kcmFmdFwiO1xuaW1wb3J0IG9wZXJhdGlvbnMgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L29wZXJhdGlvbnNcIjtcbmltcG9ydCBzdGlja3kgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L3N0aWNreVwiO1xuaW1wb3J0IHR5cGUgTWVzc2FnZUhhbmRsZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL01lc3NhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgbWVzc2FnZUhhbmRsaW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9tZXNzYWdlSGFuZGxlci9tZXNzYWdlSGFuZGxpbmdcIjtcbmltcG9ydCBGUE1IZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRlBNSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IEZFTGlicmFyeSBmcm9tIFwic2FwL2ZlL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgQ2hlY2tCb3ggZnJvbSBcInNhcC9tL0NoZWNrQm94XCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBNZXNzYWdlQm94IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgTWVzc2FnZVRvYXN0IGZyb20gXCJzYXAvbS9NZXNzYWdlVG9hc3RcIjtcbmltcG9ydCBQb3BvdmVyIGZyb20gXCJzYXAvbS9Qb3BvdmVyXCI7XG5pbXBvcnQgVGV4dCBmcm9tIFwic2FwL20vVGV4dFwiO1xuaW1wb3J0IFZCb3ggZnJvbSBcInNhcC9tL1ZCb3hcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgY29yZUxpYnJhcnkgZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IFhNTFRlbXBsYXRlUHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS9YTUxUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFWNENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBPRGF0YUxpc3RCaW5kaW5nLCBWNENvbnRleHQgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5pbXBvcnQgdG9FUzZQcm9taXNlIGZyb20gXCIuLi8uLi9oZWxwZXJzL1RvRVM2UHJvbWlzZVwiO1xuXG5jb25zdCBDcmVhdGlvbk1vZGUgPSBGRUxpYnJhcnkuQ3JlYXRpb25Nb2RlO1xuY29uc3QgUHJvZ3JhbW1pbmdNb2RlbCA9IEZFTGlicmFyeS5Qcm9ncmFtbWluZ01vZGVsO1xuY29uc3QgVmFsdWVTdGF0ZSA9IGNvcmVMaWJyYXJ5LlZhbHVlU3RhdGU7XG4vKiBNYWtlIHN1cmUgdGhhdCB0aGUgbVBhcmFtZXRlcnMgaXMgbm90IHRoZSBvRXZlbnQgKi9cbmZ1bmN0aW9uIGdldFBhcmFtZXRlcnMobVBhcmFtZXRlcnM6IGFueSkge1xuXHRpZiAobVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuZ2V0TWV0YWRhdGEgJiYgbVBhcmFtZXRlcnMuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCkgPT09IFwic2FwLnVpLmJhc2UuRXZlbnRcIikge1xuXHRcdG1QYXJhbWV0ZXJzID0ge307XG5cdH1cblx0cmV0dXJuIG1QYXJhbWV0ZXJzIHx8IHt9O1xufVxuXG5jbGFzcyBUcmFuc2FjdGlvbkhlbHBlciB7XG5cdF9vQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQ7XG5cdG9Mb2NrT2JqZWN0OiBhbnk7XG5cdHNQcm9ncmFtbWluZ01vZGVsPzogdHlwZW9mIFByb2dyYW1taW5nTW9kZWw7XG5cdF9iSXNNb2RpZmllZDogYm9vbGVhbiA9IGZhbHNlO1xuXHRfYkNyZWF0ZU1vZGU6IGJvb2xlYW4gPSBmYWxzZTtcblx0X2JDb250aW51ZURpc2NhcmQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0X29Qb3BvdmVyITogUG9wb3Zlcjtcblx0Y29uc3RydWN0b3Iob0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LCBvTG9ja09iamVjdDogYW55KSB7XG5cdFx0dGhpcy5fb0FwcENvbXBvbmVudCA9IG9BcHBDb21wb25lbnQ7XG5cdFx0dGhpcy5vTG9ja09iamVjdCA9IG9Mb2NrT2JqZWN0O1xuXHR9XG5cdGdldFByb2dyYW1taW5nTW9kZWwob0NvbnRleHQ/OiBhbnkpOiB0eXBlb2YgUHJvZ3JhbW1pbmdNb2RlbCB7XG5cdFx0aWYgKCF0aGlzLnNQcm9ncmFtbWluZ01vZGVsICYmIG9Db250ZXh0KSB7XG5cdFx0XHRsZXQgc1BhdGg7XG5cdFx0XHRpZiAob0NvbnRleHQuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHRcIikpIHtcblx0XHRcdFx0c1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzUGF0aCA9IG9Db250ZXh0LmlzUmVsYXRpdmUoKSA/IG9Db250ZXh0LmdldFJlc29sdmVkUGF0aCgpIDogb0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQob0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSwgc1BhdGgpKSB7XG5cdFx0XHRcdHRoaXMuc1Byb2dyYW1taW5nTW9kZWwgPSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0O1xuXHRcdFx0fSBlbHNlIGlmIChNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQob0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSkpIHtcblx0XHRcdFx0dGhpcy5zUHJvZ3JhbW1pbmdNb2RlbCA9IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gYXMgdGhlIHRyYW5zYWN0aW9uIGhlbHBlciBpcyBhIHNpbmdsZXRvbiB3ZSBkb24ndCBzdG9yZSB0aGUgbm9uIGRyYWZ0IGFzIHRoZSB1c2VyIGNvdWxkXG5cdFx0XHRcdC8vIHN0YXJ0IHdpdGggYSBub24gZHJhZnQgY2hpbGQgcGFnZSBhbmQgbmF2aWdhdGVzIGJhY2sgdG8gYSBkcmFmdCBlbmFibGVkIG9uZVxuXHRcdFx0XHRyZXR1cm4gUHJvZ3JhbW1pbmdNb2RlbC5Ob25EcmFmdDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuc1Byb2dyYW1taW5nTW9kZWw7XG5cdH1cblxuXHQvKipcblx0ICogVmFsaWRhdGVzIGEgZG9jdW1lbnQuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBkb2N1bWVudCB0byBiZSB2YWxpZGF0ZWRcblx0ICogQHBhcmFtIFttUGFyYW1ldGVyc10gQ2FuIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmRhdGFdIEEgbWFwIG9mIGRhdGEgdGhhdCBzaG91bGQgYmUgdmFsaWRhdGVkXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uXSBBIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIHBhdGggdG8gdGhlIHZhbGlkYXRpb24gZnVuY3Rpb25cblx0ICogQHBhcmFtIG9WaWV3IENvbnRhaW5zIHRoZSBvYmplY3Qgb2YgdGhlIGN1cnJlbnQgdmlld1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggcmVzdWx0IG9mIHRoZSBjdXN0b20gdmFsaWRhdGlvbiBmdW5jdGlvblxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHR2YWxpZGF0ZURvY3VtZW50KG9Db250ZXh0OiBWNENvbnRleHQsIG1QYXJhbWV0ZXJzOiBhbnksIG9WaWV3OiBWaWV3KTogUHJvbWlzZTxhbnk+IHtcblx0XHRjb25zdCBzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uO1xuXHRcdGlmIChzQ3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uKSB7XG5cdFx0XHRjb25zdCBzTW9kdWxlID0gc0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbi5zdWJzdHJpbmcoMCwgc0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbi5sYXN0SW5kZXhPZihcIi5cIikgfHwgLTEpLnJlcGxhY2UoL1xcLi9naSwgXCIvXCIpLFxuXHRcdFx0XHRzRnVuY3Rpb25OYW1lID0gc0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbi5zdWJzdHJpbmcoXG5cdFx0XHRcdFx0c0N1c3RvbVZhbGlkYXRpb25GdW5jdGlvbi5sYXN0SW5kZXhPZihcIi5cIikgKyAxLFxuXHRcdFx0XHRcdHNDdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24ubGVuZ3RoXG5cdFx0XHRcdCksXG5cdFx0XHRcdG1EYXRhID0gbVBhcmFtZXRlcnMuZGF0YTtcblx0XHRcdGRlbGV0ZSBtRGF0YVtcIkAkdWk1LmNvbnRleHQuaXNUcmFuc2llbnRcIl07XG5cdFx0XHRyZXR1cm4gRlBNSGVscGVyLnZhbGlkYXRpb25XcmFwcGVyKHNNb2R1bGUsIHNGdW5jdGlvbk5hbWUsIG1EYXRhLCBvVmlldywgb0NvbnRleHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKFtdKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgbmV3IGRvY3VtZW50LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHN0YXRpY1xuXHQgKiBAcGFyYW0gb01haW5MaXN0QmluZGluZyBPRGF0YSBWNCBMaXN0QmluZGluZyBvYmplY3Rcblx0ICogQHBhcmFtIFttSW5QYXJhbWV0ZXJzXSBPcHRpb25hbCwgY2FuIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gW21JblBhcmFtZXRlcnMuZGF0YV0gQSBtYXAgb2YgZGF0YSB0aGF0IHNob3VsZCBiZSBzZW50IHdpdGhpbiB0aGUgUE9TVFxuXHQgKiBAcGFyYW0gW21JblBhcmFtZXRlcnMuYnVzeU1vZGVdIEdsb2JhbCAoZGVmYXVsdCksIExvY2FsLCBOb25lIFRPRE86IHRvIGJlIHJlZmFjdG9yZWRcblx0ICogQHBhcmFtIFttSW5QYXJhbWV0ZXJzLmJ1c3lJZF0gSUQgb2YgdGhlIGxvY2FsIGJ1c3kgaW5kaWNhdG9yXG5cdCAqIEBwYXJhbSBbbUluUGFyYW1ldGVycy5rZWVwVHJhbnNpZW50Q29udGV4dE9uRmFpbGVkXSBJZiBzZXQsIHRoZSBjb250ZXh0IHN0YXlzIGluIHRoZSBsaXN0IGlmIHRoZSBQT1NUIGZhaWxlZCBhbmQgUE9TVCB3aWxsIGJlIHJlcGVhdGVkIHdpdGggdGhlIG5leHQgY2hhbmdlXG5cdCAqIEBwYXJhbSBbbUluUGFyYW1ldGVycy5pbmFjdGl2ZV0gSWYgc2V0LCB0aGUgY29udGV4dCBpcyBzZXQgYXMgaW5hY3RpdmUgZm9yIGVtcHR5IHJvd3Ncblx0ICogQHBhcmFtIFttSW5QYXJhbWV0ZXJzLnNraXBQYXJhbWV0ZXJEaWFsb2ddIFNraXBzIHRoZSBhY3Rpb24gcGFyYW1ldGVyIGRpYWxvZ1xuXHQgKiBAcGFyYW0gb1Jlc291cmNlQnVuZGxlXG5cdCAqIEBwYXJhbSBtZXNzYWdlSGFuZGxlclxuXHQgKiBAcGFyYW0gYkZyb21Db3B5UGFzdGVcblx0ICogQHBhcmFtIG9WaWV3IFRoZSBjdXJyZW50IHZpZXdcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyB3aXRoIG5ldyBiaW5kaW5nIGNvbnRleHRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0YXN5bmMgY3JlYXRlRG9jdW1lbnQoXG5cdFx0b01haW5MaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHRtSW5QYXJhbWV0ZXJzOlxuXHRcdFx0fCB7XG5cdFx0XHRcdFx0ZGF0YT86IGFueTtcblx0XHRcdFx0XHRidXN5TW9kZT86IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRidXN5SWQ6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRrZWVwVHJhbnNpZW50Q29udGV4dE9uRmFpbGVkPzogYW55O1xuXHRcdFx0XHRcdGluYWN0aXZlPzogYm9vbGVhbjtcblx0XHRcdCAgfVxuXHRcdFx0fCB1bmRlZmluZWQsXG5cdFx0b1Jlc291cmNlQnVuZGxlOiBhbnksXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLFxuXHRcdGJGcm9tQ29weVBhc3RlOiBib29sZWFuID0gZmFsc2UsXG5cdFx0b1ZpZXc6IGFueVxuXHQpOiBQcm9taXNlPE9EYXRhVjRDb250ZXh0PiB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG5cdFx0Y29uc3Qgb01vZGVsID0gb01haW5MaXN0QmluZGluZy5nZXRNb2RlbCgpLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob01haW5MaXN0QmluZGluZy5nZXRIZWFkZXJDb250ZXh0KCkuZ2V0UGF0aCgpKSxcblx0XHRcdHNDcmVhdGVIYXNoID0gdGhpcy5fZ2V0QXBwQ29tcG9uZW50KCkuZ2V0Um91dGVyUHJveHkoKS5nZXRIYXNoKCksXG5cdFx0XHRvQ29tcG9uZW50RGF0YSA9IHRoaXMuX2dldEFwcENvbXBvbmVudCgpLmdldENvbXBvbmVudERhdGEoKSxcblx0XHRcdG9TdGFydHVwUGFyYW1ldGVycyA9IChvQ29tcG9uZW50RGF0YSAmJiBvQ29tcG9uZW50RGF0YS5zdGFydHVwUGFyYW1ldGVycykgfHwge30sXG5cdFx0XHRzTmV3QWN0aW9uID0gIW9NYWluTGlzdEJpbmRpbmcuaXNSZWxhdGl2ZSgpXG5cdFx0XHRcdD8gdGhpcy5fZ2V0TmV3QWN0aW9uKG9TdGFydHVwUGFyYW1ldGVycywgc0NyZWF0ZUhhc2gsIG9NZXRhTW9kZWwsIHNNZXRhUGF0aClcblx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0Y29uc3QgbUJpbmRpbmdQYXJhbWV0ZXJzOiBhbnkgPSB7IFwiJCRwYXRjaFdpdGhvdXRTaWRlRWZmZWN0c1wiOiB0cnVlIH07XG5cdFx0Y29uc3Qgc01lc3NhZ2VzUGF0aCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NZXNzYWdlcy8kUGF0aGApO1xuXHRcdGxldCBzQnVzeVBhdGggPSBcIi9idXN5XCI7XG5cdFx0bGV0IHNGdW5jdGlvbk5hbWUgPVxuXHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRGVmYXVsdFZhbHVlc0Z1bmN0aW9uYCkgfHxcblx0XHRcdG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRgJHtNb2RlbEhlbHBlci5nZXRUYXJnZXRFbnRpdHlTZXQob01ldGFNb2RlbC5nZXRDb250ZXh0KHNNZXRhUGF0aCkpfUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRGVmYXVsdFZhbHVlc0Z1bmN0aW9uYFxuXHRcdFx0KTtcblx0XHRsZXQgYkZ1bmN0aW9uT25OYXZQcm9wO1xuXHRcdGxldCBvTmV3RG9jdW1lbnRDb250ZXh0OiBPRGF0YVY0Q29udGV4dCB8IHVuZGVmaW5lZDtcblx0XHRpZiAoc0Z1bmN0aW9uTmFtZSkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EZWZhdWx0VmFsdWVzRnVuY3Rpb25gKSAmJlxuXHRcdFx0XHRNb2RlbEhlbHBlci5nZXRUYXJnZXRFbnRpdHlTZXQob01ldGFNb2RlbC5nZXRDb250ZXh0KHNNZXRhUGF0aCkpICE9PSBzTWV0YVBhdGhcblx0XHRcdCkge1xuXHRcdFx0XHRiRnVuY3Rpb25Pbk5hdlByb3AgPSB0cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YkZ1bmN0aW9uT25OYXZQcm9wID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChzTWVzc2FnZXNQYXRoKSB7XG5cdFx0XHRtQmluZGluZ1BhcmFtZXRlcnNbXCIkc2VsZWN0XCJdID0gc01lc3NhZ2VzUGF0aDtcblx0XHR9XG5cdFx0Y29uc3QgbVBhcmFtZXRlcnMgPSBnZXRQYXJhbWV0ZXJzKG1JblBhcmFtZXRlcnMpO1xuXHRcdGlmICghb01haW5MaXN0QmluZGluZykge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiQmluZGluZyByZXF1aXJlZCBmb3IgbmV3IGRvY3VtZW50IGNyZWF0aW9uXCIpO1xuXHRcdH1cblx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvTWFpbkxpc3RCaW5kaW5nKTtcblx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgIT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQgJiYgc1Byb2dyYW1taW5nTW9kZWwgIT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDcmVhdGUgZG9jdW1lbnQgb25seSBhbGxvd2VkIGZvciBkcmFmdCBvciBzdGlja3kgc2Vzc2lvbiBzdXBwb3J0ZWQgc2VydmljZXNcIik7XG5cdFx0fVxuXHRcdGlmIChtUGFyYW1ldGVycy5idXN5TW9kZSA9PT0gXCJMb2NhbFwiKSB7XG5cdFx0XHRzQnVzeVBhdGggPSBgL2J1c3lMb2NhbC8ke21QYXJhbWV0ZXJzLmJ1c3lJZH1gO1xuXHRcdH1cblx0XHRtUGFyYW1ldGVycy5iZWZvcmVDcmVhdGVDYWxsQmFjayA9IGJGcm9tQ29weVBhc3RlID8gbnVsbCA6IG1QYXJhbWV0ZXJzLmJlZm9yZUNyZWF0ZUNhbGxCYWNrO1xuXHRcdEJ1c3lMb2NrZXIubG9jayh0aGlzLm9Mb2NrT2JqZWN0LCBzQnVzeVBhdGgpO1xuXHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZUNvcmUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdGxldCBvUmVzdWx0OiBhbnk7XG5cblx0XHR0cnkge1xuXHRcdFx0bGV0IGJDb25zaWRlckRvY3VtZW50TW9kaWZpZWQgPSBmYWxzZTtcblx0XHRcdGlmIChzTmV3QWN0aW9uKSB7XG5cdFx0XHRcdGJDb25zaWRlckRvY3VtZW50TW9kaWZpZWQgPSB0cnVlO1xuXHRcdFx0XHRvUmVzdWx0ID0gYXdhaXQgdGhpcy5jYWxsQWN0aW9uKFxuXHRcdFx0XHRcdHNOZXdBY3Rpb24sXG5cdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0Y29udGV4dHM6IG9NYWluTGlzdEJpbmRpbmcuZ2V0SGVhZGVyQ29udGV4dCgpLFxuXHRcdFx0XHRcdFx0c2hvd0FjdGlvblBhcmFtZXRlckRpYWxvZzogdHJ1ZSxcblx0XHRcdFx0XHRcdGxhYmVsOiB0aGlzLl9nZXRTcGVjaWZpY0NyZWF0ZUFjdGlvbkRpYWxvZ0xhYmVsKG9NZXRhTW9kZWwsIHNNZXRhUGF0aCwgc05ld0FjdGlvbiwgb1Jlc291cmNlQnVuZGxlQ29yZSksXG5cdFx0XHRcdFx0XHRiaW5kaW5nUGFyYW1ldGVyczogbUJpbmRpbmdQYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0cGFyZW50Q29udHJvbDogbVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCxcblx0XHRcdFx0XHRcdGJJc0NyZWF0ZUFjdGlvbjogdHJ1ZSxcblx0XHRcdFx0XHRcdHNraXBQYXJhbWV0ZXJEaWFsb2c6IG1QYXJhbWV0ZXJzLnNraXBQYXJhbWV0ZXJEaWFsb2dcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXJcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGJJc05ld1BhZ2VDcmVhdGlvbiA9XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlICE9PSBDcmVhdGlvbk1vZGUuQ3JlYXRpb25Sb3cgJiYgbVBhcmFtZXRlcnMuY3JlYXRpb25Nb2RlICE9PSBDcmVhdGlvbk1vZGUuSW5saW5lO1xuXHRcdFx0XHRjb25zdCBhTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzID0gYklzTmV3UGFnZUNyZWF0aW9uXG5cdFx0XHRcdFx0PyBDb21tb25VdGlscy5nZXROb25Db21wdXRlZFZpc2libGVGaWVsZHMob01ldGFNb2RlbCwgc01ldGFQYXRoLCBvVmlldylcblx0XHRcdFx0XHQ6IFtdO1xuXHRcdFx0XHRzRnVuY3Rpb25OYW1lID0gYkZyb21Db3B5UGFzdGUgPyBudWxsIDogc0Z1bmN0aW9uTmFtZTtcblx0XHRcdFx0bGV0IHNGdW5jdGlvblBhdGgsIG9GdW5jdGlvbkNvbnRleHQ7XG5cdFx0XHRcdGlmIChzRnVuY3Rpb25OYW1lKSB7XG5cdFx0XHRcdFx0Ly9ib3VuZCB0byB0aGUgc291cmNlIGVudGl0eTpcblx0XHRcdFx0XHRpZiAoYkZ1bmN0aW9uT25OYXZQcm9wKSB7XG5cdFx0XHRcdFx0XHRzRnVuY3Rpb25QYXRoID1cblx0XHRcdFx0XHRcdFx0b01haW5MaXN0QmluZGluZy5nZXRDb250ZXh0KCkgJiZcblx0XHRcdFx0XHRcdFx0YCR7b01ldGFNb2RlbC5nZXRNZXRhUGF0aChvTWFpbkxpc3RCaW5kaW5nLmdldENvbnRleHQoKS5nZXRQYXRoKCkpfS8ke3NGdW5jdGlvbk5hbWV9YDtcblx0XHRcdFx0XHRcdG9GdW5jdGlvbkNvbnRleHQgPSBvTWFpbkxpc3RCaW5kaW5nLmdldENvbnRleHQoKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c0Z1bmN0aW9uUGF0aCA9XG5cdFx0XHRcdFx0XHRcdG9NYWluTGlzdEJpbmRpbmcuZ2V0SGVhZGVyQ29udGV4dCgpICYmXG5cdFx0XHRcdFx0XHRcdGAke29NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob01haW5MaXN0QmluZGluZy5nZXRIZWFkZXJDb250ZXh0KCkuZ2V0UGF0aCgpKX0vJHtzRnVuY3Rpb25OYW1lfWA7XG5cdFx0XHRcdFx0XHRvRnVuY3Rpb25Db250ZXh0ID0gb01haW5MaXN0QmluZGluZy5nZXRIZWFkZXJDb250ZXh0KCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IG9GdW5jdGlvbiA9IHNGdW5jdGlvblBhdGggJiYgKG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Z1bmN0aW9uUGF0aCkgYXMgYW55KTtcblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGxldCBvRGF0YTogYW55O1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvQ29udGV4dCA9XG5cdFx0XHRcdFx0XHRcdG9GdW5jdGlvbiAmJiBvRnVuY3Rpb24uZ2V0T2JqZWN0KCkgJiYgb0Z1bmN0aW9uLmdldE9iamVjdCgpWzBdLiRJc0JvdW5kXG5cdFx0XHRcdFx0XHRcdFx0PyBhd2FpdCBvcGVyYXRpb25zLmNhbGxCb3VuZEZ1bmN0aW9uKHNGdW5jdGlvbk5hbWUsIG9GdW5jdGlvbkNvbnRleHQsIG9Nb2RlbClcblx0XHRcdFx0XHRcdFx0XHQ6IGF3YWl0IG9wZXJhdGlvbnMuY2FsbEZ1bmN0aW9uSW1wb3J0KHNGdW5jdGlvbk5hbWUsIG9Nb2RlbCk7XG5cdFx0XHRcdFx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdFx0XHRcdFx0b0RhdGEgPSBvQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKGBFcnJvciB3aGlsZSBleGVjdXRpbmcgdGhlIGZ1bmN0aW9uICR7c0Z1bmN0aW9uTmFtZX1gLCBvRXJyb3IpO1xuXHRcdFx0XHRcdFx0dGhyb3cgb0Vycm9yO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRtUGFyYW1ldGVycy5kYXRhID0gb0RhdGEgPyBPYmplY3QuYXNzaWduKHt9LCBvRGF0YSwgbVBhcmFtZXRlcnMuZGF0YSkgOiBtUGFyYW1ldGVycy5kYXRhO1xuXHRcdFx0XHRcdGlmIChtUGFyYW1ldGVycy5kYXRhKSB7XG5cdFx0XHRcdFx0XHRkZWxldGUgbVBhcmFtZXRlcnMuZGF0YVtcIkBvZGF0YS5jb250ZXh0XCJdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoYU5vbkNvbXB1dGVkVmlzaWJsZUtleUZpZWxkcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRvUmVzdWx0ID0gYXdhaXQgdGhpcy5fbGF1bmNoRGlhbG9nV2l0aEtleUZpZWxkcyhcblx0XHRcdFx0XHRcdFx0b01haW5MaXN0QmluZGluZyxcblx0XHRcdFx0XHRcdFx0YU5vbkNvbXB1dGVkVmlzaWJsZUtleUZpZWxkcyxcblx0XHRcdFx0XHRcdFx0b01vZGVsLFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXJcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRvTmV3RG9jdW1lbnRDb250ZXh0ID0gb1Jlc3VsdC5uZXdDb250ZXh0O1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRpZiAobVBhcmFtZXRlcnMuYmVmb3JlQ3JlYXRlQ2FsbEJhY2spIHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgdG9FUzZQcm9taXNlKFxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmJlZm9yZUNyZWF0ZUNhbGxCYWNrKHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHRQYXRoOiBvTWFpbkxpc3RCaW5kaW5nICYmIG9NYWluTGlzdEJpbmRpbmcuZ2V0UGF0aCgpXG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0b05ld0RvY3VtZW50Q29udGV4dCA9IG9NYWluTGlzdEJpbmRpbmcuY3JlYXRlKFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5kYXRhLFxuXHRcdFx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGVBdEVuZCxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuaW5hY3RpdmVcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRpZiAoIW1QYXJhbWV0ZXJzLmluYWN0aXZlKSB7XG5cdFx0XHRcdFx0XHRcdG9SZXN1bHQgPSBhd2FpdCB0aGlzLm9uQWZ0ZXJDcmVhdGVDb21wbGV0aW9uKG9NYWluTGlzdEJpbmRpbmcsIG9OZXdEb2N1bWVudENvbnRleHQsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgY3JlYXRpbmcgdGhlIG5ldyBkb2N1bWVudFwiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdHRocm93IG9FcnJvcjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIW9NYWluTGlzdEJpbmRpbmcuaXNSZWxhdGl2ZSgpKSB7XG5cdFx0XHRcdC8vIHRoZSBjcmVhdGUgbW9kZSBzaGFsbCBjdXJyZW50bHkgb25seSBiZSBzZXQgb24gY3JlYXRpbmcgYSByb290IGRvY3VtZW50XG5cdFx0XHRcdHRoaXMuX2JDcmVhdGVNb2RlID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdG9OZXdEb2N1bWVudENvbnRleHQgPSBvTmV3RG9jdW1lbnRDb250ZXh0IHx8IG9SZXN1bHQ7XG5cdFx0XHQvLyBUT0RPOiB3aGVyZSBkb2VzIHRoaXMgb25lIGNvbWluZyBmcm9tPz8/XG5cblx0XHRcdGlmIChiQ29uc2lkZXJEb2N1bWVudE1vZGlmaWVkKSB7XG5cdFx0XHRcdHRoaXMuaGFuZGxlRG9jdW1lbnRNb2RpZmljYXRpb25zKCk7XG5cdFx0XHR9XG5cdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZygpO1xuXHRcdFx0cmV0dXJuIG9OZXdEb2N1bWVudENvbnRleHQhO1xuXHRcdH0gY2F0Y2ggKGVycm9yOiB1bmtub3duKSB7XG5cdFx0XHQvLyBUT0RPOiBjdXJyZW50bHksIHRoZSBvbmx5IGVycm9ycyBoYW5kbGVkIGhlcmUgYXJlIHJhaXNlZCBhcyBzdHJpbmcgLSBzaG91bGQgYmUgY2hhbmdlZCB0byBFcnJvciBvYmplY3RzXG5cdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZygpO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQoZXJyb3IgPT09IEZFTGlicmFyeS5Db25zdGFudHMuQWN0aW9uRXhlY3V0aW9uRmFpbGVkIHx8IGVycm9yID09PSBGRUxpYnJhcnkuQ29uc3RhbnRzLkNhbmNlbEFjdGlvbkRpYWxvZykgJiZcblx0XHRcdFx0b05ld0RvY3VtZW50Q29udGV4dD8uaXNUcmFuc2llbnQoKVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIFRoaXMgaXMgYSB3b3JrYXJvdW5kIHN1Z2dlc3RlZCBieSBtb2RlbCBhcyBDb250ZXh0LmRlbGV0ZSByZXN1bHRzIGluIGFuIGVycm9yXG5cdFx0XHRcdC8vIFRPRE86IHJlbW92ZSB0aGUgJGRpcmVjdCBvbmNlIG1vZGVsIHJlc29sdmVzIHRoaXMgaXNzdWVcblx0XHRcdFx0Ly8gdGhpcyBsaW5lIHNob3dzIHRoZSBleHBlY3RlZCBjb25zb2xlIGVycm9yIFVuY2F1Z2h0IChpbiBwcm9taXNlKSBFcnJvcjogUmVxdWVzdCBjYW5jZWxlZDogUE9TVCBUcmF2ZWw7IGdyb3VwOiBzdWJtaXRMYXRlclxuXHRcdFx0XHRvTmV3RG9jdW1lbnRDb250ZXh0LmRlbGV0ZShcIiRkaXJlY3RcIik7XG5cdFx0XHR9XG5cdFx0XHR0aHJvdyBlcnJvcjtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0QnVzeUxvY2tlci51bmxvY2sodGhpcy5vTG9ja09iamVjdCwgc0J1c3lQYXRoKTtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqIEZpbmQgdGhlIGFjdGl2ZSBjb250ZXh0cyBvZiB0aGUgZG9jdW1lbnRzLCBvbmx5IGZvciB0aGUgZHJhZnQgcm9vdHMuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBhQ29udGV4dHMgQ29udGV4dHMgRWl0aGVyIG9uZSBjb250ZXh0IG9yIGFuIGFycmF5IHdpdGggY29udGV4dHMgdG8gYmUgZGVsZXRlZFxuXHQgKiBAcGFyYW0gYkZpbmRBY3RpdmVDb250ZXh0c1xuXHQgKiBAcmV0dXJucyBBcnJheSBvZiB0aGUgYWN0aXZlIGNvbnRleHRzXG5cdCAqL1xuXHRmaW5kQWN0aXZlRHJhZnRSb290Q29udGV4dHMoYUNvbnRleHRzOiBWNENvbnRleHRbXSwgYkZpbmRBY3RpdmVDb250ZXh0czogYW55KSB7XG5cdFx0aWYgKCFiRmluZEFjdGl2ZUNvbnRleHRzKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXHRcdGNvbnN0IGFjdGl2ZUNvbnRleHRzID0gYUNvbnRleHRzLnJlZHVjZShmdW5jdGlvbiAoYVJlc3VsdDogYW55LCBvQ29udGV4dDogYW55KSB7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdGlmIChvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3RgKSkge1xuXHRcdFx0XHRjb25zdCBiSXNBY3RpdmVFbnRpdHkgPSBvQ29udGV4dC5nZXRPYmplY3QoKS5Jc0FjdGl2ZUVudGl0eSxcblx0XHRcdFx0XHRiSGFzQWN0aXZlRW50aXR5ID0gb0NvbnRleHQuZ2V0T2JqZWN0KCkuSGFzQWN0aXZlRW50aXR5O1xuXHRcdFx0XHRpZiAoIWJJc0FjdGl2ZUVudGl0eSAmJiBiSGFzQWN0aXZlRW50aXR5KSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0FjdGl2ZUNvbnRleHQgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmJpbmRDb250ZXh0KGAke29Db250ZXh0LmdldFBhdGgoKX0vU2libGluZ0VudGl0eWApLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0XHRcdGFSZXN1bHQucHVzaChvQWN0aXZlQ29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBhUmVzdWx0O1xuXHRcdH0sIFtdKTtcblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoXG5cdFx0XHRhY3RpdmVDb250ZXh0cy5tYXAoZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9Db250ZXh0LnJlcXVlc3RDYW5vbmljYWxQYXRoKCkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9Db250ZXh0O1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0KTtcblx0fVxuXHRhZnRlckRlbGV0ZVByb2Nlc3MobVBhcmFtZXRlcnM6IGFueSwgY2hlY2tCb3g6IGFueSwgYUNvbnRleHRzOiBhbnksIG9SZXNvdXJjZUJ1bmRsZTogYW55KSB7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gbVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0aWYgKG9JbnRlcm5hbE1vZGVsQ29udGV4dCAmJiBvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCJkZWxldGVFbmFibGVkXCIpICE9IHVuZGVmaW5lZCkge1xuXHRcdFx0aWYgKGNoZWNrQm94LmlzQ2hlY2tCb3hWaXNpYmxlID09PSB0cnVlICYmIGNoZWNrQm94LmlzQ2hlY2tCb3hTZWxlY3RlZCA9PT0gZmFsc2UpIHtcblx0XHRcdFx0Ly9pZiB1bnNhdmVkIG9iamVjdHMgYXJlIG5vdCBkZWxldGVkIHRoZW4gd2UgbmVlZCB0byBzZXQgdGhlIGVuYWJsZWQgdG8gdHJ1ZSBhbmQgdXBkYXRlIHRoZSBtb2RlbCBkYXRhIGZvciBuZXh0IGRlbGV0aW9uXG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImRlbGV0ZUVuYWJsZWRcIiwgdHJ1ZSk7XG5cdFx0XHRcdGNvbnN0IG9iaiA9IE9iamVjdC5hc3NpZ24ob0ludGVybmFsTW9kZWxDb250ZXh0LmdldE9iamVjdCgpLCB7fSk7XG5cdFx0XHRcdG9iai5zZWxlY3RlZENvbnRleHRzID0gb2JqLnNlbGVjdGVkQ29udGV4dHMuZmlsdGVyKGZ1bmN0aW9uIChlbGVtZW50OiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gb2JqLmRlbGV0YWJsZUNvbnRleHRzLmluZGV4T2YoZWxlbWVudCkgPT09IC0xO1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0b2JqLmRlbGV0YWJsZUNvbnRleHRzID0gW107XG5cdFx0XHRcdG9iai5zZWxlY3RlZENvbnRleHRzID0gW107XG5cdFx0XHRcdG9iai5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPSBvYmouc2VsZWN0ZWRDb250ZXh0cy5sZW5ndGg7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcIlwiLCBvYmopO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiZGVsZXRlRW5hYmxlZFwiLCBmYWxzZSk7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInNlbGVjdGVkQ29udGV4dHNcIiwgW10pO1xuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcIiwgMCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChhQ29udGV4dHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRNZXNzYWdlVG9hc3Quc2hvdyhcblx0XHRcdFx0Q29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9ERUxFVEVfVE9BU1RfU0lOR1VMQVJcIixcblx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdE1lc3NhZ2VUb2FzdC5zaG93KFxuXHRcdFx0XHRDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0RFTEVURV9UT0FTVF9QTFVSQUxcIiwgb1Jlc291cmNlQnVuZGxlLCBudWxsLCBtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lKVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqIERlbGV0ZSBvbmUgb3IgbXVsdGlwbGUgZG9jdW1lbnQocykuXG5cdCAqXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSB2SW5Db250ZXh0cyBDb250ZXh0cyBFaXRoZXIgb25lIGNvbnRleHQgb3IgYW4gYXJyYXkgd2l0aCBjb250ZXh0cyB0byBiZSBkZWxldGVkXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycyBPcHRpb25hbCwgY2FuIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMudGl0bGUgVGl0bGUgb2YgdGhlIG9iamVjdCB0byBiZSBkZWxldGVkXG5cdCAqIEBwYXJhbSBtUGFyYW1ldGVycy5kZXNjcmlwdGlvbiBEZXNjcmlwdGlvbiBvZiB0aGUgb2JqZWN0IHRvIGJlIGRlbGV0ZWRcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzLm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyBOdW1iZXIgb2Ygb2JqZWN0cyBzZWxlY3RlZFxuXHQgKiBAcGFyYW0gbVBhcmFtZXRlcnMubm9EaWFsb2cgVG8gZGlzYWJsZSB0aGUgY29uZmlybWF0aW9uIGRpYWxvZ1xuXHQgKiBAcGFyYW0gb1Jlc291cmNlQnVuZGxlXG5cdCAqIEBwYXJhbSBtZXNzYWdlSGFuZGxlclxuXHQgKiBAcmV0dXJucyBBIFByb21pc2UgcmVzb2x2ZWQgb25jZSB0aGUgZG9jdW1lbnQgYXJlIGRlbGV0ZWRcblx0ICovXG5cdGRlbGV0ZURvY3VtZW50KHZJbkNvbnRleHRzOiBWNENvbnRleHQsIG1QYXJhbWV0ZXJzOiBhbnksIG9SZXNvdXJjZUJ1bmRsZTogYW55LCBtZXNzYWdlSGFuZGxlcjogTWVzc2FnZUhhbmRsZXIpIHtcblx0XHRsZXQgYURlbGV0YWJsZUNvbnRleHRzOiBhbnlbXSA9IFtdLFxuXHRcdFx0aXNDaGVja0JveFZpc2libGUgPSBmYWxzZSxcblx0XHRcdGlzTG9ja2VkVGV4dFZpc2libGUgPSBmYWxzZSxcblx0XHRcdGNhbm5vdEJlRGVsZXRlZFRleHRWaXNpYmxlID0gZmFsc2UsXG5cdFx0XHRpc0NoZWNrQm94U2VsZWN0ZWQ6IGJvb2xlYW4sXG5cdFx0XHRiRGlhbG9nQ29uZmlybWVkID0gZmFsc2U7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzXG5cdFx0Y29uc3QgdGhhdCA9IHRoaXMsXG5cdFx0XHRvUmVzb3VyY2VCdW5kbGVDb3JlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRsZXQgYVBhcmFtcztcblx0XHRsZXQgb0RlbGV0ZU1lc3NhZ2U6IGFueSA9IHtcblx0XHRcdHRpdGxlOiBvUmVzb3VyY2VCdW5kbGVDb3JlLmdldFRleHQoXCJDX0NPTU1PTl9ERUxFVEVcIilcblx0XHR9O1xuXHRcdEJ1c3lMb2NrZXIubG9jayh0aGlzLm9Mb2NrT2JqZWN0KTtcblx0XHRsZXQgdkNvbnRleHRzOiBWNENvbnRleHRbXTtcblx0XHRpZiAoQXJyYXkuaXNBcnJheSh2SW5Db250ZXh0cykpIHtcblx0XHRcdHZDb250ZXh0cyA9IHZJbkNvbnRleHRzO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR2Q29udGV4dHMgPSBbdkluQ29udGV4dHNdO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbCh2Q29udGV4dHNbMF0pO1xuXHRcdFx0XHRpZiAobVBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRpZiAoIW1QYXJhbWV0ZXJzLm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cykge1xuXHRcdFx0XHRcdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0KSB7XG5cdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdkNvbnRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb0NvbnRleHREYXRhID0gdkNvbnRleHRzW2ldLmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdG9Db250ZXh0RGF0YS5Jc0FjdGl2ZUVudGl0eSA9PT0gdHJ1ZSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0b0NvbnRleHREYXRhLkhhc0RyYWZ0RW50aXR5ID09PSB0cnVlICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRvQ29udGV4dERhdGEuRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEgJiZcblx0XHRcdFx0XHRcdFx0XHRcdG9Db250ZXh0RGF0YS5EcmFmdEFkbWluaXN0cmF0aXZlRGF0YS5JblByb2Nlc3NCeVVzZXIgJiZcblx0XHRcdFx0XHRcdFx0XHRcdCFvQ29udGV4dERhdGEuRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEuRHJhZnRJc0NyZWF0ZWRCeU1lXG5cdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRsZXQgc0xvY2tlZFVzZXIgPSBcIlwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgZHJhZnRBZG1pbkRhdGEgPSBvQ29udGV4dERhdGEgJiYgb0NvbnRleHREYXRhLkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGRyYWZ0QWRtaW5EYXRhKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNMb2NrZWRVc2VyID0gZHJhZnRBZG1pbkRhdGFbXCJJblByb2Nlc3NCeVVzZXJcIl07XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRhUGFyYW1zID0gW3NMb2NrZWRVc2VyXTtcblx0XHRcdFx0XHRcdFx0XHRcdE1lc3NhZ2VCb3guc2hvdyhcblx0XHRcdFx0XHRcdFx0XHRcdFx0Q29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX1NJTkdMRV9PQkpFQ1RfTE9DS0VEXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFQYXJhbXNcblx0XHRcdFx0XHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRpdGxlOiBvUmVzb3VyY2VCdW5kbGVDb3JlLmdldFRleHQoXCJDX0NPTU1PTl9ERUxFVEVcIiksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b25DbG9zZTogcmVqZWN0XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycyA9IGdldFBhcmFtZXRlcnMobVBhcmFtZXRlcnMpO1xuXHRcdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLnRpdGxlKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChtUGFyYW1ldGVycy5kZXNjcmlwdGlvbikge1xuXHRcdFx0XHRcdFx0XHRcdGFQYXJhbXMgPSBbbVBhcmFtZXRlcnMudGl0bGUgKyBcIiBcIiwgbVBhcmFtZXRlcnMuZGVzY3JpcHRpb25dO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGFQYXJhbXMgPSBbbVBhcmFtZXRlcnMudGl0bGUsIFwiXCJdO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdG9EZWxldGVNZXNzYWdlLnRleHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT1wiLFxuXHRcdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRcdFx0XHRhUGFyYW1zLFxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmVudGl0eVNldE5hbWVcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdG9EZWxldGVNZXNzYWdlLnRleHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUVElUTEVfU0lOR1VMQVJcIixcblx0XHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRhRGVsZXRhYmxlQ29udGV4dHMgPSB2Q29udGV4dHM7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9EZWxldGVNZXNzYWdlID0ge1xuXHRcdFx0XHRcdFx0XHR0aXRsZTogb1Jlc291cmNlQnVuZGxlQ29yZS5nZXRUZXh0KFwiQ19DT01NT05fREVMRVRFXCIpXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9PT0gMSAmJiBtUGFyYW1ldGVycy5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPT09IHZDb250ZXh0cy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0YURlbGV0YWJsZUNvbnRleHRzID0gdkNvbnRleHRzO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvTGluZUNvbnRleHREYXRhID0gdkNvbnRleHRzWzBdLmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvVGFibGUgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzS2V5ID0gb1RhYmxlICYmIG9UYWJsZS5nZXRQYXJlbnQoKS5nZXRJZGVudGlmaWVyQ29sdW1uKCk7XG5cdFx0XHRcdFx0XHRcdGlmIChzS2V5KSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc0tleVZhbHVlID0gc0tleSA/IG9MaW5lQ29udGV4dERhdGFbc0tleV0gOiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc0Rlc2NyaXB0aW9uID1cblx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmRlc2NyaXB0aW9uICYmIG1QYXJhbWV0ZXJzLmRlc2NyaXB0aW9uLnBhdGhcblx0XHRcdFx0XHRcdFx0XHRcdFx0PyBvTGluZUNvbnRleHREYXRhW21QYXJhbWV0ZXJzLmRlc2NyaXB0aW9uLnBhdGhdXG5cdFx0XHRcdFx0XHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChzS2V5VmFsdWUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChzRGVzY3JpcHRpb24gJiYgbVBhcmFtZXRlcnMuZGVzY3JpcHRpb24gJiYgc0tleSAhPT0gbVBhcmFtZXRlcnMuZGVzY3JpcHRpb24ucGF0aCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRhUGFyYW1zID0gW3NLZXlWYWx1ZSArIFwiIFwiLCBzRGVzY3JpcHRpb25dO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0YVBhcmFtcyA9IFtzS2V5VmFsdWUsIFwiXCJdO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0b0RlbGV0ZU1lc3NhZ2UudGV4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT1wiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFQYXJhbXMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmVudGl0eVNldE5hbWVcblx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChzS2V5VmFsdWUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGFQYXJhbXMgPSBbc0tleVZhbHVlLCBcIlwiXTtcblx0XHRcdFx0XHRcdFx0XHRcdG9EZWxldGVNZXNzYWdlLnRleHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9cIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRhUGFyYW1zLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lXG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvRGVsZXRlTWVzc2FnZS50ZXh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RUSVRMRV9TSU5HVUxBUlwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmVudGl0eVNldE5hbWVcblx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdG9EZWxldGVNZXNzYWdlLnRleHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RUSVRMRV9TSU5HVUxBUlwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmVudGl0eVNldE5hbWVcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKG1QYXJhbWV0ZXJzLm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9PT0gMSAmJiBtUGFyYW1ldGVycy51blNhdmVkQ29udGV4dHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdFx0XHRcdC8vb25seSBvbmUgdW5zYXZlZCBvYmplY3Rcblx0XHRcdFx0XHRcdFx0YURlbGV0YWJsZUNvbnRleHRzID0gbVBhcmFtZXRlcnMudW5TYXZlZENvbnRleHRzO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBkcmFmdEFkbWluRGF0YSA9IGFEZWxldGFibGVDb250ZXh0c1swXS5nZXRPYmplY3QoKVtcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhXCJdO1xuXHRcdFx0XHRcdFx0XHRsZXQgc0xhc3RDaGFuZ2VkQnlVc2VyID0gXCJcIjtcblx0XHRcdFx0XHRcdFx0aWYgKGRyYWZ0QWRtaW5EYXRhKSB7XG5cdFx0XHRcdFx0XHRcdFx0c0xhc3RDaGFuZ2VkQnlVc2VyID1cblx0XHRcdFx0XHRcdFx0XHRcdGRyYWZ0QWRtaW5EYXRhW1wiTGFzdENoYW5nZWRCeVVzZXJEZXNjcmlwdGlvblwiXSB8fCBkcmFmdEFkbWluRGF0YVtcIkxhc3RDaGFuZ2VkQnlVc2VyXCJdIHx8IFwiXCI7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0YVBhcmFtcyA9IFtzTGFzdENoYW5nZWRCeVVzZXJdO1xuXHRcdFx0XHRcdFx0XHRvRGVsZXRlTWVzc2FnZS50ZXh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX1VOU0FWRURfQ0hBTkdFU1wiLFxuXHRcdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRcdFx0XHRhUGFyYW1zXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKG1QYXJhbWV0ZXJzLm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9PT0gbVBhcmFtZXRlcnMudW5TYXZlZENvbnRleHRzLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0XHQvL29ubHkgbXVsdGlwbGUgdW5zYXZlZCBvYmplY3RzXG5cdFx0XHRcdFx0XHRcdGFEZWxldGFibGVDb250ZXh0cyA9IG1QYXJhbWV0ZXJzLnVuU2F2ZWRDb250ZXh0cztcblx0XHRcdFx0XHRcdFx0b0RlbGV0ZU1lc3NhZ2UudGV4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9VTlNBVkVEX0NIQU5HRVNfTVVMVElQTEVfT0JKRUNUU1wiLFxuXHRcdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMubnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzID09PVxuXHRcdFx0XHRcdFx0XHR2Q29udGV4dHMuY29uY2F0KG1QYXJhbWV0ZXJzLnVuU2F2ZWRDb250ZXh0cy5jb25jYXQobVBhcmFtZXRlcnMubG9ja2VkQ29udGV4dHMpKS5sZW5ndGhcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHQvL29ubHkgdW5zYXZlZCwgbG9ja2VkICxkZWxldGFibGUgb2JqZWN0cyBidXQgbm90IG5vbi1kZWxldGFibGUgb2JqZWN0c1xuXHRcdFx0XHRcdFx0XHRhRGVsZXRhYmxlQ29udGV4dHMgPSB2Q29udGV4dHMuY29uY2F0KG1QYXJhbWV0ZXJzLnVuU2F2ZWRDb250ZXh0cyk7XG5cdFx0XHRcdFx0XHRcdG9EZWxldGVNZXNzYWdlLnRleHQgPVxuXHRcdFx0XHRcdFx0XHRcdGFEZWxldGFibGVDb250ZXh0cy5sZW5ndGggPT09IDFcblx0XHRcdFx0XHRcdFx0XHRcdD8gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVFRJVExFX1NJTkdVTEFSXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZVxuXHRcdFx0XHRcdFx0XHRcdFx0ICApXG5cdFx0XHRcdFx0XHRcdFx0XHQ6IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RUSVRMRV9QTFVSQUxcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lXG5cdFx0XHRcdFx0XHRcdFx0XHQgICk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHQvL2lmIG5vbi1kZWxldGFibGUgb2JqZWN0cyBleGlzdHMgYWxvbmcgd2l0aCBhbnkgb2YgdW5zYXZlZCAsZGVsZXRhYmxlIG9iamVjdHNcblx0XHRcdFx0XHRcdFx0YURlbGV0YWJsZUNvbnRleHRzID0gdkNvbnRleHRzLmNvbmNhdChtUGFyYW1ldGVycy51blNhdmVkQ29udGV4dHMpO1xuXHRcdFx0XHRcdFx0XHRjYW5ub3RCZURlbGV0ZWRUZXh0VmlzaWJsZSA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdG9EZWxldGVNZXNzYWdlLnRleHQgPVxuXHRcdFx0XHRcdFx0XHRcdGFEZWxldGFibGVDb250ZXh0cy5sZW5ndGggPT09IDFcblx0XHRcdFx0XHRcdFx0XHRcdD8gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVFRJVExFX1NJTkdVTEFSX05PTl9ERUxFVEFCTEVcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lXG5cdFx0XHRcdFx0XHRcdFx0XHQgIClcblx0XHRcdFx0XHRcdFx0XHRcdDogQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVFRJVExFX1BMVVJBTF9OT05fREVMRVRBQkxFXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFthRGVsZXRhYmxlQ29udGV4dHMubGVuZ3RoXSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lXG5cdFx0XHRcdFx0XHRcdFx0XHQgICk7XG5cdFx0XHRcdFx0XHRcdG9EZWxldGVNZXNzYWdlLm5vbkRlbGV0YWJsZVRleHQgPSB0aGF0Ll9nZXROb25EZWxldGFibGVUZXh0KG1QYXJhbWV0ZXJzLCB2Q29udGV4dHMsIG9SZXNvdXJjZUJ1bmRsZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAobVBhcmFtZXRlcnMubG9ja2VkQ29udGV4dHMubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHRcdFx0Ly9zZXR0aW5nIHRoZSBsb2NrZWQgdGV4dCBpZiBsb2NrZWQgb2JqZWN0cyBleGlzdFxuXHRcdFx0XHRcdFx0XHRpc0xvY2tlZFRleHRWaXNpYmxlID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0b0RlbGV0ZU1lc3NhZ2Uubm9uRGVsZXRhYmxlVGV4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RJTkZPX0FORF9PTkVfT0JKRUNUX0xPQ0tFRFwiLFxuXHRcdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRcdFx0XHRbbVBhcmFtZXRlcnMubnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzXVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmxvY2tlZENvbnRleHRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdFx0Ly9zZXR0aW5nIHRoZSBsb2NrZWQgdGV4dCBpZiBsb2NrZWQgb2JqZWN0cyBleGlzdFxuXHRcdFx0XHRcdFx0XHRpc0xvY2tlZFRleHRWaXNpYmxlID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0b0RlbGV0ZU1lc3NhZ2Uubm9uRGVsZXRhYmxlVGV4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RJTkZPX0FORF9GRVdfT0JKRUNUU19MT0NLRURcIixcblx0XHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdFx0W21QYXJhbWV0ZXJzLmxvY2tlZENvbnRleHRzLmxlbmd0aCwgbVBhcmFtZXRlcnMubnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzXVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy51blNhdmVkQ29udGV4dHMubGVuZ3RoID4gMCAmJlxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy51blNhdmVkQ29udGV4dHMubGVuZ3RoICE9PSBtUGFyYW1ldGVycy5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0KGNhbm5vdEJlRGVsZXRlZFRleHRWaXNpYmxlIHx8IGlzTG9ja2VkVGV4dFZpc2libGUpICYmXG5cdFx0XHRcdFx0XHRcdFx0YURlbGV0YWJsZUNvbnRleHRzLmxlbmd0aCA9PT0gbVBhcmFtZXRlcnMudW5TYXZlZENvbnRleHRzLmxlbmd0aFxuXHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHQvL2lmIG9ubHkgdW5zYXZlZCBhbmQgZWl0aGVyIG9yIGJvdGggb2YgbG9ja2VkIGFuZCBub24tZGVsZXRhYmxlIG9iamVjdHMgZXhpc3QgdGhlbiB3ZSBoaWRlIHRoZSBjaGVjayBib3hcblx0XHRcdFx0XHRcdFx0XHRpc0NoZWNrQm94VmlzaWJsZSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdGFEZWxldGFibGVDb250ZXh0cyA9IG1QYXJhbWV0ZXJzLnVuU2F2ZWRDb250ZXh0cztcblx0XHRcdFx0XHRcdFx0XHRpZiAobVBhcmFtZXRlcnMudW5TYXZlZENvbnRleHRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b0RlbGV0ZU1lc3NhZ2UudGV4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfVU5TQVZFRF9BTkRfRkVXX09CSkVDVFNfTE9DS0VEX1NJTkdVTEFSXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZVxuXHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0b0RlbGV0ZU1lc3NhZ2UudGV4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfVU5TQVZFRF9BTkRfRkVXX09CSkVDVFNfTE9DS0VEX1BMVVJBTFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGVcblx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChtUGFyYW1ldGVycy51blNhdmVkQ29udGV4dHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvRGVsZXRlTWVzc2FnZS5jaGVja0JveFRleHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9fQU5EX0ZFV19PQkpFQ1RTX1VOU0FWRURfU0lOR1VMQVJcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlXG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvRGVsZXRlTWVzc2FnZS5jaGVja0JveFRleHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9fQU5EX0ZFV19PQkpFQ1RTX1VOU0FWRURfUExVUkFMXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZVxuXHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0aXNDaGVja0JveFZpc2libGUgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAoY2Fubm90QmVEZWxldGVkVGV4dFZpc2libGUgJiYgaXNMb2NrZWRUZXh0VmlzaWJsZSkge1xuXHRcdFx0XHRcdFx0XHQvL2lmIG5vbi1kZWxldGFibGUgb2JqZWN0cyBleGlzdCBhbG9uZyB3aXRoIGRlbGV0YWJsZSBvYmplY3RzXG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNOb25EZWxldGFibGVDb250ZXh0VGV4dCA9IHRoYXQuX2dldE5vbkRlbGV0YWJsZVRleHQobVBhcmFtZXRlcnMsIHZDb250ZXh0cywgb1Jlc291cmNlQnVuZGxlKTtcblx0XHRcdFx0XHRcdFx0Ly9pZiBib3RoIGxvY2tlZCBhbmQgbm9uLWRlbGV0YWJsZSBvYmplY3RzIGV4aXN0IGFsb25nIHdpdGggZGVsZXRhYmxlIG9iamVjdHNcblx0XHRcdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLnVuU2F2ZWRDb250ZXh0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0b0RlbGV0ZU1lc3NhZ2Uubm9uRGVsZXRhYmxlVGV4dCA9XG5cdFx0XHRcdFx0XHRcdFx0XHRzTm9uRGVsZXRhYmxlQ29udGV4dFRleHQgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XCIgXCIgK1xuXHRcdFx0XHRcdFx0XHRcdFx0Q29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfQ09ORklSTV9ERUxFVEVfV0lUSF9PQkpFQ1RJTkZPX0FORF9GRVdfT0JKRUNUU19MT0NLRURcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRbbVBhcmFtZXRlcnMubG9ja2VkQ29udGV4dHMubGVuZ3RoLCBtUGFyYW1ldGVycy5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHNdXG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGlmIChtUGFyYW1ldGVycy51blNhdmVkQ29udGV4dHMubGVuZ3RoID09IDEpIHtcblx0XHRcdFx0XHRcdFx0XHRvRGVsZXRlTWVzc2FnZS5ub25EZWxldGFibGVUZXh0ID1cblx0XHRcdFx0XHRcdFx0XHRcdHNOb25EZWxldGFibGVDb250ZXh0VGV4dCArXG5cdFx0XHRcdFx0XHRcdFx0XHRcIiBcIiArXG5cdFx0XHRcdFx0XHRcdFx0XHRDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9fQU5EX09ORV9PQkpFQ1RfTE9DS0VEXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0W21QYXJhbWV0ZXJzLm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c11cblx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0bGV0IG9Ob25EZWxldGFibGVNZXNzYWdlVGV4dENvbnRyb2wsIG9EZWxldGVNZXNzYWdlVGV4dENvbnRyb2w7XG5cdFx0XHRcdGNvbnN0IG9Db250ZW50ID0gbmV3IFZCb3goe1xuXHRcdFx0XHRcdGl0ZW1zOiBbXG5cdFx0XHRcdFx0XHQob05vbkRlbGV0YWJsZU1lc3NhZ2VUZXh0Q29udHJvbCA9IG5ldyBUZXh0KHtcblx0XHRcdFx0XHRcdFx0dGV4dDogb0RlbGV0ZU1lc3NhZ2Uubm9uRGVsZXRhYmxlVGV4dCxcblx0XHRcdFx0XHRcdFx0dmlzaWJsZTogaXNMb2NrZWRUZXh0VmlzaWJsZSB8fCBjYW5ub3RCZURlbGV0ZWRUZXh0VmlzaWJsZVxuXHRcdFx0XHRcdFx0fSkpLFxuXHRcdFx0XHRcdFx0KG9EZWxldGVNZXNzYWdlVGV4dENvbnRyb2wgPSBuZXcgVGV4dCh7XG5cdFx0XHRcdFx0XHRcdHRleHQ6IG9EZWxldGVNZXNzYWdlLnRleHRcblx0XHRcdFx0XHRcdH0pKSxcblx0XHRcdFx0XHRcdG5ldyBDaGVja0JveCh7XG5cdFx0XHRcdFx0XHRcdHRleHQ6IG9EZWxldGVNZXNzYWdlLmNoZWNrQm94VGV4dCxcblx0XHRcdFx0XHRcdFx0c2VsZWN0ZWQ6IHRydWUsXG5cdFx0XHRcdFx0XHRcdHNlbGVjdDogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc2VsZWN0ZWQgPSBvRXZlbnQuZ2V0U291cmNlKCkuZ2V0U2VsZWN0ZWQoKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAoc2VsZWN0ZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGFEZWxldGFibGVDb250ZXh0cyA9IHZDb250ZXh0cy5jb25jYXQobVBhcmFtZXRlcnMudW5TYXZlZENvbnRleHRzKTtcblx0XHRcdFx0XHRcdFx0XHRcdGlzQ2hlY2tCb3hTZWxlY3RlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGFEZWxldGFibGVDb250ZXh0cyA9IHZDb250ZXh0cztcblx0XHRcdFx0XHRcdFx0XHRcdGlzQ2hlY2tCb3hTZWxlY3RlZCA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0dmlzaWJsZTogaXNDaGVja0JveFZpc2libGVcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0Y29uc3Qgc1RpdGxlID0gb1Jlc291cmNlQnVuZGxlQ29yZS5nZXRUZXh0KFwiQ19DT01NT05fREVMRVRFXCIpO1xuXHRcdFx0XHRjb25zdCBmbkNvbmZpcm0gPSBhc3luYyBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0YkRpYWxvZ0NvbmZpcm1lZCA9IHRydWU7XG5cdFx0XHRcdFx0QnVzeUxvY2tlci5sb2NrKHRoYXQub0xvY2tPYmplY3QpO1xuXHRcdFx0XHRcdGNvbnN0IGFDb250ZXh0cyA9IGFEZWxldGFibGVDb250ZXh0cztcblxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRpZiAobVBhcmFtZXRlcnMuYmVmb3JlRGVsZXRlQ2FsbEJhY2spIHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgbVBhcmFtZXRlcnMuYmVmb3JlRGVsZXRlQ2FsbEJhY2soeyBjb250ZXh0czogYUNvbnRleHRzIH0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3QgYWN0aXZlQ29udGV4dHMgPSBhd2FpdCB0aGF0LmZpbmRBY3RpdmVEcmFmdFJvb3RDb250ZXh0cyhhQ29udGV4dHMsIG1QYXJhbWV0ZXJzLmJGaW5kQWN0aXZlQ29udGV4dHMpO1xuXG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRhd2FpdCBQcm9taXNlLmFsbChcblx0XHRcdFx0XHRcdFx0XHRhQ29udGV4dHMubWFwKGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvL2RlbGV0ZSB0aGUgZHJhZnRcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGJFbmFibGVTdHJpY3RIYW5kbGluZyA9IGFDb250ZXh0cy5sZW5ndGggPT09IDEgPyB0cnVlIDogZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZHJhZnQuZGVsZXRlRHJhZnQob0NvbnRleHQsIHRoYXQuX29BcHBDb21wb25lbnQsIGJFbmFibGVTdHJpY3RIYW5kbGluZyk7XG5cdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcygpO1xuXHRcdFx0XHRcdFx0XHQvLyByZS10aHJvdyBlcnJvciB0byBlbmZvcmNlIHJlamVjdGluZyB0aGUgZ2VuZXJhbCBwcm9taXNlXG5cdFx0XHRcdFx0XHRcdHRocm93IG9FcnJvcjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNvbnN0IGNoZWNrQm94ID0ge1xuXHRcdFx0XHRcdFx0XHRcImlzQ2hlY2tCb3hWaXNpYmxlXCI6IGlzQ2hlY2tCb3hWaXNpYmxlLFxuXHRcdFx0XHRcdFx0XHRcImlzQ2hlY2tCb3hTZWxlY3RlZFwiOiBpc0NoZWNrQm94U2VsZWN0ZWRcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAoYWN0aXZlQ29udGV4dHMgJiYgYWN0aXZlQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IFByb21pc2UuYWxsKFxuXHRcdFx0XHRcdFx0XHRcdGFjdGl2ZUNvbnRleHRzLm1hcChmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9Db250ZXh0LmRlbGV0ZSgpO1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0dGhhdC5hZnRlckRlbGV0ZVByb2Nlc3MobVBhcmFtZXRlcnMsIGNoZWNrQm94LCBhQ29udGV4dHMsIG9SZXNvdXJjZUJ1bmRsZSk7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlRGlhbG9nKCk7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRoYXQuYWZ0ZXJEZWxldGVQcm9jZXNzKG1QYXJhbWV0ZXJzLCBjaGVja0JveCwgYUNvbnRleHRzLCBvUmVzb3VyY2VCdW5kbGUpO1xuXHRcdFx0XHRcdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZygpO1xuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJlamVjdCgpO1xuXHRcdFx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdFx0XHRCdXN5TG9ja2VyLnVubG9jayh0aGF0Lm9Mb2NrT2JqZWN0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHRcdGNvbnN0IG9EaWFsb2cgPSBuZXcgRGlhbG9nKHtcblx0XHRcdFx0XHR0aXRsZTogc1RpdGxlLFxuXHRcdFx0XHRcdHN0YXRlOiBcIldhcm5pbmdcIixcblx0XHRcdFx0XHRjb250ZW50OiBbb0NvbnRlbnRdLFxuXHRcdFx0XHRcdGFyaWFMYWJlbGxlZEJ5OiBvTm9uRGVsZXRhYmxlTWVzc2FnZVRleHRDb250cm9sLmdldFZpc2libGUoKVxuXHRcdFx0XHRcdFx0PyBbb05vbkRlbGV0YWJsZU1lc3NhZ2VUZXh0Q29udHJvbCwgb0RlbGV0ZU1lc3NhZ2VUZXh0Q29udHJvbF1cblx0XHRcdFx0XHRcdDogb0RlbGV0ZU1lc3NhZ2VUZXh0Q29udHJvbCxcblx0XHRcdFx0XHRiZWdpbkJ1dHRvbjogbmV3IEJ1dHRvbih7XG5cdFx0XHRcdFx0XHR0ZXh0OiBvUmVzb3VyY2VCdW5kbGVDb3JlLmdldFRleHQoXCJDX0NPTU1PTl9ERUxFVEVcIiksXG5cdFx0XHRcdFx0XHR0eXBlOiBcIkVtcGhhc2l6ZWRcIixcblx0XHRcdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGluZy5yZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0XHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHRcdGZuQ29uZmlybSgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdGVuZEJ1dHRvbjogbmV3IEJ1dHRvbih7XG5cdFx0XHRcdFx0XHR0ZXh0OiBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09NTU9OX0RJQUxPR19DQU5DRUxcIiwgb1Jlc291cmNlQnVuZGxlKSxcblx0XHRcdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRhZnRlckNsb3NlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRvRGlhbG9nLmRlc3Ryb3koKTtcblx0XHRcdFx0XHRcdC8vIGlmIGRpYWxvZyBpcyBjbG9zZWQgdW5jb25maXJtZWQgKGUuZy4gdmlhIFwiQ2FuY2VsXCIgb3IgRXNjYXBlIGJ1dHRvbiksIGVuc3VyZSB0byByZWplY3QgcHJvbWlzZVxuXHRcdFx0XHRcdFx0aWYgKCFiRGlhbG9nQ29uZmlybWVkKSB7XG5cdFx0XHRcdFx0XHRcdHJlamVjdCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBhcyBhbnkpO1xuXHRcdFx0XHRpZiAobVBhcmFtZXRlcnMubm9EaWFsb2cpIHtcblx0XHRcdFx0XHRmbkNvbmZpcm0oKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvRGlhbG9nLmFkZFN0eWxlQ2xhc3MoXCJzYXBVaUNvbnRlbnRQYWRkaW5nXCIpO1xuXHRcdFx0XHRcdG9EaWFsb2cub3BlbigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRCdXN5TG9ja2VyLnVubG9jayh0aGF0Lm9Mb2NrT2JqZWN0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHQvKipcblx0ICogRWRpdHMgYSBkb2N1bWVudC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgb2YgdGhlIGFjdGl2ZSBkb2N1bWVudFxuXHQgKiBAcGFyYW0gb1ZpZXcgQ3VycmVudCB2aWV3XG5cdCAqIEBwYXJhbSBtZXNzYWdlSGFuZGxlclxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggdGhlIG5ldyBkcmFmdCBjb250ZXh0IGluIGNhc2Ugb2YgZHJhZnQgcHJvZ3JhbW1pbmcgbW9kZWxcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0YXN5bmMgZWRpdERvY3VtZW50KG9Db250ZXh0OiBWNENvbnRleHQsIG9WaWV3OiBWaWV3LCBtZXNzYWdlSGFuZGxlcjogTWVzc2FnZUhhbmRsZXIpOiBQcm9taXNlPFY0Q29udGV4dCB8IHVuZGVmaW5lZD4ge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuXHRcdGNvbnN0IHRoYXQgPSB0aGlzO1xuXHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsID0gdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KTtcblx0XHRpZiAoIW9Db250ZXh0KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJCaW5kaW5nIGNvbnRleHQgdG8gYWN0aXZlIGRvY3VtZW50IGlzIHJlcXVpcmVkXCIpO1xuXHRcdH1cblx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgIT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQgJiYgc1Byb2dyYW1taW5nTW9kZWwgIT09IFByb2dyYW1taW5nTW9kZWwuU3RpY2t5KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJFZGl0IGlzIG9ubHkgYWxsb3dlZCBmb3IgZHJhZnQgb3Igc3RpY2t5IHNlc3Npb24gc3VwcG9ydGVkIHNlcnZpY2VzXCIpO1xuXHRcdH1cblx0XHR0aGlzLl9iSXNNb2RpZmllZCA9IGZhbHNlO1xuXHRcdEJ1c3lMb2NrZXIubG9jayh0aGF0Lm9Mb2NrT2JqZWN0KTtcblx0XHQvLyBiZWZvcmUgdHJpZ2dlcmluZyB0aGUgZWRpdCBhY3Rpb24gd2UnbGwgaGF2ZSB0byByZW1vdmUgYWxsIGJvdW5kIHRyYW5zaXRpb24gbWVzc2FnZXNcblx0XHRtZXNzYWdlSGFuZGxlci5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBvTmV3Q29udGV4dCA9XG5cdFx0XHRcdHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0XG5cdFx0XHRcdFx0PyBhd2FpdCBkcmFmdC5jcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudChvQ29udGV4dCwgdGhpcy5fZ2V0QXBwQ29tcG9uZW50KCksIHtcblx0XHRcdFx0XHRcdFx0YlByZXNlcnZlQ2hhbmdlczogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0b1ZpZXc6IG9WaWV3XG5cdFx0XHRcdFx0ICB9IGFzIGFueSlcblx0XHRcdFx0XHQ6IGF3YWl0IHN0aWNreS5lZGl0RG9jdW1lbnRJblN0aWNreVNlc3Npb24ob0NvbnRleHQsIHRoaXMuX2dldEFwcENvbXBvbmVudCgpKTtcblxuXHRcdFx0dGhpcy5fYkNyZWF0ZU1vZGUgPSBmYWxzZTtcblx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlRGlhbG9nKCk7XG5cdFx0XHRyZXR1cm4gb05ld0NvbnRleHQ7XG5cdFx0fSBjYXRjaCAoZXJyOiBhbnkpIHtcblx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcyh7IGNvbmN1cnJlbnRFZGl0RmxhZzogdHJ1ZSB9KTtcblx0XHRcdHRocm93IGVycjtcblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0QnVzeUxvY2tlci51bmxvY2sodGhhdC5vTG9ja09iamVjdCk7XG5cdFx0fVxuXHR9XG5cdC8qKlxuXHQgKiBDYW5jZWwgJ2VkaXQnIG1vZGUgb2YgYSBkb2N1bWVudC5cblx0ICpcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgb2YgdGhlIGRvY3VtZW50IHRvIGJlIGNhbmNlbGVkIG9yIGRlbGV0ZWRcblx0ICogQHBhcmFtIFttSW5QYXJhbWV0ZXJzXSBPcHRpb25hbCwgY2FuIGNvbnRhaW4gdGhlIGZvbGxvd2luZyBhdHRyaWJ1dGVzOlxuXHQgKiBAcGFyYW0gbUluUGFyYW1ldGVycy5jYW5jZWxCdXR0b24gQ2FuY2VsIEJ1dHRvbiBvZiB0aGUgZGlzY2FyZCBwb3BvdmVyIChtYW5kYXRvcnkgZm9yIG5vdylcblx0ICogQHBhcmFtIG1JblBhcmFtZXRlcnMuc2tpcERpc2NhcmRQb3BvdmVyIE9wdGlvbmFsLCBzdXByZXNzZXMgdGhlIGRpc2NhcmQgcG9wb3ZlciBpbmNhc2Ugb2YgZHJhZnQgYXBwbGljYXRpb25zIHdoaWxlIG5hdmlnYXRpbmcgb3V0IG9mIE9QXG5cdCAqIEBwYXJhbSBvUmVzb3VyY2VCdW5kbGVcblx0ICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCA/Pz9cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0YXN5bmMgY2FuY2VsRG9jdW1lbnQoXG5cdFx0b0NvbnRleHQ6IFY0Q29udGV4dCxcblx0XHRtSW5QYXJhbWV0ZXJzOiB7IGNhbmNlbEJ1dHRvbjogYW55OyBza2lwRGlzY2FyZFBvcG92ZXI6IGJvb2xlYW4gfSB8IHVuZGVmaW5lZCxcblx0XHRvUmVzb3VyY2VCdW5kbGU6IGFueSxcblx0XHRtZXNzYWdlSGFuZGxlcjogTWVzc2FnZUhhbmRsZXJcblx0KTogUHJvbWlzZTxWNENvbnRleHQgfCBib29sZWFuPiB7XG5cdFx0Ly9jb250ZXh0IG11c3QgYWx3YXlzIGJlIHBhc3NlZCAtIG1hbmRhdG9yeSBwYXJhbWV0ZXJcblx0XHRpZiAoIW9Db250ZXh0KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJObyBjb250ZXh0IGV4aXN0cy4gUGFzcyBhIG1lYW5pbmdmdWwgY29udGV4dFwiKTtcblx0XHR9XG5cdFx0QnVzeUxvY2tlci5sb2NrKHRoaXMub0xvY2tPYmplY3QpO1xuXHRcdGNvbnN0IG1QYXJhbWV0ZXJzID0gZ2V0UGFyYW1ldGVycyhtSW5QYXJhbWV0ZXJzKTtcblx0XHRjb25zdCBvTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdGNvbnN0IHNQcm9ncmFtbWluZ01vZGVsID0gdGhpcy5nZXRQcm9ncmFtbWluZ01vZGVsKG9Db250ZXh0KTtcblxuXHRcdHRyeSB7XG5cdFx0XHRsZXQgcmV0dXJuZWRWYWx1ZTogVjRDb250ZXh0IHwgYm9vbGVhbiA9IGZhbHNlO1xuXG5cdFx0XHRpZiAoc1Byb2dyYW1taW5nTW9kZWwgPT09IFByb2dyYW1taW5nTW9kZWwuRHJhZnQgJiYgIXRoaXMuX2JJc01vZGlmaWVkKSB7XG5cdFx0XHRcdGNvbnN0IGRyYWZ0RGF0YUNvbnRleHQgPSBvTW9kZWwuYmluZENvbnRleHQoYCR7b0NvbnRleHQuZ2V0UGF0aCgpfS9EcmFmdEFkbWluaXN0cmF0aXZlRGF0YWApLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0XHRjb25zdCBkcmFmdEFkbWluRGF0YSA9IGF3YWl0IGRyYWZ0RGF0YUNvbnRleHQucmVxdWVzdE9iamVjdCgpO1xuXHRcdFx0XHRpZiAoZHJhZnRBZG1pbkRhdGEpIHtcblx0XHRcdFx0XHR0aGlzLl9iSXNNb2RpZmllZCA9ICEoZHJhZnRBZG1pbkRhdGEuQ3JlYXRpb25EYXRlVGltZSA9PT0gZHJhZnRBZG1pbkRhdGEuTGFzdENoYW5nZURhdGVUaW1lKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKCFtUGFyYW1ldGVycy5za2lwRGlzY2FyZFBvcG92ZXIpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5fc2hvd0Rpc2NhcmRQb3BvdmVyKG1QYXJhbWV0ZXJzLmNhbmNlbEJ1dHRvbiwgdGhpcy5fYklzTW9kaWZpZWQsIG9SZXNvdXJjZUJ1bmRsZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0NvbnRleHQuaXNLZWVwQWxpdmUoKSkge1xuXHRcdFx0XHQvLyBpZiB0aGUgY29udGV4dCBpcyBrZXB0IGFsaXZlIHdlIHNldCBpdCBhZ2FpbiB0byBkZXRhY2ggdGhlIG9uQmVmb3JlRGVzdHJveSBjYWxsYmFjayBhbmQgaGFuZGxlIG5hdmlnYXRpb24gaGVyZVxuXHRcdFx0XHQvLyB0aGUgY29udGV4dCBuZWVkcyB0byBzdGlsbCBiZSBrZXB0IGFsaXZlIHRvIGJlIGFibGUgdG8gcmVzZXQgY2hhbmdlcyBwcm9wZXJseVxuXHRcdFx0XHRvQ29udGV4dC5zZXRLZWVwQWxpdmUodHJ1ZSwgdW5kZWZpbmVkKTtcblx0XHRcdH1cblx0XHRcdGlmIChtUGFyYW1ldGVycy5iZWZvcmVDYW5jZWxDYWxsQmFjaykge1xuXHRcdFx0XHRhd2FpdCBtUGFyYW1ldGVycy5iZWZvcmVDYW5jZWxDYWxsQmFjayh7IGNvbnRleHQ6IG9Db250ZXh0IH0pO1xuXHRcdFx0fVxuXHRcdFx0c3dpdGNoIChzUHJvZ3JhbW1pbmdNb2RlbCkge1xuXHRcdFx0XHRjYXNlIFByb2dyYW1taW5nTW9kZWwuRHJhZnQ6XG5cdFx0XHRcdFx0Y29uc3QgYkhhc0FjdGl2ZUVudGl0eSA9IGF3YWl0IG9Db250ZXh0LnJlcXVlc3RPYmplY3QoXCJIYXNBY3RpdmVFbnRpdHlcIik7XG5cdFx0XHRcdFx0aWYgKCFiSGFzQWN0aXZlRW50aXR5KSB7XG5cdFx0XHRcdFx0XHRpZiAob0NvbnRleHQgJiYgb0NvbnRleHQuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0XHRcdFx0XHRvQ29udGV4dC5nZXRCaW5kaW5nKCkucmVzZXRDaGFuZ2VzKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm5lZFZhbHVlID0gYXdhaXQgZHJhZnQuZGVsZXRlRHJhZnQob0NvbnRleHQsIHRoaXMuX29BcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvU2libGluZ0NvbnRleHQgPSBvTW9kZWwuYmluZENvbnRleHQoYCR7b0NvbnRleHQuZ2V0UGF0aCgpfS9TaWJsaW5nRW50aXR5YCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzQ2Fub25pY2FsUGF0aCA9IGF3YWl0IG9TaWJsaW5nQ29udGV4dC5yZXF1ZXN0Q2Fub25pY2FsUGF0aCgpO1xuXHRcdFx0XHRcdFx0XHRpZiAob0NvbnRleHQgJiYgb0NvbnRleHQuaGFzUGVuZGluZ0NoYW5nZXMoKSkge1xuXHRcdFx0XHRcdFx0XHRcdG9Db250ZXh0LmdldEJpbmRpbmcoKS5yZXNldENoYW5nZXMoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRyZXR1cm5lZFZhbHVlID0gb01vZGVsLmJpbmRDb250ZXh0KHNDYW5vbmljYWxQYXRoKS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHRcdFx0XHRcdH0gZmluYWxseSB7XG5cdFx0XHRcdFx0XHRcdGF3YWl0IGRyYWZ0LmRlbGV0ZURyYWZ0KG9Db250ZXh0LCB0aGlzLl9vQXBwQ29tcG9uZW50KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreTpcblx0XHRcdFx0XHRjb25zdCBkaXNjYXJkZWRDb250ZXh0ID0gYXdhaXQgc3RpY2t5LmRpc2NhcmREb2N1bWVudChvQ29udGV4dCk7XG5cdFx0XHRcdFx0aWYgKGRpc2NhcmRlZENvbnRleHQpIHtcblx0XHRcdFx0XHRcdGlmIChkaXNjYXJkZWRDb250ZXh0Lmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdFx0XHRcdFx0ZGlzY2FyZGVkQ29udGV4dC5nZXRCaW5kaW5nKCkucmVzZXRDaGFuZ2VzKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAoIXRoaXMuX2JDcmVhdGVNb2RlKSB7XG5cdFx0XHRcdFx0XHRcdGRpc2NhcmRlZENvbnRleHQucmVmcmVzaCgpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm5lZFZhbHVlID0gZGlzY2FyZGVkQ29udGV4dDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW5jZWwgZG9jdW1lbnQgb25seSBhbGxvd2VkIGZvciBkcmFmdCBvciBzdGlja3kgc2Vzc2lvbiBzdXBwb3J0ZWQgc2VydmljZXNcIik7XG5cdFx0XHR9XG5cblx0XHRcdHRoaXMuX2JJc01vZGlmaWVkID0gZmFsc2U7XG5cdFx0XHQvLyByZW1vdmUgZXhpc3RpbmcgYm91bmQgdHJhbnNpdGlvbiBtZXNzYWdlc1xuXHRcdFx0bWVzc2FnZUhhbmRsZXIucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHQvLyBzaG93IHVuYm91bmQgbWVzc2FnZXNcblx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcygpO1xuXHRcdFx0cmV0dXJuIHJldHVybmVkVmFsdWU7XG5cdFx0fSBjYXRjaCAoZXJyOiBhbnkpIHtcblx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlcygpO1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH0gZmluYWxseSB7XG5cdFx0XHRCdXN5TG9ja2VyLnVubG9jayh0aGlzLm9Mb2NrT2JqZWN0KTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogU2F2ZXMgdGhlIGRvY3VtZW50LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHN0YXRpY1xuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgZG9jdW1lbnQgdG8gYmUgc2F2ZWRcblx0ICogQHBhcmFtIG9SZXNvdXJjZUJ1bmRsZVxuXHQgKiBAcGFyYW0gYkV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3Jcblx0ICogQHBhcmFtIGFCaW5kaW5nc1xuXHQgKiBAcGFyYW0gbWVzc2FnZUhhbmRsZXJcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyB3aXRoID8/P1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRhc3luYyBzYXZlRG9jdW1lbnQoXG5cdFx0b0NvbnRleHQ6IFY0Q29udGV4dCxcblx0XHRvUmVzb3VyY2VCdW5kbGU6IGFueSxcblx0XHRiRXhlY3V0ZVNpZGVFZmZlY3RzT25FcnJvcjogYW55LFxuXHRcdGFCaW5kaW5nczogYW55LFxuXHRcdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlclxuXHQpOiBQcm9taXNlPFY0Q29udGV4dD4ge1xuXHRcdGlmICghb0NvbnRleHQpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJCaW5kaW5nIGNvbnRleHQgdG8gZHJhZnQgZG9jdW1lbnQgaXMgcmVxdWlyZWRcIikpO1xuXHRcdH1cblx0XHRjb25zdCBzUHJvZ3JhbW1pbmdNb2RlbCA9IHRoaXMuZ2V0UHJvZ3JhbW1pbmdNb2RlbChvQ29udGV4dCk7XG5cdFx0aWYgKHNQcm9ncmFtbWluZ01vZGVsICE9PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSAmJiBzUHJvZ3JhbW1pbmdNb2RlbCAhPT0gUHJvZ3JhbW1pbmdNb2RlbC5EcmFmdCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiU2F2ZSBpcyBvbmx5IGFsbG93ZWQgZm9yIGRyYWZ0IG9yIHN0aWNreSBzZXNzaW9uIHN1cHBvcnRlZCBzZXJ2aWNlc1wiKTtcblx0XHR9XG5cdFx0Ly8gaW4gY2FzZSBvZiBzYXZpbmcgLyBhY3RpdmF0aW5nIHRoZSBib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzIHNoYWxsIGJlIHJlbW92ZWQgYmVmb3JlIHRoZSBQQVRDSC9QT1NUXG5cdFx0Ly8gaXMgc2VudCB0byB0aGUgYmFja2VuZFxuXHRcdG1lc3NhZ2VIYW5kbGVyLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXG5cdFx0dHJ5IHtcblx0XHRcdEJ1c3lMb2NrZXIubG9jayh0aGlzLm9Mb2NrT2JqZWN0KTtcblx0XHRcdGNvbnN0IG9BY3RpdmVEb2N1bWVudCA9XG5cdFx0XHRcdHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLkRyYWZ0XG5cdFx0XHRcdFx0PyBhd2FpdCBkcmFmdC5hY3RpdmF0ZURvY3VtZW50KG9Db250ZXh0LCB0aGlzLl9nZXRBcHBDb21wb25lbnQoKSwge30sIG1lc3NhZ2VIYW5kbGVyKVxuXHRcdFx0XHRcdDogYXdhaXQgc3RpY2t5LmFjdGl2YXRlRG9jdW1lbnQob0NvbnRleHQsIHRoaXMuX2dldEFwcENvbXBvbmVudCgpKTtcblxuXHRcdFx0Y29uc3QgYk5ld09iamVjdCA9IHNQcm9ncmFtbWluZ01vZGVsID09PSBQcm9ncmFtbWluZ01vZGVsLlN0aWNreSA/IHRoaXMuX2JDcmVhdGVNb2RlIDogIW9Db250ZXh0LmdldE9iamVjdCgpLkhhc0FjdGl2ZUVudGl0eTtcblx0XHRcdGNvbnN0IG1lc3NhZ2VzUmVjZWl2ZWQgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0TWVzc2FnZXMoKS5jb25jYXQobWVzc2FnZUhhbmRsaW5nLmdldE1lc3NhZ2VzKHRydWUsIHRydWUpKTsgLy8gZ2V0IHVuYm91bmQgYW5kIGJvdW5kIG1lc3NhZ2VzIHByZXNlbnQgaW4gdGhlIG1vZGVsXG5cdFx0XHRpZiAoIShtZXNzYWdlc1JlY2VpdmVkLmxlbmd0aCA9PT0gMSAmJiBtZXNzYWdlc1JlY2VpdmVkWzBdLnR5cGUgPT09IGNvcmVMaWJyYXJ5Lk1lc3NhZ2VUeXBlLlN1Y2Nlc3MpKSB7XG5cdFx0XHRcdC8vIHNob3cgb3VyIG9iamVjdCBjcmVhdGlvbiB0b2FzdCBvbmx5IGlmIGl0IGlzIG5vdCBjb21pbmcgZnJvbSBiYWNrZW5kXG5cdFx0XHRcdE1lc3NhZ2VUb2FzdC5zaG93KFxuXHRcdFx0XHRcdGJOZXdPYmplY3Rcblx0XHRcdFx0XHRcdD8gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9PQkpFQ1RfQ1JFQVRFRFwiLCBvUmVzb3VyY2VCdW5kbGUpXG5cdFx0XHRcdFx0XHQ6IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfT0JKRUNUX1NBVkVEXCIsIG9SZXNvdXJjZUJ1bmRsZSlcblx0XHRcdFx0KTtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fYklzTW9kaWZpZWQgPSBmYWxzZTtcblx0XHRcdHJldHVybiBvQWN0aXZlRG9jdW1lbnQ7XG5cdFx0fSBjYXRjaCAoZXJyOiBhbnkpIHtcblx0XHRcdGlmIChhQmluZGluZ3MgJiYgYUJpbmRpbmdzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0LyogVGhlIHNpZGVFZmZlY3RzIGFyZSBleGVjdXRlZCBvbmx5IGZvciB0YWJsZSBpdGVtcyBpbiB0cmFuc2llbnQgc3RhdGUgKi9cblx0XHRcdFx0YUJpbmRpbmdzLmZvckVhY2goKG9MaXN0QmluZGluZzogYW55KSA9PiB7XG5cdFx0XHRcdFx0aWYgKCFDb21tb25VdGlscy5oYXNUcmFuc2llbnRDb250ZXh0KG9MaXN0QmluZGluZykgJiYgYkV4ZWN1dGVTaWRlRWZmZWN0c09uRXJyb3IpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSB0aGlzLl9nZXRBcHBDb21wb25lbnQoKTtcblx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCkucmVxdWVzdFNpZGVFZmZlY3RzRm9yTmF2aWdhdGlvblByb3BlcnR5KG9MaXN0QmluZGluZy5nZXRQYXRoKCksIG9Db250ZXh0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKCk7XG5cdFx0XHR0aHJvdyBlcnI7XG5cdFx0fSBmaW5hbGx5IHtcblx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKHRoaXMub0xvY2tPYmplY3QpO1xuXHRcdH1cblx0fVxuXHQvKipcblx0ICogQ2FsbHMgYSBib3VuZCBvciB1bmJvdW5kIGFjdGlvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBzdGF0aWNcblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXIuY2FsbEFjdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXJcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgY2FsbGVkXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnNdIENvbnRhaW5zIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXNdIEEgbWFwIG9mIGFjdGlvbiBwYXJhbWV0ZXIgbmFtZXMgYW5kIHByb3ZpZGVkIHZhbHVlc1xuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLnNraXBQYXJhbWV0ZXJEaWFsb2ddIFNraXBzIHRoZSBwYXJhbWV0ZXIgZGlhbG9nIGlmIHZhbHVlcyBhcmUgcHJvdmlkZWQgZm9yIGFsbCBvZiB0aGVtXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuY29udGV4dHNdIE1hbmRhdG9yeSBmb3IgYSBib3VuZCBhY3Rpb246IEVpdGhlciBvbmUgY29udGV4dCBvciBhbiBhcnJheSB3aXRoIGNvbnRleHRzIGZvciB3aGljaCB0aGUgYWN0aW9uIGlzIHRvIGJlIGNhbGxlZFxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm1vZGVsXSBNYW5kYXRvcnkgZm9yIGFuIHVuYm91bmQgYWN0aW9uOiBBbiBpbnN0YW5jZSBvZiBhbiBPRGF0YSBWNCBtb2RlbFxuXHQgKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmludm9jYXRpb25Hcm91cGluZ10gTW9kZSBob3cgYWN0aW9ucyBhcmUgdG8gYmUgY2FsbGVkOiAnQ2hhbmdlU2V0JyB0byBwdXQgYWxsIGFjdGlvbiBjYWxscyBpbnRvIG9uZSBjaGFuZ2VzZXQsICdJc29sYXRlZCcgdG8gcHV0IHRoZW0gaW50byBzZXBhcmF0ZSBjaGFuZ2VzZXRzXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnMubGFiZWxdIEEgaHVtYW4tcmVhZGFibGUgbGFiZWwgZm9yIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIFttUGFyYW1ldGVycy5iR2V0Qm91bmRDb250ZXh0XSBJZiBzcGVjaWZpZWQsIHRoZSBhY3Rpb24gcHJvbWlzZSByZXR1cm5zIHRoZSBib3VuZCBjb250ZXh0XG5cdCAqIEBwYXJhbSBvVmlldyBDb250YWlucyB0aGUgb2JqZWN0IG9mIHRoZSBjdXJyZW50IHZpZXdcblx0ICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCBhbiBhcnJheSBvZiByZXNwb25zZSBvYmplY3RzIChUT0RPOiB0byBiZSBjaGFuZ2VkKVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRhc3luYyBjYWxsQWN0aW9uKHNBY3Rpb25OYW1lOiBzdHJpbmcsIG1QYXJhbWV0ZXJzOiBhbnksIG9WaWV3OiBWaWV3IHwgbnVsbCwgbWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyKTogUHJvbWlzZTxhbnk+IHtcblx0XHRtUGFyYW1ldGVycyA9IGdldFBhcmFtZXRlcnMobVBhcmFtZXRlcnMpO1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuXHRcdGNvbnN0IHRoYXQgPSB0aGlzO1xuXHRcdGxldCBvQ29udGV4dCwgb01vZGVsOiBhbnk7XG5cdFx0Y29uc3QgbUJpbmRpbmdQYXJhbWV0ZXJzID0gbVBhcmFtZXRlcnMuYmluZGluZ1BhcmFtZXRlcnM7XG5cdFx0aWYgKCFzQWN0aW9uTmFtZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUHJvdmlkZSBuYW1lIG9mIGFjdGlvbiB0byBiZSBleGVjdXRlZFwiKTtcblx0XHR9XG5cdFx0Ly8gYWN0aW9uIGltcG9ydHMgYXJlIG5vdCBkaXJlY3RseSBvYnRhaW5lZCBmcm9tIHRoZSBtZXRhTW9kZWwgYnkgaXQgaXMgcHJlc2VudCBpbnNpZGUgdGhlIGVudGl0eUNvbnRhaW5lclxuXHRcdC8vIGFuZCB0aGUgYWNpb25zIGl0IHJlZmVycyB0byBwcmVzZW50IG91dHNpZGUgdGhlIGVudGl0eWNvbnRhaW5lciwgaGVuY2UgdG8gb2J0YWluIGtpbmQgb2YgdGhlIGFjdGlvblxuXHRcdC8vIHNwbGl0KCkgb24gaXRzIG5hbWUgd2FzIHJlcXVpcmVkXG5cdFx0Y29uc3Qgc05hbWUgPSBzQWN0aW9uTmFtZS5zcGxpdChcIi9cIilbMV07XG5cdFx0c0FjdGlvbk5hbWUgPSBzTmFtZSB8fCBzQWN0aW9uTmFtZTtcblx0XHRvQ29udGV4dCA9IHNOYW1lID8gdW5kZWZpbmVkIDogbVBhcmFtZXRlcnMuY29udGV4dHM7XG5cdFx0Ly9jaGVja2luZyB3aGV0aGVyIHRoZSBjb250ZXh0IGlzIGFuIGFycmF5IHdpdGggbW9yZSB0aGFuIDAgbGVuZ3RoIG9yIG5vdCBhbiBhcnJheShjcmVhdGUgYWN0aW9uKVxuXHRcdGlmIChvQ29udGV4dCAmJiAoKEFycmF5LmlzQXJyYXkob0NvbnRleHQpICYmIG9Db250ZXh0Lmxlbmd0aCkgfHwgIUFycmF5LmlzQXJyYXkob0NvbnRleHQpKSkge1xuXHRcdFx0b0NvbnRleHQgPSBBcnJheS5pc0FycmF5KG9Db250ZXh0KSA/IG9Db250ZXh0WzBdIDogb0NvbnRleHQ7XG5cdFx0XHRvTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdH1cblx0XHRpZiAobVBhcmFtZXRlcnMubW9kZWwpIHtcblx0XHRcdG9Nb2RlbCA9IG1QYXJhbWV0ZXJzLm1vZGVsO1xuXHRcdH1cblx0XHRpZiAoIW9Nb2RlbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUGFzcyBhIGNvbnRleHQgZm9yIGEgYm91bmQgYWN0aW9uIG9yIHBhc3MgdGhlIG1vZGVsIGZvciBhbiB1bmJvdW5kIGFjdGlvblwiKTtcblx0XHR9XG5cdFx0Ly8gZ2V0IHRoZSBiaW5kaW5nIHBhcmFtZXRlcnMgJHNlbGVjdCBhbmQgJGV4cGFuZCBmb3IgdGhlIHNpZGUgZWZmZWN0IG9uIHRoaXMgYWN0aW9uXG5cdFx0Ly8gYWxzbyBnYXRoZXIgYWRkaXRpb25hbCBwcm9wZXJ0eSBwYXRocyB0byBiZSByZXF1ZXN0ZWQgc3VjaCBhcyB0ZXh0IGFzc29jaWF0aW9uc1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSB0aGF0Ll9nZXRBcHBDb21wb25lbnQoKTtcblx0XHRjb25zdCBtU2lkZUVmZmVjdHNQYXJhbWV0ZXJzID0gb0FwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKS5nZXRPRGF0YUFjdGlvblNpZGVFZmZlY3RzKHNBY3Rpb25OYW1lLCBvQ29udGV4dCkgfHwge307XG5cblx0XHRjb25zdCBkaXNwbGF5VW5hcHBsaWNhYmxlQ29udGV4dHNEaWFsb2cgPSAoKTogUHJvbWlzZTxWNENvbnRleHRbXSB8IHZvaWQ+ID0+IHtcblx0XHRcdGlmICghbVBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHQgfHwgbVBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHQubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobVBhcmFtZXRlcnMuY29udGV4dHMpO1xuXHRcdFx0fVxuXG5cdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0XHRjb25zdCBmbk9wZW5BbmRGaWxsRGlhbG9nID0gZnVuY3Rpb24gKG9EbGc6IERpYWxvZykge1xuXHRcdFx0XHRcdGxldCBvRGlhbG9nQ29udGVudDtcblx0XHRcdFx0XHRjb25zdCBuTm90QXBwbGljYWJsZSA9IG1QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0Lmxlbmd0aCxcblx0XHRcdFx0XHRcdGFOb3RBcHBsaWNhYmxlSXRlbXMgPSBbXTtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG1QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRvRGlhbG9nQ29udGVudCA9IG1QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0W2ldLmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0YU5vdEFwcGxpY2FibGVJdGVtcy5wdXNoKG9EaWFsb2dDb250ZW50KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3Qgb05vdEFwcGxpY2FibGVJdGVtc01vZGVsID0gbmV3IEpTT05Nb2RlbChhTm90QXBwbGljYWJsZUl0ZW1zKTtcblx0XHRcdFx0XHRjb25zdCBvVG90YWxzID0gbmV3IEpTT05Nb2RlbCh7IHRvdGFsOiBuTm90QXBwbGljYWJsZSwgbGFiZWw6IG1QYXJhbWV0ZXJzLmxhYmVsIH0pO1xuXHRcdFx0XHRcdG9EbGcuc2V0TW9kZWwob05vdEFwcGxpY2FibGVJdGVtc01vZGVsLCBcIm5vdEFwcGxpY2FibGVcIik7XG5cdFx0XHRcdFx0b0RsZy5zZXRNb2RlbChvVG90YWxzLCBcInRvdGFsc1wiKTtcblx0XHRcdFx0XHRvRGxnLm9wZW4oKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0Ly8gU2hvdyB0aGUgY29udGV4dHMgdGhhdCBhcmUgbm90IGFwcGxpY2FibGUgYW5kIHdpbGwgbm90IHRoZXJlZm9yZSBiZSBwcm9jZXNzZWRcblx0XHRcdFx0Y29uc3Qgc0ZyYWdtZW50TmFtZSA9IFwic2FwLmZlLmNvcmUuY29udHJvbHMuQWN0aW9uUGFydGlhbFwiO1xuXHRcdFx0XHRjb25zdCBvRGlhbG9nRnJhZ21lbnQgPSBYTUxUZW1wbGF0ZVByb2Nlc3Nvci5sb2FkVGVtcGxhdGUoc0ZyYWdtZW50TmFtZSwgXCJmcmFnbWVudFwiKTtcblx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdFx0Y29uc3Qgc0Nhbm9uaWNhbFBhdGggPSBtUGFyYW1ldGVycy5jb250ZXh0c1swXS5nZXRDYW5vbmljYWxQYXRoKCk7XG5cdFx0XHRcdGNvbnN0IHNFbnRpdHlTZXQgPSBgJHtzQ2Fub25pY2FsUGF0aC5zdWJzdHIoMCwgc0Nhbm9uaWNhbFBhdGguaW5kZXhPZihcIihcIikpfS9gO1xuXHRcdFx0XHRjb25zdCBvRGlhbG9nTGFiZWxNb2RlbCA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0XHRcdHRpdGxlOiBtUGFyYW1ldGVycy5sYWJlbFxuXHRcdFx0XHR9KTtcblxuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IG9GcmFnbWVudCA9IGF3YWl0IFhNTFByZXByb2Nlc3Nvci5wcm9jZXNzKFxuXHRcdFx0XHRcdFx0b0RpYWxvZ0ZyYWdtZW50LFxuXHRcdFx0XHRcdFx0eyBuYW1lOiBzRnJhZ21lbnROYW1lIH0sXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFx0XHRcdGVudGl0eVR5cGU6IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0VudGl0eVNldCksXG5cdFx0XHRcdFx0XHRcdFx0bGFiZWw6IG9EaWFsb2dMYWJlbE1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRcdFx0XHRlbnRpdHlUeXBlOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0XHRsYWJlbDogb0RpYWxvZ0xhYmVsTW9kZWxcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1jb25zdFxuXHRcdFx0XHRcdGxldCBvRGlhbG9nOiBEaWFsb2c7XG5cdFx0XHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSB7XG5cdFx0XHRcdFx0XHRvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFVzZXIgY2FuY2VscyBhY3Rpb25cblx0XHRcdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0b25Db250aW51ZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHQvLyBVc2VycyBjb250aW51ZXMgdGhlIGFjdGlvbiB3aXRoIHRoZSBib3VuZCBjb250ZXh0c1xuXHRcdFx0XHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHRcdHJlc29sdmUobVBhcmFtZXRlcnMuYXBwbGljYWJsZUNvbnRleHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0b0RpYWxvZyA9IChhd2FpdCBGcmFnbWVudC5sb2FkKHsgZGVmaW5pdGlvbjogb0ZyYWdtZW50LCBjb250cm9sbGVyOiBvQ29udHJvbGxlciB9KSkgYXMgRGlhbG9nO1xuXHRcdFx0XHRcdG9Db250cm9sbGVyLm9uQ2xvc2UgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHQvLyBVc2VyIGNhbmNlbHMgYWN0aW9uXG5cdFx0XHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRvQ29udHJvbGxlci5vbkNvbnRpbnVlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0Ly8gVXNlcnMgY29udGludWVzIHRoZSBhY3Rpb24gd2l0aCB0aGUgYm91bmQgY29udGV4dHNcblx0XHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdHJlc29sdmUobVBhcmFtZXRlcnMuYXBwbGljYWJsZUNvbnRleHQpO1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLmFkZERlcGVuZGVudChvRGlhbG9nKTtcblx0XHRcdFx0XHRmbk9wZW5BbmRGaWxsRGlhbG9nKG9EaWFsb2cpO1xuXHRcdFx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdFx0XHRyZWplY3Qob0Vycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdHRyeSB7XG5cdFx0XHRsZXQgb1Jlc3VsdDogYW55O1xuXHRcdFx0aWYgKG9Db250ZXh0ICYmIG9Nb2RlbCkge1xuXHRcdFx0XHRjb25zdCBjb250ZXh0VG9Qcm9jZXNzID0gYXdhaXQgZGlzcGxheVVuYXBwbGljYWJsZUNvbnRleHRzRGlhbG9nKCk7XG5cdFx0XHRcdGlmIChjb250ZXh0VG9Qcm9jZXNzKSB7XG5cdFx0XHRcdFx0b1Jlc3VsdCA9IGF3YWl0IG9wZXJhdGlvbnMuY2FsbEJvdW5kQWN0aW9uKHNBY3Rpb25OYW1lLCBjb250ZXh0VG9Qcm9jZXNzLCBvTW9kZWwsIG9BcHBDb21wb25lbnQsIHtcblx0XHRcdFx0XHRcdHBhcmFtZXRlclZhbHVlczogbVBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzLFxuXHRcdFx0XHRcdFx0aW52b2NhdGlvbkdyb3VwaW5nOiBtUGFyYW1ldGVycy5pbnZvY2F0aW9uR3JvdXBpbmcsXG5cdFx0XHRcdFx0XHRsYWJlbDogbVBhcmFtZXRlcnMubGFiZWwsXG5cdFx0XHRcdFx0XHRza2lwUGFyYW1ldGVyRGlhbG9nOiBtUGFyYW1ldGVycy5za2lwUGFyYW1ldGVyRGlhbG9nLFxuXHRcdFx0XHRcdFx0bUJpbmRpbmdQYXJhbWV0ZXJzOiBtQmluZGluZ1BhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRlbnRpdHlTZXROYW1lOiBtUGFyYW1ldGVycy5lbnRpdHlTZXROYW1lLFxuXHRcdFx0XHRcdFx0YWRkaXRpb25hbFNpZGVFZmZlY3Q6IG1TaWRlRWZmZWN0c1BhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRvblN1Ym1pdHRlZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlci5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdFx0QnVzeUxvY2tlci5sb2NrKHRoYXQub0xvY2tPYmplY3QpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdG9uUmVzcG9uc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sodGhhdC5vTG9ja09iamVjdCk7XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0cGFyZW50Q29udHJvbDogbVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCxcblx0XHRcdFx0XHRcdGNvbnRyb2xJZDogbVBhcmFtZXRlcnMuY29udHJvbElkLFxuXHRcdFx0XHRcdFx0aW50ZXJuYWxNb2RlbENvbnRleHQ6IG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LFxuXHRcdFx0XHRcdFx0b3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBtUGFyYW1ldGVycy5vcGVyYXRpb25BdmFpbGFibGVNYXAsXG5cdFx0XHRcdFx0XHRiSXNDcmVhdGVBY3Rpb246IG1QYXJhbWV0ZXJzLmJJc0NyZWF0ZUFjdGlvbixcblx0XHRcdFx0XHRcdGJHZXRCb3VuZENvbnRleHQ6IG1QYXJhbWV0ZXJzLmJHZXRCb3VuZENvbnRleHQsXG5cdFx0XHRcdFx0XHRiT2JqZWN0UGFnZTogbVBhcmFtZXRlcnMuYk9iamVjdFBhZ2UsXG5cdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcjogbWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246IG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbixcblx0XHRcdFx0XHRcdHNlbGVjdGVkSXRlbXM6IG1QYXJhbWV0ZXJzLmNvbnRleHRzXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b1Jlc3VsdCA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9SZXN1bHQgPSBhd2FpdCBvcGVyYXRpb25zLmNhbGxBY3Rpb25JbXBvcnQoc0FjdGlvbk5hbWUsIG9Nb2RlbCwgb0FwcENvbXBvbmVudCwge1xuXHRcdFx0XHRcdHBhcmFtZXRlclZhbHVlczogbVBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzLFxuXHRcdFx0XHRcdGxhYmVsOiBtUGFyYW1ldGVycy5sYWJlbCxcblx0XHRcdFx0XHRza2lwUGFyYW1ldGVyRGlhbG9nOiBtUGFyYW1ldGVycy5za2lwUGFyYW1ldGVyRGlhbG9nLFxuXHRcdFx0XHRcdGJpbmRpbmdQYXJhbWV0ZXJzOiBtQmluZGluZ1BhcmFtZXRlcnMsXG5cdFx0XHRcdFx0ZW50aXR5U2V0TmFtZTogbVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZSxcblx0XHRcdFx0XHRvblN1Ym1pdHRlZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0QnVzeUxvY2tlci5sb2NrKHRoYXQub0xvY2tPYmplY3QpO1xuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b25SZXNwb25zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sodGhhdC5vTG9ja09iamVjdCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRwYXJlbnRDb250cm9sOiBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLFxuXHRcdFx0XHRcdGludGVybmFsTW9kZWxDb250ZXh0OiBtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRvcGVyYXRpb25BdmFpbGFibGVNYXA6IG1QYXJhbWV0ZXJzLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCxcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcjogbWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0Yk9iamVjdFBhZ2U6IG1QYXJhbWV0ZXJzLmJPYmplY3RQYWdlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVBY3Rpb25SZXNwb25zZShtZXNzYWdlSGFuZGxlciwgbVBhcmFtZXRlcnMsIHNBY3Rpb25OYW1lKTtcblx0XHRcdHJldHVybiBvUmVzdWx0O1xuXHRcdH0gY2F0Y2ggKGVycjogYW55KSB7XG5cdFx0XHRhd2FpdCB0aGlzLl9oYW5kbGVBY3Rpb25SZXNwb25zZShtZXNzYWdlSGFuZGxlciwgbVBhcmFtZXRlcnMsIHNBY3Rpb25OYW1lKTtcblx0XHRcdHRocm93IGVycjtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqIEhhbmRsZXMgbWVzc2FnZXMgZm9yIGFjdGlvbiBjYWxsLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXIjX2hhbmRsZUFjdGlvblJlc3BvbnNlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAcGFyYW0gbWVzc2FnZUhhbmRsZXJcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIFBhcmFtZXRlcnMgdG8gYmUgY29uc2lkZXJlZCBmb3IgdGhlIGFjdGlvbi5cblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgY2FsbGVkXG5cdCAqIEByZXR1cm5zIFByb21pc2UgYWZ0ZXIgbWVzc2FnZSBkaWFsb2cgaXMgb3BlbmVkIGlmIHJlcXVpcmVkLlxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRfaGFuZGxlQWN0aW9uUmVzcG9uc2UobWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLCBtUGFyYW1ldGVyczogYW55LCBzQWN0aW9uTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgYVRyYW5zaWVudE1lc3NhZ2VzID0gbWVzc2FnZUhhbmRsaW5nLmdldE1lc3NhZ2VzKHRydWUsIHRydWUpO1xuXHRcdGlmIChhVHJhbnNpZW50TWVzc2FnZXMubGVuZ3RoID4gMCAmJiBtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCkge1xuXHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzQWN0aW9uTmFtZVwiLCBtUGFyYW1ldGVycy5sYWJlbCA/IG1QYXJhbWV0ZXJzLmxhYmVsIDogc0FjdGlvbk5hbWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VzKCk7XG5cdH1cblx0LyoqXG5cdCAqIEhhbmRsZXMgdmFsaWRhdGlvbiBlcnJvcnMgZm9yIHRoZSAnRGlzY2FyZCcgYWN0aW9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuVHJhbnNhY3Rpb25IZWxwZXIjaGFuZGxlVmFsaWRhdGlvbkVycm9yXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAc3RhdGljXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGhhbmRsZVZhbGlkYXRpb25FcnJvcigpIHtcblx0XHRjb25zdCBvTWVzc2FnZU1hbmFnZXIgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCksXG5cdFx0XHRlcnJvclRvUmVtb3ZlID0gb01lc3NhZ2VNYW5hZ2VyXG5cdFx0XHRcdC5nZXRNZXNzYWdlTW9kZWwoKVxuXHRcdFx0XHQuZ2V0RGF0YSgpXG5cdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKGVycm9yOiBhbnkpIHtcblx0XHRcdFx0XHQvLyBvbmx5IG5lZWRzIHRvIGhhbmRsZSB2YWxpZGF0aW9uIG1lc3NhZ2VzLCB0ZWNobmljYWwgYW5kIHBlcnNpc3RlbnQgZXJyb3JzIG5lZWRzIG5vdCB0byBiZSBjaGVja2VkIGhlcmUuXG5cdFx0XHRcdFx0aWYgKGVycm9yLnZhbGlkYXRpb24pIHtcblx0XHRcdFx0XHRcdHJldHVybiBlcnJvcjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdG9NZXNzYWdlTWFuYWdlci5yZW1vdmVNZXNzYWdlcyhlcnJvclRvUmVtb3ZlKTtcblx0fVxuXHQvKipcblx0ICogU2hvd3MgYSBwb3BvdmVyIGlmIGl0IG5lZWRzIHRvIGJlIHNob3duLlxuXHQgKiBUT0RPOiBQb3BvdmVyIGlzIHNob3duIGlmIHVzZXIgaGFzIG1vZGlmaWVkIGFueSBkYXRhLlxuXHQgKiBUT0RPOiBQb3BvdmVyIGlzIHNob3duIGlmIHRoZXJlJ3MgYSBkaWZmZXJlbmNlIGZyb20gZHJhZnQgYWRtaW4gZGF0YS5cblx0ICpcblx0ICogQHN0YXRpY1xuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlci5fc2hvd0Rpc2NhcmRQb3BvdmVyXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAcGFyYW0gb0NhbmNlbEJ1dHRvbiBUaGUgY29udHJvbCB3aGljaCB3aWxsIG9wZW4gdGhlIHBvcG92ZXJcblx0ICogQHBhcmFtIGJJc01vZGlmaWVkXG5cdCAqIEBwYXJhbSBvUmVzb3VyY2VCdW5kbGVcblx0ICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyBpZiB1c2VyIGNvbmZpcm1zIGRpc2NhcmQsIHJlamVjdHMgaWYgb3RoZXJ3aXNlLCByZWplY3RzIGlmIG5vIGNvbnRyb2wgcGFzc2VkIHRvIG9wZW4gcG9wb3ZlclxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRfc2hvd0Rpc2NhcmRQb3BvdmVyKG9DYW5jZWxCdXR0b246IGFueSwgYklzTW9kaWZpZWQ6IGFueSwgb1Jlc291cmNlQnVuZGxlOiBhbnkpIHtcblx0XHQvLyBUT0RPOiBJbXBsZW1lbnQgdGhpcyBwb3BvdmVyIGFzIGEgZnJhZ21lbnQgYXMgaW4gdjI/P1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuXHRcdGNvbnN0IHRoYXQgPSB0aGlzO1xuXHRcdHRoYXQuX2JDb250aW51ZURpc2NhcmQgPSBmYWxzZTtcblx0XHQvLyB0byBiZSBpbXBsZW1lbnRlZFxuXHRcdHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPihmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG5cdFx0XHRpZiAoIW9DYW5jZWxCdXR0b24pIHtcblx0XHRcdFx0cmVqZWN0KFwiQ2FuY2VsIGJ1dHRvbiBub3QgZm91bmRcIik7XG5cdFx0XHR9XG5cdFx0XHQvL1Nob3cgcG9wb3ZlciBvbmx5IHdoZW4gZGF0YSBpcyBjaGFuZ2VkLlxuXHRcdFx0aWYgKGJJc01vZGlmaWVkKSB7XG5cdFx0XHRcdGNvbnN0IGZuT25BZnRlckRpc2NhcmQgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0b0NhbmNlbEJ1dHRvbi5zZXRFbmFibGVkKHRydWUpO1xuXHRcdFx0XHRcdGlmICh0aGF0Ll9iQ29udGludWVEaXNjYXJkKSB7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJlamVjdChcIkRpc2NhcmQgb3BlcmF0aW9uIHdhcyByZWplY3RlZC4gRG9jdW1lbnQgaGFzIG5vdCBiZWVuIGRpc2NhcmRlZFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dGhhdC5fb1BvcG92ZXIuZGV0YWNoQWZ0ZXJDbG9zZShmbk9uQWZ0ZXJEaXNjYXJkKTtcblx0XHRcdFx0fTtcblx0XHRcdFx0aWYgKCF0aGF0Ll9vUG9wb3Zlcikge1xuXHRcdFx0XHRcdGNvbnN0IG9UZXh0ID0gbmV3IFRleHQoe1xuXHRcdFx0XHRcdFx0XHQvL1RoaXMgdGV4dCBpcyB0aGUgc2FtZSBhcyBMUiB2Mi5cblx0XHRcdFx0XHRcdFx0Ly9UT0RPOiBEaXNwbGF5IG1lc3NhZ2UgcHJvdmlkZWQgYnkgYXBwIGRldmVsb3Blcj8/P1xuXHRcdFx0XHRcdFx0XHR0ZXh0OiBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0RSQUZUX0RJU0NBUkRfTUVTU0FHRVwiLCBvUmVzb3VyY2VCdW5kbGUpXG5cdFx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRcdG9CdXR0b24gPSBuZXcgQnV0dG9uKHtcblx0XHRcdFx0XHRcdFx0dGV4dDogQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9EUkFGVF9ESVNDQVJEX0JVVFRPTlwiLCBvUmVzb3VyY2VCdW5kbGUpLFxuXHRcdFx0XHRcdFx0XHR3aWR0aDogXCIxMDAlXCIsXG5cdFx0XHRcdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhhdC5oYW5kbGVWYWxpZGF0aW9uRXJyb3IoKTtcblx0XHRcdFx0XHRcdFx0XHR0aGF0Ll9iQ29udGludWVEaXNjYXJkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHR0aGF0Ll9vUG9wb3Zlci5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRhcmlhTGFiZWxsZWRCeTogb1RleHRcblx0XHRcdFx0XHRcdH0gYXMgYW55KTtcblx0XHRcdFx0XHR0aGF0Ll9vUG9wb3ZlciA9IG5ldyBQb3BvdmVyKHtcblx0XHRcdFx0XHRcdHNob3dIZWFkZXI6IGZhbHNlLFxuXHRcdFx0XHRcdFx0cGxhY2VtZW50OiBcIlRvcFwiLFxuXHRcdFx0XHRcdFx0Y29udGVudDogW1xuXHRcdFx0XHRcdFx0XHRuZXcgVkJveCh7XG5cdFx0XHRcdFx0XHRcdFx0aXRlbXM6IFtvVGV4dCwgb0J1dHRvbl1cblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0XHRiZWZvcmVPcGVuOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdC8vIG1ha2Ugc3VyZSB0byBOT1QgdHJpZ2dlciBtdWx0aXBsZSBjYW5jZWwgZmxvd3Ncblx0XHRcdFx0XHRcdFx0b0NhbmNlbEJ1dHRvbi5zZXRFbmFibGVkKGZhbHNlKTtcblx0XHRcdFx0XHRcdFx0dGhhdC5fb1BvcG92ZXIuc2V0SW5pdGlhbEZvY3VzKG9CdXR0b24pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHRoYXQuX29Qb3BvdmVyLmFkZFN0eWxlQ2xhc3MoXCJzYXBVaUNvbnRlbnRQYWRkaW5nXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoYXQuX29Qb3BvdmVyLmF0dGFjaEFmdGVyQ2xvc2UoZm5PbkFmdGVyRGlzY2FyZCk7XG5cdFx0XHRcdHRoYXQuX29Qb3BvdmVyLm9wZW5CeShvQ2FuY2VsQnV0dG9uLCBmYWxzZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGF0LmhhbmRsZVZhbGlkYXRpb25FcnJvcigpO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0LyoqXG5cdCAqIFNldHMgdGhlIGRvY3VtZW50IHRvIG1vZGlmaWVkIHN0YXRlIG9uIHBhdGNoIGV2ZW50LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHN0YXRpY1xuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlci5oYW5kbGVEb2N1bWVudE1vZGlmaWNhdGlvbnNcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdGhhbmRsZURvY3VtZW50TW9kaWZpY2F0aW9ucygpIHtcblx0XHR0aGlzLl9iSXNNb2RpZmllZCA9IHRydWU7XG5cdH1cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgb3duZXIgY29tcG9uZW50LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHN0YXRpY1xuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlci5fZ2V0T3duZXJDb21wb25lbnRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyXG5cdCAqIEByZXR1cm5zIFRoZSBhcHAgY29tcG9uZW50XG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdF9nZXRBcHBDb21wb25lbnQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX29BcHBDb21wb25lbnQ7XG5cdH1cblxuXHRfb25GaWVsZENoYW5nZShvRXZlbnQ6IGFueSwgb0NyZWF0ZUJ1dHRvbjogYW55LCBtZXNzYWdlSGFuZGxlcjogTWVzc2FnZUhhbmRsZXIsIGZuVmFsaWRhdGVSZXF1aXJlZFByb3BlcnRpZXM6IEZ1bmN0aW9uKSB7XG5cdFx0bWVzc2FnZUhhbmRsZXIucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0Y29uc3Qgb0ZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGNvbnN0IG9GaWVsZFByb21pc2UgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicHJvbWlzZVwiKTtcblx0XHRpZiAob0ZpZWxkUHJvbWlzZSkge1xuXHRcdFx0cmV0dXJuIG9GaWVsZFByb21pc2Vcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHZhbHVlOiBhbnkpIHtcblx0XHRcdFx0XHQvLyBTZXR0aW5nIHZhbHVlIG9mIGZpZWxkIGFzICcnIGluIGNhc2Ugb2YgdmFsdWUgaGVscCBhbmQgdmFsaWRhdGluZyBvdGhlciBmaWVsZHNcblx0XHRcdFx0XHRvRmllbGQuc2V0VmFsdWUodmFsdWUpO1xuXHRcdFx0XHRcdGZuVmFsaWRhdGVSZXF1aXJlZFByb3BlcnRpZXMoKTtcblxuXHRcdFx0XHRcdHJldHVybiBvRmllbGQuZ2V0VmFsdWUoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICh2YWx1ZTogYW55KSB7XG5cdFx0XHRcdFx0aWYgKHZhbHVlICE9PSBcIlwiKSB7XG5cdFx0XHRcdFx0XHQvL2Rpc2FibGluZyB0aGUgY29udGludWUgYnV0dG9uIGluIGNhc2Ugb2YgaW52YWxpZCB2YWx1ZSBpbiBmaWVsZFxuXHRcdFx0XHRcdFx0b0NyZWF0ZUJ1dHRvbi5zZXRFbmFibGVkKGZhbHNlKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gdmFsaWRhdGluZyBhbGwgdGhlIGZpZWxkcyBpbiBjYXNlIG9mIGVtcHR5IHZhbHVlIGluIGZpZWxkXG5cdFx0XHRcdFx0XHRvRmllbGQuc2V0VmFsdWUodmFsdWUpO1xuXHRcdFx0XHRcdFx0Zm5WYWxpZGF0ZVJlcXVpcmVkUHJvcGVydGllcygpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cdF9nZXROb25EZWxldGFibGVUZXh0KG1QYXJhbWV0ZXJzOiBhbnksIHZDb250ZXh0czogYW55LCBvUmVzb3VyY2VCdW5kbGU6IGFueSkge1xuXHRcdGNvbnN0IGFOb25EZWxldGFibGVDb250ZXh0cyA9IG1QYXJhbWV0ZXJzLm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyAtIHZDb250ZXh0cy5jb25jYXQobVBhcmFtZXRlcnMudW5TYXZlZENvbnRleHRzKS5sZW5ndGg7XG5cdFx0cmV0dXJuIGFOb25EZWxldGFibGVDb250ZXh0cyA9PT0gMVxuXHRcdFx0PyBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcdFx0XHRcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0NPTkZJUk1fREVMRVRFX1dJVEhfT0JKRUNUSU5GT19BTkRfT05FX09CSkVDVF9OT05fREVMRVRBQkxFXCIsXG5cdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFttUGFyYW1ldGVycy5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHNdXG5cdFx0XHQgIClcblx0XHRcdDogQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFx0XCJDX1RSQU5TQUNUSU9OX0hFTFBFUl9DT05GSVJNX0RFTEVURV9XSVRIX09CSkVDVElORk9fQU5EX0ZFV19PQkpFQ1RTX05PTl9ERUxFVEFCTEVcIixcblx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMubnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzIC0gdkNvbnRleHRzLmNvbmNhdChtUGFyYW1ldGVycy51blNhdmVkQ29udGV4dHMpLmxlbmd0aCxcblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c1xuXHRcdFx0XHRcdF1cblx0XHRcdCAgKTtcblx0fVxuXG5cdF9sYXVuY2hEaWFsb2dXaXRoS2V5RmllbGRzKFxuXHRcdG9MaXN0QmluZGluZzogT0RhdGFMaXN0QmluZGluZyxcblx0XHRtRmllbGRzOiBhbnksXG5cdFx0b01vZGVsOiBPRGF0YU1vZGVsLFxuXHRcdG1QYXJhbWV0ZXJzOiBhbnksXG5cdFx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyXG5cdCkge1xuXHRcdGxldCBvRGlhbG9nOiBEaWFsb2c7XG5cdFx0Y29uc3Qgb1BhcmVudENvbnRyb2wgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sO1xuXG5cdFx0Ly8gQ3JhdGUgYSBmYWtlICh0cmFuc2llbnQpIGxpc3RCaW5kaW5nIGFuZCBjb250ZXh0LCBqdXN0IGZvciB0aGUgYmluZGluZyBjb250ZXh0IG9mIHRoZSBkaWFsb2dcblx0XHRjb25zdCBvVHJhbnNpZW50TGlzdEJpbmRpbmcgPSBvTW9kZWwuYmluZExpc3Qob0xpc3RCaW5kaW5nLmdldFBhdGgoKSwgb0xpc3RCaW5kaW5nLmdldENvbnRleHQoKSwgW10sIFtdLCB7XG5cdFx0XHQkJHVwZGF0ZUdyb3VwSWQ6IFwic3VibWl0TGF0ZXJcIlxuXHRcdH0pIGFzIE9EYXRhTGlzdEJpbmRpbmc7XG5cdFx0b1RyYW5zaWVudExpc3RCaW5kaW5nLnJlZnJlc2hJbnRlcm5hbCA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdC8qICovXG5cdFx0fTtcblx0XHRjb25zdCBvVHJhbnNpZW50Q29udGV4dCA9IG9UcmFuc2llbnRMaXN0QmluZGluZy5jcmVhdGUobVBhcmFtZXRlcnMuZGF0YSwgdHJ1ZSk7XG5cblx0XHRyZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXHRcdFx0Y29uc3Qgc0ZyYWdtZW50TmFtZSA9IFwic2FwL2ZlL2NvcmUvY29udHJvbHMvTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGRzRGlhbG9nXCI7XG5cdFx0XHRjb25zdCBvRnJhZ21lbnQgPSBYTUxUZW1wbGF0ZVByb2Nlc3Nvci5sb2FkVGVtcGxhdGUoc0ZyYWdtZW50TmFtZSwgXCJmcmFnbWVudFwiKSxcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlID0gb1BhcmVudENvbnRyb2wuZ2V0Q29udHJvbGxlcigpLm9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdFx0YUltbXV0YWJsZUZpZWxkczogYW55W10gPSBbXSxcblx0XHRcdFx0b0FwcENvbXBvbmVudCA9IHRoaXMuX2dldEFwcENvbXBvbmVudCgpLFxuXHRcdFx0XHRzUGF0aCA9IChvTGlzdEJpbmRpbmcuaXNSZWxhdGl2ZSgpID8gb0xpc3RCaW5kaW5nLmdldFJlc29sdmVkUGF0aCgpIDogb0xpc3RCaW5kaW5nLmdldFBhdGgoKSkgYXMgc3RyaW5nLFxuXHRcdFx0XHRvRW50aXR5U2V0Q29udGV4dCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc1BhdGgpIGFzIENvbnRleHQsXG5cdFx0XHRcdHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc1BhdGgpO1xuXHRcdFx0Zm9yIChjb25zdCBpIGluIG1GaWVsZHMpIHtcblx0XHRcdFx0YUltbXV0YWJsZUZpZWxkcy5wdXNoKG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYCR7c01ldGFQYXRofS8ke21GaWVsZHNbaV19YCkpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3Qgb0ltbXV0YWJsZUN0eE1vZGVsID0gbmV3IEpTT05Nb2RlbChhSW1tdXRhYmxlRmllbGRzKTtcblx0XHRcdGNvbnN0IG9JbW11dGFibGVDdHggPSBvSW1tdXRhYmxlQ3R4TW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpIGFzIENvbnRleHQ7XG5cdFx0XHRjb25zdCBhUmVxdWlyZWRQcm9wZXJ0aWVzID0gQ29tbW9uVXRpbHMuZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyhzTWV0YVBhdGgsIG9NZXRhTW9kZWwpO1xuXHRcdFx0Y29uc3Qgb1JlcXVpcmVkUHJvcGVydHlQYXRoc0N0eE1vZGVsID0gbmV3IEpTT05Nb2RlbChhUmVxdWlyZWRQcm9wZXJ0aWVzKTtcblx0XHRcdGNvbnN0IG9SZXF1aXJlZFByb3BlcnR5UGF0aHNDdHggPSBvUmVxdWlyZWRQcm9wZXJ0eVBhdGhzQ3R4TW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpIGFzIENvbnRleHQ7XG5cdFx0XHRjb25zdCBvTmV3RnJhZ21lbnQgPSBhd2FpdCBYTUxQcmVwcm9jZXNzb3IucHJvY2Vzcyhcblx0XHRcdFx0b0ZyYWdtZW50LFxuXHRcdFx0XHR7IG5hbWU6IHNGcmFnbWVudE5hbWUgfSxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBvRW50aXR5U2V0Q29udGV4dCxcblx0XHRcdFx0XHRcdGZpZWxkczogb0ltbXV0YWJsZUN0eCxcblx0XHRcdFx0XHRcdHJlcXVpcmVkUHJvcGVydGllczogb1JlcXVpcmVkUHJvcGVydHlQYXRoc0N0eFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHRlbnRpdHlTZXQ6IG9FbnRpdHlTZXRDb250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRmaWVsZHM6IG9JbW11dGFibGVDdHguZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdHJlcXVpcmVkUHJvcGVydGllczogb1JlcXVpcmVkUHJvcGVydHlQYXRoc0N0eE1vZGVsXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXG5cdFx0XHRsZXQgYUZvcm1FbGVtZW50czogYW55W10gPSBbXTtcblx0XHRcdGNvbnN0IG1GaWVsZFZhbHVlTWFwOiBhbnkgPSB7fTtcblx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBwcmVmZXItY29uc3Rcblx0XHRcdGxldCBvQ3JlYXRlQnV0dG9uOiBCdXR0b247XG5cblx0XHRcdGNvbnN0IHZhbGlkYXRlUmVxdWlyZWRQcm9wZXJ0aWVzID0gYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRsZXQgYkVuYWJsZWQgPSBmYWxzZTtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCBhUmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKFxuXHRcdFx0XHRcdFx0YUZvcm1FbGVtZW50c1xuXHRcdFx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uIChvRm9ybUVsZW1lbnQ6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvRm9ybUVsZW1lbnQuZ2V0RmllbGRzKClbMF07XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9GaWVsZDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gVGhlIGNvbnRpbnVlIGJ1dHRvbiBzaG91bGQgcmVtYWluIGRpc2FibGVkIGluIGNhc2Ugb2YgZW1wdHkgcmVxdWlyZWQgZmllbGRzLlxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvRmllbGQuZ2V0UmVxdWlyZWQoKSB8fCBvRmllbGQuZ2V0VmFsdWVTdGF0ZSgpID09PSBWYWx1ZVN0YXRlLkVycm9yO1xuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQubWFwKGFzeW5jIGZ1bmN0aW9uIChvRmllbGQ6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNGaWVsZElkID0gb0ZpZWxkLmdldElkKCk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHNGaWVsZElkIGluIG1GaWVsZFZhbHVlTWFwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCB2VmFsdWUgPSBhd2FpdCBtRmllbGRWYWx1ZU1hcFtzRmllbGRJZF07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvRmllbGQuZ2V0VmFsdWUoKSA9PT0gXCJcIiA/IHVuZGVmaW5lZCA6IHZWYWx1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb0ZpZWxkLmdldFZhbHVlKCkgPT09IFwiXCIgPyB1bmRlZmluZWQgOiBvRmllbGQuZ2V0VmFsdWUoKTtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGJFbmFibGVkID0gYVJlc3VsdHMuZXZlcnkoZnVuY3Rpb24gKHZWYWx1ZTogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheSh2VmFsdWUpKSB7XG5cdFx0XHRcdFx0XHRcdHZWYWx1ZSA9IHZWYWx1ZVswXTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiB2VmFsdWUgIT09IHVuZGVmaW5lZCAmJiB2VmFsdWUgIT09IG51bGwgJiYgdlZhbHVlICE9PSBcIlwiO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRiRW5hYmxlZCA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9DcmVhdGVCdXR0b24uc2V0RW5hYmxlZChiRW5hYmxlZCk7XG5cdFx0XHR9O1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSB7XG5cdFx0XHRcdC8qXG5cdFx0XHRcdFx0XHRcdFx0XHRmaXJlZCBvbiBmb2N1cyBvdXQgZnJvbSBmaWVsZCBvciBvbiBzZWxlY3RpbmcgYSB2YWx1ZSBmcm9tIHRoZSB2YWx1ZWhlbHAuXG5cdFx0XHRcdFx0XHRcdFx0XHR0aGUgY3JlYXRlIGJ1dHRvbiBpcyBlbmFibGVkIHdoZW4gYSB2YWx1ZSBpcyBhZGRlZC5cblx0XHRcdFx0XHRcdFx0XHRcdGxpdmVDaGFuZ2UgaXMgbm90IGZpcmVkIHdoZW4gdmFsdWUgaXMgYWRkZWQgZnJvbSB2YWx1ZWhlbHAuXG5cdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZSB2YWxpZGF0aW9uIGlzIG5vdCBkb25lIGZvciBjcmVhdGUgYnV0dG9uIGVuYWJsZW1lbnQuXG5cdFx0XHRcdFx0XHRcdFx0Ki9cblx0XHRcdFx0aGFuZGxlQ2hhbmdlOiAob0V2ZW50OiBhbnkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBzRmllbGRJZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJpZFwiKTtcblx0XHRcdFx0XHRtRmllbGRWYWx1ZU1hcFtzRmllbGRJZF0gPSB0aGlzLl9vbkZpZWxkQ2hhbmdlKG9FdmVudCwgb0NyZWF0ZUJ1dHRvbiwgbWVzc2FnZUhhbmRsZXIsIHZhbGlkYXRlUmVxdWlyZWRQcm9wZXJ0aWVzKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0Lypcblx0XHRcdFx0XHRcdFx0XHRcdGZpcmVkIG9uIGtleSBwcmVzcy4gdGhlIGNyZWF0ZSBidXR0b24gaXMgZW5hYmxlZCB3aGVuIGEgdmFsdWUgaXMgYWRkZWQuXG5cdFx0XHRcdFx0XHRcdFx0XHRsaXZlQ2hhbmdlIGlzIG5vdCBmaXJlZCB3aGVuIHZhbHVlIGlzIGFkZGVkIGZyb20gdmFsdWVoZWxwLlxuXHRcdFx0XHRcdFx0XHRcdFx0dmFsdWUgdmFsaWRhdGlvbiBpcyBub3QgZG9uZSBmb3IgY3JlYXRlIGJ1dHRvbiBlbmFibGVtZW50LlxuXHRcdFx0XHRcdFx0XHRcdCovXG5cdFx0XHRcdGhhbmRsZUxpdmVDaGFuZ2U6IChvRXZlbnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHNGaWVsZElkID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImlkXCIpO1xuXHRcdFx0XHRcdGNvbnN0IHZWYWx1ZSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2YWx1ZVwiKTtcblx0XHRcdFx0XHRtRmllbGRWYWx1ZU1hcFtzRmllbGRJZF0gPSB2VmFsdWU7XG5cdFx0XHRcdFx0dmFsaWRhdGVSZXF1aXJlZFByb3BlcnRpZXMoKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0Y29uc3Qgb0RpYWxvZ0NvbnRlbnQ6IGFueSA9IGF3YWl0IEZyYWdtZW50LmxvYWQoe1xuXHRcdFx0XHRkZWZpbml0aW9uOiBvTmV3RnJhZ21lbnQsXG5cdFx0XHRcdGNvbnRyb2xsZXI6IG9Db250cm9sbGVyXG5cdFx0XHR9KTtcblx0XHRcdGxldCBvUmVzdWx0OiBhbnk7XG5cblx0XHRcdG9EaWFsb2cgPSBuZXcgRGlhbG9nKHtcblx0XHRcdFx0dGl0bGU6IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfU0FQRkVfQUNUSU9OX0NSRUFURVwiLCBvUmVzb3VyY2VCdW5kbGUpLFxuXHRcdFx0XHRjb250ZW50OiBbb0RpYWxvZ0NvbnRlbnRdLFxuXHRcdFx0XHRiZWdpbkJ1dHRvbjoge1xuXHRcdFx0XHRcdHRleHQ6IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19UUkFOU0FDVElPTl9IRUxQRVJfU0FQRkVfQUNUSU9OX0NSRUFURV9CVVRUT05cIiwgb1Jlc291cmNlQnVuZGxlKSxcblx0XHRcdFx0XHR0eXBlOiBcIkVtcGhhc2l6ZWRcIixcblx0XHRcdFx0XHRwcmVzczogYXN5bmMgKG9FdmVudDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRjb25zdCBjcmVhdGVCdXR0b24gPSBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0XHRcdFx0XHRjcmVhdGVCdXR0b24uc2V0RW5hYmxlZChmYWxzZSk7XG5cdFx0XHRcdFx0XHRCdXN5TG9ja2VyLmxvY2sob0RpYWxvZyk7XG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5iSXNDcmVhdGVEaWFsb2cgPSB0cnVlO1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgYVZhbHVlcyA9IGF3YWl0IFByb21pc2UuYWxsKFxuXHRcdFx0XHRcdFx0XHRcdE9iamVjdC5rZXlzKG1GaWVsZFZhbHVlTWFwKS5tYXAoYXN5bmMgZnVuY3Rpb24gKHNLZXk6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1ZhbHVlID0gYXdhaXQgbUZpZWxkVmFsdWVNYXBbc0tleV07XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBvRGlhbG9nVmFsdWU6IGFueSA9IHt9O1xuXHRcdFx0XHRcdFx0XHRcdFx0b0RpYWxvZ1ZhbHVlW3NLZXldID0gb1ZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9EaWFsb2dWYWx1ZTtcblx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRpZiAobVBhcmFtZXRlcnMuYmVmb3JlQ3JlYXRlQ2FsbEJhY2spIHtcblx0XHRcdFx0XHRcdFx0XHRhd2FpdCB0b0VTNlByb21pc2UoXG5cdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5iZWZvcmVDcmVhdGVDYWxsQmFjayh7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHRQYXRoOiBvTGlzdEJpbmRpbmcgJiYgb0xpc3RCaW5kaW5nLmdldFBhdGgoKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y3JlYXRlUGFyYW1ldGVyczogYVZhbHVlc1xuXHRcdFx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHRyYW5zaWVudERhdGEgPSBvVHJhbnNpZW50Q29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgY3JlYXRlRGF0YTogYW55ID0ge307XG5cdFx0XHRcdFx0XHRcdE9iamVjdC5rZXlzKHRyYW5zaWVudERhdGEpLmZvckVhY2goZnVuY3Rpb24gKHNQcm9wZXJ0eVBhdGg6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9Qcm9wZXJ0eSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vJHtzUHJvcGVydHlQYXRofWApO1xuXHRcdFx0XHRcdFx0XHRcdC8vIGVuc3VyZSBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgYXJlIG5vdCBwYXJ0IG9mIHRoZSBwYXlsb2FkLCBkZWVwIGNyZWF0ZSBub3Qgc3VwcG9ydGVkXG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9Qcm9wZXJ0eSAmJiBvUHJvcGVydHkuJGtpbmQgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0Y3JlYXRlRGF0YVtzUHJvcGVydHlQYXRoXSA9IHRyYW5zaWVudERhdGFbc1Byb3BlcnR5UGF0aF07XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvTmV3RG9jdW1lbnRDb250ZXh0ID0gb0xpc3RCaW5kaW5nLmNyZWF0ZShcblx0XHRcdFx0XHRcdFx0XHRjcmVhdGVEYXRhLFxuXHRcdFx0XHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuY3JlYXRlQXRFbmQsXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuaW5hY3RpdmVcblx0XHRcdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdFx0XHRjb25zdCBvUHJvbWlzZSA9IHRoaXMub25BZnRlckNyZWF0ZUNvbXBsZXRpb24ob0xpc3RCaW5kaW5nLCBvTmV3RG9jdW1lbnRDb250ZXh0LCBtUGFyYW1ldGVycyk7XG5cdFx0XHRcdFx0XHRcdGxldCBvUmVzcG9uc2U6IGFueSA9IGF3YWl0IG9Qcm9taXNlO1xuXHRcdFx0XHRcdFx0XHRpZiAoIW9SZXNwb25zZSB8fCAob1Jlc3BvbnNlICYmIG9SZXNwb25zZS5iS2VlcERpYWxvZ09wZW4gIT09IHRydWUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0b1Jlc3BvbnNlID0gb1Jlc3BvbnNlID8/IHt9O1xuXHRcdFx0XHRcdFx0XHRcdG9EaWFsb2cuc2V0QmluZGluZ0NvbnRleHQobnVsbCBhcyBhbnkpO1xuXHRcdFx0XHRcdFx0XHRcdG9SZXNwb25zZS5uZXdDb250ZXh0ID0gb05ld0RvY3VtZW50Q29udGV4dDtcblx0XHRcdFx0XHRcdFx0XHRvUmVzdWx0ID0geyByZXNwb25zZTogb1Jlc3BvbnNlIH07XG5cdFx0XHRcdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHQvLyBpbiBjYXNlIG9mIGNyZWF0aW9uIGZhaWxlZCwgZGlhbG9nIHNob3VsZCBzdGF5IG9wZW4gLSB0byBhY2hpZXZlIHRoZSBzYW1lLCBub3RoaW5nIGhhcyB0byBiZSBkb25lIChsaWtlIGluIGNhc2Ugb2Ygc3VjY2VzcyB3aXRoIGJLZWVwRGlhbG9nT3Blbilcblx0XHRcdFx0XHRcdFx0aWYgKG9FcnJvciAhPT0gRkVMaWJyYXJ5LkNvbnN0YW50cy5DcmVhdGlvbkZhaWxlZCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIG90aGVyIGVycm9ycyBhcmUgbm90IGV4cGVjdGVkXG5cdFx0XHRcdFx0XHRcdFx0b1Jlc3VsdCA9IHsgZXJyb3I6IG9FcnJvciB9O1xuXHRcdFx0XHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob0RpYWxvZyk7XG5cdFx0XHRcdFx0XHRcdGNyZWF0ZUJ1dHRvbi5zZXRFbmFibGVkKHRydWUpO1xuXHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdGVuZEJ1dHRvbjoge1xuXHRcdFx0XHRcdHRleHQ6IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19DT01NT05fQUNUSU9OX1BBUkFNRVRFUl9ESUFMT0dfQ0FOQ0VMXCIsIG9SZXNvdXJjZUJ1bmRsZSksXG5cdFx0XHRcdFx0cHJlc3M6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG9SZXN1bHQgPSB7IGVycm9yOiBGRUxpYnJhcnkuQ29uc3RhbnRzLkNhbmNlbEFjdGlvbkRpYWxvZyB9O1xuXHRcdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0YWZ0ZXJDbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdC8vIHNob3cgZm9vdGVyIGFzIHBlciBVWCBndWlkZWxpbmVzIHdoZW4gZGlhbG9nIGlzIG5vdCBvcGVuXG5cdFx0XHRcdFx0KG9EaWFsb2cuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCk/LnNldFByb3BlcnR5KFwiaXNDcmVhdGVEaWFsb2dPcGVuXCIsIGZhbHNlKTtcblx0XHRcdFx0XHRvRGlhbG9nLmRlc3Ryb3koKTtcblx0XHRcdFx0XHRvVHJhbnNpZW50TGlzdEJpbmRpbmcuZGVzdHJveSgpO1xuXHRcdFx0XHRcdGlmIChvUmVzdWx0LmVycm9yKSB7XG5cdFx0XHRcdFx0XHRyZWplY3Qob1Jlc3VsdC5lcnJvcik7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJlc29sdmUob1Jlc3VsdC5yZXNwb25zZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9IGFzIGFueSk7XG5cdFx0XHRhRm9ybUVsZW1lbnRzID0gb0RpYWxvZ0NvbnRlbnQ/LmdldEFnZ3JlZ2F0aW9uKFwiZm9ybVwiKS5nZXRBZ2dyZWdhdGlvbihcImZvcm1Db250YWluZXJzXCIpWzBdLmdldEFnZ3JlZ2F0aW9uKFwiZm9ybUVsZW1lbnRzXCIpO1xuXHRcdFx0aWYgKG9QYXJlbnRDb250cm9sICYmIG9QYXJlbnRDb250cm9sLmFkZERlcGVuZGVudCkge1xuXHRcdFx0XHQvLyBpZiB0aGVyZSBpcyBhIHBhcmVudCBjb250cm9sIHNwZWNpZmllZCBhZGQgdGhlIGRpYWxvZyBhcyBkZXBlbmRlbnRcblx0XHRcdFx0b1BhcmVudENvbnRyb2wuYWRkRGVwZW5kZW50KG9EaWFsb2cpO1xuXHRcdFx0fVxuXHRcdFx0b0NyZWF0ZUJ1dHRvbiA9IG9EaWFsb2cuZ2V0QmVnaW5CdXR0b24oKTtcblx0XHRcdG9EaWFsb2cuc2V0QmluZGluZ0NvbnRleHQob1RyYW5zaWVudENvbnRleHQpO1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0YXdhaXQgQ29tbW9uVXRpbHMuc2V0VXNlckRlZmF1bHRzKFxuXHRcdFx0XHRcdG9BcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0YUltbXV0YWJsZUZpZWxkcyxcblx0XHRcdFx0XHRvVHJhbnNpZW50Q29udGV4dCxcblx0XHRcdFx0XHRmYWxzZSxcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5jcmVhdGVBY3Rpb24sXG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMuZGF0YVxuXHRcdFx0XHQpO1xuXHRcdFx0XHR2YWxpZGF0ZVJlcXVpcmVkUHJvcGVydGllcygpO1xuXHRcdFx0XHQvLyBmb290ZXIgbXVzdCBub3QgYmUgdmlzaWJsZSB3aGVuIHRoZSBkaWFsb2cgaXMgb3BlbiBhcyBwZXIgVVggZ3VpZGVsaW5lc1xuXHRcdFx0XHQob0RpYWxvZy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0KS5zZXRQcm9wZXJ0eShcImlzQ3JlYXRlRGlhbG9nT3BlblwiLCB0cnVlKTtcblx0XHRcdFx0b0RpYWxvZy5vcGVuKCk7XG5cdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoKTtcblx0XHRcdFx0dGhyb3cgb0Vycm9yO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdG9uQWZ0ZXJDcmVhdGVDb21wbGV0aW9uKG9MaXN0QmluZGluZzogYW55LCBvTmV3RG9jdW1lbnRDb250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRsZXQgZm5SZXNvbHZlOiBGdW5jdGlvbjtcblx0XHRjb25zdCBvUHJvbWlzZSA9IG5ldyBQcm9taXNlPGJvb2xlYW4+KChyZXNvbHZlKSA9PiB7XG5cdFx0XHRmblJlc29sdmUgPSByZXNvbHZlO1xuXHRcdH0pO1xuXG5cdFx0Y29uc3QgZm5DcmVhdGVDb21wbGV0ZWQgPSAob0V2ZW50OiBhbnkpID0+IHtcblx0XHRcdGNvbnN0IG9Db250ZXh0ID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImNvbnRleHRcIiksXG5cdFx0XHRcdGJTdWNjZXNzID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInN1Y2Nlc3NcIik7XG5cdFx0XHRpZiAob0NvbnRleHQgPT09IG9OZXdEb2N1bWVudENvbnRleHQpIHtcblx0XHRcdFx0b0xpc3RCaW5kaW5nLmRldGFjaENyZWF0ZUNvbXBsZXRlZChmbkNyZWF0ZUNvbXBsZXRlZCwgdGhpcyk7XG5cdFx0XHRcdGZuUmVzb2x2ZShiU3VjY2Vzcyk7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjb25zdCBmblNhZmVDb250ZXh0Q3JlYXRlZCA9ICgpID0+IHtcblx0XHRcdG9OZXdEb2N1bWVudENvbnRleHRcblx0XHRcdFx0LmNyZWF0ZWQoKVxuXHRcdFx0XHQudGhlbih1bmRlZmluZWQsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRMb2cudHJhY2UoXCJ0cmFuc2llbnQgY3JlYXRpb24gY29udGV4dCBkZWxldGVkXCIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGNvbnRleHRFcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLnRyYWNlKFwidHJhbnNpZW50IGNyZWF0aW9uIGNvbnRleHQgZGVsZXRpb24gZXJyb3JcIiwgY29udGV4dEVycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fTtcblxuXHRcdG9MaXN0QmluZGluZy5hdHRhY2hDcmVhdGVDb21wbGV0ZWQoZm5DcmVhdGVDb21wbGV0ZWQsIHRoaXMpO1xuXG5cdFx0cmV0dXJuIG9Qcm9taXNlLnRoZW4oKGJTdWNjZXNzOiBib29sZWFuKSA9PiB7XG5cdFx0XHRpZiAoIWJTdWNjZXNzKSB7XG5cdFx0XHRcdGlmICghbVBhcmFtZXRlcnMua2VlcFRyYW5zaWVudENvbnRleHRPbkZhaWxlZCkge1xuXHRcdFx0XHRcdC8vIENhbmNlbCB0aGUgcGVuZGluZyBQT1NUIGFuZCBkZWxldGUgdGhlIGNvbnRleHQgaW4gdGhlIGxpc3RCaW5kaW5nXG5cdFx0XHRcdFx0Zm5TYWZlQ29udGV4dENyZWF0ZWQoKTsgLy8gVG8gYXZvaWQgYSAncmVxdWVzdCBjYW5jZWxsZWQnIGVycm9yIGluIHRoZSBjb25zb2xlXG5cdFx0XHRcdFx0b0xpc3RCaW5kaW5nLnJlc2V0Q2hhbmdlcygpO1xuXHRcdFx0XHRcdG9MaXN0QmluZGluZy5nZXRNb2RlbCgpLnJlc2V0Q2hhbmdlcyhvTGlzdEJpbmRpbmcuZ2V0VXBkYXRlR3JvdXBJZCgpKTtcblxuXHRcdFx0XHRcdHRocm93IEZFTGlicmFyeS5Db25zdGFudHMuQ3JlYXRpb25GYWlsZWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHsgYktlZXBEaWFsb2dPcGVuOiB0cnVlIH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gb05ld0RvY3VtZW50Q29udGV4dC5jcmVhdGVkKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgbmFtZSBvZiB0aGUgTmV3QWN0aW9uIHRvIGJlIGV4ZWN1dGVkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHN0YXRpY1xuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlci5fZ2V0TmV3QWN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAcGFyYW0gb1N0YXJ0dXBQYXJhbWV0ZXJzIFN0YXJ0dXAgcGFyYW1ldGVycyBvZiB0aGUgYXBwbGljYXRpb25cblx0ICogQHBhcmFtIHNDcmVhdGVIYXNoIEhhc2ggdG8gYmUgY2hlY2tlZCBmb3IgYWN0aW9uIHR5cGVcblx0ICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIE1ldGFNb2RlbCB1c2VkIHRvIGNoZWNrIGZvciBOZXdBY3Rpb24gcGFyYW1ldGVyXG5cdCAqIEBwYXJhbSBzTWV0YVBhdGggVGhlIE1ldGFQYXRoXG5cdCAqIEByZXR1cm5zIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb25cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0X2dldE5ld0FjdGlvbihvU3RhcnR1cFBhcmFtZXRlcnM6IGFueSwgc0NyZWF0ZUhhc2g6IHN0cmluZywgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIHNNZXRhUGF0aDogc3RyaW5nKSB7XG5cdFx0bGV0IHNOZXdBY3Rpb247XG5cblx0XHRpZiAob1N0YXJ0dXBQYXJhbWV0ZXJzICYmIG9TdGFydHVwUGFyYW1ldGVycy5wcmVmZXJyZWRNb2RlICYmIHNDcmVhdGVIYXNoLnRvVXBwZXJDYXNlKCkuaW5kZXhPZihcIkktQUNUSU9OPUNSRUFURVdJVEhcIikgPiAtMSkge1xuXHRcdFx0Y29uc3Qgc1ByZWZlcnJlZE1vZGUgPSBvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZVswXTtcblx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRzUHJlZmVycmVkTW9kZS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoXCJDUkVBVEVXSVRIOlwiKSA+IC0xXG5cdFx0XHRcdFx0PyBzUHJlZmVycmVkTW9kZS5zdWJzdHIoc1ByZWZlcnJlZE1vZGUubGFzdEluZGV4T2YoXCI6XCIpICsgMSlcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzICYmXG5cdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZSAmJlxuXHRcdFx0c0NyZWF0ZUhhc2gudG9VcHBlckNhc2UoKS5pbmRleE9mKFwiSS1BQ1RJT049QVVUT0NSRUFURVdJVEhcIikgPiAtMVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgc1ByZWZlcnJlZE1vZGUgPSBvU3RhcnR1cFBhcmFtZXRlcnMucHJlZmVycmVkTW9kZVswXTtcblx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRzUHJlZmVycmVkTW9kZS50b1VwcGVyQ2FzZSgpLmluZGV4T2YoXCJBVVRPQ1JFQVRFV0lUSDpcIikgPiAtMVxuXHRcdFx0XHRcdD8gc1ByZWZlcnJlZE1vZGUuc3Vic3RyKHNQcmVmZXJyZWRNb2RlLmxhc3RJbmRleE9mKFwiOlwiKSArIDEpXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNOZXdBY3Rpb24gPVxuXHRcdFx0XHRvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0T2JqZWN0ICE9PSB1bmRlZmluZWRcblx0XHRcdFx0XHQ/IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkL05ld0FjdGlvbmApIHx8XG5cdFx0XHRcdFx0ICBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3QvTmV3QWN0aW9uYClcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cmV0dXJuIHNOZXdBY3Rpb247XG5cdH1cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgbGFiZWwgZm9yIHRoZSB0aXRsZSBvZiBhIHNwZWNpZmljIGNyZWF0ZSBhY3Rpb24gZGlhbG9nLCBlLmcuIENyZWF0ZSBTYWxlcyBPcmRlciBmcm9tIFF1b3RhdGlvbi5cblx0ICpcblx0ICogVGhlIGZvbGxvd2luZyBwcmlvcml0eSBpcyBhcHBsaWVkOlxuXHQgKiAxLiBsYWJlbCBvZiBsaW5lLWl0ZW0gYW5ub3RhdGlvbi5cblx0ICogMi4gbGFiZWwgYW5ub3RhdGVkIGluIHRoZSBhY3Rpb24uXG5cdCAqIDMuIFwiQ3JlYXRlXCIgYXMgYSBjb25zdGFudCBmcm9tIGkxOG4uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAc3RhdGljXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLlRyYW5zYWN0aW9uSGVscGVyLl9nZXRTcGVjaWZpY0NyZWF0ZUFjdGlvbkRpYWxvZ0xhYmVsXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5UcmFuc2FjdGlvbkhlbHBlclxuXHQgKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgTWV0YU1vZGVsIHVzZWQgdG8gY2hlY2sgZm9yIHRoZSBOZXdBY3Rpb24gcGFyYW1ldGVyXG5cdCAqIEBwYXJhbSBzTWV0YVBhdGggVGhlIE1ldGFQYXRoXG5cdCAqIEBwYXJhbSBzTmV3QWN0aW9uIENvbnRhaW5zIHRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gdG8gYmUgZXhlY3V0ZWRcblx0ICogQHBhcmFtIG9SZXNvdXJjZUJ1bmRsZUNvcmUgUmVzb3VyY2VCdW5kbGUgdG8gYWNjZXNzIHRoZSBkZWZhdWx0IENyZWF0ZSBsYWJlbFxuXHQgKiBAcmV0dXJucyBUaGUgbGFiZWwgZm9yIHRoZSBDcmVhdGUgQWN0aW9uIERpYWxvZ1xuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRfZ2V0U3BlY2lmaWNDcmVhdGVBY3Rpb25EaWFsb2dMYWJlbChcblx0XHRvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCxcblx0XHRzTWV0YVBhdGg6IHN0cmluZyxcblx0XHRzTmV3QWN0aW9uOiBzdHJpbmcsXG5cdFx0b1Jlc291cmNlQnVuZGxlQ29yZTogUmVzb3VyY2VCdW5kbGVcblx0KSB7XG5cdFx0Y29uc3QgZm5HZXRMYWJlbEZyb21MaW5lSXRlbUFubm90YXRpb24gPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRpZiAob01ldGFNb2RlbCAmJiBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5MaW5lSXRlbWApKSB7XG5cdFx0XHRcdGNvbnN0IGlMaW5lSXRlbUluZGV4ID0gb01ldGFNb2RlbFxuXHRcdFx0XHRcdC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTGluZUl0ZW1gKVxuXHRcdFx0XHRcdC5maW5kSW5kZXgoZnVuY3Rpb24gKG9MaW5lSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhTGluZUl0ZW1BY3Rpb24gPSBvTGluZUl0ZW0uQWN0aW9uID8gb0xpbmVJdGVtLkFjdGlvbi5zcGxpdChcIihcIikgOiB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYUxpbmVJdGVtQWN0aW9uID8gYUxpbmVJdGVtQWN0aW9uWzBdID09PSBzTmV3QWN0aW9uIDogZmFsc2U7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBpTGluZUl0ZW1JbmRleCA+IC0xXG5cdFx0XHRcdFx0PyBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YVBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5MaW5lSXRlbWApW2lMaW5lSXRlbUluZGV4XS5MYWJlbFxuXHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0cmV0dXJuIChcblx0XHRcdGZuR2V0TGFiZWxGcm9tTGluZUl0ZW1Bbm5vdGF0aW9uKCkgfHxcblx0XHRcdChvTWV0YU1vZGVsICYmIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vJHtzTmV3QWN0aW9ufUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxgKSkgfHxcblx0XHRcdChvUmVzb3VyY2VCdW5kbGVDb3JlICYmIG9SZXNvdXJjZUJ1bmRsZUNvcmUuZ2V0VGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX1NBUEZFX0FDVElPTl9DUkVBVEVcIikpXG5cdFx0KTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBUcmFuc2FjdGlvbkhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQWtqQk8sZ0JBQWdCQSxJQUFJLEVBQUVDLE9BQU8sRUFBRTtJQUNyQyxJQUFJO01BQ0gsSUFBSUMsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU1HLENBQUMsRUFBRTtNQUNWLE9BQU9GLE9BQU8sQ0FBQ0UsQ0FBQyxDQUFDO0lBQ2xCO0lBQ0EsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLElBQUksRUFBRTtNQUMxQixPQUFPRixNQUFNLENBQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRUgsT0FBTyxDQUFDO0lBQ3BDO0lBQ0EsT0FBT0MsTUFBTTtFQUNkO0VBR08sMEJBQTBCRixJQUFJLEVBQUVLLFNBQVMsRUFBRTtJQUNqRCxJQUFJO01BQ0gsSUFBSUgsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU9HLENBQUMsRUFBRTtNQUNYLE9BQU9FLFNBQVMsQ0FBQyxJQUFJLEVBQUVGLENBQUMsQ0FBQztJQUMxQjtJQUNBLElBQUlELE1BQU0sSUFBSUEsTUFBTSxDQUFDRSxJQUFJLEVBQUU7TUFDMUIsT0FBT0YsTUFBTSxDQUFDRSxJQUFJLENBQUNDLFNBQVMsQ0FBQ0MsSUFBSSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsRUFBRUQsU0FBUyxDQUFDQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQzVFO0lBQ0EsT0FBT0QsU0FBUyxDQUFDLEtBQUssRUFBRUgsTUFBTSxDQUFDO0VBQ2hDO0VBbGlCTyxpQkFBaUJLLElBQUksRUFBRUMsS0FBSyxFQUFFQyxLQUFLLEVBQUU7SUFDM0MsSUFBSSxDQUFDRixJQUFJLENBQUNHLENBQUMsRUFBRTtNQUNaLElBQUlELEtBQUssaUJBQWlCLEVBQUU7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