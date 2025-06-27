/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/controls/DataLossOrDraftDiscard/DataLossOrDraftDiscardHandler", "sap/fe/core/helpers/EditState", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/base/Log"], function (DataLossOrDraftDiscardHandler, EditState, ActivitySync, Log) {
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
   * The general handler in which the individual steps are called.
   * 
   * @param fnProcessFunction
   * @param fnCancelFunction
   * @param oContext
   * @param oController
   * @param bSkipBindingToView
   * @param navigationType
   */
  var processDataLossOrDraftDiscardConfirmation = function (fnProcessFunction, fnCancelFunction, oContext, oController, bSkipBindingToView, navigationType) {
    try {
      if (navigationType === undefined) navigationType = NavigationType.BackNavigation;
      var oModel = oContext.getModel();
      var draftDataContext = oModel.bindContext("".concat(oContext.getPath(), "/DraftAdministrativeData")).getBoundContext();
      var _temp17 = function () {
        if (oContext && oContext.getObject() && (!oContext.getObject().DraftAdministrativeData || oContext.getObject().IsActiveEntity === true)) {
          fnProcessFunction();
        } else {
          var _temp18 = _catch(function () {
            return Promise.resolve(draftDataContext.requestObject()).then(function (draftAdminData) {
              return Promise.resolve(processDraftAdminData(draftAdminData, fnProcessFunction, fnCancelFunction, oContext, oController, bSkipBindingToView, navigationType)).then(function () {});
            });
          }, function (oError) {
            Log.error("Cannot retrieve draftDataContext information", oError);
          });
          if (_temp18 && _temp18.then) return _temp18.then(function () {});
        }
      }();
      return Promise.resolve(_temp17 && _temp17.then ? _temp17.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Logic to process the admin data.
   * 
   * @param draftAdminData Admin data
   * @param fnProcessFunction The functon to process the handler
   * @param fnCancelFunction The cancel function
   * @param oContext The context of the current call
   * @param oController The current controller referenced
   * @param bSkipBindingToView The optional parameter to skip the binding to the view
   * @param navigationType The navigation type for which the function should be called
   */
  var processDraftAdminData = function (draftAdminData, fnProcessFunction, fnCancelFunction, oContext, oController, bSkipBindingToView, navigationType) {
    try {
      if (navigationType === undefined) navigationType = NavigationType.BackNavigation;
      var collaborationConnected = ActivitySync.isConnected(oController.getView());
      var processFunctionForDrafts = !collaborationConnected ? fnProcessFunction : function () {
        ActivitySync.disconnect(oController.getView());
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        fnProcessFunction.apply.apply(fnProcessFunction, [null].concat(args));
      };
      var bSilentlyKeepDraftOnForwardNavigation = silentlyKeepDraftOnForwardNavigation(oController);
      var _temp13 = function () {
        if (draftAdminData) {
          var _temp14 = function () {
            if (oController.getAppComponent().getRootViewController().isFclEnabled()) {
              return Promise.resolve(processFclMode(draftAdminData, fnCancelFunction, oController, processFunctionForDrafts, bSkipBindingToView)).then(function () {});
            } else if (!oContext.getObject().HasActiveEntity) {
              processNoActiveEntityMode(draftAdminData, fnCancelFunction, oController, processFunctionForDrafts, navigationType, bSilentlyKeepDraftOnForwardNavigation, bSkipBindingToView);
            } else if (draftAdminData.CreationDateTime === draftAdminData.LastChangeDateTime) {
              processEditingDraftForExistingEntity(oController, oContext, processFunctionForDrafts, navigationType);
            } else if (EditState.isEditStateDirty()) {
              processEditStateDirty(oController, fnCancelFunction, processFunctionForDrafts, navigationType, bSilentlyKeepDraftOnForwardNavigation, bSkipBindingToView);
            } else {
              // The user started editing the existing draft but did not make any changes
              // in the current editing session, so in this case we do not want
              // to show the dataloss dialog but just keep the draft
              processFunctionForDrafts();
            }
          }();
          if (_temp14 && _temp14.then) return _temp14.then(function () {});
        } else {
          fnProcessFunction();
        }
      }();
      return Promise.resolve(_temp13 && _temp13.then ? _temp13.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Logic to process the edit state dirty.
   * 
   * @param oController The current controller referenced.
   * @param fnCancelFunction The cancel function
   * @param processFunctionForDrafts The functon to process the handler
   * @param navigationType The navigation type for which the function should be called 
   * @param bSilentlyKeepDraftOnForwardNavigation The parameter to determine whether to skip the popup appearance in forward case
   * @param bSkipBindingToView The optional parameter to skip the binding to the view.
   */
  var processEditStateDirty = function (oController, fnCancelFunction, processFunctionForDrafts, navigationType, bSilentlyKeepDraftOnForwardNavigation, bSkipBindingToView) {
    try {
      if (navigationType === NavigationType.ForwardNavigation && bSilentlyKeepDraftOnForwardNavigation) {
        // In case we have a "forward navigation" and an additional parameter set in the manifest
        // we "silently" keep the draft
        processFunctionForDrafts();
      } else {
        // The CreationDateTime and LastChangeDateTime are NOT equal, so we are currently editing
        // an existing draft and need to distinguish depending on if any changes
        // have been made in the current editing session or not
        // Changes have been made in the current editing session so we want
        // to show the dataloss dialog and let the user decide
        DataLossOrDraftDiscardHandler.performAfterDiscardorKeepDraft(processFunctionForDrafts, fnCancelFunction, oController, bSkipBindingToView);
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Logic to process the draft editing for existing entity.
   * 
   * @param oController The current controller referenced.
   * @param oContext The context of the current call 
   * @param processFunctionForDrafts The functon to process the handler
   * @param navigationType The navigation type for which the function should be called 
   */
  var processEditingDraftForExistingEntity = function (oController, oContext, processFunctionForDrafts, navigationType) {
    try {
      var _temp9 = function () {
        if (navigationType === NavigationType.BackNavigation) {
          var mParameters = {
            skipDiscardPopover: true
          };
          var _temp10 = _catch(function () {
            return Promise.resolve(oController.editFlow.cancelDocument(oContext, mParameters)).then(function () {
              processFunctionForDrafts();
            });
          }, function (error) {
            Log.error("Error while canceling the document", error);
          });
          if (_temp10 && _temp10.then) return _temp10.then(function () {});
        } else {
          // In case of a forward navigation we silently keep the draft and only
          // execute the followup function.
          processFunctionForDrafts();
        }
      }();
      // We are editing a draft for an existing active entity
      // The CreationDateTime and LastChangeDateTime are equal, so this draft was
      // never saved before, hence we're currently editing a newly created draft for
      // an existing active entity for the first time.
      // Also there have so far been no changes made to the draft and in this
      // case we want to silently navigate and delete the draftin case of a back
      // navigation but in case of a forward navigation we want to silently keep it!
      return Promise.resolve(_temp9 && _temp9.then ? _temp9.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Logic to process the mode with no active entity.
   * 
   * @param draftAdminData Admin data
   * @param fnCancelFunction The cancel function
   * @param oController The current controller referenced
   * @param processFunctionForDrafts The functon to process the handler
   * @param navigationType The navigation type for which the function should be called
   * @param bSilentlyKeepDraftOnForwardNavigation The parameter to determine whether to skip the popup appearance in forward case
   * @param bSkipBindingToView The optional parameter to skip the binding to the view
   */
  var processNoActiveEntityMode = function (draftAdminData, fnCancelFunction, oController, processFunctionForDrafts, navigationType, bSilentlyKeepDraftOnForwardNavigation, bSkipBindingToView) {
    try {
      var _temp4 = function () {
        if (EditState.isEditStateDirty()) {
          var _temp5 = function () {
            if (draftAdminData.CreationDateTime === draftAdminData.LastChangeDateTime && navigationType === NavigationType.BackNavigation) {
              var _temp6 = _catch(function () {
                return Promise.resolve(DataLossOrDraftDiscardHandler.discardDraft(oController, bSkipBindingToView)).then(function () {
                  processFunctionForDrafts();
                });
              }, function (error) {
                Log.error("Error while canceling the document", error);
              });
              if (_temp6 && _temp6.then) return _temp6.then(function () {});
            } else if (navigationType === NavigationType.ForwardNavigation && bSilentlyKeepDraftOnForwardNavigation) {
              // In case we have a "forward navigation" and an additional parameter set in the manifest
              // we "silently" keep the draft
              processFunctionForDrafts();
            } else {
              // In this case data is being changed or a forward navigation is triggered
              // and we always want to show the dataloss dialog on navigation
              DataLossOrDraftDiscardHandler.performAfterDiscardorKeepDraft(processFunctionForDrafts, fnCancelFunction, oController, bSkipBindingToView);
            }
          }();
          if (_temp5 && _temp5.then) return _temp5.then(function () {});
        } else {
          // We are editing a draft which has been created earlier but never saved to active
          // version and since the edit state is not dirty, there have been no user changes
          // so in this case we want to silently navigate and do nothing
          processFunctionForDrafts();
        }
      }();
      // There is no active entity so we are editing either newly created data or
      // a draft which has never been saved to active version
      // Since we want to react differently in the two situations, we have to check the
      // dirty state
      return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {}) : void 0);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Logic to process the fcl mode.
   * 
   * @param draftAdminData Admin data
   * @param fnCancelFunction The cancel function
   * @param oController The current controller referenced
   * @param processFunctionForDrafts The functon to process the handler
   * @param bSkipBindingToView The optional parameter to skip the binding to the view
   */
  var processFclMode = function (draftAdminData, fnCancelFunction, oController, processFunctionForDrafts, bSkipBindingToView) {
    try {
      // The application is running in FCL mode so in this case we fall back to
      // the old logic since the dirty state handling is not properly working
      // for FCL.
      if (draftAdminData.CreationDateTime !== draftAdminData.LastChangeDateTime) {
        DataLossOrDraftDiscardHandler.performAfterDiscardorKeepDraft(processFunctionForDrafts, fnCancelFunction, oController, bSkipBindingToView);
      } else {
        processFunctionForDrafts();
      }
      return Promise.resolve();
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /* Enum for navigation types */
  var NavigationType;
  /**
   * The method checks whether an optional parameter in the manifest is set to silently keep the draft in case a forward navigation is triggered.
   *
   * @param pageController The reference to the current PageController instance
   * @returns Boolean value with true or false to silently keep the draft
   */
  (function (NavigationType) {
    NavigationType["BackNavigation"] = "BackNavigation";
    NavigationType["ForwardNavigation"] = "ForwardNavigation";
  })(NavigationType || (NavigationType = {}));
  function silentlyKeepDraftOnForwardNavigation(pageController) {
    var _oManifest$sapFe, _oManifest$sapFe$app;
    var rbSilentlyKeep = false;
    var oManifest = pageController.getAppComponent().getManifest();
    rbSilentlyKeep = (oManifest === null || oManifest === void 0 ? void 0 : (_oManifest$sapFe = oManifest["sap.fe"]) === null || _oManifest$sapFe === void 0 ? void 0 : (_oManifest$sapFe$app = _oManifest$sapFe.app) === null || _oManifest$sapFe$app === void 0 ? void 0 : _oManifest$sapFe$app.silentlyKeepDraftOnForwardNavigation) || false;
    return rbSilentlyKeep;
  }
  var draftDataLossPopup = {
    processDataLossOrDraftDiscardConfirmation: processDataLossOrDraftDiscardConfirmation,
    silentlyKeepDraftOnForwardNavigation: silentlyKeepDraftOnForwardNavigation,
    NavigationType: NavigationType,
    processFclMode: processFclMode,
    processNoActiveEntityMode: processNoActiveEntityMode,
    processEditingDraftForExistingEntity: processEditingDraftForExistingEntity,
    processEditStateDirty: processEditStateDirty
  };
  return draftDataLossPopup;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwicHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb24iLCJmblByb2Nlc3NGdW5jdGlvbiIsImZuQ2FuY2VsRnVuY3Rpb24iLCJvQ29udGV4dCIsIm9Db250cm9sbGVyIiwiYlNraXBCaW5kaW5nVG9WaWV3IiwibmF2aWdhdGlvblR5cGUiLCJOYXZpZ2F0aW9uVHlwZSIsIkJhY2tOYXZpZ2F0aW9uIiwib01vZGVsIiwiZ2V0TW9kZWwiLCJkcmFmdERhdGFDb250ZXh0IiwiYmluZENvbnRleHQiLCJnZXRQYXRoIiwiZ2V0Qm91bmRDb250ZXh0IiwiZ2V0T2JqZWN0IiwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEiLCJJc0FjdGl2ZUVudGl0eSIsInJlcXVlc3RPYmplY3QiLCJkcmFmdEFkbWluRGF0YSIsInByb2Nlc3NEcmFmdEFkbWluRGF0YSIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwiY29sbGFib3JhdGlvbkNvbm5lY3RlZCIsIkFjdGl2aXR5U3luYyIsImlzQ29ubmVjdGVkIiwiZ2V0VmlldyIsInByb2Nlc3NGdW5jdGlvbkZvckRyYWZ0cyIsImRpc2Nvbm5lY3QiLCJhcmdzIiwiYXBwbHkiLCJiU2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uIiwic2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uIiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0Um9vdFZpZXdDb250cm9sbGVyIiwiaXNGY2xFbmFibGVkIiwicHJvY2Vzc0ZjbE1vZGUiLCJIYXNBY3RpdmVFbnRpdHkiLCJwcm9jZXNzTm9BY3RpdmVFbnRpdHlNb2RlIiwiQ3JlYXRpb25EYXRlVGltZSIsIkxhc3RDaGFuZ2VEYXRlVGltZSIsInByb2Nlc3NFZGl0aW5nRHJhZnRGb3JFeGlzdGluZ0VudGl0eSIsIkVkaXRTdGF0ZSIsImlzRWRpdFN0YXRlRGlydHkiLCJwcm9jZXNzRWRpdFN0YXRlRGlydHkiLCJGb3J3YXJkTmF2aWdhdGlvbiIsIkRhdGFMb3NzT3JEcmFmdERpc2NhcmRIYW5kbGVyIiwicGVyZm9ybUFmdGVyRGlzY2FyZG9yS2VlcERyYWZ0IiwibVBhcmFtZXRlcnMiLCJza2lwRGlzY2FyZFBvcG92ZXIiLCJlZGl0RmxvdyIsImNhbmNlbERvY3VtZW50IiwiZGlzY2FyZERyYWZ0IiwicGFnZUNvbnRyb2xsZXIiLCJyYlNpbGVudGx5S2VlcCIsIm9NYW5pZmVzdCIsImdldE1hbmlmZXN0IiwiYXBwIiwiZHJhZnREYXRhTG9zc1BvcHVwIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJkcmFmdERhdGFMb3NzUG9wdXAudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERhdGFMb3NzT3JEcmFmdERpc2NhcmRIYW5kbGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9scy9EYXRhTG9zc09yRHJhZnREaXNjYXJkL0RhdGFMb3NzT3JEcmFmdERpc2NhcmRIYW5kbGVyXCI7XHJcbmltcG9ydCBFZGl0U3RhdGUgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRWRpdFN0YXRlXCI7XHJcbmltcG9ydCBBY3Rpdml0eVN5bmMgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQWN0aXZpdHlTeW5jXCI7XHJcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xyXG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwiLi4vLi4vUGFnZUNvbnRyb2xsZXJcIjtcclxuXHJcbi8qIEVudW0gZm9yIG5hdmlnYXRpb24gdHlwZXMgKi9cclxuZW51bSBOYXZpZ2F0aW9uVHlwZSB7XHJcbiAgICBCYWNrTmF2aWdhdGlvbiA9IFwiQmFja05hdmlnYXRpb25cIixcclxuICAgIEZvcndhcmROYXZpZ2F0aW9uID0gXCJGb3J3YXJkTmF2aWdhdGlvblwiXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBUaGUgbWV0aG9kIGNoZWNrcyB3aGV0aGVyIGFuIG9wdGlvbmFsIHBhcmFtZXRlciBpbiB0aGUgbWFuaWZlc3QgaXMgc2V0IHRvIHNpbGVudGx5IGtlZXAgdGhlIGRyYWZ0IGluIGNhc2UgYSBmb3J3YXJkIG5hdmlnYXRpb24gaXMgdHJpZ2dlcmVkLlxyXG4gKlxyXG4gKiBAcGFyYW0gcGFnZUNvbnRyb2xsZXIgVGhlIHJlZmVyZW5jZSB0byB0aGUgY3VycmVudCBQYWdlQ29udHJvbGxlciBpbnN0YW5jZVxyXG4gKiBAcmV0dXJucyBCb29sZWFuIHZhbHVlIHdpdGggdHJ1ZSBvciBmYWxzZSB0byBzaWxlbnRseSBrZWVwIHRoZSBkcmFmdFxyXG4gKi9cclxuZnVuY3Rpb24gc2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uKHBhZ2VDb250cm9sbGVyOiBQYWdlQ29udHJvbGxlcikge1xyXG4gICAgbGV0IHJiU2lsZW50bHlLZWVwID0gZmFsc2U7XHJcbiAgICBjb25zdCBvTWFuaWZlc3QgPSBwYWdlQ29udHJvbGxlci5nZXRBcHBDb21wb25lbnQoKS5nZXRNYW5pZmVzdCgpIGFzIGFueTtcclxuICAgIHJiU2lsZW50bHlLZWVwID0gb01hbmlmZXN0Py5bXCJzYXAuZmVcIl0/LmFwcD8uc2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uIHx8IGZhbHNlO1xyXG4gICAgcmV0dXJuIHJiU2lsZW50bHlLZWVwO1xyXG59XHJcblxyXG4vKipcclxuICogTG9naWMgdG8gcHJvY2VzcyB0aGUgZmNsIG1vZGUuXHJcbiAqIFxyXG4gKiBAcGFyYW0gZHJhZnRBZG1pbkRhdGEgQWRtaW4gZGF0YVxyXG4gKiBAcGFyYW0gZm5DYW5jZWxGdW5jdGlvbiBUaGUgY2FuY2VsIGZ1bmN0aW9uXHJcbiAqIEBwYXJhbSBvQ29udHJvbGxlciBUaGUgY3VycmVudCBjb250cm9sbGVyIHJlZmVyZW5jZWRcclxuICogQHBhcmFtIHByb2Nlc3NGdW5jdGlvbkZvckRyYWZ0cyBUaGUgZnVuY3RvbiB0byBwcm9jZXNzIHRoZSBoYW5kbGVyXHJcbiAqIEBwYXJhbSBiU2tpcEJpbmRpbmdUb1ZpZXcgVGhlIG9wdGlvbmFsIHBhcmFtZXRlciB0byBza2lwIHRoZSBiaW5kaW5nIHRvIHRoZSB2aWV3XHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzRmNsTW9kZShcclxuICAgIGRyYWZ0QWRtaW5EYXRhOiBhbnksXHJcbiAgICBmbkNhbmNlbEZ1bmN0aW9uOiBhbnksXHJcbiAgICBvQ29udHJvbGxlcjogYW55LFxyXG4gICAgcHJvY2Vzc0Z1bmN0aW9uRm9yRHJhZnRzOiBhbnksXHJcbiAgICBiU2tpcEJpbmRpbmdUb1ZpZXc/OiBib29sZWFuLFxyXG4pIHtcclxuICAgIC8vIFRoZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIEZDTCBtb2RlIHNvIGluIHRoaXMgY2FzZSB3ZSBmYWxsIGJhY2sgdG9cclxuICAgIC8vIHRoZSBvbGQgbG9naWMgc2luY2UgdGhlIGRpcnR5IHN0YXRlIGhhbmRsaW5nIGlzIG5vdCBwcm9wZXJseSB3b3JraW5nXHJcbiAgICAvLyBmb3IgRkNMLlxyXG4gICAgaWYgKGRyYWZ0QWRtaW5EYXRhLkNyZWF0aW9uRGF0ZVRpbWUgIT09IGRyYWZ0QWRtaW5EYXRhLkxhc3RDaGFuZ2VEYXRlVGltZSkge1xyXG4gICAgICAgIERhdGFMb3NzT3JEcmFmdERpc2NhcmRIYW5kbGVyLnBlcmZvcm1BZnRlckRpc2NhcmRvcktlZXBEcmFmdChcclxuICAgICAgICAgICAgcHJvY2Vzc0Z1bmN0aW9uRm9yRHJhZnRzLFxyXG4gICAgICAgICAgICBmbkNhbmNlbEZ1bmN0aW9uLFxyXG4gICAgICAgICAgICBvQ29udHJvbGxlcixcclxuICAgICAgICAgICAgYlNraXBCaW5kaW5nVG9WaWV3XHJcbiAgICAgICAgKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcHJvY2Vzc0Z1bmN0aW9uRm9yRHJhZnRzKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBMb2dpYyB0byBwcm9jZXNzIHRoZSBtb2RlIHdpdGggbm8gYWN0aXZlIGVudGl0eS5cclxuICogXHJcbiAqIEBwYXJhbSBkcmFmdEFkbWluRGF0YSBBZG1pbiBkYXRhXHJcbiAqIEBwYXJhbSBmbkNhbmNlbEZ1bmN0aW9uIFRoZSBjYW5jZWwgZnVuY3Rpb25cclxuICogQHBhcmFtIG9Db250cm9sbGVyIFRoZSBjdXJyZW50IGNvbnRyb2xsZXIgcmVmZXJlbmNlZFxyXG4gKiBAcGFyYW0gcHJvY2Vzc0Z1bmN0aW9uRm9yRHJhZnRzIFRoZSBmdW5jdG9uIHRvIHByb2Nlc3MgdGhlIGhhbmRsZXJcclxuICogQHBhcmFtIG5hdmlnYXRpb25UeXBlIFRoZSBuYXZpZ2F0aW9uIHR5cGUgZm9yIHdoaWNoIHRoZSBmdW5jdGlvbiBzaG91bGQgYmUgY2FsbGVkXHJcbiAqIEBwYXJhbSBiU2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uIFRoZSBwYXJhbWV0ZXIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdG8gc2tpcCB0aGUgcG9wdXAgYXBwZWFyYW5jZSBpbiBmb3J3YXJkIGNhc2VcclxuICogQHBhcmFtIGJTa2lwQmluZGluZ1RvVmlldyBUaGUgb3B0aW9uYWwgcGFyYW1ldGVyIHRvIHNraXAgdGhlIGJpbmRpbmcgdG8gdGhlIHZpZXdcclxuICovXHJcbmFzeW5jIGZ1bmN0aW9uIHByb2Nlc3NOb0FjdGl2ZUVudGl0eU1vZGUoXHJcbiAgICBkcmFmdEFkbWluRGF0YTogYW55LFxyXG4gICAgZm5DYW5jZWxGdW5jdGlvbjogYW55LFxyXG4gICAgb0NvbnRyb2xsZXI6IGFueSxcclxuICAgIHByb2Nlc3NGdW5jdGlvbkZvckRyYWZ0czogYW55LFxyXG4gICAgbmF2aWdhdGlvblR5cGU6IE5hdmlnYXRpb25UeXBlLFxyXG4gICAgYlNpbGVudGx5S2VlcERyYWZ0T25Gb3J3YXJkTmF2aWdhdGlvbjogYm9vbGVhbixcclxuICAgIGJTa2lwQmluZGluZ1RvVmlldz86IGJvb2xlYW4pIHtcclxuICAgIC8vIFRoZXJlIGlzIG5vIGFjdGl2ZSBlbnRpdHkgc28gd2UgYXJlIGVkaXRpbmcgZWl0aGVyIG5ld2x5IGNyZWF0ZWQgZGF0YSBvclxyXG4gICAgLy8gYSBkcmFmdCB3aGljaCBoYXMgbmV2ZXIgYmVlbiBzYXZlZCB0byBhY3RpdmUgdmVyc2lvblxyXG4gICAgLy8gU2luY2Ugd2Ugd2FudCB0byByZWFjdCBkaWZmZXJlbnRseSBpbiB0aGUgdHdvIHNpdHVhdGlvbnMsIHdlIGhhdmUgdG8gY2hlY2sgdGhlXHJcbiAgICAvLyBkaXJ0eSBzdGF0ZVxyXG4gICAgaWYgKEVkaXRTdGF0ZS5pc0VkaXRTdGF0ZURpcnR5KCkpIHtcclxuICAgICAgICBpZiAoXHJcbiAgICAgICAgICAgIGRyYWZ0QWRtaW5EYXRhLkNyZWF0aW9uRGF0ZVRpbWUgPT09IGRyYWZ0QWRtaW5EYXRhLkxhc3RDaGFuZ2VEYXRlVGltZSAmJlxyXG4gICAgICAgICAgICBuYXZpZ2F0aW9uVHlwZSA9PT0gTmF2aWdhdGlvblR5cGUuQmFja05hdmlnYXRpb25cclxuICAgICAgICApIHtcclxuICAgICAgICAgICAgLy8gaW4gY2FzZSB3ZSBoYXZlIHVudG91Y2hlZCBjaGFuZ2VzIGZvciB0aGUgZHJhZnQgYW5kIGEgXCJiYWNrXCJcclxuICAgICAgICAgICAgLy8gbmF2aWdhdGlvbiB3ZSBjYW4gc2lsZW50bHkgZGlzY2FyZCB0aGUgZHJhZnQgYWdhaW5cclxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIHByb21pc2Uvbm8tbmVzdGluZ1xyXG4gICAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAgICAgYXdhaXQgRGF0YUxvc3NPckRyYWZ0RGlzY2FyZEhhbmRsZXIuZGlzY2FyZERyYWZ0KG9Db250cm9sbGVyLCBiU2tpcEJpbmRpbmdUb1ZpZXcpO1xyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0Z1bmN0aW9uRm9yRHJhZnRzKCk7XHJcbiAgICAgICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgICAgICAgIExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGNhbmNlbGluZyB0aGUgZG9jdW1lbnRcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChuYXZpZ2F0aW9uVHlwZSA9PT0gTmF2aWdhdGlvblR5cGUuRm9yd2FyZE5hdmlnYXRpb24gJiYgYlNpbGVudGx5S2VlcERyYWZ0T25Gb3J3YXJkTmF2aWdhdGlvbikge1xyXG4gICAgICAgICAgICAvLyBJbiBjYXNlIHdlIGhhdmUgYSBcImZvcndhcmQgbmF2aWdhdGlvblwiIGFuZCBhbiBhZGRpdGlvbmFsIHBhcmFtZXRlciBzZXQgaW4gdGhlIG1hbmlmZXN0XHJcbiAgICAgICAgICAgIC8vIHdlIFwic2lsZW50bHlcIiBrZWVwIHRoZSBkcmFmdFxyXG4gICAgICAgICAgICBwcm9jZXNzRnVuY3Rpb25Gb3JEcmFmdHMoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBJbiB0aGlzIGNhc2UgZGF0YSBpcyBiZWluZyBjaGFuZ2VkIG9yIGEgZm9yd2FyZCBuYXZpZ2F0aW9uIGlzIHRyaWdnZXJlZFxyXG4gICAgICAgICAgICAvLyBhbmQgd2UgYWx3YXlzIHdhbnQgdG8gc2hvdyB0aGUgZGF0YWxvc3MgZGlhbG9nIG9uIG5hdmlnYXRpb25cclxuICAgICAgICAgICAgRGF0YUxvc3NPckRyYWZ0RGlzY2FyZEhhbmRsZXIucGVyZm9ybUFmdGVyRGlzY2FyZG9yS2VlcERyYWZ0KFxyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0Z1bmN0aW9uRm9yRHJhZnRzLFxyXG4gICAgICAgICAgICAgICAgZm5DYW5jZWxGdW5jdGlvbixcclxuICAgICAgICAgICAgICAgIG9Db250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgYlNraXBCaW5kaW5nVG9WaWV3XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBXZSBhcmUgZWRpdGluZyBhIGRyYWZ0IHdoaWNoIGhhcyBiZWVuIGNyZWF0ZWQgZWFybGllciBidXQgbmV2ZXIgc2F2ZWQgdG8gYWN0aXZlXHJcbiAgICAgICAgLy8gdmVyc2lvbiBhbmQgc2luY2UgdGhlIGVkaXQgc3RhdGUgaXMgbm90IGRpcnR5LCB0aGVyZSBoYXZlIGJlZW4gbm8gdXNlciBjaGFuZ2VzXHJcbiAgICAgICAgLy8gc28gaW4gdGhpcyBjYXNlIHdlIHdhbnQgdG8gc2lsZW50bHkgbmF2aWdhdGUgYW5kIGRvIG5vdGhpbmdcclxuICAgICAgICBwcm9jZXNzRnVuY3Rpb25Gb3JEcmFmdHMoKTtcclxuICAgIH1cclxufVxyXG4vKipcclxuICogTG9naWMgdG8gcHJvY2VzcyB0aGUgZHJhZnQgZWRpdGluZyBmb3IgZXhpc3RpbmcgZW50aXR5LlxyXG4gKiBcclxuICogQHBhcmFtIG9Db250cm9sbGVyIFRoZSBjdXJyZW50IGNvbnRyb2xsZXIgcmVmZXJlbmNlZC5cclxuICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBjdXJyZW50IGNhbGwgXHJcbiAqIEBwYXJhbSBwcm9jZXNzRnVuY3Rpb25Gb3JEcmFmdHMgVGhlIGZ1bmN0b24gdG8gcHJvY2VzcyB0aGUgaGFuZGxlclxyXG4gKiBAcGFyYW0gbmF2aWdhdGlvblR5cGUgVGhlIG5hdmlnYXRpb24gdHlwZSBmb3Igd2hpY2ggdGhlIGZ1bmN0aW9uIHNob3VsZCBiZSBjYWxsZWQgXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzRWRpdGluZ0RyYWZ0Rm9yRXhpc3RpbmdFbnRpdHkoXHJcbiAgICBvQ29udHJvbGxlcjogYW55LFxyXG4gICAgb0NvbnRleHQ6IGFueSxcclxuICAgIHByb2Nlc3NGdW5jdGlvbkZvckRyYWZ0czogYW55LFxyXG4gICAgbmF2aWdhdGlvblR5cGU6IE5hdmlnYXRpb25UeXBlLFxyXG4pIHtcclxuICAgIC8vIFdlIGFyZSBlZGl0aW5nIGEgZHJhZnQgZm9yIGFuIGV4aXN0aW5nIGFjdGl2ZSBlbnRpdHlcclxuICAgIC8vIFRoZSBDcmVhdGlvbkRhdGVUaW1lIGFuZCBMYXN0Q2hhbmdlRGF0ZVRpbWUgYXJlIGVxdWFsLCBzbyB0aGlzIGRyYWZ0IHdhc1xyXG4gICAgLy8gbmV2ZXIgc2F2ZWQgYmVmb3JlLCBoZW5jZSB3ZSdyZSBjdXJyZW50bHkgZWRpdGluZyBhIG5ld2x5IGNyZWF0ZWQgZHJhZnQgZm9yXHJcbiAgICAvLyBhbiBleGlzdGluZyBhY3RpdmUgZW50aXR5IGZvciB0aGUgZmlyc3QgdGltZS5cclxuICAgIC8vIEFsc28gdGhlcmUgaGF2ZSBzbyBmYXIgYmVlbiBubyBjaGFuZ2VzIG1hZGUgdG8gdGhlIGRyYWZ0IGFuZCBpbiB0aGlzXHJcbiAgICAvLyBjYXNlIHdlIHdhbnQgdG8gc2lsZW50bHkgbmF2aWdhdGUgYW5kIGRlbGV0ZSB0aGUgZHJhZnRpbiBjYXNlIG9mIGEgYmFja1xyXG4gICAgLy8gbmF2aWdhdGlvbiBidXQgaW4gY2FzZSBvZiBhIGZvcndhcmQgbmF2aWdhdGlvbiB3ZSB3YW50IHRvIHNpbGVudGx5IGtlZXAgaXQhXHJcbiAgICBpZiAobmF2aWdhdGlvblR5cGUgPT09IE5hdmlnYXRpb25UeXBlLkJhY2tOYXZpZ2F0aW9uKSB7XHJcbiAgICAgICAgY29uc3QgbVBhcmFtZXRlcnMgPSB7XHJcbiAgICAgICAgICAgIHNraXBEaXNjYXJkUG9wb3ZlcjogdHJ1ZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAgIGF3YWl0IG9Db250cm9sbGVyLmVkaXRGbG93LmNhbmNlbERvY3VtZW50KG9Db250ZXh0LCBtUGFyYW1ldGVycyk7XHJcbiAgICAgICAgICAgIHByb2Nlc3NGdW5jdGlvbkZvckRyYWZ0cygpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcclxuICAgICAgICAgICAgTG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgY2FuY2VsaW5nIHRoZSBkb2N1bWVudFwiLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBJbiBjYXNlIG9mIGEgZm9yd2FyZCBuYXZpZ2F0aW9uIHdlIHNpbGVudGx5IGtlZXAgdGhlIGRyYWZ0IGFuZCBvbmx5XHJcbiAgICAgICAgLy8gZXhlY3V0ZSB0aGUgZm9sbG93dXAgZnVuY3Rpb24uXHJcbiAgICAgICAgcHJvY2Vzc0Z1bmN0aW9uRm9yRHJhZnRzKCk7XHJcbiAgICB9XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBMb2dpYyB0byBwcm9jZXNzIHRoZSBlZGl0IHN0YXRlIGRpcnR5LlxyXG4gKiBcclxuICogQHBhcmFtIG9Db250cm9sbGVyIFRoZSBjdXJyZW50IGNvbnRyb2xsZXIgcmVmZXJlbmNlZC5cclxuICogQHBhcmFtIGZuQ2FuY2VsRnVuY3Rpb24gVGhlIGNhbmNlbCBmdW5jdGlvblxyXG4gKiBAcGFyYW0gcHJvY2Vzc0Z1bmN0aW9uRm9yRHJhZnRzIFRoZSBmdW5jdG9uIHRvIHByb2Nlc3MgdGhlIGhhbmRsZXJcclxuICogQHBhcmFtIG5hdmlnYXRpb25UeXBlIFRoZSBuYXZpZ2F0aW9uIHR5cGUgZm9yIHdoaWNoIHRoZSBmdW5jdGlvbiBzaG91bGQgYmUgY2FsbGVkIFxyXG4gKiBAcGFyYW0gYlNpbGVudGx5S2VlcERyYWZ0T25Gb3J3YXJkTmF2aWdhdGlvbiBUaGUgcGFyYW1ldGVyIHRvIGRldGVybWluZSB3aGV0aGVyIHRvIHNraXAgdGhlIHBvcHVwIGFwcGVhcmFuY2UgaW4gZm9yd2FyZCBjYXNlXHJcbiAqIEBwYXJhbSBiU2tpcEJpbmRpbmdUb1ZpZXcgVGhlIG9wdGlvbmFsIHBhcmFtZXRlciB0byBza2lwIHRoZSBiaW5kaW5nIHRvIHRoZSB2aWV3LlxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0VkaXRTdGF0ZURpcnR5KFxyXG4gICAgb0NvbnRyb2xsZXI6IGFueSxcclxuICAgIGZuQ2FuY2VsRnVuY3Rpb246IGFueSxcclxuICAgIHByb2Nlc3NGdW5jdGlvbkZvckRyYWZ0czogYW55LFxyXG4gICAgbmF2aWdhdGlvblR5cGU6IE5hdmlnYXRpb25UeXBlLFxyXG4gICAgYlNpbGVudGx5S2VlcERyYWZ0T25Gb3J3YXJkTmF2aWdhdGlvbjogYm9vbGVhbixcclxuICAgIGJTa2lwQmluZGluZ1RvVmlldz86IGJvb2xlYW4pIHtcclxuICAgIGlmIChuYXZpZ2F0aW9uVHlwZSA9PT0gTmF2aWdhdGlvblR5cGUuRm9yd2FyZE5hdmlnYXRpb24gJiYgYlNpbGVudGx5S2VlcERyYWZ0T25Gb3J3YXJkTmF2aWdhdGlvbikge1xyXG4gICAgICAgIC8vIEluIGNhc2Ugd2UgaGF2ZSBhIFwiZm9yd2FyZCBuYXZpZ2F0aW9uXCIgYW5kIGFuIGFkZGl0aW9uYWwgcGFyYW1ldGVyIHNldCBpbiB0aGUgbWFuaWZlc3RcclxuICAgICAgICAvLyB3ZSBcInNpbGVudGx5XCIga2VlcCB0aGUgZHJhZnRcclxuICAgICAgICBwcm9jZXNzRnVuY3Rpb25Gb3JEcmFmdHMoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gVGhlIENyZWF0aW9uRGF0ZVRpbWUgYW5kIExhc3RDaGFuZ2VEYXRlVGltZSBhcmUgTk9UIGVxdWFsLCBzbyB3ZSBhcmUgY3VycmVudGx5IGVkaXRpbmdcclxuICAgICAgICAvLyBhbiBleGlzdGluZyBkcmFmdCBhbmQgbmVlZCB0byBkaXN0aW5ndWlzaCBkZXBlbmRpbmcgb24gaWYgYW55IGNoYW5nZXNcclxuICAgICAgICAvLyBoYXZlIGJlZW4gbWFkZSBpbiB0aGUgY3VycmVudCBlZGl0aW5nIHNlc3Npb24gb3Igbm90XHJcbiAgICAgICAgLy8gQ2hhbmdlcyBoYXZlIGJlZW4gbWFkZSBpbiB0aGUgY3VycmVudCBlZGl0aW5nIHNlc3Npb24gc28gd2Ugd2FudFxyXG4gICAgICAgIC8vIHRvIHNob3cgdGhlIGRhdGFsb3NzIGRpYWxvZyBhbmQgbGV0IHRoZSB1c2VyIGRlY2lkZVxyXG4gICAgICAgIERhdGFMb3NzT3JEcmFmdERpc2NhcmRIYW5kbGVyLnBlcmZvcm1BZnRlckRpc2NhcmRvcktlZXBEcmFmdChcclxuICAgICAgICAgICAgcHJvY2Vzc0Z1bmN0aW9uRm9yRHJhZnRzLFxyXG4gICAgICAgICAgICBmbkNhbmNlbEZ1bmN0aW9uLFxyXG4gICAgICAgICAgICBvQ29udHJvbGxlcixcclxuICAgICAgICAgICAgYlNraXBCaW5kaW5nVG9WaWV3XHJcbiAgICAgICAgKTtcclxuICAgIH1cclxufVxyXG5cclxuXHJcbi8qKlxyXG4gKiBMb2dpYyB0byBwcm9jZXNzIHRoZSBhZG1pbiBkYXRhLlxyXG4gKiBcclxuICogQHBhcmFtIGRyYWZ0QWRtaW5EYXRhIEFkbWluIGRhdGFcclxuICogQHBhcmFtIGZuUHJvY2Vzc0Z1bmN0aW9uIFRoZSBmdW5jdG9uIHRvIHByb2Nlc3MgdGhlIGhhbmRsZXJcclxuICogQHBhcmFtIGZuQ2FuY2VsRnVuY3Rpb24gVGhlIGNhbmNlbCBmdW5jdGlvblxyXG4gKiBAcGFyYW0gb0NvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGN1cnJlbnQgY2FsbFxyXG4gKiBAcGFyYW0gb0NvbnRyb2xsZXIgVGhlIGN1cnJlbnQgY29udHJvbGxlciByZWZlcmVuY2VkXHJcbiAqIEBwYXJhbSBiU2tpcEJpbmRpbmdUb1ZpZXcgVGhlIG9wdGlvbmFsIHBhcmFtZXRlciB0byBza2lwIHRoZSBiaW5kaW5nIHRvIHRoZSB2aWV3XHJcbiAqIEBwYXJhbSBuYXZpZ2F0aW9uVHlwZSBUaGUgbmF2aWdhdGlvbiB0eXBlIGZvciB3aGljaCB0aGUgZnVuY3Rpb24gc2hvdWxkIGJlIGNhbGxlZFxyXG4gKi9cclxuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0RyYWZ0QWRtaW5EYXRhKGRyYWZ0QWRtaW5EYXRhOiBhbnksIGZuUHJvY2Vzc0Z1bmN0aW9uOiBhbnksXHJcbiAgICBmbkNhbmNlbEZ1bmN0aW9uOiBhbnksXHJcbiAgICBvQ29udGV4dDogYW55LFxyXG4gICAgb0NvbnRyb2xsZXI6IGFueSxcclxuICAgIGJTa2lwQmluZGluZ1RvVmlldz86IGJvb2xlYW4sXHJcbiAgICBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGUgPSBOYXZpZ2F0aW9uVHlwZS5CYWNrTmF2aWdhdGlvbikge1xyXG5cclxuICAgIGNvbnN0IGNvbGxhYm9yYXRpb25Db25uZWN0ZWQgPSBBY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQob0NvbnRyb2xsZXIuZ2V0VmlldygpKTtcclxuICAgIGNvbnN0IHByb2Nlc3NGdW5jdGlvbkZvckRyYWZ0cyA9ICFjb2xsYWJvcmF0aW9uQ29ubmVjdGVkXHJcbiAgICAgICAgPyBmblByb2Nlc3NGdW5jdGlvblxyXG4gICAgICAgIDogZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XHJcbiAgICAgICAgICAgIEFjdGl2aXR5U3luYy5kaXNjb25uZWN0KG9Db250cm9sbGVyLmdldFZpZXcoKSk7XHJcbiAgICAgICAgICAgIGZuUHJvY2Vzc0Z1bmN0aW9uLmFwcGx5KG51bGwsIC4uLmFyZ3MpO1xyXG4gICAgICAgIH07XHJcblxyXG4gICAgY29uc3QgYlNpbGVudGx5S2VlcERyYWZ0T25Gb3J3YXJkTmF2aWdhdGlvbiA9IHNpbGVudGx5S2VlcERyYWZ0T25Gb3J3YXJkTmF2aWdhdGlvbihvQ29udHJvbGxlcik7XHJcblxyXG4gICAgaWYgKGRyYWZ0QWRtaW5EYXRhKSB7XHJcbiAgICAgICAgaWYgKG9Db250cm9sbGVyLmdldEFwcENvbXBvbmVudCgpLmdldFJvb3RWaWV3Q29udHJvbGxlcigpLmlzRmNsRW5hYmxlZCgpKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHByb2Nlc3NGY2xNb2RlKFxyXG4gICAgICAgICAgICAgICAgZHJhZnRBZG1pbkRhdGEsXHJcbiAgICAgICAgICAgICAgICBmbkNhbmNlbEZ1bmN0aW9uLFxyXG4gICAgICAgICAgICAgICAgb0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzRnVuY3Rpb25Gb3JEcmFmdHMsXHJcbiAgICAgICAgICAgICAgICBiU2tpcEJpbmRpbmdUb1ZpZXdcclxuICAgICAgICAgICAgKVxyXG4gICAgICAgIH0gZWxzZSBpZiAoIW9Db250ZXh0LmdldE9iamVjdCgpLkhhc0FjdGl2ZUVudGl0eSkge1xyXG4gICAgICAgICAgICBwcm9jZXNzTm9BY3RpdmVFbnRpdHlNb2RlKFxyXG4gICAgICAgICAgICAgICAgZHJhZnRBZG1pbkRhdGEsXHJcbiAgICAgICAgICAgICAgICBmbkNhbmNlbEZ1bmN0aW9uLFxyXG4gICAgICAgICAgICAgICAgb0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICBwcm9jZXNzRnVuY3Rpb25Gb3JEcmFmdHMsXHJcbiAgICAgICAgICAgICAgICBuYXZpZ2F0aW9uVHlwZSxcclxuICAgICAgICAgICAgICAgIGJTaWxlbnRseUtlZXBEcmFmdE9uRm9yd2FyZE5hdmlnYXRpb24sXHJcbiAgICAgICAgICAgICAgICBiU2tpcEJpbmRpbmdUb1ZpZXdcclxuICAgICAgICAgICAgKTtcclxuICAgICAgICB9IGVsc2UgaWYgKGRyYWZ0QWRtaW5EYXRhLkNyZWF0aW9uRGF0ZVRpbWUgPT09IGRyYWZ0QWRtaW5EYXRhLkxhc3RDaGFuZ2VEYXRlVGltZSkge1xyXG4gICAgICAgICAgICBwcm9jZXNzRWRpdGluZ0RyYWZ0Rm9yRXhpc3RpbmdFbnRpdHkoXHJcbiAgICAgICAgICAgICAgICBvQ29udHJvbGxlcixcclxuICAgICAgICAgICAgICAgIG9Db250ZXh0LFxyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0Z1bmN0aW9uRm9yRHJhZnRzLFxyXG4gICAgICAgICAgICAgICAgbmF2aWdhdGlvblR5cGUsXHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9IGVsc2UgaWYgKEVkaXRTdGF0ZS5pc0VkaXRTdGF0ZURpcnR5KCkpIHtcclxuICAgICAgICAgICAgcHJvY2Vzc0VkaXRTdGF0ZURpcnR5KFxyXG4gICAgICAgICAgICAgICAgb0NvbnRyb2xsZXIsXHJcbiAgICAgICAgICAgICAgICBmbkNhbmNlbEZ1bmN0aW9uLFxyXG4gICAgICAgICAgICAgICAgcHJvY2Vzc0Z1bmN0aW9uRm9yRHJhZnRzLFxyXG4gICAgICAgICAgICAgICAgbmF2aWdhdGlvblR5cGUsXHJcbiAgICAgICAgICAgICAgICBiU2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uLFxyXG4gICAgICAgICAgICAgICAgYlNraXBCaW5kaW5nVG9WaWV3XHJcbiAgICAgICAgICAgIClcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAvLyBUaGUgdXNlciBzdGFydGVkIGVkaXRpbmcgdGhlIGV4aXN0aW5nIGRyYWZ0IGJ1dCBkaWQgbm90IG1ha2UgYW55IGNoYW5nZXNcclxuICAgICAgICAgICAgLy8gaW4gdGhlIGN1cnJlbnQgZWRpdGluZyBzZXNzaW9uLCBzbyBpbiB0aGlzIGNhc2Ugd2UgZG8gbm90IHdhbnRcclxuICAgICAgICAgICAgLy8gdG8gc2hvdyB0aGUgZGF0YWxvc3MgZGlhbG9nIGJ1dCBqdXN0IGtlZXAgdGhlIGRyYWZ0XHJcbiAgICAgICAgICAgIHByb2Nlc3NGdW5jdGlvbkZvckRyYWZ0cygpO1xyXG4gICAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICAgZm5Qcm9jZXNzRnVuY3Rpb24oKTtcclxuICAgIH1cclxufVxyXG5cclxuLyoqXHJcbiAqIFRoZSBnZW5lcmFsIGhhbmRsZXIgaW4gd2hpY2ggdGhlIGluZGl2aWR1YWwgc3RlcHMgYXJlIGNhbGxlZC5cclxuICogXHJcbiAqIEBwYXJhbSBmblByb2Nlc3NGdW5jdGlvblxyXG4gKiBAcGFyYW0gZm5DYW5jZWxGdW5jdGlvblxyXG4gKiBAcGFyYW0gb0NvbnRleHRcclxuICogQHBhcmFtIG9Db250cm9sbGVyXHJcbiAqIEBwYXJhbSBiU2tpcEJpbmRpbmdUb1ZpZXdcclxuICogQHBhcmFtIG5hdmlnYXRpb25UeXBlXHJcbiAqL1xyXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbihcclxuICAgIGZuUHJvY2Vzc0Z1bmN0aW9uOiBhbnksXHJcbiAgICBmbkNhbmNlbEZ1bmN0aW9uOiBhbnksXHJcbiAgICBvQ29udGV4dDogYW55LFxyXG4gICAgb0NvbnRyb2xsZXI6IGFueSxcclxuICAgIGJTa2lwQmluZGluZ1RvVmlldz86IGJvb2xlYW4sXHJcbiAgICBuYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGUgPSBOYXZpZ2F0aW9uVHlwZS5CYWNrTmF2aWdhdGlvblxyXG4pIHtcclxuICAgIGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCk7XHJcbiAgICBjb25zdCBkcmFmdERhdGFDb250ZXh0ID0gb01vZGVsLmJpbmRDb250ZXh0KGAke29Db250ZXh0LmdldFBhdGgoKX0vRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFgKS5nZXRCb3VuZENvbnRleHQoKTtcclxuXHJcbiAgICBpZiAoXHJcbiAgICAgICAgb0NvbnRleHQgJiZcclxuICAgICAgICBvQ29udGV4dC5nZXRPYmplY3QoKSAmJlxyXG4gICAgICAgICghb0NvbnRleHQuZ2V0T2JqZWN0KCkuRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEgfHwgb0NvbnRleHQuZ2V0T2JqZWN0KCkuSXNBY3RpdmVFbnRpdHkgPT09IHRydWUpXHJcbiAgICApIHtcclxuICAgICAgICBmblByb2Nlc3NGdW5jdGlvbigpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgICB0cnkge1xyXG5cclxuICAgICAgICAgICAgY29uc3QgZHJhZnRBZG1pbkRhdGEgPSBhd2FpdCBkcmFmdERhdGFDb250ZXh0LnJlcXVlc3RPYmplY3QoKVxyXG4gICAgICAgICAgICBhd2FpdCBwcm9jZXNzRHJhZnRBZG1pbkRhdGEoZHJhZnRBZG1pbkRhdGEsXHJcbiAgICAgICAgICAgICAgICBmblByb2Nlc3NGdW5jdGlvbixcclxuICAgICAgICAgICAgICAgIGZuQ2FuY2VsRnVuY3Rpb24sXHJcbiAgICAgICAgICAgICAgICBvQ29udGV4dCxcclxuICAgICAgICAgICAgICAgIG9Db250cm9sbGVyLFxyXG4gICAgICAgICAgICAgICAgYlNraXBCaW5kaW5nVG9WaWV3LFxyXG4gICAgICAgICAgICAgICAgbmF2aWdhdGlvblR5cGUpO1xyXG5cclxuICAgICAgICB9IGNhdGNoIChvRXJyb3I6IGFueSkge1xyXG4gICAgICAgICAgICBMb2cuZXJyb3IoXCJDYW5ub3QgcmV0cmlldmUgZHJhZnREYXRhQ29udGV4dCBpbmZvcm1hdGlvblwiLCBvRXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxufVxyXG5cclxuY29uc3QgZHJhZnREYXRhTG9zc1BvcHVwID0ge1xyXG4gICAgcHJvY2Vzc0RhdGFMb3NzT3JEcmFmdERpc2NhcmRDb25maXJtYXRpb246IHByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uLFxyXG4gICAgc2lsZW50bHlLZWVwRHJhZnRPbkZvcndhcmROYXZpZ2F0aW9uOiBzaWxlbnRseUtlZXBEcmFmdE9uRm9yd2FyZE5hdmlnYXRpb24sXHJcbiAgICBOYXZpZ2F0aW9uVHlwZTogTmF2aWdhdGlvblR5cGUsXHJcbiAgICBwcm9jZXNzRmNsTW9kZTogcHJvY2Vzc0ZjbE1vZGUsXHJcbiAgICBwcm9jZXNzTm9BY3RpdmVFbnRpdHlNb2RlOiBwcm9jZXNzTm9BY3RpdmVFbnRpdHlNb2RlLFxyXG4gICAgcHJvY2Vzc0VkaXRpbmdEcmFmdEZvckV4aXN0aW5nRW50aXR5OiBwcm9jZXNzRWRpdGluZ0RyYWZ0Rm9yRXhpc3RpbmdFbnRpdHksXHJcbiAgICBwcm9jZXNzRWRpdFN0YXRlRGlydHk6IHByb2Nlc3NFZGl0U3RhdGVEaXJ0eVxyXG59XHJcblxyXG5leHBvcnQgZGVmYXVsdCBkcmFmdERhdGFMb3NzUG9wdXA7Il0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBa2pCTyxnQkFBZ0JBLElBQUksRUFBRUMsT0FBTyxFQUFFO0lBQ3JDLElBQUk7TUFDSCxJQUFJQyxNQUFNLEdBQUdGLElBQUksRUFBRTtJQUNwQixDQUFDLENBQUMsT0FBTUcsQ0FBQyxFQUFFO01BQ1YsT0FBT0YsT0FBTyxDQUFDRSxDQUFDLENBQUM7SUFDbEI7SUFDQSxJQUFJRCxNQUFNLElBQUlBLE1BQU0sQ0FBQ0UsSUFBSSxFQUFFO01BQzFCLE9BQU9GLE1BQU0sQ0FBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFSCxPQUFPLENBQUM7SUFDcEM7SUFDQSxPQUFPQyxNQUFNO0VBQ2Q7RUFwVEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFUQSxJQVVlRyx5Q0FBeUMsYUFDcERDLGlCQUFzQixFQUN0QkMsZ0JBQXFCLEVBQ3JCQyxRQUFhLEVBQ2JDLFdBQWdCLEVBQ2hCQyxrQkFBNEIsRUFDNUJDLGNBQThCO0lBQUEsSUFDaEM7TUFBQSxJQURFQSxjQUE4QixnQkFBOUJBLGNBQThCLEdBQUdDLGNBQWMsQ0FBQ0MsY0FBYztNQUU5RCxJQUFNQyxNQUFNLEdBQUdOLFFBQVEsQ0FBQ08sUUFBUSxFQUFFO01BQ2xDLElBQU1DLGdCQUFnQixHQUFHRixNQUFNLENBQUNHLFdBQVcsV0FBSVQsUUFBUSxDQUFDVSxPQUFPLEVBQUUsOEJBQTJCLENBQUNDLGVBQWUsRUFBRTtNQUFDO1FBQUEsSUFHM0dYLFFBQVEsSUFDUkEsUUFBUSxDQUFDWSxTQUFTLEVBQUUsS0FDbkIsQ0FBQ1osUUFBUSxDQUFDWSxTQUFTLEVBQUUsQ0FBQ0MsdUJBQXVCLElBQUliLFFBQVEsQ0FBQ1ksU0FBUyxFQUFFLENBQUNFLGNBQWMsS0FBSyxJQUFJLENBQUM7VUFFL0ZoQixpQkFBaUIsRUFBRTtRQUFDO1VBQUEsaUNBRWhCO1lBQUEsdUJBRTZCVSxnQkFBZ0IsQ0FBQ08sYUFBYSxFQUFFLGlCQUF2REMsY0FBYztjQUFBLHVCQUNkQyxxQkFBcUIsQ0FBQ0QsY0FBYyxFQUN0Q2xCLGlCQUFpQixFQUNqQkMsZ0JBQWdCLEVBQ2hCQyxRQUFRLEVBQ1JDLFdBQVcsRUFDWEMsa0JBQWtCLEVBQ2xCQyxjQUFjLENBQUM7WUFBQTtVQUV2QixDQUFDLFlBQVFlLE1BQVcsRUFBRTtZQUNsQkMsR0FBRyxDQUFDQyxLQUFLLENBQUMsOENBQThDLEVBQUVGLE1BQU0sQ0FBQztVQUNyRSxDQUFDO1VBQUE7UUFBQTtNQUFBO01BQUE7SUFFVCxDQUFDO01BQUE7SUFBQTtFQUFBO0VBckhEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFWQSxJQVdlRCxxQkFBcUIsYUFBQ0QsY0FBbUIsRUFBRWxCLGlCQUFzQixFQUM1RUMsZ0JBQXFCLEVBQ3JCQyxRQUFhLEVBQ2JDLFdBQWdCLEVBQ2hCQyxrQkFBNEIsRUFDNUJDLGNBQThCO0lBQUEsSUFBa0M7TUFBQSxJQUFoRUEsY0FBOEIsZ0JBQTlCQSxjQUE4QixHQUFHQyxjQUFjLENBQUNDLGNBQWM7TUFFOUQsSUFBTWdCLHNCQUFzQixHQUFHQyxZQUFZLENBQUNDLFdBQVcsQ0FBQ3RCLFdBQVcsQ0FBQ3VCLE9BQU8sRUFBRSxDQUFDO01BQzlFLElBQU1DLHdCQUF3QixHQUFHLENBQUNKLHNCQUFzQixHQUNsRHZCLGlCQUFpQixHQUNqQixZQUEwQjtRQUN4QndCLFlBQVksQ0FBQ0ksVUFBVSxDQUFDekIsV0FBVyxDQUFDdUIsT0FBTyxFQUFFLENBQUM7UUFBQyxrQ0FEcENHLElBQUk7VUFBSkEsSUFBSTtRQUFBO1FBRWY3QixpQkFBaUIsQ0FBQzhCLEtBQUssT0FBdkI5QixpQkFBaUIsR0FBTyxJQUFJLFNBQUs2QixJQUFJLEVBQUM7TUFDMUMsQ0FBQztNQUVMLElBQU1FLHFDQUFxQyxHQUFHQyxvQ0FBb0MsQ0FBQzdCLFdBQVcsQ0FBQztNQUFDO1FBQUEsSUFFNUZlLGNBQWM7VUFBQTtZQUFBLElBQ1ZmLFdBQVcsQ0FBQzhCLGVBQWUsRUFBRSxDQUFDQyxxQkFBcUIsRUFBRSxDQUFDQyxZQUFZLEVBQUU7Y0FBQSx1QkFDOURDLGNBQWMsQ0FDaEJsQixjQUFjLEVBQ2RqQixnQkFBZ0IsRUFDaEJFLFdBQVcsRUFDWHdCLHdCQUF3QixFQUN4QnZCLGtCQUFrQixDQUNyQjtZQUFBLE9BQ0UsSUFBSSxDQUFDRixRQUFRLENBQUNZLFNBQVMsRUFBRSxDQUFDdUIsZUFBZSxFQUFFO2NBQzlDQyx5QkFBeUIsQ0FDckJwQixjQUFjLEVBQ2RqQixnQkFBZ0IsRUFDaEJFLFdBQVcsRUFDWHdCLHdCQUF3QixFQUN4QnRCLGNBQWMsRUFDZDBCLHFDQUFxQyxFQUNyQzNCLGtCQUFrQixDQUNyQjtZQUNMLENBQUMsTUFBTSxJQUFJYyxjQUFjLENBQUNxQixnQkFBZ0IsS0FBS3JCLGNBQWMsQ0FBQ3NCLGtCQUFrQixFQUFFO2NBQzlFQyxvQ0FBb0MsQ0FDaEN0QyxXQUFXLEVBQ1hELFFBQVEsRUFDUnlCLHdCQUF3QixFQUN4QnRCLGNBQWMsQ0FDakI7WUFDTCxDQUFDLE1BQU0sSUFBSXFDLFNBQVMsQ0FBQ0MsZ0JBQWdCLEVBQUUsRUFBRTtjQUNyQ0MscUJBQXFCLENBQ2pCekMsV0FBVyxFQUNYRixnQkFBZ0IsRUFDaEIwQix3QkFBd0IsRUFDeEJ0QixjQUFjLEVBQ2QwQixxQ0FBcUMsRUFDckMzQixrQkFBa0IsQ0FDckI7WUFDTCxDQUFDLE1BQU07Y0FDSDtjQUNBO2NBQ0E7Y0FDQXVCLHdCQUF3QixFQUFFO1lBQzlCO1VBQUM7VUFBQTtRQUFBO1VBRUQzQixpQkFBaUIsRUFBRTtRQUFDO01BQUE7TUFBQTtJQUU1QixDQUFDO01BQUE7SUFBQTtFQUFBO0VBN0dEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBVEEsSUFVZTRDLHFCQUFxQixhQUNoQ3pDLFdBQWdCLEVBQ2hCRixnQkFBcUIsRUFDckIwQix3QkFBNkIsRUFDN0J0QixjQUE4QixFQUM5QjBCLHFDQUE4QyxFQUM5QzNCLGtCQUE0QjtJQUFBLElBQUU7TUFDOUIsSUFBSUMsY0FBYyxLQUFLQyxjQUFjLENBQUN1QyxpQkFBaUIsSUFBSWQscUNBQXFDLEVBQUU7UUFDOUY7UUFDQTtRQUNBSix3QkFBd0IsRUFBRTtNQUM5QixDQUFDLE1BQU07UUFDSDtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0FtQiw2QkFBNkIsQ0FBQ0MsOEJBQThCLENBQ3hEcEIsd0JBQXdCLEVBQ3hCMUIsZ0JBQWdCLEVBQ2hCRSxXQUFXLEVBQ1hDLGtCQUFrQixDQUNyQjtNQUNMO01BQUM7SUFDTCxDQUFDO01BQUE7SUFBQTtFQUFBO0VBekVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFQQSxJQVFlcUMsb0NBQW9DLGFBQy9DdEMsV0FBZ0IsRUFDaEJELFFBQWEsRUFDYnlCLHdCQUE2QixFQUM3QnRCLGNBQThCO0lBQUEsSUFDaEM7TUFBQTtRQUFBLElBUU1BLGNBQWMsS0FBS0MsY0FBYyxDQUFDQyxjQUFjO1VBQ2hELElBQU15QyxXQUFXLEdBQUc7WUFDaEJDLGtCQUFrQixFQUFFO1VBQ3hCLENBQUM7VUFBQyxpQ0FFRTtZQUFBLHVCQUNNOUMsV0FBVyxDQUFDK0MsUUFBUSxDQUFDQyxjQUFjLENBQUNqRCxRQUFRLEVBQUU4QyxXQUFXLENBQUM7Y0FDaEVyQix3QkFBd0IsRUFBRTtZQUFDO1VBQy9CLENBQUMsWUFBUUwsS0FBVSxFQUFFO1lBQ2pCRCxHQUFHLENBQUNDLEtBQUssQ0FBQyxvQ0FBb0MsRUFBRUEsS0FBSyxDQUFDO1VBQzFELENBQUM7VUFBQTtRQUFBO1VBRUQ7VUFDQTtVQUNBSyx3QkFBd0IsRUFBRTtRQUFDO01BQUE7TUFyQi9CO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBO01BQUE7SUFpQkosQ0FBQztNQUFBO0lBQUE7RUFBQTtFQS9GRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBVkEsSUFXZVcseUJBQXlCLGFBQ3BDcEIsY0FBbUIsRUFDbkJqQixnQkFBcUIsRUFDckJFLFdBQWdCLEVBQ2hCd0Isd0JBQTZCLEVBQzdCdEIsY0FBOEIsRUFDOUIwQixxQ0FBOEMsRUFDOUMzQixrQkFBNEI7SUFBQSxJQUFFO01BQUE7UUFBQSxJQUsxQnNDLFNBQVMsQ0FBQ0MsZ0JBQWdCLEVBQUU7VUFBQTtZQUFBLElBRXhCekIsY0FBYyxDQUFDcUIsZ0JBQWdCLEtBQUtyQixjQUFjLENBQUNzQixrQkFBa0IsSUFDckVuQyxjQUFjLEtBQUtDLGNBQWMsQ0FBQ0MsY0FBYztjQUFBLGdDQUs1QztnQkFBQSx1QkFDTXVDLDZCQUE2QixDQUFDTSxZQUFZLENBQUNqRCxXQUFXLEVBQUVDLGtCQUFrQixDQUFDO2tCQUNqRnVCLHdCQUF3QixFQUFFO2dCQUFDO2NBQy9CLENBQUMsWUFBUUwsS0FBVSxFQUFFO2dCQUNqQkQsR0FBRyxDQUFDQyxLQUFLLENBQUMsb0NBQW9DLEVBQUVBLEtBQUssQ0FBQztjQUMxRCxDQUFDO2NBQUE7WUFBQSxPQUNFLElBQUlqQixjQUFjLEtBQUtDLGNBQWMsQ0FBQ3VDLGlCQUFpQixJQUFJZCxxQ0FBcUMsRUFBRTtjQUNyRztjQUNBO2NBQ0FKLHdCQUF3QixFQUFFO1lBQzlCLENBQUMsTUFBTTtjQUNIO2NBQ0E7Y0FDQW1CLDZCQUE2QixDQUFDQyw4QkFBOEIsQ0FDeERwQix3QkFBd0IsRUFDeEIxQixnQkFBZ0IsRUFDaEJFLFdBQVcsRUFDWEMsa0JBQWtCLENBQ3JCO1lBQ0w7VUFBQztVQUFBO1FBQUE7VUFFRDtVQUNBO1VBQ0E7VUFDQXVCLHdCQUF3QixFQUFFO1FBQUM7TUFBQTtNQXBDL0I7TUFDQTtNQUNBO01BQ0E7TUFBQTtJQW1DSixDQUFDO01BQUE7SUFBQTtFQUFBO0VBeEZEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQVJBLElBU2VTLGNBQWMsYUFDekJsQixjQUFtQixFQUNuQmpCLGdCQUFxQixFQUNyQkUsV0FBZ0IsRUFDaEJ3Qix3QkFBNkIsRUFDN0J2QixrQkFBNEI7SUFBQSxJQUM5QjtNQUNFO01BQ0E7TUFDQTtNQUNBLElBQUljLGNBQWMsQ0FBQ3FCLGdCQUFnQixLQUFLckIsY0FBYyxDQUFDc0Isa0JBQWtCLEVBQUU7UUFDdkVNLDZCQUE2QixDQUFDQyw4QkFBOEIsQ0FDeERwQix3QkFBd0IsRUFDeEIxQixnQkFBZ0IsRUFDaEJFLFdBQVcsRUFDWEMsa0JBQWtCLENBQ3JCO01BQ0wsQ0FBQyxNQUFNO1FBQ0h1Qix3QkFBd0IsRUFBRTtNQUM5QjtNQUFDO0lBQ0wsQ0FBQztNQUFBO0lBQUE7RUFBQTtFQWhERDtFQUFBLElBQ0tyQixjQUFjO0VBS25CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBLFdBTEtBLGNBQWM7SUFBZEEsY0FBYztJQUFkQSxjQUFjO0VBQUEsR0FBZEEsY0FBYyxLQUFkQSxjQUFjO0VBV25CLFNBQVMwQixvQ0FBb0MsQ0FBQ3FCLGNBQThCLEVBQUU7SUFBQTtJQUMxRSxJQUFJQyxjQUFjLEdBQUcsS0FBSztJQUMxQixJQUFNQyxTQUFTLEdBQUdGLGNBQWMsQ0FBQ3BCLGVBQWUsRUFBRSxDQUFDdUIsV0FBVyxFQUFTO0lBQ3ZFRixjQUFjLEdBQUcsQ0FBQUMsU0FBUyxhQUFUQSxTQUFTLDJDQUFUQSxTQUFTLENBQUcsUUFBUSxDQUFDLDZFQUFyQixpQkFBdUJFLEdBQUcseURBQTFCLHFCQUE0QnpCLG9DQUFvQyxLQUFJLEtBQUs7SUFDMUYsT0FBT3NCLGNBQWM7RUFDekI7RUE4UkEsSUFBTUksa0JBQWtCLEdBQUc7SUFDdkIzRCx5Q0FBeUMsRUFBRUEseUNBQXlDO0lBQ3BGaUMsb0NBQW9DLEVBQUVBLG9DQUFvQztJQUMxRTFCLGNBQWMsRUFBRUEsY0FBYztJQUM5QjhCLGNBQWMsRUFBRUEsY0FBYztJQUM5QkUseUJBQXlCLEVBQUVBLHlCQUF5QjtJQUNwREcsb0NBQW9DLEVBQUVBLG9DQUFvQztJQUMxRUcscUJBQXFCLEVBQUVBO0VBQzNCLENBQUM7RUFBQSxPQUVjYyxrQkFBa0I7QUFBQSJ9