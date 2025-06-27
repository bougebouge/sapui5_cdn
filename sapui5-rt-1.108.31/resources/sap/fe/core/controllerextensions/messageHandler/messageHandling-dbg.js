/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Bar", "sap/m/Button", "sap/m/Dialog", "sap/m/FormattedText", "sap/m/MessageBox", "sap/m/MessageItem", "sap/m/MessageToast", "sap/m/MessageView", "sap/m/Text", "sap/ui/core/Core", "sap/ui/core/format/DateFormat", "sap/ui/core/IconPool", "sap/ui/core/library", "sap/ui/core/message/Message", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/json/JSONModel"], function (Bar, Button, Dialog, FormattedText, MessageBox, MessageItem, MessageToast, MessageView, Text, Core, DateFormat, IconPool, CoreLib, Message, Filter, FilterOperator, JSONModel) {
  "use strict";

  var MessageType = CoreLib.MessageType;
  var aMessageList = [];
  var aMessageDataList = [];
  var aResolveFunctions = [];
  var oDialog;
  var oBackButton;
  var oMessageView;
  function fnFormatTechnicalDetails() {
    var sPreviousGroupName;

    // Insert technical detail if it exists
    function insertDetail(oProperty) {
      return oProperty.property ? "( ${" + oProperty.property + '} ? ("<p>' + oProperty.property.substr(Math.max(oProperty.property.lastIndexOf("/"), oProperty.property.lastIndexOf(".")) + 1) + ' : " + ' + "${" + oProperty.property + '} + "</p>") : "" )' : "";
    }
    // Insert groupname if it exists
    function insertGroupName(oProperty) {
      var sHTML = "";
      if (oProperty.groupName && oProperty.property && oProperty.groupName !== sPreviousGroupName) {
        sHTML += "( ${" + oProperty.property + '} ? "<br><h3>' + oProperty.groupName + '</h3>" : "" ) + ';
        sPreviousGroupName = oProperty.groupName;
      }
      return sHTML;
    }

    // List of technical details to be shown
    function getPaths() {
      var sTD = "technicalDetails"; // name of property in message model data for technical details
      return [{
        "groupName": "",
        "property": "".concat(sTD, "/status")
      }, {
        "groupName": "",
        "property": "".concat(sTD, "/statusText")
      }, {
        "groupName": "Application",
        "property": "".concat(sTD, "/error/@SAP__common.Application/ComponentId")
      }, {
        "groupName": "Application",
        "property": "".concat(sTD, "/error/@SAP__common.Application/ServiceId")
      }, {
        "groupName": "Application",
        "property": "".concat(sTD, "/error/@SAP__common.Application/ServiceRepository")
      }, {
        "groupName": "Application",
        "property": "".concat(sTD, "/error/@SAP__common.Application/ServiceVersion")
      }, {
        "groupName": "ErrorResolution",
        "property": "".concat(sTD, "/error/@SAP__common.ErrorResolution/Analysis")
      }, {
        "groupName": "ErrorResolution",
        "property": "".concat(sTD, "/error/@SAP__common.ErrorResolution/Note")
      }, {
        "groupName": "ErrorResolution",
        "property": "".concat(sTD, "/error/@SAP__common.ErrorResolution/DetailedNote")
      }, {
        "groupName": "ErrorResolution",
        "property": "".concat(sTD, "/error/@SAP__common.ExceptionCategory")
      }, {
        "groupName": "ErrorResolution",
        "property": "".concat(sTD, "/error/@SAP__common.TimeStamp")
      }, {
        "groupName": "ErrorResolution",
        "property": "".concat(sTD, "/error/@SAP__common.TransactionId")
      }, {
        "groupName": "Messages",
        "property": "".concat(sTD, "/error/code")
      }, {
        "groupName": "Messages",
        "property": "".concat(sTD, "/error/message")
      }];
    }
    var sHTML = "Object.keys(" + "${technicalDetails}" + ').length > 0 ? "<h2>Technical Details</h2>" : "" ';
    getPaths().forEach(function (oProperty) {
      sHTML = "".concat(sHTML + insertGroupName(oProperty)).concat(insertDetail(oProperty), " + ");
    });
    return sHTML;
  }
  function fnFormatDescription() {
    return "(${" + 'description} ? ("<h2>Description</h2>" + ${' + 'description}) : "")';
  }
  /**
   * Calculates the highest priority message type(Error/Warning/Success/Information) from the available messages.
   *
   * @function
   * @name sap.fe.core.actions.messageHandling.fnGetHighestMessagePriority
   * @memberof sap.fe.core.actions.messageHandling
   * @param [aMessages] Messages list
   * @returns Highest priority message from the available messages
   * @private
   * @ui5-restricted
   */
  function fnGetHighestMessagePriority(aMessages) {
    var sMessagePriority = MessageType.None;
    var iLength = aMessages.length;
    var oMessageCount = {
      Error: 0,
      Warning: 0,
      Success: 0,
      Information: 0
    };
    for (var i = 0; i < iLength; i++) {
      ++oMessageCount[aMessages[i].getType()];
    }
    if (oMessageCount[MessageType.Error] > 0) {
      sMessagePriority = MessageType.Error;
    } else if (oMessageCount[MessageType.Warning] > 0) {
      sMessagePriority = MessageType.Warning;
    } else if (oMessageCount[MessageType.Success] > 0) {
      sMessagePriority = MessageType.Success;
    } else if (oMessageCount[MessageType.Information] > 0) {
      sMessagePriority = MessageType.Information;
    }
    return sMessagePriority;
  }
  // function which modify e-Tag messages only.
  // returns : true, if any e-Tag message is modified, otherwise false.
  function fnModifyETagMessagesOnly(oMessageManager, oResourceBundle, concurrentEditFlag) {
    var aMessages = oMessageManager.getMessageModel().getObject("/");
    var bMessagesModified = false;
    var sEtagMessage = "";
    aMessages.forEach(function (oMessage, i) {
      var oTechnicalDetails = oMessage.getTechnicalDetails && oMessage.getTechnicalDetails();
      if (oTechnicalDetails && oTechnicalDetails.httpStatus === 412) {
        if (oTechnicalDetails.isConcurrentModification && concurrentEditFlag) {
          sEtagMessage = sEtagMessage || oResourceBundle.getText("C_APP_COMPONENT_SAPFE_ETAG_TECHNICAL_ISSUES_CONCURRENT_MODIFICATION");
        } else {
          sEtagMessage = sEtagMessage || oResourceBundle.getText("C_APP_COMPONENT_SAPFE_ETAG_TECHNICAL_ISSUES");
        }
        oMessageManager.removeMessages(aMessages[i]);
        oMessage.setMessage(sEtagMessage);
        oMessage.target = "";
        oMessageManager.addMessages(oMessage);
        bMessagesModified = true;
      }
    });
    return bMessagesModified;
  }
  // Dialog close Handling
  function dialogCloseHandler() {
    oDialog.close();
    oBackButton.setVisible(false);
    aMessageList = [];
    var oMessageDialogModel = oMessageView.getModel();
    if (oMessageDialogModel) {
      oMessageDialogModel.setData({});
    }
    removeUnboundTransitionMessages();
  }
  function getRetryAfterMessage(oMessage, bMessageDialog) {
    var dNow = new Date();
    var oTechnicalDetails = oMessage.getTechnicalDetails();
    var oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    var sRetryAfterMessage;
    if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503 && oTechnicalDetails.retryAfter) {
      var dRetryAfter = oTechnicalDetails.retryAfter;
      var oDateFormat;
      if (dNow.getFullYear() !== dRetryAfter.getFullYear()) {
        //different years
        oDateFormat = DateFormat.getDateTimeInstance({
          pattern: "MMMM dd, yyyy 'at' hh:mm a"
        });
        sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR", [oDateFormat.format(dRetryAfter)]);
      } else if (dNow.getFullYear() == dRetryAfter.getFullYear()) {
        //same year
        if (bMessageDialog) {
          //less than 2 min
          sRetryAfterMessage = "".concat(oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_TITLE"), " ").concat(oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_DESC"));
        } else if (dNow.getMonth() !== dRetryAfter.getMonth() || dNow.getDate() !== dRetryAfter.getDate()) {
          oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "MMMM dd 'at' hh:mm a"
          }); //different months or different days of same month
          sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR", [oDateFormat.format(dRetryAfter)]);
        } else {
          //same day
          oDateFormat = DateFormat.getDateTimeInstance({
            pattern: "hh:mm a"
          });
          sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR_DAY", [oDateFormat.format(dRetryAfter)]);
        }
      }
    }
    if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503 && !oTechnicalDetails.retryAfter) {
      sRetryAfterMessage = oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_ERROR_NO_RETRY_AFTER");
    }
    return sRetryAfterMessage;
  }
  function prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow, multi412) {
    var oMessageTemplate;
    if (!bStrictHandlingFlow) {
      oMessageTemplate = new MessageItem(undefined, {
        counter: {
          path: "counter"
        },
        title: "{message}",
        subtitle: "{additionalText}",
        longtextUrl: "{descriptionUrl}",
        type: {
          path: "type"
        },
        description: "{= ${" + "description} || ${technicalDetails} ? " + '"<html><body>" + ' + fnFormatDescription() + " + " + fnFormatTechnicalDetails() + '"</body></html>"' + ' : "" }',
        markupDescription: true
      });
    } else if (multi412) {
      oMessageTemplate = new MessageItem(undefined, {
        counter: {
          path: "counter"
        },
        title: "{message}",
        subtitle: "{additionalText}",
        longtextUrl: "{descriptionUrl}",
        type: {
          path: "type"
        },
        description: "{description}",
        markupDescription: true
      });
    } else {
      oMessageTemplate = new MessageItem({
        title: "{message}",
        type: {
          path: "type"
        },
        longtextUrl: "{descriptionUrl}"
      });
    }
    oMessageView = new MessageView({
      showDetailsPageHeader: false,
      itemSelect: function () {
        oBackButton.setVisible(true);
      },
      items: {
        path: "/",
        template: oMessageTemplate
      }
    });
    oBackButton = oBackButton || new Button({
      icon: IconPool.getIconURI("nav-back"),
      visible: false,
      press: function () {
        oMessageView.navigateBack();
        this.setVisible(false);
      }
    });
    // Update proper ETag Mismatch error
    oMessageView.setModel(oMessageDialogModel);
    return {
      oMessageView: oMessageView,
      oBackButton: oBackButton
    };
  }
  function showUnboundMessages(aCustomMessages, oContext, bShowBoundTransition, concurrentEditFlag, bOnlyForTest, onBeforeShowMessage) {
    var aTransitionMessages = this.getMessages();
    var oMessageManager = Core.getMessageManager();
    var sHighestPriority;
    var sHighestPriorityText;
    var aFilters = [new Filter({
      path: "persistent",
      operator: FilterOperator.NE,
      value1: false
    })];
    var showMessageDialog = false,
      showMessageBox = false;
    if (bShowBoundTransition) {
      aTransitionMessages = aTransitionMessages.concat(getMessages(true, true));
      // we only want to show bound transition messages not bound state messages hence add a filter for the same
      aFilters.push(new Filter({
        path: "persistent",
        operator: FilterOperator.EQ,
        value1: true
      }));
      var fnCheckControlIdInDialog = function (aControlIds) {
        var index = Infinity,
          oControl = Core.byId(aControlIds[0]);
        var errorFieldControl = Core.byId(aControlIds[0]);
        while (oControl) {
          var fieldRankinDialog = oControl instanceof Dialog ? errorFieldControl.getParent().findElements(true).indexOf(errorFieldControl) : Infinity;
          if (oControl instanceof Dialog) {
            if (index > fieldRankinDialog) {
              index = fieldRankinDialog;
              // Set the focus to the dialog's control
              errorFieldControl.focus();
            }
            // messages with target inside sap.m.Dialog should not bring up the message dialog
            return false;
          }
          oControl = oControl.getParent();
        }
        return true;
      };
      aFilters.push(new Filter({
        path: "controlIds",
        test: fnCheckControlIdInDialog,
        caseSensitive: true
      }));
    } else {
      // only unbound messages have to be shown so add filter accordingly
      aFilters.push(new Filter({
        path: "target",
        operator: FilterOperator.EQ,
        value1: ""
      }));
    }
    if (aCustomMessages && aCustomMessages.length) {
      aCustomMessages.forEach(function (oMessage) {
        var messageCode = oMessage.code ? oMessage.code : "";
        oMessageManager.addMessages(new Message({
          message: oMessage.text,
          type: oMessage.type,
          target: "",
          persistent: true,
          code: messageCode
        }));
        //The target and persistent properties of the message are hardcoded as "" and true because the function deals with only unbound messages.
      });
    }

    var oMessageDialogModel = oMessageView && oMessageView.getModel() || new JSONModel();
    var bHasEtagMessage = this.modifyETagMessagesOnly(oMessageManager, Core.getLibraryResourceBundle("sap.fe.core"), concurrentEditFlag);
    if (aTransitionMessages.length === 1 && aTransitionMessages[0].getCode() === "503") {
      showMessageBox = true;
    } else if (aTransitionMessages.length !== 0) {
      showMessageDialog = true;
    }
    var showMessageParameters;
    var aModelDataArray = [];
    if (showMessageDialog || !showMessageBox && !onBeforeShowMessage) {
      var oListBinding = oMessageManager.getMessageModel().bindList("/", undefined, undefined, aFilters),
        aCurrentContexts = oListBinding.getCurrentContexts();
      if (aCurrentContexts && aCurrentContexts.length > 0) {
        showMessageDialog = true;
        // Don't show dialog incase there are no errors to show

        // if false, show messages in dialog
        // As fitering has already happened here hence
        // using the message model again for the message dialog view and then filtering on that binding again is unnecessary.
        // So we create new json model to use for the message dialog view.
        var aMessages = [];
        aCurrentContexts.forEach(function (currentContext) {
          var oMessage = currentContext.getObject();
          aMessages.push(oMessage);
          aMessageDataList = aMessages;
        });
        // if(aMessages.length === 0 && aMessageList.length) {
        // 	oMessageDialogModel.setData(aMessages);
        // }
        var existingMessages = [];
        if (Array.isArray(oMessageDialogModel.getData())) {
          existingMessages = oMessageDialogModel.getData();
        }
        var oUniqueObj = {};
        aModelDataArray = aMessageDataList.concat(existingMessages).filter(function (obj) {
          // remove entries having duplicate message ids
          return !oUniqueObj[obj.id] && (oUniqueObj[obj.id] = true);
        });
      }
    }
    if (onBeforeShowMessage) {
      showMessageParameters = {
        showMessageBox: showMessageBox,
        showMessageDialog: showMessageDialog
      };
      showMessageParameters = onBeforeShowMessage(aTransitionMessages, showMessageParameters);
      showMessageBox = showMessageParameters.showMessageBox;
      showMessageDialog = showMessageParameters.showMessageDialog;
      if (showMessageDialog) {
        aModelDataArray = showMessageParameters.filteredMessages ? showMessageParameters.filteredMessages : aModelDataArray;
      }
    }
    if (aTransitionMessages.length === 0 && !aCustomMessages && !bHasEtagMessage) {
      // Don't show the popup if there are no transient messages
      return Promise.resolve(true);
    } else if (aTransitionMessages.length === 1 && aTransitionMessages[0].getType() === MessageType.Success && !aCustomMessages) {
      return new Promise(function (resolve) {
        MessageToast.show(aTransitionMessages[0].message);
        if (oMessageDialogModel) {
          oMessageDialogModel.setData({});
        }
        oMessageManager.removeMessages(aTransitionMessages);
        resolve();
      });
    } else if (showMessageDialog) {
      oMessageDialogModel.setData(aModelDataArray); // set the messages here so that if any of them are filtered for APD, they are filtered here as well.
      aResolveFunctions = aResolveFunctions || [];
      return new Promise(function (resolve, reject) {
        aResolveFunctions.push(resolve);
        Core.getLibraryResourceBundle("sap.fe.core", true).then(function (oResourceBundle) {
          var bStrictHandlingFlow = false;
          if (showMessageParameters && showMessageParameters.fnGetMessageSubtitle) {
            oMessageDialogModel.getData().forEach(function (oMessage) {
              showMessageParameters.fnGetMessageSubtitle(oMessage);
            });
          }
          var oMessageObject = prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow);
          oDialog = oDialog && oDialog.isOpen() ? oDialog : new Dialog({
            resizable: true,
            endButton: new Button({
              press: function () {
                dialogCloseHandler();
                // also remove bound transition messages if we were showing them
                oMessageManager.removeMessages(aModelDataArray);
              },
              text: oResourceBundle.getText("C_COMMON_SAPFE_CLOSE")
            }),
            customHeader: new Bar({
              contentMiddle: [new Text({
                text: oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE")
              })],
              contentLeft: [oBackButton]
            }),
            contentWidth: "37.5em",
            contentHeight: "21.5em",
            verticalScrolling: false,
            afterClose: function () {
              for (var i = 0; i < aResolveFunctions.length; i++) {
                aResolveFunctions[i].call();
              }
              aResolveFunctions = [];
            }
          });
          oDialog.removeAllContent();
          oDialog.addContent(oMessageObject.oMessageView);
          if (bHasEtagMessage) {
            sap.ui.require(["sap/m/ButtonType"], function (ButtonType) {
              oDialog.setBeginButton(new Button({
                press: function () {
                  dialogCloseHandler();
                  if (oContext.hasPendingChanges()) {
                    oContext.getBinding().resetChanges();
                  }
                  oContext.refresh();
                },
                text: oResourceBundle.getText("C_COMMON_SAPFE_REFRESH"),
                type: ButtonType.Emphasized
              }));
            });
          } else {
            oDialog.destroyBeginButton();
          }
          sHighestPriority = fnGetHighestMessagePriority(oMessageView.getItems());
          sHighestPriorityText = getTranslatedTextForMessageDialog(sHighestPriority);
          oDialog.setState(sHighestPriority);
          oDialog.getCustomHeader().getContentMiddle()[0].setText(sHighestPriorityText);
          oMessageView.navigateBack();
          oDialog.open();
          if (bOnlyForTest) {
            resolve(oDialog);
          }
        }).catch(reject);
      });
    } else if (showMessageBox) {
      return new Promise(function (resolve) {
        var oMessage = aTransitionMessages[0];
        if (oMessage.technicalDetails && aMessageList.indexOf(oMessage.technicalDetails.originalMessage.message) === -1) {
          aMessageList.push(oMessage.technicalDetails.originalMessage.message);
          var formattedTextString = "<html><body>";
          var retryAfterMessage = getRetryAfterMessage(oMessage, true);
          if (retryAfterMessage) {
            formattedTextString = "<h6>".concat(retryAfterMessage, "</h6><br>");
          }
          if (showMessageParameters && showMessageParameters.fnGetMessageSubtitle) {
            showMessageParameters.fnGetMessageSubtitle(oMessage);
          }
          if (oMessage.getCode() !== "503" && oMessage.getAdditionalText() !== undefined) {
            formattedTextString = "".concat(formattedTextString + oMessage.getAdditionalText(), ": ").concat(oMessage.getMessage(), "</html></body>");
          } else {
            formattedTextString = "".concat(formattedTextString + oMessage.getMessage(), "</html></body>");
          }
          var formattedText = new FormattedText({
            htmlText: formattedTextString
          });
          MessageBox.error(formattedText, {
            onClose: function () {
              aMessageList = [];
              if (bShowBoundTransition) {
                removeBoundTransitionMessages();
              }
              removeUnboundTransitionMessages();
              resolve(true);
            }
          });
        }
      });
    } else {
      return Promise.resolve(true);
    }
  }
  function getTranslatedTextForMessageDialog(sHighestPriority) {
    var oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    switch (sHighestPriority) {
      case "Error":
        return oResourceBundle.getText("C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_TITLE_ERROR");
      case "Information":
        return oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_INFO");
      case "Success":
        return oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_SUCCESS");
      case "Warning":
        return oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_WARNING");
      default:
        return oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE");
    }
  }
  function removeUnboundTransitionMessages() {
    removeTransitionMessages(false);
  }
  function removeBoundTransitionMessages(sPathToBeRemoved) {
    removeTransitionMessages(true, sPathToBeRemoved);
  }
  function getMessagesFromMessageModel(oMessageModel, sPathToBeRemoved) {
    if (sPathToBeRemoved === undefined) {
      return oMessageModel.getObject("/");
    }
    var listBinding = oMessageModel.bindList("/");
    listBinding.filter(new Filter({
      path: "target",
      operator: FilterOperator.StartsWith,
      value1: sPathToBeRemoved
    }));
    return listBinding.getCurrentContexts().map(function (oContext) {
      return oContext.getObject();
    });
  }
  function getMessages() {
    var bBoundMessages = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
    var bTransitionOnly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var sPathToBeRemoved = arguments.length > 2 ? arguments[2] : undefined;
    var i;
    var oMessageManager = Core.getMessageManager(),
      oMessageModel = oMessageManager.getMessageModel(),
      oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
      aTransitionMessages = [];
    var aMessages = [];
    if (bBoundMessages && bTransitionOnly && sPathToBeRemoved) {
      aMessages = getMessagesFromMessageModel(oMessageModel, sPathToBeRemoved);
    } else {
      aMessages = oMessageModel.getObject("/");
    }
    for (i = 0; i < aMessages.length; i++) {
      if ((!bTransitionOnly || aMessages[i].persistent) && (bBoundMessages && aMessages[i].target !== "" || !bBoundMessages && (!aMessages[i].target || aMessages[i].target === ""))) {
        aTransitionMessages.push(aMessages[i]);
      }
    }
    for (i = 0; i < aTransitionMessages.length; i++) {
      if (aTransitionMessages[i].code === "503" && aTransitionMessages[i].message !== "" && aTransitionMessages[i].message.indexOf(oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_BACKEND_PREFIX")) === -1) {
        aTransitionMessages[i].message = "\n".concat(oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_BACKEND_PREFIX")).concat(aTransitionMessages[i].message);
      }
    }
    //Filtering messages again here to avoid showing pure technical messages raised by the model
    var backendMessages = [];
    for (i = 0; i < aTransitionMessages.length; i++) {
      if (aTransitionMessages[i].technicalDetails && (aTransitionMessages[i].technicalDetails.originalMessage !== undefined && aTransitionMessages[i].technicalDetails.originalMessage !== null || aTransitionMessages[i].technicalDetails.httpStatus !== undefined && aTransitionMessages[i].technicalDetails.httpStatus !== null) || aTransitionMessages[i].code) {
        backendMessages.push(aTransitionMessages[i]);
      }
    }
    return backendMessages;
  }
  function removeTransitionMessages(bBoundMessages, sPathToBeRemoved) {
    var aMessagesToBeDeleted = getMessages(bBoundMessages, true, sPathToBeRemoved);
    if (aMessagesToBeDeleted.length > 0) {
      Core.getMessageManager().removeMessages(aMessagesToBeDeleted);
    }
  }
  //TODO: This must be moved out of message handling
  function setMessageSubtitle(oTable, aContexts, message) {
    var subtitleColumn = oTable.getParent().getIdentifierColumn();
    var errorContext = aContexts.find(function (oContext) {
      return message.getTarget().indexOf(oContext.getPath()) !== -1;
    });
    message.additionalText = errorContext ? errorContext.getObject()[subtitleColumn] : undefined;
  }

  /**
   * Static functions for Fiori Message Handling
   *
   * @namespace
   * @alias sap.fe.core.actions.messageHandling
   * @private
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.56.0
   */
  var messageHandling = {
    getMessages: getMessages,
    showUnboundMessages: showUnboundMessages,
    removeUnboundTransitionMessages: removeUnboundTransitionMessages,
    removeBoundTransitionMessages: removeBoundTransitionMessages,
    modifyETagMessagesOnly: fnModifyETagMessagesOnly,
    getRetryAfterMessage: getRetryAfterMessage,
    prepareMessageViewForDialog: prepareMessageViewForDialog,
    setMessageSubtitle: setMessageSubtitle
  };
  return messageHandling;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlVHlwZSIsIkNvcmVMaWIiLCJhTWVzc2FnZUxpc3QiLCJhTWVzc2FnZURhdGFMaXN0IiwiYVJlc29sdmVGdW5jdGlvbnMiLCJvRGlhbG9nIiwib0JhY2tCdXR0b24iLCJvTWVzc2FnZVZpZXciLCJmbkZvcm1hdFRlY2huaWNhbERldGFpbHMiLCJzUHJldmlvdXNHcm91cE5hbWUiLCJpbnNlcnREZXRhaWwiLCJvUHJvcGVydHkiLCJwcm9wZXJ0eSIsInN1YnN0ciIsIk1hdGgiLCJtYXgiLCJsYXN0SW5kZXhPZiIsImluc2VydEdyb3VwTmFtZSIsInNIVE1MIiwiZ3JvdXBOYW1lIiwiZ2V0UGF0aHMiLCJzVEQiLCJmb3JFYWNoIiwiZm5Gb3JtYXREZXNjcmlwdGlvbiIsImZuR2V0SGlnaGVzdE1lc3NhZ2VQcmlvcml0eSIsImFNZXNzYWdlcyIsInNNZXNzYWdlUHJpb3JpdHkiLCJOb25lIiwiaUxlbmd0aCIsImxlbmd0aCIsIm9NZXNzYWdlQ291bnQiLCJFcnJvciIsIldhcm5pbmciLCJTdWNjZXNzIiwiSW5mb3JtYXRpb24iLCJpIiwiZ2V0VHlwZSIsImZuTW9kaWZ5RVRhZ01lc3NhZ2VzT25seSIsIm9NZXNzYWdlTWFuYWdlciIsIm9SZXNvdXJjZUJ1bmRsZSIsImNvbmN1cnJlbnRFZGl0RmxhZyIsImdldE1lc3NhZ2VNb2RlbCIsImdldE9iamVjdCIsImJNZXNzYWdlc01vZGlmaWVkIiwic0V0YWdNZXNzYWdlIiwib01lc3NhZ2UiLCJvVGVjaG5pY2FsRGV0YWlscyIsImdldFRlY2huaWNhbERldGFpbHMiLCJodHRwU3RhdHVzIiwiaXNDb25jdXJyZW50TW9kaWZpY2F0aW9uIiwiZ2V0VGV4dCIsInJlbW92ZU1lc3NhZ2VzIiwic2V0TWVzc2FnZSIsInRhcmdldCIsImFkZE1lc3NhZ2VzIiwiZGlhbG9nQ2xvc2VIYW5kbGVyIiwiY2xvc2UiLCJzZXRWaXNpYmxlIiwib01lc3NhZ2VEaWFsb2dNb2RlbCIsImdldE1vZGVsIiwic2V0RGF0YSIsInJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJnZXRSZXRyeUFmdGVyTWVzc2FnZSIsImJNZXNzYWdlRGlhbG9nIiwiZE5vdyIsIkRhdGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwic1JldHJ5QWZ0ZXJNZXNzYWdlIiwicmV0cnlBZnRlciIsImRSZXRyeUFmdGVyIiwib0RhdGVGb3JtYXQiLCJnZXRGdWxsWWVhciIsIkRhdGVGb3JtYXQiLCJnZXREYXRlVGltZUluc3RhbmNlIiwicGF0dGVybiIsImZvcm1hdCIsImdldE1vbnRoIiwiZ2V0RGF0ZSIsInByZXBhcmVNZXNzYWdlVmlld0ZvckRpYWxvZyIsImJTdHJpY3RIYW5kbGluZ0Zsb3ciLCJtdWx0aTQxMiIsIm9NZXNzYWdlVGVtcGxhdGUiLCJNZXNzYWdlSXRlbSIsInVuZGVmaW5lZCIsImNvdW50ZXIiLCJwYXRoIiwidGl0bGUiLCJzdWJ0aXRsZSIsImxvbmd0ZXh0VXJsIiwidHlwZSIsImRlc2NyaXB0aW9uIiwibWFya3VwRGVzY3JpcHRpb24iLCJNZXNzYWdlVmlldyIsInNob3dEZXRhaWxzUGFnZUhlYWRlciIsIml0ZW1TZWxlY3QiLCJpdGVtcyIsInRlbXBsYXRlIiwiQnV0dG9uIiwiaWNvbiIsIkljb25Qb29sIiwiZ2V0SWNvblVSSSIsInZpc2libGUiLCJwcmVzcyIsIm5hdmlnYXRlQmFjayIsInNldE1vZGVsIiwic2hvd1VuYm91bmRNZXNzYWdlcyIsImFDdXN0b21NZXNzYWdlcyIsIm9Db250ZXh0IiwiYlNob3dCb3VuZFRyYW5zaXRpb24iLCJiT25seUZvclRlc3QiLCJvbkJlZm9yZVNob3dNZXNzYWdlIiwiYVRyYW5zaXRpb25NZXNzYWdlcyIsImdldE1lc3NhZ2VzIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJzSGlnaGVzdFByaW9yaXR5Iiwic0hpZ2hlc3RQcmlvcml0eVRleHQiLCJhRmlsdGVycyIsIkZpbHRlciIsIm9wZXJhdG9yIiwiRmlsdGVyT3BlcmF0b3IiLCJORSIsInZhbHVlMSIsInNob3dNZXNzYWdlRGlhbG9nIiwic2hvd01lc3NhZ2VCb3giLCJjb25jYXQiLCJwdXNoIiwiRVEiLCJmbkNoZWNrQ29udHJvbElkSW5EaWFsb2ciLCJhQ29udHJvbElkcyIsImluZGV4IiwiSW5maW5pdHkiLCJvQ29udHJvbCIsImJ5SWQiLCJlcnJvckZpZWxkQ29udHJvbCIsImZpZWxkUmFua2luRGlhbG9nIiwiRGlhbG9nIiwiZ2V0UGFyZW50IiwiZmluZEVsZW1lbnRzIiwiaW5kZXhPZiIsImZvY3VzIiwidGVzdCIsImNhc2VTZW5zaXRpdmUiLCJtZXNzYWdlQ29kZSIsImNvZGUiLCJNZXNzYWdlIiwibWVzc2FnZSIsInRleHQiLCJwZXJzaXN0ZW50IiwiSlNPTk1vZGVsIiwiYkhhc0V0YWdNZXNzYWdlIiwibW9kaWZ5RVRhZ01lc3NhZ2VzT25seSIsImdldENvZGUiLCJzaG93TWVzc2FnZVBhcmFtZXRlcnMiLCJhTW9kZWxEYXRhQXJyYXkiLCJvTGlzdEJpbmRpbmciLCJiaW5kTGlzdCIsImFDdXJyZW50Q29udGV4dHMiLCJnZXRDdXJyZW50Q29udGV4dHMiLCJjdXJyZW50Q29udGV4dCIsImV4aXN0aW5nTWVzc2FnZXMiLCJBcnJheSIsImlzQXJyYXkiLCJnZXREYXRhIiwib1VuaXF1ZU9iaiIsImZpbHRlciIsIm9iaiIsImlkIiwiZmlsdGVyZWRNZXNzYWdlcyIsIlByb21pc2UiLCJyZXNvbHZlIiwiTWVzc2FnZVRvYXN0Iiwic2hvdyIsInJlamVjdCIsInRoZW4iLCJmbkdldE1lc3NhZ2VTdWJ0aXRsZSIsIm9NZXNzYWdlT2JqZWN0IiwiaXNPcGVuIiwicmVzaXphYmxlIiwiZW5kQnV0dG9uIiwiY3VzdG9tSGVhZGVyIiwiQmFyIiwiY29udGVudE1pZGRsZSIsIlRleHQiLCJjb250ZW50TGVmdCIsImNvbnRlbnRXaWR0aCIsImNvbnRlbnRIZWlnaHQiLCJ2ZXJ0aWNhbFNjcm9sbGluZyIsImFmdGVyQ2xvc2UiLCJjYWxsIiwicmVtb3ZlQWxsQ29udGVudCIsImFkZENvbnRlbnQiLCJzYXAiLCJ1aSIsInJlcXVpcmUiLCJCdXR0b25UeXBlIiwic2V0QmVnaW5CdXR0b24iLCJoYXNQZW5kaW5nQ2hhbmdlcyIsImdldEJpbmRpbmciLCJyZXNldENoYW5nZXMiLCJyZWZyZXNoIiwiRW1waGFzaXplZCIsImRlc3Ryb3lCZWdpbkJ1dHRvbiIsImdldEl0ZW1zIiwiZ2V0VHJhbnNsYXRlZFRleHRGb3JNZXNzYWdlRGlhbG9nIiwic2V0U3RhdGUiLCJnZXRDdXN0b21IZWFkZXIiLCJnZXRDb250ZW50TWlkZGxlIiwic2V0VGV4dCIsIm9wZW4iLCJjYXRjaCIsInRlY2huaWNhbERldGFpbHMiLCJvcmlnaW5hbE1lc3NhZ2UiLCJmb3JtYXR0ZWRUZXh0U3RyaW5nIiwicmV0cnlBZnRlck1lc3NhZ2UiLCJnZXRBZGRpdGlvbmFsVGV4dCIsImdldE1lc3NhZ2UiLCJmb3JtYXR0ZWRUZXh0IiwiRm9ybWF0dGVkVGV4dCIsImh0bWxUZXh0IiwiTWVzc2FnZUJveCIsImVycm9yIiwib25DbG9zZSIsInJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwicmVtb3ZlVHJhbnNpdGlvbk1lc3NhZ2VzIiwic1BhdGhUb0JlUmVtb3ZlZCIsImdldE1lc3NhZ2VzRnJvbU1lc3NhZ2VNb2RlbCIsIm9NZXNzYWdlTW9kZWwiLCJsaXN0QmluZGluZyIsIlN0YXJ0c1dpdGgiLCJtYXAiLCJiQm91bmRNZXNzYWdlcyIsImJUcmFuc2l0aW9uT25seSIsImJhY2tlbmRNZXNzYWdlcyIsImFNZXNzYWdlc1RvQmVEZWxldGVkIiwic2V0TWVzc2FnZVN1YnRpdGxlIiwib1RhYmxlIiwiYUNvbnRleHRzIiwic3VidGl0bGVDb2x1bW4iLCJnZXRJZGVudGlmaWVyQ29sdW1uIiwiZXJyb3JDb250ZXh0IiwiZmluZCIsImdldFRhcmdldCIsImdldFBhdGgiLCJhZGRpdGlvbmFsVGV4dCIsIm1lc3NhZ2VIYW5kbGluZyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsibWVzc2FnZUhhbmRsaW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBCYXIgZnJvbSBcInNhcC9tL0JhclwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBGb3JtYXR0ZWRUZXh0IGZyb20gXCJzYXAvbS9Gb3JtYXR0ZWRUZXh0XCI7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tIFwic2FwL20vTWVzc2FnZUJveFwiO1xuaW1wb3J0IE1lc3NhZ2VJdGVtIGZyb20gXCJzYXAvbS9NZXNzYWdlSXRlbVwiO1xuaW1wb3J0IE1lc3NhZ2VUb2FzdCBmcm9tIFwic2FwL20vTWVzc2FnZVRvYXN0XCI7XG5pbXBvcnQgTWVzc2FnZVZpZXcgZnJvbSBcInNhcC9tL01lc3NhZ2VWaWV3XCI7XG5pbXBvcnQgVGV4dCBmcm9tIFwic2FwL20vVGV4dFwiO1xuaW1wb3J0IHR5cGUgTWFuYWdlZE9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBEYXRlRm9ybWF0IGZyb20gXCJzYXAvdWkvY29yZS9mb3JtYXQvRGF0ZUZvcm1hdFwiO1xuaW1wb3J0IEljb25Qb29sIGZyb20gXCJzYXAvdWkvY29yZS9JY29uUG9vbFwiO1xuaW1wb3J0IENvcmVMaWIgZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9tZXNzYWdlL01lc3NhZ2VcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9tZGMvQ29udHJvbFwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuXG5jb25zdCBNZXNzYWdlVHlwZSA9IENvcmVMaWIuTWVzc2FnZVR5cGU7XG5sZXQgYU1lc3NhZ2VMaXN0OiBhbnlbXSA9IFtdO1xubGV0IGFNZXNzYWdlRGF0YUxpc3Q6IGFueVtdID0gW107XG5sZXQgYVJlc29sdmVGdW5jdGlvbnM6IGFueVtdID0gW107XG5sZXQgb0RpYWxvZzogRGlhbG9nO1xubGV0IG9CYWNrQnV0dG9uOiBCdXR0b247XG5sZXQgb01lc3NhZ2VWaWV3OiBNZXNzYWdlVmlldztcblxuZXhwb3J0IHR5cGUgbWVzc2FnZUhhbmRsaW5nVHlwZSA9IHtcblx0Z2V0TWVzc2FnZXM6IChiQm91bmRNZXNzYWdlcz86IGFueSwgYlRyYW5zaXRpb25Pbmx5PzogYW55KSA9PiBhbnlbXTtcblx0c2hvd1VuYm91bmRNZXNzYWdlczogKFxuXHRcdGFDdXN0b21NZXNzYWdlcz86IGFueVtdLFxuXHRcdG9Db250ZXh0PzogYW55LFxuXHRcdGJTaG93Qm91bmRUcmFuc2l0aW9uPzogYm9vbGVhbixcblx0XHRjb25jdXJyZW50RWRpdEZsYWc/OiBib29sZWFuLFxuXHRcdGJPbmx5Rm9yVGVzdD86IGJvb2xlYW4sXG5cdFx0b25CZWZvcmVTaG93TWVzc2FnZT86IChtZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnM6IGFueSkgPT4gYW55XG5cdCkgPT4gUHJvbWlzZTxhbnk+O1xuXHRyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzOiAoKSA9PiB2b2lkO1xuXHRtb2RpZnlFVGFnTWVzc2FnZXNPbmx5OiAob01lc3NhZ2VNYW5hZ2VyOiBhbnksIG9SZXNvdXJjZUJ1bmRsZTogYW55LCBjb25jdXJyZW50RWRpdEZsYWc6IGJvb2xlYW4gfCB1bmRlZmluZWQpID0+IGJvb2xlYW47XG5cdHJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzOiAoc1BhdGhUb0JlUmVtb3ZlZD86IHN0cmluZykgPT4gdm9pZDtcblx0Z2V0UmV0cnlBZnRlck1lc3NhZ2U6IChvTWVzc2FnZTogYW55LCBiTWVzc2FnZURpYWxvZz86IGFueSkgPT4gYW55O1xuXHRwcmVwYXJlTWVzc2FnZVZpZXdGb3JEaWFsb2c6IChvTWVzc2FnZURpYWxvZ01vZGVsOiBKU09OTW9kZWwsIGJTdHJpY3RIYW5kbGluZ0Zsb3c6IGJvb2xlYW4sIGlzTXVsdGk0MTI/OiBib29sZWFuKSA9PiBhbnk7XG5cdHNldE1lc3NhZ2VTdWJ0aXRsZTogKG9UYWJsZTogYW55LCBhQ29udGV4dHM6IGFueVtdLCBtZXNzYWdlOiBhbnkpID0+IGFueTtcbn07XG5cbmZ1bmN0aW9uIGZuRm9ybWF0VGVjaG5pY2FsRGV0YWlscygpIHtcblx0bGV0IHNQcmV2aW91c0dyb3VwTmFtZTogc3RyaW5nO1xuXG5cdC8vIEluc2VydCB0ZWNobmljYWwgZGV0YWlsIGlmIGl0IGV4aXN0c1xuXHRmdW5jdGlvbiBpbnNlcnREZXRhaWwob1Byb3BlcnR5OiBhbnkpIHtcblx0XHRyZXR1cm4gb1Byb3BlcnR5LnByb3BlcnR5XG5cdFx0XHQ/IFwiKCAke1wiICtcblx0XHRcdFx0XHRvUHJvcGVydHkucHJvcGVydHkgK1xuXHRcdFx0XHRcdCd9ID8gKFwiPHA+JyArXG5cdFx0XHRcdFx0b1Byb3BlcnR5LnByb3BlcnR5LnN1YnN0cihNYXRoLm1heChvUHJvcGVydHkucHJvcGVydHkubGFzdEluZGV4T2YoXCIvXCIpLCBvUHJvcGVydHkucHJvcGVydHkubGFzdEluZGV4T2YoXCIuXCIpKSArIDEpICtcblx0XHRcdFx0XHQnIDogXCIgKyAnICtcblx0XHRcdFx0XHRcIiR7XCIgK1xuXHRcdFx0XHRcdG9Qcm9wZXJ0eS5wcm9wZXJ0eSArXG5cdFx0XHRcdFx0J30gKyBcIjwvcD5cIikgOiBcIlwiICknXG5cdFx0XHQ6IFwiXCI7XG5cdH1cblx0Ly8gSW5zZXJ0IGdyb3VwbmFtZSBpZiBpdCBleGlzdHNcblx0ZnVuY3Rpb24gaW5zZXJ0R3JvdXBOYW1lKG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0bGV0IHNIVE1MID0gXCJcIjtcblx0XHRpZiAob1Byb3BlcnR5Lmdyb3VwTmFtZSAmJiBvUHJvcGVydHkucHJvcGVydHkgJiYgb1Byb3BlcnR5Lmdyb3VwTmFtZSAhPT0gc1ByZXZpb3VzR3JvdXBOYW1lKSB7XG5cdFx0XHRzSFRNTCArPSBcIiggJHtcIiArIG9Qcm9wZXJ0eS5wcm9wZXJ0eSArICd9ID8gXCI8YnI+PGgzPicgKyBvUHJvcGVydHkuZ3JvdXBOYW1lICsgJzwvaDM+XCIgOiBcIlwiICkgKyAnO1xuXHRcdFx0c1ByZXZpb3VzR3JvdXBOYW1lID0gb1Byb3BlcnR5Lmdyb3VwTmFtZTtcblx0XHR9XG5cdFx0cmV0dXJuIHNIVE1MO1xuXHR9XG5cblx0Ly8gTGlzdCBvZiB0ZWNobmljYWwgZGV0YWlscyB0byBiZSBzaG93blxuXHRmdW5jdGlvbiBnZXRQYXRocygpIHtcblx0XHRjb25zdCBzVEQgPSBcInRlY2huaWNhbERldGFpbHNcIjsgLy8gbmFtZSBvZiBwcm9wZXJ0eSBpbiBtZXNzYWdlIG1vZGVsIGRhdGEgZm9yIHRlY2huaWNhbCBkZXRhaWxzXG5cdFx0cmV0dXJuIFtcblx0XHRcdHsgXCJncm91cE5hbWVcIjogXCJcIiwgXCJwcm9wZXJ0eVwiOiBgJHtzVER9L3N0YXR1c2AgfSxcblx0XHRcdHsgXCJncm91cE5hbWVcIjogXCJcIiwgXCJwcm9wZXJ0eVwiOiBgJHtzVER9L3N0YXR1c1RleHRgIH0sXG5cdFx0XHR7IFwiZ3JvdXBOYW1lXCI6IFwiQXBwbGljYXRpb25cIiwgXCJwcm9wZXJ0eVwiOiBgJHtzVER9L2Vycm9yL0BTQVBfX2NvbW1vbi5BcHBsaWNhdGlvbi9Db21wb25lbnRJZGAgfSxcblx0XHRcdHsgXCJncm91cE5hbWVcIjogXCJBcHBsaWNhdGlvblwiLCBcInByb3BlcnR5XCI6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLkFwcGxpY2F0aW9uL1NlcnZpY2VJZGAgfSxcblx0XHRcdHsgXCJncm91cE5hbWVcIjogXCJBcHBsaWNhdGlvblwiLCBcInByb3BlcnR5XCI6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLkFwcGxpY2F0aW9uL1NlcnZpY2VSZXBvc2l0b3J5YCB9LFxuXHRcdFx0eyBcImdyb3VwTmFtZVwiOiBcIkFwcGxpY2F0aW9uXCIsIFwicHJvcGVydHlcIjogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uQXBwbGljYXRpb24vU2VydmljZVZlcnNpb25gIH0sXG5cdFx0XHR7IFwiZ3JvdXBOYW1lXCI6IFwiRXJyb3JSZXNvbHV0aW9uXCIsIFwicHJvcGVydHlcIjogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uRXJyb3JSZXNvbHV0aW9uL0FuYWx5c2lzYCB9LFxuXHRcdFx0eyBcImdyb3VwTmFtZVwiOiBcIkVycm9yUmVzb2x1dGlvblwiLCBcInByb3BlcnR5XCI6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLkVycm9yUmVzb2x1dGlvbi9Ob3RlYCB9LFxuXHRcdFx0eyBcImdyb3VwTmFtZVwiOiBcIkVycm9yUmVzb2x1dGlvblwiLCBcInByb3BlcnR5XCI6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLkVycm9yUmVzb2x1dGlvbi9EZXRhaWxlZE5vdGVgIH0sXG5cdFx0XHR7IFwiZ3JvdXBOYW1lXCI6IFwiRXJyb3JSZXNvbHV0aW9uXCIsIFwicHJvcGVydHlcIjogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uRXhjZXB0aW9uQ2F0ZWdvcnlgIH0sXG5cdFx0XHR7IFwiZ3JvdXBOYW1lXCI6IFwiRXJyb3JSZXNvbHV0aW9uXCIsIFwicHJvcGVydHlcIjogYCR7c1REfS9lcnJvci9AU0FQX19jb21tb24uVGltZVN0YW1wYCB9LFxuXHRcdFx0eyBcImdyb3VwTmFtZVwiOiBcIkVycm9yUmVzb2x1dGlvblwiLCBcInByb3BlcnR5XCI6IGAke3NURH0vZXJyb3IvQFNBUF9fY29tbW9uLlRyYW5zYWN0aW9uSWRgIH0sXG5cdFx0XHR7IFwiZ3JvdXBOYW1lXCI6IFwiTWVzc2FnZXNcIiwgXCJwcm9wZXJ0eVwiOiBgJHtzVER9L2Vycm9yL2NvZGVgIH0sXG5cdFx0XHR7IFwiZ3JvdXBOYW1lXCI6IFwiTWVzc2FnZXNcIiwgXCJwcm9wZXJ0eVwiOiBgJHtzVER9L2Vycm9yL21lc3NhZ2VgIH1cblx0XHRdO1xuXHR9XG5cblx0bGV0IHNIVE1MID0gXCJPYmplY3Qua2V5cyhcIiArIFwiJHt0ZWNobmljYWxEZXRhaWxzfVwiICsgJykubGVuZ3RoID4gMCA/IFwiPGgyPlRlY2huaWNhbCBEZXRhaWxzPC9oMj5cIiA6IFwiXCIgJztcblx0Z2V0UGF0aHMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvUHJvcGVydHk6IHsgZ3JvdXBOYW1lOiBzdHJpbmc7IHByb3BlcnR5OiBzdHJpbmcgfSkge1xuXHRcdHNIVE1MID0gYCR7c0hUTUwgKyBpbnNlcnRHcm91cE5hbWUob1Byb3BlcnR5KX0ke2luc2VydERldGFpbChvUHJvcGVydHkpfSArIGA7XG5cdH0pO1xuXHRyZXR1cm4gc0hUTUw7XG59XG5mdW5jdGlvbiBmbkZvcm1hdERlc2NyaXB0aW9uKCkge1xuXHRyZXR1cm4gXCIoJHtcIiArICdkZXNjcmlwdGlvbn0gPyAoXCI8aDI+RGVzY3JpcHRpb248L2gyPlwiICsgJHsnICsgJ2Rlc2NyaXB0aW9ufSkgOiBcIlwiKSc7XG59XG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGhpZ2hlc3QgcHJpb3JpdHkgbWVzc2FnZSB0eXBlKEVycm9yL1dhcm5pbmcvU3VjY2Vzcy9JbmZvcm1hdGlvbikgZnJvbSB0aGUgYXZhaWxhYmxlIG1lc3NhZ2VzLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgc2FwLmZlLmNvcmUuYWN0aW9ucy5tZXNzYWdlSGFuZGxpbmcuZm5HZXRIaWdoZXN0TWVzc2FnZVByaW9yaXR5XG4gKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuYWN0aW9ucy5tZXNzYWdlSGFuZGxpbmdcbiAqIEBwYXJhbSBbYU1lc3NhZ2VzXSBNZXNzYWdlcyBsaXN0XG4gKiBAcmV0dXJucyBIaWdoZXN0IHByaW9yaXR5IG1lc3NhZ2UgZnJvbSB0aGUgYXZhaWxhYmxlIG1lc3NhZ2VzXG4gKiBAcHJpdmF0ZVxuICogQHVpNS1yZXN0cmljdGVkXG4gKi9cbmZ1bmN0aW9uIGZuR2V0SGlnaGVzdE1lc3NhZ2VQcmlvcml0eShhTWVzc2FnZXM6IGFueVtdKSB7XG5cdGxldCBzTWVzc2FnZVByaW9yaXR5ID0gTWVzc2FnZVR5cGUuTm9uZTtcblx0Y29uc3QgaUxlbmd0aCA9IGFNZXNzYWdlcy5sZW5ndGg7XG5cdGNvbnN0IG9NZXNzYWdlQ291bnQ6IGFueSA9IHsgRXJyb3I6IDAsIFdhcm5pbmc6IDAsIFN1Y2Nlc3M6IDAsIEluZm9ybWF0aW9uOiAwIH07XG5cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBpTGVuZ3RoOyBpKyspIHtcblx0XHQrK29NZXNzYWdlQ291bnRbYU1lc3NhZ2VzW2ldLmdldFR5cGUoKV07XG5cdH1cblx0aWYgKG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuRXJyb3JdID4gMCkge1xuXHRcdHNNZXNzYWdlUHJpb3JpdHkgPSBNZXNzYWdlVHlwZS5FcnJvcjtcblx0fSBlbHNlIGlmIChvTWVzc2FnZUNvdW50W01lc3NhZ2VUeXBlLldhcm5pbmddID4gMCkge1xuXHRcdHNNZXNzYWdlUHJpb3JpdHkgPSBNZXNzYWdlVHlwZS5XYXJuaW5nO1xuXHR9IGVsc2UgaWYgKG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuU3VjY2Vzc10gPiAwKSB7XG5cdFx0c01lc3NhZ2VQcmlvcml0eSA9IE1lc3NhZ2VUeXBlLlN1Y2Nlc3M7XG5cdH0gZWxzZSBpZiAob01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5JbmZvcm1hdGlvbl0gPiAwKSB7XG5cdFx0c01lc3NhZ2VQcmlvcml0eSA9IE1lc3NhZ2VUeXBlLkluZm9ybWF0aW9uO1xuXHR9XG5cdHJldHVybiBzTWVzc2FnZVByaW9yaXR5O1xufVxuLy8gZnVuY3Rpb24gd2hpY2ggbW9kaWZ5IGUtVGFnIG1lc3NhZ2VzIG9ubHkuXG4vLyByZXR1cm5zIDogdHJ1ZSwgaWYgYW55IGUtVGFnIG1lc3NhZ2UgaXMgbW9kaWZpZWQsIG90aGVyd2lzZSBmYWxzZS5cbmZ1bmN0aW9uIGZuTW9kaWZ5RVRhZ01lc3NhZ2VzT25seShvTWVzc2FnZU1hbmFnZXI6IGFueSwgb1Jlc291cmNlQnVuZGxlOiBhbnksIGNvbmN1cnJlbnRFZGl0RmxhZzogYm9vbGVhbiB8IHVuZGVmaW5lZCkge1xuXHRjb25zdCBhTWVzc2FnZXMgPSBvTWVzc2FnZU1hbmFnZXIuZ2V0TWVzc2FnZU1vZGVsKCkuZ2V0T2JqZWN0KFwiL1wiKTtcblx0bGV0IGJNZXNzYWdlc01vZGlmaWVkID0gZmFsc2U7XG5cdGxldCBzRXRhZ01lc3NhZ2UgPSBcIlwiO1xuXHRhTWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbiAob01lc3NhZ2U6IGFueSwgaTogYW55KSB7XG5cdFx0Y29uc3Qgb1RlY2huaWNhbERldGFpbHMgPSBvTWVzc2FnZS5nZXRUZWNobmljYWxEZXRhaWxzICYmIG9NZXNzYWdlLmdldFRlY2huaWNhbERldGFpbHMoKTtcblx0XHRpZiAob1RlY2huaWNhbERldGFpbHMgJiYgb1RlY2huaWNhbERldGFpbHMuaHR0cFN0YXR1cyA9PT0gNDEyKSB7XG5cdFx0XHRpZiAob1RlY2huaWNhbERldGFpbHMuaXNDb25jdXJyZW50TW9kaWZpY2F0aW9uICYmIGNvbmN1cnJlbnRFZGl0RmxhZykge1xuXHRcdFx0XHRzRXRhZ01lc3NhZ2UgPVxuXHRcdFx0XHRcdHNFdGFnTWVzc2FnZSB8fCBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQVBQX0NPTVBPTkVOVF9TQVBGRV9FVEFHX1RFQ0hOSUNBTF9JU1NVRVNfQ09OQ1VSUkVOVF9NT0RJRklDQVRJT05cIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzRXRhZ01lc3NhZ2UgPSBzRXRhZ01lc3NhZ2UgfHwgb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0FQUF9DT01QT05FTlRfU0FQRkVfRVRBR19URUNITklDQUxfSVNTVUVTXCIpO1xuXHRcdFx0fVxuXHRcdFx0b01lc3NhZ2VNYW5hZ2VyLnJlbW92ZU1lc3NhZ2VzKGFNZXNzYWdlc1tpXSk7XG5cdFx0XHRvTWVzc2FnZS5zZXRNZXNzYWdlKHNFdGFnTWVzc2FnZSk7XG5cdFx0XHRvTWVzc2FnZS50YXJnZXQgPSBcIlwiO1xuXHRcdFx0b01lc3NhZ2VNYW5hZ2VyLmFkZE1lc3NhZ2VzKG9NZXNzYWdlKTtcblx0XHRcdGJNZXNzYWdlc01vZGlmaWVkID0gdHJ1ZTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gYk1lc3NhZ2VzTW9kaWZpZWQ7XG59XG4vLyBEaWFsb2cgY2xvc2UgSGFuZGxpbmdcbmZ1bmN0aW9uIGRpYWxvZ0Nsb3NlSGFuZGxlcigpIHtcblx0b0RpYWxvZy5jbG9zZSgpO1xuXHRvQmFja0J1dHRvbi5zZXRWaXNpYmxlKGZhbHNlKTtcblx0YU1lc3NhZ2VMaXN0ID0gW107XG5cdGNvbnN0IG9NZXNzYWdlRGlhbG9nTW9kZWw6IGFueSA9IG9NZXNzYWdlVmlldy5nZXRNb2RlbCgpO1xuXHRpZiAob01lc3NhZ2VEaWFsb2dNb2RlbCkge1xuXHRcdG9NZXNzYWdlRGlhbG9nTW9kZWwuc2V0RGF0YSh7fSk7XG5cdH1cblx0cmVtb3ZlVW5ib3VuZFRyYW5zaXRpb25NZXNzYWdlcygpO1xufVxuZnVuY3Rpb24gZ2V0UmV0cnlBZnRlck1lc3NhZ2Uob01lc3NhZ2U6IGFueSwgYk1lc3NhZ2VEaWFsb2c/OiBhbnkpIHtcblx0Y29uc3QgZE5vdyA9IG5ldyBEYXRlKCk7XG5cdGNvbnN0IG9UZWNobmljYWxEZXRhaWxzID0gb01lc3NhZ2UuZ2V0VGVjaG5pY2FsRGV0YWlscygpO1xuXHRjb25zdCBvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRsZXQgc1JldHJ5QWZ0ZXJNZXNzYWdlO1xuXHRpZiAob1RlY2huaWNhbERldGFpbHMgJiYgb1RlY2huaWNhbERldGFpbHMuaHR0cFN0YXR1cyA9PT0gNTAzICYmIG9UZWNobmljYWxEZXRhaWxzLnJldHJ5QWZ0ZXIpIHtcblx0XHRjb25zdCBkUmV0cnlBZnRlciA9IG9UZWNobmljYWxEZXRhaWxzLnJldHJ5QWZ0ZXI7XG5cdFx0bGV0IG9EYXRlRm9ybWF0O1xuXHRcdGlmIChkTm93LmdldEZ1bGxZZWFyKCkgIT09IGRSZXRyeUFmdGVyLmdldEZ1bGxZZWFyKCkpIHtcblx0XHRcdC8vZGlmZmVyZW50IHllYXJzXG5cdFx0XHRvRGF0ZUZvcm1hdCA9IERhdGVGb3JtYXQuZ2V0RGF0ZVRpbWVJbnN0YW5jZSh7XG5cdFx0XHRcdHBhdHRlcm46IFwiTU1NTSBkZCwgeXl5eSAnYXQnIGhoOm1tIGFcIlxuXHRcdFx0fSk7XG5cdFx0XHRzUmV0cnlBZnRlck1lc3NhZ2UgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV81MDNfRVJST1JcIiwgW29EYXRlRm9ybWF0LmZvcm1hdChkUmV0cnlBZnRlcildKTtcblx0XHR9IGVsc2UgaWYgKGROb3cuZ2V0RnVsbFllYXIoKSA9PSBkUmV0cnlBZnRlci5nZXRGdWxsWWVhcigpKSB7XG5cdFx0XHQvL3NhbWUgeWVhclxuXHRcdFx0aWYgKGJNZXNzYWdlRGlhbG9nKSB7XG5cdFx0XHRcdC8vbGVzcyB0aGFuIDIgbWluXG5cdFx0XHRcdHNSZXRyeUFmdGVyTWVzc2FnZSA9IGAke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFXzUwM19USVRMRVwiKX0gJHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcblx0XHRcdFx0XHRcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV81MDNfREVTQ1wiXG5cdFx0XHRcdCl9YDtcblx0XHRcdH0gZWxzZSBpZiAoZE5vdy5nZXRNb250aCgpICE9PSBkUmV0cnlBZnRlci5nZXRNb250aCgpIHx8IGROb3cuZ2V0RGF0ZSgpICE9PSBkUmV0cnlBZnRlci5nZXREYXRlKCkpIHtcblx0XHRcdFx0b0RhdGVGb3JtYXQgPSBEYXRlRm9ybWF0LmdldERhdGVUaW1lSW5zdGFuY2Uoe1xuXHRcdFx0XHRcdHBhdHRlcm46IFwiTU1NTSBkZCAnYXQnIGhoOm1tIGFcIlxuXHRcdFx0XHR9KTsgLy9kaWZmZXJlbnQgbW9udGhzIG9yIGRpZmZlcmVudCBkYXlzIG9mIHNhbWUgbW9udGhcblx0XHRcdFx0c1JldHJ5QWZ0ZXJNZXNzYWdlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfNTAzX0VSUk9SXCIsIFtvRGF0ZUZvcm1hdC5mb3JtYXQoZFJldHJ5QWZ0ZXIpXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvL3NhbWUgZGF5XG5cdFx0XHRcdG9EYXRlRm9ybWF0ID0gRGF0ZUZvcm1hdC5nZXREYXRlVGltZUluc3RhbmNlKHtcblx0XHRcdFx0XHRwYXR0ZXJuOiBcImhoOm1tIGFcIlxuXHRcdFx0XHR9KTtcblx0XHRcdFx0c1JldHJ5QWZ0ZXJNZXNzYWdlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfNTAzX0VSUk9SX0RBWVwiLCBbb0RhdGVGb3JtYXQuZm9ybWF0KGRSZXRyeUFmdGVyKV0pO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGlmIChvVGVjaG5pY2FsRGV0YWlscyAmJiBvVGVjaG5pY2FsRGV0YWlscy5odHRwU3RhdHVzID09PSA1MDMgJiYgIW9UZWNobmljYWxEZXRhaWxzLnJldHJ5QWZ0ZXIpIHtcblx0XHRzUmV0cnlBZnRlck1lc3NhZ2UgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV81MDNfRVJST1JfTk9fUkVUUllfQUZURVJcIik7XG5cdH1cblx0cmV0dXJuIHNSZXRyeUFmdGVyTWVzc2FnZTtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZU1lc3NhZ2VWaWV3Rm9yRGlhbG9nKG9NZXNzYWdlRGlhbG9nTW9kZWw6IEpTT05Nb2RlbCwgYlN0cmljdEhhbmRsaW5nRmxvdzogYm9vbGVhbiwgbXVsdGk0MTI/OiBib29sZWFuKSB7XG5cdGxldCBvTWVzc2FnZVRlbXBsYXRlOiBNZXNzYWdlSXRlbTtcblx0aWYgKCFiU3RyaWN0SGFuZGxpbmdGbG93KSB7XG5cdFx0b01lc3NhZ2VUZW1wbGF0ZSA9IG5ldyBNZXNzYWdlSXRlbSh1bmRlZmluZWQsIHtcblx0XHRcdGNvdW50ZXI6IHsgcGF0aDogXCJjb3VudGVyXCIgfSxcblx0XHRcdHRpdGxlOiBcInttZXNzYWdlfVwiLFxuXHRcdFx0c3VidGl0bGU6IFwie2FkZGl0aW9uYWxUZXh0fVwiLFxuXHRcdFx0bG9uZ3RleHRVcmw6IFwie2Rlc2NyaXB0aW9uVXJsfVwiLFxuXHRcdFx0dHlwZTogeyBwYXRoOiBcInR5cGVcIiB9LFxuXHRcdFx0ZGVzY3JpcHRpb246XG5cdFx0XHRcdFwiez0gJHtcIiArXG5cdFx0XHRcdFwiZGVzY3JpcHRpb259IHx8ICR7dGVjaG5pY2FsRGV0YWlsc30gPyBcIiArXG5cdFx0XHRcdCdcIjxodG1sPjxib2R5PlwiICsgJyArXG5cdFx0XHRcdGZuRm9ybWF0RGVzY3JpcHRpb24oKSArXG5cdFx0XHRcdFwiICsgXCIgK1xuXHRcdFx0XHRmbkZvcm1hdFRlY2huaWNhbERldGFpbHMoKSArXG5cdFx0XHRcdCdcIjwvYm9keT48L2h0bWw+XCInICtcblx0XHRcdFx0JyA6IFwiXCIgfScsXG5cdFx0XHRtYXJrdXBEZXNjcmlwdGlvbjogdHJ1ZVxuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKG11bHRpNDEyKSB7XG5cdFx0b01lc3NhZ2VUZW1wbGF0ZSA9IG5ldyBNZXNzYWdlSXRlbSh1bmRlZmluZWQsIHtcblx0XHRcdGNvdW50ZXI6IHsgcGF0aDogXCJjb3VudGVyXCIgfSxcblx0XHRcdHRpdGxlOiBcInttZXNzYWdlfVwiLFxuXHRcdFx0c3VidGl0bGU6IFwie2FkZGl0aW9uYWxUZXh0fVwiLFxuXHRcdFx0bG9uZ3RleHRVcmw6IFwie2Rlc2NyaXB0aW9uVXJsfVwiLFxuXHRcdFx0dHlwZTogeyBwYXRoOiBcInR5cGVcIiB9LFxuXHRcdFx0ZGVzY3JpcHRpb246IFwie2Rlc2NyaXB0aW9ufVwiLFxuXHRcdFx0bWFya3VwRGVzY3JpcHRpb246IHRydWVcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRvTWVzc2FnZVRlbXBsYXRlID0gbmV3IE1lc3NhZ2VJdGVtKHtcblx0XHRcdHRpdGxlOiBcInttZXNzYWdlfVwiLFxuXHRcdFx0dHlwZTogeyBwYXRoOiBcInR5cGVcIiB9LFxuXHRcdFx0bG9uZ3RleHRVcmw6IFwie2Rlc2NyaXB0aW9uVXJsfVwiXG5cdFx0fSk7XG5cdH1cblx0b01lc3NhZ2VWaWV3ID0gbmV3IE1lc3NhZ2VWaWV3KHtcblx0XHRzaG93RGV0YWlsc1BhZ2VIZWFkZXI6IGZhbHNlLFxuXHRcdGl0ZW1TZWxlY3Q6IGZ1bmN0aW9uICgpIHtcblx0XHRcdG9CYWNrQnV0dG9uLnNldFZpc2libGUodHJ1ZSk7XG5cdFx0fSxcblx0XHRpdGVtczoge1xuXHRcdFx0cGF0aDogXCIvXCIsXG5cdFx0XHR0ZW1wbGF0ZTogb01lc3NhZ2VUZW1wbGF0ZVxuXHRcdH1cblx0fSk7XG5cdG9CYWNrQnV0dG9uID1cblx0XHRvQmFja0J1dHRvbiB8fFxuXHRcdG5ldyBCdXR0b24oe1xuXHRcdFx0aWNvbjogSWNvblBvb2wuZ2V0SWNvblVSSShcIm5hdi1iYWNrXCIpLFxuXHRcdFx0dmlzaWJsZTogZmFsc2UsXG5cdFx0XHRwcmVzczogZnVuY3Rpb24gKHRoaXM6IEJ1dHRvbikge1xuXHRcdFx0XHRvTWVzc2FnZVZpZXcubmF2aWdhdGVCYWNrKCk7XG5cdFx0XHRcdHRoaXMuc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdC8vIFVwZGF0ZSBwcm9wZXIgRVRhZyBNaXNtYXRjaCBlcnJvclxuXHRvTWVzc2FnZVZpZXcuc2V0TW9kZWwob01lc3NhZ2VEaWFsb2dNb2RlbCk7XG5cdHJldHVybiB7XG5cdFx0b01lc3NhZ2VWaWV3LFxuXHRcdG9CYWNrQnV0dG9uXG5cdH07XG59XG5cbmZ1bmN0aW9uIHNob3dVbmJvdW5kTWVzc2FnZXMoXG5cdHRoaXM6IG1lc3NhZ2VIYW5kbGluZ1R5cGUsXG5cdGFDdXN0b21NZXNzYWdlcz86IGFueVtdLFxuXHRvQ29udGV4dD86IGFueSxcblx0YlNob3dCb3VuZFRyYW5zaXRpb24/OiBib29sZWFuLFxuXHRjb25jdXJyZW50RWRpdEZsYWc/OiBib29sZWFuLFxuXHRiT25seUZvclRlc3Q/OiBib29sZWFuLFxuXHRvbkJlZm9yZVNob3dNZXNzYWdlPzogKG1lc3NhZ2VzOiBhbnksIHNob3dNZXNzYWdlUGFyYW1ldGVyczogYW55KSA9PiBhbnlcbik6IFByb21pc2U8YW55PiB7XG5cdGxldCBhVHJhbnNpdGlvbk1lc3NhZ2VzID0gdGhpcy5nZXRNZXNzYWdlcygpO1xuXHRjb25zdCBvTWVzc2FnZU1hbmFnZXIgPSBDb3JlLmdldE1lc3NhZ2VNYW5hZ2VyKCk7XG5cdGxldCBzSGlnaGVzdFByaW9yaXR5O1xuXHRsZXQgc0hpZ2hlc3RQcmlvcml0eVRleHQ7XG5cdGNvbnN0IGFGaWx0ZXJzID0gW25ldyBGaWx0ZXIoeyBwYXRoOiBcInBlcnNpc3RlbnRcIiwgb3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLk5FLCB2YWx1ZTE6IGZhbHNlIH0pXTtcblx0bGV0IHNob3dNZXNzYWdlRGlhbG9nOiBib29sZWFuIHwgdW5kZWZpbmVkID0gZmFsc2UsXG5cdFx0c2hvd01lc3NhZ2VCb3g6IGJvb2xlYW4gfCB1bmRlZmluZWQgPSBmYWxzZTtcblxuXHRpZiAoYlNob3dCb3VuZFRyYW5zaXRpb24pIHtcblx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzID0gYVRyYW5zaXRpb25NZXNzYWdlcy5jb25jYXQoZ2V0TWVzc2FnZXModHJ1ZSwgdHJ1ZSkpO1xuXHRcdC8vIHdlIG9ubHkgd2FudCB0byBzaG93IGJvdW5kIHRyYW5zaXRpb24gbWVzc2FnZXMgbm90IGJvdW5kIHN0YXRlIG1lc3NhZ2VzIGhlbmNlIGFkZCBhIGZpbHRlciBmb3IgdGhlIHNhbWVcblx0XHRhRmlsdGVycy5wdXNoKG5ldyBGaWx0ZXIoeyBwYXRoOiBcInBlcnNpc3RlbnRcIiwgb3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLkVRLCB2YWx1ZTE6IHRydWUgfSkpO1xuXHRcdGNvbnN0IGZuQ2hlY2tDb250cm9sSWRJbkRpYWxvZyA9IGZ1bmN0aW9uIChhQ29udHJvbElkczogYW55KSB7XG5cdFx0XHRsZXQgaW5kZXggPSBJbmZpbml0eSxcblx0XHRcdFx0b0NvbnRyb2wgPSBDb3JlLmJ5SWQoYUNvbnRyb2xJZHNbMF0pIGFzIE1hbmFnZWRPYmplY3Q7XG5cdFx0XHRjb25zdCBlcnJvckZpZWxkQ29udHJvbCA9IENvcmUuYnlJZChhQ29udHJvbElkc1swXSkgYXMgQ29udHJvbDtcblx0XHRcdHdoaWxlIChvQ29udHJvbCkge1xuXHRcdFx0XHRjb25zdCBmaWVsZFJhbmtpbkRpYWxvZyA9XG5cdFx0XHRcdFx0b0NvbnRyb2wgaW5zdGFuY2VvZiBEaWFsb2dcblx0XHRcdFx0XHRcdD8gKGVycm9yRmllbGRDb250cm9sLmdldFBhcmVudCgpIGFzIGFueSkuZmluZEVsZW1lbnRzKHRydWUpLmluZGV4T2YoZXJyb3JGaWVsZENvbnRyb2wpXG5cdFx0XHRcdFx0XHQ6IEluZmluaXR5O1xuXHRcdFx0XHRpZiAob0NvbnRyb2wgaW5zdGFuY2VvZiBEaWFsb2cpIHtcblx0XHRcdFx0XHRpZiAoaW5kZXggPiBmaWVsZFJhbmtpbkRpYWxvZykge1xuXHRcdFx0XHRcdFx0aW5kZXggPSBmaWVsZFJhbmtpbkRpYWxvZztcblx0XHRcdFx0XHRcdC8vIFNldCB0aGUgZm9jdXMgdG8gdGhlIGRpYWxvZydzIGNvbnRyb2xcblx0XHRcdFx0XHRcdGVycm9yRmllbGRDb250cm9sLmZvY3VzKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIG1lc3NhZ2VzIHdpdGggdGFyZ2V0IGluc2lkZSBzYXAubS5EaWFsb2cgc2hvdWxkIG5vdCBicmluZyB1cCB0aGUgbWVzc2FnZSBkaWFsb2dcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0b0NvbnRyb2wgPSBvQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH07XG5cdFx0YUZpbHRlcnMucHVzaChcblx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRwYXRoOiBcImNvbnRyb2xJZHNcIixcblx0XHRcdFx0dGVzdDogZm5DaGVja0NvbnRyb2xJZEluRGlhbG9nLFxuXHRcdFx0XHRjYXNlU2Vuc2l0aXZlOiB0cnVlXG5cdFx0XHR9KVxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gb25seSB1bmJvdW5kIG1lc3NhZ2VzIGhhdmUgdG8gYmUgc2hvd24gc28gYWRkIGZpbHRlciBhY2NvcmRpbmdseVxuXHRcdGFGaWx0ZXJzLnB1c2gobmV3IEZpbHRlcih7IHBhdGg6IFwidGFyZ2V0XCIsIG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5FUSwgdmFsdWUxOiBcIlwiIH0pKTtcblx0fVxuXHRpZiAoYUN1c3RvbU1lc3NhZ2VzICYmIGFDdXN0b21NZXNzYWdlcy5sZW5ndGgpIHtcblx0XHRhQ3VzdG9tTWVzc2FnZXMuZm9yRWFjaChmdW5jdGlvbiAob01lc3NhZ2U6IGFueSkge1xuXHRcdFx0Y29uc3QgbWVzc2FnZUNvZGUgPSBvTWVzc2FnZS5jb2RlID8gb01lc3NhZ2UuY29kZSA6IFwiXCI7XG5cdFx0XHRvTWVzc2FnZU1hbmFnZXIuYWRkTWVzc2FnZXMoXG5cdFx0XHRcdG5ldyBNZXNzYWdlKHtcblx0XHRcdFx0XHRtZXNzYWdlOiBvTWVzc2FnZS50ZXh0LFxuXHRcdFx0XHRcdHR5cGU6IG9NZXNzYWdlLnR5cGUsXG5cdFx0XHRcdFx0dGFyZ2V0OiBcIlwiLFxuXHRcdFx0XHRcdHBlcnNpc3RlbnQ6IHRydWUsXG5cdFx0XHRcdFx0Y29kZTogbWVzc2FnZUNvZGVcblx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0XHQvL1RoZSB0YXJnZXQgYW5kIHBlcnNpc3RlbnQgcHJvcGVydGllcyBvZiB0aGUgbWVzc2FnZSBhcmUgaGFyZGNvZGVkIGFzIFwiXCIgYW5kIHRydWUgYmVjYXVzZSB0aGUgZnVuY3Rpb24gZGVhbHMgd2l0aCBvbmx5IHVuYm91bmQgbWVzc2FnZXMuXG5cdFx0fSk7XG5cdH1cblx0Y29uc3Qgb01lc3NhZ2VEaWFsb2dNb2RlbCA9IChvTWVzc2FnZVZpZXcgJiYgKG9NZXNzYWdlVmlldy5nZXRNb2RlbCgpIGFzIEpTT05Nb2RlbCkpIHx8IG5ldyBKU09OTW9kZWwoKTtcblx0Y29uc3QgYkhhc0V0YWdNZXNzYWdlID0gdGhpcy5tb2RpZnlFVGFnTWVzc2FnZXNPbmx5KG9NZXNzYWdlTWFuYWdlciwgQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKSwgY29uY3VycmVudEVkaXRGbGFnKTtcblxuXHRpZiAoYVRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGggPT09IDEgJiYgYVRyYW5zaXRpb25NZXNzYWdlc1swXS5nZXRDb2RlKCkgPT09IFwiNTAzXCIpIHtcblx0XHRzaG93TWVzc2FnZUJveCA9IHRydWU7XG5cdH0gZWxzZSBpZiAoYVRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGggIT09IDApIHtcblx0XHRzaG93TWVzc2FnZURpYWxvZyA9IHRydWU7XG5cdH1cblx0bGV0IHNob3dNZXNzYWdlUGFyYW1ldGVyczogYW55O1xuXHRsZXQgYU1vZGVsRGF0YUFycmF5OiBhbnlbXSA9IFtdO1xuXHRpZiAoc2hvd01lc3NhZ2VEaWFsb2cgfHwgKCFzaG93TWVzc2FnZUJveCAmJiAhb25CZWZvcmVTaG93TWVzc2FnZSkpIHtcblx0XHRjb25zdCBvTGlzdEJpbmRpbmcgPSBvTWVzc2FnZU1hbmFnZXIuZ2V0TWVzc2FnZU1vZGVsKCkuYmluZExpc3QoXCIvXCIsIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCBhRmlsdGVycyksXG5cdFx0XHRhQ3VycmVudENvbnRleHRzID0gb0xpc3RCaW5kaW5nLmdldEN1cnJlbnRDb250ZXh0cygpO1xuXHRcdGlmIChhQ3VycmVudENvbnRleHRzICYmIGFDdXJyZW50Q29udGV4dHMubGVuZ3RoID4gMCkge1xuXHRcdFx0c2hvd01lc3NhZ2VEaWFsb2cgPSB0cnVlO1xuXHRcdFx0Ly8gRG9uJ3Qgc2hvdyBkaWFsb2cgaW5jYXNlIHRoZXJlIGFyZSBubyBlcnJvcnMgdG8gc2hvd1xuXG5cdFx0XHQvLyBpZiBmYWxzZSwgc2hvdyBtZXNzYWdlcyBpbiBkaWFsb2dcblx0XHRcdC8vIEFzIGZpdGVyaW5nIGhhcyBhbHJlYWR5IGhhcHBlbmVkIGhlcmUgaGVuY2Vcblx0XHRcdC8vIHVzaW5nIHRoZSBtZXNzYWdlIG1vZGVsIGFnYWluIGZvciB0aGUgbWVzc2FnZSBkaWFsb2cgdmlldyBhbmQgdGhlbiBmaWx0ZXJpbmcgb24gdGhhdCBiaW5kaW5nIGFnYWluIGlzIHVubmVjZXNzYXJ5LlxuXHRcdFx0Ly8gU28gd2UgY3JlYXRlIG5ldyBqc29uIG1vZGVsIHRvIHVzZSBmb3IgdGhlIG1lc3NhZ2UgZGlhbG9nIHZpZXcuXG5cdFx0XHRjb25zdCBhTWVzc2FnZXM6IGFueVtdID0gW107XG5cdFx0XHRhQ3VycmVudENvbnRleHRzLmZvckVhY2goZnVuY3Rpb24gKGN1cnJlbnRDb250ZXh0OiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgb01lc3NhZ2UgPSBjdXJyZW50Q29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0YU1lc3NhZ2VzLnB1c2gob01lc3NhZ2UpO1xuXHRcdFx0XHRhTWVzc2FnZURhdGFMaXN0ID0gYU1lc3NhZ2VzO1xuXHRcdFx0fSk7XG5cdFx0XHQvLyBpZihhTWVzc2FnZXMubGVuZ3RoID09PSAwICYmIGFNZXNzYWdlTGlzdC5sZW5ndGgpIHtcblx0XHRcdC8vIFx0b01lc3NhZ2VEaWFsb2dNb2RlbC5zZXREYXRhKGFNZXNzYWdlcyk7XG5cdFx0XHQvLyB9XG5cdFx0XHRsZXQgZXhpc3RpbmdNZXNzYWdlczogYW55W10gPSBbXTtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KG9NZXNzYWdlRGlhbG9nTW9kZWwuZ2V0RGF0YSgpKSkge1xuXHRcdFx0XHRleGlzdGluZ01lc3NhZ2VzID0gb01lc3NhZ2VEaWFsb2dNb2RlbC5nZXREYXRhKCk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBvVW5pcXVlT2JqOiBhbnkgPSB7fTtcblxuXHRcdFx0YU1vZGVsRGF0YUFycmF5ID0gYU1lc3NhZ2VEYXRhTGlzdC5jb25jYXQoZXhpc3RpbmdNZXNzYWdlcykuZmlsdGVyKGZ1bmN0aW9uIChvYmopIHtcblx0XHRcdFx0Ly8gcmVtb3ZlIGVudHJpZXMgaGF2aW5nIGR1cGxpY2F0ZSBtZXNzYWdlIGlkc1xuXHRcdFx0XHRyZXR1cm4gIW9VbmlxdWVPYmpbb2JqLmlkXSAmJiAob1VuaXF1ZU9ialtvYmouaWRdID0gdHJ1ZSk7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHRpZiAob25CZWZvcmVTaG93TWVzc2FnZSkge1xuXHRcdHNob3dNZXNzYWdlUGFyYW1ldGVycyA9IHsgc2hvd01lc3NhZ2VCb3gsIHNob3dNZXNzYWdlRGlhbG9nIH07XG5cdFx0c2hvd01lc3NhZ2VQYXJhbWV0ZXJzID0gb25CZWZvcmVTaG93TWVzc2FnZShhVHJhbnNpdGlvbk1lc3NhZ2VzLCBzaG93TWVzc2FnZVBhcmFtZXRlcnMpO1xuXHRcdHNob3dNZXNzYWdlQm94ID0gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dNZXNzYWdlQm94O1xuXHRcdHNob3dNZXNzYWdlRGlhbG9nID0gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLnNob3dNZXNzYWdlRGlhbG9nO1xuXHRcdGlmIChzaG93TWVzc2FnZURpYWxvZykge1xuXHRcdFx0YU1vZGVsRGF0YUFycmF5ID0gc2hvd01lc3NhZ2VQYXJhbWV0ZXJzLmZpbHRlcmVkTWVzc2FnZXMgPyBzaG93TWVzc2FnZVBhcmFtZXRlcnMuZmlsdGVyZWRNZXNzYWdlcyA6IGFNb2RlbERhdGFBcnJheTtcblx0XHR9XG5cdH1cblx0aWYgKGFUcmFuc2l0aW9uTWVzc2FnZXMubGVuZ3RoID09PSAwICYmICFhQ3VzdG9tTWVzc2FnZXMgJiYgIWJIYXNFdGFnTWVzc2FnZSkge1xuXHRcdC8vIERvbid0IHNob3cgdGhlIHBvcHVwIGlmIHRoZXJlIGFyZSBubyB0cmFuc2llbnQgbWVzc2FnZXNcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHR9IGVsc2UgaWYgKGFUcmFuc2l0aW9uTWVzc2FnZXMubGVuZ3RoID09PSAxICYmIGFUcmFuc2l0aW9uTWVzc2FnZXNbMF0uZ2V0VHlwZSgpID09PSBNZXNzYWdlVHlwZS5TdWNjZXNzICYmICFhQ3VzdG9tTWVzc2FnZXMpIHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUpID0+IHtcblx0XHRcdE1lc3NhZ2VUb2FzdC5zaG93KGFUcmFuc2l0aW9uTWVzc2FnZXNbMF0ubWVzc2FnZSk7XG5cdFx0XHRpZiAob01lc3NhZ2VEaWFsb2dNb2RlbCkge1xuXHRcdFx0XHRvTWVzc2FnZURpYWxvZ01vZGVsLnNldERhdGEoe30pO1xuXHRcdFx0fVxuXHRcdFx0b01lc3NhZ2VNYW5hZ2VyLnJlbW92ZU1lc3NhZ2VzKGFUcmFuc2l0aW9uTWVzc2FnZXMpO1xuXHRcdFx0cmVzb2x2ZSgpO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKHNob3dNZXNzYWdlRGlhbG9nKSB7XG5cdFx0b01lc3NhZ2VEaWFsb2dNb2RlbC5zZXREYXRhKGFNb2RlbERhdGFBcnJheSk7IC8vIHNldCB0aGUgbWVzc2FnZXMgaGVyZSBzbyB0aGF0IGlmIGFueSBvZiB0aGVtIGFyZSBmaWx0ZXJlZCBmb3IgQVBELCB0aGV5IGFyZSBmaWx0ZXJlZCBoZXJlIGFzIHdlbGwuXG5cdFx0YVJlc29sdmVGdW5jdGlvbnMgPSBhUmVzb2x2ZUZ1bmN0aW9ucyB8fCBbXTtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmU6ICh2YWx1ZTogYW55KSA9PiB2b2lkLCByZWplY3Q6IChyZWFzb24/OiBhbnkpID0+IHZvaWQpIHtcblx0XHRcdGFSZXNvbHZlRnVuY3Rpb25zLnB1c2gocmVzb2x2ZSk7XG5cdFx0XHRDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIsIHRydWUpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChvUmVzb3VyY2VCdW5kbGU6IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IGJTdHJpY3RIYW5kbGluZ0Zsb3cgPSBmYWxzZTtcblx0XHRcdFx0XHRpZiAoc2hvd01lc3NhZ2VQYXJhbWV0ZXJzICYmIHNob3dNZXNzYWdlUGFyYW1ldGVycy5mbkdldE1lc3NhZ2VTdWJ0aXRsZSkge1xuXHRcdFx0XHRcdFx0b01lc3NhZ2VEaWFsb2dNb2RlbC5nZXREYXRhKCkuZm9yRWFjaChmdW5jdGlvbiAob01lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRzaG93TWVzc2FnZVBhcmFtZXRlcnMuZm5HZXRNZXNzYWdlU3VidGl0bGUob01lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IG9NZXNzYWdlT2JqZWN0ID0gcHJlcGFyZU1lc3NhZ2VWaWV3Rm9yRGlhbG9nKG9NZXNzYWdlRGlhbG9nTW9kZWwsIGJTdHJpY3RIYW5kbGluZ0Zsb3cpO1xuXHRcdFx0XHRcdG9EaWFsb2cgPVxuXHRcdFx0XHRcdFx0b0RpYWxvZyAmJiBvRGlhbG9nLmlzT3BlbigpXG5cdFx0XHRcdFx0XHRcdD8gb0RpYWxvZ1xuXHRcdFx0XHRcdFx0XHQ6IG5ldyBEaWFsb2coe1xuXHRcdFx0XHRcdFx0XHRcdFx0cmVzaXphYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZW5kQnV0dG9uOiBuZXcgQnV0dG9uKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cHJlc3M6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkaWFsb2dDbG9zZUhhbmRsZXIoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBhbHNvIHJlbW92ZSBib3VuZCB0cmFuc2l0aW9uIG1lc3NhZ2VzIGlmIHdlIHdlcmUgc2hvd2luZyB0aGVtXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b01lc3NhZ2VNYW5hZ2VyLnJlbW92ZU1lc3NhZ2VzKGFNb2RlbERhdGFBcnJheSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRleHQ6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fU0FQRkVfQ0xPU0VcIilcblx0XHRcdFx0XHRcdFx0XHRcdH0pLFxuXHRcdFx0XHRcdFx0XHRcdFx0Y3VzdG9tSGVhZGVyOiBuZXcgQmFyKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udGVudE1pZGRsZTogW1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG5ldyBUZXh0KHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdHRleHQ6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfVElUTEVcIilcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRdLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb250ZW50TGVmdDogW29CYWNrQnV0dG9uXVxuXHRcdFx0XHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZW50V2lkdGg6IFwiMzcuNWVtXCIsXG5cdFx0XHRcdFx0XHRcdFx0XHRjb250ZW50SGVpZ2h0OiBcIjIxLjVlbVwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0dmVydGljYWxTY3JvbGxpbmc6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRcdFx0YWZ0ZXJDbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFSZXNvbHZlRnVuY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YVJlc29sdmVGdW5jdGlvbnNbaV0uY2FsbCgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFSZXNvbHZlRnVuY3Rpb25zID0gW107XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdCAgfSk7XG5cdFx0XHRcdFx0b0RpYWxvZy5yZW1vdmVBbGxDb250ZW50KCk7XG5cdFx0XHRcdFx0b0RpYWxvZy5hZGRDb250ZW50KG9NZXNzYWdlT2JqZWN0Lm9NZXNzYWdlVmlldyk7XG5cblx0XHRcdFx0XHRpZiAoYkhhc0V0YWdNZXNzYWdlKSB7XG5cdFx0XHRcdFx0XHRzYXAudWkucmVxdWlyZShbXCJzYXAvbS9CdXR0b25UeXBlXCJdLCBmdW5jdGlvbiAoQnV0dG9uVHlwZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdG9EaWFsb2cuc2V0QmVnaW5CdXR0b24oXG5cdFx0XHRcdFx0XHRcdFx0bmV3IEJ1dHRvbih7XG5cdFx0XHRcdFx0XHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRkaWFsb2dDbG9zZUhhbmRsZXIoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKG9Db250ZXh0Lmhhc1BlbmRpbmdDaGFuZ2VzKCkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvQ29udGV4dC5nZXRCaW5kaW5nKCkucmVzZXRDaGFuZ2VzKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0b0NvbnRleHQucmVmcmVzaCgpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0XHRcdHRleHQ6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fU0FQRkVfUkVGUkVTSFwiKSxcblx0XHRcdFx0XHRcdFx0XHRcdHR5cGU6IEJ1dHRvblR5cGUuRW1waGFzaXplZFxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0b0RpYWxvZy5kZXN0cm95QmVnaW5CdXR0b24oKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c0hpZ2hlc3RQcmlvcml0eSA9IGZuR2V0SGlnaGVzdE1lc3NhZ2VQcmlvcml0eShvTWVzc2FnZVZpZXcuZ2V0SXRlbXMoKSk7XG5cdFx0XHRcdFx0c0hpZ2hlc3RQcmlvcml0eVRleHQgPSBnZXRUcmFuc2xhdGVkVGV4dEZvck1lc3NhZ2VEaWFsb2coc0hpZ2hlc3RQcmlvcml0eSk7XG5cdFx0XHRcdFx0b0RpYWxvZy5zZXRTdGF0ZShzSGlnaGVzdFByaW9yaXR5KTtcblx0XHRcdFx0XHQob0RpYWxvZy5nZXRDdXN0b21IZWFkZXIoKSBhcyBhbnkpLmdldENvbnRlbnRNaWRkbGUoKVswXS5zZXRUZXh0KHNIaWdoZXN0UHJpb3JpdHlUZXh0KTtcblx0XHRcdFx0XHRvTWVzc2FnZVZpZXcubmF2aWdhdGVCYWNrKCk7XG5cdFx0XHRcdFx0b0RpYWxvZy5vcGVuKCk7XG5cdFx0XHRcdFx0aWYgKGJPbmx5Rm9yVGVzdCkge1xuXHRcdFx0XHRcdFx0cmVzb2x2ZShvRGlhbG9nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChyZWplY3QpO1xuXHRcdH0pO1xuXHR9IGVsc2UgaWYgKHNob3dNZXNzYWdlQm94KSB7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0XHRjb25zdCBvTWVzc2FnZSA9IGFUcmFuc2l0aW9uTWVzc2FnZXNbMF07XG5cdFx0XHRpZiAob01lc3NhZ2UudGVjaG5pY2FsRGV0YWlscyAmJiBhTWVzc2FnZUxpc3QuaW5kZXhPZihvTWVzc2FnZS50ZWNobmljYWxEZXRhaWxzLm9yaWdpbmFsTWVzc2FnZS5tZXNzYWdlKSA9PT0gLTEpIHtcblx0XHRcdFx0YU1lc3NhZ2VMaXN0LnB1c2gob01lc3NhZ2UudGVjaG5pY2FsRGV0YWlscy5vcmlnaW5hbE1lc3NhZ2UubWVzc2FnZSk7XG5cdFx0XHRcdGxldCBmb3JtYXR0ZWRUZXh0U3RyaW5nID0gXCI8aHRtbD48Ym9keT5cIjtcblx0XHRcdFx0Y29uc3QgcmV0cnlBZnRlck1lc3NhZ2UgPSBnZXRSZXRyeUFmdGVyTWVzc2FnZShvTWVzc2FnZSwgdHJ1ZSk7XG5cdFx0XHRcdGlmIChyZXRyeUFmdGVyTWVzc2FnZSkge1xuXHRcdFx0XHRcdGZvcm1hdHRlZFRleHRTdHJpbmcgPSBgPGg2PiR7cmV0cnlBZnRlck1lc3NhZ2V9PC9oNj48YnI+YDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc2hvd01lc3NhZ2VQYXJhbWV0ZXJzICYmIHNob3dNZXNzYWdlUGFyYW1ldGVycy5mbkdldE1lc3NhZ2VTdWJ0aXRsZSkge1xuXHRcdFx0XHRcdHNob3dNZXNzYWdlUGFyYW1ldGVycy5mbkdldE1lc3NhZ2VTdWJ0aXRsZShvTWVzc2FnZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9NZXNzYWdlLmdldENvZGUoKSAhPT0gXCI1MDNcIiAmJiBvTWVzc2FnZS5nZXRBZGRpdGlvbmFsVGV4dCgpICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRmb3JtYXR0ZWRUZXh0U3RyaW5nID0gYCR7Zm9ybWF0dGVkVGV4dFN0cmluZyArIG9NZXNzYWdlLmdldEFkZGl0aW9uYWxUZXh0KCl9OiAke29NZXNzYWdlLmdldE1lc3NhZ2UoKX08L2h0bWw+PC9ib2R5PmA7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Zm9ybWF0dGVkVGV4dFN0cmluZyA9IGAke2Zvcm1hdHRlZFRleHRTdHJpbmcgKyBvTWVzc2FnZS5nZXRNZXNzYWdlKCl9PC9odG1sPjwvYm9keT5gO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGZvcm1hdHRlZFRleHQ6IGFueSA9IG5ldyBGb3JtYXR0ZWRUZXh0KHtcblx0XHRcdFx0XHRodG1sVGV4dDogZm9ybWF0dGVkVGV4dFN0cmluZ1xuXHRcdFx0XHR9KTtcblx0XHRcdFx0TWVzc2FnZUJveC5lcnJvcihmb3JtYXR0ZWRUZXh0LCB7XG5cdFx0XHRcdFx0b25DbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0YU1lc3NhZ2VMaXN0ID0gW107XG5cdFx0XHRcdFx0XHRpZiAoYlNob3dCb3VuZFRyYW5zaXRpb24pIHtcblx0XHRcdFx0XHRcdFx0cmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHRcdHJlc29sdmUodHJ1ZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuXHR9XG59XG5mdW5jdGlvbiBnZXRUcmFuc2xhdGVkVGV4dEZvck1lc3NhZ2VEaWFsb2coc0hpZ2hlc3RQcmlvcml0eTogYW55KSB7XG5cdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdHN3aXRjaCAoc0hpZ2hlc3RQcmlvcml0eSkge1xuXHRcdGNhc2UgXCJFcnJvclwiOlxuXHRcdFx0cmV0dXJuIG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9USVRMRV9FUlJPUlwiKTtcblx0XHRjYXNlIFwiSW5mb3JtYXRpb25cIjpcblx0XHRcdHJldHVybiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX0lORk9cIik7XG5cdFx0Y2FzZSBcIlN1Y2Nlc3NcIjpcblx0XHRcdHJldHVybiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX1NVQ0NFU1NcIik7XG5cdFx0Y2FzZSBcIldhcm5pbmdcIjpcblx0XHRcdHJldHVybiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX1dBUk5JTkdcIik7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdHJldHVybiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFXCIpO1xuXHR9XG59XG5mdW5jdGlvbiByZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCkge1xuXHRyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXMoZmFsc2UpO1xufVxuZnVuY3Rpb24gcmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoc1BhdGhUb0JlUmVtb3ZlZD86IHN0cmluZykge1xuXHRyZW1vdmVUcmFuc2l0aW9uTWVzc2FnZXModHJ1ZSwgc1BhdGhUb0JlUmVtb3ZlZCk7XG59XG5cbmZ1bmN0aW9uIGdldE1lc3NhZ2VzRnJvbU1lc3NhZ2VNb2RlbChvTWVzc2FnZU1vZGVsOiBhbnksIHNQYXRoVG9CZVJlbW92ZWQ/OiBzdHJpbmcpIHtcblx0aWYgKHNQYXRoVG9CZVJlbW92ZWQgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBvTWVzc2FnZU1vZGVsLmdldE9iamVjdChcIi9cIik7XG5cdH1cblx0Y29uc3QgbGlzdEJpbmRpbmcgPSBvTWVzc2FnZU1vZGVsLmJpbmRMaXN0KFwiL1wiKTtcblxuXHRsaXN0QmluZGluZy5maWx0ZXIoXG5cdFx0bmV3IEZpbHRlcih7XG5cdFx0XHRwYXRoOiBcInRhcmdldFwiLFxuXHRcdFx0b3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLlN0YXJ0c1dpdGgsXG5cdFx0XHR2YWx1ZTE6IHNQYXRoVG9CZVJlbW92ZWRcblx0XHR9KVxuXHQpO1xuXG5cdHJldHVybiBsaXN0QmluZGluZy5nZXRDdXJyZW50Q29udGV4dHMoKS5tYXAoZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gb0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdH0pO1xufVxuZnVuY3Rpb24gZ2V0TWVzc2FnZXMoYkJvdW5kTWVzc2FnZXM6IGJvb2xlYW4gPSBmYWxzZSwgYlRyYW5zaXRpb25Pbmx5OiBib29sZWFuID0gZmFsc2UsIHNQYXRoVG9CZVJlbW92ZWQ/OiBzdHJpbmcpIHtcblx0bGV0IGk7XG5cdGNvbnN0IG9NZXNzYWdlTWFuYWdlciA9IENvcmUuZ2V0TWVzc2FnZU1hbmFnZXIoKSxcblx0XHRvTWVzc2FnZU1vZGVsID0gb01lc3NhZ2VNYW5hZ2VyLmdldE1lc3NhZ2VNb2RlbCgpLFxuXHRcdG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIiksXG5cdFx0YVRyYW5zaXRpb25NZXNzYWdlcyA9IFtdO1xuXHRsZXQgYU1lc3NhZ2VzOiBhbnlbXSA9IFtdO1xuXHRpZiAoYkJvdW5kTWVzc2FnZXMgJiYgYlRyYW5zaXRpb25Pbmx5ICYmIHNQYXRoVG9CZVJlbW92ZWQpIHtcblx0XHRhTWVzc2FnZXMgPSBnZXRNZXNzYWdlc0Zyb21NZXNzYWdlTW9kZWwob01lc3NhZ2VNb2RlbCwgc1BhdGhUb0JlUmVtb3ZlZCk7XG5cdH0gZWxzZSB7XG5cdFx0YU1lc3NhZ2VzID0gb01lc3NhZ2VNb2RlbC5nZXRPYmplY3QoXCIvXCIpO1xuXHR9XG5cdGZvciAoaSA9IDA7IGkgPCBhTWVzc2FnZXMubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoXG5cdFx0XHQoIWJUcmFuc2l0aW9uT25seSB8fCBhTWVzc2FnZXNbaV0ucGVyc2lzdGVudCkgJiZcblx0XHRcdCgoYkJvdW5kTWVzc2FnZXMgJiYgYU1lc3NhZ2VzW2ldLnRhcmdldCAhPT0gXCJcIikgfHwgKCFiQm91bmRNZXNzYWdlcyAmJiAoIWFNZXNzYWdlc1tpXS50YXJnZXQgfHwgYU1lc3NhZ2VzW2ldLnRhcmdldCA9PT0gXCJcIikpKVxuXHRcdCkge1xuXHRcdFx0YVRyYW5zaXRpb25NZXNzYWdlcy5wdXNoKGFNZXNzYWdlc1tpXSk7XG5cdFx0fVxuXHR9XG5cblx0Zm9yIChpID0gMDsgaSA8IGFUcmFuc2l0aW9uTWVzc2FnZXMubGVuZ3RoOyBpKyspIHtcblx0XHRpZiAoXG5cdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLmNvZGUgPT09IFwiNTAzXCIgJiZcblx0XHRcdGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0ubWVzc2FnZSAhPT0gXCJcIiAmJlxuXHRcdFx0YVRyYW5zaXRpb25NZXNzYWdlc1tpXS5tZXNzYWdlLmluZGV4T2Yob1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfNTAzX0JBQ0tFTkRfUFJFRklYXCIpKSA9PT0gLTFcblx0XHQpIHtcblx0XHRcdGFUcmFuc2l0aW9uTWVzc2FnZXNbaV0ubWVzc2FnZSA9IGBcXG4ke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NRVNTQUdFX0hBTkRMSU5HX1NBUEZFXzUwM19CQUNLRU5EX1BSRUZJWFwiKX0ke1xuXHRcdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLm1lc3NhZ2Vcblx0XHRcdH1gO1xuXHRcdH1cblx0fVxuXHQvL0ZpbHRlcmluZyBtZXNzYWdlcyBhZ2FpbiBoZXJlIHRvIGF2b2lkIHNob3dpbmcgcHVyZSB0ZWNobmljYWwgbWVzc2FnZXMgcmFpc2VkIGJ5IHRoZSBtb2RlbFxuXHRjb25zdCBiYWNrZW5kTWVzc2FnZXM6IGFueSA9IFtdO1xuXHRmb3IgKGkgPSAwOyBpIDwgYVRyYW5zaXRpb25NZXNzYWdlcy5sZW5ndGg7IGkrKykge1xuXHRcdGlmIChcblx0XHRcdChhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLnRlY2huaWNhbERldGFpbHMgJiZcblx0XHRcdFx0KChhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLnRlY2huaWNhbERldGFpbHMub3JpZ2luYWxNZXNzYWdlICE9PSB1bmRlZmluZWQgJiZcblx0XHRcdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLnRlY2huaWNhbERldGFpbHMub3JpZ2luYWxNZXNzYWdlICE9PSBudWxsKSB8fFxuXHRcdFx0XHRcdChhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLnRlY2huaWNhbERldGFpbHMuaHR0cFN0YXR1cyAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRcdFx0XHRhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldLnRlY2huaWNhbERldGFpbHMuaHR0cFN0YXR1cyAhPT0gbnVsbCkpKSB8fFxuXHRcdFx0YVRyYW5zaXRpb25NZXNzYWdlc1tpXS5jb2RlXG5cdFx0KSB7XG5cdFx0XHRiYWNrZW5kTWVzc2FnZXMucHVzaChhVHJhbnNpdGlvbk1lc3NhZ2VzW2ldKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGJhY2tlbmRNZXNzYWdlcztcbn1cbmZ1bmN0aW9uIHJlbW92ZVRyYW5zaXRpb25NZXNzYWdlcyhiQm91bmRNZXNzYWdlczogYW55LCBzUGF0aFRvQmVSZW1vdmVkPzogc3RyaW5nKSB7XG5cdGNvbnN0IGFNZXNzYWdlc1RvQmVEZWxldGVkID0gZ2V0TWVzc2FnZXMoYkJvdW5kTWVzc2FnZXMsIHRydWUsIHNQYXRoVG9CZVJlbW92ZWQpO1xuXG5cdGlmIChhTWVzc2FnZXNUb0JlRGVsZXRlZC5sZW5ndGggPiAwKSB7XG5cdFx0Q29yZS5nZXRNZXNzYWdlTWFuYWdlcigpLnJlbW92ZU1lc3NhZ2VzKGFNZXNzYWdlc1RvQmVEZWxldGVkKTtcblx0fVxufVxuLy9UT0RPOiBUaGlzIG11c3QgYmUgbW92ZWQgb3V0IG9mIG1lc3NhZ2UgaGFuZGxpbmdcbmZ1bmN0aW9uIHNldE1lc3NhZ2VTdWJ0aXRsZShvVGFibGU6IGFueSwgYUNvbnRleHRzOiBhbnlbXSwgbWVzc2FnZTogYW55KSB7XG5cdGNvbnN0IHN1YnRpdGxlQ29sdW1uID0gb1RhYmxlLmdldFBhcmVudCgpLmdldElkZW50aWZpZXJDb2x1bW4oKTtcblx0Y29uc3QgZXJyb3JDb250ZXh0ID0gYUNvbnRleHRzLmZpbmQoZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gbWVzc2FnZS5nZXRUYXJnZXQoKS5pbmRleE9mKG9Db250ZXh0LmdldFBhdGgoKSkgIT09IC0xO1xuXHR9KTtcblx0bWVzc2FnZS5hZGRpdGlvbmFsVGV4dCA9IGVycm9yQ29udGV4dCA/IGVycm9yQ29udGV4dC5nZXRPYmplY3QoKVtzdWJ0aXRsZUNvbHVtbl0gOiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogU3RhdGljIGZ1bmN0aW9ucyBmb3IgRmlvcmkgTWVzc2FnZSBIYW5kbGluZ1xuICpcbiAqIEBuYW1lc3BhY2VcbiAqIEBhbGlhcyBzYXAuZmUuY29yZS5hY3Rpb25zLm1lc3NhZ2VIYW5kbGluZ1xuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgZXhwZXJpbWVudGFsIHVzZSEgPGJyLz48Yj5UaGlzIGlzIG9ubHkgYSBQT0MgYW5kIG1heWJlIGRlbGV0ZWQ8L2I+XG4gKiBAc2luY2UgMS41Ni4wXG4gKi9cbmNvbnN0IG1lc3NhZ2VIYW5kbGluZzogbWVzc2FnZUhhbmRsaW5nVHlwZSA9IHtcblx0Z2V0TWVzc2FnZXM6IGdldE1lc3NhZ2VzLFxuXHRzaG93VW5ib3VuZE1lc3NhZ2VzOiBzaG93VW5ib3VuZE1lc3NhZ2VzLFxuXHRyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzOiByZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzLFxuXHRyZW1vdmVCb3VuZFRyYW5zaXRpb25NZXNzYWdlczogcmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMsXG5cdG1vZGlmeUVUYWdNZXNzYWdlc09ubHk6IGZuTW9kaWZ5RVRhZ01lc3NhZ2VzT25seSxcblx0Z2V0UmV0cnlBZnRlck1lc3NhZ2U6IGdldFJldHJ5QWZ0ZXJNZXNzYWdlLFxuXHRwcmVwYXJlTWVzc2FnZVZpZXdGb3JEaWFsb2c6IHByZXBhcmVNZXNzYWdlVmlld0ZvckRpYWxvZyxcblx0c2V0TWVzc2FnZVN1YnRpdGxlOiBzZXRNZXNzYWdlU3VidGl0bGVcbn07XG5cbmV4cG9ydCBkZWZhdWx0IG1lc3NhZ2VIYW5kbGluZztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQW9CQSxJQUFNQSxXQUFXLEdBQUdDLE9BQU8sQ0FBQ0QsV0FBVztFQUN2QyxJQUFJRSxZQUFtQixHQUFHLEVBQUU7RUFDNUIsSUFBSUMsZ0JBQXVCLEdBQUcsRUFBRTtFQUNoQyxJQUFJQyxpQkFBd0IsR0FBRyxFQUFFO0VBQ2pDLElBQUlDLE9BQWU7RUFDbkIsSUFBSUMsV0FBbUI7RUFDdkIsSUFBSUMsWUFBeUI7RUFvQjdCLFNBQVNDLHdCQUF3QixHQUFHO0lBQ25DLElBQUlDLGtCQUEwQjs7SUFFOUI7SUFDQSxTQUFTQyxZQUFZLENBQUNDLFNBQWMsRUFBRTtNQUNyQyxPQUFPQSxTQUFTLENBQUNDLFFBQVEsR0FDdEIsTUFBTSxHQUNORCxTQUFTLENBQUNDLFFBQVEsR0FDbEIsV0FBVyxHQUNYRCxTQUFTLENBQUNDLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDQyxJQUFJLENBQUNDLEdBQUcsQ0FBQ0osU0FBUyxDQUFDQyxRQUFRLENBQUNJLFdBQVcsQ0FBQyxHQUFHLENBQUMsRUFBRUwsU0FBUyxDQUFDQyxRQUFRLENBQUNJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUNqSCxTQUFTLEdBQ1QsSUFBSSxHQUNKTCxTQUFTLENBQUNDLFFBQVEsR0FDbEIsb0JBQW9CLEdBQ3BCLEVBQUU7SUFDTjtJQUNBO0lBQ0EsU0FBU0ssZUFBZSxDQUFDTixTQUFjLEVBQUU7TUFDeEMsSUFBSU8sS0FBSyxHQUFHLEVBQUU7TUFDZCxJQUFJUCxTQUFTLENBQUNRLFNBQVMsSUFBSVIsU0FBUyxDQUFDQyxRQUFRLElBQUlELFNBQVMsQ0FBQ1EsU0FBUyxLQUFLVixrQkFBa0IsRUFBRTtRQUM1RlMsS0FBSyxJQUFJLE1BQU0sR0FBR1AsU0FBUyxDQUFDQyxRQUFRLEdBQUcsZUFBZSxHQUFHRCxTQUFTLENBQUNRLFNBQVMsR0FBRyxrQkFBa0I7UUFDakdWLGtCQUFrQixHQUFHRSxTQUFTLENBQUNRLFNBQVM7TUFDekM7TUFDQSxPQUFPRCxLQUFLO0lBQ2I7O0lBRUE7SUFDQSxTQUFTRSxRQUFRLEdBQUc7TUFDbkIsSUFBTUMsR0FBRyxHQUFHLGtCQUFrQixDQUFDLENBQUM7TUFDaEMsT0FBTyxDQUNOO1FBQUUsV0FBVyxFQUFFLEVBQUU7UUFBRSxVQUFVLFlBQUtBLEdBQUc7TUFBVSxDQUFDLEVBQ2hEO1FBQUUsV0FBVyxFQUFFLEVBQUU7UUFBRSxVQUFVLFlBQUtBLEdBQUc7TUFBYyxDQUFDLEVBQ3BEO1FBQUUsV0FBVyxFQUFFLGFBQWE7UUFBRSxVQUFVLFlBQUtBLEdBQUc7TUFBOEMsQ0FBQyxFQUMvRjtRQUFFLFdBQVcsRUFBRSxhQUFhO1FBQUUsVUFBVSxZQUFLQSxHQUFHO01BQTRDLENBQUMsRUFDN0Y7UUFBRSxXQUFXLEVBQUUsYUFBYTtRQUFFLFVBQVUsWUFBS0EsR0FBRztNQUFvRCxDQUFDLEVBQ3JHO1FBQUUsV0FBVyxFQUFFLGFBQWE7UUFBRSxVQUFVLFlBQUtBLEdBQUc7TUFBaUQsQ0FBQyxFQUNsRztRQUFFLFdBQVcsRUFBRSxpQkFBaUI7UUFBRSxVQUFVLFlBQUtBLEdBQUc7TUFBK0MsQ0FBQyxFQUNwRztRQUFFLFdBQVcsRUFBRSxpQkFBaUI7UUFBRSxVQUFVLFlBQUtBLEdBQUc7TUFBMkMsQ0FBQyxFQUNoRztRQUFFLFdBQVcsRUFBRSxpQkFBaUI7UUFBRSxVQUFVLFlBQUtBLEdBQUc7TUFBbUQsQ0FBQyxFQUN4RztRQUFFLFdBQVcsRUFBRSxpQkFBaUI7UUFBRSxVQUFVLFlBQUtBLEdBQUc7TUFBd0MsQ0FBQyxFQUM3RjtRQUFFLFdBQVcsRUFBRSxpQkFBaUI7UUFBRSxVQUFVLFlBQUtBLEdBQUc7TUFBZ0MsQ0FBQyxFQUNyRjtRQUFFLFdBQVcsRUFBRSxpQkFBaUI7UUFBRSxVQUFVLFlBQUtBLEdBQUc7TUFBb0MsQ0FBQyxFQUN6RjtRQUFFLFdBQVcsRUFBRSxVQUFVO1FBQUUsVUFBVSxZQUFLQSxHQUFHO01BQWMsQ0FBQyxFQUM1RDtRQUFFLFdBQVcsRUFBRSxVQUFVO1FBQUUsVUFBVSxZQUFLQSxHQUFHO01BQWlCLENBQUMsQ0FDL0Q7SUFDRjtJQUVBLElBQUlILEtBQUssR0FBRyxjQUFjLEdBQUcscUJBQXFCLEdBQUcsbURBQW1EO0lBQ3hHRSxRQUFRLEVBQUUsQ0FBQ0UsT0FBTyxDQUFDLFVBQVVYLFNBQWtELEVBQUU7TUFDaEZPLEtBQUssYUFBTUEsS0FBSyxHQUFHRCxlQUFlLENBQUNOLFNBQVMsQ0FBQyxTQUFHRCxZQUFZLENBQUNDLFNBQVMsQ0FBQyxRQUFLO0lBQzdFLENBQUMsQ0FBQztJQUNGLE9BQU9PLEtBQUs7RUFDYjtFQUNBLFNBQVNLLG1CQUFtQixHQUFHO0lBQzlCLE9BQU8sS0FBSyxHQUFHLDZDQUE2QyxHQUFHLHFCQUFxQjtFQUNyRjtFQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQywyQkFBMkIsQ0FBQ0MsU0FBZ0IsRUFBRTtJQUN0RCxJQUFJQyxnQkFBZ0IsR0FBRzFCLFdBQVcsQ0FBQzJCLElBQUk7SUFDdkMsSUFBTUMsT0FBTyxHQUFHSCxTQUFTLENBQUNJLE1BQU07SUFDaEMsSUFBTUMsYUFBa0IsR0FBRztNQUFFQyxLQUFLLEVBQUUsQ0FBQztNQUFFQyxPQUFPLEVBQUUsQ0FBQztNQUFFQyxPQUFPLEVBQUUsQ0FBQztNQUFFQyxXQUFXLEVBQUU7SUFBRSxDQUFDO0lBRS9FLEtBQUssSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHUCxPQUFPLEVBQUVPLENBQUMsRUFBRSxFQUFFO01BQ2pDLEVBQUVMLGFBQWEsQ0FBQ0wsU0FBUyxDQUFDVSxDQUFDLENBQUMsQ0FBQ0MsT0FBTyxFQUFFLENBQUM7SUFDeEM7SUFDQSxJQUFJTixhQUFhLENBQUM5QixXQUFXLENBQUMrQixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7TUFDekNMLGdCQUFnQixHQUFHMUIsV0FBVyxDQUFDK0IsS0FBSztJQUNyQyxDQUFDLE1BQU0sSUFBSUQsYUFBYSxDQUFDOUIsV0FBVyxDQUFDZ0MsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO01BQ2xETixnQkFBZ0IsR0FBRzFCLFdBQVcsQ0FBQ2dDLE9BQU87SUFDdkMsQ0FBQyxNQUFNLElBQUlGLGFBQWEsQ0FBQzlCLFdBQVcsQ0FBQ2lDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtNQUNsRFAsZ0JBQWdCLEdBQUcxQixXQUFXLENBQUNpQyxPQUFPO0lBQ3ZDLENBQUMsTUFBTSxJQUFJSCxhQUFhLENBQUM5QixXQUFXLENBQUNrQyxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUU7TUFDdERSLGdCQUFnQixHQUFHMUIsV0FBVyxDQUFDa0MsV0FBVztJQUMzQztJQUNBLE9BQU9SLGdCQUFnQjtFQUN4QjtFQUNBO0VBQ0E7RUFDQSxTQUFTVyx3QkFBd0IsQ0FBQ0MsZUFBb0IsRUFBRUMsZUFBb0IsRUFBRUMsa0JBQXVDLEVBQUU7SUFDdEgsSUFBTWYsU0FBUyxHQUFHYSxlQUFlLENBQUNHLGVBQWUsRUFBRSxDQUFDQyxTQUFTLENBQUMsR0FBRyxDQUFDO0lBQ2xFLElBQUlDLGlCQUFpQixHQUFHLEtBQUs7SUFDN0IsSUFBSUMsWUFBWSxHQUFHLEVBQUU7SUFDckJuQixTQUFTLENBQUNILE9BQU8sQ0FBQyxVQUFVdUIsUUFBYSxFQUFFVixDQUFNLEVBQUU7TUFDbEQsSUFBTVcsaUJBQWlCLEdBQUdELFFBQVEsQ0FBQ0UsbUJBQW1CLElBQUlGLFFBQVEsQ0FBQ0UsbUJBQW1CLEVBQUU7TUFDeEYsSUFBSUQsaUJBQWlCLElBQUlBLGlCQUFpQixDQUFDRSxVQUFVLEtBQUssR0FBRyxFQUFFO1FBQzlELElBQUlGLGlCQUFpQixDQUFDRyx3QkFBd0IsSUFBSVQsa0JBQWtCLEVBQUU7VUFDckVJLFlBQVksR0FDWEEsWUFBWSxJQUFJTCxlQUFlLENBQUNXLE9BQU8sQ0FBQyxxRUFBcUUsQ0FBQztRQUNoSCxDQUFDLE1BQU07VUFDTk4sWUFBWSxHQUFHQSxZQUFZLElBQUlMLGVBQWUsQ0FBQ1csT0FBTyxDQUFDLDZDQUE2QyxDQUFDO1FBQ3RHO1FBQ0FaLGVBQWUsQ0FBQ2EsY0FBYyxDQUFDMUIsU0FBUyxDQUFDVSxDQUFDLENBQUMsQ0FBQztRQUM1Q1UsUUFBUSxDQUFDTyxVQUFVLENBQUNSLFlBQVksQ0FBQztRQUNqQ0MsUUFBUSxDQUFDUSxNQUFNLEdBQUcsRUFBRTtRQUNwQmYsZUFBZSxDQUFDZ0IsV0FBVyxDQUFDVCxRQUFRLENBQUM7UUFDckNGLGlCQUFpQixHQUFHLElBQUk7TUFDekI7SUFDRCxDQUFDLENBQUM7SUFDRixPQUFPQSxpQkFBaUI7RUFDekI7RUFDQTtFQUNBLFNBQVNZLGtCQUFrQixHQUFHO0lBQzdCbEQsT0FBTyxDQUFDbUQsS0FBSyxFQUFFO0lBQ2ZsRCxXQUFXLENBQUNtRCxVQUFVLENBQUMsS0FBSyxDQUFDO0lBQzdCdkQsWUFBWSxHQUFHLEVBQUU7SUFDakIsSUFBTXdELG1CQUF3QixHQUFHbkQsWUFBWSxDQUFDb0QsUUFBUSxFQUFFO0lBQ3hELElBQUlELG1CQUFtQixFQUFFO01BQ3hCQSxtQkFBbUIsQ0FBQ0UsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hDO0lBQ0FDLCtCQUErQixFQUFFO0VBQ2xDO0VBQ0EsU0FBU0Msb0JBQW9CLENBQUNqQixRQUFhLEVBQUVrQixjQUFvQixFQUFFO0lBQ2xFLElBQU1DLElBQUksR0FBRyxJQUFJQyxJQUFJLEVBQUU7SUFDdkIsSUFBTW5CLGlCQUFpQixHQUFHRCxRQUFRLENBQUNFLG1CQUFtQixFQUFFO0lBQ3hELElBQU1SLGVBQWUsR0FBRzJCLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsYUFBYSxDQUFDO0lBQ3BFLElBQUlDLGtCQUFrQjtJQUN0QixJQUFJdEIsaUJBQWlCLElBQUlBLGlCQUFpQixDQUFDRSxVQUFVLEtBQUssR0FBRyxJQUFJRixpQkFBaUIsQ0FBQ3VCLFVBQVUsRUFBRTtNQUM5RixJQUFNQyxXQUFXLEdBQUd4QixpQkFBaUIsQ0FBQ3VCLFVBQVU7TUFDaEQsSUFBSUUsV0FBVztNQUNmLElBQUlQLElBQUksQ0FBQ1EsV0FBVyxFQUFFLEtBQUtGLFdBQVcsQ0FBQ0UsV0FBVyxFQUFFLEVBQUU7UUFDckQ7UUFDQUQsV0FBVyxHQUFHRSxVQUFVLENBQUNDLG1CQUFtQixDQUFDO1VBQzVDQyxPQUFPLEVBQUU7UUFDVixDQUFDLENBQUM7UUFDRlAsa0JBQWtCLEdBQUc3QixlQUFlLENBQUNXLE9BQU8sQ0FBQyxvQ0FBb0MsRUFBRSxDQUFDcUIsV0FBVyxDQUFDSyxNQUFNLENBQUNOLFdBQVcsQ0FBQyxDQUFDLENBQUM7TUFDdEgsQ0FBQyxNQUFNLElBQUlOLElBQUksQ0FBQ1EsV0FBVyxFQUFFLElBQUlGLFdBQVcsQ0FBQ0UsV0FBVyxFQUFFLEVBQUU7UUFDM0Q7UUFDQSxJQUFJVCxjQUFjLEVBQUU7VUFDbkI7VUFDQUssa0JBQWtCLGFBQU03QixlQUFlLENBQUNXLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQyxjQUFJWCxlQUFlLENBQUNXLE9BQU8sQ0FDL0csbUNBQW1DLENBQ25DLENBQUU7UUFDSixDQUFDLE1BQU0sSUFBSWMsSUFBSSxDQUFDYSxRQUFRLEVBQUUsS0FBS1AsV0FBVyxDQUFDTyxRQUFRLEVBQUUsSUFBSWIsSUFBSSxDQUFDYyxPQUFPLEVBQUUsS0FBS1IsV0FBVyxDQUFDUSxPQUFPLEVBQUUsRUFBRTtVQUNsR1AsV0FBVyxHQUFHRSxVQUFVLENBQUNDLG1CQUFtQixDQUFDO1lBQzVDQyxPQUFPLEVBQUU7VUFDVixDQUFDLENBQUMsQ0FBQyxDQUFDO1VBQ0pQLGtCQUFrQixHQUFHN0IsZUFBZSxDQUFDVyxPQUFPLENBQUMsb0NBQW9DLEVBQUUsQ0FBQ3FCLFdBQVcsQ0FBQ0ssTUFBTSxDQUFDTixXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ3RILENBQUMsTUFBTTtVQUNOO1VBQ0FDLFdBQVcsR0FBR0UsVUFBVSxDQUFDQyxtQkFBbUIsQ0FBQztZQUM1Q0MsT0FBTyxFQUFFO1VBQ1YsQ0FBQyxDQUFDO1VBQ0ZQLGtCQUFrQixHQUFHN0IsZUFBZSxDQUFDVyxPQUFPLENBQUMsd0NBQXdDLEVBQUUsQ0FBQ3FCLFdBQVcsQ0FBQ0ssTUFBTSxDQUFDTixXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzFIO01BQ0Q7SUFDRDtJQUVBLElBQUl4QixpQkFBaUIsSUFBSUEsaUJBQWlCLENBQUNFLFVBQVUsS0FBSyxHQUFHLElBQUksQ0FBQ0YsaUJBQWlCLENBQUN1QixVQUFVLEVBQUU7TUFDL0ZELGtCQUFrQixHQUFHN0IsZUFBZSxDQUFDVyxPQUFPLENBQUMsbURBQW1ELENBQUM7SUFDbEc7SUFDQSxPQUFPa0Isa0JBQWtCO0VBQzFCO0VBRUEsU0FBU1csMkJBQTJCLENBQUNyQixtQkFBOEIsRUFBRXNCLG1CQUE0QixFQUFFQyxRQUFrQixFQUFFO0lBQ3RILElBQUlDLGdCQUE2QjtJQUNqQyxJQUFJLENBQUNGLG1CQUFtQixFQUFFO01BQ3pCRSxnQkFBZ0IsR0FBRyxJQUFJQyxXQUFXLENBQUNDLFNBQVMsRUFBRTtRQUM3Q0MsT0FBTyxFQUFFO1VBQUVDLElBQUksRUFBRTtRQUFVLENBQUM7UUFDNUJDLEtBQUssRUFBRSxXQUFXO1FBQ2xCQyxRQUFRLEVBQUUsa0JBQWtCO1FBQzVCQyxXQUFXLEVBQUUsa0JBQWtCO1FBQy9CQyxJQUFJLEVBQUU7VUFBRUosSUFBSSxFQUFFO1FBQU8sQ0FBQztRQUN0QkssV0FBVyxFQUNWLE9BQU8sR0FDUCx3Q0FBd0MsR0FDeEMsbUJBQW1CLEdBQ25CcEUsbUJBQW1CLEVBQUUsR0FDckIsS0FBSyxHQUNMZix3QkFBd0IsRUFBRSxHQUMxQixrQkFBa0IsR0FDbEIsU0FBUztRQUNWb0YsaUJBQWlCLEVBQUU7TUFDcEIsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxNQUFNLElBQUlYLFFBQVEsRUFBRTtNQUNwQkMsZ0JBQWdCLEdBQUcsSUFBSUMsV0FBVyxDQUFDQyxTQUFTLEVBQUU7UUFDN0NDLE9BQU8sRUFBRTtVQUFFQyxJQUFJLEVBQUU7UUFBVSxDQUFDO1FBQzVCQyxLQUFLLEVBQUUsV0FBVztRQUNsQkMsUUFBUSxFQUFFLGtCQUFrQjtRQUM1QkMsV0FBVyxFQUFFLGtCQUFrQjtRQUMvQkMsSUFBSSxFQUFFO1VBQUVKLElBQUksRUFBRTtRQUFPLENBQUM7UUFDdEJLLFdBQVcsRUFBRSxlQUFlO1FBQzVCQyxpQkFBaUIsRUFBRTtNQUNwQixDQUFDLENBQUM7SUFDSCxDQUFDLE1BQU07TUFDTlYsZ0JBQWdCLEdBQUcsSUFBSUMsV0FBVyxDQUFDO1FBQ2xDSSxLQUFLLEVBQUUsV0FBVztRQUNsQkcsSUFBSSxFQUFFO1VBQUVKLElBQUksRUFBRTtRQUFPLENBQUM7UUFDdEJHLFdBQVcsRUFBRTtNQUNkLENBQUMsQ0FBQztJQUNIO0lBQ0FsRixZQUFZLEdBQUcsSUFBSXNGLFdBQVcsQ0FBQztNQUM5QkMscUJBQXFCLEVBQUUsS0FBSztNQUM1QkMsVUFBVSxFQUFFLFlBQVk7UUFDdkJ6RixXQUFXLENBQUNtRCxVQUFVLENBQUMsSUFBSSxDQUFDO01BQzdCLENBQUM7TUFDRHVDLEtBQUssRUFBRTtRQUNOVixJQUFJLEVBQUUsR0FBRztRQUNUVyxRQUFRLEVBQUVmO01BQ1g7SUFDRCxDQUFDLENBQUM7SUFDRjVFLFdBQVcsR0FDVkEsV0FBVyxJQUNYLElBQUk0RixNQUFNLENBQUM7TUFDVkMsSUFBSSxFQUFFQyxRQUFRLENBQUNDLFVBQVUsQ0FBQyxVQUFVLENBQUM7TUFDckNDLE9BQU8sRUFBRSxLQUFLO01BQ2RDLEtBQUssRUFBRSxZQUF3QjtRQUM5QmhHLFlBQVksQ0FBQ2lHLFlBQVksRUFBRTtRQUMzQixJQUFJLENBQUMvQyxVQUFVLENBQUMsS0FBSyxDQUFDO01BQ3ZCO0lBQ0QsQ0FBQyxDQUFDO0lBQ0g7SUFDQWxELFlBQVksQ0FBQ2tHLFFBQVEsQ0FBQy9DLG1CQUFtQixDQUFDO0lBQzFDLE9BQU87TUFDTm5ELFlBQVksRUFBWkEsWUFBWTtNQUNaRCxXQUFXLEVBQVhBO0lBQ0QsQ0FBQztFQUNGO0VBRUEsU0FBU29HLG1CQUFtQixDQUUzQkMsZUFBdUIsRUFDdkJDLFFBQWMsRUFDZEMsb0JBQThCLEVBQzlCckUsa0JBQTRCLEVBQzVCc0UsWUFBc0IsRUFDdEJDLG1CQUF3RSxFQUN6RDtJQUNmLElBQUlDLG1CQUFtQixHQUFHLElBQUksQ0FBQ0MsV0FBVyxFQUFFO0lBQzVDLElBQU0zRSxlQUFlLEdBQUc0QixJQUFJLENBQUNnRCxpQkFBaUIsRUFBRTtJQUNoRCxJQUFJQyxnQkFBZ0I7SUFDcEIsSUFBSUMsb0JBQW9CO0lBQ3hCLElBQU1DLFFBQVEsR0FBRyxDQUFDLElBQUlDLE1BQU0sQ0FBQztNQUFFaEMsSUFBSSxFQUFFLFlBQVk7TUFBRWlDLFFBQVEsRUFBRUMsY0FBYyxDQUFDQyxFQUFFO01BQUVDLE1BQU0sRUFBRTtJQUFNLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLElBQUlDLGlCQUFzQyxHQUFHLEtBQUs7TUFDakRDLGNBQW1DLEdBQUcsS0FBSztJQUU1QyxJQUFJZixvQkFBb0IsRUFBRTtNQUN6QkcsbUJBQW1CLEdBQUdBLG1CQUFtQixDQUFDYSxNQUFNLENBQUNaLFdBQVcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7TUFDekU7TUFDQUksUUFBUSxDQUFDUyxJQUFJLENBQUMsSUFBSVIsTUFBTSxDQUFDO1FBQUVoQyxJQUFJLEVBQUUsWUFBWTtRQUFFaUMsUUFBUSxFQUFFQyxjQUFjLENBQUNPLEVBQUU7UUFBRUwsTUFBTSxFQUFFO01BQUssQ0FBQyxDQUFDLENBQUM7TUFDNUYsSUFBTU0sd0JBQXdCLEdBQUcsVUFBVUMsV0FBZ0IsRUFBRTtRQUM1RCxJQUFJQyxLQUFLLEdBQUdDLFFBQVE7VUFDbkJDLFFBQVEsR0FBR2xFLElBQUksQ0FBQ21FLElBQUksQ0FBQ0osV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFrQjtRQUN0RCxJQUFNSyxpQkFBaUIsR0FBR3BFLElBQUksQ0FBQ21FLElBQUksQ0FBQ0osV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFZO1FBQzlELE9BQU9HLFFBQVEsRUFBRTtVQUNoQixJQUFNRyxpQkFBaUIsR0FDdEJILFFBQVEsWUFBWUksTUFBTSxHQUN0QkYsaUJBQWlCLENBQUNHLFNBQVMsRUFBRSxDQUFTQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUNDLE9BQU8sQ0FBQ0wsaUJBQWlCLENBQUMsR0FDcEZILFFBQVE7VUFDWixJQUFJQyxRQUFRLFlBQVlJLE1BQU0sRUFBRTtZQUMvQixJQUFJTixLQUFLLEdBQUdLLGlCQUFpQixFQUFFO2NBQzlCTCxLQUFLLEdBQUdLLGlCQUFpQjtjQUN6QjtjQUNBRCxpQkFBaUIsQ0FBQ00sS0FBSyxFQUFFO1lBQzFCO1lBQ0E7WUFDQSxPQUFPLEtBQUs7VUFDYjtVQUNBUixRQUFRLEdBQUdBLFFBQVEsQ0FBQ0ssU0FBUyxFQUFFO1FBQ2hDO1FBQ0EsT0FBTyxJQUFJO01BQ1osQ0FBQztNQUNEcEIsUUFBUSxDQUFDUyxJQUFJLENBQ1osSUFBSVIsTUFBTSxDQUFDO1FBQ1ZoQyxJQUFJLEVBQUUsWUFBWTtRQUNsQnVELElBQUksRUFBRWIsd0JBQXdCO1FBQzlCYyxhQUFhLEVBQUU7TUFDaEIsQ0FBQyxDQUFDLENBQ0Y7SUFDRixDQUFDLE1BQU07TUFDTjtNQUNBekIsUUFBUSxDQUFDUyxJQUFJLENBQUMsSUFBSVIsTUFBTSxDQUFDO1FBQUVoQyxJQUFJLEVBQUUsUUFBUTtRQUFFaUMsUUFBUSxFQUFFQyxjQUFjLENBQUNPLEVBQUU7UUFBRUwsTUFBTSxFQUFFO01BQUcsQ0FBQyxDQUFDLENBQUM7SUFDdkY7SUFDQSxJQUFJZixlQUFlLElBQUlBLGVBQWUsQ0FBQzlFLE1BQU0sRUFBRTtNQUM5QzhFLGVBQWUsQ0FBQ3JGLE9BQU8sQ0FBQyxVQUFVdUIsUUFBYSxFQUFFO1FBQ2hELElBQU1rRyxXQUFXLEdBQUdsRyxRQUFRLENBQUNtRyxJQUFJLEdBQUduRyxRQUFRLENBQUNtRyxJQUFJLEdBQUcsRUFBRTtRQUN0RDFHLGVBQWUsQ0FBQ2dCLFdBQVcsQ0FDMUIsSUFBSTJGLE9BQU8sQ0FBQztVQUNYQyxPQUFPLEVBQUVyRyxRQUFRLENBQUNzRyxJQUFJO1VBQ3RCekQsSUFBSSxFQUFFN0MsUUFBUSxDQUFDNkMsSUFBSTtVQUNuQnJDLE1BQU0sRUFBRSxFQUFFO1VBQ1YrRixVQUFVLEVBQUUsSUFBSTtVQUNoQkosSUFBSSxFQUFFRDtRQUNQLENBQUMsQ0FBQyxDQUNGO1FBQ0Q7TUFDRCxDQUFDLENBQUM7SUFDSDs7SUFDQSxJQUFNckYsbUJBQW1CLEdBQUluRCxZQUFZLElBQUtBLFlBQVksQ0FBQ29ELFFBQVEsRUFBZ0IsSUFBSyxJQUFJMEYsU0FBUyxFQUFFO0lBQ3ZHLElBQU1DLGVBQWUsR0FBRyxJQUFJLENBQUNDLHNCQUFzQixDQUFDakgsZUFBZSxFQUFFNEIsSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsRUFBRTNCLGtCQUFrQixDQUFDO0lBRXRJLElBQUl3RSxtQkFBbUIsQ0FBQ25GLE1BQU0sS0FBSyxDQUFDLElBQUltRixtQkFBbUIsQ0FBQyxDQUFDLENBQUMsQ0FBQ3dDLE9BQU8sRUFBRSxLQUFLLEtBQUssRUFBRTtNQUNuRjVCLGNBQWMsR0FBRyxJQUFJO0lBQ3RCLENBQUMsTUFBTSxJQUFJWixtQkFBbUIsQ0FBQ25GLE1BQU0sS0FBSyxDQUFDLEVBQUU7TUFDNUM4RixpQkFBaUIsR0FBRyxJQUFJO0lBQ3pCO0lBQ0EsSUFBSThCLHFCQUEwQjtJQUM5QixJQUFJQyxlQUFzQixHQUFHLEVBQUU7SUFDL0IsSUFBSS9CLGlCQUFpQixJQUFLLENBQUNDLGNBQWMsSUFBSSxDQUFDYixtQkFBb0IsRUFBRTtNQUNuRSxJQUFNNEMsWUFBWSxHQUFHckgsZUFBZSxDQUFDRyxlQUFlLEVBQUUsQ0FBQ21ILFFBQVEsQ0FBQyxHQUFHLEVBQUV4RSxTQUFTLEVBQUVBLFNBQVMsRUFBRWlDLFFBQVEsQ0FBQztRQUNuR3dDLGdCQUFnQixHQUFHRixZQUFZLENBQUNHLGtCQUFrQixFQUFFO01BQ3JELElBQUlELGdCQUFnQixJQUFJQSxnQkFBZ0IsQ0FBQ2hJLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDcEQ4RixpQkFBaUIsR0FBRyxJQUFJO1FBQ3hCOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0EsSUFBTWxHLFNBQWdCLEdBQUcsRUFBRTtRQUMzQm9JLGdCQUFnQixDQUFDdkksT0FBTyxDQUFDLFVBQVV5SSxjQUFtQixFQUFFO1VBQ3ZELElBQU1sSCxRQUFRLEdBQUdrSCxjQUFjLENBQUNySCxTQUFTLEVBQUU7VUFDM0NqQixTQUFTLENBQUNxRyxJQUFJLENBQUNqRixRQUFRLENBQUM7VUFDeEIxQyxnQkFBZ0IsR0FBR3NCLFNBQVM7UUFDN0IsQ0FBQyxDQUFDO1FBQ0Y7UUFDQTtRQUNBO1FBQ0EsSUFBSXVJLGdCQUF1QixHQUFHLEVBQUU7UUFDaEMsSUFBSUMsS0FBSyxDQUFDQyxPQUFPLENBQUN4RyxtQkFBbUIsQ0FBQ3lHLE9BQU8sRUFBRSxDQUFDLEVBQUU7VUFDakRILGdCQUFnQixHQUFHdEcsbUJBQW1CLENBQUN5RyxPQUFPLEVBQUU7UUFDakQ7UUFDQSxJQUFNQyxVQUFlLEdBQUcsQ0FBQyxDQUFDO1FBRTFCVixlQUFlLEdBQUd2SixnQkFBZ0IsQ0FBQzBILE1BQU0sQ0FBQ21DLGdCQUFnQixDQUFDLENBQUNLLE1BQU0sQ0FBQyxVQUFVQyxHQUFHLEVBQUU7VUFDakY7VUFDQSxPQUFPLENBQUNGLFVBQVUsQ0FBQ0UsR0FBRyxDQUFDQyxFQUFFLENBQUMsS0FBS0gsVUFBVSxDQUFDRSxHQUFHLENBQUNDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQztRQUMxRCxDQUFDLENBQUM7TUFDSDtJQUNEO0lBRUEsSUFBSXhELG1CQUFtQixFQUFFO01BQ3hCMEMscUJBQXFCLEdBQUc7UUFBRTdCLGNBQWMsRUFBZEEsY0FBYztRQUFFRCxpQkFBaUIsRUFBakJBO01BQWtCLENBQUM7TUFDN0Q4QixxQkFBcUIsR0FBRzFDLG1CQUFtQixDQUFDQyxtQkFBbUIsRUFBRXlDLHFCQUFxQixDQUFDO01BQ3ZGN0IsY0FBYyxHQUFHNkIscUJBQXFCLENBQUM3QixjQUFjO01BQ3JERCxpQkFBaUIsR0FBRzhCLHFCQUFxQixDQUFDOUIsaUJBQWlCO01BQzNELElBQUlBLGlCQUFpQixFQUFFO1FBQ3RCK0IsZUFBZSxHQUFHRCxxQkFBcUIsQ0FBQ2UsZ0JBQWdCLEdBQUdmLHFCQUFxQixDQUFDZSxnQkFBZ0IsR0FBR2QsZUFBZTtNQUNwSDtJQUNEO0lBQ0EsSUFBSTFDLG1CQUFtQixDQUFDbkYsTUFBTSxLQUFLLENBQUMsSUFBSSxDQUFDOEUsZUFBZSxJQUFJLENBQUMyQyxlQUFlLEVBQUU7TUFDN0U7TUFDQSxPQUFPbUIsT0FBTyxDQUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQzdCLENBQUMsTUFBTSxJQUFJMUQsbUJBQW1CLENBQUNuRixNQUFNLEtBQUssQ0FBQyxJQUFJbUYsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUM1RSxPQUFPLEVBQUUsS0FBS3BDLFdBQVcsQ0FBQ2lDLE9BQU8sSUFBSSxDQUFDMEUsZUFBZSxFQUFFO01BQzVILE9BQU8sSUFBSThELE9BQU8sQ0FBTyxVQUFDQyxPQUFPLEVBQUs7UUFDckNDLFlBQVksQ0FBQ0MsSUFBSSxDQUFDNUQsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLENBQUNrQyxPQUFPLENBQUM7UUFDakQsSUFBSXhGLG1CQUFtQixFQUFFO1VBQ3hCQSxtQkFBbUIsQ0FBQ0UsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hDO1FBQ0F0QixlQUFlLENBQUNhLGNBQWMsQ0FBQzZELG1CQUFtQixDQUFDO1FBQ25EMEQsT0FBTyxFQUFFO01BQ1YsQ0FBQyxDQUFDO0lBQ0gsQ0FBQyxNQUFNLElBQUkvQyxpQkFBaUIsRUFBRTtNQUM3QmpFLG1CQUFtQixDQUFDRSxPQUFPLENBQUM4RixlQUFlLENBQUMsQ0FBQyxDQUFDO01BQzlDdEosaUJBQWlCLEdBQUdBLGlCQUFpQixJQUFJLEVBQUU7TUFDM0MsT0FBTyxJQUFJcUssT0FBTyxDQUFDLFVBQVVDLE9BQTZCLEVBQUVHLE1BQThCLEVBQUU7UUFDM0Z6SyxpQkFBaUIsQ0FBQzBILElBQUksQ0FBQzRDLE9BQU8sQ0FBQztRQUMvQnhHLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQyxDQUNoRDJHLElBQUksQ0FBQyxVQUFVdkksZUFBb0IsRUFBRTtVQUNyQyxJQUFNeUMsbUJBQW1CLEdBQUcsS0FBSztVQUNqQyxJQUFJeUUscUJBQXFCLElBQUlBLHFCQUFxQixDQUFDc0Isb0JBQW9CLEVBQUU7WUFDeEVySCxtQkFBbUIsQ0FBQ3lHLE9BQU8sRUFBRSxDQUFDN0ksT0FBTyxDQUFDLFVBQVV1QixRQUFhLEVBQUU7Y0FDOUQ0RyxxQkFBcUIsQ0FBQ3NCLG9CQUFvQixDQUFDbEksUUFBUSxDQUFDO1lBQ3JELENBQUMsQ0FBQztVQUNIO1VBQ0EsSUFBTW1JLGNBQWMsR0FBR2pHLDJCQUEyQixDQUFDckIsbUJBQW1CLEVBQUVzQixtQkFBbUIsQ0FBQztVQUM1RjNFLE9BQU8sR0FDTkEsT0FBTyxJQUFJQSxPQUFPLENBQUM0SyxNQUFNLEVBQUUsR0FDeEI1SyxPQUFPLEdBQ1AsSUFBSW1JLE1BQU0sQ0FBQztZQUNYMEMsU0FBUyxFQUFFLElBQUk7WUFDZkMsU0FBUyxFQUFFLElBQUlqRixNQUFNLENBQUM7Y0FDckJLLEtBQUssRUFBRSxZQUFZO2dCQUNsQmhELGtCQUFrQixFQUFFO2dCQUNwQjtnQkFDQWpCLGVBQWUsQ0FBQ2EsY0FBYyxDQUFDdUcsZUFBZSxDQUFDO2NBQ2hELENBQUM7Y0FDRFAsSUFBSSxFQUFFNUcsZUFBZSxDQUFDVyxPQUFPLENBQUMsc0JBQXNCO1lBQ3JELENBQUMsQ0FBQztZQUNGa0ksWUFBWSxFQUFFLElBQUlDLEdBQUcsQ0FBQztjQUNyQkMsYUFBYSxFQUFFLENBQ2QsSUFBSUMsSUFBSSxDQUFDO2dCQUNScEMsSUFBSSxFQUFFNUcsZUFBZSxDQUFDVyxPQUFPLENBQUMsb0RBQW9EO2NBQ25GLENBQUMsQ0FBQyxDQUNGO2NBQ0RzSSxXQUFXLEVBQUUsQ0FBQ2xMLFdBQVc7WUFDMUIsQ0FBQyxDQUFDO1lBQ0ZtTCxZQUFZLEVBQUUsUUFBUTtZQUN0QkMsYUFBYSxFQUFFLFFBQVE7WUFDdkJDLGlCQUFpQixFQUFFLEtBQUs7WUFDeEJDLFVBQVUsRUFBRSxZQUFZO2NBQ3ZCLEtBQUssSUFBSXpKLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBRy9CLGlCQUFpQixDQUFDeUIsTUFBTSxFQUFFTSxDQUFDLEVBQUUsRUFBRTtnQkFDbEQvQixpQkFBaUIsQ0FBQytCLENBQUMsQ0FBQyxDQUFDMEosSUFBSSxFQUFFO2NBQzVCO2NBQ0F6TCxpQkFBaUIsR0FBRyxFQUFFO1lBQ3ZCO1VBQ0EsQ0FBQyxDQUFDO1VBQ05DLE9BQU8sQ0FBQ3lMLGdCQUFnQixFQUFFO1VBQzFCekwsT0FBTyxDQUFDMEwsVUFBVSxDQUFDZixjQUFjLENBQUN6SyxZQUFZLENBQUM7VUFFL0MsSUFBSStJLGVBQWUsRUFBRTtZQUNwQjBDLEdBQUcsQ0FBQ0MsRUFBRSxDQUFDQyxPQUFPLENBQUMsQ0FBQyxrQkFBa0IsQ0FBQyxFQUFFLFVBQVVDLFVBQWUsRUFBRTtjQUMvRDlMLE9BQU8sQ0FBQytMLGNBQWMsQ0FDckIsSUFBSWxHLE1BQU0sQ0FBQztnQkFDVkssS0FBSyxFQUFFLFlBQVk7a0JBQ2xCaEQsa0JBQWtCLEVBQUU7a0JBQ3BCLElBQUlxRCxRQUFRLENBQUN5RixpQkFBaUIsRUFBRSxFQUFFO29CQUNqQ3pGLFFBQVEsQ0FBQzBGLFVBQVUsRUFBRSxDQUFDQyxZQUFZLEVBQUU7a0JBQ3JDO2tCQUNBM0YsUUFBUSxDQUFDNEYsT0FBTyxFQUFFO2dCQUNuQixDQUFDO2dCQUNEckQsSUFBSSxFQUFFNUcsZUFBZSxDQUFDVyxPQUFPLENBQUMsd0JBQXdCLENBQUM7Z0JBQ3ZEd0MsSUFBSSxFQUFFeUcsVUFBVSxDQUFDTTtjQUNsQixDQUFDLENBQUMsQ0FDRjtZQUNGLENBQUMsQ0FBQztVQUNILENBQUMsTUFBTTtZQUNOcE0sT0FBTyxDQUFDcU0sa0JBQWtCLEVBQUU7VUFDN0I7VUFDQXZGLGdCQUFnQixHQUFHM0YsMkJBQTJCLENBQUNqQixZQUFZLENBQUNvTSxRQUFRLEVBQUUsQ0FBQztVQUN2RXZGLG9CQUFvQixHQUFHd0YsaUNBQWlDLENBQUN6RixnQkFBZ0IsQ0FBQztVQUMxRTlHLE9BQU8sQ0FBQ3dNLFFBQVEsQ0FBQzFGLGdCQUFnQixDQUFDO1VBQ2pDOUcsT0FBTyxDQUFDeU0sZUFBZSxFQUFFLENBQVNDLGdCQUFnQixFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUNDLE9BQU8sQ0FBQzVGLG9CQUFvQixDQUFDO1VBQ3RGN0csWUFBWSxDQUFDaUcsWUFBWSxFQUFFO1VBQzNCbkcsT0FBTyxDQUFDNE0sSUFBSSxFQUFFO1VBQ2QsSUFBSW5HLFlBQVksRUFBRTtZQUNqQjRELE9BQU8sQ0FBQ3JLLE9BQU8sQ0FBQztVQUNqQjtRQUNELENBQUMsQ0FBQyxDQUNENk0sS0FBSyxDQUFDckMsTUFBTSxDQUFDO01BQ2hCLENBQUMsQ0FBQztJQUNILENBQUMsTUFBTSxJQUFJakQsY0FBYyxFQUFFO01BQzFCLE9BQU8sSUFBSTZDLE9BQU8sQ0FBQyxVQUFVQyxPQUFPLEVBQUU7UUFDckMsSUFBTTdILFFBQVEsR0FBR21FLG1CQUFtQixDQUFDLENBQUMsQ0FBQztRQUN2QyxJQUFJbkUsUUFBUSxDQUFDc0ssZ0JBQWdCLElBQUlqTixZQUFZLENBQUN5SSxPQUFPLENBQUM5RixRQUFRLENBQUNzSyxnQkFBZ0IsQ0FBQ0MsZUFBZSxDQUFDbEUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7VUFDaEhoSixZQUFZLENBQUM0SCxJQUFJLENBQUNqRixRQUFRLENBQUNzSyxnQkFBZ0IsQ0FBQ0MsZUFBZSxDQUFDbEUsT0FBTyxDQUFDO1VBQ3BFLElBQUltRSxtQkFBbUIsR0FBRyxjQUFjO1VBQ3hDLElBQU1DLGlCQUFpQixHQUFHeEosb0JBQW9CLENBQUNqQixRQUFRLEVBQUUsSUFBSSxDQUFDO1VBQzlELElBQUl5SyxpQkFBaUIsRUFBRTtZQUN0QkQsbUJBQW1CLGlCQUFVQyxpQkFBaUIsY0FBVztVQUMxRDtVQUNBLElBQUk3RCxxQkFBcUIsSUFBSUEscUJBQXFCLENBQUNzQixvQkFBb0IsRUFBRTtZQUN4RXRCLHFCQUFxQixDQUFDc0Isb0JBQW9CLENBQUNsSSxRQUFRLENBQUM7VUFDckQ7VUFDQSxJQUFJQSxRQUFRLENBQUMyRyxPQUFPLEVBQUUsS0FBSyxLQUFLLElBQUkzRyxRQUFRLENBQUMwSyxpQkFBaUIsRUFBRSxLQUFLbkksU0FBUyxFQUFFO1lBQy9FaUksbUJBQW1CLGFBQU1BLG1CQUFtQixHQUFHeEssUUFBUSxDQUFDMEssaUJBQWlCLEVBQUUsZUFBSzFLLFFBQVEsQ0FBQzJLLFVBQVUsRUFBRSxtQkFBZ0I7VUFDdEgsQ0FBQyxNQUFNO1lBQ05ILG1CQUFtQixhQUFNQSxtQkFBbUIsR0FBR3hLLFFBQVEsQ0FBQzJLLFVBQVUsRUFBRSxtQkFBZ0I7VUFDckY7VUFDQSxJQUFNQyxhQUFrQixHQUFHLElBQUlDLGFBQWEsQ0FBQztZQUM1Q0MsUUFBUSxFQUFFTjtVQUNYLENBQUMsQ0FBQztVQUNGTyxVQUFVLENBQUNDLEtBQUssQ0FBQ0osYUFBYSxFQUFFO1lBQy9CSyxPQUFPLEVBQUUsWUFBWTtjQUNwQjVOLFlBQVksR0FBRyxFQUFFO2NBQ2pCLElBQUkyRyxvQkFBb0IsRUFBRTtnQkFDekJrSCw2QkFBNkIsRUFBRTtjQUNoQztjQUNBbEssK0JBQStCLEVBQUU7Y0FDakM2RyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ2Q7VUFDRCxDQUFDLENBQUM7UUFDSDtNQUNELENBQUMsQ0FBQztJQUNILENBQUMsTUFBTTtNQUNOLE9BQU9ELE9BQU8sQ0FBQ0MsT0FBTyxDQUFDLElBQUksQ0FBQztJQUM3QjtFQUNEO0VBQ0EsU0FBU2tDLGlDQUFpQyxDQUFDekYsZ0JBQXFCLEVBQUU7SUFDakUsSUFBTTVFLGVBQWUsR0FBRzJCLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsYUFBYSxDQUFDO0lBQ3BFLFFBQVFnRCxnQkFBZ0I7TUFDdkIsS0FBSyxPQUFPO1FBQ1gsT0FBTzVFLGVBQWUsQ0FBQ1csT0FBTyxDQUFDLGdEQUFnRCxDQUFDO01BQ2pGLEtBQUssYUFBYTtRQUNqQixPQUFPWCxlQUFlLENBQUNXLE9BQU8sQ0FBQyx5REFBeUQsQ0FBQztNQUMxRixLQUFLLFNBQVM7UUFDYixPQUFPWCxlQUFlLENBQUNXLE9BQU8sQ0FBQyw0REFBNEQsQ0FBQztNQUM3RixLQUFLLFNBQVM7UUFDYixPQUFPWCxlQUFlLENBQUNXLE9BQU8sQ0FBQyw0REFBNEQsQ0FBQztNQUM3RjtRQUNDLE9BQU9YLGVBQWUsQ0FBQ1csT0FBTyxDQUFDLG9EQUFvRCxDQUFDO0lBQUM7RUFFeEY7RUFDQSxTQUFTVywrQkFBK0IsR0FBRztJQUMxQ21LLHdCQUF3QixDQUFDLEtBQUssQ0FBQztFQUNoQztFQUNBLFNBQVNELDZCQUE2QixDQUFDRSxnQkFBeUIsRUFBRTtJQUNqRUQsd0JBQXdCLENBQUMsSUFBSSxFQUFFQyxnQkFBZ0IsQ0FBQztFQUNqRDtFQUVBLFNBQVNDLDJCQUEyQixDQUFDQyxhQUFrQixFQUFFRixnQkFBeUIsRUFBRTtJQUNuRixJQUFJQSxnQkFBZ0IsS0FBSzdJLFNBQVMsRUFBRTtNQUNuQyxPQUFPK0ksYUFBYSxDQUFDekwsU0FBUyxDQUFDLEdBQUcsQ0FBQztJQUNwQztJQUNBLElBQU0wTCxXQUFXLEdBQUdELGFBQWEsQ0FBQ3ZFLFFBQVEsQ0FBQyxHQUFHLENBQUM7SUFFL0N3RSxXQUFXLENBQUMvRCxNQUFNLENBQ2pCLElBQUkvQyxNQUFNLENBQUM7TUFDVmhDLElBQUksRUFBRSxRQUFRO01BQ2RpQyxRQUFRLEVBQUVDLGNBQWMsQ0FBQzZHLFVBQVU7TUFDbkMzRyxNQUFNLEVBQUV1RztJQUNULENBQUMsQ0FBQyxDQUNGO0lBRUQsT0FBT0csV0FBVyxDQUFDdEUsa0JBQWtCLEVBQUUsQ0FBQ3dFLEdBQUcsQ0FBQyxVQUFVMUgsUUFBYSxFQUFFO01BQ3BFLE9BQU9BLFFBQVEsQ0FBQ2xFLFNBQVMsRUFBRTtJQUM1QixDQUFDLENBQUM7RUFDSDtFQUNBLFNBQVN1RSxXQUFXLEdBQStGO0lBQUEsSUFBOUZzSCxjQUF1Qix1RUFBRyxLQUFLO0lBQUEsSUFBRUMsZUFBd0IsdUVBQUcsS0FBSztJQUFBLElBQUVQLGdCQUF5QjtJQUNoSCxJQUFJOUwsQ0FBQztJQUNMLElBQU1HLGVBQWUsR0FBRzRCLElBQUksQ0FBQ2dELGlCQUFpQixFQUFFO01BQy9DaUgsYUFBYSxHQUFHN0wsZUFBZSxDQUFDRyxlQUFlLEVBQUU7TUFDakRGLGVBQWUsR0FBRzJCLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsYUFBYSxDQUFDO01BQzlENkMsbUJBQW1CLEdBQUcsRUFBRTtJQUN6QixJQUFJdkYsU0FBZ0IsR0FBRyxFQUFFO0lBQ3pCLElBQUk4TSxjQUFjLElBQUlDLGVBQWUsSUFBSVAsZ0JBQWdCLEVBQUU7TUFDMUR4TSxTQUFTLEdBQUd5TSwyQkFBMkIsQ0FBQ0MsYUFBYSxFQUFFRixnQkFBZ0IsQ0FBQztJQUN6RSxDQUFDLE1BQU07TUFDTnhNLFNBQVMsR0FBRzBNLGFBQWEsQ0FBQ3pMLFNBQVMsQ0FBQyxHQUFHLENBQUM7SUFDekM7SUFDQSxLQUFLUCxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdWLFNBQVMsQ0FBQ0ksTUFBTSxFQUFFTSxDQUFDLEVBQUUsRUFBRTtNQUN0QyxJQUNDLENBQUMsQ0FBQ3FNLGVBQWUsSUFBSS9NLFNBQVMsQ0FBQ1UsQ0FBQyxDQUFDLENBQUNpSCxVQUFVLE1BQzFDbUYsY0FBYyxJQUFJOU0sU0FBUyxDQUFDVSxDQUFDLENBQUMsQ0FBQ2tCLE1BQU0sS0FBSyxFQUFFLElBQU0sQ0FBQ2tMLGNBQWMsS0FBSyxDQUFDOU0sU0FBUyxDQUFDVSxDQUFDLENBQUMsQ0FBQ2tCLE1BQU0sSUFBSTVCLFNBQVMsQ0FBQ1UsQ0FBQyxDQUFDLENBQUNrQixNQUFNLEtBQUssRUFBRSxDQUFFLENBQUMsRUFDNUg7UUFDRDJELG1CQUFtQixDQUFDYyxJQUFJLENBQUNyRyxTQUFTLENBQUNVLENBQUMsQ0FBQyxDQUFDO01BQ3ZDO0lBQ0Q7SUFFQSxLQUFLQSxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUc2RSxtQkFBbUIsQ0FBQ25GLE1BQU0sRUFBRU0sQ0FBQyxFQUFFLEVBQUU7TUFDaEQsSUFDQzZFLG1CQUFtQixDQUFDN0UsQ0FBQyxDQUFDLENBQUM2RyxJQUFJLEtBQUssS0FBSyxJQUNyQ2hDLG1CQUFtQixDQUFDN0UsQ0FBQyxDQUFDLENBQUMrRyxPQUFPLEtBQUssRUFBRSxJQUNyQ2xDLG1CQUFtQixDQUFDN0UsQ0FBQyxDQUFDLENBQUMrRyxPQUFPLENBQUNQLE9BQU8sQ0FBQ3BHLGVBQWUsQ0FBQ1csT0FBTyxDQUFDLDZDQUE2QyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDcEg7UUFDRDhELG1CQUFtQixDQUFDN0UsQ0FBQyxDQUFDLENBQUMrRyxPQUFPLGVBQVEzRyxlQUFlLENBQUNXLE9BQU8sQ0FBQyw2Q0FBNkMsQ0FBQyxTQUMzRzhELG1CQUFtQixDQUFDN0UsQ0FBQyxDQUFDLENBQUMrRyxPQUFPLENBQzdCO01BQ0g7SUFDRDtJQUNBO0lBQ0EsSUFBTXVGLGVBQW9CLEdBQUcsRUFBRTtJQUMvQixLQUFLdE0sQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHNkUsbUJBQW1CLENBQUNuRixNQUFNLEVBQUVNLENBQUMsRUFBRSxFQUFFO01BQ2hELElBQ0U2RSxtQkFBbUIsQ0FBQzdFLENBQUMsQ0FBQyxDQUFDZ0wsZ0JBQWdCLEtBQ3JDbkcsbUJBQW1CLENBQUM3RSxDQUFDLENBQUMsQ0FBQ2dMLGdCQUFnQixDQUFDQyxlQUFlLEtBQUtoSSxTQUFTLElBQ3RFNEIsbUJBQW1CLENBQUM3RSxDQUFDLENBQUMsQ0FBQ2dMLGdCQUFnQixDQUFDQyxlQUFlLEtBQUssSUFBSSxJQUMvRHBHLG1CQUFtQixDQUFDN0UsQ0FBQyxDQUFDLENBQUNnTCxnQkFBZ0IsQ0FBQ25LLFVBQVUsS0FBS29DLFNBQVMsSUFDaEU0QixtQkFBbUIsQ0FBQzdFLENBQUMsQ0FBQyxDQUFDZ0wsZ0JBQWdCLENBQUNuSyxVQUFVLEtBQUssSUFBSyxDQUFDLElBQ2hFZ0UsbUJBQW1CLENBQUM3RSxDQUFDLENBQUMsQ0FBQzZHLElBQUksRUFDMUI7UUFDRHlGLGVBQWUsQ0FBQzNHLElBQUksQ0FBQ2QsbUJBQW1CLENBQUM3RSxDQUFDLENBQUMsQ0FBQztNQUM3QztJQUNEO0lBQ0EsT0FBT3NNLGVBQWU7RUFDdkI7RUFDQSxTQUFTVCx3QkFBd0IsQ0FBQ08sY0FBbUIsRUFBRU4sZ0JBQXlCLEVBQUU7SUFDakYsSUFBTVMsb0JBQW9CLEdBQUd6SCxXQUFXLENBQUNzSCxjQUFjLEVBQUUsSUFBSSxFQUFFTixnQkFBZ0IsQ0FBQztJQUVoRixJQUFJUyxvQkFBb0IsQ0FBQzdNLE1BQU0sR0FBRyxDQUFDLEVBQUU7TUFDcENxQyxJQUFJLENBQUNnRCxpQkFBaUIsRUFBRSxDQUFDL0QsY0FBYyxDQUFDdUwsb0JBQW9CLENBQUM7SUFDOUQ7RUFDRDtFQUNBO0VBQ0EsU0FBU0Msa0JBQWtCLENBQUNDLE1BQVcsRUFBRUMsU0FBZ0IsRUFBRTNGLE9BQVksRUFBRTtJQUN4RSxJQUFNNEYsY0FBYyxHQUFHRixNQUFNLENBQUNuRyxTQUFTLEVBQUUsQ0FBQ3NHLG1CQUFtQixFQUFFO0lBQy9ELElBQU1DLFlBQVksR0FBR0gsU0FBUyxDQUFDSSxJQUFJLENBQUMsVUFBVXJJLFFBQWEsRUFBRTtNQUM1RCxPQUFPc0MsT0FBTyxDQUFDZ0csU0FBUyxFQUFFLENBQUN2RyxPQUFPLENBQUMvQixRQUFRLENBQUN1SSxPQUFPLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUM5RCxDQUFDLENBQUM7SUFDRmpHLE9BQU8sQ0FBQ2tHLGNBQWMsR0FBR0osWUFBWSxHQUFHQSxZQUFZLENBQUN0TSxTQUFTLEVBQUUsQ0FBQ29NLGNBQWMsQ0FBQyxHQUFHMUosU0FBUztFQUM3Rjs7RUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxJQUFNaUssZUFBb0MsR0FBRztJQUM1Q3BJLFdBQVcsRUFBRUEsV0FBVztJQUN4QlAsbUJBQW1CLEVBQUVBLG1CQUFtQjtJQUN4QzdDLCtCQUErQixFQUFFQSwrQkFBK0I7SUFDaEVrSyw2QkFBNkIsRUFBRUEsNkJBQTZCO0lBQzVEeEUsc0JBQXNCLEVBQUVsSCx3QkFBd0I7SUFDaER5QixvQkFBb0IsRUFBRUEsb0JBQW9CO0lBQzFDaUIsMkJBQTJCLEVBQUVBLDJCQUEyQjtJQUN4RDRKLGtCQUFrQixFQUFFQTtFQUNyQixDQUFDO0VBQUMsT0FFYVUsZUFBZTtBQUFBIn0=