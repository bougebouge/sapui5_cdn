/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/SemanticDateOperators", "sap/ui/base/ManagedObjectObserver", "sap/ui/core/Control", "sap/ui/mdc/condition/Condition", "sap/ui/mdc/enum/ConditionValidated", "sap/ui/mdc/field/ConditionsType", "sap/ui/model/json/JSONModel"], function (ClassSupport, SemanticDateOperators, ManagedObjectObserver, Control, Condition, ConditionValidated, ConditionsType, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _class3;
  var _exports = {};
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * @class
   * Creates an <code>sap.fe.core.controls.CustomFilterFieldContentWrapper</code> object.
   * This is used in the {@link sap.ui.mdc.FilterField FilterField} as a filter content.
   * @extends sap.ui.core.Control
   * @private
   * @alias sap.fe.core.controls.CustomFilterFieldContentWrapper
   */
  var CustomFilterFieldContentWrapper = (_dec = defineUI5Class("sap.fe.core.controls.CustomFilterFieldContentWrapper"), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "sap.ui.core.CSSSize",
    defaultValue: null
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = property({
    type: "object[]",
    defaultValue: []
  }), _dec6 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec7 = event(), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(CustomFilterFieldContentWrapper, _Control);
    function CustomFilterFieldContentWrapper() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call.apply(_Control, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "width", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formDoNotAdjustWidth", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "conditions", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "conditionsChange", _descriptor6, _assertThisInitialized(_this));
      return _this;
    }
    _exports = CustomFilterFieldContentWrapper;
    CustomFilterFieldContentWrapper.render = function render(renderManager, control) {
      renderManager.openStart("div", control);
      renderManager.style("min-height", "1rem");
      renderManager.style("width", control.width);
      renderManager.openEnd();
      renderManager.renderControl(control.getContent()); // render the child Control
      renderManager.close("div"); // end of the complete Control
    }

    /**
     * Maps an array of filter values to an array of conditions.
     *
     * @param filterValues Array of filter value bindings or a filter value string
     * @param [operator] The operator to be used (optional) - if not set, the default operator (EQ) will be used
     * @private
     * @returns Array of filter conditions
     */;
    CustomFilterFieldContentWrapper._filterValuesToConditions = function _filterValuesToConditions(filterValues, operator) {
      var formatOptions = {
          operators: []
        },
        conditions = [];
      if (operator) {
        formatOptions = {
          operators: [operator]
        };
      }
      if (filterValues === "") {
        filterValues = [];
      } else if (typeof filterValues === "object" && filterValues.hasOwnProperty("operator") && filterValues.hasOwnProperty("values")) {
        formatOptions = {
          operators: [filterValues.operator]
        };
        filterValues = filterValues.values;
      } else if (filterValues !== undefined && typeof filterValues !== "object" && typeof filterValues !== "string") {
        throw new Error("FilterUtils.js#_filterValuesToConditions: Unexpected type of input parameter vValues: ".concat(typeof filterValues));
      }
      var conditionsType = new ConditionsType(formatOptions);
      var conditionValues = Array.isArray(filterValues) ? filterValues : [filterValues];

      // Shortcut for operator without values and semantic date operations
      if (typeof operator === "string" && SemanticDateOperators.getSemanticDateOperations().includes(operator)) {
        conditions = [Condition.createCondition(operator, conditionValues, null, null, ConditionValidated.NotValidated)];
      } else {
        conditions = conditionValues.map(function (conditionValue) {
          var stringValue = conditionValue === null || conditionValue === void 0 ? void 0 : conditionValue.toString(),
            parsedConditions = conditionsType.parseValue(stringValue, "any");
          return parsedConditions === null || parsedConditions === void 0 ? void 0 : parsedConditions[0];
        }).filter(function (conditionValue) {
          return conditionValue !== undefined;
        });
      }
      return conditions;
    }

    /**
     * Maps an array of conditions to a comma separated list of filter values.
     *
     * @param conditions Array of filter conditions
     * @param formatOptions Format options that specifies a condition type
     * @private
     * @returns Concatenated string of filter values
     */;
    CustomFilterFieldContentWrapper._conditionsToFilterModelString = function _conditionsToFilterModelString(conditions, formatOptions) {
      var conditionsType = new ConditionsType(formatOptions);
      return conditions.map(function (condition) {
        return conditionsType.formatValue([condition], "any") || "";
      }).filter(function (stringValue) {
        return stringValue !== "";
      }).join(",");
    }

    /**
     * Listens to filter model changes and updates wrapper property "conditions".
     *
     * @param changeEvent Event triggered by a filter model change
     * @private
     */;
    var _proto = CustomFilterFieldContentWrapper.prototype;
    _proto._handleFilterModelChange = function _handleFilterModelChange(changeEvent) {
      var propertyPath = this.getObjectBinding("filterValues").getPath(),
        values = changeEvent.getSource().getProperty(propertyPath);
      this.updateConditionsByFilterValues(values);
    }

    /**
     * Listens to "conditions" changes and updates the filter model.
     *
     * @param conditions Event triggered by a "conditions" change
     * @private
     */;
    _proto._handleConditionsChange = function _handleConditionsChange(conditions) {
      this.updateFilterModelByConditions(conditions);
    }

    /**
     * Initialize CustomFilterFieldContentWrapper control and register observer.
     */;
    _proto.init = function init() {
      _Control.prototype.init.call(this);
      this._conditionsObserver = new ManagedObjectObserver(this._observeChanges.bind(this));
      this._conditionsObserver.observe(this, {
        properties: ["conditions"]
      });
      this._filterModel = new JSONModel();
      this._filterModel.attachPropertyChange(this._handleFilterModelChange, this);
      this.setModel(this._filterModel, CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS);
    }

    /**
     * Overrides {@link sap.ui.core.Control#clone Control.clone} to clone additional
     * internal states.
     *
     * @param [sIdSuffix] A suffix to be appended to the cloned control id
     * @param [aLocalIds] An array of local IDs within the cloned hierarchy (internally used)
     * @returns Reference to the newly created clone
     * @protected
     */;
    _proto.clone = function clone(sIdSuffix, aLocalIds) {
      var clone = _Control.prototype.clone.call(this, sIdSuffix, aLocalIds);
      // During cloning, the old model will be copied and overwrites any new model (same alias) that
      // you introduce during init(); hence you need to overwrite it again by the new one that you've
      // created during init() (i.e. clone._filterModel); that standard behaviour of super.clone()
      // can't even be suppressed in an own constructor; for a detailed investigation of the cloning,
      // please overwrite the setModel() method and check the list of callers and steps induced by them.
      clone.setModel(clone._filterModel, CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS);
      return clone;
    }

    /**
     * Listens to property changes.
     *
     * @param changes Property changes
     * @private
     */;
    _proto._observeChanges = function _observeChanges(changes) {
      if (changes.name === "conditions") {
        this._handleConditionsChange(changes.current);
      }
    }

    /**
     * Gets the content of this wrapper control.
     *
     * @returns The wrapper content
     * @private
     */;
    _proto.getContent = function getContent() {
      return this.getAggregation("content");
    }

    /**
     * Gets the value for control property 'conditions'.
     *
     * @returns Array of filter conditions
     * @private
     */;
    _proto.getConditions = function getConditions() {
      return this.getProperty("conditions");
    }

    /**
     * Sets the value for control property 'conditions'.
     *
     * @param [conditions] Array of filter conditions
     * @returns Reference to this wrapper
     * @private
     */;
    _proto.setConditions = function setConditions(conditions) {
      this.setProperty("conditions", conditions || []);
      return this;
    }

    /**
     * Gets the filter model alias 'filterValues'.
     *
     * @returns The filter model
     * @private
     */;
    _proto.getFilterModelAlias = function getFilterModelAlias() {
      return CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS;
    }

    /**
     * Updates the property "conditions" with filter values
     * sent by ExtensionAPI#setFilterValues().
     *
     * @param values The filter values
     * @param [operator] The operator name
     * @private
     */;
    _proto.updateConditionsByFilterValues = function updateConditionsByFilterValues(values, operator) {
      var conditions = CustomFilterFieldContentWrapper._filterValuesToConditions(values, operator);
      this.setConditions(conditions);
    }

    /**
     * Updates filter model with conditions
     * sent by the {@link sap.ui.mdc.FilterField FilterField}.
     *
     * @param conditions Array of filter conditions
     * @private
     */;
    _proto.updateFilterModelByConditions = function updateFilterModelByConditions(conditions) {
      var _conditions$;
      var operator = ((_conditions$ = conditions[0]) === null || _conditions$ === void 0 ? void 0 : _conditions$.operator) || "";
      var formatOptions = operator !== "" ? {
        operators: [operator]
      } : {
        operators: []
      };
      if (this.getBindingContext(CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS)) {
        var _this$getBindingConte;
        var stringValue = CustomFilterFieldContentWrapper._conditionsToFilterModelString(conditions, formatOptions);
        this._filterModel.setProperty((_this$getBindingConte = this.getBindingContext(CustomFilterFieldContentWrapper.FILTER_MODEL_ALIAS)) === null || _this$getBindingConte === void 0 ? void 0 : _this$getBindingConte.getPath(), stringValue);
      }
    };
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      var _content$getAccessibi;
      var content = this.getContent();
      return (content === null || content === void 0 ? void 0 : (_content$getAccessibi = content.getAccessibilityInfo) === null || _content$getAccessibi === void 0 ? void 0 : _content$getAccessibi.call(content)) || {};
    }

    /**
     * Returns the DOMNode ID to be used for the "labelFor" attribute.
     *
     * We forward the call of this method to the content control.
     *
     * @returns ID to be used for the <code>labelFor</code>
     */;
    _proto.getIdForLabel = function getIdForLabel() {
      var content = this.getContent();
      return content === null || content === void 0 ? void 0 : content.getIdForLabel();
    };
    return CustomFilterFieldContentWrapper;
  }(Control), _class3.FILTER_MODEL_ALIAS = "filterValues", _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "width", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "formDoNotAdjustWidth", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "conditions", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "conditionsChange", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = CustomFilterFieldContentWrapper;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXN0b21GaWx0ZXJGaWVsZENvbnRlbnRXcmFwcGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJpbXBsZW1lbnRJbnRlcmZhY2UiLCJwcm9wZXJ0eSIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJhZ2dyZWdhdGlvbiIsIm11bHRpcGxlIiwiaXNEZWZhdWx0IiwiZXZlbnQiLCJyZW5kZXIiLCJyZW5kZXJNYW5hZ2VyIiwiY29udHJvbCIsIm9wZW5TdGFydCIsInN0eWxlIiwid2lkdGgiLCJvcGVuRW5kIiwicmVuZGVyQ29udHJvbCIsImdldENvbnRlbnQiLCJjbG9zZSIsIl9maWx0ZXJWYWx1ZXNUb0NvbmRpdGlvbnMiLCJmaWx0ZXJWYWx1ZXMiLCJvcGVyYXRvciIsImZvcm1hdE9wdGlvbnMiLCJvcGVyYXRvcnMiLCJjb25kaXRpb25zIiwiaGFzT3duUHJvcGVydHkiLCJ2YWx1ZXMiLCJ1bmRlZmluZWQiLCJFcnJvciIsImNvbmRpdGlvbnNUeXBlIiwiQ29uZGl0aW9uc1R5cGUiLCJjb25kaXRpb25WYWx1ZXMiLCJBcnJheSIsImlzQXJyYXkiLCJTZW1hbnRpY0RhdGVPcGVyYXRvcnMiLCJnZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zIiwiaW5jbHVkZXMiLCJDb25kaXRpb24iLCJjcmVhdGVDb25kaXRpb24iLCJDb25kaXRpb25WYWxpZGF0ZWQiLCJOb3RWYWxpZGF0ZWQiLCJtYXAiLCJjb25kaXRpb25WYWx1ZSIsInN0cmluZ1ZhbHVlIiwidG9TdHJpbmciLCJwYXJzZWRDb25kaXRpb25zIiwicGFyc2VWYWx1ZSIsImZpbHRlciIsIl9jb25kaXRpb25zVG9GaWx0ZXJNb2RlbFN0cmluZyIsImNvbmRpdGlvbiIsImZvcm1hdFZhbHVlIiwiam9pbiIsIl9oYW5kbGVGaWx0ZXJNb2RlbENoYW5nZSIsImNoYW5nZUV2ZW50IiwicHJvcGVydHlQYXRoIiwiZ2V0T2JqZWN0QmluZGluZyIsImdldFBhdGgiLCJnZXRTb3VyY2UiLCJnZXRQcm9wZXJ0eSIsInVwZGF0ZUNvbmRpdGlvbnNCeUZpbHRlclZhbHVlcyIsIl9oYW5kbGVDb25kaXRpb25zQ2hhbmdlIiwidXBkYXRlRmlsdGVyTW9kZWxCeUNvbmRpdGlvbnMiLCJpbml0IiwiX2NvbmRpdGlvbnNPYnNlcnZlciIsIk1hbmFnZWRPYmplY3RPYnNlcnZlciIsIl9vYnNlcnZlQ2hhbmdlcyIsImJpbmQiLCJvYnNlcnZlIiwicHJvcGVydGllcyIsIl9maWx0ZXJNb2RlbCIsIkpTT05Nb2RlbCIsImF0dGFjaFByb3BlcnR5Q2hhbmdlIiwic2V0TW9kZWwiLCJGSUxURVJfTU9ERUxfQUxJQVMiLCJjbG9uZSIsInNJZFN1ZmZpeCIsImFMb2NhbElkcyIsImNoYW5nZXMiLCJuYW1lIiwiY3VycmVudCIsImdldEFnZ3JlZ2F0aW9uIiwiZ2V0Q29uZGl0aW9ucyIsInNldENvbmRpdGlvbnMiLCJzZXRQcm9wZXJ0eSIsImdldEZpbHRlck1vZGVsQWxpYXMiLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldEFjY2Vzc2liaWxpdHlJbmZvIiwiY29udGVudCIsImdldElkRm9yTGFiZWwiLCJDb250cm9sIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDdXN0b21GaWx0ZXJGaWVsZENvbnRlbnRXcmFwcGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcywgZXZlbnQsIGltcGxlbWVudEludGVyZmFjZSwgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBTZW1hbnRpY0RhdGVPcGVyYXRvcnMgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU2VtYW50aWNEYXRlT3BlcmF0b3JzXCI7XG5pbXBvcnQgTWFuYWdlZE9iamVjdE9ic2VydmVyIGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0T2JzZXJ2ZXJcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7IC8vaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9tZGMvZmllbGQvRmllbGRCYXNlXCI7XG5pbXBvcnQgdHlwZSB7IElGb3JtQ29udGVudCB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBSZW5kZXJNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9SZW5kZXJNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSB7IENvbmRpdGlvbk9iamVjdCB9IGZyb20gXCJzYXAvdWkvbWRjL2NvbmRpdGlvbi9Db25kaXRpb25cIjtcbmltcG9ydCBDb25kaXRpb24gZnJvbSBcInNhcC91aS9tZGMvY29uZGl0aW9uL0NvbmRpdGlvblwiO1xuaW1wb3J0IENvbmRpdGlvblZhbGlkYXRlZCBmcm9tIFwic2FwL3VpL21kYy9lbnVtL0NvbmRpdGlvblZhbGlkYXRlZFwiO1xuaW1wb3J0IENvbmRpdGlvbnNUeXBlIGZyb20gXCJzYXAvdWkvbWRjL2ZpZWxkL0NvbmRpdGlvbnNUeXBlXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcblxuLyoqXG4gKiBUeXBlIHVzZWQgZm9yIGZvcm1hdCBvcHRpb25zXG4gKlxuICogQHR5cGVkZWYgRm9ybWF0T3B0aW9uc1R5cGVcbiAqL1xudHlwZSBGb3JtYXRPcHRpb25zVHlwZSA9IHtcblx0b3BlcmF0b3JzOiBzdHJpbmdbXTtcbn07XG5cbi8qKlxuICogQGNsYXNzXG4gKiBDcmVhdGVzIGFuIDxjb2RlPnNhcC5mZS5jb3JlLmNvbnRyb2xzLkN1c3RvbUZpbHRlckZpZWxkQ29udGVudFdyYXBwZXI8L2NvZGU+IG9iamVjdC5cbiAqIFRoaXMgaXMgdXNlZCBpbiB0aGUge0BsaW5rIHNhcC51aS5tZGMuRmlsdGVyRmllbGQgRmlsdGVyRmllbGR9IGFzIGEgZmlsdGVyIGNvbnRlbnQuXG4gKiBAZXh0ZW5kcyBzYXAudWkuY29yZS5Db250cm9sXG4gKiBAcHJpdmF0ZVxuICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xzLkN1c3RvbUZpbHRlckZpZWxkQ29udGVudFdyYXBwZXJcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuY29udHJvbHMuQ3VzdG9tRmlsdGVyRmllbGRDb250ZW50V3JhcHBlclwiKVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgQ3VzdG9tRmlsdGVyRmllbGRDb250ZW50V3JhcHBlciBleHRlbmRzIENvbnRyb2wgaW1wbGVtZW50cyBJRm9ybUNvbnRlbnQge1xuXHRAaW1wbGVtZW50SW50ZXJmYWNlKFwic2FwLnVpLmNvcmUuSUZvcm1Db250ZW50XCIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2Vcblx0X19pbXBsZW1lbnRzX19zYXBfdWlfY29yZV9JRm9ybUNvbnRlbnQgPSB0cnVlO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic2FwLnVpLmNvcmUuQ1NTU2l6ZVwiLCBkZWZhdWx0VmFsdWU6IG51bGwgfSlcblx0d2lkdGghOiBzdHJpbmc7XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0Zm9ybURvTm90QWRqdXN0V2lkdGghOiBib29sZWFuO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwib2JqZWN0W11cIiwgZGVmYXVsdFZhbHVlOiBbXSB9KVxuXHRjb25kaXRpb25zITogQ29uZGl0aW9uT2JqZWN0W107XG5cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIG11bHRpcGxlOiBmYWxzZSwgaXNEZWZhdWx0OiB0cnVlIH0pXG5cdGNvbnRlbnQhOiBDb250cm9sO1xuXG5cdEBldmVudCgpXG5cdGNvbmRpdGlvbnNDaGFuZ2UhOiBGdW5jdGlvbjtcblxuXHQvLyBOb3RlOiBGaWVsZEJhc2UgbWlnaHQgYmUgdXNlZCBhcyBiYXNlIGNvbnRyb2wgKGluc3RlYWQgb2YgQ29udHJvbCkgaW4gYSBsYXRlciB2ZXJzaW9uO1xuXHQvLyBpbiB0aGF0IGNhc2UsIHlvdSBzaG91bGQgYWRkIGEgJ2NoYW5nZScgZXZlbnQgYW5kIGJ1YmJsZSBpdCB0byB0aGUgY29ycmVzcG9uZGluZyBoYW5kbGVyc1xuXG5cdHByaXZhdGUgX2ZpbHRlck1vZGVsOiBhbnk7XG5cdHByaXZhdGUgX2NvbmRpdGlvbnNPYnNlcnZlcjogYW55O1xuXHRwcml2YXRlIHN0YXRpYyByZWFkb25seSBGSUxURVJfTU9ERUxfQUxJQVMgPSBcImZpbHRlclZhbHVlc1wiO1xuXG5cdHN0YXRpYyByZW5kZXIocmVuZGVyTWFuYWdlcjogUmVuZGVyTWFuYWdlciwgY29udHJvbDogQ3VzdG9tRmlsdGVyRmllbGRDb250ZW50V3JhcHBlcik6IHZvaWQge1xuXHRcdHJlbmRlck1hbmFnZXIub3BlblN0YXJ0KFwiZGl2XCIsIGNvbnRyb2wpO1xuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJtaW4taGVpZ2h0XCIsIFwiMXJlbVwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwid2lkdGhcIiwgY29udHJvbC53aWR0aCk7XG5cdFx0cmVuZGVyTWFuYWdlci5vcGVuRW5kKCk7XG5cdFx0cmVuZGVyTWFuYWdlci5yZW5kZXJDb250cm9sKGNvbnRyb2wuZ2V0Q29udGVudCgpKTsgLy8gcmVuZGVyIHRoZSBjaGlsZCBDb250cm9sXG5cdFx0cmVuZGVyTWFuYWdlci5jbG9zZShcImRpdlwiKTsgLy8gZW5kIG9mIHRoZSBjb21wbGV0ZSBDb250cm9sXG5cdH1cblxuXHQvKipcblx0ICogTWFwcyBhbiBhcnJheSBvZiBmaWx0ZXIgdmFsdWVzIHRvIGFuIGFycmF5IG9mIGNvbmRpdGlvbnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWx0ZXJWYWx1ZXMgQXJyYXkgb2YgZmlsdGVyIHZhbHVlIGJpbmRpbmdzIG9yIGEgZmlsdGVyIHZhbHVlIHN0cmluZ1xuXHQgKiBAcGFyYW0gW29wZXJhdG9yXSBUaGUgb3BlcmF0b3IgdG8gYmUgdXNlZCAob3B0aW9uYWwpIC0gaWYgbm90IHNldCwgdGhlIGRlZmF1bHQgb3BlcmF0b3IgKEVRKSB3aWxsIGJlIHVzZWRcblx0ICogQHByaXZhdGVcblx0ICogQHJldHVybnMgQXJyYXkgb2YgZmlsdGVyIGNvbmRpdGlvbnNcblx0ICovXG5cdHN0YXRpYyBfZmlsdGVyVmFsdWVzVG9Db25kaXRpb25zKGZpbHRlclZhbHVlczogYW55IHwgYW55W10sIG9wZXJhdG9yPzogc3RyaW5nKTogQ29uZGl0aW9uT2JqZWN0W10ge1xuXHRcdGxldCBmb3JtYXRPcHRpb25zOiBGb3JtYXRPcHRpb25zVHlwZSA9IHsgb3BlcmF0b3JzOiBbXSB9LFxuXHRcdFx0Y29uZGl0aW9ucyA9IFtdO1xuXG5cdFx0aWYgKG9wZXJhdG9yKSB7XG5cdFx0XHRmb3JtYXRPcHRpb25zID0geyBvcGVyYXRvcnM6IFtvcGVyYXRvcl0gfTtcblx0XHR9XG5cdFx0aWYgKGZpbHRlclZhbHVlcyA9PT0gXCJcIikge1xuXHRcdFx0ZmlsdGVyVmFsdWVzID0gW107XG5cdFx0fSBlbHNlIGlmICh0eXBlb2YgZmlsdGVyVmFsdWVzID09PSBcIm9iamVjdFwiICYmIGZpbHRlclZhbHVlcy5oYXNPd25Qcm9wZXJ0eShcIm9wZXJhdG9yXCIpICYmIGZpbHRlclZhbHVlcy5oYXNPd25Qcm9wZXJ0eShcInZhbHVlc1wiKSkge1xuXHRcdFx0Zm9ybWF0T3B0aW9ucyA9IHsgb3BlcmF0b3JzOiBbZmlsdGVyVmFsdWVzLm9wZXJhdG9yXSB9O1xuXHRcdFx0ZmlsdGVyVmFsdWVzID0gZmlsdGVyVmFsdWVzLnZhbHVlcztcblx0XHR9IGVsc2UgaWYgKGZpbHRlclZhbHVlcyAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBmaWx0ZXJWYWx1ZXMgIT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIGZpbHRlclZhbHVlcyAhPT0gXCJzdHJpbmdcIikge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBGaWx0ZXJVdGlscy5qcyNfZmlsdGVyVmFsdWVzVG9Db25kaXRpb25zOiBVbmV4cGVjdGVkIHR5cGUgb2YgaW5wdXQgcGFyYW1ldGVyIHZWYWx1ZXM6ICR7dHlwZW9mIGZpbHRlclZhbHVlc31gKTtcblx0XHR9XG5cblx0XHRjb25zdCBjb25kaXRpb25zVHlwZTogYW55ID0gbmV3IENvbmRpdGlvbnNUeXBlKGZvcm1hdE9wdGlvbnMpO1xuXHRcdGNvbnN0IGNvbmRpdGlvblZhbHVlcyA9IEFycmF5LmlzQXJyYXkoZmlsdGVyVmFsdWVzKSA/IGZpbHRlclZhbHVlcyA6IFtmaWx0ZXJWYWx1ZXNdO1xuXG5cdFx0Ly8gU2hvcnRjdXQgZm9yIG9wZXJhdG9yIHdpdGhvdXQgdmFsdWVzIGFuZCBzZW1hbnRpYyBkYXRlIG9wZXJhdGlvbnNcblx0XHRpZiAodHlwZW9mIG9wZXJhdG9yID09PSBcInN0cmluZ1wiICYmIFNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zKCkuaW5jbHVkZXMob3BlcmF0b3IpKSB7XG5cdFx0XHRjb25kaXRpb25zID0gW0NvbmRpdGlvbi5jcmVhdGVDb25kaXRpb24ob3BlcmF0b3IsIGNvbmRpdGlvblZhbHVlcywgbnVsbCwgbnVsbCwgQ29uZGl0aW9uVmFsaWRhdGVkLk5vdFZhbGlkYXRlZCldO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25kaXRpb25zID0gY29uZGl0aW9uVmFsdWVzXG5cdFx0XHRcdC5tYXAoKGNvbmRpdGlvblZhbHVlKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3Qgc3RyaW5nVmFsdWUgPSBjb25kaXRpb25WYWx1ZT8udG9TdHJpbmcoKSxcblx0XHRcdFx0XHRcdHBhcnNlZENvbmRpdGlvbnMgPSBjb25kaXRpb25zVHlwZS5wYXJzZVZhbHVlKHN0cmluZ1ZhbHVlLCBcImFueVwiKTtcblx0XHRcdFx0XHRyZXR1cm4gcGFyc2VkQ29uZGl0aW9ucz8uWzBdO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuZmlsdGVyKChjb25kaXRpb25WYWx1ZSkgPT4gY29uZGl0aW9uVmFsdWUgIT09IHVuZGVmaW5lZCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGNvbmRpdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICogTWFwcyBhbiBhcnJheSBvZiBjb25kaXRpb25zIHRvIGEgY29tbWEgc2VwYXJhdGVkIGxpc3Qgb2YgZmlsdGVyIHZhbHVlcy5cblx0ICpcblx0ICogQHBhcmFtIGNvbmRpdGlvbnMgQXJyYXkgb2YgZmlsdGVyIGNvbmRpdGlvbnNcblx0ICogQHBhcmFtIGZvcm1hdE9wdGlvbnMgRm9ybWF0IG9wdGlvbnMgdGhhdCBzcGVjaWZpZXMgYSBjb25kaXRpb24gdHlwZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcmV0dXJucyBDb25jYXRlbmF0ZWQgc3RyaW5nIG9mIGZpbHRlciB2YWx1ZXNcblx0ICovXG5cdHN0YXRpYyBfY29uZGl0aW9uc1RvRmlsdGVyTW9kZWxTdHJpbmcoY29uZGl0aW9uczogb2JqZWN0W10sIGZvcm1hdE9wdGlvbnM6IEZvcm1hdE9wdGlvbnNUeXBlKTogc3RyaW5nIHtcblx0XHRjb25zdCBjb25kaXRpb25zVHlwZSA9IG5ldyBDb25kaXRpb25zVHlwZShmb3JtYXRPcHRpb25zKTtcblxuXHRcdHJldHVybiBjb25kaXRpb25zXG5cdFx0XHQubWFwKChjb25kaXRpb24pID0+IHtcblx0XHRcdFx0cmV0dXJuIGNvbmRpdGlvbnNUeXBlLmZvcm1hdFZhbHVlKFtjb25kaXRpb25dLCBcImFueVwiKSB8fCBcIlwiO1xuXHRcdFx0fSlcblx0XHRcdC5maWx0ZXIoKHN0cmluZ1ZhbHVlKSA9PiB7XG5cdFx0XHRcdHJldHVybiBzdHJpbmdWYWx1ZSAhPT0gXCJcIjtcblx0XHRcdH0pXG5cdFx0XHQuam9pbihcIixcIik7XG5cdH1cblxuXHQvKipcblx0ICogTGlzdGVucyB0byBmaWx0ZXIgbW9kZWwgY2hhbmdlcyBhbmQgdXBkYXRlcyB3cmFwcGVyIHByb3BlcnR5IFwiY29uZGl0aW9uc1wiLlxuXHQgKlxuXHQgKiBAcGFyYW0gY2hhbmdlRXZlbnQgRXZlbnQgdHJpZ2dlcmVkIGJ5IGEgZmlsdGVyIG1vZGVsIGNoYW5nZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2hhbmRsZUZpbHRlck1vZGVsQ2hhbmdlKGNoYW5nZUV2ZW50OiBhbnkpOiB2b2lkIHtcblx0XHRjb25zdCBwcm9wZXJ0eVBhdGggPSB0aGlzLmdldE9iamVjdEJpbmRpbmcoXCJmaWx0ZXJWYWx1ZXNcIikuZ2V0UGF0aCgpLFxuXHRcdFx0dmFsdWVzID0gY2hhbmdlRXZlbnQuZ2V0U291cmNlKCkuZ2V0UHJvcGVydHkocHJvcGVydHlQYXRoKTtcblx0XHR0aGlzLnVwZGF0ZUNvbmRpdGlvbnNCeUZpbHRlclZhbHVlcyh2YWx1ZXMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIExpc3RlbnMgdG8gXCJjb25kaXRpb25zXCIgY2hhbmdlcyBhbmQgdXBkYXRlcyB0aGUgZmlsdGVyIG1vZGVsLlxuXHQgKlxuXHQgKiBAcGFyYW0gY29uZGl0aW9ucyBFdmVudCB0cmlnZ2VyZWQgYnkgYSBcImNvbmRpdGlvbnNcIiBjaGFuZ2Vcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9oYW5kbGVDb25kaXRpb25zQ2hhbmdlKGNvbmRpdGlvbnM6IGFueSk6IHZvaWQge1xuXHRcdHRoaXMudXBkYXRlRmlsdGVyTW9kZWxCeUNvbmRpdGlvbnMoY29uZGl0aW9ucyk7XG5cdH1cblxuXHQvKipcblx0ICogSW5pdGlhbGl6ZSBDdXN0b21GaWx0ZXJGaWVsZENvbnRlbnRXcmFwcGVyIGNvbnRyb2wgYW5kIHJlZ2lzdGVyIG9ic2VydmVyLlxuXHQgKi9cblx0aW5pdCgpOiB2b2lkIHtcblx0XHRzdXBlci5pbml0KCk7XG5cdFx0dGhpcy5fY29uZGl0aW9uc09ic2VydmVyID0gbmV3IE1hbmFnZWRPYmplY3RPYnNlcnZlcih0aGlzLl9vYnNlcnZlQ2hhbmdlcy5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLl9jb25kaXRpb25zT2JzZXJ2ZXIub2JzZXJ2ZSh0aGlzLCB7XG5cdFx0XHRwcm9wZXJ0aWVzOiBbXCJjb25kaXRpb25zXCJdXG5cdFx0fSk7XG5cdFx0dGhpcy5fZmlsdGVyTW9kZWwgPSBuZXcgSlNPTk1vZGVsKCk7XG5cdFx0dGhpcy5fZmlsdGVyTW9kZWwuYXR0YWNoUHJvcGVydHlDaGFuZ2UodGhpcy5faGFuZGxlRmlsdGVyTW9kZWxDaGFuZ2UsIHRoaXMpO1xuXHRcdHRoaXMuc2V0TW9kZWwodGhpcy5fZmlsdGVyTW9kZWwsIEN1c3RvbUZpbHRlckZpZWxkQ29udGVudFdyYXBwZXIuRklMVEVSX01PREVMX0FMSUFTKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBPdmVycmlkZXMge0BsaW5rIHNhcC51aS5jb3JlLkNvbnRyb2wjY2xvbmUgQ29udHJvbC5jbG9uZX0gdG8gY2xvbmUgYWRkaXRpb25hbFxuXHQgKiBpbnRlcm5hbCBzdGF0ZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBbc0lkU3VmZml4XSBBIHN1ZmZpeCB0byBiZSBhcHBlbmRlZCB0byB0aGUgY2xvbmVkIGNvbnRyb2wgaWRcblx0ICogQHBhcmFtIFthTG9jYWxJZHNdIEFuIGFycmF5IG9mIGxvY2FsIElEcyB3aXRoaW4gdGhlIGNsb25lZCBoaWVyYXJjaHkgKGludGVybmFsbHkgdXNlZClcblx0ICogQHJldHVybnMgUmVmZXJlbmNlIHRvIHRoZSBuZXdseSBjcmVhdGVkIGNsb25lXG5cdCAqIEBwcm90ZWN0ZWRcblx0ICovXG5cdGNsb25lKHNJZFN1ZmZpeDogc3RyaW5nIHwgdW5kZWZpbmVkLCBhTG9jYWxJZHM6IHN0cmluZ1tdIHwgdW5kZWZpbmVkKTogdGhpcyB7XG5cdFx0Y29uc3QgY2xvbmUgPSBzdXBlci5jbG9uZShzSWRTdWZmaXgsIGFMb2NhbElkcyk7XG5cdFx0Ly8gRHVyaW5nIGNsb25pbmcsIHRoZSBvbGQgbW9kZWwgd2lsbCBiZSBjb3BpZWQgYW5kIG92ZXJ3cml0ZXMgYW55IG5ldyBtb2RlbCAoc2FtZSBhbGlhcykgdGhhdFxuXHRcdC8vIHlvdSBpbnRyb2R1Y2UgZHVyaW5nIGluaXQoKTsgaGVuY2UgeW91IG5lZWQgdG8gb3ZlcndyaXRlIGl0IGFnYWluIGJ5IHRoZSBuZXcgb25lIHRoYXQgeW91J3ZlXG5cdFx0Ly8gY3JlYXRlZCBkdXJpbmcgaW5pdCgpIChpLmUuIGNsb25lLl9maWx0ZXJNb2RlbCk7IHRoYXQgc3RhbmRhcmQgYmVoYXZpb3VyIG9mIHN1cGVyLmNsb25lKClcblx0XHQvLyBjYW4ndCBldmVuIGJlIHN1cHByZXNzZWQgaW4gYW4gb3duIGNvbnN0cnVjdG9yOyBmb3IgYSBkZXRhaWxlZCBpbnZlc3RpZ2F0aW9uIG9mIHRoZSBjbG9uaW5nLFxuXHRcdC8vIHBsZWFzZSBvdmVyd3JpdGUgdGhlIHNldE1vZGVsKCkgbWV0aG9kIGFuZCBjaGVjayB0aGUgbGlzdCBvZiBjYWxsZXJzIGFuZCBzdGVwcyBpbmR1Y2VkIGJ5IHRoZW0uXG5cdFx0Y2xvbmUuc2V0TW9kZWwoY2xvbmUuX2ZpbHRlck1vZGVsLCBDdXN0b21GaWx0ZXJGaWVsZENvbnRlbnRXcmFwcGVyLkZJTFRFUl9NT0RFTF9BTElBUyk7XG5cdFx0cmV0dXJuIGNsb25lO1xuXHR9XG5cblx0LyoqXG5cdCAqIExpc3RlbnMgdG8gcHJvcGVydHkgY2hhbmdlcy5cblx0ICpcblx0ICogQHBhcmFtIGNoYW5nZXMgUHJvcGVydHkgY2hhbmdlc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X29ic2VydmVDaGFuZ2VzKGNoYW5nZXM6IGFueSk6IHZvaWQge1xuXHRcdGlmIChjaGFuZ2VzLm5hbWUgPT09IFwiY29uZGl0aW9uc1wiKSB7XG5cdFx0XHR0aGlzLl9oYW5kbGVDb25kaXRpb25zQ2hhbmdlKGNoYW5nZXMuY3VycmVudCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGNvbnRlbnQgb2YgdGhpcyB3cmFwcGVyIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSB3cmFwcGVyIGNvbnRlbnRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldENvbnRlbnQoKTogQ29udHJvbCB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0QWdncmVnYXRpb24oXCJjb250ZW50XCIpIGFzIENvbnRyb2w7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgdmFsdWUgZm9yIGNvbnRyb2wgcHJvcGVydHkgJ2NvbmRpdGlvbnMnLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiBmaWx0ZXIgY29uZGl0aW9uc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Z2V0Q29uZGl0aW9ucygpOiBvYmplY3RbXSB7XG5cdFx0cmV0dXJuIHRoaXMuZ2V0UHJvcGVydHkoXCJjb25kaXRpb25zXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFNldHMgdGhlIHZhbHVlIGZvciBjb250cm9sIHByb3BlcnR5ICdjb25kaXRpb25zJy5cblx0ICpcblx0ICogQHBhcmFtIFtjb25kaXRpb25zXSBBcnJheSBvZiBmaWx0ZXIgY29uZGl0aW9uc1xuXHQgKiBAcmV0dXJucyBSZWZlcmVuY2UgdG8gdGhpcyB3cmFwcGVyXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRzZXRDb25kaXRpb25zKGNvbmRpdGlvbnM6IG9iamVjdFtdKTogdGhpcyB7XG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcImNvbmRpdGlvbnNcIiwgY29uZGl0aW9ucyB8fCBbXSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgZmlsdGVyIG1vZGVsIGFsaWFzICdmaWx0ZXJWYWx1ZXMnLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgZmlsdGVyIG1vZGVsXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRnZXRGaWx0ZXJNb2RlbEFsaWFzKCk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIEN1c3RvbUZpbHRlckZpZWxkQ29udGVudFdyYXBwZXIuRklMVEVSX01PREVMX0FMSUFTO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgdGhlIHByb3BlcnR5IFwiY29uZGl0aW9uc1wiIHdpdGggZmlsdGVyIHZhbHVlc1xuXHQgKiBzZW50IGJ5IEV4dGVuc2lvbkFQSSNzZXRGaWx0ZXJWYWx1ZXMoKS5cblx0ICpcblx0ICogQHBhcmFtIHZhbHVlcyBUaGUgZmlsdGVyIHZhbHVlc1xuXHQgKiBAcGFyYW0gW29wZXJhdG9yXSBUaGUgb3BlcmF0b3IgbmFtZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0dXBkYXRlQ29uZGl0aW9uc0J5RmlsdGVyVmFsdWVzKHZhbHVlczogYW55LCBvcGVyYXRvcj86IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnN0IGNvbmRpdGlvbnMgPSBDdXN0b21GaWx0ZXJGaWVsZENvbnRlbnRXcmFwcGVyLl9maWx0ZXJWYWx1ZXNUb0NvbmRpdGlvbnModmFsdWVzLCBvcGVyYXRvcik7XG5cdFx0dGhpcy5zZXRDb25kaXRpb25zKGNvbmRpdGlvbnMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFVwZGF0ZXMgZmlsdGVyIG1vZGVsIHdpdGggY29uZGl0aW9uc1xuXHQgKiBzZW50IGJ5IHRoZSB7QGxpbmsgc2FwLnVpLm1kYy5GaWx0ZXJGaWVsZCBGaWx0ZXJGaWVsZH0uXG5cdCAqXG5cdCAqIEBwYXJhbSBjb25kaXRpb25zIEFycmF5IG9mIGZpbHRlciBjb25kaXRpb25zXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHR1cGRhdGVGaWx0ZXJNb2RlbEJ5Q29uZGl0aW9ucyhjb25kaXRpb25zOiBhbnlbXSk6IHZvaWQge1xuXHRcdGNvbnN0IG9wZXJhdG9yID0gY29uZGl0aW9uc1swXT8ub3BlcmF0b3IgfHwgXCJcIjtcblx0XHRjb25zdCBmb3JtYXRPcHRpb25zOiBGb3JtYXRPcHRpb25zVHlwZSA9IG9wZXJhdG9yICE9PSBcIlwiID8geyBvcGVyYXRvcnM6IFtvcGVyYXRvcl0gfSA6IHsgb3BlcmF0b3JzOiBbXSB9O1xuXHRcdGlmICh0aGlzLmdldEJpbmRpbmdDb250ZXh0KEN1c3RvbUZpbHRlckZpZWxkQ29udGVudFdyYXBwZXIuRklMVEVSX01PREVMX0FMSUFTKSkge1xuXHRcdFx0Y29uc3Qgc3RyaW5nVmFsdWUgPSBDdXN0b21GaWx0ZXJGaWVsZENvbnRlbnRXcmFwcGVyLl9jb25kaXRpb25zVG9GaWx0ZXJNb2RlbFN0cmluZyhjb25kaXRpb25zLCBmb3JtYXRPcHRpb25zKTtcblx0XHRcdHRoaXMuX2ZpbHRlck1vZGVsLnNldFByb3BlcnR5KFxuXHRcdFx0XHR0aGlzLmdldEJpbmRpbmdDb250ZXh0KEN1c3RvbUZpbHRlckZpZWxkQ29udGVudFdyYXBwZXIuRklMVEVSX01PREVMX0FMSUFTKT8uZ2V0UGF0aCgpLFxuXHRcdFx0XHRzdHJpbmdWYWx1ZVxuXHRcdFx0KTtcblx0XHR9XG5cdH1cblxuXHRnZXRBY2Nlc3NpYmlsaXR5SW5mbygpOiBhbnkge1xuXHRcdGNvbnN0IGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnQoKTtcblx0XHRyZXR1cm4gY29udGVudD8uZ2V0QWNjZXNzaWJpbGl0eUluZm8/LigpIHx8IHt9O1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIERPTU5vZGUgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIFwibGFiZWxGb3JcIiBhdHRyaWJ1dGUuXG5cdCAqXG5cdCAqIFdlIGZvcndhcmQgdGhlIGNhbGwgb2YgdGhpcyBtZXRob2QgdG8gdGhlIGNvbnRlbnQgY29udHJvbC5cblx0ICpcblx0ICogQHJldHVybnMgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIDxjb2RlPmxhYmVsRm9yPC9jb2RlPlxuXHQgKi9cblx0Z2V0SWRGb3JMYWJlbCgpOiBzdHJpbmcge1xuXHRcdGNvbnN0IGNvbnRlbnQgPSB0aGlzLmdldENvbnRlbnQoKTtcblx0XHRyZXR1cm4gY29udGVudD8uZ2V0SWRGb3JMYWJlbCgpO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBcUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFQQSxJQVNxQkEsK0JBQStCLFdBRG5EQyxjQUFjLENBQUMsc0RBQXNELENBQUMsVUFFckVDLGtCQUFrQixDQUFDLDBCQUEwQixDQUFDLFVBSTlDQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLHFCQUFxQjtJQUFFQyxZQUFZLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHN0RGLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFQyxZQUFZ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