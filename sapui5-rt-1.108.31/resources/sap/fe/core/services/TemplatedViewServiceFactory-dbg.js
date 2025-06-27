/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/UriParameters", "sap/fe/core/helpers/LoaderUtils", "sap/fe/core/TemplateModel", "sap/ui/core/Component", "sap/ui/core/mvc/View", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory", "sap/ui/core/service/ServiceFactoryRegistry", "sap/ui/Device", "sap/ui/model/base/ManagedObjectModel", "sap/ui/model/json/JSONModel", "sap/ui/VersionInfo", "../helpers/DynamicAnnotationPathHelper"], function (Log, UriParameters, LoaderUtils, TemplateModel, Component, View, Service, ServiceFactory, ServiceFactoryRegistry, Device, ManagedObjectModel, JSONModel, VersionInfo, DynamicAnnotationPathHelper) {
  "use strict";

  var resolveDynamicExpression = DynamicAnnotationPathHelper.resolveDynamicExpression;
  var requireDependencies = LoaderUtils.requireDependencies;
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  var TemplatedViewService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(TemplatedViewService, _Service);
    function TemplatedViewService() {
      return _Service.apply(this, arguments) || this;
    }
    var _proto = TemplatedViewService.prototype;
    _proto.init = function init() {
      var _this2 = this;
      var _this = this;
      var aServiceDependencies = [];
      var oContext = this.getContext();
      var oComponent = oContext.scopeObject;
      var oAppComponent = Component.getOwnerComponentFor(oComponent);
      var oMetaModel = oAppComponent.getMetaModel();
      var sStableId = "".concat(oAppComponent.getMetadata().getComponentName(), "::").concat(oAppComponent.getLocalId(oComponent.getId()));
      var aEnhanceI18n = oComponent.getEnhanceI18n() || [];
      var sAppNamespace;
      this.oFactory = oContext.factory;
      if (aEnhanceI18n) {
        sAppNamespace = oAppComponent.getMetadata().getComponentName();
        for (var i = 0; i < aEnhanceI18n.length; i++) {
          // In order to support text-verticalization applications can also passs a resource model defined in the manifest
          // UI5 takes care of text-verticalization for resource models defined in the manifest
          // Hence check if the given key is a resource model defined in the manifest
          // if so this model should be used to enhance the sap.fe resource model so pass it as it is
          var oResourceModel = oAppComponent.getModel(aEnhanceI18n[i]);
          if (oResourceModel && oResourceModel.isA("sap.ui.model.resource.ResourceModel")) {
            aEnhanceI18n[i] = oResourceModel;
          } else {
            aEnhanceI18n[i] = "".concat(sAppNamespace, ".").concat(aEnhanceI18n[i].replace(".properties", ""));
          }
        }
      }
      var sCacheIdentifier = "".concat(oAppComponent.getMetadata().getName(), "_").concat(sStableId, "_").concat(sap.ui.getCore().getConfiguration().getLanguageTag());
      aServiceDependencies.push(ServiceFactoryRegistry.get("sap.fe.core.services.ResourceModelService").createInstance({
        scopeType: "component",
        scopeObject: oComponent,
        settings: {
          bundles: ["sap.fe.core.messagebundle", "sap.fe.macros.messagebundle", "sap.fe.templates.messagebundle"],
          enhanceI18n: aEnhanceI18n,
          modelName: "sap.fe.i18n"
        }
      }).then(function (oResourceModelService) {
        _this.oResourceModelService = oResourceModelService;
        return oResourceModelService.getResourceModel();
      }));
      aServiceDependencies.push(ServiceFactoryRegistry.get("sap.fe.core.services.CacheHandlerService").createInstance({
        settings: {
          metaModel: oMetaModel,
          appComponent: oAppComponent,
          component: oComponent
        }
      }).then(function (oCacheHandlerService) {
        _this.oCacheHandlerService = oCacheHandlerService;
        return oCacheHandlerService.validateCacheKey(sCacheIdentifier, oComponent);
      }));
      aServiceDependencies.push(VersionInfo.load().then(function (oInfo) {
        var sTimestamp = "";
        if (!oInfo.libraries) {
          sTimestamp = sap.ui.buildinfo.buildtime;
        } else {
          oInfo.libraries.forEach(function (oLibrary) {
            sTimestamp += oLibrary.buildTimestamp;
          });
        }
        return sTimestamp;
      }).catch(function () {
        return "<NOVALUE>";
      }));
      this.initPromise = Promise.all(aServiceDependencies).then(function (aDependenciesResult) {
        try {
          var _oResourceModel = aDependenciesResult[0];
          var sCacheKey = aDependenciesResult[1];
          var oSideEffectsServices = oAppComponent.getSideEffectsService();
          oSideEffectsServices.initializeSideEffects(oAppComponent.getEnvironmentCapabilities().getCapabilities());
          return Promise.resolve(requireDependencies(["sap/fe/core/converters/TemplateConverter", "sap/fe/core/converters/MetaModelConverter"])).then(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
              TemplateConverter = _ref2[0],
              MetaModelConverter = _ref2[1];
            return _this2.createView(_oResourceModel, sStableId, sCacheKey, TemplateConverter, MetaModelConverter);
          });
        } catch (e) {
          return Promise.reject(e);
        }
      }).then(function (sCacheKey) {
        var oCacheHandlerService = ServiceFactoryRegistry.get("sap.fe.core.services.CacheHandlerService").getInstance(oMetaModel);
        oCacheHandlerService.invalidateIfNeeded(sCacheKey, sCacheIdentifier, oComponent);
      });
    }

    /**
     * Refresh the current view using the same configuration as before.
     * This is useful for our demokit !
     *
     * @param oComponent
     * @returns A promise indicating when the view is refreshed
     * @private
     */;
    _proto.refreshView = function refreshView(oComponent) {
      var oRootView = oComponent.getRootControl();
      if (oRootView) {
        oRootView.destroy();
      } else if (this.oView) {
        this.oView.destroy();
      }
      return this.createView(this.resourceModel, this.stableId, "", this.TemplateConverter, this.MetaModelConverter).then(function () {
        oComponent.oContainer.invalidate();
      }).catch(function (oError) {
        oComponent.oContainer.invalidate();
        Log.error(oError);
      });
    };
    _proto.createView = function createView(oResourceModel, sStableId, sCacheKey, TemplateConverter, MetaModelConverter) {
      try {
        var _this4 = this;
        _this4.resourceModel = oResourceModel;
        _this4.stableId = sStableId;
        _this4.TemplateConverter = TemplateConverter;
        _this4.MetaModelConverter = MetaModelConverter;
        var oContext = _this4.getContext();
        var mServiceSettings = oContext.settings;
        var sConverterType = mServiceSettings.converterType;
        var oComponent = oContext.scopeObject;
        var oAppComponent = Component.getOwnerComponentFor(oComponent);
        var sFullContextPath = oAppComponent.getRoutingService().getTargetInformationFor(oComponent).options.settings.fullContextPath;
        var oMetaModel = oAppComponent.getMetaModel();
        var oManifestContent = oAppComponent.getManifest();
        var oDeviceModel = new JSONModel(Device).setDefaultBindingMode("OneWay");
        var oManifestModel = new JSONModel(oManifestContent);
        var bError = false;
        // Load the index for the additional building blocks which is responsible for initializing them
        function getViewSettings() {
          var aSplitPath = sFullContextPath.split("/");
          var sEntitySetPath = aSplitPath.reduce(function (sPathSoFar, sNextPathPart) {
            if (sNextPathPart === "") {
              return sPathSoFar;
            }
            if (sPathSoFar === "") {
              sPathSoFar = "/".concat(sNextPathPart);
            } else {
              var oTarget = oMetaModel.getObject("".concat(sPathSoFar, "/$NavigationPropertyBinding/").concat(sNextPathPart));
              if (oTarget && Object.keys(oTarget).length > 0) {
                sPathSoFar += "/$NavigationPropertyBinding";
              }
              sPathSoFar += "/".concat(sNextPathPart);
            }
            return sPathSoFar;
          }, "");
          var viewType = mServiceSettings.viewType || oComponent.getViewType() || "XML";
          if (viewType !== "XML") {
            viewType = undefined;
          }
          return {
            type: viewType,
            preprocessors: {
              xml: {
                bindingContexts: {
                  entitySet: sEntitySetPath ? oMetaModel.createBindingContext(sEntitySetPath) : null,
                  fullContextPath: sFullContextPath ? oMetaModel.createBindingContext(sFullContextPath) : null,
                  contextPath: sFullContextPath ? oMetaModel.createBindingContext(sFullContextPath) : null,
                  converterContext: oPageModel.createBindingContext("/", undefined, {
                    noResolve: true
                  }),
                  viewData: mViewData ? oViewDataModel.createBindingContext("/") : null
                },
                models: {
                  entitySet: oMetaModel,
                  fullContextPath: oMetaModel,
                  contextPath: oMetaModel,
                  "sap.fe.i18n": oResourceModel,
                  metaModel: oMetaModel,
                  "device": oDeviceModel,
                  manifest: oManifestModel,
                  converterContext: oPageModel,
                  viewData: oViewDataModel
                },
                appComponent: oAppComponent
              }
            },
            id: sStableId,
            viewName: mServiceSettings.viewName || oComponent.getViewName(),
            viewData: mViewData,
            cache: {
              keys: [sCacheKey],
              additionalData: {
                // We store the page model data in the `additionalData` of the view cache, this way it is always in sync
                getAdditionalCacheData: function () {
                  return oPageModel.getData();
                },
                setAdditionalCacheData: function (value) {
                  oPageModel.setData(value);
                }
              }
            },
            models: {
              "sap.fe.i18n": oResourceModel
            },
            height: "100%"
          };
        }
        var oPageModel, oViewDataModel, oViewSettings, mViewData;
        var createErrorPage = function (reason) {
          // just replace the view name and add an additional model containing the reason, but
          // keep the other settings
          Log.error(reason.message, reason);
          oViewSettings.viewName = mServiceSettings.errorViewName || "sap.fe.core.services.view.TemplatingErrorPage";
          oViewSettings.preprocessors.xml.models["error"] = new JSONModel(reason);
          return oComponent.runAsOwner(function () {
            return View.create(oViewSettings).then(function (oView) {
              _this4.oView = oView;
              _this4.oView.setModel(new ManagedObjectModel(_this4.oView), "$view");
              oComponent.setAggregation("rootControl", _this4.oView);
              return sCacheKey;
            });
          });
        };
        return Promise.resolve(_catch(function () {
          return Promise.resolve(oAppComponent.getService("routingService")).then(function (oRoutingService) {
            var _oManifestContent$sap;
            // Retrieve the viewLevel for the component
            var oTargetInfo = oRoutingService.getTargetInformationFor(oComponent);
            var mOutbounds = oManifestContent["sap.app"] && oManifestContent["sap.app"].crossNavigation && oManifestContent["sap.app"].crossNavigation.outbounds || {};
            var mNavigation = oComponent.getNavigation() || {};
            Object.keys(mNavigation).forEach(function (navigationObjectKey) {
              var navigationObject = mNavigation[navigationObjectKey];
              var outboundConfig;
              if (navigationObject.detail && navigationObject.detail.outbound && mOutbounds[navigationObject.detail.outbound]) {
                outboundConfig = mOutbounds[navigationObject.detail.outbound];
                navigationObject.detail.outboundDetail = {
                  semanticObject: outboundConfig.semanticObject,
                  action: outboundConfig.action,
                  parameters: outboundConfig.parameters
                };
              }
              if (navigationObject.create && navigationObject.create.outbound && mOutbounds[navigationObject.create.outbound]) {
                outboundConfig = mOutbounds[navigationObject.create.outbound];
                navigationObject.create.outboundDetail = {
                  semanticObject: outboundConfig.semanticObject,
                  action: outboundConfig.action,
                  parameters: outboundConfig.parameters
                };
              }
            });
            mViewData = {
              navigation: mNavigation,
              viewLevel: oTargetInfo.viewLevel,
              stableId: sStableId,
              contentDensities: (_oManifestContent$sap = oManifestContent["sap.ui5"]) === null || _oManifestContent$sap === void 0 ? void 0 : _oManifestContent$sap.contentDensities,
              resourceBundle: oResourceModel.__bundle,
              fullContextPath: sFullContextPath,
              isDesktop: Device.system.desktop,
              isPhone: Device.system.phone
            };
            if (oComponent.getViewData) {
              Object.assign(mViewData, oComponent.getViewData());
            }
            var oShellServices = oAppComponent.getShellServices();
            mViewData.converterType = sConverterType;
            mViewData.shellContentDensity = oShellServices.getContentDensity();
            mViewData.useNewLazyLoading = UriParameters.fromQuery(window.location.search).get("sap-fe-xx-lazyloadingtest") === "true";
            mViewData.retrieveTextFromValueList = oManifestContent["sap.fe"] && oManifestContent["sap.fe"].form ? oManifestContent["sap.fe"].form.retrieveTextFromValueList : undefined;
            oViewDataModel = new JSONModel(mViewData);
            if (mViewData && mViewData.controlConfiguration) {
              Object.keys(mViewData.controlConfiguration).forEach(function (sAnnotationPath) {
                if (sAnnotationPath.indexOf("[") !== -1) {
                  var sTargetAnnotationPath = resolveDynamicExpression(sAnnotationPath, oMetaModel);
                  mViewData.controlConfiguration[sTargetAnnotationPath] = mViewData.controlConfiguration[sAnnotationPath];
                }
              });
            }
            MetaModelConverter.convertTypes(oMetaModel, oAppComponent.getEnvironmentCapabilities().getCapabilities());
            oPageModel = new TemplateModel(function () {
              try {
                var oDiagnostics = oAppComponent.getDiagnostics();
                var iIssueCount = oDiagnostics.getIssues().length;
                var oConverterPageModel = TemplateConverter.convertPage(sConverterType, oMetaModel, mViewData, oDiagnostics, sFullContextPath, oAppComponent.getEnvironmentCapabilities().getCapabilities(), oComponent);
                var aIssues = oDiagnostics.getIssues();
                var aAddedIssues = aIssues.slice(iIssueCount);
                if (aAddedIssues.length > 0) {
                  Log.warning("Some issues have been detected in your project, please check the UI5 support assistant rule for sap.fe.core");
                }
                return oConverterPageModel;
              } catch (error) {
                Log.error(error, error);
                return {};
              }
            }, oMetaModel);
            if (!bError) {
              oViewSettings = getViewSettings();
              // Setting the pageModel on the component for potential reuse
              oComponent.setModel(oPageModel, "_pageModel");
              return oComponent.runAsOwner(function () {
                return View.create(oViewSettings).catch(createErrorPage).then(function (oView) {
                  _this4.oView = oView;
                  _this4.oView.setModel(new ManagedObjectModel(_this4.oView), "$view");
                  _this4.oView.setModel(oViewDataModel, "viewData");
                  oComponent.setAggregation("rootControl", _this4.oView);
                  return sCacheKey;
                }).catch(function (e) {
                  return Log.error(e.message, e);
                });
              });
            }
          });
        }, function (error) {
          Log.error(error.message, error);
          throw new Error("Error while creating view : ".concat(error));
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto.getView = function getView() {
      return this.oView;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    _proto.exit = function exit() {
      // Deregister global instance
      if (this.oResourceModelService) {
        this.oResourceModelService.destroy();
      }
      if (this.oCacheHandlerService) {
        this.oCacheHandlerService.destroy();
      }
      this.oFactory.removeGlobalInstance();
    };
    return TemplatedViewService;
  }(Service);
  var TemplatedViewServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(TemplatedViewServiceFactory, _ServiceFactory);
    function TemplatedViewServiceFactory() {
      var _this5;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this5 = _ServiceFactory.call.apply(_ServiceFactory, [this].concat(args)) || this;
      _this5._oInstanceRegistry = {};
      return _this5;
    }
    var _proto2 = TemplatedViewServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      TemplatedViewServiceFactory.iCreatingViews++;
      var oTemplatedViewService = new TemplatedViewService(Object.assign({
        factory: this
      }, oServiceContext));
      return oTemplatedViewService.initPromise.then(function () {
        TemplatedViewServiceFactory.iCreatingViews--;
        return oTemplatedViewService;
      });
    };
    _proto2.removeGlobalInstance = function removeGlobalInstance() {
      this._oInstanceRegistry = {};
    };
    TemplatedViewServiceFactory.getNumberOfViewsInCreationState = function getNumberOfViewsInCreationState() {
      return TemplatedViewServiceFactory.iCreatingViews;
    };
    return TemplatedViewServiceFactory;
  }(ServiceFactory);
  return TemplatedViewServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiVGVtcGxhdGVkVmlld1NlcnZpY2UiLCJpbml0IiwiYVNlcnZpY2VEZXBlbmRlbmNpZXMiLCJvQ29udGV4dCIsImdldENvbnRleHQiLCJvQ29tcG9uZW50Iiwic2NvcGVPYmplY3QiLCJvQXBwQ29tcG9uZW50IiwiQ29tcG9uZW50IiwiZ2V0T3duZXJDb21wb25lbnRGb3IiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic1N0YWJsZUlkIiwiZ2V0TWV0YWRhdGEiLCJnZXRDb21wb25lbnROYW1lIiwiZ2V0TG9jYWxJZCIsImdldElkIiwiYUVuaGFuY2VJMThuIiwiZ2V0RW5oYW5jZUkxOG4iLCJzQXBwTmFtZXNwYWNlIiwib0ZhY3RvcnkiLCJmYWN0b3J5IiwiaSIsImxlbmd0aCIsIm9SZXNvdXJjZU1vZGVsIiwiZ2V0TW9kZWwiLCJpc0EiLCJyZXBsYWNlIiwic0NhY2hlSWRlbnRpZmllciIsImdldE5hbWUiLCJzYXAiLCJ1aSIsImdldENvcmUiLCJnZXRDb25maWd1cmF0aW9uIiwiZ2V0TGFuZ3VhZ2VUYWciLCJwdXNoIiwiU2VydmljZUZhY3RvcnlSZWdpc3RyeSIsImdldCIsImNyZWF0ZUluc3RhbmNlIiwic2NvcGVUeXBlIiwic2V0dGluZ3MiLCJidW5kbGVzIiwiZW5oYW5jZUkxOG4iLCJtb2RlbE5hbWUiLCJvUmVzb3VyY2VNb2RlbFNlcnZpY2UiLCJnZXRSZXNvdXJjZU1vZGVsIiwibWV0YU1vZGVsIiwiYXBwQ29tcG9uZW50IiwiY29tcG9uZW50Iiwib0NhY2hlSGFuZGxlclNlcnZpY2UiLCJ2YWxpZGF0ZUNhY2hlS2V5IiwiVmVyc2lvbkluZm8iLCJsb2FkIiwib0luZm8iLCJzVGltZXN0YW1wIiwibGlicmFyaWVzIiwiYnVpbGRpbmZvIiwiYnVpbGR0aW1lIiwiZm9yRWFjaCIsIm9MaWJyYXJ5IiwiYnVpbGRUaW1lc3RhbXAiLCJjYXRjaCIsImluaXRQcm9taXNlIiwiUHJvbWlzZSIsImFsbCIsImFEZXBlbmRlbmNpZXNSZXN1bHQiLCJzQ2FjaGVLZXkiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlcyIsImdldFNpZGVFZmZlY3RzU2VydmljZSIsImluaXRpYWxpemVTaWRlRWZmZWN0cyIsImdldEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIiwiZ2V0Q2FwYWJpbGl0aWVzIiwicmVxdWlyZURlcGVuZGVuY2llcyIsIlRlbXBsYXRlQ29udmVydGVyIiwiTWV0YU1vZGVsQ29udmVydGVyIiwiY3JlYXRlVmlldyIsImdldEluc3RhbmNlIiwiaW52YWxpZGF0ZUlmTmVlZGVkIiwicmVmcmVzaFZpZXciLCJvUm9vdFZpZXciLCJnZXRSb290Q29udHJvbCIsImRlc3Ryb3kiLCJvVmlldyIsInJlc291cmNlTW9kZWwiLCJzdGFibGVJZCIsIm9Db250YWluZXIiLCJpbnZhbGlkYXRlIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJtU2VydmljZVNldHRpbmdzIiwic0NvbnZlcnRlclR5cGUiLCJjb252ZXJ0ZXJUeXBlIiwic0Z1bGxDb250ZXh0UGF0aCIsImdldFJvdXRpbmdTZXJ2aWNlIiwiZ2V0VGFyZ2V0SW5mb3JtYXRpb25Gb3IiLCJvcHRpb25zIiwiZnVsbENvbnRleHRQYXRoIiwib01hbmlmZXN0Q29udGVudCIsImdldE1hbmlmZXN0Iiwib0RldmljZU1vZGVsIiwiSlNPTk1vZGVsIiwiRGV2aWNlIiwic2V0RGVmYXVsdEJpbmRpbmdNb2RlIiwib01hbmlmZXN0TW9kZWwiLCJiRXJyb3IiLCJnZXRWaWV3U2V0dGluZ3MiLCJhU3BsaXRQYXRoIiwic3BsaXQiLCJzRW50aXR5U2V0UGF0aCIsInJlZHVjZSIsInNQYXRoU29GYXIiLCJzTmV4dFBhdGhQYXJ0Iiwib1RhcmdldCIsImdldE9iamVjdCIsIk9iamVjdCIsImtleXMiLCJ2aWV3VHlwZSIsImdldFZpZXdUeXBlIiwidW5kZWZpbmVkIiwidHlwZSIsInByZXByb2Nlc3NvcnMiLCJ4bWwiLCJiaW5kaW5nQ29udGV4dHMiLCJlbnRpdHlTZXQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImNvbnRleHRQYXRoIiwiY29udmVydGVyQ29udGV4dCIsIm9QYWdlTW9kZWwiLCJub1Jlc29sdmUiLCJ2aWV3RGF0YSIsIm1WaWV3RGF0YSIsIm9WaWV3RGF0YU1vZGVsIiwibW9kZWxzIiwibWFuaWZlc3QiLCJpZCIsInZpZXdOYW1lIiwiZ2V0Vmlld05hbWUiLCJjYWNoZSIsImFkZGl0aW9uYWxEYXRhIiwiZ2V0QWRkaXRpb25hbENhY2hlRGF0YSIsImdldERhdGEiLCJzZXRBZGRpdGlvbmFsQ2FjaGVEYXRhIiwidmFsdWUiLCJzZXREYXRhIiwiaGVpZ2h0Iiwib1ZpZXdTZXR0aW5ncyIsImNyZWF0ZUVycm9yUGFnZSIsInJlYXNvbiIsIm1lc3NhZ2UiLCJlcnJvclZpZXdOYW1lIiwicnVuQXNPd25lciIsIlZpZXciLCJjcmVhdGUiLCJzZXRNb2RlbCIsIk1hbmFnZWRPYmplY3RNb2RlbCIsInNldEFnZ3JlZ2F0aW9uIiwiZ2V0U2VydmljZSIsIm9Sb3V0aW5nU2VydmljZSIsIm9UYXJnZXRJbmZvIiwibU91dGJvdW5kcyIsImNyb3NzTmF2aWdhdGlvbiIsIm91dGJvdW5kcyIsIm1OYXZpZ2F0aW9uIiwiZ2V0TmF2aWdhdGlvbiIsIm5hdmlnYXRpb25PYmplY3RLZXkiLCJuYXZpZ2F0aW9uT2JqZWN0Iiwib3V0Ym91bmRDb25maWciLCJkZXRhaWwiLCJvdXRib3VuZCIsIm91dGJvdW5kRGV0YWlsIiwic2VtYW50aWNPYmplY3QiLCJhY3Rpb24iLCJwYXJhbWV0ZXJzIiwibmF2aWdhdGlvbiIsInZpZXdMZXZlbCIsImNvbnRlbnREZW5zaXRpZXMiLCJyZXNvdXJjZUJ1bmRsZSIsIl9fYnVuZGxlIiwiaXNEZXNrdG9wIiwic3lzdGVtIiwiZGVza3RvcCIsImlzUGhvbmUiLCJwaG9uZSIsImdldFZpZXdEYXRhIiwiYXNzaWduIiwib1NoZWxsU2VydmljZXMiLCJnZXRTaGVsbFNlcnZpY2VzIiwic2hlbGxDb250ZW50RGVuc2l0eSIsImdldENvbnRlbnREZW5zaXR5IiwidXNlTmV3TGF6eUxvYWRpbmciLCJVcmlQYXJhbWV0ZXJzIiwiZnJvbVF1ZXJ5Iiwid2luZG93IiwibG9jYXRpb24iLCJzZWFyY2giLCJyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0IiwiZm9ybSIsImNvbnRyb2xDb25maWd1cmF0aW9uIiwic0Fubm90YXRpb25QYXRoIiwiaW5kZXhPZiIsInNUYXJnZXRBbm5vdGF0aW9uUGF0aCIsInJlc29sdmVEeW5hbWljRXhwcmVzc2lvbiIsImNvbnZlcnRUeXBlcyIsIlRlbXBsYXRlTW9kZWwiLCJvRGlhZ25vc3RpY3MiLCJnZXREaWFnbm9zdGljcyIsImlJc3N1ZUNvdW50IiwiZ2V0SXNzdWVzIiwib0NvbnZlcnRlclBhZ2VNb2RlbCIsImNvbnZlcnRQYWdlIiwiYUlzc3VlcyIsImFBZGRlZElzc3VlcyIsInNsaWNlIiwid2FybmluZyIsIkVycm9yIiwiZ2V0VmlldyIsImdldEludGVyZmFjZSIsImV4aXQiLCJyZW1vdmVHbG9iYWxJbnN0YW5jZSIsIlNlcnZpY2UiLCJUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnkiLCJfb0luc3RhbmNlUmVnaXN0cnkiLCJvU2VydmljZUNvbnRleHQiLCJpQ3JlYXRpbmdWaWV3cyIsIm9UZW1wbGF0ZWRWaWV3U2VydmljZSIsImdldE51bWJlck9mVmlld3NJbkNyZWF0aW9uU3RhdGUiLCJTZXJ2aWNlRmFjdG9yeSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IFVyaVBhcmFtZXRlcnMgZnJvbSBcInNhcC9iYXNlL3V0aWwvVXJpUGFyYW1ldGVyc1wiO1xuaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCB7IHJlcXVpcmVEZXBlbmRlbmNpZXMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Mb2FkZXJVdGlsc1wiO1xuaW1wb3J0IHR5cGUgeyBDYWNoZUhhbmRsZXJTZXJ2aWNlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL0NhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgVGVtcGxhdGVNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVNb2RlbFwiO1xuaW1wb3J0IHR5cGUgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgU2VydmljZUZhY3RvcnlSZWdpc3RyeSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5XCI7XG5pbXBvcnQgRGV2aWNlIGZyb20gXCJzYXAvdWkvRGV2aWNlXCI7XG5pbXBvcnQgTWFuYWdlZE9iamVjdE1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvYmFzZS9NYW5hZ2VkT2JqZWN0TW9kZWxcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9Nb2RlbFwiO1xuaW1wb3J0IFZlcnNpb25JbmZvIGZyb20gXCJzYXAvdWkvVmVyc2lvbkluZm9cIjtcbmltcG9ydCB0eXBlIHsgU2VydmljZUNvbnRleHQgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5pbXBvcnQgeyByZXNvbHZlRHluYW1pY0V4cHJlc3Npb24gfSBmcm9tIFwiLi4vaGVscGVycy9EeW5hbWljQW5ub3RhdGlvblBhdGhIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgUmVzb3VyY2VNb2RlbFNlcnZpY2UgfSBmcm9tIFwiLi9SZXNvdXJjZU1vZGVsU2VydmljZUZhY3RvcnlcIjtcblxudHlwZSBUZW1wbGF0ZWRWaWV3U2VydmljZVNldHRpbmdzID0ge307XG50eXBlIE1hbmlmZXN0Q29udGVudCA9IHtcblx0XCJzYXAuYXBwXCI/OiB7XG5cdFx0XCJjcm9zc05hdmlnYXRpb25cIj86IHtcblx0XHRcdFwib3V0Ym91bmRzXCI/OiBSZWNvcmQ8XG5cdFx0XHRcdHN0cmluZyxcblx0XHRcdFx0e1xuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBzdHJpbmc7XG5cdFx0XHRcdFx0YWN0aW9uOiBzdHJpbmc7XG5cdFx0XHRcdFx0cGFyYW1ldGVyczogc3RyaW5nO1xuXHRcdFx0XHR9XG5cdFx0XHQ+O1xuXHRcdH07XG5cdH07XG5cdFwic2FwLnVpNVwiPzoge1xuXHRcdFwiY29udGVudERlbnNpdGllc1wiPzogc3RyaW5nO1xuXHR9O1xuXHRcInNhcC5mZVwiPzoge1xuXHRcdFwiZm9ybVwiPzoge1xuXHRcdFx0XCJyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0XCI/OiBib29sZWFuO1xuXHRcdH07XG5cdH07XG59O1xuXG5jbGFzcyBUZW1wbGF0ZWRWaWV3U2VydmljZSBleHRlbmRzIFNlcnZpY2U8VGVtcGxhdGVkVmlld1NlcnZpY2VTZXR0aW5ncz4ge1xuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8YW55Pjtcblx0b1ZpZXchOiBWaWV3O1xuXHRvUmVzb3VyY2VNb2RlbFNlcnZpY2UhOiBSZXNvdXJjZU1vZGVsU2VydmljZTtcblx0b0NhY2hlSGFuZGxlclNlcnZpY2UhOiBDYWNoZUhhbmRsZXJTZXJ2aWNlO1xuXHRvRmFjdG9yeSE6IFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeTtcblx0cmVzb3VyY2VNb2RlbCE6IHR5cGVvZiBSZXNvdXJjZU1vZGVsO1xuXHRzdGFibGVJZCE6IHN0cmluZztcblx0VGVtcGxhdGVDb252ZXJ0ZXI6IGFueTtcblx0TWV0YU1vZGVsQ29udmVydGVyOiBhbnk7XG5cdGluaXQoKSB7XG5cdFx0Y29uc3QgYVNlcnZpY2VEZXBlbmRlbmNpZXMgPSBbXTtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuXHRcdGNvbnN0IG9Db21wb25lbnQgPSBvQ29udGV4dC5zY29wZU9iamVjdDtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKG9Db21wb25lbnQpIGFzIEFwcENvbXBvbmVudDtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudC5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBzU3RhYmxlSWQgPSBgJHtvQXBwQ29tcG9uZW50LmdldE1ldGFkYXRhKCkuZ2V0Q29tcG9uZW50TmFtZSgpfTo6JHtvQXBwQ29tcG9uZW50LmdldExvY2FsSWQob0NvbXBvbmVudC5nZXRJZCgpKX1gO1xuXHRcdGNvbnN0IGFFbmhhbmNlSTE4biA9IG9Db21wb25lbnQuZ2V0RW5oYW5jZUkxOG4oKSB8fCBbXTtcblx0XHRsZXQgc0FwcE5hbWVzcGFjZTtcblx0XHR0aGlzLm9GYWN0b3J5ID0gb0NvbnRleHQuZmFjdG9yeTtcblx0XHRpZiAoYUVuaGFuY2VJMThuKSB7XG5cdFx0XHRzQXBwTmFtZXNwYWNlID0gb0FwcENvbXBvbmVudC5nZXRNZXRhZGF0YSgpLmdldENvbXBvbmVudE5hbWUoKTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYUVuaGFuY2VJMThuLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdC8vIEluIG9yZGVyIHRvIHN1cHBvcnQgdGV4dC12ZXJ0aWNhbGl6YXRpb24gYXBwbGljYXRpb25zIGNhbiBhbHNvIHBhc3NzIGEgcmVzb3VyY2UgbW9kZWwgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3Rcblx0XHRcdFx0Ly8gVUk1IHRha2VzIGNhcmUgb2YgdGV4dC12ZXJ0aWNhbGl6YXRpb24gZm9yIHJlc291cmNlIG1vZGVscyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuXHRcdFx0XHQvLyBIZW5jZSBjaGVjayBpZiB0aGUgZ2l2ZW4ga2V5IGlzIGEgcmVzb3VyY2UgbW9kZWwgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3Rcblx0XHRcdFx0Ly8gaWYgc28gdGhpcyBtb2RlbCBzaG91bGQgYmUgdXNlZCB0byBlbmhhbmNlIHRoZSBzYXAuZmUgcmVzb3VyY2UgbW9kZWwgc28gcGFzcyBpdCBhcyBpdCBpc1xuXHRcdFx0XHRjb25zdCBvUmVzb3VyY2VNb2RlbCA9IG9BcHBDb21wb25lbnQuZ2V0TW9kZWwoYUVuaGFuY2VJMThuW2ldKTtcblx0XHRcdFx0aWYgKG9SZXNvdXJjZU1vZGVsICYmIG9SZXNvdXJjZU1vZGVsLmlzQShcInNhcC51aS5tb2RlbC5yZXNvdXJjZS5SZXNvdXJjZU1vZGVsXCIpKSB7XG5cdFx0XHRcdFx0YUVuaGFuY2VJMThuW2ldID0gb1Jlc291cmNlTW9kZWw7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YUVuaGFuY2VJMThuW2ldID0gYCR7c0FwcE5hbWVzcGFjZX0uJHthRW5oYW5jZUkxOG5baV0ucmVwbGFjZShcIi5wcm9wZXJ0aWVzXCIsIFwiXCIpfWA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRjb25zdCBzQ2FjaGVJZGVudGlmaWVyID0gYCR7b0FwcENvbXBvbmVudC5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKX1fJHtzU3RhYmxlSWR9XyR7c2FwLnVpXG5cdFx0XHQuZ2V0Q29yZSgpXG5cdFx0XHQuZ2V0Q29uZmlndXJhdGlvbigpXG5cdFx0XHQuZ2V0TGFuZ3VhZ2VUYWcoKX1gO1xuXHRcdGFTZXJ2aWNlRGVwZW5kZW5jaWVzLnB1c2goXG5cdFx0XHRTZXJ2aWNlRmFjdG9yeVJlZ2lzdHJ5LmdldChcInNhcC5mZS5jb3JlLnNlcnZpY2VzLlJlc291cmNlTW9kZWxTZXJ2aWNlXCIpXG5cdFx0XHRcdC5jcmVhdGVJbnN0YW5jZSh7XG5cdFx0XHRcdFx0c2NvcGVUeXBlOiBcImNvbXBvbmVudFwiLFxuXHRcdFx0XHRcdHNjb3BlT2JqZWN0OiBvQ29tcG9uZW50LFxuXHRcdFx0XHRcdHNldHRpbmdzOiB7XG5cdFx0XHRcdFx0XHRidW5kbGVzOiBbXCJzYXAuZmUuY29yZS5tZXNzYWdlYnVuZGxlXCIsIFwic2FwLmZlLm1hY3Jvcy5tZXNzYWdlYnVuZGxlXCIsIFwic2FwLmZlLnRlbXBsYXRlcy5tZXNzYWdlYnVuZGxlXCJdLFxuXHRcdFx0XHRcdFx0ZW5oYW5jZUkxOG46IGFFbmhhbmNlSTE4bixcblx0XHRcdFx0XHRcdG1vZGVsTmFtZTogXCJzYXAuZmUuaTE4blwiXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbigob1Jlc291cmNlTW9kZWxTZXJ2aWNlOiBSZXNvdXJjZU1vZGVsU2VydmljZSkgPT4ge1xuXHRcdFx0XHRcdHRoaXMub1Jlc291cmNlTW9kZWxTZXJ2aWNlID0gb1Jlc291cmNlTW9kZWxTZXJ2aWNlO1xuXHRcdFx0XHRcdHJldHVybiBvUmVzb3VyY2VNb2RlbFNlcnZpY2UuZ2V0UmVzb3VyY2VNb2RlbCgpO1xuXHRcdFx0XHR9KVxuXHRcdCk7XG5cblx0XHRhU2VydmljZURlcGVuZGVuY2llcy5wdXNoKFxuXHRcdFx0U2VydmljZUZhY3RvcnlSZWdpc3RyeS5nZXQoXCJzYXAuZmUuY29yZS5zZXJ2aWNlcy5DYWNoZUhhbmRsZXJTZXJ2aWNlXCIpXG5cdFx0XHRcdC5jcmVhdGVJbnN0YW5jZSh7XG5cdFx0XHRcdFx0c2V0dGluZ3M6IHtcblx0XHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdGFwcENvbXBvbmVudDogb0FwcENvbXBvbmVudCxcblx0XHRcdFx0XHRcdGNvbXBvbmVudDogb0NvbXBvbmVudFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKG9DYWNoZUhhbmRsZXJTZXJ2aWNlOiBhbnkpID0+IHtcblx0XHRcdFx0XHR0aGlzLm9DYWNoZUhhbmRsZXJTZXJ2aWNlID0gb0NhY2hlSGFuZGxlclNlcnZpY2U7XG5cdFx0XHRcdFx0cmV0dXJuIG9DYWNoZUhhbmRsZXJTZXJ2aWNlLnZhbGlkYXRlQ2FjaGVLZXkoc0NhY2hlSWRlbnRpZmllciwgb0NvbXBvbmVudCk7XG5cdFx0XHRcdH0pXG5cdFx0KTtcblx0XHRhU2VydmljZURlcGVuZGVuY2llcy5wdXNoKFxuXHRcdFx0KFZlcnNpb25JbmZvIGFzIGFueSlcblx0XHRcdFx0LmxvYWQoKVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAob0luZm86IGFueSkge1xuXHRcdFx0XHRcdGxldCBzVGltZXN0YW1wID0gXCJcIjtcblx0XHRcdFx0XHRpZiAoIW9JbmZvLmxpYnJhcmllcykge1xuXHRcdFx0XHRcdFx0c1RpbWVzdGFtcCA9IChzYXAudWkgYXMgYW55KS5idWlsZGluZm8uYnVpbGR0aW1lO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvSW5mby5saWJyYXJpZXMuZm9yRWFjaChmdW5jdGlvbiAob0xpYnJhcnk6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRzVGltZXN0YW1wICs9IG9MaWJyYXJ5LmJ1aWxkVGltZXN0YW1wO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBzVGltZXN0YW1wO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHJldHVybiBcIjxOT1ZBTFVFPlwiO1xuXHRcdFx0XHR9KVxuXHRcdCk7XG5cblx0XHR0aGlzLmluaXRQcm9taXNlID0gUHJvbWlzZS5hbGwoYVNlcnZpY2VEZXBlbmRlbmNpZXMpXG5cdFx0XHQudGhlbihhc3luYyAoYURlcGVuZGVuY2llc1Jlc3VsdDogYW55W10pID0+IHtcblx0XHRcdFx0Y29uc3Qgb1Jlc291cmNlTW9kZWwgPSBhRGVwZW5kZW5jaWVzUmVzdWx0WzBdO1xuXHRcdFx0XHRjb25zdCBzQ2FjaGVLZXkgPSBhRGVwZW5kZW5jaWVzUmVzdWx0WzFdO1xuXHRcdFx0XHRjb25zdCBvU2lkZUVmZmVjdHNTZXJ2aWNlcyA9IG9BcHBDb21wb25lbnQuZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlKCk7XG5cdFx0XHRcdG9TaWRlRWZmZWN0c1NlcnZpY2VzLmluaXRpYWxpemVTaWRlRWZmZWN0cyhvQXBwQ29tcG9uZW50LmdldEVudmlyb25tZW50Q2FwYWJpbGl0aWVzKCkuZ2V0Q2FwYWJpbGl0aWVzKCkpO1xuXG5cdFx0XHRcdGNvbnN0IFtUZW1wbGF0ZUNvbnZlcnRlciwgTWV0YU1vZGVsQ29udmVydGVyXSA9IGF3YWl0IHJlcXVpcmVEZXBlbmRlbmNpZXMoW1xuXHRcdFx0XHRcdFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9UZW1wbGF0ZUNvbnZlcnRlclwiLFxuXHRcdFx0XHRcdFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIlxuXHRcdFx0XHRdKTtcblx0XHRcdFx0cmV0dXJuIHRoaXMuY3JlYXRlVmlldyhvUmVzb3VyY2VNb2RlbCwgc1N0YWJsZUlkLCBzQ2FjaGVLZXksIFRlbXBsYXRlQ29udmVydGVyLCBNZXRhTW9kZWxDb252ZXJ0ZXIpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChzQ2FjaGVLZXk6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvQ2FjaGVIYW5kbGVyU2VydmljZSA9IFNlcnZpY2VGYWN0b3J5UmVnaXN0cnkuZ2V0KFwic2FwLmZlLmNvcmUuc2VydmljZXMuQ2FjaGVIYW5kbGVyU2VydmljZVwiKS5nZXRJbnN0YW5jZShvTWV0YU1vZGVsKTtcblx0XHRcdFx0b0NhY2hlSGFuZGxlclNlcnZpY2UuaW52YWxpZGF0ZUlmTmVlZGVkKHNDYWNoZUtleSwgc0NhY2hlSWRlbnRpZmllciwgb0NvbXBvbmVudCk7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZWZyZXNoIHRoZSBjdXJyZW50IHZpZXcgdXNpbmcgdGhlIHNhbWUgY29uZmlndXJhdGlvbiBhcyBiZWZvcmUuXG5cdCAqIFRoaXMgaXMgdXNlZnVsIGZvciBvdXIgZGVtb2tpdCAhXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29tcG9uZW50XG5cdCAqIEByZXR1cm5zIEEgcHJvbWlzZSBpbmRpY2F0aW5nIHdoZW4gdGhlIHZpZXcgaXMgcmVmcmVzaGVkXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRyZWZyZXNoVmlldyhvQ29tcG9uZW50OiBhbnkpIHtcblx0XHRjb25zdCBvUm9vdFZpZXcgPSBvQ29tcG9uZW50LmdldFJvb3RDb250cm9sKCk7XG5cdFx0aWYgKG9Sb290Vmlldykge1xuXHRcdFx0b1Jvb3RWaWV3LmRlc3Ryb3koKTtcblx0XHR9IGVsc2UgaWYgKHRoaXMub1ZpZXcpIHtcblx0XHRcdHRoaXMub1ZpZXcuZGVzdHJveSgpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5jcmVhdGVWaWV3KHRoaXMucmVzb3VyY2VNb2RlbCwgdGhpcy5zdGFibGVJZCwgXCJcIiwgdGhpcy5UZW1wbGF0ZUNvbnZlcnRlciwgdGhpcy5NZXRhTW9kZWxDb252ZXJ0ZXIpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdG9Db21wb25lbnQub0NvbnRhaW5lci5pbnZhbGlkYXRlKCk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRvQ29tcG9uZW50Lm9Db250YWluZXIuaW52YWxpZGF0ZSgpO1xuXHRcdFx0XHRMb2cuZXJyb3Iob0Vycm9yKTtcblx0XHRcdH0pO1xuXHR9XG5cdGFzeW5jIGNyZWF0ZVZpZXcoXG5cdFx0b1Jlc291cmNlTW9kZWw6IGFueSxcblx0XHRzU3RhYmxlSWQ6IGFueSxcblx0XHRzQ2FjaGVLZXk6IGFueSxcblx0XHRUZW1wbGF0ZUNvbnZlcnRlcjogYW55LFxuXHRcdE1ldGFNb2RlbENvbnZlcnRlcjogYW55XG5cdCk6IFByb21pc2U8YW55IHwgdm9pZD4ge1xuXHRcdHRoaXMucmVzb3VyY2VNb2RlbCA9IG9SZXNvdXJjZU1vZGVsO1xuXHRcdHRoaXMuc3RhYmxlSWQgPSBzU3RhYmxlSWQ7XG5cdFx0dGhpcy5UZW1wbGF0ZUNvbnZlcnRlciA9IFRlbXBsYXRlQ29udmVydGVyO1xuXHRcdHRoaXMuTWV0YU1vZGVsQ29udmVydGVyID0gTWV0YU1vZGVsQ29udmVydGVyO1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gdGhpcy5nZXRDb250ZXh0KCk7XG5cdFx0Y29uc3QgbVNlcnZpY2VTZXR0aW5ncyA9IG9Db250ZXh0LnNldHRpbmdzO1xuXHRcdGNvbnN0IHNDb252ZXJ0ZXJUeXBlID0gbVNlcnZpY2VTZXR0aW5ncy5jb252ZXJ0ZXJUeXBlO1xuXHRcdGNvbnN0IG9Db21wb25lbnQgPSBvQ29udGV4dC5zY29wZU9iamVjdDtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob0NvbXBvbmVudCkgYXMgQXBwQ29tcG9uZW50O1xuXHRcdGNvbnN0IHNGdWxsQ29udGV4dFBhdGggPSBvQXBwQ29tcG9uZW50LmdldFJvdXRpbmdTZXJ2aWNlKCkuZ2V0VGFyZ2V0SW5mb3JtYXRpb25Gb3Iob0NvbXBvbmVudCkub3B0aW9ucy5zZXR0aW5ncy5mdWxsQ29udGV4dFBhdGg7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9BcHBDb21wb25lbnQuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0Y29uc3Qgb01hbmlmZXN0Q29udGVudDogTWFuaWZlc3RDb250ZW50ID0gb0FwcENvbXBvbmVudC5nZXRNYW5pZmVzdCgpO1xuXHRcdGNvbnN0IG9EZXZpY2VNb2RlbCA9IG5ldyBKU09OTW9kZWwoRGV2aWNlKS5zZXREZWZhdWx0QmluZGluZ01vZGUoXCJPbmVXYXlcIik7XG5cdFx0Y29uc3Qgb01hbmlmZXN0TW9kZWwgPSBuZXcgSlNPTk1vZGVsKG9NYW5pZmVzdENvbnRlbnQpO1xuXHRcdGNvbnN0IGJFcnJvciA9IGZhbHNlO1xuXHRcdGxldCBvUGFnZU1vZGVsOiBUZW1wbGF0ZU1vZGVsLCBvVmlld0RhdGFNb2RlbDogTW9kZWwsIG9WaWV3U2V0dGluZ3M6IGFueSwgbVZpZXdEYXRhOiBhbnk7XG5cdFx0Ly8gTG9hZCB0aGUgaW5kZXggZm9yIHRoZSBhZGRpdGlvbmFsIGJ1aWxkaW5nIGJsb2NrcyB3aGljaCBpcyByZXNwb25zaWJsZSBmb3IgaW5pdGlhbGl6aW5nIHRoZW1cblx0XHRmdW5jdGlvbiBnZXRWaWV3U2V0dGluZ3MoKSB7XG5cdFx0XHRjb25zdCBhU3BsaXRQYXRoID0gc0Z1bGxDb250ZXh0UGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IGFTcGxpdFBhdGgucmVkdWNlKGZ1bmN0aW9uIChzUGF0aFNvRmFyOiBhbnksIHNOZXh0UGF0aFBhcnQ6IGFueSkge1xuXHRcdFx0XHRpZiAoc05leHRQYXRoUGFydCA9PT0gXCJcIikge1xuXHRcdFx0XHRcdHJldHVybiBzUGF0aFNvRmFyO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChzUGF0aFNvRmFyID09PSBcIlwiKSB7XG5cdFx0XHRcdFx0c1BhdGhTb0ZhciA9IGAvJHtzTmV4dFBhdGhQYXJ0fWA7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1RhcmdldCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NQYXRoU29GYXJ9LyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nLyR7c05leHRQYXRoUGFydH1gKTtcblx0XHRcdFx0XHRpZiAob1RhcmdldCAmJiBPYmplY3Qua2V5cyhvVGFyZ2V0KS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRzUGF0aFNvRmFyICs9IFwiLyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCI7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHNQYXRoU29GYXIgKz0gYC8ke3NOZXh0UGF0aFBhcnR9YDtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gc1BhdGhTb0Zhcjtcblx0XHRcdH0sIFwiXCIpO1xuXHRcdFx0bGV0IHZpZXdUeXBlID0gbVNlcnZpY2VTZXR0aW5ncy52aWV3VHlwZSB8fCBvQ29tcG9uZW50LmdldFZpZXdUeXBlKCkgfHwgXCJYTUxcIjtcblx0XHRcdGlmICh2aWV3VHlwZSAhPT0gXCJYTUxcIikge1xuXHRcdFx0XHR2aWV3VHlwZSA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHR5cGU6IHZpZXdUeXBlLFxuXHRcdFx0XHRwcmVwcm9jZXNzb3JzOiB7XG5cdFx0XHRcdFx0eG1sOiB7XG5cdFx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcdFx0ZW50aXR5U2V0OiBzRW50aXR5U2V0UGF0aCA/IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0VudGl0eVNldFBhdGgpIDogbnVsbCxcblx0XHRcdFx0XHRcdFx0ZnVsbENvbnRleHRQYXRoOiBzRnVsbENvbnRleHRQYXRoID8gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzRnVsbENvbnRleHRQYXRoKSA6IG51bGwsXG5cdFx0XHRcdFx0XHRcdGNvbnRleHRQYXRoOiBzRnVsbENvbnRleHRQYXRoID8gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzRnVsbENvbnRleHRQYXRoKSA6IG51bGwsXG5cdFx0XHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IG9QYWdlTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIsIHVuZGVmaW5lZCwgeyBub1Jlc29sdmU6IHRydWUgfSksXG5cdFx0XHRcdFx0XHRcdHZpZXdEYXRhOiBtVmlld0RhdGEgPyBvVmlld0RhdGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIikgOiBudWxsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHRcdGVudGl0eVNldDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0ZnVsbENvbnRleHRQYXRoOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0XCJzYXAuZmUuaTE4blwiOiBvUmVzb3VyY2VNb2RlbCxcblx0XHRcdFx0XHRcdFx0bWV0YU1vZGVsOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRcImRldmljZVwiOiBvRGV2aWNlTW9kZWwsXG5cdFx0XHRcdFx0XHRcdG1hbmlmZXN0OiBvTWFuaWZlc3RNb2RlbCxcblx0XHRcdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dDogb1BhZ2VNb2RlbCxcblx0XHRcdFx0XHRcdFx0dmlld0RhdGE6IG9WaWV3RGF0YU1vZGVsXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0YXBwQ29tcG9uZW50OiBvQXBwQ29tcG9uZW50XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRpZDogc1N0YWJsZUlkLFxuXHRcdFx0XHR2aWV3TmFtZTogbVNlcnZpY2VTZXR0aW5ncy52aWV3TmFtZSB8fCBvQ29tcG9uZW50LmdldFZpZXdOYW1lKCksXG5cdFx0XHRcdHZpZXdEYXRhOiBtVmlld0RhdGEsXG5cdFx0XHRcdGNhY2hlOiB7XG5cdFx0XHRcdFx0a2V5czogW3NDYWNoZUtleV0sXG5cdFx0XHRcdFx0YWRkaXRpb25hbERhdGE6IHtcblx0XHRcdFx0XHRcdC8vIFdlIHN0b3JlIHRoZSBwYWdlIG1vZGVsIGRhdGEgaW4gdGhlIGBhZGRpdGlvbmFsRGF0YWAgb2YgdGhlIHZpZXcgY2FjaGUsIHRoaXMgd2F5IGl0IGlzIGFsd2F5cyBpbiBzeW5jXG5cdFx0XHRcdFx0XHRnZXRBZGRpdGlvbmFsQ2FjaGVEYXRhOiAoKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiAob1BhZ2VNb2RlbCBhcyB1bmtub3duIGFzIEpTT05Nb2RlbCkuZ2V0RGF0YSgpO1xuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdHNldEFkZGl0aW9uYWxDYWNoZURhdGE6ICh2YWx1ZTogb2JqZWN0KSA9PiB7XG5cdFx0XHRcdFx0XHRcdChvUGFnZU1vZGVsIGFzIHVua25vd24gYXMgSlNPTk1vZGVsKS5zZXREYXRhKHZhbHVlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFwic2FwLmZlLmkxOG5cIjogb1Jlc291cmNlTW9kZWxcblx0XHRcdFx0fSxcblx0XHRcdFx0aGVpZ2h0OiBcIjEwMCVcIlxuXHRcdFx0fTtcblx0XHR9XG5cdFx0Y29uc3QgY3JlYXRlRXJyb3JQYWdlID0gKHJlYXNvbjogYW55KSA9PiB7XG5cdFx0XHQvLyBqdXN0IHJlcGxhY2UgdGhlIHZpZXcgbmFtZSBhbmQgYWRkIGFuIGFkZGl0aW9uYWwgbW9kZWwgY29udGFpbmluZyB0aGUgcmVhc29uLCBidXRcblx0XHRcdC8vIGtlZXAgdGhlIG90aGVyIHNldHRpbmdzXG5cdFx0XHRMb2cuZXJyb3IocmVhc29uLm1lc3NhZ2UsIHJlYXNvbik7XG5cdFx0XHRvVmlld1NldHRpbmdzLnZpZXdOYW1lID0gbVNlcnZpY2VTZXR0aW5ncy5lcnJvclZpZXdOYW1lIHx8IFwic2FwLmZlLmNvcmUuc2VydmljZXMudmlldy5UZW1wbGF0aW5nRXJyb3JQYWdlXCI7XG5cdFx0XHRvVmlld1NldHRpbmdzLnByZXByb2Nlc3NvcnMueG1sLm1vZGVsc1tcImVycm9yXCJdID0gbmV3IEpTT05Nb2RlbChyZWFzb24pO1xuXG5cdFx0XHRyZXR1cm4gb0NvbXBvbmVudC5ydW5Bc093bmVyKCgpID0+IHtcblx0XHRcdFx0cmV0dXJuIFZpZXcuY3JlYXRlKG9WaWV3U2V0dGluZ3MpLnRoZW4oKG9WaWV3OiBhbnkpID0+IHtcblx0XHRcdFx0XHR0aGlzLm9WaWV3ID0gb1ZpZXc7XG5cdFx0XHRcdFx0dGhpcy5vVmlldy5zZXRNb2RlbChuZXcgTWFuYWdlZE9iamVjdE1vZGVsKHRoaXMub1ZpZXcpLCBcIiR2aWV3XCIpO1xuXHRcdFx0XHRcdG9Db21wb25lbnQuc2V0QWdncmVnYXRpb24oXCJyb290Q29udHJvbFwiLCB0aGlzLm9WaWV3KTtcblx0XHRcdFx0XHRyZXR1cm4gc0NhY2hlS2V5O1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH07XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3Qgb1JvdXRpbmdTZXJ2aWNlID0gYXdhaXQgb0FwcENvbXBvbmVudC5nZXRTZXJ2aWNlKFwicm91dGluZ1NlcnZpY2VcIik7XG5cdFx0XHQvLyBSZXRyaWV2ZSB0aGUgdmlld0xldmVsIGZvciB0aGUgY29tcG9uZW50XG5cdFx0XHRjb25zdCBvVGFyZ2V0SW5mbyA9IG9Sb3V0aW5nU2VydmljZS5nZXRUYXJnZXRJbmZvcm1hdGlvbkZvcihvQ29tcG9uZW50KTtcblx0XHRcdGNvbnN0IG1PdXRib3VuZHMgPVxuXHRcdFx0XHQob01hbmlmZXN0Q29udGVudFtcInNhcC5hcHBcIl0gJiZcblx0XHRcdFx0XHRvTWFuaWZlc3RDb250ZW50W1wic2FwLmFwcFwiXS5jcm9zc05hdmlnYXRpb24gJiZcblx0XHRcdFx0XHRvTWFuaWZlc3RDb250ZW50W1wic2FwLmFwcFwiXS5jcm9zc05hdmlnYXRpb24ub3V0Ym91bmRzKSB8fFxuXHRcdFx0XHR7fTtcblx0XHRcdGNvbnN0IG1OYXZpZ2F0aW9uID0gb0NvbXBvbmVudC5nZXROYXZpZ2F0aW9uKCkgfHwge307XG5cdFx0XHRPYmplY3Qua2V5cyhtTmF2aWdhdGlvbikuZm9yRWFjaChmdW5jdGlvbiAobmF2aWdhdGlvbk9iamVjdEtleTogc3RyaW5nKSB7XG5cdFx0XHRcdGNvbnN0IG5hdmlnYXRpb25PYmplY3QgPSBtTmF2aWdhdGlvbltuYXZpZ2F0aW9uT2JqZWN0S2V5XTtcblx0XHRcdFx0bGV0IG91dGJvdW5kQ29uZmlnO1xuXHRcdFx0XHRpZiAobmF2aWdhdGlvbk9iamVjdC5kZXRhaWwgJiYgbmF2aWdhdGlvbk9iamVjdC5kZXRhaWwub3V0Ym91bmQgJiYgbU91dGJvdW5kc1tuYXZpZ2F0aW9uT2JqZWN0LmRldGFpbC5vdXRib3VuZF0pIHtcblx0XHRcdFx0XHRvdXRib3VuZENvbmZpZyA9IG1PdXRib3VuZHNbbmF2aWdhdGlvbk9iamVjdC5kZXRhaWwub3V0Ym91bmRdO1xuXHRcdFx0XHRcdG5hdmlnYXRpb25PYmplY3QuZGV0YWlsLm91dGJvdW5kRGV0YWlsID0ge1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG91dGJvdW5kQ29uZmlnLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0YWN0aW9uOiBvdXRib3VuZENvbmZpZy5hY3Rpb24sXG5cdFx0XHRcdFx0XHRwYXJhbWV0ZXJzOiBvdXRib3VuZENvbmZpZy5wYXJhbWV0ZXJzXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAobmF2aWdhdGlvbk9iamVjdC5jcmVhdGUgJiYgbmF2aWdhdGlvbk9iamVjdC5jcmVhdGUub3V0Ym91bmQgJiYgbU91dGJvdW5kc1tuYXZpZ2F0aW9uT2JqZWN0LmNyZWF0ZS5vdXRib3VuZF0pIHtcblx0XHRcdFx0XHRvdXRib3VuZENvbmZpZyA9IG1PdXRib3VuZHNbbmF2aWdhdGlvbk9iamVjdC5jcmVhdGUub3V0Ym91bmRdO1xuXHRcdFx0XHRcdG5hdmlnYXRpb25PYmplY3QuY3JlYXRlLm91dGJvdW5kRGV0YWlsID0ge1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG91dGJvdW5kQ29uZmlnLnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0YWN0aW9uOiBvdXRib3VuZENvbmZpZy5hY3Rpb24sXG5cdFx0XHRcdFx0XHRwYXJhbWV0ZXJzOiBvdXRib3VuZENvbmZpZy5wYXJhbWV0ZXJzXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRtVmlld0RhdGEgPSB7XG5cdFx0XHRcdG5hdmlnYXRpb246IG1OYXZpZ2F0aW9uLFxuXHRcdFx0XHR2aWV3TGV2ZWw6IG9UYXJnZXRJbmZvLnZpZXdMZXZlbCxcblx0XHRcdFx0c3RhYmxlSWQ6IHNTdGFibGVJZCxcblx0XHRcdFx0Y29udGVudERlbnNpdGllczogb01hbmlmZXN0Q29udGVudFtcInNhcC51aTVcIl0/LmNvbnRlbnREZW5zaXRpZXMsXG5cdFx0XHRcdHJlc291cmNlQnVuZGxlOiBvUmVzb3VyY2VNb2RlbC5fX2J1bmRsZSxcblx0XHRcdFx0ZnVsbENvbnRleHRQYXRoOiBzRnVsbENvbnRleHRQYXRoLFxuXHRcdFx0XHRpc0Rlc2t0b3A6IChEZXZpY2UgYXMgYW55KS5zeXN0ZW0uZGVza3RvcCxcblx0XHRcdFx0aXNQaG9uZTogKERldmljZSBhcyBhbnkpLnN5c3RlbS5waG9uZVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKG9Db21wb25lbnQuZ2V0Vmlld0RhdGEpIHtcblx0XHRcdFx0T2JqZWN0LmFzc2lnbihtVmlld0RhdGEsIG9Db21wb25lbnQuZ2V0Vmlld0RhdGEoKSk7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnN0IG9TaGVsbFNlcnZpY2VzID0gb0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdFx0XHRtVmlld0RhdGEuY29udmVydGVyVHlwZSA9IHNDb252ZXJ0ZXJUeXBlO1xuXHRcdFx0bVZpZXdEYXRhLnNoZWxsQ29udGVudERlbnNpdHkgPSBvU2hlbGxTZXJ2aWNlcy5nZXRDb250ZW50RGVuc2l0eSgpO1xuXHRcdFx0bVZpZXdEYXRhLnVzZU5ld0xhenlMb2FkaW5nID0gVXJpUGFyYW1ldGVycy5mcm9tUXVlcnkod2luZG93LmxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwic2FwLWZlLXh4LWxhenlsb2FkaW5ndGVzdFwiKSA9PT0gXCJ0cnVlXCI7XG5cdFx0XHRtVmlld0RhdGEucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCA9XG5cdFx0XHRcdG9NYW5pZmVzdENvbnRlbnRbXCJzYXAuZmVcIl0gJiYgb01hbmlmZXN0Q29udGVudFtcInNhcC5mZVwiXS5mb3JtXG5cdFx0XHRcdFx0PyBvTWFuaWZlc3RDb250ZW50W1wic2FwLmZlXCJdLmZvcm0ucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdFxuXHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0b1ZpZXdEYXRhTW9kZWwgPSBuZXcgSlNPTk1vZGVsKG1WaWV3RGF0YSk7XG5cdFx0XHRpZiAobVZpZXdEYXRhICYmIG1WaWV3RGF0YS5jb250cm9sQ29uZmlndXJhdGlvbikge1xuXHRcdFx0XHRPYmplY3Qua2V5cyhtVmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb24pLmZvckVhY2goZnVuY3Rpb24gKHNBbm5vdGF0aW9uUGF0aDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0aWYgKHNBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiW1wiKSAhPT0gLTEpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHNUYXJnZXRBbm5vdGF0aW9uUGF0aCA9IHJlc29sdmVEeW5hbWljRXhwcmVzc2lvbihzQW5ub3RhdGlvblBhdGgsIG9NZXRhTW9kZWwpO1xuXHRcdFx0XHRcdFx0bVZpZXdEYXRhLmNvbnRyb2xDb25maWd1cmF0aW9uW3NUYXJnZXRBbm5vdGF0aW9uUGF0aF0gPSBtVmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb25bc0Fubm90YXRpb25QYXRoXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0TWV0YU1vZGVsQ29udmVydGVyLmNvbnZlcnRUeXBlcyhvTWV0YU1vZGVsLCBvQXBwQ29tcG9uZW50LmdldEVudmlyb25tZW50Q2FwYWJpbGl0aWVzKCkuZ2V0Q2FwYWJpbGl0aWVzKCkpO1xuXHRcdFx0b1BhZ2VNb2RlbCA9IG5ldyBUZW1wbGF0ZU1vZGVsKCgpID0+IHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRjb25zdCBvRGlhZ25vc3RpY3MgPSBvQXBwQ29tcG9uZW50LmdldERpYWdub3N0aWNzKCk7XG5cdFx0XHRcdFx0Y29uc3QgaUlzc3VlQ291bnQgPSBvRGlhZ25vc3RpY3MuZ2V0SXNzdWVzKCkubGVuZ3RoO1xuXHRcdFx0XHRcdGNvbnN0IG9Db252ZXJ0ZXJQYWdlTW9kZWwgPSBUZW1wbGF0ZUNvbnZlcnRlci5jb252ZXJ0UGFnZShcblx0XHRcdFx0XHRcdHNDb252ZXJ0ZXJUeXBlLFxuXHRcdFx0XHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdG1WaWV3RGF0YSxcblx0XHRcdFx0XHRcdG9EaWFnbm9zdGljcyxcblx0XHRcdFx0XHRcdHNGdWxsQ29udGV4dFBhdGgsXG5cdFx0XHRcdFx0XHRvQXBwQ29tcG9uZW50LmdldEVudmlyb25tZW50Q2FwYWJpbGl0aWVzKCkuZ2V0Q2FwYWJpbGl0aWVzKCksXG5cdFx0XHRcdFx0XHRvQ29tcG9uZW50XG5cdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdGNvbnN0IGFJc3N1ZXMgPSBvRGlhZ25vc3RpY3MuZ2V0SXNzdWVzKCk7XG5cdFx0XHRcdFx0Y29uc3QgYUFkZGVkSXNzdWVzID0gYUlzc3Vlcy5zbGljZShpSXNzdWVDb3VudCk7XG5cdFx0XHRcdFx0aWYgKGFBZGRlZElzc3Vlcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRMb2cud2FybmluZyhcblx0XHRcdFx0XHRcdFx0XCJTb21lIGlzc3VlcyBoYXZlIGJlZW4gZGV0ZWN0ZWQgaW4geW91ciBwcm9qZWN0LCBwbGVhc2UgY2hlY2sgdGhlIFVJNSBzdXBwb3J0IGFzc2lzdGFudCBydWxlIGZvciBzYXAuZmUuY29yZVwiXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gb0NvbnZlcnRlclBhZ2VNb2RlbDtcblx0XHRcdFx0fSBjYXRjaCAoZXJyb3IpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoZXJyb3IgYXMgYW55LCBlcnJvciBhcyBhbnkpO1xuXHRcdFx0XHRcdHJldHVybiB7fTtcblx0XHRcdFx0fVxuXHRcdFx0fSwgb01ldGFNb2RlbCk7XG5cblx0XHRcdGlmICghYkVycm9yKSB7XG5cdFx0XHRcdG9WaWV3U2V0dGluZ3MgPSBnZXRWaWV3U2V0dGluZ3MoKTtcblx0XHRcdFx0Ly8gU2V0dGluZyB0aGUgcGFnZU1vZGVsIG9uIHRoZSBjb21wb25lbnQgZm9yIHBvdGVudGlhbCByZXVzZVxuXHRcdFx0XHRvQ29tcG9uZW50LnNldE1vZGVsKG9QYWdlTW9kZWwsIFwiX3BhZ2VNb2RlbFwiKTtcblx0XHRcdFx0cmV0dXJuIG9Db21wb25lbnQucnVuQXNPd25lcigoKSA9PiB7XG5cdFx0XHRcdFx0cmV0dXJuIFZpZXcuY3JlYXRlKG9WaWV3U2V0dGluZ3MpXG5cdFx0XHRcdFx0XHQuY2F0Y2goY3JlYXRlRXJyb3JQYWdlKVxuXHRcdFx0XHRcdFx0LnRoZW4oKG9WaWV3OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0dGhpcy5vVmlldyA9IG9WaWV3O1xuXHRcdFx0XHRcdFx0XHR0aGlzLm9WaWV3LnNldE1vZGVsKG5ldyBNYW5hZ2VkT2JqZWN0TW9kZWwodGhpcy5vVmlldyksIFwiJHZpZXdcIik7XG5cdFx0XHRcdFx0XHRcdHRoaXMub1ZpZXcuc2V0TW9kZWwob1ZpZXdEYXRhTW9kZWwsIFwidmlld0RhdGFcIik7XG5cdFx0XHRcdFx0XHRcdG9Db21wb25lbnQuc2V0QWdncmVnYXRpb24oXCJyb290Q29udHJvbFwiLCB0aGlzLm9WaWV3KTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHNDYWNoZUtleTtcblx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQuY2F0Y2goKGUpID0+IExvZy5lcnJvcihlLm1lc3NhZ2UsIGUpKTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKGVycm9yLm1lc3NhZ2UsIGVycm9yKTtcblx0XHRcdHRocm93IG5ldyBFcnJvcihgRXJyb3Igd2hpbGUgY3JlYXRpbmcgdmlldyA6ICR7ZXJyb3J9YCk7XG5cdFx0fVxuXHR9XG5cdGdldFZpZXcoKSB7XG5cdFx0cmV0dXJuIHRoaXMub1ZpZXc7XG5cdH1cblx0Z2V0SW50ZXJmYWNlKCk6IGFueSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cblx0ZXhpdCgpIHtcblx0XHQvLyBEZXJlZ2lzdGVyIGdsb2JhbCBpbnN0YW5jZVxuXHRcdGlmICh0aGlzLm9SZXNvdXJjZU1vZGVsU2VydmljZSkge1xuXHRcdFx0dGhpcy5vUmVzb3VyY2VNb2RlbFNlcnZpY2UuZGVzdHJveSgpO1xuXHRcdH1cblx0XHRpZiAodGhpcy5vQ2FjaGVIYW5kbGVyU2VydmljZSkge1xuXHRcdFx0dGhpcy5vQ2FjaGVIYW5kbGVyU2VydmljZS5kZXN0cm95KCk7XG5cdFx0fVxuXHRcdHRoaXMub0ZhY3RvcnkucmVtb3ZlR2xvYmFsSW5zdGFuY2UoKTtcblx0fVxufVxuY2xhc3MgVGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8VGVtcGxhdGVkVmlld1NlcnZpY2VTZXR0aW5ncz4ge1xuXHRfb0luc3RhbmNlUmVnaXN0cnk6IFJlY29yZDxzdHJpbmcsIFRlbXBsYXRlZFZpZXdTZXJ2aWNlPiA9IHt9O1xuXHRzdGF0aWMgaUNyZWF0aW5nVmlld3M6IDA7XG5cdGNyZWF0ZUluc3RhbmNlKG9TZXJ2aWNlQ29udGV4dDogU2VydmljZUNvbnRleHQ8VGVtcGxhdGVkVmlld1NlcnZpY2VTZXR0aW5ncz4pIHtcblx0XHRUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3RvcnkuaUNyZWF0aW5nVmlld3MrKztcblxuXHRcdGNvbnN0IG9UZW1wbGF0ZWRWaWV3U2VydmljZSA9IG5ldyBUZW1wbGF0ZWRWaWV3U2VydmljZShPYmplY3QuYXNzaWduKHsgZmFjdG9yeTogdGhpcyB9LCBvU2VydmljZUNvbnRleHQpKTtcblx0XHRyZXR1cm4gb1RlbXBsYXRlZFZpZXdTZXJ2aWNlLmluaXRQcm9taXNlLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0VGVtcGxhdGVkVmlld1NlcnZpY2VGYWN0b3J5LmlDcmVhdGluZ1ZpZXdzLS07XG5cdFx0XHRyZXR1cm4gb1RlbXBsYXRlZFZpZXdTZXJ2aWNlO1xuXHRcdH0pO1xuXHR9XG5cdHJlbW92ZUdsb2JhbEluc3RhbmNlKCkge1xuXHRcdHRoaXMuX29JbnN0YW5jZVJlZ2lzdHJ5ID0ge307XG5cdH1cblx0c3RhdGljIGdldE51bWJlck9mVmlld3NJbkNyZWF0aW9uU3RhdGUoKSB7XG5cdFx0cmV0dXJuIFRlbXBsYXRlZFZpZXdTZXJ2aWNlRmFjdG9yeS5pQ3JlYXRpbmdWaWV3cztcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZW1wbGF0ZWRWaWV3U2VydmljZUZhY3Rvcnk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7OztFQWtqQk8sZ0JBQWdCQSxJQUFJLEVBQUVDLE9BQU8sRUFBRTtJQUNyQyxJQUFJO01BQ0gsSUFBSUMsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU1HLENBQUMsRUFBRTtNQUNWLE9BQU9GLE9BQU8sQ0FBQ0UsQ0FBQyxDQUFDO0lBQ2xCO0lBQ0EsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLElBQUksRUFBRTtNQUMxQixPQUFPRixNQUFNLENBQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRUgsT0FBTyxDQUFDO0lBQ3BDO0lBQ0EsT0FBT0MsTUFBTTtFQUNkO0VBQUM7RUFBQTtFQUFBO0VBQUE7RUFBQTtFQUFBO0VBQUE7RUFBQTtFQUFBLElBL2dCS0csb0JBQW9CO0lBQUE7SUFBQTtNQUFBO0lBQUE7SUFBQTtJQUFBLE9BVXpCQyxJQUFJLEdBQUosZ0JBQU87TUFBQSxhQTJGRyxJQUFJO01BQUE7TUExRmIsSUFBTUMsb0JBQW9CLEdBQUcsRUFBRTtNQUMvQixJQUFNQyxRQUFRLEdBQUcsSUFBSSxDQUFDQyxVQUFVLEVBQUU7TUFDbEMsSUFBTUMsVUFBVSxHQUFHRixRQUFRLENBQUNHLFdBQVc7TUFDdkMsSUFBTUMsYUFBYSxHQUFHQyxTQUFTLENBQUNDLG9CQUFvQixDQUFDSixVQUFVLENBQWlCO01BQ2hGLElBQU1LLFVBQVUsR0FBR0gsYUFBYSxDQUFDSSxZQUFZLEVBQUU7TUFDL0MsSUFBTUMsU0FBUyxhQUFNTCxhQUFhLENBQUNNLFdBQVcsRUFBRSxDQUFDQyxnQkFBZ0IsRUFBRSxlQUFLUCxhQUFhLENBQUNRLFVBQVUsQ0FBQ1YsVUFBVSxD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