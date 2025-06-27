/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var _exports = {};
  /**
   * Collection of formatters needed for the collaboration draft.
   *
   * @param {object} this The context
   * @param {string} sName The inner function name
   * @param {object[]} oArgs The inner function parameters
   * @returns {object} The value from the inner function
   */

  var collaborationFormatters = function (sName) {
    if (collaborationFormatters.hasOwnProperty(sName)) {
      for (var _len = arguments.length, oArgs = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        oArgs[_key - 1] = arguments[_key];
      }
      return collaborationFormatters[sName].apply(this, oArgs);
    } else {
      return "";
    }
  };
  var hasCollaborationActivity = function (activities) {
    for (var _len2 = arguments.length, keys = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      keys[_key2 - 1] = arguments[_key2];
    }
    return !!getCollaborationActivity.apply(void 0, [activities].concat(keys));
  };
  hasCollaborationActivity.__functionName = "sap.fe.core.formatters.CollaborationFormatter#hasCollaborationActivity";
  _exports.hasCollaborationActivity = hasCollaborationActivity;
  var getCollaborationActivityInitials = function (activities) {
    for (var _len3 = arguments.length, keys = new Array(_len3 > 1 ? _len3 - 1 : 0), _key3 = 1; _key3 < _len3; _key3++) {
      keys[_key3 - 1] = arguments[_key3];
    }
    var activity = getCollaborationActivity.apply(void 0, [activities].concat(keys));
    return (activity === null || activity === void 0 ? void 0 : activity.initials) || undefined;
  };
  getCollaborationActivityInitials.__functionName = "sap.fe.core.formatters.CollaborationFormatter#getCollaborationActivityInitials";
  _exports.getCollaborationActivityInitials = getCollaborationActivityInitials;
  var getCollaborationActivityColor = function (activities) {
    for (var _len4 = arguments.length, keys = new Array(_len4 > 1 ? _len4 - 1 : 0), _key4 = 1; _key4 < _len4; _key4++) {
      keys[_key4 - 1] = arguments[_key4];
    }
    var activity = getCollaborationActivity.apply(void 0, [activities].concat(keys));
    return activity !== null && activity !== void 0 && activity.color ? "Accent".concat(activity.color) : undefined;
  };
  getCollaborationActivityColor.__functionName = "sap.fe.core.formatters.CollaborationFormatter#getCollaborationActivityColor";
  _exports.getCollaborationActivityColor = getCollaborationActivityColor;
  function getCollaborationActivity(activities) {
    for (var _len5 = arguments.length, keys = new Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
      keys[_key5 - 1] = arguments[_key5];
    }
    if (activities && activities.length > 0) {
      return activities.find(function (activity) {
        var _activity$key;
        var activityKeys = (activity === null || activity === void 0 ? void 0 : (_activity$key = activity.key) === null || _activity$key === void 0 ? void 0 : _activity$key.split(",")) || [];
        var compareKey = "";
        var splitKeys;
        for (var i = 0; i < activityKeys.length; i++) {
          var _keys$i;
          // take care on short and full notation
          splitKeys = activityKeys[i].split("=");
          compareKey = (splitKeys[1] || splitKeys[0]).split("'").join("");
          if (compareKey !== ((_keys$i = keys[i]) === null || _keys$i === void 0 ? void 0 : _keys$i.toString())) {
            return false;
          }
        }
        return true;
      });
    }
  }
  collaborationFormatters.hasCollaborationActivity = hasCollaborationActivity;
  collaborationFormatters.getCollaborationActivityInitials = getCollaborationActivityInitials;
  collaborationFormatters.getCollaborationActivityColor = getCollaborationActivityColor;
  /**
   * @global
   */
  return collaborationFormatters;
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjb2xsYWJvcmF0aW9uRm9ybWF0dGVycyIsInNOYW1lIiwiaGFzT3duUHJvcGVydHkiLCJvQXJncyIsImFwcGx5IiwiaGFzQ29sbGFib3JhdGlvbkFjdGl2aXR5IiwiYWN0aXZpdGllcyIsImtleXMiLCJnZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHkiLCJfX2Z1bmN0aW9uTmFtZSIsImdldENvbGxhYm9yYXRpb25BY3Rpdml0eUluaXRpYWxzIiwiYWN0aXZpdHkiLCJpbml0aWFscyIsInVuZGVmaW5lZCIsImdldENvbGxhYm9yYXRpb25BY3Rpdml0eUNvbG9yIiwiY29sb3IiLCJsZW5ndGgiLCJmaW5kIiwiYWN0aXZpdHlLZXlzIiwia2V5Iiwic3BsaXQiLCJjb21wYXJlS2V5Iiwic3BsaXRLZXlzIiwiaSIsImpvaW4iLCJ0b1N0cmluZyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ29sbGFib3JhdGlvbkZvcm1hdHRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvbGxlY3Rpb24gb2YgZm9ybWF0dGVycyBuZWVkZWQgZm9yIHRoZSBjb2xsYWJvcmF0aW9uIGRyYWZ0LlxuICpcbiAqIEBwYXJhbSB7b2JqZWN0fSB0aGlzIFRoZSBjb250ZXh0XG4gKiBAcGFyYW0ge3N0cmluZ30gc05hbWUgVGhlIGlubmVyIGZ1bmN0aW9uIG5hbWVcbiAqIEBwYXJhbSB7b2JqZWN0W119IG9BcmdzIFRoZSBpbm5lciBmdW5jdGlvbiBwYXJhbWV0ZXJzXG4gKiBAcmV0dXJucyB7b2JqZWN0fSBUaGUgdmFsdWUgZnJvbSB0aGUgaW5uZXIgZnVuY3Rpb25cbiAqL1xuXG5jb25zdCBjb2xsYWJvcmF0aW9uRm9ybWF0dGVycyA9IGZ1bmN0aW9uICh0aGlzOiBvYmplY3QsIHNOYW1lOiBzdHJpbmcsIC4uLm9BcmdzOiBhbnlbXSk6IGFueSB7XG5cdGlmIChjb2xsYWJvcmF0aW9uRm9ybWF0dGVycy5oYXNPd25Qcm9wZXJ0eShzTmFtZSkpIHtcblx0XHRyZXR1cm4gKGNvbGxhYm9yYXRpb25Gb3JtYXR0ZXJzIGFzIGFueSlbc05hbWVdLmFwcGx5KHRoaXMsIG9BcmdzKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gXCJcIjtcblx0fVxufTtcbmV4cG9ydCBjb25zdCBoYXNDb2xsYWJvcmF0aW9uQWN0aXZpdHkgPSAoYWN0aXZpdGllczogYW55LCAuLi5rZXlzOiBhbnlbXSk6IGJvb2xlYW4gfCB1bmRlZmluZWQgPT4ge1xuXHRyZXR1cm4gISFnZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHkoYWN0aXZpdGllcywgLi4ua2V5cyk7XG59O1xuaGFzQ29sbGFib3JhdGlvbkFjdGl2aXR5Ll9fZnVuY3Rpb25OYW1lID0gXCJzYXAuZmUuY29yZS5mb3JtYXR0ZXJzLkNvbGxhYm9yYXRpb25Gb3JtYXR0ZXIjaGFzQ29sbGFib3JhdGlvbkFjdGl2aXR5XCI7XG5cbmV4cG9ydCBjb25zdCBnZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHlJbml0aWFscyA9IChhY3Rpdml0aWVzOiBhbnksIC4uLmtleXM6IGFueVtdKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcblx0Y29uc3QgYWN0aXZpdHkgPSBnZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHkoYWN0aXZpdGllcywgLi4ua2V5cyk7XG5cdHJldHVybiBhY3Rpdml0eT8uaW5pdGlhbHMgfHwgdW5kZWZpbmVkO1xufTtcbmdldENvbGxhYm9yYXRpb25BY3Rpdml0eUluaXRpYWxzLl9fZnVuY3Rpb25OYW1lID0gXCJzYXAuZmUuY29yZS5mb3JtYXR0ZXJzLkNvbGxhYm9yYXRpb25Gb3JtYXR0ZXIjZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5SW5pdGlhbHNcIjtcblxuZXhwb3J0IGNvbnN0IGdldENvbGxhYm9yYXRpb25BY3Rpdml0eUNvbG9yID0gKGFjdGl2aXRpZXM6IGFueSwgLi4ua2V5czogYW55W10pOiBzdHJpbmcgfCB1bmRlZmluZWQgPT4ge1xuXHRjb25zdCBhY3Rpdml0eSA9IGdldENvbGxhYm9yYXRpb25BY3Rpdml0eShhY3Rpdml0aWVzLCAuLi5rZXlzKTtcblx0cmV0dXJuIGFjdGl2aXR5Py5jb2xvciA/IGBBY2NlbnQke2FjdGl2aXR5LmNvbG9yfWAgOiB1bmRlZmluZWQ7XG59O1xuZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5Q29sb3IuX19mdW5jdGlvbk5hbWUgPSBcInNhcC5mZS5jb3JlLmZvcm1hdHRlcnMuQ29sbGFib3JhdGlvbkZvcm1hdHRlciNnZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHlDb2xvclwiO1xuXG5mdW5jdGlvbiBnZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHkoYWN0aXZpdGllczogYW55LCAuLi5rZXlzOiBhbnlbXSkge1xuXHRpZiAoYWN0aXZpdGllcyAmJiBhY3Rpdml0aWVzLmxlbmd0aCA+IDApIHtcblx0XHRyZXR1cm4gYWN0aXZpdGllcy5maW5kKGZ1bmN0aW9uIChhY3Rpdml0eTogYW55KSB7XG5cdFx0XHRjb25zdCBhY3Rpdml0eUtleXMgPSBhY3Rpdml0eT8ua2V5Py5zcGxpdChcIixcIikgfHwgW107XG5cdFx0XHRsZXQgY29tcGFyZUtleSA9IFwiXCI7XG5cdFx0XHRsZXQgc3BsaXRLZXlzOiBzdHJpbmdbXTtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhY3Rpdml0eUtleXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Ly8gdGFrZSBjYXJlIG9uIHNob3J0IGFuZCBmdWxsIG5vdGF0aW9uXG5cdFx0XHRcdHNwbGl0S2V5cyA9IGFjdGl2aXR5S2V5c1tpXS5zcGxpdChcIj1cIik7XG5cdFx0XHRcdGNvbXBhcmVLZXkgPSAoc3BsaXRLZXlzWzFdIHx8IHNwbGl0S2V5c1swXSkuc3BsaXQoXCInXCIpLmpvaW4oXCJcIik7XG5cdFx0XHRcdGlmIChjb21wYXJlS2V5ICE9PSBrZXlzW2ldPy50b1N0cmluZygpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9KTtcblx0fVxufVxuXG5jb2xsYWJvcmF0aW9uRm9ybWF0dGVycy5oYXNDb2xsYWJvcmF0aW9uQWN0aXZpdHkgPSBoYXNDb2xsYWJvcmF0aW9uQWN0aXZpdHk7XG5jb2xsYWJvcmF0aW9uRm9ybWF0dGVycy5nZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHlJbml0aWFscyA9IGdldENvbGxhYm9yYXRpb25BY3Rpdml0eUluaXRpYWxzO1xuY29sbGFib3JhdGlvbkZvcm1hdHRlcnMuZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5Q29sb3IgPSBnZXRDb2xsYWJvcmF0aW9uQWN0aXZpdHlDb2xvcjtcbi8qKlxuICogQGdsb2JhbFxuICovXG5leHBvcnQgZGVmYXVsdCBjb2xsYWJvcmF0aW9uRm9ybWF0dGVycztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztFQUVBLElBQU1BLHVCQUF1QixHQUFHLFVBQXdCQyxLQUFhLEVBQXdCO0lBQzVGLElBQUlELHVCQUF1QixDQUFDRSxjQUFjLENBQUNELEtBQUssQ0FBQyxFQUFFO01BQUEsa0NBRHNCRSxLQUFLO1FBQUxBLEtBQUs7TUFBQTtNQUU3RSxPQUFRSCx1QkFBdUIsQ0FBU0MsS0FBSyxDQUFDLENBQUNHLEtBQUssQ0FBQyxJQUFJLEVBQUVELEtBQUssQ0FBQztJQUNsRSxDQUFDLE1BQU07TUFDTixPQUFPLEVBQUU7SUFDVjtFQUNELENBQUM7RUFDTSxJQUFNRSx3QkFBd0IsR0FBRyxVQUFDQyxVQUFlLEVBQTBDO0lBQUEsbUNBQXJDQyxJQUFJO01BQUpBLElBQUk7SUFBQTtJQUNoRSxPQUFPLENBQUMsQ0FBQ0Msd0JBQXdCLGdCQUFDRixVQUFVLFNBQUtDLElBQUksRUFBQztFQUN2RCxDQUFDO0VBQ0RGLHdCQUF3QixDQUFDSSxjQUFjLEdBQUcsd0VBQXdFO0VBQUM7RUFFNUcsSUFBTUMsZ0NBQWdDLEdBQUcsVUFBQ0osVUFBZSxFQUF5QztJQUFBLG1DQUFwQ0MsSUFBSTtNQUFKQSxJQUFJO0lBQUE7SUFDeEUsSUFBTUksUUFBUSxHQUFHSCx3QkFBd0IsZ0JBQUNGLFVBQVUsU0FBS0MsSUFBSSxFQUFDO0lBQzlELE9BQU8sQ0FBQUksUUFBUSxhQUFSQSxRQUFRLHVCQUFSQSxRQUFRLENBQUVDLFFBQVEsS0FBSUMsU0FBUztFQUN2QyxDQUFDO0VBQ0RILGdDQUFnQyxDQUFDRCxjQUFjLEdBQUcsZ0ZBQWdGO0VBQUM7RUFFNUgsSUFBTUssNkJBQTZCLEdBQUcsVUFBQ1IsVUFBZSxFQUF5QztJQUFBLG1DQUFwQ0MsSUFBSTtNQUFKQSxJQUFJO0lBQUE7SUFDckUsSUFBTUksUUFBUSxHQUFHSCx3QkFBd0IsZ0JBQUNGLFVBQVUsU0FBS0MsSUFBSSxFQUFDO0lBQzlELE9BQU9JLFFBQVEsYUFBUkEsUUFBUSxlQUFSQSxRQUFRLENBQUVJLEtBQUssbUJBQVlKLFFBQVEsQ0FBQ0ksS0FBSyxJQUFLRixTQUFTO0VBQy9ELENBQUM7RUFDREMsNkJBQTZCLENBQUNMLGNBQWMsR0FBRyw2RUFBNkU7RUFBQztFQUU3SCxTQUFTRCx3QkFBd0IsQ0FBQ0YsVUFBZSxFQUFrQjtJQUFBLG1DQUFiQyxJQUFJO01BQUpBLElBQUk7SUFBQTtJQUN6RCxJQUFJRCxVQUFVLElBQUlBLFVBQVUsQ0FBQ1UsTUFBTSxHQUFHLENBQUMsRUFBRTtNQUN4QyxPQUFPVixVQUFVLENBQUNXLElBQUksQ0FBQyxVQUFVTixRQUFhLEVBQUU7UUFBQTtRQUMvQyxJQUFNTyxZQUFZLEdBQUcsQ0FBQVAsUUFBUSxhQUFSQSxRQUFRLHdDQUFSQSxRQUFRLENBQUVRLEdBQUcsa0RBQWIsY0FBZUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFJLEVBQUU7UUFDcEQsSUFBSUMsVUFBVSxHQUFHLEVBQUU7UUFDbkIsSUFBSUMsU0FBbUI7UUFFdkIsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdMLFlBQVksQ0FBQ0YsTUFBTSxFQUFFTyxDQUFDLEVBQUUsRUFBRTtVQUFBO1VBQzdDO1VBQ0FELFNBQVMsR0FBR0osWUFBWSxDQUFDSyxDQUFDLENBQUMsQ0FBQ0gsS0FBSyxDQUFDLEdBQUcsQ0FBQztVQUN0Q0MsVUFBVSxHQUFHLENBQUNDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSUEsU0FBUyxDQUFDLENBQUMsQ0FBQyxFQUFFRixLQUFLLENBQUMsR0FBRyxDQUFDLENBQUNJLElBQUksQ0FBQyxFQUFFLENBQUM7VUFDL0QsSUFBSUgsVUFBVSxpQkFBS2QsSUFBSSxDQUFDZ0IsQ0FBQyxDQUFDLDRDQUFQLFFBQVNFLFFBQVEsRUFBRSxHQUFFO1lBQ3ZDLE9BQU8sS0FBSztVQUNiO1FBQ0Q7UUFDQSxPQUFPLElBQUk7TUFDWixDQUFDLENBQUM7SUFDSDtFQUNEO0VBRUF6Qix1QkFBdUIsQ0FBQ0ssd0JBQXdCLEdBQUdBLHdCQUF3QjtFQUMzRUwsdUJBQXVCLENBQUNVLGdDQUFnQyxHQUFHQSxnQ0FBZ0M7RUFDM0ZWLHVCQUF1QixDQUFDYyw2QkFBNkIsR0FBR0EsNkJBQTZCO0VBQ3JGO0FBQ0E7QUFDQTtFQUZBLE9BR2VkLHVCQUF1QjtBQUFBIn0=