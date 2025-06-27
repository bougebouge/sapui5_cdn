/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/FPMHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/library", "sap/ui/core/message/Message", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel", "../../operationsHelper"], function (Log, ActionRuntime, CommonUtils, BusyLocker, messageHandling, FPMHelper, StableIdHelper, FELibrary, Button, Dialog, MessageBox, Core, Fragment, library, Message, XMLPreprocessor, XMLTemplateProcessor, JSONModel, operationsHelper) {
  "use strict";

  var MessageType = library.MessageType;
  var generate = StableIdHelper.generate;
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
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
  var executeAPMAction = function (oAppComponent, mParameters, oParentControl, messageHandler, aContexts, oDialog, after412) {
    try {
      return Promise.resolve(_executeAction(oAppComponent, mParameters, oParentControl, messageHandler)).then(function (aResult) {
        var _mParameters$internal6;
        // If some entries were successful, and others have failed, the overall process is still successful. However, this was treated as rejection
        // before, and this currently is still kept, as long as dialog handling is mixed with backend process handling.
        // TODO: Refactor to only reject in case of overall process error.
        // For the time being: map to old logic to reject if at least one entry has failed
        if (aResult !== null && aResult !== void 0 && aResult.some(function (oSingleResult) {
          return oSingleResult.status === "rejected";
        })) {
          throw aResult;
        }
        var messages = Core.getMessageManager().getMessageModel().getData();
        if (mParameters.internalModelContext && mParameters.internalModelContext.getProperty("412Executed") && (_mParameters$internal6 = mParameters.internalModelContext.getProperty("strictHandlingFails")) !== null && _mParameters$internal6 !== void 0 && _mParameters$internal6.length) {
          if (!after412) {
            mParameters.internalModelContext.setProperty("DelayMessages", mParameters.internalModelContext.getProperty("DelayMessages").concat(messages));
          } else {
            Core.getMessageManager().addMessages(mParameters.internalModelContext.getProperty("DelayMessages"));
            if (messages.length) {
              // BOUND TRANSITION AS PART OF SAP_MESSAGE
              messageHandler.showMessageDialog({
                onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
                  return actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn);
                }
              });
            }
          }
        } else if (messages.length) {
          // BOUND TRANSITION AS PART OF SAP_MESSAGE
          messageHandler.showMessageDialog({
            isActionParameterDialogOpen: mParameters === null || mParameters === void 0 ? void 0 : mParameters.oDialog.isOpen(),
            onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
              return actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn);
            }
          });
        }
        return aResult;
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var Constants = FELibrary.Constants,
    InvocationGrouping = FELibrary.InvocationGrouping;
  var Action = MessageBox.Action;

  /**
   * Calls a bound action for one or multiple contexts.
   *
   * @function
   * @static
   * @name sap.fe.core.actions.operations.callBoundAction
   * @memberof sap.fe.core.actions.operations
   * @param sActionName The name of the action to be called
   * @param contexts Either one context or an array with contexts for which the action is to be be called
   * @param oModel OData Model
   * @param oAppComponent The AppComponent
   * @param [mParameters] Optional, can contain the following attributes:
   * @param [mParameters.parameterValues] A map of action parameter names and provided values
   * @param [mParameters.mBindingParameters] A map of binding parameters that would be part of $select and $expand coming from side effects for bound actions
   * @param [mParameters.additionalSideEffect] Array of property paths to be requested in addition to actual target properties of the side effect
   * @param [mParameters.showActionParameterDialog] If set and if parameters exist the user retrieves a dialog to fill in parameters, if actionParameters are passed they are shown to the user
   * @param [mParameters.label] A human-readable label for the action
   * @param [mParameters.invocationGrouping] Mode how actions are to be called: Changeset to put all action calls into one changeset, Isolated to put them into separate changesets, defaults to Isolated
   * @param [mParameters.onSubmitted] Function which is called once the actions are submitted with an array of promises
   * @param [mParameters.defaultParameters] Can contain default parameters from FLP user defaults
   * @param [mParameters.parentControl] If specified, the dialogs are added as dependent of the parent control
   * @param [mParameters.bGetBoundContext] If specified, the action promise returns the bound context
   * @returns Promise resolves with an array of response objects (TODO: to be changed)
   * @private
   * @ui5-restricted
   */
  function callBoundAction(sActionName, contexts, oModel, oAppComponent, mParameters) {
    if (!contexts || contexts.length === 0) {
      //In Freestyle apps bound actions can have no context
      return Promise.reject("Bound actions always requires at least one context");
    }
    // this method either accepts single context or an array of contexts
    // TODO: Refactor to an unambiguos API
    var isCalledWithArray = Array.isArray(contexts);

    // in case of single context wrap into an array for called methods (esp. callAction)
    mParameters.aContexts = isCalledWithArray ? contexts : [contexts];
    var oMetaModel = oModel.getMetaModel(),
      // Analyzing metaModelPath for action only from first context seems weird, but probably works in all existing szenarios - if several contexts are passed, they probably
      // belong to the same metamodelpath. TODO: Check, whether this can be improved / szenarios with different metaModelPaths might exist
      sActionPath = "".concat(oMetaModel.getMetaPath(mParameters.aContexts[0].getPath()), "/").concat(sActionName),
      oBoundAction = oMetaModel.createBindingContext("".concat(sActionPath, "/@$ui5.overload/0"));
    mParameters.isCriticalAction = getIsActionCritical(oMetaModel, sActionPath, mParameters.aContexts, oBoundAction);

    // Promise returned by callAction currently is rejected in case of execution for multiple contexts partly failing. This should be changed (some failing contexts do not mean
    // that function did not fulfill its task), but as this is a bigger refactoring, for the time being we need to deal with that at the calling place (i.e. here)
    // => provide the same handler (mapping back from array to single result/error if needed) for resolved/rejected case
    var extractSingleResult = function (result) {
      // single action could be resolved or rejected
      if (result[0].status === "fulfilled") {
        return result[0].value;
      } else {
        // In case of dialog cancellation, no array is returned => throw the result.
        // Ideally, differentiating should not be needed here => TODO: Find better solution when separating dialog handling (single object with single result) from backend
        // execution (potentially multiple objects)
        throw result[0].reason || result;
      }
    };
    return callAction(sActionName, oModel, oBoundAction, oAppComponent, mParameters).then(function (result) {
      if (isCalledWithArray) {
        return result;
      } else {
        return extractSingleResult(result);
      }
    }, function (result) {
      if (isCalledWithArray) {
        throw result;
      } else {
        return extractSingleResult(result);
      }
    });
  }
  /**
   * Calls an action import.
   *
   * @function
   * @static
   * @name sap.fe.core.actions.operations.callActionImport
   * @memberof sap.fe.core.actions.operations
   * @param sActionName The name of the action import to be called
   * @param oModel An instance of an OData V4 model
   * @param oAppComponent The AppComponent
   * @param [mParameters] Optional, can contain the following attributes:
   * @param [mParameters.parameterValues] A map of action parameter names and provided values
   * @param [mParameters.label] A human-readable label for the action
   * @param [mParameters.showActionParameterDialog] If set and if parameters exist the user retrieves a dialog to fill in parameters, if actionParameters are passed they are shown to the user
   * @param [mParameters.onSubmitted] Function which is called once the actions are submitted with an array of promises
   * @param [mParameters.defaultParameters] Can contain default parameters from FLP user defaults
   * @returns Promise resolves with an array of response objects (TODO: to be changed)
   * @private
   * @ui5-restricted
   */
  function callActionImport(sActionName, oModel, oAppComponent, mParameters) {
    if (!oModel) {
      return Promise.reject("Action expects a model/context for execution");
    }
    var oMetaModel = oModel.getMetaModel(),
      sActionPath = oModel.bindContext("/".concat(sActionName)).getPath(),
      oActionImport = oMetaModel.createBindingContext("/".concat(oMetaModel.createBindingContext(sActionPath).getObject("$Action"), "/0"));
    mParameters.isCriticalAction = getIsActionCritical(oMetaModel, "".concat(sActionPath, "/@$ui5.overload"));
    return callAction(sActionName, oModel, oActionImport, oAppComponent, mParameters);
  }
  function callBoundFunction(sFunctionName, context, oModel) {
    if (!context) {
      return Promise.reject("Bound functions always requires a context");
    }
    var oMetaModel = oModel.getMetaModel(),
      sFunctionPath = "".concat(oMetaModel.getMetaPath(context.getPath()), "/").concat(sFunctionName),
      oBoundFunction = oMetaModel.createBindingContext(sFunctionPath);
    return _executeFunction(sFunctionName, oModel, oBoundFunction, context);
  }
  /**
   * Calls a function import.
   *
   * @function
   * @static
   * @name sap.fe.core.actions.operations.callFunctionImport
   * @memberof sap.fe.core.actions.operations
   * @param sFunctionName The name of the function to be called
   * @param oModel An instance of an OData v4 model
   * @returns Promise resolves
   * @private
   */
  function callFunctionImport(sFunctionName, oModel) {
    if (!sFunctionName) {
      return Promise.resolve();
    }
    var oMetaModel = oModel.getMetaModel(),
      sFunctionPath = oModel.bindContext("/".concat(sFunctionName)).getPath(),
      oFunctionImport = oMetaModel.createBindingContext("/".concat(oMetaModel.createBindingContext(sFunctionPath).getObject("$Function"), "/0"));
    return _executeFunction(sFunctionName, oModel, oFunctionImport);
  }
  function _executeFunction(sFunctionName, oModel, oFunction, context) {
    var sGroupId;
    if (!oFunction || !oFunction.getObject()) {
      return Promise.reject(new Error("Function ".concat(sFunctionName, " not found")));
    }
    if (context) {
      oFunction = oModel.bindContext("".concat(sFunctionName, "(...)"), context);
      sGroupId = "functionGroup";
    } else {
      oFunction = oModel.bindContext("/".concat(sFunctionName, "(...)"));
      sGroupId = "functionImport";
    }
    var oFunctionPromise = oFunction.execute(sGroupId);
    oModel.submitBatch(sGroupId);
    return oFunctionPromise.then(function () {
      return oFunction.getBoundContext();
    });
  }
  function callAction(sActionName, oModel, oAction, oAppComponent, mParameters) {
    return new Promise(function (resolve, reject) {
      try {
        var mActionExecutionParameters = {};
        var fnDialog;
        var oActionPromise;
        //let failedActionPromise: any;
        var sActionLabel = mParameters.label;
        var bSkipParameterDialog = mParameters.skipParameterDialog;
        var aContexts = mParameters.aContexts;
        var bIsCreateAction = mParameters.bIsCreateAction;
        var bIsCriticalAction = mParameters.isCriticalAction;
        var oMetaModel;
        var sMetaPath;
        var sMessagesPath;
        var iMessageSideEffect;
        var bIsSameEntity;
        var oReturnType;
        var bValuesProvidedForAllParameters;
        var actionDefinition = oAction.getObject();
        if (!oAction || !oAction.getObject()) {
          return Promise.resolve(reject(new Error("Action ".concat(sActionName, " not found"))));
        }

        // Get the parameters of the action
        var aActionParameters = getActionParameters(oAction);

        // Check if the action has parameters and would need a parameter dialog
        // The parameter ResultIsActiveEntity is always hidden in the dialog! Hence if
        // this is the only parameter, this is treated as no parameter here because the
        // dialog would be empty!
        // FIXME: Should only ignore this if this is a 'create' action, otherwise it is just some normal parameter that happens to have this name
        var bActionNeedsParameterDialog = aActionParameters.length > 0 && !(aActionParameters.length === 1 && aActionParameters[0].$Name === "ResultIsActiveEntity");

        // Provided values for the action parameters from invokeAction call
        var aParameterValues = mParameters.parameterValues;

        // Determine startup parameters if provided
        var oComponentData = oAppComponent.getComponentData();
        var oStartupParameters = oComponentData && oComponentData.startupParameters || {};

        // In case an action parameter is needed, and we shall skip the dialog, check if values are provided for all parameters
        if (bActionNeedsParameterDialog && bSkipParameterDialog) {
          bValuesProvidedForAllParameters = _valuesProvidedForAllParameters(bIsCreateAction, aActionParameters, aParameterValues, oStartupParameters);
        }

        // Depending on the previously determined data, either set a dialog or leave it empty which
        // will lead to direct execution of the action without a dialog
        fnDialog = null;
        if (bActionNeedsParameterDialog) {
          if (!(bSkipParameterDialog && bValuesProvidedForAllParameters)) {
            fnDialog = showActionParameterDialog;
          }
        } else if (bIsCriticalAction) {
          fnDialog = confirmCriticalAction;
        }
        mActionExecutionParameters = {
          fnOnSubmitted: mParameters.onSubmitted,
          fnOnResponse: mParameters.onResponse,
          actionName: sActionName,
          model: oModel,
          aActionParameters: aActionParameters,
          bGetBoundContext: mParameters.bGetBoundContext,
          defaultValuesExtensionFunction: mParameters.defaultValuesExtensionFunction,
          label: mParameters.label,
          selectedItems: mParameters.selectedItems
        };
        if (oAction.getObject("$IsBound")) {
          if (mParameters.additionalSideEffect && mParameters.additionalSideEffect.pathExpressions) {
            oMetaModel = oModel.getMetaModel();
            sMetaPath = oMetaModel.getMetaPath(aContexts[0].getPath());
            sMessagesPath = oMetaModel.getObject("".concat(sMetaPath, "/@com.sap.vocabularies.Common.v1.Messages/$Path"));
            if (sMessagesPath) {
              iMessageSideEffect = mParameters.additionalSideEffect.pathExpressions.findIndex(function (exp) {
                return typeof exp === "string" && exp === sMessagesPath;
              });

              // Add SAP_Messages by default if not annotated by side effects, action does not return a collection and
              // the return type is the same as the bound type
              oReturnType = oAction.getObject("$ReturnType");
              bIsSameEntity = oReturnType && !oReturnType.$isCollection && oAction.getModel().getObject(sMetaPath).$Type === oReturnType.$Type;
              if (iMessageSideEffect > -1 || bIsSameEntity) {
                // the message path is annotated as side effect. As there's no binding for it and the model does currently not allow
                // to add it at a later point of time we have to take care it's part of the $select of the POST, therefore moving it.
                mParameters.mBindingParameters = mParameters.mBindingParameters || {};
                if (oAction.getObject("$ReturnType/$Type/".concat(sMessagesPath)) && (!mParameters.mBindingParameters.$select || mParameters.mBindingParameters.$select.split(",").indexOf(sMessagesPath) === -1)) {
                  mParameters.mBindingParameters.$select = mParameters.mBindingParameters.$select ? "".concat(mParameters.mBindingParameters.$select, ",").concat(sMessagesPath) : sMessagesPath;
                  // Add side effects at entity level because $select stops these being returned by the action
                  // Only if no other side effects were added for Messages
                  if (iMessageSideEffect === -1) {
                    mParameters.additionalSideEffect.pathExpressions.push("*");
                  }
                  if (mParameters.additionalSideEffect.triggerActions.length === 0 && iMessageSideEffect > -1) {
                    // no trigger action therefore no need to request messages again
                    mParameters.additionalSideEffect.pathExpressions.splice(iMessageSideEffect, 1);
                  }
                }
              }
            }
          }
          mActionExecutionParameters.aContexts = aContexts;
          mActionExecutionParameters.mBindingParameters = mParameters.mBindingParameters;
          mActionExecutionParameters.additionalSideEffect = mParameters.additionalSideEffect;
          mActionExecutionParameters.bGrouped = mParameters.invocationGrouping === InvocationGrouping.ChangeSet;
          mActionExecutionParameters.internalModelContext = mParameters.internalModelContext;
          mActionExecutionParameters.operationAvailableMap = mParameters.operationAvailableMap;
          mActionExecutionParameters.isCreateAction = bIsCreateAction;
          mActionExecutionParameters.bObjectPage = mParameters.bObjectPage;
          if (mParameters.controlId) {
            mActionExecutionParameters.control = mParameters.parentControl.byId(mParameters.controlId);
          } else {
            mActionExecutionParameters.control = mParameters.parentControl;
          }
        }
        if (bIsCreateAction) {
          mActionExecutionParameters.bIsCreateAction = bIsCreateAction;
        }
        //check for skipping static actions
        var isStatic = (actionDefinition.$Parameter || []).some(function (aParameter) {
          return (actionDefinition.$EntitySetPath && actionDefinition.$EntitySetPath === aParameter.$Name || actionDefinition.$IsBound) && aParameter.$isCollection;
        });
        mActionExecutionParameters.isStatic = isStatic;
        return Promise.resolve(function () {
          if (fnDialog) {
            oActionPromise = fnDialog(sActionName, oAppComponent, sActionLabel, mActionExecutionParameters, aActionParameters, aParameterValues, oAction, mParameters.parentControl, mParameters.entitySetName, mParameters.messageHandler);
            return oActionPromise.then(function (oOperationResult) {
              afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition);
              resolve(oOperationResult);
            }).catch(function (oOperationResult) {
              reject(oOperationResult);
            });
          } else {
            // Take over all provided parameter values and call the action.
            // This shall only happen if values are provided for all the parameters, otherwise the parameter dialog shall be shown which is ensured earlier
            if (aParameterValues) {
              var _loop = function (i) {
                var _aParameterValues$fin;
                mActionExecutionParameters.aActionParameters[i].value = aParameterValues === null || aParameterValues === void 0 ? void 0 : (_aParameterValues$fin = aParameterValues.find(function (element) {
                  return element.name === mActionExecutionParameters.aActionParameters[i].$Name;
                })) === null || _aParameterValues$fin === void 0 ? void 0 : _aParameterValues$fin.value;
              };
              for (var i in mActionExecutionParameters.aActionParameters) {
                _loop(i);
              }
            } else {
              for (var _i in mActionExecutionParameters.aActionParameters) {
                var _oStartupParameters$m;
                mActionExecutionParameters.aActionParameters[_i].value = (_oStartupParameters$m = oStartupParameters[mActionExecutionParameters.aActionParameters[_i].$Name]) === null || _oStartupParameters$m === void 0 ? void 0 : _oStartupParameters$m[0];
              }
            }
            var oOperationResult;
            var _temp5 = _finallyRethrows(function () {
              return _catch(function () {
                var _mActionExecutionPara, _mActionExecutionPara2;
                (_mActionExecutionPara = mActionExecutionParameters) === null || _mActionExecutionPara === void 0 ? void 0 : (_mActionExecutionPara2 = _mActionExecutionPara.internalModelContext) === null || _mActionExecutionPara2 === void 0 ? void 0 : _mActionExecutionPara2.setProperty("412Executed", false);
                return Promise.resolve(_executeAction(oAppComponent, mActionExecutionParameters, mParameters.parentControl, mParameters.messageHandler)).then(function (_executeAction2) {
                  var _mActionExecutionPara3;
                  oOperationResult = _executeAction2;
                  var messages = Core.getMessageManager().getMessageModel().getData();
                  if (mActionExecutionParameters.internalModelContext && mActionExecutionParameters.internalModelContext.getProperty("412Executed") && (_mActionExecutionPara3 = mActionExecutionParameters.internalModelContext.getProperty("strictHandlingFails")) !== null && _mActionExecutionPara3 !== void 0 && _mActionExecutionPara3.length) {
                    mActionExecutionParameters.internalModelContext.setProperty("DelayMessages", mActionExecutionParameters.internalModelContext.getProperty("DelayMessages").concat(messages));
                  }
                  afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition);
                  resolve(oOperationResult);
                });
              }, function () {
                reject(oOperationResult);
              });
            }, function (_wasThrown, _result) {
              function _temp3() {
                var _mParameters$messageH;
                mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$messageH = mParameters.messageHandler) === null || _mParameters$messageH === void 0 ? void 0 : _mParameters$messageH.showMessageDialog();
                if (_wasThrown) throw _result;
                return _result;
              }
              var _temp2 = function () {
                var _mActionExecutionPara4;
                if (mActionExecutionParameters.internalModelContext && mActionExecutionParameters.internalModelContext.getProperty("412Executed") && (_mActionExecutionPara4 = mActionExecutionParameters.internalModelContext.getProperty("strictHandlingFails")) !== null && _mActionExecutionPara4 !== void 0 && _mActionExecutionPara4.length) {
                  var _temp6 = _catch(function () {
                    var strictHandlingFails = mActionExecutionParameters.internalModelContext.getProperty("strictHandlingFails");
                    var aFailedContexts = [];
                    strictHandlingFails.forEach(function (fail) {
                      aFailedContexts.push(fail.oAction.getContext());
                    });
                    mActionExecutionParameters.aContexts = aFailedContexts;
                    return Promise.resolve(_executeAction(oAppComponent, mActionExecutionParameters, mParameters.parentControl, mParameters.messageHandler)).then(function (oFailedOperationResult) {
                      Core.getMessageManager().addMessages(mActionExecutionParameters.internalModelContext.getProperty("DelayMessages"));
                      mActionExecutionParameters.internalModelContext.setProperty("strictHandlingFails", []);
                      mActionExecutionParameters.internalModelContext.setProperty("processedMessageIds", []);
                      afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition);
                      resolve(oFailedOperationResult);
                    });
                  }, function (oFailedOperationResult) {
                    reject(oFailedOperationResult);
                  });
                  if (_temp6 && _temp6.then) return _temp6.then(function () {});
                }
              }();
              return _temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2);
            });
            if (_temp5 && _temp5.then) return _temp5.then(function () {});
          }
        }());
      } catch (e) {
        return Promise.reject(e);
      }
    });
  }
  function confirmCriticalAction(sActionName, oAppComponent, sActionLabel, mParameters, aActionParameters, aParameterValues, oActionContext, oParentControl, entitySetName, messageHandler) {
    return new Promise(function (resolve, reject) {
      var boundActionName = sActionName ? sActionName : null;
      boundActionName = boundActionName.indexOf(".") >= 0 ? boundActionName.split(".")[boundActionName.split(".").length - 1] : boundActionName;
      var suffixResourceKey = boundActionName && entitySetName ? "".concat(entitySetName, "|").concat(boundActionName) : "";
      var oResourceBundle = oParentControl.getController().oResourceBundle;
      var sConfirmationText = CommonUtils.getTranslatedText("C_OPERATIONS_ACTION_CONFIRM_MESSAGE", oResourceBundle, null, suffixResourceKey);
      MessageBox.confirm(sConfirmationText, {
        onClose: function (sAction) {
          try {
            var _temp10 = function () {
              if (sAction === Action.OK) {
                var _temp11 = _catch(function () {
                  return Promise.resolve(_executeAction(oAppComponent, mParameters, oParentControl, messageHandler)).then(function (oOperation) {
                    resolve(oOperation);
                  });
                }, function (oError) {
                  var _temp7 = _catch(function () {
                    return Promise.resolve(messageHandler.showMessageDialog()).then(function () {
                      reject(oError);
                    });
                  }, function () {
                    reject(oError);
                  });
                  return _temp7 && _temp7.then ? _temp7.then(function () {}) : void 0;
                });
                if (_temp11 && _temp11.then) return _temp11.then(function () {});
              } else {
                resolve();
              }
            }();
            return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(function () {}) : void 0);
          } catch (e) {
            return Promise.reject(e);
          }
        }
      });
    });
  }
  function afterActionResolution(mParameters, mActionExecutionParameters, actionDefinition) {
    if (mActionExecutionParameters.internalModelContext && mActionExecutionParameters.operationAvailableMap && mActionExecutionParameters.aContexts && mActionExecutionParameters.aContexts.length && actionDefinition.$IsBound) {
      //check for skipping static actions
      var isStatic = mActionExecutionParameters.isStatic;
      if (!isStatic) {
        ActionRuntime.setActionEnablement(mActionExecutionParameters.internalModelContext, JSON.parse(mActionExecutionParameters.operationAvailableMap), mParameters.selectedItems, "table");
      } else if (mActionExecutionParameters.control) {
        var oControl = mActionExecutionParameters.control;
        if (oControl.isA("sap.ui.mdc.Table")) {
          var aSelectedContexts = oControl.getSelectedContexts();
          ActionRuntime.setActionEnablement(mActionExecutionParameters.internalModelContext, JSON.parse(mActionExecutionParameters.operationAvailableMap), aSelectedContexts, "table");
        }
      }
    }
  }
  function actionParameterShowMessageCallback(mParameters, aContexts, oDialog, messages, showMessageParametersIn) {
    var showMessageBox = showMessageParametersIn.showMessageBox,
      showMessageDialog = showMessageParametersIn.showMessageDialog;
    var oControl = mParameters.control;
    var unboundMessages = messages.filter(function (message) {
      return message.getTarget() === "";
    });
    var APDmessages = messages.filter(function (message) {
      return message.getTarget && message.getTarget().indexOf(mParameters.actionName) !== -1 && mParameters.aActionParameters.some(function (actionParam) {
        return message.getTarget().indexOf(actionParam.$Name) !== -1;
      });
    });
    APDmessages.forEach(function (APDMessage) {
      APDMessage.isAPDTarget = true;
    });
    var errorTargetsInAPD = APDmessages.length ? true : false;
    if (oDialog.isOpen() && aContexts.length !== 0 && !mParameters.isStatic) {
      if (!mParameters.bGrouped) {
        //isolated
        if (aContexts.length > 1 || !errorTargetsInAPD) {
          // does not matter if error is in APD or not, if there are multiple contexts selected or if the error is not the APD, we close it.
          // TODO: Dilaog handling should not be part of message handling. Refactor accordingly - dialog should not be needed inside this method - neither
          // to ask whether it's open, nor to close it!
          oDialog.close();
          mParameters === null || mParameters === void 0 ? void 0 : mParameters.onAfterAPDClose();
        }
      } else if (!errorTargetsInAPD) {
        //changeset
        oDialog.close();
        mParameters === null || mParameters === void 0 ? void 0 : mParameters.onAfterAPDClose();
      }
      // we need to destroy the dialog immediately after closing it, if not oDialog.isOpen() returns true below and that would cause irrelevant messages to be shown on UI
      // by the lines that follow.
    }

    var filteredMessages = [];
    var bIsAPDOpen = oDialog.isOpen();
    if (messages.length === 1 && messages[0].getTarget && messages[0].getTarget() !== undefined && messages[0].getTarget() !== "") {
      if (oControl && oControl.getModel("ui").getProperty("/isEditable") === false || !oControl) {
        // OP edit or LR
        showMessageBox = !errorTargetsInAPD;
        showMessageDialog = false;
      } else if (oControl && oControl.getModel("ui").getProperty("/isEditable") === true) {
        showMessageBox = false;
        showMessageDialog = false;
      }
    } else if (oControl) {
      if (oControl.getModel("ui").getProperty("/isEditable") === false) {
        if (bIsAPDOpen && errorTargetsInAPD) {
          showMessageDialog = false;
        }
      } else if (oControl.getModel("ui").getProperty("/isEditable") === true) {
        if (!bIsAPDOpen && errorTargetsInAPD) {
          showMessageDialog = true;
          filteredMessages = unboundMessages.concat(APDmessages);
        } else if (!bIsAPDOpen && unboundMessages.length === 0) {
          // error targets in APD => there is atleast one bound message. If there are unbound messages, dialog must be shown.
          // for draft entity, we already closed the APD
          showMessageDialog = false;
        }
      }
    }
    return {
      showMessageBox: showMessageBox,
      showMessageDialog: showMessageDialog,
      filteredMessages: filteredMessages.length ? filteredMessages : messages,
      fnGetMessageSubtitle: oControl && oControl.isA("sap.ui.mdc.Table") && messageHandling.setMessageSubtitle.bind({}, oControl, aContexts)
    };
  }

  /*
   * Currently, this method is responsible for showing the dialog and executing the action. The promise returned is pending while waiting for user input, as well as while the
   * back-end request is running. The promise is rejected when the user cancels the dialog and also when the back-end request fails.
   * TODO: Refactoring: Separate dialog handling from backend processing. Dialog handling should return a Promise resolving to parameters to be provided to backend. If dialog is
   * cancelled, that promise can be rejected. Method responsible for backend processing need to deal with multiple contexts - i.e. it should either return an array of Promises or
   * a Promise resolving to an array. In the latter case, that Promise should be resolved also when some or even all contexts failed in backend - the overall process still was
   * successful.
   *
   */

  // this type is meant to describe the meta information for one ActionParameter (i.e. its object in metaModel)

  function showActionParameterDialog(sActionName, oAppComponent, sActionLabel, mParameters, aActionParameters, aParameterValues, oActionContext, oParentControl, entitySetName, messageHandler) {
    var sPath = _getPath(oActionContext, sActionName),
      metaModel = oActionContext.getModel().oModel.getMetaModel(),
      entitySetContext = metaModel.createBindingContext(sPath),
      sActionNamePath = oActionContext.getObject("$IsBound") ? oActionContext.getPath().split("/@$ui5.overload/0")[0] : oActionContext.getPath().split("/0")[0],
      actionNameContext = metaModel.createBindingContext(sActionNamePath),
      bIsCreateAction = mParameters.isCreateAction,
      sFragmentName = "sap/fe/core/controls/ActionParameterDialog";
    return new Promise(function (resolve, reject) {
      try {
        var actionParameterInfos; // to be filled after fragment (for action parameter dialog) is loaded. Actually only needed during dialog processing, i.e. could be moved into the controller and directly initialized there, but only after moving all handlers (esp. press handler for action button) to controller.

        var messageManager = Core.getMessageManager();

        // in case of missing mandaotory parameter, message currently differs per parameter, as it superfluously contains the label as parameter. Possiblky this could be removed in future, in that case, interface could be simplified to ActionParameterInfo[], string
        var _addMessageForActionParameter = function (messageParameters) {
          messageManager.addMessages(messageParameters.map(function (messageParameter) {
            var binding = messageParameter.actionParameterInfo.field.getBinding(messageParameter.actionParameterInfo.isMultiValue ? "items" : "value");
            return new Message({
              message: messageParameter.message,
              type: "Error",
              processor: binding === null || binding === void 0 ? void 0 : binding.getModel(),
              persistent: true,
              target: binding === null || binding === void 0 ? void 0 : binding.getResolvedPath()
            });
          }));
        };
        var _removeMessagesForActionParamter = function (parameter) {
          var allMessages = messageManager.getMessageModel().getData();
          var controlId = generate(["APD_", parameter.$Name]);
          // also remove messages assigned to inner controls, but avoid removing messages for different paramters (with name being substring of another parameter name)
          var relevantMessages = allMessages.filter(function (msg) {
            return msg.getControlIds().some(function (id) {
              return controlId.split("-").includes(id);
            });
          });
          messageManager.removeMessages(relevantMessages);
        };
        var _validateProperties = function (oResourceBundle) {
          try {
            return Promise.resolve(Promise.allSettled(actionParameterInfos.map(function (actionParameterInfo) {
              return actionParameterInfo.validationPromise;
            }))).then(function () {
              var requiredParameterInfos = actionParameterInfos.filter(function (actionParameterInfo) {
                return actionParameterInfo.field.getRequired();
              });
              /* Hint: The boolean false is a valid value */

              var emptyRequiredFields = requiredParameterInfos.filter(function (requiredParameterInfo) {
                if (requiredParameterInfo.isMultiValue) {
                  return requiredParameterInfo.value === undefined || !requiredParameterInfo.value.length;
                } else {
                  var fieldValue = requiredParameterInfo.field.getValue();
                  return fieldValue === undefined || fieldValue === null || fieldValue === "";
                }
              });

              // message contains label per field for historical reason (originally, it was shown in additional popup, now it's directly added to the field)
              // if this was not the case (and hopefully, in future this might be subject to change), interface of _addMessageForActionParameter could be simplified to just pass emptyRequiredFields and a constant message here
              _addMessageForActionParameter(emptyRequiredFields.map(function (actionParameterInfo) {
                var _actionParameterInfo$;
                return {
                  actionParameterInfo: actionParameterInfo,
                  message: CommonUtils.getTranslatedText("C_OPERATIONS_ACTION_PARAMETER_DIALOG_MISSING_MANDATORY_MSG", oResourceBundle, [((_actionParameterInfo$ = actionParameterInfo.field.getParent()) === null || _actionParameterInfo$ === void 0 ? void 0 : _actionParameterInfo$.getAggregation("label")).getText()])
                };
              }));

              /* Check value state of all parameter */
              var firstInvalidActionParameter = actionParameterInfos.find(
              // unfortunately, _addMessageForActionParameter sets valueState only asynchroneously, thus checking emptyRequiredFields additionally
              function (actionParameterInfo) {
                return actionParameterInfo.field.getValueState() === "Error" || emptyRequiredFields.includes(actionParameterInfo);
              });
              if (firstInvalidActionParameter) {
                firstInvalidActionParameter.field.focus();
                return false;
              } else {
                return true;
              }
            });
          } catch (e) {
            return Promise.reject(e);
          }
        };
        var oController = {
          handleChange: function (oEvent) {
            try {
              var field = oEvent.getSource();
              var actionParameterInfo = actionParameterInfos.find(function (actionParameterInfo) {
                return actionParameterInfo.field === field;
              });
              // field value is being changed, thus existing messages related to that field are not valid anymore
              _removeMessagesForActionParamter(actionParameterInfo.parameter);
              // adapt info. Promise is resolved to value or rejected with exception containing message
              actionParameterInfo.validationPromise = oEvent.getParameter("promise");
              var _temp15 = _catch(function () {
                return Promise.resolve(actionParameterInfo.validationPromise).then(function (_actionParameterInfo$2) {
                  actionParameterInfo.value = _actionParameterInfo$2;
                });
              }, function (error) {
                delete actionParameterInfo.value;
                _addMessageForActionParameter([{
                  actionParameterInfo: actionParameterInfo,
                  message: error.message
                }]);
              });
              return Promise.resolve(_temp15 && _temp15.then ? _temp15.then(function () {}) : void 0);
            } catch (e) {
              return Promise.reject(e);
            }
          }
        };
        var oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
        var oParameterModel = new JSONModel({
          $displayMode: {}
        });
        var _temp13 = _catch(function () {
          return Promise.resolve(XMLPreprocessor.process(oFragment, {
            name: sFragmentName
          }, {
            bindingContexts: {
              action: oActionContext,
              actionName: actionNameContext,
              entitySet: entitySetContext
            },
            models: {
              action: oActionContext.getModel(),
              actionName: actionNameContext.getModel(),
              entitySet: entitySetContext.getModel(),
              metaModel: entitySetContext.getModel()
            }
          })).then(function (createdFragment) {
            // TODO: move the dialog into the fragment and move the handlers to the oController
            var aContexts = mParameters.aContexts || [];
            var aFunctionParams = [];
            // eslint-disable-next-line prefer-const
            var oOperationBinding;
            return Promise.resolve(CommonUtils.setUserDefaults(oAppComponent, aActionParameters, oParameterModel, true)).then(function () {
              return Promise.resolve(Fragment.load({
                definition: createdFragment,
                controller: oController
              })).then(function (_Fragment$load) {
                var oDialogContent = _Fragment$load;
                actionParameterInfos = aActionParameters.map(function (actionParameter) {
                  var field = Core.byId(generate(["APD_", actionParameter.$Name]));
                  var isMultiValue = field.isA("sap.ui.mdc.MultiValueField");
                  return {
                    parameter: actionParameter,
                    field: field,
                    isMultiValue: isMultiValue
                  };
                });
                var oResourceBundle = oParentControl.getController().oResourceBundle;
                var actionResult = {
                  dialogCancelled: true,
                  // to be set to false in case of successful action exection
                  result: undefined
                };
                var onAfterAPDClose = function () {
                  // when the dialog is cancelled, messages need to be removed in case the same action should be executed again
                  aActionParameters.forEach(_removeMessagesForActionParamter);
                  oDialog.destroy();
                  buttonLock = false;
                  if (actionResult.dialogCancelled) {
                    reject(Constants.CancelActionDialog);
                  } else {
                    resolve(actionResult.result);
                  }
                };
                var buttonLock = false;
                var oDialog = new Dialog(undefined, {
                  title: sActionLabel || CommonUtils.getTranslatedText("C_OPERATIONS_ACTION_PARAMETER_DIALOG_TITLE", oResourceBundle),
                  content: [oDialogContent],
                  escapeHandler: function () {
                    // escape handler is meant to possibly suppress or postpone closing the dialog on escape (by calling "reject" on the provided object, or "resolve" only when
                    // done with all tasks to happen before dialog can be closed). It's not intended to explicetly close the dialog here (that happens automatically when no
                    // escapeHandler is provided or the resolve-callback is called) or for own wrap up tasks (like removing validition messages - this should happen in the
                    // afterClose).
                    // TODO: Move wrap up tasks to afterClose, and remove this method completely. Take care to also adapt end button press handler accordingly.
                    // Currently only still needed to differentiate closing dialog after successful execution (uses resolve) from user cancellation (using reject)
                    oDialog.close();
                    //		reject(Constants.CancelActionDialog);
                  },

                  beginButton: new Button(generate(["fe", "APD_", sActionName, "Action", "Ok"]), {
                    text: bIsCreateAction ? CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE_BUTTON", oResourceBundle) : _getActionParameterActionName(oResourceBundle, sActionLabel, sActionName, entitySetName),
                    type: "Emphasized",
                    press: function () {
                      try {
                        var _exit3 = false;
                        return Promise.resolve(_finallyRethrows(function () {
                          var _exit2 = false;
                          // prevent multiple press events. The BusyLocker is not fast enough. (BCP: 2370130210)
                          // buttonLock is set once and reset in case of
                          // - validation error
                          // - message popup
                          // - dialog close (afterClose handler)

                          if (buttonLock === true) {
                            return;
                          }
                          buttonLock = true;
                          return Promise.resolve(_validateProperties(oResourceBundle)).then(function (_validateProperties2) {
                            if (!_validateProperties2) {
                              buttonLock = false;
                              _exit3 = true;
                              return;
                            }
                            BusyLocker.lock(oDialog);
                            return _catch(function () {
                              // TODO: due to using the search and value helps on the action dialog transient messages could appear
                              // we need an UX design for those to show them to the user - for now remove them before continuing
                              messageHandler.removeTransitionMessages();
                              // move parameter values from Dialog (SimpleForm) to mParameters.actionParameters so that they are available in the operation bindings for all contexts
                              var vParameterValue;
                              var oParameterContext = oOperationBinding && oOperationBinding.getParameterContext();
                              for (var i in aActionParameters) {
                                if (aActionParameters[i].$isCollection) {
                                  var aMVFContent = oDialog.getModel("mvfview").getProperty("/".concat(aActionParameters[i].$Name)),
                                    aKeyValues = [];
                                  for (var j in aMVFContent) {
                                    aKeyValues.push(aMVFContent[j].Key);
                                  }
                                  vParameterValue = aKeyValues;
                                } else {
                                  vParameterValue = oParameterContext.getProperty(aActionParameters[i].$Name);
                                }
                                aActionParameters[i].value = vParameterValue; // writing the current value (ueser input!) into the metamodel => should be refactored to use ActionParameterInfos instead. Used in setActionParameterDefaultValue
                                vParameterValue = undefined;
                              }
                              mParameters.label = sActionLabel;
                              mParameters.onAfterAPDClose = onAfterAPDClose;
                              return _finallyRethrows(function () {
                                return _catch(function () {
                                  var _mParameters$internal;
                                  mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal = mParameters.internalModelContext) === null || _mParameters$internal === void 0 ? void 0 : _mParameters$internal.setProperty("412Executed", false);
                                  return Promise.resolve(executeAPMAction(oAppComponent, mParameters, oParentControl, messageHandler, aContexts, oDialog, false)).then(function (aResult) {
                                    actionResult = {
                                      dialogCancelled: false,
                                      result: aResult
                                    };
                                    oDialog.close();
                                  });
                                }, function (oError) {
                                  var _mParameters$internal2;
                                  var messages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
                                  if (mParameters.internalModelContext && mParameters.internalModelContext.getProperty("412Executed") && (_mParameters$internal2 = mParameters.internalModelContext.getProperty("strictHandlingFails")) !== null && _mParameters$internal2 !== void 0 && _mParameters$internal2.length) {
                                    mParameters.internalModelContext.setProperty("DelayMessages", mParameters.internalModelContext.getProperty("DelayMessages").concat(messages));
                                  }
                                  throw oError;
                                });
                              }, function (_wasThrown2, _result4) {
                                function _temp18() {
                                  if (BusyLocker.isLocked(oDialog)) {
                                    BusyLocker.unlock(oDialog);
                                  }
                                  if (_wasThrown2) throw _result4;
                                  return _result4;
                                }
                                var _temp17 = function () {
                                  var _mParameters$internal3;
                                  if (mParameters.internalModelContext && mParameters.internalModelContext.getProperty("412Executed") && (_mParameters$internal3 = mParameters.internalModelContext.getProperty("strictHandlingFails")) !== null && _mParameters$internal3 !== void 0 && _mParameters$internal3.length) {
                                    var _temp19 = _catch(function () {
                                      var strictHandlingFails = mParameters.internalModelContext.getProperty("strictHandlingFails");
                                      var aFailedContexts = [];
                                      strictHandlingFails.forEach(function (fail) {
                                        aFailedContexts.push(fail.oAction.getContext());
                                      });
                                      mParameters.aContexts = aFailedContexts;
                                      return Promise.resolve(executeAPMAction(oAppComponent, mParameters, oParentControl, messageHandler, aContexts, oDialog, true)).then(function (aResult) {
                                        mParameters.internalModelContext.setProperty("strictHandlingFails", []);
                                        mParameters.internalModelContext.setProperty("processedMessageIds", []);
                                        actionResult = {
                                          dialogCancelled: false,
                                          result: aResult
                                        };
                                      });
                                    }, function () {
                                      var _mParameters$internal4;
                                      if (mParameters.internalModelContext && mParameters.internalModelContext.getProperty("412Executed") && (_mParameters$internal4 = mParameters.internalModelContext.getProperty("strictHandlingFails")) !== null && _mParameters$internal4 !== void 0 && _mParameters$internal4.length) {
                                        Core.getMessageManager().addMessages(mParameters.internalModelContext.getProperty("DelayMessages"));
                                      }
                                      return Promise.resolve(messageHandler.showMessageDialog({
                                        isActionParameterDialogOpen: oDialog.isOpen(),
                                        onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
                                          return actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn);
                                        }
                                      })).then(function () {});
                                    });
                                    if (_temp19 && _temp19.then) return _temp19.then(function () {});
                                  }
                                }();
                                return _temp17 && _temp17.then ? _temp17.then(_temp18) : _temp18(_temp17);
                              });
                            }, function (oError) {
                              var showMessageDialog = true;
                              return Promise.resolve(messageHandler.showMessages({
                                context: mParameters.aContexts && mParameters.aContexts[0],
                                //aContexts not always defined
                                isActionParameterDialogOpen: oDialog.isOpen(),
                                messagePageNavigationCallback: function () {
                                  oDialog.close();
                                },
                                onBeforeShowMessage: function (aMessages, showMessageParametersIn) {
                                  // Why is this implemented as callback? Apparently, all needed information is available beforehand
                                  // TODO: refactor accordingly
                                  var showMessageParameters = actionParameterShowMessageCallback(mParameters, aContexts, oDialog, aMessages, showMessageParametersIn);
                                  showMessageDialog = showMessageParameters.showMessageDialog;
                                  return showMessageParameters;
                                }
                              })).then(function () {
                                buttonLock = false; //needed if the action fails with an error popup and this one is canceld (Journey: 412WarningHandling)

                                // In case of backend validation error(s?), message shall not be shown in message dialog but next to the field on parameter dialog, which should
                                // stay open in this case => in this case, we must not resolve or reject the promise controlling the parameter dialog.
                                // In all other cases (e.g. other backend errors or user cancellation), the promise controlling the parameter dialog needs to be rejected to allow
                                // callers to react. (Example: If creation in backend after navigation to transient context fails, back navigation needs to be triggered)
                                // TODO: Refactor to separate dialog handling from backend request istead of taking decision based on message handling
                                if (showMessageDialog) {
                                  reject(oError);
                                }
                              });
                            });
                          });
                        }, function (_wasThrown3, _result3) {
                          if (BusyLocker.isLocked(oDialog)) {
                            BusyLocker.unlock(oDialog);
                          }
                          if (_wasThrown3) throw _result3;
                          return _result3;
                        }));
                      } catch (e) {
                        return Promise.reject(e);
                      }
                    }
                  }),
                  endButton: new Button(generate(["fe", "APD_", sActionName, "Action", "Cancel"]), {
                    text: CommonUtils.getTranslatedText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL", oResourceBundle),
                    press: function () {
                      // TODO: cancel button should just close the dialog (similar to using escape). All wrap up tasks should be moved to afterClose.
                      oDialog.close();
                    }
                  }),
                  // TODO: beforeOpen is just an event, i.e. not waiting for the Promise to be resolved. Check if tasks of this function need to be done before opening the dialog
                  // - if yes, they need to be moved outside.
                  // Assumption: Sometimes dialog can be seen without any fields for a short time - maybe this is caused by this asynchronity
                  beforeOpen: function (oEvent) {
                    try {
                      // clone event for actionWrapper as oEvent.oSource gets lost during processing of beforeOpen event handler
                      var oCloneEvent = Object.assign({}, oEvent);
                      messageHandler.removeTransitionMessages();
                      var getDefaultValuesFunction = function () {
                        var oMetaModel = oDialog.getModel().getMetaModel(),
                          sActionPath = oActionContext.sPath && oActionContext.sPath.split("/@")[0],
                          sDefaultValuesFunction = oMetaModel.getObject("".concat(sActionPath, "@com.sap.vocabularies.Common.v1.DefaultValuesFunction"));
                        return sDefaultValuesFunction;
                      };
                      var fnSetDefaultsAndOpenDialog = function (sBindingParameter) {
                        try {
                          var sBoundFunctionName = getDefaultValuesFunction();
                          var prefillParameter = function (sParamName, vParamDefaultValue) {
                            try {
                              // Case 1: There is a ParameterDefaultValue annotation
                              if (vParamDefaultValue !== undefined) {
                                if (aContexts.length > 0 && vParamDefaultValue.$Path) {
                                  return Promise.resolve(_catch(function () {
                                    return Promise.resolve(CommonUtils.requestSingletonProperty(vParamDefaultValue.$Path, oOperationBinding.getModel())).then(function (vParamValue) {
                                      function _temp23() {
                                        if (aContexts.length > 1) {
                                          // For multi select, need to loop over aContexts (as contexts cannot be retrieved via binding parameter of the operation binding)
                                          var sPathForContext = vParamDefaultValue.$Path;
                                          if (sPathForContext.indexOf("".concat(sBindingParameter, "/")) === 0) {
                                            sPathForContext = sPathForContext.replace("".concat(sBindingParameter, "/"), "");
                                          }
                                          for (var i = 1; i < aContexts.length; i++) {
                                            if (aContexts[i].getProperty(sPathForContext) !== vParamValue) {
                                              // if the values from the contexts are not all the same, do not prefill
                                              return {
                                                paramName: sParamName,
                                                value: undefined,
                                                bNoPossibleValue: true
                                              };
                                            }
                                          }
                                        }
                                        return {
                                          paramName: sParamName,
                                          value: vParamValue
                                        };
                                      }
                                      var _temp22 = function () {
                                        if (vParamValue === null) {
                                          return Promise.resolve(oOperationBinding.getParameterContext().requestProperty(vParamDefaultValue.$Path)).then(function (_oOperationBinding$ge) {
                                            vParamValue = _oOperationBinding$ge;
                                          });
                                        }
                                      }();
                                      return _temp22 && _temp22.then ? _temp22.then(_temp23) : _temp23(_temp22);
                                    });
                                  }, function () {
                                    Log.error("Error while reading default action parameter", sParamName, mParameters.actionName);
                                    return {
                                      paramName: sParamName,
                                      value: undefined,
                                      bLatePropertyError: true
                                    };
                                  }));
                                } else {
                                  // Case 1.2: ParameterDefaultValue defines a fixed string value (i.e. vParamDefaultValue = 'someString')
                                  return Promise.resolve({
                                    paramName: sParamName,
                                    value: vParamDefaultValue
                                  });
                                }
                              } else if (oParameterModel && oParameterModel.oData[sParamName]) {
                                // Case 2: There is no ParameterDefaultValue annotation (=> look into the FLP User Defaults)

                                return Promise.resolve({
                                  paramName: sParamName,
                                  value: oParameterModel.oData[sParamName]
                                });
                              } else {
                                return Promise.resolve({
                                  paramName: sParamName,
                                  value: undefined
                                });
                              }
                            } catch (e) {
                              return Promise.reject(e);
                            }
                          };
                          var getParameterDefaultValue = function (sParamName) {
                            var oMetaModel = oDialog.getModel().getMetaModel(),
                              sActionParameterAnnotationPath = CommonUtils.getParameterPath(oActionContext.getPath(), sParamName) + "@",
                              oParameterAnnotations = oMetaModel.getObject(sActionParameterAnnotationPath),
                              oParameterDefaultValue = oParameterAnnotations && oParameterAnnotations["@com.sap.vocabularies.UI.v1.ParameterDefaultValue"]; // either { $Path: 'somePath' } or 'someString'
                            return oParameterDefaultValue;
                          };
                          var aCurrentParamDefaultValue = [];
                          var sParamName, vParameterDefaultValue;
                          for (var i in aActionParameters) {
                            sParamName = aActionParameters[i].$Name;
                            vParameterDefaultValue = getParameterDefaultValue(sParamName);
                            aCurrentParamDefaultValue.push(prefillParameter(sParamName, vParameterDefaultValue));
                          }
                          if (oActionContext.getObject("$IsBound") && aContexts.length > 0) {
                            if (sBoundFunctionName && sBoundFunctionName.length > 0 && typeof sBoundFunctionName === "string") {
                              for (var _i2 in aContexts) {
                                aFunctionParams.push(callBoundFunction(sBoundFunctionName, aContexts[_i2], mParameters.model));
                              }
                            }
                          }
                          var aPrefillParamPromises = Promise.all(aCurrentParamDefaultValue);
                          var aExecFunctionPromises = Promise.resolve([]);
                          var oExecFunctionFromManifestPromise;
                          if (aFunctionParams && aFunctionParams.length > 0) {
                            aExecFunctionPromises = Promise.all(aFunctionParams);
                          }
                          if (mParameters.defaultValuesExtensionFunction) {
                            var sModule = mParameters.defaultValuesExtensionFunction.substring(0, mParameters.defaultValuesExtensionFunction.lastIndexOf(".") || -1).replace(/\./gi, "/"),
                              sFunctionName = mParameters.defaultValuesExtensionFunction.substring(mParameters.defaultValuesExtensionFunction.lastIndexOf(".") + 1, mParameters.defaultValuesExtensionFunction.length);
                            oExecFunctionFromManifestPromise = FPMHelper.actionWrapper(oCloneEvent, sModule, sFunctionName, {
                              "contexts": aContexts
                            });
                          }
                          var _temp21 = _catch(function () {
                            return Promise.resolve(Promise.all([aPrefillParamPromises, aExecFunctionPromises, oExecFunctionFromManifestPromise])).then(function (aPromises) {
                              var currentParamDefaultValue = aPromises[0];
                              var functionParams = aPromises[1];
                              var oFunctionParamsFromManifest = aPromises[2];
                              var sDialogParamName;

                              // Fill the dialog with the earlier determined parameter values from the different sources
                              var _loop2 = function (_i3) {
                                var _aParameterValues$fin2;
                                sDialogParamName = aActionParameters[_i3].$Name;
                                // Parameter values provided in the call of invokeAction overrule other sources
                                var vParameterProvidedValue = aParameterValues === null || aParameterValues === void 0 ? void 0 : (_aParameterValues$fin2 = aParameterValues.find(function (element) {
                                  return element.name === aActionParameters[_i3].$Name;
                                })) === null || _aParameterValues$fin2 === void 0 ? void 0 : _aParameterValues$fin2.value;
                                if (vParameterProvidedValue) {
                                  oOperationBinding.setParameter(aActionParameters[_i3].$Name, vParameterProvidedValue);
                                } else if (oFunctionParamsFromManifest && oFunctionParamsFromManifest.hasOwnProperty(sDialogParamName)) {
                                  oOperationBinding.setParameter(aActionParameters[_i3].$Name, oFunctionParamsFromManifest[sDialogParamName]);
                                } else if (currentParamDefaultValue[_i3] && currentParamDefaultValue[_i3].value !== undefined) {
                                  oOperationBinding.setParameter(aActionParameters[_i3].$Name, currentParamDefaultValue[_i3].value);
                                  // if the default value had not been previously determined due to different contexts, we do nothing else
                                } else if (sBoundFunctionName && !currentParamDefaultValue[_i3].bNoPossibleValue) {
                                  if (aContexts.length > 1) {
                                    // we check if the function retrieves the same param value for all the contexts:
                                    var j = 0;
                                    while (j < aContexts.length - 1) {
                                      if (functionParams[j] && functionParams[j + 1] && functionParams[j].getObject(sDialogParamName) === functionParams[j + 1].getObject(sDialogParamName)) {
                                        j++;
                                      } else {
                                        break;
                                      }
                                    }
                                    //param values are all the same:
                                    if (j === aContexts.length - 1) {
                                      oOperationBinding.setParameter(aActionParameters[_i3].$Name, functionParams[j].getObject(sDialogParamName));
                                    }
                                  } else if (functionParams[0] && functionParams[0].getObject(sDialogParamName)) {
                                    //Only one context, then the default param values are to be verified from the function:

                                    oOperationBinding.setParameter(aActionParameters[_i3].$Name, functionParams[0].getObject(sDialogParamName));
                                  }
                                }
                              };
                              for (var _i3 in aActionParameters) {
                                _loop2(_i3);
                              }
                              var bErrorFound = currentParamDefaultValue.some(function (oValue) {
                                if (oValue.bLatePropertyError) {
                                  return oValue.bLatePropertyError;
                                }
                              });
                              // If at least one Default Property is a Late Property and an eTag error was raised.
                              if (bErrorFound) {
                                var sText = CommonUtils.getTranslatedText("C_APP_COMPONENT_SAPFE_ETAG_LATE_PROPERTY", oResourceBundle);
                                MessageBox.warning(sText, {
                                  contentWidth: "25em"
                                });
                              }
                            });
                          }, function (oError) {
                            Log.error("Error while retrieving the parameter", oError);
                          });
                          return Promise.resolve(_temp21 && _temp21.then ? _temp21.then(function () {}) : void 0);
                        } catch (e) {
                          return Promise.reject(e);
                        }
                      };
                      var fnAsyncBeforeOpen = function () {
                        try {
                          var _temp26 = function () {
                            if (oActionContext.getObject("$IsBound") && aContexts.length > 0) {
                              var aParameters = oActionContext.getObject("$Parameter");
                              var sBindingParameter = aParameters[0] && aParameters[0].$Name;
                              var _temp27 = _catch(function () {
                                return Promise.resolve(aContexts[0].requestObject()).then(function (oContextObject) {
                                  if (oContextObject) {
                                    oOperationBinding.setParameter(sBindingParameter, oContextObject);
                                  }
                                  return Promise.resolve(fnSetDefaultsAndOpenDialog(sBindingParameter)).then(function () {});
                                });
                              }, function (oError) {
                                Log.error("Error while retrieving the parameter", oError);
                              });
                              if (_temp27 && _temp27.then) return _temp27.then(function () {});
                            } else {
                              return Promise.resolve(fnSetDefaultsAndOpenDialog()).then(function () {});
                            }
                          }();
                          return Promise.resolve(_temp26 && _temp26.then ? _temp26.then(function () {}) : void 0);
                        } catch (e) {
                          return Promise.reject(e);
                        }
                      };
                      return Promise.resolve(fnAsyncBeforeOpen()).then(function () {
                        // adding defaulted values only here after they are not set to the fields
                        var _iterator = _createForOfIteratorHelper(actionParameterInfos),
                          _step;
                        try {
                          for (_iterator.s(); !(_step = _iterator.n()).done;) {
                            var actionParameterInfo = _step.value;
                            var _value = actionParameterInfo.isMultiValue ? actionParameterInfo.field.getItems() : actionParameterInfo.field.getValue();
                            actionParameterInfo.value = _value;
                            actionParameterInfo.validationPromise = Promise.resolve(_value);
                          }
                        } catch (err) {
                          _iterator.e(err);
                        } finally {
                          _iterator.f();
                        }
                      });
                    } catch (e) {
                      return Promise.reject(e);
                    }
                  },
                  afterClose: onAfterAPDClose
                });
                mParameters.oDialog = oDialog;
                oDialog.setModel(oActionContext.getModel().oModel);
                oDialog.setModel(oParameterModel, "paramsModel");
                oDialog.bindElement({
                  path: "/",
                  model: "paramsModel"
                });

                // empty model to add elements dynamically depending on number of MVF fields defined on the dialog
                var oMVFModel = new JSONModel({});
                oDialog.setModel(oMVFModel, "mvfview");

                /* Event needed for removing messages of valid changed field */
                var _iterator2 = _createForOfIteratorHelper(actionParameterInfos),
                  _step2;
                try {
                  var _loop3 = function () {
                    var actionParameterInfo = _step2.value;
                    if (actionParameterInfo.isMultiValue) {
                      var _actionParameterInfo$3, _actionParameterInfo$4;
                      actionParameterInfo === null || actionParameterInfo === void 0 ? void 0 : (_actionParameterInfo$3 = actionParameterInfo.field) === null || _actionParameterInfo$3 === void 0 ? void 0 : (_actionParameterInfo$4 = _actionParameterInfo$3.getBinding("items")) === null || _actionParameterInfo$4 === void 0 ? void 0 : _actionParameterInfo$4.attachChange(function () {
                        _removeMessagesForActionParamter(actionParameterInfo.parameter);
                      });
                    } else {
                      var _actionParameterInfo$5, _actionParameterInfo$6;
                      actionParameterInfo === null || actionParameterInfo === void 0 ? void 0 : (_actionParameterInfo$5 = actionParameterInfo.field) === null || _actionParameterInfo$5 === void 0 ? void 0 : (_actionParameterInfo$6 = _actionParameterInfo$5.getBinding("value")) === null || _actionParameterInfo$6 === void 0 ? void 0 : _actionParameterInfo$6.attachChange(function () {
                        _removeMessagesForActionParamter(actionParameterInfo.parameter);
                      });
                    }
                  };
                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                    _loop3();
                  }
                } catch (err) {
                  _iterator2.e(err);
                } finally {
                  _iterator2.f();
                }
                var sActionPath = "".concat(sActionName, "(...)");
                if (!aContexts.length) {
                  sActionPath = "/".concat(sActionPath);
                }
                oDialog.bindElement({
                  path: sActionPath
                });
                if (oParentControl) {
                  // if there is a parent control specified add the dialog as dependent
                  oParentControl.addDependent(oDialog);
                }
                if (aContexts.length > 0) {
                  oDialog.setBindingContext(aContexts[0]); // use context of first selected line item
                }

                oOperationBinding = oDialog.getObjectBinding();
                oDialog.open();
              });
            });
          });
        }, function (oError) {
          reject(oError);
        });
        return Promise.resolve(_temp13 && _temp13.then ? _temp13.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    });
  }
  function getActionParameters(oAction) {
    var aParameters = oAction.getObject("$Parameter") || [];
    if (aParameters && aParameters.length) {
      if (oAction.getObject("$IsBound")) {
        //in case of bound actions, ignore the first parameter and consider the rest
        return aParameters.slice(1, aParameters.length) || [];
      }
    }
    return aParameters;
  }
  function getIsActionCritical(oMetaModel, sPath, contexts, oBoundAction) {
    var vActionCritical = oMetaModel.getObject("".concat(sPath, "@com.sap.vocabularies.Common.v1.IsActionCritical"));
    var sCriticalPath = vActionCritical && vActionCritical.$Path;
    if (!sCriticalPath) {
      // the static value scenario for isActionCritical
      return !!vActionCritical;
    }
    var aBindingParams = oBoundAction && oBoundAction.getObject("$Parameter"),
      aPaths = sCriticalPath && sCriticalPath.split("/"),
      bCondition = aBindingParams && aBindingParams.length && typeof aBindingParams === "object" && sCriticalPath && contexts && contexts.length;
    if (bCondition) {
      //in case binding patameters are there in path need to remove eg: - _it/isVerified => need to remove _it and the path should be isVerified
      aBindingParams.filter(function (oParams) {
        var index = aPaths && aPaths.indexOf(oParams.$Name);
        if (index > -1) {
          aPaths.splice(index, 1);
        }
      });
      sCriticalPath = aPaths.join("/");
      return contexts[0].getObject(sCriticalPath);
    } else if (sCriticalPath) {
      //if scenario is path based return the path value
      return contexts[0].getObject(sCriticalPath);
    }
  }
  function _getActionParameterActionName(oResourceBundle, sActionLabel, sActionName, sEntitySetName) {
    var boundActionName = sActionName ? sActionName : null;
    var aActionName = boundActionName.split(".");
    boundActionName = boundActionName.indexOf(".") >= 0 ? aActionName[aActionName.length - 1] : boundActionName;
    var suffixResourceKey = boundActionName && sEntitySetName ? "".concat(sEntitySetName, "|").concat(boundActionName) : "";
    var sKey = "ACTION_PARAMETER_DIALOG_ACTION_NAME";
    var bResourceKeyExists = oResourceBundle && CommonUtils.checkIfResourceKeyExists(oResourceBundle.aCustomBundles, "".concat(sKey, "|").concat(suffixResourceKey));
    if (sActionLabel) {
      if (bResourceKeyExists) {
        return CommonUtils.getTranslatedText(sKey, oResourceBundle, null, suffixResourceKey);
      } else if (oResourceBundle && CommonUtils.checkIfResourceKeyExists(oResourceBundle.aCustomBundles, "".concat(sKey, "|").concat(sEntitySetName))) {
        return CommonUtils.getTranslatedText(sKey, oResourceBundle, null, "".concat(sEntitySetName));
      } else if (oResourceBundle && CommonUtils.checkIfResourceKeyExists(oResourceBundle.aCustomBundles, "".concat(sKey))) {
        return CommonUtils.getTranslatedText(sKey, oResourceBundle);
      } else {
        return sActionLabel;
      }
    } else {
      return CommonUtils.getTranslatedText("C_COMMON_DIALOG_OK", oResourceBundle);
    }
  }
  function handle412FailedTransitions(mParameters, oAction, sGroupId, current_context_index, iContextLength, messageHandler, oResourceBundle) {
    var _mParameters$internal5;
    if (mParameters.aContexts.length > 1) {
      var strictHandlingFails;
      var messages = sap.ui.getCore().getMessageManager().getMessageModel().getData();
      var processedMessageIds = mParameters.internalModelContext.getProperty("processedMessageIds");
      var transitionMessages = messages.filter(function (message) {
        var isDuplicate = processedMessageIds.find(function (id) {
          return message.getId() === id;
        });
        if (!isDuplicate) {
          processedMessageIds.push(message.getId());
          if (message.getType() === MessageType.Success) {
            mParameters.internalModelContext.setProperty("DelayMessages", mParameters.internalModelContext.getProperty("DelayMessages").concat(message));
          }
        }
        return message.getPersistent() === true && message.getType() !== MessageType.Success && !isDuplicate;
      });
      mParameters.internalModelContext.setProperty("processedMessageIds", processedMessageIds);
      if (transitionMessages.length) {
        if (mParameters.internalModelContext) {
          strictHandlingFails = mParameters.internalModelContext.getProperty("strictHandlingFails");
          strictHandlingFails.push({
            oAction: oAction,
            groupId: sGroupId
          });
          mParameters.internalModelContext.setProperty("strictHandlingFails", strictHandlingFails);
        }
      }
    }
    if (current_context_index === iContextLength && mParameters.internalModelContext && (_mParameters$internal5 = mParameters.internalModelContext.getProperty("412Messages")) !== null && _mParameters$internal5 !== void 0 && _mParameters$internal5.length) {
      operationsHelper.renderMessageView(mParameters, oResourceBundle, messageHandler, mParameters.internalModelContext.getProperty("412Messages"), true);
    }
  }
  function executeDependingOnSelectedContexts(oAction, mParameters, bGetBoundContext, sGroupId, oResourceBundle, messageHandler, iContextLength, current_context_index) {
    var oActionPromise,
      bEnableStrictHandling = true;
    if (bGetBoundContext) {
      var _oProperty$;
      var sPath = oAction.getBoundContext().getPath();
      var sMetaPath = oAction.getModel().getMetaModel().getMetaPath(sPath);
      var oProperty = oAction.getModel().getMetaModel().getObject(sMetaPath);
      if (oProperty && ((_oProperty$ = oProperty[0]) === null || _oProperty$ === void 0 ? void 0 : _oProperty$.$kind) !== "Action") {
        //do not enable the strict handling if its not an action
        bEnableStrictHandling = false;
      }
    }
    if (!bEnableStrictHandling) {
      oActionPromise = bGetBoundContext ? oAction.execute(sGroupId).then(function () {
        return oAction.getBoundContext();
      }) : oAction.execute(sGroupId);
    } else {
      oActionPromise = bGetBoundContext ? oAction.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(operations, sGroupId, mParameters, oResourceBundle, current_context_index, oAction.getContext(), iContextLength, messageHandler)).then(function () {
        handle412FailedTransitions(mParameters, oAction, sGroupId, current_context_index, iContextLength, messageHandler, oResourceBundle);
        return Promise.resolve(oAction.getBoundContext());
      }).catch(function () {
        handle412FailedTransitions(mParameters, oAction, sGroupId, current_context_index, iContextLength, messageHandler, oResourceBundle);
        return Promise.reject();
      }) : oAction.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(operations, sGroupId, mParameters, oResourceBundle, current_context_index, oAction.getContext(), iContextLength, messageHandler)).then(function (result) {
        handle412FailedTransitions(mParameters, oAction, sGroupId, current_context_index, iContextLength, messageHandler, oResourceBundle);
        return Promise.resolve(result);
      }).catch(function () {
        handle412FailedTransitions(mParameters, oAction, sGroupId, current_context_index, iContextLength, messageHandler, oResourceBundle);
        return Promise.reject();
      });
    }
    return oActionPromise.catch(function () {
      throw Constants.ActionExecutionFailed;
    });
  }
  function _executeAction(oAppComponent, mParameters, oParentControl, messageHandler) {
    var aContexts = mParameters.aContexts || [];
    var oModel = mParameters.model;
    var aActionParameters = mParameters.aActionParameters || [];
    var sActionName = mParameters.actionName;
    var fnOnSubmitted = mParameters.fnOnSubmitted;
    var fnOnResponse = mParameters.fnOnResponse;
    var oResourceBundle = oParentControl && oParentControl.isA("sap.ui.core.mvc.View") && oParentControl.getController().oResourceBundle;
    var oAction;
    function setActionParameterDefaultValue() {
      if (aActionParameters && aActionParameters.length) {
        for (var j = 0; j < aActionParameters.length; j++) {
          if (!aActionParameters[j].value) {
            switch (aActionParameters[j].$Type) {
              case "Edm.String":
                aActionParameters[j].value = "";
                break;
              case "Edm.Boolean":
                aActionParameters[j].value = false;
                break;
              case "Edm.Byte":
              case "Edm.Int16":
              case "Edm.Int32":
              case "Edm.Int64":
                aActionParameters[j].value = 0;
                break;
              // tbc
              default:
                break;
            }
          }
          oAction.setParameter(aActionParameters[j].$Name, aActionParameters[j].value);
        }
      }
    }
    if (aContexts.length) {
      // TODO: refactor to direct use of Promise.allSettled
      return new Promise(function (resolve) {
        var fnExecuteSequentially = function (contextsToExecute) {
          try {
            function processOneAction(context, actionIndex, iContextLength) {
              oAction = oModel.bindContext("".concat(sActionName, "(...)"), context, mBindingParameters);
              return fnExecuteSingleAction(oAction, actionIndex, {
                context: context,
                pathExpressions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.pathExpressions,
                triggerActions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.triggerActions
              }, iContextLength);
            }

            // serialization: processOneAction to be called for each entry in contextsToExecute only after the promise returned from the one before has been resolved
            // One action and its side effects are completed before the next action is executed
            (fnOnSubmitted || function noop() {
              /**/
            })(aActionPromises);
            return Promise.resolve(contextsToExecute.reduce(function (promise, context, id) {
              try {
                return Promise.resolve(promise).then(function () {
                  return Promise.resolve(processOneAction(context, id + 1, aContexts.length)).then(function () {});
                });
              } catch (e) {
                return Promise.reject(e);
              }
            }, Promise.resolve())).then(function () {
              fnHandleResults();
            });
          } catch (e) {
            return Promise.reject(e);
          }
        };
        var mBindingParameters = mParameters.mBindingParameters;
        var bGrouped = mParameters.bGrouped;
        var bGetBoundContext = mParameters.bGetBoundContext;
        if (mParameters.internalModelContext && !mParameters.internalModelContext.getProperty("412Executed")) {
          mParameters.internalModelContext.setProperty("strictHandlingPromises", []);
          mParameters.internalModelContext.setProperty("strictHandlingFails", []);
          mParameters.internalModelContext.setProperty("412Messages", []);
          mParameters.internalModelContext.setProperty("processedMessageIds", []);
          mParameters.internalModelContext.setProperty("DelayMessages", []);
        }
        var aActionPromises = [];
        var oActionPromise;
        var i;
        var sGroupId;
        var fnExecuteAction = function (actionContext, current_context_index, oSideEffect, iContextLength) {
          setActionParameterDefaultValue();
          // For invocation grouping "isolated" need batch group per action call
          sGroupId = !bGrouped ? "$auto.".concat(current_context_index) : actionContext.getUpdateGroupId();
          mParameters.requestSideEffects = fnRequestSideEffects.bind(operations, oAppComponent, oSideEffect, mParameters);
          oActionPromise = executeDependingOnSelectedContexts(actionContext, mParameters, bGetBoundContext, sGroupId, oResourceBundle, messageHandler, iContextLength, current_context_index);
          aActionPromises.push(oActionPromise);
          fnRequestSideEffects(oAppComponent, oSideEffect, mParameters, sGroupId);
        };
        var fnExecuteSingleAction = function (actionContext, current_context_index, oSideEffect, iContextLength) {
          var aLocalPromise = [];
          setActionParameterDefaultValue();
          // For invocation grouping "isolated" need batch group per action call
          sGroupId = "apiMode".concat(current_context_index);
          mParameters.requestSideEffects = fnRequestSideEffects.bind(operations, oAppComponent, oSideEffect, mParameters, sGroupId, aLocalPromise);
          oActionPromise = executeDependingOnSelectedContexts(actionContext, mParameters, bGetBoundContext, sGroupId, oResourceBundle, messageHandler, iContextLength, current_context_index);
          aActionPromises.push(oActionPromise);
          aLocalPromise.push(oActionPromise);
          fnRequestSideEffects(oAppComponent, oSideEffect, mParameters, sGroupId, aLocalPromise);
          oModel.submitBatch(sGroupId);
          return Promise.allSettled(aLocalPromise);
        };
        if (!bGrouped) {
          // For invocation grouping "isolated", ensure that each action and matching side effects
          // are processed before the next set is submitted. Workaround until JSON batch is available.
          // Allow also for List Report.
          fnExecuteSequentially(aContexts);
        } else {
          for (i = 0; i < aContexts.length; i++) {
            oAction = oModel.bindContext("".concat(sActionName, "(...)"), aContexts[i], mBindingParameters);
            fnExecuteAction(oAction, aContexts.length <= 1 ? null : i, {
              context: aContexts[i],
              pathExpressions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.pathExpressions,
              triggerActions: mParameters.additionalSideEffect && mParameters.additionalSideEffect.triggerActions
            }, aContexts.length);
          }
          (fnOnSubmitted || function noop() {
            /**/
          })(aActionPromises);
          fnHandleResults();
        }
        function fnHandleResults() {
          // Promise.allSettled will never be rejected. However, eslint requires either catch or return - thus we return the resulting Promise although no one will use it.
          return Promise.allSettled(aActionPromises).then(resolve);
        }
      }).finally(function () {
        (fnOnResponse || function noop() {
          /**/
        })();
      });
    } else {
      oAction = oModel.bindContext("/".concat(sActionName, "(...)"));
      setActionParameterDefaultValue();
      var sGroupId = "actionImport";
      var oActionPromise = oAction.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(operations, sGroupId, {
        label: mParameters.label,
        model: oModel
      }, oResourceBundle, null, null, null, messageHandler));
      oModel.submitBatch(sGroupId);
      // trigger onSubmitted "event"
      (fnOnSubmitted || function noop() {
        /**/
      })(oActionPromise);
      return oActionPromise.finally(function () {
        (fnOnResponse || function noop() {
          /**/
        })();
      });
    }
  }
  function _getPath(oActionContext, sActionName) {
    var sPath = oActionContext.getPath();
    sPath = oActionContext.getObject("$IsBound") ? sPath.split("@$ui5.overload")[0] : sPath.split("/0")[0];
    return sPath.split("/".concat(sActionName))[0];
  }
  function _valuesProvidedForAllParameters(isCreateAction, actionParameters, parameterValues, startupParameters) {
    if (parameterValues) {
      // If showDialog is false but there are parameters from the invokeAction call, we need to check that values have been
      // provided for all of them
      var _iterator3 = _createForOfIteratorHelper(actionParameters),
        _step3;
      try {
        var _loop4 = function () {
          var actionParameter = _step3.value;
          if (actionParameter.$Name !== "ResultIsActiveEntity" && !(parameterValues !== null && parameterValues !== void 0 && parameterValues.find(function (element) {
            return element.name === actionParameter.$Name;
          }))) {
            // At least for one parameter no value has been provided, so we can't skip the dialog
            return {
              v: false
            };
          }
        };
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _ret = _loop4();
          if (typeof _ret === "object") return _ret.v;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    } else if (isCreateAction && startupParameters) {
      // If parameters have been provided during application launch, we need to check if the set is complete
      // If not, the parameter dialog still needs to be shown.
      var _iterator4 = _createForOfIteratorHelper(actionParameters),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var actionParameter = _step4.value;
          if (!startupParameters[actionParameter.$Name]) {
            // At least for one parameter no value has been provided, so we can't skip the dialog
            return false;
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
    return true;
  }
  function fnRequestSideEffects(oAppComponent, oSideEffect, mParameters, sGroupId, aLocalPromise) {
    var oSideEffectsService = oAppComponent.getSideEffectsService();
    var oLocalPromise;
    // trigger actions from side effects
    if (oSideEffect && oSideEffect.triggerActions && oSideEffect.triggerActions.length) {
      oSideEffect.triggerActions.forEach(function (sTriggerAction) {
        if (sTriggerAction) {
          oLocalPromise = oSideEffectsService.executeAction(sTriggerAction, oSideEffect.context, sGroupId);
          if (aLocalPromise) {
            aLocalPromise.push(oLocalPromise);
          }
        }
      });
    }
    // request side effects for this action
    // as we move the messages request to POST $select we need to be prepared for an empty array
    if (oSideEffect && oSideEffect.pathExpressions && oSideEffect.pathExpressions.length > 0) {
      oLocalPromise = oSideEffectsService.requestSideEffects(oSideEffect.pathExpressions, oSideEffect.context, sGroupId);
      if (aLocalPromise) {
        aLocalPromise.push(oLocalPromise);
      }
      oLocalPromise.then(function () {
        if (mParameters.operationAvailableMap && mParameters.internalModelContext) {
          ActionRuntime.setActionEnablement(mParameters.internalModelContext, JSON.parse(mParameters.operationAvailableMap), mParameters.selectedItems, "table");
        }
      }).catch(function (oError) {
        Log.error("Error while requesting side effects", oError);
      });
    }
  }

  /**
   * Static functions to call OData actions (bound/import) and functions (bound/import)
   *
   * @namespace
   * @alias sap.fe.core.actions.operations
   * @private
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.56.0
   */
  var operations = {
    callBoundAction: callBoundAction,
    callActionImport: callActionImport,
    callBoundFunction: callBoundFunction,
    callFunctionImport: callFunctionImport,
    executeDependingOnSelectedContexts: executeDependingOnSelectedContexts,
    valuesProvidedForAllParameters: _valuesProvidedForAllParameters,
    getActionParameterActionName: _getActionParameterActionName,
    actionParameterShowMessageCallback: actionParameterShowMessageCallback,
    afterActionResolution: afterActionResolution
    // ActionParameterInfo: ActionParameterInfo,
    //  _validateProperties, _validateProperties
  };
  return operations;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiZmluYWxpemVyIiwiYmluZCIsImV4ZWN1dGVBUE1BY3Rpb24iLCJvQXBwQ29tcG9uZW50IiwibVBhcmFtZXRlcnMiLCJvUGFyZW50Q29udHJvbCIsIm1lc3NhZ2VIYW5kbGVyIiwiYUNvbnRleHRzIiwib0RpYWxvZyIsImFmdGVyNDEyIiwiX2V4ZWN1dGVBY3Rpb24iLCJhUmVzdWx0Iiwic29tZSIsIm9TaW5nbGVSZXN1bHQiLCJzdGF0dXMiLCJtZXNzYWdlcyIsIkNvcmUiLCJnZXRNZXNzYWdlTWFuYWdlciIsImdldE1lc3NhZ2VNb2RlbCIsImdldERhdGEiLCJpbnRlcm5hbE1vZGVsQ29udGV4dCIsImdldFByb3BlcnR5IiwibGVuZ3RoIiwic2V0UHJvcGVydHkiLCJjb25jYXQiLCJhZGRNZXNzYWdlcyIsInNob3dNZXNzYWdlRGlhbG9nIiwib25CZWZvcmVTaG93TWVzc2FnZSIsImFNZXNzYWdlcyIsInNob3dNZXNzYWdlUGFyYW1ldGVyc0luIiwiYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayIsImlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3BlbiIsImlzT3BlbiIsIkNvbnN0YW50cyIsIkZFTGlicmFyeSIsIkludm9jYXRpb25Hcm91cGluZyIsIkFjdGlvbiIsIk1lc3NhZ2VCb3giLCJjYWxsQm91bmRBY3Rpb24iLCJzQWN0aW9uTmFtZSIsImNvbnRleHRzIiwib01vZGVsIiwiUHJvbWlzZSIsInJlamVjdCIsImlzQ2FsbGVkV2l0aEFycmF5IiwiQXJyYXkiLCJpc0FycmF5Iiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsInNBY3Rpb25QYXRoIiwiZ2V0TWV0YVBhdGgiLCJnZXRQYXRoIiwib0JvdW5kQWN0aW9uIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJpc0NyaXRpY2FsQWN0aW9uIiwiZ2V0SXNBY3Rpb25Dcml0aWNhbCIsImV4dHJhY3RTaW5nbGVSZXN1bHQiLCJ2YWx1ZSIsInJlYXNvbiIsImNhbGxBY3Rpb24iLCJjYWxsQWN0aW9uSW1wb3J0IiwiYmluZENvbnRleHQiLCJvQWN0aW9uSW1wb3J0IiwiZ2V0T2JqZWN0IiwiY2FsbEJvdW5kRnVuY3Rpb24iLCJzRnVuY3Rpb25OYW1lIiwiY29udGV4dCIsInNGdW5jdGlvblBhdGgiLCJvQm91bmRGdW5jdGlvbiIsIl9leGVjdXRlRnVuY3Rpb24iLCJjYWxsRnVuY3Rpb25JbXBvcnQiLCJyZXNvbHZlIiwib0Z1bmN0aW9uSW1wb3J0Iiwib0Z1bmN0aW9uIiwic0dyb3VwSWQiLCJFcnJvciIsIm9GdW5jdGlvblByb21pc2UiLCJleGVjdXRlIiwic3VibWl0QmF0Y2giLCJnZXRCb3VuZENvbnRleHQiLCJvQWN0aW9uIiwibUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMiLCJmbkRpYWxvZyIsIm9BY3Rpb25Qcm9taXNlIiwic0FjdGlvbkxhYmVsIiwibGFiZWwiLCJiU2tpcFBhcmFtZXRlckRpYWxvZyIsInNraXBQYXJhbWV0ZXJEaWFsb2ciLCJiSXNDcmVhdGVBY3Rpb24iLCJiSXNDcml0aWNhbEFjdGlvbiIsInNNZXRhUGF0aCIsInNNZXNzYWdlc1BhdGgiLCJpTWVzc2FnZVNpZGVFZmZlY3QiLCJiSXNTYW1lRW50aXR5Iiwib1JldHVyblR5cGUiLCJiVmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzIiwiYWN0aW9uRGVmaW5pdGlvbiIsImFBY3Rpb25QYXJhbWV0ZXJzIiwiZ2V0QWN0aW9uUGFyYW1ldGVycyIsImJBY3Rpb25OZWVkc1BhcmFtZXRlckRpYWxvZyIsIiROYW1lIiwiYVBhcmFtZXRlclZhbHVlcyIsInBhcmFtZXRlclZhbHVlcyIsIm9Db21wb25lbnREYXRhIiwiZ2V0Q29tcG9uZW50RGF0YSIsIm9TdGFydHVwUGFyYW1ldGVycyIsInN0YXJ0dXBQYXJhbWV0ZXJzIiwiX3ZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycyIsInNob3dBY3Rpb25QYXJhbWV0ZXJEaWFsb2ciLCJjb25maXJtQ3JpdGljYWxBY3Rpb24iLCJmbk9uU3VibWl0dGVkIiwib25TdWJtaXR0ZWQiLCJmbk9uUmVzcG9uc2UiLCJvblJlc3BvbnNlIiwiYWN0aW9uTmFtZSIsIm1vZGVsIiwiYkdldEJvdW5kQ29udGV4dCIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsInNlbGVjdGVkSXRlbXMiLCJhZGRpdGlvbmFsU2lkZUVmZmVjdCIsInBhdGhFeHByZXNzaW9ucyIsImZpbmRJbmRleCIsImV4cCIsIiRpc0NvbGxlY3Rpb24iLCJnZXRNb2RlbCIsIiRUeXBlIiwibUJpbmRpbmdQYXJhbWV0ZXJzIiwiJHNlbGVjdCIsInNwbGl0IiwiaW5kZXhPZiIsInB1c2giLCJ0cmlnZ2VyQWN0aW9ucyIsInNwbGljZSIsImJHcm91cGVkIiwiaW52b2NhdGlvbkdyb3VwaW5nIiwiQ2hhbmdlU2V0Iiwib3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwiaXNDcmVhdGVBY3Rpb24iLCJiT2JqZWN0UGFnZSIsImNvbnRyb2xJZCIsImNvbnRyb2wiLCJwYXJlbnRDb250cm9sIiwiYnlJZCIsImlzU3RhdGljIiwiJFBhcmFtZXRlciIsImFQYXJhbWV0ZXIiLCIkRW50aXR5U2V0UGF0aCIsIiRJc0JvdW5kIiwiZW50aXR5U2V0TmFtZSIsIm9PcGVyYXRpb25SZXN1bHQiLCJhZnRlckFjdGlvblJlc29sdXRpb24iLCJjYXRjaCIsImkiLCJmaW5kIiwiZWxlbWVudCIsIm5hbWUiLCJzdHJpY3RIYW5kbGluZ0ZhaWxzIiwiYUZhaWxlZENvbnRleHRzIiwiZm9yRWFjaCIsImZhaWwiLCJnZXRDb250ZXh0Iiwib0ZhaWxlZE9wZXJhdGlvblJlc3VsdCIsIm9BY3Rpb25Db250ZXh0IiwiYm91bmRBY3Rpb25OYW1lIiwic3VmZml4UmVzb3VyY2VLZXkiLCJvUmVzb3VyY2VCdW5kbGUiLCJnZXRDb250cm9sbGVyIiwic0NvbmZpcm1hdGlvblRleHQiLCJDb21tb25VdGlscyIsImdldFRyYW5zbGF0ZWRUZXh0IiwiY29uZmlybSIsIm9uQ2xvc2UiLCJzQWN0aW9uIiwiT0siLCJvT3BlcmF0aW9uIiwib0Vycm9yIiwiQWN0aW9uUnVudGltZSIsInNldEFjdGlvbkVuYWJsZW1lbnQiLCJKU09OIiwicGFyc2UiLCJvQ29udHJvbCIsImlzQSIsImFTZWxlY3RlZENvbnRleHRzIiwiZ2V0U2VsZWN0ZWRDb250ZXh0cyIsInNob3dNZXNzYWdlQm94IiwidW5ib3VuZE1lc3NhZ2VzIiwiZmlsdGVyIiwibWVzc2FnZSIsImdldFRhcmdldCIsIkFQRG1lc3NhZ2VzIiwiYWN0aW9uUGFyYW0iLCJBUERNZXNzYWdlIiwiaXNBUERUYXJnZXQiLCJlcnJvclRhcmdldHNJbkFQRCIsImNsb3NlIiwib25BZnRlckFQRENsb3NlIiwiZmlsdGVyZWRNZXNzYWdlcyIsImJJc0FQRE9wZW4iLCJ1bmRlZmluZWQiLCJmbkdldE1lc3NhZ2VTdWJ0aXRsZSIsIm1lc3NhZ2VIYW5kbGluZyIsInNldE1lc3NhZ2VTdWJ0aXRsZSIsInNQYXRoIiwiX2dldFBhdGgiLCJtZXRhTW9kZWwiLCJlbnRpdHlTZXRDb250ZXh0Iiwic0FjdGlvbk5hbWVQYXRoIiwiYWN0aW9uTmFtZUNvbnRleHQiLCJzRnJhZ21lbnROYW1lIiwiYWN0aW9uUGFyYW1ldGVySW5mb3MiLCJtZXNzYWdlTWFuYWdlciIsIl9hZGRNZXNzYWdlRm9yQWN0aW9uUGFyYW1ldGVyIiwibWVzc2FnZVBhcmFtZXRlcnMiLCJtYXAiLCJtZXNzYWdlUGFyYW1ldGVyIiwiYmluZGluZyIsImFjdGlvblBhcmFtZXRlckluZm8iLCJmaWVsZCIsImdldEJpbmRpbmciLCJpc011bHRpVmFsdWUiLCJNZXNzYWdlIiwidHlwZSIsInByb2Nlc3NvciIsInBlcnNpc3RlbnQiLCJ0YXJnZXQiLCJnZXRSZXNvbHZlZFBhdGgiLCJfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlciIsInBhcmFtZXRlciIsImFsbE1lc3NhZ2VzIiwiZ2VuZXJhdGUiLCJyZWxldmFudE1lc3NhZ2VzIiwibXNnIiwiZ2V0Q29udHJvbElkcyIsImlkIiwiaW5jbHVkZXMiLCJyZW1vdmVNZXNzYWdlcyIsIl92YWxpZGF0ZVByb3BlcnRpZXMiLCJhbGxTZXR0bGVkIiwidmFsaWRhdGlvblByb21pc2UiLCJyZXF1aXJlZFBhcmFtZXRlckluZm9zIiwiZ2V0UmVxdWlyZWQiLCJlbXB0eVJlcXVpcmVkRmllbGRzIiwicmVxdWlyZWRQYXJhbWV0ZXJJbmZvIiwiZmllbGRWYWx1ZSIsImdldFZhbHVlIiwiZ2V0UGFyZW50IiwiZ2V0QWdncmVnYXRpb24iLCJnZXRUZXh0IiwiZmlyc3RJbnZhbGlkQWN0aW9uUGFyYW1ldGVyIiwiZ2V0VmFsdWVTdGF0ZSIsImZvY3VzIiwib0NvbnRyb2xsZXIiLCJoYW5kbGVDaGFuZ2UiLCJvRXZlbnQiLCJnZXRTb3VyY2UiLCJnZXRQYXJhbWV0ZXIiLCJlcnJvciIsIm9GcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwib1BhcmFtZXRlck1vZGVsIiwiSlNPTk1vZGVsIiwiJGRpc3BsYXlNb2RlIiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsImJpbmRpbmdDb250ZXh0cyIsImFjdGlvbiIsImVudGl0eVNldCIsIm1vZGVscyIsImNyZWF0ZWRGcmFnbWVudCIsImFGdW5jdGlvblBhcmFtcyIsIm9PcGVyYXRpb25CaW5kaW5nIiwic2V0VXNlckRlZmF1bHRzIiwiRnJhZ21lbnQiLCJsb2FkIiwiZGVmaW5pdGlvbiIsImNvbnRyb2xsZXIiLCJvRGlhbG9nQ29udGVudCIsImFjdGlvblBhcmFtZXRlciIsImFjdGlvblJlc3VsdCIsImRpYWxvZ0NhbmNlbGxlZCIsImRlc3Ryb3kiLCJidXR0b25Mb2NrIiwiQ2FuY2VsQWN0aW9uRGlhbG9nIiwiRGlhbG9nIiwidGl0bGUiLCJjb250ZW50IiwiZXNjYXBlSGFuZGxlciIsImJlZ2luQnV0dG9uIiwiQnV0dG9uIiwidGV4dCIsIl9nZXRBY3Rpb25QYXJhbWV0ZXJBY3Rpb25OYW1lIiwicHJlc3MiLCJCdXN5TG9ja2VyIiwibG9jayIsInJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyIsInZQYXJhbWV0ZXJWYWx1ZSIsIm9QYXJhbWV0ZXJDb250ZXh0IiwiZ2V0UGFyYW1ldGVyQ29udGV4dCIsImFNVkZDb250ZW50IiwiYUtleVZhbHVlcyIsImoiLCJLZXkiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJpc0xvY2tlZCIsInVubG9jayIsInNob3dNZXNzYWdlcyIsIm1lc3NhZ2VQYWdlTmF2aWdhdGlvbkNhbGxiYWNrIiwic2hvd01lc3NhZ2VQYXJhbWV0ZXJzIiwiZW5kQnV0dG9uIiwiYmVmb3JlT3BlbiIsIm9DbG9uZUV2ZW50IiwiT2JqZWN0IiwiYXNzaWduIiwiZ2V0RGVmYXVsdFZhbHVlc0Z1bmN0aW9uIiwic0RlZmF1bHRWYWx1ZXNGdW5jdGlvbiIsImZuU2V0RGVmYXVsdHNBbmRPcGVuRGlhbG9nIiwic0JpbmRpbmdQYXJhbWV0ZXIiLCJzQm91bmRGdW5jdGlvbk5hbWUiLCJwcmVmaWxsUGFyYW1ldGVyIiwic1BhcmFtTmFtZSIsInZQYXJhbURlZmF1bHRWYWx1ZSIsIiRQYXRoIiwicmVxdWVzdFNpbmdsZXRvblByb3BlcnR5IiwidlBhcmFtVmFsdWUiLCJzUGF0aEZvckNvbnRleHQiLCJyZXBsYWNlIiwicGFyYW1OYW1lIiwiYk5vUG9zc2libGVWYWx1ZSIsInJlcXVlc3RQcm9wZXJ0eSIsIkxvZyIsImJMYXRlUHJvcGVydHlFcnJvciIsIm9EYXRhIiwiZ2V0UGFyYW1ldGVyRGVmYXVsdFZhbHVlIiwic0FjdGlvblBhcmFtZXRlckFubm90YXRpb25QYXRoIiwiZ2V0UGFyYW1ldGVyUGF0aCIsIm9QYXJhbWV0ZXJBbm5vdGF0aW9ucyIsIm9QYXJhbWV0ZXJEZWZhdWx0VmFsdWUiLCJhQ3VycmVudFBhcmFtRGVmYXVsdFZhbHVlIiwidlBhcmFtZXRlckRlZmF1bHRWYWx1ZSIsImFQcmVmaWxsUGFyYW1Qcm9taXNlcyIsImFsbCIsImFFeGVjRnVuY3Rpb25Qcm9taXNlcyIsIm9FeGVjRnVuY3Rpb25Gcm9tTWFuaWZlc3RQcm9taXNlIiwic01vZHVsZSIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiRlBNSGVscGVyIiwiYWN0aW9uV3JhcHBlciIsImFQcm9taXNlcyIsImN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZSIsImZ1bmN0aW9uUGFyYW1zIiwib0Z1bmN0aW9uUGFyYW1zRnJvbU1hbmlmZXN0Iiwic0RpYWxvZ1BhcmFtTmFtZSIsInZQYXJhbWV0ZXJQcm92aWRlZFZhbHVlIiwic2V0UGFyYW1ldGVyIiwiaGFzT3duUHJvcGVydHkiLCJiRXJyb3JGb3VuZCIsIm9WYWx1ZSIsInNUZXh0Iiwid2FybmluZyIsImNvbnRlbnRXaWR0aCIsImZuQXN5bmNCZWZvcmVPcGVuIiwiYVBhcmFtZXRlcnMiLCJyZXF1ZXN0T2JqZWN0Iiwib0NvbnRleHRPYmplY3QiLCJnZXRJdGVtcyIsImFmdGVyQ2xvc2UiLCJzZXRNb2RlbCIsImJpbmRFbGVtZW50IiwicGF0aCIsIm9NVkZNb2RlbCIsImF0dGFjaENoYW5nZSIsImFkZERlcGVuZGVudCIsInNldEJpbmRpbmdDb250ZXh0IiwiZ2V0T2JqZWN0QmluZGluZyIsIm9wZW4iLCJzbGljZSIsInZBY3Rpb25Dcml0aWNhbCIsInNDcml0aWNhbFBhdGgiLCJhQmluZGluZ1BhcmFtcyIsImFQYXRocyIsImJDb25kaXRpb24iLCJvUGFyYW1zIiwiaW5kZXgiLCJqb2luIiwic0VudGl0eVNldE5hbWUiLCJhQWN0aW9uTmFtZSIsInNLZXkiLCJiUmVzb3VyY2VLZXlFeGlzdHMiLCJjaGVja0lmUmVzb3VyY2VLZXlFeGlzdHMiLCJhQ3VzdG9tQnVuZGxlcyIsImhhbmRsZTQxMkZhaWxlZFRyYW5zaXRpb25zIiwiY3VycmVudF9jb250ZXh0X2luZGV4IiwiaUNvbnRleHRMZW5ndGgiLCJwcm9jZXNzZWRNZXNzYWdlSWRzIiwidHJhbnNpdGlvbk1lc3NhZ2VzIiwiaXNEdXBsaWNhdGUiLCJnZXRJZCIsImdldFR5cGUiLCJNZXNzYWdlVHlwZSIsIlN1Y2Nlc3MiLCJnZXRQZXJzaXN0ZW50IiwiZ3JvdXBJZCIsIm9wZXJhdGlvbnNIZWxwZXIiLCJyZW5kZXJNZXNzYWdlVmlldyIsImV4ZWN1dGVEZXBlbmRpbmdPblNlbGVjdGVkQ29udGV4dHMiLCJiRW5hYmxlU3RyaWN0SGFuZGxpbmciLCJvUHJvcGVydHkiLCIka2luZCIsImZuT25TdHJpY3RIYW5kbGluZ0ZhaWxlZCIsIm9wZXJhdGlvbnMiLCJBY3Rpb25FeGVjdXRpb25GYWlsZWQiLCJzZXRBY3Rpb25QYXJhbWV0ZXJEZWZhdWx0VmFsdWUiLCJmbkV4ZWN1dGVTZXF1ZW50aWFsbHkiLCJjb250ZXh0c1RvRXhlY3V0ZSIsInByb2Nlc3NPbmVBY3Rpb24iLCJhY3Rpb25JbmRleCIsImZuRXhlY3V0ZVNpbmdsZUFjdGlvbiIsIm5vb3AiLCJhQWN0aW9uUHJvbWlzZXMiLCJyZWR1Y2UiLCJwcm9taXNlIiwiZm5IYW5kbGVSZXN1bHRzIiwiZm5FeGVjdXRlQWN0aW9uIiwiYWN0aW9uQ29udGV4dCIsIm9TaWRlRWZmZWN0IiwiZ2V0VXBkYXRlR3JvdXBJZCIsInJlcXVlc3RTaWRlRWZmZWN0cyIsImZuUmVxdWVzdFNpZGVFZmZlY3RzIiwiYUxvY2FsUHJvbWlzZSIsImZpbmFsbHkiLCJhY3Rpb25QYXJhbWV0ZXJzIiwib1NpZGVFZmZlY3RzU2VydmljZSIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsIm9Mb2NhbFByb21pc2UiLCJzVHJpZ2dlckFjdGlvbiIsImV4ZWN1dGVBY3Rpb24iLCJ2YWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnMiLCJnZXRBY3Rpb25QYXJhbWV0ZXJBY3Rpb25OYW1lIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJvcGVyYXRpb25zLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQWN0aW9uUnVudGltZSBmcm9tIFwic2FwL2ZlL2NvcmUvQWN0aW9uUnVudGltZVwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IEJ1c3lMb2NrZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0J1c3lMb2NrZXJcIjtcbmltcG9ydCBtZXNzYWdlSGFuZGxpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL21lc3NhZ2VIYW5kbGVyL21lc3NhZ2VIYW5kbGluZ1wiO1xuaW1wb3J0IEZQTUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9GUE1IZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCBGRUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgdHlwZSBMYWJlbCBmcm9tIFwic2FwL20vTGFiZWxcIjtcbmltcG9ydCBNZXNzYWdlQm94IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IFhNTFRlbXBsYXRlUHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS9YTUxUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IHR5cGUgRmllbGQgZnJvbSBcInNhcC91aS9tZGMvRmllbGRcIjtcbmltcG9ydCB0eXBlIE11bHRpVmFsdWVGaWVsZEl0ZW0gZnJvbSBcInNhcC91aS9tZGMvZmllbGQvTXVsdGlWYWx1ZUZpZWxkSXRlbVwiO1xuaW1wb3J0IHR5cGUgTXVsdGlWYWx1ZUZpZWxkIGZyb20gXCJzYXAvdWkvbWRjL011bHRpVmFsdWVGaWVsZFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCIuLi8uLi9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBvcGVyYXRpb25zSGVscGVyIGZyb20gXCIuLi8uLi9vcGVyYXRpb25zSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBNZXNzYWdlSGFuZGxlciBmcm9tIFwiLi4vTWVzc2FnZUhhbmRsZXJcIjtcblxuY29uc3QgQ29uc3RhbnRzID0gRkVMaWJyYXJ5LkNvbnN0YW50cyxcblx0SW52b2NhdGlvbkdyb3VwaW5nID0gRkVMaWJyYXJ5Lkludm9jYXRpb25Hcm91cGluZztcbmNvbnN0IEFjdGlvbiA9IChNZXNzYWdlQm94IGFzIGFueSkuQWN0aW9uO1xuXG4vKipcbiAqIENhbGxzIGEgYm91bmQgYWN0aW9uIGZvciBvbmUgb3IgbXVsdGlwbGUgY29udGV4dHMuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAc3RhdGljXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLm9wZXJhdGlvbnMuY2FsbEJvdW5kQWN0aW9uXG4gKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuYWN0aW9ucy5vcGVyYXRpb25zXG4gKiBAcGFyYW0gc0FjdGlvbk5hbWUgVGhlIG5hbWUgb2YgdGhlIGFjdGlvbiB0byBiZSBjYWxsZWRcbiAqIEBwYXJhbSBjb250ZXh0cyBFaXRoZXIgb25lIGNvbnRleHQgb3IgYW4gYXJyYXkgd2l0aCBjb250ZXh0cyBmb3Igd2hpY2ggdGhlIGFjdGlvbiBpcyB0byBiZSBiZSBjYWxsZWRcbiAqIEBwYXJhbSBvTW9kZWwgT0RhdGEgTW9kZWxcbiAqIEBwYXJhbSBvQXBwQ29tcG9uZW50IFRoZSBBcHBDb21wb25lbnRcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnNdIE9wdGlvbmFsLCBjYW4gY29udGFpbiB0aGUgZm9sbG93aW5nIGF0dHJpYnV0ZXM6XG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLnBhcmFtZXRlclZhbHVlc10gQSBtYXAgb2YgYWN0aW9uIHBhcmFtZXRlciBuYW1lcyBhbmQgcHJvdmlkZWQgdmFsdWVzXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVyc10gQSBtYXAgb2YgYmluZGluZyBwYXJhbWV0ZXJzIHRoYXQgd291bGQgYmUgcGFydCBvZiAkc2VsZWN0IGFuZCAkZXhwYW5kIGNvbWluZyBmcm9tIHNpZGUgZWZmZWN0cyBmb3IgYm91bmQgYWN0aW9uc1xuICogQHBhcmFtIFttUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdF0gQXJyYXkgb2YgcHJvcGVydHkgcGF0aHMgdG8gYmUgcmVxdWVzdGVkIGluIGFkZGl0aW9uIHRvIGFjdHVhbCB0YXJnZXQgcHJvcGVydGllcyBvZiB0aGUgc2lkZSBlZmZlY3RcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuc2hvd0FjdGlvblBhcmFtZXRlckRpYWxvZ10gSWYgc2V0IGFuZCBpZiBwYXJhbWV0ZXJzIGV4aXN0IHRoZSB1c2VyIHJldHJpZXZlcyBhIGRpYWxvZyB0byBmaWxsIGluIHBhcmFtZXRlcnMsIGlmIGFjdGlvblBhcmFtZXRlcnMgYXJlIHBhc3NlZCB0aGV5IGFyZSBzaG93biB0byB0aGUgdXNlclxuICogQHBhcmFtIFttUGFyYW1ldGVycy5sYWJlbF0gQSBodW1hbi1yZWFkYWJsZSBsYWJlbCBmb3IgdGhlIGFjdGlvblxuICogQHBhcmFtIFttUGFyYW1ldGVycy5pbnZvY2F0aW9uR3JvdXBpbmddIE1vZGUgaG93IGFjdGlvbnMgYXJlIHRvIGJlIGNhbGxlZDogQ2hhbmdlc2V0IHRvIHB1dCBhbGwgYWN0aW9uIGNhbGxzIGludG8gb25lIGNoYW5nZXNldCwgSXNvbGF0ZWQgdG8gcHV0IHRoZW0gaW50byBzZXBhcmF0ZSBjaGFuZ2VzZXRzLCBkZWZhdWx0cyB0byBJc29sYXRlZFxuICogQHBhcmFtIFttUGFyYW1ldGVycy5vblN1Ym1pdHRlZF0gRnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIG9uY2UgdGhlIGFjdGlvbnMgYXJlIHN1Ym1pdHRlZCB3aXRoIGFuIGFycmF5IG9mIHByb21pc2VzXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmRlZmF1bHRQYXJhbWV0ZXJzXSBDYW4gY29udGFpbiBkZWZhdWx0IHBhcmFtZXRlcnMgZnJvbSBGTFAgdXNlciBkZWZhdWx0c1xuICogQHBhcmFtIFttUGFyYW1ldGVycy5wYXJlbnRDb250cm9sXSBJZiBzcGVjaWZpZWQsIHRoZSBkaWFsb2dzIGFyZSBhZGRlZCBhcyBkZXBlbmRlbnQgb2YgdGhlIHBhcmVudCBjb250cm9sXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmJHZXRCb3VuZENvbnRleHRdIElmIHNwZWNpZmllZCwgdGhlIGFjdGlvbiBwcm9taXNlIHJldHVybnMgdGhlIGJvdW5kIGNvbnRleHRcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCBhbiBhcnJheSBvZiByZXNwb25zZSBvYmplY3RzIChUT0RPOiB0byBiZSBjaGFuZ2VkKVxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBjYWxsQm91bmRBY3Rpb24oc0FjdGlvbk5hbWU6IHN0cmluZywgY29udGV4dHM6IGFueSwgb01vZGVsOiBhbnksIG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRpZiAoIWNvbnRleHRzIHx8IGNvbnRleHRzLmxlbmd0aCA9PT0gMCkge1xuXHRcdC8vSW4gRnJlZXN0eWxlIGFwcHMgYm91bmQgYWN0aW9ucyBjYW4gaGF2ZSBubyBjb250ZXh0XG5cdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KFwiQm91bmQgYWN0aW9ucyBhbHdheXMgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGNvbnRleHRcIik7XG5cdH1cblx0Ly8gdGhpcyBtZXRob2QgZWl0aGVyIGFjY2VwdHMgc2luZ2xlIGNvbnRleHQgb3IgYW4gYXJyYXkgb2YgY29udGV4dHNcblx0Ly8gVE9ETzogUmVmYWN0b3IgdG8gYW4gdW5hbWJpZ3VvcyBBUElcblx0Y29uc3QgaXNDYWxsZWRXaXRoQXJyYXkgPSBBcnJheS5pc0FycmF5KGNvbnRleHRzKTtcblxuXHQvLyBpbiBjYXNlIG9mIHNpbmdsZSBjb250ZXh0IHdyYXAgaW50byBhbiBhcnJheSBmb3IgY2FsbGVkIG1ldGhvZHMgKGVzcC4gY2FsbEFjdGlvbilcblx0bVBhcmFtZXRlcnMuYUNvbnRleHRzID0gaXNDYWxsZWRXaXRoQXJyYXkgPyBjb250ZXh0cyA6IFtjb250ZXh0c107XG5cblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHQvLyBBbmFseXppbmcgbWV0YU1vZGVsUGF0aCBmb3IgYWN0aW9uIG9ubHkgZnJvbSBmaXJzdCBjb250ZXh0IHNlZW1zIHdlaXJkLCBidXQgcHJvYmFibHkgd29ya3MgaW4gYWxsIGV4aXN0aW5nIHN6ZW5hcmlvcyAtIGlmIHNldmVyYWwgY29udGV4dHMgYXJlIHBhc3NlZCwgdGhleSBwcm9iYWJseVxuXHRcdC8vIGJlbG9uZyB0byB0aGUgc2FtZSBtZXRhbW9kZWxwYXRoLiBUT0RPOiBDaGVjaywgd2hldGhlciB0aGlzIGNhbiBiZSBpbXByb3ZlZCAvIHN6ZW5hcmlvcyB3aXRoIGRpZmZlcmVudCBtZXRhTW9kZWxQYXRocyBtaWdodCBleGlzdFxuXHRcdHNBY3Rpb25QYXRoID0gYCR7b01ldGFNb2RlbC5nZXRNZXRhUGF0aChtUGFyYW1ldGVycy5hQ29udGV4dHNbMF0uZ2V0UGF0aCgpKX0vJHtzQWN0aW9uTmFtZX1gLFxuXHRcdG9Cb3VuZEFjdGlvbiA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYCR7c0FjdGlvblBhdGh9L0AkdWk1Lm92ZXJsb2FkLzBgKTtcblx0bVBhcmFtZXRlcnMuaXNDcml0aWNhbEFjdGlvbiA9IGdldElzQWN0aW9uQ3JpdGljYWwob01ldGFNb2RlbCwgc0FjdGlvblBhdGgsIG1QYXJhbWV0ZXJzLmFDb250ZXh0cywgb0JvdW5kQWN0aW9uKTtcblxuXHQvLyBQcm9taXNlIHJldHVybmVkIGJ5IGNhbGxBY3Rpb24gY3VycmVudGx5IGlzIHJlamVjdGVkIGluIGNhc2Ugb2YgZXhlY3V0aW9uIGZvciBtdWx0aXBsZSBjb250ZXh0cyBwYXJ0bHkgZmFpbGluZy4gVGhpcyBzaG91bGQgYmUgY2hhbmdlZCAoc29tZSBmYWlsaW5nIGNvbnRleHRzIGRvIG5vdCBtZWFuXG5cdC8vIHRoYXQgZnVuY3Rpb24gZGlkIG5vdCBmdWxmaWxsIGl0cyB0YXNrKSwgYnV0IGFzIHRoaXMgaXMgYSBiaWdnZXIgcmVmYWN0b3JpbmcsIGZvciB0aGUgdGltZSBiZWluZyB3ZSBuZWVkIHRvIGRlYWwgd2l0aCB0aGF0IGF0IHRoZSBjYWxsaW5nIHBsYWNlIChpLmUuIGhlcmUpXG5cdC8vID0+IHByb3ZpZGUgdGhlIHNhbWUgaGFuZGxlciAobWFwcGluZyBiYWNrIGZyb20gYXJyYXkgdG8gc2luZ2xlIHJlc3VsdC9lcnJvciBpZiBuZWVkZWQpIGZvciByZXNvbHZlZC9yZWplY3RlZCBjYXNlXG5cdGNvbnN0IGV4dHJhY3RTaW5nbGVSZXN1bHQgPSBmdW5jdGlvbiAocmVzdWx0OiBhbnkpIHtcblx0XHQvLyBzaW5nbGUgYWN0aW9uIGNvdWxkIGJlIHJlc29sdmVkIG9yIHJlamVjdGVkXG5cdFx0aWYgKHJlc3VsdFswXS5zdGF0dXMgPT09IFwiZnVsZmlsbGVkXCIpIHtcblx0XHRcdHJldHVybiByZXN1bHRbMF0udmFsdWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEluIGNhc2Ugb2YgZGlhbG9nIGNhbmNlbGxhdGlvbiwgbm8gYXJyYXkgaXMgcmV0dXJuZWQgPT4gdGhyb3cgdGhlIHJlc3VsdC5cblx0XHRcdC8vIElkZWFsbHksIGRpZmZlcmVudGlhdGluZyBzaG91bGQgbm90IGJlIG5lZWRlZCBoZXJlID0+IFRPRE86IEZpbmQgYmV0dGVyIHNvbHV0aW9uIHdoZW4gc2VwYXJhdGluZyBkaWFsb2cgaGFuZGxpbmcgKHNpbmdsZSBvYmplY3Qgd2l0aCBzaW5nbGUgcmVzdWx0KSBmcm9tIGJhY2tlbmRcblx0XHRcdC8vIGV4ZWN1dGlvbiAocG90ZW50aWFsbHkgbXVsdGlwbGUgb2JqZWN0cylcblx0XHRcdHRocm93IHJlc3VsdFswXS5yZWFzb24gfHwgcmVzdWx0O1xuXHRcdH1cblx0fTtcblxuXHRyZXR1cm4gY2FsbEFjdGlvbihzQWN0aW9uTmFtZSwgb01vZGVsLCBvQm91bmRBY3Rpb24sIG9BcHBDb21wb25lbnQsIG1QYXJhbWV0ZXJzKS50aGVuKFxuXHRcdChyZXN1bHQ6IGFueSkgPT4ge1xuXHRcdFx0aWYgKGlzQ2FsbGVkV2l0aEFycmF5KSB7XG5cdFx0XHRcdHJldHVybiByZXN1bHQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gZXh0cmFjdFNpbmdsZVJlc3VsdChyZXN1bHQpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0KHJlc3VsdDogYW55KSA9PiB7XG5cdFx0XHRpZiAoaXNDYWxsZWRXaXRoQXJyYXkpIHtcblx0XHRcdFx0dGhyb3cgcmVzdWx0O1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGV4dHJhY3RTaW5nbGVSZXN1bHQocmVzdWx0KTtcblx0XHRcdH1cblx0XHR9XG5cdCk7XG59XG4vKipcbiAqIENhbGxzIGFuIGFjdGlvbiBpbXBvcnQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAc3RhdGljXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLm9wZXJhdGlvbnMuY2FsbEFjdGlvbkltcG9ydFxuICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9uc1xuICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24gaW1wb3J0IHRvIGJlIGNhbGxlZFxuICogQHBhcmFtIG9Nb2RlbCBBbiBpbnN0YW5jZSBvZiBhbiBPRGF0YSBWNCBtb2RlbFxuICogQHBhcmFtIG9BcHBDb21wb25lbnQgVGhlIEFwcENvbXBvbmVudFxuICogQHBhcmFtIFttUGFyYW1ldGVyc10gT3B0aW9uYWwsIGNhbiBjb250YWluIHRoZSBmb2xsb3dpbmcgYXR0cmlidXRlczpcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMucGFyYW1ldGVyVmFsdWVzXSBBIG1hcCBvZiBhY3Rpb24gcGFyYW1ldGVyIG5hbWVzIGFuZCBwcm92aWRlZCB2YWx1ZXNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMubGFiZWxdIEEgaHVtYW4tcmVhZGFibGUgbGFiZWwgZm9yIHRoZSBhY3Rpb25cbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuc2hvd0FjdGlvblBhcmFtZXRlckRpYWxvZ10gSWYgc2V0IGFuZCBpZiBwYXJhbWV0ZXJzIGV4aXN0IHRoZSB1c2VyIHJldHJpZXZlcyBhIGRpYWxvZyB0byBmaWxsIGluIHBhcmFtZXRlcnMsIGlmIGFjdGlvblBhcmFtZXRlcnMgYXJlIHBhc3NlZCB0aGV5IGFyZSBzaG93biB0byB0aGUgdXNlclxuICogQHBhcmFtIFttUGFyYW1ldGVycy5vblN1Ym1pdHRlZF0gRnVuY3Rpb24gd2hpY2ggaXMgY2FsbGVkIG9uY2UgdGhlIGFjdGlvbnMgYXJlIHN1Ym1pdHRlZCB3aXRoIGFuIGFycmF5IG9mIHByb21pc2VzXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmRlZmF1bHRQYXJhbWV0ZXJzXSBDYW4gY29udGFpbiBkZWZhdWx0IHBhcmFtZXRlcnMgZnJvbSBGTFAgdXNlciBkZWZhdWx0c1xuICogQHJldHVybnMgUHJvbWlzZSByZXNvbHZlcyB3aXRoIGFuIGFycmF5IG9mIHJlc3BvbnNlIG9iamVjdHMgKFRPRE86IHRvIGJlIGNoYW5nZWQpXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGNhbGxBY3Rpb25JbXBvcnQoc0FjdGlvbk5hbWU6IHN0cmluZywgb01vZGVsOiBhbnksIG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRpZiAoIW9Nb2RlbCkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcIkFjdGlvbiBleHBlY3RzIGEgbW9kZWwvY29udGV4dCBmb3IgZXhlY3V0aW9uXCIpO1xuXHR9XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0c0FjdGlvblBhdGggPSBvTW9kZWwuYmluZENvbnRleHQoYC8ke3NBY3Rpb25OYW1lfWApLmdldFBhdGgoKSxcblx0XHRvQWN0aW9uSW1wb3J0ID0gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgLyR7b01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzQWN0aW9uUGF0aCkuZ2V0T2JqZWN0KFwiJEFjdGlvblwiKX0vMGApO1xuXHRtUGFyYW1ldGVycy5pc0NyaXRpY2FsQWN0aW9uID0gZ2V0SXNBY3Rpb25Dcml0aWNhbChvTWV0YU1vZGVsLCBgJHtzQWN0aW9uUGF0aH0vQCR1aTUub3ZlcmxvYWRgKTtcblx0cmV0dXJuIGNhbGxBY3Rpb24oc0FjdGlvbk5hbWUsIG9Nb2RlbCwgb0FjdGlvbkltcG9ydCwgb0FwcENvbXBvbmVudCwgbVBhcmFtZXRlcnMpO1xufVxuZnVuY3Rpb24gY2FsbEJvdW5kRnVuY3Rpb24oc0Z1bmN0aW9uTmFtZTogc3RyaW5nLCBjb250ZXh0OiBhbnksIG9Nb2RlbDogYW55KSB7XG5cdGlmICghY29udGV4dCkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlamVjdChcIkJvdW5kIGZ1bmN0aW9ucyBhbHdheXMgcmVxdWlyZXMgYSBjb250ZXh0XCIpO1xuXHR9XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0c0Z1bmN0aW9uUGF0aCA9IGAke29NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoY29udGV4dC5nZXRQYXRoKCkpfS8ke3NGdW5jdGlvbk5hbWV9YCxcblx0XHRvQm91bmRGdW5jdGlvbiA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Z1bmN0aW9uUGF0aCk7XG5cdHJldHVybiBfZXhlY3V0ZUZ1bmN0aW9uKHNGdW5jdGlvbk5hbWUsIG9Nb2RlbCwgb0JvdW5kRnVuY3Rpb24sIGNvbnRleHQpO1xufVxuLyoqXG4gKiBDYWxscyBhIGZ1bmN0aW9uIGltcG9ydC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9ucy5jYWxsRnVuY3Rpb25JbXBvcnRcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLm9wZXJhdGlvbnNcbiAqIEBwYXJhbSBzRnVuY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBmdW5jdGlvbiB0byBiZSBjYWxsZWRcbiAqIEBwYXJhbSBvTW9kZWwgQW4gaW5zdGFuY2Ugb2YgYW4gT0RhdGEgdjQgbW9kZWxcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXNcbiAqIEBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGNhbGxGdW5jdGlvbkltcG9ydChzRnVuY3Rpb25OYW1lOiBzdHJpbmcsIG9Nb2RlbDogYW55KSB7XG5cdGlmICghc0Z1bmN0aW9uTmFtZSkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxuXHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdHNGdW5jdGlvblBhdGggPSBvTW9kZWwuYmluZENvbnRleHQoYC8ke3NGdW5jdGlvbk5hbWV9YCkuZ2V0UGF0aCgpLFxuXHRcdG9GdW5jdGlvbkltcG9ydCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYC8ke29NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0Z1bmN0aW9uUGF0aCkuZ2V0T2JqZWN0KFwiJEZ1bmN0aW9uXCIpfS8wYCk7XG5cdHJldHVybiBfZXhlY3V0ZUZ1bmN0aW9uKHNGdW5jdGlvbk5hbWUsIG9Nb2RlbCwgb0Z1bmN0aW9uSW1wb3J0KTtcbn1cbmZ1bmN0aW9uIF9leGVjdXRlRnVuY3Rpb24oc0Z1bmN0aW9uTmFtZTogYW55LCBvTW9kZWw6IGFueSwgb0Z1bmN0aW9uOiBhbnksIGNvbnRleHQ/OiBhbnkpIHtcblx0bGV0IHNHcm91cElkO1xuXHRpZiAoIW9GdW5jdGlvbiB8fCAhb0Z1bmN0aW9uLmdldE9iamVjdCgpKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgRnVuY3Rpb24gJHtzRnVuY3Rpb25OYW1lfSBub3QgZm91bmRgKSk7XG5cdH1cblx0aWYgKGNvbnRleHQpIHtcblx0XHRvRnVuY3Rpb24gPSBvTW9kZWwuYmluZENvbnRleHQoYCR7c0Z1bmN0aW9uTmFtZX0oLi4uKWAsIGNvbnRleHQpO1xuXHRcdHNHcm91cElkID0gXCJmdW5jdGlvbkdyb3VwXCI7XG5cdH0gZWxzZSB7XG5cdFx0b0Z1bmN0aW9uID0gb01vZGVsLmJpbmRDb250ZXh0KGAvJHtzRnVuY3Rpb25OYW1lfSguLi4pYCk7XG5cdFx0c0dyb3VwSWQgPSBcImZ1bmN0aW9uSW1wb3J0XCI7XG5cdH1cblx0Y29uc3Qgb0Z1bmN0aW9uUHJvbWlzZSA9IG9GdW5jdGlvbi5leGVjdXRlKHNHcm91cElkKTtcblx0b01vZGVsLnN1Ym1pdEJhdGNoKHNHcm91cElkKTtcblx0cmV0dXJuIG9GdW5jdGlvblByb21pc2UudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIG9GdW5jdGlvbi5nZXRCb3VuZENvbnRleHQoKTtcblx0fSk7XG59XG5mdW5jdGlvbiBjYWxsQWN0aW9uKHNBY3Rpb25OYW1lOiBhbnksIG9Nb2RlbDogYW55LCBvQWN0aW9uOiBhbnksIG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgbVBhcmFtZXRlcnM6IGFueSkge1xuXHRyZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgZnVuY3Rpb24gKHJlc29sdmU6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQpIHtcblx0XHRsZXQgbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnM6IGFueSA9IHt9O1xuXHRcdGxldCBmbkRpYWxvZztcblx0XHRsZXQgb0FjdGlvblByb21pc2U7XG5cdFx0Ly9sZXQgZmFpbGVkQWN0aW9uUHJvbWlzZTogYW55O1xuXHRcdGNvbnN0IHNBY3Rpb25MYWJlbCA9IG1QYXJhbWV0ZXJzLmxhYmVsO1xuXHRcdGNvbnN0IGJTa2lwUGFyYW1ldGVyRGlhbG9nID0gbVBhcmFtZXRlcnMuc2tpcFBhcmFtZXRlckRpYWxvZztcblx0XHRjb25zdCBhQ29udGV4dHMgPSBtUGFyYW1ldGVycy5hQ29udGV4dHM7XG5cdFx0Y29uc3QgYklzQ3JlYXRlQWN0aW9uID0gbVBhcmFtZXRlcnMuYklzQ3JlYXRlQWN0aW9uO1xuXHRcdGNvbnN0IGJJc0NyaXRpY2FsQWN0aW9uID0gbVBhcmFtZXRlcnMuaXNDcml0aWNhbEFjdGlvbjtcblx0XHRsZXQgb01ldGFNb2RlbDtcblx0XHRsZXQgc01ldGFQYXRoO1xuXHRcdGxldCBzTWVzc2FnZXNQYXRoOiBhbnk7XG5cdFx0bGV0IGlNZXNzYWdlU2lkZUVmZmVjdDtcblx0XHRsZXQgYklzU2FtZUVudGl0eTtcblx0XHRsZXQgb1JldHVyblR5cGU7XG5cdFx0bGV0IGJWYWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnM7XG5cdFx0Y29uc3QgYWN0aW9uRGVmaW5pdGlvbiA9IG9BY3Rpb24uZ2V0T2JqZWN0KCk7XG5cdFx0aWYgKCFvQWN0aW9uIHx8ICFvQWN0aW9uLmdldE9iamVjdCgpKSB7XG5cdFx0XHRyZXR1cm4gcmVqZWN0KG5ldyBFcnJvcihgQWN0aW9uICR7c0FjdGlvbk5hbWV9IG5vdCBmb3VuZGApKTtcblx0XHR9XG5cblx0XHQvLyBHZXQgdGhlIHBhcmFtZXRlcnMgb2YgdGhlIGFjdGlvblxuXHRcdGNvbnN0IGFBY3Rpb25QYXJhbWV0ZXJzID0gZ2V0QWN0aW9uUGFyYW1ldGVycyhvQWN0aW9uKTtcblxuXHRcdC8vIENoZWNrIGlmIHRoZSBhY3Rpb24gaGFzIHBhcmFtZXRlcnMgYW5kIHdvdWxkIG5lZWQgYSBwYXJhbWV0ZXIgZGlhbG9nXG5cdFx0Ly8gVGhlIHBhcmFtZXRlciBSZXN1bHRJc0FjdGl2ZUVudGl0eSBpcyBhbHdheXMgaGlkZGVuIGluIHRoZSBkaWFsb2chIEhlbmNlIGlmXG5cdFx0Ly8gdGhpcyBpcyB0aGUgb25seSBwYXJhbWV0ZXIsIHRoaXMgaXMgdHJlYXRlZCBhcyBubyBwYXJhbWV0ZXIgaGVyZSBiZWNhdXNlIHRoZVxuXHRcdC8vIGRpYWxvZyB3b3VsZCBiZSBlbXB0eSFcblx0XHQvLyBGSVhNRTogU2hvdWxkIG9ubHkgaWdub3JlIHRoaXMgaWYgdGhpcyBpcyBhICdjcmVhdGUnIGFjdGlvbiwgb3RoZXJ3aXNlIGl0IGlzIGp1c3Qgc29tZSBub3JtYWwgcGFyYW1ldGVyIHRoYXQgaGFwcGVucyB0byBoYXZlIHRoaXMgbmFtZVxuXHRcdGNvbnN0IGJBY3Rpb25OZWVkc1BhcmFtZXRlckRpYWxvZyA9XG5cdFx0XHRhQWN0aW9uUGFyYW1ldGVycy5sZW5ndGggPiAwICYmICEoYUFjdGlvblBhcmFtZXRlcnMubGVuZ3RoID09PSAxICYmIGFBY3Rpb25QYXJhbWV0ZXJzWzBdLiROYW1lID09PSBcIlJlc3VsdElzQWN0aXZlRW50aXR5XCIpO1xuXG5cdFx0Ly8gUHJvdmlkZWQgdmFsdWVzIGZvciB0aGUgYWN0aW9uIHBhcmFtZXRlcnMgZnJvbSBpbnZva2VBY3Rpb24gY2FsbFxuXHRcdGNvbnN0IGFQYXJhbWV0ZXJWYWx1ZXMgPSBtUGFyYW1ldGVycy5wYXJhbWV0ZXJWYWx1ZXM7XG5cblx0XHQvLyBEZXRlcm1pbmUgc3RhcnR1cCBwYXJhbWV0ZXJzIGlmIHByb3ZpZGVkXG5cdFx0Y29uc3Qgb0NvbXBvbmVudERhdGEgPSBvQXBwQ29tcG9uZW50LmdldENvbXBvbmVudERhdGEoKTtcblx0XHRjb25zdCBvU3RhcnR1cFBhcmFtZXRlcnMgPSAob0NvbXBvbmVudERhdGEgJiYgb0NvbXBvbmVudERhdGEuc3RhcnR1cFBhcmFtZXRlcnMpIHx8IHt9O1xuXG5cdFx0Ly8gSW4gY2FzZSBhbiBhY3Rpb24gcGFyYW1ldGVyIGlzIG5lZWRlZCwgYW5kIHdlIHNoYWxsIHNraXAgdGhlIGRpYWxvZywgY2hlY2sgaWYgdmFsdWVzIGFyZSBwcm92aWRlZCBmb3IgYWxsIHBhcmFtZXRlcnNcblx0XHRpZiAoYkFjdGlvbk5lZWRzUGFyYW1ldGVyRGlhbG9nICYmIGJTa2lwUGFyYW1ldGVyRGlhbG9nKSB7XG5cdFx0XHRiVmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzID0gX3ZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycyhcblx0XHRcdFx0YklzQ3JlYXRlQWN0aW9uLFxuXHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0YVBhcmFtZXRlclZhbHVlcyxcblx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdC8vIERlcGVuZGluZyBvbiB0aGUgcHJldmlvdXNseSBkZXRlcm1pbmVkIGRhdGEsIGVpdGhlciBzZXQgYSBkaWFsb2cgb3IgbGVhdmUgaXQgZW1wdHkgd2hpY2hcblx0XHQvLyB3aWxsIGxlYWQgdG8gZGlyZWN0IGV4ZWN1dGlvbiBvZiB0aGUgYWN0aW9uIHdpdGhvdXQgYSBkaWFsb2dcblx0XHRmbkRpYWxvZyA9IG51bGw7XG5cdFx0aWYgKGJBY3Rpb25OZWVkc1BhcmFtZXRlckRpYWxvZykge1xuXHRcdFx0aWYgKCEoYlNraXBQYXJhbWV0ZXJEaWFsb2cgJiYgYlZhbHVlc1Byb3ZpZGVkRm9yQWxsUGFyYW1ldGVycykpIHtcblx0XHRcdFx0Zm5EaWFsb2cgPSBzaG93QWN0aW9uUGFyYW1ldGVyRGlhbG9nO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAoYklzQ3JpdGljYWxBY3Rpb24pIHtcblx0XHRcdGZuRGlhbG9nID0gY29uZmlybUNyaXRpY2FsQWN0aW9uO1xuXHRcdH1cblxuXHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzID0ge1xuXHRcdFx0Zm5PblN1Ym1pdHRlZDogbVBhcmFtZXRlcnMub25TdWJtaXR0ZWQsXG5cdFx0XHRmbk9uUmVzcG9uc2U6IG1QYXJhbWV0ZXJzLm9uUmVzcG9uc2UsXG5cdFx0XHRhY3Rpb25OYW1lOiBzQWN0aW9uTmFtZSxcblx0XHRcdG1vZGVsOiBvTW9kZWwsXG5cdFx0XHRhQWN0aW9uUGFyYW1ldGVyczogYUFjdGlvblBhcmFtZXRlcnMsXG5cdFx0XHRiR2V0Qm91bmRDb250ZXh0OiBtUGFyYW1ldGVycy5iR2V0Qm91bmRDb250ZXh0LFxuXHRcdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBtUGFyYW1ldGVycy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24sXG5cdFx0XHRsYWJlbDogbVBhcmFtZXRlcnMubGFiZWwsXG5cdFx0XHRzZWxlY3RlZEl0ZW1zOiBtUGFyYW1ldGVycy5zZWxlY3RlZEl0ZW1zXG5cdFx0fTtcblx0XHRpZiAob0FjdGlvbi5nZXRPYmplY3QoXCIkSXNCb3VuZFwiKSkge1xuXHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0ICYmIG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucykge1xuXHRcdFx0XHRvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKGFDb250ZXh0c1swXS5nZXRQYXRoKCkpO1xuXHRcdFx0XHRzTWVzc2FnZXNQYXRoID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1lc3NhZ2VzLyRQYXRoYCk7XG5cblx0XHRcdFx0aWYgKHNNZXNzYWdlc1BhdGgpIHtcblx0XHRcdFx0XHRpTWVzc2FnZVNpZGVFZmZlY3QgPSBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMuZmluZEluZGV4KGZ1bmN0aW9uIChleHA6IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHR5cGVvZiBleHAgPT09IFwic3RyaW5nXCIgJiYgZXhwID09PSBzTWVzc2FnZXNQYXRoO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0Ly8gQWRkIFNBUF9NZXNzYWdlcyBieSBkZWZhdWx0IGlmIG5vdCBhbm5vdGF0ZWQgYnkgc2lkZSBlZmZlY3RzLCBhY3Rpb24gZG9lcyBub3QgcmV0dXJuIGEgY29sbGVjdGlvbiBhbmRcblx0XHRcdFx0XHQvLyB0aGUgcmV0dXJuIHR5cGUgaXMgdGhlIHNhbWUgYXMgdGhlIGJvdW5kIHR5cGVcblx0XHRcdFx0XHRvUmV0dXJuVHlwZSA9IG9BY3Rpb24uZ2V0T2JqZWN0KFwiJFJldHVyblR5cGVcIik7XG5cdFx0XHRcdFx0YklzU2FtZUVudGl0eSA9XG5cdFx0XHRcdFx0XHRvUmV0dXJuVHlwZSAmJiAhb1JldHVyblR5cGUuJGlzQ29sbGVjdGlvbiAmJiBvQWN0aW9uLmdldE1vZGVsKCkuZ2V0T2JqZWN0KHNNZXRhUGF0aCkuJFR5cGUgPT09IG9SZXR1cm5UeXBlLiRUeXBlO1xuXG5cdFx0XHRcdFx0aWYgKGlNZXNzYWdlU2lkZUVmZmVjdCA+IC0xIHx8IGJJc1NhbWVFbnRpdHkpIHtcblx0XHRcdFx0XHRcdC8vIHRoZSBtZXNzYWdlIHBhdGggaXMgYW5ub3RhdGVkIGFzIHNpZGUgZWZmZWN0LiBBcyB0aGVyZSdzIG5vIGJpbmRpbmcgZm9yIGl0IGFuZCB0aGUgbW9kZWwgZG9lcyBjdXJyZW50bHkgbm90IGFsbG93XG5cdFx0XHRcdFx0XHQvLyB0byBhZGQgaXQgYXQgYSBsYXRlciBwb2ludCBvZiB0aW1lIHdlIGhhdmUgdG8gdGFrZSBjYXJlIGl0J3MgcGFydCBvZiB0aGUgJHNlbGVjdCBvZiB0aGUgUE9TVCwgdGhlcmVmb3JlIG1vdmluZyBpdC5cblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycyB8fCB7fTtcblxuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRvQWN0aW9uLmdldE9iamVjdChgJFJldHVyblR5cGUvJFR5cGUvJHtzTWVzc2FnZXNQYXRofWApICYmXG5cdFx0XHRcdFx0XHRcdCghbVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzLiRzZWxlY3QgfHxcblx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5tQmluZGluZ1BhcmFtZXRlcnMuJHNlbGVjdC5zcGxpdChcIixcIikuaW5kZXhPZihzTWVzc2FnZXNQYXRoKSA9PT0gLTEpXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzLiRzZWxlY3QgPSBtUGFyYW1ldGVycy5tQmluZGluZ1BhcmFtZXRlcnMuJHNlbGVjdFxuXHRcdFx0XHRcdFx0XHRcdD8gYCR7bVBhcmFtZXRlcnMubUJpbmRpbmdQYXJhbWV0ZXJzLiRzZWxlY3R9LCR7c01lc3NhZ2VzUGF0aH1gXG5cdFx0XHRcdFx0XHRcdFx0OiBzTWVzc2FnZXNQYXRoO1xuXHRcdFx0XHRcdFx0XHQvLyBBZGQgc2lkZSBlZmZlY3RzIGF0IGVudGl0eSBsZXZlbCBiZWNhdXNlICRzZWxlY3Qgc3RvcHMgdGhlc2UgYmVpbmcgcmV0dXJuZWQgYnkgdGhlIGFjdGlvblxuXHRcdFx0XHRcdFx0XHQvLyBPbmx5IGlmIG5vIG90aGVyIHNpZGUgZWZmZWN0cyB3ZXJlIGFkZGVkIGZvciBNZXNzYWdlc1xuXHRcdFx0XHRcdFx0XHRpZiAoaU1lc3NhZ2VTaWRlRWZmZWN0ID09PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucy5wdXNoKFwiKlwiKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC50cmlnZ2VyQWN0aW9ucy5sZW5ndGggPT09IDAgJiYgaU1lc3NhZ2VTaWRlRWZmZWN0ID4gLTEpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBubyB0cmlnZ2VyIGFjdGlvbiB0aGVyZWZvcmUgbm8gbmVlZCB0byByZXF1ZXN0IG1lc3NhZ2VzIGFnYWluXG5cdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3QucGF0aEV4cHJlc3Npb25zLnNwbGljZShpTWVzc2FnZVNpZGVFZmZlY3QsIDEpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFDb250ZXh0cyA9IGFDb250ZXh0cztcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycyA9IG1QYXJhbWV0ZXJzLm1CaW5kaW5nUGFyYW1ldGVycztcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFkZGl0aW9uYWxTaWRlRWZmZWN0ID0gbVBhcmFtZXRlcnMuYWRkaXRpb25hbFNpZGVFZmZlY3Q7XG5cdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5iR3JvdXBlZCA9IG1QYXJhbWV0ZXJzLmludm9jYXRpb25Hcm91cGluZyA9PT0gSW52b2NhdGlvbkdyb3VwaW5nLkNoYW5nZVNldDtcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0ID0gbVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5vcGVyYXRpb25BdmFpbGFibGVNYXAgPSBtUGFyYW1ldGVycy5vcGVyYXRpb25BdmFpbGFibGVNYXA7XG5cdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5pc0NyZWF0ZUFjdGlvbiA9IGJJc0NyZWF0ZUFjdGlvbjtcblx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmJPYmplY3RQYWdlID0gbVBhcmFtZXRlcnMuYk9iamVjdFBhZ2U7XG5cdFx0XHRpZiAobVBhcmFtZXRlcnMuY29udHJvbElkKSB7XG5cdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmNvbnRyb2wgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLmJ5SWQobVBhcmFtZXRlcnMuY29udHJvbElkKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmNvbnRyb2wgPSBtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoYklzQ3JlYXRlQWN0aW9uKSB7XG5cdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5iSXNDcmVhdGVBY3Rpb24gPSBiSXNDcmVhdGVBY3Rpb247XG5cdFx0fVxuXHRcdC8vY2hlY2sgZm9yIHNraXBwaW5nIHN0YXRpYyBhY3Rpb25zXG5cdFx0Y29uc3QgaXNTdGF0aWMgPSAoYWN0aW9uRGVmaW5pdGlvbi4kUGFyYW1ldGVyIHx8IFtdKS5zb21lKChhUGFyYW1ldGVyOiBhbnkpID0+IHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdCgoYWN0aW9uRGVmaW5pdGlvbi4kRW50aXR5U2V0UGF0aCAmJiBhY3Rpb25EZWZpbml0aW9uLiRFbnRpdHlTZXRQYXRoID09PSBhUGFyYW1ldGVyLiROYW1lKSB8fCBhY3Rpb25EZWZpbml0aW9uLiRJc0JvdW5kKSAmJlxuXHRcdFx0XHRhUGFyYW1ldGVyLiRpc0NvbGxlY3Rpb25cblx0XHRcdCk7XG5cdFx0fSk7XG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaXNTdGF0aWMgPSBpc1N0YXRpYztcblx0XHRpZiAoZm5EaWFsb2cpIHtcblx0XHRcdG9BY3Rpb25Qcm9taXNlID0gZm5EaWFsb2coXG5cdFx0XHRcdHNBY3Rpb25OYW1lLFxuXHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRzQWN0aW9uTGFiZWwsXG5cdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLFxuXHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0YVBhcmFtZXRlclZhbHVlcyxcblx0XHRcdFx0b0FjdGlvbixcblx0XHRcdFx0bVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCxcblx0XHRcdFx0bVBhcmFtZXRlcnMuZW50aXR5U2V0TmFtZSxcblx0XHRcdFx0bVBhcmFtZXRlcnMubWVzc2FnZUhhbmRsZXJcblx0XHRcdCk7XG5cdFx0XHRyZXR1cm4gb0FjdGlvblByb21pc2Vcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9PcGVyYXRpb25SZXN1bHQ6IGFueSkge1xuXHRcdFx0XHRcdGFmdGVyQWN0aW9uUmVzb2x1dGlvbihtUGFyYW1ldGVycywgbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMsIGFjdGlvbkRlZmluaXRpb24pO1xuXHRcdFx0XHRcdHJlc29sdmUob09wZXJhdGlvblJlc3VsdCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob09wZXJhdGlvblJlc3VsdDogYW55KSB7XG5cdFx0XHRcdFx0cmVqZWN0KG9PcGVyYXRpb25SZXN1bHQpO1xuXHRcdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gVGFrZSBvdmVyIGFsbCBwcm92aWRlZCBwYXJhbWV0ZXIgdmFsdWVzIGFuZCBjYWxsIHRoZSBhY3Rpb24uXG5cdFx0XHQvLyBUaGlzIHNoYWxsIG9ubHkgaGFwcGVuIGlmIHZhbHVlcyBhcmUgcHJvdmlkZWQgZm9yIGFsbCB0aGUgcGFyYW1ldGVycywgb3RoZXJ3aXNlIHRoZSBwYXJhbWV0ZXIgZGlhbG9nIHNoYWxsIGJlIHNob3duIHdoaWNoIGlzIGVuc3VyZWQgZWFybGllclxuXHRcdFx0aWYgKGFQYXJhbWV0ZXJWYWx1ZXMpIHtcblx0XHRcdFx0Zm9yIChjb25zdCBpIGluIG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmFBY3Rpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnNbaV0udmFsdWUgPSBhUGFyYW1ldGVyVmFsdWVzPy5maW5kKFxuXHRcdFx0XHRcdFx0KGVsZW1lbnQ6IGFueSkgPT4gZWxlbWVudC5uYW1lID09PSBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5hQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZVxuXHRcdFx0XHRcdCk/LnZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb3IgKGNvbnN0IGkgaW4gbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5hQWN0aW9uUGFyYW1ldGVyc1tpXS52YWx1ZSA9XG5cdFx0XHRcdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnNbbUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWVdPy5bMF07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGxldCBvT3BlcmF0aW9uUmVzdWx0OiBhbnk7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycz8uaW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwiNDEyRXhlY3V0ZWRcIiwgZmFsc2UpO1xuXHRcdFx0XHRvT3BlcmF0aW9uUmVzdWx0ID0gYXdhaXQgX2V4ZWN1dGVBY3Rpb24oXG5cdFx0XHRcdFx0b0FwcENvbXBvbmVudCxcblx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5wYXJlbnRDb250cm9sLFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLm1lc3NhZ2VIYW5kbGVyXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0Y29uc3QgbWVzc2FnZXMgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQgJiZcblx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcIjQxMkV4ZWN1dGVkXCIpICYmXG5cdFx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCJzdHJpY3RIYW5kbGluZ0ZhaWxzXCIpPy5sZW5ndGhcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXG5cdFx0XHRcdFx0XHRcIkRlbGF5TWVzc2FnZXNcIixcblx0XHRcdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwiRGVsYXlNZXNzYWdlc1wiKS5jb25jYXQobWVzc2FnZXMpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhZnRlckFjdGlvblJlc29sdXRpb24obVBhcmFtZXRlcnMsIG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLCBhY3Rpb25EZWZpbml0aW9uKTtcblx0XHRcdFx0cmVzb2x2ZShvT3BlcmF0aW9uUmVzdWx0KTtcblx0XHRcdH0gY2F0Y2gge1xuXHRcdFx0XHRyZWplY3Qob09wZXJhdGlvblJlc3VsdCk7XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQgJiZcblx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcIjQxMkV4ZWN1dGVkXCIpICYmXG5cdFx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCJzdHJpY3RIYW5kbGluZ0ZhaWxzXCIpPy5sZW5ndGhcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdGNvbnN0IHN0cmljdEhhbmRsaW5nRmFpbHMgPSBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcInN0cmljdEhhbmRsaW5nRmFpbHNcIik7XG5cdFx0XHRcdFx0XHRjb25zdCBhRmFpbGVkQ29udGV4dHMgPSBbXSBhcyBhbnk7XG5cdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ0ZhaWxzLmZvckVhY2goZnVuY3Rpb24gKGZhaWw6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRhRmFpbGVkQ29udGV4dHMucHVzaChmYWlsLm9BY3Rpb24uZ2V0Q29udGV4dCgpKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUNvbnRleHRzID0gYUZhaWxlZENvbnRleHRzO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0ZhaWxlZE9wZXJhdGlvblJlc3VsdCA9IGF3YWl0IF9leGVjdXRlQWN0aW9uKFxuXHRcdFx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMucGFyZW50Q29udHJvbCxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMubWVzc2FnZUhhbmRsZXJcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkuYWRkTWVzc2FnZXMobUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCJEZWxheU1lc3NhZ2VzXCIpKTtcblx0XHRcdFx0XHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwic3RyaWN0SGFuZGxpbmdGYWlsc1wiLCBbXSk7XG5cdFx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInByb2Nlc3NlZE1lc3NhZ2VJZHNcIiwgW10pO1xuXHRcdFx0XHRcdFx0YWZ0ZXJBY3Rpb25SZXNvbHV0aW9uKG1QYXJhbWV0ZXJzLCBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycywgYWN0aW9uRGVmaW5pdGlvbik7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKG9GYWlsZWRPcGVyYXRpb25SZXN1bHQpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKG9GYWlsZWRPcGVyYXRpb25SZXN1bHQpIHtcblx0XHRcdFx0XHRcdHJlamVjdChvRmFpbGVkT3BlcmF0aW9uUmVzdWx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0bVBhcmFtZXRlcnM/Lm1lc3NhZ2VIYW5kbGVyPy5zaG93TWVzc2FnZURpYWxvZygpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59XG5mdW5jdGlvbiBjb25maXJtQ3JpdGljYWxBY3Rpb24oXG5cdHNBY3Rpb25OYW1lOiBhbnksXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0c0FjdGlvbkxhYmVsOiBhbnksXG5cdG1QYXJhbWV0ZXJzOiBhbnksXG5cdGFBY3Rpb25QYXJhbWV0ZXJzOiBhbnksXG5cdGFQYXJhbWV0ZXJWYWx1ZXM6IGFueSxcblx0b0FjdGlvbkNvbnRleHQ6IGFueSxcblx0b1BhcmVudENvbnRyb2w6IGFueSxcblx0ZW50aXR5U2V0TmFtZTogYW55LFxuXHRtZXNzYWdlSGFuZGxlcjogYW55XG4pIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRsZXQgYm91bmRBY3Rpb25OYW1lID0gc0FjdGlvbk5hbWUgPyBzQWN0aW9uTmFtZSA6IG51bGw7XG5cdFx0Ym91bmRBY3Rpb25OYW1lID1cblx0XHRcdGJvdW5kQWN0aW9uTmFtZS5pbmRleE9mKFwiLlwiKSA+PSAwID8gYm91bmRBY3Rpb25OYW1lLnNwbGl0KFwiLlwiKVtib3VuZEFjdGlvbk5hbWUuc3BsaXQoXCIuXCIpLmxlbmd0aCAtIDFdIDogYm91bmRBY3Rpb25OYW1lO1xuXHRcdGNvbnN0IHN1ZmZpeFJlc291cmNlS2V5ID0gYm91bmRBY3Rpb25OYW1lICYmIGVudGl0eVNldE5hbWUgPyBgJHtlbnRpdHlTZXROYW1lfXwke2JvdW5kQWN0aW9uTmFtZX1gIDogXCJcIjtcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBvUGFyZW50Q29udHJvbC5nZXRDb250cm9sbGVyKCkub1Jlc291cmNlQnVuZGxlO1xuXHRcdGNvbnN0IHNDb25maXJtYXRpb25UZXh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcIkNfT1BFUkFUSU9OU19BQ1RJT05fQ09ORklSTV9NRVNTQUdFXCIsXG5cdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRudWxsLFxuXHRcdFx0c3VmZml4UmVzb3VyY2VLZXlcblx0XHQpO1xuXG5cdFx0TWVzc2FnZUJveC5jb25maXJtKHNDb25maXJtYXRpb25UZXh0LCB7XG5cdFx0XHRvbkNsb3NlOiBhc3luYyBmdW5jdGlvbiAoc0FjdGlvbjogYW55KSB7XG5cdFx0XHRcdGlmIChzQWN0aW9uID09PSBBY3Rpb24uT0spIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb09wZXJhdGlvbiA9IGF3YWl0IF9leGVjdXRlQWN0aW9uKG9BcHBDb21wb25lbnQsIG1QYXJhbWV0ZXJzLCBvUGFyZW50Q29udHJvbCwgbWVzc2FnZUhhbmRsZXIpO1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShvT3BlcmF0aW9uKTtcblx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgbWVzc2FnZUhhbmRsZXIuc2hvd01lc3NhZ2VEaWFsb2coKTtcblx0XHRcdFx0XHRcdFx0cmVqZWN0KG9FcnJvcik7XG5cdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRcdHJlamVjdChvRXJyb3IpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVBUE1BY3Rpb24oXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0b1BhcmVudENvbnRyb2w6IGFueSxcblx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyLFxuXHRhQ29udGV4dHM6IGFueSxcblx0b0RpYWxvZzogYW55LFxuXHRhZnRlcjQxMjogYm9vbGVhblxuKSB7XG5cdGNvbnN0IGFSZXN1bHQgPSBhd2FpdCBfZXhlY3V0ZUFjdGlvbihvQXBwQ29tcG9uZW50LCBtUGFyYW1ldGVycywgb1BhcmVudENvbnRyb2wsIG1lc3NhZ2VIYW5kbGVyKTtcblx0Ly8gSWYgc29tZSBlbnRyaWVzIHdlcmUgc3VjY2Vzc2Z1bCwgYW5kIG90aGVycyBoYXZlIGZhaWxlZCwgdGhlIG92ZXJhbGwgcHJvY2VzcyBpcyBzdGlsbCBzdWNjZXNzZnVsLiBIb3dldmVyLCB0aGlzIHdhcyB0cmVhdGVkIGFzIHJlamVjdGlvblxuXHQvLyBiZWZvcmUsIGFuZCB0aGlzIGN1cnJlbnRseSBpcyBzdGlsbCBrZXB0LCBhcyBsb25nIGFzIGRpYWxvZyBoYW5kbGluZyBpcyBtaXhlZCB3aXRoIGJhY2tlbmQgcHJvY2VzcyBoYW5kbGluZy5cblx0Ly8gVE9ETzogUmVmYWN0b3IgdG8gb25seSByZWplY3QgaW4gY2FzZSBvZiBvdmVyYWxsIHByb2Nlc3MgZXJyb3IuXG5cdC8vIEZvciB0aGUgdGltZSBiZWluZzogbWFwIHRvIG9sZCBsb2dpYyB0byByZWplY3QgaWYgYXQgbGVhc3Qgb25lIGVudHJ5IGhhcyBmYWlsZWRcblx0aWYgKGFSZXN1bHQ/LnNvbWUoKG9TaW5nbGVSZXN1bHQ6IGFueSkgPT4gb1NpbmdsZVJlc3VsdC5zdGF0dXMgPT09IFwicmVqZWN0ZWRcIikpIHtcblx0XHR0aHJvdyBhUmVzdWx0O1xuXHR9XG5cblx0Y29uc3QgbWVzc2FnZXMgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCkuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0RGF0YSgpO1xuXHRpZiAoXG5cdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQgJiZcblx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcIjQxMkV4ZWN1dGVkXCIpICYmXG5cdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCJzdHJpY3RIYW5kbGluZ0ZhaWxzXCIpPy5sZW5ndGhcblx0KSB7XG5cdFx0aWYgKCFhZnRlcjQxMikge1xuXHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXG5cdFx0XHRcdFwiRGVsYXlNZXNzYWdlc1wiLFxuXHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcIkRlbGF5TWVzc2FnZXNcIikuY29uY2F0KG1lc3NhZ2VzKVxuXHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Q29yZS5nZXRNZXNzYWdlTWFuYWdlcigpLmFkZE1lc3NhZ2VzKG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwiRGVsYXlNZXNzYWdlc1wiKSk7XG5cdFx0XHRpZiAobWVzc2FnZXMubGVuZ3RoKSB7XG5cdFx0XHRcdC8vIEJPVU5EIFRSQU5TSVRJT04gQVMgUEFSVCBPRiBTQVBfTUVTU0FHRVxuXHRcdFx0XHRtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZyh7XG5cdFx0XHRcdFx0b25CZWZvcmVTaG93TWVzc2FnZTogZnVuY3Rpb24gKGFNZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbjogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayhtUGFyYW1ldGVycywgYUNvbnRleHRzLCBvRGlhbG9nLCBhTWVzc2FnZXMsIHNob3dNZXNzYWdlUGFyYW1ldGVyc0luKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIGlmIChtZXNzYWdlcy5sZW5ndGgpIHtcblx0XHQvLyBCT1VORCBUUkFOU0lUSU9OIEFTIFBBUlQgT0YgU0FQX01FU1NBR0Vcblx0XHRtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZURpYWxvZyh7XG5cdFx0XHRpc0FjdGlvblBhcmFtZXRlckRpYWxvZ09wZW46IG1QYXJhbWV0ZXJzPy5vRGlhbG9nLmlzT3BlbigpLFxuXHRcdFx0b25CZWZvcmVTaG93TWVzc2FnZTogZnVuY3Rpb24gKGFNZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbjogYW55KSB7XG5cdFx0XHRcdHJldHVybiBhY3Rpb25QYXJhbWV0ZXJTaG93TWVzc2FnZUNhbGxiYWNrKG1QYXJhbWV0ZXJzLCBhQ29udGV4dHMsIG9EaWFsb2csIGFNZXNzYWdlcywgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzSW4pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIGFSZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGFmdGVyQWN0aW9uUmVzb2x1dGlvbihtUGFyYW1ldGVyczogYW55LCBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVyczogYW55LCBhY3Rpb25EZWZpbml0aW9uOiBhbnkpIHtcblx0aWYgKFxuXHRcdG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0ICYmXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwICYmXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUNvbnRleHRzICYmXG5cdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuYUNvbnRleHRzLmxlbmd0aCAmJlxuXHRcdGFjdGlvbkRlZmluaXRpb24uJElzQm91bmRcblx0KSB7XG5cdFx0Ly9jaGVjayBmb3Igc2tpcHBpbmcgc3RhdGljIGFjdGlvbnNcblx0XHRjb25zdCBpc1N0YXRpYyA9IG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLmlzU3RhdGljO1xuXHRcdGlmICghaXNTdGF0aWMpIHtcblx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudChcblx0XHRcdFx0bUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHRcdEpTT04ucGFyc2UobUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwKSxcblx0XHRcdFx0bVBhcmFtZXRlcnMuc2VsZWN0ZWRJdGVtcyxcblx0XHRcdFx0XCJ0YWJsZVwiXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSBpZiAobUFjdGlvbkV4ZWN1dGlvblBhcmFtZXRlcnMuY29udHJvbCkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2wgPSBtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5jb250cm9sO1xuXHRcdFx0aWYgKG9Db250cm9sLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0Y29uc3QgYVNlbGVjdGVkQ29udGV4dHMgPSBvQ29udHJvbC5nZXRTZWxlY3RlZENvbnRleHRzKCk7XG5cdFx0XHRcdEFjdGlvblJ1bnRpbWUuc2V0QWN0aW9uRW5hYmxlbWVudChcblx0XHRcdFx0XHRtQWN0aW9uRXhlY3V0aW9uUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRKU09OLnBhcnNlKG1BY3Rpb25FeGVjdXRpb25QYXJhbWV0ZXJzLm9wZXJhdGlvbkF2YWlsYWJsZU1hcCksXG5cdFx0XHRcdFx0YVNlbGVjdGVkQ29udGV4dHMsXG5cdFx0XHRcdFx0XCJ0YWJsZVwiXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGFjdGlvblBhcmFtZXRlclNob3dNZXNzYWdlQ2FsbGJhY2soXG5cdG1QYXJhbWV0ZXJzOiBhbnksXG5cdGFDb250ZXh0czogYW55LFxuXHRvRGlhbG9nOiBhbnksXG5cdG1lc3NhZ2VzOiBhbnksXG5cdHNob3dNZXNzYWdlUGFyYW1ldGVyc0luOiB7IHNob3dNZXNzYWdlQm94OiBib29sZWFuOyBzaG93TWVzc2FnZURpYWxvZzogYm9vbGVhbiB9XG4pOiB7IGZuR2V0TWVzc2FnZVN1YnRpdGxlOiBGdW5jdGlvbiB8IHVuZGVmaW5lZDsgc2hvd01lc3NhZ2VCb3g6IGJvb2xlYW47IHNob3dNZXNzYWdlRGlhbG9nOiBib29sZWFuOyBmaWx0ZXJlZE1lc3NhZ2VzOiBhbnlbXSB9IHtcblx0bGV0IHNob3dNZXNzYWdlQm94ID0gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzSW4uc2hvd01lc3NhZ2VCb3gsXG5cdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbi5zaG93TWVzc2FnZURpYWxvZztcblx0Y29uc3Qgb0NvbnRyb2wgPSBtUGFyYW1ldGVycy5jb250cm9sO1xuXHRjb25zdCB1bmJvdW5kTWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIoZnVuY3Rpb24gKG1lc3NhZ2U6IGFueSkge1xuXHRcdHJldHVybiBtZXNzYWdlLmdldFRhcmdldCgpID09PSBcIlwiO1xuXHR9KTtcblx0Y29uc3QgQVBEbWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIoZnVuY3Rpb24gKG1lc3NhZ2U6IGFueSkge1xuXHRcdHJldHVybiAoXG5cdFx0XHRtZXNzYWdlLmdldFRhcmdldCAmJlxuXHRcdFx0bWVzc2FnZS5nZXRUYXJnZXQoKS5pbmRleE9mKG1QYXJhbWV0ZXJzLmFjdGlvbk5hbWUpICE9PSAtMSAmJlxuXHRcdFx0bVBhcmFtZXRlcnMuYUFjdGlvblBhcmFtZXRlcnMuc29tZShmdW5jdGlvbiAoYWN0aW9uUGFyYW06IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5nZXRUYXJnZXQoKS5pbmRleE9mKGFjdGlvblBhcmFtLiROYW1lKSAhPT0gLTE7XG5cdFx0XHR9KVxuXHRcdCk7XG5cdH0pO1xuXHRBUERtZXNzYWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChBUERNZXNzYWdlOiBhbnkpIHtcblx0XHRBUERNZXNzYWdlLmlzQVBEVGFyZ2V0ID0gdHJ1ZTtcblx0fSk7XG5cblx0Y29uc3QgZXJyb3JUYXJnZXRzSW5BUEQgPSBBUERtZXNzYWdlcy5sZW5ndGggPyB0cnVlIDogZmFsc2U7XG5cdGlmIChvRGlhbG9nLmlzT3BlbigpICYmIGFDb250ZXh0cy5sZW5ndGggIT09IDAgJiYgIW1QYXJhbWV0ZXJzLmlzU3RhdGljKSB7XG5cdFx0aWYgKCFtUGFyYW1ldGVycy5iR3JvdXBlZCkge1xuXHRcdFx0Ly9pc29sYXRlZFxuXHRcdFx0aWYgKGFDb250ZXh0cy5sZW5ndGggPiAxIHx8ICFlcnJvclRhcmdldHNJbkFQRCkge1xuXHRcdFx0XHQvLyBkb2VzIG5vdCBtYXR0ZXIgaWYgZXJyb3IgaXMgaW4gQVBEIG9yIG5vdCwgaWYgdGhlcmUgYXJlIG11bHRpcGxlIGNvbnRleHRzIHNlbGVjdGVkIG9yIGlmIHRoZSBlcnJvciBpcyBub3QgdGhlIEFQRCwgd2UgY2xvc2UgaXQuXG5cdFx0XHRcdC8vIFRPRE86IERpbGFvZyBoYW5kbGluZyBzaG91bGQgbm90IGJlIHBhcnQgb2YgbWVzc2FnZSBoYW5kbGluZy4gUmVmYWN0b3IgYWNjb3JkaW5nbHkgLSBkaWFsb2cgc2hvdWxkIG5vdCBiZSBuZWVkZWQgaW5zaWRlIHRoaXMgbWV0aG9kIC0gbmVpdGhlclxuXHRcdFx0XHQvLyB0byBhc2sgd2hldGhlciBpdCdzIG9wZW4sIG5vciB0byBjbG9zZSBpdCFcblx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRtUGFyYW1ldGVycz8ub25BZnRlckFQRENsb3NlKCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICghZXJyb3JUYXJnZXRzSW5BUEQpIHtcblx0XHRcdC8vY2hhbmdlc2V0XG5cdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRtUGFyYW1ldGVycz8ub25BZnRlckFQRENsb3NlKCk7XG5cdFx0fVxuXHRcdC8vIHdlIG5lZWQgdG8gZGVzdHJveSB0aGUgZGlhbG9nIGltbWVkaWF0ZWx5IGFmdGVyIGNsb3NpbmcgaXQsIGlmIG5vdCBvRGlhbG9nLmlzT3BlbigpIHJldHVybnMgdHJ1ZSBiZWxvdyBhbmQgdGhhdCB3b3VsZCBjYXVzZSBpcnJlbGV2YW50IG1lc3NhZ2VzIHRvIGJlIHNob3duIG9uIFVJXG5cdFx0Ly8gYnkgdGhlIGxpbmVzIHRoYXQgZm9sbG93LlxuXHR9XG5cdGxldCBmaWx0ZXJlZE1lc3NhZ2VzOiBhbnlbXSA9IFtdO1xuXHRjb25zdCBiSXNBUERPcGVuID0gb0RpYWxvZy5pc09wZW4oKTtcblx0aWYgKG1lc3NhZ2VzLmxlbmd0aCA9PT0gMSAmJiBtZXNzYWdlc1swXS5nZXRUYXJnZXQgJiYgbWVzc2FnZXNbMF0uZ2V0VGFyZ2V0KCkgIT09IHVuZGVmaW5lZCAmJiBtZXNzYWdlc1swXS5nZXRUYXJnZXQoKSAhPT0gXCJcIikge1xuXHRcdGlmICgob0NvbnRyb2wgJiYgb0NvbnRyb2wuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpID09PSBmYWxzZSkgfHwgIW9Db250cm9sKSB7XG5cdFx0XHQvLyBPUCBlZGl0IG9yIExSXG5cdFx0XHRzaG93TWVzc2FnZUJveCA9ICFlcnJvclRhcmdldHNJbkFQRDtcblx0XHRcdHNob3dNZXNzYWdlRGlhbG9nID0gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChvQ29udHJvbCAmJiBvQ29udHJvbC5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikgPT09IHRydWUpIHtcblx0XHRcdHNob3dNZXNzYWdlQm94ID0gZmFsc2U7XG5cdFx0XHRzaG93TWVzc2FnZURpYWxvZyA9IGZhbHNlO1xuXHRcdH1cblx0fSBlbHNlIGlmIChvQ29udHJvbCkge1xuXHRcdGlmIChvQ29udHJvbC5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikgPT09IGZhbHNlKSB7XG5cdFx0XHRpZiAoYklzQVBET3BlbiAmJiBlcnJvclRhcmdldHNJbkFQRCkge1xuXHRcdFx0XHRzaG93TWVzc2FnZURpYWxvZyA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAob0NvbnRyb2wuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpID09PSB0cnVlKSB7XG5cdFx0XHRpZiAoIWJJc0FQRE9wZW4gJiYgZXJyb3JUYXJnZXRzSW5BUEQpIHtcblx0XHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSB0cnVlO1xuXHRcdFx0XHRmaWx0ZXJlZE1lc3NhZ2VzID0gdW5ib3VuZE1lc3NhZ2VzLmNvbmNhdChBUERtZXNzYWdlcyk7XG5cdFx0XHR9IGVsc2UgaWYgKCFiSXNBUERPcGVuICYmIHVuYm91bmRNZXNzYWdlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0Ly8gZXJyb3IgdGFyZ2V0cyBpbiBBUEQgPT4gdGhlcmUgaXMgYXRsZWFzdCBvbmUgYm91bmQgbWVzc2FnZS4gSWYgdGhlcmUgYXJlIHVuYm91bmQgbWVzc2FnZXMsIGRpYWxvZyBtdXN0IGJlIHNob3duLlxuXHRcdFx0XHQvLyBmb3IgZHJhZnQgZW50aXR5LCB3ZSBhbHJlYWR5IGNsb3NlZCB0aGUgQVBEXG5cdFx0XHRcdHNob3dNZXNzYWdlRGlhbG9nID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRzaG93TWVzc2FnZUJveDogc2hvd01lc3NhZ2VCb3gsXG5cdFx0c2hvd01lc3NhZ2VEaWFsb2c6IHNob3dNZXNzYWdlRGlhbG9nLFxuXHRcdGZpbHRlcmVkTWVzc2FnZXM6IGZpbHRlcmVkTWVzc2FnZXMubGVuZ3RoID8gZmlsdGVyZWRNZXNzYWdlcyA6IG1lc3NhZ2VzLFxuXHRcdGZuR2V0TWVzc2FnZVN1YnRpdGxlOlxuXHRcdFx0b0NvbnRyb2wgJiYgb0NvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSAmJiBtZXNzYWdlSGFuZGxpbmcuc2V0TWVzc2FnZVN1YnRpdGxlLmJpbmQoe30sIG9Db250cm9sLCBhQ29udGV4dHMpXG5cdH07XG59XG5cbi8qXG4gKiBDdXJyZW50bHksIHRoaXMgbWV0aG9kIGlzIHJlc3BvbnNpYmxlIGZvciBzaG93aW5nIHRoZSBkaWFsb2cgYW5kIGV4ZWN1dGluZyB0aGUgYWN0aW9uLiBUaGUgcHJvbWlzZSByZXR1cm5lZCBpcyBwZW5kaW5nIHdoaWxlIHdhaXRpbmcgZm9yIHVzZXIgaW5wdXQsIGFzIHdlbGwgYXMgd2hpbGUgdGhlXG4gKiBiYWNrLWVuZCByZXF1ZXN0IGlzIHJ1bm5pbmcuIFRoZSBwcm9taXNlIGlzIHJlamVjdGVkIHdoZW4gdGhlIHVzZXIgY2FuY2VscyB0aGUgZGlhbG9nIGFuZCBhbHNvIHdoZW4gdGhlIGJhY2stZW5kIHJlcXVlc3QgZmFpbHMuXG4gKiBUT0RPOiBSZWZhY3RvcmluZzogU2VwYXJhdGUgZGlhbG9nIGhhbmRsaW5nIGZyb20gYmFja2VuZCBwcm9jZXNzaW5nLiBEaWFsb2cgaGFuZGxpbmcgc2hvdWxkIHJldHVybiBhIFByb21pc2UgcmVzb2x2aW5nIHRvIHBhcmFtZXRlcnMgdG8gYmUgcHJvdmlkZWQgdG8gYmFja2VuZC4gSWYgZGlhbG9nIGlzXG4gKiBjYW5jZWxsZWQsIHRoYXQgcHJvbWlzZSBjYW4gYmUgcmVqZWN0ZWQuIE1ldGhvZCByZXNwb25zaWJsZSBmb3IgYmFja2VuZCBwcm9jZXNzaW5nIG5lZWQgdG8gZGVhbCB3aXRoIG11bHRpcGxlIGNvbnRleHRzIC0gaS5lLiBpdCBzaG91bGQgZWl0aGVyIHJldHVybiBhbiBhcnJheSBvZiBQcm9taXNlcyBvclxuICogYSBQcm9taXNlIHJlc29sdmluZyB0byBhbiBhcnJheS4gSW4gdGhlIGxhdHRlciBjYXNlLCB0aGF0IFByb21pc2Ugc2hvdWxkIGJlIHJlc29sdmVkIGFsc28gd2hlbiBzb21lIG9yIGV2ZW4gYWxsIGNvbnRleHRzIGZhaWxlZCBpbiBiYWNrZW5kIC0gdGhlIG92ZXJhbGwgcHJvY2VzcyBzdGlsbCB3YXNcbiAqIHN1Y2Nlc3NmdWwuXG4gKlxuICovXG5cbi8vIHRoaXMgdHlwZSBpcyBtZWFudCB0byBkZXNjcmliZSB0aGUgbWV0YSBpbmZvcm1hdGlvbiBmb3Igb25lIEFjdGlvblBhcmFtZXRlciAoaS5lLiBpdHMgb2JqZWN0IGluIG1ldGFNb2RlbClcbnR5cGUgQWN0aW9uUGFyYW1ldGVyID0ge1xuXHQkTmFtZTogc3RyaW5nO1xuXHQkaXNDb2xsZWN0aW9uOiBib29sZWFuO1xuXHQvLyBjdXJyZW50bHkgcnVudGltZSBpbmZvcm1hdGlvbiBpcyB3cml0dGVuIGludG8gdGhlIG1ldGFtb2RlbDpcblx0Ly8gLSBpbiB0aGUgcHJlc3MgaGFuZGxlciBvZiB0aGUgYWN0aW9uIGJ1dHRvbiBvbiB0aGUgcGFyYW1ldGVyIGRpYWxvZywgdGhlIHZhbHVlIG9mIGVhY2ggcGFyYW1ldGVyIGlzIGFkZGVkXG5cdC8vIC0gaW4gc2V0QWN0aW9uUGFyYW1ldGVyRGVmYXVsdFZhbHVlLCB0aGlzIGluZm9ybWF0aW9uIGlzIHVzZWQgYW5kIHRyYW5zZmVycmVkIHRvIHRoZSBjb250ZXh0IChpbiBPRGF0YU1vZGVsKSBjcmVhdGVkIGZvciB0aGUgYWN0aW9uIGV4ZWN1dGlvblxuXHQvLyB0aGlzIGlzIHF1aXRlIG9kZCwgYW5kIGl0IHdvdWxkIG1ha2UgbXVjaCBtb3JlIHNlbnNlIHRvIHRha2UgdGhlIHZhbHVlIGZyb20gYWN0aW9uUGFyYW1ldGVySW5mb3Ncblx0Ly8gLSBob3dldmVyLCBzZXRBY3Rpb25QYXJhbWV0ZXJEZWZhdWx0VmFsdWUgKG9yIHJhdGhlciB0aGUgc3Vycm91bmRpbmcgX2V4ZWN1dGVBY3Rpb24pIGlzIGFsc28gY2FsbGVkIGZyb20gb3RoZXIgcGxhY2VzXG5cdC8vID0+IGZvciB0aGUgdGltZSBiZWluZywgYWRkaW5nIHZhbHVlIGhlcmUgdG8gYXZvaWQgdHMgZXJyb3JzLCBzdWJqZWN0IHRvIHJlZmFjdG9yaW5nXG5cdC8vIGluIGNhc2Ugb2YgRmllbGQsIHRoZSB2YWx1ZSBpcyBzdHJpbmcsIGluIGNhc2Ugb2YgTXVsdGlWYWx1ZUZpZWxkLCBpdCdzIE11bHRpVmFsdWVGaWVsZEl0ZW1bXVxuXHR2YWx1ZTogc3RyaW5nIHwgTXVsdGlWYWx1ZUZpZWxkSXRlbVtdO1xufTtcblxuZnVuY3Rpb24gc2hvd0FjdGlvblBhcmFtZXRlckRpYWxvZyhcblx0c0FjdGlvbk5hbWU6IGFueSxcblx0b0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRzQWN0aW9uTGFiZWw6IGFueSxcblx0bVBhcmFtZXRlcnM6IGFueSxcblx0YUFjdGlvblBhcmFtZXRlcnM6IEFjdGlvblBhcmFtZXRlcltdLFxuXHRhUGFyYW1ldGVyVmFsdWVzOiBhbnksXG5cdG9BY3Rpb25Db250ZXh0OiBhbnksXG5cdG9QYXJlbnRDb250cm9sOiBhbnksXG5cdGVudGl0eVNldE5hbWU6IGFueSxcblx0bWVzc2FnZUhhbmRsZXI6IGFueVxuKSB7XG5cdGNvbnN0IHNQYXRoID0gX2dldFBhdGgob0FjdGlvbkNvbnRleHQsIHNBY3Rpb25OYW1lKSxcblx0XHRtZXRhTW9kZWwgPSBvQWN0aW9uQ29udGV4dC5nZXRNb2RlbCgpLm9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRlbnRpdHlTZXRDb250ZXh0ID0gbWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNQYXRoKSxcblx0XHRzQWN0aW9uTmFtZVBhdGggPSBvQWN0aW9uQ29udGV4dC5nZXRPYmplY3QoXCIkSXNCb3VuZFwiKVxuXHRcdFx0PyBvQWN0aW9uQ29udGV4dC5nZXRQYXRoKCkuc3BsaXQoXCIvQCR1aTUub3ZlcmxvYWQvMFwiKVswXVxuXHRcdFx0OiBvQWN0aW9uQ29udGV4dC5nZXRQYXRoKCkuc3BsaXQoXCIvMFwiKVswXSxcblx0XHRhY3Rpb25OYW1lQ29udGV4dCA9IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzQWN0aW9uTmFtZVBhdGgpLFxuXHRcdGJJc0NyZWF0ZUFjdGlvbiA9IG1QYXJhbWV0ZXJzLmlzQ3JlYXRlQWN0aW9uLFxuXHRcdHNGcmFnbWVudE5hbWUgPSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL0FjdGlvblBhcmFtZXRlckRpYWxvZ1wiO1xuXHRyZXR1cm4gbmV3IFByb21pc2UoYXN5bmMgZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuXHRcdHR5cGUgQWN0aW9uUGFyYW1ldGVySW5mbyA9IHtcblx0XHRcdHBhcmFtZXRlcjogQWN0aW9uUGFyYW1ldGVyO1xuXHRcdFx0ZmllbGQ6IEZpZWxkIHwgTXVsdGlWYWx1ZUZpZWxkO1xuXHRcdFx0aXNNdWx0aVZhbHVlOiBib29sZWFuO1xuXHRcdFx0dmFsdWU/OiBzdHJpbmcgfCBNdWx0aVZhbHVlRmllbGRJdGVtW107XG5cdFx0XHR2YWxpZGF0aW9uUHJvbWlzZT86IFByb21pc2U8c3RyaW5nIHwgTXVsdGlWYWx1ZUZpZWxkSXRlbVtdPjtcblx0XHR9O1xuXHRcdGxldCBhY3Rpb25QYXJhbWV0ZXJJbmZvczogQWN0aW9uUGFyYW1ldGVySW5mb1tdOyAvLyB0byBiZSBmaWxsZWQgYWZ0ZXIgZnJhZ21lbnQgKGZvciBhY3Rpb24gcGFyYW1ldGVyIGRpYWxvZykgaXMgbG9hZGVkLiBBY3R1YWxseSBvbmx5IG5lZWRlZCBkdXJpbmcgZGlhbG9nIHByb2Nlc3NpbmcsIGkuZS4gY291bGQgYmUgbW92ZWQgaW50byB0aGUgY29udHJvbGxlciBhbmQgZGlyZWN0bHkgaW5pdGlhbGl6ZWQgdGhlcmUsIGJ1dCBvbmx5IGFmdGVyIG1vdmluZyBhbGwgaGFuZGxlcnMgKGVzcC4gcHJlc3MgaGFuZGxlciBmb3IgYWN0aW9uIGJ1dHRvbikgdG8gY29udHJvbGxlci5cblxuXHRcdGNvbnN0IG1lc3NhZ2VNYW5hZ2VyID0gQ29yZS5nZXRNZXNzYWdlTWFuYWdlcigpO1xuXG5cdFx0Ly8gaW4gY2FzZSBvZiBtaXNzaW5nIG1hbmRhb3RvcnkgcGFyYW1ldGVyLCBtZXNzYWdlIGN1cnJlbnRseSBkaWZmZXJzIHBlciBwYXJhbWV0ZXIsIGFzIGl0IHN1cGVyZmx1b3VzbHkgY29udGFpbnMgdGhlIGxhYmVsIGFzIHBhcmFtZXRlci4gUG9zc2libGt5IHRoaXMgY291bGQgYmUgcmVtb3ZlZCBpbiBmdXR1cmUsIGluIHRoYXQgY2FzZSwgaW50ZXJmYWNlIGNvdWxkIGJlIHNpbXBsaWZpZWQgdG8gQWN0aW9uUGFyYW1ldGVySW5mb1tdLCBzdHJpbmdcblx0XHRjb25zdCBfYWRkTWVzc2FnZUZvckFjdGlvblBhcmFtZXRlciA9IChtZXNzYWdlUGFyYW1ldGVyczogeyBhY3Rpb25QYXJhbWV0ZXJJbmZvOiBBY3Rpb25QYXJhbWV0ZXJJbmZvOyBtZXNzYWdlOiBzdHJpbmcgfVtdKSA9PiB7XG5cdFx0XHRtZXNzYWdlTWFuYWdlci5hZGRNZXNzYWdlcyhcblx0XHRcdFx0bWVzc2FnZVBhcmFtZXRlcnMubWFwKChtZXNzYWdlUGFyYW1ldGVyKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgYmluZGluZyA9IG1lc3NhZ2VQYXJhbWV0ZXIuYWN0aW9uUGFyYW1ldGVySW5mby5maWVsZC5nZXRCaW5kaW5nKFxuXHRcdFx0XHRcdFx0bWVzc2FnZVBhcmFtZXRlci5hY3Rpb25QYXJhbWV0ZXJJbmZvLmlzTXVsdGlWYWx1ZSA/IFwiaXRlbXNcIiA6IFwidmFsdWVcIlxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0cmV0dXJuIG5ldyBNZXNzYWdlKHtcblx0XHRcdFx0XHRcdG1lc3NhZ2U6IG1lc3NhZ2VQYXJhbWV0ZXIubWVzc2FnZSxcblx0XHRcdFx0XHRcdHR5cGU6IFwiRXJyb3JcIixcblx0XHRcdFx0XHRcdHByb2Nlc3NvcjogYmluZGluZz8uZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRcdHBlcnNpc3RlbnQ6IHRydWUsXG5cdFx0XHRcdFx0XHR0YXJnZXQ6IGJpbmRpbmc/LmdldFJlc29sdmVkUGF0aCgpXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdH07XG5cblx0XHRjb25zdCBfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlciA9IChwYXJhbWV0ZXI6IEFjdGlvblBhcmFtZXRlcikgPT4ge1xuXHRcdFx0Y29uc3QgYWxsTWVzc2FnZXMgPSBtZXNzYWdlTWFuYWdlci5nZXRNZXNzYWdlTW9kZWwoKS5nZXREYXRhKCk7XG5cdFx0XHRjb25zdCBjb250cm9sSWQgPSBnZW5lcmF0ZShbXCJBUERfXCIsIHBhcmFtZXRlci4kTmFtZV0pO1xuXHRcdFx0Ly8gYWxzbyByZW1vdmUgbWVzc2FnZXMgYXNzaWduZWQgdG8gaW5uZXIgY29udHJvbHMsIGJ1dCBhdm9pZCByZW1vdmluZyBtZXNzYWdlcyBmb3IgZGlmZmVyZW50IHBhcmFtdGVycyAod2l0aCBuYW1lIGJlaW5nIHN1YnN0cmluZyBvZiBhbm90aGVyIHBhcmFtZXRlciBuYW1lKVxuXHRcdFx0Y29uc3QgcmVsZXZhbnRNZXNzYWdlcyA9IGFsbE1lc3NhZ2VzLmZpbHRlcigobXNnOiBNZXNzYWdlKSA9PlxuXHRcdFx0XHRtc2cuZ2V0Q29udHJvbElkcygpLnNvbWUoKGlkOiBzdHJpbmcpID0+IGNvbnRyb2xJZC5zcGxpdChcIi1cIikuaW5jbHVkZXMoaWQpKVxuXHRcdFx0KTtcblx0XHRcdG1lc3NhZ2VNYW5hZ2VyLnJlbW92ZU1lc3NhZ2VzKHJlbGV2YW50TWVzc2FnZXMpO1xuXHRcdH07XG5cblx0XHRjb25zdCBfdmFsaWRhdGVQcm9wZXJ0aWVzID0gYXN5bmMgZnVuY3Rpb24gKG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUpIHtcblx0XHRcdGF3YWl0IFByb21pc2UuYWxsU2V0dGxlZChhY3Rpb25QYXJhbWV0ZXJJbmZvcy5tYXAoKGFjdGlvblBhcmFtZXRlckluZm8pID0+IGFjdGlvblBhcmFtZXRlckluZm8udmFsaWRhdGlvblByb21pc2UpKTtcblx0XHRcdGNvbnN0IHJlcXVpcmVkUGFyYW1ldGVySW5mb3MgPSBhY3Rpb25QYXJhbWV0ZXJJbmZvcy5maWx0ZXIoKGFjdGlvblBhcmFtZXRlckluZm8pID0+IGFjdGlvblBhcmFtZXRlckluZm8uZmllbGQuZ2V0UmVxdWlyZWQoKSk7XG5cdFx0XHQvKiBIaW50OiBUaGUgYm9vbGVhbiBmYWxzZSBpcyBhIHZhbGlkIHZhbHVlICovXG5cblx0XHRcdGNvbnN0IGVtcHR5UmVxdWlyZWRGaWVsZHMgPSByZXF1aXJlZFBhcmFtZXRlckluZm9zLmZpbHRlcigocmVxdWlyZWRQYXJhbWV0ZXJJbmZvKSA9PiB7XG5cdFx0XHRcdGlmIChyZXF1aXJlZFBhcmFtZXRlckluZm8uaXNNdWx0aVZhbHVlKSB7XG5cdFx0XHRcdFx0cmV0dXJuIHJlcXVpcmVkUGFyYW1ldGVySW5mby52YWx1ZSA9PT0gdW5kZWZpbmVkIHx8ICFyZXF1aXJlZFBhcmFtZXRlckluZm8udmFsdWUubGVuZ3RoO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNvbnN0IGZpZWxkVmFsdWUgPSAocmVxdWlyZWRQYXJhbWV0ZXJJbmZvLmZpZWxkIGFzIEZpZWxkKS5nZXRWYWx1ZSgpO1xuXHRcdFx0XHRcdHJldHVybiBmaWVsZFZhbHVlID09PSB1bmRlZmluZWQgfHwgZmllbGRWYWx1ZSA9PT0gbnVsbCB8fCBmaWVsZFZhbHVlID09PSBcIlwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0Ly8gbWVzc2FnZSBjb250YWlucyBsYWJlbCBwZXIgZmllbGQgZm9yIGhpc3RvcmljYWwgcmVhc29uIChvcmlnaW5hbGx5LCBpdCB3YXMgc2hvd24gaW4gYWRkaXRpb25hbCBwb3B1cCwgbm93IGl0J3MgZGlyZWN0bHkgYWRkZWQgdG8gdGhlIGZpZWxkKVxuXHRcdFx0Ly8gaWYgdGhpcyB3YXMgbm90IHRoZSBjYXNlIChhbmQgaG9wZWZ1bGx5LCBpbiBmdXR1cmUgdGhpcyBtaWdodCBiZSBzdWJqZWN0IHRvIGNoYW5nZSksIGludGVyZmFjZSBvZiBfYWRkTWVzc2FnZUZvckFjdGlvblBhcmFtZXRlciBjb3VsZCBiZSBzaW1wbGlmaWVkIHRvIGp1c3QgcGFzcyBlbXB0eVJlcXVpcmVkRmllbGRzIGFuZCBhIGNvbnN0YW50IG1lc3NhZ2UgaGVyZVxuXHRcdFx0X2FkZE1lc3NhZ2VGb3JBY3Rpb25QYXJhbWV0ZXIoXG5cdFx0XHRcdGVtcHR5UmVxdWlyZWRGaWVsZHMubWFwKChhY3Rpb25QYXJhbWV0ZXJJbmZvKSA9PiAoe1xuXHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm86IGFjdGlvblBhcmFtZXRlckluZm8sXG5cdFx0XHRcdFx0bWVzc2FnZTogQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX09QRVJBVElPTlNfQUNUSU9OX1BBUkFNRVRFUl9ESUFMT0dfTUlTU0lOR19NQU5EQVRPUllfTVNHXCIsIG9SZXNvdXJjZUJ1bmRsZSwgW1xuXHRcdFx0XHRcdFx0KGFjdGlvblBhcmFtZXRlckluZm8uZmllbGQuZ2V0UGFyZW50KCk/LmdldEFnZ3JlZ2F0aW9uKFwibGFiZWxcIikgYXMgTGFiZWwpLmdldFRleHQoKVxuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdH0pKVxuXHRcdFx0KTtcblxuXHRcdFx0LyogQ2hlY2sgdmFsdWUgc3RhdGUgb2YgYWxsIHBhcmFtZXRlciAqL1xuXHRcdFx0Y29uc3QgZmlyc3RJbnZhbGlkQWN0aW9uUGFyYW1ldGVyID0gYWN0aW9uUGFyYW1ldGVySW5mb3MuZmluZChcblx0XHRcdFx0Ly8gdW5mb3J0dW5hdGVseSwgX2FkZE1lc3NhZ2VGb3JBY3Rpb25QYXJhbWV0ZXIgc2V0cyB2YWx1ZVN0YXRlIG9ubHkgYXN5bmNocm9uZW91c2x5LCB0aHVzIGNoZWNraW5nIGVtcHR5UmVxdWlyZWRGaWVsZHMgYWRkaXRpb25hbGx5XG5cdFx0XHRcdChhY3Rpb25QYXJhbWV0ZXJJbmZvKSA9PlxuXHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8uZmllbGQuZ2V0VmFsdWVTdGF0ZSgpID09PSBcIkVycm9yXCIgfHwgZW1wdHlSZXF1aXJlZEZpZWxkcy5pbmNsdWRlcyhhY3Rpb25QYXJhbWV0ZXJJbmZvKVxuXHRcdFx0KTtcblxuXHRcdFx0aWYgKGZpcnN0SW52YWxpZEFjdGlvblBhcmFtZXRlcikge1xuXHRcdFx0XHRmaXJzdEludmFsaWRBY3Rpb25QYXJhbWV0ZXIuZmllbGQuZm9jdXMoKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGNvbnN0IG9Db250cm9sbGVyID0ge1xuXHRcdFx0aGFuZGxlQ2hhbmdlOiBhc3luYyBmdW5jdGlvbiAob0V2ZW50OiBFdmVudCkge1xuXHRcdFx0XHRjb25zdCBmaWVsZCA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRcdFx0Y29uc3QgYWN0aW9uUGFyYW1ldGVySW5mbyA9IGFjdGlvblBhcmFtZXRlckluZm9zLmZpbmQoXG5cdFx0XHRcdFx0KGFjdGlvblBhcmFtZXRlckluZm8pID0+IGFjdGlvblBhcmFtZXRlckluZm8uZmllbGQgPT09IGZpZWxkXG5cdFx0XHRcdCkgYXMgQWN0aW9uUGFyYW1ldGVySW5mbztcblx0XHRcdFx0Ly8gZmllbGQgdmFsdWUgaXMgYmVpbmcgY2hhbmdlZCwgdGh1cyBleGlzdGluZyBtZXNzYWdlcyByZWxhdGVkIHRvIHRoYXQgZmllbGQgYXJlIG5vdCB2YWxpZCBhbnltb3JlXG5cdFx0XHRcdF9yZW1vdmVNZXNzYWdlc0ZvckFjdGlvblBhcmFtdGVyKGFjdGlvblBhcmFtZXRlckluZm8ucGFyYW1ldGVyKTtcblx0XHRcdFx0Ly8gYWRhcHQgaW5mby4gUHJvbWlzZSBpcyByZXNvbHZlZCB0byB2YWx1ZSBvciByZWplY3RlZCB3aXRoIGV4Y2VwdGlvbiBjb250YWluaW5nIG1lc3NhZ2Vcblx0XHRcdFx0YWN0aW9uUGFyYW1ldGVySW5mby52YWxpZGF0aW9uUHJvbWlzZSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJwcm9taXNlXCIpIGFzIFByb21pc2U8c3RyaW5nPjtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRhY3Rpb25QYXJhbWV0ZXJJbmZvLnZhbHVlID0gYXdhaXQgYWN0aW9uUGFyYW1ldGVySW5mby52YWxpZGF0aW9uUHJvbWlzZTtcblx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRkZWxldGUgYWN0aW9uUGFyYW1ldGVySW5mby52YWx1ZTtcblx0XHRcdFx0XHRfYWRkTWVzc2FnZUZvckFjdGlvblBhcmFtZXRlcihbXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm86IGFjdGlvblBhcmFtZXRlckluZm8sXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2U6IChlcnJvciBhcyB7IG1lc3NhZ2U6IHN0cmluZyB9KS5tZXNzYWdlXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0Y29uc3Qgb0ZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIik7XG5cdFx0Y29uc3Qgb1BhcmFtZXRlck1vZGVsID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHQkZGlzcGxheU1vZGU6IHt9XG5cdFx0fSk7XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgY3JlYXRlZEZyYWdtZW50ID0gYXdhaXQgWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRcdG9GcmFnbWVudCxcblx0XHRcdFx0eyBuYW1lOiBzRnJhZ21lbnROYW1lIH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcdGFjdGlvbjogb0FjdGlvbkNvbnRleHQsXG5cdFx0XHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb25OYW1lQ29udGV4dCxcblx0XHRcdFx0XHRcdGVudGl0eVNldDogZW50aXR5U2V0Q29udGV4dFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHRhY3Rpb246IG9BY3Rpb25Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRhY3Rpb25OYW1lOiBhY3Rpb25OYW1lQ29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBlbnRpdHlTZXRDb250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IGVudGl0eVNldENvbnRleHQuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0KTtcblx0XHRcdC8vIFRPRE86IG1vdmUgdGhlIGRpYWxvZyBpbnRvIHRoZSBmcmFnbWVudCBhbmQgbW92ZSB0aGUgaGFuZGxlcnMgdG8gdGhlIG9Db250cm9sbGVyXG5cdFx0XHRjb25zdCBhQ29udGV4dHM6IGFueVtdID0gbVBhcmFtZXRlcnMuYUNvbnRleHRzIHx8IFtdO1xuXHRcdFx0Y29uc3QgYUZ1bmN0aW9uUGFyYW1zOiBhbnlbXSA9IFtdO1xuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByZWZlci1jb25zdFxuXHRcdFx0bGV0IG9PcGVyYXRpb25CaW5kaW5nOiBhbnk7XG5cdFx0XHRhd2FpdCBDb21tb25VdGlscy5zZXRVc2VyRGVmYXVsdHMob0FwcENvbXBvbmVudCwgYUFjdGlvblBhcmFtZXRlcnMsIG9QYXJhbWV0ZXJNb2RlbCwgdHJ1ZSk7XG5cdFx0XHRjb25zdCBvRGlhbG9nQ29udGVudCA9IChhd2FpdCBGcmFnbWVudC5sb2FkKHtcblx0XHRcdFx0ZGVmaW5pdGlvbjogY3JlYXRlZEZyYWdtZW50LFxuXHRcdFx0XHRjb250cm9sbGVyOiBvQ29udHJvbGxlclxuXHRcdFx0fSkpIGFzIENvbnRyb2w7XG5cblx0XHRcdGFjdGlvblBhcmFtZXRlckluZm9zID0gYUFjdGlvblBhcmFtZXRlcnMubWFwKChhY3Rpb25QYXJhbWV0ZXIpID0+IHtcblx0XHRcdFx0Y29uc3QgZmllbGQgPSBDb3JlLmJ5SWQoZ2VuZXJhdGUoW1wiQVBEX1wiLCBhY3Rpb25QYXJhbWV0ZXIuJE5hbWVdKSkgYXMgRmllbGQgfCBNdWx0aVZhbHVlRmllbGQ7XG5cdFx0XHRcdGNvbnN0IGlzTXVsdGlWYWx1ZSA9IGZpZWxkLmlzQShcInNhcC51aS5tZGMuTXVsdGlWYWx1ZUZpZWxkXCIpO1xuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdHBhcmFtZXRlcjogYWN0aW9uUGFyYW1ldGVyLFxuXHRcdFx0XHRcdGZpZWxkOiBmaWVsZCxcblx0XHRcdFx0XHRpc011bHRpVmFsdWU6IGlzTXVsdGlWYWx1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0fSk7XG5cblx0XHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IG9QYXJlbnRDb250cm9sLmdldENvbnRyb2xsZXIoKS5vUmVzb3VyY2VCdW5kbGU7XG5cdFx0XHRsZXQgYWN0aW9uUmVzdWx0ID0ge1xuXHRcdFx0XHRkaWFsb2dDYW5jZWxsZWQ6IHRydWUsIC8vIHRvIGJlIHNldCB0byBmYWxzZSBpbiBjYXNlIG9mIHN1Y2Nlc3NmdWwgYWN0aW9uIGV4ZWN0aW9uXG5cdFx0XHRcdHJlc3VsdDogdW5kZWZpbmVkXG5cdFx0XHR9O1xuXHRcdFx0Y29uc3Qgb25BZnRlckFQRENsb3NlID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQvLyB3aGVuIHRoZSBkaWFsb2cgaXMgY2FuY2VsbGVkLCBtZXNzYWdlcyBuZWVkIHRvIGJlIHJlbW92ZWQgaW4gY2FzZSB0aGUgc2FtZSBhY3Rpb24gc2hvdWxkIGJlIGV4ZWN1dGVkIGFnYWluXG5cdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzLmZvckVhY2goX3JlbW92ZU1lc3NhZ2VzRm9yQWN0aW9uUGFyYW10ZXIpO1xuXHRcdFx0XHRvRGlhbG9nLmRlc3Ryb3koKTtcblx0XHRcdFx0YnV0dG9uTG9jayA9IGZhbHNlO1xuXHRcdFx0XHRpZiAoYWN0aW9uUmVzdWx0LmRpYWxvZ0NhbmNlbGxlZCkge1xuXHRcdFx0XHRcdHJlamVjdChDb25zdGFudHMuQ2FuY2VsQWN0aW9uRGlhbG9nKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXNvbHZlKGFjdGlvblJlc3VsdC5yZXN1bHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRsZXQgYnV0dG9uTG9jayA9IGZhbHNlO1xuXG5cdFx0XHRjb25zdCBvRGlhbG9nID0gbmV3IERpYWxvZyh1bmRlZmluZWQsIHtcblx0XHRcdFx0dGl0bGU6IHNBY3Rpb25MYWJlbCB8fCBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfT1BFUkFUSU9OU19BQ1RJT05fUEFSQU1FVEVSX0RJQUxPR19USVRMRVwiLCBvUmVzb3VyY2VCdW5kbGUpLFxuXHRcdFx0XHRjb250ZW50OiBbb0RpYWxvZ0NvbnRlbnRdLFxuXHRcdFx0XHRlc2NhcGVIYW5kbGVyOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Ly8gZXNjYXBlIGhhbmRsZXIgaXMgbWVhbnQgdG8gcG9zc2libHkgc3VwcHJlc3Mgb3IgcG9zdHBvbmUgY2xvc2luZyB0aGUgZGlhbG9nIG9uIGVzY2FwZSAoYnkgY2FsbGluZyBcInJlamVjdFwiIG9uIHRoZSBwcm92aWRlZCBvYmplY3QsIG9yIFwicmVzb2x2ZVwiIG9ubHkgd2hlblxuXHRcdFx0XHRcdC8vIGRvbmUgd2l0aCBhbGwgdGFza3MgdG8gaGFwcGVuIGJlZm9yZSBkaWFsb2cgY2FuIGJlIGNsb3NlZCkuIEl0J3Mgbm90IGludGVuZGVkIHRvIGV4cGxpY2V0bHkgY2xvc2UgdGhlIGRpYWxvZyBoZXJlICh0aGF0IGhhcHBlbnMgYXV0b21hdGljYWxseSB3aGVuIG5vXG5cdFx0XHRcdFx0Ly8gZXNjYXBlSGFuZGxlciBpcyBwcm92aWRlZCBvciB0aGUgcmVzb2x2ZS1jYWxsYmFjayBpcyBjYWxsZWQpIG9yIGZvciBvd24gd3JhcCB1cCB0YXNrcyAobGlrZSByZW1vdmluZyB2YWxpZGl0aW9uIG1lc3NhZ2VzIC0gdGhpcyBzaG91bGQgaGFwcGVuIGluIHRoZVxuXHRcdFx0XHRcdC8vIGFmdGVyQ2xvc2UpLlxuXHRcdFx0XHRcdC8vIFRPRE86IE1vdmUgd3JhcCB1cCB0YXNrcyB0byBhZnRlckNsb3NlLCBhbmQgcmVtb3ZlIHRoaXMgbWV0aG9kIGNvbXBsZXRlbHkuIFRha2UgY2FyZSB0byBhbHNvIGFkYXB0IGVuZCBidXR0b24gcHJlc3MgaGFuZGxlciBhY2NvcmRpbmdseS5cblx0XHRcdFx0XHQvLyBDdXJyZW50bHkgb25seSBzdGlsbCBuZWVkZWQgdG8gZGlmZmVyZW50aWF0ZSBjbG9zaW5nIGRpYWxvZyBhZnRlciBzdWNjZXNzZnVsIGV4ZWN1dGlvbiAodXNlcyByZXNvbHZlKSBmcm9tIHVzZXIgY2FuY2VsbGF0aW9uICh1c2luZyByZWplY3QpXG5cdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdC8vXHRcdHJlamVjdChDb25zdGFudHMuQ2FuY2VsQWN0aW9uRGlhbG9nKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0YmVnaW5CdXR0b246IG5ldyBCdXR0b24oZ2VuZXJhdGUoW1wiZmVcIiwgXCJBUERfXCIsIHNBY3Rpb25OYW1lLCBcIkFjdGlvblwiLCBcIk9rXCJdKSwge1xuXHRcdFx0XHRcdHRleHQ6IGJJc0NyZWF0ZUFjdGlvblxuXHRcdFx0XHRcdFx0PyBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX1NBUEZFX0FDVElPTl9DUkVBVEVfQlVUVE9OXCIsIG9SZXNvdXJjZUJ1bmRsZSlcblx0XHRcdFx0XHRcdDogX2dldEFjdGlvblBhcmFtZXRlckFjdGlvbk5hbWUob1Jlc291cmNlQnVuZGxlLCBzQWN0aW9uTGFiZWwsIHNBY3Rpb25OYW1lLCBlbnRpdHlTZXROYW1lKSxcblx0XHRcdFx0XHR0eXBlOiBcIkVtcGhhc2l6ZWRcIixcblx0XHRcdFx0XHRwcmVzczogYXN5bmMgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0Ly8gcHJldmVudCBtdWx0aXBsZSBwcmVzcyBldmVudHMuIFRoZSBCdXN5TG9ja2VyIGlzIG5vdCBmYXN0IGVub3VnaC4gKEJDUDogMjM3MDEzMDIxMClcblx0XHRcdFx0XHRcdFx0Ly8gYnV0dG9uTG9jayBpcyBzZXQgb25jZSBhbmQgcmVzZXQgaW4gY2FzZSBvZlxuXHRcdFx0XHRcdFx0XHQvLyAtIHZhbGlkYXRpb24gZXJyb3Jcblx0XHRcdFx0XHRcdFx0Ly8gLSBtZXNzYWdlIHBvcHVwXG5cdFx0XHRcdFx0XHRcdC8vIC0gZGlhbG9nIGNsb3NlIChhZnRlckNsb3NlIGhhbmRsZXIpXG5cblx0XHRcdFx0XHRcdFx0aWYgKGJ1dHRvbkxvY2sgPT09IHRydWUpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0YnV0dG9uTG9jayA9IHRydWU7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCEoYXdhaXQgX3ZhbGlkYXRlUHJvcGVydGllcyhvUmVzb3VyY2VCdW5kbGUpKSkge1xuXHRcdFx0XHRcdFx0XHRcdGJ1dHRvbkxvY2sgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRCdXN5TG9ja2VyLmxvY2sob0RpYWxvZyk7XG5cblx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHQvLyBUT0RPOiBkdWUgdG8gdXNpbmcgdGhlIHNlYXJjaCBhbmQgdmFsdWUgaGVscHMgb24gdGhlIGFjdGlvbiBkaWFsb2cgdHJhbnNpZW50IG1lc3NhZ2VzIGNvdWxkIGFwcGVhclxuXHRcdFx0XHRcdFx0XHRcdC8vIHdlIG5lZWQgYW4gVVggZGVzaWduIGZvciB0aG9zZSB0byBzaG93IHRoZW0gdG8gdGhlIHVzZXIgLSBmb3Igbm93IHJlbW92ZSB0aGVtIGJlZm9yZSBjb250aW51aW5nXG5cdFx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gbW92ZSBwYXJhbWV0ZXIgdmFsdWVzIGZyb20gRGlhbG9nIChTaW1wbGVGb3JtKSB0byBtUGFyYW1ldGVycy5hY3Rpb25QYXJhbWV0ZXJzIHNvIHRoYXQgdGhleSBhcmUgYXZhaWxhYmxlIGluIHRoZSBvcGVyYXRpb24gYmluZGluZ3MgZm9yIGFsbCBjb250ZXh0c1xuXHRcdFx0XHRcdFx0XHRcdGxldCB2UGFyYW1ldGVyVmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1BhcmFtZXRlckNvbnRleHQgPSBvT3BlcmF0aW9uQmluZGluZyAmJiBvT3BlcmF0aW9uQmluZGluZy5nZXRQYXJhbWV0ZXJDb250ZXh0KCk7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBpIGluIGFBY3Rpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoYUFjdGlvblBhcmFtZXRlcnNbaV0uJGlzQ29sbGVjdGlvbikge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBhTVZGQ29udGVudCA9IG9EaWFsb2cuZ2V0TW9kZWwoXCJtdmZ2aWV3XCIpLmdldFByb3BlcnR5KGAvJHthQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZX1gKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhS2V5VmFsdWVzID0gW107XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZvciAoY29uc3QgaiBpbiBhTVZGQ29udGVudCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFLZXlWYWx1ZXMucHVzaChhTVZGQ29udGVudFtqXS5LZXkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHZQYXJhbWV0ZXJWYWx1ZSA9IGFLZXlWYWx1ZXM7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR2UGFyYW1ldGVyVmFsdWUgPSBvUGFyYW1ldGVyQ29udGV4dC5nZXRQcm9wZXJ0eShhQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVyc1tpXS52YWx1ZSA9IHZQYXJhbWV0ZXJWYWx1ZTsgLy8gd3JpdGluZyB0aGUgY3VycmVudCB2YWx1ZSAodWVzZXIgaW5wdXQhKSBpbnRvIHRoZSBtZXRhbW9kZWwgPT4gc2hvdWxkIGJlIHJlZmFjdG9yZWQgdG8gdXNlIEFjdGlvblBhcmFtZXRlckluZm9zIGluc3RlYWQuIFVzZWQgaW4gc2V0QWN0aW9uUGFyYW1ldGVyRGVmYXVsdFZhbHVlXG5cdFx0XHRcdFx0XHRcdFx0XHR2UGFyYW1ldGVyVmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmxhYmVsID0gc0FjdGlvbkxhYmVsO1xuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLm9uQWZ0ZXJBUERDbG9zZSA9IG9uQWZ0ZXJBUERDbG9zZTtcblx0XHRcdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnM/LmludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcIjQxMkV4ZWN1dGVkXCIsIGZhbHNlKTtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFSZXN1bHQgPSBhd2FpdCBleGVjdXRlQVBNQWN0aW9uKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0b1BhcmVudENvbnRyb2wsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRhQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9EaWFsb2csXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGZhbHNlXG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0YWN0aW9uUmVzdWx0ID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRkaWFsb2dDYW5jZWxsZWQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXN1bHQ6IGFSZXN1bHRcblx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IG1lc3NhZ2VzID0gc2FwLnVpLmdldENvcmUoKS5nZXRNZXNzYWdlTWFuYWdlcigpLmdldE1lc3NhZ2VNb2RlbCgpLmdldERhdGEoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCI0MTJFeGVjdXRlZFwiKSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcInN0cmljdEhhbmRsaW5nRmFpbHNcIik/Lmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFwiRGVsYXlNZXNzYWdlc1wiLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwiRGVsYXlNZXNzYWdlc1wiKS5jb25jYXQobWVzc2FnZXMpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR0aHJvdyBvRXJyb3I7XG5cdFx0XHRcdFx0XHRcdFx0fSBmaW5hbGx5IHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQgJiZcblx0XHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCI0MTJFeGVjdXRlZFwiKSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcInN0cmljdEhhbmRsaW5nRmFpbHNcIik/Lmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc3RyaWN0SGFuZGxpbmdGYWlscyA9IG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwic3RyaWN0SGFuZGxpbmdGYWlsc1wiKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBhRmFpbGVkQ29udGV4dHMgPSBbXSBhcyBhbnk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdGYWlscy5mb3JFYWNoKGZ1bmN0aW9uIChmYWlsOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFGYWlsZWRDb250ZXh0cy5wdXNoKGZhaWwub0FjdGlvbi5nZXRDb250ZXh0KCkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmFDb250ZXh0cyA9IGFGYWlsZWRDb250ZXh0cztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBhUmVzdWx0ID0gYXdhaXQgZXhlY3V0ZUFQTUFjdGlvbihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9BcHBDb21wb25lbnQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9QYXJlbnRDb250cm9sLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvRGlhbG9nLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInN0cmljdEhhbmRsaW5nRmFpbHNcIiwgW10pO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwicHJvY2Vzc2VkTWVzc2FnZUlkc1wiLCBbXSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YWN0aW9uUmVzdWx0ID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGlhbG9nQ2FuY2VsbGVkOiBmYWxzZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJlc3VsdDogYVJlc3VsdFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2gge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0ICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcIjQxMkV4ZWN1dGVkXCIpICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcInN0cmljdEhhbmRsaW5nRmFpbHNcIik/Lmxlbmd0aFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Q29yZS5nZXRNZXNzYWdlTWFuYWdlcigpLmFkZE1lc3NhZ2VzKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcIkRlbGF5TWVzc2FnZXNcIilcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGF3YWl0IG1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlRGlhbG9nKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3Blbjogb0RpYWxvZy5pc09wZW4oKSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9uQmVmb3JlU2hvd01lc3NhZ2U6IGZ1bmN0aW9uIChhTWVzc2FnZXM6IGFueSwgc2hvd01lc3NhZ2VQYXJhbWV0ZXJzSW46IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uUGFyYW1ldGVyU2hvd01lc3NhZ2VDYWxsYmFjayhcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhQ29udGV4dHMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0b0RpYWxvZyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRhTWVzc2FnZXMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzSW5cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKEJ1c3lMb2NrZXIuaXNMb2NrZWQob0RpYWxvZykpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob0RpYWxvZyk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdGxldCBzaG93TWVzc2FnZURpYWxvZyA9IHRydWU7XG5cblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBtZXNzYWdlSGFuZGxlci5zaG93TWVzc2FnZXMoe1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dDogbVBhcmFtZXRlcnMuYUNvbnRleHRzICYmIG1QYXJhbWV0ZXJzLmFDb250ZXh0c1swXSwgLy9hQ29udGV4dHMgbm90IGFsd2F5cyBkZWZpbmVkXG5cdFx0XHRcdFx0XHRcdFx0XHRpc0FjdGlvblBhcmFtZXRlckRpYWxvZ09wZW46IG9EaWFsb2cuaXNPcGVuKCksXG5cdFx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlUGFnZU5hdmlnYXRpb25DYWxsYmFjazogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XHRcdFx0b25CZWZvcmVTaG93TWVzc2FnZTogZnVuY3Rpb24gKGFNZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnNJbjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFdoeSBpcyB0aGlzIGltcGxlbWVudGVkIGFzIGNhbGxiYWNrPyBBcHBhcmVudGx5LCBhbGwgbmVlZGVkIGluZm9ybWF0aW9uIGlzIGF2YWlsYWJsZSBiZWZvcmVoYW5kXG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFRPRE86IHJlZmFjdG9yIGFjY29yZGluZ2x5XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNob3dNZXNzYWdlUGFyYW1ldGVycyA9IGFjdGlvblBhcmFtZXRlclNob3dNZXNzYWdlQ2FsbGJhY2soXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YUNvbnRleHRzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9EaWFsb2csXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YU1lc3NhZ2VzLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHNob3dNZXNzYWdlUGFyYW1ldGVyc0luXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHNob3dNZXNzYWdlRGlhbG9nID0gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dNZXNzYWdlRGlhbG9nO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdFx0YnV0dG9uTG9jayA9IGZhbHNlOyAvL25lZWRlZCBpZiB0aGUgYWN0aW9uIGZhaWxzIHdpdGggYW4gZXJyb3IgcG9wdXAgYW5kIHRoaXMgb25lIGlzIGNhbmNlbGQgKEpvdXJuZXk6IDQxMldhcm5pbmdIYW5kbGluZylcblxuXHRcdFx0XHRcdFx0XHRcdC8vIEluIGNhc2Ugb2YgYmFja2VuZCB2YWxpZGF0aW9uIGVycm9yKHM/KSwgbWVzc2FnZSBzaGFsbCBub3QgYmUgc2hvd24gaW4gbWVzc2FnZSBkaWFsb2cgYnV0IG5leHQgdG8gdGhlIGZpZWxkIG9uIHBhcmFtZXRlciBkaWFsb2csIHdoaWNoIHNob3VsZFxuXHRcdFx0XHRcdFx0XHRcdC8vIHN0YXkgb3BlbiBpbiB0aGlzIGNhc2UgPT4gaW4gdGhpcyBjYXNlLCB3ZSBtdXN0IG5vdCByZXNvbHZlIG9yIHJlamVjdCB0aGUgcHJvbWlzZSBjb250cm9sbGluZyB0aGUgcGFyYW1ldGVyIGRpYWxvZy5cblx0XHRcdFx0XHRcdFx0XHQvLyBJbiBhbGwgb3RoZXIgY2FzZXMgKGUuZy4gb3RoZXIgYmFja2VuZCBlcnJvcnMgb3IgdXNlciBjYW5jZWxsYXRpb24pLCB0aGUgcHJvbWlzZSBjb250cm9sbGluZyB0aGUgcGFyYW1ldGVyIGRpYWxvZyBuZWVkcyB0byBiZSByZWplY3RlZCB0byBhbGxvd1xuXHRcdFx0XHRcdFx0XHRcdC8vIGNhbGxlcnMgdG8gcmVhY3QuIChFeGFtcGxlOiBJZiBjcmVhdGlvbiBpbiBiYWNrZW5kIGFmdGVyIG5hdmlnYXRpb24gdG8gdHJhbnNpZW50IGNvbnRleHQgZmFpbHMsIGJhY2sgbmF2aWdhdGlvbiBuZWVkcyB0byBiZSB0cmlnZ2VyZWQpXG5cdFx0XHRcdFx0XHRcdFx0Ly8gVE9ETzogUmVmYWN0b3IgdG8gc2VwYXJhdGUgZGlhbG9nIGhhbmRsaW5nIGZyb20gYmFja2VuZCByZXF1ZXN0IGlzdGVhZCBvZiB0YWtpbmcgZGVjaXNpb24gYmFzZWQgb24gbWVzc2FnZSBoYW5kbGluZ1xuXHRcdFx0XHRcdFx0XHRcdGlmIChzaG93TWVzc2FnZURpYWxvZykge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmVqZWN0KG9FcnJvcik7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRcdFx0XHRpZiAoQnVzeUxvY2tlci5pc0xvY2tlZChvRGlhbG9nKSkge1xuXHRcdFx0XHRcdFx0XHRcdEJ1c3lMb2NrZXIudW5sb2NrKG9EaWFsb2cpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSxcblx0XHRcdFx0ZW5kQnV0dG9uOiBuZXcgQnV0dG9uKGdlbmVyYXRlKFtcImZlXCIsIFwiQVBEX1wiLCBzQWN0aW9uTmFtZSwgXCJBY3Rpb25cIiwgXCJDYW5jZWxcIl0pLCB7XG5cdFx0XHRcdFx0dGV4dDogQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX0NPTU1PTl9BQ1RJT05fUEFSQU1FVEVSX0RJQUxPR19DQU5DRUxcIiwgb1Jlc291cmNlQnVuZGxlKSxcblx0XHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0Ly8gVE9ETzogY2FuY2VsIGJ1dHRvbiBzaG91bGQganVzdCBjbG9zZSB0aGUgZGlhbG9nIChzaW1pbGFyIHRvIHVzaW5nIGVzY2FwZSkuIEFsbCB3cmFwIHVwIHRhc2tzIHNob3VsZCBiZSBtb3ZlZCB0byBhZnRlckNsb3NlLlxuXHRcdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSksXG5cdFx0XHRcdC8vIFRPRE86IGJlZm9yZU9wZW4gaXMganVzdCBhbiBldmVudCwgaS5lLiBub3Qgd2FpdGluZyBmb3IgdGhlIFByb21pc2UgdG8gYmUgcmVzb2x2ZWQuIENoZWNrIGlmIHRhc2tzIG9mIHRoaXMgZnVuY3Rpb24gbmVlZCB0byBiZSBkb25lIGJlZm9yZSBvcGVuaW5nIHRoZSBkaWFsb2dcblx0XHRcdFx0Ly8gLSBpZiB5ZXMsIHRoZXkgbmVlZCB0byBiZSBtb3ZlZCBvdXRzaWRlLlxuXHRcdFx0XHQvLyBBc3N1bXB0aW9uOiBTb21ldGltZXMgZGlhbG9nIGNhbiBiZSBzZWVuIHdpdGhvdXQgYW55IGZpZWxkcyBmb3IgYSBzaG9ydCB0aW1lIC0gbWF5YmUgdGhpcyBpcyBjYXVzZWQgYnkgdGhpcyBhc3luY2hyb25pdHlcblx0XHRcdFx0YmVmb3JlT3BlbjogYXN5bmMgZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdFx0Ly8gY2xvbmUgZXZlbnQgZm9yIGFjdGlvbldyYXBwZXIgYXMgb0V2ZW50Lm9Tb3VyY2UgZ2V0cyBsb3N0IGR1cmluZyBwcm9jZXNzaW5nIG9mIGJlZm9yZU9wZW4gZXZlbnQgaGFuZGxlclxuXHRcdFx0XHRcdGNvbnN0IG9DbG9uZUV2ZW50ID0gT2JqZWN0LmFzc2lnbih7fSwgb0V2ZW50KTtcblxuXHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0XHRcdGNvbnN0IGdldERlZmF1bHRWYWx1ZXNGdW5jdGlvbiA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvRGlhbG9nLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRcdFx0XHRcdHNBY3Rpb25QYXRoID0gb0FjdGlvbkNvbnRleHQuc1BhdGggJiYgb0FjdGlvbkNvbnRleHQuc1BhdGguc3BsaXQoXCIvQFwiKVswXSxcblx0XHRcdFx0XHRcdFx0c0RlZmF1bHRWYWx1ZXNGdW5jdGlvbiA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRcdFx0XHRcdGAke3NBY3Rpb25QYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRGVmYXVsdFZhbHVlc0Z1bmN0aW9uYFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHNEZWZhdWx0VmFsdWVzRnVuY3Rpb247XG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRjb25zdCBmblNldERlZmF1bHRzQW5kT3BlbkRpYWxvZyA9IGFzeW5jIGZ1bmN0aW9uIChzQmluZGluZ1BhcmFtZXRlcj86IGFueSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc0JvdW5kRnVuY3Rpb25OYW1lID0gZ2V0RGVmYXVsdFZhbHVlc0Z1bmN0aW9uKCk7XG5cdFx0XHRcdFx0XHRjb25zdCBwcmVmaWxsUGFyYW1ldGVyID0gYXN5bmMgZnVuY3Rpb24gKHNQYXJhbU5hbWU6IGFueSwgdlBhcmFtRGVmYXVsdFZhbHVlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gQ2FzZSAxOiBUaGVyZSBpcyBhIFBhcmFtZXRlckRlZmF1bHRWYWx1ZSBhbm5vdGF0aW9uXG5cdFx0XHRcdFx0XHRcdGlmICh2UGFyYW1EZWZhdWx0VmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhQ29udGV4dHMubGVuZ3RoID4gMCAmJiB2UGFyYW1EZWZhdWx0VmFsdWUuJFBhdGgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGxldCB2UGFyYW1WYWx1ZSA9IGF3YWl0IENvbW1vblV0aWxzLnJlcXVlc3RTaW5nbGV0b25Qcm9wZXJ0eShcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2UGFyYW1EZWZhdWx0VmFsdWUuJFBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkJpbmRpbmcuZ2V0TW9kZWwoKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAodlBhcmFtVmFsdWUgPT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2UGFyYW1WYWx1ZSA9IGF3YWl0IG9PcGVyYXRpb25CaW5kaW5nXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQuZ2V0UGFyYW1ldGVyQ29udGV4dCgpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQucmVxdWVzdFByb3BlcnR5KHZQYXJhbURlZmF1bHRWYWx1ZS4kUGF0aCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKGFDb250ZXh0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gRm9yIG11bHRpIHNlbGVjdCwgbmVlZCB0byBsb29wIG92ZXIgYUNvbnRleHRzIChhcyBjb250ZXh0cyBjYW5ub3QgYmUgcmV0cmlldmVkIHZpYSBiaW5kaW5nIHBhcmFtZXRlciBvZiB0aGUgb3BlcmF0aW9uIGJpbmRpbmcpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGV0IHNQYXRoRm9yQ29udGV4dCA9IHZQYXJhbURlZmF1bHRWYWx1ZS4kUGF0aDtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoc1BhdGhGb3JDb250ZXh0LmluZGV4T2YoYCR7c0JpbmRpbmdQYXJhbWV0ZXJ9L2ApID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRzUGF0aEZvckNvbnRleHQgPSBzUGF0aEZvckNvbnRleHQucmVwbGFjZShgJHtzQmluZGluZ1BhcmFtZXRlcn0vYCwgXCJcIik7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAxOyBpIDwgYUNvbnRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYUNvbnRleHRzW2ldLmdldFByb3BlcnR5KHNQYXRoRm9yQ29udGV4dCkgIT09IHZQYXJhbVZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIGlmIHRoZSB2YWx1ZXMgZnJvbSB0aGUgY29udGV4dHMgYXJlIG5vdCBhbGwgdGhlIHNhbWUsIGRvIG5vdCBwcmVmaWxsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0cGFyYW1OYW1lOiBzUGFyYW1OYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Yk5vUG9zc2libGVWYWx1ZTogdHJ1ZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4geyBwYXJhbU5hbWU6IHNQYXJhbU5hbWUsIHZhbHVlOiB2UGFyYW1WYWx1ZSB9O1xuXHRcdFx0XHRcdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlYWRpbmcgZGVmYXVsdCBhY3Rpb24gcGFyYW1ldGVyXCIsIHNQYXJhbU5hbWUsIG1QYXJhbWV0ZXJzLmFjdGlvbk5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBhcmFtTmFtZTogc1BhcmFtTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJMYXRlUHJvcGVydHlFcnJvcjogdHJ1ZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvLyBDYXNlIDEuMjogUGFyYW1ldGVyRGVmYXVsdFZhbHVlIGRlZmluZXMgYSBmaXhlZCBzdHJpbmcgdmFsdWUgKGkuZS4gdlBhcmFtRGVmYXVsdFZhbHVlID0gJ3NvbWVTdHJpbmcnKVxuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHsgcGFyYW1OYW1lOiBzUGFyYW1OYW1lLCB2YWx1ZTogdlBhcmFtRGVmYXVsdFZhbHVlIH07XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKG9QYXJhbWV0ZXJNb2RlbCAmJiAob1BhcmFtZXRlck1vZGVsIGFzIGFueSkub0RhdGFbc1BhcmFtTmFtZV0pIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBDYXNlIDI6IFRoZXJlIGlzIG5vIFBhcmFtZXRlckRlZmF1bHRWYWx1ZSBhbm5vdGF0aW9uICg9PiBsb29rIGludG8gdGhlIEZMUCBVc2VyIERlZmF1bHRzKVxuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdHBhcmFtTmFtZTogc1BhcmFtTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlOiAob1BhcmFtZXRlck1vZGVsIGFzIGFueSkub0RhdGFbc1BhcmFtTmFtZV1cblx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiB7IHBhcmFtTmFtZTogc1BhcmFtTmFtZSwgdmFsdWU6IHVuZGVmaW5lZCB9O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0XHRjb25zdCBnZXRQYXJhbWV0ZXJEZWZhdWx0VmFsdWUgPSBmdW5jdGlvbiAoc1BhcmFtTmFtZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvRGlhbG9nLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRcdFx0XHRcdFx0c0FjdGlvblBhcmFtZXRlckFubm90YXRpb25QYXRoID0gQ29tbW9uVXRpbHMuZ2V0UGFyYW1ldGVyUGF0aChvQWN0aW9uQ29udGV4dC5nZXRQYXRoKCksIHNQYXJhbU5hbWUpICsgXCJAXCIsXG5cdFx0XHRcdFx0XHRcdFx0b1BhcmFtZXRlckFubm90YXRpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0FjdGlvblBhcmFtZXRlckFubm90YXRpb25QYXRoKSxcblx0XHRcdFx0XHRcdFx0XHRvUGFyYW1ldGVyRGVmYXVsdFZhbHVlID1cblx0XHRcdFx0XHRcdFx0XHRcdG9QYXJhbWV0ZXJBbm5vdGF0aW9ucyAmJiBvUGFyYW1ldGVyQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUGFyYW1ldGVyRGVmYXVsdFZhbHVlXCJdOyAvLyBlaXRoZXIgeyAkUGF0aDogJ3NvbWVQYXRoJyB9IG9yICdzb21lU3RyaW5nJ1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb1BhcmFtZXRlckRlZmF1bHRWYWx1ZTtcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdGNvbnN0IGFDdXJyZW50UGFyYW1EZWZhdWx0VmFsdWUgPSBbXTtcblx0XHRcdFx0XHRcdGxldCBzUGFyYW1OYW1lLCB2UGFyYW1ldGVyRGVmYXVsdFZhbHVlO1xuXHRcdFx0XHRcdFx0Zm9yIChjb25zdCBpIGluIGFBY3Rpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0XHRcdHNQYXJhbU5hbWUgPSBhQWN0aW9uUGFyYW1ldGVyc1tpXS4kTmFtZTtcblx0XHRcdFx0XHRcdFx0dlBhcmFtZXRlckRlZmF1bHRWYWx1ZSA9IGdldFBhcmFtZXRlckRlZmF1bHRWYWx1ZShzUGFyYW1OYW1lKTtcblx0XHRcdFx0XHRcdFx0YUN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZS5wdXNoKHByZWZpbGxQYXJhbWV0ZXIoc1BhcmFtTmFtZSwgdlBhcmFtZXRlckRlZmF1bHRWYWx1ZSkpO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAob0FjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KFwiJElzQm91bmRcIikgJiYgYUNvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0aWYgKHNCb3VuZEZ1bmN0aW9uTmFtZSAmJiBzQm91bmRGdW5jdGlvbk5hbWUubGVuZ3RoID4gMCAmJiB0eXBlb2Ygc0JvdW5kRnVuY3Rpb25OYW1lID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBpIGluIGFDb250ZXh0cykge1xuXHRcdFx0XHRcdFx0XHRcdFx0YUZ1bmN0aW9uUGFyYW1zLnB1c2goY2FsbEJvdW5kRnVuY3Rpb24oc0JvdW5kRnVuY3Rpb25OYW1lLCBhQ29udGV4dHNbaV0sIG1QYXJhbWV0ZXJzLm1vZGVsKSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGNvbnN0IGFQcmVmaWxsUGFyYW1Qcm9taXNlcyA9IFByb21pc2UuYWxsKGFDdXJyZW50UGFyYW1EZWZhdWx0VmFsdWUpO1xuXHRcdFx0XHRcdFx0bGV0IGFFeGVjRnVuY3Rpb25Qcm9taXNlczogUHJvbWlzZTxhbnlbXT4gPSBQcm9taXNlLnJlc29sdmUoW10pO1xuXHRcdFx0XHRcdFx0bGV0IG9FeGVjRnVuY3Rpb25Gcm9tTWFuaWZlc3RQcm9taXNlO1xuXHRcdFx0XHRcdFx0aWYgKGFGdW5jdGlvblBhcmFtcyAmJiBhRnVuY3Rpb25QYXJhbXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRhRXhlY0Z1bmN0aW9uUHJvbWlzZXMgPSBQcm9taXNlLmFsbChhRnVuY3Rpb25QYXJhbXMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbikge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzTW9kdWxlID0gbVBhcmFtZXRlcnMuZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRcdFx0XHQuc3Vic3RyaW5nKDAsIG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbi5sYXN0SW5kZXhPZihcIi5cIikgfHwgLTEpXG5cdFx0XHRcdFx0XHRcdFx0XHQucmVwbGFjZSgvXFwuL2dpLCBcIi9cIiksXG5cdFx0XHRcdFx0XHRcdFx0c0Z1bmN0aW9uTmFtZSA9IG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbi5zdWJzdHJpbmcoXG5cdFx0XHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24ubGFzdEluZGV4T2YoXCIuXCIpICsgMSxcblx0XHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbi5sZW5ndGhcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRvRXhlY0Z1bmN0aW9uRnJvbU1hbmlmZXN0UHJvbWlzZSA9IEZQTUhlbHBlci5hY3Rpb25XcmFwcGVyKG9DbG9uZUV2ZW50LCBzTW9kdWxlLCBzRnVuY3Rpb25OYW1lLCB7XG5cdFx0XHRcdFx0XHRcdFx0XCJjb250ZXh0c1wiOiBhQ29udGV4dHNcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGFQcm9taXNlcyA9IGF3YWl0IFByb21pc2UuYWxsKFtcblx0XHRcdFx0XHRcdFx0XHRhUHJlZmlsbFBhcmFtUHJvbWlzZXMsXG5cdFx0XHRcdFx0XHRcdFx0YUV4ZWNGdW5jdGlvblByb21pc2VzLFxuXHRcdFx0XHRcdFx0XHRcdG9FeGVjRnVuY3Rpb25Gcm9tTWFuaWZlc3RQcm9taXNlXG5cdFx0XHRcdFx0XHRcdF0pO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBjdXJyZW50UGFyYW1EZWZhdWx0VmFsdWU6IGFueSA9IGFQcm9taXNlc1swXTtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZnVuY3Rpb25QYXJhbXMgPSBhUHJvbWlzZXNbMV07XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9GdW5jdGlvblBhcmFtc0Zyb21NYW5pZmVzdCA9IGFQcm9taXNlc1syXTtcblx0XHRcdFx0XHRcdFx0bGV0IHNEaWFsb2dQYXJhbU5hbWU6IHN0cmluZztcblxuXHRcdFx0XHRcdFx0XHQvLyBGaWxsIHRoZSBkaWFsb2cgd2l0aCB0aGUgZWFybGllciBkZXRlcm1pbmVkIHBhcmFtZXRlciB2YWx1ZXMgZnJvbSB0aGUgZGlmZmVyZW50IHNvdXJjZXNcblx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBpIGluIGFBY3Rpb25QYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0XHRcdFx0c0RpYWxvZ1BhcmFtTmFtZSA9IGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lO1xuXHRcdFx0XHRcdFx0XHRcdC8vIFBhcmFtZXRlciB2YWx1ZXMgcHJvdmlkZWQgaW4gdGhlIGNhbGwgb2YgaW52b2tlQWN0aW9uIG92ZXJydWxlIG90aGVyIHNvdXJjZXNcblx0XHRcdFx0XHRcdFx0XHRjb25zdCB2UGFyYW1ldGVyUHJvdmlkZWRWYWx1ZSA9IGFQYXJhbWV0ZXJWYWx1ZXM/LmZpbmQoXG5cdFx0XHRcdFx0XHRcdFx0XHQoZWxlbWVudDogYW55KSA9PiBlbGVtZW50Lm5hbWUgPT09IGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lXG5cdFx0XHRcdFx0XHRcdFx0KT8udmFsdWU7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHZQYXJhbWV0ZXJQcm92aWRlZFZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvT3BlcmF0aW9uQmluZGluZy5zZXRQYXJhbWV0ZXIoYUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWUsIHZQYXJhbWV0ZXJQcm92aWRlZFZhbHVlKTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKG9GdW5jdGlvblBhcmFtc0Zyb21NYW5pZmVzdCAmJiBvRnVuY3Rpb25QYXJhbXNGcm9tTWFuaWZlc3QuaGFzT3duUHJvcGVydHkoc0RpYWxvZ1BhcmFtTmFtZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9PcGVyYXRpb25CaW5kaW5nLnNldFBhcmFtZXRlcihcblx0XHRcdFx0XHRcdFx0XHRcdFx0YUFjdGlvblBhcmFtZXRlcnNbaV0uJE5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9GdW5jdGlvblBhcmFtc0Zyb21NYW5pZmVzdFtzRGlhbG9nUGFyYW1OYW1lXVxuXHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZVtpXSAmJiBjdXJyZW50UGFyYW1EZWZhdWx0VmFsdWVbaV0udmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkJpbmRpbmcuc2V0UGFyYW1ldGVyKGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lLCBjdXJyZW50UGFyYW1EZWZhdWx0VmFsdWVbaV0udmFsdWUpO1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gaWYgdGhlIGRlZmF1bHQgdmFsdWUgaGFkIG5vdCBiZWVuIHByZXZpb3VzbHkgZGV0ZXJtaW5lZCBkdWUgdG8gZGlmZmVyZW50IGNvbnRleHRzLCB3ZSBkbyBub3RoaW5nIGVsc2Vcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHNCb3VuZEZ1bmN0aW9uTmFtZSAmJiAhY3VycmVudFBhcmFtRGVmYXVsdFZhbHVlW2ldLmJOb1Bvc3NpYmxlVmFsdWUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChhQ29udGV4dHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyB3ZSBjaGVjayBpZiB0aGUgZnVuY3Rpb24gcmV0cmlldmVzIHRoZSBzYW1lIHBhcmFtIHZhbHVlIGZvciBhbGwgdGhlIGNvbnRleHRzOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRsZXQgaiA9IDA7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHdoaWxlIChqIDwgYUNvbnRleHRzLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvblBhcmFtc1tqXSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb25QYXJhbXNbaiArIDFdICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvblBhcmFtc1tqXS5nZXRPYmplY3Qoc0RpYWxvZ1BhcmFtTmFtZSkgPT09XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uUGFyYW1zW2ogKyAxXS5nZXRPYmplY3Qoc0RpYWxvZ1BhcmFtTmFtZSlcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGorKztcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vcGFyYW0gdmFsdWVzIGFyZSBhbGwgdGhlIHNhbWU6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChqID09PSBhQ29udGV4dHMubGVuZ3RoIC0gMSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9PcGVyYXRpb25CaW5kaW5nLnNldFBhcmFtZXRlcihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZnVuY3Rpb25QYXJhbXNbal0uZ2V0T2JqZWN0KHNEaWFsb2dQYXJhbU5hbWUpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmIChmdW5jdGlvblBhcmFtc1swXSAmJiBmdW5jdGlvblBhcmFtc1swXS5nZXRPYmplY3Qoc0RpYWxvZ1BhcmFtTmFtZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9Pbmx5IG9uZSBjb250ZXh0LCB0aGVuIHRoZSBkZWZhdWx0IHBhcmFtIHZhbHVlcyBhcmUgdG8gYmUgdmVyaWZpZWQgZnJvbSB0aGUgZnVuY3Rpb246XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkJpbmRpbmcuc2V0UGFyYW1ldGVyKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzW2ldLiROYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZ1bmN0aW9uUGFyYW1zWzBdLmdldE9iamVjdChzRGlhbG9nUGFyYW1OYW1lKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjb25zdCBiRXJyb3JGb3VuZCA9IGN1cnJlbnRQYXJhbURlZmF1bHRWYWx1ZS5zb21lKGZ1bmN0aW9uIChvVmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChvVmFsdWUuYkxhdGVQcm9wZXJ0eUVycm9yKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb1ZhbHVlLmJMYXRlUHJvcGVydHlFcnJvcjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHQvLyBJZiBhdCBsZWFzdCBvbmUgRGVmYXVsdCBQcm9wZXJ0eSBpcyBhIExhdGUgUHJvcGVydHkgYW5kIGFuIGVUYWcgZXJyb3Igd2FzIHJhaXNlZC5cblx0XHRcdFx0XHRcdFx0aWYgKGJFcnJvckZvdW5kKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc1RleHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQVBQX0NPTVBPTkVOVF9TQVBGRV9FVEFHX0xBVEVfUFJPUEVSVFlcIiwgb1Jlc291cmNlQnVuZGxlKTtcblx0XHRcdFx0XHRcdFx0XHRNZXNzYWdlQm94Lndhcm5pbmcoc1RleHQsIHsgY29udGVudFdpZHRoOiBcIjI1ZW1cIiB9IGFzIGFueSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJldHJpZXZpbmcgdGhlIHBhcmFtZXRlclwiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0Y29uc3QgZm5Bc3luY0JlZm9yZU9wZW4gPSBhc3luYyBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRpZiAob0FjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KFwiJElzQm91bmRcIikgJiYgYUNvbnRleHRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgYVBhcmFtZXRlcnMgPSBvQWN0aW9uQ29udGV4dC5nZXRPYmplY3QoXCIkUGFyYW1ldGVyXCIpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzQmluZGluZ1BhcmFtZXRlciA9IGFQYXJhbWV0ZXJzWzBdICYmIGFQYXJhbWV0ZXJzWzBdLiROYW1lO1xuXG5cdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb0NvbnRleHRPYmplY3QgPSBhd2FpdCBhQ29udGV4dHNbMF0ucmVxdWVzdE9iamVjdCgpO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChvQ29udGV4dE9iamVjdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b09wZXJhdGlvbkJpbmRpbmcuc2V0UGFyYW1ldGVyKHNCaW5kaW5nUGFyYW1ldGVyLCBvQ29udGV4dE9iamVjdCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IGZuU2V0RGVmYXVsdHNBbmRPcGVuRGlhbG9nKHNCaW5kaW5nUGFyYW1ldGVyKTtcblx0XHRcdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSBwYXJhbWV0ZXJcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0YXdhaXQgZm5TZXREZWZhdWx0c0FuZE9wZW5EaWFsb2coKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0YXdhaXQgZm5Bc3luY0JlZm9yZU9wZW4oKTtcblxuXHRcdFx0XHRcdC8vIGFkZGluZyBkZWZhdWx0ZWQgdmFsdWVzIG9ubHkgaGVyZSBhZnRlciB0aGV5IGFyZSBub3Qgc2V0IHRvIHRoZSBmaWVsZHNcblx0XHRcdFx0XHRmb3IgKGNvbnN0IGFjdGlvblBhcmFtZXRlckluZm8gb2YgYWN0aW9uUGFyYW1ldGVySW5mb3MpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHZhbHVlID0gYWN0aW9uUGFyYW1ldGVySW5mby5pc011bHRpVmFsdWVcblx0XHRcdFx0XHRcdFx0PyAoYWN0aW9uUGFyYW1ldGVySW5mby5maWVsZCBhcyBNdWx0aVZhbHVlRmllbGQpLmdldEl0ZW1zKClcblx0XHRcdFx0XHRcdFx0OiAoYWN0aW9uUGFyYW1ldGVySW5mby5maWVsZCBhcyBGaWVsZCkuZ2V0VmFsdWUoKTtcblx0XHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8udmFsdWUgPSB2YWx1ZTtcblx0XHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8udmFsaWRhdGlvblByb21pc2UgPSBQcm9taXNlLnJlc29sdmUodmFsdWUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblx0XHRcdFx0YWZ0ZXJDbG9zZTogb25BZnRlckFQRENsb3NlXG5cdFx0XHR9KTtcblx0XHRcdG1QYXJhbWV0ZXJzLm9EaWFsb2cgPSBvRGlhbG9nO1xuXHRcdFx0b0RpYWxvZy5zZXRNb2RlbChvQWN0aW9uQ29udGV4dC5nZXRNb2RlbCgpLm9Nb2RlbCk7XG5cdFx0XHRvRGlhbG9nLnNldE1vZGVsKG9QYXJhbWV0ZXJNb2RlbCwgXCJwYXJhbXNNb2RlbFwiKTtcblx0XHRcdG9EaWFsb2cuYmluZEVsZW1lbnQoe1xuXHRcdFx0XHRwYXRoOiBcIi9cIixcblx0XHRcdFx0bW9kZWw6IFwicGFyYW1zTW9kZWxcIlxuXHRcdFx0fSk7XG5cblx0XHRcdC8vIGVtcHR5IG1vZGVsIHRvIGFkZCBlbGVtZW50cyBkeW5hbWljYWxseSBkZXBlbmRpbmcgb24gbnVtYmVyIG9mIE1WRiBmaWVsZHMgZGVmaW5lZCBvbiB0aGUgZGlhbG9nXG5cdFx0XHRjb25zdCBvTVZGTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHt9KTtcblx0XHRcdG9EaWFsb2cuc2V0TW9kZWwob01WRk1vZGVsLCBcIm12ZnZpZXdcIik7XG5cblx0XHRcdC8qIEV2ZW50IG5lZWRlZCBmb3IgcmVtb3ZpbmcgbWVzc2FnZXMgb2YgdmFsaWQgY2hhbmdlZCBmaWVsZCAqL1xuXHRcdFx0Zm9yIChjb25zdCBhY3Rpb25QYXJhbWV0ZXJJbmZvIG9mIGFjdGlvblBhcmFtZXRlckluZm9zKSB7XG5cdFx0XHRcdGlmIChhY3Rpb25QYXJhbWV0ZXJJbmZvLmlzTXVsdGlWYWx1ZSkge1xuXHRcdFx0XHRcdGFjdGlvblBhcmFtZXRlckluZm8/LmZpZWxkPy5nZXRCaW5kaW5nKFwiaXRlbXNcIik/LmF0dGFjaENoYW5nZSgoKSA9PiB7XG5cdFx0XHRcdFx0XHRfcmVtb3ZlTWVzc2FnZXNGb3JBY3Rpb25QYXJhbXRlcihhY3Rpb25QYXJhbWV0ZXJJbmZvLnBhcmFtZXRlcik7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YWN0aW9uUGFyYW1ldGVySW5mbz8uZmllbGQ/LmdldEJpbmRpbmcoXCJ2YWx1ZVwiKT8uYXR0YWNoQ2hhbmdlKCgpID0+IHtcblx0XHRcdFx0XHRcdF9yZW1vdmVNZXNzYWdlc0ZvckFjdGlvblBhcmFtdGVyKGFjdGlvblBhcmFtZXRlckluZm8ucGFyYW1ldGVyKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRsZXQgc0FjdGlvblBhdGggPSBgJHtzQWN0aW9uTmFtZX0oLi4uKWA7XG5cdFx0XHRpZiAoIWFDb250ZXh0cy5sZW5ndGgpIHtcblx0XHRcdFx0c0FjdGlvblBhdGggPSBgLyR7c0FjdGlvblBhdGh9YDtcblx0XHRcdH1cblx0XHRcdG9EaWFsb2cuYmluZEVsZW1lbnQoe1xuXHRcdFx0XHRwYXRoOiBzQWN0aW9uUGF0aFxuXHRcdFx0fSk7XG5cdFx0XHRpZiAob1BhcmVudENvbnRyb2wpIHtcblx0XHRcdFx0Ly8gaWYgdGhlcmUgaXMgYSBwYXJlbnQgY29udHJvbCBzcGVjaWZpZWQgYWRkIHRoZSBkaWFsb2cgYXMgZGVwZW5kZW50XG5cdFx0XHRcdG9QYXJlbnRDb250cm9sLmFkZERlcGVuZGVudChvRGlhbG9nKTtcblx0XHRcdH1cblx0XHRcdGlmIChhQ29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRvRGlhbG9nLnNldEJpbmRpbmdDb250ZXh0KGFDb250ZXh0c1swXSk7IC8vIHVzZSBjb250ZXh0IG9mIGZpcnN0IHNlbGVjdGVkIGxpbmUgaXRlbVxuXHRcdFx0fVxuXHRcdFx0b09wZXJhdGlvbkJpbmRpbmcgPSBvRGlhbG9nLmdldE9iamVjdEJpbmRpbmcoKTtcblx0XHRcdG9EaWFsb2cub3BlbigpO1xuXHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRyZWplY3Qob0Vycm9yKTtcblx0XHR9XG5cdH0pO1xufVxuZnVuY3Rpb24gZ2V0QWN0aW9uUGFyYW1ldGVycyhvQWN0aW9uOiBhbnkpIHtcblx0Y29uc3QgYVBhcmFtZXRlcnMgPSBvQWN0aW9uLmdldE9iamVjdChcIiRQYXJhbWV0ZXJcIikgfHwgW107XG5cdGlmIChhUGFyYW1ldGVycyAmJiBhUGFyYW1ldGVycy5sZW5ndGgpIHtcblx0XHRpZiAob0FjdGlvbi5nZXRPYmplY3QoXCIkSXNCb3VuZFwiKSkge1xuXHRcdFx0Ly9pbiBjYXNlIG9mIGJvdW5kIGFjdGlvbnMsIGlnbm9yZSB0aGUgZmlyc3QgcGFyYW1ldGVyIGFuZCBjb25zaWRlciB0aGUgcmVzdFxuXHRcdFx0cmV0dXJuIGFQYXJhbWV0ZXJzLnNsaWNlKDEsIGFQYXJhbWV0ZXJzLmxlbmd0aCkgfHwgW107XG5cdFx0fVxuXHR9XG5cdHJldHVybiBhUGFyYW1ldGVycztcbn1cbmZ1bmN0aW9uIGdldElzQWN0aW9uQ3JpdGljYWwob01ldGFNb2RlbDogYW55LCBzUGF0aDogYW55LCBjb250ZXh0cz86IGFueSwgb0JvdW5kQWN0aW9uPzogYW55KSB7XG5cdGNvbnN0IHZBY3Rpb25Dcml0aWNhbCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNBY3Rpb25Dcml0aWNhbGApO1xuXHRsZXQgc0NyaXRpY2FsUGF0aCA9IHZBY3Rpb25Dcml0aWNhbCAmJiB2QWN0aW9uQ3JpdGljYWwuJFBhdGg7XG5cdGlmICghc0NyaXRpY2FsUGF0aCkge1xuXHRcdC8vIHRoZSBzdGF0aWMgdmFsdWUgc2NlbmFyaW8gZm9yIGlzQWN0aW9uQ3JpdGljYWxcblx0XHRyZXR1cm4gISF2QWN0aW9uQ3JpdGljYWw7XG5cdH1cblx0Y29uc3QgYUJpbmRpbmdQYXJhbXMgPSBvQm91bmRBY3Rpb24gJiYgb0JvdW5kQWN0aW9uLmdldE9iamVjdChcIiRQYXJhbWV0ZXJcIiksXG5cdFx0YVBhdGhzID0gc0NyaXRpY2FsUGF0aCAmJiBzQ3JpdGljYWxQYXRoLnNwbGl0KFwiL1wiKSxcblx0XHRiQ29uZGl0aW9uID1cblx0XHRcdGFCaW5kaW5nUGFyYW1zICYmIGFCaW5kaW5nUGFyYW1zLmxlbmd0aCAmJiB0eXBlb2YgYUJpbmRpbmdQYXJhbXMgPT09IFwib2JqZWN0XCIgJiYgc0NyaXRpY2FsUGF0aCAmJiBjb250ZXh0cyAmJiBjb250ZXh0cy5sZW5ndGg7XG5cdGlmIChiQ29uZGl0aW9uKSB7XG5cdFx0Ly9pbiBjYXNlIGJpbmRpbmcgcGF0YW1ldGVycyBhcmUgdGhlcmUgaW4gcGF0aCBuZWVkIHRvIHJlbW92ZSBlZzogLSBfaXQvaXNWZXJpZmllZCA9PiBuZWVkIHRvIHJlbW92ZSBfaXQgYW5kIHRoZSBwYXRoIHNob3VsZCBiZSBpc1ZlcmlmaWVkXG5cdFx0YUJpbmRpbmdQYXJhbXMuZmlsdGVyKGZ1bmN0aW9uIChvUGFyYW1zOiBhbnkpIHtcblx0XHRcdGNvbnN0IGluZGV4ID0gYVBhdGhzICYmIGFQYXRocy5pbmRleE9mKG9QYXJhbXMuJE5hbWUpO1xuXHRcdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdFx0YVBhdGhzLnNwbGljZShpbmRleCwgMSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0c0NyaXRpY2FsUGF0aCA9IGFQYXRocy5qb2luKFwiL1wiKTtcblx0XHRyZXR1cm4gY29udGV4dHNbMF0uZ2V0T2JqZWN0KHNDcml0aWNhbFBhdGgpO1xuXHR9IGVsc2UgaWYgKHNDcml0aWNhbFBhdGgpIHtcblx0XHQvL2lmIHNjZW5hcmlvIGlzIHBhdGggYmFzZWQgcmV0dXJuIHRoZSBwYXRoIHZhbHVlXG5cdFx0cmV0dXJuIGNvbnRleHRzWzBdLmdldE9iamVjdChzQ3JpdGljYWxQYXRoKTtcblx0fVxufVxuXG5mdW5jdGlvbiBfZ2V0QWN0aW9uUGFyYW1ldGVyQWN0aW9uTmFtZShvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLCBzQWN0aW9uTGFiZWw6IHN0cmluZywgc0FjdGlvbk5hbWU6IHN0cmluZywgc0VudGl0eVNldE5hbWU6IHN0cmluZykge1xuXHRsZXQgYm91bmRBY3Rpb25OYW1lOiBhbnkgPSBzQWN0aW9uTmFtZSA/IHNBY3Rpb25OYW1lIDogbnVsbDtcblx0Y29uc3QgYUFjdGlvbk5hbWUgPSBib3VuZEFjdGlvbk5hbWUuc3BsaXQoXCIuXCIpO1xuXHRib3VuZEFjdGlvbk5hbWUgPSBib3VuZEFjdGlvbk5hbWUuaW5kZXhPZihcIi5cIikgPj0gMCA/IGFBY3Rpb25OYW1lW2FBY3Rpb25OYW1lLmxlbmd0aCAtIDFdIDogYm91bmRBY3Rpb25OYW1lO1xuXHRjb25zdCBzdWZmaXhSZXNvdXJjZUtleSA9IGJvdW5kQWN0aW9uTmFtZSAmJiBzRW50aXR5U2V0TmFtZSA/IGAke3NFbnRpdHlTZXROYW1lfXwke2JvdW5kQWN0aW9uTmFtZX1gIDogXCJcIjtcblx0Y29uc3Qgc0tleSA9IFwiQUNUSU9OX1BBUkFNRVRFUl9ESUFMT0dfQUNUSU9OX05BTUVcIjtcblx0Y29uc3QgYlJlc291cmNlS2V5RXhpc3RzID1cblx0XHRvUmVzb3VyY2VCdW5kbGUgJiYgQ29tbW9uVXRpbHMuY2hlY2tJZlJlc291cmNlS2V5RXhpc3RzKChvUmVzb3VyY2VCdW5kbGUgYXMgYW55KS5hQ3VzdG9tQnVuZGxlcywgYCR7c0tleX18JHtzdWZmaXhSZXNvdXJjZUtleX1gKTtcblx0aWYgKHNBY3Rpb25MYWJlbCkge1xuXHRcdGlmIChiUmVzb3VyY2VLZXlFeGlzdHMpIHtcblx0XHRcdHJldHVybiBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChzS2V5LCBvUmVzb3VyY2VCdW5kbGUsIG51bGwsIHN1ZmZpeFJlc291cmNlS2V5KTtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0b1Jlc291cmNlQnVuZGxlICYmXG5cdFx0XHRDb21tb25VdGlscy5jaGVja0lmUmVzb3VyY2VLZXlFeGlzdHMoKG9SZXNvdXJjZUJ1bmRsZSBhcyBhbnkpLmFDdXN0b21CdW5kbGVzLCBgJHtzS2V5fXwke3NFbnRpdHlTZXROYW1lfWApXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoc0tleSwgb1Jlc291cmNlQnVuZGxlLCBudWxsLCBgJHtzRW50aXR5U2V0TmFtZX1gKTtcblx0XHR9IGVsc2UgaWYgKG9SZXNvdXJjZUJ1bmRsZSAmJiBDb21tb25VdGlscy5jaGVja0lmUmVzb3VyY2VLZXlFeGlzdHMoKG9SZXNvdXJjZUJ1bmRsZSBhcyBhbnkpLmFDdXN0b21CdW5kbGVzLCBgJHtzS2V5fWApKSB7XG5cdFx0XHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoc0tleSwgb1Jlc291cmNlQnVuZGxlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHNBY3Rpb25MYWJlbDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFwiQ19DT01NT05fRElBTE9HX09LXCIsIG9SZXNvdXJjZUJ1bmRsZSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gaGFuZGxlNDEyRmFpbGVkVHJhbnNpdGlvbnMoXG5cdG1QYXJhbWV0ZXJzOiBhbnksXG5cdG9BY3Rpb246IGFueSxcblx0c0dyb3VwSWQ6IHN0cmluZyxcblx0Y3VycmVudF9jb250ZXh0X2luZGV4OiBudW1iZXIgfCBudWxsLFxuXHRpQ29udGV4dExlbmd0aDogbnVtYmVyIHwgbnVsbCxcblx0bWVzc2FnZUhhbmRsZXI6IE1lc3NhZ2VIYW5kbGVyIHwgdW5kZWZpbmVkLFxuXHRvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlXG4pIHtcblx0aWYgKG1QYXJhbWV0ZXJzLmFDb250ZXh0cy5sZW5ndGggPiAxKSB7XG5cdFx0bGV0IHN0cmljdEhhbmRsaW5nRmFpbHM6IGFueTtcblx0XHRjb25zdCBtZXNzYWdlcyA9IHNhcC51aS5nZXRDb3JlKCkuZ2V0TWVzc2FnZU1hbmFnZXIoKS5nZXRNZXNzYWdlTW9kZWwoKS5nZXREYXRhKCk7XG5cdFx0Y29uc3QgcHJvY2Vzc2VkTWVzc2FnZUlkcyA9IG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwicHJvY2Vzc2VkTWVzc2FnZUlkc1wiKTtcblx0XHRjb25zdCB0cmFuc2l0aW9uTWVzc2FnZXMgPSBtZXNzYWdlcy5maWx0ZXIoZnVuY3Rpb24gKG1lc3NhZ2U6IE1lc3NhZ2UpIHtcblx0XHRcdGNvbnN0IGlzRHVwbGljYXRlID0gcHJvY2Vzc2VkTWVzc2FnZUlkcy5maW5kKGZ1bmN0aW9uIChpZDogc3RyaW5nKSB7XG5cdFx0XHRcdHJldHVybiBtZXNzYWdlLmdldElkKCkgPT09IGlkO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoIWlzRHVwbGljYXRlKSB7XG5cdFx0XHRcdHByb2Nlc3NlZE1lc3NhZ2VJZHMucHVzaChtZXNzYWdlLmdldElkKCkpO1xuXHRcdFx0XHRpZiAobWVzc2FnZS5nZXRUeXBlKCkgPT09IE1lc3NhZ2VUeXBlLlN1Y2Nlc3MpIHtcblx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcblx0XHRcdFx0XHRcdFwiRGVsYXlNZXNzYWdlc1wiLFxuXHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCJEZWxheU1lc3NhZ2VzXCIpLmNvbmNhdChtZXNzYWdlKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBtZXNzYWdlLmdldFBlcnNpc3RlbnQoKSA9PT0gdHJ1ZSAmJiBtZXNzYWdlLmdldFR5cGUoKSAhPT0gTWVzc2FnZVR5cGUuU3VjY2VzcyAmJiAhaXNEdXBsaWNhdGU7XG5cdFx0fSk7XG5cdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJwcm9jZXNzZWRNZXNzYWdlSWRzXCIsIHByb2Nlc3NlZE1lc3NhZ2VJZHMpO1xuXHRcdGlmICh0cmFuc2l0aW9uTWVzc2FnZXMubGVuZ3RoKSB7XG5cdFx0XHRpZiAobVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQpIHtcblx0XHRcdFx0c3RyaWN0SGFuZGxpbmdGYWlscyA9IG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwic3RyaWN0SGFuZGxpbmdGYWlsc1wiKTtcblx0XHRcdFx0c3RyaWN0SGFuZGxpbmdGYWlscy5wdXNoKHtcblx0XHRcdFx0XHRvQWN0aW9uOiBvQWN0aW9uLFxuXHRcdFx0XHRcdGdyb3VwSWQ6IHNHcm91cElkXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcInN0cmljdEhhbmRsaW5nRmFpbHNcIiwgc3RyaWN0SGFuZGxpbmdGYWlscyk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aWYgKFxuXHRcdGN1cnJlbnRfY29udGV4dF9pbmRleCA9PT0gaUNvbnRleHRMZW5ndGggJiZcblx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCAmJlxuXHRcdG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwiNDEyTWVzc2FnZXNcIik/Lmxlbmd0aFxuXHQpIHtcblx0XHRvcGVyYXRpb25zSGVscGVyLnJlbmRlck1lc3NhZ2VWaWV3KFxuXHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwiNDEyTWVzc2FnZXNcIiksXG5cdFx0XHR0cnVlXG5cdFx0KTtcblx0fVxufVxuXG5mdW5jdGlvbiBleGVjdXRlRGVwZW5kaW5nT25TZWxlY3RlZENvbnRleHRzKFxuXHRvQWN0aW9uOiBhbnksXG5cdG1QYXJhbWV0ZXJzOiBhbnksXG5cdGJHZXRCb3VuZENvbnRleHQ6IGJvb2xlYW4sXG5cdHNHcm91cElkOiBzdHJpbmcsXG5cdG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUsXG5cdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlciB8IHVuZGVmaW5lZCxcblx0aUNvbnRleHRMZW5ndGg6IG51bWJlciB8IG51bGwsXG5cdGN1cnJlbnRfY29udGV4dF9pbmRleDogbnVtYmVyIHwgbnVsbFxuKSB7XG5cdGxldCBvQWN0aW9uUHJvbWlzZSxcblx0XHRiRW5hYmxlU3RyaWN0SGFuZGxpbmcgPSB0cnVlO1xuXHRpZiAoYkdldEJvdW5kQ29udGV4dCkge1xuXHRcdGNvbnN0IHNQYXRoID0gb0FjdGlvbi5nZXRCb3VuZENvbnRleHQoKS5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgc01ldGFQYXRoID0gb0FjdGlvbi5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE1ldGFQYXRoKHNQYXRoKTtcblx0XHRjb25zdCBvUHJvcGVydHkgPSBvQWN0aW9uLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KHNNZXRhUGF0aCk7XG5cdFx0aWYgKG9Qcm9wZXJ0eSAmJiBvUHJvcGVydHlbMF0/LiRraW5kICE9PSBcIkFjdGlvblwiKSB7XG5cdFx0XHQvL2RvIG5vdCBlbmFibGUgdGhlIHN0cmljdCBoYW5kbGluZyBpZiBpdHMgbm90IGFuIGFjdGlvblxuXHRcdFx0YkVuYWJsZVN0cmljdEhhbmRsaW5nID0gZmFsc2U7XG5cdFx0fVxuXHR9XG5cblx0aWYgKCFiRW5hYmxlU3RyaWN0SGFuZGxpbmcpIHtcblx0XHRvQWN0aW9uUHJvbWlzZSA9IGJHZXRCb3VuZENvbnRleHRcblx0XHRcdD8gb0FjdGlvbi5leGVjdXRlKHNHcm91cElkKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0FjdGlvbi5nZXRCb3VuZENvbnRleHQoKTtcblx0XHRcdCAgfSlcblx0XHRcdDogb0FjdGlvbi5leGVjdXRlKHNHcm91cElkKTtcblx0fSBlbHNlIHtcblx0XHRvQWN0aW9uUHJvbWlzZSA9IGJHZXRCb3VuZENvbnRleHRcblx0XHRcdD8gb0FjdGlvblxuXHRcdFx0XHRcdC5leGVjdXRlKFxuXHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRvcGVyYXRpb25zSGVscGVyLmZuT25TdHJpY3RIYW5kbGluZ0ZhaWxlZC5iaW5kKFxuXHRcdFx0XHRcdFx0XHRvcGVyYXRpb25zLFxuXHRcdFx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZSxcblx0XHRcdFx0XHRcdFx0Y3VycmVudF9jb250ZXh0X2luZGV4LFxuXHRcdFx0XHRcdFx0XHRvQWN0aW9uLmdldENvbnRleHQoKSxcblx0XHRcdFx0XHRcdFx0aUNvbnRleHRMZW5ndGgsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGhhbmRsZTQxMkZhaWxlZFRyYW5zaXRpb25zKFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0b0FjdGlvbixcblx0XHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRfY29udGV4dF9pbmRleCxcblx0XHRcdFx0XHRcdFx0aUNvbnRleHRMZW5ndGgsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGVcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9BY3Rpb24uZ2V0Qm91bmRDb250ZXh0KCkpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGhhbmRsZTQxMkZhaWxlZFRyYW5zaXRpb25zKFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0b0FjdGlvbixcblx0XHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRfY29udGV4dF9pbmRleCxcblx0XHRcdFx0XHRcdFx0aUNvbnRleHRMZW5ndGgsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGVcblx0XHRcdFx0XHRcdCk7XG5cblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHQ6IG9BY3Rpb25cblx0XHRcdFx0XHQuZXhlY3V0ZShcblx0XHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0b3BlcmF0aW9uc0hlbHBlci5mbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQuYmluZChcblx0XHRcdFx0XHRcdFx0b3BlcmF0aW9ucyxcblx0XHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRfY29udGV4dF9pbmRleCxcblx0XHRcdFx0XHRcdFx0b0FjdGlvbi5nZXRDb250ZXh0KCksXG5cdFx0XHRcdFx0XHRcdGlDb250ZXh0TGVuZ3RoLFxuXHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlclxuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdClcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAocmVzdWx0OiBhbnkpIHtcblx0XHRcdFx0XHRcdGhhbmRsZTQxMkZhaWxlZFRyYW5zaXRpb25zKFxuXHRcdFx0XHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0XHRcdFx0b0FjdGlvbixcblx0XHRcdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRfY29udGV4dF9pbmRleCxcblx0XHRcdFx0XHRcdFx0aUNvbnRleHRMZW5ndGgsXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyLFxuXHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGVcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHJlc3VsdCk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0aGFuZGxlNDEyRmFpbGVkVHJhbnNpdGlvbnMoXG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0XHRvQWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRcdFx0Y3VycmVudF9jb250ZXh0X2luZGV4LFxuXHRcdFx0XHRcdFx0XHRpQ29udGV4dExlbmd0aCxcblx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdCgpO1xuXHRcdFx0XHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIG9BY3Rpb25Qcm9taXNlLmNhdGNoKCgpID0+IHtcblx0XHR0aHJvdyBDb25zdGFudHMuQWN0aW9uRXhlY3V0aW9uRmFpbGVkO1xuXHR9KTtcbn1cbmZ1bmN0aW9uIF9leGVjdXRlQWN0aW9uKG9BcHBDb21wb25lbnQ6IGFueSwgbVBhcmFtZXRlcnM6IGFueSwgb1BhcmVudENvbnRyb2w/OiBhbnksIG1lc3NhZ2VIYW5kbGVyPzogTWVzc2FnZUhhbmRsZXIpIHtcblx0Y29uc3QgYUNvbnRleHRzID0gbVBhcmFtZXRlcnMuYUNvbnRleHRzIHx8IFtdO1xuXHRjb25zdCBvTW9kZWwgPSBtUGFyYW1ldGVycy5tb2RlbDtcblx0Y29uc3QgYUFjdGlvblBhcmFtZXRlcnMgPSBtUGFyYW1ldGVycy5hQWN0aW9uUGFyYW1ldGVycyB8fCBbXTtcblx0Y29uc3Qgc0FjdGlvbk5hbWUgPSBtUGFyYW1ldGVycy5hY3Rpb25OYW1lO1xuXHRjb25zdCBmbk9uU3VibWl0dGVkID0gbVBhcmFtZXRlcnMuZm5PblN1Ym1pdHRlZDtcblx0Y29uc3QgZm5PblJlc3BvbnNlID0gbVBhcmFtZXRlcnMuZm5PblJlc3BvbnNlO1xuXHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBvUGFyZW50Q29udHJvbCAmJiBvUGFyZW50Q29udHJvbC5pc0EoXCJzYXAudWkuY29yZS5tdmMuVmlld1wiKSAmJiBvUGFyZW50Q29udHJvbC5nZXRDb250cm9sbGVyKCkub1Jlc291cmNlQnVuZGxlO1xuXHRsZXQgb0FjdGlvbjogYW55O1xuXG5cdGZ1bmN0aW9uIHNldEFjdGlvblBhcmFtZXRlckRlZmF1bHRWYWx1ZSgpIHtcblx0XHRpZiAoYUFjdGlvblBhcmFtZXRlcnMgJiYgYUFjdGlvblBhcmFtZXRlcnMubGVuZ3RoKSB7XG5cdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGFBY3Rpb25QYXJhbWV0ZXJzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGlmICghYUFjdGlvblBhcmFtZXRlcnNbal0udmFsdWUpIHtcblx0XHRcdFx0XHRzd2l0Y2ggKGFBY3Rpb25QYXJhbWV0ZXJzW2pdLiRUeXBlKSB7XG5cdFx0XHRcdFx0XHRjYXNlIFwiRWRtLlN0cmluZ1wiOlxuXHRcdFx0XHRcdFx0XHRhQWN0aW9uUGFyYW1ldGVyc1tqXS52YWx1ZSA9IFwiXCI7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcIkVkbS5Cb29sZWFuXCI6XG5cdFx0XHRcdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzW2pdLnZhbHVlID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcIkVkbS5CeXRlXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiRWRtLkludDE2XCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiRWRtLkludDMyXCI6XG5cdFx0XHRcdFx0XHRjYXNlIFwiRWRtLkludDY0XCI6XG5cdFx0XHRcdFx0XHRcdGFBY3Rpb25QYXJhbWV0ZXJzW2pdLnZhbHVlID0gMDtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHQvLyB0YmNcblx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRvQWN0aW9uLnNldFBhcmFtZXRlcihhQWN0aW9uUGFyYW1ldGVyc1tqXS4kTmFtZSwgYUFjdGlvblBhcmFtZXRlcnNbal0udmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmIChhQ29udGV4dHMubGVuZ3RoKSB7XG5cdFx0Ly8gVE9ETzogcmVmYWN0b3IgdG8gZGlyZWN0IHVzZSBvZiBQcm9taXNlLmFsbFNldHRsZWRcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6ICh2YWx1ZTogYW55KSA9PiB2b2lkKSB7XG5cdFx0XHRjb25zdCBtQmluZGluZ1BhcmFtZXRlcnMgPSBtUGFyYW1ldGVycy5tQmluZGluZ1BhcmFtZXRlcnM7XG5cdFx0XHRjb25zdCBiR3JvdXBlZCA9IG1QYXJhbWV0ZXJzLmJHcm91cGVkO1xuXHRcdFx0Y29uc3QgYkdldEJvdW5kQ29udGV4dCA9IG1QYXJhbWV0ZXJzLmJHZXRCb3VuZENvbnRleHQ7XG5cdFx0XHRpZiAobVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQgJiYgIW1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LmdldFByb3BlcnR5KFwiNDEyRXhlY3V0ZWRcIikpIHtcblx0XHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzdHJpY3RIYW5kbGluZ1Byb21pc2VzXCIsIFtdKTtcblx0XHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzdHJpY3RIYW5kbGluZ0ZhaWxzXCIsIFtdKTtcblx0XHRcdFx0bVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCI0MTJNZXNzYWdlc1wiLCBbXSk7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwicHJvY2Vzc2VkTWVzc2FnZUlkc1wiLCBbXSk7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLmludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiRGVsYXlNZXNzYWdlc1wiLCBbXSk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBhQWN0aW9uUHJvbWlzZXM6IGFueVtdID0gW107XG5cdFx0XHRsZXQgb0FjdGlvblByb21pc2U7XG5cdFx0XHRsZXQgaTtcblx0XHRcdGxldCBzR3JvdXBJZDogc3RyaW5nO1xuXHRcdFx0Y29uc3QgZm5FeGVjdXRlQWN0aW9uID0gZnVuY3Rpb24gKGFjdGlvbkNvbnRleHQ6IGFueSwgY3VycmVudF9jb250ZXh0X2luZGV4OiBhbnksIG9TaWRlRWZmZWN0OiBhbnksIGlDb250ZXh0TGVuZ3RoOiBhbnkpIHtcblx0XHRcdFx0c2V0QWN0aW9uUGFyYW1ldGVyRGVmYXVsdFZhbHVlKCk7XG5cdFx0XHRcdC8vIEZvciBpbnZvY2F0aW9uIGdyb3VwaW5nIFwiaXNvbGF0ZWRcIiBuZWVkIGJhdGNoIGdyb3VwIHBlciBhY3Rpb24gY2FsbFxuXHRcdFx0XHRzR3JvdXBJZCA9ICFiR3JvdXBlZCA/IGAkYXV0by4ke2N1cnJlbnRfY29udGV4dF9pbmRleH1gIDogYWN0aW9uQ29udGV4dC5nZXRVcGRhdGVHcm91cElkKCk7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLnJlcXVlc3RTaWRlRWZmZWN0cyA9IGZuUmVxdWVzdFNpZGVFZmZlY3RzLmJpbmQob3BlcmF0aW9ucywgb0FwcENvbXBvbmVudCwgb1NpZGVFZmZlY3QsIG1QYXJhbWV0ZXJzKTtcblx0XHRcdFx0b0FjdGlvblByb21pc2UgPSBleGVjdXRlRGVwZW5kaW5nT25TZWxlY3RlZENvbnRleHRzKFxuXHRcdFx0XHRcdGFjdGlvbkNvbnRleHQsXG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0YkdldEJvdW5kQ29udGV4dCxcblx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0aUNvbnRleHRMZW5ndGgsXG5cdFx0XHRcdFx0Y3VycmVudF9jb250ZXh0X2luZGV4XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGFBY3Rpb25Qcm9taXNlcy5wdXNoKG9BY3Rpb25Qcm9taXNlKTtcblx0XHRcdFx0Zm5SZXF1ZXN0U2lkZUVmZmVjdHMob0FwcENvbXBvbmVudCwgb1NpZGVFZmZlY3QsIG1QYXJhbWV0ZXJzLCBzR3JvdXBJZCk7XG5cdFx0XHR9O1xuXHRcdFx0Y29uc3QgZm5FeGVjdXRlU2luZ2xlQWN0aW9uID0gZnVuY3Rpb24gKGFjdGlvbkNvbnRleHQ6IGFueSwgY3VycmVudF9jb250ZXh0X2luZGV4OiBhbnksIG9TaWRlRWZmZWN0OiBhbnksIGlDb250ZXh0TGVuZ3RoOiBhbnkpIHtcblx0XHRcdFx0Y29uc3QgYUxvY2FsUHJvbWlzZTogYW55ID0gW107XG5cdFx0XHRcdHNldEFjdGlvblBhcmFtZXRlckRlZmF1bHRWYWx1ZSgpO1xuXHRcdFx0XHQvLyBGb3IgaW52b2NhdGlvbiBncm91cGluZyBcImlzb2xhdGVkXCIgbmVlZCBiYXRjaCBncm91cCBwZXIgYWN0aW9uIGNhbGxcblx0XHRcdFx0c0dyb3VwSWQgPSBgYXBpTW9kZSR7Y3VycmVudF9jb250ZXh0X2luZGV4fWA7XG5cdFx0XHRcdG1QYXJhbWV0ZXJzLnJlcXVlc3RTaWRlRWZmZWN0cyA9IGZuUmVxdWVzdFNpZGVFZmZlY3RzLmJpbmQoXG5cdFx0XHRcdFx0b3BlcmF0aW9ucyxcblx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LFxuXHRcdFx0XHRcdG9TaWRlRWZmZWN0LFxuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdGFMb2NhbFByb21pc2Vcblx0XHRcdFx0KTtcblx0XHRcdFx0b0FjdGlvblByb21pc2UgPSBleGVjdXRlRGVwZW5kaW5nT25TZWxlY3RlZENvbnRleHRzKFxuXHRcdFx0XHRcdGFjdGlvbkNvbnRleHQsXG5cdFx0XHRcdFx0bVBhcmFtZXRlcnMsXG5cdFx0XHRcdFx0YkdldEJvdW5kQ29udGV4dCxcblx0XHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXIsXG5cdFx0XHRcdFx0aUNvbnRleHRMZW5ndGgsXG5cdFx0XHRcdFx0Y3VycmVudF9jb250ZXh0X2luZGV4XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGFBY3Rpb25Qcm9taXNlcy5wdXNoKG9BY3Rpb25Qcm9taXNlKTtcblx0XHRcdFx0YUxvY2FsUHJvbWlzZS5wdXNoKG9BY3Rpb25Qcm9taXNlKTtcblx0XHRcdFx0Zm5SZXF1ZXN0U2lkZUVmZmVjdHMob0FwcENvbXBvbmVudCwgb1NpZGVFZmZlY3QsIG1QYXJhbWV0ZXJzLCBzR3JvdXBJZCwgYUxvY2FsUHJvbWlzZSk7XG5cdFx0XHRcdG9Nb2RlbC5zdWJtaXRCYXRjaChzR3JvdXBJZCk7XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLmFsbFNldHRsZWQoYUxvY2FsUHJvbWlzZSk7XG5cdFx0XHR9O1xuXG5cdFx0XHRhc3luYyBmdW5jdGlvbiBmbkV4ZWN1dGVTZXF1ZW50aWFsbHkoY29udGV4dHNUb0V4ZWN1dGU6IENvbnRleHRbXSkge1xuXHRcdFx0XHQvLyBPbmUgYWN0aW9uIGFuZCBpdHMgc2lkZSBlZmZlY3RzIGFyZSBjb21wbGV0ZWQgYmVmb3JlIHRoZSBuZXh0IGFjdGlvbiBpcyBleGVjdXRlZFxuXHRcdFx0XHQoXG5cdFx0XHRcdFx0Zm5PblN1Ym1pdHRlZCB8fFxuXHRcdFx0XHRcdGZ1bmN0aW9uIG5vb3AoKSB7XG5cdFx0XHRcdFx0XHQvKiovXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHQpKGFBY3Rpb25Qcm9taXNlcyk7XG5cdFx0XHRcdGZ1bmN0aW9uIHByb2Nlc3NPbmVBY3Rpb24oY29udGV4dDogYW55LCBhY3Rpb25JbmRleDogYW55LCBpQ29udGV4dExlbmd0aDogYW55KSB7XG5cdFx0XHRcdFx0b0FjdGlvbiA9IG9Nb2RlbC5iaW5kQ29udGV4dChgJHtzQWN0aW9uTmFtZX0oLi4uKWAsIGNvbnRleHQsIG1CaW5kaW5nUGFyYW1ldGVycyk7XG5cdFx0XHRcdFx0cmV0dXJuIGZuRXhlY3V0ZVNpbmdsZUFjdGlvbihcblx0XHRcdFx0XHRcdG9BY3Rpb24sXG5cdFx0XHRcdFx0XHRhY3Rpb25JbmRleCxcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0Y29udGV4dDogY29udGV4dCxcblx0XHRcdFx0XHRcdFx0cGF0aEV4cHJlc3Npb25zOiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdCAmJiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMsXG5cdFx0XHRcdFx0XHRcdHRyaWdnZXJBY3Rpb25zOiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdCAmJiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC50cmlnZ2VyQWN0aW9uc1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGlDb250ZXh0TGVuZ3RoXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIHNlcmlhbGl6YXRpb246IHByb2Nlc3NPbmVBY3Rpb24gdG8gYmUgY2FsbGVkIGZvciBlYWNoIGVudHJ5IGluIGNvbnRleHRzVG9FeGVjdXRlIG9ubHkgYWZ0ZXIgdGhlIHByb21pc2UgcmV0dXJuZWQgZnJvbSB0aGUgb25lIGJlZm9yZSBoYXMgYmVlbiByZXNvbHZlZFxuXHRcdFx0XHRhd2FpdCBjb250ZXh0c1RvRXhlY3V0ZS5yZWR1Y2UoYXN5bmMgKHByb21pc2U6IFByb21pc2U8dm9pZD4sIGNvbnRleHQ6IENvbnRleHQsIGlkOiBpbnQpOiBQcm9taXNlPHZvaWQ+ID0+IHtcblx0XHRcdFx0XHRhd2FpdCBwcm9taXNlO1xuXHRcdFx0XHRcdGF3YWl0IHByb2Nlc3NPbmVBY3Rpb24oY29udGV4dCwgaWQgKyAxLCBhQ29udGV4dHMubGVuZ3RoKTtcblx0XHRcdFx0fSwgUHJvbWlzZS5yZXNvbHZlKCkpO1xuXG5cdFx0XHRcdGZuSGFuZGxlUmVzdWx0cygpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWJHcm91cGVkKSB7XG5cdFx0XHRcdC8vIEZvciBpbnZvY2F0aW9uIGdyb3VwaW5nIFwiaXNvbGF0ZWRcIiwgZW5zdXJlIHRoYXQgZWFjaCBhY3Rpb24gYW5kIG1hdGNoaW5nIHNpZGUgZWZmZWN0c1xuXHRcdFx0XHQvLyBhcmUgcHJvY2Vzc2VkIGJlZm9yZSB0aGUgbmV4dCBzZXQgaXMgc3VibWl0dGVkLiBXb3JrYXJvdW5kIHVudGlsIEpTT04gYmF0Y2ggaXMgYXZhaWxhYmxlLlxuXHRcdFx0XHQvLyBBbGxvdyBhbHNvIGZvciBMaXN0IFJlcG9ydC5cblx0XHRcdFx0Zm5FeGVjdXRlU2VxdWVudGlhbGx5KGFDb250ZXh0cyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgYUNvbnRleHRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0b0FjdGlvbiA9IG9Nb2RlbC5iaW5kQ29udGV4dChgJHtzQWN0aW9uTmFtZX0oLi4uKWAsIGFDb250ZXh0c1tpXSwgbUJpbmRpbmdQYXJhbWV0ZXJzKTtcblx0XHRcdFx0XHRmbkV4ZWN1dGVBY3Rpb24oXG5cdFx0XHRcdFx0XHRvQWN0aW9uLFxuXHRcdFx0XHRcdFx0YUNvbnRleHRzLmxlbmd0aCA8PSAxID8gbnVsbCA6IGksXG5cdFx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRcdGNvbnRleHQ6IGFDb250ZXh0c1tpXSxcblx0XHRcdFx0XHRcdFx0cGF0aEV4cHJlc3Npb25zOiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdCAmJiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMsXG5cdFx0XHRcdFx0XHRcdHRyaWdnZXJBY3Rpb25zOiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdCAmJiBtUGFyYW1ldGVycy5hZGRpdGlvbmFsU2lkZUVmZmVjdC50cmlnZ2VyQWN0aW9uc1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGFDb250ZXh0cy5sZW5ndGhcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdChcblx0XHRcdFx0XHRmbk9uU3VibWl0dGVkIHx8XG5cdFx0XHRcdFx0ZnVuY3Rpb24gbm9vcCgpIHtcblx0XHRcdFx0XHRcdC8qKi9cblx0XHRcdFx0XHR9XG5cdFx0XHRcdCkoYUFjdGlvblByb21pc2VzKTtcblx0XHRcdFx0Zm5IYW5kbGVSZXN1bHRzKCk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGZuSGFuZGxlUmVzdWx0cygpIHtcblx0XHRcdFx0Ly8gUHJvbWlzZS5hbGxTZXR0bGVkIHdpbGwgbmV2ZXIgYmUgcmVqZWN0ZWQuIEhvd2V2ZXIsIGVzbGludCByZXF1aXJlcyBlaXRoZXIgY2F0Y2ggb3IgcmV0dXJuIC0gdGh1cyB3ZSByZXR1cm4gdGhlIHJlc3VsdGluZyBQcm9taXNlIGFsdGhvdWdoIG5vIG9uZSB3aWxsIHVzZSBpdC5cblx0XHRcdFx0cmV0dXJuIFByb21pc2UuYWxsU2V0dGxlZChhQWN0aW9uUHJvbWlzZXMpLnRoZW4ocmVzb2x2ZSk7XG5cdFx0XHR9XG5cdFx0fSkuZmluYWxseShmdW5jdGlvbiAoKSB7XG5cdFx0XHQoXG5cdFx0XHRcdGZuT25SZXNwb25zZSB8fFxuXHRcdFx0XHRmdW5jdGlvbiBub29wKCkge1xuXHRcdFx0XHRcdC8qKi9cblx0XHRcdFx0fVxuXHRcdFx0KSgpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdG9BY3Rpb24gPSBvTW9kZWwuYmluZENvbnRleHQoYC8ke3NBY3Rpb25OYW1lfSguLi4pYCk7XG5cdFx0c2V0QWN0aW9uUGFyYW1ldGVyRGVmYXVsdFZhbHVlKCk7XG5cdFx0Y29uc3Qgc0dyb3VwSWQgPSBcImFjdGlvbkltcG9ydFwiO1xuXHRcdGNvbnN0IG9BY3Rpb25Qcm9taXNlID0gb0FjdGlvbi5leGVjdXRlKFxuXHRcdFx0c0dyb3VwSWQsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRvcGVyYXRpb25zSGVscGVyLmZuT25TdHJpY3RIYW5kbGluZ0ZhaWxlZC5iaW5kKFxuXHRcdFx0XHRvcGVyYXRpb25zLFxuXHRcdFx0XHRzR3JvdXBJZCxcblx0XHRcdFx0eyBsYWJlbDogbVBhcmFtZXRlcnMubGFiZWwsIG1vZGVsOiBvTW9kZWwgfSxcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRudWxsLFxuXHRcdFx0XHRtZXNzYWdlSGFuZGxlclxuXHRcdFx0KVxuXHRcdCk7XG5cdFx0b01vZGVsLnN1Ym1pdEJhdGNoKHNHcm91cElkKTtcblx0XHQvLyB0cmlnZ2VyIG9uU3VibWl0dGVkIFwiZXZlbnRcIlxuXHRcdChcblx0XHRcdGZuT25TdWJtaXR0ZWQgfHxcblx0XHRcdGZ1bmN0aW9uIG5vb3AoKSB7XG5cdFx0XHRcdC8qKi9cblx0XHRcdH1cblx0XHQpKG9BY3Rpb25Qcm9taXNlKTtcblx0XHRyZXR1cm4gb0FjdGlvblByb21pc2UuZmluYWxseShmdW5jdGlvbiAoKSB7XG5cdFx0XHQoXG5cdFx0XHRcdGZuT25SZXNwb25zZSB8fFxuXHRcdFx0XHRmdW5jdGlvbiBub29wKCkge1xuXHRcdFx0XHRcdC8qKi9cblx0XHRcdFx0fVxuXHRcdFx0KSgpO1xuXHRcdH0pO1xuXHR9XG59XG5mdW5jdGlvbiBfZ2V0UGF0aChvQWN0aW9uQ29udGV4dDogYW55LCBzQWN0aW9uTmFtZTogYW55KSB7XG5cdGxldCBzUGF0aCA9IG9BY3Rpb25Db250ZXh0LmdldFBhdGgoKTtcblx0c1BhdGggPSBvQWN0aW9uQ29udGV4dC5nZXRPYmplY3QoXCIkSXNCb3VuZFwiKSA/IHNQYXRoLnNwbGl0KFwiQCR1aTUub3ZlcmxvYWRcIilbMF0gOiBzUGF0aC5zcGxpdChcIi8wXCIpWzBdO1xuXHRyZXR1cm4gc1BhdGguc3BsaXQoYC8ke3NBY3Rpb25OYW1lfWApWzBdO1xufVxuXG5mdW5jdGlvbiBfdmFsdWVzUHJvdmlkZWRGb3JBbGxQYXJhbWV0ZXJzKFxuXHRpc0NyZWF0ZUFjdGlvbjogYm9vbGVhbixcblx0YWN0aW9uUGFyYW1ldGVyczogUmVjb3JkPHN0cmluZywgYW55PltdLFxuXHRwYXJhbWV0ZXJWYWx1ZXM/OiBSZWNvcmQ8c3RyaW5nLCBhbnk+W10sXG5cdHN0YXJ0dXBQYXJhbWV0ZXJzPzogYW55XG4pOiBib29sZWFuIHtcblx0aWYgKHBhcmFtZXRlclZhbHVlcykge1xuXHRcdC8vIElmIHNob3dEaWFsb2cgaXMgZmFsc2UgYnV0IHRoZXJlIGFyZSBwYXJhbWV0ZXJzIGZyb20gdGhlIGludm9rZUFjdGlvbiBjYWxsLCB3ZSBuZWVkIHRvIGNoZWNrIHRoYXQgdmFsdWVzIGhhdmUgYmVlblxuXHRcdC8vIHByb3ZpZGVkIGZvciBhbGwgb2YgdGhlbVxuXHRcdGZvciAoY29uc3QgYWN0aW9uUGFyYW1ldGVyIG9mIGFjdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0YWN0aW9uUGFyYW1ldGVyLiROYW1lICE9PSBcIlJlc3VsdElzQWN0aXZlRW50aXR5XCIgJiZcblx0XHRcdFx0IXBhcmFtZXRlclZhbHVlcz8uZmluZCgoZWxlbWVudDogYW55KSA9PiBlbGVtZW50Lm5hbWUgPT09IGFjdGlvblBhcmFtZXRlci4kTmFtZSlcblx0XHRcdCkge1xuXHRcdFx0XHQvLyBBdCBsZWFzdCBmb3Igb25lIHBhcmFtZXRlciBubyB2YWx1ZSBoYXMgYmVlbiBwcm92aWRlZCwgc28gd2UgY2FuJ3Qgc2tpcCB0aGUgZGlhbG9nXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH0gZWxzZSBpZiAoaXNDcmVhdGVBY3Rpb24gJiYgc3RhcnR1cFBhcmFtZXRlcnMpIHtcblx0XHQvLyBJZiBwYXJhbWV0ZXJzIGhhdmUgYmVlbiBwcm92aWRlZCBkdXJpbmcgYXBwbGljYXRpb24gbGF1bmNoLCB3ZSBuZWVkIHRvIGNoZWNrIGlmIHRoZSBzZXQgaXMgY29tcGxldGVcblx0XHQvLyBJZiBub3QsIHRoZSBwYXJhbWV0ZXIgZGlhbG9nIHN0aWxsIG5lZWRzIHRvIGJlIHNob3duLlxuXHRcdGZvciAoY29uc3QgYWN0aW9uUGFyYW1ldGVyIG9mIGFjdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdGlmICghc3RhcnR1cFBhcmFtZXRlcnNbYWN0aW9uUGFyYW1ldGVyLiROYW1lXSkge1xuXHRcdFx0XHQvLyBBdCBsZWFzdCBmb3Igb25lIHBhcmFtZXRlciBubyB2YWx1ZSBoYXMgYmVlbiBwcm92aWRlZCwgc28gd2UgY2FuJ3Qgc2tpcCB0aGUgZGlhbG9nXG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGZuUmVxdWVzdFNpZGVFZmZlY3RzKG9BcHBDb21wb25lbnQ6IGFueSwgb1NpZGVFZmZlY3Q6IGFueSwgbVBhcmFtZXRlcnM6IGFueSwgc0dyb3VwSWQ6IGFueSwgYUxvY2FsUHJvbWlzZT86IGFueSkge1xuXHRjb25zdCBvU2lkZUVmZmVjdHNTZXJ2aWNlID0gb0FwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKTtcblx0bGV0IG9Mb2NhbFByb21pc2U7XG5cdC8vIHRyaWdnZXIgYWN0aW9ucyBmcm9tIHNpZGUgZWZmZWN0c1xuXHRpZiAob1NpZGVFZmZlY3QgJiYgb1NpZGVFZmZlY3QudHJpZ2dlckFjdGlvbnMgJiYgb1NpZGVFZmZlY3QudHJpZ2dlckFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0b1NpZGVFZmZlY3QudHJpZ2dlckFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoc1RyaWdnZXJBY3Rpb246IGFueSkge1xuXHRcdFx0aWYgKHNUcmlnZ2VyQWN0aW9uKSB7XG5cdFx0XHRcdG9Mb2NhbFByb21pc2UgPSBvU2lkZUVmZmVjdHNTZXJ2aWNlLmV4ZWN1dGVBY3Rpb24oc1RyaWdnZXJBY3Rpb24sIG9TaWRlRWZmZWN0LmNvbnRleHQsIHNHcm91cElkKTtcblx0XHRcdFx0aWYgKGFMb2NhbFByb21pc2UpIHtcblx0XHRcdFx0XHRhTG9jYWxQcm9taXNlLnB1c2gob0xvY2FsUHJvbWlzZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHQvLyByZXF1ZXN0IHNpZGUgZWZmZWN0cyBmb3IgdGhpcyBhY3Rpb25cblx0Ly8gYXMgd2UgbW92ZSB0aGUgbWVzc2FnZXMgcmVxdWVzdCB0byBQT1NUICRzZWxlY3Qgd2UgbmVlZCB0byBiZSBwcmVwYXJlZCBmb3IgYW4gZW1wdHkgYXJyYXlcblx0aWYgKG9TaWRlRWZmZWN0ICYmIG9TaWRlRWZmZWN0LnBhdGhFeHByZXNzaW9ucyAmJiBvU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMubGVuZ3RoID4gMCkge1xuXHRcdG9Mb2NhbFByb21pc2UgPSBvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhvU2lkZUVmZmVjdC5wYXRoRXhwcmVzc2lvbnMsIG9TaWRlRWZmZWN0LmNvbnRleHQsIHNHcm91cElkKTtcblx0XHRpZiAoYUxvY2FsUHJvbWlzZSkge1xuXHRcdFx0YUxvY2FsUHJvbWlzZS5wdXNoKG9Mb2NhbFByb21pc2UpO1xuXHRcdH1cblx0XHRvTG9jYWxQcm9taXNlXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGlmIChtUGFyYW1ldGVycy5vcGVyYXRpb25BdmFpbGFibGVNYXAgJiYgbVBhcmFtZXRlcnMuaW50ZXJuYWxNb2RlbENvbnRleHQpIHtcblx0XHRcdFx0XHRBY3Rpb25SdW50aW1lLnNldEFjdGlvbkVuYWJsZW1lbnQoXG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycy5pbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFx0XHRcdEpTT04ucGFyc2UobVBhcmFtZXRlcnMub3BlcmF0aW9uQXZhaWxhYmxlTWFwKSxcblx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLnNlbGVjdGVkSXRlbXMsXG5cdFx0XHRcdFx0XHRcInRhYmxlXCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXF1ZXN0aW5nIHNpZGUgZWZmZWN0c1wiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH1cbn1cblxuLyoqXG4gKiBTdGF0aWMgZnVuY3Rpb25zIHRvIGNhbGwgT0RhdGEgYWN0aW9ucyAoYm91bmQvaW1wb3J0KSBhbmQgZnVuY3Rpb25zIChib3VuZC9pbXBvcnQpXG4gKlxuICogQG5hbWVzcGFjZVxuICogQGFsaWFzIHNhcC5mZS5jb3JlLmFjdGlvbnMub3BlcmF0aW9uc1xuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgZXhwZXJpbWVudGFsIHVzZSEgPGJyLz48Yj5UaGlzIGlzIG9ubHkgYSBQT0MgYW5kIG1heWJlIGRlbGV0ZWQ8L2I+XG4gKiBAc2luY2UgMS41Ni4wXG4gKi9cbmNvbnN0IG9wZXJhdGlvbnMgPSB7XG5cdGNhbGxCb3VuZEFjdGlvbjogY2FsbEJvdW5kQWN0aW9uLFxuXHRjYWxsQWN0aW9uSW1wb3J0OiBjYWxsQWN0aW9uSW1wb3J0LFxuXHRjYWxsQm91bmRGdW5jdGlvbjogY2FsbEJvdW5kRnVuY3Rpb24sXG5cdGNhbGxGdW5jdGlvbkltcG9ydDogY2FsbEZ1bmN0aW9uSW1wb3J0LFxuXHRleGVjdXRlRGVwZW5kaW5nT25TZWxlY3RlZENvbnRleHRzOiBleGVjdXRlRGVwZW5kaW5nT25TZWxlY3RlZENvbnRleHRzLFxuXHR2YWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnM6IF92YWx1ZXNQcm92aWRlZEZvckFsbFBhcmFtZXRlcnMsXG5cdGdldEFjdGlvblBhcmFtZXRlckFjdGlvbk5hbWU6IF9nZXRBY3Rpb25QYXJhbWV0ZXJBY3Rpb25OYW1lLFxuXHRhY3Rpb25QYXJhbWV0ZXJTaG93TWVzc2FnZUNhbGxiYWNrOiBhY3Rpb25QYXJhbWV0ZXJTaG93TWVzc2FnZUNhbGxiYWNrLFxuXHRhZnRlckFjdGlvblJlc29sdXRpb246IGFmdGVyQWN0aW9uUmVzb2x1dGlvblxuXHQvLyBBY3Rpb25QYXJhbWV0ZXJJbmZvOiBBY3Rpb25QYXJhbWV0ZXJJbmZvLFxuXHQvLyAgX3ZhbGlkYXRlUHJvcGVydGllcywgX3ZhbGlkYXRlUHJvcGVydGllc1xufTtcblxuZXhwb3J0IGRlZmF1bHQgb3BlcmF0aW9ucztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7O0VBa2pCTyxnQkFBZ0JBLElBQUksRUFBRUMsT0FBTyxFQUFFO0lBQ3JDLElBQUk7TUFDSCxJQUFJQyxNQUFNLEdBQUdGLElBQUksRUFBRTtJQUNwQixDQUFDLENBQUMsT0FBTUcsQ0FBQyxFQUFFO01BQ1YsT0FBT0YsT0FBTyxDQUFDRSxDQUFDLENBQUM7SUFDbEI7SUFDQSxJQUFJRCxNQUFNLElBQUlBLE1BQU0sQ0FBQ0UsSUFBSSxFQUFFO01BQzFCLE9BQU9GLE1BQU0sQ0FBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFSCxPQUFPLENBQUM7SUFDcEM7SUFDQSxPQUFPQyxNQUFNO0VBQ2Q7RUFHTywwQkFBMEJGLElBQUksRUFBRUssU0FBUyxFQUFFO0lBQ2pELElBQUk7TUFDSCxJQUFJSCxNQUFNLEdBQUdGLElBQUksRUFBRTtJQUNwQixDQUFDLENBQUMsT0FBT0csQ0FBQyxFQUFFO01BQ1gsT0FBT0UsU0FBUyxDQUFDLElBQUksRUFBRUYsQ0FBQyxDQUFDO0lBQzFCO0lBQ0EsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLElBQUksRUFBRTtNQUMxQixPQUFPRixNQUFNLENBQUNFLElBQUksQ0FBQ0MsU0FBUyxDQUFDQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFRCxTQUFTLENBQUNDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUU7SUFDQSxPQUFPRCxTQUFTLENBQUMsS0FBSyxFQUFFSCxNQUFNLENBQUM7RUFDaEM7RUFBQyxJQWhIY0ssZ0JBQWdCLGFBQzlC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