import Log from "sap/base/Log";
import type CustomListItem from "sap/m/CustomListItem";
import type Dialog from "sap/m/Dialog";
import type List from "sap/m/List";
import Fragment from "sap/ui/core/Fragment";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import JSONModel from "sap/ui/model/json/JSONModel";

enum DraftDataLossOptions {
	Save = "draftDataLossOptionSave",
	Keep = "draftDataLossOptionKeep",
	Discard = "draftDataLossOptionDiscard"
}

let fnOnDataLossConfirmed: Function;
let fnOnDataLossCancel: Function;
function fnDataLossConfirmation(onDataLossOk: any, onDataLossCancel: any, controller: any, skipBindingToView: any) {
	// Open the data loss popup and after processing the selected function finally call
	// onDataLossConfirmed which resolves the promise and leads to processing of the originally
	// triggered action like e.g. a back navigation
	let dataLossPopup: Dialog;
	fnOnDataLossConfirmed = onDataLossOk;
	fnOnDataLossCancel = onDataLossCancel;
	const fragmentName = "sap.fe.core.controls.DataLossOrDraftDiscard.DataLossDraft";
	const view = controller.getView();
	const fragmentController: any = {
		onDataLossOk: function () {
			const selectedKey = getSelectedKey(dataLossPopup);
			if (selectedKey === DraftDataLossOptions.Save) {
				saveDocument(controller)
					.then(fnOnDataLossConfirmed)
					.catch(function (error: any) {
						Log.error("Error while saving document", error);
					});
				dataLossPopup.close();
			} else if (selectedKey === DraftDataLossOptions.Keep) {
				fnOnDataLossConfirmed();
				dataLossPopup.close();
			} else if (selectedKey === DraftDataLossOptions.Discard) {
				discardDraft(controller, skipBindingToView)
					.then(fnOnDataLossConfirmed)
					.catch(function (error: any) {
						Log.error("Error while discarding draft", error);
					});
				dataLossPopup.close();
			}
		},
		onDataLossCancel: function () {
			fnOnDataLossCancel();
			dataLossPopup.close();
		},
		setDataLossPopup: function (inDataLossPopup: Dialog) {
			controller.dataLossPopup = inDataLossPopup;
		}
	};

	const i18nModel = view.getModel("sap.fe.i18n");
	const localThisModel = new JSONModel({}),
		preprocessorSettings = {
			bindingContexts: {
				"this": localThisModel.createBindingContext("/")
			},
			models: {
				"this": localThisModel,
				"i18n": i18nModel
			}
		};

	if (controller.dataLossPopup) {
		dataLossPopup = controller.dataLossPopup;
		dataLossPopup.open();
		selectAndFocusFirstEntry(dataLossPopup);
	} else {
		const dialogFragment = XMLTemplateProcessor.loadTemplate(fragmentName, "fragment");
		Promise.resolve(XMLPreprocessor.process(dialogFragment, { name: fragmentName }, preprocessorSettings))
			.then((fragment) => {
				return Fragment.load({ definition: fragment, controller: fragmentController });
			})
			.then((popup: any) => {
				dataLossPopup = popup;
				popup.attachAfterOpen(() => {
					selectAndFocusFirstEntry(dataLossPopup);
				});
				view.addDependent(dataLossPopup);
				dataLossPopup.open();
				fragmentController.setDataLossPopup(dataLossPopup);
			})
			.catch(function (error: any) {
				Log.error("Error while opening the Discard Dialog fragment", error);
			});
	}
}

export function performAfterDiscardorKeepDraft(
	processFunctionOnDatalossOk: any,
	processFunctionOnDatalossCancel: any,
	controller: any,
	skipBindingToView: any
) {
	// Depending on if the user closed the data loss popup with Ok or Cancel,
	// execute the provided follow-up function and resolve or reject the promise
	return new Promise(function (resolve: (value: any) => void, reject: (reason?: any) => void) {
		const dataLossPopupOk = function (context: any) {
			const returnValue = processFunctionOnDatalossOk(context);
			resolve(returnValue);
		};
		const dataLossPopupCancel = function () {
			processFunctionOnDatalossCancel();
			reject();
		};
		fnDataLossConfirmation(dataLossPopupOk, dataLossPopupCancel, controller, skipBindingToView);
	});
}

export function discardDraft(controller: any, skipBindingToView: any) {
	const context = controller.getView().getBindingContext();
	const params = {
		skipBackNavigation: true,
		skipDiscardPopover: true,
		skipBindingToView: skipBindingToView !== undefined ? skipBindingToView : true
	};
	return controller.editFlow.cancelDocument(context, params);
}

export function saveDocument(controller: any) {
	const context = controller.getView().getBindingContext();
	// We check if we are on the OP and then call the internal _saveDocument from the OP controller
	// since here some special handling is done for creationRow before editFlow.saveDocument is called.
	// In case of a custom controller we directly call saveDocument from the editFlow
	if (controller.isA("sap.fe.templates.ObjectPage.ObjectPageController")) {
		return controller._saveDocument(context);
	} else {
		return controller.editFlow.saveDocument(context);
	}
}

export function getSelectedKey(dataLossPopup: Dialog) {
	// For not using control IDs we introduced customData in the fragment and
	// use it here for finding the correct list in the dialog and for
	// determining the selected option from the list
	const dataLossOptionsList: List = dataLossPopup
		.getContent()
		.find((element) => element.data("listIdentifier") === "draftDataLossOptionsList") as List;
	return dataLossOptionsList.getSelectedItem().data("itemKey");
}

export function selectAndFocusFirstEntry(dataLossPopup: Dialog) {
	// For not using control IDs we introduced customData in the fragment and
	// use it here for finding the correct list in the dialog.
	const dataLossOptionsList: List = dataLossPopup
		.getContent()
		.find((element) => element.data("listIdentifier") === "draftDataLossOptionsList") as List;
	// Preselect the first entry in the list
	const firstListItemOption: CustomListItem = dataLossOptionsList.getItems()[0] as CustomListItem;
	dataLossOptionsList.setSelectedItem(firstListItemOption);
	// By default set the focus on the first button of the dialog
	dataLossPopup.getButtons()[0].focus();
}

export default { performAfterDiscardorKeepDraft, discardDraft, saveDocument, getSelectedKey, selectAndFocusFirstEntry };
