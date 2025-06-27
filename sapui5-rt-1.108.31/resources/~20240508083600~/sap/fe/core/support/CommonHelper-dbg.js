/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/IssueManager", "sap/ui/support/library"], function (IssueManager, SupportLib) {
  "use strict";

  var _exports = {};
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategory = IssueManager.IssueCategory;
  var Categories = SupportLib.Categories,
    // Accessibility, Performance, Memory, ...
    Severity = SupportLib.Severity,
    // Hint, Warning, Error
    Audiences = SupportLib.Audiences; // Control, Internal, Application

  //**********************************************************
  // Rule Definitions
  //**********************************************************

  // Rule checks if objectPage componentContainer height is set
  _exports.Categories = Categories;
  _exports.Audiences = Audiences;
  _exports.Severity = Severity;
  var getSeverity = function (oSeverity) {
    switch (oSeverity) {
      case IssueSeverity.Low:
        return Severity.Low;
      case IssueSeverity.High:
        return Severity.High;
      case IssueSeverity.Medium:
        return Severity.Medium;
      // no default
    }
  };
  _exports.getSeverity = getSeverity;
  var getIssueByCategory = function (oIssueManager, oCoreFacade, issueCategoryType, issueSubCategoryType) {
    var mComponents = oCoreFacade.getComponents();
    var oAppComponent;
    Object.keys(mComponents).forEach(function (sKey) {
      var _oComponent$getMetada, _oComponent$getMetada2;
      var oComponent = mComponents[sKey];
      if ((oComponent === null || oComponent === void 0 ? void 0 : (_oComponent$getMetada = oComponent.getMetadata()) === null || _oComponent$getMetada === void 0 ? void 0 : (_oComponent$getMetada2 = _oComponent$getMetada.getParent()) === null || _oComponent$getMetada2 === void 0 ? void 0 : _oComponent$getMetada2.getName()) === "sap.fe.core.AppComponent") {
        oAppComponent = oComponent;
      }
    });
    if (oAppComponent) {
      var aIssues = oAppComponent.getDiagnostics().getIssuesByCategory(IssueCategory[issueCategoryType], issueSubCategoryType);
      aIssues.forEach(function (oElement) {
        oIssueManager.addIssue({
          severity: getSeverity(oElement.severity),
          details: oElement.details,
          context: {
            id: oElement.category
          }
        });
      });
    }
  };
  _exports.getIssueByCategory = getIssueByCategory;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDYXRlZ29yaWVzIiwiU3VwcG9ydExpYiIsIlNldmVyaXR5IiwiQXVkaWVuY2VzIiwiZ2V0U2V2ZXJpdHkiLCJvU2V2ZXJpdHkiLCJJc3N1ZVNldmVyaXR5IiwiTG93IiwiSGlnaCIsIk1lZGl1bSIsImdldElzc3VlQnlDYXRlZ29yeSIsIm9Jc3N1ZU1hbmFnZXIiLCJvQ29yZUZhY2FkZSIsImlzc3VlQ2F0ZWdvcnlUeXBlIiwiaXNzdWVTdWJDYXRlZ29yeVR5cGUiLCJtQ29tcG9uZW50cyIsImdldENvbXBvbmVudHMiLCJvQXBwQ29tcG9uZW50IiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJzS2V5Iiwib0NvbXBvbmVudCIsImdldE1ldGFkYXRhIiwiZ2V0UGFyZW50IiwiZ2V0TmFtZSIsImFJc3N1ZXMiLCJnZXREaWFnbm9zdGljcyIsImdldElzc3Vlc0J5Q2F0ZWdvcnkiLCJJc3N1ZUNhdGVnb3J5Iiwib0VsZW1lbnQiLCJhZGRJc3N1ZSIsInNldmVyaXR5IiwiZGV0YWlscyIsImNvbnRleHQiLCJpZCIsImNhdGVnb3J5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb21tb25IZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBEZWZpbmVzIHN1cHBvcnQgcnVsZXMgb2YgdGhlIE9iamVjdFBhZ2VIZWFkZXIgY29udHJvbCBvZiBzYXAudXhhcCBsaWJyYXJ5LlxuICovXG5pbXBvcnQgdHlwZSBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHsgSXNzdWVDYXRlZ29yeSwgSXNzdWVTZXZlcml0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSB7IElzc3VlRGVmaW5pdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9zdXBwb3J0L0RpYWdub3N0aWNzXCI7XG5pbXBvcnQgU3VwcG9ydExpYiBmcm9tIFwic2FwL3VpL3N1cHBvcnQvbGlicmFyeVwiO1xuXG5leHBvcnQgY29uc3QgQ2F0ZWdvcmllcyA9IFN1cHBvcnRMaWIuQ2F0ZWdvcmllcywgLy8gQWNjZXNzaWJpbGl0eSwgUGVyZm9ybWFuY2UsIE1lbW9yeSwgLi4uXG5cdFNldmVyaXR5ID0gU3VwcG9ydExpYi5TZXZlcml0eSwgLy8gSGludCwgV2FybmluZywgRXJyb3Jcblx0QXVkaWVuY2VzID0gU3VwcG9ydExpYi5BdWRpZW5jZXM7IC8vIENvbnRyb2wsIEludGVybmFsLCBBcHBsaWNhdGlvblxuXG4vLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbi8vIFJ1bGUgRGVmaW5pdGlvbnNcbi8vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxuXG4vLyBSdWxlIGNoZWNrcyBpZiBvYmplY3RQYWdlIGNvbXBvbmVudENvbnRhaW5lciBoZWlnaHQgaXMgc2V0XG5cbmV4cG9ydCBjb25zdCBnZXRTZXZlcml0eSA9IGZ1bmN0aW9uIChvU2V2ZXJpdHk6IElzc3VlU2V2ZXJpdHkpIHtcblx0c3dpdGNoIChvU2V2ZXJpdHkpIHtcblx0XHRjYXNlIElzc3VlU2V2ZXJpdHkuTG93OlxuXHRcdFx0cmV0dXJuIFNldmVyaXR5Lkxvdztcblx0XHRjYXNlIElzc3VlU2V2ZXJpdHkuSGlnaDpcblx0XHRcdHJldHVybiBTZXZlcml0eS5IaWdoO1xuXHRcdGNhc2UgSXNzdWVTZXZlcml0eS5NZWRpdW06XG5cdFx0XHRyZXR1cm4gU2V2ZXJpdHkuTWVkaXVtO1xuXHRcdC8vIG5vIGRlZmF1bHRcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGdldElzc3VlQnlDYXRlZ29yeSA9IGZ1bmN0aW9uIChcblx0b0lzc3VlTWFuYWdlcjogYW55LFxuXHRvQ29yZUZhY2FkZTogYW55IC8qb1Njb3BlOiBhbnkqLyxcblx0aXNzdWVDYXRlZ29yeVR5cGU6IElzc3VlQ2F0ZWdvcnksXG5cdGlzc3VlU3ViQ2F0ZWdvcnlUeXBlPzogc3RyaW5nXG4pIHtcblx0Y29uc3QgbUNvbXBvbmVudHMgPSBvQ29yZUZhY2FkZS5nZXRDb21wb25lbnRzKCk7XG5cdGxldCBvQXBwQ29tcG9uZW50ITogQXBwQ29tcG9uZW50O1xuXHRPYmplY3Qua2V5cyhtQ29tcG9uZW50cykuZm9yRWFjaCgoc0tleSkgPT4ge1xuXHRcdGNvbnN0IG9Db21wb25lbnQgPSBtQ29tcG9uZW50c1tzS2V5XTtcblx0XHRpZiAob0NvbXBvbmVudD8uZ2V0TWV0YWRhdGEoKT8uZ2V0UGFyZW50KCk/LmdldE5hbWUoKSA9PT0gXCJzYXAuZmUuY29yZS5BcHBDb21wb25lbnRcIikge1xuXHRcdFx0b0FwcENvbXBvbmVudCA9IG9Db21wb25lbnQ7XG5cdFx0fVxuXHR9KTtcblx0aWYgKG9BcHBDb21wb25lbnQpIHtcblx0XHRjb25zdCBhSXNzdWVzID0gb0FwcENvbXBvbmVudC5nZXREaWFnbm9zdGljcygpLmdldElzc3Vlc0J5Q2F0ZWdvcnkoSXNzdWVDYXRlZ29yeVtpc3N1ZUNhdGVnb3J5VHlwZV0sIGlzc3VlU3ViQ2F0ZWdvcnlUeXBlKTtcblxuXHRcdGFJc3N1ZXMuZm9yRWFjaChmdW5jdGlvbiAob0VsZW1lbnQ6IElzc3VlRGVmaW5pdGlvbikge1xuXHRcdFx0b0lzc3VlTWFuYWdlci5hZGRJc3N1ZSh7XG5cdFx0XHRcdHNldmVyaXR5OiBnZXRTZXZlcml0eShvRWxlbWVudC5zZXZlcml0eSksXG5cdFx0XHRcdGRldGFpbHM6IG9FbGVtZW50LmRldGFpbHMsXG5cdFx0XHRcdGNvbnRleHQ6IHtcblx0XHRcdFx0XHRpZDogb0VsZW1lbnQuY2F0ZWdvcnlcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdH1cbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7RUFRTyxJQUFNQSxVQUFVLEdBQUdDLFVBQVUsQ0FBQ0QsVUFBVTtJQUFFO0lBQ2hERSxRQUFRLEdBQUdELFVBQVUsQ0FBQ0MsUUFBUTtJQUFFO0lBQ2hDQyxTQUFTLEdBQUdGLFVBQVUsQ0FBQ0UsU0FBUyxDQUFDLENBQUM7O0VBRW5DO0VBQ0E7RUFDQTs7RUFFQTtFQUFBO0VBQUE7RUFBQTtFQUVPLElBQU1DLFdBQVcsR0FBRyxVQUFVQyxTQUF3QixFQUFFO0lBQzlELFFBQVFBLFNBQVM7TUFDaEIsS0FBS0MsYUFBYSxDQUFDQyxHQUFHO1FBQ3JCLE9BQU9MLFFBQVEsQ0FBQ0ssR0FBRztNQUNwQixLQUFLRCxhQUFhLENBQUNFLElBQUk7UUFDdEIsT0FBT04sUUFBUSxDQUFDTSxJQUFJO01BQ3JCLEtBQUtGLGFBQWEsQ0FBQ0csTUFBTTtRQUN4QixPQUFPUCxRQUFRLENBQUNPLE1BQU07TUFDdkI7SUFBQTtFQUVGLENBQUM7RUFBQztFQUVLLElBQU1DLGtCQUFrQixHQUFHLFVBQ2pDQyxhQUFrQixFQUNsQkMsV0FBZ0IsRUFDaEJDLGlCQUFnQyxFQUNoQ0Msb0JBQTZCLEVBQzVCO0lBQ0QsSUFBTUMsV0FBVyxHQUFHSCxXQUFXLENBQUNJLGFBQWEsRUFBRTtJQUMvQyxJQUFJQyxhQUE0QjtJQUNoQ0MsTUFBTSxDQUFDQyxJQUFJLENBQUNKLFdBQVcsQ0FBQyxDQUFDSyxPQUFPLENBQUMsVUFBQ0MsSUFBSSxFQUFLO01BQUE7TUFDMUMsSUFBTUMsVUFBVSxHQUFHUCxXQUFXLENBQUNNLElBQUksQ0FBQztNQUNwQyxJQUFJLENBQUFDLFVBQVUsYUFBVkEsVUFBVSxnREFBVkEsVUFBVSxDQUFFQyxXQUFXLEVBQUUsb0ZBQXpCLHNCQUEyQkMsU0FBUyxFQUFFLDJEQUF0Qyx1QkFBd0NDLE9BQU8sRUFBRSxNQUFLLDBCQUEwQixFQUFFO1FBQ3JGUixhQUFhLEdBQUdLLFVBQVU7TUFDM0I7SUFDRCxDQUFDLENBQUM7SUFDRixJQUFJTCxhQUFhLEVBQUU7TUFDbEIsSUFBTVMsT0FBTyxHQUFHVCxhQUFhLENBQUNVLGNBQWMsRUFBRSxDQUFDQyxtQkFBbUIsQ0FBQ0MsYUFBYSxDQUFDaEIsaUJBQWlCLENBQUMsRUFBRUMsb0JBQW9CLENBQUM7TUFFMUhZLE9BQU8sQ0FBQ04sT0FBTyxDQUFDLFVBQVVVLFFBQXlCLEVBQUU7UUFDcERuQixhQUFhLENBQUNvQixRQUFRLENBQUM7VUFDdEJDLFFBQVEsRUFBRTVCLFdBQVcsQ0FBQzBCLFFBQVEsQ0FBQ0UsUUFBUSxDQUFDO1VBQ3hDQyxPQUFPLEVBQUVILFFBQVEsQ0FBQ0csT0FBTztVQUN6QkMsT0FBTyxFQUFFO1lBQ1JDLEVBQUUsRUFBRUwsUUFBUSxDQUFDTTtVQUNkO1FBQ0QsQ0FBQyxDQUFDO01BQ0gsQ0FBQyxDQUFDO0lBQ0g7RUFDRCxDQUFDO0VBQUM7RUFBQTtBQUFBIn0=