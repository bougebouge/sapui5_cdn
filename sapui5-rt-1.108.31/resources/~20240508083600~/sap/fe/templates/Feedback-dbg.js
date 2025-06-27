/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core"], function (Core) {
  "use strict";

  var _exports = {};
  var TriggerType;
  (function (TriggerType) {
    TriggerType["action"] = "actions";
    TriggerType["standardAction"] = "standardActions";
  })(TriggerType || (TriggerType = {}));
  _exports.TriggerType = TriggerType;
  var StandardActions;
  /**
   * Asking user for feedback
   *
   * @alias sap.fe.templates.Feedback
   * @private
   */
  (function (StandardActions) {
    StandardActions["save"] = "save";
  })(StandardActions || (StandardActions = {}));
  _exports.StandardActions = StandardActions;
  var channel = "sap.feedback";
  var feature = "inapp.feature";

  /**
   * Triggers a feedback survey.
   *
   * @memberof sap.fe.templates.Feedback
   * @param areaId The area id of the application.
   * @param triggerName The name of the trigger.
   * @param payload A flat list of key/values to be passed to the survey.
   * @alias sap.fe.templates.Feedback#triggerSurvey
   * @private
   */
  function triggerSurvey(areaId, triggerName, payload) {
    var parameters = {
      "areaId": areaId,
      "triggerName": triggerName,
      "payload": payload
    };
    Core.getEventBus().publish(channel, feature, parameters);
  }

  /**
   * Triggers a feedback survey configured for a given action on the current page.
   *
   * @memberof sap.fe.templates.Feedback
   * @param view The view which is checked for a feedback configuration.
   * @param action The name of the action.
   * @param triggerType The trigger type of the action (actions|standardActions)
   * @alias sap.fe.templates.Feedback#triggerConfiguredSurvey
   * @private
   */
  _exports.triggerSurvey = triggerSurvey;
  function triggerConfiguredSurvey(view, action, triggerType) {
    var _view$getViewData, _view$getViewData$con, _feedbackConfig$trigg;
    var feedbackConfig = (_view$getViewData = view.getViewData()) === null || _view$getViewData === void 0 ? void 0 : (_view$getViewData$con = _view$getViewData.content) === null || _view$getViewData$con === void 0 ? void 0 : _view$getViewData$con.feedback;
    var surveyConfig = feedbackConfig === null || feedbackConfig === void 0 ? void 0 : (_feedbackConfig$trigg = feedbackConfig[triggerType]) === null || _feedbackConfig$trigg === void 0 ? void 0 : _feedbackConfig$trigg[action];
    if (surveyConfig) {
      triggerSurvey(surveyConfig.areaId, surveyConfig.triggerName, surveyConfig.payload);
    }
  }
  _exports.triggerConfiguredSurvey = triggerConfiguredSurvey;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUcmlnZ2VyVHlwZSIsIlN0YW5kYXJkQWN0aW9ucyIsImNoYW5uZWwiLCJmZWF0dXJlIiwidHJpZ2dlclN1cnZleSIsImFyZWFJZCIsInRyaWdnZXJOYW1lIiwicGF5bG9hZCIsInBhcmFtZXRlcnMiLCJDb3JlIiwiZ2V0RXZlbnRCdXMiLCJwdWJsaXNoIiwidHJpZ2dlckNvbmZpZ3VyZWRTdXJ2ZXkiLCJ2aWV3IiwiYWN0aW9uIiwidHJpZ2dlclR5cGUiLCJmZWVkYmFja0NvbmZpZyIsImdldFZpZXdEYXRhIiwiY29udGVudCIsImZlZWRiYWNrIiwic3VydmV5Q29uZmlnIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGZWVkYmFjay50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcblxudHlwZSBTdXJ2ZXlDb25maWcgPSB7XG5cdGFyZWFJZDogc3RyaW5nO1xuXHR0cmlnZ2VyTmFtZTogc3RyaW5nO1xuXHRwYXlsb2FkPzogb2JqZWN0O1xufTtcblxuZXhwb3J0IGVudW0gVHJpZ2dlclR5cGUge1xuXHRhY3Rpb24gPSBcImFjdGlvbnNcIixcblx0c3RhbmRhcmRBY3Rpb24gPSBcInN0YW5kYXJkQWN0aW9uc1wiXG59XG5cbmV4cG9ydCBlbnVtIFN0YW5kYXJkQWN0aW9ucyB7XG5cdHNhdmUgPSBcInNhdmVcIlxufVxuXG4vKipcbiAqIEFza2luZyB1c2VyIGZvciBmZWVkYmFja1xuICpcbiAqIEBhbGlhcyBzYXAuZmUudGVtcGxhdGVzLkZlZWRiYWNrXG4gKiBAcHJpdmF0ZVxuICovXG5cbmNvbnN0IGNoYW5uZWwgPSBcInNhcC5mZWVkYmFja1wiO1xuY29uc3QgZmVhdHVyZSA9IFwiaW5hcHAuZmVhdHVyZVwiO1xuXG4vKipcbiAqIFRyaWdnZXJzIGEgZmVlZGJhY2sgc3VydmV5LlxuICpcbiAqIEBtZW1iZXJvZiBzYXAuZmUudGVtcGxhdGVzLkZlZWRiYWNrXG4gKiBAcGFyYW0gYXJlYUlkIFRoZSBhcmVhIGlkIG9mIHRoZSBhcHBsaWNhdGlvbi5cbiAqIEBwYXJhbSB0cmlnZ2VyTmFtZSBUaGUgbmFtZSBvZiB0aGUgdHJpZ2dlci5cbiAqIEBwYXJhbSBwYXlsb2FkIEEgZmxhdCBsaXN0IG9mIGtleS92YWx1ZXMgdG8gYmUgcGFzc2VkIHRvIHRoZSBzdXJ2ZXkuXG4gKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5GZWVkYmFjayN0cmlnZ2VyU3VydmV5XG4gKiBAcHJpdmF0ZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJpZ2dlclN1cnZleShhcmVhSWQ6IHN0cmluZywgdHJpZ2dlck5hbWU6IHN0cmluZywgcGF5bG9hZDogYW55KSB7XG5cdGNvbnN0IHBhcmFtZXRlcnMgPSB7XG5cdFx0XCJhcmVhSWRcIjogYXJlYUlkLFxuXHRcdFwidHJpZ2dlck5hbWVcIjogdHJpZ2dlck5hbWUsXG5cdFx0XCJwYXlsb2FkXCI6IHBheWxvYWRcblx0fTtcblx0Q29yZS5nZXRFdmVudEJ1cygpLnB1Ymxpc2goY2hhbm5lbCwgZmVhdHVyZSwgcGFyYW1ldGVycyk7XG59XG5cbi8qKlxuICogVHJpZ2dlcnMgYSBmZWVkYmFjayBzdXJ2ZXkgY29uZmlndXJlZCBmb3IgYSBnaXZlbiBhY3Rpb24gb24gdGhlIGN1cnJlbnQgcGFnZS5cbiAqXG4gKiBAbWVtYmVyb2Ygc2FwLmZlLnRlbXBsYXRlcy5GZWVkYmFja1xuICogQHBhcmFtIHZpZXcgVGhlIHZpZXcgd2hpY2ggaXMgY2hlY2tlZCBmb3IgYSBmZWVkYmFjayBjb25maWd1cmF0aW9uLlxuICogQHBhcmFtIGFjdGlvbiBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uLlxuICogQHBhcmFtIHRyaWdnZXJUeXBlIFRoZSB0cmlnZ2VyIHR5cGUgb2YgdGhlIGFjdGlvbiAoYWN0aW9uc3xzdGFuZGFyZEFjdGlvbnMpXG4gKiBAYWxpYXMgc2FwLmZlLnRlbXBsYXRlcy5GZWVkYmFjayN0cmlnZ2VyQ29uZmlndXJlZFN1cnZleVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyaWdnZXJDb25maWd1cmVkU3VydmV5KHZpZXc6IFZpZXcsIGFjdGlvbjogc3RyaW5nLCB0cmlnZ2VyVHlwZTogVHJpZ2dlclR5cGUpIHtcblx0Y29uc3QgZmVlZGJhY2tDb25maWcgPSAodmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSk/LmNvbnRlbnQ/LmZlZWRiYWNrO1xuXHRjb25zdCBzdXJ2ZXlDb25maWcgPSBmZWVkYmFja0NvbmZpZz8uW3RyaWdnZXJUeXBlXT8uW2FjdGlvbl0gYXMgU3VydmV5Q29uZmlnO1xuXHRpZiAoc3VydmV5Q29uZmlnKSB7XG5cdFx0dHJpZ2dlclN1cnZleShzdXJ2ZXlDb25maWcuYXJlYUlkLCBzdXJ2ZXlDb25maWcudHJpZ2dlck5hbWUsIHN1cnZleUNvbmZpZy5wYXlsb2FkKTtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztNQVNZQSxXQUFXO0VBQUEsV0FBWEEsV0FBVztJQUFYQSxXQUFXO0lBQVhBLFdBQVc7RUFBQSxHQUFYQSxXQUFXLEtBQVhBLFdBQVc7RUFBQTtFQUFBLElBS1hDLGVBQWU7RUFJM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTEEsV0FKWUEsZUFBZTtJQUFmQSxlQUFlO0VBQUEsR0FBZkEsZUFBZSxLQUFmQSxlQUFlO0VBQUE7RUFXM0IsSUFBTUMsT0FBTyxHQUFHLGNBQWM7RUFDOUIsSUFBTUMsT0FBTyxHQUFHLGVBQWU7O0VBRS9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sU0FBU0MsYUFBYSxDQUFDQyxNQUFjLEVBQUVDLFdBQW1CLEVBQUVDLE9BQVksRUFBRTtJQUNoRixJQUFNQyxVQUFVLEdBQUc7TUFDbEIsUUFBUSxFQUFFSCxNQUFNO01BQ2hCLGFBQWEsRUFBRUMsV0FBVztNQUMxQixTQUFTLEVBQUVDO0lBQ1osQ0FBQztJQUNERSxJQUFJLENBQUNDLFdBQVcsRUFBRSxDQUFDQyxPQUFPLENBQUNULE9BQU8sRUFBRUMsT0FBTyxFQUFFSyxVQUFVLENBQUM7RUFDekQ7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFUQTtFQVVPLFNBQVNJLHVCQUF1QixDQUFDQyxJQUFVLEVBQUVDLE1BQWMsRUFBRUMsV0FBd0IsRUFBRTtJQUFBO0lBQzdGLElBQU1DLGNBQWMsd0JBQUlILElBQUksQ0FBQ0ksV0FBVyxFQUFFLCtFQUFuQixrQkFBNkJDLE9BQU8sMERBQXBDLHNCQUFzQ0MsUUFBUTtJQUNyRSxJQUFNQyxZQUFZLEdBQUdKLGNBQWMsYUFBZEEsY0FBYyxnREFBZEEsY0FBYyxDQUFHRCxXQUFXLENBQUMsMERBQTdCLHNCQUFnQ0QsTUFBTSxDQUFpQjtJQUM1RSxJQUFJTSxZQUFZLEVBQUU7TUFDakJoQixhQUFhLENBQUNnQixZQUFZLENBQUNmLE1BQU0sRUFBRWUsWUFBWSxDQUFDZCxXQUFXLEVBQUVjLFlBQVksQ0FBQ2IsT0FBTyxDQUFDO0lBQ25GO0VBQ0Q7RUFBQztFQUFBO0FBQUEifQ==