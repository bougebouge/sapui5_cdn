/**
 * @classdesc
 * Content of a custom fragment
 * @class sap.fe.macros.fpm.CustomFragment
 * @hideconstructor
 * @private
 * @experimental
 */
import MacroMetadata from "sap/fe/macros/MacroMetadata";

const CustomFragment = MacroMetadata.extend("sap.fe.macros.fpm.CustomFragment", {
	/**
	 * Name
	 */
	name: "CustomFragment",
	/**
	 * Namespace
	 */
	namespace: "sap.fe.macros.fpm",
	/**
	 * Fragment source
	 */
	fragment: "sap.fe.macros.fpm.CustomFragment",

	/**
	 * Metadata
	 */
	metadata: {
		/**
		 * Properties.
		 */
		properties: {
			/**
			 * Context Path
			 */
			contextPath: {
				type: "sap.ui.model.Context",
				required: false
			},
			/**
			 * ID of the custom fragment
			 */
			id: {
				type: "string",
				required: true
			},
			/**
			 *  Name of the custom fragment
			 */
			fragmentName: {
				type: "string",
				required: true
			}
		},
		events: {}
	},
	create: function (oProps: any) {
		oProps.fragmentInstanceName = oProps.fragmentName + "-JS".replace(/\//g, ".");

		return oProps;
	}
});
export default CustomFragment;
