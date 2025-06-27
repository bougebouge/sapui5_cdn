/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/MacroMetadata"], function (MacroMetadata) {
  "use strict";

  var Contact = MacroMetadata.extend("sap.fe.macros.contact.Contact", {
    /**
     * Name of the macro control.
     */
    name: "Contact",
    /**
     * Namespace of the macro control
     */
    namespace: "sap.fe.macros",
    /**
     * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
     */
    fragment: "sap.fe.macros.contact.Contact",
    /**
     * The metadata describing the macro control.
     */
    metadata: {
      /**
       * Define macro stereotype for documentation
       */
      stereotype: "xmlmacro",
      /**
       * Location of the designtime info
       */
      designtime: "sap/fe/macros/Contact.designtime",
      /**
       * Properties.
       */
      properties: {
        /**
         * Prefix added to the generated ID of the field
         */
        idPrefix: {
          type: "string"
        },
        /**
         * Metadata path to the Contact
         */
        contact: {
          type: "sap.ui.model.Context",
          $Type: ["com.sap.vocabularies.Communication.v1.ContactType"],
          required: true
        },
        /**
         * Property added to associate the label and the contact
         */
        ariaLabelledBy: {
          type: "string"
        },
        /**
         * Boolean visible property
         */
        visible: {
          type: "boolean"
        }
      },
      events: {}
    }
  });
  return Contact;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb250YWN0IiwiTWFjcm9NZXRhZGF0YSIsImV4dGVuZCIsIm5hbWUiLCJuYW1lc3BhY2UiLCJmcmFnbWVudCIsIm1ldGFkYXRhIiwic3RlcmVvdHlwZSIsImRlc2lnbnRpbWUiLCJwcm9wZXJ0aWVzIiwiaWRQcmVmaXgiLCJ0eXBlIiwiY29udGFjdCIsIiRUeXBlIiwicmVxdWlyZWQiLCJhcmlhTGFiZWxsZWRCeSIsInZpc2libGUiLCJldmVudHMiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbnRhY3QubWV0YWRhdGEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAY2xhc3NkZXNjXG4gKiBNYWNybyBmb3IgY3JlYXRpbmcgYSBDb250YWN0IGJhc2VkIG9uIHByb3ZpZGVkIE9EYXRhIHY0IG1ldGFkYXRhLlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpDb250YWN0XG4gKiAgIGlkPVwic29tZUlEXCJcbiAqICAgY29udGFjdD1cIntjb250YWN0Pn1cIlxuICogICBkYXRhRmllbGQ9XCJ7ZGF0YUZpZWxkPn1cIlxuICogLyZndDtcbiAqIDwvcHJlPlxuICogQGNsYXNzIHNhcC5mZS5tYWNyb3MuQ29udGFjdFxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHByaXZhdGVcbiAqIEBleHBlcmltZW50YWxcbiAqL1xuaW1wb3J0IE1hY3JvTWV0YWRhdGEgZnJvbSBcInNhcC9mZS9tYWNyb3MvTWFjcm9NZXRhZGF0YVwiO1xuXG5jb25zdCBDb250YWN0ID0gTWFjcm9NZXRhZGF0YS5leHRlbmQoXCJzYXAuZmUubWFjcm9zLmNvbnRhY3QuQ29udGFjdFwiLCB7XG5cdC8qKlxuXHQgKiBOYW1lIG9mIHRoZSBtYWNybyBjb250cm9sLlxuXHQgKi9cblx0bmFtZTogXCJDb250YWN0XCIsXG5cdC8qKlxuXHQgKiBOYW1lc3BhY2Ugb2YgdGhlIG1hY3JvIGNvbnRyb2xcblx0ICovXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsXG5cdC8qKlxuXHQgKiBGcmFnbWVudCBzb3VyY2Ugb2YgdGhlIG1hY3JvIChvcHRpb25hbCkgLSBpZiBub3Qgc2V0LCBmcmFnbWVudCBpcyBnZW5lcmF0ZWQgZnJvbSBuYW1lc3BhY2UgYW5kIG5hbWVcblx0ICovXG5cdGZyYWdtZW50OiBcInNhcC5mZS5tYWNyb3MuY29udGFjdC5Db250YWN0XCIsXG5cdC8qKlxuXHQgKiBUaGUgbWV0YWRhdGEgZGVzY3JpYmluZyB0aGUgbWFjcm8gY29udHJvbC5cblx0ICovXG5cdG1ldGFkYXRhOiB7XG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lIG1hY3JvIHN0ZXJlb3R5cGUgZm9yIGRvY3VtZW50YXRpb25cblx0XHQgKi9cblx0XHRzdGVyZW90eXBlOiBcInhtbG1hY3JvXCIsXG5cdFx0LyoqXG5cdFx0ICogTG9jYXRpb24gb2YgdGhlIGRlc2lnbnRpbWUgaW5mb1xuXHRcdCAqL1xuXHRcdGRlc2lnbnRpbWU6IFwic2FwL2ZlL21hY3Jvcy9Db250YWN0LmRlc2lnbnRpbWVcIixcblx0XHQvKipcblx0XHQgKiBQcm9wZXJ0aWVzLlxuXHRcdCAqL1xuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdC8qKlxuXHRcdFx0ICogUHJlZml4IGFkZGVkIHRvIHRoZSBnZW5lcmF0ZWQgSUQgb2YgdGhlIGZpZWxkXG5cdFx0XHQgKi9cblx0XHRcdGlkUHJlZml4OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIENvbnRhY3Rcblx0XHRcdCAqL1xuXHRcdFx0Y29udGFjdDoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdCRUeXBlOiBbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkNvbnRhY3RUeXBlXCJdLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogUHJvcGVydHkgYWRkZWQgdG8gYXNzb2NpYXRlIHRoZSBsYWJlbCBhbmQgdGhlIGNvbnRhY3Rcblx0XHRcdCAqL1xuXHRcdFx0YXJpYUxhYmVsbGVkQnk6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogQm9vbGVhbiB2aXNpYmxlIHByb3BlcnR5XG5cdFx0XHQgKi9cblx0XHRcdHZpc2libGU6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCJcblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZXZlbnRzOiB7fVxuXHR9XG59KTtcbmV4cG9ydCBkZWZhdWx0IENvbnRhY3Q7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFvQkEsSUFBTUEsT0FBTyxHQUFHQyxhQUFhLENBQUNDLE1BQU0sQ0FBQywrQkFBK0IsRUFBRTtJQUNyRTtBQUNEO0FBQ0E7SUFDQ0MsSUFBSSxFQUFFLFNBQVM7SUFDZjtBQUNEO0FBQ0E7SUFDQ0MsU0FBUyxFQUFFLGVBQWU7SUFDMUI7QUFDRDtBQUNBO0lBQ0NDLFFBQVEsRUFBRSwrQkFBK0I7SUFDekM7QUFDRDtBQUNBO0lBQ0NDLFFBQVEsRUFBRTtNQUNUO0FBQ0Y7QUFDQTtNQUNFQyxVQUFVLEVBQUUsVUFBVTtNQUN0QjtBQUNGO0FBQ0E7TUFDRUMsVUFBVSxFQUFFLGtDQUFrQztNQUM5QztBQUNGO0FBQ0E7TUFDRUMsVUFBVSxFQUFFO1FBQ1g7QUFDSDtBQUNBO1FBQ0dDLFFBQVEsRUFBRTtVQUNUQyxJQUFJLEVBQUU7UUFDUCxDQUFDO1FBQ0Q7QUFDSDtBQUNBO1FBQ0dDLE9BQU8sRUFBRTtVQUNSRCxJQUFJLEVBQUUsc0JBQXNCO1VBQzVCRSxLQUFLLEVBQUUsQ0FBQyxtREFBbUQsQ0FBQztVQUM1REMsUUFBUSxFQUFFO1FBQ1gsQ0FBQztRQUNEO0FBQ0g7QUFDQTtRQUNHQyxjQUFjLEVBQUU7VUFDZkosSUFBSSxFQUFFO1FBQ1AsQ0FBQztRQUNEO0FBQ0g7QUFDQTtRQUNHSyxPQUFPLEVBQUU7VUFDUkwsSUFBSSxFQUFFO1FBQ1A7TUFDRCxDQUFDO01BRURNLE1BQU0sRUFBRSxDQUFDO0lBQ1Y7RUFDRCxDQUFDLENBQUM7RUFBQyxPQUNZakIsT0FBTztBQUFBIn0=