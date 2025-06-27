/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/collaboration/ActivitySync", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/controls/FieldWrapper", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldAPI", "sap/fe/macros/ResourceModel", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/IconPool", "sap/ui/model/Filter", "sap/ui/unified/FileUploaderParameter", "sap/ui/util/openWindow"], function (Log, CommonUtils, CollaborationActivitySync, CollaborationCommon, draft, FieldWrapper, KeepAliveHelper, ModelHelper, CommonHelper, FieldAPI, ResourceModel, MessageBox, Core, IconPool, Filter, FileUploaderParameter, openWindow) {
  "use strict";

  var Activity = CollaborationCommon.Activity;
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
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  /**
   * Static class used by "sap.ui.mdc.Field" during runtime
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  var FieldRuntime = {
    resetChangesHandler: undefined,
    uploadPromises: undefined,
    formatDraftOwnerTextInPopover: function (bHasDraftEntity, sDraftInProcessByUser, sDraftLastChangedByUser, sDraftInProcessByUserDesc, sDraftLastChangedByUserDesc) {
      if (bHasDraftEntity) {
        var sUserDescription = sDraftInProcessByUserDesc || sDraftInProcessByUser || sDraftLastChangedByUserDesc || sDraftLastChangedByUser;
        if (!sUserDescription) {
          return ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_UNKNOWN");
        } else {
          return sDraftInProcessByUser ? ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_LOCKED_BY_KNOWN", sUserDescription) : ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_KNOWN", sUserDescription);
        }
      } else {
        return ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_NO_DATA_TEXT");
      }
    },
    /**
     * Triggers an internal navigation on the link pertaining to DataFieldWithNavigationPath.
     *
     * @param oSource Source of the press event
     * @param oController Instance of the controller
     * @param sSemanticObjectName Semantic object name
     */
    onDataFieldWithNavigationPath: function (oSource, oController, sSemanticObjectName) {
      if (oController._routing) {
        var oBindingContext = oSource.getBindingContext();
        var oView = CommonUtils.getTargetView(oSource),
          oMetaModel = oBindingContext.getModel().getMetaModel(),
          fnNavigate = function (oContext) {
            if (oContext) {
              oBindingContext = oContext;
            }
            oController._routing.navigateToTarget(oBindingContext, sSemanticObjectName, undefined, true);
          };
        // Show draft loss confirmation dialog in case of Object page
        if (oView.getViewData().converterType === "ObjectPage" && !ModelHelper.isStickySessionSupported(oMetaModel)) {
          draft.processDataLossOrDraftDiscardConfirmation(fnNavigate, Function.prototype, oBindingContext, oView.getController(), true, draft.NavigationType.ForwardNavigation);
        } else {
          fnNavigate();
        }
      } else {
        Log.error("FieldRuntime: No routing listener controller extension found. Internal navigation aborted.", "sap.fe.macros.field.FieldRuntime", "onDataFieldWithNavigationPath");
      }
    },
    isDraftIndicatorVisible: function (sPropertyPath, sSemanticKeyHasDraftIndicator, HasDraftEntity, IsActiveEntity, hideDraftInfo) {
      if (IsActiveEntity !== undefined && HasDraftEntity !== undefined && (!IsActiveEntity || HasDraftEntity) && !hideDraftInfo) {
        return sPropertyPath === sSemanticKeyHasDraftIndicator;
      } else {
        return false;
      }
    },
    hasTargets: function (bSemanticObjectHasTargets) {
      return bSemanticObjectHasTargets ? bSemanticObjectHasTargets : false;
    },
    getStateDependingOnSemanticObjectTargets: function (bSemanticObjectHasTargets) {
      return bSemanticObjectHasTargets ? "Information" : "None";
    },
    /**
     * Handler for the validateFieldGroup event.
     *
     * @function
     * @name onValidateFieldGroup
     * @param oController The controller of the page containing the field
     * @param oEvent The event object passed by the validateFieldGroup event
     */
    onValidateFieldGroup: function (oController, oEvent) {
      var oFEController = FieldRuntime._getExtensionController(oController);
      oFEController._sideEffects.handleFieldGroupChange(oEvent);
    },
    /**
     * Handler for the change event.
     * Store field group IDs of this field for requesting side effects when required.
     * We store them here to ensure a change in the value of the field has taken place.
     *
     * @function
     * @name handleChange
     * @param oController The controller of the page containing the field
     * @param oEvent The event object passed by the change event
     */
    handleChange: function (oController, oEvent) {
      var oSourceField = oEvent.getSource(),
        bIsTransient = oSourceField && oSourceField.getBindingContext().isTransient(),
        pValueResolved = oEvent.getParameter("promise") || Promise.resolve(),
        oSource = oEvent.getSource(),
        bValid = oEvent.getParameter("valid");

      // TODO: currently we have undefined and true... and our creation row implementation relies on this.
      // I would move this logic to this place as it's hard to understand for field consumer

      pValueResolved.then(function () {
        // The event is gone. For now we'll just recreate it again
        oEvent.oSource = oSource;
        oEvent.mParameters = {
          valid: bValid
        };
        FieldAPI.handleChange(oEvent, oController);
      }).catch(function /*oError: any*/
      () {
        // The event is gone. For now we'll just recreate it again
        oEvent.oSource = oSource;
        oEvent.mParameters = {
          valid: false
        };

        // as the UI might need to react on. We could provide a parameter to inform if validation
        // was successful?
        FieldAPI.handleChange(oEvent, oController);
      });

      // Use the FE Controller instead of the extensionAPI to access internal FE controllers
      var oFEController = FieldRuntime._getExtensionController(oController);
      oFEController._editFlow.syncTask(pValueResolved);

      // if the context is transient, it means the request would fail anyway as the record does not exist in reality
      // TODO: should the request be made in future if the context is transient?
      if (bIsTransient) {
        return;
      }

      // SIDE EFFECTS
      oFEController._sideEffects.handleFieldChange(oEvent, pValueResolved);

      // Collaboration Draft Activity Sync
      var oField = oEvent.getSource(),
        bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      var oBinding, sBindingPath;
      if (bCollaborationEnabled && this.getFieldStateOnChange(oEvent).state["validity"]) {
        var _oField$getBindingInf, _oField$getBindingInf2;
        /* TODO: for now we use always the first binding part (so in case of composite bindings like amount and
        		unit or currency only the amount is considered) */
        oBinding = oField.getBindingContext().getBinding();
        if (!oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          var oView = CommonUtils.getTargetView(oField);
          oBinding = oView.getBindingContext().getBinding();
        }
        var data = [].concat(_toConsumableArray((_oField$getBindingInf = oField.getBindingInfo("value")) === null || _oField$getBindingInf === void 0 ? void 0 : _oField$getBindingInf.parts), _toConsumableArray(((_oField$getBindingInf2 = oField.getBindingInfo("additionalValue")) === null || _oField$getBindingInf2 === void 0 ? void 0 : _oField$getBindingInf2.parts) || [])).map(function (part) {
          if (part) {
            var _oField$getBindingCon;
            sBindingPath = part.path;
            return "".concat((_oField$getBindingCon = oField.getBindingContext()) === null || _oField$getBindingCon === void 0 ? void 0 : _oField$getBindingCon.getPath(), "/").concat(sBindingPath);
          }
        });
        oBinding.attachEventOnce("patchCompleted", function () {
          CollaborationActivitySync.send(oField, Activity.Change, data);
        });
      }
    },
    handleLiveChange: function (oEvent) {
      var _this = this;
      // Collaboration Draft Activity Sync
      var oField = oEvent.getSource(),
        bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled) {
        /* TODO: for now we use always the first binding part (so in case of composite bindings like amount and
        		unit or currency only the amount is considered) */
        var sBindingPath = oField.getBindingInfo("value").parts[0].path;
        var sFullPath = "".concat(oField.getBindingContext().getPath(), "/").concat(sBindingPath);
        CollaborationActivitySync.send(oField, Activity.LiveChange, sFullPath);

        // If the user reverted the change no change event is sent therefore we have to handle it here
        if (!this.resetChangesHandler) {
          this.resetChangesHandler = function () {
            if (oField.getValue() === oField.getBinding("value").getValue()) {
              // the user did a change but reverted it. to be checked if there is a better way to determine
              CollaborationActivitySync.send(oField, Activity.Undo, sFullPath);
            }
            oField.detachBrowserEvent("focusout", _this.resetChangesHandler);
            delete _this.resetChangesHandler;
          };
          oField.attachBrowserEvent("focusout", this.resetChangesHandler);
        }
      }
    },
    handleOpenPicker: function (oEvent) {
      // Collaboration Draft Activity Sync
      var oField = oEvent.getSource(),
        bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled) {
        var sBindingPath = oField.getBindingInfo("value").parts[0].path;
        var sFullPath = "".concat(oField.getBindingContext().getPath(), "/").concat(sBindingPath);
        CollaborationActivitySync.send(oField, Activity.LiveChange, sFullPath);
      }
    },
    handleClosePicker: function (oEvent) {
      // Collaboration Draft Activity Sync
      var oField = oEvent.getSource(),
        bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled) {
        var sBindingPath = oField.getBindingInfo("value").parts[0].path;
        var sFullPath = "".concat(oField.getBindingContext().getPath(), "/").concat(sBindingPath);
        if (new Date(oField.getValue()).toDateString() === new Date(oField.getBinding("value").getValue() || "").toDateString()) {
          // the user did a change but reverted it. to be checked if there is a better way to determine
          CollaborationActivitySync.send(oField, Activity.Undo, sFullPath);
        }
      }
    },
    handleOpenUploader: function (oEvent) {
      // Collaboration Draft Activity Sync
      var oField = oEvent.getSource(),
        bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled) {
        var _oField$getBindingCon2;
        var sBindingPath = oField.getParent().getAvatar().getBindingInfo("src").parts[0].path;
        var sFullPath = "".concat((_oField$getBindingCon2 = oField.getBindingContext()) === null || _oField$getBindingCon2 === void 0 ? void 0 : _oField$getBindingCon2.getPath(), "/").concat(sBindingPath);
        CollaborationActivitySync.send(oField, Activity.LiveChange, sFullPath);
      }
    },
    handleCloseUploader: function (oEvent) {
      // Collaboration Draft Activity Sync
      var oField = oEvent.getSource(),
        bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      if (bCollaborationEnabled) {
        var _oField$getBindingCon3;
        var sBindingPath = oField.getParent().getAvatar().getBindingInfo("src").parts[0].path;
        var sFullPath = "".concat((_oField$getBindingCon3 = oField.getBindingContext()) === null || _oField$getBindingCon3 === void 0 ? void 0 : _oField$getBindingCon3.getPath(), "/").concat(sBindingPath);
        CollaborationActivitySync.send(oField, Activity.Undo, sFullPath);
      }
    },
    /**
     * Gets the field value and validity on a change event.
     *
     * @function
     * @name fieldValidityOnChange
     * @param oEvent The event object passed by the change event
     * @returns Field value and validity
     */
    getFieldStateOnChange: function (oEvent) {
      var oSourceField = oEvent.getSource(),
        mFieldState = {};
      var _isBindingStateMessages = function (oBinding) {
        return oBinding && oBinding.getDataState() ? oBinding.getDataState().getInvalidValue() === undefined : true;
      };
      if (oSourceField.isA("sap.fe.macros.field.FieldAPI")) {
        oSourceField = oSourceField.getContent();
      }
      if (oSourceField.isA(FieldWrapper.getMetadata().getName()) && oSourceField.getEditMode() === "Editable") {
        oSourceField = oSourceField.getContentEdit()[0];
      }
      if (oSourceField.isA("sap.ui.mdc.Field")) {
        var bIsValid = oEvent.getParameter("valid") || oEvent.getParameter("isValid");
        if (bIsValid === undefined) {
          if (oSourceField.getMaxConditions() === 1) {
            var oValueBindingInfo = oSourceField.getBindingInfo("value");
            bIsValid = _isBindingStateMessages(oValueBindingInfo && oValueBindingInfo.binding);
          }
          if (oSourceField.getValue() === "" && !oSourceField.getProperty("required")) {
            bIsValid = true;
          }
        }
        mFieldState = {
          fieldValue: oSourceField.getValue(),
          validity: !!bIsValid
        };
      } else {
        // oSourceField extends from a FileUploader || Input || is a CheckBox
        var oBinding = oSourceField.getBinding("uploadUrl") || oSourceField.getBinding("value") || oSourceField.getBinding("selected");
        mFieldState = {
          fieldValue: oBinding && oBinding.getValue(),
          validity: _isBindingStateMessages(oBinding)
        };
      }
      return {
        field: oSourceField,
        state: mFieldState
      };
    },
    _fnFixHashQueryString: function (sCurrentHash) {
      if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
        // sCurrentHash can contain query string, cut it off!
        sCurrentHash = sCurrentHash.split("?")[0];
      }
      return sCurrentHash;
    },
    _fnGetLinkInformation: function (_oSource, _oLink, _sPropertyPath, _sValue, fnSetActive) {
      var oModel = _oLink && _oLink.getModel();
      var oMetaModel = oModel && oModel.getMetaModel();
      var sSemanticObjectName = _sValue || _oSource && _oSource.getValue();
      var oView = _oLink && CommonUtils.getTargetView(_oLink);
      var oInternalModelContext = oView && oView.getBindingContext("internal");
      var oAppComponent = oView && CommonUtils.getAppComponent(oView);
      var oShellServiceHelper = oAppComponent && oAppComponent.getShellServices();
      var pGetLinksPromise = oShellServiceHelper && oShellServiceHelper.getLinksWithCache([[{
        semanticObject: sSemanticObjectName
      }]]);
      var aSemanticObjectUnavailableActions = oMetaModel && oMetaModel.getObject("".concat(_sPropertyPath, "@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"));
      return {
        SemanticObjectName: sSemanticObjectName,
        SemanticObjectFullPath: _sPropertyPath,
        //sSemanticObjectFullPath,
        MetaModel: oMetaModel,
        InternalModelContext: oInternalModelContext,
        ShellServiceHelper: oShellServiceHelper,
        GetLinksPromise: pGetLinksPromise,
        SemanticObjectUnavailableActions: aSemanticObjectUnavailableActions,
        fnSetActive: fnSetActive
      };
    },
    _fnQuickViewHasNewCondition: function (oSemanticObjectPayload, _oLinkInfo) {
      if (oSemanticObjectPayload && oSemanticObjectPayload.path && oSemanticObjectPayload.path === _oLinkInfo.SemanticObjectFullPath) {
        // Got the resolved Semantic Object!
        var bResultingNewConditionForConditionalWrapper = oSemanticObjectPayload[!_oLinkInfo.SemanticObjectUnavailableActions ? "HasTargetsNotFiltered" : "HasTargets"];
        _oLinkInfo.fnSetActive(!!bResultingNewConditionForConditionalWrapper);
        return true;
      } else {
        return false;
      }
    },
    _fnQuickViewSetNewConditionForConditionalWrapper: function (_oLinkInfo, _oFinalSemanticObjects) {
      if (_oFinalSemanticObjects[_oLinkInfo.SemanticObjectName]) {
        var sTmpPath, oSemanticObjectPayload;
        var aSemanticObjectPaths = Object.keys(_oFinalSemanticObjects[_oLinkInfo.SemanticObjectName]);
        for (var iPathsCount in aSemanticObjectPaths) {
          sTmpPath = aSemanticObjectPaths[iPathsCount];
          oSemanticObjectPayload = _oFinalSemanticObjects[_oLinkInfo.SemanticObjectName] && _oFinalSemanticObjects[_oLinkInfo.SemanticObjectName][sTmpPath];
          if (FieldRuntime._fnQuickViewHasNewCondition(oSemanticObjectPayload, _oLinkInfo)) {
            break;
          }
        }
      }
    },
    _fnUpdateSemanticObjectsTargetModel: function (oEvent, sValue, oControl, _sPropertyPath) {
      var oSource = oEvent && oEvent.getSource();
      var fnSetActive;
      if (oControl.isA("sap.m.ObjectStatus")) {
        fnSetActive = function (bActive) {
          return oControl.setActive(bActive);
        };
      }
      if (oControl.isA("sap.m.ObjectIdentifier")) {
        fnSetActive = function (bActive) {
          return oControl.setTitleActive(bActive);
        };
      }
      var oConditionalWrapper = oControl && oControl.getParent();
      if (oConditionalWrapper && oConditionalWrapper.isA("sap.fe.core.controls.ConditionalWrapper")) {
        fnSetActive = function (bActive) {
          return oConditionalWrapper.setCondition(bActive);
        };
      }
      if (fnSetActive !== undefined) {
        var oLinkInfo = FieldRuntime._fnGetLinkInformation(oSource, oControl, _sPropertyPath, sValue, fnSetActive);
        oLinkInfo.fnSetActive = fnSetActive;
        var sCurrentHash = FieldRuntime._fnFixHashQueryString(CommonUtils.getHash());
        CommonUtils.updateSemanticTargets([oLinkInfo.GetLinksPromise], [{
          semanticObject: oLinkInfo.SemanticObjectName,
          path: oLinkInfo.SemanticObjectFullPath
        }], oLinkInfo.InternalModelContext, sCurrentHash).then(function (oFinalSemanticObjects) {
          if (oFinalSemanticObjects) {
            FieldRuntime._fnQuickViewSetNewConditionForConditionalWrapper(oLinkInfo, oFinalSemanticObjects);
          }
        }).catch(function (oError) {
          Log.error("Cannot update Semantic Targets model", oError);
        });
      }
    },
    _checkControlHasModelAndBindingContext: function (_control) {
      if (!_control.getModel() || !_control.getBindingContext()) {
        return false;
      } else {
        return true;
      }
    },
    _checkCustomDataValueBeforeUpdatingSemanticObjectModel: function (_control, propertyPath, aCustomData) {
      var sSemanticObjectPathValue;
      var oValueBinding;
      var _fnCustomDataValueIsString = function (semanticObjectPathValue) {
        return !(semanticObjectPathValue !== null && typeof semanticObjectPathValue === "object");
      };
      // remove technical custom datas set by UI5
      aCustomData = aCustomData.filter(function (customData) {
        return customData.getKey() !== "sap-ui-custom-settings";
      });
      for (var index in aCustomData) {
        sSemanticObjectPathValue = aCustomData[index].getValue();
        if (!sSemanticObjectPathValue && _fnCustomDataValueIsString(sSemanticObjectPathValue)) {
          oValueBinding = aCustomData[index].getBinding("value");
          if (oValueBinding) {
            oValueBinding.attachEventOnce("change", function (_oChangeEvent) {
              FieldRuntime._fnUpdateSemanticObjectsTargetModel(_oChangeEvent, null, _control, propertyPath);
            });
          }
        } else if (_fnCustomDataValueIsString(sSemanticObjectPathValue)) {
          FieldRuntime._fnUpdateSemanticObjectsTargetModel(null, sSemanticObjectPathValue, _control, propertyPath);
        }
      }
    },
    LinkModelContextChange: function (oEvent, sProperty, sPathToProperty) {
      var control = oEvent.getSource();
      if (FieldRuntime._checkControlHasModelAndBindingContext(control)) {
        var sPropertyPath = "".concat(sPathToProperty, "/").concat(sProperty);
        var mdcLink = control.getDependents().length ? control.getDependents()[0] : undefined;
        var aCustomData = mdcLink === null || mdcLink === void 0 ? void 0 : mdcLink.getCustomData();
        if (aCustomData && aCustomData.length > 0) {
          FieldRuntime._checkCustomDataValueBeforeUpdatingSemanticObjectModel(control, sPropertyPath, aCustomData);
        }
      }
    },
    openExternalLink: function (event) {
      var source = event.getSource();
      if (source.data("url") && source.getProperty("text") !== "") {
        // This opens the link in the same tab as the link. It was done to be more consistent with other type of links.
        openWindow(source.data("url"), "_self");
      }
    },
    pressLink: function (oEvent) {
      try {
        var openLink = function (mdcLink) {
          try {
            var _temp10 = _catch(function () {
              return Promise.resolve(mdcLink.getTriggerHref()).then(function (sHref) {
                var _temp8 = function () {
                  if (!sHref) {
                    var _temp11 = _catch(function () {
                      return Promise.resolve(mdcLink.open(oLink)).then(function () {});
                    }, function (oError) {
                      Log.error("Cannot retrieve the QuickView Popover dialog", oError);
                    });
                    if (_temp11 && _temp11.then) return _temp11.then(function () {});
                  } else {
                    var oView = CommonUtils.getTargetView(oLink);
                    var oAppComponent = CommonUtils.getAppComponent(oView);
                    var oShellServiceHelper = oAppComponent.getShellServices();
                    var oShellHash = oShellServiceHelper.parseShellHash(sHref);
                    var oNavArgs = {
                      target: {
                        semanticObject: oShellHash.semanticObject,
                        action: oShellHash.action
                      },
                      params: oShellHash.params
                    };
                    KeepAliveHelper.storeControlRefreshStrategyForHash(oView, oShellHash);
                    var _temp12 = function () {
                      if (CommonUtils.isStickyEditMode(oLink) !== true) {
                        //URL params and xappState has been generated earlier hence using toExternal
                        oShellServiceHelper.toExternal(oNavArgs, oAppComponent);
                      } else {
                        var _temp13 = _catch(function () {
                          return Promise.resolve(oShellServiceHelper.hrefForExternalAsync(oNavArgs, oAppComponent)).then(function (sNewHref) {
                            openWindow(sNewHref);
                          });
                        }, function (oError) {
                          Log.error("Error while retireving hrefForExternal : ".concat(oError));
                        });
                        if (_temp13 && _temp13.then) return _temp13.then(function () {});
                      }
                    }();
                    if (_temp12 && _temp12.then) return _temp12.then(function () {});
                  }
                }();
                if (_temp8 && _temp8.then) return _temp8.then(function () {});
              });
            }, function (oError) {
              Log.error("Error triggering link Href", oError);
            });
            return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(function () {}) : void 0);
          } catch (e) {
            return Promise.reject(e);
          }
        };
        var oSource = oEvent.getSource();
        var oLink = oSource.isA("sap.m.ObjectIdentifier") ? oSource.findElements(false, function (elem) {
          return elem.isA("sap.m.Link");
        })[0] : oSource;
        var _temp3 = function () {
          if (oSource.getDependents() && oSource.getDependents().length > 0 && oLink.getProperty("text") !== "") {
            var oFieldInfo = oSource.getDependents()[0];
            var _temp4 = function () {
              if (oFieldInfo && oFieldInfo.isA("sap.ui.mdc.Link")) {
                return Promise.resolve(openLink(oFieldInfo)).then(function () {});
              }
            }();
            if (_temp4 && _temp4.then) return _temp4.then(function () {});
          }
        }();
        return Promise.resolve(_temp3 && _temp3.then ? _temp3.then(function () {
          return oLink;
        }) : oLink);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    uploadStream: function (controller, event) {
      var _this2 = this;
      var fileUploader = event.getSource(),
        FEController = FieldRuntime._getExtensionController(controller),
        fileWrapper = fileUploader.getParent(),
        uploadUrl = fileWrapper.getUploadUrl();
      if (uploadUrl !== "") {
        var _fileUploader$getMode, _fileUploader$getBind;
        fileWrapper.setUIBusy(true);

        // use uploadUrl from FileWrapper which returns a canonical URL
        fileUploader.setUploadUrl(uploadUrl);
        fileUploader.removeAllHeaderParameters();
        var token = (_fileUploader$getMode = fileUploader.getModel()) === null || _fileUploader$getMode === void 0 ? void 0 : _fileUploader$getMode.getHttpHeaders()["X-CSRF-Token"];
        if (token) {
          var headerParameterCSRFToken = new FileUploaderParameter();
          headerParameterCSRFToken.setName("x-csrf-token");
          headerParameterCSRFToken.setValue(token);
          fileUploader.addHeaderParameter(headerParameterCSRFToken);
        }
        var eTag = (_fileUploader$getBind = fileUploader.getBindingContext()) === null || _fileUploader$getBind === void 0 ? void 0 : _fileUploader$getBind.getProperty("@odata.etag");
        if (eTag) {
          var headerParameterETag = new FileUploaderParameter();
          headerParameterETag.setName("If-Match");
          headerParameterETag.setValue(eTag);
          fileUploader.addHeaderParameter(headerParameterETag);
        }
        var headerParameterAccept = new FileUploaderParameter();
        headerParameterAccept.setName("Accept");
        headerParameterAccept.setValue("application/json");
        fileUploader.addHeaderParameter(headerParameterAccept);

        // synchronize upload with other requests
        var uploadPromise = new Promise(function (resolve, reject) {
          _this2.uploadPromises = _this2.uploadPromises || {};
          _this2.uploadPromises[fileUploader.getId()] = {
            resolve: resolve,
            reject: reject
          };
          fileUploader.upload();
        });
        FEController._editFlow.syncTask(uploadPromise);
      } else {
        MessageBox.error(ResourceModel.getText("M_FIELD_FILEUPLOADER_ABORTED_TEXT"));
      }
    },
    handleUploadComplete: function (event, propertyFileName, propertyPath, controller) {
      var status = event.getParameter("status"),
        fileUploader = event.getSource(),
        fileWrapper = fileUploader.getParent();
      fileWrapper.setUIBusy(false);
      if (status === 0 || status >= 400) {
        this._displayMessageForFailedUpload(event);
        this.uploadPromises[fileUploader.getId()].reject();
      } else {
        var context = fileUploader.getBindingContext(),
          newETag = event.getParameter("headers").etag;
        if (newETag) {
          // set new etag for filename update, but without sending patch request
          context === null || context === void 0 ? void 0 : context.setProperty("@odata.etag", newETag, null);
        }

        // set filename for link text
        if (propertyFileName !== null && propertyFileName !== void 0 && propertyFileName.path) {
          context === null || context === void 0 ? void 0 : context.setProperty(propertyFileName.path, fileUploader.getValue());
        }

        // invalidate the property that not gets updated otherwise
        context === null || context === void 0 ? void 0 : context.setProperty(propertyPath, null, null);
        context === null || context === void 0 ? void 0 : context.setProperty(propertyPath, undefined, null);
        this._callSideEffectsForStream(event, fileWrapper, controller);
        this.uploadPromises[fileUploader.getId()].resolve();
      }

      // Collaboration Draft Activity Sync
      var oField = event.getSource(),
        bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
      var sBindingPath;
      if (bCollaborationEnabled) {
        var _getAvatar$getBinding, _getAvatar$getBinding2;
        var data = [].concat(_toConsumableArray((_getAvatar$getBinding = oField.getParent().getAvatar().getBindingInfo("src")) === null || _getAvatar$getBinding === void 0 ? void 0 : _getAvatar$getBinding.parts), _toConsumableArray(((_getAvatar$getBinding2 = oField.getParent().getAvatar().getBindingInfo("additionalValue")) === null || _getAvatar$getBinding2 === void 0 ? void 0 : _getAvatar$getBinding2.parts) || [])).map(function (part) {
          if (part) {
            var _oField$getBindingCon4;
            sBindingPath = part.path;
            return "".concat((_oField$getBindingCon4 = oField.getBindingContext()) === null || _oField$getBindingCon4 === void 0 ? void 0 : _oField$getBindingCon4.getPath(), "/").concat(sBindingPath);
          }
        });
        CollaborationActivitySync.send(oField, Activity.Change, data);
      }
      delete this.uploadPromises[fileUploader.getId()];
    },
    _displayMessageForFailedUpload: function (oEvent) {
      // handling of backend errors
      var sError = oEvent.getParameter("responseRaw") || oEvent.getParameter("response");
      var sMessageText, oError;
      try {
        oError = sError && JSON.parse(sError);
        sMessageText = oError.error && oError.error.message;
      } catch (e) {
        sMessageText = sError || ResourceModel.getText("M_FIELD_FILEUPLOADER_ABORTED_TEXT");
      }
      MessageBox.error(sMessageText);
    },
    removeStream: function (oEvent, sPropertyPath, oController) {
      var oDeleteButton = oEvent.getSource(),
        oFileWrapper = oDeleteButton.getParent(),
        oContext = oFileWrapper.getBindingContext();

      // streams are removed by assigning the null value
      oContext.setProperty(sPropertyPath, null);
      // When setting the property to null, the uploadUrl (@@MODEL.format) is set to "" by the model
      //	with that another upload is not possible before refreshing the page
      // (refreshing the page would recreate the URL)
      //	This is the workaround:
      //	We set the property to undefined only on the frontend which will recreate the uploadUrl
      oContext.setProperty(sPropertyPath, undefined, null);
      this._callSideEffectsForStream(oEvent, oFileWrapper, oController);

      // Collaboration Draft Activity Sync
      var bCollaborationEnabled = CollaborationActivitySync.isConnected(oDeleteButton);
      var oBinding, sBindingPath;
      if (bCollaborationEnabled) {
        var _oFileWrapper$getAvat, _oFileWrapper$getAvat2;
        oBinding = oContext.getBinding();
        if (!oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
          var oView = CommonUtils.getTargetView(oDeleteButton);
          oBinding = oView.getBindingContext().getBinding();
        }
        var data = [].concat(_toConsumableArray((_oFileWrapper$getAvat = oFileWrapper.getAvatar().getBindingInfo("src")) === null || _oFileWrapper$getAvat === void 0 ? void 0 : _oFileWrapper$getAvat.parts), _toConsumableArray(((_oFileWrapper$getAvat2 = oFileWrapper.getAvatar().getBindingInfo("additionalValue")) === null || _oFileWrapper$getAvat2 === void 0 ? void 0 : _oFileWrapper$getAvat2.parts) || [])).map(function (part) {
          if (part) {
            sBindingPath = part.path;
            return "".concat(oContext.getPath(), "/").concat(sBindingPath);
          }
        });
        CollaborationActivitySync.send(oDeleteButton, Activity.LiveChange, data);
        oBinding.attachEventOnce("patchCompleted", function () {
          CollaborationActivitySync.send(oDeleteButton, Activity.Change, data);
        });
      }
    },
    _callSideEffectsForStream: function (oEvent, oControl, oController) {
      var oFEController = FieldRuntime._getExtensionController(oController);
      if (oControl && oControl.getBindingContext().isTransient()) {
        return;
      }
      if (oControl) {
        oEvent.oSource = oControl;
      }
      oFEController._sideEffects.handleFieldChange(oEvent);
    },
    getIconForMimeType: function (sMimeType) {
      return IconPool.getIconForMimeType(sMimeType);
    },
    /**
     * Method to retrieve text from value list for DataField.
     *
     * @function
     * @name retrieveTextFromValueList
     * @param sPropertyValue The property value of the datafield
     * @param sPropertyFullPath The property full path's
     * @param sDisplayFormat The display format for the datafield
     * @returns The formatted value in corresponding display format.
     */
    retrieveTextFromValueList: function (sPropertyValue, sPropertyFullPath, sDisplayFormat) {
      var sTextProperty;
      var oMetaModel;
      var sPropertyName;
      if (sPropertyValue) {
        oMetaModel = CommonHelper.getMetaModel();
        sPropertyName = oMetaModel.getObject("".concat(sPropertyFullPath, "@sapui.name"));
        return oMetaModel.requestValueListInfo(sPropertyFullPath, true).then(function (mValueListInfo) {
          // take the "" one if exists, otherwise take the first one in the object TODO: to be discussed
          var oValueListInfo = mValueListInfo[mValueListInfo[""] ? "" : Object.keys(mValueListInfo)[0]];
          var oValueListModel = oValueListInfo.$model;
          var oMetaModelValueList = oValueListModel.getMetaModel();
          var oParamWithKey = oValueListInfo.Parameters.find(function (oParameter) {
            return oParameter.LocalDataProperty && oParameter.LocalDataProperty.$PropertyPath === sPropertyName;
          });
          if (oParamWithKey && !oParamWithKey.ValueListProperty) {
            return Promise.reject("Inconsistent value help annotation for ".concat(sPropertyName));
          }
          var oTextAnnotation = oMetaModelValueList.getObject("/".concat(oValueListInfo.CollectionPath, "/").concat(oParamWithKey.ValueListProperty, "@com.sap.vocabularies.Common.v1.Text"));
          if (oTextAnnotation && oTextAnnotation.$Path) {
            sTextProperty = oTextAnnotation.$Path;
            var oFilter = new Filter({
              path: oParamWithKey.ValueListProperty,
              operator: "EQ",
              value1: sPropertyValue
            });
            var oListBinding = oValueListModel.bindList("/".concat(oValueListInfo.CollectionPath), undefined, undefined, oFilter, {
              "$select": sTextProperty
            });
            return oListBinding.requestContexts(0, 2);
          } else {
            sDisplayFormat = "Value";
            return sPropertyValue;
          }
        }).then(function (aContexts) {
          var _aContexts$;
          var sDescription = sTextProperty ? (_aContexts$ = aContexts[0]) === null || _aContexts$ === void 0 ? void 0 : _aContexts$.getObject()[sTextProperty] : "";
          switch (sDisplayFormat) {
            case "Description":
              return sDescription;
            case "DescriptionValue":
              return Core.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT", [sDescription, sPropertyValue]);
            case "ValueDescription":
              return Core.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT", [sPropertyValue, sDescription]);
            default:
              return sPropertyValue;
          }
        }).catch(function (oError) {
          var sMsg = oError.status && oError.status === 404 ? "Metadata not found (".concat(oError.status, ") for value help of property ").concat(sPropertyFullPath) : oError.message;
          Log.error(sMsg);
        });
      }
      return sPropertyValue;
    },
    handleTypeMissmatch: function (oEvent) {
      MessageBox.error(ResourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE"), {
        details: "<p><strong>".concat(ResourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE_DETAILS_SELECTED"), "</strong></p>").concat(oEvent.getParameters().mimeType, "<br><br>") + "<p><strong>".concat(ResourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE_DETAILS_ALLOWED"), "</strong></p>").concat(oEvent.getSource().getMimeType().toString().replaceAll(",", ", ")),
        contentWidth: "150px"
      });
    },
    handleFileSizeExceed: function (oEvent) {
      MessageBox.error(ResourceModel.getText("M_FIELD_FILEUPLOADER_FILE_TOO_BIG", oEvent.getSource().getMaximumFileSize().toFixed(3)), {
        contentWidth: "150px"
      });
    },
    _getExtensionController: function (oController) {
      return oController.isA("sap.fe.core.ExtensionAPI") ? oController._controller : oController;
    }
  };

  /**
   * @global
   */
  return FieldRuntime;
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiRmllbGRSdW50aW1lIiwicmVzZXRDaGFuZ2VzSGFuZGxlciIsInVuZGVmaW5lZCIsInVwbG9hZFByb21pc2VzIiwiZm9ybWF0RHJhZnRPd25lclRleHRJblBvcG92ZXIiLCJiSGFzRHJhZnRFbnRpdHkiLCJzRHJhZnRJblByb2Nlc3NCeVVzZXIiLCJzRHJhZnRMYXN0Q2hhbmdlZEJ5VXNlciIsInNEcmFmdEluUHJvY2Vzc0J5VXNlckRlc2MiLCJzRHJhZnRMYXN0Q2hhbmdlZEJ5VXNlckRlc2MiLCJzVXNlckRlc2NyaXB0aW9uIiwiUmVzb3VyY2VNb2RlbCIsImdldFRleHQiLCJvbkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aCIsIm9Tb3VyY2UiLCJvQ29udHJvbGxlciIsInNTZW1hbnRpY09iamVjdE5hbWUiLCJfcm91dGluZyIsIm9CaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwib1ZpZXciLCJDb21tb25VdGlscyIsImdldFRhcmdldFZpZXciLCJvTWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJmbk5hdmlnYXRlIiwib0NvbnRleHQiLCJuYXZpZ2F0ZVRvVGFyZ2V0IiwiZ2V0Vmlld0RhdGEiLCJjb252ZXJ0ZXJUeXBlIiwiTW9kZWxIZWxwZXIiLCJpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJkcmFmdCIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiRnVuY3Rpb24iLCJwcm90b3R5cGUiLCJnZXRDb250cm9sbGVyIiwiTmF2aWdhdGlvblR5cGUiLCJGb3J3YXJkTmF2aWdhdGlvbiIsIkxvZyIsImVycm9yIiwiaXNEcmFmdEluZGljYXRvclZpc2libGUiLCJzUHJvcGVydHlQYXRoIiwic1NlbWFudGljS2V5SGFzRHJhZnRJbmRpY2F0b3IiLCJIYXNEcmFmdEVudGl0eSIsIklzQWN0aXZlRW50aXR5IiwiaGlkZURyYWZ0SW5mbyIsImhhc1RhcmdldHMiLCJiU2VtYW50aWNPYmplY3RIYXNUYXJnZXRzIiwiZ2V0U3RhdGVEZXBlbmRpbmdPblNlbWFudGljT2JqZWN0VGFyZ2V0cyIsIm9uVmFsaWRhdGVGaWVsZEdyb3VwIiwib0V2ZW50Iiwib0ZFQ29udHJvbGxlciIsIl9nZXRFeHRlbnNpb25Db250cm9sbGVyIiwiX3NpZGVFZmZlY3RzIiwiaGFuZGxlRmllbGRHcm91cENoYW5nZSIsImhhbmRsZUNoYW5nZSIsIm9Tb3VyY2VGaWVsZCIsImdldFNvdXJjZSIsImJJc1RyYW5zaWVudCIsImlzVHJhbnNpZW50IiwicFZhbHVlUmVzb2x2ZWQiLCJnZXRQYXJhbWV0ZXIiLCJQcm9taXNlIiwicmVzb2x2ZSIsImJWYWxpZCIsIm1QYXJhbWV0ZXJzIiwidmFsaWQiLCJGaWVsZEFQSSIsImNhdGNoIiwiX2VkaXRGbG93Iiwic3luY1Rhc2siLCJoYW5kbGVGaWVsZENoYW5nZSIsIm9GaWVsZCIsImJDb2xsYWJvcmF0aW9uRW5hYmxlZCIsIkNvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMiLCJpc0Nvbm5lY3RlZCIsIm9CaW5kaW5nIiwic0JpbmRpbmdQYXRoIiwiZ2V0RmllbGRTdGF0ZU9uQ2hhbmdlIiwic3RhdGUiLCJnZXRCaW5kaW5nIiwiaXNBIiwiZGF0YSIsImdldEJpbmRpbmdJbmZvIiwicGFydHMiLCJtYXAiLCJwYXJ0IiwicGF0aCIsImdldFBhdGgiLCJhdHRhY2hFdmVudE9uY2UiLCJzZW5kIiwiQWN0aXZpdHkiLCJDaGFuZ2UiLCJoYW5kbGVMaXZlQ2hhbmdlIiwic0Z1bGxQYXRoIiwiTGl2ZUNoYW5nZSIsImdldFZhbHVlIiwiVW5kbyIsImRldGFjaEJyb3dzZXJFdmVudCIsImF0dGFjaEJyb3dzZXJFdmVudCIsImhhbmRsZU9wZW5QaWNrZXIiLCJoYW5kbGVDbG9zZVBpY2tlciIsIkRhdGUiLCJ0b0RhdGVTdHJpbmciLCJoYW5kbGVPcGVuVXBsb2FkZXIiLCJnZXRQYXJlbnQiLCJnZXRBdmF0YXIiLCJoYW5kbGVDbG9zZVVwbG9hZGVyIiwibUZpZWxkU3RhdGUiLCJfaXNCaW5kaW5nU3RhdGVNZXNzYWdlcyIsImdldERhdGFTdGF0ZSIsImdldEludmFsaWRWYWx1ZSIsImdldENvbnRlbnQiLCJGaWVsZFdyYXBwZXIiLCJnZXRNZXRhZGF0YSIsImdldE5hbWUiLCJnZXRFZGl0TW9kZSIsImdldENvbnRlbnRFZGl0IiwiYklzVmFsaWQiLCJnZXRNYXhDb25kaXRpb25zIiwib1ZhbHVlQmluZGluZ0luZm8iLCJiaW5kaW5nIiwiZ2V0UHJvcGVydHkiLCJmaWVsZFZhbHVlIiwidmFsaWRpdHkiLCJmaWVsZCIsIl9mbkZpeEhhc2hRdWVyeVN0cmluZyIsInNDdXJyZW50SGFzaCIsImluZGV4T2YiLCJzcGxpdCIsIl9mbkdldExpbmtJbmZvcm1hdGlvbiIsIl9vU291cmNlIiwiX29MaW5rIiwiX3NQcm9wZXJ0eVBhdGgiLCJfc1ZhbHVlIiwiZm5TZXRBY3RpdmUiLCJvTW9kZWwiLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50Iiwib1NoZWxsU2VydmljZUhlbHBlciIsImdldFNoZWxsU2VydmljZXMiLCJwR2V0TGlua3NQcm9taXNlIiwiZ2V0TGlua3NXaXRoQ2FjaGUiLCJzZW1hbnRpY09iamVjdCIsImFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsImdldE9iamVjdCIsIlNlbWFudGljT2JqZWN0TmFtZSIsIlNlbWFudGljT2JqZWN0RnVsbFBhdGgiLCJNZXRhTW9kZWwiLCJJbnRlcm5hbE1vZGVsQ29udGV4dCIsIlNoZWxsU2VydmljZUhlbHBlciIsIkdldExpbmtzUHJvbWlzZSIsIlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiX2ZuUXVpY2tWaWV3SGFzTmV3Q29uZGl0aW9uIiwib1NlbWFudGljT2JqZWN0UGF5bG9hZCIsIl9vTGlua0luZm8iLCJiUmVzdWx0aW5nTmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyIiwiX2ZuUXVpY2tWaWV3U2V0TmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyIiwiX29GaW5hbFNlbWFudGljT2JqZWN0cyIsInNUbXBQYXRoIiwiYVNlbWFudGljT2JqZWN0UGF0aHMiLCJPYmplY3QiLCJrZXlzIiwiaVBhdGhzQ291bnQiLCJfZm5VcGRhdGVTZW1hbnRpY09iamVjdHNUYXJnZXRNb2RlbCIsInNWYWx1ZSIsIm9Db250cm9sIiwiYkFjdGl2ZSIsInNldEFjdGl2ZSIsInNldFRpdGxlQWN0aXZlIiwib0NvbmRpdGlvbmFsV3JhcHBlciIsInNldENvbmRpdGlvbiIsIm9MaW5rSW5mbyIsImdldEhhc2giLCJ1cGRhdGVTZW1hbnRpY1RhcmdldHMiLCJvRmluYWxTZW1hbnRpY09iamVjdHMiLCJvRXJyb3IiLCJfY2hlY2tDb250cm9sSGFzTW9kZWxBbmRCaW5kaW5nQ29udGV4dCIsIl9jb250cm9sIiwiX2NoZWNrQ3VzdG9tRGF0YVZhbHVlQmVmb3JlVXBkYXRpbmdTZW1hbnRpY09iamVjdE1vZGVsIiwicHJvcGVydHlQYXRoIiwiYUN1c3RvbURhdGEiLCJzU2VtYW50aWNPYmplY3RQYXRoVmFsdWUiLCJvVmFsdWVCaW5kaW5nIiwiX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmciLCJzZW1hbnRpY09iamVjdFBhdGhWYWx1ZSIsImZpbHRlciIsImN1c3RvbURhdGEiLCJnZXRLZXkiLCJpbmRleCIsIl9vQ2hhbmdlRXZlbnQiLCJMaW5rTW9kZWxDb250ZXh0Q2hhbmdlIiwic1Byb3BlcnR5Iiwic1BhdGhUb1Byb3BlcnR5IiwiY29udHJvbCIsIm1kY0xpbmsiLCJnZXREZXBlbmRlbnRzIiwibGVuZ3RoIiwiZ2V0Q3VzdG9tRGF0YSIsIm9wZW5FeHRlcm5hbExpbmsiLCJldmVudCIsInNvdXJjZSIsIm9wZW5XaW5kb3ciLCJwcmVzc0xpbmsiLCJvcGVuTGluayIsImdldFRyaWdnZXJIcmVmIiwic0hyZWYiLCJvcGVuIiwib0xpbmsiLCJvU2hlbGxIYXNoIiwicGFyc2VTaGVsbEhhc2giLCJvTmF2QXJncyIsInRhcmdldCIsImFjdGlvbiIsInBhcmFtcyIsIktlZXBBbGl2ZUhlbHBlciIsInN0b3JlQ29udHJvbFJlZnJlc2hTdHJhdGVneUZvckhhc2giLCJpc1N0aWNreUVkaXRNb2RlIiwidG9FeHRlcm5hbCIsImhyZWZGb3JFeHRlcm5hbEFzeW5jIiwic05ld0hyZWYiLCJmaW5kRWxlbWVudHMiLCJlbGVtIiwib0ZpZWxkSW5mbyIsInVwbG9hZFN0cmVhbSIsImNvbnRyb2xsZXIiLCJmaWxlVXBsb2FkZXIiLCJGRUNvbnRyb2xsZXIiLCJmaWxlV3JhcHBlciIsInVwbG9hZFVybCIsImdldFVwbG9hZFVybCIsInNldFVJQnVzeSIsInNldFVwbG9hZFVybCIsInJlbW92ZUFsbEhlYWRlclBhcmFtZXRlcnMiLCJ0b2tlbiIsImdldEh0dHBIZWFkZXJzIiwiaGVhZGVyUGFyYW1ldGVyQ1NSRlRva2VuIiwiRmlsZVVwbG9hZGVyUGFyYW1ldGVyIiwic2V0TmFtZSIsInNldFZhbHVlIiwiYWRkSGVhZGVyUGFyYW1ldGVyIiwiZVRhZyIsImhlYWRlclBhcmFtZXRlckVUYWciLCJoZWFkZXJQYXJhbWV0ZXJBY2NlcHQiLCJ1cGxvYWRQcm9taXNlIiwicmVqZWN0IiwiZ2V0SWQiLCJ1cGxvYWQiLCJNZXNzYWdlQm94IiwiaGFuZGxlVXBsb2FkQ29tcGxldGUiLCJwcm9wZXJ0eUZpbGVOYW1lIiwic3RhdHVzIiwiX2Rpc3BsYXlNZXNzYWdlRm9yRmFpbGVkVXBsb2FkIiwiY29udGV4dCIsIm5ld0VUYWciLCJldGFnIiwic2V0UHJvcGVydHkiLCJfY2FsbFNpZGVFZmZlY3RzRm9yU3RyZWFtIiwic0Vycm9yIiwic01lc3NhZ2VUZXh0IiwiSlNPTiIsInBhcnNlIiwibWVzc2FnZSIsInJlbW92ZVN0cmVhbSIsIm9EZWxldGVCdXR0b24iLCJvRmlsZVdyYXBwZXIiLCJnZXRJY29uRm9yTWltZVR5cGUiLCJzTWltZVR5cGUiLCJJY29uUG9vbCIsInJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QiLCJzUHJvcGVydHlWYWx1ZSIsInNQcm9wZXJ0eUZ1bGxQYXRoIiwic0Rpc3BsYXlGb3JtYXQiLCJzVGV4dFByb3BlcnR5Iiwic1Byb3BlcnR5TmFtZSIsIkNvbW1vbkhlbHBlciIsInJlcXVlc3RWYWx1ZUxpc3RJbmZvIiwibVZhbHVlTGlzdEluZm8iLCJvVmFsdWVMaXN0SW5mbyIsIm9WYWx1ZUxpc3RNb2RlbCIsIiRtb2RlbCIsIm9NZXRhTW9kZWxWYWx1ZUxpc3QiLCJvUGFyYW1XaXRoS2V5IiwiUGFyYW1ldGVycyIsImZpbmQiLCJvUGFyYW1ldGVyIiwiTG9jYWxEYXRhUHJvcGVydHkiLCIkUHJvcGVydHlQYXRoIiwiVmFsdWVMaXN0UHJvcGVydHkiLCJvVGV4dEFubm90YXRpb24iLCJDb2xsZWN0aW9uUGF0aCIsIiRQYXRoIiwib0ZpbHRlciIsIkZpbHRlciIsIm9wZXJhdG9yIiwidmFsdWUxIiwib0xpc3RCaW5kaW5nIiwiYmluZExpc3QiLCJyZXF1ZXN0Q29udGV4dHMiLCJhQ29udGV4dHMiLCJzRGVzY3JpcHRpb24iLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwic01zZyIsImhhbmRsZVR5cGVNaXNzbWF0Y2giLCJkZXRhaWxzIiwiZ2V0UGFyYW1ldGVycyIsIm1pbWVUeXBlIiwiZ2V0TWltZVR5cGUiLCJ0b1N0cmluZyIsInJlcGxhY2VBbGwiLCJjb250ZW50V2lkdGgiLCJoYW5kbGVGaWxlU2l6ZUV4Y2VlZCIsImdldE1heGltdW1GaWxlU2l6ZSIsInRvRml4ZWQiLCJfY29udHJvbGxlciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmllbGRSdW50aW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQWN0aXZpdHlTeW5jXCI7XG5pbXBvcnQgeyBBY3Rpdml0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25Db21tb25cIjtcbmltcG9ydCBkcmFmdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvZWRpdEZsb3cvZHJhZnRcIjtcbmltcG9ydCBGaWVsZFdyYXBwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL0ZpZWxkV3JhcHBlclwiO1xuaW1wb3J0IHR5cGUgRmlsZVdyYXBwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL0ZpbGVXcmFwcGVyXCI7XG5pbXBvcnQgdHlwZSB7IEVuaGFuY2VXaXRoVUk1IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgS2VlcEFsaXZlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0tlZXBBbGl2ZUhlbHBlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgRmllbGRBUEkgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRBUElcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvbWFjcm9zL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBNZXNzYWdlQm94IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgQ3VzdG9tRGF0YSBmcm9tIFwic2FwL3VpL2NvcmUvQ3VzdG9tRGF0YVwiO1xuaW1wb3J0IEljb25Qb29sIGZyb20gXCJzYXAvdWkvY29yZS9JY29uUG9vbFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbGxlciBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBGaWxlVXBsb2FkZXIgZnJvbSBcInNhcC91aS91bmlmaWVkL0ZpbGVVcGxvYWRlclwiO1xuaW1wb3J0IEZpbGVVcGxvYWRlclBhcmFtZXRlciBmcm9tIFwic2FwL3VpL3VuaWZpZWQvRmlsZVVwbG9hZGVyUGFyYW1ldGVyXCI7XG5pbXBvcnQgb3BlbldpbmRvdyBmcm9tIFwic2FwL3VpL3V0aWwvb3BlbldpbmRvd1wiO1xuXG4vKipcbiAqIFN0YXRpYyBjbGFzcyB1c2VkIGJ5IFwic2FwLnVpLm1kYy5GaWVsZFwiIGR1cmluZyBydW50aW1lXG4gKlxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgaW50ZXJuYWwvZXhwZXJpbWVudGFsIHVzZSFcbiAqL1xuY29uc3QgRmllbGRSdW50aW1lID0ge1xuXHRyZXNldENoYW5nZXNIYW5kbGVyOiB1bmRlZmluZWQgYXMgYW55LFxuXHR1cGxvYWRQcm9taXNlczogdW5kZWZpbmVkIGFzIGFueSxcblxuXHRmb3JtYXREcmFmdE93bmVyVGV4dEluUG9wb3ZlcjogZnVuY3Rpb24gKFxuXHRcdGJIYXNEcmFmdEVudGl0eTogYW55LFxuXHRcdHNEcmFmdEluUHJvY2Vzc0J5VXNlcjogYW55LFxuXHRcdHNEcmFmdExhc3RDaGFuZ2VkQnlVc2VyOiBhbnksXG5cdFx0c0RyYWZ0SW5Qcm9jZXNzQnlVc2VyRGVzYzogYW55LFxuXHRcdHNEcmFmdExhc3RDaGFuZ2VkQnlVc2VyRGVzYzogYW55XG5cdCkge1xuXHRcdGlmIChiSGFzRHJhZnRFbnRpdHkpIHtcblx0XHRcdGNvbnN0IHNVc2VyRGVzY3JpcHRpb24gPVxuXHRcdFx0XHRzRHJhZnRJblByb2Nlc3NCeVVzZXJEZXNjIHx8IHNEcmFmdEluUHJvY2Vzc0J5VXNlciB8fCBzRHJhZnRMYXN0Q2hhbmdlZEJ5VXNlckRlc2MgfHwgc0RyYWZ0TGFzdENoYW5nZWRCeVVzZXI7XG5cblx0XHRcdGlmICghc1VzZXJEZXNjcmlwdGlvbikge1xuXHRcdFx0XHRyZXR1cm4gUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9GSUVMRF9SVU5USU1FX0RSQUZUX1BPUE9WRVJfVU5TQVZFRF9DSEFOR0VTX0JZX1VOS05PV05cIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gc0RyYWZ0SW5Qcm9jZXNzQnlVc2VyXG5cdFx0XHRcdFx0PyBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0ZJRUxEX1JVTlRJTUVfRFJBRlRfUE9QT1ZFUl9MT0NLRURfQllfS05PV05cIiwgc1VzZXJEZXNjcmlwdGlvbilcblx0XHRcdFx0XHQ6IFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fRklFTERfUlVOVElNRV9EUkFGVF9QT1BPVkVSX1VOU0FWRURfQ0hBTkdFU19CWV9LTk9XTlwiLCBzVXNlckRlc2NyaXB0aW9uKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fRklFTERfUlVOVElNRV9EUkFGVF9QT1BPVkVSX05PX0RBVEFfVEVYVFwiKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIGFuIGludGVybmFsIG5hdmlnYXRpb24gb24gdGhlIGxpbmsgcGVydGFpbmluZyB0byBEYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBvU291cmNlIFNvdXJjZSBvZiB0aGUgcHJlc3MgZXZlbnRcblx0ICogQHBhcmFtIG9Db250cm9sbGVyIEluc3RhbmNlIG9mIHRoZSBjb250cm9sbGVyXG5cdCAqIEBwYXJhbSBzU2VtYW50aWNPYmplY3ROYW1lIFNlbWFudGljIG9iamVjdCBuYW1lXG5cdCAqL1xuXHRvbkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDogZnVuY3Rpb24gKG9Tb3VyY2U6IENvbnRyb2wsIG9Db250cm9sbGVyOiBQYWdlQ29udHJvbGxlciwgc1NlbWFudGljT2JqZWN0TmFtZTogc3RyaW5nKSB7XG5cdFx0aWYgKG9Db250cm9sbGVyLl9yb3V0aW5nKSB7XG5cdFx0XHRsZXQgb0JpbmRpbmdDb250ZXh0ID0gb1NvdXJjZS5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQ7XG5cdFx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob1NvdXJjZSksXG5cdFx0XHRcdG9NZXRhTW9kZWwgPSBvQmluZGluZ0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdFx0Zm5OYXZpZ2F0ZSA9IGZ1bmN0aW9uIChvQ29udGV4dD86IGFueSkge1xuXHRcdFx0XHRcdGlmIChvQ29udGV4dCkge1xuXHRcdFx0XHRcdFx0b0JpbmRpbmdDb250ZXh0ID0gb0NvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9Db250cm9sbGVyLl9yb3V0aW5nLm5hdmlnYXRlVG9UYXJnZXQob0JpbmRpbmdDb250ZXh0LCBzU2VtYW50aWNPYmplY3ROYW1lLCB1bmRlZmluZWQsIHRydWUpO1xuXHRcdFx0XHR9O1xuXHRcdFx0Ly8gU2hvdyBkcmFmdCBsb3NzIGNvbmZpcm1hdGlvbiBkaWFsb2cgaW4gY2FzZSBvZiBPYmplY3QgcGFnZVxuXHRcdFx0aWYgKG9WaWV3LmdldFZpZXdEYXRhKCkuY29udmVydGVyVHlwZSA9PT0gXCJPYmplY3RQYWdlXCIgJiYgIU1vZGVsSGVscGVyLmlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZChvTWV0YU1vZGVsKSkge1xuXHRcdFx0XHRkcmFmdC5wcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbihcblx0XHRcdFx0XHRmbk5hdmlnYXRlLFxuXHRcdFx0XHRcdEZ1bmN0aW9uLnByb3RvdHlwZSxcblx0XHRcdFx0XHRvQmluZGluZ0NvbnRleHQsXG5cdFx0XHRcdFx0b1ZpZXcuZ2V0Q29udHJvbGxlcigpLFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0ZHJhZnQuTmF2aWdhdGlvblR5cGUuRm9yd2FyZE5hdmlnYXRpb25cblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGZuTmF2aWdhdGUoKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLmVycm9yKFxuXHRcdFx0XHRcIkZpZWxkUnVudGltZTogTm8gcm91dGluZyBsaXN0ZW5lciBjb250cm9sbGVyIGV4dGVuc2lvbiBmb3VuZC4gSW50ZXJuYWwgbmF2aWdhdGlvbiBhYm9ydGVkLlwiLFxuXHRcdFx0XHRcInNhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRSdW50aW1lXCIsXG5cdFx0XHRcdFwib25EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGhcIlxuXHRcdFx0KTtcblx0XHR9XG5cdH0sXG5cdGlzRHJhZnRJbmRpY2F0b3JWaXNpYmxlOiBmdW5jdGlvbiAoXG5cdFx0c1Byb3BlcnR5UGF0aDogYW55LFxuXHRcdHNTZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yOiBhbnksXG5cdFx0SGFzRHJhZnRFbnRpdHk6IGFueSxcblx0XHRJc0FjdGl2ZUVudGl0eTogYW55LFxuXHRcdGhpZGVEcmFmdEluZm86IGFueVxuXHQpIHtcblx0XHRpZiAoSXNBY3RpdmVFbnRpdHkgIT09IHVuZGVmaW5lZCAmJiBIYXNEcmFmdEVudGl0eSAhPT0gdW5kZWZpbmVkICYmICghSXNBY3RpdmVFbnRpdHkgfHwgSGFzRHJhZnRFbnRpdHkpICYmICFoaWRlRHJhZnRJbmZvKSB7XG5cdFx0XHRyZXR1cm4gc1Byb3BlcnR5UGF0aCA9PT0gc1NlbWFudGljS2V5SGFzRHJhZnRJbmRpY2F0b3I7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdGhhc1RhcmdldHM6IGZ1bmN0aW9uIChiU2VtYW50aWNPYmplY3RIYXNUYXJnZXRzOiBhbnkgLypzU2VtYW50aWNPYmplY3RQYXRoVmFsdWU6IGFueSovKSB7XG5cdFx0cmV0dXJuIGJTZW1hbnRpY09iamVjdEhhc1RhcmdldHMgPyBiU2VtYW50aWNPYmplY3RIYXNUYXJnZXRzIDogZmFsc2U7XG5cdH0sXG5cdGdldFN0YXRlRGVwZW5kaW5nT25TZW1hbnRpY09iamVjdFRhcmdldHM6IGZ1bmN0aW9uIChiU2VtYW50aWNPYmplY3RIYXNUYXJnZXRzOiBhbnkgLypzU2VtYW50aWNPYmplY3RQYXRoVmFsdWU6IGFueSovKSB7XG5cdFx0cmV0dXJuIGJTZW1hbnRpY09iamVjdEhhc1RhcmdldHMgPyBcIkluZm9ybWF0aW9uXCIgOiBcIk5vbmVcIjtcblx0fSxcblx0LyoqXG5cdCAqIEhhbmRsZXIgZm9yIHRoZSB2YWxpZGF0ZUZpZWxkR3JvdXAgZXZlbnQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBvblZhbGlkYXRlRmllbGRHcm91cFxuXHQgKiBAcGFyYW0gb0NvbnRyb2xsZXIgVGhlIGNvbnRyb2xsZXIgb2YgdGhlIHBhZ2UgY29udGFpbmluZyB0aGUgZmllbGRcblx0ICogQHBhcmFtIG9FdmVudCBUaGUgZXZlbnQgb2JqZWN0IHBhc3NlZCBieSB0aGUgdmFsaWRhdGVGaWVsZEdyb3VwIGV2ZW50XG5cdCAqL1xuXHRvblZhbGlkYXRlRmllbGRHcm91cDogZnVuY3Rpb24gKG9Db250cm9sbGVyOiBvYmplY3QsIG9FdmVudDogb2JqZWN0KSB7XG5cdFx0Y29uc3Qgb0ZFQ29udHJvbGxlciA9IEZpZWxkUnVudGltZS5fZ2V0RXh0ZW5zaW9uQ29udHJvbGxlcihvQ29udHJvbGxlcik7XG5cdFx0b0ZFQ29udHJvbGxlci5fc2lkZUVmZmVjdHMuaGFuZGxlRmllbGRHcm91cENoYW5nZShvRXZlbnQpO1xuXHR9LFxuXHQvKipcblx0ICogSGFuZGxlciBmb3IgdGhlIGNoYW5nZSBldmVudC5cblx0ICogU3RvcmUgZmllbGQgZ3JvdXAgSURzIG9mIHRoaXMgZmllbGQgZm9yIHJlcXVlc3Rpbmcgc2lkZSBlZmZlY3RzIHdoZW4gcmVxdWlyZWQuXG5cdCAqIFdlIHN0b3JlIHRoZW0gaGVyZSB0byBlbnN1cmUgYSBjaGFuZ2UgaW4gdGhlIHZhbHVlIG9mIHRoZSBmaWVsZCBoYXMgdGFrZW4gcGxhY2UuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBoYW5kbGVDaGFuZ2Vcblx0ICogQHBhcmFtIG9Db250cm9sbGVyIFRoZSBjb250cm9sbGVyIG9mIHRoZSBwYWdlIGNvbnRhaW5pbmcgdGhlIGZpZWxkXG5cdCAqIEBwYXJhbSBvRXZlbnQgVGhlIGV2ZW50IG9iamVjdCBwYXNzZWQgYnkgdGhlIGNoYW5nZSBldmVudFxuXHQgKi9cblx0aGFuZGxlQ2hhbmdlOiBmdW5jdGlvbiAob0NvbnRyb2xsZXI6IG9iamVjdCwgb0V2ZW50OiBFdmVudCkge1xuXHRcdGNvbnN0IG9Tb3VyY2VGaWVsZCA9IG9FdmVudC5nZXRTb3VyY2UoKSBhcyBDb250cm9sLFxuXHRcdFx0YklzVHJhbnNpZW50ID0gb1NvdXJjZUZpZWxkICYmIChvU291cmNlRmllbGQuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBhbnkpLmlzVHJhbnNpZW50KCksXG5cdFx0XHRwVmFsdWVSZXNvbHZlZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJwcm9taXNlXCIpIHx8IFByb21pc2UucmVzb2x2ZSgpLFxuXHRcdFx0b1NvdXJjZSA9IG9FdmVudC5nZXRTb3VyY2UoKSxcblx0XHRcdGJWYWxpZCA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2YWxpZFwiKTtcblxuXHRcdC8vIFRPRE86IGN1cnJlbnRseSB3ZSBoYXZlIHVuZGVmaW5lZCBhbmQgdHJ1ZS4uLiBhbmQgb3VyIGNyZWF0aW9uIHJvdyBpbXBsZW1lbnRhdGlvbiByZWxpZXMgb24gdGhpcy5cblx0XHQvLyBJIHdvdWxkIG1vdmUgdGhpcyBsb2dpYyB0byB0aGlzIHBsYWNlIGFzIGl0J3MgaGFyZCB0byB1bmRlcnN0YW5kIGZvciBmaWVsZCBjb25zdW1lclxuXG5cdFx0cFZhbHVlUmVzb2x2ZWRcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Ly8gVGhlIGV2ZW50IGlzIGdvbmUuIEZvciBub3cgd2UnbGwganVzdCByZWNyZWF0ZSBpdCBhZ2FpblxuXHRcdFx0XHQob0V2ZW50IGFzIGFueSkub1NvdXJjZSA9IG9Tb3VyY2U7XG5cdFx0XHRcdChvRXZlbnQgYXMgYW55KS5tUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0XHR2YWxpZDogYlZhbGlkXG5cdFx0XHRcdH07XG5cdFx0XHRcdChGaWVsZEFQSSBhcyBhbnkpLmhhbmRsZUNoYW5nZShvRXZlbnQsIG9Db250cm9sbGVyKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKC8qb0Vycm9yOiBhbnkqLykge1xuXHRcdFx0XHQvLyBUaGUgZXZlbnQgaXMgZ29uZS4gRm9yIG5vdyB3ZSdsbCBqdXN0IHJlY3JlYXRlIGl0IGFnYWluXG5cdFx0XHRcdChvRXZlbnQgYXMgYW55KS5vU291cmNlID0gb1NvdXJjZTtcblx0XHRcdFx0KG9FdmVudCBhcyBhbnkpLm1QYXJhbWV0ZXJzID0ge1xuXHRcdFx0XHRcdHZhbGlkOiBmYWxzZVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdC8vIGFzIHRoZSBVSSBtaWdodCBuZWVkIHRvIHJlYWN0IG9uLiBXZSBjb3VsZCBwcm92aWRlIGEgcGFyYW1ldGVyIHRvIGluZm9ybSBpZiB2YWxpZGF0aW9uXG5cdFx0XHRcdC8vIHdhcyBzdWNjZXNzZnVsP1xuXHRcdFx0XHQoRmllbGRBUEkgYXMgYW55KS5oYW5kbGVDaGFuZ2Uob0V2ZW50LCBvQ29udHJvbGxlcik7XG5cdFx0XHR9KTtcblxuXHRcdC8vIFVzZSB0aGUgRkUgQ29udHJvbGxlciBpbnN0ZWFkIG9mIHRoZSBleHRlbnNpb25BUEkgdG8gYWNjZXNzIGludGVybmFsIEZFIGNvbnRyb2xsZXJzXG5cdFx0Y29uc3Qgb0ZFQ29udHJvbGxlciA9IEZpZWxkUnVudGltZS5fZ2V0RXh0ZW5zaW9uQ29udHJvbGxlcihvQ29udHJvbGxlcik7XG5cblx0XHRvRkVDb250cm9sbGVyLl9lZGl0Rmxvdy5zeW5jVGFzayhwVmFsdWVSZXNvbHZlZCk7XG5cblx0XHQvLyBpZiB0aGUgY29udGV4dCBpcyB0cmFuc2llbnQsIGl0IG1lYW5zIHRoZSByZXF1ZXN0IHdvdWxkIGZhaWwgYW55d2F5IGFzIHRoZSByZWNvcmQgZG9lcyBub3QgZXhpc3QgaW4gcmVhbGl0eVxuXHRcdC8vIFRPRE86IHNob3VsZCB0aGUgcmVxdWVzdCBiZSBtYWRlIGluIGZ1dHVyZSBpZiB0aGUgY29udGV4dCBpcyB0cmFuc2llbnQ/XG5cdFx0aWYgKGJJc1RyYW5zaWVudCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdC8vIFNJREUgRUZGRUNUU1xuXHRcdG9GRUNvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLmhhbmRsZUZpZWxkQ2hhbmdlKG9FdmVudCwgcFZhbHVlUmVzb2x2ZWQpO1xuXG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3Qgb0ZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2wsXG5cdFx0XHRiQ29sbGFib3JhdGlvbkVuYWJsZWQgPSBDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLmlzQ29ubmVjdGVkKG9GaWVsZCk7XG5cdFx0bGV0IG9CaW5kaW5nLCBzQmluZGluZ1BhdGg7XG5cdFx0aWYgKGJDb2xsYWJvcmF0aW9uRW5hYmxlZCAmJiB0aGlzLmdldEZpZWxkU3RhdGVPbkNoYW5nZShvRXZlbnQpLnN0YXRlW1widmFsaWRpdHlcIl0pIHtcblx0XHRcdC8qIFRPRE86IGZvciBub3cgd2UgdXNlIGFsd2F5cyB0aGUgZmlyc3QgYmluZGluZyBwYXJ0IChzbyBpbiBjYXNlIG9mIGNvbXBvc2l0ZSBiaW5kaW5ncyBsaWtlIGFtb3VudCBhbmRcblx0XHRcdFx0XHR1bml0IG9yIGN1cnJlbmN5IG9ubHkgdGhlIGFtb3VudCBpcyBjb25zaWRlcmVkKSAqL1xuXHRcdFx0b0JpbmRpbmcgPSAob0ZpZWxkLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgYW55KS5nZXRCaW5kaW5nKCk7XG5cdFx0XHRpZiAoIW9CaW5kaW5nLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpKSB7XG5cdFx0XHRcdGNvbnN0IG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvRmllbGQpO1xuXHRcdFx0XHRvQmluZGluZyA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0QmluZGluZygpO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBkYXRhID0gW1xuXHRcdFx0XHQuLi4ob0ZpZWxkLmdldEJpbmRpbmdJbmZvKFwidmFsdWVcIikgYXMgYW55KT8ucGFydHMsXG5cdFx0XHRcdC4uLigob0ZpZWxkLmdldEJpbmRpbmdJbmZvKFwiYWRkaXRpb25hbFZhbHVlXCIpIGFzIGFueSk/LnBhcnRzIHx8IFtdKVxuXHRcdFx0XS5tYXAoZnVuY3Rpb24gKHBhcnQ6IGFueSkge1xuXHRcdFx0XHRpZiAocGFydCkge1xuXHRcdFx0XHRcdHNCaW5kaW5nUGF0aCA9IHBhcnQucGF0aDtcblx0XHRcdFx0XHRyZXR1cm4gYCR7b0ZpZWxkLmdldEJpbmRpbmdDb250ZXh0KCk/LmdldFBhdGgoKX0vJHtzQmluZGluZ1BhdGh9YDtcblx0XHRcdFx0fVxuXHRcdFx0fSkgYXMgW107XG5cdFx0XHRvQmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJwYXRjaENvbXBsZXRlZFwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChvRmllbGQsIEFjdGl2aXR5LkNoYW5nZSwgZGF0YSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0aGFuZGxlTGl2ZUNoYW5nZTogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3Qgb0ZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpLFxuXHRcdFx0YkNvbGxhYm9yYXRpb25FbmFibGVkID0gQ29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5pc0Nvbm5lY3RlZChvRmllbGQpO1xuXG5cdFx0aWYgKGJDb2xsYWJvcmF0aW9uRW5hYmxlZCkge1xuXHRcdFx0LyogVE9ETzogZm9yIG5vdyB3ZSB1c2UgYWx3YXlzIHRoZSBmaXJzdCBiaW5kaW5nIHBhcnQgKHNvIGluIGNhc2Ugb2YgY29tcG9zaXRlIGJpbmRpbmdzIGxpa2UgYW1vdW50IGFuZFxuXHRcdFx0XHRcdHVuaXQgb3IgY3VycmVuY3kgb25seSB0aGUgYW1vdW50IGlzIGNvbnNpZGVyZWQpICovXG5cdFx0XHRjb25zdCBzQmluZGluZ1BhdGggPSBvRmllbGQuZ2V0QmluZGluZ0luZm8oXCJ2YWx1ZVwiKS5wYXJ0c1swXS5wYXRoO1xuXHRcdFx0Y29uc3Qgc0Z1bGxQYXRoID0gYCR7b0ZpZWxkLmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0UGF0aCgpfS8ke3NCaW5kaW5nUGF0aH1gO1xuXHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKG9GaWVsZCwgQWN0aXZpdHkuTGl2ZUNoYW5nZSwgc0Z1bGxQYXRoKTtcblxuXHRcdFx0Ly8gSWYgdGhlIHVzZXIgcmV2ZXJ0ZWQgdGhlIGNoYW5nZSBubyBjaGFuZ2UgZXZlbnQgaXMgc2VudCB0aGVyZWZvcmUgd2UgaGF2ZSB0byBoYW5kbGUgaXQgaGVyZVxuXHRcdFx0aWYgKCF0aGlzLnJlc2V0Q2hhbmdlc0hhbmRsZXIpIHtcblx0XHRcdFx0dGhpcy5yZXNldENoYW5nZXNIYW5kbGVyID0gKCkgPT4ge1xuXHRcdFx0XHRcdGlmIChvRmllbGQuZ2V0VmFsdWUoKSA9PT0gb0ZpZWxkLmdldEJpbmRpbmcoXCJ2YWx1ZVwiKS5nZXRWYWx1ZSgpKSB7XG5cdFx0XHRcdFx0XHQvLyB0aGUgdXNlciBkaWQgYSBjaGFuZ2UgYnV0IHJldmVydGVkIGl0LiB0byBiZSBjaGVja2VkIGlmIHRoZXJlIGlzIGEgYmV0dGVyIHdheSB0byBkZXRlcm1pbmVcblx0XHRcdFx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChvRmllbGQsIEFjdGl2aXR5LlVuZG8sIHNGdWxsUGF0aCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9GaWVsZC5kZXRhY2hCcm93c2VyRXZlbnQoXCJmb2N1c291dFwiLCB0aGlzLnJlc2V0Q2hhbmdlc0hhbmRsZXIpO1xuXHRcdFx0XHRcdGRlbGV0ZSB0aGlzLnJlc2V0Q2hhbmdlc0hhbmRsZXI7XG5cdFx0XHRcdH07XG5cdFx0XHRcdG9GaWVsZC5hdHRhY2hCcm93c2VyRXZlbnQoXCJmb2N1c291dFwiLCB0aGlzLnJlc2V0Q2hhbmdlc0hhbmRsZXIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0aGFuZGxlT3BlblBpY2tlcjogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3Qgb0ZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpLFxuXHRcdFx0YkNvbGxhYm9yYXRpb25FbmFibGVkID0gQ29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5pc0Nvbm5lY3RlZChvRmllbGQpO1xuXG5cdFx0aWYgKGJDb2xsYWJvcmF0aW9uRW5hYmxlZCkge1xuXHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gb0ZpZWxkLmdldEJpbmRpbmdJbmZvKFwidmFsdWVcIikucGFydHNbMF0ucGF0aDtcblx0XHRcdGNvbnN0IHNGdWxsUGF0aCA9IGAke29GaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKX0vJHtzQmluZGluZ1BhdGh9YDtcblx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChvRmllbGQsIEFjdGl2aXR5LkxpdmVDaGFuZ2UsIHNGdWxsUGF0aCk7XG5cdFx0fVxuXHR9LFxuXHRoYW5kbGVDbG9zZVBpY2tlcjogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3Qgb0ZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpLFxuXHRcdFx0YkNvbGxhYm9yYXRpb25FbmFibGVkID0gQ29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5pc0Nvbm5lY3RlZChvRmllbGQpO1xuXG5cdFx0aWYgKGJDb2xsYWJvcmF0aW9uRW5hYmxlZCkge1xuXHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gb0ZpZWxkLmdldEJpbmRpbmdJbmZvKFwidmFsdWVcIikucGFydHNbMF0ucGF0aDtcblx0XHRcdGNvbnN0IHNGdWxsUGF0aCA9IGAke29GaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKX0vJHtzQmluZGluZ1BhdGh9YDtcblx0XHRcdGlmIChuZXcgRGF0ZShvRmllbGQuZ2V0VmFsdWUoKSkudG9EYXRlU3RyaW5nKCkgPT09IG5ldyBEYXRlKG9GaWVsZC5nZXRCaW5kaW5nKFwidmFsdWVcIikuZ2V0VmFsdWUoKSB8fCBcIlwiKS50b0RhdGVTdHJpbmcoKSkge1xuXHRcdFx0XHQvLyB0aGUgdXNlciBkaWQgYSBjaGFuZ2UgYnV0IHJldmVydGVkIGl0LiB0byBiZSBjaGVja2VkIGlmIHRoZXJlIGlzIGEgYmV0dGVyIHdheSB0byBkZXRlcm1pbmVcblx0XHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKG9GaWVsZCwgQWN0aXZpdHkuVW5kbywgc0Z1bGxQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGhhbmRsZU9wZW5VcGxvYWRlcjogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0Ly8gQ29sbGFib3JhdGlvbiBEcmFmdCBBY3Rpdml0eSBTeW5jXG5cdFx0Y29uc3Qgb0ZpZWxkID0gb0V2ZW50LmdldFNvdXJjZSgpLFxuXHRcdFx0YkNvbGxhYm9yYXRpb25FbmFibGVkID0gQ29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5pc0Nvbm5lY3RlZChvRmllbGQpO1xuXG5cdFx0aWYgKGJDb2xsYWJvcmF0aW9uRW5hYmxlZCkge1xuXHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID0gb0ZpZWxkLmdldFBhcmVudCgpLmdldEF2YXRhcigpLmdldEJpbmRpbmdJbmZvKFwic3JjXCIpLnBhcnRzWzBdLnBhdGg7XG5cdFx0XHRjb25zdCBzRnVsbFBhdGggPSBgJHtvRmllbGQuZ2V0QmluZGluZ0NvbnRleHQoKT8uZ2V0UGF0aCgpfS8ke3NCaW5kaW5nUGF0aH1gO1xuXHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKG9GaWVsZCwgQWN0aXZpdHkuTGl2ZUNoYW5nZSwgc0Z1bGxQYXRoKTtcblx0XHR9XG5cdH0sXG5cdGhhbmRsZUNsb3NlVXBsb2FkZXI6IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSkge1xuXHRcdC8vIENvbGxhYm9yYXRpb24gRHJhZnQgQWN0aXZpdHkgU3luY1xuXHRcdGNvbnN0IG9GaWVsZCA9IG9FdmVudC5nZXRTb3VyY2UoKSxcblx0XHRcdGJDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQob0ZpZWxkKTtcblx0XHRpZiAoYkNvbGxhYm9yYXRpb25FbmFibGVkKSB7XG5cdFx0XHRjb25zdCBzQmluZGluZ1BhdGggPSBvRmllbGQuZ2V0UGFyZW50KCkuZ2V0QXZhdGFyKCkuZ2V0QmluZGluZ0luZm8oXCJzcmNcIikucGFydHNbMF0ucGF0aDtcblx0XHRcdGNvbnN0IHNGdWxsUGF0aCA9IGAke29GaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCl9LyR7c0JpbmRpbmdQYXRofWA7XG5cdFx0XHRDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLnNlbmQob0ZpZWxkLCBBY3Rpdml0eS5VbmRvLCBzRnVsbFBhdGgpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogR2V0cyB0aGUgZmllbGQgdmFsdWUgYW5kIHZhbGlkaXR5IG9uIGEgY2hhbmdlIGV2ZW50LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZmllbGRWYWxpZGl0eU9uQ2hhbmdlXG5cdCAqIEBwYXJhbSBvRXZlbnQgVGhlIGV2ZW50IG9iamVjdCBwYXNzZWQgYnkgdGhlIGNoYW5nZSBldmVudFxuXHQgKiBAcmV0dXJucyBGaWVsZCB2YWx1ZSBhbmQgdmFsaWRpdHlcblx0ICovXG5cdGdldEZpZWxkU3RhdGVPbkNoYW5nZTogZnVuY3Rpb24gKG9FdmVudDogRXZlbnQpOiBhbnkge1xuXHRcdGxldCBvU291cmNlRmllbGQgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgYW55LFxuXHRcdFx0bUZpZWxkU3RhdGUgPSB7fTtcblx0XHRjb25zdCBfaXNCaW5kaW5nU3RhdGVNZXNzYWdlcyA9IGZ1bmN0aW9uIChvQmluZGluZzogYW55KSB7XG5cdFx0XHRyZXR1cm4gb0JpbmRpbmcgJiYgb0JpbmRpbmcuZ2V0RGF0YVN0YXRlKCkgPyBvQmluZGluZy5nZXREYXRhU3RhdGUoKS5nZXRJbnZhbGlkVmFsdWUoKSA9PT0gdW5kZWZpbmVkIDogdHJ1ZTtcblx0XHR9O1xuXHRcdGlmIChvU291cmNlRmllbGQuaXNBKFwic2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEFQSVwiKSkge1xuXHRcdFx0b1NvdXJjZUZpZWxkID0gKG9Tb3VyY2VGaWVsZCBhcyBFbmhhbmNlV2l0aFVJNTxGaWVsZEFQST4pLmdldENvbnRlbnQoKTtcblx0XHR9XG5cblx0XHRpZiAob1NvdXJjZUZpZWxkLmlzQShGaWVsZFdyYXBwZXIuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCkpICYmIG9Tb3VyY2VGaWVsZC5nZXRFZGl0TW9kZSgpID09PSBcIkVkaXRhYmxlXCIpIHtcblx0XHRcdG9Tb3VyY2VGaWVsZCA9IG9Tb3VyY2VGaWVsZC5nZXRDb250ZW50RWRpdCgpWzBdO1xuXHRcdH1cblxuXHRcdGlmIChvU291cmNlRmllbGQuaXNBKFwic2FwLnVpLm1kYy5GaWVsZFwiKSkge1xuXHRcdFx0bGV0IGJJc1ZhbGlkID0gb0V2ZW50LmdldFBhcmFtZXRlcihcInZhbGlkXCIpIHx8IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJpc1ZhbGlkXCIpO1xuXHRcdFx0aWYgKGJJc1ZhbGlkID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0aWYgKG9Tb3VyY2VGaWVsZC5nZXRNYXhDb25kaXRpb25zKCkgPT09IDEpIHtcblx0XHRcdFx0XHRjb25zdCBvVmFsdWVCaW5kaW5nSW5mbyA9IG9Tb3VyY2VGaWVsZC5nZXRCaW5kaW5nSW5mbyhcInZhbHVlXCIpO1xuXHRcdFx0XHRcdGJJc1ZhbGlkID0gX2lzQmluZGluZ1N0YXRlTWVzc2FnZXMob1ZhbHVlQmluZGluZ0luZm8gJiYgb1ZhbHVlQmluZGluZ0luZm8uYmluZGluZyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9Tb3VyY2VGaWVsZC5nZXRWYWx1ZSgpID09PSBcIlwiICYmICFvU291cmNlRmllbGQuZ2V0UHJvcGVydHkoXCJyZXF1aXJlZFwiKSkge1xuXHRcdFx0XHRcdGJJc1ZhbGlkID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0bUZpZWxkU3RhdGUgPSB7XG5cdFx0XHRcdGZpZWxkVmFsdWU6IG9Tb3VyY2VGaWVsZC5nZXRWYWx1ZSgpLFxuXHRcdFx0XHR2YWxpZGl0eTogISFiSXNWYWxpZFxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gb1NvdXJjZUZpZWxkIGV4dGVuZHMgZnJvbSBhIEZpbGVVcGxvYWRlciB8fCBJbnB1dCB8fCBpcyBhIENoZWNrQm94XG5cdFx0XHRjb25zdCBvQmluZGluZyA9XG5cdFx0XHRcdG9Tb3VyY2VGaWVsZC5nZXRCaW5kaW5nKFwidXBsb2FkVXJsXCIpIHx8IG9Tb3VyY2VGaWVsZC5nZXRCaW5kaW5nKFwidmFsdWVcIikgfHwgb1NvdXJjZUZpZWxkLmdldEJpbmRpbmcoXCJzZWxlY3RlZFwiKTtcblx0XHRcdG1GaWVsZFN0YXRlID0ge1xuXHRcdFx0XHRmaWVsZFZhbHVlOiBvQmluZGluZyAmJiBvQmluZGluZy5nZXRWYWx1ZSgpLFxuXHRcdFx0XHR2YWxpZGl0eTogX2lzQmluZGluZ1N0YXRlTWVzc2FnZXMob0JpbmRpbmcpXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0ZmllbGQ6IG9Tb3VyY2VGaWVsZCxcblx0XHRcdHN0YXRlOiBtRmllbGRTdGF0ZVxuXHRcdH07XG5cdH0sXG5cdF9mbkZpeEhhc2hRdWVyeVN0cmluZzogZnVuY3Rpb24gKHNDdXJyZW50SGFzaDogYW55KSB7XG5cdFx0aWYgKHNDdXJyZW50SGFzaCAmJiBzQ3VycmVudEhhc2guaW5kZXhPZihcIj9cIikgIT09IC0xKSB7XG5cdFx0XHQvLyBzQ3VycmVudEhhc2ggY2FuIGNvbnRhaW4gcXVlcnkgc3RyaW5nLCBjdXQgaXQgb2ZmIVxuXHRcdFx0c0N1cnJlbnRIYXNoID0gc0N1cnJlbnRIYXNoLnNwbGl0KFwiP1wiKVswXTtcblx0XHR9XG5cdFx0cmV0dXJuIHNDdXJyZW50SGFzaDtcblx0fSxcblx0X2ZuR2V0TGlua0luZm9ybWF0aW9uOiBmdW5jdGlvbiAoX29Tb3VyY2U6IGFueSwgX29MaW5rOiBhbnksIF9zUHJvcGVydHlQYXRoOiBhbnksIF9zVmFsdWU6IGFueSwgZm5TZXRBY3RpdmU6IGFueSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IF9vTGluayAmJiBfb0xpbmsuZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsICYmIG9Nb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBzU2VtYW50aWNPYmplY3ROYW1lID0gX3NWYWx1ZSB8fCAoX29Tb3VyY2UgJiYgX29Tb3VyY2UuZ2V0VmFsdWUoKSk7XG5cdFx0Y29uc3Qgb1ZpZXcgPSBfb0xpbmsgJiYgQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0Vmlldyhfb0xpbmspO1xuXHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9WaWV3ICYmIG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IG9WaWV3ICYmIENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvVmlldyk7XG5cdFx0Y29uc3Qgb1NoZWxsU2VydmljZUhlbHBlciA9IG9BcHBDb21wb25lbnQgJiYgb0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdFx0Y29uc3QgcEdldExpbmtzUHJvbWlzZSA9IG9TaGVsbFNlcnZpY2VIZWxwZXIgJiYgb1NoZWxsU2VydmljZUhlbHBlci5nZXRMaW5rc1dpdGhDYWNoZShbW3sgc2VtYW50aWNPYmplY3Q6IHNTZW1hbnRpY09iamVjdE5hbWUgfV1dKTtcblx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPVxuXHRcdFx0b01ldGFNb2RlbCAmJiBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtfc1Byb3BlcnR5UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zYCk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdFNlbWFudGljT2JqZWN0TmFtZTogc1NlbWFudGljT2JqZWN0TmFtZSxcblx0XHRcdFNlbWFudGljT2JqZWN0RnVsbFBhdGg6IF9zUHJvcGVydHlQYXRoLCAvL3NTZW1hbnRpY09iamVjdEZ1bGxQYXRoLFxuXHRcdFx0TWV0YU1vZGVsOiBvTWV0YU1vZGVsLFxuXHRcdFx0SW50ZXJuYWxNb2RlbENvbnRleHQ6IG9JbnRlcm5hbE1vZGVsQ29udGV4dCxcblx0XHRcdFNoZWxsU2VydmljZUhlbHBlcjogb1NoZWxsU2VydmljZUhlbHBlcixcblx0XHRcdEdldExpbmtzUHJvbWlzZTogcEdldExpbmtzUHJvbWlzZSxcblx0XHRcdFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMsXG5cdFx0XHRmblNldEFjdGl2ZTogZm5TZXRBY3RpdmVcblx0XHR9O1xuXHR9LFxuXHRfZm5RdWlja1ZpZXdIYXNOZXdDb25kaXRpb246IGZ1bmN0aW9uIChvU2VtYW50aWNPYmplY3RQYXlsb2FkOiBhbnksIF9vTGlua0luZm86IGFueSkge1xuXHRcdGlmIChvU2VtYW50aWNPYmplY3RQYXlsb2FkICYmIG9TZW1hbnRpY09iamVjdFBheWxvYWQucGF0aCAmJiBvU2VtYW50aWNPYmplY3RQYXlsb2FkLnBhdGggPT09IF9vTGlua0luZm8uU2VtYW50aWNPYmplY3RGdWxsUGF0aCkge1xuXHRcdFx0Ly8gR290IHRoZSByZXNvbHZlZCBTZW1hbnRpYyBPYmplY3QhXG5cdFx0XHRjb25zdCBiUmVzdWx0aW5nTmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyID1cblx0XHRcdFx0b1NlbWFudGljT2JqZWN0UGF5bG9hZFshX29MaW5rSW5mby5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA/IFwiSGFzVGFyZ2V0c05vdEZpbHRlcmVkXCIgOiBcIkhhc1RhcmdldHNcIl07XG5cdFx0XHRfb0xpbmtJbmZvLmZuU2V0QWN0aXZlKCEhYlJlc3VsdGluZ05ld0NvbmRpdGlvbkZvckNvbmRpdGlvbmFsV3JhcHBlcik7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblx0X2ZuUXVpY2tWaWV3U2V0TmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyOiBmdW5jdGlvbiAoX29MaW5rSW5mbzogYW55LCBfb0ZpbmFsU2VtYW50aWNPYmplY3RzOiBhbnkpIHtcblx0XHRpZiAoX29GaW5hbFNlbWFudGljT2JqZWN0c1tfb0xpbmtJbmZvLlNlbWFudGljT2JqZWN0TmFtZV0pIHtcblx0XHRcdGxldCBzVG1wUGF0aCwgb1NlbWFudGljT2JqZWN0UGF5bG9hZDtcblx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdFBhdGhzID0gT2JqZWN0LmtleXMoX29GaW5hbFNlbWFudGljT2JqZWN0c1tfb0xpbmtJbmZvLlNlbWFudGljT2JqZWN0TmFtZV0pO1xuXHRcdFx0Zm9yIChjb25zdCBpUGF0aHNDb3VudCBpbiBhU2VtYW50aWNPYmplY3RQYXRocykge1xuXHRcdFx0XHRzVG1wUGF0aCA9IGFTZW1hbnRpY09iamVjdFBhdGhzW2lQYXRoc0NvdW50XTtcblx0XHRcdFx0b1NlbWFudGljT2JqZWN0UGF5bG9hZCA9XG5cdFx0XHRcdFx0X29GaW5hbFNlbWFudGljT2JqZWN0c1tfb0xpbmtJbmZvLlNlbWFudGljT2JqZWN0TmFtZV0gJiZcblx0XHRcdFx0XHRfb0ZpbmFsU2VtYW50aWNPYmplY3RzW19vTGlua0luZm8uU2VtYW50aWNPYmplY3ROYW1lXVtzVG1wUGF0aF07XG5cdFx0XHRcdGlmIChGaWVsZFJ1bnRpbWUuX2ZuUXVpY2tWaWV3SGFzTmV3Q29uZGl0aW9uKG9TZW1hbnRpY09iamVjdFBheWxvYWQsIF9vTGlua0luZm8pKSB7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdF9mblVwZGF0ZVNlbWFudGljT2JqZWN0c1RhcmdldE1vZGVsOiBmdW5jdGlvbiAob0V2ZW50OiBhbnksIHNWYWx1ZTogYW55LCBvQ29udHJvbDogYW55LCBfc1Byb3BlcnR5UGF0aDogYW55KSB7XG5cdFx0Y29uc3Qgb1NvdXJjZSA9IG9FdmVudCAmJiBvRXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0bGV0IGZuU2V0QWN0aXZlO1xuXHRcdGlmIChvQ29udHJvbC5pc0EoXCJzYXAubS5PYmplY3RTdGF0dXNcIikpIHtcblx0XHRcdGZuU2V0QWN0aXZlID0gKGJBY3RpdmU6IGJvb2xlYW4pID0+IG9Db250cm9sLnNldEFjdGl2ZShiQWN0aXZlKTtcblx0XHR9XG5cdFx0aWYgKG9Db250cm9sLmlzQShcInNhcC5tLk9iamVjdElkZW50aWZpZXJcIikpIHtcblx0XHRcdGZuU2V0QWN0aXZlID0gKGJBY3RpdmU6IGJvb2xlYW4pID0+IG9Db250cm9sLnNldFRpdGxlQWN0aXZlKGJBY3RpdmUpO1xuXHRcdH1cblx0XHRjb25zdCBvQ29uZGl0aW9uYWxXcmFwcGVyID0gb0NvbnRyb2wgJiYgb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0aWYgKG9Db25kaXRpb25hbFdyYXBwZXIgJiYgb0NvbmRpdGlvbmFsV3JhcHBlci5pc0EoXCJzYXAuZmUuY29yZS5jb250cm9scy5Db25kaXRpb25hbFdyYXBwZXJcIikpIHtcblx0XHRcdGZuU2V0QWN0aXZlID0gKGJBY3RpdmU6IGJvb2xlYW4pID0+IG9Db25kaXRpb25hbFdyYXBwZXIuc2V0Q29uZGl0aW9uKGJBY3RpdmUpO1xuXHRcdH1cblx0XHRpZiAoZm5TZXRBY3RpdmUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3Qgb0xpbmtJbmZvID0gRmllbGRSdW50aW1lLl9mbkdldExpbmtJbmZvcm1hdGlvbihvU291cmNlLCBvQ29udHJvbCwgX3NQcm9wZXJ0eVBhdGgsIHNWYWx1ZSwgZm5TZXRBY3RpdmUpO1xuXHRcdFx0b0xpbmtJbmZvLmZuU2V0QWN0aXZlID0gZm5TZXRBY3RpdmU7XG5cdFx0XHRjb25zdCBzQ3VycmVudEhhc2ggPSBGaWVsZFJ1bnRpbWUuX2ZuRml4SGFzaFF1ZXJ5U3RyaW5nKENvbW1vblV0aWxzLmdldEhhc2goKSk7XG5cdFx0XHRDb21tb25VdGlscy51cGRhdGVTZW1hbnRpY1RhcmdldHMoXG5cdFx0XHRcdFtvTGlua0luZm8uR2V0TGlua3NQcm9taXNlXSxcblx0XHRcdFx0W3sgc2VtYW50aWNPYmplY3Q6IG9MaW5rSW5mby5TZW1hbnRpY09iamVjdE5hbWUsIHBhdGg6IG9MaW5rSW5mby5TZW1hbnRpY09iamVjdEZ1bGxQYXRoIH1dLFxuXHRcdFx0XHRvTGlua0luZm8uSW50ZXJuYWxNb2RlbENvbnRleHQsXG5cdFx0XHRcdHNDdXJyZW50SGFzaFxuXHRcdFx0KVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAob0ZpbmFsU2VtYW50aWNPYmplY3RzOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAob0ZpbmFsU2VtYW50aWNPYmplY3RzKSB7XG5cdFx0XHRcdFx0XHRGaWVsZFJ1bnRpbWUuX2ZuUXVpY2tWaWV3U2V0TmV3Q29uZGl0aW9uRm9yQ29uZGl0aW9uYWxXcmFwcGVyKG9MaW5rSW5mbywgb0ZpbmFsU2VtYW50aWNPYmplY3RzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgdXBkYXRlIFNlbWFudGljIFRhcmdldHMgbW9kZWxcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXHRfY2hlY2tDb250cm9sSGFzTW9kZWxBbmRCaW5kaW5nQ29udGV4dChfY29udHJvbDogQ29udHJvbCkge1xuXHRcdGlmICghX2NvbnRyb2wuZ2V0TW9kZWwoKSB8fCAhX2NvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdH0sXG5cdF9jaGVja0N1c3RvbURhdGFWYWx1ZUJlZm9yZVVwZGF0aW5nU2VtYW50aWNPYmplY3RNb2RlbChfY29udHJvbDogQ29udHJvbCwgcHJvcGVydHlQYXRoOiBzdHJpbmcsIGFDdXN0b21EYXRhOiBDdXN0b21EYXRhW10pOiB2b2lkIHtcblx0XHRsZXQgc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlOiBhbnk7XG5cdFx0bGV0IG9WYWx1ZUJpbmRpbmc7XG5cdFx0Y29uc3QgX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmcgPSBmdW5jdGlvbiAoc2VtYW50aWNPYmplY3RQYXRoVmFsdWU6IGFueSkge1xuXHRcdFx0cmV0dXJuICEoc2VtYW50aWNPYmplY3RQYXRoVmFsdWUgIT09IG51bGwgJiYgdHlwZW9mIHNlbWFudGljT2JqZWN0UGF0aFZhbHVlID09PSBcIm9iamVjdFwiKTtcblx0XHR9O1xuXHRcdC8vIHJlbW92ZSB0ZWNobmljYWwgY3VzdG9tIGRhdGFzIHNldCBieSBVSTVcblx0XHRhQ3VzdG9tRGF0YSA9IGFDdXN0b21EYXRhLmZpbHRlcigoY3VzdG9tRGF0YSkgPT4gY3VzdG9tRGF0YS5nZXRLZXkoKSAhPT0gXCJzYXAtdWktY3VzdG9tLXNldHRpbmdzXCIpO1xuXHRcdGZvciAoY29uc3QgaW5kZXggaW4gYUN1c3RvbURhdGEpIHtcblx0XHRcdHNTZW1hbnRpY09iamVjdFBhdGhWYWx1ZSA9IGFDdXN0b21EYXRhW2luZGV4XS5nZXRWYWx1ZSgpO1xuXHRcdFx0aWYgKCFzU2VtYW50aWNPYmplY3RQYXRoVmFsdWUgJiYgX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmcoc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlKSkge1xuXHRcdFx0XHRvVmFsdWVCaW5kaW5nID0gYUN1c3RvbURhdGFbaW5kZXhdLmdldEJpbmRpbmcoXCJ2YWx1ZVwiKTtcblx0XHRcdFx0aWYgKG9WYWx1ZUJpbmRpbmcpIHtcblx0XHRcdFx0XHRvVmFsdWVCaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImNoYW5nZVwiLCBmdW5jdGlvbiAoX29DaGFuZ2VFdmVudDogYW55KSB7XG5cdFx0XHRcdFx0XHRGaWVsZFJ1bnRpbWUuX2ZuVXBkYXRlU2VtYW50aWNPYmplY3RzVGFyZ2V0TW9kZWwoX29DaGFuZ2VFdmVudCwgbnVsbCwgX2NvbnRyb2wsIHByb3BlcnR5UGF0aCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoX2ZuQ3VzdG9tRGF0YVZhbHVlSXNTdHJpbmcoc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlKSkge1xuXHRcdFx0XHRGaWVsZFJ1bnRpbWUuX2ZuVXBkYXRlU2VtYW50aWNPYmplY3RzVGFyZ2V0TW9kZWwobnVsbCwgc1NlbWFudGljT2JqZWN0UGF0aFZhbHVlLCBfY29udHJvbCwgcHJvcGVydHlQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdExpbmtNb2RlbENvbnRleHRDaGFuZ2U6IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSwgc1Byb3BlcnR5OiBhbnksIHNQYXRoVG9Qcm9wZXJ0eTogYW55KTogdm9pZCB7XG5cdFx0Y29uc3QgY29udHJvbCA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRpZiAoRmllbGRSdW50aW1lLl9jaGVja0NvbnRyb2xIYXNNb2RlbEFuZEJpbmRpbmdDb250ZXh0KGNvbnRyb2wpKSB7XG5cdFx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gYCR7c1BhdGhUb1Byb3BlcnR5fS8ke3NQcm9wZXJ0eX1gO1xuXHRcdFx0Y29uc3QgbWRjTGluayA9IGNvbnRyb2wuZ2V0RGVwZW5kZW50cygpLmxlbmd0aCA/IGNvbnRyb2wuZ2V0RGVwZW5kZW50cygpWzBdIDogdW5kZWZpbmVkO1xuXHRcdFx0Y29uc3QgYUN1c3RvbURhdGEgPSBtZGNMaW5rPy5nZXRDdXN0b21EYXRhKCk7XG5cdFx0XHRpZiAoYUN1c3RvbURhdGEgJiYgYUN1c3RvbURhdGEubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRGaWVsZFJ1bnRpbWUuX2NoZWNrQ3VzdG9tRGF0YVZhbHVlQmVmb3JlVXBkYXRpbmdTZW1hbnRpY09iamVjdE1vZGVsKGNvbnRyb2wsIHNQcm9wZXJ0eVBhdGgsIGFDdXN0b21EYXRhKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdG9wZW5FeHRlcm5hbExpbms6IGZ1bmN0aW9uIChldmVudDogRXZlbnQpIHtcblx0XHRjb25zdCBzb3VyY2UgPSBldmVudC5nZXRTb3VyY2UoKSBhcyBhbnk7XG5cdFx0aWYgKHNvdXJjZS5kYXRhKFwidXJsXCIpICYmIHNvdXJjZS5nZXRQcm9wZXJ0eShcInRleHRcIikgIT09IFwiXCIpIHtcblx0XHRcdC8vIFRoaXMgb3BlbnMgdGhlIGxpbmsgaW4gdGhlIHNhbWUgdGFiIGFzIHRoZSBsaW5rLiBJdCB3YXMgZG9uZSB0byBiZSBtb3JlIGNvbnNpc3RlbnQgd2l0aCBvdGhlciB0eXBlIG9mIGxpbmtzLlxuXHRcdFx0b3BlbldpbmRvdyhzb3VyY2UuZGF0YShcInVybFwiKSwgXCJfc2VsZlwiKTtcblx0XHR9XG5cdH0sXG5cdHByZXNzTGluazogYXN5bmMgZnVuY3Rpb24gKG9FdmVudDogYW55KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3Qgb1NvdXJjZSA9IG9FdmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBvTGluayA9IG9Tb3VyY2UuaXNBKFwic2FwLm0uT2JqZWN0SWRlbnRpZmllclwiKVxuXHRcdFx0PyBvU291cmNlLmZpbmRFbGVtZW50cyhmYWxzZSwgKGVsZW06IEV2ZW50KSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIGVsZW0uaXNBKFwic2FwLm0uTGlua1wiKTtcblx0XHRcdCAgfSlbMF1cblx0XHRcdDogb1NvdXJjZTtcblxuXHRcdGFzeW5jIGZ1bmN0aW9uIG9wZW5MaW5rKG1kY0xpbms6IGFueSkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0Y29uc3Qgc0hyZWYgPSBhd2FpdCBtZGNMaW5rLmdldFRyaWdnZXJIcmVmKCk7XG5cdFx0XHRcdGlmICghc0hyZWYpIHtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0YXdhaXQgbWRjTGluay5vcGVuKG9MaW5rKTtcblx0XHRcdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IHJldHJpZXZlIHRoZSBRdWlja1ZpZXcgUG9wb3ZlciBkaWFsb2dcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9MaW5rKTtcblx0XHRcdFx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9WaWV3KTtcblx0XHRcdFx0XHRjb25zdCBvU2hlbGxTZXJ2aWNlSGVscGVyID0gb0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdFx0XHRcdFx0Y29uc3Qgb1NoZWxsSGFzaCA9IG9TaGVsbFNlcnZpY2VIZWxwZXIucGFyc2VTaGVsbEhhc2goc0hyZWYpO1xuXHRcdFx0XHRcdGNvbnN0IG9OYXZBcmdzID0ge1xuXHRcdFx0XHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0XHRhY3Rpb246IG9TaGVsbEhhc2guYWN0aW9uXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0cGFyYW1zOiBvU2hlbGxIYXNoLnBhcmFtc1xuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRLZWVwQWxpdmVIZWxwZXIuc3RvcmVDb250cm9sUmVmcmVzaFN0cmF0ZWd5Rm9ySGFzaChvVmlldywgb1NoZWxsSGFzaCk7XG5cblx0XHRcdFx0XHRpZiAoQ29tbW9uVXRpbHMuaXNTdGlja3lFZGl0TW9kZShvTGluaykgIT09IHRydWUpIHtcblx0XHRcdFx0XHRcdC8vVVJMIHBhcmFtcyBhbmQgeGFwcFN0YXRlIGhhcyBiZWVuIGdlbmVyYXRlZCBlYXJsaWVyIGhlbmNlIHVzaW5nIHRvRXh0ZXJuYWxcblx0XHRcdFx0XHRcdG9TaGVsbFNlcnZpY2VIZWxwZXIudG9FeHRlcm5hbChvTmF2QXJncyBhcyBhbnksIG9BcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzTmV3SHJlZiA9IGF3YWl0IG9TaGVsbFNlcnZpY2VIZWxwZXIuaHJlZkZvckV4dGVybmFsQXN5bmMob05hdkFyZ3MsIG9BcHBDb21wb25lbnQpO1xuXHRcdFx0XHRcdFx0XHRvcGVuV2luZG93KHNOZXdIcmVmKTtcblx0XHRcdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdExvZy5lcnJvcihgRXJyb3Igd2hpbGUgcmV0aXJldmluZyBocmVmRm9yRXh0ZXJuYWwgOiAke29FcnJvcn1gKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHRyaWdnZXJpbmcgbGluayBIcmVmXCIsIG9FcnJvcik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG9Tb3VyY2UuZ2V0RGVwZW5kZW50cygpICYmIG9Tb3VyY2UuZ2V0RGVwZW5kZW50cygpLmxlbmd0aCA+IDAgJiYgb0xpbmsuZ2V0UHJvcGVydHkoXCJ0ZXh0XCIpICE9PSBcIlwiKSB7XG5cdFx0XHRjb25zdCBvRmllbGRJbmZvID0gb1NvdXJjZS5nZXREZXBlbmRlbnRzKClbMF07XG5cdFx0XHRpZiAob0ZpZWxkSW5mbyAmJiBvRmllbGRJbmZvLmlzQShcInNhcC51aS5tZGMuTGlua1wiKSkge1xuXHRcdFx0XHRhd2FpdCBvcGVuTGluayhvRmllbGRJbmZvKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9MaW5rO1xuXHR9LFxuXHR1cGxvYWRTdHJlYW06IGZ1bmN0aW9uIChjb250cm9sbGVyOiBDb250cm9sbGVyLCBldmVudDogRXZlbnQpIHtcblx0XHRjb25zdCBmaWxlVXBsb2FkZXIgPSBldmVudC5nZXRTb3VyY2UoKSBhcyBGaWxlVXBsb2FkZXIsXG5cdFx0XHRGRUNvbnRyb2xsZXIgPSBGaWVsZFJ1bnRpbWUuX2dldEV4dGVuc2lvbkNvbnRyb2xsZXIoY29udHJvbGxlciksXG5cdFx0XHRmaWxlV3JhcHBlciA9IGZpbGVVcGxvYWRlci5nZXRQYXJlbnQoKSBhcyB1bmtub3duIGFzIEZpbGVXcmFwcGVyLFxuXHRcdFx0dXBsb2FkVXJsID0gZmlsZVdyYXBwZXIuZ2V0VXBsb2FkVXJsKCk7XG5cblx0XHRpZiAodXBsb2FkVXJsICE9PSBcIlwiKSB7XG5cdFx0XHRmaWxlV3JhcHBlci5zZXRVSUJ1c3kodHJ1ZSk7XG5cblx0XHRcdC8vIHVzZSB1cGxvYWRVcmwgZnJvbSBGaWxlV3JhcHBlciB3aGljaCByZXR1cm5zIGEgY2Fub25pY2FsIFVSTFxuXHRcdFx0ZmlsZVVwbG9hZGVyLnNldFVwbG9hZFVybCh1cGxvYWRVcmwpO1xuXG5cdFx0XHRmaWxlVXBsb2FkZXIucmVtb3ZlQWxsSGVhZGVyUGFyYW1ldGVycygpO1xuXHRcdFx0Y29uc3QgdG9rZW4gPSAoZmlsZVVwbG9hZGVyLmdldE1vZGVsKCkgYXMgYW55KT8uZ2V0SHR0cEhlYWRlcnMoKVtcIlgtQ1NSRi1Ub2tlblwiXTtcblx0XHRcdGlmICh0b2tlbikge1xuXHRcdFx0XHRjb25zdCBoZWFkZXJQYXJhbWV0ZXJDU1JGVG9rZW4gPSBuZXcgRmlsZVVwbG9hZGVyUGFyYW1ldGVyKCk7XG5cdFx0XHRcdGhlYWRlclBhcmFtZXRlckNTUkZUb2tlbi5zZXROYW1lKFwieC1jc3JmLXRva2VuXCIpO1xuXHRcdFx0XHRoZWFkZXJQYXJhbWV0ZXJDU1JGVG9rZW4uc2V0VmFsdWUodG9rZW4pO1xuXHRcdFx0XHRmaWxlVXBsb2FkZXIuYWRkSGVhZGVyUGFyYW1ldGVyKGhlYWRlclBhcmFtZXRlckNTUkZUb2tlbik7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBlVGFnID0gKGZpbGVVcGxvYWRlci5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQgfCB1bmRlZmluZWQgfCBudWxsKT8uZ2V0UHJvcGVydHkoXCJAb2RhdGEuZXRhZ1wiKTtcblx0XHRcdGlmIChlVGFnKSB7XG5cdFx0XHRcdGNvbnN0IGhlYWRlclBhcmFtZXRlckVUYWcgPSBuZXcgRmlsZVVwbG9hZGVyUGFyYW1ldGVyKCk7XG5cdFx0XHRcdGhlYWRlclBhcmFtZXRlckVUYWcuc2V0TmFtZShcIklmLU1hdGNoXCIpO1xuXHRcdFx0XHRoZWFkZXJQYXJhbWV0ZXJFVGFnLnNldFZhbHVlKGVUYWcpO1xuXHRcdFx0XHRmaWxlVXBsb2FkZXIuYWRkSGVhZGVyUGFyYW1ldGVyKGhlYWRlclBhcmFtZXRlckVUYWcpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgaGVhZGVyUGFyYW1ldGVyQWNjZXB0ID0gbmV3IEZpbGVVcGxvYWRlclBhcmFtZXRlcigpO1xuXHRcdFx0aGVhZGVyUGFyYW1ldGVyQWNjZXB0LnNldE5hbWUoXCJBY2NlcHRcIik7XG5cdFx0XHRoZWFkZXJQYXJhbWV0ZXJBY2NlcHQuc2V0VmFsdWUoXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuXHRcdFx0ZmlsZVVwbG9hZGVyLmFkZEhlYWRlclBhcmFtZXRlcihoZWFkZXJQYXJhbWV0ZXJBY2NlcHQpO1xuXG5cdFx0XHQvLyBzeW5jaHJvbml6ZSB1cGxvYWQgd2l0aCBvdGhlciByZXF1ZXN0c1xuXHRcdFx0Y29uc3QgdXBsb2FkUHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlOiBhbnksIHJlamVjdDogYW55KSA9PiB7XG5cdFx0XHRcdHRoaXMudXBsb2FkUHJvbWlzZXMgPSB0aGlzLnVwbG9hZFByb21pc2VzIHx8IHt9O1xuXHRcdFx0XHR0aGlzLnVwbG9hZFByb21pc2VzW2ZpbGVVcGxvYWRlci5nZXRJZCgpXSA9IHtcblx0XHRcdFx0XHRyZXNvbHZlOiByZXNvbHZlLFxuXHRcdFx0XHRcdHJlamVjdDogcmVqZWN0XG5cdFx0XHRcdH07XG5cdFx0XHRcdGZpbGVVcGxvYWRlci51cGxvYWQoKTtcblx0XHRcdH0pO1xuXHRcdFx0RkVDb250cm9sbGVyLl9lZGl0Rmxvdy5zeW5jVGFzayh1cGxvYWRQcm9taXNlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TWVzc2FnZUJveC5lcnJvcihSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9BQk9SVEVEX1RFWFRcIikpO1xuXHRcdH1cblx0fSxcblxuXHRoYW5kbGVVcGxvYWRDb21wbGV0ZTogZnVuY3Rpb24gKFxuXHRcdGV2ZW50OiBFdmVudCxcblx0XHRwcm9wZXJ0eUZpbGVOYW1lOiB7IHBhdGg6IHN0cmluZyB9IHwgdW5kZWZpbmVkLFxuXHRcdHByb3BlcnR5UGF0aDogc3RyaW5nLFxuXHRcdGNvbnRyb2xsZXI6IENvbnRyb2xsZXJcblx0KSB7XG5cdFx0Y29uc3Qgc3RhdHVzID0gZXZlbnQuZ2V0UGFyYW1ldGVyKFwic3RhdHVzXCIpLFxuXHRcdFx0ZmlsZVVwbG9hZGVyID0gZXZlbnQuZ2V0U291cmNlKCkgYXMgRmlsZVVwbG9hZGVyLFxuXHRcdFx0ZmlsZVdyYXBwZXIgPSBmaWxlVXBsb2FkZXIuZ2V0UGFyZW50KCkgYXMgdW5rbm93biBhcyBGaWxlV3JhcHBlcjtcblxuXHRcdGZpbGVXcmFwcGVyLnNldFVJQnVzeShmYWxzZSk7XG5cblx0XHRpZiAoc3RhdHVzID09PSAwIHx8IHN0YXR1cyA+PSA0MDApIHtcblx0XHRcdHRoaXMuX2Rpc3BsYXlNZXNzYWdlRm9yRmFpbGVkVXBsb2FkKGV2ZW50KTtcblx0XHRcdHRoaXMudXBsb2FkUHJvbWlzZXNbZmlsZVVwbG9hZGVyLmdldElkKCldLnJlamVjdCgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBjb250ZXh0ID0gZmlsZVVwbG9hZGVyLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCB8IHVuZGVmaW5lZCB8IG51bGwsXG5cdFx0XHRcdG5ld0VUYWcgPSBldmVudC5nZXRQYXJhbWV0ZXIoXCJoZWFkZXJzXCIpLmV0YWc7XG5cblx0XHRcdGlmIChuZXdFVGFnKSB7XG5cdFx0XHRcdC8vIHNldCBuZXcgZXRhZyBmb3IgZmlsZW5hbWUgdXBkYXRlLCBidXQgd2l0aG91dCBzZW5kaW5nIHBhdGNoIHJlcXVlc3Rcblx0XHRcdFx0Y29udGV4dD8uc2V0UHJvcGVydHkoXCJAb2RhdGEuZXRhZ1wiLCBuZXdFVGFnLCBudWxsIGFzIGFueSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIHNldCBmaWxlbmFtZSBmb3IgbGluayB0ZXh0XG5cdFx0XHRpZiAocHJvcGVydHlGaWxlTmFtZT8ucGF0aCkge1xuXHRcdFx0XHRjb250ZXh0Py5zZXRQcm9wZXJ0eShwcm9wZXJ0eUZpbGVOYW1lLnBhdGgsIGZpbGVVcGxvYWRlci5nZXRWYWx1ZSgpKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gaW52YWxpZGF0ZSB0aGUgcHJvcGVydHkgdGhhdCBub3QgZ2V0cyB1cGRhdGVkIG90aGVyd2lzZVxuXHRcdFx0Y29udGV4dD8uc2V0UHJvcGVydHkocHJvcGVydHlQYXRoLCBudWxsLCBudWxsIGFzIGFueSk7XG5cdFx0XHRjb250ZXh0Py5zZXRQcm9wZXJ0eShwcm9wZXJ0eVBhdGgsIHVuZGVmaW5lZCwgbnVsbCBhcyBhbnkpO1xuXG5cdFx0XHR0aGlzLl9jYWxsU2lkZUVmZmVjdHNGb3JTdHJlYW0oZXZlbnQsIGZpbGVXcmFwcGVyLCBjb250cm9sbGVyKTtcblxuXHRcdFx0dGhpcy51cGxvYWRQcm9taXNlc1tmaWxlVXBsb2FkZXIuZ2V0SWQoKV0ucmVzb2x2ZSgpO1xuXHRcdH1cblxuXHRcdC8vIENvbGxhYm9yYXRpb24gRHJhZnQgQWN0aXZpdHkgU3luY1xuXHRcdGNvbnN0IG9GaWVsZCA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIENvbnRyb2wsXG5cdFx0XHRiQ29sbGFib3JhdGlvbkVuYWJsZWQgPSBDb2xsYWJvcmF0aW9uQWN0aXZpdHlTeW5jLmlzQ29ubmVjdGVkKG9GaWVsZCk7XG5cdFx0bGV0IHNCaW5kaW5nUGF0aDtcblx0XHRpZiAoYkNvbGxhYm9yYXRpb25FbmFibGVkKSB7XG5cdFx0XHRjb25zdCBkYXRhID0gW1xuXHRcdFx0XHQuLi4ob0ZpZWxkLmdldFBhcmVudCgpIGFzIGFueSkuZ2V0QXZhdGFyKCkuZ2V0QmluZGluZ0luZm8oXCJzcmNcIik/LnBhcnRzLFxuXHRcdFx0XHQuLi4oKG9GaWVsZC5nZXRQYXJlbnQoKSBhcyBhbnkpLmdldEF2YXRhcigpLmdldEJpbmRpbmdJbmZvKFwiYWRkaXRpb25hbFZhbHVlXCIpPy5wYXJ0cyB8fCBbXSlcblx0XHRcdF0ubWFwKGZ1bmN0aW9uIChwYXJ0OiBhbnkpIHtcblx0XHRcdFx0aWYgKHBhcnQpIHtcblx0XHRcdFx0XHRzQmluZGluZ1BhdGggPSBwYXJ0LnBhdGg7XG5cdFx0XHRcdFx0cmV0dXJuIGAke29GaWVsZC5nZXRCaW5kaW5nQ29udGV4dCgpPy5nZXRQYXRoKCl9LyR7c0JpbmRpbmdQYXRofWA7XG5cdFx0XHRcdH1cblx0XHRcdH0pIGFzIFtdO1xuXHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKG9GaWVsZCwgQWN0aXZpdHkuQ2hhbmdlLCBkYXRhKTtcblx0XHR9XG5cblx0XHRkZWxldGUgdGhpcy51cGxvYWRQcm9taXNlc1tmaWxlVXBsb2FkZXIuZ2V0SWQoKV07XG5cdH0sXG5cblx0X2Rpc3BsYXlNZXNzYWdlRm9yRmFpbGVkVXBsb2FkOiBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHQvLyBoYW5kbGluZyBvZiBiYWNrZW5kIGVycm9yc1xuXHRcdGNvbnN0IHNFcnJvciA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJyZXNwb25zZVJhd1wiKSB8fCBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwicmVzcG9uc2VcIik7XG5cdFx0bGV0IHNNZXNzYWdlVGV4dCwgb0Vycm9yO1xuXHRcdHRyeSB7XG5cdFx0XHRvRXJyb3IgPSBzRXJyb3IgJiYgSlNPTi5wYXJzZShzRXJyb3IpO1xuXHRcdFx0c01lc3NhZ2VUZXh0ID0gb0Vycm9yLmVycm9yICYmIG9FcnJvci5lcnJvci5tZXNzYWdlO1xuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdHNNZXNzYWdlVGV4dCA9IHNFcnJvciB8fCBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9BQk9SVEVEX1RFWFRcIik7XG5cdFx0fVxuXHRcdE1lc3NhZ2VCb3guZXJyb3Ioc01lc3NhZ2VUZXh0KTtcblx0fSxcblxuXHRyZW1vdmVTdHJlYW06IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSwgc1Byb3BlcnR5UGF0aDogYW55LCBvQ29udHJvbGxlcjogYW55KSB7XG5cdFx0Y29uc3Qgb0RlbGV0ZUJ1dHRvbiA9IG9FdmVudC5nZXRTb3VyY2UoKSxcblx0XHRcdG9GaWxlV3JhcHBlciA9IG9EZWxldGVCdXR0b24uZ2V0UGFyZW50KCksXG5cdFx0XHRvQ29udGV4dCA9IG9GaWxlV3JhcHBlci5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXG5cdFx0Ly8gc3RyZWFtcyBhcmUgcmVtb3ZlZCBieSBhc3NpZ25pbmcgdGhlIG51bGwgdmFsdWVcblx0XHRvQ29udGV4dC5zZXRQcm9wZXJ0eShzUHJvcGVydHlQYXRoLCBudWxsKTtcblx0XHQvLyBXaGVuIHNldHRpbmcgdGhlIHByb3BlcnR5IHRvIG51bGwsIHRoZSB1cGxvYWRVcmwgKEBATU9ERUwuZm9ybWF0KSBpcyBzZXQgdG8gXCJcIiBieSB0aGUgbW9kZWxcblx0XHQvL1x0d2l0aCB0aGF0IGFub3RoZXIgdXBsb2FkIGlzIG5vdCBwb3NzaWJsZSBiZWZvcmUgcmVmcmVzaGluZyB0aGUgcGFnZVxuXHRcdC8vIChyZWZyZXNoaW5nIHRoZSBwYWdlIHdvdWxkIHJlY3JlYXRlIHRoZSBVUkwpXG5cdFx0Ly9cdFRoaXMgaXMgdGhlIHdvcmthcm91bmQ6XG5cdFx0Ly9cdFdlIHNldCB0aGUgcHJvcGVydHkgdG8gdW5kZWZpbmVkIG9ubHkgb24gdGhlIGZyb250ZW5kIHdoaWNoIHdpbGwgcmVjcmVhdGUgdGhlIHVwbG9hZFVybFxuXHRcdG9Db250ZXh0LnNldFByb3BlcnR5KHNQcm9wZXJ0eVBhdGgsIHVuZGVmaW5lZCwgbnVsbCk7XG5cblx0XHR0aGlzLl9jYWxsU2lkZUVmZmVjdHNGb3JTdHJlYW0ob0V2ZW50LCBvRmlsZVdyYXBwZXIsIG9Db250cm9sbGVyKTtcblxuXHRcdC8vIENvbGxhYm9yYXRpb24gRHJhZnQgQWN0aXZpdHkgU3luY1xuXHRcdGNvbnN0IGJDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuaXNDb25uZWN0ZWQob0RlbGV0ZUJ1dHRvbik7XG5cdFx0bGV0IG9CaW5kaW5nLCBzQmluZGluZ1BhdGg7XG5cdFx0aWYgKGJDb2xsYWJvcmF0aW9uRW5hYmxlZCkge1xuXHRcdFx0b0JpbmRpbmcgPSBvQ29udGV4dC5nZXRCaW5kaW5nKCk7XG5cdFx0XHRpZiAoIW9CaW5kaW5nLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUxpc3RCaW5kaW5nXCIpKSB7XG5cdFx0XHRcdGNvbnN0IG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvRGVsZXRlQnV0dG9uKTtcblx0XHRcdFx0b0JpbmRpbmcgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpLmdldEJpbmRpbmcoKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgZGF0YSA9IFtcblx0XHRcdFx0Li4ub0ZpbGVXcmFwcGVyLmdldEF2YXRhcigpLmdldEJpbmRpbmdJbmZvKFwic3JjXCIpPy5wYXJ0cyxcblx0XHRcdFx0Li4uKG9GaWxlV3JhcHBlci5nZXRBdmF0YXIoKS5nZXRCaW5kaW5nSW5mbyhcImFkZGl0aW9uYWxWYWx1ZVwiKT8ucGFydHMgfHwgW10pXG5cdFx0XHRdLm1hcChmdW5jdGlvbiAocGFydDogYW55KSB7XG5cdFx0XHRcdGlmIChwYXJ0KSB7XG5cdFx0XHRcdFx0c0JpbmRpbmdQYXRoID0gcGFydC5wYXRoO1xuXHRcdFx0XHRcdHJldHVybiBgJHtvQ29udGV4dC5nZXRQYXRoKCl9LyR7c0JpbmRpbmdQYXRofWA7XG5cdFx0XHRcdH1cblx0XHRcdH0pIGFzIFtdO1xuXHRcdFx0Q29sbGFib3JhdGlvbkFjdGl2aXR5U3luYy5zZW5kKG9EZWxldGVCdXR0b24sIEFjdGl2aXR5LkxpdmVDaGFuZ2UsIGRhdGEpO1xuXG5cdFx0XHRvQmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJwYXRjaENvbXBsZXRlZFwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdENvbGxhYm9yYXRpb25BY3Rpdml0eVN5bmMuc2VuZChvRGVsZXRlQnV0dG9uLCBBY3Rpdml0eS5DaGFuZ2UsIGRhdGEpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXG5cdF9jYWxsU2lkZUVmZmVjdHNGb3JTdHJlYW06IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSwgb0NvbnRyb2w6IGFueSwgb0NvbnRyb2xsZXI6IGFueSkge1xuXHRcdGNvbnN0IG9GRUNvbnRyb2xsZXIgPSBGaWVsZFJ1bnRpbWUuX2dldEV4dGVuc2lvbkNvbnRyb2xsZXIob0NvbnRyb2xsZXIpO1xuXHRcdGlmIChvQ29udHJvbCAmJiBvQ29udHJvbC5nZXRCaW5kaW5nQ29udGV4dCgpLmlzVHJhbnNpZW50KCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKG9Db250cm9sKSB7XG5cdFx0XHRvRXZlbnQub1NvdXJjZSA9IG9Db250cm9sO1xuXHRcdH1cblx0XHRvRkVDb250cm9sbGVyLl9zaWRlRWZmZWN0cy5oYW5kbGVGaWVsZENoYW5nZShvRXZlbnQpO1xuXHR9LFxuXG5cdGdldEljb25Gb3JNaW1lVHlwZTogZnVuY3Rpb24gKHNNaW1lVHlwZTogYW55KSB7XG5cdFx0cmV0dXJuIEljb25Qb29sLmdldEljb25Gb3JNaW1lVHlwZShzTWltZVR5cGUpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gcmV0cmlldmUgdGV4dCBmcm9tIHZhbHVlIGxpc3QgZm9yIERhdGFGaWVsZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Rcblx0ICogQHBhcmFtIHNQcm9wZXJ0eVZhbHVlIFRoZSBwcm9wZXJ0eSB2YWx1ZSBvZiB0aGUgZGF0YWZpZWxkXG5cdCAqIEBwYXJhbSBzUHJvcGVydHlGdWxsUGF0aCBUaGUgcHJvcGVydHkgZnVsbCBwYXRoJ3Ncblx0ICogQHBhcmFtIHNEaXNwbGF5Rm9ybWF0IFRoZSBkaXNwbGF5IGZvcm1hdCBmb3IgdGhlIGRhdGFmaWVsZFxuXHQgKiBAcmV0dXJucyBUaGUgZm9ybWF0dGVkIHZhbHVlIGluIGNvcnJlc3BvbmRpbmcgZGlzcGxheSBmb3JtYXQuXG5cdCAqL1xuXHRyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0OiBmdW5jdGlvbiAoc1Byb3BlcnR5VmFsdWU6IHN0cmluZywgc1Byb3BlcnR5RnVsbFBhdGg6IHN0cmluZywgc0Rpc3BsYXlGb3JtYXQ6IHN0cmluZykge1xuXHRcdGxldCBzVGV4dFByb3BlcnR5OiBzdHJpbmc7XG5cdFx0bGV0IG9NZXRhTW9kZWw7XG5cdFx0bGV0IHNQcm9wZXJ0eU5hbWU6IHN0cmluZztcblx0XHRpZiAoc1Byb3BlcnR5VmFsdWUpIHtcblx0XHRcdG9NZXRhTW9kZWwgPSBDb21tb25IZWxwZXIuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRzUHJvcGVydHlOYW1lID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1Byb3BlcnR5RnVsbFBhdGh9QHNhcHVpLm5hbWVgKTtcblx0XHRcdHJldHVybiBvTWV0YU1vZGVsXG5cdFx0XHRcdC5yZXF1ZXN0VmFsdWVMaXN0SW5mbyhzUHJvcGVydHlGdWxsUGF0aCwgdHJ1ZSlcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKG1WYWx1ZUxpc3RJbmZvOiBhbnkpIHtcblx0XHRcdFx0XHQvLyB0YWtlIHRoZSBcIlwiIG9uZSBpZiBleGlzdHMsIG90aGVyd2lzZSB0YWtlIHRoZSBmaXJzdCBvbmUgaW4gdGhlIG9iamVjdCBUT0RPOiB0byBiZSBkaXNjdXNzZWRcblx0XHRcdFx0XHRjb25zdCBvVmFsdWVMaXN0SW5mbyA9IG1WYWx1ZUxpc3RJbmZvW21WYWx1ZUxpc3RJbmZvW1wiXCJdID8gXCJcIiA6IE9iamVjdC5rZXlzKG1WYWx1ZUxpc3RJbmZvKVswXV07XG5cdFx0XHRcdFx0Y29uc3Qgb1ZhbHVlTGlzdE1vZGVsID0gb1ZhbHVlTGlzdEluZm8uJG1vZGVsO1xuXHRcdFx0XHRcdGNvbnN0IG9NZXRhTW9kZWxWYWx1ZUxpc3QgPSBvVmFsdWVMaXN0TW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRcdFx0Y29uc3Qgb1BhcmFtV2l0aEtleSA9IG9WYWx1ZUxpc3RJbmZvLlBhcmFtZXRlcnMuZmluZChmdW5jdGlvbiAob1BhcmFtZXRlcjogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb1BhcmFtZXRlci5Mb2NhbERhdGFQcm9wZXJ0eSAmJiBvUGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5LiRQcm9wZXJ0eVBhdGggPT09IHNQcm9wZXJ0eU5hbWU7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0aWYgKG9QYXJhbVdpdGhLZXkgJiYgIW9QYXJhbVdpdGhLZXkuVmFsdWVMaXN0UHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBQcm9taXNlLnJlamVjdChgSW5jb25zaXN0ZW50IHZhbHVlIGhlbHAgYW5ub3RhdGlvbiBmb3IgJHtzUHJvcGVydHlOYW1lfWApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBvVGV4dEFubm90YXRpb24gPSBvTWV0YU1vZGVsVmFsdWVMaXN0LmdldE9iamVjdChcblx0XHRcdFx0XHRcdGAvJHtvVmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aH0vJHtvUGFyYW1XaXRoS2V5LlZhbHVlTGlzdFByb3BlcnR5fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dGBcblx0XHRcdFx0XHQpO1xuXG5cdFx0XHRcdFx0aWYgKG9UZXh0QW5ub3RhdGlvbiAmJiBvVGV4dEFubm90YXRpb24uJFBhdGgpIHtcblx0XHRcdFx0XHRcdHNUZXh0UHJvcGVydHkgPSBvVGV4dEFubm90YXRpb24uJFBhdGg7XG5cdFx0XHRcdFx0XHRjb25zdCBvRmlsdGVyID0gbmV3IEZpbHRlcih7XG5cdFx0XHRcdFx0XHRcdHBhdGg6IG9QYXJhbVdpdGhLZXkuVmFsdWVMaXN0UHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdG9wZXJhdG9yOiBcIkVRXCIsXG5cdFx0XHRcdFx0XHRcdHZhbHVlMTogc1Byb3BlcnR5VmFsdWVcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0xpc3RCaW5kaW5nID0gb1ZhbHVlTGlzdE1vZGVsLmJpbmRMaXN0KGAvJHtvVmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aH1gLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgb0ZpbHRlciwge1xuXHRcdFx0XHRcdFx0XHRcIiRzZWxlY3RcIjogc1RleHRQcm9wZXJ0eVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0xpc3RCaW5kaW5nLnJlcXVlc3RDb250ZXh0cygwLCAyKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c0Rpc3BsYXlGb3JtYXQgPSBcIlZhbHVlXCI7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc1Byb3BlcnR5VmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAoYUNvbnRleHRzOiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBzRGVzY3JpcHRpb24gPSBzVGV4dFByb3BlcnR5ID8gYUNvbnRleHRzWzBdPy5nZXRPYmplY3QoKVtzVGV4dFByb3BlcnR5XSA6IFwiXCI7XG5cdFx0XHRcdFx0c3dpdGNoIChzRGlzcGxheUZvcm1hdCkge1xuXHRcdFx0XHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBzRGVzY3JpcHRpb247XG5cdFx0XHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25WYWx1ZVwiOlxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKS5nZXRUZXh0KFwiQ19GT1JNQVRfRk9SX1RFWFRfQVJSQU5HRU1FTlRcIiwgW1xuXHRcdFx0XHRcdFx0XHRcdHNEZXNjcmlwdGlvbixcblx0XHRcdFx0XHRcdFx0XHRzUHJvcGVydHlWYWx1ZVxuXHRcdFx0XHRcdFx0XHRdKTtcblx0XHRcdFx0XHRcdGNhc2UgXCJWYWx1ZURlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0XHRcdHJldHVybiBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJDX0ZPUk1BVF9GT1JfVEVYVF9BUlJBTkdFTUVOVFwiLCBbXG5cdFx0XHRcdFx0XHRcdFx0c1Byb3BlcnR5VmFsdWUsXG5cdFx0XHRcdFx0XHRcdFx0c0Rlc2NyaXB0aW9uXG5cdFx0XHRcdFx0XHRcdF0pO1xuXHRcdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHNQcm9wZXJ0eVZhbHVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IHNNc2cgPVxuXHRcdFx0XHRcdFx0b0Vycm9yLnN0YXR1cyAmJiBvRXJyb3Iuc3RhdHVzID09PSA0MDRcblx0XHRcdFx0XHRcdFx0PyBgTWV0YWRhdGEgbm90IGZvdW5kICgke29FcnJvci5zdGF0dXN9KSBmb3IgdmFsdWUgaGVscCBvZiBwcm9wZXJ0eSAke3NQcm9wZXJ0eUZ1bGxQYXRofWBcblx0XHRcdFx0XHRcdFx0OiBvRXJyb3IubWVzc2FnZTtcblx0XHRcdFx0XHRMb2cuZXJyb3Ioc01zZyk7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gc1Byb3BlcnR5VmFsdWU7XG5cdH0sXG5cblx0aGFuZGxlVHlwZU1pc3NtYXRjaDogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0TWVzc2FnZUJveC5lcnJvcihSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9XUk9OR19NSU1FVFlQRVwiKSwge1xuXHRcdFx0ZGV0YWlsczpcblx0XHRcdFx0YDxwPjxzdHJvbmc+JHtSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX0ZJRUxEX0ZJTEVVUExPQURFUl9XUk9OR19NSU1FVFlQRV9ERVRBSUxTX1NFTEVDVEVEXCIpfTwvc3Ryb25nPjwvcD4ke1xuXHRcdFx0XHRcdG9FdmVudC5nZXRQYXJhbWV0ZXJzKCkubWltZVR5cGVcblx0XHRcdFx0fTxicj48YnI+YCArXG5cdFx0XHRcdGA8cD48c3Ryb25nPiR7UmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9GSUVMRF9GSUxFVVBMT0FERVJfV1JPTkdfTUlNRVRZUEVfREVUQUlMU19BTExPV0VEXCIpfTwvc3Ryb25nPjwvcD4ke29FdmVudFxuXHRcdFx0XHRcdC5nZXRTb3VyY2UoKVxuXHRcdFx0XHRcdC5nZXRNaW1lVHlwZSgpXG5cdFx0XHRcdFx0LnRvU3RyaW5nKClcblx0XHRcdFx0XHQucmVwbGFjZUFsbChcIixcIiwgXCIsIFwiKX1gLFxuXHRcdFx0Y29udGVudFdpZHRoOiBcIjE1MHB4XCJcblx0XHR9IGFzIGFueSk7XG5cdH0sXG5cblx0aGFuZGxlRmlsZVNpemVFeGNlZWQ6IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSAvKmlGaWxlU2l6ZTogYW55Ki8pIHtcblx0XHRNZXNzYWdlQm94LmVycm9yKFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fRklFTERfRklMRVVQTE9BREVSX0ZJTEVfVE9PX0JJR1wiLCBvRXZlbnQuZ2V0U291cmNlKCkuZ2V0TWF4aW11bUZpbGVTaXplKCkudG9GaXhlZCgzKSksIHtcblx0XHRcdGNvbnRlbnRXaWR0aDogXCIxNTBweFwiXG5cdFx0fSBhcyBhbnkpO1xuXHR9LFxuXG5cdF9nZXRFeHRlbnNpb25Db250cm9sbGVyOiBmdW5jdGlvbiAob0NvbnRyb2xsZXI6IGFueSkge1xuXHRcdHJldHVybiBvQ29udHJvbGxlci5pc0EoXCJzYXAuZmUuY29yZS5FeHRlbnNpb25BUElcIikgPyBvQ29udHJvbGxlci5fY29udHJvbGxlciA6IG9Db250cm9sbGVyO1xuXHR9XG59O1xuXG4vKipcbiAqIEBnbG9iYWxcbiAqL1xuZXhwb3J0IGRlZmF1bHQgRmllbGRSdW50aW1lO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQWtqQk8sZ0JBQWdCQSxJQUFJLEVBQUVDLE9BQU8sRUFBRTtJQUNyQyxJQUFJO01B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