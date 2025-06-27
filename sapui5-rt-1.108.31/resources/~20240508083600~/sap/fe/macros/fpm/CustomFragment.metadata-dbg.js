/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/MacroMetadata"], function (MacroMetadata) {
  "use strict";

  var CustomFragment = MacroMetadata.extend("sap.fe.macros.fpm.CustomFragment", {
    /**
     * Name
     */
    name: "CustomFragment",
    /**
     * Namespace
     */
    namespace: "sap.fe.macros.fpm",
    /**
     * Fragment source
     */
    fragment: "sap.fe.macros.fpm.CustomFragment",
    /**
     * Metadata
     */
    metadata: {
      /**
       * Properties.
       */
      properties: {
        /**
         * Context Path
         */
        contextPath: {
          type: "sap.ui.model.Context",
          required: false
        },
        /**
         * ID of the custom fragment
         */
        id: {
          type: "string",
          required: true
        },
        /**
         *  Name of the custom fragment
         */
        fragmentName: {
          type: "string",
          required: true
        }
      },
      events: {}
    },
    create: function (oProps) {
      oProps.fragmentInstanceName = oProps.fragmentName + "-JS".replace(/\//g, ".");
      return oProps;
    }
  });
  return CustomFragment;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXN0b21GcmFnbWVudCIsIk1hY3JvTWV0YWRhdGEiLCJleHRlbmQiLCJuYW1lIiwibmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJtZXRhZGF0YSIsInByb3BlcnRpZXMiLCJjb250ZXh0UGF0aCIsInR5cGUiLCJyZXF1aXJlZCIsImlkIiwiZnJhZ21lbnROYW1lIiwiZXZlbnRzIiwiY3JlYXRlIiwib1Byb3BzIiwiZnJhZ21lbnRJbnN0YW5jZU5hbWUiLCJyZXBsYWNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDdXN0b21GcmFnbWVudC5tZXRhZGF0YS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBjbGFzc2Rlc2NcbiAqIENvbnRlbnQgb2YgYSBjdXN0b20gZnJhZ21lbnRcbiAqIEBjbGFzcyBzYXAuZmUubWFjcm9zLmZwbS5DdXN0b21GcmFnbWVudFxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuaW1wb3J0IE1hY3JvTWV0YWRhdGEgZnJvbSBcInNhcC9mZS9tYWNyb3MvTWFjcm9NZXRhZGF0YVwiO1xuXG5jb25zdCBDdXN0b21GcmFnbWVudCA9IE1hY3JvTWV0YWRhdGEuZXh0ZW5kKFwic2FwLmZlLm1hY3Jvcy5mcG0uQ3VzdG9tRnJhZ21lbnRcIiwge1xuXHQvKipcblx0ICogTmFtZVxuXHQgKi9cblx0bmFtZTogXCJDdXN0b21GcmFnbWVudFwiLFxuXHQvKipcblx0ICogTmFtZXNwYWNlXG5cdCAqL1xuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5mcG1cIixcblx0LyoqXG5cdCAqIEZyYWdtZW50IHNvdXJjZVxuXHQgKi9cblx0ZnJhZ21lbnQ6IFwic2FwLmZlLm1hY3Jvcy5mcG0uQ3VzdG9tRnJhZ21lbnRcIixcblxuXHQvKipcblx0ICogTWV0YWRhdGFcblx0ICovXG5cdG1ldGFkYXRhOiB7XG5cdFx0LyoqXG5cdFx0ICogUHJvcGVydGllcy5cblx0XHQgKi9cblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHQvKipcblx0XHRcdCAqIENvbnRleHQgUGF0aFxuXHRcdFx0ICovXG5cdFx0XHRjb250ZXh0UGF0aDoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdHJlcXVpcmVkOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSUQgb2YgdGhlIGN1c3RvbSBmcmFnbWVudFxuXHRcdFx0ICovXG5cdFx0XHRpZDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogIE5hbWUgb2YgdGhlIGN1c3RvbSBmcmFnbWVudFxuXHRcdFx0ICovXG5cdFx0XHRmcmFnbWVudE5hbWU6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0cmVxdWlyZWQ6IHRydWVcblx0XHRcdH1cblx0XHR9LFxuXHRcdGV2ZW50czoge31cblx0fSxcblx0Y3JlYXRlOiBmdW5jdGlvbiAob1Byb3BzOiBhbnkpIHtcblx0XHRvUHJvcHMuZnJhZ21lbnRJbnN0YW5jZU5hbWUgPSBvUHJvcHMuZnJhZ21lbnROYW1lICsgXCItSlNcIi5yZXBsYWNlKC9cXC8vZywgXCIuXCIpO1xuXG5cdFx0cmV0dXJuIG9Qcm9wcztcblx0fVxufSk7XG5leHBvcnQgZGVmYXVsdCBDdXN0b21GcmFnbWVudDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQVVBLElBQU1BLGNBQWMsR0FBR0MsYUFBYSxDQUFDQyxNQUFNLENBQUMsa0NBQWtDLEVBQUU7SUFDL0U7QUFDRDtBQUNBO0lBQ0NDLElBQUksRUFBRSxnQkFBZ0I7SUFDdEI7QUFDRDtBQUNBO0lBQ0NDLFNBQVMsRUFBRSxtQkFBbUI7SUFDOUI7QUFDRDtBQUNBO0lBQ0NDLFFBQVEsRUFBRSxrQ0FBa0M7SUFFNUM7QUFDRDtBQUNBO0lBQ0NDLFFBQVEsRUFBRTtNQUNUO0FBQ0Y7QUFDQTtNQUNFQyxVQUFVLEVBQUU7UUFDWDtBQUNIO0FBQ0E7UUFDR0MsV0FBVyxFQUFFO1VBQ1pDLElBQUksRUFBRSxzQkFBc0I7VUFDNUJDLFFBQVEsRUFBRTtRQUNYLENBQUM7UUFDRDtBQUNIO0FBQ0E7UUFDR0MsRUFBRSxFQUFFO1VBQ0hGLElBQUksRUFBRSxRQUFRO1VBQ2RDLFFBQVEsRUFBRTtRQUNYLENBQUM7UUFDRDtBQUNIO0FBQ0E7UUFDR0UsWUFBWSxFQUFFO1VBQ2JILElBQUksRUFBRSxRQUFRO1VBQ2RDLFFBQVEsRUFBRTtRQUNYO01BQ0QsQ0FBQztNQUNERyxNQUFNLEVBQUUsQ0FBQztJQUNWLENBQUM7SUFDREMsTUFBTSxFQUFFLFVBQVVDLE1BQVcsRUFBRTtNQUM5QkEsTUFBTSxDQUFDQyxvQkFBb0IsR0FBR0QsTUFBTSxDQUFDSCxZQUFZLEdBQUcsS0FBSyxDQUFDSyxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztNQUU3RSxPQUFPRixNQUFNO0lBQ2Q7RUFDRCxDQUFDLENBQUM7RUFBQyxPQUNZZixjQUFjO0FBQUEifQ==