/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ClassSupport", "sap/fe/templates/ObjectPage/ObjectPageTemplating", "sap/m/Button", "sap/m/ResponsivePopover", "sap/m/SelectList", "sap/ui/core/InvisibleText", "sap/ui/core/Item", "sap/fe/core/jsx-runtime/jsx", "sap/fe/core/jsx-runtime/jsxs", "sap/fe/core/jsx-runtime/Fragment"], function (BuildingBlock, CommonUtils, BindingHelper, BindingToolkit, ClassSupport, ObjectPageTemplating, Button, ResponsivePopover, SelectList, InvisibleText, Item, _jsx, _jsxs, _Fragment) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4;
  var _exports = {};
  var getSwitchDraftAndActiveVisibility = ObjectPageTemplating.getSwitchDraftAndActiveVisibility;
  var defineReference = ClassSupport.defineReference;
  var pathInModel = BindingToolkit.pathInModel;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var xmlAttribute = BuildingBlock.xmlAttribute;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var DraftHandlerButton = (_dec = defineBuildingBlock({
    name: "DraftHandlerButton",
    namespace: "sap.fe.templates.ObjectPage.components",
    isRuntime: true
  }), _dec2 = xmlAttribute({
    type: "string"
  }), _dec3 = xmlAttribute({
    type: "sap.ui.model.Context"
  }), _dec4 = defineReference(), _dec5 = defineReference(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(DraftHandlerButton, _BuildingBlockBase);
    function DraftHandlerButton(oProps) {
      var _this;
      _this = _BuildingBlockBase.call(this, oProps) || this;
      _this.SWITCH_TO_DRAFT_KEY = "switchToDraft";
      _this.SWITCH_TO_ACTIVE_KEY = "switchToActive";
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "switchToActiveRef", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "switchToDraftRef", _descriptor4, _assertThisInitialized(_this));
      _this.initialSelectedKey = _this.SWITCH_TO_ACTIVE_KEY;
      _this.handleSelectedItemChange = function (event) {
        var selectedItemKey = event.getParameter("item").getProperty("key");
        if (selectedItemKey !== _this.initialSelectedKey) {
          _this._containingView.getController().editFlow.toggleDraftActive(_this._containingView.getBindingContext());
        }
        if (_this.popover) {
          _this.popover.close();
          _this.popover.destroy();
          delete _this.popover;
        }
      };
      _this.openSwitchActivePopover = function (event) {
        var sourceControl = event.getSource();
        var containingView = CommonUtils.getTargetView(sourceControl);
        var context = containingView.getBindingContext();
        var isActiveEntity = context.getObject().IsActiveEntity;
        _this.initialSelectedKey = isActiveEntity ? _this.SWITCH_TO_ACTIVE_KEY : _this.SWITCH_TO_DRAFT_KEY;
        _this.popover = _this.createPopover();
        _this._containingView = containingView;
        containingView.addDependent(_this.popover);
        _this.popover.openBy(sourceControl);
        _this.popover.attachEventOnce("afterOpen", function () {
          if (isActiveEntity) {
            var _this$switchToDraftRe;
            (_this$switchToDraftRe = _this.switchToDraftRef.current) === null || _this$switchToDraftRe === void 0 ? void 0 : _this$switchToDraftRe.focus();
          } else {
            var _this$switchToActiveR;
            (_this$switchToActiveR = _this.switchToActiveRef.current) === null || _this$switchToActiveR === void 0 ? void 0 : _this$switchToActiveR.focus();
          }
        });
        return _this.popover;
      };
      return _this;
    }
    _exports = DraftHandlerButton;
    var _proto = DraftHandlerButton.prototype;
    _proto.createPopover = function createPopover() {
      return _jsx(ResponsivePopover, {
        showHeader: false,
        contentWidth: "15.625rem",
        verticalScrolling: false,
        class: "sapUiNoContentPadding",
        placement: "Bottom",
        children: _jsxs(SelectList, {
          selectedKey: this.initialSelectedKey,
          itemPress: this.handleSelectedItemChange,
          children: [_jsx(Item, {
            text: "{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISPLAY_DRAFT_MIT}",
            ref: this.switchToDraftRef
          }, this.SWITCH_TO_DRAFT_KEY), _jsx(Item, {
            text: "{sap.fe.i18n>C_COMMON_OBJECT_PAGE_DISPLAY_SAVED_VERSION_MIT}",
            ref: this.switchToActiveRef
          }, this.SWITCH_TO_ACTIVE_KEY)]
        })
      });
    };
    _proto.render = function render() {
      var textValue = ifElse(and(not(UI.IsEditable), not(UI.IsCreateMode), Entity.HasDraft), pathInModel("C_COMMON_OBJECT_PAGE_SAVED_VERSION_BUT", "sap.fe.i18n"), pathInModel("C_COMMON_OBJECT_PAGE_DRAFT_BUT", "sap.fe.i18n"));
      var visible = getSwitchDraftAndActiveVisibility(this.contextPath.getObject("@"));
      return _jsxs(_Fragment, {
        children: [_jsx(Button, {
          id: "fe::StandardAction::SwitchDraftAndActiveObject",
          text: textValue,
          visible: visible,
          icon: "sap-icon://navigation-down-arrow",
          iconFirst: false,
          type: "Transparent",
          press: this.openSwitchActivePopover,
          ariaDescribedBy: ["fe::StandardAction::SwitchDraftAndActiveObject::AriaTextDraftSwitcher"]
        }), _jsx(InvisibleText, {
          text: "{sap.fe.i18n>T_HEADER_DATAPOINT_TITLE_DRAFT_SWITCHER_ARIA_BUTTON}",
          id: "fe::StandardAction::SwitchDraftAndActiveObject::AriaTextDraftSwitcher"
        })]
      });
    };
    return DraftHandlerButton;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "switchToActiveRef", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "switchToDraftRef", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = DraftHandlerButton;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEcmFmdEhhbmRsZXJCdXR0b24iLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsImlzUnVudGltZSIsInhtbEF0dHJpYnV0ZSIsInR5cGUiLCJkZWZpbmVSZWZlcmVuY2UiLCJvUHJvcHMiLCJTV0lUQ0hfVE9fRFJBRlRfS0VZIiwiU1dJVENIX1RPX0FDVElWRV9LRVkiLCJpbml0aWFsU2VsZWN0ZWRLZXkiLCJoYW5kbGVTZWxlY3RlZEl0ZW1DaGFuZ2UiLCJldmVudCIsInNlbGVjdGVkSXRlbUtleSIsImdldFBhcmFtZXRlciIsImdldFByb3BlcnR5IiwiX2NvbnRhaW5pbmdWaWV3IiwiZ2V0Q29udHJvbGxlciIsImVkaXRGbG93IiwidG9nZ2xlRHJhZnRBY3RpdmUiLCJnZXRCaW5kaW5nQ29udGV4dCIsInBvcG92ZXIiLCJjbG9zZSIsImRlc3Ryb3kiLCJvcGVuU3dpdGNoQWN0aXZlUG9wb3ZlciIsInNvdXJjZUNvbnRyb2wiLCJnZXRTb3VyY2UiLCJjb250YWluaW5nVmlldyIsIkNvbW1vblV0aWxzIiwiZ2V0VGFyZ2V0VmlldyIsImNvbnRleHQiLCJpc0FjdGl2ZUVudGl0eSIsImdldE9iamVjdCIsIklzQWN0aXZlRW50aXR5IiwiY3JlYXRlUG9wb3ZlciIsImFkZERlcGVuZGVudCIsIm9wZW5CeSIsImF0dGFjaEV2ZW50T25jZSIsInN3aXRjaFRvRHJhZnRSZWYiLCJjdXJyZW50IiwiZm9jdXMiLCJzd2l0Y2hUb0FjdGl2ZVJlZiIsInJlbmRlciIsInRleHRWYWx1ZSIsImlmRWxzZSIsImFuZCIsIm5vdCIsIlVJIiwiSXNFZGl0YWJsZSIsIklzQ3JlYXRlTW9kZSIsIkVudGl0eSIsIkhhc0RyYWZ0IiwicGF0aEluTW9kZWwiLCJ2aXNpYmxlIiwiZ2V0U3dpdGNoRHJhZnRBbmRBY3RpdmVWaXNpYmlsaXR5IiwiY29udGV4dFBhdGgiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRHJhZnRIYW5kbGVyQnV0dG9uLnRzeCJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCdWlsZGluZ0Jsb2NrQmFzZSwgZGVmaW5lQnVpbGRpbmdCbG9jaywgeG1sQXR0cmlidXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IEVudGl0eSwgVUkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB7IGFuZCwgaWZFbHNlLCBub3QsIHBhdGhJbk1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGRlZmluZVJlZmVyZW5jZSwgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBSZWYgfSBmcm9tIFwic2FwL2ZlL2NvcmUvanN4LXJ1bnRpbWUvanN4XCI7XG5pbXBvcnQgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgeyBnZXRTd2l0Y2hEcmFmdEFuZEFjdGl2ZVZpc2liaWxpdHkgfSBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9PYmplY3RQYWdlL09iamVjdFBhZ2VUZW1wbGF0aW5nXCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBSZXNwb25zaXZlUG9wb3ZlciBmcm9tIFwic2FwL20vUmVzcG9uc2l2ZVBvcG92ZXJcIjtcbmltcG9ydCBTZWxlY3RMaXN0IGZyb20gXCJzYXAvbS9TZWxlY3RMaXN0XCI7XG5pbXBvcnQgRXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgeyBQcm9wZXJ0eUJpbmRpbmdJbmZvIH0gZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBJbnZpc2libGVUZXh0IGZyb20gXCJzYXAvdWkvY29yZS9JbnZpc2libGVUZXh0XCI7XG5pbXBvcnQgSXRlbSBmcm9tIFwic2FwL3VpL2NvcmUvSXRlbVwiO1xuaW1wb3J0IFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIHsgVjRDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7IG5hbWU6IFwiRHJhZnRIYW5kbGVyQnV0dG9uXCIsIG5hbWVzcGFjZTogXCJzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuY29tcG9uZW50c1wiLCBpc1J1bnRpbWU6IHRydWUgfSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIERyYWZ0SGFuZGxlckJ1dHRvbiBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0cHJpdmF0ZSBfY29udGFpbmluZ1ZpZXchOiBWaWV3O1xuXHRwcml2YXRlIHBvcG92ZXI/OiBSZXNwb25zaXZlUG9wb3ZlcjtcblxuXHRwcml2YXRlIHJlYWRvbmx5IFNXSVRDSF9UT19EUkFGVF9LRVkgPSBcInN3aXRjaFRvRHJhZnRcIjtcblx0cHJpdmF0ZSByZWFkb25seSBTV0lUQ0hfVE9fQUNUSVZFX0tFWSA9IFwic3dpdGNoVG9BY3RpdmVcIjtcblxuXHRjb25zdHJ1Y3RvcihvUHJvcHM6IFByb3BlcnRpZXNPZjxEcmFmdEhhbmRsZXJCdXR0b24+KSB7XG5cdFx0c3VwZXIob1Byb3BzKTtcblx0fVxuXG5cdEB4bWxBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHB1YmxpYyBpZCE6IHN0cmluZztcblxuXHRAeG1sQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiIH0pXG5cdHB1YmxpYyBjb250ZXh0UGF0aCE6IENvbnRleHQ7XG5cblx0QGRlZmluZVJlZmVyZW5jZSgpXG5cdHB1YmxpYyBzd2l0Y2hUb0FjdGl2ZVJlZiE6IFJlZjxJdGVtPjtcblx0QGRlZmluZVJlZmVyZW5jZSgpXG5cdHB1YmxpYyBzd2l0Y2hUb0RyYWZ0UmVmITogUmVmPEl0ZW0+O1xuXG5cdHByaXZhdGUgaW5pdGlhbFNlbGVjdGVkS2V5OiBzdHJpbmcgPSB0aGlzLlNXSVRDSF9UT19BQ1RJVkVfS0VZO1xuXG5cdGhhbmRsZVNlbGVjdGVkSXRlbUNoYW5nZSA9IChldmVudDogRXZlbnQpID0+IHtcblx0XHRjb25zdCBzZWxlY3RlZEl0ZW1LZXkgPSBldmVudC5nZXRQYXJhbWV0ZXIoXCJpdGVtXCIpLmdldFByb3BlcnR5KFwia2V5XCIpO1xuXHRcdGlmIChzZWxlY3RlZEl0ZW1LZXkgIT09IHRoaXMuaW5pdGlhbFNlbGVjdGVkS2V5KSB7XG5cdFx0XHQodGhpcy5fY29udGFpbmluZ1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKS5lZGl0Rmxvdy50b2dnbGVEcmFmdEFjdGl2ZShcblx0XHRcdFx0dGhpcy5fY29udGFpbmluZ1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBWNENvbnRleHRcblx0XHRcdCk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLnBvcG92ZXIpIHtcblx0XHRcdHRoaXMucG9wb3Zlci5jbG9zZSgpO1xuXHRcdFx0dGhpcy5wb3BvdmVyLmRlc3Ryb3koKTtcblx0XHRcdGRlbGV0ZSB0aGlzLnBvcG92ZXI7XG5cdFx0fVxuXHR9O1xuXG5cdG9wZW5Td2l0Y2hBY3RpdmVQb3BvdmVyID0gKGV2ZW50OiBFdmVudCkgPT4ge1xuXHRcdGNvbnN0IHNvdXJjZUNvbnRyb2wgPSBldmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBjb250YWluaW5nVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcoc291cmNlQ29udHJvbCk7XG5cblx0XHRjb25zdCBjb250ZXh0OiBWNENvbnRleHQgPSBjb250YWluaW5nVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGNvbnN0IGlzQWN0aXZlRW50aXR5ID0gY29udGV4dC5nZXRPYmplY3QoKS5Jc0FjdGl2ZUVudGl0eTtcblx0XHR0aGlzLmluaXRpYWxTZWxlY3RlZEtleSA9IGlzQWN0aXZlRW50aXR5ID8gdGhpcy5TV0lUQ0hfVE9fQUNUSVZFX0tFWSA6IHRoaXMuU1dJVENIX1RPX0RSQUZUX0tFWTtcblx0XHR0aGlzLnBvcG92ZXIgPSB0aGlzLmNyZWF0ZVBvcG92ZXIoKTtcblxuXHRcdHRoaXMuX2NvbnRhaW5pbmdWaWV3ID0gY29udGFpbmluZ1ZpZXc7XG5cdFx0Y29udGFpbmluZ1ZpZXcuYWRkRGVwZW5kZW50KHRoaXMucG9wb3Zlcik7XG5cdFx0dGhpcy5wb3BvdmVyLm9wZW5CeShzb3VyY2VDb250cm9sKTtcblx0XHR0aGlzLnBvcG92ZXIuYXR0YWNoRXZlbnRPbmNlKFwiYWZ0ZXJPcGVuXCIsICgpID0+IHtcblx0XHRcdGlmIChpc0FjdGl2ZUVudGl0eSkge1xuXHRcdFx0XHR0aGlzLnN3aXRjaFRvRHJhZnRSZWYuY3VycmVudD8uZm9jdXMoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRoaXMuc3dpdGNoVG9BY3RpdmVSZWYuY3VycmVudD8uZm9jdXMoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gdGhpcy5wb3BvdmVyO1xuXHR9O1xuXG5cdGNyZWF0ZVBvcG92ZXIoKTogUmVzcG9uc2l2ZVBvcG92ZXIge1xuXHRcdHJldHVybiAoXG5cdFx0XHQ8UmVzcG9uc2l2ZVBvcG92ZXJcblx0XHRcdFx0c2hvd0hlYWRlcj17ZmFsc2V9XG5cdFx0XHRcdGNvbnRlbnRXaWR0aD17XCIxNS42MjVyZW1cIn1cblx0XHRcdFx0dmVydGljYWxTY3JvbGxpbmc9e2ZhbHNlfVxuXHRcdFx0XHRjbGFzcz17XCJzYXBVaU5vQ29udGVudFBhZGRpbmdcIn1cblx0XHRcdFx0cGxhY2VtZW50PXtcIkJvdHRvbVwifVxuXHRcdFx0PlxuXHRcdFx0XHQ8U2VsZWN0TGlzdCBzZWxlY3RlZEtleT17dGhpcy5pbml0aWFsU2VsZWN0ZWRLZXl9IGl0ZW1QcmVzcz17dGhpcy5oYW5kbGVTZWxlY3RlZEl0ZW1DaGFuZ2V9PlxuXHRcdFx0XHRcdDxJdGVtXG5cdFx0XHRcdFx0XHR0ZXh0PXtcIntzYXAuZmUuaTE4bj5DX0NPTU1PTl9PQkpFQ1RfUEFHRV9ESVNQTEFZX0RSQUZUX01JVH1cIn1cblx0XHRcdFx0XHRcdGtleT17dGhpcy5TV0lUQ0hfVE9fRFJBRlRfS0VZfVxuXHRcdFx0XHRcdFx0cmVmPXt0aGlzLnN3aXRjaFRvRHJhZnRSZWZ9XG5cdFx0XHRcdFx0Lz5cblx0XHRcdFx0XHQ8SXRlbVxuXHRcdFx0XHRcdFx0dGV4dD17XCJ7c2FwLmZlLmkxOG4+Q19DT01NT05fT0JKRUNUX1BBR0VfRElTUExBWV9TQVZFRF9WRVJTSU9OX01JVH1cIn1cblx0XHRcdFx0XHRcdGtleT17dGhpcy5TV0lUQ0hfVE9fQUNUSVZFX0tFWX1cblx0XHRcdFx0XHRcdHJlZj17dGhpcy5zd2l0Y2hUb0FjdGl2ZVJlZn1cblx0XHRcdFx0XHQvPlxuXHRcdFx0XHQ8L1NlbGVjdExpc3Q+XG5cdFx0XHQ8L1Jlc3BvbnNpdmVQb3BvdmVyPlxuXHRcdCk7XG5cdH1cblxuXHRyZW5kZXIoKSB7XG5cdFx0Y29uc3QgdGV4dFZhbHVlID0gaWZFbHNlKFxuXHRcdFx0YW5kKG5vdChVSS5Jc0VkaXRhYmxlKSwgbm90KFVJLklzQ3JlYXRlTW9kZSksIEVudGl0eS5IYXNEcmFmdCksXG5cdFx0XHRwYXRoSW5Nb2RlbChcIkNfQ09NTU9OX09CSkVDVF9QQUdFX1NBVkVEX1ZFUlNJT05fQlVUXCIsIFwic2FwLmZlLmkxOG5cIiksXG5cdFx0XHRwYXRoSW5Nb2RlbChcIkNfQ09NTU9OX09CSkVDVF9QQUdFX0RSQUZUX0JVVFwiLCBcInNhcC5mZS5pMThuXCIpXG5cdFx0KSBhcyBQcm9wZXJ0eUJpbmRpbmdJbmZvO1xuXHRcdGNvbnN0IHZpc2libGUgPSBnZXRTd2l0Y2hEcmFmdEFuZEFjdGl2ZVZpc2liaWxpdHkodGhpcy5jb250ZXh0UGF0aC5nZXRPYmplY3QoXCJAXCIpKTtcblx0XHRyZXR1cm4gKFxuXHRcdFx0PD5cblx0XHRcdFx0PEJ1dHRvblxuXHRcdFx0XHRcdGlkPVwiZmU6OlN0YW5kYXJkQWN0aW9uOjpTd2l0Y2hEcmFmdEFuZEFjdGl2ZU9iamVjdFwiXG5cdFx0XHRcdFx0dGV4dD17dGV4dFZhbHVlfVxuXHRcdFx0XHRcdHZpc2libGU9e3Zpc2libGV9XG5cdFx0XHRcdFx0aWNvbj1cInNhcC1pY29uOi8vbmF2aWdhdGlvbi1kb3duLWFycm93XCJcblx0XHRcdFx0XHRpY29uRmlyc3Q9e2ZhbHNlfVxuXHRcdFx0XHRcdHR5cGU9XCJUcmFuc3BhcmVudFwiXG5cdFx0XHRcdFx0cHJlc3M9e3RoaXMub3BlblN3aXRjaEFjdGl2ZVBvcG92ZXJ9XG5cdFx0XHRcdFx0YXJpYURlc2NyaWJlZEJ5PXtbXCJmZTo6U3RhbmRhcmRBY3Rpb246OlN3aXRjaERyYWZ0QW5kQWN0aXZlT2JqZWN0OjpBcmlhVGV4dERyYWZ0U3dpdGNoZXJcIl19XG5cdFx0XHRcdD48L0J1dHRvbj5cblx0XHRcdFx0PEludmlzaWJsZVRleHRcblx0XHRcdFx0XHR0ZXh0PVwie3NhcC5mZS5pMThuPlRfSEVBREVSX0RBVEFQT0lOVF9USVRMRV9EUkFGVF9TV0lUQ0hFUl9BUklBX0JVVFRPTn1cIlxuXHRcdFx0XHRcdGlkPVwiZmU6OlN0YW5kYXJkQWN0aW9uOjpTd2l0Y2hEcmFmdEFuZEFjdGl2ZU9iamVjdDo6QXJpYVRleHREcmFmdFN3aXRjaGVyXCJcblx0XHRcdFx0Lz5cblx0XHRcdDwvPlxuXHRcdCk7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUFvQnFCQSxrQkFBa0IsV0FEdENDLG1CQUFtQixDQUFDO0lBQUVDLElBQUksRUFBRSxvQkFBb0I7SUFBRUMsU0FBUyxFQUFFLHdDQUF3QztJQUFFQyxTQUFTLEVBQUU7RUFBSyxDQUFD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