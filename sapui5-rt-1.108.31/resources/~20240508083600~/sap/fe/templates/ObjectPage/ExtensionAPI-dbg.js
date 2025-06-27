/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/ID", "sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/library", "sap/ui/core/message/Message"], function (Log, CommonUtils, ID, ExtensionAPI, ClassSupport, library, Message) {
  "use strict";

  var _dec, _class;
  var MessageType = library.MessageType;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var getSideContentLayoutID = ID.getSideContentLayoutID;
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
  /**
   * Extension API for object pages on SAP Fiori elements for OData V4.
   *
   * @alias sap.fe.templates.ObjectPage.ExtensionAPI
   * @public
   * @hideconstructor
   * @final
   * @since 1.79.0
   */
  var ObjectPageExtensionAPI = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.ExtensionAPI"), _dec(_class = /*#__PURE__*/function (_ExtensionAPI) {
    _inheritsLoose(ObjectPageExtensionAPI, _ExtensionAPI);
    function ObjectPageExtensionAPI() {
      return _ExtensionAPI.apply(this, arguments) || this;
    }
    var _proto = ObjectPageExtensionAPI.prototype;
    /**
     * Refreshes either the whole object page or only parts of it.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#refresh
     * @param [vPath] Path or array of paths referring to entities or properties to be refreshed.
     * If omitted, the whole object page is refreshed. The path "" refreshes the entity assigned to the object page
     * without navigations
     * @returns Resolved once the data is refreshed or rejected if the request failed
     * @public
     */
    _proto.refresh = function refresh(vPath) {
      var oBindingContext = this._view.getBindingContext();
      if (!oBindingContext) {
        // nothing to be refreshed - do not block the app!
        return Promise.resolve();
      }
      var oAppComponent = CommonUtils.getAppComponent(this._view),
        oSideEffectsService = oAppComponent.getSideEffectsService(),
        oMetaModel = oBindingContext.getModel().getMetaModel(),
        oSideEffects = {
          TargetProperties: [],
          TargetEntities: []
        };
      var aPaths, sPath, sBaseEntitySet, sKind;
      if (vPath === undefined || vPath === null) {
        // we just add an empty path which should refresh the page with all dependent bindings
        oSideEffects.TargetEntities.push({
          $NavigationPropertyPath: ""
        });
      } else {
        aPaths = Array.isArray(vPath) ? vPath : [vPath];
        sBaseEntitySet = this._controller.getOwnerComponent().getEntitySet();
        for (var i = 0; i < aPaths.length; i++) {
          sPath = aPaths[i];
          if (sPath === "") {
            // an empty path shall refresh the entity without dependencies which means * for the model
            oSideEffects.TargetProperties.push({
              $PropertyPath: "*"
            });
          } else {
            sKind = oMetaModel.getObject("/".concat(sBaseEntitySet, "/").concat(sPath, "/$kind"));
            if (sKind === "NavigationProperty") {
              oSideEffects.TargetEntities.push({
                $NavigationPropertyPath: sPath
              });
            } else if (sKind) {
              oSideEffects.TargetProperties.push({
                $PropertyPath: sPath
              });
            } else {
              return Promise.reject("".concat(sPath, " is not a valid path to be refreshed"));
            }
          }
        }
      }
      return oSideEffectsService.requestSideEffects(oSideEffects.TargetEntities.concat(oSideEffects.TargetProperties), oBindingContext);
    }

    /**
     * Gets the list entries currently selected for the table.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#getSelectedContexts
     * @param sTableId The ID identifying the table the selected context is requested for
     * @returns Array containing the selected contexts
     * @public
     */;
    _proto.getSelectedContexts = function getSelectedContexts(sTableId) {
      var oTable = this._view.byId(sTableId);
      if (oTable && oTable.isA("sap.fe.macros.table.TableAPI")) {
        oTable = oTable.getContent();
      }
      return oTable && oTable.isA("sap.ui.mdc.Table") && oTable.getSelectedContexts() || [];
    }

    /**
     * Displays or hides the side content of an object page.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#showSideContent
     * @param sSubSectionKey Key of the side content fragment as defined in the manifest.json
     * @param [bShow] Optional Boolean flag to show or hide the side content
     * @public
     */;
    _proto.showSideContent = function showSideContent(sSubSectionKey, bShow) {
      var sBlockID = getSideContentLayoutID(sSubSectionKey),
        oBlock = this._view.byId(sBlockID),
        bBlockState = bShow === undefined ? !oBlock.getShowSideContent() : bShow;
      oBlock.setShowSideContent(bBlockState, false);
    }

    /**
     * Gets the bound context of the current object page.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#getBindingContext
     * @returns Context bound to the object page
     * @public
     */;
    _proto.getBindingContext = function getBindingContext() {
      return this._view.getBindingContext();
    }

    /**
     * Build a message to be displayed below the anchor bar.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#_buildOPMessage
     * @param {sap.ui.core.message.Message[]} messages Array of messages used to generated the message
     * @returns {Promise<Message>} Promise containing the generated message
     * @private
     */;
    _proto._buildOPMessage = function _buildOPMessage(messages) {
      try {
        var _this2 = this;
        var view = _this2._view;
        return Promise.resolve(view.getModel("sap.fe.i18n").getResourceBundle()).then(function (resourceBundle) {
          var message = null;
          switch (messages.length) {
            case 0:
              break;
            case 1:
              message = messages[0];
              break;
            default:
              var messageStats = {
                "Error": {
                  id: 2,
                  count: 0
                },
                "Warning": {
                  id: 1,
                  count: 0
                },
                "Information": {
                  id: 0,
                  count: 0
                }
              };
              message = messages.reduce(function (acc, currentValue) {
                var currentType = currentValue.getType();
                acc.setType(messageStats[currentType].id > messageStats[acc.getType()].id ? currentType : acc.getType());
                messageStats[currentType].count++;
                return acc;
              }, new Message({
                type: MessageType.Information
              }));
              if (messageStats.Error.count === 0 && messageStats.Warning.count === 0 && messageStats.Information.count > 0) {
                message.setMessage(resourceBundle.getText("OBJECTPAGESTATE_INFORMATION"));
              } else if (messageStats.Error.count > 0 && messageStats.Warning.count > 0 || messageStats.Information.count > 0) {
                message.setMessage(resourceBundle.getText("OBJECTPAGESTATE_ISSUE"));
              } else {
                message.setMessage(resourceBundle.getText(message.getType() === MessageType.Error ? "OBJECTPAGESTATE_ERROR" : "OBJECTPAGESTATE_WARNING"));
              }
          }
          return message;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Displays the message strip below the anchor bar.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#showMessages
     * @param {sap.ui.core.message.Message} messages The message to be displayed
     * @public
     */
    ;
    _proto.showMessages = function showMessages(messages) {
      try {
        var _this4 = this;
        var view = _this4._view;
        var internalModelContext = view.getBindingContext("internal");
        var _temp2 = _catch(function () {
          return Promise.resolve(_this4._buildOPMessage(messages)).then(function (message) {
            if (message) {
              internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripVisibility", true);
              internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripText", message.getMessage());
              internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripType", message.getType());
            } else {
              _this4.hideMessage();
            }
          });
        }, function () {
          Log.error("Cannot display ObjectPage message");
        });
        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Hides the message strip below the anchor bar.
     *
     * @alias sap.fe.templates.ObjectPage.ExtensionAPI#hideMessage
     * @public
     */
    ;
    _proto.hideMessage = function hideMessage() {
      var view = this._view;
      var internalModelContext = view.getBindingContext("internal");
      internalModelContext === null || internalModelContext === void 0 ? void 0 : internalModelContext.setProperty("OPMessageStripVisibility", false);
    };
    return ObjectPageExtensionAPI;
  }(ExtensionAPI)) || _class);
  return ObjectPageExtensionAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiT2JqZWN0UGFnZUV4dGVuc2lvbkFQSSIsImRlZmluZVVJNUNsYXNzIiwicmVmcmVzaCIsInZQYXRoIiwib0JpbmRpbmdDb250ZXh0IiwiX3ZpZXciLCJnZXRCaW5kaW5nQ29udGV4dCIsIlByb21pc2UiLCJyZXNvbHZlIiwib0FwcENvbXBvbmVudCIsIkNvbW1vblV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50Iiwib1NpZGVFZmZlY3RzU2VydmljZSIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsIm9NZXRhTW9kZWwiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsIm9TaWRlRWZmZWN0cyIsIlRhcmdldFByb3BlcnRpZXMiLCJUYXJnZXRFbnRpdGllcyIsImFQYXRocyIsInNQYXRoIiwic0Jhc2VFbnRpdHlTZXQiLCJzS2luZCIsInVuZGVmaW5lZCIsInB1c2giLCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aCIsIkFycmF5IiwiaXNBcnJheSIsIl9jb250cm9sbGVyIiwiZ2V0T3duZXJDb21wb25lbnQiLCJnZXRFbnRpdHlTZXQiLCJpIiwibGVuZ3RoIiwiJFByb3BlcnR5UGF0aCIsImdldE9iamVjdCIsInJlamVjdCIsInJlcXVlc3RTaWRlRWZmZWN0cyIsImNvbmNhdCIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJzVGFibGVJZCIsIm9UYWJsZSIsImJ5SWQiLCJpc0EiLCJnZXRDb250ZW50Iiwic2hvd1NpZGVDb250ZW50Iiwic1N1YlNlY3Rpb25LZXkiLCJiU2hvdyIsInNCbG9ja0lEIiwiZ2V0U2lkZUNvbnRlbnRMYXlvdXRJRCIsIm9CbG9jayIsImJCbG9ja1N0YXRlIiwiZ2V0U2hvd1NpZGVDb250ZW50Iiwic2V0U2hvd1NpZGVDb250ZW50IiwiX2J1aWxkT1BNZXNzYWdlIiwibWVzc2FnZXMiLCJ2aWV3IiwiZ2V0UmVzb3VyY2VCdW5kbGUiLCJyZXNvdXJjZUJ1bmRsZSIsIm1lc3NhZ2UiLCJtZXNzYWdlU3RhdHMiLCJpZCIsImNvdW50IiwicmVkdWNlIiwiYWNjIiwiY3VycmVudFZhbHVlIiwiY3VycmVudFR5cGUiLCJnZXRUeXBlIiwic2V0VHlwZSIsIk1lc3NhZ2UiLCJ0eXBlIiwiTWVzc2FnZVR5cGUiLCJJbmZvcm1hdGlvbiIsIkVycm9yIiwiV2FybmluZyIsInNldE1lc3NhZ2UiLCJnZXRUZXh0Iiwic2hvd01lc3NhZ2VzIiwiaW50ZXJuYWxNb2RlbENvbnRleHQiLCJzZXRQcm9wZXJ0eSIsImdldE1lc3NhZ2UiLCJoaWRlTWVzc2FnZSIsIkxvZyIsImVycm9yIiwiRXh0ZW5zaW9uQVBJIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJFeHRlbnNpb25BUEkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBnZXRTaWRlQ29udGVudExheW91dElEIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9JRFwiO1xuaW1wb3J0IEV4dGVuc2lvbkFQSSBmcm9tIFwic2FwL2ZlL2NvcmUvRXh0ZW5zaW9uQVBJXCI7XG5pbXBvcnQgdHlwZSB7IEVuaGFuY2VXaXRoVUk1IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgVGFibGVBUEkgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVBUElcIjtcbmltcG9ydCB7IE1lc3NhZ2VUeXBlIH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9tZXNzYWdlL01lc3NhZ2VcIjtcbmltcG9ydCB0eXBlIER5bmFtaWNTaWRlQ29udGVudCBmcm9tIFwic2FwL3VpL2xheW91dC9EeW5hbWljU2lkZUNvbnRlbnRcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL3Jlc291cmNlL1Jlc291cmNlTW9kZWxcIjtcblxuLyoqXG4gKiBFeHRlbnNpb24gQVBJIGZvciBvYmplY3QgcGFnZXMgb24gU0FQIEZpb3JpIGVsZW1lbnRzIGZvciBPRGF0YSBWNC5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSVxuICogQHB1YmxpY1xuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQGZpbmFsXG4gKiBAc2luY2UgMS43OS4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5FeHRlbnNpb25BUElcIilcbmNsYXNzIE9iamVjdFBhZ2VFeHRlbnNpb25BUEkgZXh0ZW5kcyBFeHRlbnNpb25BUEkge1xuXHQvKipcblx0ICogUmVmcmVzaGVzIGVpdGhlciB0aGUgd2hvbGUgb2JqZWN0IHBhZ2Ugb3Igb25seSBwYXJ0cyBvZiBpdC5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5FeHRlbnNpb25BUEkjcmVmcmVzaFxuXHQgKiBAcGFyYW0gW3ZQYXRoXSBQYXRoIG9yIGFycmF5IG9mIHBhdGhzIHJlZmVycmluZyB0byBlbnRpdGllcyBvciBwcm9wZXJ0aWVzIHRvIGJlIHJlZnJlc2hlZC5cblx0ICogSWYgb21pdHRlZCwgdGhlIHdob2xlIG9iamVjdCBwYWdlIGlzIHJlZnJlc2hlZC4gVGhlIHBhdGggXCJcIiByZWZyZXNoZXMgdGhlIGVudGl0eSBhc3NpZ25lZCB0byB0aGUgb2JqZWN0IHBhZ2Vcblx0ICogd2l0aG91dCBuYXZpZ2F0aW9uc1xuXHQgKiBAcmV0dXJucyBSZXNvbHZlZCBvbmNlIHRoZSBkYXRhIGlzIHJlZnJlc2hlZCBvciByZWplY3RlZCBpZiB0aGUgcmVxdWVzdCBmYWlsZWRcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cmVmcmVzaCh2UGF0aDogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQpIHtcblx0XHRjb25zdCBvQmluZGluZ0NvbnRleHQgPSB0aGlzLl92aWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dDtcblx0XHRpZiAoIW9CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0Ly8gbm90aGluZyB0byBiZSByZWZyZXNoZWQgLSBkbyBub3QgYmxvY2sgdGhlIGFwcCFcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzLl92aWV3KSxcblx0XHRcdG9TaWRlRWZmZWN0c1NlcnZpY2UgPSBvQXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsLFxuXHRcdFx0b1NpZGVFZmZlY3RzOiBhbnkgPSB7XG5cdFx0XHRcdFRhcmdldFByb3BlcnRpZXM6IFtdLFxuXHRcdFx0XHRUYXJnZXRFbnRpdGllczogW11cblx0XHRcdH07XG5cdFx0bGV0IGFQYXRocywgc1BhdGgsIHNCYXNlRW50aXR5U2V0LCBzS2luZDtcblxuXHRcdGlmICh2UGF0aCA9PT0gdW5kZWZpbmVkIHx8IHZQYXRoID09PSBudWxsKSB7XG5cdFx0XHQvLyB3ZSBqdXN0IGFkZCBhbiBlbXB0eSBwYXRoIHdoaWNoIHNob3VsZCByZWZyZXNoIHRoZSBwYWdlIHdpdGggYWxsIGRlcGVuZGVudCBiaW5kaW5nc1xuXHRcdFx0b1NpZGVFZmZlY3RzLlRhcmdldEVudGl0aWVzLnB1c2goe1xuXHRcdFx0XHQkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogXCJcIlxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFQYXRocyA9IEFycmF5LmlzQXJyYXkodlBhdGgpID8gdlBhdGggOiBbdlBhdGhdO1xuXHRcdFx0c0Jhc2VFbnRpdHlTZXQgPSAodGhpcy5fY29udHJvbGxlci5nZXRPd25lckNvbXBvbmVudCgpIGFzIGFueSkuZ2V0RW50aXR5U2V0KCk7XG5cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVBhdGhzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHNQYXRoID0gYVBhdGhzW2ldO1xuXHRcdFx0XHRpZiAoc1BhdGggPT09IFwiXCIpIHtcblx0XHRcdFx0XHQvLyBhbiBlbXB0eSBwYXRoIHNoYWxsIHJlZnJlc2ggdGhlIGVudGl0eSB3aXRob3V0IGRlcGVuZGVuY2llcyB3aGljaCBtZWFucyAqIGZvciB0aGUgbW9kZWxcblx0XHRcdFx0XHRvU2lkZUVmZmVjdHMuVGFyZ2V0UHJvcGVydGllcy5wdXNoKHtcblx0XHRcdFx0XHRcdCRQcm9wZXJ0eVBhdGg6IFwiKlwiXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c0tpbmQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7c0Jhc2VFbnRpdHlTZXR9LyR7c1BhdGh9LyRraW5kYCk7XG5cblx0XHRcdFx0XHRpZiAoc0tpbmQgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIpIHtcblx0XHRcdFx0XHRcdG9TaWRlRWZmZWN0cy5UYXJnZXRFbnRpdGllcy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0JE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IHNQYXRoXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHNLaW5kKSB7XG5cdFx0XHRcdFx0XHRvU2lkZUVmZmVjdHMuVGFyZ2V0UHJvcGVydGllcy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0JFByb3BlcnR5UGF0aDogc1BhdGhcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoYCR7c1BhdGh9IGlzIG5vdCBhIHZhbGlkIHBhdGggdG8gYmUgcmVmcmVzaGVkYCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyhvU2lkZUVmZmVjdHMuVGFyZ2V0RW50aXRpZXMuY29uY2F0KG9TaWRlRWZmZWN0cy5UYXJnZXRQcm9wZXJ0aWVzKSwgb0JpbmRpbmdDb250ZXh0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBsaXN0IGVudHJpZXMgY3VycmVudGx5IHNlbGVjdGVkIGZvciB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuRXh0ZW5zaW9uQVBJI2dldFNlbGVjdGVkQ29udGV4dHNcblx0ICogQHBhcmFtIHNUYWJsZUlkIFRoZSBJRCBpZGVudGlmeWluZyB0aGUgdGFibGUgdGhlIHNlbGVjdGVkIGNvbnRleHQgaXMgcmVxdWVzdGVkIGZvclxuXHQgKiBAcmV0dXJucyBBcnJheSBjb250YWluaW5nIHRoZSBzZWxlY3RlZCBjb250ZXh0c1xuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRTZWxlY3RlZENvbnRleHRzKHNUYWJsZUlkOiBzdHJpbmcpIHtcblx0XHRsZXQgb1RhYmxlID0gdGhpcy5fdmlldy5ieUlkKHNUYWJsZUlkKTtcblx0XHRpZiAob1RhYmxlICYmIG9UYWJsZS5pc0EoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlQVBJXCIpKSB7XG5cdFx0XHRvVGFibGUgPSAob1RhYmxlIGFzIEVuaGFuY2VXaXRoVUk1PFRhYmxlQVBJPikuZ2V0Q29udGVudCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gKG9UYWJsZSAmJiBvVGFibGUuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSAmJiAob1RhYmxlIGFzIGFueSkuZ2V0U2VsZWN0ZWRDb250ZXh0cygpKSB8fCBbXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNwbGF5cyBvciBoaWRlcyB0aGUgc2lkZSBjb250ZW50IG9mIGFuIG9iamVjdCBwYWdlLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSSNzaG93U2lkZUNvbnRlbnRcblx0ICogQHBhcmFtIHNTdWJTZWN0aW9uS2V5IEtleSBvZiB0aGUgc2lkZSBjb250ZW50IGZyYWdtZW50IGFzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0Lmpzb25cblx0ICogQHBhcmFtIFtiU2hvd10gT3B0aW9uYWwgQm9vbGVhbiBmbGFnIHRvIHNob3cgb3IgaGlkZSB0aGUgc2lkZSBjb250ZW50XG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHNob3dTaWRlQ29udGVudChzU3ViU2VjdGlvbktleTogc3RyaW5nLCBiU2hvdzogYm9vbGVhbiB8IHVuZGVmaW5lZCkge1xuXHRcdGNvbnN0IHNCbG9ja0lEID0gZ2V0U2lkZUNvbnRlbnRMYXlvdXRJRChzU3ViU2VjdGlvbktleSksXG5cdFx0XHRvQmxvY2sgPSB0aGlzLl92aWV3LmJ5SWQoc0Jsb2NrSUQpLFxuXHRcdFx0YkJsb2NrU3RhdGUgPSBiU2hvdyA9PT0gdW5kZWZpbmVkID8gIShvQmxvY2sgYXMgRHluYW1pY1NpZGVDb250ZW50KS5nZXRTaG93U2lkZUNvbnRlbnQoKSA6IGJTaG93O1xuXHRcdChvQmxvY2sgYXMgRHluYW1pY1NpZGVDb250ZW50KS5zZXRTaG93U2lkZUNvbnRlbnQoYkJsb2NrU3RhdGUsIGZhbHNlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBHZXRzIHRoZSBib3VuZCBjb250ZXh0IG9mIHRoZSBjdXJyZW50IG9iamVjdCBwYWdlLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSSNnZXRCaW5kaW5nQ29udGV4dFxuXHQgKiBAcmV0dXJucyBDb250ZXh0IGJvdW5kIHRvIHRoZSBvYmplY3QgcGFnZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRCaW5kaW5nQ29udGV4dCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkIGEgbWVzc2FnZSB0byBiZSBkaXNwbGF5ZWQgYmVsb3cgdGhlIGFuY2hvciBiYXIuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuRXh0ZW5zaW9uQVBJI19idWlsZE9QTWVzc2FnZVxuXHQgKiBAcGFyYW0ge3NhcC51aS5jb3JlLm1lc3NhZ2UuTWVzc2FnZVtdfSBtZXNzYWdlcyBBcnJheSBvZiBtZXNzYWdlcyB1c2VkIHRvIGdlbmVyYXRlZCB0aGUgbWVzc2FnZVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZTxNZXNzYWdlPn0gUHJvbWlzZSBjb250YWluaW5nIHRoZSBnZW5lcmF0ZWQgbWVzc2FnZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YXN5bmMgX2J1aWxkT1BNZXNzYWdlKG1lc3NhZ2VzOiBNZXNzYWdlW10pOiBQcm9taXNlPE1lc3NhZ2UgfCBudWxsPiB7XG5cdFx0Y29uc3QgdmlldyA9IHRoaXMuX3ZpZXc7XG5cdFx0Y29uc3QgcmVzb3VyY2VCdW5kbGUgPSBhd2FpdCAodmlldy5nZXRNb2RlbChcInNhcC5mZS5pMThuXCIpIGFzIFJlc291cmNlTW9kZWwpLmdldFJlc291cmNlQnVuZGxlKCk7XG5cdFx0bGV0IG1lc3NhZ2U6IE1lc3NhZ2UgfCBudWxsID0gbnVsbDtcblx0XHRzd2l0Y2ggKG1lc3NhZ2VzLmxlbmd0aCkge1xuXHRcdFx0Y2FzZSAwOlxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgMTpcblx0XHRcdFx0bWVzc2FnZSA9IG1lc3NhZ2VzWzBdO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGNvbnN0IG1lc3NhZ2VTdGF0czogeyBba2V5OiBzdHJpbmddOiBhbnkgfSA9IHtcblx0XHRcdFx0XHRcIkVycm9yXCI6IHsgaWQ6IDIsIGNvdW50OiAwIH0sXG5cdFx0XHRcdFx0XCJXYXJuaW5nXCI6IHsgaWQ6IDEsIGNvdW50OiAwIH0sXG5cdFx0XHRcdFx0XCJJbmZvcm1hdGlvblwiOiB7IGlkOiAwLCBjb3VudDogMCB9XG5cdFx0XHRcdH07XG5cdFx0XHRcdG1lc3NhZ2UgPSBtZXNzYWdlcy5yZWR1Y2UoKGFjYywgY3VycmVudFZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgY3VycmVudFR5cGUgPSBjdXJyZW50VmFsdWUuZ2V0VHlwZSgpO1xuXHRcdFx0XHRcdGFjYy5zZXRUeXBlKG1lc3NhZ2VTdGF0c1tjdXJyZW50VHlwZV0uaWQgPiBtZXNzYWdlU3RhdHNbYWNjLmdldFR5cGUoKV0uaWQgPyBjdXJyZW50VHlwZSA6IGFjYy5nZXRUeXBlKCkpO1xuXHRcdFx0XHRcdG1lc3NhZ2VTdGF0c1tjdXJyZW50VHlwZV0uY291bnQrKztcblx0XHRcdFx0XHRyZXR1cm4gYWNjO1xuXHRcdFx0XHR9LCBuZXcgTWVzc2FnZSh7IHR5cGU6IE1lc3NhZ2VUeXBlLkluZm9ybWF0aW9uIH0pKTtcblxuXHRcdFx0XHRpZiAobWVzc2FnZVN0YXRzLkVycm9yLmNvdW50ID09PSAwICYmIG1lc3NhZ2VTdGF0cy5XYXJuaW5nLmNvdW50ID09PSAwICYmIG1lc3NhZ2VTdGF0cy5JbmZvcm1hdGlvbi5jb3VudCA+IDApIHtcblx0XHRcdFx0XHRtZXNzYWdlLnNldE1lc3NhZ2UocmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIk9CSkVDVFBBR0VTVEFURV9JTkZPUk1BVElPTlwiKSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoKG1lc3NhZ2VTdGF0cy5FcnJvci5jb3VudCA+IDAgJiYgbWVzc2FnZVN0YXRzLldhcm5pbmcuY291bnQgPiAwKSB8fCBtZXNzYWdlU3RhdHMuSW5mb3JtYXRpb24uY291bnQgPiAwKSB7XG5cdFx0XHRcdFx0bWVzc2FnZS5zZXRNZXNzYWdlKHJlc291cmNlQnVuZGxlLmdldFRleHQoXCJPQkpFQ1RQQUdFU1RBVEVfSVNTVUVcIikpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1lc3NhZ2Uuc2V0TWVzc2FnZShcblx0XHRcdFx0XHRcdHJlc291cmNlQnVuZGxlLmdldFRleHQoXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2UuZ2V0VHlwZSgpID09PSBNZXNzYWdlVHlwZS5FcnJvciA/IFwiT0JKRUNUUEFHRVNUQVRFX0VSUk9SXCIgOiBcIk9CSkVDVFBBR0VTVEFURV9XQVJOSU5HXCJcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBtZXNzYWdlO1xuXHR9XG5cblx0LyoqXG5cdCAqIERpc3BsYXlzIHRoZSBtZXNzYWdlIHN0cmlwIGJlbG93IHRoZSBhbmNob3IgYmFyLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSSNzaG93TWVzc2FnZXNcblx0ICogQHBhcmFtIHtzYXAudWkuY29yZS5tZXNzYWdlLk1lc3NhZ2V9IG1lc3NhZ2VzIFRoZSBtZXNzYWdlIHRvIGJlIGRpc3BsYXllZFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXG5cdGFzeW5jIHNob3dNZXNzYWdlcyhtZXNzYWdlczogTWVzc2FnZVtdKSB7XG5cdFx0Y29uc3QgdmlldyA9IHRoaXMuX3ZpZXc7XG5cdFx0Y29uc3QgaW50ZXJuYWxNb2RlbENvbnRleHQgPSB2aWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBhd2FpdCB0aGlzLl9idWlsZE9QTWVzc2FnZShtZXNzYWdlcyk7XG5cdFx0XHRpZiAobWVzc2FnZSkge1xuXHRcdFx0XHQoaW50ZXJuYWxNb2RlbENvbnRleHQgYXMgYW55KT8uc2V0UHJvcGVydHkoXCJPUE1lc3NhZ2VTdHJpcFZpc2liaWxpdHlcIiwgdHJ1ZSk7XG5cdFx0XHRcdChpbnRlcm5hbE1vZGVsQ29udGV4dCBhcyBhbnkpPy5zZXRQcm9wZXJ0eShcIk9QTWVzc2FnZVN0cmlwVGV4dFwiLCBtZXNzYWdlLmdldE1lc3NhZ2UoKSk7XG5cdFx0XHRcdChpbnRlcm5hbE1vZGVsQ29udGV4dCBhcyBhbnkpPy5zZXRQcm9wZXJ0eShcIk9QTWVzc2FnZVN0cmlwVHlwZVwiLCBtZXNzYWdlLmdldFR5cGUoKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLmhpZGVNZXNzYWdlKCk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgZGlzcGxheSBPYmplY3RQYWdlIG1lc3NhZ2VcIik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEhpZGVzIHRoZSBtZXNzYWdlIHN0cmlwIGJlbG93IHRoZSBhbmNob3IgYmFyLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLkV4dGVuc2lvbkFQSSNoaWRlTWVzc2FnZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRoaWRlTWVzc2FnZSgpIHtcblx0XHRjb25zdCB2aWV3ID0gdGhpcy5fdmlldztcblx0XHRjb25zdCBpbnRlcm5hbE1vZGVsQ29udGV4dCA9IHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0XHQoaW50ZXJuYWxNb2RlbENvbnRleHQgYXMgYW55KT8uc2V0UHJvcGVydHkoXCJPUE1lc3NhZ2VTdHJpcFZpc2liaWxpdHlcIiwgZmFsc2UpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE9iamVjdFBhZ2VFeHRlbnNpb25BUEk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7O0VBa2pCTyxnQkFBZ0JBLElBQUksRUFBRUMsT0FBTyxFQUFFO0lBQ3JDLElB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