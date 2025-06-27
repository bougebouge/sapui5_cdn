/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var writeChildren = function (val) {
    if (Array.isArray(val)) {
      return val.join("");
    } else {
      return val;
    }
  };
  var addChildAggregation = function (aggregationChildren, aggregationName, child) {
    if (child === undefined) {
      return;
    }
    if (!aggregationChildren[aggregationName]) {
      aggregationChildren[aggregationName] = [];
    }
    if (typeof child === "string" && child.trim().length > 0) {
      aggregationChildren[aggregationName].push(child);
    } else if (Array.isArray(child)) {
      child.forEach(function (subChild) {
        addChildAggregation(aggregationChildren, aggregationName, subChild);
      });
    } else {
      Object.keys(child).forEach(function (childKey) {
        addChildAggregation(aggregationChildren, childKey, child[childKey]);
      });
    }
  };
  var FL_DELEGATE = "fl:delegate";
  var jsxXml = function (type, mSettings, key) {
    var metadata = type.getMetadata();
    var namesSplit = metadata.getName().split(".");
    if (key !== undefined) {
      mSettings["key"] = key;
    }
    var metadataProperties = metadata.getAllProperties();
    var metadataAggregations = metadata.getAllAggregations();
    metadataProperties["class"] = {
      name: "class"
    };
    metadataProperties["id"] = {
      name: "id"
    };
    metadataProperties[FL_DELEGATE] = {
      name: FL_DELEGATE
    };
    metadataProperties["xmlns:fl"] = {
      name: FL_DELEGATE
    };
    if (metadata.getName() === "sap.ui.core.Fragment") {
      metadataProperties["fragmentName"] = {
        name: "fragmentName"
      };
    }
    var namespace = namesSplit.slice(0, -1);
    var name = namesSplit[namesSplit.length - 1];
    var namespaceAlias = namespace[namespace.length - 1];
    var tagName = "".concat(namespaceAlias, ":").concat(name);
    var propertiesString = [];
    var aggregationString = [];
    var defaultAggregationName = metadata.getDefaultAggregationName();
    Object.keys(metadataProperties).forEach(function (propertyName) {
      if (mSettings.hasOwnProperty(propertyName) && mSettings[propertyName] !== undefined) {
        if (typeof mSettings[propertyName] === "object") {
          propertiesString.push("".concat(propertyName, "='").concat(JSON.stringify(mSettings[propertyName]), "'"));
        } else {
          propertiesString.push("".concat(propertyName, "='").concat(mSettings[propertyName], "'"));
        }
      }
    });
    var aggregationChildren = _defineProperty({}, defaultAggregationName, []);
    addChildAggregation(aggregationChildren, defaultAggregationName, mSettings.children);
    Object.keys(metadataAggregations).forEach(function (aggregationName) {
      if (aggregationChildren !== null && aggregationChildren !== void 0 && aggregationChildren.hasOwnProperty(aggregationName) && aggregationChildren[aggregationName].length > 0) {
        aggregationString.push("<".concat(namespaceAlias, ":").concat(aggregationName, ">\n\t\t\t\t\t\t").concat(writeChildren(aggregationChildren[aggregationName]), "\n\t\t\t\t\t</").concat(namespaceAlias, ":").concat(aggregationName, ">"));
      }
      if (mSettings.hasOwnProperty(aggregationName) && mSettings[aggregationName] !== undefined) {
        propertiesString.push("".concat(aggregationName, "='").concat(JSON.stringify(mSettings[aggregationName]), "'"));
      }
    });
    return "<".concat(tagName, " xmlns:").concat(namespaceAlias, "=\"").concat(namespace.join("."), "\" ").concat(propertiesString.join(" "), ">").concat(aggregationString.join(""), "</").concat(tagName, ">");
  };
  return jsxXml;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ3cml0ZUNoaWxkcmVuIiwidmFsIiwiQXJyYXkiLCJpc0FycmF5Iiwiam9pbiIsImFkZENoaWxkQWdncmVnYXRpb24iLCJhZ2dyZWdhdGlvbkNoaWxkcmVuIiwiYWdncmVnYXRpb25OYW1lIiwiY2hpbGQiLCJ1bmRlZmluZWQiLCJ0cmltIiwibGVuZ3RoIiwicHVzaCIsImZvckVhY2giLCJzdWJDaGlsZCIsIk9iamVjdCIsImtleXMiLCJjaGlsZEtleSIsIkZMX0RFTEVHQVRFIiwianN4WG1sIiwidHlwZSIsIm1TZXR0aW5ncyIsImtleSIsIm1ldGFkYXRhIiwiZ2V0TWV0YWRhdGEiLCJuYW1lc1NwbGl0IiwiZ2V0TmFtZSIsInNwbGl0IiwibWV0YWRhdGFQcm9wZXJ0aWVzIiwiZ2V0QWxsUHJvcGVydGllcyIsIm1ldGFkYXRhQWdncmVnYXRpb25zIiwiZ2V0QWxsQWdncmVnYXRpb25zIiwibmFtZSIsIm5hbWVzcGFjZSIsInNsaWNlIiwibmFtZXNwYWNlQWxpYXMiLCJ0YWdOYW1lIiwicHJvcGVydGllc1N0cmluZyIsImFnZ3JlZ2F0aW9uU3RyaW5nIiwiZGVmYXVsdEFnZ3JlZ2F0aW9uTmFtZSIsImdldERlZmF1bHRBZ2dyZWdhdGlvbk5hbWUiLCJwcm9wZXJ0eU5hbWUiLCJoYXNPd25Qcm9wZXJ0eSIsIkpTT04iLCJzdHJpbmdpZnkiLCJjaGlsZHJlbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsianN4LXhtbC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IENvbnRyb2xQcm9wZXJ0aWVzLCBOb25Db250cm9sUHJvcGVydGllcyB9IGZyb20gXCJzYXAvZmUvY29yZS9qc3gtcnVudGltZS9qc3hcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBFbGVtZW50IGZyb20gXCJzYXAvdWkvY29yZS9FbGVtZW50XCI7XG5cbmNvbnN0IHdyaXRlQ2hpbGRyZW4gPSBmdW5jdGlvbiAodmFsOiBzdHJpbmcgfCBzdHJpbmdbXSkge1xuXHRpZiAoQXJyYXkuaXNBcnJheSh2YWwpKSB7XG5cdFx0cmV0dXJuIHZhbC5qb2luKFwiXCIpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB2YWw7XG5cdH1cbn07XG5cbmNvbnN0IGFkZENoaWxkQWdncmVnYXRpb24gPSBmdW5jdGlvbiAoYWdncmVnYXRpb25DaGlsZHJlbjogYW55LCBhZ2dyZWdhdGlvbk5hbWU6IHN0cmluZywgY2hpbGQ6IGFueSkge1xuXHRpZiAoY2hpbGQgPT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybjtcblx0fVxuXHRpZiAoIWFnZ3JlZ2F0aW9uQ2hpbGRyZW5bYWdncmVnYXRpb25OYW1lXSkge1xuXHRcdGFnZ3JlZ2F0aW9uQ2hpbGRyZW5bYWdncmVnYXRpb25OYW1lXSA9IFtdO1xuXHR9XG5cdGlmICh0eXBlb2YgY2hpbGQgPT09IFwic3RyaW5nXCIgJiYgY2hpbGQudHJpbSgpLmxlbmd0aCA+IDApIHtcblx0XHRhZ2dyZWdhdGlvbkNoaWxkcmVuW2FnZ3JlZ2F0aW9uTmFtZV0ucHVzaChjaGlsZCk7XG5cdH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheShjaGlsZCkpIHtcblx0XHRjaGlsZC5mb3JFYWNoKChzdWJDaGlsZCkgPT4ge1xuXHRcdFx0YWRkQ2hpbGRBZ2dyZWdhdGlvbihhZ2dyZWdhdGlvbkNoaWxkcmVuLCBhZ2dyZWdhdGlvbk5hbWUsIHN1YkNoaWxkKTtcblx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRPYmplY3Qua2V5cyhjaGlsZCkuZm9yRWFjaCgoY2hpbGRLZXkpID0+IHtcblx0XHRcdGFkZENoaWxkQWdncmVnYXRpb24oYWdncmVnYXRpb25DaGlsZHJlbiwgY2hpbGRLZXksIGNoaWxkW2NoaWxkS2V5XSk7XG5cdFx0fSk7XG5cdH1cbn07XG5cbmNvbnN0IEZMX0RFTEVHQVRFID0gXCJmbDpkZWxlZ2F0ZVwiO1xuY29uc3QganN4WG1sID0gZnVuY3Rpb24gPFQ+KFxuXHR0eXBlOiB0eXBlb2YgQ29udHJvbCxcblx0bVNldHRpbmdzOiBOb25Db250cm9sUHJvcGVydGllczxUPiAmIHsga2V5OiBzdHJpbmc7IGNoaWxkcmVuPzogRWxlbWVudCB8IENvbnRyb2xQcm9wZXJ0aWVzPFQ+IH0sXG5cdGtleTogc3RyaW5nXG4pOiBzdHJpbmcge1xuXHRjb25zdCBtZXRhZGF0YSA9IHR5cGUuZ2V0TWV0YWRhdGEoKTtcblx0Y29uc3QgbmFtZXNTcGxpdCA9IG1ldGFkYXRhLmdldE5hbWUoKS5zcGxpdChcIi5cIik7XG5cdGlmIChrZXkgIT09IHVuZGVmaW5lZCkge1xuXHRcdG1TZXR0aW5nc1tcImtleVwiXSA9IGtleTtcblx0fVxuXHRjb25zdCBtZXRhZGF0YVByb3BlcnRpZXMgPSBtZXRhZGF0YS5nZXRBbGxQcm9wZXJ0aWVzKCk7XG5cdGNvbnN0IG1ldGFkYXRhQWdncmVnYXRpb25zID0gbWV0YWRhdGEuZ2V0QWxsQWdncmVnYXRpb25zKCk7XG5cdG1ldGFkYXRhUHJvcGVydGllc1tcImNsYXNzXCJdID0geyBuYW1lOiBcImNsYXNzXCIgfTtcblx0bWV0YWRhdGFQcm9wZXJ0aWVzW1wiaWRcIl0gPSB7IG5hbWU6IFwiaWRcIiB9O1xuXHRtZXRhZGF0YVByb3BlcnRpZXNbRkxfREVMRUdBVEVdID0geyBuYW1lOiBGTF9ERUxFR0FURSB9O1xuXHRtZXRhZGF0YVByb3BlcnRpZXNbXCJ4bWxuczpmbFwiXSA9IHsgbmFtZTogRkxfREVMRUdBVEUgfTtcblx0aWYgKG1ldGFkYXRhLmdldE5hbWUoKSA9PT0gXCJzYXAudWkuY29yZS5GcmFnbWVudFwiKSB7XG5cdFx0bWV0YWRhdGFQcm9wZXJ0aWVzW1wiZnJhZ21lbnROYW1lXCJdID0geyBuYW1lOiBcImZyYWdtZW50TmFtZVwiIH07XG5cdH1cblx0Y29uc3QgbmFtZXNwYWNlID0gbmFtZXNTcGxpdC5zbGljZSgwLCAtMSk7XG5cdGNvbnN0IG5hbWUgPSBuYW1lc1NwbGl0W25hbWVzU3BsaXQubGVuZ3RoIC0gMV07XG5cdGNvbnN0IG5hbWVzcGFjZUFsaWFzID0gbmFtZXNwYWNlW25hbWVzcGFjZS5sZW5ndGggLSAxXTtcblx0Y29uc3QgdGFnTmFtZSA9IGAke25hbWVzcGFjZUFsaWFzfToke25hbWV9YDtcblx0Y29uc3QgcHJvcGVydGllc1N0cmluZzogc3RyaW5nW10gPSBbXTtcblx0Y29uc3QgYWdncmVnYXRpb25TdHJpbmc6IHN0cmluZ1tdID0gW107XG5cdGNvbnN0IGRlZmF1bHRBZ2dyZWdhdGlvbk5hbWUgPSBtZXRhZGF0YS5nZXREZWZhdWx0QWdncmVnYXRpb25OYW1lKCk7XG5cdE9iamVjdC5rZXlzKG1ldGFkYXRhUHJvcGVydGllcykuZm9yRWFjaCgocHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0aWYgKG1TZXR0aW5ncy5oYXNPd25Qcm9wZXJ0eShwcm9wZXJ0eU5hbWUpICYmIChtU2V0dGluZ3MgYXMgYW55KVtwcm9wZXJ0eU5hbWVdICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGlmICh0eXBlb2YgKG1TZXR0aW5ncyBhcyBhbnkpW3Byb3BlcnR5TmFtZV0gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0cHJvcGVydGllc1N0cmluZy5wdXNoKGAke3Byb3BlcnR5TmFtZX09JyR7SlNPTi5zdHJpbmdpZnkoKG1TZXR0aW5ncyBhcyBhbnkpW3Byb3BlcnR5TmFtZV0pfSdgKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHByb3BlcnRpZXNTdHJpbmcucHVzaChgJHtwcm9wZXJ0eU5hbWV9PSckeyhtU2V0dGluZ3MgYXMgYW55KVtwcm9wZXJ0eU5hbWVdfSdgKTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXHRjb25zdCBhZ2dyZWdhdGlvbkNoaWxkcmVuOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7XG5cdFx0W2RlZmF1bHRBZ2dyZWdhdGlvbk5hbWVdOiBbXVxuXHR9O1xuXHRhZGRDaGlsZEFnZ3JlZ2F0aW9uKGFnZ3JlZ2F0aW9uQ2hpbGRyZW4sIGRlZmF1bHRBZ2dyZWdhdGlvbk5hbWUsIG1TZXR0aW5ncy5jaGlsZHJlbik7XG5cdE9iamVjdC5rZXlzKG1ldGFkYXRhQWdncmVnYXRpb25zKS5mb3JFYWNoKChhZ2dyZWdhdGlvbk5hbWUpID0+IHtcblx0XHRpZiAoYWdncmVnYXRpb25DaGlsZHJlbj8uaGFzT3duUHJvcGVydHkoYWdncmVnYXRpb25OYW1lKSAmJiBhZ2dyZWdhdGlvbkNoaWxkcmVuW2FnZ3JlZ2F0aW9uTmFtZV0ubGVuZ3RoID4gMCkge1xuXHRcdFx0YWdncmVnYXRpb25TdHJpbmcucHVzaChcblx0XHRcdFx0YDwke25hbWVzcGFjZUFsaWFzfToke2FnZ3JlZ2F0aW9uTmFtZX0+XG5cdFx0XHRcdFx0XHQke3dyaXRlQ2hpbGRyZW4oYWdncmVnYXRpb25DaGlsZHJlblthZ2dyZWdhdGlvbk5hbWVdKX1cblx0XHRcdFx0XHQ8LyR7bmFtZXNwYWNlQWxpYXN9OiR7YWdncmVnYXRpb25OYW1lfT5gXG5cdFx0XHQpO1xuXHRcdH1cblx0XHRpZiAobVNldHRpbmdzLmhhc093blByb3BlcnR5KGFnZ3JlZ2F0aW9uTmFtZSkgJiYgKG1TZXR0aW5ncyBhcyBhbnkpW2FnZ3JlZ2F0aW9uTmFtZV0gIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cHJvcGVydGllc1N0cmluZy5wdXNoKGAke2FnZ3JlZ2F0aW9uTmFtZX09JyR7SlNPTi5zdHJpbmdpZnkoKG1TZXR0aW5ncyBhcyBhbnkpW2FnZ3JlZ2F0aW9uTmFtZV0pfSdgKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gYDwke3RhZ05hbWV9IHhtbG5zOiR7bmFtZXNwYWNlQWxpYXN9PVwiJHtuYW1lc3BhY2Uuam9pbihcIi5cIil9XCIgJHtwcm9wZXJ0aWVzU3RyaW5nLmpvaW4oXCIgXCIpfT4ke2FnZ3JlZ2F0aW9uU3RyaW5nLmpvaW4oXG5cdFx0XCJcIlxuXHQpfTwvJHt0YWdOYW1lfT5gO1xufTtcbmV4cG9ydCBkZWZhdWx0IGpzeFhtbDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7OztFQUlBLElBQU1BLGFBQWEsR0FBRyxVQUFVQyxHQUFzQixFQUFFO0lBQ3ZE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