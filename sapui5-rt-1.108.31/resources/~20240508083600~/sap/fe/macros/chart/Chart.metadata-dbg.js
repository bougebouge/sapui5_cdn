/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/helpers/Aggregation", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/MacroMetadata", "sap/fe/macros/ODataMetaModelUtil", "sap/ui/model/json/JSONModel"], function (Log, DataVisualization, Aggregation, MetaModelConverter, ModelHelper, DataModelPathHelper, MacroMetadata, ODataMetaModelUtil, JSONModel) {
  "use strict";

  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var AggregationHelper = Aggregation.AggregationHelper;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var mMeasureRole = {
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis1": "axis1",
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis2": "axis2",
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis3": "axis3",
    "com.sap.vocabularies.UI.v1.ChartMeasureRoleType/Axis4": "axis4"
  };
  var Chart = MacroMetadata.extend("sap.fe.macros.Chart", {
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
    create: function (oProps, oControlConfiguration, mSettings) {
      var oChartDefinition;
      var oContextObjectPath = getInvolvedDataModelObjects(oProps.metaPath, oProps.contextPath);
      var oConverterContext = this.getConverterContext(oContextObjectPath, oProps.contextPath, mSettings);
      var aggregationHelper = new AggregationHelper(oConverterContext.getEntityType(), oConverterContext);
      if (oProps.chartDefinition === undefined || oProps.chartDefinition === null) {
        var sVisualizationPath = getContextRelativeTargetObjectPath(oContextObjectPath);
        if (oProps.metaPath.getObject().$Type === "com.sap.vocabularies.UI.v1.PresentationVariantType") {
          var aVisualizations = oProps.metaPath.getObject().Visualizations;
          aVisualizations.forEach(function (oVisualization) {
            if (oVisualization.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
              sVisualizationPath = oVisualization.$AnnotationPath;
            }
          });
        }
        var oVisualizationDefinition = getDataVisualizationConfiguration(sVisualizationPath, oProps.useCondensedLayout, oConverterContext);
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
      var sContextPath = oProps.contextPath.getPath();
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
    getChartMeasures: function (oProps, aggregationHelper) {
      var _this = this;
      var oMetaModel = oProps.metaPath.getModel();
      var aChartAnnotationPath = oProps.chartDefinition.getObject().annotationPath.split("/");
      // this is required because getAbsolutePath in converterContext returns "/SalesOrderManage/_Item/_Item/@com.sap.vocabularies.v1.Chart" as annotationPath
      var sChartAnnotationPath = aChartAnnotationPath.filter(function (item, pos) {
        return aChartAnnotationPath.indexOf(item) == pos;
      }).toString().replaceAll(",", "/");
      var oChart = oMetaModel.getObject(sChartAnnotationPath);
      var aAggregatedProperty = aggregationHelper.getAggregatedProperties("AggregatedProperty");
      var aMeasures = [];
      var sAnnoPath = oProps.metaPath.getPath();
      var aAggregatedProperties = aggregationHelper.getAggregatedProperties("AggregatedProperties");
      var aChartMeasures = oChart.Measures ? oChart.Measures : [];
      var aChartDynamicMeasures = oChart.DynamicMeasures ? oChart.DynamicMeasures : [];
      //check if there are measures pointing to aggregatedproperties
      var aTransAggInMeasures = aAggregatedProperties[0] ? aAggregatedProperties[0].filter(function (oAggregatedProperties) {
        return aChartMeasures.some(function (oMeasure) {
          return oAggregatedProperties.Name === oMeasure.$PropertyPath;
        });
      }) : undefined;
      var sEntitySetPath = sAnnoPath.replace(/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant|SelectionPresentationVariant).*/, "");
      var oTransAggregations = oProps.chartDefinition.getObject().transAgg;
      var oCustomAggregations = oProps.chartDefinition.getObject().customAgg;
      // intimate the user if there is Aggregatedproperty configured with no DYnamicMeasures, bu there are measures with AggregatedProperties
      if (aAggregatedProperty && !aChartDynamicMeasures && aTransAggInMeasures.length > 0) {
        Log.warning("The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly.");
      }
      var bIsCustomAggregateIsMeasure = aChartMeasures.some(function (oChartMeasure) {
        var oCustomAggMeasure = _this.getCustomAggMeasure(oCustomAggregations, oChartMeasure);
        return !!oCustomAggMeasure;
      });
      if (aAggregatedProperty.length > 0 && !aChartDynamicMeasures.length && !bIsCustomAggregateIsMeasure) {
        throw new Error("Please configure DynamicMeasures for the chart");
      }
      if (aAggregatedProperty.length > 0) {
        for (var i = 0; i < aChartDynamicMeasures.length; i++) {
          var sKey = aChartDynamicMeasures[i].$AnnotationPath;
          var oAggregatedProperty = oMetaModel.getObject(sEntitySetPath + sKey);
          if (sKey.indexOf("/") > -1) {
            Log.error("$expand is not yet supported. Measure: ${sKey} from an association cannot be used");
            // check if the annotation path is wrong
          } else if (!oAggregatedProperty) {
            throw new Error("Please provide the right AnnotationPath to the Dynamic Measure " + aChartDynamicMeasures[i].$AnnotationPath);
            // check if the path starts with @
          } else if (!aChartDynamicMeasures[i].$AnnotationPath.startsWith("@com.sap.vocabularies.Analytics.v1.AggregatedProperty")) {
            throw new Error("Please provide the right AnnotationPath to the Dynamic Measure " + aChartDynamicMeasures[i].$AnnotationPath);
          } else {
            // check if AggregatedProperty is defined in given DynamicMeasure
            var oDynamicMeasure = {
              key: oAggregatedProperty.Name,
              role: "axis1"
            };
            oDynamicMeasure.propertyPath = oAggregatedProperty.AggregatableProperty.$PropertyPath;
            oDynamicMeasure.aggregationMethod = oAggregatedProperty.AggregationMethod;
            oDynamicMeasure.label = oAggregatedProperty["@com.sap.vocabularies.Common.v1.Label"] || oMetaModel.getObject(sEntitySetPath + oDynamicMeasure.propertyPath + "@com.sap.vocabularies.Common.v1.Label");
            this.setChartMeasureAttributes(oChart.MeasureAttributes, sEntitySetPath, oDynamicMeasure, oMetaModel);
            aMeasures.push(oDynamicMeasure);
          }
        }
      }
      for (var _i = 0; _i < aChartMeasures.length; _i++) {
        var _sKey = aChartMeasures[_i].$PropertyPath;
        var oCustomAggMeasure = this.getCustomAggMeasure(oCustomAggregations, aChartMeasures[_i]);
        var oMeasure = {};
        if (oCustomAggMeasure) {
          if (_sKey.indexOf("/") > -1) {
            Log.error("$expand is not yet supported. Measure: ${sKey} from an association cannot be used");
          }
          oMeasure.key = oCustomAggMeasure.$PropertyPath;
          oMeasure.role = "axis1";
          oMeasure.propertyPath = oCustomAggMeasure.$PropertyPath;
          aMeasures.push(oMeasure);
          //if there is neither aggregatedProperty nor measures pointing to customAggregates, but we have normal measures. Now check if these measures are part of AggregatedProperties Obj
        } else if (aAggregatedProperty.length === 0 && oTransAggregations[_sKey]) {
          var oTransAggMeasure = oTransAggregations[_sKey];
          oMeasure.key = oTransAggMeasure.name;
          oMeasure.role = "axis1";
          oMeasure.propertyPath = _sKey;
          oMeasure.aggregationMethod = oTransAggMeasure.aggregationMethod;
          oMeasure.label = oTransAggMeasure.label || oMeasure.label;
          aMeasures.push(oMeasure);
        }
        this.setChartMeasureAttributes(oChart.MeasureAttributes, sEntitySetPath, oMeasure, oMetaModel);
      }
      var oMeasuresModel = new JSONModel(aMeasures);
      oMeasuresModel.$$valueAsPromise = true;
      return oMeasuresModel.createBindingContext("/");
    },
    getCustomAggMeasure: function (oCustomAggregations, oMeasure) {
      if (oCustomAggregations[oMeasure.$PropertyPath]) {
        return oMeasure;
      }
      return null;
    },
    setChartMeasureAttributes: function (aMeasureAttributes, sEntitySetPath, oMeasure, oMetaModel) {
      if (aMeasureAttributes && aMeasureAttributes.length) {
        for (var j = 0; j < aMeasureAttributes.length; j++) {
          var oAttribute = {};
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
            var sDataPoint = oAttribute.DataPoint;
            if (sDataPoint) {
              var oDataPoint = oMetaModel.getObject(sEntitySetPath + sDataPoint);
              if (oDataPoint.Value.$Path == oMeasure.key) {
                oMeasure.dataPoint = this.formatJSONToString(ODataMetaModelUtil.createDataPointProperty(oDataPoint));
              }
            }
          }
        }
      }
    },
    formatJSONToString: function (oCrit) {
      if (!oCrit) {
        return undefined;
      }
      var sCriticality = JSON.stringify(oCrit);
      sCriticality = sCriticality.replace(new RegExp("{", "g"), "\\{");
      sCriticality = sCriticality.replace(new RegExp("}", "g"), "\\}");
      return sCriticality;
    }
  });
  return Chart;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJtTWVhc3VyZVJvbGUiLCJDaGFydCIsIk1hY3JvTWV0YWRhdGEiLCJleHRlbmQiLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJtZXRhZGF0YSIsInN0ZXJlb3R5cGUiLCJwcm9wZXJ0aWVzIiwiY2hhcnREZWZpbml0aW9uIiwidHlwZSIsImlkIiwiaXNQdWJsaWMiLCJfYXBwbHlJZFRvQ29udGVudCIsImRlZmF1bHRWYWx1ZSIsIm1ldGFQYXRoIiwiY29udGV4dFBhdGgiLCJoZWlnaHQiLCJ3aWR0aCIsImhlYWRlckxldmVsIiwic2VsZWN0aW9uTW9kZSIsInBlcnNvbmFsaXphdGlvbiIsImZpbHRlckJhciIsImZpbHRlciIsIm5vRGF0YVRleHQiLCJjaGFydERlbGVnYXRlIiwidml6UHJvcGVydGllcyIsImFjdGlvbnMiLCJhdXRvQmluZE9uSW5pdCIsInZpc2libGUiLCJldmVudHMiLCJvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQiLCJzZWxlY3Rpb25DaGFuZ2UiLCJzdGF0ZUNoYW5nZSIsImNyZWF0ZSIsIm9Qcm9wcyIsIm9Db250cm9sQ29uZmlndXJhdGlvbiIsIm1TZXR0aW5ncyIsIm9DaGFydERlZmluaXRpb24iLCJvQ29udGV4dE9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJvQ29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHQiLCJhZ2dyZWdhdGlvbkhlbHBlciIsIkFnZ3JlZ2F0aW9uSGVscGVyIiwiZ2V0RW50aXR5VHlwZSIsInVuZGVmaW5lZCIsInNWaXN1YWxpemF0aW9uUGF0aCIsImdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgiLCJnZXRPYmplY3QiLCIkVHlwZSIsImFWaXN1YWxpemF0aW9ucyIsIlZpc3VhbGl6YXRpb25zIiwiZm9yRWFjaCIsIm9WaXN1YWxpemF0aW9uIiwiJEFubm90YXRpb25QYXRoIiwiaW5kZXhPZiIsIm9WaXN1YWxpemF0aW9uRGVmaW5pdGlvbiIsImdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbiIsInVzZUNvbmRlbnNlZExheW91dCIsInZpc3VhbGl6YXRpb25zIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJwYXRoIiwiZ2V0UGF0aCIsInNldERlZmF1bHRWYWx1ZSIsIm5hdmlnYXRpb25QYXRoIiwidG9VcHBlckNhc2UiLCJnZXRDb250ZW50SWQiLCJmaWx0ZXJJZCIsInNDb250ZXh0UGF0aCIsImxlbmd0aCIsInNsaWNlIiwiTW9kZWxIZWxwZXIiLCJpc0RyYWZ0U3VwcG9ydGVkIiwibW9kZWxzIiwibWV0YU1vZGVsIiwiX2FwaUlkIiwiX2NvbnRlbnRJZCIsIm1lYXN1cmVzIiwiZ2V0Q2hhcnRNZWFzdXJlcyIsIm9NZXRhTW9kZWwiLCJnZXRNb2RlbCIsImFDaGFydEFubm90YXRpb25QYXRoIiwiYW5ub3RhdGlvblBhdGgiLCJzcGxpdCIsInNDaGFydEFubm90YXRpb25QYXRoIiwiaXRlbSIsInBvcyIsInRvU3RyaW5nIiwicmVwbGFjZUFsbCIsIm9DaGFydCIsImFBZ2dyZWdhdGVkUHJvcGVydHkiLCJnZXRBZ2dyZWdhdGVkUHJvcGVydGllcyIsImFNZWFzdXJlcyIsInNBbm5vUGF0aCIsImFBZ2dyZWdhdGVkUHJvcGVydGllcyIsImFDaGFydE1lYXN1cmVzIiwiTWVhc3VyZXMiLCJhQ2hhcnREeW5hbWljTWVhc3VyZXMiLCJEeW5hbWljTWVhc3VyZXMiLCJhVHJhbnNBZ2dJbk1lYXN1cmVzIiwib0FnZ3JlZ2F0ZWRQcm9wZXJ0aWVzIiwic29tZSIsIm9NZWFzdXJlIiwiTmFtZSIsIiRQcm9wZXJ0eVBhdGgiLCJzRW50aXR5U2V0UGF0aCIsInJlcGxhY2UiLCJvVHJhbnNBZ2dyZWdhdGlvbnMiLCJ0cmFuc0FnZyIsIm9DdXN0b21BZ2dyZWdhdGlvbnMiLCJjdXN0b21BZ2ciLCJMb2ciLCJ3YXJuaW5nIiwiYklzQ3VzdG9tQWdncmVnYXRlSXNNZWFzdXJlIiwib0NoYXJ0TWVhc3VyZSIsIm9DdXN0b21BZ2dNZWFzdXJlIiwiZ2V0Q3VzdG9tQWdnTWVhc3VyZSIsIkVycm9yIiwiaSIsInNLZXkiLCJvQWdncmVnYXRlZFByb3BlcnR5IiwiZXJyb3IiLCJzdGFydHNXaXRoIiwib0R5bmFtaWNNZWFzdXJlIiwia2V5Iiwicm9sZSIsInByb3BlcnR5UGF0aCIsIkFnZ3JlZ2F0YWJsZVByb3BlcnR5IiwiYWdncmVnYXRpb25NZXRob2QiLCJBZ2dyZWdhdGlvbk1ldGhvZCIsImxhYmVsIiwic2V0Q2hhcnRNZWFzdXJlQXR0cmlidXRlcyIsIk1lYXN1cmVBdHRyaWJ1dGVzIiwicHVzaCIsIm9UcmFuc0FnZ01lYXN1cmUiLCJvTWVhc3VyZXNNb2RlbCIsIkpTT05Nb2RlbCIsIiQkdmFsdWVBc1Byb21pc2UiLCJhTWVhc3VyZUF0dHJpYnV0ZXMiLCJqIiwib0F0dHJpYnV0ZSIsIkR5bmFtaWNNZWFzdXJlIiwiUGF0aCIsIk1lYXN1cmUiLCJEYXRhUG9pbnQiLCJSb2xlIiwiJEVudW1NZW1iZXIiLCJzRGF0YVBvaW50Iiwib0RhdGFQb2ludCIsIlZhbHVlIiwiJFBhdGgiLCJkYXRhUG9pbnQiLCJmb3JtYXRKU09OVG9TdHJpbmciLCJPRGF0YU1ldGFNb2RlbFV0aWwiLCJjcmVhdGVEYXRhUG9pbnRQcm9wZXJ0eSIsIm9Dcml0Iiwic0NyaXRpY2FsaXR5IiwiSlNPTiIsInN0cmluZ2lmeSIsIlJlZ0V4cCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ2hhcnQubWV0YWRhdGEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAY2xhc3NkZXNjXG4gKiBUaGUgYnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgY2hhcnQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogQGNsYXNzIHNhcC5mZS5tYWNyb3MuQ2hhcnRcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgZ2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQgeyBBZ2dyZWdhdGlvbkhlbHBlciB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IE1hY3JvTWV0YWRhdGEgZnJvbSBcInNhcC9mZS9tYWNyb3MvTWFjcm9NZXRhZGF0YVwiO1xuaW1wb3J0IE9EYXRhTWV0YU1vZGVsVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9PRGF0YU1ldGFNb2RlbFV0aWxcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuXG5jb25zdCBtTWVhc3VyZVJvbGU6IGFueSA9IHtcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydE1lYXN1cmVSb2xlVHlwZS9BeGlzMVwiOiBcImF4aXMxXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRNZWFzdXJlUm9sZVR5cGUvQXhpczJcIjogXCJheGlzMlwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0TWVhc3VyZVJvbGVUeXBlL0F4aXMzXCI6IFwiYXhpczNcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydE1lYXN1cmVSb2xlVHlwZS9BeGlzNFwiOiBcImF4aXM0XCJcbn07XG5cbmNvbnN0IENoYXJ0ID0gTWFjcm9NZXRhZGF0YS5leHRlbmQoXCJzYXAuZmUubWFjcm9zLkNoYXJ0XCIsIHtcblx0LyoqXG5cdCAqIE5hbWUgb2YgdGhlIGJ1aWxkaW5nIGJsb2NrIGNvbnRyb2wuXG5cdCAqL1xuXHRuYW1lOiBcIkNoYXJ0XCIsXG5cdC8qKlxuXHQgKiBOYW1lc3BhY2Ugb2YgdGhlIGJ1aWxkaW5nIGJsb2NrIGNvbnRyb2xcblx0ICovXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsXCIsXG5cdHB1YmxpY05hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsXG5cdC8qKlxuXHQgKiBGcmFnbWVudCBzb3VyY2Ugb2YgdGhlIGJ1aWxkaW5nIGJsb2NrIChvcHRpb25hbCkgLSBpZiBub3Qgc2V0LCBmcmFnbWVudCBpcyBnZW5lcmF0ZWQgZnJvbSBuYW1lc3BhY2UgYW5kIG5hbWVcblx0ICovXG5cdGZyYWdtZW50OiBcInNhcC5mZS5tYWNyb3MuY2hhcnQuQ2hhcnRcIixcblx0LyoqXG5cdCAqIFRoZSBtZXRhZGF0YSBkZXNjcmliaW5nIHRoZSBidWlsZGluZyBibG9jayBjb250cm9sLlxuXHQgKi9cblx0bWV0YWRhdGE6IHtcblx0XHQvKipcblx0XHQgKiBEZWZpbmUgYnVpbGRpbmcgYmxvY2sgc3RlcmVvdHlwZSBmb3IgZG9jdW1lbnRhdGlvblxuXHRcdCAqL1xuXHRcdHN0ZXJlb3R5cGU6IFwieG1sbWFjcm9cIixcblx0XHQvKipcblx0XHQgKiBQcm9wZXJ0aWVzLlxuXHRcdCAqL1xuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdGNoYXJ0RGVmaW5pdGlvbjoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIElEIG9mIHRoZSBjaGFydFxuXHRcdFx0ICovXG5cdFx0XHRpZDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSWYgc3BlY2lmaWNlZCBhcyB0cnVlIHRoZSBJRCBpcyBhcHBsaWVkIHRvIHRoZSBpbm5lciBjb250ZW50IG9mIHRoZSBidWlsZGluZyBibG9ja1xuXHRcdFx0ICogVGhpcyBpcyBvbmx5IGEgcHJpdmF0ZSBwcm9wZXJ0eSB0byBiZSB1c2VkIGJ5IHNhcC5mZSAoRmlvcmkgRWxlbWVudHMpXG5cdFx0XHQgKi9cblx0XHRcdF9hcHBseUlkVG9Db250ZW50OiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBwcmVzZW50YXRpb24gKFVJLkNoYXJ0IHcgb3Igdy9vIHF1YWxpZmllcilcblx0XHRcdCAqL1xuXHRcdFx0bWV0YVBhdGg6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogTWV0YWRhdGEgcGF0aCB0byB0aGUgZW50aXR5U2V0IG9yIG5hdmlnYXRpb25Qcm9wZXJ0eVxuXHRcdFx0ICovXG5cdFx0XHRjb250ZXh0UGF0aDoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUaGUgaGVpZ2h0IG9mIHRoZSBjaGFydFxuXHRcdFx0ICovXG5cdFx0XHRoZWlnaHQ6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBcIjEwMCVcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogVGhlIHdpZHRoIG9mIHRoZSBjaGFydFxuXHRcdFx0ICovXG5cdFx0XHR3aWR0aDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IFwiMTAwJVwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBEZWZpbmVzIHRoZSBcImFyaWEtbGV2ZWxcIiBvZiB0aGUgY2hhcnQgaGVhZGVyXG5cdFx0XHQgKi9cblx0XHRcdGhlYWRlckxldmVsOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuVGl0bGVMZXZlbFwiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IFwiQXV0b1wiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU3BlY2lmaWVzIHRoZSBzZWxlY3Rpb24gbW9kZVxuXHRcdFx0ICovXG5cdFx0XHRzZWxlY3Rpb25Nb2RlOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogXCJNVUxUSVBMRVwiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogUGFyYW1ldGVyIHdoaWNoIHNldHMgdGhlIHBlcnNvbmFsaXphdGlvbiBvZiB0aGUgTURDIGNoYXJ0XG5cdFx0XHQgKi9cblx0XHRcdHBlcnNvbmFsaXphdGlvbjoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ3xib29sZWFuXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBQYXJhbWV0ZXIgd2hpY2ggc2V0cyB0aGUgSUQgb2YgdGhlIGZpbHRlcmJhciBhc3NvY2lhdGluZyBpdCB0byB0aGUgY2hhcnRcblx0XHRcdCAqL1xuXHRcdFx0ZmlsdGVyQmFyOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIFBhcmFtZXRlciB3aGljaCBpbnRlcm5hbGx5IHNldHMgdGhlIElEIG9mIHRoZSBmaWx0ZXJiYXIgYXNzb2NpYXRpbmcgaXQgdG8gdGhlIGNoYXJ0XG5cdFx0XHQgKi9cblx0XHRcdGZpbHRlcjoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogUGFyYW1ldGVyIHdoaWNoIHNldHMgdGhlIG5vRGF0YVRleHQgZm9yIHRoZSBNREMgY2hhcnRcblx0XHRcdCAqL1xuXHRcdFx0bm9EYXRhVGV4dDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBQYXJhbWV0ZXIgd2hpY2ggc2V0cyB0aGUgY2hhcnQgZGVsZWdhdGUgZm9yIHRoZSBNREMgY2hhcnRcblx0XHRcdCAqL1xuXHRcdFx0Y2hhcnREZWxlZ2F0ZToge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBQYXJhbWV0ZXIgd2hpY2ggc2V0cyB0aGUgdml6IHByb3BlcnRpZXMgZm9yIHRoZSBNREMgY2hhcnRcblx0XHRcdCAqL1xuXHRcdFx0dml6UHJvcGVydGllczoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUaGUgYWN0aW9ucyB0byBiZSBzaG93biBpbiB0aGUgYWN0aW9uIGFyZWEgb2YgdGhlIGNoYXJ0XG5cdFx0XHQgKi9cblx0XHRcdGFjdGlvbnM6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdFx0XHR9LFxuXHRcdFx0YXV0b0JpbmRPbkluaXQ6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCJcblx0XHRcdH0sXG5cdFx0XHR2aXNpYmxlOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH1cblx0XHR9LFxuXHRcdGV2ZW50czoge1xuXHRcdFx0b25TZWdtZW50ZWRCdXR0b25QcmVzc2VkOiB7XG5cdFx0XHRcdHR5cGU6IFwiZnVuY3Rpb25cIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gY2hhcnQgc2VsZWN0aW9ucyBhcmUgY2hhbmdlZC4gVGhlIGV2ZW50IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHRoZSBkYXRhIHNlbGVjdGVkL2Rlc2VsZWN0ZWQgYW5kXG5cdFx0XHQgKiB0aGUgQm9vbGVhbiBmbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgZGF0YSBpcyBzZWxlY3RlZCBvciBkZXNlbGVjdGVkXG5cdFx0XHQgKi9cblx0XHRcdHNlbGVjdGlvbkNoYW5nZToge1xuXHRcdFx0XHR0eXBlOiBcIkZ1bmN0aW9uXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFdmVudCBoYW5kbGVyIHRvIHJlYWN0IHRvIHRoZSBzdGF0ZUNoYW5nZSBldmVudCBvZiB0aGUgY2hhcnQuXG5cdFx0XHQgKi9cblx0XHRcdHN0YXRlQ2hhbmdlOiB7XG5cdFx0XHRcdHR5cGU6IFwiZnVuY3Rpb25cIlxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Y3JlYXRlOiBmdW5jdGlvbiAob1Byb3BzOiBhbnksIG9Db250cm9sQ29uZmlndXJhdGlvbjogYW55LCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdGxldCBvQ2hhcnREZWZpbml0aW9uO1xuXHRcdGNvbnN0IG9Db250ZXh0T2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvUHJvcHMubWV0YVBhdGgsIG9Qcm9wcy5jb250ZXh0UGF0aCk7XG5cdFx0Y29uc3Qgb0NvbnZlcnRlckNvbnRleHQgPSB0aGlzLmdldENvbnZlcnRlckNvbnRleHQob0NvbnRleHRPYmplY3RQYXRoLCBvUHJvcHMuY29udGV4dFBhdGgsIG1TZXR0aW5ncyk7XG5cdFx0Y29uc3QgYWdncmVnYXRpb25IZWxwZXIgPSBuZXcgQWdncmVnYXRpb25IZWxwZXIob0NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLCBvQ29udmVydGVyQ29udGV4dCk7XG5cdFx0aWYgKG9Qcm9wcy5jaGFydERlZmluaXRpb24gPT09IHVuZGVmaW5lZCB8fCBvUHJvcHMuY2hhcnREZWZpbml0aW9uID09PSBudWxsKSB7XG5cdFx0XHRsZXQgc1Zpc3VhbGl6YXRpb25QYXRoID0gZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChvQ29udGV4dE9iamVjdFBhdGgpO1xuXHRcdFx0aWYgKG9Qcm9wcy5tZXRhUGF0aC5nZXRPYmplY3QoKS4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5QcmVzZW50YXRpb25WYXJpYW50VHlwZVwiKSB7XG5cdFx0XHRcdGNvbnN0IGFWaXN1YWxpemF0aW9ucyA9IG9Qcm9wcy5tZXRhUGF0aC5nZXRPYmplY3QoKS5WaXN1YWxpemF0aW9ucztcblx0XHRcdFx0YVZpc3VhbGl6YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG9WaXN1YWxpemF0aW9uOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAob1Zpc3VhbGl6YXRpb24uJEFubm90YXRpb25QYXRoLmluZGV4T2YoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIikgPiAtMSkge1xuXHRcdFx0XHRcdFx0c1Zpc3VhbGl6YXRpb25QYXRoID0gb1Zpc3VhbGl6YXRpb24uJEFubm90YXRpb25QYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBvVmlzdWFsaXphdGlvbkRlZmluaXRpb24gPSBnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24oXG5cdFx0XHRcdHNWaXN1YWxpemF0aW9uUGF0aCEsXG5cdFx0XHRcdG9Qcm9wcy51c2VDb25kZW5zZWRMYXlvdXQsXG5cdFx0XHRcdG9Db252ZXJ0ZXJDb250ZXh0XG5cdFx0XHQpO1xuXHRcdFx0b0NoYXJ0RGVmaW5pdGlvbiA9IG9WaXN1YWxpemF0aW9uRGVmaW5pdGlvbi52aXN1YWxpemF0aW9uc1swXTtcblxuXHRcdFx0b1Byb3BzLmNoYXJ0RGVmaW5pdGlvbiA9IHRoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQob0NoYXJ0RGVmaW5pdGlvbiwgbVNldHRpbmdzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b0NoYXJ0RGVmaW5pdGlvbiA9IG9Qcm9wcy5jaGFydERlZmluaXRpb24uZ2V0T2JqZWN0KCk7XG5cdFx0fVxuXHRcdG9DaGFydERlZmluaXRpb24ucGF0aCA9IG9Qcm9wcy5jaGFydERlZmluaXRpb24uZ2V0UGF0aCgpO1xuXHRcdC8vIEFQSSBQcm9wZXJ0aWVzXG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcIm5hdmlnYXRpb25QYXRoXCIsIG9DaGFydERlZmluaXRpb24ubmF2aWdhdGlvblBhdGgpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJhdXRvQmluZE9uSW5pdFwiLCBvQ2hhcnREZWZpbml0aW9uLmF1dG9CaW5kT25Jbml0KTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwidml6UHJvcGVydGllc1wiLCBvQ2hhcnREZWZpbml0aW9uLnZpelByb3BlcnRpZXMpO1xuXHRcdG9Qcm9wcy5hY3Rpb25zID0gdGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChvQ2hhcnREZWZpbml0aW9uLmFjdGlvbnMsIG1TZXR0aW5ncyk7XG5cdFx0b1Byb3BzLnNlbGVjdGlvbk1vZGUgPSBvUHJvcHMuc2VsZWN0aW9uTW9kZS50b1VwcGVyQ2FzZSgpO1xuXHRcdGlmIChvUHJvcHMuZmlsdGVyQmFyKSB7XG5cdFx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiZmlsdGVyXCIsIHRoaXMuZ2V0Q29udGVudElkKG9Qcm9wcy5maWx0ZXJCYXIpKTtcblx0XHR9IGVsc2UgaWYgKCFvUHJvcHMuZmlsdGVyKSB7XG5cdFx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiZmlsdGVyXCIsIG9DaGFydERlZmluaXRpb24uZmlsdGVySWQpO1xuXHRcdH1cblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwib25TZWdtZW50ZWRCdXR0b25QcmVzc2VkXCIsIG9DaGFydERlZmluaXRpb24ub25TZWdtZW50ZWRCdXR0b25QcmVzc2VkKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwidmlzaWJsZVwiLCBvQ2hhcnREZWZpbml0aW9uLnZpc2libGUpO1xuXHRcdGxldCBzQ29udGV4dFBhdGggPSBvUHJvcHMuY29udGV4dFBhdGguZ2V0UGF0aCgpO1xuXHRcdHNDb250ZXh0UGF0aCA9IHNDb250ZXh0UGF0aFtzQ29udGV4dFBhdGgubGVuZ3RoIC0gMV0gPT09IFwiL1wiID8gc0NvbnRleHRQYXRoLnNsaWNlKDAsIC0xKSA6IHNDb250ZXh0UGF0aDtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiZHJhZnRTdXBwb3J0ZWRcIiwgTW9kZWxIZWxwZXIuaXNEcmFmdFN1cHBvcnRlZChtU2V0dGluZ3MubW9kZWxzLm1ldGFNb2RlbCwgc0NvbnRleHRQYXRoKSk7XG5cdFx0aWYgKG9Qcm9wcy5fYXBwbHlJZFRvQ29udGVudCkge1xuXHRcdFx0b1Byb3BzLl9hcGlJZCA9IG9Qcm9wcy5pZCArIFwiOjpDaGFydFwiO1xuXHRcdFx0b1Byb3BzLl9jb250ZW50SWQgPSBvUHJvcHMuaWQ7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9Qcm9wcy5fYXBpSWQgPSBvUHJvcHMuaWQ7XG5cdFx0XHRvUHJvcHMuX2NvbnRlbnRJZCA9IHRoaXMuZ2V0Q29udGVudElkKG9Qcm9wcy5pZCk7XG5cdFx0fVxuXG5cdFx0b1Byb3BzLm1lYXN1cmVzID0gdGhpcy5nZXRDaGFydE1lYXN1cmVzKG9Qcm9wcywgYWdncmVnYXRpb25IZWxwZXIpO1xuXHRcdHJldHVybiBvUHJvcHM7XG5cdH0sXG5cdGdldENoYXJ0TWVhc3VyZXM6IGZ1bmN0aW9uIChvUHJvcHM6IGFueSwgYWdncmVnYXRpb25IZWxwZXI6IGFueSkge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvUHJvcHMubWV0YVBhdGguZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBhQ2hhcnRBbm5vdGF0aW9uUGF0aCA9IG9Qcm9wcy5jaGFydERlZmluaXRpb24uZ2V0T2JqZWN0KCkuYW5ub3RhdGlvblBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdC8vIHRoaXMgaXMgcmVxdWlyZWQgYmVjYXVzZSBnZXRBYnNvbHV0ZVBhdGggaW4gY29udmVydGVyQ29udGV4dCByZXR1cm5zIFwiL1NhbGVzT3JkZXJNYW5hZ2UvX0l0ZW0vX0l0ZW0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLnYxLkNoYXJ0XCIgYXMgYW5ub3RhdGlvblBhdGhcblx0XHRjb25zdCBzQ2hhcnRBbm5vdGF0aW9uUGF0aCA9IGFDaGFydEFubm90YXRpb25QYXRoXG5cdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChpdGVtOiBhbnksIHBvczogYW55KSB7XG5cdFx0XHRcdHJldHVybiBhQ2hhcnRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKGl0ZW0pID09IHBvcztcblx0XHRcdH0pXG5cdFx0XHQudG9TdHJpbmcoKVxuXHRcdFx0LnJlcGxhY2VBbGwoXCIsXCIsIFwiL1wiKTtcblx0XHRjb25zdCBvQ2hhcnQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzQ2hhcnRBbm5vdGF0aW9uUGF0aCk7XG5cdFx0Y29uc3QgYUFnZ3JlZ2F0ZWRQcm9wZXJ0eSA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzKFwiQWdncmVnYXRlZFByb3BlcnR5XCIpO1xuXHRcdGNvbnN0IGFNZWFzdXJlcyA9IFtdO1xuXHRcdGNvbnN0IHNBbm5vUGF0aCA9IG9Qcm9wcy5tZXRhUGF0aC5nZXRQYXRoKCk7XG5cdFx0Y29uc3QgYUFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0QWdncmVnYXRlZFByb3BlcnRpZXMoXCJBZ2dyZWdhdGVkUHJvcGVydGllc1wiKTtcblx0XHRjb25zdCBhQ2hhcnRNZWFzdXJlcyA9IG9DaGFydC5NZWFzdXJlcyA/IG9DaGFydC5NZWFzdXJlcyA6IFtdO1xuXHRcdGNvbnN0IGFDaGFydER5bmFtaWNNZWFzdXJlcyA9IG9DaGFydC5EeW5hbWljTWVhc3VyZXMgPyBvQ2hhcnQuRHluYW1pY01lYXN1cmVzIDogW107XG5cdFx0Ly9jaGVjayBpZiB0aGVyZSBhcmUgbWVhc3VyZXMgcG9pbnRpbmcgdG8gYWdncmVnYXRlZHByb3BlcnRpZXNcblx0XHRjb25zdCBhVHJhbnNBZ2dJbk1lYXN1cmVzID0gYUFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzWzBdXG5cdFx0XHQ/IGFBZ2dyZWdhdGVkUHJvcGVydGllc1swXS5maWx0ZXIoZnVuY3Rpb24gKG9BZ2dyZWdhdGVkUHJvcGVydGllczogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFDaGFydE1lYXN1cmVzLnNvbWUoZnVuY3Rpb24gKG9NZWFzdXJlOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvQWdncmVnYXRlZFByb3BlcnRpZXMuTmFtZSA9PT0gb01lYXN1cmUuJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdCAgfSlcblx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gc0Fubm9QYXRoLnJlcGxhY2UoXG5cdFx0XHQvQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLihDaGFydHxQcmVzZW50YXRpb25WYXJpYW50fFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQpLiovLFxuXHRcdFx0XCJcIlxuXHRcdCk7XG5cdFx0Y29uc3Qgb1RyYW5zQWdncmVnYXRpb25zID0gb1Byb3BzLmNoYXJ0RGVmaW5pdGlvbi5nZXRPYmplY3QoKS50cmFuc0FnZztcblx0XHRjb25zdCBvQ3VzdG9tQWdncmVnYXRpb25zID0gb1Byb3BzLmNoYXJ0RGVmaW5pdGlvbi5nZXRPYmplY3QoKS5jdXN0b21BZ2c7XG5cdFx0Ly8gaW50aW1hdGUgdGhlIHVzZXIgaWYgdGhlcmUgaXMgQWdncmVnYXRlZHByb3BlcnR5IGNvbmZpZ3VyZWQgd2l0aCBubyBEWW5hbWljTWVhc3VyZXMsIGJ1IHRoZXJlIGFyZSBtZWFzdXJlcyB3aXRoIEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzXG5cdFx0aWYgKGFBZ2dyZWdhdGVkUHJvcGVydHkgJiYgIWFDaGFydER5bmFtaWNNZWFzdXJlcyAmJiBhVHJhbnNBZ2dJbk1lYXN1cmVzLmxlbmd0aCA+IDApIHtcblx0XHRcdExvZy53YXJuaW5nKFxuXHRcdFx0XHRcIlRoZSB0cmFuc2Zvcm1hdGlvbmFsIGFnZ3JlZ2F0ZSBtZWFzdXJlcyBhcmUgY29uZmlndXJlZCBhcyBDaGFydC5NZWFzdXJlcyBidXQgc2hvdWxkIGJlIGNvbmZpZ3VyZWQgYXMgQ2hhcnQuRHluYW1pY01lYXN1cmVzIGluc3RlYWQuIFBsZWFzZSBjaGVjayB0aGUgU0FQIEhlbHAgZG9jdW1lbnRhdGlvbiBhbmQgY29ycmVjdCB0aGUgY29uZmlndXJhdGlvbiBhY2NvcmRpbmdseS5cIlxuXHRcdFx0KTtcblx0XHR9XG5cdFx0Y29uc3QgYklzQ3VzdG9tQWdncmVnYXRlSXNNZWFzdXJlID0gYUNoYXJ0TWVhc3VyZXMuc29tZSgob0NoYXJ0TWVhc3VyZTogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvQ3VzdG9tQWdnTWVhc3VyZSA9IHRoaXMuZ2V0Q3VzdG9tQWdnTWVhc3VyZShvQ3VzdG9tQWdncmVnYXRpb25zLCBvQ2hhcnRNZWFzdXJlKTtcblx0XHRcdHJldHVybiAhIW9DdXN0b21BZ2dNZWFzdXJlO1xuXHRcdH0pO1xuXHRcdGlmIChhQWdncmVnYXRlZFByb3BlcnR5Lmxlbmd0aCA+IDAgJiYgIWFDaGFydER5bmFtaWNNZWFzdXJlcy5sZW5ndGggJiYgIWJJc0N1c3RvbUFnZ3JlZ2F0ZUlzTWVhc3VyZSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUGxlYXNlIGNvbmZpZ3VyZSBEeW5hbWljTWVhc3VyZXMgZm9yIHRoZSBjaGFydFwiKTtcblx0XHR9XG5cdFx0aWYgKGFBZ2dyZWdhdGVkUHJvcGVydHkubGVuZ3RoID4gMCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhQ2hhcnREeW5hbWljTWVhc3VyZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3Qgc0tleSA9IGFDaGFydER5bmFtaWNNZWFzdXJlc1tpXS4kQW5ub3RhdGlvblBhdGg7XG5cdFx0XHRcdGNvbnN0IG9BZ2dyZWdhdGVkUHJvcGVydHkgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzRW50aXR5U2V0UGF0aCArIHNLZXkpO1xuXHRcdFx0XHRpZiAoc0tleS5pbmRleE9mKFwiL1wiKSA+IC0xKSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiJGV4cGFuZCBpcyBub3QgeWV0IHN1cHBvcnRlZC4gTWVhc3VyZTogJHtzS2V5fSBmcm9tIGFuIGFzc29jaWF0aW9uIGNhbm5vdCBiZSB1c2VkXCIpO1xuXHRcdFx0XHRcdC8vIGNoZWNrIGlmIHRoZSBhbm5vdGF0aW9uIHBhdGggaXMgd3Jvbmdcblx0XHRcdFx0fSBlbHNlIGlmICghb0FnZ3JlZ2F0ZWRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFx0XHRcdFwiUGxlYXNlIHByb3ZpZGUgdGhlIHJpZ2h0IEFubm90YXRpb25QYXRoIHRvIHRoZSBEeW5hbWljIE1lYXN1cmUgXCIgKyBhQ2hhcnREeW5hbWljTWVhc3VyZXNbaV0uJEFubm90YXRpb25QYXRoXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHQvLyBjaGVjayBpZiB0aGUgcGF0aCBzdGFydHMgd2l0aCBAXG5cdFx0XHRcdH0gZWxzZSBpZiAoIWFDaGFydER5bmFtaWNNZWFzdXJlc1tpXS4kQW5ub3RhdGlvblBhdGguc3RhcnRzV2l0aChcIkBjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuQWdncmVnYXRlZFByb3BlcnR5XCIpKSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdFx0XCJQbGVhc2UgcHJvdmlkZSB0aGUgcmlnaHQgQW5ub3RhdGlvblBhdGggdG8gdGhlIER5bmFtaWMgTWVhc3VyZSBcIiArIGFDaGFydER5bmFtaWNNZWFzdXJlc1tpXS4kQW5ub3RhdGlvblBhdGhcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIGNoZWNrIGlmIEFnZ3JlZ2F0ZWRQcm9wZXJ0eSBpcyBkZWZpbmVkIGluIGdpdmVuIER5bmFtaWNNZWFzdXJlXG5cdFx0XHRcdFx0Y29uc3Qgb0R5bmFtaWNNZWFzdXJlOiBhbnkgPSB7XG5cdFx0XHRcdFx0XHRrZXk6IG9BZ2dyZWdhdGVkUHJvcGVydHkuTmFtZSxcblx0XHRcdFx0XHRcdHJvbGU6IFwiYXhpczFcIlxuXHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0b0R5bmFtaWNNZWFzdXJlLnByb3BlcnR5UGF0aCA9IG9BZ2dyZWdhdGVkUHJvcGVydHkuQWdncmVnYXRhYmxlUHJvcGVydHkuJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHRvRHluYW1pY01lYXN1cmUuYWdncmVnYXRpb25NZXRob2QgPSBvQWdncmVnYXRlZFByb3BlcnR5LkFnZ3JlZ2F0aW9uTWV0aG9kO1xuXHRcdFx0XHRcdG9EeW5hbWljTWVhc3VyZS5sYWJlbCA9XG5cdFx0XHRcdFx0XHRvQWdncmVnYXRlZFByb3BlcnR5W1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbFwiXSB8fFxuXHRcdFx0XHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3Qoc0VudGl0eVNldFBhdGggKyBvRHluYW1pY01lYXN1cmUucHJvcGVydHlQYXRoICsgXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsXCIpO1xuXHRcdFx0XHRcdHRoaXMuc2V0Q2hhcnRNZWFzdXJlQXR0cmlidXRlcyhvQ2hhcnQuTWVhc3VyZUF0dHJpYnV0ZXMsIHNFbnRpdHlTZXRQYXRoLCBvRHluYW1pY01lYXN1cmUsIG9NZXRhTW9kZWwpO1xuXHRcdFx0XHRcdGFNZWFzdXJlcy5wdXNoKG9EeW5hbWljTWVhc3VyZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhQ2hhcnRNZWFzdXJlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3Qgc0tleSA9IGFDaGFydE1lYXN1cmVzW2ldLiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRjb25zdCBvQ3VzdG9tQWdnTWVhc3VyZSA9IHRoaXMuZ2V0Q3VzdG9tQWdnTWVhc3VyZShvQ3VzdG9tQWdncmVnYXRpb25zLCBhQ2hhcnRNZWFzdXJlc1tpXSk7XG5cdFx0XHRjb25zdCBvTWVhc3VyZTogYW55ID0ge307XG5cdFx0XHRpZiAob0N1c3RvbUFnZ01lYXN1cmUpIHtcblx0XHRcdFx0aWYgKHNLZXkuaW5kZXhPZihcIi9cIikgPiAtMSkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihcIiRleHBhbmQgaXMgbm90IHlldCBzdXBwb3J0ZWQuIE1lYXN1cmU6ICR7c0tleX0gZnJvbSBhbiBhc3NvY2lhdGlvbiBjYW5ub3QgYmUgdXNlZFwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvTWVhc3VyZS5rZXkgPSBvQ3VzdG9tQWdnTWVhc3VyZS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRvTWVhc3VyZS5yb2xlID0gXCJheGlzMVwiO1xuXG5cdFx0XHRcdG9NZWFzdXJlLnByb3BlcnR5UGF0aCA9IG9DdXN0b21BZ2dNZWFzdXJlLiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdGFNZWFzdXJlcy5wdXNoKG9NZWFzdXJlKTtcblx0XHRcdFx0Ly9pZiB0aGVyZSBpcyBuZWl0aGVyIGFnZ3JlZ2F0ZWRQcm9wZXJ0eSBub3IgbWVhc3VyZXMgcG9pbnRpbmcgdG8gY3VzdG9tQWdncmVnYXRlcywgYnV0IHdlIGhhdmUgbm9ybWFsIG1lYXN1cmVzLiBOb3cgY2hlY2sgaWYgdGhlc2UgbWVhc3VyZXMgYXJlIHBhcnQgb2YgQWdncmVnYXRlZFByb3BlcnRpZXMgT2JqXG5cdFx0XHR9IGVsc2UgaWYgKGFBZ2dyZWdhdGVkUHJvcGVydHkubGVuZ3RoID09PSAwICYmIG9UcmFuc0FnZ3JlZ2F0aW9uc1tzS2V5XSkge1xuXHRcdFx0XHRjb25zdCBvVHJhbnNBZ2dNZWFzdXJlID0gb1RyYW5zQWdncmVnYXRpb25zW3NLZXldO1xuXHRcdFx0XHRvTWVhc3VyZS5rZXkgPSBvVHJhbnNBZ2dNZWFzdXJlLm5hbWU7XG5cdFx0XHRcdG9NZWFzdXJlLnJvbGUgPSBcImF4aXMxXCI7XG5cdFx0XHRcdG9NZWFzdXJlLnByb3BlcnR5UGF0aCA9IHNLZXk7XG5cdFx0XHRcdG9NZWFzdXJlLmFnZ3JlZ2F0aW9uTWV0aG9kID0gb1RyYW5zQWdnTWVhc3VyZS5hZ2dyZWdhdGlvbk1ldGhvZDtcblx0XHRcdFx0b01lYXN1cmUubGFiZWwgPSBvVHJhbnNBZ2dNZWFzdXJlLmxhYmVsIHx8IG9NZWFzdXJlLmxhYmVsO1xuXHRcdFx0XHRhTWVhc3VyZXMucHVzaChvTWVhc3VyZSk7XG5cdFx0XHR9XG5cdFx0XHR0aGlzLnNldENoYXJ0TWVhc3VyZUF0dHJpYnV0ZXMob0NoYXJ0Lk1lYXN1cmVBdHRyaWJ1dGVzLCBzRW50aXR5U2V0UGF0aCwgb01lYXN1cmUsIG9NZXRhTW9kZWwpO1xuXHRcdH1cblx0XHRjb25zdCBvTWVhc3VyZXNNb2RlbDogYW55ID0gbmV3IEpTT05Nb2RlbChhTWVhc3VyZXMpO1xuXHRcdG9NZWFzdXJlc01vZGVsLiQkdmFsdWVBc1Byb21pc2UgPSB0cnVlO1xuXHRcdHJldHVybiBvTWVhc3VyZXNNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdH0sXG5cdGdldEN1c3RvbUFnZ01lYXN1cmU6IGZ1bmN0aW9uIChvQ3VzdG9tQWdncmVnYXRpb25zOiBhbnksIG9NZWFzdXJlOiBhbnkpOiBhbnkge1xuXHRcdGlmIChvQ3VzdG9tQWdncmVnYXRpb25zW29NZWFzdXJlLiRQcm9wZXJ0eVBhdGhdKSB7XG5cdFx0XHRyZXR1cm4gb01lYXN1cmU7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9LFxuXHRzZXRDaGFydE1lYXN1cmVBdHRyaWJ1dGVzOiBmdW5jdGlvbiAoYU1lYXN1cmVBdHRyaWJ1dGVzOiBhbnksIHNFbnRpdHlTZXRQYXRoOiBhbnksIG9NZWFzdXJlOiBhbnksIG9NZXRhTW9kZWw6IGFueSk6IGFueSB7XG5cdFx0aWYgKGFNZWFzdXJlQXR0cmlidXRlcyAmJiBhTWVhc3VyZUF0dHJpYnV0ZXMubGVuZ3RoKSB7XG5cdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGFNZWFzdXJlQXR0cmlidXRlcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRjb25zdCBvQXR0cmlidXRlOiBhbnkgPSB7fTtcblx0XHRcdFx0aWYgKGFNZWFzdXJlQXR0cmlidXRlc1tqXS5EeW5hbWljTWVhc3VyZSkge1xuXHRcdFx0XHRcdG9BdHRyaWJ1dGUuUGF0aCA9IGFNZWFzdXJlQXR0cmlidXRlc1tqXS5EeW5hbWljTWVhc3VyZS4kQW5ub3RhdGlvblBhdGg7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b0F0dHJpYnV0ZS5QYXRoID0gYU1lYXN1cmVBdHRyaWJ1dGVzW2pdLk1lYXN1cmUuJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0fVxuXHRcdFx0XHRvQXR0cmlidXRlLkRhdGFQb2ludCA9IGFNZWFzdXJlQXR0cmlidXRlc1tqXS5EYXRhUG9pbnQgPyBhTWVhc3VyZUF0dHJpYnV0ZXNbal0uRGF0YVBvaW50LiRQcm9wZXJ0eVBhdGggOiBudWxsO1xuXHRcdFx0XHRvQXR0cmlidXRlLlJvbGUgPSBhTWVhc3VyZUF0dHJpYnV0ZXNbal0uUm9sZTtcblx0XHRcdFx0aWYgKG9NZWFzdXJlLmtleSA9PT0gb0F0dHJpYnV0ZS5QYXRoKSB7XG5cdFx0XHRcdFx0b01lYXN1cmUucm9sZSA9IG9BdHRyaWJ1dGUuUm9sZSA/IG1NZWFzdXJlUm9sZVtvQXR0cmlidXRlLlJvbGUuJEVudW1NZW1iZXJdIDogb01lYXN1cmUucm9sZTtcblx0XHRcdFx0XHQvL3N0aWxsIHRvIGFkZCBkYXRhIHBvaW50LCBidXQgTURDIENoYXJ0IEFQSSBpcyBtaXNzaW5nXG5cdFx0XHRcdFx0Y29uc3Qgc0RhdGFQb2ludCA9IG9BdHRyaWJ1dGUuRGF0YVBvaW50O1xuXHRcdFx0XHRcdGlmIChzRGF0YVBvaW50KSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvRGF0YVBvaW50ID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0VudGl0eVNldFBhdGggKyBzRGF0YVBvaW50KTtcblx0XHRcdFx0XHRcdGlmIChvRGF0YVBvaW50LlZhbHVlLiRQYXRoID09IG9NZWFzdXJlLmtleSkge1xuXHRcdFx0XHRcdFx0XHRvTWVhc3VyZS5kYXRhUG9pbnQgPSB0aGlzLmZvcm1hdEpTT05Ub1N0cmluZyhPRGF0YU1ldGFNb2RlbFV0aWwuY3JlYXRlRGF0YVBvaW50UHJvcGVydHkob0RhdGFQb2ludCkpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Zm9ybWF0SlNPTlRvU3RyaW5nOiBmdW5jdGlvbiAob0NyaXQ6IGFueSk6IGFueSB7XG5cdFx0aWYgKCFvQ3JpdCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0bGV0IHNDcml0aWNhbGl0eSA9IEpTT04uc3RyaW5naWZ5KG9Dcml0KTtcblx0XHRzQ3JpdGljYWxpdHkgPSBzQ3JpdGljYWxpdHkucmVwbGFjZShuZXcgUmVnRXhwKFwie1wiLCBcImdcIiksIFwiXFxcXHtcIik7XG5cdFx0c0NyaXRpY2FsaXR5ID0gc0NyaXRpY2FsaXR5LnJlcGxhY2UobmV3IFJlZ0V4cChcIn1cIiwgXCJnXCIpLCBcIlxcXFx9XCIpO1xuXHRcdHJldHVybiBzQ3JpdGljYWxpdHk7XG5cdH1cbn0pO1xuZXhwb3J0IGRlZmF1bHQgQ2hhcnQ7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7O0VBa0JBLElBQU1BLFlBQWlCLEdBQUc7SUFDekIsdURBQXVELEVBQUUsT0FBTztJQUNoRSx1REFBdUQsRUFB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