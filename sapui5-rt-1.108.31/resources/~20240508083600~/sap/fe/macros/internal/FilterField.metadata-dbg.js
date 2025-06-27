/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/MacroMetadata"], function (MacroMetadata) {
  "use strict";

  var FilterField = MacroMetadata.extend("sap.fe.macros.internal.FilterField", {
    /**
     * Name of the macro control.
     */
    name: "FilterField",
    /**
     * Namespace of the macro control.
     */
    namespace: "sap.fe.macros.internal",
    /**
     * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name.
     */
    fragment: "sap.fe.macros.internal.FilterField",
    /**
     * The metadata describing the macro control.
     */
    metadata: {
      /**
       * Macro stereotype for documentation generation. Not visible in documentation.
       */
      stereotype: "xmlmacro",
      /**
       * Location of the designtime information.
       */
      designtime: "sap/fe/macros/internal/FilterField.designtime",
      /**
       * Properties.
       */
      properties: {
        /**
         * A prefix that is added to the generated ID of the filter field.
         */
        idPrefix: {
          type: "string",
          defaultValue: "FilterField"
        },
        /**
         * A prefix that is added to the generated ID of the value help used for the filter field.
         */
        vhIdPrefix: {
          type: "string",
          defaultValue: "FilterFieldValueHelp"
        },
        /**
         * Mandatory context to the EntityType
         */
        contextPath: {
          type: "sap.ui.model.Context",
          required: true
        },
        /**
         * Defines the metadata path to the property.
         */
        property: {
          type: "sap.ui.model.Context",
          required: true,
          $kind: ["Property"]
        },
        /**
         * Defines the metadata path to the value list.
         */
        _valueList: {
          type: "sap.ui.model.Context",
          required: false
        },
        /**
         * Specifies the Sematic Date Range option for the filter field.
         */
        useSemanticDateRange: {
          type: "boolean",
          defaultValue: true
        },
        /**
         * settings from the manifest settings.
         */
        settings: {
          type: "string",
          defaultValue: ""
        },
        navigationPrefix: {
          type: "string"
        },
        /**
         * visual filter settings for filter field
         */
        visualFilter: {
          type: "sap.ui.model.Context"
        },
        _visualFilter: {
          type: "boolean"
        },
        /**
         * Specifies that it is mandatory to add input to the filter field
         */
        required: {
          type: "boolean",
          defaultValue: false
        }
      },
      events: {}
    }
  });
  return FilterField;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJGaWVsZCIsIk1hY3JvTWV0YWRhdGEiLCJleHRlbmQiLCJuYW1lIiwibmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJtZXRhZGF0YSIsInN0ZXJlb3R5cGUiLCJkZXNpZ250aW1lIiwicHJvcGVydGllcyIsImlkUHJlZml4IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsInZoSWRQcmVmaXgiLCJjb250ZXh0UGF0aCIsInJlcXVpcmVkIiwicHJvcGVydHkiLCIka2luZCIsIl92YWx1ZUxpc3QiLCJ1c2VTZW1hbnRpY0RhdGVSYW5nZSIsInNldHRpbmdzIiwibmF2aWdhdGlvblByZWZpeCIsInZpc3VhbEZpbHRlciIsIl92aXN1YWxGaWx0ZXIiLCJldmVudHMiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpbHRlckZpZWxkLm1ldGFkYXRhLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGNsYXNzZGVzY1xuICogQnVpbGRpbmcgYmxvY2sgZm9yIGNyZWF0aW5nIGEgRmlsdGVyRmllbGQgYmFzZWQgb24gdGhlIHByb3ZpZGVkIE9EYXRhIFY0IG1ldGFkYXRhLlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpGaWx0ZXJGaWVsZFxuICogICBpZFByZWZpeD1cIlNvbWVQcmVmaXhcIlxuICogICB2aElkUHJlZml4PVwiU29tZVZoUHJlZml4XCJcbiAqICAgZW50aXR5U2V0PVwie2VudGl0eVNldD59XCJcbiAqICAgcHJvcGVydHk9XCJ7ZW50aXR5U2V0Pi4vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkcy8wLyRQcm9wZXJ0eVBhdGh9XCJcbiAqIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqIEBjbGFzcyBzYXAuZmUubWFjcm9zLmludGVybmFsLkZpbHRlckZpZWxkXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICovXG5pbXBvcnQgTWFjcm9NZXRhZGF0YSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9NYWNyb01ldGFkYXRhXCI7XG5cbmNvbnN0IEZpbHRlckZpZWxkID0gTWFjcm9NZXRhZGF0YS5leHRlbmQoXCJzYXAuZmUubWFjcm9zLmludGVybmFsLkZpbHRlckZpZWxkXCIsIHtcblx0LyoqXG5cdCAqIE5hbWUgb2YgdGhlIG1hY3JvIGNvbnRyb2wuXG5cdCAqL1xuXHRuYW1lOiBcIkZpbHRlckZpZWxkXCIsXG5cdC8qKlxuXHQgKiBOYW1lc3BhY2Ugb2YgdGhlIG1hY3JvIGNvbnRyb2wuXG5cdCAqL1xuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHQvKipcblx0ICogRnJhZ21lbnQgc291cmNlIG9mIHRoZSBtYWNybyAob3B0aW9uYWwpIC0gaWYgbm90IHNldCwgZnJhZ21lbnQgaXMgZ2VuZXJhdGVkIGZyb20gbmFtZXNwYWNlIGFuZCBuYW1lLlxuXHQgKi9cblx0ZnJhZ21lbnQ6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5GaWx0ZXJGaWVsZFwiLFxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0YWRhdGEgZGVzY3JpYmluZyB0aGUgbWFjcm8gY29udHJvbC5cblx0ICovXG5cdG1ldGFkYXRhOiB7XG5cdFx0LyoqXG5cdFx0ICogTWFjcm8gc3RlcmVvdHlwZSBmb3IgZG9jdW1lbnRhdGlvbiBnZW5lcmF0aW9uLiBOb3QgdmlzaWJsZSBpbiBkb2N1bWVudGF0aW9uLlxuXHRcdCAqL1xuXHRcdHN0ZXJlb3R5cGU6IFwieG1sbWFjcm9cIixcblx0XHQvKipcblx0XHQgKiBMb2NhdGlvbiBvZiB0aGUgZGVzaWdudGltZSBpbmZvcm1hdGlvbi5cblx0XHQgKi9cblx0XHRkZXNpZ250aW1lOiBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvRmlsdGVyRmllbGQuZGVzaWdudGltZVwiLFxuXHRcdC8qKlxuXHRcdCAqIFByb3BlcnRpZXMuXG5cdFx0ICovXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBBIHByZWZpeCB0aGF0IGlzIGFkZGVkIHRvIHRoZSBnZW5lcmF0ZWQgSUQgb2YgdGhlIGZpbHRlciBmaWVsZC5cblx0XHRcdCAqL1xuXHRcdFx0aWRQcmVmaXg6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBcIkZpbHRlckZpZWxkXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEEgcHJlZml4IHRoYXQgaXMgYWRkZWQgdG8gdGhlIGdlbmVyYXRlZCBJRCBvZiB0aGUgdmFsdWUgaGVscCB1c2VkIGZvciB0aGUgZmlsdGVyIGZpZWxkLlxuXHRcdFx0ICovXG5cdFx0XHR2aElkUHJlZml4OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogXCJGaWx0ZXJGaWVsZFZhbHVlSGVscFwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBNYW5kYXRvcnkgY29udGV4dCB0byB0aGUgRW50aXR5VHlwZVxuXHRcdFx0ICovXG5cdFx0XHRjb250ZXh0UGF0aDoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdHJlcXVpcmVkOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBEZWZpbmVzIHRoZSBtZXRhZGF0YSBwYXRoIHRvIHRoZSBwcm9wZXJ0eS5cblx0XHRcdCAqL1xuXHRcdFx0cHJvcGVydHk6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRcdFx0JGtpbmQ6IFtcIlByb3BlcnR5XCJdXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBEZWZpbmVzIHRoZSBtZXRhZGF0YSBwYXRoIHRvIHRoZSB2YWx1ZSBsaXN0LlxuXHRcdFx0ICovXG5cdFx0XHRfdmFsdWVMaXN0OiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRcdFx0cmVxdWlyZWQ6IGZhbHNlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTcGVjaWZpZXMgdGhlIFNlbWF0aWMgRGF0ZSBSYW5nZSBvcHRpb24gZm9yIHRoZSBmaWx0ZXIgZmllbGQuXG5cdFx0XHQgKi9cblx0XHRcdHVzZVNlbWFudGljRGF0ZVJhbmdlOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIHNldHRpbmdzIGZyb20gdGhlIG1hbmlmZXN0IHNldHRpbmdzLlxuXHRcdFx0ICovXG5cdFx0XHRzZXR0aW5nczoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IFwiXCJcblx0XHRcdH0sXG5cdFx0XHRuYXZpZ2F0aW9uUHJlZml4OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIHZpc3VhbCBmaWx0ZXIgc2V0dGluZ3MgZm9yIGZpbHRlciBmaWVsZFxuXHRcdFx0ICovXG5cdFx0XHR2aXN1YWxGaWx0ZXI6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdFx0XHR9LFxuXHRcdFx0X3Zpc3VhbEZpbHRlcjoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU3BlY2lmaWVzIHRoYXQgaXQgaXMgbWFuZGF0b3J5IHRvIGFkZCBpbnB1dCB0byB0aGUgZmlsdGVyIGZpZWxkXG5cdFx0XHQgKi9cblx0XHRcdHJlcXVpcmVkOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGV2ZW50czoge31cblx0fVxufSk7XG5leHBvcnQgZGVmYXVsdCBGaWx0ZXJGaWVsZDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQXFCQSxJQUFNQSxXQUFXLEdBQUdDLGFBQWEsQ0FBQ0MsTUFBTSxDQUFDLG9DQUFvQyxFQUFFO0lBQzlFO0FBQ0Q7QUFDQTtJQUNDQyxJQUFJLEVBQUUsYUFBYTtJQUNuQjtBQUNEO0FBQ0E7SUFDQ0MsU0FBUyxFQUFFLHdCQUF3QjtJQUNuQztBQUNEO0FBQ0E7SUFDQ0MsUUFBUSxFQUFFLG9DQUFvQztJQUU5QztBQUNEO0FBQ0E7SUFDQ0MsUUFBUSxFQUFFO01BQ1Q7QUFDRjtBQUNBO01BQ0VDLFVBQVUsRUFBRSxVQUFVO01BQ3RCO0FBQ0Y7QUFDQTtNQUNFQyxVQUFVLEVBQUUsK0NBQStDO01BQzNEO0FBQ0Y7QUFDQTtNQUNFQyxVQUFVLEVBQUU7UUFDWDtBQUNIO0FBQ0E7UUFDR0MsUUFBUSxFQUFFO1VBQ1RDLElBQUksRUFBRSxRQUFRO1VBQ2RDLFlBQVksRUFBRTtRQUNmLENBQUM7UUFDRDtBQUNIO0FBQ0E7UUFDR0MsVUFBVSxFQUFFO1VBQ1hGLElBQUksRUFBRSxRQUFRO1VBQ2RDLFlBQVksRUFBRTtRQUNmLENBQUM7UUFDRDtBQUNIO0FBQ0E7UUFDR0UsV0FBVyxFQUFFO1VBQ1pILElBQUksRUFBRSxzQkFBc0I7VUFDNUJJLFFBQVEsRUFBRTtRQUNYLENBQUM7UUFDRDtBQUNIO0FBQ0E7UUFDR0MsUUFBUSxFQUFFO1VBQ1RMLElBQUksRUFBRSxzQkFBc0I7VUFDNUJJLFFBQVEsRUFBRSxJQUFJO1VBQ2RFLEtBQUssRUFBRSxDQUFDLFVBQVU7UUFDbkIsQ0FBQztRQUNEO0FBQ0g7QUFDQTtRQUNHQyxVQUFVLEVBQUU7VUFDWFAsSUFBSSxFQUFFLHNCQUFzQjtVQUM1QkksUUFBUSxFQUFFO1FBQ1gsQ0FBQztRQUNEO0FBQ0g7QUFDQTtRQUNHSSxvQkFBb0IsRUFBRTtVQUNyQlIsSUFBSSxFQUFFLFNBQVM7VUFDZkMsWUFBWSxFQUFFO1FBQ2YsQ0FBQztRQUNEO0FBQ0g7QUFDQTtRQUNHUSxRQUFRLEVBQUU7VUFDVFQsSUFBSSxFQUFFLFFBQVE7VUFDZEMsWUFBWSxFQUFFO1FBQ2YsQ0FBQztRQUNEUyxnQkFBZ0IsRUFBRTtVQUNqQlYsSUFBSSxFQUFFO1FBQ1AsQ0FBQztRQUNEO0FBQ0g7QUFDQTtRQUNHVyxZQUFZLEVBQUU7VUFDYlgsSUFBSSxFQUFFO1FBQ1AsQ0FBQztRQUNEWSxhQUFhLEVBQUU7VUFDZFosSUFBSSxFQUFFO1FBQ1AsQ0FBQztRQUNEO0FBQ0g7QUFDQTtRQUNHSSxRQUFRLEVBQUU7VUFDVEosSUFBSSxFQUFFLFNBQVM7VUFDZkMsWUFBWSxFQUFFO1FBQ2Y7TUFDRCxDQUFDO01BRURZLE1BQU0sRUFBRSxDQUFDO0lBQ1Y7RUFDRCxDQUFDLENBQUM7RUFBQyxPQUNZeEIsV0FBVztBQUFBIn0=