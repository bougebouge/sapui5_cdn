/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/helpers/Aggregation", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ModelHelper", "sap/fe/macros/MacroMetadata", "sap/fe/macros/ResourceModel"], function (Log, Aggregation, MetaModelConverter, ModelHelper, MacroMetadata, ResourceModel) {
  "use strict";

  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var AggregationHelper = Aggregation.AggregationHelper;
  var VisualFilter = MacroMetadata.extend("sap.fe.macros.visualfilters.VisualFilter", {
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
    create: function (oProps, oControlConfiguration, mSettings) {
      var _chartAnnotation, _chartAnnotation$Meas;
      oProps.groupId = "$auto.visualFilters";
      oProps.inParameters = oProps.inParameters.getObject();
      this.setDefaultValue(oProps, "aggregateProperties", undefined);
      this.setDefaultValue(oProps, "showValueHelp", undefined);
      this.setDefaultValue(oProps, "bCustomAggregate", false);
      var oContextObjectPath = getInvolvedDataModelObjects(oProps.metaPath, oProps.contextPath);
      var oConverterContext = this.getConverterContext(oContextObjectPath, oProps.contextPath, mSettings);
      var aggregationHelper = new AggregationHelper(oConverterContext.getEntityType(), oConverterContext);
      var customAggregates = aggregationHelper.getCustomAggregateDefinitions();
      var oModel = oProps.contextPath && oProps.contextPath.getModel();
      var sPath = oProps.metaPath && oProps.metaPath.getPath();
      var pvAnnotation = oModel.getObject(sPath);
      var chartAnnotation, sMeasure;
      var aVisualizations = pvAnnotation && pvAnnotation.Visualizations;
      if (aVisualizations) {
        for (var i = 0; i < aVisualizations.length; i++) {
          var sAnnotationPath = pvAnnotation.Visualizations[i] && pvAnnotation.Visualizations[i].$AnnotationPath;
          chartAnnotation = oConverterContext.getEntityTypeAnnotation(sAnnotationPath) && oConverterContext.getEntityTypeAnnotation(sAnnotationPath).annotation;
        }
      }
      var aAggregations,
        aCustAggMeasure = [];
      if ((_chartAnnotation = chartAnnotation) !== null && _chartAnnotation !== void 0 && (_chartAnnotation$Meas = _chartAnnotation.Measures) !== null && _chartAnnotation$Meas !== void 0 && _chartAnnotation$Meas.length) {
        aCustAggMeasure = customAggregates.filter(function (custAgg) {
          return custAgg.qualifier === chartAnnotation.Measures[0].value;
        });
        sMeasure = aCustAggMeasure.length > 0 ? aCustAggMeasure[0].qualifier : chartAnnotation.Measures[0].value;
        aAggregations = aggregationHelper.getAggregatedProperties("AggregatedProperties")[0];
      }
      // if there are AggregatedProperty objects but no dynamic measures, rather there are transformation aggregates found in measures
      if (aAggregations && aAggregations.length > 0 && !chartAnnotation.DynamicMeasures && aCustAggMeasure.length === 0 && chartAnnotation.Measures.length > 0) {
        Log.warning("The transformational aggregate measures are configured as Chart.Measures but should be configured as Chart.DynamicMeasures instead. Please check the SAP Help documentation and correct the configuration accordingly.");
      }
      //if the chart has dynamic measures, but with no other custom aggregate measures then consider the dynamic measures
      if (chartAnnotation.DynamicMeasures) {
        if (aCustAggMeasure.length === 0) {
          sMeasure = oConverterContext.getConverterContextFor(oConverterContext.getAbsoluteAnnotationPath(chartAnnotation.DynamicMeasures[0].value)).getDataModelObjectPath().targetObject.Name;
          aAggregations = aggregationHelper.getAggregatedProperties("AggregatedProperty");
        } else {
          Log.warning("The dynamic measures have been ignored as visual filters can deal with only 1 measure and the first (custom aggregate) measure defined under Chart.Measures is considered.");
        }
      }
      var validChartType;
      if (chartAnnotation) {
        if (chartAnnotation.ChartType === "UI.ChartType/Line" || chartAnnotation.ChartType === "UI.ChartType/Bar") {
          validChartType = true;
        } else {
          validChartType = false;
        }
      }
      if (customAggregates.some(function (custAgg) {
        return custAgg.qualifier === sMeasure;
      })) {
        oProps.bCustomAggregate = true;
      }
      var oSelectionVariant = oProps.selectionVariantAnnotation && oProps.selectionVariantAnnotation.getObject();
      var iSelectOptionsForDimension = 0;
      if (oSelectionVariant && !oProps.multipleSelectionAllowed) {
        for (var j = 0; j < oSelectionVariant.SelectOptions.length; j++) {
          if (oSelectionVariant.SelectOptions[j].PropertyName.$PropertyPath === chartAnnotation.Dimensions[0].value) {
            iSelectOptionsForDimension++;
            if (iSelectOptionsForDimension > 1) {
              throw new Error("Multiple SelectOptions for FilterField having SingleValue Allowed Expression");
            }
          }
        }
      }
      var oAggregation = this.getAggregateProperties(aAggregations, sMeasure);
      if (oAggregation) {
        oProps.aggregateProperties = oAggregation;
      }
      var vUOM = this.getUoM(oModel, oProps.contextPath, sMeasure, oAggregation);
      if (vUOM && vUOM.$Path && customAggregates.some(function (custAgg) {
        return custAgg.qualifier === vUOM.$Path;
      })) {
        oProps.bUoMHasCustomAggregate = true;
      } else {
        oProps.bUoMHasCustomAggregate = false;
      }
      var bHiddenMeasure = this.getHiddenMeasure(oModel, oProps.contextPath, sMeasure, oProps.bCustomAggregate, oAggregation);
      var sDimensionType = chartAnnotation.Dimensions[0] && chartAnnotation.Dimensions[0].$target && chartAnnotation.Dimensions[0].$target.type;
      var sChartType = chartAnnotation.ChartType;
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
      if (typeof bHiddenMeasure === "boolean" && bHiddenMeasure || !validChartType || oProps.renderLineChart === "false") {
        oProps.showError = true;
        oProps.errorMessageTitle = bHiddenMeasure || !validChartType ? ResourceModel.getText("M_VISUAL_FILTERS_ERROR_MESSAGE_TITLE") : ResourceModel.getText("M_VISUAL_FILTER_LINE_CHART_INVALID_DATATYPE");
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
    getAggregateProperties: function (aAggregations, sMeasure) {
      var oMatchedAggregate = {};
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
    getHiddenMeasure: function (oModel, sContextPath, sMeasure, bCustomAggregate, oAggregation) {
      var sAggregatablePropertyPath;
      if (!bCustomAggregate && oAggregation) {
        sAggregatablePropertyPath = oAggregation.AggregatableProperty && oAggregation.AggregatableProperty.value;
      } else {
        sAggregatablePropertyPath = sMeasure;
      }
      var vHiddenMeasure = oModel.getObject(sContextPath + "/" + sAggregatablePropertyPath + "@com.sap.vocabularies.UI.v1.Hidden");
      if (!vHiddenMeasure && oAggregation && oAggregation.AggregatableProperty) {
        vHiddenMeasure = oModel.getObject(sContextPath + "/" + sAggregatablePropertyPath + "@com.sap.vocabularies.UI.v1.Hidden");
      }
      return vHiddenMeasure;
    },
    getUoM: function (oModel, sContextPath, sMeasure, oAggregation) {
      var vISOCurrency = oModel.getObject(sContextPath + "/" + sMeasure + "@Org.OData.Measures.V1.ISOCurrency");
      var vUnit = oModel.getObject(sContextPath + "/" + sMeasure + "@Org.OData.Measures.V1.Unit");
      if (!vISOCurrency && !vUnit && oAggregation && oAggregation.AggregatableProperty) {
        vISOCurrency = oModel.getObject(sContextPath + "/" + oAggregation.AggregatableProperty.value + "@Org.OData.Measures.V1.ISOCurrency");
        vUnit = oModel.getObject(sContextPath + "/" + oAggregation.AggregatableProperty.value + "@Org.OData.Measures.V1.Unit");
      }
      return vISOCurrency || vUnit;
    }
  });
  return VisualFilter;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWaXN1YWxGaWx0ZXIiLCJNYWNyb01ldGFkYXRhIiwiZXh0ZW5kIiwibmFtZSIsIm5hbWVzcGFjZSIsImZyYWdtZW50IiwibWV0YWRhdGEiLCJwcm9wZXJ0aWVzIiwiaWQiLCJ0eXBlIiwidGl0bGUiLCJkZWZhdWx0VmFsdWUiLCJjb250ZXh0UGF0aCIsInJlcXVpcmVkIiwiJGtpbmQiLCJtZXRhUGF0aCIsIm91dFBhcmFtZXRlciIsInNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uIiwiaW5QYXJhbWV0ZXJzIiwibXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkIiwic2hvd092ZXJsYXlJbml0aWFsbHkiLCJyZW5kZXJMaW5lQ2hhcnQiLCJyZXF1aXJlZFByb3BlcnRpZXMiLCJmaWx0ZXJCYXJFbnRpdHlUeXBlIiwic2hvd0Vycm9yIiwiY2hhcnRNZWFzdXJlIiwiY3JlYXRlIiwib1Byb3BzIiwib0NvbnRyb2xDb25maWd1cmF0aW9uIiwibVNldHRpbmdzIiwiZ3JvdXBJZCIsImdldE9iamVjdCIsInNldERlZmF1bHRWYWx1ZSIsInVuZGVmaW5lZCIsIm9Db250ZXh0T2JqZWN0UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIm9Db252ZXJ0ZXJDb250ZXh0IiwiZ2V0Q29udmVydGVyQ29udGV4dCIsImFnZ3JlZ2F0aW9uSGVscGVyIiwiQWdncmVnYXRpb25IZWxwZXIiLCJnZXRFbnRpdHlUeXBlIiwiY3VzdG9tQWdncmVnYXRlcyIsImdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zIiwib01vZGVsIiwiZ2V0TW9kZWwiLCJzUGF0aCIsImdldFBhdGgiLCJwdkFubm90YXRpb24iLCJjaGFydEFubm90YXRpb24iLCJzTWVhc3VyZSIsImFWaXN1YWxpemF0aW9ucyIsIlZpc3VhbGl6YXRpb25zIiwiaSIsImxlbmd0aCIsInNBbm5vdGF0aW9uUGF0aCIsIiRBbm5vdGF0aW9uUGF0aCIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwiYW5ub3RhdGlvbiIsImFBZ2dyZWdhdGlvbnMiLCJhQ3VzdEFnZ01lYXN1cmUiLCJNZWFzdXJlcyIsImZpbHRlciIsImN1c3RBZ2ciLCJxdWFsaWZpZXIiLCJ2YWx1ZSIsImdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzIiwiRHluYW1pY01lYXN1cmVzIiwiTG9nIiwid2FybmluZyIsImdldENvbnZlcnRlckNvbnRleHRGb3IiLCJnZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoIiwiZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCIsInRhcmdldE9iamVjdCIsIk5hbWUiLCJ2YWxpZENoYXJ0VHlwZSIsIkNoYXJ0VHlwZSIsInNvbWUiLCJiQ3VzdG9tQWdncmVnYXRlIiwib1NlbGVjdGlvblZhcmlhbnQiLCJpU2VsZWN0T3B0aW9uc0ZvckRpbWVuc2lvbiIsImoiLCJTZWxlY3RPcHRpb25zIiwiUHJvcGVydHlOYW1lIiwiJFByb3BlcnR5UGF0aCIsIkRpbWVuc2lvbnMiLCJFcnJvciIsIm9BZ2dyZWdhdGlvbiIsImdldEFnZ3JlZ2F0ZVByb3BlcnRpZXMiLCJhZ2dyZWdhdGVQcm9wZXJ0aWVzIiwidlVPTSIsImdldFVvTSIsIiRQYXRoIiwiYlVvTUhhc0N1c3RvbUFnZ3JlZ2F0ZSIsImJIaWRkZW5NZWFzdXJlIiwiZ2V0SGlkZGVuTWVhc3VyZSIsInNEaW1lbnNpb25UeXBlIiwiJHRhcmdldCIsInNDaGFydFR5cGUiLCJzaG93VmFsdWVIZWxwIiwiTW9kZWxIZWxwZXIiLCJpc0RyYWZ0U3VwcG9ydGVkIiwibW9kZWxzIiwibWV0YU1vZGVsIiwiZXJyb3JNZXNzYWdlVGl0bGUiLCJSZXNvdXJjZU1vZGVsIiwiZ2V0VGV4dCIsImVycm9yTWVzc2FnZSIsIm9NYXRjaGVkQWdncmVnYXRlIiwib0FnZ3JlZ2F0ZSIsInNDb250ZXh0UGF0aCIsInNBZ2dyZWdhdGFibGVQcm9wZXJ0eVBhdGgiLCJBZ2dyZWdhdGFibGVQcm9wZXJ0eSIsInZIaWRkZW5NZWFzdXJlIiwidklTT0N1cnJlbmN5IiwidlVuaXQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlZpc3VhbEZpbHRlci5tZXRhZGF0YS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBjbGFzc2Rlc2NcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIFZpc3VhbEZpbHRlciBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKiA8YnI+XG4gKiBBIENoYXJ0IGFubm90YXRpb24gaXMgcmVxdWlyZWQgdG8gYnJpbmcgdXAgYW4gaW50ZXJhY3RpdmUgY2hhcnRcbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86VmlzdWFsRmlsdGVyXG4gKiAgIGNvbGxlY3Rpb249XCJ7ZW50aXR5U2V0Jmd0O31cIlxuICogICBjaGFydEFubm90YXRpb249XCJ7Y2hhcnRBbm5vdGF0aW9uJmd0O31cIlxuICogICBpZD1cInNvbWVJRFwiXG4gKiAgIGdyb3VwSWQ9XCJzb21lR3JvdXBJRFwiXG4gKiAgIHRpdGxlPVwic29tZSBUaXRsZVwiXG4gKiAvJmd0O1xuICogPC9wcmU+XG4gKiBAY2xhc3Mgc2FwLmZlLm1hY3Jvcy5WaXN1YWxGaWx0ZXJcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgQWdncmVnYXRpb25IZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0FnZ3JlZ2F0aW9uXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IE1hY3JvTWV0YWRhdGEgZnJvbSBcInNhcC9mZS9tYWNyb3MvTWFjcm9NZXRhZGF0YVwiO1xuaW1wb3J0IFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxuY29uc3QgVmlzdWFsRmlsdGVyID0gTWFjcm9NZXRhZGF0YS5leHRlbmQoXCJzYXAuZmUubWFjcm9zLnZpc3VhbGZpbHRlcnMuVmlzdWFsRmlsdGVyXCIsIHtcblx0LyoqXG5cdCAqIE5hbWUgb2YgdGhlIG1hY3JvIGNvbnRyb2wuXG5cdCAqL1xuXHRuYW1lOiBcIlZpc3VhbEZpbHRlclwiLFxuXHQvKipcblx0ICogTmFtZXNwYWNlIG9mIHRoZSBtYWNybyBjb250cm9sXG5cdCAqL1xuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiLFxuXHQvKipcblx0ICogRnJhZ21lbnQgc291cmNlIG9mIHRoZSBtYWNybyAob3B0aW9uYWwpIC0gaWYgbm90IHNldCwgZnJhZ21lbnQgaXMgZ2VuZXJhdGVkIGZyb20gbmFtZXNwYWNlIGFuZCBuYW1lXG5cdCAqL1xuXHRmcmFnbWVudDogXCJzYXAuZmUubWFjcm9zLnZpc3VhbGZpbHRlcnMuVmlzdWFsRmlsdGVyXCIsXG5cdC8qKlxuXHQgKiBUaGUgbWV0YWRhdGEgZGVzY3JpYmluZyB0aGUgbWFjcm8gY29udHJvbC5cblx0ICovXG5cdG1ldGFkYXRhOiB7XG5cdFx0LyoqXG5cdFx0ICogUHJvcGVydGllcy5cblx0XHQgKi9cblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHQvKipcblx0XHRcdCAqIElEIG9mIHRoZSB2aXN1YWwgZmlsdGVyXG5cdFx0XHQgKi9cblx0XHRcdGlkOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFRpdGxlIGZvciB0aGUgdmlzdWFsIGZpbHRlci5cblx0XHRcdCAqL1xuXHRcdFx0dGl0bGU6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBcIlwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBlbnRpdHlTZXQgb3IgbmF2aWdhdGlvblByb3BlcnR5XG5cdFx0XHQgKi9cblx0XHRcdGNvbnRleHRQYXRoOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRcdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0XHRcdCRraW5kOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIl1cblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIHByZXNlbnRhdGlvbiB2YXJpYW50IGFubm90YXRpb25zXG5cdFx0XHQgKi9cblx0XHRcdG1ldGFQYXRoOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogUHJvcGVydHkgUGF0aCBvZiB0aGUgRGltZW5zaW9uIGluIHRoZSBtYWluIGVudGl0eSBzZXRcblx0XHRcdCAqL1xuXHRcdFx0b3V0UGFyYW1ldGVyOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIHNlbGVjdGlvbiB2YXJpYW50IGFubm90YXRpb25zXG5cdFx0XHQgKi9cblx0XHRcdHNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogaW5QYXJhbWV0ZXJzIGFwcGxpY2FibGUgdG8gdGhlIHZpc3VhbCBmaWx0ZXJcblx0XHRcdCAqL1xuXHRcdFx0aW5QYXJhbWV0ZXJzOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogbXVsdGlwbGUgc2VsZWN0aW9uIGFwcGxpY2FibGUgdG8gdGhlIHZpc3VhbCBmaWx0ZXJcblx0XHRcdCAqL1xuXHRcdFx0bXVsdGlwbGVTZWxlY3Rpb25BbGxvd2VkOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiByZXF1aXJlZCBwcm9wZXJ0eSBvZiB0aGUgdmlzdWFsIGZpbHRlclxuXHRcdFx0ICovXG5cdFx0XHRyZXF1aXJlZDoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHRcdFx0fSxcblx0XHRcdHNob3dPdmVybGF5SW5pdGlhbGx5OiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdFx0XHR9LFxuXHRcdFx0cmVuZGVyTGluZUNoYXJ0OiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdFx0XHR9LFxuXHRcdFx0cmVxdWlyZWRQcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIlxuXHRcdFx0fSxcblx0XHRcdGZpbHRlckJhckVudGl0eVR5cGU6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdFx0XHR9LFxuXHRcdFx0c2hvd0Vycm9yOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiXG5cdFx0XHR9LFxuXHRcdFx0Y2hhcnRNZWFzdXJlOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGNyZWF0ZTogZnVuY3Rpb24gKG9Qcm9wczogYW55LCBvQ29udHJvbENvbmZpZ3VyYXRpb246IGFueSwgbVNldHRpbmdzOiBhbnkpIHtcblx0XHRvUHJvcHMuZ3JvdXBJZCA9IFwiJGF1dG8udmlzdWFsRmlsdGVyc1wiO1xuXHRcdG9Qcm9wcy5pblBhcmFtZXRlcnMgPSBvUHJvcHMuaW5QYXJhbWV0ZXJzLmdldE9iamVjdCgpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJhZ2dyZWdhdGVQcm9wZXJ0aWVzXCIsIHVuZGVmaW5lZCk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcInNob3dWYWx1ZUhlbHBcIiwgdW5kZWZpbmVkKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiYkN1c3RvbUFnZ3JlZ2F0ZVwiLCBmYWxzZSk7XG5cdFx0Y29uc3Qgb0NvbnRleHRPYmplY3RQYXRoID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9Qcm9wcy5tZXRhUGF0aCwgb1Byb3BzLmNvbnRleHRQYXRoKTtcblx0XHRjb25zdCBvQ29udmVydGVyQ29udGV4dCA9IHRoaXMuZ2V0Q29udmVydGVyQ29udGV4dChvQ29udGV4dE9iamVjdFBhdGgsIG9Qcm9wcy5jb250ZXh0UGF0aCwgbVNldHRpbmdzKTtcblx0XHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihvQ29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCksIG9Db252ZXJ0ZXJDb250ZXh0KTtcblx0XHRjb25zdCBjdXN0b21BZ2dyZWdhdGVzID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0Q3VzdG9tQWdncmVnYXRlRGVmaW5pdGlvbnMoKTtcblx0XHRjb25zdCBvTW9kZWwgPSBvUHJvcHMuY29udGV4dFBhdGggJiYgb1Byb3BzLmNvbnRleHRQYXRoLmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgc1BhdGggPSBvUHJvcHMubWV0YVBhdGggJiYgb1Byb3BzLm1ldGFQYXRoLmdldFBhdGgoKTtcblx0XHRjb25zdCBwdkFubm90YXRpb24gPSBvTW9kZWwuZ2V0T2JqZWN0KHNQYXRoKTtcblx0XHRsZXQgY2hhcnRBbm5vdGF0aW9uOiBhbnksIHNNZWFzdXJlITogYW55O1xuXHRcdGNvbnN0IGFWaXN1YWxpemF0aW9ucyA9IHB2QW5ub3RhdGlvbiAmJiBwdkFubm90YXRpb24uVmlzdWFsaXphdGlvbnM7XG5cdFx0aWYgKGFWaXN1YWxpemF0aW9ucykge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhVmlzdWFsaXphdGlvbnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3Qgc0Fubm90YXRpb25QYXRoID0gcHZBbm5vdGF0aW9uLlZpc3VhbGl6YXRpb25zW2ldICYmIHB2QW5ub3RhdGlvbi5WaXN1YWxpemF0aW9uc1tpXS4kQW5ub3RhdGlvblBhdGg7XG5cdFx0XHRcdGNoYXJ0QW5ub3RhdGlvbiA9XG5cdFx0XHRcdFx0b0NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oc0Fubm90YXRpb25QYXRoKSAmJlxuXHRcdFx0XHRcdG9Db252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKHNBbm5vdGF0aW9uUGF0aCkuYW5ub3RhdGlvbjtcblx0XHRcdH1cblx0XHR9XG5cdFx0bGV0IGFBZ2dyZWdhdGlvbnM6IGFueSxcblx0XHRcdGFDdXN0QWdnTWVhc3VyZTogYW55ID0gW107XG5cblx0XHRpZiAoY2hhcnRBbm5vdGF0aW9uPy5NZWFzdXJlcz8ubGVuZ3RoKSB7XG5cdFx0XHRhQ3VzdEFnZ01lYXN1cmUgPSBjdXN0b21BZ2dyZWdhdGVzLmZpbHRlcihmdW5jdGlvbiAoY3VzdEFnZykge1xuXHRcdFx0XHRyZXR1cm4gY3VzdEFnZy5xdWFsaWZpZXIgPT09IGNoYXJ0QW5ub3RhdGlvbi5NZWFzdXJlc1swXS52YWx1ZTtcblx0XHRcdH0pO1xuXHRcdFx0c01lYXN1cmUgPSBhQ3VzdEFnZ01lYXN1cmUubGVuZ3RoID4gMCA/IGFDdXN0QWdnTWVhc3VyZVswXS5xdWFsaWZpZXIgOiBjaGFydEFubm90YXRpb24uTWVhc3VyZXNbMF0udmFsdWU7XG5cdFx0XHRhQWdncmVnYXRpb25zID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0QWdncmVnYXRlZFByb3BlcnRpZXMoXCJBZ2dyZWdhdGVkUHJvcGVydGllc1wiKVswXTtcblx0XHR9XG5cdFx0Ly8gaWYgdGhlcmUgYXJlIEFnZ3JlZ2F0ZWRQcm9wZXJ0eSBvYmplY3RzIGJ1dCBubyBkeW5hbWljIG1lYXN1cmVzLCByYXRoZXIgdGhlcmUgYXJlIHRyYW5zZm9ybWF0aW9uIGFnZ3JlZ2F0ZXMgZm91bmQgaW4gbWVhc3VyZXNcblx0XHRpZiAoXG5cdFx0XHRhQWdncmVnYXRpb25zICYmXG5cdFx0XHRhQWdncmVnYXRpb25zLmxlbmd0aCA+IDAgJiZcblx0XHRcdCFjaGFydEFubm90YXRpb24uRHluYW1pY01lYXN1cmVzICYmXG5cdFx0XHRhQ3VzdEFnZ01lYXN1cmUubGVuZ3RoID09PSAwICYmXG5cdFx0XHRjaGFydEFubm90YXRpb24uTWVhc3VyZXMubGVuZ3RoID4gMFxuXHRcdCkge1xuXHRcdFx0TG9nLndhcm5pbmcoXG5cdFx0XHRcdFwiVGhlIHRyYW5zZm9ybWF0aW9uYWwgYWdncmVnYXRlIG1lYXN1cmVzIGFyZSBjb25maWd1cmVkIGFzIENoYXJ0Lk1lYXN1cmVzIGJ1dCBzaG91bGQgYmUgY29uZmlndXJlZCBhcyBDaGFydC5EeW5hbWljTWVhc3VyZXMgaW5zdGVhZC4gUGxlYXNlIGNoZWNrIHRoZSBTQVAgSGVscCBkb2N1bWVudGF0aW9uIGFuZCBjb3JyZWN0IHRoZSBjb25maWd1cmF0aW9uIGFjY29yZGluZ2x5LlwiXG5cdFx0XHQpO1xuXHRcdH1cblx0XHQvL2lmIHRoZSBjaGFydCBoYXMgZHluYW1pYyBtZWFzdXJlcywgYnV0IHdpdGggbm8gb3RoZXIgY3VzdG9tIGFnZ3JlZ2F0ZSBtZWFzdXJlcyB0aGVuIGNvbnNpZGVyIHRoZSBkeW5hbWljIG1lYXN1cmVzXG5cdFx0aWYgKGNoYXJ0QW5ub3RhdGlvbi5EeW5hbWljTWVhc3VyZXMpIHtcblx0XHRcdGlmIChhQ3VzdEFnZ01lYXN1cmUubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdHNNZWFzdXJlID0gb0NvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0XHQuZ2V0Q29udmVydGVyQ29udGV4dEZvcihvQ29udmVydGVyQ29udGV4dC5nZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoKGNoYXJ0QW5ub3RhdGlvbi5EeW5hbWljTWVhc3VyZXNbMF0udmFsdWUpKVxuXHRcdFx0XHRcdC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkudGFyZ2V0T2JqZWN0Lk5hbWU7XG5cdFx0XHRcdGFBZ2dyZWdhdGlvbnMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRBZ2dyZWdhdGVkUHJvcGVydGllcyhcIkFnZ3JlZ2F0ZWRQcm9wZXJ0eVwiKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdExvZy53YXJuaW5nKFxuXHRcdFx0XHRcdFwiVGhlIGR5bmFtaWMgbWVhc3VyZXMgaGF2ZSBiZWVuIGlnbm9yZWQgYXMgdmlzdWFsIGZpbHRlcnMgY2FuIGRlYWwgd2l0aCBvbmx5IDEgbWVhc3VyZSBhbmQgdGhlIGZpcnN0IChjdXN0b20gYWdncmVnYXRlKSBtZWFzdXJlIGRlZmluZWQgdW5kZXIgQ2hhcnQuTWVhc3VyZXMgaXMgY29uc2lkZXJlZC5cIlxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRsZXQgdmFsaWRDaGFydFR5cGU7XG5cdFx0aWYgKGNoYXJ0QW5ub3RhdGlvbikge1xuXHRcdFx0aWYgKGNoYXJ0QW5ub3RhdGlvbi5DaGFydFR5cGUgPT09IFwiVUkuQ2hhcnRUeXBlL0xpbmVcIiB8fCBjaGFydEFubm90YXRpb24uQ2hhcnRUeXBlID09PSBcIlVJLkNoYXJ0VHlwZS9CYXJcIikge1xuXHRcdFx0XHR2YWxpZENoYXJ0VHlwZSA9IHRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWxpZENoYXJ0VHlwZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoXG5cdFx0XHRjdXN0b21BZ2dyZWdhdGVzLnNvbWUoZnVuY3Rpb24gKGN1c3RBZ2cpIHtcblx0XHRcdFx0cmV0dXJuIGN1c3RBZ2cucXVhbGlmaWVyID09PSBzTWVhc3VyZTtcblx0XHRcdH0pXG5cdFx0KSB7XG5cdFx0XHRvUHJvcHMuYkN1c3RvbUFnZ3JlZ2F0ZSA9IHRydWU7XG5cdFx0fVxuXHRcdGNvbnN0IG9TZWxlY3Rpb25WYXJpYW50ID0gb1Byb3BzLnNlbGVjdGlvblZhcmlhbnRBbm5vdGF0aW9uICYmIG9Qcm9wcy5zZWxlY3Rpb25WYXJpYW50QW5ub3RhdGlvbi5nZXRPYmplY3QoKTtcblx0XHRsZXQgaVNlbGVjdE9wdGlvbnNGb3JEaW1lbnNpb24gPSAwO1xuXHRcdGlmIChvU2VsZWN0aW9uVmFyaWFudCAmJiAhb1Byb3BzLm11bHRpcGxlU2VsZWN0aW9uQWxsb3dlZCkge1xuXHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBvU2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdGlmIChvU2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zW2pdLlByb3BlcnR5TmFtZS4kUHJvcGVydHlQYXRoID09PSBjaGFydEFubm90YXRpb24uRGltZW5zaW9uc1swXS52YWx1ZSkge1xuXHRcdFx0XHRcdGlTZWxlY3RPcHRpb25zRm9yRGltZW5zaW9uKys7XG5cdFx0XHRcdFx0aWYgKGlTZWxlY3RPcHRpb25zRm9yRGltZW5zaW9uID4gMSkge1xuXHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiTXVsdGlwbGUgU2VsZWN0T3B0aW9ucyBmb3IgRmlsdGVyRmllbGQgaGF2aW5nIFNpbmdsZVZhbHVlIEFsbG93ZWQgRXhwcmVzc2lvblwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBvQWdncmVnYXRpb24gPSB0aGlzLmdldEFnZ3JlZ2F0ZVByb3BlcnRpZXMoYUFnZ3JlZ2F0aW9ucywgc01lYXN1cmUpO1xuXG5cdFx0aWYgKG9BZ2dyZWdhdGlvbikge1xuXHRcdFx0b1Byb3BzLmFnZ3JlZ2F0ZVByb3BlcnRpZXMgPSBvQWdncmVnYXRpb247XG5cdFx0fVxuXHRcdGNvbnN0IHZVT00gPSB0aGlzLmdldFVvTShvTW9kZWwsIG9Qcm9wcy5jb250ZXh0UGF0aCwgc01lYXN1cmUsIG9BZ2dyZWdhdGlvbik7XG5cdFx0aWYgKFxuXHRcdFx0dlVPTSAmJlxuXHRcdFx0dlVPTS4kUGF0aCAmJlxuXHRcdFx0Y3VzdG9tQWdncmVnYXRlcy5zb21lKGZ1bmN0aW9uIChjdXN0QWdnKSB7XG5cdFx0XHRcdHJldHVybiBjdXN0QWdnLnF1YWxpZmllciA9PT0gdlVPTS4kUGF0aDtcblx0XHRcdH0pXG5cdFx0KSB7XG5cdFx0XHRvUHJvcHMuYlVvTUhhc0N1c3RvbUFnZ3JlZ2F0ZSA9IHRydWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9Qcm9wcy5iVW9NSGFzQ3VzdG9tQWdncmVnYXRlID0gZmFsc2U7XG5cdFx0fVxuXHRcdGNvbnN0IGJIaWRkZW5NZWFzdXJlID0gdGhpcy5nZXRIaWRkZW5NZWFzdXJlKG9Nb2RlbCwgb1Byb3BzLmNvbnRleHRQYXRoLCBzTWVhc3VyZSwgb1Byb3BzLmJDdXN0b21BZ2dyZWdhdGUsIG9BZ2dyZWdhdGlvbik7XG5cdFx0Y29uc3Qgc0RpbWVuc2lvblR5cGUgPVxuXHRcdFx0Y2hhcnRBbm5vdGF0aW9uLkRpbWVuc2lvbnNbMF0gJiYgY2hhcnRBbm5vdGF0aW9uLkRpbWVuc2lvbnNbMF0uJHRhcmdldCAmJiBjaGFydEFubm90YXRpb24uRGltZW5zaW9uc1swXS4kdGFyZ2V0LnR5cGU7XG5cdFx0Y29uc3Qgc0NoYXJ0VHlwZSA9IGNoYXJ0QW5ub3RhdGlvbi5DaGFydFR5cGU7XG5cdFx0aWYgKHNEaW1lbnNpb25UeXBlID09PSBcIkVkbS5EYXRlXCIgfHwgc0RpbWVuc2lvblR5cGUgPT09IFwiRWRtLlRpbWVcIiB8fCBzRGltZW5zaW9uVHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIikge1xuXHRcdFx0b1Byb3BzLnNob3dWYWx1ZUhlbHAgPSBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBiSGlkZGVuTWVhc3VyZSA9PT0gXCJib29sZWFuXCIgJiYgYkhpZGRlbk1lYXN1cmUpIHtcblx0XHRcdG9Qcm9wcy5zaG93VmFsdWVIZWxwID0gZmFsc2U7XG5cdFx0fSBlbHNlIGlmICghKHNDaGFydFR5cGUgPT09IFwiVUkuQ2hhcnRUeXBlL0JhclwiIHx8IHNDaGFydFR5cGUgPT09IFwiVUkuQ2hhcnRUeXBlL0xpbmVcIikpIHtcblx0XHRcdG9Qcm9wcy5zaG93VmFsdWVIZWxwID0gZmFsc2U7XG5cdFx0fSBlbHNlIGlmIChvUHJvcHMucmVuZGVyTGluZUNoYXJ0ID09PSBcImZhbHNlXCIgJiYgc0NoYXJ0VHlwZSA9PT0gXCJVSS5DaGFydFR5cGUvTGluZVwiKSB7XG5cdFx0XHRvUHJvcHMuc2hvd1ZhbHVlSGVscCA9IGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUHJvcHMuc2hvd1ZhbHVlSGVscCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImRyYWZ0U3VwcG9ydGVkXCIsIE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQobVNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwsIG9Qcm9wcy5jb250ZXh0UGF0aCkpO1xuXHRcdC8qKlxuXHRcdCAqIElmIHRoZSBtZWFzdXJlIG9mIHRoZSBjaGFydCBpcyBtYXJrZWQgYXMgJ2hpZGRlbicsIG9yIGlmIHRoZSBjaGFydCB0eXBlIGlzIGludmFsaWQsIG9yIGlmIHRoZSBkYXRhIHR5cGUgZm9yIHRoZSBsaW5lIGNoYXJ0IGlzIGludmFsaWQsXG5cdFx0ICogdGhlIGNhbGwgaXMgbWFkZSB0byB0aGUgSW50ZXJhY3RpdmVDaGFydFdpdGhFcnJvciBmcmFnbWVudCAodXNpbmcgZXJyb3ItbWVzc2FnZSByZWxhdGVkIEFQSXMsIGJ1dCBhdm9pZGluZyBiYXRjaCBjYWxscylcblx0XHQgKi9cblx0XHRpZiAoKHR5cGVvZiBiSGlkZGVuTWVhc3VyZSA9PT0gXCJib29sZWFuXCIgJiYgYkhpZGRlbk1lYXN1cmUpIHx8ICF2YWxpZENoYXJ0VHlwZSB8fCBvUHJvcHMucmVuZGVyTGluZUNoYXJ0ID09PSBcImZhbHNlXCIpIHtcblx0XHRcdG9Qcm9wcy5zaG93RXJyb3IgPSB0cnVlO1xuXHRcdFx0b1Byb3BzLmVycm9yTWVzc2FnZVRpdGxlID1cblx0XHRcdFx0YkhpZGRlbk1lYXN1cmUgfHwgIXZhbGlkQ2hhcnRUeXBlXG5cdFx0XHRcdFx0PyBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJNX1ZJU1VBTF9GSUxURVJTX0VSUk9SX01FU1NBR0VfVElUTEVcIilcblx0XHRcdFx0XHQ6IFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUl9MSU5FX0NIQVJUX0lOVkFMSURfREFUQVRZUEVcIik7XG5cdFx0XHRpZiAoYkhpZGRlbk1lYXN1cmUpIHtcblx0XHRcdFx0b1Byb3BzLmVycm9yTWVzc2FnZSA9IFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fVklTVUFMX0ZJTFRFUl9ISURERU5fTUVBU1VSRVwiLCBzTWVhc3VyZSk7XG5cdFx0XHR9IGVsc2UgaWYgKCF2YWxpZENoYXJ0VHlwZSkge1xuXHRcdFx0XHRvUHJvcHMuZXJyb3JNZXNzYWdlID0gUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSX1VOU1VQUE9SVEVEX0NIQVJUX1RZUEVcIik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvUHJvcHMuZXJyb3JNZXNzYWdlID0gUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9WSVNVQUxfRklMVEVSX0xJTkVfQ0hBUlRfVU5TVVBQT1JURURfRElNRU5TSU9OXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRvUHJvcHMuY2hhcnRNZWFzdXJlID0gc01lYXN1cmU7XG5cdFx0cmV0dXJuIG9Qcm9wcztcblx0fSxcblxuXHRnZXRBZ2dyZWdhdGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoYUFnZ3JlZ2F0aW9uczogYW55W10sIHNNZWFzdXJlOiBzdHJpbmcpIHtcblx0XHRsZXQgb01hdGNoZWRBZ2dyZWdhdGUgPSB7fTtcblx0XHRpZiAoIWFBZ2dyZWdhdGlvbnMpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0YUFnZ3JlZ2F0aW9ucy5zb21lKGZ1bmN0aW9uIChvQWdncmVnYXRlKSB7XG5cdFx0XHRpZiAob0FnZ3JlZ2F0ZS5OYW1lID09PSBzTWVhc3VyZSkge1xuXHRcdFx0XHRvTWF0Y2hlZEFnZ3JlZ2F0ZSA9IG9BZ2dyZWdhdGU7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBvTWF0Y2hlZEFnZ3JlZ2F0ZTtcblx0fSxcblxuXHRnZXRIaWRkZW5NZWFzdXJlOiBmdW5jdGlvbiAoXG5cdFx0b01vZGVsOiBPRGF0YU1ldGFNb2RlbCxcblx0XHRzQ29udGV4dFBhdGg6IHN0cmluZyxcblx0XHRzTWVhc3VyZTogc3RyaW5nLFxuXHRcdGJDdXN0b21BZ2dyZWdhdGU6IGJvb2xlYW4sXG5cdFx0b0FnZ3JlZ2F0aW9uOiBhbnlcblx0KSB7XG5cdFx0bGV0IHNBZ2dyZWdhdGFibGVQcm9wZXJ0eVBhdGg7XG5cdFx0aWYgKCFiQ3VzdG9tQWdncmVnYXRlICYmIG9BZ2dyZWdhdGlvbikge1xuXHRcdFx0c0FnZ3JlZ2F0YWJsZVByb3BlcnR5UGF0aCA9IG9BZ2dyZWdhdGlvbi5BZ2dyZWdhdGFibGVQcm9wZXJ0eSAmJiBvQWdncmVnYXRpb24uQWdncmVnYXRhYmxlUHJvcGVydHkudmFsdWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNBZ2dyZWdhdGFibGVQcm9wZXJ0eVBhdGggPSBzTWVhc3VyZTtcblx0XHR9XG5cdFx0bGV0IHZIaWRkZW5NZWFzdXJlID0gb01vZGVsLmdldE9iamVjdChzQ29udGV4dFBhdGggKyBcIi9cIiArIHNBZ2dyZWdhdGFibGVQcm9wZXJ0eVBhdGggKyBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIik7XG5cdFx0aWYgKCF2SGlkZGVuTWVhc3VyZSAmJiBvQWdncmVnYXRpb24gJiYgb0FnZ3JlZ2F0aW9uLkFnZ3JlZ2F0YWJsZVByb3BlcnR5KSB7XG5cdFx0XHR2SGlkZGVuTWVhc3VyZSA9IG9Nb2RlbC5nZXRPYmplY3Qoc0NvbnRleHRQYXRoICsgXCIvXCIgKyBzQWdncmVnYXRhYmxlUHJvcGVydHlQYXRoICsgXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdkhpZGRlbk1lYXN1cmU7XG5cdH0sXG5cblx0Z2V0VW9NOiBmdW5jdGlvbiAob01vZGVsOiBPRGF0YU1ldGFNb2RlbCwgc0NvbnRleHRQYXRoOiBzdHJpbmcsIHNNZWFzdXJlOiBzdHJpbmcsIG9BZ2dyZWdhdGlvbjogYW55KSB7XG5cdFx0bGV0IHZJU09DdXJyZW5jeSA9IG9Nb2RlbC5nZXRPYmplY3Qoc0NvbnRleHRQYXRoICsgXCIvXCIgKyBzTWVhc3VyZSArIFwiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiKTtcblx0XHRsZXQgdlVuaXQgPSBvTW9kZWwuZ2V0T2JqZWN0KHNDb250ZXh0UGF0aCArIFwiL1wiICsgc01lYXN1cmUgKyBcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdFwiKTtcblx0XHRpZiAoIXZJU09DdXJyZW5jeSAmJiAhdlVuaXQgJiYgb0FnZ3JlZ2F0aW9uICYmIG9BZ2dyZWdhdGlvbi5BZ2dyZWdhdGFibGVQcm9wZXJ0eSkge1xuXHRcdFx0dklTT0N1cnJlbmN5ID0gb01vZGVsLmdldE9iamVjdChcblx0XHRcdFx0c0NvbnRleHRQYXRoICsgXCIvXCIgKyBvQWdncmVnYXRpb24uQWdncmVnYXRhYmxlUHJvcGVydHkudmFsdWUgKyBcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuSVNPQ3VycmVuY3lcIlxuXHRcdFx0KTtcblx0XHRcdHZVbml0ID0gb01vZGVsLmdldE9iamVjdChzQ29udGV4dFBhdGggKyBcIi9cIiArIG9BZ2dyZWdhdGlvbi5BZ2dyZWdhdGFibGVQcm9wZXJ0eS52YWx1ZSArIFwiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5Vbml0XCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gdklTT0N1cnJlbmN5IHx8IHZVbml0O1xuXHR9XG59KTtcbmV4cG9ydCBkZWZhdWx0IFZpc3VhbEZpbHRlcjtcbiJdLCJt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