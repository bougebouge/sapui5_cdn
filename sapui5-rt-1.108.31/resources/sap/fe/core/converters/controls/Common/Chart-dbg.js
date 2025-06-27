/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/Key", "sap/fe/core/templating/DataModelPathHelper", "sap/ui/core/Core", "../../helpers/Aggregation", "../../helpers/ID", "../../ManifestSettings"], function (DataField, Action, ConfigurableObject, Key, DataModelPathHelper, Core, Aggregation, ID, ManifestSettings) {
  "use strict";

  var _exports = {};
  var VisualizationType = ManifestSettings.VisualizationType;
  var TemplateType = ManifestSettings.TemplateType;
  var ActionType = ManifestSettings.ActionType;
  var getFilterBarID = ID.getFilterBarID;
  var getChartID = ID.getChartID;
  var AggregationHelper = Aggregation.AggregationHelper;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var KeyHelper = Key.KeyHelper;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var isDataFieldForActionAbstract = DataField.isDataFieldForActionAbstract;
  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  /**
   * Method to retrieve all chart actions from annotations.
   *
   * @param chartAnnotation
   * @param visualizationPath
   * @param converterContext
   * @returns The table annotation actions
   */
  function getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext) {
    var chartActions = [];
    if (chartAnnotation) {
      var aActions = chartAnnotation.Actions || [];
      aActions.forEach(function (dataField) {
        var _dataField$annotation, _dataField$annotation2, _dataField$annotation3, _ActionTarget;
        var chartAction;
        if (isDataFieldForActionAbstract(dataField) && !(((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.Hidden) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()) === true) && !dataField.Inline && !dataField.Determining && !(dataField !== null && dataField !== void 0 && (_ActionTarget = dataField.ActionTarget) !== null && _ActionTarget !== void 0 && _ActionTarget.isBound)) {
          var key = KeyHelper.generateKeyFromDataField(dataField);
          switch (dataField.$Type) {
            case "com.sap.vocabularies.UI.v1.DataFieldForAction":
              chartAction = {
                type: ActionType.DataFieldForAction,
                annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
                key: key
              };
              break;
            case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
              chartAction = {
                type: ActionType.DataFieldForIntentBasedNavigation,
                annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
                key: key
              };
              break;
          }
        }
        if (chartAction) {
          chartActions.push(chartAction);
        }
      });
    }
    return chartActions;
  }
  function getChartActions(chartAnnotation, visualizationPath, converterContext) {
    var aAnnotationActions = getChartActionsFromAnnotations(chartAnnotation, visualizationPath, converterContext);
    var manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(visualizationPath).actions, converterContext, aAnnotationActions);
    var chartActions = insertCustomElements(aAnnotationActions, manifestActions.actions, {
      enableOnSelect: "overwrite",
      enabled: "overwrite",
      visible: "overwrite",
      command: "overwrite"
    });
    return {
      "actions": chartActions,
      "commandActions": manifestActions.commandActions
    };
  }
  _exports.getChartActions = getChartActions;
  function getP13nMode(visualizationPath, converterContext) {
    var _chartManifestSetting;
    var manifestWrapper = converterContext.getManifestWrapper();
    var chartManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
    var hasVariantManagement = ["Page", "Control"].indexOf(manifestWrapper.getVariantManagement()) > -1;
    var personalization = true;
    var aPersonalization = [];
    if ((chartManifestSettings === null || chartManifestSettings === void 0 ? void 0 : (_chartManifestSetting = chartManifestSettings.chartSettings) === null || _chartManifestSetting === void 0 ? void 0 : _chartManifestSetting.personalization) !== undefined) {
      personalization = chartManifestSettings.chartSettings.personalization;
    }
    if (hasVariantManagement && personalization) {
      if (personalization === true) {
        return "Sort,Type,Item";
      } else if (typeof personalization === "object") {
        if (personalization.type) {
          aPersonalization.push("Type");
        }
        if (personalization.item) {
          aPersonalization.push("Item");
        }
        if (personalization.sort) {
          aPersonalization.push("Sort");
        }
        return aPersonalization.join(",");
      }
    }
    return undefined;
  }

  /**
   * Create the ChartVisualization configuration that will be used to display a chart using the Chart building block.
   *
   * @param chartAnnotation The target chart annotation
   * @param visualizationPath The current visualization annotation path
   * @param converterContext The converter context
   * @param doNotCheckApplySupported Flag that indicates whether applysupported needs to be checked or not
   * @returns The chart visualization based on the annotation
   */
  _exports.getP13nMode = getP13nMode;
  function createChartVisualization(chartAnnotation, visualizationPath, converterContext, doNotCheckApplySupported) {
    var _converterContext$get, _converterContext$get2, _converterContext$get3;
    var aggregationHelper = new AggregationHelper(converterContext.getEntityType(), converterContext);
    if (!doNotCheckApplySupported && !aggregationHelper.isAnalyticsSupported()) {
      throw new Error("ApplySupported is not added to the annotations");
    }
    var aTransAggregations = aggregationHelper.getTransAggregations();
    var aCustomAggregates = aggregationHelper.getCustomAggregateDefinitions();
    var mCustomAggregates = {};
    if (aCustomAggregates) {
      var entityType = aggregationHelper.getEntityType();
      var _iterator = _createForOfIteratorHelper(aCustomAggregates),
        _step;
      try {
        var _loop = function () {
          var _customAggregate$anno, _customAggregate$anno2, _relatedCustomAggrega, _relatedCustomAggrega2, _relatedCustomAggrega3;
          var customAggregate = _step.value;
          var aContextDefiningProperties = customAggregate === null || customAggregate === void 0 ? void 0 : (_customAggregate$anno = customAggregate.annotations) === null || _customAggregate$anno === void 0 ? void 0 : (_customAggregate$anno2 = _customAggregate$anno.Aggregation) === null || _customAggregate$anno2 === void 0 ? void 0 : _customAggregate$anno2.ContextDefiningProperties;
          var qualifier = customAggregate === null || customAggregate === void 0 ? void 0 : customAggregate.qualifier;
          var relatedCustomAggregateProperty = qualifier && entityType.entityProperties.find(function (property) {
            return property.name === qualifier;
          });
          var label = relatedCustomAggregateProperty && (relatedCustomAggregateProperty === null || relatedCustomAggregateProperty === void 0 ? void 0 : (_relatedCustomAggrega = relatedCustomAggregateProperty.annotations) === null || _relatedCustomAggrega === void 0 ? void 0 : (_relatedCustomAggrega2 = _relatedCustomAggrega.Common) === null || _relatedCustomAggrega2 === void 0 ? void 0 : (_relatedCustomAggrega3 = _relatedCustomAggrega2.Label) === null || _relatedCustomAggrega3 === void 0 ? void 0 : _relatedCustomAggrega3.toString());
          mCustomAggregates[qualifier] = {
            name: qualifier,
            label: label || "Custom Aggregate (".concat(qualifier, ")"),
            sortable: true,
            sortOrder: "both",
            contextDefiningProperty: aContextDefiningProperties ? aContextDefiningProperties.map(function (oCtxDefProperty) {
              return oCtxDefProperty.value;
            }) : []
          };
        };
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          _loop();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
    var mTransAggregations = {};
    var oResourceBundleCore = Core.getLibraryResourceBundle("sap.fe.core");
    if (aTransAggregations) {
      for (var i = 0; i < aTransAggregations.length; i++) {
        var _aTransAggregations$i, _aTransAggregations$i2, _aTransAggregations$i3, _aTransAggregations$i4, _aTransAggregations$i5, _aTransAggregations$i6;
        mTransAggregations[aTransAggregations[i].Name] = {
          name: aTransAggregations[i].Name,
          propertyPath: aTransAggregations[i].AggregatableProperty.valueOf().value,
          aggregationMethod: aTransAggregations[i].AggregationMethod,
          label: (_aTransAggregations$i = aTransAggregations[i]) !== null && _aTransAggregations$i !== void 0 && (_aTransAggregations$i2 = _aTransAggregations$i.annotations) !== null && _aTransAggregations$i2 !== void 0 && (_aTransAggregations$i3 = _aTransAggregations$i2.Common) !== null && _aTransAggregations$i3 !== void 0 && _aTransAggregations$i3.Label ? (_aTransAggregations$i4 = aTransAggregations[i]) === null || _aTransAggregations$i4 === void 0 ? void 0 : (_aTransAggregations$i5 = _aTransAggregations$i4.annotations) === null || _aTransAggregations$i5 === void 0 ? void 0 : (_aTransAggregations$i6 = _aTransAggregations$i5.Common) === null || _aTransAggregations$i6 === void 0 ? void 0 : _aTransAggregations$i6.Label.toString() : "".concat(oResourceBundleCore.getText("AGGREGATABLE_PROPERTY"), " (").concat(aTransAggregations[i].Name, ")"),
          sortable: true,
          sortOrder: "both",
          custom: false
        };
      }
    }
    var aAggProps = aggregationHelper.getAggregatableProperties();
    var aGrpProps = aggregationHelper.getGroupableProperties();
    var mApplySupported = {};
    mApplySupported.$Type = "Org.OData.Aggregation.V1.ApplySupportedType";
    mApplySupported.AggregatableProperties = [];
    mApplySupported.GroupableProperties = [];
    for (var _i = 0; aAggProps && _i < aAggProps.length; _i++) {
      var _aAggProps$_i, _aAggProps$_i2, _aAggProps$_i2$Proper;
      var obj = {
        $Type: (_aAggProps$_i = aAggProps[_i]) === null || _aAggProps$_i === void 0 ? void 0 : _aAggProps$_i.$Type,
        Property: {
          $PropertyPath: (_aAggProps$_i2 = aAggProps[_i]) === null || _aAggProps$_i2 === void 0 ? void 0 : (_aAggProps$_i2$Proper = _aAggProps$_i2.Property) === null || _aAggProps$_i2$Proper === void 0 ? void 0 : _aAggProps$_i2$Proper.value
        }
      };
      mApplySupported.AggregatableProperties.push(obj);
    }
    for (var _i2 = 0; aGrpProps && _i2 < aGrpProps.length; _i2++) {
      var _aGrpProps$_i;
      var _obj = {
        $PropertyPath: (_aGrpProps$_i = aGrpProps[_i2]) === null || _aGrpProps$_i === void 0 ? void 0 : _aGrpProps$_i.value
      };
      mApplySupported.GroupableProperties.push(_obj);
    }
    var chartActions = getChartActions(chartAnnotation, visualizationPath, converterContext);
    var _visualizationPath$sp = visualizationPath.split("@"),
      _visualizationPath$sp2 = _slicedToArray(_visualizationPath$sp, 1),
      navigationPropertyPath /*, annotationPath*/ = _visualizationPath$sp2[0];
    if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
      // Drop trailing slash
      navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
    }
    var title = (_converterContext$get = converterContext.getEntityType().annotations) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.UI) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.HeaderInfo) === null || _converterContext$get3 === void 0 ? void 0 : _converterContext$get3.TypeNamePlural;
    var dataModelPath = converterContext.getDataModelObjectPath();
    var isEntitySet = navigationPropertyPath.length === 0;
    var entityName = dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
    var sFilterbarId = isEntitySet ? getFilterBarID(converterContext.getContextPath()) : undefined;
    var oVizProperties = {
      "legendGroup": {
        "layout": {
          "position": "bottom"
        }
      }
    };
    var autoBindOnInit;
    if (converterContext.getTemplateType() === TemplateType.ObjectPage) {
      autoBindOnInit = true;
    } else if (converterContext.getTemplateType() === TemplateType.ListReport || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
      autoBindOnInit = false;
    }
    var hasMultipleVisualizations = converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === "AnalyticalListPage";
    var onSegmentedButtonPressed = hasMultipleVisualizations ? ".handlers.onSegmentedButtonPressed" : "";
    var visible = hasMultipleVisualizations ? "{= ${pageInternal>alpContentView} !== 'Table'}" : "true";
    var allowedTransformations = aggregationHelper.getAllowedTransformations();
    mApplySupported.enableSearch = allowedTransformations ? allowedTransformations.indexOf("search") >= 0 : true;
    var qualifier = "";
    if (chartAnnotation.fullyQualifiedName.split("#").length > 1) {
      qualifier = chartAnnotation.fullyQualifiedName.split("#")[1];
    }
    return {
      type: VisualizationType.Chart,
      id: qualifier ? getChartID(isEntitySet ? entityName : navigationPropertyPath, qualifier, VisualizationType.Chart) : getChartID(isEntitySet ? entityName : navigationPropertyPath, VisualizationType.Chart),
      collection: getTargetObjectPath(converterContext.getDataModelObjectPath()),
      entityName: entityName,
      personalization: getP13nMode(visualizationPath, converterContext),
      navigationPath: navigationPropertyPath,
      annotationPath: converterContext.getAbsoluteAnnotationPath(visualizationPath),
      filterId: sFilterbarId,
      vizProperties: JSON.stringify(oVizProperties),
      actions: chartActions.actions,
      commandActions: chartActions.commandActions,
      title: title,
      autoBindOnInit: autoBindOnInit,
      onSegmentedButtonPressed: onSegmentedButtonPressed,
      visible: visible,
      customAgg: mCustomAggregates,
      transAgg: mTransAggregations,
      applySupported: mApplySupported
    };
  }
  _exports.createChartVisualization = createChartVisualization;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRDaGFydEFjdGlvbnNGcm9tQW5ub3RhdGlvbnMiLCJjaGFydEFubm90YXRpb24iLCJ2aXN1YWxpemF0aW9uUGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJjaGFydEFjdGlvbnMiLCJhQWN0aW9ucyIsIkFjdGlvbnMiLCJmb3JFYWNoIiwiZGF0YUZpZWxkIiwiY2hhcnRBY3Rpb24iLCJpc0RhdGFGaWVsZEZvckFjdGlvbkFic3RyYWN0IiwiYW5ub3RhdGlvbnMiLCJVSSIsIkhpZGRlbiIsInZhbHVlT2YiLCJJbmxpbmUiLCJEZXRlcm1pbmluZyIsIkFjdGlvblRhcmdldCIsImlzQm91bmQiLCJrZXkiLCJLZXlIZWxwZXIiLCJnZW5lcmF0ZUtleUZyb21EYXRhRmllbGQiLCIkVHlwZSIsInR5cGUiLCJBY3Rpb25UeXBlIiwiRGF0YUZpZWxkRm9yQWN0aW9uIiwiYW5ub3RhdGlvblBhdGgiLCJnZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIiwicHVzaCIsImdldENoYXJ0QWN0aW9ucyIsImFBbm5vdGF0aW9uQWN0aW9ucyIsIm1hbmlmZXN0QWN0aW9ucyIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJnZXRNYW5pZmVzdENvbnRyb2xDb25maWd1cmF0aW9uIiwiYWN0aW9ucyIsImluc2VydEN1c3RvbUVsZW1lbnRzIiwiZW5hYmxlT25TZWxlY3QiLCJlbmFibGVkIiwidmlzaWJsZSIsImNvbW1hbmQiLCJjb21tYW5kQWN0aW9ucyIsImdldFAxM25Nb2RlIiwibWFuaWZlc3RXcmFwcGVyIiwiZ2V0TWFuaWZlc3RXcmFwcGVyIiwiY2hhcnRNYW5pZmVzdFNldHRpbmdzIiwiaGFzVmFyaWFudE1hbmFnZW1lbnQiLCJpbmRleE9mIiwiZ2V0VmFyaWFudE1hbmFnZW1lbnQiLCJwZXJzb25hbGl6YXRpb24iLCJhUGVyc29uYWxpemF0aW9uIiwiY2hhcnRTZXR0aW5ncyIsInVuZGVmaW5lZCIsIml0ZW0iLCJzb3J0Iiwiam9pbiIsImNyZWF0ZUNoYXJ0VmlzdWFsaXphdGlvbiIsImRvTm90Q2hlY2tBcHBseVN1cHBvcnRlZCIsImFnZ3JlZ2F0aW9uSGVscGVyIiwiQWdncmVnYXRpb25IZWxwZXIiLCJnZXRFbnRpdHlUeXBlIiwiaXNBbmFseXRpY3NTdXBwb3J0ZWQiLCJFcnJvciIsImFUcmFuc0FnZ3JlZ2F0aW9ucyIsImdldFRyYW5zQWdncmVnYXRpb25zIiwiYUN1c3RvbUFnZ3JlZ2F0ZXMiLCJnZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucyIsIm1DdXN0b21BZ2dyZWdhdGVzIiwiZW50aXR5VHlwZSIsImN1c3RvbUFnZ3JlZ2F0ZSIsImFDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzIiwiQWdncmVnYXRpb24iLCJDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzIiwicXVhbGlmaWVyIiwicmVsYXRlZEN1c3RvbUFnZ3JlZ2F0ZVByb3BlcnR5IiwiZW50aXR5UHJvcGVydGllcyIsImZpbmQiLCJwcm9wZXJ0eSIsIm5hbWUiLCJsYWJlbCIsIkNvbW1vbiIsIkxhYmVsIiwidG9TdHJpbmciLCJzb3J0YWJsZSIsInNvcnRPcmRlciIsImNvbnRleHREZWZpbmluZ1Byb3BlcnR5IiwibWFwIiwib0N0eERlZlByb3BlcnR5IiwidmFsdWUiLCJtVHJhbnNBZ2dyZWdhdGlvbnMiLCJvUmVzb3VyY2VCdW5kbGVDb3JlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImkiLCJsZW5ndGgiLCJOYW1lIiwicHJvcGVydHlQYXRoIiwiQWdncmVnYXRhYmxlUHJvcGVydHkiLCJhZ2dyZWdhdGlvbk1ldGhvZCIsIkFnZ3JlZ2F0aW9uTWV0aG9kIiwiZ2V0VGV4dCIsImN1c3RvbSIsImFBZ2dQcm9wcyIsImdldEFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMiLCJhR3JwUHJvcHMiLCJnZXRHcm91cGFibGVQcm9wZXJ0aWVzIiwibUFwcGx5U3VwcG9ydGVkIiwiQWdncmVnYXRhYmxlUHJvcGVydGllcyIsIkdyb3VwYWJsZVByb3BlcnRpZXMiLCJvYmoiLCJQcm9wZXJ0eSIsIiRQcm9wZXJ0eVBhdGgiLCJzcGxpdCIsIm5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJsYXN0SW5kZXhPZiIsInN1YnN0ciIsInRpdGxlIiwiSGVhZGVySW5mbyIsIlR5cGVOYW1lUGx1cmFsIiwiZGF0YU1vZGVsUGF0aCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJpc0VudGl0eVNldCIsImVudGl0eU5hbWUiLCJ0YXJnZXRFbnRpdHlTZXQiLCJzdGFydGluZ0VudGl0eVNldCIsInNGaWx0ZXJiYXJJZCIsImdldEZpbHRlckJhcklEIiwiZ2V0Q29udGV4dFBhdGgiLCJvVml6UHJvcGVydGllcyIsImF1dG9CaW5kT25Jbml0IiwiZ2V0VGVtcGxhdGVUeXBlIiwiVGVtcGxhdGVUeXBlIiwiT2JqZWN0UGFnZSIsIkxpc3RSZXBvcnQiLCJBbmFseXRpY2FsTGlzdFBhZ2UiLCJoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zIiwib25TZWdtZW50ZWRCdXR0b25QcmVzc2VkIiwiYWxsb3dlZFRyYW5zZm9ybWF0aW9ucyIsImdldEFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMiLCJlbmFibGVTZWFyY2giLCJWaXN1YWxpemF0aW9uVHlwZSIsIkNoYXJ0IiwiaWQiLCJnZXRDaGFydElEIiwiY29sbGVjdGlvbiIsImdldFRhcmdldE9iamVjdFBhdGgiLCJuYXZpZ2F0aW9uUGF0aCIsImdldEFic29sdXRlQW5ub3RhdGlvblBhdGgiLCJmaWx0ZXJJZCIsInZpelByb3BlcnRpZXMiLCJKU09OIiwic3RyaW5naWZ5IiwiY3VzdG9tQWdnIiwidHJhbnNBZ2ciLCJhcHBseVN1cHBvcnRlZCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ2hhcnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBDaGFydCwgRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgaXNEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2Fubm90YXRpb25zL0RhdGFGaWVsZFwiO1xuaW1wb3J0IHR5cGUgeyBBbm5vdGF0aW9uQWN0aW9uLCBCYXNlQWN0aW9uLCBDb21iaW5lZEFjdGlvbiwgQ3VzdG9tQWN0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHsgZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7IGluc2VydEN1c3RvbUVsZW1lbnRzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IEtleUhlbHBlciB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvS2V5XCI7XG5pbXBvcnQgeyBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcIi4uLy4uL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IEFnZ3JlZ2F0aW9uSGVscGVyIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB7IGdldENoYXJ0SUQsIGdldEZpbHRlckJhcklEIH0gZnJvbSBcIi4uLy4uL2hlbHBlcnMvSURcIjtcbmltcG9ydCB0eXBlIHsgQ2hhcnRNYW5pZmVzdENvbmZpZ3VyYXRpb24sIENoYXJ0UGVyc29uYWxpemF0aW9uTWFuaWZlc3RTZXR0aW5ncyB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBBY3Rpb25UeXBlLCBUZW1wbGF0ZVR5cGUsIFZpc3VhbGl6YXRpb25UeXBlIH0gZnJvbSBcIi4uLy4uL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB0eXBlIE1hbmlmZXN0V3JhcHBlciBmcm9tIFwiLi4vLi4vTWFuaWZlc3RXcmFwcGVyXCI7XG5cbi8qKlxuICogQHR5cGVkZWYgQ2hhcnRWaXN1YWxpemF0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIENoYXJ0VmlzdWFsaXphdGlvbiA9IHtcblx0dHlwZTogVmlzdWFsaXphdGlvblR5cGUuQ2hhcnQ7XG5cdGlkOiBzdHJpbmc7XG5cdGNvbGxlY3Rpb246IHN0cmluZztcblx0ZW50aXR5TmFtZTogc3RyaW5nO1xuXHRwZXJzb25hbGl6YXRpb24/OiBzdHJpbmc7XG5cdG5hdmlnYXRpb25QYXRoOiBzdHJpbmc7XG5cdGFubm90YXRpb25QYXRoOiBzdHJpbmc7XG5cdGZpbHRlcklkPzogc3RyaW5nO1xuXHR2aXpQcm9wZXJ0aWVzOiBzdHJpbmc7XG5cdGFjdGlvbnM6IEJhc2VBY3Rpb25bXTtcblx0Y29tbWFuZEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj47XG5cdHRpdGxlOiBzdHJpbmc7XG5cdGF1dG9CaW5kT25Jbml0OiBib29sZWFuIHwgdW5kZWZpbmVkO1xuXHRvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQ6IHN0cmluZztcblx0dmlzaWJsZTogc3RyaW5nO1xuXHRjdXN0b21BZ2c6IG9iamVjdDtcblx0dHJhbnNBZ2c6IG9iamVjdDtcblx0YXBwbHlTdXBwb3J0ZWQ6IHtcblx0XHQkVHlwZTogc3RyaW5nO1xuXHRcdGVuYWJsZVNlYXJjaDogYm9vbGVhbjtcblx0XHRBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzOiBhbnlbXTtcblx0XHRHcm91cGFibGVQcm9wZXJ0aWVzOiBhbnlbXTtcblx0fTtcblx0bXVsdGlWaWV3cz86IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIE1ldGhvZCB0byByZXRyaWV2ZSBhbGwgY2hhcnQgYWN0aW9ucyBmcm9tIGFubm90YXRpb25zLlxuICpcbiAqIEBwYXJhbSBjaGFydEFubm90YXRpb25cbiAqIEBwYXJhbSB2aXN1YWxpemF0aW9uUGF0aFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSB0YWJsZSBhbm5vdGF0aW9uIGFjdGlvbnNcbiAqL1xuZnVuY3Rpb24gZ2V0Q2hhcnRBY3Rpb25zRnJvbUFubm90YXRpb25zKFxuXHRjaGFydEFubm90YXRpb246IENoYXJ0LFxuXHR2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBCYXNlQWN0aW9uW10ge1xuXHRjb25zdCBjaGFydEFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IFtdO1xuXHRpZiAoY2hhcnRBbm5vdGF0aW9uKSB7XG5cdFx0Y29uc3QgYUFjdGlvbnMgPSBjaGFydEFubm90YXRpb24uQWN0aW9ucyB8fCBbXTtcblx0XHRhQWN0aW9ucy5mb3JFYWNoKChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpID0+IHtcblx0XHRcdGxldCBjaGFydEFjdGlvbjogQW5ub3RhdGlvbkFjdGlvbiB8IHVuZGVmaW5lZDtcblx0XHRcdGlmIChcblx0XHRcdFx0aXNEYXRhRmllbGRGb3JBY3Rpb25BYnN0cmFjdChkYXRhRmllbGQpICYmXG5cdFx0XHRcdCEoZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgPT09IHRydWUpICYmXG5cdFx0XHRcdCFkYXRhRmllbGQuSW5saW5lICYmXG5cdFx0XHRcdCFkYXRhRmllbGQuRGV0ZXJtaW5pbmcgJiZcblx0XHRcdFx0IShkYXRhRmllbGQgYXMgYW55KT8uQWN0aW9uVGFyZ2V0Py5pc0JvdW5kXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3Qga2V5ID0gS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpO1xuXHRcdFx0XHRzd2l0Y2ggKGRhdGFGaWVsZC4kVHlwZSkge1xuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQWN0aW9uOlxuXHRcdFx0XHRcdFx0Y2hhcnRBY3Rpb24gPSB7XG5cdFx0XHRcdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRcdFx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGRhdGFGaWVsZC5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdFx0XHRcdFx0XHRrZXk6IGtleVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb246XG5cdFx0XHRcdFx0XHRjaGFydEFjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0dHlwZTogQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24sXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoZGF0YUZpZWxkLmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdFx0XHRcdGtleToga2V5XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGlmIChjaGFydEFjdGlvbikge1xuXHRcdFx0XHRjaGFydEFjdGlvbnMucHVzaChjaGFydEFjdGlvbik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGNoYXJ0QWN0aW9ucztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENoYXJ0QWN0aW9ucyhjaGFydEFubm90YXRpb246IENoYXJ0LCB2aXN1YWxpemF0aW9uUGF0aDogc3RyaW5nLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQ29tYmluZWRBY3Rpb24ge1xuXHRjb25zdCBhQW5ub3RhdGlvbkFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IGdldENoYXJ0QWN0aW9uc0Zyb21Bbm5vdGF0aW9ucyhjaGFydEFubm90YXRpb24sIHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgbWFuaWZlc3RBY3Rpb25zID0gZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpLmFjdGlvbnMsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRhQW5ub3RhdGlvbkFjdGlvbnNcblx0KTtcblx0Y29uc3QgY2hhcnRBY3Rpb25zID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoYUFubm90YXRpb25BY3Rpb25zLCBtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucywge1xuXHRcdGVuYWJsZU9uU2VsZWN0OiBcIm92ZXJ3cml0ZVwiLFxuXHRcdGVuYWJsZWQ6IFwib3ZlcndyaXRlXCIsXG5cdFx0dmlzaWJsZTogXCJvdmVyd3JpdGVcIixcblx0XHRjb21tYW5kOiBcIm92ZXJ3cml0ZVwiXG5cdH0pO1xuXHRyZXR1cm4ge1xuXHRcdFwiYWN0aW9uc1wiOiBjaGFydEFjdGlvbnMsXG5cdFx0XCJjb21tYW5kQWN0aW9uc1wiOiBtYW5pZmVzdEFjdGlvbnMuY29tbWFuZEFjdGlvbnNcblx0fTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFAxM25Nb2RlKHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXI6IE1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGNvbnN0IGNoYXJ0TWFuaWZlc3RTZXR0aW5nczogQ2hhcnRNYW5pZmVzdENvbmZpZ3VyYXRpb24gPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24odmlzdWFsaXphdGlvblBhdGgpO1xuXHRjb25zdCBoYXNWYXJpYW50TWFuYWdlbWVudDogYm9vbGVhbiA9IFtcIlBhZ2VcIiwgXCJDb250cm9sXCJdLmluZGV4T2YobWFuaWZlc3RXcmFwcGVyLmdldFZhcmlhbnRNYW5hZ2VtZW50KCkpID4gLTE7XG5cdGxldCBwZXJzb25hbGl6YXRpb246IENoYXJ0UGVyc29uYWxpemF0aW9uTWFuaWZlc3RTZXR0aW5ncyA9IHRydWU7XG5cdGNvbnN0IGFQZXJzb25hbGl6YXRpb246IHN0cmluZ1tdID0gW107XG5cdGlmIChjaGFydE1hbmlmZXN0U2V0dGluZ3M/LmNoYXJ0U2V0dGluZ3M/LnBlcnNvbmFsaXphdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGVyc29uYWxpemF0aW9uID0gY2hhcnRNYW5pZmVzdFNldHRpbmdzLmNoYXJ0U2V0dGluZ3MucGVyc29uYWxpemF0aW9uO1xuXHR9XG5cdGlmIChoYXNWYXJpYW50TWFuYWdlbWVudCAmJiBwZXJzb25hbGl6YXRpb24pIHtcblx0XHRpZiAocGVyc29uYWxpemF0aW9uID09PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gXCJTb3J0LFR5cGUsSXRlbVwiO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHBlcnNvbmFsaXphdGlvbiA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0aWYgKHBlcnNvbmFsaXphdGlvbi50eXBlKSB7XG5cdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIlR5cGVcIik7XG5cdFx0XHR9XG5cdFx0XHRpZiAocGVyc29uYWxpemF0aW9uLml0ZW0pIHtcblx0XHRcdFx0YVBlcnNvbmFsaXphdGlvbi5wdXNoKFwiSXRlbVwiKTtcblx0XHRcdH1cblx0XHRcdGlmIChwZXJzb25hbGl6YXRpb24uc29ydCkge1xuXHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJTb3J0XCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGFQZXJzb25hbGl6YXRpb24uam9pbihcIixcIik7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbi8qKlxuICogQ3JlYXRlIHRoZSBDaGFydFZpc3VhbGl6YXRpb24gY29uZmlndXJhdGlvbiB0aGF0IHdpbGwgYmUgdXNlZCB0byBkaXNwbGF5IGEgY2hhcnQgdXNpbmcgdGhlIENoYXJ0IGJ1aWxkaW5nIGJsb2NrLlxuICpcbiAqIEBwYXJhbSBjaGFydEFubm90YXRpb24gVGhlIHRhcmdldCBjaGFydCBhbm5vdGF0aW9uXG4gKiBAcGFyYW0gdmlzdWFsaXphdGlvblBhdGggVGhlIGN1cnJlbnQgdmlzdWFsaXphdGlvbiBhbm5vdGF0aW9uIHBhdGhcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIGRvTm90Q2hlY2tBcHBseVN1cHBvcnRlZCBGbGFnIHRoYXQgaW5kaWNhdGVzIHdoZXRoZXIgYXBwbHlzdXBwb3J0ZWQgbmVlZHMgdG8gYmUgY2hlY2tlZCBvciBub3RcbiAqIEByZXR1cm5zIFRoZSBjaGFydCB2aXN1YWxpemF0aW9uIGJhc2VkIG9uIHRoZSBhbm5vdGF0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDaGFydFZpc3VhbGl6YXRpb24oXG5cdGNoYXJ0QW5ub3RhdGlvbjogQ2hhcnQsXG5cdHZpc3VhbGl6YXRpb25QYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGRvTm90Q2hlY2tBcHBseVN1cHBvcnRlZD86IGJvb2xlYW5cbik6IENoYXJ0VmlzdWFsaXphdGlvbiB7XG5cdGNvbnN0IGFnZ3JlZ2F0aW9uSGVscGVyID0gbmV3IEFnZ3JlZ2F0aW9uSGVscGVyKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0aWYgKCFkb05vdENoZWNrQXBwbHlTdXBwb3J0ZWQgJiYgIWFnZ3JlZ2F0aW9uSGVscGVyLmlzQW5hbHl0aWNzU3VwcG9ydGVkKCkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJBcHBseVN1cHBvcnRlZCBpcyBub3QgYWRkZWQgdG8gdGhlIGFubm90YXRpb25zXCIpO1xuXHR9XG5cdGNvbnN0IGFUcmFuc0FnZ3JlZ2F0aW9ucyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldFRyYW5zQWdncmVnYXRpb25zKCk7XG5cdGNvbnN0IGFDdXN0b21BZ2dyZWdhdGVzID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0Q3VzdG9tQWdncmVnYXRlRGVmaW5pdGlvbnMoKTtcblx0Y29uc3QgbUN1c3RvbUFnZ3JlZ2F0ZXMgPSB7fSBhcyBhbnk7XG5cdGlmIChhQ3VzdG9tQWdncmVnYXRlcykge1xuXHRcdGNvbnN0IGVudGl0eVR5cGUgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRFbnRpdHlUeXBlKCk7XG5cdFx0Zm9yIChjb25zdCBjdXN0b21BZ2dyZWdhdGUgb2YgYUN1c3RvbUFnZ3JlZ2F0ZXMpIHtcblx0XHRcdGNvbnN0IGFDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzID0gY3VzdG9tQWdncmVnYXRlPy5hbm5vdGF0aW9ucz8uQWdncmVnYXRpb24/LkNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXM7XG5cdFx0XHRjb25zdCBxdWFsaWZpZXIgPSBjdXN0b21BZ2dyZWdhdGU/LnF1YWxpZmllcjtcblx0XHRcdGNvbnN0IHJlbGF0ZWRDdXN0b21BZ2dyZWdhdGVQcm9wZXJ0eSA9IHF1YWxpZmllciAmJiBlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZmluZCgocHJvcGVydHkpID0+IHByb3BlcnR5Lm5hbWUgPT09IHF1YWxpZmllcik7XG5cdFx0XHRjb25zdCBsYWJlbCA9IHJlbGF0ZWRDdXN0b21BZ2dyZWdhdGVQcm9wZXJ0eSAmJiByZWxhdGVkQ3VzdG9tQWdncmVnYXRlUHJvcGVydHk/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsPy50b1N0cmluZygpO1xuXHRcdFx0bUN1c3RvbUFnZ3JlZ2F0ZXNbcXVhbGlmaWVyXSA9IHtcblx0XHRcdFx0bmFtZTogcXVhbGlmaWVyLFxuXHRcdFx0XHRsYWJlbDogbGFiZWwgfHwgYEN1c3RvbSBBZ2dyZWdhdGUgKCR7cXVhbGlmaWVyfSlgLFxuXHRcdFx0XHRzb3J0YWJsZTogdHJ1ZSxcblx0XHRcdFx0c29ydE9yZGVyOiBcImJvdGhcIixcblx0XHRcdFx0Y29udGV4dERlZmluaW5nUHJvcGVydHk6IGFDb250ZXh0RGVmaW5pbmdQcm9wZXJ0aWVzXG5cdFx0XHRcdFx0PyBhQ29udGV4dERlZmluaW5nUHJvcGVydGllcy5tYXAoKG9DdHhEZWZQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb0N0eERlZlByb3BlcnR5LnZhbHVlO1xuXHRcdFx0XHRcdCAgfSlcblx0XHRcdFx0XHQ6IFtdXG5cdFx0XHR9O1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IG1UcmFuc0FnZ3JlZ2F0aW9ucyA9IHt9IGFzIGFueTtcblx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlQ29yZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdGlmIChhVHJhbnNBZ2dyZWdhdGlvbnMpIHtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFUcmFuc0FnZ3JlZ2F0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0bVRyYW5zQWdncmVnYXRpb25zW2FUcmFuc0FnZ3JlZ2F0aW9uc1tpXS5OYW1lXSA9IHtcblx0XHRcdFx0bmFtZTogYVRyYW5zQWdncmVnYXRpb25zW2ldLk5hbWUsXG5cdFx0XHRcdHByb3BlcnR5UGF0aDogYVRyYW5zQWdncmVnYXRpb25zW2ldLkFnZ3JlZ2F0YWJsZVByb3BlcnR5LnZhbHVlT2YoKS52YWx1ZSxcblx0XHRcdFx0YWdncmVnYXRpb25NZXRob2Q6IGFUcmFuc0FnZ3JlZ2F0aW9uc1tpXS5BZ2dyZWdhdGlvbk1ldGhvZCxcblx0XHRcdFx0bGFiZWw6IGFUcmFuc0FnZ3JlZ2F0aW9uc1tpXT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWxcblx0XHRcdFx0XHQ/IGFUcmFuc0FnZ3JlZ2F0aW9uc1tpXT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWwudG9TdHJpbmcoKVxuXHRcdFx0XHRcdDogYCR7b1Jlc291cmNlQnVuZGxlQ29yZS5nZXRUZXh0KFwiQUdHUkVHQVRBQkxFX1BST1BFUlRZXCIpfSAoJHthVHJhbnNBZ2dyZWdhdGlvbnNbaV0uTmFtZX0pYCxcblx0XHRcdFx0c29ydGFibGU6IHRydWUsXG5cdFx0XHRcdHNvcnRPcmRlcjogXCJib3RoXCIsXG5cdFx0XHRcdGN1c3RvbTogZmFsc2Vcblx0XHRcdH07XG5cdFx0fVxuXHR9XG5cblx0Y29uc3QgYUFnZ1Byb3BzID0gYWdncmVnYXRpb25IZWxwZXIuZ2V0QWdncmVnYXRhYmxlUHJvcGVydGllcygpO1xuXHRjb25zdCBhR3JwUHJvcHMgPSBhZ2dyZWdhdGlvbkhlbHBlci5nZXRHcm91cGFibGVQcm9wZXJ0aWVzKCk7XG5cdGNvbnN0IG1BcHBseVN1cHBvcnRlZCA9IHt9IGFzIGFueTtcblx0bUFwcGx5U3VwcG9ydGVkLiRUeXBlID0gXCJPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuQXBwbHlTdXBwb3J0ZWRUeXBlXCI7XG5cdG1BcHBseVN1cHBvcnRlZC5BZ2dyZWdhdGFibGVQcm9wZXJ0aWVzID0gW107XG5cdG1BcHBseVN1cHBvcnRlZC5Hcm91cGFibGVQcm9wZXJ0aWVzID0gW107XG5cblx0Zm9yIChsZXQgaSA9IDA7IGFBZ2dQcm9wcyAmJiBpIDwgYUFnZ1Byb3BzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3Qgb2JqID0ge1xuXHRcdFx0JFR5cGU6IGFBZ2dQcm9wc1tpXT8uJFR5cGUsXG5cdFx0XHRQcm9wZXJ0eToge1xuXHRcdFx0XHQkUHJvcGVydHlQYXRoOiBhQWdnUHJvcHNbaV0/LlByb3BlcnR5Py52YWx1ZVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRtQXBwbHlTdXBwb3J0ZWQuQWdncmVnYXRhYmxlUHJvcGVydGllcy5wdXNoKG9iaik7XG5cdH1cblxuXHRmb3IgKGxldCBpID0gMDsgYUdycFByb3BzICYmIGkgPCBhR3JwUHJvcHMubGVuZ3RoOyBpKyspIHtcblx0XHRjb25zdCBvYmogPSB7ICRQcm9wZXJ0eVBhdGg6IGFHcnBQcm9wc1tpXT8udmFsdWUgfTtcblxuXHRcdG1BcHBseVN1cHBvcnRlZC5Hcm91cGFibGVQcm9wZXJ0aWVzLnB1c2gob2JqKTtcblx0fVxuXG5cdGNvbnN0IGNoYXJ0QWN0aW9ucyA9IGdldENoYXJ0QWN0aW9ucyhjaGFydEFubm90YXRpb24sIHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0bGV0IFtuYXZpZ2F0aW9uUHJvcGVydHlQYXRoIC8qLCBhbm5vdGF0aW9uUGF0aCovXSA9IHZpc3VhbGl6YXRpb25QYXRoLnNwbGl0KFwiQFwiKTtcblx0aWYgKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGFzdEluZGV4T2YoXCIvXCIpID09PSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCAtIDEpIHtcblx0XHQvLyBEcm9wIHRyYWlsaW5nIHNsYXNoXG5cdFx0bmF2aWdhdGlvblByb3BlcnR5UGF0aCA9IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGguc3Vic3RyKDAsIG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGVuZ3RoIC0gMSk7XG5cdH1cblx0Y29uc3QgdGl0bGU6IGFueSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLmFubm90YXRpb25zPy5VST8uSGVhZGVySW5mbz8uVHlwZU5hbWVQbHVyYWw7XG5cdGNvbnN0IGRhdGFNb2RlbFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKTtcblx0Y29uc3QgaXNFbnRpdHlTZXQ6IGJvb2xlYW4gPSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCA9PT0gMDtcblx0Y29uc3QgZW50aXR5TmFtZTogc3RyaW5nID0gZGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQgPyBkYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVNldC5uYW1lIDogZGF0YU1vZGVsUGF0aC5zdGFydGluZ0VudGl0eVNldC5uYW1lO1xuXHRjb25zdCBzRmlsdGVyYmFySWQgPSBpc0VudGl0eVNldCA/IGdldEZpbHRlckJhcklEKGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udGV4dFBhdGgoKSkgOiB1bmRlZmluZWQ7XG5cdGNvbnN0IG9WaXpQcm9wZXJ0aWVzID0ge1xuXHRcdFwibGVnZW5kR3JvdXBcIjoge1xuXHRcdFx0XCJsYXlvdXRcIjoge1xuXHRcdFx0XHRcInBvc2l0aW9uXCI6IFwiYm90dG9tXCJcblx0XHRcdH1cblx0XHR9XG5cdH07XG5cdGxldCBhdXRvQmluZE9uSW5pdDogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5PYmplY3RQYWdlKSB7XG5cdFx0YXV0b0JpbmRPbkluaXQgPSB0cnVlO1xuXHR9IGVsc2UgaWYgKFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5MaXN0UmVwb3J0IHx8XG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZVxuXHQpIHtcblx0XHRhdXRvQmluZE9uSW5pdCA9IGZhbHNlO1xuXHR9XG5cdGNvbnN0IGhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMgPVxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucygpIHx8IGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFwiQW5hbHl0aWNhbExpc3RQYWdlXCI7XG5cdGNvbnN0IG9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZCA9IGhhc011bHRpcGxlVmlzdWFsaXphdGlvbnMgPyBcIi5oYW5kbGVycy5vblNlZ21lbnRlZEJ1dHRvblByZXNzZWRcIiA6IFwiXCI7XG5cdGNvbnN0IHZpc2libGUgPSBoYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zID8gXCJ7PSAke3BhZ2VJbnRlcm5hbD5hbHBDb250ZW50Vmlld30gIT09ICdUYWJsZSd9XCIgOiBcInRydWVcIjtcblx0Y29uc3QgYWxsb3dlZFRyYW5zZm9ybWF0aW9ucyA9IGFnZ3JlZ2F0aW9uSGVscGVyLmdldEFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMoKTtcblx0bUFwcGx5U3VwcG9ydGVkLmVuYWJsZVNlYXJjaCA9IGFsbG93ZWRUcmFuc2Zvcm1hdGlvbnMgPyBhbGxvd2VkVHJhbnNmb3JtYXRpb25zLmluZGV4T2YoXCJzZWFyY2hcIikgPj0gMCA6IHRydWU7XG5cdGxldCBxdWFsaWZpZXI6IHN0cmluZyA9IFwiXCI7XG5cdGlmIChjaGFydEFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lLnNwbGl0KFwiI1wiKS5sZW5ndGggPiAxKSB7XG5cdFx0cXVhbGlmaWVyID0gY2hhcnRBbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdChcIiNcIilbMV07XG5cdH1cblx0cmV0dXJuIHtcblx0XHR0eXBlOiBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCxcblx0XHRpZDogcXVhbGlmaWVyXG5cdFx0XHQ/IGdldENoYXJ0SUQoaXNFbnRpdHlTZXQgPyBlbnRpdHlOYW1lIDogbmF2aWdhdGlvblByb3BlcnR5UGF0aCwgcXVhbGlmaWVyLCBWaXN1YWxpemF0aW9uVHlwZS5DaGFydClcblx0XHRcdDogZ2V0Q2hhcnRJRChpc0VudGl0eVNldCA/IGVudGl0eU5hbWUgOiBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLCBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCksXG5cdFx0Y29sbGVjdGlvbjogZ2V0VGFyZ2V0T2JqZWN0UGF0aChjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSksXG5cdFx0ZW50aXR5TmFtZTogZW50aXR5TmFtZSxcblx0XHRwZXJzb25hbGl6YXRpb246IGdldFAxM25Nb2RlKHZpc3VhbGl6YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRuYXZpZ2F0aW9uUGF0aDogbmF2aWdhdGlvblByb3BlcnR5UGF0aCxcblx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRBYnNvbHV0ZUFubm90YXRpb25QYXRoKHZpc3VhbGl6YXRpb25QYXRoKSxcblx0XHRmaWx0ZXJJZDogc0ZpbHRlcmJhcklkLFxuXHRcdHZpelByb3BlcnRpZXM6IEpTT04uc3RyaW5naWZ5KG9WaXpQcm9wZXJ0aWVzKSxcblx0XHRhY3Rpb25zOiBjaGFydEFjdGlvbnMuYWN0aW9ucyxcblx0XHRjb21tYW5kQWN0aW9uczogY2hhcnRBY3Rpb25zLmNvbW1hbmRBY3Rpb25zLFxuXHRcdHRpdGxlOiB0aXRsZSxcblx0XHRhdXRvQmluZE9uSW5pdDogYXV0b0JpbmRPbkluaXQsXG5cdFx0b25TZWdtZW50ZWRCdXR0b25QcmVzc2VkOiBvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQsXG5cdFx0dmlzaWJsZTogdmlzaWJsZSxcblx0XHRjdXN0b21BZ2c6IG1DdXN0b21BZ2dyZWdhdGVzLFxuXHRcdHRyYW5zQWdnOiBtVHJhbnNBZ2dyZWdhdGlvbnMsXG5cdFx0YXBwbHlTdXBwb3J0ZWQ6IG1BcHBseVN1cHBvcnRlZFxuXHR9O1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQThDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0EsOEJB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