/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/fl/changeHandler/BaseRename"], function (BaseRename) {
  "use strict";

  var StashableHBoxFlexibility = {
    "stashControl": "default",
    "unstashControl": "default",
    "renameHeaderFacet": BaseRename.createRenameChangeHandler({
      propertyName: "title",
      translationTextType: "XFLD",
      changePropertyName: "headerFacetTitle"
    })
  };
  return StashableHBoxFlexibility;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdGFzaGFibGVIQm94RmxleGliaWxpdHkiLCJCYXNlUmVuYW1lIiwiY3JlYXRlUmVuYW1lQ2hhbmdlSGFuZGxlciIsInByb3BlcnR5TmFtZSIsInRyYW5zbGF0aW9uVGV4dFR5cGUiLCJjaGFuZ2VQcm9wZXJ0eU5hbWUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlN0YXNoYWJsZUhCb3guZmxleGliaWxpdHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IEJhc2VSZW5hbWUgZnJvbSBcInNhcC91aS9mbC9jaGFuZ2VIYW5kbGVyL0Jhc2VSZW5hbWVcIjtcblxuY29uc3QgU3Rhc2hhYmxlSEJveEZsZXhpYmlsaXR5ID0ge1xuXHRcInN0YXNoQ29udHJvbFwiOiBcImRlZmF1bHRcIixcblx0XCJ1bnN0YXNoQ29udHJvbFwiOiBcImRlZmF1bHRcIixcblx0XCJyZW5hbWVIZWFkZXJGYWNldFwiOiBCYXNlUmVuYW1lLmNyZWF0ZVJlbmFtZUNoYW5nZUhhbmRsZXIoe1xuXHRcdHByb3BlcnR5TmFtZTogXCJ0aXRsZVwiLFxuXHRcdHRyYW5zbGF0aW9uVGV4dFR5cGU6IFwiWEZMRFwiLFxuXHRcdGNoYW5nZVByb3BlcnR5TmFtZTogXCJoZWFkZXJGYWNldFRpdGxlXCJcblx0fSlcbn07XG5cbmV4cG9ydCBkZWZhdWx0IFN0YXNoYWJsZUhCb3hGbGV4aWJpbGl0eTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQUVBLElBQU1BLHdCQUF3QixHQUFHO0lBQ2hDLGNBQWMsRUFBRSxTQUFTO0lBQ3pCLGdCQUFnQixFQUFFLFNBQVM7SUFDM0IsbUJBQW1CLEVBQUVDLFVBQVUsQ0FBQ0MseUJBQXlCLENBQUM7TUFDekRDLFlBQVksRUFBRSxPQUFPO01BQ3JCQyxtQkFBbUIsRUFBRSxNQUFNO01BQzNCQyxrQkFBa0IsRUFBRTtJQUNyQixDQUFDO0VBQ0YsQ0FBQztFQUFDLE9BRWFMLHdCQUF3QjtBQUFBIn0=