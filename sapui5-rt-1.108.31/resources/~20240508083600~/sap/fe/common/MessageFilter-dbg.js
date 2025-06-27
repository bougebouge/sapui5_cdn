/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/Element", "sap/ui/model/FilterOperator"], function (ClassSupport, Element, FilterOperator) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var MessageFilter = (_dec = defineUI5Class("sap.fe.common.MessageFilter"), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "sap.ui.model.FilterOperator",
    defaultValue: FilterOperator.Contains
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "string"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Element) {
    _inheritsLoose(MessageFilter, _Element);
    function MessageFilter() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Element.call.apply(_Element, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "path", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "operator", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "value1", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "value2", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    return MessageFilter;
  }(Element), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "path", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "operator", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "value1", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "value2", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return MessageFilter;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNZXNzYWdlRmlsdGVyIiwiZGVmaW5lVUk1Q2xhc3MiLCJwcm9wZXJ0eSIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJGaWx0ZXJPcGVyYXRvciIsIkNvbnRhaW5zIiwiRWxlbWVudCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTWVzc2FnZUZpbHRlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBFbGVtZW50IGZyb20gXCJzYXAvdWkvY29yZS9FbGVtZW50XCI7XG5pbXBvcnQgRmlsdGVyT3BlcmF0b3IgZnJvbSBcInNhcC91aS9tb2RlbC9GaWx0ZXJPcGVyYXRvclwiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29tbW9uLk1lc3NhZ2VGaWx0ZXJcIilcbmNsYXNzIE1lc3NhZ2VGaWx0ZXIgZXh0ZW5kcyBFbGVtZW50IHtcblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRwYXRoITogc3RyaW5nO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkZpbHRlck9wZXJhdG9yXCIsIGRlZmF1bHRWYWx1ZTogRmlsdGVyT3BlcmF0b3IuQ29udGFpbnMgfSlcblx0b3BlcmF0b3IhOiBGaWx0ZXJPcGVyYXRvcjtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHZhbHVlMSE6IHN0cmluZztcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHZhbHVlMiE6IHN0cmluZztcbn1cblxuZXhwb3J0IGRlZmF1bHQgTWVzc2FnZUZpbHRlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztNQUtNQSxhQUFhLFdBRGxCQyxjQUFjLENBQUMsNkJBQTZCLENBQUMsVUFFNUNDLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFHNUJELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsNkJBQTZCO0lBQUVDLFlBQVksRUFBRUMsY0FBYyxDQUFDQztFQUFTLENBQUMsQ0FBQyxVQUd4RkosUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxVQUc1QkQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQztJQUFBO0lBQUE7TUFBQTtNQUFBO1FBQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7RUFBQSxFQVZGSSxPQUFPO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9BY3BCUCxhQUFhO0FBQUEifQ==