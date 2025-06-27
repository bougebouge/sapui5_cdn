/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/MacroMetadata"], function (MacroMetadata) {
  "use strict";

  /**
   * @classdesc
   * Content of a action commands
   * @class sap.fe.macros.internal.ActionCommand
   * @hideconstructor
   * @private
   * @experimental
   */
  var ActionCommand = MacroMetadata.extend("sap.fe.macros.internal.ActionCommand", {
    /**
     * Name
     */
    name: "ActionCommand",
    /**
     * Namespace
     */
    namespace: "sap.fe.macros.internal",
    /**
     * Fragment source
     */
    fragment: "sap.fe.macros.internal.ActionCommand",
    /**
     * Metadata
     */
    metadata: {
      /**
       * Properties.
       */
      properties: {
        action: {
          type: "sap.ui.model.Context"
        },
        isActionEnabled: {
          type: "boolean"
        },
        isIBNEnabled: {
          type: "boolean"
        },
        visible: {
          type: "boolean"
        }
      },
      events: {
        onExecuteAction: {
          type: "function"
        },
        onExecuteIBN: {
          type: "function"
        },
        onExecuteManifest: {
          type: "function"
        }
      }
    }
  });
  return ActionCommand;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBY3Rpb25Db21tYW5kIiwiTWFjcm9NZXRhZGF0YSIsImV4dGVuZCIsIm5hbWUiLCJuYW1lc3BhY2UiLCJmcmFnbWVudCIsIm1ldGFkYXRhIiwicHJvcGVydGllcyIsImFjdGlvbiIsInR5cGUiLCJpc0FjdGlvbkVuYWJsZWQiLCJpc0lCTkVuYWJsZWQiLCJ2aXNpYmxlIiwiZXZlbnRzIiwib25FeGVjdXRlQWN0aW9uIiwib25FeGVjdXRlSUJOIiwib25FeGVjdXRlTWFuaWZlc3QiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkFjdGlvbkNvbW1hbmQubWV0YWRhdGEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IE1hY3JvTWV0YWRhdGEgZnJvbSBcInNhcC9mZS9tYWNyb3MvTWFjcm9NZXRhZGF0YVwiO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2NcbiAqIENvbnRlbnQgb2YgYSBhY3Rpb24gY29tbWFuZHNcbiAqIEBjbGFzcyBzYXAuZmUubWFjcm9zLmludGVybmFsLkFjdGlvbkNvbW1hbmRcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmNvbnN0IEFjdGlvbkNvbW1hbmQgPSBNYWNyb01ldGFkYXRhLmV4dGVuZChcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuQWN0aW9uQ29tbWFuZFwiLCB7XG5cdC8qKlxuXHQgKiBOYW1lXG5cdCAqL1xuXHRuYW1lOiBcIkFjdGlvbkNvbW1hbmRcIixcblx0LyoqXG5cdCAqIE5hbWVzcGFjZVxuXHQgKi9cblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIixcblx0LyoqXG5cdCAqIEZyYWdtZW50IHNvdXJjZVxuXHQgKi9cblx0ZnJhZ21lbnQ6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5BY3Rpb25Db21tYW5kXCIsXG5cblx0LyoqXG5cdCAqIE1ldGFkYXRhXG5cdCAqL1xuXHRtZXRhZGF0YToge1xuXHRcdC8qKlxuXHRcdCAqIFByb3BlcnRpZXMuXG5cdFx0ICovXG5cdFx0cHJvcGVydGllczoge1xuXHRcdFx0YWN0aW9uOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIlxuXHRcdFx0fSxcblx0XHRcdGlzQWN0aW9uRW5hYmxlZDoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHRcdFx0fSxcblx0XHRcdGlzSUJORW5hYmxlZDoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHRcdFx0fSxcblx0XHRcdHZpc2libGU6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCJcblx0XHRcdH1cblx0XHR9LFxuXHRcdGV2ZW50czoge1xuXHRcdFx0b25FeGVjdXRlQWN0aW9uOiB7XG5cdFx0XHRcdHR5cGU6IFwiZnVuY3Rpb25cIlxuXHRcdFx0fSxcblx0XHRcdG9uRXhlY3V0ZUlCTjoge1xuXHRcdFx0XHR0eXBlOiBcImZ1bmN0aW9uXCJcblx0XHRcdH0sXG5cdFx0XHRvbkV4ZWN1dGVNYW5pZmVzdDoge1xuXHRcdFx0XHR0eXBlOiBcImZ1bmN0aW9uXCJcblx0XHRcdH1cblx0XHR9XG5cdH1cbn0pO1xuXG5leHBvcnQgZGVmYXVsdCBBY3Rpb25Db21tYW5kO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLElBQU1BLGFBQWEsR0FBR0MsYUFBYSxDQUFDQyxNQUFNLENBQUMsc0NBQXNDLEVBQUU7SUFDbEY7QUFDRDtBQUNBO0lBQ0NDLElBQUksRUFBRSxlQUFlO0lBQ3JCO0FBQ0Q7QUFDQTtJQUNDQyxTQUFTLEVBQUUsd0JBQXdCO0lBQ25DO0FBQ0Q7QUFDQTtJQUNDQyxRQUFRLEVBQUUsc0NBQXNDO0lBRWhEO0FBQ0Q7QUFDQTtJQUNDQyxRQUFRLEVBQUU7TUFDVDtBQUNGO0FBQ0E7TUFDRUMsVUFBVSxFQUFFO1FBQ1hDLE1BQU0sRUFBRTtVQUNQQyxJQUFJLEVBQUU7UUFDUCxDQUFDO1FBQ0RDLGVBQWUsRUFBRTtVQUNoQkQsSUFBSSxFQUFFO1FBQ1AsQ0FBQztRQUNERSxZQUFZLEVBQUU7VUFDYkYsSUFBSSxFQUFFO1FBQ1AsQ0FBQztRQUNERyxPQUFPLEVBQUU7VUFDUkgsSUFBSSxFQUFFO1FBQ1A7TUFDRCxDQUFDO01BQ0RJLE1BQU0sRUFBRTtRQUNQQyxlQUFlLEVBQUU7VUFDaEJMLElBQUksRUFBRTtRQUNQLENBQUM7UUFDRE0sWUFBWSxFQUFFO1VBQ2JOLElBQUksRUFBRTtRQUNQLENBQUM7UUFDRE8saUJBQWlCLEVBQUU7VUFDbEJQLElBQUksRUFBRTtRQUNQO01BQ0Q7SUFDRDtFQUNELENBQUMsQ0FBQztFQUFDLE9BRVlULGFBQWE7QUFBQSJ9