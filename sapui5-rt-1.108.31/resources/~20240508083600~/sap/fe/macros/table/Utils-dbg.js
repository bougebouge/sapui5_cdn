/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/SelectionVariantHelper", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/DelegateUtil", "sap/fe/macros/field/FieldRuntime", "sap/fe/macros/filter/FilterUtils", "sap/ui/core/Component", "sap/ui/core/format/NumberFormat", "sap/ui/model/Filter"], function (Log, CommonUtils, SelectionVariantHelper, MetaModelConverter, BindingToolkit, DelegateUtil, FieldRuntime, FilterUtils, Component, NumberFormat, Filter) {
  "use strict";

  var pathInModel = BindingToolkit.pathInModel;
  var compileExpression = BindingToolkit.compileExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getRangeDefinition = SelectionVariantHelper.getRangeDefinition;
  /**
   * Get filter information for a SelectionVariant annotation.
   *
   * @param oTable The table instance
   * @param sSvPath Relative SelectionVariant annotation path
   * @returns Information on filters
   *  filters: array of sap.ui.model.filters
   * text: selection Variant text property
   * @private
   * @ui5-restricted
   */
  function getFiltersInfoForSV(oTable, sSvPath) {
    var metaModel = CommonUtils.getAppComponent(oTable).getMetaModel();
    var svContext = metaModel.getMetaContext("".concat(oTable.data("entityType")).concat(sSvPath)),
      oSelectionVariant = getInvolvedDataModelObjects(svContext).targetObject,
      mPropertyFilters = {},
      aFilters = [],
      aPaths = [];
    var sText = "";
    if (oSelectionVariant) {
      sText = oSelectionVariant.Text;
      (oSelectionVariant.SelectOptions || []).forEach(function (oSelectOption) {
        var _oSelectOption$Proper, _oSelectOption$Ranges;
        if ((_oSelectOption$Proper = oSelectOption.PropertyName) !== null && _oSelectOption$Proper !== void 0 && _oSelectOption$Proper.$target && ((_oSelectOption$Ranges = oSelectOption.Ranges) === null || _oSelectOption$Ranges === void 0 ? void 0 : _oSelectOption$Ranges.length) > 0) {
          var propertyType = oSelectOption.PropertyName.$target.type;
          var sPath = oSelectOption.PropertyName.value;
          if (!aPaths.includes(sPath)) {
            aPaths.push(sPath);
          }
          for (var j in oSelectOption.Ranges) {
            var range = getRangeDefinition(oSelectOption.Ranges[j], propertyType);
            mPropertyFilters[sPath] = (mPropertyFilters[sPath] || []).concat(new Filter(sPath, range.operator, range.rangeLow, range.rangeHigh));
          }
        }
      });
      for (var sPropertyPath in mPropertyFilters) {
        aFilters.push(new Filter({
          filters: mPropertyFilters[sPropertyPath],
          and: false
        }));
      }
    }
    return {
      properties: aPaths,
      filters: aFilters,
      text: sText
    };
  }
  function getHiddenFilters(oTable) {
    var aFilters = [];
    var hiddenFilters = oTable.data("hiddenFilters");
    if (hiddenFilters && Array.isArray(hiddenFilters.paths)) {
      hiddenFilters.paths.forEach(function (mPath) {
        var oSvFilter = getFiltersInfoForSV(oTable, mPath.annotationPath);
        aFilters = aFilters.concat(oSvFilter.filters);
      });
    }
    return aFilters;
  }
  function getQuickFilter(oTable) {
    var aFilters = [];
    var sQuickFilterKey = DelegateUtil.getCustomData(oTable, "quickFilterKey");
    if (sQuickFilterKey) {
      aFilters = aFilters.concat(getFiltersInfoForSV(oTable, sQuickFilterKey).filters);
    }
    return aFilters;
  }
  function getTableFilters(oTable) {
    return getQuickFilter(oTable).concat(getHiddenFilters(oTable));
  }
  function getListBindingForCount(oTable, oPageBinding, oParams) {
    var countBinding;
    var oBindingInfo = oTable.data("rowsBindingInfo"),
      oDataModel = oTable.getModel();
    var sBatchId = oParams.batchGroupId || "",
      oFilterInfo = getFilterInfo(oTable);
    var aFilters = Array.isArray(oParams.additionalFilters) ? oParams.additionalFilters : [];
    var sBindingPath = oFilterInfo.bindingPath ? oFilterInfo.bindingPath : oBindingInfo.path;
    aFilters = aFilters.concat(oFilterInfo.filters).concat(getP13nFilters(oTable));
    var oTableContextFilter = new Filter({
      filters: aFilters,
      and: true
    });

    // Need to pass by a temporary ListBinding in order to get $filter query option (as string) thanks to fetchFilter of OdataListBinding
    var oListBinding = oDataModel.bindList((oPageBinding ? "".concat(oPageBinding.getPath(), "/") : "") + sBindingPath, oTable.getBindingContext(), [], oTableContextFilter);
    return oListBinding.fetchFilter(oListBinding.getContext()).then(function (aStringFilters) {
      countBinding = oDataModel.bindProperty("".concat(oListBinding.getPath(), "/$count"), oListBinding.getContext(), {
        $$groupId: sBatchId || "$auto",
        $filter: aStringFilters[0],
        $search: oFilterInfo.search
      });
      return countBinding.requestValue();
    }).then(function (iValue) {
      countBinding.destroy();
      oListBinding.destroy();
      return iValue;
    });
  }
  function getCountFormatted(iCount) {
    var oCountFormatter = NumberFormat.getIntegerInstance({
      groupingEnabled: true
    });
    return oCountFormatter.format(iCount);
  }
  function getFilterInfo(oTable) {
    var oTableDefinition = oTable.getParent().getTableDefinition();
    var aIgnoreProperties = [];
    function _getRelativePathArrayFromAggregates(oSubTable) {
      var mAggregates = oSubTable.getParent().getTableDefinition().aggregates;
      return Object.keys(mAggregates).map(function (sAggregateName) {
        return mAggregates[sAggregateName].relativePath;
      });
    }
    if (oTableDefinition.enableAnalytics) {
      aIgnoreProperties = aIgnoreProperties.concat(_getRelativePathArrayFromAggregates(oTable));
      if (!oTableDefinition.enableAnalyticsSearch) {
        // Search isn't allow as a $apply transformation for this table
        aIgnoreProperties = aIgnoreProperties.concat(["search"]);
      }
    }
    return FilterUtils.getFilterInfo(oTable.getFilter(), {
      ignoredProperties: aIgnoreProperties,
      targetControl: oTable
    });
  }

  /**
   * Retrieves all filters configured in Table filter personalization dialog.
   *
   * @param oTable Table instance
   * @returns Filters configured in table personalization dialog
   * @private
   * @ui5-restricted
   */
  function getP13nFilters(oTable) {
    var aP13nMode = oTable.getP13nMode();
    if (aP13nMode && aP13nMode.indexOf("Filter") > -1) {
      var aP13nProperties = (DelegateUtil.getCustomData(oTable, "sap_fe_TableDelegate_propertyInfoMap") || []).filter(function (oTableProperty) {
          return oTableProperty && !(oTableProperty.filterable === false);
        }),
        oFilterInfo = FilterUtils.getFilterInfo(oTable, {
          propertiesMetadata: aP13nProperties
        });
      if (oFilterInfo && oFilterInfo.filters) {
        return oFilterInfo.filters;
      }
    }
    return [];
  }
  function getAllFilterInfo(oTable) {
    var oIFilterInfo = getFilterInfo(oTable);
    return {
      filters: oIFilterInfo.filters.concat(getTableFilters(oTable), getP13nFilters(oTable)),
      search: oIFilterInfo.search,
      bindingPath: oIFilterInfo.bindingPath
    };
  }

  /**
   * Returns a promise that is resolved with the table itself when the table was bound.
   *
   * @param oTable The table to check for binding
   * @returns A Promise that will be resolved when table is bound
   */
  function whenBound(oTable) {
    return _getOrCreateBoundPromiseInfo(oTable).promise;
  }

  /**
   * If not yet happened, it resolves the table bound promise.
   *
   * @param oTable The table that was bound
   */
  function onTableBound(oTable) {
    var oBoundPromiseInfo = _getOrCreateBoundPromiseInfo(oTable);
    if (oBoundPromiseInfo.resolve) {
      oBoundPromiseInfo.resolve(oTable);
      oTable.data("boundPromiseResolve", null);
    }
  }
  function _getOrCreateBoundPromiseInfo(oTable) {
    if (!oTable.data("boundPromise")) {
      var fnResolve;
      oTable.data("boundPromise", new Promise(function (resolve) {
        fnResolve = resolve;
      }));
      if (oTable.isBound()) {
        fnResolve(oTable);
      } else {
        oTable.data("boundPromiseResolve", fnResolve);
      }
    }
    return {
      promise: oTable.data("boundPromise"),
      resolve: oTable.data("boundPromiseResolve")
    };
  }
  function updateBindingInfo(oBindingInfo, oFilterInfo, oFilter) {
    oBindingInfo.filters = oFilter;
    if (oFilterInfo.search) {
      oBindingInfo.parameters.$search = CommonUtils.normalizeSearchTerm(oFilterInfo.search);
    } else {
      oBindingInfo.parameters.$search = undefined;
    }
  }
  function fnGetSemanticTargetsFromTable(oController, oTable) {
    var oView = oController.getView();
    var oInternalModelContext = oView.getBindingContext("internal");
    if (oInternalModelContext) {
      var sEntitySet = DelegateUtil.getCustomData(oTable, "targetCollectionPath");
      if (sEntitySet) {
        var oComponent = oController.getOwnerComponent();
        var oAppComponent = Component.getOwnerComponentFor(oComponent);
        var oMetaModel = oAppComponent.getMetaModel();
        var oShellServiceHelper = CommonUtils.getShellServices(oAppComponent);
        var sCurrentHash = FieldRuntime._fnFixHashQueryString(CommonUtils.getHash());
        var oColumns = oTable.getParent().getTableDefinition().columns;
        var aSemanticObjectsForGetLinks = [];
        var aSemanticObjects = [];
        var aPathAlreadyProcessed = [];
        var sPath = "",
          sAnnotationPath,
          oProperty;
        var _oSemanticObject;
        var aSemanticObjectsPromises = [];
        var sQualifier, regexResult;
        for (var i = 0; i < oColumns.length; i++) {
          sAnnotationPath = oColumns[i].annotationPath;
          //this check is required in cases where custom columns are configured via manifest where there is no provision for an annotation path.
          if (sAnnotationPath) {
            oProperty = oMetaModel.getObject(sAnnotationPath);
            if (oProperty && oProperty.$kind === "Property") {
              sPath = oColumns[i].annotationPath;
            } else if (oProperty && oProperty.$Type === "com.sap.vocabularies.UI.v1.DataField") {
              sPath = "".concat(sEntitySet, "/").concat(oMetaModel.getObject("".concat(sAnnotationPath, "/Value/$Path")));
            }
          }
          if (sPath !== "") {
            var _Keys = Object.keys(oMetaModel.getObject(sPath + "@"));
            for (var index = 0; index < _Keys.length; index++) {
              if (!aPathAlreadyProcessed.includes(sPath) && _Keys[index].indexOf("@".concat("com.sap.vocabularies.Common.v1.SemanticObject")) === 0 && _Keys[index].indexOf("@".concat("com.sap.vocabularies.Common.v1.SemanticObjectMapping")) === -1 && _Keys[index].indexOf("@".concat("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions")) === -1) {
                regexResult = /#(.*)/.exec(_Keys[index]);
                sQualifier = regexResult ? regexResult[1] : "";
                aSemanticObjectsPromises.push(CommonUtils.getSemanticObjectPromise(oAppComponent, oView, oMetaModel, sPath, sQualifier));
                aPathAlreadyProcessed.push(sPath);
              }
            }
          }
          sPath = "";
        }
        if (aSemanticObjectsPromises.length === 0) {
          return Promise.resolve();
        } else {
          Promise.all(aSemanticObjectsPromises).then(function (aValues) {
            var aGetLinksPromises = [];
            var sSemObjExpression;
            var aSemanticObjectsResolved = aValues.filter(function (element) {
              if (element.semanticObject && typeof element.semanticObject.semanticObject === "object") {
                sSemObjExpression = compileExpression(pathInModel(element.semanticObject.semanticObject.$Path));
                element.semanticObject.semanticObject = sSemObjExpression;
                element.semanticObjectForGetLinks[0].semanticObject = sSemObjExpression;
                return true;
              } else if (element) {
                return element.semanticObject !== undefined;
              } else {
                return false;
              }
            });
            for (var j = 0; j < aSemanticObjectsResolved.length; j++) {
              _oSemanticObject = aSemanticObjectsResolved[j];
              if (_oSemanticObject && _oSemanticObject.semanticObject && !(_oSemanticObject.semanticObject.semanticObject.indexOf("{") === 0)) {
                aSemanticObjectsForGetLinks.push(_oSemanticObject.semanticObjectForGetLinks);
                aSemanticObjects.push({
                  semanticObject: _oSemanticObject.semanticObject && _oSemanticObject.semanticObject.semanticObject,
                  unavailableActions: _oSemanticObject.unavailableActions,
                  path: aSemanticObjectsResolved[j].semanticObjectPath
                });
                aGetLinksPromises.push(oShellServiceHelper.getLinksWithCache([_oSemanticObject.semanticObjectForGetLinks])); //aSemanticObjectsForGetLinks));
              }
            }

            return CommonUtils.updateSemanticTargets(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash);
          }).catch(function (oError) {
            Log.error("fnGetSemanticTargetsFromTable: Cannot get Semantic Objects", oError);
          });
        }
      }
    }
  }
  function clearSelection(oTable) {
    oTable.clearSelection();
    var oInternalModelContext = oTable.getBindingContext("internal");
    if (oInternalModelContext) {
      oInternalModelContext.setProperty("deleteEnabled", false);
      oInternalModelContext.setProperty("numberOfSelectedContexts", 0);
      oInternalModelContext.setProperty("selectedContexts", []);
      oInternalModelContext.setProperty("deletableContexts", []);
    }
  }
  var oTableUtils = {
    getCountFormatted: getCountFormatted,
    getHiddenFilters: getHiddenFilters,
    getFiltersInfoForSV: getFiltersInfoForSV,
    getTableFilters: getTableFilters,
    getListBindingForCount: getListBindingForCount,
    getFilterInfo: getFilterInfo,
    getP13nFilters: getP13nFilters,
    getAllFilterInfo: getAllFilterInfo,
    whenBound: whenBound,
    onTableBound: onTableBound,
    getSemanticTargetsFromTable: fnGetSemanticTargetsFromTable,
    updateBindingInfo: updateBindingInfo,
    clearSelection: clearSelection
  };
  return oTableUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRGaWx0ZXJzSW5mb0ZvclNWIiwib1RhYmxlIiwic1N2UGF0aCIsIm1ldGFNb2RlbCIsIkNvbW1vblV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0TWV0YU1vZGVsIiwic3ZDb250ZXh0IiwiZ2V0TWV0YUNvbnRleHQiLCJkYXRhIiwib1NlbGVjdGlvblZhcmlhbnQiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJ0YXJnZXRPYmplY3QiLCJtUHJvcGVydHlGaWx0ZXJzIiwiYUZpbHRlcnMiLCJhUGF0aHMiLCJzVGV4dCIsIlRleHQiLCJTZWxlY3RPcHRpb25zIiwiZm9yRWFjaCIsIm9TZWxlY3RPcHRpb24iLCJQcm9wZXJ0eU5hbWUiLCIkdGFyZ2V0IiwiUmFuZ2VzIiwibGVuZ3RoIiwicHJvcGVydHlUeXBlIiwidHlwZSIsInNQYXRoIiwidmFsdWUiLCJpbmNsdWRlcyIsInB1c2giLCJqIiwicmFuZ2UiLCJnZXRSYW5nZURlZmluaXRpb24iLCJjb25jYXQiLCJGaWx0ZXIiLCJvcGVyYXRvciIsInJhbmdlTG93IiwicmFuZ2VIaWdoIiwic1Byb3BlcnR5UGF0aCIsImZpbHRlcnMiLCJhbmQiLCJwcm9wZXJ0aWVzIiwidGV4dCIsImdldEhpZGRlbkZpbHRlcnMiLCJoaWRkZW5GaWx0ZXJzIiwiQXJyYXkiLCJpc0FycmF5IiwicGF0aHMiLCJtUGF0aCIsIm9TdkZpbHRlciIsImFubm90YXRpb25QYXRoIiwiZ2V0UXVpY2tGaWx0ZXIiLCJzUXVpY2tGaWx0ZXJLZXkiLCJEZWxlZ2F0ZVV0aWwiLCJnZXRDdXN0b21EYXRhIiwiZ2V0VGFibGVGaWx0ZXJzIiwiZ2V0TGlzdEJpbmRpbmdGb3JDb3VudCIsIm9QYWdlQmluZGluZyIsIm9QYXJhbXMiLCJjb3VudEJpbmRpbmciLCJvQmluZGluZ0luZm8iLCJvRGF0YU1vZGVsIiwiZ2V0TW9kZWwiLCJzQmF0Y2hJZCIsImJhdGNoR3JvdXBJZCIsIm9GaWx0ZXJJbmZvIiwiZ2V0RmlsdGVySW5mbyIsImFkZGl0aW9uYWxGaWx0ZXJzIiwic0JpbmRpbmdQYXRoIiwiYmluZGluZ1BhdGgiLCJwYXRoIiwiZ2V0UDEzbkZpbHRlcnMiLCJvVGFibGVDb250ZXh0RmlsdGVyIiwib0xpc3RCaW5kaW5nIiwiYmluZExpc3QiLCJnZXRQYXRoIiwiZ2V0QmluZGluZ0NvbnRleHQiLCJmZXRjaEZpbHRlciIsImdldENvbnRleHQiLCJ0aGVuIiwiYVN0cmluZ0ZpbHRlcnMiLCJiaW5kUHJvcGVydHkiLCIkJGdyb3VwSWQiLCIkZmlsdGVyIiwiJHNlYXJjaCIsInNlYXJjaCIsInJlcXVlc3RWYWx1ZSIsImlWYWx1ZSIsImRlc3Ryb3kiLCJnZXRDb3VudEZvcm1hdHRlZCIsImlDb3VudCIsIm9Db3VudEZvcm1hdHRlciIsIk51bWJlckZvcm1hdCIsImdldEludGVnZXJJbnN0YW5jZSIsImdyb3VwaW5nRW5hYmxlZCIsImZvcm1hdCIsIm9UYWJsZURlZmluaXRpb24iLCJnZXRQYXJlbnQiLCJnZXRUYWJsZURlZmluaXRpb24iLCJhSWdub3JlUHJvcGVydGllcyIsIl9nZXRSZWxhdGl2ZVBhdGhBcnJheUZyb21BZ2dyZWdhdGVzIiwib1N1YlRhYmxlIiwibUFnZ3JlZ2F0ZXMiLCJhZ2dyZWdhdGVzIiwiT2JqZWN0Iiwia2V5cyIsIm1hcCIsInNBZ2dyZWdhdGVOYW1lIiwicmVsYXRpdmVQYXRoIiwiZW5hYmxlQW5hbHl0aWNzIiwiZW5hYmxlQW5hbHl0aWNzU2VhcmNoIiwiRmlsdGVyVXRpbHMiLCJnZXRGaWx0ZXIiLCJpZ25vcmVkUHJvcGVydGllcyIsInRhcmdldENvbnRyb2wiLCJhUDEzbk1vZGUiLCJnZXRQMTNuTW9kZSIsImluZGV4T2YiLCJhUDEzblByb3BlcnRpZXMiLCJmaWx0ZXIiLCJvVGFibGVQcm9wZXJ0eSIsImZpbHRlcmFibGUiLCJwcm9wZXJ0aWVzTWV0YWRhdGEiLCJnZXRBbGxGaWx0ZXJJbmZvIiwib0lGaWx0ZXJJbmZvIiwid2hlbkJvdW5kIiwiX2dldE9yQ3JlYXRlQm91bmRQcm9taXNlSW5mbyIsInByb21pc2UiLCJvblRhYmxlQm91bmQiLCJvQm91bmRQcm9taXNlSW5mbyIsInJlc29sdmUiLCJmblJlc29sdmUiLCJQcm9taXNlIiwiaXNCb3VuZCIsInVwZGF0ZUJpbmRpbmdJbmZvIiwib0ZpbHRlciIsInBhcmFtZXRlcnMiLCJub3JtYWxpemVTZWFyY2hUZXJtIiwidW5kZWZpbmVkIiwiZm5HZXRTZW1hbnRpY1RhcmdldHNGcm9tVGFibGUiLCJvQ29udHJvbGxlciIsIm9WaWV3IiwiZ2V0VmlldyIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsInNFbnRpdHlTZXQiLCJvQ29tcG9uZW50IiwiZ2V0T3duZXJDb21wb25lbnQiLCJvQXBwQ29tcG9uZW50IiwiQ29tcG9uZW50IiwiZ2V0T3duZXJDb21wb25lbnRGb3IiLCJvTWV0YU1vZGVsIiwib1NoZWxsU2VydmljZUhlbHBlciIsImdldFNoZWxsU2VydmljZXMiLCJzQ3VycmVudEhhc2giLCJGaWVsZFJ1bnRpbWUiLCJfZm5GaXhIYXNoUXVlcnlTdHJpbmciLCJnZXRIYXNoIiwib0NvbHVtbnMiLCJjb2x1bW5zIiwiYVNlbWFudGljT2JqZWN0c0ZvckdldExpbmtzIiwiYVNlbWFudGljT2JqZWN0cyIsImFQYXRoQWxyZWFkeVByb2Nlc3NlZCIsInNBbm5vdGF0aW9uUGF0aCIsIm9Qcm9wZXJ0eSIsIl9vU2VtYW50aWNPYmplY3QiLCJhU2VtYW50aWNPYmplY3RzUHJvbWlzZXMiLCJzUXVhbGlmaWVyIiwicmVnZXhSZXN1bHQiLCJpIiwiZ2V0T2JqZWN0IiwiJGtpbmQiLCIkVHlwZSIsIl9LZXlzIiwiaW5kZXgiLCJleGVjIiwiZ2V0U2VtYW50aWNPYmplY3RQcm9taXNlIiwiYWxsIiwiYVZhbHVlcyIsImFHZXRMaW5rc1Byb21pc2VzIiwic1NlbU9iakV4cHJlc3Npb24iLCJhU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQiLCJlbGVtZW50Iiwic2VtYW50aWNPYmplY3QiLCJjb21waWxlRXhwcmVzc2lvbiIsInBhdGhJbk1vZGVsIiwiJFBhdGgiLCJzZW1hbnRpY09iamVjdEZvckdldExpbmtzIiwidW5hdmFpbGFibGVBY3Rpb25zIiwic2VtYW50aWNPYmplY3RQYXRoIiwiZ2V0TGlua3NXaXRoQ2FjaGUiLCJ1cGRhdGVTZW1hbnRpY1RhcmdldHMiLCJjYXRjaCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwiY2xlYXJTZWxlY3Rpb24iLCJzZXRQcm9wZXJ0eSIsIm9UYWJsZVV0aWxzIiwiZ2V0U2VtYW50aWNUYXJnZXRzRnJvbVRhYmxlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJVdGlscy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Bbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHsgU2VsZWN0aW9uVmFyaWFudCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGdldFJhbmdlRGVmaW5pdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvU2VsZWN0aW9uVmFyaWFudEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBjb21waWxlRXhwcmVzc2lvbiwgcGF0aEluTW9kZWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IEZpZWxkUnVudGltZSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZFJ1bnRpbWVcIjtcbmltcG9ydCBGaWx0ZXJVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWx0ZXIvRmlsdGVyVXRpbHNcIjtcbmltcG9ydCB0eXBlIFRhYmxlQVBJIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1RhYmxlQVBJXCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCB0eXBlIENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBOdW1iZXJGb3JtYXQgZnJvbSBcInNhcC91aS9jb3JlL2Zvcm1hdC9OdW1iZXJGb3JtYXRcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCB0eXBlIE9EYXRhVjRMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcblxuLyoqXG4gKiBHZXQgZmlsdGVyIGluZm9ybWF0aW9uIGZvciBhIFNlbGVjdGlvblZhcmlhbnQgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gb1RhYmxlIFRoZSB0YWJsZSBpbnN0YW5jZVxuICogQHBhcmFtIHNTdlBhdGggUmVsYXRpdmUgU2VsZWN0aW9uVmFyaWFudCBhbm5vdGF0aW9uIHBhdGhcbiAqIEByZXR1cm5zIEluZm9ybWF0aW9uIG9uIGZpbHRlcnNcbiAqICBmaWx0ZXJzOiBhcnJheSBvZiBzYXAudWkubW9kZWwuZmlsdGVyc1xuICogdGV4dDogc2VsZWN0aW9uIFZhcmlhbnQgdGV4dCBwcm9wZXJ0eVxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBnZXRGaWx0ZXJzSW5mb0ZvclNWKG9UYWJsZTogYW55LCBzU3ZQYXRoOiBzdHJpbmcpIHtcblx0Y29uc3QgbWV0YU1vZGVsID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9UYWJsZSkuZ2V0TWV0YU1vZGVsKCk7XG5cdGNvbnN0IHN2Q29udGV4dCA9IG1ldGFNb2RlbC5nZXRNZXRhQ29udGV4dChgJHtvVGFibGUuZGF0YShcImVudGl0eVR5cGVcIil9JHtzU3ZQYXRofWApLFxuXHRcdG9TZWxlY3Rpb25WYXJpYW50ID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKHN2Q29udGV4dCkudGFyZ2V0T2JqZWN0IGFzIFNlbGVjdGlvblZhcmlhbnQsXG5cdFx0bVByb3BlcnR5RmlsdGVyczogYW55ID0ge30sXG5cdFx0YUZpbHRlcnMgPSBbXSxcblx0XHRhUGF0aHM6IGFueVtdID0gW107XG5cdGxldCBzVGV4dCA9IFwiXCI7XG5cdGlmIChvU2VsZWN0aW9uVmFyaWFudCkge1xuXHRcdHNUZXh0ID0gb1NlbGVjdGlvblZhcmlhbnQuVGV4dCBhcyBzdHJpbmc7XG5cdFx0KG9TZWxlY3Rpb25WYXJpYW50LlNlbGVjdE9wdGlvbnMgfHwgW10pLmZvckVhY2goZnVuY3Rpb24gKG9TZWxlY3RPcHRpb24pIHtcblx0XHRcdGlmIChvU2VsZWN0T3B0aW9uLlByb3BlcnR5TmFtZT8uJHRhcmdldCAmJiBvU2VsZWN0T3B0aW9uLlJhbmdlcz8ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRjb25zdCBwcm9wZXJ0eVR5cGUgPSBvU2VsZWN0T3B0aW9uLlByb3BlcnR5TmFtZS4kdGFyZ2V0LnR5cGU7XG5cdFx0XHRcdGNvbnN0IHNQYXRoID0gb1NlbGVjdE9wdGlvbi5Qcm9wZXJ0eU5hbWUudmFsdWU7XG5cdFx0XHRcdGlmICghYVBhdGhzLmluY2x1ZGVzKHNQYXRoKSkge1xuXHRcdFx0XHRcdGFQYXRocy5wdXNoKHNQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKGNvbnN0IGogaW4gb1NlbGVjdE9wdGlvbi5SYW5nZXMpIHtcblx0XHRcdFx0XHRjb25zdCByYW5nZSA9IGdldFJhbmdlRGVmaW5pdGlvbihvU2VsZWN0T3B0aW9uLlJhbmdlc1tqXSwgcHJvcGVydHlUeXBlKTtcblx0XHRcdFx0XHRtUHJvcGVydHlGaWx0ZXJzW3NQYXRoXSA9IChtUHJvcGVydHlGaWx0ZXJzW3NQYXRoXSB8fCBbXSkuY29uY2F0KFxuXHRcdFx0XHRcdFx0bmV3IEZpbHRlcihzUGF0aCwgcmFuZ2Uub3BlcmF0b3IgYXMgRmlsdGVyT3BlcmF0b3IsIHJhbmdlLnJhbmdlTG93LCByYW5nZS5yYW5nZUhpZ2gpXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Zm9yIChjb25zdCBzUHJvcGVydHlQYXRoIGluIG1Qcm9wZXJ0eUZpbHRlcnMpIHtcblx0XHRcdGFGaWx0ZXJzLnB1c2goXG5cdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdGZpbHRlcnM6IG1Qcm9wZXJ0eUZpbHRlcnNbc1Byb3BlcnR5UGF0aF0sXG5cdFx0XHRcdFx0YW5kOiBmYWxzZVxuXHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHByb3BlcnRpZXM6IGFQYXRocyxcblx0XHRmaWx0ZXJzOiBhRmlsdGVycyxcblx0XHR0ZXh0OiBzVGV4dFxuXHR9O1xufVxuZnVuY3Rpb24gZ2V0SGlkZGVuRmlsdGVycyhvVGFibGU6IENvbnRyb2wpIHtcblx0bGV0IGFGaWx0ZXJzOiBhbnlbXSA9IFtdO1xuXHRjb25zdCBoaWRkZW5GaWx0ZXJzID0gb1RhYmxlLmRhdGEoXCJoaWRkZW5GaWx0ZXJzXCIpO1xuXHRpZiAoaGlkZGVuRmlsdGVycyAmJiBBcnJheS5pc0FycmF5KGhpZGRlbkZpbHRlcnMucGF0aHMpKSB7XG5cdFx0aGlkZGVuRmlsdGVycy5wYXRocy5mb3JFYWNoKGZ1bmN0aW9uIChtUGF0aDogYW55KSB7XG5cdFx0XHRjb25zdCBvU3ZGaWx0ZXIgPSBnZXRGaWx0ZXJzSW5mb0ZvclNWKG9UYWJsZSwgbVBhdGguYW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0YUZpbHRlcnMgPSBhRmlsdGVycy5jb25jYXQob1N2RmlsdGVyLmZpbHRlcnMpO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhRmlsdGVycztcbn1cbmZ1bmN0aW9uIGdldFF1aWNrRmlsdGVyKG9UYWJsZTogQ29udHJvbCkge1xuXHRsZXQgYUZpbHRlcnM6IGFueVtdID0gW107XG5cdGNvbnN0IHNRdWlja0ZpbHRlcktleSA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJxdWlja0ZpbHRlcktleVwiKTtcblx0aWYgKHNRdWlja0ZpbHRlcktleSkge1xuXHRcdGFGaWx0ZXJzID0gYUZpbHRlcnMuY29uY2F0KGdldEZpbHRlcnNJbmZvRm9yU1Yob1RhYmxlLCBzUXVpY2tGaWx0ZXJLZXkpLmZpbHRlcnMpO1xuXHR9XG5cdHJldHVybiBhRmlsdGVycztcbn1cbmZ1bmN0aW9uIGdldFRhYmxlRmlsdGVycyhvVGFibGU6IENvbnRyb2wpIHtcblx0cmV0dXJuIGdldFF1aWNrRmlsdGVyKG9UYWJsZSkuY29uY2F0KGdldEhpZGRlbkZpbHRlcnMob1RhYmxlKSk7XG59XG5mdW5jdGlvbiBnZXRMaXN0QmluZGluZ0ZvckNvdW50KG9UYWJsZTogVGFibGUsIG9QYWdlQmluZGluZzogYW55LCBvUGFyYW1zOiBhbnkpIHtcblx0bGV0IGNvdW50QmluZGluZyE6IGFueTtcblx0Y29uc3Qgb0JpbmRpbmdJbmZvID0gb1RhYmxlLmRhdGEoXCJyb3dzQmluZGluZ0luZm9cIiksXG5cdFx0b0RhdGFNb2RlbCA9IG9UYWJsZS5nZXRNb2RlbCgpO1xuXHRjb25zdCBzQmF0Y2hJZCA9IG9QYXJhbXMuYmF0Y2hHcm91cElkIHx8IFwiXCIsXG5cdFx0b0ZpbHRlckluZm8gPSBnZXRGaWx0ZXJJbmZvKG9UYWJsZSk7XG5cdGxldCBhRmlsdGVycyA9IEFycmF5LmlzQXJyYXkob1BhcmFtcy5hZGRpdGlvbmFsRmlsdGVycykgPyBvUGFyYW1zLmFkZGl0aW9uYWxGaWx0ZXJzIDogW107XG5cdGNvbnN0IHNCaW5kaW5nUGF0aCA9IG9GaWx0ZXJJbmZvLmJpbmRpbmdQYXRoID8gb0ZpbHRlckluZm8uYmluZGluZ1BhdGggOiBvQmluZGluZ0luZm8ucGF0aDtcblxuXHRhRmlsdGVycyA9IGFGaWx0ZXJzLmNvbmNhdChvRmlsdGVySW5mby5maWx0ZXJzKS5jb25jYXQoZ2V0UDEzbkZpbHRlcnMob1RhYmxlKSk7XG5cdGNvbnN0IG9UYWJsZUNvbnRleHRGaWx0ZXIgPSBuZXcgRmlsdGVyKHtcblx0XHRmaWx0ZXJzOiBhRmlsdGVycyxcblx0XHRhbmQ6IHRydWVcblx0fSk7XG5cblx0Ly8gTmVlZCB0byBwYXNzIGJ5IGEgdGVtcG9yYXJ5IExpc3RCaW5kaW5nIGluIG9yZGVyIHRvIGdldCAkZmlsdGVyIHF1ZXJ5IG9wdGlvbiAoYXMgc3RyaW5nKSB0aGFua3MgdG8gZmV0Y2hGaWx0ZXIgb2YgT2RhdGFMaXN0QmluZGluZ1xuXHRjb25zdCBvTGlzdEJpbmRpbmcgPSBvRGF0YU1vZGVsLmJpbmRMaXN0KFxuXHRcdChvUGFnZUJpbmRpbmcgPyBgJHtvUGFnZUJpbmRpbmcuZ2V0UGF0aCgpfS9gIDogXCJcIikgKyBzQmluZGluZ1BhdGgsXG5cdFx0b1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgQ29udGV4dCxcblx0XHRbXSxcblx0XHRvVGFibGVDb250ZXh0RmlsdGVyXG5cdCkgYXMgT0RhdGFWNExpc3RCaW5kaW5nO1xuXG5cdHJldHVybiAob0xpc3RCaW5kaW5nIGFzIGFueSlcblx0XHQuZmV0Y2hGaWx0ZXIob0xpc3RCaW5kaW5nLmdldENvbnRleHQoKSlcblx0XHQudGhlbihmdW5jdGlvbiAoYVN0cmluZ0ZpbHRlcnM6IHN0cmluZ1tdKSB7XG5cdFx0XHRjb3VudEJpbmRpbmcgPSBvRGF0YU1vZGVsLmJpbmRQcm9wZXJ0eShgJHtvTGlzdEJpbmRpbmcuZ2V0UGF0aCgpfS8kY291bnRgLCBvTGlzdEJpbmRpbmcuZ2V0Q29udGV4dCgpLCB7XG5cdFx0XHRcdCQkZ3JvdXBJZDogc0JhdGNoSWQgfHwgXCIkYXV0b1wiLFxuXHRcdFx0XHQkZmlsdGVyOiBhU3RyaW5nRmlsdGVyc1swXSxcblx0XHRcdFx0JHNlYXJjaDogb0ZpbHRlckluZm8uc2VhcmNoXG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBjb3VudEJpbmRpbmcucmVxdWVzdFZhbHVlKCk7XG5cdFx0fSlcblx0XHQudGhlbihmdW5jdGlvbiAoaVZhbHVlOiBhbnkpIHtcblx0XHRcdGNvdW50QmluZGluZy5kZXN0cm95KCk7XG5cdFx0XHRvTGlzdEJpbmRpbmcuZGVzdHJveSgpO1xuXHRcdFx0cmV0dXJuIGlWYWx1ZTtcblx0XHR9KTtcbn1cbmZ1bmN0aW9uIGdldENvdW50Rm9ybWF0dGVkKGlDb3VudDogYW55KSB7XG5cdGNvbnN0IG9Db3VudEZvcm1hdHRlciA9IE51bWJlckZvcm1hdC5nZXRJbnRlZ2VySW5zdGFuY2UoeyBncm91cGluZ0VuYWJsZWQ6IHRydWUgfSk7XG5cdHJldHVybiBvQ291bnRGb3JtYXR0ZXIuZm9ybWF0KGlDb3VudCk7XG59XG5mdW5jdGlvbiBnZXRGaWx0ZXJJbmZvKG9UYWJsZTogYW55KSB7XG5cdGNvbnN0IG9UYWJsZURlZmluaXRpb24gPSBvVGFibGUuZ2V0UGFyZW50KCkuZ2V0VGFibGVEZWZpbml0aW9uKCk7XG5cdGxldCBhSWdub3JlUHJvcGVydGllczogYW55W10gPSBbXTtcblxuXHRmdW5jdGlvbiBfZ2V0UmVsYXRpdmVQYXRoQXJyYXlGcm9tQWdncmVnYXRlcyhvU3ViVGFibGU6IFRhYmxlKSB7XG5cdFx0Y29uc3QgbUFnZ3JlZ2F0ZXMgPSAob1N1YlRhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJKS5nZXRUYWJsZURlZmluaXRpb24oKS5hZ2dyZWdhdGVzIGFzIGFueTtcblx0XHRyZXR1cm4gT2JqZWN0LmtleXMobUFnZ3JlZ2F0ZXMpLm1hcChmdW5jdGlvbiAoc0FnZ3JlZ2F0ZU5hbWUpIHtcblx0XHRcdHJldHVybiBtQWdncmVnYXRlc1tzQWdncmVnYXRlTmFtZV0ucmVsYXRpdmVQYXRoO1xuXHRcdH0pO1xuXHR9XG5cblx0aWYgKG9UYWJsZURlZmluaXRpb24uZW5hYmxlQW5hbHl0aWNzKSB7XG5cdFx0YUlnbm9yZVByb3BlcnRpZXMgPSBhSWdub3JlUHJvcGVydGllcy5jb25jYXQoX2dldFJlbGF0aXZlUGF0aEFycmF5RnJvbUFnZ3JlZ2F0ZXMob1RhYmxlKSk7XG5cblx0XHRpZiAoIW9UYWJsZURlZmluaXRpb24uZW5hYmxlQW5hbHl0aWNzU2VhcmNoKSB7XG5cdFx0XHQvLyBTZWFyY2ggaXNuJ3QgYWxsb3cgYXMgYSAkYXBwbHkgdHJhbnNmb3JtYXRpb24gZm9yIHRoaXMgdGFibGVcblx0XHRcdGFJZ25vcmVQcm9wZXJ0aWVzID0gYUlnbm9yZVByb3BlcnRpZXMuY29uY2F0KFtcInNlYXJjaFwiXSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBGaWx0ZXJVdGlscy5nZXRGaWx0ZXJJbmZvKG9UYWJsZS5nZXRGaWx0ZXIoKSwge1xuXHRcdGlnbm9yZWRQcm9wZXJ0aWVzOiBhSWdub3JlUHJvcGVydGllcyxcblx0XHR0YXJnZXRDb250cm9sOiBvVGFibGVcblx0fSk7XG59XG5cbi8qKlxuICogUmV0cmlldmVzIGFsbCBmaWx0ZXJzIGNvbmZpZ3VyZWQgaW4gVGFibGUgZmlsdGVyIHBlcnNvbmFsaXphdGlvbiBkaWFsb2cuXG4gKlxuICogQHBhcmFtIG9UYWJsZSBUYWJsZSBpbnN0YW5jZVxuICogQHJldHVybnMgRmlsdGVycyBjb25maWd1cmVkIGluIHRhYmxlIHBlcnNvbmFsaXphdGlvbiBkaWFsb2dcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZnVuY3Rpb24gZ2V0UDEzbkZpbHRlcnMob1RhYmxlOiBUYWJsZSkge1xuXHRjb25zdCBhUDEzbk1vZGUgPSBvVGFibGUuZ2V0UDEzbk1vZGUoKTtcblx0aWYgKGFQMTNuTW9kZSAmJiBhUDEzbk1vZGUuaW5kZXhPZihcIkZpbHRlclwiKSA+IC0xKSB7XG5cdFx0Y29uc3QgYVAxM25Qcm9wZXJ0aWVzID0gKERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9UYWJsZSwgXCJzYXBfZmVfVGFibGVEZWxlZ2F0ZV9wcm9wZXJ0eUluZm9NYXBcIikgfHwgW10pLmZpbHRlcihmdW5jdGlvbiAoXG5cdFx0XHRcdG9UYWJsZVByb3BlcnR5OiBhbnlcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gb1RhYmxlUHJvcGVydHkgJiYgIShvVGFibGVQcm9wZXJ0eS5maWx0ZXJhYmxlID09PSBmYWxzZSk7XG5cdFx0XHR9KSxcblx0XHRcdG9GaWx0ZXJJbmZvID0gRmlsdGVyVXRpbHMuZ2V0RmlsdGVySW5mbyhvVGFibGUsIHsgcHJvcGVydGllc01ldGFkYXRhOiBhUDEzblByb3BlcnRpZXMgfSk7XG5cdFx0aWYgKG9GaWx0ZXJJbmZvICYmIG9GaWx0ZXJJbmZvLmZpbHRlcnMpIHtcblx0XHRcdHJldHVybiBvRmlsdGVySW5mby5maWx0ZXJzO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gW107XG59XG5cbmZ1bmN0aW9uIGdldEFsbEZpbHRlckluZm8ob1RhYmxlOiBUYWJsZSkge1xuXHRjb25zdCBvSUZpbHRlckluZm8gPSBnZXRGaWx0ZXJJbmZvKG9UYWJsZSk7XG5cdHJldHVybiB7XG5cdFx0ZmlsdGVyczogb0lGaWx0ZXJJbmZvLmZpbHRlcnMuY29uY2F0KGdldFRhYmxlRmlsdGVycyhvVGFibGUpLCBnZXRQMTNuRmlsdGVycyhvVGFibGUpKSxcblx0XHRzZWFyY2g6IG9JRmlsdGVySW5mby5zZWFyY2gsXG5cdFx0YmluZGluZ1BhdGg6IG9JRmlsdGVySW5mby5iaW5kaW5nUGF0aFxuXHR9O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aCB0aGUgdGFibGUgaXRzZWxmIHdoZW4gdGhlIHRhYmxlIHdhcyBib3VuZC5cbiAqXG4gKiBAcGFyYW0gb1RhYmxlIFRoZSB0YWJsZSB0byBjaGVjayBmb3IgYmluZGluZ1xuICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aGVuIHRhYmxlIGlzIGJvdW5kXG4gKi9cbmZ1bmN0aW9uIHdoZW5Cb3VuZChvVGFibGU6IFRhYmxlKSB7XG5cdHJldHVybiBfZ2V0T3JDcmVhdGVCb3VuZFByb21pc2VJbmZvKG9UYWJsZSkucHJvbWlzZTtcbn1cblxuLyoqXG4gKiBJZiBub3QgeWV0IGhhcHBlbmVkLCBpdCByZXNvbHZlcyB0aGUgdGFibGUgYm91bmQgcHJvbWlzZS5cbiAqXG4gKiBAcGFyYW0gb1RhYmxlIFRoZSB0YWJsZSB0aGF0IHdhcyBib3VuZFxuICovXG5mdW5jdGlvbiBvblRhYmxlQm91bmQob1RhYmxlOiBUYWJsZSkge1xuXHRjb25zdCBvQm91bmRQcm9taXNlSW5mbyA9IF9nZXRPckNyZWF0ZUJvdW5kUHJvbWlzZUluZm8ob1RhYmxlKTtcblx0aWYgKG9Cb3VuZFByb21pc2VJbmZvLnJlc29sdmUpIHtcblx0XHRvQm91bmRQcm9taXNlSW5mby5yZXNvbHZlKG9UYWJsZSk7XG5cdFx0b1RhYmxlLmRhdGEoXCJib3VuZFByb21pc2VSZXNvbHZlXCIsIG51bGwpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIF9nZXRPckNyZWF0ZUJvdW5kUHJvbWlzZUluZm8ob1RhYmxlOiBUYWJsZSkge1xuXHRpZiAoIW9UYWJsZS5kYXRhKFwiYm91bmRQcm9taXNlXCIpKSB7XG5cdFx0bGV0IGZuUmVzb2x2ZTogYW55O1xuXHRcdG9UYWJsZS5kYXRhKFxuXHRcdFx0XCJib3VuZFByb21pc2VcIixcblx0XHRcdG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0XHRcdGZuUmVzb2x2ZSA9IHJlc29sdmU7XG5cdFx0XHR9KVxuXHRcdCk7XG5cdFx0aWYgKChvVGFibGUgYXMgYW55KS5pc0JvdW5kKCkpIHtcblx0XHRcdGZuUmVzb2x2ZShvVGFibGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvVGFibGUuZGF0YShcImJvdW5kUHJvbWlzZVJlc29sdmVcIiwgZm5SZXNvbHZlKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHsgcHJvbWlzZTogb1RhYmxlLmRhdGEoXCJib3VuZFByb21pc2VcIiksIHJlc29sdmU6IG9UYWJsZS5kYXRhKFwiYm91bmRQcm9taXNlUmVzb2x2ZVwiKSB9O1xufVxuXG5mdW5jdGlvbiB1cGRhdGVCaW5kaW5nSW5mbyhvQmluZGluZ0luZm86IGFueSwgb0ZpbHRlckluZm86IGFueSwgb0ZpbHRlcjogYW55KSB7XG5cdG9CaW5kaW5nSW5mby5maWx0ZXJzID0gb0ZpbHRlcjtcblx0aWYgKG9GaWx0ZXJJbmZvLnNlYXJjaCkge1xuXHRcdG9CaW5kaW5nSW5mby5wYXJhbWV0ZXJzLiRzZWFyY2ggPSBDb21tb25VdGlscy5ub3JtYWxpemVTZWFyY2hUZXJtKG9GaWx0ZXJJbmZvLnNlYXJjaCk7XG5cdH0gZWxzZSB7XG5cdFx0b0JpbmRpbmdJbmZvLnBhcmFtZXRlcnMuJHNlYXJjaCA9IHVuZGVmaW5lZDtcblx0fVxufVxuXG5mdW5jdGlvbiBmbkdldFNlbWFudGljVGFyZ2V0c0Zyb21UYWJsZShvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIG9UYWJsZTogVGFibGUpIHtcblx0Y29uc3Qgb1ZpZXcgPSBvQ29udHJvbGxlci5nZXRWaWV3KCk7XG5cdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cdGlmIChvSW50ZXJuYWxNb2RlbENvbnRleHQpIHtcblx0XHRjb25zdCBzRW50aXR5U2V0ID0gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1RhYmxlLCBcInRhcmdldENvbGxlY3Rpb25QYXRoXCIpO1xuXHRcdGlmIChzRW50aXR5U2V0KSB7XG5cdFx0XHRjb25zdCBvQ29tcG9uZW50ID0gb0NvbnRyb2xsZXIuZ2V0T3duZXJDb21wb25lbnQoKTtcblx0XHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob0NvbXBvbmVudCkgYXMgQXBwQ29tcG9uZW50O1xuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9BcHBDb21wb25lbnQuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0XHRjb25zdCBvU2hlbGxTZXJ2aWNlSGVscGVyID0gQ29tbW9uVXRpbHMuZ2V0U2hlbGxTZXJ2aWNlcyhvQXBwQ29tcG9uZW50KTtcblx0XHRcdGNvbnN0IHNDdXJyZW50SGFzaCA9IEZpZWxkUnVudGltZS5fZm5GaXhIYXNoUXVlcnlTdHJpbmcoQ29tbW9uVXRpbHMuZ2V0SGFzaCgpKTtcblx0XHRcdGNvbnN0IG9Db2x1bW5zID0gKG9UYWJsZS5nZXRQYXJlbnQoKSBhcyBUYWJsZUFQSSkuZ2V0VGFibGVEZWZpbml0aW9uKCkuY29sdW1ucztcblx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdHNGb3JHZXRMaW5rcyA9IFtdO1xuXHRcdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0czogYW55W10gPSBbXTtcblx0XHRcdGNvbnN0IGFQYXRoQWxyZWFkeVByb2Nlc3NlZDogc3RyaW5nW10gPSBbXTtcblx0XHRcdGxldCBzUGF0aDogc3RyaW5nID0gXCJcIixcblx0XHRcdFx0c0Fubm90YXRpb25QYXRoLFxuXHRcdFx0XHRvUHJvcGVydHk7XG5cdFx0XHRsZXQgX29TZW1hbnRpY09iamVjdDtcblx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdHNQcm9taXNlczogUHJvbWlzZTxhbnk+W10gPSBbXTtcblx0XHRcdGxldCBzUXVhbGlmaWVyOiBzdHJpbmcsIHJlZ2V4UmVzdWx0O1xuXG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG9Db2x1bW5zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdHNBbm5vdGF0aW9uUGF0aCA9IChvQ29sdW1uc1tpXSBhcyBhbnkpLmFubm90YXRpb25QYXRoO1xuXHRcdFx0XHQvL3RoaXMgY2hlY2sgaXMgcmVxdWlyZWQgaW4gY2FzZXMgd2hlcmUgY3VzdG9tIGNvbHVtbnMgYXJlIGNvbmZpZ3VyZWQgdmlhIG1hbmlmZXN0IHdoZXJlIHRoZXJlIGlzIG5vIHByb3Zpc2lvbiBmb3IgYW4gYW5ub3RhdGlvbiBwYXRoLlxuXHRcdFx0XHRpZiAoc0Fubm90YXRpb25QYXRoKSB7XG5cdFx0XHRcdFx0b1Byb3BlcnR5ID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0Fubm90YXRpb25QYXRoKTtcblx0XHRcdFx0XHRpZiAob1Byb3BlcnR5ICYmIG9Qcm9wZXJ0eS4ka2luZCA9PT0gXCJQcm9wZXJ0eVwiKSB7XG5cdFx0XHRcdFx0XHRzUGF0aCA9IChvQ29sdW1uc1tpXSBhcyBhbnkpLmFubm90YXRpb25QYXRoO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAob1Byb3BlcnR5ICYmIG9Qcm9wZXJ0eS4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIikge1xuXHRcdFx0XHRcdFx0c1BhdGggPSBgJHtzRW50aXR5U2V0fS8ke29NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NBbm5vdGF0aW9uUGF0aH0vVmFsdWUvJFBhdGhgKX1gO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc1BhdGggIT09IFwiXCIpIHtcblx0XHRcdFx0XHRjb25zdCBfS2V5cyA9IE9iamVjdC5rZXlzKG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNQYXRoICsgXCJAXCIpKTtcblx0XHRcdFx0XHRmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX0tleXMubGVuZ3RoOyBpbmRleCsrKSB7XG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdCFhUGF0aEFscmVhZHlQcm9jZXNzZWQuaW5jbHVkZXMoc1BhdGgpICYmXG5cdFx0XHRcdFx0XHRcdF9LZXlzW2luZGV4XS5pbmRleE9mKGBAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3R9YCkgPT09IDAgJiZcblx0XHRcdFx0XHRcdFx0X0tleXNbaW5kZXhdLmluZGV4T2YoYEAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdE1hcHBpbmd9YCkgPT09IC0xICYmXG5cdFx0XHRcdFx0XHRcdF9LZXlzW2luZGV4XS5pbmRleE9mKGBAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnN9YCkgPT09IC0xXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0cmVnZXhSZXN1bHQgPSAvIyguKikvLmV4ZWMoX0tleXNbaW5kZXhdKTtcblx0XHRcdFx0XHRcdFx0c1F1YWxpZmllciA9IHJlZ2V4UmVzdWx0ID8gcmVnZXhSZXN1bHRbMV0gOiBcIlwiO1xuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RzUHJvbWlzZXMucHVzaChcblx0XHRcdFx0XHRcdFx0XHRDb21tb25VdGlscy5nZXRTZW1hbnRpY09iamVjdFByb21pc2Uob0FwcENvbXBvbmVudCwgb1ZpZXcsIG9NZXRhTW9kZWwsIHNQYXRoLCBzUXVhbGlmaWVyKVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRhUGF0aEFscmVhZHlQcm9jZXNzZWQucHVzaChzUGF0aCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHNQYXRoID0gXCJcIjtcblx0XHRcdH1cblxuXHRcdFx0aWYgKGFTZW1hbnRpY09iamVjdHNQcm9taXNlcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0UHJvbWlzZS5hbGwoYVNlbWFudGljT2JqZWN0c1Byb21pc2VzKVxuXHRcdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChhVmFsdWVzOiBhbnlbXSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgYUdldExpbmtzUHJvbWlzZXMgPSBbXTtcblx0XHRcdFx0XHRcdGxldCBzU2VtT2JqRXhwcmVzc2lvbjtcblx0XHRcdFx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdHNSZXNvbHZlZCA9IGFWYWx1ZXMuZmlsdGVyKGZ1bmN0aW9uIChlbGVtZW50OiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGVsZW1lbnQuc2VtYW50aWNPYmplY3QgJiYgdHlwZW9mIGVsZW1lbnQuc2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRcdFx0XHRzU2VtT2JqRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKHBhdGhJbk1vZGVsKGVsZW1lbnQuc2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QuJFBhdGgpKTtcblx0XHRcdFx0XHRcdFx0XHRlbGVtZW50LnNlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0ID0gc1NlbU9iakV4cHJlc3Npb247XG5cdFx0XHRcdFx0XHRcdFx0ZWxlbWVudC5zZW1hbnRpY09iamVjdEZvckdldExpbmtzWzBdLnNlbWFudGljT2JqZWN0ID0gc1NlbU9iakV4cHJlc3Npb247XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoZWxlbWVudCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBlbGVtZW50LnNlbWFudGljT2JqZWN0ICE9PSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGZvciAobGV0IGogPSAwOyBqIDwgYVNlbWFudGljT2JqZWN0c1Jlc29sdmVkLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0XHRcdF9vU2VtYW50aWNPYmplY3QgPSBhU2VtYW50aWNPYmplY3RzUmVzb2x2ZWRbal07XG5cdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRfb1NlbWFudGljT2JqZWN0ICYmXG5cdFx0XHRcdFx0XHRcdFx0X29TZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0XHRcdFx0XHRcdCEoX29TZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdC5pbmRleE9mKFwie1wiKSA9PT0gMClcblx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0YVNlbWFudGljT2JqZWN0c0ZvckdldExpbmtzLnB1c2goX29TZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdEZvckdldExpbmtzKTtcblx0XHRcdFx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RzLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IF9vU2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QgJiYgX29TZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdFx0XHRcdHVuYXZhaWxhYmxlQWN0aW9uczogX29TZW1hbnRpY09iamVjdC51bmF2YWlsYWJsZUFjdGlvbnMsXG5cdFx0XHRcdFx0XHRcdFx0XHRwYXRoOiBhU2VtYW50aWNPYmplY3RzUmVzb2x2ZWRbal0uc2VtYW50aWNPYmplY3RQYXRoXG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0YUdldExpbmtzUHJvbWlzZXMucHVzaChvU2hlbGxTZXJ2aWNlSGVscGVyLmdldExpbmtzV2l0aENhY2hlKFtfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3NdKSk7IC8vYVNlbWFudGljT2JqZWN0c0ZvckdldExpbmtzKSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiBDb21tb25VdGlscy51cGRhdGVTZW1hbnRpY1RhcmdldHMoYUdldExpbmtzUHJvbWlzZXMsIGFTZW1hbnRpY09iamVjdHMsIG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgc0N1cnJlbnRIYXNoKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcImZuR2V0U2VtYW50aWNUYXJnZXRzRnJvbVRhYmxlOiBDYW5ub3QgZ2V0IFNlbWFudGljIE9iamVjdHNcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cbmZ1bmN0aW9uIGNsZWFyU2VsZWN0aW9uKG9UYWJsZTogYW55KSB7XG5cdG9UYWJsZS5jbGVhclNlbGVjdGlvbigpO1xuXHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKTtcblx0aWYgKG9JbnRlcm5hbE1vZGVsQ29udGV4dCkge1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImRlbGV0ZUVuYWJsZWRcIiwgZmFsc2UpO1xuXHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0c1wiLCAwKTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJzZWxlY3RlZENvbnRleHRzXCIsIFtdKTtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJkZWxldGFibGVDb250ZXh0c1wiLCBbXSk7XG5cdH1cbn1cblxuY29uc3Qgb1RhYmxlVXRpbHMgPSB7XG5cdGdldENvdW50Rm9ybWF0dGVkOiBnZXRDb3VudEZvcm1hdHRlZCxcblx0Z2V0SGlkZGVuRmlsdGVyczogZ2V0SGlkZGVuRmlsdGVycyxcblx0Z2V0RmlsdGVyc0luZm9Gb3JTVjogZ2V0RmlsdGVyc0luZm9Gb3JTVixcblx0Z2V0VGFibGVGaWx0ZXJzOiBnZXRUYWJsZUZpbHRlcnMsXG5cdGdldExpc3RCaW5kaW5nRm9yQ291bnQ6IGdldExpc3RCaW5kaW5nRm9yQ291bnQsXG5cdGdldEZpbHRlckluZm86IGdldEZpbHRlckluZm8sXG5cdGdldFAxM25GaWx0ZXJzOiBnZXRQMTNuRmlsdGVycyxcblx0Z2V0QWxsRmlsdGVySW5mbzogZ2V0QWxsRmlsdGVySW5mbyxcblx0d2hlbkJvdW5kOiB3aGVuQm91bmQsXG5cdG9uVGFibGVCb3VuZDogb25UYWJsZUJvdW5kLFxuXHRnZXRTZW1hbnRpY1RhcmdldHNGcm9tVGFibGU6IGZuR2V0U2VtYW50aWNUYXJnZXRzRnJvbVRhYmxlLFxuXHR1cGRhdGVCaW5kaW5nSW5mbzogdXBkYXRlQmluZGluZ0luZm8sXG5cdGNsZWFyU2VsZWN0aW9uOiBjbGVhclNlbGVjdGlvblxufTtcblxuZXhwb3J0IGRlZmF1bHQgb1RhYmxlVXRpbHM7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7O0VBc0JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxTQUFTQSxtQkFBbUIsQ0FBQ0MsTUFBVyxFQUFFQyxPQUFlLEVBQUU7SUFDMUQsSUFBTUMsU0FBUyxHQUFHQyxXQUFXLENBQUNDLGVBQWUsQ0FBQ0osTUFBTSxDQUFDLENBQUNLLFlBQVksRUFBRTtJQUNwRSxJQUFNQyxTQUFTLEdBQUdKLFNBQVMsQ0FBQ0ssY0FBYyxXQUFJUCxNQUFNLENBQUNRLElBQUksQ0FBQyxZQUFZLENBQUMsU0FBR1AsT0FBTyxFQUFHO01BQ25GUSxpQkFBaUIsR0FBR0MsMkJBQTJCLENBQUNKLFNBQVMsQ0FBQyxDQUFDSyxZQUFnQztNQUMzRkMsZ0JBQXFCLEdBQUcsQ0FBQyxDQUFDO01BQzFCQyxRQUFRLEdBQUcsRUFBRTtNQUNiQyxNQUFhLEdBQUcsRUFBRTtJQUNuQixJQUFJQyxLQUFLLEdBQUcsRUFBRTtJQUNkLElBQUlOLGlCQUFpQixFQUFFO01BQ3RCTSxLQUFLLEdBQUdO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