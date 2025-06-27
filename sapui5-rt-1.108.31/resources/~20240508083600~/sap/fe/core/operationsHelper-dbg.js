/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Bar", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageBox", "sap/m/Title", "sap/ui/core/message/Message", "sap/ui/model/json/JSONModel", "./CommonUtils", "./controllerextensions/messageHandler/messageHandling", "./formatters/TableFormatterTypes"], function (Bar, Button, Dialog, MessageBox, Title, Message, JSONModel, CommonUtils, messageHandling, TableFormatterTypes) {
  "use strict";

  var MessageType = TableFormatterTypes.MessageType;
  function renderMessageView(mParameters, oResourceBundle, messageHandler, aMessages, isMultiContext412, resolve, sGroupId) {
    var _mParameters$internal;
    var sActionName = mParameters.label;
    var oModel = mParameters.model,
      sCancelButtonTxt = CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP", oResourceBundle);
    var strictHandlingPromises = mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal = mParameters.internalModelContext) === null || _mParameters$internal === void 0 ? void 0 : _mParameters$internal.getProperty("strictHandlingPromises");
    var sMessage;
    if (aMessages.length === 1) {
      var messageText = aMessages[0].getMessage();
      var identifierText = aMessages[0].getAdditionalText();
      if (!isMultiContext412) {
        sMessage = "".concat(messageText, "\n").concat(CommonUtils.getTranslatedText("PROCEED", oResourceBundle));
      } else if (identifierText !== undefined && identifierText !== "") {
        var sHeaderInfoTypeName = mParameters.control.getParent().getTableDefinition().headerInfoTypeName;
        if (sHeaderInfoTypeName) {
          sMessage = "".concat(sHeaderInfoTypeName, " ").concat(identifierText, ": ").concat(messageText, "\n\n").concat(CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP_SINGLE_MESSAGE_TEXT", oResourceBundle));
        } else {
          sMessage = "".concat(identifierText, ": ").concat(messageText, "\n\n").concat(CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP_SINGLE_MESSAGE_TEXT", oResourceBundle));
        }
      } else {
        sMessage = "".concat(messageText, "\n\n").concat(CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP_SINGLE_MESSAGE_TEXT", oResourceBundle));
      }
      MessageBox.warning(sMessage, {
        title: CommonUtils.getTranslatedText("WARNING", oResourceBundle),
        actions: [sActionName, sCancelButtonTxt],
        emphasizedAction: sActionName,
        onClose: function (sAction) {
          var _mParameters$internal5;
          if (sAction === sActionName) {
            var _mParameters$internal3;
            if (!isMultiContext412) {
              resolve(true);
              oModel.submitBatch(sGroupId);
              if (mParameters.requestSideEffects) {
                mParameters.requestSideEffects();
              }
            } else {
              var _mParameters$internal2;
              strictHandlingPromises.forEach(function (sHPromise) {
                sHPromise.resolve(true);
                oModel.submitBatch(sHPromise.groupId);
                if (sHPromise.requestSideEffects) {
                  sHPromise.requestSideEffects();
                }
              });
              var strictHandlingFails = mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal2 = mParameters.internalModelContext) === null || _mParameters$internal2 === void 0 ? void 0 : _mParameters$internal2.getProperty("strictHandlingFails");
              if (strictHandlingFails.length > 0) {
                messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeTransitionMessages();
              }
            }
            mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal3 = mParameters.internalModelContext) === null || _mParameters$internal3 === void 0 ? void 0 : _mParameters$internal3.setProperty("412Executed", true);
          } else {
            var _mParameters$internal4;
            mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal4 = mParameters.internalModelContext) === null || _mParameters$internal4 === void 0 ? void 0 : _mParameters$internal4.setProperty("412Executed", false);
            if (!isMultiContext412) {
              resolve(false);
            } else {
              strictHandlingPromises.forEach(function (sHPromise) {
                sHPromise.resolve(false);
              });
            }
          }
          mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal5 = mParameters.internalModelContext) === null || _mParameters$internal5 === void 0 ? void 0 : _mParameters$internal5.setProperty("412Messages", []);
        }
      });
    } else if (aMessages.length > 1) {
      if (isMultiContext412) {
        var genericMessage = new Message({
          message: CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP_MESSAGES_WARNING", oResourceBundle),
          type: MessageType.Warning,
          target: undefined,
          persistent: true,
          description: CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP_MESSAGES_TEXT", oResourceBundle, sActionName)
        });
        aMessages = [genericMessage].concat(aMessages);
      }
      var oMessageDialogModel = new JSONModel();
      oMessageDialogModel.setData(aMessages);
      var bStrictHandlingFlow = true;
      var oMessageObject = messageHandling.prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow, isMultiContext412);
      var oDialog = new Dialog({
        resizable: true,
        content: oMessageObject.oMessageView,
        state: "Warning",
        customHeader: new Bar({
          contentLeft: [oMessageObject.oBackButton],
          contentMiddle: [new Title({
            text: "Warning"
          })]
        }),
        contentHeight: "50%",
        contentWidth: "50%",
        verticalScrolling: false
      });
      oDialog.setBeginButton(new Button({
        press: function () {
          var _mParameters$internal8;
          if (!isMultiContext412) {
            resolve(true);
            oModel.submitBatch(sGroupId);
          } else {
            var _mParameters$internal6, _mParameters$internal7;
            strictHandlingPromises.forEach(function (sHPromise) {
              sHPromise.resolve(true);
              oModel.submitBatch(sHPromise.groupId);
              if (sHPromise.requestSideEffects) {
                sHPromise.requestSideEffects();
              }
            });
            var strictHandlingFails = mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal6 = mParameters.internalModelContext) === null || _mParameters$internal6 === void 0 ? void 0 : _mParameters$internal6.getProperty("strictHandlingFails");
            if (strictHandlingFails.length > 0) {
              messageHandler === null || messageHandler === void 0 ? void 0 : messageHandler.removeTransitionMessages();
            }
            mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal7 = mParameters.internalModelContext) === null || _mParameters$internal7 === void 0 ? void 0 : _mParameters$internal7.setProperty("412Messages", []);
          }
          mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal8 = mParameters.internalModelContext) === null || _mParameters$internal8 === void 0 ? void 0 : _mParameters$internal8.setProperty("412Executed", true);
          oMessageDialogModel.setData({});
          oDialog.close();
        },
        type: "Emphasized",
        text: sActionName
      }));
      oDialog.setEndButton(new Button({
        press: function () {
          var _mParameters$internal9, _mParameters$internal10;
          mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal9 = mParameters.internalModelContext) === null || _mParameters$internal9 === void 0 ? void 0 : _mParameters$internal9.setProperty("412Messages", []);
          mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal10 = mParameters.internalModelContext) === null || _mParameters$internal10 === void 0 ? void 0 : _mParameters$internal10.setProperty("412Executed", false);
          if (!isMultiContext412) {
            resolve(false);
          } else {
            strictHandlingPromises.forEach(function (sHPromise) {
              sHPromise.resolve(false);
            });
          }
          oMessageDialogModel.setData({});
          oDialog.close();
        },
        text: sCancelButtonTxt
      }));
      oDialog.open();
    }
  }
  function fnOnStrictHandlingFailed(sGroupId, mParameters, oResourceBundle, current_context_index, oContext, iContextLength, messageHandler, a412Messages) {
    if (current_context_index === null && iContextLength === null || current_context_index === 1 && iContextLength === 1) {
      return new Promise(function (resolve) {
        operationsHelper.renderMessageView(mParameters, oResourceBundle, messageHandler, a412Messages, false, resolve, sGroupId);
      });
    } else {
      var _mParameters$internal11, _mParameters$internal12, _mParameters$internal13, _mParameters$internal14;
      var sActionName = mParameters.label;
      var a412TransitionMessages = mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal11 = mParameters.internalModelContext) === null || _mParameters$internal11 === void 0 ? void 0 : _mParameters$internal11.getProperty("412Messages");
      var sValue = "";
      // If there is more than one context we need the identifier. This would fix if the action is triggered via table chevron
      if (iContextLength && iContextLength > 1) {
        var _mParameters$control;
        var oTable = (_mParameters$control = mParameters.control) === null || _mParameters$control === void 0 ? void 0 : _mParameters$control.getParent();
        var sColumn = oTable.isA("sap.fe.macros.table.TableAPI") && (oTable === null || oTable === void 0 ? void 0 : oTable.getIdentifierColumn());
        if (sColumn) {
          sValue = oContext && oContext.getObject(sColumn);
        }
      }
      a412Messages.forEach(function (msg) {
        msg.setType("Warning");
        msg.setAdditionalText(sValue);
        a412TransitionMessages.push(msg);
      });
      if (mParameters.dialog && mParameters.dialog.isOpen()) {
        mParameters.dialog.close();
      }
      var strictHandlingPromises = mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal12 = mParameters.internalModelContext) === null || _mParameters$internal12 === void 0 ? void 0 : _mParameters$internal12.getProperty("strictHandlingPromises");
      var strictHandlingPromise = new Promise(function (resolve) {
        strictHandlingPromises.push({
          groupId: sGroupId,
          resolve: resolve,
          actionName: sActionName,
          model: mParameters.model,
          value: sValue,
          requestSideEffects: mParameters.requestSideEffects
        });
      });
      mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal13 = mParameters.internalModelContext) === null || _mParameters$internal13 === void 0 ? void 0 : _mParameters$internal13.setProperty("412Messages", a412TransitionMessages);
      mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal14 = mParameters.internalModelContext) === null || _mParameters$internal14 === void 0 ? void 0 : _mParameters$internal14.setProperty("strictHandlingPromises", strictHandlingPromises);
      if (current_context_index === iContextLength || current_context_index === null && iContextLength !== null && iContextLength >= 1) {
        var _mParameters$internal15;
        // current_context_index is set to null (for changeset) if there no context is selected or if a single context is selected
        // this check is not required in versions 1.114.0 and over because strict handling is refactored
        operationsHelper.renderMessageView(mParameters, oResourceBundle, messageHandler, mParameters === null || mParameters === void 0 ? void 0 : (_mParameters$internal15 = mParameters.internalModelContext) === null || _mParameters$internal15 === void 0 ? void 0 : _mParameters$internal15.getProperty("412Messages"), true);
      }
      return strictHandlingPromise;
    }
  }
  var operationsHelper = {
    renderMessageView: renderMessageView,
    fnOnStrictHandlingFailed: fnOnStrictHandlingFailed
  };
  return operationsHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJyZW5kZXJNZXNzYWdlVmlldyIsIm1QYXJhbWV0ZXJzIiwib1Jlc291cmNlQnVuZGxlIiwibWVzc2FnZUhhbmRsZXIiLCJhTWVzc2FnZXMiLCJpc011bHRpQ29udGV4dDQxMiIsInJlc29sdmUiLCJzR3JvdXBJZCIsInNBY3Rpb25OYW1lIiwibGFiZWwiLCJvTW9kZWwiLCJtb2RlbCIsInNDYW5jZWxCdXR0b25UeHQiLCJDb21tb25VdGlscyIsImdldFRyYW5zbGF0ZWRUZXh0Iiwic3RyaWN0SGFuZGxpbmdQcm9taXNlcyIsImludGVybmFsTW9kZWxDb250ZXh0IiwiZ2V0UHJvcGVydHkiLCJzTWVzc2FnZSIsImxlbmd0aCIsIm1lc3NhZ2VUZXh0IiwiZ2V0TWVzc2FnZSIsImlkZW50aWZpZXJUZXh0IiwiZ2V0QWRkaXRpb25hbFRleHQiLCJ1bmRlZmluZWQiLCJzSGVhZGVySW5mb1R5cGVOYW1lIiwiY29udHJvbCIsImdldFBhcmVudCIsImdldFRhYmxlRGVmaW5pdGlvbiIsImhlYWRlckluZm9UeXBlTmFtZSIsIk1lc3NhZ2VCb3giLCJ3YXJuaW5nIiwidGl0bGUiLCJhY3Rpb25zIiwiZW1waGFzaXplZEFjdGlvbiIsIm9uQ2xvc2UiLCJzQWN0aW9uIiwic3VibWl0QmF0Y2giLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCJmb3JFYWNoIiwic0hQcm9taXNlIiwiZ3JvdXBJZCIsInN0cmljdEhhbmRsaW5nRmFpbHMiLCJyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMiLCJzZXRQcm9wZXJ0eSIsImdlbmVyaWNNZXNzYWdlIiwiTWVzc2FnZSIsIm1lc3NhZ2UiLCJ0eXBlIiwiTWVzc2FnZVR5cGUiLCJXYXJuaW5nIiwidGFyZ2V0IiwicGVyc2lzdGVudCIsImRlc2NyaXB0aW9uIiwiY29uY2F0Iiwib01lc3NhZ2VEaWFsb2dNb2RlbCIsIkpTT05Nb2RlbCIsInNldERhdGEiLCJiU3RyaWN0SGFuZGxpbmdGbG93Iiwib01lc3NhZ2VPYmplY3QiLCJtZXNzYWdlSGFuZGxpbmciLCJwcmVwYXJlTWVzc2FnZVZpZXdGb3JEaWFsb2ciLCJvRGlhbG9nIiwiRGlhbG9nIiwicmVzaXphYmxlIiwiY29udGVudCIsIm9NZXNzYWdlVmlldyIsInN0YXRlIiwiY3VzdG9tSGVhZGVyIiwiQmFyIiwiY29udGVudExlZnQiLCJvQmFja0J1dHRvbiIsImNvbnRlbnRNaWRkbGUiLCJUaXRsZSIsInRleHQiLCJjb250ZW50SGVpZ2h0IiwiY29udGVudFdpZHRoIiwidmVydGljYWxTY3JvbGxpbmciLCJzZXRCZWdpbkJ1dHRvbiIsIkJ1dHRvbiIsInByZXNzIiwiY2xvc2UiLCJzZXRFbmRCdXR0b24iLCJvcGVuIiwiZm5PblN0cmljdEhhbmRsaW5nRmFpbGVkIiwiY3VycmVudF9jb250ZXh0X2luZGV4Iiwib0NvbnRleHQiLCJpQ29udGV4dExlbmd0aCIsImE0MTJNZXNzYWdlcyIsIlByb21pc2UiLCJvcGVyYXRpb25zSGVscGVyIiwiYTQxMlRyYW5zaXRpb25NZXNzYWdlcyIsInNWYWx1ZSIsIm9UYWJsZSIsInNDb2x1bW4iLCJpc0EiLCJnZXRJZGVudGlmaWVyQ29sdW1uIiwiZ2V0T2JqZWN0IiwibXNnIiwic2V0VHlwZSIsInNldEFkZGl0aW9uYWxUZXh0IiwicHVzaCIsImRpYWxvZyIsImlzT3BlbiIsInN0cmljdEhhbmRsaW5nUHJvbWlzZSIsImFjdGlvbk5hbWUiLCJ2YWx1ZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsib3BlcmF0aW9uc0hlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVzb3VyY2VCdW5kbGUgZnJvbSBcInNhcC9iYXNlL2kxOG4vUmVzb3VyY2VCdW5kbGVcIjtcbmltcG9ydCBCYXIgZnJvbSBcInNhcC9tL0JhclwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBNZXNzYWdlQm94IGZyb20gXCJzYXAvbS9NZXNzYWdlQm94XCI7XG5pbXBvcnQgVGl0bGUgZnJvbSBcInNhcC9tL1RpdGxlXCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwiLi9Db21tb25VdGlsc1wiO1xuaW1wb3J0IE1lc3NhZ2VIYW5kbGVyIGZyb20gXCIuL2NvbnRyb2xsZXJleHRlbnNpb25zL01lc3NhZ2VIYW5kbGVyXCI7XG5pbXBvcnQgbWVzc2FnZUhhbmRsaW5nIGZyb20gXCIuL2NvbnRyb2xsZXJleHRlbnNpb25zL21lc3NhZ2VIYW5kbGVyL21lc3NhZ2VIYW5kbGluZ1wiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwiLi9mb3JtYXR0ZXJzL1RhYmxlRm9ybWF0dGVyVHlwZXNcIjtcblxuZnVuY3Rpb24gcmVuZGVyTWVzc2FnZVZpZXcoXG5cdG1QYXJhbWV0ZXJzOiBhbnksXG5cdG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUsXG5cdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlciB8IHVuZGVmaW5lZCxcblx0YU1lc3NhZ2VzOiBNZXNzYWdlW10sXG5cdGlzTXVsdGlDb250ZXh0NDEyPzogYm9vbGVhbixcblx0cmVzb2x2ZT86IGFueSxcblx0c0dyb3VwSWQ/OiBzdHJpbmdcbikge1xuXHRjb25zdCBzQWN0aW9uTmFtZSA9IG1QYXJhbWV0ZXJzLmxhYmVsO1xuXHRjb25zdCBvTW9kZWwgPSBtUGFyYW1ldGVycy5tb2RlbCxcblx0XHRzQ2FuY2VsQnV0dG9uVHh0ID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJDX0NPTU1PTl9ESUFMT0dfU0tJUFwiLCBvUmVzb3VyY2VCdW5kbGUpO1xuXHRjb25zdCBzdHJpY3RIYW5kbGluZ1Byb21pc2VzID0gbVBhcmFtZXRlcnM/LmludGVybmFsTW9kZWxDb250ZXh0Py5nZXRQcm9wZXJ0eShcInN0cmljdEhhbmRsaW5nUHJvbWlzZXNcIik7XG5cdGxldCBzTWVzc2FnZTogc3RyaW5nO1xuXHRpZiAoYU1lc3NhZ2VzLmxlbmd0aCA9PT0gMSkge1xuXHRcdGNvbnN0IG1lc3NhZ2VUZXh0ID0gYU1lc3NhZ2VzWzBdLmdldE1lc3NhZ2UoKTtcblx0XHRjb25zdCBpZGVudGlmaWVyVGV4dCA9IGFNZXNzYWdlc1swXS5nZXRBZGRpdGlvbmFsVGV4dCgpO1xuXHRcdGlmICghaXNNdWx0aUNvbnRleHQ0MTIpIHtcblx0XHRcdHNNZXNzYWdlID0gYCR7bWVzc2FnZVRleHR9XFxuJHtDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIlBST0NFRURcIiwgb1Jlc291cmNlQnVuZGxlKX1gO1xuXHRcdH0gZWxzZSBpZiAoaWRlbnRpZmllclRleHQgIT09IHVuZGVmaW5lZCAmJiBpZGVudGlmaWVyVGV4dCAhPT0gXCJcIikge1xuXHRcdFx0Y29uc3Qgc0hlYWRlckluZm9UeXBlTmFtZSA9IG1QYXJhbWV0ZXJzLmNvbnRyb2wuZ2V0UGFyZW50KCkuZ2V0VGFibGVEZWZpbml0aW9uKCkuaGVhZGVySW5mb1R5cGVOYW1lO1xuXHRcdFx0aWYgKHNIZWFkZXJJbmZvVHlwZU5hbWUpIHtcblx0XHRcdFx0c01lc3NhZ2UgPSBgJHtzSGVhZGVySW5mb1R5cGVOYW1lfSAke2lkZW50aWZpZXJUZXh0fTogJHttZXNzYWdlVGV4dH1cXG5cXG4ke0NvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFwiQ19DT01NT05fRElBTE9HX1NLSVBfU0lOR0xFX01FU1NBR0VfVEVYVFwiLFxuXHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZVxuXHRcdFx0XHQpfWA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzTWVzc2FnZSA9IGAke2lkZW50aWZpZXJUZXh0fTogJHttZXNzYWdlVGV4dH1cXG5cXG4ke0NvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFxuXHRcdFx0XHRcdFwiQ19DT01NT05fRElBTE9HX1NLSVBfU0lOR0xFX01FU1NBR0VfVEVYVFwiLFxuXHRcdFx0XHRcdG9SZXNvdXJjZUJ1bmRsZVxuXHRcdFx0XHQpfWA7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNNZXNzYWdlID0gYCR7bWVzc2FnZVRleHR9XFxuXFxuJHtDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09NTU9OX0RJQUxPR19TS0lQX1NJTkdMRV9NRVNTQUdFX1RFWFRcIiwgb1Jlc291cmNlQnVuZGxlKX1gO1xuXHRcdH1cblx0XHRNZXNzYWdlQm94Lndhcm5pbmcoc01lc3NhZ2UsIHtcblx0XHRcdHRpdGxlOiBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIldBUk5JTkdcIiwgb1Jlc291cmNlQnVuZGxlKSxcblx0XHRcdGFjdGlvbnM6IFtzQWN0aW9uTmFtZSwgc0NhbmNlbEJ1dHRvblR4dF0sXG5cdFx0XHRlbXBoYXNpemVkQWN0aW9uOiBzQWN0aW9uTmFtZSxcblx0XHRcdG9uQ2xvc2U6IGZ1bmN0aW9uIChzQWN0aW9uOiBzdHJpbmcpIHtcblx0XHRcdFx0aWYgKHNBY3Rpb24gPT09IHNBY3Rpb25OYW1lKSB7XG5cdFx0XHRcdFx0aWYgKCFpc011bHRpQ29udGV4dDQxMikge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZSh0cnVlKTtcblx0XHRcdFx0XHRcdG9Nb2RlbC5zdWJtaXRCYXRjaChzR3JvdXBJZCk7XG5cdFx0XHRcdFx0XHRpZiAobVBhcmFtZXRlcnMucmVxdWVzdFNpZGVFZmZlY3RzKSB7XG5cdFx0XHRcdFx0XHRcdG1QYXJhbWV0ZXJzLnJlcXVlc3RTaWRlRWZmZWN0cygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRzdHJpY3RIYW5kbGluZ1Byb21pc2VzLmZvckVhY2goZnVuY3Rpb24gKHNIUHJvbWlzZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHNIUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHRcdFx0XHRcdFx0XHRvTW9kZWwuc3VibWl0QmF0Y2goc0hQcm9taXNlLmdyb3VwSWQpO1xuXHRcdFx0XHRcdFx0XHRpZiAoc0hQcm9taXNlLnJlcXVlc3RTaWRlRWZmZWN0cykge1xuXHRcdFx0XHRcdFx0XHRcdHNIUHJvbWlzZS5yZXF1ZXN0U2lkZUVmZmVjdHMoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRjb25zdCBzdHJpY3RIYW5kbGluZ0ZhaWxzID0gbVBhcmFtZXRlcnM/LmludGVybmFsTW9kZWxDb250ZXh0Py5nZXRQcm9wZXJ0eShcInN0cmljdEhhbmRsaW5nRmFpbHNcIik7XG5cdFx0XHRcdFx0XHRpZiAoc3RyaWN0SGFuZGxpbmdGYWlscy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2VIYW5kbGVyPy5yZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnM/LmludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcIjQxMkV4ZWN1dGVkXCIsIHRydWUpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzPy5pbnRlcm5hbE1vZGVsQ29udGV4dD8uc2V0UHJvcGVydHkoXCI0MTJFeGVjdXRlZFwiLCBmYWxzZSk7XG5cdFx0XHRcdFx0aWYgKCFpc011bHRpQ29udGV4dDQxMikge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShmYWxzZSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nUHJvbWlzZXMuZm9yRWFjaChmdW5jdGlvbiAoc0hQcm9taXNlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0c0hQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdG1QYXJhbWV0ZXJzPy5pbnRlcm5hbE1vZGVsQ29udGV4dD8uc2V0UHJvcGVydHkoXCI0MTJNZXNzYWdlc1wiLCBbXSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0gZWxzZSBpZiAoYU1lc3NhZ2VzLmxlbmd0aCA+IDEpIHtcblx0XHRpZiAoaXNNdWx0aUNvbnRleHQ0MTIpIHtcblx0XHRcdGNvbnN0IGdlbmVyaWNNZXNzYWdlID0gbmV3IE1lc3NhZ2Uoe1xuXHRcdFx0XHRtZXNzYWdlOiBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09NTU9OX0RJQUxPR19TS0lQX01FU1NBR0VTX1dBUk5JTkdcIiwgb1Jlc291cmNlQnVuZGxlKSxcblx0XHRcdFx0dHlwZTogTWVzc2FnZVR5cGUuV2FybmluZyxcblx0XHRcdFx0dGFyZ2V0OiB1bmRlZmluZWQsXG5cdFx0XHRcdHBlcnNpc3RlbnQ6IHRydWUsXG5cdFx0XHRcdGRlc2NyaXB0aW9uOiBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIkNfQ09NTU9OX0RJQUxPR19TS0lQX01FU1NBR0VTX1RFWFRcIiwgb1Jlc291cmNlQnVuZGxlLCBzQWN0aW9uTmFtZSlcblx0XHRcdH0pO1xuXHRcdFx0YU1lc3NhZ2VzID0gW2dlbmVyaWNNZXNzYWdlXS5jb25jYXQoYU1lc3NhZ2VzKTtcblx0XHR9XG5cdFx0Y29uc3Qgb01lc3NhZ2VEaWFsb2dNb2RlbCA9IG5ldyBKU09OTW9kZWwoKTtcblx0XHRvTWVzc2FnZURpYWxvZ01vZGVsLnNldERhdGEoYU1lc3NhZ2VzKTtcblx0XHRjb25zdCBiU3RyaWN0SGFuZGxpbmdGbG93ID0gdHJ1ZTtcblx0XHRjb25zdCBvTWVzc2FnZU9iamVjdCA9IG1lc3NhZ2VIYW5kbGluZy5wcmVwYXJlTWVzc2FnZVZpZXdGb3JEaWFsb2cob01lc3NhZ2VEaWFsb2dNb2RlbCwgYlN0cmljdEhhbmRsaW5nRmxvdywgaXNNdWx0aUNvbnRleHQ0MTIpO1xuXHRcdGNvbnN0IG9EaWFsb2cgPSBuZXcgRGlhbG9nKHtcblx0XHRcdHJlc2l6YWJsZTogdHJ1ZSxcblx0XHRcdGNvbnRlbnQ6IG9NZXNzYWdlT2JqZWN0Lm9NZXNzYWdlVmlldyxcblx0XHRcdHN0YXRlOiBcIldhcm5pbmdcIixcblx0XHRcdGN1c3RvbUhlYWRlcjogbmV3IEJhcih7XG5cdFx0XHRcdGNvbnRlbnRMZWZ0OiBbb01lc3NhZ2VPYmplY3Qub0JhY2tCdXR0b25dLFxuXHRcdFx0XHRjb250ZW50TWlkZGxlOiBbbmV3IFRpdGxlKHsgdGV4dDogXCJXYXJuaW5nXCIgfSldXG5cdFx0XHR9KSxcblx0XHRcdGNvbnRlbnRIZWlnaHQ6IFwiNTAlXCIsXG5cdFx0XHRjb250ZW50V2lkdGg6IFwiNTAlXCIsXG5cdFx0XHR2ZXJ0aWNhbFNjcm9sbGluZzogZmFsc2Vcblx0XHR9KTtcblx0XHRvRGlhbG9nLnNldEJlZ2luQnV0dG9uKFxuXHRcdFx0bmV3IEJ1dHRvbih7XG5cdFx0XHRcdHByZXNzOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0aWYgKCFpc011bHRpQ29udGV4dDQxMikge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZSh0cnVlKTtcblx0XHRcdFx0XHRcdG9Nb2RlbC5zdWJtaXRCYXRjaChzR3JvdXBJZCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHN0cmljdEhhbmRsaW5nUHJvbWlzZXMuZm9yRWFjaChmdW5jdGlvbiAoc0hQcm9taXNlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0c0hQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdG9Nb2RlbC5zdWJtaXRCYXRjaChzSFByb21pc2UuZ3JvdXBJZCk7XG5cdFx0XHRcdFx0XHRcdGlmIChzSFByb21pc2UucmVxdWVzdFNpZGVFZmZlY3RzKSB7XG5cdFx0XHRcdFx0XHRcdFx0c0hQcm9taXNlLnJlcXVlc3RTaWRlRWZmZWN0cygpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvbnN0IHN0cmljdEhhbmRsaW5nRmFpbHMgPSBtUGFyYW1ldGVycz8uaW50ZXJuYWxNb2RlbENvbnRleHQ/LmdldFByb3BlcnR5KFwic3RyaWN0SGFuZGxpbmdGYWlsc1wiKTtcblx0XHRcdFx0XHRcdGlmIChzdHJpY3RIYW5kbGluZ0ZhaWxzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0bWVzc2FnZUhhbmRsZXI/LnJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcygpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0bVBhcmFtZXRlcnM/LmludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcIjQxMk1lc3NhZ2VzXCIsIFtdKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnM/LmludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcIjQxMkV4ZWN1dGVkXCIsIHRydWUpO1xuXHRcdFx0XHRcdG9NZXNzYWdlRGlhbG9nTW9kZWwuc2V0RGF0YSh7fSk7XG5cdFx0XHRcdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0eXBlOiBcIkVtcGhhc2l6ZWRcIixcblx0XHRcdFx0dGV4dDogc0FjdGlvbk5hbWVcblx0XHRcdH0pXG5cdFx0KTtcblx0XHRvRGlhbG9nLnNldEVuZEJ1dHRvbihcblx0XHRcdG5ldyBCdXR0b24oe1xuXHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdG1QYXJhbWV0ZXJzPy5pbnRlcm5hbE1vZGVsQ29udGV4dD8uc2V0UHJvcGVydHkoXCI0MTJNZXNzYWdlc1wiLCBbXSk7XG5cdFx0XHRcdFx0bVBhcmFtZXRlcnM/LmludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcIjQxMkV4ZWN1dGVkXCIsIGZhbHNlKTtcblx0XHRcdFx0XHRpZiAoIWlzTXVsdGlDb250ZXh0NDEyKSB7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKGZhbHNlKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlcy5mb3JFYWNoKGZ1bmN0aW9uIChzSFByb21pc2U6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRzSFByb21pc2UucmVzb2x2ZShmYWxzZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0b01lc3NhZ2VEaWFsb2dNb2RlbC5zZXREYXRhKHt9KTtcblx0XHRcdFx0XHRvRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHRcdH0sXG5cdFx0XHRcdHRleHQ6IHNDYW5jZWxCdXR0b25UeHRcblx0XHRcdH0pXG5cdFx0KTtcblx0XHRvRGlhbG9nLm9wZW4oKTtcblx0fVxufVxuXG5mdW5jdGlvbiBmbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWQoXG5cdHNHcm91cElkOiBzdHJpbmcsXG5cdG1QYXJhbWV0ZXJzOiBhbnksXG5cdG9SZXNvdXJjZUJ1bmRsZTogUmVzb3VyY2VCdW5kbGUsXG5cdGN1cnJlbnRfY29udGV4dF9pbmRleDogbnVtYmVyIHwgbnVsbCxcblx0b0NvbnRleHQ6IGFueSxcblx0aUNvbnRleHRMZW5ndGg6IG51bWJlciB8IG51bGwsXG5cdG1lc3NhZ2VIYW5kbGVyOiBNZXNzYWdlSGFuZGxlciB8IHVuZGVmaW5lZCxcblx0YTQxMk1lc3NhZ2VzOiBNZXNzYWdlW11cbikge1xuXHRpZiAoKGN1cnJlbnRfY29udGV4dF9pbmRleCA9PT0gbnVsbCAmJiBpQ29udGV4dExlbmd0aCA9PT0gbnVsbCkgfHwgKGN1cnJlbnRfY29udGV4dF9pbmRleCA9PT0gMSAmJiBpQ29udGV4dExlbmd0aCA9PT0gMSkpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcblx0XHRcdG9wZXJhdGlvbnNIZWxwZXIucmVuZGVyTWVzc2FnZVZpZXcobVBhcmFtZXRlcnMsIG9SZXNvdXJjZUJ1bmRsZSwgbWVzc2FnZUhhbmRsZXIsIGE0MTJNZXNzYWdlcywgZmFsc2UsIHJlc29sdmUsIHNHcm91cElkKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRjb25zdCBzQWN0aW9uTmFtZSA9IG1QYXJhbWV0ZXJzLmxhYmVsO1xuXHRcdGNvbnN0IGE0MTJUcmFuc2l0aW9uTWVzc2FnZXM6IE1lc3NhZ2VbXSA9IG1QYXJhbWV0ZXJzPy5pbnRlcm5hbE1vZGVsQ29udGV4dD8uZ2V0UHJvcGVydHkoXCI0MTJNZXNzYWdlc1wiKTtcblx0XHRsZXQgc1ZhbHVlOiBzdHJpbmcgPSBcIlwiO1xuXHRcdC8vIElmIHRoZXJlIGlzIG1vcmUgdGhhbiBvbmUgY29udGV4dCB3ZSBuZWVkIHRoZSBpZGVudGlmaWVyLiBUaGlzIHdvdWxkIGZpeCBpZiB0aGUgYWN0aW9uIGlzIHRyaWdnZXJlZCB2aWEgdGFibGUgY2hldnJvblxuXHRcdGlmIChpQ29udGV4dExlbmd0aCAmJiBpQ29udGV4dExlbmd0aCA+IDEpIHtcblx0XHRcdGNvbnN0IG9UYWJsZSA9IG1QYXJhbWV0ZXJzLmNvbnRyb2w/LmdldFBhcmVudCgpO1xuXHRcdFx0Y29uc3Qgc0NvbHVtbiA9ICBvVGFibGUuaXNBKFwic2FwLmZlLm1hY3Jvcy50YWJsZS5UYWJsZUFQSVwiKSAmJiBvVGFibGU/LmdldElkZW50aWZpZXJDb2x1bW4oKTtcblx0XHRcdGlmIChzQ29sdW1uKSB7XG5cdFx0XHRcdHNWYWx1ZSA9IG9Db250ZXh0ICYmIG9Db250ZXh0LmdldE9iamVjdChzQ29sdW1uKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0YTQxMk1lc3NhZ2VzLmZvckVhY2goZnVuY3Rpb24gKG1zZzogTWVzc2FnZSkge1xuXHRcdFx0bXNnLnNldFR5cGUoXCJXYXJuaW5nXCIpO1xuXHRcdFx0bXNnLnNldEFkZGl0aW9uYWxUZXh0KHNWYWx1ZSk7XG5cdFx0XHRhNDEyVHJhbnNpdGlvbk1lc3NhZ2VzLnB1c2gobXNnKTtcblx0XHR9KTtcblx0XHRpZiAobVBhcmFtZXRlcnMuZGlhbG9nICYmIG1QYXJhbWV0ZXJzLmRpYWxvZy5pc09wZW4oKSkge1xuXHRcdFx0bVBhcmFtZXRlcnMuZGlhbG9nLmNsb3NlKCk7XG5cdFx0fVxuXHRcdGNvbnN0IHN0cmljdEhhbmRsaW5nUHJvbWlzZXMgPSBtUGFyYW1ldGVycz8uaW50ZXJuYWxNb2RlbENvbnRleHQ/LmdldFByb3BlcnR5KFwic3RyaWN0SGFuZGxpbmdQcm9taXNlc1wiKTtcblx0XHRjb25zdCBzdHJpY3RIYW5kbGluZ1Byb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSkge1xuXHRcdFx0c3RyaWN0SGFuZGxpbmdQcm9taXNlcy5wdXNoKHtcblx0XHRcdFx0Z3JvdXBJZDogc0dyb3VwSWQsXG5cdFx0XHRcdHJlc29sdmU6IHJlc29sdmUsXG5cdFx0XHRcdGFjdGlvbk5hbWU6IHNBY3Rpb25OYW1lLFxuXHRcdFx0XHRtb2RlbDogbVBhcmFtZXRlcnMubW9kZWwsXG5cdFx0XHRcdHZhbHVlOiBzVmFsdWUsXG5cdFx0XHRcdHJlcXVlc3RTaWRlRWZmZWN0czogbVBhcmFtZXRlcnMucmVxdWVzdFNpZGVFZmZlY3RzXG5cdFx0XHR9KTtcblx0XHR9KTtcblx0XHRtUGFyYW1ldGVycz8uaW50ZXJuYWxNb2RlbENvbnRleHQ/LnNldFByb3BlcnR5KFwiNDEyTWVzc2FnZXNcIiwgYTQxMlRyYW5zaXRpb25NZXNzYWdlcyk7XG5cdFx0bVBhcmFtZXRlcnM/LmludGVybmFsTW9kZWxDb250ZXh0Py5zZXRQcm9wZXJ0eShcInN0cmljdEhhbmRsaW5nUHJvbWlzZXNcIiwgc3RyaWN0SGFuZGxpbmdQcm9taXNlcyk7XG5cblx0XHRpZiAoXG5cdFx0XHRjdXJyZW50X2NvbnRleHRfaW5kZXggPT09IGlDb250ZXh0TGVuZ3RoIHx8XG5cdFx0XHQoY3VycmVudF9jb250ZXh0X2luZGV4ID09PSBudWxsICYmIGlDb250ZXh0TGVuZ3RoICE9PSBudWxsICYmIGlDb250ZXh0TGVuZ3RoID49IDEpXG5cdFx0KSB7XG5cdFx0XHQvLyBjdXJyZW50X2NvbnRleHRfaW5kZXggaXMgc2V0IHRvIG51bGwgKGZvciBjaGFuZ2VzZXQpIGlmIHRoZXJlIG5vIGNvbnRleHQgaXMgc2VsZWN0ZWQgb3IgaWYgYSBzaW5nbGUgY29udGV4dCBpcyBzZWxlY3RlZFxuXHRcdFx0Ly8gdGhpcyBjaGVjayBpcyBub3QgcmVxdWlyZWQgaW4gdmVyc2lvbnMgMS4xMTQuMCBhbmQgb3ZlciBiZWNhdXNlIHN0cmljdCBoYW5kbGluZyBpcyByZWZhY3RvcmVkXG5cdFx0XHRvcGVyYXRpb25zSGVscGVyLnJlbmRlck1lc3NhZ2VWaWV3KFxuXHRcdFx0XHRtUGFyYW1ldGVycyxcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRtZXNzYWdlSGFuZGxlcixcblx0XHRcdFx0bVBhcmFtZXRlcnM/LmludGVybmFsTW9kZWxDb250ZXh0Py5nZXRQcm9wZXJ0eShcIjQxMk1lc3NhZ2VzXCIpLFxuXHRcdFx0XHR0cnVlXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gc3RyaWN0SGFuZGxpbmdQcm9taXNlO1xuXHR9XG59XG5cbmNvbnN0IG9wZXJhdGlvbnNIZWxwZXIgPSB7XG5cdHJlbmRlck1lc3NhZ2VWaWV3OiByZW5kZXJNZXNzYWdlVmlldyxcblx0Zm5PblN0cmljdEhhbmRsaW5nRmFpbGVkOiBmbk9uU3RyaWN0SGFuZGxpbmdGYWlsZWRcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG9wZXJhdGlvbnNIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBYUEsU0FBU0EsaUJBQWlCLENBQ3pCQyxXQUFnQixFQUNoQkMsZUFBK0IsRUFDL0JDLGNBQTBDLEVBQzFDQyxTQUFvQixFQUNwQkMsaUJBQTJCLEVBQzNCQyxPQUFhLEVBQ2JDLFFBQWlCLEVBQ2hCO0lBQUE7SUFDRCxJQUFNQyxXQUFXLEdBQUdQLFdBQVcsQ0FBQ1EsS0FBSztJQUNyQyxJQUFNQyxNQUFNLEdBQUdULFdBQVcsQ0FBQ1UsS0FBSztNQUMvQkMsZ0JBQWdCLEdBQUdDLFdBQVcsQ0FBQ0MsaUJBQWlCLENBQUMsc0JBQXNCLEVBQUVaLGVBQWUsQ0FBQztJQUMxRixJQUFNYSxzQkFBc0IsR0FBR2QsV0FBVyxhQUFYQSxXQUFXLGdEQUFYQSxXQUFXLENBQUVlLG9CQUFvQiwwREFBakMsc0JBQW1DQyxXQUFXLENBQUMsd0JBQXdCLENBQUM7SUFD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