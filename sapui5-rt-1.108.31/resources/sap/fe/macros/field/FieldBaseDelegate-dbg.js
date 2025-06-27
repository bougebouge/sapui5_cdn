/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/ui/mdc/field/FieldBaseDelegate", "sap/ui/mdc/odata/v4/FieldBaseDelegate", "sap/ui/model/Filter"], function (Log, CommonUtils, MDCFieldBaseDelegate, FieldBaseDelegate, Filter) {
  "use strict";

  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  /**
   * Determine all parameters in a value help that use a specific property.
   *
   * @param oValueList Value help that is used
   * @param sPropertyName Name of the property
   * @returns List of all found parameters
   */
  function _getValueListParameter(oValueList, sPropertyName) {
    //determine path to value list property
    return oValueList.Parameters.filter(function (entry) {
      if (entry.LocalDataProperty) {
        return entry.LocalDataProperty.$PropertyPath === sPropertyName;
      } else {
        return false;
      }
    });
  }
  /**
   * Build filters for each in-parameter.
   *
   * @param oValueList Value help that is used
   * @param sPropertyName Name of the property
   * @param sValueHelpProperty Name of the value help property
   * @param vKey Value of the property
   * @param vhPayload Payload of the value help
   * @returns List of filters
   */
  function _getFilter(oValueList, sPropertyName, sValueHelpProperty, vKey, vhPayload) {
    var aFilters = [];
    var parameters = oValueList.Parameters.filter(function (parameter) {
      var _parameter$LocalDataP;
      return parameter.$Type.indexOf("In") > 48 || ((_parameter$LocalDataP = parameter.LocalDataProperty) === null || _parameter$LocalDataP === void 0 ? void 0 : _parameter$LocalDataP.$PropertyPath) === sPropertyName && parameter.ValueListProperty === sValueHelpProperty;
    });
    var _iterator = _createForOfIteratorHelper(parameters),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var parameter = _step.value;
        if (parameter.LocalDataProperty.$PropertyPath === sPropertyName) {
          aFilters.push(new Filter({
            path: sValueHelpProperty,
            operator: "EQ",
            value1: vKey
          }));
        } else if (parameter.$Type.indexOf("In") > 48 && vhPayload !== null && vhPayload !== void 0 && vhPayload.isActionParameterDialog) {
          var apdFieldPath = "APD_::".concat(parameter.LocalDataProperty.$PropertyPath);
          var apdField = sap.ui.getCore().byId(apdFieldPath);
          var apdFieldValue = apdField === null || apdField === void 0 ? void 0 : apdField.getValue();
          if (apdFieldValue != null) {
            aFilters.push(new Filter({
              path: parameter.ValueListProperty,
              operator: "EQ",
              value1: apdFieldValue
            }));
          }
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return aFilters;
  }
  return Object.assign({}, FieldBaseDelegate, {
    getItemForValue: function (oPayload, oFieldHelp, oConfig) {
      //BCP: 2270162887 . The MDC field should not try to get the item when the field is emptied
      if (oConfig.value !== "") {
        return MDCFieldBaseDelegate.getItemForValue(oPayload, oFieldHelp, oConfig);
      }
    },
    getDescription: function (oPayload, oFieldHelp, vKey) {
      //JIRA: FIORITECHP1-22022 . The MDC field should not  tries to determine description with the initial GET of the data.
      // it should rely on the data we already received from the backend
      // But The getDescription function is also called in the FilterField case if a variant is loaded.
      // As the description text could be language dependent it is not stored in the variant, so it needs to be read on rendering.

      if (oPayload !== null && oPayload !== void 0 && oPayload.retrieveTextFromValueList || oPayload !== null && oPayload !== void 0 && oPayload.isFilterField) {
        var oODataModel = oFieldHelp.getModel();
        var oMetaModel = oODataModel ? oODataModel.getMetaModel() : CommonUtils.getAppComponent(oFieldHelp).getModel().getMetaModel();
        var vhPayload = oFieldHelp === null || oFieldHelp === void 0 ? void 0 : oFieldHelp.getPayload();
        var sPropertyPath = vhPayload === null || vhPayload === void 0 ? void 0 : vhPayload.propertyPath;
        var sTextProperty;
        return oMetaModel.requestValueListInfo(sPropertyPath, true, oFieldHelp.getBindingContext()).then(function (mValueListInfo) {
          var sPropertyName = oMetaModel.getObject("".concat(sPropertyPath, "@sapui.name"));
          // take the first value list annotation - alternatively take the one without qualifier or the first one
          var oValueList = mValueListInfo[Object.keys(mValueListInfo)[0]];
          var sValueHelpProperty;
          var aValueHelpParameters = _getValueListParameter(oValueList, sPropertyName);
          if (aValueHelpParameters && aValueHelpParameters[0]) {
            sValueHelpProperty = aValueHelpParameters[0].ValueListProperty;
          } else {
            return Promise.reject("Inconsistent value help annotation for ".concat(sPropertyName));
          }
          // get text annotation for this value list property
          var oModel = oValueList.$model;
          var oTextAnnotation = oModel.getMetaModel().getObject("/".concat(oValueList.CollectionPath, "/").concat(sValueHelpProperty, "@com.sap.vocabularies.Common.v1.Text"));
          if (oTextAnnotation && oTextAnnotation.$Path) {
            sTextProperty = oTextAnnotation.$Path;
            /* Build the filter for each in-parameter */
            var aFilters = _getFilter(oValueList, sPropertyName, sValueHelpProperty, vKey, vhPayload);
            var oListBinding = oModel.bindList("/".concat(oValueList.CollectionPath), undefined, undefined, aFilters, {
              "$select": sTextProperty
            });
            return oListBinding.requestContexts(0, 2);
          } else {
            return Promise.reject("Text Annotation for ".concat(sValueHelpProperty, "is not defined"));
          }
        }).then(function (aContexts) {
          var _aContexts$;
          // return aContexts && aContexts[0] ? aContexts[0].getObject()[sTextProperty] : "";
          return aContexts === null || aContexts === void 0 ? void 0 : (_aContexts$ = aContexts[0]) === null || _aContexts$ === void 0 ? void 0 : _aContexts$.getObject(sTextProperty);
        }).catch(function (e) {
          var sMsg = e.status && e.status === 404 ? "Metadata not found (".concat(e.status, ") for value help of property ").concat(sPropertyPath) : e.message;
          Log.error(sMsg);
        });
      }
    }
  });
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZ2V0VmFsdWVMaXN0UGFyYW1ldGVyIiwib1ZhbHVlTGlzdCIsInNQcm9wZXJ0eU5hbWUiLCJQYXJhbWV0ZXJzIiwiZmlsdGVyIiwiZW50cnkiLCJMb2NhbERhdGFQcm9wZXJ0eSIsIiRQcm9wZXJ0eVBhdGgiLCJfZ2V0RmlsdGVyIiwic1ZhbHVlSGVscFByb3BlcnR5IiwidktleSIsInZoUGF5bG9hZCIsImFGaWx0ZXJzIiwicGFyYW1ldGVycyIsInBhcmFtZXRlciIsIiRUeXBlIiwiaW5kZXhPZiIsIlZhbHVlTGlzdFByb3BlcnR5IiwicHVzaCIsIkZpbHRlciIsInBhdGgiLCJvcGVyYXRvciIsInZhbHVlMSIsImlzQWN0aW9uUGFyYW1ldGVyRGlhbG9nIiwiYXBkRmllbGRQYXRoIiwiYXBkRmllbGQiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJieUlkIiwiYXBkRmllbGRWYWx1ZSIsImdldFZhbHVlIiwiT2JqZWN0IiwiYXNzaWduIiwiRmllbGRCYXNlRGVsZWdhdGUiLCJnZXRJdGVtRm9yVmFsdWUiLCJvUGF5bG9hZCIsIm9GaWVsZEhlbHAiLCJvQ29uZmlnIiwidmFsdWUiLCJNRENGaWVsZEJhc2VEZWxlZ2F0ZSIsImdldERlc2NyaXB0aW9uIiwicmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCIsImlzRmlsdGVyRmllbGQiLCJvT0RhdGFNb2RlbCIsImdldE1vZGVsIiwib01ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsIkNvbW1vblV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0UGF5bG9hZCIsInNQcm9wZXJ0eVBhdGgiLCJwcm9wZXJ0eVBhdGgiLCJzVGV4dFByb3BlcnR5IiwicmVxdWVzdFZhbHVlTGlzdEluZm8iLCJnZXRCaW5kaW5nQ29udGV4dCIsInRoZW4iLCJtVmFsdWVMaXN0SW5mbyIsImdldE9iamVjdCIsImtleXMiLCJhVmFsdWVIZWxwUGFyYW1ldGVycyIsIlByb21pc2UiLCJyZWplY3QiLCJvTW9kZWwiLCIkbW9kZWwiLCJvVGV4dEFubm90YXRpb24iLCJDb2xsZWN0aW9uUGF0aCIsIiRQYXRoIiwib0xpc3RCaW5kaW5nIiwiYmluZExpc3QiLCJ1bmRlZmluZWQiLCJyZXF1ZXN0Q29udGV4dHMiLCJhQ29udGV4dHMiLCJjYXRjaCIsImUiLCJzTXNnIiwic3RhdHVzIiwibWVzc2FnZSIsIkxvZyIsImVycm9yIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWVsZEJhc2VEZWxlZ2F0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB0eXBlIHsgQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlciwgVmFsdWVIZWxwUGF5bG9hZCB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL3ZhbHVlaGVscC9WYWx1ZUxpc3RIZWxwZXJOZXdcIjtcbmltcG9ydCBGaWVsZCBmcm9tIFwic2FwL3VpL21kYy9GaWVsZFwiO1xuaW1wb3J0IE1EQ0ZpZWxkQmFzZURlbGVnYXRlIGZyb20gXCJzYXAvdWkvbWRjL2ZpZWxkL0ZpZWxkQmFzZURlbGVnYXRlXCI7XG5pbXBvcnQgRmllbGRIZWxwQmFzZSBmcm9tIFwic2FwL3VpL21kYy9maWVsZC9GaWVsZEhlbHBCYXNlXCI7XG5pbXBvcnQgRmllbGRCYXNlRGVsZWdhdGUgZnJvbSBcInNhcC91aS9tZGMvb2RhdGEvdjQvRmllbGRCYXNlRGVsZWdhdGVcIjtcbmltcG9ydCBGaWx0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5cbnR5cGUgVmFsdWVMaXN0ID0ge1xuXHRDb2xsZWN0aW9uUGF0aDogc3RyaW5nO1xuXHRQYXJhbWV0ZXJzOiBbQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlcl07XG5cdCRtb2RlbDogT0RhdGFNb2RlbDtcbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lIGFsbCBwYXJhbWV0ZXJzIGluIGEgdmFsdWUgaGVscCB0aGF0IHVzZSBhIHNwZWNpZmljIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBvVmFsdWVMaXN0IFZhbHVlIGhlbHAgdGhhdCBpcyB1c2VkXG4gKiBAcGFyYW0gc1Byb3BlcnR5TmFtZSBOYW1lIG9mIHRoZSBwcm9wZXJ0eVxuICogQHJldHVybnMgTGlzdCBvZiBhbGwgZm91bmQgcGFyYW1ldGVyc1xuICovXG5mdW5jdGlvbiBfZ2V0VmFsdWVMaXN0UGFyYW1ldGVyKG9WYWx1ZUxpc3Q6IFZhbHVlTGlzdCwgc1Byb3BlcnR5TmFtZTogb2JqZWN0KSB7XG5cdC8vZGV0ZXJtaW5lIHBhdGggdG8gdmFsdWUgbGlzdCBwcm9wZXJ0eVxuXHRyZXR1cm4gb1ZhbHVlTGlzdC5QYXJhbWV0ZXJzLmZpbHRlcihmdW5jdGlvbiAoZW50cnk6IGFueSkge1xuXHRcdGlmIChlbnRyeS5Mb2NhbERhdGFQcm9wZXJ0eSkge1xuXHRcdFx0cmV0dXJuIGVudHJ5LkxvY2FsRGF0YVByb3BlcnR5LiRQcm9wZXJ0eVBhdGggPT09IHNQcm9wZXJ0eU5hbWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0pO1xufVxuLyoqXG4gKiBCdWlsZCBmaWx0ZXJzIGZvciBlYWNoIGluLXBhcmFtZXRlci5cbiAqXG4gKiBAcGFyYW0gb1ZhbHVlTGlzdCBWYWx1ZSBoZWxwIHRoYXQgaXMgdXNlZFxuICogQHBhcmFtIHNQcm9wZXJ0eU5hbWUgTmFtZSBvZiB0aGUgcHJvcGVydHlcbiAqIEBwYXJhbSBzVmFsdWVIZWxwUHJvcGVydHkgTmFtZSBvZiB0aGUgdmFsdWUgaGVscCBwcm9wZXJ0eVxuICogQHBhcmFtIHZLZXkgVmFsdWUgb2YgdGhlIHByb3BlcnR5XG4gKiBAcGFyYW0gdmhQYXlsb2FkIFBheWxvYWQgb2YgdGhlIHZhbHVlIGhlbHBcbiAqIEByZXR1cm5zIExpc3Qgb2YgZmlsdGVyc1xuICovXG5mdW5jdGlvbiBfZ2V0RmlsdGVyKG9WYWx1ZUxpc3Q6IFZhbHVlTGlzdCwgc1Byb3BlcnR5TmFtZTogc3RyaW5nLCBzVmFsdWVIZWxwUHJvcGVydHk6IHN0cmluZywgdktleTogc3RyaW5nLCB2aFBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWQpIHtcblx0Y29uc3QgYUZpbHRlcnMgPSBbXTtcblx0Y29uc3QgcGFyYW1ldGVycyA9IG9WYWx1ZUxpc3QuUGFyYW1ldGVycy5maWx0ZXIoZnVuY3Rpb24gKHBhcmFtZXRlcjogYW55KSB7XG5cdFx0cmV0dXJuIHBhcmFtZXRlci4kVHlwZS5pbmRleE9mKFwiSW5cIikgPiA0OCB8fFxuXHRcdChwYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHk/LiRQcm9wZXJ0eVBhdGggPT09IHNQcm9wZXJ0eU5hbWUgJiYgcGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5ID09PSBzVmFsdWVIZWxwUHJvcGVydHkpO1xuXHR9KTtcblx0Zm9yIChjb25zdCBwYXJhbWV0ZXIgb2YgcGFyYW1ldGVycykge1xuXHRcdGlmIChwYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHkuJFByb3BlcnR5UGF0aCA9PT0gc1Byb3BlcnR5TmFtZSkge1xuXHRcdFx0YUZpbHRlcnMucHVzaChuZXcgRmlsdGVyKHsgcGF0aDogc1ZhbHVlSGVscFByb3BlcnR5LCBvcGVyYXRvcjogXCJFUVwiLCB2YWx1ZTE6IHZLZXkgfSkpO1xuXHRcdH0gZWxzZSBpZiAocGFyYW1ldGVyLiRUeXBlLmluZGV4T2YoXCJJblwiKSA+IDQ4ICYmIHZoUGF5bG9hZD8uaXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2cpIHtcblx0XHRcdGNvbnN0IGFwZEZpZWxkUGF0aCA9IGBBUERfOjoke3BhcmFtZXRlci5Mb2NhbERhdGFQcm9wZXJ0eS4kUHJvcGVydHlQYXRofWA7XG5cdFx0XHRjb25zdCBhcGRGaWVsZCA9IHNhcC51aS5nZXRDb3JlKCkuYnlJZChhcGRGaWVsZFBhdGgpIGFzIEZpZWxkO1xuXHRcdFx0Y29uc3QgYXBkRmllbGRWYWx1ZSA9IGFwZEZpZWxkPy5nZXRWYWx1ZSgpO1xuXHRcdFx0aWYgKGFwZEZpZWxkVmFsdWUgIT0gbnVsbCkge1xuXHRcdFx0XHRhRmlsdGVycy5wdXNoKG5ldyBGaWx0ZXIoeyBwYXRoOiBwYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHksIG9wZXJhdG9yOiBcIkVRXCIsIHZhbHVlMTogYXBkRmllbGRWYWx1ZSB9KSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBhRmlsdGVycztcbn1cblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0LmFzc2lnbih7fSwgRmllbGRCYXNlRGVsZWdhdGUsIHtcblx0Z2V0SXRlbUZvclZhbHVlOiBmdW5jdGlvbiAob1BheWxvYWQ6IG9iamVjdCwgb0ZpZWxkSGVscDogRmllbGRIZWxwQmFzZSwgb0NvbmZpZzogYW55KSB7XG5cdFx0Ly9CQ1A6IDIyNzAxNjI4ODcgLiBUaGUgTURDIGZpZWxkIHNob3VsZCBub3QgdHJ5IHRvIGdldCB0aGUgaXRlbSB3aGVuIHRoZSBmaWVsZCBpcyBlbXB0aWVkXG5cdFx0aWYgKG9Db25maWcudmFsdWUgIT09IFwiXCIpIHtcblx0XHRcdHJldHVybiBNRENGaWVsZEJhc2VEZWxlZ2F0ZS5nZXRJdGVtRm9yVmFsdWUob1BheWxvYWQsIG9GaWVsZEhlbHAsIG9Db25maWcpO1xuXHRcdH1cblx0fSxcblx0Z2V0RGVzY3JpcHRpb246IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55LCBvRmllbGRIZWxwOiBhbnksIHZLZXk6IHN0cmluZykge1xuXHRcdC8vSklSQTogRklPUklURUNIUDEtMjIwMjIgLiBUaGUgTURDIGZpZWxkIHNob3VsZCBub3QgIHRyaWVzIHRvIGRldGVybWluZSBkZXNjcmlwdGlvbiB3aXRoIHRoZSBpbml0aWFsIEdFVCBvZiB0aGUgZGF0YS5cblx0XHQvLyBpdCBzaG91bGQgcmVseSBvbiB0aGUgZGF0YSB3ZSBhbHJlYWR5IHJlY2VpdmVkIGZyb20gdGhlIGJhY2tlbmRcblx0XHQvLyBCdXQgVGhlIGdldERlc2NyaXB0aW9uIGZ1bmN0aW9uIGlzIGFsc28gY2FsbGVkIGluIHRoZSBGaWx0ZXJGaWVsZCBjYXNlIGlmIGEgdmFyaWFudCBpcyBsb2FkZWQuXG5cdFx0Ly8gQXMgdGhlIGRlc2NyaXB0aW9uIHRleHQgY291bGQgYmUgbGFuZ3VhZ2UgZGVwZW5kZW50IGl0IGlzIG5vdCBzdG9yZWQgaW4gdGhlIHZhcmlhbnQsIHNvIGl0IG5lZWRzIHRvIGJlIHJlYWQgb24gcmVuZGVyaW5nLlxuXG5cdFx0aWYgKG9QYXlsb2FkPy5yZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0IHx8IG9QYXlsb2FkPy5pc0ZpbHRlckZpZWxkKSB7XG5cdFx0XHRjb25zdCBvT0RhdGFNb2RlbCA9IG9GaWVsZEhlbHAuZ2V0TW9kZWwoKTtcblx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvT0RhdGFNb2RlbCA/IG9PRGF0YU1vZGVsLmdldE1ldGFNb2RlbCgpIDogQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9GaWVsZEhlbHApLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRjb25zdCB2aFBheWxvYWQgPSBvRmllbGRIZWxwPy5nZXRQYXlsb2FkKCk7XG5cdFx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gdmhQYXlsb2FkPy5wcm9wZXJ0eVBhdGg7XG5cdFx0XHRsZXQgc1RleHRQcm9wZXJ0eTogc3RyaW5nO1xuXHRcdFx0cmV0dXJuIG9NZXRhTW9kZWxcblx0XHRcdFx0LnJlcXVlc3RWYWx1ZUxpc3RJbmZvKHNQcm9wZXJ0eVBhdGgsIHRydWUsIG9GaWVsZEhlbHAuZ2V0QmluZGluZ0NvbnRleHQoKSlcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKG1WYWx1ZUxpc3RJbmZvOiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBzUHJvcGVydHlOYW1lID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1Byb3BlcnR5UGF0aH1Ac2FwdWkubmFtZWApO1xuXHRcdFx0XHRcdC8vIHRha2UgdGhlIGZpcnN0IHZhbHVlIGxpc3QgYW5ub3RhdGlvbiAtIGFsdGVybmF0aXZlbHkgdGFrZSB0aGUgb25lIHdpdGhvdXQgcXVhbGlmaWVyIG9yIHRoZSBmaXJzdCBvbmVcblx0XHRcdFx0XHRjb25zdCBvVmFsdWVMaXN0ID0gbVZhbHVlTGlzdEluZm9bT2JqZWN0LmtleXMobVZhbHVlTGlzdEluZm8pWzBdXTtcblx0XHRcdFx0XHRsZXQgc1ZhbHVlSGVscFByb3BlcnR5O1xuXHRcdFx0XHRcdGNvbnN0IGFWYWx1ZUhlbHBQYXJhbWV0ZXJzID0gX2dldFZhbHVlTGlzdFBhcmFtZXRlcihvVmFsdWVMaXN0LCBzUHJvcGVydHlOYW1lKTtcblx0XHRcdFx0XHRpZiAoYVZhbHVlSGVscFBhcmFtZXRlcnMgJiYgYVZhbHVlSGVscFBhcmFtZXRlcnNbMF0pIHtcblx0XHRcdFx0XHRcdHNWYWx1ZUhlbHBQcm9wZXJ0eSA9IGFWYWx1ZUhlbHBQYXJhbWV0ZXJzWzBdLlZhbHVlTGlzdFByb3BlcnR5O1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoYEluY29uc2lzdGVudCB2YWx1ZSBoZWxwIGFubm90YXRpb24gZm9yICR7c1Byb3BlcnR5TmFtZX1gKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gZ2V0IHRleHQgYW5ub3RhdGlvbiBmb3IgdGhpcyB2YWx1ZSBsaXN0IHByb3BlcnR5XG5cdFx0XHRcdFx0Y29uc3Qgb01vZGVsID0gb1ZhbHVlTGlzdC4kbW9kZWw7XG5cdFx0XHRcdFx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb01vZGVsXG5cdFx0XHRcdFx0XHQuZ2V0TWV0YU1vZGVsKClcblx0XHRcdFx0XHRcdC5nZXRPYmplY3QoYC8ke29WYWx1ZUxpc3QuQ29sbGVjdGlvblBhdGh9LyR7c1ZhbHVlSGVscFByb3BlcnR5fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dGApO1xuXHRcdFx0XHRcdGlmIChvVGV4dEFubm90YXRpb24gJiYgb1RleHRBbm5vdGF0aW9uLiRQYXRoKSB7XG5cdFx0XHRcdFx0XHRzVGV4dFByb3BlcnR5ID0gb1RleHRBbm5vdGF0aW9uLiRQYXRoO1xuXHRcdFx0XHRcdFx0LyogQnVpbGQgdGhlIGZpbHRlciBmb3IgZWFjaCBpbi1wYXJhbWV0ZXIgKi9cblx0XHRcdFx0XHRcdGNvbnN0IGFGaWx0ZXJzID0gX2dldEZpbHRlcihvVmFsdWVMaXN0LCBzUHJvcGVydHlOYW1lLCBzVmFsdWVIZWxwUHJvcGVydHksIHZLZXksIHZoUGF5bG9hZCk7XG5cdFx0XHRcdFx0XHRjb25zdCBvTGlzdEJpbmRpbmcgPSBvTW9kZWwuYmluZExpc3QoYC8ke29WYWx1ZUxpc3QuQ29sbGVjdGlvblBhdGh9YCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIGFGaWx0ZXJzLCB7XG5cdFx0XHRcdFx0XHRcdFwiJHNlbGVjdFwiOiBzVGV4dFByb3BlcnR5XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdHJldHVybiBvTGlzdEJpbmRpbmcucmVxdWVzdENvbnRleHRzKDAsIDIpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoYFRleHQgQW5ub3RhdGlvbiBmb3IgJHtzVmFsdWVIZWxwUHJvcGVydHl9aXMgbm90IGRlZmluZWRgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChhQ29udGV4dHM6IGFueSkge1xuXHRcdFx0XHRcdC8vIHJldHVybiBhQ29udGV4dHMgJiYgYUNvbnRleHRzWzBdID8gYUNvbnRleHRzWzBdLmdldE9iamVjdCgpW3NUZXh0UHJvcGVydHldIDogXCJcIjtcblx0XHRcdFx0XHRyZXR1cm4gYUNvbnRleHRzPy5bMF0/LmdldE9iamVjdChzVGV4dFByb3BlcnR5KTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlOiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBzTXNnID1cblx0XHRcdFx0XHRcdGUuc3RhdHVzICYmIGUuc3RhdHVzID09PSA0MDRcblx0XHRcdFx0XHRcdFx0PyBgTWV0YWRhdGEgbm90IGZvdW5kICgke2Uuc3RhdHVzfSkgZm9yIHZhbHVlIGhlbHAgb2YgcHJvcGVydHkgJHtzUHJvcGVydHlQYXRofWBcblx0XHRcdFx0XHRcdFx0OiBlLm1lc3NhZ2U7XG5cdFx0XHRcdFx0TG9nLmVycm9yKHNNc2cpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH1cbn0pO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O0VBZ0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0Esc0JBQXNCLENBQUNDLFVBQXFCLEVBQUVDLGFBQXFCLEVBQUU7SUFDN0U7SUFDQSxPQUFPRCxVQUFVLENBQUNFLFVBQVUsQ0FBQ0MsTUFBTSxDQUFDLFVBQVVDLEtBQVUsRUFBRTtNQUN6RCxJQUFJQSxLQUFLLENBQUNDLGlCQUFpQixFQUFFO1FBQzVCLE9BQU9ELEtBQUssQ0FBQ0MsaUJBQWlCLENBQUNDLGFBQWEsS0FBS0wsYUFBYTtNQUMvRCxDQUFDLE1BQU07UUFDTixPQUFPLEtBQUs7TUFDYjtJQUNELENBQUMsQ0FBQztFQUNIO0VBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTTSxVQUFVLENBQUNQLFVBQXFCLEVBQUVDLGFBQXFCLEVBQUVPLGtCQUEwQixFQUFFQyxJQUFZLEVBQUVDLFNBQTJCLEVBQUU7SUFDeEksSUFBTUMsUUFBUSxHQUFHLEVBQUU7SUFDbkIsSUFBTUMsVUFBVSxHQUFHWixVQUFVLENBQUNFLFVBQVUsQ0FBQ0MsTUFBTSxDQUFDLFVBQVVVLFNBQWMsRUFBRTtNQUFBO01BQ3pFLE9BQU9BLFNBQVMsQ0FBQ0MsS0FBSyxDQUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUN4QywwQkFBQUYsU0FBUyxDQUFDUixpQkFBaUIsMERBQTNCLHNCQUE2QkMsYUFBYSxNQUFLTCxhQUFhLElBQUlZLFNB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