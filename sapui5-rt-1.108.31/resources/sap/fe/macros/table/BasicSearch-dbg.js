/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/m/SearchField", "sap/ui/core/Control"], function (ClassSupport, SearchField, Control) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
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
  var BasicSearch = (_dec = defineUI5Class("sap.fe.macros.table.BasicSearch"), _dec2 = implementInterface("sap.ui.mdc.IFilter"), _dec3 = event( /*{ conditionsBased: {
                                                                                                                                                type: "boolean"
                                                                                                                                                }}*/), _dec4 = event( /*{
                                                                                                                                                                      conditions: {
                                                                                                                                                                      type: "object"
                                                                                                                                                                      }
                                                                                                                                                                      }*/), _dec5 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(BasicSearch, _Control);
    function BasicSearch() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call.apply(_Control, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_mdc_IFilter", _descriptor, _assertThisInitialized(_this));
      _this.__implements__sap_ui_mdc_IFilterSource = true;
      _initializerDefineProperty(_this, "filterChanged", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "search", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filter", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = BasicSearch.prototype;
    _proto.init = function init() {
      var _this2 = this;
      this.setAggregation("filter", new SearchField({
        placeholder: "{sap.fe.i18n>M_FILTERBAR_SEARCH}",
        search: function () {
          _this2.fireEvent("search");
        }
      }));
    };
    _proto.getConditions = function getConditions() {
      return undefined;
    };
    _proto.getSearch = function getSearch() {
      return this.filter.getValue();
    };
    _proto.validate = function validate() {
      return Promise.resolve();
    };
    BasicSearch.render = function render(oRm, oControl) {
      oRm.openStart("div", oControl);
      oRm.openEnd();
      oRm.renderControl(oControl.filter);
      oRm.close("div");
    };
    return BasicSearch;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_mdc_IFilter", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "filterChanged", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "search", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "filter", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return BasicSearch;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNpY1NlYXJjaCIsImRlZmluZVVJNUNsYXNzIiwiaW1wbGVtZW50SW50ZXJmYWNlIiwiZXZlbnQiLCJhZ2dyZWdhdGlvbiIsInR5cGUiLCJtdWx0aXBsZSIsIl9faW1wbGVtZW50c19fc2FwX3VpX21kY19JRmlsdGVyU291cmNlIiwiaW5pdCIsInNldEFnZ3JlZ2F0aW9uIiwiU2VhcmNoRmllbGQiLCJwbGFjZWhvbGRlciIsInNlYXJjaCIsImZpcmVFdmVudCIsImdldENvbmRpdGlvbnMiLCJ1bmRlZmluZWQiLCJnZXRTZWFyY2giLCJmaWx0ZXIiLCJnZXRWYWx1ZSIsInZhbGlkYXRlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZW5kZXIiLCJvUm0iLCJvQ29udHJvbCIsIm9wZW5TdGFydCIsIm9wZW5FbmQiLCJyZW5kZXJDb250cm9sIiwiY2xvc2UiLCJDb250cm9sIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJCYXNpY1NlYXJjaC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50LCBpbXBsZW1lbnRJbnRlcmZhY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBTZWFyY2hGaWVsZCBmcm9tIFwic2FwL20vU2VhcmNoRmllbGRcIjtcbmltcG9ydCBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBSZW5kZXJNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9SZW5kZXJNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSB7IElGaWx0ZXIgfSBmcm9tIFwic2FwL3VpL21kYy9saWJyYXJ5XCI7XG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUubWFjcm9zLnRhYmxlLkJhc2ljU2VhcmNoXCIpXG5jbGFzcyBCYXNpY1NlYXJjaCBleHRlbmRzIENvbnRyb2wgaW1wbGVtZW50cyBJRmlsdGVyIHtcblx0QGltcGxlbWVudEludGVyZmFjZShcInNhcC51aS5tZGMuSUZpbHRlclwiKVxuXHRfX2ltcGxlbWVudHNfX3NhcF91aV9tZGNfSUZpbHRlcjogYm9vbGVhbiA9IHRydWU7XG5cdF9faW1wbGVtZW50c19fc2FwX3VpX21kY19JRmlsdGVyU291cmNlOiBib29sZWFuID0gdHJ1ZTtcblxuXHQvKipcblx0ICogVGhlICdmaWx0ZXJDaGFuZ2VkJyBjYW4gYmUgb3B0aW9uYWxseSBpbXBsZW1lbnRlZCB0byBkaXNwbGF5IGFuIG92ZXJsYXlcblx0ICogd2hlbiB0aGUgZmlsdGVyIHZhbHVlIG9mIHRoZSBJRmlsdGVyIGNoYW5nZXNcblx0ICovXG5cdEBldmVudCgvKnsgY29uZGl0aW9uc0Jhc2VkOiB7XG5cdFx0IFx0dHlwZTogXCJib29sZWFuXCJcblx0XHQgfX0qLylcblx0ZmlsdGVyQ2hhbmdlZCE6IEZ1bmN0aW9uO1xuXHQvKipcblx0ICogVGhlICdzZWFyY2gnIGV2ZW50IGlzIGEgbWFuZGF0b3J5IElGaWx0ZXIgZXZlbnQgdG8gdHJpZ2dlciBhIHNlYXJjaCBxdWVyeVxuXHQgKiBvbiB0aGUgY29uc3VtaW5nIGNvbnRyb2xcblx0ICovXG5cdEBldmVudCgvKntcblx0XHRcdFx0Y29uZGl0aW9uczoge1xuXHRcdFx0XHRcdHR5cGU6IFwib2JqZWN0XCJcblx0XHRcdFx0fVxuXHRcdFx0fSovKVxuXHRzZWFyY2ghOiBGdW5jdGlvbjtcblxuXHRAYWdncmVnYXRpb24oe1xuXHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLFxuXHRcdG11bHRpcGxlOiBmYWxzZVxuXHR9KVxuXHRmaWx0ZXIhOiBTZWFyY2hGaWVsZDtcblxuXHRpbml0KCkge1xuXHRcdHRoaXMuc2V0QWdncmVnYXRpb24oXG5cdFx0XHRcImZpbHRlclwiLFxuXHRcdFx0bmV3IFNlYXJjaEZpZWxkKHtcblx0XHRcdFx0cGxhY2Vob2xkZXI6IFwie3NhcC5mZS5pMThuPk1fRklMVEVSQkFSX1NFQVJDSH1cIixcblx0XHRcdFx0c2VhcmNoOiAoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5maXJlRXZlbnQoXCJzZWFyY2hcIik7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0KTtcblx0fVxuXHRnZXRDb25kaXRpb25zKCkge1xuXHRcdHJldHVybiB1bmRlZmluZWQgYXMgYW55O1xuXHR9XG5cdGdldFNlYXJjaCgpIHtcblx0XHRyZXR1cm4gdGhpcy5maWx0ZXIuZ2V0VmFsdWUoKTtcblx0fVxuXHR2YWxpZGF0ZSgpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdH1cblx0c3RhdGljIHJlbmRlcihvUm06IFJlbmRlck1hbmFnZXIsIG9Db250cm9sOiBCYXNpY1NlYXJjaCkge1xuXHRcdG9SbS5vcGVuU3RhcnQoXCJkaXZcIiwgb0NvbnRyb2wpO1xuXHRcdG9SbS5vcGVuRW5kKCk7XG5cdFx0b1JtLnJlbmRlckNvbnRyb2wob0NvbnRyb2wuZmlsdGVyKTtcblx0XHRvUm0uY2xvc2UoXCJkaXZcIik7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQmFzaWNTZWFyY2g7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7OztNQU1NQSxXQUFXLFdBRGhCQyxjQUFjLENBQUMsaUNBQWlDLENBQUMsVUFFaERDLGtCQUFrQixDQUFDLG9CQUFvQixDQUFDLFVBUXhDQyxLQUFLLEVBQUM7QUFDUjtBQUNBLG9KQUZRLENBRUEsVUFNTkEsS0FBSyxFQUFDO0FBQ1I7QUFDQTtBQUNBO0FBQ0EseUtBSlEsQ0FJRCxVQUdMQyxXQUFXLENBQUM7SUFDWkMsSUFBSSxFQUFFLHFCQUFxQjtJQUMzQkMsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBLE1BeEJGQyxzQ0FBc0MsR0FBWSxJQUFJO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBQUEsT0EyQnREQyxJQUFJLEdBQUosZ0JBQU87TUFBQTtNQUNOLElBQUksQ0FBQ0MsY0FBYyxDQUNsQixRQUFRLEVBQ1IsSUFBSUMsV0FBVyxDQUFDO1FBQ2ZDLFdBQVcsRUFBRSxrQ0FBa0M7UUFDL0NDLE1BQU0sRUFBRSxZQUFNO1VBQ2IsTUFBSSxDQUFDQyxTQUFTLENBQUMsUUFBUSxDQUFDO1FBQ3pCO01BQ0QsQ0FBQyxDQUFDLENBQ0Y7SUFDRixDQUFDO0lBQUEsT0FDREMsYUFBYSxHQUFiLHlCQUFnQjtNQUNmLE9BQU9DLFNBQVM7SUFDakIsQ0FBQztJQUFBLE9BQ0RDLFNBQVMsR0FBVCxxQkFBWTtNQUNYLE9BQU8sSUFBSSxDQUFDQyxNQUFNLENBQUNDLFFBQVEsRUFBRTtJQUM5QixDQUFDO0lBQUEsT0FDREMsUUFBUSxHQUFSLG9CQUFXO01BQ1YsT0FBT0MsT0FBTyxDQUFDQyxPQUFPLEVBQUU7SUFDekIsQ0FBQztJQUFBLFlBQ01DLE1BQU0sR0FBYixnQkFBY0MsR0FBa0IsRUFBRUMsUUFBcUIsRUFBRTtNQUN4REQsR0FBRyxDQUFDRSxTQUFTLENBQUMsS0FBSyxFQUFFRCxRQUFRLENBQUM7TUFDOUJELEdBQUcsQ0FBQ0csT0FBTyxFQUFFO01BQ2JILEdBQUcsQ0FBQ0ksYUFBYSxDQUFDSCxRQUFRLENBQUNQLE1BQU0sQ0FBQztNQUNsQ00sR0FBRyxDQUFDSyxLQUFLLENBQUMsS0FBSyxDQUFDO0lBQ2pCLENBQUM7SUFBQTtFQUFBLEVBdkR3QkMsT0FBTztJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FFWSxJQUFJO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9Bd0RsQzdCLFdBQVc7QUFBQSJ9