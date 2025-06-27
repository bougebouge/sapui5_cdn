import type InternalRouting from "sap/fe/core/controllerextensions/InternalRouting";
import type ObjectPageController from "sap/fe/templates/ObjectPage/ObjectPageController.controller";

const InternalRoutingExtension = {
	onBeforeBinding: function (this: InternalRouting, oContext: any, mParameters: any) {
		(this.getView().getController() as ObjectPageController)._onBeforeBinding(oContext, mParameters);
	},
	onAfterBinding: function (this: InternalRouting, oContext: any, mParameters: any) {
		(this.getView().getController() as ObjectPageController)._onAfterBinding(oContext, mParameters);
	}
};

export default InternalRoutingExtension;
