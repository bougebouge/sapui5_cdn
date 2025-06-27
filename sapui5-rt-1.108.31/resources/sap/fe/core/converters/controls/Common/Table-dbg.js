/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/helpers/Key", "sap/fe/core/formatters/TableFormatter", "sap/fe/core/formatters/TableFormatterTypes", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/EntitySetHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/macros/internal/helpers/ActionHelper", "../../helpers/Aggregation", "../../helpers/DataFieldHelper", "../../helpers/ID", "../../ManifestSettings", "./Criticality", "./table/StandardActions"], function (DataField, Action, BindingHelper, ConfigurableObject, IssueManager, Key, tableFormatters, TableFormatterTypes, BindingToolkit, ModelHelper, StableIdHelper, DataModelPathHelper, DisplayModeFormatter, EntitySetHelper, PropertyHelper, ActionHelper, Aggregation, DataFieldHelper, ID, ManifestSettings, Criticality, StandardActions) {
  "use strict";

  var _exports = {};
  var isInDisplayMode = StandardActions.isInDisplayMode;
  var isDraftOrStickySupported = StandardActions.isDraftOrStickySupported;
  var getStandardActionPaste = StandardActions.getStandardActionPaste;
  var getStandardActionMassEdit = StandardActions.getStandardActionMassEdit;
  var getStandardActionDelete = StandardActions.getStandardActionDelete;
  var getStandardActionCreate = StandardActions.getStandardActionCreate;
  var getRestrictions = StandardActions.getRestrictions;
  var getMassEditVisibility = StandardActions.getMassEditVisibility;
  var getInsertUpdateActionsTemplating = StandardActions.getInsertUpdateActionsTemplating;
  var getDeleteVisibility = StandardActions.getDeleteVisibility;
  var getCreationRow = StandardActions.getCreationRow;
  var getCreateVisibility = StandardActions.getCreateVisibility;
  var generateStandardActionsContext = StandardActions.generateStandardActionsContext;
  var getMessageTypeFromCriticalityType = Criticality.getMessageTypeFromCriticalityType;
  var VisualizationType = ManifestSettings.VisualizationType;
  var VariantManagementType = ManifestSettings.VariantManagementType;
  var TemplateType = ManifestSettings.TemplateType;
  var SelectionMode = ManifestSettings.SelectionMode;
  var Importance = ManifestSettings.Importance;
  var HorizontalAlign = ManifestSettings.HorizontalAlign;
  var CreationMode = ManifestSettings.CreationMode;
  var AvailabilityType = ManifestSettings.AvailabilityType;
  var ActionType = ManifestSettings.ActionType;
  var getTableID = ID.getTableID;
  var isReferencePropertyStaticallyHidden = DataFieldHelper.isReferencePropertyStaticallyHidden;
  var AggregationHelper = Aggregation.AggregationHelper;
  var isProperty = PropertyHelper.isProperty;
  var isPathExpression = PropertyHelper.isPathExpression;
  var isNavigationProperty = PropertyHelper.isNavigationProperty;
  var getTargetValueOnDataPoint = PropertyHelper.getTargetValueOnDataPoint;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getAssociatedTimezoneProperty = PropertyHelper.getAssociatedTimezoneProperty;
  var getAssociatedCurrencyProperty = PropertyHelper.getAssociatedCurrencyProperty;
  var getNonSortablePropertiesRestrictions = EntitySetHelper.getNonSortablePropertiesRestrictions;
  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  var EDM_TYPE_MAPPING = DisplayModeFormatter.EDM_TYPE_MAPPING;
  var isPathUpdatable = DataModelPathHelper.isPathUpdatable;
  var isPathSearchable = DataModelPathHelper.isPathSearchable;
  var isPathDeletable = DataModelPathHelper.isPathDeletable;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var replaceSpecialChars = StableIdHelper.replaceSpecialChars;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var MessageType = TableFormatterTypes.MessageType;
  var KeyHelper = Key.KeyHelper;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategoryType = IssueManager.IssueCategoryType;
  var IssueCategory = IssueManager.IssueCategory;
  var Placement = ConfigurableObject.Placement;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var removeDuplicateActions = Action.removeDuplicateActions;
  var isActionNavigable = Action.isActionNavigable;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var isDataFieldTypes = DataField.isDataFieldTypes;
  var isDataFieldForActionAbstract = DataField.isDataFieldForActionAbstract;
  var isDataFieldAlwaysHidden = DataField.isDataFieldAlwaysHidden;
  var getSemanticObjectPath = DataField.getSemanticObjectPath;
  var getDataFieldDataType = DataField.getDataFieldDataType;
  var collectRelatedPropertiesRecursively = DataField.collectRelatedPropertiesRecursively;
  var collectRelatedProperties = DataField.collectRelatedProperties;
  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  var ColumnType; // Custom Column from Manifest
  (function (ColumnType) {
    ColumnType["Default"] = "Default";
    ColumnType["Annotation"] = "Annotation";
    ColumnType["Slot"] = "Slot";
  })(ColumnType || (ColumnType = {}));
  /**
   * Returns an array of all annotation-based and manifest-based table actions.
   *
   * @param lineItemAnnotation
   * @param visualizationPath
   * @param converterContext
   * @param navigationSettings
   * @returns The complete table actions
   */
  function getTableActions(lineItemAnnotation, visualizationPath, converterContext, navigationSettings) {
    var aTableActions = getTableAnnotationActions(lineItemAnnotation, visualizationPath, converterContext);
    var aAnnotationActions = aTableActions.tableActions;
    var aHiddenActions = aTableActions.hiddenTableActions;
    var manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, converterContext, aAnnotationActions, navigationSettings, true, aHiddenActions);
    var actions = insertCustomElements(aAnnotationActions, manifestActions.actions, {
      isNavigable: "overwrite",
      enableOnSelect: "overwrite",
      enableAutoScroll: "overwrite",
      enabled: "overwrite",
      visible: "overwrite",
      defaultValuesExtensionFunction: "overwrite",
      command: "overwrite"
    });
    return {
      "actions": actions,
      "commandActions": manifestActions.commandActions
    };
  }

  /**
   * Returns an array of all columns, annotation-based as well as manifest based.
   * They are sorted and some properties can be overwritten via the manifest (check out the keys that can be overwritten).
   *
   * @param lineItemAnnotation Collection of data fields for representation in a table or list
   * @param visualizationPath
   * @param converterContext
   * @param navigationSettings
   * @returns Returns all table columns that should be available, regardless of templating or personalization or their origin
   */
  _exports.getTableActions = getTableActions;
  function getTableColumns(lineItemAnnotation, visualizationPath, converterContext, navigationSettings) {
    var annotationColumns = getColumnsFromAnnotations(lineItemAnnotation, visualizationPath, converterContext);
    var manifestColumns = getColumnsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).columns, annotationColumns, converterContext, converterContext.getAnnotationEntityType(lineItemAnnotation), navigationSettings);
    return insertCustomElements(annotationColumns, manifestColumns, {
      width: "overwrite",
      importance: "overwrite",
      horizontalAlign: "overwrite",
      availability: "overwrite",
      isNavigable: "overwrite",
      settings: "overwrite",
      formatOptions: "overwrite"
    });
  }

  /**
   * Retrieve the custom aggregation definitions from the entityType.
   *
   * @param entityType The target entity type.
   * @param tableColumns The array of columns for the entity type.
   * @param converterContext The converter context.
   * @returns The aggregate definitions from the entityType, or undefined if the entity doesn't support analytical queries.
   */
  _exports.getTableColumns = getTableColumns;
  var getAggregateDefinitionsFromEntityType = function (entityType, tableColumns, converterContext) {
    var aggregationHelper = new AggregationHelper(entityType, converterContext);
    function findColumnFromPath(path) {
      return tableColumns.find(function (column) {
        var annotationColumn = column;
        return annotationColumn.propertyInfos === undefined && annotationColumn.relativePath === path;
      });
    }
    if (!aggregationHelper.isAnalyticsSupported()) {
      return undefined;
    }

    // Keep a set of all currency/unit properties, as we don't want to consider them as aggregates
    // They are aggregates for technical reasons (to manage multi-units situations) but it doesn't make sense from a user standpoint
    var mCurrencyOrUnitProperties = new Set();
    tableColumns.forEach(function (oColumn) {
      var oTableColumn = oColumn;
      if (oTableColumn.unit) {
        mCurrencyOrUnitProperties.add(oTableColumn.unit);
      }
    });
    var aCustomAggregateAnnotations = aggregationHelper.getCustomAggregateDefinitions();
    var mRawDefinitions = {};
    aCustomAggregateAnnotations.forEach(function (annotation) {
      var oAggregatedProperty = aggregationHelper._entityType.entityProperties.find(function (oProperty) {
        return oProperty.name === annotation.qualifier;
      });
      if (oAggregatedProperty) {
        var _annotation$annotatio, _annotation$annotatio2;
        var aContextDefiningProperties = (_annotation$annotatio = annotation.annotations) === null || _annotation$annotatio === void 0 ? void 0 : (_annotation$annotatio2 = _annotation$annotatio.Aggregation) === null || _annotation$annotatio2 === void 0 ? void 0 : _annotation$annotatio2.ContextDefiningProperties;
        mRawDefinitions[oAggregatedProperty.name] = aContextDefiningProperties ? aContextDefiningProperties.map(function (oCtxDefProperty) {
          return oCtxDefProperty.value;
        }) : [];
      }
    });
    var mResult = {};
    tableColumns.forEach(function (oColumn) {
      var oTableColumn = oColumn;
      if (oTableColumn.propertyInfos === undefined && oTableColumn.relativePath) {
        var aRawContextDefiningProperties = mRawDefinitions[oTableColumn.relativePath];

        // Ignore aggregates corresponding to currencies or units of measure and dummy created property for datapoint target Value
        if (aRawContextDefiningProperties && !mCurrencyOrUnitProperties.has(oTableColumn.name) && !oTableColumn.isDataPointFakeTargetProperty) {
          mResult[oTableColumn.name] = {
            defaultAggregate: {},
            relativePath: oTableColumn.relativePath
          };
          var aContextDefiningProperties = [];
          aRawContextDefiningProperties.forEach(function (contextDefiningPropertyName) {
            var foundColumn = findColumnFromPath(contextDefiningPropertyName);
            if (foundColumn) {
              aContextDefiningProperties.push(foundColumn.name);
            }
          });
          if (aContextDefiningProperties.length) {
            mResult[oTableColumn.name].defaultAggregate.contextDefiningProperties = aContextDefiningProperties;
          }
        }
      }
    });
    return mResult;
  };

  /**
   * Updates a table visualization for analytical use cases.
   *
   * @param tableVisualization The visualization to be updated
   * @param entityType The entity type displayed in the table
   * @param converterContext The converter context
   * @param presentationVariantAnnotation The presentationVariant annotation (if any)
   */
  _exports.getAggregateDefinitionsFromEntityType = getAggregateDefinitionsFromEntityType;
  function updateTableVisualizationForAnalytics(tableVisualization, entityType, converterContext, presentationVariantAnnotation) {
    if (tableVisualization.control.type === "AnalyticalTable") {
      var aggregatesDefinitions = getAggregateDefinitionsFromEntityType(entityType, tableVisualization.columns, converterContext),
        aggregationHelper = new AggregationHelper(entityType, converterContext);
      if (aggregatesDefinitions) {
        tableVisualization.enableAnalytics = true;
        tableVisualization.aggregates = aggregatesDefinitions;
        var allowedTransformations = aggregationHelper.getAllowedTransformations();
        tableVisualization.enableAnalyticsSearch = allowedTransformations ? allowedTransformations.indexOf("search") >= 0 : true;

        // Add group and sort conditions from the presentation variant
        tableVisualization.annotation.groupConditions = getGroupConditions(presentationVariantAnnotation, tableVisualization.columns, tableVisualization.control.type);
        tableVisualization.annotation.aggregateConditions = getAggregateConditions(presentationVariantAnnotation, tableVisualization.columns);
      }
      tableVisualization.control.type = "GridTable"; // AnalyticalTable isn't a real type for the MDC:Table, so we always switch back to Grid
    } else if (tableVisualization.control.type === "ResponsiveTable") {
      tableVisualization.annotation.groupConditions = getGroupConditions(presentationVariantAnnotation, tableVisualization.columns, tableVisualization.control.type);
    }
  }

  /**
   * Get the navigation target path from manifest settings.
   *
   * @param converterContext The converter context
   * @param navigationPropertyPath The navigation path to check in the manifest settings
   * @returns Navigation path from manifest settings
   */
  function getNavigationTargetPath(converterContext, navigationPropertyPath) {
    var manifestWrapper = converterContext.getManifestWrapper();
    if (navigationPropertyPath && manifestWrapper.getNavigationConfiguration(navigationPropertyPath)) {
      var navConfig = manifestWrapper.getNavigationConfiguration(navigationPropertyPath);
      if (Object.keys(navConfig).length > 0) {
        return navigationPropertyPath;
      }
    }
    var dataModelPath = converterContext.getDataModelObjectPath();
    var contextPath = converterContext.getContextPath();
    var navConfigForContextPath = manifestWrapper.getNavigationConfiguration(contextPath);
    if (navConfigForContextPath && Object.keys(navConfigForContextPath).length > 0) {
      return contextPath;
    }
    return dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
  }

  /**
   * Sets the 'unit' and 'textArrangement' properties in columns when necessary.
   *
   * @param entityType The entity type displayed in the table
   * @param tableColumns The columns to be updated
   */
  function updateLinkedProperties(entityType, tableColumns) {
    function findColumnByPath(path) {
      return tableColumns.find(function (column) {
        var annotationColumn = column;
        return annotationColumn.propertyInfos === undefined && annotationColumn.relativePath === path;
      });
    }
    tableColumns.forEach(function (oColumn) {
      var oTableColumn = oColumn;
      if (oTableColumn.propertyInfos === undefined && oTableColumn.relativePath) {
        var oProperty = entityType.entityProperties.find(function (oProp) {
          return oProp.name === oTableColumn.relativePath;
        });
        if (oProperty) {
          var _oProperty$annotation, _oProperty$annotation2, _oProperty$annotation7;
          var oUnit = getAssociatedCurrencyProperty(oProperty) || getAssociatedUnitProperty(oProperty);
          var oTimezone = getAssociatedTimezoneProperty(oProperty);
          var sTimezone = oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation = oProperty.annotations) === null || _oProperty$annotation === void 0 ? void 0 : (_oProperty$annotation2 = _oProperty$annotation.Common) === null || _oProperty$annotation2 === void 0 ? void 0 : _oProperty$annotation2.Timezone;
          if (oUnit) {
            var oUnitColumn = findColumnByPath(oUnit.name);
            oTableColumn.unit = oUnitColumn === null || oUnitColumn === void 0 ? void 0 : oUnitColumn.name;
          } else {
            var _oProperty$annotation3, _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6;
            var sUnit = (oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation3 = oProperty.annotations) === null || _oProperty$annotation3 === void 0 ? void 0 : (_oProperty$annotation4 = _oProperty$annotation3.Measures) === null || _oProperty$annotation4 === void 0 ? void 0 : _oProperty$annotation4.ISOCurrency) || (oProperty === null || oProperty === void 0 ? void 0 : (_oProperty$annotation5 = oProperty.annotations) === null || _oProperty$annotation5 === void 0 ? void 0 : (_oProperty$annotation6 = _oProperty$annotation5.Measures) === null || _oProperty$annotation6 === void 0 ? void 0 : _oProperty$annotation6.Unit);
            if (sUnit) {
              oTableColumn.unitText = "".concat(sUnit);
            }
          }
          if (oTimezone) {
            var oTimezoneColumn = findColumnByPath(oTimezone.name);
            oTableColumn.timezone = oTimezoneColumn === null || oTimezoneColumn === void 0 ? void 0 : oTimezoneColumn.name;
          } else if (sTimezone) {
            oTableColumn.timezoneText = sTimezone.toString();
          }
          var displayMode = getDisplayMode(oProperty),
            textAnnotation = (_oProperty$annotation7 = oProperty.annotations.Common) === null || _oProperty$annotation7 === void 0 ? void 0 : _oProperty$annotation7.Text;
          if (isPathExpression(textAnnotation) && displayMode !== "Value") {
            var oTextColumn = findColumnByPath(textAnnotation.path);
            if (oTextColumn && oTextColumn.name !== oTableColumn.name) {
              oTableColumn.textArrangement = {
                textProperty: oTextColumn.name,
                mode: displayMode
              };
            }
          }
        }
      }
    });
  }
  _exports.updateLinkedProperties = updateLinkedProperties;
  function getSemanticKeysAndTitleInfo(converterContext) {
    var _converterContext$get, _converterContext$get2, _converterContext$get3, _converterContext$get4, _converterContext$get5, _converterContext$get6, _converterContext$get7, _converterContext$get8, _converterContext$get9, _converterContext$get10, _converterContext$get11, _converterContext$get12, _converterContext$get13;
    var headerInfoTitlePath = (_converterContext$get = converterContext.getAnnotationEntityType()) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.annotations) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.UI) === null || _converterContext$get3 === void 0 ? void 0 : (_converterContext$get4 = _converterContext$get3.HeaderInfo) === null || _converterContext$get4 === void 0 ? void 0 : (_converterContext$get5 = _converterContext$get4.Title) === null || _converterContext$get5 === void 0 ? void 0 : (_converterContext$get6 = _converterContext$get5.Value) === null || _converterContext$get6 === void 0 ? void 0 : _converterContext$get6.path;
    var semanticKeyAnnotations = (_converterContext$get7 = converterContext.getAnnotationEntityType()) === null || _converterContext$get7 === void 0 ? void 0 : (_converterContext$get8 = _converterContext$get7.annotations) === null || _converterContext$get8 === void 0 ? void 0 : (_converterContext$get9 = _converterContext$get8.Common) === null || _converterContext$get9 === void 0 ? void 0 : _converterContext$get9.SemanticKey;
    var headerInfoTypeName = converterContext === null || converterContext === void 0 ? void 0 : (_converterContext$get10 = converterContext.getAnnotationEntityType()) === null || _converterContext$get10 === void 0 ? void 0 : (_converterContext$get11 = _converterContext$get10.annotations) === null || _converterContext$get11 === void 0 ? void 0 : (_converterContext$get12 = _converterContext$get11.UI) === null || _converterContext$get12 === void 0 ? void 0 : (_converterContext$get13 = _converterContext$get12.HeaderInfo) === null || _converterContext$get13 === void 0 ? void 0 : _converterContext$get13.TypeName;
    var semanticKeyColumns = [];
    if (semanticKeyAnnotations) {
      semanticKeyAnnotations.forEach(function (oColumn) {
        semanticKeyColumns.push(oColumn.value);
      });
    }
    return {
      headerInfoTitlePath: headerInfoTitlePath,
      semanticKeyColumns: semanticKeyColumns,
      headerInfoTypeName: headerInfoTypeName
    };
  }
  function createTableVisualization(lineItemAnnotation, visualizationPath, converterContext, presentationVariantAnnotation, isCondensedTableLayoutCompliant, viewConfiguration) {
    var tableManifestConfig = getTableManifestConfiguration(lineItemAnnotation, visualizationPath, converterContext, isCondensedTableLayoutCompliant);
    var _splitPath = splitPath(visualizationPath),
      navigationPropertyPath = _splitPath.navigationPropertyPath;
    var navigationTargetPath = getNavigationTargetPath(converterContext, navigationPropertyPath);
    var navigationSettings = converterContext.getManifestWrapper().getNavigationConfiguration(navigationTargetPath);
    var columns = getTableColumns(lineItemAnnotation, visualizationPath, converterContext, navigationSettings);
    var operationAvailableMap = getOperationAvailableMap(lineItemAnnotation, converterContext);
    var semanticKeysAndHeaderInfoTitle = getSemanticKeysAndTitleInfo(converterContext);
    var tableActions = getTableActions(lineItemAnnotation, visualizationPath, converterContext, navigationSettings);
    var oVisualization = {
      type: VisualizationType.Table,
      annotation: getTableAnnotationConfiguration(lineItemAnnotation, visualizationPath, converterContext, tableManifestConfig, columns, presentationVariantAnnotation, viewConfiguration),
      control: tableManifestConfig,
      actions: removeDuplicateActions(tableActions.actions),
      commandActions: tableActions.commandActions,
      columns: columns,
      operationAvailableMap: JSON.stringify(operationAvailableMap),
      operationAvailableProperties: getOperationAvailableProperties(operationAvailableMap, converterContext),
      headerInfoTitle: semanticKeysAndHeaderInfoTitle.headerInfoTitlePath,
      semanticKeys: semanticKeysAndHeaderInfoTitle.semanticKeyColumns,
      headerInfoTypeName: semanticKeysAndHeaderInfoTitle.headerInfoTypeName
    };
    updateLinkedProperties(converterContext.getAnnotationEntityType(lineItemAnnotation), columns);
    updateTableVisualizationForAnalytics(oVisualization, converterContext.getAnnotationEntityType(lineItemAnnotation), converterContext, presentationVariantAnnotation);
    return oVisualization;
  }
  _exports.createTableVisualization = createTableVisualization;
  function createDefaultTableVisualization(converterContext) {
    var tableManifestConfig = getTableManifestConfiguration(undefined, "", converterContext, false);
    var columns = getColumnsFromEntityType({}, converterContext.getEntityType(), [], [], converterContext, tableManifestConfig.type, []);
    var operationAvailableMap = getOperationAvailableMap(undefined, converterContext);
    var semanticKeysAndHeaderInfoTitle = getSemanticKeysAndTitleInfo(converterContext);
    var oVisualization = {
      type: VisualizationType.Table,
      annotation: getTableAnnotationConfiguration(undefined, "", converterContext, tableManifestConfig, columns),
      control: tableManifestConfig,
      actions: [],
      columns: columns,
      operationAvailableMap: JSON.stringify(operationAvailableMap),
      operationAvailableProperties: getOperationAvailableProperties(operationAvailableMap, converterContext),
      headerInfoTitle: semanticKeysAndHeaderInfoTitle.headerInfoTitlePath,
      semanticKeys: semanticKeysAndHeaderInfoTitle.semanticKeyColumns,
      headerInfoTypeName: semanticKeysAndHeaderInfoTitle.headerInfoTypeName
    };
    updateLinkedProperties(converterContext.getEntityType(), columns);
    updateTableVisualizationForAnalytics(oVisualization, converterContext.getEntityType(), converterContext);
    return oVisualization;
  }

  /**
   * Gets the map of Core.OperationAvailable property paths for all DataFieldForActions.
   *
   * @param lineItemAnnotation The instance of the line item
   * @param converterContext The instance of the converter context
   * @returns The record containing all action names and their corresponding Core.OperationAvailable property paths
   */
  _exports.createDefaultTableVisualization = createDefaultTableVisualization;
  function getOperationAvailableMap(lineItemAnnotation, converterContext) {
    return ActionHelper.getOperationAvailableMap(lineItemAnnotation, "table", converterContext);
  }

  /**
   * Gets updatable propertyPath for the current entityset if valid.
   *
   * @param converterContext The instance of the converter context
   * @returns The updatable property for the rows
   */
  function getCurrentEntitySetUpdatablePath(converterContext) {
    var _entitySet$annotation, _entitySet$annotation2, _entitySet$annotation3;
    var restrictions = getRestrictions(converterContext);
    var entitySet = converterContext.getEntitySet();
    var updatable = restrictions.isUpdatable;
    var isOnlyDynamicOnCurrentEntity = !isConstant(updatable.expression) && updatable.navigationExpression._type === "Unresolvable";
    var updatablePropertyPath = entitySet === null || entitySet === void 0 ? void 0 : (_entitySet$annotation = entitySet.annotations.Capabilities) === null || _entitySet$annotation === void 0 ? void 0 : (_entitySet$annotation2 = _entitySet$annotation.UpdateRestrictions) === null || _entitySet$annotation2 === void 0 ? void 0 : (_entitySet$annotation3 = _entitySet$annotation2.Updatable) === null || _entitySet$annotation3 === void 0 ? void 0 : _entitySet$annotation3.path;
    return isOnlyDynamicOnCurrentEntity ? updatablePropertyPath : "";
  }

  /**
   * Method to retrieve all property paths assigned to the Core.OperationAvailable annotation.
   *
   * @param operationAvailableMap The record consisting of actions and their Core.OperationAvailable property paths
   * @param converterContext The instance of the converter context
   * @returns The CSV string of all property paths associated with the Core.OperationAvailable annotation
   */
  function getOperationAvailableProperties(operationAvailableMap, converterContext) {
    var properties = new Set();
    for (var actionName in operationAvailableMap) {
      var propertyName = operationAvailableMap[actionName];
      if (propertyName === null) {
        // Annotation configured with explicit 'null' (action advertisement relevant)
        properties.add(actionName);
      } else if (typeof propertyName === "string") {
        // Add property paths and not Constant values.
        properties.add(propertyName);
      }
    }
    if (properties.size) {
      var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3, _entityType$annotatio4, _entityType$annotatio5;
      // Some actions have an operation available based on property --> we need to load the HeaderInfo.Title property
      // so that the dialog on partial actions is displayed properly (BCP 2180271425)
      var entityType = converterContext.getEntityType();
      var titleProperty = (_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : (_entityType$annotatio3 = _entityType$annotatio2.HeaderInfo) === null || _entityType$annotatio3 === void 0 ? void 0 : (_entityType$annotatio4 = _entityType$annotatio3.Title) === null || _entityType$annotatio4 === void 0 ? void 0 : (_entityType$annotatio5 = _entityType$annotatio4.Value) === null || _entityType$annotatio5 === void 0 ? void 0 : _entityType$annotatio5.path;
      if (titleProperty) {
        properties.add(titleProperty);
      }
    }
    return Array.from(properties).join(",");
  }

  /**
   * Iterates over the DataFieldForAction and DataFieldForIntentBasedNavigation of a line item and
   * returns all the UI.Hidden annotation expressions.
   *
   * @param lineItemAnnotation Collection of data fields used for representation in a table or list
   * @param currentEntityType Current entity type
   * @param contextDataModelObjectPath Object path of the data model
   * @param isEntitySet
   * @returns All the `UI.Hidden` path expressions found in the relevant actions
   */
  function getUIHiddenExpForActionsRequiringContext(lineItemAnnotation, currentEntityType, contextDataModelObjectPath, isEntitySet) {
    var aUiHiddenPathExpressions = [];
    lineItemAnnotation.forEach(function (dataField) {
      var _dataField$ActionTarg, _dataField$Inline;
      // Check if the lineItem context is the same as that of the action:
      if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && dataField !== null && dataField !== void 0 && (_dataField$ActionTarg = dataField.ActionTarget) !== null && _dataField$ActionTarg !== void 0 && _dataField$ActionTarg.isBound && currentEntityType === (dataField === null || dataField === void 0 ? void 0 : dataField.ActionTarget.sourceEntityType) || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && dataField.RequiresContext && (dataField === null || dataField === void 0 ? void 0 : (_dataField$Inline = dataField.Inline) === null || _dataField$Inline === void 0 ? void 0 : _dataField$Inline.valueOf()) !== true) {
        var _dataField$annotation, _dataField$annotation2, _dataField$annotation3;
        if (typeof ((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.Hidden) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()) === "object") {
          aUiHiddenPathExpressions.push(equal(getBindingExpFromContext(dataField, contextDataModelObjectPath, isEntitySet), false));
        }
      }
    });
    return aUiHiddenPathExpressions;
  }

  /**
   * This method is used to change the context currently referenced by this binding by removing the last navigation property.
   *
   * It is used (specifically in this case), to transform a binding made for a NavProp context /MainObject/NavProp1/NavProp2,
   * into a binding on the previous context /MainObject/NavProp1.
   *
   * @param source DataFieldForAction | DataFieldForIntentBasedNavigation | CustomAction
   * @param contextDataModelObjectPath DataModelObjectPath
   * @param isEntitySet
   * @returns The binding expression
   */
  function getBindingExpFromContext(source, contextDataModelObjectPath, isEntitySet) {
    var _sExpression;
    var sExpression;
    if ((source === null || source === void 0 ? void 0 : source.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAction" || (source === null || source === void 0 ? void 0 : source.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
      var _annotations, _annotations$UI;
      sExpression = source === null || source === void 0 ? void 0 : (_annotations = source.annotations) === null || _annotations === void 0 ? void 0 : (_annotations$UI = _annotations.UI) === null || _annotations$UI === void 0 ? void 0 : _annotations$UI.Hidden;
    } else {
      sExpression = source === null || source === void 0 ? void 0 : source.visible;
    }
    var sPath;
    if ((_sExpression = sExpression) !== null && _sExpression !== void 0 && _sExpression.path) {
      sPath = sExpression.path;
    } else {
      sPath = sExpression;
    }
    if (sPath) {
      if (source !== null && source !== void 0 && source.visible) {
        sPath = sPath.substring(1, sPath.length - 1);
      }
      if (sPath.indexOf("/") > 0) {
        var _contextDataModelObje;
        //check if the navigation property is correct:
        var aSplitPath = sPath.split("/");
        var sNavigationPath = aSplitPath[0];
        if ((contextDataModelObjectPath === null || contextDataModelObjectPath === void 0 ? void 0 : (_contextDataModelObje = contextDataModelObjectPath.targetObject) === null || _contextDataModelObje === void 0 ? void 0 : _contextDataModelObje._type) === "NavigationProperty" && contextDataModelObjectPath.targetObject.partner === sNavigationPath) {
          return pathInModel(aSplitPath.slice(1).join("/"));
        } else {
          return constant(true);
        }
        // In case there is no navigation property, if it's an entitySet, the expression binding has to be returned:
      } else if (isEntitySet) {
        return pathInModel(sPath);
        // otherwise the expression binding cannot be taken into account for the selection mode evaluation:
      } else {
        return constant(true);
      }
    }
    return constant(true);
  }

  /**
   * Loop through the DataFieldForAction and DataFieldForIntentBasedNavigation of a line item and check
   * if at least one of them is always visible in the table toolbar (and requires a context).
   *
   * @param lineItemAnnotation Collection of data fields for representation in a table or list
   * @param currentEntityType Current Entity Type
   * @returns `true` if there is at least 1 action that meets the criteria
   */
  function hasBoundActionsAlwaysVisibleInToolBar(lineItemAnnotation, currentEntityType) {
    return lineItemAnnotation.some(function (dataField) {
      var _dataField$Inline2, _dataField$annotation4, _dataField$annotation5, _dataField$annotation6, _dataField$annotation7, _dataField$annotation8, _dataField$annotation9;
      if ((dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") && (dataField === null || dataField === void 0 ? void 0 : (_dataField$Inline2 = dataField.Inline) === null || _dataField$Inline2 === void 0 ? void 0 : _dataField$Inline2.valueOf()) !== true && (((_dataField$annotation4 = dataField.annotations) === null || _dataField$annotation4 === void 0 ? void 0 : (_dataField$annotation5 = _dataField$annotation4.UI) === null || _dataField$annotation5 === void 0 ? void 0 : (_dataField$annotation6 = _dataField$annotation5.Hidden) === null || _dataField$annotation6 === void 0 ? void 0 : _dataField$annotation6.valueOf()) === false || ((_dataField$annotation7 = dataField.annotations) === null || _dataField$annotation7 === void 0 ? void 0 : (_dataField$annotation8 = _dataField$annotation7.UI) === null || _dataField$annotation8 === void 0 ? void 0 : (_dataField$annotation9 = _dataField$annotation8.Hidden) === null || _dataField$annotation9 === void 0 ? void 0 : _dataField$annotation9.valueOf()) === undefined)) {
        if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
          var _dataField$ActionTarg2;
          // Check if the lineItem context is the same as that of the action:
          return (dataField === null || dataField === void 0 ? void 0 : (_dataField$ActionTarg2 = dataField.ActionTarget) === null || _dataField$ActionTarg2 === void 0 ? void 0 : _dataField$ActionTarg2.isBound) && currentEntityType === (dataField === null || dataField === void 0 ? void 0 : dataField.ActionTarget.sourceEntityType);
        } else if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
          return dataField.RequiresContext;
        }
      }
      return false;
    });
  }
  function hasCustomActionsAlwaysVisibleInToolBar(manifestActions) {
    return Object.keys(manifestActions).some(function (actionKey) {
      var _action$visible;
      var action = manifestActions[actionKey];
      if (action.requiresSelection && ((_action$visible = action.visible) === null || _action$visible === void 0 ? void 0 : _action$visible.toString()) === "true") {
        return true;
      }
      return false;
    });
  }

  /**
   * Iterates over the custom actions (with key requiresSelection) declared in the manifest for the current line item and returns all the
   * visible key values as an expression.
   *
   * @param manifestActions The actions defined in the manifest
   * @returns Array<Expression<boolean>> All the visible path expressions of the actions that meet the criteria
   */
  function getVisibleExpForCustomActionsRequiringContext(manifestActions) {
    var aVisiblePathExpressions = [];
    if (manifestActions) {
      Object.keys(manifestActions).forEach(function (actionKey) {
        var action = manifestActions[actionKey];
        if (action.requiresSelection === true && action.visible !== undefined) {
          if (typeof action.visible === "string") {
            var _action$visible2;
            /*The final aim would be to check if the path expression depends on the parent context
            and considers only those expressions for the expression evaluation,
            but currently not possible from the manifest as the visible key is bound on the parent entity.
            Tricky to differentiate the path as it's done for the Hidden annotation.
            For the time being we consider all the paths of the manifest*/

            aVisiblePathExpressions.push(resolveBindingString(action === null || action === void 0 ? void 0 : (_action$visible2 = action.visible) === null || _action$visible2 === void 0 ? void 0 : _action$visible2.valueOf()));
          }
        }
      });
    }
    return aVisiblePathExpressions;
  }

  /**
   * Evaluate if the path is statically deletable or updatable.
   *
   * @param converterContext
   * @returns The table capabilities
   */
  function getCapabilityRestriction(converterContext) {
    var isDeletable = isPathDeletable(converterContext.getDataModelObjectPath());
    var isUpdatable = isPathUpdatable(converterContext.getDataModelObjectPath());
    return {
      isDeletable: !(isConstant(isDeletable) && isDeletable.value === false),
      isUpdatable: !(isConstant(isUpdatable) && isUpdatable.value === false)
    };
  }
  _exports.getCapabilityRestriction = getCapabilityRestriction;
  function getSelectionMode(lineItemAnnotation, visualizationPath, converterContext, isEntitySet, targetCapabilities, deleteButtonVisibilityExpression) {
    var _tableManifestSetting;
    var massEditVisibilityExpression = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : constant(false);
    if (!lineItemAnnotation) {
      return SelectionMode.None;
    }
    var tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    var selectionMode = (_tableManifestSetting = tableManifestSettings.tableSettings) === null || _tableManifestSetting === void 0 ? void 0 : _tableManifestSetting.selectionMode;
    var aHiddenBindingExpressions = [],
      aVisibleBindingExpressions = [];
    var manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, converterContext, [], undefined, false);
    var isParentDeletable, parentEntitySetDeletable;
    if (converterContext.getTemplateType() === TemplateType.ObjectPage) {
      isParentDeletable = isPathDeletable(converterContext.getDataModelObjectPath());
      parentEntitySetDeletable = isParentDeletable ? compileExpression(isParentDeletable, true) : isParentDeletable;
    }
    var bMassEditEnabled = !isConstant(massEditVisibilityExpression) || massEditVisibilityExpression.value !== false;
    if (selectionMode && selectionMode === SelectionMode.None && deleteButtonVisibilityExpression) {
      if (converterContext.getTemplateType() === TemplateType.ObjectPage && bMassEditEnabled) {
        // Mass Edit in OP is enabled only in edit mode.
        return compileExpression(ifElse(and(UI.IsEditable, massEditVisibilityExpression), constant("Multi"), ifElse(deleteButtonVisibilityExpression, constant("Multi"), constant("None"))));
      } else if (bMassEditEnabled) {
        return SelectionMode.Multi;
      }
      return compileExpression(ifElse(deleteButtonVisibilityExpression, constant("Multi"), constant("None")));
    }
    if (!selectionMode || selectionMode === SelectionMode.Auto) {
      selectionMode = SelectionMode.Multi;
    }
    if (bMassEditEnabled) {
      // Override default selection mode when mass edit is visible
      selectionMode = selectionMode === SelectionMode.Single ? SelectionMode.Single : SelectionMode.Multi;
    }
    if (hasBoundActionsAlwaysVisibleInToolBar(lineItemAnnotation, converterContext.getEntityType()) || hasCustomActionsAlwaysVisibleInToolBar(manifestActions.actions)) {
      return selectionMode;
    }
    aHiddenBindingExpressions = getUIHiddenExpForActionsRequiringContext(lineItemAnnotation, converterContext.getEntityType(), converterContext.getDataModelObjectPath(), isEntitySet);
    aVisibleBindingExpressions = getVisibleExpForCustomActionsRequiringContext(manifestActions.actions);

    // No action requiring a context:
    if (aHiddenBindingExpressions.length === 0 && aVisibleBindingExpressions.length === 0 && (deleteButtonVisibilityExpression || bMassEditEnabled)) {
      if (!isEntitySet) {
        // Example: OP case
        if (targetCapabilities.isDeletable || parentEntitySetDeletable !== "false" || bMassEditEnabled) {
          // Building expression for delete and mass edit
          var buttonVisibilityExpression = or(deleteButtonVisibilityExpression || true,
          // default delete visibility as true
          massEditVisibilityExpression);
          return compileExpression(ifElse(and(UI.IsEditable, buttonVisibilityExpression), constant(selectionMode), constant(SelectionMode.None)));
        } else {
          return SelectionMode.None;
        }
        // EntitySet deletable:
      } else if (bMassEditEnabled) {
        // example: LR scenario
        return selectionMode;
      } else if (targetCapabilities.isDeletable && deleteButtonVisibilityExpression) {
        return compileExpression(ifElse(deleteButtonVisibilityExpression, constant(selectionMode), constant("None")));
        // EntitySet not deletable:
      } else {
        return SelectionMode.None;
      }
      // There are actions requiring a context:
    } else if (!isEntitySet) {
      // Example: OP case
      if (targetCapabilities.isDeletable || parentEntitySetDeletable !== "false" || bMassEditEnabled) {
        // Use selectionMode in edit mode if delete is enabled or mass edit is visible
        var editModebuttonVisibilityExpression = ifElse(bMassEditEnabled && !targetCapabilities.isDeletable, massEditVisibilityExpression, constant(true));
        return compileExpression(ifElse(and(UI.IsEditable, editModebuttonVisibilityExpression), constant(selectionMode), ifElse(or.apply(void 0, _toConsumableArray(aHiddenBindingExpressions.concat(aVisibleBindingExpressions))), constant(selectionMode), constant(SelectionMode.None))));
      } else {
        return compileExpression(ifElse(or.apply(void 0, _toConsumableArray(aHiddenBindingExpressions.concat(aVisibleBindingExpressions))), constant(selectionMode), constant(SelectionMode.None)));
      }
      //EntitySet deletable:
    } else if (targetCapabilities.isDeletable || bMassEditEnabled) {
      // Example: LR scenario
      return selectionMode;
      //EntitySet not deletable:
    } else {
      return compileExpression(ifElse(or.apply(void 0, _toConsumableArray(aHiddenBindingExpressions.concat(aVisibleBindingExpressions)).concat([massEditVisibilityExpression])), constant(selectionMode), constant(SelectionMode.None)));
    }
  }

  /**
   * Method to retrieve all table actions from annotations.
   *
   * @param lineItemAnnotation
   * @param visualizationPath
   * @param converterContext
   * @returns The table annotation actions
   */
  _exports.getSelectionMode = getSelectionMode;
  function getTableAnnotationActions(lineItemAnnotation, visualizationPath, converterContext) {
    var tableActions = [];
    var hiddenTableActions = [];
    if (lineItemAnnotation) {
      lineItemAnnotation.forEach(function (dataField) {
        var _dataField$annotation10, _dataField$annotation11, _dataField$annotation12, _dataField$annotation13, _dataField$annotation14, _dataField$annotation15, _dataField$annotation16, _dataField$annotation17, _dataField$annotation18, _dataField$annotation19;
        var tableAction;
        if (isDataFieldForActionAbstract(dataField) && !(((_dataField$annotation10 = dataField.annotations) === null || _dataField$annotation10 === void 0 ? void 0 : (_dataField$annotation11 = _dataField$annotation10.UI) === null || _dataField$annotation11 === void 0 ? void 0 : (_dataField$annotation12 = _dataField$annotation11.Hidden) === null || _dataField$annotation12 === void 0 ? void 0 : _dataField$annotation12.valueOf()) === true) && !dataField.Inline && !dataField.Determining) {
          var key = KeyHelper.generateKeyFromDataField(dataField);
          switch (dataField.$Type) {
            case "com.sap.vocabularies.UI.v1.DataFieldForAction":
              tableAction = {
                type: ActionType.DataFieldForAction,
                annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
                key: key,
                visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation13 = dataField.annotations) === null || _dataField$annotation13 === void 0 ? void 0 : (_dataField$annotation14 = _dataField$annotation13.UI) === null || _dataField$annotation14 === void 0 ? void 0 : _dataField$annotation14.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true))),
                isNavigable: true
              };
              break;
            case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
              tableAction = {
                type: ActionType.DataFieldForIntentBasedNavigation,
                annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
                key: key,
                visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation15 = dataField.annotations) === null || _dataField$annotation15 === void 0 ? void 0 : (_dataField$annotation16 = _dataField$annotation15.UI) === null || _dataField$annotation16 === void 0 ? void 0 : _dataField$annotation16.Hidden, [], undefined, converterContext.getRelativeModelPathFunction()), true)))
              };
              break;
            default:
              break;
          }
        } else if (((_dataField$annotation17 = dataField.annotations) === null || _dataField$annotation17 === void 0 ? void 0 : (_dataField$annotation18 = _dataField$annotation17.UI) === null || _dataField$annotation18 === void 0 ? void 0 : (_dataField$annotation19 = _dataField$annotation18.Hidden) === null || _dataField$annotation19 === void 0 ? void 0 : _dataField$annotation19.valueOf()) === true) {
          hiddenTableActions.push({
            type: ActionType.Default,
            key: KeyHelper.generateKeyFromDataField(dataField)
          });
        }
        if (tableAction) {
          tableActions.push(tableAction);
        }
      });
    }
    return {
      tableActions: tableActions,
      hiddenTableActions: hiddenTableActions
    };
  }
  function getHighlightRowBinding(criticalityAnnotation, isDraftRoot, targetEntityType) {
    var defaultHighlightRowDefinition = MessageType.None;
    if (criticalityAnnotation) {
      if (typeof criticalityAnnotation === "object") {
        defaultHighlightRowDefinition = getExpressionFromAnnotation(criticalityAnnotation);
      } else {
        // Enum Value so we get the corresponding static part
        defaultHighlightRowDefinition = getMessageTypeFromCriticalityType(criticalityAnnotation);
      }
    }
    var aMissingKeys = [];
    targetEntityType === null || targetEntityType === void 0 ? void 0 : targetEntityType.keys.forEach(function (key) {
      if (key.name !== "IsActiveEntity") {
        aMissingKeys.push(pathInModel(key.name, undefined));
      }
    });
    return formatResult([defaultHighlightRowDefinition, pathInModel("filteredMessages", "internal"), isDraftRoot && Entity.HasActive, isDraftRoot && Entity.IsActive, "".concat(isDraftRoot)].concat(aMissingKeys), tableFormatters.rowHighlighting, targetEntityType);
  }
  function _getCreationBehaviour(lineItemAnnotation, tableManifestConfiguration, converterContext, navigationSettings, visualizationPath) {
    var _newAction2;
    var navigation = (navigationSettings === null || navigationSettings === void 0 ? void 0 : navigationSettings.create) || (navigationSettings === null || navigationSettings === void 0 ? void 0 : navigationSettings.detail);
    var tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    var originalTableSettings = tableManifestSettings && tableManifestSettings.tableSettings || {};
    // cross-app
    if (navigation !== null && navigation !== void 0 && navigation.outbound && navigation.outboundDetail && navigationSettings !== null && navigationSettings !== void 0 && navigationSettings.create) {
      return {
        mode: "External",
        outbound: navigation.outbound,
        outboundDetail: navigation.outboundDetail,
        navigationSettings: navigationSettings
      };
    }
    var newAction;
    if (lineItemAnnotation) {
      var _converterContext$get14, _targetAnnotationsCom, _targetAnnotationsSes;
      // in-app
      var targetAnnotations = (_converterContext$get14 = converterContext.getEntitySet()) === null || _converterContext$get14 === void 0 ? void 0 : _converterContext$get14.annotations;
      var targetAnnotationsCommon = targetAnnotations === null || targetAnnotations === void 0 ? void 0 : targetAnnotations.Common,
        targetAnnotationsSession = targetAnnotations === null || targetAnnotations === void 0 ? void 0 : targetAnnotations.Session;
      newAction = (targetAnnotationsCommon === null || targetAnnotationsCommon === void 0 ? void 0 : (_targetAnnotationsCom = targetAnnotationsCommon.DraftRoot) === null || _targetAnnotationsCom === void 0 ? void 0 : _targetAnnotationsCom.NewAction) || (targetAnnotationsSession === null || targetAnnotationsSession === void 0 ? void 0 : (_targetAnnotationsSes = targetAnnotationsSession.StickySessionSupported) === null || _targetAnnotationsSes === void 0 ? void 0 : _targetAnnotationsSes.NewAction);
      if (tableManifestConfiguration.creationMode === CreationMode.CreationRow && newAction) {
        // A combination of 'CreationRow' and 'NewAction' does not make sense
        throw Error("Creation mode '".concat(CreationMode.CreationRow, "' can not be used with a custom 'new' action (").concat(newAction, ")"));
      }
      if (navigation !== null && navigation !== void 0 && navigation.route) {
        var _newAction;
        // route specified
        return {
          mode: tableManifestConfiguration.creationMode,
          append: tableManifestConfiguration.createAtEnd,
          newAction: (_newAction = newAction) === null || _newAction === void 0 ? void 0 : _newAction.toString(),
          navigateToTarget: tableManifestConfiguration.creationMode === CreationMode.NewPage ? navigation.route : undefined // navigate only in NewPage mode
        };
      }
    }

    // no navigation or no route specified - fallback to inline create if original creation mode was 'NewPage'
    if (tableManifestConfiguration.creationMode === CreationMode.NewPage) {
      var _originalTableSetting;
      tableManifestConfiguration.creationMode = CreationMode.Inline;
      // In case there was no specific configuration for the createAtEnd we force it to false
      if (((_originalTableSetting = originalTableSettings.creationMode) === null || _originalTableSetting === void 0 ? void 0 : _originalTableSetting.createAtEnd) === undefined) {
        tableManifestConfiguration.createAtEnd = false;
      }
    }
    return {
      mode: tableManifestConfiguration.creationMode,
      append: tableManifestConfiguration.createAtEnd,
      newAction: (_newAction2 = newAction) === null || _newAction2 === void 0 ? void 0 : _newAction2.toString()
    };
  }
  var _getRowConfigurationProperty = function (lineItemAnnotation, visualizationPath, converterContext, navigationSettings, targetPath) {
    var pressProperty, navigationTarget;
    var criticalityProperty = constant(MessageType.None);
    var targetEntityType = converterContext.getEntityType();
    if (navigationSettings && lineItemAnnotation) {
      var _navigationSettings$d, _navigationSettings$d2, _lineItemAnnotation$a, _lineItemAnnotation$a2;
      navigationTarget = ((_navigationSettings$d = navigationSettings.display) === null || _navigationSettings$d === void 0 ? void 0 : _navigationSettings$d.target) || ((_navigationSettings$d2 = navigationSettings.detail) === null || _navigationSettings$d2 === void 0 ? void 0 : _navigationSettings$d2.outbound);
      var targetEntitySet = converterContext.getEntitySet();
      criticalityProperty = getHighlightRowBinding((_lineItemAnnotation$a = lineItemAnnotation.annotations) === null || _lineItemAnnotation$a === void 0 ? void 0 : (_lineItemAnnotation$a2 = _lineItemAnnotation$a.UI) === null || _lineItemAnnotation$a2 === void 0 ? void 0 : _lineItemAnnotation$a2.Criticality, !!ModelHelper.getDraftRoot(targetEntitySet) || !!ModelHelper.getDraftNode(targetEntitySet), targetEntityType);
      if (navigationTarget) {
        pressProperty = ".handlers.onChevronPressNavigateOutBound( $controller ,'" + navigationTarget + "', ${$parameters>bindingContext})";
      } else if (targetEntityType) {
        var _navigationSettings$d3;
        navigationTarget = (_navigationSettings$d3 = navigationSettings.detail) === null || _navigationSettings$d3 === void 0 ? void 0 : _navigationSettings$d3.route;
        if (navigationTarget && !ModelHelper.isSingleton(targetEntitySet)) {
          var _lineItemAnnotation$a3, _lineItemAnnotation$a4;
          criticalityProperty = getHighlightRowBinding((_lineItemAnnotation$a3 = lineItemAnnotation.annotations) === null || _lineItemAnnotation$a3 === void 0 ? void 0 : (_lineItemAnnotation$a4 = _lineItemAnnotation$a3.UI) === null || _lineItemAnnotation$a4 === void 0 ? void 0 : _lineItemAnnotation$a4.Criticality, !!ModelHelper.getDraftRoot(targetEntitySet) || !!ModelHelper.getDraftNode(targetEntitySet), targetEntityType);
          pressProperty = "API.onTableRowPress($event, $controller, ${$parameters>bindingContext}, { callExtension: true, targetPath: '" + targetPath + "', editable : " + (ModelHelper.getDraftRoot(targetEntitySet) || ModelHelper.getDraftNode(targetEntitySet) ? "!${$parameters>bindingContext}.getProperty('IsActiveEntity')" : "undefined") + "})"; //Need to access to DraftRoot and DraftNode !!!!!!!
        } else {
          var _lineItemAnnotation$a5, _lineItemAnnotation$a6;
          criticalityProperty = getHighlightRowBinding((_lineItemAnnotation$a5 = lineItemAnnotation.annotations) === null || _lineItemAnnotation$a5 === void 0 ? void 0 : (_lineItemAnnotation$a6 = _lineItemAnnotation$a5.UI) === null || _lineItemAnnotation$a6 === void 0 ? void 0 : _lineItemAnnotation$a6.Criticality, false, targetEntityType);
        }
      }
    }
    var rowNavigatedExpression = formatResult([pathInModel("/deepestPath", "internal")], tableFormatters.navigatedRow, targetEntityType);
    return {
      press: pressProperty,
      action: pressProperty ? "Navigation" : undefined,
      rowHighlighting: compileExpression(criticalityProperty),
      rowNavigated: compileExpression(rowNavigatedExpression),
      visible: compileExpression(not(UI.IsInactive))
    };
  };

  /**
   * Retrieve the columns from the entityType.
   *
   * @param columnsToBeCreated The columns to be created.
   * @param entityType The target entity type.
   * @param annotationColumns The array of columns created based on LineItem annotations.
   * @param nonSortableColumns The array of all non sortable column names.
   * @param converterContext The converter context.
   * @param tableType The table type.
   * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
   * @returns The column from the entityType
   */
  var getColumnsFromEntityType = function (columnsToBeCreated, entityType) {
    var annotationColumns = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    var nonSortableColumns = arguments.length > 3 ? arguments[3] : undefined;
    var converterContext = arguments.length > 4 ? arguments[4] : undefined;
    var tableType = arguments.length > 5 ? arguments[5] : undefined;
    var textOnlyColumnsFromTextAnnotation = arguments.length > 6 ? arguments[6] : undefined;
    var tableColumns = annotationColumns;
    // Catch already existing columns - which were added before by LineItem Annotations
    var aggregationHelper = new AggregationHelper(entityType, converterContext);
    entityType.entityProperties.forEach(function (property) {
      // Catch already existing columns - which were added before by LineItem Annotations
      var exists = annotationColumns.some(function (column) {
        return column.name === property.name;
      });

      // if target type exists, it is a complex property and should be ignored
      if (!property.targetType && !exists) {
        var relatedPropertiesInfo = collectRelatedProperties(property.name, property, converterContext, true, tableType);
        var relatedPropertyNames = Object.keys(relatedPropertiesInfo.properties);
        var additionalPropertyNames = Object.keys(relatedPropertiesInfo.additionalProperties);
        if (relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation.length > 0) {
          // Include text properties found during analysis on getColumnsFromAnnotations
          textOnlyColumnsFromTextAnnotation.push.apply(textOnlyColumnsFromTextAnnotation, _toConsumableArray(relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation));
        }
        var columnInfo = getColumnDefinitionFromProperty(property, converterContext.getEntitySetBasedAnnotationPath(property.fullyQualifiedName), property.name, true, true, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation);
        var semanticKeys = converterContext.getAnnotationsByTerm("Common", "com.sap.vocabularies.Common.v1.SemanticKey", [converterContext.getEntityType()])[0];
        var oColumnDraftIndicator = getDefaultDraftIndicatorForColumn(columnInfo.name, semanticKeys, false, null);
        if (Object.keys(oColumnDraftIndicator).length > 0) {
          columnInfo.formatOptions = _objectSpread({}, oColumnDraftIndicator);
        }
        if (relatedPropertyNames.length > 0) {
          columnInfo.propertyInfos = relatedPropertyNames;
          columnInfo.exportSettings = _objectSpread(_objectSpread({}, columnInfo.exportSettings), {}, {
            template: relatedPropertiesInfo.exportSettingsTemplate,
            wrap: relatedPropertiesInfo.exportSettingsWrapping
          });
          columnInfo.exportSettings.type = _getExportDataType(property.type, relatedPropertyNames.length > 1);
          if (relatedPropertiesInfo.exportUnitName) {
            columnInfo.exportSettings.unitProperty = relatedPropertiesInfo.exportUnitName;
            columnInfo.exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
          } else if (relatedPropertiesInfo.exportUnitString) {
            columnInfo.exportSettings.unit = relatedPropertiesInfo.exportUnitString;
          }
          if (relatedPropertiesInfo.exportTimezoneName) {
            columnInfo.exportSettings.timezoneProperty = relatedPropertiesInfo.exportTimezoneName;
            columnInfo.exportSettings.utc = false;
          } else if (relatedPropertiesInfo.exportTimezoneString) {
            columnInfo.exportSettings.timezone = relatedPropertiesInfo.exportTimezoneString;
          }

          // Collect information of related columns to be created.
          relatedPropertyNames.forEach(function (name) {
            columnsToBeCreated[name] = relatedPropertiesInfo.properties[name];
          });
        }
        if (additionalPropertyNames.length > 0) {
          columnInfo.additionalPropertyInfos = additionalPropertyNames;
          // Create columns for additional properties identified for ALP use case.
          additionalPropertyNames.forEach(function (name) {
            // Intentional overwrite as we require only one new PropertyInfo for a related Property.
            columnsToBeCreated[name] = relatedPropertiesInfo.additionalProperties[name];
          });
        }
        tableColumns.push(columnInfo);
      }
      // In case a property has defined a #TextOnly text arrangement don't only create the complex property with the text property as a child property,
      // but also the property itself as it can be used as within the sortConditions or on custom columns.
      // This step must be valide also from the columns added via LineItems or from a column available on the p13n.
      if (getDisplayMode(property) === "Description") {
        nonSortableColumns = nonSortableColumns.concat(property.name);
        tableColumns.push(getColumnDefinitionFromProperty(property, converterContext.getEntitySetBasedAnnotationPath(property.fullyQualifiedName), property.name, false, false, nonSortableColumns, aggregationHelper, converterContext, []));
      }
    });

    // Create a propertyInfo for each related property.
    var relatedColumns = _createRelatedColumns(columnsToBeCreated, tableColumns, nonSortableColumns, converterContext, entityType, textOnlyColumnsFromTextAnnotation);
    return tableColumns.concat(relatedColumns);
  };

  /**
   * Create a column definition from a property.
   *
   * @param property Entity type property for which the column is created
   * @param fullPropertyPath The full path to the target property
   * @param relativePath The relative path to the target property based on the context
   * @param useDataFieldPrefix Should be prefixed with "DataField::", else it will be prefixed with "Property::"
   * @param availableForAdaptation Decides whether the column should be available for adaptation
   * @param nonSortableColumns The array of all non-sortable column names
   * @param aggregationHelper The aggregationHelper for the entity
   * @param converterContext The converter context
   * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
   * @returns The annotation column definition
   */
  _exports.getColumnsFromEntityType = getColumnsFromEntityType;
  var getColumnDefinitionFromProperty = function (property, fullPropertyPath, relativePath, useDataFieldPrefix, availableForAdaptation, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation) {
    var _property$annotations, _property$annotations2, _property$annotations3, _annotations2, _annotations2$UI, _annotations2$UI$Data, _annotations2$UI$Data2, _annotations2$UI$Data3, _annotations2$UI$Data4, _annotations3, _annotations3$UI;
    var name = useDataFieldPrefix ? relativePath : "Property::".concat(relativePath);
    var key = (useDataFieldPrefix ? "DataField::" : "Property::") + replaceSpecialChars(relativePath);
    var semanticObjectAnnotationPath = getSemanticObjectPath(converterContext, property);
    var isHidden = ((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.Hidden) === null || _property$annotations3 === void 0 ? void 0 : _property$annotations3.valueOf()) === true;
    var groupPath = property.name ? _sliceAtSlash(property.name, true, false) : undefined;
    var isGroup = groupPath != property.name;
    var isDataPointFakeProperty = name.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1;
    var exportType = _getExportDataType(property.type);
    var sDateInputFormat = property.type === "Edm.Date" ? "YYYY-MM-DD" : undefined;
    var dataType = getDataFieldDataType(property);
    var propertyTypeConfig = !isDataPointFakeProperty ? getTypeConfig(property, dataType) : undefined;
    var semanticKeys = converterContext.getAnnotationsByTerm("Common", "com.sap.vocabularies.Common.v1.SemanticKey", [converterContext.getEntityType()])[0];
    var isAPropertyFromTextOnlyAnnotation = textOnlyColumnsFromTextAnnotation && textOnlyColumnsFromTextAnnotation.indexOf(relativePath) >= 0;
    var sortable = (!isHidden || isAPropertyFromTextOnlyAnnotation) && nonSortableColumns.indexOf(relativePath) === -1 && !isDataPointFakeProperty;
    var oTypeConfig = !isDataPointFakeProperty ? {
      className: property.type || dataType,
      oFormatOptions: propertyTypeConfig.formatOptions,
      oConstraints: propertyTypeConfig.constraints
    } : undefined;
    var exportSettings = isDataPointFakeProperty ? {
      template: getTargetValueOnDataPoint(property)
    } : null;
    if (!isDataPointFakeProperty && _isExportableColumn(property)) {
      var _property$annotations4, _property$annotations5, _property$annotations6, _property$annotations7, _property$annotations8, _property$annotations9;
      var oUnitProperty = getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property);
      var oTimezoneProperty = getAssociatedTimezoneProperty(property);
      var sUnitText = (property === null || property === void 0 ? void 0 : (_property$annotations4 = property.annotations) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.Measures) === null || _property$annotations5 === void 0 ? void 0 : _property$annotations5.ISOCurrency) || (property === null || property === void 0 ? void 0 : (_property$annotations6 = property.annotations) === null || _property$annotations6 === void 0 ? void 0 : (_property$annotations7 = _property$annotations6.Measures) === null || _property$annotations7 === void 0 ? void 0 : _property$annotations7.Unit);
      var sTimezoneText = property === null || property === void 0 ? void 0 : (_property$annotations8 = property.annotations) === null || _property$annotations8 === void 0 ? void 0 : (_property$annotations9 = _property$annotations8.Common) === null || _property$annotations9 === void 0 ? void 0 : _property$annotations9.Timezone;
      exportSettings = {
        type: exportType,
        inputFormat: sDateInputFormat,
        scale: property.scale,
        delimiter: property.type === "Edm.Int64"
      };
      if (oUnitProperty) {
        exportSettings.unitProperty = oUnitProperty.name;
        exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
      } else if (sUnitText) {
        exportSettings.unit = "".concat(sUnitText);
      }
      if (oTimezoneProperty) {
        exportSettings.timezoneProperty = oTimezoneProperty.name;
        exportSettings.utc = false;
      } else if (sTimezoneText) {
        exportSettings.timezone = sTimezoneText.toString();
      }
    }
    var collectedNavigationPropertyLabels = _getCollectedNavigationPropertyLabels(relativePath, converterContext);
    var oColumn = {
      key: key,
      type: ColumnType.Annotation,
      label: getLabel(property, isGroup),
      groupLabel: isGroup ? getLabel(property) : null,
      group: isGroup ? groupPath : null,
      annotationPath: fullPropertyPath,
      semanticObjectPath: semanticObjectAnnotationPath,
      // A fake property was created for the TargetValue used on DataPoints, this property should be hidden and non sortable
      availability: !availableForAdaptation || isHidden || isDataPointFakeProperty ? AvailabilityType.Hidden : AvailabilityType.Adaptation,
      name: name,
      relativePath: isDataPointFakeProperty ? ((_annotations2 = property.annotations) === null || _annotations2 === void 0 ? void 0 : (_annotations2$UI = _annotations2.UI) === null || _annotations2$UI === void 0 ? void 0 : (_annotations2$UI$Data = _annotations2$UI.DataFieldDefault) === null || _annotations2$UI$Data === void 0 ? void 0 : (_annotations2$UI$Data2 = _annotations2$UI$Data.Target) === null || _annotations2$UI$Data2 === void 0 ? void 0 : (_annotations2$UI$Data3 = _annotations2$UI$Data2.$target) === null || _annotations2$UI$Data3 === void 0 ? void 0 : (_annotations2$UI$Data4 = _annotations2$UI$Data3.Value) === null || _annotations2$UI$Data4 === void 0 ? void 0 : _annotations2$UI$Data4.path) || property.Value.path : relativePath,
      sortable: sortable,
      isGroupable: aggregationHelper.isAnalyticsSupported() ? aggregationHelper.isPropertyGroupable(property) : sortable,
      isKey: property.isKey,
      isDataPointFakeTargetProperty: isDataPointFakeProperty,
      exportSettings: exportSettings,
      caseSensitive: isFilteringCaseSensitive(converterContext),
      typeConfig: oTypeConfig,
      visualSettings: isDataPointFakeProperty ? {
        widthCalculation: null
      } : undefined,
      importance: getImportance((_annotations3 = property.annotations) === null || _annotations3 === void 0 ? void 0 : (_annotations3$UI = _annotations3.UI) === null || _annotations3$UI === void 0 ? void 0 : _annotations3$UI.DataFieldDefault, semanticKeys),
      additionalLabels: collectedNavigationPropertyLabels
    };
    var sTooltip = _getTooltip(property);
    if (sTooltip) {
      oColumn.tooltip = sTooltip;
    }
    return oColumn;
  };

  /**
   * Returns Boolean true for exportable columns, false for non exportable columns.
   *
   * @param source The dataField or property to be evaluated
   * @returns True for exportable column, false for non exportable column
   * @private
   */

  function _isExportableColumn(source) {
    var _annotations4, _annotations4$UI, _annotations4$UI$Data;
    var propertyType, property;
    var dataFieldDefaultPropertyType = (_annotations4 = source.annotations) === null || _annotations4 === void 0 ? void 0 : (_annotations4$UI = _annotations4.UI) === null || _annotations4$UI === void 0 ? void 0 : (_annotations4$UI$Data = _annotations4$UI.DataFieldDefault) === null || _annotations4$UI$Data === void 0 ? void 0 : _annotations4$UI$Data.$Type;
    if (isProperty(source && dataFieldDefaultPropertyType)) {
      propertyType = dataFieldDefaultPropertyType;
    } else {
      var _Target$$target, _Value, _Value$$target, _Value$$target$annota, _Value$$target$annota2, _Value$$target$annota3, _Value2, _Value2$$target, _Value2$$target$annot, _Value2$$target$annot2;
      property = source;
      propertyType = property.$Type;
      if (propertyType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && (_Target$$target = property.Target.$target) !== null && _Target$$target !== void 0 && _Target$$target.$Type) {
        //For Chart
        propertyType = property.Target.$target.$Type;
        return "com.sap.vocabularies.UI.v1.ChartDefinitionType".indexOf(propertyType) === -1;
      } else if (((_Value = property.Value) === null || _Value === void 0 ? void 0 : (_Value$$target = _Value.$target) === null || _Value$$target === void 0 ? void 0 : (_Value$$target$annota = _Value$$target.annotations) === null || _Value$$target$annota === void 0 ? void 0 : (_Value$$target$annota2 = _Value$$target$annota.Core) === null || _Value$$target$annota2 === void 0 ? void 0 : (_Value$$target$annota3 = _Value$$target$annota2.MediaType) === null || _Value$$target$annota3 === void 0 ? void 0 : _Value$$target$annota3.term) === "Org.OData.Core.V1.MediaType" && ((_Value2 = property.Value) === null || _Value2 === void 0 ? void 0 : (_Value2$$target = _Value2.$target) === null || _Value2$$target === void 0 ? void 0 : (_Value2$$target$annot = _Value2$$target.annotations) === null || _Value2$$target$annot === void 0 ? void 0 : (_Value2$$target$annot2 = _Value2$$target$annot.Core) === null || _Value2$$target$annot2 === void 0 ? void 0 : _Value2$$target$annot2.isURL) !== true) {
        //For Stream
        return false;
      }
    }
    return propertyType ? ["com.sap.vocabularies.UI.v1.DataFieldForAction", "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldForActionGroup"].indexOf(propertyType) === -1 : true;
  }

  /**
   * Returns Boolean true for valid columns, false for invalid columns.
   *
   * @param dataField Different DataField types defined in the annotations
   * @returns True for valid columns, false for invalid columns
   * @private
   */
  var _isValidColumn = function (dataField) {
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        return !!dataField.Inline;
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        return true;
      default:
      // Todo: Replace with proper Log statement once available
      //  throw new Error("Unhandled DataField Abstract type: " + dataField.$Type);
    }
  };
  /**
   * Returns the binding expression to evaluate the visibility of a DataField or DataPoint annotation.
   *
   * SAP Fiori elements will evaluate either the UI.Hidden annotation defined on the annotation itself or on the target property.
   *
   * @param dataFieldModelPath The metapath referring to the annotation that is evaluated by SAP Fiori elements.
   * @param [formatOptions] FormatOptions optional.
   * @param formatOptions.isAnalytics This flag is used to check if the analytic table has GroupHeader expanded.
   * @returns An expression that you can bind to the UI.
   */
  var _getVisibleExpression = function (dataFieldModelPath, formatOptions) {
    var _targetObject$Target, _targetObject$Target$, _targetObject$annotat, _targetObject$annotat2, _propertyValue$annota, _propertyValue$annota2;
    var targetObject = dataFieldModelPath.targetObject;
    var propertyValue;
    if (targetObject) {
      switch (targetObject.$Type) {
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        case "com.sap.vocabularies.UI.v1.DataPointType":
          propertyValue = targetObject.Value.$target;
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          // if it is a DataFieldForAnnotation pointing to a DataPoint we look at the dataPoint's value
          if ((targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$Target = targetObject.Target) === null || _targetObject$Target === void 0 ? void 0 : (_targetObject$Target$ = _targetObject$Target.$target) === null || _targetObject$Target$ === void 0 ? void 0 : _targetObject$Target$.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            var _targetObject$Target$2;
            propertyValue = (_targetObject$Target$2 = targetObject.Target.$target) === null || _targetObject$Target$2 === void 0 ? void 0 : _targetObject$Target$2.Value.$target;
          }
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        default:
          propertyValue = undefined;
      }
    }
    var isAnalyticalGroupHeaderExpanded = formatOptions !== null && formatOptions !== void 0 && formatOptions.isAnalytics ? UI.IsExpanded : constant(false);
    var isAnalyticalLeaf = formatOptions !== null && formatOptions !== void 0 && formatOptions.isAnalytics ? equal(UI.NodeLevel, 0) : constant(false);

    // A data field is visible if:
    // - the UI.Hidden expression in the original annotation does not evaluate to 'true'
    // - the UI.Hidden expression in the target property does not evaluate to 'true'
    // - in case of Analytics it's not visible for an expanded GroupHeader
    return and.apply(void 0, [not(equal(getExpressionFromAnnotation(targetObject === null || targetObject === void 0 ? void 0 : (_targetObject$annotat = targetObject.annotations) === null || _targetObject$annotat === void 0 ? void 0 : (_targetObject$annotat2 = _targetObject$annotat.UI) === null || _targetObject$annotat2 === void 0 ? void 0 : _targetObject$annotat2.Hidden), true)), ifElse(!!propertyValue, propertyValue && not(equal(getExpressionFromAnnotation((_propertyValue$annota = propertyValue.annotations) === null || _propertyValue$annota === void 0 ? void 0 : (_propertyValue$annota2 = _propertyValue$annota.UI) === null || _propertyValue$annota2 === void 0 ? void 0 : _propertyValue$annota2.Hidden), true)), true), or(not(isAnalyticalGroupHeaderExpanded), isAnalyticalLeaf)]);
  };

  /**
   * Returns hidden binding expressions for a field group.
   *
   * @param dataFieldGroup DataField defined in the annotations
   * @param fieldFormatOptions FormatOptions optional.
   * @param fieldFormatOptions.isAnalytics This flag is used to check if the analytic table has GroupHeader expanded.
   * @returns Compile binding of field group expressions.
   * @private
   */
  _exports._getVisibleExpression = _getVisibleExpression;
  var _getFieldGroupHiddenExpressions = function (dataFieldGroup, fieldFormatOptions) {
    var _dataFieldGroup$Targe, _dataFieldGroup$Targe2;
    var aFieldGroupHiddenExpressions = [];
    if (dataFieldGroup.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_dataFieldGroup$Targe = dataFieldGroup.Target) === null || _dataFieldGroup$Targe === void 0 ? void 0 : (_dataFieldGroup$Targe2 = _dataFieldGroup$Targe.$target) === null || _dataFieldGroup$Targe2 === void 0 ? void 0 : _dataFieldGroup$Targe2.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
      var _dataFieldGroup$Targe3;
      (_dataFieldGroup$Targe3 = dataFieldGroup.Target.$target.Data) === null || _dataFieldGroup$Targe3 === void 0 ? void 0 : _dataFieldGroup$Targe3.forEach(function (innerDataField) {
        aFieldGroupHiddenExpressions.push(_getVisibleExpression({
          targetObject: innerDataField
        }, fieldFormatOptions));
      });
      return compileExpression(ifElse(or.apply(void 0, aFieldGroupHiddenExpressions), constant(true), constant(false)));
    } else {
      return undefined;
    }
  };

  /**
   * Returns the label for the property and dataField.
   *
   * @param [property] Property, DataField or Navigation Property defined in the annotations
   * @param isGroup
   * @returns Label of the property or DataField
   * @private
   */
  var getLabel = function (property) {
    var isGroup = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (!property) {
      return undefined;
    }
    if (isProperty(property) || isNavigationProperty(property)) {
      var _annotations5, _annotations5$UI, _dataFieldDefault$Lab, _property$annotations10, _property$annotations11;
      var dataFieldDefault = (_annotations5 = property.annotations) === null || _annotations5 === void 0 ? void 0 : (_annotations5$UI = _annotations5.UI) === null || _annotations5$UI === void 0 ? void 0 : _annotations5$UI.DataFieldDefault;
      if (dataFieldDefault && !dataFieldDefault.qualifier && (_dataFieldDefault$Lab = dataFieldDefault.Label) !== null && _dataFieldDefault$Lab !== void 0 && _dataFieldDefault$Lab.valueOf()) {
        var _dataFieldDefault$Lab2;
        return compileExpression(getExpressionFromAnnotation((_dataFieldDefault$Lab2 = dataFieldDefault.Label) === null || _dataFieldDefault$Lab2 === void 0 ? void 0 : _dataFieldDefault$Lab2.valueOf()));
      }
      return compileExpression(getExpressionFromAnnotation(((_property$annotations10 = property.annotations.Common) === null || _property$annotations10 === void 0 ? void 0 : (_property$annotations11 = _property$annotations10.Label) === null || _property$annotations11 === void 0 ? void 0 : _property$annotations11.valueOf()) || property.name));
    } else if (isDataFieldTypes(property)) {
      var _property$Label2, _property$Value, _property$Value$$targ, _property$Value$$targ2, _property$Value$$targ3, _property$Value$$targ4, _property$Value2, _property$Value2$$tar;
      if (!!isGroup && property.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation") {
        var _property$Label;
        return compileExpression(getExpressionFromAnnotation((_property$Label = property.Label) === null || _property$Label === void 0 ? void 0 : _property$Label.valueOf()));
      }
      return compileExpression(getExpressionFromAnnotation(((_property$Label2 = property.Label) === null || _property$Label2 === void 0 ? void 0 : _property$Label2.valueOf()) || ((_property$Value = property.Value) === null || _property$Value === void 0 ? void 0 : (_property$Value$$targ = _property$Value.$target) === null || _property$Value$$targ === void 0 ? void 0 : (_property$Value$$targ2 = _property$Value$$targ.annotations) === null || _property$Value$$targ2 === void 0 ? void 0 : (_property$Value$$targ3 = _property$Value$$targ2.Common) === null || _property$Value$$targ3 === void 0 ? void 0 : (_property$Value$$targ4 = _property$Value$$targ3.Label) === null || _property$Value$$targ4 === void 0 ? void 0 : _property$Value$$targ4.valueOf()) || ((_property$Value2 = property.Value) === null || _property$Value2 === void 0 ? void 0 : (_property$Value2$$tar = _property$Value2.$target) === null || _property$Value2$$tar === void 0 ? void 0 : _property$Value2$$tar.name)));
    } else if (property.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      var _property$Label3, _property$Target, _property$Target$$tar, _property$Target$$tar2, _property$Target$$tar3, _property$Target$$tar4, _property$Target$$tar5, _property$Target$$tar6;
      return compileExpression(getExpressionFromAnnotation(((_property$Label3 = property.Label) === null || _property$Label3 === void 0 ? void 0 : _property$Label3.valueOf()) || ((_property$Target = property.Target) === null || _property$Target === void 0 ? void 0 : (_property$Target$$tar = _property$Target.$target) === null || _property$Target$$tar === void 0 ? void 0 : (_property$Target$$tar2 = _property$Target$$tar.Value) === null || _property$Target$$tar2 === void 0 ? void 0 : (_property$Target$$tar3 = _property$Target$$tar2.$target) === null || _property$Target$$tar3 === void 0 ? void 0 : (_property$Target$$tar4 = _property$Target$$tar3.annotations) === null || _property$Target$$tar4 === void 0 ? void 0 : (_property$Target$$tar5 = _property$Target$$tar4.Common) === null || _property$Target$$tar5 === void 0 ? void 0 : (_property$Target$$tar6 = _property$Target$$tar5.Label) === null || _property$Target$$tar6 === void 0 ? void 0 : _property$Target$$tar6.valueOf())));
    } else {
      var _property$Label4;
      return compileExpression(getExpressionFromAnnotation((_property$Label4 = property.Label) === null || _property$Label4 === void 0 ? void 0 : _property$Label4.valueOf()));
    }
  };
  var _getTooltip = function (source) {
    var _source$annotations, _source$annotations$C;
    if (!source) {
      return undefined;
    }
    if (isProperty(source) || (_source$annotations = source.annotations) !== null && _source$annotations !== void 0 && (_source$annotations$C = _source$annotations.Common) !== null && _source$annotations$C !== void 0 && _source$annotations$C.QuickInfo) {
      var _source$annotations2, _source$annotations2$;
      return (_source$annotations2 = source.annotations) !== null && _source$annotations2 !== void 0 && (_source$annotations2$ = _source$annotations2.Common) !== null && _source$annotations2$ !== void 0 && _source$annotations2$.QuickInfo ? compileExpression(getExpressionFromAnnotation(source.annotations.Common.QuickInfo.valueOf())) : undefined;
    } else if (isDataFieldTypes(source)) {
      var _source$Value, _source$Value$$target, _source$Value$$target2, _source$Value$$target3;
      return (_source$Value = source.Value) !== null && _source$Value !== void 0 && (_source$Value$$target = _source$Value.$target) !== null && _source$Value$$target !== void 0 && (_source$Value$$target2 = _source$Value$$target.annotations) !== null && _source$Value$$target2 !== void 0 && (_source$Value$$target3 = _source$Value$$target2.Common) !== null && _source$Value$$target3 !== void 0 && _source$Value$$target3.QuickInfo ? compileExpression(getExpressionFromAnnotation(source.Value.$target.annotations.Common.QuickInfo.valueOf())) : undefined;
    } else if (source.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      var _source$Target, _datapointTarget$Valu, _datapointTarget$Valu2, _datapointTarget$Valu3, _datapointTarget$Valu4;
      var datapointTarget = (_source$Target = source.Target) === null || _source$Target === void 0 ? void 0 : _source$Target.$target;
      return datapointTarget !== null && datapointTarget !== void 0 && (_datapointTarget$Valu = datapointTarget.Value) !== null && _datapointTarget$Valu !== void 0 && (_datapointTarget$Valu2 = _datapointTarget$Valu.$target) !== null && _datapointTarget$Valu2 !== void 0 && (_datapointTarget$Valu3 = _datapointTarget$Valu2.annotations) !== null && _datapointTarget$Valu3 !== void 0 && (_datapointTarget$Valu4 = _datapointTarget$Valu3.Common) !== null && _datapointTarget$Valu4 !== void 0 && _datapointTarget$Valu4.QuickInfo ? compileExpression(getExpressionFromAnnotation(datapointTarget.Value.$target.annotations.Common.QuickInfo.valueOf())) : undefined;
    } else {
      return undefined;
    }
  };
  function getRowStatusVisibility(colName, isSemanticKeyInFieldGroup) {
    return formatResult([pathInModel("semanticKeyHasDraftIndicator", "internal"), pathInModel("filteredMessages", "internal"), colName, isSemanticKeyInFieldGroup], tableFormatters.getErrorStatusTextVisibilityFormatter);
  }

  /**
   * Creates a PropertyInfo for each identified property consumed by a LineItem.
   *
   * @param columnsToBeCreated Identified properties.
   * @param existingColumns The list of columns created for LineItems and Properties of entityType.
   * @param nonSortableColumns The array of column names which cannot be sorted.
   * @param converterContext The converter context.
   * @param entityType The entity type for the LineItem
   * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
   * @returns The array of columns created.
   */
  _exports.getRowStatusVisibility = getRowStatusVisibility;
  var _createRelatedColumns = function (columnsToBeCreated, existingColumns, nonSortableColumns, converterContext, entityType, textOnlyColumnsFromTextAnnotation) {
    var relatedColumns = [];
    var relatedPropertyNameMap = {};
    var aggregationHelper = new AggregationHelper(entityType, converterContext);
    Object.keys(columnsToBeCreated).forEach(function (name) {
      var property = columnsToBeCreated[name],
        annotationPath = converterContext.getAbsoluteAnnotationPath(name),
        // Check whether the related column already exists.
        relatedColumn = existingColumns.find(function (column) {
          return column.name === name;
        });
      if (relatedColumn === undefined) {
        // Case 1: Key contains DataField prefix to ensure all property columns have the same key format.
        // New created property column is set to hidden.
        relatedColumns.push(getColumnDefinitionFromProperty(property, annotationPath, name, true, false, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation));
      } else if (relatedColumn.annotationPath !== annotationPath || relatedColumn.propertyInfos) {
        // Case 2: The existing column points to a LineItem (or)
        // Case 3: This is a self reference from an existing column

        var newName = "Property::".concat(name);

        // Checking whether the related property column has already been created in a previous iteration.
        if (!existingColumns.some(function (column) {
          return column.name === newName;
        })) {
          // Create a new property column with 'Property::' prefix,
          // Set it to hidden as it is only consumed by Complex property infos.
          var column = getColumnDefinitionFromProperty(property, annotationPath, name, false, false, nonSortableColumns, aggregationHelper, converterContext, textOnlyColumnsFromTextAnnotation);
          column.isPartOfLineItem = relatedColumn.isPartOfLineItem;
          relatedColumns.push(column);
          relatedPropertyNameMap[name] = newName;
        } else if (existingColumns.some(function (column) {
          return column.name === newName;
        }) && existingColumns.some(function (column) {
          var _column$propertyInfos;
          return (_column$propertyInfos = column.propertyInfos) === null || _column$propertyInfos === void 0 ? void 0 : _column$propertyInfos.includes(name);
        })) {
          relatedPropertyNameMap[name] = newName;
        }
      }
    });

    // The property 'name' has been prefixed with 'Property::' for uniqueness.
    // Update the same in other propertyInfos[] references which point to this property.
    existingColumns.forEach(function (column) {
      var _column$propertyInfos2, _column$additionalPro;
      column.propertyInfos = (_column$propertyInfos2 = column.propertyInfos) === null || _column$propertyInfos2 === void 0 ? void 0 : _column$propertyInfos2.map(function (propertyInfo) {
        var _relatedPropertyNameM;
        return (_relatedPropertyNameM = relatedPropertyNameMap[propertyInfo]) !== null && _relatedPropertyNameM !== void 0 ? _relatedPropertyNameM : propertyInfo;
      });
      column.additionalPropertyInfos = (_column$additionalPro = column.additionalPropertyInfos) === null || _column$additionalPro === void 0 ? void 0 : _column$additionalPro.map(function (propertyInfo) {
        var _relatedPropertyNameM2;
        return (_relatedPropertyNameM2 = relatedPropertyNameMap[propertyInfo]) !== null && _relatedPropertyNameM2 !== void 0 ? _relatedPropertyNameM2 : propertyInfo;
      });
    });
    return relatedColumns;
  };

  /**
   * Getting the Column Name
   * If it points to a DataField with one property or DataPoint with one property, it will use the property name
   * here to be consistent with the existing flex changes.
   *
   * @param dataField Different DataField types defined in the annotations
   * @returns The name of annotation columns
   * @private
   */
  var _getAnnotationColumnName = function (dataField) {
    var _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2;
    // This is needed as we have flexibility changes already that we have to check against
    if (isDataFieldTypes(dataField)) {
      var _dataField$Value;
      return (_dataField$Value = dataField.Value) === null || _dataField$Value === void 0 ? void 0 : _dataField$Value.path;
    } else if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && (_dataField$Target = dataField.Target) !== null && _dataField$Target !== void 0 && (_dataField$Target$$ta = _dataField$Target.$target) !== null && _dataField$Target$$ta !== void 0 && (_dataField$Target$$ta2 = _dataField$Target$$ta.Value) !== null && _dataField$Target$$ta2 !== void 0 && _dataField$Target$$ta2.path) {
      var _dataField$Target2, _dataField$Target2$$t;
      // This is for removing duplicate properties. For example, 'Progress' Property is removed if it is already defined as a DataPoint
      return (_dataField$Target2 = dataField.Target) === null || _dataField$Target2 === void 0 ? void 0 : (_dataField$Target2$$t = _dataField$Target2.$target) === null || _dataField$Target2$$t === void 0 ? void 0 : _dataField$Target2$$t.Value.path;
    } else {
      return KeyHelper.generateKeyFromDataField(dataField);
    }
  };

  /**
   * Determines if the data field labels have to be displayed in the table.
   *
   * @param fieldGroupName The `DataField` name being processed.
   * @param visualizationPath
   * @param converterContext
   * @returns `showDataFieldsLabel` value from the manifest
   * @private
   */
  var _getShowDataFieldsLabel = function (fieldGroupName, visualizationPath, converterContext) {
    var _converterContext$get15;
    var oColumns = (_converterContext$get15 = converterContext.getManifestControlConfiguration(visualizationPath)) === null || _converterContext$get15 === void 0 ? void 0 : _converterContext$get15.columns;
    var aColumnKeys = oColumns && Object.keys(oColumns);
    return aColumnKeys && !!aColumnKeys.find(function (key) {
      return key === fieldGroupName && oColumns[key].showDataFieldsLabel;
    });
  };

  /**
   * Determines the relative path of the property with respect to the root entity.
   *
   * @param dataField The `DataField` being processed.
   * @returns The relative path
   */
  var _getRelativePath = function (dataField) {
    var _Value3, _dataField$Target3;
    var relativePath = "";
    switch (dataField.$Type) {
      case "com.sap.vocabularies.UI.v1.DataField":
      case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
      case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
      case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
        relativePath = dataField === null || dataField === void 0 ? void 0 : (_Value3 = dataField.Value) === null || _Value3 === void 0 ? void 0 : _Value3.path;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        relativePath = dataField === null || dataField === void 0 ? void 0 : (_dataField$Target3 = dataField.Target) === null || _dataField$Target3 === void 0 ? void 0 : _dataField$Target3.value;
        break;
      case "com.sap.vocabularies.UI.v1.DataFieldForAction":
      case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
      case "com.sap.vocabularies.UI.v1.DataFieldForActionGroup":
      case "com.sap.vocabularies.UI.v1.DataFieldWithActionGroup":
        relativePath = KeyHelper.generateKeyFromDataField(dataField);
        break;
    }
    return relativePath;
  };
  var _sliceAtSlash = function (path, isLastSlash, isLastPart) {
    var iSlashIndex = isLastSlash ? path.lastIndexOf("/") : path.indexOf("/");
    if (iSlashIndex === -1) {
      return path;
    }
    return isLastPart ? path.substring(iSlashIndex + 1, path.length) : path.substring(0, iSlashIndex);
  };

  /**
   * Determine whether a column is sortable.
   *
   * @param dataField The data field being processed
   * @param propertyPath The property path
   * @param nonSortableColumns Collection of non-sortable column names as per annotation
   * @returns True if the column is sortable
   */
  var _isColumnSortable = function (dataField, propertyPath, nonSortableColumns) {
    return nonSortableColumns.indexOf(propertyPath) === -1 && (
    // Column is not marked as non-sortable via annotation
    dataField.$Type === "com.sap.vocabularies.UI.v1.DataField" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction");
  };

  /**
   * Returns whether filtering on the table is case sensitive.
   *
   * @param converterContext The instance of the converter context
   * @returns Returns 'false' if FilterFunctions annotation supports 'tolower', else 'true'
   */
  var isFilteringCaseSensitive = function (converterContext) {
    var filterFunctions = _getFilterFunctions(converterContext);
    return Array.isArray(filterFunctions) ? filterFunctions.indexOf("tolower") === -1 : true;
  };
  _exports.isFilteringCaseSensitive = isFilteringCaseSensitive;
  function _getFilterFunctions(ConverterContext) {
    var _ConverterContext$get, _ConverterContext$get2, _ConverterContext$get3, _ConverterContext$get4, _ConverterContext$get5;
    if (ModelHelper.isSingleton(ConverterContext.getEntitySet())) {
      return undefined;
    }
    var capabilities = (_ConverterContext$get = ConverterContext.getEntitySet()) === null || _ConverterContext$get === void 0 ? void 0 : (_ConverterContext$get2 = _ConverterContext$get.annotations) === null || _ConverterContext$get2 === void 0 ? void 0 : _ConverterContext$get2.Capabilities;
    return (capabilities === null || capabilities === void 0 ? void 0 : capabilities.FilterFunctions) || ((_ConverterContext$get3 = ConverterContext.getEntityContainer()) === null || _ConverterContext$get3 === void 0 ? void 0 : (_ConverterContext$get4 = _ConverterContext$get3.annotations) === null || _ConverterContext$get4 === void 0 ? void 0 : (_ConverterContext$get5 = _ConverterContext$get4.Capabilities) === null || _ConverterContext$get5 === void 0 ? void 0 : _ConverterContext$get5.FilterFunctions);
  }

  /**
   * Returns default format options for text fields in a table.
   *
   * @param formatOptions
   * @returns Collection of format options with default values
   */
  function _getDefaultFormatOptionsForTable(formatOptions) {
    return formatOptions === undefined ? undefined : _objectSpread({
      textLinesEdit: 4
    }, formatOptions);
  }
  function _findSemanticKeyValues(semanticKeys, name) {
    var aSemanticKeyValues = [];
    var bSemanticKeyFound = false;
    for (var i = 0; i < semanticKeys.length; i++) {
      aSemanticKeyValues.push(semanticKeys[i].value);
      if (semanticKeys[i].value === name) {
        bSemanticKeyFound = true;
      }
    }
    return {
      values: aSemanticKeyValues,
      semanticKeyFound: bSemanticKeyFound
    };
  }
  function _findProperties(semanticKeyValues, fieldGroupProperties) {
    var semanticKeyHasPropertyInFieldGroup = false;
    var sPropertyPath;
    if (semanticKeyValues && semanticKeyValues.length >= 1 && fieldGroupProperties && fieldGroupProperties.length >= 1) {
      for (var i = 0; i < semanticKeyValues.length; i++) {
        if ([semanticKeyValues[i]].some(function (tmp) {
          return fieldGroupProperties.indexOf(tmp) >= 0;
        })) {
          semanticKeyHasPropertyInFieldGroup = true;
          sPropertyPath = semanticKeyValues[i];
          break;
        }
      }
    }
    return {
      semanticKeyHasPropertyInFieldGroup: semanticKeyHasPropertyInFieldGroup,
      fieldGroupPropertyPath: sPropertyPath
    };
  }
  function _findSemanticKeyValuesInFieldGroup(dataFieldGroup, semanticKeyValues) {
    var _dataFieldGroup$Targe4, _dataFieldGroup$Targe5;
    var aProperties = [];
    var _propertiesFound = {
      semanticKeyHasPropertyInFieldGroup: false,
      fieldGroupPropertyPath: undefined
    };
    if (dataFieldGroup && dataFieldGroup.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_dataFieldGroup$Targe4 = dataFieldGroup.Target) === null || _dataFieldGroup$Targe4 === void 0 ? void 0 : (_dataFieldGroup$Targe5 = _dataFieldGroup$Targe4.$target) === null || _dataFieldGroup$Targe5 === void 0 ? void 0 : _dataFieldGroup$Targe5.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
      var _dataFieldGroup$Targe6;
      (_dataFieldGroup$Targe6 = dataFieldGroup.Target.$target.Data) === null || _dataFieldGroup$Targe6 === void 0 ? void 0 : _dataFieldGroup$Targe6.forEach(function (innerDataField) {
        if ((innerDataField.$Type === "com.sap.vocabularies.UI.v1.DataField" || innerDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") && innerDataField.Value) {
          aProperties.push(innerDataField.Value.path);
        }
        _propertiesFound = _findProperties(semanticKeyValues, aProperties);
      });
    }
    return {
      semanticKeyHasPropertyInFieldGroup: _propertiesFound.semanticKeyHasPropertyInFieldGroup,
      propertyPath: _propertiesFound.fieldGroupPropertyPath
    };
  }

  /**
   * Returns default format options with draftIndicator for a column.
   *
   * @param name
   * @param semanticKeys
   * @param isFieldGroupColumn
   * @param dataFieldGroup
   * @returns Collection of format options with default values
   */
  function getDefaultDraftIndicatorForColumn(name, semanticKeys, isFieldGroupColumn, dataFieldGroup) {
    if (!semanticKeys) {
      return {};
    }
    var semanticKey = _findSemanticKeyValues(semanticKeys, name);
    var semanticKeyInFieldGroup = _findSemanticKeyValuesInFieldGroup(dataFieldGroup, semanticKey.values);
    if (semanticKey.semanticKeyFound) {
      var formatOptionsObj = {
        hasDraftIndicator: true,
        semantickeys: semanticKey.values,
        objectStatusTextVisibility: compileExpression(getRowStatusVisibility(name, false))
      };
      if (isFieldGroupColumn && semanticKeyInFieldGroup.semanticKeyHasPropertyInFieldGroup) {
        formatOptionsObj["objectStatusTextVisibility"] = compileExpression(getRowStatusVisibility(name, true));
        formatOptionsObj["fieldGroupDraftIndicatorPropertyPath"] = semanticKeyInFieldGroup.propertyPath;
      }
      return formatOptionsObj;
    } else if (!semanticKeyInFieldGroup.semanticKeyHasPropertyInFieldGroup) {
      return {};
    } else {
      // Semantic Key has a property in a FieldGroup
      return {
        fieldGroupDraftIndicatorPropertyPath: semanticKeyInFieldGroup.propertyPath,
        fieldGroupName: name,
        objectStatusTextVisibility: compileExpression(getRowStatusVisibility(name, true))
      };
    }
  }
  function _getImpNumber(dataField) {
    var _dataField$annotation20, _dataField$annotation21;
    var importance = dataField === null || dataField === void 0 ? void 0 : (_dataField$annotation20 = dataField.annotations) === null || _dataField$annotation20 === void 0 ? void 0 : (_dataField$annotation21 = _dataField$annotation20.UI) === null || _dataField$annotation21 === void 0 ? void 0 : _dataField$annotation21.Importance;
    if (importance && importance.includes("UI.ImportanceType/High")) {
      return 3;
    }
    if (importance && importance.includes("UI.ImportanceType/Medium")) {
      return 2;
    }
    if (importance && importance.includes("UI.ImportanceType/Low")) {
      return 1;
    }
    return 0;
  }
  function _getDataFieldImportance(dataField) {
    var _dataField$annotation22, _dataField$annotation23;
    var importance = dataField === null || dataField === void 0 ? void 0 : (_dataField$annotation22 = dataField.annotations) === null || _dataField$annotation22 === void 0 ? void 0 : (_dataField$annotation23 = _dataField$annotation22.UI) === null || _dataField$annotation23 === void 0 ? void 0 : _dataField$annotation23.Importance;
    return importance ? importance.split("/")[1] : Importance.None;
  }
  function _getMaxImportance(fields) {
    if (fields && fields.length > 0) {
      var maxImpNumber = -1;
      var impNumber = -1;
      var DataFieldWithMaxImportance;
      var _iterator = _createForOfIteratorHelper(fields),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var field = _step.value;
          impNumber = _getImpNumber(field);
          if (impNumber > maxImpNumber) {
            maxImpNumber = impNumber;
            DataFieldWithMaxImportance = field;
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return _getDataFieldImportance(DataFieldWithMaxImportance);
    }
    return Importance.None;
  }

  /**
   * Returns the importance value for a column.
   *
   * @param dataField
   * @param semanticKeys
   * @returns The importance value
   */
  function getImportance(dataField, semanticKeys) {
    var _Value6;
    //Evaluate default Importance is not set explicitly
    var fieldsWithImportance, mapSemanticKeys;
    //Check if semanticKeys are defined at the EntitySet level
    if (semanticKeys && semanticKeys.length > 0) {
      mapSemanticKeys = semanticKeys.map(function (key) {
        return key.value;
      });
    }
    if (!dataField) {
      return undefined;
    }
    if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      var fieldGroupData = dataField.Target["$target"]["Data"],
        fieldGroupHasSemanticKey = fieldGroupData && fieldGroupData.some(function (fieldGroupDataField) {
          var _Value4, _Value5;
          return (fieldGroupDataField === null || fieldGroupDataField === void 0 ? void 0 : (_Value4 = fieldGroupDataField.Value) === null || _Value4 === void 0 ? void 0 : _Value4.path) && fieldGroupDataField.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && mapSemanticKeys && mapSemanticKeys.includes(fieldGroupDataField === null || fieldGroupDataField === void 0 ? void 0 : (_Value5 = fieldGroupDataField.Value) === null || _Value5 === void 0 ? void 0 : _Value5.path);
        });
      //If a FieldGroup contains a semanticKey, importance set to High
      if (fieldGroupHasSemanticKey) {
        return Importance.High;
      } else {
        var _dataField$annotation24, _dataField$annotation25;
        //If the DataFieldForAnnotation has an Importance we take it
        if (dataField !== null && dataField !== void 0 && (_dataField$annotation24 = dataField.annotations) !== null && _dataField$annotation24 !== void 0 && (_dataField$annotation25 = _dataField$annotation24.UI) !== null && _dataField$annotation25 !== void 0 && _dataField$annotation25.Importance) {
          return _getDataFieldImportance(dataField);
        }
        // else the highest importance (if any) is returned
        fieldsWithImportance = fieldGroupData && fieldGroupData.filter(function (item) {
          var _item$annotations, _item$annotations$UI;
          return item === null || item === void 0 ? void 0 : (_item$annotations = item.annotations) === null || _item$annotations === void 0 ? void 0 : (_item$annotations$UI = _item$annotations.UI) === null || _item$annotations$UI === void 0 ? void 0 : _item$annotations$UI.Importance;
        });
        return _getMaxImportance(fieldsWithImportance);
      }
      //If the current field is a semanticKey, importance set to High
    }

    return dataField.Value && dataField !== null && dataField !== void 0 && (_Value6 = dataField.Value) !== null && _Value6 !== void 0 && _Value6.path && mapSemanticKeys && mapSemanticKeys.includes(dataField.Value.path) ? Importance.High : _getDataFieldImportance(dataField);
  }

  /**
   * Returns line items from metadata annotations.
   *
   * @param lineItemAnnotation Collection of data fields with their annotations
   * @param visualizationPath The visualization path
   * @param converterContext The converter context
   * @returns The columns from the annotations
   */
  _exports.getImportance = getImportance;
  var getColumnsFromAnnotations = function (lineItemAnnotation, visualizationPath, converterContext) {
    var _tableManifestSetting2;
    var entityType = converterContext.getAnnotationEntityType(lineItemAnnotation),
      annotationColumns = [],
      columnsToBeCreated = {},
      nonSortableColumns = getNonSortablePropertiesRestrictions(converterContext.getEntitySet()),
      tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath),
      tableType = (tableManifestSettings === null || tableManifestSettings === void 0 ? void 0 : (_tableManifestSetting2 = tableManifestSettings.tableSettings) === null || _tableManifestSetting2 === void 0 ? void 0 : _tableManifestSetting2.type) || "ResponsiveTable";
    var textOnlyColumnsFromTextAnnotation = [];
    var semanticKeys = converterContext.getAnnotationsByTerm("Common", "com.sap.vocabularies.Common.v1.SemanticKey", [converterContext.getEntityType()])[0];
    if (lineItemAnnotation) {
      lineItemAnnotation.forEach(function (lineItem) {
        var _lineItem$Value, _lineItem$Value$$targ, _lineItem$Target, _lineItem$Target$$tar, _lineItem$Target2, _lineItem$Target2$$ta, _lineItem$annotations, _lineItem$annotations2, _lineItem$annotations3, _exportSettings;
        if (!_isValidColumn(lineItem)) {
          return;
        }
        var exportSettings = null;
        var semanticObjectAnnotationPath = isDataFieldTypes(lineItem) && (_lineItem$Value = lineItem.Value) !== null && _lineItem$Value !== void 0 && (_lineItem$Value$$targ = _lineItem$Value.$target) !== null && _lineItem$Value$$targ !== void 0 && _lineItem$Value$$targ.fullyQualifiedName ? getSemanticObjectPath(converterContext, lineItem) : undefined;
        var relativePath = _getRelativePath(lineItem);
        var relatedPropertyNames;
        // Determine properties which are consumed by this LineItem.
        var relatedPropertiesInfo = collectRelatedPropertiesRecursively(lineItem, converterContext, tableType);
        var relatedProperties = relatedPropertiesInfo.properties;
        if (lineItem.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_lineItem$Target = lineItem.Target) === null || _lineItem$Target === void 0 ? void 0 : (_lineItem$Target$$tar = _lineItem$Target.$target) === null || _lineItem$Target$$tar === void 0 ? void 0 : _lineItem$Target$$tar.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
          relatedPropertyNames = Object.keys(relatedPropertiesInfo.properties).filter(function (key) {
            var _relatedProperties$ke;
            var isStaticallyHidden;
            if ((_relatedProperties$ke = relatedProperties[key].annotations) !== null && _relatedProperties$ke !== void 0 && _relatedProperties$ke.UI) {
              var _relatedProperties$ke2, _relatedProperties$ke3;
              isStaticallyHidden = isReferencePropertyStaticallyHidden((_relatedProperties$ke2 = relatedProperties[key].annotations) === null || _relatedProperties$ke2 === void 0 ? void 0 : (_relatedProperties$ke3 = _relatedProperties$ke2.UI) === null || _relatedProperties$ke3 === void 0 ? void 0 : _relatedProperties$ke3.DataFieldDefault);
            } else {
              isStaticallyHidden = isReferencePropertyStaticallyHidden(relatedProperties[key]);
            }
            return !isStaticallyHidden;
          });
        } else {
          relatedPropertyNames = Object.keys(relatedPropertiesInfo.properties);
        }
        var additionalPropertyNames = Object.keys(relatedPropertiesInfo.additionalProperties);
        var groupPath = _sliceAtSlash(relativePath, true, false);
        var isGroup = groupPath != relativePath;
        var sLabel = getLabel(lineItem, isGroup);
        var name = _getAnnotationColumnName(lineItem);
        var isFieldGroupColumn = groupPath.indexOf("@com.sap.vocabularies.UI.v1.FieldGroup") > -1;
        var showDataFieldsLabel = isFieldGroupColumn ? _getShowDataFieldsLabel(name, visualizationPath, converterContext) : false;
        var dataType = getDataFieldDataType(lineItem);
        var sDateInputFormat = dataType === "Edm.Date" ? "YYYY-MM-DD" : undefined;
        var formatOptions = _getDefaultFormatOptionsForTable(getDefaultDraftIndicatorForColumn(name, semanticKeys, isFieldGroupColumn, lineItem));
        var fieldGroupHiddenExpressions;
        if (lineItem.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && ((_lineItem$Target2 = lineItem.Target) === null || _lineItem$Target2 === void 0 ? void 0 : (_lineItem$Target2$$ta = _lineItem$Target2.$target) === null || _lineItem$Target2$$ta === void 0 ? void 0 : _lineItem$Target2$$ta.$Type) === "com.sap.vocabularies.UI.v1.FieldGroupType") {
          fieldGroupHiddenExpressions = _getFieldGroupHiddenExpressions(lineItem, formatOptions);
        }
        if (_isExportableColumn(lineItem)) {
          //exclude the types listed above for the Export (generates error on Export as PDF)
          exportSettings = {
            template: relatedPropertiesInfo.exportSettingsTemplate,
            wrap: relatedPropertiesInfo.exportSettingsWrapping,
            type: dataType ? _getExportDataType(dataType, relatedPropertyNames.length > 1) : undefined,
            inputFormat: sDateInputFormat,
            delimiter: dataType === "Edm.Int64"
          };
          if (relatedPropertiesInfo.exportUnitName) {
            exportSettings.unitProperty = relatedPropertiesInfo.exportUnitName;
            exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
          } else if (relatedPropertiesInfo.exportUnitString) {
            exportSettings.unit = relatedPropertiesInfo.exportUnitString;
          }
          if (relatedPropertiesInfo.exportTimezoneName) {
            exportSettings.timezoneProperty = relatedPropertiesInfo.exportTimezoneName;
          } else if (relatedPropertiesInfo.exportTimezoneString) {
            exportSettings.timezone = relatedPropertiesInfo.exportTimezoneString;
          }
        }
        var propertyTypeConfig = dataType && getTypeConfig(lineItem, dataType);
        var oTypeConfig = propertyTypeConfig ? {
          className: dataType,
          oFormatOptions: _objectSpread(_objectSpread({}, formatOptions), propertyTypeConfig.formatOptions),
          oConstraints: propertyTypeConfig.constraints
        } : undefined;
        var visualSettings = {};
        if (!dataType || !oTypeConfig) {
          // for charts
          visualSettings.widthCalculation = null;
        }
        var oColumn = {
          key: KeyHelper.generateKeyFromDataField(lineItem),
          type: ColumnType.Annotation,
          label: sLabel,
          groupLabel: isGroup ? getLabel(lineItem) : null,
          group: isGroup ? groupPath : null,
          FieldGroupHiddenExpressions: fieldGroupHiddenExpressions,
          annotationPath: converterContext.getEntitySetBasedAnnotationPath(lineItem.fullyQualifiedName),
          semanticObjectPath: semanticObjectAnnotationPath,
          availability: isDataFieldAlwaysHidden(lineItem) ? AvailabilityType.Hidden : AvailabilityType.Default,
          name: name,
          showDataFieldsLabel: showDataFieldsLabel,
          relativePath: relativePath,
          sortable: _isColumnSortable(lineItem, relativePath, nonSortableColumns),
          propertyInfos: relatedPropertyNames.length ? relatedPropertyNames : undefined,
          additionalPropertyInfos: additionalPropertyNames.length > 0 ? additionalPropertyNames : undefined,
          exportSettings: exportSettings,
          width: ((_lineItem$annotations = lineItem.annotations) === null || _lineItem$annotations === void 0 ? void 0 : (_lineItem$annotations2 = _lineItem$annotations.HTML5) === null || _lineItem$annotations2 === void 0 ? void 0 : (_lineItem$annotations3 = _lineItem$annotations2.CssDefaults) === null || _lineItem$annotations3 === void 0 ? void 0 : _lineItem$annotations3.width) || undefined,
          importance: getImportance(lineItem, semanticKeys),
          isNavigable: true,
          formatOptions: formatOptions,
          caseSensitive: isFilteringCaseSensitive(converterContext),
          typeConfig: oTypeConfig,
          visualSettings: visualSettings,
          timezoneText: (_exportSettings = exportSettings) === null || _exportSettings === void 0 ? void 0 : _exportSettings.timezone,
          isPartOfLineItem: true
        };
        var sTooltip = _getTooltip(lineItem);
        if (sTooltip) {
          oColumn.tooltip = sTooltip;
        }
        if (relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation.length > 0) {
          textOnlyColumnsFromTextAnnotation.push.apply(textOnlyColumnsFromTextAnnotation, _toConsumableArray(relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation));
        }
        annotationColumns.push(oColumn);

        // Collect information of related columns to be created.
        relatedPropertyNames.forEach(function (relatedPropertyName) {
          columnsToBeCreated[relatedPropertyName] = relatedPropertiesInfo.properties[relatedPropertyName];
        });

        // Create columns for additional properties identified for ALP use case.
        additionalPropertyNames.forEach(function (additionalPropertyName) {
          // Intentional overwrite as we require only one new PropertyInfo for a related Property.
          columnsToBeCreated[additionalPropertyName] = relatedPropertiesInfo.additionalProperties[additionalPropertyName];
        });
      });
    }

    // Get columns from the Properties of EntityType
    return getColumnsFromEntityType(columnsToBeCreated, entityType, annotationColumns, nonSortableColumns, converterContext, tableType, textOnlyColumnsFromTextAnnotation);
  };

  /**
   * Gets the property names from the manifest and checks against existing properties already added by annotations.
   * If a not yet stored property is found it adds it for sorting and filtering only to the annotationColumns.
   *
   * @param properties
   * @param annotationColumns
   * @param converterContext
   * @param entityType
   * @returns The columns from the annotations
   */
  var _getPropertyNames = function (properties, annotationColumns, converterContext, entityType) {
    var matchedProperties;
    if (properties) {
      matchedProperties = properties.map(function (propertyPath) {
        var annotationColumn = annotationColumns.find(function (annotationColumn) {
          return annotationColumn.relativePath === propertyPath && annotationColumn.propertyInfos === undefined;
        });
        if (annotationColumn) {
          return annotationColumn.name;
        } else {
          var relatedColumns = _createRelatedColumns(_defineProperty({}, propertyPath, entityType.resolvePath(propertyPath)), annotationColumns, [], converterContext, entityType, []);
          annotationColumns.push(relatedColumns[0]);
          return relatedColumns[0].name;
        }
      });
    }
    return matchedProperties;
  };
  var _appendCustomTemplate = function (properties) {
    return properties.map(function (property) {
      return "{".concat(properties.indexOf(property), "}");
    }).join("\n");
  };

  /**
   * Returns table column definitions from manifest.
   *
   * These may be custom columns defined in the manifest, slot columns coming through
   * a building block, or annotation columns to overwrite annotation-based columns.
   *
   * @param columns
   * @param annotationColumns
   * @param converterContext
   * @param entityType
   * @param navigationSettings
   * @returns The columns from the manifest
   */
  var getColumnsFromManifest = function (columns, annotationColumns, converterContext, entityType, navigationSettings) {
    var internalColumns = {};
    function isAnnotationColumn(column, key) {
      return annotationColumns.some(function (annotationColumn) {
        return annotationColumn.key === key;
      });
    }
    function isSlotColumn(manifestColumn) {
      return manifestColumn.type === ColumnType.Slot;
    }
    function isCustomColumn(manifestColumn) {
      return manifestColumn.type === undefined && !!manifestColumn.template;
    }
    function _updateLinkedPropertiesOnCustomColumns(propertyInfos, annotationTableColumns) {
      var nonSortableColumns = getNonSortablePropertiesRestrictions(converterContext.getEntitySet());
      propertyInfos.forEach(function (property) {
        annotationTableColumns.forEach(function (prop) {
          if (prop.name === property) {
            prop.sortable = nonSortableColumns.indexOf(property.replace("Property::", "")) === -1;
            prop.isGroupable = prop.sortable;
          }
        });
      });
    }
    for (var key in columns) {
      var _manifestColumn$posit;
      var manifestColumn = columns[key];
      KeyHelper.validateKey(key);

      // BaseTableColumn
      var baseTableColumn = {
        key: key,
        width: manifestColumn.width || undefined,
        position: {
          anchor: (_manifestColumn$posit = manifestColumn.position) === null || _manifestColumn$posit === void 0 ? void 0 : _manifestColumn$posit.anchor,
          placement: manifestColumn.position === undefined ? Placement.After : manifestColumn.position.placement
        },
        caseSensitive: isFilteringCaseSensitive(converterContext)
      };
      if (isAnnotationColumn(manifestColumn, key)) {
        var propertiesToOverwriteAnnotationColumn = _objectSpread(_objectSpread({}, baseTableColumn), {}, {
          importance: manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.importance,
          horizontalAlign: manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.horizontalAlign,
          availability: manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.availability,
          type: ColumnType.Annotation,
          isNavigable: isAnnotationColumn(manifestColumn, key) ? undefined : isActionNavigable(manifestColumn, navigationSettings, true),
          settings: manifestColumn.settings,
          formatOptions: _getDefaultFormatOptionsForTable(manifestColumn.formatOptions)
        });
        internalColumns[key] = propertiesToOverwriteAnnotationColumn;
      } else {
        var propertyInfos = _getPropertyNames(manifestColumn.properties, annotationColumns, converterContext, entityType);
        var baseManifestColumn = _objectSpread(_objectSpread({}, baseTableColumn), {}, {
          header: manifestColumn.header,
          importance: (manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.importance) || Importance.None,
          horizontalAlign: (manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.horizontalAlign) || HorizontalAlign.Begin,
          availability: (manifestColumn === null || manifestColumn === void 0 ? void 0 : manifestColumn.availability) || AvailabilityType.Default,
          template: manifestColumn.template,
          propertyInfos: propertyInfos,
          exportSettings: propertyInfos ? {
            template: _appendCustomTemplate(propertyInfos),
            wrap: !!(propertyInfos.length > 1)
          } : null,
          id: "CustomColumn::".concat(key),
          name: "CustomColumn::".concat(key),
          //Needed for MDC:
          formatOptions: {
            textLinesEdit: 4
          },
          isGroupable: false,
          isNavigable: false,
          sortable: false,
          visualSettings: {
            widthCalculation: null
          }
        });
        if (propertyInfos) {
          _updateLinkedPropertiesOnCustomColumns(propertyInfos, annotationColumns);
        }
        if (isSlotColumn(manifestColumn)) {
          var customTableColumn = _objectSpread(_objectSpread({}, baseManifestColumn), {}, {
            type: ColumnType.Slot
          });
          internalColumns[key] = customTableColumn;
        } else if (isCustomColumn(manifestColumn)) {
          var _customTableColumn = _objectSpread(_objectSpread({}, baseManifestColumn), {}, {
            type: ColumnType.Default
          });
          internalColumns[key] = _customTableColumn;
        } else {
          var _IssueCategoryType$An;
          var message = "The annotation column '".concat(key, "' referenced in the manifest is not found");
          converterContext.getDiagnostics().addIssue(IssueCategory.Manifest, IssueSeverity.Low, message, IssueCategoryType, IssueCategoryType === null || IssueCategoryType === void 0 ? void 0 : (_IssueCategoryType$An = IssueCategoryType.AnnotationColumns) === null || _IssueCategoryType$An === void 0 ? void 0 : _IssueCategoryType$An.InvalidKey);
        }
      }
    }
    return internalColumns;
  };
  function getP13nMode(visualizationPath, converterContext, tableManifestConfiguration) {
    var _tableManifestSetting3;
    var manifestWrapper = converterContext.getManifestWrapper();
    var tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    var variantManagement = manifestWrapper.getVariantManagement();
    var aPersonalization = [];
    var isAnalyticalTable = tableManifestConfiguration.type === "AnalyticalTable";
    var isResponsiveTable = tableManifestConfiguration.type === "ResponsiveTable";
    if ((tableManifestSettings === null || tableManifestSettings === void 0 ? void 0 : (_tableManifestSetting3 = tableManifestSettings.tableSettings) === null || _tableManifestSetting3 === void 0 ? void 0 : _tableManifestSetting3.personalization) !== undefined) {
      // Personalization configured in manifest.
      var personalization = tableManifestSettings.tableSettings.personalization;
      if (personalization === true) {
        // Table personalization fully enabled.
        switch (tableManifestConfiguration.type) {
          case "AnalyticalTable":
            return "Sort,Column,Filter,Group,Aggregate";
          case "ResponsiveTable":
            return "Sort,Column,Filter,Group";
          default:
            return "Sort,Column,Filter";
        }
      } else if (typeof personalization === "object") {
        // Specific personalization options enabled in manifest. Use them as is.
        if (personalization.sort) {
          aPersonalization.push("Sort");
        }
        if (personalization.column) {
          aPersonalization.push("Column");
        }
        if (personalization.filter) {
          aPersonalization.push("Filter");
        }
        if (personalization.group && (isAnalyticalTable || isResponsiveTable)) {
          aPersonalization.push("Group");
        }
        if (personalization.aggregate && isAnalyticalTable) {
          aPersonalization.push("Aggregate");
        }
        return aPersonalization.length > 0 ? aPersonalization.join(",") : undefined;
      }
    } else {
      // No personalization configured in manifest.
      aPersonalization.push("Sort");
      aPersonalization.push("Column");
      if (converterContext.getTemplateType() === TemplateType.ListReport) {
        if (variantManagement === VariantManagementType.Control || _isFilterBarHidden(manifestWrapper, converterContext)) {
          // Feature parity with V2.
          // Enable table filtering by default only in case of Control level variant management.
          // Or when the LR filter bar is hidden via manifest setting
          aPersonalization.push("Filter");
        }
      } else {
        aPersonalization.push("Filter");
      }
      if (isAnalyticalTable) {
        aPersonalization.push("Group");
        aPersonalization.push("Aggregate");
      }
      if (isResponsiveTable) {
        aPersonalization.push("Group");
      }
      return aPersonalization.join(",");
    }
    return undefined;
  }

  /**
   * Returns a Boolean value suggesting if a filter bar is being used on the page.
   *
   * Chart has a dependency to filter bar (issue with loading data). Once resolved, the check for chart should be removed here.
   * Until then, hiding filter bar is now allowed if a chart is being used on LR.
   *
   * @param manifestWrapper Manifest settings getter for the page
   * @param converterContext The instance of the converter context
   * @returns Boolean suggesting if a filter bar is being used on the page.
   */
  _exports.getP13nMode = getP13nMode;
  function _isFilterBarHidden(manifestWrapper, converterContext) {
    return manifestWrapper.isFilterBarHidden() && !converterContext.getManifestWrapper().hasMultipleVisualizations() && converterContext.getTemplateType() !== TemplateType.AnalyticalListPage;
  }

  /**
   * Returns a JSON string containing the sort conditions for the presentation variant.
   *
   * @param converterContext The instance of the converter context
   * @param presentationVariantAnnotation Presentation variant annotation
   * @param columns Table columns processed by the converter
   * @returns Sort conditions for a presentation variant.
   */
  function getSortConditions(converterContext, presentationVariantAnnotation, columns) {
    // Currently navigation property is not supported as sorter
    var nonSortableProperties = getNonSortablePropertiesRestrictions(converterContext.getEntitySet());
    var sortConditions;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.SortOrder) {
      var sorters = [];
      var conditions = {
        sorters: sorters
      };
      presentationVariantAnnotation.SortOrder.forEach(function (condition) {
        var _conditionProperty$$t;
        var conditionProperty = condition.Property;
        if (conditionProperty && nonSortableProperties.indexOf((_conditionProperty$$t = conditionProperty.$target) === null || _conditionProperty$$t === void 0 ? void 0 : _conditionProperty$$t.name) === -1) {
          var infoName = convertPropertyPathsToInfoNames([conditionProperty], columns)[0];
          if (infoName) {
            conditions.sorters.push({
              name: infoName,
              descending: !!condition.Descending
            });
          }
        }
      });
      sortConditions = conditions.sorters.length ? JSON.stringify(conditions) : undefined;
    }
    return sortConditions;
  }

  /**
   * Converts an array of propertyPath to an array of propertyInfo names.
   *
   * @param paths the array to be converted
   * @param columns the array of propertyInfos
   * @returns an array of propertyInfo names
   */

  function convertPropertyPathsToInfoNames(paths, columns) {
    var infoNames = [];
    var propertyInfo, annotationColumn;
    paths.forEach(function (currentPath) {
      if (currentPath !== null && currentPath !== void 0 && currentPath.value) {
        propertyInfo = columns.find(function (column) {
          annotationColumn = column;
          return !annotationColumn.propertyInfos && annotationColumn.relativePath === (currentPath === null || currentPath === void 0 ? void 0 : currentPath.value);
        });
        if (propertyInfo) {
          infoNames.push(propertyInfo.name);
        }
      }
    });
    return infoNames;
  }

  /**
   * Returns a JSON string containing Presentation Variant group conditions.
   *
   * @param presentationVariantAnnotation Presentation variant annotation
   * @param columns Converter processed table columns
   * @param tableType The table type.
   * @returns Group conditions for a Presentation variant.
   */
  function getGroupConditions(presentationVariantAnnotation, columns, tableType) {
    var groupConditions;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.GroupBy) {
      var aGroupBy = presentationVariantAnnotation.GroupBy;
      if (tableType === "ResponsiveTable") {
        aGroupBy = aGroupBy.slice(0, 1);
      }
      var aGroupLevels = convertPropertyPathsToInfoNames(aGroupBy, columns).map(function (infoName) {
        return {
          name: infoName
        };
      });
      groupConditions = aGroupLevels.length ? JSON.stringify({
        groupLevels: aGroupLevels
      }) : undefined;
    }
    return groupConditions;
  }

  /**
   * Returns a JSON string containing Presentation Variant aggregate conditions.
   *
   * @param presentationVariantAnnotation Presentation variant annotation
   * @param columns Converter processed table columns
   * @returns Group conditions for a Presentation variant.
   */
  function getAggregateConditions(presentationVariantAnnotation, columns) {
    var aggregateConditions;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.Total) {
      var aTotals = presentationVariantAnnotation.Total;
      var aggregates = {};
      convertPropertyPathsToInfoNames(aTotals, columns).forEach(function (infoName) {
        aggregates[infoName] = {};
      });
      aggregateConditions = JSON.stringify(aggregates);
    }
    return aggregateConditions;
  }
  function getTableAnnotationConfiguration(lineItemAnnotation, visualizationPath, converterContext, tableManifestConfiguration, columns, presentationVariantAnnotation, viewConfiguration) {
    var _converterContext$get16, _converterContext$get17, _converterContext$get18;
    // Need to get the target
    var _splitPath2 = splitPath(visualizationPath),
      navigationPropertyPath = _splitPath2.navigationPropertyPath;
    var title = (_converterContext$get16 = converterContext.getDataModelObjectPath().targetEntityType.annotations) === null || _converterContext$get16 === void 0 ? void 0 : (_converterContext$get17 = _converterContext$get16.UI) === null || _converterContext$get17 === void 0 ? void 0 : (_converterContext$get18 = _converterContext$get17.HeaderInfo) === null || _converterContext$get18 === void 0 ? void 0 : _converterContext$get18.TypeNamePlural;
    var entitySet = converterContext.getDataModelObjectPath().targetEntitySet;
    var pageManifestSettings = converterContext.getManifestWrapper();
    var hasAbsolutePath = navigationPropertyPath.length === 0,
      p13nMode = getP13nMode(visualizationPath, converterContext, tableManifestConfiguration),
      id = navigationPropertyPath ? getTableID(visualizationPath) : getTableID(converterContext.getContextPath(), "LineItem");
    var targetCapabilities = getCapabilityRestriction(converterContext);
    var navigationTargetPath = getNavigationTargetPath(converterContext, navigationPropertyPath);
    var navigationSettings = pageManifestSettings.getNavigationConfiguration(navigationTargetPath);
    var creationBehaviour = _getCreationBehaviour(lineItemAnnotation, tableManifestConfiguration, converterContext, navigationSettings, visualizationPath);
    var standardActionsContext = generateStandardActionsContext(converterContext, creationBehaviour.mode, tableManifestConfiguration, viewConfiguration);
    var deleteButtonVisibilityExpression = getDeleteVisibility(converterContext, standardActionsContext);
    var createButtonVisibilityExpression = getCreateVisibility(converterContext, standardActionsContext);
    var massEditButtonVisibilityExpression = getMassEditVisibility(converterContext, standardActionsContext);
    var isInsertUpdateTemplated = getInsertUpdateActionsTemplating(standardActionsContext, isDraftOrStickySupported(converterContext), compileExpression(createButtonVisibilityExpression) === "false");
    var selectionMode = getSelectionMode(lineItemAnnotation, visualizationPath, converterContext, hasAbsolutePath, targetCapabilities, deleteButtonVisibilityExpression, massEditButtonVisibilityExpression);
    var threshold = navigationPropertyPath ? 10 : 30;
    if (presentationVariantAnnotation !== null && presentationVariantAnnotation !== void 0 && presentationVariantAnnotation.MaxItems) {
      threshold = presentationVariantAnnotation.MaxItems.valueOf();
    }
    var variantManagement = pageManifestSettings.getVariantManagement();
    var isSearchable = isPathSearchable(converterContext.getDataModelObjectPath());
    var standardActions = {
      create: getStandardActionCreate(converterContext, standardActionsContext),
      "delete": getStandardActionDelete(converterContext, standardActionsContext),
      paste: getStandardActionPaste(converterContext, standardActionsContext, isInsertUpdateTemplated),
      massEdit: getStandardActionMassEdit(converterContext, standardActionsContext),
      creationRow: getCreationRow(converterContext, standardActionsContext)
    };
    return {
      id: id,
      entityName: entitySet ? entitySet.name : "",
      collection: getTargetObjectPath(converterContext.getDataModelObjectPath()),
      navigationPath: navigationPropertyPath,
      row: _getRowConfigurationProperty(lineItemAnnotation, visualizationPath, converterContext, navigationSettings, navigationTargetPath),
      p13nMode: p13nMode,
      standardActions: {
        actions: standardActions,
        isInsertUpdateTemplated: isInsertUpdateTemplated,
        updatablePropertyPath: getCurrentEntitySetUpdatablePath(converterContext)
      },
      displayMode: isInDisplayMode(converterContext, viewConfiguration),
      create: creationBehaviour,
      selectionMode: selectionMode,
      autoBindOnInit: _isFilterBarHidden(pageManifestSettings, converterContext) || converterContext.getTemplateType() !== TemplateType.ListReport && converterContext.getTemplateType() !== TemplateType.AnalyticalListPage && !(viewConfiguration && pageManifestSettings.hasMultipleVisualizations(viewConfiguration)),
      variantManagement: variantManagement === "Control" && !p13nMode ? VariantManagementType.None : variantManagement,
      threshold: threshold,
      sortConditions: getSortConditions(converterContext, presentationVariantAnnotation, columns),
      title: title,
      searchable: tableManifestConfiguration.type !== "AnalyticalTable" && !(isConstant(isSearchable) && isSearchable.value === false)
    };
  }
  _exports.getTableAnnotationConfiguration = getTableAnnotationConfiguration;
  function _getExportDataType(dataType) {
    var isComplexProperty = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var exportDataType = "String";
    if (isComplexProperty) {
      if (dataType === "Edm.DateTimeOffset") {
        exportDataType = "DateTime";
      }
      return exportDataType;
    } else {
      switch (dataType) {
        case "Edm.Decimal":
        case "Edm.Int32":
        case "Edm.Int64":
        case "Edm.Double":
        case "Edm.Byte":
          exportDataType = "Number";
          break;
        case "Edm.DateOfTime":
        case "Edm.Date":
          exportDataType = "Date";
          break;
        case "Edm.DateTimeOffset":
          exportDataType = "DateTime";
          break;
        case "Edm.TimeOfDay":
          exportDataType = "Time";
          break;
        case "Edm.Boolean":
          exportDataType = "Boolean";
          break;
        default:
          exportDataType = "String";
      }
    }
    return exportDataType;
  }

  /**
   * Split the visualization path into the navigation property path and annotation.
   *
   * @param visualizationPath
   * @returns The split path
   */
  function splitPath(visualizationPath) {
    var _visualizationPath$sp = visualizationPath.split("@"),
      _visualizationPath$sp2 = _slicedToArray(_visualizationPath$sp, 2),
      navigationPropertyPath = _visualizationPath$sp2[0],
      annotationPath = _visualizationPath$sp2[1];
    if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
      // Drop trailing slash
      navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
    }
    return {
      navigationPropertyPath: navigationPropertyPath,
      annotationPath: annotationPath
    };
  }
  _exports.splitPath = splitPath;
  function getSelectionVariantConfiguration(selectionVariantPath, converterContext) {
    var resolvedTarget = converterContext.getEntityTypeAnnotation(selectionVariantPath);
    var selection = resolvedTarget.annotation;
    if (selection) {
      var _selection$SelectOpti, _selection$Text;
      var propertyNames = [];
      (_selection$SelectOpti = selection.SelectOptions) === null || _selection$SelectOpti === void 0 ? void 0 : _selection$SelectOpti.forEach(function (selectOption) {
        var propertyName = selectOption.PropertyName;
        var propertyPath = propertyName.value;
        if (propertyNames.indexOf(propertyPath) === -1) {
          propertyNames.push(propertyPath);
        }
      });
      return {
        text: selection === null || selection === void 0 ? void 0 : (_selection$Text = selection.Text) === null || _selection$Text === void 0 ? void 0 : _selection$Text.toString(),
        propertyNames: propertyNames
      };
    }
    return undefined;
  }
  _exports.getSelectionVariantConfiguration = getSelectionVariantConfiguration;
  function _getFullScreenBasedOnDevice(tableSettings, converterContext, isIphone) {
    var _tableSettings$enable;
    // If enableFullScreen is not set, use as default true on phone and false otherwise
    var enableFullScreen = (_tableSettings$enable = tableSettings.enableFullScreen) !== null && _tableSettings$enable !== void 0 ? _tableSettings$enable : isIphone;
    // Make sure that enableFullScreen is not set on ListReport for desktop or tablet
    if (!isIphone && enableFullScreen && converterContext.getTemplateType() === TemplateType.ListReport) {
      enableFullScreen = false;
      converterContext.getDiagnostics().addIssue(IssueCategory.Manifest, IssueSeverity.Low, IssueType.FULLSCREENMODE_NOT_ON_LISTREPORT);
    }
    return enableFullScreen;
  }
  function _getMultiSelectMode(tableSettings, tableType, converterContext) {
    var multiSelectMode;
    if (tableType !== "ResponsiveTable") {
      return undefined;
    }
    switch (converterContext.getTemplateType()) {
      case TemplateType.ListReport:
      case TemplateType.AnalyticalListPage:
        multiSelectMode = !tableSettings.selectAll ? "ClearAll" : "Default";
        break;
      case TemplateType.ObjectPage:
        multiSelectMode = tableSettings.selectAll === false ? "ClearAll" : "Default";
        if (converterContext.getManifestWrapper().useIconTabBar()) {
          multiSelectMode = !tableSettings.selectAll ? "ClearAll" : "Default";
        }
        break;
      default:
    }
    return multiSelectMode;
  }
  function _getTableType(tableSettings, aggregationHelper, converterContext) {
    var tableType = (tableSettings === null || tableSettings === void 0 ? void 0 : tableSettings.type) || "ResponsiveTable";
    /*  Now, we keep the configuration in the manifest, even if it leads to errors.
    	We only change if we're not on desktop from Analytical to Responsive.
     */
    if (tableType === "AnalyticalTable" && !converterContext.getManifestWrapper().isDesktop()) {
      tableType = "ResponsiveTable";
    }
    return tableType;
  }
  function _getGridTableMode(tableType, tableSettings, isTemplateListReport) {
    if (tableType === "GridTable") {
      if (isTemplateListReport) {
        return {
          rowCountMode: "Auto",
          rowCount: "3"
        };
      } else {
        return {
          rowCountMode: tableSettings.rowCountMode ? tableSettings.rowCountMode : "Fixed",
          rowCount: tableSettings.rowCount ? tableSettings.rowCount : 5
        };
      }
    } else {
      return {};
    }
  }
  function _getCondensedTableLayout(_tableType, _tableSettings) {
    return _tableSettings.condensedTableLayout !== undefined && _tableType !== "ResponsiveTable" ? _tableSettings.condensedTableLayout : false;
  }
  function _getTableSelectionLimit(_tableSettings) {
    return _tableSettings.selectAll === true || _tableSettings.selectionLimit === 0 ? 0 : _tableSettings.selectionLimit || 200;
  }
  function _getTableInlineCreationRowCount(_tableSettings) {
    var _tableSettings$creati, _tableSettings$creati2;
    return (_tableSettings$creati = _tableSettings.creationMode) !== null && _tableSettings$creati !== void 0 && _tableSettings$creati.inlineCreationRowCount ? (_tableSettings$creati2 = _tableSettings.creationMode) === null || _tableSettings$creati2 === void 0 ? void 0 : _tableSettings$creati2.inlineCreationRowCount : 2;
  }
  function _getFilters(tableSettings, quickFilterPaths, quickSelectionVariant, path, converterContext) {
    var _tableSettings$quickV;
    if (quickSelectionVariant) {
      quickFilterPaths.push({
        annotationPath: path.annotationPath
      });
    }
    return {
      quickFilters: {
        enabled: converterContext.getTemplateType() !== TemplateType.ListReport,
        showCounts: tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$quickV = tableSettings.quickVariantSelection) === null || _tableSettings$quickV === void 0 ? void 0 : _tableSettings$quickV.showCounts,
        paths: quickFilterPaths
      }
    };
  }
  function _getEnableExport(tableSettings, converterContext, enablePaste) {
    return tableSettings.enableExport !== undefined ? tableSettings.enableExport : converterContext.getTemplateType() !== "ObjectPage" || enablePaste;
  }
  function _getFilterConfiguration(tableSettings, lineItemAnnotation, converterContext) {
    var _tableSettings$quickV2, _tableSettings$quickV3, _tableSettings$quickV4;
    if (!lineItemAnnotation) {
      return {};
    }
    var quickFilterPaths = [];
    var targetEntityType = converterContext.getAnnotationEntityType(lineItemAnnotation);
    var quickSelectionVariant;
    var filters;
    tableSettings === null || tableSettings === void 0 ? void 0 : (_tableSettings$quickV2 = tableSettings.quickVariantSelection) === null || _tableSettings$quickV2 === void 0 ? void 0 : (_tableSettings$quickV3 = _tableSettings$quickV2.paths) === null || _tableSettings$quickV3 === void 0 ? void 0 : _tableSettings$quickV3.forEach(function (path) {
      quickSelectionVariant = targetEntityType.resolvePath(path.annotationPath);
      filters = _getFilters(tableSettings, quickFilterPaths, quickSelectionVariant, path, converterContext);
    });
    var hideTableTitle = false;
    hideTableTitle = !!((_tableSettings$quickV4 = tableSettings.quickVariantSelection) !== null && _tableSettings$quickV4 !== void 0 && _tableSettings$quickV4.hideTableTitle);
    return {
      filters: filters,
      headerVisible: !(quickSelectionVariant && hideTableTitle)
    };
  }
  function _getCollectedNavigationPropertyLabels(relativePath, converterContext) {
    var navigationProperties = enhanceDataModelPath(converterContext.getDataModelObjectPath(), relativePath).navigationProperties;
    if ((navigationProperties === null || navigationProperties === void 0 ? void 0 : navigationProperties.length) > 0) {
      var collectedNavigationPropertyLabels = [];
      navigationProperties.forEach(function (navProperty) {
        collectedNavigationPropertyLabels.push(getLabel(navProperty) || navProperty.name);
      });
      return collectedNavigationPropertyLabels;
    }
  }
  function getTableManifestConfiguration(lineItemAnnotation, visualizationPath, converterContext) {
    var _tableSettings$creati3, _tableSettings$creati4, _tableSettings$creati5, _tableSettings$creati6, _tableSettings$creati7, _tableSettings$quickV5, _manifestWrapper$getV;
    var checkCondensedLayout = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var _manifestWrapper = converterContext.getManifestWrapper();
    var tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    var tableSettings = tableManifestSettings && tableManifestSettings.tableSettings || {};
    var creationMode = ((_tableSettings$creati3 = tableSettings.creationMode) === null || _tableSettings$creati3 === void 0 ? void 0 : _tableSettings$creati3.name) || CreationMode.NewPage;
    var enableAutoColumnWidth = !_manifestWrapper.isPhone();
    var enablePaste = tableSettings.enablePaste !== undefined ? tableSettings.enablePaste : converterContext.getTemplateType() === "ObjectPage"; // Paste is disabled by default excepted for OP
    var templateType = converterContext.getTemplateType();
    var dataStateIndicatorFilter = templateType === TemplateType.ListReport ? "API.dataStateIndicatorFilter" : undefined;
    var isCondensedTableLayoutCompliant = checkCondensedLayout && _manifestWrapper.isCondensedLayoutCompliant();
    var oFilterConfiguration = _getFilterConfiguration(tableSettings, lineItemAnnotation, converterContext);
    var customValidationFunction = (_tableSettings$creati4 = tableSettings.creationMode) === null || _tableSettings$creati4 === void 0 ? void 0 : _tableSettings$creati4.customValidationFunction;
    var entityType = converterContext.getEntityType();
    var aggregationHelper = new AggregationHelper(entityType, converterContext);
    var tableType = _getTableType(tableSettings, aggregationHelper, converterContext);
    var gridTableRowMode = _getGridTableMode(tableType, tableSettings, templateType === TemplateType.ListReport);
    var condensedTableLayout = _getCondensedTableLayout(tableType, tableSettings);
    var oConfiguration = {
      // If no createAtEnd is specified it will be false for Inline create and true otherwise
      createAtEnd: ((_tableSettings$creati5 = tableSettings.creationMode) === null || _tableSettings$creati5 === void 0 ? void 0 : _tableSettings$creati5.createAtEnd) !== undefined ? (_tableSettings$creati6 = tableSettings.creationMode) === null || _tableSettings$creati6 === void 0 ? void 0 : _tableSettings$creati6.createAtEnd : creationMode !== CreationMode.Inline,
      creationMode: creationMode,
      customValidationFunction: customValidationFunction,
      dataStateIndicatorFilter: dataStateIndicatorFilter,
      // if a custom validation function is provided, disableAddRowButtonForEmptyData should not be considered, i.e. set to false
      disableAddRowButtonForEmptyData: !customValidationFunction ? !!((_tableSettings$creati7 = tableSettings.creationMode) !== null && _tableSettings$creati7 !== void 0 && _tableSettings$creati7.disableAddRowButtonForEmptyData) : false,
      enableAutoColumnWidth: enableAutoColumnWidth,
      enableExport: _getEnableExport(tableSettings, converterContext, enablePaste),
      enableFullScreen: _getFullScreenBasedOnDevice(tableSettings, converterContext, _manifestWrapper.isPhone()),
      enableMassEdit: tableSettings === null || tableSettings === void 0 ? void 0 : tableSettings.enableMassEdit,
      enablePaste: enablePaste,
      headerVisible: true,
      multiSelectMode: _getMultiSelectMode(tableSettings, tableType, converterContext),
      selectionLimit: _getTableSelectionLimit(tableSettings),
      inlineCreationRowCount: _getTableInlineCreationRowCount(tableSettings),
      showRowCount: !(tableSettings !== null && tableSettings !== void 0 && (_tableSettings$quickV5 = tableSettings.quickVariantSelection) !== null && _tableSettings$quickV5 !== void 0 && _tableSettings$quickV5.showCounts) && !((_manifestWrapper$getV = _manifestWrapper.getViewConfiguration()) !== null && _manifestWrapper$getV !== void 0 && _manifestWrapper$getV.showCounts),
      type: tableType,
      useCondensedTableLayout: condensedTableLayout && isCondensedTableLayoutCompliant,
      isCompactType: _manifestWrapper.isCompactType()
    };
    return _objectSpread(_objectSpread(_objectSpread({}, oConfiguration), gridTableRowMode), oFilterConfiguration);
  }
  _exports.getTableManifestConfiguration = getTableManifestConfiguration;
  function getTypeConfig(oProperty, dataType) {
    var _targetType, _oTargetMapping, _propertyTypeConfig$t, _propertyTypeConfig$t2, _propertyTypeConfig$t3, _propertyTypeConfig$t4;
    var oTargetMapping = EDM_TYPE_MAPPING[oProperty === null || oProperty === void 0 ? void 0 : oProperty.type] || (dataType ? EDM_TYPE_MAPPING[dataType] : undefined);
    if (!oTargetMapping && oProperty !== null && oProperty !== void 0 && oProperty.targetType && ((_targetType = oProperty.targetType) === null || _targetType === void 0 ? void 0 : _targetType._type) === "TypeDefinition") {
      oTargetMapping = EDM_TYPE_MAPPING[oProperty.targetType.underlyingType];
    }
    var propertyTypeConfig = {
      type: (_oTargetMapping = oTargetMapping) === null || _oTargetMapping === void 0 ? void 0 : _oTargetMapping.type,
      constraints: {},
      formatOptions: {}
    };
    if (isProperty(oProperty)) {
      var _oTargetMapping$const, _oTargetMapping$const2, _oTargetMapping$const3, _oTargetMapping$const4, _oTargetMapping$const5, _oProperty$annotation8, _oProperty$annotation9, _oProperty$annotation10, _oProperty$annotation11, _oTargetMapping$const6, _oProperty$annotation12, _oProperty$annotation13, _oProperty$annotation14, _oProperty$annotation15, _oTargetMapping$const7, _oProperty$annotation16, _oProperty$annotation17;
      propertyTypeConfig.constraints = {
        scale: (_oTargetMapping$const = oTargetMapping.constraints) !== null && _oTargetMapping$const !== void 0 && _oTargetMapping$const.$Scale ? oProperty.scale : undefined,
        precision: (_oTargetMapping$const2 = oTargetMapping.constraints) !== null && _oTargetMapping$const2 !== void 0 && _oTargetMapping$const2.$Precision ? oProperty.precision : undefined,
        maxLength: (_oTargetMapping$const3 = oTargetMapping.constraints) !== null && _oTargetMapping$const3 !== void 0 && _oTargetMapping$const3.$MaxLength ? oProperty.maxLength : undefined,
        nullable: (_oTargetMapping$const4 = oTargetMapping.constraints) !== null && _oTargetMapping$const4 !== void 0 && _oTargetMapping$const4.$Nullable ? oProperty.nullable : undefined,
        minimum: (_oTargetMapping$const5 = oTargetMapping.constraints) !== null && _oTargetMapping$const5 !== void 0 && _oTargetMapping$const5["@Org.OData.Validation.V1.Minimum/$Decimal"] && !isNaN((_oProperty$annotation8 = oProperty.annotations) === null || _oProperty$annotation8 === void 0 ? void 0 : (_oProperty$annotation9 = _oProperty$annotation8.Validation) === null || _oProperty$annotation9 === void 0 ? void 0 : _oProperty$annotation9.Minimum) ? "".concat((_oProperty$annotation10 = oProperty.annotations) === null || _oProperty$annotation10 === void 0 ? void 0 : (_oProperty$annotation11 = _oProperty$annotation10.Validation) === null || _oProperty$annotation11 === void 0 ? void 0 : _oProperty$annotation11.Minimum) : undefined,
        maximum: (_oTargetMapping$const6 = oTargetMapping.constraints) !== null && _oTargetMapping$const6 !== void 0 && _oTargetMapping$const6["@Org.OData.Validation.V1.Maximum/$Decimal"] && !isNaN((_oProperty$annotation12 = oProperty.annotations) === null || _oProperty$annotation12 === void 0 ? void 0 : (_oProperty$annotation13 = _oProperty$annotation12.Validation) === null || _oProperty$annotation13 === void 0 ? void 0 : _oProperty$annotation13.Maximum) ? "".concat((_oProperty$annotation14 = oProperty.annotations) === null || _oProperty$annotation14 === void 0 ? void 0 : (_oProperty$annotation15 = _oProperty$annotation14.Validation) === null || _oProperty$annotation15 === void 0 ? void 0 : _oProperty$annotation15.Maximum) : undefined,
        isDigitSequence: propertyTypeConfig.type === "sap.ui.model.odata.type.String" && (_oTargetMapping$const7 = oTargetMapping.constraints) !== null && _oTargetMapping$const7 !== void 0 && _oTargetMapping$const7["@com.sap.vocabularies.Common.v1.IsDigitSequence"] && (_oProperty$annotation16 = oProperty.annotations) !== null && _oProperty$annotation16 !== void 0 && (_oProperty$annotation17 = _oProperty$annotation16.Common) !== null && _oProperty$annotation17 !== void 0 && _oProperty$annotation17.IsDigitSequence ? true : undefined
      };
    }
    propertyTypeConfig.formatOptions = {
      parseAsString: (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t = propertyTypeConfig.type) === null || _propertyTypeConfig$t === void 0 ? void 0 : _propertyTypeConfig$t.indexOf("sap.ui.model.odata.type.Int")) === 0 || (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t2 = propertyTypeConfig.type) === null || _propertyTypeConfig$t2 === void 0 ? void 0 : _propertyTypeConfig$t2.indexOf("sap.ui.model.odata.type.Double")) === 0 ? false : undefined,
      emptyString: (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t3 = propertyTypeConfig.type) === null || _propertyTypeConfig$t3 === void 0 ? void 0 : _propertyTypeConfig$t3.indexOf("sap.ui.model.odata.type.Int")) === 0 || (propertyTypeConfig === null || propertyTypeConfig === void 0 ? void 0 : (_propertyTypeConfig$t4 = propertyTypeConfig.type) === null || _propertyTypeConfig$t4 === void 0 ? void 0 : _propertyTypeConfig$t4.indexOf("sap.ui.model.odata.type.Double")) === 0 ? "" : undefined,
      parseKeepsEmptyString: propertyTypeConfig.type === "sap.ui.model.odata.type.String" ? true : undefined
    };
    return propertyTypeConfig;
  }
  _exports.getTypeConfig = getTypeConfig;
  return {
    getTableActions: getTableActions,
    getTableColumns: getTableColumns,
    getColumnsFromEntityType: getColumnsFromEntityType,
    updateLinkedProperties: updateLinkedProperties,
    createTableVisualization: createTableVisualization,
    createDefaultTableVisualization: createDefaultTableVisualization,
    getCapabilityRestriction: getCapabilityRestriction,
    getSelectionMode: getSelectionMode,
    getRowStatusVisibility: getRowStatusVisibility,
    getImportance: getImportance,
    getP13nMode: getP13nMode,
    getTableAnnotationConfiguration: getTableAnnotationConfiguration,
    isFilteringCaseSensitive: isFilteringCaseSensitive,
    splitPath: splitPath,
    getSelectionVariantConfiguration: getSelectionVariantConfiguration,
    getTableManifestConfiguration: getTableManifestConfiguration,
    getTypeConfig: getTypeConfig
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2x1bW5UeXBlIiwiZ2V0VGFibGVBY3Rpb25zIiwibGluZUl0ZW1Bbm5vdGF0aW9uIiwidmlzdWFsaXphdGlvblBhdGgiLCJjb252ZXJ0ZXJDb250ZXh0IiwibmF2aWdhdGlvblNldHRpbmdzIiwiYVRhYmxlQWN0aW9ucyIsImdldFRhYmxlQW5ub3RhdGlvbkFjdGlvbnMiLCJhQW5ub3RhdGlvbkFjdGlvbnMiLCJ0YWJsZUFjdGlvbnMiLCJhSGlkZGVuQWN0aW9ucyIsImhpZGRlblRhYmxlQWN0aW9ucyIsIm1hbmlmZXN0QWN0aW9ucyIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJnZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uIiwiYWN0aW9ucyIsImluc2VydEN1c3RvbUVsZW1lbnRzIiwiaXNOYXZpZ2FibGUiLCJlbmFibGVPblNlbGVjdCIsImVuYWJsZUF1dG9TY3JvbGwiLCJlbmFibGVkIiwidmlzaWJsZSIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsImNvbW1hbmQiLCJjb21tYW5kQWN0aW9ucyIsImdldFRhYmxlQ29sdW1ucyIsImFubm90YXRpb25Db2x1bW5zIiwiZ2V0Q29sdW1uc0Zyb21Bbm5vdGF0aW9ucyIsIm1hbmlmZXN0Q29sdW1ucyIsImdldENvbHVtbnNGcm9tTWFuaWZlc3QiLCJjb2x1bW5zIiwiZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUiLCJ3aWR0aCIsImltcG9ydGFuY2UiLCJob3Jpem9udGFsQWxpZ24iLCJhdmFpbGFiaWxpdHkiLCJzZXR0aW5ncyIsImZvcm1hdE9wdGlvbnMiLCJnZXRBZ2dyZWdhdGVEZWZpbml0aW9uc0Zyb21FbnRpdHlUeXBlIiwiZW50aXR5VHlwZSIsInRhYmxlQ29sdW1ucyIsImFnZ3JlZ2F0aW9uSGVscGVyIiwiQWdncmVnYXRpb25IZWxwZXIiLCJmaW5kQ29sdW1uRnJvbVBhdGgiLCJwYXRoIiwiZmluZCIsImNvbHVtbiIsImFubm90YXRpb25Db2x1bW4iLCJwcm9wZXJ0eUluZm9zIiwidW5kZWZpbmVkIiwicmVsYXRpdmVQYXRoIiwiaXNBbmFseXRpY3NTdXBwb3J0ZWQiLCJtQ3VycmVuY3lPclVuaXRQcm9wZXJ0aWVzIiwiU2V0IiwiZm9yRWFjaCIsIm9Db2x1bW4iLCJvVGFibGVDb2x1bW4iLCJ1bml0IiwiYWRkIiwiYUN1c3RvbUFnZ3JlZ2F0ZUFubm90YXRpb25zIiwiZ2V0Q3VzdG9tQWdncmVnYXRlRGVmaW5pdGlvbnMiLCJtUmF3RGVmaW5pdGlvbnMiLCJhbm5vdGF0aW9uIiwib0FnZ3JlZ2F0ZWRQcm9wZXJ0eSIsIl9lbnRpdHlUeXBlIiwiZW50aXR5UHJvcGVydGllcyIsIm9Qcm9wZXJ0eSIsIm5hbWUiLCJxdWFsaWZpZXIiLCJhQ29udGV4dERlZmluaW5nUHJvcGVydGllcyIsImFubm90YXRpb25zIiwiQWdncmVnYXRpb24iLCJDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzIiwibWFwIiwib0N0eERlZlByb3BlcnR5IiwidmFsdWUiLCJtUmVzdWx0IiwiYVJhd0NvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMiLCJoYXMiLCJpc0RhdGFQb2ludEZha2VUYXJnZXRQcm9wZXJ0eSIsImRlZmF1bHRBZ2dyZWdhdGUiLCJjb250ZXh0RGVmaW5pbmdQcm9wZXJ0eU5hbWUiLCJmb3VuZENvbHVtbiIsInB1c2giLCJsZW5ndGgiLCJjb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzIiwidXBkYXRlVGFibGVWaXN1YWxpemF0aW9uRm9yQW5hbHl0aWNzIiwidGFibGVWaXN1YWxpemF0aW9uIiwicHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24iLCJjb250cm9sIiwidHlwZSIsImFnZ3JlZ2F0ZXNEZWZpbml0aW9ucyIsImVuYWJsZUFuYWx5dGljcyIsImFnZ3JlZ2F0ZXMiLCJhbGxvd2VkVHJhbnNmb3JtYXRpb25zIiwiZ2V0QWxsb3dlZFRyYW5zZm9ybWF0aW9ucyIsImVuYWJsZUFuYWx5dGljc1NlYXJjaCIsImluZGV4T2YiLCJncm91cENvbmRpdGlvbnMiLCJnZXRHcm91cENvbmRpdGlvbnMiLCJhZ2dyZWdhdGVDb25kaXRpb25zIiwiZ2V0QWdncmVnYXRlQ29uZGl0aW9ucyIsImdldE5hdmlnYXRpb25UYXJnZXRQYXRoIiwibmF2aWdhdGlvblByb3BlcnR5UGF0aCIsIm1hbmlmZXN0V3JhcHBlciIsImdldE1hbmlmZXN0V3JhcHBlciIsImdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uIiwibmF2Q29uZmlnIiwiT2JqZWN0Iiwia2V5cyIsImRhdGFNb2RlbFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoIiwiY29udGV4dFBhdGgiLCJnZXRDb250ZXh0UGF0aCIsIm5hdkNvbmZpZ0ZvckNvbnRleHRQYXRoIiwidGFyZ2V0RW50aXR5U2V0Iiwic3RhcnRpbmdFbnRpdHlTZXQiLCJ1cGRhdGVMaW5rZWRQcm9wZXJ0aWVzIiwiZmluZENvbHVtbkJ5UGF0aCIsIm9Qcm9wIiwib1VuaXQiLCJnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eSIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkiLCJvVGltZXpvbmUiLCJnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eSIsInNUaW1lem9uZSIsIkNvbW1vbiIsIlRpbWV6b25lIiwib1VuaXRDb2x1bW4iLCJzVW5pdCIsIk1lYXN1cmVzIiwiSVNPQ3VycmVuY3kiLCJVbml0IiwidW5pdFRleHQiLCJvVGltZXpvbmVDb2x1bW4iLCJ0aW1lem9uZSIsInRpbWV6b25lVGV4dCIsInRvU3RyaW5nIiwiZGlzcGxheU1vZGUiLCJnZXREaXNwbGF5TW9kZSIsInRleHRBbm5vdGF0aW9uIiwiVGV4dCIsImlzUGF0aEV4cHJlc3Npb24iLCJvVGV4dENvbHVtbiIsInRleHRBcnJhbmdlbWVudCIsInRleHRQcm9wZXJ0eSIsIm1vZGUiLCJnZXRTZW1hbnRpY0tleXNBbmRUaXRsZUluZm8iLCJoZWFkZXJJbmZvVGl0bGVQYXRoIiwiVUkiLCJIZWFkZXJJbmZvIiwiVGl0bGUiLCJWYWx1ZSIsInNlbWFudGljS2V5QW5ub3RhdGlvbnMiLCJTZW1hbnRpY0tleSIsImhlYWRlckluZm9UeXBlTmFtZSIsIlR5cGVOYW1lIiwic2VtYW50aWNLZXlDb2x1bW5zIiwiY3JlYXRlVGFibGVWaXN1YWxpemF0aW9uIiwiaXNDb25kZW5zZWRUYWJsZUxheW91dENvbXBsaWFudCIsInZpZXdDb25maWd1cmF0aW9uIiwidGFibGVNYW5pZmVzdENvbmZpZyIsImdldFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uIiwic3BsaXRQYXRoIiwibmF2aWdhdGlvblRhcmdldFBhdGgiLCJvcGVyYXRpb25BdmFpbGFibGVNYXAiLCJnZXRPcGVyYXRpb25BdmFpbGFibGVNYXAiLCJzZW1hbnRpY0tleXNBbmRIZWFkZXJJbmZvVGl0bGUiLCJvVmlzdWFsaXphdGlvbiIsIlZpc3VhbGl6YXRpb25UeXBlIiwiVGFibGUiLCJnZXRUYWJsZUFubm90YXRpb25Db25maWd1cmF0aW9uIiwicmVtb3ZlRHVwbGljYXRlQWN0aW9ucyIsIkpTT04iLCJzdHJpbmdpZnkiLCJvcGVyYXRpb25BdmFpbGFibGVQcm9wZXJ0aWVzIiwiZ2V0T3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllcyIsImhlYWRlckluZm9UaXRsZSIsInNlbWFudGljS2V5cyIsImNyZWF0ZURlZmF1bHRUYWJsZVZpc3VhbGl6YXRpb24iLCJnZXRDb2x1bW5zRnJvbUVudGl0eVR5cGUiLCJnZXRFbnRpdHlUeXBlIiwiQWN0aW9uSGVscGVyIiwiZ2V0Q3VycmVudEVudGl0eVNldFVwZGF0YWJsZVBhdGgiLCJyZXN0cmljdGlvbnMiLCJnZXRSZXN0cmljdGlvbnMiLCJlbnRpdHlTZXQiLCJnZXRFbnRpdHlTZXQiLCJ1cGRhdGFibGUiLCJpc1VwZGF0YWJsZSIsImlzT25seUR5bmFtaWNPbkN1cnJlbnRFbnRpdHkiLCJpc0NvbnN0YW50IiwiZXhwcmVzc2lvbiIsIm5hdmlnYXRpb25FeHByZXNzaW9uIiwiX3R5cGUiLCJ1cGRhdGFibGVQcm9wZXJ0eVBhdGgiLCJDYXBhYmlsaXRpZXMiLCJVcGRhdGVSZXN0cmljdGlvbnMiLCJVcGRhdGFibGUiLCJwcm9wZXJ0aWVzIiwiYWN0aW9uTmFtZSIsInByb3BlcnR5TmFtZSIsInNpemUiLCJ0aXRsZVByb3BlcnR5IiwiQXJyYXkiLCJmcm9tIiwiam9pbiIsImdldFVJSGlkZGVuRXhwRm9yQWN0aW9uc1JlcXVpcmluZ0NvbnRleHQiLCJjdXJyZW50RW50aXR5VHlwZSIsImNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoIiwiaXNFbnRpdHlTZXQiLCJhVWlIaWRkZW5QYXRoRXhwcmVzc2lvbnMiLCJkYXRhRmllbGQiLCIkVHlwZSIsIkFjdGlvblRhcmdldCIsImlzQm91bmQiLCJzb3VyY2VFbnRpdHlUeXBlIiwiUmVxdWlyZXNDb250ZXh0IiwiSW5saW5lIiwidmFsdWVPZiIsIkhpZGRlbiIsImVxdWFsIiwiZ2V0QmluZGluZ0V4cEZyb21Db250ZXh0Iiwic291cmNlIiwic0V4cHJlc3Npb24iLCJzUGF0aCIsInN1YnN0cmluZyIsImFTcGxpdFBhdGgiLCJzcGxpdCIsInNOYXZpZ2F0aW9uUGF0aCIsInRhcmdldE9iamVjdCIsInBhcnRuZXIiLCJwYXRoSW5Nb2RlbCIsInNsaWNlIiwiY29uc3RhbnQiLCJoYXNCb3VuZEFjdGlvbnNBbHdheXNWaXNpYmxlSW5Ub29sQmFyIiwic29tZSIsImhhc0N1c3RvbUFjdGlvbnNBbHdheXNWaXNpYmxlSW5Ub29sQmFyIiwiYWN0aW9uS2V5IiwiYWN0aW9uIiwicmVxdWlyZXNTZWxlY3Rpb24iLCJnZXRWaXNpYmxlRXhwRm9yQ3VzdG9tQWN0aW9uc1JlcXVpcmluZ0NvbnRleHQiLCJhVmlzaWJsZVBhdGhFeHByZXNzaW9ucyIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiZ2V0Q2FwYWJpbGl0eVJlc3RyaWN0aW9uIiwiaXNEZWxldGFibGUiLCJpc1BhdGhEZWxldGFibGUiLCJpc1BhdGhVcGRhdGFibGUiLCJnZXRTZWxlY3Rpb25Nb2RlIiwidGFyZ2V0Q2FwYWJpbGl0aWVzIiwiZGVsZXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24iLCJtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uIiwiU2VsZWN0aW9uTW9kZSIsIk5vbmUiLCJ0YWJsZU1hbmlmZXN0U2V0dGluZ3MiLCJzZWxlY3Rpb25Nb2RlIiwidGFibGVTZXR0aW5ncyIsImFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnMiLCJhVmlzaWJsZUJpbmRpbmdFeHByZXNzaW9ucyIsImlzUGFyZW50RGVsZXRhYmxlIiwicGFyZW50RW50aXR5U2V0RGVsZXRhYmxlIiwiZ2V0VGVtcGxhdGVUeXBlIiwiVGVtcGxhdGVUeXBlIiwiT2JqZWN0UGFnZSIsImNvbXBpbGVFeHByZXNzaW9uIiwiYk1hc3NFZGl0RW5hYmxlZCIsImlmRWxzZSIsImFuZCIsIklzRWRpdGFibGUiLCJNdWx0aSIsIkF1dG8iLCJTaW5nbGUiLCJidXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiIsIm9yIiwiZWRpdE1vZGVidXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiIsImNvbmNhdCIsInRhYmxlQWN0aW9uIiwiaXNEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdCIsIkRldGVybWluaW5nIiwia2V5IiwiS2V5SGVscGVyIiwiZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkIiwiQWN0aW9uVHlwZSIsIkRhdGFGaWVsZEZvckFjdGlvbiIsImFubm90YXRpb25QYXRoIiwiZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsIm5vdCIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsImdldFJlbGF0aXZlTW9kZWxQYXRoRnVuY3Rpb24iLCJEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJEZWZhdWx0IiwiZ2V0SGlnaGxpZ2h0Um93QmluZGluZyIsImNyaXRpY2FsaXR5QW5ub3RhdGlvbiIsImlzRHJhZnRSb290IiwidGFyZ2V0RW50aXR5VHlwZSIsImRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uIiwiTWVzc2FnZVR5cGUiLCJnZXRNZXNzYWdlVHlwZUZyb21Dcml0aWNhbGl0eVR5cGUiLCJhTWlzc2luZ0tleXMiLCJmb3JtYXRSZXN1bHQiLCJFbnRpdHkiLCJIYXNBY3RpdmUiLCJJc0FjdGl2ZSIsInRhYmxlRm9ybWF0dGVycyIsInJvd0hpZ2hsaWdodGluZyIsIl9nZXRDcmVhdGlvbkJlaGF2aW91ciIsInRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uIiwibmF2aWdhdGlvbiIsImNyZWF0ZSIsImRldGFpbCIsIm9yaWdpbmFsVGFibGVTZXR0aW5ncyIsIm91dGJvdW5kIiwib3V0Ym91bmREZXRhaWwiLCJuZXdBY3Rpb24iLCJ0YXJnZXRBbm5vdGF0aW9ucyIsInRhcmdldEFubm90YXRpb25zQ29tbW9uIiwidGFyZ2V0QW5ub3RhdGlvbnNTZXNzaW9uIiwiU2Vzc2lvbiIsIkRyYWZ0Um9vdCIsIk5ld0FjdGlvbiIsIlN0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJjcmVhdGlvbk1vZGUiLCJDcmVhdGlvbk1vZGUiLCJDcmVhdGlvblJvdyIsIkVycm9yIiwicm91dGUiLCJhcHBlbmQiLCJjcmVhdGVBdEVuZCIsIm5hdmlnYXRlVG9UYXJnZXQiLCJOZXdQYWdlIiwiX2dldFJvd0NvbmZpZ3VyYXRpb25Qcm9wZXJ0eSIsInRhcmdldFBhdGgiLCJwcmVzc1Byb3BlcnR5IiwibmF2aWdhdGlvblRhcmdldCIsImNyaXRpY2FsaXR5UHJvcGVydHkiLCJkaXNwbGF5IiwidGFyZ2V0IiwiQ3JpdGljYWxpdHkiLCJNb2RlbEhlbHBlciIsImdldERyYWZ0Um9vdCIsImdldERyYWZ0Tm9kZSIsImlzU2luZ2xldG9uIiwicm93TmF2aWdhdGVkRXhwcmVzc2lvbiIsIm5hdmlnYXRlZFJvdyIsInByZXNzIiwicm93TmF2aWdhdGVkIiwiSXNJbmFjdGl2ZSIsImNvbHVtbnNUb0JlQ3JlYXRlZCIsIm5vblNvcnRhYmxlQ29sdW1ucyIsInRhYmxlVHlwZSIsInRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbiIsInByb3BlcnR5IiwiZXhpc3RzIiwidGFyZ2V0VHlwZSIsInJlbGF0ZWRQcm9wZXJ0aWVzSW5mbyIsImNvbGxlY3RSZWxhdGVkUHJvcGVydGllcyIsInJlbGF0ZWRQcm9wZXJ0eU5hbWVzIiwiYWRkaXRpb25hbFByb3BlcnR5TmFtZXMiLCJhZGRpdGlvbmFsUHJvcGVydGllcyIsInRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbiIsImNvbHVtbkluZm8iLCJnZXRDb2x1bW5EZWZpbml0aW9uRnJvbVByb3BlcnR5IiwiZ2V0QW5ub3RhdGlvbnNCeVRlcm0iLCJvQ29sdW1uRHJhZnRJbmRpY2F0b3IiLCJnZXREZWZhdWx0RHJhZnRJbmRpY2F0b3JGb3JDb2x1bW4iLCJleHBvcnRTZXR0aW5ncyIsInRlbXBsYXRlIiwiZXhwb3J0U2V0dGluZ3NUZW1wbGF0ZSIsIndyYXAiLCJleHBvcnRTZXR0aW5nc1dyYXBwaW5nIiwiX2dldEV4cG9ydERhdGFUeXBlIiwiZXhwb3J0VW5pdE5hbWUiLCJ1bml0UHJvcGVydHkiLCJleHBvcnRVbml0U3RyaW5nIiwiZXhwb3J0VGltZXpvbmVOYW1lIiwidGltZXpvbmVQcm9wZXJ0eSIsInV0YyIsImV4cG9ydFRpbWV6b25lU3RyaW5nIiwiYWRkaXRpb25hbFByb3BlcnR5SW5mb3MiLCJyZWxhdGVkQ29sdW1ucyIsIl9jcmVhdGVSZWxhdGVkQ29sdW1ucyIsImZ1bGxQcm9wZXJ0eVBhdGgiLCJ1c2VEYXRhRmllbGRQcmVmaXgiLCJhdmFpbGFibGVGb3JBZGFwdGF0aW9uIiwicmVwbGFjZVNwZWNpYWxDaGFycyIsInNlbWFudGljT2JqZWN0QW5ub3RhdGlvblBhdGgiLCJnZXRTZW1hbnRpY09iamVjdFBhdGgiLCJpc0hpZGRlbiIsImdyb3VwUGF0aCIsIl9zbGljZUF0U2xhc2giLCJpc0dyb3VwIiwiaXNEYXRhUG9pbnRGYWtlUHJvcGVydHkiLCJleHBvcnRUeXBlIiwic0RhdGVJbnB1dEZvcm1hdCIsImRhdGFUeXBlIiwiZ2V0RGF0YUZpZWxkRGF0YVR5cGUiLCJwcm9wZXJ0eVR5cGVDb25maWciLCJnZXRUeXBlQ29uZmlnIiwiaXNBUHJvcGVydHlGcm9tVGV4dE9ubHlBbm5vdGF0aW9uIiwic29ydGFibGUiLCJvVHlwZUNvbmZpZyIsImNsYXNzTmFtZSIsIm9Gb3JtYXRPcHRpb25zIiwib0NvbnN0cmFpbnRzIiwiY29uc3RyYWludHMiLCJnZXRUYXJnZXRWYWx1ZU9uRGF0YVBvaW50IiwiX2lzRXhwb3J0YWJsZUNvbHVtbiIsIm9Vbml0UHJvcGVydHkiLCJvVGltZXpvbmVQcm9wZXJ0eSIsInNVbml0VGV4dCIsInNUaW1lem9uZVRleHQiLCJpbnB1dEZvcm1hdCIsInNjYWxlIiwiZGVsaW1pdGVyIiwiY29sbGVjdGVkTmF2aWdhdGlvblByb3BlcnR5TGFiZWxzIiwiX2dldENvbGxlY3RlZE5hdmlnYXRpb25Qcm9wZXJ0eUxhYmVscyIsIkFubm90YXRpb24iLCJsYWJlbCIsImdldExhYmVsIiwiZ3JvdXBMYWJlbCIsImdyb3VwIiwic2VtYW50aWNPYmplY3RQYXRoIiwiQXZhaWxhYmlsaXR5VHlwZSIsIkFkYXB0YXRpb24iLCJEYXRhRmllbGREZWZhdWx0IiwiVGFyZ2V0IiwiJHRhcmdldCIsImlzR3JvdXBhYmxlIiwiaXNQcm9wZXJ0eUdyb3VwYWJsZSIsImlzS2V5IiwiY2FzZVNlbnNpdGl2ZSIsImlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZSIsInR5cGVDb25maWciLCJ2aXN1YWxTZXR0aW5ncyIsIndpZHRoQ2FsY3VsYXRpb24iLCJnZXRJbXBvcnRhbmNlIiwiYWRkaXRpb25hbExhYmVscyIsInNUb29sdGlwIiwiX2dldFRvb2x0aXAiLCJ0b29sdGlwIiwicHJvcGVydHlUeXBlIiwiZGF0YUZpZWxkRGVmYXVsdFByb3BlcnR5VHlwZSIsImlzUHJvcGVydHkiLCJDb3JlIiwiTWVkaWFUeXBlIiwidGVybSIsImlzVVJMIiwiX2lzVmFsaWRDb2x1bW4iLCJfZ2V0VmlzaWJsZUV4cHJlc3Npb24iLCJkYXRhRmllbGRNb2RlbFBhdGgiLCJwcm9wZXJ0eVZhbHVlIiwiaXNBbmFseXRpY2FsR3JvdXBIZWFkZXJFeHBhbmRlZCIsImlzQW5hbHl0aWNzIiwiSXNFeHBhbmRlZCIsImlzQW5hbHl0aWNhbExlYWYiLCJOb2RlTGV2ZWwiLCJfZ2V0RmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zIiwiZGF0YUZpZWxkR3JvdXAiLCJmaWVsZEZvcm1hdE9wdGlvbnMiLCJhRmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zIiwiRGF0YSIsImlubmVyRGF0YUZpZWxkIiwiaXNOYXZpZ2F0aW9uUHJvcGVydHkiLCJkYXRhRmllbGREZWZhdWx0IiwiTGFiZWwiLCJpc0RhdGFGaWVsZFR5cGVzIiwiUXVpY2tJbmZvIiwiZGF0YXBvaW50VGFyZ2V0IiwiZ2V0Um93U3RhdHVzVmlzaWJpbGl0eSIsImNvbE5hbWUiLCJpc1NlbWFudGljS2V5SW5GaWVsZEdyb3VwIiwiZ2V0RXJyb3JTdGF0dXNUZXh0VmlzaWJpbGl0eUZvcm1hdHRlciIsImV4aXN0aW5nQ29sdW1ucyIsInJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXAiLCJnZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoIiwicmVsYXRlZENvbHVtbiIsIm5ld05hbWUiLCJpc1BhcnRPZkxpbmVJdGVtIiwiaW5jbHVkZXMiLCJwcm9wZXJ0eUluZm8iLCJfZ2V0QW5ub3RhdGlvbkNvbHVtbk5hbWUiLCJfZ2V0U2hvd0RhdGFGaWVsZHNMYWJlbCIsImZpZWxkR3JvdXBOYW1lIiwib0NvbHVtbnMiLCJhQ29sdW1uS2V5cyIsInNob3dEYXRhRmllbGRzTGFiZWwiLCJfZ2V0UmVsYXRpdmVQYXRoIiwiaXNMYXN0U2xhc2giLCJpc0xhc3RQYXJ0IiwiaVNsYXNoSW5kZXgiLCJsYXN0SW5kZXhPZiIsIl9pc0NvbHVtblNvcnRhYmxlIiwicHJvcGVydHlQYXRoIiwiZmlsdGVyRnVuY3Rpb25zIiwiX2dldEZpbHRlckZ1bmN0aW9ucyIsImlzQXJyYXkiLCJDb252ZXJ0ZXJDb250ZXh0IiwiY2FwYWJpbGl0aWVzIiwiRmlsdGVyRnVuY3Rpb25zIiwiZ2V0RW50aXR5Q29udGFpbmVyIiwiX2dldERlZmF1bHRGb3JtYXRPcHRpb25zRm9yVGFibGUiLCJ0ZXh0TGluZXNFZGl0IiwiX2ZpbmRTZW1hbnRpY0tleVZhbHVlcyIsImFTZW1hbnRpY0tleVZhbHVlcyIsImJTZW1hbnRpY0tleUZvdW5kIiwiaSIsInZhbHVlcyIsInNlbWFudGljS2V5Rm91bmQiLCJfZmluZFByb3BlcnRpZXMiLCJzZW1hbnRpY0tleVZhbHVlcyIsImZpZWxkR3JvdXBQcm9wZXJ0aWVzIiwic2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cCIsInNQcm9wZXJ0eVBhdGgiLCJ0bXAiLCJmaWVsZEdyb3VwUHJvcGVydHlQYXRoIiwiX2ZpbmRTZW1hbnRpY0tleVZhbHVlc0luRmllbGRHcm91cCIsImFQcm9wZXJ0aWVzIiwiX3Byb3BlcnRpZXNGb3VuZCIsImlzRmllbGRHcm91cENvbHVtbiIsInNlbWFudGljS2V5Iiwic2VtYW50aWNLZXlJbkZpZWxkR3JvdXAiLCJmb3JtYXRPcHRpb25zT2JqIiwiaGFzRHJhZnRJbmRpY2F0b3IiLCJzZW1hbnRpY2tleXMiLCJvYmplY3RTdGF0dXNUZXh0VmlzaWJpbGl0eSIsImZpZWxkR3JvdXBEcmFmdEluZGljYXRvclByb3BlcnR5UGF0aCIsIl9nZXRJbXBOdW1iZXIiLCJJbXBvcnRhbmNlIiwiX2dldERhdGFGaWVsZEltcG9ydGFuY2UiLCJfZ2V0TWF4SW1wb3J0YW5jZSIsImZpZWxkcyIsIm1heEltcE51bWJlciIsImltcE51bWJlciIsIkRhdGFGaWVsZFdpdGhNYXhJbXBvcnRhbmNlIiwiZmllbGQiLCJmaWVsZHNXaXRoSW1wb3J0YW5jZSIsIm1hcFNlbWFudGljS2V5cyIsImZpZWxkR3JvdXBEYXRhIiwiZmllbGRHcm91cEhhc1NlbWFudGljS2V5IiwiZmllbGRHcm91cERhdGFGaWVsZCIsIkhpZ2giLCJmaWx0ZXIiLCJpdGVtIiwiZ2V0Tm9uU29ydGFibGVQcm9wZXJ0aWVzUmVzdHJpY3Rpb25zIiwibGluZUl0ZW0iLCJjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXNSZWN1cnNpdmVseSIsInJlbGF0ZWRQcm9wZXJ0aWVzIiwiaXNTdGF0aWNhbGx5SGlkZGVuIiwiaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4iLCJzTGFiZWwiLCJmaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMiLCJGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMiLCJpc0RhdGFGaWVsZEFsd2F5c0hpZGRlbiIsIkhUTUw1IiwiQ3NzRGVmYXVsdHMiLCJyZWxhdGVkUHJvcGVydHlOYW1lIiwiYWRkaXRpb25hbFByb3BlcnR5TmFtZSIsIl9nZXRQcm9wZXJ0eU5hbWVzIiwibWF0Y2hlZFByb3BlcnRpZXMiLCJyZXNvbHZlUGF0aCIsIl9hcHBlbmRDdXN0b21UZW1wbGF0ZSIsImludGVybmFsQ29sdW1ucyIsImlzQW5ub3RhdGlvbkNvbHVtbiIsImlzU2xvdENvbHVtbiIsIm1hbmlmZXN0Q29sdW1uIiwiU2xvdCIsImlzQ3VzdG9tQ29sdW1uIiwiX3VwZGF0ZUxpbmtlZFByb3BlcnRpZXNPbkN1c3RvbUNvbHVtbnMiLCJhbm5vdGF0aW9uVGFibGVDb2x1bW5zIiwicHJvcCIsInJlcGxhY2UiLCJ2YWxpZGF0ZUtleSIsImJhc2VUYWJsZUNvbHVtbiIsInBvc2l0aW9uIiwiYW5jaG9yIiwicGxhY2VtZW50IiwiUGxhY2VtZW50IiwiQWZ0ZXIiLCJwcm9wZXJ0aWVzVG9PdmVyd3JpdGVBbm5vdGF0aW9uQ29sdW1uIiwiaXNBY3Rpb25OYXZpZ2FibGUiLCJiYXNlTWFuaWZlc3RDb2x1bW4iLCJoZWFkZXIiLCJIb3Jpem9udGFsQWxpZ24iLCJCZWdpbiIsImlkIiwiY3VzdG9tVGFibGVDb2x1bW4iLCJtZXNzYWdlIiwiZ2V0RGlhZ25vc3RpY3MiLCJhZGRJc3N1ZSIsIklzc3VlQ2F0ZWdvcnkiLCJNYW5pZmVzdCIsIklzc3VlU2V2ZXJpdHkiLCJMb3ciLCJJc3N1ZUNhdGVnb3J5VHlwZSIsIkFubm90YXRpb25Db2x1bW5zIiwiSW52YWxpZEtleSIsImdldFAxM25Nb2RlIiwidmFyaWFudE1hbmFnZW1lbnQiLCJnZXRWYXJpYW50TWFuYWdlbWVudCIsImFQZXJzb25hbGl6YXRpb24iLCJpc0FuYWx5dGljYWxUYWJsZSIsImlzUmVzcG9uc2l2ZVRhYmxlIiwicGVyc29uYWxpemF0aW9uIiwic29ydCIsImFnZ3JlZ2F0ZSIsIkxpc3RSZXBvcnQiLCJWYXJpYW50TWFuYWdlbWVudFR5cGUiLCJDb250cm9sIiwiX2lzRmlsdGVyQmFySGlkZGVuIiwiaXNGaWx0ZXJCYXJIaWRkZW4iLCJoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zIiwiQW5hbHl0aWNhbExpc3RQYWdlIiwiZ2V0U29ydENvbmRpdGlvbnMiLCJub25Tb3J0YWJsZVByb3BlcnRpZXMiLCJzb3J0Q29uZGl0aW9ucyIsIlNvcnRPcmRlciIsInNvcnRlcnMiLCJjb25kaXRpb25zIiwiY29uZGl0aW9uIiwiY29uZGl0aW9uUHJvcGVydHkiLCJQcm9wZXJ0eSIsImluZm9OYW1lIiwiY29udmVydFByb3BlcnR5UGF0aHNUb0luZm9OYW1lcyIsImRlc2NlbmRpbmciLCJEZXNjZW5kaW5nIiwicGF0aHMiLCJpbmZvTmFtZXMiLCJjdXJyZW50UGF0aCIsIkdyb3VwQnkiLCJhR3JvdXBCeSIsImFHcm91cExldmVscyIsImdyb3VwTGV2ZWxzIiwiVG90YWwiLCJhVG90YWxzIiwidGl0bGUiLCJUeXBlTmFtZVBsdXJhbCIsInBhZ2VNYW5pZmVzdFNldHRpbmdzIiwiaGFzQWJzb2x1dGVQYXRoIiwicDEzbk1vZGUiLCJnZXRUYWJsZUlEIiwiY3JlYXRpb25CZWhhdmlvdXIiLCJzdGFuZGFyZEFjdGlvbnNDb250ZXh0IiwiZ2VuZXJhdGVTdGFuZGFyZEFjdGlvbnNDb250ZXh0IiwiZ2V0RGVsZXRlVmlzaWJpbGl0eSIsImNyZWF0ZUJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uIiwiZ2V0Q3JlYXRlVmlzaWJpbGl0eSIsIm1hc3NFZGl0QnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24iLCJnZXRNYXNzRWRpdFZpc2liaWxpdHkiLCJpc0luc2VydFVwZGF0ZVRlbXBsYXRlZCIsImdldEluc2VydFVwZGF0ZUFjdGlvbnNUZW1wbGF0aW5nIiwiaXNEcmFmdE9yU3RpY2t5U3VwcG9ydGVkIiwidGhyZXNob2xkIiwiTWF4SXRlbXMiLCJpc1NlYXJjaGFibGUiLCJpc1BhdGhTZWFyY2hhYmxlIiwic3RhbmRhcmRBY3Rpb25zIiwiZ2V0U3RhbmRhcmRBY3Rpb25DcmVhdGUiLCJnZXRTdGFuZGFyZEFjdGlvbkRlbGV0ZSIsInBhc3RlIiwiZ2V0U3RhbmRhcmRBY3Rpb25QYXN0ZSIsIm1hc3NFZGl0IiwiZ2V0U3RhbmRhcmRBY3Rpb25NYXNzRWRpdCIsImNyZWF0aW9uUm93IiwiZ2V0Q3JlYXRpb25Sb3ciLCJlbnRpdHlOYW1lIiwiY29sbGVjdGlvbiIsImdldFRhcmdldE9iamVjdFBhdGgiLCJuYXZpZ2F0aW9uUGF0aCIsInJvdyIsImlzSW5EaXNwbGF5TW9kZSIsImF1dG9CaW5kT25Jbml0Iiwic2VhcmNoYWJsZSIsImlzQ29tcGxleFByb3BlcnR5IiwiZXhwb3J0RGF0YVR5cGUiLCJzdWJzdHIiLCJnZXRTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbiIsInNlbGVjdGlvblZhcmlhbnRQYXRoIiwicmVzb2x2ZWRUYXJnZXQiLCJnZXRFbnRpdHlUeXBlQW5ub3RhdGlvbiIsInNlbGVjdGlvbiIsInByb3BlcnR5TmFtZXMiLCJTZWxlY3RPcHRpb25zIiwic2VsZWN0T3B0aW9uIiwiUHJvcGVydHlOYW1lIiwidGV4dCIsIl9nZXRGdWxsU2NyZWVuQmFzZWRPbkRldmljZSIsImlzSXBob25lIiwiZW5hYmxlRnVsbFNjcmVlbiIsIklzc3VlVHlwZSIsIkZVTExTQ1JFRU5NT0RFX05PVF9PTl9MSVNUUkVQT1JUIiwiX2dldE11bHRpU2VsZWN0TW9kZSIsIm11bHRpU2VsZWN0TW9kZSIsInNlbGVjdEFsbCIsInVzZUljb25UYWJCYXIiLCJfZ2V0VGFibGVUeXBlIiwiaXNEZXNrdG9wIiwiX2dldEdyaWRUYWJsZU1vZGUiLCJpc1RlbXBsYXRlTGlzdFJlcG9ydCIsInJvd0NvdW50TW9kZSIsInJvd0NvdW50IiwiX2dldENvbmRlbnNlZFRhYmxlTGF5b3V0IiwiX3RhYmxlVHlwZSIsIl90YWJsZVNldHRpbmdzIiwiY29uZGVuc2VkVGFibGVMYXlvdXQiLCJfZ2V0VGFibGVTZWxlY3Rpb25MaW1pdCIsInNlbGVjdGlvbkxpbWl0IiwiX2dldFRhYmxlSW5saW5lQ3JlYXRpb25Sb3dDb3VudCIsImlubGluZUNyZWF0aW9uUm93Q291bnQiLCJfZ2V0RmlsdGVycyIsInF1aWNrRmlsdGVyUGF0aHMiLCJxdWlja1NlbGVjdGlvblZhcmlhbnQiLCJxdWlja0ZpbHRlcnMiLCJzaG93Q291bnRzIiwicXVpY2tWYXJpYW50U2VsZWN0aW9uIiwiX2dldEVuYWJsZUV4cG9ydCIsImVuYWJsZVBhc3RlIiwiZW5hYmxlRXhwb3J0IiwiX2dldEZpbHRlckNvbmZpZ3VyYXRpb24iLCJmaWx0ZXJzIiwiaGlkZVRhYmxlVGl0bGUiLCJoZWFkZXJWaXNpYmxlIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJlbmhhbmNlRGF0YU1vZGVsUGF0aCIsIm5hdlByb3BlcnR5IiwiY2hlY2tDb25kZW5zZWRMYXlvdXQiLCJfbWFuaWZlc3RXcmFwcGVyIiwiZW5hYmxlQXV0b0NvbHVtbldpZHRoIiwiaXNQaG9uZSIsInRlbXBsYXRlVHlwZSIsImRhdGFTdGF0ZUluZGljYXRvckZpbHRlciIsImlzQ29uZGVuc2VkTGF5b3V0Q29tcGxpYW50Iiwib0ZpbHRlckNvbmZpZ3VyYXRpb24iLCJjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24iLCJncmlkVGFibGVSb3dNb2RlIiwib0NvbmZpZ3VyYXRpb24iLCJkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhIiwiZW5hYmxlTWFzc0VkaXQiLCJzaG93Um93Q291bnQiLCJnZXRWaWV3Q29uZmlndXJhdGlvbiIsInVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0IiwiaXNDb21wYWN0VHlwZSIsIm9UYXJnZXRNYXBwaW5nIiwiRURNX1RZUEVfTUFQUElORyIsInVuZGVybHlpbmdUeXBlIiwiJFNjYWxlIiwicHJlY2lzaW9uIiwiJFByZWNpc2lvbiIsIm1heExlbmd0aCIsIiRNYXhMZW5ndGgiLCJudWxsYWJsZSIsIiROdWxsYWJsZSIsIm1pbmltdW0iLCJpc05hTiIsIlZhbGlkYXRpb24iLCJNaW5pbXVtIiwibWF4aW11bSIsIk1heGltdW0iLCJpc0RpZ2l0U2VxdWVuY2UiLCJJc0RpZ2l0U2VxdWVuY2UiLCJwYXJzZUFzU3RyaW5nIiwiZW1wdHlTdHJpbmciLCJwYXJzZUtlZXBzRW1wdHlTdHJpbmciXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHtcblx0RW50aXR5VHlwZSxcblx0RW51bVZhbHVlLFxuXHROYXZpZ2F0aW9uUHJvcGVydHksXG5cdFBhdGhBbm5vdGF0aW9uRXhwcmVzc2lvbixcblx0UHJvcGVydHksXG5cdFByb3BlcnR5QW5ub3RhdGlvblZhbHVlLFxuXHRQcm9wZXJ0eVBhdGgsXG5cdFR5cGVEZWZpbml0aW9uXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBGaWx0ZXJGdW5jdGlvbnMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NhcGFiaWxpdGllc1wiO1xuaW1wb3J0IHsgRW50aXR5U2V0QW5ub3RhdGlvbnNfQ2FwYWJpbGl0aWVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9DYXBhYmlsaXRpZXNfRWRtXCI7XG5pbXBvcnQgdHlwZSB7IFNlbWFudGljS2V5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB7IENvbW1vbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ29tbW9uXCI7XG5pbXBvcnQgeyBFbnRpdHlTZXRBbm5vdGF0aW9uc19Db21tb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vbl9FZG1cIjtcbmltcG9ydCB7IEVudGl0eVNldEFubm90YXRpb25zX1Nlc3Npb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1Nlc3Npb25fRWRtXCI7XG5pbXBvcnQgdHlwZSB7XG5cdENyaXRpY2FsaXR5VHlwZSxcblx0RGF0YUZpZWxkLFxuXHREYXRhRmllbGRBYnN0cmFjdFR5cGVzLFxuXHREYXRhRmllbGRGb3JBY3Rpb24sXG5cdERhdGFGaWVsZEZvckFubm90YXRpb24sXG5cdERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0RGF0YUZpZWxkVHlwZXMsXG5cdERhdGFQb2ludCxcblx0RGF0YVBvaW50VHlwZVR5cGVzLFxuXHRGaWVsZEdyb3VwVHlwZSxcblx0TGluZUl0ZW0sXG5cdFByZXNlbnRhdGlvblZhcmlhbnRUeXBlLFxuXHRTZWxlY3Rpb25WYXJpYW50VHlwZSxcblx0U2VsZWN0T3B0aW9uVHlwZVxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgeyBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB0eXBlIHsgQ29tcGxleFByb3BlcnR5SW5mbyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2Fubm90YXRpb25zL0RhdGFGaWVsZFwiO1xuaW1wb3J0IHtcblx0Y29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzLFxuXHRjb2xsZWN0UmVsYXRlZFByb3BlcnRpZXNSZWN1cnNpdmVseSxcblx0Z2V0RGF0YUZpZWxkRGF0YVR5cGUsXG5cdGdldFNlbWFudGljT2JqZWN0UGF0aCxcblx0aXNEYXRhRmllbGRBbHdheXNIaWRkZW4sXG5cdGlzRGF0YUZpZWxkRm9yQWN0aW9uQWJzdHJhY3QsXG5cdGlzRGF0YUZpZWxkVHlwZXNcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvYW5ub3RhdGlvbnMvRGF0YUZpZWxkXCI7XG5pbXBvcnQgdHlwZSB7IEFubm90YXRpb25BY3Rpb24sIEJhc2VBY3Rpb24sIENvbWJpbmVkQWN0aW9uLCBDdXN0b21BY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0LCBpc0FjdGlvbk5hdmlnYWJsZSwgcmVtb3ZlRHVwbGljYXRlQWN0aW9ucyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7IEVudGl0eSwgVUkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgQ29uZmlndXJhYmxlT2JqZWN0LCBDdXN0b21FbGVtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGluc2VydEN1c3RvbUVsZW1lbnRzLCBQbGFjZW1lbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgSXNzdWVDYXRlZ29yeSwgSXNzdWVDYXRlZ29yeVR5cGUsIElzc3VlU2V2ZXJpdHksIElzc3VlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHRhYmxlRm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9UYWJsZUZvcm1hdHRlclwiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvZm9ybWF0dGVycy9UYWJsZUZvcm1hdHRlclR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHtcblx0YW5kLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uc3RhbnQsXG5cdGVxdWFsLFxuXHRmb3JtYXRSZXN1bHQsXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRpc0NvbnN0YW50LFxuXHRub3QsXG5cdG9yLFxuXHRwYXRoSW5Nb2RlbCxcblx0cmVzb2x2ZUJpbmRpbmdTdHJpbmdcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgcmVwbGFjZVNwZWNpYWxDaGFycyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQge1xuXHREYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRlbmhhbmNlRGF0YU1vZGVsUGF0aCxcblx0Z2V0VGFyZ2V0T2JqZWN0UGF0aCxcblx0aXNQYXRoRGVsZXRhYmxlLFxuXHRpc1BhdGhTZWFyY2hhYmxlLFxuXHRpc1BhdGhVcGRhdGFibGVcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBEaXNwbGF5TW9kZSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0Rpc3BsYXlNb2RlRm9ybWF0dGVyXCI7XG5pbXBvcnQgeyBFRE1fVFlQRV9NQVBQSU5HLCBnZXREaXNwbGF5TW9kZSB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0Rpc3BsYXlNb2RlRm9ybWF0dGVyXCI7XG5pbXBvcnQgeyBnZXROb25Tb3J0YWJsZVByb3BlcnRpZXNSZXN0cmljdGlvbnMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9FbnRpdHlTZXRIZWxwZXJcIjtcbmltcG9ydCB7XG5cdGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5LFxuXHRnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eSxcblx0Z2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eSxcblx0Z2V0VGFyZ2V0VmFsdWVPbkRhdGFQb2ludCxcblx0aXNOYXZpZ2F0aW9uUHJvcGVydHksXG5cdGlzUGF0aEV4cHJlc3Npb24sXG5cdGlzUHJvcGVydHlcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCBBY3Rpb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvaGVscGVycy9BY3Rpb25IZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcIi4uLy4uL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IEFnZ3JlZ2F0aW9uSGVscGVyIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB7IGlzUmVmZXJlbmNlUHJvcGVydHlTdGF0aWNhbGx5SGlkZGVuIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvRGF0YUZpZWxkSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRUYWJsZUlEIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvSURcIjtcbmltcG9ydCB0eXBlIHtcblx0Q3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uLFxuXHRDdXN0b21EZWZpbmVkVGFibGVDb2x1bW5Gb3JPdmVycmlkZSxcblx0Rm9ybWF0T3B0aW9uc1R5cGUsXG5cdE5hdmlnYXRpb25TZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdE5hdmlnYXRpb25UYXJnZXRDb25maWd1cmF0aW9uLFxuXHRUYWJsZUNvbHVtblNldHRpbmdzLFxuXHRUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbixcblx0VGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0Vmlld1BhdGhDb25maWd1cmF0aW9uXG59IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQge1xuXHRBY3Rpb25UeXBlLFxuXHRBdmFpbGFiaWxpdHlUeXBlLFxuXHRDcmVhdGlvbk1vZGUsXG5cdEhvcml6b250YWxBbGlnbixcblx0SW1wb3J0YW5jZSxcblx0U2VsZWN0aW9uTW9kZSxcblx0VGVtcGxhdGVUeXBlLFxuXHRWYXJpYW50TWFuYWdlbWVudFR5cGUsXG5cdFZpc3VhbGl6YXRpb25UeXBlXG59IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgdHlwZSBNYW5pZmVzdFdyYXBwZXIgZnJvbSBcIi4uLy4uL01hbmlmZXN0V3JhcHBlclwiO1xuaW1wb3J0IHsgZ2V0TWVzc2FnZVR5cGVGcm9tQ3JpdGljYWxpdHlUeXBlIH0gZnJvbSBcIi4vQ3JpdGljYWxpdHlcIjtcbmltcG9ydCB0eXBlIHsgU3RhbmRhcmRBY3Rpb25Db25maWdUeXBlIH0gZnJvbSBcIi4vdGFibGUvU3RhbmRhcmRBY3Rpb25zXCI7XG5pbXBvcnQge1xuXHRnZW5lcmF0ZVN0YW5kYXJkQWN0aW9uc0NvbnRleHQsXG5cdGdldENyZWF0ZVZpc2liaWxpdHksXG5cdGdldENyZWF0aW9uUm93LFxuXHRnZXREZWxldGVWaXNpYmlsaXR5LFxuXHRnZXRJbnNlcnRVcGRhdGVBY3Rpb25zVGVtcGxhdGluZyxcblx0Z2V0TWFzc0VkaXRWaXNpYmlsaXR5LFxuXHRnZXRSZXN0cmljdGlvbnMsXG5cdGdldFN0YW5kYXJkQWN0aW9uQ3JlYXRlLFxuXHRnZXRTdGFuZGFyZEFjdGlvbkRlbGV0ZSxcblx0Z2V0U3RhbmRhcmRBY3Rpb25NYXNzRWRpdCxcblx0Z2V0U3RhbmRhcmRBY3Rpb25QYXN0ZSxcblx0aXNEcmFmdE9yU3RpY2t5U3VwcG9ydGVkLFxuXHRpc0luRGlzcGxheU1vZGVcbn0gZnJvbSBcIi4vdGFibGUvU3RhbmRhcmRBY3Rpb25zXCI7XG5cbmV4cG9ydCB0eXBlIFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb24gPSB7XG5cdGF1dG9CaW5kT25Jbml0OiBib29sZWFuO1xuXHRjb2xsZWN0aW9uOiBzdHJpbmc7XG5cdHZhcmlhbnRNYW5hZ2VtZW50OiBWYXJpYW50TWFuYWdlbWVudFR5cGU7XG5cdGZpbHRlcklkPzogc3RyaW5nO1xuXHRpZDogc3RyaW5nO1xuXHRuYXZpZ2F0aW9uUGF0aDogc3RyaW5nO1xuXHRwMTNuTW9kZT86IHN0cmluZztcblx0cm93Pzoge1xuXHRcdGFjdGlvbj86IHN0cmluZztcblx0XHRwcmVzcz86IHN0cmluZztcblx0XHRyb3dIaWdobGlnaHRpbmc6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRcdHJvd05hdmlnYXRlZDogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdFx0dmlzaWJsZT86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHR9O1xuXHRzZWxlY3Rpb25Nb2RlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdHN0YW5kYXJkQWN0aW9uczoge1xuXHRcdGFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIFN0YW5kYXJkQWN0aW9uQ29uZmlnVHlwZT47XG5cdFx0aXNJbnNlcnRVcGRhdGVUZW1wbGF0ZWQ6IGJvb2xlYW47XG5cdFx0dXBkYXRhYmxlUHJvcGVydHlQYXRoOiBzdHJpbmc7XG5cdH07XG5cdGRpc3BsYXlNb2RlPzogYm9vbGVhbjtcblx0dGhyZXNob2xkOiBudW1iZXI7XG5cdGVudGl0eU5hbWU6IHN0cmluZztcblx0c29ydENvbmRpdGlvbnM/OiBzdHJpbmc7XG5cdGdyb3VwQ29uZGl0aW9ucz86IHN0cmluZztcblx0YWdncmVnYXRlQ29uZGl0aW9ucz86IHN0cmluZztcblxuXHQvKiogQ3JlYXRlIG5ldyBlbnRyaWVzICovXG5cdGNyZWF0ZTogQ3JlYXRlQmVoYXZpb3IgfCBDcmVhdGVCZWhhdmlvckV4dGVybmFsO1xuXHR0aXRsZTogc3RyaW5nO1xuXHRzZWFyY2hhYmxlOiBib29sZWFuO1xufTtcblxuLyoqXG4gKiBOZXcgZW50cmllcyBhcmUgY3JlYXRlZCB3aXRoaW4gdGhlIGFwcCAoZGVmYXVsdCBjYXNlKVxuICovXG50eXBlIENyZWF0ZUJlaGF2aW9yID0ge1xuXHRtb2RlOiBDcmVhdGlvbk1vZGU7XG5cdGFwcGVuZDogYm9vbGVhbjtcblx0bmV3QWN0aW9uPzogc3RyaW5nO1xuXHRuYXZpZ2F0ZVRvVGFyZ2V0Pzogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBOZXcgZW50cmllcyBhcmUgY3JlYXRlZCBieSBuYXZpZ2F0aW5nIHRvIHNvbWUgdGFyZ2V0XG4gKi9cbnR5cGUgQ3JlYXRlQmVoYXZpb3JFeHRlcm5hbCA9IHtcblx0bW9kZTogXCJFeHRlcm5hbFwiO1xuXHRvdXRib3VuZDogc3RyaW5nO1xuXHRvdXRib3VuZERldGFpbDogTmF2aWdhdGlvblRhcmdldENvbmZpZ3VyYXRpb25bXCJvdXRib3VuZERldGFpbFwiXTtcblx0bmF2aWdhdGlvblNldHRpbmdzOiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uO1xufTtcblxuZXhwb3J0IHR5cGUgVGFibGVDYXBhYmlsaXR5UmVzdHJpY3Rpb24gPSB7XG5cdGlzRGVsZXRhYmxlOiBib29sZWFuO1xuXHRpc1VwZGF0YWJsZTogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFRhYmxlRmlsdGVyc0NvbmZpZ3VyYXRpb24gPSB7XG5cdGVuYWJsZWQ/OiBzdHJpbmcgfCBib29sZWFuO1xuXHRwYXRoczogW1xuXHRcdHtcblx0XHRcdGFubm90YXRpb25QYXRoOiBzdHJpbmc7XG5cdFx0fVxuXHRdO1xuXHRzaG93Q291bnRzPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uID0ge1xuXHRwcm9wZXJ0eU5hbWVzOiBzdHJpbmdbXTtcblx0dGV4dD86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24gPSB7XG5cdGNyZWF0ZUF0RW5kOiBib29sZWFuO1xuXHRjcmVhdGlvbk1vZGU6IENyZWF0aW9uTW9kZTtcblx0ZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YTogYm9vbGVhbjtcblx0Y3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdHVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0OiBib29sZWFuO1xuXHRlbmFibGVFeHBvcnQ6IGJvb2xlYW47XG5cdGhlYWRlclZpc2libGU6IGJvb2xlYW47XG5cdGZpbHRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBUYWJsZUZpbHRlcnNDb25maWd1cmF0aW9uPjtcblx0dHlwZTogVGFibGVUeXBlO1xuXHRyb3dDb3VudE1vZGU6IEdyaWRUYWJsZVJvd0NvdW50TW9kZTtcblx0cm93Q291bnQ6IG51bWJlcjtcblx0c2VsZWN0QWxsPzogYm9vbGVhbjtcblx0c2VsZWN0aW9uTGltaXQ6IG51bWJlcjtcblx0bXVsdGlTZWxlY3RNb2RlOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdGVuYWJsZVBhc3RlOiBib29sZWFuO1xuXHRlbmFibGVGdWxsU2NyZWVuOiBib29sZWFuO1xuXHRzaG93Um93Q291bnQ6IGJvb2xlYW47XG5cdGlubGluZUNyZWF0aW9uUm93Q291bnQ/OiBudW1iZXI7XG5cdGVuYWJsZU1hc3NFZGl0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXHRlbmFibGVBdXRvQ29sdW1uV2lkdGg6IGJvb2xlYW47XG5cdGRhdGFTdGF0ZUluZGljYXRvckZpbHRlcjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRpc0NvbXBhY3RUeXBlPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFRhYmxlVHlwZSA9IFwiR3JpZFRhYmxlXCIgfCBcIlJlc3BvbnNpdmVUYWJsZVwiIHwgXCJBbmFseXRpY2FsVGFibGVcIjtcbmV4cG9ydCB0eXBlIEdyaWRUYWJsZVJvd0NvdW50TW9kZSA9IFwiQXV0b1wiIHwgXCJGaXhlZFwiO1xuXG5lbnVtIENvbHVtblR5cGUge1xuXHREZWZhdWx0ID0gXCJEZWZhdWx0XCIsIC8vIERlZmF1bHQgVHlwZSAoQ3VzdG9tIENvbHVtbilcblx0QW5ub3RhdGlvbiA9IFwiQW5ub3RhdGlvblwiLFxuXHRTbG90ID0gXCJTbG90XCJcbn1cblxuLy8gQ3VzdG9tIENvbHVtbiBmcm9tIE1hbmlmZXN0XG5leHBvcnQgdHlwZSBNYW5pZmVzdERlZmluZWRDdXN0b21Db2x1bW4gPSBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW4gJiB7XG5cdHR5cGU/OiBDb2x1bW5UeXBlLkRlZmF1bHQ7XG59O1xuXG4vLyBTbG90IENvbHVtbiBmcm9tIEJ1aWxkaW5nIEJsb2NrXG5leHBvcnQgdHlwZSBGcmFnbWVudERlZmluZWRTbG90Q29sdW1uID0gQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uICYge1xuXHR0eXBlOiBDb2x1bW5UeXBlLlNsb3Q7XG59O1xuXG4vLyBQcm9wZXJ0aWVzIGFsbCBDb2x1bW5UeXBlcyBoYXZlOlxuZXhwb3J0IHR5cGUgQmFzZVRhYmxlQ29sdW1uID0gQ29uZmlndXJhYmxlT2JqZWN0ICYge1xuXHR0eXBlOiBDb2x1bW5UeXBlOyAvL09yaWdpbiBvZiB0aGUgc291cmNlIHdoZXJlIHdlIGFyZSBnZXR0aW5nIHRoZSB0ZW1wbGF0ZWQgaW5mb3JtYXRpb24gZnJvbVxuXHR3aWR0aD86IHN0cmluZztcblx0aW1wb3J0YW5jZT86IEltcG9ydGFuY2U7XG5cdGhvcml6b250YWxBbGlnbj86IEhvcml6b250YWxBbGlnbjtcblx0YXZhaWxhYmlsaXR5PzogQXZhaWxhYmlsaXR5VHlwZTtcblx0aXNOYXZpZ2FibGU/OiBib29sZWFuO1xuXHRjYXNlU2Vuc2l0aXZlOiBib29sZWFuO1xufTtcblxuLy8gUHJvcGVydGllcyBvbiBDdXN0b20gQ29sdW1ucyBhbmQgU2xvdCBDb2x1bW5zXG5leHBvcnQgdHlwZSBDdXN0b21CYXNlZFRhYmxlQ29sdW1uID0gQmFzZVRhYmxlQ29sdW1uICYge1xuXHRpZDogc3RyaW5nO1xuXHRuYW1lOiBzdHJpbmc7XG5cdGhlYWRlcj86IHN0cmluZztcblx0dGVtcGxhdGU6IHN0cmluZztcblx0cHJvcGVydHlJbmZvcz86IHN0cmluZ1tdO1xuXHRleHBvcnRTZXR0aW5ncz86IHtcblx0XHR0ZW1wbGF0ZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdHdyYXA6IGJvb2xlYW47XG5cdH0gfCBudWxsO1xuXHRmb3JtYXRPcHRpb25zOiB7IHRleHRMaW5lc0VkaXQ6IG51bWJlciB9O1xuXHRpc0dyb3VwYWJsZTogYm9vbGVhbjtcblx0aXNOYXZpZ2FibGU6IGJvb2xlYW47XG5cdHNvcnRhYmxlOiBib29sZWFuO1xuXHR2aXN1YWxTZXR0aW5nczogeyB3aWR0aENhbGN1bGF0aW9uOiBudWxsIH07XG59O1xuXG4vLyBQcm9wZXJ0aWVzIGRlcml2ZWQgZnJvbSBNYW5pZmVzdCB0byBvdmVycmlkZSBBbm5vdGF0aW9uIGNvbmZpZ3VyYXRpb25zXG5leHBvcnQgdHlwZSBBbm5vdGF0aW9uVGFibGVDb2x1bW5Gb3JPdmVycmlkZSA9IEJhc2VUYWJsZUNvbHVtbiAmIHtcblx0c2V0dGluZ3M/OiBUYWJsZUNvbHVtblNldHRpbmdzO1xuXHRmb3JtYXRPcHRpb25zPzogRm9ybWF0T3B0aW9uc1R5cGU7XG59O1xuXG4vLyBQcm9wZXJ0aWVzIGZvciBBbm5vdGF0aW9uIENvbHVtbnNcbmV4cG9ydCB0eXBlIEFubm90YXRpb25UYWJsZUNvbHVtbiA9IEFubm90YXRpb25UYWJsZUNvbHVtbkZvck92ZXJyaWRlICYge1xuXHRuYW1lOiBzdHJpbmc7XG5cdHByb3BlcnR5SW5mb3M/OiBzdHJpbmdbXTtcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcblx0cmVsYXRpdmVQYXRoOiBzdHJpbmc7XG5cdGxhYmVsPzogc3RyaW5nO1xuXHR0b29sdGlwPzogc3RyaW5nO1xuXHRncm91cExhYmVsPzogc3RyaW5nO1xuXHRncm91cD86IHN0cmluZztcblx0RmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdHNob3dEYXRhRmllbGRzTGFiZWw/OiBib29sZWFuO1xuXHRpc0tleT86IGJvb2xlYW47XG5cdGlzR3JvdXBhYmxlOiBib29sZWFuO1xuXHR1bml0Pzogc3RyaW5nO1xuXHR1bml0VGV4dD86IHN0cmluZztcblx0dGltZXpvbmVUZXh0Pzogc3RyaW5nO1xuXHR0aW1lem9uZT86IHN0cmluZztcblx0c2VtYW50aWNPYmplY3RQYXRoPzogc3RyaW5nO1xuXHRzb3J0YWJsZTogYm9vbGVhbjtcblx0ZXhwb3J0U2V0dGluZ3M/OiBDb2x1bW5FeHBvcnRTZXR0aW5ncyB8IG51bGw7XG5cdGlzRGF0YVBvaW50RmFrZVRhcmdldFByb3BlcnR5PzogYm9vbGVhbjtcblx0dGV4dEFycmFuZ2VtZW50Pzoge1xuXHRcdHRleHRQcm9wZXJ0eTogc3RyaW5nO1xuXHRcdG1vZGU6IERpc3BsYXlNb2RlO1xuXHR9O1xuXHRhZGRpdGlvbmFsUHJvcGVydHlJbmZvcz86IHN0cmluZ1tdO1xuXHR2aXN1YWxTZXR0aW5ncz86IFZpc3VhbFNldHRpbmdzO1xuXHR0eXBlQ29uZmlnPzogb2JqZWN0O1xuXHRpc1BhcnRPZkxpbmVJdGVtPzogYm9vbGVhbjsgLy8gdGVtcG9yYXJ5IGluZGljYXRvciB0byBvbmx5IGFsbG93IGZpbHRlcmluZyBvbiBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgd2hlbiB0aGV5J3JlIHBhcnQgb2YgYSBsaW5lIGl0ZW1cblx0YWRkaXRpb25hbExhYmVscz86IHN0cmluZ1tdO1xufTtcblxuZXhwb3J0IHR5cGUgQ29sdW1uRXhwb3J0U2V0dGluZ3MgPSBQYXJ0aWFsPHtcblx0dGVtcGxhdGU6IHN0cmluZztcblx0bGFiZWw6IHN0cmluZztcblx0d3JhcDogYm9vbGVhbjtcblx0dHlwZTogc3RyaW5nO1xuXHRpbnB1dEZvcm1hdDogc3RyaW5nO1xuXHRmb3JtYXQ6IHN0cmluZztcblx0c2NhbGU6IG51bWJlcjtcblx0ZGVsaW1pdGVyOiBib29sZWFuO1xuXHR1bml0OiBzdHJpbmc7XG5cdHVuaXRQcm9wZXJ0eTogc3RyaW5nO1xuXHR0aW1lem9uZTogc3RyaW5nO1xuXHR0aW1lem9uZVByb3BlcnR5OiBzdHJpbmc7XG5cdHV0YzogYm9vbGVhbjtcbn0+O1xuXG5leHBvcnQgdHlwZSBWaXN1YWxTZXR0aW5ncyA9IHtcblx0d2lkdGhDYWxjdWxhdGlvbj86IFdpZHRoQ2FsY3VsYXRpb247XG59O1xuXG5leHBvcnQgdHlwZSBXaWR0aENhbGN1bGF0aW9uID0gbnVsbCB8IHtcblx0bWluV2lkdGg/OiBudW1iZXI7XG5cdG1heFdpZHRoPzogbnVtYmVyO1xuXHRkZWZhdWx0V2lkdGg/OiBudW1iZXI7XG5cdGluY2x1ZGVMYWJlbD86IGJvb2xlYW47XG5cdGdhcD86IG51bWJlcjtcblx0Ly8gb25seSByZWxldmFudCBmb3IgY29tcGxleCB0eXBlc1xuXHRleGNsdWRlUHJvcGVydGllcz86IHN0cmluZ1tdO1xuXHR2ZXJ0aWNhbEFycmFuZ2VtZW50PzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIFRhYmxlQ29sdW1uID0gQ3VzdG9tQmFzZWRUYWJsZUNvbHVtbiB8IEFubm90YXRpb25UYWJsZUNvbHVtbjtcbmV4cG9ydCB0eXBlIE1hbmlmZXN0Q29sdW1uID0gQ3VzdG9tRWxlbWVudDxDdXN0b21CYXNlZFRhYmxlQ29sdW1uIHwgQW5ub3RhdGlvblRhYmxlQ29sdW1uRm9yT3ZlcnJpZGU+O1xuXG5leHBvcnQgdHlwZSBBZ2dyZWdhdGVEYXRhID0ge1xuXHRkZWZhdWx0QWdncmVnYXRlOiB7XG5cdFx0Y29udGV4dERlZmluaW5nUHJvcGVydGllcz86IHN0cmluZ1tdO1xuXHR9O1xuXHRyZWxhdGl2ZVBhdGg6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFRhYmxlVmlzdWFsaXphdGlvbiA9IHtcblx0dHlwZTogVmlzdWFsaXphdGlvblR5cGUuVGFibGU7XG5cdGFubm90YXRpb246IFRhYmxlQW5ub3RhdGlvbkNvbmZpZ3VyYXRpb247XG5cdGNvbnRyb2w6IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb247XG5cdGNvbHVtbnM6IFRhYmxlQ29sdW1uW107XG5cdGFjdGlvbnM6IEJhc2VBY3Rpb25bXTtcblx0Y29tbWFuZEFjdGlvbnM/OiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+O1xuXHRhZ2dyZWdhdGVzPzogUmVjb3JkPHN0cmluZywgQWdncmVnYXRlRGF0YT47XG5cdGVuYWJsZUFuYWx5dGljcz86IGJvb2xlYW47XG5cdGVuYWJsZUFuYWx5dGljc1NlYXJjaD86IGJvb2xlYW47XG5cdG9wZXJhdGlvbkF2YWlsYWJsZU1hcDogc3RyaW5nO1xuXHRvcGVyYXRpb25BdmFpbGFibGVQcm9wZXJ0aWVzOiBzdHJpbmc7XG5cdGhlYWRlckluZm9UaXRsZTogc3RyaW5nO1xuXHRzZW1hbnRpY0tleXM6IHN0cmluZ1tdO1xuXHRoZWFkZXJJbmZvVHlwZU5hbWU6IFByb3BlcnR5QW5ub3RhdGlvblZhbHVlPFN0cmluZz4gfCB1bmRlZmluZWQ7XG59O1xuXG50eXBlIFNvcnRlclR5cGUgPSB7XG5cdG5hbWU6IHN0cmluZztcblx0ZGVzY2VuZGluZzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgYW5ub3RhdGlvbi1iYXNlZCBhbmQgbWFuaWZlc3QtYmFzZWQgdGFibGUgYWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gbmF2aWdhdGlvblNldHRpbmdzXG4gKiBAcmV0dXJucyBUaGUgY29tcGxldGUgdGFibGUgYWN0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVBY3Rpb25zKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRuYXZpZ2F0aW9uU2V0dGluZ3M/OiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uXG4pOiBDb21iaW5lZEFjdGlvbiB7XG5cdGNvbnN0IGFUYWJsZUFjdGlvbnMgPSBnZXRUYWJsZUFubm90YXRpb25BY3Rpb25zKGxpbmVJdGVtQW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBhQW5ub3RhdGlvbkFjdGlvbnMgPSBhVGFibGVBY3Rpb25zLnRhYmxlQWN0aW9ucztcblx0Y29uc3QgYUhpZGRlbkFjdGlvbnMgPSBhVGFibGVBY3Rpb25zLmhpZGRlblRhYmxlQWN0aW9ucztcblx0Y29uc3QgbWFuaWZlc3RBY3Rpb25zID0gZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpLmFjdGlvbnMsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRhQW5ub3RhdGlvbkFjdGlvbnMsXG5cdFx0bmF2aWdhdGlvblNldHRpbmdzLFxuXHRcdHRydWUsXG5cdFx0YUhpZGRlbkFjdGlvbnNcblx0KTtcblx0Y29uc3QgYWN0aW9ucyA9IGluc2VydEN1c3RvbUVsZW1lbnRzKGFBbm5vdGF0aW9uQWN0aW9ucywgbWFuaWZlc3RBY3Rpb25zLmFjdGlvbnMsIHtcblx0XHRpc05hdmlnYWJsZTogXCJvdmVyd3JpdGVcIixcblx0XHRlbmFibGVPblNlbGVjdDogXCJvdmVyd3JpdGVcIixcblx0XHRlbmFibGVBdXRvU2Nyb2xsOiBcIm92ZXJ3cml0ZVwiLFxuXHRcdGVuYWJsZWQ6IFwib3ZlcndyaXRlXCIsXG5cdFx0dmlzaWJsZTogXCJvdmVyd3JpdGVcIixcblx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246IFwib3ZlcndyaXRlXCIsXG5cdFx0Y29tbWFuZDogXCJvdmVyd3JpdGVcIlxuXHR9KTtcblxuXHRyZXR1cm4ge1xuXHRcdFwiYWN0aW9uc1wiOiBhY3Rpb25zLFxuXHRcdFwiY29tbWFuZEFjdGlvbnNcIjogbWFuaWZlc3RBY3Rpb25zLmNvbW1hbmRBY3Rpb25zXG5cdH07XG59XG5cbi8qKlxuICogUmV0dXJucyBhbiBhcnJheSBvZiBhbGwgY29sdW1ucywgYW5ub3RhdGlvbi1iYXNlZCBhcyB3ZWxsIGFzIG1hbmlmZXN0IGJhc2VkLlxuICogVGhleSBhcmUgc29ydGVkIGFuZCBzb21lIHByb3BlcnRpZXMgY2FuIGJlIG92ZXJ3cml0dGVuIHZpYSB0aGUgbWFuaWZlc3QgKGNoZWNrIG91dCB0aGUga2V5cyB0aGF0IGNhbiBiZSBvdmVyd3JpdHRlbikuXG4gKlxuICogQHBhcmFtIGxpbmVJdGVtQW5ub3RhdGlvbiBDb2xsZWN0aW9uIG9mIGRhdGEgZmllbGRzIGZvciByZXByZXNlbnRhdGlvbiBpbiBhIHRhYmxlIG9yIGxpc3RcbiAqIEBwYXJhbSB2aXN1YWxpemF0aW9uUGF0aFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBuYXZpZ2F0aW9uU2V0dGluZ3NcbiAqIEByZXR1cm5zIFJldHVybnMgYWxsIHRhYmxlIGNvbHVtbnMgdGhhdCBzaG91bGQgYmUgYXZhaWxhYmxlLCByZWdhcmRsZXNzIG9mIHRlbXBsYXRpbmcgb3IgcGVyc29uYWxpemF0aW9uIG9yIHRoZWlyIG9yaWdpblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVDb2x1bW5zKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRuYXZpZ2F0aW9uU2V0dGluZ3M/OiBOYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uXG4pOiBUYWJsZUNvbHVtbltdIHtcblx0Y29uc3QgYW5ub3RhdGlvbkNvbHVtbnMgPSBnZXRDb2x1bW5zRnJvbUFubm90YXRpb25zKGxpbmVJdGVtQW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBtYW5pZmVzdENvbHVtbnMgPSBnZXRDb2x1bW5zRnJvbU1hbmlmZXN0KFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCkuY29sdW1ucyxcblx0XHRhbm5vdGF0aW9uQ29sdW1ucyxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUobGluZUl0ZW1Bbm5vdGF0aW9uKSxcblx0XHRuYXZpZ2F0aW9uU2V0dGluZ3Ncblx0KTtcblxuXHRyZXR1cm4gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoYW5ub3RhdGlvbkNvbHVtbnMgYXMgVGFibGVDb2x1bW5bXSwgbWFuaWZlc3RDb2x1bW5zIGFzIFJlY29yZDxzdHJpbmcsIEN1c3RvbUVsZW1lbnQ8VGFibGVDb2x1bW4+Piwge1xuXHRcdHdpZHRoOiBcIm92ZXJ3cml0ZVwiLFxuXHRcdGltcG9ydGFuY2U6IFwib3ZlcndyaXRlXCIsXG5cdFx0aG9yaXpvbnRhbEFsaWduOiBcIm92ZXJ3cml0ZVwiLFxuXHRcdGF2YWlsYWJpbGl0eTogXCJvdmVyd3JpdGVcIixcblx0XHRpc05hdmlnYWJsZTogXCJvdmVyd3JpdGVcIixcblx0XHRzZXR0aW5nczogXCJvdmVyd3JpdGVcIixcblx0XHRmb3JtYXRPcHRpb25zOiBcIm92ZXJ3cml0ZVwiXG5cdH0pO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHRoZSBjdXN0b20gYWdncmVnYXRpb24gZGVmaW5pdGlvbnMgZnJvbSB0aGUgZW50aXR5VHlwZS5cbiAqXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgdGFyZ2V0IGVudGl0eSB0eXBlLlxuICogQHBhcmFtIHRhYmxlQ29sdW1ucyBUaGUgYXJyYXkgb2YgY29sdW1ucyBmb3IgdGhlIGVudGl0eSB0eXBlLlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0LlxuICogQHJldHVybnMgVGhlIGFnZ3JlZ2F0ZSBkZWZpbml0aW9ucyBmcm9tIHRoZSBlbnRpdHlUeXBlLCBvciB1bmRlZmluZWQgaWYgdGhlIGVudGl0eSBkb2Vzbid0IHN1cHBvcnQgYW5hbHl0aWNhbCBxdWVyaWVzLlxuICovXG5leHBvcnQgY29uc3QgZ2V0QWdncmVnYXRlRGVmaW5pdGlvbnNGcm9tRW50aXR5VHlwZSA9IGZ1bmN0aW9uIChcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0dGFibGVDb2x1bW5zOiBUYWJsZUNvbHVtbltdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBSZWNvcmQ8c3RyaW5nLCBBZ2dyZWdhdGVEYXRhPiB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdGZ1bmN0aW9uIGZpbmRDb2x1bW5Gcm9tUGF0aChwYXRoOiBzdHJpbmcpOiBUYWJsZUNvbHVtbiB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRhYmxlQ29sdW1ucy5maW5kKChjb2x1bW4pID0+IHtcblx0XHRcdGNvbnN0IGFubm90YXRpb25Db2x1bW4gPSBjb2x1bW4gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uO1xuXHRcdFx0cmV0dXJuIGFubm90YXRpb25Db2x1bW4ucHJvcGVydHlJbmZvcyA9PT0gdW5kZWZpbmVkICYmIGFubm90YXRpb25Db2x1bW4ucmVsYXRpdmVQYXRoID09PSBwYXRoO1xuXHRcdH0pO1xuXHR9XG5cblx0aWYgKCFhZ2dyZWdhdGlvbkhlbHBlci5pc0FuYWx5dGljc1N1cHBvcnRlZCgpKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdC8vIEtlZXAgYSBzZXQgb2YgYWxsIGN1cnJlbmN5L3VuaXQgcHJvcGVydGllcywgYXMgd2UgZG9uJ3Qgd2FudCB0byBjb25zaWRlciB0aGVtIGFzIGFnZ3JlZ2F0ZXNcblx0Ly8gVGhleSBhcmUgYWdncmVnYXRlcyBmb3IgdGVjaG5pY2FsIHJlYXNvbnMgKHRvIG1hbmFnZSBtdWx0aS11bml0cyBzaXR1YXRpb25zKSBidXQgaXQgZG9lc24ndCBtYWtlIHNlbnNlIGZyb20gYSB1c2VyIHN0YW5kcG9pbnRcblx0Y29uc3QgbUN1cnJlbmN5T3JVbml0UHJvcGVydGllcyA9IG5ldyBTZXQoKTtcblx0dGFibGVDb2x1bW5zLmZvckVhY2goKG9Db2x1bW4pID0+IHtcblx0XHRjb25zdCBvVGFibGVDb2x1bW4gPSBvQ29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRpZiAob1RhYmxlQ29sdW1uLnVuaXQpIHtcblx0XHRcdG1DdXJyZW5jeU9yVW5pdFByb3BlcnRpZXMuYWRkKG9UYWJsZUNvbHVtbi51bml0KTtcblx0XHR9XG5cdH0pO1xuXG5cdGNvbnN0IGFDdXN0b21BZ2dyZWdhdGVBbm5vdGF0aW9ucyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zKCk7XG5cdGNvbnN0IG1SYXdEZWZpbml0aW9uczogUmVjb3JkPHN0cmluZywgc3RyaW5nW10+ID0ge307XG5cblx0YUN1c3RvbUFnZ3JlZ2F0ZUFubm90YXRpb25zLmZvckVhY2goKGFubm90YXRpb24pID0+IHtcblx0XHRjb25zdCBvQWdncmVnYXRlZFByb3BlcnR5ID0gYWdncmVnYXRpb25IZWxwZXIuX2VudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5maW5kKChvUHJvcGVydHkpID0+IHtcblx0XHRcdHJldHVybiBvUHJvcGVydHkubmFtZSA9PT0gYW5ub3RhdGlvbi5xdWFsaWZpZXI7XG5cdFx0fSk7XG5cblx0XHRpZiAob0FnZ3JlZ2F0ZWRQcm9wZXJ0eSkge1xuXHRcdFx0Y29uc3QgYUNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMgPSBhbm5vdGF0aW9uLmFubm90YXRpb25zPy5BZ2dyZWdhdGlvbj8uQ29udGV4dERlZmluaW5nUHJvcGVydGllcztcblx0XHRcdG1SYXdEZWZpbml0aW9uc1tvQWdncmVnYXRlZFByb3BlcnR5Lm5hbWVdID0gYUNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXNcblx0XHRcdFx0PyBhQ29udGV4dERlZmluaW5nUHJvcGVydGllcy5tYXAoKG9DdHhEZWZQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9DdHhEZWZQcm9wZXJ0eS52YWx1ZTtcblx0XHRcdFx0ICB9KVxuXHRcdFx0XHQ6IFtdO1xuXHRcdH1cblx0fSk7XG5cdGNvbnN0IG1SZXN1bHQ6IFJlY29yZDxzdHJpbmcsIEFnZ3JlZ2F0ZURhdGE+ID0ge307XG5cblx0dGFibGVDb2x1bW5zLmZvckVhY2goKG9Db2x1bW4pID0+IHtcblx0XHRjb25zdCBvVGFibGVDb2x1bW4gPSBvQ29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRpZiAob1RhYmxlQ29sdW1uLnByb3BlcnR5SW5mb3MgPT09IHVuZGVmaW5lZCAmJiBvVGFibGVDb2x1bW4ucmVsYXRpdmVQYXRoKSB7XG5cdFx0XHRjb25zdCBhUmF3Q29udGV4dERlZmluaW5nUHJvcGVydGllcyA9IG1SYXdEZWZpbml0aW9uc1tvVGFibGVDb2x1bW4ucmVsYXRpdmVQYXRoXTtcblxuXHRcdFx0Ly8gSWdub3JlIGFnZ3JlZ2F0ZXMgY29ycmVzcG9uZGluZyB0byBjdXJyZW5jaWVzIG9yIHVuaXRzIG9mIG1lYXN1cmUgYW5kIGR1bW15IGNyZWF0ZWQgcHJvcGVydHkgZm9yIGRhdGFwb2ludCB0YXJnZXQgVmFsdWVcblx0XHRcdGlmIChcblx0XHRcdFx0YVJhd0NvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMgJiZcblx0XHRcdFx0IW1DdXJyZW5jeU9yVW5pdFByb3BlcnRpZXMuaGFzKG9UYWJsZUNvbHVtbi5uYW1lKSAmJlxuXHRcdFx0XHQhb1RhYmxlQ29sdW1uLmlzRGF0YVBvaW50RmFrZVRhcmdldFByb3BlcnR5XG5cdFx0XHQpIHtcblx0XHRcdFx0bVJlc3VsdFtvVGFibGVDb2x1bW4ubmFtZV0gPSB7XG5cdFx0XHRcdFx0ZGVmYXVsdEFnZ3JlZ2F0ZToge30sXG5cdFx0XHRcdFx0cmVsYXRpdmVQYXRoOiBvVGFibGVDb2x1bW4ucmVsYXRpdmVQYXRoXG5cdFx0XHRcdH07XG5cdFx0XHRcdGNvbnN0IGFDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRcdFx0XHRhUmF3Q29udGV4dERlZmluaW5nUHJvcGVydGllcy5mb3JFYWNoKChjb250ZXh0RGVmaW5pbmdQcm9wZXJ0eU5hbWUpID0+IHtcblx0XHRcdFx0XHRjb25zdCBmb3VuZENvbHVtbiA9IGZpbmRDb2x1bW5Gcm9tUGF0aChjb250ZXh0RGVmaW5pbmdQcm9wZXJ0eU5hbWUpO1xuXHRcdFx0XHRcdGlmIChmb3VuZENvbHVtbikge1xuXHRcdFx0XHRcdFx0YUNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMucHVzaChmb3VuZENvbHVtbi5uYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChhQ29udGV4dERlZmluaW5nUHJvcGVydGllcy5sZW5ndGgpIHtcblx0XHRcdFx0XHRtUmVzdWx0W29UYWJsZUNvbHVtbi5uYW1lXS5kZWZhdWx0QWdncmVnYXRlLmNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXMgPSBhQ29udGV4dERlZmluaW5nUHJvcGVydGllcztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIG1SZXN1bHQ7XG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgYSB0YWJsZSB2aXN1YWxpemF0aW9uIGZvciBhbmFseXRpY2FsIHVzZSBjYXNlcy5cbiAqXG4gKiBAcGFyYW0gdGFibGVWaXN1YWxpemF0aW9uIFRoZSB2aXN1YWxpemF0aW9uIHRvIGJlIHVwZGF0ZWRcbiAqIEBwYXJhbSBlbnRpdHlUeXBlIFRoZSBlbnRpdHkgdHlwZSBkaXNwbGF5ZWQgaW4gdGhlIHRhYmxlXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEBwYXJhbSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiBUaGUgcHJlc2VudGF0aW9uVmFyaWFudCBhbm5vdGF0aW9uIChpZiBhbnkpXG4gKi9cbmZ1bmN0aW9uIHVwZGF0ZVRhYmxlVmlzdWFsaXphdGlvbkZvckFuYWx5dGljcyhcblx0dGFibGVWaXN1YWxpemF0aW9uOiBUYWJsZVZpc3VhbGl6YXRpb24sXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPzogUHJlc2VudGF0aW9uVmFyaWFudFR5cGVcbikge1xuXHRpZiAodGFibGVWaXN1YWxpemF0aW9uLmNvbnRyb2wudHlwZSA9PT0gXCJBbmFseXRpY2FsVGFibGVcIikge1xuXHRcdGNvbnN0IGFnZ3JlZ2F0ZXNEZWZpbml0aW9ucyA9IGdldEFnZ3JlZ2F0ZURlZmluaXRpb25zRnJvbUVudGl0eVR5cGUoZW50aXR5VHlwZSwgdGFibGVWaXN1YWxpemF0aW9uLmNvbHVtbnMsIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdFx0YWdncmVnYXRpb25IZWxwZXIgPSBuZXcgQWdncmVnYXRpb25IZWxwZXIoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCk7XG5cblx0XHRpZiAoYWdncmVnYXRlc0RlZmluaXRpb25zKSB7XG5cdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uZW5hYmxlQW5hbHl0aWNzID0gdHJ1ZTtcblx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5hZ2dyZWdhdGVzID0gYWdncmVnYXRlc0RlZmluaXRpb25zO1xuXG5cdFx0XHRjb25zdCBhbGxvd2VkVHJhbnNmb3JtYXRpb25zID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0QWxsb3dlZFRyYW5zZm9ybWF0aW9ucygpO1xuXHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmVuYWJsZUFuYWx5dGljc1NlYXJjaCA9IGFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMgPyBhbGxvd2VkVHJhbnNmb3JtYXRpb25zLmluZGV4T2YoXCJzZWFyY2hcIikgPj0gMCA6IHRydWU7XG5cblx0XHRcdC8vIEFkZCBncm91cCBhbmQgc29ydCBjb25kaXRpb25zIGZyb20gdGhlIHByZXNlbnRhdGlvbiB2YXJpYW50XG5cdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uYW5ub3RhdGlvbi5ncm91cENvbmRpdGlvbnMgPSBnZXRHcm91cENvbmRpdGlvbnMoXG5cdFx0XHRcdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uLFxuXHRcdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uY29sdW1ucyxcblx0XHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmNvbnRyb2wudHlwZVxuXHRcdFx0KTtcblx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5hbm5vdGF0aW9uLmFnZ3JlZ2F0ZUNvbmRpdGlvbnMgPSBnZXRBZ2dyZWdhdGVDb25kaXRpb25zKFxuXHRcdFx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbixcblx0XHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmNvbHVtbnNcblx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0dGFibGVWaXN1YWxpemF0aW9uLmNvbnRyb2wudHlwZSA9IFwiR3JpZFRhYmxlXCI7IC8vIEFuYWx5dGljYWxUYWJsZSBpc24ndCBhIHJlYWwgdHlwZSBmb3IgdGhlIE1EQzpUYWJsZSwgc28gd2UgYWx3YXlzIHN3aXRjaCBiYWNrIHRvIEdyaWRcblx0fSBlbHNlIGlmICh0YWJsZVZpc3VhbGl6YXRpb24uY29udHJvbC50eXBlID09PSBcIlJlc3BvbnNpdmVUYWJsZVwiKSB7XG5cdFx0dGFibGVWaXN1YWxpemF0aW9uLmFubm90YXRpb24uZ3JvdXBDb25kaXRpb25zID0gZ2V0R3JvdXBDb25kaXRpb25zKFxuXHRcdFx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sXG5cdFx0XHR0YWJsZVZpc3VhbGl6YXRpb24uY29sdW1ucyxcblx0XHRcdHRhYmxlVmlzdWFsaXphdGlvbi5jb250cm9sLnR5cGVcblx0XHQpO1xuXHR9XG59XG5cbi8qKlxuICogR2V0IHRoZSBuYXZpZ2F0aW9uIHRhcmdldCBwYXRoIGZyb20gbWFuaWZlc3Qgc2V0dGluZ3MuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gbmF2aWdhdGlvblByb3BlcnR5UGF0aCBUaGUgbmF2aWdhdGlvbiBwYXRoIHRvIGNoZWNrIGluIHRoZSBtYW5pZmVzdCBzZXR0aW5nc1xuICogQHJldHVybnMgTmF2aWdhdGlvbiBwYXRoIGZyb20gbWFuaWZlc3Qgc2V0dGluZ3NcbiAqL1xuZnVuY3Rpb24gZ2V0TmF2aWdhdGlvblRhcmdldFBhdGgoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCwgbmF2aWdhdGlvblByb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGlmIChuYXZpZ2F0aW9uUHJvcGVydHlQYXRoICYmIG1hbmlmZXN0V3JhcHBlci5nZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihuYXZpZ2F0aW9uUHJvcGVydHlQYXRoKSkge1xuXHRcdGNvbnN0IG5hdkNvbmZpZyA9IG1hbmlmZXN0V3JhcHBlci5nZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihuYXZpZ2F0aW9uUHJvcGVydHlQYXRoKTtcblx0XHRpZiAoT2JqZWN0LmtleXMobmF2Q29uZmlnKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRyZXR1cm4gbmF2aWdhdGlvblByb3BlcnR5UGF0aDtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBkYXRhTW9kZWxQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk7XG5cdGNvbnN0IGNvbnRleHRQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRDb250ZXh0UGF0aCgpO1xuXHRjb25zdCBuYXZDb25maWdGb3JDb250ZXh0UGF0aCA9IG1hbmlmZXN0V3JhcHBlci5nZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihjb250ZXh0UGF0aCk7XG5cdGlmIChuYXZDb25maWdGb3JDb250ZXh0UGF0aCAmJiBPYmplY3Qua2V5cyhuYXZDb25maWdGb3JDb250ZXh0UGF0aCkubGVuZ3RoID4gMCkge1xuXHRcdHJldHVybiBjb250ZXh0UGF0aDtcblx0fVxuXG5cdHJldHVybiBkYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVNldCA/IGRhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5U2V0Lm5hbWUgOiBkYXRhTW9kZWxQYXRoLnN0YXJ0aW5nRW50aXR5U2V0Lm5hbWU7XG59XG5cbi8qKlxuICogU2V0cyB0aGUgJ3VuaXQnIGFuZCAndGV4dEFycmFuZ2VtZW50JyBwcm9wZXJ0aWVzIGluIGNvbHVtbnMgd2hlbiBuZWNlc3NhcnkuXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIGVudGl0eSB0eXBlIGRpc3BsYXllZCBpbiB0aGUgdGFibGVcbiAqIEBwYXJhbSB0YWJsZUNvbHVtbnMgVGhlIGNvbHVtbnMgdG8gYmUgdXBkYXRlZFxuICovXG5leHBvcnQgZnVuY3Rpb24gdXBkYXRlTGlua2VkUHJvcGVydGllcyhlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLCB0YWJsZUNvbHVtbnM6IFRhYmxlQ29sdW1uW10pIHtcblx0ZnVuY3Rpb24gZmluZENvbHVtbkJ5UGF0aChwYXRoOiBzdHJpbmcpOiBUYWJsZUNvbHVtbiB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRhYmxlQ29sdW1ucy5maW5kKChjb2x1bW4pID0+IHtcblx0XHRcdGNvbnN0IGFubm90YXRpb25Db2x1bW4gPSBjb2x1bW4gYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uO1xuXHRcdFx0cmV0dXJuIGFubm90YXRpb25Db2x1bW4ucHJvcGVydHlJbmZvcyA9PT0gdW5kZWZpbmVkICYmIGFubm90YXRpb25Db2x1bW4ucmVsYXRpdmVQYXRoID09PSBwYXRoO1xuXHRcdH0pO1xuXHR9XG5cblx0dGFibGVDb2x1bW5zLmZvckVhY2goKG9Db2x1bW4pID0+IHtcblx0XHRjb25zdCBvVGFibGVDb2x1bW4gPSBvQ29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcblx0XHRpZiAob1RhYmxlQ29sdW1uLnByb3BlcnR5SW5mb3MgPT09IHVuZGVmaW5lZCAmJiBvVGFibGVDb2x1bW4ucmVsYXRpdmVQYXRoKSB7XG5cdFx0XHRjb25zdCBvUHJvcGVydHkgPSBlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZmluZCgob1Byb3A6IFByb3BlcnR5KSA9PiBvUHJvcC5uYW1lID09PSBvVGFibGVDb2x1bW4ucmVsYXRpdmVQYXRoKTtcblx0XHRcdGlmIChvUHJvcGVydHkpIHtcblx0XHRcdFx0Y29uc3Qgb1VuaXQgPSBnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eShvUHJvcGVydHkpIHx8IGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkob1Byb3BlcnR5KTtcblx0XHRcdFx0Y29uc3Qgb1RpbWV6b25lID0gZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkob1Byb3BlcnR5KTtcblx0XHRcdFx0Y29uc3Qgc1RpbWV6b25lID0gb1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZTtcblx0XHRcdFx0aWYgKG9Vbml0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1VuaXRDb2x1bW4gPSBmaW5kQ29sdW1uQnlQYXRoKG9Vbml0Lm5hbWUpO1xuXHRcdFx0XHRcdG9UYWJsZUNvbHVtbi51bml0ID0gb1VuaXRDb2x1bW4/Lm5hbWU7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3Qgc1VuaXQgPSBvUHJvcGVydHk/LmFubm90YXRpb25zPy5NZWFzdXJlcz8uSVNPQ3VycmVuY3kgfHwgb1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQ7XG5cdFx0XHRcdFx0aWYgKHNVbml0KSB7XG5cdFx0XHRcdFx0XHRvVGFibGVDb2x1bW4udW5pdFRleHQgPSBgJHtzVW5pdH1gO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob1RpbWV6b25lKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1RpbWV6b25lQ29sdW1uID0gZmluZENvbHVtbkJ5UGF0aChvVGltZXpvbmUubmFtZSk7XG5cdFx0XHRcdFx0b1RhYmxlQ29sdW1uLnRpbWV6b25lID0gb1RpbWV6b25lQ29sdW1uPy5uYW1lO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHNUaW1lem9uZSkge1xuXHRcdFx0XHRcdG9UYWJsZUNvbHVtbi50aW1lem9uZVRleHQgPSBzVGltZXpvbmUudG9TdHJpbmcoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGNvbnN0IGRpc3BsYXlNb2RlID0gZ2V0RGlzcGxheU1vZGUob1Byb3BlcnR5KSxcblx0XHRcdFx0XHR0ZXh0QW5ub3RhdGlvbiA9IG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db21tb24/LlRleHQ7XG5cdFx0XHRcdGlmIChpc1BhdGhFeHByZXNzaW9uKHRleHRBbm5vdGF0aW9uKSAmJiBkaXNwbGF5TW9kZSAhPT0gXCJWYWx1ZVwiKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1RleHRDb2x1bW4gPSBmaW5kQ29sdW1uQnlQYXRoKHRleHRBbm5vdGF0aW9uLnBhdGgpO1xuXHRcdFx0XHRcdGlmIChvVGV4dENvbHVtbiAmJiBvVGV4dENvbHVtbi5uYW1lICE9PSBvVGFibGVDb2x1bW4ubmFtZSkge1xuXHRcdFx0XHRcdFx0b1RhYmxlQ29sdW1uLnRleHRBcnJhbmdlbWVudCA9IHtcblx0XHRcdFx0XHRcdFx0dGV4dFByb3BlcnR5OiBvVGV4dENvbHVtbi5uYW1lLFxuXHRcdFx0XHRcdFx0XHRtb2RlOiBkaXNwbGF5TW9kZVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBnZXRTZW1hbnRpY0tleXNBbmRUaXRsZUluZm8oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRjb25zdCBoZWFkZXJJbmZvVGl0bGVQYXRoID0gKGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUoKT8uYW5ub3RhdGlvbnM/LlVJPy5IZWFkZXJJbmZvPy5UaXRsZSBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlXG5cdFx0Py5wYXRoO1xuXHRjb25zdCBzZW1hbnRpY0tleUFubm90YXRpb25zOiBhbnlbXSB8IHVuZGVmaW5lZCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUoKT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uU2VtYW50aWNLZXk7XG5cdGNvbnN0IGhlYWRlckluZm9UeXBlTmFtZSA9IGNvbnZlcnRlckNvbnRleHQ/LmdldEFubm90YXRpb25FbnRpdHlUeXBlKCk/LmFubm90YXRpb25zPy5VST8uSGVhZGVySW5mbz8uVHlwZU5hbWU7XG5cdGNvbnN0IHNlbWFudGljS2V5Q29sdW1uczogc3RyaW5nW10gPSBbXTtcblx0aWYgKHNlbWFudGljS2V5QW5ub3RhdGlvbnMpIHtcblx0XHRzZW1hbnRpY0tleUFubm90YXRpb25zLmZvckVhY2goZnVuY3Rpb24gKG9Db2x1bW46IGFueSkge1xuXHRcdFx0c2VtYW50aWNLZXlDb2x1bW5zLnB1c2gob0NvbHVtbi52YWx1ZSk7XG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4geyBoZWFkZXJJbmZvVGl0bGVQYXRoLCBzZW1hbnRpY0tleUNvbHVtbnMsIGhlYWRlckluZm9UeXBlTmFtZSB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVGFibGVWaXN1YWxpemF0aW9uKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbj86IFByZXNlbnRhdGlvblZhcmlhbnRUeXBlLFxuXHRpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50PzogYm9vbGVhbixcblx0dmlld0NvbmZpZ3VyYXRpb24/OiBWaWV3UGF0aENvbmZpZ3VyYXRpb25cbik6IFRhYmxlVmlzdWFsaXphdGlvbiB7XG5cdGNvbnN0IHRhYmxlTWFuaWZlc3RDb25maWcgPSBnZXRUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbihcblx0XHRsaW5lSXRlbUFubm90YXRpb24sXG5cdFx0dmlzdWFsaXphdGlvblBhdGgsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50XG5cdCk7XG5cdGNvbnN0IHsgbmF2aWdhdGlvblByb3BlcnR5UGF0aCB9ID0gc3BsaXRQYXRoKHZpc3VhbGl6YXRpb25QYXRoKTtcblx0Y29uc3QgbmF2aWdhdGlvblRhcmdldFBhdGggPSBnZXROYXZpZ2F0aW9uVGFyZ2V0UGF0aChjb252ZXJ0ZXJDb250ZXh0LCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoKTtcblx0Y29uc3QgbmF2aWdhdGlvblNldHRpbmdzID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5nZXROYXZpZ2F0aW9uQ29uZmlndXJhdGlvbihuYXZpZ2F0aW9uVGFyZ2V0UGF0aCk7XG5cdGNvbnN0IGNvbHVtbnMgPSBnZXRUYWJsZUNvbHVtbnMobGluZUl0ZW1Bbm5vdGF0aW9uLCB2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCwgbmF2aWdhdGlvblNldHRpbmdzKTtcblx0Y29uc3Qgb3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwKGxpbmVJdGVtQW5ub3RhdGlvbiwgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZSA9IGdldFNlbWFudGljS2V5c0FuZFRpdGxlSW5mbyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgdGFibGVBY3Rpb25zID0gZ2V0VGFibGVBY3Rpb25zKGxpbmVJdGVtQW5ub3RhdGlvbiwgdmlzdWFsaXphdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQsIG5hdmlnYXRpb25TZXR0aW5ncyk7XG5cdGNvbnN0IG9WaXN1YWxpemF0aW9uOiBUYWJsZVZpc3VhbGl6YXRpb24gPSB7XG5cdFx0dHlwZTogVmlzdWFsaXphdGlvblR5cGUuVGFibGUsXG5cdFx0YW5ub3RhdGlvbjogZ2V0VGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbihcblx0XHRcdGxpbmVJdGVtQW5ub3RhdGlvbixcblx0XHRcdHZpc3VhbGl6YXRpb25QYXRoLFxuXHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdHRhYmxlTWFuaWZlc3RDb25maWcsXG5cdFx0XHRjb2x1bW5zLFxuXHRcdFx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sXG5cdFx0XHR2aWV3Q29uZmlndXJhdGlvblxuXHRcdCksXG5cdFx0Y29udHJvbDogdGFibGVNYW5pZmVzdENvbmZpZyxcblx0XHRhY3Rpb25zOiByZW1vdmVEdXBsaWNhdGVBY3Rpb25zKHRhYmxlQWN0aW9ucy5hY3Rpb25zKSxcblx0XHRjb21tYW5kQWN0aW9uczogdGFibGVBY3Rpb25zLmNvbW1hbmRBY3Rpb25zLFxuXHRcdGNvbHVtbnM6IGNvbHVtbnMsXG5cdFx0b3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBKU09OLnN0cmluZ2lmeShvcGVyYXRpb25BdmFpbGFibGVNYXApLFxuXHRcdG9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXM6IGdldE9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMob3BlcmF0aW9uQXZhaWxhYmxlTWFwLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRoZWFkZXJJbmZvVGl0bGU6IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZS5oZWFkZXJJbmZvVGl0bGVQYXRoLFxuXHRcdHNlbWFudGljS2V5czogc2VtYW50aWNLZXlzQW5kSGVhZGVySW5mb1RpdGxlLnNlbWFudGljS2V5Q29sdW1ucyxcblx0XHRoZWFkZXJJbmZvVHlwZU5hbWU6IHNlbWFudGljS2V5c0FuZEhlYWRlckluZm9UaXRsZS5oZWFkZXJJbmZvVHlwZU5hbWVcblx0fTtcblxuXHR1cGRhdGVMaW5rZWRQcm9wZXJ0aWVzKGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUobGluZUl0ZW1Bbm5vdGF0aW9uKSwgY29sdW1ucyk7XG5cdHVwZGF0ZVRhYmxlVmlzdWFsaXphdGlvbkZvckFuYWx5dGljcyhcblx0XHRvVmlzdWFsaXphdGlvbixcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25FbnRpdHlUeXBlKGxpbmVJdGVtQW5ub3RhdGlvbiksXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvblxuXHQpO1xuXG5cdHJldHVybiBvVmlzdWFsaXphdGlvbjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZURlZmF1bHRUYWJsZVZpc3VhbGl6YXRpb24oY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IFRhYmxlVmlzdWFsaXphdGlvbiB7XG5cdGNvbnN0IHRhYmxlTWFuaWZlc3RDb25maWcgPSBnZXRUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbih1bmRlZmluZWQsIFwiXCIsIGNvbnZlcnRlckNvbnRleHQsIGZhbHNlKTtcblx0Y29uc3QgY29sdW1ucyA9IGdldENvbHVtbnNGcm9tRW50aXR5VHlwZSh7fSwgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCksIFtdLCBbXSwgY29udmVydGVyQ29udGV4dCwgdGFibGVNYW5pZmVzdENvbmZpZy50eXBlLCBbXSk7XG5cdGNvbnN0IG9wZXJhdGlvbkF2YWlsYWJsZU1hcCA9IGdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcCh1bmRlZmluZWQsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBzZW1hbnRpY0tleXNBbmRIZWFkZXJJbmZvVGl0bGUgPSBnZXRTZW1hbnRpY0tleXNBbmRUaXRsZUluZm8oY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IG9WaXN1YWxpemF0aW9uOiBUYWJsZVZpc3VhbGl6YXRpb24gPSB7XG5cdFx0dHlwZTogVmlzdWFsaXphdGlvblR5cGUuVGFibGUsXG5cdFx0YW5ub3RhdGlvbjogZ2V0VGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbih1bmRlZmluZWQsIFwiXCIsIGNvbnZlcnRlckNvbnRleHQsIHRhYmxlTWFuaWZlc3RDb25maWcsIGNvbHVtbnMpLFxuXHRcdGNvbnRyb2w6IHRhYmxlTWFuaWZlc3RDb25maWcsXG5cdFx0YWN0aW9uczogW10sXG5cdFx0Y29sdW1uczogY29sdW1ucyxcblx0XHRvcGVyYXRpb25BdmFpbGFibGVNYXA6IEpTT04uc3RyaW5naWZ5KG9wZXJhdGlvbkF2YWlsYWJsZU1hcCksXG5cdFx0b3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllczogZ2V0T3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllcyhvcGVyYXRpb25BdmFpbGFibGVNYXAsIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdGhlYWRlckluZm9UaXRsZTogc2VtYW50aWNLZXlzQW5kSGVhZGVySW5mb1RpdGxlLmhlYWRlckluZm9UaXRsZVBhdGgsXG5cdFx0c2VtYW50aWNLZXlzOiBzZW1hbnRpY0tleXNBbmRIZWFkZXJJbmZvVGl0bGUuc2VtYW50aWNLZXlDb2x1bW5zLFxuXHRcdGhlYWRlckluZm9UeXBlTmFtZTogc2VtYW50aWNLZXlzQW5kSGVhZGVySW5mb1RpdGxlLmhlYWRlckluZm9UeXBlTmFtZVxuXHR9O1xuXG5cdHVwZGF0ZUxpbmtlZFByb3BlcnRpZXMoY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCksIGNvbHVtbnMpO1xuXHR1cGRhdGVUYWJsZVZpc3VhbGl6YXRpb25Gb3JBbmFseXRpY3Mob1Zpc3VhbGl6YXRpb24sIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRyZXR1cm4gb1Zpc3VhbGl6YXRpb247XG59XG5cbi8qKlxuICogR2V0cyB0aGUgbWFwIG9mIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIHByb3BlcnR5IHBhdGhzIGZvciBhbGwgRGF0YUZpZWxkRm9yQWN0aW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uIFRoZSBpbnN0YW5jZSBvZiB0aGUgbGluZSBpdGVtXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgcmVjb3JkIGNvbnRhaW5pbmcgYWxsIGFjdGlvbiBuYW1lcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBDb3JlLk9wZXJhdGlvbkF2YWlsYWJsZSBwcm9wZXJ0eSBwYXRoc1xuICovXG5mdW5jdGlvbiBnZXRPcGVyYXRpb25BdmFpbGFibGVNYXAobGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSB8IHVuZGVmaW5lZCwgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IFJlY29yZDxzdHJpbmcsIGFueT4ge1xuXHRyZXR1cm4gQWN0aW9uSGVscGVyLmdldE9wZXJhdGlvbkF2YWlsYWJsZU1hcChsaW5lSXRlbUFubm90YXRpb24sIFwidGFibGVcIiwgY29udmVydGVyQ29udGV4dCk7XG59XG5cbi8qKlxuICogR2V0cyB1cGRhdGFibGUgcHJvcGVydHlQYXRoIGZvciB0aGUgY3VycmVudCBlbnRpdHlzZXQgaWYgdmFsaWQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIHVwZGF0YWJsZSBwcm9wZXJ0eSBmb3IgdGhlIHJvd3NcbiAqL1xuZnVuY3Rpb24gZ2V0Q3VycmVudEVudGl0eVNldFVwZGF0YWJsZVBhdGgoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IHN0cmluZyB7XG5cdGNvbnN0IHJlc3RyaWN0aW9ucyA9IGdldFJlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgZW50aXR5U2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0Y29uc3QgdXBkYXRhYmxlID0gcmVzdHJpY3Rpb25zLmlzVXBkYXRhYmxlO1xuXHRjb25zdCBpc09ubHlEeW5hbWljT25DdXJyZW50RW50aXR5OiBhbnkgPSAhaXNDb25zdGFudCh1cGRhdGFibGUuZXhwcmVzc2lvbikgJiYgdXBkYXRhYmxlLm5hdmlnYXRpb25FeHByZXNzaW9uLl90eXBlID09PSBcIlVucmVzb2x2YWJsZVwiO1xuXHRjb25zdCB1cGRhdGFibGVQcm9wZXJ0eVBhdGggPSAoZW50aXR5U2V0Py5hbm5vdGF0aW9ucy5DYXBhYmlsaXRpZXM/LlVwZGF0ZVJlc3RyaWN0aW9ucz8uVXBkYXRhYmxlIGFzIGFueSk/LnBhdGg7XG5cblx0cmV0dXJuIGlzT25seUR5bmFtaWNPbkN1cnJlbnRFbnRpdHkgPyAodXBkYXRhYmxlUHJvcGVydHlQYXRoIGFzIHN0cmluZykgOiBcIlwiO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byByZXRyaWV2ZSBhbGwgcHJvcGVydHkgcGF0aHMgYXNzaWduZWQgdG8gdGhlIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIGFubm90YXRpb24uXG4gKlxuICogQHBhcmFtIG9wZXJhdGlvbkF2YWlsYWJsZU1hcCBUaGUgcmVjb3JkIGNvbnNpc3Rpbmcgb2YgYWN0aW9ucyBhbmQgdGhlaXIgQ29yZS5PcGVyYXRpb25BdmFpbGFibGUgcHJvcGVydHkgcGF0aHNcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBDU1Ygc3RyaW5nIG9mIGFsbCBwcm9wZXJ0eSBwYXRocyBhc3NvY2lhdGVkIHdpdGggdGhlIENvcmUuT3BlcmF0aW9uQXZhaWxhYmxlIGFubm90YXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0T3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllcyhvcGVyYXRpb25BdmFpbGFibGVNYXA6IFJlY29yZDxzdHJpbmcsIGFueT4sIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBzdHJpbmcge1xuXHRjb25zdCBwcm9wZXJ0aWVzID0gbmV3IFNldCgpO1xuXG5cdGZvciAoY29uc3QgYWN0aW9uTmFtZSBpbiBvcGVyYXRpb25BdmFpbGFibGVNYXApIHtcblx0XHRjb25zdCBwcm9wZXJ0eU5hbWUgPSBvcGVyYXRpb25BdmFpbGFibGVNYXBbYWN0aW9uTmFtZV07XG5cdFx0aWYgKHByb3BlcnR5TmFtZSA9PT0gbnVsbCkge1xuXHRcdFx0Ly8gQW5ub3RhdGlvbiBjb25maWd1cmVkIHdpdGggZXhwbGljaXQgJ251bGwnIChhY3Rpb24gYWR2ZXJ0aXNlbWVudCByZWxldmFudClcblx0XHRcdHByb3BlcnRpZXMuYWRkKGFjdGlvbk5hbWUpO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHByb3BlcnR5TmFtZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0Ly8gQWRkIHByb3BlcnR5IHBhdGhzIGFuZCBub3QgQ29uc3RhbnQgdmFsdWVzLlxuXHRcdFx0cHJvcGVydGllcy5hZGQocHJvcGVydHlOYW1lKTtcblx0XHR9XG5cdH1cblxuXHRpZiAocHJvcGVydGllcy5zaXplKSB7XG5cdFx0Ly8gU29tZSBhY3Rpb25zIGhhdmUgYW4gb3BlcmF0aW9uIGF2YWlsYWJsZSBiYXNlZCBvbiBwcm9wZXJ0eSAtLT4gd2UgbmVlZCB0byBsb2FkIHRoZSBIZWFkZXJJbmZvLlRpdGxlIHByb3BlcnR5XG5cdFx0Ly8gc28gdGhhdCB0aGUgZGlhbG9nIG9uIHBhcnRpYWwgYWN0aW9ucyBpcyBkaXNwbGF5ZWQgcHJvcGVybHkgKEJDUCAyMTgwMjcxNDI1KVxuXHRcdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0XHRjb25zdCB0aXRsZVByb3BlcnR5ID0gKGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5IZWFkZXJJbmZvPy5UaXRsZSBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlPy5wYXRoO1xuXHRcdGlmICh0aXRsZVByb3BlcnR5KSB7XG5cdFx0XHRwcm9wZXJ0aWVzLmFkZCh0aXRsZVByb3BlcnR5KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gQXJyYXkuZnJvbShwcm9wZXJ0aWVzKS5qb2luKFwiLFwiKTtcbn1cblxuLyoqXG4gKiBJdGVyYXRlcyBvdmVyIHRoZSBEYXRhRmllbGRGb3JBY3Rpb24gYW5kIERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiBvZiBhIGxpbmUgaXRlbSBhbmRcbiAqIHJldHVybnMgYWxsIHRoZSBVSS5IaWRkZW4gYW5ub3RhdGlvbiBleHByZXNzaW9ucy5cbiAqXG4gKiBAcGFyYW0gbGluZUl0ZW1Bbm5vdGF0aW9uIENvbGxlY3Rpb24gb2YgZGF0YSBmaWVsZHMgdXNlZCBmb3IgcmVwcmVzZW50YXRpb24gaW4gYSB0YWJsZSBvciBsaXN0XG4gKiBAcGFyYW0gY3VycmVudEVudGl0eVR5cGUgQ3VycmVudCBlbnRpdHkgdHlwZVxuICogQHBhcmFtIGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoIE9iamVjdCBwYXRoIG9mIHRoZSBkYXRhIG1vZGVsXG4gKiBAcGFyYW0gaXNFbnRpdHlTZXRcbiAqIEByZXR1cm5zIEFsbCB0aGUgYFVJLkhpZGRlbmAgcGF0aCBleHByZXNzaW9ucyBmb3VuZCBpbiB0aGUgcmVsZXZhbnQgYWN0aW9uc1xuICovXG5mdW5jdGlvbiBnZXRVSUhpZGRlbkV4cEZvckFjdGlvbnNSZXF1aXJpbmdDb250ZXh0KFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHRjdXJyZW50RW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0Y29udGV4dERhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdGlzRW50aXR5U2V0OiBib29sZWFuXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSB7XG5cdGNvbnN0IGFVaUhpZGRlblBhdGhFeHByZXNzaW9uczogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+W10gPSBbXTtcblx0bGluZUl0ZW1Bbm5vdGF0aW9uLmZvckVhY2goKGRhdGFGaWVsZCkgPT4ge1xuXHRcdC8vIENoZWNrIGlmIHRoZSBsaW5lSXRlbSBjb250ZXh0IGlzIHRoZSBzYW1lIGFzIHRoYXQgb2YgdGhlIGFjdGlvbjpcblx0XHRpZiAoXG5cdFx0XHQoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24gJiZcblx0XHRcdFx0ZGF0YUZpZWxkPy5BY3Rpb25UYXJnZXQ/LmlzQm91bmQgJiZcblx0XHRcdFx0Y3VycmVudEVudGl0eVR5cGUgPT09IGRhdGFGaWVsZD8uQWN0aW9uVGFyZ2V0LnNvdXJjZUVudGl0eVR5cGUpIHx8XG5cdFx0XHQoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gJiZcblx0XHRcdFx0ZGF0YUZpZWxkLlJlcXVpcmVzQ29udGV4dCAmJlxuXHRcdFx0XHRkYXRhRmllbGQ/LklubGluZT8udmFsdWVPZigpICE9PSB0cnVlKVxuXHRcdCkge1xuXHRcdFx0aWYgKHR5cGVvZiBkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRhVWlIaWRkZW5QYXRoRXhwcmVzc2lvbnMucHVzaChlcXVhbChnZXRCaW5kaW5nRXhwRnJvbUNvbnRleHQoZGF0YUZpZWxkLCBjb250ZXh0RGF0YU1vZGVsT2JqZWN0UGF0aCwgaXNFbnRpdHlTZXQpLCBmYWxzZSkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdHJldHVybiBhVWlIaWRkZW5QYXRoRXhwcmVzc2lvbnM7XG59XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaXMgdXNlZCB0byBjaGFuZ2UgdGhlIGNvbnRleHQgY3VycmVudGx5IHJlZmVyZW5jZWQgYnkgdGhpcyBiaW5kaW5nIGJ5IHJlbW92aW5nIHRoZSBsYXN0IG5hdmlnYXRpb24gcHJvcGVydHkuXG4gKlxuICogSXQgaXMgdXNlZCAoc3BlY2lmaWNhbGx5IGluIHRoaXMgY2FzZSksIHRvIHRyYW5zZm9ybSBhIGJpbmRpbmcgbWFkZSBmb3IgYSBOYXZQcm9wIGNvbnRleHQgL01haW5PYmplY3QvTmF2UHJvcDEvTmF2UHJvcDIsXG4gKiBpbnRvIGEgYmluZGluZyBvbiB0aGUgcHJldmlvdXMgY29udGV4dCAvTWFpbk9iamVjdC9OYXZQcm9wMS5cbiAqXG4gKiBAcGFyYW0gc291cmNlIERhdGFGaWVsZEZvckFjdGlvbiB8IERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiB8IEN1c3RvbUFjdGlvblxuICogQHBhcmFtIGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoIERhdGFNb2RlbE9iamVjdFBhdGhcbiAqIEBwYXJhbSBpc0VudGl0eVNldFxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvblxuICovXG5mdW5jdGlvbiBnZXRCaW5kaW5nRXhwRnJvbUNvbnRleHQoXG5cdHNvdXJjZTogRGF0YUZpZWxkRm9yQWN0aW9uIHwgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIHwgQ3VzdG9tQWN0aW9uLFxuXHRjb250ZXh0RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0aXNFbnRpdHlTZXQ6IGJvb2xlYW5cbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+IHtcblx0bGV0IHNFeHByZXNzaW9uOiBhbnkgfCB1bmRlZmluZWQ7XG5cdGlmIChcblx0XHQoc291cmNlIGFzIERhdGFGaWVsZEZvckFjdGlvbik/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24gfHxcblx0XHQoc291cmNlIGFzIERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbik/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cblx0KSB7XG5cdFx0c0V4cHJlc3Npb24gPSAoc291cmNlIGFzIERhdGFGaWVsZEZvckFjdGlvbiB8IERhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbik/LmFubm90YXRpb25zPy5VST8uSGlkZGVuO1xuXHR9IGVsc2Uge1xuXHRcdHNFeHByZXNzaW9uID0gKHNvdXJjZSBhcyBDdXN0b21BY3Rpb24pPy52aXNpYmxlO1xuXHR9XG5cdGxldCBzUGF0aDogc3RyaW5nO1xuXHRpZiAoc0V4cHJlc3Npb24/LnBhdGgpIHtcblx0XHRzUGF0aCA9IHNFeHByZXNzaW9uLnBhdGg7XG5cdH0gZWxzZSB7XG5cdFx0c1BhdGggPSBzRXhwcmVzc2lvbjtcblx0fVxuXHRpZiAoc1BhdGgpIHtcblx0XHRpZiAoKHNvdXJjZSBhcyBDdXN0b21BY3Rpb24pPy52aXNpYmxlKSB7XG5cdFx0XHRzUGF0aCA9IHNQYXRoLnN1YnN0cmluZygxLCBzUGF0aC5sZW5ndGggLSAxKTtcblx0XHR9XG5cdFx0aWYgKHNQYXRoLmluZGV4T2YoXCIvXCIpID4gMCkge1xuXHRcdFx0Ly9jaGVjayBpZiB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBpcyBjb3JyZWN0OlxuXHRcdFx0Y29uc3QgYVNwbGl0UGF0aCA9IHNQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRcdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IGFTcGxpdFBhdGhbMF07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoPy50YXJnZXRPYmplY3Q/Ll90eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmXG5cdFx0XHRcdGNvbnRleHREYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5wYXJ0bmVyID09PSBzTmF2aWdhdGlvblBhdGhcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gcGF0aEluTW9kZWwoYVNwbGl0UGF0aC5zbGljZSgxKS5qb2luKFwiL1wiKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gY29uc3RhbnQodHJ1ZSk7XG5cdFx0XHR9XG5cdFx0XHQvLyBJbiBjYXNlIHRoZXJlIGlzIG5vIG5hdmlnYXRpb24gcHJvcGVydHksIGlmIGl0J3MgYW4gZW50aXR5U2V0LCB0aGUgZXhwcmVzc2lvbiBiaW5kaW5nIGhhcyB0byBiZSByZXR1cm5lZDpcblx0XHR9IGVsc2UgaWYgKGlzRW50aXR5U2V0KSB7XG5cdFx0XHRyZXR1cm4gcGF0aEluTW9kZWwoc1BhdGgpO1xuXHRcdFx0Ly8gb3RoZXJ3aXNlIHRoZSBleHByZXNzaW9uIGJpbmRpbmcgY2Fubm90IGJlIHRha2VuIGludG8gYWNjb3VudCBmb3IgdGhlIHNlbGVjdGlvbiBtb2RlIGV2YWx1YXRpb246XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBjb25zdGFudCh0cnVlKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGNvbnN0YW50KHRydWUpO1xufVxuXG4vKipcbiAqIExvb3AgdGhyb3VnaCB0aGUgRGF0YUZpZWxkRm9yQWN0aW9uIGFuZCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gb2YgYSBsaW5lIGl0ZW0gYW5kIGNoZWNrXG4gKiBpZiBhdCBsZWFzdCBvbmUgb2YgdGhlbSBpcyBhbHdheXMgdmlzaWJsZSBpbiB0aGUgdGFibGUgdG9vbGJhciAoYW5kIHJlcXVpcmVzIGEgY29udGV4dCkuXG4gKlxuICogQHBhcmFtIGxpbmVJdGVtQW5ub3RhdGlvbiBDb2xsZWN0aW9uIG9mIGRhdGEgZmllbGRzIGZvciByZXByZXNlbnRhdGlvbiBpbiBhIHRhYmxlIG9yIGxpc3RcbiAqIEBwYXJhbSBjdXJyZW50RW50aXR5VHlwZSBDdXJyZW50IEVudGl0eSBUeXBlXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlcmUgaXMgYXQgbGVhc3QgMSBhY3Rpb24gdGhhdCBtZWV0cyB0aGUgY3JpdGVyaWFcbiAqL1xuZnVuY3Rpb24gaGFzQm91bmRBY3Rpb25zQWx3YXlzVmlzaWJsZUluVG9vbEJhcihsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLCBjdXJyZW50RW50aXR5VHlwZTogRW50aXR5VHlwZSk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gbGluZUl0ZW1Bbm5vdGF0aW9uLnNvbWUoKGRhdGFGaWVsZCkgPT4ge1xuXHRcdGlmIChcblx0XHRcdChkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbiB8fFxuXHRcdFx0XHRkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbikgJiZcblx0XHRcdGRhdGFGaWVsZD8uSW5saW5lPy52YWx1ZU9mKCkgIT09IHRydWUgJiZcblx0XHRcdChkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSA9PT0gZmFsc2UgfHwgZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgPT09IHVuZGVmaW5lZClcblx0XHQpIHtcblx0XHRcdGlmIChkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbikge1xuXHRcdFx0XHQvLyBDaGVjayBpZiB0aGUgbGluZUl0ZW0gY29udGV4dCBpcyB0aGUgc2FtZSBhcyB0aGF0IG9mIHRoZSBhY3Rpb246XG5cdFx0XHRcdHJldHVybiBkYXRhRmllbGQ/LkFjdGlvblRhcmdldD8uaXNCb3VuZCAmJiBjdXJyZW50RW50aXR5VHlwZSA9PT0gZGF0YUZpZWxkPy5BY3Rpb25UYXJnZXQuc291cmNlRW50aXR5VHlwZTtcblx0XHRcdH0gZWxzZSBpZiAoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24pIHtcblx0XHRcdFx0cmV0dXJuIGRhdGFGaWVsZC5SZXF1aXJlc0NvbnRleHQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGhhc0N1c3RvbUFjdGlvbnNBbHdheXNWaXNpYmxlSW5Ub29sQmFyKG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPik6IGJvb2xlYW4ge1xuXHRyZXR1cm4gT2JqZWN0LmtleXMobWFuaWZlc3RBY3Rpb25zKS5zb21lKChhY3Rpb25LZXkpID0+IHtcblx0XHRjb25zdCBhY3Rpb24gPSBtYW5pZmVzdEFjdGlvbnNbYWN0aW9uS2V5XTtcblx0XHRpZiAoYWN0aW9uLnJlcXVpcmVzU2VsZWN0aW9uICYmIGFjdGlvbi52aXNpYmxlPy50b1N0cmluZygpID09PSBcInRydWVcIikge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSk7XG59XG5cbi8qKlxuICogSXRlcmF0ZXMgb3ZlciB0aGUgY3VzdG9tIGFjdGlvbnMgKHdpdGgga2V5IHJlcXVpcmVzU2VsZWN0aW9uKSBkZWNsYXJlZCBpbiB0aGUgbWFuaWZlc3QgZm9yIHRoZSBjdXJyZW50IGxpbmUgaXRlbSBhbmQgcmV0dXJucyBhbGwgdGhlXG4gKiB2aXNpYmxlIGtleSB2YWx1ZXMgYXMgYW4gZXhwcmVzc2lvbi5cbiAqXG4gKiBAcGFyYW0gbWFuaWZlc3RBY3Rpb25zIFRoZSBhY3Rpb25zIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG4gKiBAcmV0dXJucyBBcnJheTxFeHByZXNzaW9uPGJvb2xlYW4+PiBBbGwgdGhlIHZpc2libGUgcGF0aCBleHByZXNzaW9ucyBvZiB0aGUgYWN0aW9ucyB0aGF0IG1lZXQgdGhlIGNyaXRlcmlhXG4gKi9cbmZ1bmN0aW9uIGdldFZpc2libGVFeHBGb3JDdXN0b21BY3Rpb25zUmVxdWlyaW5nQ29udGV4dChtYW5pZmVzdEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSB7XG5cdGNvbnN0IGFWaXNpYmxlUGF0aEV4cHJlc3Npb25zOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSA9IFtdO1xuXHRpZiAobWFuaWZlc3RBY3Rpb25zKSB7XG5cdFx0T2JqZWN0LmtleXMobWFuaWZlc3RBY3Rpb25zKS5mb3JFYWNoKChhY3Rpb25LZXkpID0+IHtcblx0XHRcdGNvbnN0IGFjdGlvbiA9IG1hbmlmZXN0QWN0aW9uc1thY3Rpb25LZXldO1xuXHRcdFx0aWYgKGFjdGlvbi5yZXF1aXJlc1NlbGVjdGlvbiA9PT0gdHJ1ZSAmJiBhY3Rpb24udmlzaWJsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGlmICh0eXBlb2YgYWN0aW9uLnZpc2libGUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHQvKlRoZSBmaW5hbCBhaW0gd291bGQgYmUgdG8gY2hlY2sgaWYgdGhlIHBhdGggZXhwcmVzc2lvbiBkZXBlbmRzIG9uIHRoZSBwYXJlbnQgY29udGV4dFxuXHRcdFx0XHRcdGFuZCBjb25zaWRlcnMgb25seSB0aG9zZSBleHByZXNzaW9ucyBmb3IgdGhlIGV4cHJlc3Npb24gZXZhbHVhdGlvbixcblx0XHRcdFx0XHRidXQgY3VycmVudGx5IG5vdCBwb3NzaWJsZSBmcm9tIHRoZSBtYW5pZmVzdCBhcyB0aGUgdmlzaWJsZSBrZXkgaXMgYm91bmQgb24gdGhlIHBhcmVudCBlbnRpdHkuXG5cdFx0XHRcdFx0VHJpY2t5IHRvIGRpZmZlcmVudGlhdGUgdGhlIHBhdGggYXMgaXQncyBkb25lIGZvciB0aGUgSGlkZGVuIGFubm90YXRpb24uXG5cdFx0XHRcdFx0Rm9yIHRoZSB0aW1lIGJlaW5nIHdlIGNvbnNpZGVyIGFsbCB0aGUgcGF0aHMgb2YgdGhlIG1hbmlmZXN0Ki9cblxuXHRcdFx0XHRcdGFWaXNpYmxlUGF0aEV4cHJlc3Npb25zLnB1c2gocmVzb2x2ZUJpbmRpbmdTdHJpbmcoYWN0aW9uPy52aXNpYmxlPy52YWx1ZU9mKCkpKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhVmlzaWJsZVBhdGhFeHByZXNzaW9ucztcbn1cblxuLyoqXG4gKiBFdmFsdWF0ZSBpZiB0aGUgcGF0aCBpcyBzdGF0aWNhbGx5IGRlbGV0YWJsZSBvciB1cGRhdGFibGUuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSB0YWJsZSBjYXBhYmlsaXRpZXNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldENhcGFiaWxpdHlSZXN0cmljdGlvbihjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogVGFibGVDYXBhYmlsaXR5UmVzdHJpY3Rpb24ge1xuXHRjb25zdCBpc0RlbGV0YWJsZSA9IGlzUGF0aERlbGV0YWJsZShjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSk7XG5cdGNvbnN0IGlzVXBkYXRhYmxlID0gaXNQYXRoVXBkYXRhYmxlKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpKTtcblx0cmV0dXJuIHtcblx0XHRpc0RlbGV0YWJsZTogIShpc0NvbnN0YW50KGlzRGVsZXRhYmxlKSAmJiBpc0RlbGV0YWJsZS52YWx1ZSA9PT0gZmFsc2UpLFxuXHRcdGlzVXBkYXRhYmxlOiAhKGlzQ29uc3RhbnQoaXNVcGRhdGFibGUpICYmIGlzVXBkYXRhYmxlLnZhbHVlID09PSBmYWxzZSlcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFNlbGVjdGlvbk1vZGUoXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGlzRW50aXR5U2V0OiBib29sZWFuLFxuXHR0YXJnZXRDYXBhYmlsaXRpZXM6IFRhYmxlQ2FwYWJpbGl0eVJlc3RyaWN0aW9uLFxuXHRkZWxldGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbj86IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPixcblx0bWFzc0VkaXRWaXNpYmlsaXR5RXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+ID0gY29uc3RhbnQoZmFsc2UpXG4pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRpZiAoIWxpbmVJdGVtQW5ub3RhdGlvbikge1xuXHRcdHJldHVybiBTZWxlY3Rpb25Nb2RlLk5vbmU7XG5cdH1cblx0Y29uc3QgdGFibGVNYW5pZmVzdFNldHRpbmdzID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKTtcblx0bGV0IHNlbGVjdGlvbk1vZGUgPSB0YWJsZU1hbmlmZXN0U2V0dGluZ3MudGFibGVTZXR0aW5ncz8uc2VsZWN0aW9uTW9kZTtcblx0bGV0IGFIaWRkZW5CaW5kaW5nRXhwcmVzc2lvbnM6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPltdID0gW10sXG5cdFx0YVZpc2libGVCaW5kaW5nRXhwcmVzc2lvbnM6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPltdID0gW107XG5cdGNvbnN0IG1hbmlmZXN0QWN0aW9ucyA9IGdldEFjdGlvbnNGcm9tTWFuaWZlc3QoXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uKHZpc3VhbGl6YXRpb25QYXRoKS5hY3Rpb25zLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0W10sXG5cdFx0dW5kZWZpbmVkLFxuXHRcdGZhbHNlXG5cdCk7XG5cdGxldCBpc1BhcmVudERlbGV0YWJsZSwgcGFyZW50RW50aXR5U2V0RGVsZXRhYmxlO1xuXHRpZiAoY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLk9iamVjdFBhZ2UpIHtcblx0XHRpc1BhcmVudERlbGV0YWJsZSA9IGlzUGF0aERlbGV0YWJsZShjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSk7XG5cdFx0cGFyZW50RW50aXR5U2V0RGVsZXRhYmxlID0gaXNQYXJlbnREZWxldGFibGUgPyBjb21waWxlRXhwcmVzc2lvbihpc1BhcmVudERlbGV0YWJsZSwgdHJ1ZSkgOiBpc1BhcmVudERlbGV0YWJsZTtcblx0fVxuXG5cdGNvbnN0IGJNYXNzRWRpdEVuYWJsZWQ6IGJvb2xlYW4gPSAhaXNDb25zdGFudChtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uKSB8fCBtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uLnZhbHVlICE9PSBmYWxzZTtcblx0aWYgKHNlbGVjdGlvbk1vZGUgJiYgc2VsZWN0aW9uTW9kZSA9PT0gU2VsZWN0aW9uTW9kZS5Ob25lICYmIGRlbGV0ZUJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uKSB7XG5cdFx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5PYmplY3RQYWdlICYmIGJNYXNzRWRpdEVuYWJsZWQpIHtcblx0XHRcdC8vIE1hc3MgRWRpdCBpbiBPUCBpcyBlbmFibGVkIG9ubHkgaW4gZWRpdCBtb2RlLlxuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRpZkVsc2UoXG5cdFx0XHRcdFx0YW5kKFVJLklzRWRpdGFibGUsIG1hc3NFZGl0VmlzaWJpbGl0eUV4cHJlc3Npb24pLFxuXHRcdFx0XHRcdGNvbnN0YW50KFwiTXVsdGlcIiksXG5cdFx0XHRcdFx0aWZFbHNlKGRlbGV0ZUJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uLCBjb25zdGFudChcIk11bHRpXCIpLCBjb25zdGFudChcIk5vbmVcIikpXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChiTWFzc0VkaXRFbmFibGVkKSB7XG5cdFx0XHRyZXR1cm4gU2VsZWN0aW9uTW9kZS5NdWx0aTtcblx0XHR9XG5cblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oaWZFbHNlKGRlbGV0ZUJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uLCBjb25zdGFudChcIk11bHRpXCIpLCBjb25zdGFudChcIk5vbmVcIikpKTtcblx0fVxuXHRpZiAoIXNlbGVjdGlvbk1vZGUgfHwgc2VsZWN0aW9uTW9kZSA9PT0gU2VsZWN0aW9uTW9kZS5BdXRvKSB7XG5cdFx0c2VsZWN0aW9uTW9kZSA9IFNlbGVjdGlvbk1vZGUuTXVsdGk7XG5cdH1cblx0aWYgKGJNYXNzRWRpdEVuYWJsZWQpIHtcblx0XHQvLyBPdmVycmlkZSBkZWZhdWx0IHNlbGVjdGlvbiBtb2RlIHdoZW4gbWFzcyBlZGl0IGlzIHZpc2libGVcblx0XHRzZWxlY3Rpb25Nb2RlID0gc2VsZWN0aW9uTW9kZSA9PT0gU2VsZWN0aW9uTW9kZS5TaW5nbGUgPyBTZWxlY3Rpb25Nb2RlLlNpbmdsZSA6IFNlbGVjdGlvbk1vZGUuTXVsdGk7XG5cdH1cblxuXHRpZiAoXG5cdFx0aGFzQm91bmRBY3Rpb25zQWx3YXlzVmlzaWJsZUluVG9vbEJhcihsaW5lSXRlbUFubm90YXRpb24sIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpKSB8fFxuXHRcdGhhc0N1c3RvbUFjdGlvbnNBbHdheXNWaXNpYmxlSW5Ub29sQmFyKG1hbmlmZXN0QWN0aW9ucy5hY3Rpb25zKVxuXHQpIHtcblx0XHRyZXR1cm4gc2VsZWN0aW9uTW9kZTtcblx0fVxuXHRhSGlkZGVuQmluZGluZ0V4cHJlc3Npb25zID0gZ2V0VUlIaWRkZW5FeHBGb3JBY3Rpb25zUmVxdWlyaW5nQ29udGV4dChcblx0XHRsaW5lSXRlbUFubm90YXRpb24sXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCksXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCksXG5cdFx0aXNFbnRpdHlTZXRcblx0KTtcblx0YVZpc2libGVCaW5kaW5nRXhwcmVzc2lvbnMgPSBnZXRWaXNpYmxlRXhwRm9yQ3VzdG9tQWN0aW9uc1JlcXVpcmluZ0NvbnRleHQobWFuaWZlc3RBY3Rpb25zLmFjdGlvbnMpO1xuXG5cdC8vIE5vIGFjdGlvbiByZXF1aXJpbmcgYSBjb250ZXh0OlxuXHRpZiAoXG5cdFx0YUhpZGRlbkJpbmRpbmdFeHByZXNzaW9ucy5sZW5ndGggPT09IDAgJiZcblx0XHRhVmlzaWJsZUJpbmRpbmdFeHByZXNzaW9ucy5sZW5ndGggPT09IDAgJiZcblx0XHQoZGVsZXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24gfHwgYk1hc3NFZGl0RW5hYmxlZClcblx0KSB7XG5cdFx0aWYgKCFpc0VudGl0eVNldCkge1xuXHRcdFx0Ly8gRXhhbXBsZTogT1AgY2FzZVxuXHRcdFx0aWYgKHRhcmdldENhcGFiaWxpdGllcy5pc0RlbGV0YWJsZSB8fCBwYXJlbnRFbnRpdHlTZXREZWxldGFibGUgIT09IFwiZmFsc2VcIiB8fCBiTWFzc0VkaXRFbmFibGVkKSB7XG5cdFx0XHRcdC8vIEJ1aWxkaW5nIGV4cHJlc3Npb24gZm9yIGRlbGV0ZSBhbmQgbWFzcyBlZGl0XG5cdFx0XHRcdGNvbnN0IGJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uID0gb3IoXG5cdFx0XHRcdFx0ZGVsZXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24gfHwgdHJ1ZSwgLy8gZGVmYXVsdCBkZWxldGUgdmlzaWJpbGl0eSBhcyB0cnVlXG5cdFx0XHRcdFx0bWFzc0VkaXRWaXNpYmlsaXR5RXhwcmVzc2lvblxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFx0aWZFbHNlKGFuZChVSS5Jc0VkaXRhYmxlLCBidXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiksIGNvbnN0YW50KHNlbGVjdGlvbk1vZGUpLCBjb25zdGFudChTZWxlY3Rpb25Nb2RlLk5vbmUpKVxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFNlbGVjdGlvbk1vZGUuTm9uZTtcblx0XHRcdH1cblx0XHRcdC8vIEVudGl0eVNldCBkZWxldGFibGU6XG5cdFx0fSBlbHNlIGlmIChiTWFzc0VkaXRFbmFibGVkKSB7XG5cdFx0XHQvLyBleGFtcGxlOiBMUiBzY2VuYXJpb1xuXHRcdFx0cmV0dXJuIHNlbGVjdGlvbk1vZGU7XG5cdFx0fSBlbHNlIGlmICh0YXJnZXRDYXBhYmlsaXRpZXMuaXNEZWxldGFibGUgJiYgZGVsZXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24pIHtcblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihpZkVsc2UoZGVsZXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24sIGNvbnN0YW50KHNlbGVjdGlvbk1vZGUpLCBjb25zdGFudChcIk5vbmVcIikpKTtcblx0XHRcdC8vIEVudGl0eVNldCBub3QgZGVsZXRhYmxlOlxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gU2VsZWN0aW9uTW9kZS5Ob25lO1xuXHRcdH1cblx0XHQvLyBUaGVyZSBhcmUgYWN0aW9ucyByZXF1aXJpbmcgYSBjb250ZXh0OlxuXHR9IGVsc2UgaWYgKCFpc0VudGl0eVNldCkge1xuXHRcdC8vIEV4YW1wbGU6IE9QIGNhc2Vcblx0XHRpZiAodGFyZ2V0Q2FwYWJpbGl0aWVzLmlzRGVsZXRhYmxlIHx8IHBhcmVudEVudGl0eVNldERlbGV0YWJsZSAhPT0gXCJmYWxzZVwiIHx8IGJNYXNzRWRpdEVuYWJsZWQpIHtcblx0XHRcdC8vIFVzZSBzZWxlY3Rpb25Nb2RlIGluIGVkaXQgbW9kZSBpZiBkZWxldGUgaXMgZW5hYmxlZCBvciBtYXNzIGVkaXQgaXMgdmlzaWJsZVxuXHRcdFx0Y29uc3QgZWRpdE1vZGVidXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiA9IGlmRWxzZShcblx0XHRcdFx0Yk1hc3NFZGl0RW5hYmxlZCAmJiAhdGFyZ2V0Q2FwYWJpbGl0aWVzLmlzRGVsZXRhYmxlLFxuXHRcdFx0XHRtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uLFxuXHRcdFx0XHRjb25zdGFudCh0cnVlKVxuXHRcdFx0KTtcblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRcdGFuZChVSS5Jc0VkaXRhYmxlLCBlZGl0TW9kZWJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uKSxcblx0XHRcdFx0XHRjb25zdGFudChzZWxlY3Rpb25Nb2RlKSxcblx0XHRcdFx0XHRpZkVsc2UoXG5cdFx0XHRcdFx0XHRvciguLi5hSGlkZGVuQmluZGluZ0V4cHJlc3Npb25zLmNvbmNhdChhVmlzaWJsZUJpbmRpbmdFeHByZXNzaW9ucykpLFxuXHRcdFx0XHRcdFx0Y29uc3RhbnQoc2VsZWN0aW9uTW9kZSksXG5cdFx0XHRcdFx0XHRjb25zdGFudChTZWxlY3Rpb25Nb2RlLk5vbmUpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdGlmRWxzZShcblx0XHRcdFx0XHRvciguLi5hSGlkZGVuQmluZGluZ0V4cHJlc3Npb25zLmNvbmNhdChhVmlzaWJsZUJpbmRpbmdFeHByZXNzaW9ucykpLFxuXHRcdFx0XHRcdGNvbnN0YW50KHNlbGVjdGlvbk1vZGUpLFxuXHRcdFx0XHRcdGNvbnN0YW50KFNlbGVjdGlvbk1vZGUuTm9uZSlcblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0XHR9XG5cdFx0Ly9FbnRpdHlTZXQgZGVsZXRhYmxlOlxuXHR9IGVsc2UgaWYgKHRhcmdldENhcGFiaWxpdGllcy5pc0RlbGV0YWJsZSB8fCBiTWFzc0VkaXRFbmFibGVkKSB7XG5cdFx0Ly8gRXhhbXBsZTogTFIgc2NlbmFyaW9cblx0XHRyZXR1cm4gc2VsZWN0aW9uTW9kZTtcblx0XHQvL0VudGl0eVNldCBub3QgZGVsZXRhYmxlOlxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdGlmRWxzZShcblx0XHRcdFx0b3IoLi4uYUhpZGRlbkJpbmRpbmdFeHByZXNzaW9ucy5jb25jYXQoYVZpc2libGVCaW5kaW5nRXhwcmVzc2lvbnMpLCBtYXNzRWRpdFZpc2liaWxpdHlFeHByZXNzaW9uKSxcblx0XHRcdFx0Y29uc3RhbnQoc2VsZWN0aW9uTW9kZSksXG5cdFx0XHRcdGNvbnN0YW50KFNlbGVjdGlvbk1vZGUuTm9uZSlcblx0XHRcdClcblx0XHQpO1xuXHR9XG59XG5cbi8qKlxuICogTWV0aG9kIHRvIHJldHJpZXZlIGFsbCB0YWJsZSBhY3Rpb25zIGZyb20gYW5ub3RhdGlvbnMuXG4gKlxuICogQHBhcmFtIGxpbmVJdGVtQW5ub3RhdGlvblxuICogQHBhcmFtIHZpc3VhbGl6YXRpb25QYXRoXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dFxuICogQHJldHVybnMgVGhlIHRhYmxlIGFubm90YXRpb24gYWN0aW9uc1xuICovXG5mdW5jdGlvbiBnZXRUYWJsZUFubm90YXRpb25BY3Rpb25zKGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0sIHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpIHtcblx0Y29uc3QgdGFibGVBY3Rpb25zOiBCYXNlQWN0aW9uW10gPSBbXTtcblx0Y29uc3QgaGlkZGVuVGFibGVBY3Rpb25zOiBCYXNlQWN0aW9uW10gPSBbXTtcblx0aWYgKGxpbmVJdGVtQW5ub3RhdGlvbikge1xuXHRcdGxpbmVJdGVtQW5ub3RhdGlvbi5mb3JFYWNoKChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpID0+IHtcblx0XHRcdGxldCB0YWJsZUFjdGlvbjogQW5ub3RhdGlvbkFjdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRcdGlmIChcblx0XHRcdFx0aXNEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdChkYXRhRmllbGQpICYmXG5cdFx0XHRcdCEoZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgPT09IHRydWUpICYmXG5cdFx0XHRcdCFkYXRhRmllbGQuSW5saW5lICYmXG5cdFx0XHRcdCFkYXRhRmllbGQuRGV0ZXJtaW5pbmdcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBrZXkgPSBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCk7XG5cdFx0XHRcdHN3aXRjaCAoZGF0YUZpZWxkLiRUeXBlKSB7XG5cdFx0XHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiOlxuXHRcdFx0XHRcdFx0dGFibGVBY3Rpb24gPSB7XG5cdFx0XHRcdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGRhdGFGaWVsZC5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdFx0XHRcdFx0XHRrZXk6IGtleSxcblx0XHRcdFx0XHRcdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFx0XHRcdFx0bm90KFxuXHRcdFx0XHRcdFx0XHRcdFx0ZXF1YWwoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0W10sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0UmVsYXRpdmVNb2RlbFBhdGhGdW5jdGlvbigpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRydWVcblx0XHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XHRcdGlzTmF2aWdhYmxlOiB0cnVlXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCI6XG5cdFx0XHRcdFx0XHR0YWJsZUFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0dHlwZTogQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoZGF0YUZpZWxkLmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdFx0XHRcdGtleToga2V5LFxuXHRcdFx0XHRcdFx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0XHRcdFx0XHRub3QoXG5cdFx0XHRcdFx0XHRcdFx0XHRlcXVhbChcblx0XHRcdFx0XHRcdFx0XHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbixcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRbXSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRSZWxhdGl2ZU1vZGVsUGF0aEZ1bmN0aW9uKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0dHJ1ZVxuXHRcdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRoaWRkZW5UYWJsZUFjdGlvbnMucHVzaCh7XG5cdFx0XHRcdFx0dHlwZTogQWN0aW9uVHlwZS5EZWZhdWx0LFxuXHRcdFx0XHRcdGtleTogS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRhYmxlQWN0aW9uKSB7XG5cdFx0XHRcdHRhYmxlQWN0aW9ucy5wdXNoKHRhYmxlQWN0aW9uKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdHRhYmxlQWN0aW9uczogdGFibGVBY3Rpb25zLFxuXHRcdGhpZGRlblRhYmxlQWN0aW9uczogaGlkZGVuVGFibGVBY3Rpb25zXG5cdH07XG59XG5cbmZ1bmN0aW9uIGdldEhpZ2hsaWdodFJvd0JpbmRpbmcoXG5cdGNyaXRpY2FsaXR5QW5ub3RhdGlvbjogUGF0aEFubm90YXRpb25FeHByZXNzaW9uPENyaXRpY2FsaXR5VHlwZT4gfCBFbnVtVmFsdWU8Q3JpdGljYWxpdHlUeXBlPiB8IHVuZGVmaW5lZCxcblx0aXNEcmFmdFJvb3Q6IGJvb2xlYW4sXG5cdHRhcmdldEVudGl0eVR5cGU/OiBFbnRpdHlUeXBlXG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248TWVzc2FnZVR5cGU+IHtcblx0bGV0IGRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uOiBNZXNzYWdlVHlwZSB8IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxNZXNzYWdlVHlwZT4gPSBNZXNzYWdlVHlwZS5Ob25lO1xuXHRpZiAoY3JpdGljYWxpdHlBbm5vdGF0aW9uKSB7XG5cdFx0aWYgKHR5cGVvZiBjcml0aWNhbGl0eUFubm90YXRpb24gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGNyaXRpY2FsaXR5QW5ub3RhdGlvbikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPE1lc3NhZ2VUeXBlPjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gRW51bSBWYWx1ZSBzbyB3ZSBnZXQgdGhlIGNvcnJlc3BvbmRpbmcgc3RhdGljIHBhcnRcblx0XHRcdGRlZmF1bHRIaWdobGlnaHRSb3dEZWZpbml0aW9uID0gZ2V0TWVzc2FnZVR5cGVGcm9tQ3JpdGljYWxpdHlUeXBlKGNyaXRpY2FsaXR5QW5ub3RhdGlvbik7XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgYU1pc3NpbmdLZXlzOiBhbnlbXSA9IFtdO1xuXHR0YXJnZXRFbnRpdHlUeXBlPy5rZXlzLmZvckVhY2goKGtleTogYW55KSA9PiB7XG5cdFx0aWYgKGtleS5uYW1lICE9PSBcIklzQWN0aXZlRW50aXR5XCIpIHtcblx0XHRcdGFNaXNzaW5nS2V5cy5wdXNoKHBhdGhJbk1vZGVsKGtleS5uYW1lLCB1bmRlZmluZWQpKTtcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBmb3JtYXRSZXN1bHQoXG5cdFx0W1xuXHRcdFx0ZGVmYXVsdEhpZ2hsaWdodFJvd0RlZmluaXRpb24sXG5cdFx0XHRwYXRoSW5Nb2RlbChgZmlsdGVyZWRNZXNzYWdlc2AsIFwiaW50ZXJuYWxcIiksXG5cdFx0XHRpc0RyYWZ0Um9vdCAmJiBFbnRpdHkuSGFzQWN0aXZlLFxuXHRcdFx0aXNEcmFmdFJvb3QgJiYgRW50aXR5LklzQWN0aXZlLFxuXHRcdFx0YCR7aXNEcmFmdFJvb3R9YCxcblx0XHRcdC4uLmFNaXNzaW5nS2V5c1xuXHRcdF0sXG5cdFx0dGFibGVGb3JtYXR0ZXJzLnJvd0hpZ2hsaWdodGluZyxcblx0XHR0YXJnZXRFbnRpdHlUeXBlXG5cdCk7XG59XG5cbmZ1bmN0aW9uIF9nZXRDcmVhdGlvbkJlaGF2aW91cihcblx0bGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSB8IHVuZGVmaW5lZCxcblx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb246IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdG5hdmlnYXRpb25TZXR0aW5nczogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZ1xuKTogVGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbltcImNyZWF0ZVwiXSB7XG5cdGNvbnN0IG5hdmlnYXRpb24gPSBuYXZpZ2F0aW9uU2V0dGluZ3M/LmNyZWF0ZSB8fCBuYXZpZ2F0aW9uU2V0dGluZ3M/LmRldGFpbDtcblx0Y29uc3QgdGFibGVNYW5pZmVzdFNldHRpbmdzOiBUYWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbiA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IG9yaWdpbmFsVGFibGVTZXR0aW5ncyA9ICh0YWJsZU1hbmlmZXN0U2V0dGluZ3MgJiYgdGFibGVNYW5pZmVzdFNldHRpbmdzLnRhYmxlU2V0dGluZ3MpIHx8IHt9O1xuXHQvLyBjcm9zcy1hcHBcblx0aWYgKG5hdmlnYXRpb24/Lm91dGJvdW5kICYmIG5hdmlnYXRpb24ub3V0Ym91bmREZXRhaWwgJiYgbmF2aWdhdGlvblNldHRpbmdzPy5jcmVhdGUpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0bW9kZTogXCJFeHRlcm5hbFwiLFxuXHRcdFx0b3V0Ym91bmQ6IG5hdmlnYXRpb24ub3V0Ym91bmQsXG5cdFx0XHRvdXRib3VuZERldGFpbDogbmF2aWdhdGlvbi5vdXRib3VuZERldGFpbCxcblx0XHRcdG5hdmlnYXRpb25TZXR0aW5nczogbmF2aWdhdGlvblNldHRpbmdzXG5cdFx0fTtcblx0fVxuXG5cdGxldCBuZXdBY3Rpb247XG5cdGlmIChsaW5lSXRlbUFubm90YXRpb24pIHtcblx0XHQvLyBpbi1hcHBcblx0XHRjb25zdCB0YXJnZXRBbm5vdGF0aW9ucyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk/LmFubm90YXRpb25zO1xuXHRcdGNvbnN0IHRhcmdldEFubm90YXRpb25zQ29tbW9uID0gdGFyZ2V0QW5ub3RhdGlvbnM/LkNvbW1vbiBhcyBFbnRpdHlTZXRBbm5vdGF0aW9uc19Db21tb24sXG5cdFx0XHR0YXJnZXRBbm5vdGF0aW9uc1Nlc3Npb24gPSB0YXJnZXRBbm5vdGF0aW9ucz8uU2Vzc2lvbiBhcyBFbnRpdHlTZXRBbm5vdGF0aW9uc19TZXNzaW9uO1xuXHRcdG5ld0FjdGlvbiA9IHRhcmdldEFubm90YXRpb25zQ29tbW9uPy5EcmFmdFJvb3Q/Lk5ld0FjdGlvbiB8fCB0YXJnZXRBbm5vdGF0aW9uc1Nlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQ/Lk5ld0FjdGlvbjtcblxuXHRcdGlmICh0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5DcmVhdGlvblJvdyAmJiBuZXdBY3Rpb24pIHtcblx0XHRcdC8vIEEgY29tYmluYXRpb24gb2YgJ0NyZWF0aW9uUm93JyBhbmQgJ05ld0FjdGlvbicgZG9lcyBub3QgbWFrZSBzZW5zZVxuXHRcdFx0dGhyb3cgRXJyb3IoYENyZWF0aW9uIG1vZGUgJyR7Q3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93fScgY2FuIG5vdCBiZSB1c2VkIHdpdGggYSBjdXN0b20gJ25ldycgYWN0aW9uICgke25ld0FjdGlvbn0pYCk7XG5cdFx0fVxuXHRcdGlmIChuYXZpZ2F0aW9uPy5yb3V0ZSkge1xuXHRcdFx0Ly8gcm91dGUgc3BlY2lmaWVkXG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRtb2RlOiB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUsXG5cdFx0XHRcdGFwcGVuZDogdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRlQXRFbmQsXG5cdFx0XHRcdG5ld0FjdGlvbjogbmV3QWN0aW9uPy50b1N0cmluZygpLFxuXHRcdFx0XHRuYXZpZ2F0ZVRvVGFyZ2V0OiB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5OZXdQYWdlID8gbmF2aWdhdGlvbi5yb3V0ZSA6IHVuZGVmaW5lZCAvLyBuYXZpZ2F0ZSBvbmx5IGluIE5ld1BhZ2UgbW9kZVxuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHQvLyBubyBuYXZpZ2F0aW9uIG9yIG5vIHJvdXRlIHNwZWNpZmllZCAtIGZhbGxiYWNrIHRvIGlubGluZSBjcmVhdGUgaWYgb3JpZ2luYWwgY3JlYXRpb24gbW9kZSB3YXMgJ05ld1BhZ2UnXG5cdGlmICh0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi5jcmVhdGlvbk1vZGUgPT09IENyZWF0aW9uTW9kZS5OZXdQYWdlKSB7XG5cdFx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRpb25Nb2RlID0gQ3JlYXRpb25Nb2RlLklubGluZTtcblx0XHQvLyBJbiBjYXNlIHRoZXJlIHdhcyBubyBzcGVjaWZpYyBjb25maWd1cmF0aW9uIGZvciB0aGUgY3JlYXRlQXRFbmQgd2UgZm9yY2UgaXQgdG8gZmFsc2Vcblx0XHRpZiAob3JpZ2luYWxUYWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uY3JlYXRlQXRFbmQgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24uY3JlYXRlQXRFbmQgPSBmYWxzZTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdG1vZGU6IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0aW9uTW9kZSxcblx0XHRhcHBlbmQ6IHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLmNyZWF0ZUF0RW5kLFxuXHRcdG5ld0FjdGlvbjogbmV3QWN0aW9uPy50b1N0cmluZygpXG5cdH07XG59XG5cbmNvbnN0IF9nZXRSb3dDb25maWd1cmF0aW9uUHJvcGVydHkgPSBmdW5jdGlvbiAoXG5cdGxpbmVJdGVtQW5ub3RhdGlvbjogTGluZUl0ZW0gfCB1bmRlZmluZWQsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdG5hdmlnYXRpb25TZXR0aW5nczogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0dGFyZ2V0UGF0aDogc3RyaW5nXG4pIHtcblx0bGV0IHByZXNzUHJvcGVydHksIG5hdmlnYXRpb25UYXJnZXQ7XG5cdGxldCBjcml0aWNhbGl0eVByb3BlcnR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248TWVzc2FnZVR5cGU+ID0gY29uc3RhbnQoTWVzc2FnZVR5cGUuTm9uZSk7XG5cdGNvbnN0IHRhcmdldEVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0aWYgKG5hdmlnYXRpb25TZXR0aW5ncyAmJiBsaW5lSXRlbUFubm90YXRpb24pIHtcblx0XHRuYXZpZ2F0aW9uVGFyZ2V0ID0gbmF2aWdhdGlvblNldHRpbmdzLmRpc3BsYXk/LnRhcmdldCB8fCBuYXZpZ2F0aW9uU2V0dGluZ3MuZGV0YWlsPy5vdXRib3VuZDtcblx0XHRjb25zdCB0YXJnZXRFbnRpdHlTZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpO1xuXHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBnZXRIaWdobGlnaHRSb3dCaW5kaW5nKFxuXHRcdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLmFubm90YXRpb25zPy5VST8uQ3JpdGljYWxpdHksXG5cdFx0XHQhIU1vZGVsSGVscGVyLmdldERyYWZ0Um9vdCh0YXJnZXRFbnRpdHlTZXQpIHx8ICEhTW9kZWxIZWxwZXIuZ2V0RHJhZnROb2RlKHRhcmdldEVudGl0eVNldCksXG5cdFx0XHR0YXJnZXRFbnRpdHlUeXBlXG5cdFx0KTtcblx0XHRpZiAobmF2aWdhdGlvblRhcmdldCkge1xuXHRcdFx0cHJlc3NQcm9wZXJ0eSA9XG5cdFx0XHRcdFwiLmhhbmRsZXJzLm9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZCggJGNvbnRyb2xsZXIgLCdcIiArIG5hdmlnYXRpb25UYXJnZXQgKyBcIicsICR7JHBhcmFtZXRlcnM+YmluZGluZ0NvbnRleHR9KVwiO1xuXHRcdH0gZWxzZSBpZiAodGFyZ2V0RW50aXR5VHlwZSkge1xuXHRcdFx0bmF2aWdhdGlvblRhcmdldCA9IG5hdmlnYXRpb25TZXR0aW5ncy5kZXRhaWw/LnJvdXRlO1xuXHRcdFx0aWYgKG5hdmlnYXRpb25UYXJnZXQgJiYgIU1vZGVsSGVscGVyLmlzU2luZ2xldG9uKHRhcmdldEVudGl0eVNldCkpIHtcblx0XHRcdFx0Y3JpdGljYWxpdHlQcm9wZXJ0eSA9IGdldEhpZ2hsaWdodFJvd0JpbmRpbmcoXG5cdFx0XHRcdFx0bGluZUl0ZW1Bbm5vdGF0aW9uLmFubm90YXRpb25zPy5VST8uQ3JpdGljYWxpdHksXG5cdFx0XHRcdFx0ISFNb2RlbEhlbHBlci5nZXREcmFmdFJvb3QodGFyZ2V0RW50aXR5U2V0KSB8fCAhIU1vZGVsSGVscGVyLmdldERyYWZ0Tm9kZSh0YXJnZXRFbnRpdHlTZXQpLFxuXHRcdFx0XHRcdHRhcmdldEVudGl0eVR5cGVcblx0XHRcdFx0KTtcblx0XHRcdFx0cHJlc3NQcm9wZXJ0eSA9XG5cdFx0XHRcdFx0XCJBUEkub25UYWJsZVJvd1ByZXNzKCRldmVudCwgJGNvbnRyb2xsZXIsICR7JHBhcmFtZXRlcnM+YmluZGluZ0NvbnRleHR9LCB7IGNhbGxFeHRlbnNpb246IHRydWUsIHRhcmdldFBhdGg6ICdcIiArXG5cdFx0XHRcdFx0dGFyZ2V0UGF0aCArXG5cdFx0XHRcdFx0XCInLCBlZGl0YWJsZSA6IFwiICtcblx0XHRcdFx0XHQoTW9kZWxIZWxwZXIuZ2V0RHJhZnRSb290KHRhcmdldEVudGl0eVNldCkgfHwgTW9kZWxIZWxwZXIuZ2V0RHJhZnROb2RlKHRhcmdldEVudGl0eVNldClcblx0XHRcdFx0XHRcdD8gXCIhJHskcGFyYW1ldGVycz5iaW5kaW5nQ29udGV4dH0uZ2V0UHJvcGVydHkoJ0lzQWN0aXZlRW50aXR5JylcIlxuXHRcdFx0XHRcdFx0OiBcInVuZGVmaW5lZFwiKSArXG5cdFx0XHRcdFx0XCJ9KVwiOyAvL05lZWQgdG8gYWNjZXNzIHRvIERyYWZ0Um9vdCBhbmQgRHJhZnROb2RlICEhISEhISFcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNyaXRpY2FsaXR5UHJvcGVydHkgPSBnZXRIaWdobGlnaHRSb3dCaW5kaW5nKGxpbmVJdGVtQW5ub3RhdGlvbi5hbm5vdGF0aW9ucz8uVUk/LkNyaXRpY2FsaXR5LCBmYWxzZSwgdGFyZ2V0RW50aXR5VHlwZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdGNvbnN0IHJvd05hdmlnYXRlZEV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiA9IGZvcm1hdFJlc3VsdChcblx0XHRbcGF0aEluTW9kZWwoXCIvZGVlcGVzdFBhdGhcIiwgXCJpbnRlcm5hbFwiKV0sXG5cdFx0dGFibGVGb3JtYXR0ZXJzLm5hdmlnYXRlZFJvdyxcblx0XHR0YXJnZXRFbnRpdHlUeXBlXG5cdCk7XG5cdHJldHVybiB7XG5cdFx0cHJlc3M6IHByZXNzUHJvcGVydHksXG5cdFx0YWN0aW9uOiBwcmVzc1Byb3BlcnR5ID8gXCJOYXZpZ2F0aW9uXCIgOiB1bmRlZmluZWQsXG5cdFx0cm93SGlnaGxpZ2h0aW5nOiBjb21waWxlRXhwcmVzc2lvbihjcml0aWNhbGl0eVByb3BlcnR5KSxcblx0XHRyb3dOYXZpZ2F0ZWQ6IGNvbXBpbGVFeHByZXNzaW9uKHJvd05hdmlnYXRlZEV4cHJlc3Npb24pLFxuXHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKG5vdChVSS5Jc0luYWN0aXZlKSlcblx0fTtcbn07XG5cbi8qKlxuICogUmV0cmlldmUgdGhlIGNvbHVtbnMgZnJvbSB0aGUgZW50aXR5VHlwZS5cbiAqXG4gKiBAcGFyYW0gY29sdW1uc1RvQmVDcmVhdGVkIFRoZSBjb2x1bW5zIHRvIGJlIGNyZWF0ZWQuXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgdGFyZ2V0IGVudGl0eSB0eXBlLlxuICogQHBhcmFtIGFubm90YXRpb25Db2x1bW5zIFRoZSBhcnJheSBvZiBjb2x1bW5zIGNyZWF0ZWQgYmFzZWQgb24gTGluZUl0ZW0gYW5ub3RhdGlvbnMuXG4gKiBAcGFyYW0gbm9uU29ydGFibGVDb2x1bW5zIFRoZSBhcnJheSBvZiBhbGwgbm9uIHNvcnRhYmxlIGNvbHVtbiBuYW1lcy5cbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dC5cbiAqIEBwYXJhbSB0YWJsZVR5cGUgVGhlIHRhYmxlIHR5cGUuXG4gKiBAcGFyYW0gdGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uIFRoZSBhcnJheSBvZiBjb2x1bW5zIGZyb20gYSBwcm9wZXJ0eSB1c2luZyBhIHRleHQgYW5ub3RhdGlvbiB3aXRoIHRleHRPbmx5IGFzIHRleHQgYXJyYW5nZW1lbnQuXG4gKiBAcmV0dXJucyBUaGUgY29sdW1uIGZyb20gdGhlIGVudGl0eVR5cGVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldENvbHVtbnNGcm9tRW50aXR5VHlwZSA9IGZ1bmN0aW9uIChcblx0Y29sdW1uc1RvQmVDcmVhdGVkOiBSZWNvcmQ8c3RyaW5nLCBQcm9wZXJ0eT4sXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdGFubm90YXRpb25Db2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSA9IFtdLFxuXHRub25Tb3J0YWJsZUNvbHVtbnM6IHN0cmluZ1tdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHR0YWJsZVR5cGU6IFRhYmxlVHlwZSxcblx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uOiBzdHJpbmdbXVxuKTogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10ge1xuXHRjb25zdCB0YWJsZUNvbHVtbnM6IEFubm90YXRpb25UYWJsZUNvbHVtbltdID0gYW5ub3RhdGlvbkNvbHVtbnM7XG5cdC8vIENhdGNoIGFscmVhZHkgZXhpc3RpbmcgY29sdW1ucyAtIHdoaWNoIHdlcmUgYWRkZWQgYmVmb3JlIGJ5IExpbmVJdGVtIEFubm90YXRpb25zXG5cdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0eTogUHJvcGVydHkpID0+IHtcblx0XHQvLyBDYXRjaCBhbHJlYWR5IGV4aXN0aW5nIGNvbHVtbnMgLSB3aGljaCB3ZXJlIGFkZGVkIGJlZm9yZSBieSBMaW5lSXRlbSBBbm5vdGF0aW9uc1xuXHRcdGNvbnN0IGV4aXN0cyA9IGFubm90YXRpb25Db2x1bW5zLnNvbWUoKGNvbHVtbikgPT4ge1xuXHRcdFx0cmV0dXJuIGNvbHVtbi5uYW1lID09PSBwcm9wZXJ0eS5uYW1lO1xuXHRcdH0pO1xuXG5cdFx0Ly8gaWYgdGFyZ2V0IHR5cGUgZXhpc3RzLCBpdCBpcyBhIGNvbXBsZXggcHJvcGVydHkgYW5kIHNob3VsZCBiZSBpZ25vcmVkXG5cdFx0aWYgKCFwcm9wZXJ0eS50YXJnZXRUeXBlICYmICFleGlzdHMpIHtcblx0XHRcdGNvbnN0IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mbzogQ29tcGxleFByb3BlcnR5SW5mbyA9IGNvbGxlY3RSZWxhdGVkUHJvcGVydGllcyhcblx0XHRcdFx0cHJvcGVydHkubmFtZSxcblx0XHRcdFx0cHJvcGVydHksXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdHRydWUsXG5cdFx0XHRcdHRhYmxlVHlwZVxuXHRcdFx0KTtcblx0XHRcdGNvbnN0IHJlbGF0ZWRQcm9wZXJ0eU5hbWVzOiBzdHJpbmdbXSA9IE9iamVjdC5rZXlzKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5wcm9wZXJ0aWVzKTtcblx0XHRcdGNvbnN0IGFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVzOiBzdHJpbmdbXSA9IE9iamVjdC5rZXlzKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5hZGRpdGlvbmFsUHJvcGVydGllcyk7XG5cdFx0XHRpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLnRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdC8vIEluY2x1ZGUgdGV4dCBwcm9wZXJ0aWVzIGZvdW5kIGR1cmluZyBhbmFseXNpcyBvbiBnZXRDb2x1bW5zRnJvbUFubm90YXRpb25zXG5cdFx0XHRcdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbi5wdXNoKC4uLnJlbGF0ZWRQcm9wZXJ0aWVzSW5mby50ZXh0T25seVByb3BlcnRpZXNGcm9tVGV4dEFubm90YXRpb24pO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgY29sdW1uSW5mbyA9IGdldENvbHVtbkRlZmluaXRpb25Gcm9tUHJvcGVydHkoXG5cdFx0XHRcdHByb3BlcnR5LFxuXHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgocHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0cHJvcGVydHkubmFtZSxcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0bm9uU29ydGFibGVDb2x1bW5zLFxuXHRcdFx0XHRhZ2dyZWdhdGlvbkhlbHBlcixcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uXG5cdFx0XHQpO1xuXG5cdFx0XHRjb25zdCBzZW1hbnRpY0tleXMgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25zQnlUZXJtKFwiQ29tbW9uXCIsIENvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY0tleSwgW1xuXHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKVxuXHRcdFx0XSlbMF07XG5cdFx0XHRjb25zdCBvQ29sdW1uRHJhZnRJbmRpY2F0b3IgPSBnZXREZWZhdWx0RHJhZnRJbmRpY2F0b3JGb3JDb2x1bW4oY29sdW1uSW5mby5uYW1lLCBzZW1hbnRpY0tleXMsIGZhbHNlLCBudWxsKTtcblx0XHRcdGlmIChPYmplY3Qua2V5cyhvQ29sdW1uRHJhZnRJbmRpY2F0b3IpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y29sdW1uSW5mby5mb3JtYXRPcHRpb25zID0ge1xuXHRcdFx0XHRcdC4uLm9Db2x1bW5EcmFmdEluZGljYXRvclxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0eU5hbWVzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y29sdW1uSW5mby5wcm9wZXJ0eUluZm9zID0gcmVsYXRlZFByb3BlcnR5TmFtZXM7XG5cdFx0XHRcdGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MgPSB7XG5cdFx0XHRcdFx0Li4uY29sdW1uSW5mby5leHBvcnRTZXR0aW5ncyxcblx0XHRcdFx0XHR0ZW1wbGF0ZTogcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFNldHRpbmdzVGVtcGxhdGUsXG5cdFx0XHRcdFx0d3JhcDogcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFNldHRpbmdzV3JhcHBpbmdcblx0XHRcdFx0fTtcblx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy50eXBlID0gX2dldEV4cG9ydERhdGFUeXBlKHByb3BlcnR5LnR5cGUsIHJlbGF0ZWRQcm9wZXJ0eU5hbWVzLmxlbmd0aCA+IDEpO1xuXG5cdFx0XHRcdGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VW5pdE5hbWUpIHtcblx0XHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLnVuaXRQcm9wZXJ0eSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRVbml0TmFtZTtcblx0XHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLnR5cGUgPSBcIkN1cnJlbmN5XCI7IC8vIEZvcmNlIHRvIGEgY3VycmVuY3kgYmVjYXVzZSB0aGVyZSdzIGEgdW5pdFByb3BlcnR5IChvdGhlcndpc2UgdGhlIHZhbHVlIGlzbid0IHByb3Blcmx5IGZvcm1hdHRlZCB3aGVuIGV4cG9ydGVkKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRVbml0U3RyaW5nKSB7XG5cdFx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy51bml0ID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXRTdHJpbmc7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRUaW1lem9uZU5hbWUpIHtcblx0XHRcdFx0XHRjb2x1bW5JbmZvLmV4cG9ydFNldHRpbmdzLnRpbWV6b25lUHJvcGVydHkgPSByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VGltZXpvbmVOYW1lO1xuXHRcdFx0XHRcdGNvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudXRjID0gZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSBpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFRpbWV6b25lU3RyaW5nKSB7XG5cdFx0XHRcdFx0Y29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy50aW1lem9uZSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRUaW1lem9uZVN0cmluZztcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIENvbGxlY3QgaW5mb3JtYXRpb24gb2YgcmVsYXRlZCBjb2x1bW5zIHRvIGJlIGNyZWF0ZWQuXG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0eU5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcblx0XHRcdFx0XHRjb2x1bW5zVG9CZUNyZWF0ZWRbbmFtZV0gPSByZWxhdGVkUHJvcGVydGllc0luZm8ucHJvcGVydGllc1tuYW1lXTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhZGRpdGlvbmFsUHJvcGVydHlOYW1lcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGNvbHVtbkluZm8uYWRkaXRpb25hbFByb3BlcnR5SW5mb3MgPSBhZGRpdGlvbmFsUHJvcGVydHlOYW1lcztcblx0XHRcdFx0Ly8gQ3JlYXRlIGNvbHVtbnMgZm9yIGFkZGl0aW9uYWwgcHJvcGVydGllcyBpZGVudGlmaWVkIGZvciBBTFAgdXNlIGNhc2UuXG5cdFx0XHRcdGFkZGl0aW9uYWxQcm9wZXJ0eU5hbWVzLmZvckVhY2goKG5hbWUpID0+IHtcblx0XHRcdFx0XHQvLyBJbnRlbnRpb25hbCBvdmVyd3JpdGUgYXMgd2UgcmVxdWlyZSBvbmx5IG9uZSBuZXcgUHJvcGVydHlJbmZvIGZvciBhIHJlbGF0ZWQgUHJvcGVydHkuXG5cdFx0XHRcdFx0Y29sdW1uc1RvQmVDcmVhdGVkW25hbWVdID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmFkZGl0aW9uYWxQcm9wZXJ0aWVzW25hbWVdO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHRhYmxlQ29sdW1ucy5wdXNoKGNvbHVtbkluZm8pO1xuXHRcdH1cblx0XHQvLyBJbiBjYXNlIGEgcHJvcGVydHkgaGFzIGRlZmluZWQgYSAjVGV4dE9ubHkgdGV4dCBhcnJhbmdlbWVudCBkb24ndCBvbmx5IGNyZWF0ZSB0aGUgY29tcGxleCBwcm9wZXJ0eSB3aXRoIHRoZSB0ZXh0IHByb3BlcnR5IGFzIGEgY2hpbGQgcHJvcGVydHksXG5cdFx0Ly8gYnV0IGFsc28gdGhlIHByb3BlcnR5IGl0c2VsZiBhcyBpdCBjYW4gYmUgdXNlZCBhcyB3aXRoaW4gdGhlIHNvcnRDb25kaXRpb25zIG9yIG9uIGN1c3RvbSBjb2x1bW5zLlxuXHRcdC8vIFRoaXMgc3RlcCBtdXN0IGJlIHZhbGlkZSBhbHNvIGZyb20gdGhlIGNvbHVtbnMgYWRkZWQgdmlhIExpbmVJdGVtcyBvciBmcm9tIGEgY29sdW1uIGF2YWlsYWJsZSBvbiB0aGUgcDEzbi5cblx0XHRpZiAoZ2V0RGlzcGxheU1vZGUocHJvcGVydHkpID09PSBcIkRlc2NyaXB0aW9uXCIpIHtcblx0XHRcdG5vblNvcnRhYmxlQ29sdW1ucyA9IG5vblNvcnRhYmxlQ29sdW1ucy5jb25jYXQocHJvcGVydHkubmFtZSk7XG5cdFx0XHR0YWJsZUNvbHVtbnMucHVzaChcblx0XHRcdFx0Z2V0Q29sdW1uRGVmaW5pdGlvbkZyb21Qcm9wZXJ0eShcblx0XHRcdFx0XHRwcm9wZXJ0eSxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgocHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0XHRwcm9wZXJ0eS5uYW1lLFxuXHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRcdG5vblNvcnRhYmxlQ29sdW1ucyxcblx0XHRcdFx0XHRhZ2dyZWdhdGlvbkhlbHBlcixcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFtdXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fVxuXHR9KTtcblxuXHQvLyBDcmVhdGUgYSBwcm9wZXJ0eUluZm8gZm9yIGVhY2ggcmVsYXRlZCBwcm9wZXJ0eS5cblx0Y29uc3QgcmVsYXRlZENvbHVtbnMgPSBfY3JlYXRlUmVsYXRlZENvbHVtbnMoXG5cdFx0Y29sdW1uc1RvQmVDcmVhdGVkLFxuXHRcdHRhYmxlQ29sdW1ucyxcblx0XHRub25Tb3J0YWJsZUNvbHVtbnMsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRlbnRpdHlUeXBlLFxuXHRcdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvblxuXHQpO1xuXG5cdHJldHVybiB0YWJsZUNvbHVtbnMuY29uY2F0KHJlbGF0ZWRDb2x1bW5zKTtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgY29sdW1uIGRlZmluaXRpb24gZnJvbSBhIHByb3BlcnR5LlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eSBFbnRpdHkgdHlwZSBwcm9wZXJ0eSBmb3Igd2hpY2ggdGhlIGNvbHVtbiBpcyBjcmVhdGVkXG4gKiBAcGFyYW0gZnVsbFByb3BlcnR5UGF0aCBUaGUgZnVsbCBwYXRoIHRvIHRoZSB0YXJnZXQgcHJvcGVydHlcbiAqIEBwYXJhbSByZWxhdGl2ZVBhdGggVGhlIHJlbGF0aXZlIHBhdGggdG8gdGhlIHRhcmdldCBwcm9wZXJ0eSBiYXNlZCBvbiB0aGUgY29udGV4dFxuICogQHBhcmFtIHVzZURhdGFGaWVsZFByZWZpeCBTaG91bGQgYmUgcHJlZml4ZWQgd2l0aCBcIkRhdGFGaWVsZDo6XCIsIGVsc2UgaXQgd2lsbCBiZSBwcmVmaXhlZCB3aXRoIFwiUHJvcGVydHk6OlwiXG4gKiBAcGFyYW0gYXZhaWxhYmxlRm9yQWRhcHRhdGlvbiBEZWNpZGVzIHdoZXRoZXIgdGhlIGNvbHVtbiBzaG91bGQgYmUgYXZhaWxhYmxlIGZvciBhZGFwdGF0aW9uXG4gKiBAcGFyYW0gbm9uU29ydGFibGVDb2x1bW5zIFRoZSBhcnJheSBvZiBhbGwgbm9uLXNvcnRhYmxlIGNvbHVtbiBuYW1lc1xuICogQHBhcmFtIGFnZ3JlZ2F0aW9uSGVscGVyIFRoZSBhZ2dyZWdhdGlvbkhlbHBlciBmb3IgdGhlIGVudGl0eVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gdGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uIFRoZSBhcnJheSBvZiBjb2x1bW5zIGZyb20gYSBwcm9wZXJ0eSB1c2luZyBhIHRleHQgYW5ub3RhdGlvbiB3aXRoIHRleHRPbmx5IGFzIHRleHQgYXJyYW5nZW1lbnQuXG4gKiBAcmV0dXJucyBUaGUgYW5ub3RhdGlvbiBjb2x1bW4gZGVmaW5pdGlvblxuICovXG5jb25zdCBnZXRDb2x1bW5EZWZpbml0aW9uRnJvbVByb3BlcnR5ID0gZnVuY3Rpb24gKFxuXHRwcm9wZXJ0eTogUHJvcGVydHksXG5cdGZ1bGxQcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0cmVsYXRpdmVQYXRoOiBzdHJpbmcsXG5cdHVzZURhdGFGaWVsZFByZWZpeDogYm9vbGVhbixcblx0YXZhaWxhYmxlRm9yQWRhcHRhdGlvbjogYm9vbGVhbixcblx0bm9uU29ydGFibGVDb2x1bW5zOiBzdHJpbmdbXSxcblx0YWdncmVnYXRpb25IZWxwZXI6IEFnZ3JlZ2F0aW9uSGVscGVyLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb246IHN0cmluZ1tdXG4pOiBBbm5vdGF0aW9uVGFibGVDb2x1bW4ge1xuXHRjb25zdCBuYW1lID0gdXNlRGF0YUZpZWxkUHJlZml4ID8gcmVsYXRpdmVQYXRoIDogYFByb3BlcnR5Ojoke3JlbGF0aXZlUGF0aH1gO1xuXHRjb25zdCBrZXkgPSAodXNlRGF0YUZpZWxkUHJlZml4ID8gXCJEYXRhRmllbGQ6OlwiIDogXCJQcm9wZXJ0eTo6XCIpICsgcmVwbGFjZVNwZWNpYWxDaGFycyhyZWxhdGl2ZVBhdGgpO1xuXHRjb25zdCBzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoID0gZ2V0U2VtYW50aWNPYmplY3RQYXRoKGNvbnZlcnRlckNvbnRleHQsIHByb3BlcnR5KTtcblx0Y29uc3QgaXNIaWRkZW4gPSBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpID09PSB0cnVlO1xuXHRjb25zdCBncm91cFBhdGg6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHByb3BlcnR5Lm5hbWUgPyBfc2xpY2VBdFNsYXNoKHByb3BlcnR5Lm5hbWUsIHRydWUsIGZhbHNlKSA6IHVuZGVmaW5lZDtcblx0Y29uc3QgaXNHcm91cDogYm9vbGVhbiA9IGdyb3VwUGF0aCAhPSBwcm9wZXJ0eS5uYW1lO1xuXHRjb25zdCBpc0RhdGFQb2ludEZha2VQcm9wZXJ0eTogYm9vbGVhbiA9IG5hbWUuaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIikgPiAtMTtcblx0Y29uc3QgZXhwb3J0VHlwZTogc3RyaW5nID0gX2dldEV4cG9ydERhdGFUeXBlKHByb3BlcnR5LnR5cGUpO1xuXHRjb25zdCBzRGF0ZUlucHV0Rm9ybWF0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBwcm9wZXJ0eS50eXBlID09PSBcIkVkbS5EYXRlXCIgPyBcIllZWVktTU0tRERcIiA6IHVuZGVmaW5lZDtcblx0Y29uc3QgZGF0YVR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCA9IGdldERhdGFGaWVsZERhdGFUeXBlKHByb3BlcnR5KTtcblx0Y29uc3QgcHJvcGVydHlUeXBlQ29uZmlnID0gIWlzRGF0YVBvaW50RmFrZVByb3BlcnR5ID8gZ2V0VHlwZUNvbmZpZyhwcm9wZXJ0eSwgZGF0YVR5cGUpIDogdW5kZWZpbmVkO1xuXHRjb25zdCBzZW1hbnRpY0tleXM6IFNlbWFudGljS2V5ID0gY29udmVydGVyQ29udGV4dC5nZXRBbm5vdGF0aW9uc0J5VGVybShcIkNvbW1vblwiLCBDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNLZXksIFtcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKVxuXHRdKVswXTtcblx0Y29uc3QgaXNBUHJvcGVydHlGcm9tVGV4dE9ubHlBbm5vdGF0aW9uID1cblx0XHR0ZXh0T25seUNvbHVtbnNGcm9tVGV4dEFubm90YXRpb24gJiYgdGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uLmluZGV4T2YocmVsYXRpdmVQYXRoKSA+PSAwO1xuXHRjb25zdCBzb3J0YWJsZSA9XG5cdFx0KCFpc0hpZGRlbiB8fCBpc0FQcm9wZXJ0eUZyb21UZXh0T25seUFubm90YXRpb24pICYmIG5vblNvcnRhYmxlQ29sdW1ucy5pbmRleE9mKHJlbGF0aXZlUGF0aCkgPT09IC0xICYmICFpc0RhdGFQb2ludEZha2VQcm9wZXJ0eTtcblx0Y29uc3Qgb1R5cGVDb25maWcgPSAhaXNEYXRhUG9pbnRGYWtlUHJvcGVydHlcblx0XHQ/IHtcblx0XHRcdFx0Y2xhc3NOYW1lOiBwcm9wZXJ0eS50eXBlIHx8IGRhdGFUeXBlLFxuXHRcdFx0XHRvRm9ybWF0T3B0aW9uczogcHJvcGVydHlUeXBlQ29uZmlnLmZvcm1hdE9wdGlvbnMsXG5cdFx0XHRcdG9Db25zdHJhaW50czogcHJvcGVydHlUeXBlQ29uZmlnLmNvbnN0cmFpbnRzXG5cdFx0ICB9XG5cdFx0OiB1bmRlZmluZWQ7XG5cdGxldCBleHBvcnRTZXR0aW5nczogQ29sdW1uRXhwb3J0U2V0dGluZ3MgfCBudWxsID0gaXNEYXRhUG9pbnRGYWtlUHJvcGVydHlcblx0XHQ/IHtcblx0XHRcdFx0dGVtcGxhdGU6IGdldFRhcmdldFZhbHVlT25EYXRhUG9pbnQocHJvcGVydHkpXG5cdFx0ICB9XG5cdFx0OiBudWxsO1xuXG5cdGlmICghaXNEYXRhUG9pbnRGYWtlUHJvcGVydHkgJiYgX2lzRXhwb3J0YWJsZUNvbHVtbihwcm9wZXJ0eSkpIHtcblx0XHRjb25zdCBvVW5pdFByb3BlcnR5ID0gZ2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHkocHJvcGVydHkpIHx8IGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkocHJvcGVydHkpO1xuXHRcdGNvbnN0IG9UaW1lem9uZVByb3BlcnR5ID0gZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHkocHJvcGVydHkpO1xuXHRcdGNvbnN0IHNVbml0VGV4dCA9IHByb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5IHx8IHByb3BlcnR5Py5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LlVuaXQ7XG5cdFx0Y29uc3Qgc1RpbWV6b25lVGV4dCA9IHByb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UaW1lem9uZTtcblx0XHRleHBvcnRTZXR0aW5ncyA9IHtcblx0XHRcdHR5cGU6IGV4cG9ydFR5cGUsXG5cdFx0XHRpbnB1dEZvcm1hdDogc0RhdGVJbnB1dEZvcm1hdCxcblx0XHRcdHNjYWxlOiBwcm9wZXJ0eS5zY2FsZSxcblx0XHRcdGRlbGltaXRlcjogcHJvcGVydHkudHlwZSA9PT0gXCJFZG0uSW50NjRcIlxuXHRcdH07XG5cdFx0aWYgKG9Vbml0UHJvcGVydHkpIHtcblx0XHRcdGV4cG9ydFNldHRpbmdzLnVuaXRQcm9wZXJ0eSA9IG9Vbml0UHJvcGVydHkubmFtZTtcblx0XHRcdGV4cG9ydFNldHRpbmdzLnR5cGUgPSBcIkN1cnJlbmN5XCI7IC8vIEZvcmNlIHRvIGEgY3VycmVuY3kgYmVjYXVzZSB0aGVyZSdzIGEgdW5pdFByb3BlcnR5IChvdGhlcndpc2UgdGhlIHZhbHVlIGlzbid0IHByb3Blcmx5IGZvcm1hdHRlZCB3aGVuIGV4cG9ydGVkKVxuXHRcdH0gZWxzZSBpZiAoc1VuaXRUZXh0KSB7XG5cdFx0XHRleHBvcnRTZXR0aW5ncy51bml0ID0gYCR7c1VuaXRUZXh0fWA7XG5cdFx0fVxuXHRcdGlmIChvVGltZXpvbmVQcm9wZXJ0eSkge1xuXHRcdFx0ZXhwb3J0U2V0dGluZ3MudGltZXpvbmVQcm9wZXJ0eSA9IG9UaW1lem9uZVByb3BlcnR5Lm5hbWU7XG5cdFx0XHRleHBvcnRTZXR0aW5ncy51dGMgPSBmYWxzZTtcblx0XHR9IGVsc2UgaWYgKHNUaW1lem9uZVRleHQpIHtcblx0XHRcdGV4cG9ydFNldHRpbmdzLnRpbWV6b25lID0gc1RpbWV6b25lVGV4dC50b1N0cmluZygpO1xuXHRcdH1cblx0fVxuXHRjb25zdCBjb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gX2dldENvbGxlY3RlZE5hdmlnYXRpb25Qcm9wZXJ0eUxhYmVscyhyZWxhdGl2ZVBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXG5cdGNvbnN0IG9Db2x1bW46IGFueSA9IHtcblx0XHRrZXk6IGtleSxcblx0XHR0eXBlOiBDb2x1bW5UeXBlLkFubm90YXRpb24sXG5cdFx0bGFiZWw6IGdldExhYmVsKHByb3BlcnR5LCBpc0dyb3VwKSxcblx0XHRncm91cExhYmVsOiBpc0dyb3VwID8gZ2V0TGFiZWwocHJvcGVydHkpIDogbnVsbCxcblx0XHRncm91cDogaXNHcm91cCA/IGdyb3VwUGF0aCA6IG51bGwsXG5cdFx0YW5ub3RhdGlvblBhdGg6IGZ1bGxQcm9wZXJ0eVBhdGgsXG5cdFx0c2VtYW50aWNPYmplY3RQYXRoOiBzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoLFxuXHRcdC8vIEEgZmFrZSBwcm9wZXJ0eSB3YXMgY3JlYXRlZCBmb3IgdGhlIFRhcmdldFZhbHVlIHVzZWQgb24gRGF0YVBvaW50cywgdGhpcyBwcm9wZXJ0eSBzaG91bGQgYmUgaGlkZGVuIGFuZCBub24gc29ydGFibGVcblx0XHRhdmFpbGFiaWxpdHk6XG5cdFx0XHQhYXZhaWxhYmxlRm9yQWRhcHRhdGlvbiB8fCBpc0hpZGRlbiB8fCBpc0RhdGFQb2ludEZha2VQcm9wZXJ0eSA/IEF2YWlsYWJpbGl0eVR5cGUuSGlkZGVuIDogQXZhaWxhYmlsaXR5VHlwZS5BZGFwdGF0aW9uLFxuXHRcdG5hbWU6IG5hbWUsXG5cdFx0cmVsYXRpdmVQYXRoOiBpc0RhdGFQb2ludEZha2VQcm9wZXJ0eVxuXHRcdFx0PyAocHJvcGVydHkgYXMgYW55KS5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQ/LlRhcmdldD8uJHRhcmdldD8uVmFsdWU/LnBhdGggfHwgKHByb3BlcnR5IGFzIGFueSkuVmFsdWUucGF0aFxuXHRcdFx0OiByZWxhdGl2ZVBhdGgsXG5cdFx0c29ydGFibGU6IHNvcnRhYmxlLFxuXHRcdGlzR3JvdXBhYmxlOiBhZ2dyZWdhdGlvbkhlbHBlci5pc0FuYWx5dGljc1N1cHBvcnRlZCgpID8gYWdncmVnYXRpb25IZWxwZXIuaXNQcm9wZXJ0eUdyb3VwYWJsZShwcm9wZXJ0eSkgOiBzb3J0YWJsZSxcblx0XHRpc0tleTogcHJvcGVydHkuaXNLZXksXG5cdFx0aXNEYXRhUG9pbnRGYWtlVGFyZ2V0UHJvcGVydHk6IGlzRGF0YVBvaW50RmFrZVByb3BlcnR5LFxuXHRcdGV4cG9ydFNldHRpbmdzOiBleHBvcnRTZXR0aW5ncyxcblx0XHRjYXNlU2Vuc2l0aXZlOiBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUoY29udmVydGVyQ29udGV4dCksXG5cdFx0dHlwZUNvbmZpZzogb1R5cGVDb25maWcsXG5cdFx0dmlzdWFsU2V0dGluZ3M6IGlzRGF0YVBvaW50RmFrZVByb3BlcnR5ID8geyB3aWR0aENhbGN1bGF0aW9uOiBudWxsIH0gOiB1bmRlZmluZWQsXG5cdFx0aW1wb3J0YW5jZTogZ2V0SW1wb3J0YW5jZSgocHJvcGVydHkgYXMgYW55KS5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQsIHNlbWFudGljS2V5cyksXG5cdFx0YWRkaXRpb25hbExhYmVsczogY29sbGVjdGVkTmF2aWdhdGlvblByb3BlcnR5TGFiZWxzXG5cdH07XG5cdGNvbnN0IHNUb29sdGlwID0gX2dldFRvb2x0aXAocHJvcGVydHkpO1xuXHRpZiAoc1Rvb2x0aXApIHtcblx0XHRvQ29sdW1uLnRvb2x0aXAgPSBzVG9vbHRpcDtcblx0fVxuXG5cdHJldHVybiBvQ29sdW1uIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbjtcbn07XG5cbi8qKlxuICogUmV0dXJucyBCb29sZWFuIHRydWUgZm9yIGV4cG9ydGFibGUgY29sdW1ucywgZmFsc2UgZm9yIG5vbiBleHBvcnRhYmxlIGNvbHVtbnMuXG4gKlxuICogQHBhcmFtIHNvdXJjZSBUaGUgZGF0YUZpZWxkIG9yIHByb3BlcnR5IHRvIGJlIGV2YWx1YXRlZFxuICogQHJldHVybnMgVHJ1ZSBmb3IgZXhwb3J0YWJsZSBjb2x1bW4sIGZhbHNlIGZvciBub24gZXhwb3J0YWJsZSBjb2x1bW5cbiAqIEBwcml2YXRlXG4gKi9cblxuZnVuY3Rpb24gX2lzRXhwb3J0YWJsZUNvbHVtbihzb3VyY2U6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBQcm9wZXJ0eSk6IGJvb2xlYW4ge1xuXHRsZXQgcHJvcGVydHlUeXBlLCBwcm9wZXJ0eTtcblx0Y29uc3QgZGF0YUZpZWxkRGVmYXVsdFByb3BlcnR5VHlwZSA9IChzb3VyY2UgYXMgUHJvcGVydHkpLmFubm90YXRpb25zPy5VST8uRGF0YUZpZWxkRGVmYXVsdD8uJFR5cGU7XG5cdGlmIChpc1Byb3BlcnR5KHNvdXJjZSAmJiBkYXRhRmllbGREZWZhdWx0UHJvcGVydHlUeXBlKSkge1xuXHRcdHByb3BlcnR5VHlwZSA9IGRhdGFGaWVsZERlZmF1bHRQcm9wZXJ0eVR5cGU7XG5cdH0gZWxzZSB7XG5cdFx0cHJvcGVydHkgPSBzb3VyY2UgYXMgRGF0YUZpZWxkQWJzdHJhY3RUeXBlcztcblx0XHRwcm9wZXJ0eVR5cGUgPSBwcm9wZXJ0eS4kVHlwZTtcblx0XHRpZiAocHJvcGVydHlUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uICYmIChwcm9wZXJ0eSBhcyBEYXRhRmllbGRGb3JBbm5vdGF0aW9uKS5UYXJnZXQuJHRhcmdldD8uJFR5cGUpIHtcblx0XHRcdC8vRm9yIENoYXJ0XG5cdFx0XHRwcm9wZXJ0eVR5cGUgPSAocHJvcGVydHkgYXMgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikuVGFyZ2V0LiR0YXJnZXQuJFR5cGU7XG5cdFx0XHRyZXR1cm4gVUlBbm5vdGF0aW9uVHlwZXMuQ2hhcnREZWZpbml0aW9uVHlwZS5pbmRleE9mKHByb3BlcnR5VHlwZSkgPT09IC0xO1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHQocHJvcGVydHkgYXMgRGF0YUZpZWxkKS5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvcmU/Lk1lZGlhVHlwZT8udGVybSA9PT0gXCJPcmcuT0RhdGEuQ29yZS5WMS5NZWRpYVR5cGVcIiAmJlxuXHRcdFx0KHByb3BlcnR5IGFzIERhdGFGaWVsZCkuVmFsdWU/LiR0YXJnZXQ/LmFubm90YXRpb25zPy5Db3JlPy5pc1VSTCAhPT0gdHJ1ZVxuXHRcdCkge1xuXHRcdFx0Ly9Gb3IgU3RyZWFtXG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBwcm9wZXJ0eVR5cGVcblx0XHQ/IFtcblx0XHRcdFx0VUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRcdFx0XHRVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdFx0XHRcdFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbkdyb3VwXG5cdFx0ICBdLmluZGV4T2YocHJvcGVydHlUeXBlKSA9PT0gLTFcblx0XHQ6IHRydWU7XG59XG5cbi8qKlxuICogUmV0dXJucyBCb29sZWFuIHRydWUgZm9yIHZhbGlkIGNvbHVtbnMsIGZhbHNlIGZvciBpbnZhbGlkIGNvbHVtbnMuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZCBEaWZmZXJlbnQgRGF0YUZpZWxkIHR5cGVzIGRlZmluZWQgaW4gdGhlIGFubm90YXRpb25zXG4gKiBAcmV0dXJucyBUcnVlIGZvciB2YWxpZCBjb2x1bW5zLCBmYWxzZSBmb3IgaW52YWxpZCBjb2x1bW5zXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBfaXNWYWxpZENvbHVtbiA9IGZ1bmN0aW9uIChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpIHtcblx0c3dpdGNoIChkYXRhRmllbGQuJFR5cGUpIHtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdHJldHVybiAhIWRhdGFGaWVsZC5JbmxpbmU7XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhVcmw6XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoOlxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0ZGVmYXVsdDpcblx0XHQvLyBUb2RvOiBSZXBsYWNlIHdpdGggcHJvcGVyIExvZyBzdGF0ZW1lbnQgb25jZSBhdmFpbGFibGVcblx0XHQvLyAgdGhyb3cgbmV3IEVycm9yKFwiVW5oYW5kbGVkIERhdGFGaWVsZCBBYnN0cmFjdCB0eXBlOiBcIiArIGRhdGFGaWVsZC4kVHlwZSk7XG5cdH1cbn07XG4vKipcbiAqIFJldHVybnMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiB0byBldmFsdWF0ZSB0aGUgdmlzaWJpbGl0eSBvZiBhIERhdGFGaWVsZCBvciBEYXRhUG9pbnQgYW5ub3RhdGlvbi5cbiAqXG4gKiBTQVAgRmlvcmkgZWxlbWVudHMgd2lsbCBldmFsdWF0ZSBlaXRoZXIgdGhlIFVJLkhpZGRlbiBhbm5vdGF0aW9uIGRlZmluZWQgb24gdGhlIGFubm90YXRpb24gaXRzZWxmIG9yIG9uIHRoZSB0YXJnZXQgcHJvcGVydHkuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZE1vZGVsUGF0aCBUaGUgbWV0YXBhdGggcmVmZXJyaW5nIHRvIHRoZSBhbm5vdGF0aW9uIHRoYXQgaXMgZXZhbHVhdGVkIGJ5IFNBUCBGaW9yaSBlbGVtZW50cy5cbiAqIEBwYXJhbSBbZm9ybWF0T3B0aW9uc10gRm9ybWF0T3B0aW9ucyBvcHRpb25hbC5cbiAqIEBwYXJhbSBmb3JtYXRPcHRpb25zLmlzQW5hbHl0aWNzIFRoaXMgZmxhZyBpcyB1c2VkIHRvIGNoZWNrIGlmIHRoZSBhbmFseXRpYyB0YWJsZSBoYXMgR3JvdXBIZWFkZXIgZXhwYW5kZWQuXG4gKiBAcmV0dXJucyBBbiBleHByZXNzaW9uIHRoYXQgeW91IGNhbiBiaW5kIHRvIHRoZSBVSS5cbiAqL1xuZXhwb3J0IGNvbnN0IF9nZXRWaXNpYmxlRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChcblx0ZGF0YUZpZWxkTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRmb3JtYXRPcHRpb25zPzogYW55XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248YW55PiB7XG5cdGNvbnN0IHRhcmdldE9iamVjdDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IERhdGFQb2ludFR5cGVUeXBlcyA9IGRhdGFGaWVsZE1vZGVsUGF0aC50YXJnZXRPYmplY3Q7XG5cdGxldCBwcm9wZXJ0eVZhbHVlO1xuXHRpZiAodGFyZ2V0T2JqZWN0KSB7XG5cdFx0c3dpdGNoICh0YXJnZXRPYmplY3QuJFR5cGUpIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb246XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGU6XG5cdFx0XHRcdHByb3BlcnR5VmFsdWUgPSB0YXJnZXRPYmplY3QuVmFsdWUuJHRhcmdldDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb246XG5cdFx0XHRcdC8vIGlmIGl0IGlzIGEgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiBwb2ludGluZyB0byBhIERhdGFQb2ludCB3ZSBsb29rIGF0IHRoZSBkYXRhUG9pbnQncyB2YWx1ZVxuXHRcdFx0XHRpZiAodGFyZ2V0T2JqZWN0Py5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlKSB7XG5cdFx0XHRcdFx0cHJvcGVydHlWYWx1ZSA9IHRhcmdldE9iamVjdC5UYXJnZXQuJHRhcmdldD8uVmFsdWUuJHRhcmdldDtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXHRjb25zdCBpc0FuYWx5dGljYWxHcm91cEhlYWRlckV4cGFuZGVkID0gZm9ybWF0T3B0aW9ucz8uaXNBbmFseXRpY3MgPyBVSS5Jc0V4cGFuZGVkIDogY29uc3RhbnQoZmFsc2UpO1xuXHRjb25zdCBpc0FuYWx5dGljYWxMZWFmID0gZm9ybWF0T3B0aW9ucz8uaXNBbmFseXRpY3MgPyBlcXVhbChVSS5Ob2RlTGV2ZWwsIDApIDogY29uc3RhbnQoZmFsc2UpO1xuXG5cdC8vIEEgZGF0YSBmaWVsZCBpcyB2aXNpYmxlIGlmOlxuXHQvLyAtIHRoZSBVSS5IaWRkZW4gZXhwcmVzc2lvbiBpbiB0aGUgb3JpZ2luYWwgYW5ub3RhdGlvbiBkb2VzIG5vdCBldmFsdWF0ZSB0byAndHJ1ZSdcblx0Ly8gLSB0aGUgVUkuSGlkZGVuIGV4cHJlc3Npb24gaW4gdGhlIHRhcmdldCBwcm9wZXJ0eSBkb2VzIG5vdCBldmFsdWF0ZSB0byAndHJ1ZSdcblx0Ly8gLSBpbiBjYXNlIG9mIEFuYWx5dGljcyBpdCdzIG5vdCB2aXNpYmxlIGZvciBhbiBleHBhbmRlZCBHcm91cEhlYWRlclxuXHRyZXR1cm4gYW5kKFxuXHRcdC4uLltcblx0XHRcdG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24odGFyZ2V0T2JqZWN0Py5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiksIHRydWUpKSxcblx0XHRcdGlmRWxzZShcblx0XHRcdFx0ISFwcm9wZXJ0eVZhbHVlLFxuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlICYmIG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ocHJvcGVydHlWYWx1ZS5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiksIHRydWUpKSxcblx0XHRcdFx0dHJ1ZVxuXHRcdFx0KSxcblx0XHRcdG9yKG5vdChpc0FuYWx5dGljYWxHcm91cEhlYWRlckV4cGFuZGVkKSwgaXNBbmFseXRpY2FsTGVhZilcblx0XHRdXG5cdCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgaGlkZGVuIGJpbmRpbmcgZXhwcmVzc2lvbnMgZm9yIGEgZmllbGQgZ3JvdXAuXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZEdyb3VwIERhdGFGaWVsZCBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uc1xuICogQHBhcmFtIGZpZWxkRm9ybWF0T3B0aW9ucyBGb3JtYXRPcHRpb25zIG9wdGlvbmFsLlxuICogQHBhcmFtIGZpZWxkRm9ybWF0T3B0aW9ucy5pc0FuYWx5dGljcyBUaGlzIGZsYWcgaXMgdXNlZCB0byBjaGVjayBpZiB0aGUgYW5hbHl0aWMgdGFibGUgaGFzIEdyb3VwSGVhZGVyIGV4cGFuZGVkLlxuICogQHJldHVybnMgQ29tcGlsZSBiaW5kaW5nIG9mIGZpZWxkIGdyb3VwIGV4cHJlc3Npb25zLlxuICogQHByaXZhdGVcbiAqL1xuY29uc3QgX2dldEZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyA9IGZ1bmN0aW9uIChcblx0ZGF0YUZpZWxkR3JvdXA6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdGZpZWxkRm9ybWF0T3B0aW9uczogYW55XG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHVuZGVmaW5lZCB7XG5cdGNvbnN0IGFGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnM6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxhbnk+W10gPSBbXTtcblx0aWYgKFxuXHRcdGRhdGFGaWVsZEdyb3VwLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uICYmXG5cdFx0ZGF0YUZpZWxkR3JvdXAuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRmllbGRHcm91cFR5cGVcblx0KSB7XG5cdFx0ZGF0YUZpZWxkR3JvdXAuVGFyZ2V0LiR0YXJnZXQuRGF0YT8uZm9yRWFjaCgoaW5uZXJEYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMgfCBEYXRhUG9pbnRUeXBlVHlwZXMpID0+IHtcblx0XHRcdGFGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMucHVzaChcblx0XHRcdFx0X2dldFZpc2libGVFeHByZXNzaW9uKHsgdGFyZ2V0T2JqZWN0OiBpbm5lckRhdGFGaWVsZCB9IGFzIERhdGFNb2RlbE9iamVjdFBhdGgsIGZpZWxkRm9ybWF0T3B0aW9ucylcblx0XHRcdCk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGlmRWxzZShvciguLi5hRmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zKSwgY29uc3RhbnQodHJ1ZSksIGNvbnN0YW50KGZhbHNlKSkpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbGFiZWwgZm9yIHRoZSBwcm9wZXJ0eSBhbmQgZGF0YUZpZWxkLlxuICpcbiAqIEBwYXJhbSBbcHJvcGVydHldIFByb3BlcnR5LCBEYXRhRmllbGQgb3IgTmF2aWdhdGlvbiBQcm9wZXJ0eSBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uc1xuICogQHBhcmFtIGlzR3JvdXBcbiAqIEByZXR1cm5zIExhYmVsIG9mIHRoZSBwcm9wZXJ0eSBvciBEYXRhRmllbGRcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IGdldExhYmVsID0gZnVuY3Rpb24gKHByb3BlcnR5OiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIHwgUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHksIGlzR3JvdXAgPSBmYWxzZSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGlmICghcHJvcGVydHkpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGlmIChpc1Byb3BlcnR5KHByb3BlcnR5KSB8fCBpc05hdmlnYXRpb25Qcm9wZXJ0eShwcm9wZXJ0eSkpIHtcblx0XHRjb25zdCBkYXRhRmllbGREZWZhdWx0ID0gKHByb3BlcnR5IGFzIFByb3BlcnR5KS5hbm5vdGF0aW9ucz8uVUk/LkRhdGFGaWVsZERlZmF1bHQ7XG5cdFx0aWYgKGRhdGFGaWVsZERlZmF1bHQgJiYgIWRhdGFGaWVsZERlZmF1bHQucXVhbGlmaWVyICYmIGRhdGFGaWVsZERlZmF1bHQuTGFiZWw/LnZhbHVlT2YoKSkge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGREZWZhdWx0LkxhYmVsPy52YWx1ZU9mKCkpKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihwcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db21tb24/LkxhYmVsPy52YWx1ZU9mKCkgfHwgcHJvcGVydHkubmFtZSkpO1xuXHR9IGVsc2UgaWYgKGlzRGF0YUZpZWxkVHlwZXMocHJvcGVydHkpKSB7XG5cdFx0aWYgKCEhaXNHcm91cCAmJiBwcm9wZXJ0eS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbikge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihwcm9wZXJ0eS5MYWJlbD8udmFsdWVPZigpKSk7XG5cdFx0fVxuXHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihcblx0XHRcdFx0cHJvcGVydHkuTGFiZWw/LnZhbHVlT2YoKSB8fCBwcm9wZXJ0eS5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWw/LnZhbHVlT2YoKSB8fCBwcm9wZXJ0eS5WYWx1ZT8uJHRhcmdldD8ubmFtZVxuXHRcdFx0KVxuXHRcdCk7XG5cdH0gZWxzZSBpZiAocHJvcGVydHkuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24pIHtcblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRcdHByb3BlcnR5LkxhYmVsPy52YWx1ZU9mKCkgfHwgKHByb3BlcnR5LlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnQpPy5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWw/LnZhbHVlT2YoKVxuXHRcdFx0KVxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihwcm9wZXJ0eS5MYWJlbD8udmFsdWVPZigpKSk7XG5cdH1cbn07XG5cbmNvbnN0IF9nZXRUb29sdGlwID0gZnVuY3Rpb24gKHNvdXJjZTogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB8IFByb3BlcnR5KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0aWYgKCFzb3VyY2UpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKGlzUHJvcGVydHkoc291cmNlKSB8fCBzb3VyY2UuYW5ub3RhdGlvbnM/LkNvbW1vbj8uUXVpY2tJbmZvKSB7XG5cdFx0cmV0dXJuIHNvdXJjZS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5RdWlja0luZm9cblx0XHRcdD8gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHNvdXJjZS5hbm5vdGF0aW9ucy5Db21tb24uUXVpY2tJbmZvLnZhbHVlT2YoKSkpXG5cdFx0XHQ6IHVuZGVmaW5lZDtcblx0fSBlbHNlIGlmIChpc0RhdGFGaWVsZFR5cGVzKHNvdXJjZSkpIHtcblx0XHRyZXR1cm4gc291cmNlLlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5RdWlja0luZm9cblx0XHRcdD8gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHNvdXJjZS5WYWx1ZS4kdGFyZ2V0LmFubm90YXRpb25zLkNvbW1vbi5RdWlja0luZm8udmFsdWVPZigpKSlcblx0XHRcdDogdW5kZWZpbmVkO1xuXHR9IGVsc2UgaWYgKHNvdXJjZS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbikge1xuXHRcdGNvbnN0IGRhdGFwb2ludFRhcmdldCA9IHNvdXJjZS5UYXJnZXQ/LiR0YXJnZXQgYXMgRGF0YVBvaW50O1xuXHRcdHJldHVybiBkYXRhcG9pbnRUYXJnZXQ/LlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5RdWlja0luZm9cblx0XHRcdD8gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFwb2ludFRhcmdldC5WYWx1ZS4kdGFyZ2V0LmFubm90YXRpb25zLkNvbW1vbi5RdWlja0luZm8udmFsdWVPZigpKSlcblx0XHRcdDogdW5kZWZpbmVkO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb3dTdGF0dXNWaXNpYmlsaXR5KGNvbE5hbWU6IHN0cmluZywgaXNTZW1hbnRpY0tleUluRmllbGRHcm91cD86IEJvb2xlYW4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4ge1xuXHRyZXR1cm4gZm9ybWF0UmVzdWx0KFxuXHRcdFtcblx0XHRcdHBhdGhJbk1vZGVsKGBzZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yYCwgXCJpbnRlcm5hbFwiKSxcblx0XHRcdHBhdGhJbk1vZGVsKGBmaWx0ZXJlZE1lc3NhZ2VzYCwgXCJpbnRlcm5hbFwiKSxcblx0XHRcdGNvbE5hbWUsXG5cdFx0XHRpc1NlbWFudGljS2V5SW5GaWVsZEdyb3VwXG5cdFx0XSxcblx0XHR0YWJsZUZvcm1hdHRlcnMuZ2V0RXJyb3JTdGF0dXNUZXh0VmlzaWJpbGl0eUZvcm1hdHRlclxuXHQpO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBQcm9wZXJ0eUluZm8gZm9yIGVhY2ggaWRlbnRpZmllZCBwcm9wZXJ0eSBjb25zdW1lZCBieSBhIExpbmVJdGVtLlxuICpcbiAqIEBwYXJhbSBjb2x1bW5zVG9CZUNyZWF0ZWQgSWRlbnRpZmllZCBwcm9wZXJ0aWVzLlxuICogQHBhcmFtIGV4aXN0aW5nQ29sdW1ucyBUaGUgbGlzdCBvZiBjb2x1bW5zIGNyZWF0ZWQgZm9yIExpbmVJdGVtcyBhbmQgUHJvcGVydGllcyBvZiBlbnRpdHlUeXBlLlxuICogQHBhcmFtIG5vblNvcnRhYmxlQ29sdW1ucyBUaGUgYXJyYXkgb2YgY29sdW1uIG5hbWVzIHdoaWNoIGNhbm5vdCBiZSBzb3J0ZWQuXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHQuXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgZW50aXR5IHR5cGUgZm9yIHRoZSBMaW5lSXRlbVxuICogQHBhcmFtIHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbiBUaGUgYXJyYXkgb2YgY29sdW1ucyBmcm9tIGEgcHJvcGVydHkgdXNpbmcgYSB0ZXh0IGFubm90YXRpb24gd2l0aCB0ZXh0T25seSBhcyB0ZXh0IGFycmFuZ2VtZW50LlxuICogQHJldHVybnMgVGhlIGFycmF5IG9mIGNvbHVtbnMgY3JlYXRlZC5cbiAqL1xuY29uc3QgX2NyZWF0ZVJlbGF0ZWRDb2x1bW5zID0gZnVuY3Rpb24gKFxuXHRjb2x1bW5zVG9CZUNyZWF0ZWQ6IFJlY29yZDxzdHJpbmcsIFByb3BlcnR5Pixcblx0ZXhpc3RpbmdDb2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSxcblx0bm9uU29ydGFibGVDb2x1bW5zOiBzdHJpbmdbXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uOiBzdHJpbmdbXVxuKTogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10ge1xuXHRjb25zdCByZWxhdGVkQ29sdW1uczogQW5ub3RhdGlvblRhYmxlQ29sdW1uW10gPSBbXTtcblx0Y29uc3QgcmVsYXRlZFByb3BlcnR5TmFtZU1hcDogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuXHRjb25zdCBhZ2dyZWdhdGlvbkhlbHBlciA9IG5ldyBBZ2dyZWdhdGlvbkhlbHBlcihlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRPYmplY3Qua2V5cyhjb2x1bW5zVG9CZUNyZWF0ZWQpLmZvckVhY2goKG5hbWUpID0+IHtcblx0XHRjb25zdCBwcm9wZXJ0eSA9IGNvbHVtbnNUb0JlQ3JlYXRlZFtuYW1lXSxcblx0XHRcdGFubm90YXRpb25QYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoKG5hbWUpLFxuXHRcdFx0Ly8gQ2hlY2sgd2hldGhlciB0aGUgcmVsYXRlZCBjb2x1bW4gYWxyZWFkeSBleGlzdHMuXG5cdFx0XHRyZWxhdGVkQ29sdW1uID0gZXhpc3RpbmdDb2x1bW5zLmZpbmQoKGNvbHVtbikgPT4gY29sdW1uLm5hbWUgPT09IG5hbWUpO1xuXHRcdGlmIChyZWxhdGVkQ29sdW1uID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIENhc2UgMTogS2V5IGNvbnRhaW5zIERhdGFGaWVsZCBwcmVmaXggdG8gZW5zdXJlIGFsbCBwcm9wZXJ0eSBjb2x1bW5zIGhhdmUgdGhlIHNhbWUga2V5IGZvcm1hdC5cblx0XHRcdC8vIE5ldyBjcmVhdGVkIHByb3BlcnR5IGNvbHVtbiBpcyBzZXQgdG8gaGlkZGVuLlxuXHRcdFx0cmVsYXRlZENvbHVtbnMucHVzaChcblx0XHRcdFx0Z2V0Q29sdW1uRGVmaW5pdGlvbkZyb21Qcm9wZXJ0eShcblx0XHRcdFx0XHRwcm9wZXJ0eSxcblx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aCxcblx0XHRcdFx0XHRuYW1lLFxuXHRcdFx0XHRcdHRydWUsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0bm9uU29ydGFibGVDb2x1bW5zLFxuXHRcdFx0XHRcdGFnZ3JlZ2F0aW9uSGVscGVyLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uXG5cdFx0XHRcdClcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChyZWxhdGVkQ29sdW1uLmFubm90YXRpb25QYXRoICE9PSBhbm5vdGF0aW9uUGF0aCB8fCByZWxhdGVkQ29sdW1uLnByb3BlcnR5SW5mb3MpIHtcblx0XHRcdC8vIENhc2UgMjogVGhlIGV4aXN0aW5nIGNvbHVtbiBwb2ludHMgdG8gYSBMaW5lSXRlbSAob3IpXG5cdFx0XHQvLyBDYXNlIDM6IFRoaXMgaXMgYSBzZWxmIHJlZmVyZW5jZSBmcm9tIGFuIGV4aXN0aW5nIGNvbHVtblxuXG5cdFx0XHRjb25zdCBuZXdOYW1lID0gYFByb3BlcnR5Ojoke25hbWV9YDtcblxuXHRcdFx0Ly8gQ2hlY2tpbmcgd2hldGhlciB0aGUgcmVsYXRlZCBwcm9wZXJ0eSBjb2x1bW4gaGFzIGFscmVhZHkgYmVlbiBjcmVhdGVkIGluIGEgcHJldmlvdXMgaXRlcmF0aW9uLlxuXHRcdFx0aWYgKCFleGlzdGluZ0NvbHVtbnMuc29tZSgoY29sdW1uKSA9PiBjb2x1bW4ubmFtZSA9PT0gbmV3TmFtZSkpIHtcblx0XHRcdFx0Ly8gQ3JlYXRlIGEgbmV3IHByb3BlcnR5IGNvbHVtbiB3aXRoICdQcm9wZXJ0eTo6JyBwcmVmaXgsXG5cdFx0XHRcdC8vIFNldCBpdCB0byBoaWRkZW4gYXMgaXQgaXMgb25seSBjb25zdW1lZCBieSBDb21wbGV4IHByb3BlcnR5IGluZm9zLlxuXHRcdFx0XHRjb25zdCBjb2x1bW4gPSBnZXRDb2x1bW5EZWZpbml0aW9uRnJvbVByb3BlcnR5KFxuXHRcdFx0XHRcdHByb3BlcnR5LFxuXHRcdFx0XHRcdGFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRcdG5hbWUsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0bm9uU29ydGFibGVDb2x1bW5zLFxuXHRcdFx0XHRcdGFnZ3JlZ2F0aW9uSGVscGVyLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGNvbHVtbi5pc1BhcnRPZkxpbmVJdGVtID0gcmVsYXRlZENvbHVtbi5pc1BhcnRPZkxpbmVJdGVtO1xuXHRcdFx0XHRyZWxhdGVkQ29sdW1ucy5wdXNoKGNvbHVtbik7XG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXBbbmFtZV0gPSBuZXdOYW1lO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0ZXhpc3RpbmdDb2x1bW5zLnNvbWUoKGNvbHVtbikgPT4gY29sdW1uLm5hbWUgPT09IG5ld05hbWUpICYmXG5cdFx0XHRcdGV4aXN0aW5nQ29sdW1ucy5zb21lKChjb2x1bW4pID0+IGNvbHVtbi5wcm9wZXJ0eUluZm9zPy5pbmNsdWRlcyhuYW1lKSlcblx0XHRcdCkge1xuXHRcdFx0XHRyZWxhdGVkUHJvcGVydHlOYW1lTWFwW25hbWVdID0gbmV3TmFtZTtcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXG5cdC8vIFRoZSBwcm9wZXJ0eSAnbmFtZScgaGFzIGJlZW4gcHJlZml4ZWQgd2l0aCAnUHJvcGVydHk6OicgZm9yIHVuaXF1ZW5lc3MuXG5cdC8vIFVwZGF0ZSB0aGUgc2FtZSBpbiBvdGhlciBwcm9wZXJ0eUluZm9zW10gcmVmZXJlbmNlcyB3aGljaCBwb2ludCB0byB0aGlzIHByb3BlcnR5LlxuXHRleGlzdGluZ0NvbHVtbnMuZm9yRWFjaCgoY29sdW1uKSA9PiB7XG5cdFx0Y29sdW1uLnByb3BlcnR5SW5mb3MgPSBjb2x1bW4ucHJvcGVydHlJbmZvcz8ubWFwKChwcm9wZXJ0eUluZm8pID0+IHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXBbcHJvcGVydHlJbmZvXSA/PyBwcm9wZXJ0eUluZm8pO1xuXHRcdGNvbHVtbi5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcyA9IGNvbHVtbi5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcz8ubWFwKFxuXHRcdFx0KHByb3BlcnR5SW5mbykgPT4gcmVsYXRlZFByb3BlcnR5TmFtZU1hcFtwcm9wZXJ0eUluZm9dID8/IHByb3BlcnR5SW5mb1xuXHRcdCk7XG5cdH0pO1xuXG5cdHJldHVybiByZWxhdGVkQ29sdW1ucztcbn07XG5cbi8qKlxuICogR2V0dGluZyB0aGUgQ29sdW1uIE5hbWVcbiAqIElmIGl0IHBvaW50cyB0byBhIERhdGFGaWVsZCB3aXRoIG9uZSBwcm9wZXJ0eSBvciBEYXRhUG9pbnQgd2l0aCBvbmUgcHJvcGVydHksIGl0IHdpbGwgdXNlIHRoZSBwcm9wZXJ0eSBuYW1lXG4gKiBoZXJlIHRvIGJlIGNvbnNpc3RlbnQgd2l0aCB0aGUgZXhpc3RpbmcgZmxleCBjaGFuZ2VzLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgRGlmZmVyZW50IERhdGFGaWVsZCB0eXBlcyBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uc1xuICogQHJldHVybnMgVGhlIG5hbWUgb2YgYW5ub3RhdGlvbiBjb2x1bW5zXG4gKiBAcHJpdmF0ZVxuICovXG5jb25zdCBfZ2V0QW5ub3RhdGlvbkNvbHVtbk5hbWUgPSBmdW5jdGlvbiAoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSB7XG5cdC8vIFRoaXMgaXMgbmVlZGVkIGFzIHdlIGhhdmUgZmxleGliaWxpdHkgY2hhbmdlcyBhbHJlYWR5IHRoYXQgd2UgaGF2ZSB0byBjaGVjayBhZ2FpbnN0XG5cdGlmIChpc0RhdGFGaWVsZFR5cGVzKGRhdGFGaWVsZCkpIHtcblx0XHRyZXR1cm4gZGF0YUZpZWxkLlZhbHVlPy5wYXRoO1xuXHR9IGVsc2UgaWYgKGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiAmJiAoZGF0YUZpZWxkLlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnQpPy5WYWx1ZT8ucGF0aCkge1xuXHRcdC8vIFRoaXMgaXMgZm9yIHJlbW92aW5nIGR1cGxpY2F0ZSBwcm9wZXJ0aWVzLiBGb3IgZXhhbXBsZSwgJ1Byb2dyZXNzJyBQcm9wZXJ0eSBpcyByZW1vdmVkIGlmIGl0IGlzIGFscmVhZHkgZGVmaW5lZCBhcyBhIERhdGFQb2ludFxuXHRcdHJldHVybiAoZGF0YUZpZWxkLlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnQpPy5WYWx1ZS5wYXRoO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCk7XG5cdH1cbn07XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgZGF0YSBmaWVsZCBsYWJlbHMgaGF2ZSB0byBiZSBkaXNwbGF5ZWQgaW4gdGhlIHRhYmxlLlxuICpcbiAqIEBwYXJhbSBmaWVsZEdyb3VwTmFtZSBUaGUgYERhdGFGaWVsZGAgbmFtZSBiZWluZyBwcm9jZXNzZWQuXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBgc2hvd0RhdGFGaWVsZHNMYWJlbGAgdmFsdWUgZnJvbSB0aGUgbWFuaWZlc3RcbiAqIEBwcml2YXRlXG4gKi9cbmNvbnN0IF9nZXRTaG93RGF0YUZpZWxkc0xhYmVsID0gZnVuY3Rpb24gKGZpZWxkR3JvdXBOYW1lOiBzdHJpbmcsIHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBib29sZWFuIHtcblx0Y29uc3Qgb0NvbHVtbnMgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpPy5jb2x1bW5zO1xuXHRjb25zdCBhQ29sdW1uS2V5cyA9IG9Db2x1bW5zICYmIE9iamVjdC5rZXlzKG9Db2x1bW5zKTtcblx0cmV0dXJuIChcblx0XHRhQ29sdW1uS2V5cyAmJlxuXHRcdCEhYUNvbHVtbktleXMuZmluZChmdW5jdGlvbiAoa2V5OiBzdHJpbmcpIHtcblx0XHRcdHJldHVybiBrZXkgPT09IGZpZWxkR3JvdXBOYW1lICYmIG9Db2x1bW5zW2tleV0uc2hvd0RhdGFGaWVsZHNMYWJlbDtcblx0XHR9KVxuXHQpO1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHRoZSByZWxhdGl2ZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSB3aXRoIHJlc3BlY3QgdG8gdGhlIHJvb3QgZW50aXR5LlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIGBEYXRhRmllbGRgIGJlaW5nIHByb2Nlc3NlZC5cbiAqIEByZXR1cm5zIFRoZSByZWxhdGl2ZSBwYXRoXG4gKi9cbmNvbnN0IF9nZXRSZWxhdGl2ZVBhdGggPSBmdW5jdGlvbiAoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKTogc3RyaW5nIHtcblx0bGV0IHJlbGF0aXZlUGF0aDogc3RyaW5nID0gXCJcIjtcblxuXHRzd2l0Y2ggKGRhdGFGaWVsZC4kVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uOlxuXHRcdFx0cmVsYXRpdmVQYXRoID0gKGRhdGFGaWVsZCBhcyBEYXRhRmllbGQpPy5WYWx1ZT8ucGF0aDtcblx0XHRcdGJyZWFrO1xuXG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0cmVsYXRpdmVQYXRoID0gZGF0YUZpZWxkPy5UYXJnZXQ/LnZhbHVlO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbkdyb3VwOlxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbkdyb3VwOlxuXHRcdFx0cmVsYXRpdmVQYXRoID0gS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpO1xuXHRcdFx0YnJlYWs7XG5cdH1cblxuXHRyZXR1cm4gcmVsYXRpdmVQYXRoO1xufTtcblxuY29uc3QgX3NsaWNlQXRTbGFzaCA9IGZ1bmN0aW9uIChwYXRoOiBzdHJpbmcsIGlzTGFzdFNsYXNoOiBib29sZWFuLCBpc0xhc3RQYXJ0OiBib29sZWFuKSB7XG5cdGNvbnN0IGlTbGFzaEluZGV4ID0gaXNMYXN0U2xhc2ggPyBwYXRoLmxhc3RJbmRleE9mKFwiL1wiKSA6IHBhdGguaW5kZXhPZihcIi9cIik7XG5cblx0aWYgKGlTbGFzaEluZGV4ID09PSAtMSkge1xuXHRcdHJldHVybiBwYXRoO1xuXHR9XG5cdHJldHVybiBpc0xhc3RQYXJ0ID8gcGF0aC5zdWJzdHJpbmcoaVNsYXNoSW5kZXggKyAxLCBwYXRoLmxlbmd0aCkgOiBwYXRoLnN1YnN0cmluZygwLCBpU2xhc2hJbmRleCk7XG59O1xuXG4vKipcbiAqIERldGVybWluZSB3aGV0aGVyIGEgY29sdW1uIGlzIHNvcnRhYmxlLlxuICpcbiAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIGRhdGEgZmllbGQgYmVpbmcgcHJvY2Vzc2VkXG4gKiBAcGFyYW0gcHJvcGVydHlQYXRoIFRoZSBwcm9wZXJ0eSBwYXRoXG4gKiBAcGFyYW0gbm9uU29ydGFibGVDb2x1bW5zIENvbGxlY3Rpb24gb2Ygbm9uLXNvcnRhYmxlIGNvbHVtbiBuYW1lcyBhcyBwZXIgYW5ub3RhdGlvblxuICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY29sdW1uIGlzIHNvcnRhYmxlXG4gKi9cbmNvbnN0IF9pc0NvbHVtblNvcnRhYmxlID0gZnVuY3Rpb24gKGRhdGFGaWVsZDogRGF0YUZpZWxkQWJzdHJhY3RUeXBlcywgcHJvcGVydHlQYXRoOiBzdHJpbmcsIG5vblNvcnRhYmxlQ29sdW1uczogc3RyaW5nW10pOiBib29sZWFuIHtcblx0cmV0dXJuIChcblx0XHRub25Tb3J0YWJsZUNvbHVtbnMuaW5kZXhPZihwcm9wZXJ0eVBhdGgpID09PSAtMSAmJiAvLyBDb2x1bW4gaXMgbm90IG1hcmtlZCBhcyBub24tc29ydGFibGUgdmlhIGFubm90YXRpb25cblx0XHQoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQgfHxcblx0XHRcdGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybCB8fFxuXHRcdFx0ZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uIHx8XG5cdFx0XHRkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb24pXG5cdCk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBmaWx0ZXJpbmcgb24gdGhlIHRhYmxlIGlzIGNhc2Ugc2Vuc2l0aXZlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFJldHVybnMgJ2ZhbHNlJyBpZiBGaWx0ZXJGdW5jdGlvbnMgYW5ub3RhdGlvbiBzdXBwb3J0cyAndG9sb3dlcicsIGVsc2UgJ3RydWUnXG4gKi9cbmV4cG9ydCBjb25zdCBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUgPSBmdW5jdGlvbiAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IGJvb2xlYW4ge1xuXHRjb25zdCBmaWx0ZXJGdW5jdGlvbnM6IEZpbHRlckZ1bmN0aW9ucyB8IHVuZGVmaW5lZCA9IF9nZXRGaWx0ZXJGdW5jdGlvbnMoY29udmVydGVyQ29udGV4dCk7XG5cdHJldHVybiBBcnJheS5pc0FycmF5KGZpbHRlckZ1bmN0aW9ucykgPyAoZmlsdGVyRnVuY3Rpb25zIGFzIFN0cmluZ1tdKS5pbmRleE9mKFwidG9sb3dlclwiKSA9PT0gLTEgOiB0cnVlO1xufTtcblxuZnVuY3Rpb24gX2dldEZpbHRlckZ1bmN0aW9ucyhDb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogRmlsdGVyRnVuY3Rpb25zIHwgdW5kZWZpbmVkIHtcblx0aWYgKE1vZGVsSGVscGVyLmlzU2luZ2xldG9uKENvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkpKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRjb25zdCBjYXBhYmlsaXRpZXMgPSBDb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpPy5hbm5vdGF0aW9ucz8uQ2FwYWJpbGl0aWVzIGFzIEVudGl0eVNldEFubm90YXRpb25zX0NhcGFiaWxpdGllcztcblx0cmV0dXJuIGNhcGFiaWxpdGllcz8uRmlsdGVyRnVuY3Rpb25zIHx8IENvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5Q29udGFpbmVyKCk/LmFubm90YXRpb25zPy5DYXBhYmlsaXRpZXM/LkZpbHRlckZ1bmN0aW9ucztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGRlZmF1bHQgZm9ybWF0IG9wdGlvbnMgZm9yIHRleHQgZmllbGRzIGluIGEgdGFibGUuXG4gKlxuICogQHBhcmFtIGZvcm1hdE9wdGlvbnNcbiAqIEByZXR1cm5zIENvbGxlY3Rpb24gb2YgZm9ybWF0IG9wdGlvbnMgd2l0aCBkZWZhdWx0IHZhbHVlc1xuICovXG5mdW5jdGlvbiBfZ2V0RGVmYXVsdEZvcm1hdE9wdGlvbnNGb3JUYWJsZShmb3JtYXRPcHRpb25zOiBGb3JtYXRPcHRpb25zVHlwZSB8IHVuZGVmaW5lZCk6IEZvcm1hdE9wdGlvbnNUeXBlIHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIGZvcm1hdE9wdGlvbnMgPT09IHVuZGVmaW5lZFxuXHRcdD8gdW5kZWZpbmVkXG5cdFx0OiB7XG5cdFx0XHRcdHRleHRMaW5lc0VkaXQ6IDQsXG5cdFx0XHRcdC4uLmZvcm1hdE9wdGlvbnNcblx0XHQgIH07XG59XG5cbmZ1bmN0aW9uIF9maW5kU2VtYW50aWNLZXlWYWx1ZXMoc2VtYW50aWNLZXlzOiBhbnlbXSwgbmFtZTogc3RyaW5nKTogYW55IHtcblx0Y29uc3QgYVNlbWFudGljS2V5VmFsdWVzOiBzdHJpbmdbXSA9IFtdO1xuXHRsZXQgYlNlbWFudGljS2V5Rm91bmQgPSBmYWxzZTtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzZW1hbnRpY0tleXMubGVuZ3RoOyBpKyspIHtcblx0XHRhU2VtYW50aWNLZXlWYWx1ZXMucHVzaChzZW1hbnRpY0tleXNbaV0udmFsdWUpO1xuXHRcdGlmIChzZW1hbnRpY0tleXNbaV0udmFsdWUgPT09IG5hbWUpIHtcblx0XHRcdGJTZW1hbnRpY0tleUZvdW5kID0gdHJ1ZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHtcblx0XHR2YWx1ZXM6IGFTZW1hbnRpY0tleVZhbHVlcyxcblx0XHRzZW1hbnRpY0tleUZvdW5kOiBiU2VtYW50aWNLZXlGb3VuZFxuXHR9O1xufVxuXG5mdW5jdGlvbiBfZmluZFByb3BlcnRpZXMoc2VtYW50aWNLZXlWYWx1ZXM6IGFueVtdLCBmaWVsZEdyb3VwUHJvcGVydGllczogYW55W10pIHtcblx0bGV0IHNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXAgPSBmYWxzZTtcblx0bGV0IHNQcm9wZXJ0eVBhdGg7XG5cdGlmIChzZW1hbnRpY0tleVZhbHVlcyAmJiBzZW1hbnRpY0tleVZhbHVlcy5sZW5ndGggPj0gMSAmJiBmaWVsZEdyb3VwUHJvcGVydGllcyAmJiBmaWVsZEdyb3VwUHJvcGVydGllcy5sZW5ndGggPj0gMSkge1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgc2VtYW50aWNLZXlWYWx1ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGlmIChbc2VtYW50aWNLZXlWYWx1ZXNbaV1dLnNvbWUoKHRtcCkgPT4gZmllbGRHcm91cFByb3BlcnRpZXMuaW5kZXhPZih0bXApID49IDApKSB7XG5cdFx0XHRcdHNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXAgPSB0cnVlO1xuXHRcdFx0XHRzUHJvcGVydHlQYXRoID0gc2VtYW50aWNLZXlWYWx1ZXNbaV07XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4ge1xuXHRcdHNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXA6IHNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXAsXG5cdFx0ZmllbGRHcm91cFByb3BlcnR5UGF0aDogc1Byb3BlcnR5UGF0aFxuXHR9O1xufVxuXG5mdW5jdGlvbiBfZmluZFNlbWFudGljS2V5VmFsdWVzSW5GaWVsZEdyb3VwKGRhdGFGaWVsZEdyb3VwOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIHwgbnVsbCwgc2VtYW50aWNLZXlWYWx1ZXM6IFtdKTogYW55IHtcblx0Y29uc3QgYVByb3BlcnRpZXM6IGFueVtdID0gW107XG5cdGxldCBfcHJvcGVydGllc0ZvdW5kOiB7IHNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXA6IGJvb2xlYW47IGZpZWxkR3JvdXBQcm9wZXJ0eVBhdGg6IGFueSB9ID0ge1xuXHRcdHNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXA6IGZhbHNlLFxuXHRcdGZpZWxkR3JvdXBQcm9wZXJ0eVBhdGg6IHVuZGVmaW5lZFxuXHR9O1xuXHRpZiAoXG5cdFx0ZGF0YUZpZWxkR3JvdXAgJiZcblx0XHRkYXRhRmllbGRHcm91cC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiAmJlxuXHRcdGRhdGFGaWVsZEdyb3VwLlRhcmdldD8uJHRhcmdldD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkZpZWxkR3JvdXBUeXBlXG5cdCkge1xuXHRcdGRhdGFGaWVsZEdyb3VwLlRhcmdldC4kdGFyZ2V0LkRhdGE/LmZvckVhY2goKGlubmVyRGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PiB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChpbm5lckRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkIHx8IGlubmVyRGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsKSAmJlxuXHRcdFx0XHRpbm5lckRhdGFGaWVsZC5WYWx1ZVxuXHRcdFx0KSB7XG5cdFx0XHRcdGFQcm9wZXJ0aWVzLnB1c2goaW5uZXJEYXRhRmllbGQuVmFsdWUucGF0aCk7XG5cdFx0XHR9XG5cdFx0XHRfcHJvcGVydGllc0ZvdW5kID0gX2ZpbmRQcm9wZXJ0aWVzKHNlbWFudGljS2V5VmFsdWVzLCBhUHJvcGVydGllcyk7XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRzZW1hbnRpY0tleUhhc1Byb3BlcnR5SW5GaWVsZEdyb3VwOiBfcHJvcGVydGllc0ZvdW5kLnNlbWFudGljS2V5SGFzUHJvcGVydHlJbkZpZWxkR3JvdXAsXG5cdFx0cHJvcGVydHlQYXRoOiBfcHJvcGVydGllc0ZvdW5kLmZpZWxkR3JvdXBQcm9wZXJ0eVBhdGhcblx0fTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGRlZmF1bHQgZm9ybWF0IG9wdGlvbnMgd2l0aCBkcmFmdEluZGljYXRvciBmb3IgYSBjb2x1bW4uXG4gKlxuICogQHBhcmFtIG5hbWVcbiAqIEBwYXJhbSBzZW1hbnRpY0tleXNcbiAqIEBwYXJhbSBpc0ZpZWxkR3JvdXBDb2x1bW5cbiAqIEBwYXJhbSBkYXRhRmllbGRHcm91cFxuICogQHJldHVybnMgQ29sbGVjdGlvbiBvZiBmb3JtYXQgb3B0aW9ucyB3aXRoIGRlZmF1bHQgdmFsdWVzXG4gKi9cbmZ1bmN0aW9uIGdldERlZmF1bHREcmFmdEluZGljYXRvckZvckNvbHVtbihcblx0bmFtZTogc3RyaW5nLFxuXHRzZW1hbnRpY0tleXM6IGFueVtdLFxuXHRpc0ZpZWxkR3JvdXBDb2x1bW46IGJvb2xlYW4sXG5cdGRhdGFGaWVsZEdyb3VwOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzIHwgbnVsbFxuKSB7XG5cdGlmICghc2VtYW50aWNLZXlzKSB7XG5cdFx0cmV0dXJuIHt9O1xuXHR9XG5cdGNvbnN0IHNlbWFudGljS2V5ID0gX2ZpbmRTZW1hbnRpY0tleVZhbHVlcyhzZW1hbnRpY0tleXMsIG5hbWUpO1xuXHRjb25zdCBzZW1hbnRpY0tleUluRmllbGRHcm91cCA9IF9maW5kU2VtYW50aWNLZXlWYWx1ZXNJbkZpZWxkR3JvdXAoZGF0YUZpZWxkR3JvdXAsIHNlbWFudGljS2V5LnZhbHVlcyk7XG5cdGlmIChzZW1hbnRpY0tleS5zZW1hbnRpY0tleUZvdW5kKSB7XG5cdFx0Y29uc3QgZm9ybWF0T3B0aW9uc09iajogYW55ID0ge1xuXHRcdFx0aGFzRHJhZnRJbmRpY2F0b3I6IHRydWUsXG5cdFx0XHRzZW1hbnRpY2tleXM6IHNlbWFudGljS2V5LnZhbHVlcyxcblx0XHRcdG9iamVjdFN0YXR1c1RleHRWaXNpYmlsaXR5OiBjb21waWxlRXhwcmVzc2lvbihnZXRSb3dTdGF0dXNWaXNpYmlsaXR5KG5hbWUsIGZhbHNlKSlcblx0XHR9O1xuXHRcdGlmIChpc0ZpZWxkR3JvdXBDb2x1bW4gJiYgc2VtYW50aWNLZXlJbkZpZWxkR3JvdXAuc2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cCkge1xuXHRcdFx0Zm9ybWF0T3B0aW9uc09ialtcIm9iamVjdFN0YXR1c1RleHRWaXNpYmlsaXR5XCJdID0gY29tcGlsZUV4cHJlc3Npb24oZ2V0Um93U3RhdHVzVmlzaWJpbGl0eShuYW1lLCB0cnVlKSk7XG5cdFx0XHRmb3JtYXRPcHRpb25zT2JqW1wiZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoXCJdID0gc2VtYW50aWNLZXlJbkZpZWxkR3JvdXAucHJvcGVydHlQYXRoO1xuXHRcdH1cblx0XHRyZXR1cm4gZm9ybWF0T3B0aW9uc09iajtcblx0fSBlbHNlIGlmICghc2VtYW50aWNLZXlJbkZpZWxkR3JvdXAuc2VtYW50aWNLZXlIYXNQcm9wZXJ0eUluRmllbGRHcm91cCkge1xuXHRcdHJldHVybiB7fTtcblx0fSBlbHNlIHtcblx0XHQvLyBTZW1hbnRpYyBLZXkgaGFzIGEgcHJvcGVydHkgaW4gYSBGaWVsZEdyb3VwXG5cdFx0cmV0dXJuIHtcblx0XHRcdGZpZWxkR3JvdXBEcmFmdEluZGljYXRvclByb3BlcnR5UGF0aDogc2VtYW50aWNLZXlJbkZpZWxkR3JvdXAucHJvcGVydHlQYXRoLFxuXHRcdFx0ZmllbGRHcm91cE5hbWU6IG5hbWUsXG5cdFx0XHRvYmplY3RTdGF0dXNUZXh0VmlzaWJpbGl0eTogY29tcGlsZUV4cHJlc3Npb24oZ2V0Um93U3RhdHVzVmlzaWJpbGl0eShuYW1lLCB0cnVlKSlcblx0XHR9O1xuXHR9XG59XG5cbmZ1bmN0aW9uIF9nZXRJbXBOdW1iZXIoZGF0YUZpZWxkOiBEYXRhRmllbGRUeXBlcyk6IG51bWJlciB7XG5cdGNvbnN0IGltcG9ydGFuY2UgPSBkYXRhRmllbGQ/LmFubm90YXRpb25zPy5VST8uSW1wb3J0YW5jZSBhcyBzdHJpbmc7XG5cblx0aWYgKGltcG9ydGFuY2UgJiYgaW1wb3J0YW5jZS5pbmNsdWRlcyhcIlVJLkltcG9ydGFuY2VUeXBlL0hpZ2hcIikpIHtcblx0XHRyZXR1cm4gMztcblx0fVxuXHRpZiAoaW1wb3J0YW5jZSAmJiBpbXBvcnRhbmNlLmluY2x1ZGVzKFwiVUkuSW1wb3J0YW5jZVR5cGUvTWVkaXVtXCIpKSB7XG5cdFx0cmV0dXJuIDI7XG5cdH1cblx0aWYgKGltcG9ydGFuY2UgJiYgaW1wb3J0YW5jZS5pbmNsdWRlcyhcIlVJLkltcG9ydGFuY2VUeXBlL0xvd1wiKSkge1xuXHRcdHJldHVybiAxO1xuXHR9XG5cdHJldHVybiAwO1xufVxuXG5mdW5jdGlvbiBfZ2V0RGF0YUZpZWxkSW1wb3J0YW5jZShkYXRhRmllbGQ6IERhdGFGaWVsZFR5cGVzKTogSW1wb3J0YW5jZSB7XG5cdGNvbnN0IGltcG9ydGFuY2UgPSBkYXRhRmllbGQ/LmFubm90YXRpb25zPy5VST8uSW1wb3J0YW5jZSBhcyBzdHJpbmc7XG5cdHJldHVybiBpbXBvcnRhbmNlID8gKGltcG9ydGFuY2Uuc3BsaXQoXCIvXCIpWzFdIGFzIEltcG9ydGFuY2UpIDogSW1wb3J0YW5jZS5Ob25lO1xufVxuXG5mdW5jdGlvbiBfZ2V0TWF4SW1wb3J0YW5jZShmaWVsZHM6IERhdGFGaWVsZFR5cGVzW10pOiBJbXBvcnRhbmNlIHtcblx0aWYgKGZpZWxkcyAmJiBmaWVsZHMubGVuZ3RoID4gMCkge1xuXHRcdGxldCBtYXhJbXBOdW1iZXIgPSAtMTtcblx0XHRsZXQgaW1wTnVtYmVyID0gLTE7XG5cdFx0bGV0IERhdGFGaWVsZFdpdGhNYXhJbXBvcnRhbmNlO1xuXHRcdGZvciAoY29uc3QgZmllbGQgb2YgZmllbGRzKSB7XG5cdFx0XHRpbXBOdW1iZXIgPSBfZ2V0SW1wTnVtYmVyKGZpZWxkKTtcblx0XHRcdGlmIChpbXBOdW1iZXIgPiBtYXhJbXBOdW1iZXIpIHtcblx0XHRcdFx0bWF4SW1wTnVtYmVyID0gaW1wTnVtYmVyO1xuXHRcdFx0XHREYXRhRmllbGRXaXRoTWF4SW1wb3J0YW5jZSA9IGZpZWxkO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gX2dldERhdGFGaWVsZEltcG9ydGFuY2UoRGF0YUZpZWxkV2l0aE1heEltcG9ydGFuY2UgYXMgRGF0YUZpZWxkVHlwZXMpO1xuXHR9XG5cdHJldHVybiBJbXBvcnRhbmNlLk5vbmU7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW1wb3J0YW5jZSB2YWx1ZSBmb3IgYSBjb2x1bW4uXG4gKlxuICogQHBhcmFtIGRhdGFGaWVsZFxuICogQHBhcmFtIHNlbWFudGljS2V5c1xuICogQHJldHVybnMgVGhlIGltcG9ydGFuY2UgdmFsdWVcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEltcG9ydGFuY2UoZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzLCBzZW1hbnRpY0tleXM6IFNlbWFudGljS2V5KTogSW1wb3J0YW5jZSB8IHVuZGVmaW5lZCB7XG5cdC8vRXZhbHVhdGUgZGVmYXVsdCBJbXBvcnRhbmNlIGlzIG5vdCBzZXQgZXhwbGljaXRseVxuXHRsZXQgZmllbGRzV2l0aEltcG9ydGFuY2UsIG1hcFNlbWFudGljS2V5czogYW55O1xuXHQvL0NoZWNrIGlmIHNlbWFudGljS2V5cyBhcmUgZGVmaW5lZCBhdCB0aGUgRW50aXR5U2V0IGxldmVsXG5cdGlmIChzZW1hbnRpY0tleXMgJiYgc2VtYW50aWNLZXlzLmxlbmd0aCA+IDApIHtcblx0XHRtYXBTZW1hbnRpY0tleXMgPSBzZW1hbnRpY0tleXMubWFwKGZ1bmN0aW9uIChrZXkpIHtcblx0XHRcdHJldHVybiBrZXkudmFsdWU7XG5cdFx0fSk7XG5cdH1cblx0aWYgKCFkYXRhRmllbGQpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGlmIChkYXRhRmllbGQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24pIHtcblx0XHRjb25zdCBmaWVsZEdyb3VwRGF0YSA9IChkYXRhRmllbGQgYXMgYW55KS5UYXJnZXRbXCIkdGFyZ2V0XCJdW1wiRGF0YVwiXSBhcyBGaWVsZEdyb3VwVHlwZSxcblx0XHRcdGZpZWxkR3JvdXBIYXNTZW1hbnRpY0tleSA9XG5cdFx0XHRcdGZpZWxkR3JvdXBEYXRhICYmXG5cdFx0XHRcdChmaWVsZEdyb3VwRGF0YSBhcyBhbnkpLnNvbWUoZnVuY3Rpb24gKGZpZWxkR3JvdXBEYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpIHtcblx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0KGZpZWxkR3JvdXBEYXRhRmllbGQgYXMgdW5rbm93biBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlPy5wYXRoICYmXG5cdFx0XHRcdFx0XHRmaWVsZEdyb3VwRGF0YUZpZWxkLiRUeXBlICE9PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uICYmXG5cdFx0XHRcdFx0XHRtYXBTZW1hbnRpY0tleXMgJiZcblx0XHRcdFx0XHRcdG1hcFNlbWFudGljS2V5cy5pbmNsdWRlcygoZmllbGRHcm91cERhdGFGaWVsZCBhcyB1bmtub3duIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWU/LnBhdGgpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSk7XG5cdFx0Ly9JZiBhIEZpZWxkR3JvdXAgY29udGFpbnMgYSBzZW1hbnRpY0tleSwgaW1wb3J0YW5jZSBzZXQgdG8gSGlnaFxuXHRcdGlmIChmaWVsZEdyb3VwSGFzU2VtYW50aWNLZXkpIHtcblx0XHRcdHJldHVybiBJbXBvcnRhbmNlLkhpZ2g7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vSWYgdGhlIERhdGFGaWVsZEZvckFubm90YXRpb24gaGFzIGFuIEltcG9ydGFuY2Ugd2UgdGFrZSBpdFxuXHRcdFx0aWYgKGRhdGFGaWVsZD8uYW5ub3RhdGlvbnM/LlVJPy5JbXBvcnRhbmNlKSB7XG5cdFx0XHRcdHJldHVybiBfZ2V0RGF0YUZpZWxkSW1wb3J0YW5jZShkYXRhRmllbGQgYXMgdW5rbm93biBhcyBEYXRhRmllbGRUeXBlcyk7XG5cdFx0XHR9XG5cdFx0XHQvLyBlbHNlIHRoZSBoaWdoZXN0IGltcG9ydGFuY2UgKGlmIGFueSkgaXMgcmV0dXJuZWRcblx0XHRcdGZpZWxkc1dpdGhJbXBvcnRhbmNlID1cblx0XHRcdFx0ZmllbGRHcm91cERhdGEgJiZcblx0XHRcdFx0KGZpZWxkR3JvdXBEYXRhIGFzIGFueSkuZmlsdGVyKGZ1bmN0aW9uIChpdGVtOiBEYXRhRmllbGRUeXBlcykge1xuXHRcdFx0XHRcdHJldHVybiBpdGVtPy5hbm5vdGF0aW9ucz8uVUk/LkltcG9ydGFuY2U7XG5cdFx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIF9nZXRNYXhJbXBvcnRhbmNlKGZpZWxkc1dpdGhJbXBvcnRhbmNlIGFzIERhdGFGaWVsZFR5cGVzW10pO1xuXHRcdH1cblx0XHQvL0lmIHRoZSBjdXJyZW50IGZpZWxkIGlzIGEgc2VtYW50aWNLZXksIGltcG9ydGFuY2Ugc2V0IHRvIEhpZ2hcblx0fVxuXHRyZXR1cm4gKGRhdGFGaWVsZCBhcyBEYXRhRmllbGRUeXBlcykuVmFsdWUgJiZcblx0XHQoZGF0YUZpZWxkIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWU/LnBhdGggJiZcblx0XHRtYXBTZW1hbnRpY0tleXMgJiZcblx0XHRtYXBTZW1hbnRpY0tleXMuaW5jbHVkZXMoKGRhdGFGaWVsZCBhcyBEYXRhRmllbGRUeXBlcykuVmFsdWUucGF0aClcblx0XHQ/IEltcG9ydGFuY2UuSGlnaFxuXHRcdDogX2dldERhdGFGaWVsZEltcG9ydGFuY2UoZGF0YUZpZWxkIGFzIHVua25vd24gYXMgRGF0YUZpZWxkVHlwZXMpO1xufVxuXG4vKipcbiAqIFJldHVybnMgbGluZSBpdGVtcyBmcm9tIG1ldGFkYXRhIGFubm90YXRpb25zLlxuICpcbiAqIEBwYXJhbSBsaW5lSXRlbUFubm90YXRpb24gQ29sbGVjdGlvbiBvZiBkYXRhIGZpZWxkcyB3aXRoIHRoZWlyIGFubm90YXRpb25zXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGggVGhlIHZpc3VhbGl6YXRpb24gcGF0aFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgY29sdW1ucyBmcm9tIHRoZSBhbm5vdGF0aW9uc1xuICovXG5jb25zdCBnZXRDb2x1bW5zRnJvbUFubm90YXRpb25zID0gZnVuY3Rpb24gKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSB7XG5cdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25FbnRpdHlUeXBlKGxpbmVJdGVtQW5ub3RhdGlvbiksXG5cdFx0YW5ub3RhdGlvbkNvbHVtbnM6IEFubm90YXRpb25UYWJsZUNvbHVtbltdID0gW10sXG5cdFx0Y29sdW1uc1RvQmVDcmVhdGVkOiBSZWNvcmQ8c3RyaW5nLCBQcm9wZXJ0eT4gPSB7fSxcblx0XHRub25Tb3J0YWJsZUNvbHVtbnM6IHN0cmluZ1tdID0gZ2V0Tm9uU29ydGFibGVQcm9wZXJ0aWVzUmVzdHJpY3Rpb25zKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkpLFxuXHRcdHRhYmxlTWFuaWZlc3RTZXR0aW5nczogVGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24gPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpLFxuXHRcdHRhYmxlVHlwZTogVGFibGVUeXBlID0gdGFibGVNYW5pZmVzdFNldHRpbmdzPy50YWJsZVNldHRpbmdzPy50eXBlIHx8IFwiUmVzcG9uc2l2ZVRhYmxlXCI7XG5cdGNvbnN0IHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvbjogc3RyaW5nW10gPSBbXTtcblx0Y29uc3Qgc2VtYW50aWNLZXlzOiBTZW1hbnRpY0tleSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbnNCeVRlcm0oXCJDb21tb25cIiwgQ29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljS2V5LCBbXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKClcblx0XSlbMF07XG5cdGlmIChsaW5lSXRlbUFubm90YXRpb24pIHtcblx0XHRsaW5lSXRlbUFubm90YXRpb24uZm9yRWFjaCgobGluZUl0ZW0pID0+IHtcblx0XHRcdGlmICghX2lzVmFsaWRDb2x1bW4obGluZUl0ZW0pKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGxldCBleHBvcnRTZXR0aW5nczogQ29sdW1uRXhwb3J0U2V0dGluZ3MgfCBudWxsID0gbnVsbDtcblx0XHRcdGNvbnN0IHNlbWFudGljT2JqZWN0QW5ub3RhdGlvblBhdGggPVxuXHRcdFx0XHRpc0RhdGFGaWVsZFR5cGVzKGxpbmVJdGVtKSAmJiBsaW5lSXRlbS5WYWx1ZT8uJHRhcmdldD8uZnVsbHlRdWFsaWZpZWROYW1lXG5cdFx0XHRcdFx0PyBnZXRTZW1hbnRpY09iamVjdFBhdGgoY29udmVydGVyQ29udGV4dCwgbGluZUl0ZW0pXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHRjb25zdCByZWxhdGl2ZVBhdGggPSBfZ2V0UmVsYXRpdmVQYXRoKGxpbmVJdGVtKTtcblx0XHRcdGxldCByZWxhdGVkUHJvcGVydHlOYW1lczogc3RyaW5nW107XG5cdFx0XHQvLyBEZXRlcm1pbmUgcHJvcGVydGllcyB3aGljaCBhcmUgY29uc3VtZWQgYnkgdGhpcyBMaW5lSXRlbS5cblx0XHRcdGNvbnN0IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mbzogQ29tcGxleFByb3BlcnR5SW5mbyA9IGNvbGxlY3RSZWxhdGVkUHJvcGVydGllc1JlY3Vyc2l2ZWx5KGxpbmVJdGVtLCBjb252ZXJ0ZXJDb250ZXh0LCB0YWJsZVR5cGUpO1xuXHRcdFx0Y29uc3QgcmVsYXRlZFByb3BlcnRpZXM6IGFueSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5wcm9wZXJ0aWVzO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRsaW5lSXRlbS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiAmJlxuXHRcdFx0XHRsaW5lSXRlbS5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5GaWVsZEdyb3VwVHlwZVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmtleXMocmVsYXRlZFByb3BlcnRpZXNJbmZvLnByb3BlcnRpZXMpLmZpbHRlcigoa2V5KSA9PiB7XG5cdFx0XHRcdFx0bGV0IGlzU3RhdGljYWxseUhpZGRlbjtcblx0XHRcdFx0XHRpZiAocmVsYXRlZFByb3BlcnRpZXNba2V5XS5hbm5vdGF0aW9ucz8uVUkpIHtcblx0XHRcdFx0XHRcdGlzU3RhdGljYWxseUhpZGRlbiA9IGlzUmVmZXJlbmNlUHJvcGVydHlTdGF0aWNhbGx5SGlkZGVuKHJlbGF0ZWRQcm9wZXJ0aWVzW2tleV0uYW5ub3RhdGlvbnM/LlVJPy5EYXRhRmllbGREZWZhdWx0KTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0aXNTdGF0aWNhbGx5SGlkZGVuID0gaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4ocmVsYXRlZFByb3BlcnRpZXNba2V5XSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiAhaXNTdGF0aWNhbGx5SGlkZGVuO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0eU5hbWVzID0gT2JqZWN0LmtleXMocmVsYXRlZFByb3BlcnRpZXNJbmZvLnByb3BlcnRpZXMpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgYWRkaXRpb25hbFByb3BlcnR5TmFtZXM6IHN0cmluZ1tdID0gT2JqZWN0LmtleXMocmVsYXRlZFByb3BlcnRpZXNJbmZvLmFkZGl0aW9uYWxQcm9wZXJ0aWVzKTtcblx0XHRcdGNvbnN0IGdyb3VwUGF0aDogc3RyaW5nID0gX3NsaWNlQXRTbGFzaChyZWxhdGl2ZVBhdGgsIHRydWUsIGZhbHNlKTtcblx0XHRcdGNvbnN0IGlzR3JvdXA6IGJvb2xlYW4gPSBncm91cFBhdGggIT0gcmVsYXRpdmVQYXRoO1xuXHRcdFx0Y29uc3Qgc0xhYmVsOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBnZXRMYWJlbChsaW5lSXRlbSwgaXNHcm91cCk7XG5cdFx0XHRjb25zdCBuYW1lID0gX2dldEFubm90YXRpb25Db2x1bW5OYW1lKGxpbmVJdGVtKTtcblx0XHRcdGNvbnN0IGlzRmllbGRHcm91cENvbHVtbjogYm9vbGVhbiA9IGdyb3VwUGF0aC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXBcIikgPiAtMTtcblx0XHRcdGNvbnN0IHNob3dEYXRhRmllbGRzTGFiZWw6IGJvb2xlYW4gPSBpc0ZpZWxkR3JvdXBDb2x1bW5cblx0XHRcdFx0PyBfZ2V0U2hvd0RhdGFGaWVsZHNMYWJlbChuYW1lLCB2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dClcblx0XHRcdFx0OiBmYWxzZTtcblx0XHRcdGNvbnN0IGRhdGFUeXBlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBnZXREYXRhRmllbGREYXRhVHlwZShsaW5lSXRlbSk7XG5cdFx0XHRjb25zdCBzRGF0ZUlucHV0Rm9ybWF0OiBzdHJpbmcgfCB1bmRlZmluZWQgPSBkYXRhVHlwZSA9PT0gXCJFZG0uRGF0ZVwiID8gXCJZWVlZLU1NLUREXCIgOiB1bmRlZmluZWQ7XG5cdFx0XHRjb25zdCBmb3JtYXRPcHRpb25zID0gX2dldERlZmF1bHRGb3JtYXRPcHRpb25zRm9yVGFibGUoXG5cdFx0XHRcdGdldERlZmF1bHREcmFmdEluZGljYXRvckZvckNvbHVtbihuYW1lLCBzZW1hbnRpY0tleXMsIGlzRmllbGRHcm91cENvbHVtbiwgbGluZUl0ZW0pXG5cdFx0XHQpO1xuXHRcdFx0bGV0IGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9uczogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGxpbmVJdGVtLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uICYmXG5cdFx0XHRcdGxpbmVJdGVtLlRhcmdldD8uJHRhcmdldD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkZpZWxkR3JvdXBUeXBlXG5cdFx0XHQpIHtcblx0XHRcdFx0ZmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zID0gX2dldEZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyhsaW5lSXRlbSwgZm9ybWF0T3B0aW9ucyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoX2lzRXhwb3J0YWJsZUNvbHVtbihsaW5lSXRlbSkpIHtcblx0XHRcdFx0Ly9leGNsdWRlIHRoZSB0eXBlcyBsaXN0ZWQgYWJvdmUgZm9yIHRoZSBFeHBvcnQgKGdlbmVyYXRlcyBlcnJvciBvbiBFeHBvcnQgYXMgUERGKVxuXHRcdFx0XHRleHBvcnRTZXR0aW5ncyA9IHtcblx0XHRcdFx0XHR0ZW1wbGF0ZTogcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFNldHRpbmdzVGVtcGxhdGUsXG5cdFx0XHRcdFx0d3JhcDogcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFNldHRpbmdzV3JhcHBpbmcsXG5cdFx0XHRcdFx0dHlwZTogZGF0YVR5cGUgPyBfZ2V0RXhwb3J0RGF0YVR5cGUoZGF0YVR5cGUsIHJlbGF0ZWRQcm9wZXJ0eU5hbWVzLmxlbmd0aCA+IDEpIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdGlucHV0Rm9ybWF0OiBzRGF0ZUlucHV0Rm9ybWF0LFxuXHRcdFx0XHRcdGRlbGltaXRlcjogZGF0YVR5cGUgPT09IFwiRWRtLkludDY0XCJcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXROYW1lKSB7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudW5pdFByb3BlcnR5ID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFVuaXROYW1lO1xuXHRcdFx0XHRcdGV4cG9ydFNldHRpbmdzLnR5cGUgPSBcIkN1cnJlbmN5XCI7IC8vIEZvcmNlIHRvIGEgY3VycmVuY3kgYmVjYXVzZSB0aGVyZSdzIGEgdW5pdFByb3BlcnR5IChvdGhlcndpc2UgdGhlIHZhbHVlIGlzbid0IHByb3Blcmx5IGZvcm1hdHRlZCB3aGVuIGV4cG9ydGVkKVxuXHRcdFx0XHR9IGVsc2UgaWYgKHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRVbml0U3RyaW5nKSB7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudW5pdCA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRVbml0U3RyaW5nO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VGltZXpvbmVOYW1lKSB7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudGltZXpvbmVQcm9wZXJ0eSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5leHBvcnRUaW1lem9uZU5hbWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAocmVsYXRlZFByb3BlcnRpZXNJbmZvLmV4cG9ydFRpbWV6b25lU3RyaW5nKSB7XG5cdFx0XHRcdFx0ZXhwb3J0U2V0dGluZ3MudGltZXpvbmUgPSByZWxhdGVkUHJvcGVydGllc0luZm8uZXhwb3J0VGltZXpvbmVTdHJpbmc7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Y29uc3QgcHJvcGVydHlUeXBlQ29uZmlnID0gZGF0YVR5cGUgJiYgZ2V0VHlwZUNvbmZpZyhsaW5lSXRlbSwgZGF0YVR5cGUpO1xuXHRcdFx0Y29uc3Qgb1R5cGVDb25maWcgPSBwcm9wZXJ0eVR5cGVDb25maWdcblx0XHRcdFx0PyB7XG5cdFx0XHRcdFx0XHRjbGFzc05hbWU6IGRhdGFUeXBlLFxuXHRcdFx0XHRcdFx0b0Zvcm1hdE9wdGlvbnM6IHtcblx0XHRcdFx0XHRcdFx0Li4uZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0XHRcdFx0Li4ucHJvcGVydHlUeXBlQ29uZmlnLmZvcm1hdE9wdGlvbnNcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRvQ29uc3RyYWludHM6IHByb3BlcnR5VHlwZUNvbmZpZy5jb25zdHJhaW50c1xuXHRcdFx0XHQgIH1cblx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHRjb25zdCB2aXN1YWxTZXR0aW5nczogVmlzdWFsU2V0dGluZ3MgPSB7fTtcblx0XHRcdGlmICghZGF0YVR5cGUgfHwgIW9UeXBlQ29uZmlnKSB7XG5cdFx0XHRcdC8vIGZvciBjaGFydHNcblx0XHRcdFx0dmlzdWFsU2V0dGluZ3Mud2lkdGhDYWxjdWxhdGlvbiA9IG51bGw7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG9Db2x1bW46IGFueSA9IHtcblx0XHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGxpbmVJdGVtKSxcblx0XHRcdFx0dHlwZTogQ29sdW1uVHlwZS5Bbm5vdGF0aW9uLFxuXHRcdFx0XHRsYWJlbDogc0xhYmVsLFxuXHRcdFx0XHRncm91cExhYmVsOiBpc0dyb3VwID8gZ2V0TGFiZWwobGluZUl0ZW0pIDogbnVsbCxcblx0XHRcdFx0Z3JvdXA6IGlzR3JvdXAgPyBncm91cFBhdGggOiBudWxsLFxuXHRcdFx0XHRGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnM6IGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyxcblx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChsaW5lSXRlbS5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdFx0XHRzZW1hbnRpY09iamVjdFBhdGg6IHNlbWFudGljT2JqZWN0QW5ub3RhdGlvblBhdGgsXG5cdFx0XHRcdGF2YWlsYWJpbGl0eTogaXNEYXRhRmllbGRBbHdheXNIaWRkZW4obGluZUl0ZW0pID8gQXZhaWxhYmlsaXR5VHlwZS5IaWRkZW4gOiBBdmFpbGFiaWxpdHlUeXBlLkRlZmF1bHQsXG5cdFx0XHRcdG5hbWU6IG5hbWUsXG5cdFx0XHRcdHNob3dEYXRhRmllbGRzTGFiZWw6IHNob3dEYXRhRmllbGRzTGFiZWwsXG5cdFx0XHRcdHJlbGF0aXZlUGF0aDogcmVsYXRpdmVQYXRoLFxuXHRcdFx0XHRzb3J0YWJsZTogX2lzQ29sdW1uU29ydGFibGUobGluZUl0ZW0sIHJlbGF0aXZlUGF0aCwgbm9uU29ydGFibGVDb2x1bW5zKSxcblx0XHRcdFx0cHJvcGVydHlJbmZvczogcmVsYXRlZFByb3BlcnR5TmFtZXMubGVuZ3RoID8gcmVsYXRlZFByb3BlcnR5TmFtZXMgOiB1bmRlZmluZWQsXG5cdFx0XHRcdGFkZGl0aW9uYWxQcm9wZXJ0eUluZm9zOiBhZGRpdGlvbmFsUHJvcGVydHlOYW1lcy5sZW5ndGggPiAwID8gYWRkaXRpb25hbFByb3BlcnR5TmFtZXMgOiB1bmRlZmluZWQsXG5cdFx0XHRcdGV4cG9ydFNldHRpbmdzOiBleHBvcnRTZXR0aW5ncyxcblx0XHRcdFx0d2lkdGg6IGxpbmVJdGVtLmFubm90YXRpb25zPy5IVE1MNT8uQ3NzRGVmYXVsdHM/LndpZHRoIHx8IHVuZGVmaW5lZCxcblx0XHRcdFx0aW1wb3J0YW5jZTogZ2V0SW1wb3J0YW5jZShsaW5lSXRlbSBhcyBEYXRhRmllbGRUeXBlcywgc2VtYW50aWNLZXlzKSxcblx0XHRcdFx0aXNOYXZpZ2FibGU6IHRydWUsXG5cdFx0XHRcdGZvcm1hdE9wdGlvbnM6IGZvcm1hdE9wdGlvbnMsXG5cdFx0XHRcdGNhc2VTZW5zaXRpdmU6IGlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZShjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdFx0dHlwZUNvbmZpZzogb1R5cGVDb25maWcsXG5cdFx0XHRcdHZpc3VhbFNldHRpbmdzOiB2aXN1YWxTZXR0aW5ncyxcblx0XHRcdFx0dGltZXpvbmVUZXh0OiBleHBvcnRTZXR0aW5ncz8udGltZXpvbmUsXG5cdFx0XHRcdGlzUGFydE9mTGluZUl0ZW06IHRydWVcblx0XHRcdH07XG5cdFx0XHRjb25zdCBzVG9vbHRpcCA9IF9nZXRUb29sdGlwKGxpbmVJdGVtKTtcblx0XHRcdGlmIChzVG9vbHRpcCkge1xuXHRcdFx0XHRvQ29sdW1uLnRvb2x0aXAgPSBzVG9vbHRpcDtcblx0XHRcdH1cblx0XHRcdGlmIChyZWxhdGVkUHJvcGVydGllc0luZm8udGV4dE9ubHlQcm9wZXJ0aWVzRnJvbVRleHRBbm5vdGF0aW9uLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0dGV4dE9ubHlDb2x1bW5zRnJvbVRleHRBbm5vdGF0aW9uLnB1c2goLi4ucmVsYXRlZFByb3BlcnRpZXNJbmZvLnRleHRPbmx5UHJvcGVydGllc0Zyb21UZXh0QW5ub3RhdGlvbik7XG5cdFx0XHR9XG5cblx0XHRcdGFubm90YXRpb25Db2x1bW5zLnB1c2gob0NvbHVtbik7XG5cblx0XHRcdC8vIENvbGxlY3QgaW5mb3JtYXRpb24gb2YgcmVsYXRlZCBjb2x1bW5zIHRvIGJlIGNyZWF0ZWQuXG5cdFx0XHRyZWxhdGVkUHJvcGVydHlOYW1lcy5mb3JFYWNoKChyZWxhdGVkUHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRcdGNvbHVtbnNUb0JlQ3JlYXRlZFtyZWxhdGVkUHJvcGVydHlOYW1lXSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5wcm9wZXJ0aWVzW3JlbGF0ZWRQcm9wZXJ0eU5hbWVdO1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vIENyZWF0ZSBjb2x1bW5zIGZvciBhZGRpdGlvbmFsIHByb3BlcnRpZXMgaWRlbnRpZmllZCBmb3IgQUxQIHVzZSBjYXNlLlxuXHRcdFx0YWRkaXRpb25hbFByb3BlcnR5TmFtZXMuZm9yRWFjaCgoYWRkaXRpb25hbFByb3BlcnR5TmFtZSkgPT4ge1xuXHRcdFx0XHQvLyBJbnRlbnRpb25hbCBvdmVyd3JpdGUgYXMgd2UgcmVxdWlyZSBvbmx5IG9uZSBuZXcgUHJvcGVydHlJbmZvIGZvciBhIHJlbGF0ZWQgUHJvcGVydHkuXG5cdFx0XHRcdGNvbHVtbnNUb0JlQ3JlYXRlZFthZGRpdGlvbmFsUHJvcGVydHlOYW1lXSA9IHJlbGF0ZWRQcm9wZXJ0aWVzSW5mby5hZGRpdGlvbmFsUHJvcGVydGllc1thZGRpdGlvbmFsUHJvcGVydHlOYW1lXTtcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0Ly8gR2V0IGNvbHVtbnMgZnJvbSB0aGUgUHJvcGVydGllcyBvZiBFbnRpdHlUeXBlXG5cdHJldHVybiBnZXRDb2x1bW5zRnJvbUVudGl0eVR5cGUoXG5cdFx0Y29sdW1uc1RvQmVDcmVhdGVkLFxuXHRcdGVudGl0eVR5cGUsXG5cdFx0YW5ub3RhdGlvbkNvbHVtbnMsXG5cdFx0bm9uU29ydGFibGVDb2x1bW5zLFxuXHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0dGFibGVUeXBlLFxuXHRcdHRleHRPbmx5Q29sdW1uc0Zyb21UZXh0QW5ub3RhdGlvblxuXHQpO1xufTtcblxuLyoqXG4gKiBHZXRzIHRoZSBwcm9wZXJ0eSBuYW1lcyBmcm9tIHRoZSBtYW5pZmVzdCBhbmQgY2hlY2tzIGFnYWluc3QgZXhpc3RpbmcgcHJvcGVydGllcyBhbHJlYWR5IGFkZGVkIGJ5IGFubm90YXRpb25zLlxuICogSWYgYSBub3QgeWV0IHN0b3JlZCBwcm9wZXJ0eSBpcyBmb3VuZCBpdCBhZGRzIGl0IGZvciBzb3J0aW5nIGFuZCBmaWx0ZXJpbmcgb25seSB0byB0aGUgYW5ub3RhdGlvbkNvbHVtbnMuXG4gKlxuICogQHBhcmFtIHByb3BlcnRpZXNcbiAqIEBwYXJhbSBhbm5vdGF0aW9uQ29sdW1uc1xuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBlbnRpdHlUeXBlXG4gKiBAcmV0dXJucyBUaGUgY29sdW1ucyBmcm9tIHRoZSBhbm5vdGF0aW9uc1xuICovXG5jb25zdCBfZ2V0UHJvcGVydHlOYW1lcyA9IGZ1bmN0aW9uIChcblx0cHJvcGVydGllczogc3RyaW5nW10gfCB1bmRlZmluZWQsXG5cdGFubm90YXRpb25Db2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZVxuKTogc3RyaW5nW10gfCB1bmRlZmluZWQge1xuXHRsZXQgbWF0Y2hlZFByb3BlcnRpZXM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkO1xuXHRpZiAocHJvcGVydGllcykge1xuXHRcdG1hdGNoZWRQcm9wZXJ0aWVzID0gcHJvcGVydGllcy5tYXAoZnVuY3Rpb24gKHByb3BlcnR5UGF0aCkge1xuXHRcdFx0Y29uc3QgYW5ub3RhdGlvbkNvbHVtbiA9IGFubm90YXRpb25Db2x1bW5zLmZpbmQoZnVuY3Rpb24gKGFubm90YXRpb25Db2x1bW4pIHtcblx0XHRcdFx0cmV0dXJuIGFubm90YXRpb25Db2x1bW4ucmVsYXRpdmVQYXRoID09PSBwcm9wZXJ0eVBhdGggJiYgYW5ub3RhdGlvbkNvbHVtbi5wcm9wZXJ0eUluZm9zID09PSB1bmRlZmluZWQ7XG5cdFx0XHR9KTtcblx0XHRcdGlmIChhbm5vdGF0aW9uQ29sdW1uKSB7XG5cdFx0XHRcdHJldHVybiBhbm5vdGF0aW9uQ29sdW1uLm5hbWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCByZWxhdGVkQ29sdW1ucyA9IF9jcmVhdGVSZWxhdGVkQ29sdW1ucyhcblx0XHRcdFx0XHR7IFtwcm9wZXJ0eVBhdGhdOiBlbnRpdHlUeXBlLnJlc29sdmVQYXRoKHByb3BlcnR5UGF0aCkgfSxcblx0XHRcdFx0XHRhbm5vdGF0aW9uQ29sdW1ucyxcblx0XHRcdFx0XHRbXSxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdGVudGl0eVR5cGUsXG5cdFx0XHRcdFx0W11cblx0XHRcdFx0KTtcblx0XHRcdFx0YW5ub3RhdGlvbkNvbHVtbnMucHVzaChyZWxhdGVkQ29sdW1uc1swXSk7XG5cdFx0XHRcdHJldHVybiByZWxhdGVkQ29sdW1uc1swXS5uYW1lO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIG1hdGNoZWRQcm9wZXJ0aWVzO1xufTtcblxuY29uc3QgX2FwcGVuZEN1c3RvbVRlbXBsYXRlID0gZnVuY3Rpb24gKHByb3BlcnRpZXM6IHN0cmluZ1tdKTogc3RyaW5nIHtcblx0cmV0dXJuIHByb3BlcnRpZXNcblx0XHQubWFwKChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0cmV0dXJuIGB7JHtwcm9wZXJ0aWVzLmluZGV4T2YocHJvcGVydHkpfX1gO1xuXHRcdH0pXG5cdFx0LmpvaW4oYCR7XCJcXG5cIn1gKTtcbn07XG5cbi8qKlxuICogUmV0dXJucyB0YWJsZSBjb2x1bW4gZGVmaW5pdGlvbnMgZnJvbSBtYW5pZmVzdC5cbiAqXG4gKiBUaGVzZSBtYXkgYmUgY3VzdG9tIGNvbHVtbnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QsIHNsb3QgY29sdW1ucyBjb21pbmcgdGhyb3VnaFxuICogYSBidWlsZGluZyBibG9jaywgb3IgYW5ub3RhdGlvbiBjb2x1bW5zIHRvIG92ZXJ3cml0ZSBhbm5vdGF0aW9uLWJhc2VkIGNvbHVtbnMuXG4gKlxuICogQHBhcmFtIGNvbHVtbnNcbiAqIEBwYXJhbSBhbm5vdGF0aW9uQ29sdW1uc1xuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEBwYXJhbSBlbnRpdHlUeXBlXG4gKiBAcGFyYW0gbmF2aWdhdGlvblNldHRpbmdzXG4gKiBAcmV0dXJucyBUaGUgY29sdW1ucyBmcm9tIHRoZSBtYW5pZmVzdFxuICovXG5jb25zdCBnZXRDb2x1bW5zRnJvbU1hbmlmZXN0ID0gZnVuY3Rpb24gKFxuXHRjb2x1bW5zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW4gfCBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW5Gb3JPdmVycmlkZT4sXG5cdGFubm90YXRpb25Db2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0bmF2aWdhdGlvblNldHRpbmdzPzogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvblxuKTogUmVjb3JkPHN0cmluZywgTWFuaWZlc3RDb2x1bW4+IHtcblx0Y29uc3QgaW50ZXJuYWxDb2x1bW5zOiBSZWNvcmQ8c3RyaW5nLCBNYW5pZmVzdENvbHVtbj4gPSB7fTtcblxuXHRmdW5jdGlvbiBpc0Fubm90YXRpb25Db2x1bW4oXG5cdFx0Y29sdW1uOiBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW4gfCBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW5Gb3JPdmVycmlkZSxcblx0XHRrZXk6IHN0cmluZ1xuXHQpOiBjb2x1bW4gaXMgQ3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uRm9yT3ZlcnJpZGUge1xuXHRcdHJldHVybiBhbm5vdGF0aW9uQ29sdW1ucy5zb21lKChhbm5vdGF0aW9uQ29sdW1uKSA9PiBhbm5vdGF0aW9uQ29sdW1uLmtleSA9PT0ga2V5KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGlzU2xvdENvbHVtbihtYW5pZmVzdENvbHVtbjogYW55KTogbWFuaWZlc3RDb2x1bW4gaXMgRnJhZ21lbnREZWZpbmVkU2xvdENvbHVtbiB7XG5cdFx0cmV0dXJuIG1hbmlmZXN0Q29sdW1uLnR5cGUgPT09IENvbHVtblR5cGUuU2xvdDtcblx0fVxuXG5cdGZ1bmN0aW9uIGlzQ3VzdG9tQ29sdW1uKG1hbmlmZXN0Q29sdW1uOiBhbnkpOiBtYW5pZmVzdENvbHVtbiBpcyBNYW5pZmVzdERlZmluZWRDdXN0b21Db2x1bW4ge1xuXHRcdHJldHVybiBtYW5pZmVzdENvbHVtbi50eXBlID09PSB1bmRlZmluZWQgJiYgISFtYW5pZmVzdENvbHVtbi50ZW1wbGF0ZTtcblx0fVxuXG5cdGZ1bmN0aW9uIF91cGRhdGVMaW5rZWRQcm9wZXJ0aWVzT25DdXN0b21Db2x1bW5zKHByb3BlcnR5SW5mb3M6IHN0cmluZ1tdLCBhbm5vdGF0aW9uVGFibGVDb2x1bW5zOiBBbm5vdGF0aW9uVGFibGVDb2x1bW5bXSkge1xuXHRcdGNvbnN0IG5vblNvcnRhYmxlQ29sdW1uczogc3RyaW5nW10gPSBnZXROb25Tb3J0YWJsZVByb3BlcnRpZXNSZXN0cmljdGlvbnMoY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKSk7XG5cdFx0cHJvcGVydHlJbmZvcy5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuXHRcdFx0YW5ub3RhdGlvblRhYmxlQ29sdW1ucy5mb3JFYWNoKChwcm9wKSA9PiB7XG5cdFx0XHRcdGlmIChwcm9wLm5hbWUgPT09IHByb3BlcnR5KSB7XG5cdFx0XHRcdFx0cHJvcC5zb3J0YWJsZSA9IG5vblNvcnRhYmxlQ29sdW1ucy5pbmRleE9mKHByb3BlcnR5LnJlcGxhY2UoXCJQcm9wZXJ0eTo6XCIsIFwiXCIpKSA9PT0gLTE7XG5cdFx0XHRcdFx0cHJvcC5pc0dyb3VwYWJsZSA9IHByb3Auc29ydGFibGU7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG5cblx0Zm9yIChjb25zdCBrZXkgaW4gY29sdW1ucykge1xuXHRcdGNvbnN0IG1hbmlmZXN0Q29sdW1uID0gY29sdW1uc1trZXldO1xuXHRcdEtleUhlbHBlci52YWxpZGF0ZUtleShrZXkpO1xuXG5cdFx0Ly8gQmFzZVRhYmxlQ29sdW1uXG5cdFx0Y29uc3QgYmFzZVRhYmxlQ29sdW1uID0ge1xuXHRcdFx0a2V5OiBrZXksXG5cdFx0XHR3aWR0aDogbWFuaWZlc3RDb2x1bW4ud2lkdGggfHwgdW5kZWZpbmVkLFxuXHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0YW5jaG9yOiBtYW5pZmVzdENvbHVtbi5wb3NpdGlvbj8uYW5jaG9yLFxuXHRcdFx0XHRwbGFjZW1lbnQ6IG1hbmlmZXN0Q29sdW1uLnBvc2l0aW9uID09PSB1bmRlZmluZWQgPyBQbGFjZW1lbnQuQWZ0ZXIgOiBtYW5pZmVzdENvbHVtbi5wb3NpdGlvbi5wbGFjZW1lbnRcblx0XHRcdH0sXG5cdFx0XHRjYXNlU2Vuc2l0aXZlOiBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUoY29udmVydGVyQ29udGV4dClcblx0XHR9O1xuXG5cdFx0aWYgKGlzQW5ub3RhdGlvbkNvbHVtbihtYW5pZmVzdENvbHVtbiwga2V5KSkge1xuXHRcdFx0Y29uc3QgcHJvcGVydGllc1RvT3ZlcndyaXRlQW5ub3RhdGlvbkNvbHVtbjogQ3VzdG9tRWxlbWVudDxBbm5vdGF0aW9uVGFibGVDb2x1bW5Gb3JPdmVycmlkZT4gPSB7XG5cdFx0XHRcdC4uLmJhc2VUYWJsZUNvbHVtbixcblx0XHRcdFx0aW1wb3J0YW5jZTogbWFuaWZlc3RDb2x1bW4/LmltcG9ydGFuY2UsXG5cdFx0XHRcdGhvcml6b250YWxBbGlnbjogbWFuaWZlc3RDb2x1bW4/Lmhvcml6b250YWxBbGlnbixcblx0XHRcdFx0YXZhaWxhYmlsaXR5OiBtYW5pZmVzdENvbHVtbj8uYXZhaWxhYmlsaXR5LFxuXHRcdFx0XHR0eXBlOiBDb2x1bW5UeXBlLkFubm90YXRpb24sXG5cdFx0XHRcdGlzTmF2aWdhYmxlOiBpc0Fubm90YXRpb25Db2x1bW4obWFuaWZlc3RDb2x1bW4sIGtleSlcblx0XHRcdFx0XHQ/IHVuZGVmaW5lZFxuXHRcdFx0XHRcdDogaXNBY3Rpb25OYXZpZ2FibGUobWFuaWZlc3RDb2x1bW4sIG5hdmlnYXRpb25TZXR0aW5ncywgdHJ1ZSksXG5cdFx0XHRcdHNldHRpbmdzOiBtYW5pZmVzdENvbHVtbi5zZXR0aW5ncyxcblx0XHRcdFx0Zm9ybWF0T3B0aW9uczogX2dldERlZmF1bHRGb3JtYXRPcHRpb25zRm9yVGFibGUobWFuaWZlc3RDb2x1bW4uZm9ybWF0T3B0aW9ucylcblx0XHRcdH07XG5cdFx0XHRpbnRlcm5hbENvbHVtbnNba2V5XSA9IHByb3BlcnRpZXNUb092ZXJ3cml0ZUFubm90YXRpb25Db2x1bW47XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5SW5mb3M6IHN0cmluZ1tdIHwgdW5kZWZpbmVkID0gX2dldFByb3BlcnR5TmFtZXMoXG5cdFx0XHRcdG1hbmlmZXN0Q29sdW1uLnByb3BlcnRpZXMsXG5cdFx0XHRcdGFubm90YXRpb25Db2x1bW5zLFxuXHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRlbnRpdHlUeXBlXG5cdFx0XHQpO1xuXHRcdFx0Y29uc3QgYmFzZU1hbmlmZXN0Q29sdW1uID0ge1xuXHRcdFx0XHQuLi5iYXNlVGFibGVDb2x1bW4sXG5cdFx0XHRcdGhlYWRlcjogbWFuaWZlc3RDb2x1bW4uaGVhZGVyLFxuXHRcdFx0XHRpbXBvcnRhbmNlOiBtYW5pZmVzdENvbHVtbj8uaW1wb3J0YW5jZSB8fCBJbXBvcnRhbmNlLk5vbmUsXG5cdFx0XHRcdGhvcml6b250YWxBbGlnbjogbWFuaWZlc3RDb2x1bW4/Lmhvcml6b250YWxBbGlnbiB8fCBIb3Jpem9udGFsQWxpZ24uQmVnaW4sXG5cdFx0XHRcdGF2YWlsYWJpbGl0eTogbWFuaWZlc3RDb2x1bW4/LmF2YWlsYWJpbGl0eSB8fCBBdmFpbGFiaWxpdHlUeXBlLkRlZmF1bHQsXG5cdFx0XHRcdHRlbXBsYXRlOiBtYW5pZmVzdENvbHVtbi50ZW1wbGF0ZSxcblx0XHRcdFx0cHJvcGVydHlJbmZvczogcHJvcGVydHlJbmZvcyxcblx0XHRcdFx0ZXhwb3J0U2V0dGluZ3M6IHByb3BlcnR5SW5mb3Ncblx0XHRcdFx0XHQ/IHtcblx0XHRcdFx0XHRcdFx0dGVtcGxhdGU6IF9hcHBlbmRDdXN0b21UZW1wbGF0ZShwcm9wZXJ0eUluZm9zKSxcblx0XHRcdFx0XHRcdFx0d3JhcDogISEocHJvcGVydHlJbmZvcy5sZW5ndGggPiAxKVxuXHRcdFx0XHRcdCAgfVxuXHRcdFx0XHRcdDogbnVsbCxcblx0XHRcdFx0aWQ6IGBDdXN0b21Db2x1bW46OiR7a2V5fWAsXG5cdFx0XHRcdG5hbWU6IGBDdXN0b21Db2x1bW46OiR7a2V5fWAsXG5cdFx0XHRcdC8vTmVlZGVkIGZvciBNREM6XG5cdFx0XHRcdGZvcm1hdE9wdGlvbnM6IHsgdGV4dExpbmVzRWRpdDogNCB9LFxuXHRcdFx0XHRpc0dyb3VwYWJsZTogZmFsc2UsXG5cdFx0XHRcdGlzTmF2aWdhYmxlOiBmYWxzZSxcblx0XHRcdFx0c29ydGFibGU6IGZhbHNlLFxuXHRcdFx0XHR2aXN1YWxTZXR0aW5nczogeyB3aWR0aENhbGN1bGF0aW9uOiBudWxsIH1cblx0XHRcdH07XG5cdFx0XHRpZiAocHJvcGVydHlJbmZvcykge1xuXHRcdFx0XHRfdXBkYXRlTGlua2VkUHJvcGVydGllc09uQ3VzdG9tQ29sdW1ucyhwcm9wZXJ0eUluZm9zLCBhbm5vdGF0aW9uQ29sdW1ucyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChpc1Nsb3RDb2x1bW4obWFuaWZlc3RDb2x1bW4pKSB7XG5cdFx0XHRcdGNvbnN0IGN1c3RvbVRhYmxlQ29sdW1uOiBDdXN0b21FbGVtZW50PEN1c3RvbUJhc2VkVGFibGVDb2x1bW4+ID0ge1xuXHRcdFx0XHRcdC4uLmJhc2VNYW5pZmVzdENvbHVtbixcblx0XHRcdFx0XHR0eXBlOiBDb2x1bW5UeXBlLlNsb3Rcblx0XHRcdFx0fTtcblx0XHRcdFx0aW50ZXJuYWxDb2x1bW5zW2tleV0gPSBjdXN0b21UYWJsZUNvbHVtbjtcblx0XHRcdH0gZWxzZSBpZiAoaXNDdXN0b21Db2x1bW4obWFuaWZlc3RDb2x1bW4pKSB7XG5cdFx0XHRcdGNvbnN0IGN1c3RvbVRhYmxlQ29sdW1uOiBDdXN0b21FbGVtZW50PEN1c3RvbUJhc2VkVGFibGVDb2x1bW4+ID0ge1xuXHRcdFx0XHRcdC4uLmJhc2VNYW5pZmVzdENvbHVtbixcblx0XHRcdFx0XHR0eXBlOiBDb2x1bW5UeXBlLkRlZmF1bHRcblx0XHRcdFx0fTtcblx0XHRcdFx0aW50ZXJuYWxDb2x1bW5zW2tleV0gPSBjdXN0b21UYWJsZUNvbHVtbjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IG1lc3NhZ2UgPSBgVGhlIGFubm90YXRpb24gY29sdW1uICcke2tleX0nIHJlZmVyZW5jZWQgaW4gdGhlIG1hbmlmZXN0IGlzIG5vdCBmb3VuZGA7XG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0XHQuZ2V0RGlhZ25vc3RpY3MoKVxuXHRcdFx0XHRcdC5hZGRJc3N1ZShcblx0XHRcdFx0XHRcdElzc3VlQ2F0ZWdvcnkuTWFuaWZlc3QsXG5cdFx0XHRcdFx0XHRJc3N1ZVNldmVyaXR5Lkxvdyxcblx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRJc3N1ZUNhdGVnb3J5VHlwZSxcblx0XHRcdFx0XHRcdElzc3VlQ2F0ZWdvcnlUeXBlPy5Bbm5vdGF0aW9uQ29sdW1ucz8uSW52YWxpZEtleVxuXHRcdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBpbnRlcm5hbENvbHVtbnM7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0UDEzbk1vZGUoXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uOiBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uXG4pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXI6IE1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGNvbnN0IHRhYmxlTWFuaWZlc3RTZXR0aW5nczogVGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24gPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpO1xuXHRjb25zdCB2YXJpYW50TWFuYWdlbWVudDogVmFyaWFudE1hbmFnZW1lbnRUeXBlID0gbWFuaWZlc3RXcmFwcGVyLmdldFZhcmlhbnRNYW5hZ2VtZW50KCk7XG5cdGNvbnN0IGFQZXJzb25hbGl6YXRpb246IHN0cmluZ1tdID0gW107XG5cdGNvbnN0IGlzQW5hbHl0aWNhbFRhYmxlID0gdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24udHlwZSA9PT0gXCJBbmFseXRpY2FsVGFibGVcIjtcblx0Y29uc3QgaXNSZXNwb25zaXZlVGFibGUgPSB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi50eXBlID09PSBcIlJlc3BvbnNpdmVUYWJsZVwiO1xuXHRpZiAodGFibGVNYW5pZmVzdFNldHRpbmdzPy50YWJsZVNldHRpbmdzPy5wZXJzb25hbGl6YXRpb24gIT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIFBlcnNvbmFsaXphdGlvbiBjb25maWd1cmVkIGluIG1hbmlmZXN0LlxuXHRcdGNvbnN0IHBlcnNvbmFsaXphdGlvbjogYW55ID0gdGFibGVNYW5pZmVzdFNldHRpbmdzLnRhYmxlU2V0dGluZ3MucGVyc29uYWxpemF0aW9uO1xuXHRcdGlmIChwZXJzb25hbGl6YXRpb24gPT09IHRydWUpIHtcblx0XHRcdC8vIFRhYmxlIHBlcnNvbmFsaXphdGlvbiBmdWxseSBlbmFibGVkLlxuXHRcdFx0c3dpdGNoICh0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi50eXBlKSB7XG5cdFx0XHRcdGNhc2UgXCJBbmFseXRpY2FsVGFibGVcIjpcblx0XHRcdFx0XHRyZXR1cm4gXCJTb3J0LENvbHVtbixGaWx0ZXIsR3JvdXAsQWdncmVnYXRlXCI7XG5cdFx0XHRcdGNhc2UgXCJSZXNwb25zaXZlVGFibGVcIjpcblx0XHRcdFx0XHRyZXR1cm4gXCJTb3J0LENvbHVtbixGaWx0ZXIsR3JvdXBcIjtcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRyZXR1cm4gXCJTb3J0LENvbHVtbixGaWx0ZXJcIjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBwZXJzb25hbGl6YXRpb24gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdC8vIFNwZWNpZmljIHBlcnNvbmFsaXphdGlvbiBvcHRpb25zIGVuYWJsZWQgaW4gbWFuaWZlc3QuIFVzZSB0aGVtIGFzIGlzLlxuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi5zb3J0KSB7XG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIlNvcnRcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLmNvbHVtbikge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJDb2x1bW5cIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLmZpbHRlcikge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJGaWx0ZXJcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLmdyb3VwICYmIChpc0FuYWx5dGljYWxUYWJsZSB8fCBpc1Jlc3BvbnNpdmVUYWJsZSkpIHtcblx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiR3JvdXBcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLmFnZ3JlZ2F0ZSAmJiBpc0FuYWx5dGljYWxUYWJsZSkge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJBZ2dyZWdhdGVcIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gYVBlcnNvbmFsaXphdGlvbi5sZW5ndGggPiAwID8gYVBlcnNvbmFsaXphdGlvbi5qb2luKFwiLFwiKSA6IHVuZGVmaW5lZDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0Ly8gTm8gcGVyc29uYWxpemF0aW9uIGNvbmZpZ3VyZWQgaW4gbWFuaWZlc3QuXG5cdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiU29ydFwiKTtcblx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJDb2x1bW5cIik7XG5cdFx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0KSB7XG5cdFx0XHRpZiAodmFyaWFudE1hbmFnZW1lbnQgPT09IFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5Db250cm9sIHx8IF9pc0ZpbHRlckJhckhpZGRlbihtYW5pZmVzdFdyYXBwZXIsIGNvbnZlcnRlckNvbnRleHQpKSB7XG5cdFx0XHRcdC8vIEZlYXR1cmUgcGFyaXR5IHdpdGggVjIuXG5cdFx0XHRcdC8vIEVuYWJsZSB0YWJsZSBmaWx0ZXJpbmcgYnkgZGVmYXVsdCBvbmx5IGluIGNhc2Ugb2YgQ29udHJvbCBsZXZlbCB2YXJpYW50IG1hbmFnZW1lbnQuXG5cdFx0XHRcdC8vIE9yIHdoZW4gdGhlIExSIGZpbHRlciBiYXIgaXMgaGlkZGVuIHZpYSBtYW5pZmVzdCBzZXR0aW5nXG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIkZpbHRlclwiKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiRmlsdGVyXCIpO1xuXHRcdH1cblxuXHRcdGlmIChpc0FuYWx5dGljYWxUYWJsZSkge1xuXHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiR3JvdXBcIik7XG5cdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJBZ2dyZWdhdGVcIik7XG5cdFx0fVxuXHRcdGlmIChpc1Jlc3BvbnNpdmVUYWJsZSkge1xuXHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiR3JvdXBcIik7XG5cdFx0fVxuXHRcdHJldHVybiBhUGVyc29uYWxpemF0aW9uLmpvaW4oXCIsXCIpO1xuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIEJvb2xlYW4gdmFsdWUgc3VnZ2VzdGluZyBpZiBhIGZpbHRlciBiYXIgaXMgYmVpbmcgdXNlZCBvbiB0aGUgcGFnZS5cbiAqXG4gKiBDaGFydCBoYXMgYSBkZXBlbmRlbmN5IHRvIGZpbHRlciBiYXIgKGlzc3VlIHdpdGggbG9hZGluZyBkYXRhKS4gT25jZSByZXNvbHZlZCwgdGhlIGNoZWNrIGZvciBjaGFydCBzaG91bGQgYmUgcmVtb3ZlZCBoZXJlLlxuICogVW50aWwgdGhlbiwgaGlkaW5nIGZpbHRlciBiYXIgaXMgbm93IGFsbG93ZWQgaWYgYSBjaGFydCBpcyBiZWluZyB1c2VkIG9uIExSLlxuICpcbiAqIEBwYXJhbSBtYW5pZmVzdFdyYXBwZXIgTWFuaWZlc3Qgc2V0dGluZ3MgZ2V0dGVyIGZvciB0aGUgcGFnZVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgQm9vbGVhbiBzdWdnZXN0aW5nIGlmIGEgZmlsdGVyIGJhciBpcyBiZWluZyB1c2VkIG9uIHRoZSBwYWdlLlxuICovXG5mdW5jdGlvbiBfaXNGaWx0ZXJCYXJIaWRkZW4obWFuaWZlc3RXcmFwcGVyOiBNYW5pZmVzdFdyYXBwZXIsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBib29sZWFuIHtcblx0cmV0dXJuIChcblx0XHRtYW5pZmVzdFdyYXBwZXIuaXNGaWx0ZXJCYXJIaWRkZW4oKSAmJlxuXHRcdCFjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMoKSAmJlxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgIT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2Vcblx0KTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgSlNPTiBzdHJpbmcgY29udGFpbmluZyB0aGUgc29ydCBjb25kaXRpb25zIGZvciB0aGUgcHJlc2VudGF0aW9uIHZhcmlhbnQuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uIFByZXNlbnRhdGlvbiB2YXJpYW50IGFubm90YXRpb25cbiAqIEBwYXJhbSBjb2x1bW5zIFRhYmxlIGNvbHVtbnMgcHJvY2Vzc2VkIGJ5IHRoZSBjb252ZXJ0ZXJcbiAqIEByZXR1cm5zIFNvcnQgY29uZGl0aW9ucyBmb3IgYSBwcmVzZW50YXRpb24gdmFyaWFudC5cbiAqL1xuZnVuY3Rpb24gZ2V0U29ydENvbmRpdGlvbnMoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uOiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSB8IHVuZGVmaW5lZCxcblx0Y29sdW1uczogVGFibGVDb2x1bW5bXVxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0Ly8gQ3VycmVudGx5IG5hdmlnYXRpb24gcHJvcGVydHkgaXMgbm90IHN1cHBvcnRlZCBhcyBzb3J0ZXJcblx0Y29uc3Qgbm9uU29ydGFibGVQcm9wZXJ0aWVzID0gZ2V0Tm9uU29ydGFibGVQcm9wZXJ0aWVzUmVzdHJpY3Rpb25zKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkpO1xuXHRsZXQgc29ydENvbmRpdGlvbnM6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPy5Tb3J0T3JkZXIpIHtcblx0XHRjb25zdCBzb3J0ZXJzOiBTb3J0ZXJUeXBlW10gPSBbXTtcblx0XHRjb25zdCBjb25kaXRpb25zID0ge1xuXHRcdFx0c29ydGVyczogc29ydGVyc1xuXHRcdH07XG5cdFx0cHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24uU29ydE9yZGVyLmZvckVhY2goKGNvbmRpdGlvbikgPT4ge1xuXHRcdFx0Y29uc3QgY29uZGl0aW9uUHJvcGVydHkgPSBjb25kaXRpb24uUHJvcGVydHk7XG5cdFx0XHRpZiAoY29uZGl0aW9uUHJvcGVydHkgJiYgbm9uU29ydGFibGVQcm9wZXJ0aWVzLmluZGV4T2YoY29uZGl0aW9uUHJvcGVydHkuJHRhcmdldD8ubmFtZSkgPT09IC0xKSB7XG5cdFx0XHRcdGNvbnN0IGluZm9OYW1lID0gY29udmVydFByb3BlcnR5UGF0aHNUb0luZm9OYW1lcyhbY29uZGl0aW9uUHJvcGVydHldLCBjb2x1bW5zKVswXTtcblx0XHRcdFx0aWYgKGluZm9OYW1lKSB7XG5cdFx0XHRcdFx0Y29uZGl0aW9ucy5zb3J0ZXJzLnB1c2goe1xuXHRcdFx0XHRcdFx0bmFtZTogaW5mb05hbWUsXG5cdFx0XHRcdFx0XHRkZXNjZW5kaW5nOiAhIWNvbmRpdGlvbi5EZXNjZW5kaW5nXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRzb3J0Q29uZGl0aW9ucyA9IGNvbmRpdGlvbnMuc29ydGVycy5sZW5ndGggPyBKU09OLnN0cmluZ2lmeShjb25kaXRpb25zKSA6IHVuZGVmaW5lZDtcblx0fVxuXHRyZXR1cm4gc29ydENvbmRpdGlvbnM7XG59XG5cbi8qKlxuICogQ29udmVydHMgYW4gYXJyYXkgb2YgcHJvcGVydHlQYXRoIHRvIGFuIGFycmF5IG9mIHByb3BlcnR5SW5mbyBuYW1lcy5cbiAqXG4gKiBAcGFyYW0gcGF0aHMgdGhlIGFycmF5IHRvIGJlIGNvbnZlcnRlZFxuICogQHBhcmFtIGNvbHVtbnMgdGhlIGFycmF5IG9mIHByb3BlcnR5SW5mb3NcbiAqIEByZXR1cm5zIGFuIGFycmF5IG9mIHByb3BlcnR5SW5mbyBuYW1lc1xuICovXG5cbmZ1bmN0aW9uIGNvbnZlcnRQcm9wZXJ0eVBhdGhzVG9JbmZvTmFtZXMocGF0aHM6IFByb3BlcnR5UGF0aFtdLCBjb2x1bW5zOiBUYWJsZUNvbHVtbltdKTogc3RyaW5nW10ge1xuXHRjb25zdCBpbmZvTmFtZXM6IHN0cmluZ1tdID0gW107XG5cdGxldCBwcm9wZXJ0eUluZm86IFRhYmxlQ29sdW1uIHwgdW5kZWZpbmVkLCBhbm5vdGF0aW9uQ29sdW1uOiBBbm5vdGF0aW9uVGFibGVDb2x1bW47XG5cdHBhdGhzLmZvckVhY2goKGN1cnJlbnRQYXRoKSA9PiB7XG5cdFx0aWYgKGN1cnJlbnRQYXRoPy52YWx1ZSkge1xuXHRcdFx0cHJvcGVydHlJbmZvID0gY29sdW1ucy5maW5kKChjb2x1bW4pID0+IHtcblx0XHRcdFx0YW5ub3RhdGlvbkNvbHVtbiA9IGNvbHVtbiBhcyBBbm5vdGF0aW9uVGFibGVDb2x1bW47XG5cdFx0XHRcdHJldHVybiAhYW5ub3RhdGlvbkNvbHVtbi5wcm9wZXJ0eUluZm9zICYmIGFubm90YXRpb25Db2x1bW4ucmVsYXRpdmVQYXRoID09PSBjdXJyZW50UGF0aD8udmFsdWU7XG5cdFx0XHR9KTtcblx0XHRcdGlmIChwcm9wZXJ0eUluZm8pIHtcblx0XHRcdFx0aW5mb05hbWVzLnB1c2gocHJvcGVydHlJbmZvLm5hbWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIGluZm9OYW1lcztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgSlNPTiBzdHJpbmcgY29udGFpbmluZyBQcmVzZW50YXRpb24gVmFyaWFudCBncm91cCBjb25kaXRpb25zLlxuICpcbiAqIEBwYXJhbSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiBQcmVzZW50YXRpb24gdmFyaWFudCBhbm5vdGF0aW9uXG4gKiBAcGFyYW0gY29sdW1ucyBDb252ZXJ0ZXIgcHJvY2Vzc2VkIHRhYmxlIGNvbHVtbnNcbiAqIEBwYXJhbSB0YWJsZVR5cGUgVGhlIHRhYmxlIHR5cGUuXG4gKiBAcmV0dXJucyBHcm91cCBjb25kaXRpb25zIGZvciBhIFByZXNlbnRhdGlvbiB2YXJpYW50LlxuICovXG5mdW5jdGlvbiBnZXRHcm91cENvbmRpdGlvbnMoXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uOiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSB8IHVuZGVmaW5lZCxcblx0Y29sdW1uczogVGFibGVDb2x1bW5bXSxcblx0dGFibGVUeXBlOiBzdHJpbmdcbik6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGxldCBncm91cENvbmRpdGlvbnM6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPy5Hcm91cEJ5KSB7XG5cdFx0bGV0IGFHcm91cEJ5ID0gcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24uR3JvdXBCeTtcblx0XHRpZiAodGFibGVUeXBlID09PSBcIlJlc3BvbnNpdmVUYWJsZVwiKSB7XG5cdFx0XHRhR3JvdXBCeSA9IGFHcm91cEJ5LnNsaWNlKDAsIDEpO1xuXHRcdH1cblx0XHRjb25zdCBhR3JvdXBMZXZlbHMgPSBjb252ZXJ0UHJvcGVydHlQYXRoc1RvSW5mb05hbWVzKGFHcm91cEJ5LCBjb2x1bW5zKS5tYXAoKGluZm9OYW1lKSA9PiB7XG5cdFx0XHRyZXR1cm4geyBuYW1lOiBpbmZvTmFtZSB9O1xuXHRcdH0pO1xuXG5cdFx0Z3JvdXBDb25kaXRpb25zID0gYUdyb3VwTGV2ZWxzLmxlbmd0aCA/IEpTT04uc3RyaW5naWZ5KHsgZ3JvdXBMZXZlbHM6IGFHcm91cExldmVscyB9KSA6IHVuZGVmaW5lZDtcblx0fVxuXHRyZXR1cm4gZ3JvdXBDb25kaXRpb25zO1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBKU09OIHN0cmluZyBjb250YWluaW5nIFByZXNlbnRhdGlvbiBWYXJpYW50IGFnZ3JlZ2F0ZSBjb25kaXRpb25zLlxuICpcbiAqIEBwYXJhbSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiBQcmVzZW50YXRpb24gdmFyaWFudCBhbm5vdGF0aW9uXG4gKiBAcGFyYW0gY29sdW1ucyBDb252ZXJ0ZXIgcHJvY2Vzc2VkIHRhYmxlIGNvbHVtbnNcbiAqIEByZXR1cm5zIEdyb3VwIGNvbmRpdGlvbnMgZm9yIGEgUHJlc2VudGF0aW9uIHZhcmlhbnQuXG4gKi9cbmZ1bmN0aW9uIGdldEFnZ3JlZ2F0ZUNvbmRpdGlvbnMoXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uOiBQcmVzZW50YXRpb25WYXJpYW50VHlwZSB8IHVuZGVmaW5lZCxcblx0Y29sdW1uczogVGFibGVDb2x1bW5bXVxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0bGV0IGFnZ3JlZ2F0ZUNvbmRpdGlvbnM6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPy5Ub3RhbCkge1xuXHRcdGNvbnN0IGFUb3RhbHMgPSBwcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbi5Ub3RhbDtcblx0XHRjb25zdCBhZ2dyZWdhdGVzOiBSZWNvcmQ8c3RyaW5nLCBvYmplY3Q+ID0ge307XG5cdFx0Y29udmVydFByb3BlcnR5UGF0aHNUb0luZm9OYW1lcyhhVG90YWxzLCBjb2x1bW5zKS5mb3JFYWNoKChpbmZvTmFtZSkgPT4ge1xuXHRcdFx0YWdncmVnYXRlc1tpbmZvTmFtZV0gPSB7fTtcblx0XHR9KTtcblxuXHRcdGFnZ3JlZ2F0ZUNvbmRpdGlvbnMgPSBKU09OLnN0cmluZ2lmeShhZ2dyZWdhdGVzKTtcblx0fVxuXG5cdHJldHVybiBhZ2dyZWdhdGVDb25kaXRpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VGFibGVBbm5vdGF0aW9uQ29uZmlndXJhdGlvbihcblx0bGluZUl0ZW1Bbm5vdGF0aW9uOiBMaW5lSXRlbSB8IHVuZGVmaW5lZCxcblx0dmlzdWFsaXphdGlvblBhdGg6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb246IFRhYmxlQ29udHJvbENvbmZpZ3VyYXRpb24sXG5cdGNvbHVtbnM6IFRhYmxlQ29sdW1uW10sXG5cdHByZXNlbnRhdGlvblZhcmlhbnRBbm5vdGF0aW9uPzogUHJlc2VudGF0aW9uVmFyaWFudFR5cGUsXG5cdHZpZXdDb25maWd1cmF0aW9uPzogVmlld1BhdGhDb25maWd1cmF0aW9uXG4pOiBUYWJsZUFubm90YXRpb25Db25maWd1cmF0aW9uIHtcblx0Ly8gTmVlZCB0byBnZXQgdGhlIHRhcmdldFxuXHRjb25zdCB7IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggfSA9IHNwbGl0UGF0aCh2aXN1YWxpemF0aW9uUGF0aCk7XG5cdGNvbnN0IHRpdGxlOiBhbnkgPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKS50YXJnZXRFbnRpdHlUeXBlLmFubm90YXRpb25zPy5VST8uSGVhZGVySW5mbz8uVHlwZU5hbWVQbHVyYWw7XG5cdGNvbnN0IGVudGl0eVNldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLnRhcmdldEVudGl0eVNldDtcblx0Y29uc3QgcGFnZU1hbmlmZXN0U2V0dGluZ3M6IE1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGNvbnN0IGhhc0Fic29sdXRlUGF0aCA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoID09PSAwLFxuXHRcdHAxM25Nb2RlOiBzdHJpbmcgfCB1bmRlZmluZWQgPSBnZXRQMTNuTW9kZSh2aXN1YWxpemF0aW9uUGF0aCwgY29udmVydGVyQ29udGV4dCwgdGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24pLFxuXHRcdGlkID0gbmF2aWdhdGlvblByb3BlcnR5UGF0aCA/IGdldFRhYmxlSUQodmlzdWFsaXphdGlvblBhdGgpIDogZ2V0VGFibGVJRChjb252ZXJ0ZXJDb250ZXh0LmdldENvbnRleHRQYXRoKCksIFwiTGluZUl0ZW1cIik7XG5cdGNvbnN0IHRhcmdldENhcGFiaWxpdGllcyA9IGdldENhcGFiaWxpdHlSZXN0cmljdGlvbihjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgbmF2aWdhdGlvblRhcmdldFBhdGggPSBnZXROYXZpZ2F0aW9uVGFyZ2V0UGF0aChjb252ZXJ0ZXJDb250ZXh0LCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoKTtcblx0Y29uc3QgbmF2aWdhdGlvblNldHRpbmdzID0gcGFnZU1hbmlmZXN0U2V0dGluZ3MuZ2V0TmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24obmF2aWdhdGlvblRhcmdldFBhdGgpO1xuXHRjb25zdCBjcmVhdGlvbkJlaGF2aW91ciA9IF9nZXRDcmVhdGlvbkJlaGF2aW91cihcblx0XHRsaW5lSXRlbUFubm90YXRpb24sXG5cdFx0dGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24sXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRuYXZpZ2F0aW9uU2V0dGluZ3MsXG5cdFx0dmlzdWFsaXphdGlvblBhdGhcblx0KTtcblx0Y29uc3Qgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCA9IGdlbmVyYXRlU3RhbmRhcmRBY3Rpb25zQ29udGV4dChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdGNyZWF0aW9uQmVoYXZpb3VyLm1vZGUgYXMgQ3JlYXRpb25Nb2RlLFxuXHRcdHRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLFxuXHRcdHZpZXdDb25maWd1cmF0aW9uXG5cdCk7XG5cblx0Y29uc3QgZGVsZXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24gPSBnZXREZWxldGVWaXNpYmlsaXR5KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpO1xuXHRjb25zdCBjcmVhdGVCdXR0b25WaXNpYmlsaXR5RXhwcmVzc2lvbiA9IGdldENyZWF0ZVZpc2liaWxpdHkoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCk7XG5cdGNvbnN0IG1hc3NFZGl0QnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24gPSBnZXRNYXNzRWRpdFZpc2liaWxpdHkoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCk7XG5cdGNvbnN0IGlzSW5zZXJ0VXBkYXRlVGVtcGxhdGVkID0gZ2V0SW5zZXJ0VXBkYXRlQWN0aW9uc1RlbXBsYXRpbmcoXG5cdFx0c3RhbmRhcmRBY3Rpb25zQ29udGV4dCxcblx0XHRpc0RyYWZ0T3JTdGlja3lTdXBwb3J0ZWQoY29udmVydGVyQ29udGV4dCksXG5cdFx0Y29tcGlsZUV4cHJlc3Npb24oY3JlYXRlQnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb24pID09PSBcImZhbHNlXCJcblx0KTtcblxuXHRjb25zdCBzZWxlY3Rpb25Nb2RlID0gZ2V0U2VsZWN0aW9uTW9kZShcblx0XHRsaW5lSXRlbUFubm90YXRpb24sXG5cdFx0dmlzdWFsaXphdGlvblBhdGgsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRoYXNBYnNvbHV0ZVBhdGgsXG5cdFx0dGFyZ2V0Q2FwYWJpbGl0aWVzLFxuXHRcdGRlbGV0ZUJ1dHRvblZpc2liaWxpdHlFeHByZXNzaW9uLFxuXHRcdG1hc3NFZGl0QnV0dG9uVmlzaWJpbGl0eUV4cHJlc3Npb25cblx0KTtcblx0bGV0IHRocmVzaG9sZCA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPyAxMCA6IDMwO1xuXHRpZiAocHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24/Lk1heEl0ZW1zKSB7XG5cdFx0dGhyZXNob2xkID0gcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24uTWF4SXRlbXMudmFsdWVPZigpIGFzIG51bWJlcjtcblx0fVxuXG5cdGNvbnN0IHZhcmlhbnRNYW5hZ2VtZW50OiBWYXJpYW50TWFuYWdlbWVudFR5cGUgPSBwYWdlTWFuaWZlc3RTZXR0aW5ncy5nZXRWYXJpYW50TWFuYWdlbWVudCgpO1xuXHRjb25zdCBpc1NlYXJjaGFibGUgPSBpc1BhdGhTZWFyY2hhYmxlKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpKTtcblx0Y29uc3Qgc3RhbmRhcmRBY3Rpb25zID0ge1xuXHRcdGNyZWF0ZTogZ2V0U3RhbmRhcmRBY3Rpb25DcmVhdGUoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCksXG5cdFx0XCJkZWxldGVcIjogZ2V0U3RhbmRhcmRBY3Rpb25EZWxldGUoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCksXG5cdFx0cGFzdGU6IGdldFN0YW5kYXJkQWN0aW9uUGFzdGUoY29udmVydGVyQ29udGV4dCwgc3RhbmRhcmRBY3Rpb25zQ29udGV4dCwgaXNJbnNlcnRVcGRhdGVUZW1wbGF0ZWQpLFxuXHRcdG1hc3NFZGl0OiBnZXRTdGFuZGFyZEFjdGlvbk1hc3NFZGl0KGNvbnZlcnRlckNvbnRleHQsIHN0YW5kYXJkQWN0aW9uc0NvbnRleHQpLFxuXHRcdGNyZWF0aW9uUm93OiBnZXRDcmVhdGlvblJvdyhjb252ZXJ0ZXJDb250ZXh0LCBzdGFuZGFyZEFjdGlvbnNDb250ZXh0KVxuXHR9O1xuXG5cdHJldHVybiB7XG5cdFx0aWQ6IGlkLFxuXHRcdGVudGl0eU5hbWU6IGVudGl0eVNldCA/IGVudGl0eVNldC5uYW1lIDogXCJcIixcblx0XHRjb2xsZWN0aW9uOiBnZXRUYXJnZXRPYmplY3RQYXRoKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpKSxcblx0XHRuYXZpZ2F0aW9uUGF0aDogbmF2aWdhdGlvblByb3BlcnR5UGF0aCxcblx0XHRyb3c6IF9nZXRSb3dDb25maWd1cmF0aW9uUHJvcGVydHkoXG5cdFx0XHRsaW5lSXRlbUFubm90YXRpb24sXG5cdFx0XHR2aXN1YWxpemF0aW9uUGF0aCxcblx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRuYXZpZ2F0aW9uU2V0dGluZ3MsXG5cdFx0XHRuYXZpZ2F0aW9uVGFyZ2V0UGF0aFxuXHRcdCksXG5cdFx0cDEzbk1vZGU6IHAxM25Nb2RlLFxuXHRcdHN0YW5kYXJkQWN0aW9uczoge1xuXHRcdFx0YWN0aW9uczogc3RhbmRhcmRBY3Rpb25zLFxuXHRcdFx0aXNJbnNlcnRVcGRhdGVUZW1wbGF0ZWQ6IGlzSW5zZXJ0VXBkYXRlVGVtcGxhdGVkLFxuXHRcdFx0dXBkYXRhYmxlUHJvcGVydHlQYXRoOiBnZXRDdXJyZW50RW50aXR5U2V0VXBkYXRhYmxlUGF0aChjb252ZXJ0ZXJDb250ZXh0KVxuXHRcdH0sXG5cdFx0ZGlzcGxheU1vZGU6IGlzSW5EaXNwbGF5TW9kZShjb252ZXJ0ZXJDb250ZXh0LCB2aWV3Q29uZmlndXJhdGlvbiksXG5cdFx0Y3JlYXRlOiBjcmVhdGlvbkJlaGF2aW91cixcblx0XHRzZWxlY3Rpb25Nb2RlOiBzZWxlY3Rpb25Nb2RlLFxuXHRcdGF1dG9CaW5kT25Jbml0OlxuXHRcdFx0X2lzRmlsdGVyQmFySGlkZGVuKHBhZ2VNYW5pZmVzdFNldHRpbmdzLCBjb252ZXJ0ZXJDb250ZXh0KSB8fFxuXHRcdFx0KGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgIT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0ICYmXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgIT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2UgJiZcblx0XHRcdFx0ISh2aWV3Q29uZmlndXJhdGlvbiAmJiBwYWdlTWFuaWZlc3RTZXR0aW5ncy5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKHZpZXdDb25maWd1cmF0aW9uKSkpLFxuXHRcdHZhcmlhbnRNYW5hZ2VtZW50OiB2YXJpYW50TWFuYWdlbWVudCA9PT0gXCJDb250cm9sXCIgJiYgIXAxM25Nb2RlID8gVmFyaWFudE1hbmFnZW1lbnRUeXBlLk5vbmUgOiB2YXJpYW50TWFuYWdlbWVudCxcblx0XHR0aHJlc2hvbGQ6IHRocmVzaG9sZCxcblx0XHRzb3J0Q29uZGl0aW9uczogZ2V0U29ydENvbmRpdGlvbnMoY29udmVydGVyQ29udGV4dCwgcHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24sIGNvbHVtbnMpLFxuXHRcdHRpdGxlOiB0aXRsZSxcblx0XHRzZWFyY2hhYmxlOiB0YWJsZU1hbmlmZXN0Q29uZmlndXJhdGlvbi50eXBlICE9PSBcIkFuYWx5dGljYWxUYWJsZVwiICYmICEoaXNDb25zdGFudChpc1NlYXJjaGFibGUpICYmIGlzU2VhcmNoYWJsZS52YWx1ZSA9PT0gZmFsc2UpXG5cdH07XG59XG5cbmZ1bmN0aW9uIF9nZXRFeHBvcnREYXRhVHlwZShkYXRhVHlwZTogc3RyaW5nLCBpc0NvbXBsZXhQcm9wZXJ0eTogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcblx0bGV0IGV4cG9ydERhdGFUeXBlOiBzdHJpbmcgPSBcIlN0cmluZ1wiO1xuXHRpZiAoaXNDb21wbGV4UHJvcGVydHkpIHtcblx0XHRpZiAoZGF0YVR5cGUgPT09IFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCIpIHtcblx0XHRcdGV4cG9ydERhdGFUeXBlID0gXCJEYXRlVGltZVwiO1xuXHRcdH1cblx0XHRyZXR1cm4gZXhwb3J0RGF0YVR5cGU7XG5cdH0gZWxzZSB7XG5cdFx0c3dpdGNoIChkYXRhVHlwZSkge1xuXHRcdFx0Y2FzZSBcIkVkbS5EZWNpbWFsXCI6XG5cdFx0XHRjYXNlIFwiRWRtLkludDMyXCI6XG5cdFx0XHRjYXNlIFwiRWRtLkludDY0XCI6XG5cdFx0XHRjYXNlIFwiRWRtLkRvdWJsZVwiOlxuXHRcdFx0Y2FzZSBcIkVkbS5CeXRlXCI6XG5cdFx0XHRcdGV4cG9ydERhdGFUeXBlID0gXCJOdW1iZXJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRWRtLkRhdGVPZlRpbWVcIjpcblx0XHRcdGNhc2UgXCJFZG0uRGF0ZVwiOlxuXHRcdFx0XHRleHBvcnREYXRhVHlwZSA9IFwiRGF0ZVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIjpcblx0XHRcdFx0ZXhwb3J0RGF0YVR5cGUgPSBcIkRhdGVUaW1lXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkVkbS5UaW1lT2ZEYXlcIjpcblx0XHRcdFx0ZXhwb3J0RGF0YVR5cGUgPSBcIlRpbWVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRWRtLkJvb2xlYW5cIjpcblx0XHRcdFx0ZXhwb3J0RGF0YVR5cGUgPSBcIkJvb2xlYW5cIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRleHBvcnREYXRhVHlwZSA9IFwiU3RyaW5nXCI7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBleHBvcnREYXRhVHlwZTtcbn1cblxuLyoqXG4gKiBTcGxpdCB0aGUgdmlzdWFsaXphdGlvbiBwYXRoIGludG8gdGhlIG5hdmlnYXRpb24gcHJvcGVydHkgcGF0aCBhbmQgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGhcbiAqIEByZXR1cm5zIFRoZSBzcGxpdCBwYXRoXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcGxpdFBhdGgodmlzdWFsaXphdGlvblBhdGg6IHN0cmluZykge1xuXHRsZXQgW25hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsIGFubm90YXRpb25QYXRoXSA9IHZpc3VhbGl6YXRpb25QYXRoLnNwbGl0KFwiQFwiKTtcblxuXHRpZiAobmF2aWdhdGlvblByb3BlcnR5UGF0aC5sYXN0SW5kZXhPZihcIi9cIikgPT09IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoIC0gMSkge1xuXHRcdC8vIERyb3AgdHJhaWxpbmcgc2xhc2hcblx0XHRuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID0gbmF2aWdhdGlvblByb3BlcnR5UGF0aC5zdWJzdHIoMCwgbmF2aWdhdGlvblByb3BlcnR5UGF0aC5sZW5ndGggLSAxKTtcblx0fVxuXHRyZXR1cm4geyBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLCBhbm5vdGF0aW9uUGF0aCB9O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0U2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb24oXG5cdHNlbGVjdGlvblZhcmlhbnRQYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uIHwgdW5kZWZpbmVkIHtcblx0Y29uc3QgcmVzb2x2ZWRUYXJnZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKHNlbGVjdGlvblZhcmlhbnRQYXRoKTtcblx0Y29uc3Qgc2VsZWN0aW9uOiBTZWxlY3Rpb25WYXJpYW50VHlwZSA9IHJlc29sdmVkVGFyZ2V0LmFubm90YXRpb24gYXMgU2VsZWN0aW9uVmFyaWFudFR5cGU7XG5cblx0aWYgKHNlbGVjdGlvbikge1xuXHRcdGNvbnN0IHByb3BlcnR5TmFtZXM6IHN0cmluZ1tdID0gW107XG5cdFx0c2VsZWN0aW9uLlNlbGVjdE9wdGlvbnM/LmZvckVhY2goKHNlbGVjdE9wdGlvbjogU2VsZWN0T3B0aW9uVHlwZSkgPT4ge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlOYW1lOiBhbnkgPSBzZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lO1xuXHRcdFx0Y29uc3QgcHJvcGVydHlQYXRoOiBzdHJpbmcgPSBwcm9wZXJ0eU5hbWUudmFsdWU7XG5cdFx0XHRpZiAocHJvcGVydHlOYW1lcy5pbmRleE9mKHByb3BlcnR5UGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdHByb3BlcnR5TmFtZXMucHVzaChwcm9wZXJ0eVBhdGgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiB7XG5cdFx0XHR0ZXh0OiBzZWxlY3Rpb24/LlRleHQ/LnRvU3RyaW5nKCksXG5cdFx0XHRwcm9wZXJ0eU5hbWVzOiBwcm9wZXJ0eU5hbWVzXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBfZ2V0RnVsbFNjcmVlbkJhc2VkT25EZXZpY2UoXG5cdHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGlzSXBob25lOiBib29sZWFuXG4pOiBib29sZWFuIHtcblx0Ly8gSWYgZW5hYmxlRnVsbFNjcmVlbiBpcyBub3Qgc2V0LCB1c2UgYXMgZGVmYXVsdCB0cnVlIG9uIHBob25lIGFuZCBmYWxzZSBvdGhlcndpc2Vcblx0bGV0IGVuYWJsZUZ1bGxTY3JlZW4gPSB0YWJsZVNldHRpbmdzLmVuYWJsZUZ1bGxTY3JlZW4gPz8gaXNJcGhvbmU7XG5cdC8vIE1ha2Ugc3VyZSB0aGF0IGVuYWJsZUZ1bGxTY3JlZW4gaXMgbm90IHNldCBvbiBMaXN0UmVwb3J0IGZvciBkZXNrdG9wIG9yIHRhYmxldFxuXHRpZiAoIWlzSXBob25lICYmIGVuYWJsZUZ1bGxTY3JlZW4gJiYgY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkxpc3RSZXBvcnQpIHtcblx0XHRlbmFibGVGdWxsU2NyZWVuID0gZmFsc2U7XG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXREaWFnbm9zdGljcygpLmFkZElzc3VlKElzc3VlQ2F0ZWdvcnkuTWFuaWZlc3QsIElzc3VlU2V2ZXJpdHkuTG93LCBJc3N1ZVR5cGUuRlVMTFNDUkVFTk1PREVfTk9UX09OX0xJU1RSRVBPUlQpO1xuXHR9XG5cdHJldHVybiBlbmFibGVGdWxsU2NyZWVuO1xufVxuXG5mdW5jdGlvbiBfZ2V0TXVsdGlTZWxlY3RNb2RlKFxuXHR0YWJsZVNldHRpbmdzOiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHR0YWJsZVR5cGU6IFRhYmxlVHlwZSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0bGV0IG11bHRpU2VsZWN0TW9kZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRpZiAodGFibGVUeXBlICE9PSBcIlJlc3BvbnNpdmVUYWJsZVwiKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRzd2l0Y2ggKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkpIHtcblx0XHRjYXNlIFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0OlxuXHRcdGNhc2UgVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZTpcblx0XHRcdG11bHRpU2VsZWN0TW9kZSA9ICF0YWJsZVNldHRpbmdzLnNlbGVjdEFsbCA/IFwiQ2xlYXJBbGxcIiA6IFwiRGVmYXVsdFwiO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBUZW1wbGF0ZVR5cGUuT2JqZWN0UGFnZTpcblx0XHRcdG11bHRpU2VsZWN0TW9kZSA9IHRhYmxlU2V0dGluZ3Muc2VsZWN0QWxsID09PSBmYWxzZSA/IFwiQ2xlYXJBbGxcIiA6IFwiRGVmYXVsdFwiO1xuXHRcdFx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkudXNlSWNvblRhYkJhcigpKSB7XG5cdFx0XHRcdG11bHRpU2VsZWN0TW9kZSA9ICF0YWJsZVNldHRpbmdzLnNlbGVjdEFsbCA/IFwiQ2xlYXJBbGxcIiA6IFwiRGVmYXVsdFwiO1xuXHRcdFx0fVxuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0fVxuXG5cdHJldHVybiBtdWx0aVNlbGVjdE1vZGU7XG59XG5cbmZ1bmN0aW9uIF9nZXRUYWJsZVR5cGUoXG5cdHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdGFnZ3JlZ2F0aW9uSGVscGVyOiBBZ2dyZWdhdGlvbkhlbHBlcixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogVGFibGVUeXBlIHtcblx0bGV0IHRhYmxlVHlwZSA9IHRhYmxlU2V0dGluZ3M/LnR5cGUgfHwgXCJSZXNwb25zaXZlVGFibGVcIjtcblx0LyogIE5vdywgd2Uga2VlcCB0aGUgY29uZmlndXJhdGlvbiBpbiB0aGUgbWFuaWZlc3QsIGV2ZW4gaWYgaXQgbGVhZHMgdG8gZXJyb3JzLlxuXHRcdFdlIG9ubHkgY2hhbmdlIGlmIHdlJ3JlIG5vdCBvbiBkZXNrdG9wIGZyb20gQW5hbHl0aWNhbCB0byBSZXNwb25zaXZlLlxuXHQgKi9cblx0aWYgKHRhYmxlVHlwZSA9PT0gXCJBbmFseXRpY2FsVGFibGVcIiAmJiAhY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5pc0Rlc2t0b3AoKSkge1xuXHRcdHRhYmxlVHlwZSA9IFwiUmVzcG9uc2l2ZVRhYmxlXCI7XG5cdH1cblx0cmV0dXJuIHRhYmxlVHlwZTtcbn1cblxuZnVuY3Rpb24gX2dldEdyaWRUYWJsZU1vZGUodGFibGVUeXBlOiBUYWJsZVR5cGUsIHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sIGlzVGVtcGxhdGVMaXN0UmVwb3J0OiBib29sZWFuKTogYW55IHtcblx0aWYgKHRhYmxlVHlwZSA9PT0gXCJHcmlkVGFibGVcIikge1xuXHRcdGlmIChpc1RlbXBsYXRlTGlzdFJlcG9ydCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0cm93Q291bnRNb2RlOiBcIkF1dG9cIixcblx0XHRcdFx0cm93Q291bnQ6IFwiM1wiXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRyb3dDb3VudE1vZGU6IHRhYmxlU2V0dGluZ3Mucm93Q291bnRNb2RlID8gdGFibGVTZXR0aW5ncy5yb3dDb3VudE1vZGUgOiBcIkZpeGVkXCIsXG5cdFx0XHRcdHJvd0NvdW50OiB0YWJsZVNldHRpbmdzLnJvd0NvdW50ID8gdGFibGVTZXR0aW5ncy5yb3dDb3VudCA6IDVcblx0XHRcdH07XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB7fTtcblx0fVxufVxuXG5mdW5jdGlvbiBfZ2V0Q29uZGVuc2VkVGFibGVMYXlvdXQoX3RhYmxlVHlwZTogVGFibGVUeXBlLCBfdGFibGVTZXR0aW5nczogVGFibGVNYW5pZmVzdFNldHRpbmdzQ29uZmlndXJhdGlvbik6IGJvb2xlYW4ge1xuXHRyZXR1cm4gX3RhYmxlU2V0dGluZ3MuY29uZGVuc2VkVGFibGVMYXlvdXQgIT09IHVuZGVmaW5lZCAmJiBfdGFibGVUeXBlICE9PSBcIlJlc3BvbnNpdmVUYWJsZVwiXG5cdFx0PyBfdGFibGVTZXR0aW5ncy5jb25kZW5zZWRUYWJsZUxheW91dFxuXHRcdDogZmFsc2U7XG59XG5cbmZ1bmN0aW9uIF9nZXRUYWJsZVNlbGVjdGlvbkxpbWl0KF90YWJsZVNldHRpbmdzOiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uKTogbnVtYmVyIHtcblx0cmV0dXJuIF90YWJsZVNldHRpbmdzLnNlbGVjdEFsbCA9PT0gdHJ1ZSB8fCBfdGFibGVTZXR0aW5ncy5zZWxlY3Rpb25MaW1pdCA9PT0gMCA/IDAgOiBfdGFibGVTZXR0aW5ncy5zZWxlY3Rpb25MaW1pdCB8fCAyMDA7XG59XG5cbmZ1bmN0aW9uIF9nZXRUYWJsZUlubGluZUNyZWF0aW9uUm93Q291bnQoX3RhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24pOiBudW1iZXIge1xuXHRyZXR1cm4gX3RhYmxlU2V0dGluZ3MuY3JlYXRpb25Nb2RlPy5pbmxpbmVDcmVhdGlvblJvd0NvdW50ID8gX3RhYmxlU2V0dGluZ3MuY3JlYXRpb25Nb2RlPy5pbmxpbmVDcmVhdGlvblJvd0NvdW50IDogMjtcbn1cblxuZnVuY3Rpb24gX2dldEZpbHRlcnMoXG5cdHRhYmxlU2V0dGluZ3M6IFRhYmxlTWFuaWZlc3RTZXR0aW5nc0NvbmZpZ3VyYXRpb24sXG5cdHF1aWNrRmlsdGVyUGF0aHM6IHsgYW5ub3RhdGlvblBhdGg6IHN0cmluZyB9W10sXG5cdHF1aWNrU2VsZWN0aW9uVmFyaWFudDogYW55LFxuXHRwYXRoOiB7IGFubm90YXRpb25QYXRoOiBzdHJpbmcgfSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogYW55IHtcblx0aWYgKHF1aWNrU2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdHF1aWNrRmlsdGVyUGF0aHMucHVzaCh7IGFubm90YXRpb25QYXRoOiBwYXRoLmFubm90YXRpb25QYXRoIH0pO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0cXVpY2tGaWx0ZXJzOiB7XG5cdFx0XHRlbmFibGVkOiBjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpICE9PSBUZW1wbGF0ZVR5cGUuTGlzdFJlcG9ydCxcblx0XHRcdHNob3dDb3VudHM6IHRhYmxlU2V0dGluZ3M/LnF1aWNrVmFyaWFudFNlbGVjdGlvbj8uc2hvd0NvdW50cyxcblx0XHRcdHBhdGhzOiBxdWlja0ZpbHRlclBhdGhzXG5cdFx0fVxuXHR9O1xufVxuXG5mdW5jdGlvbiBfZ2V0RW5hYmxlRXhwb3J0KFxuXHR0YWJsZVNldHRpbmdzOiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRlbmFibGVQYXN0ZTogYm9vbGVhblxuKTogYm9vbGVhbiB7XG5cdHJldHVybiB0YWJsZVNldHRpbmdzLmVuYWJsZUV4cG9ydCAhPT0gdW5kZWZpbmVkXG5cdFx0PyB0YWJsZVNldHRpbmdzLmVuYWJsZUV4cG9ydFxuXHRcdDogY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSAhPT0gXCJPYmplY3RQYWdlXCIgfHwgZW5hYmxlUGFzdGU7XG59XG5cbmZ1bmN0aW9uIF9nZXRGaWx0ZXJDb25maWd1cmF0aW9uKFxuXHR0YWJsZVNldHRpbmdzOiBUYWJsZU1hbmlmZXN0U2V0dGluZ3NDb25maWd1cmF0aW9uLFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtIHwgdW5kZWZpbmVkLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBhbnkge1xuXHRpZiAoIWxpbmVJdGVtQW5ub3RhdGlvbikge1xuXHRcdHJldHVybiB7fTtcblx0fVxuXHRjb25zdCBxdWlja0ZpbHRlclBhdGhzOiB7IGFubm90YXRpb25QYXRoOiBzdHJpbmcgfVtdID0gW107XG5cdGNvbnN0IHRhcmdldEVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25FbnRpdHlUeXBlKGxpbmVJdGVtQW5ub3RhdGlvbik7XG5cdGxldCBxdWlja1NlbGVjdGlvblZhcmlhbnQ6IGFueTtcblx0bGV0IGZpbHRlcnM7XG5cdHRhYmxlU2V0dGluZ3M/LnF1aWNrVmFyaWFudFNlbGVjdGlvbj8ucGF0aHM/LmZvckVhY2goKHBhdGg6IHsgYW5ub3RhdGlvblBhdGg6IHN0cmluZyB9KSA9PiB7XG5cdFx0cXVpY2tTZWxlY3Rpb25WYXJpYW50ID0gdGFyZ2V0RW50aXR5VHlwZS5yZXNvbHZlUGF0aChwYXRoLmFubm90YXRpb25QYXRoKTtcblx0XHRmaWx0ZXJzID0gX2dldEZpbHRlcnModGFibGVTZXR0aW5ncywgcXVpY2tGaWx0ZXJQYXRocywgcXVpY2tTZWxlY3Rpb25WYXJpYW50LCBwYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0fSk7XG5cblx0bGV0IGhpZGVUYWJsZVRpdGxlID0gZmFsc2U7XG5cdGhpZGVUYWJsZVRpdGxlID0gISF0YWJsZVNldHRpbmdzLnF1aWNrVmFyaWFudFNlbGVjdGlvbj8uaGlkZVRhYmxlVGl0bGU7XG5cdHJldHVybiB7XG5cdFx0ZmlsdGVyczogZmlsdGVycyxcblx0XHRoZWFkZXJWaXNpYmxlOiAhKHF1aWNrU2VsZWN0aW9uVmFyaWFudCAmJiBoaWRlVGFibGVUaXRsZSlcblx0fTtcbn1cblxuZnVuY3Rpb24gX2dldENvbGxlY3RlZE5hdmlnYXRpb25Qcm9wZXJ0eUxhYmVscyhyZWxhdGl2ZVBhdGg6IHN0cmluZywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRjb25zdCBuYXZpZ2F0aW9uUHJvcGVydGllcyA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLCByZWxhdGl2ZVBhdGgpLm5hdmlnYXRpb25Qcm9wZXJ0aWVzO1xuXHRpZiAobmF2aWdhdGlvblByb3BlcnRpZXM/Lmxlbmd0aCA+IDApIHtcblx0XHRjb25zdCBjb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHM6IHN0cmluZ1tdID0gW107XG5cdFx0bmF2aWdhdGlvblByb3BlcnRpZXMuZm9yRWFjaCgobmF2UHJvcGVydHk6IGFueSkgPT4ge1xuXHRcdFx0Y29sbGVjdGVkTmF2aWdhdGlvblByb3BlcnR5TGFiZWxzLnB1c2goZ2V0TGFiZWwobmF2UHJvcGVydHkpIHx8IG5hdlByb3BlcnR5Lm5hbWUpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBjb2xsZWN0ZWROYXZpZ2F0aW9uUHJvcGVydHlMYWJlbHM7XG5cdH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uKFxuXHRsaW5lSXRlbUFubm90YXRpb246IExpbmVJdGVtIHwgdW5kZWZpbmVkLFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRjaGVja0NvbmRlbnNlZExheW91dCA9IGZhbHNlXG4pOiBUYWJsZUNvbnRyb2xDb25maWd1cmF0aW9uIHtcblx0Y29uc3QgX21hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGNvbnN0IHRhYmxlTWFuaWZlc3RTZXR0aW5nczogVGFibGVNYW5pZmVzdENvbmZpZ3VyYXRpb24gPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpO1xuXHRjb25zdCB0YWJsZVNldHRpbmdzID0gKHRhYmxlTWFuaWZlc3RTZXR0aW5ncyAmJiB0YWJsZU1hbmlmZXN0U2V0dGluZ3MudGFibGVTZXR0aW5ncykgfHwge307XG5cdGNvbnN0IGNyZWF0aW9uTW9kZSA9IHRhYmxlU2V0dGluZ3MuY3JlYXRpb25Nb2RlPy5uYW1lIHx8IENyZWF0aW9uTW9kZS5OZXdQYWdlO1xuXHRjb25zdCBlbmFibGVBdXRvQ29sdW1uV2lkdGggPSAhX21hbmlmZXN0V3JhcHBlci5pc1Bob25lKCk7XG5cdGNvbnN0IGVuYWJsZVBhc3RlID1cblx0XHR0YWJsZVNldHRpbmdzLmVuYWJsZVBhc3RlICE9PSB1bmRlZmluZWQgPyB0YWJsZVNldHRpbmdzLmVuYWJsZVBhc3RlIDogY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gXCJPYmplY3RQYWdlXCI7IC8vIFBhc3RlIGlzIGRpc2FibGVkIGJ5IGRlZmF1bHQgZXhjZXB0ZWQgZm9yIE9QXG5cdGNvbnN0IHRlbXBsYXRlVHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCk7XG5cdGNvbnN0IGRhdGFTdGF0ZUluZGljYXRvckZpbHRlciA9IHRlbXBsYXRlVHlwZSA9PT0gVGVtcGxhdGVUeXBlLkxpc3RSZXBvcnQgPyBcIkFQSS5kYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXJcIiA6IHVuZGVmaW5lZDtcblx0Y29uc3QgaXNDb25kZW5zZWRUYWJsZUxheW91dENvbXBsaWFudCA9IGNoZWNrQ29uZGVuc2VkTGF5b3V0ICYmIF9tYW5pZmVzdFdyYXBwZXIuaXNDb25kZW5zZWRMYXlvdXRDb21wbGlhbnQoKTtcblx0Y29uc3Qgb0ZpbHRlckNvbmZpZ3VyYXRpb24gPSBfZ2V0RmlsdGVyQ29uZmlndXJhdGlvbih0YWJsZVNldHRpbmdzLCBsaW5lSXRlbUFubm90YXRpb24sIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24gPSB0YWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uO1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCB0YWJsZVR5cGU6IFRhYmxlVHlwZSA9IF9nZXRUYWJsZVR5cGUodGFibGVTZXR0aW5ncywgYWdncmVnYXRpb25IZWxwZXIsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBncmlkVGFibGVSb3dNb2RlID0gX2dldEdyaWRUYWJsZU1vZGUodGFibGVUeXBlLCB0YWJsZVNldHRpbmdzLCB0ZW1wbGF0ZVR5cGUgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0KTtcblx0Y29uc3QgY29uZGVuc2VkVGFibGVMYXlvdXQgPSBfZ2V0Q29uZGVuc2VkVGFibGVMYXlvdXQodGFibGVUeXBlLCB0YWJsZVNldHRpbmdzKTtcblx0Y29uc3Qgb0NvbmZpZ3VyYXRpb24gPSB7XG5cdFx0Ly8gSWYgbm8gY3JlYXRlQXRFbmQgaXMgc3BlY2lmaWVkIGl0IHdpbGwgYmUgZmFsc2UgZm9yIElubGluZSBjcmVhdGUgYW5kIHRydWUgb3RoZXJ3aXNlXG5cdFx0Y3JlYXRlQXRFbmQ6XG5cdFx0XHR0YWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uY3JlYXRlQXRFbmQgIT09IHVuZGVmaW5lZFxuXHRcdFx0XHQ/IHRhYmxlU2V0dGluZ3MuY3JlYXRpb25Nb2RlPy5jcmVhdGVBdEVuZFxuXHRcdFx0XHQ6IGNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLklubGluZSxcblx0XHRjcmVhdGlvbk1vZGU6IGNyZWF0aW9uTW9kZSxcblx0XHRjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb246IGN1c3RvbVZhbGlkYXRpb25GdW5jdGlvbixcblx0XHRkYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXI6IGRhdGFTdGF0ZUluZGljYXRvckZpbHRlcixcblx0XHQvLyBpZiBhIGN1c3RvbSB2YWxpZGF0aW9uIGZ1bmN0aW9uIGlzIHByb3ZpZGVkLCBkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhIHNob3VsZCBub3QgYmUgY29uc2lkZXJlZCwgaS5lLiBzZXQgdG8gZmFsc2Vcblx0XHRkaXNhYmxlQWRkUm93QnV0dG9uRm9yRW1wdHlEYXRhOiAhY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uID8gISF0YWJsZVNldHRpbmdzLmNyZWF0aW9uTW9kZT8uZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YSA6IGZhbHNlLFxuXHRcdGVuYWJsZUF1dG9Db2x1bW5XaWR0aDogZW5hYmxlQXV0b0NvbHVtbldpZHRoLFxuXHRcdGVuYWJsZUV4cG9ydDogX2dldEVuYWJsZUV4cG9ydCh0YWJsZVNldHRpbmdzLCBjb252ZXJ0ZXJDb250ZXh0LCBlbmFibGVQYXN0ZSksXG5cdFx0ZW5hYmxlRnVsbFNjcmVlbjogX2dldEZ1bGxTY3JlZW5CYXNlZE9uRGV2aWNlKHRhYmxlU2V0dGluZ3MsIGNvbnZlcnRlckNvbnRleHQsIF9tYW5pZmVzdFdyYXBwZXIuaXNQaG9uZSgpKSxcblx0XHRlbmFibGVNYXNzRWRpdDogdGFibGVTZXR0aW5ncz8uZW5hYmxlTWFzc0VkaXQsXG5cdFx0ZW5hYmxlUGFzdGU6IGVuYWJsZVBhc3RlLFxuXHRcdGhlYWRlclZpc2libGU6IHRydWUsXG5cdFx0bXVsdGlTZWxlY3RNb2RlOiBfZ2V0TXVsdGlTZWxlY3RNb2RlKHRhYmxlU2V0dGluZ3MsIHRhYmxlVHlwZSwgY29udmVydGVyQ29udGV4dCksXG5cdFx0c2VsZWN0aW9uTGltaXQ6IF9nZXRUYWJsZVNlbGVjdGlvbkxpbWl0KHRhYmxlU2V0dGluZ3MpLFxuXHRcdGlubGluZUNyZWF0aW9uUm93Q291bnQ6IF9nZXRUYWJsZUlubGluZUNyZWF0aW9uUm93Q291bnQodGFibGVTZXR0aW5ncyksXG5cdFx0c2hvd1Jvd0NvdW50OiAhdGFibGVTZXR0aW5ncz8ucXVpY2tWYXJpYW50U2VsZWN0aW9uPy5zaG93Q291bnRzICYmICFfbWFuaWZlc3RXcmFwcGVyLmdldFZpZXdDb25maWd1cmF0aW9uKCk/LnNob3dDb3VudHMsXG5cdFx0dHlwZTogdGFibGVUeXBlLFxuXHRcdHVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0OiBjb25kZW5zZWRUYWJsZUxheW91dCAmJiBpc0NvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW50LFxuXHRcdGlzQ29tcGFjdFR5cGU6IF9tYW5pZmVzdFdyYXBwZXIuaXNDb21wYWN0VHlwZSgpXG5cdH07XG5cdHJldHVybiB7IC4uLm9Db25maWd1cmF0aW9uLCAuLi5ncmlkVGFibGVSb3dNb2RlLCAuLi5vRmlsdGVyQ29uZmlndXJhdGlvbiB9O1xufVxuXG5leHBvcnQgdHlwZSBjb25maWdUeXBlQ29uc3RyYWludHMgPSB7XG5cdHNjYWxlPzogbnVtYmVyO1xuXHRwcmVjaXNpb24/OiBudW1iZXI7XG5cdG1heExlbmd0aD86IG51bWJlcjtcblx0bnVsbGFibGU/OiBib29sZWFuO1xuXHRtaW5pbXVtPzogc3RyaW5nO1xuXHRtYXhpbXVtPzogc3RyaW5nO1xuXHRpc0RpZ2l0U2VxdWVuY2U/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IHR5cGUgY29uZmlnVHlwZWZvcm1hdE9wdGlvbnMgPSB7XG5cdHBhcnNlQXNTdHJpbmc/OiBib29sZWFuO1xuXHRlbXB0eVN0cmluZz86IHN0cmluZztcblx0cGFyc2VLZWVwc0VtcHR5U3RyaW5nPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIGNvbmZpZ1R5cGUgPSB7XG5cdHR5cGU6IHN0cmluZztcblx0Y29uc3RyYWludHM6IGNvbmZpZ1R5cGVDb25zdHJhaW50cztcblx0Zm9ybWF0T3B0aW9uczogY29uZmlnVHlwZWZvcm1hdE9wdGlvbnM7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gZ2V0VHlwZUNvbmZpZyhvUHJvcGVydHk6IFByb3BlcnR5IHwgRGF0YUZpZWxkQWJzdHJhY3RUeXBlcywgZGF0YVR5cGU6IHN0cmluZyB8IHVuZGVmaW5lZCk6IGFueSB7XG5cdGxldCBvVGFyZ2V0TWFwcGluZyA9IEVETV9UWVBFX01BUFBJTkdbKG9Qcm9wZXJ0eSBhcyBQcm9wZXJ0eSk/LnR5cGVdIHx8IChkYXRhVHlwZSA/IEVETV9UWVBFX01BUFBJTkdbZGF0YVR5cGVdIDogdW5kZWZpbmVkKTtcblx0aWYgKCFvVGFyZ2V0TWFwcGluZyAmJiAob1Byb3BlcnR5IGFzIFByb3BlcnR5KT8udGFyZ2V0VHlwZSAmJiAob1Byb3BlcnR5IGFzIFByb3BlcnR5KS50YXJnZXRUeXBlPy5fdHlwZSA9PT0gXCJUeXBlRGVmaW5pdGlvblwiKSB7XG5cdFx0b1RhcmdldE1hcHBpbmcgPSBFRE1fVFlQRV9NQVBQSU5HWygob1Byb3BlcnR5IGFzIFByb3BlcnR5KS50YXJnZXRUeXBlIGFzIFR5cGVEZWZpbml0aW9uKS51bmRlcmx5aW5nVHlwZV07XG5cdH1cblx0Y29uc3QgcHJvcGVydHlUeXBlQ29uZmlnOiBjb25maWdUeXBlID0ge1xuXHRcdHR5cGU6IG9UYXJnZXRNYXBwaW5nPy50eXBlLFxuXHRcdGNvbnN0cmFpbnRzOiB7fSxcblx0XHRmb3JtYXRPcHRpb25zOiB7fVxuXHR9O1xuXHRpZiAoaXNQcm9wZXJ0eShvUHJvcGVydHkpKSB7XG5cdFx0cHJvcGVydHlUeXBlQ29uZmlnLmNvbnN0cmFpbnRzID0ge1xuXHRcdFx0c2NhbGU6IG9UYXJnZXRNYXBwaW5nLmNvbnN0cmFpbnRzPy4kU2NhbGUgPyBvUHJvcGVydHkuc2NhbGUgOiB1bmRlZmluZWQsXG5cdFx0XHRwcmVjaXNpb246IG9UYXJnZXRNYXBwaW5nLmNvbnN0cmFpbnRzPy4kUHJlY2lzaW9uID8gb1Byb3BlcnR5LnByZWNpc2lvbiA6IHVuZGVmaW5lZCxcblx0XHRcdG1heExlbmd0aDogb1RhcmdldE1hcHBpbmcuY29uc3RyYWludHM/LiRNYXhMZW5ndGggPyBvUHJvcGVydHkubWF4TGVuZ3RoIDogdW5kZWZpbmVkLFxuXHRcdFx0bnVsbGFibGU6IG9UYXJnZXRNYXBwaW5nLmNvbnN0cmFpbnRzPy4kTnVsbGFibGUgPyBvUHJvcGVydHkubnVsbGFibGUgOiB1bmRlZmluZWQsXG5cdFx0XHRtaW5pbXVtOlxuXHRcdFx0XHRvVGFyZ2V0TWFwcGluZy5jb25zdHJhaW50cz8uW1wiQE9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk1pbmltdW0vJERlY2ltYWxcIl0gJiZcblx0XHRcdFx0IWlzTmFOKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVmFsaWRhdGlvbj8uTWluaW11bSlcblx0XHRcdFx0XHQ/IGAke29Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVmFsaWRhdGlvbj8uTWluaW11bX1gXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQsXG5cdFx0XHRtYXhpbXVtOlxuXHRcdFx0XHRvVGFyZ2V0TWFwcGluZy5jb25zdHJhaW50cz8uW1wiQE9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk1heGltdW0vJERlY2ltYWxcIl0gJiZcblx0XHRcdFx0IWlzTmFOKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVmFsaWRhdGlvbj8uTWF4aW11bSlcblx0XHRcdFx0XHQ/IGAke29Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVmFsaWRhdGlvbj8uTWF4aW11bX1gXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQsXG5cdFx0XHRpc0RpZ2l0U2VxdWVuY2U6XG5cdFx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZy50eXBlID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZ1wiICYmXG5cdFx0XHRcdG9UYXJnZXRNYXBwaW5nLmNvbnN0cmFpbnRzPy5bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRGlnaXRTZXF1ZW5jZVwiXSAmJlxuXHRcdFx0XHRvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbj8uSXNEaWdpdFNlcXVlbmNlXG5cdFx0XHRcdFx0PyB0cnVlXG5cdFx0XHRcdFx0OiB1bmRlZmluZWRcblx0XHR9O1xuXHR9XG5cdHByb3BlcnR5VHlwZUNvbmZpZy5mb3JtYXRPcHRpb25zID0ge1xuXHRcdHBhcnNlQXNTdHJpbmc6XG5cdFx0XHRwcm9wZXJ0eVR5cGVDb25maWc/LnR5cGU/LmluZGV4T2YoXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5JbnRcIikgPT09IDAgfHxcblx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZz8udHlwZT8uaW5kZXhPZihcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLkRvdWJsZVwiKSA9PT0gMFxuXHRcdFx0XHQ/IGZhbHNlXG5cdFx0XHRcdDogdW5kZWZpbmVkLFxuXHRcdGVtcHR5U3RyaW5nOlxuXHRcdFx0cHJvcGVydHlUeXBlQ29uZmlnPy50eXBlPy5pbmRleE9mKFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuSW50XCIpID09PSAwIHx8XG5cdFx0XHRwcm9wZXJ0eVR5cGVDb25maWc/LnR5cGU/LmluZGV4T2YoXCJzYXAudWkubW9kZWwub2RhdGEudHlwZS5Eb3VibGVcIikgPT09IDBcblx0XHRcdFx0PyBcIlwiXG5cdFx0XHRcdDogdW5kZWZpbmVkLFxuXHRcdHBhcnNlS2VlcHNFbXB0eVN0cmluZzogcHJvcGVydHlUeXBlQ29uZmlnLnR5cGUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnR5cGUuU3RyaW5nXCIgPyB0cnVlIDogdW5kZWZpbmVkXG5cdH07XG5cdHJldHVybiBwcm9wZXJ0eVR5cGVDb25maWc7XG59XG5cbmV4cG9ydCBkZWZhdWx0IHtcblx0Z2V0VGFibGVBY3Rpb25zLFxuXHRnZXRUYWJsZUNvbHVtbnMsXG5cdGdldENvbHVtbnNGcm9tRW50aXR5VHlwZSxcblx0dXBkYXRlTGlua2VkUHJvcGVydGllcyxcblx0Y3JlYXRlVGFibGVWaXN1YWxpemF0aW9uLFxuXHRjcmVhdGVEZWZhdWx0VGFibGVWaXN1YWxpemF0aW9uLFxuXHRnZXRDYXBhYmlsaXR5UmVzdHJpY3Rpb24sXG5cdGdldFNlbGVjdGlvbk1vZGUsXG5cdGdldFJvd1N0YXR1c1Zpc2liaWxpdHksXG5cdGdldEltcG9ydGFuY2UsXG5cdGdldFAxM25Nb2RlLFxuXHRnZXRUYWJsZUFubm90YXRpb25Db25maWd1cmF0aW9uLFxuXHRpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUsXG5cdHNwbGl0UGF0aCxcblx0Z2V0U2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb24sXG5cdGdldFRhYmxlTWFuaWZlc3RDb25maWd1cmF0aW9uLFxuXHRnZXRUeXBlQ29uZmlnXG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQTZPS0EsVUFBVSxFQU1mO0VBQUEsV0FOS0EsVUFBVTtJQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEsVUFBVTtFQUFBLEdBQVZBLFVB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