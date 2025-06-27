import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Bar from "sap/m/Bar";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import MessageBox from "sap/m/MessageBox";
import Title from "sap/m/Title";
import Message from "sap/ui/core/message/Message";
import JSONModel from "sap/ui/model/json/JSONModel";
import CommonUtils from "./CommonUtils";
import MessageHandler from "./controllerextensions/MessageHandler";
import messageHandling from "./controllerextensions/messageHandler/messageHandling";
import { MessageType } from "./formatters/TableFormatterTypes";

function renderMessageView(
	mParameters: any,
	oResourceBundle: ResourceBundle,
	messageHandler: MessageHandler | undefined,
	aMessages: Message[],
	isMultiContext412?: boolean,
	resolve?: any,
	sGroupId?: string
) {
	const sActionName = mParameters.label;
	const oModel = mParameters.model,
		sCancelButtonTxt = CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP", oResourceBundle);
	const strictHandlingPromises = mParameters?.internalModelContext?.getProperty("strictHandlingPromises");
	let sMessage: string;
	if (aMessages.length === 1) {
		const messageText = aMessages[0].getMessage();
		const identifierText = aMessages[0].getAdditionalText();
		if (!isMultiContext412) {
			sMessage = `${messageText}\n${CommonUtils.getTranslatedText("PROCEED", oResourceBundle)}`;
		} else if (identifierText !== undefined && identifierText !== "") {
			const sHeaderInfoTypeName = mParameters.control.getParent().getTableDefinition().headerInfoTypeName;
			if (sHeaderInfoTypeName) {
				sMessage = `${sHeaderInfoTypeName} ${identifierText}: ${messageText}\n\n${CommonUtils.getTranslatedText(
					"C_COMMON_DIALOG_SKIP_SINGLE_MESSAGE_TEXT",
					oResourceBundle
				)}`;
			} else {
				sMessage = `${identifierText}: ${messageText}\n\n${CommonUtils.getTranslatedText(
					"C_COMMON_DIALOG_SKIP_SINGLE_MESSAGE_TEXT",
					oResourceBundle
				)}`;
			}
		} else {
			sMessage = `${messageText}\n\n${CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP_SINGLE_MESSAGE_TEXT", oResourceBundle)}`;
		}
		MessageBox.warning(sMessage, {
			title: CommonUtils.getTranslatedText("WARNING", oResourceBundle),
			actions: [sActionName, sCancelButtonTxt],
			emphasizedAction: sActionName,
			onClose: function (sAction: string) {
				if (sAction === sActionName) {
					if (!isMultiContext412) {
						resolve(true);
						oModel.submitBatch(sGroupId);
						if (mParameters.requestSideEffects) {
							mParameters.requestSideEffects();
						}
					} else {
						strictHandlingPromises.forEach(function (sHPromise: any) {
							sHPromise.resolve(true);
							oModel.submitBatch(sHPromise.groupId);
							if (sHPromise.requestSideEffects) {
								sHPromise.requestSideEffects();
							}
						});
						const strictHandlingFails = mParameters?.internalModelContext?.getProperty("strictHandlingFails");
						if (strictHandlingFails.length > 0) {
							messageHandler?.removeTransitionMessages();
						}
					}
					mParameters?.internalModelContext?.setProperty("412Executed", true);
				} else {
					mParameters?.internalModelContext?.setProperty("412Executed", false);
					if (!isMultiContext412) {
						resolve(false);
					} else {
						strictHandlingPromises.forEach(function (sHPromise: any) {
							sHPromise.resolve(false);
						});
					}
				}
				mParameters?.internalModelContext?.setProperty("412Messages", []);
			}
		});
	} else if (aMessages.length > 1) {
		if (isMultiContext412) {
			const genericMessage = new Message({
				message: CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP_MESSAGES_WARNING", oResourceBundle),
				type: MessageType.Warning,
				target: undefined,
				persistent: true,
				description: CommonUtils.getTranslatedText("C_COMMON_DIALOG_SKIP_MESSAGES_TEXT", oResourceBundle, sActionName)
			});
			aMessages = [genericMessage].concat(aMessages);
		}
		const oMessageDialogModel = new JSONModel();
		oMessageDialogModel.setData(aMessages);
		const bStrictHandlingFlow = true;
		const oMessageObject = messageHandling.prepareMessageViewForDialog(oMessageDialogModel, bStrictHandlingFlow, isMultiContext412);
		const oDialog = new Dialog({
			resizable: true,
			content: oMessageObject.oMessageView,
			state: "Warning",
			customHeader: new Bar({
				contentLeft: [oMessageObject.oBackButton],
				contentMiddle: [new Title({ text: "Warning" })]
			}),
			contentHeight: "50%",
			contentWidth: "50%",
			verticalScrolling: false
		});
		oDialog.setBeginButton(
			new Button({
				press: function () {
					if (!isMultiContext412) {
						resolve(true);
						oModel.submitBatch(sGroupId);
					} else {
						strictHandlingPromises.forEach(function (sHPromise: any) {
							sHPromise.resolve(true);
							oModel.submitBatch(sHPromise.groupId);
							if (sHPromise.requestSideEffects) {
								sHPromise.requestSideEffects();
							}
						});
						const strictHandlingFails = mParameters?.internalModelContext?.getProperty("strictHandlingFails");
						if (strictHandlingFails.length > 0) {
							messageHandler?.removeTransitionMessages();
						}
						mParameters?.internalModelContext?.setProperty("412Messages", []);
					}
					mParameters?.internalModelContext?.setProperty("412Executed", true);
					oMessageDialogModel.setData({});
					oDialog.close();
				},
				type: "Emphasized",
				text: sActionName
			})
		);
		oDialog.setEndButton(
			new Button({
				press: function () {
					mParameters?.internalModelContext?.setProperty("412Messages", []);
					mParameters?.internalModelContext?.setProperty("412Executed", false);
					if (!isMultiContext412) {
						resolve(false);
					} else {
						strictHandlingPromises.forEach(function (sHPromise: any) {
							sHPromise.resolve(false);
						});
					}
					oMessageDialogModel.setData({});
					oDialog.close();
				},
				text: sCancelButtonTxt
			})
		);
		oDialog.open();
	}
}

function fnOnStrictHandlingFailed(
	sGroupId: string,
	mParameters: any,
	oResourceBundle: ResourceBundle,
	current_context_index: number | null,
	oContext: any,
	iContextLength: number | null,
	messageHandler: MessageHandler | undefined,
	a412Messages: Message[]
) {
	if ((current_context_index === null && iContextLength === null) || (current_context_index === 1 && iContextLength === 1)) {
		return new Promise(function (resolve) {
			operationsHelper.renderMessageView(mParameters, oResourceBundle, messageHandler, a412Messages, false, resolve, sGroupId);
		});
	} else {
		const sActionName = mParameters.label;
		const a412TransitionMessages: Message[] = mParameters?.internalModelContext?.getProperty("412Messages");
		let sValue: string = "";
		// If there is more than one context we need the identifier. This would fix if the action is triggered via table chevron
		if (iContextLength && iContextLength > 1) {
			const oTable = mParameters.control?.getParent();
			const sColumn =  oTable.isA("sap.fe.macros.table.TableAPI") && oTable?.getIdentifierColumn();
			if (sColumn) {
				sValue = oContext && oContext.getObject(sColumn);
			}
		}
		a412Messages.forEach(function (msg: Message) {
			msg.setType("Warning");
			msg.setAdditionalText(sValue);
			a412TransitionMessages.push(msg);
		});
		if (mParameters.dialog && mParameters.dialog.isOpen()) {
			mParameters.dialog.close();
		}
		const strictHandlingPromises = mParameters?.internalModelContext?.getProperty("strictHandlingPromises");
		const strictHandlingPromise = new Promise(function (resolve) {
			strictHandlingPromises.push({
				groupId: sGroupId,
				resolve: resolve,
				actionName: sActionName,
				model: mParameters.model,
				value: sValue,
				requestSideEffects: mParameters.requestSideEffects
			});
		});
		mParameters?.internalModelContext?.setProperty("412Messages", a412TransitionMessages);
		mParameters?.internalModelContext?.setProperty("strictHandlingPromises", strictHandlingPromises);

		if (
			current_context_index === iContextLength ||
			(current_context_index === null && iContextLength !== null && iContextLength >= 1)
		) {
			// current_context_index is set to null (for changeset) if there no context is selected or if a single context is selected
			// this check is not required in versions 1.114.0 and over because strict handling is refactored
			operationsHelper.renderMessageView(
				mParameters,
				oResourceBundle,
				messageHandler,
				mParameters?.internalModelContext?.getProperty("412Messages"),
				true
			);
		}
		return strictHandlingPromise;
	}
}

const operationsHelper = {
	renderMessageView: renderMessageView,
	fnOnStrictHandlingFailed: fnOnStrictHandlingFailed
};

export default operationsHelper;
