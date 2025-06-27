import MacroMetadata from "sap/fe/macros/MacroMetadata";

/**
 * @classdesc
 * Content of a action commands
 * @class sap.fe.macros.internal.ActionCommand
 * @hideconstructor
 * @private
 * @experimental
 */
const ActionCommand = MacroMetadata.extend("sap.fe.macros.internal.ActionCommand", {
	/**
	 * Name
	 */
	name: "ActionCommand",
	/**
	 * Namespace
	 */
	namespace: "sap.fe.macros.internal",
	/**
	 * Fragment source
	 */
	fragment: "sap.fe.macros.internal.ActionCommand",

	/**
	 * Metadata
	 */
	metadata: {
		/**
		 * Properties.
		 */
		properties: {
			action: {
				type: "sap.ui.model.Context"
			},
			isActionEnabled: {
				type: "boolean"
			},
			isIBNEnabled: {
				type: "boolean"
			},
			visible: {
				type: "boolean"
			}
		},
		events: {
			onExecuteAction: {
				type: "function"
			},
			onExecuteIBN: {
				type: "function"
			},
			onExecuteManifest: {
				type: "function"
			}
		}
	}
});

export default ActionCommand;
