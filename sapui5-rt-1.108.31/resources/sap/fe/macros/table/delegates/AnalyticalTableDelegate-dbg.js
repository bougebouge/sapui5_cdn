/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/DelegateUtil", "sap/fe/macros/table/delegates/TableDelegate"], function (DelegateUtil, TableDelegate) {
  "use strict";

  /**
   * Helper class for sap.ui.mdc.Table.
   * <h3><b>Note:</b></h3>
   * This class is experimental and not intended for productive usage, since the API/behavior has not been finalized.
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.69
   * @alias sap.fe.macros.TableDelegate
   */
  var AnalyticalTableDelegate = Object.assign({}, TableDelegate);

  /**
   * Fetches the property extensions.
   * TODO: document structure of the extension.
   *
   * @param oTable Instance of the sap.ui.mdc.Table
   * @returns Key-value map, where the key is the name of the property, and the value is the extension
   * @protected
   */
  AnalyticalTableDelegate.fetchPropertyExtensions = function (oTable) {
    var mCustomAggregates = this._getAggregatedPropertyMap(oTable);
    return Promise.resolve(mCustomAggregates || {});
  };
  AnalyticalTableDelegate.fetchPropertiesForBinding = function (oTable) {
    var _this = this;
    return DelegateUtil.fetchModel(oTable).then(function (oModel) {
      if (!oModel) {
        return [];
      }
      return _this._getCachedOrFetchPropertiesForEntity(oTable, DelegateUtil.getCustomData(oTable, "entityType"), oModel.getMetaModel(), undefined, true);
    });
  };
  return AnalyticalTableDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbmFseXRpY2FsVGFibGVEZWxlZ2F0ZSIsIk9iamVjdCIsImFzc2lnbiIsIlRhYmxlRGVsZWdhdGUiLCJmZXRjaFByb3BlcnR5RXh0ZW5zaW9ucyIsIm9UYWJsZSIsIm1DdXN0b21BZ2dyZWdhdGVzIiwiX2dldEFnZ3JlZ2F0ZWRQcm9wZXJ0eU1hcCIsIlByb21pc2UiLCJyZXNvbHZlIiwiZmV0Y2hQcm9wZXJ0aWVzRm9yQmluZGluZyIsIkRlbGVnYXRlVXRpbCIsImZldGNoTW9kZWwiLCJ0aGVuIiwib01vZGVsIiwiX2dldENhY2hlZE9yRmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5IiwiZ2V0Q3VzdG9tRGF0YSIsImdldE1ldGFNb2RlbCIsInVuZGVmaW5lZCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQW5hbHl0aWNhbFRhYmxlRGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBUYWJsZURlbGVnYXRlIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL2RlbGVnYXRlcy9UYWJsZURlbGVnYXRlXCI7XG5cbi8qKlxuICogSGVscGVyIGNsYXNzIGZvciBzYXAudWkubWRjLlRhYmxlLlxuICogPGgzPjxiPk5vdGU6PC9iPjwvaDM+XG4gKiBUaGlzIGNsYXNzIGlzIGV4cGVyaW1lbnRhbCBhbmQgbm90IGludGVuZGVkIGZvciBwcm9kdWN0aXZlIHVzYWdlLCBzaW5jZSB0aGUgQVBJL2JlaGF2aW9yIGhhcyBub3QgYmVlbiBmaW5hbGl6ZWQuXG4gKlxuICogQGF1dGhvciBTQVAgU0VcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKiBAc2luY2UgMS42OVxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuVGFibGVEZWxlZ2F0ZVxuICovXG5jb25zdCBBbmFseXRpY2FsVGFibGVEZWxlZ2F0ZSA9IE9iamVjdC5hc3NpZ24oe30sIFRhYmxlRGVsZWdhdGUpO1xuXG4vKipcbiAqIEZldGNoZXMgdGhlIHByb3BlcnR5IGV4dGVuc2lvbnMuXG4gKiBUT0RPOiBkb2N1bWVudCBzdHJ1Y3R1cmUgb2YgdGhlIGV4dGVuc2lvbi5cbiAqXG4gKiBAcGFyYW0gb1RhYmxlIEluc3RhbmNlIG9mIHRoZSBzYXAudWkubWRjLlRhYmxlXG4gKiBAcmV0dXJucyBLZXktdmFsdWUgbWFwLCB3aGVyZSB0aGUga2V5IGlzIHRoZSBuYW1lIG9mIHRoZSBwcm9wZXJ0eSwgYW5kIHRoZSB2YWx1ZSBpcyB0aGUgZXh0ZW5zaW9uXG4gKiBAcHJvdGVjdGVkXG4gKi9cbkFuYWx5dGljYWxUYWJsZURlbGVnYXRlLmZldGNoUHJvcGVydHlFeHRlbnNpb25zID0gZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdGNvbnN0IG1DdXN0b21BZ2dyZWdhdGVzOiBhbnkgPSB0aGlzLl9nZXRBZ2dyZWdhdGVkUHJvcGVydHlNYXAob1RhYmxlKTtcblxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG1DdXN0b21BZ2dyZWdhdGVzIHx8IHt9KTtcbn07XG5cbkFuYWx5dGljYWxUYWJsZURlbGVnYXRlLmZldGNoUHJvcGVydGllc0ZvckJpbmRpbmcgPSBmdW5jdGlvbiAodGhpczogdHlwZW9mIEFuYWx5dGljYWxUYWJsZURlbGVnYXRlLCBvVGFibGU6IGFueSkge1xuXHRyZXR1cm4gRGVsZWdhdGVVdGlsLmZldGNoTW9kZWwob1RhYmxlKS50aGVuKChvTW9kZWw6IGFueSkgPT4ge1xuXHRcdGlmICghb01vZGVsKSB7XG5cdFx0XHRyZXR1cm4gW107XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9nZXRDYWNoZWRPckZldGNoUHJvcGVydGllc0ZvckVudGl0eShcblx0XHRcdG9UYWJsZSxcblx0XHRcdERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJlbnRpdHlUeXBlXCIpLFxuXHRcdFx0b01vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0dHJ1ZVxuXHRcdCk7XG5cdH0pO1xufTtcblxuZXhwb3J0IGRlZmF1bHQgQW5hbHl0aWNhbFRhYmxlRGVsZWdhdGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsSUFBTUEsdUJBQXVCLEdBQUdDLE1BQU0sQ0FBQ0MsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFQyxhQUFhLENBQUM7O0VBRWhFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQUgsdUJBQXVCLENBQUNJLHVCQUF1QixHQUFHLFVBQVVDLE1BQVcsRUFBRTtJQUN4RSxJQUFNQyxpQkFBc0IsR0FBRyxJQUFJLENBQUNDLHlCQUF5QixDQUFDRixNQUFNLENBQUM7SUFFckUsT0FBT0csT0FBTyxDQUFDQyxPQUFPLENBQUNILGlCQUFpQixJQUFJLENBQUMsQ0FBQyxDQUFDO0VBQ2hELENBQUM7RUFFRE4sdUJBQXVCLENBQUNVLHlCQUF5QixHQUFHLFVBQWdETCxNQUFXLEVBQUU7SUFBQTtJQUNoSCxPQUFPTSxZQUFZLENBQUNDLFVBQVUsQ0FBQ1AsTUFBTSxDQUFDLENBQUNRLElBQUksQ0FBQyxVQUFDQyxNQUFXLEVBQUs7TUFDNUQsSUFBSSxDQUFDQSxNQUFNLEVBQUU7UUFDWixPQUFPLEVBQUU7TUFDVjtNQUNBLE9BQU8sS0FBSSxDQUFDQyxvQ0FBb0MsQ0FDL0NWLE1BQU0sRUFDTk0sWUFBWSxDQUFDSyxhQUFhLENBQUNYLE1BQU0sRUFBRSxZQUFZLENBQUMsRUFDaERTLE1BQU0sQ0FBQ0csWUFBWSxFQUFFLEVBQ3JCQyxTQUFTLEVBQ1QsSUFBSSxDQUNKO0lBQ0YsQ0FBQyxDQUFDO0VBQ0gsQ0FBQztFQUFDLE9BRWFsQix1QkFBdUI7QUFBQSJ9