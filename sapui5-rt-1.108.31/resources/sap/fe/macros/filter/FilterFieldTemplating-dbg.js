/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/templating/PropertyFormatters", "sap/fe/core/templating/UIFormatters"], function (PropertyFormatters, UIFormatters) {
  "use strict";

  var _exports = {};
  var getDisplayMode = UIFormatters.getDisplayMode;
  var hasValueHelp = PropertyFormatters.hasValueHelp;
  var getPropertyObjectPath = PropertyFormatters.getPropertyObjectPath;
  /**
   * Method to determine the display mode from the value help.
   *
   * @param Interface The current templating context
   * @param propertyObjectPath The global path to reach the entitySet
   * @returns A promise with the string 'DescriptionValue' or 'Value', depending on whether a text annotation exists for the property in the value help
   * Hint: A text arrangement is consciously ignored. If the text is retrieved from the value help, the text arrangement of the value help property isn´t considered. Instead, the default text arrangement #TextFirst
   * is used.
   */
  var _getDisplayModeFromValueHelp = function (Interface, propertyObjectPath) {
    try {
      var context = Interface.context;
      var metaModel = Interface.context.getModel();
      return Promise.resolve(metaModel.requestValueListInfo(context.getPath(), true, context).then(function (valueListInfo) {
        var _firstValueListInfo$P;
        var firstKey = Object.keys(valueListInfo)[0];
        var firstValueListInfo = valueListInfo[firstKey];
        var valueListParameter = (_firstValueListInfo$P = firstValueListInfo.Parameters) === null || _firstValueListInfo$P === void 0 ? void 0 : _firstValueListInfo$P.find(function (element) {
          var _element$LocalDataPro, _propertyObjectPath$t7;
          return ((_element$LocalDataPro = element.LocalDataProperty) === null || _element$LocalDataPro === void 0 ? void 0 : _element$LocalDataPro.$PropertyPath) === (propertyObjectPath === null || propertyObjectPath === void 0 ? void 0 : (_propertyObjectPath$t7 = propertyObjectPath.targetObject) === null || _propertyObjectPath$t7 === void 0 ? void 0 : _propertyObjectPath$t7.name);
        });
        var valueListProperty = valueListParameter === null || valueListParameter === void 0 ? void 0 : valueListParameter.ValueListProperty;
        var textAnnotation = metaModel.getObject("/" + firstValueListInfo.CollectionPath + "/" + valueListProperty + "@com.sap.vocabularies.Common.v1.Text");
        return textAnnotation ? "DescriptionValue" : "Value";
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  _exports._getDisplayModeFromValueHelp = _getDisplayModeFromValueHelp;
  var getDisplayProperty = function (oContext, oInterface) {
    var propertyPath = getPropertyObjectPath(oContext, oInterface);
    return hasValueHelp(oContext, oInterface) ? getDisplayMode(propertyPath) : "Value";
  };
  _exports.getDisplayProperty = getDisplayProperty;
  var getFilterFieldDisplayFormat = function (oContext, oInterface) {
    try {
      var _propertyObjectPath$t, _propertyObjectPath$t2, _propertyObjectPath$t3;
      var propertyObjectPath = getPropertyObjectPath(oContext, oInterface);
      var oTextAnnotation = (_propertyObjectPath$t = propertyObjectPath.targetObject) === null || _propertyObjectPath$t === void 0 ? void 0 : (_propertyObjectPath$t2 = _propertyObjectPath$t.annotations) === null || _propertyObjectPath$t2 === void 0 ? void 0 : (_propertyObjectPath$t3 = _propertyObjectPath$t2.Common) === null || _propertyObjectPath$t3 === void 0 ? void 0 : _propertyObjectPath$t3.Text;
      if (oTextAnnotation) {
        // The text annotation should be on the property defined
        return Promise.resolve(getDisplayProperty(oContext, oInterface));
      }
      var bHasValueHelp = hasValueHelp(oContext, oInterface);
      if (bHasValueHelp) {
        var _propertyObjectPath$t4, _propertyObjectPath$t5, _propertyObjectPath$t6;
        // Exceptional case for missing text annotation on the property (retrieve text from value list)
        // Consider TextArrangement at EntityType otherwise set default display format 'DescriptionValue'
        var oEntityTextArrangement = propertyObjectPath === null || propertyObjectPath === void 0 ? void 0 : (_propertyObjectPath$t4 = propertyObjectPath.targetEntityType) === null || _propertyObjectPath$t4 === void 0 ? void 0 : (_propertyObjectPath$t5 = _propertyObjectPath$t4.annotations) === null || _propertyObjectPath$t5 === void 0 ? void 0 : (_propertyObjectPath$t6 = _propertyObjectPath$t5.UI) === null || _propertyObjectPath$t6 === void 0 ? void 0 : _propertyObjectPath$t6.TextArrangement;
        return Promise.resolve(oEntityTextArrangement ? getDisplayMode(propertyObjectPath) : _getDisplayModeFromValueHelp(oInterface, propertyObjectPath));
      }
      return Promise.resolve("Value");
    } catch (e) {
      return Promise.reject(e);
    }
  };
  _exports.getFilterFieldDisplayFormat = getFilterFieldDisplayFormat;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZ2V0RGlzcGxheU1vZGVGcm9tVmFsdWVIZWxwIiwiSW50ZXJmYWNlIiwicHJvcGVydHlPYmplY3RQYXRoIiwiY29udGV4dCIsIm1ldGFNb2RlbCIsImdldE1vZGVsIiwicmVxdWVzdFZhbHVlTGlzdEluZm8iLCJnZXRQYXRoIiwidGhlbiIsInZhbHVlTGlzdEluZm8iLCJmaXJzdEtleSIsIk9iamVjdCIsImtleXMiLCJmaXJzdFZhbHVlTGlzdEluZm8iLCJ2YWx1ZUxpc3RQYXJhbWV0ZXIiLCJQYXJhbWV0ZXJzIiwiZmluZCIsImVsZW1lbnQiLCJMb2NhbERhdGFQcm9wZXJ0eSIsIiRQcm9wZXJ0eVBhdGgiLCJ0YXJnZXRPYmplY3QiLCJuYW1lIiwidmFsdWVMaXN0UHJvcGVydHkiLCJWYWx1ZUxpc3RQcm9wZXJ0eSIsInRleHRBbm5vdGF0aW9uIiwiZ2V0T2JqZWN0IiwiQ29sbGVjdGlvblBhdGgiLCJnZXREaXNwbGF5UHJvcGVydHkiLCJvQ29udGV4dCIsIm9JbnRlcmZhY2UiLCJwcm9wZXJ0eVBhdGgiLCJnZXRQcm9wZXJ0eU9iamVjdFBhdGgiLCJoYXNWYWx1ZUhlbHAiLCJnZXREaXNwbGF5TW9kZSIsImdldEZpbHRlckZpZWxkRGlzcGxheUZvcm1hdCIsIm9UZXh0QW5ub3RhdGlvbiIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiVGV4dCIsImJIYXNWYWx1ZUhlbHAiLCJvRW50aXR5VGV4dEFycmFuZ2VtZW50IiwidGFyZ2V0RW50aXR5VHlwZSIsIlVJIiwiVGV4dEFycmFuZ2VtZW50Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWx0ZXJGaWVsZFRlbXBsYXRpbmcudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGdldFByb3BlcnR5T2JqZWN0UGF0aCwgaGFzVmFsdWVIZWxwIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgdHlwZSB7IENvbXB1dGVkQW5ub3RhdGlvbkludGVyZmFjZSwgTWV0YU1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IHsgZ2V0RGlzcGxheU1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxuZXhwb3J0IGNvbnN0IGdldERpc3BsYXlQcm9wZXJ0eSA9IGZ1bmN0aW9uIChvQ29udGV4dDogTWV0YU1vZGVsQ29udGV4dCwgb0ludGVyZmFjZTogQ29tcHV0ZWRBbm5vdGF0aW9uSW50ZXJmYWNlKTogc3RyaW5nIHtcblx0Y29uc3QgcHJvcGVydHlQYXRoID0gZ2V0UHJvcGVydHlPYmplY3RQYXRoKG9Db250ZXh0LCBvSW50ZXJmYWNlKTtcblxuXHRyZXR1cm4gaGFzVmFsdWVIZWxwKG9Db250ZXh0LCBvSW50ZXJmYWNlKSA/IGdldERpc3BsYXlNb2RlKHByb3BlcnR5UGF0aCkgOiBcIlZhbHVlXCI7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0RmlsdGVyRmllbGREaXNwbGF5Rm9ybWF0ID0gYXN5bmMgZnVuY3Rpb24gKFxuXHRvQ29udGV4dDogTWV0YU1vZGVsQ29udGV4dCxcblx0b0ludGVyZmFjZTogQ29tcHV0ZWRBbm5vdGF0aW9uSW50ZXJmYWNlXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuXHRjb25zdCBwcm9wZXJ0eU9iamVjdFBhdGggPSBnZXRQcm9wZXJ0eU9iamVjdFBhdGgob0NvbnRleHQsIG9JbnRlcmZhY2UpO1xuXHRjb25zdCBvVGV4dEFubm90YXRpb24gPSBwcm9wZXJ0eU9iamVjdFBhdGgudGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0O1xuXHRpZiAob1RleHRBbm5vdGF0aW9uKSB7XG5cdFx0Ly8gVGhlIHRleHQgYW5ub3RhdGlvbiBzaG91bGQgYmUgb24gdGhlIHByb3BlcnR5IGRlZmluZWRcblx0XHRyZXR1cm4gZ2V0RGlzcGxheVByb3BlcnR5KG9Db250ZXh0LCBvSW50ZXJmYWNlKTtcblx0fVxuXHRjb25zdCBiSGFzVmFsdWVIZWxwID0gaGFzVmFsdWVIZWxwKG9Db250ZXh0LCBvSW50ZXJmYWNlKTtcblx0aWYgKGJIYXNWYWx1ZUhlbHApIHtcblx0XHQvLyBFeGNlcHRpb25hbCBjYXNlIGZvciBtaXNzaW5nIHRleHQgYW5ub3RhdGlvbiBvbiB0aGUgcHJvcGVydHkgKHJldHJpZXZlIHRleHQgZnJvbSB2YWx1ZSBsaXN0KVxuXHRcdC8vIENvbnNpZGVyIFRleHRBcnJhbmdlbWVudCBhdCBFbnRpdHlUeXBlIG90aGVyd2lzZSBzZXQgZGVmYXVsdCBkaXNwbGF5IGZvcm1hdCAnRGVzY3JpcHRpb25WYWx1ZSdcblx0XHRjb25zdCBvRW50aXR5VGV4dEFycmFuZ2VtZW50ID0gcHJvcGVydHlPYmplY3RQYXRoPy50YXJnZXRFbnRpdHlUeXBlPy5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudDtcblx0XHRyZXR1cm4gb0VudGl0eVRleHRBcnJhbmdlbWVudCA/IGdldERpc3BsYXlNb2RlKHByb3BlcnR5T2JqZWN0UGF0aCkgOiBfZ2V0RGlzcGxheU1vZGVGcm9tVmFsdWVIZWxwKG9JbnRlcmZhY2UsIHByb3BlcnR5T2JqZWN0UGF0aCk7XG5cdH1cblx0cmV0dXJuIFwiVmFsdWVcIjtcbn07XG5cbi8qKlxuICogTWV0aG9kIHRvIGRldGVybWluZSB0aGUgZGlzcGxheSBtb2RlIGZyb20gdGhlIHZhbHVlIGhlbHAuXG4gKlxuICogQHBhcmFtIEludGVyZmFjZSBUaGUgY3VycmVudCB0ZW1wbGF0aW5nIGNvbnRleHRcbiAqIEBwYXJhbSBwcm9wZXJ0eU9iamVjdFBhdGggVGhlIGdsb2JhbCBwYXRoIHRvIHJlYWNoIHRoZSBlbnRpdHlTZXRcbiAqIEByZXR1cm5zIEEgcHJvbWlzZSB3aXRoIHRoZSBzdHJpbmcgJ0Rlc2NyaXB0aW9uVmFsdWUnIG9yICdWYWx1ZScsIGRlcGVuZGluZyBvbiB3aGV0aGVyIGEgdGV4dCBhbm5vdGF0aW9uIGV4aXN0cyBmb3IgdGhlIHByb3BlcnR5IGluIHRoZSB2YWx1ZSBoZWxwXG4gKiBIaW50OiBBIHRleHQgYXJyYW5nZW1lbnQgaXMgY29uc2Npb3VzbHkgaWdub3JlZC4gSWYgdGhlIHRleHQgaXMgcmV0cmlldmVkIGZyb20gdGhlIHZhbHVlIGhlbHAsIHRoZSB0ZXh0IGFycmFuZ2VtZW50IG9mIHRoZSB2YWx1ZSBoZWxwIHByb3BlcnR5IGlzbsK0dCBjb25zaWRlcmVkLiBJbnN0ZWFkLCB0aGUgZGVmYXVsdCB0ZXh0IGFycmFuZ2VtZW50ICNUZXh0Rmlyc3RcbiAqIGlzIHVzZWQuXG4gKi9cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBfZ2V0RGlzcGxheU1vZGVGcm9tVmFsdWVIZWxwKFxuXHRJbnRlcmZhY2U6IENvbXB1dGVkQW5ub3RhdGlvbkludGVyZmFjZSxcblx0cHJvcGVydHlPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoXG4pOiBQcm9taXNlPHN0cmluZz4ge1xuXHRjb25zdCBjb250ZXh0ID0gSW50ZXJmYWNlLmNvbnRleHQ7XG5cdGNvbnN0IG1ldGFNb2RlbCA9IEludGVyZmFjZS5jb250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cblx0cmV0dXJuIGF3YWl0IG1ldGFNb2RlbC5yZXF1ZXN0VmFsdWVMaXN0SW5mbyhjb250ZXh0LmdldFBhdGgoKSwgdHJ1ZSwgY29udGV4dCkudGhlbihmdW5jdGlvbiAodmFsdWVMaXN0SW5mbzogYW55KSB7XG5cdFx0Y29uc3QgZmlyc3RLZXkgPSBPYmplY3Qua2V5cyh2YWx1ZUxpc3RJbmZvKVswXTtcblx0XHRjb25zdCBmaXJzdFZhbHVlTGlzdEluZm8gPSB2YWx1ZUxpc3RJbmZvW2ZpcnN0S2V5XTtcblx0XHRjb25zdCB2YWx1ZUxpc3RQYXJhbWV0ZXIgPSBmaXJzdFZhbHVlTGlzdEluZm8uUGFyYW1ldGVycz8uZmluZCgoZWxlbWVudDogYW55KSA9PiB7XG5cdFx0XHRyZXR1cm4gZWxlbWVudC5Mb2NhbERhdGFQcm9wZXJ0eT8uJFByb3BlcnR5UGF0aCA9PT0gcHJvcGVydHlPYmplY3RQYXRoPy50YXJnZXRPYmplY3Q/Lm5hbWU7XG5cdFx0fSk7XG5cdFx0Y29uc3QgdmFsdWVMaXN0UHJvcGVydHkgPSB2YWx1ZUxpc3RQYXJhbWV0ZXI/LlZhbHVlTGlzdFByb3BlcnR5O1xuXG5cdFx0Y29uc3QgdGV4dEFubm90YXRpb24gPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XCIvXCIgKyBmaXJzdFZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGggKyBcIi9cIiArIHZhbHVlTGlzdFByb3BlcnR5ICsgXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIlxuXHRcdCk7XG5cdFx0cmV0dXJuIHRleHRBbm5vdGF0aW9uID8gXCJEZXNjcmlwdGlvblZhbHVlXCIgOiBcIlZhbHVlXCI7XG5cdH0pO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztFQWdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFSQSxJQVNzQkEsNEJBQTRCLGFBQ2pEQyxTQUFzQyxFQUN0Q0Msa0JBQXVDO0lBQUEsSUFDckI7TUFDbEIsSUFBTUMsT0FBTyxHQUFHRixTQUFTLENBQUNFLE9BQU87TUFDakMsSUFBTUMsU0FBUyxHQUFHSCxTQUFTLENBQUNFLE9BQU8sQ0FBQ0UsUUFBUSxFQUFvQjtNQUFDLHVCQUVwREQsU0FBUyxDQUFDRSxvQkFBb0IsQ0FBQ0gsT0FBTyxDQUFDSSxPQUFPLEVBQUUsRUFBRSxJQUFJLEVBQUVKLE9BQU8sQ0FBQyxDQUFDSyxJQUFJLENBQUMsVUFBVUMsYUFBa0IsRUFBRTtRQUFBO1FBQ2hILElBQU1DLFFB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