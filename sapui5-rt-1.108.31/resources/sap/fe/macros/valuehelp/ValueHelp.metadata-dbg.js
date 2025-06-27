/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ModelHelper", "sap/fe/macros/MacroMetadata"], function (ModelHelper, MacroMetadata) {
  "use strict";

  var ValueHelp = MacroMetadata.extend("sap.fe.macros.ValueHelp", {
    /**
     * Name of the macro control.
     */
    name: "ValueHelp",
    /**
     * Namespace of the macro control.
     */
    namespace: "sap.fe.macros",
    /**
     * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name.
     */
    fragment: "sap.fe.macros.internal.valuehelp.ValueHelp",
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
      designtime: "sap/fe/macros/valuehelp/ValueHelp.designtime",
      /**
       * Properties.
       */
      properties: {
        /**
         * A prefix that is added to the generated ID of the value help.
         */
        idPrefix: {
          type: "string",
          defaultValue: "ValueHelp"
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
         * Indicator whether the value help is for a filter field.
         */
        conditionModel: {
          type: "string",
          defaultValue: ""
        },
        /**
         * Indicates that that this is a value help of a filter field. Necessary to decide if a
         * validation should occur on the backend or already on the client.
         */
        filterFieldValueHelp: {
          type: "boolean",
          defaultValue: false
        },
        /**
         * Specifies the Sematic Date Range option for the filter field.
         */
        useSemanticDateRange: {
          type: "boolean",
          defaultValue: true
        },
        /**
         * GroupId for the valueHelp table
         */
        requestGroupId: {
          type: "string",
          defaultValue: "",
          computed: true
        },
        /**
         * Specifies whether the ValueHelp can be used with a MultiValueField
         */
        useMultiValueField: {
          type: "boolean",
          defaultValue: false
        },
        navigationPrefix: {
          type: "string"
        },
        collaborationEnabled: {
          type: "boolean",
          computed: true
        }
      },
      events: {}
    },
    create: function (oProps, oControlConfiguration, oAppComponent) {
      var _this = this;
      Object.keys(this.metadata.properties).forEach(function (sPropertyName) {
        var oProperty = _this.metadata.properties[sPropertyName];
        if (oProperty.type === "boolean") {
          if (typeof oProps[sPropertyName] === "string") {
            oProps[sPropertyName] = oProps[sPropertyName] === "true";
          }
        }
      });
      oProps.requestGroupId = "$auto.Workers";
      var oMetaModel = oAppComponent.models.metaModel || oAppComponent.models.entitySet;
      if (ModelHelper.isCollaborationDraftSupported(oMetaModel)) {
        oProps.collaborationEnabled = true;
      }

      // Switch from new mdc:ValueHelp to mdcField:FieldValueHelp
      oProps.useNewValueHelp = location.href.indexOf("sap-fe-oldFieldValueHelp=true") < 0;
      return oProps;
    }
  });
  return ValueHelp;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWx1ZUhlbHAiLCJNYWNyb01ldGFkYXRhIiwiZXh0ZW5kIiwibmFtZSIsIm5hbWVzcGFjZSIsImZyYWdtZW50IiwibWV0YWRhdGEiLCJzdGVyZW90eXBlIiwiZGVzaWdudGltZSIsInByb3BlcnRpZXMiLCJpZFByZWZpeCIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJwcm9wZXJ0eSIsInJlcXVpcmVkIiwiJGtpbmQiLCJjb25kaXRpb25Nb2RlbCIsImZpbHRlckZpZWxkVmFsdWVIZWxwIiwidXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJyZXF1ZXN0R3JvdXBJZCIsImNvbXB1dGVkIiwidXNlTXVsdGlWYWx1ZUZpZWxkIiwibmF2aWdhdGlvblByZWZpeCIsImNvbGxhYm9yYXRpb25FbmFibGVkIiwiZXZlbnRzIiwiY3JlYXRlIiwib1Byb3BzIiwib0NvbnRyb2xDb25maWd1cmF0aW9uIiwib0FwcENvbXBvbmVudCIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwic1Byb3BlcnR5TmFtZSIsIm9Qcm9wZXJ0eSIsIm9NZXRhTW9kZWwiLCJtb2RlbHMiLCJtZXRhTW9kZWwiLCJlbnRpdHlTZXQiLCJNb2RlbEhlbHBlciIsImlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkIiwidXNlTmV3VmFsdWVIZWxwIiwibG9jYXRpb24iLCJocmVmIiwiaW5kZXhPZiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmFsdWVIZWxwLm1ldGFkYXRhLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGNsYXNzZGVzY1xuICogTWFjcm8gZm9yIGNyZWF0aW5nIGEgVmFsdWVIZWxwIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBPRGF0YSBWNCBtZXRhZGF0YS5cbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86VmFsdWVIZWxwXG4gKiAgIGlkUHJlZml4PVwiU29tZVByZWZpeFwiXG4gKiAgIHByb3BlcnR5PVwie3NvbWVQcm9wZXJ0eSZndDt9XCJcbiAqICAgY29uZGl0aW9uTW9kZWw9XCIkZmlsdGVyc1wiXG4gKiAvJmd0O1xuICogPC9wcmU+XG4gKiBAY2xhc3Mgc2FwLmZlLm1hY3Jvcy5WYWx1ZUhlbHBcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IE1hY3JvTWV0YWRhdGEgZnJvbSBcInNhcC9mZS9tYWNyb3MvTWFjcm9NZXRhZGF0YVwiO1xuXG5jb25zdCBWYWx1ZUhlbHAgPSBNYWNyb01ldGFkYXRhLmV4dGVuZChcInNhcC5mZS5tYWNyb3MuVmFsdWVIZWxwXCIsIHtcblx0LyoqXG5cdCAqIE5hbWUgb2YgdGhlIG1hY3JvIGNvbnRyb2wuXG5cdCAqL1xuXHRuYW1lOiBcIlZhbHVlSGVscFwiLFxuXHQvKipcblx0ICogTmFtZXNwYWNlIG9mIHRoZSBtYWNybyBjb250cm9sLlxuXHQgKi9cblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3NcIixcblx0LyoqXG5cdCAqIEZyYWdtZW50IHNvdXJjZSBvZiB0aGUgbWFjcm8gKG9wdGlvbmFsKSAtIGlmIG5vdCBzZXQsIGZyYWdtZW50IGlzIGdlbmVyYXRlZCBmcm9tIG5hbWVzcGFjZSBhbmQgbmFtZS5cblx0ICovXG5cdGZyYWdtZW50OiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwudmFsdWVoZWxwLlZhbHVlSGVscFwiLFxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0YWRhdGEgZGVzY3JpYmluZyB0aGUgbWFjcm8gY29udHJvbC5cblx0ICovXG5cdG1ldGFkYXRhOiB7XG5cdFx0LyoqXG5cdFx0ICogTWFjcm8gc3RlcmVvdHlwZSBmb3IgZG9jdW1lbnRhdGlvbiBnZW5lcmF0aW9uLiBOb3QgdmlzaWJsZSBpbiBkb2N1bWVudGF0aW9uLlxuXHRcdCAqL1xuXHRcdHN0ZXJlb3R5cGU6IFwieG1sbWFjcm9cIixcblx0XHQvKipcblx0XHQgKiBMb2NhdGlvbiBvZiB0aGUgZGVzaWdudGltZSBpbmZvcm1hdGlvbi5cblx0XHQgKi9cblx0XHRkZXNpZ250aW1lOiBcInNhcC9mZS9tYWNyb3MvdmFsdWVoZWxwL1ZhbHVlSGVscC5kZXNpZ250aW1lXCIsXG5cdFx0LyoqXG5cdFx0ICogUHJvcGVydGllcy5cblx0XHQgKi9cblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHQvKipcblx0XHRcdCAqIEEgcHJlZml4IHRoYXQgaXMgYWRkZWQgdG8gdGhlIGdlbmVyYXRlZCBJRCBvZiB0aGUgdmFsdWUgaGVscC5cblx0XHRcdCAqL1xuXHRcdFx0aWRQcmVmaXg6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBcIlZhbHVlSGVscFwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBEZWZpbmVzIHRoZSBtZXRhZGF0YSBwYXRoIHRvIHRoZSBwcm9wZXJ0eS5cblx0XHRcdCAqL1xuXHRcdFx0cHJvcGVydHk6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRcdFx0JGtpbmQ6IFtcIlByb3BlcnR5XCJdXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJbmRpY2F0b3Igd2hldGhlciB0aGUgdmFsdWUgaGVscCBpcyBmb3IgYSBmaWx0ZXIgZmllbGQuXG5cdFx0XHQgKi9cblx0XHRcdGNvbmRpdGlvbk1vZGVsOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogXCJcIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogSW5kaWNhdGVzIHRoYXQgdGhhdCB0aGlzIGlzIGEgdmFsdWUgaGVscCBvZiBhIGZpbHRlciBmaWVsZC4gTmVjZXNzYXJ5IHRvIGRlY2lkZSBpZiBhXG5cdFx0XHQgKiB2YWxpZGF0aW9uIHNob3VsZCBvY2N1ciBvbiB0aGUgYmFja2VuZCBvciBhbHJlYWR5IG9uIHRoZSBjbGllbnQuXG5cdFx0XHQgKi9cblx0XHRcdGZpbHRlckZpZWxkVmFsdWVIZWxwOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTcGVjaWZpZXMgdGhlIFNlbWF0aWMgRGF0ZSBSYW5nZSBvcHRpb24gZm9yIHRoZSBmaWx0ZXIgZmllbGQuXG5cdFx0XHQgKi9cblx0XHRcdHVzZVNlbWFudGljRGF0ZVJhbmdlOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEdyb3VwSWQgZm9yIHRoZSB2YWx1ZUhlbHAgdGFibGVcblx0XHRcdCAqL1xuXHRcdFx0cmVxdWVzdEdyb3VwSWQ6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBcIlwiLFxuXHRcdFx0XHRjb21wdXRlZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU3BlY2lmaWVzIHdoZXRoZXIgdGhlIFZhbHVlSGVscCBjYW4gYmUgdXNlZCB3aXRoIGEgTXVsdGlWYWx1ZUZpZWxkXG5cdFx0XHQgKi9cblx0XHRcdHVzZU11bHRpVmFsdWVGaWVsZDoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBmYWxzZVxuXHRcdFx0fSxcblxuXHRcdFx0bmF2aWdhdGlvblByZWZpeDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0Y29sbGFib3JhdGlvbkVuYWJsZWQ6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdGNvbXB1dGVkOiB0cnVlXG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGV2ZW50czoge31cblx0fSxcblx0Y3JlYXRlOiBmdW5jdGlvbiAob1Byb3BzOiBhbnksIG9Db250cm9sQ29uZmlndXJhdGlvbjogYW55LCBvQXBwQ29tcG9uZW50OiBhbnkpIHtcblx0XHRPYmplY3Qua2V5cyh0aGlzLm1ldGFkYXRhLnByb3BlcnRpZXMpLmZvckVhY2goKHNQcm9wZXJ0eU5hbWUpID0+IHtcblx0XHRcdGNvbnN0IG9Qcm9wZXJ0eSA9IHRoaXMubWV0YWRhdGEucHJvcGVydGllc1tzUHJvcGVydHlOYW1lXTtcblx0XHRcdGlmIChvUHJvcGVydHkudHlwZSA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBvUHJvcHNbc1Byb3BlcnR5TmFtZV0gPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRvUHJvcHNbc1Byb3BlcnR5TmFtZV0gPSBvUHJvcHNbc1Byb3BlcnR5TmFtZV0gPT09IFwidHJ1ZVwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0b1Byb3BzLnJlcXVlc3RHcm91cElkID0gXCIkYXV0by5Xb3JrZXJzXCI7XG5cblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudC5tb2RlbHMubWV0YU1vZGVsIHx8IG9BcHBDb21wb25lbnQubW9kZWxzLmVudGl0eVNldDtcblx0XHRpZiAoTW9kZWxIZWxwZXIuaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQob01ldGFNb2RlbCkpIHtcblx0XHRcdG9Qcm9wcy5jb2xsYWJvcmF0aW9uRW5hYmxlZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gU3dpdGNoIGZyb20gbmV3IG1kYzpWYWx1ZUhlbHAgdG8gbWRjRmllbGQ6RmllbGRWYWx1ZUhlbHBcblx0XHRvUHJvcHMudXNlTmV3VmFsdWVIZWxwID0gbG9jYXRpb24uaHJlZi5pbmRleE9mKFwic2FwLWZlLW9sZEZpZWxkVmFsdWVIZWxwPXRydWVcIikgPCAwO1xuXG5cdFx0cmV0dXJuIG9Qcm9wcztcblx0fVxufSk7XG5leHBvcnQgZGVmYXVsdCBWYWx1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