/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/MacroMetadata"], function (BindingHelper, MetaModelConverter, BindingToolkit, DataModelPathHelper, UIFormatters, FieldTemplating, MacroMetadata) {
  "use strict";

  var getVisibleExpression = FieldTemplating.getVisibleExpression;
  var getValueBinding = FieldTemplating.getValueBinding;
  var getDisplayMode = UIFormatters.getDisplayMode;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  /**
   * @classdesc
   * Building block for creating a CollectionField based on the metadata provided by OData V4.
   * <br>
   * Usually, a DataField annotation is expected
   *
   * Usage example:
   * <pre>
   * <internalMacro:CollectionField
   *   idPrefix="SomePrefix"
   *   contextPath="{entitySet>}"
   *   metaPath="{dataField>}"
   * />
   * </pre>
   * @class sap.fe.macros.internal.CollectionField
   * @hideconstructor
   * @private
   * @experimental
   * @since 1.94.0
   */
  var CollectionField = MacroMetadata.extend("sap.fe.macros.internal.CollectionField", {
    /**
     * Define building block stereotype for documentation
     */
    name: "CollectionField",
    /**
     * Namespace of the building block
     */
    namespace: "sap.fe.macros.internal",
    /**
     * Fragment source of the building block (optional)
     */
    fragment: "sap.fe.macros.internal.CollectionField",
    /**
     * The metadata describing the building block
     */
    metadata: {
      /**
       * Define building block stereotype for documentation purpose
       */
      stereotype: "xmlmacro",
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
         * Prefix added to the generated ID of the value help used for the field
         */
        vhIdPrefix: {
          type: "string",
          defaultValue: "FieldValueHelp"
        },
        _vhFlexId: {
          type: "string",
          computed: true
        },
        /**
         * Metadata path to the CollectionField.
         * This property is usually a metadataContext pointing to a DataField having a Value that uses a 1:n navigation
         */
        metaPath: {
          type: "sap.ui.model.Context",
          required: true,
          $kind: ["Property"]
        },
        /**
         * Property added to associate the label with the CollectionField
         */
        ariaLabelledBy: {
          type: "string"
        },
        formatOptions: {
          type: "object",
          properties: {
            /**
             * If set to 'true', SAP Fiori elements shows an empty indicator in display mode for the text and links
             */
            showEmptyIndicator: {
              type: "boolean",
              defaultValue: false
            },
            displayOnly: {
              type: "boolean",
              defaultValue: false
            }
          }
        },
        /**
         * Mandatory context to the CollectionField
         */
        contextPath: {
          type: "sap.ui.model.Context",
          required: true,
          $kind: ["EntitySet", "NavigationProperty"]
        }
      }
    },
    create: function (oProps) {
      var oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(oProps.metaPath, oProps.contextPath);
      var oDataFieldConverted = MetaModelConverter.convertMetaModelContext(oProps.metaPath);
      var sExtraPath = oDataFieldConverted.Value.path;
      oProps.visible = getVisibleExpression(oDataModelPath, oProps.formatOptions);
      if (sExtraPath && sExtraPath.length > 0) {
        oDataModelPath = DataModelPathHelper.enhanceDataModelPath(oDataModelPath, sExtraPath);
      }
      var bInsertable = DataModelPathHelper.isPathInsertable(oDataModelPath);
      var bDeleteNavigationRestriction = DataModelPathHelper.isPathDeletable(oDataModelPath, {
        ignoreTargetCollection: true,
        authorizeUnresolvable: true
      });
      var bDeletePath = DataModelPathHelper.isPathDeletable(oDataModelPath);
      // deletable:
      //		if restrictions come from Navigation we apply it
      //		otherwise we apply restrictions defined on target collection only if it's a constant
      //      otherwise it's true!
      var bDeletable = ifElse(bDeleteNavigationRestriction._type === "Unresolvable", or(not(isConstant(bDeletePath)), bDeletePath), bDeletePath);
      oProps.editMode = oProps.formatOptions.displayOnly === "true" ? "Display" : compileExpression(ifElse(and(bInsertable, bDeletable, UI.IsEditable), constant("Editable"), constant("Display")));
      oProps.displayMode = getDisplayMode(oDataModelPath);
      var multiInputSettings = CollectionField._getMultiInputSettings(oDataModelPath, oProps.formatOptions);
      oProps.text = multiInputSettings.text;
      oProps.collection = oProps.editMode === "Display" ? multiInputSettings.collectionBindingDisplay : multiInputSettings.collectionBindingEdit;
      oProps.key = multiInputSettings.key;
      return oProps;
    },
    _getMultiInputSettings: function (oPropertyDataModelObjectPath, formatOptions) {
      var _oPropertyDefinition$, _oPropertyDefinition$2;
      var _CollectionField$_get = CollectionField._getPathStructure(oPropertyDataModelObjectPath),
        collectionPath = _CollectionField$_get.collectionPath,
        itemDataModelObjectPath = _CollectionField$_get.itemDataModelObjectPath;
      var collectionBindingDisplay = "{path:'".concat(collectionPath, "', templateShareable: false}");
      var collectionBindingEdit = "{path:'".concat(collectionPath, "', parameters: {$$ownRequest : true}, templateShareable: false}");
      var oPropertyDefinition = oPropertyDataModelObjectPath.targetObject.type === "PropertyPath" ? oPropertyDataModelObjectPath.targetObject.$target : oPropertyDataModelObjectPath.targetObject;
      var commonText = (_oPropertyDefinition$ = oPropertyDefinition.annotations) === null || _oPropertyDefinition$ === void 0 ? void 0 : (_oPropertyDefinition$2 = _oPropertyDefinition$.Common) === null || _oPropertyDefinition$2 === void 0 ? void 0 : _oPropertyDefinition$2.Text;
      var relativeLocation = DataModelPathHelper.getRelativePaths(oPropertyDataModelObjectPath);
      var textExpression = commonText ? compileExpression(getExpressionFromAnnotation(commonText, relativeLocation)) : getValueBinding(itemDataModelObjectPath, formatOptions, true);
      return {
        text: textExpression,
        collectionBindingDisplay: collectionBindingDisplay,
        collectionBindingEdit: collectionBindingEdit,
        key: getValueBinding(itemDataModelObjectPath, formatOptions, true)
      };
    },
    // Process the dataModelPath to find the collection and the relative DataModelPath for the item.
    _getPathStructure: function (dataModelObjectPath) {
      var _dataModelObjectPath$, _dataModelObjectPath$2;
      var firstCollectionPath = "";
      var currentEntitySet = (_dataModelObjectPath$ = dataModelObjectPath.contextLocation) !== null && _dataModelObjectPath$ !== void 0 && _dataModelObjectPath$.targetEntitySet ? dataModelObjectPath.contextLocation.targetEntitySet : dataModelObjectPath.startingEntitySet;
      var navigatedPaths = [];
      var contextNavsForItem = ((_dataModelObjectPath$2 = dataModelObjectPath.contextLocation) === null || _dataModelObjectPath$2 === void 0 ? void 0 : _dataModelObjectPath$2.navigationProperties) || [];
      var _iterator = _createForOfIteratorHelper(dataModelObjectPath.navigationProperties),
        _step;
      try {
        var _loop = function () {
          var _dataModelObjectPath$3;
          var navProp = _step.value;
          if (!dataModelObjectPath.contextLocation || !((_dataModelObjectPath$3 = dataModelObjectPath.contextLocation) !== null && _dataModelObjectPath$3 !== void 0 && _dataModelObjectPath$3.navigationProperties.some(function (contextNavProp) {
            return contextNavProp.fullyQualifiedName === navProp.fullyQualifiedName;
          }))) {
            // in case of relative entitySetPath we don't consider navigationPath that are already in the context
            navigatedPaths.push(navProp.name);
            contextNavsForItem.push(navProp);
          }
          if (currentEntitySet && currentEntitySet.navigationPropertyBinding.hasOwnProperty(navProp.name)) {
            currentEntitySet = currentEntitySet.navigationPropertyBinding[navProp.name];
            if (navProp.isCollection) {
              return "break";
            }
          }
        };
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _ret = _loop();
          if (_ret === "break") break;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      firstCollectionPath = "".concat(navigatedPaths.join("/"));
      var itemDataModelObjectPath = Object.assign({}, dataModelObjectPath);
      if (itemDataModelObjectPath.contextLocation) {
        itemDataModelObjectPath.contextLocation.navigationProperties = contextNavsForItem;
      }
      return {
        collectionPath: firstCollectionPath,
        itemDataModelObjectPath: itemDataModelObjectPath
      };
    }
  });
  return CollectionField;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2xsZWN0aW9uRmllbGQiLCJNYWNyb01ldGFkYXRhIiwiZXh0ZW5kIiwibmFtZSIsIm5hbWVzcGFjZSIsImZyYWdtZW50IiwibWV0YWRhdGEiLCJzdGVyZW90eXBlIiwicHJvcGVydGllcyIsImlkUHJlZml4IiwidHlwZSIsInZoSWRQcmVmaXgiLCJkZWZhdWx0VmFsdWUiLCJfdmhGbGV4SWQiLCJjb21wdXRlZCIsIm1ldGFQYXRoIiwicmVxdWlyZWQiLCIka2luZCIsImFyaWFMYWJlbGxlZEJ5IiwiZm9ybWF0T3B0aW9ucyIsInNob3dFbXB0eUluZGljYXRvciIsImRpc3BsYXlPbmx5IiwiY29udGV4dFBhdGgiLCJjcmVhdGUiLCJvUHJvcHMiLCJvRGF0YU1vZGVsUGF0aCIsIk1ldGFNb2RlbENvbnZlcnRlciIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIm9EYXRhRmllbGRDb252ZXJ0ZWQiLCJjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCIsInNFeHRyYVBhdGgiLCJWYWx1ZSIsInBhdGgiLCJ2aXNpYmxlIiwiZ2V0VmlzaWJsZUV4cHJlc3Npb24iLCJsZW5ndGgiLCJEYXRhTW9kZWxQYXRoSGVscGVyIiwiZW5oYW5jZURhdGFNb2RlbFBhdGgiLCJiSW5zZXJ0YWJsZSIsImlzUGF0aEluc2VydGFibGUiLCJiRGVsZXRlTmF2aWdhdGlvblJlc3RyaWN0aW9uIiwiaXNQYXRoRGVsZXRhYmxlIiwiaWdub3JlVGFyZ2V0Q29sbGVjdGlvbiIsImF1dGhvcml6ZVVucmVzb2x2YWJsZSIsImJEZWxldGVQYXRoIiwiYkRlbGV0YWJsZSIsImlmRWxzZSIsIl90eXBlIiwib3IiLCJub3QiLCJpc0NvbnN0YW50IiwiZWRpdE1vZGUiLCJjb21waWxlRXhwcmVzc2lvbiIsImFuZCIsIlVJIiwiSXNFZGl0YWJsZSIsImNvbnN0YW50IiwiZGlzcGxheU1vZGUiLCJnZXREaXNwbGF5TW9kZSIsIm11bHRpSW5wdXRTZXR0aW5ncyIsIl9nZXRNdWx0aUlucHV0U2V0dGluZ3MiLCJ0ZXh0IiwiY29sbGVjdGlvbiIsImNvbGxlY3Rpb25CaW5kaW5nRGlzcGxheSIsImNvbGxlY3Rpb25CaW5kaW5nRWRpdCIsImtleSIsIm9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgiLCJfZ2V0UGF0aFN0cnVjdHVyZSIsImNvbGxlY3Rpb25QYXRoIiwiaXRlbURhdGFNb2RlbE9iamVjdFBhdGgiLCJvUHJvcGVydHlEZWZpbml0aW9uIiwidGFyZ2V0T2JqZWN0IiwiJHRhcmdldCIsImNvbW1vblRleHQiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlRleHQiLCJyZWxhdGl2ZUxvY2F0aW9uIiwiZ2V0UmVsYXRpdmVQYXRocyIsInRleHRFeHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiZ2V0VmFsdWVCaW5kaW5nIiwiZGF0YU1vZGVsT2JqZWN0UGF0aCIsImZpcnN0Q29sbGVjdGlvblBhdGgiLCJjdXJyZW50RW50aXR5U2V0IiwiY29udGV4dExvY2F0aW9uIiwidGFyZ2V0RW50aXR5U2V0Iiwic3RhcnRpbmdFbnRpdHlTZXQiLCJuYXZpZ2F0ZWRQYXRocyIsImNvbnRleHROYXZzRm9ySXRlbSIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibmF2UHJvcCIsInNvbWUiLCJjb250ZXh0TmF2UHJvcCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInB1c2giLCJuYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nIiwiaGFzT3duUHJvcGVydHkiLCJpc0NvbGxlY3Rpb24iLCJqb2luIiwiT2JqZWN0IiwiYXNzaWduIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb2xsZWN0aW9uRmllbGQubWV0YWRhdGEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBFbnRpdHlTZXQsIE5hdmlnYXRpb25Qcm9wZXJ0eSwgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgKiBhcyBNZXRhTW9kZWxDb252ZXJ0ZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHtcblx0YW5kLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uc3RhbnQsXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRpc0NvbnN0YW50LFxuXHRub3QsXG5cdG9yXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgKiBhcyBEYXRhTW9kZWxQYXRoSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGdldERpc3BsYXlNb2RlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgeyBnZXRWYWx1ZUJpbmRpbmcsIGdldFZpc2libGVFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgTWFjcm9NZXRhZGF0YSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9NYWNyb01ldGFkYXRhXCI7XG5cbnR5cGUgTXVsdGlJbnB1dFNldHRpbmdzID0ge1xuXHR0ZXh0OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRjb2xsZWN0aW9uQmluZGluZ0Rpc3BsYXk6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRjb2xsZWN0aW9uQmluZGluZ0VkaXQ6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRrZXk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG59O1xuLyoqXG4gKiBAY2xhc3NkZXNjXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBDb2xsZWN0aW9uRmllbGQgYmFzZWQgb24gdGhlIG1ldGFkYXRhIHByb3ZpZGVkIGJ5IE9EYXRhIFY0LlxuICogPGJyPlxuICogVXN1YWxseSwgYSBEYXRhRmllbGQgYW5ub3RhdGlvbiBpcyBleHBlY3RlZFxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogPGludGVybmFsTWFjcm86Q29sbGVjdGlvbkZpZWxkXG4gKiAgIGlkUHJlZml4PVwiU29tZVByZWZpeFwiXG4gKiAgIGNvbnRleHRQYXRoPVwie2VudGl0eVNldD59XCJcbiAqICAgbWV0YVBhdGg9XCJ7ZGF0YUZpZWxkPn1cIlxuICogLz5cbiAqIDwvcHJlPlxuICogQGNsYXNzIHNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuQ29sbGVjdGlvbkZpZWxkXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICogQHNpbmNlIDEuOTQuMFxuICovXG5jb25zdCBDb2xsZWN0aW9uRmllbGQgPSBNYWNyb01ldGFkYXRhLmV4dGVuZChcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuQ29sbGVjdGlvbkZpZWxkXCIsIHtcblx0LyoqXG5cdCAqIERlZmluZSBidWlsZGluZyBibG9jayBzdGVyZW90eXBlIGZvciBkb2N1bWVudGF0aW9uXG5cdCAqL1xuXHRuYW1lOiBcIkNvbGxlY3Rpb25GaWVsZFwiLFxuXHQvKipcblx0ICogTmFtZXNwYWNlIG9mIHRoZSBidWlsZGluZyBibG9ja1xuXHQgKi9cblx0bmFtZXNwYWNlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWxcIixcblx0LyoqXG5cdCAqIEZyYWdtZW50IHNvdXJjZSBvZiB0aGUgYnVpbGRpbmcgYmxvY2sgKG9wdGlvbmFsKVxuXHQgKi9cblx0ZnJhZ21lbnQ6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5Db2xsZWN0aW9uRmllbGRcIixcblxuXHQvKipcblx0ICogVGhlIG1ldGFkYXRhIGRlc2NyaWJpbmcgdGhlIGJ1aWxkaW5nIGJsb2NrXG5cdCAqL1xuXHRtZXRhZGF0YToge1xuXHRcdC8qKlxuXHRcdCAqIERlZmluZSBidWlsZGluZyBibG9jayBzdGVyZW90eXBlIGZvciBkb2N1bWVudGF0aW9uIHB1cnBvc2Vcblx0XHQgKi9cblx0XHRzdGVyZW90eXBlOiBcInhtbG1hY3JvXCIsXG5cdFx0LyoqXG5cdFx0ICogUHJvcGVydGllcy5cblx0XHQgKi9cblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHQvKipcblx0XHRcdCAqIFByZWZpeCBhZGRlZCB0byB0aGUgZ2VuZXJhdGVkIElEIG9mIHRoZSBmaWVsZFxuXHRcdFx0ICovXG5cdFx0XHRpZFByZWZpeDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBQcmVmaXggYWRkZWQgdG8gdGhlIGdlbmVyYXRlZCBJRCBvZiB0aGUgdmFsdWUgaGVscCB1c2VkIGZvciB0aGUgZmllbGRcblx0XHRcdCAqL1xuXHRcdFx0dmhJZFByZWZpeDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IFwiRmllbGRWYWx1ZUhlbHBcIlxuXHRcdFx0fSxcblxuXHRcdFx0X3ZoRmxleElkOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGNvbXB1dGVkOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBDb2xsZWN0aW9uRmllbGQuXG5cdFx0XHQgKiBUaGlzIHByb3BlcnR5IGlzIHVzdWFsbHkgYSBtZXRhZGF0YUNvbnRleHQgcG9pbnRpbmcgdG8gYSBEYXRhRmllbGQgaGF2aW5nIGEgVmFsdWUgdGhhdCB1c2VzIGEgMTpuIG5hdmlnYXRpb25cblx0XHRcdCAqL1xuXHRcdFx0bWV0YVBhdGg6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRcdFx0JGtpbmQ6IFtcIlByb3BlcnR5XCJdXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBQcm9wZXJ0eSBhZGRlZCB0byBhc3NvY2lhdGUgdGhlIGxhYmVsIHdpdGggdGhlIENvbGxlY3Rpb25GaWVsZFxuXHRcdFx0ICovXG5cdFx0XHRhcmlhTGFiZWxsZWRCeToge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0Zm9ybWF0T3B0aW9uczoge1xuXHRcdFx0XHR0eXBlOiBcIm9iamVjdFwiLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0ICogSWYgc2V0IHRvICd0cnVlJywgU0FQIEZpb3JpIGVsZW1lbnRzIHNob3dzIGFuIGVtcHR5IGluZGljYXRvciBpbiBkaXNwbGF5IG1vZGUgZm9yIHRoZSB0ZXh0IGFuZCBsaW5rc1xuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdHNob3dFbXB0eUluZGljYXRvcjoge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRkaXNwbGF5T25seToge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBNYW5kYXRvcnkgY29udGV4dCB0byB0aGUgQ29sbGVjdGlvbkZpZWxkXG5cdFx0XHQgKi9cblx0XHRcdGNvbnRleHRQYXRoOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRcdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0XHRcdCRraW5kOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIl1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGNyZWF0ZTogZnVuY3Rpb24gKG9Qcm9wczogYW55KSB7XG5cdFx0bGV0IG9EYXRhTW9kZWxQYXRoID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvUHJvcHMubWV0YVBhdGgsIG9Qcm9wcy5jb250ZXh0UGF0aCk7XG5cdFx0Y29uc3Qgb0RhdGFGaWVsZENvbnZlcnRlZCA9IE1ldGFNb2RlbENvbnZlcnRlci5jb252ZXJ0TWV0YU1vZGVsQ29udGV4dChvUHJvcHMubWV0YVBhdGgpO1xuXHRcdGNvbnN0IHNFeHRyYVBhdGggPSBvRGF0YUZpZWxkQ29udmVydGVkLlZhbHVlLnBhdGg7XG5cblx0XHRvUHJvcHMudmlzaWJsZSA9IGdldFZpc2libGVFeHByZXNzaW9uKG9EYXRhTW9kZWxQYXRoLCBvUHJvcHMuZm9ybWF0T3B0aW9ucyk7XG5cdFx0aWYgKHNFeHRyYVBhdGggJiYgc0V4dHJhUGF0aC5sZW5ndGggPiAwKSB7XG5cdFx0XHRvRGF0YU1vZGVsUGF0aCA9IERhdGFNb2RlbFBhdGhIZWxwZXIuZW5oYW5jZURhdGFNb2RlbFBhdGgob0RhdGFNb2RlbFBhdGgsIHNFeHRyYVBhdGgpO1xuXHRcdH1cblx0XHRjb25zdCBiSW5zZXJ0YWJsZSA9IERhdGFNb2RlbFBhdGhIZWxwZXIuaXNQYXRoSW5zZXJ0YWJsZShvRGF0YU1vZGVsUGF0aCk7XG5cdFx0Y29uc3QgYkRlbGV0ZU5hdmlnYXRpb25SZXN0cmljdGlvbiA9IERhdGFNb2RlbFBhdGhIZWxwZXIuaXNQYXRoRGVsZXRhYmxlKG9EYXRhTW9kZWxQYXRoLCB7XG5cdFx0XHRpZ25vcmVUYXJnZXRDb2xsZWN0aW9uOiB0cnVlLFxuXHRcdFx0YXV0aG9yaXplVW5yZXNvbHZhYmxlOiB0cnVlXG5cdFx0fSk7XG5cdFx0Y29uc3QgYkRlbGV0ZVBhdGggPSBEYXRhTW9kZWxQYXRoSGVscGVyLmlzUGF0aERlbGV0YWJsZShvRGF0YU1vZGVsUGF0aCk7XG5cdFx0Ly8gZGVsZXRhYmxlOlxuXHRcdC8vXHRcdGlmIHJlc3RyaWN0aW9ucyBjb21lIGZyb20gTmF2aWdhdGlvbiB3ZSBhcHBseSBpdFxuXHRcdC8vXHRcdG90aGVyd2lzZSB3ZSBhcHBseSByZXN0cmljdGlvbnMgZGVmaW5lZCBvbiB0YXJnZXQgY29sbGVjdGlvbiBvbmx5IGlmIGl0J3MgYSBjb25zdGFudFxuXHRcdC8vICAgICAgb3RoZXJ3aXNlIGl0J3MgdHJ1ZSFcblx0XHRjb25zdCBiRGVsZXRhYmxlID0gaWZFbHNlKFxuXHRcdFx0YkRlbGV0ZU5hdmlnYXRpb25SZXN0cmljdGlvbi5fdHlwZSA9PT0gXCJVbnJlc29sdmFibGVcIixcblx0XHRcdG9yKG5vdChpc0NvbnN0YW50KGJEZWxldGVQYXRoKSksIGJEZWxldGVQYXRoKSxcblx0XHRcdGJEZWxldGVQYXRoXG5cdFx0KTtcblx0XHRvUHJvcHMuZWRpdE1vZGUgPVxuXHRcdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMuZGlzcGxheU9ubHkgPT09IFwidHJ1ZVwiXG5cdFx0XHRcdD8gXCJEaXNwbGF5XCJcblx0XHRcdFx0OiBjb21waWxlRXhwcmVzc2lvbihpZkVsc2UoYW5kKGJJbnNlcnRhYmxlLCBiRGVsZXRhYmxlLCBVSS5Jc0VkaXRhYmxlKSwgY29uc3RhbnQoXCJFZGl0YWJsZVwiKSwgY29uc3RhbnQoXCJEaXNwbGF5XCIpKSk7XG5cdFx0b1Byb3BzLmRpc3BsYXlNb2RlID0gZ2V0RGlzcGxheU1vZGUob0RhdGFNb2RlbFBhdGgpO1xuXG5cdFx0Y29uc3QgbXVsdGlJbnB1dFNldHRpbmdzID0gQ29sbGVjdGlvbkZpZWxkLl9nZXRNdWx0aUlucHV0U2V0dGluZ3Mob0RhdGFNb2RlbFBhdGgsIG9Qcm9wcy5mb3JtYXRPcHRpb25zKTtcblx0XHRvUHJvcHMudGV4dCA9IG11bHRpSW5wdXRTZXR0aW5ncy50ZXh0O1xuXHRcdG9Qcm9wcy5jb2xsZWN0aW9uID1cblx0XHRcdG9Qcm9wcy5lZGl0TW9kZSA9PT0gXCJEaXNwbGF5XCIgPyBtdWx0aUlucHV0U2V0dGluZ3MuY29sbGVjdGlvbkJpbmRpbmdEaXNwbGF5IDogbXVsdGlJbnB1dFNldHRpbmdzLmNvbGxlY3Rpb25CaW5kaW5nRWRpdDtcblx0XHRvUHJvcHMua2V5ID0gbXVsdGlJbnB1dFNldHRpbmdzLmtleTtcblx0XHRyZXR1cm4gb1Byb3BzO1xuXHR9LFxuXHRfZ2V0TXVsdGlJbnB1dFNldHRpbmdzOiBmdW5jdGlvbiAoXG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsUGF0aEhlbHBlci5EYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdGZvcm1hdE9wdGlvbnM6IHsgbWVhc3VyZURpc3BsYXlNb2RlPzogc3RyaW5nIH1cblx0KTogTXVsdGlJbnB1dFNldHRpbmdzIHtcblx0XHRjb25zdCB7IGNvbGxlY3Rpb25QYXRoLCBpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aCB9ID0gQ29sbGVjdGlvbkZpZWxkLl9nZXRQYXRoU3RydWN0dXJlKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpO1xuXHRcdGNvbnN0IGNvbGxlY3Rpb25CaW5kaW5nRGlzcGxheSA9IGB7cGF0aDonJHtjb2xsZWN0aW9uUGF0aH0nLCB0ZW1wbGF0ZVNoYXJlYWJsZTogZmFsc2V9YDtcblx0XHRjb25zdCBjb2xsZWN0aW9uQmluZGluZ0VkaXQgPSBge3BhdGg6JyR7Y29sbGVjdGlvblBhdGh9JywgcGFyYW1ldGVyczogeyQkb3duUmVxdWVzdCA6IHRydWV9LCB0ZW1wbGF0ZVNoYXJlYWJsZTogZmFsc2V9YDtcblxuXHRcdGNvbnN0IG9Qcm9wZXJ0eURlZmluaXRpb24gPVxuXHRcdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QudHlwZSA9PT0gXCJQcm9wZXJ0eVBhdGhcIlxuXHRcdFx0XHQ/IChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC4kdGFyZ2V0IGFzIFByb3BlcnR5KVxuXHRcdFx0XHQ6IChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eSk7XG5cdFx0Y29uc3QgY29tbW9uVGV4dCA9IG9Qcm9wZXJ0eURlZmluaXRpb24uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dDtcblx0XHRjb25zdCByZWxhdGl2ZUxvY2F0aW9uID0gRGF0YU1vZGVsUGF0aEhlbHBlci5nZXRSZWxhdGl2ZVBhdGhzKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpO1xuXG5cdFx0Y29uc3QgdGV4dEV4cHJlc3Npb24gPSBjb21tb25UZXh0XG5cdFx0XHQ/IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihjb21tb25UZXh0LCByZWxhdGl2ZUxvY2F0aW9uKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPilcblx0XHRcdDogZ2V0VmFsdWVCaW5kaW5nKGl0ZW1EYXRhTW9kZWxPYmplY3RQYXRoLCBmb3JtYXRPcHRpb25zLCB0cnVlKTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dGV4dDogdGV4dEV4cHJlc3Npb24sXG5cdFx0XHRjb2xsZWN0aW9uQmluZGluZ0Rpc3BsYXk6IGNvbGxlY3Rpb25CaW5kaW5nRGlzcGxheSxcblx0XHRcdGNvbGxlY3Rpb25CaW5kaW5nRWRpdDogY29sbGVjdGlvbkJpbmRpbmdFZGl0LFxuXHRcdFx0a2V5OiBnZXRWYWx1ZUJpbmRpbmcoaXRlbURhdGFNb2RlbE9iamVjdFBhdGgsIGZvcm1hdE9wdGlvbnMsIHRydWUpXG5cdFx0fTtcblx0fSxcblx0Ly8gUHJvY2VzcyB0aGUgZGF0YU1vZGVsUGF0aCB0byBmaW5kIHRoZSBjb2xsZWN0aW9uIGFuZCB0aGUgcmVsYXRpdmUgRGF0YU1vZGVsUGF0aCBmb3IgdGhlIGl0ZW0uXG5cdF9nZXRQYXRoU3RydWN0dXJlOiBmdW5jdGlvbiAoZGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsUGF0aEhlbHBlci5EYXRhTW9kZWxPYmplY3RQYXRoKTogb2JqZWN0IHtcblx0XHRsZXQgZmlyc3RDb2xsZWN0aW9uUGF0aCA9IFwiXCI7XG5cblx0XHRsZXQgY3VycmVudEVudGl0eVNldCA9IGRhdGFNb2RlbE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uPy50YXJnZXRFbnRpdHlTZXRcblx0XHRcdD8gZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24udGFyZ2V0RW50aXR5U2V0XG5cdFx0XHQ6IGRhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQ7XG5cdFx0Y29uc3QgbmF2aWdhdGVkUGF0aHM6IHN0cmluZ1tdID0gW107XG5cdFx0Y29uc3QgY29udGV4dE5hdnNGb3JJdGVtOiBOYXZpZ2F0aW9uUHJvcGVydHlbXSA9IGRhdGFNb2RlbE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uPy5uYXZpZ2F0aW9uUHJvcGVydGllcyB8fCBbXTtcblx0XHRmb3IgKGNvbnN0IG5hdlByb3Agb2YgZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcykge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQhZGF0YU1vZGVsT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24gfHxcblx0XHRcdFx0IWRhdGFNb2RlbE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uPy5uYXZpZ2F0aW9uUHJvcGVydGllcy5zb21lKFxuXHRcdFx0XHRcdChjb250ZXh0TmF2UHJvcCkgPT4gY29udGV4dE5hdlByb3AuZnVsbHlRdWFsaWZpZWROYW1lID09PSBuYXZQcm9wLmZ1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdFx0XHQpXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gaW4gY2FzZSBvZiByZWxhdGl2ZSBlbnRpdHlTZXRQYXRoIHdlIGRvbid0IGNvbnNpZGVyIG5hdmlnYXRpb25QYXRoIHRoYXQgYXJlIGFscmVhZHkgaW4gdGhlIGNvbnRleHRcblx0XHRcdFx0bmF2aWdhdGVkUGF0aHMucHVzaChuYXZQcm9wLm5hbWUpO1xuXHRcdFx0XHRjb250ZXh0TmF2c0Zvckl0ZW0ucHVzaChuYXZQcm9wKTtcblx0XHRcdH1cblx0XHRcdGlmIChjdXJyZW50RW50aXR5U2V0ICYmIGN1cnJlbnRFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZy5oYXNPd25Qcm9wZXJ0eShuYXZQcm9wLm5hbWUpKSB7XG5cdFx0XHRcdGN1cnJlbnRFbnRpdHlTZXQgPSBjdXJyZW50RW50aXR5U2V0Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdbbmF2UHJvcC5uYW1lXSBhcyBFbnRpdHlTZXQ7XG5cdFx0XHRcdGlmIChuYXZQcm9wLmlzQ29sbGVjdGlvbikge1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZpcnN0Q29sbGVjdGlvblBhdGggPSBgJHtuYXZpZ2F0ZWRQYXRocy5qb2luKFwiL1wiKX1gO1xuXHRcdGNvbnN0IGl0ZW1EYXRhTW9kZWxPYmplY3RQYXRoID0gT2JqZWN0LmFzc2lnbih7fSwgZGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0aWYgKGl0ZW1EYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbikge1xuXHRcdFx0aXRlbURhdGFNb2RlbE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uLm5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gY29udGV4dE5hdnNGb3JJdGVtO1xuXHRcdH1cblxuXHRcdHJldHVybiB7IGNvbGxlY3Rpb25QYXRoOiBmaXJzdENvbGxlY3Rpb25QYXRoLCBpdGVtRGF0YU1vZGVsT2JqZWN0UGF0aDogaXRlbURhdGFNb2RlbE9iamVjdFBhdGggfTtcblx0fVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IENvbGxlY3Rpb25GaWVsZDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFB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