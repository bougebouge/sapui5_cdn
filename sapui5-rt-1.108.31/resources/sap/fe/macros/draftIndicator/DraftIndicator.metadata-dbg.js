/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/MacroMetadata"], function (MacroMetadata) {
  "use strict";

  var DraftIndicator = MacroMetadata.extend("sap.fe.macros.DraftIndicator", {
    /**
     * Name of the macro control.
     */
    name: "DraftIndicator",
    /**
     * Namespace of the macro control
     */
    namespace: "sap.fe.macros",
    /**
     * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
     */
    fragment: "sap.fe.macros.draftIndicator.DraftIndicator",
    /**
     * The metadata describing the macro control.
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
         * ID of the DraftIndicator
         */
        id: {
          type: "string"
        },
        /**
         * Property added to associate the label with the DraftIndicator
         */
        ariaLabelledBy: {
          type: "string"
        },
        /**
         * Manadatory field DraftIndicator
         */
        DraftIndicatorType: {
          type: "sap.ui.mdc.DraftIndicatorType",
          required: true,
          defaultValue: "IconAndText"
        },
        /**
         * Mandatory context to the EntitySet
         */
        entitySet: {
          type: "sap.ui.model.Context",
          required: true,
          $kind: ["EntitySet", "NavigationProperty"]
        },
        isDraftIndicatorVisible: {
          type: "boolean",
          required: true,
          defaultValue: false
        },
        indicatorType: {
          type: "string"
        },
        "class": {
          type: "string"
        }
      }
    }
  });
  return DraftIndicator;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmFmdEluZGljYXRvciIsIk1hY3JvTWV0YWRhdGEiLCJleHRlbmQiLCJuYW1lIiwibmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJtZXRhZGF0YSIsInN0ZXJlb3R5cGUiLCJwcm9wZXJ0aWVzIiwiaWQiLCJ0eXBlIiwiYXJpYUxhYmVsbGVkQnkiLCJEcmFmdEluZGljYXRvclR5cGUiLCJyZXF1aXJlZCIsImRlZmF1bHRWYWx1ZSIsImVudGl0eVNldCIsIiRraW5kIiwiaXNEcmFmdEluZGljYXRvclZpc2libGUiLCJpbmRpY2F0b3JUeXBlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJEcmFmdEluZGljYXRvci5tZXRhZGF0YS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBjbGFzc2Rlc2NcbiAqIE1hY3JvIGZvciBjcmVhdGluZyBhIERyYWZ0SW5kaWNhdG9yIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86RHJhZnRJbmRpY2F0b3JcbiAqICAgaWQ9XCJTb21lSURcIlxuICogLyZndDtcbiAqIDwvcHJlPlxuICogQGNsYXNzIHNhcC5mZS5tYWNyb3MuRHJhZnRJbmRpY2F0b3JcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKi9cbmltcG9ydCBNYWNyb01ldGFkYXRhIGZyb20gXCJzYXAvZmUvbWFjcm9zL01hY3JvTWV0YWRhdGFcIjtcblxuY29uc3QgRHJhZnRJbmRpY2F0b3IgPSBNYWNyb01ldGFkYXRhLmV4dGVuZChcInNhcC5mZS5tYWNyb3MuRHJhZnRJbmRpY2F0b3JcIiwge1xuXHQvKipcblx0ICogTmFtZSBvZiB0aGUgbWFjcm8gY29udHJvbC5cblx0ICovXG5cdG5hbWU6IFwiRHJhZnRJbmRpY2F0b3JcIixcblx0LyoqXG5cdCAqIE5hbWVzcGFjZSBvZiB0aGUgbWFjcm8gY29udHJvbFxuXHQgKi9cblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIixcblx0LyoqXG5cdCAqIEZyYWdtZW50IHNvdXJjZSBvZiB0aGUgbWFjcm8gKG9wdGlvbmFsKSAtIGlmIG5vdCBzZXQsIGZyYWdtZW50IGlzIGdlbmVyYXRlZCBmcm9tIG5hbWVzcGFjZSBhbmQgbmFtZVxuXHQgKi9cblx0ZnJhZ21lbnQ6IFwic2FwLmZlLm1hY3Jvcy5kcmFmdEluZGljYXRvci5EcmFmdEluZGljYXRvclwiLFxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0YWRhdGEgZGVzY3JpYmluZyB0aGUgbWFjcm8gY29udHJvbC5cblx0ICovXG5cdG1ldGFkYXRhOiB7XG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lIG1hY3JvIHN0ZXJlb3R5cGUgZm9yIGRvY3VtZW50YXRpb25cblx0XHQgKi9cblx0XHRzdGVyZW90eXBlOiBcInhtbG1hY3JvXCIsXG5cdFx0LyoqXG5cdFx0ICogUHJvcGVydGllcy5cblx0XHQgKi9cblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHQvKipcblx0XHRcdCAqIElEIG9mIHRoZSBEcmFmdEluZGljYXRvclxuXHRcdFx0ICovXG5cdFx0XHRpZDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBQcm9wZXJ0eSBhZGRlZCB0byBhc3NvY2lhdGUgdGhlIGxhYmVsIHdpdGggdGhlIERyYWZ0SW5kaWNhdG9yXG5cdFx0XHQgKi9cblx0XHRcdGFyaWFMYWJlbGxlZEJ5OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIE1hbmFkYXRvcnkgZmllbGQgRHJhZnRJbmRpY2F0b3Jcblx0XHRcdCAqL1xuXHRcdFx0RHJhZnRJbmRpY2F0b3JUeXBlOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1kYy5EcmFmdEluZGljYXRvclR5cGVcIixcblx0XHRcdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogXCJJY29uQW5kVGV4dFwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBNYW5kYXRvcnkgY29udGV4dCB0byB0aGUgRW50aXR5U2V0XG5cdFx0XHQgKi9cblx0XHRcdGVudGl0eVNldDoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdFx0XHQka2luZDogW1wiRW50aXR5U2V0XCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCJdXG5cdFx0XHR9LFxuXHRcdFx0aXNEcmFmdEluZGljYXRvclZpc2libGU6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdFx0XHR9LFxuXHRcdFx0aW5kaWNhdG9yVHlwZToge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0XCJjbGFzc1wiOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0pO1xuZXhwb3J0IGRlZmF1bHQgRHJhZnRJbmRpY2F0b3I7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFpQkEsSUFBTUEsY0FBYyxHQUFHQyxhQUFhLENBQUNDLE1BQU0sQ0FBQyw4QkFBOEIsRUFBRTtJQUMzRTtBQUNEO0FBQ0E7SUFDQ0MsSUFBSSxFQUFFLGdCQUFnQjtJQUN0QjtBQUNEO0FBQ0E7SUFDQ0MsU0FBUyxFQUFFLGVBQWU7SUFDMUI7QUFDRDtBQUNBO0lBQ0NDLFFBQVEsRUFBRSw2Q0FBNkM7SUFFdkQ7QUFDRDtBQUNBO0lBQ0NDLFFBQVEsRUFBRTtNQUNUO0FBQ0Y7QUFDQTtNQUNFQyxVQUFVLEVBQUUsVUFBVTtNQUN0QjtBQUNGO0FBQ0E7TUFDRUMsVUFBVSxFQUFFO1FBQ1g7QUFDSDtBQUNBO1FBQ0dDLEVBQUUsRUFBRTtVQUNIQyxJQUFJLEVBQUU7UUFDUCxDQUFDO1FBQ0Q7QUFDSDtBQUNBO1FBQ0dDLGNBQWMsRUFBRTtVQUNmRCxJQUFJLEVBQUU7UUFDUCxDQUFDO1FBQ0Q7QUFDSDtBQUNBO1FBQ0dFLGtCQUFrQixFQUFFO1VBQ25CRixJQUFJLEVBQUUsK0JBQStCO1VBQ3JDRyxRQUFRLEVBQUUsSUFBSTtVQUNkQyxZQUFZLEVBQUU7UUFDZixDQUFDO1FBQ0Q7QUFDSDtBQUNBO1FBQ0dDLFNBQVMsRUFBRTtVQUNWTCxJQUFJLEVBQUUsc0JBQXNCO1VBQzVCRyxRQUFRLEVBQUUsSUFBSTtVQUNkRyxLQUFLLEVBQUUsQ0FBQyxXQUFXLEVBQUUsb0JBQW9CO1FBQzFDLENBQUM7UUFDREMsdUJBQXVCLEVBQUU7VUFDeEJQLElBQUksRUFBRSxTQUFTO1VBQ2ZHLFFBQVEsRUFBRSxJQUFJO1VBQ2RDLFlBQVksRUFBRTtRQUNmLENBQUM7UUFDREksYUFBYSxFQUFFO1VBQ2RSLElBQUksRUFBRTtRQUNQLENBQUM7UUFDRCxPQUFPLEVBQUU7VUFDUkEsSUFBSSxFQUFFO1FBQ1A7TUFDRDtJQUNEO0VBQ0QsQ0FBQyxDQUFDO0VBQUMsT0FDWVYsY0FBYztBQUFBIn0=