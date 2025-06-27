/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory"], function (Service, ServiceFactory) {
  "use strict";

  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  var AsyncComponentService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(AsyncComponentService, _Service);
    function AsyncComponentService() {
      return _Service.apply(this, arguments) || this;
    }
    var _proto = AsyncComponentService.prototype;
    // !: means that we know it will be assigned before usage
    _proto.init = function init() {
      var _this = this;
      this.initPromise = new Promise(function (resolve, reject) {
        _this.resolveFn = resolve;
        _this.rejectFn = reject;
      });
      var oContext = this.getContext();
      var oComponent = oContext.scopeObject;
      var oServices = oComponent._getManifestEntry("/sap.ui5/services", true);
      Promise.all(Object.keys(oServices).filter(function (sServiceKey) {
        return oServices[sServiceKey].startup === "waitFor" && oServices[sServiceKey].factoryName !== "sap.fe.core.services.AsyncComponentService";
      }).map(function (sServiceKey) {
        return oComponent.getService(sServiceKey).then(function (oServiceInstance) {
          var sMethodName = "get".concat(sServiceKey[0].toUpperCase()).concat(sServiceKey.substr(1));
          if (!oComponent.hasOwnProperty(sMethodName)) {
            oComponent[sMethodName] = function () {
              return oServiceInstance;
            };
          }
        });
      })).then(function () {
        return oComponent.pRootControlLoaded || Promise.resolve();
      }).then(function () {
        // notifiy the component
        if (oComponent.onServicesStarted) {
          oComponent.onServicesStarted();
        }
        _this.resolveFn(_this);
      }).catch(this.rejectFn);
    };
    return AsyncComponentService;
  }(Service);
  var AsyncComponentServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(AsyncComponentServiceFactory, _ServiceFactory);
    function AsyncComponentServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto2 = AsyncComponentServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      var asyncComponentService = new AsyncComponentService(oServiceContext);
      return asyncComponentService.initPromise;
    };
    return AsyncComponentServiceFactory;
  }(ServiceFactory);
  return AsyncComponentServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBc3luY0NvbXBvbmVudFNlcnZpY2UiLCJpbml0IiwiaW5pdFByb21pc2UiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJlamVjdCIsInJlc29sdmVGbiIsInJlamVjdEZuIiwib0NvbnRleHQiLCJnZXRDb250ZXh0Iiwib0NvbXBvbmVudCIsInNjb3BlT2JqZWN0Iiwib1NlcnZpY2VzIiwiX2dldE1hbmlmZXN0RW50cnkiLCJhbGwiLCJPYmplY3QiLCJrZXlzIiwiZmlsdGVyIiwic1NlcnZpY2VLZXkiLCJzdGFydHVwIiwiZmFjdG9yeU5hbWUiLCJtYXAiLCJnZXRTZXJ2aWNlIiwidGhlbiIsIm9TZXJ2aWNlSW5zdGFuY2UiLCJzTWV0aG9kTmFtZSIsInRvVXBwZXJDYXNlIiwic3Vic3RyIiwiaGFzT3duUHJvcGVydHkiLCJwUm9vdENvbnRyb2xMb2FkZWQiLCJvblNlcnZpY2VzU3RhcnRlZCIsImNhdGNoIiwiU2VydmljZSIsIkFzeW5jQ29tcG9uZW50U2VydmljZUZhY3RvcnkiLCJjcmVhdGVJbnN0YW5jZSIsIm9TZXJ2aWNlQ29udGV4dCIsImFzeW5jQ29tcG9uZW50U2VydmljZSIsIlNlcnZpY2VGYWN0b3J5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBc3luY0NvbXBvbmVudFNlcnZpY2VGYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBTZXJ2aWNlIGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VcIjtcbmltcG9ydCBTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgeyBTZXJ2aWNlQ29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxudHlwZSBBc3luY0NvbXBvbmVudFNldHRpbmdzID0ge307XG5cbmNsYXNzIEFzeW5jQ29tcG9uZW50U2VydmljZSBleHRlbmRzIFNlcnZpY2U8QXN5bmNDb21wb25lbnRTZXR0aW5ncz4ge1xuXHRyZXNvbHZlRm46IGFueTtcblx0cmVqZWN0Rm46IGFueTtcblx0aW5pdFByb21pc2UhOiBQcm9taXNlPGFueT47XG5cdC8vICE6IG1lYW5zIHRoYXQgd2Uga25vdyBpdCB3aWxsIGJlIGFzc2lnbmVkIGJlZm9yZSB1c2FnZVxuXG5cdGluaXQoKSB7XG5cdFx0dGhpcy5pbml0UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcblx0XHRcdHRoaXMucmVzb2x2ZUZuID0gcmVzb2x2ZTtcblx0XHRcdHRoaXMucmVqZWN0Rm4gPSByZWplY3Q7XG5cdFx0fSk7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSB0aGlzLmdldENvbnRleHQoKTtcblx0XHRjb25zdCBvQ29tcG9uZW50ID0gb0NvbnRleHQuc2NvcGVPYmplY3QgYXMgYW55O1xuXHRcdGNvbnN0IG9TZXJ2aWNlcyA9IG9Db21wb25lbnQuX2dldE1hbmlmZXN0RW50cnkoXCIvc2FwLnVpNS9zZXJ2aWNlc1wiLCB0cnVlKTtcblx0XHRQcm9taXNlLmFsbChcblx0XHRcdE9iamVjdC5rZXlzKG9TZXJ2aWNlcylcblx0XHRcdFx0LmZpbHRlcihcblx0XHRcdFx0XHQoc1NlcnZpY2VLZXkpID0+XG5cdFx0XHRcdFx0XHRvU2VydmljZXNbc1NlcnZpY2VLZXldLnN0YXJ0dXAgPT09IFwid2FpdEZvclwiICYmXG5cdFx0XHRcdFx0XHRvU2VydmljZXNbc1NlcnZpY2VLZXldLmZhY3RvcnlOYW1lICE9PSBcInNhcC5mZS5jb3JlLnNlcnZpY2VzLkFzeW5jQ29tcG9uZW50U2VydmljZVwiXG5cdFx0XHRcdClcblx0XHRcdFx0Lm1hcCgoc1NlcnZpY2VLZXkpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gb0NvbXBvbmVudC5nZXRTZXJ2aWNlKHNTZXJ2aWNlS2V5KS50aGVuKChvU2VydmljZUluc3RhbmNlOiBTZXJ2aWNlPGFueT4pID0+IHtcblx0XHRcdFx0XHRcdGNvbnN0IHNNZXRob2ROYW1lID0gYGdldCR7c1NlcnZpY2VLZXlbMF0udG9VcHBlckNhc2UoKX0ke3NTZXJ2aWNlS2V5LnN1YnN0cigxKX1gO1xuXHRcdFx0XHRcdFx0aWYgKCFvQ29tcG9uZW50Lmhhc093blByb3BlcnR5KHNNZXRob2ROYW1lKSkge1xuXHRcdFx0XHRcdFx0XHRvQ29tcG9uZW50W3NNZXRob2ROYW1lXSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb1NlcnZpY2VJbnN0YW5jZTtcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSlcblx0XHQpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBvQ29tcG9uZW50LnBSb290Q29udHJvbExvYWRlZCB8fCBQcm9taXNlLnJlc29sdmUoKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdC8vIG5vdGlmaXkgdGhlIGNvbXBvbmVudFxuXHRcdFx0XHRpZiAob0NvbXBvbmVudC5vblNlcnZpY2VzU3RhcnRlZCkge1xuXHRcdFx0XHRcdG9Db21wb25lbnQub25TZXJ2aWNlc1N0YXJ0ZWQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHR0aGlzLnJlc29sdmVGbih0aGlzKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2godGhpcy5yZWplY3RGbik7XG5cdH1cbn1cblxuY2xhc3MgQXN5bmNDb21wb25lbnRTZXJ2aWNlRmFjdG9yeSBleHRlbmRzIFNlcnZpY2VGYWN0b3J5PEFzeW5jQ29tcG9uZW50U2V0dGluZ3M+IHtcblx0Y3JlYXRlSW5zdGFuY2Uob1NlcnZpY2VDb250ZXh0OiBTZXJ2aWNlQ29udGV4dDxBc3luY0NvbXBvbmVudFNldHRpbmdzPikge1xuXHRcdGNvbnN0IGFzeW5jQ29tcG9uZW50U2VydmljZSA9IG5ldyBBc3luY0NvbXBvbmVudFNlcnZpY2Uob1NlcnZpY2VDb250ZXh0KTtcblx0XHRyZXR1cm4gYXN5bmNDb21wb25lbnRTZXJ2aWNlLmluaXRQcm9taXNl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