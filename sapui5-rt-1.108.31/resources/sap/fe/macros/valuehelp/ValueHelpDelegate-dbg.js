/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/macros/internal/valuehelp/ValueListHelperNew", "sap/m/inputUtils/highlightDOMElements", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/enum/ConditionValidated", "sap/ui/mdc/odata/v4/ValueHelpDelegate", "sap/ui/mdc/p13n/StateUtil"], function (Log, CommonUtils, ValueListHelperNew, highlightDOMElements, Condition, ConditionValidated, ValueHelpDelegate, StateUtil) {
  "use strict";

  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  var FeCoreControlsFilterBar = "sap.fe.core.controls.FilterBar";
  var MdcFilterbarFilterBarBase = "sap.ui.mdc.filterbar.FilterBarBase";
  var oAfterRenderDelegate = {
    onAfterRendering: function () {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      var oTable = args[0].srcControl;
      var aTableCellsDomRef = oTable.$().find("tbody .sapMText");
      highlightDOMElements(aTableCellsDomRef, oTable.getParent().getFilterValue(), true);
    }
  };
  return Object.assign({}, ValueHelpDelegate, {
    /**
     * Requests the content of the value help.
     *
     * This function is called when the value help is opened or a key or description is requested.
     *
     * So, depending on the value help content used, all content controls and data need to be assigned.
     * Once they are assigned and the data is set, the returned <code>Promise</code> needs to be resolved.
     * Only then does the value help continue opening or reading data.
     *
     * @param payload Payload for delegate
     * @param container Container instance
     * @param contentId Id of the content shown after this call to retrieveContent
     * @returns Promise that is resolved if all content is available
     */
    retrieveContent: function (payload, container, contentId) {
      return ValueListHelperNew.showValueList(payload, container, contentId);
    },
    /**
     * Callback invoked every time a {@link sap.ui.mdc.ValueHelp ValueHelp} fires a select event or the value of the corresponding field changes
     * This callback may be used to update external fields.
     *
     * @param payload Payload for delegate
     * @param valueHelp ValueHelp control instance receiving the <code>controlChange</code>
     * @param reason Reason why the method was invoked
     * @param config Current configuration provided by the calling control
     * @since 1.101.0
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onConditionPropagation: function (payload, valueHelp, reason, config) {
      if (reason !== "ControlChange") {
        /* handle only ControlChange reason */
        return;
      }
      var qualifier = payload.qualifiers[payload.valueHelpQualifier];
      var outParameters = (qualifier === null || qualifier === void 0 ? void 0 : qualifier.vhParameters) && ValueListHelperNew.getOutParameters(qualifier.vhParameters) || [],
        field = valueHelp.getControl(),
        filterBar = field.getParent(),
        filterBarVH = valueHelp.getParent();
      var filterItemsVH = filterBarVH.isA(FeCoreControlsFilterBar) && filterBarVH.getFilterItems();
      var aconditions = field.getConditions();
      aconditions = aconditions.filter(function (condition) {
        var conditionPayloadMap = condition.payload && condition.payload || {};
        return conditionPayloadMap[payload.valueHelpQualifier];
      });
      if (filterBar.isA(MdcFilterbarFilterBarBase)) {
        StateUtil.retrieveExternalState(filterBar).then(function (state) {
          aconditions.forEach(function (condition) {
            var conditionPayloadMap = condition.payload,
              aKeys = conditionPayloadMap && Object.keys(conditionPayloadMap),
              aConditionPayload = outParameters.length && !!aKeys ? conditionPayloadMap[aKeys[0]] : [];
            if (!aConditionPayload) {
              return;
            }
            var _iterator = _createForOfIteratorHelper(outParameters),
              _step;
            try {
              var _loop = function () {
                var outParameter = _step.value;
                var filterTarget = outParameter.source.split("/").pop() || "";
                /* Propagate Out-Parameter only if filter field visible in the LR-Filterbar */
                if ( /* LR FilterBar or /* LR AdaptFilter */
                filterItemsVH && filterItemsVH.find(function (item) {
                  return item.getId().split("::").pop() === filterTarget;
                })) {
                  aConditionPayload.forEach(function (conditionPayload) {
                    var newCondition = Condition.createCondition("EQ", [conditionPayload[outParameter.helpPath]], null, null, ConditionValidated.Validated);
                    state.filter[filterTarget] = state.filter && state.filter[filterTarget] || [];
                    state.filter[filterTarget].push(newCondition);
                  });
                }
                /* LR SettingsDialog or OP SettingsDialog shall not propagate value to the dialog-filterfields */
                /* OP Settings Dialog shall not propagate value to context */
              };
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                _loop();
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
          });
          StateUtil.applyExternalState(filterBar, state);
        }).catch(function (err) {
          Log.error("ValueHelpDelegate: ".concat(err.message));
        });
      } else {
        aconditions.forEach(function (condition) {
          var conditionPayloadMap = condition.payload,
            aKeys = conditionPayloadMap && Object.keys(conditionPayloadMap),
            aConditionPayload = outParameters.length && !!aKeys ? conditionPayloadMap[aKeys[0]] : [];
          if (!aConditionPayload) {
            return;
          }
          var context = valueHelp.getBindingContext();
          if (context) {
            outParameters.forEach(function (outParameter) {
              var target = outParameter.source;
              if ((aConditionPayload === null || aConditionPayload === void 0 ? void 0 : aConditionPayload.length) === 1) {
                var outValues = aConditionPayload[0];
                context.setProperty(target, outValues[outParameter.helpPath]);
              } else if (aConditionPayload !== null && aConditionPayload !== void 0 && aConditionPayload.length && (aConditionPayload === null || aConditionPayload === void 0 ? void 0 : aConditionPayload.length) > 1) {
                Log.warning("ValueHelpDelegate: ParamterOut in multi-value-field not supported");
              }
            });
          }
        });
      }
    },
    _createInitialFilterCondition: function (value, initialValueFilterEmpty) {
      var condition;
      if (value === undefined || value === null) {
        Log.error("ValueHelpDelegate: value of the property could not be requested");
      } else if (value === "") {
        if (initialValueFilterEmpty) {
          condition = Condition.createCondition("Empty", [], null, null, ConditionValidated.Validated);
        }
      } else {
        condition = Condition.createCondition("EQ", [value], null, null, ConditionValidated.Validated);
      }
      return condition;
    },
    _getInitialFilterConditionsFromBinding: function (inConditions, control, inParameters) {
      try {
        var _this2 = this;
        var propertiesToRequest = inParameters.map(function (inParameter) {
          return inParameter.source;
        });
        var bindingContext = control.getBindingContext();
        if (!bindingContext) {
          Log.error("ValueHelpDelegate: No BindingContext");
          return Promise.resolve(inConditions);
        }

        // According to odata v4 api documentation for requestProperty: Property values that are not cached yet are requested from the back end
        return Promise.resolve(bindingContext.requestProperty(propertiesToRequest)).then(function (values) {
          for (var i = 0; i < inParameters.length; i++) {
            var inParameter = inParameters[i];
            var condition = _this2._createInitialFilterCondition(values[i], inParameter.initialValueFilterEmpty);
            if (condition) {
              inConditions[inParameter.helpPath] = [condition];
            }
          }
          return inConditions;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    _getInitialFilterConditionsFromFilterBar: function (inConditions, control, inParameters) {
      try {
        var filterBar = control.getParent();
        return Promise.resolve(StateUtil.retrieveExternalState(filterBar)).then(function (state) {
          var _iterator2 = _createForOfIteratorHelper(inParameters),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var inParameter = _step2.value;
              var sourceField = inParameter.source.split("/").pop();
              var conditions = state.filter[sourceField];
              if (conditions) {
                inConditions[inParameter.helpPath] = conditions;
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          return inConditions;
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    _partitionInParameters: function (inParameters) {
      var inParameterMap = {
        constant: [],
        binding: [],
        filter: []
      };
      var _iterator3 = _createForOfIteratorHelper(inParameters),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var inParameter = _step3.value;
          if (inParameter.constantValue !== undefined) {
            inParameterMap.constant.push(inParameter);
          } else if (inParameter.source.indexOf("$filter") === 0) {
            inParameterMap.filter.push(inParameter);
          } else {
            inParameterMap.binding.push(inParameter);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return inParameterMap;
    },
    /**
     * Provides an initial condition configuration everytime a value help content is shown.
     *
     * @param payload Payload for delegate
     * @param content ValueHelp content requesting conditions configuration
     * @param control Instance of the calling control
     * @returns Returns a map of conditions suitable for a sap.ui.mdc.FilterBar control
     * @since 1.101.0
     */
    getInitialFilterConditions: function (payload, content, control) {
      try {
        var _this4 = this;
        function _temp4() {
          var _temp = function () {
            if (inParameterMap.filter.length) {
              return Promise.resolve(_this4._getInitialFilterConditionsFromFilterBar(inConditions, control, inParameterMap.filter)).then(function () {});
            }
          }();
          return _temp && _temp.then ? _temp.then(function () {
            return inConditions;
          }) : inConditions;
        }
        // highlight text in ValueHelp popover
        if (content !== null && content !== void 0 && content.isA("sap.ui.mdc.valuehelp.content.MTable")) {
          var oPopoverTable = content.getTable();
          oPopoverTable === null || oPopoverTable === void 0 ? void 0 : oPopoverTable.removeEventDelegate(oAfterRenderDelegate);
          oPopoverTable === null || oPopoverTable === void 0 ? void 0 : oPopoverTable.addEventDelegate(oAfterRenderDelegate, _this4);
        }
        var inConditions = {};
        if (!control) {
          Log.error("ValueHelpDelegate: Control undefined");
          return Promise.resolve(inConditions);
        }
        var qualifier = payload.qualifiers[payload.valueHelpQualifier];
        var inParameters = qualifier.vhParameters && ValueListHelperNew.getInParameters(qualifier.vhParameters) || [];
        var inParameterMap = _this4._partitionInParameters(inParameters);
        var isObjectPage = control.getBindingContext();
        var _iterator4 = _createForOfIteratorHelper(inParameterMap.constant),
          _step4;
        try {
          for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
            var inParameter = _step4.value;
            var condition = _this4._createInitialFilterCondition(inParameter.constantValue, isObjectPage ? inParameter.initialValueFilterEmpty : false // no filter with "empty" on ListReport
            );

            if (condition) {
              inConditions[inParameter.helpPath] = [condition];
            }
          }
        } catch (err) {
          _iterator4.e(err);
        } finally {
          _iterator4.f();
        }
        var _temp5 = function () {
          if (inParameterMap.binding.length) {
            return Promise.resolve(_this4._getInitialFilterConditionsFromBinding(inConditions, control, inParameterMap.binding)).then(function () {});
          }
        }();
        return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(_temp4) : _temp4(_temp5));
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Provides the possibility to convey custom data in conditions.
     * This enables an application to enhance conditions with data relevant for combined key or outparameter scenarios.
     *
     * @param payload Payload for delegate
     * @param content ValueHelp content instance
     * @param values Description pair for the condition which is to be created
     * @param context Optional additional context
     * @returns Optionally returns a serializable object to be stored in the condition payload field
     * @since 1.101.0
     */
    createConditionPayload: function (payload, content, values, context) {
      var qualifier = payload.qualifiers[payload.valueHelpQualifier],
        entry = {},
        conditionPayload = {};
      var control = content.getControl();
      var isMultiValueField = control === null || control === void 0 ? void 0 : control.isA("sap.ui.mdc.MultiValueField");
      if (!qualifier.vhKeys || qualifier.vhKeys.length === 1 || isMultiValueField) {
        return undefined;
      }
      qualifier.vhKeys.forEach(function (vhKey) {
        var value = context.getObject(vhKey);
        if (value != null) {
          entry[vhKey] = (value === null || value === void 0 ? void 0 : value.length) === 0 ? "" : value;
        }
      });
      if (Object.keys(entry).length) {
        /* vh qualifier as key for relevant condition */
        conditionPayload[payload.valueHelpQualifier] = [entry];
      }
      return conditionPayload;
    },
    /**
     * Changes the search string.
     *
     * If <code>$search</code> is used, depending on which back-end service is used, the search string might need to be escaped.
     *
     * @param payload Payload for delegate
     * @param typeahead `true` if the search is called for a type-ahead
     * @param search Search string
     * @returns Search string to use
     */
    adjustSearch: function (payload, typeahead, search) {
      return CommonUtils.normalizeSearchTerm(search);
    },
    /**
     * Provides the possibility to customize selections in 'Select from list' scenarios.
     * By default, only condition keys are considered. This may be extended with payload dependent filters.
     *
     * @param payload Payload for delegate
     * @param content ValueHelp content instance
     * @param item Entry of a given list
     * @param conditions Current conditions
     * @returns True, if item is selected
     * @since 1.101.0
     */
    isFilterableListItemSelected: function (payload, content, item, conditions) {
      var _content$getConfig;
      //In value help dialogs of single value fields the row for the key shouldn´t be selected/highlight anymore BCP: 2270175246
      if (!payload.isValueListWithFixedValues && ((_content$getConfig = content.getConfig()) === null || _content$getConfig === void 0 ? void 0 : _content$getConfig.maxConditions) === 1) {
        return false;
      }
      var context = item.getBindingContext();
      var selectedCondition = conditions.find(function (condition) {
        var _conditionPayloadMap$;
        var conditionPayloadMap = condition.payload,
          valueHelpQualifier = payload.valueHelpQualifier || "";
        if (!conditionPayloadMap && Object.keys(payload.qualifiers)[0] === valueHelpQualifier) {
          var keyPath = content.getKeyPath();
          return (context === null || context === void 0 ? void 0 : context.getObject(keyPath)) === (condition === null || condition === void 0 ? void 0 : condition.values[0]);
        }
        var conditionSelectedRow = (conditionPayloadMap === null || conditionPayloadMap === void 0 ? void 0 : (_conditionPayloadMap$ = conditionPayloadMap[valueHelpQualifier]) === null || _conditionPayloadMap$ === void 0 ? void 0 : _conditionPayloadMap$[0]) || {},
          selectedKeys = Object.keys(conditionSelectedRow);
        if (selectedKeys.length) {
          return selectedKeys.every(function (key) {
            return conditionSelectedRow[key] === (context === null || context === void 0 ? void 0 : context.getObject(key));
          });
        }
        return false;
      });
      return selectedCondition ? true : false;
    }
  });
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGZUNvcmVDb250cm9sc0ZpbHRlckJhciIsIk1kY0ZpbHRlcmJhckZpbHRlckJhckJhc2UiLCJvQWZ0ZXJSZW5kZXJEZWxlZ2F0ZSIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJhcmdzIiwib1RhYmxlIiwic3JjQ29udHJvbCIsImFUYWJsZUNlbGxzRG9tUmVmIiwiJCIsImZpbmQiLCJoaWdobGlnaHRET01FbGVtZW50cyIsImdldFBhcmVudCIsImdldEZpbHRlclZhbHVlIiwiT2JqZWN0IiwiYXNzaWduIiwiVmFsdWVIZWxwRGVsZWdhdGUiLCJyZXRyaWV2ZUNvbnRlbnQiLCJwYXlsb2FkIiwiY29udGFpbmVyIiwiY29udGVudElkIiwiVmFsdWVMaXN0SGVscGVyTmV3Iiwic2hvd1ZhbHVlTGlzdCIsIm9uQ29uZGl0aW9uUHJvcGFnYXRpb24iLCJ2YWx1ZUhlbHAiLCJyZWFzb24iLCJjb25maWciLCJxdWFsaWZpZXIiLCJxdWFsaWZpZXJzIiwidmFsdWVIZWxwUXVhbGlmaWVyIiwib3V0UGFyYW1ldGVycyIsInZoUGFyYW1ldGVycyIsImdldE91dFBhcmFtZXRlcnMiLCJmaWVsZCIsImdldENvbnRyb2wiLCJmaWx0ZXJCYXIiLCJmaWx0ZXJCYXJWSCIsImZpbHRlckl0ZW1zVkgiLCJpc0EiLCJnZXRGaWx0ZXJJdGVtcyIsImFjb25kaXRpb25zIiwiZ2V0Q29uZGl0aW9ucyIsImZpbHRlciIsImNvbmRpdGlvbiIsImNvbmRpdGlvblBheWxvYWRNYXAiLCJTdGF0ZVV0aWwiLCJyZXRyaWV2ZUV4dGVybmFsU3RhdGUiLCJ0aGVuIiwic3RhdGUiLCJmb3JFYWNoIiwiYUtleXMiLCJrZXlzIiwiYUNvbmRpdGlvblBheWxvYWQiLCJsZW5ndGgiLCJvdXRQYXJhbWV0ZXIiLCJmaWx0ZXJUYXJnZXQiLCJzb3VyY2UiLCJzcGxpdCIsInBvcCIsIml0ZW0iLCJnZXRJZCIsImNvbmRpdGlvblBheWxvYWQiLCJuZXdDb25kaXRpb24iLCJDb25kaXRpb24iLCJjcmVhdGVDb25kaXRpb24iLCJoZWxwUGF0aCIsIkNvbmRpdGlvblZhbGlkYXRlZCIsIlZhbGlkYXRlZCIsInB1c2giLCJhcHBseUV4dGVybmFsU3RhdGUiLCJjYXRjaCIsImVyciIsIkxvZyIsImVycm9yIiwibWVzc2FnZSIsImNvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsInRhcmdldCIsIm91dFZhbHVlcyIsInNldFByb3BlcnR5Iiwid2FybmluZyIsIl9jcmVhdGVJbml0aWFsRmlsdGVyQ29uZGl0aW9uIiwidmFsdWUiLCJpbml0aWFsVmFsdWVGaWx0ZXJFbXB0eSIsInVuZGVmaW5lZCIsIl9nZXRJbml0aWFsRmlsdGVyQ29uZGl0aW9uc0Zyb21CaW5kaW5nIiwiaW5Db25kaXRpb25zIiwiY29udHJvbCIsImluUGFyYW1ldGVycyIsInByb3BlcnRpZXNUb1JlcXVlc3QiLCJtYXAiLCJpblBhcmFtZXRlciIsImJpbmRpbmdDb250ZXh0IiwicmVxdWVzdFByb3BlcnR5IiwidmFsdWVzIiwiaSIsIl9nZXRJbml0aWFsRmlsdGVyQ29uZGl0aW9uc0Zyb21GaWx0ZXJCYXIiLCJzb3VyY2VGaWVsZCIsImNvbmRpdGlvbnMiLCJfcGFydGl0aW9uSW5QYXJhbWV0ZXJzIiwiaW5QYXJhbWV0ZXJNYXAiLCJjb25zdGFudCIsImJpbmRpbmciLCJjb25zdGFudFZhbHVlIiwiaW5kZXhPZiIsImdldEluaXRpYWxGaWx0ZXJDb25kaXRpb25zIiwiY29udGVudCIsIm9Qb3BvdmVyVGFibGUiLCJnZXRUYWJsZSIsInJlbW92ZUV2ZW50RGVsZWdhdGUiLCJhZGRFdmVudERlbGVnYXRlIiwiZ2V0SW5QYXJhbWV0ZXJzIiwiaXNPYmplY3RQYWdlIiwiY3JlYXRlQ29uZGl0aW9uUGF5bG9hZCIsImVudHJ5IiwiaXNNdWx0aVZhbHVlRmllbGQiLCJ2aEtleXMiLCJ2aEtleSIsImdldE9iamVjdCIsImFkanVzdFNlYXJjaCIsInR5cGVhaGVhZCIsInNlYXJjaCIsIkNvbW1vblV0aWxzIiwibm9ybWFsaXplU2VhcmNoVGVybSIsImlzRmlsdGVyYWJsZUxpc3RJdGVtU2VsZWN0ZWQiLCJpc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyIsImdldENvbmZpZyIsIm1heENvbmRpdGlvbnMiLCJzZWxlY3RlZENvbmRpdGlvbiIsImtleVBhdGgiLCJnZXRLZXlQYXRoIiwiY29uZGl0aW9uU2VsZWN0ZWRSb3ciLCJzZWxlY3RlZEtleXMiLCJldmVyeSIsImtleSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVmFsdWVIZWxwRGVsZWdhdGUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgSW5PdXRQYXJhbWV0ZXIsIFZhbHVlSGVscFBheWxvYWQgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC92YWx1ZWhlbHAvVmFsdWVMaXN0SGVscGVyTmV3XCI7XG5pbXBvcnQgVmFsdWVMaXN0SGVscGVyTmV3IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL3ZhbHVlaGVscC9WYWx1ZUxpc3RIZWxwZXJOZXdcIjtcbmltcG9ydCBoaWdobGlnaHRET01FbGVtZW50cyBmcm9tIFwic2FwL20vaW5wdXRVdGlscy9oaWdobGlnaHRET01FbGVtZW50c1wiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgeyBDb25kaXRpb25PYmplY3QgfSBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vQ29uZGl0aW9uXCI7XG5pbXBvcnQgQ29uZGl0aW9uIGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCBDb25kaXRpb25WYWxpZGF0ZWQgZnJvbSBcInNhcC91aS9tZGMvZW51bS9Db25kaXRpb25WYWxpZGF0ZWRcIjtcbmltcG9ydCB0eXBlIEZpZWxkQmFzZSBmcm9tIFwic2FwL3VpL21kYy9maWVsZC9GaWVsZEJhc2VcIjtcbmltcG9ydCB0eXBlIEZpbHRlckJhckJhc2UgZnJvbSBcInNhcC91aS9tZGMvZmlsdGVyYmFyL0ZpbHRlckJhckJhc2VcIjtcbmltcG9ydCBWYWx1ZUhlbHBEZWxlZ2F0ZSBmcm9tIFwic2FwL3VpL21kYy9vZGF0YS92NC9WYWx1ZUhlbHBEZWxlZ2F0ZVwiO1xuaW1wb3J0IFN0YXRlVXRpbCBmcm9tIFwic2FwL3VpL21kYy9wMTNuL1N0YXRlVXRpbFwiO1xuaW1wb3J0IHR5cGUgVmFsdWVIZWxwIGZyb20gXCJzYXAvdWkvbWRjL1ZhbHVlSGVscFwiO1xuaW1wb3J0IHR5cGUgQ29udGFpbmVyIGZyb20gXCJzYXAvdWkvbWRjL3ZhbHVlaGVscC9iYXNlL0NvbnRhaW5lclwiO1xuaW1wb3J0IHR5cGUgQ29udGVudCBmcm9tIFwic2FwL3VpL21kYy92YWx1ZWhlbHAvYmFzZS9Db250ZW50XCI7XG5pbXBvcnQgdHlwZSBNVGFibGUgZnJvbSBcInNhcC91aS9tZGMvdmFsdWVoZWxwL2NvbnRlbnQvTVRhYmxlXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuXG5jb25zdCBGZUNvcmVDb250cm9sc0ZpbHRlckJhciA9IFwic2FwLmZlLmNvcmUuY29udHJvbHMuRmlsdGVyQmFyXCI7XG5jb25zdCBNZGNGaWx0ZXJiYXJGaWx0ZXJCYXJCYXNlID0gXCJzYXAudWkubWRjLmZpbHRlcmJhci5GaWx0ZXJCYXJCYXNlXCI7XG5jb25zdCBvQWZ0ZXJSZW5kZXJEZWxlZ2F0ZSA9IHtcblx0b25BZnRlclJlbmRlcmluZzogZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0Y29uc3Qgb1RhYmxlID0gYXJnc1swXS5zcmNDb250cm9sO1xuXHRcdGNvbnN0IGFUYWJsZUNlbGxzRG9tUmVmID0gb1RhYmxlLiQoKS5maW5kKFwidGJvZHkgLnNhcE1UZXh0XCIpO1xuXHRcdGhpZ2hsaWdodERPTUVsZW1lbnRzKGFUYWJsZUNlbGxzRG9tUmVmLCBvVGFibGUuZ2V0UGFyZW50KCkuZ2V0RmlsdGVyVmFsdWUoKSwgdHJ1ZSk7XG5cdH1cbn07XG5cbnR5cGUgQ29uZGl0aW9uT2JqZWN0TWFwID0gUmVjb3JkPHN0cmluZywgQ29uZGl0aW9uT2JqZWN0W10+O1xuXG50eXBlIEV4dGVybmFsU3RhdGVUeXBlID0ge1xuXHRpdGVtczogeyBuYW1lOiBzdHJpbmcgfVtdO1xuXHRmaWx0ZXI6IENvbmRpdGlvbk9iamVjdE1hcDtcbn07XG5cbnR5cGUgQ29uZGl0aW9uUGF5bG9hZFR5cGUgPSB7IFtuYW1lIGluIHN0cmluZ106IHN0cmluZyB9O1xuXG50eXBlIENvbmRpdGlvblBheWxvYWRNYXAgPSB7IFtwYXRoIGluIHN0cmluZ106IENvbmRpdGlvblBheWxvYWRUeXBlW10gfTtcblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0LmFzc2lnbih7fSwgVmFsdWVIZWxwRGVsZWdhdGUsIHtcblx0LyoqXG5cdCAqIFJlcXVlc3RzIHRoZSBjb250ZW50IG9mIHRoZSB2YWx1ZSBoZWxwLlxuXHQgKlxuXHQgKiBUaGlzIGZ1bmN0aW9uIGlzIGNhbGxlZCB3aGVuIHRoZSB2YWx1ZSBoZWxwIGlzIG9wZW5lZCBvciBhIGtleSBvciBkZXNjcmlwdGlvbiBpcyByZXF1ZXN0ZWQuXG5cdCAqXG5cdCAqIFNvLCBkZXBlbmRpbmcgb24gdGhlIHZhbHVlIGhlbHAgY29udGVudCB1c2VkLCBhbGwgY29udGVudCBjb250cm9scyBhbmQgZGF0YSBuZWVkIHRvIGJlIGFzc2lnbmVkLlxuXHQgKiBPbmNlIHRoZXkgYXJlIGFzc2lnbmVkIGFuZCB0aGUgZGF0YSBpcyBzZXQsIHRoZSByZXR1cm5lZCA8Y29kZT5Qcm9taXNlPC9jb2RlPiBuZWVkcyB0byBiZSByZXNvbHZlZC5cblx0ICogT25seSB0aGVuIGRvZXMgdGhlIHZhbHVlIGhlbHAgY29udGludWUgb3BlbmluZyBvciByZWFkaW5nIGRhdGEuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXlsb2FkIFBheWxvYWQgZm9yIGRlbGVnYXRlXG5cdCAqIEBwYXJhbSBjb250YWluZXIgQ29udGFpbmVyIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBjb250ZW50SWQgSWQgb2YgdGhlIGNvbnRlbnQgc2hvd24gYWZ0ZXIgdGhpcyBjYWxsIHRvIHJldHJpZXZlQ29udGVudFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgaWYgYWxsIGNvbnRlbnQgaXMgYXZhaWxhYmxlXG5cdCAqL1xuXHRyZXRyaWV2ZUNvbnRlbnQ6IGZ1bmN0aW9uIChwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLCBjb250YWluZXI6IENvbnRhaW5lciwgY29udGVudElkOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gVmFsdWVMaXN0SGVscGVyTmV3LnNob3dWYWx1ZUxpc3QocGF5bG9hZCwgY29udGFpbmVyLCBjb250ZW50SWQpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBpbnZva2VkIGV2ZXJ5IHRpbWUgYSB7QGxpbmsgc2FwLnVpLm1kYy5WYWx1ZUhlbHAgVmFsdWVIZWxwfSBmaXJlcyBhIHNlbGVjdCBldmVudCBvciB0aGUgdmFsdWUgb2YgdGhlIGNvcnJlc3BvbmRpbmcgZmllbGQgY2hhbmdlc1xuXHQgKiBUaGlzIGNhbGxiYWNrIG1heSBiZSB1c2VkIHRvIHVwZGF0ZSBleHRlcm5hbCBmaWVsZHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBwYXlsb2FkIFBheWxvYWQgZm9yIGRlbGVnYXRlXG5cdCAqIEBwYXJhbSB2YWx1ZUhlbHAgVmFsdWVIZWxwIGNvbnRyb2wgaW5zdGFuY2UgcmVjZWl2aW5nIHRoZSA8Y29kZT5jb250cm9sQ2hhbmdlPC9jb2RlPlxuXHQgKiBAcGFyYW0gcmVhc29uIFJlYXNvbiB3aHkgdGhlIG1ldGhvZCB3YXMgaW52b2tlZFxuXHQgKiBAcGFyYW0gY29uZmlnIEN1cnJlbnQgY29uZmlndXJhdGlvbiBwcm92aWRlZCBieSB0aGUgY2FsbGluZyBjb250cm9sXG5cdCAqIEBzaW5jZSAxLjEwMS4wXG5cdCAqL1xuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdG9uQ29uZGl0aW9uUHJvcGFnYXRpb246IGZ1bmN0aW9uIChwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLCB2YWx1ZUhlbHA6IFZhbHVlSGVscCwgcmVhc29uOiBzdHJpbmcsIGNvbmZpZzogYW55KSB7XG5cdFx0aWYgKHJlYXNvbiAhPT0gXCJDb250cm9sQ2hhbmdlXCIpIHtcblx0XHRcdC8qIGhhbmRsZSBvbmx5IENvbnRyb2xDaGFuZ2UgcmVhc29uICovXG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHF1YWxpZmllciA9IHBheWxvYWQucXVhbGlmaWVyc1twYXlsb2FkLnZhbHVlSGVscFF1YWxpZmllcl07XG5cdFx0Y29uc3Qgb3V0UGFyYW1ldGVycyA9IChxdWFsaWZpZXI/LnZoUGFyYW1ldGVycyAmJiBWYWx1ZUxpc3RIZWxwZXJOZXcuZ2V0T3V0UGFyYW1ldGVycyhxdWFsaWZpZXIudmhQYXJhbWV0ZXJzKSkgfHwgW10sXG5cdFx0XHRmaWVsZCA9IHZhbHVlSGVscC5nZXRDb250cm9sKCkgYXMgRmllbGRCYXNlLFxuXHRcdFx0ZmlsdGVyQmFyID0gZmllbGQuZ2V0UGFyZW50KCkgYXMgRmlsdGVyQmFyQmFzZSxcblx0XHRcdGZpbHRlckJhclZIID0gdmFsdWVIZWxwLmdldFBhcmVudCgpIGFzIEZpbHRlckJhckJhc2U7XG5cdFx0Y29uc3QgZmlsdGVySXRlbXNWSCA9IChmaWx0ZXJCYXJWSC5pc0EoRmVDb3JlQ29udHJvbHNGaWx0ZXJCYXIpIGFzIEJvb2xlYW4pICYmIGZpbHRlckJhclZILmdldEZpbHRlckl0ZW1zKCk7XG5cdFx0bGV0IGFjb25kaXRpb25zID0gZmllbGQuZ2V0Q29uZGl0aW9ucygpIGFzIENvbmRpdGlvbk9iamVjdFtdO1xuXHRcdGFjb25kaXRpb25zID0gYWNvbmRpdGlvbnMuZmlsdGVyKGZ1bmN0aW9uIChjb25kaXRpb24pIHtcblx0XHRcdGNvbnN0IGNvbmRpdGlvblBheWxvYWRNYXAgPSAoY29uZGl0aW9uLnBheWxvYWQgJiYgKGNvbmRpdGlvbi5wYXlsb2FkIGFzIENvbmRpdGlvblBheWxvYWRNYXApKSB8fCB7fTtcblx0XHRcdHJldHVybiBjb25kaXRpb25QYXlsb2FkTWFwW3BheWxvYWQudmFsdWVIZWxwUXVhbGlmaWVyXTtcblx0XHR9KTtcblxuXHRcdGlmIChmaWx0ZXJCYXIuaXNBKE1kY0ZpbHRlcmJhckZpbHRlckJhckJhc2UpKSB7XG5cdFx0XHRTdGF0ZVV0aWwucmV0cmlldmVFeHRlcm5hbFN0YXRlKGZpbHRlckJhcilcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHN0YXRlOiBFeHRlcm5hbFN0YXRlVHlwZSkge1xuXHRcdFx0XHRcdGFjb25kaXRpb25zLmZvckVhY2goZnVuY3Rpb24gKGNvbmRpdGlvbikge1xuXHRcdFx0XHRcdFx0Y29uc3QgY29uZGl0aW9uUGF5bG9hZE1hcCA9IGNvbmRpdGlvbi5wYXlsb2FkIGFzIENvbmRpdGlvblBheWxvYWRNYXAsXG5cdFx0XHRcdFx0XHRcdGFLZXlzID0gY29uZGl0aW9uUGF5bG9hZE1hcCAmJiBPYmplY3Qua2V5cyhjb25kaXRpb25QYXlsb2FkTWFwKSxcblx0XHRcdFx0XHRcdFx0YUNvbmRpdGlvblBheWxvYWQgPSBvdXRQYXJhbWV0ZXJzLmxlbmd0aCAmJiAhIWFLZXlzID8gY29uZGl0aW9uUGF5bG9hZE1hcFthS2V5c1swXV0gOiBbXTtcblx0XHRcdFx0XHRcdGlmICghYUNvbmRpdGlvblBheWxvYWQpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Zm9yIChjb25zdCBvdXRQYXJhbWV0ZXIgb2Ygb3V0UGFyYW1ldGVycykge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBmaWx0ZXJUYXJnZXQgPSBvdXRQYXJhbWV0ZXIuc291cmNlLnNwbGl0KFwiL1wiKS5wb3AoKSB8fCBcIlwiO1xuXHRcdFx0XHRcdFx0XHQvKiBQcm9wYWdhdGUgT3V0LVBhcmFtZXRlciBvbmx5IGlmIGZpbHRlciBmaWVsZCB2aXNpYmxlIGluIHRoZSBMUi1GaWx0ZXJiYXIgKi9cblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdC8qIExSIEZpbHRlckJhciBvciAvKiBMUiBBZGFwdEZpbHRlciAqL1xuXHRcdFx0XHRcdFx0XHRcdGZpbHRlckl0ZW1zVkggJiZcblx0XHRcdFx0XHRcdFx0XHRmaWx0ZXJJdGVtc1ZILmZpbmQoKGl0ZW0pID0+IGl0ZW0uZ2V0SWQoKS5zcGxpdChcIjo6XCIpLnBvcCgpID09PSBmaWx0ZXJUYXJnZXQpXG5cdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdGFDb25kaXRpb25QYXlsb2FkLmZvckVhY2goZnVuY3Rpb24gKGNvbmRpdGlvblBheWxvYWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IG5ld0NvbmRpdGlvbiA9IENvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24oXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFwiRVFcIixcblx0XHRcdFx0XHRcdFx0XHRcdFx0W2NvbmRpdGlvblBheWxvYWRbb3V0UGFyYW1ldGVyLmhlbHBQYXRoXV0sXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdENvbmRpdGlvblZhbGlkYXRlZC5WYWxpZGF0ZWRcblx0XHRcdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRzdGF0ZS5maWx0ZXJbZmlsdGVyVGFyZ2V0XSA9IChzdGF0ZS5maWx0ZXIgJiYgc3RhdGUuZmlsdGVyW2ZpbHRlclRhcmdldF0pIHx8IFtdO1xuXHRcdFx0XHRcdFx0XHRcdFx0c3RhdGUuZmlsdGVyW2ZpbHRlclRhcmdldF0ucHVzaChuZXdDb25kaXRpb24pO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8qIExSIFNldHRpbmdzRGlhbG9nIG9yIE9QIFNldHRpbmdzRGlhbG9nIHNoYWxsIG5vdCBwcm9wYWdhdGUgdmFsdWUgdG8gdGhlIGRpYWxvZy1maWx0ZXJmaWVsZHMgKi9cblx0XHRcdFx0XHRcdFx0LyogT1AgU2V0dGluZ3MgRGlhbG9nIHNoYWxsIG5vdCBwcm9wYWdhdGUgdmFsdWUgdG8gY29udGV4dCAqL1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFN0YXRlVXRpbC5hcHBseUV4dGVybmFsU3RhdGUoZmlsdGVyQmFyLCBzdGF0ZSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoZXJyOiBFcnJvcikge1xuXHRcdFx0XHRcdExvZy5lcnJvcihgVmFsdWVIZWxwRGVsZWdhdGU6ICR7ZXJyLm1lc3NhZ2V9YCk7XG5cdFx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhY29uZGl0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChjb25kaXRpb24pIHtcblx0XHRcdFx0Y29uc3QgY29uZGl0aW9uUGF5bG9hZE1hcCA9IGNvbmRpdGlvbi5wYXlsb2FkIGFzIENvbmRpdGlvblBheWxvYWRNYXAsXG5cdFx0XHRcdFx0YUtleXMgPSBjb25kaXRpb25QYXlsb2FkTWFwICYmIE9iamVjdC5rZXlzKGNvbmRpdGlvblBheWxvYWRNYXApLFxuXHRcdFx0XHRcdGFDb25kaXRpb25QYXlsb2FkID0gb3V0UGFyYW1ldGVycy5sZW5ndGggJiYgISFhS2V5cyA/IGNvbmRpdGlvblBheWxvYWRNYXBbYUtleXNbMF1dIDogW107XG5cdFx0XHRcdGlmICghYUNvbmRpdGlvblBheWxvYWQpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgY29udGV4dCA9IHZhbHVlSGVscC5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0XHRpZiAoY29udGV4dCkge1xuXHRcdFx0XHRcdG91dFBhcmFtZXRlcnMuZm9yRWFjaChmdW5jdGlvbiAob3V0UGFyYW1ldGVyKSB7XG5cdFx0XHRcdFx0XHRjb25zdCB0YXJnZXQgPSBvdXRQYXJhbWV0ZXIuc291cmNlO1xuXHRcdFx0XHRcdFx0aWYgKGFDb25kaXRpb25QYXlsb2FkPy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb3V0VmFsdWVzID0gYUNvbmRpdGlvblBheWxvYWRbMF07XG5cdFx0XHRcdFx0XHRcdChjb250ZXh0IGFzIEludGVybmFsTW9kZWxDb250ZXh0KS5zZXRQcm9wZXJ0eSh0YXJnZXQsIG91dFZhbHVlc1tvdXRQYXJhbWV0ZXIuaGVscFBhdGhdKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoYUNvbmRpdGlvblBheWxvYWQ/Lmxlbmd0aCAmJiBhQ29uZGl0aW9uUGF5bG9hZD8ubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdFx0XHRMb2cud2FybmluZyhcIlZhbHVlSGVscERlbGVnYXRlOiBQYXJhbXRlck91dCBpbiBtdWx0aS12YWx1ZS1maWVsZCBub3Qgc3VwcG9ydGVkXCIpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0X2NyZWF0ZUluaXRpYWxGaWx0ZXJDb25kaXRpb246IGZ1bmN0aW9uICh2YWx1ZTogYW55LCBpbml0aWFsVmFsdWVGaWx0ZXJFbXB0eTogYm9vbGVhbikge1xuXHRcdGxldCBjb25kaXRpb246IENvbmRpdGlvbk9iamVjdCB8IHVuZGVmaW5lZDtcblxuXHRcdGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkIHx8IHZhbHVlID09PSBudWxsKSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJWYWx1ZUhlbHBEZWxlZ2F0ZTogdmFsdWUgb2YgdGhlIHByb3BlcnR5IGNvdWxkIG5vdCBiZSByZXF1ZXN0ZWRcIik7XG5cdFx0fSBlbHNlIGlmICh2YWx1ZSA9PT0gXCJcIikge1xuXHRcdFx0aWYgKGluaXRpYWxWYWx1ZUZpbHRlckVtcHR5KSB7XG5cdFx0XHRcdGNvbmRpdGlvbiA9IENvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24oXCJFbXB0eVwiLCBbXSwgbnVsbCwgbnVsbCwgQ29uZGl0aW9uVmFsaWRhdGVkLlZhbGlkYXRlZCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbmRpdGlvbiA9IENvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24oXCJFUVwiLCBbdmFsdWVdLCBudWxsLCBudWxsLCBDb25kaXRpb25WYWxpZGF0ZWQuVmFsaWRhdGVkKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbmRpdGlvbjtcblx0fSxcblxuXHRfZ2V0SW5pdGlhbEZpbHRlckNvbmRpdGlvbnNGcm9tQmluZGluZzogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdGluQ29uZGl0aW9uczogQ29uZGl0aW9uT2JqZWN0TWFwLFxuXHRcdGNvbnRyb2w6IENvbnRyb2wsXG5cdFx0aW5QYXJhbWV0ZXJzOiBJbk91dFBhcmFtZXRlcltdXG5cdCkge1xuXHRcdGNvbnN0IHByb3BlcnRpZXNUb1JlcXVlc3QgPSBpblBhcmFtZXRlcnMubWFwKChpblBhcmFtZXRlcikgPT4gaW5QYXJhbWV0ZXIuc291cmNlKTtcblx0XHRjb25zdCBiaW5kaW5nQ29udGV4dCA9IGNvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0O1xuXG5cdFx0aWYgKCFiaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0TG9nLmVycm9yKFwiVmFsdWVIZWxwRGVsZWdhdGU6IE5vIEJpbmRpbmdDb250ZXh0XCIpO1xuXHRcdFx0cmV0dXJuIGluQ29uZGl0aW9ucztcblx0XHR9XG5cblx0XHQvLyBBY2NvcmRpbmcgdG8gb2RhdGEgdjQgYXBpIGRvY3VtZW50YXRpb24gZm9yIHJlcXVlc3RQcm9wZXJ0eTogUHJvcGVydHkgdmFsdWVzIHRoYXQgYXJlIG5vdCBjYWNoZWQgeWV0IGFyZSByZXF1ZXN0ZWQgZnJvbSB0aGUgYmFjayBlbmRcblx0XHRjb25zdCB2YWx1ZXMgPSBhd2FpdCBiaW5kaW5nQ29udGV4dC5yZXF1ZXN0UHJvcGVydHkocHJvcGVydGllc1RvUmVxdWVzdCk7XG5cblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGluUGFyYW1ldGVycy5sZW5ndGg7IGkrKykge1xuXHRcdFx0Y29uc3QgaW5QYXJhbWV0ZXIgPSBpblBhcmFtZXRlcnNbaV07XG5cdFx0XHRjb25zdCBjb25kaXRpb24gPSB0aGlzLl9jcmVhdGVJbml0aWFsRmlsdGVyQ29uZGl0aW9uKHZhbHVlc1tpXSwgaW5QYXJhbWV0ZXIuaW5pdGlhbFZhbHVlRmlsdGVyRW1wdHkpO1xuXG5cdFx0XHRpZiAoY29uZGl0aW9uKSB7XG5cdFx0XHRcdGluQ29uZGl0aW9uc1tpblBhcmFtZXRlci5oZWxwUGF0aF0gPSBbY29uZGl0aW9uXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGluQ29uZGl0aW9ucztcblx0fSxcblxuXHRfZ2V0SW5pdGlhbEZpbHRlckNvbmRpdGlvbnNGcm9tRmlsdGVyQmFyOiBhc3luYyBmdW5jdGlvbiAoXG5cdFx0aW5Db25kaXRpb25zOiBDb25kaXRpb25PYmplY3RNYXAsXG5cdFx0Y29udHJvbDogQ29udHJvbCxcblx0XHRpblBhcmFtZXRlcnM6IEluT3V0UGFyYW1ldGVyW11cblx0KSB7XG5cdFx0Y29uc3QgZmlsdGVyQmFyID0gY29udHJvbC5nZXRQYXJlbnQoKSBhcyBGaWx0ZXJCYXJCYXNlO1xuXHRcdGNvbnN0IHN0YXRlOiBFeHRlcm5hbFN0YXRlVHlwZSA9IGF3YWl0IFN0YXRlVXRpbC5yZXRyaWV2ZUV4dGVybmFsU3RhdGUoZmlsdGVyQmFyKTtcblxuXHRcdGZvciAoY29uc3QgaW5QYXJhbWV0ZXIgb2YgaW5QYXJhbWV0ZXJzKSB7XG5cdFx0XHRjb25zdCBzb3VyY2VGaWVsZCA9IGluUGFyYW1ldGVyLnNvdXJjZS5zcGxpdChcIi9cIikucG9wKCkgYXMgc3RyaW5nO1xuXHRcdFx0Y29uc3QgY29uZGl0aW9ucyA9IHN0YXRlLmZpbHRlcltzb3VyY2VGaWVsZF07XG5cblx0XHRcdGlmIChjb25kaXRpb25zKSB7XG5cdFx0XHRcdGluQ29uZGl0aW9uc1tpblBhcmFtZXRlci5oZWxwUGF0aF0gPSBjb25kaXRpb25zO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gaW5Db25kaXRpb25zO1xuXHR9LFxuXG5cdF9wYXJ0aXRpb25JblBhcmFtZXRlcnM6IGZ1bmN0aW9uIChpblBhcmFtZXRlcnM6IEluT3V0UGFyYW1ldGVyW10pIHtcblx0XHRjb25zdCBpblBhcmFtZXRlck1hcDogUmVjb3JkPHN0cmluZywgSW5PdXRQYXJhbWV0ZXJbXT4gPSB7XG5cdFx0XHRjb25zdGFudDogW10sXG5cdFx0XHRiaW5kaW5nOiBbXSxcblx0XHRcdGZpbHRlcjogW11cblx0XHR9O1xuXG5cdFx0Zm9yIChjb25zdCBpblBhcmFtZXRlciBvZiBpblBhcmFtZXRlcnMpIHtcblx0XHRcdGlmIChpblBhcmFtZXRlci5jb25zdGFudFZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0aW5QYXJhbWV0ZXJNYXAuY29uc3RhbnQucHVzaChpblBhcmFtZXRlcik7XG5cdFx0XHR9IGVsc2UgaWYgKGluUGFyYW1ldGVyLnNvdXJjZS5pbmRleE9mKFwiJGZpbHRlclwiKSA9PT0gMCkge1xuXHRcdFx0XHRpblBhcmFtZXRlck1hcC5maWx0ZXIucHVzaChpblBhcmFtZXRlcik7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRpblBhcmFtZXRlck1hcC5iaW5kaW5nLnB1c2goaW5QYXJhbWV0ZXIpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gaW5QYXJhbWV0ZXJNYXA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIGFuIGluaXRpYWwgY29uZGl0aW9uIGNvbmZpZ3VyYXRpb24gZXZlcnl0aW1lIGEgdmFsdWUgaGVscCBjb250ZW50IGlzIHNob3duLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF5bG9hZCBQYXlsb2FkIGZvciBkZWxlZ2F0ZVxuXHQgKiBAcGFyYW0gY29udGVudCBWYWx1ZUhlbHAgY29udGVudCByZXF1ZXN0aW5nIGNvbmRpdGlvbnMgY29uZmlndXJhdGlvblxuXHQgKiBAcGFyYW0gY29udHJvbCBJbnN0YW5jZSBvZiB0aGUgY2FsbGluZyBjb250cm9sXG5cdCAqIEByZXR1cm5zIFJldHVybnMgYSBtYXAgb2YgY29uZGl0aW9ucyBzdWl0YWJsZSBmb3IgYSBzYXAudWkubWRjLkZpbHRlckJhciBjb250cm9sXG5cdCAqIEBzaW5jZSAxLjEwMS4wXG5cdCAqL1xuXHRnZXRJbml0aWFsRmlsdGVyQ29uZGl0aW9uczogYXN5bmMgZnVuY3Rpb24gKHBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWQsIGNvbnRlbnQ6IENvbnRlbnQsIGNvbnRyb2w6IENvbnRyb2wgfCB1bmRlZmluZWQpIHtcblx0XHQvLyBoaWdobGlnaHQgdGV4dCBpbiBWYWx1ZUhlbHAgcG9wb3ZlclxuXHRcdGlmIChjb250ZW50Py5pc0EoXCJzYXAudWkubWRjLnZhbHVlaGVscC5jb250ZW50Lk1UYWJsZVwiKSkge1xuXHRcdFx0Y29uc3Qgb1BvcG92ZXJUYWJsZSA9IChjb250ZW50IGFzIE1UYWJsZSkuZ2V0VGFibGUoKTtcblx0XHRcdG9Qb3BvdmVyVGFibGU/LnJlbW92ZUV2ZW50RGVsZWdhdGUob0FmdGVyUmVuZGVyRGVsZWdhdGUpO1xuXHRcdFx0b1BvcG92ZXJUYWJsZT8uYWRkRXZlbnREZWxlZ2F0ZShvQWZ0ZXJSZW5kZXJEZWxlZ2F0ZSwgdGhpcyk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaW5Db25kaXRpb25zOiBDb25kaXRpb25PYmplY3RNYXAgPSB7fTtcblxuXHRcdGlmICghY29udHJvbCkge1xuXHRcdFx0TG9nLmVycm9yKFwiVmFsdWVIZWxwRGVsZWdhdGU6IENvbnRyb2wgdW5kZWZpbmVkXCIpO1xuXHRcdFx0cmV0dXJuIGluQ29uZGl0aW9ucztcblx0XHR9XG5cblx0XHRjb25zdCBxdWFsaWZpZXIgPSBwYXlsb2FkLnF1YWxpZmllcnNbcGF5bG9hZC52YWx1ZUhlbHBRdWFsaWZpZXJdO1xuXHRcdGNvbnN0IGluUGFyYW1ldGVycyA9IChxdWFsaWZpZXIudmhQYXJhbWV0ZXJzICYmIFZhbHVlTGlzdEhlbHBlck5ldy5nZXRJblBhcmFtZXRlcnMocXVhbGlmaWVyLnZoUGFyYW1ldGVycykpIHx8IFtdO1xuXHRcdGNvbnN0IGluUGFyYW1ldGVyTWFwID0gdGhpcy5fcGFydGl0aW9uSW5QYXJhbWV0ZXJzKGluUGFyYW1ldGVycyk7XG5cdFx0Y29uc3QgaXNPYmplY3RQYWdlID0gY29udHJvbC5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXG5cdFx0Zm9yIChjb25zdCBpblBhcmFtZXRlciBvZiBpblBhcmFtZXRlck1hcC5jb25zdGFudCkge1xuXHRcdFx0Y29uc3QgY29uZGl0aW9uID0gdGhpcy5fY3JlYXRlSW5pdGlhbEZpbHRlckNvbmRpdGlvbihcblx0XHRcdFx0aW5QYXJhbWV0ZXIuY29uc3RhbnRWYWx1ZSxcblx0XHRcdFx0aXNPYmplY3RQYWdlID8gaW5QYXJhbWV0ZXIuaW5pdGlhbFZhbHVlRmlsdGVyRW1wdHkgOiBmYWxzZSAvLyBubyBmaWx0ZXIgd2l0aCBcImVtcHR5XCIgb24gTGlzdFJlcG9ydFxuXHRcdFx0KTtcblx0XHRcdGlmIChjb25kaXRpb24pIHtcblx0XHRcdFx0aW5Db25kaXRpb25zW2luUGFyYW1ldGVyLmhlbHBQYXRoXSA9IFtjb25kaXRpb25dO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChpblBhcmFtZXRlck1hcC5iaW5kaW5nLmxlbmd0aCkge1xuXHRcdFx0YXdhaXQgdGhpcy5fZ2V0SW5pdGlhbEZpbHRlckNvbmRpdGlvbnNGcm9tQmluZGluZyhpbkNvbmRpdGlvbnMsIGNvbnRyb2wsIGluUGFyYW1ldGVyTWFwLmJpbmRpbmcpO1xuXHRcdH1cblxuXHRcdGlmIChpblBhcmFtZXRlck1hcC5maWx0ZXIubGVuZ3RoKSB7XG5cdFx0XHRhd2FpdCB0aGlzLl9nZXRJbml0aWFsRmlsdGVyQ29uZGl0aW9uc0Zyb21GaWx0ZXJCYXIoaW5Db25kaXRpb25zLCBjb250cm9sLCBpblBhcmFtZXRlck1hcC5maWx0ZXIpO1xuXHRcdH1cblx0XHRyZXR1cm4gaW5Db25kaXRpb25zO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBQcm92aWRlcyB0aGUgcG9zc2liaWxpdHkgdG8gY29udmV5IGN1c3RvbSBkYXRhIGluIGNvbmRpdGlvbnMuXG5cdCAqIFRoaXMgZW5hYmxlcyBhbiBhcHBsaWNhdGlvbiB0byBlbmhhbmNlIGNvbmRpdGlvbnMgd2l0aCBkYXRhIHJlbGV2YW50IGZvciBjb21iaW5lZCBrZXkgb3Igb3V0cGFyYW1ldGVyIHNjZW5hcmlvcy5cblx0ICpcblx0ICogQHBhcmFtIHBheWxvYWQgUGF5bG9hZCBmb3IgZGVsZWdhdGVcblx0ICogQHBhcmFtIGNvbnRlbnQgVmFsdWVIZWxwIGNvbnRlbnQgaW5zdGFuY2Vcblx0ICogQHBhcmFtIHZhbHVlcyBEZXNjcmlwdGlvbiBwYWlyIGZvciB0aGUgY29uZGl0aW9uIHdoaWNoIGlzIHRvIGJlIGNyZWF0ZWRcblx0ICogQHBhcmFtIGNvbnRleHQgT3B0aW9uYWwgYWRkaXRpb25hbCBjb250ZXh0XG5cdCAqIEByZXR1cm5zIE9wdGlvbmFsbHkgcmV0dXJucyBhIHNlcmlhbGl6YWJsZSBvYmplY3QgdG8gYmUgc3RvcmVkIGluIHRoZSBjb25kaXRpb24gcGF5bG9hZCBmaWVsZFxuXHQgKiBAc2luY2UgMS4xMDEuMFxuXHQgKi9cblx0Y3JlYXRlQ29uZGl0aW9uUGF5bG9hZDogZnVuY3Rpb24gKFxuXHRcdHBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWQsXG5cdFx0Y29udGVudDogQ29udGVudCxcblx0XHR2YWx1ZXM6IGFueVtdLFxuXHRcdGNvbnRleHQ6IENvbnRleHRcblx0KTogQ29uZGl0aW9uUGF5bG9hZE1hcCB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3QgcXVhbGlmaWVyID0gcGF5bG9hZC5xdWFsaWZpZXJzW3BheWxvYWQudmFsdWVIZWxwUXVhbGlmaWVyXSxcblx0XHRcdGVudHJ5OiBDb25kaXRpb25QYXlsb2FkVHlwZSA9IHt9LFxuXHRcdFx0Y29uZGl0aW9uUGF5bG9hZDogQ29uZGl0aW9uUGF5bG9hZE1hcCA9IHt9O1xuXHRcdGNvbnN0IGNvbnRyb2wgPSBjb250ZW50LmdldENvbnRyb2woKTtcblx0XHRjb25zdCBpc011bHRpVmFsdWVGaWVsZCA9IGNvbnRyb2w/LmlzQShcInNhcC51aS5tZGMuTXVsdGlWYWx1ZUZpZWxkXCIpO1xuXHRcdGlmICghcXVhbGlmaWVyLnZoS2V5cyB8fCBxdWFsaWZpZXIudmhLZXlzLmxlbmd0aCA9PT0gMSB8fCBpc011bHRpVmFsdWVGaWVsZCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cXVhbGlmaWVyLnZoS2V5cy5mb3JFYWNoKGZ1bmN0aW9uICh2aEtleSkge1xuXHRcdFx0Y29uc3QgdmFsdWUgPSBjb250ZXh0LmdldE9iamVjdCh2aEtleSk7XG5cdFx0XHRpZiAodmFsdWUgIT0gbnVsbCkge1xuXHRcdFx0XHRlbnRyeVt2aEtleV0gPSB2YWx1ZT8ubGVuZ3RoID09PSAwID8gXCJcIiA6IHZhbHVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGlmIChPYmplY3Qua2V5cyhlbnRyeSkubGVuZ3RoKSB7XG5cdFx0XHQvKiB2aCBxdWFsaWZpZXIgYXMga2V5IGZvciByZWxldmFudCBjb25kaXRpb24gKi9cblx0XHRcdGNvbmRpdGlvblBheWxvYWRbcGF5bG9hZC52YWx1ZUhlbHBRdWFsaWZpZXJdID0gW2VudHJ5XTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbmRpdGlvblBheWxvYWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoYW5nZXMgdGhlIHNlYXJjaCBzdHJpbmcuXG5cdCAqXG5cdCAqIElmIDxjb2RlPiRzZWFyY2g8L2NvZGU+IGlzIHVzZWQsIGRlcGVuZGluZyBvbiB3aGljaCBiYWNrLWVuZCBzZXJ2aWNlIGlzIHVzZWQsIHRoZSBzZWFyY2ggc3RyaW5nIG1pZ2h0IG5lZWQgdG8gYmUgZXNjYXBlZC5cblx0ICpcblx0ICogQHBhcmFtIHBheWxvYWQgUGF5bG9hZCBmb3IgZGVsZWdhdGVcblx0ICogQHBhcmFtIHR5cGVhaGVhZCBgdHJ1ZWAgaWYgdGhlIHNlYXJjaCBpcyBjYWxsZWQgZm9yIGEgdHlwZS1haGVhZFxuXHQgKiBAcGFyYW0gc2VhcmNoIFNlYXJjaCBzdHJpbmdcblx0ICogQHJldHVybnMgU2VhcmNoIHN0cmluZyB0byB1c2Vcblx0ICovXG5cdGFkanVzdFNlYXJjaDogZnVuY3Rpb24gKHBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWQsIHR5cGVhaGVhZDogYm9vbGVhbiwgc2VhcmNoOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gQ29tbW9uVXRpbHMubm9ybWFsaXplU2VhcmNoVGVybShzZWFyY2gpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBQcm92aWRlcyB0aGUgcG9zc2liaWxpdHkgdG8gY3VzdG9taXplIHNlbGVjdGlvbnMgaW4gJ1NlbGVjdCBmcm9tIGxpc3QnIHNjZW5hcmlvcy5cblx0ICogQnkgZGVmYXVsdCwgb25seSBjb25kaXRpb24ga2V5cyBhcmUgY29uc2lkZXJlZC4gVGhpcyBtYXkgYmUgZXh0ZW5kZWQgd2l0aCBwYXlsb2FkIGRlcGVuZGVudCBmaWx0ZXJzLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF5bG9hZCBQYXlsb2FkIGZvciBkZWxlZ2F0ZVxuXHQgKiBAcGFyYW0gY29udGVudCBWYWx1ZUhlbHAgY29udGVudCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gaXRlbSBFbnRyeSBvZiBhIGdpdmVuIGxpc3Rcblx0ICogQHBhcmFtIGNvbmRpdGlvbnMgQ3VycmVudCBjb25kaXRpb25zXG5cdCAqIEByZXR1cm5zIFRydWUsIGlmIGl0ZW0gaXMgc2VsZWN0ZWRcblx0ICogQHNpbmNlIDEuMTAxLjBcblx0ICovXG5cdGlzRmlsdGVyYWJsZUxpc3RJdGVtU2VsZWN0ZWQ6IGZ1bmN0aW9uIChwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLCBjb250ZW50OiBDb250ZW50LCBpdGVtOiBDb250cm9sLCBjb25kaXRpb25zOiBDb25kaXRpb25PYmplY3RbXSkge1xuXHRcdC8vSW4gdmFsdWUgaGVscCBkaWFsb2dzIG9mIHNpbmdsZSB2YWx1ZSBmaWVsZHMgdGhlIHJvdyBmb3IgdGhlIGtleSBzaG91bGRuwrR0IGJlIHNlbGVjdGVkL2hpZ2hsaWdodCBhbnltb3JlIEJDUDogMjI3MDE3NTI0NlxuXHRcdGlmICghcGF5bG9hZC5pc1ZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyAmJiBjb250ZW50LmdldENvbmZpZygpPy5tYXhDb25kaXRpb25zID09PSAxKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Y29uc3QgY29udGV4dCA9IGl0ZW0uZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRjb25zdCBzZWxlY3RlZENvbmRpdGlvbiA9IGNvbmRpdGlvbnMuZmluZChmdW5jdGlvbiAoY29uZGl0aW9uKSB7XG5cdFx0XHRjb25zdCBjb25kaXRpb25QYXlsb2FkTWFwID0gY29uZGl0aW9uLnBheWxvYWQgYXMgQ29uZGl0aW9uUGF5bG9hZE1hcCxcblx0XHRcdFx0dmFsdWVIZWxwUXVhbGlmaWVyID0gcGF5bG9hZC52YWx1ZUhlbHBRdWFsaWZpZXIgfHwgXCJcIjtcblx0XHRcdGlmICghY29uZGl0aW9uUGF5bG9hZE1hcCAmJiBPYmplY3Qua2V5cyhwYXlsb2FkLnF1YWxpZmllcnMpWzBdID09PSB2YWx1ZUhlbHBRdWFsaWZpZXIpIHtcblx0XHRcdFx0Y29uc3Qga2V5UGF0aCA9IGNvbnRlbnQuZ2V0S2V5UGF0aCgpO1xuXHRcdFx0XHRyZXR1cm4gY29udGV4dD8uZ2V0T2JqZWN0KGtleVBhdGgpID09PSBjb25kaXRpb24/LnZhbHVlc1swXTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IGNvbmRpdGlvblNlbGVjdGVkUm93ID0gY29uZGl0aW9uUGF5bG9hZE1hcD8uW3ZhbHVlSGVscFF1YWxpZmllcl0/LlswXSB8fCB7fSxcblx0XHRcdFx0c2VsZWN0ZWRLZXlzID0gT2JqZWN0LmtleXMoY29uZGl0aW9uU2VsZWN0ZWRSb3cpO1xuXHRcdFx0aWYgKHNlbGVjdGVkS2V5cy5sZW5ndGgpIHtcblx0XHRcdFx0cmV0dXJuIHNlbGVjdGVkS2V5cy5ldmVyeShmdW5jdGlvbiAoa2V5KSB7XG5cdFx0XHRcdFx0cmV0dXJuIChjb25kaXRpb25TZWxlY3RlZFJvd1trZXldIGFzIGFueSkgPT09IGNvbnRleHQ/LmdldE9iamVjdChrZXkpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9KTtcblxuXHRcdHJldHVybiBzZWxlY3RlZENvbmRpdGlvbiA/IHRydWUgOiBmYWxzZTtcblx0fVxufSk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7RUFvQkEsSUFBTUEsdUJBQXVCLEdBQUcsZ0NBQWdDO0VBQ2hFLElBQU1DLHlCQUF5QixHQUFHLG9DQUFvQztFQUN0RSxJQUFNQyxvQkFBb0IsR0FBRztJQUM1QkMsZ0JBQWdCLEVBQUUsWUFBMEI7TUFBQSxrQ0FBYkMsSUFBSTtRQUFKQSxJQUFJO01BQUE7TUFDbEMsSUFBTUMsTUFBTSxHQUFHRCxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUNFLFVBQVU7TUFDakMsSUFBTUMsaUJBQWlCLEdBQUdGLE1BQU0sQ0FBQ0csQ0FBQyxFQUFFLENBQUNDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztNQUM1REMsb0JBQW9CLENBQUNILGlCQUFpQixFQUFFRixNQUFNLENBQUNNLFNBQVMsRUFBRSxDQUFDQyxjQUFjLEVBQUUsRUFBRSxJQUFJLENBQUM7SUFDbkY7RUFDRCxDQUFDO0VBQUMsT0FhYUMsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVDLGlCQUFpQixFQUFFO0lBQ25EO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsZUFBZSxFQUFFLFVBQVVDLE9BQXlCLEVBQUVDLFNBQW9CLEVBQUVDLFNBQWlCLEVBQUU7TUFDOUYsT0FBT0Msa0JBQWtCLENBQUNDLGFBQWEsQ0FB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