/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/ObjectPath", "sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/BusyLocker", "sap/fe/core/controllerextensions/messageHandler/messageHandling", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/ODataMetaModelUtil", "sap/m/table/Util", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/Item", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/Device", "sap/ui/dom/units/Rem", "sap/ui/mdc/field/InParameter", "sap/ui/mdc/field/OutParameter", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/FilterType", "sap/ui/model/json/JSONModel"], function (Log, ObjectPath, CommonUtils, BusyLocker, messageHandling, ModelHelper, PropertyHelper, UIFormatters, ODataMetaModelUtil, Util, Core, Fragment, Item, XMLPreprocessor, XMLTemplateProcessor, Device, Rem, InParameter, OutParameter, Filter, FilterOperator, FilterType, JSONModel) {
  "use strict";

  var system = Device.system;
  var getTypeConfig = UIFormatters.getTypeConfig;
  var getDisplayMode = UIFormatters.getDisplayMode;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getAssociatedTimezoneProperty = PropertyHelper.getAssociatedTimezoneProperty;
  var getAssociatedTextProperty = PropertyHelper.getAssociatedTextProperty;
  var getAssociatedCurrencyProperty = PropertyHelper.getAssociatedCurrencyProperty;
  var Level = Log.Level;
  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
  var waitForPromise = {};
  var aCachedValueHelp = [];
  var aSuggestCachedValueHelp = [];
  function _hasImportanceHigh(oValueListContext) {
    return oValueListContext.Parameters.some(function (oParameter) {
      return oParameter["@com.sap.vocabularies.UI.v1.Importance"] && oParameter["@com.sap.vocabularies.UI.v1.Importance"].$EnumMember === "com.sap.vocabularies.UI.v1.ImportanceType/High";
    });
  }
  function _entityIsSearchable(oValueListInfo, oPropertyAnnotations) {
    var bSearchSupported = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"] && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"].SearchSupported,
      oCollectionAnnotations = oValueListInfo.valueListInfo.$model.getMetaModel().getObject("/".concat(oValueListInfo.valueListInfo.CollectionPath, "@")) || {},
      bSearchable = oCollectionAnnotations["@Org.OData.Capabilities.V1.SearchRestrictions"] && oCollectionAnnotations["@Org.OData.Capabilities.V1.SearchRestrictions"].Searchable;
    if (bSearchable === undefined && bSearchSupported === false || bSearchable === true && bSearchSupported === false || bSearchable === false) {
      return false;
    }
    return true;
  }
  function _getCachedValueHelp(sValueHelpId) {
    return aCachedValueHelp.find(function (oVHElement) {
      return oVHElement.sVHId === sValueHelpId;
    });
  }
  function _getSuggestCachedValueHelp(sValueHelpId) {
    return aSuggestCachedValueHelp.find(function (oVHElement) {
      return oVHElement.sVHId === sValueHelpId;
    });
  }
  function _getValueHelpColumnDisplayFormat(oPropertyAnnotations, isValueHelpWithFixedValues) {
    var sDisplayMode = CommonUtils.computeDisplayMode(oPropertyAnnotations, undefined);
    var oTextAnnotation = oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"];
    var oTextArrangementAnnotation = oTextAnnotation && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"];
    if (isValueHelpWithFixedValues) {
      return oTextAnnotation && typeof oTextAnnotation !== "string" && oTextAnnotation.$Path ? sDisplayMode : "Value";
    } else {
      // Only explicit defined TextArrangements in a Value Help with Dialog are considered
      return oTextArrangementAnnotation ? sDisplayMode : "Value";
    }
  }
  function _redundantDescription(oVLParameter, aColumnInfo) {
    var oColumnInfo = aColumnInfo.find(function (columnInfo) {
      return oVLParameter.ValueListProperty === columnInfo.textColumnName;
    });
    if (oVLParameter.ValueListProperty === (oColumnInfo === null || oColumnInfo === void 0 ? void 0 : oColumnInfo.textColumnName) && !oColumnInfo.keyColumnHidden && oColumnInfo.keyColumnDisplayFormat !== "Value") {
      return true;
    }
    return undefined;
  }
  function _getDefaultSortPropertyName(oValueList) {
    var sSortFieldName;
    var metaModel = oValueList.$model.getMetaModel();
    var mEntitySetAnnotations = metaModel.getObject("/".concat(oValueList.CollectionPath, "@")) || {};
    var oSortRestrictions = mEntitySetAnnotations["@Org.OData.Capabilities.V1.SortRestrictions"] || {};
    var oSortRestrictionsInfo = ODataMetaModelUtil.getSortRestrictionsInfo(oSortRestrictions);
    var oFoundElement = oValueList.Parameters.find(function (oElement) {
      return (oElement.$Type == "com.sap.vocabularies.Common.v1.ValueListParameterInOut" || oElement.$Type == "com.sap.vocabularies.Common.v1.ValueListParameterOut" || oElement.$Type == "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly") && !(metaModel.getObject("/".concat(oValueList.CollectionPath, "/").concat(oElement.ValueListProperty, "@com.sap.vocabularies.UI.v1.Hidden")) === true);
    });
    if (oFoundElement) {
      if (metaModel.getObject("/".concat(oValueList.CollectionPath, "/").concat(oFoundElement.ValueListProperty, "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement/$EnumMember")) === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
        sSortFieldName = metaModel.getObject("/".concat(oValueList.CollectionPath, "/").concat(oFoundElement.ValueListProperty, "@com.sap.vocabularies.Common.v1.Text/$Path"));
      } else {
        sSortFieldName = oFoundElement.ValueListProperty;
      }
    }
    if (sSortFieldName && (!oSortRestrictionsInfo[sSortFieldName] || oSortRestrictionsInfo[sSortFieldName].sortable)) {
      return sSortFieldName;
    } else {
      return undefined;
    }
  }
  function _build$SelectString(control) {
    var oViewData = control.getModel("viewData");
    if (oViewData) {
      var oData = oViewData.getData();
      if (oData) {
        var aColumns = oData.columns;
        if (aColumns) {
          return aColumns.reduce(function (sQuery, oProperty) {
            // Navigation properties (represented by X/Y) should not be added to $select.
            // TODO : They should be added as $expand=X($select=Y) instead
            if (oProperty.path && oProperty.path.indexOf("/") === -1) {
              sQuery = sQuery ? "".concat(sQuery, ",").concat(oProperty.path) : oProperty.path;
            }
            return sQuery;
          }, undefined);
        }
      }
    }
    return undefined;
  }
  function _getConditionPath(oMetaModel, sEntitySet, sProperty) {
    var aParts = sProperty.split("/");
    var sPartialPath,
      sConditionPath = "";
    while (aParts.length) {
      var sPart = aParts.shift();
      sPartialPath = sPartialPath ? "".concat(sPartialPath, "/").concat(sPart) : sPart;
      var oProperty = oMetaModel.getObject("".concat(sEntitySet, "/").concat(sPartialPath));
      if (oProperty && oProperty.$kind === "NavigationProperty" && oProperty.$isCollection) {
        sPart += "*";
      }
      sConditionPath = sConditionPath ? "".concat(sConditionPath, "/").concat(sPart) : sPart;
    }
    return sConditionPath;
  }
  function _getColumnDefinitionFromSelectionFields(oMetaModel, sEntitySet) {
    var aColumnDefs = [],
      aSelectionFields = oMetaModel.getObject("".concat(sEntitySet, "/@com.sap.vocabularies.UI.v1.SelectionFields"));
    if (aSelectionFields) {
      aSelectionFields.forEach(function (oSelectionField) {
        var sSelectionFieldPath = "".concat(sEntitySet, "/").concat(oSelectionField.$PropertyPath),
          sConditionPath = _getConditionPath(oMetaModel, sEntitySet, oSelectionField.$PropertyPath),
          oPropertyAnnotations = oMetaModel.getObject("".concat(sSelectionFieldPath, "@")),
          oColumnDef = {
            path: sConditionPath,
            label: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sSelectionFieldPath,
            sortable: true,
            filterable: CommonUtils.isPropertyFilterable(oMetaModel, sEntitySet, oSelectionField.$PropertyPath, false),
            $Type: oMetaModel.getObject(sSelectionFieldPath).$Type
          };
        aColumnDefs.push(oColumnDef);
      });
    }
    return aColumnDefs;
  }
  var ValueListHelper = {
    ALLFRAGMENTS: undefined,
    logFragment: undefined,
    initializeCachedValueHelp: function () {
      // Destroy existing MDC value help objects
      aCachedValueHelp.forEach(function (oValueHelp) {
        if (!oValueHelp.oVHFilterBar.isDestroyed()) {
          oValueHelp.oVHFilterBar.destroy();
        }
        if (!oValueHelp.oVHDialogTable.isDestroyed()) {
          oValueHelp.oVHDialogTable.destroy();
        }
      });
      // initialize cache
      aCachedValueHelp = [];
      aSuggestCachedValueHelp = [];
    },
    getColumnVisibilityInfo: function (oValueList, sPropertyFullPath, bIsDropDownListe, isDialogTable) {
      var oMetaModel = oValueList.$model.getMetaModel();
      var aColumnInfos = [];
      var oColumnInfos = {
        isDialogTable: isDialogTable,
        columnInfos: aColumnInfos
      };
      oValueList.Parameters.forEach(function (oParameter) {
        var oPropertyAnnotations = oMetaModel.getObject("/".concat(oValueList.CollectionPath, "/").concat(oParameter.ValueListProperty, "@"));
        var oTextAnnotation = oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"];
        var columnInfo = {};
        if (oTextAnnotation) {
          columnInfo = {
            keyColumnHidden: oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false,
            keyColumnDisplayFormat: oTextAnnotation && _getValueHelpColumnDisplayFormat(oPropertyAnnotations, bIsDropDownListe),
            textColumnName: oTextAnnotation && oTextAnnotation.$Path,
            columnName: oParameter.ValueListProperty,
            hasHiddenAnnotation: oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false
          };
        } else if (oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"]) {
          columnInfo = {
            columnName: oParameter.ValueListProperty,
            hasHiddenAnnotation: oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] ? true : false
          };
        }
        oColumnInfos.columnInfos.push(columnInfo);
      });
      return oColumnInfos;
    },
    // This function is used for value help m-table and mdc-table
    getColumnVisibility: function (oValueList, oVLParameter, oSource) {
      var isDropDownList = oSource && !!oSource.valueHelpWithFixedValues,
        oColumnInfo = oSource.columnInfo,
        isVisible = !_redundantDescription(oVLParameter, oColumnInfo.columnInfos),
        isDialogTable = oColumnInfo.isDialogTable;
      if (isDropDownList || !isDropDownList && isDialogTable || !isDropDownList && !_hasImportanceHigh(oValueList)) {
        var columnWithHiddenAnnotation = oColumnInfo.columnInfos.find(function (columnInfo) {
          return oVLParameter.ValueListProperty === columnInfo.columnName && columnInfo.hasHiddenAnnotation === true;
        });
        return !columnWithHiddenAnnotation ? isVisible : false;
      } else if (!isDropDownList && _hasImportanceHigh(oValueList)) {
        return oVLParameter && oVLParameter["@com.sap.vocabularies.UI.v1.Importance"] && oVLParameter["@com.sap.vocabularies.UI.v1.Importance"].$EnumMember === "com.sap.vocabularies.UI.v1.ImportanceType/High" ? true : false;
      }
      return true;
    },
    getSortConditionsFromPresentationVariant: function (oValueList, bSuggestion) {
      var sPresentationVariantQualifier = oValueList.PresentationVariantQualifier === "" ? "" : "#".concat(oValueList.PresentationVariantQualifier),
        sPresentationVariantPath = "/".concat(oValueList.CollectionPath, "/@com.sap.vocabularies.UI.v1.PresentationVariant").concat(sPresentationVariantQualifier);
      var oPresentationVariant = oValueList.$model.getMetaModel().getObject(sPresentationVariantPath);
      if (oPresentationVariant && oPresentationVariant.SortOrder) {
        var sSortConditions = {
          sorters: []
        };
        if (bSuggestion) {
          oPresentationVariant.SortOrder.forEach(function (oCondition) {
            var oSorter = {};
            oSorter.path = oCondition.Property.$PropertyPath;
            if (oCondition.Descending) {
              oSorter.descending = true;
            } else {
              oSorter.ascending = true;
            }
            sSortConditions.sorters.push(oSorter);
          });
          return "sorter: ".concat(JSON.stringify(sSortConditions.sorters));
        } else {
          oPresentationVariant.SortOrder.forEach(function (oCondition) {
            var oSorter = {};
            oSorter.name = oCondition.Property.$PropertyPath;
            if (oCondition.Descending) {
              oSorter.descending = true;
            } else {
              oSorter.ascending = true;
            }
            sSortConditions.sorters.push(oSorter);
          });
          return JSON.stringify(sSortConditions);
        }
      }
      return undefined;
    },
    hasImportance: function (oValueListContext) {
      return _hasImportanceHigh(oValueListContext.getObject()) ? "Importance/High" : "None";
    },
    getMinScreenWidth: function (oValueList) {
      return _hasImportanceHigh(oValueList) ? "{= ${_VHUI>/minScreenWidth}}" : "416px";
    },
    getTableItemsParameters: function (oValueList, sRequestGroupId, bSuggestion, bValueHelpWithFixedValues) {
      var sParameters = "";
      var bSuspended = oValueList.Parameters.some(function (oParameter) {
        return bSuggestion || oParameter.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterIn";
      });
      if (sRequestGroupId) {
        sParameters = ", parameters: {$$groupId: '" + sRequestGroupId + "'";
      }

      // add select to oBindingInfo (BCP 2180255956 / 2170163012)
      var sSelect = _build$SelectString(this);
      if (sSelect) {
        if (sParameters.length > 0) {
          sParameters = sParameters + ", '" + sSelect + "'";
        } else {
          sParameters = ", parameters: {$select: '" + sSelect + "'";
        }
      }
      if (sParameters.length > 0) {
        sParameters = sParameters + " }";
      }
      var sLengthParameter = bValueHelpWithFixedValues ? "" : ", length: 10",
        sSortConditionsFromPresentationVariant = ValueListHelper.getSortConditionsFromPresentationVariant(oValueList, bSuggestion),
        sSortConditionsParameter = sSortConditionsFromPresentationVariant ? ", " + sSortConditionsFromPresentationVariant + "}" : "}";
      return "{path: '/" + oValueList.CollectionPath + "'" + sParameters + ", suspended : " + bSuspended + sLengthParameter + sSortConditionsParameter;
    },
    getTableDelegate: function (oValueList) {
      var sDefaultSortPropertyName = _getDefaultSortPropertyName(oValueList);
      if (sDefaultSortPropertyName) {
        sDefaultSortPropertyName = "'".concat(sDefaultSortPropertyName, "'");
      }
      return "{name: 'sap/fe/macros/internal/valuehelp/TableDelegate', payload: {collectionName: '" + oValueList.CollectionPath + "'" + (sDefaultSortPropertyName ? ", defaultSortPropertyName: " + sDefaultSortPropertyName : "") + "}}";
    },
    getPropertyPath: function (oParameters) {
      return !oParameters.UnboundAction ? "".concat(oParameters.EntityTypePath, "/").concat(oParameters.Action, "/").concat(oParameters.Property) : "/".concat(oParameters.Action.substring(oParameters.Action.lastIndexOf(".") + 1), "/").concat(oParameters.Property);
    },
    getWaitForPromise: function () {
      return waitForPromise;
    },
    getValueListCollectionEntitySet: function (oValueListContext) {
      var mValueList = oValueListContext.getObject();
      return mValueList.$model.getMetaModel().createBindingContext("/".concat(mValueList.CollectionPath));
    },
    getValueListProperty: function (oPropertyContext) {
      var oValueListModel = oPropertyContext.getModel();
      var mValueList = oValueListModel.getObject("/");
      return mValueList.$model.getMetaModel().createBindingContext("/".concat(mValueList.CollectionPath, "/").concat(oPropertyContext.getObject()));
    },
    getValueListInfoWithUseCaseSensitive: function (oValueListInfo) {
      var sCollectionPath = oValueListInfo.valueListInfo.CollectionPath,
        oMetaModel = oValueListInfo.valueListInfo.$model.getMetaModel();
      return Promise.all([oMetaModel.requestObject("/".concat(sCollectionPath, "@Org.OData.Capabilities.V1.FilterFunctions")), oMetaModel.requestObject("/@Org.OData.Capabilities.V1.FilterFunctions")]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
          entityFilterFunctions = _ref2[0],
          containerFilterFunctions = _ref2[1];
        var filterFunctions = entityFilterFunctions || containerFilterFunctions;
        oValueListInfo.useCaseSensitive = filterFunctions ? filterFunctions.indexOf("tolower") === -1 : true;
        return oValueListInfo;
      }).catch(function (err) {
        Log.error("error trying to get the value help entitySet capabilities");
        throw err;
      });
    },
    getValueListInfo: function (oFVH, oMetaModel, propertyPath, sConditionModel, oProperties) {
      var sKey,
        sDescriptionPath,
        sPropertyPath,
        sFieldPropertyPath = "";
      var sPropertyName = oMetaModel.getObject("".concat(propertyPath, "@sapui.name")),
        aInParameters = [],
        aOutParameters = [];
      // Adding bAutoExpandSelect (second parameter of requestValueListInfo) as true by default
      return oMetaModel.requestValueListInfo(propertyPath, true, oFVH.getBindingContext()).then(function (mValueListInfo) {
        var bProcessInOut = oFVH.getInParameters().length + oFVH.getOutParameters().length === 0,
          oVHUIModel = oFVH.getModel("_VHUI"),
          qualifierForValidation = oFVH.data("valuelistForValidation"),
          bSuggestion = oVHUIModel.getProperty("/isSuggestion"),
          hasValueListRelevantQualifiers = oVHUIModel.getProperty("/hasValueListRelevantQualifiers"),
          aCollectiveSearchItems = oFVH.getAggregation("collectiveSearchItems") || [],
          aValueHelpKeys = Object.keys(mValueListInfo),
          indexDefaultVH = aValueHelpKeys.indexOf(""),
          isValueListWithFixedValues = oFVH.getModel().getMetaModel().getObject("".concat(propertyPath, "@"))["@com.sap.vocabularies.Common.v1.ValueListWithFixedValues"];
        var sValueHelpId,
          sValueHelpQualifier = aValueHelpKeys[0];
        // ValueHelp w/o qualifier should be the first
        if (indexDefaultVH && indexDefaultVH > 0) {
          aValueHelpKeys.unshift(aValueHelpKeys[indexDefaultVH]);
          aValueHelpKeys.splice(indexDefaultVH + 1, 1);
        }
        // No valid qualifier should be handled in mdc
        if (sValueHelpQualifier === undefined) {
          return oFVH.getModel("_VHUI").setProperty("/noValidValueHelp", true);
        }
        // Multiple/Collective ValueHelp and/or ContextDependentValueHelp (ContextDependentValueHelp not used in LR-Filterbar, Action/Create-Dialog)
        if (hasValueListRelevantQualifiers || aValueHelpKeys.length > 1 || aCollectiveSearchItems.length > 1) {
          // Value help with ValueListWithFixedValues returns always key "", the $qualifier contains the value help qualifier
          if (isValueListWithFixedValues) {
            sValueHelpId = mValueListInfo[""].$qualifier === "" ? "".concat(oFVH.getId(), "::non-qualifier") : "".concat(oFVH.getId(), "::qualifier::").concat(mValueListInfo[""].$qualifier);
            // Store in ValueHelp model
            oVHUIModel.setProperty("/valueHelpId", sValueHelpId);
            mValueListInfo = mValueListInfo[""];
          } else if (bSuggestion && aValueHelpKeys.indexOf(qualifierForValidation) > -1) {
            // In case of type-ahead the avaiable qualifer for validation is used
            sValueHelpId = qualifierForValidation === "" ? "".concat(oFVH.getId(), "::non-qualifier") : "".concat(oFVH.getId(), "::qualifier::").concat(qualifierForValidation);
            // Store in ValueHelp model
            oVHUIModel.setProperty("/valueHelpId", sValueHelpId);
            oVHUIModel.setProperty("/collectiveSearchKey", qualifierForValidation);
            mValueListInfo = mValueListInfo[qualifierForValidation];
            oFVH.setProperty("validateInput", true);
          } else {
            // In case of context is changes --> may be collectiveSearchItem needs to be removed
            aCollectiveSearchItems.forEach(function (oItem) {
              if (!aValueHelpKeys.includes(oItem.getKey())) {
                oFVH.removeAggregation("collectiveSearchItems", oItem);
              }
            });
            // Drop-down (vh selection) only visible if more then 1 VH
            if (aValueHelpKeys.length === 1) {
              oFVH.removeAllAggregation("collectiveSearchItems");
              oProperties.collectiveSearchKey = undefined;
            } else {
              aValueHelpKeys.forEach(function (sValueHelpKey) {
                if (aCollectiveSearchItems.filter(function (oItem) {
                  return oItem.getKey() === sValueHelpKey;
                }).length === 0) {
                  oFVH.addAggregation("collectiveSearchItems", new Item({
                    key: sValueHelpKey,
                    text: mValueListInfo[sValueHelpKey].Label,
                    enabled: true
                  }));
                }
              });
            }
            if (oProperties && oProperties.collectiveSearchKey !== undefined) {
              sValueHelpQualifier = oProperties.collectiveSearchKey;
            } else if (oProperties && oProperties.collectiveSearchKey === undefined) {
              sValueHelpQualifier = aValueHelpKeys[0];
              oProperties.collectiveSearchKey = aValueHelpKeys[0];
            }
            // Build ValueHelp Id
            sValueHelpId = sValueHelpQualifier === "" ? "".concat(oFVH.getId(), "::non-qualifier") : "".concat(oFVH.getId(), "::qualifier::").concat(sValueHelpQualifier);
            // Store in ValueHelp model
            oFVH.getModel("_VHUI").setProperty("/valueHelpId", sValueHelpId);
            oFVH.getModel("_VHUI").setProperty("/collectiveSearchKey", sValueHelpQualifier);
            // Get ValueHelp by qualifier
            mValueListInfo = mValueListInfo[sValueHelpQualifier];
            if (!oFVH.getParent().isA("sap.ui.mdc.FilterBar") && bSuggestion && qualifierForValidation !== sValueHelpQualifier) {
              oFVH.setProperty("validateInput", false);
            }
          }
        } else {
          // Default ValueHelp (the first/only one) is normally ValueHelp w/o qualifier
          mValueListInfo = mValueListInfo[sValueHelpQualifier];
        }
        var sContextPrefix = "";
        var bConsiderInOut = ValueListHelper.considerInOutParameter(oFVH, propertyPath);
        if (oFVH.data("useMultiValueField") === "true" && oFVH.getBindingContext() && oFVH.getBindingContext().getPath()) {
          var aBindigContextParts = oFVH.getBindingContext().getPath().split("/");
          var aPropertyBindingParts = propertyPath.split("/");
          if (aPropertyBindingParts.length - aBindigContextParts.length > 1) {
            var aContextPrefixParts = [];
            for (var i = aBindigContextParts.length; i < aPropertyBindingParts.length - 1; i++) {
              aContextPrefixParts.push(aPropertyBindingParts[i]);
            }
            sContextPrefix = "".concat(aContextPrefixParts.join("/"), "/");
          }
        }

        // Add column definitions for properties defined as Selection fields on the CollectionPath entity set.
        var oSubMetaModel = mValueListInfo.$model.getMetaModel(),
          sEntitySetPath = "/".concat(mValueListInfo.CollectionPath),
          aColumnDefs = _getColumnDefinitionFromSelectionFields(oSubMetaModel, sEntitySetPath),
          aParentFFNames = ValueListHelper.getParentFilterFieldNames(oFVH);

        // Determine the settings
        // TODO: since this is a static function we can't store the infos when filterbar is requested later
        mValueListInfo.Parameters.forEach(function (entry) {
          //All String fields are allowed for filter
          sPropertyPath = "/".concat(mValueListInfo.CollectionPath, "/").concat(entry.ValueListProperty);
          var oProperty = mValueListInfo.$model.getMetaModel().getObject(sPropertyPath),
            oPropertyAnnotations = mValueListInfo.$model.getMetaModel().getObject("".concat(sPropertyPath, "@")) || {};

          // If oProperty is undefined, then the property coming for the entry isn't defined in
          // the metamodel, therefore we don't need to add it in the in/out parameters
          if (oProperty) {
            // Search for the *out Parameter mapped to the local property
            if (!sKey && entry.$Type.indexOf("Out") > 48 && entry.LocalDataProperty.$PropertyPath === sPropertyName) {
              //"com.sap.vocabularies.Common.v1.ValueListParameter".length = 49
              sFieldPropertyPath = sPropertyPath;
              sKey = entry.ValueListProperty;
              //Only the text annotation of the key can specify the description
              sDescriptionPath = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path;
            }
            if (bConsiderInOut) {
              //Collect In and Out Parameter (except the field in question)
              if (bProcessInOut && entry.$Type !== "com.sap.vocabularies.Common.v1.ValueListParameterDisplayOnly" && entry.$Type !== "com.sap.vocabularies.Common.v1.ValueListParameterConstant" && entry.LocalDataProperty && entry.LocalDataProperty.$PropertyPath !== sPropertyName) {
                var sValuePath = "";
                if (sConditionModel && sConditionModel.length > 0) {
                  if (oFVH.getParent().isA("sap.ui.mdc.Table") && oFVH.getBindingContext() && entry.$Type.indexOf("In") > 48) {
                    // Special handling for value help used in filter dialog
                    var aParts = entry.LocalDataProperty.$PropertyPath.split("/");
                    if (aParts.length > 1) {
                      var sFirstNavigationProperty = aParts[0];
                      var oBoundEntity = oFVH.getModel().getMetaModel().getMetaContext(oFVH.getBindingContext().getPath());
                      var sPathOfTable = oFVH.getParent().getRowBinding().getPath();
                      if (oBoundEntity.getObject("".concat(sPathOfTable, "/$Partner")) === sFirstNavigationProperty) {
                        // Using the condition model doesn't make any sense in case an in-parameter uses a navigation property
                        // referring to the partner. Therefore reducing the path and using the FVH context instead of the condition model
                        sValuePath = "{" + entry.LocalDataProperty.$PropertyPath.replace(sFirstNavigationProperty + "/", "") + "}";
                      }
                    }
                  }
                  if (!sValuePath) {
                    sValuePath = "{" + sConditionModel + ">/conditions/" + entry.LocalDataProperty.$PropertyPath + "}";
                  }
                } else {
                  sValuePath = "{" + sContextPrefix + entry.LocalDataProperty.$PropertyPath + "}";
                }

                //Out and InOut
                if (entry.$Type.indexOf("Out") > 48) {
                  if (!aParentFFNames || aParentFFNames.indexOf(entry.LocalDataProperty.$PropertyPath) > -1) {
                    // Filterbar inside VH doesn't have Adapt Filters dialog. Getting Filterfields for which out parameters can be applied.
                    aOutParameters.push(new OutParameter({
                      value: sValuePath,
                      helpPath: entry.ValueListProperty
                    }));
                  }
                }
                //In and InOut
                if (entry.$Type.indexOf("In") > 48) {
                  aInParameters.push(new InParameter({
                    value: sValuePath,
                    helpPath: entry.ValueListProperty,
                    initialValueFilterEmpty: entry.InitialValueIsSignificant
                  }));
                }
                //otherwise displayOnly and therefor not considered
              }
            }
            // Collect Constant Parameter
            // We manage constants parameters as in parameters so this the value list table is filtered properly
            if (entry.$Type === "com.sap.vocabularies.Common.v1.ValueListParameterConstant") {
              aInParameters.push(new InParameter({
                value: entry.Constant,
                helpPath: entry.ValueListProperty
              }));
            }
            var sColumnPath = entry.ValueListProperty,
              sColumnPropertyType = oProperty.$Type;
            var sLabel = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Label"] || sColumnPath;
            if (oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"] && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"] && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"].$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
              // the column property is the one coming from the text annotation
              sColumnPath = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"].$Path;
              var sTextPropertyPath = "/".concat(mValueListInfo.CollectionPath, "/").concat(sColumnPath);
              sColumnPropertyType = mValueListInfo.$model.getMetaModel().getObject(sTextPropertyPath).$Type;
            }
            var bColumnNotAlreadyDefined = aColumnDefs.findIndex(function (oCol) {
              return oCol.path === sColumnPath;
            }) === -1;
            if (bColumnNotAlreadyDefined) {
              var oColumnDef = {
                path: sColumnPath,
                label: sLabel,
                sortable: true,
                filterable: !oPropertyAnnotations["@com.sap.vocabularies.UI.v1.HiddenFilter"],
                $Type: sColumnPropertyType
              };
              aColumnDefs.push(oColumnDef);
            }
          }
        });
        // Find DescriptionPath in column definition if not add it
        if (sDescriptionPath && aColumnDefs.findIndex(function (oColumn) {
          return oColumn.path === sDescriptionPath;
        }) === -1) {
          var oColumnDef = {
            path: sDescriptionPath,
            label: sDescriptionPath,
            sortable: false,
            filterable: false,
            $Type: "Edm.String"
          };
          aColumnDefs.push(oColumnDef);
        }
        return {
          keyValue: sKey,
          descriptionValue: sDescriptionPath,
          fieldPropertyPath: sFieldPropertyPath,
          inParameters: aInParameters,
          outParameters: aOutParameters,
          valueListInfo: mValueListInfo,
          columnDefs: aColumnDefs
        };
      }).catch(function (exc) {
        var sMsg = exc.status && exc.status === 404 ? "Metadata not found (".concat(exc.status, ") for value help of property ").concat(propertyPath) : exc.message;
        Log.error(sMsg);
        oFVH.destroyContent();
      });
    },
    // For value helps in the filter bar on List Report, In/Out parameters of a navigation property
    // like "SalesorderManage/_Item/Material" are not supported (yet) as they cannot be easily resolved.
    considerInOutParameter: function (oFVH, propertyPath) {
      var bindingContext = oFVH.getBindingContext(),
        metaModel = oFVH.getModel().getMetaModel();
      // on the Listreport there is no bindingContext
      if (!bindingContext) {
        var subPath = propertyPath;
        var metaModelFromsubPath = metaModel.getObject(subPath);
        var checkBeAction = null;
        while (subPath.length > 0) {
          var _checkBeAction;
          checkBeAction = Array.isArray(metaModelFromsubPath) ? metaModelFromsubPath[0] : metaModelFromsubPath;
          // In/Out parameters shall be considered if we handle a Action aParameter
          if (((_checkBeAction = checkBeAction) === null || _checkBeAction === void 0 ? void 0 : _checkBeAction.$kind) === "Action") {
            return true;
          } else if (checkBeAction.$kind === "NavigationProperty") {
            return false;
          }
          subPath = subPath.substring(0, subPath.lastIndexOf("/"));
          metaModelFromsubPath = metaModel.getObject(subPath);
        }
      }
      return true;
    },
    getParentFilterFieldNames: function (oFVH) {
      var aParentFFNames;
      if (oFVH.getParent().isA("sap.ui.mdc.filterbar.vh.FilterBar") || oFVH.getParent().isA("sap.fe.core.controls.FilterBar")) {
        var oFB = oFVH.getParent();
        var aParentFilterFields = oFB.getFilterItems();
        aParentFFNames = aParentFilterFields.map(function (oFF) {
          return oFF.getFieldPath();
        });
      }
      return aParentFFNames;
    },
    _templateFragment: function (sFragmentName, oValueListInfo, oSourceModel, propertyPath, oAdditionalViewData) {
      var oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"),
        mValueListInfo = oValueListInfo.valueListInfo,
        oValueListModel = new JSONModel(mValueListInfo),
        oValueListServiceMetaModel = mValueListInfo.$model.getMetaModel(),
        oViewData = new JSONModel(Object.assign({
          converterType: "ListReport",
          columns: oValueListInfo.columnDefs || null
        }, oAdditionalViewData));
      return Promise.resolve(XMLPreprocessor.process(oFragment, {
        name: sFragmentName
      }, {
        //querySelector("*")
        bindingContexts: {
          valueList: oValueListModel.createBindingContext("/"),
          contextPath: oValueListServiceMetaModel.createBindingContext("/".concat(mValueListInfo.CollectionPath, "/")),
          source: oSourceModel.createBindingContext("/")
        },
        models: {
          valueList: oValueListModel,
          contextPath: oValueListServiceMetaModel,
          source: oSourceModel,
          metaModel: oValueListServiceMetaModel,
          viewData: oViewData
        }
      })).then(function (oSubFragment) {
        var oLogInfo = {
          path: propertyPath,
          fragmentName: sFragmentName,
          fragment: oSubFragment
        };
        if (Log.getLevel() === Level.DEBUG) {
          //In debug mode we log all generated fragments
          ValueListHelper.ALLFRAGMENTS = ValueListHelper.ALLFRAGMENTS || [];
          ValueListHelper.ALLFRAGMENTS.push(oLogInfo);
        }
        if (ValueListHelper.logFragment) {
          //One Tool Subscriber allowed
          setTimeout(function () {
            ValueListHelper.logFragment(oLogInfo);
          }, 0);
        }
        return Fragment.load({
          definition: oSubFragment
        });
      });
    },
    createValueHelpDialog: function (propertyPath, oFVH, oTable, oFilterBar, oValueListInfo, bSuggestion) {
      var _this = this;
      var sFVHClass = oFVH.getMetadata().getName(),
        oWrapper = oFVH.getDialogContent && oFVH.getDialogContent(),
        sWrapperId = oWrapper && oWrapper.getId(),
        sValueHelpId = oFVH.getModel("_VHUI").getProperty("/valueHelpId");
      var oPropertyAnnotations = oFVH.getModel().getMetaModel().getObject("".concat(propertyPath, "@"));

      //Only do this in case of context dependent value helps or other VH called the first time
      if ((!oTable || sValueHelpId !== undefined) && sFVHClass.indexOf("FieldValueHelp") > -1) {
        //Complete the field value help control
        oFVH.setTitle(oValueListInfo.valueListInfo.Label);
        oFVH.setKeyPath(oValueListInfo.keyValue);
        oFVH.setDescriptionPath(oValueListInfo.descriptionValue);
        oFVH.setFilterFields(_entityIsSearchable(oValueListInfo, oPropertyAnnotations) ? "$search" : "");
      }
      var isDialogTable = true;
      var bIsDropDownListe = false;
      var oColumnInfo = ValueListHelper.getColumnVisibilityInfo(oValueListInfo.valueListInfo, propertyPath, bIsDropDownListe, isDialogTable);
      var oSourceModel = new JSONModel({
        id: sValueHelpId || oFVH.getId(),
        groupId: oFVH.data("requestGroupId") || undefined,
        bSuggestion: bSuggestion,
        columnInfo: oColumnInfo,
        valueHelpWithFixedValues: bIsDropDownListe,
        isFieldValueHelp: true
      });
      oTable = oTable || ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListDialogTable", oValueListInfo, oSourceModel, propertyPath, {
        enableAutoColumnWidth: !system.phone
      });
      oFilterBar = oFilterBar || ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListFilterBar", oValueListInfo, oSourceModel, propertyPath);
      return Promise.all([oTable, oFilterBar]).then(function (aControls) {
        var sInValueHelpId = oFVH.getModel("_VHUI").getProperty("/valueHelpId"),
          oInTable = aControls[0],
          oInFilterBar = aControls[1];
        if (oInTable) {
          oInTable.setModel(oValueListInfo.valueListInfo.$model);
          Log.info("Value List - Dialog Table - XML content created [".concat(propertyPath, "]"), oInTable.getMetadata().getName(), "MDC Templating");
        }
        if (oInFilterBar) {
          oInFilterBar.setModel(oValueListInfo.valueListInfo.$model);
          Log.info("Value List- Filterbar - XML content created [".concat(propertyPath, "]"), oInFilterBar.getMetadata().getName(), "MDC Templating");
        }
        if (oInFilterBar && oInFilterBar !== oFVH.getFilterBar() || oInFilterBar && sInValueHelpId !== undefined) {
          oFVH.setFilterBar(oInFilterBar);
        } else {
          oFVH.addDependent(oInFilterBar);
        }
        if (oInTable !== oWrapper.getTable() || sInValueHelpId !== undefined) {
          oWrapper.setTable(oInTable);
          if (oInFilterBar) {
            oInTable.setFilter(oInFilterBar.getId());
          }
          oInTable.initialized();
          delete waitForPromise[sWrapperId];
        }
        // Different table width for type-ahead or dialog
        var sTableWidth = _this.getTableWidth(oInTable, _this._getWidthInRem(oFVH._getField()));
        oFVH.getModel("_VHUI").setProperty("/tableWidth", sTableWidth);
        oInTable.setWidth("100%");
        // VH-Cache: In case of type-ahead only table is created, in case of VH-dialog the filterbar is created and needs to be cached
        if (sInValueHelpId !== undefined) {
          var oSelectedCacheItem = _getCachedValueHelp(sInValueHelpId);
          if (!oSelectedCacheItem) {
            aCachedValueHelp.push({
              sVHId: sInValueHelpId,
              oVHDialogTable: oInTable,
              oVHFilterBar: oInFilterBar
            });
          } else if (oSelectedCacheItem && oSelectedCacheItem.oVHFilterBar === false) {
            aCachedValueHelp[aCachedValueHelp.indexOf(oSelectedCacheItem)].oVHFilterBar = oInFilterBar;
          }
        }
        // Do not rebind in case of fetch eq 2 and table is already bound, autoBindOnInit is always false
        if (!oInTable.isTableBound() && ValueListHelper.fetchValuesOnInitialLoad(oValueListInfo.valueListInfo)) {
          oInTable.rebind();
        }
      });
    },
    createValueHelpSuggest: function (propertyPath, oFVH, oTable, oValueListInfo, bSuggestion) {
      var _this2 = this;
      var oWrapper = oFVH.getSuggestContent && oFVH.getSuggestContent(),
        sWrapperId = oWrapper && oWrapper.getId(),
        sFVHClass = oFVH.getMetadata().getName(),
        sValueHelpId = oFVH.getModel("_VHUI").getProperty("/valueHelpId");
      var oPropertyAnnotations = oFVH.getModel().getMetaModel().getObject("".concat(propertyPath, "@"));

      //Only do this in case of context dependent value helps or other VH called the first time
      if ((!oTable || sValueHelpId !== undefined) && sFVHClass.indexOf("FieldValueHelp") > -1) {
        //Complete the field value help control
        oFVH.setTitle(oValueListInfo.valueListInfo.Label);
        oFVH.setKeyPath(oValueListInfo.keyValue);
        oFVH.setDescriptionPath(oValueListInfo.descriptionValue);
        oFVH.setFilterFields(_entityIsSearchable(oValueListInfo, oPropertyAnnotations) ? "$search" : "");
      }
      var bIsDropDownListe = oFVH.getModel().getMetaModel().getObject("".concat(propertyPath, "@"))["@com.sap.vocabularies.Common.v1.ValueListWithFixedValues"];
      var isDialogTable = false;
      var oColumnInfo = ValueListHelper.getColumnVisibilityInfo(oValueListInfo.valueListInfo, propertyPath, bIsDropDownListe, isDialogTable);
      var oSourceModel = new JSONModel({
        id: sValueHelpId || oFVH.getId(),
        groupId: oFVH.data("requestGroupId") || undefined,
        bSuggestion: bSuggestion,
        propertyPath: propertyPath,
        columnInfo: oColumnInfo,
        valueHelpWithFixedValues: bIsDropDownListe
      });
      oTable = oTable || ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListTable", oValueListInfo, oSourceModel, propertyPath);
      return Promise.all([oTable]).then(function (aControls) {
        var sTableWidth;
        var oInTable = aControls[0];
        if (oInTable) {
          oInTable.setModel(oValueListInfo.valueListInfo.$model);
          var oBinding = oInTable.getBinding("items");
          oBinding.attachEventOnce("dataRequested", function () {
            BusyLocker.lock(oInTable);
          });
          oBinding.attachEvent("dataReceived", function (oEvent) {
            var sParentId = oFVH.getParent().getId();
            var oMessageManager = Core.getMessageManager();
            if (BusyLocker.isLocked(oInTable)) {
              BusyLocker.unlock(oInTable);
            }
            // Handle messages related to input with invalid token
            if (oEvent.getParameter("error")) {
              var sErrorMessage = oEvent.getParameter("error").error.message;
              var _updateMessage = function (oMessage) {
                if (sParentId.indexOf("APD_::") === 0 && sErrorMessage === oMessage.message) {
                  oMessage.target = sParentId;
                  oFVH._oConditions.$search = undefined;
                }
                return oMessage;
              };
              // use timeout as the messages are otherwise not yet in the message model
              setTimeout(function () {
                messageHandling.getMessages().forEach(function (oMessage) {
                  _updateMessage(oMessage);
                });
              }, 0);
            } else {
              oMessageManager.getMessageModel().getData().forEach(function (oMessage) {
                if (oMessage.target.includes(sParentId) && oMessage.controlIds.length === 0) {
                  oMessage.target = "";
                }
              });
            }
          });

          //If the entity is DraftEnabled add a DraftFilter
          if (ModelHelper.isDraftSupported(oBinding.getModel().getMetaModel(), oBinding.getPath())) {
            oBinding.filter(new Filter("IsActiveEntity", FilterOperator.EQ, true), FilterType.Control);
          }
          Log.info("Value List- suggest Table XML content created [".concat(propertyPath, "]"), oInTable.getMetadata().getName(), "MDC Templating");
        }
        if (oInTable !== oWrapper.getTable() || sValueHelpId !== undefined) {
          oWrapper.setTable(oInTable);
          oInTable.attachEventOnce("updateFinished", function () {
            oWrapper.invalidate(oInTable);
          });
          delete waitForPromise[sWrapperId];
        }
        var isUnitValueHelp = oFVH.data("sourcePath") !== oFVH.data("originalPropertyPath");

        // handling of table-width for special case of predefined filter-bar variant where filter-field is not available yet
        var oFilterField = oFVH._getField();
        if (oFilterField.isA("sap.ui.mdc.FilterField") || oFilterField.isA("sap.ui.mdc.Field") || oFilterField.isA("sap.ui.mdc.MultiValueField")) {
          sTableWidth = _this2.getTableWidth(oInTable, _this2._getWidthInRem(oFilterField, isUnitValueHelp));
          oFVH.getModel("_VHUI").setProperty("/tableWidth", sTableWidth);
          oInTable.setWidth(sTableWidth);
        } else {
          oFVH.getModel("_VHUI").setProperty("/tableWidth", undefined); // set to undefined in order to be checked later in showValueListInfo
        }

        if (sValueHelpId !== undefined) {
          var oSelectedCacheItem = _getSuggestCachedValueHelp(sValueHelpId);
          if (!oSelectedCacheItem) {
            aSuggestCachedValueHelp.push({
              sVHId: sValueHelpId,
              oVHSuggestTable: oInTable
            });
          }
        }
      });
    },
    _getWidthInRem: function (oControl, isUnitValueHelp) {
      var $width = oControl.$().width();
      if (isUnitValueHelp && $width) {
        $width = 0.3 * $width;
      }
      var fWidth = $width ? parseFloat(Rem.fromPx($width)) : 0;
      return isNaN(fWidth) ? 0 : fWidth;
    },
    getTableWidth: function (oTable, fMinWidth) {
      var sWidth;
      var aColumns = oTable.getColumns(),
        aVisibleColumns = aColumns && aColumns.filter(function (oColumn) {
          return oColumn && oColumn.getVisible && oColumn.getVisible();
        }) || [],
        iSumWidth = aVisibleColumns.reduce(function (fSum, oColumn) {
          sWidth = oColumn.getWidth();
          if (sWidth && sWidth.endsWith("px")) {
            sWidth = Rem.fromPx(sWidth);
          }
          var fWidth = parseFloat(sWidth);
          return fSum + (isNaN(fWidth) ? 9 : fWidth);
        }, aVisibleColumns.length);
      return "".concat(Math.max(iSumWidth, fMinWidth), "em");
    },
    createVHUIModel: function (propertyPath, oFVH, bSuggestion) {
      // setting the _VHUI model evaluated in the ValueListTable fragment
      var oModel = oFVH.getModel(),
        oMetaModel = oModel.getMetaModel();
      var oVHUIModel = oFVH.getModel("_VHUI");
      if (!oVHUIModel) {
        oVHUIModel = new JSONModel({});
        oFVH.setModel(oVHUIModel, "_VHUI");
        // Identifies the "ContextDependent-Scenario"
        oVHUIModel.setProperty("/hasValueListRelevantQualifiers", !!oMetaModel.getObject("".concat(propertyPath, "@"))["@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"]);
      }
      oVHUIModel.setProperty("/isSuggestion", bSuggestion);
      oVHUIModel.setProperty("/minScreenWidth", !bSuggestion ? "418px" : undefined);
      return oVHUIModel;
    },
    showValueListInfo: function (propertyPath, oFVH, bSuggestion, sConditionModel, oProperties) {
      var oModel = oFVH.getModel(),
        oMetaModel = oModel ? oModel.getMetaModel() : CommonUtils.getAppComponent(oFVH).getModel().getMetaModel(),
        oWrapper = oFVH.getDialogContent && oFVH.getDialogContent(),
        oSuggestWrapper = oFVH.getSuggestContent && oFVH.getSuggestContent();
      var sWrapperId, oDialogTable, oFilterBar, oSuggestTable, bExists;
      if (bSuggestion) {
        sWrapperId = oSuggestWrapper && oSuggestWrapper.getId();
        oSuggestTable = oSuggestWrapper && oSuggestWrapper.getTable && oSuggestWrapper.getTable();
        bExists = oSuggestTable;
      } else {
        oDialogTable = oWrapper && oWrapper.getTable && oWrapper.getTable();
        oFilterBar = oFVH && oFVH.getFilterBar && oFVH.getFilterBar();
        sWrapperId = oWrapper && oWrapper.getId();
        bExists = oDialogTable && oFilterBar;
      }

      // setting the _VHUI model evaluated in the ValueListTable fragment
      var oVHUIModel = ValueListHelper.createVHUIModel(propertyPath, oFVH, bSuggestion);
      var sValueHelpId = oFVH.getModel("_VHUI").getProperty("/valueHelpId");
      if (oDialogTable) {
        oDialogTable.setWidth("100%");
      }

      // handling of special case of predefined variant: the table width can only be set late when field is available (see function createValueHelpSuggest)
      if (oSuggestTable) {
        var sTableWidth = oVHUIModel.getProperty("/tableWidth");
        if (!sTableWidth) {
          var isUnitValueHelp = oFVH.data("sourcePath") !== oFVH.data("originalPropertyPath");
          sTableWidth = this.getTableWidth(oSuggestTable, this._getWidthInRem(oFVH._getField(), isUnitValueHelp));
          oFVH.getModel("_VHUI").setProperty("/tableWidth", sTableWidth);
          oSuggestTable.setWidth(sTableWidth);
        }
      }

      // switch off internal caching
      if (sValueHelpId !== undefined && oFVH.getBindingContext() || oFVH.getModel("_VHUI").getProperty("/collectiveSearchKey") !== undefined && oFVH.getModel("_VHUI").getProperty("/collectiveSearchKey") !== oProperties.collectiveSearchKey) {
        oDialogTable = undefined;
        oFilterBar = undefined;
        oSuggestTable = undefined;
        bExists = undefined;
        delete waitForPromise[sWrapperId];
      }
      if (!bSuggestion && !oFilterBar && oFVH.getDependents().length > 0) {
        var oPotentialFilterBar = oFVH.getDependents()[0];
        if (oPotentialFilterBar.isA("sap.ui.mdc.filterbar.vh.FilterBar")) {
          oFilterBar = oPotentialFilterBar;
        }
      }
      if (waitForPromise[sWrapperId] || bExists) {
        return waitForPromise["promise".concat(sWrapperId)];
      } else {
        if (bSuggestion && !oSuggestTable || !bSuggestion && !oDialogTable) {
          waitForPromise[sWrapperId] = true;
        }
        var oPromise = ValueListHelper.getValueListInfo(oFVH, oMetaModel, propertyPath, sConditionModel, oProperties).then(ValueListHelper.getValueListInfoWithUseCaseSensitive).then(function (oValueListInfo) {
          var sInValueHelpId = oFVH.getModel("_VHUI").getProperty("/valueHelpId");
          if (oFVH.getModel("_VHUI").getProperty("/noValidValueHelp")) {
            Log.error("Context dependent value help not found");
            return oFVH.close();
          }
          var aInParameters = oValueListInfo && oValueListInfo.inParameters,
            aOutParameters = oValueListInfo && oValueListInfo.outParameters;
          if (oFVH.getOutParameters().length !== aOutParameters.length) {
            aOutParameters.forEach(function (oOutParameter) {
              oFVH.addOutParameter(oOutParameter);
            });
          }
          if (oFVH.getInParameters().length !== aInParameters.length) {
            aInParameters.forEach(function (oInParameter) {
              oFVH.addInParameter(oInParameter);
            });
          }
          oFVH.setCaseSensitive(oValueListInfo.useCaseSensitive);
          if (bSuggestion) {
            var oSelectedSuggestCacheItem = _getSuggestCachedValueHelp(sInValueHelpId);
            var oInSuggestTable = oSelectedSuggestCacheItem ? oSelectedSuggestCacheItem.oVHSuggestTable : undefined;
            return oValueListInfo && ValueListHelper.createValueHelpSuggest(propertyPath, oFVH, oInSuggestTable, oValueListInfo, bSuggestion);
          } else {
            var oSelectedCacheItem = _getCachedValueHelp(sInValueHelpId);
            if (oSelectedCacheItem) {
              oDialogTable = oSelectedCacheItem.oVHDialogTable;
              oFilterBar = oSelectedCacheItem.oVHFilterBar;
            }
            return oValueListInfo && ValueListHelper.createValueHelpDialog(propertyPath, oFVH, oDialogTable, oFilterBar, oValueListInfo, bSuggestion);
          }
        }).catch(function (exc) {
          var sMsg = exc.status && exc.status === 404 ? "Metadata not found (".concat(exc.status, ") for value help of property ").concat(propertyPath) : exc.message;
          Log.error(sMsg);
          oFVH.destroyContent();
        });
        waitForPromise["promise".concat(sWrapperId)] = oPromise;
        return oPromise;
      }
    },
    setValueListFilterFields: function (propertyPath, oFVH, bSuggestion, sConditionModel) {
      var oModel = oFVH.getModel(),
        oMetaModel = oModel.getMetaModel();
      // For ContextDependentValueHelp the func getValueListInfo is also called
      if (oFVH.getBindingContext() && oFVH.getModel().getMetaModel().getObject("".concat(propertyPath, "@"))["@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"]) {
        return;
      }
      return ValueListHelper.getValueListInfo(oFVH, oMetaModel, propertyPath, sConditionModel).then(function (oValueListInfo) {
        var oPropertyAnnotations = oFVH.getModel().getMetaModel().getObject("".concat(propertyPath, "@"));
        if (oValueListInfo) {
          oFVH.setFilterFields(_entityIsSearchable(oValueListInfo, oPropertyAnnotations) ? "$search" : "");
        }
      });
    },
    /**
     * Retrieves the column width for a given property.
     *
     * @param propertyPath The propertyPath
     * @returns The width as a string.
     */
    getColumnWidth: function (propertyPath) {
      var _property$annotations, _property$annotations2, _textAnnotation$annot, _textAnnotation$annot2, _textAnnotation$annot3;
      var property = propertyPath.targetObject;
      var relatedProperty = [property];
      // The additional property could refer to the text, currency, unit or timezone
      var additionalProperty = getAssociatedTextProperty(property) || getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property) || getAssociatedTimezoneProperty(property),
        textAnnotation = (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Common) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.Text,
        textArrangement = textAnnotation === null || textAnnotation === void 0 ? void 0 : (_textAnnotation$annot = textAnnotation.annotations) === null || _textAnnotation$annot === void 0 ? void 0 : (_textAnnotation$annot2 = _textAnnotation$annot.UI) === null || _textAnnotation$annot2 === void 0 ? void 0 : (_textAnnotation$annot3 = _textAnnotation$annot2.TextArrangement) === null || _textAnnotation$annot3 === void 0 ? void 0 : _textAnnotation$annot3.toString(),
        displayMode = textArrangement && getDisplayMode(propertyPath);
      if (additionalProperty) {
        if (displayMode === "Description") {
          relatedProperty = [additionalProperty];
        } else if (!textAnnotation || displayMode && displayMode !== "Value") {
          relatedProperty.push(additionalProperty);
        }
      }
      var size = 0;
      relatedProperty.forEach(function (prop) {
        var propertyTypeConfig = getTypeConfig(prop, undefined);
        var PropertyODataConstructor = ObjectPath.get(propertyTypeConfig.type);
        var instance = new PropertyODataConstructor(propertyTypeConfig.formatOptions, propertyTypeConfig.constraints);
        var sWidth = instance ? Util.calcColumnWidth(instance) : null;
        size += sWidth ? parseFloat(sWidth.replace("rem", "")) : 0;
      });
      if (!size) {
        Log.error("Cannot compute the column width for property: ".concat(property.name));
      }
      return size <= 20 ? size.toString() + "rem" : "20rem";
    },
    fetchValuesOnInitialLoad: function (oValueListInfo) {
      if (oValueListInfo.FetchValues && oValueListInfo.FetchValues == 2) {
        return false;
      }
      return true;
    },
    getOutParameterPaths: function (aParameters) {
      var sPath = "";
      aParameters.forEach(function (oParameter) {
        if (oParameter.$Type.endsWith("Out")) {
          sPath += "{".concat(oParameter.ValueListProperty, "}");
        }
      });
      return sPath;
    }
  };
  return ValueListHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ3YWl0Rm9yUHJvbWlzZSIsImFDYWNoZWRWYWx1ZUhlbHAiLCJhU3VnZ2VzdENhY2hlZFZhbHVlSGVscCIsIl9oYXNJbXBvcnRhbmNlSGlnaCIsIm9WYWx1ZUxpc3RDb250ZXh0IiwiUGFyYW1ldGVycyIsInNvbWUiLCJvUGFyYW1ldGVyIiwiJEVudW1NZW1iZXIiLCJfZW50aXR5SXNTZWFyY2hhYmxlIiwib1ZhbHVlTGlzdEluZm8iLCJvUHJvcGVydHlBbm5vdGF0aW9ucyIsImJTZWFyY2hTdXBwb3J0ZWQiLCJTZWFyY2hTdXBwb3J0ZWQiLCJvQ29sbGVjdGlvbkFubm90YXRpb25zIiwidmFsdWVMaXN0SW5mbyIsIiRtb2RlbCIsImdldE1ldGFNb2RlbCIsImdldE9iamVjdCIsIkNvbGxlY3Rpb25QYXRoIiwiYlNlYXJjaGFibGUiLCJTZWFyY2hhYmxlIiwidW5kZWZpbmVkIiwiX2dldENhY2hlZFZhbHVlSGVscCIsInNWYWx1ZUhlbHBJZCIsImZpbmQiLCJvVkhFbGVtZW50Iiwic1ZISWQiLCJfZ2V0U3VnZ2VzdENhY2hlZFZhbHVlSGVscCIsIl9nZXRWYWx1ZUhlbHBDb2x1bW5EaXNwbGF5Rm9ybWF0IiwiaXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMiLCJzRGlzcGxheU1vZGUiLCJDb21tb25VdGlscyIsImNvbXB1dGVEaXNwbGF5TW9kZSIsIm9UZXh0QW5ub3RhdGlvbiIsIm9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uIiwiJFBhdGgiLCJfcmVkdW5kYW50RGVzY3JpcHRpb24iLCJvVkxQYXJhbWV0ZXIiLCJhQ29sdW1uSW5mbyIsIm9Db2x1bW5JbmZvIiwiY29sdW1uSW5mbyIsIlZhbHVlTGlzdFByb3BlcnR5IiwidGV4dENvbHVtbk5hbWUiLCJrZXlDb2x1bW5IaWRkZW4iLCJrZXlDb2x1bW5EaXNwbGF5Rm9ybWF0IiwiX2dldERlZmF1bHRTb3J0UHJvcGVydHlOYW1lIiwib1ZhbHVlTGlzdCIsInNTb3J0RmllbGROYW1lIiwibWV0YU1vZGVsIiwibUVudGl0eVNldEFubm90YXRpb25zIiwib1NvcnRSZXN0cmljdGlvbnMiLCJvU29ydFJlc3RyaWN0aW9uc0luZm8iLCJPRGF0YU1ldGFNb2RlbFV0aWwiLCJnZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyIsIm9Gb3VuZEVsZW1lbnQiLCJvRWxlbWVudCIsIiRUeXBlIiwic29ydGFibGUiLCJfYnVpbGQkU2VsZWN0U3RyaW5nIiwiY29udHJvbCIsIm9WaWV3RGF0YSIsImdldE1vZGVsIiwib0RhdGEiLCJnZXREYXRhIiwiYUNvbHVtbnMiLCJjb2x1bW5zIiwicmVkdWNlIiwic1F1ZXJ5Iiwib1Byb3BlcnR5IiwicGF0aCIsImluZGV4T2YiLCJfZ2V0Q29uZGl0aW9uUGF0aCIsIm9NZXRhTW9kZWwiLCJzRW50aXR5U2V0Iiwic1Byb3BlcnR5IiwiYVBhcnRzIiwic3BsaXQiLCJzUGFydGlhbFBhdGgiLCJzQ29uZGl0aW9uUGF0aCIsImxlbmd0aCIsInNQYXJ0Iiwic2hpZnQiLCIka2luZCIsIiRpc0NvbGxlY3Rpb24iLCJfZ2V0Q29sdW1uRGVmaW5pdGlvbkZyb21TZWxlY3Rpb25GaWVsZHMiLCJhQ29sdW1uRGVmcyIsImFTZWxlY3Rpb25GaWVsZHMiLCJmb3JFYWNoIiwib1NlbGVjdGlvbkZpZWxkIiwic1NlbGVjdGlvbkZpZWxkUGF0aCIsIiRQcm9wZXJ0eVBhdGgiLCJvQ29sdW1uRGVmIiwibGFiZWwiLCJmaWx0ZXJhYmxlIiwiaXNQcm9wZXJ0eUZpbHRlcmFibGUiLCJwdXNoIiwiVmFsdWVMaXN0SGVscGVyIiwiQUxMRlJBR01FTlRTIiwibG9nRnJhZ21lbnQiLCJpbml0aWFsaXplQ2FjaGVkVmFsdWVIZWxwIiwib1ZhbHVlSGVscCIsIm9WSEZpbHRlckJhciIsImlzRGVzdHJveWVkIiwiZGVzdHJveSIsIm9WSERpYWxvZ1RhYmxlIiwiZ2V0Q29sdW1uVmlzaWJpbGl0eUluZm8iLCJzUHJvcGVydHlGdWxsUGF0aCIsImJJc0Ryb3BEb3duTGlzdGUiLCJpc0RpYWxvZ1RhYmxlIiwiYUNvbHVtbkluZm9zIiwib0NvbHVtbkluZm9zIiwiY29sdW1uSW5mb3MiLCJjb2x1bW5OYW1lIiwiaGFzSGlkZGVuQW5ub3RhdGlvbiIsImdldENvbHVtblZpc2liaWxpdHkiLCJvU291cmNlIiwiaXNEcm9wRG93bkxpc3QiLCJ2YWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMiLCJpc1Zpc2libGUiLCJjb2x1bW5XaXRoSGlkZGVuQW5ub3RhdGlvbiIsImdldFNvcnRDb25kaXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQiLCJiU3VnZ2VzdGlvbiIsInNQcmVzZW50YXRpb25WYXJpYW50UXVhbGlmaWVyIiwiUHJlc2VudGF0aW9uVmFyaWFudFF1YWxpZmllciIsInNQcmVzZW50YXRpb25WYXJpYW50UGF0aCIsIm9QcmVzZW50YXRpb25WYXJpYW50IiwiU29ydE9yZGVyIiwic1NvcnRDb25kaXRpb25zIiwic29ydGVycyIsIm9Db25kaXRpb24iLCJvU29ydGVyIiwiUHJvcGVydHkiLCJEZXNjZW5kaW5nIiwiZGVzY2VuZGluZyIsImFzY2VuZGluZyIsIkpTT04iLCJzdHJpbmdpZnkiLCJuYW1lIiwiaGFzSW1wb3J0YW5jZSIsImdldE1pblNjcmVlbldpZHRoIiwiZ2V0VGFibGVJdGVtc1BhcmFtZXRlcnMiLCJzUmVxdWVzdEdyb3VwSWQiLCJiVmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzIiwic1BhcmFtZXRlcnMiLCJiU3VzcGVuZGVkIiwic1NlbGVjdCIsInNMZW5ndGhQYXJhbWV0ZXIiLCJzU29ydENvbmRpdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCIsInNTb3J0Q29uZGl0aW9uc1BhcmFtZXRlciIsImdldFRhYmxlRGVsZWdhdGUiLCJzRGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUiLCJnZXRQcm9wZXJ0eVBhdGgiLCJvUGFyYW1ldGVycyIsIlVuYm91bmRBY3Rpb24iLCJFbnRpdHlUeXBlUGF0aCIsIkFjdGlvbiIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiZ2V0V2FpdEZvclByb21pc2UiLCJnZXRWYWx1ZUxpc3RDb2xsZWN0aW9uRW50aXR5U2V0IiwibVZhbHVlTGlzdCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiZ2V0VmFsdWVMaXN0UHJvcGVydHkiLCJvUHJvcGVydHlDb250ZXh0Iiwib1ZhbHVlTGlzdE1vZGVsIiwiZ2V0VmFsdWVMaXN0SW5mb1dpdGhVc2VDYXNlU2Vuc2l0aXZlIiwic0NvbGxlY3Rpb25QYXRoIiwiUHJvbWlzZSIsImFsbCIsInJlcXVlc3RPYmplY3QiLCJ0aGVuIiwiZW50aXR5RmlsdGVyRnVuY3Rpb25zIiwiY29udGFpbmVyRmlsdGVyRnVuY3Rpb25zIiwiZmlsdGVyRnVuY3Rpb25zIiwidXNlQ2FzZVNlbnNpdGl2ZSIsImNhdGNoIiwiZXJyIiwiTG9nIiwiZXJyb3IiLCJnZXRWYWx1ZUxpc3RJbmZvIiwib0ZWSCIsInByb3BlcnR5UGF0aCIsInNDb25kaXRpb25Nb2RlbCIsIm9Qcm9wZXJ0aWVzIiwic0tleSIsInNEZXNjcmlwdGlvblBhdGgiLCJzUHJvcGVydHlQYXRoIiwic0ZpZWxkUHJvcGVydHlQYXRoIiwic1Byb3BlcnR5TmFtZSIsImFJblBhcmFtZXRlcnMiLCJhT3V0UGFyYW1ldGVycyIsInJlcXVlc3RWYWx1ZUxpc3RJbmZvIiwiZ2V0QmluZGluZ0NvbnRleHQiLCJtVmFsdWVMaXN0SW5mbyIsImJQcm9jZXNzSW5PdXQiLCJnZXRJblBhcmFtZXRlcnMiLCJnZXRPdXRQYXJhbWV0ZXJzIiwib1ZIVUlNb2RlbCIsInF1YWxpZmllckZvclZhbGlkYXRpb24iLCJkYXRhIiwiZ2V0UHJvcGVydHkiLCJoYXNWYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnMiLCJhQ29sbGVjdGl2ZVNlYXJjaEl0ZW1zIiwiZ2V0QWdncmVnYXRpb24iLCJhVmFsdWVIZWxwS2V5cyIsIk9iamVjdCIsImtleXMiLCJpbmRleERlZmF1bHRWSCIsImlzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzIiwic1ZhbHVlSGVscFF1YWxpZmllciIsInVuc2hpZnQiLCJzcGxpY2UiLCJzZXRQcm9wZXJ0eSIsIiRxdWFsaWZpZXIiLCJnZXRJZCIsIm9JdGVtIiwiaW5jbHVkZXMiLCJnZXRLZXkiLCJyZW1vdmVBZ2dyZWdhdGlvbiIsInJlbW92ZUFsbEFnZ3JlZ2F0aW9uIiwiY29sbGVjdGl2ZVNlYXJjaEtleSIsInNWYWx1ZUhlbHBLZXkiLCJmaWx0ZXIiLCJhZGRBZ2dyZWdhdGlvbiIsIkl0ZW0iLCJrZXkiLCJ0ZXh0IiwiTGFiZWwiLCJlbmFibGVkIiwiZ2V0UGFyZW50IiwiaXNBIiwic0NvbnRleHRQcmVmaXgiLCJiQ29uc2lkZXJJbk91dCIsImNvbnNpZGVySW5PdXRQYXJhbWV0ZXIiLCJnZXRQYXRoIiwiYUJpbmRpZ0NvbnRleHRQYXJ0cyIsImFQcm9wZXJ0eUJpbmRpbmdQYXJ0cyIsImFDb250ZXh0UHJlZml4UGFydHMiLCJpIiwiam9pbiIsIm9TdWJNZXRhTW9kZWwiLCJzRW50aXR5U2V0UGF0aCIsImFQYXJlbnRGRk5hbWVzIiwiZ2V0UGFyZW50RmlsdGVyRmllbGROYW1lcyIsImVudHJ5IiwiTG9jYWxEYXRhUHJvcGVydHkiLCJzVmFsdWVQYXRoIiwic0ZpcnN0TmF2aWdhdGlvblByb3BlcnR5Iiwib0JvdW5kRW50aXR5IiwiZ2V0TWV0YUNvbnRleHQiLCJzUGF0aE9mVGFibGUiLCJnZXRSb3dCaW5kaW5nIiwicmVwbGFjZSIsIk91dFBhcmFtZXRlciIsInZhbHVlIiwiaGVscFBhdGgiLCJJblBhcmFtZXRlciIsImluaXRpYWxWYWx1ZUZpbHRlckVtcHR5IiwiSW5pdGlhbFZhbHVlSXNTaWduaWZpY2FudCIsIkNvbnN0YW50Iiwic0NvbHVtblBhdGgiLCJzQ29sdW1uUHJvcGVydHlUeXBlIiwic0xhYmVsIiwic1RleHRQcm9wZXJ0eVBhdGgiLCJiQ29sdW1uTm90QWxyZWFkeURlZmluZWQiLCJmaW5kSW5kZXgiLCJvQ29sIiwib0NvbHVtbiIsImtleVZhbHVlIiwiZGVzY3JpcHRpb25WYWx1ZSIsImZpZWxkUHJvcGVydHlQYXRoIiwiaW5QYXJhbWV0ZXJzIiwib3V0UGFyYW1ldGVycyIsImNvbHVtbkRlZnMiLCJleGMiLCJzTXNnIiwic3RhdHVzIiwibWVzc2FnZSIsImRlc3Ryb3lDb250ZW50IiwiYmluZGluZ0NvbnRleHQiLCJzdWJQYXRoIiwibWV0YU1vZGVsRnJvbXN1YlBhdGgiLCJjaGVja0JlQWN0aW9uIiwiQXJyYXkiLCJpc0FycmF5Iiwib0ZCIiwiYVBhcmVudEZpbHRlckZpZWxkcyIsImdldEZpbHRlckl0ZW1zIiwibWFwIiwib0ZGIiwiZ2V0RmllbGRQYXRoIiwiX3RlbXBsYXRlRnJhZ21lbnQiLCJzRnJhZ21lbnROYW1lIiwib1NvdXJjZU1vZGVsIiwib0FkZGl0aW9uYWxWaWV3RGF0YSIsIm9GcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwiSlNPTk1vZGVsIiwib1ZhbHVlTGlzdFNlcnZpY2VNZXRhTW9kZWwiLCJhc3NpZ24iLCJjb252ZXJ0ZXJUeXBlIiwicmVzb2x2ZSIsIlhNTFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJiaW5kaW5nQ29udGV4dHMiLCJ2YWx1ZUxpc3QiLCJjb250ZXh0UGF0aCIsInNvdXJjZSIsIm1vZGVscyIsInZpZXdEYXRhIiwib1N1YkZyYWdtZW50Iiwib0xvZ0luZm8iLCJmcmFnbWVudE5hbWUiLCJmcmFnbWVudCIsImdldExldmVsIiwiTGV2ZWwiLCJERUJVRyIsInNldFRpbWVvdXQiLCJGcmFnbWVudCIsImxvYWQiLCJkZWZpbml0aW9uIiwiY3JlYXRlVmFsdWVIZWxwRGlhbG9nIiwib1RhYmxlIiwib0ZpbHRlckJhciIsInNGVkhDbGFzcyIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsIm9XcmFwcGVyIiwiZ2V0RGlhbG9nQ29udGVudCIsInNXcmFwcGVySWQiLCJzZXRUaXRsZSIsInNldEtleVBhdGgiLCJzZXREZXNjcmlwdGlvblBhdGgiLCJzZXRGaWx0ZXJGaWVsZHMiLCJpZCIsImdyb3VwSWQiLCJpc0ZpZWxkVmFsdWVIZWxwIiwiZW5hYmxlQXV0b0NvbHVtbldpZHRoIiwic3lzdGVtIiwicGhvbmUiLCJhQ29udHJvbHMiLCJzSW5WYWx1ZUhlbHBJZCIsIm9JblRhYmxlIiwib0luRmlsdGVyQmFyIiwic2V0TW9kZWwiLCJpbmZvIiwiZ2V0RmlsdGVyQmFyIiwic2V0RmlsdGVyQmFyIiwiYWRkRGVwZW5kZW50IiwiZ2V0VGFibGUiLCJzZXRUYWJsZSIsInNldEZpbHRlciIsImluaXRpYWxpemVkIiwic1RhYmxlV2lkdGgiLCJnZXRUYWJsZVdpZHRoIiwiX2dldFdpZHRoSW5SZW0iLCJfZ2V0RmllbGQiLCJzZXRXaWR0aCIsIm9TZWxlY3RlZENhY2hlSXRlbSIsImlzVGFibGVCb3VuZCIsImZldGNoVmFsdWVzT25Jbml0aWFsTG9hZCIsInJlYmluZCIsImNyZWF0ZVZhbHVlSGVscFN1Z2dlc3QiLCJnZXRTdWdnZXN0Q29udGVudCIsIm9CaW5kaW5nIiwiZ2V0QmluZGluZyIsImF0dGFjaEV2ZW50T25jZSIsIkJ1c3lMb2NrZXIiLCJsb2NrIiwiYXR0YWNoRXZlbnQiLCJvRXZlbnQiLCJzUGFyZW50SWQiLCJvTWVzc2FnZU1hbmFnZXIiLCJDb3JlIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJpc0xvY2tlZCIsInVubG9jayIsImdldFBhcmFtZXRlciIsInNFcnJvck1lc3NhZ2UiLCJfdXBkYXRlTWVzc2FnZSIsIm9NZXNzYWdlIiwidGFyZ2V0IiwiX29Db25kaXRpb25zIiwiJHNlYXJjaCIsIm1lc3NhZ2VIYW5kbGluZyIsImdldE1lc3NhZ2VzIiwiZ2V0TWVzc2FnZU1vZGVsIiwiY29udHJvbElkcyIsIk1vZGVsSGVscGVyIiwiaXNEcmFmdFN1cHBvcnRlZCIsIkZpbHRlciIsIkZpbHRlck9wZXJhdG9yIiwiRVEiLCJGaWx0ZXJUeXBlIiwiQ29udHJvbCIsImludmFsaWRhdGUiLCJpc1VuaXRWYWx1ZUhlbHAiLCJvRmlsdGVyRmllbGQiLCJvVkhTdWdnZXN0VGFibGUiLCJvQ29udHJvbCIsIiR3aWR0aCIsIiQiLCJ3aWR0aCIsImZXaWR0aCIsInBhcnNlRmxvYXQiLCJSZW0iLCJmcm9tUHgiLCJpc05hTiIsImZNaW5XaWR0aCIsInNXaWR0aCIsImdldENvbHVtbnMiLCJhVmlzaWJsZUNvbHVtbnMiLCJnZXRWaXNpYmxlIiwiaVN1bVdpZHRoIiwiZlN1bSIsImdldFdpZHRoIiwiZW5kc1dpdGgiLCJNYXRoIiwibWF4IiwiY3JlYXRlVkhVSU1vZGVsIiwib01vZGVsIiwic2hvd1ZhbHVlTGlzdEluZm8iLCJnZXRBcHBDb21wb25lbnQiLCJvU3VnZ2VzdFdyYXBwZXIiLCJvRGlhbG9nVGFibGUiLCJvU3VnZ2VzdFRhYmxlIiwiYkV4aXN0cyIsImdldERlcGVuZGVudHMiLCJvUG90ZW50aWFsRmlsdGVyQmFyIiwib1Byb21pc2UiLCJjbG9zZSIsIm9PdXRQYXJhbWV0ZXIiLCJhZGRPdXRQYXJhbWV0ZXIiLCJvSW5QYXJhbWV0ZXIiLCJhZGRJblBhcmFtZXRlciIsInNldENhc2VTZW5zaXRpdmUiLCJvU2VsZWN0ZWRTdWdnZXN0Q2FjaGVJdGVtIiwib0luU3VnZ2VzdFRhYmxlIiwic2V0VmFsdWVMaXN0RmlsdGVyRmllbGRzIiwiZ2V0Q29sdW1uV2lkdGgiLCJwcm9wZXJ0eSIsInRhcmdldE9iamVjdCIsInJlbGF0ZWRQcm9wZXJ0eSIsImFkZGl0aW9uYWxQcm9wZXJ0eSIsImdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHkiLCJnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eSIsImdldEFzc29jaWF0ZWRVbml0UHJvcGVydHkiLCJnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eSIsInRleHRBbm5vdGF0aW9uIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJUZXh0IiwidGV4dEFycmFuZ2VtZW50IiwiVUkiLCJUZXh0QXJyYW5nZW1lbnQiLCJ0b1N0cmluZyIsImRpc3BsYXlNb2RlIiwiZ2V0RGlzcGxheU1vZGUiLCJzaXplIiwicHJvcCIsInByb3BlcnR5VHlwZUNvbmZpZyIsImdldFR5cGVDb25maWciLCJQcm9wZXJ0eU9EYXRhQ29uc3RydWN0b3IiLCJPYmplY3RQYXRoIiwiZ2V0IiwidHlwZSIsImluc3RhbmNlIiwiZm9ybWF0T3B0aW9ucyIsImNvbnN0cmFpbnRzIiwiVXRpbCIsImNhbGNDb2x1bW5XaWR0aCIsIkZldGNoVmFsdWVzIiwiZ2V0T3V0UGFyYW1ldGVyUGF0aHMiLCJhUGFyYW1ldGVycyIsInNQYXRoIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJWYWx1ZUxpc3RIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgUHJvcGVydHkgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBMb2csIHsgTGV2ZWwgfSBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgT2JqZWN0UGF0aCBmcm9tIFwic2FwL2Jhc2UvdXRpbC9PYmplY3RQYXRoXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgQnVzeUxvY2tlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvQnVzeUxvY2tlclwiO1xuaW1wb3J0IG1lc3NhZ2VIYW5kbGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvbWVzc2FnZUhhbmRsZXIvbWVzc2FnZUhhbmRsaW5nXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQge1xuXHRnZXRBc3NvY2lhdGVkQ3VycmVuY3lQcm9wZXJ0eSxcblx0Z2V0QXNzb2NpYXRlZFRleHRQcm9wZXJ0eSxcblx0Z2V0QXNzb2NpYXRlZFRpbWV6b25lUHJvcGVydHksXG5cdGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlcbn0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB7IGdldERpc3BsYXlNb2RlLCBnZXRUeXBlQ29uZmlnIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvVUlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgT0RhdGFNZXRhTW9kZWxVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL09EYXRhTWV0YU1vZGVsVXRpbFwiO1xuaW1wb3J0IFV0aWwgZnJvbSBcInNhcC9tL3RhYmxlL1V0aWxcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgSXRlbSBmcm9tIFwic2FwL3VpL2NvcmUvSXRlbVwiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCBYTUxUZW1wbGF0ZVByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvWE1MVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB7IHN5c3RlbSB9IGZyb20gXCJzYXAvdWkvRGV2aWNlXCI7XG5pbXBvcnQgUmVtIGZyb20gXCJzYXAvdWkvZG9tL3VuaXRzL1JlbVwiO1xuaW1wb3J0IEluUGFyYW1ldGVyIGZyb20gXCJzYXAvdWkvbWRjL2ZpZWxkL0luUGFyYW1ldGVyXCI7XG5pbXBvcnQgT3V0UGFyYW1ldGVyIGZyb20gXCJzYXAvdWkvbWRjL2ZpZWxkL091dFBhcmFtZXRlclwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCBGaWx0ZXJUeXBlIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyVHlwZVwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5cbmNvbnN0IHdhaXRGb3JQcm9taXNlOiBhbnkgPSB7fTtcbmxldCBhQ2FjaGVkVmFsdWVIZWxwOiBhbnlbXSA9IFtdO1xubGV0IGFTdWdnZXN0Q2FjaGVkVmFsdWVIZWxwOiBhbnlbXSA9IFtdO1xuXG5mdW5jdGlvbiBfaGFzSW1wb3J0YW5jZUhpZ2gob1ZhbHVlTGlzdENvbnRleHQ6IGFueSkge1xuXHRyZXR1cm4gb1ZhbHVlTGlzdENvbnRleHQuUGFyYW1ldGVycy5zb21lKGZ1bmN0aW9uIChvUGFyYW1ldGVyOiBhbnkpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0b1BhcmFtZXRlcltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlXCJdICYmXG5cdFx0XHRvUGFyYW1ldGVyW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkltcG9ydGFuY2VcIl0uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSW1wb3J0YW5jZVR5cGUvSGlnaFwiXG5cdFx0KTtcblx0fSk7XG59XG5mdW5jdGlvbiBfZW50aXR5SXNTZWFyY2hhYmxlKG9WYWx1ZUxpc3RJbmZvOiBhbnksIG9Qcm9wZXJ0eUFubm90YXRpb25zOiBhbnkpIHtcblx0Y29uc3QgYlNlYXJjaFN1cHBvcnRlZCA9XG5cdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0XCJdICYmXG5cdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0XCJdLlNlYXJjaFN1cHBvcnRlZCxcblx0XHRvQ29sbGVjdGlvbkFubm90YXRpb25zID1cblx0XHRcdG9WYWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uJG1vZGVsLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChgLyR7b1ZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aH1AYCkgfHwge30sXG5cdFx0YlNlYXJjaGFibGUgPVxuXHRcdFx0b0NvbGxlY3Rpb25Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNlYXJjaFJlc3RyaWN0aW9uc1wiXSAmJlxuXHRcdFx0b0NvbGxlY3Rpb25Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNlYXJjaFJlc3RyaWN0aW9uc1wiXS5TZWFyY2hhYmxlO1xuXG5cdGlmIChcblx0XHQoYlNlYXJjaGFibGUgPT09IHVuZGVmaW5lZCAmJiBiU2VhcmNoU3VwcG9ydGVkID09PSBmYWxzZSkgfHxcblx0XHQoYlNlYXJjaGFibGUgPT09IHRydWUgJiYgYlNlYXJjaFN1cHBvcnRlZCA9PT0gZmFsc2UpIHx8XG5cdFx0YlNlYXJjaGFibGUgPT09IGZhbHNlXG5cdCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIF9nZXRDYWNoZWRWYWx1ZUhlbHAoc1ZhbHVlSGVscElkOiBhbnkpIHtcblx0cmV0dXJuIGFDYWNoZWRWYWx1ZUhlbHAuZmluZChmdW5jdGlvbiAob1ZIRWxlbWVudDogYW55KSB7XG5cdFx0cmV0dXJuIG9WSEVsZW1lbnQuc1ZISWQgPT09IHNWYWx1ZUhlbHBJZDtcblx0fSk7XG59XG5mdW5jdGlvbiBfZ2V0U3VnZ2VzdENhY2hlZFZhbHVlSGVscChzVmFsdWVIZWxwSWQ6IGFueSkge1xuXHRyZXR1cm4gYVN1Z2dlc3RDYWNoZWRWYWx1ZUhlbHAuZmluZChmdW5jdGlvbiAob1ZIRWxlbWVudDogYW55KSB7XG5cdFx0cmV0dXJuIG9WSEVsZW1lbnQuc1ZISWQgPT09IHNWYWx1ZUhlbHBJZDtcblx0fSk7XG59XG5mdW5jdGlvbiBfZ2V0VmFsdWVIZWxwQ29sdW1uRGlzcGxheUZvcm1hdChvUHJvcGVydHlBbm5vdGF0aW9uczogYW55LCBpc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlczogYW55KSB7XG5cdGNvbnN0IHNEaXNwbGF5TW9kZSA9IENvbW1vblV0aWxzLmNvbXB1dGVEaXNwbGF5TW9kZShvUHJvcGVydHlBbm5vdGF0aW9ucywgdW5kZWZpbmVkKTtcblx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb1Byb3BlcnR5QW5ub3RhdGlvbnMgJiYgb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl07XG5cdGNvbnN0IG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uID1cblx0XHRvVGV4dEFubm90YXRpb24gJiYgb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCJdO1xuXHRpZiAoaXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMpIHtcblx0XHRyZXR1cm4gb1RleHRBbm5vdGF0aW9uICYmIHR5cGVvZiBvVGV4dEFubm90YXRpb24gIT09IFwic3RyaW5nXCIgJiYgb1RleHRBbm5vdGF0aW9uLiRQYXRoID8gc0Rpc3BsYXlNb2RlIDogXCJWYWx1ZVwiO1xuXHR9IGVsc2Uge1xuXHRcdC8vIE9ubHkgZXhwbGljaXQgZGVmaW5lZCBUZXh0QXJyYW5nZW1lbnRzIGluIGEgVmFsdWUgSGVscCB3aXRoIERpYWxvZyBhcmUgY29uc2lkZXJlZFxuXHRcdHJldHVybiBvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA/IHNEaXNwbGF5TW9kZSA6IFwiVmFsdWVcIjtcblx0fVxufVxuZnVuY3Rpb24gX3JlZHVuZGFudERlc2NyaXB0aW9uKG9WTFBhcmFtZXRlcjogYW55LCBhQ29sdW1uSW5mbzogYW55W10pIHtcblx0Y29uc3Qgb0NvbHVtbkluZm8gPSBhQ29sdW1uSW5mby5maW5kKGZ1bmN0aW9uIChjb2x1bW5JbmZvOiBhbnkpIHtcblx0XHRyZXR1cm4gb1ZMUGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5ID09PSBjb2x1bW5JbmZvLnRleHRDb2x1bW5OYW1lO1xuXHR9KTtcblx0aWYgKFxuXHRcdG9WTFBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eSA9PT0gb0NvbHVtbkluZm8/LnRleHRDb2x1bW5OYW1lICYmXG5cdFx0IW9Db2x1bW5JbmZvLmtleUNvbHVtbkhpZGRlbiAmJlxuXHRcdG9Db2x1bW5JbmZvLmtleUNvbHVtbkRpc3BsYXlGb3JtYXQgIT09IFwiVmFsdWVcIlxuXHQpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuZnVuY3Rpb24gX2dldERlZmF1bHRTb3J0UHJvcGVydHlOYW1lKG9WYWx1ZUxpc3Q6IGFueSkge1xuXHRsZXQgc1NvcnRGaWVsZE5hbWU6IHN0cmluZyB8IHVuZGVmaW5lZDtcblx0Y29uc3QgbWV0YU1vZGVsID0gb1ZhbHVlTGlzdC4kbW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdGNvbnN0IG1FbnRpdHlTZXRBbm5vdGF0aW9ucyA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYC8ke29WYWx1ZUxpc3QuQ29sbGVjdGlvblBhdGh9QGApIHx8IHt9O1xuXHRjb25zdCBvU29ydFJlc3RyaWN0aW9ucyA9IG1FbnRpdHlTZXRBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNvcnRSZXN0cmljdGlvbnNcIl0gfHwge307XG5cdGNvbnN0IG9Tb3J0UmVzdHJpY3Rpb25zSW5mbyA9IE9EYXRhTWV0YU1vZGVsVXRpbC5nZXRTb3J0UmVzdHJpY3Rpb25zSW5mbyhvU29ydFJlc3RyaWN0aW9ucyk7XG5cdGNvbnN0IG9Gb3VuZEVsZW1lbnQgPSBvVmFsdWVMaXN0LlBhcmFtZXRlcnMuZmluZChmdW5jdGlvbiAob0VsZW1lbnQ6IGFueSkge1xuXHRcdHJldHVybiAoXG5cdFx0XHQob0VsZW1lbnQuJFR5cGUgPT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXRcIiB8fFxuXHRcdFx0XHRvRWxlbWVudC4kVHlwZSA9PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RQYXJhbWV0ZXJPdXRcIiB8fFxuXHRcdFx0XHRvRWxlbWVudC4kVHlwZSA9PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RQYXJhbWV0ZXJEaXNwbGF5T25seVwiKSAmJlxuXHRcdFx0IShtZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtvVmFsdWVMaXN0LkNvbGxlY3Rpb25QYXRofS8ke29FbGVtZW50LlZhbHVlTGlzdFByb3BlcnR5fUBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5gKSA9PT0gdHJ1ZSlcblx0XHQpO1xuXHR9KTtcblx0aWYgKG9Gb3VuZEVsZW1lbnQpIHtcblx0XHRpZiAoXG5cdFx0XHRtZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRgLyR7b1ZhbHVlTGlzdC5Db2xsZWN0aW9uUGF0aH0vJHtvRm91bmRFbGVtZW50LlZhbHVlTGlzdFByb3BlcnR5fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnQvJEVudW1NZW1iZXJgXG5cdFx0XHQpID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dE9ubHlcIlxuXHRcdCkge1xuXHRcdFx0c1NvcnRGaWVsZE5hbWUgPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRgLyR7b1ZhbHVlTGlzdC5Db2xsZWN0aW9uUGF0aH0vJHtvRm91bmRFbGVtZW50LlZhbHVlTGlzdFByb3BlcnR5fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dC8kUGF0aGBcblx0XHRcdCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNTb3J0RmllbGROYW1lID0gb0ZvdW5kRWxlbWVudC5WYWx1ZUxpc3RQcm9wZXJ0eTtcblx0XHR9XG5cdH1cblx0aWYgKHNTb3J0RmllbGROYW1lICYmICghb1NvcnRSZXN0cmljdGlvbnNJbmZvW3NTb3J0RmllbGROYW1lXSB8fCBvU29ydFJlc3RyaWN0aW9uc0luZm9bc1NvcnRGaWVsZE5hbWVdLnNvcnRhYmxlKSkge1xuXHRcdHJldHVybiBzU29ydEZpZWxkTmFtZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG59XG5mdW5jdGlvbiBfYnVpbGQkU2VsZWN0U3RyaW5nKGNvbnRyb2w6IGFueSkge1xuXHRjb25zdCBvVmlld0RhdGEgPSBjb250cm9sLmdldE1vZGVsKFwidmlld0RhdGFcIik7XG5cdGlmIChvVmlld0RhdGEpIHtcblx0XHRjb25zdCBvRGF0YSA9IG9WaWV3RGF0YS5nZXREYXRhKCk7XG5cdFx0aWYgKG9EYXRhKSB7XG5cdFx0XHRjb25zdCBhQ29sdW1ucyA9IG9EYXRhLmNvbHVtbnM7XG5cdFx0XHRpZiAoYUNvbHVtbnMpIHtcblx0XHRcdFx0cmV0dXJuIGFDb2x1bW5zLnJlZHVjZShmdW5jdGlvbiAoc1F1ZXJ5OiBhbnksIG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRcdFx0Ly8gTmF2aWdhdGlvbiBwcm9wZXJ0aWVzIChyZXByZXNlbnRlZCBieSBYL1kpIHNob3VsZCBub3QgYmUgYWRkZWQgdG8gJHNlbGVjdC5cblx0XHRcdFx0XHQvLyBUT0RPIDogVGhleSBzaG91bGQgYmUgYWRkZWQgYXMgJGV4cGFuZD1YKCRzZWxlY3Q9WSkgaW5zdGVhZFxuXHRcdFx0XHRcdGlmIChvUHJvcGVydHkucGF0aCAmJiBvUHJvcGVydHkucGF0aC5pbmRleE9mKFwiL1wiKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdHNRdWVyeSA9IHNRdWVyeSA/IGAke3NRdWVyeX0sJHtvUHJvcGVydHkucGF0aH1gIDogb1Byb3BlcnR5LnBhdGg7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBzUXVlcnk7XG5cdFx0XHRcdH0sIHVuZGVmaW5lZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiB1bmRlZmluZWQ7XG59XG5mdW5jdGlvbiBfZ2V0Q29uZGl0aW9uUGF0aChvTWV0YU1vZGVsOiBhbnksIHNFbnRpdHlTZXQ6IGFueSwgc1Byb3BlcnR5OiBhbnkpIHtcblx0Y29uc3QgYVBhcnRzID0gc1Byb3BlcnR5LnNwbGl0KFwiL1wiKTtcblx0bGV0IHNQYXJ0aWFsUGF0aCxcblx0XHRzQ29uZGl0aW9uUGF0aCA9IFwiXCI7XG5cblx0d2hpbGUgKGFQYXJ0cy5sZW5ndGgpIHtcblx0XHRsZXQgc1BhcnQgPSBhUGFydHMuc2hpZnQoKTtcblx0XHRzUGFydGlhbFBhdGggPSBzUGFydGlhbFBhdGggPyBgJHtzUGFydGlhbFBhdGh9LyR7c1BhcnR9YCA6IHNQYXJ0O1xuXHRcdGNvbnN0IG9Qcm9wZXJ0eSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXR9LyR7c1BhcnRpYWxQYXRofWApO1xuXHRcdGlmIChvUHJvcGVydHkgJiYgb1Byb3BlcnR5LiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIG9Qcm9wZXJ0eS4kaXNDb2xsZWN0aW9uKSB7XG5cdFx0XHRzUGFydCArPSBcIipcIjtcblx0XHR9XG5cdFx0c0NvbmRpdGlvblBhdGggPSBzQ29uZGl0aW9uUGF0aCA/IGAke3NDb25kaXRpb25QYXRofS8ke3NQYXJ0fWAgOiBzUGFydDtcblx0fVxuXHRyZXR1cm4gc0NvbmRpdGlvblBhdGg7XG59XG5mdW5jdGlvbiBfZ2V0Q29sdW1uRGVmaW5pdGlvbkZyb21TZWxlY3Rpb25GaWVsZHMob01ldGFNb2RlbDogYW55LCBzRW50aXR5U2V0OiBhbnkpIHtcblx0Y29uc3QgYUNvbHVtbkRlZnM6IGFueVtdID0gW10sXG5cdFx0YVNlbGVjdGlvbkZpZWxkcyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXR9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNgKTtcblxuXHRpZiAoYVNlbGVjdGlvbkZpZWxkcykge1xuXHRcdGFTZWxlY3Rpb25GaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAob1NlbGVjdGlvbkZpZWxkOiBhbnkpIHtcblx0XHRcdGNvbnN0IHNTZWxlY3Rpb25GaWVsZFBhdGggPSBgJHtzRW50aXR5U2V0fS8ke29TZWxlY3Rpb25GaWVsZC4kUHJvcGVydHlQYXRofWAsXG5cdFx0XHRcdHNDb25kaXRpb25QYXRoID0gX2dldENvbmRpdGlvblBhdGgob01ldGFNb2RlbCwgc0VudGl0eVNldCwgb1NlbGVjdGlvbkZpZWxkLiRQcm9wZXJ0eVBhdGgpLFxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NTZWxlY3Rpb25GaWVsZFBhdGh9QGApLFxuXHRcdFx0XHRvQ29sdW1uRGVmID0ge1xuXHRcdFx0XHRcdHBhdGg6IHNDb25kaXRpb25QYXRoLFxuXHRcdFx0XHRcdGxhYmVsOiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxcIl0gfHwgc1NlbGVjdGlvbkZpZWxkUGF0aCxcblx0XHRcdFx0XHRzb3J0YWJsZTogdHJ1ZSxcblx0XHRcdFx0XHRmaWx0ZXJhYmxlOiBDb21tb25VdGlscy5pc1Byb3BlcnR5RmlsdGVyYWJsZShvTWV0YU1vZGVsLCBzRW50aXR5U2V0LCBvU2VsZWN0aW9uRmllbGQuJFByb3BlcnR5UGF0aCwgZmFsc2UpLFxuXHRcdFx0XHRcdCRUeXBlOiBvTWV0YU1vZGVsLmdldE9iamVjdChzU2VsZWN0aW9uRmllbGRQYXRoKS4kVHlwZVxuXHRcdFx0XHR9O1xuXHRcdFx0YUNvbHVtbkRlZnMucHVzaChvQ29sdW1uRGVmKTtcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiBhQ29sdW1uRGVmcztcbn1cblxuY29uc3QgVmFsdWVMaXN0SGVscGVyID0ge1xuXHRBTExGUkFHTUVOVFM6IHVuZGVmaW5lZCBhcyBhbnksXG5cdGxvZ0ZyYWdtZW50OiB1bmRlZmluZWQgYXMgYW55LFxuXHRpbml0aWFsaXplQ2FjaGVkVmFsdWVIZWxwOiBmdW5jdGlvbiAoKSB7XG5cdFx0Ly8gRGVzdHJveSBleGlzdGluZyBNREMgdmFsdWUgaGVscCBvYmplY3RzXG5cdFx0YUNhY2hlZFZhbHVlSGVscC5mb3JFYWNoKGZ1bmN0aW9uIChvVmFsdWVIZWxwOiBhbnkpIHtcblx0XHRcdGlmICghb1ZhbHVlSGVscC5vVkhGaWx0ZXJCYXIuaXNEZXN0cm95ZWQoKSkge1xuXHRcdFx0XHRvVmFsdWVIZWxwLm9WSEZpbHRlckJhci5kZXN0cm95KCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoIW9WYWx1ZUhlbHAub1ZIRGlhbG9nVGFibGUuaXNEZXN0cm95ZWQoKSkge1xuXHRcdFx0XHRvVmFsdWVIZWxwLm9WSERpYWxvZ1RhYmxlLmRlc3Ryb3koKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQvLyBpbml0aWFsaXplIGNhY2hlXG5cdFx0YUNhY2hlZFZhbHVlSGVscCA9IFtdO1xuXHRcdGFTdWdnZXN0Q2FjaGVkVmFsdWVIZWxwID0gW107XG5cdH0sXG5cblx0Z2V0Q29sdW1uVmlzaWJpbGl0eUluZm86IGZ1bmN0aW9uIChvVmFsdWVMaXN0OiBhbnksIHNQcm9wZXJ0eUZ1bGxQYXRoOiBhbnksIGJJc0Ryb3BEb3duTGlzdGU6IGFueSwgaXNEaWFsb2dUYWJsZTogYW55KSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9WYWx1ZUxpc3QuJG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IGFDb2x1bW5JbmZvczogYW55W10gPSBbXTtcblx0XHRjb25zdCBvQ29sdW1uSW5mb3MgPSB7XG5cdFx0XHRpc0RpYWxvZ1RhYmxlOiBpc0RpYWxvZ1RhYmxlLFxuXHRcdFx0Y29sdW1uSW5mb3M6IGFDb2x1bW5JbmZvc1xuXHRcdH07XG5cblx0XHRvVmFsdWVMaXN0LlBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob1BhcmFtZXRlcjogYW55KSB7XG5cdFx0XHRjb25zdCBvUHJvcGVydHlBbm5vdGF0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtvVmFsdWVMaXN0LkNvbGxlY3Rpb25QYXRofS8ke29QYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHl9QGApO1xuXHRcdFx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb1Byb3BlcnR5QW5ub3RhdGlvbnMgJiYgb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl07XG5cdFx0XHRsZXQgY29sdW1uSW5mbzogYW55ID0ge307XG5cdFx0XHRpZiAob1RleHRBbm5vdGF0aW9uKSB7XG5cdFx0XHRcdGNvbHVtbkluZm8gPSB7XG5cdFx0XHRcdFx0a2V5Q29sdW1uSGlkZGVuOiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0gPyB0cnVlIDogZmFsc2UsXG5cdFx0XHRcdFx0a2V5Q29sdW1uRGlzcGxheUZvcm1hdDogb1RleHRBbm5vdGF0aW9uICYmIF9nZXRWYWx1ZUhlbHBDb2x1bW5EaXNwbGF5Rm9ybWF0KG9Qcm9wZXJ0eUFubm90YXRpb25zLCBiSXNEcm9wRG93bkxpc3RlKSxcblx0XHRcdFx0XHR0ZXh0Q29sdW1uTmFtZTogb1RleHRBbm5vdGF0aW9uICYmIG9UZXh0QW5ub3RhdGlvbi4kUGF0aCxcblx0XHRcdFx0XHRjb2x1bW5OYW1lOiBvUGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdGhhc0hpZGRlbkFubm90YXRpb246IG9Qcm9wZXJ0eUFubm90YXRpb25zICYmIG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXSA/IHRydWUgOiBmYWxzZVxuXHRcdFx0XHR9O1xuXHRcdFx0fSBlbHNlIGlmIChvUHJvcGVydHlBbm5vdGF0aW9ucyAmJiBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0pIHtcblx0XHRcdFx0Y29sdW1uSW5mbyA9IHtcblx0XHRcdFx0XHRjb2x1bW5OYW1lOiBvUGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdGhhc0hpZGRlbkFubm90YXRpb246IG9Qcm9wZXJ0eUFubm90YXRpb25zICYmIG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXSA/IHRydWUgOiBmYWxzZVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdFx0b0NvbHVtbkluZm9zLmNvbHVtbkluZm9zLnB1c2goY29sdW1uSW5mbyk7XG5cdFx0fSk7XG5cblx0XHRyZXR1cm4gb0NvbHVtbkluZm9zO1xuXHR9LFxuXG5cdC8vIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCBmb3IgdmFsdWUgaGVscCBtLXRhYmxlIGFuZCBtZGMtdGFibGVcblx0Z2V0Q29sdW1uVmlzaWJpbGl0eTogZnVuY3Rpb24gKG9WYWx1ZUxpc3Q6IGFueSwgb1ZMUGFyYW1ldGVyOiBhbnksIG9Tb3VyY2U6IGFueSkge1xuXHRcdGNvbnN0IGlzRHJvcERvd25MaXN0ID0gb1NvdXJjZSAmJiAhIW9Tb3VyY2UudmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzLFxuXHRcdFx0b0NvbHVtbkluZm8gPSBvU291cmNlLmNvbHVtbkluZm8sXG5cdFx0XHRpc1Zpc2libGUgPSAhX3JlZHVuZGFudERlc2NyaXB0aW9uKG9WTFBhcmFtZXRlciwgb0NvbHVtbkluZm8uY29sdW1uSW5mb3MpLFxuXHRcdFx0aXNEaWFsb2dUYWJsZSA9IG9Db2x1bW5JbmZvLmlzRGlhbG9nVGFibGU7XG5cblx0XHRpZiAoaXNEcm9wRG93bkxpc3QgfHwgKCFpc0Ryb3BEb3duTGlzdCAmJiBpc0RpYWxvZ1RhYmxlKSB8fCAoIWlzRHJvcERvd25MaXN0ICYmICFfaGFzSW1wb3J0YW5jZUhpZ2gob1ZhbHVlTGlzdCkpKSB7XG5cdFx0XHRjb25zdCBjb2x1bW5XaXRoSGlkZGVuQW5ub3RhdGlvbiA9IG9Db2x1bW5JbmZvLmNvbHVtbkluZm9zLmZpbmQoZnVuY3Rpb24gKGNvbHVtbkluZm86IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb1ZMUGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5ID09PSBjb2x1bW5JbmZvLmNvbHVtbk5hbWUgJiYgY29sdW1uSW5mby5oYXNIaWRkZW5Bbm5vdGF0aW9uID09PSB0cnVlO1xuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gIWNvbHVtbldpdGhIaWRkZW5Bbm5vdGF0aW9uID8gaXNWaXNpYmxlIDogZmFsc2U7XG5cdFx0fSBlbHNlIGlmICghaXNEcm9wRG93bkxpc3QgJiYgX2hhc0ltcG9ydGFuY2VIaWdoKG9WYWx1ZUxpc3QpKSB7XG5cdFx0XHRyZXR1cm4gb1ZMUGFyYW1ldGVyICYmXG5cdFx0XHRcdG9WTFBhcmFtZXRlcltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlXCJdICYmXG5cdFx0XHRcdG9WTFBhcmFtZXRlcltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JbXBvcnRhbmNlXCJdLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkltcG9ydGFuY2VUeXBlL0hpZ2hcIlxuXHRcdFx0XHQ/IHRydWVcblx0XHRcdFx0OiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cblx0Z2V0U29ydENvbmRpdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudDogZnVuY3Rpb24gKG9WYWx1ZUxpc3Q6IGFueSwgYlN1Z2dlc3Rpb246IGFueSkge1xuXHRcdGNvbnN0IHNQcmVzZW50YXRpb25WYXJpYW50UXVhbGlmaWVyID1cblx0XHRcdFx0b1ZhbHVlTGlzdC5QcmVzZW50YXRpb25WYXJpYW50UXVhbGlmaWVyID09PSBcIlwiID8gXCJcIiA6IGAjJHtvVmFsdWVMaXN0LlByZXNlbnRhdGlvblZhcmlhbnRRdWFsaWZpZXJ9YCxcblx0XHRcdHNQcmVzZW50YXRpb25WYXJpYW50UGF0aCA9IGAvJHtvVmFsdWVMaXN0LkNvbGxlY3Rpb25QYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUHJlc2VudGF0aW9uVmFyaWFudCR7c1ByZXNlbnRhdGlvblZhcmlhbnRRdWFsaWZpZXJ9YDtcblx0XHRjb25zdCBvUHJlc2VudGF0aW9uVmFyaWFudCA9IG9WYWx1ZUxpc3QuJG1vZGVsLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChzUHJlc2VudGF0aW9uVmFyaWFudFBhdGgpO1xuXHRcdGlmIChvUHJlc2VudGF0aW9uVmFyaWFudCAmJiBvUHJlc2VudGF0aW9uVmFyaWFudC5Tb3J0T3JkZXIpIHtcblx0XHRcdGNvbnN0IHNTb3J0Q29uZGl0aW9uczogYW55ID0ge1xuXHRcdFx0XHRzb3J0ZXJzOiBbXVxuXHRcdFx0fTtcblx0XHRcdGlmIChiU3VnZ2VzdGlvbikge1xuXHRcdFx0XHRvUHJlc2VudGF0aW9uVmFyaWFudC5Tb3J0T3JkZXIuZm9yRWFjaChmdW5jdGlvbiAob0NvbmRpdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1NvcnRlcjogYW55ID0ge307XG5cdFx0XHRcdFx0b1NvcnRlci5wYXRoID0gb0NvbmRpdGlvbi5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdGlmIChvQ29uZGl0aW9uLkRlc2NlbmRpbmcpIHtcblx0XHRcdFx0XHRcdG9Tb3J0ZXIuZGVzY2VuZGluZyA9IHRydWU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9Tb3J0ZXIuYXNjZW5kaW5nID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0c1NvcnRDb25kaXRpb25zLnNvcnRlcnMucHVzaChvU29ydGVyKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBgc29ydGVyOiAke0pTT04uc3RyaW5naWZ5KHNTb3J0Q29uZGl0aW9ucy5zb3J0ZXJzKX1gO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b1ByZXNlbnRhdGlvblZhcmlhbnQuU29ydE9yZGVyLmZvckVhY2goZnVuY3Rpb24gKG9Db25kaXRpb246IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IG9Tb3J0ZXI6IGFueSA9IHt9O1xuXHRcdFx0XHRcdG9Tb3J0ZXIubmFtZSA9IG9Db25kaXRpb24uUHJvcGVydHkuJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHRpZiAob0NvbmRpdGlvbi5EZXNjZW5kaW5nKSB7XG5cdFx0XHRcdFx0XHRvU29ydGVyLmRlc2NlbmRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvU29ydGVyLmFzY2VuZGluZyA9IHRydWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHNTb3J0Q29uZGl0aW9ucy5zb3J0ZXJzLnB1c2gob1NvcnRlcik7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoc1NvcnRDb25kaXRpb25zKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblx0aGFzSW1wb3J0YW5jZTogZnVuY3Rpb24gKG9WYWx1ZUxpc3RDb250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gX2hhc0ltcG9ydGFuY2VIaWdoKG9WYWx1ZUxpc3RDb250ZXh0LmdldE9iamVjdCgpKSA/IFwiSW1wb3J0YW5jZS9IaWdoXCIgOiBcIk5vbmVcIjtcblx0fSxcblx0Z2V0TWluU2NyZWVuV2lkdGg6IGZ1bmN0aW9uIChvVmFsdWVMaXN0OiBhbnkpIHtcblx0XHRyZXR1cm4gX2hhc0ltcG9ydGFuY2VIaWdoKG9WYWx1ZUxpc3QpID8gXCJ7PSAke19WSFVJPi9taW5TY3JlZW5XaWR0aH19XCIgOiBcIjQxNnB4XCI7XG5cdH0sXG5cdGdldFRhYmxlSXRlbXNQYXJhbWV0ZXJzOiBmdW5jdGlvbiAob1ZhbHVlTGlzdDogYW55LCBzUmVxdWVzdEdyb3VwSWQ6IGFueSwgYlN1Z2dlc3Rpb246IGFueSwgYlZhbHVlSGVscFdpdGhGaXhlZFZhbHVlczogYW55KSB7XG5cdFx0bGV0IHNQYXJhbWV0ZXJzID0gXCJcIjtcblx0XHRjb25zdCBiU3VzcGVuZGVkID0gb1ZhbHVlTGlzdC5QYXJhbWV0ZXJzLnNvbWUoZnVuY3Rpb24gKG9QYXJhbWV0ZXI6IGFueSkge1xuXHRcdFx0cmV0dXJuIGJTdWdnZXN0aW9uIHx8IG9QYXJhbWV0ZXIuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlckluXCI7XG5cdFx0fSk7XG5cblx0XHRpZiAoc1JlcXVlc3RHcm91cElkKSB7XG5cdFx0XHRzUGFyYW1ldGVycyA9IFwiLCBwYXJhbWV0ZXJzOiB7JCRncm91cElkOiAnXCIgKyBzUmVxdWVzdEdyb3VwSWQgKyBcIidcIjtcblx0XHR9XG5cblx0XHQvLyBhZGQgc2VsZWN0IHRvIG9CaW5kaW5nSW5mbyAoQkNQIDIxODAyNTU5NTYgLyAyMTcwMTYzMDEyKVxuXHRcdGNvbnN0IHNTZWxlY3QgPSBfYnVpbGQkU2VsZWN0U3RyaW5nKHRoaXMpO1xuXHRcdGlmIChzU2VsZWN0KSB7XG5cdFx0XHRpZiAoc1BhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRzUGFyYW1ldGVycyA9IHNQYXJhbWV0ZXJzICsgXCIsICdcIiArIHNTZWxlY3QgKyBcIidcIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNQYXJhbWV0ZXJzID0gXCIsIHBhcmFtZXRlcnM6IHskc2VsZWN0OiAnXCIgKyBzU2VsZWN0ICsgXCInXCI7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKHNQYXJhbWV0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdHNQYXJhbWV0ZXJzID0gc1BhcmFtZXRlcnMgKyBcIiB9XCI7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgc0xlbmd0aFBhcmFtZXRlciA9IGJWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMgPyBcIlwiIDogXCIsIGxlbmd0aDogMTBcIixcblx0XHRcdHNTb3J0Q29uZGl0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50ID0gVmFsdWVMaXN0SGVscGVyLmdldFNvcnRDb25kaXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQob1ZhbHVlTGlzdCwgYlN1Z2dlc3Rpb24pLFxuXHRcdFx0c1NvcnRDb25kaXRpb25zUGFyYW1ldGVyID0gc1NvcnRDb25kaXRpb25zRnJvbVByZXNlbnRhdGlvblZhcmlhbnQgPyBcIiwgXCIgKyBzU29ydENvbmRpdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCArIFwifVwiIDogXCJ9XCI7XG5cblx0XHRyZXR1cm4gKFxuXHRcdFx0XCJ7cGF0aDogJy9cIiArXG5cdFx0XHRvVmFsdWVMaXN0LkNvbGxlY3Rpb25QYXRoICtcblx0XHRcdFwiJ1wiICtcblx0XHRcdHNQYXJhbWV0ZXJzICtcblx0XHRcdFwiLCBzdXNwZW5kZWQgOiBcIiArXG5cdFx0XHRiU3VzcGVuZGVkICtcblx0XHRcdHNMZW5ndGhQYXJhbWV0ZXIgK1xuXHRcdFx0c1NvcnRDb25kaXRpb25zUGFyYW1ldGVyXG5cdFx0KTtcblx0fSxcblx0Z2V0VGFibGVEZWxlZ2F0ZTogZnVuY3Rpb24gKG9WYWx1ZUxpc3Q6IGFueSkge1xuXHRcdGxldCBzRGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUgPSBfZ2V0RGVmYXVsdFNvcnRQcm9wZXJ0eU5hbWUob1ZhbHVlTGlzdCk7XG5cdFx0aWYgKHNEZWZhdWx0U29ydFByb3BlcnR5TmFtZSkge1xuXHRcdFx0c0RlZmF1bHRTb3J0UHJvcGVydHlOYW1lID0gYCcke3NEZWZhdWx0U29ydFByb3BlcnR5TmFtZX0nYDtcblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdFwie25hbWU6ICdzYXAvZmUvbWFjcm9zL2ludGVybmFsL3ZhbHVlaGVscC9UYWJsZURlbGVnYXRlJywgcGF5bG9hZDoge2NvbGxlY3Rpb25OYW1lOiAnXCIgK1xuXHRcdFx0b1ZhbHVlTGlzdC5Db2xsZWN0aW9uUGF0aCArXG5cdFx0XHRcIidcIiArXG5cdFx0XHQoc0RlZmF1bHRTb3J0UHJvcGVydHlOYW1lID8gXCIsIGRlZmF1bHRTb3J0UHJvcGVydHlOYW1lOiBcIiArIHNEZWZhdWx0U29ydFByb3BlcnR5TmFtZSA6IFwiXCIpICtcblx0XHRcdFwifX1cIlxuXHRcdCk7XG5cdH0sXG5cdGdldFByb3BlcnR5UGF0aDogZnVuY3Rpb24gKG9QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRyZXR1cm4gIW9QYXJhbWV0ZXJzLlVuYm91bmRBY3Rpb25cblx0XHRcdD8gYCR7b1BhcmFtZXRlcnMuRW50aXR5VHlwZVBhdGh9LyR7b1BhcmFtZXRlcnMuQWN0aW9ufS8ke29QYXJhbWV0ZXJzLlByb3BlcnR5fWBcblx0XHRcdDogYC8ke29QYXJhbWV0ZXJzLkFjdGlvbi5zdWJzdHJpbmcob1BhcmFtZXRlcnMuQWN0aW9uLmxhc3RJbmRleE9mKFwiLlwiKSArIDEpfS8ke29QYXJhbWV0ZXJzLlByb3BlcnR5fWA7XG5cdH0sXG5cdGdldFdhaXRGb3JQcm9taXNlOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHdhaXRGb3JQcm9taXNlO1xuXHR9LFxuXHRnZXRWYWx1ZUxpc3RDb2xsZWN0aW9uRW50aXR5U2V0OiBmdW5jdGlvbiAob1ZhbHVlTGlzdENvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IG1WYWx1ZUxpc3QgPSBvVmFsdWVMaXN0Q29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRyZXR1cm4gbVZhbHVlTGlzdC4kbW9kZWwuZ2V0TWV0YU1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoYC8ke21WYWx1ZUxpc3QuQ29sbGVjdGlvblBhdGh9YCk7XG5cdH0sXG5cdGdldFZhbHVlTGlzdFByb3BlcnR5OiBmdW5jdGlvbiAob1Byb3BlcnR5Q29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgb1ZhbHVlTGlzdE1vZGVsID0gb1Byb3BlcnR5Q29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdGNvbnN0IG1WYWx1ZUxpc3QgPSBvVmFsdWVMaXN0TW9kZWwuZ2V0T2JqZWN0KFwiL1wiKTtcblx0XHRyZXR1cm4gbVZhbHVlTGlzdC4kbW9kZWwuZ2V0TWV0YU1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQoYC8ke21WYWx1ZUxpc3QuQ29sbGVjdGlvblBhdGh9LyR7b1Byb3BlcnR5Q29udGV4dC5nZXRPYmplY3QoKX1gKTtcblx0fSxcblx0Z2V0VmFsdWVMaXN0SW5mb1dpdGhVc2VDYXNlU2Vuc2l0aXZlOiBmdW5jdGlvbiAob1ZhbHVlTGlzdEluZm86IGFueSkge1xuXHRcdGNvbnN0IHNDb2xsZWN0aW9uUGF0aDogc3RyaW5nID0gb1ZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aCxcblx0XHRcdG9NZXRhTW9kZWw6IGFueSA9IG9WYWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uJG1vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdHJldHVybiBQcm9taXNlLmFsbChbXG5cdFx0XHRvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3QoYC8ke3NDb2xsZWN0aW9uUGF0aH1AT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5GaWx0ZXJGdW5jdGlvbnNgKSxcblx0XHRcdG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgL0BPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlckZ1bmN0aW9uc2ApXG5cdFx0XSlcblx0XHRcdC50aGVuKChbZW50aXR5RmlsdGVyRnVuY3Rpb25zLCBjb250YWluZXJGaWx0ZXJGdW5jdGlvbnNdOiBbc3RyaW5nIHwgdW5kZWZpbmVkLCBzdHJpbmcgfCB1bmRlZmluZWRdKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGZpbHRlckZ1bmN0aW9ucyA9IGVudGl0eUZpbHRlckZ1bmN0aW9ucyB8fCBjb250YWluZXJGaWx0ZXJGdW5jdGlvbnM7XG5cdFx0XHRcdG9WYWx1ZUxpc3RJbmZvLnVzZUNhc2VTZW5zaXRpdmUgPSBmaWx0ZXJGdW5jdGlvbnMgPyBmaWx0ZXJGdW5jdGlvbnMuaW5kZXhPZihcInRvbG93ZXJcIikgPT09IC0xIDogdHJ1ZTtcblx0XHRcdFx0cmV0dXJuIG9WYWx1ZUxpc3RJbmZvO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiZXJyb3IgdHJ5aW5nIHRvIGdldCB0aGUgdmFsdWUgaGVscCBlbnRpdHlTZXQgY2FwYWJpbGl0aWVzXCIpO1xuXHRcdFx0XHR0aHJvdyBlcnI7XG5cdFx0XHR9KTtcblx0fSxcblx0Z2V0VmFsdWVMaXN0SW5mbzogZnVuY3Rpb24gKG9GVkg6IGFueSwgb01ldGFNb2RlbDogYW55LCBwcm9wZXJ0eVBhdGg6IGFueSwgc0NvbmRpdGlvbk1vZGVsPzogYW55LCBvUHJvcGVydGllcz86IGFueSkge1xuXHRcdGxldCBzS2V5OiBzdHJpbmcsXG5cdFx0XHRzRGVzY3JpcHRpb25QYXRoOiBzdHJpbmcsXG5cdFx0XHRzUHJvcGVydHlQYXRoLFxuXHRcdFx0c0ZpZWxkUHJvcGVydHlQYXRoID0gXCJcIjtcblx0XHRjb25zdCBzUHJvcGVydHlOYW1lOiBzdHJpbmcgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtwcm9wZXJ0eVBhdGh9QHNhcHVpLm5hbWVgKSBhcyBzdHJpbmcsXG5cdFx0XHRhSW5QYXJhbWV0ZXJzOiBhbnlbXSA9IFtdLFxuXHRcdFx0YU91dFBhcmFtZXRlcnM6IGFueVtdID0gW107XG5cdFx0Ly8gQWRkaW5nIGJBdXRvRXhwYW5kU2VsZWN0IChzZWNvbmQgcGFyYW1ldGVyIG9mIHJlcXVlc3RWYWx1ZUxpc3RJbmZvKSBhcyB0cnVlIGJ5IGRlZmF1bHRcblx0XHRyZXR1cm4gb01ldGFNb2RlbFxuXHRcdFx0LnJlcXVlc3RWYWx1ZUxpc3RJbmZvKHByb3BlcnR5UGF0aCwgdHJ1ZSwgb0ZWSC5nZXRCaW5kaW5nQ29udGV4dCgpKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG1WYWx1ZUxpc3RJbmZvOiBhbnkpIHtcblx0XHRcdFx0Y29uc3QgYlByb2Nlc3NJbk91dCA9IG9GVkguZ2V0SW5QYXJhbWV0ZXJzKCkubGVuZ3RoICsgb0ZWSC5nZXRPdXRQYXJhbWV0ZXJzKCkubGVuZ3RoID09PSAwLFxuXHRcdFx0XHRcdG9WSFVJTW9kZWwgPSBvRlZILmdldE1vZGVsKFwiX1ZIVUlcIiksXG5cdFx0XHRcdFx0cXVhbGlmaWVyRm9yVmFsaWRhdGlvbiA9IG9GVkguZGF0YShcInZhbHVlbGlzdEZvclZhbGlkYXRpb25cIiksXG5cdFx0XHRcdFx0YlN1Z2dlc3Rpb24gPSBvVkhVSU1vZGVsLmdldFByb3BlcnR5KFwiL2lzU3VnZ2VzdGlvblwiKSxcblx0XHRcdFx0XHRoYXNWYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnMgPSBvVkhVSU1vZGVsLmdldFByb3BlcnR5KFwiL2hhc1ZhbHVlTGlzdFJlbGV2YW50UXVhbGlmaWVyc1wiKSxcblx0XHRcdFx0XHRhQ29sbGVjdGl2ZVNlYXJjaEl0ZW1zID0gb0ZWSC5nZXRBZ2dyZWdhdGlvbihcImNvbGxlY3RpdmVTZWFyY2hJdGVtc1wiKSB8fCBbXSxcblx0XHRcdFx0XHRhVmFsdWVIZWxwS2V5cyA9IE9iamVjdC5rZXlzKG1WYWx1ZUxpc3RJbmZvKSxcblx0XHRcdFx0XHRpbmRleERlZmF1bHRWSCA9IGFWYWx1ZUhlbHBLZXlzLmluZGV4T2YoXCJcIiksXG5cdFx0XHRcdFx0aXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMgPSBvRlZILmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KGAke3Byb3BlcnR5UGF0aH1AYClbXG5cdFx0XHRcdFx0XHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzXCJcblx0XHRcdFx0XHRdO1xuXHRcdFx0XHRsZXQgc1ZhbHVlSGVscElkLFxuXHRcdFx0XHRcdHNWYWx1ZUhlbHBRdWFsaWZpZXIgPSBhVmFsdWVIZWxwS2V5c1swXTtcblx0XHRcdFx0Ly8gVmFsdWVIZWxwIHcvbyBxdWFsaWZpZXIgc2hvdWxkIGJlIHRoZSBmaXJzdFxuXHRcdFx0XHRpZiAoaW5kZXhEZWZhdWx0VkggJiYgaW5kZXhEZWZhdWx0VkggPiAwKSB7XG5cdFx0XHRcdFx0YVZhbHVlSGVscEtleXMudW5zaGlmdChhVmFsdWVIZWxwS2V5c1tpbmRleERlZmF1bHRWSF0pO1xuXHRcdFx0XHRcdGFWYWx1ZUhlbHBLZXlzLnNwbGljZShpbmRleERlZmF1bHRWSCArIDEsIDEpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIE5vIHZhbGlkIHF1YWxpZmllciBzaG91bGQgYmUgaGFuZGxlZCBpbiBtZGNcblx0XHRcdFx0aWYgKHNWYWx1ZUhlbHBRdWFsaWZpZXIgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdHJldHVybiBvRlZILmdldE1vZGVsKFwiX1ZIVUlcIikuc2V0UHJvcGVydHkoXCIvbm9WYWxpZFZhbHVlSGVscFwiLCB0cnVlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBNdWx0aXBsZS9Db2xsZWN0aXZlIFZhbHVlSGVscCBhbmQvb3IgQ29udGV4dERlcGVuZGVudFZhbHVlSGVscCAoQ29udGV4dERlcGVuZGVudFZhbHVlSGVscCBub3QgdXNlZCBpbiBMUi1GaWx0ZXJiYXIsIEFjdGlvbi9DcmVhdGUtRGlhbG9nKVxuXHRcdFx0XHRpZiAoaGFzVmFsdWVMaXN0UmVsZXZhbnRRdWFsaWZpZXJzIHx8IGFWYWx1ZUhlbHBLZXlzLmxlbmd0aCA+IDEgfHwgYUNvbGxlY3RpdmVTZWFyY2hJdGVtcy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0Ly8gVmFsdWUgaGVscCB3aXRoIFZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyByZXR1cm5zIGFsd2F5cyBrZXkgXCJcIiwgdGhlICRxdWFsaWZpZXIgY29udGFpbnMgdGhlIHZhbHVlIGhlbHAgcXVhbGlmaWVyXG5cdFx0XHRcdFx0aWYgKGlzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzKSB7XG5cdFx0XHRcdFx0XHRzVmFsdWVIZWxwSWQgPVxuXHRcdFx0XHRcdFx0XHRtVmFsdWVMaXN0SW5mb1tcIlwiXS4kcXVhbGlmaWVyID09PSBcIlwiXG5cdFx0XHRcdFx0XHRcdFx0PyBgJHtvRlZILmdldElkKCl9Ojpub24tcXVhbGlmaWVyYFxuXHRcdFx0XHRcdFx0XHRcdDogYCR7b0ZWSC5nZXRJZCgpfTo6cXVhbGlmaWVyOjoke21WYWx1ZUxpc3RJbmZvW1wiXCJdLiRxdWFsaWZpZXJ9YDtcblx0XHRcdFx0XHRcdC8vIFN0b3JlIGluIFZhbHVlSGVscCBtb2RlbFxuXHRcdFx0XHRcdFx0b1ZIVUlNb2RlbC5zZXRQcm9wZXJ0eShcIi92YWx1ZUhlbHBJZFwiLCBzVmFsdWVIZWxwSWQpO1xuXHRcdFx0XHRcdFx0bVZhbHVlTGlzdEluZm8gPSBtVmFsdWVMaXN0SW5mb1tcIlwiXTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGJTdWdnZXN0aW9uICYmIGFWYWx1ZUhlbHBLZXlzLmluZGV4T2YocXVhbGlmaWVyRm9yVmFsaWRhdGlvbikgPiAtMSkge1xuXHRcdFx0XHRcdFx0Ly8gSW4gY2FzZSBvZiB0eXBlLWFoZWFkIHRoZSBhdmFpYWJsZSBxdWFsaWZlciBmb3IgdmFsaWRhdGlvbiBpcyB1c2VkXG5cdFx0XHRcdFx0XHRzVmFsdWVIZWxwSWQgPVxuXHRcdFx0XHRcdFx0XHRxdWFsaWZpZXJGb3JWYWxpZGF0aW9uID09PSBcIlwiXG5cdFx0XHRcdFx0XHRcdFx0PyBgJHtvRlZILmdldElkKCl9Ojpub24tcXVhbGlmaWVyYFxuXHRcdFx0XHRcdFx0XHRcdDogYCR7b0ZWSC5nZXRJZCgpfTo6cXVhbGlmaWVyOjoke3F1YWxpZmllckZvclZhbGlkYXRpb259YDtcblx0XHRcdFx0XHRcdC8vIFN0b3JlIGluIFZhbHVlSGVscCBtb2RlbFxuXHRcdFx0XHRcdFx0b1ZIVUlNb2RlbC5zZXRQcm9wZXJ0eShcIi92YWx1ZUhlbHBJZFwiLCBzVmFsdWVIZWxwSWQpO1xuXHRcdFx0XHRcdFx0b1ZIVUlNb2RlbC5zZXRQcm9wZXJ0eShcIi9jb2xsZWN0aXZlU2VhcmNoS2V5XCIsIHF1YWxpZmllckZvclZhbGlkYXRpb24pO1xuXHRcdFx0XHRcdFx0bVZhbHVlTGlzdEluZm8gPSBtVmFsdWVMaXN0SW5mb1txdWFsaWZpZXJGb3JWYWxpZGF0aW9uXTtcblx0XHRcdFx0XHRcdG9GVkguc2V0UHJvcGVydHkoXCJ2YWxpZGF0ZUlucHV0XCIsIHRydWUpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvLyBJbiBjYXNlIG9mIGNvbnRleHQgaXMgY2hhbmdlcyAtLT4gbWF5IGJlIGNvbGxlY3RpdmVTZWFyY2hJdGVtIG5lZWRzIHRvIGJlIHJlbW92ZWRcblx0XHRcdFx0XHRcdGFDb2xsZWN0aXZlU2VhcmNoSXRlbXMuZm9yRWFjaChmdW5jdGlvbiAob0l0ZW06IGFueSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoIWFWYWx1ZUhlbHBLZXlzLmluY2x1ZGVzKG9JdGVtLmdldEtleSgpKSkge1xuXHRcdFx0XHRcdFx0XHRcdG9GVkgucmVtb3ZlQWdncmVnYXRpb24oXCJjb2xsZWN0aXZlU2VhcmNoSXRlbXNcIiwgb0l0ZW0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdC8vIERyb3AtZG93biAodmggc2VsZWN0aW9uKSBvbmx5IHZpc2libGUgaWYgbW9yZSB0aGVuIDEgVkhcblx0XHRcdFx0XHRcdGlmIChhVmFsdWVIZWxwS2V5cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRcdFx0b0ZWSC5yZW1vdmVBbGxBZ2dyZWdhdGlvbihcImNvbGxlY3RpdmVTZWFyY2hJdGVtc1wiKTtcblx0XHRcdFx0XHRcdFx0b1Byb3BlcnRpZXMuY29sbGVjdGl2ZVNlYXJjaEtleSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGFWYWx1ZUhlbHBLZXlzLmZvckVhY2goZnVuY3Rpb24gKHNWYWx1ZUhlbHBLZXk6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdGFDb2xsZWN0aXZlU2VhcmNoSXRlbXMuZmlsdGVyKGZ1bmN0aW9uIChvSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvSXRlbS5nZXRLZXkoKSA9PT0gc1ZhbHVlSGVscEtleTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pLmxlbmd0aCA9PT0gMFxuXHRcdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0b0ZWSC5hZGRBZ2dyZWdhdGlvbihcblx0XHRcdFx0XHRcdFx0XHRcdFx0XCJjb2xsZWN0aXZlU2VhcmNoSXRlbXNcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0bmV3IEl0ZW0oe1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGtleTogc1ZhbHVlSGVscEtleSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBtVmFsdWVMaXN0SW5mb1tzVmFsdWVIZWxwS2V5XS5MYWJlbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlbmFibGVkOiB0cnVlXG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpZiAob1Byb3BlcnRpZXMgJiYgb1Byb3BlcnRpZXMuY29sbGVjdGl2ZVNlYXJjaEtleSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdHNWYWx1ZUhlbHBRdWFsaWZpZXIgPSBvUHJvcGVydGllcy5jb2xsZWN0aXZlU2VhcmNoS2V5O1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChvUHJvcGVydGllcyAmJiBvUHJvcGVydGllcy5jb2xsZWN0aXZlU2VhcmNoS2V5ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0c1ZhbHVlSGVscFF1YWxpZmllciA9IGFWYWx1ZUhlbHBLZXlzWzBdO1xuXHRcdFx0XHRcdFx0XHRvUHJvcGVydGllcy5jb2xsZWN0aXZlU2VhcmNoS2V5ID0gYVZhbHVlSGVscEtleXNbMF07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyBCdWlsZCBWYWx1ZUhlbHAgSWRcblx0XHRcdFx0XHRcdHNWYWx1ZUhlbHBJZCA9XG5cdFx0XHRcdFx0XHRcdHNWYWx1ZUhlbHBRdWFsaWZpZXIgPT09IFwiXCJcblx0XHRcdFx0XHRcdFx0XHQ/IGAke29GVkguZ2V0SWQoKX06Om5vbi1xdWFsaWZpZXJgXG5cdFx0XHRcdFx0XHRcdFx0OiBgJHtvRlZILmdldElkKCl9OjpxdWFsaWZpZXI6OiR7c1ZhbHVlSGVscFF1YWxpZmllcn1gO1xuXHRcdFx0XHRcdFx0Ly8gU3RvcmUgaW4gVmFsdWVIZWxwIG1vZGVsXG5cdFx0XHRcdFx0XHRvRlZILmdldE1vZGVsKFwiX1ZIVUlcIikuc2V0UHJvcGVydHkoXCIvdmFsdWVIZWxwSWRcIiwgc1ZhbHVlSGVscElkKTtcblx0XHRcdFx0XHRcdG9GVkguZ2V0TW9kZWwoXCJfVkhVSVwiKS5zZXRQcm9wZXJ0eShcIi9jb2xsZWN0aXZlU2VhcmNoS2V5XCIsIHNWYWx1ZUhlbHBRdWFsaWZpZXIpO1xuXHRcdFx0XHRcdFx0Ly8gR2V0IFZhbHVlSGVscCBieSBxdWFsaWZpZXJcblx0XHRcdFx0XHRcdG1WYWx1ZUxpc3RJbmZvID0gbVZhbHVlTGlzdEluZm9bc1ZhbHVlSGVscFF1YWxpZmllcl07XG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdCFvRlZILmdldFBhcmVudCgpLmlzQShcInNhcC51aS5tZGMuRmlsdGVyQmFyXCIpICYmXG5cdFx0XHRcdFx0XHRcdGJTdWdnZXN0aW9uICYmXG5cdFx0XHRcdFx0XHRcdHF1YWxpZmllckZvclZhbGlkYXRpb24gIT09IHNWYWx1ZUhlbHBRdWFsaWZpZXJcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRvRlZILnNldFByb3BlcnR5KFwidmFsaWRhdGVJbnB1dFwiLCBmYWxzZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdC8vIERlZmF1bHQgVmFsdWVIZWxwICh0aGUgZmlyc3Qvb25seSBvbmUpIGlzIG5vcm1hbGx5IFZhbHVlSGVscCB3L28gcXVhbGlmaWVyXG5cdFx0XHRcdFx0bVZhbHVlTGlzdEluZm8gPSBtVmFsdWVMaXN0SW5mb1tzVmFsdWVIZWxwUXVhbGlmaWVyXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRsZXQgc0NvbnRleHRQcmVmaXggPSBcIlwiO1xuXG5cdFx0XHRcdGNvbnN0IGJDb25zaWRlckluT3V0ID0gVmFsdWVMaXN0SGVscGVyLmNvbnNpZGVySW5PdXRQYXJhbWV0ZXIob0ZWSCwgcHJvcGVydHlQYXRoKTtcblxuXHRcdFx0XHRpZiAob0ZWSC5kYXRhKFwidXNlTXVsdGlWYWx1ZUZpZWxkXCIpID09PSBcInRydWVcIiAmJiBvRlZILmdldEJpbmRpbmdDb250ZXh0KCkgJiYgb0ZWSC5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKSkge1xuXHRcdFx0XHRcdGNvbnN0IGFCaW5kaWdDb250ZXh0UGFydHMgPSBvRlZILmdldEJpbmRpbmdDb250ZXh0KCkuZ2V0UGF0aCgpLnNwbGl0KFwiL1wiKTtcblx0XHRcdFx0XHRjb25zdCBhUHJvcGVydHlCaW5kaW5nUGFydHMgPSBwcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0XHRcdGlmIChhUHJvcGVydHlCaW5kaW5nUGFydHMubGVuZ3RoIC0gYUJpbmRpZ0NvbnRleHRQYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhQ29udGV4dFByZWZpeFBhcnRzID0gW107XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gYUJpbmRpZ0NvbnRleHRQYXJ0cy5sZW5ndGg7IGkgPCBhUHJvcGVydHlCaW5kaW5nUGFydHMubGVuZ3RoIC0gMTsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdGFDb250ZXh0UHJlZml4UGFydHMucHVzaChhUHJvcGVydHlCaW5kaW5nUGFydHNbaV0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0c0NvbnRleHRQcmVmaXggPSBgJHthQ29udGV4dFByZWZpeFBhcnRzLmpvaW4oXCIvXCIpfS9gO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIEFkZCBjb2x1bW4gZGVmaW5pdGlvbnMgZm9yIHByb3BlcnRpZXMgZGVmaW5lZCBhcyBTZWxlY3Rpb24gZmllbGRzIG9uIHRoZSBDb2xsZWN0aW9uUGF0aCBlbnRpdHkgc2V0LlxuXHRcdFx0XHRjb25zdCBvU3ViTWV0YU1vZGVsID0gbVZhbHVlTGlzdEluZm8uJG1vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0XHRcdHNFbnRpdHlTZXRQYXRoID0gYC8ke21WYWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofWAsXG5cdFx0XHRcdFx0YUNvbHVtbkRlZnMgPSBfZ2V0Q29sdW1uRGVmaW5pdGlvbkZyb21TZWxlY3Rpb25GaWVsZHMob1N1Yk1ldGFNb2RlbCwgc0VudGl0eVNldFBhdGgpLFxuXHRcdFx0XHRcdGFQYXJlbnRGRk5hbWVzID0gVmFsdWVMaXN0SGVscGVyLmdldFBhcmVudEZpbHRlckZpZWxkTmFtZXMob0ZWSCk7XG5cblx0XHRcdFx0Ly8gRGV0ZXJtaW5lIHRoZSBzZXR0aW5nc1xuXHRcdFx0XHQvLyBUT0RPOiBzaW5jZSB0aGlzIGlzIGEgc3RhdGljIGZ1bmN0aW9uIHdlIGNhbid0IHN0b3JlIHRoZSBpbmZvcyB3aGVuIGZpbHRlcmJhciBpcyByZXF1ZXN0ZWQgbGF0ZXJcblx0XHRcdFx0bVZhbHVlTGlzdEluZm8uUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChlbnRyeTogYW55KSB7XG5cdFx0XHRcdFx0Ly9BbGwgU3RyaW5nIGZpZWxkcyBhcmUgYWxsb3dlZCBmb3IgZmlsdGVyXG5cdFx0XHRcdFx0c1Byb3BlcnR5UGF0aCA9IGAvJHttVmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aH0vJHtlbnRyeS5WYWx1ZUxpc3RQcm9wZXJ0eX1gO1xuXHRcdFx0XHRcdGNvbnN0IG9Qcm9wZXJ0eSA9IG1WYWx1ZUxpc3RJbmZvLiRtb2RlbC5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3Qoc1Byb3BlcnR5UGF0aCksXG5cdFx0XHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9ucyA9IG1WYWx1ZUxpc3RJbmZvLiRtb2RlbC5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QoYCR7c1Byb3BlcnR5UGF0aH1AYCkgfHwge307XG5cblx0XHRcdFx0XHQvLyBJZiBvUHJvcGVydHkgaXMgdW5kZWZpbmVkLCB0aGVuIHRoZSBwcm9wZXJ0eSBjb21pbmcgZm9yIHRoZSBlbnRyeSBpc24ndCBkZWZpbmVkIGluXG5cdFx0XHRcdFx0Ly8gdGhlIG1ldGFtb2RlbCwgdGhlcmVmb3JlIHdlIGRvbid0IG5lZWQgdG8gYWRkIGl0IGluIHRoZSBpbi9vdXQgcGFyYW1ldGVyc1xuXHRcdFx0XHRcdGlmIChvUHJvcGVydHkpIHtcblx0XHRcdFx0XHRcdC8vIFNlYXJjaCBmb3IgdGhlICpvdXQgUGFyYW1ldGVyIG1hcHBlZCB0byB0aGUgbG9jYWwgcHJvcGVydHlcblx0XHRcdFx0XHRcdGlmICghc0tleSAmJiBlbnRyeS4kVHlwZS5pbmRleE9mKFwiT3V0XCIpID4gNDggJiYgZW50cnkuTG9jYWxEYXRhUHJvcGVydHkuJFByb3BlcnR5UGF0aCA9PT0gc1Byb3BlcnR5TmFtZSkge1xuXHRcdFx0XHRcdFx0XHQvL1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlclwiLmxlbmd0aCA9IDQ5XG5cdFx0XHRcdFx0XHRcdHNGaWVsZFByb3BlcnR5UGF0aCA9IHNQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdFx0XHRcdHNLZXkgPSBlbnRyeS5WYWx1ZUxpc3RQcm9wZXJ0eTtcblx0XHRcdFx0XHRcdFx0Ly9Pbmx5IHRoZSB0ZXh0IGFubm90YXRpb24gb2YgdGhlIGtleSBjYW4gc3BlY2lmeSB0aGUgZGVzY3JpcHRpb25cblx0XHRcdFx0XHRcdFx0c0Rlc2NyaXB0aW9uUGF0aCA9XG5cdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl0gJiZcblx0XHRcdFx0XHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXS4kUGF0aDtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKGJDb25zaWRlckluT3V0KSB7XG5cdFx0XHRcdFx0XHRcdC8vQ29sbGVjdCBJbiBhbmQgT3V0IFBhcmFtZXRlciAoZXhjZXB0IHRoZSBmaWVsZCBpbiBxdWVzdGlvbilcblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdGJQcm9jZXNzSW5PdXQgJiZcblx0XHRcdFx0XHRcdFx0XHRlbnRyeS4kVHlwZSAhPT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UGFyYW1ldGVyRGlzcGxheU9ubHlcIiAmJlxuXHRcdFx0XHRcdFx0XHRcdGVudHJ5LiRUeXBlICE9PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RQYXJhbWV0ZXJDb25zdGFudFwiICYmXG5cdFx0XHRcdFx0XHRcdFx0ZW50cnkuTG9jYWxEYXRhUHJvcGVydHkgJiZcblx0XHRcdFx0XHRcdFx0XHRlbnRyeS5Mb2NhbERhdGFQcm9wZXJ0eS4kUHJvcGVydHlQYXRoICE9PSBzUHJvcGVydHlOYW1lXG5cdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdGxldCBzVmFsdWVQYXRoID0gXCJcIjtcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChzQ29uZGl0aW9uTW9kZWwgJiYgc0NvbmRpdGlvbk1vZGVsLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRcdFx0b0ZWSC5nZXRQYXJlbnQoKS5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpICYmXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG9GVkguZ2V0QmluZGluZ0NvbnRleHQoKSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRlbnRyeS4kVHlwZS5pbmRleE9mKFwiSW5cIikgPiA0OFxuXHRcdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIFNwZWNpYWwgaGFuZGxpbmcgZm9yIHZhbHVlIGhlbHAgdXNlZCBpbiBmaWx0ZXIgZGlhbG9nXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFQYXJ0cyA9IGVudHJ5LkxvY2FsRGF0YVByb3BlcnR5LiRQcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYVBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzRmlyc3ROYXZpZ2F0aW9uUHJvcGVydHkgPSBhUGFydHNbMF07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb0JvdW5kRW50aXR5ID0gb0ZWSFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0LmdldE1vZGVsKClcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdC5nZXRNZXRhTW9kZWwoKVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0LmdldE1ldGFDb250ZXh0KG9GVkguZ2V0QmluZGluZ0NvbnRleHQoKS5nZXRQYXRoKCkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IHNQYXRoT2ZUYWJsZSA9IG9GVkguZ2V0UGFyZW50KCkuZ2V0Um93QmluZGluZygpLmdldFBhdGgoKTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAob0JvdW5kRW50aXR5LmdldE9iamVjdChgJHtzUGF0aE9mVGFibGV9LyRQYXJ0bmVyYCkgPT09IHNGaXJzdE5hdmlnYXRpb25Qcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gVXNpbmcgdGhlIGNvbmRpdGlvbiBtb2RlbCBkb2Vzbid0IG1ha2UgYW55IHNlbnNlIGluIGNhc2UgYW4gaW4tcGFyYW1ldGVyIHVzZXMgYSBuYXZpZ2F0aW9uIHByb3BlcnR5XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQvLyByZWZlcnJpbmcgdG8gdGhlIHBhcnRuZXIuIFRoZXJlZm9yZSByZWR1Y2luZyB0aGUgcGF0aCBhbmQgdXNpbmcgdGhlIEZWSCBjb250ZXh0IGluc3RlYWQgb2YgdGhlIGNvbmRpdGlvbiBtb2RlbFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c1ZhbHVlUGF0aCA9XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFwie1wiICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZW50cnkuTG9jYWxEYXRhUHJvcGVydHkuJFByb3BlcnR5UGF0aC5yZXBsYWNlKHNGaXJzdE5hdmlnYXRpb25Qcm9wZXJ0eSArIFwiL1wiLCBcIlwiKSArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFwifVwiO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoIXNWYWx1ZVBhdGgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0c1ZhbHVlUGF0aCA9IFwie1wiICsgc0NvbmRpdGlvbk1vZGVsICsgXCI+L2NvbmRpdGlvbnMvXCIgKyBlbnRyeS5Mb2NhbERhdGFQcm9wZXJ0eS4kUHJvcGVydHlQYXRoICsgXCJ9XCI7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdHNWYWx1ZVBhdGggPSBcIntcIiArIHNDb250ZXh0UHJlZml4ICsgZW50cnkuTG9jYWxEYXRhUHJvcGVydHkuJFByb3BlcnR5UGF0aCArIFwifVwiO1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdC8vT3V0IGFuZCBJbk91dFxuXHRcdFx0XHRcdFx0XHRcdGlmIChlbnRyeS4kVHlwZS5pbmRleE9mKFwiT3V0XCIpID4gNDgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmICghYVBhcmVudEZGTmFtZXMgfHwgYVBhcmVudEZGTmFtZXMuaW5kZXhPZihlbnRyeS5Mb2NhbERhdGFQcm9wZXJ0eS4kUHJvcGVydHlQYXRoKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vIEZpbHRlcmJhciBpbnNpZGUgVkggZG9lc24ndCBoYXZlIEFkYXB0IEZpbHRlcnMgZGlhbG9nLiBHZXR0aW5nIEZpbHRlcmZpZWxkcyBmb3Igd2hpY2ggb3V0IHBhcmFtZXRlcnMgY2FuIGJlIGFwcGxpZWQuXG5cdFx0XHRcdFx0XHRcdFx0XHRcdGFPdXRQYXJhbWV0ZXJzLnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0bmV3IE91dFBhcmFtZXRlcih7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogc1ZhbHVlUGF0aCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGhlbHBQYXRoOiBlbnRyeS5WYWx1ZUxpc3RQcm9wZXJ0eVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdC8vSW4gYW5kIEluT3V0XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGVudHJ5LiRUeXBlLmluZGV4T2YoXCJJblwiKSA+IDQ4KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRhSW5QYXJhbWV0ZXJzLnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG5ldyBJblBhcmFtZXRlcih7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0dmFsdWU6IHNWYWx1ZVBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0aGVscFBhdGg6IGVudHJ5LlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGluaXRpYWxWYWx1ZUZpbHRlckVtcHR5OiBlbnRyeS5Jbml0aWFsVmFsdWVJc1NpZ25pZmljYW50XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHQvL290aGVyd2lzZSBkaXNwbGF5T25seSBhbmQgdGhlcmVmb3Igbm90IGNvbnNpZGVyZWRcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8gQ29sbGVjdCBDb25zdGFudCBQYXJhbWV0ZXJcblx0XHRcdFx0XHRcdC8vIFdlIG1hbmFnZSBjb25zdGFudHMgcGFyYW1ldGVycyBhcyBpbiBwYXJhbWV0ZXJzIHNvIHRoaXMgdGhlIHZhbHVlIGxpc3QgdGFibGUgaXMgZmlsdGVyZWQgcHJvcGVybHlcblx0XHRcdFx0XHRcdGlmIChlbnRyeS4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UGFyYW1ldGVyQ29uc3RhbnRcIikge1xuXHRcdFx0XHRcdFx0XHRhSW5QYXJhbWV0ZXJzLnB1c2goXG5cdFx0XHRcdFx0XHRcdFx0bmV3IEluUGFyYW1ldGVyKHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhbHVlOiBlbnRyeS5Db25zdGFudCxcblx0XHRcdFx0XHRcdFx0XHRcdGhlbHBQYXRoOiBlbnRyeS5WYWx1ZUxpc3RQcm9wZXJ0eVxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGxldCBzQ29sdW1uUGF0aCA9IGVudHJ5LlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRzQ29sdW1uUHJvcGVydHlUeXBlID0gb1Byb3BlcnR5LiRUeXBlO1xuXHRcdFx0XHRcdFx0Y29uc3Qgc0xhYmVsID0gb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsXCJdIHx8IHNDb2x1bW5QYXRoO1xuXG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCJdICYmXG5cdFx0XHRcdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFwiXSAmJlxuXHRcdFx0XHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl1cblx0XHRcdFx0XHRcdFx0XHQuJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0T25seVwiXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0Ly8gdGhlIGNvbHVtbiBwcm9wZXJ0eSBpcyB0aGUgb25lIGNvbWluZyBmcm9tIHRoZSB0ZXh0IGFubm90YXRpb25cblx0XHRcdFx0XHRcdFx0c0NvbHVtblBhdGggPSBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXS4kUGF0aDtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc1RleHRQcm9wZXJ0eVBhdGggPSBgLyR7bVZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9LyR7c0NvbHVtblBhdGh9YDtcblx0XHRcdFx0XHRcdFx0c0NvbHVtblByb3BlcnR5VHlwZSA9IG1WYWx1ZUxpc3RJbmZvLiRtb2RlbC5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3Qoc1RleHRQcm9wZXJ0eVBhdGgpLiRUeXBlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3QgYkNvbHVtbk5vdEFscmVhZHlEZWZpbmVkID1cblx0XHRcdFx0XHRcdFx0YUNvbHVtbkRlZnMuZmluZEluZGV4KGZ1bmN0aW9uIChvQ29sOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb0NvbC5wYXRoID09PSBzQ29sdW1uUGF0aDtcblx0XHRcdFx0XHRcdFx0fSkgPT09IC0xO1xuXHRcdFx0XHRcdFx0aWYgKGJDb2x1bW5Ob3RBbHJlYWR5RGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvQ29sdW1uRGVmID0ge1xuXHRcdFx0XHRcdFx0XHRcdHBhdGg6IHNDb2x1bW5QYXRoLFxuXHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBzTGFiZWwsXG5cdFx0XHRcdFx0XHRcdFx0c29ydGFibGU6IHRydWUsXG5cdFx0XHRcdFx0XHRcdFx0ZmlsdGVyYWJsZTogIW9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbkZpbHRlclwiXSxcblx0XHRcdFx0XHRcdFx0XHQkVHlwZTogc0NvbHVtblByb3BlcnR5VHlwZVxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRhQ29sdW1uRGVmcy5wdXNoKG9Db2x1bW5EZWYpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdC8vIEZpbmQgRGVzY3JpcHRpb25QYXRoIGluIGNvbHVtbiBkZWZpbml0aW9uIGlmIG5vdCBhZGQgaXRcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdHNEZXNjcmlwdGlvblBhdGggJiZcblx0XHRcdFx0XHRhQ29sdW1uRGVmcy5maW5kSW5kZXgoZnVuY3Rpb24gKG9Db2x1bW46IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9Db2x1bW4ucGF0aCA9PT0gc0Rlc2NyaXB0aW9uUGF0aDtcblx0XHRcdFx0XHR9KSA9PT0gLTFcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0NvbHVtbkRlZiA9IHtcblx0XHRcdFx0XHRcdHBhdGg6IHNEZXNjcmlwdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRsYWJlbDogc0Rlc2NyaXB0aW9uUGF0aCxcblx0XHRcdFx0XHRcdHNvcnRhYmxlOiBmYWxzZSxcblx0XHRcdFx0XHRcdGZpbHRlcmFibGU6IGZhbHNlLFxuXHRcdFx0XHRcdFx0JFR5cGU6IFwiRWRtLlN0cmluZ1wiXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRhQ29sdW1uRGVmcy5wdXNoKG9Db2x1bW5EZWYpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0a2V5VmFsdWU6IHNLZXksXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25WYWx1ZTogc0Rlc2NyaXB0aW9uUGF0aCxcblx0XHRcdFx0XHRmaWVsZFByb3BlcnR5UGF0aDogc0ZpZWxkUHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdGluUGFyYW1ldGVyczogYUluUGFyYW1ldGVycyxcblx0XHRcdFx0XHRvdXRQYXJhbWV0ZXJzOiBhT3V0UGFyYW1ldGVycyxcblx0XHRcdFx0XHR2YWx1ZUxpc3RJbmZvOiBtVmFsdWVMaXN0SW5mbyxcblx0XHRcdFx0XHRjb2x1bW5EZWZzOiBhQ29sdW1uRGVmc1xuXHRcdFx0XHR9O1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXhjOiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgc01zZyA9XG5cdFx0XHRcdFx0ZXhjLnN0YXR1cyAmJiBleGMuc3RhdHVzID09PSA0MDRcblx0XHRcdFx0XHRcdD8gYE1ldGFkYXRhIG5vdCBmb3VuZCAoJHtleGMuc3RhdHVzfSkgZm9yIHZhbHVlIGhlbHAgb2YgcHJvcGVydHkgJHtwcm9wZXJ0eVBhdGh9YFxuXHRcdFx0XHRcdFx0OiBleGMubWVzc2FnZTtcblx0XHRcdFx0TG9nLmVycm9yKHNNc2cpO1xuXHRcdFx0XHRvRlZILmRlc3Ryb3lDb250ZW50KCk7XG5cdFx0XHR9KTtcblx0fSxcblxuXHQvLyBGb3IgdmFsdWUgaGVscHMgaW4gdGhlIGZpbHRlciBiYXIgb24gTGlzdCBSZXBvcnQsIEluL091dCBwYXJhbWV0ZXJzIG9mIGEgbmF2aWdhdGlvbiBwcm9wZXJ0eVxuXHQvLyBsaWtlIFwiU2FsZXNvcmRlck1hbmFnZS9fSXRlbS9NYXRlcmlhbFwiIGFyZSBub3Qgc3VwcG9ydGVkICh5ZXQpIGFzIHRoZXkgY2Fubm90IGJlIGVhc2lseSByZXNvbHZlZC5cblx0Y29uc2lkZXJJbk91dFBhcmFtZXRlcjogZnVuY3Rpb24gKG9GVkg6IGFueSwgcHJvcGVydHlQYXRoOiBhbnkpIHtcblx0XHRjb25zdCBiaW5kaW5nQ29udGV4dCA9IG9GVkguZ2V0QmluZGluZ0NvbnRleHQoKSxcblx0XHRcdG1ldGFNb2RlbCA9IG9GVkguZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHQvLyBvbiB0aGUgTGlzdHJlcG9ydCB0aGVyZSBpcyBubyBiaW5kaW5nQ29udGV4dFxuXHRcdGlmICghYmluZGluZ0NvbnRleHQpIHtcblx0XHRcdGxldCBzdWJQYXRoID0gcHJvcGVydHlQYXRoO1xuXHRcdFx0bGV0IG1ldGFNb2RlbEZyb21zdWJQYXRoID0gbWV0YU1vZGVsLmdldE9iamVjdChzdWJQYXRoKTtcblx0XHRcdGxldCBjaGVja0JlQWN0aW9uID0gbnVsbDtcblx0XHRcdHdoaWxlIChzdWJQYXRoLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Y2hlY2tCZUFjdGlvbiA9IEFycmF5LmlzQXJyYXkobWV0YU1vZGVsRnJvbXN1YlBhdGgpID8gbWV0YU1vZGVsRnJvbXN1YlBhdGhbMF0gOiBtZXRhTW9kZWxGcm9tc3ViUGF0aDtcblx0XHRcdFx0Ly8gSW4vT3V0IHBhcmFtZXRlcnMgc2hhbGwgYmUgY29uc2lkZXJlZCBpZiB3ZSBoYW5kbGUgYSBBY3Rpb24gYVBhcmFtZXRlclxuXHRcdFx0XHRpZiAoY2hlY2tCZUFjdGlvbj8uJGtpbmQgPT09IFwiQWN0aW9uXCIpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fSBlbHNlIGlmIChjaGVja0JlQWN0aW9uLiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHN1YlBhdGggPSBzdWJQYXRoLnN1YnN0cmluZygwLCBzdWJQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSk7XG5cdFx0XHRcdG1ldGFNb2RlbEZyb21zdWJQYXRoID0gbWV0YU1vZGVsLmdldE9iamVjdChzdWJQYXRoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cblx0Z2V0UGFyZW50RmlsdGVyRmllbGROYW1lczogZnVuY3Rpb24gKG9GVkg6IGFueSkge1xuXHRcdGxldCBhUGFyZW50RkZOYW1lcztcblx0XHRpZiAob0ZWSC5nZXRQYXJlbnQoKS5pc0EoXCJzYXAudWkubWRjLmZpbHRlcmJhci52aC5GaWx0ZXJCYXJcIikgfHwgb0ZWSC5nZXRQYXJlbnQoKS5pc0EoXCJzYXAuZmUuY29yZS5jb250cm9scy5GaWx0ZXJCYXJcIikpIHtcblx0XHRcdGNvbnN0IG9GQiA9IG9GVkguZ2V0UGFyZW50KCk7XG5cdFx0XHRjb25zdCBhUGFyZW50RmlsdGVyRmllbGRzID0gb0ZCLmdldEZpbHRlckl0ZW1zKCk7XG5cdFx0XHRhUGFyZW50RkZOYW1lcyA9IGFQYXJlbnRGaWx0ZXJGaWVsZHMubWFwKGZ1bmN0aW9uIChvRkY6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0ZGLmdldEZpZWxkUGF0aCgpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBhUGFyZW50RkZOYW1lcztcblx0fSxcblxuXHRfdGVtcGxhdGVGcmFnbWVudDogZnVuY3Rpb24gKHNGcmFnbWVudE5hbWU6IGFueSwgb1ZhbHVlTGlzdEluZm86IGFueSwgb1NvdXJjZU1vZGVsOiBhbnksIHByb3BlcnR5UGF0aDogYW55LCBvQWRkaXRpb25hbFZpZXdEYXRhPzogYW55KSB7XG5cdFx0Y29uc3Qgb0ZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIiksXG5cdFx0XHRtVmFsdWVMaXN0SW5mbyA9IG9WYWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8sXG5cdFx0XHRvVmFsdWVMaXN0TW9kZWwgPSBuZXcgSlNPTk1vZGVsKG1WYWx1ZUxpc3RJbmZvKSxcblx0XHRcdG9WYWx1ZUxpc3RTZXJ2aWNlTWV0YU1vZGVsID0gbVZhbHVlTGlzdEluZm8uJG1vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0b1ZpZXdEYXRhID0gbmV3IEpTT05Nb2RlbChcblx0XHRcdFx0T2JqZWN0LmFzc2lnbihcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRjb252ZXJ0ZXJUeXBlOiBcIkxpc3RSZXBvcnRcIixcblx0XHRcdFx0XHRcdGNvbHVtbnM6IG9WYWx1ZUxpc3RJbmZvLmNvbHVtbkRlZnMgfHwgbnVsbFxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0b0FkZGl0aW9uYWxWaWV3RGF0YVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShcblx0XHRcdFhNTFByZXByb2Nlc3Nvci5wcm9jZXNzKFxuXHRcdFx0XHRvRnJhZ21lbnQsXG5cdFx0XHRcdHsgbmFtZTogc0ZyYWdtZW50TmFtZSB9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0Ly9xdWVyeVNlbGVjdG9yKFwiKlwiKVxuXHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFx0dmFsdWVMaXN0OiBvVmFsdWVMaXN0TW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpLFxuXHRcdFx0XHRcdFx0Y29udGV4dFBhdGg6IG9WYWx1ZUxpc3RTZXJ2aWNlTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAvJHttVmFsdWVMaXN0SW5mby5Db2xsZWN0aW9uUGF0aH0vYCksXG5cdFx0XHRcdFx0XHRzb3VyY2U6IG9Tb3VyY2VNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFx0dmFsdWVMaXN0OiBvVmFsdWVMaXN0TW9kZWwsXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogb1ZhbHVlTGlzdFNlcnZpY2VNZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRzb3VyY2U6IG9Tb3VyY2VNb2RlbCxcblx0XHRcdFx0XHRcdG1ldGFNb2RlbDogb1ZhbHVlTGlzdFNlcnZpY2VNZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHR2aWV3RGF0YTogb1ZpZXdEYXRhXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHQpXG5cdFx0KS50aGVuKGZ1bmN0aW9uIChvU3ViRnJhZ21lbnQ6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0xvZ0luZm8gPSB7IHBhdGg6IHByb3BlcnR5UGF0aCwgZnJhZ21lbnROYW1lOiBzRnJhZ21lbnROYW1lLCBmcmFnbWVudDogb1N1YkZyYWdtZW50IH07XG5cdFx0XHRpZiAoTG9nLmdldExldmVsKCkgPT09IExldmVsLkRFQlVHKSB7XG5cdFx0XHRcdC8vSW4gZGVidWcgbW9kZSB3ZSBsb2cgYWxsIGdlbmVyYXRlZCBmcmFnbWVudHNcblx0XHRcdFx0VmFsdWVMaXN0SGVscGVyLkFMTEZSQUdNRU5UUyA9IFZhbHVlTGlzdEhlbHBlci5BTExGUkFHTUVOVFMgfHwgW107XG5cdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5BTExGUkFHTUVOVFMucHVzaChvTG9nSW5mbyk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoVmFsdWVMaXN0SGVscGVyLmxvZ0ZyYWdtZW50KSB7XG5cdFx0XHRcdC8vT25lIFRvb2wgU3Vic2NyaWJlciBhbGxvd2VkXG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5sb2dGcmFnbWVudChvTG9nSW5mbyk7XG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIEZyYWdtZW50LmxvYWQoeyBkZWZpbml0aW9uOiBvU3ViRnJhZ21lbnQgfSk7XG5cdFx0fSk7XG5cdH0sXG5cdGNyZWF0ZVZhbHVlSGVscERpYWxvZzogZnVuY3Rpb24gKHByb3BlcnR5UGF0aDogYW55LCBvRlZIOiBhbnksIG9UYWJsZTogYW55LCBvRmlsdGVyQmFyOiBhbnksIG9WYWx1ZUxpc3RJbmZvOiBhbnksIGJTdWdnZXN0aW9uOiBhbnkpIHtcblx0XHRjb25zdCBzRlZIQ2xhc3MgPSBvRlZILmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpLFxuXHRcdFx0b1dyYXBwZXIgPSBvRlZILmdldERpYWxvZ0NvbnRlbnQgJiYgb0ZWSC5nZXREaWFsb2dDb250ZW50KCksXG5cdFx0XHRzV3JhcHBlcklkID0gb1dyYXBwZXIgJiYgb1dyYXBwZXIuZ2V0SWQoKSxcblx0XHRcdHNWYWx1ZUhlbHBJZCA9IG9GVkguZ2V0TW9kZWwoXCJfVkhVSVwiKS5nZXRQcm9wZXJ0eShcIi92YWx1ZUhlbHBJZFwiKTtcblx0XHRjb25zdCBvUHJvcGVydHlBbm5vdGF0aW9ucyA9IG9GVkguZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QoYCR7cHJvcGVydHlQYXRofUBgKTtcblxuXHRcdC8vT25seSBkbyB0aGlzIGluIGNhc2Ugb2YgY29udGV4dCBkZXBlbmRlbnQgdmFsdWUgaGVscHMgb3Igb3RoZXIgVkggY2FsbGVkIHRoZSBmaXJzdCB0aW1lXG5cdFx0aWYgKCghb1RhYmxlIHx8IHNWYWx1ZUhlbHBJZCAhPT0gdW5kZWZpbmVkKSAmJiBzRlZIQ2xhc3MuaW5kZXhPZihcIkZpZWxkVmFsdWVIZWxwXCIpID4gLTEpIHtcblx0XHRcdC8vQ29tcGxldGUgdGhlIGZpZWxkIHZhbHVlIGhlbHAgY29udHJvbFxuXHRcdFx0b0ZWSC5zZXRUaXRsZShvVmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvLkxhYmVsKTtcblx0XHRcdG9GVkguc2V0S2V5UGF0aChvVmFsdWVMaXN0SW5mby5rZXlWYWx1ZSk7XG5cdFx0XHRvRlZILnNldERlc2NyaXB0aW9uUGF0aChvVmFsdWVMaXN0SW5mby5kZXNjcmlwdGlvblZhbHVlKTtcblx0XHRcdG9GVkguc2V0RmlsdGVyRmllbGRzKF9lbnRpdHlJc1NlYXJjaGFibGUob1ZhbHVlTGlzdEluZm8sIG9Qcm9wZXJ0eUFubm90YXRpb25zKSA/IFwiJHNlYXJjaFwiIDogXCJcIik7XG5cdFx0fVxuXHRcdGNvbnN0IGlzRGlhbG9nVGFibGUgPSB0cnVlO1xuXHRcdGNvbnN0IGJJc0Ryb3BEb3duTGlzdGUgPSBmYWxzZTtcblx0XHRjb25zdCBvQ29sdW1uSW5mbyA9IFZhbHVlTGlzdEhlbHBlci5nZXRDb2x1bW5WaXNpYmlsaXR5SW5mbyhcblx0XHRcdG9WYWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8sXG5cdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRiSXNEcm9wRG93bkxpc3RlLFxuXHRcdFx0aXNEaWFsb2dUYWJsZVxuXHRcdCk7XG5cdFx0Y29uc3Qgb1NvdXJjZU1vZGVsID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRpZDogc1ZhbHVlSGVscElkIHx8IG9GVkguZ2V0SWQoKSxcblx0XHRcdGdyb3VwSWQ6IG9GVkguZGF0YShcInJlcXVlc3RHcm91cElkXCIpIHx8IHVuZGVmaW5lZCxcblx0XHRcdGJTdWdnZXN0aW9uOiBiU3VnZ2VzdGlvbixcblx0XHRcdGNvbHVtbkluZm86IG9Db2x1bW5JbmZvLFxuXHRcdFx0dmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzOiBiSXNEcm9wRG93bkxpc3RlLFxuXHRcdFx0aXNGaWVsZFZhbHVlSGVscDogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0b1RhYmxlID1cblx0XHRcdG9UYWJsZSB8fFxuXHRcdFx0VmFsdWVMaXN0SGVscGVyLl90ZW1wbGF0ZUZyYWdtZW50KFxuXHRcdFx0XHRcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwudmFsdWVoZWxwLlZhbHVlTGlzdERpYWxvZ1RhYmxlXCIsXG5cdFx0XHRcdG9WYWx1ZUxpc3RJbmZvLFxuXHRcdFx0XHRvU291cmNlTW9kZWwsXG5cdFx0XHRcdHByb3BlcnR5UGF0aCxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdGVuYWJsZUF1dG9Db2x1bW5XaWR0aDogIXN5c3RlbS5waG9uZVxuXHRcdFx0XHR9XG5cdFx0XHQpO1xuXG5cdFx0b0ZpbHRlckJhciA9XG5cdFx0XHRvRmlsdGVyQmFyIHx8XG5cdFx0XHRWYWx1ZUxpc3RIZWxwZXIuX3RlbXBsYXRlRnJhZ21lbnQoXG5cdFx0XHRcdFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC52YWx1ZWhlbHAuVmFsdWVMaXN0RmlsdGVyQmFyXCIsXG5cdFx0XHRcdG9WYWx1ZUxpc3RJbmZvLFxuXHRcdFx0XHRvU291cmNlTW9kZWwsXG5cdFx0XHRcdHByb3BlcnR5UGF0aFxuXHRcdFx0KTtcblxuXHRcdHJldHVybiBQcm9taXNlLmFsbChbb1RhYmxlLCBvRmlsdGVyQmFyXSkudGhlbigoYUNvbnRyb2xzOiBbYW55LCBhbnldKSA9PiB7XG5cdFx0XHRjb25zdCBzSW5WYWx1ZUhlbHBJZCA9IG9GVkguZ2V0TW9kZWwoXCJfVkhVSVwiKS5nZXRQcm9wZXJ0eShcIi92YWx1ZUhlbHBJZFwiKSxcblx0XHRcdFx0b0luVGFibGUgPSBhQ29udHJvbHNbMF0sXG5cdFx0XHRcdG9JbkZpbHRlckJhciA9IGFDb250cm9sc1sxXTtcblx0XHRcdGlmIChvSW5UYWJsZSkge1xuXHRcdFx0XHRvSW5UYWJsZS5zZXRNb2RlbChvVmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvLiRtb2RlbCk7XG5cdFx0XHRcdExvZy5pbmZvKFxuXHRcdFx0XHRcdGBWYWx1ZSBMaXN0IC0gRGlhbG9nIFRhYmxlIC0gWE1MIGNvbnRlbnQgY3JlYXRlZCBbJHtwcm9wZXJ0eVBhdGh9XWAsXG5cdFx0XHRcdFx0b0luVGFibGUuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCksXG5cdFx0XHRcdFx0XCJNREMgVGVtcGxhdGluZ1wiXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0luRmlsdGVyQmFyKSB7XG5cdFx0XHRcdG9JbkZpbHRlckJhci5zZXRNb2RlbChvVmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvLiRtb2RlbCk7XG5cdFx0XHRcdExvZy5pbmZvKFxuXHRcdFx0XHRcdGBWYWx1ZSBMaXN0LSBGaWx0ZXJiYXIgLSBYTUwgY29udGVudCBjcmVhdGVkIFske3Byb3BlcnR5UGF0aH1dYCxcblx0XHRcdFx0XHRvSW5GaWx0ZXJCYXIuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCksXG5cdFx0XHRcdFx0XCJNREMgVGVtcGxhdGluZ1wiXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmICgob0luRmlsdGVyQmFyICYmIG9JbkZpbHRlckJhciAhPT0gb0ZWSC5nZXRGaWx0ZXJCYXIoKSkgfHwgKG9JbkZpbHRlckJhciAmJiBzSW5WYWx1ZUhlbHBJZCAhPT0gdW5kZWZpbmVkKSkge1xuXHRcdFx0XHRvRlZILnNldEZpbHRlckJhcihvSW5GaWx0ZXJCYXIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b0ZWSC5hZGREZXBlbmRlbnQob0luRmlsdGVyQmFyKTtcblx0XHRcdH1cblx0XHRcdGlmIChvSW5UYWJsZSAhPT0gb1dyYXBwZXIuZ2V0VGFibGUoKSB8fCBzSW5WYWx1ZUhlbHBJZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdG9XcmFwcGVyLnNldFRhYmxlKG9JblRhYmxlKTtcblx0XHRcdFx0aWYgKG9JbkZpbHRlckJhcikge1xuXHRcdFx0XHRcdG9JblRhYmxlLnNldEZpbHRlcihvSW5GaWx0ZXJCYXIuZ2V0SWQoKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0b0luVGFibGUuaW5pdGlhbGl6ZWQoKTtcblx0XHRcdFx0ZGVsZXRlIHdhaXRGb3JQcm9taXNlW3NXcmFwcGVySWRdO1xuXHRcdFx0fVxuXHRcdFx0Ly8gRGlmZmVyZW50IHRhYmxlIHdpZHRoIGZvciB0eXBlLWFoZWFkIG9yIGRpYWxvZ1xuXHRcdFx0Y29uc3Qgc1RhYmxlV2lkdGggPSB0aGlzLmdldFRhYmxlV2lkdGgob0luVGFibGUsIHRoaXMuX2dldFdpZHRoSW5SZW0ob0ZWSC5fZ2V0RmllbGQoKSkpO1xuXHRcdFx0b0ZWSC5nZXRNb2RlbChcIl9WSFVJXCIpLnNldFByb3BlcnR5KFwiL3RhYmxlV2lkdGhcIiwgc1RhYmxlV2lkdGgpO1xuXHRcdFx0b0luVGFibGUuc2V0V2lkdGgoXCIxMDAlXCIpO1xuXHRcdFx0Ly8gVkgtQ2FjaGU6IEluIGNhc2Ugb2YgdHlwZS1haGVhZCBvbmx5IHRhYmxlIGlzIGNyZWF0ZWQsIGluIGNhc2Ugb2YgVkgtZGlhbG9nIHRoZSBmaWx0ZXJiYXIgaXMgY3JlYXRlZCBhbmQgbmVlZHMgdG8gYmUgY2FjaGVkXG5cdFx0XHRpZiAoc0luVmFsdWVIZWxwSWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRjb25zdCBvU2VsZWN0ZWRDYWNoZUl0ZW0gPSBfZ2V0Q2FjaGVkVmFsdWVIZWxwKHNJblZhbHVlSGVscElkKTtcblx0XHRcdFx0aWYgKCFvU2VsZWN0ZWRDYWNoZUl0ZW0pIHtcblx0XHRcdFx0XHRhQ2FjaGVkVmFsdWVIZWxwLnB1c2goe1xuXHRcdFx0XHRcdFx0c1ZISWQ6IHNJblZhbHVlSGVscElkLFxuXHRcdFx0XHRcdFx0b1ZIRGlhbG9nVGFibGU6IG9JblRhYmxlLFxuXHRcdFx0XHRcdFx0b1ZIRmlsdGVyQmFyOiBvSW5GaWx0ZXJCYXJcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIGlmIChvU2VsZWN0ZWRDYWNoZUl0ZW0gJiYgb1NlbGVjdGVkQ2FjaGVJdGVtLm9WSEZpbHRlckJhciA9PT0gZmFsc2UpIHtcblx0XHRcdFx0XHRhQ2FjaGVkVmFsdWVIZWxwW2FDYWNoZWRWYWx1ZUhlbHAuaW5kZXhPZihvU2VsZWN0ZWRDYWNoZUl0ZW0pXS5vVkhGaWx0ZXJCYXIgPSBvSW5GaWx0ZXJCYXI7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIERvIG5vdCByZWJpbmQgaW4gY2FzZSBvZiBmZXRjaCBlcSAyIGFuZCB0YWJsZSBpcyBhbHJlYWR5IGJvdW5kLCBhdXRvQmluZE9uSW5pdCBpcyBhbHdheXMgZmFsc2Vcblx0XHRcdGlmICghb0luVGFibGUuaXNUYWJsZUJvdW5kKCkgJiYgVmFsdWVMaXN0SGVscGVyLmZldGNoVmFsdWVzT25Jbml0aWFsTG9hZChvVmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvKSkge1xuXHRcdFx0XHRvSW5UYWJsZS5yZWJpbmQoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblx0Y3JlYXRlVmFsdWVIZWxwU3VnZ2VzdDogZnVuY3Rpb24gKHByb3BlcnR5UGF0aDogYW55LCBvRlZIOiBhbnksIG9UYWJsZTogYW55LCBvVmFsdWVMaXN0SW5mbzogYW55LCBiU3VnZ2VzdGlvbjogYW55KSB7XG5cdFx0Y29uc3Qgb1dyYXBwZXIgPSBvRlZILmdldFN1Z2dlc3RDb250ZW50ICYmIG9GVkguZ2V0U3VnZ2VzdENvbnRlbnQoKSxcblx0XHRcdHNXcmFwcGVySWQgPSBvV3JhcHBlciAmJiBvV3JhcHBlci5nZXRJZCgpLFxuXHRcdFx0c0ZWSENsYXNzID0gb0ZWSC5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSxcblx0XHRcdHNWYWx1ZUhlbHBJZCA9IG9GVkguZ2V0TW9kZWwoXCJfVkhVSVwiKS5nZXRQcm9wZXJ0eShcIi92YWx1ZUhlbHBJZFwiKTtcblx0XHRjb25zdCBvUHJvcGVydHlBbm5vdGF0aW9ucyA9IG9GVkguZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QoYCR7cHJvcGVydHlQYXRofUBgKTtcblxuXHRcdC8vT25seSBkbyB0aGlzIGluIGNhc2Ugb2YgY29udGV4dCBkZXBlbmRlbnQgdmFsdWUgaGVscHMgb3Igb3RoZXIgVkggY2FsbGVkIHRoZSBmaXJzdCB0aW1lXG5cdFx0aWYgKCghb1RhYmxlIHx8IHNWYWx1ZUhlbHBJZCAhPT0gdW5kZWZpbmVkKSAmJiBzRlZIQ2xhc3MuaW5kZXhPZihcIkZpZWxkVmFsdWVIZWxwXCIpID4gLTEpIHtcblx0XHRcdC8vQ29tcGxldGUgdGhlIGZpZWxkIHZhbHVlIGhlbHAgY29udHJvbFxuXHRcdFx0b0ZWSC5zZXRUaXRsZShvVmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvLkxhYmVsKTtcblx0XHRcdG9GVkguc2V0S2V5UGF0aChvVmFsdWVMaXN0SW5mby5rZXlWYWx1ZSk7XG5cdFx0XHRvRlZILnNldERlc2NyaXB0aW9uUGF0aChvVmFsdWVMaXN0SW5mby5kZXNjcmlwdGlvblZhbHVlKTtcblx0XHRcdG9GVkguc2V0RmlsdGVyRmllbGRzKF9lbnRpdHlJc1NlYXJjaGFibGUob1ZhbHVlTGlzdEluZm8sIG9Qcm9wZXJ0eUFubm90YXRpb25zKSA/IFwiJHNlYXJjaFwiIDogXCJcIik7XG5cdFx0fVxuXHRcdGNvbnN0IGJJc0Ryb3BEb3duTGlzdGUgPSBvRlZILmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KGAke3Byb3BlcnR5UGF0aH1AYClbXG5cdFx0XHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzXCJcblx0XHRdO1xuXHRcdGNvbnN0IGlzRGlhbG9nVGFibGUgPSBmYWxzZTtcblx0XHRjb25zdCBvQ29sdW1uSW5mbyA9IFZhbHVlTGlzdEhlbHBlci5nZXRDb2x1bW5WaXNpYmlsaXR5SW5mbyhcblx0XHRcdG9WYWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8sXG5cdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRiSXNEcm9wRG93bkxpc3RlLFxuXHRcdFx0aXNEaWFsb2dUYWJsZVxuXHRcdCk7XG5cdFx0Y29uc3Qgb1NvdXJjZU1vZGVsID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRpZDogc1ZhbHVlSGVscElkIHx8IG9GVkguZ2V0SWQoKSxcblx0XHRcdGdyb3VwSWQ6IG9GVkguZGF0YShcInJlcXVlc3RHcm91cElkXCIpIHx8IHVuZGVmaW5lZCxcblx0XHRcdGJTdWdnZXN0aW9uOiBiU3VnZ2VzdGlvbixcblx0XHRcdHByb3BlcnR5UGF0aDogcHJvcGVydHlQYXRoLFxuXHRcdFx0Y29sdW1uSW5mbzogb0NvbHVtbkluZm8sXG5cdFx0XHR2YWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXM6IGJJc0Ryb3BEb3duTGlzdGVcblx0XHR9KTtcblx0XHRvVGFibGUgPVxuXHRcdFx0b1RhYmxlIHx8XG5cdFx0XHRWYWx1ZUxpc3RIZWxwZXIuX3RlbXBsYXRlRnJhZ21lbnQoXG5cdFx0XHRcdFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC52YWx1ZWhlbHAuVmFsdWVMaXN0VGFibGVcIixcblx0XHRcdFx0b1ZhbHVlTGlzdEluZm8sXG5cdFx0XHRcdG9Tb3VyY2VNb2RlbCxcblx0XHRcdFx0cHJvcGVydHlQYXRoXG5cdFx0XHQpO1xuXG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKFtvVGFibGVdKS50aGVuKChhQ29udHJvbHM6IGFueVtdKSA9PiB7XG5cdFx0XHRsZXQgc1RhYmxlV2lkdGg7XG5cdFx0XHRjb25zdCBvSW5UYWJsZSA9IGFDb250cm9sc1swXTtcblxuXHRcdFx0aWYgKG9JblRhYmxlKSB7XG5cdFx0XHRcdG9JblRhYmxlLnNldE1vZGVsKG9WYWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uJG1vZGVsKTtcblx0XHRcdFx0Y29uc3Qgb0JpbmRpbmcgPSBvSW5UYWJsZS5nZXRCaW5kaW5nKFwiaXRlbXNcIik7XG5cdFx0XHRcdG9CaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImRhdGFSZXF1ZXN0ZWRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdEJ1c3lMb2NrZXIubG9jayhvSW5UYWJsZSk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRvQmluZGluZy5hdHRhY2hFdmVudChcImRhdGFSZWNlaXZlZFwiLCBmdW5jdGlvbiAob0V2ZW50OiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBzUGFyZW50SWQgPSBvRlZILmdldFBhcmVudCgpLmdldElkKCk7XG5cdFx0XHRcdFx0Y29uc3Qgb01lc3NhZ2VNYW5hZ2VyID0gQ29yZS5nZXRNZXNzYWdlTWFuYWdlcigpO1xuXHRcdFx0XHRcdGlmIChCdXN5TG9ja2VyLmlzTG9ja2VkKG9JblRhYmxlKSkge1xuXHRcdFx0XHRcdFx0QnVzeUxvY2tlci51bmxvY2sob0luVGFibGUpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBIYW5kbGUgbWVzc2FnZXMgcmVsYXRlZCB0byBpbnB1dCB3aXRoIGludmFsaWQgdG9rZW5cblx0XHRcdFx0XHRpZiAob0V2ZW50LmdldFBhcmFtZXRlcihcImVycm9yXCIpKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBzRXJyb3JNZXNzYWdlID0gb0V2ZW50LmdldFBhcmFtZXRlcihcImVycm9yXCIpLmVycm9yLm1lc3NhZ2U7XG5cdFx0XHRcdFx0XHRjb25zdCBfdXBkYXRlTWVzc2FnZSA9IGZ1bmN0aW9uIChvTWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdGlmIChzUGFyZW50SWQuaW5kZXhPZihcIkFQRF86OlwiKSA9PT0gMCAmJiBzRXJyb3JNZXNzYWdlID09PSBvTWVzc2FnZS5tZXNzYWdlKSB7XG5cdFx0XHRcdFx0XHRcdFx0b01lc3NhZ2UudGFyZ2V0ID0gc1BhcmVudElkO1xuXHRcdFx0XHRcdFx0XHRcdG9GVkguX29Db25kaXRpb25zLiRzZWFyY2ggPSB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIG9NZXNzYWdlO1xuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdC8vIHVzZSB0aW1lb3V0IGFzIHRoZSBtZXNzYWdlcyBhcmUgb3RoZXJ3aXNlIG5vdCB5ZXQgaW4gdGhlIG1lc3NhZ2UgbW9kZWxcblx0XHRcdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRtZXNzYWdlSGFuZGxpbmcuZ2V0TWVzc2FnZXMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvTWVzc2FnZTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0X3VwZGF0ZU1lc3NhZ2Uob01lc3NhZ2UpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0sIDApO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvTWVzc2FnZU1hbmFnZXJcblx0XHRcdFx0XHRcdFx0LmdldE1lc3NhZ2VNb2RlbCgpXG5cdFx0XHRcdFx0XHRcdC5nZXREYXRhKClcblx0XHRcdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKG9NZXNzYWdlOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAob01lc3NhZ2UudGFyZ2V0LmluY2x1ZGVzKHNQYXJlbnRJZCkgJiYgb01lc3NhZ2UuY29udHJvbElkcy5sZW5ndGggPT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9NZXNzYWdlLnRhcmdldCA9IFwiXCI7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vSWYgdGhlIGVudGl0eSBpcyBEcmFmdEVuYWJsZWQgYWRkIGEgRHJhZnRGaWx0ZXJcblx0XHRcdFx0aWYgKE1vZGVsSGVscGVyLmlzRHJhZnRTdXBwb3J0ZWQob0JpbmRpbmcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSwgb0JpbmRpbmcuZ2V0UGF0aCgpKSkge1xuXHRcdFx0XHRcdG9CaW5kaW5nLmZpbHRlcihuZXcgRmlsdGVyKFwiSXNBY3RpdmVFbnRpdHlcIiwgRmlsdGVyT3BlcmF0b3IuRVEsIHRydWUpLCBGaWx0ZXJUeXBlLkNvbnRyb2wpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0TG9nLmluZm8oXG5cdFx0XHRcdFx0YFZhbHVlIExpc3QtIHN1Z2dlc3QgVGFibGUgWE1MIGNvbnRlbnQgY3JlYXRlZCBbJHtwcm9wZXJ0eVBhdGh9XWAsXG5cdFx0XHRcdFx0b0luVGFibGUuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCksXG5cdFx0XHRcdFx0XCJNREMgVGVtcGxhdGluZ1wiXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvSW5UYWJsZSAhPT0gb1dyYXBwZXIuZ2V0VGFibGUoKSB8fCBzVmFsdWVIZWxwSWQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRvV3JhcHBlci5zZXRUYWJsZShvSW5UYWJsZSk7XG5cdFx0XHRcdG9JblRhYmxlLmF0dGFjaEV2ZW50T25jZShcInVwZGF0ZUZpbmlzaGVkXCIsIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRvV3JhcHBlci5pbnZhbGlkYXRlKG9JblRhYmxlKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGRlbGV0ZSB3YWl0Rm9yUHJvbWlzZVtzV3JhcHBlcklkXTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGlzVW5pdFZhbHVlSGVscCA9IG9GVkguZGF0YShcInNvdXJjZVBhdGhcIikgIT09IG9GVkguZGF0YShcIm9yaWdpbmFsUHJvcGVydHlQYXRoXCIpO1xuXG5cdFx0XHQvLyBoYW5kbGluZyBvZiB0YWJsZS13aWR0aCBmb3Igc3BlY2lhbCBjYXNlIG9mIHByZWRlZmluZWQgZmlsdGVyLWJhciB2YXJpYW50IHdoZXJlIGZpbHRlci1maWVsZCBpcyBub3QgYXZhaWxhYmxlIHlldFxuXHRcdFx0Y29uc3Qgb0ZpbHRlckZpZWxkID0gb0ZWSC5fZ2V0RmllbGQoKTtcblx0XHRcdGlmIChcblx0XHRcdFx0b0ZpbHRlckZpZWxkLmlzQShcInNhcC51aS5tZGMuRmlsdGVyRmllbGRcIikgfHxcblx0XHRcdFx0b0ZpbHRlckZpZWxkLmlzQShcInNhcC51aS5tZGMuRmllbGRcIikgfHxcblx0XHRcdFx0b0ZpbHRlckZpZWxkLmlzQShcInNhcC51aS5tZGMuTXVsdGlWYWx1ZUZpZWxkXCIpXG5cdFx0XHQpIHtcblx0XHRcdFx0c1RhYmxlV2lkdGggPSB0aGlzLmdldFRhYmxlV2lkdGgob0luVGFibGUsIHRoaXMuX2dldFdpZHRoSW5SZW0ob0ZpbHRlckZpZWxkLCBpc1VuaXRWYWx1ZUhlbHApKTtcblx0XHRcdFx0b0ZWSC5nZXRNb2RlbChcIl9WSFVJXCIpLnNldFByb3BlcnR5KFwiL3RhYmxlV2lkdGhcIiwgc1RhYmxlV2lkdGgpO1xuXHRcdFx0XHRvSW5UYWJsZS5zZXRXaWR0aChzVGFibGVXaWR0aCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvRlZILmdldE1vZGVsKFwiX1ZIVUlcIikuc2V0UHJvcGVydHkoXCIvdGFibGVXaWR0aFwiLCB1bmRlZmluZWQpOyAvLyBzZXQgdG8gdW5kZWZpbmVkIGluIG9yZGVyIHRvIGJlIGNoZWNrZWQgbGF0ZXIgaW4gc2hvd1ZhbHVlTGlzdEluZm9cblx0XHRcdH1cblxuXHRcdFx0aWYgKHNWYWx1ZUhlbHBJZCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdGNvbnN0IG9TZWxlY3RlZENhY2hlSXRlbSA9IF9nZXRTdWdnZXN0Q2FjaGVkVmFsdWVIZWxwKHNWYWx1ZUhlbHBJZCk7XG5cdFx0XHRcdGlmICghb1NlbGVjdGVkQ2FjaGVJdGVtKSB7XG5cdFx0XHRcdFx0YVN1Z2dlc3RDYWNoZWRWYWx1ZUhlbHAucHVzaCh7XG5cdFx0XHRcdFx0XHRzVkhJZDogc1ZhbHVlSGVscElkLFxuXHRcdFx0XHRcdFx0b1ZIU3VnZ2VzdFRhYmxlOiBvSW5UYWJsZVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdF9nZXRXaWR0aEluUmVtOiBmdW5jdGlvbiAob0NvbnRyb2w6IGFueSwgaXNVbml0VmFsdWVIZWxwPzogYW55KSB7XG5cdFx0bGV0ICR3aWR0aCA9IG9Db250cm9sLiQoKS53aWR0aCgpO1xuXHRcdGlmIChpc1VuaXRWYWx1ZUhlbHAgJiYgJHdpZHRoKSB7XG5cdFx0XHQkd2lkdGggPSAwLjMgKiAkd2lkdGg7XG5cdFx0fVxuXHRcdGNvbnN0IGZXaWR0aCA9ICR3aWR0aCA/IHBhcnNlRmxvYXQoUmVtLmZyb21QeCgkd2lkdGgpKSA6IDA7XG5cdFx0cmV0dXJuIGlzTmFOKGZXaWR0aCkgPyAwIDogZldpZHRoO1xuXHR9LFxuXHRnZXRUYWJsZVdpZHRoOiBmdW5jdGlvbiAob1RhYmxlOiBhbnksIGZNaW5XaWR0aDogYW55KSB7XG5cdFx0bGV0IHNXaWR0aDtcblx0XHRjb25zdCBhQ29sdW1ucyA9IG9UYWJsZS5nZXRDb2x1bW5zKCksXG5cdFx0XHRhVmlzaWJsZUNvbHVtbnMgPVxuXHRcdFx0XHQoYUNvbHVtbnMgJiZcblx0XHRcdFx0XHRhQ29sdW1ucy5maWx0ZXIoZnVuY3Rpb24gKG9Db2x1bW46IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9Db2x1bW4gJiYgb0NvbHVtbi5nZXRWaXNpYmxlICYmIG9Db2x1bW4uZ2V0VmlzaWJsZSgpO1xuXHRcdFx0XHRcdH0pKSB8fFxuXHRcdFx0XHRbXSxcblx0XHRcdGlTdW1XaWR0aCA9IGFWaXNpYmxlQ29sdW1ucy5yZWR1Y2UoZnVuY3Rpb24gKGZTdW06IGFueSwgb0NvbHVtbjogYW55KSB7XG5cdFx0XHRcdHNXaWR0aCA9IG9Db2x1bW4uZ2V0V2lkdGgoKTtcblx0XHRcdFx0aWYgKHNXaWR0aCAmJiBzV2lkdGguZW5kc1dpdGgoXCJweFwiKSkge1xuXHRcdFx0XHRcdHNXaWR0aCA9IFJlbS5mcm9tUHgoc1dpZHRoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBmV2lkdGggPSBwYXJzZUZsb2F0KHNXaWR0aCk7XG5cdFx0XHRcdHJldHVybiBmU3VtICsgKGlzTmFOKGZXaWR0aCkgPyA5IDogZldpZHRoKTtcblx0XHRcdH0sIGFWaXNpYmxlQ29sdW1ucy5sZW5ndGgpO1xuXHRcdHJldHVybiBgJHtNYXRoLm1heChpU3VtV2lkdGgsIGZNaW5XaWR0aCl9ZW1gO1xuXHR9LFxuXG5cdGNyZWF0ZVZIVUlNb2RlbDogZnVuY3Rpb24gKHByb3BlcnR5UGF0aDogYW55LCBvRlZIOiBhbnksIGJTdWdnZXN0aW9uPzogYW55KSB7XG5cdFx0Ly8gc2V0dGluZyB0aGUgX1ZIVUkgbW9kZWwgZXZhbHVhdGVkIGluIHRoZSBWYWx1ZUxpc3RUYWJsZSBmcmFnbWVudFxuXHRcdGNvbnN0IG9Nb2RlbCA9IG9GVkguZ2V0TW9kZWwoKSxcblx0XHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0bGV0IG9WSFVJTW9kZWwgPSBvRlZILmdldE1vZGVsKFwiX1ZIVUlcIik7XG5cblx0XHRpZiAoIW9WSFVJTW9kZWwpIHtcblx0XHRcdG9WSFVJTW9kZWwgPSBuZXcgSlNPTk1vZGVsKHt9KTtcblx0XHRcdG9GVkguc2V0TW9kZWwob1ZIVUlNb2RlbCwgXCJfVkhVSVwiKTtcblx0XHRcdC8vIElkZW50aWZpZXMgdGhlIFwiQ29udGV4dERlcGVuZGVudC1TY2VuYXJpb1wiXG5cdFx0XHRvVkhVSU1vZGVsLnNldFByb3BlcnR5KFxuXHRcdFx0XHRcIi9oYXNWYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnNcIixcblx0XHRcdFx0ISFvTWV0YU1vZGVsLmdldE9iamVjdChgJHtwcm9wZXJ0eVBhdGh9QGApW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnNcIl1cblx0XHRcdCk7XG5cdFx0fVxuXHRcdG9WSFVJTW9kZWwuc2V0UHJvcGVydHkoXCIvaXNTdWdnZXN0aW9uXCIsIGJTdWdnZXN0aW9uKTtcblx0XHRvVkhVSU1vZGVsLnNldFByb3BlcnR5KFwiL21pblNjcmVlbldpZHRoXCIsICFiU3VnZ2VzdGlvbiA/IFwiNDE4cHhcIiA6IHVuZGVmaW5lZCk7XG5cblx0XHRyZXR1cm4gb1ZIVUlNb2RlbDtcblx0fSxcblxuXHRzaG93VmFsdWVMaXN0SW5mbzogZnVuY3Rpb24gKHByb3BlcnR5UGF0aDogYW55LCBvRlZIOiBhbnksIGJTdWdnZXN0aW9uOiBhbnksIHNDb25kaXRpb25Nb2RlbDogYW55LCBvUHJvcGVydGllczogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0ZWSC5nZXRNb2RlbCgpLFxuXHRcdFx0b01ldGFNb2RlbCA9IG9Nb2RlbCA/IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKSA6IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvRlZIKS5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0b1dyYXBwZXIgPSBvRlZILmdldERpYWxvZ0NvbnRlbnQgJiYgb0ZWSC5nZXREaWFsb2dDb250ZW50KCksXG5cdFx0XHRvU3VnZ2VzdFdyYXBwZXIgPSBvRlZILmdldFN1Z2dlc3RDb250ZW50ICYmIG9GVkguZ2V0U3VnZ2VzdENvbnRlbnQoKTtcblx0XHRsZXQgc1dyYXBwZXJJZCwgb0RpYWxvZ1RhYmxlOiBhbnksIG9GaWx0ZXJCYXI6IGFueSwgb1N1Z2dlc3RUYWJsZSwgYkV4aXN0cztcblx0XHRpZiAoYlN1Z2dlc3Rpb24pIHtcblx0XHRcdHNXcmFwcGVySWQgPSBvU3VnZ2VzdFdyYXBwZXIgJiYgb1N1Z2dlc3RXcmFwcGVyLmdldElkKCk7XG5cdFx0XHRvU3VnZ2VzdFRhYmxlID0gb1N1Z2dlc3RXcmFwcGVyICYmIG9TdWdnZXN0V3JhcHBlci5nZXRUYWJsZSAmJiBvU3VnZ2VzdFdyYXBwZXIuZ2V0VGFibGUoKTtcblx0XHRcdGJFeGlzdHMgPSBvU3VnZ2VzdFRhYmxlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvRGlhbG9nVGFibGUgPSBvV3JhcHBlciAmJiBvV3JhcHBlci5nZXRUYWJsZSAmJiBvV3JhcHBlci5nZXRUYWJsZSgpO1xuXHRcdFx0b0ZpbHRlckJhciA9IG9GVkggJiYgb0ZWSC5nZXRGaWx0ZXJCYXIgJiYgb0ZWSC5nZXRGaWx0ZXJCYXIoKTtcblx0XHRcdHNXcmFwcGVySWQgPSBvV3JhcHBlciAmJiBvV3JhcHBlci5nZXRJZCgpO1xuXHRcdFx0YkV4aXN0cyA9IG9EaWFsb2dUYWJsZSAmJiBvRmlsdGVyQmFyO1xuXHRcdH1cblxuXHRcdC8vIHNldHRpbmcgdGhlIF9WSFVJIG1vZGVsIGV2YWx1YXRlZCBpbiB0aGUgVmFsdWVMaXN0VGFibGUgZnJhZ21lbnRcblx0XHRjb25zdCBvVkhVSU1vZGVsID0gVmFsdWVMaXN0SGVscGVyLmNyZWF0ZVZIVUlNb2RlbChwcm9wZXJ0eVBhdGgsIG9GVkgsIGJTdWdnZXN0aW9uKTtcblxuXHRcdGNvbnN0IHNWYWx1ZUhlbHBJZCA9IG9GVkguZ2V0TW9kZWwoXCJfVkhVSVwiKS5nZXRQcm9wZXJ0eShcIi92YWx1ZUhlbHBJZFwiKTtcblx0XHRpZiAob0RpYWxvZ1RhYmxlKSB7XG5cdFx0XHRvRGlhbG9nVGFibGUuc2V0V2lkdGgoXCIxMDAlXCIpO1xuXHRcdH1cblxuXHRcdC8vIGhhbmRsaW5nIG9mIHNwZWNpYWwgY2FzZSBvZiBwcmVkZWZpbmVkIHZhcmlhbnQ6IHRoZSB0YWJsZSB3aWR0aCBjYW4gb25seSBiZSBzZXQgbGF0ZSB3aGVuIGZpZWxkIGlzIGF2YWlsYWJsZSAoc2VlIGZ1bmN0aW9uIGNyZWF0ZVZhbHVlSGVscFN1Z2dlc3QpXG5cdFx0aWYgKG9TdWdnZXN0VGFibGUpIHtcblx0XHRcdGxldCBzVGFibGVXaWR0aCA9IG9WSFVJTW9kZWwuZ2V0UHJvcGVydHkoXCIvdGFibGVXaWR0aFwiKTtcblx0XHRcdGlmICghc1RhYmxlV2lkdGgpIHtcblx0XHRcdFx0Y29uc3QgaXNVbml0VmFsdWVIZWxwID0gb0ZWSC5kYXRhKFwic291cmNlUGF0aFwiKSAhPT0gb0ZWSC5kYXRhKFwib3JpZ2luYWxQcm9wZXJ0eVBhdGhcIik7XG5cdFx0XHRcdHNUYWJsZVdpZHRoID0gdGhpcy5nZXRUYWJsZVdpZHRoKG9TdWdnZXN0VGFibGUsIHRoaXMuX2dldFdpZHRoSW5SZW0ob0ZWSC5fZ2V0RmllbGQoKSwgaXNVbml0VmFsdWVIZWxwKSk7XG5cdFx0XHRcdG9GVkguZ2V0TW9kZWwoXCJfVkhVSVwiKS5zZXRQcm9wZXJ0eShcIi90YWJsZVdpZHRoXCIsIHNUYWJsZVdpZHRoKTtcblx0XHRcdFx0b1N1Z2dlc3RUYWJsZS5zZXRXaWR0aChzVGFibGVXaWR0aCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gc3dpdGNoIG9mZiBpbnRlcm5hbCBjYWNoaW5nXG5cdFx0aWYgKFxuXHRcdFx0KHNWYWx1ZUhlbHBJZCAhPT0gdW5kZWZpbmVkICYmIG9GVkguZ2V0QmluZGluZ0NvbnRleHQoKSkgfHxcblx0XHRcdChvRlZILmdldE1vZGVsKFwiX1ZIVUlcIikuZ2V0UHJvcGVydHkoXCIvY29sbGVjdGl2ZVNlYXJjaEtleVwiKSAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRcdG9GVkguZ2V0TW9kZWwoXCJfVkhVSVwiKS5nZXRQcm9wZXJ0eShcIi9jb2xsZWN0aXZlU2VhcmNoS2V5XCIpICE9PSBvUHJvcGVydGllcy5jb2xsZWN0aXZlU2VhcmNoS2V5KVxuXHRcdCkge1xuXHRcdFx0b0RpYWxvZ1RhYmxlID0gdW5kZWZpbmVkO1xuXHRcdFx0b0ZpbHRlckJhciA9IHVuZGVmaW5lZDtcblx0XHRcdG9TdWdnZXN0VGFibGUgPSB1bmRlZmluZWQ7XG5cdFx0XHRiRXhpc3RzID0gdW5kZWZpbmVkO1xuXHRcdFx0ZGVsZXRlIHdhaXRGb3JQcm9taXNlW3NXcmFwcGVySWRdO1xuXHRcdH1cblxuXHRcdGlmICghYlN1Z2dlc3Rpb24gJiYgIW9GaWx0ZXJCYXIgJiYgb0ZWSC5nZXREZXBlbmRlbnRzKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0Y29uc3Qgb1BvdGVudGlhbEZpbHRlckJhciA9IG9GVkguZ2V0RGVwZW5kZW50cygpWzBdO1xuXHRcdFx0aWYgKG9Qb3RlbnRpYWxGaWx0ZXJCYXIuaXNBKFwic2FwLnVpLm1kYy5maWx0ZXJiYXIudmguRmlsdGVyQmFyXCIpKSB7XG5cdFx0XHRcdG9GaWx0ZXJCYXIgPSBvUG90ZW50aWFsRmlsdGVyQmFyO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAod2FpdEZvclByb21pc2Vbc1dyYXBwZXJJZF0gfHwgYkV4aXN0cykge1xuXHRcdFx0cmV0dXJuIHdhaXRGb3JQcm9taXNlW2Bwcm9taXNlJHtzV3JhcHBlcklkfWBdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAoKGJTdWdnZXN0aW9uICYmICFvU3VnZ2VzdFRhYmxlKSB8fCAoIWJTdWdnZXN0aW9uICYmICFvRGlhbG9nVGFibGUpKSB7XG5cdFx0XHRcdHdhaXRGb3JQcm9taXNlW3NXcmFwcGVySWRdID0gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IG9Qcm9taXNlID0gVmFsdWVMaXN0SGVscGVyLmdldFZhbHVlTGlzdEluZm8ob0ZWSCwgb01ldGFNb2RlbCwgcHJvcGVydHlQYXRoLCBzQ29uZGl0aW9uTW9kZWwsIG9Qcm9wZXJ0aWVzKVxuXHRcdFx0XHQudGhlbihWYWx1ZUxpc3RIZWxwZXIuZ2V0VmFsdWVMaXN0SW5mb1dpdGhVc2VDYXNlU2Vuc2l0aXZlKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAob1ZhbHVlTGlzdEluZm86IGFueSkge1xuXHRcdFx0XHRcdGNvbnN0IHNJblZhbHVlSGVscElkID0gb0ZWSC5nZXRNb2RlbChcIl9WSFVJXCIpLmdldFByb3BlcnR5KFwiL3ZhbHVlSGVscElkXCIpO1xuXHRcdFx0XHRcdGlmIChvRlZILmdldE1vZGVsKFwiX1ZIVUlcIikuZ2V0UHJvcGVydHkoXCIvbm9WYWxpZFZhbHVlSGVscFwiKSkge1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKFwiQ29udGV4dCBkZXBlbmRlbnQgdmFsdWUgaGVscCBub3QgZm91bmRcIik7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0ZWSC5jbG9zZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBhSW5QYXJhbWV0ZXJzID0gb1ZhbHVlTGlzdEluZm8gJiYgb1ZhbHVlTGlzdEluZm8uaW5QYXJhbWV0ZXJzLFxuXHRcdFx0XHRcdFx0YU91dFBhcmFtZXRlcnMgPSBvVmFsdWVMaXN0SW5mbyAmJiBvVmFsdWVMaXN0SW5mby5vdXRQYXJhbWV0ZXJzO1xuXHRcdFx0XHRcdGlmIChvRlZILmdldE91dFBhcmFtZXRlcnMoKS5sZW5ndGggIT09IGFPdXRQYXJhbWV0ZXJzLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0YU91dFBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob091dFBhcmFtZXRlcjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdG9GVkguYWRkT3V0UGFyYW1ldGVyKG9PdXRQYXJhbWV0ZXIpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChvRlZILmdldEluUGFyYW1ldGVycygpLmxlbmd0aCAhPT0gYUluUGFyYW1ldGVycy5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdGFJblBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob0luUGFyYW1ldGVyOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0b0ZWSC5hZGRJblBhcmFtZXRlcihvSW5QYXJhbWV0ZXIpO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9GVkguc2V0Q2FzZVNlbnNpdGl2ZShvVmFsdWVMaXN0SW5mby51c2VDYXNlU2Vuc2l0aXZlKTtcblx0XHRcdFx0XHRpZiAoYlN1Z2dlc3Rpb24pIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9TZWxlY3RlZFN1Z2dlc3RDYWNoZUl0ZW0gPSBfZ2V0U3VnZ2VzdENhY2hlZFZhbHVlSGVscChzSW5WYWx1ZUhlbHBJZCk7XG5cblx0XHRcdFx0XHRcdGNvbnN0IG9JblN1Z2dlc3RUYWJsZSA9IG9TZWxlY3RlZFN1Z2dlc3RDYWNoZUl0ZW0gPyBvU2VsZWN0ZWRTdWdnZXN0Q2FjaGVJdGVtLm9WSFN1Z2dlc3RUYWJsZSA6IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRcdG9WYWx1ZUxpc3RJbmZvICYmXG5cdFx0XHRcdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5jcmVhdGVWYWx1ZUhlbHBTdWdnZXN0KHByb3BlcnR5UGF0aCwgb0ZWSCwgb0luU3VnZ2VzdFRhYmxlLCBvVmFsdWVMaXN0SW5mbywgYlN1Z2dlc3Rpb24pXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvU2VsZWN0ZWRDYWNoZUl0ZW0gPSBfZ2V0Q2FjaGVkVmFsdWVIZWxwKHNJblZhbHVlSGVscElkKTtcblx0XHRcdFx0XHRcdGlmIChvU2VsZWN0ZWRDYWNoZUl0ZW0pIHtcblx0XHRcdFx0XHRcdFx0b0RpYWxvZ1RhYmxlID0gb1NlbGVjdGVkQ2FjaGVJdGVtLm9WSERpYWxvZ1RhYmxlO1xuXHRcdFx0XHRcdFx0XHRvRmlsdGVyQmFyID0gb1NlbGVjdGVkQ2FjaGVJdGVtLm9WSEZpbHRlckJhcjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRcdG9WYWx1ZUxpc3RJbmZvICYmXG5cdFx0XHRcdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5jcmVhdGVWYWx1ZUhlbHBEaWFsb2cocHJvcGVydHlQYXRoLCBvRlZILCBvRGlhbG9nVGFibGUsIG9GaWx0ZXJCYXIsIG9WYWx1ZUxpc3RJbmZvLCBiU3VnZ2VzdGlvbilcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGV4YzogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3Qgc01zZyA9XG5cdFx0XHRcdFx0XHRleGMuc3RhdHVzICYmIGV4Yy5zdGF0dXMgPT09IDQwNFxuXHRcdFx0XHRcdFx0XHQ/IGBNZXRhZGF0YSBub3QgZm91bmQgKCR7ZXhjLnN0YXR1c30pIGZvciB2YWx1ZSBoZWxwIG9mIHByb3BlcnR5ICR7cHJvcGVydHlQYXRofWBcblx0XHRcdFx0XHRcdFx0OiBleGMubWVzc2FnZTtcblx0XHRcdFx0XHRMb2cuZXJyb3Ioc01zZyk7XG5cdFx0XHRcdFx0b0ZWSC5kZXN0cm95Q29udGVudCgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdHdhaXRGb3JQcm9taXNlW2Bwcm9taXNlJHtzV3JhcHBlcklkfWBdID0gb1Byb21pc2U7XG5cdFx0XHRyZXR1cm4gb1Byb21pc2U7XG5cdFx0fVxuXHR9LFxuXHRzZXRWYWx1ZUxpc3RGaWx0ZXJGaWVsZHM6IGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGg6IGFueSwgb0ZWSDogYW55LCBiU3VnZ2VzdGlvbjogYW55LCBzQ29uZGl0aW9uTW9kZWw6IGFueSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9GVkguZ2V0TW9kZWwoKSxcblx0XHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Ly8gRm9yIENvbnRleHREZXBlbmRlbnRWYWx1ZUhlbHAgdGhlIGZ1bmMgZ2V0VmFsdWVMaXN0SW5mbyBpcyBhbHNvIGNhbGxlZFxuXHRcdGlmIChcblx0XHRcdG9GVkguZ2V0QmluZGluZ0NvbnRleHQoKSAmJlxuXHRcdFx0b0ZWSC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChgJHtwcm9wZXJ0eVBhdGh9QGApW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnNcIl1cblx0XHQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0cmV0dXJuIFZhbHVlTGlzdEhlbHBlci5nZXRWYWx1ZUxpc3RJbmZvKG9GVkgsIG9NZXRhTW9kZWwsIHByb3BlcnR5UGF0aCwgc0NvbmRpdGlvbk1vZGVsKS50aGVuKGZ1bmN0aW9uIChvVmFsdWVMaXN0SW5mbzogYW55KSB7XG5cdFx0XHRjb25zdCBvUHJvcGVydHlBbm5vdGF0aW9ucyA9IG9GVkguZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QoYCR7cHJvcGVydHlQYXRofUBgKTtcblx0XHRcdGlmIChvVmFsdWVMaXN0SW5mbykge1xuXHRcdFx0XHRvRlZILnNldEZpbHRlckZpZWxkcyhfZW50aXR5SXNTZWFyY2hhYmxlKG9WYWx1ZUxpc3RJbmZvLCBvUHJvcGVydHlBbm5vdGF0aW9ucykgPyBcIiRzZWFyY2hcIiA6IFwiXCIpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGNvbHVtbiB3aWR0aCBmb3IgYSBnaXZlbiBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5UGF0aCBUaGUgcHJvcGVydHlQYXRoXG5cdCAqIEByZXR1cm5zIFRoZSB3aWR0aCBhcyBhIHN0cmluZy5cblx0ICovXG5cdGdldENvbHVtbldpZHRoOiBmdW5jdGlvbiAocHJvcGVydHlQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdFx0Y29uc3QgcHJvcGVydHkgPSBwcm9wZXJ0eVBhdGgudGFyZ2V0T2JqZWN0O1xuXHRcdGxldCByZWxhdGVkUHJvcGVydHk6IFByb3BlcnR5W10gPSBbcHJvcGVydHldO1xuXHRcdC8vIFRoZSBhZGRpdGlvbmFsIHByb3BlcnR5IGNvdWxkIHJlZmVyIHRvIHRoZSB0ZXh0LCBjdXJyZW5jeSwgdW5pdCBvciB0aW1lem9uZVxuXHRcdGNvbnN0IGFkZGl0aW9uYWxQcm9wZXJ0eSA9XG5cdFx0XHRcdGdldEFzc29jaWF0ZWRUZXh0UHJvcGVydHkocHJvcGVydHkpIHx8XG5cdFx0XHRcdGdldEFzc29jaWF0ZWRDdXJyZW5jeVByb3BlcnR5KHByb3BlcnR5KSB8fFxuXHRcdFx0XHRnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5KHByb3BlcnR5KSB8fFxuXHRcdFx0XHRnZXRBc3NvY2lhdGVkVGltZXpvbmVQcm9wZXJ0eShwcm9wZXJ0eSksXG5cdFx0XHR0ZXh0QW5ub3RhdGlvbiA9IHByb3BlcnR5LmFubm90YXRpb25zPy5Db21tb24/LlRleHQsXG5cdFx0XHR0ZXh0QXJyYW5nZW1lbnQgPSB0ZXh0QW5ub3RhdGlvbj8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQ/LnRvU3RyaW5nKCksXG5cdFx0XHRkaXNwbGF5TW9kZSA9IHRleHRBcnJhbmdlbWVudCAmJiBnZXREaXNwbGF5TW9kZShwcm9wZXJ0eVBhdGgpO1xuXHRcdGlmIChhZGRpdGlvbmFsUHJvcGVydHkpIHtcblx0XHRcdGlmIChkaXNwbGF5TW9kZSA9PT0gXCJEZXNjcmlwdGlvblwiKSB7XG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0eSA9IFthZGRpdGlvbmFsUHJvcGVydHldO1xuXHRcdFx0fSBlbHNlIGlmICghdGV4dEFubm90YXRpb24gfHwgKGRpc3BsYXlNb2RlICYmIGRpc3BsYXlNb2RlICE9PSBcIlZhbHVlXCIpKSB7XG5cdFx0XHRcdHJlbGF0ZWRQcm9wZXJ0eS5wdXNoKGFkZGl0aW9uYWxQcm9wZXJ0eSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGxldCBzaXplID0gMDtcblx0XHRyZWxhdGVkUHJvcGVydHkuZm9yRWFjaCgocHJvcDogUHJvcGVydHkpID0+IHtcblx0XHRcdGNvbnN0IHByb3BlcnR5VHlwZUNvbmZpZyA9IGdldFR5cGVDb25maWcocHJvcCwgdW5kZWZpbmVkKTtcblx0XHRcdGNvbnN0IFByb3BlcnR5T0RhdGFDb25zdHJ1Y3RvciA9IE9iamVjdFBhdGguZ2V0KHByb3BlcnR5VHlwZUNvbmZpZy50eXBlKTtcblx0XHRcdGNvbnN0IGluc3RhbmNlID0gbmV3IFByb3BlcnR5T0RhdGFDb25zdHJ1Y3Rvcihwcm9wZXJ0eVR5cGVDb25maWcuZm9ybWF0T3B0aW9ucywgcHJvcGVydHlUeXBlQ29uZmlnLmNvbnN0cmFpbnRzKTtcblx0XHRcdGNvbnN0IHNXaWR0aCA9IGluc3RhbmNlID8gVXRpbC5jYWxjQ29sdW1uV2lkdGgoaW5zdGFuY2UpIDogbnVsbDtcblx0XHRcdHNpemUgKz0gc1dpZHRoID8gcGFyc2VGbG9hdChzV2lkdGgucmVwbGFjZShcInJlbVwiLCBcIlwiKSkgOiAwO1xuXHRcdH0pO1xuXHRcdGlmICghc2l6ZSkge1xuXHRcdFx0TG9nLmVycm9yKGBDYW5ub3QgY29tcHV0ZSB0aGUgY29sdW1uIHdpZHRoIGZvciBwcm9wZXJ0eTogJHtwcm9wZXJ0eS5uYW1lfWApO1xuXHRcdH1cblx0XHRyZXR1cm4gc2l6ZSA8PSAyMCA/IHNpemUudG9TdHJpbmcoKSArIFwicmVtXCIgOiBcIjIwcmVtXCI7XG5cdH0sXG5cdGZldGNoVmFsdWVzT25Jbml0aWFsTG9hZDogZnVuY3Rpb24gKG9WYWx1ZUxpc3RJbmZvOiBhbnkpIHtcblx0XHRpZiAob1ZhbHVlTGlzdEluZm8uRmV0Y2hWYWx1ZXMgJiYgb1ZhbHVlTGlzdEluZm8uRmV0Y2hWYWx1ZXMgPT0gMikge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0Z2V0T3V0UGFyYW1ldGVyUGF0aHM6IGZ1bmN0aW9uIChhUGFyYW1ldGVyczogYW55KSB7XG5cdFx0bGV0IHNQYXRoID0gXCJcIjtcblx0XHRhUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChvUGFyYW1ldGVyOiBhbnkpIHtcblx0XHRcdGlmIChvUGFyYW1ldGVyLiRUeXBlLmVuZHNXaXRoKFwiT3V0XCIpKSB7XG5cdFx0XHRcdHNQYXRoICs9IGB7JHtvUGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5fX1gO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBzUGF0aDtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgVmFsdWVMaXN0SGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7RUErQkEsSUFBTUEsY0FBbUIsR0FBRyxDQUFDLENBQUM7RUFDOUIsSUFBSUMsZ0JBQXVCLEdBQUcsRUFBRTtFQUNoQyxJQUFJQyx1QkFBOEIsR0FBRyxFQUFFO0VBRXZDLFNBQVNDLGtCQUFrQixDQUFDQyxpQkFBc0IsRUFBRTtJQUNuRCxPQUFPQSxpQkFBaUIsQ0FBQ0MsVUFBVSxDQUFDQyxJQUFJLENBQUMsVUFBVUMsVUFBZSxFQUFFO01BQ25FLE9BQ0NB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