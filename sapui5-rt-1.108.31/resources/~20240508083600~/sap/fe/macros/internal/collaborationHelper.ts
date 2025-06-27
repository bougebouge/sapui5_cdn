import CommonUtils from "sap/fe/core/CommonUtils";
import CollaborationActivitySync from "sap/fe/core/controllerextensions/collaboration/ActivitySync";
import { Activity } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";

function getRelatedFieldFromValueHelp(oValueHelp: any) {
	const oView = CommonUtils.getTargetView(oValueHelp);
	return oView.findElements(true, function (oElem: any) {
		return oElem.getFieldHelp && oElem.getDomRef() && oElem.getFieldHelp() === oValueHelp.getId();
	})[0];
}

function onValueHelpOpenDialog(oEvent: any) {
	const oValueHelp = oEvent.getSource();
	const oField = collaborationHelper.getRelatedFieldFromValueHelp(oValueHelp);
	const bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
	if (bCollaborationEnabled && oField.getBinding("value")) {
		const sFullPath = oField.getBinding("value").isA("sap.ui.model.CompositeBinding")
			? // for the compositeBinding, we just send a message containing the path of the first element
			  // it is enough to lock the entire field
			  `${oField.getBindingContext().getPath()}/${oField.getBinding("value").getBindings()[0].getPath()}`
			: `${oField.getBindingContext().getPath()}/${oField.getBinding("value").getPath()}`;
		CollaborationActivitySync.send(oField, Activity.LiveChange, sFullPath);
	}
}

function onValueHelpCloseDialog(oEvent: any): Promise<void> {
	const oValueHelp = oEvent.getSource();
	const oField = collaborationHelper.getRelatedFieldFromValueHelp(oValueHelp);
	const bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
	const isCompositeBinding = oField.getBinding("value").isA("sap.ui.model.CompositeBinding");
	const oValueBeforeUpdate = isCompositeBinding ? oField.getValue()[1] : oField.getValue();

	return new Promise((resolve) => {
		setTimeout(function () {
			const value = isCompositeBinding ? oValueHelp.getConditions()[0].values[0] : oField.getBinding("value")?.getValue();
			if (bCollaborationEnabled && oValueBeforeUpdate === value) {
				const sFullPath = isCompositeBinding
					? `${oField.getBindingContext().getPath()}/${oField.getBinding("value").getBindings()[0].getPath()}`
					: `${oField.getBindingContext().getPath()}/${oField.getBinding("value").getPath()}`;

				CollaborationActivitySync.send(oField, Activity.Undo, sFullPath);
			}
			resolve();
		}, 0);
	});
}

const collaborationHelper = {
	getRelatedFieldFromValueHelp,
	onValueHelpOpenDialog,
	onValueHelpCloseDialog
};

export default collaborationHelper;
