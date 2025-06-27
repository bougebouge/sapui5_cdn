/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/helpers/BindingToolkit", "../controls/Common/DataVisualization", "../controls/Common/KPI", "../helpers/ID", "../ManifestSettings"], function (Action, FilterBar, ConfigurableObject, BindingToolkit, DataVisualization, KPI, ID, ManifestSettings) {
  "use strict";

  var _exports = {};
  var VisualizationType = ManifestSettings.VisualizationType;
  var VariantManagementType = ManifestSettings.VariantManagementType;
  var TemplateType = ManifestSettings.TemplateType;
  var getTableID = ID.getTableID;
  var getIconTabBarID = ID.getIconTabBarID;
  var getFilterVariantManagementID = ID.getFilterVariantManagementID;
  var getFilterBarID = ID.getFilterBarID;
  var getDynamicListReportID = ID.getDynamicListReportID;
  var getCustomTabID = ID.getCustomTabID;
  var getChartID = ID.getChartID;
  var getKPIDefinitions = KPI.getKPIDefinitions;
  var isSelectionPresentationCompliant = DataVisualization.isSelectionPresentationCompliant;
  var isPresentationCompliant = DataVisualization.isPresentationCompliant;
  var getSelectionVariant = DataVisualization.getSelectionVariant;
  var getSelectionPresentationVariant = DataVisualization.getSelectionPresentationVariant;
  var getDefaultPresentationVariant = DataVisualization.getDefaultPresentationVariant;
  var getDefaultLineItem = DataVisualization.getDefaultLineItem;
  var getDefaultChart = DataVisualization.getDefaultChart;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getSelectionFields = FilterBar.getSelectionFields;
  var getManifestFilterFields = FilterBar.getManifestFilterFields;
  var getFilterBarhideBasicSearch = FilterBar.getFilterBarhideBasicSearch;
  var getActionsFromManifest = Action.getActionsFromManifest;
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  /**
   * Retrieves all list report tables.
   *
   * @param views The list report views configured in the manifest
   * @returns The list report table
   */
  function getTableVisualizations(views) {
    var tables = [];
    views.forEach(function (view) {
      if (!view.type) {
        var visualizations = view.secondaryVisualization ? view.secondaryVisualization.visualizations : view.presentation.visualizations;
        visualizations.forEach(function (visualization) {
          if (visualization.type === VisualizationType.Table) {
            tables.push(visualization);
          }
        });
      }
    });
    return tables;
  }
  function getChartVisualizations(views) {
    var charts = [];
    views.forEach(function (view) {
      if (!view.type) {
        var visualizations = view.primaryVisualization ? view.primaryVisualization.visualizations : view.presentation.visualizations;
        visualizations.forEach(function (visualization) {
          if (visualization.type === VisualizationType.Chart) {
            charts.push(visualization);
          }
        });
      }
    });
    return charts;
  }
  var getDefaultSemanticDates = function (filterFields) {
    var defaultSemanticDates = {};
    for (var filterField in filterFields) {
      var _filterFields$filterF, _filterFields$filterF2, _filterFields$filterF3;
      if ((_filterFields$filterF = filterFields[filterField]) !== null && _filterFields$filterF !== void 0 && (_filterFields$filterF2 = _filterFields$filterF.settings) !== null && _filterFields$filterF2 !== void 0 && (_filterFields$filterF3 = _filterFields$filterF2.defaultValues) !== null && _filterFields$filterF3 !== void 0 && _filterFields$filterF3.length) {
        var _filterFields$filterF4, _filterFields$filterF5;
        defaultSemanticDates[filterField] = (_filterFields$filterF4 = filterFields[filterField]) === null || _filterFields$filterF4 === void 0 ? void 0 : (_filterFields$filterF5 = _filterFields$filterF4.settings) === null || _filterFields$filterF5 === void 0 ? void 0 : _filterFields$filterF5.defaultValues;
      }
    }
    return defaultSemanticDates;
  };

  /**
   * Find a visualization annotation that can be used for rendering the list report.
   *
   * @param entityType The current EntityType
   * @param converterContext
   * @param bIsALP
   * @returns A compliant annotation for rendering the list report
   */
  function getCompliantVisualizationAnnotation(entityType, converterContext, bIsALP) {
    var annotationPath = converterContext.getManifestWrapper().getDefaultTemplateAnnotationPath();
    var selectionPresentationVariant = getSelectionPresentationVariant(entityType, annotationPath, converterContext);
    if (annotationPath && selectionPresentationVariant) {
      var _presentationVariant = selectionPresentationVariant.PresentationVariant;
      if (!_presentationVariant) {
        throw new Error("Presentation Variant is not configured in the SPV mentioned in the manifest");
      }
      var bPVComplaint = isPresentationCompliant(selectionPresentationVariant.PresentationVariant);
      if (!bPVComplaint) {
        return undefined;
      }
      if (isSelectionPresentationCompliant(selectionPresentationVariant, bIsALP)) {
        return selectionPresentationVariant;
      }
    }
    if (selectionPresentationVariant) {
      if (isSelectionPresentationCompliant(selectionPresentationVariant, bIsALP)) {
        return selectionPresentationVariant;
      }
    }
    var presentationVariant = getDefaultPresentationVariant(entityType);
    if (presentationVariant) {
      if (isPresentationCompliant(presentationVariant, bIsALP)) {
        return presentationVariant;
      }
    }
    if (!bIsALP) {
      var defaultLineItem = getDefaultLineItem(entityType);
      if (defaultLineItem) {
        return defaultLineItem;
      }
    }
    return undefined;
  }
  var getView = function (viewConverterConfiguration) {
    var config = viewConverterConfiguration;
    if (config.converterContext) {
      var _presentation, _presentation$visuali;
      var converterContext = config.converterContext;
      config = config;
      var presentation = getDataVisualizationConfiguration(config.annotation ? converterContext.getRelativeAnnotationPath(config.annotation.fullyQualifiedName, converterContext.getEntityType()) : "", true, converterContext, config);
      var tableControlId = "";
      var chartControlId = "";
      var title = "";
      var selectionVariantPath = "";
      var isMultipleViewConfiguration = function (currentConfig) {
        return currentConfig.key !== undefined;
      };
      var createVisualization = function (currentPresentation, isPrimary) {
        var defaultVisualization;
        var _iterator = _createForOfIteratorHelper(currentPresentation.visualizations),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var visualization = _step.value;
            if (isPrimary && visualization.type === VisualizationType.Chart) {
              defaultVisualization = visualization;
              break;
            }
            if (!isPrimary && visualization.type === VisualizationType.Table) {
              defaultVisualization = visualization;
              break;
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        var presentationCreated = Object.assign({}, currentPresentation);
        if (defaultVisualization) {
          presentationCreated.visualizations = [defaultVisualization];
        }
        return presentationCreated;
      };
      var getPresentation = function (item) {
        var resolvedTarget = converterContext.getEntityTypeAnnotation(item.annotationPath);
        var targetAnnotation = resolvedTarget.annotation;
        converterContext = resolvedTarget.converterContext;
        var annotation = targetAnnotation;
        presentation = getDataVisualizationConfiguration(annotation ? converterContext.getRelativeAnnotationPath(annotation.fullyQualifiedName, converterContext.getEntityType()) : "", true, converterContext, config);
        return presentation;
      };
      var createAlpView = function (presentations, defaultPath) {
        var primaryVisualization = createVisualization(presentations[0], true);
        chartControlId = (primaryVisualization === null || primaryVisualization === void 0 ? void 0 : primaryVisualization.visualizations[0]).id;
        var secondaryVisualization = createVisualization(presentations[1] ? presentations[1] : presentations[0]);
        tableControlId = (secondaryVisualization === null || secondaryVisualization === void 0 ? void 0 : secondaryVisualization.visualizations[0]).annotation.id;
        if (primaryVisualization && secondaryVisualization) {
          config = config;
          var _visible = config.visible;
          var view = {
            primaryVisualization: primaryVisualization,
            secondaryVisualization: secondaryVisualization,
            tableControlId: tableControlId,
            chartControlId: chartControlId,
            defaultPath: defaultPath,
            visible: _visible
          };
          return view;
        }
      };
      if (((_presentation = presentation) === null || _presentation === void 0 ? void 0 : (_presentation$visuali = _presentation.visualizations) === null || _presentation$visuali === void 0 ? void 0 : _presentation$visuali.length) === 2 && converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
        var view = createAlpView([presentation], "both");
        if (view) {
          return view;
        }
      } else if (converterContext.getManifestWrapper().hasMultipleVisualizations(config) || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
        var _ref = config,
          primary = _ref.primary,
          secondary = _ref.secondary;
        if (primary && primary.length && secondary && secondary.length) {
          var _view = createAlpView([getPresentation(primary[0]), getPresentation(secondary[0])], config.defaultPath);
          if (_view) {
            return _view;
          }
        } else {
          throw new Error("SecondaryItems in the Views is not present");
        }
      } else if (isMultipleViewConfiguration(config)) {
        // key exists only on multi tables mode
        var resolvedTarget = converterContext.getEntityTypeAnnotation(config.annotationPath);
        var viewAnnotation = resolvedTarget.annotation;
        converterContext = resolvedTarget.converterContext;
        title = compileExpression(getExpressionFromAnnotation(viewAnnotation.Text));
        // Need to loop on table into views since multi table mode get specific configuration (hidden filters or Table Id)
        presentation.visualizations.forEach(function (visualizationDefinition, index) {
          switch (visualizationDefinition.type) {
            case VisualizationType.Table:
              var tableVisualization = presentation.visualizations[index];
              var filters = tableVisualization.control.filters || {};
              filters.hiddenFilters = filters.hiddenFilters || {
                paths: []
              };
              if (!config.keepPreviousPersonalization) {
                // Need to override Table Id to match with Tab Key (currently only table is managed in multiple view mode)
                tableVisualization.annotation.id = getTableID(config.key || "", "LineItem");
              }
              config = config;
              if (config && config.annotation && config.annotation.term === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
                selectionVariantPath = "@".concat(config.annotation.SelectionVariant.fullyQualifiedName.split("@")[1]);
              } else {
                selectionVariantPath = config.annotationPath;
              }
              //Provide Selection Variant to hiddenFilters in order to set the SV filters to the table.
              //MDC Table overrides binding Filter and from SAP FE the only method where we are able to add
              //additional filter is 'rebindTable' into Table delegate.
              //To avoid implementing specific LR feature to SAP FE Macro Table, the filter(s) related to the Tab (multi table mode)
              //can be passed to macro table via parameter/context named filters and key hiddenFilters.
              filters.hiddenFilters.paths.push({
                annotationPath: selectionVariantPath
              });
              tableVisualization.control.filters = filters;
              break;
            case VisualizationType.Chart:
              var chartVisualization = presentation.visualizations[index];
              chartVisualization.id = getChartID(config.key || "", "Chart");
              chartVisualization.multiViews = true;
              break;
            default:
              break;
          }
        });
      }
      presentation.visualizations.forEach(function (visualizationDefinition) {
        if (visualizationDefinition.type === VisualizationType.Table) {
          tableControlId = visualizationDefinition.annotation.id;
        } else if (visualizationDefinition.type === VisualizationType.Chart) {
          chartControlId = visualizationDefinition.id;
        }
      });
      config = config;
      var visible = config.visible;
      return {
        presentation: presentation,
        tableControlId: tableControlId,
        chartControlId: chartControlId,
        title: title,
        selectionVariantPath: selectionVariantPath,
        visible: visible
      };
    } else {
      config = config;
      var _title = config.label,
        fragment = config.template,
        type = config.type,
        customTabId = getCustomTabID(config.key || ""),
        _visible2 = config.visible;
      return {
        title: _title,
        fragment: fragment,
        type: type,
        customTabId: customTabId,
        visible: _visible2
      };
    }
  };
  var getViews = function (converterContext, settingsViews) {
    var viewConverterConfigs = [];
    if (settingsViews) {
      settingsViews.paths.forEach(function (path) {
        if (converterContext.getManifestWrapper().hasMultipleVisualizations(path)) {
          if (settingsViews.paths.length > 1) {
            throw new Error("ALP flavor cannot have multiple views");
          } else {
            path = path;
            viewConverterConfigs.push({
              converterContext: converterContext,
              primary: path.primary,
              secondary: path.secondary,
              defaultPath: path.defaultPath
            });
          }
        } else if (path.template) {
          path = path;
          viewConverterConfigs.push({
            key: path.key,
            label: path.label,
            template: path.template,
            type: "Custom",
            visible: path.visible
          });
        } else {
          path = path;
          var viewConverterContext = converterContext.getConverterContextFor(path.contextPath || path.entitySet && "/".concat(path.entitySet) || converterContext.getContextPath()),
            entityType = viewConverterContext.getEntityType();
          if (entityType && viewConverterContext) {
            var annotation;
            var resolvedTarget = viewConverterContext.getEntityTypeAnnotation(path.annotationPath);
            var targetAnnotation = resolvedTarget.annotation;
            if (targetAnnotation) {
              annotation = targetAnnotation.term === "com.sap.vocabularies.UI.v1.SelectionVariant" ? getCompliantVisualizationAnnotation(entityType, viewConverterContext, false) : targetAnnotation;
              viewConverterConfigs.push({
                converterContext: viewConverterContext,
                annotation: annotation,
                annotationPath: path.annotationPath,
                keepPreviousPersonalization: path.keepPreviousPersonalization,
                key: path.key,
                visible: path.visible
              });
            }
          } else {
            // TODO Diagnostics message
          }
        }
      });
    } else {
      var entityType = converterContext.getEntityType();
      if (converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
        viewConverterConfigs = getAlpViewConfig(converterContext, viewConverterConfigs);
      } else {
        viewConverterConfigs.push({
          annotation: getCompliantVisualizationAnnotation(entityType, converterContext, false),
          converterContext: converterContext
        });
      }
    }
    return viewConverterConfigs.map(function (viewConverterConfig) {
      return getView(viewConverterConfig);
    });
  };
  var getMultiViewsControl = function (converterContext, views) {
    var manifestWrapper = converterContext.getManifestWrapper();
    var viewsDefinition = manifestWrapper.getViewConfiguration();
    if (views.length > 1 && !hasMultiVisualizations(converterContext)) {
      return {
        showTabCounts: viewsDefinition ? (viewsDefinition === null || viewsDefinition === void 0 ? void 0 : viewsDefinition.showCounts) || manifestWrapper.hasMultipleEntitySets() : undefined,
        // with multi EntitySets, tab counts are displayed by default
        id: getIconTabBarID()
      };
    }
    return undefined;
  };
  function getAlpViewConfig(converterContext, viewConfigs) {
    var entityType = converterContext.getEntityType();
    var annotation = getCompliantVisualizationAnnotation(entityType, converterContext, true);
    var chart, table;
    if (annotation) {
      viewConfigs.push({
        annotation: annotation,
        converterContext: converterContext
      });
    } else {
      chart = getDefaultChart(entityType);
      table = getDefaultLineItem(entityType);
      if (chart && table) {
        var primary = [{
          annotationPath: chart.term
        }];
        var secondary = [{
          annotationPath: table.term
        }];
        viewConfigs.push({
          converterContext: converterContext,
          primary: primary,
          secondary: secondary,
          defaultPath: "both"
        });
      }
    }
    return viewConfigs;
  }
  function hasMultiVisualizations(converterContext) {
    return converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage;
  }
  var getHeaderActions = function (converterContext) {
    var manifestWrapper = converterContext.getManifestWrapper();
    return insertCustomElements([], getActionsFromManifest(manifestWrapper.getHeaderActions(), converterContext).actions);
  };
  _exports.getHeaderActions = getHeaderActions;
  var checkChartFilterBarId = function (views, filterBarId) {
    views.forEach(function (view) {
      if (!view.type) {
        var presentation = view.presentation;
        presentation.visualizations.forEach(function (visualizationDefinition) {
          if (visualizationDefinition.type === VisualizationType.Chart && visualizationDefinition.filterId !== filterBarId) {
            visualizationDefinition.filterId = filterBarId;
          }
        });
      }
    });
  };

  /**
   * Creates the ListReportDefinition for multiple entity sets (multiple table mode).
   *
   * @param converterContext The converter context
   * @returns The list report definition based on annotation + manifest
   */
  _exports.checkChartFilterBarId = checkChartFilterBarId;
  var convertPage = function (converterContext) {
    var entityType = converterContext.getEntityType();
    var sContextPath = converterContext.getContextPath();
    if (!sContextPath) {
      // If we don't have an entitySet at this point we have an issue I'd say
      throw new Error("An EntitySet is required to be able to display a ListReport, please adjust your `entitySet` property to point to one.");
    }
    var manifestWrapper = converterContext.getManifestWrapper();
    var viewsDefinition = manifestWrapper.getViewConfiguration();
    var hasMultipleEntitySets = manifestWrapper.hasMultipleEntitySets();
    var views = getViews(converterContext, viewsDefinition);
    var lrTableVisualizations = getTableVisualizations(views);
    var lrChartVisualizations = getChartVisualizations(views);
    var showPinnableToggle = lrTableVisualizations.some(function (table) {
      return table.control.type === "ResponsiveTable";
    });
    var singleTableId = "";
    var singleChartId = "";
    var dynamicListReportId = getDynamicListReportID();
    var filterBarId = getFilterBarID(sContextPath);
    var filterVariantManagementID = getFilterVariantManagementID(filterBarId);
    var fbConfig = manifestWrapper.getFilterConfiguration();
    var filterInitialLayout = (fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.initialLayout) !== undefined ? fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.initialLayout.toLowerCase() : "compact";
    var filterLayout = (fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.layout) !== undefined ? fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.layout.toLowerCase() : "compact";
    var useSemanticDateRange = fbConfig.useSemanticDateRange !== undefined ? fbConfig.useSemanticDateRange : true;
    var oConfig = getContentAreaId(converterContext, views);
    if (oConfig) {
      singleChartId = oConfig.chartId;
      singleTableId = oConfig.tableId;
    }

    // Chart has a dependency to filter bar (issue with loading data). Once resolved, the check for chart should be removed here.
    // Until then, hiding filter bar is now allowed if a chart is being used on LR.
    var hideFilterBar = manifestWrapper.isFilterBarHidden() && singleChartId === "";
    var lrFilterProperties = getSelectionFields(converterContext, lrTableVisualizations);
    var selectionFields = lrFilterProperties.selectionFields;
    var propertyInfoFields = lrFilterProperties.sPropertyInfo;
    var hideBasicSearch = getFilterBarhideBasicSearch(lrTableVisualizations, lrChartVisualizations, converterContext);
    var multiViewControl = getMultiViewsControl(converterContext, views);
    var selectionVariant = multiViewControl ? undefined : getSelectionVariant(entityType, converterContext);
    var defaultSemanticDates = useSemanticDateRange ? getDefaultSemanticDates(getManifestFilterFields(entityType, converterContext)) : {};

    // Sort header actions according to position attributes in manifest
    var headerActions = getHeaderActions(converterContext);
    if (hasMultipleEntitySets) {
      checkChartFilterBarId(views, filterBarId);
    }
    var visualizationIds = lrTableVisualizations.map(function (visualization) {
      return visualization.annotation.id;
    }).concat(lrChartVisualizations.map(function (visualization) {
      return visualization.id;
    }));
    var targetControlIds = [].concat(_toConsumableArray(hideFilterBar ? [] : [filterBarId]), _toConsumableArray(manifestWrapper.getVariantManagement() !== VariantManagementType.Control ? visualizationIds : []), _toConsumableArray(multiViewControl ? [multiViewControl.id] : []));
    var stickySubheaderProvider = multiViewControl && manifestWrapper.getStickyMultiTabHeaderConfiguration() ? multiViewControl.id : undefined;
    return {
      mainEntitySet: sContextPath,
      mainEntityType: "".concat(sContextPath, "/"),
      multiViewsControl: multiViewControl,
      stickySubheaderProvider: stickySubheaderProvider,
      singleTableId: singleTableId,
      singleChartId: singleChartId,
      dynamicListReportId: dynamicListReportId,
      headerActions: headerActions,
      showPinnableToggle: showPinnableToggle,
      filterBar: {
        propertyInfo: propertyInfoFields,
        selectionFields: selectionFields,
        hideBasicSearch: hideBasicSearch
      },
      views: views,
      filterBarId: hideFilterBar ? "" : filterBarId,
      filterConditions: {
        selectionVariant: selectionVariant,
        defaultSemanticDates: defaultSemanticDates
      },
      variantManagement: {
        id: filterVariantManagementID,
        targetControlIds: targetControlIds.join(",")
      },
      hasMultiVisualizations: hasMultiVisualizations(converterContext),
      templateType: manifestWrapper.getTemplateType(),
      useSemanticDateRange: useSemanticDateRange,
      filterInitialLayout: filterInitialLayout,
      filterLayout: filterLayout,
      kpiDefinitions: getKPIDefinitions(converterContext),
      hideFilterBar: hideFilterBar
    };
  };
  _exports.convertPage = convertPage;
  function getContentAreaId(converterContext, views) {
    var singleTableId = "",
      singleChartId = "";
    if (converterContext.getManifestWrapper().hasMultipleVisualizations() || converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
      var _iterator2 = _createForOfIteratorHelper(views),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var view = _step2.value;
          view = view;
          if (view.chartControlId && view.tableControlId) {
            singleChartId = view.chartControlId;
            singleTableId = view.tableControlId;
            break;
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    } else {
      var _iterator3 = _createForOfIteratorHelper(views),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var _view2 = _step3.value;
          _view2 = _view2;
          if (!singleTableId && _view2.tableControlId) {
            singleTableId = _view2.tableControlId || "";
          }
          if (!singleChartId && _view2.chartControlId) {
            singleChartId = _view2.chartControlId || "";
          }
          if (singleChartId && singleTableId) {
            break;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
    if (singleTableId || singleChartId) {
      return {
        chartId: singleChartId,
        tableId: singleTableId
      };
    }
    return undefined;
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRUYWJsZVZpc3VhbGl6YXRpb25zIiwidmlld3MiLCJ0YWJsZXMiLCJmb3JFYWNoIiwidmlldyIsInR5cGUiLCJ2aXN1YWxpemF0aW9ucyIsInNlY29uZGFyeVZpc3VhbGl6YXRpb24iLCJwcmVzZW50YXRpb24iLCJ2aXN1YWxpemF0aW9uIiwiVmlzdWFsaXphdGlvblR5cGUiLCJUYWJsZSIsInB1c2giLCJnZXRDaGFydFZpc3VhbGl6YXRpb25zIiwiY2hhcnRzIiwicHJpbWFyeVZpc3VhbGl6YXRpb24iLCJDaGFydCIsImdldERlZmF1bHRTZW1hbnRpY0RhdGVzIiwiZmlsdGVyRmllbGRzIiwiZGVmYXVsdFNlbWFudGljRGF0ZXMiLCJmaWx0ZXJGaWVsZCIsInNldHRpbmdzIiwiZGVmYXVsdFZhbHVlcyIsImxlbmd0aCIsImdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uIiwiZW50aXR5VHlwZSIsImNvbnZlcnRlckNvbnRleHQiLCJiSXNBTFAiLCJhbm5vdGF0aW9uUGF0aCIsImdldE1hbmlmZXN0V3JhcHBlciIsImdldERlZmF1bHRUZW1wbGF0ZUFubm90YXRpb25QYXRoIiwic2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCIsImdldFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQiLCJwcmVzZW50YXRpb25WYXJpYW50IiwiUHJlc2VudGF0aW9uVmFyaWFudCIsIkVycm9yIiwiYlBWQ29tcGxhaW50IiwiaXNQcmVzZW50YXRpb25Db21wbGlhbnQiLCJ1bmRlZmluZWQiLCJpc1NlbGVjdGlvblByZXNlbnRhdGlvbkNvbXBsaWFudCIsImdldERlZmF1bHRQcmVzZW50YXRpb25WYXJpYW50IiwiZGVmYXVsdExpbmVJdGVtIiwiZ2V0RGVmYXVsdExpbmVJdGVtIiwiZ2V0VmlldyIsInZpZXdDb252ZXJ0ZXJDb25maWd1cmF0aW9uIiwiY29uZmlnIiwiZ2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uIiwiYW5ub3RhdGlvbiIsImdldFJlbGF0aXZlQW5ub3RhdGlvblBhdGgiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJnZXRFbnRpdHlUeXBlIiwidGFibGVDb250cm9sSWQiLCJjaGFydENvbnRyb2xJZCIsInRpdGxlIiwic2VsZWN0aW9uVmFyaWFudFBhdGgiLCJpc011bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24iLCJjdXJyZW50Q29uZmlnIiwia2V5IiwiY3JlYXRlVmlzdWFsaXphdGlvbiIsImN1cnJlbnRQcmVzZW50YXRpb24iLCJpc1ByaW1hcnkiLCJkZWZhdWx0VmlzdWFsaXphdGlvbiIsInByZXNlbnRhdGlvbkNyZWF0ZWQiLCJPYmplY3QiLCJhc3NpZ24iLCJnZXRQcmVzZW50YXRpb24iLCJpdGVtIiwicmVzb2x2ZWRUYXJnZXQiLCJnZXRFbnRpdHlUeXBlQW5ub3RhdGlvbiIsInRhcmdldEFubm90YXRpb24iLCJjcmVhdGVBbHBWaWV3IiwicHJlc2VudGF0aW9ucyIsImRlZmF1bHRQYXRoIiwiaWQiLCJ2aXNpYmxlIiwiZ2V0VGVtcGxhdGVUeXBlIiwiVGVtcGxhdGVUeXBlIiwiQW5hbHl0aWNhbExpc3RQYWdlIiwiaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyIsInByaW1hcnkiLCJzZWNvbmRhcnkiLCJ2aWV3QW5ub3RhdGlvbiIsImNvbXBpbGVFeHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiVGV4dCIsInZpc3VhbGl6YXRpb25EZWZpbml0aW9uIiwiaW5kZXgiLCJ0YWJsZVZpc3VhbGl6YXRpb24iLCJmaWx0ZXJzIiwiY29udHJvbCIsImhpZGRlbkZpbHRlcnMiLCJwYXRocyIsImtlZXBQcmV2aW91c1BlcnNvbmFsaXphdGlvbiIsImdldFRhYmxlSUQiLCJ0ZXJtIiwiU2VsZWN0aW9uVmFyaWFudCIsInNwbGl0IiwiY2hhcnRWaXN1YWxpemF0aW9uIiwiZ2V0Q2hhcnRJRCIsIm11bHRpVmlld3MiLCJsYWJlbCIsImZyYWdtZW50IiwidGVtcGxhdGUiLCJjdXN0b21UYWJJZCIsImdldEN1c3RvbVRhYklEIiwiZ2V0Vmlld3MiLCJzZXR0aW5nc1ZpZXdzIiwidmlld0NvbnZlcnRlckNvbmZpZ3MiLCJwYXRoIiwidmlld0NvbnZlcnRlckNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Rm9yIiwiY29udGV4dFBhdGgiLCJlbnRpdHlTZXQiLCJnZXRDb250ZXh0UGF0aCIsImdldEFscFZpZXdDb25maWciLCJtYXAiLCJ2aWV3Q29udmVydGVyQ29uZmlnIiwiZ2V0TXVsdGlWaWV3c0NvbnRyb2wiLCJtYW5pZmVzdFdyYXBwZXIiLCJ2aWV3c0RlZmluaXRpb24iLCJnZXRWaWV3Q29uZmlndXJhdGlvbiIsImhhc011bHRpVmlzdWFsaXphdGlvbnMiLCJzaG93VGFiQ291bnRzIiwic2hvd0NvdW50cyIsImhhc011bHRpcGxlRW50aXR5U2V0cyIsImdldEljb25UYWJCYXJJRCIsInZpZXdDb25maWdzIiwiY2hhcnQiLCJ0YWJsZSIsImdldERlZmF1bHRDaGFydCIsImdldEhlYWRlckFjdGlvbnMiLCJpbnNlcnRDdXN0b21FbGVtZW50cyIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJhY3Rpb25zIiwiY2hlY2tDaGFydEZpbHRlckJhcklkIiwiZmlsdGVyQmFySWQiLCJmaWx0ZXJJZCIsImNvbnZlcnRQYWdlIiwic0NvbnRleHRQYXRoIiwibHJUYWJsZVZpc3VhbGl6YXRpb25zIiwibHJDaGFydFZpc3VhbGl6YXRpb25zIiwic2hvd1Bpbm5hYmxlVG9nZ2xlIiwic29tZSIsInNpbmdsZVRhYmxlSWQiLCJzaW5nbGVDaGFydElkIiwiZHluYW1pY0xpc3RSZXBvcnRJZCIsImdldER5bmFtaWNMaXN0UmVwb3J0SUQiLCJnZXRGaWx0ZXJCYXJJRCIsImZpbHRlclZhcmlhbnRNYW5hZ2VtZW50SUQiLCJnZXRGaWx0ZXJWYXJpYW50TWFuYWdlbWVudElEIiwiZmJDb25maWciLCJnZXRGaWx0ZXJDb25maWd1cmF0aW9uIiwiZmlsdGVySW5pdGlhbExheW91dCIsImluaXRpYWxMYXlvdXQiLCJ0b0xvd2VyQ2FzZSIsImZpbHRlckxheW91dCIsImxheW91dCIsInVzZVNlbWFudGljRGF0ZVJhbmdlIiwib0NvbmZpZyIsImdldENvbnRlbnRBcmVhSWQiLCJjaGFydElkIiwidGFibGVJZCIsImhpZGVGaWx0ZXJCYXIiLCJpc0ZpbHRlckJhckhpZGRlbiIsImxyRmlsdGVyUHJvcGVydGllcyIsImdldFNlbGVjdGlvbkZpZWxkcyIsInNlbGVjdGlvbkZpZWxkcyIsInByb3BlcnR5SW5mb0ZpZWxkcyIsInNQcm9wZXJ0eUluZm8iLCJoaWRlQmFzaWNTZWFyY2giLCJnZXRGaWx0ZXJCYXJoaWRlQmFzaWNTZWFyY2giLCJtdWx0aVZpZXdDb250cm9sIiwic2VsZWN0aW9uVmFyaWFudCIsImdldFNlbGVjdGlvblZhcmlhbnQiLCJnZXRNYW5pZmVzdEZpbHRlckZpZWxkcyIsImhlYWRlckFjdGlvbnMiLCJ2aXN1YWxpemF0aW9uSWRzIiwiY29uY2F0IiwidGFyZ2V0Q29udHJvbElkcyIsImdldFZhcmlhbnRNYW5hZ2VtZW50IiwiVmFyaWFudE1hbmFnZW1lbnRUeXBlIiwiQ29udHJvbCIsInN0aWNreVN1YmhlYWRlclByb3ZpZGVyIiwiZ2V0U3RpY2t5TXVsdGlUYWJIZWFkZXJDb25maWd1cmF0aW9uIiwibWFpbkVudGl0eVNldCIsIm1haW5FbnRpdHlUeXBlIiwibXVsdGlWaWV3c0NvbnRyb2wiLCJmaWx0ZXJCYXIiLCJwcm9wZXJ0eUluZm8iLCJmaWx0ZXJDb25kaXRpb25zIiwidmFyaWFudE1hbmFnZW1lbnQiLCJqb2luIiwidGVtcGxhdGVUeXBlIiwia3BpRGVmaW5pdGlvbnMiLCJnZXRLUElEZWZpbml0aW9ucyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTGlzdFJlcG9ydENvbnZlcnRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEVudGl0eVR5cGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHtcblx0TGluZUl0ZW0sXG5cdFByZXNlbnRhdGlvblZhcmlhbnQsXG5cdFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQsXG5cdFNlbGVjdGlvblZhcmlhbnRcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgdHlwZSB7IEJhc2VBY3Rpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0FjdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBDaGFydFZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQ2hhcnRcIjtcbmltcG9ydCB0eXBlIHsgVGFibGVWaXN1YWxpemF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSB7IEN1c3RvbUVsZW1lbnRGaWx0ZXJGaWVsZCwgRmlsdGVyRmllbGQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L0ZpbHRlckJhclwiO1xuaW1wb3J0IHtcblx0Z2V0RmlsdGVyQmFyaGlkZUJhc2ljU2VhcmNoLFxuXHRnZXRNYW5pZmVzdEZpbHRlckZpZWxkcyxcblx0Z2V0U2VsZWN0aW9uRmllbGRzXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvRmlsdGVyQmFyXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB0eXBlIHsgQ29uZmlndXJhYmxlT2JqZWN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGluc2VydEN1c3RvbUVsZW1lbnRzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhVmlzdWFsaXphdGlvbkFubm90YXRpb25zLCBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb24gfSBmcm9tIFwiLi4vY29udHJvbHMvQ29tbW9uL0RhdGFWaXN1YWxpemF0aW9uXCI7XG5pbXBvcnQge1xuXHRnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24sXG5cdGdldERlZmF1bHRDaGFydCxcblx0Z2V0RGVmYXVsdExpbmVJdGVtLFxuXHRnZXREZWZhdWx0UHJlc2VudGF0aW9uVmFyaWFudCxcblx0Z2V0U2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCxcblx0Z2V0U2VsZWN0aW9uVmFyaWFudCxcblx0aXNQcmVzZW50YXRpb25Db21wbGlhbnQsXG5cdGlzU2VsZWN0aW9uUHJlc2VudGF0aW9uQ29tcGxpYW50XG59IGZyb20gXCIuLi9jb250cm9scy9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB0eXBlIHsgS1BJRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9jb250cm9scy9Db21tb24vS1BJXCI7XG5pbXBvcnQgeyBnZXRLUElEZWZpbml0aW9ucyB9IGZyb20gXCIuLi9jb250cm9scy9Db21tb24vS1BJXCI7XG5pbXBvcnQge1xuXHRnZXRDaGFydElELFxuXHRnZXRDdXN0b21UYWJJRCxcblx0Z2V0RHluYW1pY0xpc3RSZXBvcnRJRCxcblx0Z2V0RmlsdGVyQmFySUQsXG5cdGdldEZpbHRlclZhcmlhbnRNYW5hZ2VtZW50SUQsXG5cdGdldEljb25UYWJCYXJJRCxcblx0Z2V0VGFibGVJRFxufSBmcm9tIFwiLi4vaGVscGVycy9JRFwiO1xuaW1wb3J0IHR5cGUge1xuXHRDb21iaW5lZFZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0Q3VzdG9tVmlld1RlbXBsYXRlQ29uZmlndXJhdGlvbixcblx0TXVsdGlwbGVWaWV3c0NvbmZpZ3VyYXRpb24sXG5cdFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbixcblx0Vmlld1BhdGhDb25maWd1cmF0aW9uXG59IGZyb20gXCIuLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBUZW1wbGF0ZVR5cGUsIFZhcmlhbnRNYW5hZ2VtZW50VHlwZSwgVmlzdWFsaXphdGlvblR5cGUgfSBmcm9tIFwiLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuXG50eXBlIFZpZXdBbm5vdGF0aW9ucyA9IFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgfCBTZWxlY3Rpb25WYXJpYW50O1xudHlwZSBWYXJpYW50TWFuYWdlbWVudERlZmluaXRpb24gPSB7XG5cdGlkOiBzdHJpbmc7XG5cdHRhcmdldENvbnRyb2xJZHM6IHN0cmluZztcbn07XG5cbnR5cGUgTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbiA9IFZpZXdQYXRoQ29uZmlndXJhdGlvbiAmIHtcblx0YW5ub3RhdGlvbj86IERhdGFWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG59O1xuXG50eXBlIFNpbmdsZVZpZXdDb25maWd1cmF0aW9uID0ge1xuXHRhbm5vdGF0aW9uPzogRGF0YVZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucztcbn07XG5cbnR5cGUgQ3VzdG9tVmlld0NvbmZpZ3VyYXRpb24gPSBDdXN0b21WaWV3VGVtcGxhdGVDb25maWd1cmF0aW9uICYge1xuXHR0eXBlOiBzdHJpbmc7XG59O1xuXG50eXBlIFZpZXdDb25maWd1cmF0aW9uID0gTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbiB8IFNpbmdsZVZpZXdDb25maWd1cmF0aW9uIHwgQ3VzdG9tVmlld0NvbmZpZ3VyYXRpb247XG50eXBlIFZpZXdBbm5vdGF0aW9uQ29uZmlndXJhdGlvbiA9IE11bHRpcGxlVmlld0NvbmZpZ3VyYXRpb24gfCBTaW5nbGVWaWV3Q29uZmlndXJhdGlvbjtcblxudHlwZSBWaWV3Q29udmVydGVyU2V0dGluZ3MgPSBWaWV3Q29uZmlndXJhdGlvbiAmIHtcblx0Y29udmVydGVyQ29udGV4dD86IENvbnZlcnRlckNvbnRleHQ7XG59O1xuXG50eXBlIERlZmF1bHRTZW1hbnRpY0RhdGUgPSBDb25maWd1cmFibGVPYmplY3QgJiB7XG5cdG9wZXJhdG9yOiBzdHJpbmc7XG59O1xuXG50eXBlIE11bHRpVmlld3NDb250cm9sQ29uZmlndXJhdGlvbiA9IHtcblx0aWQ6IHN0cmluZztcblx0c2hvd1RhYkNvdW50cz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBMaXN0UmVwb3J0RGVmaW5pdGlvbiA9IHtcblx0bWFpbkVudGl0eVNldDogc3RyaW5nO1xuXHRtYWluRW50aXR5VHlwZTogc3RyaW5nOyAvLyBlbnRpdHlUeXBlPiBhdCB0aGUgc3RhcnQgb2YgTFIgdGVtcGxhdGluZ1xuXHRzaW5nbGVUYWJsZUlkPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggc2luZ2xlIFRhYmxlIG1vZGVcblx0c2luZ2xlQ2hhcnRJZD86IHN0cmluZzsgLy8gb25seSB3aXRoIHNpbmdsZSBUYWJsZSBtb2RlXG5cdGR5bmFtaWNMaXN0UmVwb3J0SWQ6IHN0cmluZztcblx0c3RpY2t5U3ViaGVhZGVyUHJvdmlkZXI/OiBzdHJpbmc7XG5cdG11bHRpVmlld3NDb250cm9sPzogTXVsdGlWaWV3c0NvbnRyb2xDb25maWd1cmF0aW9uOyAvLyBvbmx5IHdpdGggbXVsdGkgVGFibGUgbW9kZVxuXHRoZWFkZXJBY3Rpb25zOiBCYXNlQWN0aW9uW107XG5cdHNob3dQaW5uYWJsZVRvZ2dsZT86IGJvb2xlYW47XG5cdGZpbHRlckJhcjoge1xuXHRcdHByb3BlcnR5SW5mbzogYW55O1xuXHRcdHNlbGVjdGlvbkZpZWxkczogRmlsdGVyRmllbGRbXTtcblx0XHRoaWRlQmFzaWNTZWFyY2g6IGJvb2xlYW47XG5cdH07XG5cdHZpZXdzOiBMaXN0UmVwb3J0Vmlld0RlZmluaXRpb25bXTtcblx0ZmlsdGVyQ29uZGl0aW9uczoge1xuXHRcdHNlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQgfCB1bmRlZmluZWQ7XG5cdFx0ZGVmYXVsdFNlbWFudGljRGF0ZXM6IFJlY29yZDxzdHJpbmcsIERlZmF1bHRTZW1hbnRpY0RhdGU+IHwge307XG5cdH07XG5cdGZpbHRlckJhcklkOiBzdHJpbmc7XG5cdHZhcmlhbnRNYW5hZ2VtZW50OiBWYXJpYW50TWFuYWdlbWVudERlZmluaXRpb247XG5cdGhhc011bHRpVmlzdWFsaXphdGlvbnM6IGJvb2xlYW47XG5cdHRlbXBsYXRlVHlwZTogVGVtcGxhdGVUeXBlO1xuXHR1c2VTZW1hbnRpY0RhdGVSYW5nZT86IGJvb2xlYW47XG5cdGZpbHRlckluaXRpYWxMYXlvdXQ/OiBzdHJpbmc7XG5cdGZpbHRlckxheW91dD86IHN0cmluZztcblx0a3BpRGVmaW5pdGlvbnM6IEtQSURlZmluaXRpb25bXTtcblx0aGlkZUZpbHRlckJhcjogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbiA9IFNpbmdsZVZpZXdEZWZpbml0aW9uIHwgQ3VzdG9tVmlld0RlZmluaXRpb24gfCBDb21iaW5lZFZpZXdEZWZpbml0aW9uO1xuXG5leHBvcnQgdHlwZSBDb21iaW5lZFZpZXdEZWZpbml0aW9uID0ge1xuXHRzZWxlY3Rpb25WYXJpYW50UGF0aD86IHN0cmluZzsgLy8gb25seSB3aXRoIG9uIG11bHRpIFRhYmxlIG1vZGVcblx0dGl0bGU/OiBzdHJpbmc7IC8vIG9ubHkgd2l0aCBtdWx0aSBUYWJsZSBtb2RlXG5cdHByaW1hcnlWaXN1YWxpemF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb247XG5cdHNlY29uZGFyeVZpc3VhbGl6YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbjtcblx0dGFibGVDb250cm9sSWQ6IHN0cmluZztcblx0Y2hhcnRDb250cm9sSWQ6IHN0cmluZztcblx0ZGVmYXVsdFBhdGg/OiBzdHJpbmc7XG5cdHZpc2libGU/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBDdXN0b21WaWV3RGVmaW5pdGlvbiA9IHtcblx0dGl0bGU/OiBzdHJpbmc7IC8vIG9ubHkgd2l0aCBtdWx0aSBUYWJsZSBtb2RlXG5cdGZyYWdtZW50OiBzdHJpbmc7XG5cdHR5cGU6IHN0cmluZztcblx0Y3VzdG9tVGFiSWQ6IHN0cmluZztcblx0dmlzaWJsZT86IHN0cmluZztcbn07XG5leHBvcnQgdHlwZSBTaW5nbGVWaWV3RGVmaW5pdGlvbiA9IFNpbmdsZVRhYmxlVmlld0RlZmluaXRpb24gfCBTaW5nbGVDaGFydFZpZXdEZWZpbml0aW9uO1xuXG5leHBvcnQgdHlwZSBCYXNlU2luZ2xlVmlld0RlZmluaXRpb24gPSB7XG5cdHNlbGVjdGlvblZhcmlhbnRQYXRoPzogc3RyaW5nOyAvLyBvbmx5IHdpdGggb24gbXVsdGkgVGFibGUgbW9kZVxuXHR0aXRsZT86IHN0cmluZzsgLy8gb25seSB3aXRoIG11bHRpIFRhYmxlIG1vZGVcblx0cHJlc2VudGF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb247XG59O1xuXG5leHBvcnQgdHlwZSBTaW5nbGVUYWJsZVZpZXdEZWZpbml0aW9uID0gQmFzZVNpbmdsZVZpZXdEZWZpbml0aW9uICYge1xuXHR0YWJsZUNvbnRyb2xJZD86IHN0cmluZztcblx0dmlzaWJsZT86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFNpbmdsZUNoYXJ0Vmlld0RlZmluaXRpb24gPSBCYXNlU2luZ2xlVmlld0RlZmluaXRpb24gJiB7XG5cdGNoYXJ0Q29udHJvbElkPzogc3RyaW5nO1xuXHR2aXNpYmxlPzogc3RyaW5nO1xufTtcblxudHlwZSBDb250ZW50QXJlYUlEID0ge1xuXHRjaGFydElkOiBzdHJpbmc7XG5cdHRhYmxlSWQ6IHN0cmluZztcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIGFsbCBsaXN0IHJlcG9ydCB0YWJsZXMuXG4gKlxuICogQHBhcmFtIHZpZXdzIFRoZSBsaXN0IHJlcG9ydCB2aWV3cyBjb25maWd1cmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHJldHVybnMgVGhlIGxpc3QgcmVwb3J0IHRhYmxlXG4gKi9cbmZ1bmN0aW9uIGdldFRhYmxlVmlzdWFsaXphdGlvbnModmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdKTogVGFibGVWaXN1YWxpemF0aW9uW10ge1xuXHRjb25zdCB0YWJsZXM6IFRhYmxlVmlzdWFsaXphdGlvbltdID0gW107XG5cdHZpZXdzLmZvckVhY2goZnVuY3Rpb24gKHZpZXcpIHtcblx0XHRpZiAoISh2aWV3IGFzIEN1c3RvbVZpZXdEZWZpbml0aW9uKS50eXBlKSB7XG5cdFx0XHRjb25zdCB2aXN1YWxpemF0aW9ucyA9ICh2aWV3IGFzIENvbWJpbmVkVmlld0RlZmluaXRpb24pLnNlY29uZGFyeVZpc3VhbGl6YXRpb25cblx0XHRcdFx0PyAodmlldyBhcyBDb21iaW5lZFZpZXdEZWZpbml0aW9uKS5zZWNvbmRhcnlWaXN1YWxpemF0aW9uLnZpc3VhbGl6YXRpb25zXG5cdFx0XHRcdDogKHZpZXcgYXMgU2luZ2xlVmlld0RlZmluaXRpb24pLnByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9ucztcblxuXHRcdFx0dmlzdWFsaXphdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAodmlzdWFsaXphdGlvbikge1xuXHRcdFx0XHRpZiAodmlzdWFsaXphdGlvbi50eXBlID09PSBWaXN1YWxpemF0aW9uVHlwZS5UYWJsZSkge1xuXHRcdFx0XHRcdHRhYmxlcy5wdXNoKHZpc3VhbGl6YXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gdGFibGVzO1xufVxuXG5mdW5jdGlvbiBnZXRDaGFydFZpc3VhbGl6YXRpb25zKHZpZXdzOiBMaXN0UmVwb3J0Vmlld0RlZmluaXRpb25bXSk6IENoYXJ0VmlzdWFsaXphdGlvbltdIHtcblx0Y29uc3QgY2hhcnRzOiBDaGFydFZpc3VhbGl6YXRpb25bXSA9IFtdO1xuXHR2aWV3cy5mb3JFYWNoKGZ1bmN0aW9uICh2aWV3KSB7XG5cdFx0aWYgKCEodmlldyBhcyBDdXN0b21WaWV3RGVmaW5pdGlvbikudHlwZSkge1xuXHRcdFx0Y29uc3QgdmlzdWFsaXphdGlvbnMgPSAodmlldyBhcyBDb21iaW5lZFZpZXdEZWZpbml0aW9uKS5wcmltYXJ5VmlzdWFsaXphdGlvblxuXHRcdFx0XHQ/ICh2aWV3IGFzIENvbWJpbmVkVmlld0RlZmluaXRpb24pLnByaW1hcnlWaXN1YWxpemF0aW9uLnZpc3VhbGl6YXRpb25zXG5cdFx0XHRcdDogKHZpZXcgYXMgU2luZ2xlVmlld0RlZmluaXRpb24pLnByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9ucztcblxuXHRcdFx0dmlzdWFsaXphdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAodmlzdWFsaXphdGlvbikge1xuXHRcdFx0XHRpZiAodmlzdWFsaXphdGlvbi50eXBlID09PSBWaXN1YWxpemF0aW9uVHlwZS5DaGFydCkge1xuXHRcdFx0XHRcdGNoYXJ0cy5wdXNoKHZpc3VhbGl6YXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gY2hhcnRzO1xufVxuXG5jb25zdCBnZXREZWZhdWx0U2VtYW50aWNEYXRlcyA9IGZ1bmN0aW9uIChmaWx0ZXJGaWVsZHM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUVsZW1lbnRGaWx0ZXJGaWVsZD4pOiBSZWNvcmQ8c3RyaW5nLCBEZWZhdWx0U2VtYW50aWNEYXRlPiB7XG5cdGNvbnN0IGRlZmF1bHRTZW1hbnRpY0RhdGVzOiBhbnkgPSB7fTtcblx0Zm9yIChjb25zdCBmaWx0ZXJGaWVsZCBpbiBmaWx0ZXJGaWVsZHMpIHtcblx0XHRpZiAoZmlsdGVyRmllbGRzW2ZpbHRlckZpZWxkXT8uc2V0dGluZ3M/LmRlZmF1bHRWYWx1ZXM/Lmxlbmd0aCkge1xuXHRcdFx0ZGVmYXVsdFNlbWFudGljRGF0ZXNbZmlsdGVyRmllbGRdID0gZmlsdGVyRmllbGRzW2ZpbHRlckZpZWxkXT8uc2V0dGluZ3M/LmRlZmF1bHRWYWx1ZXM7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBkZWZhdWx0U2VtYW50aWNEYXRlcztcbn07XG5cbi8qKlxuICogRmluZCBhIHZpc3VhbGl6YXRpb24gYW5ub3RhdGlvbiB0aGF0IGNhbiBiZSB1c2VkIGZvciByZW5kZXJpbmcgdGhlIGxpc3QgcmVwb3J0LlxuICpcbiAqIEBwYXJhbSBlbnRpdHlUeXBlIFRoZSBjdXJyZW50IEVudGl0eVR5cGVcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gYklzQUxQXG4gKiBAcmV0dXJucyBBIGNvbXBsaWFudCBhbm5vdGF0aW9uIGZvciByZW5kZXJpbmcgdGhlIGxpc3QgcmVwb3J0XG4gKi9cbmZ1bmN0aW9uIGdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uKFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRiSXNBTFA6IGJvb2xlYW5cbik6IExpbmVJdGVtIHwgUHJlc2VudGF0aW9uVmFyaWFudCB8IFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQgfCB1bmRlZmluZWQge1xuXHRjb25zdCBhbm5vdGF0aW9uUGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuZ2V0RGVmYXVsdFRlbXBsYXRlQW5ub3RhdGlvblBhdGgoKTtcblx0Y29uc3Qgc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCA9IGdldFNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQoZW50aXR5VHlwZSwgYW5ub3RhdGlvblBhdGgsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRpZiAoYW5ub3RhdGlvblBhdGggJiYgc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCkge1xuXHRcdGNvbnN0IHByZXNlbnRhdGlvblZhcmlhbnQgPSBzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LlByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0aWYgKCFwcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQcmVzZW50YXRpb24gVmFyaWFudCBpcyBub3QgY29uZmlndXJlZCBpbiB0aGUgU1BWIG1lbnRpb25lZCBpbiB0aGUgbWFuaWZlc3RcIik7XG5cdFx0fVxuXHRcdGNvbnN0IGJQVkNvbXBsYWludCA9IGlzUHJlc2VudGF0aW9uQ29tcGxpYW50KHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQuUHJlc2VudGF0aW9uVmFyaWFudCk7XG5cdFx0aWYgKCFiUFZDb21wbGFpbnQpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdGlmIChpc1NlbGVjdGlvblByZXNlbnRhdGlvbkNvbXBsaWFudChzZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50LCBiSXNBTFApKSB7XG5cdFx0XHRyZXR1cm4gc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudDtcblx0XHR9XG5cdH1cblx0aWYgKHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRpZiAoaXNTZWxlY3Rpb25QcmVzZW50YXRpb25Db21wbGlhbnQoc2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudCwgYklzQUxQKSkge1xuXHRcdFx0cmV0dXJuIHNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0fVxuXHR9XG5cdGNvbnN0IHByZXNlbnRhdGlvblZhcmlhbnQgPSBnZXREZWZhdWx0UHJlc2VudGF0aW9uVmFyaWFudChlbnRpdHlUeXBlKTtcblx0aWYgKHByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRpZiAoaXNQcmVzZW50YXRpb25Db21wbGlhbnQocHJlc2VudGF0aW9uVmFyaWFudCwgYklzQUxQKSkge1xuXHRcdFx0cmV0dXJuIHByZXNlbnRhdGlvblZhcmlhbnQ7XG5cdFx0fVxuXHR9XG5cdGlmICghYklzQUxQKSB7XG5cdFx0Y29uc3QgZGVmYXVsdExpbmVJdGVtID0gZ2V0RGVmYXVsdExpbmVJdGVtKGVudGl0eVR5cGUpO1xuXHRcdGlmIChkZWZhdWx0TGluZUl0ZW0pIHtcblx0XHRcdHJldHVybiBkZWZhdWx0TGluZUl0ZW07XG5cdFx0fVxuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5cbmNvbnN0IGdldFZpZXcgPSBmdW5jdGlvbiAodmlld0NvbnZlcnRlckNvbmZpZ3VyYXRpb246IFZpZXdDb252ZXJ0ZXJTZXR0aW5ncyk6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbiB7XG5cdGxldCBjb25maWcgPSB2aWV3Q29udmVydGVyQ29uZmlndXJhdGlvbjtcblx0aWYgKGNvbmZpZy5jb252ZXJ0ZXJDb250ZXh0KSB7XG5cdFx0bGV0IGNvbnZlcnRlckNvbnRleHQgPSBjb25maWcuY29udmVydGVyQ29udGV4dDtcblx0XHRjb25maWcgPSBjb25maWcgYXMgVmlld0Fubm90YXRpb25Db25maWd1cmF0aW9uO1xuXHRcdGxldCBwcmVzZW50YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiA9IGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbihcblx0XHRcdGNvbmZpZy5hbm5vdGF0aW9uXG5cdFx0XHRcdD8gY29udmVydGVyQ29udGV4dC5nZXRSZWxhdGl2ZUFubm90YXRpb25QYXRoKGNvbmZpZy5hbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSwgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkpXG5cdFx0XHRcdDogXCJcIixcblx0XHRcdHRydWUsXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0Y29uZmlnIGFzIFZpZXdQYXRoQ29uZmlndXJhdGlvblxuXHRcdCk7XG5cdFx0bGV0IHRhYmxlQ29udHJvbElkID0gXCJcIjtcblx0XHRsZXQgY2hhcnRDb250cm9sSWQgPSBcIlwiO1xuXHRcdGxldCB0aXRsZTogc3RyaW5nIHwgdW5kZWZpbmVkID0gXCJcIjtcblx0XHRsZXQgc2VsZWN0aW9uVmFyaWFudFBhdGggPSBcIlwiO1xuXHRcdGNvbnN0IGlzTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbiA9IGZ1bmN0aW9uIChjdXJyZW50Q29uZmlnOiBWaWV3Q29uZmlndXJhdGlvbik6IGN1cnJlbnRDb25maWcgaXMgTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbiB7XG5cdFx0XHRyZXR1cm4gKGN1cnJlbnRDb25maWcgYXMgTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbikua2V5ICE9PSB1bmRlZmluZWQ7XG5cdFx0fTtcblx0XHRjb25zdCBjcmVhdGVWaXN1YWxpemF0aW9uID0gZnVuY3Rpb24gKGN1cnJlbnRQcmVzZW50YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiwgaXNQcmltYXJ5PzogYm9vbGVhbikge1xuXHRcdFx0bGV0IGRlZmF1bHRWaXN1YWxpemF0aW9uO1xuXHRcdFx0Zm9yIChjb25zdCB2aXN1YWxpemF0aW9uIG9mIGN1cnJlbnRQcmVzZW50YXRpb24udmlzdWFsaXphdGlvbnMpIHtcblx0XHRcdFx0aWYgKGlzUHJpbWFyeSAmJiB2aXN1YWxpemF0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0KSB7XG5cdFx0XHRcdFx0ZGVmYXVsdFZpc3VhbGl6YXRpb24gPSB2aXN1YWxpemF0aW9uO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICghaXNQcmltYXJ5ICYmIHZpc3VhbGl6YXRpb24udHlwZSA9PT0gVmlzdWFsaXphdGlvblR5cGUuVGFibGUpIHtcblx0XHRcdFx0XHRkZWZhdWx0VmlzdWFsaXphdGlvbiA9IHZpc3VhbGl6YXRpb247XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGNvbnN0IHByZXNlbnRhdGlvbkNyZWF0ZWQgPSBPYmplY3QuYXNzaWduKHt9LCBjdXJyZW50UHJlc2VudGF0aW9uKTtcblx0XHRcdGlmIChkZWZhdWx0VmlzdWFsaXphdGlvbikge1xuXHRcdFx0XHRwcmVzZW50YXRpb25DcmVhdGVkLnZpc3VhbGl6YXRpb25zID0gW2RlZmF1bHRWaXN1YWxpemF0aW9uXTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBwcmVzZW50YXRpb25DcmVhdGVkO1xuXHRcdH07XG5cdFx0Y29uc3QgZ2V0UHJlc2VudGF0aW9uID0gZnVuY3Rpb24gKGl0ZW06IFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbikge1xuXHRcdFx0Y29uc3QgcmVzb2x2ZWRUYXJnZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKGl0ZW0uYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0Y29uc3QgdGFyZ2V0QW5ub3RhdGlvbiA9IHJlc29sdmVkVGFyZ2V0LmFubm90YXRpb24gYXMgRGF0YVZpc3VhbGl6YXRpb25Bbm5vdGF0aW9ucztcblx0XHRcdGNvbnZlcnRlckNvbnRleHQgPSByZXNvbHZlZFRhcmdldC5jb252ZXJ0ZXJDb250ZXh0O1xuXHRcdFx0Y29uc3QgYW5ub3RhdGlvbiA9IHRhcmdldEFubm90YXRpb247XG5cdFx0XHRwcmVzZW50YXRpb24gPSBnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24oXG5cdFx0XHRcdGFubm90YXRpb25cblx0XHRcdFx0XHQ/IGNvbnZlcnRlckNvbnRleHQuZ2V0UmVsYXRpdmVBbm5vdGF0aW9uUGF0aChhbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSwgY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkpXG5cdFx0XHRcdFx0OiBcIlwiLFxuXHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRjb25maWcgYXMgVmlld1BhdGhDb25maWd1cmF0aW9uXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIHByZXNlbnRhdGlvbjtcblx0XHR9O1xuXHRcdGNvbnN0IGNyZWF0ZUFscFZpZXcgPSBmdW5jdGlvbiAoXG5cdFx0XHRwcmVzZW50YXRpb25zOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb25bXSxcblx0XHRcdGRlZmF1bHRQYXRoOiBcImJvdGhcIiB8IFwicHJpbWFyeVwiIHwgXCJzZWNvbmRhcnlcIiB8IHVuZGVmaW5lZFxuXHRcdCkge1xuXHRcdFx0Y29uc3QgcHJpbWFyeVZpc3VhbGl6YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCA9IGNyZWF0ZVZpc3VhbGl6YXRpb24ocHJlc2VudGF0aW9uc1swXSwgdHJ1ZSk7XG5cdFx0XHRjaGFydENvbnRyb2xJZCA9IChwcmltYXJ5VmlzdWFsaXphdGlvbj8udmlzdWFsaXphdGlvbnNbMF0gYXMgQ2hhcnRWaXN1YWxpemF0aW9uKS5pZDtcblx0XHRcdGNvbnN0IHNlY29uZGFyeVZpc3VhbGl6YXRpb246IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiB8IHVuZGVmaW5lZCA9IGNyZWF0ZVZpc3VhbGl6YXRpb24oXG5cdFx0XHRcdHByZXNlbnRhdGlvbnNbMV0gPyBwcmVzZW50YXRpb25zWzFdIDogcHJlc2VudGF0aW9uc1swXVxuXHRcdFx0KTtcblx0XHRcdHRhYmxlQ29udHJvbElkID0gKHNlY29uZGFyeVZpc3VhbGl6YXRpb24/LnZpc3VhbGl6YXRpb25zWzBdIGFzIFRhYmxlVmlzdWFsaXphdGlvbikuYW5ub3RhdGlvbi5pZDtcblx0XHRcdGlmIChwcmltYXJ5VmlzdWFsaXphdGlvbiAmJiBzZWNvbmRhcnlWaXN1YWxpemF0aW9uKSB7XG5cdFx0XHRcdGNvbmZpZyA9IGNvbmZpZyBhcyBWaWV3UGF0aENvbmZpZ3VyYXRpb247XG5cdFx0XHRcdGNvbnN0IHZpc2libGUgPSBjb25maWcudmlzaWJsZTtcblx0XHRcdFx0Y29uc3QgdmlldzogQ29tYmluZWRWaWV3RGVmaW5pdGlvbiA9IHtcblx0XHRcdFx0XHRwcmltYXJ5VmlzdWFsaXphdGlvbixcblx0XHRcdFx0XHRzZWNvbmRhcnlWaXN1YWxpemF0aW9uLFxuXHRcdFx0XHRcdHRhYmxlQ29udHJvbElkLFxuXHRcdFx0XHRcdGNoYXJ0Q29udHJvbElkLFxuXHRcdFx0XHRcdGRlZmF1bHRQYXRoLFxuXHRcdFx0XHRcdHZpc2libGVcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIHZpZXc7XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRpZiAocHJlc2VudGF0aW9uPy52aXN1YWxpemF0aW9ucz8ubGVuZ3RoID09PSAyICYmIGNvbnZlcnRlckNvbnRleHQuZ2V0VGVtcGxhdGVUeXBlKCkgPT09IFRlbXBsYXRlVHlwZS5BbmFseXRpY2FsTGlzdFBhZ2UpIHtcblx0XHRcdGNvbnN0IHZpZXc6IENvbWJpbmVkVmlld0RlZmluaXRpb24gfCB1bmRlZmluZWQgPSBjcmVhdGVBbHBWaWV3KFtwcmVzZW50YXRpb25dLCBcImJvdGhcIik7XG5cdFx0XHRpZiAodmlldykge1xuXHRcdFx0XHRyZXR1cm4gdmlldztcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKGNvbmZpZyBhcyBWaWV3UGF0aENvbmZpZ3VyYXRpb24pIHx8XG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlXG5cdFx0KSB7XG5cdFx0XHRjb25zdCB7IHByaW1hcnksIHNlY29uZGFyeSB9ID0gY29uZmlnIGFzIENvbWJpbmVkVmlld1BhdGhDb25maWd1cmF0aW9uO1xuXHRcdFx0aWYgKHByaW1hcnkgJiYgcHJpbWFyeS5sZW5ndGggJiYgc2Vjb25kYXJ5ICYmIHNlY29uZGFyeS5sZW5ndGgpIHtcblx0XHRcdFx0Y29uc3QgdmlldzogQ29tYmluZWRWaWV3RGVmaW5pdGlvbiB8IHVuZGVmaW5lZCA9IGNyZWF0ZUFscFZpZXcoXG5cdFx0XHRcdFx0W2dldFByZXNlbnRhdGlvbihwcmltYXJ5WzBdKSwgZ2V0UHJlc2VudGF0aW9uKHNlY29uZGFyeVswXSldLFxuXHRcdFx0XHRcdChjb25maWcgYXMgQ29tYmluZWRWaWV3UGF0aENvbmZpZ3VyYXRpb24pLmRlZmF1bHRQYXRoXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICh2aWV3KSB7XG5cdFx0XHRcdFx0cmV0dXJuIHZpZXc7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlNlY29uZGFyeUl0ZW1zIGluIHRoZSBWaWV3cyBpcyBub3QgcHJlc2VudFwiKTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKGlzTXVsdGlwbGVWaWV3Q29uZmlndXJhdGlvbihjb25maWcpKSB7XG5cdFx0XHQvLyBrZXkgZXhpc3RzIG9ubHkgb24gbXVsdGkgdGFibGVzIG1vZGVcblx0XHRcdGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlQW5ub3RhdGlvbigoY29uZmlnIGFzIFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbikuYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0Y29uc3Qgdmlld0Fubm90YXRpb246IFZpZXdBbm5vdGF0aW9ucyA9IHJlc29sdmVkVGFyZ2V0LmFubm90YXRpb247XG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0ID0gcmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dDtcblx0XHRcdHRpdGxlID0gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKHZpZXdBbm5vdGF0aW9uLlRleHQpKTtcblx0XHRcdC8vIE5lZWQgdG8gbG9vcCBvbiB0YWJsZSBpbnRvIHZpZXdzIHNpbmNlIG11bHRpIHRhYmxlIG1vZGUgZ2V0IHNwZWNpZmljIGNvbmZpZ3VyYXRpb24gKGhpZGRlbiBmaWx0ZXJzIG9yIFRhYmxlIElkKVxuXHRcdFx0cHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zLmZvckVhY2goKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLCBpbmRleCkgPT4ge1xuXHRcdFx0XHRzd2l0Y2ggKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLnR5cGUpIHtcblx0XHRcdFx0XHRjYXNlIFZpc3VhbGl6YXRpb25UeXBlLlRhYmxlOlxuXHRcdFx0XHRcdFx0Y29uc3QgdGFibGVWaXN1YWxpemF0aW9uID0gcHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zW2luZGV4XSBhcyBUYWJsZVZpc3VhbGl6YXRpb247XG5cdFx0XHRcdFx0XHRjb25zdCBmaWx0ZXJzID0gdGFibGVWaXN1YWxpemF0aW9uLmNvbnRyb2wuZmlsdGVycyB8fCB7fTtcblx0XHRcdFx0XHRcdGZpbHRlcnMuaGlkZGVuRmlsdGVycyA9IGZpbHRlcnMuaGlkZGVuRmlsdGVycyB8fCB7IHBhdGhzOiBbXSB9O1xuXHRcdFx0XHRcdFx0aWYgKCEoY29uZmlnIGFzIFNpbmdsZVZpZXdQYXRoQ29uZmlndXJhdGlvbikua2VlcFByZXZpb3VzUGVyc29uYWxpemF0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdC8vIE5lZWQgdG8gb3ZlcnJpZGUgVGFibGUgSWQgdG8gbWF0Y2ggd2l0aCBUYWIgS2V5IChjdXJyZW50bHkgb25seSB0YWJsZSBpcyBtYW5hZ2VkIGluIG11bHRpcGxlIHZpZXcgbW9kZSlcblx0XHRcdFx0XHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmFubm90YXRpb24uaWQgPSBnZXRUYWJsZUlEKChjb25maWcgYXMgU2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uKS5rZXkgfHwgXCJcIiwgXCJMaW5lSXRlbVwiKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGNvbmZpZyA9IGNvbmZpZyBhcyBWaWV3QW5ub3RhdGlvbkNvbmZpZ3VyYXRpb247XG5cdFx0XHRcdFx0XHRpZiAoY29uZmlnICYmIGNvbmZpZy5hbm5vdGF0aW9uICYmIGNvbmZpZy5hbm5vdGF0aW9uLnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnQpIHtcblx0XHRcdFx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudFBhdGggPSBgQCR7Y29uZmlnLmFubm90YXRpb24uU2VsZWN0aW9uVmFyaWFudC5mdWxseVF1YWxpZmllZE5hbWUuc3BsaXQoXCJAXCIpWzFdfWA7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50UGF0aCA9IChjb25maWcgYXMgU2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uKS5hbm5vdGF0aW9uUGF0aDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vUHJvdmlkZSBTZWxlY3Rpb24gVmFyaWFudCB0byBoaWRkZW5GaWx0ZXJzIGluIG9yZGVyIHRvIHNldCB0aGUgU1YgZmlsdGVycyB0byB0aGUgdGFibGUuXG5cdFx0XHRcdFx0XHQvL01EQyBUYWJsZSBvdmVycmlkZXMgYmluZGluZyBGaWx0ZXIgYW5kIGZyb20gU0FQIEZFIHRoZSBvbmx5IG1ldGhvZCB3aGVyZSB3ZSBhcmUgYWJsZSB0byBhZGRcblx0XHRcdFx0XHRcdC8vYWRkaXRpb25hbCBmaWx0ZXIgaXMgJ3JlYmluZFRhYmxlJyBpbnRvIFRhYmxlIGRlbGVnYXRlLlxuXHRcdFx0XHRcdFx0Ly9UbyBhdm9pZCBpbXBsZW1lbnRpbmcgc3BlY2lmaWMgTFIgZmVhdHVyZSB0byBTQVAgRkUgTWFjcm8gVGFibGUsIHRoZSBmaWx0ZXIocykgcmVsYXRlZCB0byB0aGUgVGFiIChtdWx0aSB0YWJsZSBtb2RlKVxuXHRcdFx0XHRcdFx0Ly9jYW4gYmUgcGFzc2VkIHRvIG1hY3JvIHRhYmxlIHZpYSBwYXJhbWV0ZXIvY29udGV4dCBuYW1lZCBmaWx0ZXJzIGFuZCBrZXkgaGlkZGVuRmlsdGVycy5cblx0XHRcdFx0XHRcdGZpbHRlcnMuaGlkZGVuRmlsdGVycy5wYXRocy5wdXNoKHsgYW5ub3RhdGlvblBhdGg6IHNlbGVjdGlvblZhcmlhbnRQYXRoIH0pO1xuXHRcdFx0XHRcdFx0dGFibGVWaXN1YWxpemF0aW9uLmNvbnRyb2wuZmlsdGVycyA9IGZpbHRlcnM7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFZpc3VhbGl6YXRpb25UeXBlLkNoYXJ0OlxuXHRcdFx0XHRcdFx0Y29uc3QgY2hhcnRWaXN1YWxpemF0aW9uID0gcHJlc2VudGF0aW9uLnZpc3VhbGl6YXRpb25zW2luZGV4XSBhcyBDaGFydFZpc3VhbGl6YXRpb247XG5cdFx0XHRcdFx0XHRjaGFydFZpc3VhbGl6YXRpb24uaWQgPSBnZXRDaGFydElEKChjb25maWcgYXMgU2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uKS5rZXkgfHwgXCJcIiwgXCJDaGFydFwiKTtcblx0XHRcdFx0XHRcdGNoYXJ0VmlzdWFsaXphdGlvbi5tdWx0aVZpZXdzID0gdHJ1ZTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9ucy5mb3JFYWNoKCh2aXN1YWxpemF0aW9uRGVmaW5pdGlvbikgPT4ge1xuXHRcdFx0aWYgKHZpc3VhbGl6YXRpb25EZWZpbml0aW9uLnR5cGUgPT09IFZpc3VhbGl6YXRpb25UeXBlLlRhYmxlKSB7XG5cdFx0XHRcdHRhYmxlQ29udHJvbElkID0gdmlzdWFsaXphdGlvbkRlZmluaXRpb24uYW5ub3RhdGlvbi5pZDtcblx0XHRcdH0gZWxzZSBpZiAodmlzdWFsaXphdGlvbkRlZmluaXRpb24udHlwZSA9PT0gVmlzdWFsaXphdGlvblR5cGUuQ2hhcnQpIHtcblx0XHRcdFx0Y2hhcnRDb250cm9sSWQgPSB2aXN1YWxpemF0aW9uRGVmaW5pdGlvbi5pZDtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRjb25maWcgPSBjb25maWcgYXMgVmlld1BhdGhDb25maWd1cmF0aW9uO1xuXHRcdGNvbnN0IHZpc2libGUgPSBjb25maWcudmlzaWJsZTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0cHJlc2VudGF0aW9uLFxuXHRcdFx0dGFibGVDb250cm9sSWQsXG5cdFx0XHRjaGFydENvbnRyb2xJZCxcblx0XHRcdHRpdGxlLFxuXHRcdFx0c2VsZWN0aW9uVmFyaWFudFBhdGgsXG5cdFx0XHR2aXNpYmxlXG5cdFx0fTtcblx0fSBlbHNlIHtcblx0XHRjb25maWcgPSBjb25maWcgYXMgQ3VzdG9tVmlld0NvbmZpZ3VyYXRpb247XG5cdFx0Y29uc3QgdGl0bGUgPSBjb25maWcubGFiZWwsXG5cdFx0XHRmcmFnbWVudCA9IGNvbmZpZy50ZW1wbGF0ZSxcblx0XHRcdHR5cGUgPSBjb25maWcudHlwZSxcblx0XHRcdGN1c3RvbVRhYklkID0gZ2V0Q3VzdG9tVGFiSUQoY29uZmlnLmtleSB8fCBcIlwiKSxcblx0XHRcdHZpc2libGUgPSBjb25maWcudmlzaWJsZTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0dGl0bGUsXG5cdFx0XHRmcmFnbWVudCxcblx0XHRcdHR5cGUsXG5cdFx0XHRjdXN0b21UYWJJZCxcblx0XHRcdHZpc2libGVcblx0XHR9O1xuXHR9XG59O1xuXG5jb25zdCBnZXRWaWV3cyA9IGZ1bmN0aW9uIChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0c2V0dGluZ3NWaWV3czogTXVsdGlwbGVWaWV3c0NvbmZpZ3VyYXRpb24gfCB1bmRlZmluZWRcbik6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdIHtcblx0bGV0IHZpZXdDb252ZXJ0ZXJDb25maWdzOiBWaWV3Q29udmVydGVyU2V0dGluZ3NbXSA9IFtdO1xuXHRpZiAoc2V0dGluZ3NWaWV3cykge1xuXHRcdHNldHRpbmdzVmlld3MucGF0aHMuZm9yRWFjaCgocGF0aDogVmlld1BhdGhDb25maWd1cmF0aW9uIHwgQ3VzdG9tVmlld1RlbXBsYXRlQ29uZmlndXJhdGlvbikgPT4ge1xuXHRcdFx0aWYgKGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucyhwYXRoIGFzIFZpZXdQYXRoQ29uZmlndXJhdGlvbikpIHtcblx0XHRcdFx0aWYgKHNldHRpbmdzVmlld3MucGF0aHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIkFMUCBmbGF2b3IgY2Fubm90IGhhdmUgbXVsdGlwbGUgdmlld3NcIik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cGF0aCA9IHBhdGggYXMgQ29tYmluZWRWaWV3UGF0aENvbmZpZ3VyYXRpb247XG5cdFx0XHRcdFx0dmlld0NvbnZlcnRlckNvbmZpZ3MucHVzaCh7XG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0OiBjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0cHJpbWFyeTogcGF0aC5wcmltYXJ5LFxuXHRcdFx0XHRcdFx0c2Vjb25kYXJ5OiBwYXRoLnNlY29uZGFyeSxcblx0XHRcdFx0XHRcdGRlZmF1bHRQYXRoOiBwYXRoLmRlZmF1bHRQYXRoXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoKHBhdGggYXMgQ3VzdG9tVmlld0NvbmZpZ3VyYXRpb24pLnRlbXBsYXRlKSB7XG5cdFx0XHRcdHBhdGggPSBwYXRoIGFzIEN1c3RvbVZpZXdDb25maWd1cmF0aW9uO1xuXHRcdFx0XHR2aWV3Q29udmVydGVyQ29uZmlncy5wdXNoKHtcblx0XHRcdFx0XHRrZXk6IHBhdGgua2V5LFxuXHRcdFx0XHRcdGxhYmVsOiBwYXRoLmxhYmVsLFxuXHRcdFx0XHRcdHRlbXBsYXRlOiBwYXRoLnRlbXBsYXRlLFxuXHRcdFx0XHRcdHR5cGU6IFwiQ3VzdG9tXCIsXG5cdFx0XHRcdFx0dmlzaWJsZTogcGF0aC52aXNpYmxlXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cGF0aCA9IHBhdGggYXMgU2luZ2xlVmlld1BhdGhDb25maWd1cmF0aW9uO1xuXHRcdFx0XHRjb25zdCB2aWV3Q29udmVydGVyQ29udGV4dCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVyQ29udGV4dEZvcihcblx0XHRcdFx0XHRcdHBhdGguY29udGV4dFBhdGggfHwgKHBhdGguZW50aXR5U2V0ICYmIGAvJHtwYXRoLmVudGl0eVNldH1gKSB8fCBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnRleHRQYXRoKClcblx0XHRcdFx0XHQpLFxuXHRcdFx0XHRcdGVudGl0eVR5cGUgPSB2aWV3Q29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cblx0XHRcdFx0aWYgKGVudGl0eVR5cGUgJiYgdmlld0NvbnZlcnRlckNvbnRleHQpIHtcblx0XHRcdFx0XHRsZXQgYW5ub3RhdGlvbjtcblx0XHRcdFx0XHRjb25zdCByZXNvbHZlZFRhcmdldCA9IHZpZXdDb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKHBhdGguYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0XHRcdGNvbnN0IHRhcmdldEFubm90YXRpb24gPSByZXNvbHZlZFRhcmdldC5hbm5vdGF0aW9uIGFzIERhdGFWaXN1YWxpemF0aW9uQW5ub3RhdGlvbnM7XG5cdFx0XHRcdFx0aWYgKHRhcmdldEFubm90YXRpb24pIHtcblx0XHRcdFx0XHRcdGFubm90YXRpb24gPVxuXHRcdFx0XHRcdFx0XHR0YXJnZXRBbm5vdGF0aW9uLnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblZhcmlhbnRcblx0XHRcdFx0XHRcdFx0XHQ/IGdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uKGVudGl0eVR5cGUsIHZpZXdDb252ZXJ0ZXJDb250ZXh0LCBmYWxzZSlcblx0XHRcdFx0XHRcdFx0XHQ6IHRhcmdldEFubm90YXRpb247XG5cdFx0XHRcdFx0XHR2aWV3Q29udmVydGVyQ29uZmlncy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogdmlld0NvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb24sXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBwYXRoLmFubm90YXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0XHRrZWVwUHJldmlvdXNQZXJzb25hbGl6YXRpb246IHBhdGgua2VlcFByZXZpb3VzUGVyc29uYWxpemF0aW9uLFxuXHRcdFx0XHRcdFx0XHRrZXk6IHBhdGgua2V5LFxuXHRcdFx0XHRcdFx0XHR2aXNpYmxlOiBwYXRoLnZpc2libGVcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBUT0RPIERpYWdub3N0aWNzIG1lc3NhZ2Vcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0XHRpZiAoY29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZSkge1xuXHRcdFx0dmlld0NvbnZlcnRlckNvbmZpZ3MgPSBnZXRBbHBWaWV3Q29uZmlnKGNvbnZlcnRlckNvbnRleHQsIHZpZXdDb252ZXJ0ZXJDb25maWdzKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmlld0NvbnZlcnRlckNvbmZpZ3MucHVzaCh7XG5cdFx0XHRcdGFubm90YXRpb246IGdldENvbXBsaWFudFZpc3VhbGl6YXRpb25Bbm5vdGF0aW9uKGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQsIGZhbHNlKSxcblx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogY29udmVydGVyQ29udGV4dFxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB2aWV3Q29udmVydGVyQ29uZmlncy5tYXAoKHZpZXdDb252ZXJ0ZXJDb25maWcpID0+IHtcblx0XHRyZXR1cm4gZ2V0Vmlldyh2aWV3Q29udmVydGVyQ29uZmlnKTtcblx0fSk7XG59O1xuXG5jb25zdCBnZXRNdWx0aVZpZXdzQ29udHJvbCA9IGZ1bmN0aW9uIChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0dmlld3M6IExpc3RSZXBvcnRWaWV3RGVmaW5pdGlvbltdXG4pOiBNdWx0aVZpZXdzQ29udHJvbENvbmZpZ3VyYXRpb24gfCB1bmRlZmluZWQge1xuXHRjb25zdCBtYW5pZmVzdFdyYXBwZXIgPSBjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpO1xuXHRjb25zdCB2aWV3c0RlZmluaXRpb246IE11bHRpcGxlVmlld3NDb25maWd1cmF0aW9uIHwgdW5kZWZpbmVkID0gbWFuaWZlc3RXcmFwcGVyLmdldFZpZXdDb25maWd1cmF0aW9uKCk7XG5cdGlmICh2aWV3cy5sZW5ndGggPiAxICYmICFoYXNNdWx0aVZpc3VhbGl6YXRpb25zKGNvbnZlcnRlckNvbnRleHQpKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHNob3dUYWJDb3VudHM6IHZpZXdzRGVmaW5pdGlvbiA/IHZpZXdzRGVmaW5pdGlvbj8uc2hvd0NvdW50cyB8fCBtYW5pZmVzdFdyYXBwZXIuaGFzTXVsdGlwbGVFbnRpdHlTZXRzKCkgOiB1bmRlZmluZWQsIC8vIHdpdGggbXVsdGkgRW50aXR5U2V0cywgdGFiIGNvdW50cyBhcmUgZGlzcGxheWVkIGJ5IGRlZmF1bHRcblx0XHRcdGlkOiBnZXRJY29uVGFiQmFySUQoKVxuXHRcdH07XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbmZ1bmN0aW9uIGdldEFscFZpZXdDb25maWcoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCwgdmlld0NvbmZpZ3M6IFZpZXdDb252ZXJ0ZXJTZXR0aW5nc1tdKTogVmlld0NvbnZlcnRlclNldHRpbmdzW10ge1xuXHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdGNvbnN0IGFubm90YXRpb24gPSBnZXRDb21wbGlhbnRWaXN1YWxpemF0aW9uQW5ub3RhdGlvbihlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0LCB0cnVlKTtcblx0bGV0IGNoYXJ0LCB0YWJsZTtcblx0aWYgKGFubm90YXRpb24pIHtcblx0XHR2aWV3Q29uZmlncy5wdXNoKHtcblx0XHRcdGFubm90YXRpb246IGFubm90YXRpb24sXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0Y2hhcnQgPSBnZXREZWZhdWx0Q2hhcnQoZW50aXR5VHlwZSk7XG5cdFx0dGFibGUgPSBnZXREZWZhdWx0TGluZUl0ZW0oZW50aXR5VHlwZSk7XG5cdFx0aWYgKGNoYXJ0ICYmIHRhYmxlKSB7XG5cdFx0XHRjb25zdCBwcmltYXJ5OiBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb25bXSA9IFt7IGFubm90YXRpb25QYXRoOiBjaGFydC50ZXJtIH1dO1xuXHRcdFx0Y29uc3Qgc2Vjb25kYXJ5OiBTaW5nbGVWaWV3UGF0aENvbmZpZ3VyYXRpb25bXSA9IFt7IGFubm90YXRpb25QYXRoOiB0YWJsZS50ZXJtIH1dO1xuXHRcdFx0dmlld0NvbmZpZ3MucHVzaCh7XG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdHByaW1hcnk6IHByaW1hcnksXG5cdFx0XHRcdHNlY29uZGFyeTogc2Vjb25kYXJ5LFxuXHRcdFx0XHRkZWZhdWx0UGF0aDogXCJib3RoXCJcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gdmlld0NvbmZpZ3M7XG59XG5cbmZ1bmN0aW9uIGhhc011bHRpVmlzdWFsaXphdGlvbnMoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IGJvb2xlYW4ge1xuXHRyZXR1cm4gKFxuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuaGFzTXVsdGlwbGVWaXN1YWxpemF0aW9ucygpIHx8XG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRUZW1wbGF0ZVR5cGUoKSA9PT0gVGVtcGxhdGVUeXBlLkFuYWx5dGljYWxMaXN0UGFnZVxuXHQpO1xufVxuXG5leHBvcnQgY29uc3QgZ2V0SGVhZGVyQWN0aW9ucyA9IGZ1bmN0aW9uIChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQmFzZUFjdGlvbltdIHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0cmV0dXJuIGluc2VydEN1c3RvbUVsZW1lbnRzKFtdLCBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0KG1hbmlmZXN0V3JhcHBlci5nZXRIZWFkZXJBY3Rpb25zKCksIGNvbnZlcnRlckNvbnRleHQpLmFjdGlvbnMpO1xufTtcblxuZXhwb3J0IGNvbnN0IGNoZWNrQ2hhcnRGaWx0ZXJCYXJJZCA9IGZ1bmN0aW9uICh2aWV3czogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uW10sIGZpbHRlckJhcklkOiBzdHJpbmcpIHtcblx0dmlld3MuZm9yRWFjaCgodmlldykgPT4ge1xuXHRcdGlmICghKHZpZXcgYXMgQ3VzdG9tVmlld0RlZmluaXRpb24pLnR5cGUpIHtcblx0XHRcdGNvbnN0IHByZXNlbnRhdGlvbjogRGF0YVZpc3VhbGl6YXRpb25EZWZpbml0aW9uID0gKHZpZXcgYXMgU2luZ2xlVmlld0RlZmluaXRpb24pLnByZXNlbnRhdGlvbjtcblx0XHRcdHByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9ucy5mb3JFYWNoKCh2aXN1YWxpemF0aW9uRGVmaW5pdGlvbikgPT4ge1xuXHRcdFx0XHRpZiAodmlzdWFsaXphdGlvbkRlZmluaXRpb24udHlwZSA9PT0gVmlzdWFsaXphdGlvblR5cGUuQ2hhcnQgJiYgdmlzdWFsaXphdGlvbkRlZmluaXRpb24uZmlsdGVySWQgIT09IGZpbHRlckJhcklkKSB7XG5cdFx0XHRcdFx0dmlzdWFsaXphdGlvbkRlZmluaXRpb24uZmlsdGVySWQgPSBmaWx0ZXJCYXJJZDtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcbn07XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgTGlzdFJlcG9ydERlZmluaXRpb24gZm9yIG11bHRpcGxlIGVudGl0eSBzZXRzIChtdWx0aXBsZSB0YWJsZSBtb2RlKS5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBsaXN0IHJlcG9ydCBkZWZpbml0aW9uIGJhc2VkIG9uIGFubm90YXRpb24gKyBtYW5pZmVzdFxuICovXG5leHBvcnQgY29uc3QgY29udmVydFBhZ2UgPSBmdW5jdGlvbiAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IExpc3RSZXBvcnREZWZpbml0aW9uIHtcblx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHRjb25zdCBzQ29udGV4dFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnRleHRQYXRoKCk7XG5cblx0aWYgKCFzQ29udGV4dFBhdGgpIHtcblx0XHQvLyBJZiB3ZSBkb24ndCBoYXZlIGFuIGVudGl0eVNldCBhdCB0aGlzIHBvaW50IHdlIGhhdmUgYW4gaXNzdWUgSSdkIHNheVxuXHRcdHRocm93IG5ldyBFcnJvcihcblx0XHRcdFwiQW4gRW50aXR5U2V0IGlzIHJlcXVpcmVkIHRvIGJlIGFibGUgdG8gZGlzcGxheSBhIExpc3RSZXBvcnQsIHBsZWFzZSBhZGp1c3QgeW91ciBgZW50aXR5U2V0YCBwcm9wZXJ0eSB0byBwb2ludCB0byBvbmUuXCJcblx0XHQpO1xuXHR9XG5cdGNvbnN0IG1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCk7XG5cdGNvbnN0IHZpZXdzRGVmaW5pdGlvbjogTXVsdGlwbGVWaWV3c0NvbmZpZ3VyYXRpb24gfCB1bmRlZmluZWQgPSBtYW5pZmVzdFdyYXBwZXIuZ2V0Vmlld0NvbmZpZ3VyYXRpb24oKTtcblx0Y29uc3QgaGFzTXVsdGlwbGVFbnRpdHlTZXRzID0gbWFuaWZlc3RXcmFwcGVyLmhhc011bHRpcGxlRW50aXR5U2V0cygpO1xuXHRjb25zdCB2aWV3czogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uW10gPSBnZXRWaWV3cyhjb252ZXJ0ZXJDb250ZXh0LCB2aWV3c0RlZmluaXRpb24pO1xuXHRjb25zdCBsclRhYmxlVmlzdWFsaXphdGlvbnMgPSBnZXRUYWJsZVZpc3VhbGl6YXRpb25zKHZpZXdzKTtcblx0Y29uc3QgbHJDaGFydFZpc3VhbGl6YXRpb25zID0gZ2V0Q2hhcnRWaXN1YWxpemF0aW9ucyh2aWV3cyk7XG5cdGNvbnN0IHNob3dQaW5uYWJsZVRvZ2dsZSA9IGxyVGFibGVWaXN1YWxpemF0aW9ucy5zb21lKCh0YWJsZSkgPT4gdGFibGUuY29udHJvbC50eXBlID09PSBcIlJlc3BvbnNpdmVUYWJsZVwiKTtcblx0bGV0IHNpbmdsZVRhYmxlSWQgPSBcIlwiO1xuXHRsZXQgc2luZ2xlQ2hhcnRJZCA9IFwiXCI7XG5cdGNvbnN0IGR5bmFtaWNMaXN0UmVwb3J0SWQgPSBnZXREeW5hbWljTGlzdFJlcG9ydElEKCk7XG5cdGNvbnN0IGZpbHRlckJhcklkID0gZ2V0RmlsdGVyQmFySUQoc0NvbnRleHRQYXRoKTtcblx0Y29uc3QgZmlsdGVyVmFyaWFudE1hbmFnZW1lbnRJRCA9IGdldEZpbHRlclZhcmlhbnRNYW5hZ2VtZW50SUQoZmlsdGVyQmFySWQpO1xuXHRjb25zdCBmYkNvbmZpZyA9IG1hbmlmZXN0V3JhcHBlci5nZXRGaWx0ZXJDb25maWd1cmF0aW9uKCk7XG5cdGNvbnN0IGZpbHRlckluaXRpYWxMYXlvdXQgPSBmYkNvbmZpZz8uaW5pdGlhbExheW91dCAhPT0gdW5kZWZpbmVkID8gZmJDb25maWc/LmluaXRpYWxMYXlvdXQudG9Mb3dlckNhc2UoKSA6IFwiY29tcGFjdFwiO1xuXHRjb25zdCBmaWx0ZXJMYXlvdXQgPSBmYkNvbmZpZz8ubGF5b3V0ICE9PSB1bmRlZmluZWQgPyBmYkNvbmZpZz8ubGF5b3V0LnRvTG93ZXJDYXNlKCkgOiBcImNvbXBhY3RcIjtcblx0Y29uc3QgdXNlU2VtYW50aWNEYXRlUmFuZ2UgPSBmYkNvbmZpZy51c2VTZW1hbnRpY0RhdGVSYW5nZSAhPT0gdW5kZWZpbmVkID8gZmJDb25maWcudXNlU2VtYW50aWNEYXRlUmFuZ2UgOiB0cnVlO1xuXG5cdGNvbnN0IG9Db25maWcgPSBnZXRDb250ZW50QXJlYUlkKGNvbnZlcnRlckNvbnRleHQsIHZpZXdzKTtcblx0aWYgKG9Db25maWcpIHtcblx0XHRzaW5nbGVDaGFydElkID0gb0NvbmZpZy5jaGFydElkO1xuXHRcdHNpbmdsZVRhYmxlSWQgPSBvQ29uZmlnLnRhYmxlSWQ7XG5cdH1cblxuXHQvLyBDaGFydCBoYXMgYSBkZXBlbmRlbmN5IHRvIGZpbHRlciBiYXIgKGlzc3VlIHdpdGggbG9hZGluZyBkYXRhKS4gT25jZSByZXNvbHZlZCwgdGhlIGNoZWNrIGZvciBjaGFydCBzaG91bGQgYmUgcmVtb3ZlZCBoZXJlLlxuXHQvLyBVbnRpbCB0aGVuLCBoaWRpbmcgZmlsdGVyIGJhciBpcyBub3cgYWxsb3dlZCBpZiBhIGNoYXJ0IGlzIGJlaW5nIHVzZWQgb24gTFIuXG5cdGNvbnN0IGhpZGVGaWx0ZXJCYXIgPSBtYW5pZmVzdFdyYXBwZXIuaXNGaWx0ZXJCYXJIaWRkZW4oKSAmJiBzaW5nbGVDaGFydElkID09PSBcIlwiO1xuXHRjb25zdCBsckZpbHRlclByb3BlcnRpZXMgPSBnZXRTZWxlY3Rpb25GaWVsZHMoY29udmVydGVyQ29udGV4dCwgbHJUYWJsZVZpc3VhbGl6YXRpb25zKTtcblx0Y29uc3Qgc2VsZWN0aW9uRmllbGRzID0gbHJGaWx0ZXJQcm9wZXJ0aWVzLnNlbGVjdGlvbkZpZWxkcztcblx0Y29uc3QgcHJvcGVydHlJbmZvRmllbGRzID0gbHJGaWx0ZXJQcm9wZXJ0aWVzLnNQcm9wZXJ0eUluZm87XG5cdGNvbnN0IGhpZGVCYXNpY1NlYXJjaCA9IGdldEZpbHRlckJhcmhpZGVCYXNpY1NlYXJjaChsclRhYmxlVmlzdWFsaXphdGlvbnMsIGxyQ2hhcnRWaXN1YWxpemF0aW9ucywgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IG11bHRpVmlld0NvbnRyb2wgPSBnZXRNdWx0aVZpZXdzQ29udHJvbChjb252ZXJ0ZXJDb250ZXh0LCB2aWV3cyk7XG5cblx0Y29uc3Qgc2VsZWN0aW9uVmFyaWFudCA9IG11bHRpVmlld0NvbnRyb2wgPyB1bmRlZmluZWQgOiBnZXRTZWxlY3Rpb25WYXJpYW50KGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBkZWZhdWx0U2VtYW50aWNEYXRlcyA9IHVzZVNlbWFudGljRGF0ZVJhbmdlID8gZ2V0RGVmYXVsdFNlbWFudGljRGF0ZXMoZ2V0TWFuaWZlc3RGaWx0ZXJGaWVsZHMoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCkpIDoge307XG5cblx0Ly8gU29ydCBoZWFkZXIgYWN0aW9ucyBhY2NvcmRpbmcgdG8gcG9zaXRpb24gYXR0cmlidXRlcyBpbiBtYW5pZmVzdFxuXHRjb25zdCBoZWFkZXJBY3Rpb25zID0gZ2V0SGVhZGVyQWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0aWYgKGhhc011bHRpcGxlRW50aXR5U2V0cykge1xuXHRcdGNoZWNrQ2hhcnRGaWx0ZXJCYXJJZCh2aWV3cywgZmlsdGVyQmFySWQpO1xuXHR9XG5cblx0Y29uc3QgdmlzdWFsaXphdGlvbklkcyA9IGxyVGFibGVWaXN1YWxpemF0aW9uc1xuXHRcdC5tYXAoKHZpc3VhbGl6YXRpb24pID0+IHtcblx0XHRcdHJldHVybiB2aXN1YWxpemF0aW9uLmFubm90YXRpb24uaWQ7XG5cdFx0fSlcblx0XHQuY29uY2F0KFxuXHRcdFx0bHJDaGFydFZpc3VhbGl6YXRpb25zLm1hcCgodmlzdWFsaXphdGlvbikgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdmlzdWFsaXphdGlvbi5pZDtcblx0XHRcdH0pXG5cdFx0KTtcblx0Y29uc3QgdGFyZ2V0Q29udHJvbElkcyA9IFtcblx0XHQuLi4oaGlkZUZpbHRlckJhciA/IFtdIDogW2ZpbHRlckJhcklkXSksXG5cdFx0Li4uKG1hbmlmZXN0V3JhcHBlci5nZXRWYXJpYW50TWFuYWdlbWVudCgpICE9PSBWYXJpYW50TWFuYWdlbWVudFR5cGUuQ29udHJvbCA/IHZpc3VhbGl6YXRpb25JZHMgOiBbXSksXG5cdFx0Li4uKG11bHRpVmlld0NvbnRyb2wgPyBbbXVsdGlWaWV3Q29udHJvbC5pZF0gOiBbXSlcblx0XTtcblxuXHRjb25zdCBzdGlja3lTdWJoZWFkZXJQcm92aWRlciA9XG5cdFx0bXVsdGlWaWV3Q29udHJvbCAmJiBtYW5pZmVzdFdyYXBwZXIuZ2V0U3RpY2t5TXVsdGlUYWJIZWFkZXJDb25maWd1cmF0aW9uKCkgPyBtdWx0aVZpZXdDb250cm9sLmlkIDogdW5kZWZpbmVkO1xuXG5cdHJldHVybiB7XG5cdFx0bWFpbkVudGl0eVNldDogc0NvbnRleHRQYXRoLFxuXHRcdG1haW5FbnRpdHlUeXBlOiBgJHtzQ29udGV4dFBhdGh9L2AsXG5cdFx0bXVsdGlWaWV3c0NvbnRyb2w6IG11bHRpVmlld0NvbnRyb2wsXG5cdFx0c3RpY2t5U3ViaGVhZGVyUHJvdmlkZXIsXG5cdFx0c2luZ2xlVGFibGVJZCxcblx0XHRzaW5nbGVDaGFydElkLFxuXHRcdGR5bmFtaWNMaXN0UmVwb3J0SWQsXG5cdFx0aGVhZGVyQWN0aW9ucyxcblx0XHRzaG93UGlubmFibGVUb2dnbGU6IHNob3dQaW5uYWJsZVRvZ2dsZSxcblx0XHRmaWx0ZXJCYXI6IHtcblx0XHRcdHByb3BlcnR5SW5mbzogcHJvcGVydHlJbmZvRmllbGRzLFxuXHRcdFx0c2VsZWN0aW9uRmllbGRzLFxuXHRcdFx0aGlkZUJhc2ljU2VhcmNoXG5cdFx0fSxcblx0XHR2aWV3czogdmlld3MsXG5cdFx0ZmlsdGVyQmFySWQ6IGhpZGVGaWx0ZXJCYXIgPyBcIlwiIDogZmlsdGVyQmFySWQsXG5cdFx0ZmlsdGVyQ29uZGl0aW9uczoge1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudDogc2VsZWN0aW9uVmFyaWFudCxcblx0XHRcdGRlZmF1bHRTZW1hbnRpY0RhdGVzOiBkZWZhdWx0U2VtYW50aWNEYXRlc1xuXHRcdH0sXG5cdFx0dmFyaWFudE1hbmFnZW1lbnQ6IHtcblx0XHRcdGlkOiBmaWx0ZXJWYXJpYW50TWFuYWdlbWVudElELFxuXHRcdFx0dGFyZ2V0Q29udHJvbElkczogdGFyZ2V0Q29udHJvbElkcy5qb2luKFwiLFwiKVxuXHRcdH0sXG5cdFx0aGFzTXVsdGlWaXN1YWxpemF0aW9uczogaGFzTXVsdGlWaXN1YWxpemF0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHR0ZW1wbGF0ZVR5cGU6IG1hbmlmZXN0V3JhcHBlci5nZXRUZW1wbGF0ZVR5cGUoKSxcblx0XHR1c2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRmaWx0ZXJJbml0aWFsTGF5b3V0LFxuXHRcdGZpbHRlckxheW91dCxcblx0XHRrcGlEZWZpbml0aW9uczogZ2V0S1BJRGVmaW5pdGlvbnMoY29udmVydGVyQ29udGV4dCksXG5cdFx0aGlkZUZpbHRlckJhclxuXHR9O1xufTtcblxuZnVuY3Rpb24gZ2V0Q29udGVudEFyZWFJZChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCB2aWV3czogTGlzdFJlcG9ydFZpZXdEZWZpbml0aW9uW10pOiBDb250ZW50QXJlYUlEIHwgdW5kZWZpbmVkIHtcblx0bGV0IHNpbmdsZVRhYmxlSWQgPSBcIlwiLFxuXHRcdHNpbmdsZUNoYXJ0SWQgPSBcIlwiO1xuXHRpZiAoXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5oYXNNdWx0aXBsZVZpc3VhbGl6YXRpb25zKCkgfHxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldFRlbXBsYXRlVHlwZSgpID09PSBUZW1wbGF0ZVR5cGUuQW5hbHl0aWNhbExpc3RQYWdlXG5cdCkge1xuXHRcdGZvciAobGV0IHZpZXcgb2Ygdmlld3MpIHtcblx0XHRcdHZpZXcgPSB2aWV3IGFzIENvbWJpbmVkVmlld0RlZmluaXRpb247XG5cdFx0XHRpZiAodmlldy5jaGFydENvbnRyb2xJZCAmJiB2aWV3LnRhYmxlQ29udHJvbElkKSB7XG5cdFx0XHRcdHNpbmdsZUNoYXJ0SWQgPSB2aWV3LmNoYXJ0Q29udHJvbElkO1xuXHRcdFx0XHRzaW5nbGVUYWJsZUlkID0gdmlldy50YWJsZUNvbnRyb2xJZDtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGZvciAobGV0IHZpZXcgb2Ygdmlld3MpIHtcblx0XHRcdHZpZXcgPSB2aWV3IGFzIFNpbmdsZVZpZXdEZWZpbml0aW9uO1xuXHRcdFx0aWYgKCFzaW5nbGVUYWJsZUlkICYmICh2aWV3IGFzIFNpbmdsZVRhYmxlVmlld0RlZmluaXRpb24pLnRhYmxlQ29udHJvbElkKSB7XG5cdFx0XHRcdHNpbmdsZVRhYmxlSWQgPSAodmlldyBhcyBTaW5nbGVUYWJsZVZpZXdEZWZpbml0aW9uKS50YWJsZUNvbnRyb2xJZCB8fCBcIlwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKCFzaW5nbGVDaGFydElkICYmICh2aWV3IGFzIFNpbmdsZUNoYXJ0Vmlld0RlZmluaXRpb24pLmNoYXJ0Q29udHJvbElkKSB7XG5cdFx0XHRcdHNpbmdsZUNoYXJ0SWQgPSAodmlldyBhcyBTaW5nbGVDaGFydFZpZXdEZWZpbml0aW9uKS5jaGFydENvbnRyb2xJZCB8fCBcIlwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHNpbmdsZUNoYXJ0SWQgJiYgc2luZ2xlVGFibGVJZCkge1xuXHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0aWYgKHNpbmdsZVRhYmxlSWQgfHwgc2luZ2xlQ2hhcnRJZCkge1xuXHRcdHJldHVybiB7XG5cdFx0XHRjaGFydElkOiBzaW5nbGVDaGFydElkLFxuXHRcdFx0dGFibGVJZDogc2luZ2xlVGFibGVJZFxuXHRcdH07XG5c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