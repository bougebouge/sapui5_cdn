import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";
import FELibrary from "sap/fe/core/library";
import MessageBox from "sap/m/MessageBox";
import Core from "sap/ui/core/Core";
import type View from "sap/ui/core/mvc/View";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type { V4Context } from "types/extension_types";
import operationsHelper from "../../operationsHelper";

const ProgrammingModel = FELibrary.ProgrammingModel;
/**
 * Opens a sticky session to edit a document.
 *
 * @function
 * @name sap.fe.core.actions.sticky#editDocumentInStickySession
 * @memberof sap.fe.core.actions.sticky
 * @static
 * @param oContext Context of the document to be edited
 * @param oAppComponent The AppComponent
 * @returns A Promise resolved when the sticky session is in edit mode
 * @private
 * @ui5-restricted
 */
async function editDocumentInStickySession(oContext: Context, oAppComponent: AppComponent): Promise<V4Context> {
	const oModel = oContext.getModel() as ODataModel,
		oMetaModel = oModel.getMetaModel(),
		sMetaPath = oMetaModel.getMetaPath(oContext.getPath()),
		sEditAction = oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/EditAction`);

	if (!sEditAction) {
		throw new Error(`Edit Action for Sticky Session not found for ${sMetaPath}`);
	}
	const oResourceBundle = await (oAppComponent.getModel("sap.fe.i18n") as any).getResourceBundle();
	const sActionName = CommonUtils.getTranslatedText("C_COMMON_OBJECT_PAGE_EDIT", oResourceBundle);
	const oEditAction = oModel.bindContext(`${sEditAction}(...)`, oContext, { $$inheritExpandSelect: true });
	const sGroupId = "direct";
	const oEditPromise = oEditAction.execute(
		sGroupId,
		undefined,
		operationsHelper.fnOnStrictHandlingFailed.bind(
			sticky,
			sGroupId,
			{ label: sActionName, model: oModel },
			oResourceBundle,
			null,
			null,
			null,
			undefined
		)
	);
	oModel.submitBatch(sGroupId);

	const oNewContext: V4Context = await oEditPromise;
	const oSideEffects = oAppComponent.getSideEffectsService().getODataActionSideEffects(sEditAction, oNewContext);
	if (oSideEffects?.triggerActions?.length) {
		await oAppComponent.getSideEffectsService().requestSideEffectsForODataAction(oSideEffects, oNewContext);
	}
	return oNewContext;
}
/**
 * Activates a document and closes the sticky session.
 *
 * @function
 * @name sap.fe.core.actions.sticky#activateDocument
 * @memberof sap.fe.core.actions.sticky
 * @static
 * @param oContext Context of the document to be activated
 * @param oAppComponent Context of the document to be activated
 * @returns A promise resolve when the sticky session is activated
 * @private
 * @ui5-restricted
 */
async function activateDocument(oContext: V4Context, oAppComponent?: any) {
	const oModel = oContext.getModel(),
		oMetaModel = oModel.getMetaModel(),
		sMetaPath = oMetaModel.getMetaPath(oContext.getPath()),
		sSaveAction = oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/SaveAction`);

	if (!sSaveAction) {
		throw new Error(`Save Action for Sticky Session not found for ${sMetaPath}`);
	}
	const oResourceBundle = (oAppComponent && (await oAppComponent.getModel("sap.fe.i18n").getResourceBundle())) || null;
	const sActionName = CommonUtils.getTranslatedText("C_OP_OBJECT_PAGE_SAVE", oResourceBundle);
	const oSaveAction = oModel.bindContext(`${sSaveAction}(...)`, oContext, { $$inheritExpandSelect: true });
	const sGroupId = "direct";
	const oSavePromise = oSaveAction.execute(
		sGroupId,
		undefined,
		operationsHelper.fnOnStrictHandlingFailed.bind(
			sticky,
			sGroupId,
			{ label: sActionName, model: oModel },
			oResourceBundle,
			null,
			null,
			null,
			undefined
		)
	);
	oModel.submitBatch(sGroupId);
	return oSavePromise;
}
/**
 * Discards a document and closes sticky session.
 *
 * @function
 * @name sap.fe.core.actions.sticky#discardDocument
 * @memberof sap.fe.core.actions.sticky
 * @static
 * @param oContext Context of the document to be discarded
 * @returns A promise resolved when the document is dicarded
 * @private
 * @ui5-restricted
 */
function discardDocument(oContext: V4Context) {
	const oModel = oContext.getModel(),
		oMetaModel = oModel.getMetaModel(),
		sMetaPath = oMetaModel.getMetaPath(oContext.getPath()),
		sDiscardAction = oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/DiscardAction`);

	if (!sDiscardAction) {
		throw new Error(`Discard Action for Sticky Session not found for ${sMetaPath}`);
	}

	const oDiscardAction = oModel.bindContext(`/${sDiscardAction}(...)`);
	const oDiscardPromise = oDiscardAction.execute("direct").then(function () {
		return oContext;
	});
	oModel.submitBatch("direct");
	return oDiscardPromise;
}

/**
 * Process the Data loss confirmation.
 *
 * @function
 * @name sap.fe.core.actions.sticky#discardDocument
 * @memberof sap.fe.core.actions.sticky
 * @static
 * @param fnProcess Function to execute after confirmation
 * @param oView Current view
 * @param programmingModel Programming Model of the current page
 * @returns `void` i think
 * @private
 * @ui5-restricted
 */
function processDataLossConfirmation(fnProcess: Function, oView: View, programmingModel: string) {
	const bUIEditable = oView.getModel("ui").getProperty("/isEditable"),
		oResourceBundle = Core.getLibraryResourceBundle("sap.fe.templates"),
		sWarningMsg = oResourceBundle && oResourceBundle.getText("T_COMMON_UTILS_NAVIGATION_AWAY_MSG"),
		sConfirmButtonTxt = oResourceBundle && oResourceBundle.getText("T_COMMON_UTILS_NAVIGATION_AWAY_CONFIRM_BUTTON"),
		sCancelButtonTxt = oResourceBundle && oResourceBundle.getText("T_COMMON_UTILS_NAVIGATION_AWAY_CANCEL_BUTTON");

	if (programmingModel === ProgrammingModel.Sticky && bUIEditable) {
		return MessageBox.warning(sWarningMsg, {
			actions: [sConfirmButtonTxt, sCancelButtonTxt],
			emphasizedAction: sConfirmButtonTxt,
			onClose: function (sAction: any) {
				if (sAction === sConfirmButtonTxt) {
					const oInternalModel = oView && (oView.getModel("internal") as JSONModel);

					Log.info("Navigation confirmed.");
					if (oInternalModel) {
						oInternalModel.setProperty("/sessionOn", false);
						oInternalModel.setProperty("/stickySessionToken", undefined);
					} else {
						Log.warning("Local UIModel couldn't be found.");
					}
					fnProcess();
				} else {
					Log.info("Navigation rejected.");
				}
			}
		});
	}
	return fnProcess();
}

/**
 * Static functions for the sticky session programming model
 *
 * @namespace
 * @alias sap.fe.core.actions.sticky
 * @private
 * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
 * @since 1.54.0
 */
const sticky = {
	editDocumentInStickySession: editDocumentInStickySession,
	activateDocument: activateDocument,
	discardDocument: discardDocument,
	processDataLossConfirmation: processDataLossConfirmation
};

export default sticky;
