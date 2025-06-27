/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepEqual", "sap/fe/core/CommonUtils", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/DisplayModeFormatter", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/type/TypeUtil", "sap/fe/macros/DelegateUtil", "sap/fe/macros/ODataMetaModelUtil", "sap/ui/core/Core", "sap/ui/mdc/odata/v4/TableDelegate", "sap/ui/mdc/odata/v4/util/DelegateUtil", "sap/ui/mdc/util/FilterUtil", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/Sorter"], function (Log, deepEqual, CommonUtils, FilterBar, MetaModelConverter, ModelHelper, DataModelPathHelper, DisplayModeFormatter, PropertyHelper, TypeUtil, MacrosDelegateUtil, ODataMetaModelUtil, Core, TableDelegate, DelegateUtil, FilterUtil, Filter, FilterOperator, Sorter) {
  "use strict";

  var getLabel = PropertyHelper.getLabel;
  var getAssociatedUnitPropertyPath = PropertyHelper.getAssociatedUnitPropertyPath;
  var getAssociatedTimezonePropertyPath = PropertyHelper.getAssociatedTimezonePropertyPath;
  var getAssociatedTextPropertyPath = PropertyHelper.getAssociatedTextPropertyPath;
  var getAssociatedCurrencyPropertyPath = PropertyHelper.getAssociatedCurrencyPropertyPath;
  var getDisplayMode = DisplayModeFormatter.getDisplayMode;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var fetchTypeConfig = FilterBar.fetchTypeConfig;
  /**
   * Test delegate for OData V4.
   */
  var ODataTableDelegate = Object.assign({}, TableDelegate);
  ODataTableDelegate.fetchProperties = function (oTable) {
    var _this = this;
    var oModel = this._getModel(oTable);
    var pCreatePropertyInfos;
    if (!oModel) {
      pCreatePropertyInfos = new Promise(function (resolve) {
        oTable.attachModelContextChange({
          resolver: resolve
        }, onModelContextChange, _this);
      }).then(function (oSubModel) {
        return _this._createPropertyInfos(oTable, oSubModel);
      });
    } else {
      pCreatePropertyInfos = this._createPropertyInfos(oTable, oModel);
    }
    return pCreatePropertyInfos.then(function (aProperties) {
      if (oTable.data) {
        oTable.data("$tablePropertyInfo", aProperties);
      }
      return aProperties;
    });
  };
  function onModelContextChange(oEvent, oData) {
    var oTable = oEvent.getSource();
    var oModel = this._getModel(oTable);
    if (oModel) {
      oTable.detachModelContextChange(onModelContextChange);
      oData.resolver(oModel);
    }
  }
  /**
   * Collect related properties from a property's annotations.
   * @param dataModelPropertyPath The model object path of the property.
   * @returns The related properties that were identified.
   */
  function _collectRelatedProperties(dataModelPropertyPath) {
    var dataModelAdditionalPropertyPath = _getAdditionalProperty(dataModelPropertyPath);
    var relatedProperties = {};
    if (dataModelAdditionalPropertyPath !== null && dataModelAdditionalPropertyPath !== void 0 && dataModelAdditionalPropertyPath.targetObject) {
      var _property$annotations, _property$annotations2, _textAnnotation$annot, _textAnnotation$annot2, _textAnnotation$annot3;
      var additionalProperty = dataModelAdditionalPropertyPath.targetObject;
      var additionalPropertyPath = dataModelAdditionalPropertyPath.navigationProperties.length ? getTargetObjectPath(dataModelAdditionalPropertyPath, true) : additionalProperty.name;
      var property = dataModelPropertyPath.targetObject;
      var propertyPath = dataModelPropertyPath.navigationProperties.length ? getTargetObjectPath(dataModelPropertyPath, true) : property.name;
      var textAnnotation = (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Common) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.Text,
        textArrangement = textAnnotation === null || textAnnotation === void 0 ? void 0 : (_textAnnotation$annot = textAnnotation.annotations) === null || _textAnnotation$annot === void 0 ? void 0 : (_textAnnotation$annot2 = _textAnnotation$annot.UI) === null || _textAnnotation$annot2 === void 0 ? void 0 : (_textAnnotation$annot3 = _textAnnotation$annot2.TextArrangement) === null || _textAnnotation$annot3 === void 0 ? void 0 : _textAnnotation$annot3.toString(),
        displayMode = textAnnotation && textArrangement && getDisplayMode(property);
      if (displayMode === "Description") {
        relatedProperties[additionalPropertyPath] = additionalProperty;
      } else if (displayMode && displayMode !== "Value" || !textAnnotation) {
        relatedProperties[propertyPath] = property;
        relatedProperties[additionalPropertyPath] = additionalProperty;
      }
    }
    return relatedProperties;
  }
  ODataTableDelegate._createPropertyInfos = function (oTable, oModel) {
    var oMetadataInfo = oTable.getDelegate().payload;
    var aProperties = [];
    var sEntitySetPath = "/".concat(oMetadataInfo.collectionName);
    var oMetaModel = oModel.getMetaModel();
    return oMetaModel.requestObject("".concat(sEntitySetPath, "@")).then(function (mEntitySetAnnotations) {
      var oSortRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"];
      var oSortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(oSortRestrictions);
      var oFilterRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.FilterRestrictions"];
      var oFilterRestrictionsInfo = ODataMetaModelUtil.getFilterRestrictionsInfo(oFilterRestrictions);
      var customDataForColumns = MacrosDelegateUtil.getCustomData(oTable, "columns");
      var propertiesToBeCreated = {};
      var dataModelEntityPath = getInvolvedDataModelObjects(oTable.getModel().getMetaModel().getContext(sEntitySetPath));
      customDataForColumns.customData.forEach(function (columnDef) {
        var oPropertyInfo = {
          name: columnDef.path,
          label: columnDef.label,
          sortable: _isSortableProperty(oSortRestrictionsInfo, columnDef),
          filterable: _isFilterableProperty(oFilterRestrictionsInfo, columnDef),
          maxConditions: _getPropertyMaxConditions(oFilterRestrictionsInfo, columnDef),
          typeConfig: MacrosDelegateUtil.isTypeFilterable(columnDef.$Type) ? oTable.getTypeUtil().getTypeConfig(columnDef.$Type) : undefined
        };
        var dataModelPropertyPath = enhanceDataModelPath(dataModelEntityPath, columnDef.path);
        var property = dataModelPropertyPath.targetObject;
        if (property) {
          var targetPropertyPath = dataModelPropertyPath.navigationProperties.length ? getTargetObjectPath(dataModelPropertyPath, true) : property.name;
          var oTypeConfig;
          if (MacrosDelegateUtil.isTypeFilterable(property.type)) {
            var _TypeUtil$getTypeConf;
            var propertyTypeConfig = fetchTypeConfig(property);
            oTypeConfig = (_TypeUtil$getTypeConf = TypeUtil.getTypeConfig(propertyTypeConfig.type, propertyTypeConfig.formatOptions, propertyTypeConfig.constraints)) !== null && _TypeUtil$getTypeConf !== void 0 ? _TypeUtil$getTypeConf : oTable.getTypeUtil().getTypeConfig(columnDef.$Type);
          }
          //Check if there is an additional property linked to the property as a Unit, Currency, Timezone or textArrangement
          var relatedPropertiesInfo = _collectRelatedProperties(dataModelPropertyPath);
          var relatedPropertyPaths = Object.keys(relatedPropertiesInfo);
          if (relatedPropertyPaths.length) {
            oPropertyInfo.propertyInfos = relatedPropertyPaths;
            //Complex properties must be hidden for sorting and filtering
            oPropertyInfo.sortable = false;
            oPropertyInfo.filterable = false;
            // Collect information of related columns to be created.
            relatedPropertyPaths.forEach(function (path) {
              propertiesToBeCreated[path] = relatedPropertiesInfo[path];
            });
            // Also add property for the inOut Parameters on the ValueHelp when textArrangement is set to #TextOnly
            // It will not be linked to the complex Property (BCP 2270141154)
            if (!relatedPropertyPaths.find(function (path) {
              return relatedPropertiesInfo[path] === property;
            })) {
              propertiesToBeCreated[targetPropertyPath] = property;
            }
          } else {
            oPropertyInfo.path = columnDef.path;
          }
          oPropertyInfo.typeConfig = oPropertyInfo.typeConfig ? oTypeConfig : undefined;
        } else {
          oPropertyInfo.path = columnDef.path;
        }
        aProperties.push(oPropertyInfo);
      });
      var relatedColumns = _createRelatedProperties(propertiesToBeCreated, aProperties, oSortRestrictionsInfo, oFilterRestrictionsInfo);
      return aProperties.concat(relatedColumns);
    });
  };

  /**
   * Updates the binding info with the relevant path and model from the metadata.
   * @param oMDCTable The MDCTable instance
   * @param oBindingInfo The bindingInfo of the table
   */
  ODataTableDelegate.updateBindingInfo = function (oMDCTable, oBindingInfo) {
    TableDelegate.updateBindingInfo.apply(this, [oMDCTable, oBindingInfo]);
    if (!oMDCTable) {
      return;
    }
    var oMetadataInfo = oMDCTable.getDelegate().payload;
    if (oMetadataInfo && oBindingInfo) {
      oBindingInfo.path = oBindingInfo.path || oMetadataInfo.collectionPath || "/".concat(oMetadataInfo.collectionName);
      oBindingInfo.model = oBindingInfo.model || oMetadataInfo.model;
    }
    if (!oBindingInfo) {
      oBindingInfo = {};
    }
    var oFilter = Core.byId(oMDCTable.getFilter()),
      bFilterEnabled = oMDCTable.isFilteringEnabled();
    var mConditions;
    var oInnerFilterInfo, oOuterFilterInfo;
    var aFilters = [];
    var aTableProperties = oMDCTable.data("$tablePropertyInfo");

    //TODO: consider a mechanism ('FilterMergeUtil' or enhance 'FilterUtil') to allow the connection between different filters)
    if (bFilterEnabled) {
      mConditions = oMDCTable.getConditions();
      oInnerFilterInfo = FilterUtil.getFilterInfo(oMDCTable, mConditions, aTableProperties, []);
      if (oInnerFilterInfo.filters) {
        aFilters.push(oInnerFilterInfo.filters);
      }
    }
    if (oFilter) {
      mConditions = oFilter.getConditions();
      if (mConditions) {
        var aParameterNames = DelegateUtil.getParameterNames(oFilter);
        // The table properties needs to updated with the filter field if no Selectionfierlds are annotated and not part as value help parameter
        ODataTableDelegate._updatePropertyInfo(aTableProperties, oMDCTable, mConditions, oMetadataInfo);
        oOuterFilterInfo = FilterUtil.getFilterInfo(oFilter, mConditions, aTableProperties, aParameterNames);
        if (oOuterFilterInfo.filters) {
          aFilters.push(oOuterFilterInfo.filters);
        }
        var sParameterPath = DelegateUtil.getParametersInfo(oFilter, mConditions);
        if (sParameterPath) {
          oBindingInfo.path = sParameterPath;
        }
      }

      // get the basic search
      oBindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(oFilter.getSearch()) || undefined;
    }
    this._applyDefaultSorting(oBindingInfo, oMDCTable.getDelegate().payload);
    // add select to oBindingInfo (BCP 2170163012)
    oBindingInfo.parameters.$select = aTableProperties.reduce(function (sQuery, oProperty) {
      // Navigation properties (represented by X/Y) should not be added to $select.
      // ToDo : They should be added as $expand=X($select=Y) instead
      if (oProperty.path && oProperty.path.indexOf("/") === -1) {
        sQuery = sQuery ? "".concat(sQuery, ",").concat(oProperty.path) : oProperty.path;
      }
      return sQuery;
    }, "");

    // Add $count
    oBindingInfo.parameters.$count = true;

    //If the entity is DraftEnabled add a DraftFilter
    if (ModelHelper.isDraftSupported(oMDCTable.getModel().getMetaModel(), oBindingInfo.path)) {
      aFilters.push(new Filter("IsActiveEntity", FilterOperator.EQ, true));
    }
    oBindingInfo.filters = new Filter(aFilters, true);
  };
  ODataTableDelegate.getTypeUtil = function /*oPayload*/
  () {
    return TypeUtil;
  };
  ODataTableDelegate._getModel = function (oTable) {
    var oMetadataInfo = oTable.getDelegate().payload;
    return oTable.getModel(oMetadataInfo.model);
  };

  /**
   * Applies a default sort order if needed. This is only the case if the request is not a $search request
   * (means the parameter $search of the bindingInfo is undefined) and if not already a sort order is set,
   * e.g. via presentation variant or manual by the user.
   * @param oBindingInfo The bindingInfo of the table
   * @param oPayload The payload of the TableDelegate
   */
  ODataTableDelegate._applyDefaultSorting = function (oBindingInfo, oPayload) {
    if (oBindingInfo.parameters && oBindingInfo.parameters.$search == undefined && oBindingInfo.sorter && oBindingInfo.sorter.length == 0) {
      var defaultSortPropertyName = oPayload ? oPayload.defaultSortPropertyName : undefined;
      if (defaultSortPropertyName) {
        oBindingInfo.sorter.push(new Sorter(defaultSortPropertyName, false));
      }
    }
  };

  /**
   * Updates the table properties with filter field infos.
   * @param aTableProperties Array with table properties
   * @param oMDCTable The MDCTable instance
   * @param mConditions The conditions of the table
   * @param oMetadataInfo The metadata info of the filter field
   */
  ODataTableDelegate._updatePropertyInfo = function (aTableProperties, oMDCTable, mConditions, oMetadataInfo) {
    var aConditionKey = Object.keys(mConditions),
      oMetaModel = oMDCTable.getModel().getMetaModel();
    aConditionKey.forEach(function (conditionKey) {
      if (aTableProperties.findIndex(function (tableProperty) {
        return tableProperty.path === conditionKey;
      }) === -1) {
        var oColumnDef = {
          path: conditionKey,
          typeConfig: oMDCTable.getTypeUtil().getTypeConfig(oMetaModel.getObject("/".concat(oMetadataInfo.collectionName, "/").concat(conditionKey)).$Type)
        };
        aTableProperties.push(oColumnDef);
      }
    });
  };
  ODataTableDelegate.updateBinding = function (oTable, oBindingInfo, oBinding) {
    var bNeedManualRefresh = false;
    var oInternalBindingContext = oTable.getBindingContext("internal");
    var sManualUpdatePropertyKey = "pendingManualBindingUpdate";
    var bPendingManualUpdate = oInternalBindingContext === null || oInternalBindingContext === void 0 ? void 0 : oInternalBindingContext.getProperty(sManualUpdatePropertyKey);
    var oRowBinding = oTable.getRowBinding();

    //oBinding=null means that a rebinding needs to be forced via updateBinding in mdc TableDelegate
    TableDelegate.updateBinding.apply(ODataTableDelegate, [oTable, oBindingInfo, oBinding]);
    //get row binding after rebind from TableDelegate.updateBinding in case oBinding was null
    if (!oRowBinding) {
      oRowBinding = oTable.getRowBinding();
    }
    if (oRowBinding) {
      /**
       * Manual refresh if filters are not changed by binding.refresh() since updating the bindingInfo
       * is not enough to trigger a batch request.
       * Removing columns creates one batch request that was not executed before
       */
      var oldFilters = oRowBinding.getFilters("Application");
      bNeedManualRefresh = deepEqual(oBindingInfo.filters, oldFilters[0]) && oRowBinding.getQueryOptionsFromParameters().$search === oBindingInfo.parameters.$search && !bPendingManualUpdate;
    }
    if (bNeedManualRefresh && oTable.getFilter()) {
      oInternalBindingContext === null || oInternalBindingContext === void 0 ? void 0 : oInternalBindingContext.setProperty(sManualUpdatePropertyKey, true);
      oRowBinding.requestRefresh(oRowBinding.getGroupId()).finally(function () {
        oInternalBindingContext === null || oInternalBindingContext === void 0 ? void 0 : oInternalBindingContext.setProperty(sManualUpdatePropertyKey, false);
      }).catch(function (oError) {
        Log.error("Error while refreshing a filterBar VH table", oError);
      });
    }
    oTable.fireEvent("bindingUpdated");
    //no need to check for semantic targets here since we are in a VH and don't want to allow further navigation
  };

  /**
   * Creates a simple property for each identified complex property.
   * @param propertiesToBeCreated Identified properties.
   * @param existingColumns The list of columns created for properties defined on the Value List.
   * @param oSortRestrictionsInfo An object containing the sort restriction information
   * @param oFilterRestrictionsInfo An object containing the filter restriction information
   * @returns The array of properties created.
   */
  function _createRelatedProperties(propertiesToBeCreated, existingColumns, oSortRestrictionsInfo, oFilterRestrictionsInfo) {
    var relatedPropertyNameMap = {},
      relatedColumns = [];
    Object.keys(propertiesToBeCreated).forEach(function (path) {
      var property = propertiesToBeCreated[path],
        relatedColumn = existingColumns.find(function (column) {
          return column.path === path;
        }); // Complex properties doesn't get path so only simple column are found
      if (!relatedColumn) {
        var newName = "Property::".concat(path);
        relatedPropertyNameMap[path] = newName;
        var valueHelpTableColumn = {
          name: newName,
          label: getLabel(property),
          path: path,
          sortable: _isSortableProperty(oSortRestrictionsInfo, property),
          filterable: _isFilterableProperty(oFilterRestrictionsInfo, property)
        };
        valueHelpTableColumn.maxConditions = _getPropertyMaxConditions(oFilterRestrictionsInfo, valueHelpTableColumn);
        if (MacrosDelegateUtil.isTypeFilterable(property.type)) {
          var propertyTypeConfig = fetchTypeConfig(property);
          valueHelpTableColumn.typeConfig = TypeUtil.getTypeConfig(propertyTypeConfig.type, propertyTypeConfig.formatOptions, propertyTypeConfig.constraints);
        }
        relatedColumns.push(valueHelpTableColumn);
      }
    });
    // The property 'name' has been prefixed with 'Property::' for uniqueness.
    // Update the same in other propertyInfos[] references which point to this property.
    existingColumns.forEach(function (column) {
      if (column.propertyInfos) {
        var _column$propertyInfos;
        column.propertyInfos = (_column$propertyInfos = column.propertyInfos) === null || _column$propertyInfos === void 0 ? void 0 : _column$propertyInfos.map(function (columnName) {
          var _relatedPropertyNameM;
          return (_relatedPropertyNameM = relatedPropertyNameMap[columnName]) !== null && _relatedPropertyNameM !== void 0 ? _relatedPropertyNameM : columnName;
        });
      }
    });
    return relatedColumns;
  }
  /**
   * Identifies if the given property is sortable based on the sort restriction information.
   * @param oSortRestrictionsInfo The sort restriction information from the restriction annotation.
   * @param property The target property.
   * @returns `true` if the given property is sortable.
   */
  function _isSortableProperty(oSortRestrictionsInfo, property) {
    return property.path && oSortRestrictionsInfo[property.path] ? oSortRestrictionsInfo[property.path].sortable : property.sortable;
  }

  /**
   * Identifies if the given property is filterable based on the sort restriction information.
   * @param oFilterRestrictionsInfo The filter restriction information from the restriction annotation.
   * @param property The target property.
   * @returns `true` if the given property is filterable.
   */
  function _isFilterableProperty(oFilterRestrictionsInfo, property) {
    return property.path && oFilterRestrictionsInfo[property.path] ? oFilterRestrictionsInfo[property.path].filterable : property.filterable;
  }

  /**
   * Identifies the maxConditions for a given property.
   * @param oFilterRestrictionsInfo The filter restriction information from the restriction annotation.
   * @param valueHelpColumn The target property.
   * @returns `-1` or `1` if the property is a MultiValueFilterExpression.
   */
  function _getPropertyMaxConditions(oFilterRestrictionsInfo, valueHelpColumn) {
    return valueHelpColumn.path && ODataMetaModelUtil.isMultiValueFilterExpression(oFilterRestrictionsInfo.propertyInfo[valueHelpColumn.path]) ? -1 : 1;
  }

  /**
   * Identifies the additional property which references to the unit, timezone, textArrangement or currency.
   * @param dataModelPropertyPath The model object path of the property.
   * @returns The additional property.
   */

  function _getAdditionalProperty(dataModelPropertyPath) {
    var oProperty = dataModelPropertyPath.targetObject;
    var additionalPropertyPath = getAssociatedTextPropertyPath(oProperty) || getAssociatedCurrencyPropertyPath(oProperty) || getAssociatedUnitPropertyPath(oProperty) || getAssociatedTimezonePropertyPath(oProperty);
    if (!additionalPropertyPath) {
      return undefined;
    }
    var dataModelAdditionalProperty = enhanceDataModelPath(dataModelPropertyPath, additionalPropertyPath);

    //Additional Property could refer to a navigation property, keep the name and path as navigation property
    var additionalProperty = dataModelAdditionalProperty.targetObject;
    if (!additionalProperty) {
      return undefined;
    }
    return dataModelAdditionalProperty;
  }
  return ODataTableDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJPRGF0YVRhYmxlRGVsZWdhdGUiLCJPYmplY3QiLCJhc3NpZ24iLCJUYWJsZURlbGVnYXRlIiwiZmV0Y2hQcm9wZXJ0aWVzIiwib1RhYmxlIiwib01vZGVsIiwiX2dldE1vZGVsIiwicENyZWF0ZVByb3BlcnR5SW5mb3MiLCJQcm9taXNlIiwicmVzb2x2ZSIsImF0dGFjaE1vZGVsQ29udGV4dENoYW5nZSIsInJlc29sdmVyIiwib25Nb2RlbENvbnRleHRDaGFuZ2UiLCJ0aGVuIiwib1N1Yk1vZGVsIiwiX2NyZWF0ZVByb3BlcnR5SW5mb3MiLCJhUHJvcGVydGllcyIsImRhdGEiLCJvRXZlbnQiLCJvRGF0YSIsImdldFNvdXJjZSIsImRldGFjaE1vZGVsQ29udGV4dENoYW5nZSIsIl9jb2xsZWN0UmVsYXRlZFByb3BlcnRpZXMiLCJkYXRhTW9kZWxQcm9wZXJ0eVBhdGgiLCJkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHlQYXRoIiwiX2dldEFkZGl0aW9uYWxQcm9wZXJ0eSIsInJlbGF0ZWRQcm9wZXJ0aWVzIiwidGFyZ2V0T2JqZWN0IiwiYWRkaXRpb25hbFByb3BlcnR5IiwiYWRkaXRpb25hbFByb3BlcnR5UGF0aCIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibGVuZ3RoIiwiZ2V0VGFyZ2V0T2JqZWN0UGF0aCIsIm5hbWUiLCJwcm9wZXJ0eSIsInByb3BlcnR5UGF0aCIsInRleHRBbm5vdGF0aW9uIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJUZXh0IiwidGV4dEFycmFuZ2VtZW50IiwiVUkiLCJUZXh0QXJyYW5nZW1lbnQiLCJ0b1N0cmluZyIsImRpc3BsYXlNb2RlIiwiZ2V0RGlzcGxheU1vZGUiLCJvTWV0YWRhdGFJbmZvIiwiZ2V0RGVsZWdhdGUiLCJwYXlsb2FkIiwic0VudGl0eVNldFBhdGgiLCJjb2xsZWN0aW9uTmFtZSIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJyZXF1ZXN0T2JqZWN0IiwibUVudGl0eVNldEFubm90YXRpb25zIiwib1NvcnRSZXN0cmljdGlvbnMiLCJvU29ydFJlc3RyaWN0aW9uc0luZm8iLCJPRGF0YU1ldGFNb2RlbFV0aWwiLCJnZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyIsIm9GaWx0ZXJSZXN0cmljdGlvbnMiLCJvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbyIsImdldEZpbHRlclJlc3RyaWN0aW9uc0luZm8iLCJjdXN0b21EYXRhRm9yQ29sdW1ucyIsIk1hY3Jvc0RlbGVnYXRlVXRpbCIsImdldEN1c3RvbURhdGEiLCJwcm9wZXJ0aWVzVG9CZUNyZWF0ZWQiLCJkYXRhTW9kZWxFbnRpdHlQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIiwiZ2V0TW9kZWwiLCJnZXRDb250ZXh0IiwiY3VzdG9tRGF0YSIsImZvckVhY2giLCJjb2x1bW5EZWYiLCJvUHJvcGVydHlJbmZvIiwicGF0aCIsImxhYmVsIiwic29ydGFibGUiLCJfaXNTb3J0YWJsZVByb3BlcnR5IiwiZmlsdGVyYWJsZSIsIl9pc0ZpbHRlcmFibGVQcm9wZXJ0eSIsIm1heENvbmRpdGlvbnMiLCJfZ2V0UHJvcGVydHlNYXhDb25kaXRpb25zIiwidHlwZUNvbmZpZyIsImlzVHlwZUZpbHRlcmFibGUiLCIkVHlwZSIsImdldFR5cGVVdGlsIiwiZ2V0VHlwZUNvbmZpZyIsInVuZGVmaW5lZCIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwidGFyZ2V0UHJvcGVydHlQYXRoIiwib1R5cGVDb25maWciLCJ0eXBlIiwicHJvcGVydHlUeXBlQ29uZmlnIiwiZmV0Y2hUeXBlQ29uZmlnIiwiVHlwZVV0aWwiLCJmb3JtYXRPcHRpb25zIiwiY29uc3RyYWludHMiLCJyZWxhdGVkUHJvcGVydGllc0luZm8iLCJyZWxhdGVkUHJvcGVydHlQYXRocyIsImtleXMiLCJwcm9wZXJ0eUluZm9zIiwiZmluZCIsInB1c2giLCJyZWxhdGVkQ29sdW1ucyIsIl9jcmVhdGVSZWxhdGVkUHJvcGVydGllcyIsImNvbmNhdCIsInVwZGF0ZUJpbmRpbmdJbmZvIiwib01EQ1RhYmxlIiwib0JpbmRpbmdJbmZvIiwiYXBwbHkiLCJjb2xsZWN0aW9uUGF0aCIsIm1vZGVsIiwib0ZpbHRlciIsIkNvcmUiLCJieUlkIiwiZ2V0RmlsdGVyIiwiYkZpbHRlckVuYWJsZWQiLCJpc0ZpbHRlcmluZ0VuYWJsZWQiLCJtQ29uZGl0aW9ucyIsIm9Jbm5lckZpbHRlckluZm8iLCJvT3V0ZXJGaWx0ZXJJbmZvIiwiYUZpbHRlcnMiLCJhVGFibGVQcm9wZXJ0aWVzIiwiZ2V0Q29uZGl0aW9ucyIsIkZpbHRlclV0aWwiLCJnZXRGaWx0ZXJJbmZvIiwiZmlsdGVycyIsImFQYXJhbWV0ZXJOYW1lcyIsIkRlbGVnYXRlVXRpbCIsImdldFBhcmFtZXRlck5hbWVzIiwiX3VwZGF0ZVByb3BlcnR5SW5mbyIsInNQYXJhbWV0ZXJQYXRoIiwiZ2V0UGFyYW1ldGVyc0luZm8iLCJwYXJhbWV0ZXJzIiwiJHNlYXJjaCIsIkNvbW1vblV0aWxzIiwibm9ybWFsaXplU2VhcmNoVGVybSIsImdldFNlYXJjaCIsIl9hcHBseURlZmF1bHRTb3J0aW5nIiwiJHNlbGVjdCIsInJlZHVjZSIsInNRdWVyeSIsIm9Qcm9wZXJ0eSIsImluZGV4T2YiLCIkY291bnQiLCJNb2RlbEhlbHBlciIsImlzRHJhZnRTdXBwb3J0ZWQiLCJGaWx0ZXIiLCJGaWx0ZXJPcGVyYXRvciIsIkVRIiwib1BheWxvYWQiLCJzb3J0ZXIiLCJkZWZhdWx0U29ydFByb3BlcnR5TmFtZSIsIlNvcnRlciIsImFDb25kaXRpb25LZXkiLCJjb25kaXRpb25LZXkiLCJmaW5kSW5kZXgiLCJ0YWJsZVByb3BlcnR5Iiwib0NvbHVtbkRlZiIsImdldE9iamVjdCIsInVwZGF0ZUJpbmRpbmciLCJvQmluZGluZyIsImJOZWVkTWFudWFsUmVmcmVzaCIsIm9JbnRlcm5hbEJpbmRpbmdDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJzTWFudWFsVXBkYXRlUHJvcGVydHlLZXkiLCJiUGVuZGluZ01hbnVhbFVwZGF0ZSIsImdldFByb3BlcnR5Iiwib1Jvd0JpbmRpbmciLCJnZXRSb3dCaW5kaW5nIiwib2xkRmlsdGVycyIsImdldEZpbHRlcnMiLCJkZWVwRXF1YWwiLCJnZXRRdWVyeU9wdGlvbnNGcm9tUGFyYW1ldGVycyIsInNldFByb3BlcnR5IiwicmVxdWVzdFJlZnJlc2giLCJnZXRHcm91cElkIiwiZmluYWxseSIsImNhdGNoIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJmaXJlRXZlbnQiLCJleGlzdGluZ0NvbHVtbnMiLCJyZWxhdGVkUHJvcGVydHlOYW1lTWFwIiwicmVsYXRlZENvbHVtbiIsImNvbHVtbiIsIm5ld05hbWUiLCJ2YWx1ZUhlbHBUYWJsZUNvbHVtbiIsImdldExhYmVsIiwibWFwIiwiY29sdW1uTmFtZSIsInZhbHVlSGVscENvbHVtbiIsImlzTXVsdGlWYWx1ZUZpbHRlckV4cHJlc3Npb24iLCJwcm9wZXJ0eUluZm8iLCJnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aCIsImdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5UGF0aCIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoIiwiZ2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoIiwiZGF0YU1vZGVsQWRkaXRpb25hbFByb3BlcnR5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUYWJsZURlbGVnYXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFByb3BlcnR5IH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBkZWVwRXF1YWwgZnJvbSBcInNhcC9iYXNlL3V0aWwvZGVlcEVxdWFsXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBmZXRjaFR5cGVDb25maWcgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9MaXN0UmVwb3J0L0ZpbHRlckJhclwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IERhdGFNb2RlbE9iamVjdFBhdGgsIGVuaGFuY2VEYXRhTW9kZWxQYXRoLCBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0RGlzcGxheU1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EaXNwbGF5TW9kZUZvcm1hdHRlclwiO1xuaW1wb3J0IHtcblx0Z2V0QXNzb2NpYXRlZEN1cnJlbmN5UHJvcGVydHlQYXRoLFxuXHRnZXRBc3NvY2lhdGVkVGV4dFByb3BlcnR5UGF0aCxcblx0Z2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHlQYXRoLFxuXHRnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5UGF0aCxcblx0Z2V0TGFiZWxcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCBUeXBlVXRpbCBmcm9tIFwic2FwL2ZlL2NvcmUvdHlwZS9UeXBlVXRpbFwiO1xuaW1wb3J0IE1hY3Jvc0RlbGVnYXRlVXRpbCwgeyBtRGVmYXVsdFR5cGVGb3JFZG1UeXBlIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgT0RhdGFNZXRhTW9kZWxVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL09EYXRhTWV0YU1vZGVsVXRpbFwiO1xuaW1wb3J0IHR5cGUgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IFRhYmxlRGVsZWdhdGUgZnJvbSBcInNhcC91aS9tZGMvb2RhdGEvdjQvVGFibGVEZWxlZ2F0ZVwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCBmcm9tIFwic2FwL3VpL21kYy9vZGF0YS92NC91dGlsL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCBGaWx0ZXJVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3V0aWwvRmlsdGVyVXRpbFwiO1xuaW1wb3J0IE1EQ1RhYmxlIGZyb20gXCJzYXAvdWkvbWRjL3ZhbHVlaGVscC9jb250ZW50L01EQ1RhYmxlXCI7XG5pbXBvcnQgRmlsdGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyXCI7XG5pbXBvcnQgRmlsdGVyT3BlcmF0b3IgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJPcGVyYXRvclwiO1xuaW1wb3J0IFNvcnRlciBmcm9tIFwic2FwL3VpL21vZGVsL1NvcnRlclwiO1xuXG5leHBvcnQgdHlwZSBWYWx1ZUhlbHBUYWJsZUNvbHVtbiA9IHtcblx0bmFtZTogc3RyaW5nO1xuXHRwcm9wZXJ0eUluZm9zPzogc3RyaW5nW107XG5cdHNvcnRhYmxlPzogYm9vbGVhbjtcblx0cGF0aD86IHN0cmluZztcblx0bGFiZWw/OiBzdHJpbmc7XG5cdGZpbHRlcmFibGU/OiBib29sZWFuO1xuXHR0eXBlQ29uZmlnPzogT2JqZWN0O1xuXHRtYXhDb25kaXRpb25zPzogbnVtYmVyO1xufTtcbnR5cGUgQ29tcGxleFByb3BlcnR5TWFwID0gUmVjb3JkPHN0cmluZywgUHJvcGVydHk+O1xuXG4vKipcbiAqIFRlc3QgZGVsZWdhdGUgZm9yIE9EYXRhIFY0LlxuICovXG5jb25zdCBPRGF0YVRhYmxlRGVsZWdhdGUgPSBPYmplY3QuYXNzaWduKHt9LCBUYWJsZURlbGVnYXRlKTtcblxuT0RhdGFUYWJsZURlbGVnYXRlLmZldGNoUHJvcGVydGllcyA9IGZ1bmN0aW9uIChvVGFibGU6IFRhYmxlKSB7XG5cdGNvbnN0IG9Nb2RlbCA9IHRoaXMuX2dldE1vZGVsKG9UYWJsZSk7XG5cdGxldCBwQ3JlYXRlUHJvcGVydHlJbmZvcztcblxuXHRpZiAoIW9Nb2RlbCkge1xuXHRcdHBDcmVhdGVQcm9wZXJ0eUluZm9zID0gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdG9UYWJsZS5hdHRhY2hNb2RlbENvbnRleHRDaGFuZ2UoXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRyZXNvbHZlcjogcmVzb2x2ZVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvbk1vZGVsQ29udGV4dENoYW5nZSBhcyBhbnksXG5cdFx0XHRcdHRoaXNcblx0XHRcdCk7XG5cdFx0fSkudGhlbigob1N1Yk1vZGVsKSA9PiB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fY3JlYXRlUHJvcGVydHlJbmZvcyhvVGFibGUsIG9TdWJNb2RlbCk7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cENyZWF0ZVByb3BlcnR5SW5mb3MgPSB0aGlzLl9jcmVhdGVQcm9wZXJ0eUluZm9zKG9UYWJsZSwgb01vZGVsKTtcblx0fVxuXG5cdHJldHVybiBwQ3JlYXRlUHJvcGVydHlJbmZvcy50aGVuKGZ1bmN0aW9uIChhUHJvcGVydGllczogYW55KSB7XG5cdFx0aWYgKG9UYWJsZS5kYXRhKSB7XG5cdFx0XHRvVGFibGUuZGF0YShcIiR0YWJsZVByb3BlcnR5SW5mb1wiLCBhUHJvcGVydGllcyk7XG5cdFx0fVxuXHRcdHJldHVybiBhUHJvcGVydGllcztcblx0fSk7XG59O1xuXG5mdW5jdGlvbiBvbk1vZGVsQ29udGV4dENoYW5nZSh0aGlzOiB0eXBlb2YgT0RhdGFUYWJsZURlbGVnYXRlLCBvRXZlbnQ6IEV2ZW50LCBvRGF0YTogYW55KSB7XG5cdGNvbnN0IG9UYWJsZSA9IG9FdmVudC5nZXRTb3VyY2UoKSBhcyBUYWJsZTtcblx0Y29uc3Qgb01vZGVsID0gdGhpcy5fZ2V0TW9kZWwob1RhYmxlKTtcblxuXHRpZiAob01vZGVsKSB7XG5cdFx0b1RhYmxlLmRldGFjaE1vZGVsQ29udGV4dENoYW5nZShvbk1vZGVsQ29udGV4dENoYW5nZSBhcyBhbnkpO1xuXHRcdG9EYXRhLnJlc29sdmVyKG9Nb2RlbCk7XG5cdH1cbn1cbi8qKlxuICogQ29sbGVjdCByZWxhdGVkIHByb3BlcnRpZXMgZnJvbSBhIHByb3BlcnR5J3MgYW5ub3RhdGlvbnMuXG4gKiBAcGFyYW0gZGF0YU1vZGVsUHJvcGVydHlQYXRoIFRoZSBtb2RlbCBvYmplY3QgcGF0aCBvZiB0aGUgcHJvcGVydHkuXG4gKiBAcmV0dXJucyBUaGUgcmVsYXRlZCBwcm9wZXJ0aWVzIHRoYXQgd2VyZSBpZGVudGlmaWVkLlxuICovXG5mdW5jdGlvbiBfY29sbGVjdFJlbGF0ZWRQcm9wZXJ0aWVzKGRhdGFNb2RlbFByb3BlcnR5UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRjb25zdCBkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHlQYXRoID0gX2dldEFkZGl0aW9uYWxQcm9wZXJ0eShkYXRhTW9kZWxQcm9wZXJ0eVBhdGgpO1xuXHRjb25zdCByZWxhdGVkUHJvcGVydGllczogQ29tcGxleFByb3BlcnR5TWFwID0ge307XG5cdGlmIChkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHlQYXRoPy50YXJnZXRPYmplY3QpIHtcblx0XHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHkgPSBkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHlQYXRoLnRhcmdldE9iamVjdDtcblx0XHRjb25zdCBhZGRpdGlvbmFsUHJvcGVydHlQYXRoID0gZGF0YU1vZGVsQWRkaXRpb25hbFByb3BlcnR5UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5sZW5ndGhcblx0XHRcdD8gZ2V0VGFyZ2V0T2JqZWN0UGF0aChkYXRhTW9kZWxBZGRpdGlvbmFsUHJvcGVydHlQYXRoLCB0cnVlKVxuXHRcdFx0OiBhZGRpdGlvbmFsUHJvcGVydHkubmFtZTtcblxuXHRcdGNvbnN0IHByb3BlcnR5ID0gZGF0YU1vZGVsUHJvcGVydHlQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eTtcblx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSBkYXRhTW9kZWxQcm9wZXJ0eVBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoXG5cdFx0XHQ/IGdldFRhcmdldE9iamVjdFBhdGgoZGF0YU1vZGVsUHJvcGVydHlQYXRoLCB0cnVlKVxuXHRcdFx0OiBwcm9wZXJ0eS5uYW1lO1xuXG5cdFx0Y29uc3QgdGV4dEFubm90YXRpb24gPSBwcm9wZXJ0eS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0LFxuXHRcdFx0dGV4dEFycmFuZ2VtZW50ID0gdGV4dEFubm90YXRpb24/LmFubm90YXRpb25zPy5VST8uVGV4dEFycmFuZ2VtZW50Py50b1N0cmluZygpLFxuXHRcdFx0ZGlzcGxheU1vZGUgPSB0ZXh0QW5ub3RhdGlvbiAmJiB0ZXh0QXJyYW5nZW1lbnQgJiYgZ2V0RGlzcGxheU1vZGUocHJvcGVydHkpO1xuXG5cdFx0aWYgKGRpc3BsYXlNb2RlID09PSBcIkRlc2NyaXB0aW9uXCIpIHtcblx0XHRcdHJlbGF0ZWRQcm9wZXJ0aWVzW2FkZGl0aW9uYWxQcm9wZXJ0eVBhdGhdID0gYWRkaXRpb25hbFByb3BlcnR5O1xuXHRcdH0gZWxzZSBpZiAoKGRpc3BsYXlNb2RlICYmIGRpc3BsYXlNb2RlICE9PSBcIlZhbHVlXCIpIHx8ICF0ZXh0QW5ub3RhdGlvbikge1xuXHRcdFx0cmVsYXRlZFByb3BlcnRpZXNbcHJvcGVydHlQYXRoXSA9IHByb3BlcnR5O1xuXHRcdFx0cmVsYXRlZFByb3BlcnRpZXNbYWRkaXRpb25hbFByb3BlcnR5UGF0aF0gPSBhZGRpdGlvbmFsUHJvcGVydHk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiByZWxhdGVkUHJvcGVydGllcztcbn1cblxuT0RhdGFUYWJsZURlbGVnYXRlLl9jcmVhdGVQcm9wZXJ0eUluZm9zID0gZnVuY3Rpb24gKG9UYWJsZTogYW55LCBvTW9kZWw6IGFueSkge1xuXHRjb25zdCBvTWV0YWRhdGFJbmZvID0gb1RhYmxlLmdldERlbGVnYXRlKCkucGF5bG9hZDtcblx0Y29uc3QgYVByb3BlcnRpZXM6IFZhbHVlSGVscFRhYmxlQ29sdW1uW10gPSBbXTtcblx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBgLyR7b01ldGFkYXRhSW5mby5jb2xsZWN0aW9uTmFtZX1gO1xuXHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXG5cdHJldHVybiBvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9QGApLnRoZW4oZnVuY3Rpb24gKG1FbnRpdHlTZXRBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0Y29uc3Qgb1NvcnRSZXN0cmljdGlvbnMgPSBtRW50aXR5U2V0QW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Tb3J0UmVzdHJpY3Rpb25zXCJdO1xuXHRcdGNvbnN0IG9Tb3J0UmVzdHJpY3Rpb25zSW5mbyA9IE9EYXRhTWV0YU1vZGVsVXRpbC5nZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyhvU29ydFJlc3RyaWN0aW9ucyk7XG5cdFx0Y29uc3Qgb0ZpbHRlclJlc3RyaWN0aW9ucyA9IG1FbnRpdHlTZXRBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlclJlc3RyaWN0aW9uc1wiXTtcblx0XHRjb25zdCBvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbyA9IE9EYXRhTWV0YU1vZGVsVXRpbC5nZXRGaWx0ZXJSZXN0cmljdGlvbnNJbmZvKG9GaWx0ZXJSZXN0cmljdGlvbnMpO1xuXG5cdFx0Y29uc3QgY3VzdG9tRGF0YUZvckNvbHVtbnMgPSBNYWNyb3NEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwiY29sdW1uc1wiKTtcblx0XHRjb25zdCBwcm9wZXJ0aWVzVG9CZUNyZWF0ZWQ6IFJlY29yZDxzdHJpbmcsIFByb3BlcnR5PiA9IHt9O1xuXHRcdGNvbnN0IGRhdGFNb2RlbEVudGl0eVBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob1RhYmxlLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0Q29udGV4dChzRW50aXR5U2V0UGF0aCkpO1xuXHRcdGN1c3RvbURhdGFGb3JDb2x1bW5zLmN1c3RvbURhdGEuZm9yRWFjaChmdW5jdGlvbiAoY29sdW1uRGVmOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Qcm9wZXJ0eUluZm86IFZhbHVlSGVscFRhYmxlQ29sdW1uID0ge1xuXHRcdFx0XHRuYW1lOiBjb2x1bW5EZWYucGF0aCxcblx0XHRcdFx0bGFiZWw6IGNvbHVtbkRlZi5sYWJlbCxcblx0XHRcdFx0c29ydGFibGU6IF9pc1NvcnRhYmxlUHJvcGVydHkob1NvcnRSZXN0cmljdGlvbnNJbmZvLCBjb2x1bW5EZWYpLFxuXHRcdFx0XHRmaWx0ZXJhYmxlOiBfaXNGaWx0ZXJhYmxlUHJvcGVydHkob0ZpbHRlclJlc3RyaWN0aW9uc0luZm8sIGNvbHVtbkRlZiksXG5cdFx0XHRcdG1heENvbmRpdGlvbnM6IF9nZXRQcm9wZXJ0eU1heENvbmRpdGlvbnMob0ZpbHRlclJlc3RyaWN0aW9uc0luZm8sIGNvbHVtbkRlZiksXG5cdFx0XHRcdHR5cGVDb25maWc6IE1hY3Jvc0RlbGVnYXRlVXRpbC5pc1R5cGVGaWx0ZXJhYmxlKGNvbHVtbkRlZi4kVHlwZSlcblx0XHRcdFx0XHQ/IG9UYWJsZS5nZXRUeXBlVXRpbCgpLmdldFR5cGVDb25maWcoY29sdW1uRGVmLiRUeXBlKVxuXHRcdFx0XHRcdDogdW5kZWZpbmVkXG5cdFx0XHR9O1xuXG5cdFx0XHRjb25zdCBkYXRhTW9kZWxQcm9wZXJ0eVBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChkYXRhTW9kZWxFbnRpdHlQYXRoLCBjb2x1bW5EZWYucGF0aCk7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eSA9IGRhdGFNb2RlbFByb3BlcnR5UGF0aC50YXJnZXRPYmplY3QgYXMgUHJvcGVydHk7XG5cdFx0XHRpZiAocHJvcGVydHkpIHtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0UHJvcGVydHlQYXRoID0gZGF0YU1vZGVsUHJvcGVydHlQYXRoLm5hdmlnYXRpb25Qcm9wZXJ0aWVzLmxlbmd0aFxuXHRcdFx0XHRcdD8gZ2V0VGFyZ2V0T2JqZWN0UGF0aChkYXRhTW9kZWxQcm9wZXJ0eVBhdGgsIHRydWUpXG5cdFx0XHRcdFx0OiBwcm9wZXJ0eS5uYW1lO1xuXHRcdFx0XHRsZXQgb1R5cGVDb25maWc7XG5cdFx0XHRcdGlmIChNYWNyb3NEZWxlZ2F0ZVV0aWwuaXNUeXBlRmlsdGVyYWJsZShwcm9wZXJ0eS50eXBlIGFzIGtleW9mIHR5cGVvZiBtRGVmYXVsdFR5cGVGb3JFZG1UeXBlKSkge1xuXHRcdFx0XHRcdGNvbnN0IHByb3BlcnR5VHlwZUNvbmZpZyA9IGZldGNoVHlwZUNvbmZpZyhwcm9wZXJ0eSk7XG5cdFx0XHRcdFx0b1R5cGVDb25maWcgPVxuXHRcdFx0XHRcdFx0VHlwZVV0aWwuZ2V0VHlwZUNvbmZpZyhwcm9wZXJ0eVR5cGVDb25maWcudHlwZSwgcHJvcGVydHlUeXBlQ29uZmlnLmZvcm1hdE9wdGlvbnMsIHByb3BlcnR5VHlwZUNvbmZpZy5jb25zdHJhaW50cykgPz9cblx0XHRcdFx0XHRcdG9UYWJsZS5nZXRUeXBlVXRpbCgpLmdldFR5cGVDb25maWcoY29sdW1uRGVmLiRUeXBlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvL0NoZWNrIGlmIHRoZXJlIGlzIGFuIGFkZGl0aW9uYWwgcHJvcGVydHkgbGlua2VkIHRvIHRoZSBwcm9wZXJ0eSBhcyBhIFVuaXQsIEN1cnJlbmN5LCBUaW1lem9uZSBvciB0ZXh0QXJyYW5nZW1lbnRcblx0XHRcdFx0Y29uc3QgcmVsYXRlZFByb3BlcnRpZXNJbmZvID0gX2NvbGxlY3RSZWxhdGVkUHJvcGVydGllcyhkYXRhTW9kZWxQcm9wZXJ0eVBhdGgpO1xuXHRcdFx0XHRjb25zdCByZWxhdGVkUHJvcGVydHlQYXRoczogc3RyaW5nW10gPSBPYmplY3Qua2V5cyhyZWxhdGVkUHJvcGVydGllc0luZm8pO1xuXG5cdFx0XHRcdGlmIChyZWxhdGVkUHJvcGVydHlQYXRocy5sZW5ndGgpIHtcblx0XHRcdFx0XHRvUHJvcGVydHlJbmZvLnByb3BlcnR5SW5mb3MgPSByZWxhdGVkUHJvcGVydHlQYXRocztcblx0XHRcdFx0XHQvL0NvbXBsZXggcHJvcGVydGllcyBtdXN0IGJlIGhpZGRlbiBmb3Igc29ydGluZyBhbmQgZmlsdGVyaW5nXG5cdFx0XHRcdFx0b1Byb3BlcnR5SW5mby5zb3J0YWJsZSA9IGZhbHNlO1xuXHRcdFx0XHRcdG9Qcm9wZXJ0eUluZm8uZmlsdGVyYWJsZSA9IGZhbHNlO1xuXHRcdFx0XHRcdC8vIENvbGxlY3QgaW5mb3JtYXRpb24gb2YgcmVsYXRlZCBjb2x1bW5zIHRvIGJlIGNyZWF0ZWQuXG5cdFx0XHRcdFx0cmVsYXRlZFByb3BlcnR5UGF0aHMuZm9yRWFjaCgocGF0aCkgPT4ge1xuXHRcdFx0XHRcdFx0cHJvcGVydGllc1RvQmVDcmVhdGVkW3BhdGhdID0gcmVsYXRlZFByb3BlcnRpZXNJbmZvW3BhdGhdO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdC8vIEFsc28gYWRkIHByb3BlcnR5IGZvciB0aGUgaW5PdXQgUGFyYW1ldGVycyBvbiB0aGUgVmFsdWVIZWxwIHdoZW4gdGV4dEFycmFuZ2VtZW50IGlzIHNldCB0byAjVGV4dE9ubHlcblx0XHRcdFx0XHQvLyBJdCB3aWxsIG5vdCBiZSBsaW5rZWQgdG8gdGhlIGNvbXBsZXggUHJvcGVydHkgKEJDUCAyMjcwMTQxMTU0KVxuXHRcdFx0XHRcdGlmICghcmVsYXRlZFByb3BlcnR5UGF0aHMuZmluZCgocGF0aCkgPT4gcmVsYXRlZFByb3BlcnRpZXNJbmZvW3BhdGhdID09PSBwcm9wZXJ0eSkpIHtcblx0XHRcdFx0XHRcdHByb3BlcnRpZXNUb0JlQ3JlYXRlZFt0YXJnZXRQcm9wZXJ0eVBhdGhdID0gcHJvcGVydHk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9Qcm9wZXJ0eUluZm8ucGF0aCA9IGNvbHVtbkRlZi5wYXRoO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9Qcm9wZXJ0eUluZm8udHlwZUNvbmZpZyA9IG9Qcm9wZXJ0eUluZm8udHlwZUNvbmZpZyA/IG9UeXBlQ29uZmlnIDogdW5kZWZpbmVkO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b1Byb3BlcnR5SW5mby5wYXRoID0gY29sdW1uRGVmLnBhdGg7XG5cdFx0XHR9XG5cdFx0XHRhUHJvcGVydGllcy5wdXNoKG9Qcm9wZXJ0eUluZm8pO1xuXHRcdH0pO1xuXHRcdGNvbnN0IHJlbGF0ZWRDb2x1bW5zID0gX2NyZWF0ZVJlbGF0ZWRQcm9wZXJ0aWVzKHByb3BlcnRpZXNUb0JlQ3JlYXRlZCwgYVByb3BlcnRpZXMsIG9Tb3J0UmVzdHJpY3Rpb25zSW5mbywgb0ZpbHRlclJlc3RyaWN0aW9uc0luZm8pO1xuXHRcdHJldHVybiBhUHJvcGVydGllcy5jb25jYXQocmVsYXRlZENvbHVtbnMpO1xuXHR9KTtcbn07XG5cbi8qKlxuICogVXBkYXRlcyB0aGUgYmluZGluZyBpbmZvIHdpdGggdGhlIHJlbGV2YW50IHBhdGggYW5kIG1vZGVsIGZyb20gdGhlIG1ldGFkYXRhLlxuICogQHBhcmFtIG9NRENUYWJsZSBUaGUgTURDVGFibGUgaW5zdGFuY2VcbiAqIEBwYXJhbSBvQmluZGluZ0luZm8gVGhlIGJpbmRpbmdJbmZvIG9mIHRoZSB0YWJsZVxuICovXG5PRGF0YVRhYmxlRGVsZWdhdGUudXBkYXRlQmluZGluZ0luZm8gPSBmdW5jdGlvbiAob01EQ1RhYmxlOiBhbnksIG9CaW5kaW5nSW5mbzogYW55KSB7XG5cdFRhYmxlRGVsZWdhdGUudXBkYXRlQmluZGluZ0luZm8uYXBwbHkodGhpcywgW29NRENUYWJsZSwgb0JpbmRpbmdJbmZvXSk7XG5cdGlmICghb01EQ1RhYmxlKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3Qgb01ldGFkYXRhSW5mbyA9IG9NRENUYWJsZS5nZXREZWxlZ2F0ZSgpLnBheWxvYWQ7XG5cblx0aWYgKG9NZXRhZGF0YUluZm8gJiYgb0JpbmRpbmdJbmZvKSB7XG5cdFx0b0JpbmRpbmdJbmZvLnBhdGggPSBvQmluZGluZ0luZm8ucGF0aCB8fCBvTWV0YWRhdGFJbmZvLmNvbGxlY3Rpb25QYXRoIHx8IGAvJHtvTWV0YWRhdGFJbmZvLmNvbGxlY3Rpb25OYW1lfWA7XG5cdFx0b0JpbmRpbmdJbmZvLm1vZGVsID0gb0JpbmRpbmdJbmZvLm1vZGVsIHx8IG9NZXRhZGF0YUluZm8ubW9kZWw7XG5cdH1cblxuXHRpZiAoIW9CaW5kaW5nSW5mbykge1xuXHRcdG9CaW5kaW5nSW5mbyA9IHt9O1xuXHR9XG5cblx0Y29uc3Qgb0ZpbHRlciA9IENvcmUuYnlJZChvTURDVGFibGUuZ2V0RmlsdGVyKCkpIGFzIGFueSxcblx0XHRiRmlsdGVyRW5hYmxlZCA9IG9NRENUYWJsZS5pc0ZpbHRlcmluZ0VuYWJsZWQoKTtcblx0bGV0IG1Db25kaXRpb25zOiBhbnk7XG5cdGxldCBvSW5uZXJGaWx0ZXJJbmZvLCBvT3V0ZXJGaWx0ZXJJbmZvOiBhbnk7XG5cdGNvbnN0IGFGaWx0ZXJzID0gW107XG5cdGNvbnN0IGFUYWJsZVByb3BlcnRpZXMgPSBvTURDVGFibGUuZGF0YShcIiR0YWJsZVByb3BlcnR5SW5mb1wiKTtcblxuXHQvL1RPRE86IGNvbnNpZGVyIGEgbWVjaGFuaXNtICgnRmlsdGVyTWVyZ2VVdGlsJyBvciBlbmhhbmNlICdGaWx0ZXJVdGlsJykgdG8gYWxsb3cgdGhlIGNvbm5lY3Rpb24gYmV0d2VlbiBkaWZmZXJlbnQgZmlsdGVycylcblx0aWYgKGJGaWx0ZXJFbmFibGVkKSB7XG5cdFx0bUNvbmRpdGlvbnMgPSBvTURDVGFibGUuZ2V0Q29uZGl0aW9ucygpO1xuXHRcdG9Jbm5lckZpbHRlckluZm8gPSBGaWx0ZXJVdGlsLmdldEZpbHRlckluZm8ob01EQ1RhYmxlLCBtQ29uZGl0aW9ucywgYVRhYmxlUHJvcGVydGllcywgW10pIGFzIGFueTtcblx0XHRpZiAob0lubmVyRmlsdGVySW5mby5maWx0ZXJzKSB7XG5cdFx0XHRhRmlsdGVycy5wdXNoKG9Jbm5lckZpbHRlckluZm8uZmlsdGVycyk7XG5cdFx0fVxuXHR9XG5cblx0aWYgKG9GaWx0ZXIpIHtcblx0XHRtQ29uZGl0aW9ucyA9IG9GaWx0ZXIuZ2V0Q29uZGl0aW9ucygpO1xuXHRcdGlmIChtQ29uZGl0aW9ucykge1xuXHRcdFx0Y29uc3QgYVBhcmFtZXRlck5hbWVzID0gRGVsZWdhdGVVdGlsLmdldFBhcmFtZXRlck5hbWVzKG9GaWx0ZXIpO1xuXHRcdFx0Ly8gVGhlIHRhYmxlIHByb3BlcnRpZXMgbmVlZHMgdG8gdXBkYXRlZCB3aXRoIHRoZSBmaWx0ZXIgZmllbGQgaWYgbm8gU2VsZWN0aW9uZmllcmxkcyBhcmUgYW5ub3RhdGVkIGFuZCBub3QgcGFydCBhcyB2YWx1ZSBoZWxwIHBhcmFtZXRlclxuXHRcdFx0T0RhdGFUYWJsZURlbGVnYXRlLl91cGRhdGVQcm9wZXJ0eUluZm8oYVRhYmxlUHJvcGVydGllcywgb01EQ1RhYmxlLCBtQ29uZGl0aW9ucywgb01ldGFkYXRhSW5mbyk7XG5cdFx0XHRvT3V0ZXJGaWx0ZXJJbmZvID0gRmlsdGVyVXRpbC5nZXRGaWx0ZXJJbmZvKG9GaWx0ZXIsIG1Db25kaXRpb25zLCBhVGFibGVQcm9wZXJ0aWVzLCBhUGFyYW1ldGVyTmFtZXMpO1xuXG5cdFx0XHRpZiAob091dGVyRmlsdGVySW5mby5maWx0ZXJzKSB7XG5cdFx0XHRcdGFGaWx0ZXJzLnB1c2gob091dGVyRmlsdGVySW5mby5maWx0ZXJzKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3Qgc1BhcmFtZXRlclBhdGggPSBEZWxlZ2F0ZVV0aWwuZ2V0UGFyYW1ldGVyc0luZm8ob0ZpbHRlciwgbUNvbmRpdGlvbnMpO1xuXHRcdFx0aWYgKHNQYXJhbWV0ZXJQYXRoKSB7XG5cdFx0XHRcdG9CaW5kaW5nSW5mby5wYXRoID0gc1BhcmFtZXRlclBhdGg7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gZ2V0IHRoZSBiYXNpYyBzZWFyY2hcblx0XHRvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoID0gQ29tbW9uVXRpbHMubm9ybWFsaXplU2VhcmNoVGVybShvRmlsdGVyLmdldFNlYXJjaCgpKSB8fCB1bmRlZmluZWQ7XG5cdH1cblxuXHR0aGlzLl9hcHBseURlZmF1bHRTb3J0aW5nKG9CaW5kaW5nSW5mbywgb01EQ1RhYmxlLmdldERlbGVnYXRlKCkucGF5bG9hZCk7XG5cdC8vIGFkZCBzZWxlY3QgdG8gb0JpbmRpbmdJbmZvIChCQ1AgMjE3MDE2MzAxMilcblx0b0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlbGVjdCA9IGFUYWJsZVByb3BlcnRpZXMucmVkdWNlKGZ1bmN0aW9uIChzUXVlcnk6IHN0cmluZywgb1Byb3BlcnR5OiBhbnkpIHtcblx0XHQvLyBOYXZpZ2F0aW9uIHByb3BlcnRpZXMgKHJlcHJlc2VudGVkIGJ5IFgvWSkgc2hvdWxkIG5vdCBiZSBhZGRlZCB0byAkc2VsZWN0LlxuXHRcdC8vIFRvRG8gOiBUaGV5IHNob3VsZCBiZSBhZGRlZCBhcyAkZXhwYW5kPVgoJHNlbGVjdD1ZKSBpbnN0ZWFkXG5cdFx0aWYgKG9Qcm9wZXJ0eS5wYXRoICYmIG9Qcm9wZXJ0eS5wYXRoLmluZGV4T2YoXCIvXCIpID09PSAtMSkge1xuXHRcdFx0c1F1ZXJ5ID0gc1F1ZXJ5ID8gYCR7c1F1ZXJ5fSwke29Qcm9wZXJ0eS5wYXRofWAgOiBvUHJvcGVydHkucGF0aDtcblx0XHR9XG5cdFx0cmV0dXJuIHNRdWVyeTtcblx0fSwgXCJcIik7XG5cblx0Ly8gQWRkICRjb3VudFxuXHRvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kY291bnQgPSB0cnVlO1xuXG5cdC8vSWYgdGhlIGVudGl0eSBpcyBEcmFmdEVuYWJsZWQgYWRkIGEgRHJhZnRGaWx0ZXJcblx0aWYgKE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQob01EQ1RhYmxlLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCksIG9CaW5kaW5nSW5mby5wYXRoKSkge1xuXHRcdGFGaWx0ZXJzLnB1c2gobmV3IEZpbHRlcihcIklzQWN0aXZlRW50aXR5XCIsIEZpbHRlck9wZXJhdG9yLkVRLCB0cnVlKSk7XG5cdH1cblxuXHRvQmluZGluZ0luZm8uZmlsdGVycyA9IG5ldyBGaWx0ZXIoYUZpbHRlcnMsIHRydWUpO1xufTtcblxuT0RhdGFUYWJsZURlbGVnYXRlLmdldFR5cGVVdGlsID0gZnVuY3Rpb24gKC8qb1BheWxvYWQqLykge1xuXHRyZXR1cm4gVHlwZVV0aWw7XG59O1xuXG5PRGF0YVRhYmxlRGVsZWdhdGUuX2dldE1vZGVsID0gZnVuY3Rpb24gKG9UYWJsZTogVGFibGUpIHtcblx0Y29uc3Qgb01ldGFkYXRhSW5mbyA9IChvVGFibGUuZ2V0RGVsZWdhdGUoKSBhcyBhbnkpLnBheWxvYWQ7XG5cdHJldHVybiBvVGFibGUuZ2V0TW9kZWwob01ldGFkYXRhSW5mby5tb2RlbCk7XG59O1xuXG4vKipcbiAqIEFwcGxpZXMgYSBkZWZhdWx0IHNvcnQgb3JkZXIgaWYgbmVlZGVkLiBUaGlzIGlzIG9ubHkgdGhlIGNhc2UgaWYgdGhlIHJlcXVlc3QgaXMgbm90IGEgJHNlYXJjaCByZXF1ZXN0XG4gKiAobWVhbnMgdGhlIHBhcmFtZXRlciAkc2VhcmNoIG9mIHRoZSBiaW5kaW5nSW5mbyBpcyB1bmRlZmluZWQpIGFuZCBpZiBub3QgYWxyZWFkeSBhIHNvcnQgb3JkZXIgaXMgc2V0LFxuICogZS5nLiB2aWEgcHJlc2VudGF0aW9uIHZhcmlhbnQgb3IgbWFudWFsIGJ5IHRoZSB1c2VyLlxuICogQHBhcmFtIG9CaW5kaW5nSW5mbyBUaGUgYmluZGluZ0luZm8gb2YgdGhlIHRhYmxlXG4gKiBAcGFyYW0gb1BheWxvYWQgVGhlIHBheWxvYWQgb2YgdGhlIFRhYmxlRGVsZWdhdGVcbiAqL1xuT0RhdGFUYWJsZURlbGVnYXRlLl9hcHBseURlZmF1bHRTb3J0aW5nID0gZnVuY3Rpb24gKG9CaW5kaW5nSW5mbzogYW55LCBvUGF5bG9hZDogYW55KSB7XG5cdGlmIChvQmluZGluZ0luZm8ucGFyYW1ldGVycyAmJiBvQmluZGluZ0luZm8ucGFyYW1ldGVycy4kc2VhcmNoID09IHVuZGVmaW5lZCAmJiBvQmluZGluZ0luZm8uc29ydGVyICYmIG9CaW5kaW5nSW5mby5zb3J0ZXIubGVuZ3RoID09IDApIHtcblx0XHRjb25zdCBkZWZhdWx0U29ydFByb3BlcnR5TmFtZSA9IG9QYXlsb2FkID8gb1BheWxvYWQuZGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUgOiB1bmRlZmluZWQ7XG5cdFx0aWYgKGRlZmF1bHRTb3J0UHJvcGVydHlOYW1lKSB7XG5cdFx0XHRvQmluZGluZ0luZm8uc29ydGVyLnB1c2gobmV3IFNvcnRlcihkZWZhdWx0U29ydFByb3BlcnR5TmFtZSwgZmFsc2UpKTtcblx0XHR9XG5cdH1cbn07XG5cbi8qKlxuICogVXBkYXRlcyB0aGUgdGFibGUgcHJvcGVydGllcyB3aXRoIGZpbHRlciBmaWVsZCBpbmZvcy5cbiAqIEBwYXJhbSBhVGFibGVQcm9wZXJ0aWVzIEFycmF5IHdpdGggdGFibGUgcHJvcGVydGllc1xuICogQHBhcmFtIG9NRENUYWJsZSBUaGUgTURDVGFibGUgaW5zdGFuY2VcbiAqIEBwYXJhbSBtQ29uZGl0aW9ucyBUaGUgY29uZGl0aW9ucyBvZiB0aGUgdGFibGVcbiAqIEBwYXJhbSBvTWV0YWRhdGFJbmZvIFRoZSBtZXRhZGF0YSBpbmZvIG9mIHRoZSBmaWx0ZXIgZmllbGRcbiAqL1xuT0RhdGFUYWJsZURlbGVnYXRlLl91cGRhdGVQcm9wZXJ0eUluZm8gPSBmdW5jdGlvbiAoXG5cdGFUYWJsZVByb3BlcnRpZXM6IGFueVtdLFxuXHRvTURDVGFibGU6IE1EQ1RhYmxlLFxuXHRtQ29uZGl0aW9uczogUmVjb3JkPHN0cmluZywgYW55Pixcblx0b01ldGFkYXRhSW5mbzogYW55XG4pIHtcblx0Y29uc3QgYUNvbmRpdGlvbktleSA9IE9iamVjdC5rZXlzKG1Db25kaXRpb25zKSxcblx0XHRvTWV0YU1vZGVsID0gb01EQ1RhYmxlLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdGFDb25kaXRpb25LZXkuZm9yRWFjaChmdW5jdGlvbiAoY29uZGl0aW9uS2V5OiBhbnkpIHtcblx0XHRpZiAoXG5cdFx0XHRhVGFibGVQcm9wZXJ0aWVzLmZpbmRJbmRleChmdW5jdGlvbiAodGFibGVQcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRcdHJldHVybiB0YWJsZVByb3BlcnR5LnBhdGggPT09IGNvbmRpdGlvbktleTtcblx0XHRcdH0pID09PSAtMVxuXHRcdCkge1xuXHRcdFx0Y29uc3Qgb0NvbHVtbkRlZiA9IHtcblx0XHRcdFx0cGF0aDogY29uZGl0aW9uS2V5LFxuXHRcdFx0XHR0eXBlQ29uZmlnOiBvTURDVGFibGVcblx0XHRcdFx0XHQuZ2V0VHlwZVV0aWwoKVxuXHRcdFx0XHRcdC5nZXRUeXBlQ29uZmlnKG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtvTWV0YWRhdGFJbmZvLmNvbGxlY3Rpb25OYW1lfS8ke2NvbmRpdGlvbktleX1gKS4kVHlwZSlcblx0XHRcdH07XG5cdFx0XHRhVGFibGVQcm9wZXJ0aWVzLnB1c2gob0NvbHVtbkRlZik7XG5cdFx0fVxuXHR9KTtcbn07XG5cbk9EYXRhVGFibGVEZWxlZ2F0ZS51cGRhdGVCaW5kaW5nID0gZnVuY3Rpb24gKG9UYWJsZTogYW55LCBvQmluZGluZ0luZm86IGFueSwgb0JpbmRpbmc6IGFueSkge1xuXHRsZXQgYk5lZWRNYW51YWxSZWZyZXNoID0gZmFsc2U7XG5cdGNvbnN0IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdGNvbnN0IHNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSA9IFwicGVuZGluZ01hbnVhbEJpbmRpbmdVcGRhdGVcIjtcblx0Y29uc3QgYlBlbmRpbmdNYW51YWxVcGRhdGUgPSBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dD8uZ2V0UHJvcGVydHkoc01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5KTtcblx0bGV0IG9Sb3dCaW5kaW5nID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblxuXHQvL29CaW5kaW5nPW51bGwgbWVhbnMgdGhhdCBhIHJlYmluZGluZyBuZWVkcyB0byBiZSBmb3JjZWQgdmlhIHVwZGF0ZUJpbmRpbmcgaW4gbWRjIFRhYmxlRGVsZWdhdGVcblx0VGFibGVEZWxlZ2F0ZS51cGRhdGVCaW5kaW5nLmFwcGx5KE9EYXRhVGFibGVEZWxlZ2F0ZSwgW29UYWJsZSwgb0JpbmRpbmdJbmZvLCBvQmluZGluZ10pO1xuXHQvL2dldCByb3cgYmluZGluZyBhZnRlciByZWJpbmQgZnJvbSBUYWJsZURlbGVnYXRlLnVwZGF0ZUJpbmRpbmcgaW4gY2FzZSBvQmluZGluZyB3YXMgbnVsbFxuXHRpZiAoIW9Sb3dCaW5kaW5nKSB7XG5cdFx0b1Jvd0JpbmRpbmcgPSBvVGFibGUuZ2V0Um93QmluZGluZygpO1xuXHR9XG5cdGlmIChvUm93QmluZGluZykge1xuXHRcdC8qKlxuXHRcdCAqIE1hbnVhbCByZWZyZXNoIGlmIGZpbHRlcnMgYXJlIG5vdCBjaGFuZ2VkIGJ5IGJpbmRpbmcucmVmcmVzaCgpIHNpbmNlIHVwZGF0aW5nIHRoZSBiaW5kaW5nSW5mb1xuXHRcdCAqIGlzIG5vdCBlbm91Z2ggdG8gdHJpZ2dlciBhIGJhdGNoIHJlcXVlc3QuXG5cdFx0ICogUmVtb3ZpbmcgY29sdW1ucyBjcmVhdGVzIG9uZSBiYXRjaCByZXF1ZXN0IHRoYXQgd2FzIG5vdCBleGVjdXRlZCBiZWZvcmVcblx0XHQgKi9cblx0XHRjb25zdCBvbGRGaWx0ZXJzID0gb1Jvd0JpbmRpbmcuZ2V0RmlsdGVycyhcIkFwcGxpY2F0aW9uXCIpO1xuXHRcdGJOZWVkTWFudWFsUmVmcmVzaCA9XG5cdFx0XHRkZWVwRXF1YWwob0JpbmRpbmdJbmZvLmZpbHRlcnMsIG9sZEZpbHRlcnNbMF0pICYmXG5cdFx0XHRvUm93QmluZGluZy5nZXRRdWVyeU9wdGlvbnNGcm9tUGFyYW1ldGVycygpLiRzZWFyY2ggPT09IG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2ggJiZcblx0XHRcdCFiUGVuZGluZ01hbnVhbFVwZGF0ZTtcblx0fVxuXG5cdGlmIChiTmVlZE1hbnVhbFJlZnJlc2ggJiYgb1RhYmxlLmdldEZpbHRlcigpKSB7XG5cdFx0b0ludGVybmFsQmluZGluZ0NvbnRleHQ/LnNldFByb3BlcnR5KHNNYW51YWxVcGRhdGVQcm9wZXJ0eUtleSwgdHJ1ZSk7XG5cdFx0b1Jvd0JpbmRpbmdcblx0XHRcdC5yZXF1ZXN0UmVmcmVzaChvUm93QmluZGluZy5nZXRHcm91cElkKCkpXG5cdFx0XHQuZmluYWxseShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0Py5zZXRQcm9wZXJ0eShzTWFudWFsVXBkYXRlUHJvcGVydHlLZXksIGZhbHNlKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIHJlZnJlc2hpbmcgYSBmaWx0ZXJCYXIgVkggdGFibGVcIiwgb0Vycm9yKTtcblx0XHRcdH0pO1xuXHR9XG5cdG9UYWJsZS5maXJlRXZlbnQoXCJiaW5kaW5nVXBkYXRlZFwiKTtcblx0Ly9ubyBuZWVkIHRvIGNoZWNrIGZvciBzZW1hbnRpYyB0YXJnZXRzIGhlcmUgc2luY2Ugd2UgYXJlIGluIGEgVkggYW5kIGRvbid0IHdhbnQgdG8gYWxsb3cgZnVydGhlciBuYXZpZ2F0aW9uXG59O1xuXG4vKipcbiAqIENyZWF0ZXMgYSBzaW1wbGUgcHJvcGVydHkgZm9yIGVhY2ggaWRlbnRpZmllZCBjb21wbGV4IHByb3BlcnR5LlxuICogQHBhcmFtIHByb3BlcnRpZXNUb0JlQ3JlYXRlZCBJZGVudGlmaWVkIHByb3BlcnRpZXMuXG4gKiBAcGFyYW0gZXhpc3RpbmdDb2x1bW5zIFRoZSBsaXN0IG9mIGNvbHVtbnMgY3JlYXRlZCBmb3IgcHJvcGVydGllcyBkZWZpbmVkIG9uIHRoZSBWYWx1ZSBMaXN0LlxuICogQHBhcmFtIG9Tb3J0UmVzdHJpY3Rpb25zSW5mbyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgc29ydCByZXN0cmljdGlvbiBpbmZvcm1hdGlvblxuICogQHBhcmFtIG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvIEFuIG9iamVjdCBjb250YWluaW5nIHRoZSBmaWx0ZXIgcmVzdHJpY3Rpb24gaW5mb3JtYXRpb25cbiAqIEByZXR1cm5zIFRoZSBhcnJheSBvZiBwcm9wZXJ0aWVzIGNyZWF0ZWQuXG4gKi9cbmZ1bmN0aW9uIF9jcmVhdGVSZWxhdGVkUHJvcGVydGllcyhcblx0cHJvcGVydGllc1RvQmVDcmVhdGVkOiBSZWNvcmQ8c3RyaW5nLCBQcm9wZXJ0eT4sXG5cdGV4aXN0aW5nQ29sdW1uczogVmFsdWVIZWxwVGFibGVDb2x1bW5bXSxcblx0b1NvcnRSZXN0cmljdGlvbnNJbmZvOiBhbnksXG5cdG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvOiBhbnlcbik6IFZhbHVlSGVscFRhYmxlQ29sdW1uW10ge1xuXHRjb25zdCByZWxhdGVkUHJvcGVydHlOYW1lTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge30sXG5cdFx0cmVsYXRlZENvbHVtbnM6IFZhbHVlSGVscFRhYmxlQ29sdW1uW10gPSBbXTtcblx0T2JqZWN0LmtleXMocHJvcGVydGllc1RvQmVDcmVhdGVkKS5mb3JFYWNoKChwYXRoKSA9PiB7XG5cdFx0Y29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0aWVzVG9CZUNyZWF0ZWRbcGF0aF0sXG5cdFx0XHRyZWxhdGVkQ29sdW1uID0gZXhpc3RpbmdDb2x1bW5zLmZpbmQoKGNvbHVtbikgPT4gY29sdW1uLnBhdGggPT09IHBhdGgpOyAvLyBDb21wbGV4IHByb3BlcnRpZXMgZG9lc24ndCBnZXQgcGF0aCBzbyBvbmx5IHNpbXBsZSBjb2x1bW4gYXJlIGZvdW5kXG5cdFx0aWYgKCFyZWxhdGVkQ29sdW1uKSB7XG5cdFx0XHRjb25zdCBuZXdOYW1lID0gYFByb3BlcnR5Ojoke3BhdGh9YDtcblx0XHRcdHJlbGF0ZWRQcm9wZXJ0eU5hbWVNYXBbcGF0aF0gPSBuZXdOYW1lO1xuXHRcdFx0Y29uc3QgdmFsdWVIZWxwVGFibGVDb2x1bW46IFZhbHVlSGVscFRhYmxlQ29sdW1uID0ge1xuXHRcdFx0XHRuYW1lOiBuZXdOYW1lLFxuXHRcdFx0XHRsYWJlbDogZ2V0TGFiZWwocHJvcGVydHkpLFxuXHRcdFx0XHRwYXRoOiBwYXRoLFxuXHRcdFx0XHRzb3J0YWJsZTogX2lzU29ydGFibGVQcm9wZXJ0eShvU29ydFJlc3RyaWN0aW9uc0luZm8sIHByb3BlcnR5KSxcblx0XHRcdFx0ZmlsdGVyYWJsZTogX2lzRmlsdGVyYWJsZVByb3BlcnR5KG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvLCBwcm9wZXJ0eSlcblx0XHRcdH07XG5cdFx0XHR2YWx1ZUhlbHBUYWJsZUNvbHVtbi5tYXhDb25kaXRpb25zID0gX2dldFByb3BlcnR5TWF4Q29uZGl0aW9ucyhvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbywgdmFsdWVIZWxwVGFibGVDb2x1bW4pO1xuXHRcdFx0aWYgKE1hY3Jvc0RlbGVnYXRlVXRpbC5pc1R5cGVGaWx0ZXJhYmxlKHByb3BlcnR5LnR5cGUgYXMga2V5b2YgdHlwZW9mIG1EZWZhdWx0VHlwZUZvckVkbVR5cGUpKSB7XG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5VHlwZUNvbmZpZyA9IGZldGNoVHlwZUNvbmZpZyhwcm9wZXJ0eSk7XG5cdFx0XHRcdHZhbHVlSGVscFRhYmxlQ29sdW1uLnR5cGVDb25maWcgPSBUeXBlVXRpbC5nZXRUeXBlQ29uZmlnKFxuXHRcdFx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZy50eXBlLFxuXHRcdFx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZy5mb3JtYXRPcHRpb25zLFxuXHRcdFx0XHRcdHByb3BlcnR5VHlwZUNvbmZpZy5jb25zdHJhaW50c1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdFx0cmVsYXRlZENvbHVtbnMucHVzaCh2YWx1ZUhlbHBUYWJsZUNvbHVtbik7XG5cdFx0fVxuXHR9KTtcblx0Ly8gVGhlIHByb3BlcnR5ICduYW1lJyBoYXMgYmVlbiBwcmVmaXhlZCB3aXRoICdQcm9wZXJ0eTo6JyBmb3IgdW5pcXVlbmVzcy5cblx0Ly8gVXBkYXRlIHRoZSBzYW1lIGluIG90aGVyIHByb3BlcnR5SW5mb3NbXSByZWZlcmVuY2VzIHdoaWNoIHBvaW50IHRvIHRoaXMgcHJvcGVydHkuXG5cdGV4aXN0aW5nQ29sdW1ucy5mb3JFYWNoKChjb2x1bW4pID0+IHtcblx0XHRpZiAoY29sdW1uLnByb3BlcnR5SW5mb3MpIHtcblx0XHRcdGNvbHVtbi5wcm9wZXJ0eUluZm9zID0gY29sdW1uLnByb3BlcnR5SW5mb3M/Lm1hcCgoY29sdW1uTmFtZSkgPT4gcmVsYXRlZFByb3BlcnR5TmFtZU1hcFtjb2x1bW5OYW1lXSA/PyBjb2x1bW5OYW1lKTtcblx0XHR9XG5cdH0pO1xuXHRyZXR1cm4gcmVsYXRlZENvbHVtbnM7XG59XG4vKipcbiAqIElkZW50aWZpZXMgaWYgdGhlIGdpdmVuIHByb3BlcnR5IGlzIHNvcnRhYmxlIGJhc2VkIG9uIHRoZSBzb3J0IHJlc3RyaWN0aW9uIGluZm9ybWF0aW9uLlxuICogQHBhcmFtIG9Tb3J0UmVzdHJpY3Rpb25zSW5mbyBUaGUgc29ydCByZXN0cmljdGlvbiBpbmZvcm1hdGlvbiBmcm9tIHRoZSByZXN0cmljdGlvbiBhbm5vdGF0aW9uLlxuICogQHBhcmFtIHByb3BlcnR5IFRoZSB0YXJnZXQgcHJvcGVydHkuXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGdpdmVuIHByb3BlcnR5IGlzIHNvcnRhYmxlLlxuICovXG5mdW5jdGlvbiBfaXNTb3J0YWJsZVByb3BlcnR5KG9Tb3J0UmVzdHJpY3Rpb25zSW5mbzogYW55LCBwcm9wZXJ0eTogVmFsdWVIZWxwVGFibGVDb2x1bW4pOiBib29sZWFuIHwgdW5kZWZpbmVkIHtcblx0cmV0dXJuIHByb3BlcnR5LnBhdGggJiYgb1NvcnRSZXN0cmljdGlvbnNJbmZvW3Byb3BlcnR5LnBhdGhdID8gb1NvcnRSZXN0cmljdGlvbnNJbmZvW3Byb3BlcnR5LnBhdGhdLnNvcnRhYmxlIDogcHJvcGVydHkuc29ydGFibGU7XG59XG5cbi8qKlxuICogSWRlbnRpZmllcyBpZiB0aGUgZ2l2ZW4gcHJvcGVydHkgaXMgZmlsdGVyYWJsZSBiYXNlZCBvbiB0aGUgc29ydCByZXN0cmljdGlvbiBpbmZvcm1hdGlvbi5cbiAqIEBwYXJhbSBvRmlsdGVyUmVzdHJpY3Rpb25zSW5mbyBUaGUgZmlsdGVyIHJlc3RyaWN0aW9uIGluZm9ybWF0aW9uIGZyb20gdGhlIHJlc3RyaWN0aW9uIGFubm90YXRpb24uXG4gKiBAcGFyYW0gcHJvcGVydHkgVGhlIHRhcmdldCBwcm9wZXJ0eS5cbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgZ2l2ZW4gcHJvcGVydHkgaXMgZmlsdGVyYWJsZS5cbiAqL1xuZnVuY3Rpb24gX2lzRmlsdGVyYWJsZVByb3BlcnR5KG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvOiBhbnksIHByb3BlcnR5OiBWYWx1ZUhlbHBUYWJsZUNvbHVtbik6IGJvb2xlYW4gfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gcHJvcGVydHkucGF0aCAmJiBvRmlsdGVyUmVzdHJpY3Rpb25zSW5mb1twcm9wZXJ0eS5wYXRoXVxuXHRcdD8gb0ZpbHRlclJlc3RyaWN0aW9uc0luZm9bcHJvcGVydHkucGF0aF0uZmlsdGVyYWJsZVxuXHRcdDogcHJvcGVydHkuZmlsdGVyYWJsZTtcbn1cblxuLyoqXG4gKiBJZGVudGlmaWVzIHRoZSBtYXhDb25kaXRpb25zIGZvciBhIGdpdmVuIHByb3BlcnR5LlxuICogQHBhcmFtIG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvIFRoZSBmaWx0ZXIgcmVzdHJpY3Rpb24gaW5mb3JtYXRpb24gZnJvbSB0aGUgcmVzdHJpY3Rpb24gYW5ub3RhdGlvbi5cbiAqIEBwYXJhbSB2YWx1ZUhlbHBDb2x1bW4gVGhlIHRhcmdldCBwcm9wZXJ0eS5cbiAqIEByZXR1cm5zIGAtMWAgb3IgYDFgIGlmIHRoZSBwcm9wZXJ0eSBpcyBhIE11bHRpVmFsdWVGaWx0ZXJFeHByZXNzaW9uLlxuICovXG5mdW5jdGlvbiBfZ2V0UHJvcGVydHlNYXhDb25kaXRpb25zKG9GaWx0ZXJSZXN0cmljdGlvbnNJbmZvOiBhbnksIHZhbHVlSGVscENvbHVtbjogVmFsdWVIZWxwVGFibGVDb2x1bW4pOiBudW1iZXIge1xuXHRyZXR1cm4gdmFsdWVIZWxwQ29sdW1uLnBhdGggJiZcblx0XHRPRGF0YU1ldGFNb2RlbFV0aWwuaXNNdWx0aVZhbHVlRmlsdGVyRXhwcmVzc2lvbihvRmlsdGVyUmVzdHJpY3Rpb25zSW5mby5wcm9wZXJ0eUluZm9bdmFsdWVIZWxwQ29sdW1uLnBhdGhdKVxuXHRcdD8gLTFcblx0XHQ6IDE7XG59XG5cbi8qKlxuICogSWRlbnRpZmllcyB0aGUgYWRkaXRpb25hbCBwcm9wZXJ0eSB3aGljaCByZWZlcmVuY2VzIHRvIHRoZSB1bml0LCB0aW1lem9uZSwgdGV4dEFycmFuZ2VtZW50IG9yIGN1cnJlbmN5LlxuICogQHBhcmFtIGRhdGFNb2RlbFByb3BlcnR5UGF0aCBUaGUgbW9kZWwgb2JqZWN0IHBhdGggb2YgdGhlIHByb3BlcnR5LlxuICogQHJldHVybnMgVGhlIGFkZGl0aW9uYWwgcHJvcGVydHkuXG4gKi9cblxuZnVuY3Rpb24gX2dldEFkZGl0aW9uYWxQcm9wZXJ0eShkYXRhTW9kZWxQcm9wZXJ0eVBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiBEYXRhTW9kZWxPYmplY3RQYXRoIHwgdW5kZWZpbmVkIHtcblx0Y29uc3Qgb1Byb3BlcnR5ID0gZGF0YU1vZGVsUHJvcGVydHlQYXRoLnRhcmdldE9iamVjdDtcblx0Y29uc3QgYWRkaXRpb25hbFByb3BlcnR5UGF0aCA9XG5cdFx0Z2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eVBhdGgob1Byb3BlcnR5KSB8fFxuXHRcdGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5UGF0aChvUHJvcGVydHkpIHx8XG5cdFx0Z2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eVBhdGgob1Byb3BlcnR5KSB8fFxuXHRcdGdldEFzc29jaWF0ZWRUaW1lem9uZVByb3BlcnR5UGF0aChvUHJvcGVydHkpO1xuXHRpZiAoIWFkZGl0aW9uYWxQcm9wZXJ0eVBhdGgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGNvbnN0IGRhdGFNb2RlbEFkZGl0aW9uYWxQcm9wZXJ0eSA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKGRhdGFNb2RlbFByb3BlcnR5UGF0aCwgYWRkaXRpb25hbFByb3BlcnR5UGF0aCk7XG5cblx0Ly9BZGRpdGlvbmFsIFByb3BlcnR5IGNvdWxkIHJlZmVyIHRvIGEgbmF2aWdhdGlvbiBwcm9wZXJ0eSwga2VlcCB0aGUgbmFtZSBhbmQgcGF0aCBhcyBuYXZpZ2F0aW9uIHByb3BlcnR5XG5cdGNvbnN0IGFkZGl0aW9uYWxQcm9wZXJ0eSA9IGRhdGFNb2RlbEFkZGl0aW9uYWxQcm9wZXJ0eS50YXJnZXRPYmplY3Q7XG5cdGlmICghYWRkaXRpb25hbFByb3BlcnR5KSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXHRyZXR1cm4gZGF0YU1vZGVsQWRkaXRpb25hbFByb3BlcnR5O1xufVxuXG5leHBvcnQgZGVmYXVsdCBPRGF0YVRhYmxlRGVsZWdhdGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBMENBO0FBQ0E7QUFDQTtFQUNBLElBQU1BLGtCQUFrQixHQUFHQyxNQUFNLENBQUNDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRUMsYUFBYSxDQUFDO0VBRTNESCxrQkFBa0IsQ0FBQ0ksZUFBZSxHQUFHLFVBQVVDLE1BQWEsRUFBRTtJQUFBO0lBQzdELElBQU1DLE1BQU0sR0FBRyxJQUFJLENBQUNDLFNBQVMsQ0FBQ0YsTUFBTSxDQUFDO0lBQ3JDLElBQUlHLG9CQUFvQjtJQUV4QixJQUFJLENBQUNGLE1BQU0sRUFBRTtNQUNaRSxvQkFBb0IsR0FBRyxJQUFJQyxPQUFPLENBQUMsVUFBQ0MsT0FBTyxFQUFLO1FBQy9DTCxNQUFNLENBQUNNLHdCQUF3QixDQUM5QjtVQUNDQyxRQUFRLEVBQUVGO1FBQ1gsQ0FBQyxFQUNERyxvQkFBb0IsRUFDcEIsS0FBSSxDQUNKO01BQ0YsQ0FBQyxDQUFDLENBQUNDLElBQUksQ0FBQyxVQUFDQyxTQUFTLEVBQUs7UUFDdEIsT0FBTyxLQUFJLENBQUNDLG9C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