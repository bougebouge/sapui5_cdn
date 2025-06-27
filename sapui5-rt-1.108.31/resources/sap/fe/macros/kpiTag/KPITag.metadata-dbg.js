/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/formatters/KPIFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/MacroMetadata"], function (kpiFormatters, BindingToolkit, MacroMetadata) {
  "use strict";

  var pathInModel = BindingToolkit.pathInModel;
  var formatResult = BindingToolkit.formatResult;
  var compileExpression = BindingToolkit.compileExpression;
  /**
   * @classdesc A building block used to display a KPI in the Analytical List Page
   * @hideconstructor
   * @class sap.fe.macros.KPITag
   * @private
   * @experimental
   */
  var KPITag = MacroMetadata.extend("sap.fe.macros.kpiTag.KPITag", {
    /**
     * Name
     */
    name: "KPITag",
    /**
     * Namespace
     */
    namespace: "sap.fe.macros",
    /**
     * Fragment source
     */
    fragment: "sap.fe.macros.kpiTag.KPITag",
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
         * The ID of the KPI
         */
        id: {
          type: "string",
          required: true
        },
        /**
         * Shall be true if the KPI value has an associated currency or unit of measure
         */
        hasUnit: {
          type: "boolean",
          required: false
        },
        /**
         * Path to the DataPoint annotation of the KPI
         */
        metaPath: {
          type: "sap.ui.model.Context",
          required: true
        }
      },
      aggregations: {}
    },
    create: function (oProps) {
      // KPI tag label and tooltip
      var kpiTitle = oProps.metaPath.getProperty("Title");
      if (kpiTitle) {
        var bindingParts = kpiTitle.match(/{(.*)>(.*)}/); // Check if the title is a binding expr '{model>prop}'
        var titleExpression;
        if (bindingParts) {
          // KPI title is a binding expression (localized)
          titleExpression = pathInModel(bindingParts[2], bindingParts[1]);
        } else {
          // KPI Title is a constant
          titleExpression = kpiTitle;
        }
        var labelExpression = formatResult([titleExpression], kpiFormatters.labelFormat);
        oProps.label = compileExpression(labelExpression);
        var tooltipExpression = formatResult([titleExpression, pathInModel("/".concat(oProps.id, "/manifest/sap.card/data/json/mainValueUnscaled"), "kpiModel"), pathInModel("/".concat(oProps.id, "/manifest/sap.card/data/json/mainUnit"), "kpiModel"), pathInModel("/".concat(oProps.id, "/manifest/sap.card/data/json/mainCriticality"), "kpiModel"), oProps.hasUnit], kpiFormatters.tooltipFormat);
        oProps.tooltip = compileExpression(tooltipExpression);
      }
      return oProps;
    }
  });
  return KPITag;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLUElUYWciLCJNYWNyb01ldGFkYXRhIiwiZXh0ZW5kIiwibmFtZSIsIm5hbWVzcGFjZSIsImZyYWdtZW50IiwibWV0YWRhdGEiLCJzdGVyZW90eXBlIiwicHJvcGVydGllcyIsImlkIiwidHlwZSIsInJlcXVpcmVkIiwiaGFzVW5pdCIsIm1ldGFQYXRoIiwiYWdncmVnYXRpb25zIiwiY3JlYXRlIiwib1Byb3BzIiwia3BpVGl0bGUiLCJnZXRQcm9wZXJ0eSIsImJpbmRpbmdQYXJ0cyIsIm1hdGNoIiwidGl0bGVFeHByZXNzaW9uIiwicGF0aEluTW9kZWwiLCJsYWJlbEV4cHJlc3Npb24iLCJmb3JtYXRSZXN1bHQiLCJrcGlGb3JtYXR0ZXJzIiwibGFiZWxGb3JtYXQiLCJsYWJlbCIsImNvbXBpbGVFeHByZXNzaW9uIiwidG9vbHRpcEV4cHJlc3Npb24iLCJ0b29sdGlwRm9ybWF0IiwidG9vbHRpcCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiS1BJVGFnLm1ldGFkYXRhLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBrcGlGb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL0tQSUZvcm1hdHRlclwiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGZvcm1hdFJlc3VsdCwgcGF0aEluTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1hY3JvTWV0YWRhdGEgZnJvbSBcInNhcC9mZS9tYWNyb3MvTWFjcm9NZXRhZGF0YVwiO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2MgQSBidWlsZGluZyBibG9jayB1c2VkIHRvIGRpc3BsYXkgYSBLUEkgaW4gdGhlIEFuYWx5dGljYWwgTGlzdCBQYWdlXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAY2xhc3Mgc2FwLmZlLm1hY3Jvcy5LUElUYWdcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmNvbnN0IEtQSVRhZyA9IE1hY3JvTWV0YWRhdGEuZXh0ZW5kKFwic2FwLmZlLm1hY3Jvcy5rcGlUYWcuS1BJVGFnXCIsIHtcblx0LyoqXG5cdCAqIE5hbWVcblx0ICovXG5cdG5hbWU6IFwiS1BJVGFnXCIsXG5cdC8qKlxuXHQgKiBOYW1lc3BhY2Vcblx0ICovXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsXG5cdC8qKlxuXHQgKiBGcmFnbWVudCBzb3VyY2Vcblx0ICovXG5cdGZyYWdtZW50OiBcInNhcC5mZS5tYWNyb3Mua3BpVGFnLktQSVRhZ1wiLFxuXHQvKipcblx0ICogTWV0YWRhdGFcblx0ICovXG5cdG1ldGFkYXRhOiB7XG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lIG1hY3JvIHN0ZXJlb3R5cGUgZm9yIGRvY3VtZW50YXRpb25cblx0XHQgKi9cblx0XHRzdGVyZW90eXBlOiBcInhtbG1hY3JvXCIsXG5cdFx0LyoqXG5cdFx0ICogUHJvcGVydGllcy5cblx0XHQgKi9cblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSBJRCBvZiB0aGUgS1BJXG5cdFx0XHQgKi9cblx0XHRcdGlkOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdHJlcXVpcmVkOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTaGFsbCBiZSB0cnVlIGlmIHRoZSBLUEkgdmFsdWUgaGFzIGFuIGFzc29jaWF0ZWQgY3VycmVuY3kgb3IgdW5pdCBvZiBtZWFzdXJlXG5cdFx0XHQgKi9cblx0XHRcdGhhc1VuaXQ6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdHJlcXVpcmVkOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogUGF0aCB0byB0aGUgRGF0YVBvaW50IGFubm90YXRpb24gb2YgdGhlIEtQSVxuXHRcdFx0ICovXG5cdFx0XHRtZXRhUGF0aDoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdHJlcXVpcmVkOiB0cnVlXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRhZ2dyZWdhdGlvbnM6IHt9XG5cdH0sXG5cdGNyZWF0ZTogZnVuY3Rpb24gKG9Qcm9wczogYW55KSB7XG5cdFx0Ly8gS1BJIHRhZyBsYWJlbCBhbmQgdG9vbHRpcFxuXHRcdGNvbnN0IGtwaVRpdGxlID0gb1Byb3BzLm1ldGFQYXRoLmdldFByb3BlcnR5KFwiVGl0bGVcIik7XG5cdFx0aWYgKGtwaVRpdGxlKSB7XG5cdFx0XHRjb25zdCBiaW5kaW5nUGFydHMgPSBrcGlUaXRsZS5tYXRjaCgveyguKik+KC4qKX0vKTsgLy8gQ2hlY2sgaWYgdGhlIHRpdGxlIGlzIGEgYmluZGluZyBleHByICd7bW9kZWw+cHJvcH0nXG5cdFx0XHRsZXQgdGl0bGVFeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPjtcblx0XHRcdGlmIChiaW5kaW5nUGFydHMpIHtcblx0XHRcdFx0Ly8gS1BJIHRpdGxlIGlzIGEgYmluZGluZyBleHByZXNzaW9uIChsb2NhbGl6ZWQpXG5cdFx0XHRcdHRpdGxlRXhwcmVzc2lvbiA9IHBhdGhJbk1vZGVsKGJpbmRpbmdQYXJ0c1syXSwgYmluZGluZ1BhcnRzWzFdKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIEtQSSBUaXRsZSBpcyBhIGNvbnN0YW50XG5cdFx0XHRcdHRpdGxlRXhwcmVzc2lvbiA9IGtwaVRpdGxlO1xuXHRcdFx0fVxuXG5cdFx0XHRjb25zdCBsYWJlbEV4cHJlc3Npb24gPSBmb3JtYXRSZXN1bHQoW3RpdGxlRXhwcmVzc2lvbl0sIGtwaUZvcm1hdHRlcnMubGFiZWxGb3JtYXQpO1xuXHRcdFx0b1Byb3BzLmxhYmVsID0gY29tcGlsZUV4cHJlc3Npb24obGFiZWxFeHByZXNzaW9uKTtcblxuXHRcdFx0Y29uc3QgdG9vbHRpcEV4cHJlc3Npb24gPSBmb3JtYXRSZXN1bHQoXG5cdFx0XHRcdFtcblx0XHRcdFx0XHR0aXRsZUV4cHJlc3Npb24sXG5cdFx0XHRcdFx0cGF0aEluTW9kZWwoYC8ke29Qcm9wcy5pZH0vbWFuaWZlc3Qvc2FwLmNhcmQvZGF0YS9qc29uL21haW5WYWx1ZVVuc2NhbGVkYCwgXCJrcGlNb2RlbFwiKSxcblx0XHRcdFx0XHRwYXRoSW5Nb2RlbChgLyR7b1Byb3BzLmlkfS9tYW5pZmVzdC9zYXAuY2FyZC9kYXRhL2pzb24vbWFpblVuaXRgLCBcImtwaU1vZGVsXCIpLFxuXHRcdFx0XHRcdHBhdGhJbk1vZGVsKGAvJHtvUHJvcHMuaWR9L21hbmlmZXN0L3NhcC5jYXJkL2RhdGEvanNvbi9tYWluQ3JpdGljYWxpdHlgLCBcImtwaU1vZGVsXCIpLFxuXHRcdFx0XHRcdG9Qcm9wcy5oYXNVbml0XG5cdFx0XHRcdF0sXG5cdFx0XHRcdGtwaUZvcm1hdHRlcnMudG9vbHRpcEZvcm1hdFxuXHRcdFx0KTtcblx0XHRcdG9Qcm9wcy50b29sdGlwID0gY29tcGlsZUV4cHJlc3Npb24odG9vbHRpcEV4cHJlc3Npb24pO1xuXHRcdH1cblxuXHRcdHJldHVybiBvUHJvcHM7XG5cdH1cbn0pO1xuZXhwb3J0IGRlZmF1bHQgS1BJVGFnO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O0VBS0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxJQUFNQSxNQUFNLEdBQUdDLGFBQWEsQ0FBQ0MsTUFBTSxDQUFDLDZCQUE2QixFQUFFO0lBQ2xFO0FBQ0Q7QUFDQTtJQUNDQyxJQUFJLEVBQUUsUUFBUTtJQUNkO0FBQ0Q7QUFDQTtJQUNDQyxTQUFTLEVBQUUsZUFBZTtJQUMxQjtBQUNEO0FBQ0E7SUFDQ0MsUUFBUSxFQUFFLDZCQUE2QjtJQUN2QztBQUNEO0FBQ0E7SUFDQ0MsUUFBUSxFQUFFO01BQ1Q7QUFDRjtBQUNBO01BQ0VDLFVBQVUsRUFBRSxVQUFVO01BQ3RCO0FBQ0Y7QUFDQTtNQUNFQyxVQUFVLEVBQUU7UUFDWDtBQUNIO0FBQ0E7UUFDR0MsRUFBRSxFQUFFO1VBQ0hDLElBQUksRUFBRSxRQUFRO1VBQ2RDLFFBQVEsRUFBRTtRQUNYLENBQUM7UUFDRDtBQUNIO0FBQ0E7UUFDR0MsT0FBTyxFQUFFO1VBQ1JGLElBQUksRUFBRSxTQUFTO1VBQ2ZDLFFBQVEsRUFBRTtRQUNYLENBQUM7UUFDRDtBQUNIO0FBQ0E7UUFDR0UsUUFBUSxFQUFFO1VBQ1RILElBQUksRUFBRSxzQkFBc0I7VUFDNUJDLFFBQVEsRUFBRTtRQUNYO01BQ0QsQ0FBQztNQUNERyxZQUFZLEVBQUUsQ0FBQztJQUNoQixDQUFDO0lBQ0RDLE1BQU0sRUFBRSxVQUFVQyxNQUFXLEVBQUU7TUFDOUI7TUFDQSxJQUFNQyxRQUFRLEdBQUdELE1BQU0sQ0FBQ0gsUUFBUSxDQUFDSyxXQUFXLENBQUMsT0FBTyxDQUFDO01BQ3JELElBQUlELFFBQVEsRUFBRTtRQUNiLElBQU1FLFlBQVksR0FBR0YsUUFBUSxDQUFDRyxLQUFLLENBQUMsYUFBYSxDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFJQyxlQUFpRDtRQUNyRCxJQUFJRixZQUFZLEVBQUU7VUFDakI7VUFDQUUsZUFBZSxHQUFHQyxXQUFXLENBQUNILFlBQVksQ0FBQyxDQUFDLENBQUMsRUFBRUEsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2hFLENBQUMsTUFBTTtVQUNOO1VBQ0FFLGVBQWUsR0FBR0osUUFBUTtRQUMzQjtRQUVBLElBQU1NLGVBQWUsR0FBR0MsWUFBWSxDQUFDLENBQUNILGVBQWUsQ0FBQyxFQUFFSSxhQUFhLENBQUNDLFdBQVcsQ0FBQztRQUNsRlYsTUFBTSxDQUFDVyxLQUFLLEdBQUdDLGlCQUFpQixDQUFDTCxlQUFlLENBQUM7UUFFakQsSUFBTU0saUJBQWlCLEdBQUdMLFlBQVksQ0FDckMsQ0FDQ0gsZUFBZSxFQUNmQyxXQUFXLFlBQUtOLE1BQU0sQ0FBQ1AsRUFBRSxxREFBa0QsVUFBVSxDQUFDLEVBQ3RGYSxXQUFXLFlBQUtOLE1BQU0sQ0FBQ1AsRUFBRSw0Q0FBeUMsVUFBVSxDQUFDLEVBQzdFYSxXQUFXLFlBQUtOLE1BQU0sQ0FBQ1AsRUFBRSxtREFBZ0QsVUFBVSxDQUFDLEVBQ3BGTyxNQUFNLENBQUNKLE9BQU8sQ0FDZCxFQUNEYSxhQUFhLENBQUNLLGFBQWEsQ0FDM0I7UUFDRGQsTUFBTSxDQUFDZSxPQUFPLEdBQUdILGlCQUFpQixDQUFDQyxpQkFBaUIsQ0FBQztNQUN0RDtNQUVBLE9BQU9iLE1BQU07SUFDZDtFQUNELENBQUMsQ0FBQztFQUFDLE9BQ1loQixNQUFNO0FBQUEifQ==