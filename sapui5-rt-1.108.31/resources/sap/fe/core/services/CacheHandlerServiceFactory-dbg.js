/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/strings/hash", "sap/ui/core/cache/CacheManager", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory"], function (hash, CacheManager, Service, ServiceFactory) {
  "use strict";

  var _exports = {};
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
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function getMetadataETag(sUrl, sETag, mUpdatedMetaModelETags) {
    return new Promise(function (resolve) {
      // There is an Url in the FE cache, that's not in the MetaModel yet -> we need to check the ETag
      jQuery.ajax(sUrl, {
        method: "GET"
      }).done(function (oResponse, sTextStatus, jqXHR) {
        // ETag is not the same -> invalid
        // ETag is the same -> valid
        // If ETag is available use it, otherwise use Last-Modified
        mUpdatedMetaModelETags[sUrl] = jqXHR.getResponseHeader("ETag") || jqXHR.getResponseHeader("Last-Modified");
        resolve(sETag === mUpdatedMetaModelETags[sUrl]);
      }).fail(function () {
        // Case 2z - Make sure we update the map so that we invalidate the cache
        mUpdatedMetaModelETags[sUrl] = "";
        resolve(false);
      });
    });
  }
  var CacheHandlerService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(CacheHandlerService, _Service);
    function CacheHandlerService() {
      return _Service.apply(this, arguments) || this;
    }
    _exports.CacheHandlerService = CacheHandlerService;
    var _proto = CacheHandlerService.prototype;
    _proto.init = function init() {
      var _this = this;
      var oContext = this.getContext();
      this.oFactory = oContext.factory;
      var mSettings = oContext.settings;
      if (!mSettings.metaModel) {
        throw new Error("a `metaModel` property is expected when instantiating the CacheHandlerService");
      }
      this.oMetaModel = mSettings.metaModel;
      this.oAppComponent = mSettings.appComponent;
      this.oComponent = mSettings.component;
      this.initPromise = this.oMetaModel.fetchEntityContainer().then(function () {
        return _this;
      });
      this.mCacheNeedsInvalidate = {};
    };
    _proto.exit = function exit() {
      // Deregister global instance
      this.oFactory.removeGlobalInstance(this.oMetaModel);
    };
    _proto.validateCacheKey = function validateCacheKey(sCacheIdentifier, oComponent) {
      try {
        var _this3 = this;
        function _temp4() {
          _this3.mCacheNeedsInvalidate[sCacheIdentifier] = bCacheNeedUpdate;
          return sCacheKey;
        }
        // Keep track if the cache will anyway need to be updated
        var bCacheNeedUpdate = true;
        var sCacheKey;
        var _temp5 = _catch(function () {
          return Promise.resolve(CacheManager.get(sCacheIdentifier)).then(function (mCacheOutput) {
            // We provide a default key so that an xml view cache is written
            var mMetaModelETags = _this3.getETags(oComponent);
            sCacheKey = JSON.stringify(mMetaModelETags);
            // Case #1a - No cache, so mCacheOuput is empty, cacheKey = current metamodel ETags
            var _temp = function () {
              if (mCacheOutput) {
                // Case #2 - Cache entry found, check if it's still valid
                var mUpdatedMetaModelETags = {};
                var mCachedETags = JSON.parse(mCacheOutput.cachedETags);
                return Promise.resolve(Promise.all(Object.keys(mCachedETags).map(function (sUrl) {
                  // Check validity of every single Url that's in the FE Cache object
                  if (mCachedETags[sUrl]) {
                    if (mMetaModelETags[sUrl]) {
                      // Case #2a - Same number of ETags in the cache and in the metadata
                      mUpdatedMetaModelETags[sUrl] = mMetaModelETags[sUrl];
                      return mCachedETags[sUrl] === mMetaModelETags[sUrl];
                    } else {
                      // Case #2b - No ETag in the cache for that URL, cachedETags was enhanced
                      return getMetadataETag(sUrl, mCachedETags[sUrl], mUpdatedMetaModelETags);
                    }
                  } else {
                    // Case #2z - Last Templating added an URL without ETag
                    mUpdatedMetaModelETags[sUrl] = mMetaModelETags[sUrl];
                    return mCachedETags[sUrl] === mMetaModelETags[sUrl];
                  }
                }))).then(function (aValidETags) {
                  bCacheNeedUpdate = aValidETags.indexOf(false) >= 0;
                  // Case #2a - Same number of ETags and all valid -> we return the viewCacheKey
                  // Case #2b - Different number of ETags and still all valid -> we return the viewCacheKey
                  // Case #2c - Same number of ETags but different values, main service Etag has changed, use that as cache key
                  // Case #2d - Different number of ETags but different value, main service Etag or linked service Etag has changed, new ETags should be used as cacheKey
                  // Case #2z - Cache has an invalid Etag - if there is an Etag provided from MetaModel use it as cacheKey
                  if (Object.keys(mUpdatedMetaModelETags).some(function (sUrl) {
                    return !mUpdatedMetaModelETags[sUrl];
                  })) {
                    // At least one of the MetaModel URLs doesn't provide an ETag, so no caching
                    sCacheKey = null;
                  } else {
                    sCacheKey = bCacheNeedUpdate ? JSON.stringify(mUpdatedMetaModelETags) : mCacheOutput.viewCacheKey;
                  }
                });
              } else if (Object.keys(mMetaModelETags).some(function (sUrl) {
                return !mMetaModelETags[sUrl];
              })) {
                // Check if cache can be used (all the metadata and annotations have to provide at least a ETag or a Last-Modified header)
                // Case #1-b - No Cache, mCacheOuput is empty, but metamodel etags cannot be used, so no caching
                bCacheNeedUpdate = true;
                sCacheKey = null;
              }
            }();
            if (_temp && _temp.then) return _temp.then(function () {});
          });
        }, function () {
          // Don't use view cache in case of issues with the LRU cache
          bCacheNeedUpdate = true;
          sCacheKey = null;
        });
        return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(_temp4) : _temp4(_temp5));
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto.invalidateIfNeeded = function invalidateIfNeeded(sCacheKeys, sCacheIdentifier, oComponent) {
      // Check FE cache after XML view is processed completely
      var sDataSourceETags = JSON.stringify(this.getETags(oComponent));
      if (this.mCacheNeedsInvalidate[sCacheIdentifier] || sCacheKeys && sCacheKeys !== sDataSourceETags) {
        // Something in the sources and/or its ETags changed -> update the FE cache
        var mCacheKeys = {};
        // New ETags that need to be verified, may differ from the one used to generate the view
        mCacheKeys.cachedETags = sDataSourceETags;
        // Old ETags that are used for the xml view cache as key
        mCacheKeys.viewCacheKey = sCacheKeys;
        return CacheManager.set(sCacheIdentifier, mCacheKeys);
      } else {
        return Promise.resolve();
      }
    };
    _proto.getETags = function getETags(oComponent) {
      var mMetaModelETags = this.oMetaModel.getETags();
      // ETags from UI5 are either a Date or a string, let's rationalize that
      Object.keys(mMetaModelETags).forEach(function (sMetaModelKey) {
        if (mMetaModelETags[sMetaModelKey] instanceof Date) {
          // MetaModel contains a Last-Modified timestamp for the URL
          mMetaModelETags[sMetaModelKey] = mMetaModelETags[sMetaModelKey].toISOString();
        }
      });

      // add also the manifest hash as UI5 only considers the root component hash
      var oManifestContent = this.oAppComponent.getManifest();
      var sManifestHash = hash(JSON.stringify({
        sapApp: oManifestContent["sap.app"],
        viewData: oComponent.getViewData()
      }));
      mMetaModelETags["manifest"] = sManifestHash;
      return mMetaModelETags;
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return CacheHandlerService;
  }(Service);
  _exports.CacheHandlerService = CacheHandlerService;
  var CacheHandlerServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(CacheHandlerServiceFactory, _ServiceFactory);
    function CacheHandlerServiceFactory() {
      var _this4;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this4 = _ServiceFactory.call.apply(_ServiceFactory, [this].concat(args)) || this;
      _this4._oInstanceRegistry = {};
      return _this4;
    }
    var _proto2 = CacheHandlerServiceFactory.prototype;
    _proto2.createInstance = function createInstance(oServiceContext) {
      var _this5 = this;
      var sMetaModelId = oServiceContext.settings.metaModel.getId();
      var cacheHandlerInstance = this._oInstanceRegistry[sMetaModelId];
      if (!cacheHandlerInstance) {
        this._oInstanceRegistry[sMetaModelId] = cacheHandlerInstance = new CacheHandlerService(Object.assign({
          factory: this,
          scopeObject: null,
          scopeType: "service"
        }, oServiceContext));
      }
      return cacheHandlerInstance.initPromise.then(function () {
        return _this5._oInstanceRegistry[sMetaModelId];
      }).catch(function (e) {
        // In case of error delete the global instance;
        _this5._oInstanceRegistry[sMetaModelId] = null;
        throw e;
      });
    };
    _proto2.getInstance = function getInstance(oMetaModel) {
      return this._oInstanceRegistry[oMetaModel.getId()];
    };
    _proto2.removeGlobalInstance = function removeGlobalInstance(oMetaModel) {
      this._oInstanceRegistry[oMetaModel.getId()] = null;
    };
    return CacheHandlerServiceFactory;
  }(ServiceFactory);
  return CacheHandlerServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiZ2V0TWV0YWRhdGFFVGFnIiwic1VybCIsInNFVGFnIiwibVVwZGF0ZWRNZXRhTW9kZWxFVGFncyIsIlByb21pc2UiLCJyZXNvbHZlIiwialF1ZXJ5IiwiYWpheCIsIm1ldGhvZCIsImRvbmUiLCJvUmVzcG9uc2UiLCJzVGV4dFN0YXR1cyIsImpxWEhSIiwiZ2V0UmVzcG9uc2VIZWFkZXIiLCJmYWlsIiwiQ2FjaGVIYW5kbGVyU2VydmljZSIsImluaXQiLCJvQ29udGV4dCIsImdldENvbnRleHQiLCJvRmFjdG9yeSIsImZhY3RvcnkiLCJtU2V0dGluZ3MiLCJzZXR0aW5ncyIsIm1ldGFNb2RlbCIsIkVycm9yIiwib01ldGFNb2RlbCIsIm9BcHBDb21wb25lbnQiLCJhcHBDb21wb25lbnQiLCJvQ29tcG9uZW50IiwiY29tcG9uZW50IiwiaW5pdFByb21pc2UiLCJmZXRjaEVudGl0eUNvbnRhaW5lciIsIm1DYWNoZU5lZWRzSW52YWxpZGF0ZSIsImV4aXQiLCJyZW1vdmVHbG9iYWxJbnN0YW5jZSIsInZhbGlkYXRlQ2FjaGVLZXkiLCJzQ2FjaGVJZGVudGlmaWVyIiwiYkNhY2hlTmVlZFVwZGF0ZSIsInNDYWNoZUtleSIsIkNhY2hlTWFuYWdlciIsImdldCIsIm1DYWNoZU91dHB1dCIsIm1NZXRhTW9kZWxFVGFncyIsImdldEVUYWdzIiwiSlNPTiIsInN0cmluZ2lmeSIsIm1DYWNoZWRFVGFncyIsInBhcnNlIiwiY2FjaGVkRVRhZ3MiLCJhbGwiLCJPYmplY3QiLCJrZXlzIiwibWFwIiwiYVZhbGlkRVRhZ3MiLCJpbmRleE9mIiwic29tZSIsInZpZXdDYWNoZUtleSIsImludmFsaWRhdGVJZk5lZWRlZCIsInNDYWNoZUtleXMiLCJzRGF0YVNvdXJjZUVUYWdzIiwibUNhY2hlS2V5cyIsInNldCIsImZvckVhY2giLCJzTWV0YU1vZGVsS2V5IiwiRGF0ZSIsInRvSVNPU3RyaW5nIiwib01hbmlmZXN0Q29udGVudCIsImdldE1hbmlmZXN0Iiwic01hbmlmZXN0SGFzaCIsImhhc2giLCJzYXBBcHAiLCJ2aWV3RGF0YSIsImdldFZpZXdEYXRhIiwiZ2V0SW50ZXJmYWNlIiwiU2VydmljZSIsIkNhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5IiwiX29JbnN0YW5jZVJlZ2lzdHJ5IiwiY3JlYXRlSW5zdGFuY2UiLCJvU2VydmljZUNvbnRleHQiLCJzTWV0YU1vZGVsSWQiLCJnZXRJZCIsImNhY2hlSGFuZGxlckluc3RhbmNlIiwiYXNzaWduIiwic2NvcGVPYmplY3QiLCJzY29wZVR5cGUiLCJjYXRjaCIsImdldEluc3RhbmNlIiwiU2VydmljZUZhY3RvcnkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBoYXNoIGZyb20gXCJzYXAvYmFzZS9zdHJpbmdzL2hhc2hcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ2FjaGVNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9jYWNoZS9DYWNoZU1hbmFnZXJcIjtcbmltcG9ydCBTZXJ2aWNlIGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VcIjtcbmltcG9ydCBTZXJ2aWNlRmFjdG9yeSBmcm9tIFwic2FwL3VpL2NvcmUvc2VydmljZS9TZXJ2aWNlRmFjdG9yeVwiO1xuaW1wb3J0IHR5cGUgVUlDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL1VJQ29tcG9uZW50XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IFNlcnZpY2VDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuXG5mdW5jdGlvbiBnZXRNZXRhZGF0YUVUYWcoc1VybDogYW55LCBzRVRhZzogYW55LCBtVXBkYXRlZE1ldGFNb2RlbEVUYWdzOiBhbnkpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0Ly8gVGhlcmUgaXMgYW4gVXJsIGluIHRoZSBGRSBjYWNoZSwgdGhhdCdzIG5vdCBpbiB0aGUgTWV0YU1vZGVsIHlldCAtPiB3ZSBuZWVkIHRvIGNoZWNrIHRoZSBFVGFnXG5cdFx0KGpRdWVyeSBhcyBhbnkpXG5cdFx0XHQuYWpheChzVXJsLCB7IG1ldGhvZDogXCJHRVRcIiB9KVxuXHRcdFx0LmRvbmUoZnVuY3Rpb24gKG9SZXNwb25zZTogYW55LCBzVGV4dFN0YXR1czogYW55LCBqcVhIUjogYW55KSB7XG5cdFx0XHRcdC8vIEVUYWcgaXMgbm90IHRoZSBzYW1lIC0+IGludmFsaWRcblx0XHRcdFx0Ly8gRVRhZyBpcyB0aGUgc2FtZSAtPiB2YWxpZFxuXHRcdFx0XHQvLyBJZiBFVGFnIGlzIGF2YWlsYWJsZSB1c2UgaXQsIG90aGVyd2lzZSB1c2UgTGFzdC1Nb2RpZmllZFxuXHRcdFx0XHRtVXBkYXRlZE1ldGFNb2RlbEVUYWdzW3NVcmxdID0ganFYSFIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJFVGFnXCIpIHx8IGpxWEhSLmdldFJlc3BvbnNlSGVhZGVyKFwiTGFzdC1Nb2RpZmllZFwiKTtcblx0XHRcdFx0cmVzb2x2ZShzRVRhZyA9PT0gbVVwZGF0ZWRNZXRhTW9kZWxFVGFnc1tzVXJsXSk7XG5cdFx0XHR9KVxuXHRcdFx0LmZhaWwoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHQvLyBDYXNlIDJ6IC0gTWFrZSBzdXJlIHdlIHVwZGF0ZSB0aGUgbWFwIHNvIHRoYXQgd2UgaW52YWxpZGF0ZSB0aGUgY2FjaGVcblx0XHRcdFx0bVVwZGF0ZWRNZXRhTW9kZWxFVGFnc1tzVXJsXSA9IFwiXCI7XG5cdFx0XHRcdHJlc29sdmUoZmFsc2UpO1xuXHRcdFx0fSk7XG5cdH0pO1xufVxudHlwZSBDYWNoZUhhbmRsZXJTZXJ2aWNlU2V0dGluZ3MgPSB7XG5cdG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWw7XG59O1xuXG5leHBvcnQgY2xhc3MgQ2FjaGVIYW5kbGVyU2VydmljZSBleHRlbmRzIFNlcnZpY2U8Q2FjaGVIYW5kbGVyU2VydmljZVNldHRpbmdzPiB7XG5cdHJlc29sdmVGbjogYW55O1xuXHRyZWplY3RGbjogYW55O1xuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8YW55PjtcblxuXHRvRmFjdG9yeSE6IENhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5O1xuXHRvTWV0YU1vZGVsITogT0RhdGFNZXRhTW9kZWw7XG5cdG9BcHBDb21wb25lbnQhOiBBcHBDb21wb25lbnQ7XG5cdG9Db21wb25lbnQhOiBVSUNvbXBvbmVudDtcblx0bUNhY2hlTmVlZHNJbnZhbGlkYXRlOiBhbnk7XG5cblx0aW5pdCgpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpO1xuXHRcdHRoaXMub0ZhY3RvcnkgPSBvQ29udGV4dC5mYWN0b3J5O1xuXHRcdGNvbnN0IG1TZXR0aW5ncyA9IG9Db250ZXh0LnNldHRpbmdzO1xuXHRcdGlmICghbVNldHRpbmdzLm1ldGFNb2RlbCkge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiYSBgbWV0YU1vZGVsYCBwcm9wZXJ0eSBpcyBleHBlY3RlZCB3aGVuIGluc3RhbnRpYXRpbmcgdGhlIENhY2hlSGFuZGxlclNlcnZpY2VcIik7XG5cdFx0fVxuXHRcdHRoaXMub01ldGFNb2RlbCA9IG1TZXR0aW5ncy5tZXRhTW9kZWw7XG5cdFx0dGhpcy5vQXBwQ29tcG9uZW50ID0gbVNldHRpbmdzLmFwcENvbXBvbmVudDtcblx0XHR0aGlzLm9Db21wb25lbnQgPSBtU2V0dGluZ3MuY29tcG9uZW50O1xuXHRcdHRoaXMuaW5pdFByb21pc2UgPSAodGhpcy5vTWV0YU1vZGVsIGFzIGFueSkuZmV0Y2hFbnRpdHlDb250YWluZXIoKS50aGVuKCgpID0+IHtcblx0XHRcdHJldHVybiB0aGlzO1xuXHRcdH0pO1xuXHRcdHRoaXMubUNhY2hlTmVlZHNJbnZhbGlkYXRlID0ge307XG5cdH1cblx0ZXhpdCgpIHtcblx0XHQvLyBEZXJlZ2lzdGVyIGdsb2JhbCBpbnN0YW5jZVxuXHRcdHRoaXMub0ZhY3RvcnkucmVtb3ZlR2xvYmFsSW5zdGFuY2UodGhpcy5vTWV0YU1vZGVsKTtcblx0fVxuXHRhc3luYyB2YWxpZGF0ZUNhY2hlS2V5KHNDYWNoZUlkZW50aWZpZXI6IGFueSwgb0NvbXBvbmVudDogYW55KTogUHJvbWlzZTxzdHJpbmcgfCBudWxsPiB7XG5cdFx0Ly8gS2VlcCB0cmFjayBpZiB0aGUgY2FjaGUgd2lsbCBhbnl3YXkgbmVlZCB0byBiZSB1cGRhdGVkXG5cdFx0bGV0IGJDYWNoZU5lZWRVcGRhdGUgPSB0cnVlO1xuXHRcdGxldCBzQ2FjaGVLZXk6IHN0cmluZyB8IG51bGw7XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgbUNhY2hlT3V0cHV0ID0gYXdhaXQgQ2FjaGVNYW5hZ2VyLmdldChzQ2FjaGVJZGVudGlmaWVyKTtcblx0XHRcdC8vIFdlIHByb3ZpZGUgYSBkZWZhdWx0IGtleSBzbyB0aGF0IGFuIHhtbCB2aWV3IGNhY2hlIGlzIHdyaXR0ZW5cblx0XHRcdGNvbnN0IG1NZXRhTW9kZWxFVGFncyA9IHRoaXMuZ2V0RVRhZ3Mob0NvbXBvbmVudCk7XG5cdFx0XHRzQ2FjaGVLZXkgPSBKU09OLnN0cmluZ2lmeShtTWV0YU1vZGVsRVRhZ3MpO1xuXHRcdFx0Ly8gQ2FzZSAjMWEgLSBObyBjYWNoZSwgc28gbUNhY2hlT3VwdXQgaXMgZW1wdHksIGNhY2hlS2V5ID0gY3VycmVudCBtZXRhbW9kZWwgRVRhZ3Ncblx0XHRcdGlmIChtQ2FjaGVPdXRwdXQpIHtcblx0XHRcdFx0Ly8gQ2FzZSAjMiAtIENhY2hlIGVudHJ5IGZvdW5kLCBjaGVjayBpZiBpdCdzIHN0aWxsIHZhbGlkXG5cdFx0XHRcdGNvbnN0IG1VcGRhdGVkTWV0YU1vZGVsRVRhZ3M6IGFueSA9IHt9O1xuXHRcdFx0XHRjb25zdCBtQ2FjaGVkRVRhZ3MgPSBKU09OLnBhcnNlKG1DYWNoZU91dHB1dC5jYWNoZWRFVGFncyk7XG5cdFx0XHRcdGNvbnN0IGFWYWxpZEVUYWdzID0gYXdhaXQgUHJvbWlzZS5hbGwoXG5cdFx0XHRcdFx0T2JqZWN0LmtleXMobUNhY2hlZEVUYWdzKS5tYXAoZnVuY3Rpb24gKHNVcmw6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0Ly8gQ2hlY2sgdmFsaWRpdHkgb2YgZXZlcnkgc2luZ2xlIFVybCB0aGF0J3MgaW4gdGhlIEZFIENhY2hlIG9iamVjdFxuXHRcdFx0XHRcdFx0aWYgKG1DYWNoZWRFVGFnc1tzVXJsXSkge1xuXHRcdFx0XHRcdFx0XHRpZiAobU1ldGFNb2RlbEVUYWdzW3NVcmxdKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gQ2FzZSAjMmEgLSBTYW1lIG51bWJlciBvZiBFVGFncyBpbiB0aGUgY2FjaGUgYW5kIGluIHRoZSBtZXRhZGF0YVxuXHRcdFx0XHRcdFx0XHRcdG1VcGRhdGVkTWV0YU1vZGVsRVRhZ3Nbc1VybF0gPSBtTWV0YU1vZGVsRVRhZ3Nbc1VybF07XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG1DYWNoZWRFVGFnc1tzVXJsXSA9PT0gbU1ldGFNb2RlbEVUYWdzW3NVcmxdO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdC8vIENhc2UgIzJiIC0gTm8gRVRhZyBpbiB0aGUgY2FjaGUgZm9yIHRoYXQgVVJMLCBjYWNoZWRFVGFncyB3YXMgZW5oYW5jZWRcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gZ2V0TWV0YWRhdGFFVGFnKHNVcmwsIG1DYWNoZWRFVGFnc1tzVXJsXSwgbVVwZGF0ZWRNZXRhTW9kZWxFVGFncyk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIENhc2UgIzJ6IC0gTGFzdCBUZW1wbGF0aW5nIGFkZGVkIGFuIFVSTCB3aXRob3V0IEVUYWdcblx0XHRcdFx0XHRcdFx0bVVwZGF0ZWRNZXRhTW9kZWxFVGFnc1tzVXJsXSA9IG1NZXRhTW9kZWxFVGFnc1tzVXJsXTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIG1DYWNoZWRFVGFnc1tzVXJsXSA9PT0gbU1ldGFNb2RlbEVUYWdzW3NVcmxdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCk7XG5cblx0XHRcdFx0YkNhY2hlTmVlZFVwZGF0ZSA9IGFWYWxpZEVUYWdzLmluZGV4T2YoZmFsc2UpID49IDA7XG5cdFx0XHRcdC8vIENhc2UgIzJhIC0gU2FtZSBudW1iZXIgb2YgRVRhZ3MgYW5kIGFsbCB2YWxpZCAtPiB3ZSByZXR1cm4gdGhlIHZpZXdDYWNoZUtleVxuXHRcdFx0XHQvLyBDYXNlICMyYiAtIERpZmZlcmVudCBudW1iZXIgb2YgRVRhZ3MgYW5kIHN0aWxsIGFsbCB2YWxpZCAtPiB3ZSByZXR1cm4gdGhlIHZpZXdDYWNoZUtleVxuXHRcdFx0XHQvLyBDYXNlICMyYyAtIFNhbWUgbnVtYmVyIG9mIEVUYWdzIGJ1dCBkaWZmZXJlbnQgdmFsdWVzLCBtYWluIHNlcnZpY2UgRXRhZyBoYXMgY2hhbmdlZCwgdXNlIHRoYXQgYXMgY2FjaGUga2V5XG5cdFx0XHRcdC8vIENhc2UgIzJkIC0gRGlmZmVyZW50IG51bWJlciBvZiBFVGFncyBidXQgZGlmZmVyZW50IHZhbHVlLCBtYWluIHNlcnZpY2UgRXRhZyBvciBsaW5rZWQgc2VydmljZSBFdGFnIGhhcyBjaGFuZ2VkLCBuZXcgRVRhZ3Mgc2hvdWxkIGJlIHVzZWQgYXMgY2FjaGVLZXlcblx0XHRcdFx0Ly8gQ2FzZSAjMnogLSBDYWNoZSBoYXMgYW4gaW52YWxpZCBFdGFnIC0gaWYgdGhlcmUgaXMgYW4gRXRhZyBwcm92aWRlZCBmcm9tIE1ldGFNb2RlbCB1c2UgaXQgYXMgY2FjaGVLZXlcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdE9iamVjdC5rZXlzKG1VcGRhdGVkTWV0YU1vZGVsRVRhZ3MpLnNvbWUoZnVuY3Rpb24gKHNVcmw6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0cmV0dXJuICFtVXBkYXRlZE1ldGFNb2RlbEVUYWdzW3NVcmxdO1xuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdC8vIEF0IGxlYXN0IG9uZSBvZiB0aGUgTWV0YU1vZGVsIFVSTHMgZG9lc24ndCBwcm92aWRlIGFuIEVUYWcsIHNvIG5vIGNhY2hpbmdcblx0XHRcdFx0XHRzQ2FjaGVLZXkgPSBudWxsO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNDYWNoZUtleSA9IGJDYWNoZU5lZWRVcGRhdGUgPyBKU09OLnN0cmluZ2lmeShtVXBkYXRlZE1ldGFNb2RlbEVUYWdzKSA6IG1DYWNoZU91dHB1dC52aWV3Q2FjaGVLZXk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdE9iamVjdC5rZXlzKG1NZXRhTW9kZWxFVGFncykuc29tZShmdW5jdGlvbiAoc1VybDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0cmV0dXJuICFtTWV0YU1vZGVsRVRhZ3Nbc1VybF07XG5cdFx0XHRcdH0pXG5cdFx0XHQpIHtcblx0XHRcdFx0Ly8gQ2hlY2sgaWYgY2FjaGUgY2FuIGJlIHVzZWQgKGFsbCB0aGUgbWV0YWRhdGEgYW5kIGFubm90YXRpb25zIGhhdmUgdG8gcHJvdmlkZSBhdCBsZWFzdCBhIEVUYWcgb3IgYSBMYXN0LU1vZGlmaWVkIGhlYWRlcilcblx0XHRcdFx0Ly8gQ2FzZSAjMS1iIC0gTm8gQ2FjaGUsIG1DYWNoZU91cHV0IGlzIGVtcHR5LCBidXQgbWV0YW1vZGVsIGV0YWdzIGNhbm5vdCBiZSB1c2VkLCBzbyBubyBjYWNoaW5nXG5cdFx0XHRcdGJDYWNoZU5lZWRVcGRhdGUgPSB0cnVlO1xuXHRcdFx0XHRzQ2FjaGVLZXkgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdC8vIERvbid0IHVzZSB2aWV3IGNhY2hlIGluIGNhc2Ugb2YgaXNzdWVzIHdpdGggdGhlIExSVSBjYWNoZVxuXHRcdFx0YkNhY2hlTmVlZFVwZGF0ZSA9IHRydWU7XG5cdFx0XHRzQ2FjaGVLZXkgPSBudWxsO1xuXHRcdH1cblxuXHRcdHRoaXMubUNhY2hlTmVlZHNJbnZhbGlkYXRlW3NDYWNoZUlkZW50aWZpZXJdID0gYkNhY2hlTmVlZFVwZGF0ZTtcblx0XHRyZXR1cm4gc0NhY2hlS2V5O1xuXHR9XG5cdGludmFsaWRhdGVJZk5lZWRlZChzQ2FjaGVLZXlzOiBzdHJpbmcsIHNDYWNoZUlkZW50aWZpZXI6IHN0cmluZywgb0NvbXBvbmVudDogYW55KSB7XG5cdFx0Ly8gQ2hlY2sgRkUgY2FjaGUgYWZ0ZXIgWE1MIHZpZXcgaXMgcHJvY2Vzc2VkIGNvbXBsZXRlbHlcblx0XHRjb25zdCBzRGF0YVNvdXJjZUVUYWdzID0gSlNPTi5zdHJpbmdpZnkodGhpcy5nZXRFVGFncyhvQ29tcG9uZW50KSk7XG5cdFx0aWYgKHRoaXMubUNhY2hlTmVlZHNJbnZhbGlkYXRlW3NDYWNoZUlkZW50aWZpZXJdIHx8IChzQ2FjaGVLZXlzICYmIHNDYWNoZUtleXMgIT09IHNEYXRhU291cmNlRVRhZ3MpKSB7XG5cdFx0XHQvLyBTb21ldGhpbmcgaW4gdGhlIHNvdXJjZXMgYW5kL29yIGl0cyBFVGFncyBjaGFuZ2VkIC0+IHVwZGF0ZSB0aGUgRkUgY2FjaGVcblx0XHRcdGNvbnN0IG1DYWNoZUtleXM6IGFueSA9IHt9O1xuXHRcdFx0Ly8gTmV3IEVUYWdzIHRoYXQgbmVlZCB0byBiZSB2ZXJpZmllZCwgbWF5IGRpZmZlciBmcm9tIHRoZSBvbmUgdXNlZCB0byBnZW5lcmF0ZSB0aGUgdmlld1xuXHRcdFx0bUNhY2hlS2V5cy5jYWNoZWRFVGFncyA9IHNEYXRhU291cmNlRVRhZ3M7XG5cdFx0XHQvLyBPbGQgRVRhZ3MgdGhhdCBhcmUgdXNlZCBmb3IgdGhlIHhtbCB2aWV3IGNhY2hlIGFzIGtleVxuXHRcdFx0bUNhY2hlS2V5cy52aWV3Q2FjaGVLZXkgPSBzQ2FjaGVLZXlzO1xuXHRcdFx0cmV0dXJuIENhY2hlTWFuYWdlci5zZXQoc0NhY2hlSWRlbnRpZmllciwgbUNhY2hlS2V5cyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9XG5cdH1cblx0Z2V0RVRhZ3Mob0NvbXBvbmVudDogYW55KSB7XG5cdFx0Y29uc3QgbU1ldGFNb2RlbEVUYWdzID0gKHRoaXMub01ldGFNb2RlbCBhcyBhbnkpLmdldEVUYWdzKCk7XG5cdFx0Ly8gRVRhZ3MgZnJvbSBVSTUgYXJlIGVpdGhlciBhIERhdGUgb3IgYSBzdHJpbmcsIGxldCdzIHJhdGlvbmFsaXplIHRoYXRcblx0XHRPYmplY3Qua2V5cyhtTWV0YU1vZGVsRVRhZ3MpLmZvckVhY2goZnVuY3Rpb24gKHNNZXRhTW9kZWxLZXk6IHN0cmluZykge1xuXHRcdFx0aWYgKG1NZXRhTW9kZWxFVGFnc1tzTWV0YU1vZGVsS2V5XSBpbnN0YW5jZW9mIERhdGUpIHtcblx0XHRcdFx0Ly8gTWV0YU1vZGVsIGNvbnRhaW5zIGEgTGFzdC1Nb2RpZmllZCB0aW1lc3RhbXAgZm9yIHRoZSBVUkxcblx0XHRcdFx0bU1ldGFNb2RlbEVUYWdzW3NNZXRhTW9kZWxLZXldID0gbU1ldGFNb2RlbEVUYWdzW3NNZXRhTW9kZWxLZXldLnRvSVNPU3RyaW5nKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBhZGQgYWxzbyB0aGUgbWFuaWZlc3QgaGFzaCBhcyBVSTUgb25seSBjb25zaWRlcnMgdGhlIHJvb3QgY29tcG9uZW50IGhhc2hcblx0XHRjb25zdCBvTWFuaWZlc3RDb250ZW50OiBhbnkgPSB0aGlzLm9BcHBDb21wb25lbnQuZ2V0TWFuaWZlc3QoKTtcblx0XHRjb25zdCBzTWFuaWZlc3RIYXNoID0gaGFzaChcblx0XHRcdEpTT04uc3RyaW5naWZ5KHtcblx0XHRcdFx0c2FwQXBwOiBvTWFuaWZlc3RDb250ZW50W1wic2FwLmFwcFwiXSxcblx0XHRcdFx0dmlld0RhdGE6IG9Db21wb25lbnQuZ2V0Vmlld0RhdGEoKVxuXHRcdFx0fSlcblx0XHQpO1xuXHRcdG1NZXRhTW9kZWxFVGFnc1tcIm1hbmlmZXN0XCJdID0gc01hbmlmZXN0SGFzaDtcblx0XHRyZXR1cm4gbU1ldGFNb2RlbEVUYWdzO1xuXHR9XG5cdGdldEludGVyZmFjZSgpOiBhbnkge1xuXHRcdHJldHVybiB0aGlzO1xuXHR9XG59XG5cbmNsYXNzIENhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8Q2FjaGVIYW5kbGVyU2VydmljZVNldHRpbmdzPiB7XG5cdF9vSW5zdGFuY2VSZWdpc3RyeTogUmVjb3JkPHN0cmluZywgQ2FjaGVIYW5kbGVyU2VydmljZSB8IG51bGw+ID0ge307XG5cdGNyZWF0ZUluc3RhbmNlKG9TZXJ2aWNlQ29udGV4dDogU2VydmljZUNvbnRleHQ8Q2FjaGVIYW5kbGVyU2VydmljZVNldHRpbmdzPikge1xuXHRcdGNvbnN0IHNNZXRhTW9kZWxJZCA9IG9TZXJ2aWNlQ29udGV4dC5zZXR0aW5ncy5tZXRhTW9kZWwuZ2V0SWQoKTtcblx0XHRsZXQgY2FjaGVIYW5kbGVySW5zdGFuY2UgPSB0aGlzLl9vSW5zdGFuY2VSZWdpc3RyeVtzTWV0YU1vZGVsSWRdO1xuXHRcdGlmICghY2FjaGVIYW5kbGVySW5zdGFuY2UpIHtcblx0XHRcdHRoaXMuX29JbnN0YW5jZVJlZ2lzdHJ5W3NNZXRhTW9kZWxJZF0gPSBjYWNoZUhhbmRsZXJJbnN0YW5jZSA9IG5ldyBDYWNoZUhhbmRsZXJTZXJ2aWNlKFxuXHRcdFx0XHRPYmplY3QuYXNzaWduKFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGZhY3Rvcnk6IHRoaXMsXG5cdFx0XHRcdFx0XHRzY29wZU9iamVjdDogbnVsbCxcblx0XHRcdFx0XHRcdHNjb3BlVHlwZTogXCJzZXJ2aWNlXCJcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG9TZXJ2aWNlQ29udGV4dFxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiBjYWNoZUhhbmRsZXJJbnN0YW5jZS5pbml0UHJvbWlzZVxuXHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gdGhpcy5fb0luc3RhbmNlUmVnaXN0cnlbc01ldGFNb2RlbElkXSBhcyBDYWNoZUhhbmRsZXJTZXJ2aWNlO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCgoZTogYW55KSA9PiB7XG5cdFx0XHRcdC8vIEluIGNhc2Ugb2YgZXJyb3IgZGVsZXRlIHRoZSBnbG9iYWwgaW5zdGFuY2U7XG5cdFx0XHRcdHRoaXMuX29JbnN0YW5jZVJlZ2lzdHJ5W3NNZXRhTW9kZWxJZF0gPSBudWxsO1xuXHRcdFx0XHR0aHJvdyBlO1xuXHRcdFx0fSk7XG5cdH1cblx0Z2V0SW5zdGFuY2Uob01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0XHRyZXR1cm4gdGhpcy5fb0luc3RhbmNlUmVnaXN0cnlbb01ldGFNb2RlbC5nZXRJZCgpXTtcblx0fVxuXHRyZW1vdmVHbG9iYWxJbnN0YW5jZShvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCkge1xuXHRcdHRoaXMuX29JbnN0YW5jZVJlZ2lzdHJ5W29NZXRhTW9kZWwuZ2V0SWQoKV0gPSBudWxsO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENhY2hlSGFuZGxlclNlcnZpY2VGYWN0b3J5O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQWtqQk8sZ0JBQWdCQSxJQUFJLEVBQUVDLE9BQU8sRUFBRTtJQUNyQyxJQUFJO01BQ0gsSUFBSUMsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU1HLENBQUMsRUFBRTtNQUNWLE9BQU9GLE9BQU8sQ0FBQ0UsQ0FBQyxDQUFDO0lBQ2xCO0lBQ0EsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLElBQUksRUFBRTtNQUMxQixPQUFPRixNQUFNLENBQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRUgsT0FBTyxDQUFDO0lBQ3BDO0lBQ0EsT0FBT0MsTUFBTTtFQUNkO0VBQUM7RUFBQTtFQW5qQkQsU0FBU0csZUFBZSxDQUFDQyxJQUFTLEVBQUVDLEtBQVUsRUFBRUMsc0JBQTJCLEVBQUU7SUFD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