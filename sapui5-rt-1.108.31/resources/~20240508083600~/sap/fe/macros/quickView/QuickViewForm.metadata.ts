import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import * as DataModelPathHelper from "sap/fe/core/templating/DataModelPathHelper";
import * as FieldTemplating from "sap/fe/macros/field/FieldTemplating";
import MacroMetadata from "sap/fe/macros/MacroMetadata";

/**
 * @classdesc
 * Building block used to create a QuickView card based on the metadata provided by OData v4 .
 * Usage example:
 * <pre>
 *   &lt;macro:QuickViewForm
 *   	dataField="{dataField>}"
 *   	entityType="{entityType>}"
 *   /&gt;
 * </pre>
 * @class sap.fe.macros.QuickViewForm
 * @hideconstructor
 * @private
 * @experimental
 */

const QuickViewForm = MacroMetadata.extend("sap.fe.macros.quickView.QuickViewForm", {
	/**
	 * Name of the building block control.
	 */
	name: "QuickViewForm",
	/**
	 *
	 * Namespace of the building block control
	 */
	namespace: "sap.fe.macros",
	/**
	 * Fragment source of the building block (optional) - if not set, fragment is generated from namespace and name
	 */
	fragment: "sap.fe.macros.quickView.QuickViewForm",
	/**
	 * The metadata describing the building block control.
	 */
	metadata: {
		/**
		 * Define building block stereotype for documentation
		 */
		stereotype: "xmlmacro",
		/**
		 * Location of the designtime info
		 */
		designtime: "sap/fe/macros/quickView/QuickViewForm.designtime",
		/**
		 * Properties.
		 */
		properties: {
			/**
			 * Metadata path to the Contact
			 * TODO find $type or $kind of the navigationentity
			 */
			entityType: {
				type: "sap.ui.model.Context"
			},
			dataField: {
				type: "sap.ui.model.Context",
				required: true,
				$kind: "Property",
				$Type: [
					"com.sap.vocabularies.UI.v1.DataField",
					"com.sap.vocabularies.UI.v1.DataFieldWithUrl",
					"com.sap.vocabularies.UI.v1.DataFieldForAnnotation",
					"com.sap.vocabularies.UI.v1.DataPointType"
				]
			},
			semanticObject: {
				type: "string"
			},
			/**
			 * Metadata path to the entity set
			 */
			contextPath: {
				type: "sap.ui.model.Context",
				required: false
			},
			hasSemanticOnNavigation: {
				type: "boolean",
				required: false
			},
			hasQuickViewFacets: {
				type: "boolean",
				required: false
			},
			/**
			 * Context pointing to an array of key value that is used for custom data generation
			 */
			semanticObjectsToResolve: {
				type: "sap.ui.model.Context",
				required: false,
				computed: true
			}
		},

		events: {}
	},
	create: function (oProps: any) {
		if (oProps.contextPath) {
			const oDataFieldConverted = MetaModelConverter.convertMetaModelContext(oProps.dataField);
			let oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(oProps.dataField, oProps.contextPath);
			let sExtraPath = "";
			// data point annotations need not have $Type defined, so add it if missing
			if (oDataFieldConverted && oDataFieldConverted.term === "com.sap.vocabularies.UI.v1.DataPoint") {
				oDataFieldConverted.$Type = oDataFieldConverted.$Type || UIAnnotationTypes.DataPointType;
			}
			if (oDataFieldConverted && oDataFieldConverted.$Type) {
				switch (oDataFieldConverted.$Type) {
					case UIAnnotationTypes.DataField:
					case UIAnnotationTypes.DataPointType:
					case UIAnnotationTypes.DataFieldWithNavigationPath:
					case UIAnnotationTypes.DataFieldWithUrl:
					case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
					case UIAnnotationTypes.DataFieldWithAction:
						if (typeof oDataFieldConverted.Value === "object") {
							sExtraPath = oDataFieldConverted.Value.path;
						}
						break;
					case UIAnnotationTypes.DataFieldForAnnotation:
						if (oDataFieldConverted.Target.$target) {
							if (
								oDataFieldConverted.Target.$target.$Type === UIAnnotationTypes.DataField ||
								oDataFieldConverted.Target.$target.$Type === UIAnnotationTypes.DataPointType
							) {
								if (typeof oDataFieldConverted.Target.$target.Value === "object") {
									sExtraPath = oDataFieldConverted.Target.$target.Value.path;
								}
							} else {
								if (typeof oDataFieldConverted.Target === "object") {
									sExtraPath = oDataFieldConverted.Target.path;
								}
								break;
							}
						}
						break;
				}
			}

			oProps.visible = FieldTemplating.getVisibleExpression(oDataModelPath, oProps.formatOptions);
			if (sExtraPath && sExtraPath.length > 0) {
				oDataModelPath = DataModelPathHelper.enhanceDataModelPath(oDataModelPath, sExtraPath);
			}

			if (oDataModelPath.navigationProperties.length > 0) {
				oProps.navigationSemanticObjectList = [];
				oDataModelPath.navigationProperties.forEach(function (navProperty) {
					if (navProperty?.annotations?.Common?.SemanticObject) {
						oProps.navigationSemanticObjectList.push(navProperty.annotations.Common.SemanticObject.toString());
					}
				});
			} else {
				oProps.navigationSemanticObjectList = null;
			}
		}
		return oProps;
	}
});

export default QuickViewForm;
