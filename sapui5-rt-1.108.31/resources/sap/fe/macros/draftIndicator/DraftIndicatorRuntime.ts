import Log from "sap/base/Log";
import library from "sap/fe/macros/library";
import ResourceModel from "sap/fe/macros/ResourceModel";
import type Popover from "sap/m/Popover";
import type Event from "sap/ui/base/Event";
import type Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";

const DraftIndicatorState = library.DraftIndicatorState;

function _getParentViewOfControl(oControl: any) {
	while (oControl && !(oControl.getMetadata().getName() === "sap.ui.core.mvc.XMLView")) {
		oControl = oControl.getParent();
	}
	return oControl;
}

const DraftIndicatorHelper = {
	mDraftPopovers: undefined as any,
	/**
	 *
	 * @function to be executed on click of the close button of the draft admin data popover
	 * @name closeDraftAdminPopover
	 * @param oEvent Event instance
	 */
	closeDraftAdminPopover: function (oEvent: Event) {
		// for now go up two levels to get the popover instance
		((oEvent.getSource() as Control).getParent().getParent() as Popover).close();
	},

	/**
	 * @function
	 * @name onDraftLinkPressed
	 * @param oEvent Event object passed from the click event
	 * @param sEntitySet Name of the entity set for on the fly templating
	 * @param pType Name of the page on which popup is being created
	 */
	onDraftLinkPressed: function (oEvent: Event, sEntitySet: string, pType: string) {
		const oSource = oEvent.getSource() as Control,
			oView = _getParentViewOfControl(oSource),
			oBindingContext = oSource.getBindingContext() as Context,
			oMetaModel = oBindingContext.getModel().getMetaModel(),
			sViewId = oView.getId();

		this.mDraftPopovers = this.mDraftPopovers || {};
		this.mDraftPopovers[sViewId] = this.mDraftPopovers[sViewId] || {};
		const oDraftPopover = this.mDraftPopovers[sViewId][sEntitySet];

		if (oDraftPopover) {
			oDraftPopover.setBindingContext(oBindingContext);
			oDraftPopover.openBy(oSource);
		} else {
			const oModel = new JSONModel({
				bIndicatorType: pType
			});
			// oDraftPopover.
			const sFragmentName = "sap.fe.macros.field.DraftPopOverAdminData",
				oPopoverFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");

			Promise.resolve(
				XMLPreprocessor.process(
					oPopoverFragment,
					{ name: sFragmentName },
					{
						bindingContexts: {
							entityType: oMetaModel.createBindingContext(`/${sEntitySet}/$Type`),
							prop: oModel.createBindingContext("/")
						},
						models: {
							entityType: oMetaModel,
							metaModel: oMetaModel,
							prop: oModel
						}
					}
				)
			)
				.then((oFragment: any) => {
					return Fragment.load({ definition: oFragment, controller: this });
				})
				.then((oPopover: any) => {
					oPopover.setModel(ResourceModel.getModel(), "i18n");
					oView.addDependent(oPopover);
					oPopover.setBindingContext(oBindingContext);
					oPopover.setModel(oModel, "prop");
					this.mDraftPopovers[sViewId][sEntitySet] = oPopover;
					oPopover.openBy(oSource);
					// ensure to remove the reference to the draft popover as it would be destroyed on exit
					oView.attachEventOnce("beforeExit", () => {
						delete this.mDraftPopovers;
					});
				})
				.catch(function (oError: any) {
					Log.error("Error while opening the draft popup", oError);
				});
		}
	},
	/**
	 * @function
	 * @name getVisible
	 * @param bIsActiveEntity A boolean to check if the entry is active or not
	 * @param oLastChangedDateTime The last change time stamp info
	 * @param sIndicatorType The type of draft indicator to be rendered
	 * @returns Whether a text or vbox to be rendered
	 */
	getVisible: function (bIsActiveEntity: boolean, oLastChangedDateTime: object, sIndicatorType: string) {
		if (!bIsActiveEntity && !oLastChangedDateTime && sIndicatorType == DraftIndicatorState.NoChanges) {
			return true;
		} else if (!bIsActiveEntity && oLastChangedDateTime && sIndicatorType == DraftIndicatorState.WithChanges) {
			return true;
		} else if (bIsActiveEntity && oLastChangedDateTime && sIndicatorType == DraftIndicatorState.Active) {
			return true;
		} else {
			return false;
		}
	}
};

export default DraftIndicatorHelper;
