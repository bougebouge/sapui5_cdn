import CommonUtils from "sap/fe/core/CommonUtils";
import { compileExpression, constant, transformRecursively } from "sap/fe/core/helpers/BindingToolkit";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
const ActionRuntime = {
	/**
	 * Sets the action enablement.
	 *
	 * @function
	 * @name setActionEnablement
	 * @param oInternalModelContext Object containing the context model
	 * @param oActionOperationAvailableMap Map containing the operation availability of actions
	 * @param aSelectedContexts Array containing selected contexts of the chart
	 * @param sControl Control name
	 * @returns Promise.all(aPromises)
	 * @ui5-restricted
	 */
	setActionEnablement: function (
		oInternalModelContext: InternalModelContext,
		oActionOperationAvailableMap: any,
		aSelectedContexts: any[],
		sControl: string
	) {
		const aPromises = [];
		for (const sAction in oActionOperationAvailableMap) {
			let aRequestPromises = [];
			oInternalModelContext.setProperty(sAction, false);
			const sProperty = oActionOperationAvailableMap[sAction];
			for (let i = 0; i < aSelectedContexts.length; i++) {
				const oSelectedContext = aSelectedContexts[i];
				if (oSelectedContext) {
					const oContextData = oSelectedContext.getObject();
					if (sControl === "chart") {
						if ((sProperty === null && !!oContextData[`#${sAction}`]) || oSelectedContext.getObject(sProperty)) {
							//look for action advertisement if present and its value is not null
							oInternalModelContext.setProperty(sAction, true);
							break;
						}
					} else if (sControl === "table") {
						aRequestPromises = this._setActionEnablementForTable(
							oSelectedContext,
							oInternalModelContext,
							sAction,
							sProperty,
							aRequestPromises
						);
					}
				}
			}
			if (sControl === "table") {
				if (!aSelectedContexts.length) {
					oInternalModelContext.setProperty(`dynamicActions/${sAction}`, {
						bEnabled: false,
						aApplicable: [],
						aNotApplicable: []
					});
					aPromises.push(CommonUtils.setContextsBasedOnOperationAvailable(oInternalModelContext, []));
				} else if (aSelectedContexts.length && typeof sProperty === "string") {
					// When all property values have been retrieved, set
					// The applicable and not-applicable selected contexts for each action and
					// The enabled property of the dynamic action in internal model context.
					aPromises.push(CommonUtils.setContextsBasedOnOperationAvailable(oInternalModelContext, aRequestPromises));
				}
			}
		}
		if (sControl === "table") {
			return Promise.all(aPromises);
		}
	},
	setActionEnablementAfterPatch: function (oView: any, oListBinding: any, oInternalModelContext: any) {
		const oInternalModelContextData: any = oInternalModelContext?.getObject();
		const oControls = oInternalModelContextData?.controls || {};
		for (const sKey in oControls) {
			if (oControls[sKey] && oControls[sKey].controlId) {
				const oTable: any = oView.byId(sKey);
				if (oTable.isA("sap.ui.mdc.Table")) {
					const oRowBinding = oTable.getRowBinding();
					if (oRowBinding == oListBinding) {
						ActionRuntime.setActionEnablement(
							oInternalModelContext,
							JSON.parse(oTable.data("operationAvailableMap").customData),
							oTable.getSelectedContexts(),
							"table"
						);
					}
				}
			}
		}
	},
	_setActionEnablementForTable: function (
		oSelectedContext: any,
		oInternalModelContext: any,
		sAction: string,
		sProperty: any,
		aRequestPromises: any
	) {
		// Reset all properties before computation
		oInternalModelContext.setProperty(`dynamicActions/${sAction}`, {
			bEnabled: false,
			aApplicable: [],
			aNotApplicable: []
		});
		// Note that non dynamic actions are not processed here. They are enabled because
		// one or more are selected and the second part of the condition in the templating
		// is then undefined and thus the button takes the default enabling, which is true!
		const aApplicable = [],
			aNotApplicable = [],
			sDynamicActionEnabledPath = `${oInternalModelContext.getPath()}/dynamicActions/${sAction}/bEnabled`;
		if (typeof sProperty === "object" && sProperty !== null && sProperty !== undefined) {
			if (oSelectedContext) {
				const oContextData = oSelectedContext.getObject();
				const oTransformedBinding = transformRecursively(
					sProperty,
					"PathInModel",
					// eslint-disable-next-line no-loop-func
					function (oBindingExpression: any) {
						return oContextData ? constant(oContextData[oBindingExpression.path]) : constant(false);
					},
					true
				);
				const sResult = compileExpression(oTransformedBinding);
				if (sResult === "true") {
					oInternalModelContext.getModel().setProperty(sDynamicActionEnabledPath, true);
					aApplicable.push(oSelectedContext);
				} else {
					aNotApplicable.push(oSelectedContext);
				}
			}
			CommonUtils.setDynamicActionContexts(oInternalModelContext, sAction, aApplicable, aNotApplicable);
		} else {
			const oContextData = oSelectedContext.getObject();
			if (sProperty === null && !!oContextData[`#${sAction}`]) {
				//look for action advertisement if present and its value is not null
				oInternalModelContext.getModel().setProperty(sDynamicActionEnabledPath, true);
			} else {
				// Collect promises to retrieve singleton or normal property value asynchronously
				aRequestPromises.push(CommonUtils.requestProperty(oSelectedContext, sAction, sProperty, sDynamicActionEnabledPath));
			}
		}
		return aRequestPromises;
	}
};
export default ActionRuntime;
