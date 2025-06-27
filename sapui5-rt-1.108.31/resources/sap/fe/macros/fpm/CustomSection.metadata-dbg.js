/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/MacroMetadata"], function (MacroMetadata) {
  "use strict";

  var CustomSection = MacroMetadata.extend("sap.fe.macros.fpm.CustomSection", {
    /**
     * Name
     */
    name: "CustomSection",
    /**
     * Namespace
     */
    namespace: "sap.fe.macros.fpm",
    /**
     * Fragment source
     */
    fragment: "sap.fe.macros.fpm.CustomSection",
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
          required: true
        },
        /**
         * Section ID
         */
        id: {
          type: "string",
          required: true
        },
        /**
         * Section content fragment name
         * TODO: Get rid of this property. it is required by FE, not by the custom section fragment itself
         */
        fragmentName: {
          type: "string",
          required: true
        },
        /**
         * Section content fragment name
         * TODO: Maybe get rid of this: it is required by FE, not by the custom section fragment itself
         */
        fragmentType: {
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
  return CustomSection;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXN0b21TZWN0aW9uIiwiTWFjcm9NZXRhZGF0YSIsImV4dGVuZCIsIm5hbWUiLCJuYW1lc3BhY2UiLCJmcmFnbWVudCIsIm1ldGFkYXRhIiwicHJvcGVydGllcyIsImNvbnRleHRQYXRoIiwidHlwZSIsInJlcXVpcmVkIiwiaWQiLCJmcmFnbWVudE5hbWUiLCJmcmFnbWVudFR5cGUiLCJldmVudHMiLCJjcmVhdGUiLCJvUHJvcHMiLCJmcmFnbWVudEluc3RhbmNlTmFtZSIsInJlcGxhY2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkN1c3RvbVNlY3Rpb24ubWV0YWRhdGEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAY2xhc3NkZXNjXG4gKiBDb250ZW50IG9mIGEgY3VzdG9tIHNlY3Rpb25cbiAqIEBjbGFzcyBzYXAuZmUubWFjcm9zLmZwbS5DdXN0b21TZWN0aW9uXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICovXG5pbXBvcnQgTWFjcm9NZXRhZGF0YSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9NYWNyb01ldGFkYXRhXCI7XG5cbmNvbnN0IEN1c3RvbVNlY3Rpb24gPSBNYWNyb01ldGFkYXRhLmV4dGVuZChcInNhcC5mZS5tYWNyb3MuZnBtLkN1c3RvbVNlY3Rpb25cIiwge1xuXHQvKipcblx0ICogTmFtZVxuXHQgKi9cblx0bmFtZTogXCJDdXN0b21TZWN0aW9uXCIsXG5cdC8qKlxuXHQgKiBOYW1lc3BhY2Vcblx0ICovXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmZwbVwiLFxuXHQvKipcblx0ICogRnJhZ21lbnQgc291cmNlXG5cdCAqL1xuXHRmcmFnbWVudDogXCJzYXAuZmUubWFjcm9zLmZwbS5DdXN0b21TZWN0aW9uXCIsXG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhXG5cdCAqL1xuXHRtZXRhZGF0YToge1xuXHRcdC8qKlxuXHRcdCAqIFByb3BlcnRpZXMuXG5cdFx0ICovXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBDb250ZXh0IFBhdGhcblx0XHRcdCAqL1xuXHRcdFx0Y29udGV4dFBhdGg6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU2VjdGlvbiBJRFxuXHRcdFx0ICovXG5cdFx0XHRpZDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU2VjdGlvbiBjb250ZW50IGZyYWdtZW50IG5hbWVcblx0XHRcdCAqIFRPRE86IEdldCByaWQgb2YgdGhpcyBwcm9wZXJ0eS4gaXQgaXMgcmVxdWlyZWQgYnkgRkUsIG5vdCBieSB0aGUgY3VzdG9tIHNlY3Rpb24gZnJhZ21lbnQgaXRzZWxmXG5cdFx0XHQgKi9cblx0XHRcdGZyYWdtZW50TmFtZToge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU2VjdGlvbiBjb250ZW50IGZyYWdtZW50IG5hbWVcblx0XHRcdCAqIFRPRE86IE1heWJlIGdldCByaWQgb2YgdGhpczogaXQgaXMgcmVxdWlyZWQgYnkgRkUsIG5vdCBieSB0aGUgY3VzdG9tIHNlY3Rpb24gZnJhZ21lbnQgaXRzZWxmXG5cdFx0XHQgKi9cblx0XHRcdGZyYWdtZW50VHlwZToge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0ZXZlbnRzOiB7fVxuXHR9LFxuXHRjcmVhdGU6IGZ1bmN0aW9uIChvUHJvcHM6IGFueSkge1xuXHRcdG9Qcm9wcy5mcmFnbWVudEluc3RhbmNlTmFtZSA9IG9Qcm9wcy5mcmFnbWVudE5hbWUgKyBcIi1KU1wiLnJlcGxhY2UoL1xcLy9nLCBcIi5cIik7XG5cblx0XHRyZXR1cm4gb1Byb3BzO1xuXHR9XG59KTtcbmV4cG9ydCBkZWZhdWx0IEN1c3RvbVNlY3Rpb247XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7RUFVQSxJQUFNQSxhQUFhLEdBQUdDLGFBQWEsQ0FBQ0MsTUFBTSxDQUFDLGlDQUFpQyxFQUFFO0lBQzdFO0FBQ0Q7QUFDQTtJQUNDQyxJQUFJLEVBQUUsZUFBZTtJQUNyQjtBQUNEO0FBQ0E7SUFDQ0MsU0FBUyxFQUFFLG1CQUFtQjtJQUM5QjtBQUNEO0FBQ0E7SUFDQ0MsUUFBUSxFQUFFLGlDQUFpQztJQUUzQztBQUNEO0FBQ0E7SUFDQ0MsUUFBUSxFQUFFO01BQ1Q7QUFDRjtBQUNBO01BQ0VDLFVBQVUsRUFBRTtRQUNYO0FBQ0g7QUFDQTtRQUNHQyxXQUFXLEVBQUU7VUFDWkMsSUFBSSxFQUFFLHNCQUFzQjtVQUM1QkMsUUFBUSxFQUFFO1FBQ1gsQ0FBQztRQUNEO0FBQ0g7QUFDQTtRQUNHQyxFQUFFLEVBQUU7VUFDSEYsSUFBSSxFQUFFLFFBQVE7VUFDZEMsUUFBUSxFQUFFO1FBQ1gsQ0FBQztRQUNEO0FBQ0g7QUFDQTtBQUNBO1FBQ0dFLFlBQVksRUFBRTtVQUNiSCxJQUFJLEVBQUUsUUFBUTtVQUNkQyxRQUFRLEVBQUU7UUFDWCxDQUFDO1FBQ0Q7QUFDSDtBQUNBO0FBQ0E7UUFDR0csWUFBWSxFQUFFO1VBQ2JKLElBQUksRUFBRSxRQUFRO1VBQ2RDLFFBQVEsRUFBRTtRQUNYO01BQ0QsQ0FBQztNQUNESSxNQUFNLEVBQUUsQ0FBQztJQUNWLENBQUM7SUFDREMsTUFBTSxFQUFFLFVBQVVDLE1BQVcsRUFBRTtNQUM5QkEsTUFBTSxDQUFDQyxvQkFBb0IsR0FBR0QsTUFBTSxDQUFDSixZQUFZLEdBQUcsS0FBSyxDQUFDTSxPQUFPLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztNQUU3RSxPQUFPRixNQUFNO0lBQ2Q7RUFDRCxDQUFDLENBQUM7RUFBQyxPQUNZaEIsYUFBYTtBQUFBIn0=