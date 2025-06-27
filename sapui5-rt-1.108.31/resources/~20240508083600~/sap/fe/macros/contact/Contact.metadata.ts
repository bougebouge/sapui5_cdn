/**
 * @classdesc
 * Macro for creating a Contact based on provided OData v4 metadata.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:Contact
 *   id="someID"
 *   contact="{contact>}"
 *   dataField="{dataField>}"
 * /&gt;
 * </pre>
 * @class sap.fe.macros.Contact
 * @hideconstructor
 * @private
 * @experimental
 */
import MacroMetadata from "sap/fe/macros/MacroMetadata";

const Contact = MacroMetadata.extend("sap.fe.macros.contact.Contact", {
	/**
	 * Name of the macro control.
	 */
	name: "Contact",
	/**
	 * Namespace of the macro control
	 */
	namespace: "sap.fe.macros",
	/**
	 * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
	 */
	fragment: "sap.fe.macros.contact.Contact",
	/**
	 * The metadata describing the macro control.
	 */
	metadata: {
		/**
		 * Define macro stereotype for documentation
		 */
		stereotype: "xmlmacro",
		/**
		 * Location of the designtime info
		 */
		designtime: "sap/fe/macros/Contact.designtime",
		/**
		 * Properties.
		 */
		properties: {
			/**
			 * Prefix added to the generated ID of the field
			 */
			idPrefix: {
				type: "string"
			},
			/**
			 * Metadata path to the Contact
			 */
			contact: {
				type: "sap.ui.model.Context",
				$Type: ["com.sap.vocabularies.Communication.v1.ContactType"],
				required: true
			},
			/**
			 * Property added to associate the label and the contact
			 */
			ariaLabelledBy: {
				type: "string"
			},
			/**
			 * Boolean visible property
			 */
			visible: {
				type: "boolean"
			}
		},

		events: {}
	}
});
export default Contact;
