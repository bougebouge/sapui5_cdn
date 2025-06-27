/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/ui/model/resource/ResourceModel"], function (Service, ServiceFactory, ResourceModel) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  var ResourceModelService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(ResourceModelService, _Service);
    function ResourceModelService() {
      return _Service.apply(this, arguments) || this;
    }
    _exports.ResourceModelService = ResourceModelService;
    var _proto = ResourceModelService.prototype;
    _proto.init = function init() {
      var _this = this;
      var oContext = this.getContext();
      var mSettings = oContext.settings;
      this.oFactory = oContext.factory;

      // When enhancing i18n keys the value in the last resource bundle takes precedence
      // hence arrange various resource bundles so that enhanceI18n provided by the application is the last.
      // The following order is used :
      // 1. sap.fe bundle - sap.fe.core.messagebundle (passed with mSettings.bundles)
      // 2. sap.fe bundle - sap.fe.templates.messagebundle (passed with mSettings.bundles)
      // 3. Multiple bundles passed by the application as part of enhanceI18n
      var aBundles = mSettings.bundles.concat(mSettings.enhanceI18n || []).map(function (vI18n) {
        // if value passed for enhanceI18n is a Resource Model, return the associated bundle
        // else the value is a bundleUrl, return Resource Bundle configuration so that a bundle can be created
        return typeof vI18n.isA === "function" && vI18n.isA("sap.ui.model.resource.ResourceModel") ? vI18n.getResourceBundle() : {
          bundleName: vI18n.replace(/\//g, ".")
        };
      });
      this.oResourceModel = new ResourceModel({
        bundleName: aBundles[0].bundleName,
        enhanceWith: aBundles.slice(1),
        async: true
      });
      if (oContext.scopeType === "component") {
        var oComponent = oContext.scopeObject;
        oComponent.setModel(this.oResourceModel, mSettings.modelName);
      }
      this.initPromise = Promise.all([this.oResourceModel.getResourceBundle(), this.oResourceModel._pEnhanced || Promise.resolve()]).then(function (oBundle) {
        _this.oResourceModel.__bundle = oBundle[0];
        return _this;
      });
    };
    _proto.getResourceModel = function getResourceModel() {
      return this.oResourceModel;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    _proto.exit = function exit() {
      // Deregister global instance
      this.oFactory.removeGlobalInstance();
    };
    return ResourceModelService;
  }(Service);
  _exports.ResourceModelService = ResourceModelService;
  var ResourceModelServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(ResourceModelServiceFactory, _ServiceFactory);
    function ResourceModelServiceFactory() {
      var _this2;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this2 = _ServiceFactory.call.apply(_ServiceFactory, [this].concat(args)) || this;
      _this2._oInstances = {};
      return _this2;
    }
    var _proto2 = ResourceModelServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      var sKey = "".concat(oServiceContext.scopeObject.getId(), "_").concat(oServiceContext.settings.bundles.join(",")) + (oServiceContext.settings.enhanceI18n ? ",".concat(oServiceContext.settings.enhanceI18n.join(",")) : "");
      if (!this._oInstances[sKey]) {
        this._oInstances[sKey] = new ResourceModelService(Object.assign({
          factory: this
        }, oServiceContext));
      }
      return this._oInstances[sKey].initPromise;
    };
    _proto2.removeGlobalInstance = function removeGlobalInstance() {
      this._oInstances = {};
    };
    return ResourceModelServiceFactory;
  }(ServiceFactory);
  return ResourceModelServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSZXNvdXJjZU1vZGVsU2VydmljZSIsImluaXQiLCJvQ29udGV4dCIsImdldENvbnRleHQiLCJtU2V0dGluZ3MiLCJzZXR0aW5ncyIsIm9GYWN0b3J5IiwiZmFjdG9yeSIsImFCdW5kbGVzIiwiYnVuZGxlcyIsImNvbmNhdCIsImVuaGFuY2VJMThuIiwibWFwIiwidkkxOG4iLCJpc0EiLCJnZXRSZXNvdXJjZUJ1bmRsZSIsImJ1bmRsZU5hbWUiLCJyZXBsYWNlIiwib1Jlc291cmNlTW9kZWwiLCJSZXNvdXJjZU1vZGVsIiwiZW5oYW5jZVdpdGgiLCJzbGljZSIsImFzeW5jIiwic2NvcGVUeXBlIiwib0NvbXBvbmVudCIsInNjb3BlT2JqZWN0Iiwic2V0TW9kZWwiLCJtb2RlbE5hbWUiLCJpbml0UHJvbWlzZSIsIlByb21pc2UiLCJhbGwiLCJfcEVuaGFuY2VkIiwicmVzb2x2ZSIsInRoZW4iLCJvQnVuZGxlIiwiX19idW5kbGUiLCJnZXRSZXNvdXJjZU1vZGVsIiwiZ2V0SW50ZXJmYWNlIiwiZXhpdCIsInJlbW92ZUdsb2JhbEluc3RhbmNlIiwiU2VydmljZSIsIlJlc291cmNlTW9kZWxTZXJ2aWNlRmFjdG9yeSIsIl9vSW5zdGFuY2VzIiwiY3JlYXRlSW5zdGFuY2UiLCJvU2VydmljZUNvbnRleHQiLCJzS2V5IiwiZ2V0SWQiLCJqb2luIiwiT2JqZWN0IiwiYXNzaWduIiwiU2VydmljZUZhY3RvcnkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlJlc291cmNlTW9kZWxTZXJ2aWNlRmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBSZXNvdXJjZUJ1bmRsZSBmcm9tIFwic2FwL2Jhc2UvaTE4bi9SZXNvdXJjZUJ1bmRsZVwiO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL3Jlc291cmNlL1Jlc291cmNlTW9kZWxcIjtcbmltcG9ydCB0eXBlIHsgTWFuYWdlZE9iamVjdEV4LCBTZXJ2aWNlQ29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcbnR5cGUgUmVzb3VyY2VNb2RlbFNlcnZpY2VTZXR0aW5ncyA9IHtcblx0YnVuZGxlczogUmVzb3VyY2VCdW5kbGVbXTtcblx0ZW5oYW5jZUkxOG46IHN0cmluZ1tdO1xufTtcbmV4cG9ydCBjbGFzcyBSZXNvdXJjZU1vZGVsU2VydmljZSBleHRlbmRzIFNlcnZpY2U8UmVzb3VyY2VNb2RlbFNlcnZpY2VTZXR0aW5ncz4ge1xuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8YW55Pjtcblx0b0ZhY3RvcnkhOiBSZXNvdXJjZU1vZGVsU2VydmljZUZhY3Rvcnk7XG5cdG9SZXNvdXJjZU1vZGVsITogUmVzb3VyY2VNb2RlbDtcblx0aW5pdCgpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuXHRcdGNvbnN0IG1TZXR0aW5ncyA9IG9Db250ZXh0LnNldHRpbmdzO1xuXHRcdHRoaXMub0ZhY3RvcnkgPSBvQ29udGV4dC5mYWN0b3J5O1xuXG5cdFx0Ly8gV2hlbiBlbmhhbmNpbmcgaTE4biBrZXlzIHRoZSB2YWx1ZSBpbiB0aGUgbGFzdCByZXNvdXJjZSBidW5kbGUgdGFrZXMgcHJlY2VkZW5jZVxuXHRcdC8vIGhlbmNlIGFycmFuZ2UgdmFyaW91cyByZXNvdXJjZSBidW5kbGVzIHNvIHRoYXQgZW5oYW5jZUkxOG4gcHJvdmlkZWQgYnkgdGhlIGFwcGxpY2F0aW9uIGlzIHRoZSBsYXN0LlxuXHRcdC8vIFRoZSBmb2xsb3dpbmcgb3JkZXIgaXMgdXNlZCA6XG5cdFx0Ly8gMS4gc2FwLmZlIGJ1bmRsZSAtIHNhcC5mZS5jb3JlLm1lc3NhZ2VidW5kbGUgKHBhc3NlZCB3aXRoIG1TZXR0aW5ncy5idW5kbGVzKVxuXHRcdC8vIDIuIHNhcC5mZSBidW5kbGUgLSBzYXAuZmUudGVtcGxhdGVzLm1lc3NhZ2VidW5kbGUgKHBhc3NlZCB3aXRoIG1TZXR0aW5ncy5idW5kbGVzKVxuXHRcdC8vIDMuIE11bHRpcGxlIGJ1bmRsZXMgcGFzc2VkIGJ5IHRoZSBhcHBsaWNhdGlvbiBhcyBwYXJ0IG9mIGVuaGFuY2VJMThuXG5cdFx0Y29uc3QgYUJ1bmRsZXMgPSBtU2V0dGluZ3MuYnVuZGxlcy5jb25jYXQobVNldHRpbmdzLmVuaGFuY2VJMThuIHx8IFtdKS5tYXAoZnVuY3Rpb24gKHZJMThuOiBhbnkpIHtcblx0XHRcdC8vIGlmIHZhbHVlIHBhc3NlZCBmb3IgZW5oYW5jZUkxOG4gaXMgYSBSZXNvdXJjZSBNb2RlbCwgcmV0dXJuIHRoZSBhc3NvY2lhdGVkIGJ1bmRsZVxuXHRcdFx0Ly8gZWxzZSB0aGUgdmFsdWUgaXMgYSBidW5kbGVVcmwsIHJldHVybiBSZXNvdXJjZSBCdW5kbGUgY29uZmlndXJhdGlvbiBzbyB0aGF0IGEgYnVuZGxlIGNhbiBiZSBjcmVhdGVkXG5cdFx0XHRyZXR1cm4gdHlwZW9mIHZJMThuLmlzQSA9PT0gXCJmdW5jdGlvblwiICYmIHZJMThuLmlzQShcInNhcC51aS5tb2RlbC5yZXNvdXJjZS5SZXNvdXJjZU1vZGVsXCIpXG5cdFx0XHRcdD8gdkkxOG4uZ2V0UmVzb3VyY2VCdW5kbGUoKVxuXHRcdFx0XHQ6IHsgYnVuZGxlTmFtZTogdkkxOG4ucmVwbGFjZSgvXFwvL2csIFwiLlwiKSB9O1xuXHRcdH0pO1xuXG5cdFx0dGhpcy5vUmVzb3VyY2VNb2RlbCA9IG5ldyBSZXNvdXJjZU1vZGVsKHtcblx0XHRcdGJ1bmRsZU5hbWU6IGFCdW5kbGVzWzBdLmJ1bmRsZU5hbWUsXG5cdFx0XHRlbmhhbmNlV2l0aDogYUJ1bmRsZXMuc2xpY2UoMSksXG5cdFx0XHRhc3luYzogdHJ1ZVxuXHRcdH0pO1xuXG5cdFx0aWYgKG9Db250ZXh0LnNjb3BlVHlwZSA9PT0gXCJjb21wb25lbnRcIikge1xuXHRcdFx0Y29uc3Qgb0NvbXBvbmVudCA9IG9Db250ZXh0LnNjb3BlT2JqZWN0O1xuXHRcdFx0b0NvbXBvbmVudC5zZXRNb2RlbCh0aGlzLm9SZXNvdXJjZU1vZGVsLCBtU2V0dGluZ3MubW9kZWxOYW1lKTtcblx0XHR9XG5cblx0XHR0aGlzLmluaXRQcm9taXNlID0gUHJvbWlzZS5hbGwoW1xuXHRcdFx0dGhpcy5vUmVzb3VyY2VNb2RlbC5nZXRSZXNvdXJjZUJ1bmRsZSgpIGFzIFByb21pc2U8UmVzb3VyY2VCdW5kbGU+LFxuXHRcdFx0KHRoaXMub1Jlc291cmNlTW9kZWwgYXMgYW55KS5fcEVuaGFuY2VkIHx8IFByb21pc2UucmVzb2x2ZSgpXG5cdFx0XSkudGhlbigob0J1bmRsZTogYW55W10pID0+IHtcblx0XHRcdCh0aGlzLm9SZXNvdXJjZU1vZGVsIGFzIGFueSkuX19idW5kbGUgPSBvQnVuZGxlWzBdO1xuXHRcdFx0cmV0dXJuIHRoaXM7XG5cdFx0fSk7XG5cdH1cblxuXHRnZXRSZXNvdXJjZU1vZGVsKCkge1xuXHRcdHJldHVybiB0aGlzLm9SZXNvdXJjZU1vZGVsO1xuXHR9XG5cdGdldEludGVyZmFjZSgpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG5cdGV4aXQoKSB7XG5cdFx0Ly8gRGVyZWdpc3RlciBnbG9iYWwgaW5zdGFuY2Vcblx0XHR0aGlzLm9GYWN0b3J5LnJlbW92ZUdsb2JhbEluc3RhbmNlKCk7XG5cdH1cbn1cblxuY2xhc3MgUmVzb3VyY2VNb2RlbFNlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8UmVzb3VyY2VNb2RlbFNlcnZpY2VTZXR0aW5ncz4ge1xuXHRfb0luc3RhbmNlczogUmVjb3JkPHN0cmluZywgUmVzb3VyY2VNb2RlbFNlcnZpY2U+ID0ge307XG5cdGNyZWF0ZUluc3RhbmNlKG9TZXJ2aWNlQ29udGV4dDogU2VydmljZUNvbnRleHQ8UmVzb3VyY2VNb2RlbFNlcnZpY2VTZXR0aW5ncz4pIHtcblx0XHRjb25zdCBzS2V5ID1cblx0XHRcdGAkeyhvU2VydmljZUNvbnRleHQuc2NvcGVPYmplY3QgYXMgTWFuYWdlZE9iamVjdEV4KS5nZXRJZCgpfV8ke29TZXJ2aWNlQ29udGV4dC5zZXR0aW5ncy5idW5kbGVzLmpvaW4oXCIsXCIpfWAgK1xuXHRcdFx0KG9TZXJ2aWNlQ29udGV4dC5zZXR0aW5ncy5lbmhhbmNlSTE4biA/IGAsJHtvU2VydmljZUNvbnRleHQuc2V0dGluZ3MuZW5oYW5jZUkxOG4uam9pbihcIixcIil9YCA6IFwiXCIpO1xuXG5cdFx0aWYgKCF0aGlzLl9vSW5zdGFuY2VzW3NLZXldKSB7XG5cdFx0XHR0aGlzLl9vSW5zdGFuY2VzW3NLZXldID0gbmV3IFJlc291cmNlTW9kZWxTZXJ2aWNlKE9iamVjdC5hc3NpZ24oeyBmYWN0b3J5OiB0aGlzIH0sIG9TZXJ2aWNlQ29udGV4dCkpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl9vSW5zdGFuY2VzW3NLZXldLmluaXRQcm9taXNlO1xuXHR9XG5cdHJlbW92ZUdsb2JhbEluc3RhbmNlKCkge1xuXHRcdHRoaXMuX29JbnN0YW5jZXMgPSB7fTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBSZXNvdXJjZU1vZGVsU2VydmljZUZhY3Rvcnk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7TUFTYUEsb0JBQW9CO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUEsT0FJaENDLElBQUksR0FBSixnQkFBTztNQUFBO01BQ04sSUFBTUMsUUFBUSxHQUFHLElBQUksQ0FBQ0MsVUFBVSxFQUFFO01BQ2xDLElBQU1DLFNBQVMsR0FBR0YsUUFBUSxDQUFDRyxRQUFRO01BQ25DLElBQUksQ0FBQ0MsUUFBUSxHQUFHSixRQUFRLENBQUNLLE9BQU87O01BRWhDO01BQ0E7TUFDQTtNQUNBO01BQ0E7TUFDQTtNQUNBLElBQU1DLFFBQVEsR0FBR0osU0FBUyxDQUFDSyxPQUFPLENBQUNDLE1BQU0sQ0FBQ04sU0FBUyxDQUFDTyxXQUFXLElBQUksRUFBRSxDQUFD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