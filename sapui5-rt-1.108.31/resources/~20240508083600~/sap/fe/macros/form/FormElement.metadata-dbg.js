/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/MacroMetadata"], function (BindingToolkit, MacroMetadata) {
  "use strict";

  var resolveBindingString = BindingToolkit.resolveBindingString;
  var ifElse = BindingToolkit.ifElse;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  /**
   * @classdesc
   * Building block used to create a form element containing a label and a field.
   * @hideconstructor
   * @name sap.fe.macros.FormElement
   * @public
   * @since 1.90.0
   */
  var FormElement = MacroMetadata.extend("sap.fe.macros.form.FormElement", {
    /**
     * Name
     */
    name: "FormElement",
    /**
     * Namespace
     */
    namespace: "sap.fe.macros",
    /**
     * Fragment source
     */
    fragment: "sap.fe.macros.form.FormElement",
    /**
     * Metadata
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
         * Defines the relative path of the property in the metamodel, based on the current contextPath.
         *
         * @public
         */
        metaPath: {
          type: "sap.ui.model.Context",
          required: true
        },
        /**
         * Defines the path of the context used in the current page or block. This setting is defined by the framework.
         *
         * @public
         */
        contextPath: {
          type: "sap.ui.model.Context",
          required: true
        },
        /**
         * The identifier of the table control.
         *
         * @public
         */
        id: {
          type: "string",
          required: true
        },
        /**
         * Label shown for the field. If not set, the label from the annotations will be shown.
         *
         * @public
         */
        label: {
          type: "string",
          required: false
        },
        /**
         * 	If set to false, the FormElement is not rendered.
         *
         * 	@public
         */
        visible: {
          type: "boolean",
          required: false
        },
        key: {
          type: "string"
        }
      },
      aggregations: {
        /**
         * Optional aggregation of controls that should be displayed inside the FormElement.
         * If not set, a default Field Macro control will be rendered
         *
         * @public
         */
        "fields": {
          type: "sap.ui.core.Control",
          isDefault: true
        }
      }
    },
    create: function (oProps, oControlConfig, oAppComponent, oAggregations) {
      if (oProps.label === undefined) {
        oProps.label = oProps.metaPath.getModel().getProperty("".concat(oProps.metaPath.sPath, "@com.sap.vocabularies.Common.v1.Label"));
      }
      if (oProps.editable !== undefined) {
        oProps.editModeExpression = compileExpression(ifElse(equal(resolveBindingString(oProps.editable, "boolean"), true), "Editable", "Display"));
      } else {
        oProps.editModeExpression = undefined;
      }
      oProps.fieldsAvailable = oAggregations.fields !== undefined;
      return oProps;
    }
  });
  return FormElement;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtRWxlbWVudCIsIk1hY3JvTWV0YWRhdGEiLCJleHRlbmQiLCJuYW1lIiwibmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJtZXRhZGF0YSIsInN0ZXJlb3R5cGUiLCJwcm9wZXJ0aWVzIiwibWV0YVBhdGgiLCJ0eXBlIiwicmVxdWlyZWQiLCJjb250ZXh0UGF0aCIsImlkIiwibGFiZWwiLCJ2aXNpYmxlIiwia2V5IiwiYWdncmVnYXRpb25zIiwiaXNEZWZhdWx0IiwiY3JlYXRlIiwib1Byb3BzIiwib0NvbnRyb2xDb25maWciLCJvQXBwQ29tcG9uZW50Iiwib0FnZ3JlZ2F0aW9ucyIsInVuZGVmaW5lZCIsImdldE1vZGVsIiwiZ2V0UHJvcGVydHkiLCJzUGF0aCIsImVkaXRhYmxlIiwiZWRpdE1vZGVFeHByZXNzaW9uIiwiY29tcGlsZUV4cHJlc3Npb24iLCJpZkVsc2UiLCJlcXVhbCIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiZmllbGRzQXZhaWxhYmxlIiwiZmllbGRzIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGb3JtRWxlbWVudC5tZXRhZGF0YS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBjb21waWxlRXhwcmVzc2lvbiwgZXF1YWwsIGlmRWxzZSwgcmVzb2x2ZUJpbmRpbmdTdHJpbmcgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IE1hY3JvTWV0YWRhdGEgZnJvbSBcInNhcC9mZS9tYWNyb3MvTWFjcm9NZXRhZGF0YVwiO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2NcbiAqIEJ1aWxkaW5nIGJsb2NrIHVzZWQgdG8gY3JlYXRlIGEgZm9ybSBlbGVtZW50IGNvbnRhaW5pbmcgYSBsYWJlbCBhbmQgYSBmaWVsZC5cbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBuYW1lIHNhcC5mZS5tYWNyb3MuRm9ybUVsZW1lbnRcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjkwLjBcbiAqL1xuY29uc3QgRm9ybUVsZW1lbnQgPSBNYWNyb01ldGFkYXRhLmV4dGVuZChcInNhcC5mZS5tYWNyb3MuZm9ybS5Gb3JtRWxlbWVudFwiLCB7XG5cdC8qKlxuXHQgKiBOYW1lXG5cdCAqL1xuXHRuYW1lOiBcIkZvcm1FbGVtZW50XCIsXG5cdC8qKlxuXHQgKiBOYW1lc3BhY2Vcblx0ICovXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsXG5cdC8qKlxuXHQgKiBGcmFnbWVudCBzb3VyY2Vcblx0ICovXG5cdGZyYWdtZW50OiBcInNhcC5mZS5tYWNyb3MuZm9ybS5Gb3JtRWxlbWVudFwiLFxuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YVxuXHQgKi9cblx0bWV0YWRhdGE6IHtcblx0XHQvKipcblx0XHQgKiBEZWZpbmUgbWFjcm8gc3RlcmVvdHlwZSBmb3IgZG9jdW1lbnRhdGlvblxuXHRcdCAqL1xuXHRcdHN0ZXJlb3R5cGU6IFwieG1sbWFjcm9cIixcblx0XHQvKipcblx0XHQgKiBQcm9wZXJ0aWVzLlxuXHRcdCAqL1xuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdC8qKlxuXHRcdFx0ICogRGVmaW5lcyB0aGUgcmVsYXRpdmUgcGF0aCBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1ldGFtb2RlbCwgYmFzZWQgb24gdGhlIGN1cnJlbnQgY29udGV4dFBhdGguXG5cdFx0XHQgKlxuXHRcdFx0ICogQHB1YmxpY1xuXHRcdFx0ICovXG5cdFx0XHRtZXRhUGF0aDoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdHJlcXVpcmVkOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBEZWZpbmVzIHRoZSBwYXRoIG9mIHRoZSBjb250ZXh0IHVzZWQgaW4gdGhlIGN1cnJlbnQgcGFnZSBvciBibG9jay4gVGhpcyBzZXR0aW5nIGlzIGRlZmluZWQgYnkgdGhlIGZyYW1ld29yay5cblx0XHRcdCAqXG5cdFx0XHQgKiBAcHVibGljXG5cdFx0XHQgKi9cblx0XHRcdGNvbnRleHRQYXRoOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRcdFx0cmVxdWlyZWQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSBpZGVudGlmaWVyIG9mIHRoZSB0YWJsZSBjb250cm9sLlxuXHRcdFx0ICpcblx0XHRcdCAqIEBwdWJsaWNcblx0XHRcdCAqL1xuXHRcdFx0aWQ6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0cmVxdWlyZWQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIExhYmVsIHNob3duIGZvciB0aGUgZmllbGQuIElmIG5vdCBzZXQsIHRoZSBsYWJlbCBmcm9tIHRoZSBhbm5vdGF0aW9ucyB3aWxsIGJlIHNob3duLlxuXHRcdFx0ICpcblx0XHRcdCAqIEBwdWJsaWNcblx0XHRcdCAqL1xuXHRcdFx0bGFiZWw6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0cmVxdWlyZWQ6IGZhbHNlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBcdElmIHNldCB0byBmYWxzZSwgdGhlIEZvcm1FbGVtZW50IGlzIG5vdCByZW5kZXJlZC5cblx0XHRcdCAqXG5cdFx0XHQgKiBcdEBwdWJsaWNcblx0XHRcdCAqL1xuXHRcdFx0dmlzaWJsZToge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0cmVxdWlyZWQ6IGZhbHNlXG5cdFx0XHR9LFxuXHRcdFx0a2V5OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH1cblx0XHR9LFxuXHRcdGFnZ3JlZ2F0aW9uczoge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBPcHRpb25hbCBhZ2dyZWdhdGlvbiBvZiBjb250cm9scyB0aGF0IHNob3VsZCBiZSBkaXNwbGF5ZWQgaW5zaWRlIHRoZSBGb3JtRWxlbWVudC5cblx0XHRcdCAqIElmIG5vdCBzZXQsIGEgZGVmYXVsdCBGaWVsZCBNYWNybyBjb250cm9sIHdpbGwgYmUgcmVuZGVyZWRcblx0XHRcdCAqXG5cdFx0XHQgKiBAcHVibGljXG5cdFx0XHQgKi9cblx0XHRcdFwiZmllbGRzXCI6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsXG5cdFx0XHRcdGlzRGVmYXVsdDogdHJ1ZVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0Y3JlYXRlOiBmdW5jdGlvbiAob1Byb3BzOiBhbnksIG9Db250cm9sQ29uZmlnOiBhbnksIG9BcHBDb21wb25lbnQ6IGFueSwgb0FnZ3JlZ2F0aW9uczogYW55KSB7XG5cdFx0aWYgKG9Qcm9wcy5sYWJlbCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRvUHJvcHMubGFiZWwgPSBvUHJvcHMubWV0YVBhdGguZ2V0TW9kZWwoKS5nZXRQcm9wZXJ0eShgJHtvUHJvcHMubWV0YVBhdGguc1BhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbGApO1xuXHRcdH1cblx0XHRpZiAob1Byb3BzLmVkaXRhYmxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdG9Qcm9wcy5lZGl0TW9kZUV4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0aWZFbHNlKGVxdWFsKHJlc29sdmVCaW5kaW5nU3RyaW5nKG9Qcm9wcy5lZGl0YWJsZSwgXCJib29sZWFuXCIpLCB0cnVlKSwgXCJFZGl0YWJsZVwiLCBcIkRpc3BsYXlcIilcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9Qcm9wcy5lZGl0TW9kZUV4cHJlc3Npb24gPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdG9Qcm9wcy5maWVsZHNBdmFpbGFibGUgPSBvQWdncmVnYXRpb25zLmZpZWxkcyAhPT0gdW5kZWZpbmVkO1xuXG5cdFx0cmV0dXJuIG9Qcm9wcztcblx0fVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEZvcm1FbGVtZW50O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztF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