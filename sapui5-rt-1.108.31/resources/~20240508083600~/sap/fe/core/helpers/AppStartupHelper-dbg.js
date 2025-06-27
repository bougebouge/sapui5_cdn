/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/model/Filter", "sap/ui/model/FilterOperator", "./ModelHelper"], function (Filter, FilterOperator, ModelHelper) {
  "use strict";

  var AppStartupHelper = {
    /**
     * Retrieves a set of key values from startup parameters.
     *
     * @param aKeyNames The array of key names
     * @param oStartupParameters The startup parameters
     * @returns An array of pairs \{name, value\} if all key values could be found in the startup parameters, undefined otherwise
     */
    _getKeysFromStartupParams: function (aKeyNames, oStartupParameters) {
      var bAllFound = true;
      var aKeys = aKeyNames.map(function (name) {
        if (oStartupParameters[name] && oStartupParameters[name].length === 1) {
          return {
            name: name,
            value: oStartupParameters[name][0]
          };
        } else {
          // A unique key value couldn't be found in the startup parameters
          bAllFound = false;
          return {
            name: name,
            value: ""
          };
        }
      });
      return bAllFound ? aKeys : undefined;
    },
    /**
     * Creates a filter from a list of key values.
     *
     * @param aKeys Array of semantic keys or technical keys (with values)
     * @param bDraftMode True if the entity supports draft mode
     * @param oMetaModel The metamodel
     * @returns The filter
     */
    _createFilterFromKeys: function (aKeys, bDraftMode, oMetaModel) {
      var bFilterCaseSensitive = ModelHelper.isFilteringCaseSensitive(oMetaModel);
      var bFilterOnActiveEntity = false;
      var aFilters = aKeys.map(function (key) {
        if (key.name === "IsActiveEntity") {
          bFilterOnActiveEntity = true;
        }
        return new Filter({
          path: key.name,
          operator: FilterOperator.EQ,
          value1: key.value,
          caseSensitive: bFilterCaseSensitive
        });
      });
      if (bDraftMode && !bFilterOnActiveEntity) {
        var oDraftFilter = new Filter({
          filters: [new Filter("IsActiveEntity", "EQ", false), new Filter("SiblingEntity/IsActiveEntity", "EQ", null)],
          and: false
        });
        aFilters.push(oDraftFilter);
      }
      return new Filter(aFilters, true);
    },
    /**
     * Loads all contexts for a list of page infos.
     *
     * @param aStartupPages The list of page infos
     * @param oModel The model used to load the contexts
     * @returns A Promise for all contexts
     */
    _requestObjectsFromParameters: function (aStartupPages, oModel) {
      var _this = this;
      // Load the respective objects for all object pages found in aExternallyNavigablePages
      var aContextPromises = aStartupPages.map(function (pageInfo) {
        var aKeys = pageInfo.semanticKeys || pageInfo.technicalKeys || [];
        var oFilter = _this._createFilterFromKeys(aKeys, pageInfo.draftMode, oModel.getMetaModel());

        // only request a minimum of fields to boost backend performance since this is only used to check if an object exists
        var oListBind = oModel.bindList(pageInfo.contextPath, undefined, undefined, oFilter, {
          "$select": aKeys.map(function (key) {
            return key.name;
          }).join(",")
        });
        return oListBind.requestContexts(0, 2);
      });
      return Promise.all(aContextPromises);
    },
    /**
     * Creates a PageInfo from a route if it's reachable from the startup parameters.
     *
     * @param oRoute The route
     * @param oManifestRouting The app manifest routing section
     * @param oStartupParameters The startup parameters
     * @param oMetaModel The app metamodel
     * @returns A page info if the page is reachable, undefined otherwise
     */
    _getReachablePageInfoFromRoute: function (oRoute, oManifestRouting, oStartupParameters, oMetaModel) {
      var _oTarget$options, _oTarget$options$sett;
      // Remove trailing ':?query:' and '/'
      var sPattern = oRoute.pattern.replace(":?query:", "");
      sPattern = sPattern.replace(/\/$/, "");
      if (!sPattern || !sPattern.endsWith(")")) {
        // Ignore level-0 routes (ListReport) or routes corresponding to a 1-1 relation (no keys in the URL in this case)
        return undefined;
      }
      sPattern = sPattern.replace(/\(\{[^\}]*\}\)/g, "(#)"); // Replace keys with #

      // Get the rightmost target for this route
      var sTargetName = Array.isArray(oRoute.target) ? oRoute.target[oRoute.target.length - 1] : oRoute.target;
      var oTarget = oManifestRouting.targets[sTargetName];
      var aPatternSegments = sPattern.split("/");
      var pageLevel = aPatternSegments.length - 1;
      if (pageLevel !== 0 && (oTarget === null || oTarget === void 0 ? void 0 : (_oTarget$options = oTarget.options) === null || _oTarget$options === void 0 ? void 0 : (_oTarget$options$sett = _oTarget$options.settings) === null || _oTarget$options$sett === void 0 ? void 0 : _oTarget$options$sett.allowDeepLinking) !== true) {
        // The first level of object page allows deep linking by default.
        // Otherwise, the target must allow deep linking explicitely in the manifest
        return undefined;
      }
      var sContextPath = oTarget.options.settings.contextPath || oTarget.options.settings.entitySet && "/".concat(oTarget.options.settings.entitySet);
      var oEntityType = sContextPath && oMetaModel.getObject("/$EntityContainer".concat(sContextPath, "/"));
      if (!oEntityType) {
        return undefined;
      }

      // Get the semantic key values for the entity
      var aSemanticKeyNames = oMetaModel.getObject("/$EntityContainer".concat(sContextPath, "/@com.sap.vocabularies.Common.v1.SemanticKey"));
      var aSemantickKeys = aSemanticKeyNames ? this._getKeysFromStartupParams(aSemanticKeyNames.map(function (semKey) {
        return semKey.$PropertyPath;
      }), oStartupParameters) : undefined;

      // Get the technical keys only if we couldn't find the semantic key values, and on first level OP
      var aTechnicalKeys = !aSemantickKeys && pageLevel === 0 ? this._getKeysFromStartupParams(oEntityType["$Key"], oStartupParameters) : undefined;
      if (aSemantickKeys === undefined && aTechnicalKeys === undefined) {
        // We couldn't find the semantic/technical keys in the startup parameters
        return undefined;
      }

      // The startup parameters contain values for all semantic keys (or technical keys) --> we can store the page info in the corresponding level
      var draftMode = oMetaModel.getObject("/$EntityContainer".concat(sContextPath, "@com.sap.vocabularies.Common.v1.DraftRoot")) || oMetaModel.getObject("/$EntityContainer".concat(sContextPath, "@com.sap.vocabularies.Common.v1.DraftNode")) ? true : false;
      return {
        pattern: sPattern,
        contextPath: sContextPath,
        draftMode: draftMode,
        technicalKeys: aTechnicalKeys,
        semanticKeys: aSemantickKeys,
        target: sTargetName,
        pageLevel: pageLevel
      };
    },
    /**
     * Returns the list of all pages that allow deeplink and that can be reached using the startup parameters.
     *
     * @param oManifestRouting The routing information from the app manifest
     * @param oStartupParameters The startup parameters
     * @param oMetaModel The metamodel
     * @returns The reachable pages
     */
    _getReachablePages: function (oManifestRouting, oStartupParameters, oMetaModel) {
      var _this2 = this;
      var aRoutes = oManifestRouting.routes;
      var mPagesByLevel = {};
      aRoutes.forEach(function (oRoute) {
        var oPageInfo = _this2._getReachablePageInfoFromRoute(oRoute, oManifestRouting, oStartupParameters, oMetaModel);
        if (oPageInfo) {
          if (!mPagesByLevel[oPageInfo.pageLevel]) {
            mPagesByLevel[oPageInfo.pageLevel] = [];
          }
          mPagesByLevel[oPageInfo.pageLevel].push(oPageInfo);
        }
      });

      // A page is reachable only if all its parents are also reachable
      // So if we couldn't find any pages for a given level, all pages with a higher level won't be reachable anyway
      var aReachablePages = [];
      var level = 0;
      while (mPagesByLevel[level]) {
        aReachablePages.push(mPagesByLevel[level]);
        level++;
      }
      return aReachablePages;
    },
    /**
     * Get the list of startup pages.
     *
     * @param oManifestRouting The routing information from the app manifest
     * @param oStartupParameters The startup parameters
     * @param oMetaModel The metamodel
     * @returns An array of startup page infos
     */
    _getStartupPagesFromStartupParams: function (oManifestRouting, oStartupParameters, oMetaModel) {
      // Find all pages that can be reached with the startup parameters
      var aReachablePages = this._getReachablePages(oManifestRouting, oStartupParameters, oMetaModel);
      if (aReachablePages.length === 0) {
        return [];
      }

      // Find the longest sequence of pages that can be reached (recursively)
      var result = [];
      var current = [];
      function findRecursive(level) {
        var aCurrentLevelPages = aReachablePages[level];
        var lastPage = current.length ? current[current.length - 1] : undefined;
        if (aCurrentLevelPages) {
          aCurrentLevelPages.forEach(function (nextPage) {
            if (!lastPage || nextPage.pattern.indexOf(lastPage.pattern) === 0) {
              // We only consider pages that can be reached from the page at the previous level,
              // --> their pattern must be the pattern of the previous page with another segment appended
              current.push(nextPage);
              findRecursive(level + 1);
              current.pop();
            }
          });
        }
        if (current.length > result.length) {
          result = current.slice(); // We have found a sequence longer than our previous best --> store it as the new longest
        }
      }

      findRecursive(0);
      return result;
    },
    /**
     * Creates the startup object from the list of pages and contexts.
     *
     * @param aStartupPages The pages
     * @param aContexts The contexts
     * @returns An object containing either a hash or a context to navigate to, or an empty object if no deep link was found
     */
    _getDeepLinkObject: function (aStartupPages, aContexts) {
      if (aContexts.length === 1) {
        return {
          context: aContexts[0]
        };
      } else if (aContexts.length > 1) {
        // Navigation to a deeper level --> use the pattern of the deepest object page
        // and replace the parameters by the ID from the contexts
        var hash = aStartupPages[aStartupPages.length - 1].pattern;
        aContexts.forEach(function (oContext) {
          hash = hash.replace("(#)", "(".concat(oContext.getPath().split("(")[1]));
        });
        return {
          hash: hash
        };
      } else {
        return {};
      }
    },
    /**
     * Calculates startup parameters for a deeplink case, from startup parameters and routing infoirmation.
     *
     * @param oManifestRouting The routing information from the app manifest
     * @param oStartupParameters The startup parameters
     * @param oModel The OData model
     * @returns An object containing either a hash or a context to navigate to, or an empty object if no deep link was found
     */
    getDeepLinkStartupHash: function (oManifestRouting, oStartupParameters, oModel) {
      var _this3 = this;
      var aStartupPages;
      return oModel.getMetaModel().requestObject("/$EntityContainer/").then(function () {
        // Check if semantic keys are present in url parameters for every object page at each level
        aStartupPages = _this3._getStartupPagesFromStartupParams(oManifestRouting, oStartupParameters, oModel.getMetaModel());
        return _this3._requestObjectsFromParameters(aStartupPages, oModel);
      }).then(function (aValues) {
        if (aValues.length) {
          // Make sure we only get 1 context per promise, and flatten the array
          var aContexts = [];
          aValues.forEach(function (aFoundContexts) {
            if (aFoundContexts.length === 1) {
              aContexts.push(aFoundContexts[0]);
            }
          });
          return aContexts.length === aValues.length ? _this3._getDeepLinkObject(aStartupPages, aContexts) : {};
        } else {
          return {};
        }
      });
    },
    /**
     * Calculates the new hash based on the startup parameters.
     *
     * @param oStartupParameters The startup parameter values (map parameter name -> array of values)
     * @param sContextPath The context path for the startup of the app (generally the path to the main entity set)
     * @param oRouter The router instance
     * @param oMetaModel The meta model
     * @returns A promise containing the hash to navigate to, or an empty string if there's no need to navigate
     */
    getCreateStartupHash: function (oStartupParameters, sContextPath, oRouter, oMetaModel) {
      var _this4 = this;
      return oMetaModel.requestObject("".concat(sContextPath, "@")).then(function (oEntitySetAnnotations) {
        var sMetaPath = "";
        var bCreatable = true;
        if (oEntitySetAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] && oEntitySetAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"]["NewAction"]) {
          sMetaPath = "".concat(sContextPath, "@com.sap.vocabularies.Common.v1.DraftRoot/NewAction@Org.OData.Core.V1.OperationAvailable");
        } else if (oEntitySetAnnotations["@com.sap.vocabularies.Session.v1.StickySessionSupported"] && oEntitySetAnnotations["@com.sap.vocabularies.Session.v1.StickySessionSupported"]["NewAction"]) {
          sMetaPath = "".concat(sContextPath, "@com.sap.vocabularies.Session.v1.StickySessionSupported/NewAction@Org.OData.Core.V1.OperationAvailable");
        }
        if (sMetaPath) {
          var bNewActionOperationAvailable = oMetaModel.getObject(sMetaPath);
          if (bNewActionOperationAvailable === false) {
            bCreatable = false;
          }
        } else {
          var oInsertRestrictions = oEntitySetAnnotations["@Org.OData.Capabilities.V1.InsertRestrictions"];
          if (oInsertRestrictions && oInsertRestrictions.Insertable === false) {
            bCreatable = false;
          }
        }
        if (bCreatable) {
          return _this4.getDefaultCreateHash(oStartupParameters, sContextPath, oRouter);
        } else {
          return "";
        }
      });
    },
    /**
     * Calculates the hash to create a new object.
     *
     * @param oStartupParameters The startup parameter values (map parameter name -> array of values)
     * @param sContextPath The context path of the entity set to be used for the creation
     * @param oRouter The router instance
     * @returns The hash
     */
    getDefaultCreateHash: function (oStartupParameters, sContextPath, oRouter) {
      var sDefaultCreateHash = oStartupParameters && oStartupParameters.preferredMode ? oStartupParameters.preferredMode[0] : "create";
      var sHash = "";
      sDefaultCreateHash = sDefaultCreateHash.indexOf(":") !== -1 && sDefaultCreateHash.length > sDefaultCreateHash.indexOf(":") + 1 ? sDefaultCreateHash.substr(0, sDefaultCreateHash.indexOf(":")) : "create";
      sHash = "".concat(sContextPath.substring(1), "(...)?i-action=").concat(sDefaultCreateHash);
      if (oRouter.getRouteInfoByHash(sHash)) {
        return sHash;
      } else {
        throw new Error("No route match for creating a new ".concat(sContextPath.substring(1)));
      }
    }
  };
  return AppStartupHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBcHBTdGFydHVwSGVscGVyIiwiX2dldEtleXNGcm9tU3RhcnR1cFBhcmFtcyIsImFLZXlOYW1lcyIsIm9TdGFydHVwUGFyYW1ldGVycyIsImJBbGxGb3VuZCIsImFLZXlzIiwibWFwIiwibmFtZSIsImxlbmd0aCIsInZhbHVlIiwidW5kZWZpbmVkIiwiX2NyZWF0ZUZpbHRlckZyb21LZXlzIiwiYkRyYWZ0TW9kZSIsIm9NZXRhTW9kZWwiLCJiRmlsdGVyQ2FzZVNlbnNpdGl2ZSIsIk1vZGVsSGVscGVyIiwiaXNGaWx0ZXJpbmdDYXNlU2Vuc2l0aXZlIiwiYkZpbHRlck9uQWN0aXZlRW50aXR5IiwiYUZpbHRlcnMiLCJrZXkiLCJGaWx0ZXIiLCJwYXRoIiwib3BlcmF0b3IiLCJGaWx0ZXJPcGVyYXRvciIsIkVRIiwidmFsdWUxIiwiY2FzZVNlbnNpdGl2ZSIsIm9EcmFmdEZpbHRlciIsImZpbHRlcnMiLCJhbmQiLCJwdXNoIiwiX3JlcXVlc3RPYmplY3RzRnJvbVBhcmFtZXRlcnMiLCJhU3RhcnR1cFBhZ2VzIiwib01vZGVsIiwiYUNvbnRleHRQcm9taXNlcyIsInBhZ2VJbmZvIiwic2VtYW50aWNLZXlzIiwidGVjaG5pY2FsS2V5cyIsIm9GaWx0ZXIiLCJkcmFmdE1vZGUiLCJnZXRNZXRhTW9kZWwiLCJvTGlzdEJpbmQiLCJiaW5kTGlzdCIsImNvbnRleHRQYXRoIiwiam9pbiIsInJlcXVlc3RDb250ZXh0cyIsIlByb21pc2UiLCJhbGwiLCJfZ2V0UmVhY2hhYmxlUGFnZUluZm9Gcm9tUm91dGUiLCJvUm91dGUiLCJvTWFuaWZlc3RSb3V0aW5nIiwic1BhdHRlcm4iLCJwYXR0ZXJuIiwicmVwbGFjZSIsImVuZHNXaXRoIiwic1RhcmdldE5hbWUiLCJBcnJheSIsImlzQXJyYXkiLCJ0YXJnZXQiLCJvVGFyZ2V0IiwidGFyZ2V0cyIsImFQYXR0ZXJuU2VnbWVudHMiLCJzcGxpdCIsInBhZ2VMZXZlbCIsIm9wdGlvbnMiLCJzZXR0aW5ncyIsImFsbG93RGVlcExpbmtpbmciLCJzQ29udGV4dFBhdGgiLCJlbnRpdHlTZXQiLCJvRW50aXR5VHlwZSIsImdldE9iamVjdCIsImFTZW1hbnRpY0tleU5hbWVzIiwiYVNlbWFudGlja0tleXMiLCJzZW1LZXkiLCIkUHJvcGVydHlQYXRoIiwiYVRlY2huaWNhbEtleXMiLCJfZ2V0UmVhY2hhYmxlUGFnZXMiLCJhUm91dGVzIiwicm91dGVzIiwibVBhZ2VzQnlMZXZlbCIsImZvckVhY2giLCJvUGFnZUluZm8iLCJhUmVhY2hhYmxlUGFnZXMiLCJsZXZlbCIsIl9nZXRTdGFydHVwUGFnZXNGcm9tU3RhcnR1cFBhcmFtcyIsInJlc3VsdCIsImN1cnJlbnQiLCJmaW5kUmVjdXJzaXZlIiwiYUN1cnJlbnRMZXZlbFBhZ2VzIiwibGFzdFBhZ2UiLCJuZXh0UGFnZSIsImluZGV4T2YiLCJwb3AiLCJzbGljZSIsIl9nZXREZWVwTGlua09iamVjdCIsImFDb250ZXh0cyIsImNvbnRleHQiLCJoYXNoIiwib0NvbnRleHQiLCJnZXRQYXRoIiwiZ2V0RGVlcExpbmtTdGFydHVwSGFzaCIsInJlcXVlc3RPYmplY3QiLCJ0aGVuIiwiYVZhbHVlcyIsImFGb3VuZENvbnRleHRzIiwiZ2V0Q3JlYXRlU3RhcnR1cEhhc2giLCJvUm91dGVyIiwib0VudGl0eVNldEFubm90YXRpb25zIiwic01ldGFQYXRoIiwiYkNyZWF0YWJsZSIsImJOZXdBY3Rpb25PcGVyYXRpb25BdmFpbGFibGUiLCJvSW5zZXJ0UmVzdHJpY3Rpb25zIiwiSW5zZXJ0YWJsZSIsImdldERlZmF1bHRDcmVhdGVIYXNoIiwic0RlZmF1bHRDcmVhdGVIYXNoIiwicHJlZmVycmVkTW9kZSIsInNIYXNoIiwic3Vic3RyIiwic3Vic3RyaW5nIiwiZ2V0Um91dGVJbmZvQnlIYXNoIiwiRXJyb3IiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkFwcFN0YXJ0dXBIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgUm91dGVyIGZyb20gXCJzYXAvdWkvY29yZS9yb3V0aW5nL1JvdXRlclwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCIuL01vZGVsSGVscGVyXCI7XG5cbnR5cGUgVmFsdWVkS2V5ID0ge1xuXHRuYW1lOiBzdHJpbmc7XG5cdHZhbHVlOiBzdHJpbmc7XG59O1xuXG50eXBlIFBhZ2VJbmZvID0ge1xuXHRwYXR0ZXJuOiBzdHJpbmc7XG5cdGNvbnRleHRQYXRoOiBzdHJpbmc7XG5cdGRyYWZ0TW9kZTogQm9vbGVhbjtcblx0dGVjaG5pY2FsS2V5czogVmFsdWVkS2V5W10gfCB1bmRlZmluZWQ7XG5cdHNlbWFudGljS2V5czogVmFsdWVkS2V5W10gfCB1bmRlZmluZWQ7XG5cdHRhcmdldDogc3RyaW5nO1xuXHRwYWdlTGV2ZWw6IG51bWJlcjtcbn07XG5cbmNvbnN0IEFwcFN0YXJ0dXBIZWxwZXIgPSB7XG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgYSBzZXQgb2Yga2V5IHZhbHVlcyBmcm9tIHN0YXJ0dXAgcGFyYW1ldGVycy5cblx0ICpcblx0ICogQHBhcmFtIGFLZXlOYW1lcyBUaGUgYXJyYXkgb2Yga2V5IG5hbWVzXG5cdCAqIEBwYXJhbSBvU3RhcnR1cFBhcmFtZXRlcnMgVGhlIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHQgKiBAcmV0dXJucyBBbiBhcnJheSBvZiBwYWlycyBcXHtuYW1lLCB2YWx1ZVxcfSBpZiBhbGwga2V5IHZhbHVlcyBjb3VsZCBiZSBmb3VuZCBpbiB0aGUgc3RhcnR1cCBwYXJhbWV0ZXJzLCB1bmRlZmluZWQgb3RoZXJ3aXNlXG5cdCAqL1xuXHRfZ2V0S2V5c0Zyb21TdGFydHVwUGFyYW1zOiBmdW5jdGlvbiAoYUtleU5hbWVzOiBzdHJpbmdbXSwgb1N0YXJ0dXBQYXJhbWV0ZXJzOiBhbnkpOiBWYWx1ZWRLZXlbXSB8IHVuZGVmaW5lZCB7XG5cdFx0bGV0IGJBbGxGb3VuZCA9IHRydWU7XG5cdFx0Y29uc3QgYUtleXMgPSBhS2V5TmFtZXMubWFwKChuYW1lKSA9PiB7XG5cdFx0XHRpZiAob1N0YXJ0dXBQYXJhbWV0ZXJzW25hbWVdICYmIG9TdGFydHVwUGFyYW1ldGVyc1tuYW1lXS5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0cmV0dXJuIHsgbmFtZSwgdmFsdWU6IG9TdGFydHVwUGFyYW1ldGVyc1tuYW1lXVswXSBhcyBzdHJpbmcgfTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIEEgdW5pcXVlIGtleSB2YWx1ZSBjb3VsZG4ndCBiZSBmb3VuZCBpbiB0aGUgc3RhcnR1cCBwYXJhbWV0ZXJzXG5cdFx0XHRcdGJBbGxGb3VuZCA9IGZhbHNlO1xuXHRcdFx0XHRyZXR1cm4geyBuYW1lLCB2YWx1ZTogXCJcIiB9O1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGJBbGxGb3VuZCA/IGFLZXlzIDogdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgZmlsdGVyIGZyb20gYSBsaXN0IG9mIGtleSB2YWx1ZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBhS2V5cyBBcnJheSBvZiBzZW1hbnRpYyBrZXlzIG9yIHRlY2huaWNhbCBrZXlzICh3aXRoIHZhbHVlcylcblx0ICogQHBhcmFtIGJEcmFmdE1vZGUgVHJ1ZSBpZiB0aGUgZW50aXR5IHN1cHBvcnRzIGRyYWZ0IG1vZGVcblx0ICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIG1ldGFtb2RlbFxuXHQgKiBAcmV0dXJucyBUaGUgZmlsdGVyXG5cdCAqL1xuXHRfY3JlYXRlRmlsdGVyRnJvbUtleXM6IGZ1bmN0aW9uIChhS2V5czogVmFsdWVkS2V5W10sIGJEcmFmdE1vZGU6IEJvb2xlYW4sIG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKTogRmlsdGVyIHtcblx0XHRjb25zdCBiRmlsdGVyQ2FzZVNlbnNpdGl2ZSA9IE1vZGVsSGVscGVyLmlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZShvTWV0YU1vZGVsKTtcblxuXHRcdGxldCBiRmlsdGVyT25BY3RpdmVFbnRpdHkgPSBmYWxzZTtcblx0XHRjb25zdCBhRmlsdGVycyA9IGFLZXlzLm1hcCgoa2V5KSA9PiB7XG5cdFx0XHRpZiAoa2V5Lm5hbWUgPT09IFwiSXNBY3RpdmVFbnRpdHlcIikge1xuXHRcdFx0XHRiRmlsdGVyT25BY3RpdmVFbnRpdHkgPSB0cnVlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRwYXRoOiBrZXkubmFtZSxcblx0XHRcdFx0b3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLkVRLFxuXHRcdFx0XHR2YWx1ZTE6IGtleS52YWx1ZSxcblx0XHRcdFx0Y2FzZVNlbnNpdGl2ZTogYkZpbHRlckNhc2VTZW5zaXRpdmVcblx0XHRcdH0pO1xuXHRcdH0pO1xuXHRcdGlmIChiRHJhZnRNb2RlICYmICFiRmlsdGVyT25BY3RpdmVFbnRpdHkpIHtcblx0XHRcdGNvbnN0IG9EcmFmdEZpbHRlciA9IG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRmaWx0ZXJzOiBbbmV3IEZpbHRlcihcIklzQWN0aXZlRW50aXR5XCIsIFwiRVFcIiwgZmFsc2UpLCBuZXcgRmlsdGVyKFwiU2libGluZ0VudGl0eS9Jc0FjdGl2ZUVudGl0eVwiLCBcIkVRXCIsIG51bGwpXSxcblx0XHRcdFx0YW5kOiBmYWxzZVxuXHRcdFx0fSk7XG5cdFx0XHRhRmlsdGVycy5wdXNoKG9EcmFmdEZpbHRlcik7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ldyBGaWx0ZXIoYUZpbHRlcnMsIHRydWUpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBMb2FkcyBhbGwgY29udGV4dHMgZm9yIGEgbGlzdCBvZiBwYWdlIGluZm9zLlxuXHQgKlxuXHQgKiBAcGFyYW0gYVN0YXJ0dXBQYWdlcyBUaGUgbGlzdCBvZiBwYWdlIGluZm9zXG5cdCAqIEBwYXJhbSBvTW9kZWwgVGhlIG1vZGVsIHVzZWQgdG8gbG9hZCB0aGUgY29udGV4dHNcblx0ICogQHJldHVybnMgQSBQcm9taXNlIGZvciBhbGwgY29udGV4dHNcblx0ICovXG5cdF9yZXF1ZXN0T2JqZWN0c0Zyb21QYXJhbWV0ZXJzOiBmdW5jdGlvbiAoYVN0YXJ0dXBQYWdlczogUGFnZUluZm9bXSwgb01vZGVsOiBPRGF0YU1vZGVsKTogUHJvbWlzZTxDb250ZXh0W11bXT4ge1xuXHRcdC8vIExvYWQgdGhlIHJlc3BlY3RpdmUgb2JqZWN0cyBmb3IgYWxsIG9iamVjdCBwYWdlcyBmb3VuZCBpbiBhRXh0ZXJuYWxseU5hdmlnYWJsZVBhZ2VzXG5cdFx0Y29uc3QgYUNvbnRleHRQcm9taXNlcyA9IGFTdGFydHVwUGFnZXMubWFwKChwYWdlSW5mbykgPT4ge1xuXHRcdFx0Y29uc3QgYUtleXMgPSBwYWdlSW5mby5zZW1hbnRpY0tleXMgfHwgcGFnZUluZm8udGVjaG5pY2FsS2V5cyB8fCBbXTtcblx0XHRcdGNvbnN0IG9GaWx0ZXIgPSB0aGlzLl9jcmVhdGVGaWx0ZXJGcm9tS2V5cyhhS2V5cywgcGFnZUluZm8uZHJhZnRNb2RlLCBvTW9kZWwuZ2V0TWV0YU1vZGVsKCkpO1xuXG5cdFx0XHQvLyBvbmx5IHJlcXVlc3QgYSBtaW5pbXVtIG9mIGZpZWxkcyB0byBib29zdCBiYWNrZW5kIHBlcmZvcm1hbmNlIHNpbmNlIHRoaXMgaXMgb25seSB1c2VkIHRvIGNoZWNrIGlmIGFuIG9iamVjdCBleGlzdHNcblx0XHRcdGNvbnN0IG9MaXN0QmluZCA9IG9Nb2RlbC5iaW5kTGlzdChwYWdlSW5mby5jb250ZXh0UGF0aCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIG9GaWx0ZXIsIHtcblx0XHRcdFx0XCIkc2VsZWN0XCI6IGFLZXlzXG5cdFx0XHRcdFx0Lm1hcCgoa2V5KSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ga2V5Lm5hbWU7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuam9pbihcIixcIilcblx0XHRcdH0gYXMgYW55KTtcblx0XHRcdHJldHVybiBvTGlzdEJpbmQucmVxdWVzdENvbnRleHRzKDAsIDIpO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIFByb21pc2UuYWxsKGFDb250ZXh0UHJvbWlzZXMpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGVzIGEgUGFnZUluZm8gZnJvbSBhIHJvdXRlIGlmIGl0J3MgcmVhY2hhYmxlIGZyb20gdGhlIHN0YXJ0dXAgcGFyYW1ldGVycy5cblx0ICpcblx0ICogQHBhcmFtIG9Sb3V0ZSBUaGUgcm91dGVcblx0ICogQHBhcmFtIG9NYW5pZmVzdFJvdXRpbmcgVGhlIGFwcCBtYW5pZmVzdCByb3V0aW5nIHNlY3Rpb25cblx0ICogQHBhcmFtIG9TdGFydHVwUGFyYW1ldGVycyBUaGUgc3RhcnR1cCBwYXJhbWV0ZXJzXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBhcHAgbWV0YW1vZGVsXG5cdCAqIEByZXR1cm5zIEEgcGFnZSBpbmZvIGlmIHRoZSBwYWdlIGlzIHJlYWNoYWJsZSwgdW5kZWZpbmVkIG90aGVyd2lzZVxuXHQgKi9cblx0X2dldFJlYWNoYWJsZVBhZ2VJbmZvRnJvbVJvdXRlOiBmdW5jdGlvbiAoXG5cdFx0b1JvdXRlOiBhbnksXG5cdFx0b01hbmlmZXN0Um91dGluZzogYW55LFxuXHRcdG9TdGFydHVwUGFyYW1ldGVyczogYW55LFxuXHRcdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsXG5cdCk6IFBhZ2VJbmZvIHwgdW5kZWZpbmVkIHtcblx0XHQvLyBSZW1vdmUgdHJhaWxpbmcgJzo/cXVlcnk6JyBhbmQgJy8nXG5cdFx0bGV0IHNQYXR0ZXJuOiBzdHJpbmcgPSBvUm91dGUucGF0dGVybi5yZXBsYWNlKFwiOj9xdWVyeTpcIiwgXCJcIik7XG5cdFx0c1BhdHRlcm4gPSBzUGF0dGVybi5yZXBsYWNlKC9cXC8kLywgXCJcIik7XG5cblx0XHRpZiAoIXNQYXR0ZXJuIHx8ICFzUGF0dGVybi5lbmRzV2l0aChcIilcIikpIHtcblx0XHRcdC8vIElnbm9yZSBsZXZlbC0wIHJvdXRlcyAoTGlzdFJlcG9ydCkgb3Igcm91dGVzIGNvcnJlc3BvbmRpbmcgdG8gYSAxLTEgcmVsYXRpb24gKG5vIGtleXMgaW4gdGhlIFVSTCBpbiB0aGlzIGNhc2UpXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdHNQYXR0ZXJuID0gc1BhdHRlcm4ucmVwbGFjZSgvXFwoXFx7W15cXH1dKlxcfVxcKS9nLCBcIigjKVwiKTsgLy8gUmVwbGFjZSBrZXlzIHdpdGggI1xuXG5cdFx0Ly8gR2V0IHRoZSByaWdodG1vc3QgdGFyZ2V0IGZvciB0aGlzIHJvdXRlXG5cdFx0Y29uc3Qgc1RhcmdldE5hbWU6IHN0cmluZyA9IEFycmF5LmlzQXJyYXkob1JvdXRlLnRhcmdldCkgPyBvUm91dGUudGFyZ2V0W29Sb3V0ZS50YXJnZXQubGVuZ3RoIC0gMV0gOiBvUm91dGUudGFyZ2V0O1xuXHRcdGNvbnN0IG9UYXJnZXQgPSBvTWFuaWZlc3RSb3V0aW5nLnRhcmdldHNbc1RhcmdldE5hbWVdO1xuXG5cdFx0Y29uc3QgYVBhdHRlcm5TZWdtZW50cyA9IHNQYXR0ZXJuLnNwbGl0KFwiL1wiKTtcblx0XHRjb25zdCBwYWdlTGV2ZWwgPSBhUGF0dGVyblNlZ21lbnRzLmxlbmd0aCAtIDE7XG5cblx0XHRpZiAocGFnZUxldmVsICE9PSAwICYmIG9UYXJnZXQ/Lm9wdGlvbnM/LnNldHRpbmdzPy5hbGxvd0RlZXBMaW5raW5nICE9PSB0cnVlKSB7XG5cdFx0XHQvLyBUaGUgZmlyc3QgbGV2ZWwgb2Ygb2JqZWN0IHBhZ2UgYWxsb3dzIGRlZXAgbGlua2luZyBieSBkZWZhdWx0LlxuXHRcdFx0Ly8gT3RoZXJ3aXNlLCB0aGUgdGFyZ2V0IG11c3QgYWxsb3cgZGVlcCBsaW5raW5nIGV4cGxpY2l0ZWx5IGluIHRoZSBtYW5pZmVzdFxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHRjb25zdCBzQ29udGV4dFBhdGg6IHN0cmluZyA9XG5cdFx0XHRvVGFyZ2V0Lm9wdGlvbnMuc2V0dGluZ3MuY29udGV4dFBhdGggfHwgKG9UYXJnZXQub3B0aW9ucy5zZXR0aW5ncy5lbnRpdHlTZXQgJiYgYC8ke29UYXJnZXQub3B0aW9ucy5zZXR0aW5ncy5lbnRpdHlTZXR9YCk7XG5cdFx0Y29uc3Qgb0VudGl0eVR5cGUgPSBzQ29udGV4dFBhdGggJiYgb01ldGFNb2RlbC5nZXRPYmplY3QoYC8kRW50aXR5Q29udGFpbmVyJHtzQ29udGV4dFBhdGh9L2ApO1xuXG5cdFx0aWYgKCFvRW50aXR5VHlwZSkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvLyBHZXQgdGhlIHNlbWFudGljIGtleSB2YWx1ZXMgZm9yIHRoZSBlbnRpdHlcblx0XHRjb25zdCBhU2VtYW50aWNLZXlOYW1lczogYW55ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYC8kRW50aXR5Q29udGFpbmVyJHtzQ29udGV4dFBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNLZXlgKTtcblxuXHRcdGNvbnN0IGFTZW1hbnRpY2tLZXlzID0gYVNlbWFudGljS2V5TmFtZXNcblx0XHRcdD8gdGhpcy5fZ2V0S2V5c0Zyb21TdGFydHVwUGFyYW1zKFxuXHRcdFx0XHRcdGFTZW1hbnRpY0tleU5hbWVzLm1hcCgoc2VtS2V5OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdHJldHVybiBzZW1LZXkuJFByb3BlcnR5UGF0aCBhcyBzdHJpbmc7XG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzXG5cdFx0XHQgIClcblx0XHRcdDogdW5kZWZpbmVkO1xuXG5cdFx0Ly8gR2V0IHRoZSB0ZWNobmljYWwga2V5cyBvbmx5IGlmIHdlIGNvdWxkbid0IGZpbmQgdGhlIHNlbWFudGljIGtleSB2YWx1ZXMsIGFuZCBvbiBmaXJzdCBsZXZlbCBPUFxuXHRcdGNvbnN0IGFUZWNobmljYWxLZXlzID1cblx0XHRcdCFhU2VtYW50aWNrS2V5cyAmJiBwYWdlTGV2ZWwgPT09IDAgPyB0aGlzLl9nZXRLZXlzRnJvbVN0YXJ0dXBQYXJhbXMob0VudGl0eVR5cGVbXCIkS2V5XCJdLCBvU3RhcnR1cFBhcmFtZXRlcnMpIDogdW5kZWZpbmVkO1xuXG5cdFx0aWYgKGFTZW1hbnRpY2tLZXlzID09PSB1bmRlZmluZWQgJiYgYVRlY2huaWNhbEtleXMgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Ly8gV2UgY291bGRuJ3QgZmluZCB0aGUgc2VtYW50aWMvdGVjaG5pY2FsIGtleXMgaW4gdGhlIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cblx0XHQvLyBUaGUgc3RhcnR1cCBwYXJhbWV0ZXJzIGNvbnRhaW4gdmFsdWVzIGZvciBhbGwgc2VtYW50aWMga2V5cyAob3IgdGVjaG5pY2FsIGtleXMpIC0tPiB3ZSBjYW4gc3RvcmUgdGhlIHBhZ2UgaW5mbyBpbiB0aGUgY29ycmVzcG9uZGluZyBsZXZlbFxuXHRcdGNvbnN0IGRyYWZ0TW9kZSA9XG5cdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgLyRFbnRpdHlDb250YWluZXIke3NDb250ZXh0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdGApIHx8XG5cdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgLyRFbnRpdHlDb250YWluZXIke3NDb250ZXh0UGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Tm9kZWApXG5cdFx0XHRcdD8gdHJ1ZVxuXHRcdFx0XHQ6IGZhbHNlO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHBhdHRlcm46IHNQYXR0ZXJuLFxuXHRcdFx0Y29udGV4dFBhdGg6IHNDb250ZXh0UGF0aCxcblx0XHRcdGRyYWZ0TW9kZSxcblx0XHRcdHRlY2huaWNhbEtleXM6IGFUZWNobmljYWxLZXlzLFxuXHRcdFx0c2VtYW50aWNLZXlzOiBhU2VtYW50aWNrS2V5cyxcblx0XHRcdHRhcmdldDogc1RhcmdldE5hbWUsXG5cdFx0XHRwYWdlTGV2ZWxcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBsaXN0IG9mIGFsbCBwYWdlcyB0aGF0IGFsbG93IGRlZXBsaW5rIGFuZCB0aGF0IGNhbiBiZSByZWFjaGVkIHVzaW5nIHRoZSBzdGFydHVwIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvTWFuaWZlc3RSb3V0aW5nIFRoZSByb3V0aW5nIGluZm9ybWF0aW9uIGZyb20gdGhlIGFwcCBtYW5pZmVzdFxuXHQgKiBAcGFyYW0gb1N0YXJ0dXBQYXJhbWV0ZXJzIFRoZSBzdGFydHVwIHBhcmFtZXRlcnNcblx0ICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIG1ldGFtb2RlbFxuXHQgKiBAcmV0dXJucyBUaGUgcmVhY2hhYmxlIHBhZ2VzXG5cdCAqL1xuXHRfZ2V0UmVhY2hhYmxlUGFnZXM6IGZ1bmN0aW9uIChvTWFuaWZlc3RSb3V0aW5nOiBhbnksIG9TdGFydHVwUGFyYW1ldGVyczogYW55LCBvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCk6IFBhZ2VJbmZvW11bXSB7XG5cdFx0Y29uc3QgYVJvdXRlczogYW55W10gPSBvTWFuaWZlc3RSb3V0aW5nLnJvdXRlcztcblx0XHRjb25zdCBtUGFnZXNCeUxldmVsOiBSZWNvcmQ8bnVtYmVyLCBQYWdlSW5mb1tdPiA9IHt9O1xuXG5cdFx0YVJvdXRlcy5mb3JFYWNoKChvUm91dGUpID0+IHtcblx0XHRcdGNvbnN0IG9QYWdlSW5mbyA9IHRoaXMuX2dldFJlYWNoYWJsZVBhZ2VJbmZvRnJvbVJvdXRlKG9Sb3V0ZSwgb01hbmlmZXN0Um91dGluZywgb1N0YXJ0dXBQYXJhbWV0ZXJzLCBvTWV0YU1vZGVsKTtcblxuXHRcdFx0aWYgKG9QYWdlSW5mbykge1xuXHRcdFx0XHRpZiAoIW1QYWdlc0J5TGV2ZWxbb1BhZ2VJbmZvLnBhZ2VMZXZlbF0pIHtcblx0XHRcdFx0XHRtUGFnZXNCeUxldmVsW29QYWdlSW5mby5wYWdlTGV2ZWxdID0gW107XG5cdFx0XHRcdH1cblx0XHRcdFx0bVBhZ2VzQnlMZXZlbFtvUGFnZUluZm8ucGFnZUxldmVsXS5wdXNoKG9QYWdlSW5mbyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cblx0XHQvLyBBIHBhZ2UgaXMgcmVhY2hhYmxlIG9ubHkgaWYgYWxsIGl0cyBwYXJlbnRzIGFyZSBhbHNvIHJlYWNoYWJsZVxuXHRcdC8vIFNvIGlmIHdlIGNvdWxkbid0IGZpbmQgYW55IHBhZ2VzIGZvciBhIGdpdmVuIGxldmVsLCBhbGwgcGFnZXMgd2l0aCBhIGhpZ2hlciBsZXZlbCB3b24ndCBiZSByZWFjaGFibGUgYW55d2F5XG5cdFx0Y29uc3QgYVJlYWNoYWJsZVBhZ2VzOiBQYWdlSW5mb1tdW10gPSBbXTtcblx0XHRsZXQgbGV2ZWwgPSAwO1xuXHRcdHdoaWxlIChtUGFnZXNCeUxldmVsW2xldmVsXSkge1xuXHRcdFx0YVJlYWNoYWJsZVBhZ2VzLnB1c2gobVBhZ2VzQnlMZXZlbFtsZXZlbF0pO1xuXHRcdFx0bGV2ZWwrKztcblx0XHR9XG5cblx0XHRyZXR1cm4gYVJlYWNoYWJsZVBhZ2VzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGxpc3Qgb2Ygc3RhcnR1cCBwYWdlcy5cblx0ICpcblx0ICogQHBhcmFtIG9NYW5pZmVzdFJvdXRpbmcgVGhlIHJvdXRpbmcgaW5mb3JtYXRpb24gZnJvbSB0aGUgYXBwIG1hbmlmZXN0XG5cdCAqIEBwYXJhbSBvU3RhcnR1cFBhcmFtZXRlcnMgVGhlIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHQgKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgbWV0YW1vZGVsXG5cdCAqIEByZXR1cm5zIEFuIGFycmF5IG9mIHN0YXJ0dXAgcGFnZSBpbmZvc1xuXHQgKi9cblx0X2dldFN0YXJ0dXBQYWdlc0Zyb21TdGFydHVwUGFyYW1zOiBmdW5jdGlvbiAob01hbmlmZXN0Um91dGluZzogYW55LCBvU3RhcnR1cFBhcmFtZXRlcnM6IGFueSwgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpOiBQYWdlSW5mb1tdIHtcblx0XHQvLyBGaW5kIGFsbCBwYWdlcyB0aGF0IGNhbiBiZSByZWFjaGVkIHdpdGggdGhlIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHRcdGNvbnN0IGFSZWFjaGFibGVQYWdlcyA9IHRoaXMuX2dldFJlYWNoYWJsZVBhZ2VzKG9NYW5pZmVzdFJvdXRpbmcsIG9TdGFydHVwUGFyYW1ldGVycywgb01ldGFNb2RlbCk7XG5cblx0XHRpZiAoYVJlYWNoYWJsZVBhZ2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIFtdO1xuXHRcdH1cblxuXHRcdC8vIEZpbmQgdGhlIGxvbmdlc3Qgc2VxdWVuY2Ugb2YgcGFnZXMgdGhhdCBjYW4gYmUgcmVhY2hlZCAocmVjdXJzaXZlbHkpXG5cdFx0bGV0IHJlc3VsdDogUGFnZUluZm9bXSA9IFtdO1xuXHRcdGNvbnN0IGN1cnJlbnQ6IFBhZ2VJbmZvW10gPSBbXTtcblxuXHRcdGZ1bmN0aW9uIGZpbmRSZWN1cnNpdmUobGV2ZWw6IG51bWJlcikge1xuXHRcdFx0Y29uc3QgYUN1cnJlbnRMZXZlbFBhZ2VzID0gYVJlYWNoYWJsZVBhZ2VzW2xldmVsXTtcblx0XHRcdGNvbnN0IGxhc3RQYWdlID0gY3VycmVudC5sZW5ndGggPyBjdXJyZW50W2N1cnJlbnQubGVuZ3RoIC0gMV0gOiB1bmRlZmluZWQ7XG5cblx0XHRcdGlmIChhQ3VycmVudExldmVsUGFnZXMpIHtcblx0XHRcdFx0YUN1cnJlbnRMZXZlbFBhZ2VzLmZvckVhY2goZnVuY3Rpb24gKG5leHRQYWdlKSB7XG5cdFx0XHRcdFx0aWYgKCFsYXN0UGFnZSB8fCBuZXh0UGFnZS5wYXR0ZXJuLmluZGV4T2YobGFzdFBhZ2UucGF0dGVybikgPT09IDApIHtcblx0XHRcdFx0XHRcdC8vIFdlIG9ubHkgY29uc2lkZXIgcGFnZXMgdGhhdCBjYW4gYmUgcmVhY2hlZCBmcm9tIHRoZSBwYWdlIGF0IHRoZSBwcmV2aW91cyBsZXZlbCxcblx0XHRcdFx0XHRcdC8vIC0tPiB0aGVpciBwYXR0ZXJuIG11c3QgYmUgdGhlIHBhdHRlcm4gb2YgdGhlIHByZXZpb3VzIHBhZ2Ugd2l0aCBhbm90aGVyIHNlZ21lbnQgYXBwZW5kZWRcblx0XHRcdFx0XHRcdGN1cnJlbnQucHVzaChuZXh0UGFnZSk7XG5cdFx0XHRcdFx0XHRmaW5kUmVjdXJzaXZlKGxldmVsICsgMSk7XG5cdFx0XHRcdFx0XHRjdXJyZW50LnBvcCgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoY3VycmVudC5sZW5ndGggPiByZXN1bHQubGVuZ3RoKSB7XG5cdFx0XHRcdHJlc3VsdCA9IGN1cnJlbnQuc2xpY2UoKTsgLy8gV2UgaGF2ZSBmb3VuZCBhIHNlcXVlbmNlIGxvbmdlciB0aGFuIG91ciBwcmV2aW91cyBiZXN0IC0tPiBzdG9yZSBpdCBhcyB0aGUgbmV3IGxvbmdlc3Rcblx0XHRcdH1cblx0XHR9XG5cblx0XHRmaW5kUmVjdXJzaXZlKDApO1xuXG5cdFx0cmV0dXJuIHJlc3VsdDtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlcyB0aGUgc3RhcnR1cCBvYmplY3QgZnJvbSB0aGUgbGlzdCBvZiBwYWdlcyBhbmQgY29udGV4dHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBhU3RhcnR1cFBhZ2VzIFRoZSBwYWdlc1xuXHQgKiBAcGFyYW0gYUNvbnRleHRzIFRoZSBjb250ZXh0c1xuXHQgKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyBlaXRoZXIgYSBoYXNoIG9yIGEgY29udGV4dCB0byBuYXZpZ2F0ZSB0bywgb3IgYW4gZW1wdHkgb2JqZWN0IGlmIG5vIGRlZXAgbGluayB3YXMgZm91bmRcblx0ICovXG5cdF9nZXREZWVwTGlua09iamVjdDogZnVuY3Rpb24gKGFTdGFydHVwUGFnZXM6IFBhZ2VJbmZvW10sIGFDb250ZXh0czogQ29udGV4dFtdKTogeyBoYXNoPzogc3RyaW5nOyBjb250ZXh0PzogQ29udGV4dCB9IHtcblx0XHRpZiAoYUNvbnRleHRzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0cmV0dXJuIHsgY29udGV4dDogYUNvbnRleHRzWzBdIH07XG5cdFx0fSBlbHNlIGlmIChhQ29udGV4dHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Ly8gTmF2aWdhdGlvbiB0byBhIGRlZXBlciBsZXZlbCAtLT4gdXNlIHRoZSBwYXR0ZXJuIG9mIHRoZSBkZWVwZXN0IG9iamVjdCBwYWdlXG5cdFx0XHQvLyBhbmQgcmVwbGFjZSB0aGUgcGFyYW1ldGVycyBieSB0aGUgSUQgZnJvbSB0aGUgY29udGV4dHNcblx0XHRcdGxldCBoYXNoID0gYVN0YXJ0dXBQYWdlc1thU3RhcnR1cFBhZ2VzLmxlbmd0aCAtIDFdLnBhdHRlcm47XG5cdFx0XHRhQ29udGV4dHMuZm9yRWFjaChmdW5jdGlvbiAob0NvbnRleHQpIHtcblx0XHRcdFx0aGFzaCA9IGhhc2gucmVwbGFjZShcIigjKVwiLCBgKCR7b0NvbnRleHQuZ2V0UGF0aCgpLnNwbGl0KFwiKFwiKVsxXX1gKTtcblx0XHRcdH0pO1xuXG5cdFx0XHRyZXR1cm4geyBoYXNoIH07XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB7fTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgc3RhcnR1cCBwYXJhbWV0ZXJzIGZvciBhIGRlZXBsaW5rIGNhc2UsIGZyb20gc3RhcnR1cCBwYXJhbWV0ZXJzIGFuZCByb3V0aW5nIGluZm9pcm1hdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIG9NYW5pZmVzdFJvdXRpbmcgVGhlIHJvdXRpbmcgaW5mb3JtYXRpb24gZnJvbSB0aGUgYXBwIG1hbmlmZXN0XG5cdCAqIEBwYXJhbSBvU3RhcnR1cFBhcmFtZXRlcnMgVGhlIHN0YXJ0dXAgcGFyYW1ldGVyc1xuXHQgKiBAcGFyYW0gb01vZGVsIFRoZSBPRGF0YSBtb2RlbFxuXHQgKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyBlaXRoZXIgYSBoYXNoIG9yIGEgY29udGV4dCB0byBuYXZpZ2F0ZSB0bywgb3IgYW4gZW1wdHkgb2JqZWN0IGlmIG5vIGRlZXAgbGluayB3YXMgZm91bmRcblx0ICovXG5cdGdldERlZXBMaW5rU3RhcnR1cEhhc2g6IGZ1bmN0aW9uIChcblx0XHRvTWFuaWZlc3RSb3V0aW5nOiBhbnksXG5cdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzOiBhbnksXG5cdFx0b01vZGVsOiBPRGF0YU1vZGVsXG5cdCk6IFByb21pc2U8eyBoYXNoPzogc3RyaW5nOyBjb250ZXh0PzogQ29udGV4dCB9PiB7XG5cdFx0bGV0IGFTdGFydHVwUGFnZXM6IFBhZ2VJbmZvW107XG5cblx0XHRyZXR1cm4gb01vZGVsXG5cdFx0XHQuZ2V0TWV0YU1vZGVsKClcblx0XHRcdC5yZXF1ZXN0T2JqZWN0KFwiLyRFbnRpdHlDb250YWluZXIvXCIpXG5cdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdC8vIENoZWNrIGlmIHNlbWFudGljIGtleXMgYXJlIHByZXNlbnQgaW4gdXJsIHBhcmFtZXRlcnMgZm9yIGV2ZXJ5IG9iamVjdCBwYWdlIGF0IGVhY2ggbGV2ZWxcblx0XHRcdFx0YVN0YXJ0dXBQYWdlcyA9IHRoaXMuX2dldFN0YXJ0dXBQYWdlc0Zyb21TdGFydHVwUGFyYW1zKG9NYW5pZmVzdFJvdXRpbmcsIG9TdGFydHVwUGFyYW1ldGVycywgb01vZGVsLmdldE1ldGFNb2RlbCgpKTtcblxuXHRcdFx0XHRyZXR1cm4gdGhpcy5fcmVxdWVzdE9iamVjdHNGcm9tUGFyYW1ldGVycyhhU3RhcnR1cFBhZ2VzLCBvTW9kZWwpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKChhVmFsdWVzOiBDb250ZXh0W11bXSkgPT4ge1xuXHRcdFx0XHRpZiAoYVZhbHVlcy5sZW5ndGgpIHtcblx0XHRcdFx0XHQvLyBNYWtlIHN1cmUgd2Ugb25seSBnZXQgMSBjb250ZXh0IHBlciBwcm9taXNlLCBhbmQgZmxhdHRlbiB0aGUgYXJyYXlcblx0XHRcdFx0XHRjb25zdCBhQ29udGV4dHM6IENvbnRleHRbXSA9IFtdO1xuXHRcdFx0XHRcdGFWYWx1ZXMuZm9yRWFjaChmdW5jdGlvbiAoYUZvdW5kQ29udGV4dHMpIHtcblx0XHRcdFx0XHRcdGlmIChhRm91bmRDb250ZXh0cy5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0XHRcdFx0YUNvbnRleHRzLnB1c2goYUZvdW5kQ29udGV4dHNbMF0pO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0cmV0dXJuIGFDb250ZXh0cy5sZW5ndGggPT09IGFWYWx1ZXMubGVuZ3RoID8gdGhpcy5fZ2V0RGVlcExpbmtPYmplY3QoYVN0YXJ0dXBQYWdlcywgYUNvbnRleHRzKSA6IHt9O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHJldHVybiB7fTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgdGhlIG5ldyBoYXNoIGJhc2VkIG9uIHRoZSBzdGFydHVwIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvU3RhcnR1cFBhcmFtZXRlcnMgVGhlIHN0YXJ0dXAgcGFyYW1ldGVyIHZhbHVlcyAobWFwIHBhcmFtZXRlciBuYW1lIC0+IGFycmF5IG9mIHZhbHVlcylcblx0ICogQHBhcmFtIHNDb250ZXh0UGF0aCBUaGUgY29udGV4dCBwYXRoIGZvciB0aGUgc3RhcnR1cCBvZiB0aGUgYXBwIChnZW5lcmFsbHkgdGhlIHBhdGggdG8gdGhlIG1haW4gZW50aXR5IHNldClcblx0ICogQHBhcmFtIG9Sb3V0ZXIgVGhlIHJvdXRlciBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgbWV0YSBtb2RlbFxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgY29udGFpbmluZyB0aGUgaGFzaCB0byBuYXZpZ2F0ZSB0bywgb3IgYW4gZW1wdHkgc3RyaW5nIGlmIHRoZXJlJ3Mgbm8gbmVlZCB0byBuYXZpZ2F0ZVxuXHQgKi9cblx0Z2V0Q3JlYXRlU3RhcnR1cEhhc2g6IGZ1bmN0aW9uIChcblx0XHRvU3RhcnR1cFBhcmFtZXRlcnM6IGFueSxcblx0XHRzQ29udGV4dFBhdGg6IHN0cmluZyxcblx0XHRvUm91dGVyOiBSb3V0ZXIsXG5cdFx0b01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWxcblx0KTogUHJvbWlzZTxTdHJpbmc+IHtcblx0XHRyZXR1cm4gb01ldGFNb2RlbC5yZXF1ZXN0T2JqZWN0KGAke3NDb250ZXh0UGF0aH1AYCkudGhlbigob0VudGl0eVNldEFubm90YXRpb25zOiBhbnkpID0+IHtcblx0XHRcdGxldCBzTWV0YVBhdGggPSBcIlwiO1xuXHRcdFx0bGV0IGJDcmVhdGFibGUgPSB0cnVlO1xuXG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9FbnRpdHlTZXRBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCJdICYmXG5cdFx0XHRcdG9FbnRpdHlTZXRBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCJdW1wiTmV3QWN0aW9uXCJdXG5cdFx0XHQpIHtcblx0XHRcdFx0c01ldGFQYXRoID0gYCR7c0NvbnRleHRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290L05ld0FjdGlvbkBPcmcuT0RhdGEuQ29yZS5WMS5PcGVyYXRpb25BdmFpbGFibGVgO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0b0VudGl0eVNldEFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZFwiXSAmJlxuXHRcdFx0XHRvRW50aXR5U2V0QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkXCJdW1wiTmV3QWN0aW9uXCJdXG5cdFx0XHQpIHtcblx0XHRcdFx0c01ldGFQYXRoID0gYCR7c0NvbnRleHRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxLlN0aWNreVNlc3Npb25TdXBwb3J0ZWQvTmV3QWN0aW9uQE9yZy5PRGF0YS5Db3JlLlYxLk9wZXJhdGlvbkF2YWlsYWJsZWA7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChzTWV0YVBhdGgpIHtcblx0XHRcdFx0Y29uc3QgYk5ld0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNNZXRhUGF0aCk7XG5cdFx0XHRcdGlmIChiTmV3QWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdGJDcmVhdGFibGUgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3Qgb0luc2VydFJlc3RyaWN0aW9ucyA9IG9FbnRpdHlTZXRBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkluc2VydFJlc3RyaWN0aW9uc1wiXTtcblx0XHRcdFx0aWYgKG9JbnNlcnRSZXN0cmljdGlvbnMgJiYgb0luc2VydFJlc3RyaWN0aW9ucy5JbnNlcnRhYmxlID09PSBmYWxzZSkge1xuXHRcdFx0XHRcdGJDcmVhdGFibGUgPSBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0aWYgKGJDcmVhdGFibGUpIHtcblx0XHRcdFx0cmV0dXJuIHRoaXMuZ2V0RGVmYXVsdENyZWF0ZUhhc2gob1N0YXJ0dXBQYXJhbWV0ZXJzLCBzQ29udGV4dFBhdGgsIG9Sb3V0ZXIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGN1bGF0ZXMgdGhlIGhhc2ggdG8gY3JlYXRlIGEgbmV3IG9iamVjdC5cblx0ICpcblx0ICogQHBhcmFtIG9TdGFydHVwUGFyYW1ldGVycyBUaGUgc3RhcnR1cCBwYXJhbWV0ZXIgdmFsdWVzIChtYXAgcGFyYW1ldGVyIG5hbWUgLT4gYXJyYXkgb2YgdmFsdWVzKVxuXHQgKiBAcGFyYW0gc0NvbnRleHRQYXRoIFRoZSBjb250ZXh0IHBhdGggb2YgdGhlIGVudGl0eSBzZXQgdG8gYmUgdXNlZCBmb3IgdGhlIGNyZWF0aW9uXG5cdCAqIEBwYXJhbSBvUm91dGVyIFRoZSByb3V0ZXIgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgVGhlIGhhc2hcblx0ICovXG5cdGdldERlZmF1bHRDcmVhdGVIYXNoOiBmdW5jdGlvbiAob1N0YXJ0dXBQYXJhbWV0ZXJzOiBhbnksIHNDb250ZXh0UGF0aDogc3RyaW5nLCBvUm91dGVyOiBSb3V0ZXIpOiBzdHJpbmcge1xuXHRcdGxldCBzRGVmYXVsdENyZWF0ZUhhc2ggPVxuXHRcdFx0b1N0YXJ0dXBQYXJhbWV0ZXJzICYmIG9TdGFydHVwUGFyYW1ldGVycy5wcmVmZXJyZWRNb2RlID8gKG9TdGFydHVwUGFyYW1ldGVycy5wcmVmZXJyZWRNb2RlWzBdIGFzIHN0cmluZykgOiBcImNyZWF0ZVwiO1xuXHRcdGxldCBzSGFzaCA9IFwiXCI7XG5cblx0XHRzRGVmYXVsdENyZWF0ZUhhc2ggPVxuXHRcdFx0c0RlZmF1bHRDcmVhdGVIYXNoLmluZGV4T2YoXCI6XCIpICE9PSAtMSAmJiBzRGVmYXVsdENyZWF0ZUhhc2gubGVuZ3RoID4gc0RlZmF1bHRDcmVhdGVIYXNoLmluZGV4T2YoXCI6XCIpICsgMVxuXHRcdFx0XHQ/IHNEZWZhdWx0Q3JlYXRlSGFzaC5zdWJzdHIoMCwgc0RlZmF1bHRDcmVhdGVIYXNoLmluZGV4T2YoXCI6XCIpKVxuXHRcdFx0XHQ6IFwiY3JlYXRlXCI7XG5cdFx0c0hhc2ggPSBgJHtzQ29udGV4dFBhdGguc3Vic3RyaW5nKDEpfSguLi4pP2ktYWN0aW9uPSR7c0RlZmF1bHRDcmVhdGVIYXNofWA7XG5cdFx0aWYgKG9Sb3V0ZXIuZ2V0Um91dGVJbmZvQnlIYXNoKHNIYXNoKSkge1xuXHRcdFx0cmV0dXJuIHNIYXNoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYE5vIHJvdXRlIG1hdGNoIGZvciBjcmVhdGluZyBhIG5ldyAke3NDb250ZXh0UGF0aC5zdWJzdHJpbmcoMSl9YCk7XG5cdFx0fVxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBBcHBTdGFydHVwSGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBdUJBLElBQU1BLGdCQUFnQixHQUFHO0lBQ3hCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLHlCQUF5QixFQUFFLFVBQVVDLFNBQW1CLEVBQUVDLGtCQUF1QixFQUEyQjtNQUMzRyxJQUFJQyxTQUFTLEdBQUcsSUFBSTtNQUNwQixJQUFNQyxLQUFLLEdBQUdILFNBQVMsQ0FBQ0ksR0FBRyxDQUFDLFVBQUNDLElBQUksRUFBSztRQUNyQyxJQUFJSixrQkFBa0IsQ0FBQ0ksSUFBSSxDQUFDLElBQUlKLGtCQUFrQixDQUFDSSxJQUFJLENBQUMsQ0FBQ0MsTUFBTSxLQUFLLENBQUMsRUFBRTtVQUN0RSxPQUFPO1lBQUVELElBQUksRUFBSkEsSUFBSTtZQUFFRSxLQUFLLEVBQUVOLGtCQUFrQixDQUFDSSxJQUFJLENBQUMsQ0FBQyxDQUFDO1VBQVksQ0FBQztRQUM5RCxDQUFDLE1BQU07VUFDTjtVQUNBSCxTQUFTLEdBQUcsS0FBSztVQUNqQixPQUFPO1lBQUVHLElBQUksRUFBSkEsSUFBSTtZQUFFRSxLQUFLLEVBQUU7VUFBRyxDQUFDO1FBQzNCO01BQ0QsQ0FBQyxDQUFDO01BRUYsT0FBT0wsU0FBUyxHQUFHQyxLQUFLLEdBQUdLLFNBQVM7SUFDckMsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MscUJBQXFCLEVBQUUsVUFBVU4sS0FBa0IsRUFBRU8sVUFBbUIsRUFBRUMsVUFBMEIsRUFBVTtNQUM3RyxJQUFNQyxvQkFBb0IsR0FBR0MsV0FBVyxDQUFDQyx3QkFBd0Is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