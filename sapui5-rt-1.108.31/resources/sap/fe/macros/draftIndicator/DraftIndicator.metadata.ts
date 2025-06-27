/**
 * @classdesc
 * Macro for creating a DraftIndicator based on the metadata provided by OData V4.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:DraftIndicator
 *   id="SomeID"
 * /&gt;
 * </pre>
 * @class sap.fe.macros.DraftIndicator
 * @hideconstructor
 * @private
 */
import MacroMetadata from "sap/fe/macros/MacroMetadata";

const DraftIndicator = MacroMetadata.extend("sap.fe.macros.DraftIndicator", {
	/**
	 * Name of the macro control.
	 */
	name: "DraftIndicator",
	/**
	 * Namespace of the macro control
	 */
	namespace: "sap.fe.macros",
	/**
	 * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
	 */
	fragment: "sap.fe.macros.draftIndicator.DraftIndicator",

	/**
	 * The metadata describing the macro control.
	 */
	metadata: {
		/**
		 * Define macro stereotype for documentation
		 */
		stereotype: "xmlmacro",
		/**
		 * Properties.
		 */
		properties: {
			/**
			 * ID of the DraftIndicator
			 */
			id: {
				type: "string"
			},
			/**
			 * Property added to associate the label with the DraftIndicator
			 */
			ariaLabelledBy: {
				type: "string"
			},
			/**
			 * Manadatory field DraftIndicator
			 */
			DraftIndicatorType: {
				type: "sap.ui.mdc.DraftIndicatorType",
				required: true,
				defaultValue: "IconAndText"
			},
			/**
			 * Mandatory context to the EntitySet
			 */
			entitySet: {
				type: "sap.ui.model.Context",
				required: true,
				$kind: ["EntitySet", "NavigationProperty"]
			},
			isDraftIndicatorVisible: {
				type: "boolean",
				required: true,
				defaultValue: false
			},
			indicatorType: {
				type: "string"
			},
			"class": {
				type: "string"
			}
		}
	}
});
export default DraftIndicator;
