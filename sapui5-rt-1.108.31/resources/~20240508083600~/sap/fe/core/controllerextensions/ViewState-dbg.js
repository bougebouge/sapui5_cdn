/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/navigation/library", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/fl/apply/api/ControlVariantApplyAPI", "sap/ui/mdc/p13n/StateUtil"], function (Log, mergeObjects, CommonUtils, ClassSupport, KeepAliveHelper, ModelHelper, NavLibrary, ControllerExtension, OverrideExecution, ControlVariantApplyAPI, StateUtil) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _dec36, _dec37, _dec38, _dec39, _dec40, _dec41, _dec42, _dec43, _dec44, _dec45, _dec46, _dec47, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
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
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
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
  // additionalStates are stored next to control IDs, so name clash avoidance needed. Fortunately IDs have restrictions:
  // "Allowed is a sequence of characters (capital/lowercase), digits, underscores, dashes, points and/or colons."
  // Therefore adding a symbol like # or @
  var ADDITIONAL_STATES_KEY = "#additionalStates",
    NavType = NavLibrary.NavType;
  ///////////////////////////////////////////////////////////////////
  // methods to retrieve & apply states for the different controls //
  ///////////////////////////////////////////////////////////////////
  var _mControlStateHandlerMap = {
    "sap.ui.fl.variants.VariantManagement": {
      retrieve: function (oVM) {
        return {
          "variantId": oVM.getCurrentVariantKey()
        };
      },
      apply: function (oVM, oControlState) {
        if (oControlState && oControlState.variantId !== undefined && oControlState.variantId !== oVM.getCurrentVariantKey()) {
          var sVariantReference = this._checkIfVariantIdIsAvailable(oVM, oControlState.variantId) ? oControlState.variantId : oVM.getStandardVariantKey();
          return ControlVariantApplyAPI.activateVariant({
            element: oVM,
            variantReference: sVariantReference
          });
        }
      }
    },
    "sap.m.IconTabBar": {
      retrieve: function (oTabBar) {
        return {
          selectedKey: oTabBar.getSelectedKey()
        };
      },
      apply: function (oTabBar, oControlState) {
        if (oControlState && oControlState.selectedKey) {
          var oSelectedItem = oTabBar.getItems().find(function (oItem) {
            return oItem.getKey() === oControlState.selectedKey;
          });
          if (oSelectedItem) {
            oTabBar.setSelectedItem(oSelectedItem);
          }
        }
      }
    },
    "sap.ui.mdc.FilterBar": {
      retrieve: function (oFilterBar) {
        return StateUtil.retrieveExternalState(oFilterBar).then(function (mFilterBarState) {
          // remove sensitive or view state irrelevant fields
          var aPropertiesInfo = oFilterBar.getPropertyInfoSet(),
            mFilter = mFilterBarState.filter || {};
          aPropertiesInfo.filter(function (oPropertyInfo) {
            return mFilter[oPropertyInfo.path] && (oPropertyInfo.removeFromAppState || mFilter[oPropertyInfo.path].length === 0);
          }).forEach(function (oPropertyInfo) {
            delete mFilter[oPropertyInfo.path];
          });
          return mFilterBarState;
        });
      },
      apply: function (oFilterBar, oControlState) {
        try {
          return Promise.resolve(function () {
            if (oControlState) {
              // When we have a single valued filterfield then it is FE responsibility to clear the default conditions and apply the state
              var aPropertiesInfo = oFilterBar.getPropertyInfoSet();
              //fetching default conditions
              return _catch(function () {
                return Promise.resolve(StateUtil.retrieveExternalState(oFilterBar)).then(function (oState) {
                  Object.keys(oState.filter).forEach(function (sKey) {
                    for (var i = 0; i < aPropertiesInfo.length; i++) {
                      var propertyInfo = aPropertiesInfo[i];
                      //clear the conditions only if it is single valued field
                      if (sKey !== "$editState" && sKey !== "$search" && propertyInfo["key"] === sKey && propertyInfo["maxConditions"] <= 1) {
                        oState.filter[sKey].forEach(function (oCondition) {
                          oCondition.filtered = false;
                        });
                        // merge the cleared conditions with the apstate conditions
                        if (oControlState.filter[sKey]) {
                          oControlState.filter[sKey] = [].concat(_toConsumableArray(oControlState.filter[sKey]), _toConsumableArray(oState.filter[sKey]));
                        } else {
                          oControlState.filter[sKey] = oState.filter[sKey] || [];
                        }
                      }
                    }
                  });
                  return StateUtil.applyExternalState(oFilterBar, oControlState);
                });
              }, function (e) {
                Log.error("Filterbar apply failed because of StateUtil.retrieveExternalState: " + e);
              });
            }
          }());
        } catch (e) {
          return Promise.reject(e);
        }
      }
    },
    "sap.ui.mdc.Table": {
      retrieve: function (oTable) {
        return StateUtil.retrieveExternalState(oTable);
      },
      apply: function (oTable, oControlState) {
        if (oControlState) {
          if (!oControlState.supplementaryConfig) {
            oControlState.supplementaryConfig = {};
          }
          return StateUtil.applyExternalState(oTable, oControlState);
        }
      },
      refreshBinding: function (oTable) {
        var oTableBinding = oTable.getRowBinding();
        if (oTableBinding) {
          var oRootBinding = oTableBinding.getRootBinding();
          if (oRootBinding === oTableBinding) {
            // absolute binding
            oTableBinding.refresh();
          } else {
            // relative binding
            var oHeaderContext = oTableBinding.getHeaderContext();
            var sGroupId = oTableBinding.getGroupId();
            if (oHeaderContext) {
              oHeaderContext.requestSideEffects([{
                $NavigationPropertyPath: ""
              }], sGroupId);
            }
          }
        } else {
          Log.info("Table: ".concat(oTable.getId(), " was not refreshed. No binding found!"));
        }
      }
    },
    "sap.ui.mdc.Chart": {
      retrieve: function (oChart) {
        return StateUtil.retrieveExternalState(oChart);
      },
      apply: function (oChart, oControlState) {
        if (oControlState) {
          return StateUtil.applyExternalState(oChart, oControlState);
        }
      }
    },
    "sap.uxap.ObjectPageLayout": {
      retrieve: function (oOPLayout) {
        return {
          selectedSection: oOPLayout.getSelectedSection()
        };
      },
      apply: function (oOPLayout, oControlState) {
        if (oControlState) {
          oOPLayout.setSelectedSection(oControlState.selectedSection);
        }
      },
      refreshBinding: function (oOPLayout) {
        var oBindingContext = oOPLayout.getBindingContext();
        var oBinding = oBindingContext && oBindingContext.getBinding();
        if (oBinding) {
          var sMetaPath = ModelHelper.getMetaPathForContext(oBindingContext);
          var sStrategy = KeepAliveHelper.getControlRefreshStrategyForContextPath(oOPLayout, sMetaPath);
          if (sStrategy === "self") {
            // Refresh main context and 1-1 navigation properties or OP
            var oModel = oBindingContext.getModel(),
              oMetaModel = oModel.getMetaModel(),
              oNavigationProperties = CommonUtils.getContextPathProperties(oMetaModel, sMetaPath, {
                $kind: "NavigationProperty"
              }) || {},
              aNavPropertiesToRequest = Object.keys(oNavigationProperties).reduce(function (aPrev, sNavProp) {
                if (oNavigationProperties[sNavProp].$isCollection !== true) {
                  aPrev.push({
                    $NavigationPropertyPath: sNavProp
                  });
                }
                return aPrev;
              }, []),
              aProperties = [{
                $PropertyPath: "*"
              }],
              sGroupId = oBinding.getGroupId();
            oBindingContext.requestSideEffects(aProperties.concat(aNavPropertiesToRequest), sGroupId);
          } else if (sStrategy === "includingDependents") {
            // Complete refresh
            oBinding.refresh();
          }
        } else {
          Log.info("ObjectPage: ".concat(oOPLayout.getId(), " was not refreshed. No binding found!"));
        }
      }
    },
    "sap.fe.macros.table.QuickFilterContainer": {
      retrieve: function (oQuickFilter) {
        return {
          selectedKey: oQuickFilter.getSelectorKey()
        };
      },
      apply: function (oQuickFilter, oControlState) {
        if (oControlState) {
          oQuickFilter.setSelectorKey(oControlState.selectedKey);
        }
      }
    },
    "sap.m.SegmentedButton": {
      retrieve: function (oSegmentedButton) {
        return {
          selectedKey: oSegmentedButton.getSelectedKey()
        };
      },
      apply: function (oSegmentedButton, oControlState) {
        if (oControlState) {
          oSegmentedButton.setSelectedKey(oControlState.selectedKey);
        }
      }
    },
    "sap.m.Select": {
      retrieve: function (oSelect) {
        return {
          selectedKey: oSelect.getSelectedKey()
        };
      },
      apply: function (oSelect, oControlState) {
        if (oControlState) {
          oSelect.setSelectedKey(oControlState.selectedKey);
        }
      }
    },
    "sap.f.DynamicPage": {
      retrieve: function (oDynamicPage) {
        return {
          headerExpanded: oDynamicPage.getHeaderExpanded()
        };
      },
      apply: function (oDynamicPage, oControlState) {
        if (oControlState) {
          oDynamicPage.setHeaderExpanded(oControlState.headerExpanded);
        }
      }
    },
    "sap.ui.core.mvc.View": {
      retrieve: function (oView) {
        var oController = oView.getController();
        if (oController && oController.viewState) {
          return oController.viewState.retrieveViewState(oController.viewState);
        }
        return {};
      },
      apply: function (oView, oControlState, oNavParameters) {
        var oController = oView.getController();
        if (oController && oController.viewState) {
          return oController.viewState.applyViewState(oControlState, oNavParameters);
        }
      },
      refreshBinding: function (oView) {
        var oController = oView.getController();
        if (oController && oController.viewState) {
          return oController.viewState.refreshViewBindings();
        }
      }
    },
    "sap.ui.core.ComponentContainer": {
      retrieve: function (oComponentContainer) {
        var oComponent = oComponentContainer.getComponentInstance();
        if (oComponent) {
          return this.retrieveControlState(oComponent.getRootControl());
        }
        return {};
      },
      apply: function (oComponentContainer, oControlState, oNavParameters) {
        var oComponent = oComponentContainer.getComponentInstance();
        if (oComponent) {
          return this.applyControlState(oComponent.getRootControl(), oControlState, oNavParameters);
        }
      }
    }
  };
  /**
   * A controller extension offering hooks for state handling
   *
   * If you need to maintain a specific state for your application, you can use the controller extension.
   *
   * @hideconstructor
   * @public
   * @since 1.85.0
   */
  var ViewState = (_dec = defineUI5Class("sap.fe.core.controllerextensions.ViewState"), _dec2 = publicExtension(), _dec3 = finalExtension(), _dec4 = publicExtension(), _dec5 = extensible(OverrideExecution.After), _dec6 = privateExtension(), _dec7 = finalExtension(), _dec8 = privateExtension(), _dec9 = finalExtension(), _dec10 = publicExtension(), _dec11 = extensible(OverrideExecution.After), _dec12 = publicExtension(), _dec13 = extensible(OverrideExecution.After), _dec14 = publicExtension(), _dec15 = extensible(OverrideExecution.After), _dec16 = privateExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = extensible(OverrideExecution.After), _dec20 = privateExtension(), _dec21 = finalExtension(), _dec22 = publicExtension(), _dec23 = extensible(OverrideExecution.After), _dec24 = publicExtension(), _dec25 = finalExtension(), _dec26 = publicExtension(), _dec27 = finalExtension(), _dec28 = publicExtension(), _dec29 = extensible(OverrideExecution.After), _dec30 = privateExtension(), _dec31 = finalExtension(), _dec32 = publicExtension(), _dec33 = extensible(OverrideExecution.Instead), _dec34 = publicExtension(), _dec35 = finalExtension(), _dec36 = privateExtension(), _dec37 = publicExtension(), _dec38 = extensible(OverrideExecution.After), _dec39 = publicExtension(), _dec40 = extensible(OverrideExecution.After), _dec41 = publicExtension(), _dec42 = extensible(OverrideExecution.After), _dec43 = privateExtension(), _dec44 = publicExtension(), _dec45 = extensible(OverrideExecution.After), _dec46 = privateExtension(), _dec47 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(ViewState, _ControllerExtension);
    /**
     * Constructor.
     */
    function ViewState() {
      var _this;
      _this = _ControllerExtension.call(this) || this;
      _this._iRetrievingStateCounter = 0;
      _this._pInitialStateApplied = new Promise(function (resolve) {
        _this._pInitialStateAppliedResolve = resolve;
      });
      return _this;
    }
    var _proto = ViewState.prototype;
    _proto.refreshViewBindings = function refreshViewBindings() {
      try {
        var _this3 = this;
        return Promise.resolve(_this3.collectResults(_this3.base.viewState.adaptBindingRefreshControls)).then(function (aControls) {
          var oPromiseChain = Promise.resolve();
          aControls.filter(function (oControl) {
            return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
          }).forEach(function (oControl) {
            oPromiseChain = oPromiseChain.then(_this3.refreshControlBinding.bind(_this3, oControl));
          });
          return oPromiseChain;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * This function should add all controls relevant for refreshing to the provided control array.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aCollectedControls The collected controls
     * @alias sap.fe.core.controllerextensions.ViewState#adaptBindingRefreshControls
     * @protected
     */
    ;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptBindingRefreshControls = function adaptBindingRefreshControls(aCollectedControls) {
      // to be overriden
    };
    _proto.refreshControlBinding = function refreshControlBinding(oControl) {
      var oControlRefreshBindingHandler = this.getControlRefreshBindingHandler(oControl);
      var oPromiseChain = Promise.resolve();
      if (typeof oControlRefreshBindingHandler.refreshBinding !== "function") {
        Log.info("refreshBinding handler for control: ".concat(oControl.getMetadata().getName(), " is not provided"));
      } else {
        oPromiseChain = oPromiseChain.then(oControlRefreshBindingHandler.refreshBinding.bind(this, oControl));
      }
      return oPromiseChain;
    }

    /**
     * Returns a map of <code>refreshBinding</code> function for a certain control.
     *
     * @param {sap.ui.base.ManagedObject} oControl The control to get state handler for
     * @returns {object} A plain object with one function: <code>refreshBinding</code>
     */;
    _proto.getControlRefreshBindingHandler = function getControlRefreshBindingHandler(oControl) {
      var oRefreshBindingHandler = {};
      if (oControl) {
        for (var sType in _mControlStateHandlerMap) {
          if (oControl.isA(sType)) {
            // pass only the refreshBinding handler in an object so that :
            // 1. Application has access only to refreshBinding and not apply and reterive at this stage
            // 2. Application modifications to the object will be reflected here (as we pass by reference)
            oRefreshBindingHandler["refreshBinding"] = _mControlStateHandlerMap[sType].refreshBinding || {};
            break;
          }
        }
      }
      this.base.viewState.adaptBindingRefreshHandler(oControl, oRefreshBindingHandler);
      return oRefreshBindingHandler;
    }
    /**
     * Customize the <code>refreshBinding</code> function for a certain control.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oControl The control for which the refresh handler is adapted.
     * @param oControlHandler A plain object which can have one function: <code>refreshBinding</code>
     * @alias sap.fe.core.controllerextensions.ViewState#adaptBindingRefreshHandler
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptBindingRefreshHandler = function adaptBindingRefreshHandler(oControl, oControlHandler) {
      // to be overriden
    }

    /**
     * Called when the application is suspended due to keep-alive mode.
     *
     * @alias sap.fe.core.controllerextensions.ViewState#onSuspend
     * @public
     */;
    _proto.onSuspend = function onSuspend() {
      // to be overriden
    }

    /**
     * Called when the application is restored due to keep-alive mode.
     *
     * @alias sap.fe.core.controllerextensions.ViewState#onRestore
     * @public
     */;
    _proto.onRestore = function onRestore() {
      // to be overriden
    }

    /**
     * Destructor method for objects.
     */;
    _proto.destroy = function destroy() {
      delete this._pInitialStateAppliedResolve;
      _ControllerExtension.prototype.destroy.call(this);
    }

    /**
     * Helper function to enable multi override. It is adding an additional parameter (array) to the provided
     * function (and its parameters), that will be evaluated via <code>Promise.all</code>.
     *
     * @param fnCall The function to be called
     * @param args
     * @returns A promise to be resolved with the result of all overrides
     */;
    _proto.collectResults = function collectResults(fnCall) {
      var aResults = [];
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      args.push(aResults);
      fnCall.apply(this, args);
      return Promise.all(aResults);
    }

    /**
     * Customize the <code>retrieve</code> and <code>apply</code> functions for a certain control.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oControl The control to get state handler for
     * @param aControlHandler A list of plain objects with two functions: <code>retrieve</code> and <code>apply</code>
     * @alias sap.fe.core.controllerextensions.ViewState#adaptControlStateHandler
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptControlStateHandler = function adaptControlStateHandler(oControl, aControlHandler) {
      // to be overridden if needed
    }

    /**
     * Returns a map of <code>retrieve</code> and <code>apply</code> functions for a certain control.
     *
     * @param oControl The control to get state handler for
     * @returns A plain object with two functions: <code>retrieve</code> and <code>apply</code>
     */;
    _proto.getControlStateHandler = function getControlStateHandler(oControl) {
      var aInternalControlStateHandler = [],
        aCustomControlStateHandler = [];
      if (oControl) {
        for (var sType in _mControlStateHandlerMap) {
          if (oControl.isA(sType)) {
            // avoid direct manipulation of internal _mControlStateHandlerMap
            aInternalControlStateHandler.push(Object.assign({}, _mControlStateHandlerMap[sType]));
            break;
          }
        }
      }
      this.base.viewState.adaptControlStateHandler(oControl, aCustomControlStateHandler);
      return aInternalControlStateHandler.concat(aCustomControlStateHandler);
    }

    /**
     * This function should add all controls for given view that should be considered for the state handling to the provided control array.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aCollectedControls The collected controls
     * @alias sap.fe.core.controllerextensions.ViewState#adaptStateControls
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptStateControls = function adaptStateControls(aCollectedControls) {
      // to be overridden if needed
    }

    /**
     * Returns the key to be used for given control.
     *
     * @param oControl The control to get state key for
     * @returns The key to be used for storing the controls state
     */;
    _proto.getStateKey = function getStateKey(oControl) {
      return this.getView().getLocalId(oControl.getId()) || oControl.getId();
    }

    /**
     * Retrieve the view state of this extensions view.
     * When this function is called more than once before finishing, all but the final response will resolve to <code>undefined</code>.
     *
     * @returns A promise resolving the view state
     * @alias sap.fe.core.controllerextensions.ViewState#retrieveViewState
     * @public
     */;
    _proto.retrieveViewState = function retrieveViewState() {
      try {
        var _this5 = this;
        function _temp3() {
          return _this5._iRetrievingStateCounter === 0 ? oViewState : undefined;
        }
        ++_this5._iRetrievingStateCounter;
        var oViewState;
        var _temp4 = _finallyRethrows(function () {
          return Promise.resolve(_this5._pInitialStateApplied).then(function () {
            return Promise.resolve(_this5.collectResults(_this5.base.viewState.adaptStateControls)).then(function (aControls) {
              return Promise.resolve(Promise.all(aControls.filter(function (oControl) {
                return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
              }).map(function (oControl) {
                return _this5.retrieveControlState(oControl).then(function (vResult) {
                  return {
                    key: _this5.getStateKey(oControl),
                    value: vResult
                  };
                });
              }))).then(function (aResolvedStates) {
                oViewState = aResolvedStates.reduce(function (oStates, mState) {
                  var oCurrentState = {};
                  oCurrentState[mState.key] = mState.value;
                  return mergeObjects(oStates, oCurrentState);
                }, {});
                return Promise.resolve(Promise.resolve(_this5._retrieveAdditionalStates())).then(function (mAdditionalStates) {
                  if (mAdditionalStates && Object.keys(mAdditionalStates).length) {
                    oViewState[ADDITIONAL_STATES_KEY] = mAdditionalStates;
                  }
                });
              });
            });
          });
        }, function (_wasThrown, _result3) {
          --_this5._iRetrievingStateCounter;
          if (_wasThrown) throw _result3;
          return _result3;
        });
        return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Extend the map of additional states (not control bound) to be added to the current view state of the given view.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param mAdditionalStates The additional state
     * @alias sap.fe.core.controllerextensions.ViewState#retrieveAdditionalStates
     * @protected
     */
    ;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    retrieveAdditionalStates = function retrieveAdditionalStates(mAdditionalStates) {
      // to be overridden if needed
    }

    /**
     * Returns a map of additional states (not control bound) to be added to the current view state of the given view.
     *
     * @returns Additional view states
     */;
    _proto._retrieveAdditionalStates = function _retrieveAdditionalStates() {
      var mAdditionalStates = {};
      this.base.viewState.retrieveAdditionalStates(mAdditionalStates);
      return mAdditionalStates;
    }

    /**
     * Returns the current state for the given control.
     *
     * @param oControl The object to get the state for
     * @returns The state for the given control
     */;
    _proto.retrieveControlState = function retrieveControlState(oControl) {
      var _this6 = this;
      var aControlStateHandlers = this.getControlStateHandler(oControl);
      return Promise.all(aControlStateHandlers.map(function (mControlStateHandler) {
        if (typeof mControlStateHandler.retrieve !== "function") {
          throw new Error("controlStateHandler.retrieve is not a function for control: ".concat(oControl.getMetadata().getName()));
        }
        return mControlStateHandler.retrieve.call(_this6, oControl);
      })).then(function (aStates) {
        return aStates.reduce(function (oFinalState, oCurrentState) {
          return mergeObjects(oFinalState, oCurrentState);
        }, {});
      });
    }

    /**
     * Defines whether the view state should only be applied once initially.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.Instead}.
     *
     * Important:
     * You should only override this method for custom pages and not for the standard ListReportPage and ObjectPage!
     *
     * @returns If <code>true</code>, only the initial view state is applied once,
     * else any new view state is also applied on follow-up calls (default)
     * @alias sap.fe.core.controllerextensions.ViewState#applyInitialStateOnly
     * @protected
     */;
    _proto.applyInitialStateOnly = function applyInitialStateOnly() {
      return true;
    }
    /**
     * Applies the given view state to this extensions view.
     *
     * @param oViewState The view state to apply (can be undefined)
     * @param oNavParameter The current navigation parameter
     * @param oNavParameter.navigationType The actual navigation type
     * @param oNavParameter.selectionVariant The selectionVariant from the navigation
     * @param oNavParameter.selectionVariantDefaults The selectionVariant defaults from the navigation
     * @param oNavParameter.requiresStandardVariant Defines whether the standard variant must be used in variant management
     * @returns Promise for async state handling
     * @alias sap.fe.core.controllerextensions.ViewState#applyViewState
     * @public
     */;
    _proto.applyViewState = function applyViewState(oViewState, oNavParameter) {
      try {
        var _this8 = this;
        if (_this8.base.viewState.applyInitialStateOnly() && _this8._getInitialStateApplied()) {
          return Promise.resolve();
        }
        var _temp9 = _finallyRethrows(function () {
          return Promise.resolve(_this8.collectResults(_this8.base.viewState.onBeforeStateApplied)).then(function () {
            return Promise.resolve(_this8.collectResults(_this8.base.viewState.adaptStateControls)).then(function (aControls) {
              var oPromiseChain = Promise.resolve();
              aControls.filter(function (oControl) {
                return oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject");
              }).forEach(function (oControl) {
                var sKey = _this8.getStateKey(oControl);
                oPromiseChain = oPromiseChain.then(_this8.applyControlState.bind(_this8, oControl, oViewState ? oViewState[sKey] : undefined, oNavParameter));
              });
              return Promise.resolve(oPromiseChain).then(function () {
                var _temp5 = function () {
                  if (oNavParameter.navigationType === NavType.iAppState) {
                    return Promise.resolve(_this8.collectResults(_this8.base.viewState.applyAdditionalStates, oViewState ? oViewState[ADDITIONAL_STATES_KEY] : undefined)).then(function () {});
                  } else {
                    return Promise.resolve(_this8.collectResults(_this8.base.viewState.applyNavigationParameters, oNavParameter)).then(function () {
                      return Promise.resolve(_this8.collectResults(_this8.base.viewState._applyNavigationParametersToFilterbar, oNavParameter)).then(function () {});
                    });
                  }
                }();
                if (_temp5 && _temp5.then) return _temp5.then(function () {});
              });
            });
          });
        }, function (_wasThrown2, _result4) {
          function _temp7() {
            if (_wasThrown2) throw _result4;
            return _result4;
          }
          var _temp6 = _catch(function () {
            return Promise.resolve(_this8.collectResults(_this8.base.viewState.onAfterStateApplied)).then(function () {
              _this8._setInitialStateApplied();
            });
          }, function (e) {
            Log.error(e);
          });
          return _temp6 && _temp6.then ? _temp6.then(_temp7) : _temp7(_temp6);
        });
        return Promise.resolve(_temp9 && _temp9.then ? _temp9.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._checkIfVariantIdIsAvailable = function _checkIfVariantIdIsAvailable(oVM, sVariantId) {
      var aVariants = oVM.getVariants();
      var bIsControlStateVariantAvailable = false;
      aVariants.forEach(function (oVariant) {
        if (oVariant.key === sVariantId) {
          bIsControlStateVariantAvailable = true;
        }
      });
      return bIsControlStateVariantAvailable;
    };
    _proto._setInitialStateApplied = function _setInitialStateApplied() {
      if (this._pInitialStateAppliedResolve) {
        var pInitialStateAppliedResolve = this._pInitialStateAppliedResolve;
        delete this._pInitialStateAppliedResolve;
        pInitialStateAppliedResolve();
      }
    };
    _proto._getInitialStateApplied = function _getInitialStateApplied() {
      return !this._pInitialStateAppliedResolve;
    }

    /**
     * Hook to react before a state for given view is applied.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#onBeforeStateApplied
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeStateApplied = function onBeforeStateApplied(aPromises) {
      // to be overriden
    }

    /**
     * Hook to react when state for given view was applied.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#onAfterStateApplied
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onAfterStateApplied = function onAfterStateApplied(aPromises) {
      // to be overriden
    }

    /**
     * Applying additional, not control related, states - is called only if navigation type is iAppState.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oViewState The current view state
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#applyAdditionalStates
     * @protected
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    applyAdditionalStates = function applyAdditionalStates(oViewState, aPromises) {
      // to be overridden if needed
    };
    _proto._applyNavigationParametersToFilterbar = function _applyNavigationParametersToFilterbar(_oNavParameter, _aPromises) {
      // to be overridden if needed
    }

    /**
     * Apply navigation parameters is not called if the navigation type is iAppState
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oNavParameter The current navigation parameter
     * @param oNavParameter.navigationType The actual navigation type
     * @param [oNavParameter.selectionVariant] The selectionVariant from the navigation
     * @param [oNavParameter.selectionVariantDefaults] The selectionVariant defaults from the navigation
     * @param [oNavParameter.requiresStandardVariant] Defines whether the standard variant must be used in variant management
     * @param aPromises Extensible array of promises to be resolved before continuing
     * @alias sap.fe.core.controllerextensions.ViewState#applyNavigationParameters
     * @protected
     */;
    _proto.applyNavigationParameters = function applyNavigationParameters(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    oNavParameter,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    aPromises) {
      // to be overridden if needed
    }

    /**
     * Applying the given state to the given control.
     *
     * @param oControl The object to apply the given state
     * @param oControlState The state for the given control
     * @param [oNavParameters] The current navigation parameters
     * @returns Return a promise for async state handling
     */;
    _proto.applyControlState = function applyControlState(oControl, oControlState, oNavParameters) {
      var _this9 = this;
      var aControlStateHandlers = this.getControlStateHandler(oControl);
      var oPromiseChain = Promise.resolve();
      aControlStateHandlers.forEach(function (mControlStateHandler) {
        if (typeof mControlStateHandler.apply !== "function") {
          throw new Error("controlStateHandler.apply is not a function for control: ".concat(oControl.getMetadata().getName()));
        }
        oPromiseChain = oPromiseChain.then(mControlStateHandler.apply.bind(_this9, oControl, oControlState, oNavParameters));
      });
      return oPromiseChain;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return ViewState;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "refreshViewBindings", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "refreshViewBindings"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptBindingRefreshControls", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptBindingRefreshControls"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "refreshControlBinding", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "refreshControlBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getControlRefreshBindingHandler", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "getControlRefreshBindingHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptBindingRefreshHandler", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptBindingRefreshHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onSuspend", [_dec12, _dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "onSuspend"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onRestore", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "onRestore"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "collectResults", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "collectResults"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptControlStateHandler", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptControlStateHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getControlStateHandler", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "getControlStateHandler"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptStateControls", [_dec22, _dec23], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptStateControls"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getStateKey", [_dec24, _dec25], Object.getOwnPropertyDescriptor(_class2.prototype, "getStateKey"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "retrieveViewState", [_dec26, _dec27], Object.getOwnPropertyDescriptor(_class2.prototype, "retrieveViewState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "retrieveAdditionalStates", [_dec28, _dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "retrieveAdditionalStates"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "retrieveControlState", [_dec30, _dec31], Object.getOwnPropertyDescriptor(_class2.prototype, "retrieveControlState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyInitialStateOnly", [_dec32, _dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "applyInitialStateOnly"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyViewState", [_dec34, _dec35], Object.getOwnPropertyDescriptor(_class2.prototype, "applyViewState"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_checkIfVariantIdIsAvailable", [_dec36], Object.getOwnPropertyDescriptor(_class2.prototype, "_checkIfVariantIdIsAvailable"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeStateApplied", [_dec37, _dec38], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeStateApplied"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterStateApplied", [_dec39, _dec40], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterStateApplied"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyAdditionalStates", [_dec41, _dec42], Object.getOwnPropertyDescriptor(_class2.prototype, "applyAdditionalStates"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "_applyNavigationParametersToFilterbar", [_dec43], Object.getOwnPropertyDescriptor(_class2.prototype, "_applyNavigationParametersToFilterbar"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyNavigationParameters", [_dec44, _dec45], Object.getOwnPropertyDescriptor(_class2.prototype, "applyNavigationParameters"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "applyControlState", [_dec46, _dec47], Object.getOwnPropertyDescriptor(_class2.prototype, "applyControlState"), _class2.prototype)), _class2)) || _class);
  return ViewState;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwiZmluYWxpemVyIiwicmVzdWx0IiwiZSIsInRoZW4iLCJiaW5kIiwicmVjb3ZlciIsIkFERElUSU9OQUxfU1RBVEVTX0tFWSIsIk5hdlR5cGUiLCJOYXZMaWJyYXJ5IiwiX21Db250cm9sU3RhdGVIYW5kbGVyTWFwIiwicmV0cmlldmUiLCJvVk0iLCJnZXRDdXJyZW50VmFyaWFudEtleSIsImFwcGx5Iiwib0NvbnRyb2xTdGF0ZSIsInZhcmlhbnRJZCIsInVuZGVmaW5lZCIsInNWYXJpYW50UmVmZXJlbmNlIiwiX2NoZWNrSWZWYXJpYW50SWRJc0F2YWlsYWJsZSIsImdldFN0YW5kYXJkVmFyaWFudEtleSIsIkNvbnRyb2xWYXJpYW50QXBwbHlBUEkiLCJhY3RpdmF0ZVZhcmlhbnQiLCJlbGVtZW50IiwidmFyaWFudFJlZmVyZW5jZSIsIm9UYWJCYXIiLCJzZWxlY3RlZEtleSIsImdldFNlbGVjdGVkS2V5Iiwib1NlbGVjdGVkSXRlbSIsImdldEl0ZW1zIiwiZmluZCIsIm9JdGVtIiwiZ2V0S2V5Iiwic2V0U2VsZWN0ZWRJdGVtIiwib0ZpbHRlckJhciIsIlN0YXRlVXRpbCIsInJldHJpZXZlRXh0ZXJuYWxTdGF0ZSIsIm1GaWx0ZXJCYXJTdGF0ZSIsImFQcm9wZXJ0aWVzSW5mbyIsImdldFByb3BlcnR5SW5mb1NldCIsIm1GaWx0ZXIiLCJmaWx0ZXIiLCJvUHJvcGVydHlJbmZvIiwicGF0aCIsInJlbW92ZUZyb21BcHBTdGF0ZSIsImxlbmd0aCIsImZvckVhY2giLCJvU3RhdGUiLCJPYmplY3QiLCJrZXlzIiwic0tleSIsImkiLCJwcm9wZXJ0eUluZm8iLCJvQ29uZGl0aW9uIiwiZmlsdGVyZWQiLCJhcHBseUV4dGVybmFsU3RhdGUiLCJMb2ciLCJlcnJvciIsIm9UYWJsZSIsInN1cHBsZW1lbnRhcnlDb25maWciLCJyZWZyZXNoQmluZGluZyIsIm9UYWJsZUJpbmRpbmciLCJnZXRSb3dCaW5kaW5nIiwib1Jvb3RCaW5kaW5nIiwiZ2V0Um9vdEJpbmRpbmciLCJyZWZyZXNoIiwib0hlYWRlckNvbnRleHQiLCJnZXRIZWFkZXJDb250ZXh0Iiwic0dyb3VwSWQiLCJnZXRHcm91cElkIiwicmVxdWVzdFNpZGVFZmZlY3RzIiwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJpbmZvIiwiZ2V0SWQiLCJvQ2hhcnQiLCJvT1BMYXlvdXQiLCJzZWxlY3RlZFNlY3Rpb24iLCJnZXRTZWxlY3RlZFNlY3Rpb24iLCJzZXRTZWxlY3RlZFNlY3Rpb24iLCJvQmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIm9CaW5kaW5nIiwiZ2V0QmluZGluZyIsInNNZXRhUGF0aCIsIk1vZGVsSGVscGVyIiwiZ2V0TWV0YVBhdGhGb3JDb250ZXh0Iiwic1N0cmF0ZWd5IiwiS2VlcEFsaXZlSGVscGVyIiwiZ2V0Q29udHJvbFJlZnJlc2hTdHJhdGVneUZvckNvbnRleHRQYXRoIiwib01vZGVsIiwiZ2V0TW9kZWwiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwib05hdmlnYXRpb25Qcm9wZXJ0aWVzIiwiQ29tbW9uVXRpbHMiLCJnZXRDb250ZXh0UGF0aFByb3BlcnRpZXMiLCIka2luZCIsImFOYXZQcm9wZXJ0aWVzVG9SZXF1ZXN0IiwicmVkdWNlIiwiYVByZXYiLCJzTmF2UHJvcCIsIiRpc0NvbGxlY3Rpb24iLCJwdXNoIiwiYVByb3BlcnRpZXMiLCIkUHJvcGVydHlQYXRoIiwiY29uY2F0Iiwib1F1aWNrRmlsdGVyIiwiZ2V0U2VsZWN0b3JLZXkiLCJzZXRTZWxlY3RvcktleSIsIm9TZWdtZW50ZWRCdXR0b24iLCJzZXRTZWxlY3RlZEtleSIsIm9TZWxlY3QiLCJvRHluYW1pY1BhZ2UiLCJoZWFkZXJFeHBhbmRlZCIsImdldEhlYWRlckV4cGFuZGVkIiwic2V0SGVhZGVyRXhwYW5kZWQiLCJvVmlldyIsIm9Db250cm9sbGVyIiwiZ2V0Q29udHJvbGxlciIsInZpZXdTdGF0ZSIsInJldHJpZXZlVmlld1N0YXRlIiwib05hdlBhcmFtZXRlcnMiLCJhcHBseVZpZXdTdGF0ZSIsInJlZnJlc2hWaWV3QmluZGluZ3MiLCJvQ29tcG9uZW50Q29udGFpbmVyIiwib0NvbXBvbmVudCIsImdldENvbXBvbmVudEluc3RhbmNlIiwicmV0cmlldmVDb250cm9sU3RhdGUiLCJnZXRSb290Q29udHJvbCIsImFwcGx5Q29udHJvbFN0YXRlIiwiVmlld1N0YXRlIiwiZGVmaW5lVUk1Q2xhc3MiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwicHJpdmF0ZUV4dGVuc2lvbiIsIkluc3RlYWQiLCJfaVJldHJpZXZpbmdTdGF0ZUNvdW50ZXIiLCJfcEluaXRpYWxTdGF0ZUFwcGxpZWQiLCJQcm9taXNlIiwicmVzb2x2ZSIsIl9wSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmUiLCJjb2xsZWN0UmVzdWx0cyIsImJhc2UiLCJhZGFwdEJpbmRpbmdSZWZyZXNoQ29udHJvbHMiLCJhQ29udHJvbHMiLCJvUHJvbWlzZUNoYWluIiwib0NvbnRyb2wiLCJpc0EiLCJyZWZyZXNoQ29udHJvbEJpbmRpbmciLCJhQ29sbGVjdGVkQ29udHJvbHMiLCJvQ29udHJvbFJlZnJlc2hCaW5kaW5nSGFuZGxlciIsImdldENvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIiLCJnZXRNZXRhZGF0YSIsImdldE5hbWUiLCJvUmVmcmVzaEJpbmRpbmdIYW5kbGVyIiwic1R5cGUiLCJhZGFwdEJpbmRpbmdSZWZyZXNoSGFuZGxlciIsIm9Db250cm9sSGFuZGxlciIsIm9uU3VzcGVuZCIsIm9uUmVzdG9yZSIsImRlc3Ryb3kiLCJmbkNhbGwiLCJhUmVzdWx0cyIsImFyZ3MiLCJhbGwiLCJhZGFwdENvbnRyb2xTdGF0ZUhhbmRsZXIiLCJhQ29udHJvbEhhbmRsZXIiLCJnZXRDb250cm9sU3RhdGVIYW5kbGVyIiwiYUludGVybmFsQ29udHJvbFN0YXRlSGFuZGxlciIsImFDdXN0b21Db250cm9sU3RhdGVIYW5kbGVyIiwiYXNzaWduIiwiYWRhcHRTdGF0ZUNvbnRyb2xzIiwiZ2V0U3RhdGVLZXkiLCJnZXRWaWV3IiwiZ2V0TG9jYWxJZCIsIm9WaWV3U3RhdGUiLCJtYXAiLCJ2UmVzdWx0Iiwia2V5IiwidmFsdWUiLCJhUmVzb2x2ZWRTdGF0ZXMiLCJvU3RhdGVzIiwibVN0YXRlIiwib0N1cnJlbnRTdGF0ZSIsIm1lcmdlT2JqZWN0cyIsIl9yZXRyaWV2ZUFkZGl0aW9uYWxTdGF0ZXMiLCJtQWRkaXRpb25hbFN0YXRlcyIsInJldHJpZXZlQWRkaXRpb25hbFN0YXRlcyIsImFDb250cm9sU3RhdGVIYW5kbGVycyIsIm1Db250cm9sU3RhdGVIYW5kbGVyIiwiRXJyb3IiLCJjYWxsIiwiYVN0YXRlcyIsIm9GaW5hbFN0YXRlIiwiYXBwbHlJbml0aWFsU3RhdGVPbmx5Iiwib05hdlBhcmFtZXRlciIsIl9nZXRJbml0aWFsU3RhdGVBcHBsaWVkIiwib25CZWZvcmVTdGF0ZUFwcGxpZWQiLCJuYXZpZ2F0aW9uVHlwZSIsImlBcHBTdGF0ZSIsImFwcGx5QWRkaXRpb25hbFN0YXRlcyIsImFwcGx5TmF2aWdhdGlvblBhcmFtZXRlcnMiLCJfYXBwbHlOYXZpZ2F0aW9uUGFyYW1ldGVyc1RvRmlsdGVyYmFyIiwib25BZnRlclN0YXRlQXBwbGllZCIsIl9zZXRJbml0aWFsU3RhdGVBcHBsaWVkIiwic1ZhcmlhbnRJZCIsImFWYXJpYW50cyIsImdldFZhcmlhbnRzIiwiYklzQ29udHJvbFN0YXRlVmFyaWFudEF2YWlsYWJsZSIsIm9WYXJpYW50IiwicEluaXRpYWxTdGF0ZUFwcGxpZWRSZXNvbHZlIiwiYVByb21pc2VzIiwiX29OYXZQYXJhbWV0ZXIiLCJfYVByb21pc2VzIiwiZ2V0SW50ZXJmYWNlIiwiQ29udHJvbGxlckV4dGVuc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmlld1N0YXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IG1lcmdlT2JqZWN0cyBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIGV4dGVuc2libGUsIGZpbmFsRXh0ZW5zaW9uLCBwcml2YXRlRXh0ZW5zaW9uLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBLZWVwQWxpdmVIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvS2VlcEFsaXZlSGVscGVyXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IE5hdkxpYnJhcnkgZnJvbSBcInNhcC9mZS9uYXZpZ2F0aW9uL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBDb250cm9sbGVyRXh0ZW5zaW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlckV4dGVuc2lvblwiO1xuaW1wb3J0IE92ZXJyaWRlRXhlY3V0aW9uIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvT3ZlcnJpZGVFeGVjdXRpb25cIjtcbmltcG9ydCBDb250cm9sVmFyaWFudEFwcGx5QVBJIGZyb20gXCJzYXAvdWkvZmwvYXBwbHkvYXBpL0NvbnRyb2xWYXJpYW50QXBwbHlBUElcIjtcbmltcG9ydCB7IENvbmRpdGlvbk9iamVjdCB9IGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCBTdGF0ZVV0aWwgZnJvbSBcInNhcC91aS9tZGMvcDEzbi9TdGF0ZVV0aWxcIjtcbi8vIGFkZGl0aW9uYWxTdGF0ZXMgYXJlIHN0b3JlZCBuZXh0IHRvIGNvbnRyb2wgSURzLCBzbyBuYW1lIGNsYXNoIGF2b2lkYW5jZSBuZWVkZWQuIEZvcnR1bmF0ZWx5IElEcyBoYXZlIHJlc3RyaWN0aW9uczpcbi8vIFwiQWxsb3dlZCBpcyBhIHNlcXVlbmNlIG9mIGNoYXJhY3RlcnMgKGNhcGl0YWwvbG93ZXJjYXNlKSwgZGlnaXRzLCB1bmRlcnNjb3JlcywgZGFzaGVzLCBwb2ludHMgYW5kL29yIGNvbG9ucy5cIlxuLy8gVGhlcmVmb3JlIGFkZGluZyBhIHN5bWJvbCBsaWtlICMgb3IgQFxuY29uc3QgQURESVRJT05BTF9TVEFURVNfS0VZID0gXCIjYWRkaXRpb25hbFN0YXRlc1wiLFxuXHROYXZUeXBlID0gTmF2TGlicmFyeS5OYXZUeXBlO1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gbWV0aG9kcyB0byByZXRyaWV2ZSAmIGFwcGx5IHN0YXRlcyBmb3IgdGhlIGRpZmZlcmVudCBjb250cm9scyAvL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuY29uc3QgX21Db250cm9sU3RhdGVIYW5kbGVyTWFwOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge1xuXHRcInNhcC51aS5mbC52YXJpYW50cy5WYXJpYW50TWFuYWdlbWVudFwiOiB7XG5cdFx0cmV0cmlldmU6IGZ1bmN0aW9uIChvVk06IGFueSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XCJ2YXJpYW50SWRcIjogb1ZNLmdldEN1cnJlbnRWYXJpYW50S2V5KClcblx0XHRcdH07XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9WTTogYW55LCBvQ29udHJvbFN0YXRlOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udHJvbFN0YXRlICYmIG9Db250cm9sU3RhdGUudmFyaWFudElkICE9PSB1bmRlZmluZWQgJiYgb0NvbnRyb2xTdGF0ZS52YXJpYW50SWQgIT09IG9WTS5nZXRDdXJyZW50VmFyaWFudEtleSgpKSB7XG5cdFx0XHRcdGNvbnN0IHNWYXJpYW50UmVmZXJlbmNlID0gdGhpcy5fY2hlY2tJZlZhcmlhbnRJZElzQXZhaWxhYmxlKG9WTSwgb0NvbnRyb2xTdGF0ZS52YXJpYW50SWQpXG5cdFx0XHRcdFx0PyBvQ29udHJvbFN0YXRlLnZhcmlhbnRJZFxuXHRcdFx0XHRcdDogb1ZNLmdldFN0YW5kYXJkVmFyaWFudEtleSgpO1xuXHRcdFx0XHRyZXR1cm4gQ29udHJvbFZhcmlhbnRBcHBseUFQSS5hY3RpdmF0ZVZhcmlhbnQoe1xuXHRcdFx0XHRcdGVsZW1lbnQ6IG9WTSxcblx0XHRcdFx0XHR2YXJpYW50UmVmZXJlbmNlOiBzVmFyaWFudFJlZmVyZW5jZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFwic2FwLm0uSWNvblRhYkJhclwiOiB7XG5cdFx0cmV0cmlldmU6IGZ1bmN0aW9uIChvVGFiQmFyOiBhbnkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHNlbGVjdGVkS2V5OiBvVGFiQmFyLmdldFNlbGVjdGVkS2V5KClcblx0XHRcdH07XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9UYWJCYXI6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55KSB7XG5cdFx0XHRpZiAob0NvbnRyb2xTdGF0ZSAmJiBvQ29udHJvbFN0YXRlLnNlbGVjdGVkS2V5KSB7XG5cdFx0XHRcdGNvbnN0IG9TZWxlY3RlZEl0ZW0gPSBvVGFiQmFyLmdldEl0ZW1zKCkuZmluZChmdW5jdGlvbiAob0l0ZW06IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBvSXRlbS5nZXRLZXkoKSA9PT0gb0NvbnRyb2xTdGF0ZS5zZWxlY3RlZEtleTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChvU2VsZWN0ZWRJdGVtKSB7XG5cdFx0XHRcdFx0b1RhYkJhci5zZXRTZWxlY3RlZEl0ZW0ob1NlbGVjdGVkSXRlbSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFwic2FwLnVpLm1kYy5GaWx0ZXJCYXJcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob0ZpbHRlckJhcjogYW55KSB7XG5cdFx0XHRyZXR1cm4gU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShvRmlsdGVyQmFyKS50aGVuKGZ1bmN0aW9uIChtRmlsdGVyQmFyU3RhdGU6IGFueSkge1xuXHRcdFx0XHQvLyByZW1vdmUgc2Vuc2l0aXZlIG9yIHZpZXcgc3RhdGUgaXJyZWxldmFudCBmaWVsZHNcblx0XHRcdFx0Y29uc3QgYVByb3BlcnRpZXNJbmZvID0gb0ZpbHRlckJhci5nZXRQcm9wZXJ0eUluZm9TZXQoKSxcblx0XHRcdFx0XHRtRmlsdGVyID0gbUZpbHRlckJhclN0YXRlLmZpbHRlciB8fCB7fTtcblx0XHRcdFx0YVByb3BlcnRpZXNJbmZvXG5cdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAob1Byb3BlcnR5SW5mbzogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0XHRtRmlsdGVyW29Qcm9wZXJ0eUluZm8ucGF0aF0gJiYgKG9Qcm9wZXJ0eUluZm8ucmVtb3ZlRnJvbUFwcFN0YXRlIHx8IG1GaWx0ZXJbb1Byb3BlcnR5SW5mby5wYXRoXS5sZW5ndGggPT09IDApXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0LmZvckVhY2goZnVuY3Rpb24gKG9Qcm9wZXJ0eUluZm86IGFueSkge1xuXHRcdFx0XHRcdFx0ZGVsZXRlIG1GaWx0ZXJbb1Byb3BlcnR5SW5mby5wYXRoXTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIG1GaWx0ZXJCYXJTdGF0ZTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cdFx0YXBwbHk6IGFzeW5jIGZ1bmN0aW9uIChvRmlsdGVyQmFyOiBhbnksIG9Db250cm9sU3RhdGU6IGFueSkge1xuXHRcdFx0aWYgKG9Db250cm9sU3RhdGUpIHtcblx0XHRcdFx0Ly8gV2hlbiB3ZSBoYXZlIGEgc2luZ2xlIHZhbHVlZCBmaWx0ZXJmaWVsZCB0aGVuIGl0IGlzIEZFIHJlc3BvbnNpYmlsaXR5IHRvIGNsZWFyIHRoZSBkZWZhdWx0IGNvbmRpdGlvbnMgYW5kIGFwcGx5IHRoZSBzdGF0ZVxuXHRcdFx0XHRjb25zdCBhUHJvcGVydGllc0luZm8gPSBvRmlsdGVyQmFyLmdldFByb3BlcnR5SW5mb1NldCgpO1xuXHRcdFx0XHQvL2ZldGNoaW5nIGRlZmF1bHQgY29uZGl0aW9uc1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdGNvbnN0IG9TdGF0ZSA9IGF3YWl0IFN0YXRlVXRpbC5yZXRyaWV2ZUV4dGVybmFsU3RhdGUob0ZpbHRlckJhcik7XG5cdFx0XHRcdFx0T2JqZWN0LmtleXMob1N0YXRlLmZpbHRlcikuZm9yRWFjaChmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFQcm9wZXJ0aWVzSW5mby5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBwcm9wZXJ0eUluZm8gPSBhUHJvcGVydGllc0luZm9baV07XG5cdFx0XHRcdFx0XHRcdC8vY2xlYXIgdGhlIGNvbmRpdGlvbnMgb25seSBpZiBpdCBpcyBzaW5nbGUgdmFsdWVkIGZpZWxkXG5cdFx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0XHRzS2V5ICE9PSBcIiRlZGl0U3RhdGVcIiAmJlxuXHRcdFx0XHRcdFx0XHRcdHNLZXkgIT09IFwiJHNlYXJjaFwiICYmXG5cdFx0XHRcdFx0XHRcdFx0cHJvcGVydHlJbmZvW1wia2V5XCJdID09PSBzS2V5ICYmXG5cdFx0XHRcdFx0XHRcdFx0cHJvcGVydHlJbmZvW1wibWF4Q29uZGl0aW9uc1wiXSA8PSAxXG5cdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdG9TdGF0ZS5maWx0ZXJbc0tleV0uZm9yRWFjaChmdW5jdGlvbiAob0NvbmRpdGlvbjogQ29uZGl0aW9uT2JqZWN0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvQ29uZGl0aW9uLmZpbHRlcmVkID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gbWVyZ2UgdGhlIGNsZWFyZWQgY29uZGl0aW9ucyB3aXRoIHRoZSBhcHN0YXRlIGNvbmRpdGlvbnNcblx0XHRcdFx0XHRcdFx0XHRpZiAob0NvbnRyb2xTdGF0ZS5maWx0ZXJbc0tleV0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9Db250cm9sU3RhdGUuZmlsdGVyW3NLZXldID0gWy4uLm9Db250cm9sU3RhdGUuZmlsdGVyW3NLZXldLCAuLi5vU3RhdGUuZmlsdGVyW3NLZXldXTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0b0NvbnRyb2xTdGF0ZS5maWx0ZXJbc0tleV0gPSBvU3RhdGUuZmlsdGVyW3NLZXldIHx8IFtdO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHJldHVybiBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKG9GaWx0ZXJCYXIsIG9Db250cm9sU3RhdGUpO1xuXHRcdFx0XHR9IGNhdGNoIChlOiBhbnkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJGaWx0ZXJiYXIgYXBwbHkgZmFpbGVkIGJlY2F1c2Ugb2YgU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZTogXCIgKyBlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAudWkubWRjLlRhYmxlXCI6IHtcblx0XHRyZXRyaWV2ZTogZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRyZXR1cm4gU3RhdGVVdGlsLnJldHJpZXZlRXh0ZXJuYWxTdGF0ZShvVGFibGUpO1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvVGFibGU6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55KSB7XG5cdFx0XHRpZiAob0NvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRpZiAoIW9Db250cm9sU3RhdGUuc3VwcGxlbWVudGFyeUNvbmZpZykge1xuXHRcdFx0XHRcdG9Db250cm9sU3RhdGUuc3VwcGxlbWVudGFyeUNvbmZpZyA9IHt9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKG9UYWJsZSwgb0NvbnRyb2xTdGF0ZSk7XG5cdFx0XHR9XG5cdFx0fSxcblx0XHRyZWZyZXNoQmluZGluZzogZnVuY3Rpb24gKG9UYWJsZTogYW55KSB7XG5cdFx0XHRjb25zdCBvVGFibGVCaW5kaW5nID0gb1RhYmxlLmdldFJvd0JpbmRpbmcoKTtcblx0XHRcdGlmIChvVGFibGVCaW5kaW5nKSB7XG5cdFx0XHRcdGNvbnN0IG9Sb290QmluZGluZyA9IG9UYWJsZUJpbmRpbmcuZ2V0Um9vdEJpbmRpbmcoKTtcblx0XHRcdFx0aWYgKG9Sb290QmluZGluZyA9PT0gb1RhYmxlQmluZGluZykge1xuXHRcdFx0XHRcdC8vIGFic29sdXRlIGJpbmRpbmdcblx0XHRcdFx0XHRvVGFibGVCaW5kaW5nLnJlZnJlc2goKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyByZWxhdGl2ZSBiaW5kaW5nXG5cdFx0XHRcdFx0Y29uc3Qgb0hlYWRlckNvbnRleHQgPSBvVGFibGVCaW5kaW5nLmdldEhlYWRlckNvbnRleHQoKTtcblx0XHRcdFx0XHRjb25zdCBzR3JvdXBJZCA9IG9UYWJsZUJpbmRpbmcuZ2V0R3JvdXBJZCgpO1xuXG5cdFx0XHRcdFx0aWYgKG9IZWFkZXJDb250ZXh0KSB7XG5cdFx0XHRcdFx0XHRvSGVhZGVyQ29udGV4dC5yZXF1ZXN0U2lkZUVmZmVjdHMoW3sgJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IFwiXCIgfV0sIHNHcm91cElkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdExvZy5pbmZvKGBUYWJsZTogJHtvVGFibGUuZ2V0SWQoKX0gd2FzIG5vdCByZWZyZXNoZWQuIE5vIGJpbmRpbmcgZm91bmQhYCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC51aS5tZGMuQ2hhcnRcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob0NoYXJ0OiBhbnkpIHtcblx0XHRcdHJldHVybiBTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKG9DaGFydCk7XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9DaGFydDogYW55LCBvQ29udHJvbFN0YXRlOiBhbnkpIHtcblx0XHRcdGlmIChvQ29udHJvbFN0YXRlKSB7XG5cdFx0XHRcdHJldHVybiBTdGF0ZVV0aWwuYXBwbHlFeHRlcm5hbFN0YXRlKG9DaGFydCwgb0NvbnRyb2xTdGF0ZSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC51eGFwLk9iamVjdFBhZ2VMYXlvdXRcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob09QTGF5b3V0OiBhbnkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHNlbGVjdGVkU2VjdGlvbjogb09QTGF5b3V0LmdldFNlbGVjdGVkU2VjdGlvbigpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvT1BMYXlvdXQ6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55KSB7XG5cdFx0XHRpZiAob0NvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRvT1BMYXlvdXQuc2V0U2VsZWN0ZWRTZWN0aW9uKG9Db250cm9sU3RhdGUuc2VsZWN0ZWRTZWN0aW9uKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHJlZnJlc2hCaW5kaW5nOiBmdW5jdGlvbiAob09QTGF5b3V0OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IG9PUExheW91dC5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0Y29uc3Qgb0JpbmRpbmcgPSBvQmluZGluZ0NvbnRleHQgJiYgb0JpbmRpbmdDb250ZXh0LmdldEJpbmRpbmcoKTtcblx0XHRcdGlmIChvQmluZGluZykge1xuXHRcdFx0XHRjb25zdCBzTWV0YVBhdGggPSBNb2RlbEhlbHBlci5nZXRNZXRhUGF0aEZvckNvbnRleHQob0JpbmRpbmdDb250ZXh0KTtcblx0XHRcdFx0Y29uc3Qgc1N0cmF0ZWd5ID0gS2VlcEFsaXZlSGVscGVyLmdldENvbnRyb2xSZWZyZXNoU3RyYXRlZ3lGb3JDb250ZXh0UGF0aChvT1BMYXlvdXQsIHNNZXRhUGF0aCk7XG5cdFx0XHRcdGlmIChzU3RyYXRlZ3kgPT09IFwic2VsZlwiKSB7XG5cdFx0XHRcdFx0Ly8gUmVmcmVzaCBtYWluIGNvbnRleHQgYW5kIDEtMSBuYXZpZ2F0aW9uIHByb3BlcnRpZXMgb3IgT1Bcblx0XHRcdFx0XHRjb25zdCBvTW9kZWwgPSBvQmluZGluZ0NvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRcdFx0XHRvTmF2aWdhdGlvblByb3BlcnRpZXMgPVxuXHRcdFx0XHRcdFx0XHRDb21tb25VdGlscy5nZXRDb250ZXh0UGF0aFByb3BlcnRpZXMob01ldGFNb2RlbCwgc01ldGFQYXRoLCB7XG5cdFx0XHRcdFx0XHRcdFx0JGtpbmQ6IFwiTmF2aWdhdGlvblByb3BlcnR5XCJcblx0XHRcdFx0XHRcdFx0fSkgfHwge30sXG5cdFx0XHRcdFx0XHRhTmF2UHJvcGVydGllc1RvUmVxdWVzdCA9IE9iamVjdC5rZXlzKG9OYXZpZ2F0aW9uUHJvcGVydGllcykucmVkdWNlKGZ1bmN0aW9uIChhUHJldjogYW55W10sIHNOYXZQcm9wOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRcdFx0aWYgKG9OYXZpZ2F0aW9uUHJvcGVydGllc1tzTmF2UHJvcF0uJGlzQ29sbGVjdGlvbiAhPT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0XHRcdGFQcmV2LnB1c2goeyAkTmF2aWdhdGlvblByb3BlcnR5UGF0aDogc05hdlByb3AgfSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIGFQcmV2O1xuXHRcdFx0XHRcdFx0fSwgW10pLFxuXHRcdFx0XHRcdFx0YVByb3BlcnRpZXMgPSBbeyAkUHJvcGVydHlQYXRoOiBcIipcIiB9XSxcblx0XHRcdFx0XHRcdHNHcm91cElkID0gb0JpbmRpbmcuZ2V0R3JvdXBJZCgpO1xuXG5cdFx0XHRcdFx0b0JpbmRpbmdDb250ZXh0LnJlcXVlc3RTaWRlRWZmZWN0cyhhUHJvcGVydGllcy5jb25jYXQoYU5hdlByb3BlcnRpZXNUb1JlcXVlc3QpLCBzR3JvdXBJZCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc1N0cmF0ZWd5ID09PSBcImluY2x1ZGluZ0RlcGVuZGVudHNcIikge1xuXHRcdFx0XHRcdC8vIENvbXBsZXRlIHJlZnJlc2hcblx0XHRcdFx0XHRvQmluZGluZy5yZWZyZXNoKCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdExvZy5pbmZvKGBPYmplY3RQYWdlOiAke29PUExheW91dC5nZXRJZCgpfSB3YXMgbm90IHJlZnJlc2hlZC4gTm8gYmluZGluZyBmb3VuZCFgKTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFwic2FwLmZlLm1hY3Jvcy50YWJsZS5RdWlja0ZpbHRlckNvbnRhaW5lclwiOiB7XG5cdFx0cmV0cmlldmU6IGZ1bmN0aW9uIChvUXVpY2tGaWx0ZXI6IGFueSkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c2VsZWN0ZWRLZXk6IG9RdWlja0ZpbHRlci5nZXRTZWxlY3RvcktleSgpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvUXVpY2tGaWx0ZXI6IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55KSB7XG5cdFx0XHRpZiAob0NvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRvUXVpY2tGaWx0ZXIuc2V0U2VsZWN0b3JLZXkob0NvbnRyb2xTdGF0ZS5zZWxlY3RlZEtleSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRcInNhcC5tLlNlZ21lbnRlZEJ1dHRvblwiOiB7XG5cdFx0cmV0cmlldmU6IGZ1bmN0aW9uIChvU2VnbWVudGVkQnV0dG9uOiBhbnkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHNlbGVjdGVkS2V5OiBvU2VnbWVudGVkQnV0dG9uLmdldFNlbGVjdGVkS2V5KClcblx0XHRcdH07XG5cdFx0fSxcblx0XHRhcHBseTogZnVuY3Rpb24gKG9TZWdtZW50ZWRCdXR0b246IGFueSwgb0NvbnRyb2xTdGF0ZTogYW55KSB7XG5cdFx0XHRpZiAob0NvbnRyb2xTdGF0ZSkge1xuXHRcdFx0XHRvU2VnbWVudGVkQnV0dG9uLnNldFNlbGVjdGVkS2V5KG9Db250cm9sU3RhdGUuc2VsZWN0ZWRLZXkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAubS5TZWxlY3RcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob1NlbGVjdDogYW55KSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRzZWxlY3RlZEtleTogb1NlbGVjdC5nZXRTZWxlY3RlZEtleSgpXG5cdFx0XHR9O1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvU2VsZWN0OiBhbnksIG9Db250cm9sU3RhdGU6IGFueSkge1xuXHRcdFx0aWYgKG9Db250cm9sU3RhdGUpIHtcblx0XHRcdFx0b1NlbGVjdC5zZXRTZWxlY3RlZEtleShvQ29udHJvbFN0YXRlLnNlbGVjdGVkS2V5KTtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdFwic2FwLmYuRHluYW1pY1BhZ2VcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob0R5bmFtaWNQYWdlOiBhbnkpIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdGhlYWRlckV4cGFuZGVkOiBvRHluYW1pY1BhZ2UuZ2V0SGVhZGVyRXhwYW5kZWQoKVxuXHRcdFx0fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBmdW5jdGlvbiAob0R5bmFtaWNQYWdlOiBhbnksIG9Db250cm9sU3RhdGU6IGFueSkge1xuXHRcdFx0aWYgKG9Db250cm9sU3RhdGUpIHtcblx0XHRcdFx0b0R5bmFtaWNQYWdlLnNldEhlYWRlckV4cGFuZGVkKG9Db250cm9sU3RhdGUuaGVhZGVyRXhwYW5kZWQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAudWkuY29yZS5tdmMuVmlld1wiOiB7XG5cdFx0cmV0cmlldmU6IGZ1bmN0aW9uIChvVmlldzogYW55KSB7XG5cdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKTtcblx0XHRcdGlmIChvQ29udHJvbGxlciAmJiBvQ29udHJvbGxlci52aWV3U3RhdGUpIHtcblx0XHRcdFx0cmV0dXJuIG9Db250cm9sbGVyLnZpZXdTdGF0ZS5yZXRyaWV2ZVZpZXdTdGF0ZShvQ29udHJvbGxlci52aWV3U3RhdGUpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHt9O1xuXHRcdH0sXG5cdFx0YXBwbHk6IGZ1bmN0aW9uIChvVmlldzogYW55LCBvQ29udHJvbFN0YXRlOiBhbnksIG9OYXZQYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpO1xuXHRcdFx0aWYgKG9Db250cm9sbGVyICYmIG9Db250cm9sbGVyLnZpZXdTdGF0ZSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRyb2xsZXIudmlld1N0YXRlLmFwcGx5Vmlld1N0YXRlKG9Db250cm9sU3RhdGUsIG9OYXZQYXJhbWV0ZXJzKTtcblx0XHRcdH1cblx0XHR9LFxuXHRcdHJlZnJlc2hCaW5kaW5nOiBmdW5jdGlvbiAob1ZpZXc6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xsZXIgPSBvVmlldy5nZXRDb250cm9sbGVyKCk7XG5cdFx0XHRpZiAob0NvbnRyb2xsZXIgJiYgb0NvbnRyb2xsZXIudmlld1N0YXRlKSB7XG5cdFx0XHRcdHJldHVybiBvQ29udHJvbGxlci52aWV3U3RhdGUucmVmcmVzaFZpZXdCaW5kaW5ncygpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0XCJzYXAudWkuY29yZS5Db21wb25lbnRDb250YWluZXJcIjoge1xuXHRcdHJldHJpZXZlOiBmdW5jdGlvbiAob0NvbXBvbmVudENvbnRhaW5lcjogYW55KSB7XG5cdFx0XHRjb25zdCBvQ29tcG9uZW50ID0gb0NvbXBvbmVudENvbnRhaW5lci5nZXRDb21wb25lbnRJbnN0YW5jZSgpO1xuXHRcdFx0aWYgKG9Db21wb25lbnQpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMucmV0cmlldmVDb250cm9sU3RhdGUob0NvbXBvbmVudC5nZXRSb290Q29udHJvbCgpKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB7fTtcblx0XHR9LFxuXHRcdGFwcGx5OiBmdW5jdGlvbiAob0NvbXBvbmVudENvbnRhaW5lcjogYW55LCBvQ29udHJvbFN0YXRlOiBhbnksIG9OYXZQYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Db21wb25lbnQgPSBvQ29tcG9uZW50Q29udGFpbmVyLmdldENvbXBvbmVudEluc3RhbmNlKCk7XG5cdFx0XHRpZiAob0NvbXBvbmVudCkge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5hcHBseUNvbnRyb2xTdGF0ZShvQ29tcG9uZW50LmdldFJvb3RDb250cm9sKCksIG9Db250cm9sU3RhdGUsIG9OYXZQYXJhbWV0ZXJzKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn07XG4vKipcbiAqIEEgY29udHJvbGxlciBleHRlbnNpb24gb2ZmZXJpbmcgaG9va3MgZm9yIHN0YXRlIGhhbmRsaW5nXG4gKlxuICogSWYgeW91IG5lZWQgdG8gbWFpbnRhaW4gYSBzcGVjaWZpYyBzdGF0ZSBmb3IgeW91ciBhcHBsaWNhdGlvbiwgeW91IGNhbiB1c2UgdGhlIGNvbnRyb2xsZXIgZXh0ZW5zaW9uLlxuICpcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjg1LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlXCIpXG5jbGFzcyBWaWV3U3RhdGUgZXh0ZW5kcyBDb250cm9sbGVyRXh0ZW5zaW9uIHtcblx0cHJpdmF0ZSBfaVJldHJpZXZpbmdTdGF0ZUNvdW50ZXI6IG51bWJlcjtcblx0cHJpdmF0ZSBfcEluaXRpYWxTdGF0ZUFwcGxpZWQ6IFByb21pc2U8dW5rbm93bj47XG5cdHByaXZhdGUgX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZT86IEZ1bmN0aW9uO1xuXHRwcml2YXRlIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblxuXHQvKipcblx0ICogQ29uc3RydWN0b3IuXG5cdCAqL1xuXHRjb25zdHJ1Y3RvcigpIHtcblx0XHRzdXBlcigpO1xuXHRcdHRoaXMuX2lSZXRyaWV2aW5nU3RhdGVDb3VudGVyID0gMDtcblx0XHR0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZCA9IG5ldyBQcm9taXNlKChyZXNvbHZlKSA9PiB7XG5cdFx0XHR0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmUgPSByZXNvbHZlO1xuXHRcdH0pO1xuXHR9XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGFzeW5jIHJlZnJlc2hWaWV3QmluZGluZ3MoKSB7XG5cdFx0Y29uc3QgYUNvbnRyb2xzID0gYXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyh0aGlzLmJhc2Uudmlld1N0YXRlLmFkYXB0QmluZGluZ1JlZnJlc2hDb250cm9scyk7XG5cdFx0bGV0IG9Qcm9taXNlQ2hhaW4gPSBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRhQ29udHJvbHNcblx0XHRcdC5maWx0ZXIoKG9Db250cm9sOiBhbnkpID0+IHtcblx0XHRcdFx0cmV0dXJuIG9Db250cm9sICYmIG9Db250cm9sLmlzQSAmJiBvQ29udHJvbC5pc0EoXCJzYXAudWkuYmFzZS5NYW5hZ2VkT2JqZWN0XCIpO1xuXHRcdFx0fSlcblx0XHRcdC5mb3JFYWNoKChvQ29udHJvbDogYW55KSA9PiB7XG5cdFx0XHRcdG9Qcm9taXNlQ2hhaW4gPSBvUHJvbWlzZUNoYWluLnRoZW4odGhpcy5yZWZyZXNoQ29udHJvbEJpbmRpbmcuYmluZCh0aGlzLCBvQ29udHJvbCkpO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuIG9Qcm9taXNlQ2hhaW47XG5cdH1cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIGFkZCBhbGwgY29udHJvbHMgcmVsZXZhbnQgZm9yIHJlZnJlc2hpbmcgdG8gdGhlIHByb3ZpZGVkIGNvbnRyb2wgYXJyYXkuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBhQ29sbGVjdGVkQ29udHJvbHMgVGhlIGNvbGxlY3RlZCBjb250cm9sc1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI2FkYXB0QmluZGluZ1JlZnJlc2hDb250cm9sc1xuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0YWRhcHRCaW5kaW5nUmVmcmVzaENvbnRyb2xzKGFDb2xsZWN0ZWRDb250cm9sczogTWFuYWdlZE9iamVjdFtdKSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGVuXG5cdH1cblxuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHJlZnJlc2hDb250cm9sQmluZGluZyhvQ29udHJvbDogYW55KSB7XG5cdFx0Y29uc3Qgb0NvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIgPSB0aGlzLmdldENvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIob0NvbnRyb2wpO1xuXHRcdGxldCBvUHJvbWlzZUNoYWluID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0aWYgKHR5cGVvZiBvQ29udHJvbFJlZnJlc2hCaW5kaW5nSGFuZGxlci5yZWZyZXNoQmluZGluZyAhPT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRMb2cuaW5mbyhgcmVmcmVzaEJpbmRpbmcgaGFuZGxlciBmb3IgY29udHJvbDogJHtvQ29udHJvbC5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKX0gaXMgbm90IHByb3ZpZGVkYCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9Qcm9taXNlQ2hhaW4gPSBvUHJvbWlzZUNoYWluLnRoZW4ob0NvbnRyb2xSZWZyZXNoQmluZGluZ0hhbmRsZXIucmVmcmVzaEJpbmRpbmcuYmluZCh0aGlzLCBvQ29udHJvbCkpO1xuXHRcdH1cblx0XHRyZXR1cm4gb1Byb21pc2VDaGFpbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgbWFwIG9mIDxjb2RlPnJlZnJlc2hCaW5kaW5nPC9jb2RlPiBmdW5jdGlvbiBmb3IgYSBjZXJ0YWluIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c2FwLnVpLmJhc2UuTWFuYWdlZE9iamVjdH0gb0NvbnRyb2wgVGhlIGNvbnRyb2wgdG8gZ2V0IHN0YXRlIGhhbmRsZXIgZm9yXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IEEgcGxhaW4gb2JqZWN0IHdpdGggb25lIGZ1bmN0aW9uOiA8Y29kZT5yZWZyZXNoQmluZGluZzwvY29kZT5cblx0ICovXG5cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRDb250cm9sUmVmcmVzaEJpbmRpbmdIYW5kbGVyKG9Db250cm9sOiBhbnkpOiBhbnkge1xuXHRcdGNvbnN0IG9SZWZyZXNoQmluZGluZ0hhbmRsZXI6IGFueSA9IHt9O1xuXHRcdGlmIChvQ29udHJvbCkge1xuXHRcdFx0Zm9yIChjb25zdCBzVHlwZSBpbiBfbUNvbnRyb2xTdGF0ZUhhbmRsZXJNYXApIHtcblx0XHRcdFx0aWYgKG9Db250cm9sLmlzQShzVHlwZSkpIHtcblx0XHRcdFx0XHQvLyBwYXNzIG9ubHkgdGhlIHJlZnJlc2hCaW5kaW5nIGhhbmRsZXIgaW4gYW4gb2JqZWN0IHNvIHRoYXQgOlxuXHRcdFx0XHRcdC8vIDEuIEFwcGxpY2F0aW9uIGhhcyBhY2Nlc3Mgb25seSB0byByZWZyZXNoQmluZGluZyBhbmQgbm90IGFwcGx5IGFuZCByZXRlcml2ZSBhdCB0aGlzIHN0YWdlXG5cdFx0XHRcdFx0Ly8gMi4gQXBwbGljYXRpb24gbW9kaWZpY2F0aW9ucyB0byB0aGUgb2JqZWN0IHdpbGwgYmUgcmVmbGVjdGVkIGhlcmUgKGFzIHdlIHBhc3MgYnkgcmVmZXJlbmNlKVxuXHRcdFx0XHRcdG9SZWZyZXNoQmluZGluZ0hhbmRsZXJbXCJyZWZyZXNoQmluZGluZ1wiXSA9IF9tQ29udHJvbFN0YXRlSGFuZGxlck1hcFtzVHlwZV0ucmVmcmVzaEJpbmRpbmcgfHwge307XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5iYXNlLnZpZXdTdGF0ZS5hZGFwdEJpbmRpbmdSZWZyZXNoSGFuZGxlcihvQ29udHJvbCwgb1JlZnJlc2hCaW5kaW5nSGFuZGxlcik7XG5cdFx0cmV0dXJuIG9SZWZyZXNoQmluZGluZ0hhbmRsZXI7XG5cdH1cblx0LyoqXG5cdCAqIEN1c3RvbWl6ZSB0aGUgPGNvZGU+cmVmcmVzaEJpbmRpbmc8L2NvZGU+IGZ1bmN0aW9uIGZvciBhIGNlcnRhaW4gY29udHJvbC5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBjb250cm9sIGZvciB3aGljaCB0aGUgcmVmcmVzaCBoYW5kbGVyIGlzIGFkYXB0ZWQuXG5cdCAqIEBwYXJhbSBvQ29udHJvbEhhbmRsZXIgQSBwbGFpbiBvYmplY3Qgd2hpY2ggY2FuIGhhdmUgb25lIGZ1bmN0aW9uOiA8Y29kZT5yZWZyZXNoQmluZGluZzwvY29kZT5cblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNhZGFwdEJpbmRpbmdSZWZyZXNoSGFuZGxlclxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0YWRhcHRCaW5kaW5nUmVmcmVzaEhhbmRsZXIob0NvbnRyb2w6IE1hbmFnZWRPYmplY3QsIG9Db250cm9sSGFuZGxlcjogYW55W10pIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZW5cblx0fVxuXG5cdC8qKlxuXHQgKiBDYWxsZWQgd2hlbiB0aGUgYXBwbGljYXRpb24gaXMgc3VzcGVuZGVkIGR1ZSB0byBrZWVwLWFsaXZlIG1vZGUuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjb25TdXNwZW5kXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0b25TdXNwZW5kKCkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRlblxuXHR9XG5cblx0LyoqXG5cdCAqIENhbGxlZCB3aGVuIHRoZSBhcHBsaWNhdGlvbiBpcyByZXN0b3JlZCBkdWUgdG8ga2VlcC1hbGl2ZSBtb2RlLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI29uUmVzdG9yZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdG9uUmVzdG9yZSgpIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZW5cblx0fVxuXG5cdC8qKlxuXHQgKiBEZXN0cnVjdG9yIG1ldGhvZCBmb3Igb2JqZWN0cy5cblx0ICovXG5cdGRlc3Ryb3koKSB7XG5cdFx0ZGVsZXRlIHRoaXMuX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZTtcblx0XHRzdXBlci5kZXN0cm95KCk7XG5cdH1cblxuXHQvKipcblx0ICogSGVscGVyIGZ1bmN0aW9uIHRvIGVuYWJsZSBtdWx0aSBvdmVycmlkZS4gSXQgaXMgYWRkaW5nIGFuIGFkZGl0aW9uYWwgcGFyYW1ldGVyIChhcnJheSkgdG8gdGhlIHByb3ZpZGVkXG5cdCAqIGZ1bmN0aW9uIChhbmQgaXRzIHBhcmFtZXRlcnMpLCB0aGF0IHdpbGwgYmUgZXZhbHVhdGVkIHZpYSA8Y29kZT5Qcm9taXNlLmFsbDwvY29kZT4uXG5cdCAqXG5cdCAqIEBwYXJhbSBmbkNhbGwgVGhlIGZ1bmN0aW9uIHRvIGJlIGNhbGxlZFxuXHQgKiBAcGFyYW0gYXJnc1xuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdG8gYmUgcmVzb2x2ZWQgd2l0aCB0aGUgcmVzdWx0IG9mIGFsbCBvdmVycmlkZXNcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Y29sbGVjdFJlc3VsdHMoZm5DYWxsOiBGdW5jdGlvbiwgLi4uYXJnczogYW55W10pIHtcblx0XHRjb25zdCBhUmVzdWx0czogYW55W10gPSBbXTtcblx0XHRhcmdzLnB1c2goYVJlc3VsdHMpO1xuXHRcdGZuQ2FsbC5hcHBseSh0aGlzLCBhcmdzKTtcblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoYVJlc3VsdHMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEN1c3RvbWl6ZSB0aGUgPGNvZGU+cmV0cmlldmU8L2NvZGU+IGFuZCA8Y29kZT5hcHBseTwvY29kZT4gZnVuY3Rpb25zIGZvciBhIGNlcnRhaW4gY29udHJvbC5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyfS5cblx0ICpcblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBjb250cm9sIHRvIGdldCBzdGF0ZSBoYW5kbGVyIGZvclxuXHQgKiBAcGFyYW0gYUNvbnRyb2xIYW5kbGVyIEEgbGlzdCBvZiBwbGFpbiBvYmplY3RzIHdpdGggdHdvIGZ1bmN0aW9uczogPGNvZGU+cmV0cmlldmU8L2NvZGU+IGFuZCA8Y29kZT5hcHBseTwvY29kZT5cblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNhZGFwdENvbnRyb2xTdGF0ZUhhbmRsZXJcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdGFkYXB0Q29udHJvbFN0YXRlSGFuZGxlcihvQ29udHJvbDogTWFuYWdlZE9iamVjdCwgYUNvbnRyb2xIYW5kbGVyOiBvYmplY3RbXSkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRkZW4gaWYgbmVlZGVkXG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyBhIG1hcCBvZiA8Y29kZT5yZXRyaWV2ZTwvY29kZT4gYW5kIDxjb2RlPmFwcGx5PC9jb2RlPiBmdW5jdGlvbnMgZm9yIGEgY2VydGFpbiBjb250cm9sLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRyb2wgVGhlIGNvbnRyb2wgdG8gZ2V0IHN0YXRlIGhhbmRsZXIgZm9yXG5cdCAqIEByZXR1cm5zIEEgcGxhaW4gb2JqZWN0IHdpdGggdHdvIGZ1bmN0aW9uczogPGNvZGU+cmV0cmlldmU8L2NvZGU+IGFuZCA8Y29kZT5hcHBseTwvY29kZT5cblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0Z2V0Q29udHJvbFN0YXRlSGFuZGxlcihvQ29udHJvbDogYW55KSB7XG5cdFx0Y29uc3QgYUludGVybmFsQ29udHJvbFN0YXRlSGFuZGxlciA9IFtdLFxuXHRcdFx0YUN1c3RvbUNvbnRyb2xTdGF0ZUhhbmRsZXI6IGFueVtdID0gW107XG5cdFx0aWYgKG9Db250cm9sKSB7XG5cdFx0XHRmb3IgKGNvbnN0IHNUeXBlIGluIF9tQ29udHJvbFN0YXRlSGFuZGxlck1hcCkge1xuXHRcdFx0XHRpZiAob0NvbnRyb2wuaXNBKHNUeXBlKSkge1xuXHRcdFx0XHRcdC8vIGF2b2lkIGRpcmVjdCBtYW5pcHVsYXRpb24gb2YgaW50ZXJuYWwgX21Db250cm9sU3RhdGVIYW5kbGVyTWFwXG5cdFx0XHRcdFx0YUludGVybmFsQ29udHJvbFN0YXRlSGFuZGxlci5wdXNoKE9iamVjdC5hc3NpZ24oe30sIF9tQ29udHJvbFN0YXRlSGFuZGxlck1hcFtzVHlwZV0pKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHR0aGlzLmJhc2Uudmlld1N0YXRlLmFkYXB0Q29udHJvbFN0YXRlSGFuZGxlcihvQ29udHJvbCwgYUN1c3RvbUNvbnRyb2xTdGF0ZUhhbmRsZXIpO1xuXHRcdHJldHVybiBhSW50ZXJuYWxDb250cm9sU3RhdGVIYW5kbGVyLmNvbmNhdChhQ3VzdG9tQ29udHJvbFN0YXRlSGFuZGxlcik7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBzaG91bGQgYWRkIGFsbCBjb250cm9scyBmb3IgZ2l2ZW4gdmlldyB0aGF0IHNob3VsZCBiZSBjb25zaWRlcmVkIGZvciB0aGUgc3RhdGUgaGFuZGxpbmcgdG8gdGhlIHByb3ZpZGVkIGNvbnRyb2wgYXJyYXkuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBhQ29sbGVjdGVkQ29udHJvbHMgVGhlIGNvbGxlY3RlZCBjb250cm9sc1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI2FkYXB0U3RhdGVDb250cm9sc1xuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0YWRhcHRTdGF0ZUNvbnRyb2xzKGFDb2xsZWN0ZWRDb250cm9sczogTWFuYWdlZE9iamVjdFtdKSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlbiBpZiBuZWVkZWRcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBrZXkgdG8gYmUgdXNlZCBmb3IgZ2l2ZW4gY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250cm9sIFRoZSBjb250cm9sIHRvIGdldCBzdGF0ZSBrZXkgZm9yXG5cdCAqIEByZXR1cm5zIFRoZSBrZXkgdG8gYmUgdXNlZCBmb3Igc3RvcmluZyB0aGUgY29udHJvbHMgc3RhdGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRnZXRTdGF0ZUtleShvQ29udHJvbDogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0VmlldygpLmdldExvY2FsSWQob0NvbnRyb2wuZ2V0SWQoKSkgfHwgb0NvbnRyb2wuZ2V0SWQoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSB0aGUgdmlldyBzdGF0ZSBvZiB0aGlzIGV4dGVuc2lvbnMgdmlldy5cblx0ICogV2hlbiB0aGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCBtb3JlIHRoYW4gb25jZSBiZWZvcmUgZmluaXNoaW5nLCBhbGwgYnV0IHRoZSBmaW5hbCByZXNwb25zZSB3aWxsIHJlc29sdmUgdG8gPGNvZGU+dW5kZWZpbmVkPC9jb2RlPi5cblx0ICpcblx0ICogQHJldHVybnMgQSBwcm9taXNlIHJlc29sdmluZyB0aGUgdmlldyBzdGF0ZVxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI3JldHJpZXZlVmlld1N0YXRlXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhc3luYyByZXRyaWV2ZVZpZXdTdGF0ZSgpIHtcblx0XHQrK3RoaXMuX2lSZXRyaWV2aW5nU3RhdGVDb3VudGVyO1xuXHRcdGxldCBvVmlld1N0YXRlOiBhbnk7XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdGhpcy5fcEluaXRpYWxTdGF0ZUFwcGxpZWQ7XG5cdFx0XHRjb25zdCBhQ29udHJvbHMgPSBhd2FpdCB0aGlzLmNvbGxlY3RSZXN1bHRzKHRoaXMuYmFzZS52aWV3U3RhdGUuYWRhcHRTdGF0ZUNvbnRyb2xzKTtcblx0XHRcdGNvbnN0IGFSZXNvbHZlZFN0YXRlcyA9IGF3YWl0IFByb21pc2UuYWxsKFxuXHRcdFx0XHRhQ29udHJvbHNcblx0XHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChvQ29udHJvbDogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb0NvbnRyb2wgJiYgb0NvbnRyb2wuaXNBICYmIG9Db250cm9sLmlzQShcInNhcC51aS5iYXNlLk1hbmFnZWRPYmplY3RcIik7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQubWFwKChvQ29udHJvbDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gdGhpcy5yZXRyaWV2ZUNvbnRyb2xTdGF0ZShvQ29udHJvbCkudGhlbigodlJlc3VsdDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHRcdFx0a2V5OiB0aGlzLmdldFN0YXRlS2V5KG9Db250cm9sKSxcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZTogdlJlc3VsdFxuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdCk7XG5cdFx0XHRvVmlld1N0YXRlID0gYVJlc29sdmVkU3RhdGVzLnJlZHVjZShmdW5jdGlvbiAob1N0YXRlczogYW55LCBtU3RhdGU6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvQ3VycmVudFN0YXRlOiBhbnkgPSB7fTtcblx0XHRcdFx0b0N1cnJlbnRTdGF0ZVttU3RhdGUua2V5XSA9IG1TdGF0ZS52YWx1ZTtcblx0XHRcdFx0cmV0dXJuIG1lcmdlT2JqZWN0cyhvU3RhdGVzLCBvQ3VycmVudFN0YXRlKTtcblx0XHRcdH0sIHt9KTtcblx0XHRcdGNvbnN0IG1BZGRpdGlvbmFsU3RhdGVzID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKHRoaXMuX3JldHJpZXZlQWRkaXRpb25hbFN0YXRlcygpKTtcblx0XHRcdGlmIChtQWRkaXRpb25hbFN0YXRlcyAmJiBPYmplY3Qua2V5cyhtQWRkaXRpb25hbFN0YXRlcykubGVuZ3RoKSB7XG5cdFx0XHRcdG9WaWV3U3RhdGVbQURESVRJT05BTF9TVEFURVNfS0VZXSA9IG1BZGRpdGlvbmFsU3RhdGVzO1xuXHRcdFx0fVxuXHRcdH0gZmluYWxseSB7XG5cdFx0XHQtLXRoaXMuX2lSZXRyaWV2aW5nU3RhdGVDb3VudGVyO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9pUmV0cmlldmluZ1N0YXRlQ291bnRlciA9PT0gMCA/IG9WaWV3U3RhdGUgOiB1bmRlZmluZWQ7XG5cdH1cblxuXHQvKipcblx0ICogRXh0ZW5kIHRoZSBtYXAgb2YgYWRkaXRpb25hbCBzdGF0ZXMgKG5vdCBjb250cm9sIGJvdW5kKSB0byBiZSBhZGRlZCB0byB0aGUgY3VycmVudCB2aWV3IHN0YXRlIG9mIHRoZSBnaXZlbiB2aWV3LlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gbUFkZGl0aW9uYWxTdGF0ZXMgVGhlIGFkZGl0aW9uYWwgc3RhdGVcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNyZXRyaWV2ZUFkZGl0aW9uYWxTdGF0ZXNcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdHJldHJpZXZlQWRkaXRpb25hbFN0YXRlcyhtQWRkaXRpb25hbFN0YXRlczogb2JqZWN0KSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlbiBpZiBuZWVkZWRcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgbWFwIG9mIGFkZGl0aW9uYWwgc3RhdGVzIChub3QgY29udHJvbCBib3VuZCkgdG8gYmUgYWRkZWQgdG8gdGhlIGN1cnJlbnQgdmlldyBzdGF0ZSBvZiB0aGUgZ2l2ZW4gdmlldy5cblx0ICpcblx0ICogQHJldHVybnMgQWRkaXRpb25hbCB2aWV3IHN0YXRlc1xuXHQgKi9cblx0X3JldHJpZXZlQWRkaXRpb25hbFN0YXRlcygpIHtcblx0XHRjb25zdCBtQWRkaXRpb25hbFN0YXRlcyA9IHt9O1xuXHRcdHRoaXMuYmFzZS52aWV3U3RhdGUucmV0cmlldmVBZGRpdGlvbmFsU3RhdGVzKG1BZGRpdGlvbmFsU3RhdGVzKTtcblx0XHRyZXR1cm4gbUFkZGl0aW9uYWxTdGF0ZXM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgY3VycmVudCBzdGF0ZSBmb3IgdGhlIGdpdmVuIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udHJvbCBUaGUgb2JqZWN0IHRvIGdldCB0aGUgc3RhdGUgZm9yXG5cdCAqIEByZXR1cm5zIFRoZSBzdGF0ZSBmb3IgdGhlIGdpdmVuIGNvbnRyb2xcblx0ICovXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cmV0cmlldmVDb250cm9sU3RhdGUob0NvbnRyb2w6IGFueSkge1xuXHRcdGNvbnN0IGFDb250cm9sU3RhdGVIYW5kbGVycyA9IHRoaXMuZ2V0Q29udHJvbFN0YXRlSGFuZGxlcihvQ29udHJvbCk7XG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKFxuXHRcdFx0YUNvbnRyb2xTdGF0ZUhhbmRsZXJzLm1hcCgobUNvbnRyb2xTdGF0ZUhhbmRsZXI6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAodHlwZW9mIG1Db250cm9sU3RhdGVIYW5kbGVyLnJldHJpZXZlICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYGNvbnRyb2xTdGF0ZUhhbmRsZXIucmV0cmlldmUgaXMgbm90IGEgZnVuY3Rpb24gZm9yIGNvbnRyb2w6ICR7b0NvbnRyb2wuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCl9YCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIG1Db250cm9sU3RhdGVIYW5kbGVyLnJldHJpZXZlLmNhbGwodGhpcywgb0NvbnRyb2wpO1xuXHRcdFx0fSlcblx0XHQpLnRoZW4oKGFTdGF0ZXM6IGFueVtdKSA9PiB7XG5cdFx0XHRyZXR1cm4gYVN0YXRlcy5yZWR1Y2UoZnVuY3Rpb24gKG9GaW5hbFN0YXRlOiBhbnksIG9DdXJyZW50U3RhdGU6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gbWVyZ2VPYmplY3RzKG9GaW5hbFN0YXRlLCBvQ3VycmVudFN0YXRlKTtcblx0XHRcdH0sIHt9KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXRoZXIgdGhlIHZpZXcgc3RhdGUgc2hvdWxkIG9ubHkgYmUgYXBwbGllZCBvbmNlIGluaXRpYWxseS5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBtZWFudCB0byBiZSBpbmRpdmlkdWFsbHkgb3ZlcnJpZGRlbiBieSBjb25zdW1pbmcgY29udHJvbGxlcnMsIGJ1dCBub3QgdG8gYmUgY2FsbGVkIGRpcmVjdGx5LlxuXHQgKiBUaGUgb3ZlcnJpZGUgZXhlY3V0aW9uIGlzOiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLk92ZXJyaWRlRXhlY3V0aW9uLkluc3RlYWR9LlxuXHQgKlxuXHQgKiBJbXBvcnRhbnQ6XG5cdCAqIFlvdSBzaG91bGQgb25seSBvdmVycmlkZSB0aGlzIG1ldGhvZCBmb3IgY3VzdG9tIHBhZ2VzIGFuZCBub3QgZm9yIHRoZSBzdGFuZGFyZCBMaXN0UmVwb3J0UGFnZSBhbmQgT2JqZWN0UGFnZSFcblx0ICpcblx0ICogQHJldHVybnMgSWYgPGNvZGU+dHJ1ZTwvY29kZT4sIG9ubHkgdGhlIGluaXRpYWwgdmlldyBzdGF0ZSBpcyBhcHBsaWVkIG9uY2UsXG5cdCAqIGVsc2UgYW55IG5ldyB2aWV3IHN0YXRlIGlzIGFsc28gYXBwbGllZCBvbiBmb2xsb3ctdXAgY2FsbHMgKGRlZmF1bHQpXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5WaWV3U3RhdGUjYXBwbHlJbml0aWFsU3RhdGVPbmx5XG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5JbnN0ZWFkKVxuXHRhcHBseUluaXRpYWxTdGF0ZU9ubHkoKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblx0LyoqXG5cdCAqIEFwcGxpZXMgdGhlIGdpdmVuIHZpZXcgc3RhdGUgdG8gdGhpcyBleHRlbnNpb25zIHZpZXcuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVmlld1N0YXRlIFRoZSB2aWV3IHN0YXRlIHRvIGFwcGx5IChjYW4gYmUgdW5kZWZpbmVkKVxuXHQgKiBAcGFyYW0gb05hdlBhcmFtZXRlciBUaGUgY3VycmVudCBuYXZpZ2F0aW9uIHBhcmFtZXRlclxuXHQgKiBAcGFyYW0gb05hdlBhcmFtZXRlci5uYXZpZ2F0aW9uVHlwZSBUaGUgYWN0dWFsIG5hdmlnYXRpb24gdHlwZVxuXHQgKiBAcGFyYW0gb05hdlBhcmFtZXRlci5zZWxlY3Rpb25WYXJpYW50IFRoZSBzZWxlY3Rpb25WYXJpYW50IGZyb20gdGhlIG5hdmlnYXRpb25cblx0ICogQHBhcmFtIG9OYXZQYXJhbWV0ZXIuc2VsZWN0aW9uVmFyaWFudERlZmF1bHRzIFRoZSBzZWxlY3Rpb25WYXJpYW50IGRlZmF1bHRzIGZyb20gdGhlIG5hdmlnYXRpb25cblx0ICogQHBhcmFtIG9OYXZQYXJhbWV0ZXIucmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQgRGVmaW5lcyB3aGV0aGVyIHRoZSBzdGFuZGFyZCB2YXJpYW50IG11c3QgYmUgdXNlZCBpbiB2YXJpYW50IG1hbmFnZW1lbnRcblx0ICogQHJldHVybnMgUHJvbWlzZSBmb3IgYXN5bmMgc3RhdGUgaGFuZGxpbmdcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNhcHBseVZpZXdTdGF0ZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgYXBwbHlWaWV3U3RhdGUoXG5cdFx0b1ZpZXdTdGF0ZTogYW55LFxuXHRcdG9OYXZQYXJhbWV0ZXI6IHtcblx0XHRcdG5hdmlnYXRpb25UeXBlOiBhbnk7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50Pzogb2JqZWN0O1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudERlZmF1bHRzPzogb2JqZWN0O1xuXHRcdFx0cmVxdWlyZXNTdGFuZGFyZFZhcmlhbnQ/OiBib29sZWFuO1xuXHRcdH1cblx0KTogUHJvbWlzZTxhbnk+IHtcblx0XHRpZiAodGhpcy5iYXNlLnZpZXdTdGF0ZS5hcHBseUluaXRpYWxTdGF0ZU9ubHkoKSAmJiB0aGlzLl9nZXRJbml0aWFsU3RhdGVBcHBsaWVkKCkpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyh0aGlzLmJhc2Uudmlld1N0YXRlLm9uQmVmb3JlU3RhdGVBcHBsaWVkKTtcblx0XHRcdGNvbnN0IGFDb250cm9scyA9IGF3YWl0IHRoaXMuY29sbGVjdFJlc3VsdHModGhpcy5iYXNlLnZpZXdTdGF0ZS5hZGFwdFN0YXRlQ29udHJvbHMpO1xuXHRcdFx0bGV0IG9Qcm9taXNlQ2hhaW4gPSBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdGFDb250cm9sc1xuXHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChvQ29udHJvbDogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9Db250cm9sICYmIG9Db250cm9sLmlzQSAmJiBvQ29udHJvbC5pc0EoXCJzYXAudWkuYmFzZS5NYW5hZ2VkT2JqZWN0XCIpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuZm9yRWFjaCgob0NvbnRyb2w6IGFueSkgPT4ge1xuXHRcdFx0XHRcdGNvbnN0IHNLZXkgPSB0aGlzLmdldFN0YXRlS2V5KG9Db250cm9sKTtcblx0XHRcdFx0XHRvUHJvbWlzZUNoYWluID0gb1Byb21pc2VDaGFpbi50aGVuKFxuXHRcdFx0XHRcdFx0dGhpcy5hcHBseUNvbnRyb2xTdGF0ZS5iaW5kKHRoaXMsIG9Db250cm9sLCBvVmlld1N0YXRlID8gb1ZpZXdTdGF0ZVtzS2V5XSA6IHVuZGVmaW5lZCwgb05hdlBhcmFtZXRlcilcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9KTtcblx0XHRcdGF3YWl0IG9Qcm9taXNlQ2hhaW47XG5cdFx0XHRpZiAob05hdlBhcmFtZXRlci5uYXZpZ2F0aW9uVHlwZSA9PT0gTmF2VHlwZS5pQXBwU3RhdGUpIHtcblx0XHRcdFx0YXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyhcblx0XHRcdFx0XHR0aGlzLmJhc2Uudmlld1N0YXRlLmFwcGx5QWRkaXRpb25hbFN0YXRlcyxcblx0XHRcdFx0XHRvVmlld1N0YXRlID8gb1ZpZXdTdGF0ZVtBRERJVElPTkFMX1NUQVRFU19LRVldIDogdW5kZWZpbmVkXG5cdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRhd2FpdCB0aGlzLmNvbGxlY3RSZXN1bHRzKHRoaXMuYmFzZS52aWV3U3RhdGUuYXBwbHlOYXZpZ2F0aW9uUGFyYW1ldGVycywgb05hdlBhcmFtZXRlcik7XG5cdFx0XHRcdGF3YWl0IHRoaXMuY29sbGVjdFJlc3VsdHModGhpcy5iYXNlLnZpZXdTdGF0ZS5fYXBwbHlOYXZpZ2F0aW9uUGFyYW1ldGVyc1RvRmlsdGVyYmFyLCBvTmF2UGFyYW1ldGVyKTtcblx0XHRcdH1cblx0XHR9IGZpbmFsbHkge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0YXdhaXQgdGhpcy5jb2xsZWN0UmVzdWx0cyh0aGlzLmJhc2Uudmlld1N0YXRlLm9uQWZ0ZXJTdGF0ZUFwcGxpZWQpO1xuXHRcdFx0XHR0aGlzLl9zZXRJbml0aWFsU3RhdGVBcHBsaWVkKCk7XG5cdFx0XHR9IGNhdGNoIChlOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdEBwcml2YXRlRXh0ZW5zaW9uKClcblx0X2NoZWNrSWZWYXJpYW50SWRJc0F2YWlsYWJsZShvVk06IGFueSwgc1ZhcmlhbnRJZDogYW55KSB7XG5cdFx0Y29uc3QgYVZhcmlhbnRzID0gb1ZNLmdldFZhcmlhbnRzKCk7XG5cdFx0bGV0IGJJc0NvbnRyb2xTdGF0ZVZhcmlhbnRBdmFpbGFibGUgPSBmYWxzZTtcblx0XHRhVmFyaWFudHMuZm9yRWFjaChmdW5jdGlvbiAob1ZhcmlhbnQ6IGFueSkge1xuXHRcdFx0aWYgKG9WYXJpYW50LmtleSA9PT0gc1ZhcmlhbnRJZCkge1xuXHRcdFx0XHRiSXNDb250cm9sU3RhdGVWYXJpYW50QXZhaWxhYmxlID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gYklzQ29udHJvbFN0YXRlVmFyaWFudEF2YWlsYWJsZTtcblx0fVxuXG5cdF9zZXRJbml0aWFsU3RhdGVBcHBsaWVkKCkge1xuXHRcdGlmICh0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmUpIHtcblx0XHRcdGNvbnN0IHBJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZSA9IHRoaXMuX3BJbml0aWFsU3RhdGVBcHBsaWVkUmVzb2x2ZTtcblx0XHRcdGRlbGV0ZSB0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmU7XG5cdFx0XHRwSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmUoKTtcblx0XHR9XG5cdH1cblx0X2dldEluaXRpYWxTdGF0ZUFwcGxpZWQoKSB7XG5cdFx0cmV0dXJuICF0aGlzLl9wSW5pdGlhbFN0YXRlQXBwbGllZFJlc29sdmU7XG5cdH1cblxuXHQvKipcblx0ICogSG9vayB0byByZWFjdCBiZWZvcmUgYSBzdGF0ZSBmb3IgZ2l2ZW4gdmlldyBpcyBhcHBsaWVkLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gYVByb21pc2VzIEV4dGVuc2libGUgYXJyYXkgb2YgcHJvbWlzZXMgdG8gYmUgcmVzb2x2ZWQgYmVmb3JlIGNvbnRpbnVpbmdcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNvbkJlZm9yZVN0YXRlQXBwbGllZFxuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0b25CZWZvcmVTdGF0ZUFwcGxpZWQoYVByb21pc2VzOiBQcm9taXNlPGFueT4pIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZW5cblx0fVxuXG5cdC8qKlxuXHQgKiBIb29rIHRvIHJlYWN0IHdoZW4gc3RhdGUgZm9yIGdpdmVuIHZpZXcgd2FzIGFwcGxpZWQuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBhUHJvbWlzZXMgRXh0ZW5zaWJsZSBhcnJheSBvZiBwcm9taXNlcyB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZ1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI29uQWZ0ZXJTdGF0ZUFwcGxpZWRcblx0ICogQHByb3RlY3RlZFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdG9uQWZ0ZXJTdGF0ZUFwcGxpZWQoYVByb21pc2VzOiBQcm9taXNlPGFueT4pIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZW5cblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBseWluZyBhZGRpdGlvbmFsLCBub3QgY29udHJvbCByZWxhdGVkLCBzdGF0ZXMgLSBpcyBjYWxsZWQgb25seSBpZiBuYXZpZ2F0aW9uIHR5cGUgaXMgaUFwcFN0YXRlLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIG1lYW50IHRvIGJlIGluZGl2aWR1YWxseSBvdmVycmlkZGVuIGJ5IGNvbnN1bWluZyBjb250cm9sbGVycywgYnV0IG5vdCB0byBiZSBjYWxsZWQgZGlyZWN0bHkuXG5cdCAqIFRoZSBvdmVycmlkZSBleGVjdXRpb24gaXM6IHtAbGluayBzYXAudWkuY29yZS5tdmMuT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXJ9LlxuXHQgKlxuXHQgKiBAcGFyYW0gb1ZpZXdTdGF0ZSBUaGUgY3VycmVudCB2aWV3IHN0YXRlXG5cdCAqIEBwYXJhbSBhUHJvbWlzZXMgRXh0ZW5zaWJsZSBhcnJheSBvZiBwcm9taXNlcyB0byBiZSByZXNvbHZlZCBiZWZvcmUgY29udGludWluZ1xuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuVmlld1N0YXRlI2FwcGx5QWRkaXRpb25hbFN0YXRlc1xuXHQgKiBAcHJvdGVjdGVkXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0YXBwbHlBZGRpdGlvbmFsU3RhdGVzKG9WaWV3U3RhdGU6IG9iamVjdCwgYVByb21pc2VzOiBQcm9taXNlPGFueT4pIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuIGlmIG5lZWRlZFxuXHR9XG5cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRfYXBwbHlOYXZpZ2F0aW9uUGFyYW1ldGVyc1RvRmlsdGVyYmFyKFxuXHRcdF9vTmF2UGFyYW1ldGVyOiB7XG5cdFx0XHRuYXZpZ2F0aW9uVHlwZTogYW55O1xuXHRcdFx0c2VsZWN0aW9uVmFyaWFudD86IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHRcdHNlbGVjdGlvblZhcmlhbnREZWZhdWx0cz86IG9iamVjdCB8IHVuZGVmaW5lZDtcblx0XHRcdHJlcXVpcmVzU3RhbmRhcmRWYXJpYW50PzogYm9vbGVhbiB8IHVuZGVmaW5lZDtcblx0XHR9LFxuXHRcdF9hUHJvbWlzZXM6IFByb21pc2U8YW55PlxuXHQpIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZGVuIGlmIG5lZWRlZFxuXHR9XG5cblx0LyoqXG5cdCAqIEFwcGx5IG5hdmlnYXRpb24gcGFyYW1ldGVycyBpcyBub3QgY2FsbGVkIGlmIHRoZSBuYXZpZ2F0aW9uIHR5cGUgaXMgaUFwcFN0YXRlXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBvTmF2UGFyYW1ldGVyIFRoZSBjdXJyZW50IG5hdmlnYXRpb24gcGFyYW1ldGVyXG5cdCAqIEBwYXJhbSBvTmF2UGFyYW1ldGVyLm5hdmlnYXRpb25UeXBlIFRoZSBhY3R1YWwgbmF2aWdhdGlvbiB0eXBlXG5cdCAqIEBwYXJhbSBbb05hdlBhcmFtZXRlci5zZWxlY3Rpb25WYXJpYW50XSBUaGUgc2VsZWN0aW9uVmFyaWFudCBmcm9tIHRoZSBuYXZpZ2F0aW9uXG5cdCAqIEBwYXJhbSBbb05hdlBhcmFtZXRlci5zZWxlY3Rpb25WYXJpYW50RGVmYXVsdHNdIFRoZSBzZWxlY3Rpb25WYXJpYW50IGRlZmF1bHRzIGZyb20gdGhlIG5hdmlnYXRpb25cblx0ICogQHBhcmFtIFtvTmF2UGFyYW1ldGVyLnJlcXVpcmVzU3RhbmRhcmRWYXJpYW50XSBEZWZpbmVzIHdoZXRoZXIgdGhlIHN0YW5kYXJkIHZhcmlhbnQgbXVzdCBiZSB1c2VkIGluIHZhcmlhbnQgbWFuYWdlbWVudFxuXHQgKiBAcGFyYW0gYVByb21pc2VzIEV4dGVuc2libGUgYXJyYXkgb2YgcHJvbWlzZXMgdG8gYmUgcmVzb2x2ZWQgYmVmb3JlIGNvbnRpbnVpbmdcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlZpZXdTdGF0ZSNhcHBseU5hdmlnYXRpb25QYXJhbWV0ZXJzXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0YXBwbHlOYXZpZ2F0aW9uUGFyYW1ldGVycyhcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdFx0b05hdlBhcmFtZXRlcjoge1xuXHRcdFx0bmF2aWdhdGlvblR5cGU6IGFueTtcblx0XHRcdHNlbGVjdGlvblZhcmlhbnQ/OiBvYmplY3QgfCB1bmRlZmluZWQ7XG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50RGVmYXVsdHM/OiBvYmplY3QgfCB1bmRlZmluZWQ7XG5cdFx0XHRyZXF1aXJlc1N0YW5kYXJkVmFyaWFudD86IGJvb2xlYW4gfCB1bmRlZmluZWQ7XG5cdFx0fSxcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdFx0YVByb21pc2VzOiBQcm9taXNlPGFueT5cblx0KSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGRlbiBpZiBuZWVkZWRcblx0fVxuXG5cdC8qKlxuXHQgKiBBcHBseWluZyB0aGUgZ2l2ZW4gc3RhdGUgdG8gdGhlIGdpdmVuIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udHJvbCBUaGUgb2JqZWN0IHRvIGFwcGx5IHRoZSBnaXZlbiBzdGF0ZVxuXHQgKiBAcGFyYW0gb0NvbnRyb2xTdGF0ZSBUaGUgc3RhdGUgZm9yIHRoZSBnaXZlbiBjb250cm9sXG5cdCAqIEBwYXJhbSBbb05hdlBhcmFtZXRlcnNdIFRoZSBjdXJyZW50IG5hdmlnYXRpb24gcGFyYW1ldGVyc1xuXHQgKiBAcmV0dXJucyBSZXR1cm4gYSBwcm9taXNlIGZvciBhc3luYyBzdGF0ZSBoYW5kbGluZ1xuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRhcHBseUNvbnRyb2xTdGF0ZShvQ29udHJvbDogYW55LCBvQ29udHJvbFN0YXRlOiBvYmplY3QsIG9OYXZQYXJhbWV0ZXJzPzogb2JqZWN0KSB7XG5cdFx0Y29uc3QgYUNvbnRyb2xTdGF0ZUhhbmRsZXJzID0gdGhpcy5nZXRDb250cm9sU3RhdGVIYW5kbGVyKG9Db250cm9sKTtcblx0XHRsZXQgb1Byb21pc2VDaGFpbiA9IFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdGFDb250cm9sU3RhdGVIYW5kbGVycy5mb3JFYWNoKChtQ29udHJvbFN0YXRlSGFuZGxlcjogYW55KSA9PiB7XG5cdFx0XHRpZiAodHlwZW9mIG1Db250cm9sU3RhdGVIYW5kbGVyLmFwcGx5ICE9PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBjb250cm9sU3RhdGVIYW5kbGVyLmFwcGx5IGlzIG5vdCBhIGZ1bmN0aW9uIGZvciBjb250cm9sOiAke29Db250cm9sLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpfWApO1xuXHRcdFx0fVxuXHRcdFx0b1Byb21pc2VDaGFpbiA9IG9Qcm9taXNlQ2hhaW4udGhlbihtQ29udHJvbFN0YXRlSGFuZGxlci5hcHBseS5iaW5kKHRoaXMsIG9Db250cm9sLCBvQ29udHJvbFN0YXRlLCBvTmF2UGFyYW1ldGVycykpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBvUHJvbWlzZUNoYWluO1xuXHR9XG5cdGdldEludGVyZmFjZSgpIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBWaWV3U3RhdGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7RUErakJPLDBCQUEwQkEsSUFBSSxFQUFFQyxTQUFTLEVBQUU7SUFDakQsSUFBSTtNQUNILElBQUlDLE1BQU0sR0FBR0YsSUFBSSxFQUFFO0lBQ3BCLENBQUMsQ0FBQyxPQUFPRyxDQUFDLEVBQUU7TUFDWCxPQUFPRixTQUFTLENBQUMsSUFBSSxFQUFFRSxDQUFDLENBQUM7SUFDMUI7SUFDQSxJQUFJRCxNQUFNLElBQUlBLE1BQU0sQ0FBQ0UsSUFBSSxFQUFFO01BQzFCLE9BQU9GLE1BQU0sQ0FBQ0UsSUFBSSxDQUFDSCxTQUFTLENBQUNJLElBQUksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLEVBQUVKLFNBQVMsQ0FBQ0ksSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsQ0FBQztJ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