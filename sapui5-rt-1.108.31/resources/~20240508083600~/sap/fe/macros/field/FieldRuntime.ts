import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import CollaborationActivitySync from "sap/fe/core/controllerextensions/collaboration/ActivitySync";
import { Activity } from "sap/fe/core/controllerextensions/collaboration/CollaborationCommon";
import draft from "sap/fe/core/controllerextensions/editFlow/draft";
import FieldWrapper from "sap/fe/core/controls/FieldWrapper";
import type FileWrapper from "sap/fe/core/controls/FileWrapper";
import type { EnhanceWithUI5 } from "sap/fe/core/helpers/ClassSupport";
import KeepAliveHelper from "sap/fe/core/helpers/KeepAliveHelper";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import type PageController from "sap/fe/core/PageController";
import CommonHelper from "sap/fe/macros/CommonHelper";
import FieldAPI from "sap/fe/macros/field/FieldAPI";
import ResourceModel from "sap/fe/macros/ResourceModel";
import MessageBox from "sap/m/MessageBox";
import type Event from "sap/ui/base/Event";
import type Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import CustomData from "sap/ui/core/CustomData";
import IconPool from "sap/ui/core/IconPool";
import type Controller from "sap/ui/core/mvc/Controller";
import Filter from "sap/ui/model/Filter";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type FileUploader from "sap/ui/unified/FileUploader";
import FileUploaderParameter from "sap/ui/unified/FileUploaderParameter";
import openWindow from "sap/ui/util/openWindow";

/**
 * Static class used by "sap.ui.mdc.Field" during runtime
 *
 * @private
 * @experimental This module is only for internal/experimental use!
 */
const FieldRuntime = {
	resetChangesHandler: undefined as any,
	uploadPromises: undefined as any,

	formatDraftOwnerTextInPopover: function (
		bHasDraftEntity: any,
		sDraftInProcessByUser: any,
		sDraftLastChangedByUser: any,
		sDraftInProcessByUserDesc: any,
		sDraftLastChangedByUserDesc: any
	) {
		if (bHasDraftEntity) {
			const sUserDescription =
				sDraftInProcessByUserDesc || sDraftInProcessByUser || sDraftLastChangedByUserDesc || sDraftLastChangedByUser;

			if (!sUserDescription) {
				return ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_UNKNOWN");
			} else {
				return sDraftInProcessByUser
					? ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_LOCKED_BY_KNOWN", sUserDescription)
					: ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_UNSAVED_CHANGES_BY_KNOWN", sUserDescription);
			}
		} else {
			return ResourceModel.getText("M_FIELD_RUNTIME_DRAFT_POPOVER_NO_DATA_TEXT");
		}
	},

	/**
	 * Triggers an internal navigation on the link pertaining to DataFieldWithNavigationPath.
	 *
	 * @param oSource Source of the press event
	 * @param oController Instance of the controller
	 * @param sSemanticObjectName Semantic object name
	 */
	onDataFieldWithNavigationPath: function (oSource: Control, oController: PageController, sSemanticObjectName: string) {
		if (oController._routing) {
			let oBindingContext = oSource.getBindingContext() as Context;
			const oView = CommonUtils.getTargetView(oSource),
				oMetaModel = oBindingContext.getModel().getMetaModel() as ODataMetaModel,
				fnNavigate = function (oContext?: any) {
					if (oContext) {
						oBindingContext = oContext;
					}
					oController._routing.navigateToTarget(oBindingContext, sSemanticObjectName, undefined, true);
				};
			// Show draft loss confirmation dialog in case of Object page
			if (oView.getViewData().converterType === "ObjectPage" && !ModelHelper.isStickySessionSupported(oMetaModel)) {
				draft.processDataLossOrDraftDiscardConfirmation(
					fnNavigate,
					Function.prototype,
					oBindingContext,
					oView.getController(),
					true,
					draft.NavigationType.ForwardNavigation
				);
			} else {
				fnNavigate();
			}
		} else {
			Log.error(
				"FieldRuntime: No routing listener controller extension found. Internal navigation aborted.",
				"sap.fe.macros.field.FieldRuntime",
				"onDataFieldWithNavigationPath"
			);
		}
	},
	isDraftIndicatorVisible: function (
		sPropertyPath: any,
		sSemanticKeyHasDraftIndicator: any,
		HasDraftEntity: any,
		IsActiveEntity: any,
		hideDraftInfo: any
	) {
		if (IsActiveEntity !== undefined && HasDraftEntity !== undefined && (!IsActiveEntity || HasDraftEntity) && !hideDraftInfo) {
			return sPropertyPath === sSemanticKeyHasDraftIndicator;
		} else {
			return false;
		}
	},
	hasTargets: function (bSemanticObjectHasTargets: any /*sSemanticObjectPathValue: any*/) {
		return bSemanticObjectHasTargets ? bSemanticObjectHasTargets : false;
	},
	getStateDependingOnSemanticObjectTargets: function (bSemanticObjectHasTargets: any /*sSemanticObjectPathValue: any*/) {
		return bSemanticObjectHasTargets ? "Information" : "None";
	},
	/**
	 * Handler for the validateFieldGroup event.
	 *
	 * @function
	 * @name onValidateFieldGroup
	 * @param oController The controller of the page containing the field
	 * @param oEvent The event object passed by the validateFieldGroup event
	 */
	onValidateFieldGroup: function (oController: object, oEvent: object) {
		const oFEController = FieldRuntime._getExtensionController(oController);
		oFEController._sideEffects.handleFieldGroupChange(oEvent);
	},
	/**
	 * Handler for the change event.
	 * Store field group IDs of this field for requesting side effects when required.
	 * We store them here to ensure a change in the value of the field has taken place.
	 *
	 * @function
	 * @name handleChange
	 * @param oController The controller of the page containing the field
	 * @param oEvent The event object passed by the change event
	 */
	handleChange: function (oController: object, oEvent: Event) {
		const oSourceField = oEvent.getSource() as Control,
			bIsTransient = oSourceField && (oSourceField.getBindingContext() as any).isTransient(),
			pValueResolved = oEvent.getParameter("promise") || Promise.resolve(),
			oSource = oEvent.getSource(),
			bValid = oEvent.getParameter("valid");

		// TODO: currently we have undefined and true... and our creation row implementation relies on this.
		// I would move this logic to this place as it's hard to understand for field consumer

		pValueResolved
			.then(function () {
				// The event is gone. For now we'll just recreate it again
				(oEvent as any).oSource = oSource;
				(oEvent as any).mParameters = {
					valid: bValid
				};
				(FieldAPI as any).handleChange(oEvent, oController);
			})
			.catch(function (/*oError: any*/) {
				// The event is gone. For now we'll just recreate it again
				(oEvent as any).oSource = oSource;
				(oEvent as any).mParameters = {
					valid: false
				};

				// as the UI might need to react on. We could provide a parameter to inform if validation
				// was successful?
				(FieldAPI as any).handleChange(oEvent, oController);
			});

		// Use the FE Controller instead of the extensionAPI to access internal FE controllers
		const oFEController = FieldRuntime._getExtensionController(oController);

		oFEController._editFlow.syncTask(pValueResolved);

		// if the context is transient, it means the request would fail anyway as the record does not exist in reality
		// TODO: should the request be made in future if the context is transient?
		if (bIsTransient) {
			return;
		}

		// SIDE EFFECTS
		oFEController._sideEffects.handleFieldChange(oEvent, pValueResolved);

		// Collaboration Draft Activity Sync
		const oField = oEvent.getSource() as Control,
			bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
		let oBinding, sBindingPath;
		if (bCollaborationEnabled && this.getFieldStateOnChange(oEvent).state["validity"]) {
			/* TODO: for now we use always the first binding part (so in case of composite bindings like amount and
					unit or currency only the amount is considered) */
			oBinding = (oField.getBindingContext() as any).getBinding();
			if (!oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
				const oView = CommonUtils.getTargetView(oField);
				oBinding = oView.getBindingContext().getBinding();
			}

			const data = [
				...(oField.getBindingInfo("value") as any)?.parts,
				...((oField.getBindingInfo("additionalValue") as any)?.parts || [])
			].map(function (part: any) {
				if (part) {
					sBindingPath = part.path;
					return `${oField.getBindingContext()?.getPath()}/${sBindingPath}`;
				}
			}) as [];
			oBinding.attachEventOnce("patchCompleted", function () {
				CollaborationActivitySync.send(oField, Activity.Change, data);
			});
		}
	},

	handleLiveChange: function (oEvent: any) {
		// Collaboration Draft Activity Sync
		const oField = oEvent.getSource(),
			bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);

		if (bCollaborationEnabled) {
			/* TODO: for now we use always the first binding part (so in case of composite bindings like amount and
					unit or currency only the amount is considered) */
			const sBindingPath = oField.getBindingInfo("value").parts[0].path;
			const sFullPath = `${oField.getBindingContext().getPath()}/${sBindingPath}`;
			CollaborationActivitySync.send(oField, Activity.LiveChange, sFullPath);

			// If the user reverted the change no change event is sent therefore we have to handle it here
			if (!this.resetChangesHandler) {
				this.resetChangesHandler = () => {
					if (oField.getValue() === oField.getBinding("value").getValue()) {
						// the user did a change but reverted it. to be checked if there is a better way to determine
						CollaborationActivitySync.send(oField, Activity.Undo, sFullPath);
					}
					oField.detachBrowserEvent("focusout", this.resetChangesHandler);
					delete this.resetChangesHandler;
				};
				oField.attachBrowserEvent("focusout", this.resetChangesHandler);
			}
		}
	},
	handleOpenPicker: function (oEvent: any) {
		// Collaboration Draft Activity Sync
		const oField = oEvent.getSource(),
			bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);

		if (bCollaborationEnabled) {
			const sBindingPath = oField.getBindingInfo("value").parts[0].path;
			const sFullPath = `${oField.getBindingContext().getPath()}/${sBindingPath}`;
			CollaborationActivitySync.send(oField, Activity.LiveChange, sFullPath);
		}
	},
	handleClosePicker: function (oEvent: any) {
		// Collaboration Draft Activity Sync
		const oField = oEvent.getSource(),
			bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);

		if (bCollaborationEnabled) {
			const sBindingPath = oField.getBindingInfo("value").parts[0].path;
			const sFullPath = `${oField.getBindingContext().getPath()}/${sBindingPath}`;
			if (new Date(oField.getValue()).toDateString() === new Date(oField.getBinding("value").getValue() || "").toDateString()) {
				// the user did a change but reverted it. to be checked if there is a better way to determine
				CollaborationActivitySync.send(oField, Activity.Undo, sFullPath);
			}
		}
	},
	handleOpenUploader: function (oEvent: any) {
		// Collaboration Draft Activity Sync
		const oField = oEvent.getSource(),
			bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);

		if (bCollaborationEnabled) {
			const sBindingPath = oField.getParent().getAvatar().getBindingInfo("src").parts[0].path;
			const sFullPath = `${oField.getBindingContext()?.getPath()}/${sBindingPath}`;
			CollaborationActivitySync.send(oField, Activity.LiveChange, sFullPath);
		}
	},
	handleCloseUploader: function (oEvent: any) {
		// Collaboration Draft Activity Sync
		const oField = oEvent.getSource(),
			bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
		if (bCollaborationEnabled) {
			const sBindingPath = oField.getParent().getAvatar().getBindingInfo("src").parts[0].path;
			const sFullPath = `${oField.getBindingContext()?.getPath()}/${sBindingPath}`;
			CollaborationActivitySync.send(oField, Activity.Undo, sFullPath);
		}
	},

	/**
	 * Gets the field value and validity on a change event.
	 *
	 * @function
	 * @name fieldValidityOnChange
	 * @param oEvent The event object passed by the change event
	 * @returns Field value and validity
	 */
	getFieldStateOnChange: function (oEvent: Event): any {
		let oSourceField = oEvent.getSource() as any,
			mFieldState = {};
		const _isBindingStateMessages = function (oBinding: any) {
			return oBinding && oBinding.getDataState() ? oBinding.getDataState().getInvalidValue() === undefined : true;
		};
		if (oSourceField.isA("sap.fe.macros.field.FieldAPI")) {
			oSourceField = (oSourceField as EnhanceWithUI5<FieldAPI>).getContent();
		}

		if (oSourceField.isA(FieldWrapper.getMetadata().getName()) && oSourceField.getEditMode() === "Editable") {
			oSourceField = oSourceField.getContentEdit()[0];
		}

		if (oSourceField.isA("sap.ui.mdc.Field")) {
			let bIsValid = oEvent.getParameter("valid") || oEvent.getParameter("isValid");
			if (bIsValid === undefined) {
				if (oSourceField.getMaxConditions() === 1) {
					const oValueBindingInfo = oSourceField.getBindingInfo("value");
					bIsValid = _isBindingStateMessages(oValueBindingInfo && oValueBindingInfo.binding);
				}
				if (oSourceField.getValue() === "" && !oSourceField.getProperty("required")) {
					bIsValid = true;
				}
			}
			mFieldState = {
				fieldValue: oSourceField.getValue(),
				validity: !!bIsValid
			};
		} else {
			// oSourceField extends from a FileUploader || Input || is a CheckBox
			const oBinding =
				oSourceField.getBinding("uploadUrl") || oSourceField.getBinding("value") || oSourceField.getBinding("selected");
			mFieldState = {
				fieldValue: oBinding && oBinding.getValue(),
				validity: _isBindingStateMessages(oBinding)
			};
		}
		return {
			field: oSourceField,
			state: mFieldState
		};
	},
	_fnFixHashQueryString: function (sCurrentHash: any) {
		if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
			// sCurrentHash can contain query string, cut it off!
			sCurrentHash = sCurrentHash.split("?")[0];
		}
		return sCurrentHash;
	},
	_fnGetLinkInformation: function (_oSource: any, _oLink: any, _sPropertyPath: any, _sValue: any, fnSetActive: any) {
		const oModel = _oLink && _oLink.getModel();
		const oMetaModel = oModel && oModel.getMetaModel();
		const sSemanticObjectName = _sValue || (_oSource && _oSource.getValue());
		const oView = _oLink && CommonUtils.getTargetView(_oLink);
		const oInternalModelContext = oView && oView.getBindingContext("internal");
		const oAppComponent = oView && CommonUtils.getAppComponent(oView);
		const oShellServiceHelper = oAppComponent && oAppComponent.getShellServices();
		const pGetLinksPromise = oShellServiceHelper && oShellServiceHelper.getLinksWithCache([[{ semanticObject: sSemanticObjectName }]]);
		const aSemanticObjectUnavailableActions =
			oMetaModel && oMetaModel.getObject(`${_sPropertyPath}@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions`);
		return {
			SemanticObjectName: sSemanticObjectName,
			SemanticObjectFullPath: _sPropertyPath, //sSemanticObjectFullPath,
			MetaModel: oMetaModel,
			InternalModelContext: oInternalModelContext,
			ShellServiceHelper: oShellServiceHelper,
			GetLinksPromise: pGetLinksPromise,
			SemanticObjectUnavailableActions: aSemanticObjectUnavailableActions,
			fnSetActive: fnSetActive
		};
	},
	_fnQuickViewHasNewCondition: function (oSemanticObjectPayload: any, _oLinkInfo: any) {
		if (oSemanticObjectPayload && oSemanticObjectPayload.path && oSemanticObjectPayload.path === _oLinkInfo.SemanticObjectFullPath) {
			// Got the resolved Semantic Object!
			const bResultingNewConditionForConditionalWrapper =
				oSemanticObjectPayload[!_oLinkInfo.SemanticObjectUnavailableActions ? "HasTargetsNotFiltered" : "HasTargets"];
			_oLinkInfo.fnSetActive(!!bResultingNewConditionForConditionalWrapper);
			return true;
		} else {
			return false;
		}
	},
	_fnQuickViewSetNewConditionForConditionalWrapper: function (_oLinkInfo: any, _oFinalSemanticObjects: any) {
		if (_oFinalSemanticObjects[_oLinkInfo.SemanticObjectName]) {
			let sTmpPath, oSemanticObjectPayload;
			const aSemanticObjectPaths = Object.keys(_oFinalSemanticObjects[_oLinkInfo.SemanticObjectName]);
			for (const iPathsCount in aSemanticObjectPaths) {
				sTmpPath = aSemanticObjectPaths[iPathsCount];
				oSemanticObjectPayload =
					_oFinalSemanticObjects[_oLinkInfo.SemanticObjectName] &&
					_oFinalSemanticObjects[_oLinkInfo.SemanticObjectName][sTmpPath];
				if (FieldRuntime._fnQuickViewHasNewCondition(oSemanticObjectPayload, _oLinkInfo)) {
					break;
				}
			}
		}
	},
	_fnUpdateSemanticObjectsTargetModel: function (oEvent: any, sValue: any, oControl: any, _sPropertyPath: any) {
		const oSource = oEvent && oEvent.getSource();
		let fnSetActive;
		if (oControl.isA("sap.m.ObjectStatus")) {
			fnSetActive = (bActive: boolean) => oControl.setActive(bActive);
		}
		if (oControl.isA("sap.m.ObjectIdentifier")) {
			fnSetActive = (bActive: boolean) => oControl.setTitleActive(bActive);
		}
		const oConditionalWrapper = oControl && oControl.getParent();
		if (oConditionalWrapper && oConditionalWrapper.isA("sap.fe.core.controls.ConditionalWrapper")) {
			fnSetActive = (bActive: boolean) => oConditionalWrapper.setCondition(bActive);
		}
		if (fnSetActive !== undefined) {
			const oLinkInfo = FieldRuntime._fnGetLinkInformation(oSource, oControl, _sPropertyPath, sValue, fnSetActive);
			oLinkInfo.fnSetActive = fnSetActive;
			const sCurrentHash = FieldRuntime._fnFixHashQueryString(CommonUtils.getHash());
			CommonUtils.updateSemanticTargets(
				[oLinkInfo.GetLinksPromise],
				[{ semanticObject: oLinkInfo.SemanticObjectName, path: oLinkInfo.SemanticObjectFullPath }],
				oLinkInfo.InternalModelContext,
				sCurrentHash
			)
				.then(function (oFinalSemanticObjects: any) {
					if (oFinalSemanticObjects) {
						FieldRuntime._fnQuickViewSetNewConditionForConditionalWrapper(oLinkInfo, oFinalSemanticObjects);
					}
				})
				.catch(function (oError: any) {
					Log.error("Cannot update Semantic Targets model", oError);
				});
		}
	},
	_checkControlHasModelAndBindingContext(_control: Control) {
		if (!_control.getModel() || !_control.getBindingContext()) {
			return false;
		} else {
			return true;
		}
	},
	_checkCustomDataValueBeforeUpdatingSemanticObjectModel(_control: Control, propertyPath: string, aCustomData: CustomData[]): void {
		let sSemanticObjectPathValue: any;
		let oValueBinding;
		const _fnCustomDataValueIsString = function (semanticObjectPathValue: any) {
			return !(semanticObjectPathValue !== null && typeof semanticObjectPathValue === "object");
		};
		// remove technical custom datas set by UI5
		aCustomData = aCustomData.filter((customData) => customData.getKey() !== "sap-ui-custom-settings");
		for (const index in aCustomData) {
			sSemanticObjectPathValue = aCustomData[index].getValue();
			if (!sSemanticObjectPathValue && _fnCustomDataValueIsString(sSemanticObjectPathValue)) {
				oValueBinding = aCustomData[index].getBinding("value");
				if (oValueBinding) {
					oValueBinding.attachEventOnce("change", function (_oChangeEvent: any) {
						FieldRuntime._fnUpdateSemanticObjectsTargetModel(_oChangeEvent, null, _control, propertyPath);
					});
				}
			} else if (_fnCustomDataValueIsString(sSemanticObjectPathValue)) {
				FieldRuntime._fnUpdateSemanticObjectsTargetModel(null, sSemanticObjectPathValue, _control, propertyPath);
			}
		}
	},
	LinkModelContextChange: function (oEvent: any, sProperty: any, sPathToProperty: any): void {
		const control = oEvent.getSource();
		if (FieldRuntime._checkControlHasModelAndBindingContext(control)) {
			const sPropertyPath = `${sPathToProperty}/${sProperty}`;
			const mdcLink = control.getDependents().length ? control.getDependents()[0] : undefined;
			const aCustomData = mdcLink?.getCustomData();
			if (aCustomData && aCustomData.length > 0) {
				FieldRuntime._checkCustomDataValueBeforeUpdatingSemanticObjectModel(control, sPropertyPath, aCustomData);
			}
		}
	},
	openExternalLink: function (event: Event) {
		const source = event.getSource() as any;
		if (source.data("url") && source.getProperty("text") !== "") {
			// This opens the link in the same tab as the link. It was done to be more consistent with other type of links.
			openWindow(source.data("url"), "_self");
		}
	},
	pressLink: async function (oEvent: any): Promise<void> {
		const oSource = oEvent.getSource();
		const oLink = oSource.isA("sap.m.ObjectIdentifier")
			? oSource.findElements(false, (elem: Event) => {
					return elem.isA("sap.m.Link");
			  })[0]
			: oSource;

		async function openLink(mdcLink: any) {
			try {
				const sHref = await mdcLink.getTriggerHref();
				if (!sHref) {
					try {
						await mdcLink.open(oLink);
					} catch (oError: any) {
						Log.error("Cannot retrieve the QuickView Popover dialog", oError);
					}
				} else {
					const oView = CommonUtils.getTargetView(oLink);
					const oAppComponent = CommonUtils.getAppComponent(oView);
					const oShellServiceHelper = oAppComponent.getShellServices();
					const oShellHash = oShellServiceHelper.parseShellHash(sHref);
					const oNavArgs = {
						target: {
							semanticObject: oShellHash.semanticObject,
							action: oShellHash.action
						},
						params: oShellHash.params
					};

					KeepAliveHelper.storeControlRefreshStrategyForHash(oView, oShellHash);

					if (CommonUtils.isStickyEditMode(oLink) !== true) {
						//URL params and xappState has been generated earlier hence using toExternal
						oShellServiceHelper.toExternal(oNavArgs as any, oAppComponent);
					} else {
						try {
							const sNewHref = await oShellServiceHelper.hrefForExternalAsync(oNavArgs, oAppComponent);
							openWindow(sNewHref);
						} catch (oError: any) {
							Log.error(`Error while retireving hrefForExternal : ${oError}`);
						}
					}
				}
			} catch (oError: any) {
				Log.error("Error triggering link Href", oError);
			}
		}

		if (oSource.getDependents() && oSource.getDependents().length > 0 && oLink.getProperty("text") !== "") {
			const oFieldInfo = oSource.getDependents()[0];
			if (oFieldInfo && oFieldInfo.isA("sap.ui.mdc.Link")) {
				await openLink(oFieldInfo);
			}
		}
		return oLink;
	},
	uploadStream: function (controller: Controller, event: Event) {
		const fileUploader = event.getSource() as FileUploader,
			FEController = FieldRuntime._getExtensionController(controller),
			fileWrapper = fileUploader.getParent() as unknown as FileWrapper,
			uploadUrl = fileWrapper.getUploadUrl();

		if (uploadUrl !== "") {
			fileWrapper.setUIBusy(true);

			// use uploadUrl from FileWrapper which returns a canonical URL
			fileUploader.setUploadUrl(uploadUrl);

			fileUploader.removeAllHeaderParameters();
			const token = (fileUploader.getModel() as any)?.getHttpHeaders()["X-CSRF-Token"];
			if (token) {
				const headerParameterCSRFToken = new FileUploaderParameter();
				headerParameterCSRFToken.setName("x-csrf-token");
				headerParameterCSRFToken.setValue(token);
				fileUploader.addHeaderParameter(headerParameterCSRFToken);
			}
			const eTag = (fileUploader.getBindingContext() as Context | undefined | null)?.getProperty("@odata.etag");
			if (eTag) {
				const headerParameterETag = new FileUploaderParameter();
				headerParameterETag.setName("If-Match");
				headerParameterETag.setValue(eTag);
				fileUploader.addHeaderParameter(headerParameterETag);
			}
			const headerParameterAccept = new FileUploaderParameter();
			headerParameterAccept.setName("Accept");
			headerParameterAccept.setValue("application/json");
			fileUploader.addHeaderParameter(headerParameterAccept);

			// synchronize upload with other requests
			const uploadPromise = new Promise((resolve: any, reject: any) => {
				this.uploadPromises = this.uploadPromises || {};
				this.uploadPromises[fileUploader.getId()] = {
					resolve: resolve,
					reject: reject
				};
				fileUploader.upload();
			});
			FEController._editFlow.syncTask(uploadPromise);
		} else {
			MessageBox.error(ResourceModel.getText("M_FIELD_FILEUPLOADER_ABORTED_TEXT"));
		}
	},

	handleUploadComplete: function (
		event: Event,
		propertyFileName: { path: string } | undefined,
		propertyPath: string,
		controller: Controller
	) {
		const status = event.getParameter("status"),
			fileUploader = event.getSource() as FileUploader,
			fileWrapper = fileUploader.getParent() as unknown as FileWrapper;

		fileWrapper.setUIBusy(false);

		if (status === 0 || status >= 400) {
			this._displayMessageForFailedUpload(event);
			this.uploadPromises[fileUploader.getId()].reject();
		} else {
			const context = fileUploader.getBindingContext() as Context | undefined | null,
				newETag = event.getParameter("headers").etag;

			if (newETag) {
				// set new etag for filename update, but without sending patch request
				context?.setProperty("@odata.etag", newETag, null as any);
			}

			// set filename for link text
			if (propertyFileName?.path) {
				context?.setProperty(propertyFileName.path, fileUploader.getValue());
			}

			// invalidate the property that not gets updated otherwise
			context?.setProperty(propertyPath, null, null as any);
			context?.setProperty(propertyPath, undefined, null as any);

			this._callSideEffectsForStream(event, fileWrapper, controller);

			this.uploadPromises[fileUploader.getId()].resolve();
		}

		// Collaboration Draft Activity Sync
		const oField = event.getSource() as Control,
			bCollaborationEnabled = CollaborationActivitySync.isConnected(oField);
		let sBindingPath;
		if (bCollaborationEnabled) {
			const data = [
				...(oField.getParent() as any).getAvatar().getBindingInfo("src")?.parts,
				...((oField.getParent() as any).getAvatar().getBindingInfo("additionalValue")?.parts || [])
			].map(function (part: any) {
				if (part) {
					sBindingPath = part.path;
					return `${oField.getBindingContext()?.getPath()}/${sBindingPath}`;
				}
			}) as [];
			CollaborationActivitySync.send(oField, Activity.Change, data);
		}

		delete this.uploadPromises[fileUploader.getId()];
	},

	_displayMessageForFailedUpload: function (oEvent: any) {
		// handling of backend errors
		const sError = oEvent.getParameter("responseRaw") || oEvent.getParameter("response");
		let sMessageText, oError;
		try {
			oError = sError && JSON.parse(sError);
			sMessageText = oError.error && oError.error.message;
		} catch (e) {
			sMessageText = sError || ResourceModel.getText("M_FIELD_FILEUPLOADER_ABORTED_TEXT");
		}
		MessageBox.error(sMessageText);
	},

	removeStream: function (oEvent: any, sPropertyPath: any, oController: any) {
		const oDeleteButton = oEvent.getSource(),
			oFileWrapper = oDeleteButton.getParent(),
			oContext = oFileWrapper.getBindingContext();

		// streams are removed by assigning the null value
		oContext.setProperty(sPropertyPath, null);
		// When setting the property to null, the uploadUrl (@@MODEL.format) is set to "" by the model
		//	with that another upload is not possible before refreshing the page
		// (refreshing the page would recreate the URL)
		//	This is the workaround:
		//	We set the property to undefined only on the frontend which will recreate the uploadUrl
		oContext.setProperty(sPropertyPath, undefined, null);

		this._callSideEffectsForStream(oEvent, oFileWrapper, oController);

		// Collaboration Draft Activity Sync
		const bCollaborationEnabled = CollaborationActivitySync.isConnected(oDeleteButton);
		let oBinding, sBindingPath;
		if (bCollaborationEnabled) {
			oBinding = oContext.getBinding();
			if (!oBinding.isA("sap.ui.model.odata.v4.ODataListBinding")) {
				const oView = CommonUtils.getTargetView(oDeleteButton);
				oBinding = oView.getBindingContext().getBinding();
			}

			const data = [
				...oFileWrapper.getAvatar().getBindingInfo("src")?.parts,
				...(oFileWrapper.getAvatar().getBindingInfo("additionalValue")?.parts || [])
			].map(function (part: any) {
				if (part) {
					sBindingPath = part.path;
					return `${oContext.getPath()}/${sBindingPath}`;
				}
			}) as [];
			CollaborationActivitySync.send(oDeleteButton, Activity.LiveChange, data);

			oBinding.attachEventOnce("patchCompleted", function () {
				CollaborationActivitySync.send(oDeleteButton, Activity.Change, data);
			});
		}
	},

	_callSideEffectsForStream: function (oEvent: any, oControl: any, oController: any) {
		const oFEController = FieldRuntime._getExtensionController(oController);
		if (oControl && oControl.getBindingContext().isTransient()) {
			return;
		}
		if (oControl) {
			oEvent.oSource = oControl;
		}
		oFEController._sideEffects.handleFieldChange(oEvent);
	},

	getIconForMimeType: function (sMimeType: any) {
		return IconPool.getIconForMimeType(sMimeType);
	},

	/**
	 * Method to retrieve text from value list for DataField.
	 *
	 * @function
	 * @name retrieveTextFromValueList
	 * @param sPropertyValue The property value of the datafield
	 * @param sPropertyFullPath The property full path's
	 * @param sDisplayFormat The display format for the datafield
	 * @returns The formatted value in corresponding display format.
	 */
	retrieveTextFromValueList: function (sPropertyValue: string, sPropertyFullPath: string, sDisplayFormat: string) {
		let sTextProperty: string;
		let oMetaModel;
		let sPropertyName: string;
		if (sPropertyValue) {
			oMetaModel = CommonHelper.getMetaModel();
			sPropertyName = oMetaModel.getObject(`${sPropertyFullPath}@sapui.name`);
			return oMetaModel
				.requestValueListInfo(sPropertyFullPath, true)
				.then(function (mValueListInfo: any) {
					// take the "" one if exists, otherwise take the first one in the object TODO: to be discussed
					const oValueListInfo = mValueListInfo[mValueListInfo[""] ? "" : Object.keys(mValueListInfo)[0]];
					const oValueListModel = oValueListInfo.$model;
					const oMetaModelValueList = oValueListModel.getMetaModel();
					const oParamWithKey = oValueListInfo.Parameters.find(function (oParameter: any) {
						return oParameter.LocalDataProperty && oParameter.LocalDataProperty.$PropertyPath === sPropertyName;
					});
					if (oParamWithKey && !oParamWithKey.ValueListProperty) {
						return Promise.reject(`Inconsistent value help annotation for ${sPropertyName}`);
					}
					const oTextAnnotation = oMetaModelValueList.getObject(
						`/${oValueListInfo.CollectionPath}/${oParamWithKey.ValueListProperty}@com.sap.vocabularies.Common.v1.Text`
					);

					if (oTextAnnotation && oTextAnnotation.$Path) {
						sTextProperty = oTextAnnotation.$Path;
						const oFilter = new Filter({
							path: oParamWithKey.ValueListProperty,
							operator: "EQ",
							value1: sPropertyValue
						});
						const oListBinding = oValueListModel.bindList(`/${oValueListInfo.CollectionPath}`, undefined, undefined, oFilter, {
							"$select": sTextProperty
						});
						return oListBinding.requestContexts(0, 2);
					} else {
						sDisplayFormat = "Value";
						return sPropertyValue;
					}
				})
				.then(function (aContexts: any) {
					const sDescription = sTextProperty ? aContexts[0]?.getObject()[sTextProperty] : "";
					switch (sDisplayFormat) {
						case "Description":
							return sDescription;
						case "DescriptionValue":
							return Core.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT", [
								sDescription,
								sPropertyValue
							]);
						case "ValueDescription":
							return Core.getLibraryResourceBundle("sap.fe.core").getText("C_FORMAT_FOR_TEXT_ARRANGEMENT", [
								sPropertyValue,
								sDescription
							]);
						default:
							return sPropertyValue;
					}
				})
				.catch(function (oError: any) {
					const sMsg =
						oError.status && oError.status === 404
							? `Metadata not found (${oError.status}) for value help of property ${sPropertyFullPath}`
							: oError.message;
					Log.error(sMsg);
				});
		}
		return sPropertyValue;
	},

	handleTypeMissmatch: function (oEvent: any) {
		MessageBox.error(ResourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE"), {
			details:
				`<p><strong>${ResourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE_DETAILS_SELECTED")}</strong></p>${
					oEvent.getParameters().mimeType
				}<br><br>` +
				`<p><strong>${ResourceModel.getText("M_FIELD_FILEUPLOADER_WRONG_MIMETYPE_DETAILS_ALLOWED")}</strong></p>${oEvent
					.getSource()
					.getMimeType()
					.toString()
					.replaceAll(",", ", ")}`,
			contentWidth: "150px"
		} as any);
	},

	handleFileSizeExceed: function (oEvent: any /*iFileSize: any*/) {
		MessageBox.error(ResourceModel.getText("M_FIELD_FILEUPLOADER_FILE_TOO_BIG", oEvent.getSource().getMaximumFileSize().toFixed(3)), {
			contentWidth: "150px"
		} as any);
	},

	_getExtensionController: function (oController: any) {
		return oController.isA("sap.fe.core.ExtensionAPI") ? oController._controller : oController;
	}
};

/**
 * @global
 */
export default FieldRuntime;
