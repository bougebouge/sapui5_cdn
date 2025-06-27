/**
 * @classdesc
 * The building block for creating a chart based on the metadata provided by OData V4.
 * @class sap.fe.macros.Chart
 * @hideconstructor
 * @private
 * @experimental
 */
import Log from "sap/base/Log";
import { getDataVisualizationConfiguration } from "sap/fe/core/converters/controls/Common/DataVisualization";
import { AggregationHelper } from "sap/fe/core/converters/helpers/Aggregation";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { getContextRelativeTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import MacroMetadata from "sap/fe/macros/MacroMetadata";
import ODataMetaModelUtil from "sap/fe/macros/ODataMetaModelUtil";
import JSONModel from "sap/ui/model/json/JSONModel";

const mMeasureRole: any = {
	"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1": "axis1",
	"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2": "axis2",
	"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3": "axis3",
	"com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis4": "axis4"
};

const Chart = MacroMetadata.extend("sap.fe.macros.Chart", {
	/**
	 * Name of the building block control.
	 */
	name: "Chart",
	/**
	 * Namespace of the building block control
	 */
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros",
	/**
	 * Fragment source of the building block (optional) - if not set, fragment is generated from namespace and name
	 */
	fragment: "sap.fe.macros.chart.Chart",
	/**
	 * The metadata describing the building block control.
	 */
	metadata: {
		/**
		 * Define building block stereotype for documentation
		 */
		stereotype: "xmlmacro",
		/**
		 * Properties.
		 */
		properties: {
			chartDefinition: {
				type: "sap.ui.model.Context"
			},
			/**
			 * ID of the chart
			 */
			id: {
				type: "string",
				isPublic: true
			},
			/**
			 * If specificed as true the ID is applied to the inner content of the building block
			 * This is only a private property to be used by sap.fe (Fiori Elements)
			 */
			_applyIdToContent: {
				type: "boolean",
				defaultValue: false
			},
			/**
			 * Metadata path to the presentation (UI.Chart w or w/o qualifier)
			 */
			metaPath: {
				type: "sap.ui.model.Context",
				isPublic: true
			},
			/**
			 * Metadata path to the entitySet or navigationProperty
			 */
			contextPath: {
				type: "sap.ui.model.Context",
				isPublic: true
			},
			/**
			 * The height of the chart
			 */
			height: {
				type: "string",
				defaultValue: "100%"
			},
			/**
			 * The width of the chart
			 */
			width: {
				type: "string",
				defaultValue: "100%"
			},
			/**
			 * Defines the "aria-level" of the chart header
			 */
			headerLevel: {
				type: "sap.ui.core.TitleLevel",
				defaultValue: "Auto",
				isPublic: true
			},
			/**
			 * Specifies the selection mode
			 */
			selectionMode: {
				type: "string",
				defaultValue: "MULTIPLE",
				isPublic: true
			},
			/**
			 * Parameter which sets the personalization of the MDC chart
			 */
			personalization: {
				type: "string|boolean",
				isPublic: true
			},
			/**
			 * Parameter which sets the ID of the filterbar associating it to the chart
			 */
			filterBar: {
				type: "string",
				isPublic: true
			},

			/**
			 * Parameter which internally sets the ID of the filterbar associating it to the chart
			 */
			filter: {
				type: "string",
				isPublic: true
			},
			/**
			 * Parameter which sets the noDataText for the MDC chart
			 */
			noDataText: {
				type: "string"
			},
			/**
			 * Parameter which sets the chart delegate for the MDC chart
			 */
			chartDelegate: {
				type: "string"
			},
			/**
			 * Parameter which sets the viz properties for the MDC chart
			 */
			vizProperties: {
				type: "string"
			},
			/**
			 * The actions to be shown in the action area of the chart
			 */
			actions: {
				type: "sap.ui.model.Context"
			},
			autoBindOnInit: {
				type: "boolean"
			},
			visible: {
				type: "string"
			}
		},
		events: {
			onSegmentedButtonPressed: {
				type: "function"
			},
			/**
			 * An event triggered when chart selections are changed. The event contains information about the data selected/deselected and
			 * the Boolean flag that indicates whether data is selected or deselected
			 */
			selectionChange: {
				type: "Function",
				isPublic: true
			},
			/**
			 * Event handler to react to the stateChange event of the chart.
			 */
			stateChange: {
				type: "function"
			}
		}
	},
	create: function (oProps: any, oControlConfiguration: any, mSettings: any) {
		let oChartDefinition;
		const oContextObjectPath = getInvolvedDataModelObjects(oProps.metaPath, oProps.contextPath);
		const oConverterContext = this.getConverterContext(oContextObjectPath, oProps.contextPath, mSettings);
		const aggregationHelper = new AggregationHelper(oConverterContext.getEntityType(), oConverterContext);
		if (oProps.chartDefinition === undefined || oProps.chartDefinition === null) {
			let sVisualizationPath = getContextRelativeTargetObjectPath(oContextObjectPath);
			if (oProps.metaPath.getObject().$Type === "com.sap.vocabularies.UI.v1.PresentationVariantType") {
				const aVisualizations = oProps.metaPath.getObject().Visualizations;
				aVisualizations.forEach(function (oVisualization: any) {
					if (oVisualization.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
						sVisualizationPath = oVisualization.$AnnotationPath;
					}
				});
			}
			const oVisualizationDefinition = getDataVisualizationConfiguration(
				sVisualizationPath!,
				oProps.useCondensedLayout,
				oConverterContext
			);
			oChartDefinition = oVisualizationDefinition.visualizations[0];

			oProps.chartDefinition = this.createBindingContext(oChartDefinition, mSettings);
		} else {
			oChartDefinition = oProps.chartDefinition.getObject();
		}
		oChartDefinition.path = oProps.chartDefinition.getPath();
		// API Properties
		this.setDefaultValue(oProps, "navigationPath", oChartDefinition.navigationPath);
		this.setDefaultValue(oProps, "autoBindOnInit", oChartDefinition.autoBindOnInit);
		this.setDefaultValue(oProps, "vizProperties", oChartDefinition.vizProperties);
		oProps.actions = this.createBindingContext(oChartDefinition.actions, mSettings);
		oProps.selectionMode = oProps.selectionMode.toUpperCase();
		if (oProps.filterBar) {
			this.setDefaultValue(oProps, "filter", this.getContentId(oProps.filterBar));
		} else if (!oProps.filter) {
			this.setDefaultValue(oProps, "filter", oChartDefinition.filterId);
		}
		this.setDefaultValue(oProps, "onSegmentedButtonPressed", oChartDefinition.onSegmentedButtonPressed);
		this.setDefaultValue(oProps, "visible", oChartDefinition.visible);
		let sContextPath = oProps.contextPath.getPath();
		sContextPath = sContextPath[sContextPath.length - 1] === "/" ? sContextPath.slice(0, -1) : sContextPath;
		this.setDefaultValue(oProps, "draftSupported", ModelHelper.isDraftSupported(mSettings.models.metaModel, sContextPath));
		if (oProps._applyIdToContent) {
			oProps._apiId = oProps.id + "::Chart";
			oProps._contentId = oProps.id;
		} else {
			oProps._apiId = oProps.id;
			oProps._contentId = this.getContentId(oProps.id);
		}

		oProps.measures = this.getChartMeasures(oProps, aggregationHelper);
		return oProps;
	},
	getChartMeasures: function (oProps: any, aggregationHelper: any) {
		const oMetaModel = oProps.metaPath.getModel();
		const aChartAnnotationPath = oProps.chartDefinition.getObject().annotationPath.split("/");
		// this is required because getAbsolutePath in converterContext returns "/SalesOrderManage/_Item/_Item/@com.sap.vocabularies.v1.Chart" as annotationPath
		const sChartAnnotationPath = aChartAnnotationPath
			.filter(function (item: any, pos: any) {
				return aChartAnnotationPath.indexOf(item) == pos;
			})
			.toString()
			.replaceAll(",", "/");
		const oChart = oMetaModel.getObject(sChartAnnotationPath);
		const aAggregatedProperty = aggregationHelper.getAggregatedProperties("AggregatedProperty");
		const aMeasures = [];
		const sAnnoPath = oProps.metaPath.getPath();
		const aAggregatedProperties = aggregationHelper.getAggregatedProperties("AggregatedProperties");
		const aChartMeasures = oChart.Measures ? oChart.Measures : [];
		const aChartDynamicMeasures = oChart.DynamicMeasures ? oChart.DynamicMeasures : [];
		//check if there are measures pointing to aggregatedproperties
		const aTransAggInMeasures = aAggregatedProperties[0]
			? aAggregatedProperties[0].filter(function (oAggregatedProperties: any) {
					return aChartMeasures.some(function (oMeasure: any) {
						return oAggregatedProperties.Name === oMeasure.$PropertyPath;
					});
			  })
			: undefined;
		const sEntitySetPath = sAnnoPath.replace(
			/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant|SelectionPresentationVariant).*/,
			""
		);
		const oTransAggregations = oProps.chartDefinition.getObject().transAgg;
		const oCustomAggregations = oProps.chartDefinition.getObject().customAgg;
		// intimate the user if there is Aggregatedproperty configured with no DYnamicMeasures, bu there are measures with AggregatedProperties
		if (aAggregatedProperty && !aChartDynamicMeasures && aTransAggInMeasures.length > 0) {
			Log.warning(
				"The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly."
			);
		}
		const bIsCustomAggregateIsMeasure = aChartMeasures.some((oChartMeasure: any) => {
			const oCustomAggMeasure = this.getCustomAggMeasure(oCustomAggregations, oChartMeasure);
			return !!oCustomAggMeasure;
		});
		if (aAggregatedProperty.length > 0 && !aChartDynamicMeasures.length && !bIsCustomAggregateIsMeasure) {
			throw new Error("Please configure DynamicMeasures for the chart");
		}
		if (aAggregatedProperty.length > 0) {
			for (let i = 0; i < aChartDynamicMeasures.length; i++) {
				const sKey = aChartDynamicMeasures[i].$AnnotationPath;
				const oAggregatedProperty = oMetaModel.getObject(sEntitySetPath + sKey);
				if (sKey.indexOf("/") > -1) {
					Log.error("$expand is not yet supported. Measure: ${sKey} from an association cannot be used");
					// check if the annotation path is wrong
				} else if (!oAggregatedProperty) {
					throw new Error(
						"Please provide the right AnnotationPath to the Dynamic Measure " + aChartDynamicMeasures[i].$AnnotationPath
					);
					// check if the path starts with @
				} else if (!aChartDynamicMeasures[i].$AnnotationPath.startsWith("@com.sap.vocabularies.Analytics.v1.AggregatedProperty")) {
					throw new Error(
						"Please provide the right AnnotationPath to the Dynamic Measure " + aChartDynamicMeasures[i].$AnnotationPath
					);
				} else {
					// check if AggregatedProperty is defined in given DynamicMeasure
					const oDynamicMeasure: any = {
						key: oAggregatedProperty.Name,
						role: "axis1"
					};
					oDynamicMeasure.propertyPath = oAggregatedProperty.AggregatableProperty.$PropertyPath;
					oDynamicMeasure.aggregationMethod = oAggregatedProperty.AggregationMethod;
					oDynamicMeasure.label =
						oAggregatedProperty["@com.sap.vocabularies.Common.v1.Label"] ||
						oMetaModel.getObject(sEntitySetPath + oDynamicMeasure.propertyPath + "@com.sap.vocabularies.Common.v1.Label");
					this.setChartMeasureAttributes(oChart.MeasureAttributes, sEntitySetPath, oDynamicMeasure, oMetaModel);
					aMeasures.push(oDynamicMeasure);
				}
			}
		}
		for (let i = 0; i < aChartMeasures.length; i++) {
			const sKey = aChartMeasures[i].$PropertyPath;
			const oCustomAggMeasure = this.getCustomAggMeasure(oCustomAggregations, aChartMeasures[i]);
			const oMeasure: any = {};
			if (oCustomAggMeasure) {
				if (sKey.indexOf("/") > -1) {
					Log.error("$expand is not yet supported. Measure: ${sKey} from an association cannot be used");
				}
				oMeasure.key = oCustomAggMeasure.$PropertyPath;
				oMeasure.role = "axis1";

				oMeasure.propertyPath = oCustomAggMeasure.$PropertyPath;
				aMeasures.push(oMeasure);
				//if there is neither aggregatedProperty nor measures pointing to customAggregates, but we have normal measures. Now check if these measures are part of AggregatedProperties Obj
			} else if (aAggregatedProperty.length === 0 && oTransAggregations[sKey]) {
				const oTransAggMeasure = oTransAggregations[sKey];
				oMeasure.key = oTransAggMeasure.name;
				oMeasure.role = "axis1";
				oMeasure.propertyPath = sKey;
				oMeasure.aggregationMethod = oTransAggMeasure.aggregationMethod;
				oMeasure.label = oTransAggMeasure.label || oMeasure.label;
				aMeasures.push(oMeasure);
			}
			this.setChartMeasureAttributes(oChart.MeasureAttributes, sEntitySetPath, oMeasure, oMetaModel);
		}
		const oMeasuresModel: any = new JSONModel(aMeasures);
		oMeasuresModel.$$valueAsPromise = true;
		return oMeasuresModel.createBindingContext("/");
	},
	getCustomAggMeasure: function (oCustomAggregations: any, oMeasure: any): any {
		if (oCustomAggregations[oMeasure.$PropertyPath]) {
			return oMeasure;
		}
		return null;
	},
	setChartMeasureAttributes: function (aMeasureAttributes: any, sEntitySetPath: any, oMeasure: any, oMetaModel: any): any {
		if (aMeasureAttributes && aMeasureAttributes.length) {
			for (let j = 0; j < aMeasureAttributes.length; j++) {
				const oAttribute: any = {};
				if (aMeasureAttributes[j].DynamicMeasure) {
					oAttribute.Path = aMeasureAttributes[j].DynamicMeasure.$AnnotationPath;
				} else {
					oAttribute.Path = aMeasureAttributes[j].Measure.$PropertyPath;
				}
				oAttribute.DataPoint = aMeasureAttributes[j].DataPoint ? aMeasureAttributes[j].DataPoint.$PropertyPath : null;
				oAttribute.Role = aMeasureAttributes[j].Role;
				if (oMeasure.key === oAttribute.Path) {
					oMeasure.role = oAttribute.Role ? mMeasureRole[oAttribute.Role.$EnumMember] : oMeasure.role;
					//still to add data point, but MDC Chart API is missing
					const sDataPoint = oAttribute.DataPoint;
					if (sDataPoint) {
						const oDataPoint = oMetaModel.getObject(sEntitySetPath + sDataPoint);
						if (oDataPoint.Value.$Path == oMeasure.key) {
							oMeasure.dataPoint = this.formatJSONToString(ODataMetaModelUtil.createDataPointProperty(oDataPoint));
						}
					}
				}
			}
		}
	},
	formatJSONToString: function (oCrit: any): any {
		if (!oCrit) {
			return undefined;
		}
		let sCriticality = JSON.stringify(oCrit);
		sCriticality = sCriticality.replace(new RegExp("{", "g"), "\\{");
		sCriticality = sCriticality.replace(new RegExp("}", "g"), "\\}");
		return sCriticality;
	}
});
export default Chart;
