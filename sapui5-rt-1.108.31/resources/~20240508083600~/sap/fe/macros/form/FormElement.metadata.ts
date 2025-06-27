import { compileExpression, equal, ifElse, resolveBindingString } from "sap/fe/core/helpers/BindingToolkit";
import MacroMetadata from "sap/fe/macros/MacroMetadata";

/**
 * @classdesc
 * Building block used to create a form element containing a label and a field.
 * @hideconstructor
 * @name sap.fe.macros.FormElement
 * @public
 * @since 1.90.0
 */
const FormElement = MacroMetadata.extend("sap.fe.macros.form.FormElement", {
	/**
	 * Name
	 */
	name: "FormElement",
	/**
	 * Namespace
	 */
	namespace: "sap.fe.macros",
	/**
	 * Fragment source
	 */
	fragment: "sap.fe.macros.form.FormElement",

	/**
	 * Metadata
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
			 * Defines the relative path of the property in the metamodel, based on the current contextPath.
			 *
			 * @public
			 */
			metaPath: {
				type: "sap.ui.model.Context",
				required: true
			},
			/**
			 * Defines the path of the context used in the current page or block. This setting is defined by the framework.
			 *
			 * @public
			 */
			contextPath: {
				type: "sap.ui.model.Context",
				required: true
			},
			/**
			 * The identifier of the table control.
			 *
			 * @public
			 */
			id: {
				type: "string",
				required: true
			},
			/**
			 * Label shown for the field. If not set, the label from the annotations will be shown.
			 *
			 * @public
			 */
			label: {
				type: "string",
				required: false
			},
			/**
			 * 	If set to false, the FormElement is not rendered.
			 *
			 * 	@public
			 */
			visible: {
				type: "boolean",
				required: false
			},
			key: {
				type: "string"
			}
		},
		aggregations: {
			/**
			 * Optional aggregation of controls that should be displayed inside the FormElement.
			 * If not set, a default Field Macro control will be rendered
			 *
			 * @public
			 */
			"fields": {
				type: "sap.ui.core.Control",
				isDefault: true
			}
		}
	},
	create: function (oProps: any, oControlConfig: any, oAppComponent: any, oAggregations: any) {
		if (oProps.label === undefined) {
			oProps.label = oProps.metaPath.getModel().getProperty(`${oProps.metaPath.sPath}@com.sap.vocabularies.Common.v1.Label`);
		}
		if (oProps.editable !== undefined) {
			oProps.editModeExpression = compileExpression(
				ifElse(equal(resolveBindingString(oProps.editable, "boolean"), true), "Editable", "Display")
			);
		} else {
			oProps.editModeExpression = undefined;
		}
		oProps.fieldsAvailable = oAggregations.fields !== undefined;

		return oProps;
	}
});

export default FormElement;
