import type { SemanticObject } from "@sap-ux/vocabularies-types/vocabularies/Common";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import * as BindingToolkit from "sap/fe/core/helpers/BindingToolkit";
import * as CriticalityFormatters from "sap/fe/core/templating/CriticalityFormatters";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import * as DataModelPathHelper from "sap/fe/core/templating/DataModelPathHelper";
import * as PropertyHelper from "sap/fe/core/templating/PropertyHelper";
import type { DisplayMode } from "sap/fe/core/templating/UIFormatters";
import * as UIFormatters from "sap/fe/core/templating/UIFormatters";
import FieldHelper from "sap/fe/macros/field/FieldHelper";
import * as FieldTemplating from "sap/fe/macros/field/FieldTemplating";
import * as DatapointTemplating from "sap/fe/macros/internal/helpers/DataPointTemplating";
import MacroMetadata from "sap/fe/macros/MacroMetadata";

type DataPointFormatOptions = Partial<{
	dataPointStyle: "" | "large";
	displayMode: DisplayMode;
	iconSize: "1rem" | "1.375rem" | "2rem";
	isAnalytics: boolean;
	measureDisplayMode: string;
	showEmptyIndicator: boolean;
	showLabels: boolean;
}>;
export type DataPointProperties = {
	metaPath: any;
	editMode?: any;
	contextPath: any;
	formatOptions: DataPointFormatOptions;
	idPrefix?: string;

	// computed properties
	criticalityColorExpression?: string;
	displayValue?: string;
	emptyIndicatorMode?: "On";
	hasQuickViewFacets?: boolean;
	hasSemanticObjectOnNavigation?: boolean;
	objectStatusNumber?: string;
	percentValue?: string;
	semanticObject?: string | SemanticObject;
	semanticObjects?: string;
	targetLabel?: string;
	unit?: string;
	visible?: string;
	visualization?: string;
	objectStatusText?: string;
	iconExpression?: string;
};
type DataPointBlock = {
	oProps: DataPointProperties;
	setUpObjectNumber: (
		oProps: DataPointProperties,
		oDataPointConverted: any,
		oDataModelPath: DataModelObjectPath,
		oValueDataModelPath: DataModelObjectPath
	) => DataPointProperties;
	setUpObjectStatus: (oProps: DataPointProperties, oDataPointConverted: any, oDataModelPath: DataModelObjectPath) => DataPointProperties;
	setUpProgressBar: (oProps: DataPointProperties, oDataPointConverted: any, oDataModelPath: DataModelObjectPath) => DataPointProperties;
	setUpRatingIndicator: (oProps: DataPointProperties, oDataPoint: any) => DataPointProperties;
	setUpSemanticObjectsAndQuickView: (
		oProps: DataPointProperties,
		oDataPointConverted: any,
		oDataModelPath: DataModelObjectPath,
		oValueDataModelPath: DataModelObjectPath
	) => void;
};

const DataPoint = MacroMetadata.extend("sap.fe.macros.internal.DataPoint", {
	/**
	 * Define macro stereotype for documentation
	 */
	name: "DataPoint",
	/**
	 * Namespace of the macro control
	 */
	namespace: "sap.fe.macros.internal",
	/**
	 * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
	 */
	fragment: "sap.fe.macros.internal.DataPoint",

	/**
	 * The metadata describing the macro control.
	 */
	metadata: {
		/**
		 * Define macro stereotype for documentation purpose
		 */
		stereotype: "xmlmacro",
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
			 * Metadata path to the dataPoint.
			 * This property is usually a metadataContext pointing to a DataPoint having
			 * $Type = "com.sap.vocabularies.UI.v1.DataPointType"
			 * And a Visualization/$EnumNumber = "com.sap.vocabularies.UI.v1.VisualizationType/Rating", "com.sap.vocabularies.UI.v1.VisualizationType/Progress", or None
			 * But it can also be a Property with $kind="Property"
			 */
			metaPath: {
				type: "sap.ui.model.Context",
				required: true,
				$kind: ["Property"]
			},
			/**
			 * Property added to associate the label with the DataPoint
			 */
			ariaLabelledBy: {
				type: "string"
			},
			/**
			 * Context pointing to an array of the property's semantic objects
			 */
			semanticObjects: {
				type: "sap.ui.model.Context",
				required: false,
				computed: true
			},
			formatOptions: {
				type: "object",
				properties: {
					dataPointStyle: {
						type: "string",
						allowedValues: ["", "large"]
					},
					displayMode: {
						type: "string",
						allowedValues: ["Value", "Description", "ValueDescription", "DescriptionValue"]
					},
					/**
					 * Define the size of the icons (For RatingIndicator only)
					 */
					iconSize: {
						type: "string",
						allowedValues: ["1rem", "1.375rem", "2rem"]
					},
					isAnalytics: {
						type: "boolean",
						defaultValue: false
					},
					measureDisplayMode: {
						type: "string",
						allowedValues: ["Hidden", "ReadOnly"]
					},
					/**
					 * If set to 'true', SAP Fiori elements shows an empty indicator in display mode for the ObjectNumber
					 */
					showEmptyIndicator: {
						type: "boolean",
						defaultValue: false
					},
					/**
					 * When true, displays the labels for the Rating and Progress indicators
					 */
					showLabels: {
						type: "boolean",
						defaultValue: false
					}
				}
			},
			/**
			 * Mandatory context to the DataPoint
			 */
			contextPath: {
				type: "sap.ui.model.Context",
				required: true,
				$kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
			}
		}
	},

	create: function (this: DataPointBlock, oProps: DataPointProperties) {
		const oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(oProps.metaPath, oProps.contextPath);
		let oValueDataModelPath;
		oProps.visible = FieldTemplating.getVisibleExpression(oDataModelPath);
		if (oDataModelPath?.targetObject?.Value?.path) {
			oValueDataModelPath = DataModelPathHelper.enhanceDataModelPath(oDataModelPath, oDataModelPath.targetObject.Value.path);
		}
		const oDataPointConverted = MetaModelConverter.convertMetaModelContext(oProps.metaPath);
		if (!oProps.formatOptions) {
			oProps.formatOptions = {};
		}
		oProps.semanticObjects = FieldTemplating.getSemanticObjects([]);
		oProps.hasQuickViewFacets = false;
		oProps.hasSemanticObjectOnNavigation = false;

		if (oDataPointConverted?.Visualization === "UI.VisualizationType/Rating") {
			return this.setUpRatingIndicator(oProps, oDataPointConverted);
		}
		if (oDataPointConverted?.Visualization === "UI.VisualizationType/Progress") {
			return this.setUpProgressBar(oProps, oDataPointConverted, oDataModelPath);
		}
		const valueProperty = oValueDataModelPath && oValueDataModelPath.targetObject;
		if (
			FieldTemplating.isUsedInNavigationWithQuickViewFacets(oDataModelPath, valueProperty) ||
			valueProperty?.annotations?.Common?.SemanticObject
		) {
			this.setUpSemanticObjectsAndQuickView(oProps, oDataPointConverted, oDataModelPath, oValueDataModelPath as DataModelObjectPath);
		} else if (
			PropertyHelper.isProperty(valueProperty) &&
			(PropertyHelper.hasUnit(valueProperty) || PropertyHelper.hasCurrency(valueProperty))
		) {
			// we only show an objectNumber if there is no quickview and a unit or a currency
			return this.setUpObjectNumber(oProps, oDataPointConverted, oDataModelPath, oValueDataModelPath as DataModelObjectPath);
		}
		return this.setUpObjectStatus(oProps, oDataPointConverted, oDataModelPath);
	},
	setUpRatingIndicator: (oProps: DataPointProperties, oDataPointConverted: any) => {
		oProps.targetLabel = BindingToolkit.compileExpression(
			BindingToolkit.formatResult(
				[
					BindingToolkit.pathInModel("T_HEADER_RATING_INDICATOR_FOOTER", "sap.fe.i18n"),
					BindingToolkit.getExpressionFromAnnotation(oDataPointConverted.Value),
					oDataPointConverted.TargetValue ? BindingToolkit.getExpressionFromAnnotation(oDataPointConverted.TargetValue) : "5"
				],
				"MESSAGE"
			)
		);
		oProps.visualization = "Rating";
		return oProps;
	},
	setUpProgressBar: (oProps: DataPointProperties, oDataPointConverted: any, oDataModelPath: DataModelObjectPath) => {
		oProps.criticalityColorExpression = CriticalityFormatters.buildExpressionForCriticalityColor(oDataPointConverted, oDataModelPath);
		oProps.displayValue = DatapointTemplating.buildExpressionForProgressIndicatorDisplayValue(oDataModelPath);
		oProps.percentValue = DatapointTemplating.buildExpressionForProgressIndicatorPercentValue(oDataModelPath);
		oProps.visualization = "Progress";
		return oProps;
	},
	setUpObjectNumber: (
		oProps: DataPointProperties,
		oDataPointConverted: any,
		oDataModelPath: DataModelObjectPath,
		oValueDataModelPath: DataModelObjectPath
	) => {
		oProps.criticalityColorExpression = CriticalityFormatters.buildExpressionForCriticalityColor(oDataPointConverted, oDataModelPath);
		oProps.emptyIndicatorMode = oProps.formatOptions.showEmptyIndicator ? "On" : undefined;
		oProps.objectStatusNumber = DatapointTemplating.buildFieldBindingExpression(oDataModelPath, oProps.formatOptions, true);
		oProps.unit =
			oProps.formatOptions.measureDisplayMode === "Hidden"
				? undefined
				: BindingToolkit.compileExpression(UIFormatters.getBindingForUnitOrCurrency(oValueDataModelPath));
		oProps.visualization = "ObjectNumber";
		return oProps;
	},
	setUpObjectStatus: (oProps: DataPointProperties, oDataPointConverted: any, oDataModelPath: DataModelObjectPath) => {
		// if teh semanticObjects already calculated the criticality we don't calculate it again
		oProps.criticalityColorExpression = oProps.criticalityColorExpression
			? oProps.criticalityColorExpression
			: CriticalityFormatters.buildExpressionForCriticalityColor(oDataPointConverted, oDataModelPath);
		oProps.emptyIndicatorMode = oProps.formatOptions.showEmptyIndicator ? "On" : undefined;
		oProps.objectStatusText = DatapointTemplating.buildFieldBindingExpression(oDataModelPath, oProps.formatOptions, false);
		oProps.iconExpression = CriticalityFormatters.buildExpressionForCriticalityIcon(oDataPointConverted, oDataModelPath);
		oProps.visualization = "ObjectStatus";
		return oProps;
	},
	setUpSemanticObjectsAndQuickView: (
		oProps: DataPointProperties,
		oDataPointConverted: any,
		oDataModelPath: DataModelObjectPath,
		oValueDataModelPath: DataModelObjectPath
	) => {
		const valueProperty = oValueDataModelPath && oValueDataModelPath.targetObject;
		oProps.hasQuickViewFacets = valueProperty
			? FieldTemplating.isUsedInNavigationWithQuickViewFacets(oDataModelPath, valueProperty)
			: false;
		oProps.semanticObject = "";
		let oAnnotations,
			aSemObjExprToResolve = [];
		if (typeof oDataPointConverted.Value === "object") {
			oAnnotations = oDataPointConverted.Value.$target?.annotations?.Common;
			aSemObjExprToResolve = FieldTemplating.getSemanticObjectExpressionToResolve(oAnnotations);
		}
		if (!!oProps.semanticObject && oProps.semanticObject[0] === "{") {
			aSemObjExprToResolve.push({
				key: oProps.semanticObject.substr(1, oProps.semanticObject.length - 2),
				value: oProps.semanticObject
			});
		}
		oProps.semanticObjects = FieldTemplating.getSemanticObjects(aSemObjExprToResolve); // this is used via semanticObjects>
		// This sets up the semantic links found in the navigation property, if there is no semantic links define before.
		if (!oProps.semanticObject && oValueDataModelPath?.navigationProperties?.length > 0) {
			oValueDataModelPath.navigationProperties.forEach(function (navProperty) {
				if (navProperty?.annotations?.Common?.SemanticObject) {
					oProps.semanticObject = navProperty.annotations.Common.SemanticObject;
					oProps.hasSemanticObjectOnNavigation = true;
				}
			});
		}
		oProps.criticalityColorExpression = CriticalityFormatters.buildExpressionForCriticalityColor(oDataPointConverted, oDataModelPath);
		if (oProps.criticalityColorExpression === "None" && oValueDataModelPath) {
			oProps.criticalityColorExpression = oProps.hasQuickViewFacets
				? "Information"
				: FieldHelper.getStateDependingOnSemanticObjectTargets(oValueDataModelPath);
		}
	}
});

export default DataPoint as DataPointBlock;
