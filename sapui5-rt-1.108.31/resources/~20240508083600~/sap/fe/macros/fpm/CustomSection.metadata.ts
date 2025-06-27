/**
 * @classdesc
 * Content of a custom section
 * @class sap.fe.macros.fpm.CustomSection
 * @hideconstructor
 * @private
 * @experimental
 */
import MacroMetadata from "sap/fe/macros/MacroMetadata";

const CustomSection = MacroMetadata.extend("sap.fe.macros.fpm.CustomSection", {
	/**
	 * Name
	 */
	name: "CustomSection",
	/**
	 * Namespace
	 */
	namespace: "sap.fe.macros.fpm",
	/**
	 * Fragment source
	 */
	fragment: "sap.fe.macros.fpm.CustomSection",

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
				required: true
			},
			/**
			 * Section ID
			 */
			id: {
				type: "string",
				required: true
			},
			/**
			 * Section content fragment name
			 * TODO: Get rid of this property. it is required by FE, not by the custom section fragment itself
			 */
			fragmentName: {
				type: "string",
				required: true
			},
			/**
			 * Section content fragment name
			 * TODO: Maybe get rid of this: it is required by FE, not by the custom section fragment itself
			 */
			fragmentType: {
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
export default CustomSection;
