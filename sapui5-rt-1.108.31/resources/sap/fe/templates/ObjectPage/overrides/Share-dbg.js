/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticKeyHelper", "sap/ui/core/routing/HashChanger", "sap/ui/model/Filter", "sap/ui/model/FilterOperator"], function (Log, ModelHelper, SemanticKeyHelper, HashChanger, Filter, FilterOperator) {
  "use strict";

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
  var bGlobalIsStickySupported;
  function createFilterToFetchActiveContext(mKeyValues, bIsActiveEntityDefined) {
    var aKeys = Object.keys(mKeyValues);
    var aFilters = aKeys.map(function (sKey) {
      var sValue = mKeyValues[sKey];
      if (sValue !== undefined) {
        return new Filter(sKey, FilterOperator.EQ, sValue);
      }
    });
    if (bIsActiveEntityDefined) {
      var oActiveFilter = new Filter({
        filters: [new Filter("SiblingEntity/IsActiveEntity", FilterOperator.EQ, true)],
        and: false
      });
      aFilters.push(oActiveFilter);
    }
    return new Filter(aFilters, true);
  }
  function getActiveContextPath(oController, sPageEntityName, oFilter) {
    var oListBinding = oController.getView().getBindingContext().getModel().bindList("/".concat(sPageEntityName), undefined, undefined, oFilter, {
      "$$groupId": "$auto.Heroes"
    });
    return oListBinding.requestContexts(0, 2).then(function (oContexts) {
      if (oContexts && oContexts.length) {
        return oContexts[0].getPath();
      }
    });
  }
  function getActiveContextInstances(oContext, oController, oEntitySet) {
    var aActiveContextpromises = [];
    var aPages = [];
    var sMetaPath = oContext.getModel().getMetaModel().getMetaPath(oContext.getPath());
    if (sMetaPath.indexOf("/") === 0) {
      sMetaPath = sMetaPath.substring(1);
    }
    var aMetaPathArray = sMetaPath.split("/");
    var sCurrentHashNoParams = HashChanger.getInstance().getHash().split("?")[0];
    var aCurrentHashArray = sCurrentHashNoParams.split("/");

    // oPageMap - creating an object that contains map of metapath name and it's technical details
    // which is required to create a filter to fetch the relavant/correct active context
    // Example: {SalesOrderManage:{technicalID:technicalIDValue}, _Item:{technicalID:technicalIDValue}} etc.,
    var oPageMap = {};
    var aPageHashArray = [];
    aCurrentHashArray.forEach(function (sPageHash) {
      var aKeyValues = sPageHash.substring(sPageHash.indexOf("(") + 1, sPageHash.length - 1).split(",");
      var mKeyValues = {};
      var sPageHashName = sPageHash.split("(")[0];
      oPageMap[sPageHashName] = {};
      aPageHashArray.push(sPageHashName);
      oPageMap[sPageHashName]["bIsActiveEntityDefined"] = true;
      for (var i = 0; i < aKeyValues.length; i++) {
        var sKeyAssignment = aKeyValues[i];
        var aParts = sKeyAssignment.split("=");
        var sKeyValue = aParts[1];
        var sKey = aParts[0];
        // In case if only one technical key is defined then the url just contains the technicalIDValue but not the technicalID
        // Example: SalesOrderManage(ID=11111129-aaaa-bbbb-cccc-ddddeeeeffff,IsActiveEntity=false)/_Item(11111129-aaaa-bbbb-cccc-ddddeeeeffff)
        // In above example SalesOrderItem has only one technical key defined, hence technicalID info is not present in the url
        // Hence in such cases we get technical key and use them to fetch active context
        if (sKeyAssignment.indexOf("=") === -1) {
          var oMetaModel = oContext.getModel().getMetaModel();
          var aTechnicalKeys = oMetaModel.getObject("/".concat(aPageHashArray.join("/"), "/$Type/$Key"));
          sKeyValue = aParts[0];
          sKey = aTechnicalKeys[0];
          oPageMap[sPageHash.split("(")[0]]["bIsActiveEntityDefined"] = false;
        }
        if (sKey !== "IsActiveEntity") {
          if (sKeyValue.indexOf("'") === 0 && sKeyValue.lastIndexOf("'") === sKeyValue.length - 1) {
            // Remove the quotes from the value and decode special chars
            sKeyValue = decodeURIComponent(sKeyValue.substring(1, sKeyValue.length - 1));
          }
          mKeyValues[sKey] = sKeyValue;
        }
      }
      oPageMap[sPageHashName].mKeyValues = mKeyValues;
    });
    var oPageEntitySet = oEntitySet;
    aMetaPathArray.forEach(function (sNavigationPath) {
      var oPageInfo = {};
      var sPageEntitySetName = oPageEntitySet.$NavigationPropertyBinding && oPageEntitySet.$NavigationPropertyBinding[sNavigationPath];
      if (sPageEntitySetName) {
        oPageInfo.pageEntityName = oPageEntitySet.$NavigationPropertyBinding[sNavigationPath];
        oPageEntitySet = oContext.getModel().getMetaModel().getObject("/".concat(sPageEntitySetName)) || oEntitySet;
      } else {
        oPageInfo.pageEntityName = sNavigationPath;
      }
      oPageInfo.mKeyValues = oPageMap[sNavigationPath].mKeyValues;
      oPageInfo.bIsActiveEntityDefined = oPageMap[sNavigationPath].bIsActiveEntityDefined;
      aPages.push(oPageInfo);
    });
    aPages.forEach(function (oPageInfo) {
      var oFilter = createFilterToFetchActiveContext(oPageInfo.mKeyValues, oPageInfo.bIsActiveEntityDefined);
      aActiveContextpromises.push(getActiveContextPath(oController, oPageInfo.pageEntityName, oFilter));
    });
    return aActiveContextpromises;
  }

  /**
   * Method to fetch active context path's.
   *
   * @param oContext The Page Context
   * @param oController
   * @returns Promise which is resolved once the active context's are fetched
   */
  function getActiveContextPaths(oContext, oController) {
    var sCurrentHashNoParams = HashChanger.getInstance().getHash().split("?")[0];
    var sRootEntityName = sCurrentHashNoParams && sCurrentHashNoParams.substr(0, sCurrentHashNoParams.indexOf("("));
    if (sRootEntityName.indexOf("/") === 0) {
      sRootEntityName = sRootEntityName.substring(1);
    }
    var oEntitySet = oContext.getModel().getMetaModel().getObject("/".concat(sRootEntityName));
    var oPageContext = oContext;
    var aActiveContextpromises = getActiveContextInstances(oContext, oController, oEntitySet);
    if (aActiveContextpromises.length > 0) {
      return Promise.all(aActiveContextpromises).then(function (aData) {
        var aActiveContextPaths = [];
        var oPageEntitySet = oEntitySet;
        if (aData[0].indexOf("/") === 0) {
          aActiveContextPaths.push(aData[0].substring(1));
        } else {
          aActiveContextPaths.push(aData[0]);
        }
        // In the active context paths identify and replace the entitySet Name with corresponding navigation property name
        // Required to form the url pointing to active context
        // Example : SalesOrderItem --> _Item, MaterialDetails --> _MaterialDetails etc.,
        for (var i = 1; i < aData.length; i++) {
          var sActiveContextPath = aData[i];
          var sNavigatioProperty = "";
          var sEntitySetName = sActiveContextPath && sActiveContextPath.substr(0, sActiveContextPath.indexOf("("));
          if (sEntitySetName.indexOf("/") === 0) {
            sEntitySetName = sEntitySetName.substring(1);
          }
          if (sActiveContextPath.indexOf("/") === 0) {
            sActiveContextPath = sActiveContextPath.substring(1);
          }
          sNavigatioProperty = Object.keys(oPageEntitySet.$NavigationPropertyBinding)[Object.values(oPageEntitySet.$NavigationPropertyBinding).indexOf(sEntitySetName)];
          if (sNavigatioProperty) {
            aActiveContextPaths.push(sActiveContextPath.replace(sEntitySetName, sNavigatioProperty));
            oPageEntitySet = oPageContext.getModel().getMetaModel().getObject("/".concat(sEntitySetName)) || oEntitySet;
          } else {
            aActiveContextPaths.push(sActiveContextPath);
          }
        }
        return aActiveContextPaths;
      }).catch(function (oError) {
        Log.info("Failed to retrieve one or more active context path's", oError);
      });
    } else {
      return Promise.resolve();
    }
  }
  function fetchActiveContextPaths(oContext, oController) {
    var oPromise, aSemanticKeys;
    var sCurrentHashNoParams = HashChanger.getInstance().getHash().split("?")[0];
    if (oContext) {
      var oModel = oContext.getModel();
      var oMetaModel = oModel.getMetaModel();
      bGlobalIsStickySupported = ModelHelper.isStickySessionSupported(oMetaModel);
      var sRootEntityName = sCurrentHashNoParams && sCurrentHashNoParams.substr(0, sCurrentHashNoParams.indexOf("("));
      if (sRootEntityName.indexOf("/") === 0) {
        sRootEntityName = sRootEntityName.substring(1);
      }
      aSemanticKeys = SemanticKeyHelper.getSemanticKeys(oMetaModel, sRootEntityName);
    }
    // Fetch active context details incase of below scenario's(where page is not sticky supported(we do not have draft instance))
    // 1. In case of draft enabled Object page where semantic key based URL is not possible(like semantic keys are not modeled in the entity set)
    // 2. In case of draft enabled Sub Object Pages (where semantic bookmarking is not supported)
    var oViewData = oController.getView().getViewData();
    if (oContext && !bGlobalIsStickySupported && (oViewData.viewLevel === 1 && !aSemanticKeys || oViewData.viewLevel >= 2)) {
      oPromise = getActiveContextPaths(oContext, oController);
      return oPromise;
    } else {
      return Promise.resolve();
    }
  }

  // /**
  //  * Get share URL.
  //  * @param bIsEditable
  //  * @param bIsStickySupported
  //  * @param aActiveContextPaths
  //  * @returns {string} The share URL
  //  * @protected
  //  * @static
  //  */
  function getShareUrl(bIsEditable, bIsStickySupported, aActiveContextPaths) {
    var sShareUrl;
    var sHash = HashChanger.getInstance().getHash();
    var sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "";
    if (bIsEditable && !bIsStickySupported && aActiveContextPaths) {
      sShareUrl = sBasePath + aActiveContextPaths.join("/");
    } else {
      sShareUrl = sHash ? sBasePath + sHash : window.location.hash;
    }
    return window.location.origin + window.location.pathname + window.location.search + sShareUrl;
  }
  function getShareEmailUrl() {
    var oUShellContainer = sap.ushell && sap.ushell.Container;
    if (oUShellContainer) {
      return oUShellContainer.getFLPUrlAsync(true).then(function (sFLPUrl) {
        return sFLPUrl;
      }).catch(function (sError) {
        Log.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)", sError);
      });
    } else {
      return Promise.resolve(document.URL);
    }
  }
  function getJamUrl(bIsEditMode, bIsStickySupported, aActiveContextPaths) {
    var sJamUrl;
    var sHash = HashChanger.getInstance().getHash();
    var sBasePath = HashChanger.getInstance().hrefForAppSpecificHash ? HashChanger.getInstance().hrefForAppSpecificHash("") : "";
    if (bIsEditMode && !bIsStickySupported && aActiveContextPaths) {
      sJamUrl = sBasePath + aActiveContextPaths.join("/");
    } else {
      sJamUrl = sHash ? sBasePath + sHash : window.location.hash;
    }
    // in case we are in cFLP scenario, the application is running
    // inside an iframe, and there for we need to get the cFLP URL
    // and not 'document.URL' that represents the iframe URL
    if (sap.ushell && sap.ushell.Container && sap.ushell.Container.runningInIframe && sap.ushell.Container.runningInIframe()) {
      sap.ushell.Container.getFLPUrl(true).then(function (sUrl) {
        return sUrl.substr(0, sUrl.indexOf("#")) + sJamUrl;
      }).catch(function (sError) {
        Log.error("Could not retrieve cFLP URL for the sharing dialog (dialog will not be opened)", sError);
      });
    } else {
      return Promise.resolve(window.location.origin + window.location.pathname + sJamUrl);
    }
  }
  var ShareExtensionOverride = {
    adaptShareMetadata: function (oShareMetadata) {
      try {
        var _this2 = this;
        var oContext = _this2.base.getView().getBindingContext();
        var oUIModel = _this2.base.getView().getModel("ui");
        var bIsEditable = oUIModel.getProperty("/isEditable");
        var _temp2 = _catch(function () {
          return Promise.resolve(fetchActiveContextPaths(oContext, _this2.base.getView().getController())).then(function (aActiveContextPaths) {
            var oPageTitleInfo = _this2.base.getView().getController()._getPageTitleInformation();
            return Promise.resolve(Promise.all([getJamUrl(bIsEditable, bGlobalIsStickySupported, aActiveContextPaths), getShareUrl(bIsEditable, bGlobalIsStickySupported, aActiveContextPaths), getShareEmailUrl()])).then(function (oData) {
              var sTitle = oPageTitleInfo.title;
              var sObjectSubtitle = oPageTitleInfo.subtitle ? oPageTitleInfo.subtitle.toString() : "";
              if (sObjectSubtitle) {
                sTitle = "".concat(sTitle, " - ").concat(sObjectSubtitle);
              }
              oShareMetadata.tile = {
                title: oPageTitleInfo.title,
                subtitle: sObjectSubtitle
              };
              oShareMetadata.email.title = sTitle;
              oShareMetadata.title = sTitle;
              oShareMetadata.jam.url = oData[0];
              oShareMetadata.url = oData[1];
              oShareMetadata.email.url = oData[2];
              // MS Teams collaboration does not want to allow further changes to the URL
              // so update colloborationInfo model at LR override to ignore further extension changes at multiple levels
              var collaborationInfoModel = _this2.base.getView().getModel("collaborationInfo");
              collaborationInfoModel.setProperty("/url", oShareMetadata.url);
              collaborationInfoModel.setProperty("/appTitle", oShareMetadata.title);
              collaborationInfoModel.setProperty("/subTitle", sObjectSubtitle);
            });
          });
        }, function (error) {
          Log.error(error);
        });
        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {
          return oShareMetadata;
        }) : oShareMetadata);
      } catch (e) {
        return Promise.reject(e);
      }
    }
  };
  return ShareExtensionOverride;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiYkdsb2JhbElzU3RpY2t5U3VwcG9ydGVkIiwiY3JlYXRlRmlsdGVyVG9GZXRjaEFjdGl2ZUNvbnRleHQiLCJtS2V5VmFsdWVzIiwiYklzQWN0aXZlRW50aXR5RGVmaW5lZCIsImFLZXlzIiwiT2JqZWN0Iiwia2V5cyIsImFGaWx0ZXJzIiwibWFwIiwic0tleSIsInNWYWx1ZSIsInVuZGVmaW5lZCIsIkZpbHRlciIsIkZpbHRlck9wZXJhdG9yIiwiRVEiLCJvQWN0aXZlRmlsdGVyIiwiZmlsdGVycyIsImFuZCIsInB1c2giLCJnZXRBY3RpdmVDb250ZXh0UGF0aCIsIm9Db250cm9sbGVyIiwic1BhZ2VFbnRpdHlOYW1lIiwib0ZpbHRlciIsIm9MaXN0QmluZGluZyIsImdldFZpZXciLCJnZXRCaW5kaW5nQ29udGV4dCIsImdldE1vZGVsIiwiYmluZExpc3QiLCJyZXF1ZXN0Q29udGV4dHMiLCJvQ29udGV4dHMiLCJsZW5ndGgiLCJnZXRQYXRoIiwiZ2V0QWN0aXZlQ29udGV4dEluc3RhbmNlcyIsIm9Db250ZXh0Iiwib0VudGl0eVNldCIsImFBY3RpdmVDb250ZXh0cHJvbWlzZXMiLCJhUGFnZXMiLCJzTWV0YVBhdGgiLCJnZXRNZXRhTW9kZWwiLCJnZXRNZXRhUGF0aCIsImluZGV4T2YiLCJzdWJzdHJpbmciLCJhTWV0YVBhdGhBcnJheSIsInNwbGl0Iiwic0N1cnJlbnRIYXNoTm9QYXJhbXMiLCJIYXNoQ2hhbmdlciIsImdldEluc3RhbmNlIiwiZ2V0SGFzaCIsImFDdXJyZW50SGFzaEFycmF5Iiwib1BhZ2VNYXAiLCJhUGFnZUhhc2hBcnJheSIsImZvckVhY2giLCJzUGFnZUhhc2giLCJhS2V5VmFsdWVzIiwic1BhZ2VIYXNoTmFtZSIsImkiLCJzS2V5QXNzaWdubWVudCIsImFQYXJ0cyIsInNLZXlWYWx1ZSIsIm9NZXRhTW9kZWwiLCJhVGVjaG5pY2FsS2V5cyIsImdldE9iamVjdCIsImpvaW4iLCJsYXN0SW5kZXhPZiIsImRlY29kZVVSSUNvbXBvbmVudCIsIm9QYWdlRW50aXR5U2V0Iiwic05hdmlnYXRpb25QYXRoIiwib1BhZ2VJbmZvIiwic1BhZ2VFbnRpdHlTZXROYW1lIiwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmciLCJwYWdlRW50aXR5TmFtZSIsImdldEFjdGl2ZUNvbnRleHRQYXRocyIsInNSb290RW50aXR5TmFtZSIsInN1YnN0ciIsIm9QYWdlQ29udGV4dCIsIlByb21pc2UiLCJhbGwiLCJhRGF0YSIsImFBY3RpdmVDb250ZXh0UGF0aHMiLCJzQWN0aXZlQ29udGV4dFBhdGgiLCJzTmF2aWdhdGlvUHJvcGVydHkiLCJzRW50aXR5U2V0TmFtZSIsInZhbHVlcyIsInJlcGxhY2UiLCJjYXRjaCIsIm9FcnJvciIsIkxvZyIsImluZm8iLCJyZXNvbHZlIiwiZmV0Y2hBY3RpdmVDb250ZXh0UGF0aHMiLCJvUHJvbWlzZSIsImFTZW1hbnRpY0tleXMiLCJvTW9kZWwiLCJNb2RlbEhlbHBlciIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIlNlbWFudGljS2V5SGVscGVyIiwiZ2V0U2VtYW50aWNLZXlzIiwib1ZpZXdEYXRhIiwiZ2V0Vmlld0RhdGEiLCJ2aWV3TGV2ZWwiLCJnZXRTaGFyZVVybCIsImJJc0VkaXRhYmxlIiwiYklzU3RpY2t5U3VwcG9ydGVkIiwic1NoYXJlVXJsIiwic0hhc2giLCJzQmFzZVBhdGgiLCJocmVmRm9yQXBwU3BlY2lmaWNIYXNoIiwid2luZG93IiwibG9jYXRpb24iLCJoYXNoIiwib3JpZ2luIiwicGF0aG5hbWUiLCJzZWFyY2giLCJnZXRTaGFyZUVtYWlsVXJsIiwib1VTaGVsbENvbnRhaW5lciIsInNhcCIsInVzaGVsbCIsIkNvbnRhaW5lciIsImdldEZMUFVybEFzeW5jIiwic0ZMUFVybCIsInNFcnJvciIsImVycm9yIiwiZG9jdW1lbnQiLCJVUkwiLCJnZXRKYW1VcmwiLCJiSXNFZGl0TW9kZSIsInNKYW1VcmwiLCJydW5uaW5nSW5JZnJhbWUiLCJnZXRGTFBVcmwiLCJzVXJsIiwiU2hhcmVFeHRlbnNpb25PdmVycmlkZSIsImFkYXB0U2hhcmVNZXRhZGF0YSIsIm9TaGFyZU1ldGFkYXRhIiwiYmFzZSIsIm9VSU1vZGVsIiwiZ2V0UHJvcGVydHkiLCJnZXRDb250cm9sbGVyIiwib1BhZ2VUaXRsZUluZm8iLCJfZ2V0UGFnZVRpdGxlSW5mb3JtYXRpb24iLCJvRGF0YSIsInNUaXRsZSIsInRpdGxlIiwic09iamVjdFN1YnRpdGxlIiwic3VidGl0bGUiLCJ0b1N0cmluZyIsInRpbGUiLCJlbWFpbCIsImphbSIsInVybCIsImNvbGxhYm9yYXRpb25JbmZvTW9kZWwiLCJzZXRQcm9wZXJ0eSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2hhcmUudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSBTaGFyZSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2hhcmVcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFNlbWFudGljS2V5SGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NlbWFudGljS2V5SGVscGVyXCI7XG5pbXBvcnQgdHlwZSBPYmplY3RQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9PYmplY3RQYWdlL09iamVjdFBhZ2VDb250cm9sbGVyLmNvbnRyb2xsZXJcIjtcbmltcG9ydCBIYXNoQ2hhbmdlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9IYXNoQ2hhbmdlclwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuXG5sZXQgYkdsb2JhbElzU3RpY2t5U3VwcG9ydGVkOiBib29sZWFuO1xuXG5mdW5jdGlvbiBjcmVhdGVGaWx0ZXJUb0ZldGNoQWN0aXZlQ29udGV4dChtS2V5VmFsdWVzOiBhbnksIGJJc0FjdGl2ZUVudGl0eURlZmluZWQ6IGFueSkge1xuXHRjb25zdCBhS2V5cyA9IE9iamVjdC5rZXlzKG1LZXlWYWx1ZXMpO1xuXG5cdGNvbnN0IGFGaWx0ZXJzID0gYUtleXMubWFwKGZ1bmN0aW9uIChzS2V5OiBzdHJpbmcpIHtcblx0XHRjb25zdCBzVmFsdWUgPSBtS2V5VmFsdWVzW3NLZXldO1xuXHRcdGlmIChzVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuIG5ldyBGaWx0ZXIoc0tleSwgRmlsdGVyT3BlcmF0b3IuRVEsIHNWYWx1ZSk7XG5cdFx0fVxuXHR9KTtcblxuXHRpZiAoYklzQWN0aXZlRW50aXR5RGVmaW5lZCkge1xuXHRcdGNvbnN0IG9BY3RpdmVGaWx0ZXIgPSBuZXcgRmlsdGVyKHtcblx0XHRcdGZpbHRlcnM6IFtuZXcgRmlsdGVyKFwiU2libGluZ0VudGl0eS9Jc0FjdGl2ZUVudGl0eVwiLCBGaWx0ZXJPcGVyYXRvci5FUSwgdHJ1ZSldLFxuXHRcdFx0YW5kOiBmYWxzZVxuXHRcdH0pO1xuXG5cdFx0YUZpbHRlcnMucHVzaChvQWN0aXZlRmlsdGVyKTtcblx0fVxuXG5cdHJldHVybiBuZXcgRmlsdGVyKGFGaWx0ZXJzIGFzIGFueSwgdHJ1ZSk7XG59XG5mdW5jdGlvbiBnZXRBY3RpdmVDb250ZXh0UGF0aChvQ29udHJvbGxlcjogYW55LCBzUGFnZUVudGl0eU5hbWU6IGFueSwgb0ZpbHRlcjogYW55KSB7XG5cdGNvbnN0IG9MaXN0QmluZGluZyA9IG9Db250cm9sbGVyXG5cdFx0LmdldFZpZXcoKVxuXHRcdC5nZXRCaW5kaW5nQ29udGV4dCgpXG5cdFx0LmdldE1vZGVsKClcblx0XHQuYmluZExpc3QoYC8ke3NQYWdlRW50aXR5TmFtZX1gLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgb0ZpbHRlciwgeyBcIiQkZ3JvdXBJZFwiOiBcIiRhdXRvLkhlcm9lc1wiIH0pO1xuXHRyZXR1cm4gb0xpc3RCaW5kaW5nLnJlcXVlc3RDb250ZXh0cygwLCAyKS50aGVuKGZ1bmN0aW9uIChvQ29udGV4dHM6IGFueSkge1xuXHRcdGlmIChvQ29udGV4dHMgJiYgb0NvbnRleHRzLmxlbmd0aCkge1xuXHRcdFx0cmV0dXJuIG9Db250ZXh0c1swXS5nZXRQYXRoKCk7XG5cdFx0fVxuXHR9KTtcbn1cbmZ1bmN0aW9uIGdldEFjdGl2ZUNvbnRleHRJbnN0YW5jZXMob0NvbnRleHQ6IGFueSwgb0NvbnRyb2xsZXI6IGFueSwgb0VudGl0eVNldDogYW55KSB7XG5cdGNvbnN0IGFBY3RpdmVDb250ZXh0cHJvbWlzZXM6IGFueVtdID0gW107XG5cdGNvbnN0IGFQYWdlczogYW55W10gPSBbXTtcblx0bGV0IHNNZXRhUGF0aCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0TWV0YVBhdGgob0NvbnRleHQuZ2V0UGF0aCgpKTtcblx0aWYgKHNNZXRhUGF0aC5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdHNNZXRhUGF0aCA9IHNNZXRhUGF0aC5zdWJzdHJpbmcoMSk7XG5cdH1cblx0Y29uc3QgYU1ldGFQYXRoQXJyYXkgPSBzTWV0YVBhdGguc3BsaXQoXCIvXCIpO1xuXHRjb25zdCBzQ3VycmVudEhhc2hOb1BhcmFtcyA9IEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkuZ2V0SGFzaCgpLnNwbGl0KFwiP1wiKVswXTtcblx0Y29uc3QgYUN1cnJlbnRIYXNoQXJyYXkgPSBzQ3VycmVudEhhc2hOb1BhcmFtcy5zcGxpdChcIi9cIik7XG5cblx0Ly8gb1BhZ2VNYXAgLSBjcmVhdGluZyBhbiBvYmplY3QgdGhhdCBjb250YWlucyBtYXAgb2YgbWV0YXBhdGggbmFtZSBhbmQgaXQncyB0ZWNobmljYWwgZGV0YWlsc1xuXHQvLyB3aGljaCBpcyByZXF1aXJlZCB0byBjcmVhdGUgYSBmaWx0ZXIgdG8gZmV0Y2ggdGhlIHJlbGF2YW50L2NvcnJlY3QgYWN0aXZlIGNvbnRleHRcblx0Ly8gRXhhbXBsZToge1NhbGVzT3JkZXJNYW5hZ2U6e3RlY2huaWNhbElEOnRlY2huaWNhbElEVmFsdWV9LCBfSXRlbTp7dGVjaG5pY2FsSUQ6dGVjaG5pY2FsSURWYWx1ZX19IGV0Yy4sXG5cdGNvbnN0IG9QYWdlTWFwOiBhbnkgPSB7fTtcblx0Y29uc3QgYVBhZ2VIYXNoQXJyYXk6IGFueVtdID0gW107XG5cdGFDdXJyZW50SGFzaEFycmF5LmZvckVhY2goZnVuY3Rpb24gKHNQYWdlSGFzaDogYW55KSB7XG5cdFx0Y29uc3QgYUtleVZhbHVlcyA9IHNQYWdlSGFzaC5zdWJzdHJpbmcoc1BhZ2VIYXNoLmluZGV4T2YoXCIoXCIpICsgMSwgc1BhZ2VIYXNoLmxlbmd0aCAtIDEpLnNwbGl0KFwiLFwiKTtcblx0XHRjb25zdCBtS2V5VmFsdWVzOiBhbnkgPSB7fTtcblx0XHRjb25zdCBzUGFnZUhhc2hOYW1lID0gc1BhZ2VIYXNoLnNwbGl0KFwiKFwiKVswXTtcblx0XHRvUGFnZU1hcFtzUGFnZUhhc2hOYW1lXSA9IHt9O1xuXHRcdGFQYWdlSGFzaEFycmF5LnB1c2goc1BhZ2VIYXNoTmFtZSk7XG5cdFx0b1BhZ2VNYXBbc1BhZ2VIYXNoTmFtZV1bXCJiSXNBY3RpdmVFbnRpdHlEZWZpbmVkXCJdID0gdHJ1ZTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFLZXlWYWx1ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGNvbnN0IHNLZXlBc3NpZ25tZW50ID0gYUtleVZhbHVlc1tpXTtcblx0XHRcdGNvbnN0IGFQYXJ0cyA9IHNLZXlBc3NpZ25tZW50LnNwbGl0KFwiPVwiKTtcblx0XHRcdGxldCBzS2V5VmFsdWUgPSBhUGFydHNbMV07XG5cdFx0XHRsZXQgc0tleSA9IGFQYXJ0c1swXTtcblx0XHRcdC8vIEluIGNhc2UgaWYgb25seSBvbmUgdGVjaG5pY2FsIGtleSBpcyBkZWZpbmVkIHRoZW4gdGhlIHVybCBqdXN0IGNvbnRhaW5zIHRoZSB0ZWNobmljYWxJRFZhbHVlIGJ1dCBub3QgdGhlIHRlY2huaWNhbElEXG5cdFx0XHQvLyBFeGFtcGxlOiBTYWxlc09yZGVyTWFuYWdlKElEPTExMTExMTI5LWFhYWEtYmJiYi1jY2NjLWRkZGRlZWVlZmZmZixJc0FjdGl2ZUVudGl0eT1mYWxzZSkvX0l0ZW0oMTExMTExMjktYWFhYS1iYmJiLWNjY2MtZGRkZGVlZWVmZmZmKVxuXHRcdFx0Ly8gSW4gYWJvdmUgZXhhbXBsZSBTYWxlc09yZGVySXRlbSBoYXMgb25seSBvbmUgdGVjaG5pY2FsIGtleSBkZWZpbmVkLCBoZW5jZSB0ZWNobmljYWxJRCBpbmZvIGlzIG5vdCBwcmVzZW50IGluIHRoZSB1cmxcblx0XHRcdC8vIEhlbmNlIGluIHN1Y2ggY2FzZXMgd2UgZ2V0IHRlY2huaWNhbCBrZXkgYW5kIHVzZSB0aGVtIHRvIGZldGNoIGFjdGl2ZSBjb250ZXh0XG5cdFx0XHRpZiAoc0tleUFzc2lnbm1lbnQuaW5kZXhPZihcIj1cIikgPT09IC0xKSB7XG5cdFx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0XHRjb25zdCBhVGVjaG5pY2FsS2V5cyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHthUGFnZUhhc2hBcnJheS5qb2luKFwiL1wiKX0vJFR5cGUvJEtleWApO1xuXHRcdFx0XHRzS2V5VmFsdWUgPSBhUGFydHNbMF07XG5cdFx0XHRcdHNLZXkgPSBhVGVjaG5pY2FsS2V5c1swXTtcblx0XHRcdFx0b1BhZ2VNYXBbc1BhZ2VIYXNoLnNwbGl0KFwiKFwiKVswXV1bXCJiSXNBY3RpdmVFbnRpdHlEZWZpbmVkXCJdID0gZmFsc2U7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChzS2V5ICE9PSBcIklzQWN0aXZlRW50aXR5XCIpIHtcblx0XHRcdFx0aWYgKHNLZXlWYWx1ZS5pbmRleE9mKFwiJ1wiKSA9PT0gMCAmJiBzS2V5VmFsdWUubGFzdEluZGV4T2YoXCInXCIpID09PSBzS2V5VmFsdWUubGVuZ3RoIC0gMSkge1xuXHRcdFx0XHRcdC8vIFJlbW92ZSB0aGUgcXVvdGVzIGZyb20gdGhlIHZhbHVlIGFuZCBkZWNvZGUgc3BlY2lhbCBjaGFyc1xuXHRcdFx0XHRcdHNLZXlWYWx1ZSA9IGRlY29kZVVSSUNvbXBvbmVudChzS2V5VmFsdWUuc3Vic3RyaW5nKDEsIHNLZXlWYWx1ZS5sZW5ndGggLSAxKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bUtleVZhbHVlc1tzS2V5XSA9IHNLZXlWYWx1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0b1BhZ2VNYXBbc1BhZ2VIYXNoTmFtZV0ubUtleVZhbHVlcyA9IG1LZXlWYWx1ZXM7XG5cdH0pO1xuXG5cdGxldCBvUGFnZUVudGl0eVNldCA9IG9FbnRpdHlTZXQ7XG5cdGFNZXRhUGF0aEFycmF5LmZvckVhY2goZnVuY3Rpb24gKHNOYXZpZ2F0aW9uUGF0aDogYW55KSB7XG5cdFx0Y29uc3Qgb1BhZ2VJbmZvOiBhbnkgPSB7fTtcblx0XHRjb25zdCBzUGFnZUVudGl0eVNldE5hbWUgPSBvUGFnZUVudGl0eVNldC4kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZyAmJiBvUGFnZUVudGl0eVNldC4kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1tzTmF2aWdhdGlvblBhdGhdO1xuXHRcdGlmIChzUGFnZUVudGl0eVNldE5hbWUpIHtcblx0XHRcdG9QYWdlSW5mby5wYWdlRW50aXR5TmFtZSA9IG9QYWdlRW50aXR5U2V0LiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW3NOYXZpZ2F0aW9uUGF0aF07XG5cdFx0XHRvUGFnZUVudGl0eVNldCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KGAvJHtzUGFnZUVudGl0eVNldE5hbWV9YCkgfHwgb0VudGl0eVNldDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1BhZ2VJbmZvLnBhZ2VFbnRpdHlOYW1lID0gc05hdmlnYXRpb25QYXRoO1xuXHRcdH1cblx0XHRvUGFnZUluZm8ubUtleVZhbHVlcyA9IG9QYWdlTWFwW3NOYXZpZ2F0aW9uUGF0aF0ubUtleVZhbHVlcztcblx0XHRvUGFnZUluZm8uYklzQWN0aXZlRW50aXR5RGVmaW5lZCA9IG9QYWdlTWFwW3NOYXZpZ2F0aW9uUGF0aF0uYklzQWN0aXZlRW50aXR5RGVmaW5lZDtcblx0XHRhUGFnZXMucHVzaChvUGFnZUluZm8pO1xuXHR9KTtcblxuXHRhUGFnZXMuZm9yRWFjaChmdW5jdGlvbiAob1BhZ2VJbmZvOiBhbnkpIHtcblx0XHRjb25zdCBvRmlsdGVyID0gY3JlYXRlRmlsdGVyVG9GZXRjaEFjdGl2ZUNvbnRleHQob1BhZ2VJbmZvLm1LZXlWYWx1ZXMsIG9QYWdlSW5mby5iSXNBY3RpdmVFbnRpdHlEZWZpbmVkKTtcblx0XHRhQWN0aXZlQ29udGV4dHByb21pc2VzLnB1c2goZ2V0QWN0aXZlQ29udGV4dFBhdGgob0NvbnRyb2xsZXIsIG9QYWdlSW5mby5wYWdlRW50aXR5TmFtZSwgb0ZpbHRlcikpO1xuXHR9KTtcblxuXHRyZXR1cm4gYUFjdGl2ZUNvbnRleHRwcm9taXNlcztcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gZmV0Y2ggYWN0aXZlIGNvbnRleHQgcGF0aCdzLlxuICpcbiAqIEBwYXJhbSBvQ29udGV4dCBUaGUgUGFnZSBDb250ZXh0XG4gKiBAcGFyYW0gb0NvbnRyb2xsZXJcbiAqIEByZXR1cm5zIFByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgb25jZSB0aGUgYWN0aXZlIGNvbnRleHQncyBhcmUgZmV0Y2hlZFxuICovXG5mdW5jdGlvbiBnZXRBY3RpdmVDb250ZXh0UGF0aHMob0NvbnRleHQ6IGFueSwgb0NvbnRyb2xsZXI6IGFueSkge1xuXHRjb25zdCBzQ3VycmVudEhhc2hOb1BhcmFtcyA9IEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkuZ2V0SGFzaCgpLnNwbGl0KFwiP1wiKVswXTtcblx0bGV0IHNSb290RW50aXR5TmFtZSA9IHNDdXJyZW50SGFzaE5vUGFyYW1zICYmIHNDdXJyZW50SGFzaE5vUGFyYW1zLnN1YnN0cigwLCBzQ3VycmVudEhhc2hOb1BhcmFtcy5pbmRleE9mKFwiKFwiKSk7XG5cdGlmIChzUm9vdEVudGl0eU5hbWUuaW5kZXhPZihcIi9cIikgPT09IDApIHtcblx0XHRzUm9vdEVudGl0eU5hbWUgPSBzUm9vdEVudGl0eU5hbWUuc3Vic3RyaW5nKDEpO1xuXHR9XG5cdGNvbnN0IG9FbnRpdHlTZXQgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChgLyR7c1Jvb3RFbnRpdHlOYW1lfWApO1xuXHRjb25zdCBvUGFnZUNvbnRleHQgPSBvQ29udGV4dDtcblx0Y29uc3QgYUFjdGl2ZUNvbnRleHRwcm9taXNlcyA9IGdldEFjdGl2ZUNvbnRleHRJbnN0YW5jZXMob0NvbnRleHQsIG9Db250cm9sbGVyLCBvRW50aXR5U2V0KTtcblx0aWYgKGFBY3RpdmVDb250ZXh0cHJvbWlzZXMubGVuZ3RoID4gMCkge1xuXHRcdHJldHVybiBQcm9taXNlLmFsbChhQWN0aXZlQ29udGV4dHByb21pc2VzKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKGFEYXRhOiBhbnlbXSkge1xuXHRcdFx0XHRjb25zdCBhQWN0aXZlQ29udGV4dFBhdGhzID0gW107XG5cdFx0XHRcdGxldCBvUGFnZUVudGl0eVNldCA9IG9FbnRpdHlTZXQ7XG5cdFx0XHRcdGlmIChhRGF0YVswXS5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0XHRcdGFBY3RpdmVDb250ZXh0UGF0aHMucHVzaChhRGF0YVswXS5zdWJzdHJpbmcoMSkpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFBY3RpdmVDb250ZXh0UGF0aHMucHVzaChhRGF0YVswXSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gSW4gdGhlIGFjdGl2ZSBjb250ZXh0IHBhdGhzIGlkZW50aWZ5IGFuZCByZXBsYWNlIHRoZSBlbnRpdHlTZXQgTmFtZSB3aXRoIGNvcnJlc3BvbmRpbmcgbmF2aWdhdGlvbiBwcm9wZXJ0eSBuYW1lXG5cdFx0XHRcdC8vIFJlcXVpcmVkIHRvIGZvcm0gdGhlIHVybCBwb2ludGluZyB0byBhY3RpdmUgY29udGV4dFxuXHRcdFx0XHQvLyBFeGFtcGxlIDogU2FsZXNPcmRlckl0ZW0gLS0+IF9JdGVtLCBNYXRlcmlhbERldGFpbHMgLS0+IF9NYXRlcmlhbERldGFpbHMgZXRjLixcblx0XHRcdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCBhRGF0YS5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGxldCBzQWN0aXZlQ29udGV4dFBhdGggPSBhRGF0YVtpXTtcblx0XHRcdFx0XHRsZXQgc05hdmlnYXRpb1Byb3BlcnR5ID0gXCJcIjtcblx0XHRcdFx0XHRsZXQgc0VudGl0eVNldE5hbWUgPSBzQWN0aXZlQ29udGV4dFBhdGggJiYgc0FjdGl2ZUNvbnRleHRQYXRoLnN1YnN0cigwLCBzQWN0aXZlQ29udGV4dFBhdGguaW5kZXhPZihcIihcIikpO1xuXHRcdFx0XHRcdGlmIChzRW50aXR5U2V0TmFtZS5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0c0VudGl0eVNldE5hbWUgPSBzRW50aXR5U2V0TmFtZS5zdWJzdHJpbmcoMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChzQWN0aXZlQ29udGV4dFBhdGguaW5kZXhPZihcIi9cIikgPT09IDApIHtcblx0XHRcdFx0XHRcdHNBY3RpdmVDb250ZXh0UGF0aCA9IHNBY3RpdmVDb250ZXh0UGF0aC5zdWJzdHJpbmcoMSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHNOYXZpZ2F0aW9Qcm9wZXJ0eSA9IE9iamVjdC5rZXlzKG9QYWdlRW50aXR5U2V0LiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nKVtcblx0XHRcdFx0XHRcdE9iamVjdC52YWx1ZXMob1BhZ2VFbnRpdHlTZXQuJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcpLmluZGV4T2Yoc0VudGl0eVNldE5hbWUpXG5cdFx0XHRcdFx0XTtcblx0XHRcdFx0XHRpZiAoc05hdmlnYXRpb1Byb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRhQWN0aXZlQ29udGV4dFBhdGhzLnB1c2goc0FjdGl2ZUNvbnRleHRQYXRoLnJlcGxhY2Uoc0VudGl0eVNldE5hbWUsIHNOYXZpZ2F0aW9Qcm9wZXJ0eSkpO1xuXHRcdFx0XHRcdFx0b1BhZ2VFbnRpdHlTZXQgPSBvUGFnZUNvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKS5nZXRPYmplY3QoYC8ke3NFbnRpdHlTZXROYW1lfWApIHx8IG9FbnRpdHlTZXQ7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGFBY3RpdmVDb250ZXh0UGF0aHMucHVzaChzQWN0aXZlQ29udGV4dFBhdGgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gYUFjdGl2ZUNvbnRleHRQYXRocztcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5pbmZvKFwiRmFpbGVkIHRvIHJldHJpZXZlIG9uZSBvciBtb3JlIGFjdGl2ZSBjb250ZXh0IHBhdGgnc1wiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHR9XG59XG5mdW5jdGlvbiBmZXRjaEFjdGl2ZUNvbnRleHRQYXRocyhvQ29udGV4dDogYW55LCBvQ29udHJvbGxlcjogYW55KSB7XG5cdGxldCBvUHJvbWlzZSwgYVNlbWFudGljS2V5cztcblx0Y29uc3Qgc0N1cnJlbnRIYXNoTm9QYXJhbXMgPSBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpLmdldEhhc2goKS5zcGxpdChcIj9cIilbMF07XG5cdGlmIChvQ29udGV4dCkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRiR2xvYmFsSXNTdGlja3lTdXBwb3J0ZWQgPSBNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQob01ldGFNb2RlbCk7XG5cdFx0bGV0IHNSb290RW50aXR5TmFtZSA9IHNDdXJyZW50SGFzaE5vUGFyYW1zICYmIHNDdXJyZW50SGFzaE5vUGFyYW1zLnN1YnN0cigwLCBzQ3VycmVudEhhc2hOb1BhcmFtcy5pbmRleE9mKFwiKFwiKSk7XG5cdFx0aWYgKHNSb290RW50aXR5TmFtZS5pbmRleE9mKFwiL1wiKSA9PT0gMCkge1xuXHRcdFx0c1Jvb3RFbnRpdHlOYW1lID0gc1Jvb3RFbnRpdHlOYW1lLnN1YnN0cmluZygxKTtcblx0XHR9XG5cdFx0YVNlbWFudGljS2V5cyA9IFNlbWFudGljS2V5SGVscGVyLmdldFNlbWFudGljS2V5cyhvTWV0YU1vZGVsLCBzUm9vdEVudGl0eU5hbWUpO1xuXHR9XG5cdC8vIEZldGNoIGFjdGl2ZSBjb250ZXh0IGRldGFpbHMgaW5jYXNlIG9mIGJlbG93IHNjZW5hcmlvJ3Mod2hlcmUgcGFnZSBpcyBub3Qgc3RpY2t5IHN1cHBvcnRlZCh3ZSBkbyBub3QgaGF2ZSBkcmFmdCBpbnN0YW5jZSkpXG5cdC8vIDEuIEluIGNhc2Ugb2YgZHJhZnQgZW5hYmxlZCBPYmplY3QgcGFnZSB3aGVyZSBzZW1hbnRpYyBrZXkgYmFzZWQgVVJMIGlzIG5vdCBwb3NzaWJsZShsaWtlIHNlbWFudGljIGtleXMgYXJlIG5vdCBtb2RlbGVkIGluIHRoZSBlbnRpdHkgc2V0KVxuXHQvLyAyLiBJbiBjYXNlIG9mIGRyYWZ0IGVuYWJsZWQgU3ViIE9iamVjdCBQYWdlcyAod2hlcmUgc2VtYW50aWMgYm9va21hcmtpbmcgaXMgbm90IHN1cHBvcnRlZClcblx0Y29uc3Qgb1ZpZXdEYXRhID0gb0NvbnRyb2xsZXIuZ2V0VmlldygpLmdldFZpZXdEYXRhKCk7XG5cdGlmIChvQ29udGV4dCAmJiAhYkdsb2JhbElzU3RpY2t5U3VwcG9ydGVkICYmICgob1ZpZXdEYXRhLnZpZXdMZXZlbCA9PT0gMSAmJiAhYVNlbWFudGljS2V5cykgfHwgb1ZpZXdEYXRhLnZpZXdMZXZlbCA+PSAyKSkge1xuXHRcdG9Qcm9taXNlID0gZ2V0QWN0aXZlQ29udGV4dFBhdGhzKG9Db250ZXh0LCBvQ29udHJvbGxlcik7XG5cdFx0cmV0dXJuIG9Qcm9taXNlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxufVxuXG4vLyAvKipcbi8vICAqIEdldCBzaGFyZSBVUkwuXG4vLyAgKiBAcGFyYW0gYklzRWRpdGFibGVcbi8vICAqIEBwYXJhbSBiSXNTdGlja3lTdXBwb3J0ZWRcbi8vICAqIEBwYXJhbSBhQWN0aXZlQ29udGV4dFBhdGhzXG4vLyAgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgc2hhcmUgVVJMXG4vLyAgKiBAcHJvdGVjdGVkXG4vLyAgKiBAc3RhdGljXG4vLyAgKi9cbmZ1bmN0aW9uIGdldFNoYXJlVXJsKGJJc0VkaXRhYmxlOiBhbnksIGJJc1N0aWNreVN1cHBvcnRlZDogYW55LCBhQWN0aXZlQ29udGV4dFBhdGhzOiBhbnkpIHtcblx0bGV0IHNTaGFyZVVybDtcblx0Y29uc3Qgc0hhc2ggPSBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpLmdldEhhc2goKTtcblx0Y29uc3Qgc0Jhc2VQYXRoID0gKEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkgYXMgYW55KS5ocmVmRm9yQXBwU3BlY2lmaWNIYXNoXG5cdFx0PyAoSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKSBhcyBhbnkpLmhyZWZGb3JBcHBTcGVjaWZpY0hhc2goXCJcIilcblx0XHQ6IFwiXCI7XG5cdGlmIChiSXNFZGl0YWJsZSAmJiAhYklzU3RpY2t5U3VwcG9ydGVkICYmIGFBY3RpdmVDb250ZXh0UGF0aHMpIHtcblx0XHRzU2hhcmVVcmwgPSBzQmFzZVBhdGggKyBhQWN0aXZlQ29udGV4dFBhdGhzLmpvaW4oXCIvXCIpO1xuXHR9IGVsc2Uge1xuXHRcdHNTaGFyZVVybCA9IHNIYXNoID8gc0Jhc2VQYXRoICsgc0hhc2ggOiB3aW5kb3cubG9jYXRpb24uaGFzaDtcblx0fVxuXHRyZXR1cm4gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHdpbmRvdy5sb2NhdGlvbi5zZWFyY2ggKyBzU2hhcmVVcmw7XG59XG5mdW5jdGlvbiBnZXRTaGFyZUVtYWlsVXJsKCkge1xuXHRjb25zdCBvVVNoZWxsQ29udGFpbmVyID0gc2FwLnVzaGVsbCAmJiBzYXAudXNoZWxsLkNvbnRhaW5lcjtcblx0aWYgKG9VU2hlbGxDb250YWluZXIpIHtcblx0XHRyZXR1cm4gb1VTaGVsbENvbnRhaW5lclxuXHRcdFx0LmdldEZMUFVybEFzeW5jKHRydWUpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoc0ZMUFVybDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBzRkxQVXJsO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoc0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiQ291bGQgbm90IHJldHJpZXZlIGNGTFAgVVJMIGZvciB0aGUgc2hhcmluZyBkaWFsb2cgKGRpYWxvZyB3aWxsIG5vdCBiZSBvcGVuZWQpXCIsIHNFcnJvcik7XG5cdFx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGRvY3VtZW50LlVSTCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0SmFtVXJsKGJJc0VkaXRNb2RlOiBib29sZWFuLCBiSXNTdGlja3lTdXBwb3J0ZWQ6IGFueSwgYUFjdGl2ZUNvbnRleHRQYXRoczogYW55KSB7XG5cdGxldCBzSmFtVXJsOiBzdHJpbmc7XG5cdGNvbnN0IHNIYXNoID0gSGFzaENoYW5nZXIuZ2V0SW5zdGFuY2UoKS5nZXRIYXNoKCk7XG5cdGNvbnN0IHNCYXNlUGF0aCA9IChIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpIGFzIGFueSkuaHJlZkZvckFwcFNwZWNpZmljSGFzaFxuXHRcdD8gKEhhc2hDaGFuZ2VyLmdldEluc3RhbmNlKCkgYXMgYW55KS5ocmVmRm9yQXBwU3BlY2lmaWNIYXNoKFwiXCIpXG5cdFx0OiBcIlwiO1xuXHRpZiAoYklzRWRpdE1vZGUgJiYgIWJJc1N0aWNreVN1cHBvcnRlZCAmJiBhQWN0aXZlQ29udGV4dFBhdGhzKSB7XG5cdFx0c0phbVVybCA9IHNCYXNlUGF0aCArIGFBY3RpdmVDb250ZXh0UGF0aHMuam9pbihcIi9cIik7XG5cdH0gZWxzZSB7XG5cdFx0c0phbVVybCA9IHNIYXNoID8gc0Jhc2VQYXRoICsgc0hhc2ggOiB3aW5kb3cubG9jYXRpb24uaGFzaDtcblx0fVxuXHQvLyBpbiBjYXNlIHdlIGFyZSBpbiBjRkxQIHNjZW5hcmlvLCB0aGUgYXBwbGljYXRpb24gaXMgcnVubmluZ1xuXHQvLyBpbnNpZGUgYW4gaWZyYW1lLCBhbmQgdGhlcmUgZm9yIHdlIG5lZWQgdG8gZ2V0IHRoZSBjRkxQIFVSTFxuXHQvLyBhbmQgbm90ICdkb2N1bWVudC5VUkwnIHRoYXQgcmVwcmVzZW50cyB0aGUgaWZyYW1lIFVSTFxuXHRpZiAoc2FwLnVzaGVsbCAmJiBzYXAudXNoZWxsLkNvbnRhaW5lciAmJiBzYXAudXNoZWxsLkNvbnRhaW5lci5ydW5uaW5nSW5JZnJhbWUgJiYgc2FwLnVzaGVsbC5Db250YWluZXIucnVubmluZ0luSWZyYW1lKCkpIHtcblx0XHRzYXAudXNoZWxsLkNvbnRhaW5lci5nZXRGTFBVcmwodHJ1ZSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChzVXJsOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIHNVcmwuc3Vic3RyKDAsIHNVcmwuaW5kZXhPZihcIiNcIikpICsgc0phbVVybDtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKHNFcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkNvdWxkIG5vdCByZXRyaWV2ZSBjRkxQIFVSTCBmb3IgdGhlIHNoYXJpbmcgZGlhbG9nIChkaWFsb2cgd2lsbCBub3QgYmUgb3BlbmVkKVwiLCBzRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSh3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgc0phbVVybCk7XG5cdH1cbn1cblxuY29uc3QgU2hhcmVFeHRlbnNpb25PdmVycmlkZSA9IHtcblx0YWRhcHRTaGFyZU1ldGFkYXRhOiBhc3luYyBmdW5jdGlvbiAodGhpczogU2hhcmUsIG9TaGFyZU1ldGFkYXRhOiBhbnkpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRjb25zdCBvVUlNb2RlbCA9IHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0TW9kZWwoXCJ1aVwiKTtcblx0XHRjb25zdCBiSXNFZGl0YWJsZSA9IG9VSU1vZGVsLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIik7XG5cblx0XHR0cnkge1xuXHRcdFx0Y29uc3QgYUFjdGl2ZUNvbnRleHRQYXRocyA9IGF3YWl0IGZldGNoQWN0aXZlQ29udGV4dFBhdGhzKG9Db250ZXh0LCB0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSk7XG5cdFx0XHRjb25zdCBvUGFnZVRpdGxlSW5mbyA9ICh0aGlzLmJhc2UuZ2V0VmlldygpLmdldENvbnRyb2xsZXIoKSBhcyBPYmplY3RQYWdlQ29udHJvbGxlcikuX2dldFBhZ2VUaXRsZUluZm9ybWF0aW9uKCk7XG5cdFx0XHRjb25zdCBvRGF0YSA9IGF3YWl0IFByb21pc2UuYWxsKFtcblx0XHRcdFx0Z2V0SmFtVXJsKGJJc0VkaXRhYmxlLCBiR2xvYmFsSXNTdGlja3lTdXBwb3J0ZWQsIGFBY3RpdmVDb250ZXh0UGF0aHMpLFxuXHRcdFx0XHRnZXRTaGFyZVVybChiSXNFZGl0YWJsZSwgYkdsb2JhbElzU3RpY2t5U3VwcG9ydGVkLCBhQWN0aXZlQ29udGV4dFBhdGhzKSxcblx0XHRcdFx0Z2V0U2hhcmVFbWFpbFVybCgpXG5cdFx0XHRdKTtcblxuXHRcdFx0bGV0IHNUaXRsZSA9IG9QYWdlVGl0bGVJbmZvLnRpdGxlO1xuXHRcdFx0Y29uc3Qgc09iamVjdFN1YnRpdGxlID0gb1BhZ2VUaXRsZUluZm8uc3VidGl0bGUgPyBvUGFnZVRpdGxlSW5mby5zdWJ0aXRsZS50b1N0cmluZygpIDogXCJcIjtcblx0XHRcdGlmIChzT2JqZWN0U3VidGl0bGUpIHtcblx0XHRcdFx0c1RpdGxlID0gYCR7c1RpdGxlfSAtICR7c09iamVjdFN1YnRpdGxlfWA7XG5cdFx0XHR9XG5cdFx0XHRvU2hhcmVNZXRhZGF0YS50aWxlID0ge1xuXHRcdFx0XHR0aXRsZTogb1BhZ2VUaXRsZUluZm8udGl0bGUsXG5cdFx0XHRcdHN1YnRpdGxlOiBzT2JqZWN0U3VidGl0bGVcblx0XHRcdH07XG5cdFx0XHRvU2hhcmVNZXRhZGF0YS5lbWFpbC50aXRsZSA9IHNUaXRsZTtcblx0XHRcdG9TaGFyZU1ldGFkYXRhLnRpdGxlID0gc1RpdGxlO1xuXHRcdFx0b1NoYXJlTWV0YWRhdGEuamFtLnVybCA9IG9EYXRhWzBdO1xuXHRcdFx0b1NoYXJlTWV0YWRhdGEudXJsID0gb0RhdGFbMV07XG5cdFx0XHRvU2hhcmVNZXRhZGF0YS5lbWFpbC51cmwgPSBvRGF0YVsyXTtcblx0XHRcdC8vIE1TIFRlYW1zIGNvbGxhYm9yYXRpb24gZG9lcyBub3Qgd2FudCB0byBhbGxvdyBmdXJ0aGVyIGNoYW5nZXMgdG8gdGhlIFVSTFxuXHRcdFx0Ly8gc28gdXBkYXRlIGNvbGxvYm9yYXRpb25JbmZvIG1vZGVsIGF0IExSIG92ZXJyaWRlIHRvIGlnbm9yZSBmdXJ0aGVyIGV4dGVuc2lvbiBjaGFuZ2VzIGF0IG11bHRpcGxlIGxldmVsc1xuXHRcdFx0Y29uc3QgY29sbGFib3JhdGlvbkluZm9Nb2RlbDogSlNPTk1vZGVsID0gdGhpcy5iYXNlLmdldFZpZXcoKS5nZXRNb2RlbChcImNvbGxhYm9yYXRpb25JbmZvXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdGNvbGxhYm9yYXRpb25JbmZvTW9kZWwuc2V0UHJvcGVydHkoXCIvdXJsXCIsIG9TaGFyZU1ldGFkYXRhLnVybCk7XG5cdFx0XHRjb2xsYWJvcmF0aW9uSW5mb01vZGVsLnNldFByb3BlcnR5KFwiL2FwcFRpdGxlXCIsIG9TaGFyZU1ldGFkYXRhLnRpdGxlKTtcblx0XHRcdGNvbGxhYm9yYXRpb25JbmZvTW9kZWwuc2V0UHJvcGVydHkoXCIvc3ViVGl0bGVcIiwgc09iamVjdFN1YnRpdGxlKTtcblx0XHR9IGNhdGNoIChlcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3IoZXJyb3IpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvU2hhcmVNZXRhZGF0YTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgU2hhcmVFeHRlbnNpb25PdmVycmlkZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQWtqQk8sZ0JBQWdCQSxJQUFJLEVBQUVDLE9BQU8sRUFBRTtJQUNyQyxJQUFJO01BQ0gsSUFBSUMsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU1HLENBQUMsRUFBRTtNQUNWLE9BQU9GLE9BQU8sQ0FBQ0UsQ0FBQyxDQUFDO0lBQ2xCO0lBQ0EsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLElBQUksRUFBRTtNQUMxQixPQUFPRixNQUFNLENBQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRUgsT0FBTyxDQUFDO0lBQ3BDO0lBQ0EsT0FBT0MsTUFBTTtFQUNkO0VBbGpCQSxJQUFJRyx3QkFBaUM7RUFFckMsU0FBU0MsZ0NBQWdDLENBQUNDLFVBQWUsRUFBRUMsc0JBQTJCLEVBQUU7SUFDdkYsSUFBTUMsS0FBSyxHQUFHQyxNQUFNLENBQUNDLElBQUksQ0FBQ0osVUFBVSxDQUFDO0lBRXJDLElBQU1LLFFBQVEsR0FBR0gsS0FBSyxDQUFDSSxHQUFHLENBQUMsVUFBVUMsSUFBWSxFQUFFO01BQ2xELElBQU1DLE1BQU0sR0FBR1IsVUFBVSxDQUFDTyxJQUFJLENBQUM7TUFDL0IsSUFBSUMsTUFBTSxLQUFLQyxTQUFT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