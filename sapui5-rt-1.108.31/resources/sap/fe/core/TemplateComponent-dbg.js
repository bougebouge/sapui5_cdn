/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/UIComponent", "sap/ui/mdc/p13n/StateUtil"], function (CommonUtils, ClassSupport, UIComponent, StateUtil) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var TemplateComponent = (_dec = defineUI5Class("sap.fe.core.TemplateComponent"), _dec2 = implementInterface("sap.ui.core.IAsyncContentCreation"), _dec3 = property({
    type: "string",
    defaultValue: null
  }), _dec4 = property({
    type: "string",
    defaultValue: null
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "object"
  }), _dec7 = property({
    type: "string[]"
  }), _dec8 = property({
    type: "object"
  }), _dec9 = property({
    type: "object"
  }), _dec10 = property({
    type: "boolean"
  }), _dec11 = property({
    type: "object"
  }), _dec12 = property({
    type: "string"
  }), _dec13 = event(), _dec14 = event(), _dec15 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_UIComponent) {
    _inheritsLoose(TemplateComponent, _UIComponent);
    function TemplateComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _UIComponent.call.apply(_UIComponent, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IAsyncContentCreation", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "bindingContextPattern", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigation", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enhanceI18n", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "controlConfiguration", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "allowDeepLinking", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "refreshStrategyOnAppRestore", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewType", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "containerDefined", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "heroesBatchReceived", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "workersBatchReceived", _descriptor14, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = TemplateComponent.prototype;
    _proto.setContainer = function setContainer(oContainer) {
      _UIComponent.prototype.setContainer.call(this, oContainer);
      this.fireEvent("containerDefined", {
        container: oContainer
      });
      return this;
    };
    _proto.init = function init() {
      this.oAppComponent = CommonUtils.getAppComponent(this);
      _UIComponent.prototype.init.call(this);
      var oStateChangeHandler = function (oEvent) {
        var oControl = oEvent.getParameter("control");
        if (oControl.isA("sap.ui.mdc.Table") || oControl.isA("sap.ui.mdc.FilterBar") || oControl.isA("sap.ui.mdc.Chart")) {
          var oMacroAPI = oControl.getParent();
          if (oMacroAPI !== null && oMacroAPI !== void 0 && oMacroAPI.fireStateChange) {
            oMacroAPI.fireStateChange();
          }
        }
      };
      StateUtil.detachStateChange(oStateChangeHandler);
      StateUtil.attachStateChange(oStateChangeHandler);
    }

    // This method is called by UI5 core to access to the component containing the customizing configuration.
    // as controller extensions are defined in the manifest for the app component and not for the
    // template component we return the app component.
    ;
    _proto.getExtensionComponent = function getExtensionComponent() {
      return this.oAppComponent;
    };
    _proto.getRootController = function getRootController() {
      var rootControl = this.getRootControl();
      var rootController;
      if (rootControl && rootControl.getController) {
        rootController = rootControl.getController();
      }
      return rootController;
    };
    _proto.onPageReady = function onPageReady(mParameters) {
      var rootController = this.getRootController();
      if (rootController && rootController.onPageReady) {
        rootController.onPageReady(mParameters);
      }
    };
    _proto.getNavigationConfiguration = function getNavigationConfiguration(sTargetPath) {
      var mNavigation = this.navigation;
      return mNavigation[sTargetPath];
    };
    _proto.getViewData = function getViewData() {
      var _this2 = this;
      var mProperties = this.getMetadata().getAllProperties();
      var oViewData = Object.keys(mProperties).reduce(function (mViewData, sPropertyName) {
        mViewData[sPropertyName] = mProperties[sPropertyName].get(_this2);
        return mViewData;
      }, {});

      // Access the internal _isFclEnabled which will be there
      oViewData.fclEnabled = this.oAppComponent._isFclEnabled();
      return oViewData;
    };
    _proto._getPageTitleInformation = function _getPageTitleInformation() {
      var rootControl = this.getRootControl();
      if (rootControl && rootControl.getController() && rootControl.getController()._getPageTitleInformation) {
        return rootControl.getController()._getPageTitleInformation();
      } else {
        return {};
      }
    };
    _proto.getExtensionAPI = function getExtensionAPI() {
      return this.getRootControl().getController().getExtensionAPI();
    };
    return TemplateComponent;
  }(UIComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IAsyncContentCreation", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return null;
    }
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return null;
    }
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "bindingContextPattern", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "navigation", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "enhanceI18n", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "controlConfiguration", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "allowDeepLinking", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "refreshStrategyOnAppRestore", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "viewType", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "XML";
    }
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "containerDefined", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "heroesBatchReceived", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "workersBatchReceived", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return TemplateComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0ZUNvbXBvbmVudCIsImRlZmluZVVJNUNsYXNzIiwiaW1wbGVtZW50SW50ZXJmYWNlIiwicHJvcGVydHkiLCJ0eXBlIiwiZGVmYXVsdFZhbHVlIiwiZXZlbnQiLCJzZXRDb250YWluZXIiLCJvQ29udGFpbmVyIiwiZmlyZUV2ZW50IiwiY29udGFpbmVyIiwiaW5pdCIsIm9BcHBDb21wb25lbnQiLCJDb21tb25VdGlscyIsImdldEFwcENvbXBvbmVudCIsIm9TdGF0ZUNoYW5nZUhhbmRsZXIiLCJvRXZlbnQiLCJvQ29udHJvbCIsImdldFBhcmFtZXRlciIsImlzQSIsIm9NYWNyb0FQSSIsImdldFBhcmVudCIsImZpcmVTdGF0ZUNoYW5nZSIsIlN0YXRlVXRpbCIsImRldGFjaFN0YXRlQ2hhbmdlIiwiYXR0YWNoU3RhdGVDaGFuZ2UiLCJnZXRFeHRlbnNpb25Db21wb25lbnQiLCJnZXRSb290Q29udHJvbGxlciIsInJvb3RDb250cm9sIiwiZ2V0Um9vdENvbnRyb2wiLCJyb290Q29udHJvbGxlciIsImdldENvbnRyb2xsZXIiLCJvblBhZ2VSZWFkeSIsIm1QYXJhbWV0ZXJzIiwiZ2V0TmF2aWdhdGlvbkNvbmZpZ3VyYXRpb24iLCJzVGFyZ2V0UGF0aCIsIm1OYXZpZ2F0aW9uIiwibmF2aWdhdGlvbiIsImdldFZpZXdEYXRhIiwibVByb3BlcnRpZXMiLCJnZXRNZXRhZGF0YSIsImdldEFsbFByb3BlcnRpZXMiLCJvVmlld0RhdGEiLCJPYmplY3QiLCJrZXlzIiwicmVkdWNlIiwibVZpZXdEYXRhIiwic1Byb3BlcnR5TmFtZSIsImdldCIsImZjbEVuYWJsZWQiLCJfaXNGY2xFbmFibGVkIiwiX2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uIiwiZ2V0RXh0ZW5zaW9uQVBJIiwiVUlDb21wb25lbnQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRlbXBsYXRlQ29tcG9uZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgZXZlbnQsIGltcGxlbWVudEludGVyZmFjZSwgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgQ29tcG9uZW50Q29udGFpbmVyIGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRDb250YWluZXJcIjtcbmltcG9ydCB0eXBlIHsgSUFzeW5jQ29udGVudENyZWF0aW9uIH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgVUlDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL1VJQ29tcG9uZW50XCI7XG5pbXBvcnQgU3RhdGVVdGlsIGZyb20gXCJzYXAvdWkvbWRjL3AxM24vU3RhdGVVdGlsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5UZW1wbGF0ZUNvbXBvbmVudFwiKVxuY2xhc3MgVGVtcGxhdGVDb21wb25lbnQgZXh0ZW5kcyBVSUNvbXBvbmVudCBpbXBsZW1lbnRzIElBc3luY0NvbnRlbnRDcmVhdGlvbiB7XG5cdEBpbXBsZW1lbnRJbnRlcmZhY2UoXCJzYXAudWkuY29yZS5JQXN5bmNDb250ZW50Q3JlYXRpb25cIilcblx0X19pbXBsZW1lbnRzX19zYXBfdWlfY29yZV9JQXN5bmNDb250ZW50Q3JlYXRpb246IGJvb2xlYW4gPSB0cnVlO1xuXG5cdC8qKlxuXHQgKiBOYW1lIG9mIHRoZSBPRGF0YSBlbnRpdHkgc2V0XG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0VmFsdWU6IG51bGwgfSlcblx0ZW50aXR5U2V0OiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuXHQvKipcblx0ICogQ29udGV4dCBQYXRoIGZvciByZW5kZXJpbmcgdGhlIHRlbXBsYXRlXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiLCBkZWZhdWx0VmFsdWU6IG51bGwgfSlcblx0Y29udGV4dFBhdGg6IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG5cdC8qKlxuXHQgKiBUaGUgcGF0dGVybiBmb3IgdGhlIGJpbmRpbmcgY29udGV4dCB0byBiZSBjcmVhdGUgYmFzZWQgb24gdGhlIHBhcmFtZXRlcnMgZnJvbSB0aGUgbmF2aWdhdGlvblxuXHQgKiBJZiBub3QgcHJvdmlkZWQgd2UnbGwgZGVmYXVsdCB0byB3aGF0IHdhcyBwYXNzZWQgaW4gdGhlIFVSTFxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRiaW5kaW5nQ29udGV4dFBhdHRlcm4hOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIE1hcCBvZiB1c2VkIE9EYXRhIG5hdmlnYXRpb25zIGFuZCBpdHMgcm91dGluZyB0YXJnZXRzXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcIm9iamVjdFwiIH0pXG5cdG5hdmlnYXRpb246IGFueTtcblxuXHQvKipcblx0ICogRW5oYW5jZSB0aGUgaTE4biBidW5kbGUgdXNlZCBmb3IgdGhpcyBwYWdlIHdpdGggb25lIG9yIG1vcmUgYXBwIHNwZWNpZmljIGkxOG4gcmVzb3VyY2UgYnVuZGxlcyBvciByZXNvdXJjZSBtb2RlbHNcblx0ICogb3IgYSBjb21iaW5hdGlvbiBvZiBib3RoLiBUaGUgbGFzdCByZXNvdXJjZSBidW5kbGUvbW9kZWwgaXMgZ2l2ZW4gaGlnaGVzdCBwcmlvcml0eVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdbXVwiIH0pXG5cdGVuaGFuY2VJMThuITogc3RyaW5nW107XG5cblx0LyoqXG5cdCAqIERlZmluZSBjb250cm9sIHJlbGF0ZWQgY29uZmlndXJhdGlvbiBzZXR0aW5nc1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJvYmplY3RcIiB9KVxuXHRjb250cm9sQ29uZmlndXJhdGlvbjogYW55O1xuXG5cdC8qKlxuXHQgKiBBZGp1c3RzIHRoZSB0ZW1wbGF0ZSBjb250ZW50XG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcIm9iamVjdFwiIH0pXG5cdGNvbnRlbnQ6IGFueTtcblxuXHQvKipcblx0ICogV2hldGhlciBvciBub3QgeW91IGNhbiByZWFjaCB0aGlzIHBhZ2UgZGlyZWN0bHkgdGhyb3VnaCBzZW1hbnRpYyBib29rbWFya3Ncblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGFsbG93RGVlcExpbmtpbmchOiBib29sZWFuO1xuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgY29udGV4dCBwYXRoIG9uIHRoZSBjb21wb25lbnQgdGhhdCBpcyByZWZyZXNoZWQgd2hlbiB0aGUgYXBwIGlzIHJlc3RvcmVkIHVzaW5nIGtlZXAgYWxpdmUgbW9kZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJvYmplY3RcIiB9KVxuXHRyZWZyZXNoU3RyYXRlZ3lPbkFwcFJlc3RvcmU6IGFueTtcblxuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHZpZXdUeXBlID0gXCJYTUxcIjtcblxuXHRAZXZlbnQoKVxuXHRjb250YWluZXJEZWZpbmVkITogRnVuY3Rpb247XG5cblx0QGV2ZW50KClcblx0aGVyb2VzQmF0Y2hSZWNlaXZlZCE6IEZ1bmN0aW9uO1xuXG5cdEBldmVudCgpXG5cdHdvcmtlcnNCYXRjaFJlY2VpdmVkITogRnVuY3Rpb247XG5cblx0cHJvdGVjdGVkIG9BcHBDb21wb25lbnQhOiBBcHBDb21wb25lbnQ7XG5cblx0c2V0Q29udGFpbmVyKG9Db250YWluZXI6IENvbXBvbmVudENvbnRhaW5lcik6IHRoaXMge1xuXHRcdHN1cGVyLnNldENvbnRhaW5lcihvQ29udGFpbmVyKTtcblx0XHR0aGlzLmZpcmVFdmVudChcImNvbnRhaW5lckRlZmluZWRcIiwgeyBjb250YWluZXI6IG9Db250YWluZXIgfSk7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblxuXHRpbml0KCkge1xuXHRcdHRoaXMub0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzKTtcblx0XHRzdXBlci5pbml0KCk7XG5cdFx0Y29uc3Qgb1N0YXRlQ2hhbmdlSGFuZGxlciA9IGZ1bmN0aW9uIChvRXZlbnQ6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2wgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiY29udHJvbFwiKTtcblx0XHRcdGlmIChvQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpIHx8IG9Db250cm9sLmlzQShcInNhcC51aS5tZGMuRmlsdGVyQmFyXCIpIHx8IG9Db250cm9sLmlzQShcInNhcC51aS5tZGMuQ2hhcnRcIikpIHtcblx0XHRcdFx0Y29uc3Qgb01hY3JvQVBJID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdGlmIChvTWFjcm9BUEk/LmZpcmVTdGF0ZUNoYW5nZSkge1xuXHRcdFx0XHRcdG9NYWNyb0FQSS5maXJlU3RhdGVDaGFuZ2UoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0U3RhdGVVdGlsLmRldGFjaFN0YXRlQ2hhbmdlKG9TdGF0ZUNoYW5nZUhhbmRsZXIpO1xuXHRcdFN0YXRlVXRpbC5hdHRhY2hTdGF0ZUNoYW5nZShvU3RhdGVDaGFuZ2VIYW5kbGVyKTtcblx0fVxuXG5cdC8vIFRoaXMgbWV0aG9kIGlzIGNhbGxlZCBieSBVSTUgY29yZSB0byBhY2Nlc3MgdG8gdGhlIGNvbXBvbmVudCBjb250YWluaW5nIHRoZSBjdXN0b21pemluZyBjb25maWd1cmF0aW9uLlxuXHQvLyBhcyBjb250cm9sbGVyIGV4dGVuc2lvbnMgYXJlIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0IGZvciB0aGUgYXBwIGNvbXBvbmVudCBhbmQgbm90IGZvciB0aGVcblx0Ly8gdGVtcGxhdGUgY29tcG9uZW50IHdlIHJldHVybiB0aGUgYXBwIGNvbXBvbmVudC5cblx0Z2V0RXh0ZW5zaW9uQ29tcG9uZW50KCk6IEFwcENvbXBvbmVudCB7XG5cdFx0cmV0dXJuIHRoaXMub0FwcENvbXBvbmVudDtcblx0fVxuXG5cdGdldFJvb3RDb250cm9sbGVyKCk6IGFueSB8IHVuZGVmaW5lZCB7XG5cdFx0Y29uc3Qgcm9vdENvbnRyb2w6IFZpZXcgPSB0aGlzLmdldFJvb3RDb250cm9sKCkgYXMgVmlldztcblx0XHRsZXQgcm9vdENvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyIHwgdW5kZWZpbmVkO1xuXHRcdGlmIChyb290Q29udHJvbCAmJiByb290Q29udHJvbC5nZXRDb250cm9sbGVyKSB7XG5cdFx0XHRyb290Q29udHJvbGxlciA9IHJvb3RDb250cm9sLmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcjtcblx0XHR9XG5cdFx0cmV0dXJuIHJvb3RDb250cm9sbGVyO1xuXHR9XG5cblx0b25QYWdlUmVhZHkobVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGNvbnN0IHJvb3RDb250cm9sbGVyID0gdGhpcy5nZXRSb290Q29udHJvbGxlcigpO1xuXHRcdGlmIChyb290Q29udHJvbGxlciAmJiByb290Q29udHJvbGxlci5vblBhZ2VSZWFkeSkge1xuXHRcdFx0cm9vdENvbnRyb2xsZXIub25QYWdlUmVhZHkobVBhcmFtZXRlcnMpO1xuXHRcdH1cblx0fVxuXG5cdGdldE5hdmlnYXRpb25Db25maWd1cmF0aW9uKHNUYXJnZXRQYXRoOiBzdHJpbmcpOiBhbnkge1xuXHRcdGNvbnN0IG1OYXZpZ2F0aW9uID0gdGhpcy5uYXZpZ2F0aW9uO1xuXHRcdHJldHVybiBtTmF2aWdhdGlvbltzVGFyZ2V0UGF0aF07XG5cdH1cblxuXHRnZXRWaWV3RGF0YSgpIHtcblx0XHRjb25zdCBtUHJvcGVydGllcyA9IHRoaXMuZ2V0TWV0YWRhdGEoKS5nZXRBbGxQcm9wZXJ0aWVzKCk7XG5cdFx0Y29uc3Qgb1ZpZXdEYXRhID0gT2JqZWN0LmtleXMobVByb3BlcnRpZXMpLnJlZHVjZSgobVZpZXdEYXRhOiBhbnksIHNQcm9wZXJ0eU5hbWU6IGFueSkgPT4ge1xuXHRcdFx0bVZpZXdEYXRhW3NQcm9wZXJ0eU5hbWVdID0gKG1Qcm9wZXJ0aWVzW3NQcm9wZXJ0eU5hbWVdIGFzIGFueSkuZ2V0KHRoaXMpO1xuXHRcdFx0cmV0dXJuIG1WaWV3RGF0YTtcblx0XHR9LCB7fSk7XG5cblx0XHQvLyBBY2Nlc3MgdGhlIGludGVybmFsIF9pc0ZjbEVuYWJsZWQgd2hpY2ggd2lsbCBiZSB0aGVyZVxuXHRcdG9WaWV3RGF0YS5mY2xFbmFibGVkID0gdGhpcy5vQXBwQ29tcG9uZW50Ll9pc0ZjbEVuYWJsZWQoKTtcblxuXHRcdHJldHVybiBvVmlld0RhdGE7XG5cdH1cblxuXHRfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24oKSB7XG5cdFx0Y29uc3Qgcm9vdENvbnRyb2wgPSB0aGlzLmdldFJvb3RDb250cm9sKCkgYXMgVmlldztcblx0XHRpZiAocm9vdENvbnRyb2wgJiYgcm9vdENvbnRyb2wuZ2V0Q29udHJvbGxlcigpICYmIChyb290Q29udHJvbC5nZXRDb250cm9sbGVyKCkgYXMgYW55KS5fZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24pIHtcblx0XHRcdHJldHVybiAocm9vdENvbnRyb2wuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkuX2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB7fTtcblx0XHR9XG5cdH1cblxuXHRnZXRFeHRlbnNpb25BUEkoKSB7XG5cdFx0cmV0dXJuICgodGhpcy5nZXRSb290Q29udHJvbCgpIGFzIFZpZXcpLmdldENvbnRyb2xsZXIoKSBhcyBhbnkpLmdldEV4dGVuc2lvbkFQSSgpO1xuXHR9XG59XG5pbnRlcmZhY2UgVGVtcGxhdGVDb21wb25lbnQge1xuXHQvLyBUT0RPOiB0aGlzIHNob3VsZCBiZSBpZGVhbGx5IGJlIGhhbmRsZWQgYnkgdGhlIGVkaXRmbG93L3JvdXRpbmcgd2l0aG91dCB0aGUgbmVlZCB0byBoYXZlIHRoaXMgbWV0aG9kIGluIHRoZSBvYmplY3QgcGFnZSAtIGZvciBub3cga2VlcCBpdCBoZXJlXG5cdGNyZWF0ZURlZmVycmVkQ29udGV4dD8oc1BhdGg6IHN0cmluZywgb0xpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nLCBiQWN0aW9uQ3JlYXRlOiBib29sZWFuKTogdm9pZDtcbn1cbmV4cG9ydCBkZWZhdWx0IFRlbXBsYXRlQ29tcG9uZW50O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7TUFZTUEsaUJBQWlCLFdBRHRCQyxjQUFjLENBQUMsK0JBQStCLENBQUMsVUFFOUNDLGtCQUFrQixDQUFDLG1DQUFtQyxDQUFDLFVBTXZEQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBTWhERixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBT2hERixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBTTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBTzVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVcsQ0FBQyxDQUFDLFVBTTlCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBTTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFdBTTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVUsQ0FBQyxDQUFDLFdBSzdCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFdBRzVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFdBRzVCRSxLQUFLLEVBQUUsV0FHUEEsS0FBSyxFQUFFLFdBR1BBLEtBQUssRUFBRTtJQUFBO0lBQUE7TUFBQTtNQUFBO1FBQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBLE9BS1JDLFlBQVksR0FBWixzQkFBYUMsVUFBOEIsRUFBUTtNQUNsRCx1QkFBTUQsWUFBWSxZQUFDQyxVQUFVO01BQzdCLElBQUksQ0FBQ0MsU0FBUyxDQUFDLGtCQUFrQixFQUFFO1FBQUVDLFNBQVMsRUFBRUY7TUFBVyxDQUFDLENBQUM7TUFDN0QsT0FBTyxJQUFJO0lBQ1osQ0FBQztJQUFBLE9BRURHLElBQUksR0FBSixnQkFBTztNQUNOLElBQUksQ0FBQ0MsYUFBYSxHQUFHQyxXQUFXLENBQUNDLGVBQWUsQ0FBQyxJQUFJLENBQUM7TUFDdEQsdUJBQU1ILElBQUk7TUFDVixJQUFNSSxtQkFBbUIsR0FBRyxVQUFVQyxNQUFXLEVBQUU7UUFDbEQsSUFBTUMsUUFBUSxHQUFHRCxNQUFNLENBQUNFLFlBQVksQ0FBQyxTQUFTLENBQUM7UUFDL0MsSUFBSUQsUUFBUSxDQUFDRSxHQUFHLENBQUMsa0JBQWtCLENBQUMsSUFBSUYsUUFBUSxDQUFDRSxHQUFHLENBQUMsc0JBQXNCLENBQUMsSUFBSUYsUUFBUSxDQUFDRSxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRTtVQUNqSCxJQUFNQyxTQUFTLEdBQUdILFFBQVEsQ0FBQ0ksU0FBUyxFQUFFO1VBQ3RDLElBQUlELFNBQVMsYUFBVEEsU0FBUyxlQUFUQSxTQUFTLENBQUVFLGVBQWUsRUFBRTtZQUMvQkYsU0FBUyxDQUFDRSxlQUFlLEVBQUU7VUFDNUI7UUFDRDtNQUNELENBQUM7TUFDREMsU0FBUyxDQUFDQyxpQkFBaUIsQ0FBQ1QsbUJBQW1CLENBQUM7TUFDaERRLFNBQVMsQ0FBQ0UsaUJBQWlCLENBQUNWLG1CQUFtQixDQUFDO0lBQ2pEOztJQUVBO0lBQ0E7SUFDQTtJQUFBO0lBQUEsT0FDQVcscUJBQXFCLEdBQXJCLGlDQUFzQztNQUNyQyxPQUFPLElBQUksQ0FBQ2QsYUFBYTtJQUMxQixDQUFDO0lBQUEsT0FFRGUsaUJBQWlCLEdBQWpCLDZCQUFxQztNQUNwQyxJQUFNQyxXQUFpQixHQUFHLElBQUksQ0FBQ0MsY0FBYyxFQUFVO01BQ3ZELElBQUlDLGNBQTBDO01BQzlDLElBQUlGLFdBQVcsSUFBSUEsV0FBVyxDQUFDRyxhQUFhLEVBQUU7UUFDN0NELGNBQWMsR0FBR0YsV0FBVyxDQUFDRyxhQUFhLEVBQW9CO01BQy9EO01BQ0EsT0FBT0QsY0FBYztJQUN0QixDQUFDO0lBQUEsT0FFREUsV0FBVyxHQUFYLHFCQUFZQyxXQUFnQixFQUFFO01BQzdCLElBQU1ILGNBQWMsR0FBRyxJQUFJLENBQUNILGlCQUFpQixFQUFFO01BQy9DLElBQUlHLGNBQWMsSUFBSUEsY0FBYyxDQUFDRSxXQUFXLEVBQUU7UUFDakRGLGNBQWMsQ0FBQ0UsV0FBVyxDQUFDQyxXQUFXLENBQUM7TUFDeEM7SUFDRCxDQUFDO0lBQUEsT0FFREMsMEJBQTBCLEdBQTFCLG9DQUEyQkMsV0FBbUIsRUFBTztNQUNwRCxJQUFNQyxXQUFXLEdBQUcsSUFBSSxDQUFDQyxVQUFVO01BQ25DLE9BQU9ELFdBQVcsQ0FBQ0QsV0FBVyxDQUFDO0lBQ2hDLENBQUM7SUFBQSxPQUVERyxXQUFXLEdBQVgsdUJBQWM7TUFBQTtNQUNiLElBQU1DLFdBQVcsR0FBRyxJQUFJLENBQUNDLFdBQVcsRUFBRSxDQUFDQyxnQkFBZ0IsRUFBRTtNQUN6RCxJQUFNQyxTQUFTLEdBQUdDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDTCxXQUFXLENBQUMsQ0FBQ00sTUFBTSxDQUFDLFVBQUNDLFNBQWMsRUFBRUMsYUFBa0IsRUFBSztRQUN6RkQsU0FBUyxDQUFDQyxhQUFhLENBQUMsR0FBSVIsV0FBVyxDQUFDUSxhQUFhLENBQUMsQ0FBU0MsR0FBRyxDQUFDLE1BQUksQ0FBQztRQUN4RSxPQUFPRixTQUFTO01BQ2pCLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQzs7TUFFTjtNQUNBSixTQUFTLENBQUNPLFVBQVUsR0FBRyxJQUFJLENBQUNyQyxhQUFhLENBQUNzQyxhQUFhLEVBQUU7TUFFekQsT0FBT1IsU0FBUztJQUNqQixDQUFDO0lBQUEsT0FFRFMsd0JBQXdCLEdBQXhCLG9DQUEyQjtNQUMxQixJQUFNdkIsV0FBVyxHQUFHLElBQUksQ0FBQ0MsY0FBYyxFQUFVO01BQ2pELElBQUlELFdBQVcsSUFBSUEsV0FBVyxDQUFDRyxhQUFhLEVBQUUsSUFBS0gsV0FBVyxDQUFDRyxhQUFhLEVBQUUsQ0FBU29CLHdCQUF3QixFQUFFO1FBQ2hILE9BQVF2QixXQUFXLENBQUNHLGFBQWEsRUFBRSxDQUFTb0Isd0JBQXdCLEVBQUU7TUFDdkUsQ0FBQyxNQUFNO1FBQ04sT0FBTyxDQUFDLENBQUM7TUFDVjtJQUNELENBQUM7SUFBQSxPQUVEQyxlQUFlLEdBQWYsMkJBQWtCO01BQ2pCLE9BQVMsSUFBSSxDQUFDdkIsY0FBYyxFQUFFLENBQVVFLGFBQWEsRUFBRSxDQUFTcUIsZUFBZSxFQUFFO0lBQ2xGLENBQUM7SUFBQTtFQUFBLEVBbko4QkMsV0FBVztJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FFaUIsSUFBSTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BTXBDLElBQUk7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQU1GLElBQUk7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0E4Q3RCLEtBQUs7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUEsT0E2RkZyRCxpQkFBaUI7QUFBQSJ9