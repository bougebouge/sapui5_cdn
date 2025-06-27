/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageBox", "sap/m/Text", "sap/ui/core/Core", "../../operationsHelper", "./draftDataLossPopup"], function (Log, CommonUtils, ActivitySync, messageHandling, Button, Dialog, MessageBox, Text, Core, operationsHelper, draftDataLossPopup) {
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
  /**
   * Creates an active document from a draft document.
   *
   * The function supports several hooks as there is a certain choreography defined.
   *
   * @function
   * @name sap.fe.core.actions.draft#activateDocument
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param oContext Context of the active document for the new draft
   * @param oAppComponent The AppComponent
   * @param mParameters The parameters
   * @param [mParameters.fnBeforeActivateDocument] Callback that allows a veto before the 'Create' request is executed
   * @param [mParameters.fnAfterActivateDocument] Callback for postprocessing after document was activated.
   * @param messageHandler The message handler
   * @returns Promise resolves with the {@link sap.ui.model.odata.v4.Context context} of the new draft document
   * @private
   * @ui5-restricted
   */
  var activateDocument = function (oContext, oAppComponent, mParameters, messageHandler) {
    try {
      function _temp22(bExecute) {
        var _exit5 = false;
        function _temp20(_result6) {
          return _exit5 ? _result6 : mParam.fnAfterActivateDocument ? mParam.fnAfterActivateDocument(oContext, oActiveDocumentContext) : oActiveDocumentContext;
        }
        if (!bExecute) {
          throw new Error("Activation of the document was aborted by extension for document: ".concat(oContext.getPath()));
        }
        var oActiveDocumentContext;
        var _temp19 = function () {
          if (!hasPrepareAction(oContext)) {
            return Promise.resolve(executeDraftActivationAction(oContext, oAppComponent)).then(function (_executeDraftActivati) {
              oActiveDocumentContext = _executeDraftActivati;
            });
          } else {
            /* activation requires preparation */
            var sBatchGroup = "draft";
            // we use the same batchGroup to force prepare and activate in a same batch but with different changeset
            var oPreparePromise = draft.executeDraftPreparationAction(oContext, sBatchGroup, false);
            oContext.getModel().submitBatch(sBatchGroup);
            var oActivatePromise = draft.executeDraftActivationAction(oContext, oAppComponent, sBatchGroup);
            return _catch(function () {
              return Promise.resolve(Promise.all([oPreparePromise, oActivatePromise])).then(function (values) {
                oActiveDocumentContext = values[1];
              });
            }, function (err) {
              function _temp18() {
                throw err;
              }
              // BCP 2270084075
              // if the Activation fails, then the messages are retrieved from PREPARATION action
              var sMessagesPath = getMessagePathForPrepare(oContext);
              var _temp17 = function () {
                if (sMessagesPath) {
                  oPreparePromise = draft.executeDraftPreparationAction(oContext, sBatchGroup, true);
                  oContext.getModel().submitBatch(sBatchGroup);
                  return Promise.resolve(oPreparePromise).then(function () {
                    return Promise.resolve(oContext.requestObject()).then(function (data) {
                      if (data[sMessagesPath].length > 0) {
                        //if messages are available from the PREPARATION action, then previous transition messages are removed
                        messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeTransitionMessages(false, false, oContext.getPath());
                      }
                    });
                  });
                }
              }();
              return _temp17 && _temp17.then ? _temp17.then(_temp18) : _temp18(_temp17);
            });
          }
        }();
        return _temp19 && _temp19.then ? _temp19.then(_temp20) : _temp20(_temp19);
      }
      var mParam = mParameters || {};
      if (!oContext) {
        throw new Error("Binding context to draft document is required");
      }
      var _mParam$fnBeforeActiv2 = mParam.fnBeforeActivateDocument;
      return Promise.resolve(_mParam$fnBeforeActiv2 ? Promise.resolve(mParam.fnBeforeActivateDocument(oContext)).then(_temp22) : _temp22(true));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * HTTP POST call when DraftAction is present for Draft Delete; HTTP DELETE call when there is no DraftAction
   * and Active Instance always uses DELETE.
   *
   * @function
   * @name sap.fe.core.actions.draft#deleteDraft
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param oContext Context of the document to be discarded
   * @param oAppComponent Context of the document to be discarded
   * @param bEnableStrictHandling
   * @private
   * @returns A Promise resolved when the context is deleted
   * @ui5-restricted
   */
  /**
   * Creates a draft document from an existing document.
   *
   * The function supports several hooks as there is a certain coreography defined.
   *
   * @function
   * @name sap.fe.core.actions.draft#createDraftFromActiveDocument
   * @memberof sap.fe.core.actions.draft
   * @static
   * @param oContext Context of the active document for the new draft
   * @param oAppComponent The AppComponent
   * @param mParameters The parameters
   * @param [mParameters.oView] The view
   * @param [mParameters.bPreserveChanges] Preserve changes of an existing draft of another user
   * @param [mParameters.fnBeforeCreateDraftFromActiveDocument] Callback that allows veto before create request is executed
   * @param [mParameters.fnAfterCreateDraftFromActiveDocument] Callback for postprocessiong after draft document was created
   * @param [mParameters.fnWhenDecisionToOverwriteDocumentIsRequired] Callback for deciding on overwriting an unsaved change by another user
   * @returns Promise resolves with the {@link sap.ui.model.odata.v4.Context context} of the new draft document
   * @private
   * @ui5-restricted
   */
  var createDraftFromActiveDocument = function (oContext, oAppComponent, mParameters) {
    try {
      var _exit2 = false;
      //default true
      /**
       * Overwrite or reject based on fnWhenDecisionToOverwriteDocumentIsRequired.
       *
       * @param bOverwrite Overwrite the change or not
       * @returns Resolves with result of {@link sap.fe.core.actions#executeDraftEditAction}
       */
      var overwriteOnDemand = function (bOverwrite) {
        try {
          var _exit4 = false;
          function _temp15(_result4) {
            if (_exit4) return _result4;
            throw new Error("Draft creation aborted for document: ".concat(oContext.getPath()));
          }
          var _temp16 = function () {
            if (bOverwrite) {
              //Overwrite existing changes
              var oModel = oContext.getModel();
              var draftDataContext = oModel.bindContext("".concat(oContext.getPath(), "/DraftAdministrativeData")).getBoundContext();
              return Promise.resolve(mParameters.oView.getModel("sap.fe.i18n").getResourceBundle()).then(function (oResourceBundle) {
                return Promise.resolve(draftDataContext.requestObject()).then(function (draftAdminData) {
                  return function () {
                    if (draftAdminData) {
                      // remove all unbound transition messages as we show a special dialog
                      messageHandling.removeUnboundTransitionMessages();
                      var sInfo = draftAdminData.InProcessByUserDescription || draftAdminData.InProcessByUser;
                      var sEntitySet = mParameters.oView.getViewData().entitySet;
                      if (sInfo) {
                        var sLockedByUserMsg = CommonUtils.getTranslatedText("C_DRAFT_OBJECT_PAGE_DRAFT_LOCKED_BY_USER", oResourceBundle, sInfo, sEntitySet);
                        MessageBox.error(sLockedByUserMsg);
                        throw new Error(sLockedByUserMsg);
                      } else {
                        sInfo = draftAdminData.CreatedByUserDescription || draftAdminData.CreatedByUser;
                        var sUnsavedChangesMsg = CommonUtils.getTranslatedText("C_DRAFT_OBJECT_PAGE_DRAFT_UNSAVED_CHANGES", oResourceBundle, sInfo, sEntitySet);
                        return Promise.resolve(showMessageBox(sUnsavedChangesMsg)).then(function () {
                          var _executeDraftEditActi = executeDraftEditAction(oContext, false, mParameters.oView);
                          _exit4 = true;
                          return _executeDraftEditActi;
                        });
                      }
                    }
                  }();
                });
              });
            }
          }();
          return Promise.resolve(_temp16 && _temp16.then ? _temp16.then(_temp15) : _temp15(_temp16));
        } catch (e) {
          return Promise.reject(e);
        }
      };
      function showMessageBox(sUnsavedChangesMsg) {
        return new Promise(function (resolve, reject) {
          var oDialog = new Dialog({
            title: localI18nRef.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_WARNING"),
            state: "Warning",
            content: new Text({
              text: sUnsavedChangesMsg
            }),
            beginButton: new Button({
              text: localI18nRef.getText("C_COMMON_OBJECT_PAGE_EDIT"),
              type: "Emphasized",
              press: function () {
                oDialog.close();
                resolve(true);
              }
            }),
            endButton: new Button({
              text: localI18nRef.getText("C_COMMON_OBJECT_PAGE_CANCEL"),
              press: function () {
                oDialog.close();
                reject("Draft creation aborted for document: ".concat(oContext.getPath()));
              }
            }),
            afterClose: function () {
              oDialog.destroy();
            }
          });
          oDialog.addStyleClass("sapUiContentPadding");
          oDialog.open();
        });
      }
      var mParam = mParameters || {},
        localI18nRef = Core.getLibraryResourceBundle("sap.fe.core"),
        bRunPreserveChangesFlow = typeof mParam.bPreserveChanges === "undefined" || typeof mParam.bPreserveChanges === "boolean" && mParam.bPreserveChanges;
      if (!oContext) {
        throw new Error("Binding context to active document is required");
      }
      var bExecute = mParam.fnBeforeCreateDraftFromActiveDocument ? mParam.fnBeforeCreateDraftFromActiveDocument(oContext, bRunPreserveChangesFlow) : true;
      if (!bExecute) {
        throw new Error("Draft creation was aborted by extension for document: ".concat(oContext.getPath()));
      }
      return Promise.resolve(_catch(function () {
        function _temp12(_result) {
          if (_exit2) return _result;
          oDraftContext = oDraftContext && mParam.fnAfterCreateDraftFromActiveDocument ? mParam.fnAfterCreateDraftFromActiveDocument(oContext, oDraftContext) : oDraftContext;
          if (oDraftContext) {
            var _oSideEffects$trigger;
            var sEditActionName = getActionName(oDraftContext, draftOperations.EDIT);
            var oSideEffects = oAppComponent.getSideEffectsService().getODataActionSideEffects(sEditActionName, oDraftContext);
            if (oSideEffects !== null && oSideEffects !== void 0 && (_oSideEffects$trigger = oSideEffects.triggerActions) !== null && _oSideEffects$trigger !== void 0 && _oSideEffects$trigger.length) {
              return Promise.resolve(oAppComponent.getSideEffectsService().requestSideEffectsForODataAction(oSideEffects, oDraftContext)).then(function () {
                return oDraftContext;
              });
            } else {
              return oDraftContext;
            }
          } else {
            return undefined;
          }
        }
        var oDraftContext;
        var _temp11 = _catch(function () {
          return Promise.resolve(draft.executeDraftEditAction(oContext, bRunPreserveChangesFlow, mParameters.oView)).then(function (_draft$executeDraftEd) {
            oDraftContext = _draft$executeDraftEd;
          });
        }, function (oResponse) {
          return function () {
            if (bRunPreserveChangesFlow && oResponse.status === 409) {
              messageHandling.removeBoundTransitionMessages();
              messageHandling.removeUnboundTransitionMessages();
              return function () {
                if (ActivitySync.isCollaborationEnabled(mParameters.oView)) {
                  return Promise.resolve(draft.computeSiblingInformation(oContext, oContext)).then(function (siblingInfo) {
                    if (siblingInfo !== null && siblingInfo !== void 0 && siblingInfo.targetContext) {
                      var _siblingInfo$targetCo2 = siblingInfo.targetContext;
                      _exit2 = true;
                      return _siblingInfo$targetCo2;
                    } else {
                      throw new Error(oResponse);
                    }
                  });
                } else {
                  return Promise.resolve(overwriteOnDemand(mParam.fnWhenDecisionToOverwriteDocumentIsRequired ? mParam.fnWhenDecisionToOverwriteDocumentIsRequired() : true)).then(function (_overwriteOnDemand) {
                    oDraftContext = _overwriteOnDemand;
                  });
                }
              }();
            } else if (!(oResponse && oResponse.canceled)) {
              throw new Error(oResponse);
            }
          }();
        });
        return _temp11 && _temp11.then ? _temp11.then(_temp12) : _temp12(_temp11);
      }, function (exc) {
        throw exc;
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * This method creates a sibling context for a subobject page and calculates a sibling path for all intermediate paths
   * between the object page and the subobject page.
   *
   * @param rootCurrentContext The context for the root of the draft
   * @param rightmostCurrentContext The context of the subobject page
   * @returns The siblingInformation object
   */
  var computeSiblingInformation = function (rootCurrentContext, rightmostCurrentContext) {
    try {
      if (!rightmostCurrentContext.getPath().startsWith(rootCurrentContext.getPath())) {
        // Wrong usage !!
        Log.error("Cannot compute rightmost sibling context");
        throw new Error("Cannot compute rightmost sibling context");
      }
      if (rightmostCurrentContext.getProperty("IsActiveEntity") === false && rightmostCurrentContext.getProperty("HasActiveEntity") === false) {
        // We already know the sibling for rightmostCurrentContext doesn't exist
        // --> No need to check canonical paths etc...
        return Promise.resolve(undefined);
      }
      var model = rootCurrentContext.getModel();
      return Promise.resolve(_catch(function () {
        // //////////////////////////////////////////////////////////////////
        // 1. Find all segments between the root object and the sub-object
        // Example: for root = /Param(aa)/Entity(bb) and rightMost = /Param(aa)/Entity(bb)/_Nav(cc)/_SubNav(dd)
        // ---> ["Param(aa)/Entity(bb)", "_Nav(cc)", "_SubNav(dd)"]

        // Find all segments in the rightmost path
        var additionalPath = rightmostCurrentContext.getPath().replace(rootCurrentContext.getPath(), "");
        var segments = additionalPath ? additionalPath.substring(1).split("/") : [];
        // First segment is always the full path of the root object, which can contain '/' in case of a parametrized entity
        segments.unshift(rootCurrentContext.getPath().substring(1));

        // //////////////////////////////////////////////////////////////////
        // 2. Request canonical paths of the sibling entity for each segment
        // Example: for ["Param(aa)/Entity(bb)", "_Nav(cc)", "_SubNav(dd)"]
        // --> request canonical paths for "Param(aa)/Entity(bb)/SiblingEntity", "Param(aa)/Entity(bb)/_Nav(cc)/SiblingEntity", "Param(aa)/Entity(bb)/_Nav(cc)/_SubNav(dd)/SiblingEntity"
        var oldPaths = [];
        var newPaths = [];
        var currentPath = "";
        var canonicalPathPromises = segments.map(function (segment) {
          currentPath += "/".concat(segment);
          oldPaths.unshift(currentPath);
          if (currentPath.endsWith(")")) {
            var siblingContext = model.bindContext("".concat(currentPath, "/SiblingEntity")).getBoundContext();
            return siblingContext.requestCanonicalPath();
          } else {
            return Promise.resolve(undefined); // 1-1 relation
          }
        });

        // //////////////////////////////////////////////////////////////////
        // 3. Reconstruct the full paths from canonical paths (for path mapping)
        // Example: for canonical paths "/Param(aa)/Entity(bb-sibling)", "/Entity2(cc-sibling)", "/Entity3(dd-sibling)"
        // --> ["Param(aa)/Entity(bb-sibling)", "Param(aa)/Entity(bb-sibling)/_Nav(cc-sibling)", "Param(aa)/Entity(bb-sibling)/_Nav(cc-sibling)/_SubNav(dd-sibling)"]
        return Promise.resolve(Promise.all(canonicalPathPromises)).then(function (_Promise$all) {
          var canonicalPaths = _Promise$all;
          var siblingPath = "";
          canonicalPaths.forEach(function (canonicalPath, index) {
            if (index !== 0) {
              if (segments[index].endsWith(")")) {
                var navigation = segments[index].replace(/\(.*$/, ""); // Keep only navigation name from the segment, i.e. aaa(xxx) --> aaa
                var keys = canonicalPath.replace(/.*\(/, "("); // Keep only the keys from the canonical path, i.e. aaa(xxx) --> (xxx)
                siblingPath += "/".concat(navigation).concat(keys);
              } else {
                siblingPath += "/".concat(segments[index]); // 1-1 relation
              }
            } else {
              siblingPath = canonicalPath; // To manage parametrized entities
            }

            newPaths.unshift(siblingPath);
          });
          return {
            targetContext: model.bindContext(siblingPath).getBoundContext(),
            // Create the rightmost sibling context from its path
            pathMapping: oldPaths.map(function (oldPath, index) {
              return {
                oldPath: oldPath,
                newPath: newPaths[index]
              };
            })
          };
        });
      }, function () {
        // A canonical path couldn't be resolved (because a sibling doesn't exist)
        return undefined;
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Executes discard of a draft function using HTTP Post.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param oAppComponent App Component
   * @param bEnableStrictHandling
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  var executeDraftDiscardAction = function (oContext, oAppComponent, bEnableStrictHandling) {
    try {
      if (!oContext.getProperty("IsActiveEntity")) {
        function _temp10(oResourceBundle) {
          var sGroupId = "direct";
          var sActionName = CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON", oResourceBundle);
          // as the discard action doesnt' send the active version in the response we do not use the replace in cache
          var oDiscardPromise = !bEnableStrictHandling ? oDiscardOperation.execute(sGroupId) : oDiscardOperation.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(draft, sGroupId, {
            label: sActionName,
            model: oContext.getModel()
          }, oResourceBundle, null, null, null, undefined), false);
          oContext.getModel().submitBatch(sGroupId);
          return oDiscardPromise;
        }
        var oDiscardOperation = draft.createOperation(oContext, draftOperations.DISCARD);
        return Promise.resolve(oAppComponent ? Promise.resolve(oAppComponent.getModel("sap.fe.i18n").getResourceBundle()).then(_temp10) : _temp10(oAppComponent));
      } else {
        throw new Error("The discard action cannot be executed on an active document");
      }
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Activates a draft document. The draft will replace the sibling entity and will be deleted by the back end.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param oAppComponent The AppComponent
   * @param [sGroupId] The optional batch group in which the operation is to be executed
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  var executeDraftActivationAction = function (oContext, oAppComponent, sGroupId) {
    try {
      var bHasPrepareAction = hasPrepareAction(oContext);

      // According to the draft spec if the service contains a prepare action and we trigger both prepare and
      // activate in one $batch the activate action is called with iF-Match=*
      var bIgnoreEtag = bHasPrepareAction;
      if (!oContext.getProperty("IsActiveEntity")) {
        var oOperation = createOperation(oContext, draftOperations.ACTIVATION, {
          $$inheritExpandSelect: true
        });
        return Promise.resolve(oAppComponent.getModel("sap.fe.i18n").getResourceBundle()).then(function (oResourceBundle) {
          var sActionName = CommonUtils.getTranslatedText("C_OP_OBJECT_PAGE_SAVE", oResourceBundle);
          return _catch(function () {
            return Promise.resolve(oOperation.execute(sGroupId, bIgnoreEtag, sGroupId ? operationsHelper.fnOnStrictHandlingFailed.bind(draft, sGroupId, {
              label: sActionName,
              model: oContext.getModel()
            }, oResourceBundle, null, null, null, undefined) : undefined, oContext.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding")));
          }, function (e) {
            function _temp5() {
              throw e;
            }
            var _temp4 = function () {
              if (bHasPrepareAction) {
                var actionName = getActionName(oContext, draftOperations.PREPARE),
                  oSideEffectsService = oAppComponent.getSideEffectsService(),
                  oBindingParameters = oSideEffectsService.getODataActionSideEffects(actionName, oContext),
                  aTargetPaths = oBindingParameters && oBindingParameters.pathExpressions;
                var _temp6 = function () {
                  if (aTargetPaths && aTargetPaths.length > 0) {
                    var _temp7 = _catch(function () {
                      return Promise.resolve(oSideEffectsService.requestSideEffects(aTargetPaths, oContext)).then(function () {});
                    }, function (oError) {
                      Log.error("Error while requesting side effects", oError);
                    });
                    if (_temp7 && _temp7.then) return _temp7.then(function () {});
                  } else {
                    var _temp8 = _catch(function () {
                      return Promise.resolve(requestMessages(oContext, oSideEffectsService)).then(function () {});
                    }, function (oError) {
                      Log.error("Error while requesting messages", oError);
                    });
                    if (_temp8 && _temp8.then) return _temp8.then(function () {});
                  }
                }();
                if (_temp6 && _temp6.then) return _temp6.then(function () {});
              }
            }();
            return _temp4 && _temp4.then ? _temp4.then(_temp5) : _temp5(_temp4);
          });
        });
      } else {
        throw new Error("The activation action cannot be executed on an active document");
      }
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Gets the supported message property path on the PrepareAction for a context.
   *
   * @function
   * @param oContext Context to be checked
   * @returns Path to the message
   * @private
   * @ui5-restricted
   */
  /**
   * Executes the validation of the draft. The PrepareAction is triggered if the messages are annotated and entitySet gets a PreparationAction annotated.
   * If the operation succeeds and operation doesn't get a return type (RAP system) the messages are requested.
   *
   * @function
   * @param oContext Context for which the PrepareAction should be performed
   * @param oAppComponent The AppComponent
   * @returns Resolve function returns
   *  - the context of the operation if the action has been successfully executed
   *  - void if the action has failed
   *  - undefined if the action has not been triggered since the prerequisites are not met
   * @private
   * @ui5-restricted
   */
  var executeDraftValidation = function (oContext, oAppComponent) {
    try {
      if (draft.getMessagesPath(oContext) && draft.hasPrepareAction(oContext)) {
        return Promise.resolve(draft.executeDraftPreparationAction(oContext, oContext.getUpdateGroupId(), true).then(function (oOperation) {
          // if there is no returned operation by executeDraftPreparationAction -> the action has failed
          if (oOperation && !getReturnType(oContext, draftOperations.PREPARE)) {
            var oSideEffectsService = oAppComponent.getSideEffectsService();
            requestMessages(oContext, oSideEffectsService);
          }
          return oOperation;
        }).catch(function (oError) {
          Log.error("Error while requesting messages", oError);
        }));
      }
      return Promise.resolve(undefined);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Creates a new draft from an active document.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param bPreserveChanges If true - existing changes from another user that are not locked are preserved and an error message (http status 409) is send from the backend, otherwise false - existing changes from another user that are not locked are overwritten</li>
   * @param oView If true - existing changes from another
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  var executeDraftEditAction = function (oContext, bPreserveChanges, oView) {
    try {
      if (oContext.getProperty("IsActiveEntity")) {
        var oOptions = {
          $$inheritExpandSelect: true
        };
        var oOperation = createOperation(oContext, draftOperations.EDIT, oOptions);
        oOperation.setParameter("PreserveChanges", bPreserveChanges);
        var sGroupId = "direct";
        return Promise.resolve(oView.getModel("sap.fe.i18n").getResourceBundle()).then(function (oResourceBundle) {
          var sActionName = CommonUtils.getTranslatedText("C_COMMON_OBJECT_PAGE_EDIT", oResourceBundle);
          //If the context is coming from a list binding we pass the flag true to replace the context by the active one
          var oEditPromise = oOperation.execute(sGroupId, undefined, operationsHelper.fnOnStrictHandlingFailed.bind(draft, sGroupId, {
            label: sActionName,
            model: oContext.getModel()
          }, oResourceBundle, null, null, null, undefined), oContext.getBinding().isA("sap.ui.model.odata.v4.ODataListBinding"));
          oOperation.getModel().submitBatch(sGroupId);
          return Promise.resolve(oEditPromise);
        });
      } else {
        throw new Error("You cannot edit this draft document");
      }
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Interface for callbacks used in the functions
   *
   *
   * @author SAP SE
   * @since 1.54.0
   * @interface
   * @name sap.fe.core.actions.draft.ICallback
   * @private
   */

  /**
   * Callback to approve or reject the creation of a draft
   *
   * @name sap.fe.core.actions.draft.ICallback.beforeCreateDraftFromActiveDocument
   * @function
   * @static
   * @abstract
   * @param {sap.ui.model.odata.v4.Context} oContext Context of the active document for the new draft
   * @returns {(boolean|Promise)} Approval of draft creation [true|false] or Promise that resolves with the boolean value
   * @private
   */

  /**
   * Callback after a draft was successully created
   *
   * @name sap.fe.core.actions.draft.ICallback.afterCreateDraftFromActiveDocument
   * @function
   * @static
   * @abstract
   * @param {sap.ui.model.odata.v4.Context} oContext Context of the new draft
   * @param {sap.ui.model.odata.v4.Context} oActiveDocumentContext Context of the active document for the new draft
   * @returns {sap.ui.model.odata.v4.Context} oActiveDocumentContext
   * @private
   */

  /**
   * Callback to approve or reject overwriting an unsaved draft of another user
   *
   * @name sap.fe.core.actions.draft.ICallback.whenDecisionToOverwriteDocumentIsRequired
   * @function
   * @public
   * @static
   * @abstract
   * @param {sap.ui.model.odata.v4.Context} oContext Context of the active document for the new draft
   * @returns {(boolean|Promise)} Approval to overwrite unsaved draft [true|false] or Promise that resolves with the boolean value
   * @ui5-restricted
   */
  /* Constants for draft operations */
  var draftOperations = {
    EDIT: "EditAction",
    ACTIVATION: "ActivationAction",
    DISCARD: "DiscardAction",
    PREPARE: "PreparationAction"
  };

  /**
   * Static functions for the draft programming model
   *
   * @namespace
   * @alias sap.fe.core.actions.draft
   * @private
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.54.0
   */

  /**
   * Determines action name for a draft operation.
   *
   * @param oContext The context that should be bound to the operation
   * @param sOperation The operation name
   * @returns The name of the draft operation
   */
  function getActionName(oContext, sOperation) {
    var oModel = oContext.getModel(),
      oMetaModel = oModel.getMetaModel(),
      sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
    return oMetaModel.getObject("".concat(sEntitySetPath, "@com.sap.vocabularies.Common.v1.DraftRoot/").concat(sOperation));
  }
  /**
   * Creates an operation context binding for the given context and operation.
   *
   * @param oContext The context that should be bound to the operation
   * @param sOperation The operation (action or function import)
   * @param oOptions Options to create the operation context
   * @returns The context binding of the bound operation
   */
  function createOperation(oContext, sOperation, oOptions) {
    var sOperationName = getActionName(oContext, sOperation);
    return oContext.getModel().bindContext("".concat(sOperationName, "(...)"), oContext, oOptions);
  }
  /**
   * Determines the return type for a draft operation.
   *
   * @param oContext The context that should be bound to the operation
   * @param sOperation The operation name
   * @returns The return type of the draft operation
   */
  function getReturnType(oContext, sOperation) {
    var oModel = oContext.getModel(),
      oMetaModel = oModel.getMetaModel(),
      sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
    return oMetaModel.getObject("".concat(sEntitySetPath, "@com.sap.vocabularies.Common.v1.DraftRoot/").concat(sOperation, "/$ReturnType"));
  }
  /**
   * Check if optional draft prepare action exists.
   *
   * @param oContext The context that should be bound to the operation
   * @returns True if a a prepare action exists
   */
  function hasPrepareAction(oContext) {
    return !!getActionName(oContext, draftOperations.PREPARE);
  }
  function getMessagePathForPrepare(oContext) {
    var oMetaModel = oContext.getModel().getMetaModel();
    var sContextPath = oMetaModel.getMetaPath(oContext.getPath());
    var oReturnType = getReturnType(oContext, draftOperations.PREPARE);
    // If there is no return parameter, it is not possible to request Messages.
    // RAP draft prepare has no return parameter
    return !!oReturnType ? oMetaModel.getObject("".concat(sContextPath, "/@").concat("com.sap.vocabularies.Common.v1.Messages", "/$Path")) : null;
  }

  /**
   * Execute a preparation action.
   *
   * @function
   * @param oContext Context for which the action should be performed
   * @param groupId The optional batch group in which we want to execute the operation
   * @param bMessages If set to true, the PREPARE action retrieves SAP_Messages
   * @returns Resolve function returns the context of the operation
   * @private
   * @ui5-restricted
   */
  function executeDraftPreparationAction(oContext, groupId, bMessages) {
    if (!oContext.getProperty("IsActiveEntity")) {
      var sMessagesPath = bMessages ? getMessagePathForPrepare(oContext) : null;
      var oOperation = createOperation(oContext, draftOperations.PREPARE, sMessagesPath ? {
        $select: sMessagesPath
      } : null);

      // TODO: side effects qualifier shall be even deprecated to be checked
      oOperation.setParameter("SideEffectsQualifier", "");
      var sGroupId = groupId || oOperation.getGroupId();
      return oOperation.execute(sGroupId).then(function () {
        return oOperation;
      }).catch(function (oError) {
        Log.error("Error while executing the operation", oError);
      });
    } else {
      throw new Error("The preparation action cannot be executed on an active document");
    }
  }
  /**
   * Determines the message path for a context.
   *
   * @function
   * @param oContext Context for which the path shall be determined
   * @returns Message path, empty if not annotated
   * @private
   * @ui5-restricted
   */
  function getMessagesPath(oContext) {
    var oModel = oContext.getModel(),
      oMetaModel = oModel.getMetaModel(),
      sEntitySetPath = oMetaModel.getMetaPath(oContext.getPath());
    return oMetaModel.getObject("".concat(sEntitySetPath, "/@com.sap.vocabularies.Common.v1.Messages/$Path"));
  }
  /**
   * Requests the messages if annotated for a given context.
   *
   * @function
   * @param oContext Context for which the messages shall be requested
   * @param oSideEffectsService Service for the SideEffects on SAP Fiori elements
   * @returns Promise which is resolved once messages were requested
   * @private
   * @ui5-restricted
   */
  function requestMessages(oContext, oSideEffectsService) {
    var sMessagesPath = draft.getMessagesPath(oContext);
    if (sMessagesPath) {
      return oSideEffectsService.requestSideEffects([{
        $PropertyPath: sMessagesPath
      }], oContext);
    }
    return Promise.resolve();
  }
  function deleteDraft(oContext, oAppComponent, bEnableStrictHandling) {
    var sDiscardAction = getActionName(oContext, draftOperations.DISCARD),
      bIsActiveEntity = oContext.getObject().IsActiveEntity;
    if (bIsActiveEntity || !bIsActiveEntity && !sDiscardAction) {
      //Use Delete in case of active entity and no discard action available for draft
      if (oContext.hasPendingChanges()) {
        return oContext.getBinding().resetChanges().then(function () {
          return oContext.delete();
        }).catch(function (error) {
          return Promise.reject(error);
        });
      } else {
        return oContext.delete();
      }
    } else {
      //Use Discard Post Action if it is a draft entity and discard action exists
      return executeDraftDiscardAction(oContext, oAppComponent, bEnableStrictHandling);
    }
  }
  var draft = {
    createDraftFromActiveDocument: createDraftFromActiveDocument,
    activateDocument: activateDocument,
    deleteDraft: deleteDraft,
    executeDraftEditAction: executeDraftEditAction,
    executeDraftValidation: executeDraftValidation,
    executeDraftPreparationAction: executeDraftPreparationAction,
    executeDraftActivationAction: executeDraftActivationAction,
    hasPrepareAction: hasPrepareAction,
    getMessagesPath: getMessagesPath,
    computeSiblingInformation: computeSiblingInformation,
    processDataLossOrDraftDiscardConfirmation: draftDataLossPopup.processDataLossOrDraftDiscardConfirmation,
    silentlyKeepDraftOnForwardNavigation: draftDataLossPopup.silentlyKeepDraftOnForwardNavigation,
    createOperation: createOperation,
    executeDraftDiscardAction: executeDraftDiscardAction,
    NavigationType: draftDataLossPopup.NavigationType
  };
  return draft;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiYWN0aXZhdGVEb2N1bWVudCIsIm9Db250ZXh0Iiwib0FwcENvbXBvbmVudCIsIm1QYXJhbWV0ZXJzIiwibWVzc2FnZUhhbmRsZXIiLCJiRXhlY3V0ZSIsIm1QYXJhbSIsImZuQWZ0ZXJBY3RpdmF0ZURvY3VtZW50Iiwib0FjdGl2ZURvY3VtZW50Q29udGV4dCIsIkVycm9yIiwiZ2V0UGF0aCIsImhhc1ByZXBhcmVBY3Rpb24iLCJleGVjdXRlRHJhZnRBY3RpdmF0aW9uQWN0aW9uIiwic0JhdGNoR3JvdXAiLCJvUHJlcGFyZVByb21pc2UiLCJkcmFmdCIsImV4ZWN1dGVEcmFmdFByZXBhcmF0aW9uQWN0aW9uIiwiZ2V0TW9kZWwiLCJzdWJtaXRCYXRjaCIsIm9BY3RpdmF0ZVByb21pc2UiLCJQcm9taXNlIiwiYWxsIiwidmFsdWVzIiwiZXJyIiwic01lc3NhZ2VzUGF0aCIsImdldE1lc3NhZ2VQYXRoRm9yUHJlcGFyZSIsInJlcXVlc3RPYmplY3QiLCJkYXRhIiwibGVuZ3RoIiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwiZm5CZWZvcmVBY3RpdmF0ZURvY3VtZW50IiwiY3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnQiLCJvdmVyd3JpdGVPbkRlbWFuZCIsImJPdmVyd3JpdGUiLCJvTW9kZWwiLCJkcmFmdERhdGFDb250ZXh0IiwiYmluZENvbnRleHQiLCJnZXRCb3VuZENvbnRleHQiLCJvVmlldyIsImdldFJlc291cmNlQnVuZGxlIiwib1Jlc291cmNlQnVuZGxlIiwiZHJhZnRBZG1pbkRhdGEiLCJtZXNzYWdlSGFuZGxpbmciLCJyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwic0luZm8iLCJJblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvbiIsIkluUHJvY2Vzc0J5VXNlciIsInNFbnRpdHlTZXQiLCJnZXRWaWV3RGF0YSIsImVudGl0eVNldCIsInNMb2NrZWRCeVVzZXJNc2ciLCJDb21tb25VdGlscyIsImdldFRyYW5zbGF0ZWRUZXh0IiwiTWVzc2FnZUJveCIsImVycm9yIiwiQ3JlYXRlZEJ5VXNlckRlc2NyaXB0aW9uIiwiQ3JlYXRlZEJ5VXNlciIsInNVbnNhdmVkQ2hhbmdlc01zZyIsInNob3dNZXNzYWdlQm94IiwiZXhlY3V0ZURyYWZ0RWRpdEFjdGlvbiIsInJlc29sdmUiLCJyZWplY3QiLCJvRGlhbG9nIiwiRGlhbG9nIiwidGl0bGUiLCJsb2NhbEkxOG5SZWYiLCJnZXRUZXh0Iiwic3RhdGUiLCJjb250ZW50IiwiVGV4dCIsInRleHQiLCJiZWdpbkJ1dHRvbiIsIkJ1dHRvbiIsInR5cGUiLCJwcmVzcyIsImNsb3NlIiwiZW5kQnV0dG9uIiwiYWZ0ZXJDbG9zZSIsImRlc3Ryb3kiLCJhZGRTdHlsZUNsYXNzIiwib3BlbiIsIkNvcmUiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJiUnVuUHJlc2VydmVDaGFuZ2VzRmxvdyIsImJQcmVzZXJ2ZUNoYW5nZXMiLCJmbkJlZm9yZUNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50Iiwib0RyYWZ0Q29udGV4dCIsImZuQWZ0ZXJDcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudCIsInNFZGl0QWN0aW9uTmFtZSIsImdldEFjdGlvbk5hbWUiLCJkcmFmdE9wZXJhdGlvbnMiLCJFRElUIiwib1NpZGVFZmZlY3RzIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0T0RhdGFBY3Rpb25TaWRlRWZmZWN0cyIsInRyaWdnZXJBY3Rpb25zIiwicmVxdWVzdFNpZGVFZmZlY3RzRm9yT0RhdGFBY3Rpb24iLCJ1bmRlZmluZWQiLCJvUmVzcG9uc2UiLCJzdGF0dXMiLCJyZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlcyIsIkFjdGl2aXR5U3luYyIsImlzQ29sbGFib3JhdGlvbkVuYWJsZWQiLCJjb21wdXRlU2libGluZ0luZm9ybWF0aW9uIiwic2libGluZ0luZm8iLCJ0YXJnZXRDb250ZXh0IiwiZm5XaGVuRGVjaXNpb25Ub092ZXJ3cml0ZURvY3VtZW50SXNSZXF1aXJlZCIsImNhbmNlbGVkIiwiZXhjIiwicm9vdEN1cnJlbnRDb250ZXh0IiwicmlnaHRtb3N0Q3VycmVudENvbnRleHQiLCJzdGFydHNXaXRoIiwiTG9nIiwiZ2V0UHJvcGVydHkiLCJtb2RlbCIsImFkZGl0aW9uYWxQYXRoIiwicmVwbGFjZSIsInNlZ21lbnRzIiwic3Vic3RyaW5nIiwic3BsaXQiLCJ1bnNoaWZ0Iiwib2xkUGF0aHMiLCJuZXdQYXRocyIsImN1cnJlbnRQYXRoIiwiY2Fub25pY2FsUGF0aFByb21pc2VzIiwibWFwIiwic2VnbWVudCIsImVuZHNXaXRoIiwic2libGluZ0NvbnRleHQiLCJyZXF1ZXN0Q2Fub25pY2FsUGF0aCIsImNhbm9uaWNhbFBhdGhzIiwic2libGluZ1BhdGgiLCJmb3JFYWNoIiwiY2Fub25pY2FsUGF0aCIsImluZGV4IiwibmF2aWdhdGlvbiIsImtleXMiLCJwYXRoTWFwcGluZyIsIm9sZFBhdGgiLCJuZXdQYXRoIiwiZXhlY3V0ZURyYWZ0RGlzY2FyZEFjdGlvbiIsImJFbmFibGVTdHJpY3RIYW5kbGluZyIsInNHcm91cElkIiwic0FjdGlvbk5hbWUiLCJvRGlzY2FyZFByb21pc2UiLCJvRGlzY2FyZE9wZXJhdGlvbiIsImV4ZWN1dGUiLCJvcGVyYXRpb25zSGVscGVyIiwiZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkIiwiYmluZCIsImxhYmVsIiwiY3JlYXRlT3BlcmF0aW9uIiwiRElTQ0FSRCIsImJIYXNQcmVwYXJlQWN0aW9uIiwiYklnbm9yZUV0YWciLCJvT3BlcmF0aW9uIiwiQUNUSVZBVElPTiIsIiQkaW5oZXJpdEV4cGFuZFNlbGVjdCIsImdldEJpbmRpbmciLCJpc0EiLCJhY3Rpb25OYW1lIiwiUFJFUEFSRSIsIm9TaWRlRWZmZWN0c1NlcnZpY2UiLCJvQmluZGluZ1BhcmFtZXRlcnMiLCJhVGFyZ2V0UGF0aHMiLCJwYXRoRXhwcmVzc2lvbnMiLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCJvRXJyb3IiLCJyZXF1ZXN0TWVzc2FnZXMiLCJleGVjdXRlRHJhZnRWYWxpZGF0aW9uIiwiZ2V0TWVzc2FnZXNQYXRoIiwiZ2V0VXBkYXRlR3JvdXBJZCIsImdldFJldHVyblR5cGUiLCJjYXRjaCIsIm9PcHRpb25zIiwic2V0UGFyYW1ldGVyIiwib0VkaXRQcm9taXNlIiwic09wZXJhdGlvbiIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJzRW50aXR5U2V0UGF0aCIsImdldE1ldGFQYXRoIiwiZ2V0T2JqZWN0Iiwic09wZXJhdGlvbk5hbWUiLCJzQ29udGV4dFBhdGgiLCJvUmV0dXJuVHlwZSIsImdyb3VwSWQiLCJiTWVzc2FnZXMiLCIkc2VsZWN0IiwiZ2V0R3JvdXBJZCIsIiRQcm9wZXJ0eVBhdGgiLCJkZWxldGVEcmFmdCIsInNEaXNjYXJkQWN0aW9uIiwiYklzQWN0aXZlRW50aXR5IiwiSXNBY3RpdmVFbnRpdHkiLCJoYXNQZW5kaW5nQ2hhbmdlcyIsInJlc2V0Q2hhbmdlcyIsImRlbGV0ZSIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiZHJhZnREYXRhTG9zc1BvcHVwIiwic2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uIiwiTmF2aWdhdGlvblR5cGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbImRyYWZ0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW1vbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IEFjdGl2aXR5U3luYyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9BY3Rpdml0eVN5bmNcIjtcbmltcG9ydCBtZXNzYWdlSGFuZGxpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL21lc3NhZ2VIYW5kbGVyL21lc3NhZ2VIYW5kbGluZ1wiO1xuaW1wb3J0IHR5cGUgeyBTaWRlRWZmZWN0c1NlcnZpY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvU2lkZUVmZmVjdHNTZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBNZXNzYWdlQm94IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgVGV4dCBmcm9tIFwic2FwL20vVGV4dFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgdHlwZSBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvcmVzb3VyY2UvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBPRGF0YUNvbnRleHRCaW5kaW5nRXgsIFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcbmltcG9ydCBvcGVyYXRpb25zSGVscGVyIGZyb20gXCIuLi8uLi9vcGVyYXRpb25zSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBNZXNzYWdlSGFuZGxlciBmcm9tIFwiLi4vTWVzc2FnZUhhbmRsZXJcIjtcbmltcG9ydCBkcmFmdERhdGFMb3NzUG9wdXAgZnJvbSBcIi4vZHJhZnREYXRhTG9zc1BvcHVwXCI7XG5cbmV4cG9ydCB0eXBlIFNpYmxpbmdJbmZvcm1hdGlvbiA9IHtcblx0dGFyZ2V0Q29udGV4dDogVjRDb250ZXh0O1xuXHRwYXRoTWFwcGluZzogeyBvbGRQYXRoOiBzdHJpbmc7IG5ld1BhdGg6IHN0cmluZyB9W107XG59O1xuXG4vKipcbiAqIEludGVyZmFjZSBmb3IgY2FsbGJhY2tzIHVzZWQgaW4gdGhlIGZ1bmN0aW9uc1xuICpcbiAqXG4gKiBAYXV0aG9yIFNBUCBTRVxuICogQHNpbmNlIDEuNTQuMFxuICogQGludGVyZmFjZVxuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5kcmFmdC5JQ2FsbGJhY2tcbiAqIEBwcml2YXRlXG4gKi9cblxuLyoqXG4gKiBDYWxsYmFjayB0byBhcHByb3ZlIG9yIHJlamVjdCB0aGUgY3JlYXRpb24gb2YgYSBkcmFmdFxuICpcbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnQuSUNhbGxiYWNrLmJlZm9yZUNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50XG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBhYnN0cmFjdFxuICogQHBhcmFtIHtzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50IGZvciB0aGUgbmV3IGRyYWZ0XG4gKiBAcmV0dXJucyB7KGJvb2xlYW58UHJvbWlzZSl9IEFwcHJvdmFsIG9mIGRyYWZ0IGNyZWF0aW9uIFt0cnVlfGZhbHNlXSBvciBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgYm9vbGVhbiB2YWx1ZVxuICogQHByaXZhdGVcbiAqL1xuXG4vKipcbiAqIENhbGxiYWNrIGFmdGVyIGEgZHJhZnQgd2FzIHN1Y2Nlc3N1bGx5IGNyZWF0ZWRcbiAqXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0LklDYWxsYmFjay5hZnRlckNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50XG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBhYnN0cmFjdFxuICogQHBhcmFtIHtzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgbmV3IGRyYWZ0XG4gKiBAcGFyYW0ge3NhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fSBvQWN0aXZlRG9jdW1lbnRDb250ZXh0IENvbnRleHQgb2YgdGhlIGFjdGl2ZSBkb2N1bWVudCBmb3IgdGhlIG5ldyBkcmFmdFxuICogQHJldHVybnMge3NhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fSBvQWN0aXZlRG9jdW1lbnRDb250ZXh0XG4gKiBAcHJpdmF0ZVxuICovXG5cbi8qKlxuICogQ2FsbGJhY2sgdG8gYXBwcm92ZSBvciByZWplY3Qgb3ZlcndyaXRpbmcgYW4gdW5zYXZlZCBkcmFmdCBvZiBhbm90aGVyIHVzZXJcbiAqXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0LklDYWxsYmFjay53aGVuRGVjaXNpb25Ub092ZXJ3cml0ZURvY3VtZW50SXNSZXF1aXJlZFxuICogQGZ1bmN0aW9uXG4gKiBAcHVibGljXG4gKiBAc3RhdGljXG4gKiBAYWJzdHJhY3RcbiAqIEBwYXJhbSB7c2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9IG9Db250ZXh0IENvbnRleHQgb2YgdGhlIGFjdGl2ZSBkb2N1bWVudCBmb3IgdGhlIG5ldyBkcmFmdFxuICogQHJldHVybnMgeyhib29sZWFufFByb21pc2UpfSBBcHByb3ZhbCB0byBvdmVyd3JpdGUgdW5zYXZlZCBkcmFmdCBbdHJ1ZXxmYWxzZV0gb3IgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggdGhlIGJvb2xlYW4gdmFsdWVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG4vKiBDb25zdGFudHMgZm9yIGRyYWZ0IG9wZXJhdGlvbnMgKi9cbmNvbnN0IGRyYWZ0T3BlcmF0aW9ucyA9IHtcblx0RURJVDogXCJFZGl0QWN0aW9uXCIsXG5cdEFDVElWQVRJT046IFwiQWN0aXZhdGlvbkFjdGlvblwiLFxuXHRESVNDQVJEOiBcIkRpc2NhcmRBY3Rpb25cIixcblx0UFJFUEFSRTogXCJQcmVwYXJhdGlvbkFjdGlvblwiXG59O1xuXG4vKipcbiAqIFN0YXRpYyBmdW5jdGlvbnMgZm9yIHRoZSBkcmFmdCBwcm9ncmFtbWluZyBtb2RlbFxuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0XG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbCBUaGlzIG1vZHVsZSBpcyBvbmx5IGZvciBleHBlcmltZW50YWwgdXNlISA8YnIvPjxiPlRoaXMgaXMgb25seSBhIFBPQyBhbmQgbWF5YmUgZGVsZXRlZDwvYj5cbiAqIEBzaW5jZSAxLjU0LjBcbiAqL1xuXG4vKipcbiAqIERldGVybWluZXMgYWN0aW9uIG5hbWUgZm9yIGEgZHJhZnQgb3BlcmF0aW9uLlxuICpcbiAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IHNob3VsZCBiZSBib3VuZCB0byB0aGUgb3BlcmF0aW9uXG4gKiBAcGFyYW0gc09wZXJhdGlvbiBUaGUgb3BlcmF0aW9uIG5hbWVcbiAqIEByZXR1cm5zIFRoZSBuYW1lIG9mIHRoZSBkcmFmdCBvcGVyYXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0QWN0aW9uTmFtZShvQ29udGV4dDogVjRDb250ZXh0LCBzT3BlcmF0aW9uOiBzdHJpbmcpIHtcblx0Y29uc3Qgb01vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdHNFbnRpdHlTZXRQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChvQ29udGV4dC5nZXRQYXRoKCkpO1xuXG5cdHJldHVybiBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdC8ke3NPcGVyYXRpb259YCk7XG59XG4vKipcbiAqIENyZWF0ZXMgYW4gb3BlcmF0aW9uIGNvbnRleHQgYmluZGluZyBmb3IgdGhlIGdpdmVuIGNvbnRleHQgYW5kIG9wZXJhdGlvbi5cbiAqXG4gKiBAcGFyYW0gb0NvbnRleHQgVGhlIGNvbnRleHQgdGhhdCBzaG91bGQgYmUgYm91bmQgdG8gdGhlIG9wZXJhdGlvblxuICogQHBhcmFtIHNPcGVyYXRpb24gVGhlIG9wZXJhdGlvbiAoYWN0aW9uIG9yIGZ1bmN0aW9uIGltcG9ydClcbiAqIEBwYXJhbSBvT3B0aW9ucyBPcHRpb25zIHRvIGNyZWF0ZSB0aGUgb3BlcmF0aW9uIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBjb250ZXh0IGJpbmRpbmcgb2YgdGhlIGJvdW5kIG9wZXJhdGlvblxuICovXG5mdW5jdGlvbiBjcmVhdGVPcGVyYXRpb24ob0NvbnRleHQ6IFY0Q29udGV4dCwgc09wZXJhdGlvbjogc3RyaW5nLCBvT3B0aW9ucz86IGFueSkge1xuXHRjb25zdCBzT3BlcmF0aW9uTmFtZSA9IGdldEFjdGlvbk5hbWUob0NvbnRleHQsIHNPcGVyYXRpb24pO1xuXG5cdHJldHVybiBvQ29udGV4dC5nZXRNb2RlbCgpLmJpbmRDb250ZXh0KGAke3NPcGVyYXRpb25OYW1lfSguLi4pYCwgb0NvbnRleHQsIG9PcHRpb25zKTtcbn1cbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgcmV0dXJuIHR5cGUgZm9yIGEgZHJhZnQgb3BlcmF0aW9uLlxuICpcbiAqIEBwYXJhbSBvQ29udGV4dCBUaGUgY29udGV4dCB0aGF0IHNob3VsZCBiZSBib3VuZCB0byB0aGUgb3BlcmF0aW9uXG4gKiBAcGFyYW0gc09wZXJhdGlvbiBUaGUgb3BlcmF0aW9uIG5hbWVcbiAqIEByZXR1cm5zIFRoZSByZXR1cm4gdHlwZSBvZiB0aGUgZHJhZnQgb3BlcmF0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldFJldHVyblR5cGUob0NvbnRleHQ6IFY0Q29udGV4dCwgc09wZXJhdGlvbjogc3RyaW5nKSB7XG5cdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0b01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSxcblx0XHRzRW50aXR5U2V0UGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKTtcblxuXHRyZXR1cm4gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3QvJHtzT3BlcmF0aW9ufS8kUmV0dXJuVHlwZWApO1xufVxuLyoqXG4gKiBDaGVjayBpZiBvcHRpb25hbCBkcmFmdCBwcmVwYXJlIGFjdGlvbiBleGlzdHMuXG4gKlxuICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHRoYXQgc2hvdWxkIGJlIGJvdW5kIHRvIHRoZSBvcGVyYXRpb25cbiAqIEByZXR1cm5zIFRydWUgaWYgYSBhIHByZXBhcmUgYWN0aW9uIGV4aXN0c1xuICovXG5mdW5jdGlvbiBoYXNQcmVwYXJlQWN0aW9uKG9Db250ZXh0OiBWNENvbnRleHQpOiBib29sZWFuIHtcblx0cmV0dXJuICEhZ2V0QWN0aW9uTmFtZShvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLlBSRVBBUkUpO1xufVxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGRyYWZ0IGZyb20gYW4gYWN0aXZlIGRvY3VtZW50LlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSBhY3Rpb24gc2hvdWxkIGJlIHBlcmZvcm1lZFxuICogQHBhcmFtIGJQcmVzZXJ2ZUNoYW5nZXMgSWYgdHJ1ZSAtIGV4aXN0aW5nIGNoYW5nZXMgZnJvbSBhbm90aGVyIHVzZXIgdGhhdCBhcmUgbm90IGxvY2tlZCBhcmUgcHJlc2VydmVkIGFuZCBhbiBlcnJvciBtZXNzYWdlIChodHRwIHN0YXR1cyA0MDkpIGlzIHNlbmQgZnJvbSB0aGUgYmFja2VuZCwgb3RoZXJ3aXNlIGZhbHNlIC0gZXhpc3RpbmcgY2hhbmdlcyBmcm9tIGFub3RoZXIgdXNlciB0aGF0IGFyZSBub3QgbG9ja2VkIGFyZSBvdmVyd3JpdHRlbjwvbGk+XG4gKiBAcGFyYW0gb1ZpZXcgSWYgdHJ1ZSAtIGV4aXN0aW5nIGNoYW5nZXMgZnJvbSBhbm90aGVyXG4gKiBAcmV0dXJucyBSZXNvbHZlIGZ1bmN0aW9uIHJldHVybnMgdGhlIGNvbnRleHQgb2YgdGhlIG9wZXJhdGlvblxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlRHJhZnRFZGl0QWN0aW9uKG9Db250ZXh0OiBWNENvbnRleHQsIGJQcmVzZXJ2ZUNoYW5nZXM6IGJvb2xlYW4sIG9WaWV3OiBhbnkpOiBQcm9taXNlPFY0Q29udGV4dD4ge1xuXHRpZiAob0NvbnRleHQuZ2V0UHJvcGVydHkoXCJJc0FjdGl2ZUVudGl0eVwiKSkge1xuXHRcdGNvbnN0IG9PcHRpb25zID0geyAkJGluaGVyaXRFeHBhbmRTZWxlY3Q6IHRydWUgfTtcblx0XHRjb25zdCBvT3BlcmF0aW9uID0gY3JlYXRlT3BlcmF0aW9uKG9Db250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuRURJVCwgb09wdGlvbnMpO1xuXHRcdG9PcGVyYXRpb24uc2V0UGFyYW1ldGVyKFwiUHJlc2VydmVDaGFuZ2VzXCIsIGJQcmVzZXJ2ZUNoYW5nZXMpO1xuXHRcdGNvbnN0IHNHcm91cElkID0gXCJkaXJlY3RcIjtcblx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBhd2FpdCAoKG9WaWV3LmdldE1vZGVsKFwic2FwLmZlLmkxOG5cIikgYXMgUmVzb3VyY2VNb2RlbCkuZ2V0UmVzb3VyY2VCdW5kbGUoKSBhcyBQcm9taXNlPFJlc291cmNlQnVuZGxlPik7XG5cdFx0Y29uc3Qgc0FjdGlvbk5hbWUgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09NTU9OX09CSkVDVF9QQUdFX0VESVRcIiwgb1Jlc291cmNlQnVuZGxlKTtcblx0XHQvL0lmIHRoZSBjb250ZXh0IGlzIGNvbWluZyBmcm9tIGEgbGlzdCBiaW5kaW5nIHdlIHBhc3MgdGhlIGZsYWcgdHJ1ZSB0byByZXBsYWNlIHRoZSBjb250ZXh0IGJ5IHRoZSBhY3RpdmUgb25lXG5cdFx0Y29uc3Qgb0VkaXRQcm9taXNlID0gb09wZXJhdGlvbi5leGVjdXRlKFxuXHRcdFx0c0dyb3VwSWQsXG5cdFx0XHR1bmRlZmluZWQsXG5cdFx0XHQob3BlcmF0aW9uc0hlbHBlciBhcyBhbnkpLmZuT25TdHJpY3RIYW5kbGluZ0ZhaWxlZC5iaW5kKFxuXHRcdFx0XHRkcmFmdCxcblx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdHsgbGFiZWw6IHNBY3Rpb25OYW1lLCBtb2RlbDogb0NvbnRleHQuZ2V0TW9kZWwoKSB9LFxuXHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdG51bGwsXG5cdFx0XHRcdHVuZGVmaW5lZFxuXHRcdFx0KSxcblx0XHRcdG9Db250ZXh0LmdldEJpbmRpbmcoKS5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiKVxuXHRcdCk7XG5cdFx0b09wZXJhdGlvbi5nZXRNb2RlbCgpLnN1Ym1pdEJhdGNoKHNHcm91cElkKTtcblx0XHRyZXR1cm4gYXdhaXQgb0VkaXRQcm9taXNlO1xuXHR9IGVsc2Uge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIllvdSBjYW5ub3QgZWRpdCB0aGlzIGRyYWZ0IGRvY3VtZW50XCIpO1xuXHR9XG59XG5cbi8qKlxuICogRXhlY3V0ZXMgdGhlIHZhbGlkYXRpb24gb2YgdGhlIGRyYWZ0LiBUaGUgUHJlcGFyZUFjdGlvbiBpcyB0cmlnZ2VyZWQgaWYgdGhlIG1lc3NhZ2VzIGFyZSBhbm5vdGF0ZWQgYW5kIGVudGl0eVNldCBnZXRzIGEgUHJlcGFyYXRpb25BY3Rpb24gYW5ub3RhdGVkLlxuICogSWYgdGhlIG9wZXJhdGlvbiBzdWNjZWVkcyBhbmQgb3BlcmF0aW9uIGRvZXNuJ3QgZ2V0IGEgcmV0dXJuIHR5cGUgKFJBUCBzeXN0ZW0pIHRoZSBtZXNzYWdlcyBhcmUgcmVxdWVzdGVkLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSBQcmVwYXJlQWN0aW9uIHNob3VsZCBiZSBwZXJmb3JtZWRcbiAqIEBwYXJhbSBvQXBwQ29tcG9uZW50IFRoZSBBcHBDb21wb25lbnRcbiAqIEByZXR1cm5zIFJlc29sdmUgZnVuY3Rpb24gcmV0dXJuc1xuICogIC0gdGhlIGNvbnRleHQgb2YgdGhlIG9wZXJhdGlvbiBpZiB0aGUgYWN0aW9uIGhhcyBiZWVuIHN1Y2Nlc3NmdWxseSBleGVjdXRlZFxuICogIC0gdm9pZCBpZiB0aGUgYWN0aW9uIGhhcyBmYWlsZWRcbiAqICAtIHVuZGVmaW5lZCBpZiB0aGUgYWN0aW9uIGhhcyBub3QgYmVlbiB0cmlnZ2VyZWQgc2luY2UgdGhlIHByZXJlcXVpc2l0ZXMgYXJlIG5vdCBtZXRcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gZXhlY3V0ZURyYWZ0VmFsaWRhdGlvbihvQ29udGV4dDogVjRDb250ZXh0LCBvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpOiBQcm9taXNlPE9EYXRhQ29udGV4dEJpbmRpbmdFeCB8IHZvaWQgfCB1bmRlZmluZWQ+IHtcblx0aWYgKGRyYWZ0LmdldE1lc3NhZ2VzUGF0aChvQ29udGV4dCkgJiYgZHJhZnQuaGFzUHJlcGFyZUFjdGlvbihvQ29udGV4dCkpIHtcblx0XHRyZXR1cm4gZHJhZnRcblx0XHRcdC5leGVjdXRlRHJhZnRQcmVwYXJhdGlvbkFjdGlvbihvQ29udGV4dCwgb0NvbnRleHQuZ2V0VXBkYXRlR3JvdXBJZCgpLCB0cnVlKVxuXHRcdFx0LnRoZW4oKG9PcGVyYXRpb24pID0+IHtcblx0XHRcdFx0Ly8gaWYgdGhlcmUgaXMgbm8gcmV0dXJuZWQgb3BlcmF0aW9uIGJ5IGV4ZWN1dGVEcmFmdFByZXBhcmF0aW9uQWN0aW9uIC0+IHRoZSBhY3Rpb24gaGFzIGZhaWxlZFxuXHRcdFx0XHRpZiAob09wZXJhdGlvbiAmJiAhZ2V0UmV0dXJuVHlwZShvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLlBSRVBBUkUpKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1NpZGVFZmZlY3RzU2VydmljZSA9IG9BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cdFx0XHRcdFx0cmVxdWVzdE1lc3NhZ2VzKG9Db250ZXh0LCBvU2lkZUVmZmVjdHNTZXJ2aWNlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gb09wZXJhdGlvbjtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goKG9FcnJvcikgPT4ge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXF1ZXN0aW5nIG1lc3NhZ2VzXCIsIG9FcnJvcik7XG5cdFx0XHR9KTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIEFjdGl2YXRlcyBhIGRyYWZ0IGRvY3VtZW50LiBUaGUgZHJhZnQgd2lsbCByZXBsYWNlIHRoZSBzaWJsaW5nIGVudGl0eSBhbmQgd2lsbCBiZSBkZWxldGVkIGJ5IHRoZSBiYWNrIGVuZC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IGZvciB3aGljaCB0aGUgYWN0aW9uIHNob3VsZCBiZSBwZXJmb3JtZWRcbiAqIEBwYXJhbSBvQXBwQ29tcG9uZW50IFRoZSBBcHBDb21wb25lbnRcbiAqIEBwYXJhbSBbc0dyb3VwSWRdIFRoZSBvcHRpb25hbCBiYXRjaCBncm91cCBpbiB3aGljaCB0aGUgb3BlcmF0aW9uIGlzIHRvIGJlIGV4ZWN1dGVkXG4gKiBAcmV0dXJucyBSZXNvbHZlIGZ1bmN0aW9uIHJldHVybnMgdGhlIGNvbnRleHQgb2YgdGhlIG9wZXJhdGlvblxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5hc3luYyBmdW5jdGlvbiBleGVjdXRlRHJhZnRBY3RpdmF0aW9uQWN0aW9uKG9Db250ZXh0OiBWNENvbnRleHQsIG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCwgc0dyb3VwSWQ/OiBzdHJpbmcpOiBQcm9taXNlPFY0Q29udGV4dD4ge1xuXHRjb25zdCBiSGFzUHJlcGFyZUFjdGlvbiA9IGhhc1ByZXBhcmVBY3Rpb24ob0NvbnRleHQpO1xuXG5cdC8vIEFjY29yZGluZyB0byB0aGUgZHJhZnQgc3BlYyBpZiB0aGUgc2VydmljZSBjb250YWlucyBhIHByZXBhcmUgYWN0aW9uIGFuZCB3ZSB0cmlnZ2VyIGJvdGggcHJlcGFyZSBhbmRcblx0Ly8gYWN0aXZhdGUgaW4gb25lICRiYXRjaCB0aGUgYWN0aXZhdGUgYWN0aW9uIGlzIGNhbGxlZCB3aXRoIGlGLU1hdGNoPSpcblx0Y29uc3QgYklnbm9yZUV0YWcgPSBiSGFzUHJlcGFyZUFjdGlvbjtcblxuXHRpZiAoIW9Db250ZXh0LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIikpIHtcblx0XHRjb25zdCBvT3BlcmF0aW9uID0gY3JlYXRlT3BlcmF0aW9uKG9Db250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuQUNUSVZBVElPTiwgeyAkJGluaGVyaXRFeHBhbmRTZWxlY3Q6IHRydWUgfSk7XG5cdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gYXdhaXQgKChvQXBwQ29tcG9uZW50LmdldE1vZGVsKFwic2FwLmZlLmkxOG5cIikgYXMgUmVzb3VyY2VNb2RlbCkuZ2V0UmVzb3VyY2VCdW5kbGUoKSBhcyBhbnkpO1xuXHRcdGNvbnN0IHNBY3Rpb25OYW1lID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX09QX09CSkVDVF9QQUdFX1NBVkVcIiwgb1Jlc291cmNlQnVuZGxlKTtcblx0XHR0cnkge1xuXHRcdFx0cmV0dXJuIGF3YWl0IG9PcGVyYXRpb24uZXhlY3V0ZShcblx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdGJJZ25vcmVFdGFnLFxuXHRcdFx0XHRzR3JvdXBJZFxuXHRcdFx0XHRcdD8gb3BlcmF0aW9uc0hlbHBlci5mbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQuYmluZChcblx0XHRcdFx0XHRcdFx0ZHJhZnQsXG5cdFx0XHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdFx0XHR7IGxhYmVsOiBzQWN0aW9uTmFtZSwgbW9kZWw6IG9Db250ZXh0LmdldE1vZGVsKCkgfSxcblx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0XHR1bmRlZmluZWRcblx0XHRcdFx0XHQgIClcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZCxcblx0XHRcdFx0b0NvbnRleHQuZ2V0QmluZGluZygpLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpXG5cdFx0XHQpO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdGlmIChiSGFzUHJlcGFyZUFjdGlvbikge1xuXHRcdFx0XHRjb25zdCBhY3Rpb25OYW1lID0gZ2V0QWN0aW9uTmFtZShvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLlBSRVBBUkUpLFxuXHRcdFx0XHRcdG9TaWRlRWZmZWN0c1NlcnZpY2UgPSBvQXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpLFxuXHRcdFx0XHRcdG9CaW5kaW5nUGFyYW1ldGVycyA9IG9TaWRlRWZmZWN0c1NlcnZpY2UuZ2V0T0RhdGFBY3Rpb25TaWRlRWZmZWN0cyhhY3Rpb25OYW1lLCBvQ29udGV4dCksXG5cdFx0XHRcdFx0YVRhcmdldFBhdGhzID0gb0JpbmRpbmdQYXJhbWV0ZXJzICYmIG9CaW5kaW5nUGFyYW1ldGVycy5wYXRoRXhwcmVzc2lvbnM7XG5cdFx0XHRcdGlmIChhVGFyZ2V0UGF0aHMgJiYgYVRhcmdldFBhdGhzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0YXdhaXQgb1NpZGVFZmZlY3RzU2VydmljZS5yZXF1ZXN0U2lkZUVmZmVjdHMoYVRhcmdldFBhdGhzLCBvQ29udGV4dCk7XG5cdFx0XHRcdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlcXVlc3Rpbmcgc2lkZSBlZmZlY3RzXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRhd2FpdCByZXF1ZXN0TWVzc2FnZXMob0NvbnRleHQsIG9TaWRlRWZmZWN0c1NlcnZpY2UpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXF1ZXN0aW5nIG1lc3NhZ2VzXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0aHJvdyBlO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaGUgYWN0aXZhdGlvbiBhY3Rpb24gY2Fubm90IGJlIGV4ZWN1dGVkIG9uIGFuIGFjdGl2ZSBkb2N1bWVudFwiKTtcblx0fVxufVxuXG4vKipcbiAqIEdldHMgdGhlIHN1cHBvcnRlZCBtZXNzYWdlIHByb3BlcnR5IHBhdGggb24gdGhlIFByZXBhcmVBY3Rpb24gZm9yIGEgY29udGV4dC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IHRvIGJlIGNoZWNrZWRcbiAqIEByZXR1cm5zIFBhdGggdG8gdGhlIG1lc3NhZ2VcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZnVuY3Rpb24gZ2V0TWVzc2FnZVBhdGhGb3JQcmVwYXJlKG9Db250ZXh0OiBWNENvbnRleHQpOiBzdHJpbmcgfCBudWxsIHtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdGNvbnN0IHNDb250ZXh0UGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0Y29uc3Qgb1JldHVyblR5cGUgPSBnZXRSZXR1cm5UeXBlKG9Db250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuUFJFUEFSRSk7XG5cdC8vIElmIHRoZXJlIGlzIG5vIHJldHVybiBwYXJhbWV0ZXIsIGl0IGlzIG5vdCBwb3NzaWJsZSB0byByZXF1ZXN0IE1lc3NhZ2VzLlxuXHQvLyBSQVAgZHJhZnQgcHJlcGFyZSBoYXMgbm8gcmV0dXJuIHBhcmFtZXRlclxuXHRyZXR1cm4gISFvUmV0dXJuVHlwZSA/IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLk1lc3NhZ2VzfS8kUGF0aGApIDogbnVsbDtcbn1cblxuLyoqXG4gKiBFeGVjdXRlIGEgcHJlcGFyYXRpb24gYWN0aW9uLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSBhY3Rpb24gc2hvdWxkIGJlIHBlcmZvcm1lZFxuICogQHBhcmFtIGdyb3VwSWQgVGhlIG9wdGlvbmFsIGJhdGNoIGdyb3VwIGluIHdoaWNoIHdlIHdhbnQgdG8gZXhlY3V0ZSB0aGUgb3BlcmF0aW9uXG4gKiBAcGFyYW0gYk1lc3NhZ2VzIElmIHNldCB0byB0cnVlLCB0aGUgUFJFUEFSRSBhY3Rpb24gcmV0cmlldmVzIFNBUF9NZXNzYWdlc1xuICogQHJldHVybnMgUmVzb2x2ZSBmdW5jdGlvbiByZXR1cm5zIHRoZSBjb250ZXh0IG9mIHRoZSBvcGVyYXRpb25cbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZnVuY3Rpb24gZXhlY3V0ZURyYWZ0UHJlcGFyYXRpb25BY3Rpb24ob0NvbnRleHQ6IFY0Q29udGV4dCwgZ3JvdXBJZD86IHN0cmluZywgYk1lc3NhZ2VzPzogYm9vbGVhbikge1xuXHRpZiAoIW9Db250ZXh0LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIikpIHtcblx0XHRjb25zdCBzTWVzc2FnZXNQYXRoID0gYk1lc3NhZ2VzID8gZ2V0TWVzc2FnZVBhdGhGb3JQcmVwYXJlKG9Db250ZXh0KSA6IG51bGw7XG5cdFx0Y29uc3Qgb09wZXJhdGlvbiA9IGNyZWF0ZU9wZXJhdGlvbihvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLlBSRVBBUkUsIHNNZXNzYWdlc1BhdGggPyB7ICRzZWxlY3Q6IHNNZXNzYWdlc1BhdGggfSA6IG51bGwpO1xuXG5cdFx0Ly8gVE9ETzogc2lkZSBlZmZlY3RzIHF1YWxpZmllciBzaGFsbCBiZSBldmVuIGRlcHJlY2F0ZWQgdG8gYmUgY2hlY2tlZFxuXHRcdG9PcGVyYXRpb24uc2V0UGFyYW1ldGVyKFwiU2lkZUVmZmVjdHNRdWFsaWZpZXJcIiwgXCJcIik7XG5cblx0XHRjb25zdCBzR3JvdXBJZCA9IGdyb3VwSWQgfHwgb09wZXJhdGlvbi5nZXRHcm91cElkKCk7XG5cdFx0cmV0dXJuIG9PcGVyYXRpb25cblx0XHRcdC5leGVjdXRlKHNHcm91cElkKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gb09wZXJhdGlvbjtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGV4ZWN1dGluZyB0aGUgb3BlcmF0aW9uXCIsIG9FcnJvcik7XG5cdFx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaGUgcHJlcGFyYXRpb24gYWN0aW9uIGNhbm5vdCBiZSBleGVjdXRlZCBvbiBhbiBhY3RpdmUgZG9jdW1lbnRcIik7XG5cdH1cbn1cbi8qKlxuICogRGV0ZXJtaW5lcyB0aGUgbWVzc2FnZSBwYXRoIGZvciBhIGNvbnRleHQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBmb3Igd2hpY2ggdGhlIHBhdGggc2hhbGwgYmUgZGV0ZXJtaW5lZFxuICogQHJldHVybnMgTWVzc2FnZSBwYXRoLCBlbXB0eSBpZiBub3QgYW5ub3RhdGVkXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGdldE1lc3NhZ2VzUGF0aChvQ29udGV4dDogVjRDb250ZXh0KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0Y29uc3Qgb01vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdHNFbnRpdHlTZXRQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChvQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRyZXR1cm4gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXMvJFBhdGhgKTtcbn1cbi8qKlxuICogUmVxdWVzdHMgdGhlIG1lc3NhZ2VzIGlmIGFubm90YXRlZCBmb3IgYSBnaXZlbiBjb250ZXh0LlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSBtZXNzYWdlcyBzaGFsbCBiZSByZXF1ZXN0ZWRcbiAqIEBwYXJhbSBvU2lkZUVmZmVjdHNTZXJ2aWNlIFNlcnZpY2UgZm9yIHRoZSBTaWRlRWZmZWN0cyBvbiBTQVAgRmlvcmkgZWxlbWVudHNcbiAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgb25jZSBtZXNzYWdlcyB3ZXJlIHJlcXVlc3RlZFxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiByZXF1ZXN0TWVzc2FnZXMob0NvbnRleHQ6IFY0Q29udGV4dCwgb1NpZGVFZmZlY3RzU2VydmljZTogU2lkZUVmZmVjdHNTZXJ2aWNlKSB7XG5cdGNvbnN0IHNNZXNzYWdlc1BhdGggPSBkcmFmdC5nZXRNZXNzYWdlc1BhdGgob0NvbnRleHQpO1xuXHRpZiAoc01lc3NhZ2VzUGF0aCkge1xuXHRcdHJldHVybiBvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhbeyAkUHJvcGVydHlQYXRoOiBzTWVzc2FnZXNQYXRoIH1dIGFzIGFueSwgb0NvbnRleHQpO1xuXHR9XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbn1cbi8qKlxuICogRXhlY3V0ZXMgZGlzY2FyZCBvZiBhIGRyYWZ0IGZ1bmN0aW9uIHVzaW5nIEhUVFAgUG9zdC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IGZvciB3aGljaCB0aGUgYWN0aW9uIHNob3VsZCBiZSBwZXJmb3JtZWRcbiAqIEBwYXJhbSBvQXBwQ29tcG9uZW50IEFwcCBDb21wb25lbnRcbiAqIEBwYXJhbSBiRW5hYmxlU3RyaWN0SGFuZGxpbmdcbiAqIEByZXR1cm5zIFJlc29sdmUgZnVuY3Rpb24gcmV0dXJucyB0aGUgY29udGV4dCBvZiB0aGUgb3BlcmF0aW9uXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGV4ZWN1dGVEcmFmdERpc2NhcmRBY3Rpb24ob0NvbnRleHQ6IFY0Q29udGV4dCwgb0FwcENvbXBvbmVudD86IGFueSwgYkVuYWJsZVN0cmljdEhhbmRsaW5nPzogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRpZiAoIW9Db250ZXh0LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIikpIHtcblx0XHRjb25zdCBvRGlzY2FyZE9wZXJhdGlvbiA9IGRyYWZ0LmNyZWF0ZU9wZXJhdGlvbihvQ29udGV4dCwgZHJhZnRPcGVyYXRpb25zLkRJU0NBUkQpO1xuXHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9XG5cdFx0XHQob0FwcENvbXBvbmVudCAmJlxuXHRcdFx0XHQoYXdhaXQgKChvQXBwQ29tcG9uZW50LmdldE1vZGVsKFwic2FwLmZlLmkxOG5cIikgYXMgUmVzb3VyY2VNb2RlbCkuZ2V0UmVzb3VyY2VCdW5kbGUoKSBhcyBQcm9taXNlPFJlc291cmNlQnVuZGxlPikpKSB8fFxuXHRcdFx0bnVsbDtcblx0XHRjb25zdCBzR3JvdXBJZCA9IFwiZGlyZWN0XCI7XG5cdFx0Y29uc3Qgc0FjdGlvbk5hbWUgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfVFJBTlNBQ1RJT05fSEVMUEVSX0RSQUZUX0RJU0NBUkRfQlVUVE9OXCIsIG9SZXNvdXJjZUJ1bmRsZSk7XG5cdFx0Ly8gYXMgdGhlIGRpc2NhcmQgYWN0aW9uIGRvZXNudCcgc2VuZCB0aGUgYWN0aXZlIHZlcnNpb24gaW4gdGhlIHJlc3BvbnNlIHdlIGRvIG5vdCB1c2UgdGhlIHJlcGxhY2UgaW4gY2FjaGVcblx0XHRjb25zdCBvRGlzY2FyZFByb21pc2UgPSAhYkVuYWJsZVN0cmljdEhhbmRsaW5nXG5cdFx0XHQ/IG9EaXNjYXJkT3BlcmF0aW9uLmV4ZWN1dGUoc0dyb3VwSWQpXG5cdFx0XHQ6IG9EaXNjYXJkT3BlcmF0aW9uLmV4ZWN1dGUoXG5cdFx0XHRcdFx0c0dyb3VwSWQsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdG9wZXJhdGlvbnNIZWxwZXIuZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkLmJpbmQoXG5cdFx0XHRcdFx0XHRkcmFmdCxcblx0XHRcdFx0XHRcdHNHcm91cElkLFxuXHRcdFx0XHRcdFx0eyBsYWJlbDogc0FjdGlvbk5hbWUsIG1vZGVsOiBvQ29udGV4dC5nZXRNb2RlbCgpIH0sXG5cdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRudWxsLFxuXHRcdFx0XHRcdFx0bnVsbCxcblx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHR1bmRlZmluZWRcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdGZhbHNlXG5cdFx0XHQgICk7XG5cdFx0b0NvbnRleHQuZ2V0TW9kZWwoKS5zdWJtaXRCYXRjaChzR3JvdXBJZCk7XG5cdFx0cmV0dXJuIG9EaXNjYXJkUHJvbWlzZTtcblx0fSBlbHNlIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJUaGUgZGlzY2FyZCBhY3Rpb24gY2Fubm90IGJlIGV4ZWN1dGVkIG9uIGFuIGFjdGl2ZSBkb2N1bWVudFwiKTtcblx0fVxufVxuXG4vKipcbiAqIFRoaXMgbWV0aG9kIGNyZWF0ZXMgYSBzaWJsaW5nIGNvbnRleHQgZm9yIGEgc3Vib2JqZWN0IHBhZ2UgYW5kIGNhbGN1bGF0ZXMgYSBzaWJsaW5nIHBhdGggZm9yIGFsbCBpbnRlcm1lZGlhdGUgcGF0aHNcbiAqIGJldHdlZW4gdGhlIG9iamVjdCBwYWdlIGFuZCB0aGUgc3Vib2JqZWN0IHBhZ2UuXG4gKlxuICogQHBhcmFtIHJvb3RDdXJyZW50Q29udGV4dCBUaGUgY29udGV4dCBmb3IgdGhlIHJvb3Qgb2YgdGhlIGRyYWZ0XG4gKiBAcGFyYW0gcmlnaHRtb3N0Q3VycmVudENvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIHN1Ym9iamVjdCBwYWdlXG4gKiBAcmV0dXJucyBUaGUgc2libGluZ0luZm9ybWF0aW9uIG9iamVjdFxuICovXG5hc3luYyBmdW5jdGlvbiBjb21wdXRlU2libGluZ0luZm9ybWF0aW9uKFxuXHRyb290Q3VycmVudENvbnRleHQ6IFY0Q29udGV4dCxcblx0cmlnaHRtb3N0Q3VycmVudENvbnRleHQ6IFY0Q29udGV4dFxuKTogUHJvbWlzZTxTaWJsaW5nSW5mb3JtYXRpb24gfCB1bmRlZmluZWQ+IHtcblx0aWYgKCFyaWdodG1vc3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkuc3RhcnRzV2l0aChyb290Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpKSkge1xuXHRcdC8vIFdyb25nIHVzYWdlICEhXG5cdFx0TG9nLmVycm9yKFwiQ2Fubm90IGNvbXB1dGUgcmlnaHRtb3N0IHNpYmxpbmcgY29udGV4dFwiKTtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY29tcHV0ZSByaWdodG1vc3Qgc2libGluZyBjb250ZXh0XCIpO1xuXHR9XG5cblx0aWYgKFxuXHRcdHJpZ2h0bW9zdEN1cnJlbnRDb250ZXh0LmdldFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIikgPT09IGZhbHNlICYmXG5cdFx0cmlnaHRtb3N0Q3VycmVudENvbnRleHQuZ2V0UHJvcGVydHkoXCJIYXNBY3RpdmVFbnRpdHlcIikgPT09IGZhbHNlXG5cdCkge1xuXHRcdC8vIFdlIGFscmVhZHkga25vdyB0aGUgc2libGluZyBmb3IgcmlnaHRtb3N0Q3VycmVudENvbnRleHQgZG9lc24ndCBleGlzdFxuXHRcdC8vIC0tPiBObyBuZWVkIHRvIGNoZWNrIGNhbm9uaWNhbCBwYXRocyBldGMuLi5cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdFxuXHRjb25zdCBtb2RlbCA9IHJvb3RDdXJyZW50Q29udGV4dC5nZXRNb2RlbCgpO1xuXHR0cnkge1xuXHRcdC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIDEuIEZpbmQgYWxsIHNlZ21lbnRzIGJldHdlZW4gdGhlIHJvb3Qgb2JqZWN0IGFuZCB0aGUgc3ViLW9iamVjdFxuXHRcdC8vIEV4YW1wbGU6IGZvciByb290ID0gL1BhcmFtKGFhKS9FbnRpdHkoYmIpIGFuZCByaWdodE1vc3QgPSAvUGFyYW0oYWEpL0VudGl0eShiYikvX05hdihjYykvX1N1Yk5hdihkZClcblx0XHQvLyAtLS0+IFtcIlBhcmFtKGFhKS9FbnRpdHkoYmIpXCIsIFwiX05hdihjYylcIiwgXCJfU3ViTmF2KGRkKVwiXVxuXG5cdFx0Ly8gRmluZCBhbGwgc2VnbWVudHMgaW4gdGhlIHJpZ2h0bW9zdCBwYXRoXG5cdFx0Y29uc3QgYWRkaXRpb25hbFBhdGggPSByaWdodG1vc3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkucmVwbGFjZShyb290Q3VycmVudENvbnRleHQuZ2V0UGF0aCgpLCBcIlwiKTtcblx0XHRjb25zdCBzZWdtZW50cyA9IGFkZGl0aW9uYWxQYXRoID8gYWRkaXRpb25hbFBhdGguc3Vic3RyaW5nKDEpLnNwbGl0KFwiL1wiKSA6IFtdO1xuXHRcdC8vIEZpcnN0IHNlZ21lbnQgaXMgYWx3YXlzIHRoZSBmdWxsIHBhdGggb2YgdGhlIHJvb3Qgb2JqZWN0LCB3aGljaCBjYW4gY29udGFpbiAnLycgaW4gY2FzZSBvZiBhIHBhcmFtZXRyaXplZCBlbnRpdHlcblx0XHRzZWdtZW50cy51bnNoaWZ0KHJvb3RDdXJyZW50Q29udGV4dC5nZXRQYXRoKCkuc3Vic3RyaW5nKDEpKTtcblxuXHRcdC8vIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHRcdC8vIDIuIFJlcXVlc3QgY2Fub25pY2FsIHBhdGhzIG9mIHRoZSBzaWJsaW5nIGVudGl0eSBmb3IgZWFjaCBzZWdtZW50XG5cdFx0Ly8gRXhhbXBsZTogZm9yIFtcIlBhcmFtKGFhKS9FbnRpdHkoYmIpXCIsIFwiX05hdihjYylcIiwgXCJfU3ViTmF2KGRkKVwiXVxuXHRcdC8vIC0tPiByZXF1ZXN0IGNhbm9uaWNhbCBwYXRocyBmb3IgXCJQYXJhbShhYSkvRW50aXR5KGJiKS9TaWJsaW5nRW50aXR5XCIsIFwiUGFyYW0oYWEpL0VudGl0eShiYikvX05hdihjYykvU2libGluZ0VudGl0eVwiLCBcIlBhcmFtKGFhKS9FbnRpdHkoYmIpL19OYXYoY2MpL19TdWJOYXYoZGQpL1NpYmxpbmdFbnRpdHlcIlxuXHRcdGNvbnN0IG9sZFBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGNvbnN0IG5ld1BhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdGxldCBjdXJyZW50UGF0aCA9IFwiXCI7XG5cdFx0Y29uc3QgY2Fub25pY2FsUGF0aFByb21pc2VzID0gc2VnbWVudHMubWFwKChzZWdtZW50KSA9PiB7XG5cdFx0XHRjdXJyZW50UGF0aCArPSBgLyR7c2VnbWVudH1gO1xuXHRcdFx0b2xkUGF0aHMudW5zaGlmdChjdXJyZW50UGF0aCk7XG5cdFx0XHRpZiAoY3VycmVudFBhdGguZW5kc1dpdGgoXCIpXCIpKSB7XG5cdFx0XHRcdGNvbnN0IHNpYmxpbmdDb250ZXh0ID0gbW9kZWwuYmluZENvbnRleHQoYCR7Y3VycmVudFBhdGh9L1NpYmxpbmdFbnRpdHlgKS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHRcdFx0cmV0dXJuIHNpYmxpbmdDb250ZXh0LnJlcXVlc3RDYW5vbmljYWxQYXRoKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7IC8vIDEtMSByZWxhdGlvblxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cdFx0Ly8gMy4gUmVjb25zdHJ1Y3QgdGhlIGZ1bGwgcGF0aHMgZnJvbSBjYW5vbmljYWwgcGF0aHMgKGZvciBwYXRoIG1hcHBpbmcpXG5cdFx0Ly8gRXhhbXBsZTogZm9yIGNhbm9uaWNhbCBwYXRocyBcIi9QYXJhbShhYSkvRW50aXR5KGJiLXNpYmxpbmcpXCIsIFwiL0VudGl0eTIoY2Mtc2libGluZylcIiwgXCIvRW50aXR5MyhkZC1zaWJsaW5nKVwiXG5cdFx0Ly8gLS0+IFtcIlBhcmFtKGFhKS9FbnRpdHkoYmItc2libGluZylcIiwgXCJQYXJhbShhYSkvRW50aXR5KGJiLXNpYmxpbmcpL19OYXYoY2Mtc2libGluZylcIiwgXCJQYXJhbShhYSkvRW50aXR5KGJiLXNpYmxpbmcpL19OYXYoY2Mtc2libGluZykvX1N1Yk5hdihkZC1zaWJsaW5nKVwiXVxuXHRcdGNvbnN0IGNhbm9uaWNhbFBhdGhzID0gKGF3YWl0IFByb21pc2UuYWxsKGNhbm9uaWNhbFBhdGhQcm9taXNlcykpIGFzIHN0cmluZ1tdO1xuXHRcdGxldCBzaWJsaW5nUGF0aCA9IFwiXCI7XG5cdFx0Y2Fub25pY2FsUGF0aHMuZm9yRWFjaCgoY2Fub25pY2FsUGF0aCwgaW5kZXgpID0+IHtcblx0XHRcdGlmIChpbmRleCAhPT0gMCkge1xuXHRcdFx0XHRpZiAoc2VnbWVudHNbaW5kZXhdLmVuZHNXaXRoKFwiKVwiKSkge1xuXHRcdFx0XHRcdGNvbnN0IG5hdmlnYXRpb24gPSBzZWdtZW50c1tpbmRleF0ucmVwbGFjZSgvXFwoLiokLywgXCJcIik7IC8vIEtlZXAgb25seSBuYXZpZ2F0aW9uIG5hbWUgZnJvbSB0aGUgc2VnbWVudCwgaS5lLiBhYWEoeHh4KSAtLT4gYWFhXG5cdFx0XHRcdFx0Y29uc3Qga2V5cyA9IGNhbm9uaWNhbFBhdGgucmVwbGFjZSgvLipcXCgvLCBcIihcIik7IC8vIEtlZXAgb25seSB0aGUga2V5cyBmcm9tIHRoZSBjYW5vbmljYWwgcGF0aCwgaS5lLiBhYWEoeHh4KSAtLT4gKHh4eClcblx0XHRcdFx0XHRzaWJsaW5nUGF0aCArPSBgLyR7bmF2aWdhdGlvbn0ke2tleXN9YDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzaWJsaW5nUGF0aCArPSBgLyR7c2VnbWVudHNbaW5kZXhdfWA7IC8vIDEtMSByZWxhdGlvblxuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzaWJsaW5nUGF0aCA9IGNhbm9uaWNhbFBhdGg7IC8vIFRvIG1hbmFnZSBwYXJhbWV0cml6ZWQgZW50aXRpZXNcblx0XHRcdH1cblx0XHRcdG5ld1BhdGhzLnVuc2hpZnQoc2libGluZ1BhdGgpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHRhcmdldENvbnRleHQ6IG1vZGVsLmJpbmRDb250ZXh0KHNpYmxpbmdQYXRoKS5nZXRCb3VuZENvbnRleHQoKSwgLy8gQ3JlYXRlIHRoZSByaWdodG1vc3Qgc2libGluZyBjb250ZXh0IGZyb20gaXRzIHBhdGhcblx0XHRcdHBhdGhNYXBwaW5nOiBvbGRQYXRocy5tYXAoKG9sZFBhdGgsIGluZGV4KSA9PiB7XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0b2xkUGF0aCxcblx0XHRcdFx0XHRuZXdQYXRoOiBuZXdQYXRoc1tpbmRleF1cblx0XHRcdFx0fTtcblx0XHRcdH0pXG5cdFx0fTtcblx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHQvLyBBIGNhbm9uaWNhbCBwYXRoIGNvdWxkbid0IGJlIHJlc29sdmVkIChiZWNhdXNlIGEgc2libGluZyBkb2Vzbid0IGV4aXN0KVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgZHJhZnQgZG9jdW1lbnQgZnJvbSBhbiBleGlzdGluZyBkb2N1bWVudC5cbiAqXG4gKiBUaGUgZnVuY3Rpb24gc3VwcG9ydHMgc2V2ZXJhbCBob29rcyBhcyB0aGVyZSBpcyBhIGNlcnRhaW4gY29yZW9ncmFwaHkgZGVmaW5lZC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnQjY3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnRcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0XG4gKiBAc3RhdGljXG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCBvZiB0aGUgYWN0aXZlIGRvY3VtZW50IGZvciB0aGUgbmV3IGRyYWZ0XG4gKiBAcGFyYW0gb0FwcENvbXBvbmVudCBUaGUgQXBwQ29tcG9uZW50XG4gKiBAcGFyYW0gbVBhcmFtZXRlcnMgVGhlIHBhcmFtZXRlcnNcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMub1ZpZXddIFRoZSB2aWV3XG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmJQcmVzZXJ2ZUNoYW5nZXNdIFByZXNlcnZlIGNoYW5nZXMgb2YgYW4gZXhpc3RpbmcgZHJhZnQgb2YgYW5vdGhlciB1c2VyXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmZuQmVmb3JlQ3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnRdIENhbGxiYWNrIHRoYXQgYWxsb3dzIHZldG8gYmVmb3JlIGNyZWF0ZSByZXF1ZXN0IGlzIGV4ZWN1dGVkXG4gKiBAcGFyYW0gW21QYXJhbWV0ZXJzLmZuQWZ0ZXJDcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudF0gQ2FsbGJhY2sgZm9yIHBvc3Rwcm9jZXNzaW9uZyBhZnRlciBkcmFmdCBkb2N1bWVudCB3YXMgY3JlYXRlZFxuICogQHBhcmFtIFttUGFyYW1ldGVycy5mbldoZW5EZWNpc2lvblRvT3ZlcndyaXRlRG9jdW1lbnRJc1JlcXVpcmVkXSBDYWxsYmFjayBmb3IgZGVjaWRpbmcgb24gb3ZlcndyaXRpbmcgYW4gdW5zYXZlZCBjaGFuZ2UgYnkgYW5vdGhlciB1c2VyXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVzIHdpdGggdGhlIHtAbGluayBzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dCBjb250ZXh0fSBvZiB0aGUgbmV3IGRyYWZ0IGRvY3VtZW50XG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmFzeW5jIGZ1bmN0aW9uIGNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50KFxuXHRvQ29udGV4dDogYW55LFxuXHRvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQsXG5cdG1QYXJhbWV0ZXJzOiB7XG5cdFx0b1ZpZXc6IFZpZXc7XG5cdFx0YlByZXNlcnZlQ2hhbmdlcz86IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cdFx0Zm5CZWZvcmVDcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudD86IGFueTtcblx0XHRmbkFmdGVyQ3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnQ/OiBhbnk7XG5cdFx0Zm5XaGVuRGVjaXNpb25Ub092ZXJ3cml0ZURvY3VtZW50SXNSZXF1aXJlZD86IGFueTtcblx0fVxuKTogUHJvbWlzZTxWNENvbnRleHQgfCB1bmRlZmluZWQ+IHtcblx0Y29uc3QgbVBhcmFtID0gbVBhcmFtZXRlcnMgfHwge30sXG5cdFx0bG9jYWxJMThuUmVmID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKSxcblx0XHRiUnVuUHJlc2VydmVDaGFuZ2VzRmxvdyA9XG5cdFx0XHR0eXBlb2YgbVBhcmFtLmJQcmVzZXJ2ZUNoYW5nZXMgPT09IFwidW5kZWZpbmVkXCIgfHwgKHR5cGVvZiBtUGFyYW0uYlByZXNlcnZlQ2hhbmdlcyA9PT0gXCJib29sZWFuXCIgJiYgbVBhcmFtLmJQcmVzZXJ2ZUNoYW5nZXMpOyAvL2RlZmF1bHQgdHJ1ZVxuXG5cdC8qKlxuXHQgKiBPdmVyd3JpdGUgb3IgcmVqZWN0IGJhc2VkIG9uIGZuV2hlbkRlY2lzaW9uVG9PdmVyd3JpdGVEb2N1bWVudElzUmVxdWlyZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBiT3ZlcndyaXRlIE92ZXJ3cml0ZSB0aGUgY2hhbmdlIG9yIG5vdFxuXHQgKiBAcmV0dXJucyBSZXNvbHZlcyB3aXRoIHJlc3VsdCBvZiB7QGxpbmsgc2FwLmZlLmNvcmUuYWN0aW9ucyNleGVjdXRlRHJhZnRFZGl0QWN0aW9ufVxuXHQgKi9cblx0YXN5bmMgZnVuY3Rpb24gb3ZlcndyaXRlT25EZW1hbmQoYk92ZXJ3cml0ZTogYm9vbGVhbikge1xuXHRcdGlmIChiT3ZlcndyaXRlKSB7XG5cdFx0XHQvL092ZXJ3cml0ZSBleGlzdGluZyBjaGFuZ2VzXG5cdFx0XHRjb25zdCBvTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdFx0Y29uc3QgZHJhZnREYXRhQ29udGV4dCA9IG9Nb2RlbC5iaW5kQ29udGV4dChgJHtvQ29udGV4dC5nZXRQYXRoKCl9L0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhYCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cblx0XHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IGF3YWl0IChtUGFyYW1ldGVycy5vVmlldy5nZXRNb2RlbChcInNhcC5mZS5pMThuXCIpIGFzIFJlc291cmNlTW9kZWwpLmdldFJlc291cmNlQnVuZGxlKCk7XG5cdFx0XHRjb25zdCBkcmFmdEFkbWluRGF0YSA9IGF3YWl0IGRyYWZ0RGF0YUNvbnRleHQucmVxdWVzdE9iamVjdCgpO1xuXHRcdFx0aWYgKGRyYWZ0QWRtaW5EYXRhKSB7XG5cdFx0XHRcdC8vIHJlbW92ZSBhbGwgdW5ib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzIGFzIHdlIHNob3cgYSBzcGVjaWFsIGRpYWxvZ1xuXHRcdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0XHRsZXQgc0luZm8gPSBkcmFmdEFkbWluRGF0YS5JblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvbiB8fCBkcmFmdEFkbWluRGF0YS5JblByb2Nlc3NCeVVzZXI7XG5cdFx0XHRcdGNvbnN0IHNFbnRpdHlTZXQgPSAobVBhcmFtZXRlcnMub1ZpZXcuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmVudGl0eVNldDtcblx0XHRcdFx0aWYgKHNJbmZvKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc0xvY2tlZEJ5VXNlck1zZyA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFx0XCJDX0RSQUZUX09CSkVDVF9QQUdFX0RSQUZUX0xPQ0tFRF9CWV9VU0VSXCIsXG5cdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRzSW5mbyxcblx0XHRcdFx0XHRcdHNFbnRpdHlTZXRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdE1lc3NhZ2VCb3guZXJyb3Ioc0xvY2tlZEJ5VXNlck1zZyk7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKHNMb2NrZWRCeVVzZXJNc2cpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNJbmZvID0gZHJhZnRBZG1pbkRhdGEuQ3JlYXRlZEJ5VXNlckRlc2NyaXB0aW9uIHx8IGRyYWZ0QWRtaW5EYXRhLkNyZWF0ZWRCeVVzZXI7XG5cdFx0XHRcdFx0Y29uc3Qgc1Vuc2F2ZWRDaGFuZ2VzTXNnID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXG5cdFx0XHRcdFx0XHRcIkNfRFJBRlRfT0JKRUNUX1BBR0VfRFJBRlRfVU5TQVZFRF9DSEFOR0VTXCIsXG5cdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRzSW5mbyxcblx0XHRcdFx0XHRcdHNFbnRpdHlTZXRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdGF3YWl0IHNob3dNZXNzYWdlQm94KHNVbnNhdmVkQ2hhbmdlc01zZyk7XG5cdFx0XHRcdFx0cmV0dXJuIGV4ZWN1dGVEcmFmdEVkaXRBY3Rpb24ob0NvbnRleHQsIGZhbHNlLCBtUGFyYW1ldGVycy5vVmlldyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBEcmFmdCBjcmVhdGlvbiBhYm9ydGVkIGZvciBkb2N1bWVudDogJHtvQ29udGV4dC5nZXRQYXRoKCl9YCk7XG5cdH1cblxuXHRmdW5jdGlvbiBzaG93TWVzc2FnZUJveChzVW5zYXZlZENoYW5nZXNNc2c6IGFueSkge1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogKHZhbHVlOiBhbnkpID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbj86IGFueSkgPT4gdm9pZCkge1xuXHRcdFx0Y29uc3Qgb0RpYWxvZyA9IG5ldyBEaWFsb2coe1xuXHRcdFx0XHR0aXRsZTogbG9jYWxJMThuUmVmLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9USVRMRV9XQVJOSU5HXCIpLFxuXHRcdFx0XHRzdGF0ZTogXCJXYXJuaW5nXCIsXG5cdFx0XHRcdGNvbnRlbnQ6IG5ldyBUZXh0KHtcblx0XHRcdFx0XHR0ZXh0OiBzVW5zYXZlZENoYW5nZXNNc2dcblx0XHRcdFx0fSksXG5cdFx0XHRcdGJlZ2luQnV0dG9uOiBuZXcgQnV0dG9uKHtcblx0XHRcdFx0XHR0ZXh0OiBsb2NhbEkxOG5SZWYuZ2V0VGV4dChcIkNfQ09NTU9OX09CSkVDVF9QQUdFX0VESVRcIiksXG5cdFx0XHRcdFx0dHlwZTogXCJFbXBoYXNpemVkXCIsXG5cdFx0XHRcdFx0cHJlc3M6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG9EaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHRcdHJlc29sdmUodHJ1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSxcblx0XHRcdFx0ZW5kQnV0dG9uOiBuZXcgQnV0dG9uKHtcblx0XHRcdFx0XHR0ZXh0OiBsb2NhbEkxOG5SZWYuZ2V0VGV4dChcIkNfQ09NTU9OX09CSkVDVF9QQUdFX0NBTkNFTFwiKSxcblx0XHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHRcdFx0cmVqZWN0KGBEcmFmdCBjcmVhdGlvbiBhYm9ydGVkIGZvciBkb2N1bWVudDogJHtvQ29udGV4dC5nZXRQYXRoKCl9YCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KSxcblx0XHRcdFx0YWZ0ZXJDbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdG9EaWFsb2cuZGVzdHJveSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdG9EaWFsb2cuYWRkU3R5bGVDbGFzcyhcInNhcFVpQ29udGVudFBhZGRpbmdcIik7XG5cdFx0XHRvRGlhbG9nLm9wZW4oKTtcblx0XHR9KTtcblx0fVxuXG5cdGlmICghb0NvbnRleHQpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJCaW5kaW5nIGNvbnRleHQgdG8gYWN0aXZlIGRvY3VtZW50IGlzIHJlcXVpcmVkXCIpO1xuXHR9XG5cblx0Y29uc3QgYkV4ZWN1dGUgPSBtUGFyYW0uZm5CZWZvcmVDcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudFxuXHRcdD8gbVBhcmFtLmZuQmVmb3JlQ3JlYXRlRHJhZnRGcm9tQWN0aXZlRG9jdW1lbnQob0NvbnRleHQsIGJSdW5QcmVzZXJ2ZUNoYW5nZXNGbG93KVxuXHRcdDogdHJ1ZTtcblxuXHRpZiAoIWJFeGVjdXRlKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKGBEcmFmdCBjcmVhdGlvbiB3YXMgYWJvcnRlZCBieSBleHRlbnNpb24gZm9yIGRvY3VtZW50OiAke29Db250ZXh0LmdldFBhdGgoKX1gKTtcblx0fVxuXHR0cnkge1xuXHRcdGxldCBvRHJhZnRDb250ZXh0OiBWNENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdFx0dHJ5IHtcblx0XHRcdG9EcmFmdENvbnRleHQgPSBhd2FpdCBkcmFmdC5leGVjdXRlRHJhZnRFZGl0QWN0aW9uKG9Db250ZXh0LCBiUnVuUHJlc2VydmVDaGFuZ2VzRmxvdywgbVBhcmFtZXRlcnMub1ZpZXcpO1xuXHRcdH0gY2F0Y2ggKG9SZXNwb25zZTogYW55KSB7XG5cdFx0XHQvL09ubHkgY2FsbCBiYWNrIGlmIGVycm9yIDQwOVxuXHRcdFx0aWYgKGJSdW5QcmVzZXJ2ZUNoYW5nZXNGbG93ICYmIG9SZXNwb25zZS5zdGF0dXMgPT09IDQwOSkge1xuXHRcdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0bWVzc2FnZUhhbmRsaW5nLnJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0aWYgKEFjdGl2aXR5U3luYy5pc0NvbGxhYm9yYXRpb25FbmFibGVkKG1QYXJhbWV0ZXJzLm9WaWV3KSkge1xuXHRcdFx0XHRcdGNvbnN0IHNpYmxpbmdJbmZvID0gYXdhaXQgZHJhZnQuY29tcHV0ZVNpYmxpbmdJbmZvcm1hdGlvbihvQ29udGV4dCwgb0NvbnRleHQpO1xuXHRcdFx0XHRcdGlmIChzaWJsaW5nSW5mbz8udGFyZ2V0Q29udGV4dCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHNpYmxpbmdJbmZvLnRhcmdldENvbnRleHQ7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihvUmVzcG9uc2UpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvRHJhZnRDb250ZXh0ID0gYXdhaXQgb3ZlcndyaXRlT25EZW1hbmQoXG5cdFx0XHRcdFx0XHRtUGFyYW0uZm5XaGVuRGVjaXNpb25Ub092ZXJ3cml0ZURvY3VtZW50SXNSZXF1aXJlZCA/IG1QYXJhbS5mbldoZW5EZWNpc2lvblRvT3ZlcndyaXRlRG9jdW1lbnRJc1JlcXVpcmVkKCkgOiB0cnVlXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmICghKG9SZXNwb25zZSAmJiBvUmVzcG9uc2UuY2FuY2VsZWQpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihvUmVzcG9uc2UpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdG9EcmFmdENvbnRleHQgPVxuXHRcdFx0b0RyYWZ0Q29udGV4dCAmJiBtUGFyYW0uZm5BZnRlckNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50XG5cdFx0XHRcdD8gbVBhcmFtLmZuQWZ0ZXJDcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudChvQ29udGV4dCwgb0RyYWZ0Q29udGV4dClcblx0XHRcdFx0OiBvRHJhZnRDb250ZXh0O1xuXG5cdFx0aWYgKG9EcmFmdENvbnRleHQpIHtcblx0XHRcdGNvbnN0IHNFZGl0QWN0aW9uTmFtZSA9IGdldEFjdGlvbk5hbWUob0RyYWZ0Q29udGV4dCwgZHJhZnRPcGVyYXRpb25zLkVESVQpO1xuXHRcdFx0Y29uc3Qgb1NpZGVFZmZlY3RzID0gb0FwcENvbXBvbmVudC5nZXRTaWRlRWZmZWN0c1NlcnZpY2UoKS5nZXRPRGF0YUFjdGlvblNpZGVFZmZlY3RzKHNFZGl0QWN0aW9uTmFtZSwgb0RyYWZ0Q29udGV4dCk7XG5cdFx0XHRpZiAob1NpZGVFZmZlY3RzPy50cmlnZ2VyQWN0aW9ucz8ubGVuZ3RoKSB7XG5cdFx0XHRcdGF3YWl0IG9BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCkucmVxdWVzdFNpZGVFZmZlY3RzRm9yT0RhdGFBY3Rpb24ob1NpZGVFZmZlY3RzLCBvRHJhZnRDb250ZXh0KTtcblxuXHRcdFx0XHRyZXR1cm4gb0RyYWZ0Q29udGV4dDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBvRHJhZnRDb250ZXh0O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fSBjYXRjaCAoZXhjOiBhbnkpIHtcblx0XHR0aHJvdyBleGM7XG5cdH1cbn1cbi8qKlxuICogQ3JlYXRlcyBhbiBhY3RpdmUgZG9jdW1lbnQgZnJvbSBhIGRyYWZ0IGRvY3VtZW50LlxuICpcbiAqIFRoZSBmdW5jdGlvbiBzdXBwb3J0cyBzZXZlcmFsIGhvb2tzIGFzIHRoZXJlIGlzIGEgY2VydGFpbiBjaG9yZW9ncmFwaHkgZGVmaW5lZC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnQjYWN0aXZhdGVEb2N1bWVudFxuICogQG1lbWJlcm9mIHNhcC5mZS5jb3JlLmFjdGlvbnMuZHJhZnRcbiAqIEBzdGF0aWNcbiAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9mIHRoZSBhY3RpdmUgZG9jdW1lbnQgZm9yIHRoZSBuZXcgZHJhZnRcbiAqIEBwYXJhbSBvQXBwQ29tcG9uZW50IFRoZSBBcHBDb21wb25lbnRcbiAqIEBwYXJhbSBtUGFyYW1ldGVycyBUaGUgcGFyYW1ldGVyc1xuICogQHBhcmFtIFttUGFyYW1ldGVycy5mbkJlZm9yZUFjdGl2YXRlRG9jdW1lbnRdIENhbGxiYWNrIHRoYXQgYWxsb3dzIGEgdmV0byBiZWZvcmUgdGhlICdDcmVhdGUnIHJlcXVlc3QgaXMgZXhlY3V0ZWRcbiAqIEBwYXJhbSBbbVBhcmFtZXRlcnMuZm5BZnRlckFjdGl2YXRlRG9jdW1lbnRdIENhbGxiYWNrIGZvciBwb3N0cHJvY2Vzc2luZyBhZnRlciBkb2N1bWVudCB3YXMgYWN0aXZhdGVkLlxuICogQHBhcmFtIG1lc3NhZ2VIYW5kbGVyIFRoZSBtZXNzYWdlIGhhbmRsZXJcbiAqIEByZXR1cm5zIFByb21pc2UgcmVzb2x2ZXMgd2l0aCB0aGUge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0IGNvbnRleHR9IG9mIHRoZSBuZXcgZHJhZnQgZG9jdW1lbnRcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gYWN0aXZhdGVEb2N1bWVudChcblx0b0NvbnRleHQ6IFY0Q29udGV4dCxcblx0b0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50LFxuXHRtUGFyYW1ldGVyczogeyBmbkJlZm9yZUFjdGl2YXRlRG9jdW1lbnQ/OiBhbnk7IGZuQWZ0ZXJBY3RpdmF0ZURvY3VtZW50PzogYW55IH0sXG5cdG1lc3NhZ2VIYW5kbGVyPzogTWVzc2FnZUhhbmRsZXJcbikge1xuXHRjb25zdCBtUGFyYW0gPSBtUGFyYW1ldGVycyB8fCB7fTtcblx0aWYgKCFvQ29udGV4dCkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkJpbmRpbmcgY29udGV4dCB0byBkcmFmdCBkb2N1bWVudCBpcyByZXF1aXJlZFwiKTtcblx0fVxuXG5cdGNvbnN0IGJFeGVjdXRlID0gbVBhcmFtLmZuQmVmb3JlQWN0aXZhdGVEb2N1bWVudCA/IGF3YWl0IG1QYXJhbS5mbkJlZm9yZUFjdGl2YXRlRG9jdW1lbnQob0NvbnRleHQpIDogdHJ1ZTtcblx0aWYgKCFiRXhlY3V0ZSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihgQWN0aXZhdGlvbiBvZiB0aGUgZG9jdW1lbnQgd2FzIGFib3J0ZWQgYnkgZXh0ZW5zaW9uIGZvciBkb2N1bWVudDogJHtvQ29udGV4dC5nZXRQYXRoKCl9YCk7XG5cdH1cblxuXHRsZXQgb0FjdGl2ZURvY3VtZW50Q29udGV4dDogYW55O1xuXHRpZiAoIWhhc1ByZXBhcmVBY3Rpb24ob0NvbnRleHQpKSB7XG5cdFx0b0FjdGl2ZURvY3VtZW50Q29udGV4dCA9IGF3YWl0IGV4ZWN1dGVEcmFmdEFjdGl2YXRpb25BY3Rpb24ob0NvbnRleHQsIG9BcHBDb21wb25lbnQpO1xuXHR9IGVsc2Uge1xuXHRcdC8qIGFjdGl2YXRpb24gcmVxdWlyZXMgcHJlcGFyYXRpb24gKi9cblx0XHRjb25zdCBzQmF0Y2hHcm91cCA9IFwiZHJhZnRcIjtcblx0XHQvLyB3ZSB1c2UgdGhlIHNhbWUgYmF0Y2hHcm91cCB0byBmb3JjZSBwcmVwYXJlIGFuZCBhY3RpdmF0ZSBpbiBhIHNhbWUgYmF0Y2ggYnV0IHdpdGggZGlmZmVyZW50IGNoYW5nZXNldFxuXHRcdGxldCBvUHJlcGFyZVByb21pc2UgPSBkcmFmdC5leGVjdXRlRHJhZnRQcmVwYXJhdGlvbkFjdGlvbihvQ29udGV4dCwgc0JhdGNoR3JvdXAsIGZhbHNlKTtcblx0XHRvQ29udGV4dC5nZXRNb2RlbCgpLnN1Ym1pdEJhdGNoKHNCYXRjaEdyb3VwKTtcblx0XHRjb25zdCBvQWN0aXZhdGVQcm9taXNlID0gZHJhZnQuZXhlY3V0ZURyYWZ0QWN0aXZhdGlvbkFjdGlvbihvQ29udGV4dCwgb0FwcENvbXBvbmVudCwgc0JhdGNoR3JvdXApO1xuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCB2YWx1ZXMgPSBhd2FpdCBQcm9taXNlLmFsbChbb1ByZXBhcmVQcm9taXNlLCBvQWN0aXZhdGVQcm9taXNlXSk7XG5cdFx0XHRvQWN0aXZlRG9jdW1lbnRDb250ZXh0ID0gdmFsdWVzWzFdO1xuXHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0Ly8gQkNQIDIyNzAwODQwNzVcblx0XHRcdC8vIGlmIHRoZSBBY3RpdmF0aW9uIGZhaWxzLCB0aGVuIHRoZSBtZXNzYWdlcyBhcmUgcmV0cmlldmVkIGZyb20gUFJFUEFSQVRJT04gYWN0aW9uXG5cdFx0XHRjb25zdCBzTWVzc2FnZXNQYXRoID0gZ2V0TWVzc2FnZVBhdGhGb3JQcmVwYXJlKG9Db250ZXh0KTtcblx0XHRcdGlmIChzTWVzc2FnZXNQYXRoKSB7XG5cdFx0XHRcdG9QcmVwYXJlUHJvbWlzZSA9IGRyYWZ0LmV4ZWN1dGVEcmFmdFByZXBhcmF0aW9uQWN0aW9uKG9Db250ZXh0LCBzQmF0Y2hHcm91cCwgdHJ1ZSk7XG5cdFx0XHRcdG9Db250ZXh0LmdldE1vZGVsKCkuc3VibWl0QmF0Y2goc0JhdGNoR3JvdXApO1xuXHRcdFx0XHRhd2FpdCBvUHJlcGFyZVByb21pc2U7XG5cdFx0XHRcdGNvbnN0IGRhdGEgPSBhd2FpdCBvQ29udGV4dC5yZXF1ZXN0T2JqZWN0KCk7XG5cdFx0XHRcdGlmIChkYXRhW3NNZXNzYWdlc1BhdGhdLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHQvL2lmIG1lc3NhZ2VzIGFyZSBhdmFpbGFibGUgZnJvbSB0aGUgUFJFUEFSQVRJT04gYWN0aW9uLCB0aGVuIHByZXZpb3VzIHRyYW5zaXRpb24gbWVzc2FnZXMgYXJlIHJlbW92ZWRcblx0XHRcdFx0XHRtZXNzYWdlSGFuZGxlcj8ucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKGZhbHNlLCBmYWxzZSwgb0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gbVBhcmFtLmZuQWZ0ZXJBY3RpdmF0ZURvY3VtZW50ID8gbVBhcmFtLmZuQWZ0ZXJBY3RpdmF0ZURvY3VtZW50KG9Db250ZXh0LCBvQWN0aXZlRG9jdW1lbnRDb250ZXh0KSA6IG9BY3RpdmVEb2N1bWVudENvbnRleHQ7XG59XG5cbi8qKlxuICogSFRUUCBQT1NUIGNhbGwgd2hlbiBEcmFmdEFjdGlvbiBpcyBwcmVzZW50IGZvciBEcmFmdCBEZWxldGU7IEhUVFAgREVMRVRFIGNhbGwgd2hlbiB0aGVyZSBpcyBubyBEcmFmdEFjdGlvblxuICogYW5kIEFjdGl2ZSBJbnN0YW5jZSBhbHdheXMgdXNlcyBERUxFVEUuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5hY3Rpb25zLmRyYWZ0I2RlbGV0ZURyYWZ0XG4gKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuYWN0aW9ucy5kcmFmdFxuICogQHN0YXRpY1xuICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgb2YgdGhlIGRvY3VtZW50IHRvIGJlIGRpc2NhcmRlZFxuICogQHBhcmFtIG9BcHBDb21wb25lbnQgQ29udGV4dCBvZiB0aGUgZG9jdW1lbnQgdG8gYmUgZGlzY2FyZGVkXG4gKiBAcGFyYW0gYkVuYWJsZVN0cmljdEhhbmRsaW5nXG4gKiBAcHJpdmF0ZVxuICogQHJldHVybnMgQSBQcm9taXNlIHJlc29sdmVkIHdoZW4gdGhlIGNvbnRleHQgaXMgZGVsZXRlZFxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGRlbGV0ZURyYWZ0KG9Db250ZXh0OiBWNENvbnRleHQsIG9BcHBDb21wb25lbnQ/OiBhbnksIGJFbmFibGVTdHJpY3RIYW5kbGluZz86IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0Y29uc3Qgc0Rpc2NhcmRBY3Rpb24gPSBnZXRBY3Rpb25OYW1lKG9Db250ZXh0LCBkcmFmdE9wZXJhdGlvbnMuRElTQ0FSRCksXG5cdFx0YklzQWN0aXZlRW50aXR5ID0gb0NvbnRleHQuZ2V0T2JqZWN0KCkuSXNBY3RpdmVFbnRpdHk7XG5cblx0aWYgKGJJc0FjdGl2ZUVudGl0eSB8fCAoIWJJc0FjdGl2ZUVudGl0eSAmJiAhc0Rpc2NhcmRBY3Rpb24pKSB7XG5cdFx0Ly9Vc2UgRGVsZXRlIGluIGNhc2Ugb2YgYWN0aXZlIGVudGl0eSBhbmQgbm8gZGlzY2FyZCBhY3Rpb24gYXZhaWxhYmxlIGZvciBkcmFmdFxuXHRcdGlmIChvQ29udGV4dC5oYXNQZW5kaW5nQ2hhbmdlcygpKSB7XG5cdFx0XHRyZXR1cm4gb0NvbnRleHRcblx0XHRcdFx0LmdldEJpbmRpbmcoKVxuXHRcdFx0XHQucmVzZXRDaGFuZ2VzKClcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJldHVybiBvQ29udGV4dC5kZWxldGUoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVqZWN0KGVycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBvQ29udGV4dC5kZWxldGUoKTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly9Vc2UgRGlzY2FyZCBQb3N0IEFjdGlvbiBpZiBpdCBpcyBhIGRyYWZ0IGVudGl0eSBhbmQgZGlzY2FyZCBhY3Rpb24gZXhpc3RzXG5cdFx0cmV0dXJuIGV4ZWN1dGVEcmFmdERpc2NhcmRBY3Rpb24ob0NvbnRleHQsIG9BcHBDb21wb25lbnQsIGJFbmFibGVTdHJpY3RIYW5kbGluZyk7XG5cdH1cbn1cblxuY29uc3QgZHJhZnQgPSB7XG5cdGNyZWF0ZURyYWZ0RnJvbUFjdGl2ZURvY3VtZW50OiBjcmVhdGVEcmFmdEZyb21BY3RpdmVEb2N1bWVudCxcblx0YWN0aXZhdGVEb2N1bWVudDogYWN0aXZhdGVEb2N1bWVudCxcblx0ZGVsZXRlRHJhZnQ6IGRlbGV0ZURyYWZ0LFxuXHRleGVjdXRlRHJhZnRFZGl0QWN0aW9uOiBleGVjdXRlRHJhZnRFZGl0QWN0aW9uLFxuXHRleGVjdXRlRHJhZnRWYWxpZGF0aW9uOiBleGVjdXRlRHJhZnRWYWxpZGF0aW9uLFxuXHRleGVjdXRlRHJhZnRQcmVwYXJhdGlvbkFjdGlvbjogZXhlY3V0ZURyYWZ0UHJlcGFyYXRpb25BY3Rpb24sXG5cdGV4ZWN1dGVEcmFmdEFjdGl2YXRpb25BY3Rpb246IGV4ZWN1dGVEcmFmdEFjdGl2YXRpb25BY3Rpb24sXG5cdGhhc1ByZXBhcmVBY3Rpb246IGhhc1ByZXBhcmVBY3Rpb24sXG5cdGdldE1lc3NhZ2VzUGF0aDogZ2V0TWVzc2FnZXNQYXRoLFxuXHRjb21wdXRlU2libGluZ0luZm9ybWF0aW9uOiBjb21wdXRlU2libGluZ0luZm9ybWF0aW9uLFxuXHRwcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbjogZHJhZnREYXRhTG9zc1BvcHVwLnByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uLFxuXHRzaWxlbnRseUtlZXBEcmFmdE9uRm9yd2FyZE5hdmlnYXRpb246IGRyYWZ0RGF0YUxvc3NQb3B1cC5zaWxlbnRseUtlZXBEcmFmdE9uRm9yd2FyZE5hdmlnYXRpb24sXG5cdGNyZWF0ZU9wZXJhdGlvbjogY3JlYXRlT3BlcmF0aW9uLFxuXHRleGVjdXRlRHJhZnREaXNjYXJkQWN0aW9uOiBleGVjdXRlRHJhZnREaXNjYXJkQWN0aW9uLFxuXHROYXZpZ2F0aW9uVHlwZTogZHJhZnREYXRhTG9zc1BvcHVwLk5hdmlnYXRpb25UeXBlXG59O1xuXG5leHBvcnQgZGVmYXVsdCBkcmFmdDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQWtqQk8sZ0JBQWdCQSxJQUFJLEVBQUVDLE9BQU8sRUFBRTtJQUNyQyxJQUFJO01BQ0gsSUFBSUMsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU1HLENBQUMsRUFBRTtNQUNWLE9BQU9GLE9BQU8sQ0FBQ0UsQ0FBQyxDQUFDO0lBQ2xCO0lBQ0EsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLElBQUksRUFBRTtNQUMxQixPQUFPRixNQUFNLENBQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRUgsT0FBTyxDQUFDO0lBQ3BDO0lBQ0EsT0FBT0MsTUFBTTtFQUNkO0VBd0dBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBbEJBLElBbUJlRyxnQkFBZ0IsYUFDOUJDLFFBQW1CLEVBQ25CQyxhQUEyQixFQUMzQkMsV0FBOEUsRUFDOUVDLGNBQStCO0lBQUEsSUFDOUI7TUFBQSxpQkFNS0MsUUFBUTtRQUFBO1FBQUE7VUFBQSwyQkFtQ1BDLE1BQU0sQ0FBQ0MsdUJBQXVCLEdBQUdELE1BQU0sQ0FBQ0MsdUJBQXVCLENBQUNOLFFBQVEsRUFBRU8sc0JBQXNCLENBQUMsR0FBR0Esc0JBQXNCO1FBQUE7UUFsQ2pJLElBQUksQ0FBQ0gsUUFBUSxFQUFFO1VBQ2QsTUFBTSxJQUFJSSxLQUFLLDZFQUFzRVIsUUFBUSxDQUFDUyxPQUFPLEVBQUUsRUFBRztRQUMzRztRQUVBLElBQUlGLHNCQUEyQjtRQUFDO1VBQUEsSUFDNUIsQ0FBQ0csZ0JBQWdCLENBQUNWLFFBQVEsQ0FBQztZ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