import ActionRuntime from "sap/fe/core/ActionRuntime";
import CommonUtils from "sap/fe/core/CommonUtils";
import FELibrary from "sap/fe/core/library";
import FieldRuntime from "sap/fe/macros/field/FieldRuntime";
import TableHelper from "sap/fe/macros/table/TableHelper";
import type Context from "sap/ui/model/odata/v4/Context";

const CreationMode = FELibrary.CreationMode;
/**
 * Static class used by Table building block during runtime
 *
 * @private
 * @experimental This module is only for internal/experimental use!
 */
const TableRuntime = {
	displayTableSettings: function (oEvent: any) {
		/*
				 Temporary solution
				 Wait for mdc Table to provide public api to either get button 'Settings' or fire event on this button
				 */
		const oParent = oEvent.getSource().getParent(),
			oSettingsButton = sap.ui.getCore().byId(`${oParent.getId()}-settings`);
		CommonUtils.fireButtonPress(oSettingsButton);
	},
	executeConditionalActionShortcut: function (sButtonMatcher: any, oSource: any) {
		// Get the button related to keyboard shortcut
		const oMdcTable = oSource.getParent();
		if (sButtonMatcher !== CreationMode.CreationRow) {
			const oButton = oMdcTable
				.getActions()
				.reduce(function (aActionButtons: any, oActionToolbarAction: any) {
					return aActionButtons.concat(oActionToolbarAction.getAction());
				}, [])
				.find(function (oActionButton: any) {
					return oActionButton.getId().endsWith(sButtonMatcher);
				});
			CommonUtils.fireButtonPress(oButton);
		} else {
			const oCreationRow = oMdcTable.getAggregation("creationRow");
			if (oCreationRow && oCreationRow.getApplyEnabled() && oCreationRow.getVisible()) {
				oCreationRow.fireApply();
			}
		}
	},
	setContexts: function (
		oTable: any,
		sDeletablePath: any,
		oDraft: any,
		sCollection: any,
		sNavigationAvailableMap: any,
		sActionsMultiselectDisabled: any,
		sUpdatablePath: any
	) {
		const aActionsMultiselectDisabled = sActionsMultiselectDisabled ? sActionsMultiselectDisabled.split(",") : [];
		const oActionOperationAvailableMap = JSON.parse(sCollection);
		const oNavigationAvailableMap =
			sNavigationAvailableMap && sNavigationAvailableMap !== "undefined" && JSON.parse(sNavigationAvailableMap);
		let aSelectedContexts = oTable.getSelectedContexts();
		let isDeletable = false;
		const aDeletableContexts = [];
		const bReadOnlyDraftEnabled = oTable.data("displayModePropertyBinding") === "true" && oDraft !== "undefined";
		const aUpdatableContexts = [];
		const aUnsavedContexts: any[] = [];
		const aLockedContexts: any[] = [];
		// oDynamicActions are bound actions that are available according to some property
		// in each item
		const oDynamicActions = {};
		const oIBN = {};
		let oLockedAndUnsavedContexts: any = {};
		let oModelObject;
		const oInternalModelContext = oTable.getBindingContext("internal");

		oLockedAndUnsavedContexts.aUnsavedContexts = [];
		oLockedAndUnsavedContexts.aLockedContexts = [];

		//do not consider empty rows as selected context
		aSelectedContexts = aSelectedContexts.filter(function (oContext: Context) {
			return !oContext.isInactive();
		});

		oInternalModelContext.setProperty(
			"",
			Object.assign(oInternalModelContext.getObject(), {
				selectedContexts: aSelectedContexts,
				numberOfSelectedContexts: aSelectedContexts.length,
				dynamicActions: oDynamicActions,
				ibn: oIBN,
				deleteEnabled: true,
				deletableContexts: [],
				unSavedContexts: [],
				lockedContexts: [],
				updatableContexts: [],
				semanticKeyHasDraftIndicator: oInternalModelContext.getProperty("semanticKeyHasDraftIndicator")
					? oInternalModelContext.getProperty("semanticKeyHasDraftIndicator")
					: undefined
			})
		);

		for (let i = 0; i < aSelectedContexts.length; i++) {
			const oSelectedContext = aSelectedContexts[i];
			const oContextData = oSelectedContext.getObject();
			for (const key in oContextData) {
				if (key.indexOf("#") === 0) {
					let sActionPath = key;
					sActionPath = sActionPath.substring(1, sActionPath.length);
					oModelObject = oInternalModelContext.getObject();
					oModelObject.dynamicActions[sActionPath] = { enabled: true };
					oInternalModelContext.setProperty("", oModelObject);
				}
			}
			oModelObject = oInternalModelContext.getObject();
			if (sDeletablePath != "undefined") {
				if (oSelectedContext && oSelectedContext.getProperty(sDeletablePath)) {
					if (oDraft !== "undefined" && oContextData.IsActiveEntity === true && oContextData.HasDraftEntity === true) {
						oLockedAndUnsavedContexts = getUnsavedAndLockedContexts(oContextData, oSelectedContext);
					} else {
						aDeletableContexts.push(oSelectedContext);
						oLockedAndUnsavedContexts.isDeletable = true;
					}
				}
				oModelObject["deleteEnabled"] = oLockedAndUnsavedContexts.isDeletable;
			} else if (oDraft !== "undefined" && oContextData.IsActiveEntity === true && oContextData.HasDraftEntity === true) {
				oLockedAndUnsavedContexts = getUnsavedAndLockedContexts(oContextData, oSelectedContext);
			} else {
				aDeletableContexts.push(oSelectedContext);
			}

			// The updatable contexts with mass edit depend on the following:
			// 1. Update is dependendent on current entity property (sUpdatablePath).
			// 2. The table is read only and draft enabled(like LR), in this case only active contexts can be mass edited(not draft contexts).
			//    So, update depends on 'IsActiveEntity' value which needs to be checked.
			const bUpdatableByPath = sUpdatablePath.length === 0 || !!oSelectedContext.getProperty(sUpdatablePath);
			const bNotDraftInReadOnlyMode = !bReadOnlyDraftEnabled || oContextData.IsActiveEntity;
			if (bUpdatableByPath && bNotDraftInReadOnlyMode) {
				aUpdatableContexts.push(oSelectedContext);
			}
		}

		function getUnsavedAndLockedContexts(oContextData: any, oSelectedContext: any) {
			if (oContextData.DraftAdministrativeData.InProcessByUser) {
				aLockedContexts.push(oSelectedContext);
			} else {
				aUnsavedContexts.push(oSelectedContext);
				isDeletable = true;
			}
			return {
				aLockedContexts: aLockedContexts,
				aUnsavedContexts: aUnsavedContexts,
				isDeletable: isDeletable
			};
		}

		if (!oTable.data("enableAnalytics")) {
			TableHelper.setIBNEnablement(oInternalModelContext, oNavigationAvailableMap, aSelectedContexts);
		}

		if (aSelectedContexts.length > 1) {
			this.disableAction(aActionsMultiselectDisabled, oDynamicActions);
		}

		if (oModelObject) {
			oModelObject["deletableContexts"] = aDeletableContexts;
			oModelObject["updatableContexts"] = aUpdatableContexts;
			oModelObject["unSavedContexts"] = oLockedAndUnsavedContexts.aUnsavedContexts;
			oModelObject["lockedContexts"] = oLockedAndUnsavedContexts.aLockedContexts;
			oModelObject["controlId"] = oTable.getId();
			oInternalModelContext.setProperty("", oModelObject);
		}

		return ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
	},
	disableAction: function (aActionsMultiselectDisabled: any, oDynamicActions: any) {
		aActionsMultiselectDisabled.forEach(function (sAction: any) {
			oDynamicActions[sAction] = { bEnabled: false };
		});
	},
	onFieldChangeInCreationRow: function (oEvent: any, oCustomValidationFunction: any) {
		// CREATION ROW CASE
		const mField = FieldRuntime.getFieldStateOnChange(oEvent),
			oSourceField = mField.field,
			sFieldId = oSourceField.getId();

		const oInternalModelContext = oSourceField.getBindingContext("internal"),
			mFieldValidity = oInternalModelContext.getProperty("creationRowFieldValidity"),
			mNewFieldValidity = Object.assign({}, mFieldValidity);

		mNewFieldValidity[sFieldId] = mField.state;
		oInternalModelContext.setProperty("creationRowFieldValidity", mNewFieldValidity);

		// prepare Custom Validation
		if (oCustomValidationFunction) {
			const mCustomValidity = oInternalModelContext.getProperty("creationRowCustomValidity"),
				mNewCustomValidity = Object.assign({}, mCustomValidity);
			mNewCustomValidity[oSourceField.getBinding("value").getPath()] = {
				fieldId: oSourceField.getId()
			};
			oInternalModelContext.setProperty("creationRowCustomValidity", mNewCustomValidity);
			// Remove existing CustomValidation message
			const oMessageManager = sap.ui.getCore().getMessageManager();
			const sTarget = `${oSourceField.getBindingContext().getPath()}/${oSourceField.getBindingPath("value")}`;
			oMessageManager
				.getMessageModel()
				.getData()
				.forEach(function (oMessage: any) {
					if (oMessage.target === sTarget) {
						oMessageManager.removeMessages(oMessage);
					}
				});
		}
	}
};

export default TableRuntime;
