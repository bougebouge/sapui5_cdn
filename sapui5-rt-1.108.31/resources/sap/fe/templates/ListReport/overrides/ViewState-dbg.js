/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/library", "sap/fe/core/templating/PropertyFormatters", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/navigation/library", "sap/ui/Device", "sap/ui/fl/apply/api/ControlVariantApplyAPI", "sap/ui/mdc/enum/ConditionValidated", "sap/ui/mdc/p13n/StateUtil"], function (Log, CommonUtils, KeepAliveHelper, ModelHelper, CoreLibrary, PropertyFormatters, DelegateUtil, FilterUtils, NavLibrary, Device, ControlVariantApplyAPI, ConditionValidated, StateUtil) {
  "use strict";

  var system = Device.system;
  var NavType = NavLibrary.NavType,
    VariantManagementType = CoreLibrary.VariantManagement,
    TemplateContentView = CoreLibrary.TemplateContentView,
    InitialLoadMode = CoreLibrary.InitialLoadMode;
  var FilterRestrictions = CommonUtils.FilterRestrictions,
    CONDITION_PATH_TO_PROPERTY_PATH_REGEX = /\+|\*/g;
  var ViewStateOverride = {
    _bSearchTriggered: false,
    applyInitialStateOnly: function () {
      return true;
    },
    onBeforeStateApplied: function (aPromises) {
      var oView = this.getView(),
        oController = oView.getController(),
        oFilterBar = oController._getFilterBarControl(),
        aTables = oController._getControls("table");
      if (oFilterBar) {
        oFilterBar.setSuspendSelection(true);
        aPromises.push(oFilterBar.waitForInitialization());
      }
      aTables.forEach(function (oTable) {
        aPromises.push(oTable.initialized());
      });
      delete this._bSearchTriggered;
    },
    onAfterStateApplied: function () {
      var oController = this.getView().getController();
      var oFilterBar = oController._getFilterBarControl();
      if (oFilterBar) {
        oFilterBar.setSuspendSelection(false);
      } else if (oController._isFilterBarHidden()) {
        var oInternalModelContext = oController.getView().getBindingContext("internal");
        oInternalModelContext.setProperty("hasPendingFilters", false);
        if (oController._isMultiMode()) {
          oController._getMultiModeControl().setCountsOutDated(true);
        }
      }
    },
    adaptBindingRefreshControls: function (aControls) {
      var oView = this.getView(),
        oController = oView.getController(),
        aViewControls = oController._getControls(),
        aControlsToRefresh = KeepAliveHelper.getControlsForRefresh(oView, aViewControls);
      Array.prototype.push.apply(aControls, aControlsToRefresh);
    },
    adaptStateControls: function (aStateControls) {
      var oView = this.getView(),
        oController = oView.getController(),
        oViewData = oView.getViewData(),
        bControlVM = oViewData.variantManagement === VariantManagementType.Control;
      var oFilterBarVM = this._getFilterBarVM(oView);
      if (oFilterBarVM) {
        aStateControls.push(oFilterBarVM);
      }
      if (oController._isMultiMode()) {
        aStateControls.push(oController._getMultiModeControl());
      }
      oController._getControls("table").forEach(function (oTable) {
        var oQuickFilter = oTable.getQuickFilter();
        if (oQuickFilter) {
          aStateControls.push(oQuickFilter);
        }
        if (bControlVM) {
          aStateControls.push(oTable.getVariant());
        }
        aStateControls.push(oTable);
      });
      if (oController._getControls("Chart")) {
        oController._getControls("Chart").forEach(function (oChart) {
          aStateControls.push(oChart);
        });
      }
      if (oController._hasMultiVisualizations()) {
        aStateControls.push(oController._getSegmentedButton(TemplateContentView.Chart));
        aStateControls.push(oController._getSegmentedButton(TemplateContentView.Table));
      }
      var oFilterBar = oController._getFilterBarControl();
      if (oFilterBar) {
        aStateControls.push(oFilterBar);
      }
      aStateControls.push(oView.byId("fe::ListReport"));
    },
    retrieveAdditionalStates: function (mAdditionalStates) {
      var oView = this.getView(),
        oController = oView.getController(),
        bPendingFilter = oView.getBindingContext("internal").getProperty("hasPendingFilters");
      mAdditionalStates.dataLoaded = !bPendingFilter || !!this._bSearchTriggered;
      if (oController._hasMultiVisualizations()) {
        var sAlpContentView = oView.getBindingContext("internal").getProperty("alpContentView");
        mAdditionalStates.alpContentView = sAlpContentView;
      }
      delete this._bSearchTriggered;
    },
    applyAdditionalStates: function (oAdditionalStates) {
      var oView = this.getView(),
        oController = oView.getController(),
        oFilterBar = oController._getFilterBarControl();
      if (oAdditionalStates) {
        // explicit check for boolean values - 'undefined' should not alter the triggered search property
        if (oAdditionalStates.dataLoaded === false && oFilterBar) {
          // without this, the data is loaded on navigating back
          oFilterBar._bSearchTriggered = false;
        } else if (oAdditionalStates.dataLoaded === true) {
          if (oFilterBar) {
            oFilterBar.triggerSearch();
          }
          this._bSearchTriggered = true;
        }
        if (oController._hasMultiVisualizations()) {
          var oInternalModelContext = oView.getBindingContext("internal");
          if (!system.desktop && oAdditionalStates.alpContentView == TemplateContentView.Hybrid) {
            oAdditionalStates.alpContentView = TemplateContentView.Chart;
          }
          oInternalModelContext.getModel().setProperty("".concat(oInternalModelContext.getPath(), "/alpContentView"), oAdditionalStates.alpContentView);
        }
      }
    },
    _applyNavigationParametersToFilterbar: function (oNavigationParameter, aResults) {
      var _this = this;
      var oView = this.getView();
      var oController = oView.getController();
      var oAppComponent = oController.getAppComponent();
      var oComponentData = oAppComponent.getComponentData();
      var oStartupParameters = oComponentData && oComponentData.startupParameters || {};
      var oVariantPromise = this.handleVariantIdPassedViaURLParams(oStartupParameters);
      var bFilterVariantApplied;
      aResults.push(oVariantPromise.then(function (aVariants) {
        if (aVariants && aVariants.length > 0) {
          if (aVariants[0] === true || aVariants[1] === true) {
            bFilterVariantApplied = true;
          }
        }
        return _this._applySelectionVariant(oView, oNavigationParameter, bFilterVariantApplied);
      }).then(function () {
        var oDynamicPage = oController._getDynamicListReportControl();
        var bPreventInitialSearch = false;
        var oFilterBarVM = _this._getFilterBarVM(oView);
        var oFilterBarControl = oController._getFilterBarControl();
        if (oFilterBarControl) {
          if (oNavigationParameter.navigationType !== NavType.initial && oNavigationParameter.requiresStandardVariant || !oFilterBarVM && oView.getViewData().initialLoad === InitialLoadMode.Enabled || oController._shouldAutoTriggerSearch(oFilterBarVM)) {
            oFilterBarControl.triggerSearch();
          } else {
            bPreventInitialSearch = _this._preventInitialSearch(oFilterBarVM);
          }
          // reset the suspend selection on filter bar to allow loading of data when needed (was set on LR Init)
          oFilterBarControl.setSuspendSelection(false);
          _this._bSearchTriggered = !bPreventInitialSearch;
          oDynamicPage.setHeaderExpanded(system.desktop || bPreventInitialSearch);
        }
      }).catch(function () {
        Log.error("Variant ID cannot be applied");
      }));
    },
    handleVariantIdPassedViaURLParams: function (oUrlParams) {
      var aPageVariantId = oUrlParams["sap-ui-fe-variant-id"],
        aFilterBarVariantId = oUrlParams["sap-ui-fe-filterbar-variant-id"],
        aTableVariantId = oUrlParams["sap-ui-fe-table-variant-id"];
      var oVariant;
      if (aPageVariantId || aFilterBarVariantId || aTableVariantId) {
        oVariant = {
          sPageVariantId: aPageVariantId && aPageVariantId[0],
          sFilterBarVariantId: aFilterBarVariantId && aFilterBarVariantId[0],
          sTableVariantId: aTableVariantId && aTableVariantId[0]
        };
      }
      return this._handleControlVariantId(oVariant);
    },
    _handleControlVariantId: function (oVariantIDs) {
      var _this2 = this;
      var oVM;
      var oView = this.getView(),
        aPromises = [];
      var sVariantManagement = oView.getViewData().variantManagement;
      if (oVariantIDs && oVariantIDs.sPageVariantId && sVariantManagement === "Page") {
        oVM = oView.byId("fe::PageVariantManagement");
        oVM.getVariants().forEach(function (oVariant) {
          if (oVariant.key === oVariantIDs.sPageVariantId) {
            aPromises.push(_this2._applyControlVariant(oVM, oVariantIDs.sPageVariantId, true));
          }
        });
      } else if (oVariantIDs && sVariantManagement === "Control") {
        if (oVariantIDs.sFilterBarVariantId) {
          oVM = oView.getController()._getFilterBarVariantControl();
          if (oVM) {
            oVM.getVariants().forEach(function (oVariant) {
              if (oVariant.key === oVariantIDs.sFilterBarVariantId) {
                aPromises.push(_this2._applyControlVariant(oVM, oVariantIDs.sFilterBarVariantId, true));
              }
            });
          }
        }
        if (oVariantIDs.sTableVariantId) {
          var oController = oView.getController(),
            aTables = oController._getControls("table");
          aTables.forEach(function (oTable) {
            var oTableVariant = oTable.getVariant();
            if (oTable && oTableVariant) {
              oTableVariant.getVariants().forEach(function (oVariant) {
                if (oVariant.key === oVariantIDs.sTableVariantId) {
                  aPromises.push(_this2._applyControlVariant(oTableVariant, oVariantIDs.sTableVariantId));
                }
              });
            }
          });
        }
      }
      return Promise.all(aPromises);
    },
    _applyControlVariant: function (oVariant, sVariantID, bFilterVariantApplied) {
      var sVariantReference = this._checkIfVariantIdIsAvailable(oVariant, sVariantID) ? sVariantID : oVariant.getStandardVariantKey();
      var oVM = ControlVariantApplyAPI.activateVariant({
        element: oVariant,
        variantReference: sVariantReference
      });
      return oVM.then(function () {
        return bFilterVariantApplied;
      });
    },
    /************************************* private helper *****************************************/

    _getFilterBarVM: function (oView) {
      var oViewData = oView.getViewData();
      switch (oViewData.variantManagement) {
        case VariantManagementType.Page:
          return oView.byId("fe::PageVariantManagement");
        case VariantManagementType.Control:
          return oView.getController()._getFilterBarVariantControl();
        case VariantManagementType.None:
          return null;
        default:
          throw new Error("unhandled variant setting: ".concat(oViewData.variantManagement));
      }
    },
    _preventInitialSearch: function (oVariantManagement) {
      if (!oVariantManagement) {
        return true;
      }
      var aVariants = oVariantManagement.getVariants();
      var oCurrentVariant = aVariants.find(function (oItem) {
        return oItem.key === oVariantManagement.getCurrentVariantKey();
      });
      return !oCurrentVariant.executeOnSelect;
    },
    _applySelectionVariant: function (oView, oNavigationParameter, bFilterVariantApplied) {
      var oFilterBar = oView.getController()._getFilterBarControl(),
        oSelectionVariant = oNavigationParameter.selectionVariant,
        oSelectionVariantDefaults = oNavigationParameter.selectionVariantDefaults;
      if (!oFilterBar || !oSelectionVariant) {
        return Promise.resolve();
      }
      var oConditions = {};
      var oMetaModel = oView.getModel().getMetaModel();
      var oViewData = oView.getViewData();
      var sContextPath = oViewData.contextPath || "/".concat(oViewData.entitySet);
      var aMandatoryFilterFields = CommonUtils.getMandatoryFilterFields(oMetaModel, sContextPath);
      var bUseSemanticDateRange = oFilterBar.data("useSemanticDateRange");
      var oVariant;
      switch (oViewData.variantManagement) {
        case VariantManagementType.Page:
          oVariant = oView.byId("fe::PageVariantManagement");
          break;
        case VariantManagementType.Control:
          oVariant = oView.getController()._getFilterBarVariantControl();
          break;
        case VariantManagementType.None:
        default:
          break;
      }
      var bRequiresStandardVariant = oNavigationParameter.requiresStandardVariant;
      // check if FLP default values are there and is it standard variant
      var bIsFLPValuePresent = oSelectionVariantDefaults && oSelectionVariantDefaults.getSelectOptionsPropertyNames().length > 0 && oVariant.getDefaultVariantKey() === oVariant.getStandardVariantKey() && oNavigationParameter.bNavSelVarHasDefaultsOnly;

      // get conditions when FLP value is present
      if (bFilterVariantApplied || bIsFLPValuePresent) {
        oConditions = oFilterBar.getConditions();
      }
      CommonUtils.addDefaultDisplayCurrency(aMandatoryFilterFields, oSelectionVariant, oSelectionVariantDefaults);
      CommonUtils.addSelectionVariantToConditions(oSelectionVariant, oConditions, oMetaModel, sContextPath, bIsFLPValuePresent, bUseSemanticDateRange, oViewData);
      return this._activateSelectionVariant(oFilterBar, oConditions, oVariant, bRequiresStandardVariant, bFilterVariantApplied, bIsFLPValuePresent);
    },
    _activateSelectionVariant: function (oFilterBar, oConditions, oVariant, bRequiresStandardVariant, bFilterVariantApplied, bIsFLPValuePresent) {
      var _this3 = this;
      var oPromise;
      if (oVariant && !bFilterVariantApplied) {
        var oVariantKey = bRequiresStandardVariant ? oVariant.getStandardVariantKey() : oVariant.getDefaultVariantKey();
        if (oVariantKey === null) {
          oVariantKey = oVariant.getId();
        }
        oPromise = ControlVariantApplyAPI.activateVariant({
          element: oVariant,
          variantReference: oVariantKey
        }).then(function () {
          return bRequiresStandardVariant || oVariant.getDefaultVariantKey() === oVariant.getStandardVariantKey();
        });
      } else {
        oPromise = Promise.resolve(true);
      }
      return oPromise.then(function (bClearFilterAndReplaceWithAppState) {
        if (bClearFilterAndReplaceWithAppState) {
          return _this3._fnApplyConditions(oFilterBar, oConditions, bIsFLPValuePresent);
        }
      });
    },
    /*
     * Sets filtered: false flag to every field so that it can be cleared out
     *
     * @param oFilterBar filterbar control is used to display filter properties in a user-friendly manner to populate values for a query
     * @returns promise which will be resolved to object
     * @private
     */
    _fnClearStateBeforexAppNav: function (oFilterBar) {
      try {
        return Promise.resolve(StateUtil.retrieveExternalState(oFilterBar).then(function (oExternalState) {
          var oCondition = oExternalState.filter;
          for (var field in oCondition) {
            if (field !== "$editState" && field !== "$search" && oCondition[field]) {
              oCondition[field].forEach(function (condition) {
                condition["filtered"] = false;
              });
            }
          }
          return Promise.resolve(oCondition);
        }).catch(function (oError) {
          Log.error("Error while retrieving the external state", oError);
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    _fnApplyConditions: function (oFilterBar, oConditions, bIsFLPValuePresent) {
      try {
        var _this5 = this;
        var mFilter = {},
          aItems = [],
          fnAdjustValueHelpCondition = function (oCondition) {
            // in case the condition is meant for a field having a VH, the format required by MDC differs
            oCondition.validated = ConditionValidated.Validated;
            if (oCondition.operator === "Empty") {
              oCondition.operator = "EQ";
              oCondition.values = [""];
            } else if (oCondition.operator === "NotEmpty") {
              oCondition.operator = "NE";
              oCondition.values = [""];
            }
            delete oCondition.isEmpty;
          };
        var fnGetPropertyInfo = function (oFilterControl, sEntityTypePath) {
          var sEntitySetPath = ModelHelper.getEntitySetPath(sEntityTypePath),
            oMetaModel = oFilterControl.getModel().getMetaModel(),
            oFR = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oMetaModel),
            aNonFilterableProps = oFR[FilterRestrictions.NON_FILTERABLE_PROPERTIES],
            mFilterFields = FilterUtils.getConvertedFilterFields(oFilterControl, sEntityTypePath),
            aPropertyInfo = [];
          Object.keys(mFilterFields).forEach(function (sFilterFieldKey) {
            var oConvertedProperty = mFilterFields[sFilterFieldKey];
            var sPropertyPath = oConvertedProperty.conditionPath.replace(CONDITION_PATH_TO_PROPERTY_PATH_REGEX, "");
            if (aNonFilterableProps.indexOf(sPropertyPath) === -1) {
              var sAnnotationPath = oConvertedProperty.annotationPath;
              var oPropertyContext = oMetaModel.createBindingContext(sAnnotationPath);
              aPropertyInfo.push({
                path: oConvertedProperty.conditionPath,
                hiddenFilter: oConvertedProperty.availability === "Hidden",
                hasValueHelp: !sAnnotationPath ? false : PropertyFormatters.hasValueHelp(oPropertyContext.getObject(), {
                  context: oPropertyContext
                })
              });
            }
          });
          return aPropertyInfo;
        };
        return Promise.resolve(oFilterBar.waitForInitialization().then(function () {
          try {
            function _temp3() {
              var aPropertyInfo = fnGetPropertyInfo(oFilterBar, sEntityTypePath);
              aPropertyInfo.filter(function (oPropertyInfo) {
                return oPropertyInfo.path !== "$editState" && oPropertyInfo.path !== "$search";
              }).forEach(function (oPropertyInfo) {
                if (oPropertyInfo.path in oConditions) {
                  mFilter[oPropertyInfo.path] = oConditions[oPropertyInfo.path];
                  if (!oPropertyInfo.hiddenFilter) {
                    aItems.push({
                      name: oPropertyInfo.path
                    });
                  }
                  if (oPropertyInfo.hasValueHelp) {
                    mFilter[oPropertyInfo.path].forEach(fnAdjustValueHelpCondition);
                  } else {
                    mFilter[oPropertyInfo.path].forEach(function (oCondition) {
                      oCondition.validated = oCondition.filtered ? ConditionValidated.NotValidated : oCondition.validated;
                    });
                  }
                } else {
                  mFilter[oPropertyInfo.path] = [];
                }
              });
              return StateUtil.applyExternalState(oFilterBar, {
                filter: mFilter,
                items: aItems
              });
            }
            var sEntityTypePath = DelegateUtil.getCustomData(oFilterBar, "entityType");
            // During external app navigation, we have to clear the existing conditions to avoid merging of values coming from annotation and context
            // Condition !bIsFLPValuePresent indicates it's external app navigation
            var _temp4 = function () {
              if (!bIsFLPValuePresent) {
                return Promise.resolve(_this5._fnClearStateBeforexAppNav(oFilterBar)).then(function (oClearConditions) {
                  return Promise.resolve(StateUtil.applyExternalState(oFilterBar, {
                    filter: oClearConditions,
                    items: aItems
                  })).then(function () {});
                });
              }
            }();
            return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
          } catch (e) {
            return Promise.reject(e);
          }
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  };
  return ViewStateOverride;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZUeXBlIiwiTmF2TGlicmFyeSIsIlZhcmlhbnRNYW5hZ2VtZW50VHlwZSIsIkNvcmVMaWJyYXJ5IiwiVmFyaWFudE1hbmFnZW1lbnQiLCJUZW1wbGF0ZUNvbnRlbnRWaWV3IiwiSW5pdGlhbExvYWRNb2RlIiwiRmlsdGVyUmVzdHJpY3Rpb25zIiwiQ29tbW9uVXRpbHMiLCJDT05ESVRJT05fUEFUSF9UT19QUk9QRVJUWV9QQVRIX1JFR0VYIiwiVmlld1N0YXRlT3ZlcnJpZGUiLCJfYlNlYXJjaFRyaWdnZXJlZCIsImFwcGx5SW5pdGlhbFN0YXRlT25seSIsIm9uQmVmb3JlU3RhdGVBcHBsaWVkIiwiYVByb21pc2VzIiwib1ZpZXciLCJnZXRWaWV3Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwib0ZpbHRlckJhciIsIl9nZXRGaWx0ZXJCYXJDb250cm9sIiwiYVRhYmxlcyIsIl9nZXRDb250cm9scyIsInNldFN1c3BlbmRTZWxlY3Rpb24iLCJwdXNoIiwid2FpdEZvckluaXRpYWxpemF0aW9uIiwiZm9yRWFjaCIsIm9UYWJsZSIsImluaXRpYWxpemVkIiwib25BZnRlclN0YXRlQXBwbGllZCIsIl9pc0ZpbHRlckJhckhpZGRlbiIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwic2V0UHJvcGVydHkiLCJfaXNNdWx0aU1vZGUiLCJfZ2V0TXVsdGlNb2RlQ29udHJvbCIsInNldENvdW50c091dERhdGVkIiwiYWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzIiwiYUNvbnRyb2xzIiwiYVZpZXdDb250cm9scyIsImFDb250cm9sc1RvUmVmcmVzaCIsIktlZXBBbGl2ZUhlbHBlciIsImdldENvbnRyb2xzRm9yUmVmcmVzaCIsIkFycmF5IiwicHJvdG90eXBlIiwiYXBwbHkiLCJhZGFwdFN0YXRlQ29udHJvbHMiLCJhU3RhdGVDb250cm9scyIsIm9WaWV3RGF0YSIsImdldFZpZXdEYXRhIiwiYkNvbnRyb2xWTSIsInZhcmlhbnRNYW5hZ2VtZW50IiwiQ29udHJvbCIsIm9GaWx0ZXJCYXJWTSIsIl9nZXRGaWx0ZXJCYXJWTSIsIm9RdWlja0ZpbHRlciIsImdldFF1aWNrRmlsdGVyIiwiZ2V0VmFyaWFudCIsIm9DaGFydCIsIl9oYXNNdWx0aVZpc3VhbGl6YXRpb25zIiwiX2dldFNlZ21lbnRlZEJ1dHRvbiIsIkNoYXJ0IiwiVGFibGUiLCJieUlkIiwicmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzIiwibUFkZGl0aW9uYWxTdGF0ZXMiLCJiUGVuZGluZ0ZpbHRlciIsImdldFByb3BlcnR5IiwiZGF0YUxvYWRlZCIsInNBbHBDb250ZW50VmlldyIsImFscENvbnRlbnRWaWV3IiwiYXBwbHlBZGRpdGlvbmFsU3RhdGVzIiwib0FkZGl0aW9uYWxTdGF0ZXMiLCJ0cmlnZ2VyU2VhcmNoIiwic3lzdGVtIiwiZGVza3RvcCIsIkh5YnJpZCIsImdldE1vZGVsIiwiZ2V0UGF0aCIsIl9hcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzVG9GaWx0ZXJiYXIiLCJvTmF2aWdhdGlvblBhcmFtZXRlciIsImFSZXN1bHRzIiwib0FwcENvbXBvbmVudCIsImdldEFwcENvbXBvbmVudCIsIm9Db21wb25lbnREYXRhIiwiZ2V0Q29tcG9uZW50RGF0YSIsIm9TdGFydHVwUGFyYW1ldGVycyIsInN0YXJ0dXBQYXJhbWV0ZXJzIiwib1ZhcmlhbnRQcm9taXNlIiwiaGFuZGxlVmFyaWFudElkUGFzc2VkVmlhVVJMUGFyYW1zIiwiYkZpbHRlclZhcmlhbnRBcHBsaWVkIiwidGhlbiIsImFWYXJpYW50cyIsImxlbmd0aCIsIl9hcHBseVNlbGVjdGlvblZhcmlhbnQiLCJvRHluYW1pY1BhZ2UiLCJfZ2V0RHluYW1pY0xpc3RSZXBvcnRDb250cm9sIiwiYlByZXZlbnRJbml0aWFsU2VhcmNoIiwib0ZpbHRlckJhckNvbnRyb2wiLCJuYXZpZ2F0aW9uVHlwZSIsImluaXRpYWwiLCJyZXF1aXJlc1N0YW5kYXJkVmFyaWFudCIsImluaXRpYWxMb2FkIiwiRW5hYmxlZCIsIl9zaG91bGRBdXRvVHJpZ2dlclNlYXJjaCIsIl9wcmV2ZW50SW5pdGlhbFNlYXJjaCIsInNldEhlYWRlckV4cGFuZGVkIiwiY2F0Y2giLCJMb2ciLCJlcnJvciIsIm9VcmxQYXJhbXMiLCJhUGFnZVZhcmlhbnRJZCIsImFGaWx0ZXJCYXJWYXJpYW50SWQiLCJhVGFibGVWYXJpYW50SWQiLCJvVmFyaWFudCIsInNQYWdlVmFyaWFudElkIiwic0ZpbHRlckJhclZhcmlhbnRJZCIsInNUYWJsZVZhcmlhbnRJZCIsIl9oYW5kbGVDb250cm9sVmFyaWFudElkIiwib1ZhcmlhbnRJRHMiLCJvVk0iLCJzVmFyaWFudE1hbmFnZW1lbnQiLCJnZXRWYXJpYW50cyIsImtleSIsIl9hcHBseUNvbnRyb2xWYXJpYW50IiwiX2dldEZpbHRlckJhclZhcmlhbnRDb250cm9sIiwib1RhYmxlVmFyaWFudCIsIlByb21pc2UiLCJhbGwiLCJzVmFyaWFudElEIiwic1ZhcmlhbnRSZWZlcmVuY2UiLCJfY2hlY2tJZlZhcmlhbnRJZElzQXZhaWxhYmxlIiwiZ2V0U3RhbmRhcmRWYXJpYW50S2V5IiwiQ29udHJvbFZhcmlhbnRBcHBseUFQSSIsImFjdGl2YXRlVmFyaWFudCIsImVsZW1lbnQiLCJ2YXJpYW50UmVmZXJlbmNlIiwiUGFnZSIsIk5vbmUiLCJFcnJvciIsIm9WYXJpYW50TWFuYWdlbWVudCIsIm9DdXJyZW50VmFyaWFudCIsImZpbmQiLCJvSXRlbSIsImdldEN1cnJlbnRWYXJpYW50S2V5IiwiZXhlY3V0ZU9uU2VsZWN0Iiwib1NlbGVjdGlvblZhcmlhbnQiLCJzZWxlY3Rpb25WYXJpYW50Iiwib1NlbGVjdGlvblZhcmlhbnREZWZhdWx0cyIsInNlbGVjdGlvblZhcmlhbnREZWZhdWx0cyIsInJlc29sdmUiLCJvQ29uZGl0aW9ucyIsIm9NZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJzQ29udGV4dFBhdGgiLCJjb250ZXh0UGF0aCIsImVudGl0eVNldCIsImFNYW5kYXRvcnlGaWx0ZXJGaWVsZHMiLCJnZXRNYW5kYXRvcnlGaWx0ZXJGaWVsZHMiLCJiVXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJkYXRhIiwiYlJlcXVpcmVzU3RhbmRhcmRWYXJpYW50IiwiYklzRkxQVmFsdWVQcmVzZW50IiwiZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMiLCJnZXREZWZhdWx0VmFyaWFudEtleSIsImJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHkiLCJnZXRDb25kaXRpb25zIiwiYWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeSIsImFkZFNlbGVjdGlvblZhcmlhbnRUb0NvbmRpdGlvbnMiLCJfYWN0aXZhdGVTZWxlY3Rpb25WYXJpYW50Iiwib1Byb21pc2UiLCJvVmFyaWFudEtleSIsImdldElkIiwiYkNsZWFyRmlsdGVyQW5kUmVwbGFjZVdpdGhBcHBTdGF0ZSIsIl9mbkFwcGx5Q29uZGl0aW9ucyIsIl9mbkNsZWFyU3RhdGVCZWZvcmV4QXBwTmF2IiwiU3RhdGVVdGlsIiwicmV0cmlldmVFeHRlcm5hbFN0YXRlIiwib0V4dGVybmFsU3RhdGUiLCJvQ29uZGl0aW9uIiwiZmlsdGVyIiwiZmllbGQiLCJjb25kaXRpb24iLCJvRXJyb3IiLCJtRmlsdGVyIiwiYUl0ZW1zIiwiZm5BZGp1c3RWYWx1ZUhlbHBDb25kaXRpb24iLCJ2YWxpZGF0ZWQiLCJDb25kaXRpb25WYWxpZGF0ZWQiLCJWYWxpZGF0ZWQiLCJvcGVyYXRvciIsInZhbHVlcyIsImlzRW1wdHkiLCJmbkdldFByb3BlcnR5SW5mbyIsIm9GaWx0ZXJDb250cm9sIiwic0VudGl0eVR5cGVQYXRoIiwic0VudGl0eVNldFBhdGgiLCJNb2RlbEhlbHBlciIsImdldEVudGl0eVNldFBhdGgiLCJvRlIiLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgiLCJhTm9uRmlsdGVyYWJsZVByb3BzIiwiTk9OX0ZJTFRFUkFCTEVfUFJPUEVSVElFUyIsIm1GaWx0ZXJGaWVsZHMiLCJGaWx0ZXJVdGlscyIsImdldENvbnZlcnRlZEZpbHRlckZpZWxkcyIsImFQcm9wZXJ0eUluZm8iLCJPYmplY3QiLCJrZXlzIiwic0ZpbHRlckZpZWxkS2V5Iiwib0NvbnZlcnRlZFByb3BlcnR5Iiwic1Byb3BlcnR5UGF0aCIsImNvbmRpdGlvblBhdGgiLCJyZXBsYWNlIiwiaW5kZXhPZiIsInNBbm5vdGF0aW9uUGF0aCIsImFubm90YXRpb25QYXRoIiwib1Byb3BlcnR5Q29udGV4dCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwicGF0aCIsImhpZGRlbkZpbHRlciIsImF2YWlsYWJpbGl0eSIsImhhc1ZhbHVlSGVscCIsIlByb3BlcnR5Rm9ybWF0dGVycyIsImdldE9iamVjdCIsImNvbnRleHQiLCJvUHJvcGVydHlJbmZvIiwibmFtZSIsImZpbHRlcmVkIiwiTm90VmFsaWRhdGVkIiwiYXBwbHlFeHRlcm5hbFN0YXRlIiwiaXRlbXMiLCJEZWxlZ2F0ZVV0aWwiLCJnZXRDdXN0b21EYXRhIiwib0NsZWFyQ29uZGl0aW9ucyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmlld1N0YXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHR5cGUgVmlld1N0YXRlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9WaWV3U3RhdGVcIjtcbmltcG9ydCBLZWVwQWxpdmVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvS2VlcEFsaXZlSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IENvcmVMaWJyYXJ5IGZyb20gXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgKiBhcyBQcm9wZXJ0eUZvcm1hdHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlGb3JtYXR0ZXJzXCI7XG5pbXBvcnQgRGVsZWdhdGVVdGlsIGZyb20gXCJzYXAvZmUvbWFjcm9zL0RlbGVnYXRlVXRpbFwiO1xuaW1wb3J0IEZpbHRlclV0aWxzIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpbHRlci9GaWx0ZXJVdGlsc1wiO1xuaW1wb3J0IE5hdkxpYnJhcnkgZnJvbSBcInNhcC9mZS9uYXZpZ2F0aW9uL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIExpc3RSZXBvcnRDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvdGVtcGxhdGVzL0xpc3RSZXBvcnQvTGlzdFJlcG9ydENvbnRyb2xsZXIuY29udHJvbGxlclwiO1xuaW1wb3J0IHsgc3lzdGVtIH0gZnJvbSBcInNhcC91aS9EZXZpY2VcIjtcbmltcG9ydCBDb250cm9sVmFyaWFudEFwcGx5QVBJIGZyb20gXCJzYXAvdWkvZmwvYXBwbHkvYXBpL0NvbnRyb2xWYXJpYW50QXBwbHlBUElcIjtcbmltcG9ydCB0eXBlIFZhcmlhbnRNYW5hZ2VtZW50IGZyb20gXCJzYXAvdWkvZmwvdmFyaWFudHMvVmFyaWFudE1hbmFnZW1lbnRcIjtcbmltcG9ydCBDb25kaXRpb25WYWxpZGF0ZWQgZnJvbSBcInNhcC91aS9tZGMvZW51bS9Db25kaXRpb25WYWxpZGF0ZWRcIjtcbmltcG9ydCBGaWx0ZXJCYXIgZnJvbSBcInNhcC91aS9tZGMvRmlsdGVyQmFyXCI7XG5pbXBvcnQgU3RhdGVVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3AxM24vU3RhdGVVdGlsXCI7XG5pbXBvcnQgdHlwZSBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuXG5jb25zdCBOYXZUeXBlID0gTmF2TGlicmFyeS5OYXZUeXBlLFxuXHRWYXJpYW50TWFuYWdlbWVudFR5cGUgPSBDb3JlTGlicmFyeS5WYXJpYW50TWFuYWdlbWVudCxcblx0VGVtcGxhdGVDb250ZW50VmlldyA9IENvcmVMaWJyYXJ5LlRlbXBsYXRlQ29udGVudFZpZXcsXG5cdEluaXRpYWxMb2FkTW9kZSA9IENvcmVMaWJyYXJ5LkluaXRpYWxMb2FkTW9kZTtcbmNvbnN0IEZpbHRlclJlc3RyaWN0aW9ucyA9IENvbW1vblV0aWxzLkZpbHRlclJlc3RyaWN0aW9ucyxcblx0Q09ORElUSU9OX1BBVEhfVE9fUFJPUEVSVFlfUEFUSF9SRUdFWCA9IC9cXCt8XFwqL2c7XG5cbmNvbnN0IFZpZXdTdGF0ZU92ZXJyaWRlOiBhbnkgPSB7XG5cdF9iU2VhcmNoVHJpZ2dlcmVkOiBmYWxzZSxcblx0YXBwbHlJbml0aWFsU3RhdGVPbmx5OiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdG9uQmVmb3JlU3RhdGVBcHBsaWVkOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlICYgdHlwZW9mIFZpZXdTdGF0ZU92ZXJyaWRlLCBhUHJvbWlzZXM6IGFueSkge1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcixcblx0XHRcdG9GaWx0ZXJCYXIgPSBvQ29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpLFxuXHRcdFx0YVRhYmxlcyA9IG9Db250cm9sbGVyLl9nZXRDb250cm9scyhcInRhYmxlXCIpO1xuXHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRvRmlsdGVyQmFyLnNldFN1c3BlbmRTZWxlY3Rpb24odHJ1ZSk7XG5cdFx0XHRhUHJvbWlzZXMucHVzaCgob0ZpbHRlckJhciBhcyBhbnkpLndhaXRGb3JJbml0aWFsaXphdGlvbigpKTtcblx0XHR9XG5cdFx0YVRhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdFx0YVByb21pc2VzLnB1c2gob1RhYmxlLmluaXRpYWxpemVkKCkpO1xuXHRcdH0pO1xuXG5cdFx0ZGVsZXRlIHRoaXMuX2JTZWFyY2hUcmlnZ2VyZWQ7XG5cdH0sXG5cdG9uQWZ0ZXJTdGF0ZUFwcGxpZWQ6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUpIHtcblx0XHRjb25zdCBvQ29udHJvbGxlciA9IHRoaXMuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcjtcblx0XHRjb25zdCBvRmlsdGVyQmFyID0gb0NvbnRyb2xsZXIuX2dldEZpbHRlckJhckNvbnRyb2woKTtcblx0XHRpZiAob0ZpbHRlckJhcikge1xuXHRcdFx0b0ZpbHRlckJhci5zZXRTdXNwZW5kU2VsZWN0aW9uKGZhbHNlKTtcblx0XHR9IGVsc2UgaWYgKG9Db250cm9sbGVyLl9pc0ZpbHRlckJhckhpZGRlbigpKSB7XG5cdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvQ29udHJvbGxlci5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImhhc1BlbmRpbmdGaWx0ZXJzXCIsIGZhbHNlKTtcblx0XHRcdGlmIChvQ29udHJvbGxlci5faXNNdWx0aU1vZGUoKSkge1xuXHRcdFx0XHRvQ29udHJvbGxlci5fZ2V0TXVsdGlNb2RlQ29udHJvbCgpLnNldENvdW50c091dERhdGVkKHRydWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0YWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlLCBhQ29udHJvbHM6IGFueSkge1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcixcblx0XHRcdGFWaWV3Q29udHJvbHMgPSBvQ29udHJvbGxlci5fZ2V0Q29udHJvbHMoKSxcblx0XHRcdGFDb250cm9sc1RvUmVmcmVzaCA9IEtlZXBBbGl2ZUhlbHBlci5nZXRDb250cm9sc0ZvclJlZnJlc2gob1ZpZXcsIGFWaWV3Q29udHJvbHMpO1xuXG5cdFx0QXJyYXkucHJvdG90eXBlLnB1c2guYXBwbHkoYUNvbnRyb2xzLCBhQ29udHJvbHNUb1JlZnJlc2gpO1xuXHR9LFxuXHRhZGFwdFN0YXRlQ29udHJvbHM6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUgJiB0eXBlb2YgVmlld1N0YXRlT3ZlcnJpZGUsIGFTdGF0ZUNvbnRyb2xzOiBhbnkpIHtcblx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0b0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgTGlzdFJlcG9ydENvbnRyb2xsZXIsXG5cdFx0XHRvVmlld0RhdGEgPSBvVmlldy5nZXRWaWV3RGF0YSgpLFxuXHRcdFx0YkNvbnRyb2xWTSA9IG9WaWV3RGF0YS52YXJpYW50TWFuYWdlbWVudCA9PT0gVmFyaWFudE1hbmFnZW1lbnRUeXBlLkNvbnRyb2w7XG5cblx0XHRjb25zdCBvRmlsdGVyQmFyVk0gPSB0aGlzLl9nZXRGaWx0ZXJCYXJWTShvVmlldyk7XG5cdFx0aWYgKG9GaWx0ZXJCYXJWTSkge1xuXHRcdFx0YVN0YXRlQ29udHJvbHMucHVzaChvRmlsdGVyQmFyVk0pO1xuXHRcdH1cblx0XHRpZiAob0NvbnRyb2xsZXIuX2lzTXVsdGlNb2RlKCkpIHtcblx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob0NvbnRyb2xsZXIuX2dldE11bHRpTW9kZUNvbnRyb2woKSk7XG5cdFx0fVxuXHRcdG9Db250cm9sbGVyLl9nZXRDb250cm9scyhcInRhYmxlXCIpLmZvckVhY2goZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRjb25zdCBvUXVpY2tGaWx0ZXIgPSBvVGFibGUuZ2V0UXVpY2tGaWx0ZXIoKTtcblx0XHRcdGlmIChvUXVpY2tGaWx0ZXIpIHtcblx0XHRcdFx0YVN0YXRlQ29udHJvbHMucHVzaChvUXVpY2tGaWx0ZXIpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGJDb250cm9sVk0pIHtcblx0XHRcdFx0YVN0YXRlQ29udHJvbHMucHVzaChvVGFibGUuZ2V0VmFyaWFudCgpKTtcblx0XHRcdH1cblx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob1RhYmxlKTtcblx0XHR9KTtcblx0XHRpZiAob0NvbnRyb2xsZXIuX2dldENvbnRyb2xzKFwiQ2hhcnRcIikpIHtcblx0XHRcdG9Db250cm9sbGVyLl9nZXRDb250cm9scyhcIkNoYXJ0XCIpLmZvckVhY2goZnVuY3Rpb24gKG9DaGFydDogYW55KSB7XG5cdFx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob0NoYXJ0KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAob0NvbnRyb2xsZXIuX2hhc011bHRpVmlzdWFsaXphdGlvbnMoKSkge1xuXHRcdFx0YVN0YXRlQ29udHJvbHMucHVzaChvQ29udHJvbGxlci5fZ2V0U2VnbWVudGVkQnV0dG9uKFRlbXBsYXRlQ29udGVudFZpZXcuQ2hhcnQpKTtcblx0XHRcdGFTdGF0ZUNvbnRyb2xzLnB1c2gob0NvbnRyb2xsZXIuX2dldFNlZ21lbnRlZEJ1dHRvbihUZW1wbGF0ZUNvbnRlbnRWaWV3LlRhYmxlKSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9GaWx0ZXJCYXIgPSBvQ29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRhU3RhdGVDb250cm9scy5wdXNoKG9GaWx0ZXJCYXIpO1xuXHRcdH1cblx0XHRhU3RhdGVDb250cm9scy5wdXNoKG9WaWV3LmJ5SWQoXCJmZTo6TGlzdFJlcG9ydFwiKSk7XG5cdH0sXG5cdHJldHJpZXZlQWRkaXRpb25hbFN0YXRlczogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSAmIHR5cGVvZiBWaWV3U3RhdGVPdmVycmlkZSwgbUFkZGl0aW9uYWxTdGF0ZXM6IGFueSkge1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcixcblx0XHRcdGJQZW5kaW5nRmlsdGVyID0gKG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpLmdldFByb3BlcnR5KFwiaGFzUGVuZGluZ0ZpbHRlcnNcIik7XG5cblx0XHRtQWRkaXRpb25hbFN0YXRlcy5kYXRhTG9hZGVkID0gIWJQZW5kaW5nRmlsdGVyIHx8ICEhdGhpcy5fYlNlYXJjaFRyaWdnZXJlZDtcblx0XHRpZiAob0NvbnRyb2xsZXIuX2hhc011bHRpVmlzdWFsaXphdGlvbnMoKSkge1xuXHRcdFx0Y29uc3Qgc0FscENvbnRlbnRWaWV3ID0gb1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKS5nZXRQcm9wZXJ0eShcImFscENvbnRlbnRWaWV3XCIpO1xuXHRcdFx0bUFkZGl0aW9uYWxTdGF0ZXMuYWxwQ29udGVudFZpZXcgPSBzQWxwQ29udGVudFZpZXc7XG5cdFx0fVxuXG5cdFx0ZGVsZXRlIHRoaXMuX2JTZWFyY2hUcmlnZ2VyZWQ7XG5cdH0sXG5cdGFwcGx5QWRkaXRpb25hbFN0YXRlczogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSAmIHR5cGVvZiBWaWV3U3RhdGVPdmVycmlkZSwgb0FkZGl0aW9uYWxTdGF0ZXM6IGFueSkge1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCksXG5cdFx0XHRvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBMaXN0UmVwb3J0Q29udHJvbGxlcixcblx0XHRcdG9GaWx0ZXJCYXIgPSBvQ29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXG5cdFx0aWYgKG9BZGRpdGlvbmFsU3RhdGVzKSB7XG5cdFx0XHQvLyBleHBsaWNpdCBjaGVjayBmb3IgYm9vbGVhbiB2YWx1ZXMgLSAndW5kZWZpbmVkJyBzaG91bGQgbm90IGFsdGVyIHRoZSB0cmlnZ2VyZWQgc2VhcmNoIHByb3BlcnR5XG5cdFx0XHRpZiAob0FkZGl0aW9uYWxTdGF0ZXMuZGF0YUxvYWRlZCA9PT0gZmFsc2UgJiYgb0ZpbHRlckJhcikge1xuXHRcdFx0XHQvLyB3aXRob3V0IHRoaXMsIHRoZSBkYXRhIGlzIGxvYWRlZCBvbiBuYXZpZ2F0aW5nIGJhY2tcblx0XHRcdFx0KG9GaWx0ZXJCYXIgYXMgYW55KS5fYlNlYXJjaFRyaWdnZXJlZCA9IGZhbHNlO1xuXHRcdFx0fSBlbHNlIGlmIChvQWRkaXRpb25hbFN0YXRlcy5kYXRhTG9hZGVkID09PSB0cnVlKSB7XG5cdFx0XHRcdGlmIChvRmlsdGVyQmFyKSB7XG5cdFx0XHRcdFx0b0ZpbHRlckJhci50cmlnZ2VyU2VhcmNoKCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5fYlNlYXJjaFRyaWdnZXJlZCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0NvbnRyb2xsZXIuX2hhc011bHRpVmlzdWFsaXphdGlvbnMoKSkge1xuXHRcdFx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0O1xuXHRcdFx0XHRpZiAoIXN5c3RlbS5kZXNrdG9wICYmIG9BZGRpdGlvbmFsU3RhdGVzLmFscENvbnRlbnRWaWV3ID09IFRlbXBsYXRlQ29udGVudFZpZXcuSHlicmlkKSB7XG5cdFx0XHRcdFx0b0FkZGl0aW9uYWxTdGF0ZXMuYWxwQ29udGVudFZpZXcgPSBUZW1wbGF0ZUNvbnRlbnRWaWV3LkNoYXJ0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdChvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0TW9kZWwoKSBhcyBKU09OTW9kZWwpLnNldFByb3BlcnR5KFxuXHRcdFx0XHRcdGAke29JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2FscENvbnRlbnRWaWV3YCxcblx0XHRcdFx0XHRvQWRkaXRpb25hbFN0YXRlcy5hbHBDb250ZW50Vmlld1xuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0X2FwcGx5TmF2aWdhdGlvblBhcmFtZXRlcnNUb0ZpbHRlcmJhcjogZnVuY3Rpb24gKHRoaXM6IFZpZXdTdGF0ZSAmIHR5cGVvZiBWaWV3U3RhdGVPdmVycmlkZSwgb05hdmlnYXRpb25QYXJhbWV0ZXI6IGFueSwgYVJlc3VsdHM6IGFueSkge1xuXHRcdGNvbnN0IG9WaWV3ID0gdGhpcy5nZXRWaWV3KCk7XG5cdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgTGlzdFJlcG9ydENvbnRyb2xsZXI7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IG9Db250cm9sbGVyLmdldEFwcENvbXBvbmVudCgpO1xuXHRcdGNvbnN0IG9Db21wb25lbnREYXRhID0gb0FwcENvbXBvbmVudC5nZXRDb21wb25lbnREYXRhKCk7XG5cdFx0Y29uc3Qgb1N0YXJ0dXBQYXJhbWV0ZXJzID0gKG9Db21wb25lbnREYXRhICYmIG9Db21wb25lbnREYXRhLnN0YXJ0dXBQYXJhbWV0ZXJzKSB8fCB7fTtcblx0XHRjb25zdCBvVmFyaWFudFByb21pc2UgPSB0aGlzLmhhbmRsZVZhcmlhbnRJZFBhc3NlZFZpYVVSTFBhcmFtcyhvU3RhcnR1cFBhcmFtZXRlcnMpO1xuXHRcdGxldCBiRmlsdGVyVmFyaWFudEFwcGxpZWQ6IGJvb2xlYW47XG5cdFx0YVJlc3VsdHMucHVzaChcblx0XHRcdG9WYXJpYW50UHJvbWlzZVxuXHRcdFx0XHQudGhlbigoYVZhcmlhbnRzOiBhbnlbXSkgPT4ge1xuXHRcdFx0XHRcdGlmIChhVmFyaWFudHMgJiYgYVZhcmlhbnRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdGlmIChhVmFyaWFudHNbMF0gPT09IHRydWUgfHwgYVZhcmlhbnRzWzFdID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRcdGJGaWx0ZXJWYXJpYW50QXBwbGllZCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB0aGlzLl9hcHBseVNlbGVjdGlvblZhcmlhbnQob1ZpZXcsIG9OYXZpZ2F0aW9uUGFyYW1ldGVyLCBiRmlsdGVyVmFyaWFudEFwcGxpZWQpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qgb0R5bmFtaWNQYWdlID0gb0NvbnRyb2xsZXIuX2dldER5bmFtaWNMaXN0UmVwb3J0Q29udHJvbCgpO1xuXHRcdFx0XHRcdGxldCBiUHJldmVudEluaXRpYWxTZWFyY2ggPSBmYWxzZTtcblx0XHRcdFx0XHRjb25zdCBvRmlsdGVyQmFyVk0gPSB0aGlzLl9nZXRGaWx0ZXJCYXJWTShvVmlldyk7XG5cdFx0XHRcdFx0Y29uc3Qgb0ZpbHRlckJhckNvbnRyb2wgPSBvQ29udHJvbGxlci5fZ2V0RmlsdGVyQmFyQ29udHJvbCgpO1xuXHRcdFx0XHRcdGlmIChvRmlsdGVyQmFyQ29udHJvbCkge1xuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHQob05hdmlnYXRpb25QYXJhbWV0ZXIubmF2aWdhdGlvblR5cGUgIT09IE5hdlR5cGUuaW5pdGlhbCAmJiBvTmF2aWdhdGlvblBhcmFtZXRlci5yZXF1aXJlc1N0YW5kYXJkVmFyaWFudCkgfHxcblx0XHRcdFx0XHRcdFx0KCFvRmlsdGVyQmFyVk0gJiYgb1ZpZXcuZ2V0Vmlld0RhdGEoKS5pbml0aWFsTG9hZCA9PT0gSW5pdGlhbExvYWRNb2RlLkVuYWJsZWQpIHx8XG5cdFx0XHRcdFx0XHRcdG9Db250cm9sbGVyLl9zaG91bGRBdXRvVHJpZ2dlclNlYXJjaChvRmlsdGVyQmFyVk0pXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0b0ZpbHRlckJhckNvbnRyb2wudHJpZ2dlclNlYXJjaCgpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0YlByZXZlbnRJbml0aWFsU2VhcmNoID0gdGhpcy5fcHJldmVudEluaXRpYWxTZWFyY2gob0ZpbHRlckJhclZNKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdC8vIHJlc2V0IHRoZSBzdXNwZW5kIHNlbGVjdGlvbiBvbiBmaWx0ZXIgYmFyIHRvIGFsbG93IGxvYWRpbmcgb2YgZGF0YSB3aGVuIG5lZWRlZCAod2FzIHNldCBvbiBMUiBJbml0KVxuXHRcdFx0XHRcdFx0b0ZpbHRlckJhckNvbnRyb2wuc2V0U3VzcGVuZFNlbGVjdGlvbihmYWxzZSk7XG5cdFx0XHRcdFx0XHR0aGlzLl9iU2VhcmNoVHJpZ2dlcmVkID0gIWJQcmV2ZW50SW5pdGlhbFNlYXJjaDtcblx0XHRcdFx0XHRcdG9EeW5hbWljUGFnZS5zZXRIZWFkZXJFeHBhbmRlZChzeXN0ZW0uZGVza3RvcCB8fCBiUHJldmVudEluaXRpYWxTZWFyY2gpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJWYXJpYW50IElEIGNhbm5vdCBiZSBhcHBsaWVkXCIpO1xuXHRcdFx0XHR9KVxuXHRcdCk7XG5cdH0sXG5cblx0aGFuZGxlVmFyaWFudElkUGFzc2VkVmlhVVJMUGFyYW1zOiBmdW5jdGlvbiAodGhpczogVmlld1N0YXRlICYgdHlwZW9mIFZpZXdTdGF0ZU92ZXJyaWRlLCBvVXJsUGFyYW1zOiBhbnkpIHtcblx0XHRjb25zdCBhUGFnZVZhcmlhbnRJZCA9IG9VcmxQYXJhbXNbXCJzYXAtdWktZmUtdmFyaWFudC1pZFwiXSxcblx0XHRcdGFGaWx0ZXJCYXJWYXJpYW50SWQgPSBvVXJsUGFyYW1zW1wic2FwLXVpLWZlLWZpbHRlcmJhci12YXJpYW50LWlkXCJdLFxuXHRcdFx0YVRhYmxlVmFyaWFudElkID0gb1VybFBhcmFtc1tcInNhcC11aS1mZS10YWJsZS12YXJpYW50LWlkXCJdO1xuXHRcdGxldCBvVmFyaWFudDtcblx0XHRpZiAoYVBhZ2VWYXJpYW50SWQgfHwgYUZpbHRlckJhclZhcmlhbnRJZCB8fCBhVGFibGVWYXJpYW50SWQpIHtcblx0XHRcdG9WYXJpYW50ID0ge1xuXHRcdFx0XHRzUGFnZVZhcmlhbnRJZDogYVBhZ2VWYXJpYW50SWQgJiYgYVBhZ2VWYXJpYW50SWRbMF0sXG5cdFx0XHRcdHNGaWx0ZXJCYXJWYXJpYW50SWQ6IGFGaWx0ZXJCYXJWYXJpYW50SWQgJiYgYUZpbHRlckJhclZhcmlhbnRJZFswXSxcblx0XHRcdFx0c1RhYmxlVmFyaWFudElkOiBhVGFibGVWYXJpYW50SWQgJiYgYVRhYmxlVmFyaWFudElkWzBdXG5cdFx0XHR9O1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5faGFuZGxlQ29udHJvbFZhcmlhbnRJZChvVmFyaWFudCk7XG5cdH0sXG5cblx0X2hhbmRsZUNvbnRyb2xWYXJpYW50SWQ6IGZ1bmN0aW9uICh0aGlzOiBWaWV3U3RhdGUgJiB0eXBlb2YgVmlld1N0YXRlT3ZlcnJpZGUsIG9WYXJpYW50SURzOiBhbnkpIHtcblx0XHRsZXQgb1ZNOiBWYXJpYW50TWFuYWdlbWVudDtcblx0XHRjb25zdCBvVmlldyA9IHRoaXMuZ2V0VmlldygpLFxuXHRcdFx0YVByb21pc2VzOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IHNWYXJpYW50TWFuYWdlbWVudCA9IG9WaWV3LmdldFZpZXdEYXRhKCkudmFyaWFudE1hbmFnZW1lbnQ7XG5cdFx0aWYgKG9WYXJpYW50SURzICYmIG9WYXJpYW50SURzLnNQYWdlVmFyaWFudElkICYmIHNWYXJpYW50TWFuYWdlbWVudCA9PT0gXCJQYWdlXCIpIHtcblx0XHRcdG9WTSA9IG9WaWV3LmJ5SWQoXCJmZTo6UGFnZVZhcmlhbnRNYW5hZ2VtZW50XCIpO1xuXHRcdFx0b1ZNLmdldFZhcmlhbnRzKCkuZm9yRWFjaCgob1ZhcmlhbnQ6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAob1ZhcmlhbnQua2V5ID09PSBvVmFyaWFudElEcy5zUGFnZVZhcmlhbnRJZCkge1xuXHRcdFx0XHRcdGFQcm9taXNlcy5wdXNoKHRoaXMuX2FwcGx5Q29udHJvbFZhcmlhbnQob1ZNLCBvVmFyaWFudElEcy5zUGFnZVZhcmlhbnRJZCwgdHJ1ZSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9IGVsc2UgaWYgKG9WYXJpYW50SURzICYmIHNWYXJpYW50TWFuYWdlbWVudCA9PT0gXCJDb250cm9sXCIpIHtcblx0XHRcdGlmIChvVmFyaWFudElEcy5zRmlsdGVyQmFyVmFyaWFudElkKSB7XG5cdFx0XHRcdG9WTSA9IG9WaWV3LmdldENvbnRyb2xsZXIoKS5fZ2V0RmlsdGVyQmFyVmFyaWFudENvbnRyb2woKTtcblx0XHRcdFx0aWYgKG9WTSkge1xuXHRcdFx0XHRcdG9WTS5nZXRWYXJpYW50cygpLmZvckVhY2goKG9WYXJpYW50OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdGlmIChvVmFyaWFudC5rZXkgPT09IG9WYXJpYW50SURzLnNGaWx0ZXJCYXJWYXJpYW50SWQpIHtcblx0XHRcdFx0XHRcdFx0YVByb21pc2VzLnB1c2godGhpcy5fYXBwbHlDb250cm9sVmFyaWFudChvVk0sIG9WYXJpYW50SURzLnNGaWx0ZXJCYXJWYXJpYW50SWQsIHRydWUpKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKG9WYXJpYW50SURzLnNUYWJsZVZhcmlhbnRJZCkge1xuXHRcdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSxcblx0XHRcdFx0XHRhVGFibGVzID0gb0NvbnRyb2xsZXIuX2dldENvbnRyb2xzKFwidGFibGVcIik7XG5cdFx0XHRcdGFUYWJsZXMuZm9yRWFjaCgob1RhYmxlOiBhbnkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBvVGFibGVWYXJpYW50ID0gb1RhYmxlLmdldFZhcmlhbnQoKTtcblx0XHRcdFx0XHRpZiAob1RhYmxlICYmIG9UYWJsZVZhcmlhbnQpIHtcblx0XHRcdFx0XHRcdG9UYWJsZVZhcmlhbnQuZ2V0VmFyaWFudHMoKS5mb3JFYWNoKChvVmFyaWFudDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdGlmIChvVmFyaWFudC5rZXkgPT09IG9WYXJpYW50SURzLnNUYWJsZVZhcmlhbnRJZCkge1xuXHRcdFx0XHRcdFx0XHRcdGFQcm9taXNlcy5wdXNoKHRoaXMuX2FwcGx5Q29udHJvbFZhcmlhbnQob1RhYmxlVmFyaWFudCwgb1ZhcmlhbnRJRHMuc1RhYmxlVmFyaWFudElkKSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLmFsbChhUHJvbWlzZXMpO1xuXHR9LFxuXG5cdF9hcHBseUNvbnRyb2xWYXJpYW50OiBmdW5jdGlvbiAob1ZhcmlhbnQ6IGFueSwgc1ZhcmlhbnRJRDogYW55LCBiRmlsdGVyVmFyaWFudEFwcGxpZWQ6IGFueSkge1xuXHRcdGNvbnN0IHNWYXJpYW50UmVmZXJlbmNlID0gdGhpcy5fY2hlY2tJZlZhcmlhbnRJZElzQXZhaWxhYmxlKG9WYXJpYW50LCBzVmFyaWFudElEKSA/IHNWYXJpYW50SUQgOiBvVmFyaWFudC5nZXRTdGFuZGFyZFZhcmlhbnRLZXkoKTtcblx0XHRjb25zdCBvVk0gPSBDb250cm9sVmFyaWFudEFwcGx5QVBJLmFjdGl2YXRlVmFyaWFudCh7XG5cdFx0XHRlbGVtZW50OiBvVmFyaWFudCxcblx0XHRcdHZhcmlhbnRSZWZlcmVuY2U6IHNWYXJpYW50UmVmZXJlbmNlXG5cdFx0fSk7XG5cdFx0cmV0dXJuIG9WTS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBiRmlsdGVyVmFyaWFudEFwcGxpZWQ7XG5cdFx0fSk7XG5cdH0sXG5cdC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqIHByaXZhdGUgaGVscGVyICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG5cdF9nZXRGaWx0ZXJCYXJWTTogZnVuY3Rpb24gKG9WaWV3OiBhbnkpIHtcblx0XHRjb25zdCBvVmlld0RhdGEgPSBvVmlldy5nZXRWaWV3RGF0YSgpO1xuXHRcdHN3aXRjaCAob1ZpZXdEYXRhLnZhcmlhbnRNYW5hZ2VtZW50KSB7XG5cdFx0XHRjYXNlIFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5QYWdlOlxuXHRcdFx0XHRyZXR1cm4gb1ZpZXcuYnlJZChcImZlOjpQYWdlVmFyaWFudE1hbmFnZW1lbnRcIik7XG5cdFx0XHRjYXNlIFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5Db250cm9sOlxuXHRcdFx0XHRyZXR1cm4gb1ZpZXcuZ2V0Q29udHJvbGxlcigpLl9nZXRGaWx0ZXJCYXJWYXJpYW50Q29udHJvbCgpO1xuXHRcdFx0Y2FzZSBWYXJpYW50TWFuYWdlbWVudFR5cGUuTm9uZTpcblx0XHRcdFx0cmV0dXJuIG51bGw7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYHVuaGFuZGxlZCB2YXJpYW50IHNldHRpbmc6ICR7b1ZpZXdEYXRhLnZhcmlhbnRNYW5hZ2VtZW50fWApO1xuXHRcdH1cblx0fSxcblxuXHRfcHJldmVudEluaXRpYWxTZWFyY2g6IGZ1bmN0aW9uIChvVmFyaWFudE1hbmFnZW1lbnQ6IGFueSkge1xuXHRcdGlmICghb1ZhcmlhbnRNYW5hZ2VtZW50KSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0Y29uc3QgYVZhcmlhbnRzID0gb1ZhcmlhbnRNYW5hZ2VtZW50LmdldFZhcmlhbnRzKCk7XG5cdFx0Y29uc3Qgb0N1cnJlbnRWYXJpYW50ID0gYVZhcmlhbnRzLmZpbmQoZnVuY3Rpb24gKG9JdGVtOiBhbnkpIHtcblx0XHRcdHJldHVybiBvSXRlbS5rZXkgPT09IG9WYXJpYW50TWFuYWdlbWVudC5nZXRDdXJyZW50VmFyaWFudEtleSgpO1xuXHRcdH0pO1xuXHRcdHJldHVybiAhb0N1cnJlbnRWYXJpYW50LmV4ZWN1dGVPblNlbGVjdDtcblx0fSxcblxuXHRfYXBwbHlTZWxlY3Rpb25WYXJpYW50OiBmdW5jdGlvbiAob1ZpZXc6IGFueSwgb05hdmlnYXRpb25QYXJhbWV0ZXI6IGFueSwgYkZpbHRlclZhcmlhbnRBcHBsaWVkOiBhbnkpIHtcblx0XHRjb25zdCBvRmlsdGVyQmFyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpLl9nZXRGaWx0ZXJCYXJDb250cm9sKCksXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudCA9IG9OYXZpZ2F0aW9uUGFyYW1ldGVyLnNlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzID0gb05hdmlnYXRpb25QYXJhbWV0ZXIuc2VsZWN0aW9uVmFyaWFudERlZmF1bHRzO1xuXHRcdGlmICghb0ZpbHRlckJhciB8fCAhb1NlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9XG5cdFx0bGV0IG9Db25kaXRpb25zID0ge307XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9WaWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhID0gb1ZpZXcuZ2V0Vmlld0RhdGEoKTtcblx0XHRjb25zdCBzQ29udGV4dFBhdGggPSBvVmlld0RhdGEuY29udGV4dFBhdGggfHwgYC8ke29WaWV3RGF0YS5lbnRpdHlTZXR9YDtcblx0XHRjb25zdCBhTWFuZGF0b3J5RmlsdGVyRmllbGRzID0gQ29tbW9uVXRpbHMuZ2V0TWFuZGF0b3J5RmlsdGVyRmllbGRzKG9NZXRhTW9kZWwsIHNDb250ZXh0UGF0aCk7XG5cdFx0Y29uc3QgYlVzZVNlbWFudGljRGF0ZVJhbmdlID0gb0ZpbHRlckJhci5kYXRhKFwidXNlU2VtYW50aWNEYXRlUmFuZ2VcIik7XG5cdFx0bGV0IG9WYXJpYW50O1xuXHRcdHN3aXRjaCAob1ZpZXdEYXRhLnZhcmlhbnRNYW5hZ2VtZW50KSB7XG5cdFx0XHRjYXNlIFZhcmlhbnRNYW5hZ2VtZW50VHlwZS5QYWdlOlxuXHRcdFx0XHRvVmFyaWFudCA9IG9WaWV3LmJ5SWQoXCJmZTo6UGFnZVZhcmlhbnRNYW5hZ2VtZW50XCIpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVmFyaWFudE1hbmFnZW1lbnRUeXBlLkNvbnRyb2w6XG5cdFx0XHRcdG9WYXJpYW50ID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpLl9nZXRGaWx0ZXJCYXJWYXJpYW50Q29udHJvbCgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVmFyaWFudE1hbmFnZW1lbnRUeXBlLk5vbmU6XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0Y29uc3QgYlJlcXVpcmVzU3RhbmRhcmRWYXJpYW50ID0gb05hdmlnYXRpb25QYXJhbWV0ZXIucmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQ7XG5cdFx0Ly8gY2hlY2sgaWYgRkxQIGRlZmF1bHQgdmFsdWVzIGFyZSB0aGVyZSBhbmQgaXMgaXQgc3RhbmRhcmQgdmFyaWFudFxuXHRcdGNvbnN0IGJJc0ZMUFZhbHVlUHJlc2VudDogYm9vbGVhbiA9XG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzICYmXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzLmdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzKCkubGVuZ3RoID4gMCAmJlxuXHRcdFx0b1ZhcmlhbnQuZ2V0RGVmYXVsdFZhcmlhbnRLZXkoKSA9PT0gb1ZhcmlhbnQuZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCkgJiZcblx0XHRcdG9OYXZpZ2F0aW9uUGFyYW1ldGVyLmJOYXZTZWxWYXJIYXNEZWZhdWx0c09ubHk7XG5cblx0XHQvLyBnZXQgY29uZGl0aW9ucyB3aGVuIEZMUCB2YWx1ZSBpcyBwcmVzZW50XG5cdFx0aWYgKGJGaWx0ZXJWYXJpYW50QXBwbGllZCB8fCBiSXNGTFBWYWx1ZVByZXNlbnQpIHtcblx0XHRcdG9Db25kaXRpb25zID0gb0ZpbHRlckJhci5nZXRDb25kaXRpb25zKCk7XG5cdFx0fVxuXHRcdENvbW1vblV0aWxzLmFkZERlZmF1bHREaXNwbGF5Q3VycmVuY3koYU1hbmRhdG9yeUZpbHRlckZpZWxkcywgb1NlbGVjdGlvblZhcmlhbnQsIG9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHMpO1xuXHRcdENvbW1vblV0aWxzLmFkZFNlbGVjdGlvblZhcmlhbnRUb0NvbmRpdGlvbnMoXG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudCxcblx0XHRcdG9Db25kaXRpb25zLFxuXHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdHNDb250ZXh0UGF0aCxcblx0XHRcdGJJc0ZMUFZhbHVlUHJlc2VudCxcblx0XHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdG9WaWV3RGF0YVxuXHRcdCk7XG5cblx0XHRyZXR1cm4gdGhpcy5fYWN0aXZhdGVTZWxlY3Rpb25WYXJpYW50KFxuXHRcdFx0b0ZpbHRlckJhcixcblx0XHRcdG9Db25kaXRpb25zLFxuXHRcdFx0b1ZhcmlhbnQsXG5cdFx0XHRiUmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQsXG5cdFx0XHRiRmlsdGVyVmFyaWFudEFwcGxpZWQsXG5cdFx0XHRiSXNGTFBWYWx1ZVByZXNlbnRcblx0XHQpO1xuXHR9LFxuXHRfYWN0aXZhdGVTZWxlY3Rpb25WYXJpYW50OiBmdW5jdGlvbiAoXG5cdFx0b0ZpbHRlckJhcjogYW55LFxuXHRcdG9Db25kaXRpb25zOiBhbnksXG5cdFx0b1ZhcmlhbnQ6IGFueSxcblx0XHRiUmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQ6IGFueSxcblx0XHRiRmlsdGVyVmFyaWFudEFwcGxpZWQ6IGFueSxcblx0XHRiSXNGTFBWYWx1ZVByZXNlbnQ/OiBib29sZWFuXG5cdCkge1xuXHRcdGxldCBvUHJvbWlzZTtcblxuXHRcdGlmIChvVmFyaWFudCAmJiAhYkZpbHRlclZhcmlhbnRBcHBsaWVkKSB7XG5cdFx0XHRsZXQgb1ZhcmlhbnRLZXkgPSBiUmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQgPyBvVmFyaWFudC5nZXRTdGFuZGFyZFZhcmlhbnRLZXkoKSA6IG9WYXJpYW50LmdldERlZmF1bHRWYXJpYW50S2V5KCk7XG5cdFx0XHRpZiAob1ZhcmlhbnRLZXkgPT09IG51bGwpIHtcblx0XHRcdFx0b1ZhcmlhbnRLZXkgPSBvVmFyaWFudC5nZXRJZCgpO1xuXHRcdFx0fVxuXHRcdFx0b1Byb21pc2UgPSBDb250cm9sVmFyaWFudEFwcGx5QVBJLmFjdGl2YXRlVmFyaWFudCh7XG5cdFx0XHRcdGVsZW1lbnQ6IG9WYXJpYW50LFxuXHRcdFx0XHR2YXJpYW50UmVmZXJlbmNlOiBvVmFyaWFudEtleVxuXHRcdFx0fSkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBiUmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQgfHwgb1ZhcmlhbnQuZ2V0RGVmYXVsdFZhcmlhbnRLZXkoKSA9PT0gb1ZhcmlhbnQuZ2V0U3RhbmRhcmRWYXJpYW50S2V5KCk7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1Byb21pc2UgPSBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG5cdFx0fVxuXHRcdHJldHVybiBvUHJvbWlzZS50aGVuKChiQ2xlYXJGaWx0ZXJBbmRSZXBsYWNlV2l0aEFwcFN0YXRlOiBhbnkpID0+IHtcblx0XHRcdGlmIChiQ2xlYXJGaWx0ZXJBbmRSZXBsYWNlV2l0aEFwcFN0YXRlKSB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9mbkFwcGx5Q29uZGl0aW9ucyhvRmlsdGVyQmFyLCBvQ29uZGl0aW9ucywgYklzRkxQVmFsdWVQcmVzZW50KTtcblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHQvKlxuXHQgKiBTZXRzIGZpbHRlcmVkOiBmYWxzZSBmbGFnIHRvIGV2ZXJ5IGZpZWxkIHNvIHRoYXQgaXQgY2FuIGJlIGNsZWFyZWQgb3V0XG5cdCAqXG5cdCAqIEBwYXJhbSBvRmlsdGVyQmFyIGZpbHRlcmJhciBjb250cm9sIGlzIHVzZWQgdG8gZGlzcGxheSBmaWx0ZXIgcHJvcGVydGllcyBpbiBhIHVzZXItZnJpZW5kbHkgbWFubmVyIHRvIHBvcHVsYXRlIHZhbHVlcyBmb3IgYSBxdWVyeVxuXHQgKiBAcmV0dXJucyBwcm9taXNlIHdoaWNoIHdpbGwgYmUgcmVzb2x2ZWQgdG8gb2JqZWN0XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZm5DbGVhclN0YXRlQmVmb3JleEFwcE5hdjogYXN5bmMgZnVuY3Rpb24gKG9GaWx0ZXJCYXI6IEZpbHRlckJhcikge1xuXHRcdHJldHVybiBhd2FpdCBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKG9GaWx0ZXJCYXIpXG5cdFx0XHQudGhlbigob0V4dGVybmFsU3RhdGU6IGFueSkgPT4ge1xuXHRcdFx0XHRjb25zdCBvQ29uZGl0aW9uID0gb0V4dGVybmFsU3RhdGUuZmlsdGVyO1xuXHRcdFx0XHRmb3IgKGNvbnN0IGZpZWxkIGluIG9Db25kaXRpb24pIHtcblx0XHRcdFx0XHRpZiAoZmllbGQgIT09IFwiJGVkaXRTdGF0ZVwiICYmIGZpZWxkICE9PSBcIiRzZWFyY2hcIiAmJiBvQ29uZGl0aW9uW2ZpZWxkXSkge1xuXHRcdFx0XHRcdFx0b0NvbmRpdGlvbltmaWVsZF0uZm9yRWFjaCgoY29uZGl0aW9uOiBSZWNvcmQ8c3RyaW5nLCBib29sZWFuPikgPT4ge1xuXHRcdFx0XHRcdFx0XHRjb25kaXRpb25bXCJmaWx0ZXJlZFwiXSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUob0NvbmRpdGlvbik7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciB3aGlsZSByZXRyaWV2aW5nIHRoZSBleHRlcm5hbCBzdGF0ZVwiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0sXG5cblx0X2ZuQXBwbHlDb25kaXRpb25zOiBhc3luYyBmdW5jdGlvbiAob0ZpbHRlckJhcjogYW55LCBvQ29uZGl0aW9uczogYW55LCBiSXNGTFBWYWx1ZVByZXNlbnQ/OiBib29sZWFuKSB7XG5cdFx0Y29uc3QgbUZpbHRlcjogYW55ID0ge30sXG5cdFx0XHRhSXRlbXM6IGFueVtdID0gW10sXG5cdFx0XHRmbkFkanVzdFZhbHVlSGVscENvbmRpdGlvbiA9IGZ1bmN0aW9uIChvQ29uZGl0aW9uOiBhbnkpIHtcblx0XHRcdFx0Ly8gaW4gY2FzZSB0aGUgY29uZGl0aW9uIGlzIG1lYW50IGZvciBhIGZpZWxkIGhhdmluZyBhIFZILCB0aGUgZm9ybWF0IHJlcXVpcmVkIGJ5IE1EQyBkaWZmZXJzXG5cdFx0XHRcdG9Db25kaXRpb24udmFsaWRhdGVkID0gQ29uZGl0aW9uVmFsaWRhdGVkLlZhbGlkYXRlZDtcblx0XHRcdFx0aWYgKG9Db25kaXRpb24ub3BlcmF0b3IgPT09IFwiRW1wdHlcIikge1xuXHRcdFx0XHRcdG9Db25kaXRpb24ub3BlcmF0b3IgPSBcIkVRXCI7XG5cdFx0XHRcdFx0b0NvbmRpdGlvbi52YWx1ZXMgPSBbXCJcIl07XG5cdFx0XHRcdH0gZWxzZSBpZiAob0NvbmRpdGlvbi5vcGVyYXRvciA9PT0gXCJOb3RFbXB0eVwiKSB7XG5cdFx0XHRcdFx0b0NvbmRpdGlvbi5vcGVyYXRvciA9IFwiTkVcIjtcblx0XHRcdFx0XHRvQ29uZGl0aW9uLnZhbHVlcyA9IFtcIlwiXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRkZWxldGUgb0NvbmRpdGlvbi5pc0VtcHR5O1xuXHRcdFx0fTtcblx0XHRjb25zdCBmbkdldFByb3BlcnR5SW5mbyA9IGZ1bmN0aW9uIChvRmlsdGVyQ29udHJvbDogYW55LCBzRW50aXR5VHlwZVBhdGg6IGFueSkge1xuXHRcdFx0Y29uc3Qgc0VudGl0eVNldFBhdGggPSBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKHNFbnRpdHlUeXBlUGF0aCksXG5cdFx0XHRcdG9NZXRhTW9kZWwgPSBvRmlsdGVyQ29udHJvbC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0XHRvRlIgPSBDb21tb25VdGlscy5nZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgoc0VudGl0eVNldFBhdGgsIG9NZXRhTW9kZWwpLFxuXHRcdFx0XHRhTm9uRmlsdGVyYWJsZVByb3BzID0gb0ZSW0ZpbHRlclJlc3RyaWN0aW9ucy5OT05fRklMVEVSQUJMRV9QUk9QRVJUSUVTXSxcblx0XHRcdFx0bUZpbHRlckZpZWxkcyA9IEZpbHRlclV0aWxzLmdldENvbnZlcnRlZEZpbHRlckZpZWxkcyhvRmlsdGVyQ29udHJvbCwgc0VudGl0eVR5cGVQYXRoKSxcblx0XHRcdFx0YVByb3BlcnR5SW5mbzogYW55W10gPSBbXTtcblx0XHRcdE9iamVjdC5rZXlzKG1GaWx0ZXJGaWVsZHMpLmZvckVhY2goZnVuY3Rpb24gKHNGaWx0ZXJGaWVsZEtleTogc3RyaW5nKSB7XG5cdFx0XHRcdGNvbnN0IG9Db252ZXJ0ZWRQcm9wZXJ0eSA9IG1GaWx0ZXJGaWVsZHNbc0ZpbHRlckZpZWxkS2V5XTtcblx0XHRcdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IG9Db252ZXJ0ZWRQcm9wZXJ0eS5jb25kaXRpb25QYXRoLnJlcGxhY2UoQ09ORElUSU9OX1BBVEhfVE9fUFJPUEVSVFlfUEFUSF9SRUdFWCwgXCJcIik7XG5cdFx0XHRcdGlmIChhTm9uRmlsdGVyYWJsZVByb3BzLmluZGV4T2Yoc1Byb3BlcnR5UGF0aCkgPT09IC0xKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc0Fubm90YXRpb25QYXRoID0gb0NvbnZlcnRlZFByb3BlcnR5LmFubm90YXRpb25QYXRoO1xuXHRcdFx0XHRcdGNvbnN0IG9Qcm9wZXJ0eUNvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNBbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRcdFx0YVByb3BlcnR5SW5mby5wdXNoKHtcblx0XHRcdFx0XHRcdHBhdGg6IG9Db252ZXJ0ZWRQcm9wZXJ0eS5jb25kaXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0aGlkZGVuRmlsdGVyOiBvQ29udmVydGVkUHJvcGVydHkuYXZhaWxhYmlsaXR5ID09PSBcIkhpZGRlblwiLFxuXHRcdFx0XHRcdFx0aGFzVmFsdWVIZWxwOiAhc0Fubm90YXRpb25QYXRoXG5cdFx0XHRcdFx0XHRcdD8gZmFsc2Vcblx0XHRcdFx0XHRcdFx0OiBQcm9wZXJ0eUZvcm1hdHRlcnMuaGFzVmFsdWVIZWxwKG9Qcm9wZXJ0eUNvbnRleHQuZ2V0T2JqZWN0KCksIHsgY29udGV4dDogb1Byb3BlcnR5Q29udGV4dCB9KVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBhUHJvcGVydHlJbmZvO1xuXHRcdH07XG5cblx0XHRyZXR1cm4gb0ZpbHRlckJhci53YWl0Rm9ySW5pdGlhbGl6YXRpb24oKS50aGVuKGFzeW5jICgpID0+IHtcblx0XHRcdGNvbnN0IHNFbnRpdHlUeXBlUGF0aCA9IERlbGVnYXRlVXRpbC5nZXRDdXN0b21EYXRhKG9GaWx0ZXJCYXIsIFwiZW50aXR5VHlwZVwiKTtcblx0XHRcdC8vIER1cmluZyBleHRlcm5hbCBhcHAgbmF2aWdhdGlvbiwgd2UgaGF2ZSB0byBjbGVhciB0aGUgZXhpc3RpbmcgY29uZGl0aW9ucyB0byBhdm9pZCBtZXJnaW5nIG9mIHZhbHVlcyBjb21pbmcgZnJvbSBhbm5vdGF0aW9uIGFuZCBjb250ZXh0XG5cdFx0XHQvLyBDb25kaXRpb24gIWJJc0ZMUFZhbHVlUHJlc2VudCBpbmRpY2F0ZXMgaXQncyBleHRlcm5hbCBhcHAgbmF2aWdhdGlvblxuXHRcdFx0aWYgKCFiSXNGTFBWYWx1ZVByZXNlbnQpIHtcblx0XHRcdFx0Y29uc3Qgb0NsZWFyQ29uZGl0aW9ucyA9IGF3YWl0IHRoaXMuX2ZuQ2xlYXJTdGF0ZUJlZm9yZXhBcHBOYXYob0ZpbHRlckJhcik7XG5cdFx0XHRcdGF3YWl0IFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUob0ZpbHRlckJhciwge1xuXHRcdFx0XHRcdGZpbHRlcjogb0NsZWFyQ29uZGl0aW9ucyxcblx0XHRcdFx0XHRpdGVtczogYUl0ZW1zXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0Y29uc3QgYVByb3BlcnR5SW5mbyA9IGZuR2V0UHJvcGVydHlJbmZvKG9GaWx0ZXJCYXIsIHNFbnRpdHlUeXBlUGF0aCk7XG5cdFx0XHRhUHJvcGVydHlJbmZvXG5cdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9Qcm9wZXJ0eUluZm86IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBvUHJvcGVydHlJbmZvLnBhdGggIT09IFwiJGVkaXRTdGF0ZVwiICYmIG9Qcm9wZXJ0eUluZm8ucGF0aCAhPT0gXCIkc2VhcmNoXCI7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChvUHJvcGVydHlJbmZvOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAob1Byb3BlcnR5SW5mby5wYXRoIGluIG9Db25kaXRpb25zKSB7XG5cdFx0XHRcdFx0XHRtRmlsdGVyW29Qcm9wZXJ0eUluZm8ucGF0aF0gPSBvQ29uZGl0aW9uc1tvUHJvcGVydHlJbmZvLnBhdGhdO1xuXHRcdFx0XHRcdFx0aWYgKCFvUHJvcGVydHlJbmZvLmhpZGRlbkZpbHRlcikge1xuXHRcdFx0XHRcdFx0XHRhSXRlbXMucHVzaCh7IG5hbWU6IG9Qcm9wZXJ0eUluZm8ucGF0aCB9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHlJbmZvLmhhc1ZhbHVlSGVscCkge1xuXHRcdFx0XHRcdFx0XHRtRmlsdGVyW29Qcm9wZXJ0eUluZm8ucGF0aF0uZm9yRWFjaChmbkFkanVzdFZhbHVlSGVscENvbmRpdGlvbik7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRtRmlsdGVyW29Qcm9wZXJ0eUluZm8ucGF0aF0uZm9yRWFjaChmdW5jdGlvbiAob0NvbmRpdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0b0NvbmRpdGlvbi52YWxpZGF0ZWQgPSBvQ29uZGl0aW9uLmZpbHRlcmVkID8gQ29uZGl0aW9uVmFsaWRhdGVkLk5vdFZhbGlkYXRlZCA6IG9Db25kaXRpb24udmFsaWRhdGVkO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bUZpbHRlcltvUHJvcGVydHlJbmZvLnBhdGhdID0gW107XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdHJldHVybiBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKG9GaWx0ZXJCYXIsIHsgZmlsdGVyOiBtRmlsdGVyLCBpdGVtczogYUl0ZW1zIH0pO1xuXHRcdH0pO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBWaWV3U3RhdGVPdmVycmlkZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7RUFvQkEsSUFBTUEsT0FBTyxHQUFHQyxVQUFVLENBQUNELE9BQU87SUFDakNFLHFCQUFxQixHQUFHQyxXQUFXLENBQUNDLGlCQUFpQjtJQUNyREMsbUJBQW1CLEdBQUdGLFdBQVcsQ0FBQ0UsbUJBQW1CO0lBQ3JEQyxlQUFlLEdBQUdILFdBQVcsQ0FBQ0csZUFBZTtFQUM5QyxJQUFNQyxrQkFBa0IsR0FBR0MsV0FBVyxDQUFDRCxrQkFBa0I7SUFDeERFLHFDQUFxQyxHQUFHLFFBQVE7RUFFakQsSUFBTUMsaUJBQXNCLEdBQUc7SUFDOUJDLGlCQUFpQixFQUFFLEtBQUs7SUFDeEJDLHFCQUFxQixFQUFFLFlBQVk7TUFDbEMsT0FBTyxJQUFJO0lBQ1osQ0FBQztJQUNEQyxvQkFBb0IsRUFBRSxVQUFzREMsU0FBYyxFQUFFO01BQzNGLElBQU1DLEtBQUssR0FBRyxJQUFJLENBQUNDLE9BQU8sRUFBRTtRQUMzQkMsV0FBVyxHQUFHRixLQUFLLENBQUNHLGFBQWEsRUFBMEI7UUFDM0RDLFVBQVUsR0FBR0YsV0FBVyxDQUFDRyxvQkFBb0IsRUFBRTtRQUMvQ0MsT0FBTyxHQUFHSixXQUFXLENBQUNLLFlBQVksQ0FBQyxPQUFPLENBQUM7TUFDNUMsSUFBSUgsVUFBVSxFQUFFO1FBQ2ZBLFVBQVUsQ0FBQ0ksbUJBQW1CLENBQUMsSUFBSSxDQUFDO1FBQ3BDVCxTQUFTLENBQUNVLElBQUks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