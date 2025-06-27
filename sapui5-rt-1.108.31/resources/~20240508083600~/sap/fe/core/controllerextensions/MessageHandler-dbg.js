/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/Core", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution"], function (CommonUtils, messageHandling, ClassSupport, Core, ControllerExtension, OverrideExecution) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * A controller extension offering message handling.
   *
   * @hideconstructor
   * @public
   * @experimental As of version 1.90.0
   * @since 1.90.0
   */
  var MessageHandler = (_dec = defineUI5Class("sap.fe.core.controllerextensions.MessageHandler"), _dec2 = privateExtension(), _dec3 = extensible(OverrideExecution.Instead), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = publicExtension(), _dec8 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(MessageHandler, _ControllerExtension);
    function MessageHandler() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = MessageHandler.prototype;
    /**
     * Determines whether or not bound messages are shown in the message dialog.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.Instead}.
     *
     * If the bound messages are shown to the user with a different control like the (TODO:Link) MessageButton
     * this method has to be overridden.
     *
     * @returns Determines whether or not bound messages are shown in the message dialog.
     * @private
     */
    _proto.getShowBoundMessagesInMessageDialog = function getShowBoundMessagesInMessageDialog() {
      return true;
    }

    /**
     * Shows a message dialog with transition messages if there are any.
     * The message dialog is shown as a modal dialog. Once the user confirms the dialog, all transition messages
     * are removed from the message model. If there is more than one message, a list of messages is shown. The user
     * can filter on message types and can display details as well as the long text. If there is one message,
     * the dialog immediately shows the details of the message. If there is just one success message, a message
     * toast is shown instead.
     *
     * @param mParameters PRIVATE
     * @returns A promise that is resolved once the user closes the dialog. If there are no messages
     * to be shown, the promise is resolved immediately
     * @alias sap.fe.core.controllerextensions.MessageHandler#showMessageDialog
     * @public
     * @experimental As of version 1.90.0
     * @since 1.90.0
     */;
    _proto.showMessageDialog = function showMessageDialog(mParameters) {
      var customMessages = mParameters && mParameters.customMessages ? mParameters.customMessages : undefined,
        oOPInternalBindingContext = this.base.getView().getBindingContext("internal");
      // set isActionParameterDialog open so that it can be used in the controller extension to decide whether message dialog should open or not
      if (mParameters && mParameters.isActionParameterDialogOpen && oOPInternalBindingContext) {
        oOPInternalBindingContext.setProperty("isActionParameterDialogOpen", true);
      }
      var bShowBoundMessages = this.getShowBoundMessagesInMessageDialog();
      var oBindingContext = mParameters && mParameters.context ? mParameters.context : this.getView().getBindingContext();
      //const bEtagMessage = mParameters && mParameters.bHasEtagMessage;
      // reset  isActionParameterDialogOpen
      // cannot do this operations.js since it is not aware of the view
      if (oOPInternalBindingContext) {
        oOPInternalBindingContext.setProperty("isActionParameterDialogOpen", false);
      }
      return new Promise(function (resolve, reject) {
        // we have to set a timeout to be able to access the most recent messages
        setTimeout(function () {
          // TODO: great API - will be changed later
          messageHandling.showUnboundMessages(customMessages, oBindingContext, bShowBoundMessages, mParameters === null || mParameters === void 0 ? void 0 : mParameters.concurrentEditFlag, false, mParameters === null || mParameters === void 0 ? void 0 : mParameters.onBeforeShowMessage).then(resolve).catch(reject);
        }, 0);
      });
    }

    /**
     * You can remove the existing transition message from the message model with this method.
     * With every user interaction that causes server communication (like clicking on an action, changing data),
     * this method removes the existing transition messages from the message model.
     *
     * @param [keepBoundMessage] Checks if the bound transition messages are not to be removed
     * @param keepUnboundMessage
     * @param sPathToBeRemoved
     * @alias sap.fe.core.controllerextensions.MessageHandler#removesTransitionMessages
     * @private
     */;
    _proto.removeTransitionMessages = function removeTransitionMessages(keepBoundMessage, keepUnboundMessage, sPathToBeRemoved) {
      if (!keepBoundMessage) {
        messageHandling.removeBoundTransitionMessages(sPathToBeRemoved);
      }
      if (!keepUnboundMessage) {
        messageHandling.removeUnboundTransitionMessages();
      }
    };
    _proto._checkNavigationToMessagePage = function _checkNavigationToMessagePage(mParameters) {
      var aUnboundMessages = messageHandling.getMessages();
      var bShowBoundTransitionMessages = this.getShowBoundMessagesInMessageDialog();
      var aBoundTransitionMessages = bShowBoundTransitionMessages ? messageHandling.getMessages(true, true) : [];
      var aCustomMessages = mParameters && mParameters.customMessages ? mParameters.customMessages : [];
      var bIsStickyEditMode = CommonUtils.isStickyEditMode(this.base.getView());
      var mMessagePageParameters;

      // TODO: Stick mode check is okay as long as the controller extension is used with sap.fe.core and sap.fe.core.AppComponent.
      // It might be better to provide an extension to the consumer of the controller extension to provide this value.

      // The message page can only show 1 message today, so we navigate to it when :
      // 1. There are no bound transition messages to show,
      // 2. There are no custom messages to show, &
      // 3. There is exactly 1 unbound message in the message model with statusCode=503 and retry-After available
      // 4. retryAfter is greater than 120 seconds
      //
      // In Addition, navigating away from a sticky session will destroy the session so we do not navigate to message page for now.
      // TODO: check if navigation should be done in sticky edit mode.
      if (mParameters && mParameters.isDataReceivedError) {
        mMessagePageParameters = {
          title: mParameters.title,
          description: mParameters.description,
          navigateBackToOrigin: true
        };
      } else if (!bIsStickyEditMode && !aBoundTransitionMessages.length && !aCustomMessages.length && (aUnboundMessages.length === 1 || mParameters && mParameters.isInitialLoad503Error)) {
        var oMessage = aUnboundMessages[0],
          oTechnicalDetails = oMessage.getTechnicalDetails();
        var sRetryAfterMessage;
        if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503) {
          if (oTechnicalDetails.retryAfter) {
            var iSecondsBeforeRetry = this._getSecondsBeforeRetryAfter(oTechnicalDetails.retryAfter);
            if (iSecondsBeforeRetry > 120) {
              // TODO: For now let's keep getRetryAfterMessage in messageHandling because it is needed also by the dialog.
              // We can plan to move this and the dialog logic both to messageHandler controller extension if required.
              sRetryAfterMessage = messageHandling.getRetryAfterMessage(oMessage);
              mMessagePageParameters = {
                description: sRetryAfterMessage ? "".concat(sRetryAfterMessage, " ").concat(oMessage.getMessage()) : oMessage.getMessage(),
                navigateBackToOrigin: true
              };
            }
          } else {
            sRetryAfterMessage = messageHandling.getRetryAfterMessage(oMessage);
            mMessagePageParameters = {
              description: sRetryAfterMessage ? "".concat(sRetryAfterMessage, " ").concat(oMessage.getMessage()) : oMessage.getMessage(),
              navigateBackToOrigin: true
            };
          }
        }
      }
      return mMessagePageParameters;
    };
    _proto._getSecondsBeforeRetryAfter = function _getSecondsBeforeRetryAfter(dRetryAfter) {
      var dCurrentDateTime = new Date(),
        iCurrentDateTimeInMilliSeconds = dCurrentDateTime.getTime(),
        iRetryAfterDateTimeInMilliSeconds = dRetryAfter.getTime(),
        iSecondsBeforeRetry = (iRetryAfterDateTimeInMilliSeconds - iCurrentDateTimeInMilliSeconds) / 1000;
      return iSecondsBeforeRetry;
    }
    /**
     * Shows a message page or a message dialog based on the messages in the message dialog.
     *
     * @param [mParameters]
     * @returns A promise that is resolved once the user closes the message dialog or when navigation to the message page is complete. If there are no messages
     * to be shown, the promise is resolved immediately
     * @private
     */;
    _proto.showMessages = function showMessages(mParameters) {
      try {
        var _this2 = this;
        var oAppComponent = CommonUtils.getAppComponent(_this2.getView());
        var mMessagePageParameters;
        if (!oAppComponent._isFclEnabled()) {
          mMessagePageParameters = _this2._checkNavigationToMessagePage(mParameters);
        }
        if (mMessagePageParameters) {
          // navigate to message page.
          // handler before page navigation is triggered, for example to close the action parameter dialog
          if (mParameters && mParameters.messagePageNavigationCallback) {
            mParameters.messagePageNavigationCallback();
          }
          mMessagePageParameters.handleShellBack = !(mParameters && mParameters.shellBack);
          // TODO: Use Illustrated message instead of normal message page
          // TODO: Return value needs to provided but since this function is private for now hence we can skip this.
          _this2.removeTransitionMessages();
          var oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
          if (_this2.base._routing) {
            return Promise.resolve(new Promise(function (resolve, reject) {
              // we have to set a timeout to be able to access the most recent messages
              setTimeout(function () {
                // TODO: great API - will be changed later
                _this2.base._routing.navigateToMessagePage(mParameters && mParameters.isDataReceivedError ? oResourceBundle.getText("C_COMMON_SAPFE_DATA_RECEIVED_ERROR") : oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_TITLE"), mMessagePageParameters).then(resolve).catch(reject);
              }, 0);
            }));
          }
        } else {
          // navigate to message dialog
          return Promise.resolve(_this2.showMessageDialog(mParameters));
        }
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    };
    return MessageHandler;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "getShowBoundMessagesInMessageDialog", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "getShowBoundMessagesInMessageDialog"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "showMessageDialog", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "showMessageDialog"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "removeTransitionMessages", [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "removeTransitionMessages"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "showMessages", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "showMessages"), _class2.prototype)), _class2)) || _class);
  return MessageHandler;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlSGFuZGxlciIsImRlZmluZVVJNUNsYXNzIiwicHJpdmF0ZUV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkluc3RlYWQiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImdldFNob3dCb3VuZE1lc3NhZ2VzSW5NZXNzYWdlRGlhbG9nIiwic2hvd01lc3NhZ2VEaWFsb2ciLCJtUGFyYW1ldGVycyIsImN1c3RvbU1lc3NhZ2VzIiwidW5kZWZpbmVkIiwib09QSW50ZXJuYWxCaW5kaW5nQ29udGV4dCIsImJhc2UiLCJnZXRWaWV3IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJpc0FjdGlvblBhcmFtZXRlckRpYWxvZ09wZW4iLCJzZXRQcm9wZXJ0eSIsImJTaG93Qm91bmRNZXNzYWdlcyIsIm9CaW5kaW5nQ29udGV4dCIsImNvbnRleHQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInNldFRpbWVvdXQiLCJtZXNzYWdlSGFuZGxpbmciLCJzaG93VW5ib3VuZE1lc3NhZ2VzIiwiY29uY3VycmVudEVkaXRGbGFnIiwib25CZWZvcmVTaG93TWVzc2FnZSIsInRoZW4iLCJjYXRjaCIsInJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyIsImtlZXBCb3VuZE1lc3NhZ2UiLCJrZWVwVW5ib3VuZE1lc3NhZ2UiLCJzUGF0aFRvQmVSZW1vdmVkIiwicmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwiX2NoZWNrTmF2aWdhdGlvblRvTWVzc2FnZVBhZ2UiLCJhVW5ib3VuZE1lc3NhZ2VzIiwiZ2V0TWVzc2FnZXMiLCJiU2hvd0JvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwiYUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwiYUN1c3RvbU1lc3NhZ2VzIiwiYklzU3RpY2t5RWRpdE1vZGUiLCJDb21tb25VdGlscyIsImlzU3RpY2t5RWRpdE1vZGUiLCJtTWVzc2FnZVBhZ2VQYXJhbWV0ZXJzIiwiaXNEYXRhUmVjZWl2ZWRFcnJvciIsInRpdGxlIiwiZGVzY3JpcHRpb24iLCJuYXZpZ2F0ZUJhY2tUb09yaWdpbiIsImxlbmd0aCIsImlzSW5pdGlhbExvYWQ1MDNFcnJvciIsIm9NZXNzYWdlIiwib1RlY2huaWNhbERldGFpbHMiLCJnZXRUZWNobmljYWxEZXRhaWxzIiwic1JldHJ5QWZ0ZXJNZXNzYWdlIiwiaHR0cFN0YXR1cyIsInJldHJ5QWZ0ZXIiLCJpU2Vjb25kc0JlZm9yZVJldHJ5IiwiX2dldFNlY29uZHNCZWZvcmVSZXRyeUFmdGVyIiwiZ2V0UmV0cnlBZnRlck1lc3NhZ2UiLCJnZXRNZXNzYWdlIiwiZFJldHJ5QWZ0ZXIiLCJkQ3VycmVudERhdGVUaW1lIiwiRGF0ZSIsImlDdXJyZW50RGF0ZVRpbWVJbk1pbGxpU2Vjb25kcyIsImdldFRpbWUiLCJpUmV0cnlBZnRlckRhdGVUaW1lSW5NaWxsaVNlY29uZHMiLCJzaG93TWVzc2FnZXMiLCJvQXBwQ29tcG9uZW50IiwiZ2V0QXBwQ29tcG9uZW50IiwiX2lzRmNsRW5hYmxlZCIsIm1lc3NhZ2VQYWdlTmF2aWdhdGlvbkNhbGxiYWNrIiwiaGFuZGxlU2hlbGxCYWNrIiwic2hlbGxCYWNrIiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsIl9yb3V0aW5nIiwibmF2aWdhdGVUb01lc3NhZ2VQYWdlIiwiZ2V0VGV4dCIsIkNvbnRyb2xsZXJFeHRlbnNpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk1lc3NhZ2VIYW5kbGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCBtZXNzYWdlSGFuZGxpbmcgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL21lc3NhZ2VIYW5kbGVyL21lc3NhZ2VIYW5kbGluZ1wiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBwcml2YXRlRXh0ZW5zaW9uLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuXG4vKipcbiAqIEEgY29udHJvbGxlciBleHRlbnNpb24gb2ZmZXJpbmcgbWVzc2FnZSBoYW5kbGluZy5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAZXhwZXJpbWVudGFsIEFzIG9mIHZlcnNpb24gMS45MC4wXG4gKiBAc2luY2UgMS45MC4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLk1lc3NhZ2VIYW5kbGVyXCIpXG5jbGFzcyBNZXNzYWdlSGFuZGxlciBleHRlbmRzIENvbnRyb2xsZXJFeHRlbnNpb24ge1xuXHRwcm90ZWN0ZWQgYmFzZSE6IFBhZ2VDb250cm9sbGVyO1xuXHQvKipcblx0ICogRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIG5vdCBib3VuZCBtZXNzYWdlcyBhcmUgc2hvd24gaW4gdGhlIG1lc3NhZ2UgZGlhbG9nLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uSW5zdGVhZH0uXG5cdCAqXG5cdCAqIElmIHRoZSBib3VuZCBtZXNzYWdlcyBhcmUgc2hvd24gdG8gdGhlIHVzZXIgd2l0aCBhIGRpZmZlcmVudCBjb250cm9sIGxpa2UgdGhlIChUT0RPOkxpbmspIE1lc3NhZ2VCdXR0b25cblx0ICogdGhpcyBtZXRob2QgaGFzIHRvIGJlIG92ZXJyaWRkZW4uXG5cdCAqXG5cdCAqIEByZXR1cm5zIERldGVybWluZXMgd2hldGhlciBvciBub3QgYm91bmQgbWVzc2FnZXMgYXJlIHNob3duIGluIHRoZSBtZXNzYWdlIGRpYWxvZy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uSW5zdGVhZClcblx0Z2V0U2hvd0JvdW5kTWVzc2FnZXNJbk1lc3NhZ2VEaWFsb2coKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogU2hvd3MgYSBtZXNzYWdlIGRpYWxvZyB3aXRoIHRyYW5zaXRpb24gbWVzc2FnZXMgaWYgdGhlcmUgYXJlIGFueS5cblx0ICogVGhlIG1lc3NhZ2UgZGlhbG9nIGlzIHNob3duIGFzIGEgbW9kYWwgZGlhbG9nLiBPbmNlIHRoZSB1c2VyIGNvbmZpcm1zIHRoZSBkaWFsb2csIGFsbCB0cmFuc2l0aW9uIG1lc3NhZ2VzXG5cdCAqIGFyZSByZW1vdmVkIGZyb20gdGhlIG1lc3NhZ2UgbW9kZWwuIElmIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgbWVzc2FnZSwgYSBsaXN0IG9mIG1lc3NhZ2VzIGlzIHNob3duLiBUaGUgdXNlclxuXHQgKiBjYW4gZmlsdGVyIG9uIG1lc3NhZ2UgdHlwZXMgYW5kIGNhbiBkaXNwbGF5IGRldGFpbHMgYXMgd2VsbCBhcyB0aGUgbG9uZyB0ZXh0LiBJZiB0aGVyZSBpcyBvbmUgbWVzc2FnZSxcblx0ICogdGhlIGRpYWxvZyBpbW1lZGlhdGVseSBzaG93cyB0aGUgZGV0YWlscyBvZiB0aGUgbWVzc2FnZS4gSWYgdGhlcmUgaXMganVzdCBvbmUgc3VjY2VzcyBtZXNzYWdlLCBhIG1lc3NhZ2Vcblx0ICogdG9hc3QgaXMgc2hvd24gaW5zdGVhZC5cblx0ICpcblx0ICogQHBhcmFtIG1QYXJhbWV0ZXJzIFBSSVZBVEVcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgb25jZSB0aGUgdXNlciBjbG9zZXMgdGhlIGRpYWxvZy4gSWYgdGhlcmUgYXJlIG5vIG1lc3NhZ2VzXG5cdCAqIHRvIGJlIHNob3duLCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCBpbW1lZGlhdGVseVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuTWVzc2FnZUhhbmRsZXIjc2hvd01lc3NhZ2VEaWFsb2dcblx0ICogQHB1YmxpY1xuXHQgKiBAZXhwZXJpbWVudGFsIEFzIG9mIHZlcnNpb24gMS45MC4wXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRzaG93TWVzc2FnZURpYWxvZyhtUGFyYW1ldGVycz86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IGN1c3RvbU1lc3NhZ2VzID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuY3VzdG9tTWVzc2FnZXMgPyBtUGFyYW1ldGVycy5jdXN0b21NZXNzYWdlcyA6IHVuZGVmaW5lZCxcblx0XHRcdG9PUEludGVybmFsQmluZGluZ0NvbnRleHQgPSB0aGlzLmJhc2UuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0Ly8gc2V0IGlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nIG9wZW4gc28gdGhhdCBpdCBjYW4gYmUgdXNlZCBpbiB0aGUgY29udHJvbGxlciBleHRlbnNpb24gdG8gZGVjaWRlIHdoZXRoZXIgbWVzc2FnZSBkaWFsb2cgc2hvdWxkIG9wZW4gb3Igbm90XG5cdFx0aWYgKG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nT3BlbiAmJiBvT1BJbnRlcm5hbEJpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRvT1BJbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KFwiaXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2dPcGVuXCIsIHRydWUpO1xuXHRcdH1cblx0XHRjb25zdCBiU2hvd0JvdW5kTWVzc2FnZXMgPSB0aGlzLmdldFNob3dCb3VuZE1lc3NhZ2VzSW5NZXNzYWdlRGlhbG9nKCk7XG5cdFx0Y29uc3Qgb0JpbmRpbmdDb250ZXh0ID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuY29udGV4dCA/IG1QYXJhbWV0ZXJzLmNvbnRleHQgOiB0aGlzLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdC8vY29uc3QgYkV0YWdNZXNzYWdlID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuYkhhc0V0YWdNZXNzYWdlO1xuXHRcdC8vIHJlc2V0ICBpc0FjdGlvblBhcmFtZXRlckRpYWxvZ09wZW5cblx0XHQvLyBjYW5ub3QgZG8gdGhpcyBvcGVyYXRpb25zLmpzIHNpbmNlIGl0IGlzIG5vdCBhd2FyZSBvZiB0aGUgdmlld1xuXHRcdGlmIChvT1BJbnRlcm5hbEJpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRvT1BJbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KFwiaXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2dPcGVuXCIsIGZhbHNlKTtcblx0XHR9XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCwgcmVqZWN0OiAocmVhc29uPzogYW55KSA9PiB2b2lkKSB7XG5cdFx0XHQvLyB3ZSBoYXZlIHRvIHNldCBhIHRpbWVvdXQgdG8gYmUgYWJsZSB0byBhY2Nlc3MgdGhlIG1vc3QgcmVjZW50IG1lc3NhZ2VzXG5cdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Ly8gVE9ETzogZ3JlYXQgQVBJIC0gd2lsbCBiZSBjaGFuZ2VkIGxhdGVyXG5cdFx0XHRcdG1lc3NhZ2VIYW5kbGluZ1xuXHRcdFx0XHRcdC5zaG93VW5ib3VuZE1lc3NhZ2VzKFxuXHRcdFx0XHRcdFx0Y3VzdG9tTWVzc2FnZXMsXG5cdFx0XHRcdFx0XHRvQmluZGluZ0NvbnRleHQsXG5cdFx0XHRcdFx0XHRiU2hvd0JvdW5kTWVzc2FnZXMsXG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycz8uY29uY3VycmVudEVkaXRGbGFnLFxuXHRcdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0XHRtUGFyYW1ldGVycz8ub25CZWZvcmVTaG93TWVzc2FnZVxuXHRcdFx0XHRcdClcblx0XHRcdFx0XHQudGhlbihyZXNvbHZlKVxuXHRcdFx0XHRcdC5jYXRjaChyZWplY3QpO1xuXHRcdFx0fSwgMCk7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogWW91IGNhbiByZW1vdmUgdGhlIGV4aXN0aW5nIHRyYW5zaXRpb24gbWVzc2FnZSBmcm9tIHRoZSBtZXNzYWdlIG1vZGVsIHdpdGggdGhpcyBtZXRob2QuXG5cdCAqIFdpdGggZXZlcnkgdXNlciBpbnRlcmFjdGlvbiB0aGF0IGNhdXNlcyBzZXJ2ZXIgY29tbXVuaWNhdGlvbiAobGlrZSBjbGlja2luZyBvbiBhbiBhY3Rpb24sIGNoYW5naW5nIGRhdGEpLFxuXHQgKiB0aGlzIG1ldGhvZCByZW1vdmVzIHRoZSBleGlzdGluZyB0cmFuc2l0aW9uIG1lc3NhZ2VzIGZyb20gdGhlIG1lc3NhZ2UgbW9kZWwuXG5cdCAqXG5cdCAqIEBwYXJhbSBba2VlcEJvdW5kTWVzc2FnZV0gQ2hlY2tzIGlmIHRoZSBib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzIGFyZSBub3QgdG8gYmUgcmVtb3ZlZFxuXHQgKiBAcGFyYW0ga2VlcFVuYm91bmRNZXNzYWdlXG5cdCAqIEBwYXJhbSBzUGF0aFRvQmVSZW1vdmVkXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5NZXNzYWdlSGFuZGxlciNyZW1vdmVzVHJhbnNpdGlvbk1lc3NhZ2VzXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0cmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKGtlZXBCb3VuZE1lc3NhZ2U/OiBib29sZWFuLCBrZWVwVW5ib3VuZE1lc3NhZ2U/OiBib29sZWFuLCBzUGF0aFRvQmVSZW1vdmVkPzogc3RyaW5nKSB7XG5cdFx0aWYgKCFrZWVwQm91bmRNZXNzYWdlKSB7XG5cdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoc1BhdGhUb0JlUmVtb3ZlZCk7XG5cdFx0fVxuXHRcdGlmICgha2VlcFVuYm91bmRNZXNzYWdlKSB7XG5cdFx0XHRtZXNzYWdlSGFuZGxpbmcucmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdH1cblx0fVxuXG5cdF9jaGVja05hdmlnYXRpb25Ub01lc3NhZ2VQYWdlKG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRjb25zdCBhVW5ib3VuZE1lc3NhZ2VzID0gbWVzc2FnZUhhbmRsaW5nLmdldE1lc3NhZ2VzKCk7XG5cdFx0Y29uc3QgYlNob3dCb3VuZFRyYW5zaXRpb25NZXNzYWdlcyA9IHRoaXMuZ2V0U2hvd0JvdW5kTWVzc2FnZXNJbk1lc3NhZ2VEaWFsb2coKTtcblx0XHRjb25zdCBhQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMgPSBiU2hvd0JvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzID8gbWVzc2FnZUhhbmRsaW5nLmdldE1lc3NhZ2VzKHRydWUsIHRydWUpIDogW107XG5cdFx0Y29uc3QgYUN1c3RvbU1lc3NhZ2VzID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMuY3VzdG9tTWVzc2FnZXMgPyBtUGFyYW1ldGVycy5jdXN0b21NZXNzYWdlcyA6IFtdO1xuXHRcdGNvbnN0IGJJc1N0aWNreUVkaXRNb2RlID0gQ29tbW9uVXRpbHMuaXNTdGlja3lFZGl0TW9kZSh0aGlzLmJhc2UuZ2V0VmlldygpKTtcblx0XHRsZXQgbU1lc3NhZ2VQYWdlUGFyYW1ldGVycztcblxuXHRcdC8vIFRPRE86IFN0aWNrIG1vZGUgY2hlY2sgaXMgb2theSBhcyBsb25nIGFzIHRoZSBjb250cm9sbGVyIGV4dGVuc2lvbiBpcyB1c2VkIHdpdGggc2FwLmZlLmNvcmUgYW5kIHNhcC5mZS5jb3JlLkFwcENvbXBvbmVudC5cblx0XHQvLyBJdCBtaWdodCBiZSBiZXR0ZXIgdG8gcHJvdmlkZSBhbiBleHRlbnNpb24gdG8gdGhlIGNvbnN1bWVyIG9mIHRoZSBjb250cm9sbGVyIGV4dGVuc2lvbiB0byBwcm92aWRlIHRoaXMgdmFsdWUuXG5cblx0XHQvLyBUaGUgbWVzc2FnZSBwYWdlIGNhbiBvbmx5IHNob3cgMSBtZXNzYWdlIHRvZGF5LCBzbyB3ZSBuYXZpZ2F0ZSB0byBpdCB3aGVuIDpcblx0XHQvLyAxLiBUaGVyZSBhcmUgbm8gYm91bmQgdHJhbnNpdGlvbiBtZXNzYWdlcyB0byBzaG93LFxuXHRcdC8vIDIuIFRoZXJlIGFyZSBubyBjdXN0b20gbWVzc2FnZXMgdG8gc2hvdywgJlxuXHRcdC8vIDMuIFRoZXJlIGlzIGV4YWN0bHkgMSB1bmJvdW5kIG1lc3NhZ2UgaW4gdGhlIG1lc3NhZ2UgbW9kZWwgd2l0aCBzdGF0dXNDb2RlPTUwMyBhbmQgcmV0cnktQWZ0ZXIgYXZhaWxhYmxlXG5cdFx0Ly8gNC4gcmV0cnlBZnRlciBpcyBncmVhdGVyIHRoYW4gMTIwIHNlY29uZHNcblx0XHQvL1xuXHRcdC8vIEluIEFkZGl0aW9uLCBuYXZpZ2F0aW5nIGF3YXkgZnJvbSBhIHN0aWNreSBzZXNzaW9uIHdpbGwgZGVzdHJveSB0aGUgc2Vzc2lvbiBzbyB3ZSBkbyBub3QgbmF2aWdhdGUgdG8gbWVzc2FnZSBwYWdlIGZvciBub3cuXG5cdFx0Ly8gVE9ETzogY2hlY2sgaWYgbmF2aWdhdGlvbiBzaG91bGQgYmUgZG9uZSBpbiBzdGlja3kgZWRpdCBtb2RlLlxuXHRcdGlmIChtUGFyYW1ldGVycyAmJiBtUGFyYW1ldGVycy5pc0RhdGFSZWNlaXZlZEVycm9yKSB7XG5cdFx0XHRtTWVzc2FnZVBhZ2VQYXJhbWV0ZXJzID0ge1xuXHRcdFx0XHR0aXRsZTogbVBhcmFtZXRlcnMudGl0bGUsXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiBtUGFyYW1ldGVycy5kZXNjcmlwdGlvbixcblx0XHRcdFx0bmF2aWdhdGVCYWNrVG9PcmlnaW46IHRydWVcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdCFiSXNTdGlja3lFZGl0TW9kZSAmJlxuXHRcdFx0IWFCb3VuZFRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGggJiZcblx0XHRcdCFhQ3VzdG9tTWVzc2FnZXMubGVuZ3RoICYmXG5cdFx0XHQoYVVuYm91bmRNZXNzYWdlcy5sZW5ndGggPT09IDEgfHwgKG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmlzSW5pdGlhbExvYWQ1MDNFcnJvcikpXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBvTWVzc2FnZSA9IGFVbmJvdW5kTWVzc2FnZXNbMF0sXG5cdFx0XHRcdG9UZWNobmljYWxEZXRhaWxzID0gb01lc3NhZ2UuZ2V0VGVjaG5pY2FsRGV0YWlscygpO1xuXHRcdFx0bGV0IHNSZXRyeUFmdGVyTWVzc2FnZTtcblx0XHRcdGlmIChvVGVjaG5pY2FsRGV0YWlscyAmJiBvVGVjaG5pY2FsRGV0YWlscy5odHRwU3RhdHVzID09PSA1MDMpIHtcblx0XHRcdFx0aWYgKG9UZWNobmljYWxEZXRhaWxzLnJldHJ5QWZ0ZXIpIHtcblx0XHRcdFx0XHRjb25zdCBpU2Vjb25kc0JlZm9yZVJldHJ5ID0gdGhpcy5fZ2V0U2Vjb25kc0JlZm9yZVJldHJ5QWZ0ZXIob1RlY2huaWNhbERldGFpbHMucmV0cnlBZnRlcik7XG5cdFx0XHRcdFx0aWYgKGlTZWNvbmRzQmVmb3JlUmV0cnkgPiAxMjApIHtcblx0XHRcdFx0XHRcdC8vIFRPRE86IEZvciBub3cgbGV0J3Mga2VlcCBnZXRSZXRyeUFmdGVyTWVzc2FnZSBpbiBtZXNzYWdlSGFuZGxpbmcgYmVjYXVzZSBpdCBpcyBuZWVkZWQgYWxzbyBieSB0aGUgZGlhbG9nLlxuXHRcdFx0XHRcdFx0Ly8gV2UgY2FuIHBsYW4gdG8gbW92ZSB0aGlzIGFuZCB0aGUgZGlhbG9nIGxvZ2ljIGJvdGggdG8gbWVzc2FnZUhhbmRsZXIgY29udHJvbGxlciBleHRlbnNpb24gaWYgcmVxdWlyZWQuXG5cdFx0XHRcdFx0XHRzUmV0cnlBZnRlck1lc3NhZ2UgPSBtZXNzYWdlSGFuZGxpbmcuZ2V0UmV0cnlBZnRlck1lc3NhZ2Uob01lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0bU1lc3NhZ2VQYWdlUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb246IHNSZXRyeUFmdGVyTWVzc2FnZSA/IGAke3NSZXRyeUFmdGVyTWVzc2FnZX0gJHtvTWVzc2FnZS5nZXRNZXNzYWdlKCl9YCA6IG9NZXNzYWdlLmdldE1lc3NhZ2UoKSxcblx0XHRcdFx0XHRcdFx0bmF2aWdhdGVCYWNrVG9PcmlnaW46IHRydWVcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNSZXRyeUFmdGVyTWVzc2FnZSA9IG1lc3NhZ2VIYW5kbGluZy5nZXRSZXRyeUFmdGVyTWVzc2FnZShvTWVzc2FnZSk7XG5cdFx0XHRcdFx0bU1lc3NhZ2VQYWdlUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBzUmV0cnlBZnRlck1lc3NhZ2UgPyBgJHtzUmV0cnlBZnRlck1lc3NhZ2V9ICR7b01lc3NhZ2UuZ2V0TWVzc2FnZSgpfWAgOiBvTWVzc2FnZS5nZXRNZXNzYWdlKCksXG5cdFx0XHRcdFx0XHRuYXZpZ2F0ZUJhY2tUb09yaWdpbjogdHJ1ZVxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG1NZXNzYWdlUGFnZVBhcmFtZXRlcnM7XG5cdH1cblxuXHRfZ2V0U2Vjb25kc0JlZm9yZVJldHJ5QWZ0ZXIoZFJldHJ5QWZ0ZXI6IGFueSkge1xuXHRcdGNvbnN0IGRDdXJyZW50RGF0ZVRpbWUgPSBuZXcgRGF0ZSgpLFxuXHRcdFx0aUN1cnJlbnREYXRlVGltZUluTWlsbGlTZWNvbmRzID0gZEN1cnJlbnREYXRlVGltZS5nZXRUaW1lKCksXG5cdFx0XHRpUmV0cnlBZnRlckRhdGVUaW1lSW5NaWxsaVNlY29uZHMgPSBkUmV0cnlBZnRlci5nZXRUaW1lKCksXG5cdFx0XHRpU2Vjb25kc0JlZm9yZVJldHJ5ID0gKGlSZXRyeUFmdGVyRGF0ZVRpbWVJbk1pbGxpU2Vjb25kcyAtIGlDdXJyZW50RGF0ZVRpbWVJbk1pbGxpU2Vjb25kcykgLyAxMDAwO1xuXHRcdHJldHVybiBpU2Vjb25kc0JlZm9yZVJldHJ5O1xuXHR9XG5cdC8qKlxuXHQgKiBTaG93cyBhIG1lc3NhZ2UgcGFnZSBvciBhIG1lc3NhZ2UgZGlhbG9nIGJhc2VkIG9uIHRoZSBtZXNzYWdlcyBpbiB0aGUgbWVzc2FnZSBkaWFsb2cuXG5cdCAqXG5cdCAqIEBwYXJhbSBbbVBhcmFtZXRlcnNdXG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIG9uY2UgdGhlIHVzZXIgY2xvc2VzIHRoZSBtZXNzYWdlIGRpYWxvZyBvciB3aGVuIG5hdmlnYXRpb24gdG8gdGhlIG1lc3NhZ2UgcGFnZSBpcyBjb21wbGV0ZS4gSWYgdGhlcmUgYXJlIG5vIG1lc3NhZ2VzXG5cdCAqIHRvIGJlIHNob3duLCB0aGUgcHJvbWlzZSBpcyByZXNvbHZlZCBpbW1lZGlhdGVseVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIHNob3dNZXNzYWdlcyhtUGFyYW1ldGVycz86IGFueSk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5nZXRWaWV3KCkpO1xuXHRcdGxldCBtTWVzc2FnZVBhZ2VQYXJhbWV0ZXJzOiBhbnk7XG5cdFx0aWYgKCFvQXBwQ29tcG9uZW50Ll9pc0ZjbEVuYWJsZWQoKSkge1xuXHRcdFx0bU1lc3NhZ2VQYWdlUGFyYW1ldGVycyA9IHRoaXMuX2NoZWNrTmF2aWdhdGlvblRvTWVzc2FnZVBhZ2UobVBhcmFtZXRlcnMpO1xuXHRcdH1cblx0XHRpZiAobU1lc3NhZ2VQYWdlUGFyYW1ldGVycykge1xuXHRcdFx0Ly8gbmF2aWdhdGUgdG8gbWVzc2FnZSBwYWdlLlxuXHRcdFx0Ly8gaGFuZGxlciBiZWZvcmUgcGFnZSBuYXZpZ2F0aW9uIGlzIHRyaWdnZXJlZCwgZm9yIGV4YW1wbGUgdG8gY2xvc2UgdGhlIGFjdGlvbiBwYXJhbWV0ZXIgZGlhbG9nXG5cdFx0XHRpZiAobVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMubWVzc2FnZVBhZ2VOYXZpZ2F0aW9uQ2FsbGJhY2spIHtcblx0XHRcdFx0bVBhcmFtZXRlcnMubWVzc2FnZVBhZ2VOYXZpZ2F0aW9uQ2FsbGJhY2soKTtcblx0XHRcdH1cblxuXHRcdFx0bU1lc3NhZ2VQYWdlUGFyYW1ldGVycy5oYW5kbGVTaGVsbEJhY2sgPSAhKG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLnNoZWxsQmFjayk7XG5cdFx0XHQvLyBUT0RPOiBVc2UgSWxsdXN0cmF0ZWQgbWVzc2FnZSBpbnN0ZWFkIG9mIG5vcm1hbCBtZXNzYWdlIHBhZ2Vcblx0XHRcdC8vIFRPRE86IFJldHVybiB2YWx1ZSBuZWVkcyB0byBwcm92aWRlZCBidXQgc2luY2UgdGhpcyBmdW5jdGlvbiBpcyBwcml2YXRlIGZvciBub3cgaGVuY2Ugd2UgY2FuIHNraXAgdGhpcy5cblx0XHRcdHRoaXMucmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRcdFx0aWYgKHRoaXMuYmFzZS5fcm91dGluZykge1xuXHRcdFx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmU6IGFueSwgcmVqZWN0OiBhbnkpID0+IHtcblx0XHRcdFx0XHQvLyB3ZSBoYXZlIHRvIHNldCBhIHRpbWVvdXQgdG8gYmUgYWJsZSB0byBhY2Nlc3MgdGhlIG1vc3QgcmVjZW50IG1lc3NhZ2VzXG5cdFx0XHRcdFx0c2V0VGltZW91dCgoKSA9PiB7XG5cdFx0XHRcdFx0XHQvLyBUT0RPOiBncmVhdCBBUEkgLSB3aWxsIGJlIGNoYW5nZWQgbGF0ZXJcblx0XHRcdFx0XHRcdHRoaXMuYmFzZS5fcm91dGluZ1xuXHRcdFx0XHRcdFx0XHQubmF2aWdhdGVUb01lc3NhZ2VQYWdlKFxuXHRcdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzICYmIG1QYXJhbWV0ZXJzLmlzRGF0YVJlY2VpdmVkRXJyb3Jcblx0XHRcdFx0XHRcdFx0XHRcdD8gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9EQVRBX1JFQ0VJVkVEX0VSUk9SXCIpXG5cdFx0XHRcdFx0XHRcdFx0XHQ6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFXzUwM19USVRMRVwiKSxcblx0XHRcdFx0XHRcdFx0XHRtTWVzc2FnZVBhZ2VQYXJhbWV0ZXJzXG5cdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0LnRoZW4ocmVzb2x2ZSlcblx0XHRcdFx0XHRcdFx0LmNhdGNoKHJlamVjdCk7XG5cdFx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBuYXZpZ2F0ZSB0byBtZXNzYWdlIGRpYWxvZ1xuXHRcdFx0cmV0dXJuIHRoaXMuc2hvd01lc3NhZ2VEaWFsb2cobVBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxufVxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZUhhbmRsZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7RUFTQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUEEsSUFTTUEsY0FBYyxXQURuQkMsY0FBYyxDQUFDLGlEQUFpRCxDQUFDLFVBZWhFQyxnQkFBZ0IsRUFBRSxVQUNsQkMsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsT0FBTyxDQUFDLFVBcUJyQ0MsZUFBZSxFQUFFLFVBQ2pCQyxjQUFjLEVBQUUsVUE4Q2hCRCxlQUFlLEVBQUUsVUFtRmpCQSxlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRTtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFyS2pCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQVhDLE9BY0FDLG1DQUFtQyxHQUZuQywrQ0FFc0M7TUFDckMsT0FBTyxJQUFJO0lBQ1o7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FmQztJQUFBLE9Ba0JBQyxpQkFBaUIsR0FGakIsMkJBRWtCQyxXQUFpQixFQUFpQjtNQUNuRCxJQUFNQyxjQUFjLEdBQUdELFdBQVcsSUFBSUEsV0FBVyxDQUFDQyxjQUFjLEdBQUdELFdBQVcsQ0FBQ0MsY0FBYyxHQUFHQyxTQUFTO1FBQ3hHQyx5QkFBeUIsR0FBRyxJQUFJLENBQUNDLElBQUksQ0FBQ0MsT0FBTyxFQUFFLENBQUNDLGlCQUFpQixDQUFDLFVBQVUsQ0FBeUI7TUFDdEc7TUFDQSxJQUFJTixXQUFXLElBQUlBLFdBQVcsQ0FBQ08sMkJBQTJCLElBQUlKLHlCQUF5QixFQUFFO1FBQ3hGQSx5QkFBeUIsQ0FBQ0ssV0FBVyxD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