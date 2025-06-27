/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/Control"], function (ClassSupport, Control) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var association = ClassSupport.association;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var ConditionalWrapper = (_dec = defineUI5Class("sap.fe.core.controls.ConditionalWrapper"), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "sap.ui.core.CSSSize",
    defaultValue: null
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = property({
    type: "boolean",
    defaultValue: false
  }), _dec6 = association({
    type: "sap.ui.core.Control",
    multiple: true,
    singularName: "ariaLabelledBy"
  }), _dec7 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec8 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(ConditionalWrapper, _Control);
    function ConditionalWrapper() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Control.call.apply(_Control, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "width", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formDoNotAdjustWidth", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "condition", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contentTrue", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contentFalse", _descriptor7, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = ConditionalWrapper.prototype;
    _proto.enhanceAccessibilityState = function enhanceAccessibilityState(oElement, mAriaProps) {
      var oParent = this.getParent();
      if (oParent && oParent.enhanceAccessibilityState) {
        oParent.enhanceAccessibilityState(this, mAriaProps);
      }
      return mAriaProps;
    };
    _proto._setAriaLabelledBy = function _setAriaLabelledBy(oContent) {
      if (oContent && oContent.addAriaLabelledBy) {
        var aAriaLabelledBy = this.ariaLabelledBy;
        for (var i = 0; i < aAriaLabelledBy.length; i++) {
          var sId = aAriaLabelledBy[i];
          var aAriaLabelledBys = oContent.getAriaLabelledBy() || [];
          if (aAriaLabelledBys.indexOf(sId) === -1) {
            oContent.addAriaLabelledBy(sId);
          }
        }
      }
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      // before calling the renderer of the ConditionalWrapper parent control may have set ariaLabelledBy
      // we ensure it is passed to its inner controls
      this._setAriaLabelledBy(this.contentTrue);
      this._setAriaLabelledBy(this.contentFalse);
    };
    ConditionalWrapper.render = function render(oRm, oControl) {
      oRm.openStart("div", oControl);
      oRm.style("width", oControl.width);
      oRm.style("display", "inline-block");
      oRm.openEnd();
      if (oControl.condition) {
        oRm.renderControl(oControl.contentTrue);
      } else {
        oRm.renderControl(oControl.contentFalse);
      }
      oRm.close("div"); // end of the complete Control
    };
    return ConditionalWrapper;
  }(Control), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
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
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "condition", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "contentTrue", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "contentFalse", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ConditionalWrapper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb25kaXRpb25hbFdyYXBwZXIiLCJkZWZpbmVVSTVDbGFzcyIsImltcGxlbWVudEludGVyZmFjZSIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImFzc29jaWF0aW9uIiwibXVsdGlwbGUiLCJzaW5ndWxhck5hbWUiLCJhZ2dyZWdhdGlvbiIsImlzRGVmYXVsdCIsImVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUiLCJvRWxlbWVudCIsIm1BcmlhUHJvcHMiLCJvUGFyZW50IiwiZ2V0UGFyZW50IiwiX3NldEFyaWFMYWJlbGxlZEJ5Iiwib0NvbnRlbnQiLCJhZGRBcmlhTGFiZWxsZWRCeSIsImFBcmlhTGFiZWxsZWRCeSIsImFyaWFMYWJlbGxlZEJ5IiwiaSIsImxlbmd0aCIsInNJZCIsImFBcmlhTGFiZWxsZWRCeXMiLCJnZXRBcmlhTGFiZWxsZWRCeSIsImluZGV4T2YiLCJvbkJlZm9yZVJlbmRlcmluZyIsImNvbnRlbnRUcnVlIiwiY29udGVudEZhbHNlIiwicmVuZGVyIiwib1JtIiwib0NvbnRyb2wiLCJvcGVuU3RhcnQiLCJzdHlsZSIsIndpZHRoIiwib3BlbkVuZCIsImNvbmRpdGlvbiIsInJlbmRlckNvbnRyb2wiLCJjbG9zZSIsIkNvbnRyb2wiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbmRpdGlvbmFsV3JhcHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBhZ2dyZWdhdGlvbiwgYXNzb2NpYXRpb24sIGRlZmluZVVJNUNsYXNzLCBpbXBsZW1lbnRJbnRlcmZhY2UsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgeyBDU1NTaXplLCBJRm9ybUNvbnRlbnQgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHR5cGUgUmVuZGVyTWFuYWdlciBmcm9tIFwic2FwL3VpL2NvcmUvUmVuZGVyTWFuYWdlclwiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9scy5Db25kaXRpb25hbFdyYXBwZXJcIilcbmNsYXNzIENvbmRpdGlvbmFsV3JhcHBlciBleHRlbmRzIENvbnRyb2wgaW1wbGVtZW50cyBJRm9ybUNvbnRlbnQge1xuXHRAaW1wbGVtZW50SW50ZXJmYWNlKFwic2FwLnVpLmNvcmUuSUZvcm1Db250ZW50XCIpXG5cdF9faW1wbGVtZW50c19fc2FwX3VpX2NvcmVfSUZvcm1Db250ZW50OiBib29sZWFuID0gdHJ1ZTtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInNhcC51aS5jb3JlLkNTU1NpemVcIiwgZGVmYXVsdFZhbHVlOiBudWxsIH0pXG5cdHdpZHRoITogQ1NTU2l6ZTtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRmb3JtRG9Ob3RBZGp1c3RXaWR0aCE6IGJvb2xlYW47XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0Y29uZGl0aW9uITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQXNzb2NpYXRpb24gdG8gY29udHJvbHMgLyBJRHMgdGhhdCBsYWJlbCB0aGlzIGNvbnRyb2wgKHNlZSBXQUktQVJJQSBhdHRyaWJ1dGUgYXJpYS1sYWJlbGxlZGJ5KS5cblx0ICovXG5cdEBhc3NvY2lhdGlvbih7IHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLCBtdWx0aXBsZTogdHJ1ZSwgc2luZ3VsYXJOYW1lOiBcImFyaWFMYWJlbGxlZEJ5XCIgfSlcblx0YXJpYUxhYmVsbGVkQnkhOiBDb250cm9sW107XG5cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIG11bHRpcGxlOiBmYWxzZSwgaXNEZWZhdWx0OiB0cnVlIH0pXG5cdGNvbnRlbnRUcnVlITogQ29udHJvbDtcblxuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC51aS5jb3JlLkNvbnRyb2xcIiwgbXVsdGlwbGU6IGZhbHNlIH0pXG5cdGNvbnRlbnRGYWxzZSE6IENvbnRyb2w7XG5cblx0ZW5oYW5jZUFjY2Vzc2liaWxpdHlTdGF0ZShvRWxlbWVudDogYW55LCBtQXJpYVByb3BzOiBhbnkpIHtcblx0XHRjb25zdCBvUGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoKSBhcyBhbnk7XG5cblx0XHRpZiAob1BhcmVudCAmJiBvUGFyZW50LmVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUpIHtcblx0XHRcdG9QYXJlbnQuZW5oYW5jZUFjY2Vzc2liaWxpdHlTdGF0ZSh0aGlzLCBtQXJpYVByb3BzKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbUFyaWFQcm9wcztcblx0fVxuXHRfc2V0QXJpYUxhYmVsbGVkQnkob0NvbnRlbnQ6IGFueSkge1xuXHRcdGlmIChvQ29udGVudCAmJiBvQ29udGVudC5hZGRBcmlhTGFiZWxsZWRCeSkge1xuXHRcdFx0Y29uc3QgYUFyaWFMYWJlbGxlZEJ5ID0gdGhpcy5hcmlhTGFiZWxsZWRCeTtcblxuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhQXJpYUxhYmVsbGVkQnkubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0Y29uc3Qgc0lkID0gYUFyaWFMYWJlbGxlZEJ5W2ldO1xuXHRcdFx0XHRjb25zdCBhQXJpYUxhYmVsbGVkQnlzID0gb0NvbnRlbnQuZ2V0QXJpYUxhYmVsbGVkQnkoKSB8fCBbXTtcblx0XHRcdFx0aWYgKGFBcmlhTGFiZWxsZWRCeXMuaW5kZXhPZihzSWQpID09PSAtMSkge1xuXHRcdFx0XHRcdG9Db250ZW50LmFkZEFyaWFMYWJlbGxlZEJ5KHNJZCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0Ly8gYmVmb3JlIGNhbGxpbmcgdGhlIHJlbmRlcmVyIG9mIHRoZSBDb25kaXRpb25hbFdyYXBwZXIgcGFyZW50IGNvbnRyb2wgbWF5IGhhdmUgc2V0IGFyaWFMYWJlbGxlZEJ5XG5cdFx0Ly8gd2UgZW5zdXJlIGl0IGlzIHBhc3NlZCB0byBpdHMgaW5uZXIgY29udHJvbHNcblx0XHR0aGlzLl9zZXRBcmlhTGFiZWxsZWRCeSh0aGlzLmNvbnRlbnRUcnVlKTtcblx0XHR0aGlzLl9zZXRBcmlhTGFiZWxsZWRCeSh0aGlzLmNvbnRlbnRGYWxzZSk7XG5cdH1cblx0c3RhdGljIHJlbmRlcihvUm06IFJlbmRlck1hbmFnZXIsIG9Db250cm9sOiBDb25kaXRpb25hbFdyYXBwZXIpIHtcblx0XHRvUm0ub3BlblN0YXJ0KFwiZGl2XCIsIG9Db250cm9sKTtcblx0XHRvUm0uc3R5bGUoXCJ3aWR0aFwiLCBvQ29udHJvbC53aWR0aCk7XG5cdFx0b1JtLnN0eWxlKFwiZGlzcGxheVwiLCBcImlubGluZS1ibG9ja1wiKTtcblx0XHRvUm0ub3BlbkVuZCgpO1xuXHRcdGlmIChvQ29udHJvbC5jb25kaXRpb24pIHtcblx0XHRcdG9SbS5yZW5kZXJDb250cm9sKG9Db250cm9sLmNvbnRlbnRUcnVlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1JtLnJlbmRlckNvbnRyb2wob0NvbnRyb2wuY29udGVudEZhbHNlKTtcblx0XHR9XG5cdFx0b1JtLmNsb3NlKFwiZGl2XCIpOyAvLyBlbmQgb2YgdGhlIGNvbXBsZXRlIENvbnRyb2xcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBDb25kaXRpb25hbFdyYXBwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7TUFNTUEsa0JBQWtCLFdBRHZCQyxjQUFjLENBQUMseUNBQXlDLENBQUMsVUFFeERDLGtCQUFrQixDQUFDLDBCQUEwQixDQUFDLFVBRzlDQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLHFCQUFxQjtJQUFFQyxZQUFZLEVBQUU7RUFBSyxDQUFDLENBQUMsVUFHN0RGLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFQyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsVUFHbERGLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFQyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsVUFNbERDLFdBQVcsQ0FBQztJQUFFRixJQUFJLEVBQUUscUJBQXFCO0lBQUVHLFFBQVEsRUFBRSxJQUFJO0lBQUVDLFlBQVksRUFBRTtFQUFpQixDQUFDLENBQUMsVUFHNUZDLFdBQVcsQ0FBQztJQUFFTCxJQUFJLEVBQUUscUJBQXFCO0lBQUVHLFFBQVEsRUFBRSxLQUFLO0lBQUVHLFNBQVMsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQUc5RUQsV0FBVyxDQUFDO0lBQUVMLElBQUksRUFBRSxxQkFBcUI7SUFBRUcsUUFBUSxFQUFFO0VBQU0sQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBLE9BRzlESSx5QkFBeUIsR0FBekIsbUNBQTBCQyxRQUFhLEVBQUVDLFVBQWUsRUFBRTtNQUN6RCxJQUFNQyxPQUFPLEdBQUcsSUFBSSxDQUFDQyxTQUFTLEVBQVM7TUFFdkMsSUFBSUQsT0FBTyxJQUFJQSxPQUFPLENBQUNILHlCQUF5QixFQUFFO1FBQ2pERyxPQUFPLENBQUNILHlCQUF5QixDQUFDLElBQUksRUFBRUUsVUFBVSxDQUFDO01BQ3BEO01BRUEsT0FBT0EsVUFBVTtJQUNsQixDQUFDO0lBQUEsT0FDREcsa0JBQWtCLEdBQWxCLDRCQUFtQkMsUUFBYSxFQUFFO01BQ2pDLElBQUlBLFFBQVEsSUFBSUEsUUFBUSxDQUFDQyxpQkFBaUIsRUFBRTtRQUMzQyxJQUFNQyxlQUFlLEdBQUcsSUFBSSxDQUFDQyxjQUFjO1FBRTNDLEtBQUssSUFBSUMsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHRixlQUFlLENBQUNHLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUU7VUFDaEQsSUFBTUUsR0FBRyxHQUFHSixlQUFlLENBQUNFLENBQUMsQ0FBQztVQUM5QixJQUFNRyxnQkFBZ0IsR0FBR1AsUUFBUSxDQUFDUSxpQkFBaUIsRUFBRSxJQUFJLEVBQUU7VUFDM0QsSUFBSUQsZ0JBQWdCLENBQUNFLE9BQU8sQ0FBQ0gsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDekNOLFFBQVEsQ0FBQ0MsaUJBQWlCLENBQUNLLEdBQUcsQ0FBQztVQUNoQztRQUNEO01BQ0Q7SUFDRCxDQUFDO0lBQUEsT0FDREksaUJBQWlCLEdBQWpCLDZCQUFvQjtNQUNuQjtNQUNBO01BQ0EsSUFBSSxDQUFDWCxrQkFBa0IsQ0FBQyxJQUFJLENBQUNZLFdBQVcsQ0FBQztNQUN6QyxJQUFJLENBQUNaLGtCQUFrQixDQUFDLElBQUksQ0FBQ2EsWUFBWSxDQUFDO0lBQzNDLENBQUM7SUFBQSxtQkFDTUMsTUFBTSxHQUFiLGdCQUFjQyxHQUFrQixFQUFFQyxRQUE0QixFQUFFO01BQy9ERCxHQUFHLENBQUNFLFNBQVMsQ0FBQyxLQUFLLEVBQUVELFFBQVEsQ0FBQztNQUM5QkQsR0FBRyxDQUFDRyxLQUFLLENBQUMsT0FBTyxFQUFFRixRQUFRLENBQUNHLEtBQUssQ0FBQztNQUNsQ0osR0FBRyxDQUFDRyxLQUFLLENBQUMsU0FBUyxFQUFFLGNBQWMsQ0FBQztNQUNwQ0gsR0FBRyxDQUFDSyxPQUFPLEVBQUU7TUFDYixJQUFJSixRQUFRLENBQUNLLFNBQVMsRUFBRTtRQUN2Qk4sR0FBRyxDQUFDTyxhQUFhLENBQUNOLFFBQVEsQ0FBQ0osV0FBVyxDQUFDO01BQ3hDLENBQUMsTUFBTTtRQUNORyxHQUFHLENBQUNPLGFBQWEsQ0FBQ04sUUFBUSxDQUFDSCxZQUFZLENBQUM7TUFDekM7TUFDQUUsR0FBRyxDQUFDUSxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztJQUNuQixDQUFDO0lBQUE7RUFBQSxFQWhFK0JDLE9BQU87SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BRVcsSUFBSTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQWlFeEN4QyxrQkFBa0I7QUFBQSJ9