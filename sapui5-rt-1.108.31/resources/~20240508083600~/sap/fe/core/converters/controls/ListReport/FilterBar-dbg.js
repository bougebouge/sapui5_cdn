/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Table", "sap/fe/core/converters/controls/ListReport/VisualFilters", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "../../ManifestSettings", "../Common/DataVisualization"], function (Table, VisualFilters, ConfigurableObject, IssueManager, Key, BindingToolkit, ModelHelper, ManifestSettings, DataVisualization) {
  "use strict";

  var _exports = {};
  var getSelectionVariant = DataVisualization.getSelectionVariant;
  var AvailabilityType = ManifestSettings.AvailabilityType;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategory = IssueManager.IssueCategory;
  var Placement = ConfigurableObject.Placement;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getVisualFilters = VisualFilters.getVisualFilters;
  var isFilteringCaseSensitive = Table.isFilteringCaseSensitive;
  var getTypeConfig = Table.getTypeConfig;
  var getSelectionVariantConfiguration = Table.getSelectionVariantConfiguration;
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var filterFieldType;
  (function (filterFieldType) {
    filterFieldType["Default"] = "Default";
    filterFieldType["Slot"] = "Slot";
  })(filterFieldType || (filterFieldType = {}));
  var sEdmString = "Edm.String";
  var sStringDataType = "sap.ui.model.odata.type.String";
  /**
   * Enter all DataFields of a given FieldGroup into the filterFacetMap.
   *
   * @param fieldGroup
   * @returns The map of facets for the given FieldGroup
   */
  function getFieldGroupFilterGroups(fieldGroup) {
    var filterFacetMap = {};
    fieldGroup.Data.forEach(function (dataField) {
      if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataField") {
        var _fieldGroup$annotatio, _fieldGroup$annotatio2;
        filterFacetMap[dataField.Value.path] = {
          group: fieldGroup.fullyQualifiedName,
          groupLabel: compileExpression(getExpressionFromAnnotation(fieldGroup.Label || ((_fieldGroup$annotatio = fieldGroup.annotations) === null || _fieldGroup$annotatio === void 0 ? void 0 : (_fieldGroup$annotatio2 = _fieldGroup$annotatio.Common) === null || _fieldGroup$annotatio2 === void 0 ? void 0 : _fieldGroup$annotatio2.Label) || fieldGroup.qualifier)) || fieldGroup.qualifier
        };
      }
    });
    return filterFacetMap;
  }
  function getExcludedFilterProperties(selectionVariants) {
    return selectionVariants.reduce(function (previousValue, selectionVariant) {
      selectionVariant.propertyNames.forEach(function (propertyName) {
        previousValue[propertyName] = true;
      });
      return previousValue;
    }, {});
  }

  /**
   * Check that all the tables for a dedicated entity set are configured as analytical tables.
   *
   * @param listReportTables List report tables
   * @param contextPath
   * @returns Is FilterBar search field hidden or not
   */
  function checkAllTableForEntitySetAreAnalytical(listReportTables, contextPath) {
    if (contextPath && listReportTables.length > 0) {
      return listReportTables.every(function (visualization) {
        return visualization.enableAnalytics && contextPath === visualization.annotation.collection;
      });
    }
    return false;
  }
  function getSelectionVariants(lrTableVisualizations, converterContext) {
    var selectionVariantPaths = [];
    return lrTableVisualizations.map(function (visualization) {
      var tableFilters = visualization.control.filters;
      var tableSVConfigs = [];
      for (var _key in tableFilters) {
        if (Array.isArray(tableFilters[_key].paths)) {
          var paths = tableFilters[_key].paths;
          paths.forEach(function (path) {
            if (path && path.annotationPath && selectionVariantPaths.indexOf(path.annotationPath) === -1) {
              selectionVariantPaths.push(path.annotationPath);
              var selectionVariantConfig = getSelectionVariantConfiguration(path.annotationPath, converterContext);
              if (selectionVariantConfig) {
                tableSVConfigs.push(selectionVariantConfig);
              }
            }
          });
        }
      }
      return tableSVConfigs;
    }).reduce(function (svConfigs, selectionVariant) {
      return svConfigs.concat(selectionVariant);
    }, []);
  }

  /**
   * Returns the condition path required for the condition model. It looks as follows:
   * <1:N-PropertyName>*\/<1:1-PropertyName>/<PropertyName>.
   *
   * @param entityType The root EntityType
   * @param propertyPath The full path to the target property
   * @returns The formatted condition path
   */
  var _getConditionPath = function (entityType, propertyPath) {
    var parts = propertyPath.split("/");
    var partialPath;
    var key = "";
    while (parts.length) {
      var part = parts.shift();
      partialPath = partialPath ? "".concat(partialPath, "/").concat(part) : part;
      var property = entityType.resolvePath(partialPath);
      if (property._type === "NavigationProperty" && property.isCollection) {
        part += "*";
      }
      key = key ? "".concat(key, "/").concat(part) : part;
    }
    return key;
  };
  var _createFilterSelectionField = function (entityType, property, fullPropertyPath, includeHidden, converterContext) {
    var _property$annotations, _property$annotations2, _property$annotations3;
    // ignore complex property types and hidden annotated ones
    if (property !== undefined && property.targetType === undefined && (includeHidden || ((_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.UI) === null || _property$annotations2 === void 0 ? void 0 : (_property$annotations3 = _property$annotations2.Hidden) === null || _property$annotations3 === void 0 ? void 0 : _property$annotations3.valueOf()) !== true)) {
      var _property$annotations4, _property$annotations5, _property$annotations6, _property$annotations7, _property$annotations8, _targetEntityType$ann, _targetEntityType$ann2, _targetEntityType$ann3;
      var targetEntityType = converterContext.getAnnotationEntityType(property);
      return {
        key: KeyHelper.getSelectionFieldKeyFromPath(fullPropertyPath),
        annotationPath: converterContext.getAbsoluteAnnotationPath(fullPropertyPath),
        conditionPath: _getConditionPath(entityType, fullPropertyPath),
        availability: ((_property$annotations4 = property.annotations) === null || _property$annotations4 === void 0 ? void 0 : (_property$annotations5 = _property$annotations4.UI) === null || _property$annotations5 === void 0 ? void 0 : (_property$annotations6 = _property$annotations5.HiddenFilter) === null || _property$annotations6 === void 0 ? void 0 : _property$annotations6.valueOf()) === true ? AvailabilityType.Hidden : AvailabilityType.Adaptation,
        label: compileExpression(getExpressionFromAnnotation(((_property$annotations7 = property.annotations.Common) === null || _property$annotations7 === void 0 ? void 0 : (_property$annotations8 = _property$annotations7.Label) === null || _property$annotations8 === void 0 ? void 0 : _property$annotations8.valueOf()) || property.name)),
        group: targetEntityType.name,
        groupLabel: compileExpression(getExpressionFromAnnotation((targetEntityType === null || targetEntityType === void 0 ? void 0 : (_targetEntityType$ann = targetEntityType.annotations) === null || _targetEntityType$ann === void 0 ? void 0 : (_targetEntityType$ann2 = _targetEntityType$ann.Common) === null || _targetEntityType$ann2 === void 0 ? void 0 : (_targetEntityType$ann3 = _targetEntityType$ann2.Label) === null || _targetEntityType$ann3 === void 0 ? void 0 : _targetEntityType$ann3.valueOf()) || targetEntityType.name))
      };
    }
    return undefined;
  };
  function getModelType(sType) {
    var mDefaultTypeForEdmType = {
      "Edm.Boolean": {
        modelType: "Bool"
      },
      "Edm.Byte": {
        modelType: "Int"
      },
      "Edm.Date": {
        modelType: "Date"
      },
      "Edm.DateTime": {
        modelType: "Date"
      },
      "Edm.DateTimeOffset": {
        modelType: "DateTimeOffset"
      },
      "Edm.Decimal": {
        modelType: "Decimal"
      },
      "Edm.Double": {
        modelType: "Float"
      },
      "Edm.Float": {
        modelType: "Float"
      },
      "Edm.Guid": {
        modelType: "Guid"
      },
      "Edm.Int16": {
        modelType: "Int"
      },
      "Edm.Int32": {
        modelType: "Int"
      },
      "Edm.Int64": {
        modelType: "Int"
      },
      "Edm.SByte": {
        modelType: "Int"
      },
      "Edm.Single": {
        modelType: "Float"
      },
      "Edm.String": {
        modelType: "String"
      },
      "Edm.Time": {
        modelType: "TimeOfDay"
      },
      "Edm.TimeOfDay": {
        modelType: "TimeOfDay"
      },
      "Edm.Stream": {
        //no corresponding modelType - ignore for filtering
      }
    };
    return sType && sType in mDefaultTypeForEdmType && mDefaultTypeForEdmType[sType].modelType;
  }
  _exports.getModelType = getModelType;
  var _getSelectionFields = function (entityType, navigationPath, properties, includeHidden, converterContext) {
    var selectionFieldMap = {};
    if (properties) {
      properties.forEach(function (property) {
        var propertyPath = property.name;
        var fullPath = (navigationPath ? "".concat(navigationPath, "/") : "") + propertyPath;
        var selectionField = _createFilterSelectionField(entityType, property, fullPath, includeHidden, converterContext);
        if (selectionField) {
          selectionFieldMap[fullPath] = selectionField;
        }
      });
    }
    return selectionFieldMap;
  };
  var _getSelectionFieldsByPath = function (entityType, propertyPaths, includeHidden, converterContext) {
    var selectionFields = {};
    if (propertyPaths) {
      propertyPaths.forEach(function (propertyPath) {
        var localSelectionFields;
        var property = entityType.resolvePath(propertyPath);
        if (property === undefined) {
          return;
        }
        if (property._type === "NavigationProperty") {
          // handle navigation properties
          localSelectionFields = _getSelectionFields(entityType, propertyPath, property.targetType.entityProperties, includeHidden, converterContext);
        } else if (property.targetType !== undefined && property.targetType._type === "ComplexType") {
          // handle ComplexType properties
          localSelectionFields = _getSelectionFields(entityType, propertyPath, property.targetType.properties, includeHidden, converterContext);
        } else {
          var navigationPath = propertyPath.includes("/") ? propertyPath.split("/").splice(0, 1).join("/") : "";
          localSelectionFields = _getSelectionFields(entityType, navigationPath, [property], includeHidden, converterContext);
        }
        selectionFields = _objectSpread(_objectSpread({}, selectionFields), localSelectionFields);
      });
    }
    return selectionFields;
  };
  var _getFilterField = function (filterFields, propertyPath, converterContext, entityType) {
    var filterField = filterFields[propertyPath];
    if (filterField) {
      delete filterFields[propertyPath];
    } else {
      filterField = _createFilterSelectionField(entityType, entityType.resolvePath(propertyPath), propertyPath, true, converterContext);
    }
    // defined SelectionFields are available by default
    if (filterField) {
      var _entityType$annotatio, _entityType$annotatio2;
      filterField.availability = filterField.availability === AvailabilityType.Hidden ? AvailabilityType.Hidden : AvailabilityType.Default;
      filterField.isParameter = !!((_entityType$annotatio = entityType.annotations) !== null && _entityType$annotatio !== void 0 && (_entityType$annotatio2 = _entityType$annotatio.Common) !== null && _entityType$annotatio2 !== void 0 && _entityType$annotatio2.ResultContext);
    } else {
      var _converterContext$get;
      (_converterContext$get = converterContext.getDiagnostics()) === null || _converterContext$get === void 0 ? void 0 : _converterContext$get.addIssue(IssueCategory.Annotation, IssueSeverity.High, IssueType.MISSING_SELECTIONFIELD);
    }
    return filterField;
  };
  var _getDefaultFilterFields = function (aSelectOptions, entityType, converterContext, excludedFilterProperties, annotatedSelectionFields) {
    var selectionFields = [];
    var UISelectionFields = {};
    var properties = entityType.entityProperties;
    // Using entityType instead of entitySet
    annotatedSelectionFields === null || annotatedSelectionFields === void 0 ? void 0 : annotatedSelectionFields.forEach(function (SelectionField) {
      UISelectionFields[SelectionField.value] = true;
    });
    if (aSelectOptions && aSelectOptions.length > 0) {
      aSelectOptions === null || aSelectOptions === void 0 ? void 0 : aSelectOptions.forEach(function (selectOption) {
        var propertyName = selectOption.PropertyName;
        var sPropertyPath = propertyName.value;
        var currentSelectionFields = {};
        annotatedSelectionFields === null || annotatedSelectionFields === void 0 ? void 0 : annotatedSelectionFields.forEach(function (SelectionField) {
          currentSelectionFields[SelectionField.value] = true;
        });
        if (!(sPropertyPath in excludedFilterProperties)) {
          if (!(sPropertyPath in currentSelectionFields)) {
            var _FilterField = getFilterField(sPropertyPath, converterContext, entityType);
            if (_FilterField) {
              selectionFields.push(_FilterField);
            }
          }
        }
      });
    } else if (properties) {
      properties.forEach(function (property) {
        var _property$annotations9, _property$annotations10;
        var defaultFilterValue = (_property$annotations9 = property.annotations) === null || _property$annotations9 === void 0 ? void 0 : (_property$annotations10 = _property$annotations9.Common) === null || _property$annotations10 === void 0 ? void 0 : _property$annotations10.FilterDefaultValue;
        var propertyPath = property.name;
        if (!(propertyPath in excludedFilterProperties)) {
          if (defaultFilterValue && !(propertyPath in UISelectionFields)) {
            var _FilterField2 = getFilterField(propertyPath, converterContext, entityType);
            if (_FilterField2) {
              selectionFields.push(_FilterField2);
            }
          }
        }
      });
    }
    return selectionFields;
  };

  /**
   * Get all parameter filter fields in case of a parameterized service.
   *
   * @param converterContext
   * @returns An array of parameter FilterFields
   */
  function _getParameterFields(converterContext) {
    var _parameterEntityType$, _parameterEntityType$2;
    var dataModelObjectPath = converterContext.getDataModelObjectPath();
    var parameterEntityType = dataModelObjectPath.startingEntitySet.entityType;
    var isParameterized = !!((_parameterEntityType$ = parameterEntityType.annotations) !== null && _parameterEntityType$ !== void 0 && (_parameterEntityType$2 = _parameterEntityType$.Common) !== null && _parameterEntityType$2 !== void 0 && _parameterEntityType$2.ResultContext) && !dataModelObjectPath.targetEntitySet;
    var parameterConverterContext = isParameterized && converterContext.getConverterContextFor("/".concat(dataModelObjectPath.startingEntitySet.name));
    return parameterConverterContext ? parameterEntityType.entityProperties.map(function (property) {
      return _getFilterField({}, property.name, parameterConverterContext, parameterEntityType);
    }) : [];
  }

  /**
   * Determines if the FilterBar search field is hidden or not.
   *
   * @param listReportTables The list report tables
   * @param charts The ALP charts
   * @param converterContext The converter context
   * @returns The information if the FilterBar search field is hidden or not
   */
  var getFilterBarhideBasicSearch = function (listReportTables, charts, converterContext) {
    // Check if charts allow search
    var noSearchInCharts = charts.length === 0 || charts.every(function (chart) {
      return !chart.applySupported.enableSearch;
    });

    // Check if all tables are analytical and none of them allow for search
    var noSearchInTables = listReportTables.length === 0 || listReportTables.every(function (table) {
      return table.enableAnalytics && !table.enableAnalyticsSearch;
    });
    var contextPath = converterContext.getContextPath();
    if (contextPath && noSearchInCharts && noSearchInTables) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Retrieves filter fields from the manifest.
   *
   * @param entityType The current entityType
   * @param converterContext The converter context
   * @returns The filter fields defined in the manifest
   */
  _exports.getFilterBarhideBasicSearch = getFilterBarhideBasicSearch;
  var getManifestFilterFields = function (entityType, converterContext) {
    var fbConfig = converterContext.getManifestWrapper().getFilterConfiguration();
    var definedFilterFields = (fbConfig === null || fbConfig === void 0 ? void 0 : fbConfig.filterFields) || {};
    var selectionFields = _getSelectionFieldsByPath(entityType, Object.keys(definedFilterFields).map(function (key) {
      return KeyHelper.getPathFromSelectionFieldKey(key);
    }), true, converterContext);
    var filterFields = {};
    for (var sKey in definedFilterFields) {
      var filterField = definedFilterFields[sKey];
      var propertyName = KeyHelper.getPathFromSelectionFieldKey(sKey);
      var selectionField = selectionFields[propertyName];
      var type = filterField.type === "Slot" ? filterFieldType.Slot : filterFieldType.Default;
      var visualFilter = filterField && filterField !== null && filterField !== void 0 && filterField.visualFilter ? getVisualFilters(entityType, converterContext, sKey, definedFilterFields) : undefined;
      filterFields[sKey] = {
        key: sKey,
        type: type,
        annotationPath: selectionField === null || selectionField === void 0 ? void 0 : selectionField.annotationPath,
        conditionPath: (selectionField === null || selectionField === void 0 ? void 0 : selectionField.conditionPath) || propertyName,
        template: filterField.template,
        label: filterField.label,
        position: filterField.position || {
          placement: Placement.After
        },
        availability: filterField.availability || AvailabilityType.Default,
        settings: filterField.settings,
        visualFilter: visualFilter,
        required: filterField.required
      };
    }
    return filterFields;
  };
  _exports.getManifestFilterFields = getManifestFilterFields;
  var getFilterField = function (propertyPath, converterContext, entityType) {
    return _getFilterField({}, propertyPath, converterContext, entityType);
  };
  _exports.getFilterField = getFilterField;
  var getFilterRestrictions = function (oFilterRestrictionsAnnotation, sRestriction) {
    if (sRestriction === "RequiredProperties" || sRestriction === "NonFilterableProperties") {
      var aProps = [];
      if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation[sRestriction]) {
        aProps = oFilterRestrictionsAnnotation[sRestriction].map(function (oProperty) {
          return oProperty.$PropertyPath || oProperty.value;
        });
      }
      return aProps;
    } else if (sRestriction === "FilterAllowedExpressions") {
      var mAllowedExpressions = {};
      if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation.FilterExpressionRestrictions) {
        oFilterRestrictionsAnnotation.FilterExpressionRestrictions.forEach(function (oProperty) {
          //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
          if (mAllowedExpressions[oProperty.Property.value]) {
            mAllowedExpressions[oProperty.Property.value].push(oProperty.AllowedExpressions);
          } else {
            mAllowedExpressions[oProperty.Property.value] = [oProperty.AllowedExpressions];
          }
        });
      }
      return mAllowedExpressions;
    }
    return oFilterRestrictionsAnnotation;
  };
  _exports.getFilterRestrictions = getFilterRestrictions;
  var getSearchFilterPropertyInfo = function () {
    return {
      name: "$search",
      path: "$search",
      dataType: sStringDataType,
      maxConditions: 1
    };
  };
  var getEditStateFilterPropertyInfo = function () {
    return {
      name: "$editState",
      path: "$editState",
      groupLabel: "",
      group: "",
      dataType: sStringDataType,
      hiddenFilter: false
    };
  };
  var getSearchRestrictions = function (converterContext) {
    var searchRestrictions;
    if (!ModelHelper.isSingleton(converterContext.getEntitySet())) {
      var _converterContext$get2, _converterContext$get3;
      var capabilites = (_converterContext$get2 = converterContext.getEntitySet()) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.annotations) === null || _converterContext$get3 === void 0 ? void 0 : _converterContext$get3.Capabilities;
      searchRestrictions = capabilites === null || capabilites === void 0 ? void 0 : capabilites.SearchRestrictions;
    }
    return searchRestrictions;
  };
  var getNavigationRestrictions = function (converterContext, sNavigationPath) {
    var _converterContext$get4, _converterContext$get5, _converterContext$get6;
    var oNavigationRestrictions = (_converterContext$get4 = converterContext.getEntitySet()) === null || _converterContext$get4 === void 0 ? void 0 : (_converterContext$get5 = _converterContext$get4.annotations) === null || _converterContext$get5 === void 0 ? void 0 : (_converterContext$get6 = _converterContext$get5.Capabilities) === null || _converterContext$get6 === void 0 ? void 0 : _converterContext$get6.NavigationRestrictions;
    var aRestrictedProperties = oNavigationRestrictions && oNavigationRestrictions.RestrictedProperties;
    return aRestrictedProperties && aRestrictedProperties.find(function (oRestrictedProperty) {
      return oRestrictedProperty && oRestrictedProperty.NavigationProperty && (oRestrictedProperty.NavigationProperty.$NavigationPropertyPath === sNavigationPath || oRestrictedProperty.NavigationProperty.value === sNavigationPath);
    });
  };
  _exports.getNavigationRestrictions = getNavigationRestrictions;
  var _fetchBasicPropertyInfo = function (oFilterFieldInfo) {
    return {
      key: oFilterFieldInfo.key,
      annotationPath: oFilterFieldInfo.annotationPath,
      conditionPath: oFilterFieldInfo.conditionPath,
      name: oFilterFieldInfo.conditionPath,
      label: oFilterFieldInfo.label,
      hiddenFilter: oFilterFieldInfo.availability === "Hidden",
      display: "Value",
      isParameter: oFilterFieldInfo.isParameter,
      caseSensitive: oFilterFieldInfo.caseSensitive,
      availability: oFilterFieldInfo.availability,
      position: oFilterFieldInfo.position,
      type: oFilterFieldInfo.type,
      template: oFilterFieldInfo.template,
      menu: oFilterFieldInfo.menu,
      required: oFilterFieldInfo.required
    };
  };
  var getSpecificAllowedExpression = function (aExpressions) {
    var aAllowedExpressionsPriority = ["SingleValue", "MultiValue", "SingleRange", "MultiRange", "SearchExpression", "MultiRangeOrSearchExpression"];
    aExpressions.sort(function (a, b) {
      return aAllowedExpressionsPriority.indexOf(a) - aAllowedExpressionsPriority.indexOf(b);
    });
    return aExpressions[0];
  };
  _exports.getSpecificAllowedExpression = getSpecificAllowedExpression;
  var displayMode = function (oPropertyAnnotations, oCollectionAnnotations) {
    var _oPropertyAnnotations, _oPropertyAnnotations2, _oPropertyAnnotations3, _oPropertyAnnotations4, _oPropertyAnnotations5, _oCollectionAnnotatio;
    var oTextAnnotation = oPropertyAnnotations === null || oPropertyAnnotations === void 0 ? void 0 : (_oPropertyAnnotations = oPropertyAnnotations.Common) === null || _oPropertyAnnotations === void 0 ? void 0 : _oPropertyAnnotations.Text,
      oTextArrangmentAnnotation = oTextAnnotation && (oPropertyAnnotations && (oPropertyAnnotations === null || oPropertyAnnotations === void 0 ? void 0 : (_oPropertyAnnotations2 = oPropertyAnnotations.Common) === null || _oPropertyAnnotations2 === void 0 ? void 0 : (_oPropertyAnnotations3 = _oPropertyAnnotations2.Text) === null || _oPropertyAnnotations3 === void 0 ? void 0 : (_oPropertyAnnotations4 = _oPropertyAnnotations3.annotations) === null || _oPropertyAnnotations4 === void 0 ? void 0 : (_oPropertyAnnotations5 = _oPropertyAnnotations4.UI) === null || _oPropertyAnnotations5 === void 0 ? void 0 : _oPropertyAnnotations5.TextArrangement) || oCollectionAnnotations && (oCollectionAnnotations === null || oCollectionAnnotations === void 0 ? void 0 : (_oCollectionAnnotatio = oCollectionAnnotations.UI) === null || _oCollectionAnnotatio === void 0 ? void 0 : _oCollectionAnnotatio.TextArrangement));
    if (oTextArrangmentAnnotation) {
      if (oTextArrangmentAnnotation.valueOf() === "UI.TextArrangementType/TextOnly") {
        return "Description";
      } else if (oTextArrangmentAnnotation.valueOf() === "UI.TextArrangementType/TextLast") {
        return "ValueDescription";
      }
      return "DescriptionValue"; //TextFirst
    }

    return oTextAnnotation ? "DescriptionValue" : "Value";
  };
  _exports.displayMode = displayMode;
  var fetchPropertyInfo = function (converterContext, oFilterFieldInfo, oTypeConfig) {
    var _converterContext$get7;
    var oPropertyInfo = _fetchBasicPropertyInfo(oFilterFieldInfo);
    var sAnnotationPath = oFilterFieldInfo.annotationPath;
    if (!sAnnotationPath) {
      return oPropertyInfo;
    }
    var targetPropertyObject = converterContext.getConverterContextFor(sAnnotationPath).getDataModelObjectPath().targetObject;
    var oPropertyAnnotations = targetPropertyObject === null || targetPropertyObject === void 0 ? void 0 : targetPropertyObject.annotations;
    var oCollectionAnnotations = converterContext === null || converterContext === void 0 ? void 0 : (_converterContext$get7 = converterContext.getDataModelObjectPath().targetObject) === null || _converterContext$get7 === void 0 ? void 0 : _converterContext$get7.annotations;
    var oFormatOptions = oTypeConfig.formatOptions;
    var oConstraints = oTypeConfig.constraints;
    oPropertyInfo = Object.assign(oPropertyInfo, {
      formatOptions: oFormatOptions,
      constraints: oConstraints,
      display: displayMode(oPropertyAnnotations, oCollectionAnnotations)
    });
    return oPropertyInfo;
  };
  _exports.fetchPropertyInfo = fetchPropertyInfo;
  var isMultiValue = function (oProperty) {
    var bIsMultiValue = true;
    //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
    switch (oProperty.filterExpression) {
      case "SearchExpression":
      case "SingleRange":
      case "SingleValue":
        bIsMultiValue = false;
        break;
      default:
        break;
    }
    if (oProperty.type && oProperty.type.indexOf("Boolean") > 0) {
      bIsMultiValue = false;
    }
    return bIsMultiValue;
  };
  _exports.isMultiValue = isMultiValue;
  var _isFilterableNavigationProperty = function (entry) {
    return (entry.$Type === "com.sap.vocabularies.UI.v1.DataField" || entry.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || entry.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath") && entry.Value.path.includes("/");
  };
  var getAnnotatedSelectionFieldData = function (converterContext) {
    var _converterContext$get8, _entityType$annotatio3, _entityType$annotatio4;
    var lrTables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var annotationPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    var includeHidden = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    var lineItemTerm = arguments.length > 4 ? arguments[4] : undefined;
    // Fetch all selectionVariants defined in the different visualizations and different views (multi table mode)
    var selectionVariants = getSelectionVariants(lrTables, converterContext);

    // create a map of properties to be used in selection variants
    var excludedFilterProperties = getExcludedFilterProperties(selectionVariants);
    var entityType = converterContext.getEntityType();
    //Filters which has to be added which is part of SV/Default annotations but not present in the SelectionFields
    var annotatedSelectionFields = annotationPath && ((_converterContext$get8 = converterContext.getEntityTypeAnnotation(annotationPath)) === null || _converterContext$get8 === void 0 ? void 0 : _converterContext$get8.annotation) || ((_entityType$annotatio3 = entityType.annotations) === null || _entityType$annotatio3 === void 0 ? void 0 : (_entityType$annotatio4 = _entityType$annotatio3.UI) === null || _entityType$annotatio4 === void 0 ? void 0 : _entityType$annotatio4.SelectionFields) || [];
    var navProperties = [];
    if (lrTables.length === 0 && !!lineItemTerm) {
      var _converterContext$get9;
      (_converterContext$get9 = converterContext.getEntityTypeAnnotation(lineItemTerm).annotation) === null || _converterContext$get9 === void 0 ? void 0 : _converterContext$get9.forEach(function (entry) {
        if (_isFilterableNavigationProperty(entry)) {
          var entityPath = entry.Value.path.slice(0, entry.Value.path.lastIndexOf("/"));
          if (!navProperties.includes(entityPath)) {
            navProperties.push(entityPath);
          }
        }
      });
    }

    // create a map of all potential filter fields based on...
    var filterFields = _objectSpread(_objectSpread(_objectSpread({}, _getSelectionFields(entityType, "", entityType.entityProperties, includeHidden, converterContext)), _getSelectionFieldsByPath(entityType, navProperties, false, converterContext)), _getSelectionFieldsByPath(entityType, converterContext.getManifestWrapper().getFilterConfiguration().navigationProperties, includeHidden, converterContext));
    var aSelectOptions = [];
    var selectionVariant = getSelectionVariant(entityType, converterContext);
    if (selectionVariant) {
      aSelectOptions = selectionVariant.SelectOptions;
    }
    var propertyInfoFields = (annotatedSelectionFields === null || annotatedSelectionFields === void 0 ? void 0 : annotatedSelectionFields.reduce(function (selectionFields, selectionField) {
      var propertyPath = selectionField.value;
      if (!(propertyPath in excludedFilterProperties)) {
        var navigationPath;
        if (annotationPath.startsWith("@com.sap.vocabularies.UI.v1.SelectionFields")) {
          navigationPath = "";
        } else {
          navigationPath = annotationPath.split("/@com.sap.vocabularies.UI.v1.SelectionFields")[0];
        }
        var filterPropertyPath = navigationPath ? navigationPath + "/" + propertyPath : propertyPath;
        var filterField = _getFilterField(filterFields, filterPropertyPath, converterContext, entityType);
        if (filterField) {
          filterField.group = "";
          filterField.groupLabel = "";
          selectionFields.push(filterField);
        }
      }
      return selectionFields;
    }, [])) || [];
    var defaultFilterFields = _getDefaultFilterFields(aSelectOptions, entityType, converterContext, excludedFilterProperties, annotatedSelectionFields);
    return {
      excludedFilterProperties: excludedFilterProperties,
      entityType: entityType,
      annotatedSelectionFields: annotatedSelectionFields,
      filterFields: filterFields,
      propertyInfoFields: propertyInfoFields,
      defaultFilterFields: defaultFilterFields
    };
  };
  var fetchTypeConfig = function (property) {
    var oTypeConfig = getTypeConfig(property, property === null || property === void 0 ? void 0 : property.type);
    if ((property === null || property === void 0 ? void 0 : property.type) === sEdmString && (oTypeConfig.constraints.nullable === undefined || oTypeConfig.constraints.nullable === true)) {
      oTypeConfig.formatOptions.parseKeepsEmptyString = false;
    }
    return oTypeConfig;
  };
  _exports.fetchTypeConfig = fetchTypeConfig;
  var assignDataTypeToPropertyInfo = function (propertyInfoField, converterContext, aRequiredProps, aTypeConfig) {
    var oPropertyInfo = fetchPropertyInfo(converterContext, propertyInfoField, aTypeConfig[propertyInfoField.key]),
      sPropertyPath = "";
    if (propertyInfoField.conditionPath) {
      sPropertyPath = propertyInfoField.conditionPath.replace(/\+|\*/g, "");
    }
    if (oPropertyInfo) {
      var _propertyInfoField$re;
      oPropertyInfo = Object.assign(oPropertyInfo, {
        maxConditions: !oPropertyInfo.isParameter && isMultiValue(oPropertyInfo) ? -1 : 1,
        required: (_propertyInfoField$re = propertyInfoField.required) !== null && _propertyInfoField$re !== void 0 ? _propertyInfoField$re : oPropertyInfo.isParameter || aRequiredProps.indexOf(sPropertyPath) >= 0,
        caseSensitive: isFilteringCaseSensitive(converterContext),
        dataType: aTypeConfig[propertyInfoField.key].type
      });
    }
    return oPropertyInfo;
  };
  _exports.assignDataTypeToPropertyInfo = assignDataTypeToPropertyInfo;
  var processSelectionFields = function (propertyInfoFields, converterContext, defaultValuePropertyFields) {
    //get TypeConfig function
    var selectionFieldTypes = [];
    var aTypeConfig = {};
    if (defaultValuePropertyFields) {
      propertyInfoFields = propertyInfoFields.concat(defaultValuePropertyFields);
    }
    //add typeConfig
    propertyInfoFields.forEach(function (parameterField) {
      if (parameterField.annotationPath) {
        var propertyConvertyContext = converterContext.getConverterContextFor(parameterField.annotationPath);
        var propertyTargetObject = propertyConvertyContext.getDataModelObjectPath().targetObject;
        selectionFieldTypes.push(propertyTargetObject === null || propertyTargetObject === void 0 ? void 0 : propertyTargetObject.type);
        var oTypeConfig = fetchTypeConfig(propertyTargetObject);
        aTypeConfig[parameterField.key] = oTypeConfig;
      } else {
        selectionFieldTypes.push(sEdmString);
        aTypeConfig[parameterField.key] = {
          type: sStringDataType
        };
      }
    });

    // filterRestrictions
    var _oFilterrestrictions;
    if (!ModelHelper.isSingleton(converterContext.getEntitySet())) {
      var _converterContext$get10, _converterContext$get11, _converterContext$get12;
      _oFilterrestrictions = (_converterContext$get10 = converterContext.getEntitySet()) === null || _converterContext$get10 === void 0 ? void 0 : (_converterContext$get11 = _converterContext$get10.annotations) === null || _converterContext$get11 === void 0 ? void 0 : (_converterContext$get12 = _converterContext$get11.Capabilities) === null || _converterContext$get12 === void 0 ? void 0 : _converterContext$get12.FilterRestrictions;
    }
    var oFilterRestrictions = _oFilterrestrictions;
    var oRet = {};
    oRet["RequiredProperties"] = getFilterRestrictions(oFilterRestrictions, "RequiredProperties") || [];
    oRet["NonFilterableProperties"] = getFilterRestrictions(oFilterRestrictions, "NonFilterableProperties") || [];
    oRet["FilterAllowedExpressions"] = getFilterRestrictions(oFilterRestrictions, "FilterAllowedExpressions") || {};
    var sEntitySetPath = converterContext.getContextPath();
    var aPathParts = sEntitySetPath.split("/");
    if (aPathParts.length > 2) {
      var sNavigationPath = aPathParts[aPathParts.length - 1];
      aPathParts.splice(-1, 1);
      var oNavigationRestrictions = getNavigationRestrictions(converterContext, sNavigationPath);
      var oNavigationFilterRestrictions = oNavigationRestrictions && oNavigationRestrictions.FilterRestrictions;
      oRet.RequiredProperties.concat(getFilterRestrictions(oNavigationFilterRestrictions, "RequiredProperties") || []);
      oRet.NonFilterableProperties.concat(getFilterRestrictions(oNavigationFilterRestrictions, "NonFilterableProperties") || []);
      oRet.FilterAllowedExpressions = _objectSpread(_objectSpread({}, getFilterRestrictions(oNavigationFilterRestrictions, "FilterAllowedExpressions") || {}), oRet.FilterAllowedExpressions);
    }
    var aRequiredProps = oRet.RequiredProperties;
    var aNonFilterableProps = oRet.NonFilterableProperties;
    var aFetchedProperties = [];

    // process the fields to add necessary properties
    propertyInfoFields.forEach(function (propertyInfoField) {
      var sPropertyPath;
      if (aNonFilterableProps.indexOf(sPropertyPath) === -1) {
        var oPropertyInfo = assignDataTypeToPropertyInfo(propertyInfoField, converterContext, aRequiredProps, aTypeConfig);
        aFetchedProperties.push(oPropertyInfo);
      }
    });

    //add edit
    var dataModelObjectPath = converterContext.getDataModelObjectPath();
    if (ModelHelper.isObjectPathDraftSupported(dataModelObjectPath)) {
      aFetchedProperties.push(getEditStateFilterPropertyInfo());
    }
    // add search
    var searchRestrictions = getSearchRestrictions(converterContext);
    var hideBasicSearch = Boolean(searchRestrictions && !searchRestrictions.Searchable);
    if (sEntitySetPath && hideBasicSearch !== true) {
      if (!searchRestrictions || searchRestrictions !== null && searchRestrictions !== void 0 && searchRestrictions.Searchable) {
        aFetchedProperties.push(getSearchFilterPropertyInfo());
      }
    }
    return aFetchedProperties;
  };
  _exports.processSelectionFields = processSelectionFields;
  var insertCustomManifestElements = function (filterFields, entityType, converterContext) {
    return insertCustomElements(filterFields, getManifestFilterFields(entityType, converterContext), {
      "availability": "overwrite",
      label: "overwrite",
      type: "overwrite",
      position: "overwrite",
      template: "overwrite",
      settings: "overwrite",
      visualFilter: "overwrite",
      required: "overwrite"
    });
  };

  /**
   * Retrieve the configuration for the selection fields that will be used within the filter bar
   * This configuration takes into account the annotation and the selection variants.
   *
   * @param converterContext
   * @param lrTables
   * @param annotationPath
   * @param [includeHidden]
   * @param [lineItemTerm]
   * @returns An array of selection fields
   */
  _exports.insertCustomManifestElements = insertCustomManifestElements;
  var getSelectionFields = function (converterContext) {
    var _entityType$annotatio5, _entityType$annotatio6;
    var lrTables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var annotationPath = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : "";
    var includeHidden = arguments.length > 3 ? arguments[3] : undefined;
    var lineItemTerm = arguments.length > 4 ? arguments[4] : undefined;
    var oAnnotatedSelectionFieldData = getAnnotatedSelectionFieldData(converterContext, lrTables, annotationPath, includeHidden, lineItemTerm);
    var parameterFields = _getParameterFields(converterContext);
    var propertyInfoFields = JSON.parse(JSON.stringify(oAnnotatedSelectionFieldData.propertyInfoFields));
    var entityType = oAnnotatedSelectionFieldData.entityType;
    propertyInfoFields = parameterFields.concat(propertyInfoFields);
    propertyInfoFields = insertCustomManifestElements(propertyInfoFields, entityType, converterContext);
    var aFetchedProperties = processSelectionFields(propertyInfoFields, converterContext, oAnnotatedSelectionFieldData.defaultFilterFields);
    aFetchedProperties.sort(function (a, b) {
      if (a.groupLabel === undefined || a.groupLabel === null) {
        return -1;
      }
      if (b.groupLabel === undefined || b.groupLabel === null) {
        return 1;
      }
      return a.groupLabel.localeCompare(b.groupLabel);
    });
    var sFetchProperties = JSON.stringify(aFetchedProperties);
    sFetchProperties = sFetchProperties.replace(/\{/g, "\\{");
    sFetchProperties = sFetchProperties.replace(/\}/g, "\\}");
    var sPropertyInfo = sFetchProperties;
    // end of propertyFields processing

    // to populate selection fields
    var propSelectionFields = JSON.parse(JSON.stringify(oAnnotatedSelectionFieldData.propertyInfoFields));
    propSelectionFields = parameterFields.concat(propSelectionFields);
    // create a map of properties to be used in selection variants
    var excludedFilterProperties = oAnnotatedSelectionFieldData.excludedFilterProperties;
    var filterFacets = entityType === null || entityType === void 0 ? void 0 : (_entityType$annotatio5 = entityType.annotations) === null || _entityType$annotatio5 === void 0 ? void 0 : (_entityType$annotatio6 = _entityType$annotatio5.UI) === null || _entityType$annotatio6 === void 0 ? void 0 : _entityType$annotatio6.FilterFacets;
    var filterFacetMap = {};
    var aFieldGroups = converterContext.getAnnotationsByTerm("UI", "com.sap.vocabularies.UI.v1.FieldGroup");
    if (filterFacets === undefined || filterFacets.length < 0) {
      for (var i in aFieldGroups) {
        filterFacetMap = _objectSpread(_objectSpread({}, filterFacetMap), getFieldGroupFilterGroups(aFieldGroups[i]));
      }
    } else {
      filterFacetMap = filterFacets.reduce(function (previousValue, filterFacet) {
        for (var _i = 0; _i < (filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$Target = filterFacet.Target) === null || _filterFacet$Target === void 0 ? void 0 : (_filterFacet$Target$$ = _filterFacet$Target.$target) === null || _filterFacet$Target$$ === void 0 ? void 0 : (_filterFacet$Target$$2 = _filterFacet$Target$$.Data) === null || _filterFacet$Target$$2 === void 0 ? void 0 : _filterFacet$Target$$2.length); _i++) {
          var _filterFacet$Target, _filterFacet$Target$$, _filterFacet$Target$$2, _filterFacet$Target2, _filterFacet$Target2$, _filterFacet$Target2$2, _filterFacet$Target2$3, _filterFacet$ID, _filterFacet$Label;
          previousValue[filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$Target2 = filterFacet.Target) === null || _filterFacet$Target2 === void 0 ? void 0 : (_filterFacet$Target2$ = _filterFacet$Target2.$target) === null || _filterFacet$Target2$ === void 0 ? void 0 : (_filterFacet$Target2$2 = _filterFacet$Target2$.Data[_i]) === null || _filterFacet$Target2$2 === void 0 ? void 0 : (_filterFacet$Target2$3 = _filterFacet$Target2$2.Value) === null || _filterFacet$Target2$3 === void 0 ? void 0 : _filterFacet$Target2$3.path] = {
            group: filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$ID = filterFacet.ID) === null || _filterFacet$ID === void 0 ? void 0 : _filterFacet$ID.toString(),
            groupLabel: filterFacet === null || filterFacet === void 0 ? void 0 : (_filterFacet$Label = filterFacet.Label) === null || _filterFacet$Label === void 0 ? void 0 : _filterFacet$Label.toString()
          };
        }
        return previousValue;
      }, {});
    }

    // create a map of all potential filter fields based on...
    var filterFields = oAnnotatedSelectionFieldData.filterFields;

    // finally create final list of filter fields by adding the SelectionFields first (order matters)...
    var allFilters = propSelectionFields

    // ...and adding remaining filter fields, that are not used in a SelectionVariant (order doesn't matter)
    .concat(Object.keys(filterFields).filter(function (propertyPath) {
      return !(propertyPath in excludedFilterProperties);
    }).map(function (propertyPath) {
      return Object.assign(filterFields[propertyPath], filterFacetMap[propertyPath]);
    }));
    var sContextPath = converterContext.getContextPath();

    //if all tables are analytical tables "aggregatable" properties must be excluded
    if (checkAllTableForEntitySetAreAnalytical(lrTables, sContextPath)) {
      // Currently all agregates are root entity properties (no properties coming from navigation) and all
      // tables with same entitySet gets same aggreagte configuration that's why we can use first table into
      // LR to get aggregates (without currency/unit properties since we expect to be able to filter them).
      var aggregates = lrTables[0].aggregates;
      if (aggregates) {
        var aggregatableProperties = Object.keys(aggregates).map(function (aggregateKey) {
          return aggregates[aggregateKey].relativePath;
        });
        allFilters = allFilters.filter(function (filterField) {
          return aggregatableProperties.indexOf(filterField.key) === -1;
        });
      }
    }
    var selectionFields = insertCustomManifestElements(allFilters, entityType, converterContext);

    // Add caseSensitive property to all selection fields.
    var isCaseSensitive = isFilteringCaseSensitive(converterContext);
    selectionFields.forEach(function (filterField) {
      filterField.caseSensitive = isCaseSensitive;
    });
    return {
      selectionFields: selectionFields,
      sPropertyInfo: sPropertyInfo
    };
  };

  /**
   * Determines whether the filter bar inside a value help dialog should be expanded. This is true if one of the following conditions hold:
   * (1) a filter property is mandatory,
   * (2) no search field exists (entity isn't search enabled),
   * (3) when the data isn't loaded by default (annotation FetchValues = 2).
   *
   * @param converterContext The converter context
   * @param filterRestrictionsAnnotation The FilterRestriction annotation
   * @param valueListAnnotation The ValueList annotation
   * @returns The value for expandFilterFields
   */
  _exports.getSelectionFields = getSelectionFields;
  var getExpandFilterFields = function (converterContext, filterRestrictionsAnnotation, valueListAnnotation) {
    var requiredProperties = getFilterRestrictions(filterRestrictionsAnnotation, "RequiredProperties");
    var searchRestrictions = getSearchRestrictions(converterContext);
    var hideBasicSearch = Boolean(searchRestrictions && !searchRestrictions.Searchable);
    var valueList = valueListAnnotation.getObject();
    if (requiredProperties.length > 0 || hideBasicSearch || (valueList === null || valueList === void 0 ? void 0 : valueList.FetchValues) === 2) {
      return true;
    }
    return false;
  };
  _exports.getExpandFilterFields = getExpandFilterFields;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmaWx0ZXJGaWVsZFR5cGUiLCJzRWRtU3RyaW5nIiwic1N0cmluZ0RhdGFUeXBlIiwiZ2V0RmllbGRHcm91cEZpbHRlckdyb3VwcyIsImZpZWxkR3JvdXAiLCJmaWx0ZXJGYWNldE1hcCIsIkRhdGEiLCJmb3JFYWNoIiwiZGF0YUZpZWxkIiwiJFR5cGUiLCJWYWx1ZSIsInBhdGgiLCJncm91cCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImdyb3VwTGFiZWwiLCJjb21waWxlRXhwcmVzc2lvbiIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsIkxhYmVsIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJxdWFsaWZpZXIiLCJnZXRFeGNsdWRlZEZpbHRlclByb3BlcnRpZXMiLCJzZWxlY3Rpb25WYXJpYW50cyIsInJlZHVjZSIsInByZXZpb3VzVmFsdWUiLCJzZWxlY3Rpb25WYXJpYW50IiwicHJvcGVydHlOYW1lcyIsInByb3BlcnR5TmFtZSIsImNoZWNrQWxsVGFibGVGb3JFbnRpdHlTZXRBcmVBbmFseXRpY2FsIiwibGlzdFJlcG9ydFRhYmxlcyIsImNvbnRleHRQYXRoIiwibGVuZ3RoIiwiZXZlcnkiLCJ2aXN1YWxpemF0aW9uIiwiZW5hYmxlQW5hbHl0aWNzIiwiYW5ub3RhdGlvbiIsImNvbGxlY3Rpb24iLCJnZXRTZWxlY3Rpb25WYXJpYW50cyIsImxyVGFibGVWaXN1YWxpemF0aW9ucyIsImNvbnZlcnRlckNvbnRleHQiLCJzZWxlY3Rpb25WYXJpYW50UGF0aHMiLCJtYXAiLCJ0YWJsZUZpbHRlcnMiLCJjb250cm9sIiwiZmlsdGVycyIsInRhYmxlU1ZDb25maWdzIiwia2V5IiwiQXJyYXkiLCJpc0FycmF5IiwicGF0aHMiLCJhbm5vdGF0aW9uUGF0aCIsImluZGV4T2YiLCJwdXNoIiwic2VsZWN0aW9uVmFyaWFudENvbmZpZyIsImdldFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uIiwic3ZDb25maWdzIiwiY29uY2F0IiwiX2dldENvbmRpdGlvblBhdGgiLCJlbnRpdHlUeXBlIiwicHJvcGVydHlQYXRoIiwicGFydHMiLCJzcGxpdCIsInBhcnRpYWxQYXRoIiwicGFydCIsInNoaWZ0IiwicHJvcGVydHkiLCJyZXNvbHZlUGF0aCIsIl90eXBlIiwiaXNDb2xsZWN0aW9uIiwiX2NyZWF0ZUZpbHRlclNlbGVjdGlvbkZpZWxkIiwiZnVsbFByb3BlcnR5UGF0aCIsImluY2x1ZGVIaWRkZW4iLCJ1bmRlZmluZWQiLCJ0YXJnZXRUeXBlIiwiVUkiLCJIaWRkZW4iLCJ2YWx1ZU9mIiwidGFyZ2V0RW50aXR5VHlwZSIsImdldEFubm90YXRpb25FbnRpdHlUeXBlIiwiS2V5SGVscGVyIiwiZ2V0U2VsZWN0aW9uRmllbGRLZXlGcm9tUGF0aCIsImdldEFic29sdXRlQW5ub3RhdGlvblBhdGgiLCJjb25kaXRpb25QYXRoIiwiYXZhaWxhYmlsaXR5IiwiSGlkZGVuRmlsdGVyIiwiQXZhaWxhYmlsaXR5VHlwZSIsIkFkYXB0YXRpb24iLCJsYWJlbCIsIm5hbWUiLCJnZXRNb2RlbFR5cGUiLCJzVHlwZSIsIm1EZWZhdWx0VHlwZUZvckVkbVR5cGUiLCJtb2RlbFR5cGUiLCJfZ2V0U2VsZWN0aW9uRmllbGRzIiwibmF2aWdhdGlvblBhdGgiLCJwcm9wZXJ0aWVzIiwic2VsZWN0aW9uRmllbGRNYXAiLCJmdWxsUGF0aCIsInNlbGVjdGlvbkZpZWxkIiwiX2dldFNlbGVjdGlvbkZpZWxkc0J5UGF0aCIsInByb3BlcnR5UGF0aHMiLCJzZWxlY3Rpb25GaWVsZHMiLCJsb2NhbFNlbGVjdGlvbkZpZWxkcyIsImVudGl0eVByb3BlcnRpZXMiLCJpbmNsdWRlcyIsInNwbGljZSIsImpvaW4iLCJfZ2V0RmlsdGVyRmllbGQiLCJmaWx0ZXJGaWVsZHMiLCJmaWx0ZXJGaWVsZCIsIkRlZmF1bHQiLCJpc1BhcmFtZXRlciIsIlJlc3VsdENvbnRleHQiLCJnZXREaWFnbm9zdGljcyIsImFkZElzc3VlIiwiSXNzdWVDYXRlZ29yeSIsIkFubm90YXRpb24iLCJJc3N1ZVNldmVyaXR5IiwiSGlnaCIsIklzc3VlVHlwZSIsIk1JU1NJTkdfU0VMRUNUSU9ORklFTEQiLCJfZ2V0RGVmYXVsdEZpbHRlckZpZWxkcyIsImFTZWxlY3RPcHRpb25zIiwiZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzIiwiYW5ub3RhdGVkU2VsZWN0aW9uRmllbGRzIiwiVUlTZWxlY3Rpb25GaWVsZHMiLCJTZWxlY3Rpb25GaWVsZCIsInZhbHVlIiwic2VsZWN0T3B0aW9uIiwiUHJvcGVydHlOYW1lIiwic1Byb3BlcnR5UGF0aCIsImN1cnJlbnRTZWxlY3Rpb25GaWVsZHMiLCJGaWx0ZXJGaWVsZCIsImdldEZpbHRlckZpZWxkIiwiZGVmYXVsdEZpbHRlclZhbHVlIiwiRmlsdGVyRGVmYXVsdFZhbHVlIiwiX2dldFBhcmFtZXRlckZpZWxkcyIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoIiwicGFyYW1ldGVyRW50aXR5VHlwZSIsInN0YXJ0aW5nRW50aXR5U2V0IiwiaXNQYXJhbWV0ZXJpemVkIiwidGFyZ2V0RW50aXR5U2V0IiwicGFyYW1ldGVyQ29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHRGb3IiLCJnZXRGaWx0ZXJCYXJoaWRlQmFzaWNTZWFyY2giLCJjaGFydHMiLCJub1NlYXJjaEluQ2hhcnRzIiwiY2hhcnQiLCJhcHBseVN1cHBvcnRlZCIsImVuYWJsZVNlYXJjaCIsIm5vU2VhcmNoSW5UYWJsZXMiLCJ0YWJsZSIsImVuYWJsZUFuYWx5dGljc1NlYXJjaCIsImdldENvbnRleHRQYXRoIiwiZ2V0TWFuaWZlc3RGaWx0ZXJGaWVsZHMiLCJmYkNvbmZpZyIsImdldE1hbmlmZXN0V3JhcHBlciIsImdldEZpbHRlckNvbmZpZ3VyYXRpb24iLCJkZWZpbmVkRmlsdGVyRmllbGRzIiwiT2JqZWN0Iiwia2V5cyIsImdldFBhdGhGcm9tU2VsZWN0aW9uRmllbGRLZXkiLCJzS2V5IiwidHlwZSIsIlNsb3QiLCJ2aXN1YWxGaWx0ZXIiLCJnZXRWaXN1YWxGaWx0ZXJzIiwidGVtcGxhdGUiLCJwb3NpdGlvbiIsInBsYWNlbWVudCIsIlBsYWNlbWVudCIsIkFmdGVyIiwic2V0dGluZ3MiLCJyZXF1aXJlZCIsImdldEZpbHRlclJlc3RyaWN0aW9ucyIsIm9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uIiwic1Jlc3RyaWN0aW9uIiwiYVByb3BzIiwib1Byb3BlcnR5IiwiJFByb3BlcnR5UGF0aCIsIm1BbGxvd2VkRXhwcmVzc2lvbnMiLCJGaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zIiwiUHJvcGVydHkiLCJBbGxvd2VkRXhwcmVzc2lvbnMiLCJnZXRTZWFyY2hGaWx0ZXJQcm9wZXJ0eUluZm8iLCJkYXRhVHlwZSIsIm1heENvbmRpdGlvbnMiLCJnZXRFZGl0U3RhdGVGaWx0ZXJQcm9wZXJ0eUluZm8iLCJoaWRkZW5GaWx0ZXIiLCJnZXRTZWFyY2hSZXN0cmljdGlvbnMiLCJzZWFyY2hSZXN0cmljdGlvbnMiLCJNb2RlbEhlbHBlciIsImlzU2luZ2xldG9uIiwiZ2V0RW50aXR5U2V0IiwiY2FwYWJpbGl0ZXMiLCJDYXBhYmlsaXRpZXMiLCJTZWFyY2hSZXN0cmljdGlvbnMiLCJnZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zIiwic05hdmlnYXRpb25QYXRoIiwib05hdmlnYXRpb25SZXN0cmljdGlvbnMiLCJOYXZpZ2F0aW9uUmVzdHJpY3Rpb25zIiwiYVJlc3RyaWN0ZWRQcm9wZXJ0aWVzIiwiUmVzdHJpY3RlZFByb3BlcnRpZXMiLCJmaW5kIiwib1Jlc3RyaWN0ZWRQcm9wZXJ0eSIsIk5hdmlnYXRpb25Qcm9wZXJ0eSIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiX2ZldGNoQmFzaWNQcm9wZXJ0eUluZm8iLCJvRmlsdGVyRmllbGRJbmZvIiwiZGlzcGxheSIsImNhc2VTZW5zaXRpdmUiLCJtZW51IiwiZ2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbiIsImFFeHByZXNzaW9ucyIsImFBbGxvd2VkRXhwcmVzc2lvbnNQcmlvcml0eSIsInNvcnQiLCJhIiwiYiIsImRpc3BsYXlNb2RlIiwib1Byb3BlcnR5QW5ub3RhdGlvbnMiLCJvQ29sbGVjdGlvbkFubm90YXRpb25zIiwib1RleHRBbm5vdGF0aW9uIiwiVGV4dCIsIm9UZXh0QXJyYW5nbWVudEFubm90YXRpb24iLCJUZXh0QXJyYW5nZW1lbnQiLCJmZXRjaFByb3BlcnR5SW5mbyIsIm9UeXBlQ29uZmlnIiwib1Byb3BlcnR5SW5mbyIsInNBbm5vdGF0aW9uUGF0aCIsInRhcmdldFByb3BlcnR5T2JqZWN0IiwidGFyZ2V0T2JqZWN0Iiwib0Zvcm1hdE9wdGlvbnMiLCJmb3JtYXRPcHRpb25zIiwib0NvbnN0cmFpbnRzIiwiY29uc3RyYWludHMiLCJhc3NpZ24iLCJpc011bHRpVmFsdWUiLCJiSXNNdWx0aVZhbHVlIiwiZmlsdGVyRXhwcmVzc2lvbiIsIl9pc0ZpbHRlcmFibGVOYXZpZ2F0aW9uUHJvcGVydHkiLCJlbnRyeSIsImdldEFubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YSIsImxyVGFibGVzIiwibGluZUl0ZW1UZXJtIiwiZ2V0RW50aXR5VHlwZSIsImdldEVudGl0eVR5cGVBbm5vdGF0aW9uIiwiU2VsZWN0aW9uRmllbGRzIiwibmF2UHJvcGVydGllcyIsImVudGl0eVBhdGgiLCJzbGljZSIsImxhc3RJbmRleE9mIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJnZXRTZWxlY3Rpb25WYXJpYW50IiwiU2VsZWN0T3B0aW9ucyIsInByb3BlcnR5SW5mb0ZpZWxkcyIsInN0YXJ0c1dpdGgiLCJmaWx0ZXJQcm9wZXJ0eVBhdGgiLCJkZWZhdWx0RmlsdGVyRmllbGRzIiwiZmV0Y2hUeXBlQ29uZmlnIiwiZ2V0VHlwZUNvbmZpZyIsIm51bGxhYmxlIiwicGFyc2VLZWVwc0VtcHR5U3RyaW5nIiwiYXNzaWduRGF0YVR5cGVUb1Byb3BlcnR5SW5mbyIsInByb3BlcnR5SW5mb0ZpZWxkIiwiYVJlcXVpcmVkUHJvcHMiLCJhVHlwZUNvbmZpZyIsInJlcGxhY2UiLCJpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUiLCJwcm9jZXNzU2VsZWN0aW9uRmllbGRzIiwiZGVmYXVsdFZhbHVlUHJvcGVydHlGaWVsZHMiLCJzZWxlY3Rpb25GaWVsZFR5cGVzIiwicGFyYW1ldGVyRmllbGQiLCJwcm9wZXJ0eUNvbnZlcnR5Q29udGV4dCIsInByb3BlcnR5VGFyZ2V0T2JqZWN0IiwiX29GaWx0ZXJyZXN0cmljdGlvbnMiLCJGaWx0ZXJSZXN0cmljdGlvbnMiLCJvRmlsdGVyUmVzdHJpY3Rpb25zIiwib1JldCIsInNFbnRpdHlTZXRQYXRoIiwiYVBhdGhQYXJ0cyIsIm9OYXZpZ2F0aW9uRmlsdGVyUmVzdHJpY3Rpb25zIiwiUmVxdWlyZWRQcm9wZXJ0aWVzIiwiTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMiLCJGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMiLCJhTm9uRmlsdGVyYWJsZVByb3BzIiwiYUZldGNoZWRQcm9wZXJ0aWVzIiwiaXNPYmplY3RQYXRoRHJhZnRTdXBwb3J0ZWQiLCJoaWRlQmFzaWNTZWFyY2giLCJCb29sZWFuIiwiU2VhcmNoYWJsZSIsImluc2VydEN1c3RvbU1hbmlmZXN0RWxlbWVudHMiLCJpbnNlcnRDdXN0b21FbGVtZW50cyIsImdldFNlbGVjdGlvbkZpZWxkcyIsIm9Bbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEiLCJwYXJhbWV0ZXJGaWVsZHMiLCJKU09OIiwicGFyc2UiLCJzdHJpbmdpZnkiLCJsb2NhbGVDb21wYXJlIiwic0ZldGNoUHJvcGVydGllcyIsInNQcm9wZXJ0eUluZm8iLCJwcm9wU2VsZWN0aW9uRmllbGRzIiwiZmlsdGVyRmFjZXRzIiwiRmlsdGVyRmFjZXRzIiwiYUZpZWxkR3JvdXBzIiwiZ2V0QW5ub3RhdGlvbnNCeVRlcm0iLCJpIiwiZmlsdGVyRmFjZXQiLCJUYXJnZXQiLCIkdGFyZ2V0IiwiSUQiLCJ0b1N0cmluZyIsImFsbEZpbHRlcnMiLCJmaWx0ZXIiLCJzQ29udGV4dFBhdGgiLCJhZ2dyZWdhdGVzIiwiYWdncmVnYXRhYmxlUHJvcGVydGllcyIsImFnZ3JlZ2F0ZUtleSIsInJlbGF0aXZlUGF0aCIsImlzQ2FzZVNlbnNpdGl2ZSIsImdldEV4cGFuZEZpbHRlckZpZWxkcyIsImZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24iLCJ2YWx1ZUxpc3RBbm5vdGF0aW9uIiwicmVxdWlyZWRQcm9wZXJ0aWVzIiwidmFsdWVMaXN0IiwiZ2V0T2JqZWN0IiwiRmV0Y2hWYWx1ZXMiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpbHRlckJhci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEFubm90YXRpb25UZXJtLCBFbnRpdHlUeXBlLCBOYXZpZ2F0aW9uUHJvcGVydHksIFByb3BlcnR5LCBQcm9wZXJ0eVBhdGggfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IEVudGl0eVNldEFubm90YXRpb25zX0NhcGFiaWxpdGllcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQ2FwYWJpbGl0aWVzX0VkbVwiO1xuaW1wb3J0IHR5cGUge1xuXHREYXRhRmllbGQsXG5cdERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdERhdGFGaWVsZFR5cGVzLFxuXHREYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGgsXG5cdERhdGFGaWVsZFdpdGhVcmwsXG5cdEZpZWxkR3JvdXAsXG5cdExpbmVJdGVtLFxuXHRSZWZlcmVuY2VGYWNldFR5cGVzLFxuXHRTZWxlY3RPcHRpb25UeXBlXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zLCBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB0eXBlIHsgQ2hhcnRWaXN1YWxpemF0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0NoYXJ0XCI7XG5pbXBvcnQgdHlwZSB7IFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uLCBUYWJsZVZpc3VhbGl6YXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB7IGdldFNlbGVjdGlvblZhcmlhbnRDb25maWd1cmF0aW9uLCBnZXRUeXBlQ29uZmlnLCBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vVGFibGVcIjtcbmltcG9ydCB0eXBlIHsgVmlzdWFsRmlsdGVycyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvVmlzdWFsRmlsdGVyc1wiO1xuaW1wb3J0IHsgZ2V0VmlzdWFsRmlsdGVycyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0xpc3RSZXBvcnQvVmlzdWFsRmlsdGVyc1wiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9Db252ZXJ0ZXJDb250ZXh0XCI7XG5pbXBvcnQgdHlwZSB7IENvbmZpZ3VyYWJsZU9iamVjdCwgQ3VzdG9tRWxlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBpbnNlcnRDdXN0b21FbGVtZW50cywgUGxhY2VtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IElzc3VlQ2F0ZWdvcnksIElzc3VlU2V2ZXJpdHksIElzc3VlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgRmlsdGVyRmllbGRNYW5pZmVzdENvbmZpZ3VyYXRpb24sIEZpbHRlck1hbmlmZXN0Q29uZmlndXJhdGlvbiwgRmlsdGVyU2V0dGluZ3MgfSBmcm9tIFwiLi4vLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgQXZhaWxhYmlsaXR5VHlwZSB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBnZXRTZWxlY3Rpb25WYXJpYW50IH0gZnJvbSBcIi4uL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuLy9pbXBvcnQgeyBoYXNWYWx1ZUhlbHAgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuXG5leHBvcnQgdHlwZSBGaWx0ZXJGaWVsZCA9IENvbmZpZ3VyYWJsZU9iamVjdCAmIHtcblx0dHlwZT86IHN0cmluZztcblx0Y29uZGl0aW9uUGF0aDogc3RyaW5nO1xuXHRhdmFpbGFiaWxpdHk6IEF2YWlsYWJpbGl0eVR5cGU7XG5cdGFubm90YXRpb25QYXRoOiBzdHJpbmc7XG5cdGxhYmVsPzogc3RyaW5nO1xuXHR0ZW1wbGF0ZT86IHN0cmluZztcblx0Z3JvdXA/OiBzdHJpbmc7XG5cdGdyb3VwTGFiZWw/OiBzdHJpbmc7XG5cdHNldHRpbmdzPzogRmlsdGVyU2V0dGluZ3M7XG5cdGlzUGFyYW1ldGVyPzogYm9vbGVhbjtcblx0dmlzdWFsRmlsdGVyPzogVmlzdWFsRmlsdGVycztcblx0Y2FzZVNlbnNpdGl2ZT86IGJvb2xlYW47XG5cdHJlcXVpcmVkPzogYm9vbGVhbjtcbn07XG5cbnR5cGUgRmlsdGVyR3JvdXAgPSB7XG5cdGdyb3VwPzogc3RyaW5nO1xuXHRncm91cExhYmVsPzogc3RyaW5nO1xufTtcblxuZW51bSBmaWx0ZXJGaWVsZFR5cGUge1xuXHREZWZhdWx0ID0gXCJEZWZhdWx0XCIsXG5cdFNsb3QgPSBcIlNsb3RcIlxufVxuXG5jb25zdCBzRWRtU3RyaW5nID0gXCJFZG0uU3RyaW5nXCI7XG5jb25zdCBzU3RyaW5nRGF0YVR5cGUgPSBcInNhcC51aS5tb2RlbC5vZGF0YS50eXBlLlN0cmluZ1wiO1xuXG5leHBvcnQgdHlwZSBDdXN0b21FbGVtZW50RmlsdGVyRmllbGQgPSBDdXN0b21FbGVtZW50PEZpbHRlckZpZWxkPjtcblxuLyoqXG4gKiBFbnRlciBhbGwgRGF0YUZpZWxkcyBvZiBhIGdpdmVuIEZpZWxkR3JvdXAgaW50byB0aGUgZmlsdGVyRmFjZXRNYXAuXG4gKlxuICogQHBhcmFtIGZpZWxkR3JvdXBcbiAqIEByZXR1cm5zIFRoZSBtYXAgb2YgZmFjZXRzIGZvciB0aGUgZ2l2ZW4gRmllbGRHcm91cFxuICovXG5mdW5jdGlvbiBnZXRGaWVsZEdyb3VwRmlsdGVyR3JvdXBzKGZpZWxkR3JvdXA6IEZpZWxkR3JvdXApOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJHcm91cD4ge1xuXHRjb25zdCBmaWx0ZXJGYWNldE1hcDogUmVjb3JkPHN0cmluZywgRmlsdGVyR3JvdXA+ID0ge307XG5cdGZpZWxkR3JvdXAuRGF0YS5mb3JFYWNoKChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpID0+IHtcblx0XHRpZiAoZGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFwiKSB7XG5cdFx0XHRmaWx0ZXJGYWNldE1hcFtkYXRhRmllbGQuVmFsdWUucGF0aF0gPSB7XG5cdFx0XHRcdGdyb3VwOiBmaWVsZEdyb3VwLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdFx0Z3JvdXBMYWJlbDpcblx0XHRcdFx0XHRjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihmaWVsZEdyb3VwLkxhYmVsIHx8IGZpZWxkR3JvdXAuYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWwgfHwgZmllbGRHcm91cC5xdWFsaWZpZXIpXG5cdFx0XHRcdFx0KSB8fCBmaWVsZEdyb3VwLnF1YWxpZmllclxuXHRcdFx0fTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gZmlsdGVyRmFjZXRNYXA7XG59XG5cbmZ1bmN0aW9uIGdldEV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllcyhzZWxlY3Rpb25WYXJpYW50czogU2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb25bXSk6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+IHtcblx0cmV0dXJuIHNlbGVjdGlvblZhcmlhbnRzLnJlZHVjZSgocHJldmlvdXNWYWx1ZTogUmVjb3JkPHN0cmluZywgYm9vbGVhbj4sIHNlbGVjdGlvblZhcmlhbnQpID0+IHtcblx0XHRzZWxlY3Rpb25WYXJpYW50LnByb3BlcnR5TmFtZXMuZm9yRWFjaCgocHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRwcmV2aW91c1ZhbHVlW3Byb3BlcnR5TmFtZV0gPSB0cnVlO1xuXHRcdH0pO1xuXHRcdHJldHVybiBwcmV2aW91c1ZhbHVlO1xuXHR9LCB7fSk7XG59XG5cbi8qKlxuICogQ2hlY2sgdGhhdCBhbGwgdGhlIHRhYmxlcyBmb3IgYSBkZWRpY2F0ZWQgZW50aXR5IHNldCBhcmUgY29uZmlndXJlZCBhcyBhbmFseXRpY2FsIHRhYmxlcy5cbiAqXG4gKiBAcGFyYW0gbGlzdFJlcG9ydFRhYmxlcyBMaXN0IHJlcG9ydCB0YWJsZXNcbiAqIEBwYXJhbSBjb250ZXh0UGF0aFxuICogQHJldHVybnMgSXMgRmlsdGVyQmFyIHNlYXJjaCBmaWVsZCBoaWRkZW4gb3Igbm90XG4gKi9cbmZ1bmN0aW9uIGNoZWNrQWxsVGFibGVGb3JFbnRpdHlTZXRBcmVBbmFseXRpY2FsKGxpc3RSZXBvcnRUYWJsZXM6IFRhYmxlVmlzdWFsaXphdGlvbltdLCBjb250ZXh0UGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkKSB7XG5cdGlmIChjb250ZXh0UGF0aCAmJiBsaXN0UmVwb3J0VGFibGVzLmxlbmd0aCA+IDApIHtcblx0XHRyZXR1cm4gbGlzdFJlcG9ydFRhYmxlcy5ldmVyeSgodmlzdWFsaXphdGlvbikgPT4ge1xuXHRcdFx0cmV0dXJuIHZpc3VhbGl6YXRpb24uZW5hYmxlQW5hbHl0aWNzICYmIGNvbnRleHRQYXRoID09PSB2aXN1YWxpemF0aW9uLmFubm90YXRpb24uY29sbGVjdGlvbjtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gZmFsc2U7XG59XG5cbmZ1bmN0aW9uIGdldFNlbGVjdGlvblZhcmlhbnRzKFxuXHRsclRhYmxlVmlzdWFsaXphdGlvbnM6IFRhYmxlVmlzdWFsaXphdGlvbltdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbltdIHtcblx0Y29uc3Qgc2VsZWN0aW9uVmFyaWFudFBhdGhzOiBzdHJpbmdbXSA9IFtdO1xuXHRyZXR1cm4gbHJUYWJsZVZpc3VhbGl6YXRpb25zXG5cdFx0Lm1hcCgodmlzdWFsaXphdGlvbikgPT4ge1xuXHRcdFx0Y29uc3QgdGFibGVGaWx0ZXJzID0gdmlzdWFsaXphdGlvbi5jb250cm9sLmZpbHRlcnM7XG5cdFx0XHRjb25zdCB0YWJsZVNWQ29uZmlnczogU2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb25bXSA9IFtdO1xuXHRcdFx0Zm9yIChjb25zdCBrZXkgaW4gdGFibGVGaWx0ZXJzKSB7XG5cdFx0XHRcdGlmIChBcnJheS5pc0FycmF5KHRhYmxlRmlsdGVyc1trZXldLnBhdGhzKSkge1xuXHRcdFx0XHRcdGNvbnN0IHBhdGhzID0gdGFibGVGaWx0ZXJzW2tleV0ucGF0aHM7XG5cdFx0XHRcdFx0cGF0aHMuZm9yRWFjaCgocGF0aCkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKHBhdGggJiYgcGF0aC5hbm5vdGF0aW9uUGF0aCAmJiBzZWxlY3Rpb25WYXJpYW50UGF0aHMuaW5kZXhPZihwYXRoLmFubm90YXRpb25QYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudFBhdGhzLnB1c2gocGF0aC5hbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNlbGVjdGlvblZhcmlhbnRDb25maWcgPSBnZXRTZWxlY3Rpb25WYXJpYW50Q29uZmlndXJhdGlvbihwYXRoLmFubm90YXRpb25QYXRoLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRcdFx0XHRcdFx0aWYgKHNlbGVjdGlvblZhcmlhbnRDb25maWcpIHtcblx0XHRcdFx0XHRcdFx0XHR0YWJsZVNWQ29uZmlncy5wdXNoKHNlbGVjdGlvblZhcmlhbnRDb25maWcpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB0YWJsZVNWQ29uZmlncztcblx0XHR9KVxuXHRcdC5yZWR1Y2UoKHN2Q29uZmlncywgc2VsZWN0aW9uVmFyaWFudCkgPT4gc3ZDb25maWdzLmNvbmNhdChzZWxlY3Rpb25WYXJpYW50KSwgW10pO1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGNvbmRpdGlvbiBwYXRoIHJlcXVpcmVkIGZvciB0aGUgY29uZGl0aW9uIG1vZGVsLiBJdCBsb29rcyBhcyBmb2xsb3dzOlxuICogPDE6Ti1Qcm9wZXJ0eU5hbWU+KlxcLzwxOjEtUHJvcGVydHlOYW1lPi88UHJvcGVydHlOYW1lPi5cbiAqXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgcm9vdCBFbnRpdHlUeXBlXG4gKiBAcGFyYW0gcHJvcGVydHlQYXRoIFRoZSBmdWxsIHBhdGggdG8gdGhlIHRhcmdldCBwcm9wZXJ0eVxuICogQHJldHVybnMgVGhlIGZvcm1hdHRlZCBjb25kaXRpb24gcGF0aFxuICovXG5jb25zdCBfZ2V0Q29uZGl0aW9uUGF0aCA9IGZ1bmN0aW9uIChlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLCBwcm9wZXJ0eVBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdGNvbnN0IHBhcnRzID0gcHJvcGVydHlQYXRoLnNwbGl0KFwiL1wiKTtcblx0bGV0IHBhcnRpYWxQYXRoO1xuXHRsZXQga2V5ID0gXCJcIjtcblx0d2hpbGUgKHBhcnRzLmxlbmd0aCkge1xuXHRcdGxldCBwYXJ0ID0gcGFydHMuc2hpZnQoKSBhcyBzdHJpbmc7XG5cdFx0cGFydGlhbFBhdGggPSBwYXJ0aWFsUGF0aCA/IGAke3BhcnRpYWxQYXRofS8ke3BhcnR9YCA6IHBhcnQ7XG5cdFx0Y29uc3QgcHJvcGVydHk6IFByb3BlcnR5IHwgTmF2aWdhdGlvblByb3BlcnR5ID0gZW50aXR5VHlwZS5yZXNvbHZlUGF0aChwYXJ0aWFsUGF0aCk7XG5cdFx0aWYgKHByb3BlcnR5Ll90eXBlID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIHByb3BlcnR5LmlzQ29sbGVjdGlvbikge1xuXHRcdFx0cGFydCArPSBcIipcIjtcblx0XHR9XG5cdFx0a2V5ID0ga2V5ID8gYCR7a2V5fS8ke3BhcnR9YCA6IHBhcnQ7XG5cdH1cblx0cmV0dXJuIGtleTtcbn07XG5cbmNvbnN0IF9jcmVhdGVGaWx0ZXJTZWxlY3Rpb25GaWVsZCA9IGZ1bmN0aW9uIChcblx0ZW50aXR5VHlwZTogRW50aXR5VHlwZSxcblx0cHJvcGVydHk6IFByb3BlcnR5LFxuXHRmdWxsUHJvcGVydHlQYXRoOiBzdHJpbmcsXG5cdGluY2x1ZGVIaWRkZW46IGJvb2xlYW4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IEZpbHRlckZpZWxkIHwgdW5kZWZpbmVkIHtcblx0Ly8gaWdub3JlIGNvbXBsZXggcHJvcGVydHkgdHlwZXMgYW5kIGhpZGRlbiBhbm5vdGF0ZWQgb25lc1xuXHRpZiAoXG5cdFx0cHJvcGVydHkgIT09IHVuZGVmaW5lZCAmJlxuXHRcdHByb3BlcnR5LnRhcmdldFR5cGUgPT09IHVuZGVmaW5lZCAmJlxuXHRcdChpbmNsdWRlSGlkZGVuIHx8IHByb3BlcnR5LmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgIT09IHRydWUpXG5cdCkge1xuXHRcdGNvbnN0IHRhcmdldEVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25FbnRpdHlUeXBlKHByb3BlcnR5KTtcblx0XHRyZXR1cm4ge1xuXHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2V0U2VsZWN0aW9uRmllbGRLZXlGcm9tUGF0aChmdWxsUHJvcGVydHlQYXRoKSxcblx0XHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEFic29sdXRlQW5ub3RhdGlvblBhdGgoZnVsbFByb3BlcnR5UGF0aCksXG5cdFx0XHRjb25kaXRpb25QYXRoOiBfZ2V0Q29uZGl0aW9uUGF0aChlbnRpdHlUeXBlLCBmdWxsUHJvcGVydHlQYXRoKSxcblx0XHRcdGF2YWlsYWJpbGl0eTpcblx0XHRcdFx0cHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW5GaWx0ZXI/LnZhbHVlT2YoKSA9PT0gdHJ1ZSA/IEF2YWlsYWJpbGl0eVR5cGUuSGlkZGVuIDogQXZhaWxhYmlsaXR5VHlwZS5BZGFwdGF0aW9uLFxuXHRcdFx0bGFiZWw6IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihwcm9wZXJ0eS5hbm5vdGF0aW9ucy5Db21tb24/LkxhYmVsPy52YWx1ZU9mKCkgfHwgcHJvcGVydHkubmFtZSkpLFxuXHRcdFx0Z3JvdXA6IHRhcmdldEVudGl0eVR5cGUubmFtZSxcblx0XHRcdGdyb3VwTGFiZWw6IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24odGFyZ2V0RW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWw/LnZhbHVlT2YoKSB8fCB0YXJnZXRFbnRpdHlUeXBlLm5hbWUpXG5cdFx0XHQpXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldE1vZGVsVHlwZShzVHlwZTogYW55KSB7XG5cdHR5cGUgZGVmYXVsdE1vZGVsVHlwZSA9IHtcblx0XHRba2V5OiBzdHJpbmddOiB7XG5cdFx0XHRba2V5OiBzdHJpbmddOiBzdHJpbmc7XG5cdFx0fTtcblx0fTtcblx0Y29uc3QgbURlZmF1bHRUeXBlRm9yRWRtVHlwZTogZGVmYXVsdE1vZGVsVHlwZSA9IHtcblx0XHRcIkVkbS5Cb29sZWFuXCI6IHtcblx0XHRcdG1vZGVsVHlwZTogXCJCb29sXCJcblx0XHR9LFxuXHRcdFwiRWRtLkJ5dGVcIjoge1xuXHRcdFx0bW9kZWxUeXBlOiBcIkludFwiXG5cdFx0fSxcblx0XHRcIkVkbS5EYXRlXCI6IHtcblx0XHRcdG1vZGVsVHlwZTogXCJEYXRlXCJcblx0XHR9LFxuXHRcdFwiRWRtLkRhdGVUaW1lXCI6IHtcblx0XHRcdG1vZGVsVHlwZTogXCJEYXRlXCJcblx0XHR9LFxuXHRcdFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCI6IHtcblx0XHRcdG1vZGVsVHlwZTogXCJEYXRlVGltZU9mZnNldFwiXG5cdFx0fSxcblx0XHRcIkVkbS5EZWNpbWFsXCI6IHtcblx0XHRcdG1vZGVsVHlwZTogXCJEZWNpbWFsXCJcblx0XHR9LFxuXHRcdFwiRWRtLkRvdWJsZVwiOiB7XG5cdFx0XHRtb2RlbFR5cGU6IFwiRmxvYXRcIlxuXHRcdH0sXG5cdFx0XCJFZG0uRmxvYXRcIjoge1xuXHRcdFx0bW9kZWxUeXBlOiBcIkZsb2F0XCJcblx0XHR9LFxuXHRcdFwiRWRtLkd1aWRcIjoge1xuXHRcdFx0bW9kZWxUeXBlOiBcIkd1aWRcIlxuXHRcdH0sXG5cdFx0XCJFZG0uSW50MTZcIjoge1xuXHRcdFx0bW9kZWxUeXBlOiBcIkludFwiXG5cdFx0fSxcblx0XHRcIkVkbS5JbnQzMlwiOiB7XG5cdFx0XHRtb2RlbFR5cGU6IFwiSW50XCJcblx0XHR9LFxuXHRcdFwiRWRtLkludDY0XCI6IHtcblx0XHRcdG1vZGVsVHlwZTogXCJJbnRcIlxuXHRcdH0sXG5cdFx0XCJFZG0uU0J5dGVcIjoge1xuXHRcdFx0bW9kZWxUeXBlOiBcIkludFwiXG5cdFx0fSxcblx0XHRcIkVkbS5TaW5nbGVcIjoge1xuXHRcdFx0bW9kZWxUeXBlOiBcIkZsb2F0XCJcblx0XHR9LFxuXHRcdFwiRWRtLlN0cmluZ1wiOiB7XG5cdFx0XHRtb2RlbFR5cGU6IFwiU3RyaW5nXCJcblx0XHR9LFxuXHRcdFwiRWRtLlRpbWVcIjoge1xuXHRcdFx0bW9kZWxUeXBlOiBcIlRpbWVPZkRheVwiXG5cdFx0fSxcblx0XHRcIkVkbS5UaW1lT2ZEYXlcIjoge1xuXHRcdFx0bW9kZWxUeXBlOiBcIlRpbWVPZkRheVwiXG5cdFx0fSxcblx0XHRcIkVkbS5TdHJlYW1cIjoge1xuXHRcdFx0Ly9ubyBjb3JyZXNwb25kaW5nIG1vZGVsVHlwZSAtIGlnbm9yZSBmb3IgZmlsdGVyaW5nXG5cdFx0fVxuXHR9O1xuXHRyZXR1cm4gc1R5cGUgJiYgc1R5cGUgaW4gbURlZmF1bHRUeXBlRm9yRWRtVHlwZSAmJiBtRGVmYXVsdFR5cGVGb3JFZG1UeXBlW3NUeXBlXS5tb2RlbFR5cGU7XG59XG5jb25zdCBfZ2V0U2VsZWN0aW9uRmllbGRzID0gZnVuY3Rpb24gKFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRuYXZpZ2F0aW9uUGF0aDogc3RyaW5nLFxuXHRwcm9wZXJ0aWVzOiBBcnJheTxQcm9wZXJ0eT4gfCB1bmRlZmluZWQsXG5cdGluY2x1ZGVIaWRkZW46IGJvb2xlYW4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiB7XG5cdGNvbnN0IHNlbGVjdGlvbkZpZWxkTWFwOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4gPSB7fTtcblx0aWYgKHByb3BlcnRpZXMpIHtcblx0XHRwcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnR5OiBQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlQYXRoOiBzdHJpbmcgPSBwcm9wZXJ0eS5uYW1lO1xuXHRcdFx0Y29uc3QgZnVsbFBhdGg6IHN0cmluZyA9IChuYXZpZ2F0aW9uUGF0aCA/IGAke25hdmlnYXRpb25QYXRofS9gIDogXCJcIikgKyBwcm9wZXJ0eVBhdGg7XG5cdFx0XHRjb25zdCBzZWxlY3Rpb25GaWVsZCA9IF9jcmVhdGVGaWx0ZXJTZWxlY3Rpb25GaWVsZChlbnRpdHlUeXBlLCBwcm9wZXJ0eSwgZnVsbFBhdGgsIGluY2x1ZGVIaWRkZW4sIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0aWYgKHNlbGVjdGlvbkZpZWxkKSB7XG5cdFx0XHRcdHNlbGVjdGlvbkZpZWxkTWFwW2Z1bGxQYXRoXSA9IHNlbGVjdGlvbkZpZWxkO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBzZWxlY3Rpb25GaWVsZE1hcDtcbn07XG5cbmNvbnN0IF9nZXRTZWxlY3Rpb25GaWVsZHNCeVBhdGggPSBmdW5jdGlvbiAoXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdHByb3BlcnR5UGF0aHM6IEFycmF5PHN0cmluZz4gfCB1bmRlZmluZWQsXG5cdGluY2x1ZGVIaWRkZW46IGJvb2xlYW4sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiB7XG5cdGxldCBzZWxlY3Rpb25GaWVsZHM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiA9IHt9O1xuXHRpZiAocHJvcGVydHlQYXRocykge1xuXHRcdHByb3BlcnR5UGF0aHMuZm9yRWFjaCgocHJvcGVydHlQYXRoOiBzdHJpbmcpID0+IHtcblx0XHRcdGxldCBsb2NhbFNlbGVjdGlvbkZpZWxkczogUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGQ+O1xuXG5cdFx0XHRjb25zdCBwcm9wZXJ0eTogUHJvcGVydHkgfCBOYXZpZ2F0aW9uUHJvcGVydHkgPSBlbnRpdHlUeXBlLnJlc29sdmVQYXRoKHByb3BlcnR5UGF0aCk7XG5cdFx0XHRpZiAocHJvcGVydHkgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0XHRpZiAocHJvcGVydHkuX3R5cGUgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIpIHtcblx0XHRcdFx0Ly8gaGFuZGxlIG5hdmlnYXRpb24gcHJvcGVydGllc1xuXHRcdFx0XHRsb2NhbFNlbGVjdGlvbkZpZWxkcyA9IF9nZXRTZWxlY3Rpb25GaWVsZHMoXG5cdFx0XHRcdFx0ZW50aXR5VHlwZSxcblx0XHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0cHJvcGVydHkudGFyZ2V0VHlwZS5lbnRpdHlQcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdGluY2x1ZGVIaWRkZW4sXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIGlmIChwcm9wZXJ0eS50YXJnZXRUeXBlICE9PSB1bmRlZmluZWQgJiYgcHJvcGVydHkudGFyZ2V0VHlwZS5fdHlwZSA9PT0gXCJDb21wbGV4VHlwZVwiKSB7XG5cdFx0XHRcdC8vIGhhbmRsZSBDb21wbGV4VHlwZSBwcm9wZXJ0aWVzXG5cdFx0XHRcdGxvY2FsU2VsZWN0aW9uRmllbGRzID0gX2dldFNlbGVjdGlvbkZpZWxkcyhcblx0XHRcdFx0XHRlbnRpdHlUeXBlLFxuXHRcdFx0XHRcdHByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRwcm9wZXJ0eS50YXJnZXRUeXBlLnByb3BlcnRpZXMsXG5cdFx0XHRcdFx0aW5jbHVkZUhpZGRlbixcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBuYXZpZ2F0aW9uUGF0aCA9IHByb3BlcnR5UGF0aC5pbmNsdWRlcyhcIi9cIikgPyBwcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpLnNwbGljZSgwLCAxKS5qb2luKFwiL1wiKSA6IFwiXCI7XG5cdFx0XHRcdGxvY2FsU2VsZWN0aW9uRmllbGRzID0gX2dldFNlbGVjdGlvbkZpZWxkcyhlbnRpdHlUeXBlLCBuYXZpZ2F0aW9uUGF0aCwgW3Byb3BlcnR5XSwgaW5jbHVkZUhpZGRlbiwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0XHR9XG5cblx0XHRcdHNlbGVjdGlvbkZpZWxkcyA9IHtcblx0XHRcdFx0Li4uc2VsZWN0aW9uRmllbGRzLFxuXHRcdFx0XHQuLi5sb2NhbFNlbGVjdGlvbkZpZWxkc1xuXHRcdFx0fTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gc2VsZWN0aW9uRmllbGRzO1xufTtcblxuY29uc3QgX2dldEZpbHRlckZpZWxkID0gZnVuY3Rpb24gKFxuXHRmaWx0ZXJGaWVsZHM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPixcblx0cHJvcGVydHlQYXRoOiBzdHJpbmcsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGVcbik6IEZpbHRlckZpZWxkIHwgdW5kZWZpbmVkIHtcblx0bGV0IGZpbHRlckZpZWxkOiBGaWx0ZXJGaWVsZCB8IHVuZGVmaW5lZCA9IGZpbHRlckZpZWxkc1twcm9wZXJ0eVBhdGhdO1xuXG5cdGlmIChmaWx0ZXJGaWVsZCkge1xuXHRcdGRlbGV0ZSBmaWx0ZXJGaWVsZHNbcHJvcGVydHlQYXRoXTtcblx0fSBlbHNlIHtcblx0XHRmaWx0ZXJGaWVsZCA9IF9jcmVhdGVGaWx0ZXJTZWxlY3Rpb25GaWVsZChlbnRpdHlUeXBlLCBlbnRpdHlUeXBlLnJlc29sdmVQYXRoKHByb3BlcnR5UGF0aCksIHByb3BlcnR5UGF0aCwgdHJ1ZSwgY29udmVydGVyQ29udGV4dCk7XG5cdH1cblx0Ly8gZGVmaW5lZCBTZWxlY3Rpb25GaWVsZHMgYXJlIGF2YWlsYWJsZSBieSBkZWZhdWx0XG5cdGlmIChmaWx0ZXJGaWVsZCkge1xuXHRcdGZpbHRlckZpZWxkLmF2YWlsYWJpbGl0eSA9IGZpbHRlckZpZWxkLmF2YWlsYWJpbGl0eSA9PT0gQXZhaWxhYmlsaXR5VHlwZS5IaWRkZW4gPyBBdmFpbGFiaWxpdHlUeXBlLkhpZGRlbiA6IEF2YWlsYWJpbGl0eVR5cGUuRGVmYXVsdDtcblx0XHRmaWx0ZXJGaWVsZC5pc1BhcmFtZXRlciA9ICEhZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5SZXN1bHRDb250ZXh0O1xuXHR9IGVsc2Uge1xuXHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0RGlhZ25vc3RpY3MoKT8uYWRkSXNzdWUoSXNzdWVDYXRlZ29yeS5Bbm5vdGF0aW9uLCBJc3N1ZVNldmVyaXR5LkhpZ2gsIElzc3VlVHlwZS5NSVNTSU5HX1NFTEVDVElPTkZJRUxEKTtcblx0fVxuXHRyZXR1cm4gZmlsdGVyRmllbGQ7XG59O1xuXG5jb25zdCBfZ2V0RGVmYXVsdEZpbHRlckZpZWxkcyA9IGZ1bmN0aW9uIChcblx0YVNlbGVjdE9wdGlvbnM6IGFueVtdLFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRleGNsdWRlZEZpbHRlclByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+LFxuXHRhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHM6IFByb3BlcnR5UGF0aFtdXG4pOiBGaWx0ZXJGaWVsZFtdIHtcblx0Y29uc3Qgc2VsZWN0aW9uRmllbGRzOiBGaWx0ZXJGaWVsZFtdID0gW107XG5cdGNvbnN0IFVJU2VsZWN0aW9uRmllbGRzOiBhbnkgPSB7fTtcblx0Y29uc3QgcHJvcGVydGllcyA9IGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcztcblx0Ly8gVXNpbmcgZW50aXR5VHlwZSBpbnN0ZWFkIG9mIGVudGl0eVNldFxuXHRhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHM/LmZvckVhY2goKFNlbGVjdGlvbkZpZWxkKSA9PiB7XG5cdFx0VUlTZWxlY3Rpb25GaWVsZHNbU2VsZWN0aW9uRmllbGQudmFsdWVdID0gdHJ1ZTtcblx0fSk7XG5cdGlmIChhU2VsZWN0T3B0aW9ucyAmJiBhU2VsZWN0T3B0aW9ucy5sZW5ndGggPiAwKSB7XG5cdFx0YVNlbGVjdE9wdGlvbnM/LmZvckVhY2goKHNlbGVjdE9wdGlvbjogU2VsZWN0T3B0aW9uVHlwZSkgPT4ge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlOYW1lOiBhbnkgPSBzZWxlY3RPcHRpb24uUHJvcGVydHlOYW1lO1xuXHRcdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aDogc3RyaW5nID0gcHJvcGVydHlOYW1lLnZhbHVlO1xuXHRcdFx0Y29uc3QgY3VycmVudFNlbGVjdGlvbkZpZWxkczogYW55ID0ge307XG5cdFx0XHRhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHM/LmZvckVhY2goKFNlbGVjdGlvbkZpZWxkKSA9PiB7XG5cdFx0XHRcdGN1cnJlbnRTZWxlY3Rpb25GaWVsZHNbU2VsZWN0aW9uRmllbGQudmFsdWVdID0gdHJ1ZTtcblx0XHRcdH0pO1xuXHRcdFx0aWYgKCEoc1Byb3BlcnR5UGF0aCBpbiBleGNsdWRlZEZpbHRlclByb3BlcnRpZXMpKSB7XG5cdFx0XHRcdGlmICghKHNQcm9wZXJ0eVBhdGggaW4gY3VycmVudFNlbGVjdGlvbkZpZWxkcykpIHtcblx0XHRcdFx0XHRjb25zdCBGaWx0ZXJGaWVsZDogRmlsdGVyRmllbGQgfCB1bmRlZmluZWQgPSBnZXRGaWx0ZXJGaWVsZChzUHJvcGVydHlQYXRoLCBjb252ZXJ0ZXJDb250ZXh0LCBlbnRpdHlUeXBlKTtcblx0XHRcdFx0XHRpZiAoRmlsdGVyRmllbGQpIHtcblx0XHRcdFx0XHRcdHNlbGVjdGlvbkZpZWxkcy5wdXNoKEZpbHRlckZpZWxkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSBlbHNlIGlmIChwcm9wZXJ0aWVzKSB7XG5cdFx0cHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0eTogUHJvcGVydHkpID0+IHtcblx0XHRcdGNvbnN0IGRlZmF1bHRGaWx0ZXJWYWx1ZSA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LkZpbHRlckRlZmF1bHRWYWx1ZTtcblx0XHRcdGNvbnN0IHByb3BlcnR5UGF0aCA9IHByb3BlcnR5Lm5hbWU7XG5cdFx0XHRpZiAoIShwcm9wZXJ0eVBhdGggaW4gZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzKSkge1xuXHRcdFx0XHRpZiAoZGVmYXVsdEZpbHRlclZhbHVlICYmICEocHJvcGVydHlQYXRoIGluIFVJU2VsZWN0aW9uRmllbGRzKSkge1xuXHRcdFx0XHRcdGNvbnN0IEZpbHRlckZpZWxkOiBGaWx0ZXJGaWVsZCB8IHVuZGVmaW5lZCA9IGdldEZpbHRlckZpZWxkKHByb3BlcnR5UGF0aCwgY29udmVydGVyQ29udGV4dCwgZW50aXR5VHlwZSk7XG5cdFx0XHRcdFx0aWYgKEZpbHRlckZpZWxkKSB7XG5cdFx0XHRcdFx0XHRzZWxlY3Rpb25GaWVsZHMucHVzaChGaWx0ZXJGaWVsZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIHNlbGVjdGlvbkZpZWxkcztcbn07XG5cbi8qKlxuICogR2V0IGFsbCBwYXJhbWV0ZXIgZmlsdGVyIGZpZWxkcyBpbiBjYXNlIG9mIGEgcGFyYW1ldGVyaXplZCBzZXJ2aWNlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBwYXJhbWV0ZXIgRmlsdGVyRmllbGRzXG4gKi9cbmZ1bmN0aW9uIF9nZXRQYXJhbWV0ZXJGaWVsZHMoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IEZpbHRlckZpZWxkW10ge1xuXHRjb25zdCBkYXRhTW9kZWxPYmplY3RQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk7XG5cdGNvbnN0IHBhcmFtZXRlckVudGl0eVR5cGUgPSBkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0LmVudGl0eVR5cGU7XG5cdGNvbnN0IGlzUGFyYW1ldGVyaXplZCA9ICEhcGFyYW1ldGVyRW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5SZXN1bHRDb250ZXh0ICYmICFkYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVNldDtcblx0Y29uc3QgcGFyYW1ldGVyQ29udmVydGVyQ29udGV4dCA9XG5cdFx0aXNQYXJhbWV0ZXJpemVkICYmIGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVyQ29udGV4dEZvcihgLyR7ZGF0YU1vZGVsT2JqZWN0UGF0aC5zdGFydGluZ0VudGl0eVNldC5uYW1lfWApO1xuXG5cdHJldHVybiAoXG5cdFx0cGFyYW1ldGVyQ29udmVydGVyQ29udGV4dFxuXHRcdFx0PyBwYXJhbWV0ZXJFbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMubWFwKGZ1bmN0aW9uIChwcm9wZXJ0eSkge1xuXHRcdFx0XHRcdHJldHVybiBfZ2V0RmlsdGVyRmllbGQoXG5cdFx0XHRcdFx0XHR7fSBhcyBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4sXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eS5uYW1lLFxuXHRcdFx0XHRcdFx0cGFyYW1ldGVyQ29udmVydGVyQ29udGV4dCxcblx0XHRcdFx0XHRcdHBhcmFtZXRlckVudGl0eVR5cGVcblx0XHRcdFx0XHQpO1xuXHRcdFx0ICB9KVxuXHRcdFx0OiBbXVxuXHQpIGFzIEZpbHRlckZpZWxkW107XG59XG5cbi8qKlxuICogRGV0ZXJtaW5lcyBpZiB0aGUgRmlsdGVyQmFyIHNlYXJjaCBmaWVsZCBpcyBoaWRkZW4gb3Igbm90LlxuICpcbiAqIEBwYXJhbSBsaXN0UmVwb3J0VGFibGVzIFRoZSBsaXN0IHJlcG9ydCB0YWJsZXNcbiAqIEBwYXJhbSBjaGFydHMgVGhlIEFMUCBjaGFydHNcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIGluZm9ybWF0aW9uIGlmIHRoZSBGaWx0ZXJCYXIgc2VhcmNoIGZpZWxkIGlzIGhpZGRlbiBvciBub3RcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEZpbHRlckJhcmhpZGVCYXNpY1NlYXJjaCA9IGZ1bmN0aW9uIChcblx0bGlzdFJlcG9ydFRhYmxlczogVGFibGVWaXN1YWxpemF0aW9uW10sXG5cdGNoYXJ0czogQ2hhcnRWaXN1YWxpemF0aW9uW10sXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IGJvb2xlYW4ge1xuXHQvLyBDaGVjayBpZiBjaGFydHMgYWxsb3cgc2VhcmNoXG5cdGNvbnN0IG5vU2VhcmNoSW5DaGFydHMgPSBjaGFydHMubGVuZ3RoID09PSAwIHx8IGNoYXJ0cy5ldmVyeSgoY2hhcnQpID0+ICFjaGFydC5hcHBseVN1cHBvcnRlZC5lbmFibGVTZWFyY2gpO1xuXG5cdC8vIENoZWNrIGlmIGFsbCB0YWJsZXMgYXJlIGFuYWx5dGljYWwgYW5kIG5vbmUgb2YgdGhlbSBhbGxvdyBmb3Igc2VhcmNoXG5cdGNvbnN0IG5vU2VhcmNoSW5UYWJsZXMgPVxuXHRcdGxpc3RSZXBvcnRUYWJsZXMubGVuZ3RoID09PSAwIHx8IGxpc3RSZXBvcnRUYWJsZXMuZXZlcnkoKHRhYmxlKSA9PiB0YWJsZS5lbmFibGVBbmFseXRpY3MgJiYgIXRhYmxlLmVuYWJsZUFuYWx5dGljc1NlYXJjaCk7XG5cblx0Y29uc3QgY29udGV4dFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnRleHRQYXRoKCk7XG5cdGlmIChjb250ZXh0UGF0aCAmJiBub1NlYXJjaEluQ2hhcnRzICYmIG5vU2VhcmNoSW5UYWJsZXMpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbi8qKlxuICogUmV0cmlldmVzIGZpbHRlciBmaWVsZHMgZnJvbSB0aGUgbWFuaWZlc3QuXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIGN1cnJlbnQgZW50aXR5VHlwZVxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgZmlsdGVyIGZpZWxkcyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICovXG5leHBvcnQgY29uc3QgZ2V0TWFuaWZlc3RGaWx0ZXJGaWVsZHMgPSBmdW5jdGlvbiAoXG5cdGVudGl0eVR5cGU6IEVudGl0eVR5cGUsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUVsZW1lbnRGaWx0ZXJGaWVsZD4ge1xuXHRjb25zdCBmYkNvbmZpZzogRmlsdGVyTWFuaWZlc3RDb25maWd1cmF0aW9uID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5nZXRGaWx0ZXJDb25maWd1cmF0aW9uKCk7XG5cdGNvbnN0IGRlZmluZWRGaWx0ZXJGaWVsZHM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkTWFuaWZlc3RDb25maWd1cmF0aW9uPiA9IGZiQ29uZmlnPy5maWx0ZXJGaWVsZHMgfHwge307XG5cdGNvbnN0IHNlbGVjdGlvbkZpZWxkczogUmVjb3JkPHN0cmluZywgRmlsdGVyRmllbGQ+ID0gX2dldFNlbGVjdGlvbkZpZWxkc0J5UGF0aChcblx0XHRlbnRpdHlUeXBlLFxuXHRcdE9iamVjdC5rZXlzKGRlZmluZWRGaWx0ZXJGaWVsZHMpLm1hcCgoa2V5KSA9PiBLZXlIZWxwZXIuZ2V0UGF0aEZyb21TZWxlY3Rpb25GaWVsZEtleShrZXkpKSxcblx0XHR0cnVlLFxuXHRcdGNvbnZlcnRlckNvbnRleHRcblx0KTtcblx0Y29uc3QgZmlsdGVyRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21FbGVtZW50RmlsdGVyRmllbGQ+ID0ge307XG5cblx0Zm9yIChjb25zdCBzS2V5IGluIGRlZmluZWRGaWx0ZXJGaWVsZHMpIHtcblx0XHRjb25zdCBmaWx0ZXJGaWVsZCA9IGRlZmluZWRGaWx0ZXJGaWVsZHNbc0tleV07XG5cdFx0Y29uc3QgcHJvcGVydHlOYW1lID0gS2V5SGVscGVyLmdldFBhdGhGcm9tU2VsZWN0aW9uRmllbGRLZXkoc0tleSk7XG5cdFx0Y29uc3Qgc2VsZWN0aW9uRmllbGQgPSBzZWxlY3Rpb25GaWVsZHNbcHJvcGVydHlOYW1lXTtcblx0XHRjb25zdCB0eXBlID0gZmlsdGVyRmllbGQudHlwZSA9PT0gXCJTbG90XCIgPyBmaWx0ZXJGaWVsZFR5cGUuU2xvdCA6IGZpbHRlckZpZWxkVHlwZS5EZWZhdWx0O1xuXHRcdGNvbnN0IHZpc3VhbEZpbHRlciA9XG5cdFx0XHRmaWx0ZXJGaWVsZCAmJiBmaWx0ZXJGaWVsZD8udmlzdWFsRmlsdGVyXG5cdFx0XHRcdD8gZ2V0VmlzdWFsRmlsdGVycyhlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0LCBzS2V5LCBkZWZpbmVkRmlsdGVyRmllbGRzKVxuXHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRmaWx0ZXJGaWVsZHNbc0tleV0gPSB7XG5cdFx0XHRrZXk6IHNLZXksXG5cdFx0XHR0eXBlOiB0eXBlLFxuXHRcdFx0YW5ub3RhdGlvblBhdGg6IHNlbGVjdGlvbkZpZWxkPy5hbm5vdGF0aW9uUGF0aCxcblx0XHRcdGNvbmRpdGlvblBhdGg6IHNlbGVjdGlvbkZpZWxkPy5jb25kaXRpb25QYXRoIHx8IHByb3BlcnR5TmFtZSxcblx0XHRcdHRlbXBsYXRlOiBmaWx0ZXJGaWVsZC50ZW1wbGF0ZSxcblx0XHRcdGxhYmVsOiBmaWx0ZXJGaWVsZC5sYWJlbCxcblx0XHRcdHBvc2l0aW9uOiBmaWx0ZXJGaWVsZC5wb3NpdGlvbiB8fCB7IHBsYWNlbWVudDogUGxhY2VtZW50LkFmdGVyIH0sXG5cdFx0XHRhdmFpbGFiaWxpdHk6IGZpbHRlckZpZWxkLmF2YWlsYWJpbGl0eSB8fCBBdmFpbGFiaWxpdHlUeXBlLkRlZmF1bHQsXG5cdFx0XHRzZXR0aW5nczogZmlsdGVyRmllbGQuc2V0dGluZ3MsXG5cdFx0XHR2aXN1YWxGaWx0ZXI6IHZpc3VhbEZpbHRlcixcblx0XHRcdHJlcXVpcmVkOiBmaWx0ZXJGaWVsZC5yZXF1aXJlZFxuXHRcdH07XG5cdH1cblx0cmV0dXJuIGZpbHRlckZpZWxkcztcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRGaWx0ZXJGaWVsZCA9IGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGg6IHN0cmluZywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCwgZW50aXR5VHlwZTogRW50aXR5VHlwZSkge1xuXHRyZXR1cm4gX2dldEZpbHRlckZpZWxkKHt9LCBwcm9wZXJ0eVBhdGgsIGNvbnZlcnRlckNvbnRleHQsIGVudGl0eVR5cGUpO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEZpbHRlclJlc3RyaWN0aW9ucyA9IGZ1bmN0aW9uIChvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbjogYW55LCBzUmVzdHJpY3Rpb246IGFueSkge1xuXHRpZiAoc1Jlc3RyaWN0aW9uID09PSBcIlJlcXVpcmVkUHJvcGVydGllc1wiIHx8IHNSZXN0cmljdGlvbiA9PT0gXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiKSB7XG5cdFx0bGV0IGFQcm9wcyA9IFtdO1xuXHRcdGlmIChvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiAmJiBvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbltzUmVzdHJpY3Rpb25dKSB7XG5cdFx0XHRhUHJvcHMgPSBvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbltzUmVzdHJpY3Rpb25dLm1hcChmdW5jdGlvbiAob1Byb3BlcnR5OiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoIHx8IG9Qcm9wZXJ0eS52YWx1ZTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gYVByb3BzO1xuXHR9IGVsc2UgaWYgKHNSZXN0cmljdGlvbiA9PT0gXCJGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnNcIikge1xuXHRcdGNvbnN0IG1BbGxvd2VkRXhwcmVzc2lvbnMgPSB7fSBhcyBhbnk7XG5cdFx0aWYgKG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uICYmIG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMpIHtcblx0XHRcdG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAob1Byb3BlcnR5OiBhbnkpIHtcblx0XHRcdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdFx0XHRpZiAobUFsbG93ZWRFeHByZXNzaW9uc1tvUHJvcGVydHkuUHJvcGVydHkudmFsdWVdKSB7XG5cdFx0XHRcdFx0bUFsbG93ZWRFeHByZXNzaW9uc1tvUHJvcGVydHkuUHJvcGVydHkudmFsdWVdLnB1c2gob1Byb3BlcnR5LkFsbG93ZWRFeHByZXNzaW9ucyk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bUFsbG93ZWRFeHByZXNzaW9uc1tvUHJvcGVydHkuUHJvcGVydHkudmFsdWVdID0gW29Qcm9wZXJ0eS5BbGxvd2VkRXhwcmVzc2lvbnNdO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIG1BbGxvd2VkRXhwcmVzc2lvbnM7XG5cdH1cblx0cmV0dXJuIG9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uO1xufTtcblxuY29uc3QgZ2V0U2VhcmNoRmlsdGVyUHJvcGVydHlJbmZvID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4ge1xuXHRcdG5hbWU6IFwiJHNlYXJjaFwiLFxuXHRcdHBhdGg6IFwiJHNlYXJjaFwiLFxuXHRcdGRhdGFUeXBlOiBzU3RyaW5nRGF0YVR5cGUsXG5cdFx0bWF4Q29uZGl0aW9uczogMVxuXHR9O1xufTtcblxuY29uc3QgZ2V0RWRpdFN0YXRlRmlsdGVyUHJvcGVydHlJbmZvID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4ge1xuXHRcdG5hbWU6IFwiJGVkaXRTdGF0ZVwiLFxuXHRcdHBhdGg6IFwiJGVkaXRTdGF0ZVwiLFxuXHRcdGdyb3VwTGFiZWw6IFwiXCIsXG5cdFx0Z3JvdXA6IFwiXCIsXG5cdFx0ZGF0YVR5cGU6IHNTdHJpbmdEYXRhVHlwZSxcblx0XHRoaWRkZW5GaWx0ZXI6IGZhbHNlXG5cdH07XG59O1xuXG5jb25zdCBnZXRTZWFyY2hSZXN0cmljdGlvbnMgPSBmdW5jdGlvbiAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCkge1xuXHRsZXQgc2VhcmNoUmVzdHJpY3Rpb25zO1xuXHRpZiAoIU1vZGVsSGVscGVyLmlzU2luZ2xldG9uKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCkpKSB7XG5cdFx0Y29uc3QgY2FwYWJpbGl0ZXMgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpPy5hbm5vdGF0aW9ucz8uQ2FwYWJpbGl0aWVzIGFzIEVudGl0eVNldEFubm90YXRpb25zX0NhcGFiaWxpdGllcztcblx0XHRzZWFyY2hSZXN0cmljdGlvbnMgPSBjYXBhYmlsaXRlcz8uU2VhcmNoUmVzdHJpY3Rpb25zO1xuXHR9XG5cdHJldHVybiBzZWFyY2hSZXN0cmljdGlvbnM7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0TmF2aWdhdGlvblJlc3RyaWN0aW9ucyA9IGZ1bmN0aW9uIChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LCBzTmF2aWdhdGlvblBhdGg6IHN0cmluZykge1xuXHRjb25zdCBvTmF2aWdhdGlvblJlc3RyaWN0aW9uczogYW55ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKT8uYW5ub3RhdGlvbnM/LkNhcGFiaWxpdGllcz8uTmF2aWdhdGlvblJlc3RyaWN0aW9ucztcblx0Y29uc3QgYVJlc3RyaWN0ZWRQcm9wZXJ0aWVzID0gb05hdmlnYXRpb25SZXN0cmljdGlvbnMgJiYgb05hdmlnYXRpb25SZXN0cmljdGlvbnMuUmVzdHJpY3RlZFByb3BlcnRpZXM7XG5cdHJldHVybiAoXG5cdFx0YVJlc3RyaWN0ZWRQcm9wZXJ0aWVzICYmXG5cdFx0YVJlc3RyaWN0ZWRQcm9wZXJ0aWVzLmZpbmQoZnVuY3Rpb24gKG9SZXN0cmljdGVkUHJvcGVydHk6IGFueSkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0b1Jlc3RyaWN0ZWRQcm9wZXJ0eSAmJlxuXHRcdFx0XHRvUmVzdHJpY3RlZFByb3BlcnR5Lk5hdmlnYXRpb25Qcm9wZXJ0eSAmJlxuXHRcdFx0XHQob1Jlc3RyaWN0ZWRQcm9wZXJ0eS5OYXZpZ2F0aW9uUHJvcGVydHkuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPT09IHNOYXZpZ2F0aW9uUGF0aCB8fFxuXHRcdFx0XHRcdG9SZXN0cmljdGVkUHJvcGVydHkuTmF2aWdhdGlvblByb3BlcnR5LnZhbHVlID09PSBzTmF2aWdhdGlvblBhdGgpXG5cdFx0XHQpO1xuXHRcdH0pXG5cdCk7XG59O1xuXG5jb25zdCBfZmV0Y2hCYXNpY1Byb3BlcnR5SW5mbyA9IGZ1bmN0aW9uIChvRmlsdGVyRmllbGRJbmZvOiBhbnkpIHtcblx0cmV0dXJuIHtcblx0XHRrZXk6IG9GaWx0ZXJGaWVsZEluZm8ua2V5LFxuXHRcdGFubm90YXRpb25QYXRoOiBvRmlsdGVyRmllbGRJbmZvLmFubm90YXRpb25QYXRoLFxuXHRcdGNvbmRpdGlvblBhdGg6IG9GaWx0ZXJGaWVsZEluZm8uY29uZGl0aW9uUGF0aCxcblx0XHRuYW1lOiBvRmlsdGVyRmllbGRJbmZvLmNvbmRpdGlvblBhdGgsXG5cdFx0bGFiZWw6IG9GaWx0ZXJGaWVsZEluZm8ubGFiZWwsXG5cdFx0aGlkZGVuRmlsdGVyOiBvRmlsdGVyRmllbGRJbmZvLmF2YWlsYWJpbGl0eSA9PT0gXCJIaWRkZW5cIixcblx0XHRkaXNwbGF5OiBcIlZhbHVlXCIsXG5cdFx0aXNQYXJhbWV0ZXI6IG9GaWx0ZXJGaWVsZEluZm8uaXNQYXJhbWV0ZXIsXG5cdFx0Y2FzZVNlbnNpdGl2ZTogb0ZpbHRlckZpZWxkSW5mby5jYXNlU2Vuc2l0aXZlLFxuXHRcdGF2YWlsYWJpbGl0eTogb0ZpbHRlckZpZWxkSW5mby5hdmFpbGFiaWxpdHksXG5cdFx0cG9zaXRpb246IG9GaWx0ZXJGaWVsZEluZm8ucG9zaXRpb24sXG5cdFx0dHlwZTogb0ZpbHRlckZpZWxkSW5mby50eXBlLFxuXHRcdHRlbXBsYXRlOiBvRmlsdGVyRmllbGRJbmZvLnRlbXBsYXRlLFxuXHRcdG1lbnU6IG9GaWx0ZXJGaWVsZEluZm8ubWVudSxcblx0XHRyZXF1aXJlZDogb0ZpbHRlckZpZWxkSW5mby5yZXF1aXJlZFxuXHR9O1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb24gPSBmdW5jdGlvbiAoYUV4cHJlc3Npb25zOiBhbnkpIHtcblx0Y29uc3QgYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5ID0gW1xuXHRcdFwiU2luZ2xlVmFsdWVcIixcblx0XHRcIk11bHRpVmFsdWVcIixcblx0XHRcIlNpbmdsZVJhbmdlXCIsXG5cdFx0XCJNdWx0aVJhbmdlXCIsXG5cdFx0XCJTZWFyY2hFeHByZXNzaW9uXCIsXG5cdFx0XCJNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXCJcblx0XTtcblxuXHRhRXhwcmVzc2lvbnMuc29ydChmdW5jdGlvbiAoYTogYW55LCBiOiBhbnkpIHtcblx0XHRyZXR1cm4gYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5LmluZGV4T2YoYSkgLSBhQWxsb3dlZEV4cHJlc3Npb25zUHJpb3JpdHkuaW5kZXhPZihiKTtcblx0fSk7XG5cblx0cmV0dXJuIGFFeHByZXNzaW9uc1swXTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaXNwbGF5TW9kZSA9IGZ1bmN0aW9uIChvUHJvcGVydHlBbm5vdGF0aW9uczogYW55LCBvQ29sbGVjdGlvbkFubm90YXRpb25zOiBhbnkpIHtcblx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb1Byb3BlcnR5QW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dCxcblx0XHRvVGV4dEFycmFuZ21lbnRBbm5vdGF0aW9uID1cblx0XHRcdG9UZXh0QW5ub3RhdGlvbiAmJlxuXHRcdFx0KChvUHJvcGVydHlBbm5vdGF0aW9ucyAmJiBvUHJvcGVydHlBbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0Py5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudCkgfHxcblx0XHRcdFx0KG9Db2xsZWN0aW9uQW5ub3RhdGlvbnMgJiYgb0NvbGxlY3Rpb25Bbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudCkpO1xuXG5cdGlmIChvVGV4dEFycmFuZ21lbnRBbm5vdGF0aW9uKSB7XG5cdFx0aWYgKG9UZXh0QXJyYW5nbWVudEFubm90YXRpb24udmFsdWVPZigpID09PSBcIlVJLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dE9ubHlcIikge1xuXHRcdFx0cmV0dXJuIFwiRGVzY3JpcHRpb25cIjtcblx0XHR9IGVsc2UgaWYgKG9UZXh0QXJyYW5nbWVudEFubm90YXRpb24udmFsdWVPZigpID09PSBcIlVJLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dExhc3RcIikge1xuXHRcdFx0cmV0dXJuIFwiVmFsdWVEZXNjcmlwdGlvblwiO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJEZXNjcmlwdGlvblZhbHVlXCI7IC8vVGV4dEZpcnN0XG5cdH1cblx0cmV0dXJuIG9UZXh0QW5ub3RhdGlvbiA/IFwiRGVzY3JpcHRpb25WYWx1ZVwiIDogXCJWYWx1ZVwiO1xufTtcblxuZXhwb3J0IGNvbnN0IGZldGNoUHJvcGVydHlJbmZvID0gZnVuY3Rpb24gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsIG9GaWx0ZXJGaWVsZEluZm86IGFueSwgb1R5cGVDb25maWc6IGFueSkge1xuXHRsZXQgb1Byb3BlcnR5SW5mbyA9IF9mZXRjaEJhc2ljUHJvcGVydHlJbmZvKG9GaWx0ZXJGaWVsZEluZm8pO1xuXHRjb25zdCBzQW5ub3RhdGlvblBhdGggPSBvRmlsdGVyRmllbGRJbmZvLmFubm90YXRpb25QYXRoO1xuXG5cdGlmICghc0Fubm90YXRpb25QYXRoKSB7XG5cdFx0cmV0dXJuIG9Qcm9wZXJ0eUluZm87XG5cdH1cblx0Y29uc3QgdGFyZ2V0UHJvcGVydHlPYmplY3QgPSBjb252ZXJ0ZXJDb250ZXh0LmdldENvbnZlcnRlckNvbnRleHRGb3Ioc0Fubm90YXRpb25QYXRoKS5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCkudGFyZ2V0T2JqZWN0O1xuXG5cdGNvbnN0IG9Qcm9wZXJ0eUFubm90YXRpb25zID0gdGFyZ2V0UHJvcGVydHlPYmplY3Q/LmFubm90YXRpb25zO1xuXHRjb25zdCBvQ29sbGVjdGlvbkFubm90YXRpb25zID0gY29udmVydGVyQ29udGV4dD8uZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM7XG5cblx0Y29uc3Qgb0Zvcm1hdE9wdGlvbnMgPSBvVHlwZUNvbmZpZy5mb3JtYXRPcHRpb25zO1xuXHRjb25zdCBvQ29uc3RyYWludHMgPSBvVHlwZUNvbmZpZy5jb25zdHJhaW50cztcblx0b1Byb3BlcnR5SW5mbyA9IE9iamVjdC5hc3NpZ24ob1Byb3BlcnR5SW5mbywge1xuXHRcdGZvcm1hdE9wdGlvbnM6IG9Gb3JtYXRPcHRpb25zLFxuXHRcdGNvbnN0cmFpbnRzOiBvQ29uc3RyYWludHMsXG5cdFx0ZGlzcGxheTogZGlzcGxheU1vZGUob1Byb3BlcnR5QW5ub3RhdGlvbnMsIG9Db2xsZWN0aW9uQW5ub3RhdGlvbnMpXG5cdH0pO1xuXHRyZXR1cm4gb1Byb3BlcnR5SW5mbztcbn07XG5cbmV4cG9ydCBjb25zdCBpc011bHRpVmFsdWUgPSBmdW5jdGlvbiAob1Byb3BlcnR5OiBhbnkpIHtcblx0bGV0IGJJc011bHRpVmFsdWUgPSB0cnVlO1xuXHQvL1NpbmdsZVZhbHVlIHwgTXVsdGlWYWx1ZSB8IFNpbmdsZVJhbmdlIHwgTXVsdGlSYW5nZSB8IFNlYXJjaEV4cHJlc3Npb24gfCBNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXG5cdHN3aXRjaCAob1Byb3BlcnR5LmZpbHRlckV4cHJlc3Npb24pIHtcblx0XHRjYXNlIFwiU2VhcmNoRXhwcmVzc2lvblwiOlxuXHRcdGNhc2UgXCJTaW5nbGVSYW5nZVwiOlxuXHRcdGNhc2UgXCJTaW5nbGVWYWx1ZVwiOlxuXHRcdFx0YklzTXVsdGlWYWx1ZSA9IGZhbHNlO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGJyZWFrO1xuXHR9XG5cdGlmIChvUHJvcGVydHkudHlwZSAmJiBvUHJvcGVydHkudHlwZS5pbmRleE9mKFwiQm9vbGVhblwiKSA+IDApIHtcblx0XHRiSXNNdWx0aVZhbHVlID0gZmFsc2U7XG5cdH1cblx0cmV0dXJuIGJJc011bHRpVmFsdWU7XG59O1xuXG5jb25zdCBfaXNGaWx0ZXJhYmxlTmF2aWdhdGlvblByb3BlcnR5ID0gZnVuY3Rpb24gKFxuXHRlbnRyeTogRGF0YUZpZWxkQWJzdHJhY3RUeXBlc1xuKTogZW50cnkgaXMgQW5ub3RhdGlvblRlcm08RGF0YUZpZWxkIHwgRGF0YUZpZWxkV2l0aFVybCB8IERhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aD4ge1xuXHRyZXR1cm4gKFxuXHRcdChlbnRyeS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkIHx8XG5cdFx0XHRlbnRyeS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybCB8fFxuXHRcdFx0ZW50cnkuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aCkgJiZcblx0XHRlbnRyeS5WYWx1ZS5wYXRoLmluY2x1ZGVzKFwiL1wiKVxuXHQpO1xufTtcblxuY29uc3QgZ2V0QW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhID0gZnVuY3Rpb24gKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRsclRhYmxlczogVGFibGVWaXN1YWxpemF0aW9uW10gPSBbXSxcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZyA9IFwiXCIsXG5cdGluY2x1ZGVIaWRkZW46IGJvb2xlYW4gPSBmYWxzZSxcblx0bGluZUl0ZW1UZXJtPzogc3RyaW5nXG4pIHtcblx0Ly8gRmV0Y2ggYWxsIHNlbGVjdGlvblZhcmlhbnRzIGRlZmluZWQgaW4gdGhlIGRpZmZlcmVudCB2aXN1YWxpemF0aW9ucyBhbmQgZGlmZmVyZW50IHZpZXdzIChtdWx0aSB0YWJsZSBtb2RlKVxuXHRjb25zdCBzZWxlY3Rpb25WYXJpYW50czogU2VsZWN0aW9uVmFyaWFudENvbmZpZ3VyYXRpb25bXSA9IGdldFNlbGVjdGlvblZhcmlhbnRzKGxyVGFibGVzLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHQvLyBjcmVhdGUgYSBtYXAgb2YgcHJvcGVydGllcyB0byBiZSB1c2VkIGluIHNlbGVjdGlvbiB2YXJpYW50c1xuXHRjb25zdCBleGNsdWRlZEZpbHRlclByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+ID0gZ2V0RXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzKHNlbGVjdGlvblZhcmlhbnRzKTtcblx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHQvL0ZpbHRlcnMgd2hpY2ggaGFzIHRvIGJlIGFkZGVkIHdoaWNoIGlzIHBhcnQgb2YgU1YvRGVmYXVsdCBhbm5vdGF0aW9ucyBidXQgbm90IHByZXNlbnQgaW4gdGhlIFNlbGVjdGlvbkZpZWxkc1xuXHRjb25zdCBhbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZHMgPSAoKGFubm90YXRpb25QYXRoICYmIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZUFubm90YXRpb24oYW5ub3RhdGlvblBhdGgpPy5hbm5vdGF0aW9uKSB8fFxuXHRcdGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5TZWxlY3Rpb25GaWVsZHMgfHxcblx0XHRbXSkgYXMgUHJvcGVydHlQYXRoW107XG5cblx0Y29uc3QgbmF2UHJvcGVydGllczogc3RyaW5nW10gPSBbXTtcblx0aWYgKGxyVGFibGVzLmxlbmd0aCA9PT0gMCAmJiAhIWxpbmVJdGVtVGVybSkge1xuXHRcdChjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKGxpbmVJdGVtVGVybSkuYW5ub3RhdGlvbiBhcyBMaW5lSXRlbSk/LmZvckVhY2goKGVudHJ5KSA9PiB7XG5cdFx0XHRpZiAoX2lzRmlsdGVyYWJsZU5hdmlnYXRpb25Qcm9wZXJ0eShlbnRyeSkpIHtcblx0XHRcdFx0Y29uc3QgZW50aXR5UGF0aCA9IGVudHJ5LlZhbHVlLnBhdGguc2xpY2UoMCwgZW50cnkuVmFsdWUucGF0aC5sYXN0SW5kZXhPZihcIi9cIikpO1xuXHRcdFx0XHRpZiAoIW5hdlByb3BlcnRpZXMuaW5jbHVkZXMoZW50aXR5UGF0aCkpIHtcblx0XHRcdFx0XHRuYXZQcm9wZXJ0aWVzLnB1c2goZW50aXR5UGF0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8vIGNyZWF0ZSBhIG1hcCBvZiBhbGwgcG90ZW50aWFsIGZpbHRlciBmaWVsZHMgYmFzZWQgb24uLi5cblx0Y29uc3QgZmlsdGVyRmllbGRzOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJGaWVsZD4gPSB7XG5cdFx0Ly8gLi4ubm9uIGhpZGRlbiBwcm9wZXJ0aWVzIG9mIHRoZSBlbnRpdHlcblx0XHQuLi5fZ2V0U2VsZWN0aW9uRmllbGRzKGVudGl0eVR5cGUsIFwiXCIsIGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcywgaW5jbHVkZUhpZGRlbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0Ly8gLi4uIG5vbiBoaWRkZW4gcHJvcGVydGllcyBvZiBuYXZpZ2F0aW9uIHByb3BlcnRpZXNcblx0XHQuLi5fZ2V0U2VsZWN0aW9uRmllbGRzQnlQYXRoKGVudGl0eVR5cGUsIG5hdlByb3BlcnRpZXMsIGZhbHNlLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHQvLyAuLi5hZGRpdGlvbmFsIG1hbmlmZXN0IGRlZmluZWQgbmF2aWdhdGlvbiBwcm9wZXJ0aWVzXG5cdFx0Li4uX2dldFNlbGVjdGlvbkZpZWxkc0J5UGF0aChcblx0XHRcdGVudGl0eVR5cGUsXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0V3JhcHBlcigpLmdldEZpbHRlckNvbmZpZ3VyYXRpb24oKS5uYXZpZ2F0aW9uUHJvcGVydGllcyxcblx0XHRcdGluY2x1ZGVIaWRkZW4sXG5cdFx0XHRjb252ZXJ0ZXJDb250ZXh0XG5cdFx0KVxuXHR9O1xuXHRsZXQgYVNlbGVjdE9wdGlvbnM6IGFueVtdID0gW107XG5cdGNvbnN0IHNlbGVjdGlvblZhcmlhbnQgPSBnZXRTZWxlY3Rpb25WYXJpYW50KGVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRpZiAoc2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdGFTZWxlY3RPcHRpb25zID0gc2VsZWN0aW9uVmFyaWFudC5TZWxlY3RPcHRpb25zO1xuXHR9XG5cblx0Y29uc3QgcHJvcGVydHlJbmZvRmllbGRzOiBhbnkgPVxuXHRcdGFubm90YXRlZFNlbGVjdGlvbkZpZWxkcz8ucmVkdWNlKChzZWxlY3Rpb25GaWVsZHM6IEZpbHRlckZpZWxkW10sIHNlbGVjdGlvbkZpZWxkKSA9PiB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSBzZWxlY3Rpb25GaWVsZC52YWx1ZTtcblx0XHRcdGlmICghKHByb3BlcnR5UGF0aCBpbiBleGNsdWRlZEZpbHRlclByb3BlcnRpZXMpKSB7XG5cdFx0XHRcdGxldCBuYXZpZ2F0aW9uUGF0aDogc3RyaW5nO1xuXHRcdFx0XHRpZiAoYW5ub3RhdGlvblBhdGguc3RhcnRzV2l0aChcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIikpIHtcblx0XHRcdFx0XHRuYXZpZ2F0aW9uUGF0aCA9IFwiXCI7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bmF2aWdhdGlvblBhdGggPSBhbm5vdGF0aW9uUGF0aC5zcGxpdChcIi9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCIpWzBdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgZmlsdGVyUHJvcGVydHlQYXRoID0gbmF2aWdhdGlvblBhdGggPyBuYXZpZ2F0aW9uUGF0aCArIFwiL1wiICsgcHJvcGVydHlQYXRoIDogcHJvcGVydHlQYXRoO1xuXHRcdFx0XHRjb25zdCBmaWx0ZXJGaWVsZDogRmlsdGVyRmllbGQgfCB1bmRlZmluZWQgPSBfZ2V0RmlsdGVyRmllbGQoXG5cdFx0XHRcdFx0ZmlsdGVyRmllbGRzLFxuXHRcdFx0XHRcdGZpbHRlclByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdGVudGl0eVR5cGVcblx0XHRcdFx0KTtcblx0XHRcdFx0aWYgKGZpbHRlckZpZWxkKSB7XG5cdFx0XHRcdFx0ZmlsdGVyRmllbGQuZ3JvdXAgPSBcIlwiO1xuXHRcdFx0XHRcdGZpbHRlckZpZWxkLmdyb3VwTGFiZWwgPSBcIlwiO1xuXHRcdFx0XHRcdHNlbGVjdGlvbkZpZWxkcy5wdXNoKGZpbHRlckZpZWxkKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHNlbGVjdGlvbkZpZWxkcztcblx0XHR9LCBbXSkgfHwgW107XG5cblx0Y29uc3QgZGVmYXVsdEZpbHRlckZpZWxkcyA9IF9nZXREZWZhdWx0RmlsdGVyRmllbGRzKFxuXHRcdGFTZWxlY3RPcHRpb25zLFxuXHRcdGVudGl0eVR5cGUsXG5cdFx0Y29udmVydGVyQ29udGV4dCxcblx0XHRleGNsdWRlZEZpbHRlclByb3BlcnRpZXMsXG5cdFx0YW5ub3RhdGVkU2VsZWN0aW9uRmllbGRzXG5cdCk7XG5cblx0cmV0dXJuIHtcblx0XHRleGNsdWRlZEZpbHRlclByb3BlcnRpZXM6IGV4Y2x1ZGVkRmlsdGVyUHJvcGVydGllcyxcblx0XHRlbnRpdHlUeXBlOiBlbnRpdHlUeXBlLFxuXHRcdGFubm90YXRlZFNlbGVjdGlvbkZpZWxkczogYW5ub3RhdGVkU2VsZWN0aW9uRmllbGRzLFxuXHRcdGZpbHRlckZpZWxkczogZmlsdGVyRmllbGRzLFxuXHRcdHByb3BlcnR5SW5mb0ZpZWxkczogcHJvcGVydHlJbmZvRmllbGRzLFxuXHRcdGRlZmF1bHRGaWx0ZXJGaWVsZHM6IGRlZmF1bHRGaWx0ZXJGaWVsZHNcblx0fTtcbn07XG5cbmV4cG9ydCBjb25zdCBmZXRjaFR5cGVDb25maWcgPSBmdW5jdGlvbiAocHJvcGVydHk6IFByb3BlcnR5KSB7XG5cdGNvbnN0IG9UeXBlQ29uZmlnID0gZ2V0VHlwZUNvbmZpZyhwcm9wZXJ0eSwgcHJvcGVydHk/LnR5cGUpO1xuXHRpZiAocHJvcGVydHk/LnR5cGUgPT09IHNFZG1TdHJpbmcgJiYgKG9UeXBlQ29uZmlnLmNvbnN0cmFpbnRzLm51bGxhYmxlID09PSB1bmRlZmluZWQgfHwgb1R5cGVDb25maWcuY29uc3RyYWludHMubnVsbGFibGUgPT09IHRydWUpKSB7XG5cdFx0b1R5cGVDb25maWcuZm9ybWF0T3B0aW9ucy5wYXJzZUtlZXBzRW1wdHlTdHJpbmcgPSBmYWxzZTtcblx0fVxuXHRyZXR1cm4gb1R5cGVDb25maWc7XG59O1xuXG5leHBvcnQgY29uc3QgYXNzaWduRGF0YVR5cGVUb1Byb3BlcnR5SW5mbyA9IGZ1bmN0aW9uIChcblx0cHJvcGVydHlJbmZvRmllbGQ6IGFueSxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0YVJlcXVpcmVkUHJvcHM6IGFueSxcblx0YVR5cGVDb25maWc6IGFueVxuKSB7XG5cdGxldCBvUHJvcGVydHlJbmZvOiBhbnkgPSBmZXRjaFByb3BlcnR5SW5mbyhjb252ZXJ0ZXJDb250ZXh0LCBwcm9wZXJ0eUluZm9GaWVsZCwgYVR5cGVDb25maWdbcHJvcGVydHlJbmZvRmllbGQua2V5XSksXG5cdFx0c1Byb3BlcnR5UGF0aDogc3RyaW5nID0gXCJcIjtcblx0aWYgKHByb3BlcnR5SW5mb0ZpZWxkLmNvbmRpdGlvblBhdGgpIHtcblx0XHRzUHJvcGVydHlQYXRoID0gcHJvcGVydHlJbmZvRmllbGQuY29uZGl0aW9uUGF0aC5yZXBsYWNlKC9cXCt8XFwqL2csIFwiXCIpO1xuXHR9XG5cdGlmIChvUHJvcGVydHlJbmZvKSB7XG5cdFx0b1Byb3BlcnR5SW5mbyA9IE9iamVjdC5hc3NpZ24ob1Byb3BlcnR5SW5mbywge1xuXHRcdFx0bWF4Q29uZGl0aW9uczogIW9Qcm9wZXJ0eUluZm8uaXNQYXJhbWV0ZXIgJiYgaXNNdWx0aVZhbHVlKG9Qcm9wZXJ0eUluZm8pID8gLTEgOiAxLFxuXHRcdFx0cmVxdWlyZWQ6IHByb3BlcnR5SW5mb0ZpZWxkLnJlcXVpcmVkID8/IChvUHJvcGVydHlJbmZvLmlzUGFyYW1ldGVyIHx8IGFSZXF1aXJlZFByb3BzLmluZGV4T2Yoc1Byb3BlcnR5UGF0aCkgPj0gMCksXG5cdFx0XHRjYXNlU2Vuc2l0aXZlOiBpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUoY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRkYXRhVHlwZTogYVR5cGVDb25maWdbcHJvcGVydHlJbmZvRmllbGQua2V5XS50eXBlXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIG9Qcm9wZXJ0eUluZm87XG59O1xuXG5leHBvcnQgY29uc3QgcHJvY2Vzc1NlbGVjdGlvbkZpZWxkcyA9IGZ1bmN0aW9uIChcblx0cHJvcGVydHlJbmZvRmllbGRzOiBhbnksXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGRlZmF1bHRWYWx1ZVByb3BlcnR5RmllbGRzPzogYW55XG4pIHtcblx0Ly9nZXQgVHlwZUNvbmZpZyBmdW5jdGlvblxuXHRjb25zdCBzZWxlY3Rpb25GaWVsZFR5cGVzOiBhbnkgPSBbXTtcblx0Y29uc3QgYVR5cGVDb25maWc6IGFueSA9IHt9O1xuXG5cdGlmIChkZWZhdWx0VmFsdWVQcm9wZXJ0eUZpZWxkcykge1xuXHRcdHByb3BlcnR5SW5mb0ZpZWxkcyA9IHByb3BlcnR5SW5mb0ZpZWxkcy5jb25jYXQoZGVmYXVsdFZhbHVlUHJvcGVydHlGaWVsZHMpO1xuXHR9XG5cdC8vYWRkIHR5cGVDb25maWdcblx0cHJvcGVydHlJbmZvRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKHBhcmFtZXRlckZpZWxkOiBhbnkpIHtcblx0XHRpZiAocGFyYW1ldGVyRmllbGQuYW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5Q29udmVydHlDb250ZXh0ID0gY29udmVydGVyQ29udGV4dC5nZXRDb252ZXJ0ZXJDb250ZXh0Rm9yKHBhcmFtZXRlckZpZWxkLmFubm90YXRpb25QYXRoKTtcblx0XHRcdGNvbnN0IHByb3BlcnR5VGFyZ2V0T2JqZWN0ID0gcHJvcGVydHlDb252ZXJ0eUNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLnRhcmdldE9iamVjdDtcblx0XHRcdHNlbGVjdGlvbkZpZWxkVHlwZXMucHVzaChwcm9wZXJ0eVRhcmdldE9iamVjdD8udHlwZSk7XG5cdFx0XHRjb25zdCBvVHlwZUNvbmZpZyA9IGZldGNoVHlwZUNvbmZpZyhwcm9wZXJ0eVRhcmdldE9iamVjdCk7XG5cdFx0XHRhVHlwZUNvbmZpZ1twYXJhbWV0ZXJGaWVsZC5rZXldID0gb1R5cGVDb25maWc7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNlbGVjdGlvbkZpZWxkVHlwZXMucHVzaChzRWRtU3RyaW5nKTtcblx0XHRcdGFUeXBlQ29uZmlnW3BhcmFtZXRlckZpZWxkLmtleV0gPSB7IHR5cGU6IHNTdHJpbmdEYXRhVHlwZSB9O1xuXHRcdH1cblx0fSk7XG5cblx0Ly8gZmlsdGVyUmVzdHJpY3Rpb25zXG5cdGxldCBfb0ZpbHRlcnJlc3RyaWN0aW9ucztcblx0aWYgKCFNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpKSkge1xuXHRcdF9vRmlsdGVycmVzdHJpY3Rpb25zID0gKGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk/LmFubm90YXRpb25zPy5DYXBhYmlsaXRpZXMgYXMgRW50aXR5U2V0QW5ub3RhdGlvbnNfQ2FwYWJpbGl0aWVzKVxuXHRcdFx0Py5GaWx0ZXJSZXN0cmljdGlvbnM7XG5cdH1cblx0Y29uc3Qgb0ZpbHRlclJlc3RyaWN0aW9ucyA9IF9vRmlsdGVycmVzdHJpY3Rpb25zO1xuXHRjb25zdCBvUmV0ID0ge30gYXMgYW55O1xuXHRvUmV0W1wiUmVxdWlyZWRQcm9wZXJ0aWVzXCJdID0gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKG9GaWx0ZXJSZXN0cmljdGlvbnMsIFwiUmVxdWlyZWRQcm9wZXJ0aWVzXCIpIHx8IFtdO1xuXHRvUmV0W1wiTm9uRmlsdGVyYWJsZVByb3BlcnRpZXNcIl0gPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMob0ZpbHRlclJlc3RyaWN0aW9ucywgXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiKSB8fCBbXTtcblx0b1JldFtcIkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1wiXSA9IGdldEZpbHRlclJlc3RyaWN0aW9ucyhvRmlsdGVyUmVzdHJpY3Rpb25zLCBcIkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1wiKSB8fCB7fTtcblxuXHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udGV4dFBhdGgoKTtcblx0Y29uc3QgYVBhdGhQYXJ0cyA9IHNFbnRpdHlTZXRQYXRoLnNwbGl0KFwiL1wiKTtcblx0aWYgKGFQYXRoUGFydHMubGVuZ3RoID4gMikge1xuXHRcdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IGFQYXRoUGFydHNbYVBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblx0XHRhUGF0aFBhcnRzLnNwbGljZSgtMSwgMSk7XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25SZXN0cmljdGlvbnMgPSBnZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zKGNvbnZlcnRlckNvbnRleHQsIHNOYXZpZ2F0aW9uUGF0aCk7XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25GaWx0ZXJSZXN0cmljdGlvbnMgPSBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyAmJiBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucy5GaWx0ZXJSZXN0cmljdGlvbnM7XG5cdFx0b1JldC5SZXF1aXJlZFByb3BlcnRpZXMuY29uY2F0KGdldEZpbHRlclJlc3RyaWN0aW9ucyhvTmF2aWdhdGlvbkZpbHRlclJlc3RyaWN0aW9ucywgXCJSZXF1aXJlZFByb3BlcnRpZXNcIikgfHwgW10pO1xuXHRcdG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMuY29uY2F0KGdldEZpbHRlclJlc3RyaWN0aW9ucyhvTmF2aWdhdGlvbkZpbHRlclJlc3RyaWN0aW9ucywgXCJOb25GaWx0ZXJhYmxlUHJvcGVydGllc1wiKSB8fCBbXSk7XG5cdFx0b1JldC5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMgPSB7XG5cdFx0XHQuLi4oZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKG9OYXZpZ2F0aW9uRmlsdGVyUmVzdHJpY3Rpb25zLCBcIkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1wiKSB8fCB7fSksXG5cdFx0XHQuLi5vUmV0LkZpbHRlckFsbG93ZWRFeHByZXNzaW9uc1xuXHRcdH07XG5cdH1cblx0Y29uc3QgYVJlcXVpcmVkUHJvcHMgPSBvUmV0LlJlcXVpcmVkUHJvcGVydGllcztcblx0Y29uc3QgYU5vbkZpbHRlcmFibGVQcm9wcyA9IG9SZXQuTm9uRmlsdGVyYWJsZVByb3BlcnRpZXM7XG5cdGNvbnN0IGFGZXRjaGVkUHJvcGVydGllczogYW55ID0gW107XG5cblx0Ly8gcHJvY2VzcyB0aGUgZmllbGRzIHRvIGFkZCBuZWNlc3NhcnkgcHJvcGVydGllc1xuXHRwcm9wZXJ0eUluZm9GaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAocHJvcGVydHlJbmZvRmllbGQ6IGFueSkge1xuXHRcdGxldCBzUHJvcGVydHlQYXRoO1xuXHRcdGlmIChhTm9uRmlsdGVyYWJsZVByb3BzLmluZGV4T2Yoc1Byb3BlcnR5UGF0aCkgPT09IC0xKSB7XG5cdFx0XHRjb25zdCBvUHJvcGVydHlJbmZvID0gYXNzaWduRGF0YVR5cGVUb1Byb3BlcnR5SW5mbyhwcm9wZXJ0eUluZm9GaWVsZCwgY29udmVydGVyQ29udGV4dCwgYVJlcXVpcmVkUHJvcHMsIGFUeXBlQ29uZmlnKTtcblx0XHRcdGFGZXRjaGVkUHJvcGVydGllcy5wdXNoKG9Qcm9wZXJ0eUluZm8pO1xuXHRcdH1cblx0fSk7XG5cblx0Ly9hZGQgZWRpdFxuXHRjb25zdCBkYXRhTW9kZWxPYmplY3RQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk7XG5cdGlmIChNb2RlbEhlbHBlci5pc09iamVjdFBhdGhEcmFmdFN1cHBvcnRlZChkYXRhTW9kZWxPYmplY3RQYXRoKSkge1xuXHRcdGFGZXRjaGVkUHJvcGVydGllcy5wdXNoKGdldEVkaXRTdGF0ZUZpbHRlclByb3BlcnR5SW5mbygpKTtcblx0fVxuXHQvLyBhZGQgc2VhcmNoXG5cdGNvbnN0IHNlYXJjaFJlc3RyaWN0aW9ucyA9IGdldFNlYXJjaFJlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgaGlkZUJhc2ljU2VhcmNoID0gQm9vbGVhbihzZWFyY2hSZXN0cmljdGlvbnMgJiYgIXNlYXJjaFJlc3RyaWN0aW9ucy5TZWFyY2hhYmxlKTtcblx0aWYgKHNFbnRpdHlTZXRQYXRoICYmIGhpZGVCYXNpY1NlYXJjaCAhPT0gdHJ1ZSkge1xuXHRcdGlmICghc2VhcmNoUmVzdHJpY3Rpb25zIHx8IHNlYXJjaFJlc3RyaWN0aW9ucz8uU2VhcmNoYWJsZSkge1xuXHRcdFx0YUZldGNoZWRQcm9wZXJ0aWVzLnB1c2goZ2V0U2VhcmNoRmlsdGVyUHJvcGVydHlJbmZvKCkpO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBhRmV0Y2hlZFByb3BlcnRpZXM7XG59O1xuXG5leHBvcnQgY29uc3QgaW5zZXJ0Q3VzdG9tTWFuaWZlc3RFbGVtZW50cyA9IGZ1bmN0aW9uIChcblx0ZmlsdGVyRmllbGRzOiBGaWx0ZXJGaWVsZFtdLFxuXHRlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pIHtcblx0cmV0dXJuIGluc2VydEN1c3RvbUVsZW1lbnRzKGZpbHRlckZpZWxkcywgZ2V0TWFuaWZlc3RGaWx0ZXJGaWVsZHMoZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCksIHtcblx0XHRcImF2YWlsYWJpbGl0eVwiOiBcIm92ZXJ3cml0ZVwiLFxuXHRcdGxhYmVsOiBcIm92ZXJ3cml0ZVwiLFxuXHRcdHR5cGU6IFwib3ZlcndyaXRlXCIsXG5cdFx0cG9zaXRpb246IFwib3ZlcndyaXRlXCIsXG5cdFx0dGVtcGxhdGU6IFwib3ZlcndyaXRlXCIsXG5cdFx0c2V0dGluZ3M6IFwib3ZlcndyaXRlXCIsXG5cdFx0dmlzdWFsRmlsdGVyOiBcIm92ZXJ3cml0ZVwiLFxuXHRcdHJlcXVpcmVkOiBcIm92ZXJ3cml0ZVwiXG5cdH0pO1xufTtcblxuLyoqXG4gKiBSZXRyaWV2ZSB0aGUgY29uZmlndXJhdGlvbiBmb3IgdGhlIHNlbGVjdGlvbiBmaWVsZHMgdGhhdCB3aWxsIGJlIHVzZWQgd2l0aGluIHRoZSBmaWx0ZXIgYmFyXG4gKiBUaGlzIGNvbmZpZ3VyYXRpb24gdGFrZXMgaW50byBhY2NvdW50IHRoZSBhbm5vdGF0aW9uIGFuZCB0aGUgc2VsZWN0aW9uIHZhcmlhbnRzLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gbHJUYWJsZXNcbiAqIEBwYXJhbSBhbm5vdGF0aW9uUGF0aFxuICogQHBhcmFtIFtpbmNsdWRlSGlkZGVuXVxuICogQHBhcmFtIFtsaW5lSXRlbVRlcm1dXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBzZWxlY3Rpb24gZmllbGRzXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTZWxlY3Rpb25GaWVsZHMgPSBmdW5jdGlvbiAoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGxyVGFibGVzOiBUYWJsZVZpc3VhbGl6YXRpb25bXSA9IFtdLFxuXHRhbm5vdGF0aW9uUGF0aDogc3RyaW5nID0gXCJcIixcblx0aW5jbHVkZUhpZGRlbj86IGJvb2xlYW4sXG5cdGxpbmVJdGVtVGVybT86IHN0cmluZ1xuKTogYW55IHtcblx0Y29uc3Qgb0Fubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YSA9IGdldEFubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YShcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdGxyVGFibGVzLFxuXHRcdGFubm90YXRpb25QYXRoLFxuXHRcdGluY2x1ZGVIaWRkZW4sXG5cdFx0bGluZUl0ZW1UZXJtXG5cdCk7XG5cdGNvbnN0IHBhcmFtZXRlckZpZWxkcyA9IF9nZXRQYXJhbWV0ZXJGaWVsZHMoY29udmVydGVyQ29udGV4dCk7XG5cdGxldCBwcm9wZXJ0eUluZm9GaWVsZHM6IEZpbHRlckZpZWxkW10gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9Bbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEucHJvcGVydHlJbmZvRmllbGRzKSk7XG5cdGNvbnN0IGVudGl0eVR5cGUgPSBvQW5ub3RhdGVkU2VsZWN0aW9uRmllbGREYXRhLmVudGl0eVR5cGU7XG5cblx0cHJvcGVydHlJbmZvRmllbGRzID0gcGFyYW1ldGVyRmllbGRzLmNvbmNhdChwcm9wZXJ0eUluZm9GaWVsZHMpO1xuXG5cdHByb3BlcnR5SW5mb0ZpZWxkcyA9IGluc2VydEN1c3RvbU1hbmlmZXN0RWxlbWVudHMocHJvcGVydHlJbmZvRmllbGRzLCBlbnRpdHlUeXBlLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHRjb25zdCBhRmV0Y2hlZFByb3BlcnRpZXMgPSBwcm9jZXNzU2VsZWN0aW9uRmllbGRzKFxuXHRcdHByb3BlcnR5SW5mb0ZpZWxkcyxcblx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdG9Bbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEuZGVmYXVsdEZpbHRlckZpZWxkc1xuXHQpO1xuXHRhRmV0Y2hlZFByb3BlcnRpZXMuc29ydChmdW5jdGlvbiAoYTogYW55LCBiOiBhbnkpIHtcblx0XHRpZiAoYS5ncm91cExhYmVsID09PSB1bmRlZmluZWQgfHwgYS5ncm91cExhYmVsID09PSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gLTE7XG5cdFx0fVxuXHRcdGlmIChiLmdyb3VwTGFiZWwgPT09IHVuZGVmaW5lZCB8fCBiLmdyb3VwTGFiZWwgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiAxO1xuXHRcdH1cblx0XHRyZXR1cm4gYS5ncm91cExhYmVsLmxvY2FsZUNvbXBhcmUoYi5ncm91cExhYmVsKTtcblx0fSk7XG5cblx0bGV0IHNGZXRjaFByb3BlcnRpZXMgPSBKU09OLnN0cmluZ2lmeShhRmV0Y2hlZFByb3BlcnRpZXMpO1xuXHRzRmV0Y2hQcm9wZXJ0aWVzID0gc0ZldGNoUHJvcGVydGllcy5yZXBsYWNlKC9cXHsvZywgXCJcXFxce1wiKTtcblx0c0ZldGNoUHJvcGVydGllcyA9IHNGZXRjaFByb3BlcnRpZXMucmVwbGFjZSgvXFx9L2csIFwiXFxcXH1cIik7XG5cdGNvbnN0IHNQcm9wZXJ0eUluZm8gPSBzRmV0Y2hQcm9wZXJ0aWVzO1xuXHQvLyBlbmQgb2YgcHJvcGVydHlGaWVsZHMgcHJvY2Vzc2luZ1xuXG5cdC8vIHRvIHBvcHVsYXRlIHNlbGVjdGlvbiBmaWVsZHNcblx0bGV0IHByb3BTZWxlY3Rpb25GaWVsZHM6IEZpbHRlckZpZWxkW10gPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9Bbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEucHJvcGVydHlJbmZvRmllbGRzKSk7XG5cdHByb3BTZWxlY3Rpb25GaWVsZHMgPSBwYXJhbWV0ZXJGaWVsZHMuY29uY2F0KHByb3BTZWxlY3Rpb25GaWVsZHMpO1xuXHQvLyBjcmVhdGUgYSBtYXAgb2YgcHJvcGVydGllcyB0byBiZSB1c2VkIGluIHNlbGVjdGlvbiB2YXJpYW50c1xuXHRjb25zdCBleGNsdWRlZEZpbHRlclByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+ID0gb0Fubm90YXRlZFNlbGVjdGlvbkZpZWxkRGF0YS5leGNsdWRlZEZpbHRlclByb3BlcnRpZXM7XG5cdGNvbnN0IGZpbHRlckZhY2V0cyA9IGVudGl0eVR5cGU/LmFubm90YXRpb25zPy5VST8uRmlsdGVyRmFjZXRzO1xuXHRsZXQgZmlsdGVyRmFjZXRNYXA6IFJlY29yZDxzdHJpbmcsIEZpbHRlckdyb3VwPiA9IHt9O1xuXG5cdGNvbnN0IGFGaWVsZEdyb3VwcyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbnNCeVRlcm0oXCJVSVwiLCBVSUFubm90YXRpb25UZXJtcy5GaWVsZEdyb3VwKTtcblxuXHRpZiAoZmlsdGVyRmFjZXRzID09PSB1bmRlZmluZWQgfHwgZmlsdGVyRmFjZXRzLmxlbmd0aCA8IDApIHtcblx0XHRmb3IgKGNvbnN0IGkgaW4gYUZpZWxkR3JvdXBzKSB7XG5cdFx0XHRmaWx0ZXJGYWNldE1hcCA9IHtcblx0XHRcdFx0Li4uZmlsdGVyRmFjZXRNYXAsXG5cdFx0XHRcdC4uLmdldEZpZWxkR3JvdXBGaWx0ZXJHcm91cHMoYUZpZWxkR3JvdXBzW2ldKVxuXHRcdFx0fTtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0ZmlsdGVyRmFjZXRNYXAgPSBmaWx0ZXJGYWNldHMucmVkdWNlKChwcmV2aW91c1ZhbHVlOiBSZWNvcmQ8c3RyaW5nLCBGaWx0ZXJHcm91cD4sIGZpbHRlckZhY2V0OiBSZWZlcmVuY2VGYWNldFR5cGVzKSA9PiB7XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IChmaWx0ZXJGYWNldD8uVGFyZ2V0Py4kdGFyZ2V0IGFzIEZpZWxkR3JvdXApPy5EYXRhPy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRwcmV2aW91c1ZhbHVlWygoZmlsdGVyRmFjZXQ/LlRhcmdldD8uJHRhcmdldCBhcyBGaWVsZEdyb3VwKT8uRGF0YVtpXSBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlPy5wYXRoXSA9IHtcblx0XHRcdFx0XHRncm91cDogZmlsdGVyRmFjZXQ/LklEPy50b1N0cmluZygpLFxuXHRcdFx0XHRcdGdyb3VwTGFiZWw6IGZpbHRlckZhY2V0Py5MYWJlbD8udG9TdHJpbmcoKVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHByZXZpb3VzVmFsdWU7XG5cdFx0fSwge30pO1xuXHR9XG5cblx0Ly8gY3JlYXRlIGEgbWFwIG9mIGFsbCBwb3RlbnRpYWwgZmlsdGVyIGZpZWxkcyBiYXNlZCBvbi4uLlxuXHRjb25zdCBmaWx0ZXJGaWVsZHM6IFJlY29yZDxzdHJpbmcsIEZpbHRlckZpZWxkPiA9IG9Bbm5vdGF0ZWRTZWxlY3Rpb25GaWVsZERhdGEuZmlsdGVyRmllbGRzO1xuXG5cdC8vIGZpbmFsbHkgY3JlYXRlIGZpbmFsIGxpc3Qgb2YgZmlsdGVyIGZpZWxkcyBieSBhZGRpbmcgdGhlIFNlbGVjdGlvbkZpZWxkcyBmaXJzdCAob3JkZXIgbWF0dGVycykuLi5cblx0bGV0IGFsbEZpbHRlcnMgPSBwcm9wU2VsZWN0aW9uRmllbGRzXG5cblx0XHQvLyAuLi5hbmQgYWRkaW5nIHJlbWFpbmluZyBmaWx0ZXIgZmllbGRzLCB0aGF0IGFyZSBub3QgdXNlZCBpbiBhIFNlbGVjdGlvblZhcmlhbnQgKG9yZGVyIGRvZXNuJ3QgbWF0dGVyKVxuXHRcdC5jb25jYXQoXG5cdFx0XHRPYmplY3Qua2V5cyhmaWx0ZXJGaWVsZHMpXG5cdFx0XHRcdC5maWx0ZXIoKHByb3BlcnR5UGF0aCkgPT4gIShwcm9wZXJ0eVBhdGggaW4gZXhjbHVkZWRGaWx0ZXJQcm9wZXJ0aWVzKSlcblx0XHRcdFx0Lm1hcCgocHJvcGVydHlQYXRoKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIE9iamVjdC5hc3NpZ24oZmlsdGVyRmllbGRzW3Byb3BlcnR5UGF0aF0sIGZpbHRlckZhY2V0TWFwW3Byb3BlcnR5UGF0aF0pO1xuXHRcdFx0XHR9KVxuXHRcdCk7XG5cdGNvbnN0IHNDb250ZXh0UGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udGV4dFBhdGgoKTtcblxuXHQvL2lmIGFsbCB0YWJsZXMgYXJlIGFuYWx5dGljYWwgdGFibGVzIFwiYWdncmVnYXRhYmxlXCIgcHJvcGVydGllcyBtdXN0IGJlIGV4Y2x1ZGVkXG5cdGlmIChjaGVja0FsbFRhYmxlRm9yRW50aXR5U2V0QXJlQW5hbHl0aWNhbChsclRhYmxlcywgc0NvbnRleHRQYXRoKSkge1xuXHRcdC8vIEN1cnJlbnRseSBhbGwgYWdyZWdhdGVzIGFyZSByb290IGVudGl0eSBwcm9wZXJ0aWVzIChubyBwcm9wZXJ0aWVzIGNvbWluZyBmcm9tIG5hdmlnYXRpb24pIGFuZCBhbGxcblx0XHQvLyB0YWJsZXMgd2l0aCBzYW1lIGVudGl0eVNldCBnZXRzIHNhbWUgYWdncmVhZ3RlIGNvbmZpZ3VyYXRpb24gdGhhdCdzIHdoeSB3ZSBjYW4gdXNlIGZpcnN0IHRhYmxlIGludG9cblx0XHQvLyBMUiB0byBnZXQgYWdncmVnYXRlcyAod2l0aG91dCBjdXJyZW5jeS91bml0IHByb3BlcnRpZXMgc2luY2Ugd2UgZXhwZWN0IHRvIGJlIGFibGUgdG8gZmlsdGVyIHRoZW0pLlxuXHRcdGNvbnN0IGFnZ3JlZ2F0ZXMgPSBsclRhYmxlc1swXS5hZ2dyZWdhdGVzO1xuXHRcdGlmIChhZ2dyZWdhdGVzKSB7XG5cdFx0XHRjb25zdCBhZ2dyZWdhdGFibGVQcm9wZXJ0aWVzOiBzdHJpbmdbXSA9IE9iamVjdC5rZXlzKGFnZ3JlZ2F0ZXMpLm1hcCgoYWdncmVnYXRlS2V5KSA9PiBhZ2dyZWdhdGVzW2FnZ3JlZ2F0ZUtleV0ucmVsYXRpdmVQYXRoKTtcblx0XHRcdGFsbEZpbHRlcnMgPSBhbGxGaWx0ZXJzLmZpbHRlcigoZmlsdGVyRmllbGQpID0+IHtcblx0XHRcdFx0cmV0dXJuIGFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMuaW5kZXhPZihmaWx0ZXJGaWVsZC5rZXkpID09PSAtMTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdGNvbnN0IHNlbGVjdGlvbkZpZWxkcyA9IGluc2VydEN1c3RvbU1hbmlmZXN0RWxlbWVudHMoYWxsRmlsdGVycywgZW50aXR5VHlwZSwgY29udmVydGVyQ29udGV4dCk7XG5cblx0Ly8gQWRkIGNhc2VTZW5zaXRpdmUgcHJvcGVydHkgdG8gYWxsIHNlbGVjdGlvbiBmaWVsZHMuXG5cdGNvbnN0IGlzQ2FzZVNlbnNpdGl2ZSA9IGlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZShjb252ZXJ0ZXJDb250ZXh0KTtcblx0c2VsZWN0aW9uRmllbGRzLmZvckVhY2goKGZpbHRlckZpZWxkKSA9PiB7XG5cdFx0ZmlsdGVyRmllbGQuY2FzZVNlbnNpdGl2ZSA9IGlzQ2FzZVNlbnNpdGl2ZTtcblx0fSk7XG5cblx0cmV0dXJuIHsgc2VsZWN0aW9uRmllbGRzLCBzUHJvcGVydHlJbmZvIH07XG59O1xuXG4vKipcbiAqIERldGVybWluZXMgd2hldGhlciB0aGUgZmlsdGVyIGJhciBpbnNpZGUgYSB2YWx1ZSBoZWxwIGRpYWxvZyBzaG91bGQgYmUgZXhwYW5kZWQuIFRoaXMgaXMgdHJ1ZSBpZiBvbmUgb2YgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGhvbGQ6XG4gKiAoMSkgYSBmaWx0ZXIgcHJvcGVydHkgaXMgbWFuZGF0b3J5LFxuICogKDIpIG5vIHNlYXJjaCBmaWVsZCBleGlzdHMgKGVudGl0eSBpc24ndCBzZWFyY2ggZW5hYmxlZCksXG4gKiAoMykgd2hlbiB0aGUgZGF0YSBpc24ndCBsb2FkZWQgYnkgZGVmYXVsdCAoYW5ub3RhdGlvbiBGZXRjaFZhbHVlcyA9IDIpLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIGZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb24gVGhlIEZpbHRlclJlc3RyaWN0aW9uIGFubm90YXRpb25cbiAqIEBwYXJhbSB2YWx1ZUxpc3RBbm5vdGF0aW9uIFRoZSBWYWx1ZUxpc3QgYW5ub3RhdGlvblxuICogQHJldHVybnMgVGhlIHZhbHVlIGZvciBleHBhbmRGaWx0ZXJGaWVsZHNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEV4cGFuZEZpbHRlckZpZWxkcyA9IGZ1bmN0aW9uIChcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCxcblx0ZmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbjogYW55LFxuXHR2YWx1ZUxpc3RBbm5vdGF0aW9uOiBhbnlcbik6IGJvb2xlYW4ge1xuXHRjb25zdCByZXF1aXJlZFByb3BlcnRpZXMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMoZmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiwgXCJSZXF1aXJlZFByb3BlcnRpZXNcIik7XG5cdGNvbnN0IHNlYXJjaFJlc3RyaWN0aW9ucyA9IGdldFNlYXJjaFJlc3RyaWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0KTtcblx0Y29uc3QgaGlkZUJhc2ljU2VhcmNoID0gQm9vbGVhbihzZWFyY2hSZXN0cmljdGlvbnMgJiYgIXNlYXJjaFJlc3RyaWN0aW9ucy5TZWFyY2hhYmxlKTtcblx0Y29uc3QgdmFsdWVMaXN0ID0gdmFsdWVMaXN0QW5ub3RhdGlvbi5nZXRPYmplY3QoKTtcblx0aWYgKHJlcXVpcmVkUHJvcGVydGllcy5sZW5ndGggPiAwIHx8IGhpZGVCYXNpY1NlYXJjaCB8fCB2YWx1ZUxpc3Q/LkZldGNoVmFsdWVzID09PSAyKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0cmV0dXJuIGZhbHNlO1xufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01Bb0RLQSxlQUFlO0VBQUEsV0FBZkEsZUFBZTtJQUFmQSxlQUFlO0lBQWZBLGVBQWU7RUFBQSxHQUFmQSxlQUFlLEtBQWZBLGVBQWU7RUFLcEIsSUFBTUMsVUFBVSxHQUFHLFlBQVk7RUFDL0IsSUFBTUMsZUFBZSxHQUFHLGdDQUFnQztFQUl4RDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQyx5QkFBeUIsQ0FBQ0MsVUFBc0IsRUFBK0I7SUFDdkYsSUFBTUMsY0FBMkMsR0FBRyxDQUFDLENBQUM7SUFDdERELFVBQVUsQ0FBQ0UsSUFBSSxDQUFDQyxPQUFPLENBQUMsVUFBQ0MsU0FBaUMs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