/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/extend", "sap/base/util/ObjectPath", "sap/fe/core/helpers/ClassSupport", "sap/m/library", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/core/routing/HashChanger", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel"], function (Log, extend, ObjectPath, ClassSupport, library, Core, Fragment, ControllerExtension, OverrideExecution, HashChanger, XMLPreprocessor, XMLTemplateProcessor, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
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
  var oLastFocusedControl;

  /**
   * A controller extension offering hooks into the routing flow of the application
   *
   * @hideconstructor
   * @public
   * @since 1.86.0
   */
  var ShareUtils = (_dec = defineUI5Class("sap.fe.core.controllerextensions.Share"), _dec2 = methodOverride(), _dec3 = methodOverride(), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = extensible(OverrideExecution.After), _dec8 = publicExtension(), _dec9 = finalExtension(), _dec10 = publicExtension(), _dec11 = finalExtension(), _dec12 = publicExtension(), _dec13 = finalExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(ShareUtils, _ControllerExtension);
    function ShareUtils() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = ShareUtils.prototype;
    _proto.onInit = function onInit() {
      var collaborationInfoModel = new JSONModel({
        url: "",
        appTitle: "",
        subTitle: "",
        minifyUrlForChat: true
      });
      this.base.getView().setModel(collaborationInfoModel, "collaborationInfo");
    };
    _proto.onExit = function onExit() {
      var _this$base, _this$base$getView;
      var collaborationInfoModel = (_this$base = this.base) === null || _this$base === void 0 ? void 0 : (_this$base$getView = _this$base.getView()) === null || _this$base$getView === void 0 ? void 0 : _this$base$getView.getModel("collaborationInfo");
      if (collaborationInfoModel) {
        collaborationInfoModel.destroy();
      }
    }
    /**
     * Opens the share sheet.
     *
     * @function
     * @param oControl The control to which the ActionSheet is opened.
     * @alias sap.fe.core.controllerextensions.Share#openShareSheet
     * @public
     * @since 1.93.0
     */;
    _proto.openShareSheet = function openShareSheet(oControl) {
      this._openShareSheetImpl(oControl);
    }
    /**
     * Adapts the metadata used while sharing the page URL via 'Send Email', 'Share in SAP Jam', and 'Save as Tile'.
     *
     * @function
     * @param oShareMetadata Object containing the share metadata.
     * @param oShareMetadata.url Default URL that will be used via 'Send Email', 'Share in SAP Jam', and 'Save as Tile'
     * @param oShareMetadata.title Default title that will be used as 'email subject' in 'Send Email', 'share text' in 'Share in SAP Jam' and 'title' in 'Save as Tile'
     * @param oShareMetadata.email Email-specific metadata.
     * @param oShareMetadata.email.url URL that will be used specifically for 'Send Email'. This takes precedence over oShareMetadata.url.
     * @param oShareMetadata.email.title Title that will be used as "email subject" in 'Send Email'. This takes precedence over oShareMetadata.title.
     * @param oShareMetadata.jam SAP Jam-specific metadata.
     * @param oShareMetadata.jam.url URL that will be used specifically for 'Share in SAP Jam'. This takes precedence over oShareMetadata.url.
     * @param oShareMetadata.jam.title Title that will be used as 'share text' in 'Share in SAP Jam'. This takes precedence over oShareMetadata.title.
     * @param oShareMetadata.tile Save as Tile-specific metadata.
     * @param oShareMetadata.tile.url URL that will be used specifically for 'Save as Tile'. This takes precedence over oShareMetadata.url.
     * @param oShareMetadata.tile.title Title to be used for the tile. This takes precedence over oShareMetadata.title.
     * @param oShareMetadata.tile.subtitle Subtitle to be used for the tile.
     * @param oShareMetadata.tile.icon Icon to be used for the tile.
     * @param oShareMetadata.tile.queryUrl Query URL of an OData service from which data for a dynamic tile is read.
     * @returns Share Metadata or a Promise resolving the Share Metadata
     * @alias sap.fe.core.controllerextensions.Share#adaptShareMetadata
     * @public
     * @since 1.93.0
     */;
    _proto.adaptShareMetadata = function adaptShareMetadata(oShareMetadata) {
      return oShareMetadata;
    };
    _proto._openShareSheetImpl = function _openShareSheetImpl(by) {
      try {
        var _this2 = this;
        var oShareActionSheet;
        var sHash = HashChanger.getInstance().getHash(),
          sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "",
          oShareMetadata = {
            url: window.location.origin + window.location.pathname + window.location.search + (sHash ? sBasePath + sHash : window.location.hash),
            title: document.title,
            email: {
              url: "",
              title: ""
            },
            jam: {
              url: "",
              title: ""
            },
            tile: {
              url: "",
              title: "",
              subtitle: "",
              icon: "",
              queryUrl: ""
            }
          };
        oLastFocusedControl = by;
        var setShareEmailData = function (shareActionSheet, oModelData) {
          var oShareMailModel = shareActionSheet.getModel("shareData");
          var oNewMailData = extend(oShareMailModel.getData(), oModelData);
          oShareMailModel.setData(oNewMailData);
        };
        var _temp4 = _catch(function () {
          return Promise.resolve(Promise.resolve(_this2.adaptShareMetadata(oShareMetadata))).then(function (oModelData) {
            var fragmentController = {
              shareEmailPressed: function () {
                var oMailModel = oShareActionSheet.getModel("shareData");
                var oMailData = oMailModel.getData();
                var oResource = Core.getLibraryResourceBundle("sap.fe.core");
                var sEmailSubject = oMailData.email.title ? oMailData.email.title : oResource.getText("T_SHARE_UTIL_HELPER_SAPFE_EMAIL_SUBJECT", [oMailData.title]);
                library.URLHelper.triggerEmail(undefined, sEmailSubject, oMailData.email.url ? oMailData.email.url : oMailData.url);
              },
              shareMSTeamsPressed: function () {
                var msTeamsModel = oShareActionSheet.getModel("shareData");
                var msTeamsData = msTeamsModel.getData();
                var message = msTeamsData.email.title ? msTeamsData.email.title : msTeamsData.title;
                var url = msTeamsData.email.url ? msTeamsData.email.url : msTeamsData.url;
                var newWindowOpen = window.open("", "ms-teams-share-popup", "width=700,height=600");
                newWindowOpen.opener = null;
                newWindowOpen.location = "https://teams.microsoft.com/share?msgText=".concat(encodeURIComponent(message), "&href=").concat(encodeURIComponent(url));
              },
              onSaveTilePress: function () {
                // TODO it seems that the press event is executed before the dialog is available - adding a timeout is a cheap workaround
                setTimeout(function () {
                  var _Core$byId;
                  (_Core$byId = Core.byId("bookmarkDialog")) === null || _Core$byId === void 0 ? void 0 : _Core$byId.attachAfterClose(function () {
                    oLastFocusedControl.focus();
                  });
                }, 0);
              },
              shareJamPressed: function () {
                _this2._doOpenJamShareDialog(oModelData.jam.title ? oModelData.jam.title : oModelData.title, oModelData.jam.url ? oModelData.jam.url : oModelData.url);
              }
            };
            fragmentController.onCancelPressed = function () {
              oShareActionSheet.close();
            };
            fragmentController.setShareSheet = function (oShareSheet) {
              by.shareSheet = oShareSheet;
            };
            var oThis = new JSONModel({});
            var oPreprocessorSettings = {
              bindingContexts: {
                "this": oThis.createBindingContext("/")
              },
              models: {
                "this": oThis
              }
            };
            var oTileData = {
              title: oModelData.tile.title ? oModelData.tile.title : oModelData.title,
              subtitle: oModelData.tile.subtitle,
              icon: oModelData.tile.icon,
              url: oModelData.tile.url ? oModelData.tile.url : oModelData.url.substring(oModelData.url.indexOf("#")),
              queryUrl: oModelData.tile.queryUrl
            };
            var _temp2 = function () {
              if (by.shareSheet) {
                oShareActionSheet = by.shareSheet;
                var oShareModel = oShareActionSheet.getModel("share");
                _this2._setStaticShareData(oShareModel);
                var oNewData = extend(oShareModel.getData(), oTileData);
                oShareModel.setData(oNewData);
                setShareEmailData(oShareActionSheet, oModelData);
                oShareActionSheet.openBy(by);
              } else {
                var sFragmentName = "sap.fe.macros.share.ShareSheet";
                var oPopoverFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
                var _temp5 = _catch(function () {
                  return Promise.resolve(Promise.resolve(XMLPreprocessor.process(oPopoverFragment, {
                    name: sFragmentName
                  }, oPreprocessorSettings))).then(function (oFragment) {
                    return Promise.resolve(Fragment.load({
                      definition: oFragment,
                      controller: fragmentController
                    })).then(function (_Fragment$load) {
                      oShareActionSheet = _Fragment$load;
                      oShareActionSheet.setModel(new JSONModel(oTileData || {}), "share");
                      var oShareModel = oShareActionSheet.getModel("share");
                      _this2._setStaticShareData(oShareModel);
                      var oNewData = extend(oShareModel.getData(), oTileData);
                      oShareModel.setData(oNewData);
                      oShareActionSheet.setModel(new JSONModel(oModelData || {}), "shareData");
                      setShareEmailData(oShareActionSheet, oModelData);
                      by.addDependent(oShareActionSheet);
                      oShareActionSheet.openBy(by);
                      fragmentController.setShareSheet(oShareActionSheet);
                    });
                  });
                }, function (oError) {
                  Log.error("Error while opening the share fragment", oError);
                });
                if (_temp5 && _temp5.then) return _temp5.then(function () {});
              }
            }();
            if (_temp2 && _temp2.then) return _temp2.then(function () {});
          });
        }, function (oError) {
          Log.error("Error while fetching the share model data", oError);
        });
        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._setStaticShareData = function _setStaticShareData(shareModel) {
      var oResource = Core.getLibraryResourceBundle("sap.fe.core");
      shareModel.setProperty("/jamButtonText", oResource.getText("T_COMMON_SAPFE_SHARE_JAM"));
      shareModel.setProperty("/emailButtonText", oResource.getText("T_SEMANTIC_CONTROL_SEND_EMAIL"));
      shareModel.setProperty("/msTeamsShareButtonText", oResource.getText("T_COMMON_SAPFE_SHARE_MSTEAMS"));
      // Share to Microsoft Teams is feature which for now only gets enabled for selected customers.
      // The switch "sapHorizonEnabled" and check for it was aligned with the Fiori launchpad team.
      if (ObjectPath.get("sap-ushell-config.renderers.fiori2.componentData.config.sapHorizonEnabled") === true) {
        shareModel.setProperty("/msTeamsVisible", true);
      } else {
        shareModel.setProperty("/msTeamsVisible", false);
      }
      var fnGetUser = ObjectPath.get("sap.ushell.Container.getUser");
      shareModel.setProperty("/jamVisible", !!fnGetUser && fnGetUser().isJamActive());
      shareModel.setProperty("/saveAsTileVisible", !!(sap && sap.ushell && sap.ushell.Container));
    }
    //the actual opening of the JAM share dialog
    ;
    _proto._doOpenJamShareDialog = function _doOpenJamShareDialog(text, sUrl) {
      var oShareDialog = Core.createComponent({
        name: "sap.collaboration.components.fiori.sharing.dialog",
        settings: {
          object: {
            id: sUrl,
            share: text
          }
        }
      });
      oShareDialog.open();
    }
    /**
     * Triggers the email flow.
     *
     * @returns {void}
     * @private
     */;
    _proto._triggerEmail = function _triggerEmail() {
      try {
        var _this4 = this;
        return Promise.resolve(_this4._adaptShareMetadata()).then(function (shareMetadata) {
          var oResource = Core.getLibraryResourceBundle("sap.fe.core");
          var sEmailSubject = shareMetadata.email.title ? shareMetadata.email.title : oResource.getText("T_SHARE_UTIL_HELPER_SAPFE_EMAIL_SUBJECT", [shareMetadata.title]);
          library.URLHelper.triggerEmail(undefined, sEmailSubject, shareMetadata.email.url ? shareMetadata.email.url : shareMetadata.url);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Triggers the share to jam flow.
     *
     * @returns {void}
     * @private
     */
    ;
    _proto._triggerShareToJam = function _triggerShareToJam() {
      try {
        var _this6 = this;
        return Promise.resolve(_this6._adaptShareMetadata()).then(function (shareMetadata) {
          _this6._doOpenJamShareDialog(shareMetadata.jam.title ? shareMetadata.jam.title : shareMetadata.title, shareMetadata.jam.url ? shareMetadata.jam.url : window.location.origin + window.location.pathname + shareMetadata.url);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Triggers the save as tile flow.
     *
     * @param [source]
     * @returns {void}
     * @private
     */
    ;
    _proto._saveAsTile = function _saveAsTile(source) {
      try {
        var _this8 = this;
        return Promise.resolve(_this8._adaptShareMetadata()).then(function (shareMetadata) {
          var internalAddBookmarkButton = source.getDependents()[0];
          // set AddBookmarkButton properties
          internalAddBookmarkButton.setTitle(shareMetadata.tile.title ? shareMetadata.tile.title : shareMetadata.title);
          internalAddBookmarkButton.setSubtitle(shareMetadata.tile.subtitle);
          internalAddBookmarkButton.setTileIcon(shareMetadata.tile.icon);
          internalAddBookmarkButton.setCustomUrl(shareMetadata.tile.url ? shareMetadata.tile.url : shareMetadata.url);
          internalAddBookmarkButton.setServiceUrl(shareMetadata.tile.queryUrl);

          // addBookmarkButton fire press
          internalAddBookmarkButton.firePress();
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Call the adaptShareMetadata extension.
     *
     * @returns {object} Share Metadata
     * @private
     */
    ;
    _proto._adaptShareMetadata = function _adaptShareMetadata() {
      var sHash = HashChanger.getInstance().getHash(),
        sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "",
        oShareMetadata = {
          url: window.location.origin + window.location.pathname + window.location.search + (sHash ? sBasePath + sHash : window.location.hash),
          title: document.title,
          email: {
            url: "",
            title: ""
          },
          jam: {
            url: "",
            title: ""
          },
          tile: {
            url: "",
            title: "",
            subtitle: "",
            icon: "",
            queryUrl: ""
          }
        };
      return this.adaptShareMetadata(oShareMetadata);
    };
    return ShareUtils;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onExit", [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onExit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "openShareSheet", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "openShareSheet"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptShareMetadata", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptShareMetadata"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_triggerEmail", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "_triggerEmail"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_triggerShareToJam", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "_triggerShareToJam"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_saveAsTile", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "_saveAsTile"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_adaptShareMetadata", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "_adaptShareMetadata"), _class2.prototype)), _class2)) || _class);
  return ShareUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwib0xhc3RGb2N1c2VkQ29udHJvbCIsIlNoYXJlVXRpbHMiLCJkZWZpbmVVSTVDbGFzcyIsIm1ldGhvZE92ZXJyaWRlIiwicHVibGljRXh0ZW5zaW9uIiwiZmluYWxFeHRlbnNpb24iLCJleHRlbnNpYmxlIiwiT3ZlcnJpZGVFeGVjdXRpb24iLCJBZnRlciIsIm9uSW5pdCIsImNvbGxhYm9yYXRpb25JbmZvTW9kZWwiLCJKU09OTW9kZWwiLCJ1cmwiLCJhcHBUaXRsZSIsInN1YlRpdGxlIiwibWluaWZ5VXJsRm9yQ2hhdCIsImJhc2UiLCJnZXRWaWV3Iiwic2V0TW9kZWwiLCJvbkV4aXQiLCJnZXRNb2RlbCIsImRlc3Ryb3kiLCJvcGVuU2hhcmVTaGVldCIsIm9Db250cm9sIiwiX29wZW5TaGFyZVNoZWV0SW1wbCIsImFkYXB0U2hhcmVNZXRhZGF0YSIsIm9TaGFyZU1ldGFkYXRhIiwiYnkiLCJvU2hhcmVBY3Rpb25TaGVldCIsInNIYXNoIiwiSGFzaENoYW5nZXIiLCJnZXRJbnN0YW5jZSIsImdldEhhc2giLCJzQmFzZVBhdGgiLCJocmVmRm9yQXBwU3BlY2lmaWNIYXNoIiwid2luZG93IiwibG9jYXRpb24iLCJvcmlnaW4iLCJwYXRobmFtZSIsInNlYXJjaCIsImhhc2giLCJ0aXRsZSIsImRvY3VtZW50IiwiZW1haWwiLCJqYW0iLCJ0aWxlIiwic3VidGl0bGUiLCJpY29uIiwicXVlcnlVcmwiLCJzZXRTaGFyZUVtYWlsRGF0YSIsInNoYXJlQWN0aW9uU2hlZXQiLCJvTW9kZWxEYXRhIiwib1NoYXJlTWFpbE1vZGVsIiwib05ld01haWxEYXRhIiwiZXh0ZW5kIiwiZ2V0RGF0YSIsInNldERhdGEiLCJQcm9taXNlIiwicmVzb2x2ZSIsImZyYWdtZW50Q29udHJvbGxlciIsInNoYXJlRW1haWxQcmVzc2VkIiwib01haWxNb2RlbCIsIm9NYWlsRGF0YSIsIm9SZXNvdXJjZSIsIkNvcmUiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJzRW1haWxTdWJqZWN0IiwiZ2V0VGV4dCIsImxpYnJhcnkiLCJVUkxIZWxwZXIiLCJ0cmlnZ2VyRW1haWwiLCJ1bmRlZmluZWQiLCJzaGFyZU1TVGVhbXNQcmVzc2VkIiwibXNUZWFtc01vZGVsIiwibXNUZWFtc0RhdGEiLCJtZXNzYWdlIiwibmV3V2luZG93T3BlbiIsIm9wZW4iLCJvcGVuZXIiLCJlbmNvZGVVUklDb21wb25lbnQiLCJvblNhdmVUaWxlUHJlc3MiLCJzZXRUaW1lb3V0IiwiYnlJZCIsImF0dGFjaEFmdGVyQ2xvc2UiLCJmb2N1cyIsInNoYXJlSmFtUHJlc3NlZCIsIl9kb09wZW5KYW1TaGFyZURpYWxvZyIsIm9uQ2FuY2VsUHJlc3NlZCIsImNsb3NlIiwic2V0U2hhcmVTaGVldCIsIm9TaGFyZVNoZWV0Iiwic2hhcmVTaGVldCIsIm9UaGlzIiwib1ByZXByb2Nlc3NvclNldHRpbmdzIiwiYmluZGluZ0NvbnRleHRzIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJtb2RlbHMiLCJvVGlsZURhdGEiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwib1NoYXJlTW9kZWwiLCJfc2V0U3RhdGljU2hhcmVEYXRhIiwib05ld0RhdGEiLCJvcGVuQnkiLCJzRnJhZ21lbnROYW1lIiwib1BvcG92ZXJGcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsIm5hbWUiLCJvRnJhZ21lbnQiLCJGcmFnbWVudCIsImxvYWQiLCJkZWZpbml0aW9uIiwiY29udHJvbGxlciIsImFkZERlcGVuZGVudCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwic2hhcmVNb2RlbCIsInNldFByb3BlcnR5IiwiT2JqZWN0UGF0aCIsImdldCIsImZuR2V0VXNlciIsImlzSmFtQWN0aXZlIiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwidGV4dCIsInNVcmwiLCJvU2hhcmVEaWFsb2ciLCJjcmVhdGVDb21wb25lbnQiLCJzZXR0aW5ncyIsIm9iamVjdCIsImlkIiwic2hhcmUiLCJfdHJpZ2dlckVtYWlsIiwiX2FkYXB0U2hhcmVNZXRhZGF0YSIsInNoYXJlTWV0YWRhdGEiLCJfdHJpZ2dlclNoYXJlVG9KYW0iLCJfc2F2ZUFzVGlsZSIsInNvdXJjZSIsImludGVybmFsQWRkQm9va21hcmtCdXR0b24iLCJnZXREZXBlbmRlbnRzIiwic2V0VGl0bGUiLCJzZXRTdWJ0aXRsZSIsInNldFRpbGVJY29uIiwic2V0Q3VzdG9tVXJsIiwic2V0U2VydmljZVVybCIsImZpcmVQcmVzcyIsIkNvbnRyb2xsZXJFeHRlbnNpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlNoYXJlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGV4dGVuZCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9leHRlbmRcIjtcbmltcG9ydCBPYmplY3RQYXRoIGZyb20gXCJzYXAvYmFzZS91dGlsL09iamVjdFBhdGhcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBleHRlbnNpYmxlLCBmaW5hbEV4dGVuc2lvbiwgbWV0aG9kT3ZlcnJpZGUsIHB1YmxpY0V4dGVuc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgQWN0aW9uU2hlZXQgZnJvbSBcInNhcC9tL0FjdGlvblNoZWV0XCI7XG5pbXBvcnQgdHlwZSBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IGxpYnJhcnkgZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgSGFzaENoYW5nZXIgZnJvbSBcInNhcC91aS9jb3JlL3JvdXRpbmcvSGFzaENoYW5nZXJcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgWE1MVGVtcGxhdGVQcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL1hNTFRlbXBsYXRlUHJvY2Vzc29yXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCIuLi9QYWdlQ29udHJvbGxlclwiO1xuXG5sZXQgb0xhc3RGb2N1c2VkQ29udHJvbDogQ29udHJvbDtcblxuLyoqXG4gKiBBIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIG9mZmVyaW5nIGhvb2tzIGludG8gdGhlIHJvdXRpbmcgZmxvdyBvZiB0aGUgYXBwbGljYXRpb25cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS44Ni4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlNoYXJlXCIpXG5jbGFzcyBTaGFyZVV0aWxzIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cdEBtZXRob2RPdmVycmlkZSgpXG5cdG9uSW5pdCgpOiB2b2lkIHtcblx0XHRjb25zdCBjb2xsYWJvcmF0aW9uSW5mb01vZGVsOiBKU09OTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdHVybDogXCJcIixcblx0XHRcdGFwcFRpdGxlOiBcIlwiLFxuXHRcdFx0c3ViVGl0bGU6IFwiXCIsXG5cdFx0XHRtaW5pZnlVcmxGb3JDaGF0OiB0cnVlXG5cdFx0fSk7XG5cdFx0dGhpcy5iYXNlLmdldFZpZXcoKS5zZXRNb2RlbChjb2xsYWJvcmF0aW9uSW5mb01vZGVsLCBcImNvbGxhYm9yYXRpb25JbmZvXCIpO1xuXHR9XG5cdEBtZXRob2RPdmVycmlkZSgpXG5cdG9uRXhpdCgpOiB2b2lkIHtcblx0XHRjb25zdCBjb2xsYWJvcmF0aW9uSW5mb01vZGVsOiBKU09OTW9kZWwgPSB0aGlzLmJhc2U/LmdldFZpZXcoKT8uZ2V0TW9kZWwoXCJjb2xsYWJvcmF0aW9uSW5mb1wiKSBhcyBKU09OTW9kZWw7XG5cdFx0aWYgKGNvbGxhYm9yYXRpb25JbmZvTW9kZWwpIHtcblx0XHRcdGNvbGxhYm9yYXRpb25JbmZvTW9kZWwuZGVzdHJveSgpO1xuXHRcdH1cblx0fVxuXHQvKipcblx0ICogT3BlbnMgdGhlIHNoYXJlIHNoZWV0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBjb250cm9sIHRvIHdoaWNoIHRoZSBBY3Rpb25TaGVldCBpcyBvcGVuZWQuXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5TaGFyZSNvcGVuU2hhcmVTaGVldFxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkzLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRvcGVuU2hhcmVTaGVldChvQ29udHJvbDogb2JqZWN0KSB7XG5cdFx0dGhpcy5fb3BlblNoYXJlU2hlZXRJbXBsKG9Db250cm9sKTtcblx0fVxuXHQvKipcblx0ICogQWRhcHRzIHRoZSBtZXRhZGF0YSB1c2VkIHdoaWxlIHNoYXJpbmcgdGhlIHBhZ2UgVVJMIHZpYSAnU2VuZCBFbWFpbCcsICdTaGFyZSBpbiBTQVAgSmFtJywgYW5kICdTYXZlIGFzIFRpbGUnLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBzaGFyZSBtZXRhZGF0YS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnVybCBEZWZhdWx0IFVSTCB0aGF0IHdpbGwgYmUgdXNlZCB2aWEgJ1NlbmQgRW1haWwnLCAnU2hhcmUgaW4gU0FQIEphbScsIGFuZCAnU2F2ZSBhcyBUaWxlJ1xuXHQgKiBAcGFyYW0gb1NoYXJlTWV0YWRhdGEudGl0bGUgRGVmYXVsdCB0aXRsZSB0aGF0IHdpbGwgYmUgdXNlZCBhcyAnZW1haWwgc3ViamVjdCcgaW4gJ1NlbmQgRW1haWwnLCAnc2hhcmUgdGV4dCcgaW4gJ1NoYXJlIGluIFNBUCBKYW0nIGFuZCAndGl0bGUnIGluICdTYXZlIGFzIFRpbGUnXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS5lbWFpbCBFbWFpbC1zcGVjaWZpYyBtZXRhZGF0YS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLmVtYWlsLnVybCBVUkwgdGhhdCB3aWxsIGJlIHVzZWQgc3BlY2lmaWNhbGx5IGZvciAnU2VuZCBFbWFpbCcuIFRoaXMgdGFrZXMgcHJlY2VkZW5jZSBvdmVyIG9TaGFyZU1ldGFkYXRhLnVybC5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLmVtYWlsLnRpdGxlIFRpdGxlIHRoYXQgd2lsbCBiZSB1c2VkIGFzIFwiZW1haWwgc3ViamVjdFwiIGluICdTZW5kIEVtYWlsJy4gVGhpcyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgb1NoYXJlTWV0YWRhdGEudGl0bGUuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS5qYW0gU0FQIEphbS1zcGVjaWZpYyBtZXRhZGF0YS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLmphbS51cmwgVVJMIHRoYXQgd2lsbCBiZSB1c2VkIHNwZWNpZmljYWxseSBmb3IgJ1NoYXJlIGluIFNBUCBKYW0nLiBUaGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBvU2hhcmVNZXRhZGF0YS51cmwuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS5qYW0udGl0bGUgVGl0bGUgdGhhdCB3aWxsIGJlIHVzZWQgYXMgJ3NoYXJlIHRleHQnIGluICdTaGFyZSBpbiBTQVAgSmFtJy4gVGhpcyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgb1NoYXJlTWV0YWRhdGEudGl0bGUuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS50aWxlIFNhdmUgYXMgVGlsZS1zcGVjaWZpYyBtZXRhZGF0YS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnRpbGUudXJsIFVSTCB0aGF0IHdpbGwgYmUgdXNlZCBzcGVjaWZpY2FsbHkgZm9yICdTYXZlIGFzIFRpbGUnLiBUaGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBvU2hhcmVNZXRhZGF0YS51cmwuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS50aWxlLnRpdGxlIFRpdGxlIHRvIGJlIHVzZWQgZm9yIHRoZSB0aWxlLiBUaGlzIHRha2VzIHByZWNlZGVuY2Ugb3ZlciBvU2hhcmVNZXRhZGF0YS50aXRsZS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnRpbGUuc3VidGl0bGUgU3VidGl0bGUgdG8gYmUgdXNlZCBmb3IgdGhlIHRpbGUuXG5cdCAqIEBwYXJhbSBvU2hhcmVNZXRhZGF0YS50aWxlLmljb24gSWNvbiB0byBiZSB1c2VkIGZvciB0aGUgdGlsZS5cblx0ICogQHBhcmFtIG9TaGFyZU1ldGFkYXRhLnRpbGUucXVlcnlVcmwgUXVlcnkgVVJMIG9mIGFuIE9EYXRhIHNlcnZpY2UgZnJvbSB3aGljaCBkYXRhIGZvciBhIGR5bmFtaWMgdGlsZSBpcyByZWFkLlxuXHQgKiBAcmV0dXJucyBTaGFyZSBNZXRhZGF0YSBvciBhIFByb21pc2UgcmVzb2x2aW5nIHRoZSBTaGFyZSBNZXRhZGF0YVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuU2hhcmUjYWRhcHRTaGFyZU1ldGFkYXRhXG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTMuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHRhZGFwdFNoYXJlTWV0YWRhdGEob1NoYXJlTWV0YWRhdGE6IHtcblx0XHR1cmw6IHN0cmluZztcblx0XHR0aXRsZTogc3RyaW5nO1xuXHRcdGVtYWlsPzogeyB1cmw6IHN0cmluZzsgdGl0bGU6IHN0cmluZyB9O1xuXHRcdGphbT86IHsgdXJsOiBzdHJpbmc7IHRpdGxlOiBzdHJpbmcgfTtcblx0XHR0aWxlPzogeyB1cmw6IHN0cmluZzsgdGl0bGU6IHN0cmluZzsgc3VidGl0bGU6IHN0cmluZzsgaWNvbjogc3RyaW5nOyBxdWVyeVVybDogc3RyaW5nIH07XG5cdH0pOiBvYmplY3QgfCBQcm9taXNlPG9iamVjdD4ge1xuXHRcdHJldHVybiBvU2hhcmVNZXRhZGF0YTtcblx0fVxuXHRhc3luYyBfb3BlblNoYXJlU2hlZXRJbXBsKGJ5OiBhbnkpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRsZXQgb1NoYXJlQWN0aW9uU2hlZXQ6IEFjdGlvblNoZWV0O1xuXHRcdGNvbnN0IHNIYXNoID0gSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKS5nZXRIYXNoKCksXG5cdFx0XHRzQmFzZVBhdGggPSAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2hcblx0XHRcdFx0PyAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2goXCJcIilcblx0XHRcdFx0OiBcIlwiLFxuXHRcdFx0b1NoYXJlTWV0YWRhdGEgPSB7XG5cdFx0XHRcdHVybDpcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24ub3JpZ2luICtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgK1xuXHRcdFx0XHRcdHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggK1xuXHRcdFx0XHRcdChzSGFzaCA/IHNCYXNlUGF0aCArIHNIYXNoIDogd2luZG93LmxvY2F0aW9uLmhhc2gpLFxuXHRcdFx0XHR0aXRsZTogZG9jdW1lbnQudGl0bGUsXG5cdFx0XHRcdGVtYWlsOiB7XG5cdFx0XHRcdFx0dXJsOiBcIlwiLFxuXHRcdFx0XHRcdHRpdGxlOiBcIlwiXG5cdFx0XHRcdH0sXG5cdFx0XHRcdGphbToge1xuXHRcdFx0XHRcdHVybDogXCJcIixcblx0XHRcdFx0XHR0aXRsZTogXCJcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0aWxlOiB7XG5cdFx0XHRcdFx0dXJsOiBcIlwiLFxuXHRcdFx0XHRcdHRpdGxlOiBcIlwiLFxuXHRcdFx0XHRcdHN1YnRpdGxlOiBcIlwiLFxuXHRcdFx0XHRcdGljb246IFwiXCIsXG5cdFx0XHRcdFx0cXVlcnlVcmw6IFwiXCJcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRvTGFzdEZvY3VzZWRDb250cm9sID0gYnk7XG5cblx0XHRjb25zdCBzZXRTaGFyZUVtYWlsRGF0YSA9IGZ1bmN0aW9uIChzaGFyZUFjdGlvblNoZWV0OiBhbnksIG9Nb2RlbERhdGE6IGFueSkge1xuXHRcdFx0Y29uc3Qgb1NoYXJlTWFpbE1vZGVsID0gc2hhcmVBY3Rpb25TaGVldC5nZXRNb2RlbChcInNoYXJlRGF0YVwiKTtcblx0XHRcdGNvbnN0IG9OZXdNYWlsRGF0YSA9IGV4dGVuZChvU2hhcmVNYWlsTW9kZWwuZ2V0RGF0YSgpLCBvTW9kZWxEYXRhKTtcblx0XHRcdG9TaGFyZU1haWxNb2RlbC5zZXREYXRhKG9OZXdNYWlsRGF0YSk7XG5cdFx0fTtcblxuXHRcdHRyeSB7XG5cdFx0XHRjb25zdCBvTW9kZWxEYXRhOiBhbnkgPSBhd2FpdCBQcm9taXNlLnJlc29sdmUodGhpcy5hZGFwdFNoYXJlTWV0YWRhdGEob1NoYXJlTWV0YWRhdGEpKTtcblx0XHRcdGNvbnN0IGZyYWdtZW50Q29udHJvbGxlcjogYW55ID0ge1xuXHRcdFx0XHRzaGFyZUVtYWlsUHJlc3NlZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGNvbnN0IG9NYWlsTW9kZWwgPSBvU2hhcmVBY3Rpb25TaGVldC5nZXRNb2RlbChcInNoYXJlRGF0YVwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRcdFx0Y29uc3Qgb01haWxEYXRhID0gb01haWxNb2RlbC5nZXREYXRhKCk7XG5cdFx0XHRcdFx0Y29uc3Qgb1Jlc291cmNlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRcdFx0XHRjb25zdCBzRW1haWxTdWJqZWN0ID0gb01haWxEYXRhLmVtYWlsLnRpdGxlXG5cdFx0XHRcdFx0XHQ/IG9NYWlsRGF0YS5lbWFpbC50aXRsZVxuXHRcdFx0XHRcdFx0OiBvUmVzb3VyY2UuZ2V0VGV4dChcIlRfU0hBUkVfVVRJTF9IRUxQRVJfU0FQRkVfRU1BSUxfU1VCSkVDVFwiLCBbb01haWxEYXRhLnRpdGxlXSk7XG5cdFx0XHRcdFx0bGlicmFyeS5VUkxIZWxwZXIudHJpZ2dlckVtYWlsKHVuZGVmaW5lZCwgc0VtYWlsU3ViamVjdCwgb01haWxEYXRhLmVtYWlsLnVybCA/IG9NYWlsRGF0YS5lbWFpbC51cmwgOiBvTWFpbERhdGEudXJsKTtcblx0XHRcdFx0fSxcblx0XHRcdFx0c2hhcmVNU1RlYW1zUHJlc3NlZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGNvbnN0IG1zVGVhbXNNb2RlbCA9IG9TaGFyZUFjdGlvblNoZWV0LmdldE1vZGVsKFwic2hhcmVEYXRhXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdFx0XHRjb25zdCBtc1RlYW1zRGF0YSA9IG1zVGVhbXNNb2RlbC5nZXREYXRhKCk7XG5cdFx0XHRcdFx0Y29uc3QgbWVzc2FnZSA9IG1zVGVhbXNEYXRhLmVtYWlsLnRpdGxlID8gbXNUZWFtc0RhdGEuZW1haWwudGl0bGUgOiBtc1RlYW1zRGF0YS50aXRsZTtcblx0XHRcdFx0XHRjb25zdCB1cmwgPSBtc1RlYW1zRGF0YS5lbWFpbC51cmwgPyBtc1RlYW1zRGF0YS5lbWFpbC51cmwgOiBtc1RlYW1zRGF0YS51cmw7XG5cdFx0XHRcdFx0Y29uc3QgbmV3V2luZG93T3BlbiA9IHdpbmRvdy5vcGVuKFwiXCIsIFwibXMtdGVhbXMtc2hhcmUtcG9wdXBcIiwgXCJ3aWR0aD03MDAsaGVpZ2h0PTYwMFwiKTtcblx0XHRcdFx0XHRuZXdXaW5kb3dPcGVuIS5vcGVuZXIgPSBudWxsO1xuXHRcdFx0XHRcdG5ld1dpbmRvd09wZW4hLmxvY2F0aW9uID0gYGh0dHBzOi8vdGVhbXMubWljcm9zb2Z0LmNvbS9zaGFyZT9tc2dUZXh0PSR7ZW5jb2RlVVJJQ29tcG9uZW50KFxuXHRcdFx0XHRcdFx0bWVzc2FnZVxuXHRcdFx0XHRcdCl9JmhyZWY9JHtlbmNvZGVVUklDb21wb25lbnQodXJsKX1gO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRvblNhdmVUaWxlUHJlc3M6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHQvLyBUT0RPIGl0IHNlZW1zIHRoYXQgdGhlIHByZXNzIGV2ZW50IGlzIGV4ZWN1dGVkIGJlZm9yZSB0aGUgZGlhbG9nIGlzIGF2YWlsYWJsZSAtIGFkZGluZyBhIHRpbWVvdXQgaXMgYSBjaGVhcCB3b3JrYXJvdW5kXG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHQoQ29yZS5ieUlkKFwiYm9va21hcmtEaWFsb2dcIikgYXMgRGlhbG9nKT8uYXR0YWNoQWZ0ZXJDbG9zZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdG9MYXN0Rm9jdXNlZENvbnRyb2wuZm9jdXMoKTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0sIDApO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzaGFyZUphbVByZXNzZWQ6ICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLl9kb09wZW5KYW1TaGFyZURpYWxvZyhcblx0XHRcdFx0XHRcdG9Nb2RlbERhdGEuamFtLnRpdGxlID8gb01vZGVsRGF0YS5qYW0udGl0bGUgOiBvTW9kZWxEYXRhLnRpdGxlLFxuXHRcdFx0XHRcdFx0b01vZGVsRGF0YS5qYW0udXJsID8gb01vZGVsRGF0YS5qYW0udXJsIDogb01vZGVsRGF0YS51cmxcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRmcmFnbWVudENvbnRyb2xsZXIub25DYW5jZWxQcmVzc2VkID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRvU2hhcmVBY3Rpb25TaGVldC5jbG9zZSgpO1xuXHRcdFx0fTtcblxuXHRcdFx0ZnJhZ21lbnRDb250cm9sbGVyLnNldFNoYXJlU2hlZXQgPSBmdW5jdGlvbiAob1NoYXJlU2hlZXQ6IGFueSkge1xuXHRcdFx0XHRieS5zaGFyZVNoZWV0ID0gb1NoYXJlU2hlZXQ7XG5cdFx0XHR9O1xuXG5cdFx0XHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe30pO1xuXHRcdFx0Y29uc3Qgb1ByZXByb2Nlc3NvclNldHRpbmdzID0ge1xuXHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcInRoaXNcIjogb1RoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFwidGhpc1wiOiBvVGhpc1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0Y29uc3Qgb1RpbGVEYXRhID0ge1xuXHRcdFx0XHR0aXRsZTogb01vZGVsRGF0YS50aWxlLnRpdGxlID8gb01vZGVsRGF0YS50aWxlLnRpdGxlIDogb01vZGVsRGF0YS50aXRsZSxcblx0XHRcdFx0c3VidGl0bGU6IG9Nb2RlbERhdGEudGlsZS5zdWJ0aXRsZSxcblx0XHRcdFx0aWNvbjogb01vZGVsRGF0YS50aWxlLmljb24sXG5cdFx0XHRcdHVybDogb01vZGVsRGF0YS50aWxlLnVybCA/IG9Nb2RlbERhdGEudGlsZS51cmwgOiBvTW9kZWxEYXRhLnVybC5zdWJzdHJpbmcob01vZGVsRGF0YS51cmwuaW5kZXhPZihcIiNcIikpLFxuXHRcdFx0XHRxdWVyeVVybDogb01vZGVsRGF0YS50aWxlLnF1ZXJ5VXJsXG5cdFx0XHR9O1xuXHRcdFx0aWYgKGJ5LnNoYXJlU2hlZXQpIHtcblx0XHRcdFx0b1NoYXJlQWN0aW9uU2hlZXQgPSBieS5zaGFyZVNoZWV0O1xuXG5cdFx0XHRcdGNvbnN0IG9TaGFyZU1vZGVsID0gb1NoYXJlQWN0aW9uU2hlZXQuZ2V0TW9kZWwoXCJzaGFyZVwiKSBhcyBKU09OTW9kZWw7XG5cdFx0XHRcdHRoaXMuX3NldFN0YXRpY1NoYXJlRGF0YShvU2hhcmVNb2RlbCk7XG5cdFx0XHRcdGNvbnN0IG9OZXdEYXRhID0gZXh0ZW5kKG9TaGFyZU1vZGVsLmdldERhdGEoKSwgb1RpbGVEYXRhKTtcblx0XHRcdFx0b1NoYXJlTW9kZWwuc2V0RGF0YShvTmV3RGF0YSk7XG5cdFx0XHRcdHNldFNoYXJlRW1haWxEYXRhKG9TaGFyZUFjdGlvblNoZWV0LCBvTW9kZWxEYXRhKTtcblx0XHRcdFx0b1NoYXJlQWN0aW9uU2hlZXQub3BlbkJ5KGJ5KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHNGcmFnbWVudE5hbWUgPSBcInNhcC5mZS5tYWNyb3Muc2hhcmUuU2hhcmVTaGVldFwiO1xuXHRcdFx0XHRjb25zdCBvUG9wb3ZlckZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIik7XG5cblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCBvRnJhZ21lbnQgPSBhd2FpdCBQcm9taXNlLnJlc29sdmUoXG5cdFx0XHRcdFx0XHRYTUxQcmVwcm9jZXNzb3IucHJvY2VzcyhvUG9wb3ZlckZyYWdtZW50LCB7IG5hbWU6IHNGcmFnbWVudE5hbWUgfSwgb1ByZXByb2Nlc3NvclNldHRpbmdzKVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0b1NoYXJlQWN0aW9uU2hlZXQgPSAoYXdhaXQgRnJhZ21lbnQubG9hZCh7IGRlZmluaXRpb246IG9GcmFnbWVudCwgY29udHJvbGxlcjogZnJhZ21lbnRDb250cm9sbGVyIH0pKSBhcyBhbnk7XG5cblx0XHRcdFx0XHRvU2hhcmVBY3Rpb25TaGVldC5zZXRNb2RlbChuZXcgSlNPTk1vZGVsKG9UaWxlRGF0YSB8fCB7fSksIFwic2hhcmVcIik7XG5cdFx0XHRcdFx0Y29uc3Qgb1NoYXJlTW9kZWwgPSBvU2hhcmVBY3Rpb25TaGVldC5nZXRNb2RlbChcInNoYXJlXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdFx0XHR0aGlzLl9zZXRTdGF0aWNTaGFyZURhdGEob1NoYXJlTW9kZWwpO1xuXHRcdFx0XHRcdGNvbnN0IG9OZXdEYXRhID0gZXh0ZW5kKG9TaGFyZU1vZGVsLmdldERhdGEoKSwgb1RpbGVEYXRhKTtcblx0XHRcdFx0XHRvU2hhcmVNb2RlbC5zZXREYXRhKG9OZXdEYXRhKTtcblxuXHRcdFx0XHRcdG9TaGFyZUFjdGlvblNoZWV0LnNldE1vZGVsKG5ldyBKU09OTW9kZWwob01vZGVsRGF0YSB8fCB7fSksIFwic2hhcmVEYXRhXCIpO1xuXHRcdFx0XHRcdHNldFNoYXJlRW1haWxEYXRhKG9TaGFyZUFjdGlvblNoZWV0LCBvTW9kZWxEYXRhKTtcblxuXHRcdFx0XHRcdGJ5LmFkZERlcGVuZGVudChvU2hhcmVBY3Rpb25TaGVldCk7XG5cdFx0XHRcdFx0b1NoYXJlQWN0aW9uU2hlZXQub3BlbkJ5KGJ5KTtcblx0XHRcdFx0XHRmcmFnbWVudENvbnRyb2xsZXIuc2V0U2hhcmVTaGVldChvU2hhcmVBY3Rpb25TaGVldCk7XG5cdFx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgb3BlbmluZyB0aGUgc2hhcmUgZnJhZ21lbnRcIiwgb0Vycm9yKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSBmZXRjaGluZyB0aGUgc2hhcmUgbW9kZWwgZGF0YVwiLCBvRXJyb3IpO1xuXHRcdH1cblx0fVxuXHRfc2V0U3RhdGljU2hhcmVEYXRhKHNoYXJlTW9kZWw6IGFueSkge1xuXHRcdGNvbnN0IG9SZXNvdXJjZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0c2hhcmVNb2RlbC5zZXRQcm9wZXJ0eShcIi9qYW1CdXR0b25UZXh0XCIsIG9SZXNvdXJjZS5nZXRUZXh0KFwiVF9DT01NT05fU0FQRkVfU0hBUkVfSkFNXCIpKTtcblx0XHRzaGFyZU1vZGVsLnNldFByb3BlcnR5KFwiL2VtYWlsQnV0dG9uVGV4dFwiLCBvUmVzb3VyY2UuZ2V0VGV4dChcIlRfU0VNQU5USUNfQ09OVFJPTF9TRU5EX0VNQUlMXCIpKTtcblx0XHRzaGFyZU1vZGVsLnNldFByb3BlcnR5KFwiL21zVGVhbXNTaGFyZUJ1dHRvblRleHRcIiwgb1Jlc291cmNlLmdldFRleHQoXCJUX0NPTU1PTl9TQVBGRV9TSEFSRV9NU1RFQU1TXCIpKTtcblx0XHQvLyBTaGFyZSB0byBNaWNyb3NvZnQgVGVhbXMgaXMgZmVhdHVyZSB3aGljaCBmb3Igbm93IG9ubHkgZ2V0cyBlbmFibGVkIGZvciBzZWxlY3RlZCBjdXN0b21lcnMuXG5cdFx0Ly8gVGhlIHN3aXRjaCBcInNhcEhvcml6b25FbmFibGVkXCIgYW5kIGNoZWNrIGZvciBpdCB3YXMgYWxpZ25lZCB3aXRoIHRoZSBGaW9yaSBsYXVuY2hwYWQgdGVhbS5cblx0XHRpZiAoT2JqZWN0UGF0aC5nZXQoXCJzYXAtdXNoZWxsLWNvbmZpZy5yZW5kZXJlcnMuZmlvcmkyLmNvbXBvbmVudERhdGEuY29uZmlnLnNhcEhvcml6b25FbmFibGVkXCIpID09PSB0cnVlKSB7XG5cdFx0XHRzaGFyZU1vZGVsLnNldFByb3BlcnR5KFwiL21zVGVhbXNWaXNpYmxlXCIsIHRydWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzaGFyZU1vZGVsLnNldFByb3BlcnR5KFwiL21zVGVhbXNWaXNpYmxlXCIsIGZhbHNlKTtcblx0XHR9XG5cdFx0Y29uc3QgZm5HZXRVc2VyID0gT2JqZWN0UGF0aC5nZXQoXCJzYXAudXNoZWxsLkNvbnRhaW5lci5nZXRVc2VyXCIpO1xuXHRcdHNoYXJlTW9kZWwuc2V0UHJvcGVydHkoXCIvamFtVmlzaWJsZVwiLCAhIWZuR2V0VXNlciAmJiBmbkdldFVzZXIoKS5pc0phbUFjdGl2ZSgpKTtcblx0XHRzaGFyZU1vZGVsLnNldFByb3BlcnR5KFwiL3NhdmVBc1RpbGVWaXNpYmxlXCIsICEhKHNhcCAmJiBzYXAudXNoZWxsICYmIHNhcC51c2hlbGwuQ29udGFpbmVyKSk7XG5cdH1cblx0Ly90aGUgYWN0dWFsIG9wZW5pbmcgb2YgdGhlIEpBTSBzaGFyZSBkaWFsb2dcblx0X2RvT3BlbkphbVNoYXJlRGlhbG9nKHRleHQ6IGFueSwgc1VybD86IGFueSkge1xuXHRcdGNvbnN0IG9TaGFyZURpYWxvZyA9IENvcmUuY3JlYXRlQ29tcG9uZW50KHtcblx0XHRcdG5hbWU6IFwic2FwLmNvbGxhYm9yYXRpb24uY29tcG9uZW50cy5maW9yaS5zaGFyaW5nLmRpYWxvZ1wiLFxuXHRcdFx0c2V0dGluZ3M6IHtcblx0XHRcdFx0b2JqZWN0OiB7XG5cdFx0XHRcdFx0aWQ6IHNVcmwsXG5cdFx0XHRcdFx0c2hhcmU6IHRleHRcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdChvU2hhcmVEaWFsb2cgYXMgYW55KS5vcGVuKCk7XG5cdH1cblx0LyoqXG5cdCAqIFRyaWdnZXJzIHRoZSBlbWFpbCBmbG93LlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBfdHJpZ2dlckVtYWlsKCkge1xuXHRcdGNvbnN0IHNoYXJlTWV0YWRhdGE6IGFueSA9IGF3YWl0IHRoaXMuX2FkYXB0U2hhcmVNZXRhZGF0YSgpO1xuXHRcdGNvbnN0IG9SZXNvdXJjZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0Y29uc3Qgc0VtYWlsU3ViamVjdCA9IHNoYXJlTWV0YWRhdGEuZW1haWwudGl0bGVcblx0XHRcdD8gc2hhcmVNZXRhZGF0YS5lbWFpbC50aXRsZVxuXHRcdFx0OiBvUmVzb3VyY2UuZ2V0VGV4dChcIlRfU0hBUkVfVVRJTF9IRUxQRVJfU0FQRkVfRU1BSUxfU1VCSkVDVFwiLCBbc2hhcmVNZXRhZGF0YS50aXRsZV0pO1xuXHRcdGxpYnJhcnkuVVJMSGVscGVyLnRyaWdnZXJFbWFpbCh1bmRlZmluZWQsIHNFbWFpbFN1YmplY3QsIHNoYXJlTWV0YWRhdGEuZW1haWwudXJsID8gc2hhcmVNZXRhZGF0YS5lbWFpbC51cmwgOiBzaGFyZU1ldGFkYXRhLnVybCk7XG5cdH1cblx0LyoqXG5cdCAqIFRyaWdnZXJzIHRoZSBzaGFyZSB0byBqYW0gZmxvdy5cblx0ICpcblx0ICogQHJldHVybnMge3ZvaWR9XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgX3RyaWdnZXJTaGFyZVRvSmFtKCkge1xuXHRcdGNvbnN0IHNoYXJlTWV0YWRhdGE6IGFueSA9IGF3YWl0IHRoaXMuX2FkYXB0U2hhcmVNZXRhZGF0YSgpO1xuXHRcdHRoaXMuX2RvT3BlbkphbVNoYXJlRGlhbG9nKFxuXHRcdFx0c2hhcmVNZXRhZGF0YS5qYW0udGl0bGUgPyBzaGFyZU1ldGFkYXRhLmphbS50aXRsZSA6IHNoYXJlTWV0YWRhdGEudGl0bGUsXG5cdFx0XHRzaGFyZU1ldGFkYXRhLmphbS51cmwgPyBzaGFyZU1ldGFkYXRhLmphbS51cmwgOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgc2hhcmVNZXRhZGF0YS51cmxcblx0XHQpO1xuXHR9XG5cdC8qKlxuXHQgKiBUcmlnZ2VycyB0aGUgc2F2ZSBhcyB0aWxlIGZsb3cuXG5cdCAqXG5cdCAqIEBwYXJhbSBbc291cmNlXVxuXHQgKiBAcmV0dXJucyB7dm9pZH1cblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyBfc2F2ZUFzVGlsZShzb3VyY2U6IGFueSkge1xuXHRcdGNvbnN0IHNoYXJlTWV0YWRhdGE6IGFueSA9IGF3YWl0IHRoaXMuX2FkYXB0U2hhcmVNZXRhZGF0YSgpLFxuXHRcdFx0aW50ZXJuYWxBZGRCb29rbWFya0J1dHRvbiA9IHNvdXJjZS5nZXREZXBlbmRlbnRzKClbMF07XG5cblx0XHQvLyBzZXQgQWRkQm9va21hcmtCdXR0b24gcHJvcGVydGllc1xuXHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24uc2V0VGl0bGUoc2hhcmVNZXRhZGF0YS50aWxlLnRpdGxlID8gc2hhcmVNZXRhZGF0YS50aWxlLnRpdGxlIDogc2hhcmVNZXRhZGF0YS50aXRsZSk7XG5cdFx0aW50ZXJuYWxBZGRCb29rbWFya0J1dHRvbi5zZXRTdWJ0aXRsZShzaGFyZU1ldGFkYXRhLnRpbGUuc3VidGl0bGUpO1xuXHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24uc2V0VGlsZUljb24oc2hhcmVNZXRhZGF0YS50aWxlLmljb24pO1xuXHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24uc2V0Q3VzdG9tVXJsKHNoYXJlTWV0YWRhdGEudGlsZS51cmwgPyBzaGFyZU1ldGFkYXRhLnRpbGUudXJsIDogc2hhcmVNZXRhZGF0YS51cmwpO1xuXHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24uc2V0U2VydmljZVVybChzaGFyZU1ldGFkYXRhLnRpbGUucXVlcnlVcmwpO1xuXG5cdFx0Ly8gYWRkQm9va21hcmtCdXR0b24gZmlyZSBwcmVzc1xuXHRcdGludGVybmFsQWRkQm9va21hcmtCdXR0b24uZmlyZVByZXNzKCk7XG5cdH1cblx0LyoqXG5cdCAqIENhbGwgdGhlIGFkYXB0U2hhcmVNZXRhZGF0YSBleHRlbnNpb24uXG5cdCAqXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IFNoYXJlIE1ldGFkYXRhXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0X2FkYXB0U2hhcmVNZXRhZGF0YSgpIHtcblx0XHRjb25zdCBzSGFzaCA9IEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkuZ2V0SGFzaCgpLFxuXHRcdFx0c0Jhc2VQYXRoID0gKEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkgYXMgYW55KS5ocmVmRm9yQXBwU3BlY2lmaWNIYXNoXG5cdFx0XHRcdD8gKEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkgYXMgYW55KS5ocmVmRm9yQXBwU3BlY2lmaWNIYXNoKFwiXCIpXG5cdFx0XHRcdDogXCJcIixcblx0XHRcdG9TaGFyZU1ldGFkYXRhID0ge1xuXHRcdFx0XHR1cmw6XG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLm9yaWdpbiArXG5cdFx0XHRcdFx0d2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICtcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24uc2VhcmNoICtcblx0XHRcdFx0XHQoc0hhc2ggPyBzQmFzZVBhdGggKyBzSGFzaCA6IHdpbmRvdy5sb2NhdGlvbi5oYXNoKSxcblx0XHRcdFx0dGl0bGU6IGRvY3VtZW50LnRpdGxlLFxuXHRcdFx0XHRlbWFpbDoge1xuXHRcdFx0XHRcdHVybDogXCJcIixcblx0XHRcdFx0XHR0aXRsZTogXCJcIlxuXHRcdFx0XHR9LFxuXHRcdFx0XHRqYW06IHtcblx0XHRcdFx0XHR1cmw6IFwiXCIsXG5cdFx0XHRcdFx0dGl0bGU6IFwiXCJcblx0XHRcdFx0fSxcblx0XHRcdFx0dGlsZToge1xuXHRcdFx0XHRcdHVybDogXCJcIixcblx0XHRcdFx0XHR0aXRsZTogXCJcIixcblx0XHRcdFx0XHRzdWJ0aXRsZTogXCJcIixcblx0XHRcdFx0XHRpY29uOiBcIlwiLFxuXHRcdFx0XHRcdHF1ZXJ5VXJsOiBcIlwiXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0cmV0dXJuIHRoaXMuYWRhcHRTaGFyZU1ldGFkYXRhKG9TaGFyZU1ldGFkYXRhKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBTaGFyZVV0aWxzO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O0VBa2pCTyxnQkFBZ0JBLElBQUksRUFBRUMsT0FBTyxFQUFFO0lBQ3JDLElBQUk7TUFDSCxJQUFJQyxNQUFNLEdBQUdGLElBQUksRUFBRTtJQUNwQixDQUFDLENBQUMsT0FBTUcsQ0FBQyxFQUFFO01BQ1YsT0FBT0YsT0FBTyxDQUFDRSxDQUFDLENBQUM7SUFDbEI7SUFDQSxJQUFJRCxNQUFNLElBQUlBLE1BQU0sQ0FBQ0UsSUFBSSxFQUFFO01BQzFCLE9BQU9GLE1BQU0sQ0FBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFSCxPQUFPLENBQUM7SUFDcEM7SUFDQSxPQUFPQyxNQUFNO0VBQ2Q7RUFBQztFQUFBO0VBQUE7RUExaUJELElBQUlHLG1CQUE0Qjs7RUFFaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFOQSxJQVFNQyxVQUFVLFdBRGZDLGNBQWMsQ0FBQyx3Q0FBd0MsQ0FBQyxVQUd2REMsY0FBYyxFQUFFLFVBVWhCQSxjQUFjLEVBQUUsVUFnQmhCQyxlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRSxVQTRCaEJELGVBQWUsRUFBRSxVQUNqQkUsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDLFVBd0xuQ0osZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsV0FlaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFLFdBZWhCRCxlQUFlLEVBQUUsV0FDakJDLGNBQWMsRUFBRSxXQXFCaEJELGVBQWUsRUFBRSxXQUNqQkMsY0FBYyxFQUFFO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBLE9BdFNqQkksTUFBTSxHQUROLGtCQUNlO01BQ2QsSUFBTUMsc0JBQWlDLEdBQUcsSUFBSUMsU0FBUyxDQUFDO1FBQ3ZEQyxHQUFHLEVBQUUsRUFBRTtRQUNQQyxR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