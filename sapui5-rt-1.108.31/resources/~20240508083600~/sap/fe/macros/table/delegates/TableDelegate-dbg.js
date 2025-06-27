/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/deepEqual", "sap/base/util/deepExtend", "sap/fe/core/ActionRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/ValueFormatter", "sap/fe/core/helpers/ExcelFormatHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/type/TypeUtil", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filterBar/FilterBarDelegate", "sap/fe/macros/ResourceModel", "sap/fe/macros/table/TableHelper", "sap/fe/macros/table/TableSizeHelper", "sap/fe/macros/table/Utils", "sap/ui/core/Fragment", "sap/ui/mdc/odata/v4/TableDelegate", "sap/ui/model/Filter", "sap/ui/model/json/JSONModel"], function (Log, deepClone, deepEqual, deepExtend, ActionRuntime, CommonUtils, MetaModelConverter, ValueFormatter, ExcelFormat, ModelHelper, TypeUtil, CommonHelper, DelegateUtil, FilterBarDelegate, ResourceModel, TableHelper, TableSizeHelper, TableUtils, Fragment, TableDelegateBase, Filter, JSONModel) {
  "use strict";

  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  function _finallyRethrows(body, finalizer) {
    try {
      var result = body();
    } catch (e) {
      return finalizer(true, e);
    }
    if (result && result.then) {
      return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
    }
    return finalizer(false, result);
  }
  var FETCHED_PROPERTIES_DATA_KEY = "sap_fe_TableDelegate_propertyInfoMap";
  var SEMANTICKEY_HAS_DRAFTINDICATOR = "/semanticKeyHasDraftIndicator";
  var FilterRestrictions = CommonUtils.FilterRestrictions;
  function _setCachedProperties(oTable, aFetchedProperties, bUseAdditionalProperties) {
    // do not cache during templating, else it becomes part of the cached view
    if (oTable instanceof window.Element) {
      return;
    }
    var key = bUseAdditionalProperties ? "".concat(FETCHED_PROPERTIES_DATA_KEY, "_add") : FETCHED_PROPERTIES_DATA_KEY;
    DelegateUtil.setCustomData(oTable, key, aFetchedProperties);
  }
  function _getCachedProperties(oTable, bUseAdditionalProperties) {
    // properties are not cached during templating
    if (oTable instanceof window.Element) {
      return null;
    }
    var key = bUseAdditionalProperties ? "".concat(FETCHED_PROPERTIES_DATA_KEY, "_add") : FETCHED_PROPERTIES_DATA_KEY;
    return DelegateUtil.getCustomData(oTable, key);
  }
  /**
   * Helper class for sap.ui.mdc.Table.
   * <h3><b>Note:</b></h3>
   * The class is experimental and the API and the behavior are not finalized. This class is not intended for productive usage.
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.69
   * @alias sap.fe.macros.TableDelegate
   */
  return Object.assign({}, TableDelegateBase, {
    /**
     * This function calculates the width for a FieldGroup column.
     * The width of the FieldGroup is the width of the widest property contained in the FieldGroup (including the label if showDataFieldsLabel is true)
     * The result of this calculation is stored in the visualSettings.widthCalculation.minWidth property, which is used by the MDCtable.
     *
     * @param oTable Instance of the MDCtable
     * @param oProperty Current property
     * @param aProperties Array of properties
     * @private
     * @alias sap.fe.macros.TableDelegate
     */
    _computeVisualSettingsForFieldGroup: function (oTable, oProperty, aProperties) {
      if (oProperty.name.indexOf("DataFieldForAnnotation::FieldGroup::") === 0) {
        var oColumn = oTable.getColumns().find(function (oCol) {
          return oCol.getDataProperty() === oProperty.name;
        });
        var bShowDataFieldsLabel = oColumn ? oColumn.data("showDataFieldsLabel") === "true" : false;
        var oMetaModel = oTable.getModel().getMetaModel();
        var oContext = oMetaModel.createBindingContext(oProperty.metadataPath.replace(/@.*/, ""));
        var oDataField = oMetaModel.getObject(oProperty.metadataPath);
        var oFieldGroup = oDataField.Target ? oContext.getObject(oDataField.Target.$AnnotationPath) : null;
        var aFieldWidth = [];
        oFieldGroup.Data.forEach(function (oData) {
          var oDataFieldWidth;
          switch (oData.$Type) {
            case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
              oDataFieldWidth = TableSizeHelper.getWidthForDataFieldForAnnotation(oData, bShowDataFieldsLabel, aProperties, oContext);
              break;
            case "com.sap.vocabularies.UI.v1.DataField":
              if (bShowDataFieldsLabel) {
                oDataFieldWidth = TableSizeHelper.getWidthForDataField(oData, bShowDataFieldsLabel, aProperties, oContext);
              }
              break;
            case "com.sap.vocabularies.UI.v1.DataFieldForAction":
              oDataFieldWidth = {
                labelWidth: 0,
                propertyWidth: TableSizeHelper.getButtonWidth(oData.Label)
              };
              break;
            default:
          }
          if (oDataFieldWidth) {
            aFieldWidth.push(oDataFieldWidth.labelWidth + oDataFieldWidth.propertyWidth);
          }
        });
        var nWidest = aFieldWidth.reduce(function (acc, value) {
          return Math.max(acc, value);
        }, 0);
        oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
          widthCalculation: {
            verticalArrangement: true,
            minWidth: Math.ceil(nWidest)
          }
        });
      }
    },
    _computeVisualSettingsForPropertyWithValueHelp: function (oTable, oProperty) {
      var oTableAPI = oTable ? oTable.getParent() : null;
      if (!oProperty.propertyInfos) {
        var oMetaModel = oTable.getModel().getMetaModel();
        if (oProperty.metadataPath === undefined) {
          throw new Error("a `metadataPath` property is expected when computing VisualSettings for property with ValueHelp");
        }
        var oDataField = oMetaModel.getObject("".concat(oProperty.metadataPath, "@"));
        if (oDataField && oDataField["@com.sap.vocabularies.Common.v1.ValueList"]) {
          oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
            widthCalculation: {
              gap: oTableAPI && oTableAPI.getReadOnly() ? 0 : 4
            }
          });
        }
      }
    },
    _computeVisualSettingsForPropertyWithUnit: function (oTable, oProperty, oUnit, oUnitText, oTimezoneText) {
      var oTableAPI = oTable ? oTable.getParent() : null;
      // update gap for properties with string unit
      var sUnitText = oUnitText || oTimezoneText;
      if (sUnitText) {
        oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
          widthCalculation: {
            gap: Math.ceil(TableSizeHelper.getButtonWidth(sUnitText))
          }
        });
      }
      if (oUnit) {
        oProperty.visualSettings = deepExtend(oProperty.visualSettings, {
          widthCalculation: {
            // For properties with unit, a gap needs to be added to properly render the column width on edit mode
            gap: oTableAPI && oTableAPI.getReadOnly() ? 0 : 6
          }
        });
      }
    },
    _computeLabel: function (property, labelMap) {
      if (property.label) {
        var _property$path;
        var propertiesWithSameLabel = labelMap[property.label];
        if ((propertiesWithSameLabel === null || propertiesWithSameLabel === void 0 ? void 0 : propertiesWithSameLabel.length) > 1 && (_property$path = property.path) !== null && _property$path !== void 0 && _property$path.includes("/") && property.additionalLabels) {
          property.label = property.label + " (" + property.additionalLabels.join(" / ") + ")";
        }
        delete property.additionalLabels;
      }
    },
    //Update VisualSetting for columnWidth calculation and labels on navigation properties
    _updatePropertyInfo: function (table, properties) {
      var _this = this;
      var labelMap = {};
      // Check available p13n modes
      var p13nMode = table.getP13nMode();
      properties.forEach(function (property) {
        if (!property.propertyInfos && property.label) {
          // Only for non-complex properties
          if ((p13nMode === null || p13nMode === void 0 ? void 0 : p13nMode.indexOf("Sort")) > -1 && property.sortable || (p13nMode === null || p13nMode === void 0 ? void 0 : p13nMode.indexOf("Filter")) > -1 && property.filterable || (p13nMode === null || p13nMode === void 0 ? void 0 : p13nMode.indexOf("Group")) > -1 && property.groupable) {
            labelMap[property.label] = labelMap[property.label] !== undefined ? labelMap[property.label].concat([property]) : [property];
          }
        }
      });
      properties.forEach(function (property) {
        _this._computeVisualSettingsForFieldGroup(table, property, properties);
        _this._computeVisualSettingsForPropertyWithValueHelp(table, property);
        // bcp: 2270003577
        // Some columns (eg: custom columns) have no typeConfig property.
        // initializing it prevents an exception throw
        property.typeConfig = deepExtend(property.typeConfig, {});
        _this._computeLabel(property, labelMap);
      });
      return properties;
    },
    getColumnsFor: function (oTable) {
      return oTable.getParent().getTableDefinition().columns;
    },
    _getAggregatedPropertyMap: function (oTable) {
      return oTable.getParent().getTableDefinition().aggregates;
    },
    /**
     * Returns the export capabilities for the given sap.ui.mdc.Table instance.
     *
     * @param oTable Instance of the table
     * @returns Promise representing the export capabilities of the table instance
     */
    fetchExportCapabilities: function (oTable) {
      var oCapabilities = {
        "XLSX": {}
      };
      var oModel;
      return DelegateUtil.fetchModel(oTable).then(function (model) {
        oModel = model;
        return oModel.getMetaModel().getObject("/$EntityContainer@Org.OData.Capabilities.V1.SupportedFormats");
      }).then(function (aSupportedFormats) {
        var aLowerFormats = (aSupportedFormats || []).map(function (element) {
          return element.toLowerCase();
        });
        if (aLowerFormats.indexOf("application/pdf") > -1) {
          return oModel.getMetaModel().getObject("/$EntityContainer@com.sap.vocabularies.PDF.v1.Features");
        }
        return undefined;
      }).then(function (oAnnotation) {
        if (oAnnotation) {
          oCapabilities["PDF"] = Object.assign({}, oAnnotation);
        }
      }).catch(function (err) {
        Log.error("An error occurs while computing export capabilities: ".concat(err));
      }).then(function () {
        return oCapabilities;
      });
    },
    /**
     * Filtering on 1:n navigation properties and navigation
     * properties not part of the LineItem annotation is forbidden.
     *
     * @param columnInfo
     * @param metaModel
     * @param table
     * @returns Boolean true if filtering is allowed, false otherwise
     */
    _isFilterableNavigationProperty: function (columnInfo, metaModel, table) {
      var tableMetaPath = DelegateUtil.getCustomData(table, "metaPath");
      if (!tableMetaPath) {
        return false;
      }
      // get the DataModelObjectPath for the table
      var tableDataModelObjectPath = getInvolvedDataModelObjects(metaModel.getContext(tableMetaPath)),
        // get all navigation properties leading to the column
        columnNavigationProperties = getInvolvedDataModelObjects(metaModel.getContext(columnInfo.annotationPath)).navigationProperties,
        // we are only interested in navigation properties relative to the table, so all before and including the tables targetType can be filtered
        tableTargetEntityIndex = columnNavigationProperties.findIndex(function (prop) {
          var _prop$targetType;
          return ((_prop$targetType = prop.targetType) === null || _prop$targetType === void 0 ? void 0 : _prop$targetType.name) === tableDataModelObjectPath.targetEntityType.name;
        }),
        relativeNavigationProperties = columnNavigationProperties.slice(tableTargetEntityIndex > 0 ? tableTargetEntityIndex : 0);
      return !columnInfo.relativePath.includes("/") || columnInfo.isPartOfLineItem === true && !relativeNavigationProperties.some(function (navigationProperty) {
        return navigationProperty._type == "NavigationProperty" && navigationProperty.isCollection;
      });
    },
    _fetchPropertyInfo: function (oMetaModel, oColumnInfo, oTable, oAppComponent, bUseAdditionalProperties) {
      var sAbsoluteNavigationPath = oColumnInfo.annotationPath,
        oDataField = oMetaModel.getObject(sAbsoluteNavigationPath),
        oNavigationContext = oMetaModel.createBindingContext(sAbsoluteNavigationPath),
        oTypeConfig = oColumnInfo.typeConfig && oColumnInfo.typeConfig.className && DelegateUtil.isTypeFilterable(oColumnInfo.typeConfig.className) ? TypeUtil.getTypeConfig(oColumnInfo.typeConfig.className, oColumnInfo.typeConfig.oFormatOptions, oColumnInfo.typeConfig.oConstraints) : {},
        bFilterable = CommonHelper.isPropertyFilterable(oColumnInfo.relativePath, {
          context: oNavigationContext
        }, oDataField),
        bComplexType = oColumnInfo.typeConfig && oColumnInfo.typeConfig.className.indexOf("Edm.") !== 0,
        bIsAnalyticalTable = DelegateUtil.getCustomData(oTable, "enableAnalytics") === "true",
        aAggregatedPropertyMapUnfilterable = bIsAnalyticalTable ? this._getAggregatedPropertyMap(oTable) : {},
        oExportSettings = oColumnInfo.exportSettings || null,
        exportFormat = oColumnInfo.typeConfig && oColumnInfo.typeConfig.className ? this._getExportFormat(oColumnInfo.typeConfig.className) : undefined;
      var sLabel = oColumnInfo.isDataPointFakeTargetProperty ? ResourceModel.getText("TargetValue") : DelegateUtil.getLocalizedText(oColumnInfo.label, oAppComponent || oTable);
      if (oExportSettings) {
        if (exportFormat && !oExportSettings.timezoneProperty) {
          oExportSettings.format = exportFormat;
        }
        // Set the exportSettings template only if it exists.
        if (oExportSettings.template) {
          oExportSettings.template = oColumnInfo.exportSettings.template;
        }
      }
      var oPropertyInfo = {
        name: oColumnInfo.name,
        metadataPath: sAbsoluteNavigationPath,
        groupLabel: oColumnInfo.groupLabel,
        group: oColumnInfo.group,
        label: sLabel,
        tooltip: oColumnInfo.tooltip,
        typeConfig: oTypeConfig,
        visible: oColumnInfo.availability !== "Hidden" && !bComplexType,
        exportSettings: oExportSettings,
        unit: oColumnInfo.unit
      };

      // Set visualSettings only if it exists
      if (oColumnInfo.visualSettings && Object.keys(oColumnInfo.visualSettings).length > 0) {
        oPropertyInfo.visualSettings = oColumnInfo.visualSettings;
      }
      if (exportFormat) {
        var oTableAPI = oTable ? oTable.getParent() : null;
        // For properties with date/time/dateTime data types, a gap needs to be added to properly render the column width on edit mode
        oPropertyInfo.visualSettings = {
          widthCalculation: {
            // a gap of 1 is still needed because of the padding of the cell
            // BCP: 2180413431
            gap: oTableAPI && oTableAPI.getReadOnly() ? 1 : 1.5
          }
        };
      }

      // MDC expects  'propertyInfos' only for complex properties.
      // An empty array throws validation error and undefined value is unhandled.
      if (oColumnInfo.propertyInfos && oColumnInfo.propertyInfos.length) {
        var _oColumnInfo$exportSe;
        oPropertyInfo.propertyInfos = oColumnInfo.propertyInfos;
        //only in case of complex properties, wrap the cell content	on the excel exported file
        if ((_oColumnInfo$exportSe = oColumnInfo.exportSettings) !== null && _oColumnInfo$exportSe !== void 0 && _oColumnInfo$exportSe.wrap) {
          oPropertyInfo.exportSettings.wrap = oColumnInfo.exportSettings.wrap;
        }
        if (bUseAdditionalProperties && oColumnInfo.additionalPropertyInfos && oColumnInfo.additionalPropertyInfos.length) {
          oPropertyInfo.propertyInfos = oPropertyInfo.propertyInfos.concat(oColumnInfo.additionalPropertyInfos);
        }
      } else {
        // Add properties which are supported only by simple PropertyInfos.
        oPropertyInfo.path = oColumnInfo.relativePath;
        // TODO with the new complex property info, a lot of "Description" fields are added as filter/sort fields
        oPropertyInfo.sortable = oColumnInfo.sortable;
        oPropertyInfo.filterable = !oColumnInfo.isDataPointFakeTargetProperty && !!bFilterable && this._isFilterableNavigationProperty(oColumnInfo, oMetaModel, oTable) && (
        // TODO ignoring all properties that are not also available for adaptation for now, but proper concept required
        !bIsAnalyticalTable || !aAggregatedPropertyMapUnfilterable[oPropertyInfo.name]);
        oPropertyInfo.key = oColumnInfo.isKey;
        oPropertyInfo.groupable = oColumnInfo.isGroupable;
        if (oColumnInfo.textArrangement) {
          var oDescriptionColumn = this.getColumnsFor(oTable).find(function (oCol) {
            return oCol.name === oColumnInfo.textArrangement.textProperty;
          });
          if (oDescriptionColumn) {
            oPropertyInfo.mode = oColumnInfo.textArrangement.mode;
            oPropertyInfo.valueProperty = oColumnInfo.relativePath;
            oPropertyInfo.descriptionProperty = oDescriptionColumn.relativePath;
          }
        }
        oPropertyInfo.text = oColumnInfo.textArrangement && oColumnInfo.textArrangement.textProperty;
        oPropertyInfo.caseSensitive = oColumnInfo.caseSensitive;
        if (oColumnInfo.additionalLabels) {
          oPropertyInfo.additionalLabels = oColumnInfo.additionalLabels.map(function (label) {
            return DelegateUtil.getLocalizedText(label, oAppComponent || oTable);
          });
        }
      }
      this._computeVisualSettingsForPropertyWithUnit(oTable, oPropertyInfo, oColumnInfo.unit, oColumnInfo.unitText, oColumnInfo.timezoneText);
      return oPropertyInfo;
    },
    _fetchCustomPropertyInfo: function (oColumnInfo, oTable, oAppComponent) {
      var sLabel = DelegateUtil.getLocalizedText(oColumnInfo.header, oAppComponent || oTable); // Todo: To be removed once MDC provides translation support
      var oPropertyInfo = {
        name: oColumnInfo.name,
        groupLabel: null,
        group: null,
        label: sLabel,
        type: "Edm.String",
        // TBD
        visible: oColumnInfo.availability !== "Hidden",
        exportSettings: oColumnInfo.exportSettings,
        visualSettings: oColumnInfo.visualSettings
      };

      // MDC expects 'propertyInfos' only for complex properties.
      // An empty array throws validation error and undefined value is unhandled.
      if (oColumnInfo.propertyInfos && oColumnInfo.propertyInfos.length) {
        oPropertyInfo.propertyInfos = oColumnInfo.propertyInfos;
        //only in case of complex properties, wrap the cell content on the excel exported file
        oPropertyInfo.exportSettings = {
          wrap: oColumnInfo.exportSettings.wrap,
          template: oColumnInfo.exportSettings.template
        };
      } else {
        // Add properties which are supported only by simple PropertyInfos.
        oPropertyInfo.path = oColumnInfo.name;
        oPropertyInfo.sortable = false;
        oPropertyInfo.filterable = false;
      }
      return oPropertyInfo;
    },
    _bColumnHasPropertyWithDraftIndicator: function (oColumnInfo) {
      return !!(oColumnInfo.formatOptions && oColumnInfo.formatOptions.hasDraftIndicator || oColumnInfo.formatOptions && oColumnInfo.formatOptions.fieldGroupDraftIndicatorPropertyPath);
    },
    _updateDraftIndicatorModel: function (_oTable, _oColumnInfo) {
      var aVisibleColumns = _oTable.getColumns();
      var oInternalBindingContext = _oTable.getBindingContext("internal");
      var sInternalPath = oInternalBindingContext && oInternalBindingContext.getPath();
      if (aVisibleColumns && oInternalBindingContext) {
        for (var index in aVisibleColumns) {
          if (this._bColumnHasPropertyWithDraftIndicator(_oColumnInfo) && _oColumnInfo.name === aVisibleColumns[index].getDataProperty()) {
            if (oInternalBindingContext.getProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR) === undefined) {
              oInternalBindingContext.setProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR, _oColumnInfo.name);
              break;
            }
          }
        }
      }
    },
    _fetchPropertiesForEntity: function (oTable, sEntityTypePath, oMetaModel, oAppComponent, bUseAdditionalProperties) {
      var _this2 = this;
      // when fetching properties, this binding context is needed - so lets create it only once and use if for all properties/data-fields/line-items
      var sBindingPath = ModelHelper.getEntitySetPath(sEntityTypePath);
      var aFetchedProperties = [];
      var oFR = CommonUtils.getFilterRestrictionsByPath(sBindingPath, oMetaModel);
      var aNonFilterableProps = oFR[FilterRestrictions.NON_FILTERABLE_PROPERTIES];
      return Promise.resolve(this.getColumnsFor(oTable)).then(function (aColumns) {
        // DraftAdministrativeData does not work via 'entitySet/$NavigationPropertyBinding/DraftAdministrativeData'
        if (aColumns) {
          var oPropertyInfo;
          aColumns.forEach(function (oColumnInfo) {
            _this2._updateDraftIndicatorModel(oTable, oColumnInfo);
            switch (oColumnInfo.type) {
              case "Annotation":
                oPropertyInfo = _this2._fetchPropertyInfo(oMetaModel, oColumnInfo, oTable, oAppComponent, bUseAdditionalProperties);
                if (oPropertyInfo && aNonFilterableProps.indexOf(oPropertyInfo.name) === -1) {
                  oPropertyInfo.maxConditions = DelegateUtil.isMultiValue(oPropertyInfo) ? -1 : 1;
                }
                break;
              case "Slot":
              case "Default":
                oPropertyInfo = _this2._fetchCustomPropertyInfo(oColumnInfo, oTable, oAppComponent);
                break;
              default:
                throw new Error("unhandled switch case ".concat(oColumnInfo.type));
            }
            aFetchedProperties.push(oPropertyInfo);
          });
        }
      }).then(function () {
        aFetchedProperties = _this2._updatePropertyInfo(oTable, aFetchedProperties);
      }).catch(function (err) {
        Log.error("An error occurs while updating fetched properties: ".concat(err));
      }).then(function () {
        return aFetchedProperties;
      });
    },
    _getCachedOrFetchPropertiesForEntity: function (oTable, sEntityTypePath, oMetaModel, oAppComponent, bUseAdditionalProperties) {
      var aFetchedProperties = _getCachedProperties(oTable, bUseAdditionalProperties);
      if (aFetchedProperties) {
        return Promise.resolve(aFetchedProperties);
      }
      return this._fetchPropertiesForEntity(oTable, sEntityTypePath, oMetaModel, oAppComponent, bUseAdditionalProperties).then(function (aSubFetchedProperties) {
        _setCachedProperties(oTable, aSubFetchedProperties, bUseAdditionalProperties);
        return aSubFetchedProperties;
      });
    },
    _setTableNoDataText: function (oTable, oBindingInfo) {
      var sNoDataKey = "";
      var oTableFilterInfo = TableUtils.getAllFilterInfo(oTable),
        suffixResourceKey = oBindingInfo.path.startsWith("/") ? oBindingInfo.path.substr(1) : oBindingInfo.path;
      var _getNoDataTextWithFilters = function () {
        if (oTable.data("hiddenFilters") || oTable.data("quickFilterKey")) {
          return "M_TABLE_AND_CHART_NO_DATA_TEXT_MULTI_VIEW";
        } else {
          return "T_TABLE_AND_CHART_NO_DATA_TEXT_WITH_FILTER";
        }
      };
      var sFilterAssociation = oTable.getFilter();
      if (sFilterAssociation && !/BasicSearch$/.test(sFilterAssociation)) {
        // check if a FilterBar is associated to the Table (basic search on toolBar is excluded)
        if (oTableFilterInfo.search || oTableFilterInfo.filters && oTableFilterInfo.filters.length) {
          // check if table has any Filterbar filters or personalization filters
          sNoDataKey = _getNoDataTextWithFilters();
        } else {
          sNoDataKey = "T_TABLE_AND_CHART_NO_DATA_TEXT";
        }
      } else if (oTableFilterInfo.search || oTableFilterInfo.filters && oTableFilterInfo.filters.length) {
        //check if table has any personalization filters
        sNoDataKey = _getNoDataTextWithFilters();
      } else {
        sNoDataKey = "M_TABLE_AND_CHART_NO_FILTERS_NO_DATA_TEXT";
      }
      return oTable.getModel("sap.fe.i18n").getResourceBundle().then(function (oResourceBundle) {
        oTable.setNoData(CommonUtils.getTranslatedText(sNoDataKey, oResourceBundle, null, suffixResourceKey));
      }).catch(function (error) {
        Log.error(error);
      });
    },
    handleTableDataReceived: function (oTable, oInternalModelContext) {
      var oBinding = oTable && oTable.getRowBinding(),
        bDataReceivedAttached = oInternalModelContext && oInternalModelContext.getProperty("dataReceivedAttached");
      if (oInternalModelContext && !bDataReceivedAttached) {
        oBinding.attachDataReceived(function () {
          TableHelper.handleTableDeleteEnablementForSideEffects(oTable, oInternalModelContext);
          // Refresh the selected contexts to trigger re-calculation of enabled state of actions.
          oInternalModelContext.setProperty("selectedContexts", []);
          var aSelectedContexts = oTable.getSelectedContexts();
          oInternalModelContext.setProperty("selectedContexts", aSelectedContexts);
          oInternalModelContext.setProperty("numberOfSelectedContexts", aSelectedContexts.length);
          var oActionOperationAvailableMap = JSON.parse(CommonHelper.parseCustomData(DelegateUtil.getCustomData(oTable, "operationAvailableMap")));
          ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "table");
          var oTableAPI = oTable ? oTable.getParent() : null;
          if (oTableAPI) {
            oTableAPI.setUpEmptyRows(oTable);
          }
        });
        oInternalModelContext.setProperty("dataReceivedAttached", true);
      }
    },
    rebind: function (oTable, oBindingInfo) {
      var oTableAPI = oTable.getParent();
      var bIsSuspended = oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.getProperty("bindingSuspended");
      oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.setProperty("outDatedBinding", bIsSuspended);
      if (!bIsSuspended) {
        TableUtils.clearSelection(oTable);
        TableDelegateBase.rebind.apply(this, [oTable, oBindingInfo]);
        TableUtils.onTableBound(oTable);
        this._setTableNoDataText(oTable, oBindingInfo);
        return TableUtils.whenBound(oTable).then(this.handleTableDataReceived(oTable, oTable.getBindingContext("internal"))).catch(function (oError) {
          Log.error("Error while waiting for the table to be bound", oError);
        });
      }
      return Promise.resolve();
    },
    /**
     * Fetches the relevant metadata for the table and returns property info array.
     *
     * @param oTable Instance of the MDCtable
     * @returns Array of property info
     */
    fetchProperties: function (oTable) {
      var _this3 = this;
      return DelegateUtil.fetchModel(oTable).then(function (oModel) {
        if (!oModel) {
          return [];
        }
        return _this3._getCachedOrFetchPropertiesForEntity(oTable, DelegateUtil.getCustomData(oTable, "entityType"), oModel.getMetaModel());
      });
    },
    preInit: function (oTable) {
      return TableDelegateBase.preInit.apply(this, [oTable]).then(function () {
        /**
         * Set the binding context to null for every fast creation row to avoid it inheriting
         * the wrong context and requesting the table columns on the parent entity
         * Set the correct binding context in ObjectPageController.enableFastCreationRow()
         */
        var oFastCreationRow = oTable.getCreationRow();
        if (oFastCreationRow) {
          oFastCreationRow.setBindingContext(null);
        }
      });
    },
    updateBindingInfo: function (oTable, oBindingInfo) {
      TableDelegateBase.updateBindingInfo.apply(this, [oTable, oBindingInfo]);
      this._internalUpdateBindingInfo(oTable, oBindingInfo);
      oBindingInfo.events.dataReceived = oTable.getParent().onInternalDataReceived.bind(oTable.getParent());
      oBindingInfo.events.dataRequested = oTable.getParent().onInternalDataRequested.bind(oTable.getParent());
      this._setTableNoDataText(oTable, oBindingInfo);
    },
    _manageSemanticTargets: function (oMDCTable) {
      var oRowBinding = oMDCTable.getRowBinding();
      if (oRowBinding) {
        oRowBinding.attachEventOnce("dataRequested", function () {
          setTimeout(function () {
            var _oView = CommonUtils.getTargetView(oMDCTable);
            if (_oView) {
              TableUtils.getSemanticTargetsFromTable(_oView.getController(), oMDCTable);
            }
          }, 0);
        });
      }
    },
    updateBinding: function (oTable, oBindingInfo, oBinding) {
      var oTableAPI = oTable.getParent();
      var bIsSuspended = oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.getProperty("bindingSuspended");
      if (!bIsSuspended) {
        var bNeedManualRefresh = false;
        var _oView = CommonUtils.getTargetView(oTable);
        var oInternalBindingContext = oTable.getBindingContext("internal");
        var sManualUpdatePropertyKey = "pendingManualBindingUpdate";
        var bPendingManualUpdate = oInternalBindingContext.getProperty(sManualUpdatePropertyKey);
        var oRowBinding = oTable.getRowBinding();
        if (oRowBinding) {
          /**
           * Manual refresh if filters are not changed by binding.refresh() since updating the bindingInfo
           * is not enough to trigger a batch request.
           * Removing columns creates one batch request that was not executed before
           */
          var oldFilters = oRowBinding.getFilters("Application");
          bNeedManualRefresh = deepEqual(oBindingInfo.filters, oldFilters[0]) && oRowBinding.getQueryOptionsFromParameters().$search === oBindingInfo.parameters.$search && !bPendingManualUpdate && _oView && _oView.getViewData().converterType === "ListReport";
        }
        TableDelegateBase.updateBinding.apply(this, [oTable, oBindingInfo, oBinding]);
        oTable.fireEvent("bindingUpdated");
        if (bNeedManualRefresh && oTable.getFilter() && oBinding) {
          oRowBinding.requestRefresh(oRowBinding.getGroupId()).finally(function () {
            oInternalBindingContext.setProperty(sManualUpdatePropertyKey, false);
          }).catch(function (oError) {
            Log.error("Error while refreshing the table", oError);
          });
          oInternalBindingContext.setProperty(sManualUpdatePropertyKey, true);
        }
        this._manageSemanticTargets(oTable);
      }
      oTableAPI === null || oTableAPI === void 0 ? void 0 : oTableAPI.setProperty("outDatedBinding", bIsSuspended);
    },
    _computeRowBindingInfoFromTemplate: function (oTable) {
      // We need to deepClone the info we get from the custom data, otherwise some of its subobjects (e.g. parameters) will
      // be shared with oBindingInfo and modified later (Object.assign only does a shallow clone)
      var rowBindingInfo = deepClone(DelegateUtil.getCustomData(oTable, "rowsBindingInfo"));
      // if the rowBindingInfo has a $$getKeepAliveContext parameter we need to check it is the only Table with such a
      // parameter for the collectionMetaPath
      if (rowBindingInfo.parameters.$$getKeepAliveContext) {
        var collectionPath = DelegateUtil.getCustomData(oTable, "targetCollectionPath");
        var internalModel = oTable.getModel("internal");
        var keptAliveLists = internalModel.getObject("/keptAliveLists") || {};
        if (!keptAliveLists[collectionPath]) {
          keptAliveLists[collectionPath] = oTable.getId();
          internalModel.setProperty("/keptAliveLists", keptAliveLists);
        } else if (keptAliveLists[collectionPath] !== oTable.getId()) {
          delete rowBindingInfo.parameters.$$getKeepAliveContext;
        }
      }
      return rowBindingInfo;
    },
    _internalUpdateBindingInfo: function (oTable, oBindingInfo) {
      var oInternalModelContext = oTable.getBindingContext("internal");
      Object.assign(oBindingInfo, this._computeRowBindingInfoFromTemplate(oTable));
      /**
       * Binding info might be suspended at the beginning when the first bindRows is called:
       * To avoid duplicate requests but still have a binding to create new entries.				 *
       * After the initial binding step, follow up bindings should not longer be suspended.
       */
      if (oTable.getRowBinding()) {
        oBindingInfo.suspended = false;
      }
      // The previously added handler for the event 'dataReceived' is not anymore there
      // since the bindingInfo is recreated from scratch so we need to set the flag to false in order
      // to again add the handler on this event if needed
      if (oInternalModelContext) {
        oInternalModelContext.setProperty("dataReceivedAttached", false);
      }
      var oFilter;
      var oFilterInfo = TableUtils.getAllFilterInfo(oTable);
      // Prepare binding info with filter/search parameters
      if (oFilterInfo.filters.length > 0) {
        oFilter = new Filter({
          filters: oFilterInfo.filters,
          and: true
        });
      }
      if (oFilterInfo.bindingPath) {
        oBindingInfo.path = oFilterInfo.bindingPath;
      }
      var oDataStateIndicator = oTable.getDataStateIndicator();
      if (oDataStateIndicator && oDataStateIndicator.isFiltering()) {
        // Include filters on messageStrip
        if (oBindingInfo.filters.length > 0) {
          oFilter = new Filter({
            filters: oBindingInfo.filters.concat(oFilterInfo.filters),
            and: true
          });
          TableUtils.updateBindingInfo(oBindingInfo, oFilterInfo, oFilter);
        }
      } else {
        TableUtils.updateBindingInfo(oBindingInfo, oFilterInfo, oFilter);
      }
    },
    _templateCustomColumnFragment: function (oColumnInfo, oView, oModifier, sTableId) {
      var oColumnModel = new JSONModel(oColumnInfo),
        oThis = new JSONModel({
          id: sTableId
        }),
        oPreprocessorSettings = {
          bindingContexts: {
            "this": oThis.createBindingContext("/"),
            "column": oColumnModel.createBindingContext("/")
          },
          models: {
            "this": oThis,
            "column": oColumnModel
          }
        };
      return DelegateUtil.templateControlFragment("sap.fe.macros.table.CustomColumn", oPreprocessorSettings, {
        view: oView
      }, oModifier).then(function (oItem) {
        oColumnModel.destroy();
        return oItem;
      });
    },
    _templateSlotColumnFragment: function (oColumnInfo, oView, oModifier, sTableId) {
      try {
        var oColumnModel = new JSONModel(oColumnInfo),
          oThis = new JSONModel({
            id: sTableId
          }),
          oPreprocessorSettings = {
            bindingContexts: {
              "this": oThis.createBindingContext("/"),
              "column": oColumnModel.createBindingContext("/")
            },
            models: {
              "this": oThis,
              "column": oColumnModel
            }
          };
        return Promise.resolve(DelegateUtil.templateControlFragment("sap.fe.macros.table.SlotColumn", oPreprocessorSettings, {
          isXML: true
        })).then(function (slotColumnsXML) {
          if (!slotColumnsXML) {
            return Promise.resolve(null);
          }
          var slotXML = slotColumnsXML.getElementsByTagName("slot")[0],
            mdcTableTemplateXML = slotColumnsXML.getElementsByTagName("mdcTable:template")[0];
          mdcTableTemplateXML.removeChild(slotXML);
          if (oColumnInfo.template) {
            var oTemplate = new DOMParser().parseFromString(oColumnInfo.template, "text/xml");
            mdcTableTemplateXML.appendChild(oTemplate.firstElementChild);
          } else {
            Log.error("Please provide content inside this Building Block Column: ".concat(oColumnInfo.header));
            return Promise.resolve(null);
          }
          return oModifier.targets !== "jsControlTree" ? slotColumnsXML : Fragment.load({
            type: "XML",
            definition: slotColumnsXML
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    _getExportFormat: function (dataType) {
      switch (dataType) {
        case "Edm.Date":
          return ExcelFormat.getExcelDatefromJSDate();
        case "Edm.DateTimeOffset":
          return ExcelFormat.getExcelDateTimefromJSDateTime();
        case "Edm.TimeOfDay":
          return ExcelFormat.getExcelTimefromJSTime();
        default:
          return undefined;
      }
    },
    _getVHRelevantFields: function (oMetaModel, sMetadataPath, sBindingPath) {
      var _this4 = this;
      var aFields = [],
        oDataFieldData = oMetaModel.getObject(sMetadataPath);
      if (oDataFieldData.$kind && oDataFieldData.$kind === "Property") {
        oDataFieldData = oMetaModel.getObject("".concat(sMetadataPath, "@com.sap.vocabularies.UI.v1.DataFieldDefault"));
        sMetadataPath = "".concat(sMetadataPath, "@com.sap.vocabularies.UI.v1.DataFieldDefault");
      }
      switch (oDataFieldData.$Type) {
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          if (oMetaModel.getObject("".concat(sMetadataPath, "/Target/$AnnotationPath")).includes("com.sap.vocabularies.UI.v1.FieldGroup")) {
            oMetaModel.getObject("".concat(sMetadataPath, "/Target/$AnnotationPath/Data")).forEach(function (oValue, iIndex) {
              aFields = aFields.concat(_this4._getVHRelevantFields(oMetaModel, "".concat(sMetadataPath, "/Target/$AnnotationPath/Data/").concat(iIndex)));
            });
          }
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
          aFields.push(oMetaModel.getObject("".concat(sMetadataPath, "/Value/$Path")));
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          break;
        default:
          // property
          // temporary workaround to make sure VH relevant field path do not contain the bindingpath
          if (sMetadataPath.indexOf(sBindingPath) === 0) {
            aFields.push(sMetadataPath.substring(sBindingPath.length + 1));
            break;
          }
          aFields.push(CommonHelper.getNavigationPath(sMetadataPath, true));
          break;
      }
      return aFields;
    },
    _setDraftIndicatorOnVisibleColumn: function (oTable, aColumns, oColumnInfo) {
      var _this5 = this;
      var oInternalBindingContext = oTable.getBindingContext("internal");
      if (!oInternalBindingContext) {
        return;
      }
      var sInternalPath = oInternalBindingContext.getPath();
      var aColumnsWithDraftIndicator = aColumns.filter(function (oColumn) {
        return _this5._bColumnHasPropertyWithDraftIndicator(oColumn);
      });
      var aVisibleColumns = oTable.getColumns();
      var sAddVisibleColumnName, sVisibleColumnName, bFoundColumnVisibleWithDraft, sColumnNameWithDraftIndicator;
      for (var i in aVisibleColumns) {
        sVisibleColumnName = aVisibleColumns[i].getDataProperty();
        for (var j in aColumnsWithDraftIndicator) {
          sColumnNameWithDraftIndicator = aColumnsWithDraftIndicator[j].name;
          if (sVisibleColumnName === sColumnNameWithDraftIndicator) {
            bFoundColumnVisibleWithDraft = true;
            break;
          }
          if (oColumnInfo && oColumnInfo.name === sColumnNameWithDraftIndicator) {
            sAddVisibleColumnName = oColumnInfo.name;
          }
        }
        if (bFoundColumnVisibleWithDraft) {
          oInternalBindingContext.setProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR, sVisibleColumnName);
          break;
        }
      }
      if (!bFoundColumnVisibleWithDraft && sAddVisibleColumnName) {
        oInternalBindingContext.setProperty(sInternalPath + SEMANTICKEY_HAS_DRAFTINDICATOR, sAddVisibleColumnName);
      }
    },
    removeItem: function (oPropertyInfoName, oTable, mPropertyBag) {
      var doRemoveItem = true;
      var oModifier = mPropertyBag.modifier;
      var sDataProperty = oPropertyInfoName && oModifier.getProperty(oPropertyInfoName, "dataProperty");
      if (sDataProperty && sDataProperty.indexOf && sDataProperty.indexOf("InlineXML") !== -1) {
        oModifier.insertAggregation(oTable, "dependents", oPropertyInfoName);
        doRemoveItem = false;
      }
      if (oTable.isA && oModifier.targets === "jsControlTree") {
        this._setDraftIndicatorStatus(oModifier, oTable, this.getColumnsFor(oTable));
      }
      return Promise.resolve(doRemoveItem);
    },
    _getMetaModel: function (mPropertyBag) {
      return mPropertyBag.appComponent && mPropertyBag.appComponent.getModel().getMetaModel();
    },
    _setDraftIndicatorStatus: function (oModifier, oTable, aColumns, oColumnInfo) {
      if (oModifier.targets === "jsControlTree") {
        this._setDraftIndicatorOnVisibleColumn(oTable, aColumns, oColumnInfo);
      }
    },
    _getGroupId: function (sRetrievedGroupId) {
      return sRetrievedGroupId || undefined;
    },
    _getDependent: function (oDependent, sPropertyInfoName, sDataProperty) {
      if (sPropertyInfoName === sDataProperty) {
        return oDependent;
      }
      return undefined;
    },
    _fnTemplateValueHelp: function (fnTemplateValueHelp, bValueHelpRequired, bValueHelpExists) {
      if (bValueHelpRequired && !bValueHelpExists) {
        return fnTemplateValueHelp("sap.fe.macros.table.ValueHelp");
      }
      return Promise.resolve();
    },
    _getDisplayMode: function (bDisplayMode) {
      var columnEditMode;
      if (bDisplayMode !== undefined) {
        bDisplayMode = typeof bDisplayMode === "boolean" ? bDisplayMode : bDisplayMode === "true";
        columnEditMode = bDisplayMode ? "Display" : "Editable";
        return {
          displaymode: bDisplayMode,
          columnEditMode: columnEditMode
        };
      }
      return {
        displaymode: undefined,
        columnEditMode: undefined
      };
    },
    _insertAggregation: function (oValueHelp, oModifier, oTable) {
      if (oValueHelp) {
        return oModifier.insertAggregation(oTable, "dependents", oValueHelp, 0);
      }
      return undefined;
    },
    /**
     * Invoked when a column is added using the table personalization dialog.
     *
     * @param sPropertyInfoName Name of the property for which the column is added
     * @param oTable Instance of table control
     * @param mPropertyBag Instance of property bag from the flexibility API
     * @returns Once resolved, a table column definition is returned
     */
    addItem: function (sPropertyInfoName, oTable, mPropertyBag) {
      try {
        var _this7 = this;
        var oMetaModel = _this7._getMetaModel(mPropertyBag),
          oModifier = mPropertyBag.modifier,
          sTableId = oModifier.getId(oTable),
          aColumns = oTable.isA ? _this7.getColumnsFor(oTable) : null;
        if (!aColumns) {
          return Promise.resolve(null);
        }
        var oColumnInfo = aColumns.find(function (oColumn) {
          return oColumn.name === sPropertyInfoName;
        });
        if (!oColumnInfo) {
          Log.error("".concat(sPropertyInfoName, " not found while adding column"));
          return Promise.resolve(null);
        }
        _this7._setDraftIndicatorStatus(oModifier, oTable, aColumns, oColumnInfo);
        // render custom column
        if (oColumnInfo.type === "Default") {
          return Promise.resolve(_this7._templateCustomColumnFragment(oColumnInfo, mPropertyBag.view, oModifier, sTableId));
        }
        if (oColumnInfo.type === "Slot") {
          return Promise.resolve(_this7._templateSlotColumnFragment(oColumnInfo, mPropertyBag.view, oModifier, sTableId));
        }
        // fall-back
        if (!oMetaModel) {
          return Promise.resolve(null);
        }
        return Promise.resolve(DelegateUtil.getCustomData(oTable, "metaPath", oModifier)).then(function (sPath) {
          return Promise.resolve(DelegateUtil.getCustomData(oTable, "entityType", oModifier)).then(function (sEntityTypePath) {
            return Promise.resolve(DelegateUtil.getCustomData(oTable, "requestGroupId", oModifier)).then(function (sRetrievedGroupId) {
              var sGroupId = _this7._getGroupId(sRetrievedGroupId);
              var oTableContext = oMetaModel.createBindingContext(sPath);
              return Promise.resolve(_this7._getCachedOrFetchPropertiesForEntity(oTable, sEntityTypePath, oMetaModel, mPropertyBag.appComponent)).then(function (aFetchedProperties) {
                var oPropertyInfo = aFetchedProperties.find(function (oInfo) {
                  return oInfo.name === sPropertyInfoName;
                });
                var oPropertyContext = oMetaModel.createBindingContext(oPropertyInfo.metadataPath);
                var aVHProperties = _this7._getVHRelevantFields(oMetaModel, oPropertyInfo.metadataPath, sPath);
                var oParameters = {
                  sBindingPath: sPath,
                  sValueHelpType: "TableValueHelp",
                  oControl: oTable,
                  oMetaModel: oMetaModel,
                  oModifier: oModifier,
                  oPropertyInfo: oPropertyInfo
                };
                var fnTemplateValueHelp = function (sFragmentName) {
                  try {
                    var oThis = new JSONModel({
                        id: sTableId,
                        requestGroupId: sGroupId
                      }),
                      oPreprocessorSettings = {
                        bindingContexts: {
                          "this": oThis.createBindingContext("/"),
                          "dataField": oPropertyContext
                        },
                        models: {
                          "this": oThis,
                          "dataField": oMetaModel,
                          metaModel: oMetaModel
                        }
                      };
                    return Promise.resolve(_finallyRethrows(function () {
                      return _catch(function () {
                        return Promise.resolve(DelegateUtil.templateControlFragment(sFragmentName, oPreprocessorSettings, {}, oModifier)).then(function (oValueHelp) {
                          return Promise.resolve(_this7._insertAggregation(oValueHelp, oModifier, oTable));
                        });
                      }, function (oError) {
                        //We always resolve the promise to ensure that the app does not crash
                        Log.error("ValueHelp not loaded : ".concat(oError.message));
                        return null;
                      });
                    }, function (_wasThrown, _result) {
                      oThis.destroy();
                      if (_wasThrown) throw _result;
                      return _result;
                    }));
                  } catch (e) {
                    return Promise.reject(e);
                  }
                };
                var fnTemplateFragment = function (oInPropertyInfo, oView) {
                  var sFragmentName = "sap.fe.macros.table.Column";
                  var bDisplayMode;
                  var sTableTypeCustomData;
                  var sOnChangeCustomData;
                  var sCreationModeCustomData;
                  return Promise.all([DelegateUtil.getCustomData(oTable, "displayModePropertyBinding", oModifier), DelegateUtil.getCustomData(oTable, "tableType", oModifier), DelegateUtil.getCustomData(oTable, "onChange", oModifier), DelegateUtil.getCustomData(oTable, "creationMode", oModifier)]).then(function (aCustomData) {
                    bDisplayMode = aCustomData[0];
                    sTableTypeCustomData = aCustomData[1];
                    sOnChangeCustomData = aCustomData[2];
                    sCreationModeCustomData = aCustomData[3];
                    // Read Only and Column Edit Mode can both have three state
                    // Undefined means that the framework decides what to do
                    // True / Display means always read only
                    // False / Editable means editable but while still respecting the low level principle (immutable property will not be editable)
                    var oDisplayModes = _this7._getDisplayMode(bDisplayMode);
                    bDisplayMode = oDisplayModes.displaymode;
                    var columnEditMode = oDisplayModes.columnEditMode;
                    var oThis = new JSONModel({
                        readOnly: bDisplayMode,
                        columnEditMode: columnEditMode,
                        tableType: sTableTypeCustomData,
                        onChange: sOnChangeCustomData,
                        id: sTableId,
                        navigationPropertyPath: sPropertyInfoName,
                        columnInfo: oColumnInfo,
                        collection: {
                          sPath: sPath,
                          oModel: oMetaModel
                        },
                        creationMode: sCreationModeCustomData
                      }),
                      oPreprocessorSettings = {
                        bindingContexts: {
                          "entitySet": oTableContext,
                          "collection": oTableContext,
                          "dataField": oPropertyContext,
                          "this": oThis.createBindingContext("/"),
                          "column": oThis.createBindingContext("/columnInfo")
                        },
                        models: {
                          "this": oThis,
                          "entitySet": oMetaModel,
                          "collection": oMetaModel,
                          "dataField": oMetaModel,
                          metaModel: oMetaModel,
                          "column": oThis
                        }
                      };
                    return DelegateUtil.templateControlFragment(sFragmentName, oPreprocessorSettings, {
                      view: oView
                    }, oModifier).finally(function () {
                      oThis.destroy();
                    });
                  });
                };
                return Promise.resolve(Promise.all(aVHProperties.map(function (sPropertyName) {
                  try {
                    var mParameters = Object.assign({}, oParameters, {
                      sPropertyName: sPropertyName
                    });
                    return Promise.resolve(Promise.all([DelegateUtil.isValueHelpRequired(mParameters), DelegateUtil.doesValueHelpExist(mParameters)])).then(function (aResults) {
                      var bValueHelpRequired = aResults[0],
                        bValueHelpExists = aResults[1];
                      return _this7._fnTemplateValueHelp(fnTemplateValueHelp, bValueHelpRequired, bValueHelpExists);
                    });
                  } catch (e) {
                    return Promise.reject(e);
                  }
                }))).then(function () {
                  // If view is not provided try to get it by accessing to the parental hierarchy
                  // If it doesn't work (table into an unattached OP section) get the view via the AppComponent
                  var view = mPropertyBag.view || CommonUtils.getTargetView(oTable) || (mPropertyBag.appComponent ? CommonUtils.getCurrentPageView(mPropertyBag.appComponent) : undefined);
                  return fnTemplateFragment(oPropertyInfo, view);
                });
              });
            });
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Provide the Table's filter delegate to provide basic filter functionality such as adding FilterFields.
     *
     * @returns Object for the Tables filter personalization.
     */
    getFilterDelegate: function () {
      return Object.assign({}, FilterBarDelegate, {
        addItem: function (sPropertyInfoName, oParentControl) {
          if (sPropertyInfoName.indexOf("Property::") === 0) {
            // Correct the name of complex property info references.
            sPropertyInfoName = sPropertyInfoName.replace("Property::", "");
          }
          return FilterBarDelegate.addItem(sPropertyInfoName, oParentControl);
        }
      });
    },
    /**
     * Returns the TypeUtil attached to this delegate.
     *
     * @returns Any instance of TypeUtil
     */
    getTypeUtil: function /*oPayload: object*/
    () {
      return TypeUtil;
    },
    formatGroupHeader: function (oTable, oContext, sProperty) {
      var _oFormatInfo$typeConf, _oFormatInfo$typeConf2;
      var mFormatInfos = _getCachedProperties(oTable, null),
        oFormatInfo = mFormatInfos && mFormatInfos.filter(function (obj) {
          return obj.name === sProperty;
        })[0],
        /*For a Date or DateTime property, the value is returned in external format using a UI5 type for the
              given property path that formats corresponding to the property's EDM type and constraints*/
        bExternalFormat = (oFormatInfo === null || oFormatInfo === void 0 ? void 0 : (_oFormatInfo$typeConf = oFormatInfo.typeConfig) === null || _oFormatInfo$typeConf === void 0 ? void 0 : _oFormatInfo$typeConf.baseType) === "DateTime" || (oFormatInfo === null || oFormatInfo === void 0 ? void 0 : (_oFormatInfo$typeConf2 = oFormatInfo.typeConfig) === null || _oFormatInfo$typeConf2 === void 0 ? void 0 : _oFormatInfo$typeConf2.baseType) === "Date";
      var sValue;
      if (oFormatInfo && oFormatInfo.mode) {
        switch (oFormatInfo.mode) {
          case "Description":
            sValue = oContext.getProperty(oFormatInfo.descriptionProperty, bExternalFormat);
            break;
          case "DescriptionValue":
            sValue = ValueFormatter.formatWithBrackets(oContext.getProperty(oFormatInfo.descriptionProperty, bExternalFormat), oContext.getProperty(oFormatInfo.valueProperty, bExternalFormat));
            break;
          case "ValueDescription":
            sValue = ValueFormatter.formatWithBrackets(oContext.getProperty(oFormatInfo.valueProperty, bExternalFormat), oContext.getProperty(oFormatInfo.descriptionProperty, bExternalFormat));
            break;
        }
      } else {
        sValue = oContext.getProperty(oFormatInfo.path, bExternalFormat);
      }
      return ResourceModel.getText("M_TABLE_GROUP_HEADER_TITLE", [oFormatInfo.label, sValue]);
    }
  });
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiZmluYWxpemVyIiwiYmluZCIsIkZFVENIRURfUFJPUEVSVElFU19EQVRBX0tFWSIsIlNFTUFOVElDS0VZX0hBU19EUkFGVElORElDQVRPUiIsIkZpbHRlclJlc3RyaWN0aW9ucyIsIkNvbW1vblV0aWxzIiwiX3NldENhY2hlZFByb3BlcnRpZXMiLCJvVGFibGUiLCJhRmV0Y2hlZFByb3BlcnRpZXMiLCJiVXNlQWRkaXRpb25hbFByb3BlcnRpZXMiLCJ3aW5kb3ciLCJFbGVtZW50Iiwia2V5IiwiRGVsZWdhdGVVdGlsIiwic2V0Q3VzdG9tRGF0YSIsIl9nZXRDYWNoZWRQcm9wZXJ0aWVzIiwiZ2V0Q3VzdG9tRGF0YSIsIk9iamVjdCIsImFzc2lnbiIsIlRhYmxlRGVsZWdhdGVCYXNlIiwiX2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvckZpZWxkR3JvdXAiLCJvUHJvcGVydHkiLCJhUHJvcGVydGllcyIsIm5hbWUiLCJpbmRleE9mIiwib0NvbHVtbiIsImdldENvbHVtbnMiLCJmaW5kIiwib0NvbCIsImdldERhdGFQcm9wZXJ0eSIsImJTaG93RGF0YUZpZWxkc0xhYmVsIiwiZGF0YSIsIm9NZXRhTW9kZWwiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsIm9Db250ZXh0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJtZXRhZGF0YVBhdGgiLCJyZXBsYWNlIiwib0RhdGFGaWVsZCIsImdldE9iamVjdCIsIm9GaWVsZEdyb3VwIiwiVGFyZ2V0IiwiJEFubm90YXRpb25QYXRoIiwiYUZpZWxkV2lkdGgiLCJEYXRhIiwiZm9yRWFjaCIsIm9EYXRhIiwib0RhdGFGaWVsZFdpZHRoIiwiJFR5cGUiLCJUYWJsZVNpemVIZWxwZXIiLCJnZXRXaWR0aEZvckRhdGFGaWVsZEZvckFubm90YXRpb24iLCJnZXRXaWR0aEZvckRhdGFGaWVsZCIsImxhYmVsV2lkdGgiLCJwcm9wZXJ0eVdpZHRoIiwiZ2V0QnV0dG9uV2lkdGgiLCJMYWJlbCIsInB1c2giLCJuV2lkZXN0IiwicmVkdWNlIiwiYWNjIiwidmFsdWUiLCJNYXRoIiwibWF4IiwidmlzdWFsU2V0dGluZ3MiLCJkZWVwRXh0ZW5kIiwid2lkdGhDYWxjdWxhdGlvbiIsInZlcnRpY2FsQXJyYW5nZW1lbnQiLCJtaW5XaWR0aCIsImNlaWwiLCJfY29tcHV0ZVZpc3VhbFNldHRpbmdzRm9yUHJvcGVydHlXaXRoVmFsdWVIZWxwIiwib1RhYmxlQVBJIiwiZ2V0UGFyZW50IiwicHJvcGVydHlJbmZvcyIsInVuZGVmaW5lZCIsIkVycm9yIiwiZ2FwIiwiZ2V0UmVhZE9ubHkiLCJfY29tcHV0ZVZpc3VhbFNldHRpbmdzRm9yUHJvcGVydHlXaXRoVW5pdCIsIm9Vbml0Iiwib1VuaXRUZXh0Iiwib1RpbWV6b25lVGV4dCIsInNVbml0VGV4dCIsIl9jb21wdXRlTGFiZWwiLCJwcm9wZXJ0eSIsImxhYmVsTWFwIiwibGFiZWwiLCJwcm9wZXJ0aWVzV2l0aFNhbWVMYWJlbCIsImxlbmd0aCIsInBhdGgiLCJpbmNsdWRlcyIsImFkZGl0aW9uYWxMYWJlbHMiLCJqb2luIiwiX3VwZGF0ZVByb3BlcnR5SW5mbyIsInRhYmxlIiwicHJvcGVydGllcyIsInAxM25Nb2RlIiwiZ2V0UDEzbk1vZGUiLCJzb3J0YWJsZSIsImZpbHRlcmFibGUiLCJncm91cGFibGUiLCJjb25jYXQiLCJ0eXBlQ29uZmlnIiwiZ2V0Q29sdW1uc0ZvciIsImdldFRhYmxlRGVmaW5pdGlvbiIsImNvbHVtbnMiLCJfZ2V0QWdncmVnYXRlZFByb3BlcnR5TWFwIiwiYWdncmVnYXRlcyIsImZldGNoRXhwb3J0Q2FwYWJpbGl0aWVzIiwib0NhcGFiaWxpdGllcyIsIm9Nb2RlbCIsImZldGNoTW9kZWwiLCJtb2RlbCIsImFTdXBwb3J0ZWRGb3JtYXRzIiwiYUxvd2VyRm9ybWF0cyIsIm1hcCIsImVsZW1lbnQiLCJ0b0xvd2VyQ2FzZSIsIm9Bbm5vdGF0aW9uIiwiY2F0Y2giLCJlcnIiLCJMb2ciLCJlcnJvciIsIl9pc0ZpbHRlcmFibGVOYXZpZ2F0aW9uUHJvcGVydHkiLCJjb2x1bW5JbmZvIiwibWV0YU1vZGVsIiwidGFibGVNZXRhUGF0aCIsInRhYmxlRGF0YU1vZGVsT2JqZWN0UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsImdldENvbnRleHQiLCJjb2x1bW5OYXZpZ2F0aW9uUHJvcGVydGllcyIsImFubm90YXRpb25QYXRoIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJ0YWJsZVRhcmdldEVudGl0eUluZGV4IiwiZmluZEluZGV4IiwicHJvcCIsInRhcmdldFR5cGUiLCJ0YXJnZXRFbnRpdHlUeXBlIiwicmVsYXRpdmVOYXZpZ2F0aW9uUHJvcGVydGllcyIsInNsaWNlIiwicmVsYXRpdmVQYXRoIiwiaXNQYXJ0T2ZMaW5lSXRlbSIsInNvbWUiLCJuYXZpZ2F0aW9uUHJvcGVydHkiLCJfdHlwZSIsImlzQ29sbGVjdGlvbiIsIl9mZXRjaFByb3BlcnR5SW5mbyIsIm9Db2x1bW5JbmZvIiwib0FwcENvbXBvbmVudCIsInNBYnNvbHV0ZU5hdmlnYXRpb25QYXRoIiwib05hdmlnYXRpb25Db250ZXh0Iiwib1R5cGVDb25maWciLCJjbGFzc05hbWUiLCJpc1R5cGVGaWx0ZXJhYmxlIiwiVHlwZVV0aWwiLCJnZXRUeXBlQ29uZmlnIiwib0Zvcm1hdE9wdGlvbnMiLCJvQ29uc3RyYWludHMiLCJiRmlsdGVyYWJsZSIsIkNvbW1vbkhlbHBlciIsImlzUHJvcGVydHlGaWx0ZXJhYmxlIiwiY29udGV4dCIsImJDb21wbGV4VHlwZSIsImJJc0FuYWx5dGljYWxUYWJsZSIsImFBZ2dyZWdhdGVkUHJvcGVydHlNYXBVbmZpbHRlcmFibGUiLCJvRXhwb3J0U2V0dGluZ3MiLCJleHBvcnRTZXR0aW5ncyIsImV4cG9ydEZvcm1hdCIsIl9nZXRFeHBvcnRGb3JtYXQiLCJzTGFiZWwiLCJpc0RhdGFQb2ludEZha2VUYXJnZXRQcm9wZXJ0eSIsIlJlc291cmNlTW9kZWwiLCJnZXRUZXh0IiwiZ2V0TG9jYWxpemVkVGV4dCIsInRpbWV6b25lUHJvcGVydHkiLCJmb3JtYXQiLCJ0ZW1wbGF0ZSIsIm9Qcm9wZXJ0eUluZm8iLCJncm91cExhYmVsIiwiZ3JvdXAiLCJ0b29sdGlwIiwidmlzaWJsZSIsImF2YWlsYWJpbGl0eSIsInVuaXQiLCJrZXlzIiwid3JhcCIsImFkZGl0aW9uYWxQcm9wZXJ0eUluZm9zIiwiaXNLZXkiLCJpc0dyb3VwYWJsZSIsInRleHRBcnJhbmdlbWVudCIsIm9EZXNjcmlwdGlvbkNvbHVtbiIsInRleHRQcm9wZXJ0eSIsIm1vZGUiLCJ2YWx1ZVByb3BlcnR5IiwiZGVzY3JpcHRpb25Qcm9wZXJ0eSIsInRleHQiLCJjYXNlU2Vuc2l0aXZlIiwidW5pdFRleHQiLCJ0aW1lem9uZVRleHQiLCJfZmV0Y2hDdXN0b21Qcm9wZXJ0eUluZm8iLCJoZWFkZXIiLCJ0eXBlIiwiX2JDb2x1bW5IYXNQcm9wZXJ0eVdpdGhEcmFmdEluZGljYXRvciIsImZvcm1hdE9wdGlvbnMiLCJoYXNEcmFmdEluZGljYXRvciIsImZpZWxkR3JvdXBEcmFmdEluZGljYXRvclByb3BlcnR5UGF0aCIsIl91cGRhdGVEcmFmdEluZGljYXRvck1vZGVsIiwiX29UYWJsZSIsIl9vQ29sdW1uSW5mbyIsImFWaXNpYmxlQ29sdW1ucyIsIm9JbnRlcm5hbEJpbmRpbmdDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJzSW50ZXJuYWxQYXRoIiwiZ2V0UGF0aCIsImluZGV4IiwiZ2V0UHJvcGVydHkiLCJzZXRQcm9wZXJ0eSIsIl9mZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkiLCJzRW50aXR5VHlwZVBhdGgiLCJzQmluZGluZ1BhdGgiLCJNb2RlbEhlbHBlciIsImdldEVudGl0eVNldFBhdGgiLCJvRlIiLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgiLCJhTm9uRmlsdGVyYWJsZVByb3BzIiwiTk9OX0ZJTFRFUkFCTEVfUFJPUEVSVElFUyIsIlByb21pc2UiLCJyZXNvbHZlIiwiYUNvbHVtbnMiLCJtYXhDb25kaXRpb25zIiwiaXNNdWx0aVZhbHVlIiwiX2dldENhY2hlZE9yRmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5IiwiYVN1YkZldGNoZWRQcm9wZXJ0aWVzIiwiX3NldFRhYmxlTm9EYXRhVGV4dCIsIm9CaW5kaW5nSW5mbyIsInNOb0RhdGFLZXkiLCJvVGFibGVGaWx0ZXJJbmZvIiwiVGFibGVVdGlscyIsImdldEFsbEZpbHRlckluZm8iLCJzdWZmaXhSZXNvdXJjZUtleSIsInN0YXJ0c1dpdGgiLCJzdWJzdHIiLCJfZ2V0Tm9EYXRhVGV4dFdpdGhGaWx0ZXJzIiwic0ZpbHRlckFzc29jaWF0aW9uIiwiZ2V0RmlsdGVyIiwidGVzdCIsInNlYXJjaCIsImZpbHRlcnMiLCJnZXRSZXNvdXJjZUJ1bmRsZSIsIm9SZXNvdXJjZUJ1bmRsZSIsInNldE5vRGF0YSIsImdldFRyYW5zbGF0ZWRUZXh0IiwiaGFuZGxlVGFibGVEYXRhUmVjZWl2ZWQiLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJvQmluZGluZyIsImdldFJvd0JpbmRpbmciLCJiRGF0YVJlY2VpdmVkQXR0YWNoZWQiLCJhdHRhY2hEYXRhUmVjZWl2ZWQiLCJUYWJsZUhlbHBlciIsImhhbmRsZVRhYmxlRGVsZXRlRW5hYmxlbWVudEZvclNpZGVFZmZlY3RzIiwiYVNlbGVjdGVkQ29udGV4dHMiLCJnZXRTZWxlY3RlZENvbnRleHRzIiwib0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCIsIkpTT04iLCJwYXJzZSIsInBhcnNlQ3VzdG9tRGF0YSIsIkFjdGlvblJ1bnRpbWUiLCJzZXRBY3Rpb25FbmFibGVtZW50Iiwic2V0VXBFbXB0eVJvd3MiLCJyZWJpbmQiLCJiSXNTdXNwZW5kZWQiLCJjbGVhclNlbGVjdGlvbiIsImFwcGx5Iiwib25UYWJsZUJvdW5kIiwid2hlbkJvdW5kIiwib0Vycm9yIiwiZmV0Y2hQcm9wZXJ0aWVzIiwicHJlSW5pdCIsIm9GYXN0Q3JlYXRpb25Sb3ciLCJnZXRDcmVhdGlvblJvdyIsInNldEJpbmRpbmdDb250ZXh0IiwidXBkYXRlQmluZGluZ0luZm8iLCJfaW50ZXJuYWxVcGRhdGVCaW5kaW5nSW5mbyIsImV2ZW50cyIsImRhdGFSZWNlaXZlZCIsIm9uSW50ZXJuYWxEYXRhUmVjZWl2ZWQiLCJkYXRhUmVxdWVzdGVkIiwib25JbnRlcm5hbERhdGFSZXF1ZXN0ZWQiLCJfbWFuYWdlU2VtYW50aWNUYXJnZXRzIiwib01EQ1RhYmxlIiwib1Jvd0JpbmRpbmciLCJhdHRhY2hFdmVudE9uY2UiLCJzZXRUaW1lb3V0IiwiX29WaWV3IiwiZ2V0VGFyZ2V0VmlldyIsImdldFNlbWFudGljVGFyZ2V0c0Zyb21UYWJsZSIsImdldENvbnRyb2xsZXIiLCJ1cGRhdGVCaW5kaW5nIiwiYk5lZWRNYW51YWxSZWZyZXNoIiwic01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5IiwiYlBlbmRpbmdNYW51YWxVcGRhdGUiLCJvbGRGaWx0ZXJzIiwiZ2V0RmlsdGVycyIsImRlZXBFcXVhbCIsImdldFF1ZXJ5T3B0aW9uc0Zyb21QYXJhbWV0ZXJzIiwiJHNlYXJjaCIsInBhcmFtZXRlcnMiLCJnZXRWaWV3RGF0YSIsImNvbnZlcnRlclR5cGUiLCJmaXJlRXZlbnQiLCJyZXF1ZXN0UmVmcmVzaCIsImdldEdyb3VwSWQiLCJmaW5hbGx5IiwiX2NvbXB1dGVSb3dCaW5kaW5nSW5mb0Zyb21UZW1wbGF0ZSIsInJvd0JpbmRpbmdJbmZvIiwiZGVlcENsb25lIiwiJCRnZXRLZWVwQWxpdmVDb250ZXh0IiwiY29sbGVjdGlvblBhdGgiLCJpbnRlcm5hbE1vZGVsIiwia2VwdEFsaXZlTGlzdHMiLCJnZXRJZCIsInN1c3BlbmRlZCIsIm9GaWx0ZXIiLCJvRmlsdGVySW5mbyIsIkZpbHRlciIsImFuZCIsImJpbmRpbmdQYXRoIiwib0RhdGFTdGF0ZUluZGljYXRvciIsImdldERhdGFTdGF0ZUluZGljYXRvciIsImlzRmlsdGVyaW5nIiwiX3RlbXBsYXRlQ3VzdG9tQ29sdW1uRnJhZ21lbnQiLCJvVmlldyIsIm9Nb2RpZmllciIsInNUYWJsZUlkIiwib0NvbHVtbk1vZGVsIiwiSlNPTk1vZGVsIiwib1RoaXMiLCJpZCIsIm9QcmVwcm9jZXNzb3JTZXR0aW5ncyIsImJpbmRpbmdDb250ZXh0cyIsIm1vZGVscyIsInRlbXBsYXRlQ29udHJvbEZyYWdtZW50IiwidmlldyIsIm9JdGVtIiwiZGVzdHJveSIsIl90ZW1wbGF0ZVNsb3RDb2x1bW5GcmFnbWVudCIsImlzWE1MIiwic2xvdENvbHVtbnNYTUwiLCJzbG90WE1MIiwiZ2V0RWxlbWVudHNCeVRhZ05hbWUiLCJtZGNUYWJsZVRlbXBsYXRlWE1MIiwicmVtb3ZlQ2hpbGQiLCJvVGVtcGxhdGUiLCJET01QYXJzZXIiLCJwYXJzZUZyb21TdHJpbmciLCJhcHBlbmRDaGlsZCIsImZpcnN0RWxlbWVudENoaWxkIiwidGFyZ2V0cyIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJkYXRhVHlwZSIsIkV4Y2VsRm9ybWF0IiwiZ2V0RXhjZWxEYXRlZnJvbUpTRGF0ZSIsImdldEV4Y2VsRGF0ZVRpbWVmcm9tSlNEYXRlVGltZSIsImdldEV4Y2VsVGltZWZyb21KU1RpbWUiLCJfZ2V0VkhSZWxldmFudEZpZWxkcyIsInNNZXRhZGF0YVBhdGgiLCJhRmllbGRzIiwib0RhdGFGaWVsZERhdGEiLCIka2luZCIsIm9WYWx1ZSIsImlJbmRleCIsInN1YnN0cmluZyIsImdldE5hdmlnYXRpb25QYXRoIiwiX3NldERyYWZ0SW5kaWNhdG9yT25WaXNpYmxlQ29sdW1uIiwiYUNvbHVtbnNXaXRoRHJhZnRJbmRpY2F0b3IiLCJmaWx0ZXIiLCJzQWRkVmlzaWJsZUNvbHVtbk5hbWUiLCJzVmlzaWJsZUNvbHVtbk5hbWUiLCJiRm91bmRDb2x1bW5WaXNpYmxlV2l0aERyYWZ0Iiwic0NvbHVtbk5hbWVXaXRoRHJhZnRJbmRpY2F0b3IiLCJpIiwiaiIsInJlbW92ZUl0ZW0iLCJvUHJvcGVydHlJbmZvTmFtZSIsIm1Qcm9wZXJ0eUJhZyIsImRvUmVtb3ZlSXRlbSIsIm1vZGlmaWVyIiwic0RhdGFQcm9wZXJ0eSIsImluc2VydEFnZ3JlZ2F0aW9uIiwiaXNBIiwiX3NldERyYWZ0SW5kaWNhdG9yU3RhdHVzIiwiX2dldE1ldGFNb2RlbCIsImFwcENvbXBvbmVudCIsIl9nZXRHcm91cElkIiwic1JldHJpZXZlZEdyb3VwSWQiLCJfZ2V0RGVwZW5kZW50Iiwib0RlcGVuZGVudCIsInNQcm9wZXJ0eUluZm9OYW1lIiwiX2ZuVGVtcGxhdGVWYWx1ZUhlbHAiLCJmblRlbXBsYXRlVmFsdWVIZWxwIiwiYlZhbHVlSGVscFJlcXVpcmVkIiwiYlZhbHVlSGVscEV4aXN0cyIsIl9nZXREaXNwbGF5TW9kZSIsImJEaXNwbGF5TW9kZSIsImNvbHVtbkVkaXRNb2RlIiwiZGlzcGxheW1vZGUiLCJfaW5zZXJ0QWdncmVnYXRpb24iLCJvVmFsdWVIZWxwIiwiYWRkSXRlbSIsInNQYXRoIiwic0dyb3VwSWQiLCJvVGFibGVDb250ZXh0Iiwib0luZm8iLCJvUHJvcGVydHlDb250ZXh0IiwiYVZIUHJvcGVydGllcyIsIm9QYXJhbWV0ZXJzIiwic1ZhbHVlSGVscFR5cGUiLCJvQ29udHJvbCIsInNGcmFnbWVudE5hbWUiLCJyZXF1ZXN0R3JvdXBJZCIsIm1lc3NhZ2UiLCJmblRlbXBsYXRlRnJhZ21lbnQiLCJvSW5Qcm9wZXJ0eUluZm8iLCJzVGFibGVUeXBlQ3VzdG9tRGF0YSIsInNPbkNoYW5nZUN1c3RvbURhdGEiLCJzQ3JlYXRpb25Nb2RlQ3VzdG9tRGF0YSIsImFsbCIsImFDdXN0b21EYXRhIiwib0Rpc3BsYXlNb2RlcyIsInJlYWRPbmx5IiwidGFibGVUeXBlIiwib25DaGFuZ2UiLCJuYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiY29sbGVjdGlvbiIsImNyZWF0aW9uTW9kZSIsInNQcm9wZXJ0eU5hbWUiLCJtUGFyYW1ldGVycyIsImlzVmFsdWVIZWxwUmVxdWlyZWQiLCJkb2VzVmFsdWVIZWxwRXhpc3QiLCJhUmVzdWx0cyIsImdldEN1cnJlbnRQYWdlVmlldyIsImdldEZpbHRlckRlbGVnYXRlIiwiRmlsdGVyQmFyRGVsZWdhdGUiLCJvUGFyZW50Q29udHJvbCIsImdldFR5cGVVdGlsIiwiZm9ybWF0R3JvdXBIZWFkZXIiLCJzUHJvcGVydHkiLCJtRm9ybWF0SW5mb3MiLCJvRm9ybWF0SW5mbyIsIm9iaiIsImJFeHRlcm5hbEZvcm1hdCIsImJhc2VUeXBlIiwic1ZhbHVlIiwiVmFsdWVGb3JtYXR0ZXIiLCJmb3JtYXRXaXRoQnJhY2tldHMiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlRGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgZGVlcENsb25lIGZyb20gXCJzYXAvYmFzZS91dGlsL2RlZXBDbG9uZVwiO1xuaW1wb3J0IGRlZXBFcXVhbCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwRXF1YWxcIjtcbmltcG9ydCBkZWVwRXh0ZW5kIGZyb20gXCJzYXAvYmFzZS91dGlsL2RlZXBFeHRlbmRcIjtcbmltcG9ydCBBY3Rpb25SdW50aW1lIGZyb20gXCJzYXAvZmUvY29yZS9BY3Rpb25SdW50aW1lXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSB7IEFubm90YXRpb25UYWJsZUNvbHVtbiwgQ3VzdG9tQmFzZWRUYWJsZUNvbHVtbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgeyBDdXN0b21FbGVtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IFZhbHVlRm9ybWF0dGVyIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL1ZhbHVlRm9ybWF0dGVyXCI7XG5pbXBvcnQgRXhjZWxGb3JtYXQgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvRXhjZWxGb3JtYXRIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFR5cGVVdGlsIGZyb20gXCJzYXAvZmUvY29yZS90eXBlL1R5cGVVdGlsXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IERlbGVnYXRlVXRpbCwgeyBQcm9wZXJ0eUluZm8gfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9EZWxlZ2F0ZVV0aWxcIjtcbmltcG9ydCBGaWx0ZXJCYXJEZWxlZ2F0ZSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXJCYXIvRmlsdGVyQmFyRGVsZWdhdGVcIjtcbmltcG9ydCBSZXNvdXJjZU1vZGVsIGZyb20gXCJzYXAvZmUvbWFjcm9zL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCBUYWJsZUhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUhlbHBlclwiO1xuaW1wb3J0IFRhYmxlU2l6ZUhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZVNpemVIZWxwZXJcIjtcbmltcG9ydCBUYWJsZVV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1V0aWxzXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgVGFibGVEZWxlZ2F0ZUJhc2UgZnJvbSBcInNhcC91aS9tZGMvb2RhdGEvdjQvVGFibGVEZWxlZ2F0ZVwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgRmlsdGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCB0eXBlIFRhYmxlQVBJIGZyb20gXCIuLi9UYWJsZUFQSVwiO1xuXG5jb25zdCBGRVRDSEVEX1BST1BFUlRJRVNfREFUQV9LRVkgPSBcInNhcF9mZV9UYWJsZURlbGVnYXRlX3Byb3BlcnR5SW5mb01hcFwiO1xuY29uc3QgU0VNQU5USUNLRVlfSEFTX0RSQUZUSU5ESUNBVE9SID0gXCIvc2VtYW50aWNLZXlIYXNEcmFmdEluZGljYXRvclwiO1xuY29uc3QgRmlsdGVyUmVzdHJpY3Rpb25zID0gQ29tbW9uVXRpbHMuRmlsdGVyUmVzdHJpY3Rpb25zO1xuXG5mdW5jdGlvbiBfc2V0Q2FjaGVkUHJvcGVydGllcyhvVGFibGU6IGFueSwgYUZldGNoZWRQcm9wZXJ0aWVzOiBhbnksIGJVc2VBZGRpdGlvbmFsUHJvcGVydGllczogYW55KSB7XG5cdC8vIGRvIG5vdCBjYWNoZSBkdXJpbmcgdGVtcGxhdGluZywgZWxzZSBpdCBiZWNvbWVzIHBhcnQgb2YgdGhlIGNhY2hlZCB2aWV3XG5cdGlmIChvVGFibGUgaW5zdGFuY2VvZiB3aW5kb3cuRWxlbWVudCkge1xuXHRcdHJldHVybjtcblx0fVxuXHRjb25zdCBrZXkgPSBiVXNlQWRkaXRpb25hbFByb3BlcnRpZXMgPyBgJHtGRVRDSEVEX1BST1BFUlRJRVNfREFUQV9LRVl9X2FkZGAgOiBGRVRDSEVEX1BST1BFUlRJRVNfREFUQV9LRVk7XG5cdERlbGVnYXRlVXRpbC5zZXRDdXN0b21EYXRhKG9UYWJsZSwga2V5LCBhRmV0Y2hlZFByb3BlcnRpZXMpO1xufVxuZnVuY3Rpb24gX2dldENhY2hlZFByb3BlcnRpZXMob1RhYmxlOiBhbnksIGJVc2VBZGRpdGlvbmFsUHJvcGVydGllczogYW55KSB7XG5cdC8vIHByb3BlcnRpZXMgYXJlIG5vdCBjYWNoZWQgZHVyaW5nIHRlbXBsYXRpbmdcblx0aWYgKG9UYWJsZSBpbnN0YW5jZW9mIHdpbmRvdy5FbGVtZW50KSB7XG5cdFx0cmV0dXJuIG51bGw7XG5cdH1cblx0Y29uc3Qga2V5ID0gYlVzZUFkZGl0aW9uYWxQcm9wZXJ0aWVzID8gYCR7RkVUQ0hFRF9QUk9QRVJUSUVTX0RBVEFfS0VZfV9hZGRgIDogRkVUQ0hFRF9QUk9QRVJUSUVTX0RBVEFfS0VZO1xuXHRyZXR1cm4gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBrZXkpO1xufVxuLyoqXG4gKiBIZWxwZXIgY2xhc3MgZm9yIHNhcC51aS5tZGMuVGFibGUuXG4gKiA8aDM+PGI+Tm90ZTo8L2I+PC9oMz5cbiAqIFRoZSBjbGFzcyBpcyBleHBlcmltZW50YWwgYW5kIHRoZSBBUEkgYW5kIHRoZSBiZWhhdmlvciBhcmUgbm90IGZpbmFsaXplZC4gVGhpcyBjbGFzcyBpcyBub3QgaW50ZW5kZWQgZm9yIHByb2R1Y3RpdmUgdXNhZ2UuXG4gKlxuICogQGF1dGhvciBTQVAgU0VcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKiBAc2luY2UgMS42OVxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuVGFibGVEZWxlZ2F0ZVxuICovXG5leHBvcnQgZGVmYXVsdCBPYmplY3QuYXNzaWduKHt9LCBUYWJsZURlbGVnYXRlQmFzZSwge1xuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBjYWxjdWxhdGVzIHRoZSB3aWR0aCBmb3IgYSBGaWVsZEdyb3VwIGNvbHVtbi5cblx0ICogVGhlIHdpZHRoIG9mIHRoZSBGaWVsZEdyb3VwIGlzIHRoZSB3aWR0aCBvZiB0aGUgd2lkZXN0IHByb3BlcnR5IGNvbnRhaW5lZCBpbiB0aGUgRmllbGRHcm91cCAoaW5jbHVkaW5nIHRoZSBsYWJlbCBpZiBzaG93RGF0YUZpZWxkc0xhYmVsIGlzIHRydWUpXG5cdCAqIFRoZSByZXN1bHQgb2YgdGhpcyBjYWxjdWxhdGlvbiBpcyBzdG9yZWQgaW4gdGhlIHZpc3VhbFNldHRpbmdzLndpZHRoQ2FsY3VsYXRpb24ubWluV2lkdGggcHJvcGVydHksIHdoaWNoIGlzIHVzZWQgYnkgdGhlIE1EQ3RhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RhYmxlIEluc3RhbmNlIG9mIHRoZSBNREN0YWJsZVxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5IEN1cnJlbnQgcHJvcGVydHlcblx0ICogQHBhcmFtIGFQcm9wZXJ0aWVzIEFycmF5IG9mIHByb3BlcnRpZXNcblx0ICogQHByaXZhdGVcblx0ICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuVGFibGVEZWxlZ2F0ZVxuXHQgKi9cblx0X2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvckZpZWxkR3JvdXA6IGZ1bmN0aW9uIChvVGFibGU6IFRhYmxlLCBvUHJvcGVydHk6IGFueSwgYVByb3BlcnRpZXM6IGFueVtdKSB7XG5cdFx0aWYgKG9Qcm9wZXJ0eS5uYW1lLmluZGV4T2YoXCJEYXRhRmllbGRGb3JBbm5vdGF0aW9uOjpGaWVsZEdyb3VwOjpcIikgPT09IDApIHtcblx0XHRcdGNvbnN0IG9Db2x1bW4gPSBvVGFibGUuZ2V0Q29sdW1ucygpLmZpbmQoZnVuY3Rpb24gKG9Db2w6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbC5nZXREYXRhUHJvcGVydHkoKSA9PT0gb1Byb3BlcnR5Lm5hbWU7XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IGJTaG93RGF0YUZpZWxkc0xhYmVsID0gb0NvbHVtbiA/IG9Db2x1bW4uZGF0YShcInNob3dEYXRhRmllbGRzTGFiZWxcIikgPT09IFwidHJ1ZVwiIDogZmFsc2U7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1RhYmxlLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0XHRjb25zdCBvQ29udGV4dCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQob1Byb3BlcnR5Lm1ldGFkYXRhUGF0aC5yZXBsYWNlKC9ALiovLCBcIlwiKSkgYXMgQ29udGV4dDtcblx0XHRcdGNvbnN0IG9EYXRhRmllbGQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChvUHJvcGVydHkubWV0YWRhdGFQYXRoKTtcblx0XHRcdGNvbnN0IG9GaWVsZEdyb3VwOiBhbnkgPSBvRGF0YUZpZWxkLlRhcmdldCA/IG9Db250ZXh0LmdldE9iamVjdChvRGF0YUZpZWxkLlRhcmdldC4kQW5ub3RhdGlvblBhdGgpIDogbnVsbDtcblx0XHRcdGNvbnN0IGFGaWVsZFdpZHRoOiBhbnkgPSBbXTtcblx0XHRcdG9GaWVsZEdyb3VwLkRhdGEuZm9yRWFjaChmdW5jdGlvbiAob0RhdGE6IGFueSkge1xuXHRcdFx0XHRsZXQgb0RhdGFGaWVsZFdpZHRoOiBhbnk7XG5cdFx0XHRcdHN3aXRjaCAob0RhdGEuJFR5cGUpIHtcblx0XHRcdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiOlxuXHRcdFx0XHRcdFx0b0RhdGFGaWVsZFdpZHRoID0gVGFibGVTaXplSGVscGVyLmdldFdpZHRoRm9yRGF0YUZpZWxkRm9yQW5ub3RhdGlvbihcblx0XHRcdFx0XHRcdFx0b0RhdGEsXG5cdFx0XHRcdFx0XHRcdGJTaG93RGF0YUZpZWxkc0xhYmVsLFxuXHRcdFx0XHRcdFx0XHRhUHJvcGVydGllcyxcblx0XHRcdFx0XHRcdFx0b0NvbnRleHRcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCI6XG5cdFx0XHRcdFx0XHRpZiAoYlNob3dEYXRhRmllbGRzTGFiZWwpIHtcblx0XHRcdFx0XHRcdFx0b0RhdGFGaWVsZFdpZHRoID0gVGFibGVTaXplSGVscGVyLmdldFdpZHRoRm9yRGF0YUZpZWxkKG9EYXRhLCBiU2hvd0RhdGFGaWVsZHNMYWJlbCwgYVByb3BlcnRpZXMsIG9Db250ZXh0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIjpcblx0XHRcdFx0XHRcdG9EYXRhRmllbGRXaWR0aCA9IHtcblx0XHRcdFx0XHRcdFx0bGFiZWxXaWR0aDogMCxcblx0XHRcdFx0XHRcdFx0cHJvcGVydHlXaWR0aDogVGFibGVTaXplSGVscGVyLmdldEJ1dHRvbldpZHRoKG9EYXRhLkxhYmVsKVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9EYXRhRmllbGRXaWR0aCkge1xuXHRcdFx0XHRcdGFGaWVsZFdpZHRoLnB1c2gob0RhdGFGaWVsZFdpZHRoLmxhYmVsV2lkdGggKyBvRGF0YUZpZWxkV2lkdGgucHJvcGVydHlXaWR0aCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgbldpZGVzdCA9IGFGaWVsZFdpZHRoLnJlZHVjZShmdW5jdGlvbiAoYWNjOiBhbnksIHZhbHVlOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIE1hdGgubWF4KGFjYywgdmFsdWUpO1xuXHRcdFx0fSwgMCk7XG5cdFx0XHRvUHJvcGVydHkudmlzdWFsU2V0dGluZ3MgPSBkZWVwRXh0ZW5kKG9Qcm9wZXJ0eS52aXN1YWxTZXR0aW5ncywge1xuXHRcdFx0XHR3aWR0aENhbGN1bGF0aW9uOiB7XG5cdFx0XHRcdFx0dmVydGljYWxBcnJhbmdlbWVudDogdHJ1ZSxcblx0XHRcdFx0XHRtaW5XaWR0aDogTWF0aC5jZWlsKG5XaWRlc3QpXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHRfY29tcHV0ZVZpc3VhbFNldHRpbmdzRm9yUHJvcGVydHlXaXRoVmFsdWVIZWxwOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0Y29uc3Qgb1RhYmxlQVBJID0gb1RhYmxlID8gb1RhYmxlLmdldFBhcmVudCgpIDogbnVsbDtcblx0XHRpZiAoIW9Qcm9wZXJ0eS5wcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1RhYmxlLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRpZiAob1Byb3BlcnR5Lm1ldGFkYXRhUGF0aCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcImEgYG1ldGFkYXRhUGF0aGAgcHJvcGVydHkgaXMgZXhwZWN0ZWQgd2hlbiBjb21wdXRpbmcgVmlzdWFsU2V0dGluZ3MgZm9yIHByb3BlcnR5IHdpdGggVmFsdWVIZWxwXCIpO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3Qgb0RhdGFGaWVsZCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke29Qcm9wZXJ0eS5tZXRhZGF0YVBhdGh9QGApO1xuXHRcdFx0aWYgKG9EYXRhRmllbGQgJiYgb0RhdGFGaWVsZFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0XCJdKSB7XG5cdFx0XHRcdG9Qcm9wZXJ0eS52aXN1YWxTZXR0aW5ncyA9IGRlZXBFeHRlbmQob1Byb3BlcnR5LnZpc3VhbFNldHRpbmdzLCB7XG5cdFx0XHRcdFx0d2lkdGhDYWxjdWxhdGlvbjoge1xuXHRcdFx0XHRcdFx0Z2FwOiBvVGFibGVBUEkgJiYgb1RhYmxlQVBJLmdldFJlYWRPbmx5KCkgPyAwIDogNFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdF9jb21wdXRlVmlzdWFsU2V0dGluZ3NGb3JQcm9wZXJ0eVdpdGhVbml0OiBmdW5jdGlvbiAoXG5cdFx0b1RhYmxlOiBhbnksXG5cdFx0b1Byb3BlcnR5OiBhbnksXG5cdFx0b1VuaXQ6IHN0cmluZyxcblx0XHRvVW5pdFRleHQ6IHN0cmluZyxcblx0XHRvVGltZXpvbmVUZXh0OiBzdHJpbmdcblx0KSB7XG5cdFx0Y29uc3Qgb1RhYmxlQVBJID0gb1RhYmxlID8gb1RhYmxlLmdldFBhcmVudCgpIDogbnVsbDtcblx0XHQvLyB1cGRhdGUgZ2FwIGZvciBwcm9wZXJ0aWVzIHdpdGggc3RyaW5nIHVuaXRcblx0XHRjb25zdCBzVW5pdFRleHQgPSBvVW5pdFRleHQgfHwgb1RpbWV6b25lVGV4dDtcblx0XHRpZiAoc1VuaXRUZXh0KSB7XG5cdFx0XHRvUHJvcGVydHkudmlzdWFsU2V0dGluZ3MgPSBkZWVwRXh0ZW5kKG9Qcm9wZXJ0eS52aXN1YWxTZXR0aW5ncywge1xuXHRcdFx0XHR3aWR0aENhbGN1bGF0aW9uOiB7XG5cdFx0XHRcdFx0Z2FwOiBNYXRoLmNlaWwoVGFibGVTaXplSGVscGVyLmdldEJ1dHRvbldpZHRoKHNVbml0VGV4dCkpXG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAob1VuaXQpIHtcblx0XHRcdG9Qcm9wZXJ0eS52aXN1YWxTZXR0aW5ncyA9IGRlZXBFeHRlbmQob1Byb3BlcnR5LnZpc3VhbFNldHRpbmdzLCB7XG5cdFx0XHRcdHdpZHRoQ2FsY3VsYXRpb246IHtcblx0XHRcdFx0XHQvLyBGb3IgcHJvcGVydGllcyB3aXRoIHVuaXQsIGEgZ2FwIG5lZWRzIHRvIGJlIGFkZGVkIHRvIHByb3Blcmx5IHJlbmRlciB0aGUgY29sdW1uIHdpZHRoIG9uIGVkaXQgbW9kZVxuXHRcdFx0XHRcdGdhcDogb1RhYmxlQVBJICYmIG9UYWJsZUFQSS5nZXRSZWFkT25seSgpID8gMCA6IDZcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9LFxuXG5cdF9jb21wdXRlTGFiZWw6IGZ1bmN0aW9uIChwcm9wZXJ0eTogUHJvcGVydHlJbmZvLCBsYWJlbE1hcDogeyBbbGFiZWw6IHN0cmluZ106IFByb3BlcnR5SW5mb1tdIH0pIHtcblx0XHRpZiAocHJvcGVydHkubGFiZWwpIHtcblx0XHRcdGNvbnN0IHByb3BlcnRpZXNXaXRoU2FtZUxhYmVsID0gbGFiZWxNYXBbcHJvcGVydHkubGFiZWxdO1xuXHRcdFx0aWYgKHByb3BlcnRpZXNXaXRoU2FtZUxhYmVsPy5sZW5ndGggPiAxICYmIHByb3BlcnR5LnBhdGg/LmluY2x1ZGVzKFwiL1wiKSAmJiBwcm9wZXJ0eS5hZGRpdGlvbmFsTGFiZWxzKSB7XG5cdFx0XHRcdHByb3BlcnR5LmxhYmVsID0gcHJvcGVydHkubGFiZWwgKyBcIiAoXCIgKyBwcm9wZXJ0eS5hZGRpdGlvbmFsTGFiZWxzLmpvaW4oXCIgLyBcIikgKyBcIilcIjtcblx0XHRcdH1cblx0XHRcdGRlbGV0ZSBwcm9wZXJ0eS5hZGRpdGlvbmFsTGFiZWxzO1xuXHRcdH1cblx0fSxcblx0Ly9VcGRhdGUgVmlzdWFsU2V0dGluZyBmb3IgY29sdW1uV2lkdGggY2FsY3VsYXRpb24gYW5kIGxhYmVscyBvbiBuYXZpZ2F0aW9uIHByb3BlcnRpZXNcblx0X3VwZGF0ZVByb3BlcnR5SW5mbzogZnVuY3Rpb24gKHRhYmxlOiBUYWJsZSwgcHJvcGVydGllczogUHJvcGVydHlJbmZvW10pIHtcblx0XHRjb25zdCBsYWJlbE1hcDogeyBbbGFiZWw6IHN0cmluZ106IFByb3BlcnR5SW5mb1tdIH0gPSB7fTtcblx0XHQvLyBDaGVjayBhdmFpbGFibGUgcDEzbiBtb2Rlc1xuXHRcdGNvbnN0IHAxM25Nb2RlID0gdGFibGUuZ2V0UDEzbk1vZGUoKTtcblx0XHRwcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnR5OiBQcm9wZXJ0eUluZm8pID0+IHtcblx0XHRcdGlmICghcHJvcGVydHkucHJvcGVydHlJbmZvcyAmJiBwcm9wZXJ0eS5sYWJlbCkge1xuXHRcdFx0XHQvLyBPbmx5IGZvciBub24tY29tcGxleCBwcm9wZXJ0aWVzXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHQocDEzbk1vZGU/LmluZGV4T2YoXCJTb3J0XCIpID4gLTEgJiYgcHJvcGVydHkuc29ydGFibGUpIHx8XG5cdFx0XHRcdFx0KHAxM25Nb2RlPy5pbmRleE9mKFwiRmlsdGVyXCIpID4gLTEgJiYgcHJvcGVydHkuZmlsdGVyYWJsZSkgfHxcblx0XHRcdFx0XHQocDEzbk1vZGU/LmluZGV4T2YoXCJHcm91cFwiKSA+IC0xICYmIHByb3BlcnR5Lmdyb3VwYWJsZSlcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0bGFiZWxNYXBbcHJvcGVydHkubGFiZWxdID1cblx0XHRcdFx0XHRcdGxhYmVsTWFwW3Byb3BlcnR5LmxhYmVsXSAhPT0gdW5kZWZpbmVkID8gbGFiZWxNYXBbcHJvcGVydHkubGFiZWxdLmNvbmNhdChbcHJvcGVydHldKSA6IFtwcm9wZXJ0eV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRwcm9wZXJ0aWVzLmZvckVhY2goKHByb3BlcnR5OiBhbnkpID0+IHtcblx0XHRcdHRoaXMuX2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvckZpZWxkR3JvdXAodGFibGUsIHByb3BlcnR5LCBwcm9wZXJ0aWVzKTtcblx0XHRcdHRoaXMuX2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvclByb3BlcnR5V2l0aFZhbHVlSGVscCh0YWJsZSwgcHJvcGVydHkpO1xuXHRcdFx0Ly8gYmNwOiAyMjcwMDAzNTc3XG5cdFx0XHQvLyBTb21lIGNvbHVtbnMgKGVnOiBjdXN0b20gY29sdW1ucykgaGF2ZSBubyB0eXBlQ29uZmlnIHByb3BlcnR5LlxuXHRcdFx0Ly8gaW5pdGlhbGl6aW5nIGl0IHByZXZlbnRzIGFuIGV4Y2VwdGlvbiB0aHJvd1xuXHRcdFx0cHJvcGVydHkudHlwZUNvbmZpZyA9IGRlZXBFeHRlbmQocHJvcGVydHkudHlwZUNvbmZpZywge30pO1xuXHRcdFx0dGhpcy5fY29tcHV0ZUxhYmVsKHByb3BlcnR5LCBsYWJlbE1hcCk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIHByb3BlcnRpZXM7XG5cdH0sXG5cblx0Z2V0Q29sdW1uc0ZvcjogZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0cmV0dXJuIG9UYWJsZS5nZXRQYXJlbnQoKS5nZXRUYWJsZURlZmluaXRpb24oKS5jb2x1bW5zO1xuXHR9LFxuXG5cdF9nZXRBZ2dyZWdhdGVkUHJvcGVydHlNYXA6IGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdHJldHVybiBvVGFibGUuZ2V0UGFyZW50KCkuZ2V0VGFibGVEZWZpbml0aW9uKCkuYWdncmVnYXRlcztcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgZXhwb3J0IGNhcGFiaWxpdGllcyBmb3IgdGhlIGdpdmVuIHNhcC51aS5tZGMuVGFibGUgaW5zdGFuY2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGFibGUgSW5zdGFuY2Ugb2YgdGhlIHRhYmxlXG5cdCAqIEByZXR1cm5zIFByb21pc2UgcmVwcmVzZW50aW5nIHRoZSBleHBvcnQgY2FwYWJpbGl0aWVzIG9mIHRoZSB0YWJsZSBpbnN0YW5jZVxuXHQgKi9cblx0ZmV0Y2hFeHBvcnRDYXBhYmlsaXRpZXM6IGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdGNvbnN0IG9DYXBhYmlsaXRpZXM6IGFueSA9IHsgXCJYTFNYXCI6IHt9IH07XG5cdFx0bGV0IG9Nb2RlbCE6IGFueTtcblx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLmZldGNoTW9kZWwob1RhYmxlKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG1vZGVsOiBhbnkpIHtcblx0XHRcdFx0b01vZGVsID0gbW9kZWw7XG5cdFx0XHRcdHJldHVybiBvTW9kZWwuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KFwiLyRFbnRpdHlDb250YWluZXJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5TdXBwb3J0ZWRGb3JtYXRzXCIpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChhU3VwcG9ydGVkRm9ybWF0czogc3RyaW5nW10gfCB1bmRlZmluZWQpIHtcblx0XHRcdFx0Y29uc3QgYUxvd2VyRm9ybWF0cyA9IChhU3VwcG9ydGVkRm9ybWF0cyB8fCBbXSkubWFwKChlbGVtZW50KSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIGVsZW1lbnQudG9Mb3dlckNhc2UoKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChhTG93ZXJGb3JtYXRzLmluZGV4T2YoXCJhcHBsaWNhdGlvbi9wZGZcIikgPiAtMSkge1xuXHRcdFx0XHRcdHJldHVybiBvTW9kZWwuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KFwiLyRFbnRpdHlDb250YWluZXJAY29tLnNhcC52b2NhYnVsYXJpZXMuUERGLnYxLkZlYXR1cmVzXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9Bbm5vdGF0aW9uOiBhbnkpIHtcblx0XHRcdFx0aWYgKG9Bbm5vdGF0aW9uKSB7XG5cdFx0XHRcdFx0b0NhcGFiaWxpdGllc1tcIlBERlwiXSA9IE9iamVjdC5hc3NpZ24oe30sIG9Bbm5vdGF0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKGBBbiBlcnJvciBvY2N1cnMgd2hpbGUgY29tcHV0aW5nIGV4cG9ydCBjYXBhYmlsaXRpZXM6ICR7ZXJyfWApO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIG9DYXBhYmlsaXRpZXM7XG5cdFx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogRmlsdGVyaW5nIG9uIDE6biBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgYW5kIG5hdmlnYXRpb25cblx0ICogcHJvcGVydGllcyBub3QgcGFydCBvZiB0aGUgTGluZUl0ZW0gYW5ub3RhdGlvbiBpcyBmb3JiaWRkZW4uXG5cdCAqXG5cdCAqIEBwYXJhbSBjb2x1bW5JbmZvXG5cdCAqIEBwYXJhbSBtZXRhTW9kZWxcblx0ICogQHBhcmFtIHRhYmxlXG5cdCAqIEByZXR1cm5zIEJvb2xlYW4gdHJ1ZSBpZiBmaWx0ZXJpbmcgaXMgYWxsb3dlZCwgZmFsc2Ugb3RoZXJ3aXNlXG5cdCAqL1xuXHRfaXNGaWx0ZXJhYmxlTmF2aWdhdGlvblByb3BlcnR5OiBmdW5jdGlvbiAoY29sdW1uSW5mbzogQW5ub3RhdGlvblRhYmxlQ29sdW1uLCBtZXRhTW9kZWw6IGFueSwgdGFibGU6IFRhYmxlKSB7XG5cdFx0Y29uc3QgdGFibGVNZXRhUGF0aCA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKHRhYmxlLCBcIm1ldGFQYXRoXCIpO1xuXHRcdGlmICghdGFibGVNZXRhUGF0aCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHQvLyBnZXQgdGhlIERhdGFNb2RlbE9iamVjdFBhdGggZm9yIHRoZSB0YWJsZVxuXHRcdGNvbnN0IHRhYmxlRGF0YU1vZGVsT2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhtZXRhTW9kZWwuZ2V0Q29udGV4dCh0YWJsZU1ldGFQYXRoKSksXG5cdFx0XHQvLyBnZXQgYWxsIG5hdmlnYXRpb24gcHJvcGVydGllcyBsZWFkaW5nIHRvIHRoZSBjb2x1bW5cblx0XHRcdGNvbHVtbk5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG1ldGFNb2RlbC5nZXRDb250ZXh0KGNvbHVtbkluZm8uYW5ub3RhdGlvblBhdGgpKS5uYXZpZ2F0aW9uUHJvcGVydGllcyxcblx0XHRcdC8vIHdlIGFyZSBvbmx5IGludGVyZXN0ZWQgaW4gbmF2aWdhdGlvbiBwcm9wZXJ0aWVzIHJlbGF0aXZlIHRvIHRoZSB0YWJsZSwgc28gYWxsIGJlZm9yZSBhbmQgaW5jbHVkaW5nIHRoZSB0YWJsZXMgdGFyZ2V0VHlwZSBjYW4gYmUgZmlsdGVyZWRcblx0XHRcdHRhYmxlVGFyZ2V0RW50aXR5SW5kZXggPSBjb2x1bW5OYXZpZ2F0aW9uUHJvcGVydGllcy5maW5kSW5kZXgoXG5cdFx0XHRcdChwcm9wKSA9PiBwcm9wLnRhcmdldFR5cGU/Lm5hbWUgPT09IHRhYmxlRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlLm5hbWVcblx0XHRcdCksXG5cdFx0XHRyZWxhdGl2ZU5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gY29sdW1uTmF2aWdhdGlvblByb3BlcnRpZXMuc2xpY2UodGFibGVUYXJnZXRFbnRpdHlJbmRleCA+IDAgPyB0YWJsZVRhcmdldEVudGl0eUluZGV4IDogMCk7XG5cdFx0cmV0dXJuIChcblx0XHRcdCFjb2x1bW5JbmZvLnJlbGF0aXZlUGF0aC5pbmNsdWRlcyhcIi9cIikgfHxcblx0XHRcdChjb2x1bW5JbmZvLmlzUGFydE9mTGluZUl0ZW0gPT09IHRydWUgJiZcblx0XHRcdFx0IXJlbGF0aXZlTmF2aWdhdGlvblByb3BlcnRpZXMuc29tZShcblx0XHRcdFx0XHQobmF2aWdhdGlvblByb3BlcnR5KSA9PiBuYXZpZ2F0aW9uUHJvcGVydHkuX3R5cGUgPT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiAmJiBuYXZpZ2F0aW9uUHJvcGVydHkuaXNDb2xsZWN0aW9uXG5cdFx0XHRcdCkpXG5cdFx0KTtcblx0fSxcblxuXHRfZmV0Y2hQcm9wZXJ0eUluZm86IGZ1bmN0aW9uIChvTWV0YU1vZGVsOiBhbnksIG9Db2x1bW5JbmZvOiBhbnksIG9UYWJsZTogYW55LCBvQXBwQ29tcG9uZW50OiBhbnksIGJVc2VBZGRpdGlvbmFsUHJvcGVydGllczogYW55KSB7XG5cdFx0Y29uc3Qgc0Fic29sdXRlTmF2aWdhdGlvblBhdGggPSBvQ29sdW1uSW5mby5hbm5vdGF0aW9uUGF0aCxcblx0XHRcdG9EYXRhRmllbGQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzQWJzb2x1dGVOYXZpZ2F0aW9uUGF0aCksXG5cdFx0XHRvTmF2aWdhdGlvbkNvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNBYnNvbHV0ZU5hdmlnYXRpb25QYXRoKSxcblx0XHRcdG9UeXBlQ29uZmlnID1cblx0XHRcdFx0b0NvbHVtbkluZm8udHlwZUNvbmZpZyAmJlxuXHRcdFx0XHRvQ29sdW1uSW5mby50eXBlQ29uZmlnLmNsYXNzTmFtZSAmJlxuXHRcdFx0XHREZWxlZ2F0ZVV0aWwuaXNUeXBlRmlsdGVyYWJsZShvQ29sdW1uSW5mby50eXBlQ29uZmlnLmNsYXNzTmFtZSlcblx0XHRcdFx0XHQ/IFR5cGVVdGlsLmdldFR5cGVDb25maWcoXG5cdFx0XHRcdFx0XHRcdG9Db2x1bW5JbmZvLnR5cGVDb25maWcuY2xhc3NOYW1lLFxuXHRcdFx0XHRcdFx0XHRvQ29sdW1uSW5mby50eXBlQ29uZmlnLm9Gb3JtYXRPcHRpb25zLFxuXHRcdFx0XHRcdFx0XHRvQ29sdW1uSW5mby50eXBlQ29uZmlnLm9Db25zdHJhaW50c1xuXHRcdFx0XHRcdCAgKVxuXHRcdFx0XHRcdDoge30sXG5cdFx0XHRiRmlsdGVyYWJsZSA9IENvbW1vbkhlbHBlci5pc1Byb3BlcnR5RmlsdGVyYWJsZShvQ29sdW1uSW5mby5yZWxhdGl2ZVBhdGgsIHsgY29udGV4dDogb05hdmlnYXRpb25Db250ZXh0IH0sIG9EYXRhRmllbGQpLFxuXHRcdFx0YkNvbXBsZXhUeXBlID0gb0NvbHVtbkluZm8udHlwZUNvbmZpZyAmJiBvQ29sdW1uSW5mby50eXBlQ29uZmlnLmNsYXNzTmFtZS5pbmRleE9mKFwiRWRtLlwiKSAhPT0gMCxcblx0XHRcdGJJc0FuYWx5dGljYWxUYWJsZSA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJlbmFibGVBbmFseXRpY3NcIikgPT09IFwidHJ1ZVwiLFxuXHRcdFx0YUFnZ3JlZ2F0ZWRQcm9wZXJ0eU1hcFVuZmlsdGVyYWJsZSA9IGJJc0FuYWx5dGljYWxUYWJsZSA/IHRoaXMuX2dldEFnZ3JlZ2F0ZWRQcm9wZXJ0eU1hcChvVGFibGUpIDoge30sXG5cdFx0XHRvRXhwb3J0U2V0dGluZ3MgPSBvQ29sdW1uSW5mby5leHBvcnRTZXR0aW5ncyB8fCBudWxsLFxuXHRcdFx0ZXhwb3J0Rm9ybWF0ID1cblx0XHRcdFx0b0NvbHVtbkluZm8udHlwZUNvbmZpZyAmJiBvQ29sdW1uSW5mby50eXBlQ29uZmlnLmNsYXNzTmFtZVxuXHRcdFx0XHRcdD8gdGhpcy5fZ2V0RXhwb3J0Rm9ybWF0KG9Db2x1bW5JbmZvLnR5cGVDb25maWcuY2xhc3NOYW1lKVxuXHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdGNvbnN0IHNMYWJlbCA9IG9Db2x1bW5JbmZvLmlzRGF0YVBvaW50RmFrZVRhcmdldFByb3BlcnR5XG5cdFx0XHQ/IFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIlRhcmdldFZhbHVlXCIpXG5cdFx0XHQ6IERlbGVnYXRlVXRpbC5nZXRMb2NhbGl6ZWRUZXh0KG9Db2x1bW5JbmZvLmxhYmVsLCBvQXBwQ29tcG9uZW50IHx8IG9UYWJsZSk7XG5cblx0XHRpZiAob0V4cG9ydFNldHRpbmdzKSB7XG5cdFx0XHRpZiAoZXhwb3J0Rm9ybWF0ICYmICFvRXhwb3J0U2V0dGluZ3MudGltZXpvbmVQcm9wZXJ0eSkge1xuXHRcdFx0XHRvRXhwb3J0U2V0dGluZ3MuZm9ybWF0ID0gZXhwb3J0Rm9ybWF0O1xuXHRcdFx0fVxuXHRcdFx0Ly8gU2V0IHRoZSBleHBvcnRTZXR0aW5ncyB0ZW1wbGF0ZSBvbmx5IGlmIGl0IGV4aXN0cy5cblx0XHRcdGlmIChvRXhwb3J0U2V0dGluZ3MudGVtcGxhdGUpIHtcblx0XHRcdFx0b0V4cG9ydFNldHRpbmdzLnRlbXBsYXRlID0gb0NvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudGVtcGxhdGU7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb1Byb3BlcnR5SW5mbzogYW55ID0ge1xuXHRcdFx0bmFtZTogb0NvbHVtbkluZm8ubmFtZSxcblx0XHRcdG1ldGFkYXRhUGF0aDogc0Fic29sdXRlTmF2aWdhdGlvblBhdGgsXG5cdFx0XHRncm91cExhYmVsOiBvQ29sdW1uSW5mby5ncm91cExhYmVsLFxuXHRcdFx0Z3JvdXA6IG9Db2x1bW5JbmZvLmdyb3VwLFxuXHRcdFx0bGFiZWw6IHNMYWJlbCxcblx0XHRcdHRvb2x0aXA6IG9Db2x1bW5JbmZvLnRvb2x0aXAsXG5cdFx0XHR0eXBlQ29uZmlnOiBvVHlwZUNvbmZpZyxcblx0XHRcdHZpc2libGU6IG9Db2x1bW5JbmZvLmF2YWlsYWJpbGl0eSAhPT0gXCJIaWRkZW5cIiAmJiAhYkNvbXBsZXhUeXBlLFxuXHRcdFx0ZXhwb3J0U2V0dGluZ3M6IG9FeHBvcnRTZXR0aW5ncyxcblx0XHRcdHVuaXQ6IG9Db2x1bW5JbmZvLnVuaXRcblx0XHR9O1xuXG5cdFx0Ly8gU2V0IHZpc3VhbFNldHRpbmdzIG9ubHkgaWYgaXQgZXhpc3RzXG5cdFx0aWYgKG9Db2x1bW5JbmZvLnZpc3VhbFNldHRpbmdzICYmIE9iamVjdC5rZXlzKG9Db2x1bW5JbmZvLnZpc3VhbFNldHRpbmdzKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRvUHJvcGVydHlJbmZvLnZpc3VhbFNldHRpbmdzID0gb0NvbHVtbkluZm8udmlzdWFsU2V0dGluZ3M7XG5cdFx0fVxuXHRcdGlmIChleHBvcnRGb3JtYXQpIHtcblx0XHRcdGNvbnN0IG9UYWJsZUFQSSA9IG9UYWJsZSA/IG9UYWJsZS5nZXRQYXJlbnQoKSA6IG51bGw7XG5cdFx0XHQvLyBGb3IgcHJvcGVydGllcyB3aXRoIGRhdGUvdGltZS9kYXRlVGltZSBkYXRhIHR5cGVzLCBhIGdhcCBuZWVkcyB0byBiZSBhZGRlZCB0byBwcm9wZXJseSByZW5kZXIgdGhlIGNvbHVtbiB3aWR0aCBvbiBlZGl0IG1vZGVcblx0XHRcdG9Qcm9wZXJ0eUluZm8udmlzdWFsU2V0dGluZ3MgPSB7XG5cdFx0XHRcdHdpZHRoQ2FsY3VsYXRpb246IHtcblx0XHRcdFx0XHQvLyBhIGdhcCBvZiAxIGlzIHN0aWxsIG5lZWRlZCBiZWNhdXNlIG9mIHRoZSBwYWRkaW5nIG9mIHRoZSBjZWxsXG5cdFx0XHRcdFx0Ly8gQkNQOiAyMTgwNDEzNDMxXG5cdFx0XHRcdFx0Z2FwOiBvVGFibGVBUEkgJiYgb1RhYmxlQVBJLmdldFJlYWRPbmx5KCkgPyAxIDogMS41XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0fVxuXG5cdFx0Ly8gTURDIGV4cGVjdHMgICdwcm9wZXJ0eUluZm9zJyBvbmx5IGZvciBjb21wbGV4IHByb3BlcnRpZXMuXG5cdFx0Ly8gQW4gZW1wdHkgYXJyYXkgdGhyb3dzIHZhbGlkYXRpb24gZXJyb3IgYW5kIHVuZGVmaW5lZCB2YWx1ZSBpcyB1bmhhbmRsZWQuXG5cdFx0aWYgKG9Db2x1bW5JbmZvLnByb3BlcnR5SW5mb3MgJiYgb0NvbHVtbkluZm8ucHJvcGVydHlJbmZvcy5sZW5ndGgpIHtcblx0XHRcdG9Qcm9wZXJ0eUluZm8ucHJvcGVydHlJbmZvcyA9IG9Db2x1bW5JbmZvLnByb3BlcnR5SW5mb3M7XG5cdFx0XHQvL29ubHkgaW4gY2FzZSBvZiBjb21wbGV4IHByb3BlcnRpZXMsIHdyYXAgdGhlIGNlbGwgY29udGVudFx0b24gdGhlIGV4Y2VsIGV4cG9ydGVkIGZpbGVcblx0XHRcdGlmIChvQ29sdW1uSW5mby5leHBvcnRTZXR0aW5ncz8ud3JhcCkge1xuXHRcdFx0XHRvUHJvcGVydHlJbmZvLmV4cG9ydFNldHRpbmdzLndyYXAgPSBvQ29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy53cmFwO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGJVc2VBZGRpdGlvbmFsUHJvcGVydGllcyAmJiBvQ29sdW1uSW5mby5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcyAmJiBvQ29sdW1uSW5mby5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcy5sZW5ndGgpIHtcblx0XHRcdFx0b1Byb3BlcnR5SW5mby5wcm9wZXJ0eUluZm9zID0gb1Byb3BlcnR5SW5mby5wcm9wZXJ0eUluZm9zLmNvbmNhdChvQ29sdW1uSW5mby5hZGRpdGlvbmFsUHJvcGVydHlJbmZvcyk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEFkZCBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBzdXBwb3J0ZWQgb25seSBieSBzaW1wbGUgUHJvcGVydHlJbmZvcy5cblx0XHRcdG9Qcm9wZXJ0eUluZm8ucGF0aCA9IG9Db2x1bW5JbmZvLnJlbGF0aXZlUGF0aDtcblx0XHRcdC8vIFRPRE8gd2l0aCB0aGUgbmV3IGNvbXBsZXggcHJvcGVydHkgaW5mbywgYSBsb3Qgb2YgXCJEZXNjcmlwdGlvblwiIGZpZWxkcyBhcmUgYWRkZWQgYXMgZmlsdGVyL3NvcnQgZmllbGRzXG5cdFx0XHRvUHJvcGVydHlJbmZvLnNvcnRhYmxlID0gb0NvbHVtbkluZm8uc29ydGFibGU7XG5cdFx0XHRvUHJvcGVydHlJbmZvLmZpbHRlcmFibGUgPVxuXHRcdFx0XHQhb0NvbHVtbkluZm8uaXNEYXRhUG9pbnRGYWtlVGFyZ2V0UHJvcGVydHkgJiZcblx0XHRcdFx0ISFiRmlsdGVyYWJsZSAmJlxuXHRcdFx0XHR0aGlzLl9pc0ZpbHRlcmFibGVOYXZpZ2F0aW9uUHJvcGVydHkob0NvbHVtbkluZm8sIG9NZXRhTW9kZWwsIG9UYWJsZSkgJiZcblx0XHRcdFx0Ly8gVE9ETyBpZ25vcmluZyBhbGwgcHJvcGVydGllcyB0aGF0IGFyZSBub3QgYWxzbyBhdmFpbGFibGUgZm9yIGFkYXB0YXRpb24gZm9yIG5vdywgYnV0IHByb3BlciBjb25jZXB0IHJlcXVpcmVkXG5cdFx0XHRcdCghYklzQW5hbHl0aWNhbFRhYmxlIHx8ICFhQWdncmVnYXRlZFByb3BlcnR5TWFwVW5maWx0ZXJhYmxlW29Qcm9wZXJ0eUluZm8ubmFtZV0pO1xuXHRcdFx0b1Byb3BlcnR5SW5mby5rZXkgPSBvQ29sdW1uSW5mby5pc0tleTtcblx0XHRcdG9Qcm9wZXJ0eUluZm8uZ3JvdXBhYmxlID0gb0NvbHVtbkluZm8uaXNHcm91cGFibGU7XG5cdFx0XHRpZiAob0NvbHVtbkluZm8udGV4dEFycmFuZ2VtZW50KSB7XG5cdFx0XHRcdGNvbnN0IG9EZXNjcmlwdGlvbkNvbHVtbiA9IHRoaXMuZ2V0Q29sdW1uc0ZvcihvVGFibGUpLmZpbmQoZnVuY3Rpb24gKG9Db2w6IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBvQ29sLm5hbWUgPT09IG9Db2x1bW5JbmZvLnRleHRBcnJhbmdlbWVudC50ZXh0UHJvcGVydHk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAob0Rlc2NyaXB0aW9uQ29sdW1uKSB7XG5cdFx0XHRcdFx0b1Byb3BlcnR5SW5mby5tb2RlID0gb0NvbHVtbkluZm8udGV4dEFycmFuZ2VtZW50Lm1vZGU7XG5cdFx0XHRcdFx0b1Byb3BlcnR5SW5mby52YWx1ZVByb3BlcnR5ID0gb0NvbHVtbkluZm8ucmVsYXRpdmVQYXRoO1xuXHRcdFx0XHRcdG9Qcm9wZXJ0eUluZm8uZGVzY3JpcHRpb25Qcm9wZXJ0eSA9IG9EZXNjcmlwdGlvbkNvbHVtbi5yZWxhdGl2ZVBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG9Qcm9wZXJ0eUluZm8udGV4dCA9IG9Db2x1bW5JbmZvLnRleHRBcnJhbmdlbWVudCAmJiBvQ29sdW1uSW5mby50ZXh0QXJyYW5nZW1lbnQudGV4dFByb3BlcnR5O1xuXHRcdFx0b1Byb3BlcnR5SW5mby5jYXNlU2Vuc2l0aXZlID0gb0NvbHVtbkluZm8uY2FzZVNlbnNpdGl2ZTtcblx0XHRcdGlmIChvQ29sdW1uSW5mby5hZGRpdGlvbmFsTGFiZWxzKSB7XG5cdFx0XHRcdG9Qcm9wZXJ0eUluZm8uYWRkaXRpb25hbExhYmVscyA9IG9Db2x1bW5JbmZvLmFkZGl0aW9uYWxMYWJlbHMubWFwKChsYWJlbDogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIERlbGVnYXRlVXRpbC5nZXRMb2NhbGl6ZWRUZXh0KGxhYmVsLCBvQXBwQ29tcG9uZW50IHx8IG9UYWJsZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHRoaXMuX2NvbXB1dGVWaXN1YWxTZXR0aW5nc0ZvclByb3BlcnR5V2l0aFVuaXQoXG5cdFx0XHRvVGFibGUsXG5cdFx0XHRvUHJvcGVydHlJbmZvLFxuXHRcdFx0b0NvbHVtbkluZm8udW5pdCxcblx0XHRcdG9Db2x1bW5JbmZvLnVuaXRUZXh0LFxuXHRcdFx0b0NvbHVtbkluZm8udGltZXpvbmVUZXh0XG5cdFx0KTtcblxuXHRcdHJldHVybiBvUHJvcGVydHlJbmZvO1xuXHR9LFxuXG5cdF9mZXRjaEN1c3RvbVByb3BlcnR5SW5mbzogZnVuY3Rpb24gKG9Db2x1bW5JbmZvOiBhbnksIG9UYWJsZTogYW55LCBvQXBwQ29tcG9uZW50OiBhbnkpIHtcblx0XHRjb25zdCBzTGFiZWwgPSBEZWxlZ2F0ZVV0aWwuZ2V0TG9jYWxpemVkVGV4dChvQ29sdW1uSW5mby5oZWFkZXIsIG9BcHBDb21wb25lbnQgfHwgb1RhYmxlKTsgLy8gVG9kbzogVG8gYmUgcmVtb3ZlZCBvbmNlIE1EQyBwcm92aWRlcyB0cmFuc2xhdGlvbiBzdXBwb3J0XG5cdFx0Y29uc3Qgb1Byb3BlcnR5SW5mbzogYW55ID0ge1xuXHRcdFx0bmFtZTogb0NvbHVtbkluZm8ubmFtZSxcblx0XHRcdGdyb3VwTGFiZWw6IG51bGwsXG5cdFx0XHRncm91cDogbnVsbCxcblx0XHRcdGxhYmVsOiBzTGFiZWwsXG5cdFx0XHR0eXBlOiBcIkVkbS5TdHJpbmdcIiwgLy8gVEJEXG5cdFx0XHR2aXNpYmxlOiBvQ29sdW1uSW5mby5hdmFpbGFiaWxpdHkgIT09IFwiSGlkZGVuXCIsXG5cdFx0XHRleHBvcnRTZXR0aW5nczogb0NvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MsXG5cdFx0XHR2aXN1YWxTZXR0aW5nczogb0NvbHVtbkluZm8udmlzdWFsU2V0dGluZ3Ncblx0XHR9O1xuXG5cdFx0Ly8gTURDIGV4cGVjdHMgJ3Byb3BlcnR5SW5mb3MnIG9ubHkgZm9yIGNvbXBsZXggcHJvcGVydGllcy5cblx0XHQvLyBBbiBlbXB0eSBhcnJheSB0aHJvd3MgdmFsaWRhdGlvbiBlcnJvciBhbmQgdW5kZWZpbmVkIHZhbHVlIGlzIHVuaGFuZGxlZC5cblx0XHRpZiAob0NvbHVtbkluZm8ucHJvcGVydHlJbmZvcyAmJiBvQ29sdW1uSW5mby5wcm9wZXJ0eUluZm9zLmxlbmd0aCkge1xuXHRcdFx0b1Byb3BlcnR5SW5mby5wcm9wZXJ0eUluZm9zID0gb0NvbHVtbkluZm8ucHJvcGVydHlJbmZvcztcblx0XHRcdC8vb25seSBpbiBjYXNlIG9mIGNvbXBsZXggcHJvcGVydGllcywgd3JhcCB0aGUgY2VsbCBjb250ZW50IG9uIHRoZSBleGNlbCBleHBvcnRlZCBmaWxlXG5cdFx0XHRvUHJvcGVydHlJbmZvLmV4cG9ydFNldHRpbmdzID0ge1xuXHRcdFx0XHR3cmFwOiBvQ29sdW1uSW5mby5leHBvcnRTZXR0aW5ncy53cmFwLFxuXHRcdFx0XHR0ZW1wbGF0ZTogb0NvbHVtbkluZm8uZXhwb3J0U2V0dGluZ3MudGVtcGxhdGVcblx0XHRcdH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIEFkZCBwcm9wZXJ0aWVzIHdoaWNoIGFyZSBzdXBwb3J0ZWQgb25seSBieSBzaW1wbGUgUHJvcGVydHlJbmZvcy5cblx0XHRcdG9Qcm9wZXJ0eUluZm8ucGF0aCA9IG9Db2x1bW5JbmZvLm5hbWU7XG5cdFx0XHRvUHJvcGVydHlJbmZvLnNvcnRhYmxlID0gZmFsc2U7XG5cdFx0XHRvUHJvcGVydHlJbmZvLmZpbHRlcmFibGUgPSBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIG9Qcm9wZXJ0eUluZm87XG5cdH0sXG5cdF9iQ29sdW1uSGFzUHJvcGVydHlXaXRoRHJhZnRJbmRpY2F0b3I6IGZ1bmN0aW9uIChvQ29sdW1uSW5mbzogYW55KSB7XG5cdFx0cmV0dXJuICEhKFxuXHRcdFx0KG9Db2x1bW5JbmZvLmZvcm1hdE9wdGlvbnMgJiYgb0NvbHVtbkluZm8uZm9ybWF0T3B0aW9ucy5oYXNEcmFmdEluZGljYXRvcikgfHxcblx0XHRcdChvQ29sdW1uSW5mby5mb3JtYXRPcHRpb25zICYmIG9Db2x1bW5JbmZvLmZvcm1hdE9wdGlvbnMuZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoKVxuXHRcdCk7XG5cdH0sXG5cdF91cGRhdGVEcmFmdEluZGljYXRvck1vZGVsOiBmdW5jdGlvbiAoX29UYWJsZTogYW55LCBfb0NvbHVtbkluZm86IGFueSkge1xuXHRcdGNvbnN0IGFWaXNpYmxlQ29sdW1ucyA9IF9vVGFibGUuZ2V0Q29sdW1ucygpO1xuXHRcdGNvbnN0IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0ID0gX29UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdGNvbnN0IHNJbnRlcm5hbFBhdGggPSBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCAmJiBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0aWYgKGFWaXNpYmxlQ29sdW1ucyAmJiBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0Zm9yIChjb25zdCBpbmRleCBpbiBhVmlzaWJsZUNvbHVtbnMpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHRoaXMuX2JDb2x1bW5IYXNQcm9wZXJ0eVdpdGhEcmFmdEluZGljYXRvcihfb0NvbHVtbkluZm8pICYmXG5cdFx0XHRcdFx0X29Db2x1bW5JbmZvLm5hbWUgPT09IGFWaXNpYmxlQ29sdW1uc1tpbmRleF0uZ2V0RGF0YVByb3BlcnR5KClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0aWYgKG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LmdldFByb3BlcnR5KHNJbnRlcm5hbFBhdGggKyBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbFBhdGggKyBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IsIF9vQ29sdW1uSW5mby5uYW1lKTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0X2ZldGNoUHJvcGVydGllc0ZvckVudGl0eTogZnVuY3Rpb24gKFxuXHRcdG9UYWJsZTogYW55LFxuXHRcdHNFbnRpdHlUeXBlUGF0aDogYW55LFxuXHRcdG9NZXRhTW9kZWw6IGFueSxcblx0XHRvQXBwQ29tcG9uZW50OiBhbnksXG5cdFx0YlVzZUFkZGl0aW9uYWxQcm9wZXJ0aWVzOiBhbnlcblx0KSB7XG5cdFx0Ly8gd2hlbiBmZXRjaGluZyBwcm9wZXJ0aWVzLCB0aGlzIGJpbmRpbmcgY29udGV4dCBpcyBuZWVkZWQgLSBzbyBsZXRzIGNyZWF0ZSBpdCBvbmx5IG9uY2UgYW5kIHVzZSBpZiBmb3IgYWxsIHByb3BlcnRpZXMvZGF0YS1maWVsZHMvbGluZS1pdGVtc1xuXHRcdGNvbnN0IHNCaW5kaW5nUGF0aCA9IE1vZGVsSGVscGVyLmdldEVudGl0eVNldFBhdGgoc0VudGl0eVR5cGVQYXRoKTtcblx0XHRsZXQgYUZldGNoZWRQcm9wZXJ0aWVzOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IG9GUiA9IENvbW1vblV0aWxzLmdldEZpbHRlclJlc3RyaWN0aW9uc0J5UGF0aChzQmluZGluZ1BhdGgsIG9NZXRhTW9kZWwpO1xuXHRcdGNvbnN0IGFOb25GaWx0ZXJhYmxlUHJvcHMgPSBvRlJbRmlsdGVyUmVzdHJpY3Rpb25zLk5PTl9GSUxURVJBQkxFX1BST1BFUlRJRVNdO1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUodGhpcy5nZXRDb2x1bW5zRm9yKG9UYWJsZSkpXG5cdFx0XHQudGhlbigoYUNvbHVtbnM6IGFueSkgPT4ge1xuXHRcdFx0XHQvLyBEcmFmdEFkbWluaXN0cmF0aXZlRGF0YSBkb2VzIG5vdCB3b3JrIHZpYSAnZW50aXR5U2V0LyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nL0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhJ1xuXHRcdFx0XHRpZiAoYUNvbHVtbnMpIHtcblx0XHRcdFx0XHRsZXQgb1Byb3BlcnR5SW5mbztcblx0XHRcdFx0XHRhQ29sdW1ucy5mb3JFYWNoKChvQ29sdW1uSW5mbzogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLl91cGRhdGVEcmFmdEluZGljYXRvck1vZGVsKG9UYWJsZSwgb0NvbHVtbkluZm8pO1xuXHRcdFx0XHRcdFx0c3dpdGNoIChvQ29sdW1uSW5mby50eXBlKSB7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJBbm5vdGF0aW9uXCI6XG5cdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mbyA9IHRoaXMuX2ZldGNoUHJvcGVydHlJbmZvKFxuXHRcdFx0XHRcdFx0XHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0XHRcdG9Db2x1bW5JbmZvLFxuXHRcdFx0XHRcdFx0XHRcdFx0b1RhYmxlLFxuXHRcdFx0XHRcdFx0XHRcdFx0b0FwcENvbXBvbmVudCxcblx0XHRcdFx0XHRcdFx0XHRcdGJVc2VBZGRpdGlvbmFsUHJvcGVydGllc1xuXHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKG9Qcm9wZXJ0eUluZm8gJiYgYU5vbkZpbHRlcmFibGVQcm9wcy5pbmRleE9mKG9Qcm9wZXJ0eUluZm8ubmFtZSkgPT09IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvUHJvcGVydHlJbmZvLm1heENvbmRpdGlvbnMgPSBEZWxlZ2F0ZVV0aWwuaXNNdWx0aVZhbHVlKG9Qcm9wZXJ0eUluZm8pID8gLTEgOiAxO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0Y2FzZSBcIlNsb3RcIjpcblx0XHRcdFx0XHRcdFx0Y2FzZSBcIkRlZmF1bHRcIjpcblx0XHRcdFx0XHRcdFx0XHRvUHJvcGVydHlJbmZvID0gdGhpcy5fZmV0Y2hDdXN0b21Qcm9wZXJ0eUluZm8ob0NvbHVtbkluZm8sIG9UYWJsZSwgb0FwcENvbXBvbmVudCk7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGB1bmhhbmRsZWQgc3dpdGNoIGNhc2UgJHtvQ29sdW1uSW5mby50eXBlfWApO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0YUZldGNoZWRQcm9wZXJ0aWVzLnB1c2gob1Byb3BlcnR5SW5mbyk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdGFGZXRjaGVkUHJvcGVydGllcyA9IHRoaXMuX3VwZGF0ZVByb3BlcnR5SW5mbyhvVGFibGUsIGFGZXRjaGVkUHJvcGVydGllcyk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnI6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoYEFuIGVycm9yIG9jY3VycyB3aGlsZSB1cGRhdGluZyBmZXRjaGVkIHByb3BlcnRpZXM6ICR7ZXJyfWApO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0cmV0dXJuIGFGZXRjaGVkUHJvcGVydGllcztcblx0XHRcdH0pO1xuXHR9LFxuXG5cdF9nZXRDYWNoZWRPckZldGNoUHJvcGVydGllc0ZvckVudGl0eTogZnVuY3Rpb24gKFxuXHRcdG9UYWJsZTogYW55LFxuXHRcdHNFbnRpdHlUeXBlUGF0aDogYW55LFxuXHRcdG9NZXRhTW9kZWw6IGFueSxcblx0XHRvQXBwQ29tcG9uZW50PzogYW55LFxuXHRcdGJVc2VBZGRpdGlvbmFsUHJvcGVydGllcz86IGFueVxuXHQpIHtcblx0XHRjb25zdCBhRmV0Y2hlZFByb3BlcnRpZXMgPSBfZ2V0Q2FjaGVkUHJvcGVydGllcyhvVGFibGUsIGJVc2VBZGRpdGlvbmFsUHJvcGVydGllcyk7XG5cblx0XHRpZiAoYUZldGNoZWRQcm9wZXJ0aWVzKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGFGZXRjaGVkUHJvcGVydGllcyk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9mZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkob1RhYmxlLCBzRW50aXR5VHlwZVBhdGgsIG9NZXRhTW9kZWwsIG9BcHBDb21wb25lbnQsIGJVc2VBZGRpdGlvbmFsUHJvcGVydGllcykudGhlbihmdW5jdGlvbiAoXG5cdFx0XHRhU3ViRmV0Y2hlZFByb3BlcnRpZXM6IGFueVtdXG5cdFx0KSB7XG5cdFx0XHRfc2V0Q2FjaGVkUHJvcGVydGllcyhvVGFibGUsIGFTdWJGZXRjaGVkUHJvcGVydGllcywgYlVzZUFkZGl0aW9uYWxQcm9wZXJ0aWVzKTtcblx0XHRcdHJldHVybiBhU3ViRmV0Y2hlZFByb3BlcnRpZXM7XG5cdFx0fSk7XG5cdH0sXG5cblx0X3NldFRhYmxlTm9EYXRhVGV4dDogZnVuY3Rpb24gKG9UYWJsZTogYW55LCBvQmluZGluZ0luZm86IGFueSkge1xuXHRcdGxldCBzTm9EYXRhS2V5ID0gXCJcIjtcblx0XHRjb25zdCBvVGFibGVGaWx0ZXJJbmZvID0gVGFibGVVdGlscy5nZXRBbGxGaWx0ZXJJbmZvKG9UYWJsZSksXG5cdFx0XHRzdWZmaXhSZXNvdXJjZUtleSA9IG9CaW5kaW5nSW5mby5wYXRoLnN0YXJ0c1dpdGgoXCIvXCIpID8gb0JpbmRpbmdJbmZvLnBhdGguc3Vic3RyKDEpIDogb0JpbmRpbmdJbmZvLnBhdGg7XG5cblx0XHRjb25zdCBfZ2V0Tm9EYXRhVGV4dFdpdGhGaWx0ZXJzID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKG9UYWJsZS5kYXRhKFwiaGlkZGVuRmlsdGVyc1wiKSB8fCBvVGFibGUuZGF0YShcInF1aWNrRmlsdGVyS2V5XCIpKSB7XG5cdFx0XHRcdHJldHVybiBcIk1fVEFCTEVfQU5EX0NIQVJUX05PX0RBVEFfVEVYVF9NVUxUSV9WSUVXXCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gXCJUX1RBQkxFX0FORF9DSEFSVF9OT19EQVRBX1RFWFRfV0lUSF9GSUxURVJcIjtcblx0XHRcdH1cblx0XHR9O1xuXHRcdGNvbnN0IHNGaWx0ZXJBc3NvY2lhdGlvbiA9IG9UYWJsZS5nZXRGaWx0ZXIoKTtcblxuXHRcdGlmIChzRmlsdGVyQXNzb2NpYXRpb24gJiYgIS9CYXNpY1NlYXJjaCQvLnRlc3Qoc0ZpbHRlckFzc29jaWF0aW9uKSkge1xuXHRcdFx0Ly8gY2hlY2sgaWYgYSBGaWx0ZXJCYXIgaXMgYXNzb2NpYXRlZCB0byB0aGUgVGFibGUgKGJhc2ljIHNlYXJjaCBvbiB0b29sQmFyIGlzIGV4Y2x1ZGVkKVxuXHRcdFx0aWYgKG9UYWJsZUZpbHRlckluZm8uc2VhcmNoIHx8IChvVGFibGVGaWx0ZXJJbmZvLmZpbHRlcnMgJiYgb1RhYmxlRmlsdGVySW5mby5maWx0ZXJzLmxlbmd0aCkpIHtcblx0XHRcdFx0Ly8gY2hlY2sgaWYgdGFibGUgaGFzIGFueSBGaWx0ZXJiYXIgZmlsdGVycyBvciBwZXJzb25hbGl6YXRpb24gZmlsdGVyc1xuXHRcdFx0XHRzTm9EYXRhS2V5ID0gX2dldE5vRGF0YVRleHRXaXRoRmlsdGVycygpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c05vRGF0YUtleSA9IFwiVF9UQUJMRV9BTkRfQ0hBUlRfTk9fREFUQV9URVhUXCI7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChvVGFibGVGaWx0ZXJJbmZvLnNlYXJjaCB8fCAob1RhYmxlRmlsdGVySW5mby5maWx0ZXJzICYmIG9UYWJsZUZpbHRlckluZm8uZmlsdGVycy5sZW5ndGgpKSB7XG5cdFx0XHQvL2NoZWNrIGlmIHRhYmxlIGhhcyBhbnkgcGVyc29uYWxpemF0aW9uIGZpbHRlcnNcblx0XHRcdHNOb0RhdGFLZXkgPSBfZ2V0Tm9EYXRhVGV4dFdpdGhGaWx0ZXJzKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNOb0RhdGFLZXkgPSBcIk1fVEFCTEVfQU5EX0NIQVJUX05PX0ZJTFRFUlNfTk9fREFUQV9URVhUXCI7XG5cdFx0fVxuXHRcdHJldHVybiBvVGFibGVcblx0XHRcdC5nZXRNb2RlbChcInNhcC5mZS5pMThuXCIpXG5cdFx0XHQuZ2V0UmVzb3VyY2VCdW5kbGUoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9SZXNvdXJjZUJ1bmRsZTogYW55KSB7XG5cdFx0XHRcdG9UYWJsZS5zZXROb0RhdGEoQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoc05vRGF0YUtleSwgb1Jlc291cmNlQnVuZGxlLCBudWxsLCBzdWZmaXhSZXNvdXJjZUtleSkpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoZXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0sXG5cblx0aGFuZGxlVGFibGVEYXRhUmVjZWl2ZWQ6IGZ1bmN0aW9uIChvVGFibGU6IGFueSwgb0ludGVybmFsTW9kZWxDb250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBvQmluZGluZyA9IG9UYWJsZSAmJiBvVGFibGUuZ2V0Um93QmluZGluZygpLFxuXHRcdFx0YkRhdGFSZWNlaXZlZEF0dGFjaGVkID0gb0ludGVybmFsTW9kZWxDb250ZXh0ICYmIG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQcm9wZXJ0eShcImRhdGFSZWNlaXZlZEF0dGFjaGVkXCIpO1xuXG5cdFx0aWYgKG9JbnRlcm5hbE1vZGVsQ29udGV4dCAmJiAhYkRhdGFSZWNlaXZlZEF0dGFjaGVkKSB7XG5cdFx0XHRvQmluZGluZy5hdHRhY2hEYXRhUmVjZWl2ZWQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRUYWJsZUhlbHBlci5oYW5kbGVUYWJsZURlbGV0ZUVuYWJsZW1lbnRGb3JTaWRlRWZmZWN0cyhvVGFibGUsIG9JbnRlcm5hbE1vZGVsQ29udGV4dCk7XG5cdFx0XHRcdC8vIFJlZnJlc2ggdGhlIHNlbGVjdGVkIGNvbnRleHRzIHRvIHRyaWdnZXIgcmUtY2FsY3VsYXRpb24gb2YgZW5hYmxlZCBzdGF0ZSBvZiBhY3Rpb25zLlxuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzZWxlY3RlZENvbnRleHRzXCIsIFtdKTtcblx0XHRcdFx0Y29uc3QgYVNlbGVjdGVkQ29udGV4dHMgPSBvVGFibGUuZ2V0U2VsZWN0ZWRDb250ZXh0cygpO1xuXHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzZWxlY3RlZENvbnRleHRzXCIsIGFTZWxlY3RlZENvbnRleHRzKTtcblx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwibnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzXCIsIGFTZWxlY3RlZENvbnRleHRzLmxlbmd0aCk7XG5cdFx0XHRcdGNvbnN0IG9BY3Rpb25PcGVyYXRpb25BdmFpbGFibGVNYXAgPSBKU09OLnBhcnNlKFxuXHRcdFx0XHRcdENvbW1vbkhlbHBlci5wYXJzZUN1c3RvbURhdGEoRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcIm9wZXJhdGlvbkF2YWlsYWJsZU1hcFwiKSlcblx0XHRcdFx0KTtcblx0XHRcdFx0QWN0aW9uUnVudGltZS5zZXRBY3Rpb25FbmFibGVtZW50KG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgb0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZU1hcCwgYVNlbGVjdGVkQ29udGV4dHMsIFwidGFibGVcIik7XG5cdFx0XHRcdGNvbnN0IG9UYWJsZUFQSSA9IG9UYWJsZSA/IG9UYWJsZS5nZXRQYXJlbnQoKSA6IG51bGw7XG5cdFx0XHRcdGlmIChvVGFibGVBUEkpIHtcblx0XHRcdFx0XHRvVGFibGVBUEkuc2V0VXBFbXB0eVJvd3Mob1RhYmxlKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJkYXRhUmVjZWl2ZWRBdHRhY2hlZFwiLCB0cnVlKTtcblx0XHR9XG5cdH0sXG5cblx0cmViaW5kOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9CaW5kaW5nSW5mbzogYW55KTogUHJvbWlzZTxhbnk+IHtcblx0XHRjb25zdCBvVGFibGVBUEkgPSBvVGFibGUuZ2V0UGFyZW50KCkgYXMgVGFibGVBUEk7XG5cdFx0Y29uc3QgYklzU3VzcGVuZGVkID0gb1RhYmxlQVBJPy5nZXRQcm9wZXJ0eShcImJpbmRpbmdTdXNwZW5kZWRcIik7XG5cdFx0b1RhYmxlQVBJPy5zZXRQcm9wZXJ0eShcIm91dERhdGVkQmluZGluZ1wiLCBiSXNTdXNwZW5kZWQpO1xuXHRcdGlmICghYklzU3VzcGVuZGVkKSB7XG5cdFx0XHRUYWJsZVV0aWxzLmNsZWFyU2VsZWN0aW9uKG9UYWJsZSk7XG5cdFx0XHRUYWJsZURlbGVnYXRlQmFzZS5yZWJpbmQuYXBwbHkodGhpcywgW29UYWJsZSwgb0JpbmRpbmdJbmZvXSk7XG5cdFx0XHRUYWJsZVV0aWxzLm9uVGFibGVCb3VuZChvVGFibGUpO1xuXHRcdFx0dGhpcy5fc2V0VGFibGVOb0RhdGFUZXh0KG9UYWJsZSwgb0JpbmRpbmdJbmZvKTtcblx0XHRcdHJldHVybiBUYWJsZVV0aWxzLndoZW5Cb3VuZChvVGFibGUpXG5cdFx0XHRcdC50aGVuKHRoaXMuaGFuZGxlVGFibGVEYXRhUmVjZWl2ZWQob1RhYmxlLCBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSkpXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSB3YWl0aW5nIGZvciB0aGUgdGFibGUgdG8gYmUgYm91bmRcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fSxcblxuXHQvKipcblx0ICogRmV0Y2hlcyB0aGUgcmVsZXZhbnQgbWV0YWRhdGEgZm9yIHRoZSB0YWJsZSBhbmQgcmV0dXJucyBwcm9wZXJ0eSBpbmZvIGFycmF5LlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RhYmxlIEluc3RhbmNlIG9mIHRoZSBNREN0YWJsZVxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiBwcm9wZXJ0eSBpbmZvXG5cdCAqL1xuXHRmZXRjaFByb3BlcnRpZXM6IGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdHJldHVybiBEZWxlZ2F0ZVV0aWwuZmV0Y2hNb2RlbChvVGFibGUpLnRoZW4oKG9Nb2RlbDogYW55KSA9PiB7XG5cdFx0XHRpZiAoIW9Nb2RlbCkge1xuXHRcdFx0XHRyZXR1cm4gW107XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB0aGlzLl9nZXRDYWNoZWRPckZldGNoUHJvcGVydGllc0ZvckVudGl0eShcblx0XHRcdFx0b1RhYmxlLFxuXHRcdFx0XHREZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwiZW50aXR5VHlwZVwiKSxcblx0XHRcdFx0b01vZGVsLmdldE1ldGFNb2RlbCgpXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHR9LFxuXG5cdHByZUluaXQ6IGZ1bmN0aW9uIChvVGFibGU6IFRhYmxlKSB7XG5cdFx0cmV0dXJuIFRhYmxlRGVsZWdhdGVCYXNlLnByZUluaXQuYXBwbHkodGhpcywgW29UYWJsZV0pLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0LyoqXG5cdFx0XHQgKiBTZXQgdGhlIGJpbmRpbmcgY29udGV4dCB0byBudWxsIGZvciBldmVyeSBmYXN0IGNyZWF0aW9uIHJvdyB0byBhdm9pZCBpdCBpbmhlcml0aW5nXG5cdFx0XHQgKiB0aGUgd3JvbmcgY29udGV4dCBhbmQgcmVxdWVzdGluZyB0aGUgdGFibGUgY29sdW1ucyBvbiB0aGUgcGFyZW50IGVudGl0eVxuXHRcdFx0ICogU2V0IHRoZSBjb3JyZWN0IGJpbmRpbmcgY29udGV4dCBpbiBPYmplY3RQYWdlQ29udHJvbGxlci5lbmFibGVGYXN0Q3JlYXRpb25Sb3coKVxuXHRcdFx0ICovXG5cdFx0XHRjb25zdCBvRmFzdENyZWF0aW9uUm93ID0gb1RhYmxlLmdldENyZWF0aW9uUm93KCk7XG5cdFx0XHRpZiAob0Zhc3RDcmVhdGlvblJvdykge1xuXHRcdFx0XHRvRmFzdENyZWF0aW9uUm93LnNldEJpbmRpbmdDb250ZXh0KG51bGwgYXMgYW55IGFzIENvbnRleHQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHR1cGRhdGVCaW5kaW5nSW5mbzogZnVuY3Rpb24gKG9UYWJsZTogYW55LCBvQmluZGluZ0luZm86IGFueSkge1xuXHRcdFRhYmxlRGVsZWdhdGVCYXNlLnVwZGF0ZUJpbmRpbmdJbmZvLmFwcGx5KHRoaXMsIFtvVGFibGUsIG9CaW5kaW5nSW5mb10pO1xuXHRcdHRoaXMuX2ludGVybmFsVXBkYXRlQmluZGluZ0luZm8ob1RhYmxlLCBvQmluZGluZ0luZm8pO1xuXHRcdG9CaW5kaW5nSW5mby5ldmVudHMuZGF0YVJlY2VpdmVkID0gb1RhYmxlLmdldFBhcmVudCgpLm9uSW50ZXJuYWxEYXRhUmVjZWl2ZWQuYmluZChvVGFibGUuZ2V0UGFyZW50KCkpO1xuXHRcdG9CaW5kaW5nSW5mby5ldmVudHMuZGF0YVJlcXVlc3RlZCA9IG9UYWJsZS5nZXRQYXJlbnQoKS5vbkludGVybmFsRGF0YVJlcXVlc3RlZC5iaW5kKG9UYWJsZS5nZXRQYXJlbnQoKSk7XG5cdFx0dGhpcy5fc2V0VGFibGVOb0RhdGFUZXh0KG9UYWJsZSwgb0JpbmRpbmdJbmZvKTtcblx0fSxcblxuXHRfbWFuYWdlU2VtYW50aWNUYXJnZXRzOiBmdW5jdGlvbiAob01EQ1RhYmxlOiBhbnkpIHtcblx0XHRjb25zdCBvUm93QmluZGluZyA9IG9NRENUYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0aWYgKG9Sb3dCaW5kaW5nKSB7XG5cdFx0XHRvUm93QmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVxdWVzdGVkXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Y29uc3QgX29WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvTURDVGFibGUpO1xuXHRcdFx0XHRcdGlmIChfb1ZpZXcpIHtcblx0XHRcdFx0XHRcdFRhYmxlVXRpbHMuZ2V0U2VtYW50aWNUYXJnZXRzRnJvbVRhYmxlKF9vVmlldy5nZXRDb250cm9sbGVyKCksIG9NRENUYWJsZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LCAwKTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHR1cGRhdGVCaW5kaW5nOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIG9CaW5kaW5nSW5mbzogYW55LCBvQmluZGluZzogYW55KSB7XG5cdFx0Y29uc3Qgb1RhYmxlQVBJID0gb1RhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJO1xuXHRcdGNvbnN0IGJJc1N1c3BlbmRlZCA9IG9UYWJsZUFQST8uZ2V0UHJvcGVydHkoXCJiaW5kaW5nU3VzcGVuZGVkXCIpO1xuXHRcdGlmICghYklzU3VzcGVuZGVkKSB7XG5cdFx0XHRsZXQgYk5lZWRNYW51YWxSZWZyZXNoID0gZmFsc2U7XG5cdFx0XHRjb25zdCBfb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9UYWJsZSk7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCA9IG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdFx0Y29uc3Qgc01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5ID0gXCJwZW5kaW5nTWFudWFsQmluZGluZ1VwZGF0ZVwiO1xuXHRcdFx0Y29uc3QgYlBlbmRpbmdNYW51YWxVcGRhdGUgPSBvSW50ZXJuYWxCaW5kaW5nQ29udGV4dC5nZXRQcm9wZXJ0eShzTWFudWFsVXBkYXRlUHJvcGVydHlLZXkpO1xuXHRcdFx0Y29uc3Qgb1Jvd0JpbmRpbmcgPSBvVGFibGUuZ2V0Um93QmluZGluZygpO1xuXHRcdFx0aWYgKG9Sb3dCaW5kaW5nKSB7XG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBNYW51YWwgcmVmcmVzaCBpZiBmaWx0ZXJzIGFyZSBub3QgY2hhbmdlZCBieSBiaW5kaW5nLnJlZnJlc2goKSBzaW5jZSB1cGRhdGluZyB0aGUgYmluZGluZ0luZm9cblx0XHRcdFx0ICogaXMgbm90IGVub3VnaCB0byB0cmlnZ2VyIGEgYmF0Y2ggcmVxdWVzdC5cblx0XHRcdFx0ICogUmVtb3ZpbmcgY29sdW1ucyBjcmVhdGVzIG9uZSBiYXRjaCByZXF1ZXN0IHRoYXQgd2FzIG5vdCBleGVjdXRlZCBiZWZvcmVcblx0XHRcdFx0ICovXG5cdFx0XHRcdGNvbnN0IG9sZEZpbHRlcnMgPSBvUm93QmluZGluZy5nZXRGaWx0ZXJzKFwiQXBwbGljYXRpb25cIik7XG5cdFx0XHRcdGJOZWVkTWFudWFsUmVmcmVzaCA9XG5cdFx0XHRcdFx0ZGVlcEVxdWFsKG9CaW5kaW5nSW5mby5maWx0ZXJzLCBvbGRGaWx0ZXJzWzBdKSAmJlxuXHRcdFx0XHRcdG9Sb3dCaW5kaW5nLmdldFF1ZXJ5T3B0aW9uc0Zyb21QYXJhbWV0ZXJzKCkuJHNlYXJjaCA9PT0gb0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlYXJjaCAmJlxuXHRcdFx0XHRcdCFiUGVuZGluZ01hbnVhbFVwZGF0ZSAmJlxuXHRcdFx0XHRcdF9vVmlldyAmJlxuXHRcdFx0XHRcdF9vVmlldy5nZXRWaWV3RGF0YSgpLmNvbnZlcnRlclR5cGUgPT09IFwiTGlzdFJlcG9ydFwiO1xuXHRcdFx0fVxuXHRcdFx0VGFibGVEZWxlZ2F0ZUJhc2UudXBkYXRlQmluZGluZy5hcHBseSh0aGlzLCBbb1RhYmxlLCBvQmluZGluZ0luZm8sIG9CaW5kaW5nXSk7XG5cdFx0XHRvVGFibGUuZmlyZUV2ZW50KFwiYmluZGluZ1VwZGF0ZWRcIik7XG5cdFx0XHRpZiAoYk5lZWRNYW51YWxSZWZyZXNoICYmIG9UYWJsZS5nZXRGaWx0ZXIoKSAmJiBvQmluZGluZykge1xuXHRcdFx0XHRvUm93QmluZGluZ1xuXHRcdFx0XHRcdC5yZXF1ZXN0UmVmcmVzaChvUm93QmluZGluZy5nZXRHcm91cElkKCkpXG5cdFx0XHRcdFx0LmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0b0ludGVybmFsQmluZGluZ0NvbnRleHQuc2V0UHJvcGVydHkoc01hbnVhbFVwZGF0ZVByb3BlcnR5S2V5LCBmYWxzZSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZWZyZXNoaW5nIHRoZSB0YWJsZVwiLCBvRXJyb3IpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRvSW50ZXJuYWxCaW5kaW5nQ29udGV4dC5zZXRQcm9wZXJ0eShzTWFudWFsVXBkYXRlUHJvcGVydHlLZXksIHRydWUpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5fbWFuYWdlU2VtYW50aWNUYXJnZXRzKG9UYWJsZSk7XG5cdFx0fVxuXHRcdG9UYWJsZUFQST8uc2V0UHJvcGVydHkoXCJvdXREYXRlZEJpbmRpbmdcIiwgYklzU3VzcGVuZGVkKTtcblx0fSxcblxuXHRfY29tcHV0ZVJvd0JpbmRpbmdJbmZvRnJvbVRlbXBsYXRlOiBmdW5jdGlvbiAob1RhYmxlOiBhbnkpIHtcblx0XHQvLyBXZSBuZWVkIHRvIGRlZXBDbG9uZSB0aGUgaW5mbyB3ZSBnZXQgZnJvbSB0aGUgY3VzdG9tIGRhdGEsIG90aGVyd2lzZSBzb21lIG9mIGl0cyBzdWJvYmplY3RzIChlLmcuIHBhcmFtZXRlcnMpIHdpbGxcblx0XHQvLyBiZSBzaGFyZWQgd2l0aCBvQmluZGluZ0luZm8gYW5kIG1vZGlmaWVkIGxhdGVyIChPYmplY3QuYXNzaWduIG9ubHkgZG9lcyBhIHNoYWxsb3cgY2xvbmUpXG5cdFx0Y29uc3Qgcm93QmluZGluZ0luZm8gPSBkZWVwQ2xvbmUoRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcInJvd3NCaW5kaW5nSW5mb1wiKSk7XG5cdFx0Ly8gaWYgdGhlIHJvd0JpbmRpbmdJbmZvIGhhcyBhICQkZ2V0S2VlcEFsaXZlQ29udGV4dCBwYXJhbWV0ZXIgd2UgbmVlZCB0byBjaGVjayBpdCBpcyB0aGUgb25seSBUYWJsZSB3aXRoIHN1Y2ggYVxuXHRcdC8vIHBhcmFtZXRlciBmb3IgdGhlIGNvbGxlY3Rpb25NZXRhUGF0aFxuXHRcdGlmIChyb3dCaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiQkZ2V0S2VlcEFsaXZlQ29udGV4dCkge1xuXHRcdFx0Y29uc3QgY29sbGVjdGlvblBhdGggPSBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwidGFyZ2V0Q29sbGVjdGlvblBhdGhcIik7XG5cdFx0XHRjb25zdCBpbnRlcm5hbE1vZGVsID0gb1RhYmxlLmdldE1vZGVsKFwiaW50ZXJuYWxcIik7XG5cdFx0XHRjb25zdCBrZXB0QWxpdmVMaXN0cyA9IGludGVybmFsTW9kZWwuZ2V0T2JqZWN0KFwiL2tlcHRBbGl2ZUxpc3RzXCIpIHx8IHt9O1xuXHRcdFx0aWYgKCFrZXB0QWxpdmVMaXN0c1tjb2xsZWN0aW9uUGF0aF0pIHtcblx0XHRcdFx0a2VwdEFsaXZlTGlzdHNbY29sbGVjdGlvblBhdGhdID0gb1RhYmxlLmdldElkKCk7XG5cdFx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIva2VwdEFsaXZlTGlzdHNcIiwga2VwdEFsaXZlTGlzdHMpO1xuXHRcdFx0fSBlbHNlIGlmIChrZXB0QWxpdmVMaXN0c1tjb2xsZWN0aW9uUGF0aF0gIT09IG9UYWJsZS5nZXRJZCgpKSB7XG5cdFx0XHRcdGRlbGV0ZSByb3dCaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiQkZ2V0S2VlcEFsaXZlQ29udGV4dDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHJvd0JpbmRpbmdJbmZvO1xuXHR9LFxuXHRfaW50ZXJuYWxVcGRhdGVCaW5kaW5nSW5mbzogZnVuY3Rpb24gKG9UYWJsZTogYW55LCBvQmluZGluZ0luZm86IGFueSkge1xuXHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpO1xuXHRcdE9iamVjdC5hc3NpZ24ob0JpbmRpbmdJbmZvLCB0aGlzLl9jb21wdXRlUm93QmluZGluZ0luZm9Gcm9tVGVtcGxhdGUob1RhYmxlKSk7XG5cdFx0LyoqXG5cdFx0ICogQmluZGluZyBpbmZvIG1pZ2h0IGJlIHN1c3BlbmRlZCBhdCB0aGUgYmVnaW5uaW5nIHdoZW4gdGhlIGZpcnN0IGJpbmRSb3dzIGlzIGNhbGxlZDpcblx0XHQgKiBUbyBhdm9pZCBkdXBsaWNhdGUgcmVxdWVzdHMgYnV0IHN0aWxsIGhhdmUgYSBiaW5kaW5nIHRvIGNyZWF0ZSBuZXcgZW50cmllcy5cdFx0XHRcdCAqXG5cdFx0ICogQWZ0ZXIgdGhlIGluaXRpYWwgYmluZGluZyBzdGVwLCBmb2xsb3cgdXAgYmluZGluZ3Mgc2hvdWxkIG5vdCBsb25nZXIgYmUgc3VzcGVuZGVkLlxuXHRcdCAqL1xuXHRcdGlmIChvVGFibGUuZ2V0Um93QmluZGluZygpKSB7XG5cdFx0XHRvQmluZGluZ0luZm8uc3VzcGVuZGVkID0gZmFsc2U7XG5cdFx0fVxuXHRcdC8vIFRoZSBwcmV2aW91c2x5IGFkZGVkIGhhbmRsZXIgZm9yIHRoZSBldmVudCAnZGF0YVJlY2VpdmVkJyBpcyBub3QgYW55bW9yZSB0aGVyZVxuXHRcdC8vIHNpbmNlIHRoZSBiaW5kaW5nSW5mbyBpcyByZWNyZWF0ZWQgZnJvbSBzY3JhdGNoIHNvIHdlIG5lZWQgdG8gc2V0IHRoZSBmbGFnIHRvIGZhbHNlIGluIG9yZGVyXG5cdFx0Ly8gdG8gYWdhaW4gYWRkIHRoZSBoYW5kbGVyIG9uIHRoaXMgZXZlbnQgaWYgbmVlZGVkXG5cdFx0aWYgKG9JbnRlcm5hbE1vZGVsQ29udGV4dCkge1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LnNldFByb3BlcnR5KFwiZGF0YVJlY2VpdmVkQXR0YWNoZWRcIiwgZmFsc2UpO1xuXHRcdH1cblxuXHRcdGxldCBvRmlsdGVyO1xuXHRcdGNvbnN0IG9GaWx0ZXJJbmZvID0gVGFibGVVdGlscy5nZXRBbGxGaWx0ZXJJbmZvKG9UYWJsZSk7XG5cdFx0Ly8gUHJlcGFyZSBiaW5kaW5nIGluZm8gd2l0aCBmaWx0ZXIvc2VhcmNoIHBhcmFtZXRlcnNcblx0XHRpZiAob0ZpbHRlckluZm8uZmlsdGVycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRvRmlsdGVyID0gbmV3IEZpbHRlcih7IGZpbHRlcnM6IG9GaWx0ZXJJbmZvLmZpbHRlcnMsIGFuZDogdHJ1ZSB9KTtcblx0XHR9XG5cdFx0aWYgKG9GaWx0ZXJJbmZvLmJpbmRpbmdQYXRoKSB7XG5cdFx0XHRvQmluZGluZ0luZm8ucGF0aCA9IG9GaWx0ZXJJbmZvLmJpbmRpbmdQYXRoO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9EYXRhU3RhdGVJbmRpY2F0b3IgPSBvVGFibGUuZ2V0RGF0YVN0YXRlSW5kaWNhdG9yKCk7XG5cdFx0aWYgKG9EYXRhU3RhdGVJbmRpY2F0b3IgJiYgb0RhdGFTdGF0ZUluZGljYXRvci5pc0ZpbHRlcmluZygpKSB7XG5cdFx0XHQvLyBJbmNsdWRlIGZpbHRlcnMgb24gbWVzc2FnZVN0cmlwXG5cdFx0XHRpZiAob0JpbmRpbmdJbmZvLmZpbHRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRvRmlsdGVyID0gbmV3IEZpbHRlcih7IGZpbHRlcnM6IG9CaW5kaW5nSW5mby5maWx0ZXJzLmNvbmNhdChvRmlsdGVySW5mby5maWx0ZXJzKSwgYW5kOiB0cnVlIH0pO1xuXHRcdFx0XHRUYWJsZVV0aWxzLnVwZGF0ZUJpbmRpbmdJbmZvKG9CaW5kaW5nSW5mbywgb0ZpbHRlckluZm8sIG9GaWx0ZXIpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRUYWJsZVV0aWxzLnVwZGF0ZUJpbmRpbmdJbmZvKG9CaW5kaW5nSW5mbywgb0ZpbHRlckluZm8sIG9GaWx0ZXIpO1xuXHRcdH1cblx0fSxcblxuXHRfdGVtcGxhdGVDdXN0b21Db2x1bW5GcmFnbWVudDogZnVuY3Rpb24gKFxuXHRcdG9Db2x1bW5JbmZvOiBDdXN0b21FbGVtZW50PEN1c3RvbUJhc2VkVGFibGVDb2x1bW4+LFxuXHRcdG9WaWV3OiBhbnksXG5cdFx0b01vZGlmaWVyOiBhbnksXG5cdFx0c1RhYmxlSWQ6IGFueVxuXHQpIHtcblx0XHRjb25zdCBvQ29sdW1uTW9kZWwgPSBuZXcgSlNPTk1vZGVsKG9Db2x1bW5JbmZvKSxcblx0XHRcdG9UaGlzID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdGlkOiBzVGFibGVJZFxuXHRcdFx0fSksXG5cdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFwidGhpc1wiOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0XCJjb2x1bW5cIjogb0NvbHVtbk1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRcInRoaXNcIjogb1RoaXMsXG5cdFx0XHRcdFx0XCJjb2x1bW5cIjogb0NvbHVtbk1vZGVsXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KFxuXHRcdFx0XCJzYXAuZmUubWFjcm9zLnRhYmxlLkN1c3RvbUNvbHVtblwiLFxuXHRcdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzLFxuXHRcdFx0eyB2aWV3OiBvVmlldyB9LFxuXHRcdFx0b01vZGlmaWVyXG5cdFx0KS50aGVuKGZ1bmN0aW9uIChvSXRlbTogYW55KSB7XG5cdFx0XHRvQ29sdW1uTW9kZWwuZGVzdHJveSgpO1xuXHRcdFx0cmV0dXJuIG9JdGVtO1xuXHRcdH0pO1xuXHR9LFxuXG5cdF90ZW1wbGF0ZVNsb3RDb2x1bW5GcmFnbWVudDogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdG9Db2x1bW5JbmZvOiBDdXN0b21FbGVtZW50PEN1c3RvbUJhc2VkVGFibGVDb2x1bW4+LFxuXHRcdG9WaWV3OiBhbnksXG5cdFx0b01vZGlmaWVyOiBhbnksXG5cdFx0c1RhYmxlSWQ6IGFueVxuXHQpIHtcblx0XHRjb25zdCBvQ29sdW1uTW9kZWwgPSBuZXcgSlNPTk1vZGVsKG9Db2x1bW5JbmZvKSxcblx0XHRcdG9UaGlzID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdGlkOiBzVGFibGVJZFxuXHRcdFx0fSksXG5cdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFwidGhpc1wiOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0XCJjb2x1bW5cIjogb0NvbHVtbk1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRcInRoaXNcIjogb1RoaXMsXG5cdFx0XHRcdFx0XCJjb2x1bW5cIjogb0NvbHVtbk1vZGVsXG5cdFx0XHRcdH1cblx0XHRcdH07XG5cdFx0Y29uc3Qgc2xvdENvbHVtbnNYTUwgPSBhd2FpdCBEZWxlZ2F0ZVV0aWwudGVtcGxhdGVDb250cm9sRnJhZ21lbnQoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlNsb3RDb2x1bW5cIiwgb1ByZXByb2Nlc3NvclNldHRpbmdzLCB7XG5cdFx0XHRpc1hNTDogdHJ1ZVxuXHRcdH0pO1xuXHRcdGlmICghc2xvdENvbHVtbnNYTUwpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdFx0fVxuXHRcdGNvbnN0IHNsb3RYTUwgPSBzbG90Q29sdW1uc1hNTC5nZXRFbGVtZW50c0J5VGFnTmFtZShcInNsb3RcIilbMF0sXG5cdFx0XHRtZGNUYWJsZVRlbXBsYXRlWE1MID0gc2xvdENvbHVtbnNYTUwuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJtZGNUYWJsZTp0ZW1wbGF0ZVwiKVswXTtcblx0XHRtZGNUYWJsZVRlbXBsYXRlWE1MLnJlbW92ZUNoaWxkKHNsb3RYTUwpO1xuXHRcdGlmIChvQ29sdW1uSW5mby50ZW1wbGF0ZSkge1xuXHRcdFx0Y29uc3Qgb1RlbXBsYXRlID0gbmV3IERPTVBhcnNlcigpLnBhcnNlRnJvbVN0cmluZyhvQ29sdW1uSW5mby50ZW1wbGF0ZSwgXCJ0ZXh0L3htbFwiKTtcblx0XHRcdG1kY1RhYmxlVGVtcGxhdGVYTUwuYXBwZW5kQ2hpbGQob1RlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLmVycm9yKGBQbGVhc2UgcHJvdmlkZSBjb250ZW50IGluc2lkZSB0aGlzIEJ1aWxkaW5nIEJsb2NrIENvbHVtbjogJHtvQ29sdW1uSW5mby5oZWFkZXJ9YCk7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdH1cblx0XHRpZiAob01vZGlmaWVyLnRhcmdldHMgIT09IFwianNDb250cm9sVHJlZVwiKSB7XG5cdFx0XHRyZXR1cm4gc2xvdENvbHVtbnNYTUw7XG5cdFx0fVxuXHRcdHJldHVybiBGcmFnbWVudC5sb2FkKHtcblx0XHRcdHR5cGU6IFwiWE1MXCIsXG5cdFx0XHRkZWZpbml0aW9uOiBzbG90Q29sdW1uc1hNTFxuXHRcdH0pO1xuXHR9LFxuXG5cdF9nZXRFeHBvcnRGb3JtYXQ6IGZ1bmN0aW9uIChkYXRhVHlwZTogYW55KSB7XG5cdFx0c3dpdGNoIChkYXRhVHlwZSkge1xuXHRcdFx0Y2FzZSBcIkVkbS5EYXRlXCI6XG5cdFx0XHRcdHJldHVybiBFeGNlbEZvcm1hdC5nZXRFeGNlbERhdGVmcm9tSlNEYXRlKCk7XG5cdFx0XHRjYXNlIFwiRWRtLkRhdGVUaW1lT2Zmc2V0XCI6XG5cdFx0XHRcdHJldHVybiBFeGNlbEZvcm1hdC5nZXRFeGNlbERhdGVUaW1lZnJvbUpTRGF0ZVRpbWUoKTtcblx0XHRcdGNhc2UgXCJFZG0uVGltZU9mRGF5XCI6XG5cdFx0XHRcdHJldHVybiBFeGNlbEZvcm1hdC5nZXRFeGNlbFRpbWVmcm9tSlNUaW1lKCk7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fSxcblxuXHRfZ2V0VkhSZWxldmFudEZpZWxkczogZnVuY3Rpb24gKG9NZXRhTW9kZWw6IGFueSwgc01ldGFkYXRhUGF0aDogYW55LCBzQmluZGluZ1BhdGg/OiBhbnkpIHtcblx0XHRsZXQgYUZpZWxkczogYW55W10gPSBbXSxcblx0XHRcdG9EYXRhRmllbGREYXRhID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc01ldGFkYXRhUGF0aCk7XG5cblx0XHRpZiAob0RhdGFGaWVsZERhdGEuJGtpbmQgJiYgb0RhdGFGaWVsZERhdGEuJGtpbmQgPT09IFwiUHJvcGVydHlcIikge1xuXHRcdFx0b0RhdGFGaWVsZERhdGEgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YWRhdGFQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGREZWZhdWx0YCk7XG5cdFx0XHRzTWV0YWRhdGFQYXRoID0gYCR7c01ldGFkYXRhUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRGVmYXVsdGA7XG5cdFx0fVxuXHRcdHN3aXRjaCAob0RhdGFGaWVsZERhdGEuJFR5cGUpIHtcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCI6XG5cdFx0XHRcdGlmIChvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzTWV0YWRhdGFQYXRofS9UYXJnZXQvJEFubm90YXRpb25QYXRoYCkuaW5jbHVkZXMoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GaWVsZEdyb3VwXCIpKSB7XG5cdFx0XHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFkYXRhUGF0aH0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aC9EYXRhYCkuZm9yRWFjaCgob1ZhbHVlOiBhbnksIGlJbmRleDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRhRmllbGRzID0gYUZpZWxkcy5jb25jYXQoXG5cdFx0XHRcdFx0XHRcdHRoaXMuX2dldFZIUmVsZXZhbnRGaWVsZHMob01ldGFNb2RlbCwgYCR7c01ldGFkYXRhUGF0aH0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aC9EYXRhLyR7aUluZGV4fWApXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aFwiOlxuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhVcmxcIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI6XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEFjdGlvblwiOlxuXHRcdFx0XHRhRmllbGRzLnB1c2gob01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFkYXRhUGF0aH0vVmFsdWUvJFBhdGhgKSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiOlxuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiOlxuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdC8vIHByb3BlcnR5XG5cdFx0XHRcdC8vIHRlbXBvcmFyeSB3b3JrYXJvdW5kIHRvIG1ha2Ugc3VyZSBWSCByZWxldmFudCBmaWVsZCBwYXRoIGRvIG5vdCBjb250YWluIHRoZSBiaW5kaW5ncGF0aFxuXHRcdFx0XHRpZiAoc01ldGFkYXRhUGF0aC5pbmRleE9mKHNCaW5kaW5nUGF0aCkgPT09IDApIHtcblx0XHRcdFx0XHRhRmllbGRzLnB1c2goc01ldGFkYXRhUGF0aC5zdWJzdHJpbmcoc0JpbmRpbmdQYXRoLmxlbmd0aCArIDEpKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0XHRhRmllbGRzLnB1c2goQ29tbW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKHNNZXRhZGF0YVBhdGgsIHRydWUpKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdHJldHVybiBhRmllbGRzO1xuXHR9LFxuXHRfc2V0RHJhZnRJbmRpY2F0b3JPblZpc2libGVDb2x1bW46IGZ1bmN0aW9uIChvVGFibGU6IGFueSwgYUNvbHVtbnM6IGFueSwgb0NvbHVtbkluZm86IGFueSkge1xuXHRcdGNvbnN0IG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0ID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdFx0aWYgKCFvSW50ZXJuYWxCaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBzSW50ZXJuYWxQYXRoID0gb0ludGVybmFsQmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGFDb2x1bW5zV2l0aERyYWZ0SW5kaWNhdG9yID0gYUNvbHVtbnMuZmlsdGVyKChvQ29sdW1uOiBhbnkpID0+IHtcblx0XHRcdHJldHVybiB0aGlzLl9iQ29sdW1uSGFzUHJvcGVydHlXaXRoRHJhZnRJbmRpY2F0b3Iob0NvbHVtbik7XG5cdFx0fSk7XG5cdFx0Y29uc3QgYVZpc2libGVDb2x1bW5zID0gb1RhYmxlLmdldENvbHVtbnMoKTtcblx0XHRsZXQgc0FkZFZpc2libGVDb2x1bW5OYW1lLCBzVmlzaWJsZUNvbHVtbk5hbWUsIGJGb3VuZENvbHVtblZpc2libGVXaXRoRHJhZnQsIHNDb2x1bW5OYW1lV2l0aERyYWZ0SW5kaWNhdG9yO1xuXHRcdGZvciAoY29uc3QgaSBpbiBhVmlzaWJsZUNvbHVtbnMpIHtcblx0XHRcdHNWaXNpYmxlQ29sdW1uTmFtZSA9IGFWaXNpYmxlQ29sdW1uc1tpXS5nZXREYXRhUHJvcGVydHkoKTtcblx0XHRcdGZvciAoY29uc3QgaiBpbiBhQ29sdW1uc1dpdGhEcmFmdEluZGljYXRvcikge1xuXHRcdFx0XHRzQ29sdW1uTmFtZVdpdGhEcmFmdEluZGljYXRvciA9IGFDb2x1bW5zV2l0aERyYWZ0SW5kaWNhdG9yW2pdLm5hbWU7XG5cdFx0XHRcdGlmIChzVmlzaWJsZUNvbHVtbk5hbWUgPT09IHNDb2x1bW5OYW1lV2l0aERyYWZ0SW5kaWNhdG9yKSB7XG5cdFx0XHRcdFx0YkZvdW5kQ29sdW1uVmlzaWJsZVdpdGhEcmFmdCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9Db2x1bW5JbmZvICYmIG9Db2x1bW5JbmZvLm5hbWUgPT09IHNDb2x1bW5OYW1lV2l0aERyYWZ0SW5kaWNhdG9yKSB7XG5cdFx0XHRcdFx0c0FkZFZpc2libGVDb2x1bW5OYW1lID0gb0NvbHVtbkluZm8ubmFtZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGJGb3VuZENvbHVtblZpc2libGVXaXRoRHJhZnQpIHtcblx0XHRcdFx0b0ludGVybmFsQmluZGluZ0NvbnRleHQuc2V0UHJvcGVydHkoc0ludGVybmFsUGF0aCArIFNFTUFOVElDS0VZX0hBU19EUkFGVElORElDQVRPUiwgc1Zpc2libGVDb2x1bW5OYW1lKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghYkZvdW5kQ29sdW1uVmlzaWJsZVdpdGhEcmFmdCAmJiBzQWRkVmlzaWJsZUNvbHVtbk5hbWUpIHtcblx0XHRcdG9JbnRlcm5hbEJpbmRpbmdDb250ZXh0LnNldFByb3BlcnR5KHNJbnRlcm5hbFBhdGggKyBTRU1BTlRJQ0tFWV9IQVNfRFJBRlRJTkRJQ0FUT1IsIHNBZGRWaXNpYmxlQ29sdW1uTmFtZSk7XG5cdFx0fVxuXHR9LFxuXHRyZW1vdmVJdGVtOiBmdW5jdGlvbiAob1Byb3BlcnR5SW5mb05hbWU6IGFueSwgb1RhYmxlOiBhbnksIG1Qcm9wZXJ0eUJhZzogYW55KSB7XG5cdFx0bGV0IGRvUmVtb3ZlSXRlbSA9IHRydWU7XG5cdFx0Y29uc3Qgb01vZGlmaWVyID0gbVByb3BlcnR5QmFnLm1vZGlmaWVyO1xuXHRcdGNvbnN0IHNEYXRhUHJvcGVydHkgPSBvUHJvcGVydHlJbmZvTmFtZSAmJiBvTW9kaWZpZXIuZ2V0UHJvcGVydHkob1Byb3BlcnR5SW5mb05hbWUsIFwiZGF0YVByb3BlcnR5XCIpO1xuXHRcdGlmIChzRGF0YVByb3BlcnR5ICYmIHNEYXRhUHJvcGVydHkuaW5kZXhPZiAmJiBzRGF0YVByb3BlcnR5LmluZGV4T2YoXCJJbmxpbmVYTUxcIikgIT09IC0xKSB7XG5cdFx0XHRvTW9kaWZpZXIuaW5zZXJ0QWdncmVnYXRpb24ob1RhYmxlLCBcImRlcGVuZGVudHNcIiwgb1Byb3BlcnR5SW5mb05hbWUpO1xuXHRcdFx0ZG9SZW1vdmVJdGVtID0gZmFsc2U7XG5cdFx0fVxuXHRcdGlmIChvVGFibGUuaXNBICYmIG9Nb2RpZmllci50YXJnZXRzID09PSBcImpzQ29udHJvbFRyZWVcIikge1xuXHRcdFx0dGhpcy5fc2V0RHJhZnRJbmRpY2F0b3JTdGF0dXMob01vZGlmaWVyLCBvVGFibGUsIHRoaXMuZ2V0Q29sdW1uc0ZvcihvVGFibGUpKTtcblx0XHR9XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShkb1JlbW92ZUl0ZW0pO1xuXHR9LFxuXHRfZ2V0TWV0YU1vZGVsOiBmdW5jdGlvbiAobVByb3BlcnR5QmFnOiBhbnkpIHtcblx0XHRyZXR1cm4gbVByb3BlcnR5QmFnLmFwcENvbXBvbmVudCAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdH0sXG5cdF9zZXREcmFmdEluZGljYXRvclN0YXR1czogZnVuY3Rpb24gKG9Nb2RpZmllcjogYW55LCBvVGFibGU6IGFueSwgYUNvbHVtbnM6IGFueSwgb0NvbHVtbkluZm8/OiBhbnkpIHtcblx0XHRpZiAob01vZGlmaWVyLnRhcmdldHMgPT09IFwianNDb250cm9sVHJlZVwiKSB7XG5cdFx0XHR0aGlzLl9zZXREcmFmdEluZGljYXRvck9uVmlzaWJsZUNvbHVtbihvVGFibGUsIGFDb2x1bW5zLCBvQ29sdW1uSW5mbyk7XG5cdFx0fVxuXHR9LFxuXHRfZ2V0R3JvdXBJZDogZnVuY3Rpb24gKHNSZXRyaWV2ZWRHcm91cElkOiBhbnkpIHtcblx0XHRyZXR1cm4gc1JldHJpZXZlZEdyb3VwSWQgfHwgdW5kZWZpbmVkO1xuXHR9LFxuXHRfZ2V0RGVwZW5kZW50OiBmdW5jdGlvbiAob0RlcGVuZGVudDogYW55LCBzUHJvcGVydHlJbmZvTmFtZTogYW55LCBzRGF0YVByb3BlcnR5OiBhbnkpIHtcblx0XHRpZiAoc1Byb3BlcnR5SW5mb05hbWUgPT09IHNEYXRhUHJvcGVydHkpIHtcblx0XHRcdHJldHVybiBvRGVwZW5kZW50O1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXHRfZm5UZW1wbGF0ZVZhbHVlSGVscDogZnVuY3Rpb24gKGZuVGVtcGxhdGVWYWx1ZUhlbHA6IGFueSwgYlZhbHVlSGVscFJlcXVpcmVkOiBhbnksIGJWYWx1ZUhlbHBFeGlzdHM6IGFueSkge1xuXHRcdGlmIChiVmFsdWVIZWxwUmVxdWlyZWQgJiYgIWJWYWx1ZUhlbHBFeGlzdHMpIHtcblx0XHRcdHJldHVybiBmblRlbXBsYXRlVmFsdWVIZWxwKFwic2FwLmZlLm1hY3Jvcy50YWJsZS5WYWx1ZUhlbHBcIik7XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fSxcblx0X2dldERpc3BsYXlNb2RlOiBmdW5jdGlvbiAoYkRpc3BsYXlNb2RlOiBhbnkpIHtcblx0XHRsZXQgY29sdW1uRWRpdE1vZGU7XG5cdFx0aWYgKGJEaXNwbGF5TW9kZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRiRGlzcGxheU1vZGUgPSB0eXBlb2YgYkRpc3BsYXlNb2RlID09PSBcImJvb2xlYW5cIiA/IGJEaXNwbGF5TW9kZSA6IGJEaXNwbGF5TW9kZSA9PT0gXCJ0cnVlXCI7XG5cdFx0XHRjb2x1bW5FZGl0TW9kZSA9IGJEaXNwbGF5TW9kZSA/IFwiRGlzcGxheVwiIDogXCJFZGl0YWJsZVwiO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0ZGlzcGxheW1vZGU6IGJEaXNwbGF5TW9kZSxcblx0XHRcdFx0Y29sdW1uRWRpdE1vZGU6IGNvbHVtbkVkaXRNb2RlXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0ZGlzcGxheW1vZGU6IHVuZGVmaW5lZCxcblx0XHRcdGNvbHVtbkVkaXRNb2RlOiB1bmRlZmluZWRcblx0XHR9O1xuXHR9LFxuXHRfaW5zZXJ0QWdncmVnYXRpb246IGZ1bmN0aW9uIChvVmFsdWVIZWxwOiBhbnksIG9Nb2RpZmllcjogYW55LCBvVGFibGU6IGFueSkge1xuXHRcdGlmIChvVmFsdWVIZWxwKSB7XG5cdFx0XHRyZXR1cm4gb01vZGlmaWVyLmluc2VydEFnZ3JlZ2F0aW9uKG9UYWJsZSwgXCJkZXBlbmRlbnRzXCIsIG9WYWx1ZUhlbHAsIDApO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXHQvKipcblx0ICogSW52b2tlZCB3aGVuIGEgY29sdW1uIGlzIGFkZGVkIHVzaW5nIHRoZSB0YWJsZSBwZXJzb25hbGl6YXRpb24gZGlhbG9nLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1Byb3BlcnR5SW5mb05hbWUgTmFtZSBvZiB0aGUgcHJvcGVydHkgZm9yIHdoaWNoIHRoZSBjb2x1bW4gaXMgYWRkZWRcblx0ICogQHBhcmFtIG9UYWJsZSBJbnN0YW5jZSBvZiB0YWJsZSBjb250cm9sXG5cdCAqIEBwYXJhbSBtUHJvcGVydHlCYWcgSW5zdGFuY2Ugb2YgcHJvcGVydHkgYmFnIGZyb20gdGhlIGZsZXhpYmlsaXR5IEFQSVxuXHQgKiBAcmV0dXJucyBPbmNlIHJlc29sdmVkLCBhIHRhYmxlIGNvbHVtbiBkZWZpbml0aW9uIGlzIHJldHVybmVkXG5cdCAqL1xuXHRhZGRJdGVtOiBhc3luYyBmdW5jdGlvbiAoc1Byb3BlcnR5SW5mb05hbWU6IHN0cmluZywgb1RhYmxlOiBhbnksIG1Qcm9wZXJ0eUJhZzogYW55KSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IHRoaXMuX2dldE1ldGFNb2RlbChtUHJvcGVydHlCYWcpLFxuXHRcdFx0b01vZGlmaWVyID0gbVByb3BlcnR5QmFnLm1vZGlmaWVyLFxuXHRcdFx0c1RhYmxlSWQgPSBvTW9kaWZpZXIuZ2V0SWQob1RhYmxlKSxcblx0XHRcdGFDb2x1bW5zID0gb1RhYmxlLmlzQSA/IHRoaXMuZ2V0Q29sdW1uc0ZvcihvVGFibGUpIDogbnVsbDtcblx0XHRpZiAoIWFDb2x1bW5zKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9Db2x1bW5JbmZvID0gYUNvbHVtbnMuZmluZChmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRyZXR1cm4gb0NvbHVtbi5uYW1lID09PSBzUHJvcGVydHlJbmZvTmFtZTtcblx0XHR9KTtcblx0XHRpZiAoIW9Db2x1bW5JbmZvKSB7XG5cdFx0XHRMb2cuZXJyb3IoYCR7c1Byb3BlcnR5SW5mb05hbWV9IG5vdCBmb3VuZCB3aGlsZSBhZGRpbmcgY29sdW1uYCk7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdH1cblx0XHR0aGlzLl9zZXREcmFmdEluZGljYXRvclN0YXR1cyhvTW9kaWZpZXIsIG9UYWJsZSwgYUNvbHVtbnMsIG9Db2x1bW5JbmZvKTtcblx0XHQvLyByZW5kZXIgY3VzdG9tIGNvbHVtblxuXHRcdGlmIChvQ29sdW1uSW5mby50eXBlID09PSBcIkRlZmF1bHRcIikge1xuXHRcdFx0cmV0dXJuIHRoaXMuX3RlbXBsYXRlQ3VzdG9tQ29sdW1uRnJhZ21lbnQob0NvbHVtbkluZm8sIG1Qcm9wZXJ0eUJhZy52aWV3LCBvTW9kaWZpZXIsIHNUYWJsZUlkKTtcblx0XHR9XG5cblx0XHRpZiAob0NvbHVtbkluZm8udHlwZSA9PT0gXCJTbG90XCIpIHtcblx0XHRcdHJldHVybiB0aGlzLl90ZW1wbGF0ZVNsb3RDb2x1bW5GcmFnbWVudChvQ29sdW1uSW5mbywgbVByb3BlcnR5QmFnLnZpZXcsIG9Nb2RpZmllciwgc1RhYmxlSWQpO1xuXHRcdH1cblx0XHQvLyBmYWxsLWJhY2tcblx0XHRpZiAoIW9NZXRhTW9kZWwpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc1BhdGg6IHN0cmluZyA9IGF3YWl0IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJtZXRhUGF0aFwiLCBvTW9kaWZpZXIpO1xuXHRcdGNvbnN0IHNFbnRpdHlUeXBlUGF0aDogc3RyaW5nID0gYXdhaXQgRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcImVudGl0eVR5cGVcIiwgb01vZGlmaWVyKTtcblx0XHRjb25zdCBzUmV0cmlldmVkR3JvdXBJZCA9IGF3YWl0IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJyZXF1ZXN0R3JvdXBJZFwiLCBvTW9kaWZpZXIpO1xuXHRcdGNvbnN0IHNHcm91cElkOiBzdHJpbmcgPSB0aGlzLl9nZXRHcm91cElkKHNSZXRyaWV2ZWRHcm91cElkKTtcblx0XHRjb25zdCBvVGFibGVDb250ZXh0OiBDb250ZXh0ID0gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzUGF0aCk7XG5cdFx0Y29uc3QgYUZldGNoZWRQcm9wZXJ0aWVzID0gYXdhaXQgdGhpcy5fZ2V0Q2FjaGVkT3JGZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkoXG5cdFx0XHRvVGFibGUsXG5cdFx0XHRzRW50aXR5VHlwZVBhdGgsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0bVByb3BlcnR5QmFnLmFwcENvbXBvbmVudFxuXHRcdCk7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5SW5mbyA9IGFGZXRjaGVkUHJvcGVydGllcy5maW5kKGZ1bmN0aW9uIChvSW5mbzogYW55KSB7XG5cdFx0XHRyZXR1cm4gb0luZm8ubmFtZSA9PT0gc1Byb3BlcnR5SW5mb05hbWU7XG5cdFx0fSk7XG5cblx0XHRjb25zdCBvUHJvcGVydHlDb250ZXh0OiBDb250ZXh0ID0gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChvUHJvcGVydHlJbmZvLm1ldGFkYXRhUGF0aCk7XG5cdFx0Y29uc3QgYVZIUHJvcGVydGllcyA9IHRoaXMuX2dldFZIUmVsZXZhbnRGaWVsZHMob01ldGFNb2RlbCwgb1Byb3BlcnR5SW5mby5tZXRhZGF0YVBhdGgsIHNQYXRoKTtcblx0XHRjb25zdCBvUGFyYW1ldGVycyA9IHtcblx0XHRcdHNCaW5kaW5nUGF0aDogc1BhdGgsXG5cdFx0XHRzVmFsdWVIZWxwVHlwZTogXCJUYWJsZVZhbHVlSGVscFwiLFxuXHRcdFx0b0NvbnRyb2w6IG9UYWJsZSxcblx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRvTW9kaWZpZXIsXG5cdFx0XHRvUHJvcGVydHlJbmZvXG5cdFx0fTtcblxuXHRcdGNvbnN0IGZuVGVtcGxhdGVWYWx1ZUhlbHAgPSBhc3luYyAoc0ZyYWdtZW50TmFtZTogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0XHRcdGlkOiBzVGFibGVJZCxcblx0XHRcdFx0XHRyZXF1ZXN0R3JvdXBJZDogc0dyb3VwSWRcblx0XHRcdFx0fSksXG5cdFx0XHRcdG9QcmVwcm9jZXNzb3JTZXR0aW5ncyA9IHtcblx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcdFwidGhpc1wiOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0XHRcImRhdGFGaWVsZFwiOiBvUHJvcGVydHlDb250ZXh0XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRcdFwidGhpc1wiOiBvVGhpcyxcblx0XHRcdFx0XHRcdFwiZGF0YUZpZWxkXCI6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IG9NZXRhTW9kZWxcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cblx0XHRcdHRyeSB7XG5cdFx0XHRcdGNvbnN0IG9WYWx1ZUhlbHAgPSBhd2FpdCBEZWxlZ2F0ZVV0aWwudGVtcGxhdGVDb250cm9sRnJhZ21lbnQoc0ZyYWdtZW50TmFtZSwgb1ByZXByb2Nlc3NvclNldHRpbmdzLCB7fSwgb01vZGlmaWVyKTtcblx0XHRcdFx0cmV0dXJuIGF3YWl0IHRoaXMuX2luc2VydEFnZ3JlZ2F0aW9uKG9WYWx1ZUhlbHAsIG9Nb2RpZmllciwgb1RhYmxlKTtcblx0XHRcdH0gY2F0Y2ggKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdC8vV2UgYWx3YXlzIHJlc29sdmUgdGhlIHByb21pc2UgdG8gZW5zdXJlIHRoYXQgdGhlIGFwcCBkb2VzIG5vdCBjcmFzaFxuXHRcdFx0XHRMb2cuZXJyb3IoYFZhbHVlSGVscCBub3QgbG9hZGVkIDogJHtvRXJyb3IubWVzc2FnZX1gKTtcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRvVGhpcy5kZXN0cm95KCk7XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGNvbnN0IGZuVGVtcGxhdGVGcmFnbWVudCA9IChvSW5Qcm9wZXJ0eUluZm86IGFueSwgb1ZpZXc6IGFueSkgPT4ge1xuXHRcdFx0Y29uc3Qgc0ZyYWdtZW50TmFtZSA9IFwic2FwLmZlLm1hY3Jvcy50YWJsZS5Db2x1bW5cIjtcblxuXHRcdFx0bGV0IGJEaXNwbGF5TW9kZTtcblx0XHRcdGxldCBzVGFibGVUeXBlQ3VzdG9tRGF0YTtcblx0XHRcdGxldCBzT25DaGFuZ2VDdXN0b21EYXRhO1xuXHRcdFx0bGV0IHNDcmVhdGlvbk1vZGVDdXN0b21EYXRhO1xuXG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoW1xuXHRcdFx0XHREZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwiZGlzcGxheU1vZGVQcm9wZXJ0eUJpbmRpbmdcIiwgb01vZGlmaWVyKSxcblx0XHRcdFx0RGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcInRhYmxlVHlwZVwiLCBvTW9kaWZpZXIpLFxuXHRcdFx0XHREZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvVGFibGUsIFwib25DaGFuZ2VcIiwgb01vZGlmaWVyKSxcblx0XHRcdFx0RGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcImNyZWF0aW9uTW9kZVwiLCBvTW9kaWZpZXIpXG5cdFx0XHRdKS50aGVuKChhQ3VzdG9tRGF0YTogYW55W10pID0+IHtcblx0XHRcdFx0YkRpc3BsYXlNb2RlID0gYUN1c3RvbURhdGFbMF07XG5cdFx0XHRcdHNUYWJsZVR5cGVDdXN0b21EYXRhID0gYUN1c3RvbURhdGFbMV07XG5cdFx0XHRcdHNPbkNoYW5nZUN1c3RvbURhdGEgPSBhQ3VzdG9tRGF0YVsyXTtcblx0XHRcdFx0c0NyZWF0aW9uTW9kZUN1c3RvbURhdGEgPSBhQ3VzdG9tRGF0YVszXTtcblx0XHRcdFx0Ly8gUmVhZCBPbmx5IGFuZCBDb2x1bW4gRWRpdCBNb2RlIGNhbiBib3RoIGhhdmUgdGhyZWUgc3RhdGVcblx0XHRcdFx0Ly8gVW5kZWZpbmVkIG1lYW5zIHRoYXQgdGhlIGZyYW1ld29yayBkZWNpZGVzIHdoYXQgdG8gZG9cblx0XHRcdFx0Ly8gVHJ1ZSAvIERpc3BsYXkgbWVhbnMgYWx3YXlzIHJlYWQgb25seVxuXHRcdFx0XHQvLyBGYWxzZSAvIEVkaXRhYmxlIG1lYW5zIGVkaXRhYmxlIGJ1dCB3aGlsZSBzdGlsbCByZXNwZWN0aW5nIHRoZSBsb3cgbGV2ZWwgcHJpbmNpcGxlIChpbW11dGFibGUgcHJvcGVydHkgd2lsbCBub3QgYmUgZWRpdGFibGUpXG5cdFx0XHRcdGNvbnN0IG9EaXNwbGF5TW9kZXMgPSB0aGlzLl9nZXREaXNwbGF5TW9kZShiRGlzcGxheU1vZGUpO1xuXHRcdFx0XHRiRGlzcGxheU1vZGUgPSBvRGlzcGxheU1vZGVzLmRpc3BsYXltb2RlO1xuXHRcdFx0XHRjb25zdCBjb2x1bW5FZGl0TW9kZSA9IG9EaXNwbGF5TW9kZXMuY29sdW1uRWRpdE1vZGU7XG5cblx0XHRcdFx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdFx0XHRcdHJlYWRPbmx5OiBiRGlzcGxheU1vZGUsXG5cdFx0XHRcdFx0XHRjb2x1bW5FZGl0TW9kZTogY29sdW1uRWRpdE1vZGUsXG5cdFx0XHRcdFx0XHR0YWJsZVR5cGU6IHNUYWJsZVR5cGVDdXN0b21EYXRhLFxuXHRcdFx0XHRcdFx0b25DaGFuZ2U6IHNPbkNoYW5nZUN1c3RvbURhdGEsXG5cdFx0XHRcdFx0XHRpZDogc1RhYmxlSWQsXG5cdFx0XHRcdFx0XHRuYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBzUHJvcGVydHlJbmZvTmFtZSxcblx0XHRcdFx0XHRcdGNvbHVtbkluZm86IG9Db2x1bW5JbmZvLFxuXHRcdFx0XHRcdFx0Y29sbGVjdGlvbjoge1xuXHRcdFx0XHRcdFx0XHRzUGF0aDogc1BhdGgsXG5cdFx0XHRcdFx0XHRcdG9Nb2RlbDogb01ldGFNb2RlbFxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdGNyZWF0aW9uTW9kZTogc0NyZWF0aW9uTW9kZUN1c3RvbURhdGFcblx0XHRcdFx0XHR9KSxcblx0XHRcdFx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSB7XG5cdFx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcdFx0XCJlbnRpdHlTZXRcIjogb1RhYmxlQ29udGV4dCxcblx0XHRcdFx0XHRcdFx0XCJjb2xsZWN0aW9uXCI6IG9UYWJsZUNvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFwiZGF0YUZpZWxkXCI6IG9Qcm9wZXJ0eUNvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFwidGhpc1wiOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0XHRcdFwiY29sdW1uXCI6IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL2NvbHVtbkluZm9cIilcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRcdFx0XCJ0aGlzXCI6IG9UaGlzLFxuXHRcdFx0XHRcdFx0XHRcImVudGl0eVNldFwiOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRcImNvbGxlY3Rpb25cIjogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0XCJkYXRhRmllbGRcIjogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0bWV0YU1vZGVsOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRcImNvbHVtblwiOiBvVGhpc1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH07XG5cblx0XHRcdFx0cmV0dXJuIERlbGVnYXRlVXRpbC50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChzRnJhZ21lbnROYW1lLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIHsgdmlldzogb1ZpZXcgfSwgb01vZGlmaWVyKS5maW5hbGx5KFxuXHRcdFx0XHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG9UaGlzLmRlc3Ryb3koKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdCk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXG5cdFx0YXdhaXQgUHJvbWlzZS5hbGwoXG5cdFx0XHRhVkhQcm9wZXJ0aWVzLm1hcChhc3luYyAoc1Byb3BlcnR5TmFtZTogYW55KSA9PiB7XG5cdFx0XHRcdGNvbnN0IG1QYXJhbWV0ZXJzID0gT2JqZWN0LmFzc2lnbih7fSwgb1BhcmFtZXRlcnMsIHsgc1Byb3BlcnR5TmFtZTogc1Byb3BlcnR5TmFtZSB9KTtcblxuXHRcdFx0XHRjb25zdCBhUmVzdWx0cyA9IGF3YWl0IFByb21pc2UuYWxsKFtcblx0XHRcdFx0XHREZWxlZ2F0ZVV0aWwuaXNWYWx1ZUhlbHBSZXF1aXJlZChtUGFyYW1ldGVycyksXG5cdFx0XHRcdFx0RGVsZWdhdGVVdGlsLmRvZXNWYWx1ZUhlbHBFeGlzdChtUGFyYW1ldGVycylcblx0XHRcdFx0XSk7XG5cblx0XHRcdFx0Y29uc3QgYlZhbHVlSGVscFJlcXVpcmVkID0gYVJlc3VsdHNbMF0sXG5cdFx0XHRcdFx0YlZhbHVlSGVscEV4aXN0cyA9IGFSZXN1bHRzWzFdO1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fZm5UZW1wbGF0ZVZhbHVlSGVscChmblRlbXBsYXRlVmFsdWVIZWxwLCBiVmFsdWVIZWxwUmVxdWlyZWQsIGJWYWx1ZUhlbHBFeGlzdHMpO1xuXHRcdFx0fSlcblx0XHQpO1xuXHRcdC8vIElmIHZpZXcgaXMgbm90IHByb3ZpZGVkIHRyeSB0byBnZXQgaXQgYnkgYWNjZXNzaW5nIHRvIHRoZSBwYXJlbnRhbCBoaWVyYXJjaHlcblx0XHQvLyBJZiBpdCBkb2Vzbid0IHdvcmsgKHRhYmxlIGludG8gYW4gdW5hdHRhY2hlZCBPUCBzZWN0aW9uKSBnZXQgdGhlIHZpZXcgdmlhIHRoZSBBcHBDb21wb25lbnRcblx0XHRjb25zdCB2aWV3ID1cblx0XHRcdG1Qcm9wZXJ0eUJhZy52aWV3IHx8XG5cdFx0XHRDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KG9UYWJsZSkgfHxcblx0XHRcdChtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50ID8gQ29tbW9uVXRpbHMuZ2V0Q3VycmVudFBhZ2VWaWV3KG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQpIDogdW5kZWZpbmVkKTtcblx0XHRyZXR1cm4gZm5UZW1wbGF0ZUZyYWdtZW50KG9Qcm9wZXJ0eUluZm8sIHZpZXcpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBQcm92aWRlIHRoZSBUYWJsZSdzIGZpbHRlciBkZWxlZ2F0ZSB0byBwcm92aWRlIGJhc2ljIGZpbHRlciBmdW5jdGlvbmFsaXR5IHN1Y2ggYXMgYWRkaW5nIEZpbHRlckZpZWxkcy5cblx0ICpcblx0ICogQHJldHVybnMgT2JqZWN0IGZvciB0aGUgVGFibGVzIGZpbHRlciBwZXJzb25hbGl6YXRpb24uXG5cdCAqL1xuXHRnZXRGaWx0ZXJEZWxlZ2F0ZTogZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBGaWx0ZXJCYXJEZWxlZ2F0ZSwge1xuXHRcdFx0YWRkSXRlbTogZnVuY3Rpb24gKHNQcm9wZXJ0eUluZm9OYW1lOiBhbnksIG9QYXJlbnRDb250cm9sOiBhbnkpIHtcblx0XHRcdFx0aWYgKHNQcm9wZXJ0eUluZm9OYW1lLmluZGV4T2YoXCJQcm9wZXJ0eTo6XCIpID09PSAwKSB7XG5cdFx0XHRcdFx0Ly8gQ29ycmVjdCB0aGUgbmFtZSBvZiBjb21wbGV4IHByb3BlcnR5IGluZm8gcmVmZXJlbmNlcy5cblx0XHRcdFx0XHRzUHJvcGVydHlJbmZvTmFtZSA9IHNQcm9wZXJ0eUluZm9OYW1lLnJlcGxhY2UoXCJQcm9wZXJ0eTo6XCIsIFwiXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBGaWx0ZXJCYXJEZWxlZ2F0ZS5hZGRJdGVtKHNQcm9wZXJ0eUluZm9OYW1lLCBvUGFyZW50Q29udHJvbCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIFR5cGVVdGlsIGF0dGFjaGVkIHRvIHRoaXMgZGVsZWdhdGUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEFueSBpbnN0YW5jZSBvZiBUeXBlVXRpbFxuXHQgKi9cblx0Z2V0VHlwZVV0aWw6IGZ1bmN0aW9uICgvKm9QYXlsb2FkOiBvYmplY3QqLykge1xuXHRcdHJldHVybiBUeXBlVXRpbDtcblx0fSxcblxuXHRmb3JtYXRHcm91cEhlYWRlcihvVGFibGU6IGFueSwgb0NvbnRleHQ6IGFueSwgc1Byb3BlcnR5OiBhbnkpIHtcblx0XHRjb25zdCBtRm9ybWF0SW5mb3MgPSBfZ2V0Q2FjaGVkUHJvcGVydGllcyhvVGFibGUsIG51bGwpLFxuXHRcdFx0b0Zvcm1hdEluZm8gPVxuXHRcdFx0XHRtRm9ybWF0SW5mb3MgJiZcblx0XHRcdFx0bUZvcm1hdEluZm9zLmZpbHRlcigob2JqOiBhbnkpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gb2JqLm5hbWUgPT09IHNQcm9wZXJ0eTtcblx0XHRcdFx0fSlbMF0sXG5cdFx0XHQvKkZvciBhIERhdGUgb3IgRGF0ZVRpbWUgcHJvcGVydHksIHRoZSB2YWx1ZSBpcyByZXR1cm5lZCBpbiBleHRlcm5hbCBmb3JtYXQgdXNpbmcgYSBVSTUgdHlwZSBmb3IgdGhlXG5cdCAgICAgICAgZ2l2ZW4gcHJvcGVydHkgcGF0aCB0aGF0IGZvcm1hdHMgY29ycmVzcG9uZGluZyB0byB0aGUgcHJvcGVydHkncyBFRE0gdHlwZSBhbmQgY29uc3RyYWludHMqL1xuXHRcdFx0YkV4dGVybmFsRm9ybWF0ID0gb0Zvcm1hdEluZm8/LnR5cGVDb25maWc/LmJhc2VUeXBlID09PSBcIkRhdGVUaW1lXCIgfHwgb0Zvcm1hdEluZm8/LnR5cGVDb25maWc/LmJhc2VUeXBlID09PSBcIkRhdGVcIjtcblx0XHRsZXQgc1ZhbHVlO1xuXHRcdGlmIChvRm9ybWF0SW5mbyAmJiBvRm9ybWF0SW5mby5tb2RlKSB7XG5cdFx0XHRzd2l0Y2ggKG9Gb3JtYXRJbmZvLm1vZGUpIHtcblx0XHRcdFx0Y2FzZSBcIkRlc2NyaXB0aW9uXCI6XG5cdFx0XHRcdFx0c1ZhbHVlID0gb0NvbnRleHQuZ2V0UHJvcGVydHkob0Zvcm1hdEluZm8uZGVzY3JpcHRpb25Qcm9wZXJ0eSwgYkV4dGVybmFsRm9ybWF0KTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25WYWx1ZVwiOlxuXHRcdFx0XHRcdHNWYWx1ZSA9IFZhbHVlRm9ybWF0dGVyLmZvcm1hdFdpdGhCcmFja2V0cyhcblx0XHRcdFx0XHRcdG9Db250ZXh0LmdldFByb3BlcnR5KG9Gb3JtYXRJbmZvLmRlc2NyaXB0aW9uUHJvcGVydHksIGJFeHRlcm5hbEZvcm1hdCksXG5cdFx0XHRcdFx0XHRvQ29udGV4dC5nZXRQcm9wZXJ0eShvRm9ybWF0SW5mby52YWx1ZVByb3BlcnR5LCBiRXh0ZXJuYWxGb3JtYXQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRjYXNlIFwiVmFsdWVEZXNjcmlwdGlvblwiOlxuXHRcdFx0XHRcdHNWYWx1ZSA9IFZhbHVlRm9ybWF0dGVyLmZvcm1hdFdpdGhCcmFja2V0cyhcblx0XHRcdFx0XHRcdG9Db250ZXh0LmdldFByb3BlcnR5KG9Gb3JtYXRJbmZvLnZhbHVlUHJvcGVydHksIGJFeHRlcm5hbEZvcm1hdCksXG5cdFx0XHRcdFx0XHRvQ29udGV4dC5nZXRQcm9wZXJ0eShvRm9ybWF0SW5mby5kZXNjcmlwdGlvblByb3BlcnR5LCBiRXh0ZXJuYWxGb3JtYXQpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0c1ZhbHVlID0gb0NvbnRleHQuZ2V0UHJvcGVydHkob0Zvcm1hdEluZm8ucGF0aCwgYkV4dGVybmFsRm9ybWF0KTtcblx0XHR9XG5cdFx0cmV0dXJuIFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIk1fVEFCTEVfR1JPVVBfSEVBREVSX1RJVExFXCIsIFtvRm9ybWF0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