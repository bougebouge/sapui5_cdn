import type InternalEditFlow from "sap/fe/core/controllerextensions/InternalEditFlow";
import type Context from "sap/ui/model/Context";
import type JSONModel from "sap/ui/model/json/JSONModel";

const EditFLowExtensionOverride = {
	setCreationMode: function (this: InternalEditFlow, bCreationMode: any) {
		const oUIModelContext = this.base.getView().getBindingContext("ui") as Context;
		(oUIModelContext.getModel() as JSONModel).setProperty("createMode", bCreationMode, oUIModelContext, true);
		if (this.getProgrammingModel() === "Sticky") {
			(oUIModelContext.getModel() as JSONModel).setProperty(
				"createModeSticky",
				this.getTransactionHelper()._bCreateMode,
				oUIModelContext,
				true
			);
		}
	}
};

export default EditFLowExtensionOverride;
