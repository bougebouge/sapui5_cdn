import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";
import BusyLocker from "sap/fe/core/controllerextensions/BusyLocker";
import draft from "sap/fe/core/controllerextensions/editFlow/draft";
import operations from "sap/fe/core/controllerextensions/editFlow/operations";
import sticky from "sap/fe/core/controllerextensions/editFlow/sticky";
import type MessageHandler from "sap/fe/core/controllerextensions/MessageHandler";
import messageHandling from "sap/fe/core/controllerextensions/messageHandler/messageHandling";
import FPMHelper from "sap/fe/core/helpers/FPMHelper";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import FELibrary from "sap/fe/core/library";
import Button from "sap/m/Button";
import CheckBox from "sap/m/CheckBox";
import Dialog from "sap/m/Dialog";
import MessageBox from "sap/m/MessageBox";
import MessageToast from "sap/m/MessageToast";
import Popover from "sap/m/Popover";
import Text from "sap/m/Text";
import VBox from "sap/m/VBox";
import Core from "sap/ui/core/Core";
import Fragment from "sap/ui/core/Fragment";
import coreLibrary from "sap/ui/core/library";
import type View from "sap/ui/core/mvc/View";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import type Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ODataV4Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import type { ODataListBinding, V4Context } from "types/extension_types";
import toES6Promise from "../../helpers/ToES6Promise";

const CreationMode = FELibrary.CreationMode;
const ProgrammingModel = FELibrary.ProgrammingModel;
const ValueState = coreLibrary.ValueState;
/* Make sure that the mParameters is not the oEvent */
function getParameters(mParameters: any) {
	if (mParameters && mParameters.getMetadata && mParameters.getMetadata().getName() === "sap.ui.base.Event") {
		mParameters = {};
	}
	return mParameters || {};
}

class TransactionHelper {
	_oAppComponent: AppComponent;
	oLockObject: any;
	sProgrammingModel?: typeof ProgrammingModel;
	_bIsModified: boolean = false;
	_bCreateMode: boolean = false;
	_bContinueDiscard: boolean = false;
	_oPopover!: Popover;
	constructor(oAppComponent: AppComponent, oLockObject: any) {
		this._oAppComponent = oAppComponent;
		this.oLockObject = oLockObject;
	}
	getProgrammingModel(oContext?: any): typeof ProgrammingModel {
		if (!this.sProgrammingModel && oContext) {
			let sPath;
			if (oContext.isA("sap.ui.model.odata.v4.Context")) {
				sPath = oContext.getPath();
			} else {
				sPath = oContext.isRelative() ? oContext.getResolvedPath() : oContext.getPath();
			}
			if (ModelHelper.isDraftSupported(oContext.getModel().getMetaModel(), sPath)) {
				this.sProgrammingModel = ProgrammingModel.Draft;
			} else if (ModelHelper.isStickySessionSupported(oContext.getModel().getMetaModel())) {
				this.sProgrammingModel = ProgrammingModel.Sticky;
			} else {
				// as the transaction helper is a singleton we don't store the non draft as the user could
				// start with a non draft child page and navigates back to a draft enabled one
				return ProgrammingModel.NonDraft;
			}
		}
		return this.sProgrammingModel;
	}

	/**
	 * Validates a document.
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param oContext Context of the document to be validated
	 * @param [mParameters] Can contain the following attributes:
	 * @param [mParameters.data] A map of data that should be validated
	 * @param [mParameters.customValidationFunction] A string representing the path to the validation function
	 * @param oView Contains the object of the current view
	 * @returns Promise resolves with result of the custom validation function
	 * @ui5-restricted
	 * @final
	 */
	validateDocument(oContext: V4Context, mParameters: any, oView: View): Promise<any> {
		const sCustomValidationFunction = mParameters && mParameters.customValidationFunction;
		if (sCustomValidationFunction) {
			const sModule = sCustomValidationFunction.substring(0, sCustomValidationFunction.lastIndexOf(".") || -1).replace(/\./gi, "/"),
				sFunctionName = sCustomValidationFunction.substring(
					sCustomValidationFunction.lastIndexOf(".") + 1,
					sCustomValidationFunction.length
				),
				mData = mParameters.data;
			delete mData["@$ui5.context.isTransient"];
			return FPMHelper.validationWrapper(sModule, sFunctionName, mData, oView, oContext);
		}
		return Promise.resolve([]);
	}

	/**
	 * Creates a new document.
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param oMainListBinding OData V4 ListBinding object
	 * @param [mInParameters] Optional, can contain the following attributes:
	 * @param [mInParameters.data] A map of data that should be sent within the POST
	 * @param [mInParameters.busyMode] Global (default), Local, None TODO: to be refactored
	 * @param [mInParameters.busyId] ID of the local busy indicator
	 * @param [mInParameters.keepTransientContextOnFailed] If set, the context stays in the list if the POST failed and POST will be repeated with the next change
	 * @param [mInParameters.inactive] If set, the context is set as inactive for empty rows
	 * @param [mInParameters.skipParameterDialog] Skips the action parameter dialog
	 * @param oResourceBundle
	 * @param messageHandler
	 * @param bFromCopyPaste
	 * @param oView The current view
	 * @returns Promise resolves with new binding context
	 * @ui5-restricted
	 * @final
	 */
	async createDocument(
		oMainListBinding: ODataListBinding,
		mInParameters:
			| {
					data?: any;
					busyMode?: string | undefined;
					busyId: string | undefined;
					keepTransientContextOnFailed?: any;
					inactive?: boolean;
			  }
			| undefined,
		oResourceBundle: any,
		messageHandler: MessageHandler,
		bFromCopyPaste: boolean = false,
		oView: any
	): Promise<ODataV4Context> {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const oModel = oMainListBinding.getModel(),
			oMetaModel = oModel.getMetaModel(),
			sMetaPath = oMetaModel.getMetaPath(oMainListBinding.getHeaderContext().getPath()),
			sCreateHash = this._getAppComponent().getRouterProxy().getHash(),
			oComponentData = this._getAppComponent().getComponentData(),
			oStartupParameters = (oComponentData && oComponentData.startupParameters) || {},
			sNewAction = !oMainListBinding.isRelative()
				? this._getNewAction(oStartupParameters, sCreateHash, oMetaModel, sMetaPath)
				: undefined;
		const mBindingParameters: any = { "$$patchWithoutSideEffects": true };
		const sMessagesPath = oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.Common.v1.Messages/$Path`);
		let sBusyPath = "/busy";
		let sFunctionName =
			oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`) ||
			oMetaModel.getObject(
				`${ModelHelper.getTargetEntitySet(oMetaModel.getContext(sMetaPath))}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`
			);
		let bFunctionOnNavProp;
		let oNewDocumentContext: ODataV4Context | undefined;
		if (sFunctionName) {
			if (
				oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DefaultValuesFunction`) &&
				ModelHelper.getTargetEntitySet(oMetaModel.getContext(sMetaPath)) !== sMetaPath
			) {
				bFunctionOnNavProp = true;
			} else {
				bFunctionOnNavProp = false;
			}
		}
		if (sMessagesPath) {
			mBindingParameters["$select"] = sMessagesPath;
		}
		const mParameters = getParameters(mInParameters);
		if (!oMainListBinding) {
			throw new Error("Binding required for new document creation");
		}
		const sProgrammingModel = this.getProgrammingModel(oMainListBinding);
		if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
			throw new Error("Create document only allowed for draft or sticky session supported services");
		}
		if (mParameters.busyMode === "Local") {
			sBusyPath = `/busyLocal/${mParameters.busyId}`;
		}
		mParameters.beforeCreateCallBack = bFromCopyPaste ? null : mParameters.beforeCreateCallBack;
		BusyLocker.lock(this.oLockObject, sBusyPath);
		const oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
		let oResult: any;

		try {
			let bConsiderDocumentModified = false;
			if (sNewAction) {
				bConsiderDocumentModified = true;
				oResult = await this.callAction(
					sNewAction,
					{
						contexts: oMainListBinding.getHeaderContext(),
						showActionParameterDialog: true,
						label: this._getSpecificCreateActionDialogLabel(oMetaModel, sMetaPath, sNewAction, oResourceBundleCore),
						bindingParameters: mBindingParameters,
						parentControl: mParameters.parentControl,
						bIsCreateAction: true,
						skipParameterDialog: mParameters.skipParameterDialog
					},
					null,
					messageHandler
				);
			} else {
				const bIsNewPageCreation =
					mParameters.creationMode !== CreationMode.CreationRow && mParameters.creationMode !== CreationMode.Inline;
				const aNonComputedVisibleKeyFields = bIsNewPageCreation
					? CommonUtils.getNonComputedVisibleFields(oMetaModel, sMetaPath, oView)
					: [];
				sFunctionName = bFromCopyPaste ? null : sFunctionName;
				let sFunctionPath, oFunctionContext;
				if (sFunctionName) {
					//bound to the source entity:
					if (bFunctionOnNavProp) {
						sFunctionPath =
							oMainListBinding.getContext() &&
							`${oMetaModel.getMetaPath(oMainListBinding.getContext().getPath())}/${sFunctionName}`;
						oFunctionContext = oMainListBinding.getContext();
					} else {
						sFunctionPath =
							oMainListBinding.getHeaderContext() &&
							`${oMetaModel.getMetaPath(oMainListBinding.getHeaderContext().getPath())}/${sFunctionName}`;
						oFunctionContext = oMainListBinding.getHeaderContext();
					}
				}
				const oFunction = sFunctionPath && (oMetaModel.createBindingContext(sFunctionPath) as any);

				try {
					let oData: any;
					try {
						const oContext =
							oFunction && oFunction.getObject() && oFunction.getObject()[0].$IsBound
								? await operations.callBoundFunction(sFunctionName, oFunctionContext, oModel)
								: await operations.callFunctionImport(sFunctionName, oModel);
						if (oContext) {
							oData = oContext.getObject();
						}
					} catch (oError: any) {
						Log.error(`Error while executing the function ${sFunctionName}`, oError);
						throw oError;
					}
					mParameters.data = oData ? Object.assign({}, oData, mParameters.data) : mParameters.data;
					if (mParameters.data) {
						delete mParameters.data["@odata.context"];
					}
					if (aNonComputedVisibleKeyFields.length > 0) {
						oResult = await this._launchDialogWithKeyFields(
							oMainListBinding,
							aNonComputedVisibleKeyFields,
							oModel,
							mParameters,
							messageHandler
						);
						oNewDocumentContext = oResult.newContext;
					} else {
						if (mParameters.beforeCreateCallBack) {
							await toES6Promise(
								mParameters.beforeCreateCallBack({
									contextPath: oMainListBinding && oMainListBinding.getPath()
								})
							);
						}

						oNewDocumentContext = oMainListBinding.create(
							mParameters.data,
							true,
							mParameters.createAtEnd,
							mParameters.inactive
						);
						if (!mParameters.inactive) {
							oResult = await this.onAfterCreateCompletion(oMainListBinding, oNewDocumentContext, mParameters);
						}
					}
				} catch (oError: any) {
					Log.error("Error while creating the new document", oError);
					throw oError;
				}
			}

			if (!oMainListBinding.isRelative()) {
				// the create mode shall currently only be set on creating a root document
				this._bCreateMode = true;
			}
			oNewDocumentContext = oNewDocumentContext || oResult;
			// TODO: where does this one coming from???

			if (bConsiderDocumentModified) {
				this.handleDocumentModifications();
			}
			await messageHandler.showMessageDialog();
			return oNewDocumentContext!;
		} catch (error: unknown) {
			// TODO: currently, the only errors handled here are raised as string - should be changed to Error objects
			await messageHandler.showMessageDialog();
			if (
				(error === FELibrary.Constants.ActionExecutionFailed || error === FELibrary.Constants.CancelActionDialog) &&
				oNewDocumentContext?.isTransient()
			) {
				// This is a workaround suggested by model as Context.delete results in an error
				// TODO: remove the $direct once model resolves this issue
				// this line shows the expected console error Uncaught (in promise) Error: Request canceled: POST Travel; group: submitLater
				oNewDocumentContext.delete("$direct");
			}
			throw error;
		} finally {
			BusyLocker.unlock(this.oLockObject, sBusyPath);
		}
	}
	/**
	 * Find the active contexts of the documents, only for the draft roots.
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param aContexts Contexts Either one context or an array with contexts to be deleted
	 * @param bFindActiveContexts
	 * @returns Array of the active contexts
	 */
	findActiveDraftRootContexts(aContexts: V4Context[], bFindActiveContexts: any) {
		if (!bFindActiveContexts) {
			return Promise.resolve();
		}
		const activeContexts = aContexts.reduce(function (aResult: any, oContext: any) {
			const oMetaModel = oContext.getModel().getMetaModel();
			const sMetaPath = oMetaModel.getMetaPath(oContext.getPath());
			if (oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DraftRoot`)) {
				const bIsActiveEntity = oContext.getObject().IsActiveEntity,
					bHasActiveEntity = oContext.getObject().HasActiveEntity;
				if (!bIsActiveEntity && bHasActiveEntity) {
					const oActiveContext = oContext.getModel().bindContext(`${oContext.getPath()}/SiblingEntity`).getBoundContext();
					aResult.push(oActiveContext);
				}
			}
			return aResult;
		}, []);
		return Promise.all(
			activeContexts.map(function (oContext: any) {
				return oContext.requestCanonicalPath().then(function () {
					return oContext;
				});
			})
		);
	}
	afterDeleteProcess(mParameters: any, checkBox: any, aContexts: any, oResourceBundle: any) {
		const oInternalModelContext = mParameters.internalModelContext;
		if (oInternalModelContext && oInternalModelContext.getProperty("deleteEnabled") != undefined) {
			if (checkBox.isCheckBoxVisible === true && checkBox.isCheckBoxSelected === false) {
				//if unsaved objects are not deleted then we need to set the enabled to true and update the model data for next deletion
				oInternalModelContext.setProperty("deleteEnabled", true);
				const obj = Object.assign(oInternalModelContext.getObject(), {});
				obj.selectedContexts = obj.selectedContexts.filter(function (element: any) {
					return obj.deletableContexts.indexOf(element) === -1;
				});
				obj.deletableContexts = [];
				obj.selectedContexts = [];
				obj.numberOfSelectedContexts = obj.selectedContexts.length;
				oInternalModelContext.setProperty("", obj);
			} else {
				oInternalModelContext.setProperty("deleteEnabled", false);
				oInternalModelContext.setProperty("selectedContexts", []);
				oInternalModelContext.setProperty("numberOfSelectedContexts", 0);
			}
		}
		if (aContexts.length === 1) {
			MessageToast.show(
				CommonUtils.getTranslatedText(
					"C_TRANSACTION_HELPER_DELETE_TOAST_SINGULAR",
					oResourceBundle,
					null,
					mParameters.entitySetName
				)
			);
		} else {
			MessageToast.show(
				CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DELETE_TOAST_PLURAL", oResourceBundle, null, mParameters.entitySetName)
			);
		}
	}
	/**
	 * Delete one or multiple document(s).
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param vInContexts Contexts Either one context or an array with contexts to be deleted
	 * @param mParameters Optional, can contain the following attributes:
	 * @param mParameters.title Title of the object to be deleted
	 * @param mParameters.description Description of the object to be deleted
	 * @param mParameters.numberOfSelectedContexts Number of objects selected
	 * @param mParameters.noDialog To disable the confirmation dialog
	 * @param oResourceBundle
	 * @param messageHandler
	 * @returns A Promise resolved once the document are deleted
	 */
	deleteDocument(vInContexts: V4Context, mParameters: any, oResourceBundle: any, messageHandler: MessageHandler) {
		let aDeletableContexts: any[] = [],
			isCheckBoxVisible = false,
			isLockedTextVisible = false,
			cannotBeDeletedTextVisible = false,
			isCheckBoxSelected: boolean,
			bDialogConfirmed = false;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this,
			oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
		let aParams;
		let oDeleteMessage: any = {
			title: oResourceBundleCore.getText("C_COMMON_DELETE")
		};
		BusyLocker.lock(this.oLockObject);
		let vContexts: V4Context[];
		if (Array.isArray(vInContexts)) {
			vContexts = vInContexts;
		} else {
			vContexts = [vInContexts];
		}

		return new Promise<void>((resolve, reject) => {
			try {
				const sProgrammingModel = this.getProgrammingModel(vContexts[0]);
				if (mParameters) {
					if (!mParameters.numberOfSelectedContexts) {
						if (sProgrammingModel === ProgrammingModel.Draft) {
							for (let i = 0; i < vContexts.length; i++) {
								const oContextData = vContexts[i].getObject();
								if (
									oContextData.IsActiveEntity === true &&
									oContextData.HasDraftEntity === true &&
									oContextData.DraftAdministrativeData &&
									oContextData.DraftAdministrativeData.InProcessByUser &&
									!oContextData.DraftAdministrativeData.DraftIsCreatedByMe
								) {
									let sLockedUser = "";
									const draftAdminData = oContextData && oContextData.DraftAdministrativeData;
									if (draftAdminData) {
										sLockedUser = draftAdminData["InProcessByUser"];
									}
									aParams = [sLockedUser];
									MessageBox.show(
										CommonUtils.getTranslatedText(
											"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_SINGLE_OBJECT_LOCKED",
											oResourceBundle,
											aParams
										),
										{
											title: oResourceBundleCore.getText("C_COMMON_DELETE"),
											onClose: reject
										}
									);
									return;
								}
							}
						}
						mParameters = getParameters(mParameters);
						if (mParameters.title) {
							if (mParameters.description) {
								aParams = [mParameters.title + " ", mParameters.description];
							} else {
								aParams = [mParameters.title, ""];
							}
							oDeleteMessage.text = CommonUtils.getTranslatedText(
								"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO",
								oResourceBundle,
								aParams,
								mParameters.entitySetName
							);
						} else {
							oDeleteMessage.text = CommonUtils.getTranslatedText(
								"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR",
								oResourceBundle,
								null,
								mParameters.entitySetName
							);
						}
						aDeletableContexts = vContexts;
					} else {
						oDeleteMessage = {
							title: oResourceBundleCore.getText("C_COMMON_DELETE")
						};
						if (mParameters.numberOfSelectedContexts === 1 && mParameters.numberOfSelectedContexts === vContexts.length) {
							aDeletableContexts = vContexts;
							const oLineContextData = vContexts[0].getObject();
							const oTable = mParameters.parentControl;
							const sKey = oTable && oTable.getParent().getIdentifierColumn();
							if (sKey) {
								const sKeyValue = sKey ? oLineContextData[sKey] : undefined;
								const sDescription =
									mParameters.description && mParameters.description.path
										? oLineContextData[mParameters.description.path]
										: undefined;
								if (sKeyValue) {
									if (sDescription && mParameters.description && sKey !== mParameters.description.path) {
										aParams = [sKeyValue + " ", sDescription];
									} else {
										aParams = [sKeyValue, ""];
									}
									oDeleteMessage.text = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO",
										oResourceBundle,
										aParams,
										mParameters.entitySetName
									);
								} else if (sKeyValue) {
									aParams = [sKeyValue, ""];
									oDeleteMessage.text = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO",
										oResourceBundle,
										aParams,
										mParameters.entitySetName
									);
								} else {
									oDeleteMessage.text = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR",
										oResourceBundle,
										null,
										mParameters.entitySetName
									);
								}
							} else {
								oDeleteMessage.text = CommonUtils.getTranslatedText(
									"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR",
									oResourceBundle,
									null,
									mParameters.entitySetName
								);
							}
						} else if (mParameters.numberOfSelectedContexts === 1 && mParameters.unSavedContexts.length === 1) {
							//only one unsaved object
							aDeletableContexts = mParameters.unSavedContexts;
							const draftAdminData = aDeletableContexts[0].getObject()["DraftAdministrativeData"];
							let sLastChangedByUser = "";
							if (draftAdminData) {
								sLastChangedByUser =
									draftAdminData["LastChangedByUserDescription"] || draftAdminData["LastChangedByUser"] || "";
							}
							aParams = [sLastChangedByUser];
							oDeleteMessage.text = CommonUtils.getTranslatedText(
								"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES",
								oResourceBundle,
								aParams
							);
						} else if (mParameters.numberOfSelectedContexts === mParameters.unSavedContexts.length) {
							//only multiple unsaved objects
							aDeletableContexts = mParameters.unSavedContexts;
							oDeleteMessage.text = CommonUtils.getTranslatedText(
								"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_CHANGES_MULTIPLE_OBJECTS",
								oResourceBundle
							);
						} else if (
							mParameters.numberOfSelectedContexts ===
							vContexts.concat(mParameters.unSavedContexts.concat(mParameters.lockedContexts)).length
						) {
							//only unsaved, locked ,deletable objects but not non-deletable objects
							aDeletableContexts = vContexts.concat(mParameters.unSavedContexts);
							oDeleteMessage.text =
								aDeletableContexts.length === 1
									? CommonUtils.getTranslatedText(
											"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR",
											oResourceBundle,
											null,
											mParameters.entitySetName
									  )
									: CommonUtils.getTranslatedText(
											"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL",
											oResourceBundle,
											null,
											mParameters.entitySetName
									  );
						} else {
							//if non-deletable objects exists along with any of unsaved ,deletable objects
							aDeletableContexts = vContexts.concat(mParameters.unSavedContexts);
							cannotBeDeletedTextVisible = true;
							oDeleteMessage.text =
								aDeletableContexts.length === 1
									? CommonUtils.getTranslatedText(
											"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_SINGULAR_NON_DELETABLE",
											oResourceBundle,
											null,
											mParameters.entitySetName
									  )
									: CommonUtils.getTranslatedText(
											"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTTITLE_PLURAL_NON_DELETABLE",
											oResourceBundle,
											[aDeletableContexts.length],
											mParameters.entitySetName
									  );
							oDeleteMessage.nonDeletableText = that._getNonDeletableText(mParameters, vContexts, oResourceBundle);
						}
						if (mParameters.lockedContexts.length == 1) {
							//setting the locked text if locked objects exist
							isLockedTextVisible = true;
							oDeleteMessage.nonDeletableText = CommonUtils.getTranslatedText(
								"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_LOCKED",
								oResourceBundle,
								[mParameters.numberOfSelectedContexts]
							);
						}
						if (mParameters.lockedContexts.length > 1) {
							//setting the locked text if locked objects exist
							isLockedTextVisible = true;
							oDeleteMessage.nonDeletableText = CommonUtils.getTranslatedText(
								"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED",
								oResourceBundle,
								[mParameters.lockedContexts.length, mParameters.numberOfSelectedContexts]
							);
						}
						if (
							mParameters.unSavedContexts.length > 0 &&
							mParameters.unSavedContexts.length !== mParameters.numberOfSelectedContexts
						) {
							if (
								(cannotBeDeletedTextVisible || isLockedTextVisible) &&
								aDeletableContexts.length === mParameters.unSavedContexts.length
							) {
								//if only unsaved and either or both of locked and non-deletable objects exist then we hide the check box
								isCheckBoxVisible = false;
								aDeletableContexts = mParameters.unSavedContexts;
								if (mParameters.unSavedContexts.length === 1) {
									oDeleteMessage.text = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_SINGULAR",
										oResourceBundle
									);
								} else {
									oDeleteMessage.text = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_UNSAVED_AND_FEW_OBJECTS_LOCKED_PLURAL",
										oResourceBundle
									);
								}
							} else {
								if (mParameters.unSavedContexts.length === 1) {
									oDeleteMessage.checkBoxText = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_SINGULAR",
										oResourceBundle
									);
								} else {
									oDeleteMessage.checkBoxText = CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_UNSAVED_PLURAL",
										oResourceBundle
									);
								}
								isCheckBoxVisible = true;
							}
						}
						if (cannotBeDeletedTextVisible && isLockedTextVisible) {
							//if non-deletable objects exist along with deletable objects
							const sNonDeletableContextText = that._getNonDeletableText(mParameters, vContexts, oResourceBundle);
							//if both locked and non-deletable objects exist along with deletable objects
							if (mParameters.unSavedContexts.length > 1) {
								oDeleteMessage.nonDeletableText =
									sNonDeletableContextText +
									" " +
									CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_LOCKED",
										oResourceBundle,
										[mParameters.lockedContexts.length, mParameters.numberOfSelectedContexts]
									);
							}
							if (mParameters.unSavedContexts.length == 1) {
								oDeleteMessage.nonDeletableText =
									sNonDeletableContextText +
									" " +
									CommonUtils.getTranslatedText(
										"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_LOCKED",
										oResourceBundle,
										[mParameters.numberOfSelectedContexts]
									);
							}
						}
					}
				}
				let oNonDeletableMessageTextControl, oDeleteMessageTextControl;
				const oContent = new VBox({
					items: [
						(oNonDeletableMessageTextControl = new Text({
							text: oDeleteMessage.nonDeletableText,
							visible: isLockedTextVisible || cannotBeDeletedTextVisible
						})),
						(oDeleteMessageTextControl = new Text({
							text: oDeleteMessage.text
						})),
						new CheckBox({
							text: oDeleteMessage.checkBoxText,
							selected: true,
							select: function (oEvent: any) {
								const selected = oEvent.getSource().getSelected();
								if (selected) {
									aDeletableContexts = vContexts.concat(mParameters.unSavedContexts);
									isCheckBoxSelected = true;
								} else {
									aDeletableContexts = vContexts;
									isCheckBoxSelected = false;
								}
							},
							visible: isCheckBoxVisible
						})
					]
				});
				const sTitle = oResourceBundleCore.getText("C_COMMON_DELETE");
				const fnConfirm = async function () {
					bDialogConfirmed = true;
					BusyLocker.lock(that.oLockObject);
					const aContexts = aDeletableContexts;

					try {
						if (mParameters.beforeDeleteCallBack) {
							await mParameters.beforeDeleteCallBack({ contexts: aContexts });
						}
						const activeContexts = await that.findActiveDraftRootContexts(aContexts, mParameters.bFindActiveContexts);

						try {
							await Promise.all(
								aContexts.map(function (oContext: any) {
									//delete the draft
									const bEnableStrictHandling = aContexts.length === 1 ? true : false;
									return draft.deleteDraft(oContext, that._oAppComponent, bEnableStrictHandling);
								})
							);
						} catch (oError: any) {
							await messageHandler.showMessages();
							// re-throw error to enforce rejecting the general promise
							throw oError;
						}
						const checkBox = {
							"isCheckBoxVisible": isCheckBoxVisible,
							"isCheckBoxSelected": isCheckBoxSelected
						};
						if (activeContexts && activeContexts.length) {
							await Promise.all(
								activeContexts.map(function (oContext: any) {
									return oContext.delete();
								})
							);

							that.afterDeleteProcess(mParameters, checkBox, aContexts, oResourceBundle);
							await messageHandler.showMessageDialog();
							resolve();
						} else {
							that.afterDeleteProcess(mParameters, checkBox, aContexts, oResourceBundle);
							await messageHandler.showMessageDialog();
							resolve();
						}
					} catch (oError: any) {
						reject();
					} finally {
						BusyLocker.unlock(that.oLockObject);
					}
				};
				const oDialog = new Dialog({
					title: sTitle,
					state: "Warning",
					content: [oContent],
					ariaLabelledBy: oNonDeletableMessageTextControl.getVisible()
						? [oNonDeletableMessageTextControl, oDeleteMessageTextControl]
						: oDeleteMessageTextControl,
					beginButton: new Button({
						text: oResourceBundleCore.getText("C_COMMON_DELETE"),
						type: "Emphasized",
						press: function () {
							messageHandling.removeBoundTransitionMessages();
							oDialog.close();
							fnConfirm();
						}
					}),
					endButton: new Button({
						text: CommonUtils.getTranslatedText("C_COMMON_DIALOG_CANCEL", oResourceBundle),
						press: function () {
							oDialog.close();
						}
					}),
					afterClose: function () {
						oDialog.destroy();
						// if dialog is closed unconfirmed (e.g. via "Cancel" or Escape button), ensure to reject promise
						if (!bDialogConfirmed) {
							reject();
						}
					}
				} as any);
				if (mParameters.noDialog) {
					fnConfirm();
				} else {
					oDialog.addStyleClass("sapUiContentPadding");
					oDialog.open();
				}
			} finally {
				BusyLocker.unlock(that.oLockObject);
			}
		});
	}
	/**
	 * Edits a document.
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param oContext Context of the active document
	 * @param oView Current view
	 * @param messageHandler
	 * @returns Promise resolves with the new draft context in case of draft programming model
	 * @ui5-restricted
	 * @final
	 */
	async editDocument(oContext: V4Context, oView: View, messageHandler: MessageHandler): Promise<V4Context | undefined> {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		const sProgrammingModel = this.getProgrammingModel(oContext);
		if (!oContext) {
			throw new Error("Binding context to active document is required");
		}
		if (sProgrammingModel !== ProgrammingModel.Draft && sProgrammingModel !== ProgrammingModel.Sticky) {
			throw new Error("Edit is only allowed for draft or sticky session supported services");
		}
		this._bIsModified = false;
		BusyLocker.lock(that.oLockObject);
		// before triggering the edit action we'll have to remove all bound transition messages
		messageHandler.removeTransitionMessages();

		try {
			const oNewContext =
				sProgrammingModel === ProgrammingModel.Draft
					? await draft.createDraftFromActiveDocument(oContext, this._getAppComponent(), {
							bPreserveChanges: true,
							oView: oView
					  } as any)
					: await sticky.editDocumentInStickySession(oContext, this._getAppComponent());

			this._bCreateMode = false;
			await messageHandler.showMessageDialog();
			return oNewContext;
		} catch (err: any) {
			await messageHandler.showMessages({ concurrentEditFlag: true });
			throw err;
		} finally {
			BusyLocker.unlock(that.oLockObject);
		}
	}
	/**
	 * Cancel 'edit' mode of a document.
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param oContext Context of the document to be canceled or deleted
	 * @param [mInParameters] Optional, can contain the following attributes:
	 * @param mInParameters.cancelButton Cancel Button of the discard popover (mandatory for now)
	 * @param mInParameters.skipDiscardPopover Optional, supresses the discard popover incase of draft applications while navigating out of OP
	 * @param oResourceBundle
	 * @param messageHandler
	 * @returns Promise resolves with ???
	 * @ui5-restricted
	 * @final
	 */
	async cancelDocument(
		oContext: V4Context,
		mInParameters: { cancelButton: any; skipDiscardPopover: boolean } | undefined,
		oResourceBundle: any,
		messageHandler: MessageHandler
	): Promise<V4Context | boolean> {
		//context must always be passed - mandatory parameter
		if (!oContext) {
			throw new Error("No context exists. Pass a meaningful context");
		}
		BusyLocker.lock(this.oLockObject);
		const mParameters = getParameters(mInParameters);
		const oModel = oContext.getModel();
		const sProgrammingModel = this.getProgrammingModel(oContext);

		try {
			let returnedValue: V4Context | boolean = false;

			if (sProgrammingModel === ProgrammingModel.Draft && !this._bIsModified) {
				const draftDataContext = oModel.bindContext(`${oContext.getPath()}/DraftAdministrativeData`).getBoundContext();
				const draftAdminData = await draftDataContext.requestObject();
				if (draftAdminData) {
					this._bIsModified = !(draftAdminData.CreationDateTime === draftAdminData.LastChangeDateTime);
				}
			}
			if (!mParameters.skipDiscardPopover) {
				await this._showDiscardPopover(mParameters.cancelButton, this._bIsModified, oResourceBundle);
			}
			if (oContext.isKeepAlive()) {
				// if the context is kept alive we set it again to detach the onBeforeDestroy callback and handle navigation here
				// the context needs to still be kept alive to be able to reset changes properly
				oContext.setKeepAlive(true, undefined);
			}
			if (mParameters.beforeCancelCallBack) {
				await mParameters.beforeCancelCallBack({ context: oContext });
			}
			switch (sProgrammingModel) {
				case ProgrammingModel.Draft:
					const bHasActiveEntity = await oContext.requestObject("HasActiveEntity");
					if (!bHasActiveEntity) {
						if (oContext && oContext.hasPendingChanges()) {
							oContext.getBinding().resetChanges();
						}
						returnedValue = await draft.deleteDraft(oContext, this._oAppComponent);
					} else {
						const oSiblingContext = oModel.bindContext(`${oContext.getPath()}/SiblingEntity`).getBoundContext();
						try {
							const sCanonicalPath = await oSiblingContext.requestCanonicalPath();
							if (oContext && oContext.hasPendingChanges()) {
								oContext.getBinding().resetChanges();
							}
							returnedValue = oModel.bindContext(sCanonicalPath).getBoundContext();
						} finally {
							await draft.deleteDraft(oContext, this._oAppComponent);
						}
					}
					break;

				case ProgrammingModel.Sticky:
					const discardedContext = await sticky.discardDocument(oContext);
					if (discardedContext) {
						if (discardedContext.hasPendingChanges()) {
							discardedContext.getBinding().resetChanges();
						}
						if (!this._bCreateMode) {
							discardedContext.refresh();
							returnedValue = discardedContext;
						}
					}
					break;

				default:
					throw new Error("Cancel document only allowed for draft or sticky session supported services");
			}

			this._bIsModified = false;
			// remove existing bound transition messages
			messageHandler.removeTransitionMessages();
			// show unbound messages
			await messageHandler.showMessages();
			return returnedValue;
		} catch (err: any) {
			await messageHandler.showMessages();
			throw err;
		} finally {
			BusyLocker.unlock(this.oLockObject);
		}
	}

	/**
	 * Saves the document.
	 *
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @param oContext Context of the document to be saved
	 * @param oResourceBundle
	 * @param bExecuteSideEffectsOnError
	 * @param aBindings
	 * @param messageHandler
	 * @returns Promise resolves with ???
	 * @ui5-restricted
	 * @final
	 */
	async saveDocument(
		oContext: V4Context,
		oResourceBundle: any,
		bExecuteSideEffectsOnError: any,
		aBindings: any,
		messageHandler: MessageHandler
	): Promise<V4Context> {
		if (!oContext) {
			return Promise.reject(new Error("Binding context to draft document is required"));
		}
		const sProgrammingModel = this.getProgrammingModel(oContext);
		if (sProgrammingModel !== ProgrammingModel.Sticky && sProgrammingModel !== ProgrammingModel.Draft) {
			throw new Error("Save is only allowed for draft or sticky session supported services");
		}
		// in case of saving / activating the bound transition messages shall be removed before the PATCH/POST
		// is sent to the backend
		messageHandler.removeTransitionMessages();

		try {
			BusyLocker.lock(this.oLockObject);
			const oActiveDocument =
				sProgrammingModel === ProgrammingModel.Draft
					? await draft.activateDocument(oContext, this._getAppComponent(), {}, messageHandler)
					: await sticky.activateDocument(oContext, this._getAppComponent());

			const bNewObject = sProgrammingModel === ProgrammingModel.Sticky ? this._bCreateMode : !oContext.getObject().HasActiveEntity;
			const messagesReceived = messageHandling.getMessages().concat(messageHandling.getMessages(true, true)); // get unbound and bound messages present in the model
			if (!(messagesReceived.length === 1 && messagesReceived[0].type === coreLibrary.MessageType.Success)) {
				// show our object creation toast only if it is not coming from backend
				MessageToast.show(
					bNewObject
						? CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_OBJECT_CREATED", oResourceBundle)
						: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_OBJECT_SAVED", oResourceBundle)
				);
			}

			this._bIsModified = false;
			return oActiveDocument;
		} catch (err: any) {
			if (aBindings && aBindings.length > 0) {
				/* The sideEffects are executed only for table items in transient state */
				aBindings.forEach((oListBinding: any) => {
					if (!CommonUtils.hasTransientContext(oListBinding) && bExecuteSideEffectsOnError) {
						const oAppComponent = this._getAppComponent();
						oAppComponent.getSideEffectsService().requestSideEffectsForNavigationProperty(oListBinding.getPath(), oContext);
					}
				});
			}
			await messageHandler.showMessages();
			throw err;
		} finally {
			BusyLocker.unlock(this.oLockObject);
		}
	}
	/**
	 * Calls a bound or unbound action.
	 *
	 * @function
	 * @static
	 * @name sap.fe.core.TransactionHelper.callAction
	 * @memberof sap.fe.core.TransactionHelper
	 * @param sActionName The name of the action to be called
	 * @param [mParameters] Contains the following attributes:
	 * @param [mParameters.parameterValues] A map of action parameter names and provided values
	 * @param [mParameters.skipParameterDialog] Skips the parameter dialog if values are provided for all of them
	 * @param [mParameters.contexts] Mandatory for a bound action: Either one context or an array with contexts for which the action is to be called
	 * @param [mParameters.model] Mandatory for an unbound action: An instance of an OData V4 model
	 * @param [mParameters.invocationGrouping] Mode how actions are to be called: 'ChangeSet' to put all action calls into one changeset, 'Isolated' to put them into separate changesets
	 * @param [mParameters.label] A human-readable label for the action
	 * @param [mParameters.bGetBoundContext] If specified, the action promise returns the bound context
	 * @param oView Contains the object of the current view
	 * @param messageHandler
	 * @returns Promise resolves with an array of response objects (TODO: to be changed)
	 * @ui5-restricted
	 * @final
	 */
	async callAction(sActionName: string, mParameters: any, oView: View | null, messageHandler: MessageHandler): Promise<any> {
		mParameters = getParameters(mParameters);
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		let oContext, oModel: any;
		const mBindingParameters = mParameters.bindingParameters;
		if (!sActionName) {
			throw new Error("Provide name of action to be executed");
		}
		// action imports are not directly obtained from the metaModel by it is present inside the entityContainer
		// and the acions it refers to present outside the entitycontainer, hence to obtain kind of the action
		// split() on its name was required
		const sName = sActionName.split("/")[1];
		sActionName = sName || sActionName;
		oContext = sName ? undefined : mParameters.contexts;
		//checking whether the context is an array with more than 0 length or not an array(create action)
		if (oContext && ((Array.isArray(oContext) && oContext.length) || !Array.isArray(oContext))) {
			oContext = Array.isArray(oContext) ? oContext[0] : oContext;
			oModel = oContext.getModel();
		}
		if (mParameters.model) {
			oModel = mParameters.model;
		}
		if (!oModel) {
			throw new Error("Pass a context for a bound action or pass the model for an unbound action");
		}
		// get the binding parameters $select and $expand for the side effect on this action
		// also gather additional property paths to be requested such as text associations
		const oAppComponent = that._getAppComponent();
		const mSideEffectsParameters = oAppComponent.getSideEffectsService().getODataActionSideEffects(sActionName, oContext) || {};

		const displayUnapplicableContextsDialog = (): Promise<V4Context[] | void> => {
			if (!mParameters.notApplicableContext || mParameters.notApplicableContext.length === 0) {
				return Promise.resolve(mParameters.contexts);
			}

			return new Promise(async (resolve, reject) => {
				const fnOpenAndFillDialog = function (oDlg: Dialog) {
					let oDialogContent;
					const nNotApplicable = mParameters.notApplicableContext.length,
						aNotApplicableItems = [];
					for (let i = 0; i < mParameters.notApplicableContext.length; i++) {
						oDialogContent = mParameters.notApplicableContext[i].getObject();
						aNotApplicableItems.push(oDialogContent);
					}
					const oNotApplicableItemsModel = new JSONModel(aNotApplicableItems);
					const oTotals = new JSONModel({ total: nNotApplicable, label: mParameters.label });
					oDlg.setModel(oNotApplicableItemsModel, "notApplicable");
					oDlg.setModel(oTotals, "totals");
					oDlg.open();
				};
				// Show the contexts that are not applicable and will not therefore be processed
				const sFragmentName = "sap.fe.core.controls.ActionPartial";
				const oDialogFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
				const oMetaModel = oModel.getMetaModel();
				const sCanonicalPath = mParameters.contexts[0].getCanonicalPath();
				const sEntitySet = `${sCanonicalPath.substr(0, sCanonicalPath.indexOf("("))}/`;
				const oDialogLabelModel = new JSONModel({
					title: mParameters.label
				});

				try {
					const oFragment = await XMLPreprocessor.process(
						oDialogFragment,
						{ name: sFragmentName },
						{
							bindingContexts: {
								entityType: oMetaModel.createBindingContext(sEntitySet),
								label: oDialogLabelModel.createBindingContext("/")
							},
							models: {
								entityType: oMetaModel,
								metaModel: oMetaModel,
								label: oDialogLabelModel
							}
						}
					);
					// eslint-disable-next-line prefer-const
					let oDialog: Dialog;
					const oController = {
						onClose: function () {
							// User cancels action
							oDialog.close();
							resolve();
						},
						onContinue: function () {
							// Users continues the action with the bound contexts
							oDialog.close();
							resolve(mParameters.applicableContext);
						}
					};
					oDialog = (await Fragment.load({ definition: oFragment, controller: oController })) as Dialog;
					oController.onClose = function () {
						// User cancels action
						oDialog.close();
						resolve();
					};
					oController.onContinue = function () {
						// Users continues the action with the bound contexts
						oDialog.close();
						resolve(mParameters.applicableContext);
					};

					mParameters.parentControl.addDependent(oDialog);
					fnOpenAndFillDialog(oDialog);
				} catch (oError) {
					reject(oError);
				}
			});
		};

		try {
			let oResult: any;
			if (oContext && oModel) {
				const contextToProcess = await displayUnapplicableContextsDialog();
				if (contextToProcess) {
					oResult = await operations.callBoundAction(sActionName, contextToProcess, oModel, oAppComponent, {
						parameterValues: mParameters.parameterValues,
						invocationGrouping: mParameters.invocationGrouping,
						label: mParameters.label,
						skipParameterDialog: mParameters.skipParameterDialog,
						mBindingParameters: mBindingParameters,
						entitySetName: mParameters.entitySetName,
						additionalSideEffect: mSideEffectsParameters,
						onSubmitted: function () {
							messageHandler.removeTransitionMessages();
							BusyLocker.lock(that.oLockObject);
						},
						onResponse: function () {
							BusyLocker.unlock(that.oLockObject);
						},
						parentControl: mParameters.parentControl,
						controlId: mParameters.controlId,
						internalModelContext: mParameters.internalModelContext,
						operationAvailableMap: mParameters.operationAvailableMap,
						bIsCreateAction: mParameters.bIsCreateAction,
						bGetBoundContext: mParameters.bGetBoundContext,
						bObjectPage: mParameters.bObjectPage,
						messageHandler: messageHandler,
						defaultValuesExtensionFunction: mParameters.defaultValuesExtensionFunction,
						selectedItems: mParameters.contexts
					});
				} else {
					oResult = null;
				}
			} else {
				oResult = await operations.callActionImport(sActionName, oModel, oAppComponent, {
					parameterValues: mParameters.parameterValues,
					label: mParameters.label,
					skipParameterDialog: mParameters.skipParameterDialog,
					bindingParameters: mBindingParameters,
					entitySetName: mParameters.entitySetName,
					onSubmitted: function () {
						BusyLocker.lock(that.oLockObject);
					},
					onResponse: function () {
						BusyLocker.unlock(that.oLockObject);
					},
					parentControl: mParameters.parentControl,
					internalModelContext: mParameters.internalModelContext,
					operationAvailableMap: mParameters.operationAvailableMap,
					messageHandler: messageHandler,
					bObjectPage: mParameters.bObjectPage
				});
			}

			await this._handleActionResponse(messageHandler, mParameters, sActionName);
			return oResult;
		} catch (err: any) {
			await this._handleActionResponse(messageHandler, mParameters, sActionName);
			throw err;
		}
	}
	/**
	 * Handles messages for action call.
	 *
	 * @function
	 * @name sap.fe.core.TransactionHelper#_handleActionResponse
	 * @memberof sap.fe.core.TransactionHelper
	 * @param messageHandler
	 * @param mParameters Parameters to be considered for the action.
	 * @param sActionName The name of the action to be called
	 * @returns Promise after message dialog is opened if required.
	 * @ui5-restricted
	 * @final
	 */
	_handleActionResponse(messageHandler: MessageHandler, mParameters: any, sActionName: string): Promise<void> {
		const aTransientMessages = messageHandling.getMessages(true, true);
		if (aTransientMessages.length > 0 && mParameters && mParameters.internalModelContext) {
			mParameters.internalModelContext.setProperty("sActionName", mParameters.label ? mParameters.label : sActionName);
		}
		return messageHandler.showMessages();
	}
	/**
	 * Handles validation errors for the 'Discard' action.
	 *
	 * @function
	 * @name sap.fe.core.TransactionHelper#handleValidationError
	 * @memberof sap.fe.core.TransactionHelper
	 * @static
	 * @ui5-restricted
	 * @final
	 */
	handleValidationError() {
		const oMessageManager = Core.getMessageManager(),
			errorToRemove = oMessageManager
				.getMessageModel()
				.getData()
				.filter(function (error: any) {
					// only needs to handle validation messages, technical and persistent errors needs not to be checked here.
					if (error.validation) {
						return error;
					}
				});
		oMessageManager.removeMessages(errorToRemove);
	}
	/**
	 * Shows a popover if it needs to be shown.
	 * TODO: Popover is shown if user has modified any data.
	 * TODO: Popover is shown if there's a difference from draft admin data.
	 *
	 * @static
	 * @name sap.fe.core.TransactionHelper._showDiscardPopover
	 * @memberof sap.fe.core.TransactionHelper
	 * @param oCancelButton The control which will open the popover
	 * @param bIsModified
	 * @param oResourceBundle
	 * @returns Promise resolves if user confirms discard, rejects if otherwise, rejects if no control passed to open popover
	 * @ui5-restricted
	 * @final
	 */
	_showDiscardPopover(oCancelButton: any, bIsModified: any, oResourceBundle: any) {
		// TODO: Implement this popover as a fragment as in v2??
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;
		that._bContinueDiscard = false;
		// to be implemented
		return new Promise<void>(function (resolve, reject) {
			if (!oCancelButton) {
				reject("Cancel button not found");
			}
			//Show popover only when data is changed.
			if (bIsModified) {
				const fnOnAfterDiscard = function () {
					oCancelButton.setEnabled(true);
					if (that._bContinueDiscard) {
						resolve();
					} else {
						reject("Discard operation was rejected. Document has not been discarded");
					}
					that._oPopover.detachAfterClose(fnOnAfterDiscard);
				};
				if (!that._oPopover) {
					const oText = new Text({
							//This text is the same as LR v2.
							//TODO: Display message provided by app developer???
							text: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DRAFT_DISCARD_MESSAGE", oResourceBundle)
						}),
						oButton = new Button({
							text: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_DRAFT_DISCARD_BUTTON", oResourceBundle),
							width: "100%",
							press: function () {
								that.handleValidationError();
								that._bContinueDiscard = true;
								that._oPopover.close();
							},
							ariaLabelledBy: oText
						} as any);
					that._oPopover = new Popover({
						showHeader: false,
						placement: "Top",
						content: [
							new VBox({
								items: [oText, oButton]
							})
						],
						beforeOpen: function () {
							// make sure to NOT trigger multiple cancel flows
							oCancelButton.setEnabled(false);
							that._oPopover.setInitialFocus(oButton);
						}
					});
					that._oPopover.addStyleClass("sapUiContentPadding");
				}
				that._oPopover.attachAfterClose(fnOnAfterDiscard);
				that._oPopover.openBy(oCancelButton, false);
			} else {
				that.handleValidationError();
				resolve();
			}
		});
	}
	/**
	 * Sets the document to modified state on patch event.
	 *
	 * @function
	 * @static
	 * @name sap.fe.core.TransactionHelper.handleDocumentModifications
	 * @memberof sap.fe.core.TransactionHelper
	 * @ui5-restricted
	 * @final
	 */
	handleDocumentModifications() {
		this._bIsModified = true;
	}
	/**
	 * Retrieves the owner component.
	 *
	 * @function
	 * @static
	 * @private
	 * @name sap.fe.core.TransactionHelper._getOwnerComponent
	 * @memberof sap.fe.core.TransactionHelper
	 * @returns The app component
	 * @ui5-restricted
	 * @final
	 */
	_getAppComponent() {
		return this._oAppComponent;
	}

	_onFieldChange(oEvent: any, oCreateButton: any, messageHandler: MessageHandler, fnValidateRequiredProperties: Function) {
		messageHandler.removeTransitionMessages();
		const oField = oEvent.getSource();
		const oFieldPromise = oEvent.getParameter("promise");
		if (oFieldPromise) {
			return oFieldPromise
				.then(function (value: any) {
					// Setting value of field as '' in case of value help and validating other fields
					oField.setValue(value);
					fnValidateRequiredProperties();

					return oField.getValue();
				})
				.catch(function (value: any) {
					if (value !== "") {
						//disabling the continue button in case of invalid value in field
						oCreateButton.setEnabled(false);
					} else {
						// validating all the fields in case of empty value in field
						oField.setValue(value);
						fnValidateRequiredProperties();
					}
				});
		}
	}
	_getNonDeletableText(mParameters: any, vContexts: any, oResourceBundle: any) {
		const aNonDeletableContexts = mParameters.numberOfSelectedContexts - vContexts.concat(mParameters.unSavedContexts).length;
		return aNonDeletableContexts === 1
			? CommonUtils.getTranslatedText(
					"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_ONE_OBJECT_NON_DELETABLE",
					oResourceBundle,
					[mParameters.numberOfSelectedContexts]
			  )
			: CommonUtils.getTranslatedText(
					"C_TRANSACTION_HELPER_CONFIRM_DELETE_WITH_OBJECTINFO_AND_FEW_OBJECTS_NON_DELETABLE",
					oResourceBundle,
					[
						mParameters.numberOfSelectedContexts - vContexts.concat(mParameters.unSavedContexts).length,
						mParameters.numberOfSelectedContexts
					]
			  );
	}

	_launchDialogWithKeyFields(
		oListBinding: ODataListBinding,
		mFields: any,
		oModel: ODataModel,
		mParameters: any,
		messageHandler: MessageHandler
	) {
		let oDialog: Dialog;
		const oParentControl = mParameters.parentControl;

		// Crate a fake (transient) listBinding and context, just for the binding context of the dialog
		const oTransientListBinding = oModel.bindList(oListBinding.getPath(), oListBinding.getContext(), [], [], {
			$$updateGroupId: "submitLater"
		}) as ODataListBinding;
		oTransientListBinding.refreshInternal = function () {
			/* */
		};
		const oTransientContext = oTransientListBinding.create(mParameters.data, true);

		return new Promise(async (resolve, reject) => {
			const sFragmentName = "sap/fe/core/controls/NonComputedVisibleKeyFieldsDialog";
			const oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"),
				oResourceBundle = oParentControl.getController().oResourceBundle,
				oMetaModel = oModel.getMetaModel(),
				aImmutableFields: any[] = [],
				oAppComponent = this._getAppComponent(),
				sPath = (oListBinding.isRelative() ? oListBinding.getResolvedPath() : oListBinding.getPath()) as string,
				oEntitySetContext = oMetaModel.createBindingContext(sPath) as Context,
				sMetaPath = oMetaModel.getMetaPath(sPath);
			for (const i in mFields) {
				aImmutableFields.push(oMetaModel.createBindingContext(`${sMetaPath}/${mFields[i]}`));
			}
			const oImmutableCtxModel = new JSONModel(aImmutableFields);
			const oImmutableCtx = oImmutableCtxModel.createBindingContext("/") as Context;
			const aRequiredProperties = CommonUtils.getRequiredPropertiesFromInsertRestrictions(sMetaPath, oMetaModel);
			const oRequiredPropertyPathsCtxModel = new JSONModel(aRequiredProperties);
			const oRequiredPropertyPathsCtx = oRequiredPropertyPathsCtxModel.createBindingContext("/") as Context;
			const oNewFragment = await XMLPreprocessor.process(
				oFragment,
				{ name: sFragmentName },
				{
					bindingContexts: {
						entitySet: oEntitySetContext,
						fields: oImmutableCtx,
						requiredProperties: oRequiredPropertyPathsCtx
					},
					models: {
						entitySet: oEntitySetContext.getModel(),
						fields: oImmutableCtx.getModel(),
						metaModel: oMetaModel,
						requiredProperties: oRequiredPropertyPathsCtxModel
					}
				}
			);

			let aFormElements: any[] = [];
			const mFieldValueMap: any = {};
			// eslint-disable-next-line prefer-const
			let oCreateButton: Button;

			const validateRequiredProperties = async function () {
				let bEnabled = false;
				try {
					const aResults = await Promise.all(
						aFormElements
							.map(function (oFormElement: any) {
								return oFormElement.getFields()[0];
							})
							.filter(function (oField: any) {
								// The continue button should remain disabled in case of empty required fields.
								return oField.getRequired() || oField.getValueState() === ValueState.Error;
							})
							.map(async function (oField: any) {
								const sFieldId = oField.getId();
								if (sFieldId in mFieldValueMap) {
									try {
										const vValue = await mFieldValueMap[sFieldId];
										return oField.getValue() === "" ? undefined : vValue;
									} catch (err) {
										return undefined;
									}
								}
								return oField.getValue() === "" ? undefined : oField.getValue();
							})
					);
					bEnabled = aResults.every(function (vValue: any) {
						if (Array.isArray(vValue)) {
							vValue = vValue[0];
						}
						return vValue !== undefined && vValue !== null && vValue !== "";
					});
				} catch (err) {
					bEnabled = false;
				}
				oCreateButton.setEnabled(bEnabled);
			};
			const oController = {
				/*
									fired on focus out from field or on selecting a value from the valuehelp.
									the create button is enabled when a value is added.
									liveChange is not fired when value is added from valuehelp.
									value validation is not done for create button enablement.
								*/
				handleChange: (oEvent: any) => {
					const sFieldId = oEvent.getParameter("id");
					mFieldValueMap[sFieldId] = this._onFieldChange(oEvent, oCreateButton, messageHandler, validateRequiredProperties);
				},
				/*
									fired on key press. the create button is enabled when a value is added.
									liveChange is not fired when value is added from valuehelp.
									value validation is not done for create button enablement.
								*/
				handleLiveChange: (oEvent: any) => {
					const sFieldId = oEvent.getParameter("id");
					const vValue = oEvent.getParameter("value");
					mFieldValueMap[sFieldId] = vValue;
					validateRequiredProperties();
				}
			};

			const oDialogContent: any = await Fragment.load({
				definition: oNewFragment,
				controller: oController
			});
			let oResult: any;

			oDialog = new Dialog({
				title: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE", oResourceBundle),
				content: [oDialogContent],
				beginButton: {
					text: CommonUtils.getTranslatedText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE_BUTTON", oResourceBundle),
					type: "Emphasized",
					press: async (oEvent: any) => {
						const createButton = oEvent.getSource();
						createButton.setEnabled(false);
						BusyLocker.lock(oDialog);
						mParameters.bIsCreateDialog = true;
						try {
							const aValues = await Promise.all(
								Object.keys(mFieldValueMap).map(async function (sKey: string) {
									const oValue = await mFieldValueMap[sKey];
									const oDialogValue: any = {};
									oDialogValue[sKey] = oValue;
									return oDialogValue;
								})
							);
							if (mParameters.beforeCreateCallBack) {
								await toES6Promise(
									mParameters.beforeCreateCallBack({
										contextPath: oListBinding && oListBinding.getPath(),
										createParameters: aValues
									})
								);
							}
							const transientData = oTransientContext.getObject();
							const createData: any = {};
							Object.keys(transientData).forEach(function (sPropertyPath: string) {
								const oProperty = oMetaModel.getObject(`${sMetaPath}/${sPropertyPath}`);
								// ensure navigation properties are not part of the payload, deep create not supported
								if (oProperty && oProperty.$kind === "NavigationProperty") {
									return;
								}
								createData[sPropertyPath] = transientData[sPropertyPath];
							});
							const oNewDocumentContext = oListBinding.create(
								createData,
								true,
								mParameters.createAtEnd,
								mParameters.inactive
							);

							const oPromise = this.onAfterCreateCompletion(oListBinding, oNewDocumentContext, mParameters);
							let oResponse: any = await oPromise;
							if (!oResponse || (oResponse && oResponse.bKeepDialogOpen !== true)) {
								oResponse = oResponse ?? {};
								oDialog.setBindingContext(null as any);
								oResponse.newContext = oNewDocumentContext;
								oResult = { response: oResponse };
								oDialog.close();
							}
						} catch (oError: any) {
							// in case of creation failed, dialog should stay open - to achieve the same, nothing has to be done (like in case of success with bKeepDialogOpen)
							if (oError !== FELibrary.Constants.CreationFailed) {
								// other errors are not expected
								oResult = { error: oError };
								oDialog.close();
							}
						} finally {
							BusyLocker.unlock(oDialog);
							createButton.setEnabled(true);
							messageHandler.showMessages();
						}
					}
				},
				endButton: {
					text: CommonUtils.getTranslatedText("C_COMMON_ACTION_PARAMETER_DIALOG_CANCEL", oResourceBundle),
					press: function () {
						oResult = { error: FELibrary.Constants.CancelActionDialog };
						oDialog.close();
					}
				},
				afterClose: function () {
					// show footer as per UX guidelines when dialog is not open
					(oDialog.getBindingContext("internal") as InternalModelContext)?.setProperty("isCreateDialogOpen", false);
					oDialog.destroy();
					oTransientListBinding.destroy();
					if (oResult.error) {
						reject(oResult.error);
					} else {
						resolve(oResult.response);
					}
				}
			} as any);
			aFormElements = oDialogContent?.getAggregation("form").getAggregation("formContainers")[0].getAggregation("formElements");
			if (oParentControl && oParentControl.addDependent) {
				// if there is a parent control specified add the dialog as dependent
				oParentControl.addDependent(oDialog);
			}
			oCreateButton = oDialog.getBeginButton();
			oDialog.setBindingContext(oTransientContext);
			try {
				await CommonUtils.setUserDefaults(
					oAppComponent,
					aImmutableFields,
					oTransientContext,
					false,
					mParameters.createAction,
					mParameters.data
				);
				validateRequiredProperties();
				// footer must not be visible when the dialog is open as per UX guidelines
				(oDialog.getBindingContext("internal") as InternalModelContext).setProperty("isCreateDialogOpen", true);
				oDialog.open();
			} catch (oError: any) {
				await messageHandler.showMessages();
				throw oError;
			}
		});
	}
	onAfterCreateCompletion(oListBinding: any, oNewDocumentContext: any, mParameters: any) {
		let fnResolve: Function;
		const oPromise = new Promise<boolean>((resolve) => {
			fnResolve = resolve;
		});

		const fnCreateCompleted = (oEvent: any) => {
			const oContext = oEvent.getParameter("context"),
				bSuccess = oEvent.getParameter("success");
			if (oContext === oNewDocumentContext) {
				oListBinding.detachCreateCompleted(fnCreateCompleted, this);
				fnResolve(bSuccess);
			}
		};
		const fnSafeContextCreated = () => {
			oNewDocumentContext
				.created()
				.then(undefined, function () {
					Log.trace("transient creation context deleted");
				})
				.catch(function (contextError: any) {
					Log.trace("transient creation context deletion error", contextError);
				});
		};

		oListBinding.attachCreateCompleted(fnCreateCompleted, this);

		return oPromise.then((bSuccess: boolean) => {
			if (!bSuccess) {
				if (!mParameters.keepTransientContextOnFailed) {
					// Cancel the pending POST and delete the context in the listBinding
					fnSafeContextCreated(); // To avoid a 'request cancelled' error in the console
					oListBinding.resetChanges();
					oListBinding.getModel().resetChanges(oListBinding.getUpdateGroupId());

					throw FELibrary.Constants.CreationFailed;
				}
				return { bKeepDialogOpen: true };
			} else {
				return oNewDocumentContext.created();
			}
		});
	}
	/**
	 * Retrieves the name of the NewAction to be executed.
	 *
	 * @function
	 * @static
	 * @private
	 * @name sap.fe.core.TransactionHelper._getNewAction
	 * @memberof sap.fe.core.TransactionHelper
	 * @param oStartupParameters Startup parameters of the application
	 * @param sCreateHash Hash to be checked for action type
	 * @param oMetaModel The MetaModel used to check for NewAction parameter
	 * @param sMetaPath The MetaPath
	 * @returns The name of the action
	 * @ui5-restricted
	 * @final
	 */
	_getNewAction(oStartupParameters: any, sCreateHash: string, oMetaModel: ODataMetaModel, sMetaPath: string) {
		let sNewAction;

		if (oStartupParameters && oStartupParameters.preferredMode && sCreateHash.toUpperCase().indexOf("I-ACTION=CREATEWITH") > -1) {
			const sPreferredMode = oStartupParameters.preferredMode[0];
			sNewAction =
				sPreferredMode.toUpperCase().indexOf("CREATEWITH:") > -1
					? sPreferredMode.substr(sPreferredMode.lastIndexOf(":") + 1)
					: undefined;
		} else if (
			oStartupParameters &&
			oStartupParameters.preferredMode &&
			sCreateHash.toUpperCase().indexOf("I-ACTION=AUTOCREATEWITH") > -1
		) {
			const sPreferredMode = oStartupParameters.preferredMode[0];
			sNewAction =
				sPreferredMode.toUpperCase().indexOf("AUTOCREATEWITH:") > -1
					? sPreferredMode.substr(sPreferredMode.lastIndexOf(":") + 1)
					: undefined;
		} else {
			sNewAction =
				oMetaModel && oMetaModel.getObject !== undefined
					? oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction`) ||
					  oMetaModel.getObject(`${sMetaPath}@com.sap.vocabularies.Common.v1.DraftRoot/NewAction`)
					: undefined;
		}
		return sNewAction;
	}
	/**
	 * Retrieves the label for the title of a specific create action dialog, e.g. Create Sales Order from Quotation.
	 *
	 * The following priority is applied:
	 * 1. label of line-item annotation.
	 * 2. label annotated in the action.
	 * 3. "Create" as a constant from i18n.
	 *
	 * @function
	 * @static
	 * @private
	 * @name sap.fe.core.TransactionHelper._getSpecificCreateActionDialogLabel
	 * @memberof sap.fe.core.TransactionHelper
	 * @param oMetaModel The MetaModel used to check for the NewAction parameter
	 * @param sMetaPath The MetaPath
	 * @param sNewAction Contains the name of the action to be executed
	 * @param oResourceBundleCore ResourceBundle to access the default Create label
	 * @returns The label for the Create Action Dialog
	 * @ui5-restricted
	 * @final
	 */
	_getSpecificCreateActionDialogLabel(
		oMetaModel: ODataMetaModel,
		sMetaPath: string,
		sNewAction: string,
		oResourceBundleCore: ResourceBundle
	) {
		const fnGetLabelFromLineItemAnnotation = function () {
			if (oMetaModel && oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`)) {
				const iLineItemIndex = oMetaModel
					.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`)
					.findIndex(function (oLineItem: any) {
						const aLineItemAction = oLineItem.Action ? oLineItem.Action.split("(") : undefined;
						return aLineItemAction ? aLineItemAction[0] === sNewAction : false;
					});
				return iLineItemIndex > -1
					? oMetaModel.getObject(`${sMetaPath}/@com.sap.vocabularies.UI.v1.LineItem`)[iLineItemIndex].Label
					: undefined;
			} else {
				return undefined;
			}
		};

		return (
			fnGetLabelFromLineItemAnnotation() ||
			(oMetaModel && oMetaModel.getObject(`${sMetaPath}/${sNewAction}@com.sap.vocabularies.Common.v1.Label`)) ||
			(oResourceBundleCore && oResourceBundleCore.getText("C_TRANSACTION_HELPER_SAPFE_ACTION_CREATE"))
		);
	}
}

export default TransactionHelper;
