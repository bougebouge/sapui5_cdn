/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/macros/DelegateUtil", "sap/m/QuickViewPage"], function (CommonUtils, ClassSupport, KeepAliveHelper, DelegateUtil, QuickViewPage) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var CustomQuickViewPage = (_dec = defineUI5Class("sap.fe.core.controls.CustomQuickViewPage"), _dec2 = aggregation({
    type: "sap.ui.core.Control",
    multiple: true
  }), _dec3 = aggregation({
    type: "sap.m.QuickViewGroup",
    multiple: true,
    singularName: "group",
    isDefault: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_QuickViewPage) {
    _inheritsLoose(CustomQuickViewPage, _QuickViewPage);
    function CustomQuickViewPage() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _QuickViewPage.call.apply(_QuickViewPage, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "customContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "groups", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = CustomQuickViewPage.prototype;
    _proto.onBeforeRendering = function onBeforeRendering(oEvent) {
      var _this2 = this;
      if (this.getParent() && this.getParent().isA("sap.fe.core.controls.ConditionalWrapper") && this.getParent().getProperty("condition") === true) {
        this.setCrossAppNavCallback(function () {
          var sQuickViewPageTitleLinkHref = DelegateUtil.getCustomData(_this2, "titleLink");
          var oView = CommonUtils.getTargetView(_this2);
          var oAppComponent = CommonUtils.getAppComponent(oView);
          var oShellServiceHelper = oAppComponent.getShellServices();
          var oShellHash = oShellServiceHelper.parseShellHash(sQuickViewPageTitleLinkHref);
          var oNavArgs = {
            target: {
              semanticObject: oShellHash.semanticObject,
              action: oShellHash.action
            },
            params: oShellHash.params
          };
          var sQuickViewPageTitleLinkIntent = "".concat(oNavArgs.target.semanticObject, "-").concat(oNavArgs.target.action);
          if (sQuickViewPageTitleLinkIntent && _this2.oCrossAppNavigator && _this2.oCrossAppNavigator.isNavigationSupported([sQuickViewPageTitleLinkIntent])) {
            if (sQuickViewPageTitleLinkIntent && sQuickViewPageTitleLinkIntent !== "") {
              if (typeof sQuickViewPageTitleLinkIntent === "string" && sQuickViewPageTitleLinkIntent !== "") {
                var oLinkControl = _this2.getParent();
                while (oLinkControl && !oLinkControl.isA("sap.ui.mdc.Link")) {
                  oLinkControl = oLinkControl.getParent();
                }
                var sTargetHref = oLinkControl.getModel("$sapuimdcLink").getProperty("/titleLinkHref");
                if (sTargetHref) {
                  oShellHash = oShellServiceHelper.parseShellHash(sTargetHref);
                } else {
                  oShellHash = oShellServiceHelper.parseShellHash(sQuickViewPageTitleLinkIntent);
                  oShellHash.params = oNavArgs.params;
                }
                KeepAliveHelper.storeControlRefreshStrategyForHash(oView, oShellHash);
                return {
                  target: {
                    semanticObject: oShellHash.semanticObject,
                    action: oShellHash.action
                  },
                  params: oShellHash.params
                };
              }
            }
          } else {
            var oCurrentShellHash = oShellServiceHelper.parseShellHash(window.location.hash);
            KeepAliveHelper.storeControlRefreshStrategyForHash(oView, oCurrentShellHash);
            return {
              target: {
                semanticObject: oCurrentShellHash.semanticObject,
                action: oCurrentShellHash.action,
                appSpecificRoute: oCurrentShellHash.appSpecificRoute
              },
              params: oCurrentShellHash.params
            };
          }
        });
      }
      _QuickViewPage.prototype.onBeforeRendering.call(this, oEvent);
      var oPageContent = this.getPageContent();
      var oForm = oPageContent.form;
      if (oForm) {
        var _aContent = this.customContent;
        if (_aContent && _aContent.length > 0) {
          _aContent.forEach(function (_oContent) {
            var _oContentClone = _oContent.clone();
            _oContentClone.setModel(_this2.getModel());
            _oContentClone.setBindingContext(_this2.getBindingContext());
            oForm.addContent(_oContentClone);
          });
          setTimeout(function () {
            oForm.rerender();
          }, 0);
        }
      }
    };
    return CustomQuickViewPage;
  }(QuickViewPage), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "customContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "groups", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return CustomQuickViewPage;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDdXN0b21RdWlja1ZpZXdQYWdlIiwiZGVmaW5lVUk1Q2xhc3MiLCJhZ2dyZWdhdGlvbiIsInR5cGUiLCJtdWx0aXBsZSIsInNpbmd1bGFyTmFtZSIsImlzRGVmYXVsdCIsIm9uQmVmb3JlUmVuZGVyaW5nIiwib0V2ZW50IiwiZ2V0UGFyZW50IiwiaXNBIiwiZ2V0UHJvcGVydHkiLCJzZXRDcm9zc0FwcE5hdkNhbGxiYWNrIiwic1F1aWNrVmlld1BhZ2VUaXRsZUxpbmtIcmVmIiwiRGVsZWdhdGVVdGlsIiwiZ2V0Q3VzdG9tRGF0YSIsIm9WaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3Iiwib0FwcENvbXBvbmVudCIsImdldEFwcENvbXBvbmVudCIsIm9TaGVsbFNlcnZpY2VIZWxwZXIiLCJnZXRTaGVsbFNlcnZpY2VzIiwib1NoZWxsSGFzaCIsInBhcnNlU2hlbGxIYXNoIiwib05hdkFyZ3MiLCJ0YXJnZXQiLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsInBhcmFtcyIsInNRdWlja1ZpZXdQYWdlVGl0bGVMaW5rSW50ZW50Iiwib0Nyb3NzQXBwTmF2aWdhdG9yIiwiaXNOYXZpZ2F0aW9uU3VwcG9ydGVkIiwib0xpbmtDb250cm9sIiwic1RhcmdldEhyZWYiLCJnZXRNb2RlbCIsIktlZXBBbGl2ZUhlbHBlciIsInN0b3JlQ29udHJvbFJlZnJlc2hTdHJhdGVneUZvckhhc2giLCJvQ3VycmVudFNoZWxsSGFzaCIsIndpbmRvdyIsImxvY2F0aW9uIiwiaGFzaCIsImFwcFNwZWNpZmljUm91dGUiLCJvUGFnZUNvbnRlbnQiLCJnZXRQYWdlQ29udGVudCIsIm9Gb3JtIiwiZm9ybSIsIl9hQ29udGVudCIsImN1c3RvbUNvbnRlbnQiLCJsZW5ndGgiLCJmb3JFYWNoIiwiX29Db250ZW50IiwiX29Db250ZW50Q2xvbmUiLCJjbG9uZSIsInNldE1vZGVsIiwic2V0QmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImFkZENvbnRlbnQiLCJzZXRUaW1lb3V0IiwicmVyZW5kZXIiLCJRdWlja1ZpZXdQYWdlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDdXN0b21RdWlja1ZpZXdQYWdlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEtlZXBBbGl2ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9LZWVwQWxpdmVIZWxwZXJcIjtcbmltcG9ydCBEZWxlZ2F0ZVV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgUXVpY2tWaWV3UGFnZSBmcm9tIFwic2FwL20vUXVpY2tWaWV3UGFnZVwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9scy5DdXN0b21RdWlja1ZpZXdQYWdlXCIpXG5jbGFzcyBDdXN0b21RdWlja1ZpZXdQYWdlIGV4dGVuZHMgUXVpY2tWaWV3UGFnZSB7XG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLnVpLmNvcmUuQ29udHJvbFwiLCBtdWx0aXBsZTogdHJ1ZSB9KVxuXHRjdXN0b21Db250ZW50ITogQ29udHJvbFtdO1xuXHRAYWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC5tLlF1aWNrVmlld0dyb3VwXCIsIG11bHRpcGxlOiB0cnVlLCBzaW5ndWxhck5hbWU6IFwiZ3JvdXBcIiwgaXNEZWZhdWx0OiB0cnVlIH0pXG5cdGdyb3VwcyE6IENvbnRyb2xbXTtcblxuXHRvbkJlZm9yZVJlbmRlcmluZyhvRXZlbnQ6IGFueSkge1xuXHRcdGlmIChcblx0XHRcdHRoaXMuZ2V0UGFyZW50KCkgJiZcblx0XHRcdHRoaXMuZ2V0UGFyZW50KCkuaXNBKFwic2FwLmZlLmNvcmUuY29udHJvbHMuQ29uZGl0aW9uYWxXcmFwcGVyXCIpICYmXG5cdFx0XHR0aGlzLmdldFBhcmVudCgpLmdldFByb3BlcnR5KFwiY29uZGl0aW9uXCIpID09PSB0cnVlXG5cdFx0KSB7XG5cdFx0XHR0aGlzLnNldENyb3NzQXBwTmF2Q2FsbGJhY2soKCkgPT4ge1xuXHRcdFx0XHRjb25zdCBzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0hyZWYgPSAoRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEgYXMgYW55KSh0aGlzLCBcInRpdGxlTGlua1wiKTtcblx0XHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KHRoaXMpO1xuXHRcdFx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9WaWV3KTtcblx0XHRcdFx0Y29uc3Qgb1NoZWxsU2VydmljZUhlbHBlciA9IG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRcdFx0XHRsZXQgb1NoZWxsSGFzaCA9IG9TaGVsbFNlcnZpY2VIZWxwZXIucGFyc2VTaGVsbEhhc2goc1F1aWNrVmlld1BhZ2VUaXRsZUxpbmtIcmVmKTtcblx0XHRcdFx0Y29uc3Qgb05hdkFyZ3MgPSB7XG5cdFx0XHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogb1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdGFjdGlvbjogb1NoZWxsSGFzaC5hY3Rpb25cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHBhcmFtczogb1NoZWxsSGFzaC5wYXJhbXNcblx0XHRcdFx0fTtcblx0XHRcdFx0Y29uc3Qgc1F1aWNrVmlld1BhZ2VUaXRsZUxpbmtJbnRlbnQgPSBgJHtvTmF2QXJncy50YXJnZXQuc2VtYW50aWNPYmplY3R9LSR7b05hdkFyZ3MudGFyZ2V0LmFjdGlvbn1gO1xuXG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudCAmJlxuXHRcdFx0XHRcdHRoaXMub0Nyb3NzQXBwTmF2aWdhdG9yICYmXG5cdFx0XHRcdFx0dGhpcy5vQ3Jvc3NBcHBOYXZpZ2F0b3IuaXNOYXZpZ2F0aW9uU3VwcG9ydGVkKFtzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudF0pXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGlmIChzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudCAmJiBzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudCAhPT0gXCJcIikge1xuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudCA9PT0gXCJzdHJpbmdcIiAmJiBzUXVpY2tWaWV3UGFnZVRpdGxlTGlua0ludGVudCAhPT0gXCJcIikge1xuXHRcdFx0XHRcdFx0XHRsZXQgb0xpbmtDb250cm9sID0gdGhpcy5nZXRQYXJlbnQoKTtcblx0XHRcdFx0XHRcdFx0d2hpbGUgKG9MaW5rQ29udHJvbCAmJiAhb0xpbmtDb250cm9sLmlzQShcInNhcC51aS5tZGMuTGlua1wiKSkge1xuXHRcdFx0XHRcdFx0XHRcdG9MaW5rQ29udHJvbCA9IG9MaW5rQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRjb25zdCBzVGFyZ2V0SHJlZjogc3RyaW5nID0gb0xpbmtDb250cm9sLmdldE1vZGVsKFwiJHNhcHVpbWRjTGlua1wiKS5nZXRQcm9wZXJ0eShcIi90aXRsZUxpbmtIcmVmXCIpO1xuXHRcdFx0XHRcdFx0XHRpZiAoc1RhcmdldEhyZWYpIHtcblx0XHRcdFx0XHRcdFx0XHRvU2hlbGxIYXNoID0gb1NoZWxsU2VydmljZUhlbHBlci5wYXJzZVNoZWxsSGFzaChzVGFyZ2V0SHJlZik7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0b1NoZWxsSGFzaCA9IG9TaGVsbFNlcnZpY2VIZWxwZXIucGFyc2VTaGVsbEhhc2goc1F1aWNrVmlld1BhZ2VUaXRsZUxpbmtJbnRlbnQpO1xuXHRcdFx0XHRcdFx0XHRcdG9TaGVsbEhhc2gucGFyYW1zID0gb05hdkFyZ3MucGFyYW1zO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdEtlZXBBbGl2ZUhlbHBlci5zdG9yZUNvbnRyb2xSZWZyZXNoU3RyYXRlZ3lGb3JIYXNoKG9WaWV3LCBvU2hlbGxIYXNoKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHR0YXJnZXQ6IHtcblx0XHRcdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0XHRcdFx0YWN0aW9uOiBvU2hlbGxIYXNoLmFjdGlvblxuXHRcdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdFx0cGFyYW1zOiBvU2hlbGxIYXNoLnBhcmFtc1xuXHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRjb25zdCBvQ3VycmVudFNoZWxsSGFzaCA9IG9TaGVsbFNlcnZpY2VIZWxwZXIucGFyc2VTaGVsbEhhc2god2luZG93LmxvY2F0aW9uLmhhc2gpO1xuXHRcdFx0XHRcdEtlZXBBbGl2ZUhlbHBlci5zdG9yZUNvbnRyb2xSZWZyZXNoU3RyYXRlZ3lGb3JIYXNoKG9WaWV3LCBvQ3VycmVudFNoZWxsSGFzaCk7XG5cblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0dGFyZ2V0OiB7XG5cdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvQ3VycmVudFNoZWxsSGFzaC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdFx0YWN0aW9uOiBvQ3VycmVudFNoZWxsSGFzaC5hY3Rpb24sXG5cdFx0XHRcdFx0XHRcdGFwcFNwZWNpZmljUm91dGU6IG9DdXJyZW50U2hlbGxIYXNoLmFwcFNwZWNpZmljUm91dGVcblx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRwYXJhbXM6IG9DdXJyZW50U2hlbGxIYXNoLnBhcmFtc1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRzdXBlci5vbkJlZm9yZVJlbmRlcmluZyhvRXZlbnQpO1xuXHRcdGNvbnN0IG9QYWdlQ29udGVudCA9IHRoaXMuZ2V0UGFnZUNvbnRlbnQoKTtcblx0XHRjb25zdCBvRm9ybSA9IG9QYWdlQ29udGVudC5mb3JtO1xuXHRcdGlmIChvRm9ybSkge1xuXHRcdFx0Y29uc3QgX2FDb250ZW50ID0gdGhpcy5jdXN0b21Db250ZW50O1xuXHRcdFx0aWYgKF9hQ29udGVudCAmJiBfYUNvbnRlbnQubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRfYUNvbnRlbnQuZm9yRWFjaCgoX29Db250ZW50OiBhbnkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBfb0NvbnRlbnRDbG9uZSA9IF9vQ29udGVudC5jbG9uZSgpO1xuXHRcdFx0XHRcdF9vQ29udGVudENsb25lLnNldE1vZGVsKHRoaXMuZ2V0TW9kZWwoKSk7XG5cdFx0XHRcdFx0X29Db250ZW50Q2xvbmUuc2V0QmluZGluZ0NvbnRleHQodGhpcy5nZXRCaW5kaW5nQ29udGV4dCgpKTtcblx0XHRcdFx0XHRvRm9ybS5hZGRDb250ZW50KF9vQ29udGVudENsb25lKTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdG9Gb3JtLnJlcmVuZGVyKCk7XG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufVxuXG5pbnRlcmZhY2UgQ3VzdG9tUXVpY2tWaWV3UGFnZSB7XG5cdC8vIFByaXZhdGUgaW4gVUk1XG5cdG9Dcm9zc0FwcE5hdmlnYXRvcjogYW55O1xuXG5cdC8vIFByaXZhdGUgaW4gVUk1XG5cdGdldFBhZ2VDb250ZW50KCk6IGFueTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgQ3VzdG9tUXVpY2tWaWV3UGFnZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztNQVFNQSxtQkFBbUIsV0FEeEJDLGNBQWMsQ0FBQywwQ0FBMEMsQ0FBQyxVQUV6REMsV0FBVyxDQUFDO0lBQUVDLElBQUksRUFBRSxxQkFBcUI7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBRTVERixXQUFXLENBQUM7SUFBRUMsSUFBSSxFQUFFLHNCQUFzQjtJQUFFQyxRQUFRLEVBQUUsSUFBSTtJQUFFQyxZQUFZLEVBQUUsT0FBTztJQUFFQyxTQUFTLEVBQUU7RUFBSyxDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFBQSxPQUd0R0MsaUJBQWlCLEdBQWpCLDJCQUFrQkMsTUFBVyxFQUFFO01BQUE7TUFDOUIsSUFDQyxJQUFJLENBQUNDLFNBQVMsRUFBRSxJQUNoQixJQUFJLENBQUNBLFNBQVMsRUFBRSxDQUFDQyxHQUFHLENBQUMseUNBQXlDLENBQUMsSUFDL0QsSUFBSSxDQUFDRCxTQUFTLEVBQUUsQ0FBQ0UsV0FBVyxDQUFDLFdBQVcsQ0FBQyxLQUFLLElBQUksRUFDakQ7UUFDRCxJQUFJLENBQUNDLHNCQUFzQixDQUFDLFlBQU07VUFDakMsSUFBTUMsMkJBQTJCLEdBQUlDLFlBQVksQ0FBQ0MsYUFBYSxDQUFTLE1BQUksRUFBRSxXQUFXLENBQUM7VUFDMUYsSUFBTUMsS0FBSyxHQUFHQyxXQUFXLENBQUNDLGFBQWEsQ0FBQyxNQUFJLENBQUM7VUFDN0MsSUFBTUMsYUFBYSxHQUFHRixXQUFXLENBQUNHLGVBQWUsQ0FBQ0osS0FBSyxDQUFDO1VBQ3hELElBQU1LLG1CQUFtQixHQUFHRixhQUFhLENBQUNHLGdCQUFnQixFQUFFO1VBQzVELElBQUlDLFVBQVUsR0FBR0YsbUJBQW1CLENBQUNHLGNBQWMsQ0FBQ1gsMkJBQTJCLENBQUM7VUFDaEYsSUFBTVksUUFBUSxHQUFHO1lBQ2hCQyxNQUFNLEVBQUU7Y0FDUEMsY0FBYyxFQUFFSixVQUFVLENBQUNJLGNBQWM7Y0FDekNDLE1BQU0sRUFBRUwsVUFBVSxDQUFDSztZQUNwQixDQUFDO1lBQ0RDLE1BQU0sRUFBRU4sVUFBVSxDQUFDTTtVQUNwQixDQUFDO1VBQ0QsSUFBTUMsNkJBQTZCLGFBQU1MLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDQyxjQUFjLGNBQUlGLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDRSxNQUFNLENBQUU7VUFFbkcsSUFDQ0UsNkJBQTZCLElBQzdCLE1BQUksQ0FBQ0Msa0JBQWtCLElBQ3ZCLE1BQUksQ0FBQ0Esa0JBQWtCLENBQUNDLHFCQUFxQixDQUFDLENBQUNGLDZCQUE2QixDQUFDLENBQUMsRUFDN0U7WUFDRCxJQUFJQSw2QkFBNkIsSUFBSUEsNkJBQTZCLEtBQUssRUFBRSxFQUFFO2NBQzFFLElBQUksT0FBT0EsNkJBQTZCLEtBQUssUUFBUSxJQUFJQSw2QkFBNkIsS0FBSyxFQUFFLEVBQUU7Z0JBQzlGLElBQUlHLFlBQVksR0FBRyxNQUFJLENBQUN4QixTQUFTLEVBQUU7Z0JBQ25DLE9BQU93QixZQUFZLElBQUksQ0FBQ0EsWUFBWSxDQUFDdkIsR0FBRyxDQUFDLGlCQUFpQixDQUFDLEVBQUU7a0JBQzVEdUIsWUFBWSxHQUFHQSxZQUFZLENBQUN4QixTQUFTLEVBQUU7Z0JBQ3hDO2dCQUNBLElBQU15QixXQUFtQixHQUFHRCxZQUFZLENBQUNFLFFBQVEsQ0FBQyxlQUFlLENBQUMsQ0FBQ3hCLFdBQVcsQ0FBQyxnQkFBZ0IsQ0FBQztnQkFDaEcsSUFBSXVCLFdBQVcsRUFBRTtrQkFDaEJYLFVBQVUsR0FBR0YsbUJBQW1CLENBQUNHLGNBQWMsQ0FBQ1UsV0FBVyxDQUFDO2dCQUM3RCxDQUFDLE1BQU07a0JBQ05YLFVBQVUsR0FBR0YsbUJBQW1CLENBQUNHLGNBQWMsQ0FBQ00sNkJBQTZCLENBQUM7a0JBQzlFUCxVQUFVLENBQUNNLE1BQU0sR0FBR0osUUFBUSxDQUFDSSxNQUFNO2dCQUNwQztnQkFDQU8sZUFBZSxDQUFDQyxrQ0FBa0MsQ0FBQ3JCLEtBQUssRUFBRU8sVUFBVSxDQUFDO2dCQUNyRSxPQUFPO2tCQUNORyxNQUFNLEVBQUU7b0JBQ1BDLGNBQWMsRUFBRUosVUFBVSxDQUFDSSxjQUFjO29CQUN6Q0MsTUFBTSxFQUFFTCxVQUFVLENBQUNLO2tCQUNwQixDQUFDO2tCQUNEQyxNQUFNLEVBQUVOLFVBQVUsQ0FBQ007Z0JBQ3BCLENBQUM7Y0FDRjtZQUNEO1VBQ0QsQ0FBQyxNQUFNO1lBQ04sSUFBTVMsaUJBQWlCLEdBQUdqQixtQkFBbUIsQ0FBQ0csY0FBYyxDQUFDZSxNQUFNLENBQUNDLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDO1lBQ2xGTCxlQUFlLENBQUNDLGtDQUFrQyxDQUFDckIsS0FBSyxFQUFFc0IsaUJBQWlCLENBQUM7WUFFNUUsT0FBTztjQUNOWixNQUFNLEVBQUU7Z0JBQ1BDLGNBQWMsRUFBRVcsaUJBQWlCLENBQUNYLGNBQWM7Z0JBQ2hEQyxNQUFNLEVBQUVVLGlCQUFpQixDQUFDVixNQUFNO2dCQUNoQ2MsZ0JBQWdCLEVBQUVKLGlCQUFpQixDQUFDSTtjQUNyQyxDQUFDO2NBQ0RiLE1BQU0sRUFBRVMsaUJBQWlCLENBQUNUO1lBQzNCLENBQUM7VUFDRjtRQUNELENBQUMsQ0FBQztNQUNIO01BQ0EseUJBQU10QixpQkFBaUIsWUFBQ0MsTUFBTTtNQUM5QixJQUFNbUMsWUFBWSxHQUFHLElBQUksQ0FBQ0MsY0FBYyxFQUFFO01BQzFDLElBQU1DLEtBQUssR0FBR0YsWUFBWSxDQUFDRyxJQUFJO01BQy9CLElBQUlELEtBQUssRUFBRTtRQUNWLElBQU1FLFNBQVMsR0FBRyxJQUFJLENBQUNDLGFBQWE7UUFDcEMsSUFBSUQsU0FBUyxJQUFJQSxTQUFTLENBQUNFLE1BQU0sR0FBRyxDQUFDLEVBQUU7VUFDdENGLFNBQVMsQ0FBQ0csT0FBTyxDQUFDLFVBQUNDLFNBQWMsRUFBSztZQUNyQyxJQUFNQyxjQUFjLEdBQUdELFNBQVMsQ0FBQ0UsS0FBSyxFQUFFO1lBQ3hDRCxjQUFjLENBQUNFLFFBQVEsQ0FBQyxNQUFJLENBQUNuQixRQUFRLEVBQUUsQ0FBQztZQUN4Q2lCLGNBQWMsQ0FBQ0csaUJBQWlCLENBQUMsTUFBSSxDQUFDQyxpQkFBaUIsRUFBRSxDQUFDO1lBQzFEWCxLQUFLLENBQUNZLFVBQVUsQ0FBQ0wsY0FBYyxDQUFDO1VBQ2pDLENBQUMsQ0FBQztVQUNGTSxVQUFVLENBQUMsWUFBWTtZQUN0QmIsS0FBSyxDQUFDYyxRQUFRLEVBQUU7VUFDakIsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNOO01BQ0Q7SUFDRCxDQUFDO0lBQUE7RUFBQSxFQXZGZ0NDLGFBQWE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9Ba0doQzVELG1CQUFtQjtBQUFBIn0=