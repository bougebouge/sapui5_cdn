import Bar from "sap/m/Bar";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import FormattedText from "sap/m/FormattedText";
import MessageBox from "sap/m/MessageBox";
import MessageItem from "sap/m/MessageItem";
import MessageToast from "sap/m/MessageToast";
import MessageView from "sap/m/MessageView";
import Text from "sap/m/Text";
import type ManagedObject from "sap/ui/base/ManagedObject";
import Core from "sap/ui/core/Core";
import DateFormat from "sap/ui/core/format/DateFormat";
import IconPool from "sap/ui/core/IconPool";
import CoreLib from "sap/ui/core/library";
import Message from "sap/ui/core/message/Message";
import type Control from "sap/ui/mdc/Control";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";

const MessageType = CoreLib.MessageType;
let aMessageList: any[] = [];
let aMessageDataList: any[] = [];
let aResolveFunctions: any[] = [];
let oDialog: Dialog;
let oBackButton: Button;
let oMessageView: MessageView;

export type messageHandlingType = {
	getMessages: (bBoundMessages?: any, bTransitionOnly?: any) => any[];
	showUnboundMessages: (
		aCustomMessages?: any[],
		oContext?: any,
		bShowBoundTransition?: boolean,
		concurrentEditFlag?: boolean,
		bOnlyForTest?: boolean,
		onBeforeShowMessage?: (messages: any, showMessageParameters: any) => any
	) => Promise<any>;
	removeUnboundTransitionMessages: () => void;
	modifyETagMessagesOnly: (oMessageManager: any, oResourceBundle: any, concurrentEditFlag: boolean | undefined) => boolean;
	removeBoundTransitionMessages: (sPathToBeRemoved?: string) => void;
	getRetryAfterMessage: (oMessage: any, bMessageDialog?: any) => any;
	prepareMessageViewForDialog: (oMessageDialogModel: JSONModel, bStrictHandlingFlow: boolean, isMulti412?: boolean) => any;
	setMessageSubtitle: (oTable: any, aContexts: any[], message: any) => any;
};

function fnFormatTechnicalDetails() {
	let sPreviousGroupName: string;

	// Insert technical detail if it exists
	function insertDetail(oProperty: any) {
		return oProperty.property
			? "( ${" +
					oProperty.property +
					'} ? ("<p>' +
					oProperty.property.substr(Math.max(oProperty.property.lastIndexOf("/"), oProperty.property.lastIndexOf(".")) + 1) +
					' : " + ' +
					"${" +
					oProperty.property +
					'} + "</p>") : "" )'
			: "";
	}
	// Insert groupname if it exists
	function insertGroupName(oProperty: any) {
		let sHTML = "";
		if (oProperty.groupName && oProperty.property && oProperty.groupName !== sPreviousGroupName) {
			sHTML += "( ${" + oProperty.property + '} ? "<br><h3>' + oProperty.groupName + '</h3>" : "" ) + ';
			sPreviousGroupName = oProperty.groupName;
		}
		return sHTML;
	}

	// List of technical details to be shown
	function getPaths() {
		const sTD = "technicalDetails"; // name of property in message model data for technical details
		return [
			{ "groupName": "", "property": `${sTD}/status` },
			{ "groupName": "", "property": `${sTD}/statusText` },
			{ "groupName": "Application", "property": `${sTD}/error/@SAP__common.Application/ComponentId` },
			{ "groupName": "Application", "property": `${sTD}/error/@SAP__common.Application/ServiceId` },
			{ "groupName": "Application", "property": `${sTD}/error/@SAP__common.Application/ServiceRepository` },
			{ "groupName": "Application", "property": `${sTD}/error/@SAP__common.Application/ServiceVersion` },
			{ "groupName": "ErrorResolution", "property": `${sTD}/error/@SAP__common.ErrorResolution/Analysis` },
			{ "groupName": "ErrorResolution", "property": `${sTD}/error/@SAP__common.ErrorResolution/Note` },
			{ "groupName": "ErrorResolution", "property": `${sTD}/error/@SAP__common.ErrorResolution/DetailedNote` },
			{ "groupName": "ErrorResolution", "property": `${sTD}/error/@SAP__common.ExceptionCategory` },
			{ "groupName": "ErrorResolution", "property": `${sTD}/error/@SAP__common.TimeStamp` },
			{ "groupName": "ErrorResolution", "property": `${sTD}/error/@SAP__common.TransactionId` },
			{ "groupName": "Messages", "property": `${sTD}/error/code` },
			{ "groupName": "Messages", "property": `${sTD}/error/message` }
		];
	}

	let sHTML = "Object.keys(" + "${technicalDetails}" + ').length > 0 ? "<h2>Technical Details</h2>" : "" ';
	getPaths().forEach(function (oProperty: { groupName: string; property: string }) {
		sHTML = `${sHTML + insertGroupName(oProperty)}${insertDetail(oProperty)} + `;
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
function fnGetHighestMessagePriority(aMessages: any[]) {
	let sMessagePriority = MessageType.None;
	const iLength = aMessages.length;
	const oMessageCount: any = { Error: 0, Warning: 0, Success: 0, Information: 0 };

	for (let i = 0; i < iLength; i++) {
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
function fnModifyETagMessagesOnly(oMessageManager: any, oResourceBundle: any, concurrentEditFlag: boolean | undefined) {
	const aMessages = oMessageManager.getMessageModel().getObject("/");
	let bMessagesModified = false;
	let sEtagMessage = "";
	aMessages.forEach(function (oMessage: any, i: any) {
		const oTechnicalDetails = oMessage.getTechnicalDetails && oMessage.getTechnicalDetails();
		if (oTechnicalDetails && oTechnicalDetails.httpStatus === 412) {
			if (oTechnicalDetails.isConcurrentModification && concurrentEditFlag) {
				sEtagMessage =
					sEtagMessage || oResourceBundle.getText("C_APP_COMPONENT_SAPFE_ETAG_TECHNICAL_ISSUES_CONCURRENT_MODIFICATION");
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
	const oMessageDialogModel: any = oMessageView.getModel();
	if (oMessageDialogModel) {
		oMessageDialogModel.setData({});
	}
	removeUnboundTransitionMessages();
}
function getRetryAfterMessage(oMessage: any, bMessageDialog?: any) {
	const dNow = new Date();
	const oTechnicalDetails = oMessage.getTechnicalDetails();
	const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
	let sRetryAfterMessage;
	if (oTechnicalDetails && oTechnicalDetails.httpStatus === 503 && oTechnicalDetails.retryAfter) {
		const dRetryAfter = oTechnicalDetails.retryAfter;
		let oDateFormat;
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
				sRetryAfterMessage = `${oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_TITLE")} ${oResourceBundle.getText(
					"C_MESSAGE_HANDLING_SAPFE_503_DESC"
				)}`;
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

function prepareMessageViewForDialog(oMessageDialogModel: JSONModel, bStrictHandlingFlow: boolean, multi412?: boolean) {
	let oMessageTemplate: MessageItem;
	if (!bStrictHandlingFlow) {
		oMessageTemplate = new MessageItem(undefined, {
			counter: { path: "counter" },
			title: "{message}",
			subtitle: "{additionalText}",
			longtextUrl: "{descriptionUrl}",
			type: { path: "type" },
			description:
				"{= ${" +
				"description} || ${technicalDetails} ? " +
				'"<html><body>" + ' +
				fnFormatDescription() +
				" + " +
				fnFormatTechnicalDetails() +
				'"</body></html>"' +
				' : "" }',
			markupDescription: true
		});
	} else if (multi412) {
		oMessageTemplate = new MessageItem(undefined, {
			counter: { path: "counter" },
			title: "{message}",
			subtitle: "{additionalText}",
			longtextUrl: "{descriptionUrl}",
			type: { path: "type" },
			description: "{description}",
			markupDescription: true
		});
	} else {
		oMessageTemplate = new MessageItem({
			title: "{message}",
			type: { path: "type" },
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
	oBackButton =
		oBackButton ||
		new Button({
			icon: IconPool.getIconURI("nav-back"),
			visible: false,
			press: function (this: Button) {
				oMessageView.navigateBack();
				this.setVisible(false);
			}
		});
	// Update proper ETag Mismatch error
	oMessageView.setModel(oMessageDialogModel);
	return {
		oMessageView,
		oBackButton
	};
}

function showUnboundMessages(
	this: messageHandlingType,
	aCustomMessages?: any[],
	oContext?: any,
	bShowBoundTransition?: boolean,
	concurrentEditFlag?: boolean,
	bOnlyForTest?: boolean,
	onBeforeShowMessage?: (messages: any, showMessageParameters: any) => any
): Promise<any> {
	let aTransitionMessages = this.getMessages();
	const oMessageManager = Core.getMessageManager();
	let sHighestPriority;
	let sHighestPriorityText;
	const aFilters = [new Filter({ path: "persistent", operator: FilterOperator.NE, value1: false })];
	let showMessageDialog: boolean | undefined = false,
		showMessageBox: boolean | undefined = false;

	if (bShowBoundTransition) {
		aTransitionMessages = aTransitionMessages.concat(getMessages(true, true));
		// we only want to show bound transition messages not bound state messages hence add a filter for the same
		aFilters.push(new Filter({ path: "persistent", operator: FilterOperator.EQ, value1: true }));
		const fnCheckControlIdInDialog = function (aControlIds: any) {
			let index = Infinity,
				oControl = Core.byId(aControlIds[0]) as ManagedObject;
			const errorFieldControl = Core.byId(aControlIds[0]) as Control;
			while (oControl) {
				const fieldRankinDialog =
					oControl instanceof Dialog
						? (errorFieldControl.getParent() as any).findElements(true).indexOf(errorFieldControl)
						: Infinity;
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
		aFilters.push(
			new Filter({
				path: "controlIds",
				test: fnCheckControlIdInDialog,
				caseSensitive: true
			})
		);
	} else {
		// only unbound messages have to be shown so add filter accordingly
		aFilters.push(new Filter({ path: "target", operator: FilterOperator.EQ, value1: "" }));
	}
	if (aCustomMessages && aCustomMessages.length) {
		aCustomMessages.forEach(function (oMessage: any) {
			const messageCode = oMessage.code ? oMessage.code : "";
			oMessageManager.addMessages(
				new Message({
					message: oMessage.text,
					type: oMessage.type,
					target: "",
					persistent: true,
					code: messageCode
				})
			);
			//The target and persistent properties of the message are hardcoded as "" and true because the function deals with only unbound messages.
		});
	}
	const oMessageDialogModel = (oMessageView && (oMessageView.getModel() as JSONModel)) || new JSONModel();
	const bHasEtagMessage = this.modifyETagMessagesOnly(oMessageManager, Core.getLibraryResourceBundle("sap.fe.core"), concurrentEditFlag);

	if (aTransitionMessages.length === 1 && aTransitionMessages[0].getCode() === "503") {
		showMessageBox = true;
	} else if (aTransitionMessages.length !== 0) {
		showMessageDialog = true;
	}
	let showMessageParameters: any;
	let aModelDataArray: any[] = [];
	if (showMessageDialog || (!showMessageBox && !onBeforeShowMessage)) {
		const oListBinding = oMessageManager.getMessageModel().bindList("/", undefined, undefined, aFilters),
			aCurrentContexts = oListBinding.getCurrentContexts();
		if (aCurrentContexts && aCurrentContexts.length > 0) {
			showMessageDialog = true;
			// Don't show dialog incase there are no errors to show

			// if false, show messages in dialog
			// As fitering has already happened here hence
			// using the message model again for the message dialog view and then filtering on that binding again is unnecessary.
			// So we create new json model to use for the message dialog view.
			const aMessages: any[] = [];
			aCurrentContexts.forEach(function (currentContext: any) {
				const oMessage = currentContext.getObject();
				aMessages.push(oMessage);
				aMessageDataList = aMessages;
			});
			// if(aMessages.length === 0 && aMessageList.length) {
			// 	oMessageDialogModel.setData(aMessages);
			// }
			let existingMessages: any[] = [];
			if (Array.isArray(oMessageDialogModel.getData())) {
				existingMessages = oMessageDialogModel.getData();
			}
			const oUniqueObj: any = {};

			aModelDataArray = aMessageDataList.concat(existingMessages).filter(function (obj) {
				// remove entries having duplicate message ids
				return !oUniqueObj[obj.id] && (oUniqueObj[obj.id] = true);
			});
		}
	}

	if (onBeforeShowMessage) {
		showMessageParameters = { showMessageBox, showMessageDialog };
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
		return new Promise<void>((resolve) => {
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
		return new Promise(function (resolve: (value: any) => void, reject: (reason?: any) => void) {
			aResolveFunctions.push(resolve);
			Core.getLibraryResourceBundle("sap.fe.core", true)
				.then(function (oResourceBundle: any) {
					const bStrictHandlingFlow = false;
					if (showMessageParameters && showMessageParameters.fnGetMessageSubtitle) {
						oMessageDialogModel.getData().forEach(function (oMessage: any) {
							showMessageParameters.fnGetMessageSubtitle(oMessage);
						});
					}
					const oMessageObject = prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow);
					oDialog =
						oDialog && oDialog.isOpen()
							? oDialog
							: new Dialog({
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
										contentMiddle: [
											new Text({
												text: oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE")
											})
										],
										contentLeft: [oBackButton]
									}),
									contentWidth: "37.5em",
									contentHeight: "21.5em",
									verticalScrolling: false,
									afterClose: function () {
										for (let i = 0; i < aResolveFunctions.length; i++) {
											aResolveFunctions[i].call();
										}
										aResolveFunctions = [];
									}
							  });
					oDialog.removeAllContent();
					oDialog.addContent(oMessageObject.oMessageView);

					if (bHasEtagMessage) {
						sap.ui.require(["sap/m/ButtonType"], function (ButtonType: any) {
							oDialog.setBeginButton(
								new Button({
									press: function () {
										dialogCloseHandler();
										if (oContext.hasPendingChanges()) {
											oContext.getBinding().resetChanges();
										}
										oContext.refresh();
									},
									text: oResourceBundle.getText("C_COMMON_SAPFE_REFRESH"),
									type: ButtonType.Emphasized
								})
							);
						});
					} else {
						oDialog.destroyBeginButton();
					}
					sHighestPriority = fnGetHighestMessagePriority(oMessageView.getItems());
					sHighestPriorityText = getTranslatedTextForMessageDialog(sHighestPriority);
					oDialog.setState(sHighestPriority);
					(oDialog.getCustomHeader() as any).getContentMiddle()[0].setText(sHighestPriorityText);
					oMessageView.navigateBack();
					oDialog.open();
					if (bOnlyForTest) {
						resolve(oDialog);
					}
				})
				.catch(reject);
		});
	} else if (showMessageBox) {
		return new Promise(function (resolve) {
			const oMessage = aTransitionMessages[0];
			if (oMessage.technicalDetails && aMessageList.indexOf(oMessage.technicalDetails.originalMessage.message) === -1) {
				aMessageList.push(oMessage.technicalDetails.originalMessage.message);
				let formattedTextString = "<html><body>";
				const retryAfterMessage = getRetryAfterMessage(oMessage, true);
				if (retryAfterMessage) {
					formattedTextString = `<h6>${retryAfterMessage}</h6><br>`;
				}
				if (showMessageParameters && showMessageParameters.fnGetMessageSubtitle) {
					showMessageParameters.fnGetMessageSubtitle(oMessage);
				}
				if (oMessage.getCode() !== "503" && oMessage.getAdditionalText() !== undefined) {
					formattedTextString = `${formattedTextString + oMessage.getAdditionalText()}: ${oMessage.getMessage()}</html></body>`;
				} else {
					formattedTextString = `${formattedTextString + oMessage.getMessage()}</html></body>`;
				}
				const formattedText: any = new FormattedText({
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
function getTranslatedTextForMessageDialog(sHighestPriority: any) {
	const oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
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
function removeBoundTransitionMessages(sPathToBeRemoved?: string) {
	removeTransitionMessages(true, sPathToBeRemoved);
}

function getMessagesFromMessageModel(oMessageModel: any, sPathToBeRemoved?: string) {
	if (sPathToBeRemoved === undefined) {
		return oMessageModel.getObject("/");
	}
	const listBinding = oMessageModel.bindList("/");

	listBinding.filter(
		new Filter({
			path: "target",
			operator: FilterOperator.StartsWith,
			value1: sPathToBeRemoved
		})
	);

	return listBinding.getCurrentContexts().map(function (oContext: any) {
		return oContext.getObject();
	});
}
function getMessages(bBoundMessages: boolean = false, bTransitionOnly: boolean = false, sPathToBeRemoved?: string) {
	let i;
	const oMessageManager = Core.getMessageManager(),
		oMessageModel = oMessageManager.getMessageModel(),
		oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
		aTransitionMessages = [];
	let aMessages: any[] = [];
	if (bBoundMessages && bTransitionOnly && sPathToBeRemoved) {
		aMessages = getMessagesFromMessageModel(oMessageModel, sPathToBeRemoved);
	} else {
		aMessages = oMessageModel.getObject("/");
	}
	for (i = 0; i < aMessages.length; i++) {
		if (
			(!bTransitionOnly || aMessages[i].persistent) &&
			((bBoundMessages && aMessages[i].target !== "") || (!bBoundMessages && (!aMessages[i].target || aMessages[i].target === "")))
		) {
			aTransitionMessages.push(aMessages[i]);
		}
	}

	for (i = 0; i < aTransitionMessages.length; i++) {
		if (
			aTransitionMessages[i].code === "503" &&
			aTransitionMessages[i].message !== "" &&
			aTransitionMessages[i].message.indexOf(oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_BACKEND_PREFIX")) === -1
		) {
			aTransitionMessages[i].message = `\n${oResourceBundle.getText("C_MESSAGE_HANDLING_SAPFE_503_BACKEND_PREFIX")}${
				aTransitionMessages[i].message
			}`;
		}
	}
	//Filtering messages again here to avoid showing pure technical messages raised by the model
	const backendMessages: any = [];
	for (i = 0; i < aTransitionMessages.length; i++) {
		if (
			(aTransitionMessages[i].technicalDetails &&
				((aTransitionMessages[i].technicalDetails.originalMessage !== undefined &&
					aTransitionMessages[i].technicalDetails.originalMessage !== null) ||
					(aTransitionMessages[i].technicalDetails.httpStatus !== undefined &&
						aTransitionMessages[i].technicalDetails.httpStatus !== null))) ||
			aTransitionMessages[i].code
		) {
			backendMessages.push(aTransitionMessages[i]);
		}
	}
	return backendMessages;
}
function removeTransitionMessages(bBoundMessages: any, sPathToBeRemoved?: string) {
	const aMessagesToBeDeleted = getMessages(bBoundMessages, true, sPathToBeRemoved);

	if (aMessagesToBeDeleted.length > 0) {
		Core.getMessageManager().removeMessages(aMessagesToBeDeleted);
	}
}
//TODO: This must be moved out of message handling
function setMessageSubtitle(oTable: any, aContexts: any[], message: any) {
	const subtitleColumn = oTable.getParent().getIdentifierColumn();
	const errorContext = aContexts.find(function (oContext: any) {
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
const messageHandling: messageHandlingType = {
	getMessages: getMessages,
	showUnboundMessages: showUnboundMessages,
	removeUnboundTransitionMessages: removeUnboundTransitionMessages,
	removeBoundTransitionMessages: removeBoundTransitionMessages,
	modifyETagMessagesOnly: fnModifyETagMessagesOnly,
	getRetryAfterMessage: getRetryAfterMessage,
	prepareMessageViewForDialog: prepareMessageViewForDialog,
	setMessageSubtitle: setMessageSubtitle
};

export default messageHandling;
