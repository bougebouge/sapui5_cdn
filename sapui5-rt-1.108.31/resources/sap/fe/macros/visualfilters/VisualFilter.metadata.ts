/**
 * @classdesc
 * Building block for creating a VisualFilter based on the metadata provided by OData V4.
 * <br>
 * A Chart annotation is required to bring up an interactive chart
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:VisualFilter
 *   collection="{entitySet&gt;}"
 *   chartAnnotation="{chartAnnotation&gt;}"
 *   id="someID"
 *   groupId="someGroupID"
 *   title="some Title"
 * /&gt;
 * </pre>
 * @class sap.fe.macros.VisualFilter
 * @hideconstructor
 * @private
 * @experimental
 */
import Log from "sap/base/Log";
import { AggregationHelper } from "sap/fe/core/converters/helpers/Aggregation";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import MacroMetadata from "sap/fe/macros/MacroMetadata";
import ResourceModel from "sap/fe/macros/ResourceModel";
import ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

const VisualFilter = MacroMetadata.extend("sap.fe.macros.visualfilters.VisualFilter", {
	/**
	 * Name of the macro control.
	 */
	name: "VisualFilter",
	/**
	 * Namespace of the macro control
	 */
	namespace: "sap.fe.macros",
	/**
	 * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
	 */
	fragment: "sap.fe.macros.visualfilters.VisualFilter",
	/**
	 * The metadata describing the macro control.
	 */
	metadata: {
		/**
		 * Properties.
		 */
		properties: {
			/**
			 * ID of the visual filter
			 */
			id: {
				type: "string"
			},
			/**
			 * Title for the visual filter.
			 */
			title: {
				type: "string",
				defaultValue: ""
			},
			/**
			 * Metadata path to the entitySet or navigationProperty
			 */
			contextPath: {
				type: "sap.ui.model.Context",
				required: true,
				$kind: ["EntitySet", "NavigationProperty"]
			},
			/**
			 * Metadata path to the presentation variant annotations
			 */
			metaPath: {
				type: "sap.ui.model.Context"
			},
			/**
			 * Property Path of the Dimension in the main entity set
			 */
			outParameter: {
				type: "string"
			},
			/**
			 * Metadata path to the selection variant annotations
			 */
			selectionVariantAnnotation: {
				type: "sap.ui.model.Context"
			},
			/**
			 * inParameters applicable to the visual filter
			 */
			inParameters: {
				type: "sap.ui.model.Context"
			},
			/**
			 * multiple selection applicable to the visual filter
			 */
			multipleSelectionAllowed: {
				type: "boolean"
			},
			/**
			 * required property of the visual filter
			 */
			required: {
				type: "boolean"
			},
			showOverlayInitially: {
				type: "boolean"
			},
			renderLineChart: {
				type: "boolean"
			},
			requiredProperties: {
				type: "sap.ui.model.Context"
			},
			filterBarEntityType: {
				type: "sap.ui.model.Context"
			},
			showError: {
				type: "boolean"
			},
			chartMeasure: {
				type: "string"
			}
		}
	},
	create: function (oProps: any, oControlConfiguration: any, mSettings: any) {
		oProps.groupId = "$auto.visualFilters";
		oProps.inParameters = oProps.inParameters.getObject();
		this.setDefaultValue(oProps, "aggregateProperties", undefined);
		this.setDefaultValue(oProps, "showValueHelp", undefined);
		this.setDefaultValue(oProps, "bCustomAggregate", false);
		const oContextObjectPath = getInvolvedDataModelObjects(oProps.metaPath, oProps.contextPath);
		const oConverterContext = this.getConverterContext(oContextObjectPath, oProps.contextPath, mSettings);
		const aggregationHelper = new AggregationHelper(oConverterContext.getEntityType(), oConverterContext);
		const customAggregates = aggregationHelper.getCustomAggregateDefinitions();
		const oModel = oProps.contextPath && oProps.contextPath.getModel();
		const sPath = oProps.metaPath && oProps.metaPath.getPath();
		const pvAnnotation = oModel.getObject(sPath);
		let chartAnnotation: any, sMeasure!: any;
		const aVisualizations = pvAnnotation && pvAnnotation.Visualizations;
		if (aVisualizations) {
			for (let i = 0; i < aVisualizations.length; i++) {
				const sAnnotationPath = pvAnnotation.Visualizations[i] && pvAnnotation.Visualizations[i].$AnnotationPath;
				chartAnnotation =
					oConverterContext.getEntityTypeAnnotation(sAnnotationPath) &&
					oConverterContext.getEntityTypeAnnotation(sAnnotationPath).annotation;
			}
		}
		let aAggregations: any,
			aCustAggMeasure: any = [];

		if (chartAnnotation?.Measures?.length) {
			aCustAggMeasure = customAggregates.filter(function (custAgg) {
				return custAgg.qualifier === chartAnnotation.Measures[0].value;
			});
			sMeasure = aCustAggMeasure.length > 0 ? aCustAggMeasure[0].qualifier : chartAnnotation.Measures[0].value;
			aAggregations = aggregationHelper.getAggregatedProperties("AggregatedProperties")[0];
		}
		// if there are AggregatedProperty objects but no dynamic measures, rather there are transformation aggregates found in measures
		if (
			aAggregations &&
			aAggregations.length > 0 &&
			!chartAnnotation.DynamicMeasures &&
			aCustAggMeasure.length === 0 &&
			chartAnnotation.Measures.length > 0
		) {
			Log.warning(
				"The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly."
			);
		}
		//if the chart has dynamic measures, but with no other custom aggregate measures then consider the dynamic measures
		if (chartAnnotation.DynamicMeasures) {
			if (aCustAggMeasure.length === 0) {
				sMeasure = oConverterContext
					.getConverterContextFor(oConverterContext.getAbsoluteAnnotationPath(chartAnnotation.DynamicMeasures[0].value))
					.getDataModelObjectPath().targetObject.Name;
				aAggregations = aggregationHelper.getAggregatedProperties("AggregatedProperty");
			} else {
				Log.warning(
					"The dynamic measures have been ignored as visual filters can deal with only 1 measure and the first (custom aggregate) measure defined under Chart.Measures is considered."
				);
			}
		}
		let validChartType;
		if (chartAnnotation) {
			if (chartAnnotation.ChartType === "UI.ChartType/Line" || chartAnnotation.ChartType === "UI.ChartType/Bar") {
				validChartType = true;
			} else {
				validChartType = false;
			}
		}
		if (
			customAggregates.some(function (custAgg) {
				return custAgg.qualifier === sMeasure;
			})
		) {
			oProps.bCustomAggregate = true;
		}
		const oSelectionVariant = oProps.selectionVariantAnnotation && oProps.selectionVariantAnnotation.getObject();
		let iSelectOptionsForDimension = 0;
		if (oSelectionVariant && !oProps.multipleSelectionAllowed) {
			for (let j = 0; j < oSelectionVariant.SelectOptions.length; j++) {
				if (oSelectionVariant.SelectOptions[j].PropertyName.$PropertyPath === chartAnnotation.Dimensions[0].value) {
					iSelectOptionsForDimension++;
					if (iSelectOptionsForDimension > 1) {
						throw new Error("Multiple SelectOptions for FilterField having SingleValue Allowed Expression");
					}
				}
			}
		}

		const oAggregation = this.getAggregateProperties(aAggregations, sMeasure);

		if (oAggregation) {
			oProps.aggregateProperties = oAggregation;
		}
		const vUOM = this.getUoM(oModel, oProps.contextPath, sMeasure, oAggregation);
		if (
			vUOM &&
			vUOM.$Path &&
			customAggregates.some(function (custAgg) {
				return custAgg.qualifier === vUOM.$Path;
			})
		) {
			oProps.bUoMHasCustomAggregate = true;
		} else {
			oProps.bUoMHasCustomAggregate = false;
		}
		const bHiddenMeasure = this.getHiddenMeasure(oModel, oProps.contextPath, sMeasure, oProps.bCustomAggregate, oAggregation);
		const sDimensionType =
			chartAnnotation.Dimensions[0] && chartAnnotation.Dimensions[0].$target && chartAnnotation.Dimensions[0].$target.type;
		const sChartType = chartAnnotation.ChartType;
		if (sDimensionType === "Edm.Date" || sDimensionType === "Edm.Time" || sDimensionType === "Edm.DateTimeOffset") {
			oProps.showValueHelp = false;
		} else if (typeof bHiddenMeasure === "boolean" && bHiddenMeasure) {
			oProps.showValueHelp = false;
		} else if (!(sChartType === "UI.ChartType/Bar" || sChartType === "UI.ChartType/Line")) {
			oProps.showValueHelp = false;
		} else if (oProps.renderLineChart === "false" && sChartType === "UI.ChartType/Line") {
			oProps.showValueHelp = false;
		} else {
			oProps.showValueHelp = true;
		}

		this.setDefaultValue(oProps, "draftSupported", ModelHelper.isDraftSupported(mSettings.models.metaModel, oProps.contextPath));
		/**
		 * If the measure of the chart is marked as 'hidden', or if the chart type is invalid, or if the data type for the line chart is invalid,
		 * the call is made to the InteractiveChartWithError fragment (using error-message related APIs, but avoiding batch calls)
		 */
		if ((typeof bHiddenMeasure === "boolean" && bHiddenMeasure) || !validChartType || oProps.renderLineChart === "false") {
			oProps.showError = true;
			oProps.errorMessageTitle =
				bHiddenMeasure || !validChartType
					? ResourceModel.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE")
					: ResourceModel.getText("M_VISUAL_FILTER_LINE_CHART_INVALID_DATATYPE");
			if (bHiddenMeasure) {
				oProps.errorMessage = ResourceModel.getText("M_VISUAL_FILTER_HIDDEN_MEASURE", sMeasure);
			} else if (!validChartType) {
				oProps.errorMessage = ResourceModel.getText("M_VISUAL_FILTER_UNSUPPORTED_CHART_TYPE");
			} else {
				oProps.errorMessage = ResourceModel.getText("M_VISUAL_FILTER_LINE_CHART_UNSUPPORTED_DIMENSION");
			}
		}
		oProps.chartMeasure = sMeasure;
		return oProps;
	},

	getAggregateProperties: function (aAggregations: any[], sMeasure: string) {
		let oMatchedAggregate = {};
		if (!aAggregations) {
			return;
		}
		aAggregations.some(function (oAggregate) {
			if (oAggregate.Name === sMeasure) {
				oMatchedAggregate = oAggregate;
				return true;
			}
		});
		return oMatchedAggregate;
	},

	getHiddenMeasure: function (
		oModel: ODataMetaModel,
		sContextPath: string,
		sMeasure: string,
		bCustomAggregate: boolean,
		oAggregation: any
	) {
		let sAggregatablePropertyPath;
		if (!bCustomAggregate && oAggregation) {
			sAggregatablePropertyPath = oAggregation.AggregatableProperty && oAggregation.AggregatableProperty.value;
		} else {
			sAggregatablePropertyPath = sMeasure;
		}
		let vHiddenMeasure = oModel.getObject(sContextPath + "/" + sAggregatablePropertyPath + "@com.sap.vocabularies.UI.v1.Hidden");
		if (!vHiddenMeasure && oAggregation && oAggregation.AggregatableProperty) {
			vHiddenMeasure = oModel.getObject(sContextPath + "/" + sAggregatablePropertyPath + "@com.sap.vocabularies.UI.v1.Hidden");
		}
		return vHiddenMeasure;
	},

	getUoM: function (oModel: ODataMetaModel, sContextPath: string, sMeasure: string, oAggregation: any) {
		let vISOCurrency = oModel.getObject(sContextPath + "/" + sMeasure + "@Org.OData.Measures.V1.ISOCurrency");
		let vUnit = oModel.getObject(sContextPath + "/" + sMeasure + "@Org.OData.Measures.V1.Unit");
		if (!vISOCurrency && !vUnit && oAggregation && oAggregation.AggregatableProperty) {
			vISOCurrency = oModel.getObject(
				sContextPath + "/" + oAggregation.AggregatableProperty.value + "@Org.OData.Measures.V1.ISOCurrency"
			);
			vUnit = oModel.getObject(sContextPath + "/" + oAggregation.AggregatableProperty.value + "@Org.OData.Measures.V1.Unit");
		}
		return vISOCurrency || vUnit;
	}
});
export default VisualFilter;
