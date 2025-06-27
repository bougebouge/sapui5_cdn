/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["../../helpers/StableIdHelper"], function (StableIdHelper) {
  "use strict";

  var _exports = {};
  var getStableIdPartFromDataField = StableIdHelper.getStableIdPartFromDataField;
  /**
   * The KeyHelper is used for dealing with Key in the concern of the flexible programming model
   */
  var KeyHelper = /*#__PURE__*/function () {
    function KeyHelper() {}
    _exports.KeyHelper = KeyHelper;
    /**
     * Returns a generated key for DataFields to be used in the flexible programming model.
     *
     * @param oDataField DataField to generate the key for
     * @returns Returns a through StableIdHelper generated key
     */
    KeyHelper.generateKeyFromDataField = function generateKeyFromDataField(oDataField) {
      return getStableIdPartFromDataField(oDataField);
    }

    /**
     * Throws a Error if any other character then aA-zZ, 0-9, ':', '_' or '-' is used.
     *
     * @param key String to check validity on
     */;
    KeyHelper.validateKey = function validateKey(key) {
      var pattern = /[^A-Za-z0-9_\-:]/;
      if (pattern.exec(key)) {
        throw new Error("Invalid key: ".concat(key, " - only 'A-Za-z0-9_-:' are allowed"));
      }
    }

    /**
     * Returns the key for a selection field required for adaption.
     *
     * @param fullPropertyPath The full property path (without entityType)
     * @returns The key of the selection field
     */;
    KeyHelper.getSelectionFieldKeyFromPath = function getSelectionFieldKeyFromPath(fullPropertyPath) {
      return fullPropertyPath.replace(/(\*|\+)?\//g, "::");
    }

    /**
     * Returns the path for a selection field required for adaption.
     *
     * @param selectionFieldKey The key of the selection field
     * @returns The full property path
     */;
    KeyHelper.getPathFromSelectionFieldKey = function getPathFromSelectionFieldKey(selectionFieldKey) {
      return selectionFieldKey.replace(/::/g, "/");
    };
    return KeyHelper;
  }();
  _exports.KeyHelper = KeyHelper;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJLZXlIZWxwZXIiLCJnZW5lcmF0ZUtleUZyb21EYXRhRmllbGQiLCJvRGF0YUZpZWxkIiwiZ2V0U3RhYmxlSWRQYXJ0RnJvbURhdGFGaWVsZCIsInZhbGlkYXRlS2V5Iiwia2V5IiwicGF0dGVybiIsImV4ZWMiLCJFcnJvciIsImdldFNlbGVjdGlvbkZpZWxkS2V5RnJvbVBhdGgiLCJmdWxsUHJvcGVydHlQYXRoIiwicmVwbGFjZSIsImdldFBhdGhGcm9tU2VsZWN0aW9uRmllbGRLZXkiLCJzZWxlY3Rpb25GaWVsZEtleSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiS2V5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IGdldFN0YWJsZUlkUGFydEZyb21EYXRhRmllbGQgfSBmcm9tIFwiLi4vLi4vaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuXG4vKipcbiAqIFRoZSBLZXlIZWxwZXIgaXMgdXNlZCBmb3IgZGVhbGluZyB3aXRoIEtleSBpbiB0aGUgY29uY2VybiBvZiB0aGUgZmxleGlibGUgcHJvZ3JhbW1pbmcgbW9kZWxcbiAqL1xuZXhwb3J0IGNsYXNzIEtleUhlbHBlciB7XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgZ2VuZXJhdGVkIGtleSBmb3IgRGF0YUZpZWxkcyB0byBiZSB1c2VkIGluIHRoZSBmbGV4aWJsZSBwcm9ncmFtbWluZyBtb2RlbC5cblx0ICpcblx0ICogQHBhcmFtIG9EYXRhRmllbGQgRGF0YUZpZWxkIHRvIGdlbmVyYXRlIHRoZSBrZXkgZm9yXG5cdCAqIEByZXR1cm5zIFJldHVybnMgYSB0aHJvdWdoIFN0YWJsZUlkSGVscGVyIGdlbmVyYXRlZCBrZXlcblx0ICovXG5cdHN0YXRpYyBnZW5lcmF0ZUtleUZyb21EYXRhRmllbGQob0RhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGdldFN0YWJsZUlkUGFydEZyb21EYXRhRmllbGQob0RhdGFGaWVsZCkhO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRocm93cyBhIEVycm9yIGlmIGFueSBvdGhlciBjaGFyYWN0ZXIgdGhlbiBhQS16WiwgMC05LCAnOicsICdfJyBvciAnLScgaXMgdXNlZC5cblx0ICpcblx0ICogQHBhcmFtIGtleSBTdHJpbmcgdG8gY2hlY2sgdmFsaWRpdHkgb25cblx0ICovXG5cdHN0YXRpYyB2YWxpZGF0ZUtleShrZXk6IHN0cmluZykge1xuXHRcdGNvbnN0IHBhdHRlcm4gPSAvW15BLVphLXowLTlfXFwtOl0vO1xuXHRcdGlmIChwYXR0ZXJuLmV4ZWMoa2V5KSkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIGtleTogJHtrZXl9IC0gb25seSAnQS1aYS16MC05Xy06JyBhcmUgYWxsb3dlZGApO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBrZXkgZm9yIGEgc2VsZWN0aW9uIGZpZWxkIHJlcXVpcmVkIGZvciBhZGFwdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIGZ1bGxQcm9wZXJ0eVBhdGggVGhlIGZ1bGwgcHJvcGVydHkgcGF0aCAod2l0aG91dCBlbnRpdHlUeXBlKVxuXHQgKiBAcmV0dXJucyBUaGUga2V5IG9mIHRoZSBzZWxlY3Rpb24gZmllbGRcblx0ICovXG5cdHN0YXRpYyBnZXRTZWxlY3Rpb25GaWVsZEtleUZyb21QYXRoKGZ1bGxQcm9wZXJ0eVBhdGg6IHN0cmluZykge1xuXHRcdHJldHVybiBmdWxsUHJvcGVydHlQYXRoLnJlcGxhY2UoLyhcXCp8XFwrKT9cXC8vZywgXCI6OlwiKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwYXRoIGZvciBhIHNlbGVjdGlvbiBmaWVsZCByZXF1aXJlZCBmb3IgYWRhcHRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBzZWxlY3Rpb25GaWVsZEtleSBUaGUga2V5IG9mIHRoZSBzZWxlY3Rpb24gZmllbGRcblx0ICogQHJldHVybnMgVGhlIGZ1bGwgcHJvcGVydHkgcGF0aFxuXHQgKi9cblx0c3RhdGljIGdldFBhdGhGcm9tU2VsZWN0aW9uRmllbGRLZXkoc2VsZWN0aW9uRmllbGRLZXk6IHN0cmluZykge1xuXHRcdHJldHVybiBzZWxlY3Rpb25GaWVsZEtleS5yZXBsYWNlKC86Oi9nLCBcIi9cIik7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7O0VBR0E7QUFDQTtBQUNBO0VBRkEsSUFHYUEsU0FBUztJQUFBO0lBQUE7SUFDckI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBTEMsVUFNT0Msd0JBQXdCLEdBQS9CLGtDQUFnQ0MsVUFBa0MsRUFBVTtNQUMzRSxPQUFPQyw0QkFBNEIsQ0FBQ0QsVUFBVSxDQUFDO0lBQ2hEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0EsT0FKQztJQUFBLFVBS09FLFdBQVcsR0FBbEIscUJBQW1CQyxHQUFXLEVBQUU7TUFDL0IsSUFBTUMsT0FBTyxHQUFHLGtCQUFrQjtNQUNsQyxJQUFJQSxPQUFPLENBQUNDLElBQUksQ0FBQ0YsR0FBRyxDQUFDLEVBQUU7UUFDdEIsTUFBTSxJQUFJRyxLQUFLLHdCQUFpQkgsR0FBRyx3Q0FBcUM7TUFDekU7SUFDRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLFVBTU9JLDRCQUE0QixHQUFuQyxzQ0FBb0NDLGdCQUF3QixFQUFFO01BQzdELE9BQU9BLGdCQUFnQixDQUFDQyxPQUFPLENBQUMsYUFBYSxFQUFFLElBQUksQ0FBQztJQUNyRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLFVBTU9DLDRCQUE0QixHQUFuQyxzQ0FBb0NDLGlCQUF5QixFQUFFO01BQzlELE9BQU9BLGlCQUFpQixDQUFDRixPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztJQUM3QyxDQUFDO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9