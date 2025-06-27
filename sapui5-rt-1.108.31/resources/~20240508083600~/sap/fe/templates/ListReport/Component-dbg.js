/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/fe/templates/ListComponent"], function (ClassSupport, ListComponent) {
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
  var ListReportComponent = (_dec = defineUI5Class("sap.fe.templates.ListReport.Component", {
    library: "sap.fe.templates",
    manifest: "json"
  }), _dec2 = property({
    type: "object"
  }), _dec3 = property({
    type: "boolean",
    defaultValue: true
  }), _dec4 = property({
    type: "object"
  }), _dec5 = property({
    type: "boolean",
    defaultValue: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_ListComponent) {
    _inheritsLoose(ListReportComponent, _ListComponent);
    function ListReportComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ListComponent.call.apply(_ListComponent, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "views", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stickyMultiTabHeader", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "keyPerformanceIndicators", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "hideFilterBar", _descriptor4, _assertThisInitialized(_this));
      return _this;
    }
    return ListReportComponent;
  }(ListComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "views", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "stickyMultiTabHeader", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "keyPerformanceIndicators", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "hideFilterBar", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ListReportComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMaXN0UmVwb3J0Q29tcG9uZW50IiwiZGVmaW5lVUk1Q2xhc3MiLCJsaWJyYXJ5IiwibWFuaWZlc3QiLCJwcm9wZXJ0eSIsInR5cGUiLCJkZWZhdWx0VmFsdWUiLCJMaXN0Q29tcG9uZW50Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb21wb25lbnQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgTGlzdENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9MaXN0Q29tcG9uZW50XCI7XG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUudGVtcGxhdGVzLkxpc3RSZXBvcnQuQ29tcG9uZW50XCIsIHtcblx0bGlicmFyeTogXCJzYXAuZmUudGVtcGxhdGVzXCIsXG5cdG1hbmlmZXN0OiBcImpzb25cIlxufSlcbmNsYXNzIExpc3RSZXBvcnRDb21wb25lbnQgZXh0ZW5kcyBMaXN0Q29tcG9uZW50IHtcblx0LyoqXG5cdCAqIERlZmluZSBkaWZmZXJlbnQgUGFnZSB2aWV3cyB0byBkaXNwbGF5XG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcIm9iamVjdFwiIH0pXG5cdHZpZXdzOiBhbnk7XG5cdC8qKlxuXHQgKiAgRmxhZyB0byBkZXRlcm1pbmUgd2hldGhlciB0aGUgaWNvblRhYkJhciBpcyBpbiBzdGlja3kgbW9kZVxuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IHRydWVcblx0fSlcblx0c3RpY2t5TXVsdGlUYWJIZWFkZXIhOiBib29sZWFuO1xuXHQvKipcblx0ICogS1BJcyB0byBkaXNwbGF5XG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwib2JqZWN0XCJcblx0fSlcblx0a2V5UGVyZm9ybWFuY2VJbmRpY2F0b3JzOiBhbnk7XG5cblx0LyoqXG5cdCAqIEZsYWcgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdGhlIHRlbXBsYXRlIHNob3VsZCBoaWRlIHRoZSBmaWx0ZXIgYmFyXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0fSlcblx0aGlkZUZpbHRlckJhciE6IGJvb2xlYW47XG59XG5cbmV4cG9ydCBkZWZhdWx0IExpc3RSZXBvcnRDb21wb25lbnQ7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7TUFNTUEsbUJBQW1CLFdBSnhCQyxjQUFjLENBQUMsdUNBQXVDLEVBQUU7SUFDeERDLE9BQU8sRUFBRSxrQkFBa0I7SUFDM0JDLFFBQVEsRUFBRTtFQUNYLENBQUMsQ0FBQyxVQUtBQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBSzVCRCxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFNBQVM7SUFDZkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFDLFVBS0RGLFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFNREQsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxTQUFTO0lBQ2ZDLFlBQVksRUFBRTtFQUNmLENBQUMsQ0FBQztJQUFBO0lBQUE7TUFBQTtNQUFBO1FBQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7RUFBQSxFQTVCK0JDLGFBQWE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUEsT0FnQ2hDUCxtQkFBbUI7QUFBQSJ9