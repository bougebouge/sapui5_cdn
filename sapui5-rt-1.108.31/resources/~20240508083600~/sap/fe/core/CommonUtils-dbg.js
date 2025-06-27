/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/array/uniqueSort", "sap/base/util/merge", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SemanticDateOperators", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/type/TypeUtil", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/condition/FilterOperatorUtil", "sap/ui/mdc/condition/RangeOperator", "./controls/AnyElement", "./templating/FilterHelper"], function (Log, uniqueSort, mergeObjects, IssueManager, BindingToolkit, ModelHelper, SemanticDateOperators, StableIdHelper, TypeUtil, Component, Core, Fragment, XMLPreprocessor, XMLTemplateProcessor, FilterOperatorUtil, RangeOperator, AnyElement, FilterHelper) {
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
  function _forTo(array, body, check) {
    var i = -1,
      pact,
      reject;
    function _cycle(result) {
      try {
        while (++i < array.length && (!check || !check())) {
          result = body(i);
          if (result && result.then) {
            if (_isSettledPact(result)) {
              result = result.v;
            } else {
              result.then(_cycle, reject || (reject = _settle.bind(null, pact = new _Pact(), 2)));
              return;
            }
          }
        }
        if (pact) {
          _settle(pact, 1, result);
        } else {
          pact = result;
        }
      } catch (e) {
        _settle(pact || (pact = new _Pact()), 2, e);
      }
    }
    _cycle();
    return pact;
  }
  function _isSettledPact(thenable) {
    return thenable instanceof _Pact && thenable.s & 1;
  }
  var _Pact = /*#__PURE__*/function () {
    function _Pact() {}
    _Pact.prototype.then = function (onFulfilled, onRejected) {
      var result = new _Pact();
      var state = this.s;
      if (state) {
        var callback = state & 1 ? onFulfilled : onRejected;
        if (callback) {
          try {
            _settle(result, 1, callback(this.v));
          } catch (e) {
            _settle(result, 2, e);
          }
          return result;
        } else {
          return this;
        }
      }
      this.o = function (_this) {
        try {
          var _value = _this.v;
          if (_this.s & 1) {
            _settle(result, 1, onFulfilled ? onFulfilled(_value) : _value);
          } else if (onRejected) {
            _settle(result, 1, onRejected(_value));
          } else {
            _settle(result, 2, _value);
          }
        } catch (e) {
          _settle(result, 2, e);
        }
      };
      return result;
    };
    return _Pact;
  }();
  function _settle(pact, state, value) {
    if (!pact.s) {
      if (value instanceof _Pact) {
        if (value.s) {
          if (state & 1) {
            state = value.s;
          }
          value = value.v;
        } else {
          value.o = _settle.bind(null, pact, state);
          return;
        }
      }
      if (value && value.then) {
        value.then(_settle.bind(null, pact, state), _settle.bind(null, pact, 2));
        return;
      }
      pact.s = state;
      pact.v = value;
      var observer = pact.o;
      if (observer) {
        observer(pact);
      }
    }
  }
  var _exports = {};
  var getConditions = FilterHelper.getConditions;
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var compileExpression = BindingToolkit.compileExpression;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategoryType = IssueManager.IssueCategoryType;
  var IssueCategory = IssueManager.IssueCategory;
  var updateRelateAppsModel = function (oBindingContext, oEntry, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath) {
    try {
      var oShellServiceHelper = getShellServices(oObjectPageLayout);
      var oParam = {};
      var sCurrentSemObj = "",
        sCurrentAction = "";
      var oSemanticObjectAnnotations;
      var aRelatedAppsMenuItems = [];
      var aExcludedActions = [];
      function fnGetParseShellHashAndGetLinks() {
        var oParsedUrl = oShellServiceHelper.parseShellHash(document.location.hash);
        sCurrentSemObj = oParsedUrl.semanticObject; // Current Semantic Object
        sCurrentAction = oParsedUrl.action;
        return _getSOIntents(oShellServiceHelper, oObjectPageLayout, sCurrentSemObj, oParam);
      }
      var aManifestSOKeys;
      var _temp5 = _catch(function () {
        function _temp3() {
          return Promise.resolve(fnGetParseShellHashAndGetLinks()).then(function (aLinks) {
            if (aLinks) {
              if (aLinks.length > 0) {
                var isSemanticObjectHasSameTargetInManifest = false;
                var oTargetParams = {};
                var aAnnotationsSOItems = [];
                var sEntitySetPath = "".concat(oMetaPath, "@");
                var sEntityTypePath = "".concat(oMetaPath, "/@");
                var oEntitySetAnnotations = oMetaModel.getObject(sEntitySetPath);
                oSemanticObjectAnnotations = CommonUtils.getSemanticObjectAnnotations(oEntitySetAnnotations, sCurrentSemObj);
                if (!oSemanticObjectAnnotations.bHasEntitySetSO) {
                  var oEntityTypeAnnotations = oMetaModel.getObject(sEntityTypePath);
                  oSemanticObjectAnnotations = CommonUtils.getSemanticObjectAnnotations(oEntityTypeAnnotations, sCurrentSemObj);
                }
                aExcludedActions = oSemanticObjectAnnotations.aUnavailableActions;
                //Skip same application from Related Apps
                aExcludedActions.push(sCurrentAction);
                oTargetParams.navigationContexts = oBindingContext;
                oTargetParams.semanticObjectMapping = oSemanticObjectAnnotations.aMappings;
                _getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aAnnotationsSOItems);
                aManifestSOItems.forEach(function (_ref) {
                  var _aAnnotationsSOItems$;
                  var targetSemObject = _ref.targetSemObject;
                  if (((_aAnnotationsSOItems$ = aAnnotationsSOItems[0]) === null || _aAnnotationsSOItems$ === void 0 ? void 0 : _aAnnotationsSOItems$.targetSemObject) === targetSemObject) {
                    isSemanticObjectHasSameTargetInManifest = true;
                  }
                });

                // remove all actions from current hash application if manifest contains empty allowedActions
                if (oManifestData.additionalSemanticObjects && aAnnotationsSOItems[0] && oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject] && oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject].allowedActions && oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject].allowedActions.length === 0) {
                  isSemanticObjectHasSameTargetInManifest = true;
                }
                aRelatedAppsMenuItems = isSemanticObjectHasSameTargetInManifest ? aManifestSOItems : aManifestSOItems.concat(aAnnotationsSOItems);
                // If no app in list, related apps button will be hidden
                oObjectPageLayout.getBindingContext("internal").setProperty("relatedApps/visibility", aRelatedAppsMenuItems.length > 0);
                oObjectPageLayout.getBindingContext("internal").setProperty("relatedApps/items", aRelatedAppsMenuItems);
              } else {
                oObjectPageLayout.getBindingContext("internal").setProperty("relatedApps/visibility", false);
              }
            } else {
              oObjectPageLayout.getBindingContext("internal").setProperty("relatedApps/visibility", false);
            }
          });
        }
        if (oEntry) {
          if (aSemKeys && aSemKeys.length > 0) {
            for (var j = 0; j < aSemKeys.length; j++) {
              var sSemKey = aSemKeys[j].$PropertyPath;
              if (!oParam[sSemKey]) {
                oParam[sSemKey] = {
                  value: oEntry[sSemKey]
                };
              }
            }
          } else {
            // fallback to Technical Keys if no Semantic Key is present
            var aTechnicalKeys = oMetaModel.getObject("".concat(oMetaPath, "/$Type/$Key"));
            for (var _key2 in aTechnicalKeys) {
              var sObjKey = aTechnicalKeys[_key2];
              if (!oParam[sObjKey]) {
                oParam[sObjKey] = {
                  value: oEntry[sObjKey]
                };
              }
            }
          }
        }
        // Logic to read additional SO from manifest and updated relatedapps model

        var oManifestData = getTargetView(oObjectPageLayout).getViewData();
        var aManifestSOItems = [];
        var semanticObjectIntents;
        var _temp2 = function () {
          if (oManifestData.additionalSemanticObjects) {
            aManifestSOKeys = Object.keys(oManifestData.additionalSemanticObjects);
            var _temp6 = _forTo(aManifestSOKeys, function (key) {
              return Promise.resolve(Promise.resolve(_getSOIntents(oShellServiceHelper, oObjectPageLayout, aManifestSOKeys[key], oParam))).then(function (_Promise$resolve) {
                semanticObjectIntents = _Promise$resolve;
                _getRelatedIntents(oManifestData.additionalSemanticObjects[aManifestSOKeys[key]], oBindingContext, aManifestSOItems, semanticObjectIntents);
              });
            });
            if (_temp6 && _temp6.then) return _temp6.then(function () {});
          }
        }();
        return _temp2 && _temp2.then ? _temp2.then(_temp3) : _temp3(_temp2);
      }, function (error) {
        Log.error("Cannot read links", error);
      });
      return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(function () {
        return aRelatedAppsMenuItems;
      }) : aRelatedAppsMenuItems);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var aValidTypes = ["Edm.Boolean", "Edm.Byte", "Edm.Date", "Edm.DateTime", "Edm.DateTimeOffset", "Edm.Decimal", "Edm.Double", "Edm.Float", "Edm.Guid", "Edm.Int16", "Edm.Int32", "Edm.Int64", "Edm.SByte", "Edm.Single", "Edm.String", "Edm.Time", "Edm.TimeOfDay"];
  function normalizeSearchTerm(sSearchTerm) {
    if (!sSearchTerm) {
      return undefined;
    }
    return sSearchTerm.replace(/"/g, " ").replace(/\\/g, "\\\\") //escape backslash characters. Can be removed if odata/binding handles backend errors responds.
    .split(/\s+/).reduce(function (sNormalized, sCurrentWord) {
      if (sCurrentWord !== "") {
        sNormalized = "".concat(sNormalized ? "".concat(sNormalized, " ") : "", "\"").concat(sCurrentWord, "\"");
      }
      return sNormalized;
    }, undefined);
  }
  function getPropertyDataType(oNavigationContext) {
    var sDataType = oNavigationContext.getProperty("$Type");
    // if $kind exists, it's not a DataField and we have the final type already
    if (!oNavigationContext.getProperty("$kind")) {
      switch (sDataType) {
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          sDataType = undefined;
          break;
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
          sDataType = oNavigationContext.getProperty("Value/$Path/$Type");
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
        default:
          var sAnnotationPath = oNavigationContext.getProperty("Target/$AnnotationPath");
          if (sAnnotationPath) {
            if (sAnnotationPath.indexOf("com.sap.vocabularies.Communication.v1.Contact") > -1) {
              sDataType = oNavigationContext.getProperty("Target/$AnnotationPath/fn/$Path/$Type");
            } else if (sAnnotationPath.indexOf("com.sap.vocabularies.UI.v1.DataPoint") > -1) {
              sDataType = oNavigationContext.getProperty("Value/$Path/$Type");
            } else {
              // e.g. FieldGroup or Chart
              sDataType = undefined;
            }
          } else {
            sDataType = undefined;
          }
          break;
      }
    }
    return sDataType;
  }
  function fnHasTransientContexts(oListBinding) {
    var bHasTransientContexts = false;
    if (oListBinding) {
      oListBinding.getCurrentContexts().forEach(function (oContext) {
        if (oContext && oContext.isTransient()) {
          bHasTransientContexts = true;
        }
      });
    }
    return bHasTransientContexts;
  }
  function getSearchRestrictions(sFullPath, oMetaModel) {
    var oSearchRestrictions;
    var oNavigationSearchRestrictions;
    var navigationText = "$NavigationPropertyBinding";
    var searchRestrictionsTerm = "@Org.OData.Capabilities.V1.SearchRestrictions";
    var entityTypePathParts = sFullPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
    var entitySetPath = ModelHelper.getEntitySetPath(sFullPath, oMetaModel);
    var entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    var isContainment = oMetaModel.getObject("/".concat(entityTypePathParts.join("/"), "/$ContainsTarget"));
    var containmentNavPath = isContainment && entityTypePathParts[entityTypePathParts.length - 1];

    //LEAST PRIORITY - Search restrictions directly at Entity Set
    //e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
    if (!isContainment) {
      oSearchRestrictions = oMetaModel.getObject("".concat(entitySetPath).concat(searchRestrictionsTerm));
    }
    if (entityTypePathParts.length > 1) {
      var navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
      // In case of containment we take entitySet provided as parent. And in case of normal we would remove the last navigation from entitySetPath.
      var parentEntitySetPath = isContainment ? entitySetPath : "/".concat(entitySetPathParts.slice(0, -1).join("/".concat(navigationText, "/")));

      //HIGHEST priority - Navigation restrictions
      //e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
      var oNavigationRestrictions = CommonUtils.getNavigationRestrictions(oMetaModel, parentEntitySetPath, navPath.replaceAll("%2F", "/"));
      oNavigationSearchRestrictions = oNavigationRestrictions && oNavigationRestrictions["SearchRestrictions"];
    }
    return oNavigationSearchRestrictions || oSearchRestrictions;
  }
  function getNavigationRestrictions(oModel, sEntitySetPath, sNavigationPath) {
    var oNavigationRestrictions = oModel.getObject("".concat(sEntitySetPath, "@Org.OData.Capabilities.V1.NavigationRestrictions"));
    var aRestrictedProperties = oNavigationRestrictions && oNavigationRestrictions.RestrictedProperties;
    return aRestrictedProperties && aRestrictedProperties.find(function (oRestrictedProperty) {
      return oRestrictedProperty && oRestrictedProperty.NavigationProperty && oRestrictedProperty.NavigationProperty.$NavigationPropertyPath === sNavigationPath;
    });
  }
  function _isInNonFilterableProperties(oModel, sEntitySetPath, sContextPath) {
    var bIsNotFilterable = false;
    var oAnnotation = oModel.getObject("".concat(sEntitySetPath, "@Org.OData.Capabilities.V1.FilterRestrictions"));
    if (oAnnotation && oAnnotation.NonFilterableProperties) {
      bIsNotFilterable = oAnnotation.NonFilterableProperties.some(function (property) {
        return property.$NavigationPropertyPath === sContextPath || property.$PropertyPath === sContextPath;
      });
    }
    return bIsNotFilterable;
  }

  // TODO rework this!
  function _isContextPathFilterable(oModel, sEntitySetPath, sContexPath) {
    var sFullPath = "".concat(sEntitySetPath, "/").concat(sContexPath),
      aESParts = sFullPath.split("/").splice(0, 2),
      aContext = sFullPath.split("/").splice(2);
    var bIsNotFilterable = false,
      sContext = "";
    sEntitySetPath = aESParts.join("/");
    bIsNotFilterable = aContext.some(function (item, index, array) {
      if (sContext.length > 0) {
        sContext += "/".concat(item);
      } else {
        sContext = item;
      }
      if (index === array.length - 2) {
        // In case of "/Customer/Set/Property" this is to check navigation restrictions of "Customer" for non-filterable properties in "Set"
        var oNavigationRestrictions = getNavigationRestrictions(oModel, sEntitySetPath, item);
        var oFilterRestrictions = oNavigationRestrictions && oNavigationRestrictions.FilterRestrictions;
        var aNonFilterableProperties = oFilterRestrictions && oFilterRestrictions.NonFilterableProperties;
        var sTargetPropertyPath = array[array.length - 1];
        if (aNonFilterableProperties && aNonFilterableProperties.find(function (oPropertyPath) {
          return oPropertyPath.$PropertyPath === sTargetPropertyPath;
        })) {
          return true;
        }
      }
      if (index === array.length - 1) {
        //last path segment
        bIsNotFilterable = _isInNonFilterableProperties(oModel, sEntitySetPath, sContext);
      } else if (oModel.getObject("".concat(sEntitySetPath, "/$NavigationPropertyBinding/").concat(item))) {
        //check existing context path and initialize it
        bIsNotFilterable = _isInNonFilterableProperties(oModel, sEntitySetPath, sContext);
        sContext = "";
        //set the new EntitySet
        sEntitySetPath = "/".concat(oModel.getObject("".concat(sEntitySetPath, "/$NavigationPropertyBinding/").concat(item)));
      }
      return bIsNotFilterable === true;
    });
    return bIsNotFilterable;
  }

  // TODO check used places and rework this
  function isPropertyFilterable(oModel, sEntitySetPath, sProperty, bSkipHiddenFilter) {
    if (typeof sProperty !== "string") {
      throw new Error("sProperty parameter must be a string");
    }
    var bIsFilterable;

    // Parameters should be rendered as filterfields
    if (oModel.getObject("".concat(sEntitySetPath, "/@com.sap.vocabularies.Common.v1.ResultContext")) === true) {
      return true;
    }
    var oNavigationContext = oModel.createBindingContext("".concat(sEntitySetPath, "/").concat(sProperty));
    if (!bSkipHiddenFilter) {
      if (oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.Hidden") === true || oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.HiddenFilter") === true) {
        return false;
      }
      var sHiddenPath = oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.Hidden/$Path");
      var sHiddenFilterPath = oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.HiddenFilter/$Path");
      if (sHiddenPath && sHiddenFilterPath) {
        return compileExpression(not(or(pathInModel(sHiddenPath), pathInModel(sHiddenFilterPath))));
      } else if (sHiddenPath) {
        return compileExpression(not(pathInModel(sHiddenPath)));
      } else if (sHiddenFilterPath) {
        return compileExpression(not(pathInModel(sHiddenFilterPath)));
      }
    }
    if (sEntitySetPath.split("/").length === 2 && sProperty.indexOf("/") < 0) {
      // there is no navigation in entitySet path and property path
      bIsFilterable = !_isInNonFilterableProperties(oModel, sEntitySetPath, sProperty);
    } else {
      bIsFilterable = !_isContextPathFilterable(oModel, sEntitySetPath, sProperty);
    }
    // check if type can be used for filtering
    if (bIsFilterable && oNavigationContext) {
      var sPropertyDataType = getPropertyDataType(oNavigationContext);
      if (sPropertyDataType) {
        bIsFilterable = aValidTypes.indexOf(sPropertyDataType) !== -1;
      } else {
        bIsFilterable = false;
      }
    }
    return bIsFilterable;
  }
  function getShellServices(oControl) {
    return getAppComponent(oControl).getShellServices();
  }
  function getHash() {
    var sHash = window.location.hash;
    return sHash.split("&")[0];
  }
  function _getSOIntents(oShellServiceHelper, oObjectPageLayout, oSemanticObject, oParam) {
    return oShellServiceHelper.getLinks({
      semanticObject: oSemanticObject,
      params: oParam
    });
  }

  // TO-DO add this as part of applySemanticObjectmappings logic in IntentBasednavigation controller extension
  function _createMappings(oMapping) {
    var aSOMappings = [];
    var aMappingKeys = Object.keys(oMapping);
    var oSemanticMapping;
    for (var i = 0; i < aMappingKeys.length; i++) {
      oSemanticMapping = {
        "LocalProperty": {
          "$PropertyPath": aMappingKeys[i]
        },
        "SemanticObjectProperty": oMapping[aMappingKeys[i]]
      };
      aSOMappings.push(oSemanticMapping);
    }
    return aSOMappings;
  }

  /**
   * @param aLinks
   * @param aExcludedActions
   * @param oTargetParams
   * @param aItems
   * @param aAllowedActions
   */
  function _getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aItems, aAllowedActions) {
    for (var i = 0; i < aLinks.length; i++) {
      var oLink = aLinks[i];
      var sIntent = oLink.intent;
      var sAction = sIntent.split("-")[1].split("?")[0];
      if (aAllowedActions && aAllowedActions.includes(sAction)) {
        aItems.push({
          text: oLink.text,
          targetSemObject: sIntent.split("#")[1].split("-")[0],
          targetAction: sAction.split("~")[0],
          targetParams: oTargetParams
        });
      } else if (!aAllowedActions && aExcludedActions && aExcludedActions.indexOf(sAction) === -1) {
        aItems.push({
          text: oLink.text,
          targetSemObject: sIntent.split("#")[1].split("-")[0],
          targetAction: sAction.split("~")[0],
          targetParams: oTargetParams
        });
      }
    }
  }

  /**
   * @param oAdditionalSemanticObjects
   * @param oBindingContext
   * @param aManifestSOItems
   * @param aLinks
   */
  function _getRelatedIntents(oAdditionalSemanticObjects, oBindingContext, aManifestSOItems, aLinks) {
    if (aLinks && aLinks.length > 0) {
      var aAllowedActions = oAdditionalSemanticObjects.allowedActions || undefined;
      var aExcludedActions = oAdditionalSemanticObjects.unavailableActions ? oAdditionalSemanticObjects.unavailableActions : [];
      var aSOMappings = oAdditionalSemanticObjects.mapping ? _createMappings(oAdditionalSemanticObjects.mapping) : [];
      var oTargetParams = {
        navigationContexts: oBindingContext,
        semanticObjectMapping: aSOMappings
      };
      _getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aManifestSOItems, aAllowedActions);
    }
  }
  function _getSemanticObjectAnnotations(oEntityAnnotations, sCurrentSemObj) {
    var oSemanticObjectAnnotations = {
      bHasEntitySetSO: false,
      aAllowedActions: [],
      aUnavailableActions: [],
      aMappings: []
    };
    var sAnnotationMappingTerm, sAnnotationActionTerm;
    var sQualifier;
    for (var key in oEntityAnnotations) {
      if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject") > -1 && oEntityAnnotations[key] === sCurrentSemObj) {
        oSemanticObjectAnnotations.bHasEntitySetSO = true;
        sAnnotationMappingTerm = "@".concat("com.sap.vocabularies.Common.v1.SemanticObjectMapping");
        sAnnotationActionTerm = "@".concat("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions");
        if (key.indexOf("#") > -1) {
          sQualifier = key.split("#")[1];
          sAnnotationMappingTerm = "".concat(sAnnotationMappingTerm, "#").concat(sQualifier);
          sAnnotationActionTerm = "".concat(sAnnotationActionTerm, "#").concat(sQualifier);
        }
        if (oEntityAnnotations[sAnnotationMappingTerm]) {
          oSemanticObjectAnnotations.aMappings = oSemanticObjectAnnotations.aMappings.concat(oEntityAnnotations[sAnnotationMappingTerm]);
        }
        if (oEntityAnnotations[sAnnotationActionTerm]) {
          oSemanticObjectAnnotations.aUnavailableActions = oSemanticObjectAnnotations.aUnavailableActions.concat(oEntityAnnotations[sAnnotationActionTerm]);
        }
        break;
      }
    }
    return oSemanticObjectAnnotations;
  }
  function fnUpdateRelatedAppsDetails(oObjectPageLayout) {
    var oMetaModel = oObjectPageLayout.getModel().getMetaModel();
    var oBindingContext = oObjectPageLayout.getBindingContext();
    var oPath = oBindingContext && oBindingContext.getPath();
    var oMetaPath = oMetaModel.getMetaPath(oPath);
    // Semantic Key Vocabulary
    var sSemanticKeyVocabulary = "".concat(oMetaPath, "/") + "@com.sap.vocabularies.Common.v1.SemanticKey";
    //Semantic Keys
    var aSemKeys = oMetaModel.getObject(sSemanticKeyVocabulary);
    // Unavailable Actions
    var oEntry = oBindingContext.getObject();
    if (!oEntry) {
      oBindingContext.requestObject().then(function (requestedObject) {
        return updateRelateAppsModel(oBindingContext, requestedObject, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath);
      }).catch(function (oError) {
        Log.error("Cannot update the related app details", oError);
      });
    } else {
      return updateRelateAppsModel(oBindingContext, oEntry, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath);
    }
  }

  /**
   * @param oButton
   */
  function fnFireButtonPress(oButton) {
    var aAuthorizedTypes = ["sap.m.Button", "sap.m.OverflowToolbarButton"];
    if (oButton && aAuthorizedTypes.indexOf(oButton.getMetadata().getName()) !== -1 && oButton.getVisible() && oButton.getEnabled()) {
      oButton.firePress();
    }
  }
  function fnResolveStringtoBoolean(sValue) {
    if (sValue === "true" || sValue === true) {
      return true;
    } else {
      return false;
    }
  }
  function getAppComponent(oControl) {
    if (oControl.isA("sap.fe.core.AppComponent")) {
      return oControl;
    }
    var oOwner = Component.getOwnerComponentFor(oControl);
    if (!oOwner) {
      return oControl;
    } else {
      return getAppComponent(oOwner);
    }
  }
  function getCurrentPageView(oAppComponent) {
    var rootViewController = oAppComponent.getRootViewController();
    return rootViewController.isFclEnabled() ? rootViewController.getRightmostView() : CommonUtils.getTargetView(oAppComponent.getRootContainer().getCurrentPage());
  }
  function getTargetView(oControl) {
    if (oControl && oControl.isA("sap.ui.core.ComponentContainer")) {
      oControl = oControl.getComponentInstance();
      oControl = oControl && oControl.getRootControl();
    }
    while (oControl && !oControl.isA("sap.ui.core.mvc.View")) {
      oControl = oControl.getParent();
    }
    return oControl;
  }
  function isFieldControlPathInapplicable(sFieldControlPath, oAttribute) {
    var bInapplicable = false;
    var aParts = sFieldControlPath.split("/");
    // sensitive data is removed only if the path has already been resolved.
    if (aParts.length > 1) {
      bInapplicable = oAttribute[aParts[0]] && oAttribute[aParts[0]].hasOwnProperty(aParts[1]) && oAttribute[aParts[0]][aParts[1]] === 0;
    } else {
      bInapplicable = oAttribute[sFieldControlPath] === 0;
    }
    return bInapplicable;
  }
  function removeSensitiveData(aAttributes, oMetaModel) {
    var aOutAttributes = [];
    for (var i = 0; i < aAttributes.length; i++) {
      var sEntitySet = aAttributes[i].entitySet,
        oAttribute = aAttributes[i].contextData;
      delete oAttribute["@odata.context"];
      delete oAttribute["%40odata.context"];
      delete oAttribute["@odata.metadataEtag"];
      delete oAttribute["%40odata.metadataEtag"];
      delete oAttribute["SAP__Messages"];
      var aProperties = Object.keys(oAttribute);
      for (var j = 0; j < aProperties.length; j++) {
        var sProp = aProperties[j],
          aPropertyAnnotations = oMetaModel.getObject("/".concat(sEntitySet, "/").concat(sProp, "@"));
        if (aPropertyAnnotations) {
          if (aPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] || aPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] || aPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"]) {
            delete oAttribute[sProp];
          } else if (aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"]) {
            var oFieldControl = aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
            if (oFieldControl["$EnumMember"] && oFieldControl["$EnumMember"].split("/")[1] === "Inapplicable") {
              delete oAttribute[sProp];
            } else if (oFieldControl["$Path"] && CommonUtils.isFieldControlPathInapplicable(oFieldControl["$Path"], oAttribute)) {
              delete oAttribute[sProp];
            }
          }
        }
      }
      aOutAttributes.push(oAttribute);
    }
    return aOutAttributes;
  }
  function _fnCheckIsMatch(oObject, oKeysToCheck) {
    for (var sKey in oKeysToCheck) {
      if (oKeysToCheck[sKey] !== oObject[sKey]) {
        return false;
      }
    }
    return true;
  }
  function fnGetContextPathProperties(oMetaModel, sContextPath, oFilter) {
    var oEntityType = oMetaModel.getObject("".concat(sContextPath, "/")) || {},
      oProperties = {};
    for (var sKey in oEntityType) {
      if (oEntityType.hasOwnProperty(sKey) && !/^\$/i.test(sKey) && oEntityType[sKey].$kind && _fnCheckIsMatch(oEntityType[sKey], oFilter || {
        $kind: "Property"
      })) {
        oProperties[sKey] = oEntityType[sKey];
      }
    }
    return oProperties;
  }
  function fnGetMandatoryFilterFields(oMetaModel, sContextPath) {
    var aMandatoryFilterFields;
    if (oMetaModel && sContextPath) {
      aMandatoryFilterFields = oMetaModel.getObject("".concat(sContextPath, "@Org.OData.Capabilities.V1.FilterRestrictions/RequiredProperties"));
    }
    return aMandatoryFilterFields;
  }
  function fnGetIBNActions(oControl, aIBNActions) {
    var aActions = oControl && oControl.getActions();
    if (aActions) {
      aActions.forEach(function (oAction) {
        if (oAction.isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction")) {
          oAction = oAction.getAction();
        }
        if (oAction.isA("sap.m.MenuButton")) {
          var oMenu = oAction.getMenu();
          var aItems = oMenu.getItems();
          aItems.forEach(function (oItem) {
            if (oItem.data("IBNData")) {
              aIBNActions.push(oItem);
            }
          });
        } else if (oAction.data("IBNData")) {
          aIBNActions.push(oAction);
        }
      });
    }
    return aIBNActions;
  }

  /**
   * @param aIBNActions
   * @param oView
   */
  function fnUpdateDataFieldForIBNButtonsVisibility(aIBNActions, oView) {
    var oParams = {};
    var fnGetLinks = function (oData) {
      if (oData) {
        var aKeys = Object.keys(oData);
        aKeys.forEach(function (sKey) {
          if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
            oParams[sKey] = {
              value: oData[sKey]
            };
          }
        });
      }
      if (aIBNActions.length) {
        aIBNActions.forEach(function (oIBNAction) {
          var sSemanticObject = oIBNAction.data("IBNData").semanticObject;
          var sAction = oIBNAction.data("IBNData").action;
          CommonUtils.getShellServices(oView).getLinks({
            semanticObject: sSemanticObject,
            action: sAction,
            params: oParams
          }).then(function (aLink) {
            oIBNAction.setVisible(oIBNAction.getVisible() && aLink && aLink.length === 1);
          }).catch(function (oError) {
            Log.error("Cannot retrieve the links from the shell service", oError);
          });
        });
      }
    };
    if (oView && oView.getBindingContext()) {
      var _oView$getBindingCont;
      (_oView$getBindingCont = oView.getBindingContext()) === null || _oView$getBindingCont === void 0 ? void 0 : _oView$getBindingCont.requestObject().then(function (oData) {
        return fnGetLinks(oData);
      }).catch(function (oError) {
        Log.error("Cannot retrieve the links from the shell service", oError);
      });
    } else {
      fnGetLinks();
    }
  }
  function getTranslatedText(sFrameworkKey, oResourceBundle, oParams, sEntitySetName) {
    var sResourceKey = sFrameworkKey;
    if (oResourceBundle) {
      if (sEntitySetName) {
        // There are console errors logged when making calls to getText for keys that are not defined in the resource bundle
        // for instance keys which are supposed to be provided by the application, e.g, <key>|<entitySet> to override instance specific text
        // hence check if text exists (using "hasText") in the resource bundle before calling "getText"

        // "hasText" only checks for the key in the immediate resource bundle and not it's custom bundles
        // hence we need to do this recurrsively to check if the key exists in any of the bundles the forms the FE resource bundle
        var bResourceKeyExists = checkIfResourceKeyExists(oResourceBundle.aCustomBundles, "".concat(sFrameworkKey, "|").concat(sEntitySetName));

        // if resource key with entity set name for instance specific text overriding is provided by the application
        // then use the same key otherwise use the Framework key
        sResourceKey = bResourceKeyExists ? "".concat(sFrameworkKey, "|").concat(sEntitySetName) : sFrameworkKey;
      }
      return oResourceBundle.getText(sResourceKey, oParams);
    }

    // do not allow override so get text from the internal bundle directly
    oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
    return oResourceBundle.getText(sResourceKey, oParams);
  }
  function checkIfResourceKeyExists(aCustomBundles, sKey) {
    if (aCustomBundles.length) {
      for (var i = aCustomBundles.length - 1; i >= 0; i--) {
        var sValue = aCustomBundles[i].hasText(sKey);
        // text found return true
        if (sValue) {
          return true;
        }
        checkIfResourceKeyExists(aCustomBundles[i].aCustomBundles, sKey);
      }
    }
    return false;
  }
  function getActionPath(oAction, bReturnOnlyPath, sActionName, bCheckStaticValue) {
    sActionName = !sActionName ? oAction.getObject(oAction.getPath()) : sActionName;
    var sContextPath = oAction.getPath().split("/@")[0];
    var sEntityTypeName = oAction.getObject(sContextPath).$Type;
    var sEntityName = getEntitySetName(oAction.getModel(), sEntityTypeName);
    if (sEntityName) {
      sContextPath = "/".concat(sEntityName);
    }
    if (bCheckStaticValue) {
      return oAction.getObject("".concat(sContextPath, "/").concat(sActionName, "@Org.OData.Core.V1.OperationAvailable"));
    }
    if (bReturnOnlyPath) {
      return "".concat(sContextPath, "/").concat(sActionName);
    } else {
      return {
        sContextPath: sContextPath,
        sProperty: oAction.getObject("".concat(sContextPath, "/").concat(sActionName, "@Org.OData.Core.V1.OperationAvailable/$Path")),
        sBindingParameter: oAction.getObject("".concat(sContextPath, "/").concat(sActionName, "/@$ui5.overload/0/$Parameter/0/$Name"))
      };
    }
  }
  function getEntitySetName(oMetaModel, sEntityType) {
    var oEntityContainer = oMetaModel.getObject("/");
    for (var key in oEntityContainer) {
      if (typeof oEntityContainer[key] === "object" && oEntityContainer[key].$Type === sEntityType) {
        return key;
      }
    }
  }
  function computeDisplayMode(oPropertyAnnotations, oCollectionAnnotations) {
    var oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"],
      oTextArrangementAnnotation = oTextAnnotation && (oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"] || oCollectionAnnotations && oCollectionAnnotations["@com.sap.vocabularies.UI.v1.TextArrangement"]);
    if (oTextArrangementAnnotation) {
      if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
        return "Description";
      } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
        return "ValueDescription";
      } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate") {
        return "Value";
      }
      //Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
      return "DescriptionValue";
    }
    return oTextAnnotation ? "DescriptionValue" : "Value";
  }
  function _getEntityType(oContext) {
    var oMetaModel = oContext.getModel().getMetaModel();
    return oMetaModel.getObject("".concat(oMetaModel.getMetaPath(oContext.getPath()), "/$Type"));
  }
  function _requestObject(sAction, oSelectedContext, sProperty) {
    var oContext = oSelectedContext;
    var nBracketIndex = sAction.indexOf("(");
    if (nBracketIndex > -1) {
      var sTargetType = sAction.slice(nBracketIndex + 1, -1);
      var sCurrentType = _getEntityType(oContext);
      while (sCurrentType !== sTargetType) {
        // Find parent binding context and retrieve entity type
        oContext = oContext.getBinding().getContext();
        if (oContext) {
          sCurrentType = _getEntityType(oContext);
        } else {
          Log.warning("Cannot determine target type to request property value for bound action invocation");
          return Promise.resolve(undefined);
        }
      }
    }
    return oContext.requestObject(sProperty);
  }
  function requestProperty(oSelectedContext, sAction, sProperty, sDynamicActionEnabledPath) {
    var oPromise = sProperty && sProperty.indexOf("/") === 0 ? requestSingletonProperty(sProperty, oSelectedContext.getModel()) : _requestObject(sAction, oSelectedContext, sProperty);
    return oPromise.then(function (vPropertyValue) {
      return Promise.resolve({
        vPropertyValue: vPropertyValue,
        oSelectedContext: oSelectedContext,
        sAction: sAction,
        sDynamicActionEnabledPath: sDynamicActionEnabledPath
      });
    });
  }
  function setContextsBasedOnOperationAvailable(oInternalModelContext, aRequestPromises) {
    return Promise.all(aRequestPromises).then(function (aResults) {
      if (aResults.length) {
        var aApplicableContexts = [],
          aNotApplicableContexts = [];
        aResults.forEach(function (aResult) {
          if (aResult) {
            if (aResult.vPropertyValue) {
              oInternalModelContext.getModel().setProperty(aResult.sDynamicActionEnabledPath, true);
              aApplicableContexts.push(aResult.oSelectedContext);
            } else {
              aNotApplicableContexts.push(aResult.oSelectedContext);
            }
          }
        });
        setDynamicActionContexts(oInternalModelContext, aResults[0].sAction, aApplicableContexts, aNotApplicableContexts);
      }
    }).catch(function (oError) {
      Log.trace("Cannot retrieve property value from path", oError);
    });
  }

  /**
   * @param oInternalModelContext
   * @param sAction
   * @param aApplicable
   * @param aNotApplicable
   */
  function setDynamicActionContexts(oInternalModelContext, sAction, aApplicable, aNotApplicable) {
    var sDynamicActionPathPrefix = "".concat(oInternalModelContext.getPath(), "/dynamicActions/").concat(sAction),
      oInternalModel = oInternalModelContext.getModel();
    oInternalModel.setProperty("".concat(sDynamicActionPathPrefix, "/aApplicable"), aApplicable);
    oInternalModel.setProperty("".concat(sDynamicActionPathPrefix, "/aNotApplicable"), aNotApplicable);
  }
  function _getDefaultOperators(sPropertyType) {
    // mdc defines the full set of operations that are meaningful for each Edm Type
    // TODO Replace with model / internal way of retrieving the actual model type used for the property
    var oDataClass = TypeUtil.getDataTypeClassName(sPropertyType);
    // TODO need to pass proper formatOptions, constraints here
    var oBaseType = TypeUtil.getBaseType(oDataClass, {}, {});
    return FilterOperatorUtil.getOperatorsForType(oBaseType);
  }
  function _getRestrictions(aDefaultOps, aExpressionOps) {
    // From the default set of Operators for the Base Type, select those that are defined in the Allowed Value.
    // In case that no operators are found, return undefined so that the default set is used.
    var aOperators = aDefaultOps.filter(function (sElement) {
      return aExpressionOps.indexOf(sElement) > -1;
    });
    return aOperators.toString() || undefined;
  }
  function getSpecificAllowedExpression(aExpressions) {
    var aAllowedExpressionsPriority = CommonUtils.AllowedExpressionsPrio;
    aExpressions.sort(function (a, b) {
      return aAllowedExpressionsPriority.indexOf(a) - aAllowedExpressionsPriority.indexOf(b);
    });
    return aExpressions[0];
  }

  /**
   * Method to fetch the correct operators based on the filter restrictions that can be annotated on an entity set or a navigation property.
   * We return the correct operators based on the specified restriction and also check for the operators defined in the manifest to include or exclude them.
   *
   * @param sProperty String name of the property
   * @param sEntitySetPath String path to the entity set
   * @param oContext Context used during templating
   * @param sType String data type od the property, for example edm.Date
   * @param bUseSemanticDateRange Boolean passed from the manifest for semantic date range
   * @param sSettings Stringified object of the property settings
   * @returns String containing comma-separated list of operators for filtering
   */
  function getOperatorsForProperty(sProperty, sEntitySetPath, oContext, sType, bUseSemanticDateRange, sSettings) {
    var oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oContext);
    var aEqualsOps = ["EQ"];
    var aSingleRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
    var aSingleRangeDTBasicOps = ["EQ", "BT"];
    var aSingleValueDateOps = ["TODAY", "TOMORROW", "YESTERDAY", "DATE", "FIRSTDAYWEEK", "LASTDAYWEEK", "FIRSTDAYMONTH", "LASTDAYMONTH", "FIRSTDAYQUARTER", "LASTDAYQUARTER", "FIRSTDAYYEAR", "LASTDAYYEAR"];
    var aBasicDateTimeOps = ["EQ", "BT"];
    var aMultiRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
    var aSearchExpressionOps = ["Contains", "NotContains", "StartsWith", "NotStartsWith", "EndsWith", "NotEndsWith"];
    var aSemanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
    var bSemanticDateRange = bUseSemanticDateRange === "true" || bUseSemanticDateRange === true;
    var aSemanticDateOps = [];
    var oSettings = typeof sSettings === "string" ? JSON.parse(sSettings).customData : sSettings;
    if (oContext.getObject("".concat(sEntitySetPath, "/@com.sap.vocabularies.Common.v1.ResultContext")) === true) {
      return aEqualsOps.toString();
    }
    if (oSettings && oSettings.operatorConfiguration && oSettings.operatorConfiguration.length > 0) {
      aSemanticDateOps = SemanticDateOperators.getFilterOperations(oSettings.operatorConfiguration);
    } else {
      aSemanticDateOps = SemanticDateOperators.getSemanticDateOperations();
    }
    // Get the default Operators for this Property Type
    var aDefaultOperators = _getDefaultOperators(sType);
    if (bSemanticDateRange) {
      aDefaultOperators = aSemanticDateOpsExt.concat(aDefaultOperators);
    }
    var sRestrictions;

    // Is there a Filter Restriction defined for this property?
    if (oFilterRestrictions && oFilterRestrictions.FilterAllowedExpressions && oFilterRestrictions.FilterAllowedExpressions[sProperty]) {
      // Extending the default operators list with Semantic Date options DATERANGE, DATE, FROM and TO
      var sAllowedExpression = CommonUtils.getSpecificAllowedExpression(oFilterRestrictions.FilterAllowedExpressions[sProperty]);
      // In case more than one Allowed Expressions has been defined for a property
      // choose the most restrictive Allowed Expression

      // MultiValue has same Operator as SingleValue, but there can be more than one (maxConditions)
      switch (sAllowedExpression) {
        case "SingleValue":
          var aSingleValueOps = sType === "Edm.Date" && bSemanticDateRange ? aSingleValueDateOps : aEqualsOps;
          sRestrictions = _getRestrictions(aDefaultOperators, aSingleValueOps);
          break;
        case "MultiValue":
          sRestrictions = _getRestrictions(aDefaultOperators, aEqualsOps);
          break;
        case "SingleRange":
          var aExpressionOps;
          if (bSemanticDateRange) {
            if (sType === "Edm.Date") {
              aExpressionOps = aSemanticDateOps;
            } else if (sType === "Edm.DateTimeOffset") {
              aExpressionOps = aSemanticDateOps.concat(aBasicDateTimeOps);
            } else {
              aExpressionOps = aSingleRangeOps;
            }
          } else if (sType === "Edm.DateTimeOffset") {
            aExpressionOps = aSingleRangeDTBasicOps;
          } else {
            aExpressionOps = aSingleRangeOps;
          }
          var sOperators = _getRestrictions(aDefaultOperators, aExpressionOps);
          sRestrictions = sOperators ? sOperators : "";
          break;
        case "MultiRange":
          sRestrictions = _getRestrictions(aDefaultOperators, aMultiRangeOps);
          break;
        case "SearchExpression":
          sRestrictions = _getRestrictions(aDefaultOperators, aSearchExpressionOps);
          break;
        case "MultiRangeOrSearchExpression":
          sRestrictions = _getRestrictions(aDefaultOperators, aSearchExpressionOps.concat(aMultiRangeOps));
          break;
        default:
          break;
      }
      // In case AllowedExpressions is not recognised, undefined in return results in the default set of
      // operators for the type.
    }

    return sRestrictions;
  }

  /**
   * Method to return allowed operators for type Guid.
   *
   * @function
   * @name getOperatorsForGuidProperty
   * @returns Allowed operators for type Guid
   */
  _exports.getOperatorsForProperty = getOperatorsForProperty;
  function getOperatorsForGuidProperty() {
    var allowedOperatorsForGuid = ["EQ", "NE"];
    return allowedOperatorsForGuid.toString();
  }
  function getOperatorsForDateProperty(propertyType) {
    // In case AllowedExpressions is not provided for type Edm.Date then all the default
    // operators for the type should be returned excluding semantic operators from the list.
    var aDefaultOperators = _getDefaultOperators(propertyType);
    var aMultiRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
    return _getRestrictions(aDefaultOperators, aMultiRangeOps);
  }
  function getParameterInfo(oMetaModel, sContextPath) {
    var sParameterContextPath = sContextPath.substring(0, sContextPath.lastIndexOf("/"));
    var bResultContext = oMetaModel.getObject("".concat(sParameterContextPath, "/@com.sap.vocabularies.Common.v1.ResultContext"));
    var oParameterInfo = {};
    if (bResultContext && sParameterContextPath !== sContextPath) {
      oParameterInfo.contextPath = sParameterContextPath;
      oParameterInfo.parameterProperties = CommonUtils.getContextPathProperties(oMetaModel, sParameterContextPath);
    }
    return oParameterInfo;
  }

  /**
   * Method to add the select Options to filter conditions.
   *
   * @function
   * @name addSelectOptionToConditions
   * @param oPropertyMetadata Property metadata information
   * @param aValidOperators Operators for all the data types
   * @param aSemanticDateOperators Operators for the Date type
   * @param aCumulativeConditions Filter conditions
   * @param oSelectOption Selectoption of selection variant
   * @returns The filter conditions
   */
  function addSelectOptionToConditions(oPropertyMetadata, aValidOperators, aSemanticDateOperators, aCumulativeConditions, oSelectOption) {
    var _oSelectOption$Semant;
    var oCondition = getConditions(oSelectOption, oPropertyMetadata);
    if (oSelectOption !== null && oSelectOption !== void 0 && oSelectOption.SemanticDates && aSemanticDateOperators && aSemanticDateOperators.indexOf(oSelectOption === null || oSelectOption === void 0 ? void 0 : (_oSelectOption$Semant = oSelectOption.SemanticDates) === null || _oSelectOption$Semant === void 0 ? void 0 : _oSelectOption$Semant.operator) > -1) {
      var semanticDates = CommonUtils.addSemanticDatesToConditions(oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.SemanticDates);
      if (semanticDates && Object.keys(semanticDates).length > 0) {
        aCumulativeConditions.push(semanticDates);
      }
    } else if (oCondition) {
      if (!aValidOperators || aValidOperators.indexOf(oCondition.operator) > -1) {
        aCumulativeConditions.push(oCondition);
      }
    }
    return aCumulativeConditions;
  }

  /**
   * Method to add the semantic dates to filter conditions
   *
   * @function
   * @name addSemanticDatesToConditions
   * @param oSemanticDates Semantic date infomation
   * @returns The filter conditions containing semantic dates
   */

  function addSemanticDatesToConditions(oSemanticDates) {
    var values = [];
    if (oSemanticDates !== null && oSemanticDates !== void 0 && oSemanticDates.high) {
      values.push(oSemanticDates === null || oSemanticDates === void 0 ? void 0 : oSemanticDates.high);
    }
    if (oSemanticDates !== null && oSemanticDates !== void 0 && oSemanticDates.low) {
      values.push(oSemanticDates === null || oSemanticDates === void 0 ? void 0 : oSemanticDates.low);
    }
    return {
      values: values,
      operator: oSemanticDates === null || oSemanticDates === void 0 ? void 0 : oSemanticDates.operator,
      isEmpty: null
    };
  }

  /**
   * @param sContextPath
   * @param oSelectionVariant
   * @param sSelectOptionProp
   * @param oConditions
   * @param sConditionPath
   * @param sConditionProp
   * @param oValidProperties
   * @param oMetaModel
   * @param isParameter
   * @param bIsFLPValuePresent
   * @param bUseSemanticDateRange
   * @param oViewData
   */
  function addSelectOptionsToConditions(sContextPath, oSelectionVariant, sSelectOptionProp, oConditions, sConditionPath, sConditionProp, oValidProperties, oMetaModel, isParameter, bIsFLPValuePresent, bUseSemanticDateRange, oViewData) {
    var aConditions = [],
      aSelectOptions,
      aValidOperators,
      aSemanticDateOperators;
    if (isParameter || CommonUtils.isPropertyFilterable(oMetaModel, sContextPath, sConditionProp, true)) {
      var oPropertyMetadata = oValidProperties[sConditionProp];
      aSelectOptions = oSelectionVariant.getSelectOption(sSelectOptionProp);
      var settings = getFilterConfigurationSetting(oViewData, sConditionProp);
      aValidOperators = isParameter ? ["EQ"] : CommonUtils.getOperatorsForProperty(sConditionProp, sContextPath, oMetaModel);
      if (bUseSemanticDateRange) {
        aSemanticDateOperators = isParameter ? ["EQ"] : CommonUtils.getOperatorsForProperty(sConditionProp, sContextPath, oMetaModel, oPropertyMetadata === null || oPropertyMetadata === void 0 ? void 0 : oPropertyMetadata.$Type, bUseSemanticDateRange, settings);
      }
      // Create conditions for all the selectOptions of the property
      aConditions = isParameter ? CommonUtils.addSelectOptionToConditions(oPropertyMetadata, aValidOperators, aSemanticDateOperators, aConditions, aSelectOptions[0]) : aSelectOptions.reduce(CommonUtils.addSelectOptionToConditions.bind(null, oPropertyMetadata, aValidOperators, aSemanticDateOperators), aConditions);
      if (aConditions.length) {
        if (sConditionPath) {
          oConditions[sConditionPath + sConditionProp] = oConditions.hasOwnProperty(sConditionPath + sConditionProp) ? oConditions[sConditionPath + sConditionProp].concat(aConditions) : aConditions;
        } else if (bIsFLPValuePresent) {
          // If FLP values are present replace it with FLP values
          aConditions.forEach(function (element) {
            element["filtered"] = true;
          });
          if (oConditions.hasOwnProperty(sConditionProp)) {
            oConditions[sConditionProp].forEach(function (element) {
              element["filtered"] = false;
            });
            oConditions[sConditionProp] = oConditions[sConditionProp].concat(aConditions);
          } else {
            oConditions[sConditionProp] = aConditions;
          }
        } else {
          oConditions[sConditionProp] = oConditions.hasOwnProperty(sConditionProp) ? oConditions[sConditionProp].concat(aConditions) : aConditions;
        }
      }
    }
  }

  /**
   * Method to create the semantic dates from filter conditions
   *
   * @function
   * @name createSemanticDatesFromConditions
   * @param oCondition Filter field condition
   * @param sFilterName Filter Field Path
   * @returns The Semantic date conditions
   */

  function createSemanticDatesFromConditions(oCondition) {
    var _oCondition$values, _oCondition$values2;
    return {
      high: (oCondition === null || oCondition === void 0 ? void 0 : (_oCondition$values = oCondition.values) === null || _oCondition$values === void 0 ? void 0 : _oCondition$values[0]) || null,
      low: (oCondition === null || oCondition === void 0 ? void 0 : (_oCondition$values2 = oCondition.values) === null || _oCondition$values2 === void 0 ? void 0 : _oCondition$values2[1]) || null,
      operator: oCondition === null || oCondition === void 0 ? void 0 : oCondition.operator
    };
  }

  /**
   * Method to Return the filter configuration
   *
   * @function
   * @name getFilterConfigurationSetting
   * @param oViewData manifest Configuration
   * @param sProperty Filter Field Path
   * @returns The Filter Field Configuration
   */

  function getFilterConfigurationSetting(oViewData, sProperty) {
    var _oConfig$ComSapVoc, _filterConfig$sProper;
    var oConfig = oViewData === null || oViewData === void 0 ? void 0 : oViewData.controlConfiguration;
    var filterConfig = oConfig && ((_oConfig$ComSapVoc = oConfig["@com.sap.vocabularies.UI.v1.SelectionFields"]) === null || _oConfig$ComSapVoc === void 0 ? void 0 : _oConfig$ComSapVoc.filterFields);
    return filterConfig !== null && filterConfig !== void 0 && filterConfig[sProperty] ? (_filterConfig$sProper = filterConfig[sProperty]) === null || _filterConfig$sProper === void 0 ? void 0 : _filterConfig$sProper.settings : undefined;
  }
  function addSelectionVariantToConditions(oSelectionVariant, oConditions, oMetaModel, sContextPath, bIsFLPValues, bUseSemanticDateRange, oViewData) {
    var aSelectOptionsPropertyNames = oSelectionVariant.getSelectOptionsPropertyNames(),
      oValidProperties = CommonUtils.getContextPathProperties(oMetaModel, sContextPath),
      aMetadatProperties = Object.keys(oValidProperties),
      oParameterInfo = CommonUtils.getParameterInfo(oMetaModel, sContextPath),
      sParameterContextPath = oParameterInfo.contextPath,
      oValidParameterProperties = oParameterInfo.parameterProperties,
      bHasParameters = !!oParameterInfo.contextPath && oValidParameterProperties && Object.keys(oValidParameterProperties).length > 0;
    if (bHasParameters) {
      var aMetadataParameters = Object.keys(oValidParameterProperties);
      aMetadataParameters.forEach(function (sMetadataParameter) {
        var sSelectOptionName;
        if (aSelectOptionsPropertyNames.includes("$Parameter.".concat(sMetadataParameter))) {
          sSelectOptionName = "$Parameter.".concat(sMetadataParameter);
        } else if (aSelectOptionsPropertyNames.includes(sMetadataParameter)) {
          sSelectOptionName = sMetadataParameter;
        } else if (sMetadataParameter.startsWith("P_") && aSelectOptionsPropertyNames.includes("$Parameter.".concat(sMetadataParameter.slice(2, sMetadataParameter.length)))) {
          sSelectOptionName = "$Parameter.".concat(sMetadataParameter.slice(2, sMetadataParameter.length));
        } else if (sMetadataParameter.startsWith("P_") && aSelectOptionsPropertyNames.includes(sMetadataParameter.slice(2, sMetadataParameter.length))) {
          sSelectOptionName = sMetadataParameter.slice(2, sMetadataParameter.length);
        } else if (aSelectOptionsPropertyNames.includes("$Parameter.P_".concat(sMetadataParameter))) {
          sSelectOptionName = "$Parameter.P_".concat(sMetadataParameter);
        } else if (aSelectOptionsPropertyNames.includes("P_".concat(sMetadataParameter))) {
          sSelectOptionName = "P_".concat(sMetadataParameter);
        }
        if (sSelectOptionName) {
          addSelectOptionsToConditions(sParameterContextPath, oSelectionVariant, sSelectOptionName, oConditions, undefined, sMetadataParameter, oValidParameterProperties, oMetaModel, true, bIsFLPValues, bUseSemanticDateRange, oViewData);
        }
      });
    }
    aMetadatProperties.forEach(function (sMetadataProperty) {
      var sSelectOptionName;
      if (aSelectOptionsPropertyNames.includes(sMetadataProperty)) {
        sSelectOptionName = sMetadataProperty;
      } else if (sMetadataProperty.startsWith("P_") && aSelectOptionsPropertyNames.includes(sMetadataProperty.slice(2, sMetadataProperty.length))) {
        sSelectOptionName = sMetadataProperty.slice(2, sMetadataProperty.length);
      } else if (aSelectOptionsPropertyNames.includes("P_".concat(sMetadataProperty))) {
        sSelectOptionName = "P_".concat(sMetadataProperty);
      }
      if (sSelectOptionName) {
        addSelectOptionsToConditions(sContextPath, oSelectionVariant, sSelectOptionName, oConditions, undefined, sMetadataProperty, oValidProperties, oMetaModel, false, bIsFLPValues, bUseSemanticDateRange, oViewData);
      }
    });
    aSelectOptionsPropertyNames.forEach(function (sSelectOption) {
      if (sSelectOption.indexOf(".") > 0 && !sSelectOption.includes("$Parameter")) {
        var sReplacedOption = sSelectOption.replaceAll(".", "/");
        var sFullContextPath = "/".concat(sReplacedOption).startsWith(sContextPath) ? "/".concat(sReplacedOption) : "".concat(sContextPath, "/").concat(sReplacedOption); // check if the full path, eg SalesOrderManage._Item.Material exists in the metamodel
        if (oMetaModel.getObject(sFullContextPath.replace("P_", ""))) {
          _createConditionsForNavProperties(sFullContextPath, sContextPath, oSelectionVariant, sSelectOption, oMetaModel, oConditions, bIsFLPValues, bUseSemanticDateRange, oViewData);
        }
      }
    });
    return oConditions;
  }

  /**
   * @param sFullContextPath
   * @param sMainEntitySetPath
   * @param oSelectionVariant
   * @param sSelectOption
   * @param oMetaModel
   * @param oConditions
   * @param bIsFLPValuePresent
   * @param bSemanticDateRange
   * @param oViewData
   */
  function _createConditionsForNavProperties(sFullContextPath, sMainEntitySetPath, oSelectionVariant, sSelectOption, oMetaModel, oConditions, bIsFLPValuePresent, bSemanticDateRange, oViewData) {
    var aNavObjectNames = sSelectOption.split(".");
    // Eg: "SalesOrderManage._Item._Material.Material" or "_Item.Material"
    if ("/".concat(sSelectOption.replaceAll(".", "/")).startsWith(sMainEntitySetPath)) {
      var sFullPath = "/".concat(sSelectOption).replaceAll(".", "/"),
        sNavPath = sFullPath.replace("".concat(sMainEntitySetPath, "/"), "");
      aNavObjectNames = sNavPath.split("/");
    }
    var sConditionPath = "";
    var sPropertyName = aNavObjectNames[aNavObjectNames.length - 1]; // Material from SalesOrderManage._Item.Material
    for (var i = 0; i < aNavObjectNames.length - 1; i++) {
      if (oMetaModel.getObject("".concat(sMainEntitySetPath, "/").concat(aNavObjectNames[i].replace("P_", ""))).$isCollection) {
        sConditionPath = "".concat(sConditionPath + aNavObjectNames[i], "*/"); // _Item*/ in case of 1:n cardinality
      } else {
        sConditionPath = "".concat(sConditionPath + aNavObjectNames[i], "/"); // _Item/ in case of 1:1 cardinality
      }

      sMainEntitySetPath = "".concat(sMainEntitySetPath, "/").concat(aNavObjectNames[i]);
    }
    var sNavPropertyPath = sFullContextPath.slice(0, sFullContextPath.lastIndexOf("/")),
      oValidProperties = CommonUtils.getContextPathProperties(oMetaModel, sNavPropertyPath),
      aSelectOptionsPropertyNames = oSelectionVariant.getSelectOptionsPropertyNames();
    var sSelectOptionName = sPropertyName;
    if (oValidProperties[sPropertyName]) {
      sSelectOptionName = sPropertyName;
    } else if (sPropertyName.startsWith("P_") && oValidProperties[sPropertyName.replace("P_", "")]) {
      sSelectOptionName = sPropertyName.replace("P_", "");
    } else if (oValidProperties["P_".concat(sPropertyName)] && aSelectOptionsPropertyNames.includes("P_".concat(sPropertyName))) {
      sSelectOptionName = "P_".concat(sPropertyName);
    }
    if (sPropertyName.startsWith("P_") && oConditions[sConditionPath + sSelectOptionName]) {
      // if there is no SalesOrderManage._Item.Material yet in the oConditions
    } else if (!sPropertyName.startsWith("P_") && oConditions[sConditionPath + sSelectOptionName]) {
      delete oConditions[sConditionPath + sSelectOptionName];
      addSelectOptionsToConditions(sNavPropertyPath, oSelectionVariant, sSelectOption, oConditions, sConditionPath, sSelectOptionName, oValidProperties, oMetaModel, false, bIsFLPValuePresent, bSemanticDateRange, oViewData);
    } else {
      addSelectOptionsToConditions(sNavPropertyPath, oSelectionVariant, sSelectOption, oConditions, sConditionPath, sSelectOptionName, oValidProperties, oMetaModel, false, bIsFLPValuePresent, bSemanticDateRange, oViewData);
    }
  }
  function addPageContextToSelectionVariant(oSelectionVariant, mPageContext, oView) {
    var oAppComponent = CommonUtils.getAppComponent(oView);
    var oNavigationService = oAppComponent.getNavigationService();
    return oNavigationService.mixAttributesAndSelectionVariant(mPageContext, oSelectionVariant.toJSONString());
  }
  function addExternalStateFiltersToSelectionVariant(oSelectionVariant, mFilters, oTargetInfo, oFilterBar) {
    var sFilter;
    var fnGetSignAndOption = function (sOperator, sLowValue, sHighValue) {
      var oSelectOptionState = {
        option: "",
        sign: "I",
        low: sLowValue,
        high: sHighValue
      };
      switch (sOperator) {
        case "Contains":
          oSelectOptionState.option = "CP";
          break;
        case "StartsWith":
          oSelectOptionState.option = "CP";
          oSelectOptionState.low += "*";
          break;
        case "EndsWith":
          oSelectOptionState.option = "CP";
          oSelectOptionState.low = "*".concat(oSelectOptionState.low);
          break;
        case "BT":
        case "LE":
        case "LT":
        case "GT":
        case "NE":
        case "EQ":
          oSelectOptionState.option = sOperator;
          break;
        case "DATE":
          oSelectOptionState.option = "EQ";
          break;
        case "DATERANGE":
          oSelectOptionState.option = "BT";
          break;
        case "FROM":
          oSelectOptionState.option = "GE";
          break;
        case "TO":
          oSelectOptionState.option = "LE";
          break;
        case "EEQ":
          oSelectOptionState.option = "EQ";
          break;
        case "Empty":
          oSelectOptionState.option = "EQ";
          oSelectOptionState.low = "";
          break;
        case "NotContains":
          oSelectOptionState.option = "CP";
          oSelectOptionState.sign = "E";
          break;
        case "NOTBT":
          oSelectOptionState.option = "BT";
          oSelectOptionState.sign = "E";
          break;
        case "NotStartsWith":
          oSelectOptionState.option = "CP";
          oSelectOptionState.low += "*";
          oSelectOptionState.sign = "E";
          break;
        case "NotEndsWith":
          oSelectOptionState.option = "CP";
          oSelectOptionState.low = "*".concat(oSelectOptionState.low);
          oSelectOptionState.sign = "E";
          break;
        case "NotEmpty":
          oSelectOptionState.option = "NE";
          oSelectOptionState.low = "";
          break;
        case "NOTLE":
          oSelectOptionState.option = "LE";
          oSelectOptionState.sign = "E";
          break;
        case "NOTGE":
          oSelectOptionState.option = "GE";
          oSelectOptionState.sign = "E";
          break;
        case "NOTLT":
          oSelectOptionState.option = "LT";
          oSelectOptionState.sign = "E";
          break;
        case "NOTGT":
          oSelectOptionState.option = "GT";
          oSelectOptionState.sign = "E";
          break;
        default:
          Log.warning("".concat(sOperator, " is not supported. ").concat(sFilter, " could not be added to the navigation context"));
      }
      return oSelectOptionState;
    };
    var oFilterConditions = mFilters.filterConditions;
    var oFiltersWithoutConflict = mFilters.filterConditionsWithoutConflict ? mFilters.filterConditionsWithoutConflict : {};
    var oTablePropertiesWithoutConflict = oTargetInfo.propertiesWithoutConflict ? oTargetInfo.propertiesWithoutConflict : {};
    var addFiltersToSelectionVariant = function (selectionVariant, sFilterName, sPath) {
      var aConditions = oFilterConditions[sFilterName];
      var oPropertyInfo = oFilterBar && oFilterBar.getPropertyHelper().getProperty(sFilterName);
      var oTypeConfig = oPropertyInfo === null || oPropertyInfo === void 0 ? void 0 : oPropertyInfo.typeConfig;
      var oTypeUtil = oFilterBar && oFilterBar.getControlDelegate().getTypeUtil();
      for (var item in aConditions) {
        var oCondition = aConditions[item];
        var option = "",
          sign = "I",
          low = "",
          high = null,
          semanticDates = void 0;
        var oOperator = FilterOperatorUtil.getOperator(oCondition.operator);
        if (oOperator instanceof RangeOperator) {
          var _oModelFilter$aFilter;
          semanticDates = CommonUtils.createSemanticDatesFromConditions(oCondition);
          // handling of Date RangeOperators
          var oModelFilter = oOperator.getModelFilter(oCondition, sFilterName, oTypeConfig === null || oTypeConfig === void 0 ? void 0 : oTypeConfig.typeInstance, false, oTypeConfig === null || oTypeConfig === void 0 ? void 0 : oTypeConfig.baseType);
          if (!(oModelFilter !== null && oModelFilter !== void 0 && oModelFilter.aFilters) && !(oModelFilter !== null && oModelFilter !== void 0 && (_oModelFilter$aFilter = oModelFilter.aFilters) !== null && _oModelFilter$aFilter !== void 0 && _oModelFilter$aFilter.length)) {
            sign = oOperator !== null && oOperator !== void 0 && oOperator.exclude ? "E" : "I";
            low = oTypeUtil.externalizeValue(oModelFilter.getValue1(), oTypeConfig.typeInstance);
            high = oTypeUtil.externalizeValue(oModelFilter.getValue2(), oTypeConfig.typeInstance);
            option = oModelFilter.getOperator();
          }
        } else {
          var aSemanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
          if (aSemanticDateOpsExt.includes(oCondition === null || oCondition === void 0 ? void 0 : oCondition.operator)) {
            semanticDates = CommonUtils.createSemanticDatesFromConditions(oCondition);
          }
          var value1 = oCondition.values[0] && oCondition.values[0].toString() || "";
          var value2 = oCondition.values[1] && oCondition.values[1].toString() || null;
          var oSelectOption = fnGetSignAndOption(oCondition.operator, value1, value2);
          sign = oOperator !== null && oOperator !== void 0 && oOperator.exclude ? "E" : "I";
          low = oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.low;
          high = oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.high;
          option = oSelectOption === null || oSelectOption === void 0 ? void 0 : oSelectOption.option;
        }
        if (option && semanticDates) {
          selectionVariant.addSelectOption(sPath ? sPath : sFilterName, sign, option, low, high, undefined, semanticDates);
        } else if (option) {
          selectionVariant.addSelectOption(sPath ? sPath : sFilterName, sign, option, low, high);
        }
      }
    };
    for (sFilter in oFilterConditions) {
      // only add the filter values if it is not already present in the SV already
      if (!oSelectionVariant.getSelectOption(sFilter)) {
        // TODO : custom filters should be ignored more generically
        if (sFilter === "$editState") {
          continue;
        }
        addFiltersToSelectionVariant(oSelectionVariant, sFilter);
      } else {
        if (oTablePropertiesWithoutConflict && sFilter in oTablePropertiesWithoutConflict) {
          addFiltersToSelectionVariant(oSelectionVariant, sFilter, oTablePropertiesWithoutConflict[sFilter]);
        }
        // if property was without conflict in page context then add path from page context to SV
        if (sFilter in oFiltersWithoutConflict) {
          addFiltersToSelectionVariant(oSelectionVariant, sFilter, oFiltersWithoutConflict[sFilter]);
        }
      }
    }
    return oSelectionVariant;
  }
  function isStickyEditMode(oControl) {
    var bIsStickyMode = ModelHelper.isStickySessionSupported(oControl.getModel().getMetaModel());
    var bUIEditable = oControl.getModel("ui").getProperty("/isEditable");
    return bIsStickyMode && bUIEditable;
  }

  /**
   * @param aMandatoryFilterFields
   * @param oSelectionVariant
   * @param oSelectionVariantDefaults
   */
  function addDefaultDisplayCurrency(aMandatoryFilterFields, oSelectionVariant, oSelectionVariantDefaults) {
    if (oSelectionVariant && aMandatoryFilterFields && aMandatoryFilterFields.length) {
      for (var i = 0; i < aMandatoryFilterFields.length; i++) {
        var aSVOption = oSelectionVariant.getSelectOption("DisplayCurrency"),
          aDefaultSVOption = oSelectionVariantDefaults && oSelectionVariantDefaults.getSelectOption("DisplayCurrency");
        if (aMandatoryFilterFields[i].$PropertyPath === "DisplayCurrency" && (!aSVOption || !aSVOption.length) && aDefaultSVOption && aDefaultSVOption.length) {
          var displayCurrencySelectOption = aDefaultSVOption[0];
          var sSign = displayCurrencySelectOption["Sign"];
          var sOption = displayCurrencySelectOption["Option"];
          var sLow = displayCurrencySelectOption["Low"];
          var sHigh = displayCurrencySelectOption["High"];
          oSelectionVariant.addSelectOption("DisplayCurrency", sSign, sOption, sLow, sHigh);
        }
      }
    }
  }
  function getNonComputedVisibleFields(oMetaModel, sPath, oView) {
    var aTechnicalKeys = oMetaModel.getObject("".concat(sPath, "/")).$Key;
    var aNonComputedVisibleFields = [];
    var aImmutableVisibleFields = [];
    var oEntityType = oMetaModel.getObject("".concat(sPath, "/"));
    for (var item in oEntityType) {
      if (oEntityType[item].$kind && oEntityType[item].$kind === "Property") {
        var oAnnotations = oMetaModel.getObject("".concat(sPath, "/").concat(item, "@")) || {},
          bIsKey = aTechnicalKeys.indexOf(item) > -1,
          bIsImmutable = oAnnotations["@Org.OData.Core.V1.Immutable"],
          bIsNonComputed = !oAnnotations["@Org.OData.Core.V1.Computed"],
          bIsVisible = !oAnnotations["@com.sap.vocabularies.UI.v1.Hidden"],
          bIsComputedDefaultValue = oAnnotations["@Org.OData.Core.V1.ComputedDefaultValue"],
          bIsKeyComputedDefaultValueWithText = bIsKey && oEntityType[item].$Type === "Edm.Guid" ? bIsComputedDefaultValue && oAnnotations["@com.sap.vocabularies.Common.v1.Text"] : false;
        if ((bIsKeyComputedDefaultValueWithText || bIsKey && oEntityType[item].$Type !== "Edm.Guid") && bIsNonComputed && bIsVisible) {
          aNonComputedVisibleFields.push(item);
        } else if (bIsImmutable && bIsNonComputed && bIsVisible) {
          aImmutableVisibleFields.push(item);
        }
        if (!bIsNonComputed && bIsComputedDefaultValue && oView) {
          var _IssueCategoryType$An;
          var oDiagnostics = getAppComponent(oView).getDiagnostics();
          var sMessage = "Core.ComputedDefaultValue is ignored as Core.Computed is already set to true";
          oDiagnostics.addIssue(IssueCategory.Annotation, IssueSeverity.Medium, sMessage, IssueCategoryType, IssueCategoryType === null || IssueCategoryType === void 0 ? void 0 : (_IssueCategoryType$An = IssueCategoryType.Annotations) === null || _IssueCategoryType$An === void 0 ? void 0 : _IssueCategoryType$An.IgnoredAnnotation);
        }
      }
    }
    var aRequiredProperties = CommonUtils.getRequiredPropertiesFromInsertRestrictions(sPath, oMetaModel);
    if (aRequiredProperties.length) {
      aRequiredProperties.forEach(function (sProperty) {
        var oAnnotations = oMetaModel.getObject("".concat(sPath, "/").concat(sProperty, "@")),
          bIsVisible = !oAnnotations || !oAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
        if (bIsVisible && aNonComputedVisibleFields.indexOf(sProperty) === -1 && aImmutableVisibleFields.indexOf(sProperty) === -1) {
          aNonComputedVisibleFields.push(sProperty);
        }
      });
    }
    return aNonComputedVisibleFields.concat(aImmutableVisibleFields);
  }
  function getRequiredProperties(sPath, oMetaModel) {
    var bCheckUpdateRestrictions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    var aRequiredProperties = [];
    var aRequiredPropertiesWithPaths = [];
    var navigationText = "$NavigationPropertyBinding";
    var oEntitySetAnnotations;
    if (sPath.endsWith("$")) {
      // if sPath comes with a $ in the end, removing it as it is of no significance
      sPath = sPath.replace("/$", "");
    }
    var entityTypePathParts = sPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
    var entitySetPath = ModelHelper.getEntitySetPath(sPath, oMetaModel);
    var entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    var isContainment = oMetaModel.getObject("/".concat(entityTypePathParts.join("/"), "/$ContainsTarget"));
    var containmentNavPath = isContainment && entityTypePathParts[entityTypePathParts.length - 1];

    //Restrictions directly at Entity Set
    //e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
    if (!isContainment) {
      oEntitySetAnnotations = oMetaModel.getObject("".concat(entitySetPath, "@"));
    }
    if (entityTypePathParts.length > 1) {
      var navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
      var parentEntitySetPath = isContainment ? entitySetPath : "/".concat(entitySetPathParts.slice(0, -1).join("/".concat(navigationText, "/")));
      //Navigation restrictions
      //e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
      var oNavRest = CommonUtils.getNavigationRestrictions(oMetaModel, parentEntitySetPath, navPath.replaceAll("%2F", "/"));
      if (CommonUtils.hasRestrictedPropertiesInAnnotations(oNavRest, true, bCheckUpdateRestrictions)) {
        aRequiredPropertiesWithPaths = bCheckUpdateRestrictions ? oNavRest["UpdateRestrictions"].RequiredProperties : oNavRest["InsertRestrictions"].RequiredProperties;
      }
      if ((!aRequiredPropertiesWithPaths || !aRequiredPropertiesWithPaths.length) && CommonUtils.hasRestrictedPropertiesInAnnotations(oEntitySetAnnotations, false, bCheckUpdateRestrictions)) {
        aRequiredPropertiesWithPaths = CommonUtils.getRequiredPropertiesFromAnnotations(oEntitySetAnnotations, bCheckUpdateRestrictions);
      }
    } else if (CommonUtils.hasRestrictedPropertiesInAnnotations(oEntitySetAnnotations, false, bCheckUpdateRestrictions)) {
      aRequiredPropertiesWithPaths = CommonUtils.getRequiredPropertiesFromAnnotations(oEntitySetAnnotations, bCheckUpdateRestrictions);
    }
    aRequiredPropertiesWithPaths.forEach(function (oRequiredProperty) {
      var sProperty = oRequiredProperty["$PropertyPath"];
      aRequiredProperties.push(sProperty);
    });
    return aRequiredProperties;
  }
  function getRequiredPropertiesFromInsertRestrictions(sPath, oMetaModel) {
    return CommonUtils.getRequiredProperties(sPath, oMetaModel);
  }
  function getRequiredPropertiesFromUpdateRestrictions(sPath, oMetaModel) {
    return CommonUtils.getRequiredProperties(sPath, oMetaModel, true);
  }
  function getRequiredPropertiesFromAnnotations(oAnnotations) {
    var bCheckUpdateRestrictions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (bCheckUpdateRestrictions) {
      return oAnnotations["@Org.OData.Capabilities.V1.UpdateRestrictions"].RequiredProperties;
    }
    return oAnnotations["@Org.OData.Capabilities.V1.InsertRestrictions"].RequiredProperties;
  }
  function hasRestrictedPropertiesInAnnotations(oAnnotations) {
    var bIsNavigationRestrictions = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var bCheckUpdateRestrictions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
    if (bIsNavigationRestrictions) {
      if (bCheckUpdateRestrictions) {
        return oAnnotations && oAnnotations["UpdateRestrictions"] && oAnnotations["UpdateRestrictions"].RequiredProperties ? true : false;
      }
      return oAnnotations && oAnnotations["InsertRestrictions"] && oAnnotations["InsertRestrictions"].RequiredProperties ? true : false;
    } else if (bCheckUpdateRestrictions) {
      return oAnnotations && oAnnotations["@Org.OData.Capabilities.V1.UpdateRestrictions"] && oAnnotations["@Org.OData.Capabilities.V1.UpdateRestrictions"].RequiredProperties ? true : false;
    }
    return oAnnotations && oAnnotations["@Org.OData.Capabilities.V1.InsertRestrictions"] && oAnnotations["@Org.OData.Capabilities.V1.InsertRestrictions"].RequiredProperties ? true : false;
  }
  function setUserDefaults(oAppComponent, aParameters, oModel, bIsAction, bIsCreate, oActionDefaultValues) {
    return new Promise(function (resolve) {
      var oComponentData = oAppComponent.getComponentData(),
        oStartupParameters = oComponentData && oComponentData.startupParameters || {},
        oShellServices = oAppComponent.getShellServices();
      if (!oShellServices.hasUShell()) {
        aParameters.forEach(function (oParameter) {
          var _oParameter$getPath;
          var sPropertyName = bIsAction ? "/".concat(oParameter.$Name) : (_oParameter$getPath = oParameter.getPath) === null || _oParameter$getPath === void 0 ? void 0 : _oParameter$getPath.call(oParameter).slice(oParameter.getPath().lastIndexOf("/") + 1);
          var sParameterName = bIsAction ? sPropertyName.slice(1) : sPropertyName;
          if (oActionDefaultValues && bIsCreate) {
            if (oActionDefaultValues[sParameterName]) {
              oModel.setProperty(sPropertyName, oActionDefaultValues[sParameterName]);
            }
          } else if (oStartupParameters[sParameterName]) {
            oModel.setProperty(sPropertyName, oStartupParameters[sParameterName][0]);
          }
        });
        return resolve(true);
      }
      return oShellServices.getStartupAppState(oAppComponent).then(function (oStartupAppState) {
        var oData = oStartupAppState.getData() || {},
          aExtendedParameters = oData.selectionVariant && oData.selectionVariant.SelectOptions || [];
        aParameters.forEach(function (oParameter) {
          var _oParameter$getPath2;
          var sPropertyName = bIsAction ? "/".concat(oParameter.$Name) : (_oParameter$getPath2 = oParameter.getPath) === null || _oParameter$getPath2 === void 0 ? void 0 : _oParameter$getPath2.call(oParameter).slice(oParameter.getPath().lastIndexOf("/") + 1);
          var sParameterName = bIsAction ? sPropertyName.slice(1) : sPropertyName;
          if (oActionDefaultValues && bIsCreate) {
            if (oActionDefaultValues[sParameterName]) {
              oModel.setProperty(sPropertyName, oActionDefaultValues[sParameterName]);
            }
          } else if (oStartupParameters[sParameterName]) {
            oModel.setProperty(sPropertyName, oStartupParameters[sParameterName][0]);
          } else if (aExtendedParameters.length > 0) {
            for (var i in aExtendedParameters) {
              var oExtendedParameter = aExtendedParameters[i];
              if (oExtendedParameter.PropertyName === sParameterName) {
                var oRange = oExtendedParameter.Ranges.length ? oExtendedParameter.Ranges[oExtendedParameter.Ranges.length - 1] : undefined;
                if (oRange && oRange.Sign === "I" && oRange.Option === "EQ") {
                  oModel.setProperty(sPropertyName, oRange.Low); // high is ignored when Option=EQ
                }
              }
            }
          }
        });

        return resolve(true);
      });
    });
  }
  function getAdditionalParamsForCreate(oStartupParameters, oInboundParameters) {
    var oInbounds = oInboundParameters,
      aCreateParameters = oInbounds ? Object.keys(oInbounds).filter(function (sParameter) {
        return oInbounds[sParameter].useForCreate;
      }) : [];
    var oRet;
    for (var i = 0; i < aCreateParameters.length; i++) {
      var sCreateParameter = aCreateParameters[i];
      var aValues = oStartupParameters && oStartupParameters[sCreateParameter];
      if (aValues && aValues.length === 1) {
        oRet = oRet || Object.create(null);
        oRet[sCreateParameter] = aValues[0];
      }
    }
    return oRet;
  }
  function getSemanticObjectMapping(oOutbound) {
    var aSemanticObjectMapping = [];
    if (oOutbound.parameters) {
      var aParameters = Object.keys(oOutbound.parameters) || [];
      if (aParameters.length > 0) {
        aParameters.forEach(function (sParam) {
          var oMapping = oOutbound.parameters[sParam];
          if (oMapping.value && oMapping.value.value && oMapping.value.format === "binding") {
            // using the format of UI.Mapping
            var oSemanticMapping = {
              "LocalProperty": {
                "$PropertyPath": oMapping.value.value
              },
              "SemanticObjectProperty": sParam
            };
            if (aSemanticObjectMapping.length > 0) {
              // To check if the semanticObject Mapping is done for the same local property more that once then first one will be considered
              for (var i = 0; i < aSemanticObjectMapping.length; i++) {
                if (aSemanticObjectMapping[i]["LocalProperty"]["$PropertyPath"] !== oSemanticMapping["LocalProperty"]["$PropertyPath"]) {
                  aSemanticObjectMapping.push(oSemanticMapping);
                }
              }
            } else {
              aSemanticObjectMapping.push(oSemanticMapping);
            }
          }
        });
      }
    }
    return aSemanticObjectMapping;
  }
  function getHeaderFacetItemConfigForExternalNavigation(oViewData, oCrossNav) {
    var oHeaderFacetItems = {};
    var sId;
    var oControlConfig = oViewData.controlConfiguration;
    for (var config in oControlConfig) {
      if (config.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 || config.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
        if (oControlConfig[config].navigation && oControlConfig[config].navigation.targetOutbound && oControlConfig[config].navigation.targetOutbound.outbound) {
          var sOutbound = oControlConfig[config].navigation.targetOutbound.outbound;
          var oOutbound = oCrossNav[sOutbound];
          if (oOutbound.semanticObject && oOutbound.action) {
            if (config.indexOf("Chart") > -1) {
              sId = generate(["fe", "MicroChartLink", config]);
            } else {
              sId = generate(["fe", "HeaderDPLink", config]);
            }
            var aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oOutbound);
            oHeaderFacetItems[sId] = {
              semanticObject: oOutbound.semanticObject,
              action: oOutbound.action,
              semanticObjectMapping: aSemanticObjectMapping
            };
          } else {
            Log.error("Cross navigation outbound is configured without semantic object and action for ".concat(sOutbound));
          }
        }
      }
    }
    return oHeaderFacetItems;
  }
  function setSemanticObjectMappings(oSelectionVariant, vMappings) {
    var oMappings = typeof vMappings === "string" ? JSON.parse(vMappings) : vMappings;
    for (var i = 0; i < oMappings.length; i++) {
      var sLocalProperty = oMappings[i]["LocalProperty"] && oMappings[i]["LocalProperty"]["$PropertyPath"] || oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"] && oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"]["$Path"];
      var sSemanticObjectProperty = oMappings[i]["SemanticObjectProperty"] || oMappings[i]["@com.sap.vocabularies.Common.v1.SemanticObjectProperty"];
      if (oSelectionVariant.getSelectOption(sLocalProperty)) {
        var oSelectOption = oSelectionVariant.getSelectOption(sLocalProperty);

        //Create a new SelectOption with sSemanticObjectProperty as the property Name and remove the older one
        oSelectionVariant.removeSelectOption(sLocalProperty);
        oSelectionVariant.massAddSelectOption(sSemanticObjectProperty, oSelectOption);
      }
    }
    return oSelectionVariant;
  }
  function fnGetSemanticObjectsFromPath(oMetaModel, sPath, sQualifier) {
    return new Promise(function (resolve) {
      var sSemanticObject, aSemanticObjectUnavailableActions;
      if (sQualifier === "") {
        sSemanticObject = oMetaModel.getObject("".concat(sPath, "@").concat("com.sap.vocabularies.Common.v1.SemanticObject"));
        aSemanticObjectUnavailableActions = oMetaModel.getObject("".concat(sPath, "@").concat("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"));
      } else {
        sSemanticObject = oMetaModel.getObject("".concat(sPath, "@").concat("com.sap.vocabularies.Common.v1.SemanticObject", "#").concat(sQualifier));
        aSemanticObjectUnavailableActions = oMetaModel.getObject("".concat(sPath, "@").concat("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions", "#").concat(sQualifier));
      }
      var aSemanticObjectForGetLinks = [{
        semanticObject: sSemanticObject
      }];
      var oSemanticObject = {
        semanticObject: sSemanticObject
      };
      resolve({
        semanticObjectPath: sPath,
        semanticObjectForGetLinks: aSemanticObjectForGetLinks,
        semanticObject: oSemanticObject,
        unavailableActions: aSemanticObjectUnavailableActions
      });
    }).catch(function (oError) {
      Log.error("Error in fnGetSemanticObjectsFromPath", oError);
    });
  }
  function fnUpdateSemanticTargetsModel(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash) {
    return Promise.all(aGetLinksPromises).then(function (aValues) {
      var aLinks,
        _oLink,
        _sLinkIntentAction,
        aFinalLinks = [];
      var oFinalSemanticObjects = {};
      var bIntentHasActions = function (sIntent, aActions) {
        for (var intent in aActions) {
          if (intent === sIntent) {
            return true;
          } else {
            return false;
          }
        }
      };
      for (var k = 0; k < aValues.length; k++) {
        aLinks = aValues[k];
        if (aLinks && aLinks.length > 0 && aLinks[0] !== undefined) {
          var oSemanticObject = {};
          var oTmp = {};
          var sAlternatePath = void 0;
          for (var i = 0; i < aLinks.length; i++) {
            aFinalLinks.push([]);
            var hasTargetsNotFiltered = false;
            var hasTargets = false;
            for (var iLinkCount = 0; iLinkCount < aLinks[i][0].length; iLinkCount++) {
              _oLink = aLinks[i][0][iLinkCount];
              _sLinkIntentAction = _oLink && _oLink.intent.split("?")[0].split("-")[1];
              if (!(_oLink && _oLink.intent && _oLink.intent.indexOf(sCurrentHash) === 0)) {
                hasTargetsNotFiltered = true;
                if (!bIntentHasActions(_sLinkIntentAction, aSemanticObjects[k].unavailableActions)) {
                  aFinalLinks[i].push(_oLink);
                  hasTargets = true;
                }
              }
            }
            oTmp = {
              semanticObject: aSemanticObjects[k].semanticObject,
              path: aSemanticObjects[k].path,
              HasTargets: hasTargets,
              HasTargetsNotFiltered: hasTargetsNotFiltered
            };
            if (oSemanticObject[aSemanticObjects[k].semanticObject] === undefined) {
              oSemanticObject[aSemanticObjects[k].semanticObject] = {};
            }
            sAlternatePath = aSemanticObjects[k].path.replace(/\//g, "_");
            if (oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] === undefined) {
              oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] = {};
            }
            oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] = Object.assign(oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath], oTmp);
          }
          var sSemanticObjectName = Object.keys(oSemanticObject)[0];
          if (Object.keys(oFinalSemanticObjects).includes(sSemanticObjectName)) {
            oFinalSemanticObjects[sSemanticObjectName] = Object.assign(oFinalSemanticObjects[sSemanticObjectName], oSemanticObject[sSemanticObjectName]);
          } else {
            oFinalSemanticObjects = Object.assign(oFinalSemanticObjects, oSemanticObject);
          }
          aFinalLinks = [];
        }
      }
      if (Object.keys(oFinalSemanticObjects).length > 0) {
        oInternalModelContext.setProperty("semanticsTargets", mergeObjects(oFinalSemanticObjects, oInternalModelContext.getProperty("semanticsTargets")));
        return oFinalSemanticObjects;
      }
    }).catch(function (oError) {
      Log.error("fnUpdateSemanticTargetsModel: Cannot read links", oError);
    });
  }
  function fnGetSemanticObjectPromise(oAppComponent, oView, oMetaModel, sPath, sQualifier) {
    return CommonUtils.getSemanticObjectsFromPath(oMetaModel, sPath, sQualifier);
  }
  function fnPrepareSemanticObjectsPromises(_oAppComponent, _oView, _oMetaModel, _aSemanticObjectsFound, _aSemanticObjectsPromises) {
    var _Keys, sPath;
    var sQualifier, regexResult;
    for (var i = 0; i < _aSemanticObjectsFound.length; i++) {
      sPath = _aSemanticObjectsFound[i];
      _Keys = Object.keys(_oMetaModel.getObject(sPath + "@"));
      for (var index = 0; index < _Keys.length; index++) {
        if (_Keys[index].indexOf("@".concat("com.sap.vocabularies.Common.v1.SemanticObject")) === 0 && _Keys[index].indexOf("@".concat("com.sap.vocabularies.Common.v1.SemanticObjectMapping")) === -1 && _Keys[index].indexOf("@".concat("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions")) === -1) {
          regexResult = /#(.*)/.exec(_Keys[index]);
          sQualifier = regexResult ? regexResult[1] : "";
          _aSemanticObjectsPromises.push(CommonUtils.getSemanticObjectPromise(_oAppComponent, _oView, _oMetaModel, sPath, sQualifier));
        }
      }
    }
  }
  function fnGetSemanticTargetsFromPageModel(oController, sPageModel) {
    var _fnfindValuesHelper = function (obj, key, list) {
      if (!obj) {
        return list;
      }
      if (obj instanceof Array) {
        for (var i in obj) {
          list = list.concat(_fnfindValuesHelper(obj[i], key, []));
        }
        return list;
      }
      if (obj[key]) {
        list.push(obj[key]);
      }
      if (typeof obj == "object" && obj !== null) {
        var children = Object.keys(obj);
        if (children.length > 0) {
          for (var _i = 0; _i < children.length; _i++) {
            list = list.concat(_fnfindValuesHelper(obj[children[_i]], key, []));
          }
        }
      }
      return list;
    };
    var _fnfindValues = function (obj, key) {
      return _fnfindValuesHelper(obj, key, []);
    };
    var _fnDeleteDuplicateSemanticObjects = function (aSemanticObjectPath) {
      return aSemanticObjectPath.filter(function (value, index) {
        return aSemanticObjectPath.indexOf(value) === index;
      });
    };
    var oView = oController.getView();
    var oInternalModelContext = oView.getBindingContext("internal");
    if (oInternalModelContext) {
      var aSemanticObjectsPromises = [];
      var oComponent = oController.getOwnerComponent();
      var oAppComponent = Component.getOwnerComponentFor(oComponent);
      var oMetaModel = oAppComponent.getMetaModel();
      var oPageModel = oComponent.getModel(sPageModel).getData();
      if (JSON.stringify(oPageModel) === "{}") {
        oPageModel = oComponent.getModel(sPageModel)._getObject("/", undefined);
      }
      var aSemanticObjectsFound = _fnfindValues(oPageModel, "semanticObjectPath");
      aSemanticObjectsFound = _fnDeleteDuplicateSemanticObjects(aSemanticObjectsFound);
      var oShellServiceHelper = CommonUtils.getShellServices(oAppComponent);
      var sCurrentHash = CommonUtils.getHash();
      var aSemanticObjectsForGetLinks = [];
      var aSemanticObjects = [];
      var _oSemanticObject;
      if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
        // sCurrentHash can contain query string, cut it off!
        sCurrentHash = sCurrentHash.split("?")[0];
      }
      fnPrepareSemanticObjectsPromises(oAppComponent, oView, oMetaModel, aSemanticObjectsFound, aSemanticObjectsPromises);
      if (aSemanticObjectsPromises.length === 0) {
        return Promise.resolve();
      } else {
        Promise.all(aSemanticObjectsPromises).then(function (aValues) {
          var aGetLinksPromises = [];
          var sSemObjExpression;
          var aSemanticObjectsResolved = aValues.filter(function (element) {
            if (element.semanticObject !== undefined && element.semanticObject.semanticObject && typeof element.semanticObject.semanticObject === "object") {
              sSemObjExpression = compileExpression(pathInModel(element.semanticObject.semanticObject.$Path));
              element.semanticObject.semanticObject = sSemObjExpression;
              element.semanticObjectForGetLinks[0].semanticObject = sSemObjExpression;
              return true;
            } else if (element) {
              return element.semanticObject !== undefined;
            } else {
              return false;
            }
          });
          for (var j = 0; j < aSemanticObjectsResolved.length; j++) {
            _oSemanticObject = aSemanticObjectsResolved[j];
            if (_oSemanticObject && _oSemanticObject.semanticObject && !(_oSemanticObject.semanticObject.semanticObject.indexOf("{") === 0)) {
              aSemanticObjectsForGetLinks.push(_oSemanticObject.semanticObjectForGetLinks);
              aSemanticObjects.push({
                semanticObject: _oSemanticObject.semanticObject.semanticObject,
                unavailableActions: _oSemanticObject.unavailableActions,
                path: aSemanticObjectsResolved[j].semanticObjectPath
              });
              aGetLinksPromises.push(oShellServiceHelper.getLinksWithCache([_oSemanticObject.semanticObjectForGetLinks]));
            }
          }
          return CommonUtils.updateSemanticTargets(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash);
        }).catch(function (oError) {
          Log.error("fnGetSemanticTargetsFromTable: Cannot get Semantic Objects", oError);
        });
      }
    } else {
      return Promise.resolve();
    }
  }
  function getFilterRestrictions(oFilterRestrictionsAnnotation, sRestriction) {
    var FilterRestrictions = CommonUtils.FilterRestrictions;
    if (sRestriction === FilterRestrictions.REQUIRED_PROPERTIES || sRestriction === FilterRestrictions.NON_FILTERABLE_PROPERTIES) {
      var aProps = [];
      if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation[sRestriction]) {
        aProps = oFilterRestrictionsAnnotation[sRestriction].map(function (oProperty) {
          return oProperty.$PropertyPath;
        });
      }
      return aProps;
    } else if (sRestriction === FilterRestrictions.ALLOWED_EXPRESSIONS) {
      var mAllowedExpressions = {};
      if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation.FilterExpressionRestrictions) {
        oFilterRestrictionsAnnotation.FilterExpressionRestrictions.forEach(function (oProperty) {
          //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
          if (mAllowedExpressions[oProperty.Property.$PropertyPath]) {
            mAllowedExpressions[oProperty.Property.$PropertyPath].push(oProperty.AllowedExpressions);
          } else {
            mAllowedExpressions[oProperty.Property.$PropertyPath] = [oProperty.AllowedExpressions];
          }
        });
      }
      return mAllowedExpressions;
    }
    // Default return the FilterRestrictions Annotation
    return oFilterRestrictionsAnnotation;
  }
  function _fetchPropertiesForNavPath(paths, navPath, props) {
    var navPathPrefix = navPath + "/";
    return paths.reduce(function (outPaths, pathToCheck) {
      if (pathToCheck.startsWith(navPathPrefix)) {
        var outPath = pathToCheck.replace(navPathPrefix, "");
        if (outPaths.indexOf(outPath) === -1) {
          outPaths.push(outPath);
        }
      }
      return outPaths;
    }, props);
  }
  function getFilterRestrictionsByPath(entityPath, oMetaModel) {
    var oRet = {},
      FR = CommonUtils.FilterRestrictions;
    var oFilterRestrictions;
    var navigationText = "$NavigationPropertyBinding";
    var frTerm = "@Org.OData.Capabilities.V1.FilterRestrictions";
    var entityTypePathParts = entityPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
    var entityTypePath = "/".concat(entityTypePathParts.join("/"), "/");
    var entitySetPath = ModelHelper.getEntitySetPath(entityPath, oMetaModel);
    var entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
    var isContainment = oMetaModel.getObject("".concat(entityTypePath, "$ContainsTarget"));
    var containmentNavPath = isContainment && entityTypePathParts[entityTypePathParts.length - 1];

    //LEAST PRIORITY - Filter restrictions directly at Entity Set
    //e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
    if (!isContainment) {
      oFilterRestrictions = oMetaModel.getObject("".concat(entitySetPath).concat(frTerm));
      oRet[FR.REQUIRED_PROPERTIES] = getFilterRestrictions(oFilterRestrictions, FR.REQUIRED_PROPERTIES) || [];
      var resultContextCheck = oMetaModel.getObject("".concat(entityTypePath, "@com.sap.vocabularies.Common.v1.ResultContext"));
      if (!resultContextCheck) {
        oRet[FR.NON_FILTERABLE_PROPERTIES] = getFilterRestrictions(oFilterRestrictions, FR.NON_FILTERABLE_PROPERTIES) || [];
      }
      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet[FR.ALLOWED_EXPRESSIONS] = getFilterRestrictions(oFilterRestrictions, FR.ALLOWED_EXPRESSIONS) || {};
    }
    if (entityTypePathParts.length > 1) {
      var navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
      // In case of containment we take entitySet provided as parent. And in case of normal we would remove the last navigation from entitySetPath.
      var parentEntitySetPath = isContainment ? entitySetPath : "/".concat(entitySetPathParts.slice(0, -1).join("/".concat(navigationText, "/")));
      //THIRD HIGHEST PRIORITY - Reading property path restrictions - Annotation at main entity but directly on navigation property path
      //e.g. Parent Customer with PropertyPath="Set/CityName" ContextPath: Customer/Set
      var oParentRet = {};
      if (!navPath.includes("%2F")) {
        var oParentFR = oMetaModel.getObject("".concat(parentEntitySetPath).concat(frTerm));
        oRet[FR.REQUIRED_PROPERTIES] = _fetchPropertiesForNavPath(getFilterRestrictions(oParentFR, FR.REQUIRED_PROPERTIES) || [], navPath, oRet[FR.REQUIRED_PROPERTIES] || []);
        oRet[FR.NON_FILTERABLE_PROPERTIES] = _fetchPropertiesForNavPath(getFilterRestrictions(oParentFR, FR.NON_FILTERABLE_PROPERTIES) || [], navPath, oRet[FR.NON_FILTERABLE_PROPERTIES] || []);
        //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
        var completeAllowedExps = getFilterRestrictions(oParentFR, FR.ALLOWED_EXPRESSIONS) || {};
        oParentRet[FR.ALLOWED_EXPRESSIONS] = Object.keys(completeAllowedExps).reduce(function (outProp, propPath) {
          if (propPath.startsWith(navPath + "/")) {
            var outPropPath = propPath.replace(navPath + "/", "");
            outProp[outPropPath] = completeAllowedExps[propPath];
          }
          return outProp;
        }, {});
      }

      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet[FR.ALLOWED_EXPRESSIONS] = mergeObjects({}, oRet[FR.ALLOWED_EXPRESSIONS], oParentRet[FR.ALLOWED_EXPRESSIONS] || {});

      //SECOND HIGHEST priority - Navigation restrictions
      //e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
      var oNavRestrictions = CommonUtils.getNavigationRestrictions(oMetaModel, parentEntitySetPath, navPath.replaceAll("%2F", "/"));
      var oNavFilterRest = oNavRestrictions && oNavRestrictions["FilterRestrictions"];
      var navResReqProps = getFilterRestrictions(oNavFilterRest, FR.REQUIRED_PROPERTIES) || [];
      oRet[FR.REQUIRED_PROPERTIES] = uniqueSort(oRet[FR.REQUIRED_PROPERTIES].concat(navResReqProps));
      var navNonFilterProps = getFilterRestrictions(oNavFilterRest, FR.NON_FILTERABLE_PROPERTIES) || [];
      oRet[FR.NON_FILTERABLE_PROPERTIES] = uniqueSort(oRet[FR.NON_FILTERABLE_PROPERTIES].concat(navNonFilterProps));
      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet[FR.ALLOWED_EXPRESSIONS] = mergeObjects({}, oRet[FR.ALLOWED_EXPRESSIONS], getFilterRestrictions(oNavFilterRest, FR.ALLOWED_EXPRESSIONS) || {});

      //HIGHEST priority - Restrictions having target with navigation association entity
      // e.g. FR in "CustomerParameters/Set" ContextPath: "Customer/Set"
      var navAssociationEntityRest = oMetaModel.getObject("/".concat(entityTypePathParts.join("/")).concat(frTerm));
      var navAssocReqProps = getFilterRestrictions(navAssociationEntityRest, FR.REQUIRED_PROPERTIES) || [];
      oRet[FR.REQUIRED_PROPERTIES] = uniqueSort(oRet[FR.REQUIRED_PROPERTIES].concat(navAssocReqProps));
      var navAssocNonFilterProps = getFilterRestrictions(navAssociationEntityRest, FR.NON_FILTERABLE_PROPERTIES) || [];
      oRet[FR.NON_FILTERABLE_PROPERTIES] = uniqueSort(oRet[FR.NON_FILTERABLE_PROPERTIES].concat(navAssocNonFilterProps));
      //SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
      oRet[FR.ALLOWED_EXPRESSIONS] = mergeObjects({}, oRet[FR.ALLOWED_EXPRESSIONS], getFilterRestrictions(navAssociationEntityRest, FR.ALLOWED_EXPRESSIONS) || {});
    }
    return oRet;
  }
  function templateControlFragment(sFragmentName, oPreprocessorSettings, oOptions, oModifier) {
    oOptions = oOptions || {};
    if (oModifier) {
      return oModifier.templateControlFragment(sFragmentName, oPreprocessorSettings, oOptions.view).then(function (oFragment) {
        // This is required as Flex returns an HTMLCollection as templating result in XML time.
        return oModifier.targets === "xmlTree" && oFragment.length > 0 ? oFragment[0] : oFragment;
      });
    } else {
      return loadMacroLibrary().then(function () {
        return XMLPreprocessor.process(XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"), {
          name: sFragmentName
        }, oPreprocessorSettings);
      }).then(function (oFragment) {
        var oControl = oFragment.firstElementChild;
        if (!!oOptions.isXML && oControl) {
          return oControl;
        }
        return Fragment.load({
          id: oOptions.id,
          definition: oFragment,
          controller: oOptions.controller
        });
      });
    }
  }
  function getSingletonPath(path, metaModel) {
    var parts = path.split("/").filter(Boolean),
      propertyName = parts.pop(),
      navigationPath = parts.join("/"),
      entitySet = navigationPath && metaModel.getObject("/".concat(navigationPath));
    if ((entitySet === null || entitySet === void 0 ? void 0 : entitySet.$kind) === "Singleton") {
      var singletonName = parts[parts.length - 1];
      return "/".concat(singletonName, "/").concat(propertyName);
    }
    return undefined;
  }
  function requestSingletonProperty(path, model) {
    if (!path || !model) {
      return Promise.resolve(null);
    }
    var metaModel = model.getMetaModel();
    // Find the underlying entity set from the property path and check whether it is a singleton.
    var resolvedPath = getSingletonPath(path, metaModel);
    if (resolvedPath) {
      var propertyBinding = model.bindProperty(resolvedPath);
      return propertyBinding.requestValue();
    }
    return Promise.resolve(null);
  }
  function addEventToBindingInfo(oControl, sEventName, fHandler) {
    var oBindingInfo;
    var setBindingInfo = function () {
      if (oBindingInfo) {
        if (!oBindingInfo.events) {
          oBindingInfo.events = {};
        }
        if (!oBindingInfo.events[sEventName]) {
          oBindingInfo.events[sEventName] = fHandler;
        } else {
          var fOriginalHandler = oBindingInfo.events[sEventName];
          oBindingInfo.events[sEventName] = function () {
            for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
              args[_key] = arguments[_key];
            }
            fHandler.apply.apply(fHandler, [this].concat(args));
            fOriginalHandler.apply.apply(fOriginalHandler, [this].concat(args));
          };
        }
      }
    };
    if (oControl.isA("sap.ui.mdc.Chart")) {
      oControl.innerChartBound().then(function () {
        oBindingInfo = oControl.getControlDelegate()._getChart(oControl).getBindingInfo("data");
        setBindingInfo();
      }).catch(function (sError) {
        Log.error(sError);
      });
    } else {
      oBindingInfo = oControl.data("rowsBindingInfo");
      setBindingInfo();
    }
  }
  function loadMacroLibrary() {
    return new Promise(function (resolve) {
      sap.ui.require(["sap/fe/macros/macroLibrary"], function /*macroLibrary*/
      () {
        resolve();
      });
    });
  }

  // Get the path for action parameters that is needed to read the annotations
  function getParameterPath(sPath, sParameter) {
    var sContext;
    if (sPath.indexOf("@$ui5.overload") > -1) {
      sContext = sPath.split("@$ui5.overload")[0];
    } else {
      // For Unbound Actions in Action Parameter Dialogs
      var aAction = sPath.split("/0")[0].split(".");
      sContext = "/".concat(aAction[aAction.length - 1], "/");
    }
    return sContext + sParameter;
  }

  /**
   * Get resolved expression binding used for texts at runtime.
   *
   * @param expBinding
   * @param control
   * @function
   * @static
   * @memberof sap.fe.core.CommonUtils
   * @returns A string after resolution.
   * @ui5-restricted
   */
  function _fntranslatedTextFromExpBindingString(expBinding, control) {
    // The idea here is to create dummy element with the expresion binding.
    // Adding it as dependent to the view/control would propagate all the models to the dummy element and resolve the binding.
    // We remove the dummy element after that and destroy it.

    var anyResourceText = new AnyElement({
      anyText: expBinding
    });
    control.addDependent(anyResourceText);
    var resultText = anyResourceText.getAnyText();
    control.removeDependent(anyResourceText);
    anyResourceText.destroy();
    return resultText;
  }
  var CommonUtils = {
    isPropertyFilterable: isPropertyFilterable,
    isFieldControlPathInapplicable: isFieldControlPathInapplicable,
    removeSensitiveData: removeSensitiveData,
    fireButtonPress: fnFireButtonPress,
    getTargetView: getTargetView,
    getCurrentPageView: getCurrentPageView,
    hasTransientContext: fnHasTransientContexts,
    updateRelatedAppsDetails: fnUpdateRelatedAppsDetails,
    resolveStringtoBoolean: fnResolveStringtoBoolean,
    getAppComponent: getAppComponent,
    getMandatoryFilterFields: fnGetMandatoryFilterFields,
    getContextPathProperties: fnGetContextPathProperties,
    getParameterInfo: getParameterInfo,
    updateDataFieldForIBNButtonsVisibility: fnUpdateDataFieldForIBNButtonsVisibility,
    getTranslatedText: getTranslatedText,
    getEntitySetName: getEntitySetName,
    getActionPath: getActionPath,
    computeDisplayMode: computeDisplayMode,
    isStickyEditMode: isStickyEditMode,
    getOperatorsForProperty: getOperatorsForProperty,
    getOperatorsForDateProperty: getOperatorsForDateProperty,
    getOperatorsForGuidProperty: getOperatorsForGuidProperty,
    addSelectionVariantToConditions: addSelectionVariantToConditions,
    addExternalStateFiltersToSelectionVariant: addExternalStateFiltersToSelectionVariant,
    addPageContextToSelectionVariant: addPageContextToSelectionVariant,
    addDefaultDisplayCurrency: addDefaultDisplayCurrency,
    getNonComputedVisibleFields: getNonComputedVisibleFields,
    setUserDefaults: setUserDefaults,
    getShellServices: getShellServices,
    getHash: getHash,
    getIBNActions: fnGetIBNActions,
    getHeaderFacetItemConfigForExternalNavigation: getHeaderFacetItemConfigForExternalNavigation,
    getSemanticObjectMapping: getSemanticObjectMapping,
    setSemanticObjectMappings: setSemanticObjectMappings,
    getSemanticObjectPromise: fnGetSemanticObjectPromise,
    getSemanticTargetsFromPageModel: fnGetSemanticTargetsFromPageModel,
    getSemanticObjectsFromPath: fnGetSemanticObjectsFromPath,
    updateSemanticTargets: fnUpdateSemanticTargetsModel,
    getPropertyDataType: getPropertyDataType,
    getNavigationRestrictions: getNavigationRestrictions,
    getSearchRestrictions: getSearchRestrictions,
    getFilterRestrictionsByPath: getFilterRestrictionsByPath,
    getSpecificAllowedExpression: getSpecificAllowedExpression,
    getAdditionalParamsForCreate: getAdditionalParamsForCreate,
    requestSingletonProperty: requestSingletonProperty,
    templateControlFragment: templateControlFragment,
    addEventToBindingInfo: addEventToBindingInfo,
    FilterRestrictions: {
      REQUIRED_PROPERTIES: "RequiredProperties",
      NON_FILTERABLE_PROPERTIES: "NonFilterableProperties",
      ALLOWED_EXPRESSIONS: "FilterAllowedExpressions"
    },
    AllowedExpressionsPrio: ["SingleValue", "MultiValue", "SingleRange", "MultiRange", "SearchExpression", "MultiRangeOrSearchExpression"],
    normalizeSearchTerm: normalizeSearchTerm,
    getSingletonPath: getSingletonPath,
    getRequiredPropertiesFromUpdateRestrictions: getRequiredPropertiesFromUpdateRestrictions,
    getRequiredPropertiesFromInsertRestrictions: getRequiredPropertiesFromInsertRestrictions,
    hasRestrictedPropertiesInAnnotations: hasRestrictedPropertiesInAnnotations,
    getRequiredPropertiesFromAnnotations: getRequiredPropertiesFromAnnotations,
    getRequiredProperties: getRequiredProperties,
    checkIfResourceKeyExists: checkIfResourceKeyExists,
    setContextsBasedOnOperationAvailable: setContextsBasedOnOperationAvailable,
    setDynamicActionContexts: setDynamicActionContexts,
    requestProperty: requestProperty,
    getParameterPath: getParameterPath,
    getRelatedAppsMenuItems: _getRelatedAppsMenuItems,
    getTranslatedTextFromExpBindingString: _fntranslatedTextFromExpBindingString,
    addSemanticDatesToConditions: addSemanticDatesToConditions,
    addSelectOptionToConditions: addSelectOptionToConditions,
    createSemanticDatesFromConditions: createSemanticDatesFromConditions,
    updateRelateAppsModel: updateRelateAppsModel,
    getSemanticObjectAnnotations: _getSemanticObjectAnnotations
  };
  return CommonUtils;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiYXJyYXkiLCJjaGVjayIsImkiLCJwYWN0IiwicmVqZWN0IiwiX2N5Y2xlIiwibGVuZ3RoIiwidiIsImJpbmQiLCJ0aGVuYWJsZSIsInMiLCJwcm90b3R5cGUiLCJvbkZ1bGZpbGxlZCIsIm9uUmVqZWN0ZWQiLCJzdGF0ZSIsImNhbGxiYWNrIiwibyIsIl90aGlzIiwidmFsdWUiLCJvYnNlcnZlciIsInVwZGF0ZVJlbGF0ZUFwcHNNb2RlbCIsIm9CaW5kaW5nQ29udGV4dCIsIm9FbnRyeSIsIm9PYmplY3RQYWdlTGF5b3V0IiwiYVNlbUtleXMiLCJvTWV0YU1vZGVsIiwib01ldGFQYXRoIiwib1NoZWxsU2VydmljZUhlbHBlciIsImdldFNoZWxsU2VydmljZXMiLCJvUGFyYW0iLCJzQ3VycmVudFNlbU9iaiIsInNDdXJyZW50QWN0aW9uIiwib1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMiLCJhUmVsYXRlZEFwcHNNZW51SXRlbXMiLCJhRXhjbHVkZWRBY3Rpb25zIiwiZm5HZXRQYXJzZVNoZWxsSGFzaEFuZEdldExpbmtzIiwib1BhcnNlZFVybCIsInBhcnNlU2hlbGxIYXNoIiwiZG9jdW1lbnQiLCJsb2NhdGlvbiIsImhhc2giLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsIl9nZXRTT0ludGVudHMiLCJhTWFuaWZlc3RTT0tleXMiLCJhTGlua3MiLCJpc1NlbWFudGljT2JqZWN0SGFzU2FtZVRhcmdldEluTWFuaWZlc3QiLCJvVGFyZ2V0UGFyYW1zIiwiYUFubm90YXRpb25zU09JdGVtcyIsInNFbnRpdHlTZXRQYXRoIiwic0VudGl0eVR5cGVQYXRoIiwib0VudGl0eVNldEFubm90YXRpb25zIiwiZ2V0T2JqZWN0IiwiQ29tbW9uVXRpbHMiLCJnZXRTZW1hbnRpY09iamVjdEFubm90YXRpb25zIiwiYkhhc0VudGl0eVNldFNPIiwib0VudGl0eVR5cGVBbm5vdGF0aW9ucyIsImFVbmF2YWlsYWJsZUFjdGlvbnMiLCJwdXNoIiwibmF2aWdhdGlvbkNvbnRleHRzIiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwiYU1hcHBpbmdzIiwiX2dldFJlbGF0ZWRBcHBzTWVudUl0ZW1zIiwiYU1hbmlmZXN0U09JdGVtcyIsImZvckVhY2giLCJ0YXJnZXRTZW1PYmplY3QiLCJvTWFuaWZlc3REYXRhIiwiYWRkaXRpb25hbFNlbWFudGljT2JqZWN0cyIsImFsbG93ZWRBY3Rpb25zIiwiY29uY2F0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJzZXRQcm9wZXJ0eSIsImoiLCJzU2VtS2V5IiwiJFByb3BlcnR5UGF0aCIsImFUZWNobmljYWxLZXlzIiwia2V5Iiwic09iaktleSIsImdldFRhcmdldFZpZXciLCJnZXRWaWV3RGF0YSIsInNlbWFudGljT2JqZWN0SW50ZW50cyIsIk9iamVjdCIsImtleXMiLCJQcm9taXNlIiwicmVzb2x2ZSIsIl9nZXRSZWxhdGVkSW50ZW50cyIsImVycm9yIiwiTG9nIiwiYVZhbGlkVHlwZXMiLCJub3JtYWxpemVTZWFyY2hUZXJtIiwic1NlYXJjaFRlcm0iLCJ1bmRlZmluZWQiLCJyZXBsYWNlIiwic3BsaXQiLCJyZWR1Y2UiLCJzTm9ybWFsaXplZCIsInNDdXJyZW50V29yZCIsImdldFByb3BlcnR5RGF0YVR5cGUiLCJvTmF2aWdhdGlvbkNvbnRleHQiLCJzRGF0YVR5cGUiLCJnZXRQcm9wZXJ0eSIsInNBbm5vdGF0aW9uUGF0aCIsImluZGV4T2YiLCJmbkhhc1RyYW5zaWVudENvbnRleHRzIiwib0xpc3RCaW5kaW5nIiwiYkhhc1RyYW5zaWVudENvbnRleHRzIiwiZ2V0Q3VycmVudENvbnRleHRzIiwib0NvbnRleHQiLCJpc1RyYW5zaWVudCIsImdldFNlYXJjaFJlc3RyaWN0aW9ucyIsInNGdWxsUGF0aCIsIm9TZWFyY2hSZXN0cmljdGlvbnMiLCJvTmF2aWdhdGlvblNlYXJjaFJlc3RyaWN0aW9ucyIsIm5hdmlnYXRpb25UZXh0Iiwic2VhcmNoUmVzdHJpY3Rpb25zVGVybSIsImVudGl0eVR5cGVQYXRoUGFydHMiLCJyZXBsYWNlQWxsIiwiZmlsdGVyIiwiTW9kZWxIZWxwZXIiLCJmaWx0ZXJPdXROYXZQcm9wQmluZGluZyIsImVudGl0eVNldFBhdGgiLCJnZXRFbnRpdHlTZXRQYXRoIiwiZW50aXR5U2V0UGF0aFBhcnRzIiwiaXNDb250YWlubWVudCIsImpvaW4iLCJjb250YWlubWVudE5hdlBhdGgiLCJuYXZQYXRoIiwicGFyZW50RW50aXR5U2V0UGF0aCIsInNsaWNlIiwib05hdmlnYXRpb25SZXN0cmljdGlvbnMiLCJnZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zIiwib01vZGVsIiwic05hdmlnYXRpb25QYXRoIiwiYVJlc3RyaWN0ZWRQcm9wZXJ0aWVzIiwiUmVzdHJpY3RlZFByb3BlcnRpZXMiLCJmaW5kIiwib1Jlc3RyaWN0ZWRQcm9wZXJ0eSIsIk5hdmlnYXRpb25Qcm9wZXJ0eSIsIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoIiwiX2lzSW5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyIsInNDb250ZXh0UGF0aCIsImJJc05vdEZpbHRlcmFibGUiLCJvQW5ub3RhdGlvbiIsIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIiwic29tZSIsInByb3BlcnR5IiwiX2lzQ29udGV4dFBhdGhGaWx0ZXJhYmxlIiwic0NvbnRleFBhdGgiLCJhRVNQYXJ0cyIsInNwbGljZSIsImFDb250ZXh0Iiwic0NvbnRleHQiLCJpdGVtIiwiaW5kZXgiLCJvRmlsdGVyUmVzdHJpY3Rpb25zIiwiRmlsdGVyUmVzdHJpY3Rpb25zIiwiYU5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzIiwic1RhcmdldFByb3BlcnR5UGF0aCIsIm9Qcm9wZXJ0eVBhdGgiLCJpc1Byb3BlcnR5RmlsdGVyYWJsZSIsInNQcm9wZXJ0eSIsImJTa2lwSGlkZGVuRmlsdGVyIiwiRXJyb3IiLCJiSXNGaWx0ZXJhYmxlIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJzSGlkZGVuUGF0aCIsInNIaWRkZW5GaWx0ZXJQYXRoIiwiY29tcGlsZUV4cHJlc3Npb24iLCJub3QiLCJvciIsInBhdGhJbk1vZGVsIiwic1Byb3BlcnR5RGF0YVR5cGUiLCJvQ29udHJvbCIsImdldEFwcENvbXBvbmVudCIsImdldEhhc2giLCJzSGFzaCIsIndpbmRvdyIsIm9TZW1hbnRpY09iamVjdCIsImdldExpbmtzIiwicGFyYW1zIiwiX2NyZWF0ZU1hcHBpbmdzIiwib01hcHBpbmciLCJhU09NYXBwaW5ncyIsImFNYXBwaW5nS2V5cyIsIm9TZW1hbnRpY01hcHBpbmciLCJhSXRlbXMiLCJhQWxsb3dlZEFjdGlvbnMiLCJvTGluayIsInNJbnRlbnQiLCJpbnRlbnQiLCJzQWN0aW9uIiwiaW5jbHVkZXMiLCJ0ZXh0IiwidGFyZ2V0QWN0aW9uIiwidGFyZ2V0UGFyYW1zIiwib0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMiLCJ1bmF2YWlsYWJsZUFjdGlvbnMiLCJtYXBwaW5nIiwiX2dldFNlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMiLCJvRW50aXR5QW5ub3RhdGlvbnMiLCJzQW5ub3RhdGlvbk1hcHBpbmdUZXJtIiwic0Fubm90YXRpb25BY3Rpb25UZXJtIiwic1F1YWxpZmllciIsImZuVXBkYXRlUmVsYXRlZEFwcHNEZXRhaWxzIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJvUGF0aCIsImdldFBhdGgiLCJnZXRNZXRhUGF0aCIsInNTZW1hbnRpY0tleVZvY2FidWxhcnkiLCJyZXF1ZXN0T2JqZWN0IiwicmVxdWVzdGVkT2JqZWN0IiwiY2F0Y2giLCJvRXJyb3IiLCJmbkZpcmVCdXR0b25QcmVzcyIsIm9CdXR0b24iLCJhQXV0aG9yaXplZFR5cGVzIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwiZ2V0VmlzaWJsZSIsImdldEVuYWJsZWQiLCJmaXJlUHJlc3MiLCJmblJlc29sdmVTdHJpbmd0b0Jvb2xlYW4iLCJzVmFsdWUiLCJpc0EiLCJvT3duZXIiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsImdldEN1cnJlbnRQYWdlVmlldyIsIm9BcHBDb21wb25lbnQiLCJyb290Vmlld0NvbnRyb2xsZXIiLCJnZXRSb290Vmlld0NvbnRyb2xsZXIiLCJpc0ZjbEVuYWJsZWQiLCJnZXRSaWdodG1vc3RWaWV3IiwiZ2V0Um9vdENvbnRhaW5lciIsImdldEN1cnJlbnRQYWdlIiwiZ2V0Q29tcG9uZW50SW5zdGFuY2UiLCJnZXRSb290Q29udHJvbCIsImdldFBhcmVudCIsImlzRmllbGRDb250cm9sUGF0aEluYXBwbGljYWJsZSIsInNGaWVsZENvbnRyb2xQYXRoIiwib0F0dHJpYnV0ZSIsImJJbmFwcGxpY2FibGUiLCJhUGFydHMiLCJoYXNPd25Qcm9wZXJ0eSIsInJlbW92ZVNlbnNpdGl2ZURhdGEiLCJhQXR0cmlidXRlcyIsImFPdXRBdHRyaWJ1dGVzIiwic0VudGl0eVNldCIsImVudGl0eVNldCIsImNvbnRleHREYXRhIiwiYVByb3BlcnRpZXMiLCJzUHJvcCIsImFQcm9wZXJ0eUFubm90YXRpb25zIiwib0ZpZWxkQ29udHJvbCIsIl9mbkNoZWNrSXNNYXRjaCIsIm9PYmplY3QiLCJvS2V5c1RvQ2hlY2siLCJzS2V5IiwiZm5HZXRDb250ZXh0UGF0aFByb3BlcnRpZXMiLCJvRmlsdGVyIiwib0VudGl0eVR5cGUiLCJvUHJvcGVydGllcyIsInRlc3QiLCIka2luZCIsImZuR2V0TWFuZGF0b3J5RmlsdGVyRmllbGRzIiwiYU1hbmRhdG9yeUZpbHRlckZpZWxkcyIsImZuR2V0SUJOQWN0aW9ucyIsImFJQk5BY3Rpb25zIiwiYUFjdGlvbnMiLCJnZXRBY3Rpb25zIiwib0FjdGlvbiIsImdldEFjdGlvbiIsIm9NZW51IiwiZ2V0TWVudSIsImdldEl0ZW1zIiwib0l0ZW0iLCJkYXRhIiwiZm5VcGRhdGVEYXRhRmllbGRGb3JJQk5CdXR0b25zVmlzaWJpbGl0eSIsIm9WaWV3Iiwib1BhcmFtcyIsImZuR2V0TGlua3MiLCJvRGF0YSIsImFLZXlzIiwib0lCTkFjdGlvbiIsInNTZW1hbnRpY09iamVjdCIsImFMaW5rIiwic2V0VmlzaWJsZSIsImdldFRyYW5zbGF0ZWRUZXh0Iiwic0ZyYW1ld29ya0tleSIsIm9SZXNvdXJjZUJ1bmRsZSIsInNFbnRpdHlTZXROYW1lIiwic1Jlc291cmNlS2V5IiwiYlJlc291cmNlS2V5RXhpc3RzIiwiY2hlY2tJZlJlc291cmNlS2V5RXhpc3RzIiwiYUN1c3RvbUJ1bmRsZXMiLCJnZXRUZXh0IiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImhhc1RleHQiLCJnZXRBY3Rpb25QYXRoIiwiYlJldHVybk9ubHlQYXRoIiwic0FjdGlvbk5hbWUiLCJiQ2hlY2tTdGF0aWNWYWx1ZSIsInNFbnRpdHlUeXBlTmFtZSIsIiRUeXBlIiwic0VudGl0eU5hbWUiLCJnZXRFbnRpdHlTZXROYW1lIiwic0JpbmRpbmdQYXJhbWV0ZXIiLCJzRW50aXR5VHlwZSIsIm9FbnRpdHlDb250YWluZXIiLCJjb21wdXRlRGlzcGxheU1vZGUiLCJvUHJvcGVydHlBbm5vdGF0aW9ucyIsIm9Db2xsZWN0aW9uQW5ub3RhdGlvbnMiLCJvVGV4dEFubm90YXRpb24iLCJvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiIsIiRFbnVtTWVtYmVyIiwiX2dldEVudGl0eVR5cGUiLCJfcmVxdWVzdE9iamVjdCIsIm9TZWxlY3RlZENvbnRleHQiLCJuQnJhY2tldEluZGV4Iiwic1RhcmdldFR5cGUiLCJzQ3VycmVudFR5cGUiLCJnZXRCaW5kaW5nIiwiZ2V0Q29udGV4dCIsIndhcm5pbmciLCJyZXF1ZXN0UHJvcGVydHkiLCJzRHluYW1pY0FjdGlvbkVuYWJsZWRQYXRoIiwib1Byb21pc2UiLCJyZXF1ZXN0U2luZ2xldG9uUHJvcGVydHkiLCJ2UHJvcGVydHlWYWx1ZSIsInNldENvbnRleHRzQmFzZWRPbk9wZXJhdGlvbkF2YWlsYWJsZSIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsImFSZXF1ZXN0UHJvbWlzZXMiLCJhbGwiLCJhUmVzdWx0cyIsImFBcHBsaWNhYmxlQ29udGV4dHMiLCJhTm90QXBwbGljYWJsZUNvbnRleHRzIiwiYVJlc3VsdCIsInNldER5bmFtaWNBY3Rpb25Db250ZXh0cyIsInRyYWNlIiwiYUFwcGxpY2FibGUiLCJhTm90QXBwbGljYWJsZSIsInNEeW5hbWljQWN0aW9uUGF0aFByZWZpeCIsIm9JbnRlcm5hbE1vZGVsIiwiX2dldERlZmF1bHRPcGVyYXRvcnMiLCJzUHJvcGVydHlUeXBlIiwib0RhdGFDbGFzcyIsIlR5cGVVdGlsIiwiZ2V0RGF0YVR5cGVDbGFzc05hbWUiLCJvQmFzZVR5cGUiLCJnZXRCYXNlVHlwZSIsIkZpbHRlck9wZXJhdG9yVXRpbCIsImdldE9wZXJhdG9yc0ZvclR5cGUiLCJfZ2V0UmVzdHJpY3Rpb25zIiwiYURlZmF1bHRPcHMiLCJhRXhwcmVzc2lvbk9wcyIsImFPcGVyYXRvcnMiLCJzRWxlbWVudCIsInRvU3RyaW5nIiwiZ2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbiIsImFFeHByZXNzaW9ucyIsImFBbGxvd2VkRXhwcmVzc2lvbnNQcmlvcml0eSIsIkFsbG93ZWRFeHByZXNzaW9uc1ByaW8iLCJzb3J0IiwiYSIsImIiLCJnZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eSIsInNUeXBlIiwiYlVzZVNlbWFudGljRGF0ZVJhbmdlIiwic1NldHRpbmdzIiwiZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoIiwiYUVxdWFsc09wcyIsImFTaW5nbGVSYW5nZU9wcyIsImFTaW5nbGVSYW5nZURUQmFzaWNPcHMiLCJhU2luZ2xlVmFsdWVEYXRlT3BzIiwiYUJhc2ljRGF0ZVRpbWVPcHMiLCJhTXVsdGlSYW5nZU9wcyIsImFTZWFyY2hFeHByZXNzaW9uT3BzIiwiYVNlbWFudGljRGF0ZU9wc0V4dCIsIlNlbWFudGljRGF0ZU9wZXJhdG9ycyIsImdldFN1cHBvcnRlZE9wZXJhdGlvbnMiLCJiU2VtYW50aWNEYXRlUmFuZ2UiLCJhU2VtYW50aWNEYXRlT3BzIiwib1NldHRpbmdzIiwiSlNPTiIsInBhcnNlIiwiY3VzdG9tRGF0YSIsIm9wZXJhdG9yQ29uZmlndXJhdGlvbiIsImdldEZpbHRlck9wZXJhdGlvbnMiLCJnZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zIiwiYURlZmF1bHRPcGVyYXRvcnMiLCJzUmVzdHJpY3Rpb25zIiwiRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zIiwic0FsbG93ZWRFeHByZXNzaW9uIiwiYVNpbmdsZVZhbHVlT3BzIiwic09wZXJhdG9ycyIsImdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eSIsImFsbG93ZWRPcGVyYXRvcnNGb3JHdWlkIiwiZ2V0T3BlcmF0b3JzRm9yRGF0ZVByb3BlcnR5IiwicHJvcGVydHlUeXBlIiwiZ2V0UGFyYW1ldGVySW5mbyIsInNQYXJhbWV0ZXJDb250ZXh0UGF0aCIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIiwiYlJlc3VsdENvbnRleHQiLCJvUGFyYW1ldGVySW5mbyIsImNvbnRleHRQYXRoIiwicGFyYW1ldGVyUHJvcGVydGllcyIsImdldENvbnRleHRQYXRoUHJvcGVydGllcyIsImFkZFNlbGVjdE9wdGlvblRvQ29uZGl0aW9ucyIsIm9Qcm9wZXJ0eU1ldGFkYXRhIiwiYVZhbGlkT3BlcmF0b3JzIiwiYVNlbWFudGljRGF0ZU9wZXJhdG9ycyIsImFDdW11bGF0aXZlQ29uZGl0aW9ucyIsIm9TZWxlY3RPcHRpb24iLCJvQ29uZGl0aW9uIiwiZ2V0Q29uZGl0aW9ucyIsIlNlbWFudGljRGF0ZXMiLCJvcGVyYXRvciIsInNlbWFudGljRGF0ZXMiLCJhZGRTZW1hbnRpY0RhdGVzVG9Db25kaXRpb25zIiwib1NlbWFudGljRGF0ZXMiLCJ2YWx1ZXMiLCJoaWdoIiwibG93IiwiaXNFbXB0eSIsImFkZFNlbGVjdE9wdGlvbnNUb0NvbmRpdGlvbnMiLCJvU2VsZWN0aW9uVmFyaWFudCIsInNTZWxlY3RPcHRpb25Qcm9wIiwib0NvbmRpdGlvbnMiLCJzQ29uZGl0aW9uUGF0aCIsInNDb25kaXRpb25Qcm9wIiwib1ZhbGlkUHJvcGVydGllcyIsImlzUGFyYW1ldGVyIiwiYklzRkxQVmFsdWVQcmVzZW50Iiwib1ZpZXdEYXRhIiwiYUNvbmRpdGlvbnMiLCJhU2VsZWN0T3B0aW9ucyIsImdldFNlbGVjdE9wdGlvbiIsInNldHRpbmdzIiwiZ2V0RmlsdGVyQ29uZmlndXJhdGlvblNldHRpbmciLCJlbGVtZW50IiwiY3JlYXRlU2VtYW50aWNEYXRlc0Zyb21Db25kaXRpb25zIiwib0NvbmZpZyIsImNvbnRyb2xDb25maWd1cmF0aW9uIiwiZmlsdGVyQ29uZmlnIiwiZmlsdGVyRmllbGRzIiwiYWRkU2VsZWN0aW9uVmFyaWFudFRvQ29uZGl0aW9ucyIsImJJc0ZMUFZhbHVlcyIsImFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcyIsImdldFNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzIiwiYU1ldGFkYXRQcm9wZXJ0aWVzIiwib1ZhbGlkUGFyYW1ldGVyUHJvcGVydGllcyIsImJIYXNQYXJhbWV0ZXJzIiwiYU1ldGFkYXRhUGFyYW1ldGVycyIsInNNZXRhZGF0YVBhcmFtZXRlciIsInNTZWxlY3RPcHRpb25OYW1lIiwic3RhcnRzV2l0aCIsInNNZXRhZGF0YVByb3BlcnR5Iiwic1NlbGVjdE9wdGlvbiIsInNSZXBsYWNlZE9wdGlvbiIsInNGdWxsQ29udGV4dFBhdGgiLCJfY3JlYXRlQ29uZGl0aW9uc0Zvck5hdlByb3BlcnRpZXMiLCJzTWFpbkVudGl0eVNldFBhdGgiLCJhTmF2T2JqZWN0TmFtZXMiLCJzTmF2UGF0aCIsInNQcm9wZXJ0eU5hbWUiLCIkaXNDb2xsZWN0aW9uIiwic05hdlByb3BlcnR5UGF0aCIsImFkZFBhZ2VDb250ZXh0VG9TZWxlY3Rpb25WYXJpYW50IiwibVBhZ2VDb250ZXh0Iiwib05hdmlnYXRpb25TZXJ2aWNlIiwiZ2V0TmF2aWdhdGlvblNlcnZpY2UiLCJtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCIsInRvSlNPTlN0cmluZyIsImFkZEV4dGVybmFsU3RhdGVGaWx0ZXJzVG9TZWxlY3Rpb25WYXJpYW50IiwibUZpbHRlcnMiLCJvVGFyZ2V0SW5mbyIsIm9GaWx0ZXJCYXIiLCJzRmlsdGVyIiwiZm5HZXRTaWduQW5kT3B0aW9uIiwic09wZXJhdG9yIiwic0xvd1ZhbHVlIiwic0hpZ2hWYWx1ZSIsIm9TZWxlY3RPcHRpb25TdGF0ZSIsIm9wdGlvbiIsInNpZ24iLCJvRmlsdGVyQ29uZGl0aW9ucyIsImZpbHRlckNvbmRpdGlvbnMiLCJvRmlsdGVyc1dpdGhvdXRDb25mbGljdCIsImZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3QiLCJvVGFibGVQcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0IiwicHJvcGVydGllc1dpdGhvdXRDb25mbGljdCIsImFkZEZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQiLCJzZWxlY3Rpb25WYXJpYW50Iiwic0ZpbHRlck5hbWUiLCJzUGF0aCIsIm9Qcm9wZXJ0eUluZm8iLCJnZXRQcm9wZXJ0eUhlbHBlciIsIm9UeXBlQ29uZmlnIiwidHlwZUNvbmZpZyIsIm9UeXBlVXRpbCIsImdldENvbnRyb2xEZWxlZ2F0ZSIsImdldFR5cGVVdGlsIiwib09wZXJhdG9yIiwiZ2V0T3BlcmF0b3IiLCJSYW5nZU9wZXJhdG9yIiwib01vZGVsRmlsdGVyIiwiZ2V0TW9kZWxGaWx0ZXIiLCJ0eXBlSW5zdGFuY2UiLCJiYXNlVHlwZSIsImFGaWx0ZXJzIiwiZXhjbHVkZSIsImV4dGVybmFsaXplVmFsdWUiLCJnZXRWYWx1ZTEiLCJnZXRWYWx1ZTIiLCJ2YWx1ZTEiLCJ2YWx1ZTIiLCJhZGRTZWxlY3RPcHRpb24iLCJpc1N0aWNreUVkaXRNb2RlIiwiYklzU3RpY2t5TW9kZSIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsImJVSUVkaXRhYmxlIiwiYWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeSIsIm9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHMiLCJhU1ZPcHRpb24iLCJhRGVmYXVsdFNWT3B0aW9uIiwiZGlzcGxheUN1cnJlbmN5U2VsZWN0T3B0aW9uIiwic1NpZ24iLCJzT3B0aW9uIiwic0xvdyIsInNIaWdoIiwiZ2V0Tm9uQ29tcHV0ZWRWaXNpYmxlRmllbGRzIiwiJEtleSIsImFOb25Db21wdXRlZFZpc2libGVGaWVsZHMiLCJhSW1tdXRhYmxlVmlzaWJsZUZpZWxkcyIsIm9Bbm5vdGF0aW9ucyIsImJJc0tleSIsImJJc0ltbXV0YWJsZSIsImJJc05vbkNvbXB1dGVkIiwiYklzVmlzaWJsZSIsImJJc0NvbXB1dGVkRGVmYXVsdFZhbHVlIiwiYklzS2V5Q29tcHV0ZWREZWZhdWx0VmFsdWVXaXRoVGV4dCIsIm9EaWFnbm9zdGljcyIsImdldERpYWdub3N0aWNzIiwic01lc3NhZ2UiLCJhZGRJc3N1ZSIsIklzc3VlQ2F0ZWdvcnkiLCJBbm5vdGF0aW9uIiwiSXNzdWVTZXZlcml0eSIsIk1lZGl1bSIsIklzc3VlQ2F0ZWdvcnlUeXBlIiwiQW5ub3RhdGlvbnMiLCJJZ25vcmVkQW5ub3RhdGlvbiIsImFSZXF1aXJlZFByb3BlcnRpZXMiLCJnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zIiwiZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzIiwiYkNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zIiwiYVJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRocyIsImVuZHNXaXRoIiwib05hdlJlc3QiLCJoYXNSZXN0cmljdGVkUHJvcGVydGllc0luQW5ub3RhdGlvbnMiLCJSZXF1aXJlZFByb3BlcnRpZXMiLCJnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tQW5ub3RhdGlvbnMiLCJvUmVxdWlyZWRQcm9wZXJ0eSIsImdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnMiLCJiSXNOYXZpZ2F0aW9uUmVzdHJpY3Rpb25zIiwic2V0VXNlckRlZmF1bHRzIiwiYVBhcmFtZXRlcnMiLCJiSXNBY3Rpb24iLCJiSXNDcmVhdGUiLCJvQWN0aW9uRGVmYXVsdFZhbHVlcyIsIm9Db21wb25lbnREYXRhIiwiZ2V0Q29tcG9uZW50RGF0YSIsIm9TdGFydHVwUGFyYW1ldGVycyIsInN0YXJ0dXBQYXJhbWV0ZXJzIiwib1NoZWxsU2VydmljZXMiLCJoYXNVU2hlbGwiLCJvUGFyYW1ldGVyIiwiJE5hbWUiLCJzUGFyYW1ldGVyTmFtZSIsImdldFN0YXJ0dXBBcHBTdGF0ZSIsIm9TdGFydHVwQXBwU3RhdGUiLCJnZXREYXRhIiwiYUV4dGVuZGVkUGFyYW1ldGVycyIsIlNlbGVjdE9wdGlvbnMiLCJvRXh0ZW5kZWRQYXJhbWV0ZXIiLCJQcm9wZXJ0eU5hbWUiLCJvUmFuZ2UiLCJSYW5nZXMiLCJTaWduIiwiT3B0aW9uIiwiTG93IiwiZ2V0QWRkaXRpb25hbFBhcmFtc0ZvckNyZWF0ZSIsIm9JbmJvdW5kUGFyYW1ldGVycyIsIm9JbmJvdW5kcyIsImFDcmVhdGVQYXJhbWV0ZXJzIiwic1BhcmFtZXRlciIsInVzZUZvckNyZWF0ZSIsIm9SZXQiLCJzQ3JlYXRlUGFyYW1ldGVyIiwiYVZhbHVlcyIsImNyZWF0ZSIsImdldFNlbWFudGljT2JqZWN0TWFwcGluZyIsIm9PdXRib3VuZCIsImFTZW1hbnRpY09iamVjdE1hcHBpbmciLCJwYXJhbWV0ZXJzIiwic1BhcmFtIiwiZm9ybWF0IiwiZ2V0SGVhZGVyRmFjZXRJdGVtQ29uZmlnRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uIiwib0Nyb3NzTmF2Iiwib0hlYWRlckZhY2V0SXRlbXMiLCJzSWQiLCJvQ29udHJvbENvbmZpZyIsImNvbmZpZyIsIm5hdmlnYXRpb24iLCJ0YXJnZXRPdXRib3VuZCIsIm91dGJvdW5kIiwic091dGJvdW5kIiwiZ2VuZXJhdGUiLCJzZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzIiwidk1hcHBpbmdzIiwib01hcHBpbmdzIiwic0xvY2FsUHJvcGVydHkiLCJzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSIsInJlbW92ZVNlbGVjdE9wdGlvbiIsIm1hc3NBZGRTZWxlY3RPcHRpb24iLCJmbkdldFNlbWFudGljT2JqZWN0c0Zyb21QYXRoIiwiYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiYVNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3MiLCJzZW1hbnRpY09iamVjdFBhdGgiLCJzZW1hbnRpY09iamVjdEZvckdldExpbmtzIiwiZm5VcGRhdGVTZW1hbnRpY1RhcmdldHNNb2RlbCIsImFHZXRMaW5rc1Byb21pc2VzIiwiYVNlbWFudGljT2JqZWN0cyIsInNDdXJyZW50SGFzaCIsIl9vTGluayIsIl9zTGlua0ludGVudEFjdGlvbiIsImFGaW5hbExpbmtzIiwib0ZpbmFsU2VtYW50aWNPYmplY3RzIiwiYkludGVudEhhc0FjdGlvbnMiLCJrIiwib1RtcCIsInNBbHRlcm5hdGVQYXRoIiwiaGFzVGFyZ2V0c05vdEZpbHRlcmVkIiwiaGFzVGFyZ2V0cyIsImlMaW5rQ291bnQiLCJwYXRoIiwiSGFzVGFyZ2V0cyIsIkhhc1RhcmdldHNOb3RGaWx0ZXJlZCIsImFzc2lnbiIsInNTZW1hbnRpY09iamVjdE5hbWUiLCJtZXJnZU9iamVjdHMiLCJmbkdldFNlbWFudGljT2JqZWN0UHJvbWlzZSIsImdldFNlbWFudGljT2JqZWN0c0Zyb21QYXRoIiwiZm5QcmVwYXJlU2VtYW50aWNPYmplY3RzUHJvbWlzZXMiLCJfb0FwcENvbXBvbmVudCIsIl9vVmlldyIsIl9vTWV0YU1vZGVsIiwiX2FTZW1hbnRpY09iamVjdHNGb3VuZCIsIl9hU2VtYW50aWNPYmplY3RzUHJvbWlzZXMiLCJfS2V5cyIsInJlZ2V4UmVzdWx0IiwiZXhlYyIsImdldFNlbWFudGljT2JqZWN0UHJvbWlzZSIsImZuR2V0U2VtYW50aWNUYXJnZXRzRnJvbVBhZ2VNb2RlbCIsIm9Db250cm9sbGVyIiwic1BhZ2VNb2RlbCIsIl9mbmZpbmRWYWx1ZXNIZWxwZXIiLCJvYmoiLCJsaXN0IiwiQXJyYXkiLCJjaGlsZHJlbiIsIl9mbmZpbmRWYWx1ZXMiLCJfZm5EZWxldGVEdXBsaWNhdGVTZW1hbnRpY09iamVjdHMiLCJhU2VtYW50aWNPYmplY3RQYXRoIiwiZ2V0VmlldyIsImFTZW1hbnRpY09iamVjdHNQcm9taXNlcyIsIm9Db21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudCIsIm9QYWdlTW9kZWwiLCJzdHJpbmdpZnkiLCJfZ2V0T2JqZWN0IiwiYVNlbWFudGljT2JqZWN0c0ZvdW5kIiwiYVNlbWFudGljT2JqZWN0c0ZvckdldExpbmtzIiwiX29TZW1hbnRpY09iamVjdCIsInNTZW1PYmpFeHByZXNzaW9uIiwiYVNlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwiJFBhdGgiLCJnZXRMaW5rc1dpdGhDYWNoZSIsInVwZGF0ZVNlbWFudGljVGFyZ2V0cyIsImdldEZpbHRlclJlc3RyaWN0aW9ucyIsIm9GaWx0ZXJSZXN0cmljdGlvbnNBbm5vdGF0aW9uIiwic1Jlc3RyaWN0aW9uIiwiUkVRVUlSRURfUFJPUEVSVElFUyIsIk5PTl9GSUxURVJBQkxFX1BST1BFUlRJRVMiLCJhUHJvcHMiLCJtYXAiLCJvUHJvcGVydHkiLCJBTExPV0VEX0VYUFJFU1NJT05TIiwibUFsbG93ZWRFeHByZXNzaW9ucyIsIkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnMiLCJQcm9wZXJ0eSIsIkFsbG93ZWRFeHByZXNzaW9ucyIsIl9mZXRjaFByb3BlcnRpZXNGb3JOYXZQYXRoIiwicGF0aHMiLCJwcm9wcyIsIm5hdlBhdGhQcmVmaXgiLCJvdXRQYXRocyIsInBhdGhUb0NoZWNrIiwib3V0UGF0aCIsImVudGl0eVBhdGgiLCJGUiIsImZyVGVybSIsImVudGl0eVR5cGVQYXRoIiwicmVzdWx0Q29udGV4dENoZWNrIiwib1BhcmVudFJldCIsIm9QYXJlbnRGUiIsImNvbXBsZXRlQWxsb3dlZEV4cHMiLCJvdXRQcm9wIiwicHJvcFBhdGgiLCJvdXRQcm9wUGF0aCIsIm9OYXZSZXN0cmljdGlvbnMiLCJvTmF2RmlsdGVyUmVzdCIsIm5hdlJlc1JlcVByb3BzIiwidW5pcXVlU29ydCIsIm5hdk5vbkZpbHRlclByb3BzIiwibmF2QXNzb2NpYXRpb25FbnRpdHlSZXN0IiwibmF2QXNzb2NSZXFQcm9wcyIsIm5hdkFzc29jTm9uRmlsdGVyUHJvcHMiLCJ0ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudCIsInNGcmFnbWVudE5hbWUiLCJvUHJlcHJvY2Vzc29yU2V0dGluZ3MiLCJvT3B0aW9ucyIsIm9Nb2RpZmllciIsInZpZXciLCJvRnJhZ21lbnQiLCJ0YXJnZXRzIiwibG9hZE1hY3JvTGlicmFyeSIsIlhNTFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJYTUxUZW1wbGF0ZVByb2Nlc3NvciIsImxvYWRUZW1wbGF0ZSIsIm5hbWUiLCJmaXJzdEVsZW1lbnRDaGlsZCIsImlzWE1MIiwiRnJhZ21lbnQiLCJsb2FkIiwiaWQiLCJkZWZpbml0aW9uIiwiY29udHJvbGxlciIsImdldFNpbmdsZXRvblBhdGgiLCJtZXRhTW9kZWwiLCJwYXJ0cyIsIkJvb2xlYW4iLCJwcm9wZXJ0eU5hbWUiLCJwb3AiLCJuYXZpZ2F0aW9uUGF0aCIsInNpbmdsZXRvbk5hbWUiLCJtb2RlbCIsInJlc29sdmVkUGF0aCIsInByb3BlcnR5QmluZGluZyIsImJpbmRQcm9wZXJ0eSIsInJlcXVlc3RWYWx1ZSIsImFkZEV2ZW50VG9CaW5kaW5nSW5mbyIsInNFdmVudE5hbWUiLCJmSGFuZGxlciIsIm9CaW5kaW5nSW5mbyIsInNldEJpbmRpbmdJbmZvIiwiZXZlbnRzIiwiZk9yaWdpbmFsSGFuZGxlciIsImFyZ3MiLCJhcHBseSIsImlubmVyQ2hhcnRCb3VuZCIsIl9nZXRDaGFydCIsImdldEJpbmRpbmdJbmZvIiwic0Vycm9yIiwic2FwIiwidWkiLCJyZXF1aXJlIiwiZ2V0UGFyYW1ldGVyUGF0aCIsImFBY3Rpb24iLCJfZm50cmFuc2xhdGVkVGV4dEZyb21FeHBCaW5kaW5nU3RyaW5nIiwiZXhwQmluZGluZyIsImNvbnRyb2wiLCJhbnlSZXNvdXJjZVRleHQiLCJBbnlFbGVtZW50IiwiYW55VGV4dCIsImFkZERlcGVuZGVudCIsInJlc3VsdFRleHQiLCJnZXRBbnlUZXh0IiwicmVtb3ZlRGVwZW5kZW50IiwiZGVzdHJveSIsImZpcmVCdXR0b25QcmVzcyIsImhhc1RyYW5zaWVudENvbnRleHQiLCJ1cGRhdGVSZWxhdGVkQXBwc0RldGFpbHMiLCJyZXNvbHZlU3RyaW5ndG9Cb29sZWFuIiwiZ2V0TWFuZGF0b3J5RmlsdGVyRmllbGRzIiwidXBkYXRlRGF0YUZpZWxkRm9ySUJOQnV0dG9uc1Zpc2liaWxpdHkiLCJnZXRJQk5BY3Rpb25zIiwiZ2V0U2VtYW50aWNUYXJnZXRzRnJvbVBhZ2VNb2RlbCIsImdldFJlbGF0ZWRBcHBzTWVudUl0ZW1zIiwiZ2V0VHJhbnNsYXRlZFRleHRGcm9tRXhwQmluZGluZ1N0cmluZyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ29tbW9uVXRpbHMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29tbW9uQW5ub3RhdGlvblRlcm1zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9Db21tb25cIjtcbmltcG9ydCB0eXBlIFJlc291cmNlQnVuZGxlIGZyb20gXCJzYXAvYmFzZS9pMThuL1Jlc291cmNlQnVuZGxlXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB1bmlxdWVTb3J0IGZyb20gXCJzYXAvYmFzZS91dGlsL2FycmF5L3VuaXF1ZVNvcnRcIjtcbmltcG9ydCBtZXJnZU9iamVjdHMgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgeyBJc3N1ZUNhdGVnb3J5LCBJc3N1ZUNhdGVnb3J5VHlwZSwgSXNzdWVTZXZlcml0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSB7IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBub3QsIG9yLCBwYXRoSW5Nb2RlbCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCBTZW1hbnRpY0RhdGVPcGVyYXRvcnMgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU2VtYW50aWNEYXRlT3BlcmF0b3JzXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgeyBJU2hlbGxTZXJ2aWNlcyB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaGVsbFNlcnZpY2VzRmFjdG9yeVwiO1xuaW1wb3J0IFR5cGVVdGlsIGZyb20gXCJzYXAvZmUvY29yZS90eXBlL1R5cGVVdGlsXCI7XG5pbXBvcnQgeyBzZW1hbnRpY0RhdGVDb25maWd1cmF0aW9uIH0gZnJvbSBcInNhcC9mZS9uYXZpZ2F0aW9uL1NlbGVjdGlvblZhcmlhbnRcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCBGcmFnbWVudCBmcm9tIFwic2FwL3VpL2NvcmUvRnJhZ21lbnRcIjtcbmltcG9ydCB0eXBlIFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IFhNTFRlbXBsYXRlUHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS9YTUxUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yVXRpbCBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vRmlsdGVyT3BlcmF0b3JVdGlsXCI7XG5pbXBvcnQgUmFuZ2VPcGVyYXRvciBmcm9tIFwic2FwL3VpL21kYy9jb25kaXRpb24vUmFuZ2VPcGVyYXRvclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFWNENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuaW1wb3J0IEFueUVsZW1lbnQgZnJvbSBcIi4vY29udHJvbHMvQW55RWxlbWVudFwiO1xuaW1wb3J0IHsgZ2V0Q29uZGl0aW9ucyB9IGZyb20gXCIuL3RlbXBsYXRpbmcvRmlsdGVySGVscGVyXCI7XG5cbmNvbnN0IGFWYWxpZFR5cGVzID0gW1xuXHRcIkVkbS5Cb29sZWFuXCIsXG5cdFwiRWRtLkJ5dGVcIixcblx0XCJFZG0uRGF0ZVwiLFxuXHRcIkVkbS5EYXRlVGltZVwiLFxuXHRcIkVkbS5EYXRlVGltZU9mZnNldFwiLFxuXHRcIkVkbS5EZWNpbWFsXCIsXG5cdFwiRWRtLkRvdWJsZVwiLFxuXHRcIkVkbS5GbG9hdFwiLFxuXHRcIkVkbS5HdWlkXCIsXG5cdFwiRWRtLkludDE2XCIsXG5cdFwiRWRtLkludDMyXCIsXG5cdFwiRWRtLkludDY0XCIsXG5cdFwiRWRtLlNCeXRlXCIsXG5cdFwiRWRtLlNpbmdsZVwiLFxuXHRcIkVkbS5TdHJpbmdcIixcblx0XCJFZG0uVGltZVwiLFxuXHRcIkVkbS5UaW1lT2ZEYXlcIlxuXTtcblxudHlwZSBDb25kaXRpb25UeXBlID0ge1xuXHRvcGVyYXRvcjogc3RyaW5nO1xuXHR2YWx1ZXM6IEFycmF5PGFueT4gfCB1bmRlZmluZWQ7XG5cdHZhbGlkYXRlZD86IHN0cmluZztcbn07XG5cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNlYXJjaFRlcm0oc1NlYXJjaFRlcm06IHN0cmluZykge1xuXHRpZiAoIXNTZWFyY2hUZXJtKSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdHJldHVybiBzU2VhcmNoVGVybVxuXHRcdC5yZXBsYWNlKC9cIi9nLCBcIiBcIilcblx0XHQucmVwbGFjZSgvXFxcXC9nLCBcIlxcXFxcXFxcXCIpIC8vZXNjYXBlIGJhY2tzbGFzaCBjaGFyYWN0ZXJzLiBDYW4gYmUgcmVtb3ZlZCBpZiBvZGF0YS9iaW5kaW5nIGhhbmRsZXMgYmFja2VuZCBlcnJvcnMgcmVzcG9uZHMuXG5cdFx0LnNwbGl0KC9cXHMrLylcblx0XHQucmVkdWNlKGZ1bmN0aW9uIChzTm9ybWFsaXplZDogc3RyaW5nIHwgdW5kZWZpbmVkLCBzQ3VycmVudFdvcmQ6IHN0cmluZykge1xuXHRcdFx0aWYgKHNDdXJyZW50V29yZCAhPT0gXCJcIikge1xuXHRcdFx0XHRzTm9ybWFsaXplZCA9IGAke3NOb3JtYWxpemVkID8gYCR7c05vcm1hbGl6ZWR9IGAgOiBcIlwifVwiJHtzQ3VycmVudFdvcmR9XCJgO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHNOb3JtYWxpemVkO1xuXHRcdH0sIHVuZGVmaW5lZCk7XG59XG5cbmZ1bmN0aW9uIGdldFByb3BlcnR5RGF0YVR5cGUob05hdmlnYXRpb25Db250ZXh0OiBhbnkpIHtcblx0bGV0IHNEYXRhVHlwZSA9IG9OYXZpZ2F0aW9uQ29udGV4dC5nZXRQcm9wZXJ0eShcIiRUeXBlXCIpO1xuXHQvLyBpZiAka2luZCBleGlzdHMsIGl0J3Mgbm90IGEgRGF0YUZpZWxkIGFuZCB3ZSBoYXZlIHRoZSBmaW5hbCB0eXBlIGFscmVhZHlcblx0aWYgKCFvTmF2aWdhdGlvbkNvbnRleHQuZ2V0UHJvcGVydHkoXCIka2luZFwiKSkge1xuXHRcdHN3aXRjaCAoc0RhdGFUeXBlKSB7XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCI6XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCI6XG5cdFx0XHRcdHNEYXRhVHlwZSA9IHVuZGVmaW5lZDtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGhcIjpcblx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoVXJsXCI6XG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvblwiOlxuXHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhBY3Rpb25cIjpcblx0XHRcdFx0c0RhdGFUeXBlID0gb05hdmlnYXRpb25Db250ZXh0LmdldFByb3BlcnR5KFwiVmFsdWUvJFBhdGgvJFR5cGVcIik7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiOlxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Y29uc3Qgc0Fubm90YXRpb25QYXRoID0gb05hdmlnYXRpb25Db250ZXh0LmdldFByb3BlcnR5KFwiVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aFwiKTtcblx0XHRcdFx0aWYgKHNBbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0XHRcdGlmIChzQW5ub3RhdGlvblBhdGguaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQ29udGFjdFwiKSA+IC0xKSB7XG5cdFx0XHRcdFx0XHRzRGF0YVR5cGUgPSBvTmF2aWdhdGlvbkNvbnRleHQuZ2V0UHJvcGVydHkoXCJUYXJnZXQvJEFubm90YXRpb25QYXRoL2ZuLyRQYXRoLyRUeXBlXCIpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoc0Fubm90YXRpb25QYXRoLmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIikgPiAtMSkge1xuXHRcdFx0XHRcdFx0c0RhdGFUeXBlID0gb05hdmlnYXRpb25Db250ZXh0LmdldFByb3BlcnR5KFwiVmFsdWUvJFBhdGgvJFR5cGVcIik7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdC8vIGUuZy4gRmllbGRHcm91cCBvciBDaGFydFxuXHRcdFx0XHRcdFx0c0RhdGFUeXBlID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzRGF0YVR5cGUgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHNEYXRhVHlwZTtcbn1cblxuZnVuY3Rpb24gZm5IYXNUcmFuc2llbnRDb250ZXh0cyhvTGlzdEJpbmRpbmc6IGFueSkge1xuXHRsZXQgYkhhc1RyYW5zaWVudENvbnRleHRzID0gZmFsc2U7XG5cdGlmIChvTGlzdEJpbmRpbmcpIHtcblx0XHRvTGlzdEJpbmRpbmcuZ2V0Q3VycmVudENvbnRleHRzKCkuZm9yRWFjaChmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdFx0aWYgKG9Db250ZXh0ICYmIG9Db250ZXh0LmlzVHJhbnNpZW50KCkpIHtcblx0XHRcdFx0Ykhhc1RyYW5zaWVudENvbnRleHRzID0gdHJ1ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYkhhc1RyYW5zaWVudENvbnRleHRzO1xufVxuXG5mdW5jdGlvbiBnZXRTZWFyY2hSZXN0cmljdGlvbnMoc0Z1bGxQYXRoOiBhbnksIG9NZXRhTW9kZWw6IGFueSkge1xuXHRsZXQgb1NlYXJjaFJlc3RyaWN0aW9ucztcblx0bGV0IG9OYXZpZ2F0aW9uU2VhcmNoUmVzdHJpY3Rpb25zO1xuXHRjb25zdCBuYXZpZ2F0aW9uVGV4dCA9IFwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdcIjtcblx0Y29uc3Qgc2VhcmNoUmVzdHJpY3Rpb25zVGVybSA9IFwiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VhcmNoUmVzdHJpY3Rpb25zXCI7XG5cdGNvbnN0IGVudGl0eVR5cGVQYXRoUGFydHMgPSBzRnVsbFBhdGgucmVwbGFjZUFsbChcIiUyRlwiLCBcIi9cIikuc3BsaXQoXCIvXCIpLmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZyk7XG5cdGNvbnN0IGVudGl0eVNldFBhdGggPSBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKHNGdWxsUGF0aCwgb01ldGFNb2RlbCk7XG5cdGNvbnN0IGVudGl0eVNldFBhdGhQYXJ0cyA9IGVudGl0eVNldFBhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZyk7XG5cdGNvbnN0IGlzQ29udGFpbm1lbnQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7ZW50aXR5VHlwZVBhdGhQYXJ0cy5qb2luKFwiL1wiKX0vJENvbnRhaW5zVGFyZ2V0YCk7XG5cdGNvbnN0IGNvbnRhaW5tZW50TmF2UGF0aCA9IGlzQ29udGFpbm1lbnQgJiYgZW50aXR5VHlwZVBhdGhQYXJ0c1tlbnRpdHlUeXBlUGF0aFBhcnRzLmxlbmd0aCAtIDFdO1xuXG5cdC8vTEVBU1QgUFJJT1JJVFkgLSBTZWFyY2ggcmVzdHJpY3Rpb25zIGRpcmVjdGx5IGF0IEVudGl0eSBTZXRcblx0Ly9lLmcuIEZSIGluIFwiTlMuRW50aXR5Q29udGFpbmVyL1NhbGVzT3JkZXJNYW5hZ2VcIiBDb250ZXh0UGF0aDogL1NhbGVzT3JkZXJNYW5hZ2Vcblx0aWYgKCFpc0NvbnRhaW5tZW50KSB7XG5cdFx0b1NlYXJjaFJlc3RyaWN0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke2VudGl0eVNldFBhdGh9JHtzZWFyY2hSZXN0cmljdGlvbnNUZXJtfWApO1xuXHR9XG5cdGlmIChlbnRpdHlUeXBlUGF0aFBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRjb25zdCBuYXZQYXRoID0gaXNDb250YWlubWVudCA/IGNvbnRhaW5tZW50TmF2UGF0aCA6IGVudGl0eVNldFBhdGhQYXJ0c1tlbnRpdHlTZXRQYXRoUGFydHMubGVuZ3RoIC0gMV07XG5cdFx0Ly8gSW4gY2FzZSBvZiBjb250YWlubWVudCB3ZSB0YWtlIGVudGl0eVNldCBwcm92aWRlZCBhcyBwYXJlbnQuIEFuZCBpbiBjYXNlIG9mIG5vcm1hbCB3ZSB3b3VsZCByZW1vdmUgdGhlIGxhc3QgbmF2aWdhdGlvbiBmcm9tIGVudGl0eVNldFBhdGguXG5cdFx0Y29uc3QgcGFyZW50RW50aXR5U2V0UGF0aCA9IGlzQ29udGFpbm1lbnQgPyBlbnRpdHlTZXRQYXRoIDogYC8ke2VudGl0eVNldFBhdGhQYXJ0cy5zbGljZSgwLCAtMSkuam9pbihgLyR7bmF2aWdhdGlvblRleHR9L2ApfWA7XG5cblx0XHQvL0hJR0hFU1QgcHJpb3JpdHkgLSBOYXZpZ2F0aW9uIHJlc3RyaWN0aW9uc1xuXHRcdC8vZS5nLiBQYXJlbnQgXCIvQ3VzdG9tZXJcIiB3aXRoIE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg9XCJTZXRcIiBDb250ZXh0UGF0aDogQ3VzdG9tZXIvU2V0XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25SZXN0cmljdGlvbnMgPSBDb21tb25VdGlscy5nZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zKFxuXHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdHBhcmVudEVudGl0eVNldFBhdGgsXG5cdFx0XHRuYXZQYXRoLnJlcGxhY2VBbGwoXCIlMkZcIiwgXCIvXCIpXG5cdFx0KTtcblx0XHRvTmF2aWdhdGlvblNlYXJjaFJlc3RyaWN0aW9ucyA9IG9OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zICYmIG9OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zW1wiU2VhcmNoUmVzdHJpY3Rpb25zXCJdO1xuXHR9XG5cdHJldHVybiBvTmF2aWdhdGlvblNlYXJjaFJlc3RyaWN0aW9ucyB8fCBvU2VhcmNoUmVzdHJpY3Rpb25zO1xufVxuXG5mdW5jdGlvbiBnZXROYXZpZ2F0aW9uUmVzdHJpY3Rpb25zKG9Nb2RlbDogYW55LCBzRW50aXR5U2V0UGF0aDogYW55LCBzTmF2aWdhdGlvblBhdGg6IGFueSkge1xuXHRjb25zdCBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9QE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuTmF2aWdhdGlvblJlc3RyaWN0aW9uc2ApO1xuXHRjb25zdCBhUmVzdHJpY3RlZFByb3BlcnRpZXMgPSBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyAmJiBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucy5SZXN0cmljdGVkUHJvcGVydGllcztcblx0cmV0dXJuIChcblx0XHRhUmVzdHJpY3RlZFByb3BlcnRpZXMgJiZcblx0XHRhUmVzdHJpY3RlZFByb3BlcnRpZXMuZmluZChmdW5jdGlvbiAob1Jlc3RyaWN0ZWRQcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRvUmVzdHJpY3RlZFByb3BlcnR5ICYmXG5cdFx0XHRcdG9SZXN0cmljdGVkUHJvcGVydHkuTmF2aWdhdGlvblByb3BlcnR5ICYmXG5cdFx0XHRcdG9SZXN0cmljdGVkUHJvcGVydHkuTmF2aWdhdGlvblByb3BlcnR5LiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoID09PSBzTmF2aWdhdGlvblBhdGhcblx0XHRcdCk7XG5cdFx0fSlcblx0KTtcbn1cblxuZnVuY3Rpb24gX2lzSW5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyhvTW9kZWw6IGFueSwgc0VudGl0eVNldFBhdGg6IGFueSwgc0NvbnRleHRQYXRoOiBhbnkpIHtcblx0bGV0IGJJc05vdEZpbHRlcmFibGUgPSBmYWxzZTtcblx0Y29uc3Qgb0Fubm90YXRpb24gPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofUBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlclJlc3RyaWN0aW9uc2ApO1xuXHRpZiAob0Fubm90YXRpb24gJiYgb0Fubm90YXRpb24uTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMpIHtcblx0XHRiSXNOb3RGaWx0ZXJhYmxlID0gb0Fubm90YXRpb24uTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMuc29tZShmdW5jdGlvbiAocHJvcGVydHk6IGFueSkge1xuXHRcdFx0cmV0dXJuIHByb3BlcnR5LiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoID09PSBzQ29udGV4dFBhdGggfHwgcHJvcGVydHkuJFByb3BlcnR5UGF0aCA9PT0gc0NvbnRleHRQYXRoO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBiSXNOb3RGaWx0ZXJhYmxlO1xufVxuXG4vLyBUT0RPIHJld29yayB0aGlzIVxuZnVuY3Rpb24gX2lzQ29udGV4dFBhdGhGaWx0ZXJhYmxlKG9Nb2RlbDogYW55LCBzRW50aXR5U2V0UGF0aDogYW55LCBzQ29udGV4UGF0aDogYW55KSB7XG5cdGNvbnN0IHNGdWxsUGF0aCA9IGAke3NFbnRpdHlTZXRQYXRofS8ke3NDb250ZXhQYXRofWAsXG5cdFx0YUVTUGFydHMgPSBzRnVsbFBhdGguc3BsaXQoXCIvXCIpLnNwbGljZSgwLCAyKSxcblx0XHRhQ29udGV4dCA9IHNGdWxsUGF0aC5zcGxpdChcIi9cIikuc3BsaWNlKDIpO1xuXHRsZXQgYklzTm90RmlsdGVyYWJsZSA9IGZhbHNlLFxuXHRcdHNDb250ZXh0ID0gXCJcIjtcblxuXHRzRW50aXR5U2V0UGF0aCA9IGFFU1BhcnRzLmpvaW4oXCIvXCIpO1xuXG5cdGJJc05vdEZpbHRlcmFibGUgPSBhQ29udGV4dC5zb21lKGZ1bmN0aW9uIChpdGVtOiBzdHJpbmcsIGluZGV4OiBudW1iZXIsIGFycmF5OiBzdHJpbmdbXSkge1xuXHRcdGlmIChzQ29udGV4dC5sZW5ndGggPiAwKSB7XG5cdFx0XHRzQ29udGV4dCArPSBgLyR7aXRlbX1gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzQ29udGV4dCA9IGl0ZW07XG5cdFx0fVxuXHRcdGlmIChpbmRleCA9PT0gYXJyYXkubGVuZ3RoIC0gMikge1xuXHRcdFx0Ly8gSW4gY2FzZSBvZiBcIi9DdXN0b21lci9TZXQvUHJvcGVydHlcIiB0aGlzIGlzIHRvIGNoZWNrIG5hdmlnYXRpb24gcmVzdHJpY3Rpb25zIG9mIFwiQ3VzdG9tZXJcIiBmb3Igbm9uLWZpbHRlcmFibGUgcHJvcGVydGllcyBpbiBcIlNldFwiXG5cdFx0XHRjb25zdCBvTmF2aWdhdGlvblJlc3RyaWN0aW9ucyA9IGdldE5hdmlnYXRpb25SZXN0cmljdGlvbnMob01vZGVsLCBzRW50aXR5U2V0UGF0aCwgaXRlbSk7XG5cdFx0XHRjb25zdCBvRmlsdGVyUmVzdHJpY3Rpb25zID0gb05hdmlnYXRpb25SZXN0cmljdGlvbnMgJiYgb05hdmlnYXRpb25SZXN0cmljdGlvbnMuRmlsdGVyUmVzdHJpY3Rpb25zO1xuXHRcdFx0Y29uc3QgYU5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzID0gb0ZpbHRlclJlc3RyaWN0aW9ucyAmJiBvRmlsdGVyUmVzdHJpY3Rpb25zLk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzO1xuXHRcdFx0Y29uc3Qgc1RhcmdldFByb3BlcnR5UGF0aCA9IGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRhTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMgJiZcblx0XHRcdFx0YU5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzLmZpbmQoZnVuY3Rpb24gKG9Qcm9wZXJ0eVBhdGg6IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBvUHJvcGVydHlQYXRoLiRQcm9wZXJ0eVBhdGggPT09IHNUYXJnZXRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdH0pXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChpbmRleCA9PT0gYXJyYXkubGVuZ3RoIC0gMSkge1xuXHRcdFx0Ly9sYXN0IHBhdGggc2VnbWVudFxuXHRcdFx0YklzTm90RmlsdGVyYWJsZSA9IF9pc0luTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMob01vZGVsLCBzRW50aXR5U2V0UGF0aCwgc0NvbnRleHQpO1xuXHRcdH0gZWxzZSBpZiAob01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH0vJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvJHtpdGVtfWApKSB7XG5cdFx0XHQvL2NoZWNrIGV4aXN0aW5nIGNvbnRleHQgcGF0aCBhbmQgaW5pdGlhbGl6ZSBpdFxuXHRcdFx0YklzTm90RmlsdGVyYWJsZSA9IF9pc0luTm9uRmlsdGVyYWJsZVByb3BlcnRpZXMob01vZGVsLCBzRW50aXR5U2V0UGF0aCwgc0NvbnRleHQpO1xuXHRcdFx0c0NvbnRleHQgPSBcIlwiO1xuXHRcdFx0Ly9zZXQgdGhlIG5ldyBFbnRpdHlTZXRcblx0XHRcdHNFbnRpdHlTZXRQYXRoID0gYC8ke29Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGh9LyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nLyR7aXRlbX1gKX1gO1xuXHRcdH1cblx0XHRyZXR1cm4gYklzTm90RmlsdGVyYWJsZSA9PT0gdHJ1ZTtcblx0fSk7XG5cdHJldHVybiBiSXNOb3RGaWx0ZXJhYmxlO1xufVxuXG4vLyBUT0RPIGNoZWNrIHVzZWQgcGxhY2VzIGFuZCByZXdvcmsgdGhpc1xuZnVuY3Rpb24gaXNQcm9wZXJ0eUZpbHRlcmFibGUoXG5cdG9Nb2RlbDogT0RhdGFNZXRhTW9kZWwsXG5cdHNFbnRpdHlTZXRQYXRoOiBzdHJpbmcsXG5cdHNQcm9wZXJ0eTogc3RyaW5nLFxuXHRiU2tpcEhpZGRlbkZpbHRlcj86IGJvb2xlYW5cbik6IGJvb2xlYW4gfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGlmICh0eXBlb2Ygc1Byb3BlcnR5ICE9PSBcInN0cmluZ1wiKSB7XG5cdFx0dGhyb3cgbmV3IEVycm9yKFwic1Byb3BlcnR5IHBhcmFtZXRlciBtdXN0IGJlIGEgc3RyaW5nXCIpO1xuXHR9XG5cdGxldCBiSXNGaWx0ZXJhYmxlO1xuXG5cdC8vIFBhcmFtZXRlcnMgc2hvdWxkIGJlIHJlbmRlcmVkIGFzIGZpbHRlcmZpZWxkc1xuXHRpZiAob01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5U2V0UGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZXN1bHRDb250ZXh0YCkgPT09IHRydWUpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdGNvbnN0IG9OYXZpZ2F0aW9uQ29udGV4dCA9IG9Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgJHtzRW50aXR5U2V0UGF0aH0vJHtzUHJvcGVydHl9YCkgYXMgQ29udGV4dDtcblxuXHRpZiAoIWJTa2lwSGlkZGVuRmlsdGVyKSB7XG5cdFx0aWYgKFxuXHRcdFx0b05hdmlnYXRpb25Db250ZXh0LmdldFByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiKSA9PT0gdHJ1ZSB8fFxuXHRcdFx0b05hdmlnYXRpb25Db250ZXh0LmdldFByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbkZpbHRlclwiKSA9PT0gdHJ1ZVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRjb25zdCBzSGlkZGVuUGF0aCA9IG9OYXZpZ2F0aW9uQ29udGV4dC5nZXRQcm9wZXJ0eShcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW4vJFBhdGhcIik7XG5cdFx0Y29uc3Qgc0hpZGRlbkZpbHRlclBhdGggPSBvTmF2aWdhdGlvbkNvbnRleHQuZ2V0UHJvcGVydHkoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuRmlsdGVyLyRQYXRoXCIpO1xuXG5cdFx0aWYgKHNIaWRkZW5QYXRoICYmIHNIaWRkZW5GaWx0ZXJQYXRoKSB7XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24obm90KG9yKHBhdGhJbk1vZGVsKHNIaWRkZW5QYXRoKSwgcGF0aEluTW9kZWwoc0hpZGRlbkZpbHRlclBhdGgpKSkpO1xuXHRcdH0gZWxzZSBpZiAoc0hpZGRlblBhdGgpIHtcblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihub3QocGF0aEluTW9kZWwoc0hpZGRlblBhdGgpKSk7XG5cdFx0fSBlbHNlIGlmIChzSGlkZGVuRmlsdGVyUGF0aCkge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKG5vdChwYXRoSW5Nb2RlbChzSGlkZGVuRmlsdGVyUGF0aCkpKTtcblx0XHR9XG5cdH1cblxuXHRpZiAoc0VudGl0eVNldFBhdGguc3BsaXQoXCIvXCIpLmxlbmd0aCA9PT0gMiAmJiBzUHJvcGVydHkuaW5kZXhPZihcIi9cIikgPCAwKSB7XG5cdFx0Ly8gdGhlcmUgaXMgbm8gbmF2aWdhdGlvbiBpbiBlbnRpdHlTZXQgcGF0aCBhbmQgcHJvcGVydHkgcGF0aFxuXHRcdGJJc0ZpbHRlcmFibGUgPSAhX2lzSW5Ob25GaWx0ZXJhYmxlUHJvcGVydGllcyhvTW9kZWwsIHNFbnRpdHlTZXRQYXRoLCBzUHJvcGVydHkpO1xuXHR9IGVsc2Uge1xuXHRcdGJJc0ZpbHRlcmFibGUgPSAhX2lzQ29udGV4dFBhdGhGaWx0ZXJhYmxlKG9Nb2RlbCwgc0VudGl0eVNldFBhdGgsIHNQcm9wZXJ0eSk7XG5cdH1cblx0Ly8gY2hlY2sgaWYgdHlwZSBjYW4gYmUgdXNlZCBmb3IgZmlsdGVyaW5nXG5cdGlmIChiSXNGaWx0ZXJhYmxlICYmIG9OYXZpZ2F0aW9uQ29udGV4dCkge1xuXHRcdGNvbnN0IHNQcm9wZXJ0eURhdGFUeXBlID0gZ2V0UHJvcGVydHlEYXRhVHlwZShvTmF2aWdhdGlvbkNvbnRleHQpO1xuXHRcdGlmIChzUHJvcGVydHlEYXRhVHlwZSkge1xuXHRcdFx0YklzRmlsdGVyYWJsZSA9IGFWYWxpZFR5cGVzLmluZGV4T2Yoc1Byb3BlcnR5RGF0YVR5cGUpICE9PSAtMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YklzRmlsdGVyYWJsZSA9IGZhbHNlO1xuXHRcdH1cblx0fVxuXG5cdHJldHVybiBiSXNGaWx0ZXJhYmxlO1xufVxuXG5mdW5jdGlvbiBnZXRTaGVsbFNlcnZpY2VzKG9Db250cm9sOiBhbnkpOiBJU2hlbGxTZXJ2aWNlcyB7XG5cdHJldHVybiBnZXRBcHBDb21wb25lbnQob0NvbnRyb2wpLmdldFNoZWxsU2VydmljZXMoKTtcbn1cblxuZnVuY3Rpb24gZ2V0SGFzaCgpOiBzdHJpbmcge1xuXHRjb25zdCBzSGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuXHRyZXR1cm4gc0hhc2guc3BsaXQoXCImXCIpWzBdO1xufVxuXG5mdW5jdGlvbiBfZ2V0U09JbnRlbnRzKG9TaGVsbFNlcnZpY2VIZWxwZXI6IGFueSwgb09iamVjdFBhZ2VMYXlvdXQ6IGFueSwgb1NlbWFudGljT2JqZWN0OiBhbnksIG9QYXJhbTogYW55KTogUHJvbWlzZTxhbnk+IHtcblx0cmV0dXJuIG9TaGVsbFNlcnZpY2VIZWxwZXIuZ2V0TGlua3Moe1xuXHRcdHNlbWFudGljT2JqZWN0OiBvU2VtYW50aWNPYmplY3QsXG5cdFx0cGFyYW1zOiBvUGFyYW1cblx0fSk7XG59XG5cbi8vIFRPLURPIGFkZCB0aGlzIGFzIHBhcnQgb2YgYXBwbHlTZW1hbnRpY09iamVjdG1hcHBpbmdzIGxvZ2ljIGluIEludGVudEJhc2VkbmF2aWdhdGlvbiBjb250cm9sbGVyIGV4dGVuc2lvblxuZnVuY3Rpb24gX2NyZWF0ZU1hcHBpbmdzKG9NYXBwaW5nOiBhbnkpIHtcblx0Y29uc3QgYVNPTWFwcGluZ3MgPSBbXTtcblx0Y29uc3QgYU1hcHBpbmdLZXlzID0gT2JqZWN0LmtleXMob01hcHBpbmcpO1xuXHRsZXQgb1NlbWFudGljTWFwcGluZztcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTWFwcGluZ0tleXMubGVuZ3RoOyBpKyspIHtcblx0XHRvU2VtYW50aWNNYXBwaW5nID0ge1xuXHRcdFx0XCJMb2NhbFByb3BlcnR5XCI6IHtcblx0XHRcdFx0XCIkUHJvcGVydHlQYXRoXCI6IGFNYXBwaW5nS2V5c1tpXVxuXHRcdFx0fSxcblx0XHRcdFwiU2VtYW50aWNPYmplY3RQcm9wZXJ0eVwiOiBvTWFwcGluZ1thTWFwcGluZ0tleXNbaV1dXG5cdFx0fTtcblx0XHRhU09NYXBwaW5ncy5wdXNoKG9TZW1hbnRpY01hcHBpbmcpO1xuXHR9XG5cblx0cmV0dXJuIGFTT01hcHBpbmdzO1xufVxuXG4vKipcbiAqIEBwYXJhbSBhTGlua3NcbiAqIEBwYXJhbSBhRXhjbHVkZWRBY3Rpb25zXG4gKiBAcGFyYW0gb1RhcmdldFBhcmFtc1xuICogQHBhcmFtIGFJdGVtc1xuICogQHBhcmFtIGFBbGxvd2VkQWN0aW9uc1xuICovXG5mdW5jdGlvbiBfZ2V0UmVsYXRlZEFwcHNNZW51SXRlbXMoYUxpbmtzOiBhbnksIGFFeGNsdWRlZEFjdGlvbnM6IGFueSwgb1RhcmdldFBhcmFtczogYW55LCBhSXRlbXM6IGFueSwgYUFsbG93ZWRBY3Rpb25zPzogYW55KSB7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgYUxpbmtzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3Qgb0xpbmsgPSBhTGlua3NbaV07XG5cdFx0Y29uc3Qgc0ludGVudCA9IG9MaW5rLmludGVudDtcblx0XHRjb25zdCBzQWN0aW9uID0gc0ludGVudC5zcGxpdChcIi1cIilbMV0uc3BsaXQoXCI/XCIpWzBdO1xuXHRcdGlmIChhQWxsb3dlZEFjdGlvbnMgJiYgYUFsbG93ZWRBY3Rpb25zLmluY2x1ZGVzKHNBY3Rpb24pKSB7XG5cdFx0XHRhSXRlbXMucHVzaCh7XG5cdFx0XHRcdHRleHQ6IG9MaW5rLnRleHQsXG5cdFx0XHRcdHRhcmdldFNlbU9iamVjdDogc0ludGVudC5zcGxpdChcIiNcIilbMV0uc3BsaXQoXCItXCIpWzBdLFxuXHRcdFx0XHR0YXJnZXRBY3Rpb246IHNBY3Rpb24uc3BsaXQoXCJ+XCIpWzBdLFxuXHRcdFx0XHR0YXJnZXRQYXJhbXM6IG9UYXJnZXRQYXJhbXNcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSBpZiAoIWFBbGxvd2VkQWN0aW9ucyAmJiBhRXhjbHVkZWRBY3Rpb25zICYmIGFFeGNsdWRlZEFjdGlvbnMuaW5kZXhPZihzQWN0aW9uKSA9PT0gLTEpIHtcblx0XHRcdGFJdGVtcy5wdXNoKHtcblx0XHRcdFx0dGV4dDogb0xpbmsudGV4dCxcblx0XHRcdFx0dGFyZ2V0U2VtT2JqZWN0OiBzSW50ZW50LnNwbGl0KFwiI1wiKVsxXS5zcGxpdChcIi1cIilbMF0sXG5cdFx0XHRcdHRhcmdldEFjdGlvbjogc0FjdGlvbi5zcGxpdChcIn5cIilbMF0sXG5cdFx0XHRcdHRhcmdldFBhcmFtczogb1RhcmdldFBhcmFtc1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogQHBhcmFtIG9BZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzXG4gKiBAcGFyYW0gb0JpbmRpbmdDb250ZXh0XG4gKiBAcGFyYW0gYU1hbmlmZXN0U09JdGVtc1xuICogQHBhcmFtIGFMaW5rc1xuICovXG5mdW5jdGlvbiBfZ2V0UmVsYXRlZEludGVudHMob0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHM6IGFueSwgb0JpbmRpbmdDb250ZXh0OiBhbnksIGFNYW5pZmVzdFNPSXRlbXM6IGFueSwgYUxpbmtzOiBhbnkpIHtcblx0aWYgKGFMaW5rcyAmJiBhTGlua3MubGVuZ3RoID4gMCkge1xuXHRcdGNvbnN0IGFBbGxvd2VkQWN0aW9ucyA9IG9BZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzLmFsbG93ZWRBY3Rpb25zIHx8IHVuZGVmaW5lZDtcblx0XHRjb25zdCBhRXhjbHVkZWRBY3Rpb25zID0gb0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMudW5hdmFpbGFibGVBY3Rpb25zID8gb0FkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMudW5hdmFpbGFibGVBY3Rpb25zIDogW107XG5cdFx0Y29uc3QgYVNPTWFwcGluZ3MgPSBvQWRkaXRpb25hbFNlbWFudGljT2JqZWN0cy5tYXBwaW5nID8gX2NyZWF0ZU1hcHBpbmdzKG9BZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzLm1hcHBpbmcpIDogW107XG5cdFx0Y29uc3Qgb1RhcmdldFBhcmFtcyA9IHsgbmF2aWdhdGlvbkNvbnRleHRzOiBvQmluZGluZ0NvbnRleHQsIHNlbWFudGljT2JqZWN0TWFwcGluZzogYVNPTWFwcGluZ3MgfTtcblx0XHRfZ2V0UmVsYXRlZEFwcHNNZW51SXRlbXMoYUxpbmtzLCBhRXhjbHVkZWRBY3Rpb25zLCBvVGFyZ2V0UGFyYW1zLCBhTWFuaWZlc3RTT0l0ZW1zLCBhQWxsb3dlZEFjdGlvbnMpO1xuXHR9XG59XG5cbmFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVJlbGF0ZUFwcHNNb2RlbChcblx0dGhpczogYW55LFxuXHRvQmluZGluZ0NvbnRleHQ6IGFueSxcblx0b0VudHJ5OiBhbnksXG5cdG9PYmplY3RQYWdlTGF5b3V0OiBhbnksXG5cdGFTZW1LZXlzOiBhbnksXG5cdG9NZXRhTW9kZWw6IGFueSxcblx0b01ldGFQYXRoOiBhbnlcbikge1xuXHRjb25zdCBvU2hlbGxTZXJ2aWNlSGVscGVyOiBJU2hlbGxTZXJ2aWNlcyA9IGdldFNoZWxsU2VydmljZXMob09iamVjdFBhZ2VMYXlvdXQpO1xuXHRjb25zdCBvUGFyYW06IGFueSA9IHt9O1xuXHRsZXQgc0N1cnJlbnRTZW1PYmogPSBcIlwiLFxuXHRcdHNDdXJyZW50QWN0aW9uID0gXCJcIjtcblx0bGV0IG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zO1xuXHRsZXQgYVJlbGF0ZWRBcHBzTWVudUl0ZW1zOiBhbnlbXSA9IFtdO1xuXHRsZXQgYUV4Y2x1ZGVkQWN0aW9uczogYW55W10gPSBbXTtcblx0bGV0IGFNYW5pZmVzdFNPS2V5czogc3RyaW5nW107XG5cblx0ZnVuY3Rpb24gZm5HZXRQYXJzZVNoZWxsSGFzaEFuZEdldExpbmtzKCkge1xuXHRcdGNvbnN0IG9QYXJzZWRVcmwgPSBvU2hlbGxTZXJ2aWNlSGVscGVyLnBhcnNlU2hlbGxIYXNoKGRvY3VtZW50LmxvY2F0aW9uLmhhc2gpO1xuXHRcdHNDdXJyZW50U2VtT2JqID0gb1BhcnNlZFVybC5zZW1hbnRpY09iamVjdDsgLy8gQ3VycmVudCBTZW1hbnRpYyBPYmplY3Rcblx0XHRzQ3VycmVudEFjdGlvbiA9IG9QYXJzZWRVcmwuYWN0aW9uO1xuXHRcdHJldHVybiBfZ2V0U09JbnRlbnRzKG9TaGVsbFNlcnZpY2VIZWxwZXIsIG9PYmplY3RQYWdlTGF5b3V0LCBzQ3VycmVudFNlbU9iaiwgb1BhcmFtKTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0aWYgKG9FbnRyeSkge1xuXHRcdFx0aWYgKGFTZW1LZXlzICYmIGFTZW1LZXlzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBhU2VtS2V5cy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdGNvbnN0IHNTZW1LZXkgPSBhU2VtS2V5c1tqXS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdGlmICghb1BhcmFtW3NTZW1LZXldKSB7XG5cdFx0XHRcdFx0XHRvUGFyYW1bc1NlbUtleV0gPSB7IHZhbHVlOiBvRW50cnlbc1NlbUtleV0gfTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGZhbGxiYWNrIHRvIFRlY2huaWNhbCBLZXlzIGlmIG5vIFNlbWFudGljIEtleSBpcyBwcmVzZW50XG5cdFx0XHRcdGNvbnN0IGFUZWNobmljYWxLZXlzID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7b01ldGFQYXRofS8kVHlwZS8kS2V5YCk7XG5cdFx0XHRcdGZvciAoY29uc3Qga2V5IGluIGFUZWNobmljYWxLZXlzKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc09iaktleSA9IGFUZWNobmljYWxLZXlzW2tleV07XG5cdFx0XHRcdFx0aWYgKCFvUGFyYW1bc09iaktleV0pIHtcblx0XHRcdFx0XHRcdG9QYXJhbVtzT2JqS2V5XSA9IHsgdmFsdWU6IG9FbnRyeVtzT2JqS2V5XSB9O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHQvLyBMb2dpYyB0byByZWFkIGFkZGl0aW9uYWwgU08gZnJvbSBtYW5pZmVzdCBhbmQgdXBkYXRlZCByZWxhdGVkYXBwcyBtb2RlbFxuXG5cdFx0Y29uc3Qgb01hbmlmZXN0RGF0YSA9IGdldFRhcmdldFZpZXcob09iamVjdFBhZ2VMYXlvdXQpLmdldFZpZXdEYXRhKCk7XG5cdFx0Y29uc3QgYU1hbmlmZXN0U09JdGVtczogYW55W10gPSBbXTtcblx0XHRsZXQgc2VtYW50aWNPYmplY3RJbnRlbnRzO1xuXHRcdGlmIChvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHMpIHtcblx0XHRcdGFNYW5pZmVzdFNPS2V5cyA9IE9iamVjdC5rZXlzKG9NYW5pZmVzdERhdGEuYWRkaXRpb25hbFNlbWFudGljT2JqZWN0cyk7XG5cdFx0XHRmb3IgKGxldCBrZXkgPSAwOyBrZXkgPCBhTWFuaWZlc3RTT0tleXMubGVuZ3RoOyBrZXkrKykge1xuXHRcdFx0XHRzZW1hbnRpY09iamVjdEludGVudHMgPSBhd2FpdCBQcm9taXNlLnJlc29sdmUoXG5cdFx0XHRcdFx0X2dldFNPSW50ZW50cyhvU2hlbGxTZXJ2aWNlSGVscGVyLCBvT2JqZWN0UGFnZUxheW91dCwgYU1hbmlmZXN0U09LZXlzW2tleV0sIG9QYXJhbSlcblx0XHRcdFx0KTtcblx0XHRcdFx0X2dldFJlbGF0ZWRJbnRlbnRzKFxuXHRcdFx0XHRcdG9NYW5pZmVzdERhdGEuYWRkaXRpb25hbFNlbWFudGljT2JqZWN0c1thTWFuaWZlc3RTT0tleXNba2V5XV0sXG5cdFx0XHRcdFx0b0JpbmRpbmdDb250ZXh0LFxuXHRcdFx0XHRcdGFNYW5pZmVzdFNPSXRlbXMsXG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RJbnRlbnRzXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Y29uc3QgYUxpbmtzID0gYXdhaXQgZm5HZXRQYXJzZVNoZWxsSGFzaEFuZEdldExpbmtzKCk7XG5cdFx0aWYgKGFMaW5rcykge1xuXHRcdFx0aWYgKGFMaW5rcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGxldCBpc1NlbWFudGljT2JqZWN0SGFzU2FtZVRhcmdldEluTWFuaWZlc3QgPSBmYWxzZTtcblx0XHRcdFx0Y29uc3Qgb1RhcmdldFBhcmFtczogYW55ID0ge307XG5cdFx0XHRcdGNvbnN0IGFBbm5vdGF0aW9uc1NPSXRlbXM6IGFueVtdID0gW107XG5cdFx0XHRcdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gYCR7b01ldGFQYXRofUBgO1xuXHRcdFx0XHRjb25zdCBzRW50aXR5VHlwZVBhdGggPSBgJHtvTWV0YVBhdGh9L0BgO1xuXHRcdFx0XHRjb25zdCBvRW50aXR5U2V0QW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzRW50aXR5U2V0UGF0aCk7XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zID0gQ29tbW9uVXRpbHMuZ2V0U2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyhvRW50aXR5U2V0QW5ub3RhdGlvbnMsIHNDdXJyZW50U2VtT2JqKTtcblx0XHRcdFx0aWYgKCFvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5iSGFzRW50aXR5U2V0U08pIHtcblx0XHRcdFx0XHRjb25zdCBvRW50aXR5VHlwZUFubm90YXRpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3Qoc0VudGl0eVR5cGVQYXRoKTtcblx0XHRcdFx0XHRvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucyA9IENvbW1vblV0aWxzLmdldFNlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMob0VudGl0eVR5cGVBbm5vdGF0aW9ucywgc0N1cnJlbnRTZW1PYmopO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGFFeGNsdWRlZEFjdGlvbnMgPSBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5hVW5hdmFpbGFibGVBY3Rpb25zO1xuXHRcdFx0XHQvL1NraXAgc2FtZSBhcHBsaWNhdGlvbiBmcm9tIFJlbGF0ZWQgQXBwc1xuXHRcdFx0XHRhRXhjbHVkZWRBY3Rpb25zLnB1c2goc0N1cnJlbnRBY3Rpb24pO1xuXHRcdFx0XHRvVGFyZ2V0UGFyYW1zLm5hdmlnYXRpb25Db250ZXh0cyA9IG9CaW5kaW5nQ29udGV4dDtcblx0XHRcdFx0b1RhcmdldFBhcmFtcy5zZW1hbnRpY09iamVjdE1hcHBpbmcgPSBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5hTWFwcGluZ3M7XG5cdFx0XHRcdF9nZXRSZWxhdGVkQXBwc01lbnVJdGVtcyhhTGlua3MsIGFFeGNsdWRlZEFjdGlvbnMsIG9UYXJnZXRQYXJhbXMsIGFBbm5vdGF0aW9uc1NPSXRlbXMpO1xuXG5cdFx0XHRcdGFNYW5pZmVzdFNPSXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoeyB0YXJnZXRTZW1PYmplY3QgfSkge1xuXHRcdFx0XHRcdGlmIChhQW5ub3RhdGlvbnNTT0l0ZW1zWzBdPy50YXJnZXRTZW1PYmplY3QgPT09IHRhcmdldFNlbU9iamVjdCkge1xuXHRcdFx0XHRcdFx0aXNTZW1hbnRpY09iamVjdEhhc1NhbWVUYXJnZXRJbk1hbmlmZXN0ID0gdHJ1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIHJlbW92ZSBhbGwgYWN0aW9ucyBmcm9tIGN1cnJlbnQgaGFzaCBhcHBsaWNhdGlvbiBpZiBtYW5pZmVzdCBjb250YWlucyBlbXB0eSBhbGxvd2VkQWN0aW9uc1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0b01hbmlmZXN0RGF0YS5hZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzICYmXG5cdFx0XHRcdFx0YUFubm90YXRpb25zU09JdGVtc1swXSAmJlxuXHRcdFx0XHRcdG9NYW5pZmVzdERhdGEuYWRkaXRpb25hbFNlbWFudGljT2JqZWN0c1thQW5ub3RhdGlvbnNTT0l0ZW1zWzBdLnRhcmdldFNlbU9iamVjdF0gJiZcblx0XHRcdFx0XHRvTWFuaWZlc3REYXRhLmFkZGl0aW9uYWxTZW1hbnRpY09iamVjdHNbYUFubm90YXRpb25zU09JdGVtc1swXS50YXJnZXRTZW1PYmplY3RdLmFsbG93ZWRBY3Rpb25zICYmXG5cdFx0XHRcdFx0b01hbmlmZXN0RGF0YS5hZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzW2FBbm5vdGF0aW9uc1NPSXRlbXNbMF0udGFyZ2V0U2VtT2JqZWN0XS5hbGxvd2VkQWN0aW9ucy5sZW5ndGggPT09IDBcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0aXNTZW1hbnRpY09iamVjdEhhc1NhbWVUYXJnZXRJbk1hbmlmZXN0ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGFSZWxhdGVkQXBwc01lbnVJdGVtcyA9IGlzU2VtYW50aWNPYmplY3RIYXNTYW1lVGFyZ2V0SW5NYW5pZmVzdFxuXHRcdFx0XHRcdD8gYU1hbmlmZXN0U09JdGVtc1xuXHRcdFx0XHRcdDogYU1hbmlmZXN0U09JdGVtcy5jb25jYXQoYUFubm90YXRpb25zU09JdGVtcyk7XG5cdFx0XHRcdC8vIElmIG5vIGFwcCBpbiBsaXN0LCByZWxhdGVkIGFwcHMgYnV0dG9uIHdpbGwgYmUgaGlkZGVuXG5cdFx0XHRcdG9PYmplY3RQYWdlTGF5b3V0LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikuc2V0UHJvcGVydHkoXCJyZWxhdGVkQXBwcy92aXNpYmlsaXR5XCIsIGFSZWxhdGVkQXBwc01lbnVJdGVtcy5sZW5ndGggPiAwKTtcblx0XHRcdFx0b09iamVjdFBhZ2VMYXlvdXQuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKS5zZXRQcm9wZXJ0eShcInJlbGF0ZWRBcHBzL2l0ZW1zXCIsIGFSZWxhdGVkQXBwc01lbnVJdGVtcyk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvT2JqZWN0UGFnZUxheW91dC5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpLnNldFByb3BlcnR5KFwicmVsYXRlZEFwcHMvdmlzaWJpbGl0eVwiLCBmYWxzZSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9PYmplY3RQYWdlTGF5b3V0LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikuc2V0UHJvcGVydHkoXCJyZWxhdGVkQXBwcy92aXNpYmlsaXR5XCIsIGZhbHNlKTtcblx0XHR9XG5cdH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcblx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgcmVhZCBsaW5rc1wiLCBlcnJvcik7XG5cdH1cblx0cmV0dXJuIGFSZWxhdGVkQXBwc01lbnVJdGVtcztcbn1cblxuZnVuY3Rpb24gX2dldFNlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMob0VudGl0eUFubm90YXRpb25zOiBhbnksIHNDdXJyZW50U2VtT2JqOiBhbnkpIHtcblx0Y29uc3Qgb1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMgPSB7XG5cdFx0Ykhhc0VudGl0eVNldFNPOiBmYWxzZSxcblx0XHRhQWxsb3dlZEFjdGlvbnM6IFtdLFxuXHRcdGFVbmF2YWlsYWJsZUFjdGlvbnM6IFtdIGFzIHVua25vd25bXSxcblx0XHRhTWFwcGluZ3M6IFtdXG5cdH07XG5cdGxldCBzQW5ub3RhdGlvbk1hcHBpbmdUZXJtLCBzQW5ub3RhdGlvbkFjdGlvblRlcm07XG5cdGxldCBzUXVhbGlmaWVyO1xuXHRmb3IgKGNvbnN0IGtleSBpbiBvRW50aXR5QW5ub3RhdGlvbnMpIHtcblx0XHRpZiAoa2V5LmluZGV4T2YoQ29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0KSA+IC0xICYmIG9FbnRpdHlBbm5vdGF0aW9uc1trZXldID09PSBzQ3VycmVudFNlbU9iaikge1xuXHRcdFx0b1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMuYkhhc0VudGl0eVNldFNPID0gdHJ1ZTtcblx0XHRcdHNBbm5vdGF0aW9uTWFwcGluZ1Rlcm0gPSBgQCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0TWFwcGluZ31gO1xuXHRcdFx0c0Fubm90YXRpb25BY3Rpb25UZXJtID0gYEAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc31gO1xuXG5cdFx0XHRpZiAoa2V5LmluZGV4T2YoXCIjXCIpID4gLTEpIHtcblx0XHRcdFx0c1F1YWxpZmllciA9IGtleS5zcGxpdChcIiNcIilbMV07XG5cdFx0XHRcdHNBbm5vdGF0aW9uTWFwcGluZ1Rlcm0gPSBgJHtzQW5ub3RhdGlvbk1hcHBpbmdUZXJtfSMke3NRdWFsaWZpZXJ9YDtcblx0XHRcdFx0c0Fubm90YXRpb25BY3Rpb25UZXJtID0gYCR7c0Fubm90YXRpb25BY3Rpb25UZXJtfSMke3NRdWFsaWZpZXJ9YDtcblx0XHRcdH1cblxuXHRcdFx0aWYgKG9FbnRpdHlBbm5vdGF0aW9uc1tzQW5ub3RhdGlvbk1hcHBpbmdUZXJtXSkge1xuXHRcdFx0XHRvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5hTWFwcGluZ3MgPSBvU2VtYW50aWNPYmplY3RBbm5vdGF0aW9ucy5hTWFwcGluZ3MuY29uY2F0KFxuXHRcdFx0XHRcdG9FbnRpdHlBbm5vdGF0aW9uc1tzQW5ub3RhdGlvbk1hcHBpbmdUZXJtXVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob0VudGl0eUFubm90YXRpb25zW3NBbm5vdGF0aW9uQWN0aW9uVGVybV0pIHtcblx0XHRcdFx0b1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnMuYVVuYXZhaWxhYmxlQWN0aW9ucyA9IG9TZW1hbnRpY09iamVjdEFubm90YXRpb25zLmFVbmF2YWlsYWJsZUFjdGlvbnMuY29uY2F0KFxuXHRcdFx0XHRcdG9FbnRpdHlBbm5vdGF0aW9uc1tzQW5ub3RhdGlvbkFjdGlvblRlcm1dXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cblx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb1NlbWFudGljT2JqZWN0QW5ub3RhdGlvbnM7XG59XG5cbmZ1bmN0aW9uIGZuVXBkYXRlUmVsYXRlZEFwcHNEZXRhaWxzKG9PYmplY3RQYWdlTGF5b3V0OiBhbnkpIHtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9PYmplY3RQYWdlTGF5b3V0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IG9PYmplY3RQYWdlTGF5b3V0LmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdGNvbnN0IG9QYXRoID0gb0JpbmRpbmdDb250ZXh0ICYmIG9CaW5kaW5nQ29udGV4dC5nZXRQYXRoKCk7XG5cdGNvbnN0IG9NZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob1BhdGgpO1xuXHQvLyBTZW1hbnRpYyBLZXkgVm9jYWJ1bGFyeVxuXHRjb25zdCBzU2VtYW50aWNLZXlWb2NhYnVsYXJ5ID0gYCR7b01ldGFQYXRofS9gICsgYEBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNLZXlgO1xuXHQvL1NlbWFudGljIEtleXNcblx0Y29uc3QgYVNlbUtleXMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzU2VtYW50aWNLZXlWb2NhYnVsYXJ5KTtcblx0Ly8gVW5hdmFpbGFibGUgQWN0aW9uc1xuXHRjb25zdCBvRW50cnkgPSBvQmluZGluZ0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdGlmICghb0VudHJ5KSB7XG5cdFx0b0JpbmRpbmdDb250ZXh0XG5cdFx0XHQucmVxdWVzdE9iamVjdCgpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVxdWVzdGVkT2JqZWN0OiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIHVwZGF0ZVJlbGF0ZUFwcHNNb2RlbChvQmluZGluZ0NvbnRleHQsIHJlcXVlc3RlZE9iamVjdCwgb09iamVjdFBhZ2VMYXlvdXQsIGFTZW1LZXlzLCBvTWV0YU1vZGVsLCBvTWV0YVBhdGgpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IHVwZGF0ZSB0aGUgcmVsYXRlZCBhcHAgZGV0YWlsc1wiLCBvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVwZGF0ZVJlbGF0ZUFwcHNNb2RlbChvQmluZGluZ0NvbnRleHQsIG9FbnRyeSwgb09iamVjdFBhZ2VMYXlvdXQsIGFTZW1LZXlzLCBvTWV0YU1vZGVsLCBvTWV0YVBhdGgpO1xuXHR9XG59XG5cbi8qKlxuICogQHBhcmFtIG9CdXR0b25cbiAqL1xuZnVuY3Rpb24gZm5GaXJlQnV0dG9uUHJlc3Mob0J1dHRvbjogYW55KSB7XG5cdGNvbnN0IGFBdXRob3JpemVkVHlwZXMgPSBbXCJzYXAubS5CdXR0b25cIiwgXCJzYXAubS5PdmVyZmxvd1Rvb2xiYXJCdXR0b25cIl07XG5cdGlmIChvQnV0dG9uICYmIGFBdXRob3JpemVkVHlwZXMuaW5kZXhPZihvQnV0dG9uLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKSAhPT0gLTEgJiYgb0J1dHRvbi5nZXRWaXNpYmxlKCkgJiYgb0J1dHRvbi5nZXRFbmFibGVkKCkpIHtcblx0XHRvQnV0dG9uLmZpcmVQcmVzcygpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIGZuUmVzb2x2ZVN0cmluZ3RvQm9vbGVhbihzVmFsdWU6IGFueSkge1xuXHRpZiAoc1ZhbHVlID09PSBcInRydWVcIiB8fCBzVmFsdWUgPT09IHRydWUpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0QXBwQ29tcG9uZW50KG9Db250cm9sOiBhbnkpOiBBcHBDb21wb25lbnQge1xuXHRpZiAob0NvbnRyb2wuaXNBKFwic2FwLmZlLmNvcmUuQXBwQ29tcG9uZW50XCIpKSB7XG5cdFx0cmV0dXJuIG9Db250cm9sO1xuXHR9XG5cdGNvbnN0IG9Pd25lciA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcihvQ29udHJvbCk7XG5cdGlmICghb093bmVyKSB7XG5cdFx0cmV0dXJuIG9Db250cm9sO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBnZXRBcHBDb21wb25lbnQob093bmVyKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50UGFnZVZpZXcob0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50KSB7XG5cdGNvbnN0IHJvb3RWaWV3Q29udHJvbGxlciA9IG9BcHBDb21wb25lbnQuZ2V0Um9vdFZpZXdDb250cm9sbGVyKCkgYXMgYW55O1xuXHRyZXR1cm4gcm9vdFZpZXdDb250cm9sbGVyLmlzRmNsRW5hYmxlZCgpXG5cdFx0PyByb290Vmlld0NvbnRyb2xsZXIuZ2V0UmlnaHRtb3N0VmlldygpXG5cdFx0OiBDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KChvQXBwQ29tcG9uZW50LmdldFJvb3RDb250YWluZXIoKSBhcyBhbnkpLmdldEN1cnJlbnRQYWdlKCkpO1xufVxuXG5mdW5jdGlvbiBnZXRUYXJnZXRWaWV3KG9Db250cm9sOiBhbnkpIHtcblx0aWYgKG9Db250cm9sICYmIG9Db250cm9sLmlzQShcInNhcC51aS5jb3JlLkNvbXBvbmVudENvbnRhaW5lclwiKSkge1xuXHRcdG9Db250cm9sID0gb0NvbnRyb2wuZ2V0Q29tcG9uZW50SW5zdGFuY2UoKTtcblx0XHRvQ29udHJvbCA9IG9Db250cm9sICYmIG9Db250cm9sLmdldFJvb3RDb250cm9sKCk7XG5cdH1cblx0d2hpbGUgKG9Db250cm9sICYmICFvQ29udHJvbC5pc0EoXCJzYXAudWkuY29yZS5tdmMuVmlld1wiKSkge1xuXHRcdG9Db250cm9sID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdH1cblx0cmV0dXJuIG9Db250cm9sO1xufVxuXG5mdW5jdGlvbiBpc0ZpZWxkQ29udHJvbFBhdGhJbmFwcGxpY2FibGUoc0ZpZWxkQ29udHJvbFBhdGg6IHN0cmluZywgb0F0dHJpYnV0ZTogYW55KSB7XG5cdGxldCBiSW5hcHBsaWNhYmxlID0gZmFsc2U7XG5cdGNvbnN0IGFQYXJ0cyA9IHNGaWVsZENvbnRyb2xQYXRoLnNwbGl0KFwiL1wiKTtcblx0Ly8gc2Vuc2l0aXZlIGRhdGEgaXMgcmVtb3ZlZCBvbmx5IGlmIHRoZSBwYXRoIGhhcyBhbHJlYWR5IGJlZW4gcmVzb2x2ZWQuXG5cdGlmIChhUGFydHMubGVuZ3RoID4gMSkge1xuXHRcdGJJbmFwcGxpY2FibGUgPSBvQXR0cmlidXRlW2FQYXJ0c1swXV0gJiYgb0F0dHJpYnV0ZVthUGFydHNbMF1dLmhhc093blByb3BlcnR5KGFQYXJ0c1sxXSkgJiYgb0F0dHJpYnV0ZVthUGFydHNbMF1dW2FQYXJ0c1sxXV0gPT09IDA7XG5cdH0gZWxzZSB7XG5cdFx0YkluYXBwbGljYWJsZSA9IG9BdHRyaWJ1dGVbc0ZpZWxkQ29udHJvbFBhdGhdID09PSAwO1xuXHR9XG5cdHJldHVybiBiSW5hcHBsaWNhYmxlO1xufVxuXG5mdW5jdGlvbiByZW1vdmVTZW5zaXRpdmVEYXRhKGFBdHRyaWJ1dGVzOiBhbnlbXSwgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0Y29uc3QgYU91dEF0dHJpYnV0ZXMgPSBbXTtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhQXR0cmlidXRlcy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnN0IHNFbnRpdHlTZXQgPSBhQXR0cmlidXRlc1tpXS5lbnRpdHlTZXQsXG5cdFx0XHRvQXR0cmlidXRlID0gYUF0dHJpYnV0ZXNbaV0uY29udGV4dERhdGE7XG5cblx0XHRkZWxldGUgb0F0dHJpYnV0ZVtcIkBvZGF0YS5jb250ZXh0XCJdO1xuXHRcdGRlbGV0ZSBvQXR0cmlidXRlW1wiJTQwb2RhdGEuY29udGV4dFwiXTtcblx0XHRkZWxldGUgb0F0dHJpYnV0ZVtcIkBvZGF0YS5tZXRhZGF0YUV0YWdcIl07XG5cdFx0ZGVsZXRlIG9BdHRyaWJ1dGVbXCIlNDBvZGF0YS5tZXRhZGF0YUV0YWdcIl07XG5cdFx0ZGVsZXRlIG9BdHRyaWJ1dGVbXCJTQVBfX01lc3NhZ2VzXCJdO1xuXHRcdGNvbnN0IGFQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMob0F0dHJpYnV0ZSk7XG5cdFx0Zm9yIChsZXQgaiA9IDA7IGogPCBhUHJvcGVydGllcy5sZW5ndGg7IGorKykge1xuXHRcdFx0Y29uc3Qgc1Byb3AgPSBhUHJvcGVydGllc1tqXSxcblx0XHRcdFx0YVByb3BlcnR5QW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7c0VudGl0eVNldH0vJHtzUHJvcH1AYCk7XG5cdFx0XHRpZiAoYVByb3BlcnR5QW5ub3RhdGlvbnMpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5Jc1BvdGVudGlhbGx5U2Vuc2l0aXZlXCJdIHx8XG5cdFx0XHRcdFx0YVByb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRXhjbHVkZUZyb21OYXZpZ2F0aW9uQ29udGV4dFwiXSB8fFxuXHRcdFx0XHRcdGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5NZWFzdXJlXCJdXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGRlbGV0ZSBvQXR0cmlidXRlW3NQcm9wXTtcblx0XHRcdFx0fSBlbHNlIGlmIChhUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sXCJdKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0ZpZWxkQ29udHJvbCA9IGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xcIl07XG5cdFx0XHRcdFx0aWYgKG9GaWVsZENvbnRyb2xbXCIkRW51bU1lbWJlclwiXSAmJiBvRmllbGRDb250cm9sW1wiJEVudW1NZW1iZXJcIl0uc3BsaXQoXCIvXCIpWzFdID09PSBcIkluYXBwbGljYWJsZVwiKSB7XG5cdFx0XHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZVtzUHJvcF07XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChvRmllbGRDb250cm9sW1wiJFBhdGhcIl0gJiYgQ29tbW9uVXRpbHMuaXNGaWVsZENvbnRyb2xQYXRoSW5hcHBsaWNhYmxlKG9GaWVsZENvbnRyb2xbXCIkUGF0aFwiXSwgb0F0dHJpYnV0ZSkpIHtcblx0XHRcdFx0XHRcdGRlbGV0ZSBvQXR0cmlidXRlW3NQcm9wXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0YU91dEF0dHJpYnV0ZXMucHVzaChvQXR0cmlidXRlKTtcblx0fVxuXG5cdHJldHVybiBhT3V0QXR0cmlidXRlcztcbn1cblxuZnVuY3Rpb24gX2ZuQ2hlY2tJc01hdGNoKG9PYmplY3Q6IGFueSwgb0tleXNUb0NoZWNrOiBhbnkpIHtcblx0Zm9yIChjb25zdCBzS2V5IGluIG9LZXlzVG9DaGVjaykge1xuXHRcdGlmIChvS2V5c1RvQ2hlY2tbc0tleV0gIT09IG9PYmplY3Rbc0tleV0pIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGZuR2V0Q29udGV4dFBhdGhQcm9wZXJ0aWVzKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBzQ29udGV4dFBhdGg6IHN0cmluZywgb0ZpbHRlcj86IG9iamVjdCkge1xuXHRjb25zdCBvRW50aXR5VHlwZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vYCkgfHwge30sXG5cdFx0b1Byb3BlcnRpZXM6IGFueSA9IHt9O1xuXG5cdGZvciAoY29uc3Qgc0tleSBpbiBvRW50aXR5VHlwZSkge1xuXHRcdGlmIChcblx0XHRcdG9FbnRpdHlUeXBlLmhhc093blByb3BlcnR5KHNLZXkpICYmXG5cdFx0XHQhL15cXCQvaS50ZXN0KHNLZXkpICYmXG5cdFx0XHRvRW50aXR5VHlwZVtzS2V5XS4ka2luZCAmJlxuXHRcdFx0X2ZuQ2hlY2tJc01hdGNoKG9FbnRpdHlUeXBlW3NLZXldLCBvRmlsdGVyIHx8IHsgJGtpbmQ6IFwiUHJvcGVydHlcIiB9KVxuXHRcdCkge1xuXHRcdFx0b1Byb3BlcnRpZXNbc0tleV0gPSBvRW50aXR5VHlwZVtzS2V5XTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIG9Qcm9wZXJ0aWVzO1xufVxuXG5mdW5jdGlvbiBmbkdldE1hbmRhdG9yeUZpbHRlckZpZWxkcyhvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgc0NvbnRleHRQYXRoOiBzdHJpbmcpIHtcblx0bGV0IGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHM7XG5cdGlmIChvTWV0YU1vZGVsICYmIHNDb250ZXh0UGF0aCkge1xuXHRcdGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9QE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zL1JlcXVpcmVkUHJvcGVydGllc2ApO1xuXHR9XG5cdHJldHVybiBhTWFuZGF0b3J5RmlsdGVyRmllbGRzO1xufVxuXG5mdW5jdGlvbiBmbkdldElCTkFjdGlvbnMob0NvbnRyb2w6IGFueSwgYUlCTkFjdGlvbnM6IGFueVtdKSB7XG5cdGNvbnN0IGFBY3Rpb25zID0gb0NvbnRyb2wgJiYgb0NvbnRyb2wuZ2V0QWN0aW9ucygpO1xuXHRpZiAoYUFjdGlvbnMpIHtcblx0XHRhQWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvQWN0aW9uOiBhbnkpIHtcblx0XHRcdGlmIChvQWN0aW9uLmlzQShcInNhcC51aS5tZGMuYWN0aW9udG9vbGJhci5BY3Rpb25Ub29sYmFyQWN0aW9uXCIpKSB7XG5cdFx0XHRcdG9BY3Rpb24gPSBvQWN0aW9uLmdldEFjdGlvbigpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9BY3Rpb24uaXNBKFwic2FwLm0uTWVudUJ1dHRvblwiKSkge1xuXHRcdFx0XHRjb25zdCBvTWVudSA9IG9BY3Rpb24uZ2V0TWVudSgpO1xuXHRcdFx0XHRjb25zdCBhSXRlbXMgPSBvTWVudS5nZXRJdGVtcygpO1xuXHRcdFx0XHRhSXRlbXMuZm9yRWFjaCgob0l0ZW06IGFueSkgPT4ge1xuXHRcdFx0XHRcdGlmIChvSXRlbS5kYXRhKFwiSUJORGF0YVwiKSkge1xuXHRcdFx0XHRcdFx0YUlCTkFjdGlvbnMucHVzaChvSXRlbSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSBpZiAob0FjdGlvbi5kYXRhKFwiSUJORGF0YVwiKSkge1xuXHRcdFx0XHRhSUJOQWN0aW9ucy5wdXNoKG9BY3Rpb24pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhSUJOQWN0aW9ucztcbn1cblxuLyoqXG4gKiBAcGFyYW0gYUlCTkFjdGlvbnNcbiAqIEBwYXJhbSBvVmlld1xuICovXG5mdW5jdGlvbiBmblVwZGF0ZURhdGFGaWVsZEZvcklCTkJ1dHRvbnNWaXNpYmlsaXR5KGFJQk5BY3Rpb25zOiBhbnlbXSwgb1ZpZXc6IFZpZXcpIHtcblx0Y29uc3Qgb1BhcmFtczogYW55ID0ge307XG5cdGNvbnN0IGZuR2V0TGlua3MgPSBmdW5jdGlvbiAob0RhdGE/OiBhbnkpIHtcblx0XHRpZiAob0RhdGEpIHtcblx0XHRcdGNvbnN0IGFLZXlzID0gT2JqZWN0LmtleXMob0RhdGEpO1xuXHRcdFx0YUtleXMuZm9yRWFjaChmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0XHRcdGlmIChzS2V5LmluZGV4T2YoXCJfXCIpICE9PSAwICYmIHNLZXkuaW5kZXhPZihcIm9kYXRhLmNvbnRleHRcIikgPT09IC0xKSB7XG5cdFx0XHRcdFx0b1BhcmFtc1tzS2V5XSA9IHsgdmFsdWU6IG9EYXRhW3NLZXldIH07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRpZiAoYUlCTkFjdGlvbnMubGVuZ3RoKSB7XG5cdFx0XHRhSUJOQWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvSUJOQWN0aW9uOiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0ID0gb0lCTkFjdGlvbi5kYXRhKFwiSUJORGF0YVwiKS5zZW1hbnRpY09iamVjdDtcblx0XHRcdFx0Y29uc3Qgc0FjdGlvbiA9IG9JQk5BY3Rpb24uZGF0YShcIklCTkRhdGFcIikuYWN0aW9uO1xuXHRcdFx0XHRDb21tb25VdGlscy5nZXRTaGVsbFNlcnZpY2VzKG9WaWV3KVxuXHRcdFx0XHRcdC5nZXRMaW5rcyh7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogc1NlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0YWN0aW9uOiBzQWN0aW9uLFxuXHRcdFx0XHRcdFx0cGFyYW1zOiBvUGFyYW1zXG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAoYUxpbms6IGFueSkge1xuXHRcdFx0XHRcdFx0b0lCTkFjdGlvbi5zZXRWaXNpYmxlKG9JQk5BY3Rpb24uZ2V0VmlzaWJsZSgpICYmIGFMaW5rICYmIGFMaW5rLmxlbmd0aCA9PT0gMSk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgcmV0cmlldmUgdGhlIGxpbmtzIGZyb20gdGhlIHNoZWxsIHNlcnZpY2VcIiwgb0Vycm9yKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcblx0aWYgKG9WaWV3ICYmIG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHQob1ZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBhbnkpXG5cdFx0XHQ/LnJlcXVlc3RPYmplY3QoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9EYXRhOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIGZuR2V0TGlua3Mob0RhdGEpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKFwiQ2Fubm90IHJldHJpZXZlIHRoZSBsaW5rcyBmcm9tIHRoZSBzaGVsbCBzZXJ2aWNlXCIsIG9FcnJvcik7XG5cdFx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRmbkdldExpbmtzKCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0VHJhbnNsYXRlZFRleHQoc0ZyYW1ld29ya0tleTogc3RyaW5nLCBvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLCBvUGFyYW1zPzogYW55LCBzRW50aXR5U2V0TmFtZT86IHN0cmluZykge1xuXHRsZXQgc1Jlc291cmNlS2V5ID0gc0ZyYW1ld29ya0tleTtcblx0aWYgKG9SZXNvdXJjZUJ1bmRsZSkge1xuXHRcdGlmIChzRW50aXR5U2V0TmFtZSkge1xuXHRcdFx0Ly8gVGhlcmUgYXJlIGNvbnNvbGUgZXJyb3JzIGxvZ2dlZCB3aGVuIG1ha2luZyBjYWxscyB0byBnZXRUZXh0IGZvciBrZXlzIHRoYXQgYXJlIG5vdCBkZWZpbmVkIGluIHRoZSByZXNvdXJjZSBidW5kbGVcblx0XHRcdC8vIGZvciBpbnN0YW5jZSBrZXlzIHdoaWNoIGFyZSBzdXBwb3NlZCB0byBiZSBwcm92aWRlZCBieSB0aGUgYXBwbGljYXRpb24sIGUuZywgPGtleT58PGVudGl0eVNldD4gdG8gb3ZlcnJpZGUgaW5zdGFuY2Ugc3BlY2lmaWMgdGV4dFxuXHRcdFx0Ly8gaGVuY2UgY2hlY2sgaWYgdGV4dCBleGlzdHMgKHVzaW5nIFwiaGFzVGV4dFwiKSBpbiB0aGUgcmVzb3VyY2UgYnVuZGxlIGJlZm9yZSBjYWxsaW5nIFwiZ2V0VGV4dFwiXG5cblx0XHRcdC8vIFwiaGFzVGV4dFwiIG9ubHkgY2hlY2tzIGZvciB0aGUga2V5IGluIHRoZSBpbW1lZGlhdGUgcmVzb3VyY2UgYnVuZGxlIGFuZCBub3QgaXQncyBjdXN0b20gYnVuZGxlc1xuXHRcdFx0Ly8gaGVuY2Ugd2UgbmVlZCB0byBkbyB0aGlzIHJlY3VycnNpdmVseSB0byBjaGVjayBpZiB0aGUga2V5IGV4aXN0cyBpbiBhbnkgb2YgdGhlIGJ1bmRsZXMgdGhlIGZvcm1zIHRoZSBGRSByZXNvdXJjZSBidW5kbGVcblx0XHRcdGNvbnN0IGJSZXNvdXJjZUtleUV4aXN0cyA9IGNoZWNrSWZSZXNvdXJjZUtleUV4aXN0cyhcblx0XHRcdFx0KG9SZXNvdXJjZUJ1bmRsZSBhcyBhbnkpLmFDdXN0b21CdW5kbGVzLFxuXHRcdFx0XHRgJHtzRnJhbWV3b3JrS2V5fXwke3NFbnRpdHlTZXROYW1lfWBcblx0XHRcdCk7XG5cblx0XHRcdC8vIGlmIHJlc291cmNlIGtleSB3aXRoIGVudGl0eSBzZXQgbmFtZSBmb3IgaW5zdGFuY2Ugc3BlY2lmaWMgdGV4dCBvdmVycmlkaW5nIGlzIHByb3ZpZGVkIGJ5IHRoZSBhcHBsaWNhdGlvblxuXHRcdFx0Ly8gdGhlbiB1c2UgdGhlIHNhbWUga2V5IG90aGVyd2lzZSB1c2UgdGhlIEZyYW1ld29yayBrZXlcblx0XHRcdHNSZXNvdXJjZUtleSA9IGJSZXNvdXJjZUtleUV4aXN0cyA/IGAke3NGcmFtZXdvcmtLZXl9fCR7c0VudGl0eVNldE5hbWV9YCA6IHNGcmFtZXdvcmtLZXk7XG5cdFx0fVxuXHRcdHJldHVybiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChzUmVzb3VyY2VLZXksIG9QYXJhbXMpO1xuXHR9XG5cblx0Ly8gZG8gbm90IGFsbG93IG92ZXJyaWRlIHNvIGdldCB0ZXh0IGZyb20gdGhlIGludGVybmFsIGJ1bmRsZSBkaXJlY3RseVxuXHRvUmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpO1xuXHRyZXR1cm4gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoc1Jlc291cmNlS2V5LCBvUGFyYW1zKTtcbn1cblxuZnVuY3Rpb24gY2hlY2tJZlJlc291cmNlS2V5RXhpc3RzKGFDdXN0b21CdW5kbGVzOiBhbnksIHNLZXk6IGFueSkge1xuXHRpZiAoYUN1c3RvbUJ1bmRsZXMubGVuZ3RoKSB7XG5cdFx0Zm9yIChsZXQgaSA9IGFDdXN0b21CdW5kbGVzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG5cdFx0XHRjb25zdCBzVmFsdWUgPSBhQ3VzdG9tQnVuZGxlc1tpXS5oYXNUZXh0KHNLZXkpO1xuXHRcdFx0Ly8gdGV4dCBmb3VuZCByZXR1cm4gdHJ1ZVxuXHRcdFx0aWYgKHNWYWx1ZSkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHRcdGNoZWNrSWZSZXNvdXJjZUtleUV4aXN0cyhhQ3VzdG9tQnVuZGxlc1tpXS5hQ3VzdG9tQnVuZGxlcywgc0tleSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBmYWxzZTtcbn1cblxuZnVuY3Rpb24gZ2V0QWN0aW9uUGF0aChvQWN0aW9uOiBhbnksIGJSZXR1cm5Pbmx5UGF0aDogYm9vbGVhbiwgc0FjdGlvbk5hbWU/OiBzdHJpbmcsIGJDaGVja1N0YXRpY1ZhbHVlPzogYm9vbGVhbikge1xuXHRzQWN0aW9uTmFtZSA9ICFzQWN0aW9uTmFtZSA/IG9BY3Rpb24uZ2V0T2JqZWN0KG9BY3Rpb24uZ2V0UGF0aCgpKSA6IHNBY3Rpb25OYW1lO1xuXHRsZXQgc0NvbnRleHRQYXRoID0gb0FjdGlvbi5nZXRQYXRoKCkuc3BsaXQoXCIvQFwiKVswXTtcblx0Y29uc3Qgc0VudGl0eVR5cGVOYW1lID0gb0FjdGlvbi5nZXRPYmplY3Qoc0NvbnRleHRQYXRoKS4kVHlwZTtcblx0Y29uc3Qgc0VudGl0eU5hbWUgPSBnZXRFbnRpdHlTZXROYW1lKG9BY3Rpb24uZ2V0TW9kZWwoKSwgc0VudGl0eVR5cGVOYW1lKTtcblx0aWYgKHNFbnRpdHlOYW1lKSB7XG5cdFx0c0NvbnRleHRQYXRoID0gYC8ke3NFbnRpdHlOYW1lfWA7XG5cdH1cblx0aWYgKGJDaGVja1N0YXRpY1ZhbHVlKSB7XG5cdFx0cmV0dXJuIG9BY3Rpb24uZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vJHtzQWN0aW9uTmFtZX1AT3JnLk9EYXRhLkNvcmUuVjEuT3BlcmF0aW9uQXZhaWxhYmxlYCk7XG5cdH1cblx0aWYgKGJSZXR1cm5Pbmx5UGF0aCkge1xuXHRcdHJldHVybiBgJHtzQ29udGV4dFBhdGh9LyR7c0FjdGlvbk5hbWV9YDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0c0NvbnRleHRQYXRoOiBzQ29udGV4dFBhdGgsXG5cdFx0XHRzUHJvcGVydHk6IG9BY3Rpb24uZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vJHtzQWN0aW9uTmFtZX1AT3JnLk9EYXRhLkNvcmUuVjEuT3BlcmF0aW9uQXZhaWxhYmxlLyRQYXRoYCksXG5cdFx0XHRzQmluZGluZ1BhcmFtZXRlcjogb0FjdGlvbi5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofS8ke3NBY3Rpb25OYW1lfS9AJHVpNS5vdmVybG9hZC8wLyRQYXJhbWV0ZXIvMC8kTmFtZWApXG5cdFx0fTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRFbnRpdHlTZXROYW1lKG9NZXRhTW9kZWw6IGFueSwgc0VudGl0eVR5cGU6IGFueSkge1xuXHRjb25zdCBvRW50aXR5Q29udGFpbmVyID0gb01ldGFNb2RlbC5nZXRPYmplY3QoXCIvXCIpO1xuXHRmb3IgKGNvbnN0IGtleSBpbiBvRW50aXR5Q29udGFpbmVyKSB7XG5cdFx0aWYgKHR5cGVvZiBvRW50aXR5Q29udGFpbmVyW2tleV0gPT09IFwib2JqZWN0XCIgJiYgb0VudGl0eUNvbnRhaW5lcltrZXldLiRUeXBlID09PSBzRW50aXR5VHlwZSkge1xuXHRcdFx0cmV0dXJuIGtleTtcblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gY29tcHV0ZURpc3BsYXlNb2RlKG9Qcm9wZXJ0eUFubm90YXRpb25zOiBhbnksIG9Db2xsZWN0aW9uQW5ub3RhdGlvbnM/OiBhbnkpIHtcblx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl0sXG5cdFx0b1RleHRBcnJhbmdlbWVudEFubm90YXRpb24gPVxuXHRcdFx0b1RleHRBbm5vdGF0aW9uICYmXG5cdFx0XHQoKG9Qcm9wZXJ0eUFubm90YXRpb25zICYmXG5cdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFwiXSkgfHxcblx0XHRcdFx0KG9Db2xsZWN0aW9uQW5ub3RhdGlvbnMgJiYgb0NvbGxlY3Rpb25Bbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl0pKTtcblxuXHRpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24pIHtcblx0XHRpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0T25seVwiKSB7XG5cdFx0XHRyZXR1cm4gXCJEZXNjcmlwdGlvblwiO1xuXHRcdH0gZWxzZSBpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0TGFzdFwiKSB7XG5cdFx0XHRyZXR1cm4gXCJWYWx1ZURlc2NyaXB0aW9uXCI7XG5cdFx0fSBlbHNlIGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRTZXBhcmF0ZVwiKSB7XG5cdFx0XHRyZXR1cm4gXCJWYWx1ZVwiO1xuXHRcdH1cblx0XHQvL0RlZmF1bHQgc2hvdWxkIGJlIFRleHRGaXJzdCBpZiB0aGVyZSBpcyBhIFRleHQgYW5ub3RhdGlvbiBhbmQgbmVpdGhlciBUZXh0T25seSBub3IgVGV4dExhc3QgYXJlIHNldFxuXHRcdHJldHVybiBcIkRlc2NyaXB0aW9uVmFsdWVcIjtcblx0fVxuXHRyZXR1cm4gb1RleHRBbm5vdGF0aW9uID8gXCJEZXNjcmlwdGlvblZhbHVlXCIgOiBcIlZhbHVlXCI7XG59XG5cbmZ1bmN0aW9uIF9nZXRFbnRpdHlUeXBlKG9Db250ZXh0OiBhbnkpIHtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdHJldHVybiBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9Db250ZXh0LmdldFBhdGgoKSl9LyRUeXBlYCk7XG59XG5cbmZ1bmN0aW9uIF9yZXF1ZXN0T2JqZWN0KHNBY3Rpb246IGFueSwgb1NlbGVjdGVkQ29udGV4dDogYW55LCBzUHJvcGVydHk6IGFueSkge1xuXHRsZXQgb0NvbnRleHQgPSBvU2VsZWN0ZWRDb250ZXh0O1xuXHRjb25zdCBuQnJhY2tldEluZGV4ID0gc0FjdGlvbi5pbmRleE9mKFwiKFwiKTtcblxuXHRpZiAobkJyYWNrZXRJbmRleCA+IC0xKSB7XG5cdFx0Y29uc3Qgc1RhcmdldFR5cGUgPSBzQWN0aW9uLnNsaWNlKG5CcmFja2V0SW5kZXggKyAxLCAtMSk7XG5cdFx0bGV0IHNDdXJyZW50VHlwZSA9IF9nZXRFbnRpdHlUeXBlKG9Db250ZXh0KTtcblxuXHRcdHdoaWxlIChzQ3VycmVudFR5cGUgIT09IHNUYXJnZXRUeXBlKSB7XG5cdFx0XHQvLyBGaW5kIHBhcmVudCBiaW5kaW5nIGNvbnRleHQgYW5kIHJldHJpZXZlIGVudGl0eSB0eXBlXG5cdFx0XHRvQ29udGV4dCA9IG9Db250ZXh0LmdldEJpbmRpbmcoKS5nZXRDb250ZXh0KCk7XG5cdFx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdFx0c0N1cnJlbnRUeXBlID0gX2dldEVudGl0eVR5cGUob0NvbnRleHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0TG9nLndhcm5pbmcoXCJDYW5ub3QgZGV0ZXJtaW5lIHRhcmdldCB0eXBlIHRvIHJlcXVlc3QgcHJvcGVydHkgdmFsdWUgZm9yIGJvdW5kIGFjdGlvbiBpbnZvY2F0aW9uXCIpO1xuXHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIG9Db250ZXh0LnJlcXVlc3RPYmplY3Qoc1Byb3BlcnR5KTtcbn1cblxuZnVuY3Rpb24gcmVxdWVzdFByb3BlcnR5KG9TZWxlY3RlZENvbnRleHQ6IGFueSwgc0FjdGlvbjogYW55LCBzUHJvcGVydHk6IGFueSwgc0R5bmFtaWNBY3Rpb25FbmFibGVkUGF0aDogYW55KSB7XG5cdGNvbnN0IG9Qcm9taXNlID1cblx0XHRzUHJvcGVydHkgJiYgc1Byb3BlcnR5LmluZGV4T2YoXCIvXCIpID09PSAwXG5cdFx0XHQ/IHJlcXVlc3RTaW5nbGV0b25Qcm9wZXJ0eShzUHJvcGVydHksIG9TZWxlY3RlZENvbnRleHQuZ2V0TW9kZWwoKSlcblx0XHRcdDogX3JlcXVlc3RPYmplY3Qoc0FjdGlvbiwgb1NlbGVjdGVkQ29udGV4dCwgc1Byb3BlcnR5KTtcblxuXHRyZXR1cm4gb1Byb21pc2UudGhlbihmdW5jdGlvbiAodlByb3BlcnR5VmFsdWU6IGFueSkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuXHRcdFx0dlByb3BlcnR5VmFsdWU6IHZQcm9wZXJ0eVZhbHVlLFxuXHRcdFx0b1NlbGVjdGVkQ29udGV4dDogb1NlbGVjdGVkQ29udGV4dCxcblx0XHRcdHNBY3Rpb246IHNBY3Rpb24sXG5cdFx0XHRzRHluYW1pY0FjdGlvbkVuYWJsZWRQYXRoOiBzRHluYW1pY0FjdGlvbkVuYWJsZWRQYXRoXG5cdFx0fSk7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBzZXRDb250ZXh0c0Jhc2VkT25PcGVyYXRpb25BdmFpbGFibGUob0ludGVybmFsTW9kZWxDb250ZXh0OiBhbnksIGFSZXF1ZXN0UHJvbWlzZXM6IGFueSkge1xuXHRyZXR1cm4gUHJvbWlzZS5hbGwoYVJlcXVlc3RQcm9taXNlcylcblx0XHQudGhlbihmdW5jdGlvbiAoYVJlc3VsdHM6IGFueVtdKSB7XG5cdFx0XHRpZiAoYVJlc3VsdHMubGVuZ3RoKSB7XG5cdFx0XHRcdGNvbnN0IGFBcHBsaWNhYmxlQ29udGV4dHM6IGFueVtdID0gW10sXG5cdFx0XHRcdFx0YU5vdEFwcGxpY2FibGVDb250ZXh0czogYW55W10gPSBbXTtcblx0XHRcdFx0YVJlc3VsdHMuZm9yRWFjaChmdW5jdGlvbiAoYVJlc3VsdDogYW55KSB7XG5cdFx0XHRcdFx0aWYgKGFSZXN1bHQpIHtcblx0XHRcdFx0XHRcdGlmIChhUmVzdWx0LnZQcm9wZXJ0eVZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRNb2RlbCgpLnNldFByb3BlcnR5KGFSZXN1bHQuc0R5bmFtaWNBY3Rpb25FbmFibGVkUGF0aCwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdGFBcHBsaWNhYmxlQ29udGV4dHMucHVzaChhUmVzdWx0Lm9TZWxlY3RlZENvbnRleHQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0YU5vdEFwcGxpY2FibGVDb250ZXh0cy5wdXNoKGFSZXN1bHQub1NlbGVjdGVkQ29udGV4dCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0c2V0RHluYW1pY0FjdGlvbkNvbnRleHRzKG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgYVJlc3VsdHNbMF0uc0FjdGlvbiwgYUFwcGxpY2FibGVDb250ZXh0cywgYU5vdEFwcGxpY2FibGVDb250ZXh0cyk7XG5cdFx0XHR9XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRMb2cudHJhY2UoXCJDYW5ub3QgcmV0cmlldmUgcHJvcGVydHkgdmFsdWUgZnJvbSBwYXRoXCIsIG9FcnJvcik7XG5cdFx0fSk7XG59XG5cbi8qKlxuICogQHBhcmFtIG9JbnRlcm5hbE1vZGVsQ29udGV4dFxuICogQHBhcmFtIHNBY3Rpb25cbiAqIEBwYXJhbSBhQXBwbGljYWJsZVxuICogQHBhcmFtIGFOb3RBcHBsaWNhYmxlXG4gKi9cbmZ1bmN0aW9uIHNldER5bmFtaWNBY3Rpb25Db250ZXh0cyhvSW50ZXJuYWxNb2RlbENvbnRleHQ6IGFueSwgc0FjdGlvbjogYW55LCBhQXBwbGljYWJsZTogYW55LCBhTm90QXBwbGljYWJsZTogYW55KSB7XG5cdGNvbnN0IHNEeW5hbWljQWN0aW9uUGF0aFByZWZpeCA9IGAke29JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2R5bmFtaWNBY3Rpb25zLyR7c0FjdGlvbn1gLFxuXHRcdG9JbnRlcm5hbE1vZGVsID0gb0ludGVybmFsTW9kZWxDb250ZXh0LmdldE1vZGVsKCk7XG5cdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KGAke3NEeW5hbWljQWN0aW9uUGF0aFByZWZpeH0vYUFwcGxpY2FibGVgLCBhQXBwbGljYWJsZSk7XG5cdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KGAke3NEeW5hbWljQWN0aW9uUGF0aFByZWZpeH0vYU5vdEFwcGxpY2FibGVgLCBhTm90QXBwbGljYWJsZSk7XG59XG5cbmZ1bmN0aW9uIF9nZXREZWZhdWx0T3BlcmF0b3JzKHNQcm9wZXJ0eVR5cGU/OiBzdHJpbmcpIHtcblx0Ly8gbWRjIGRlZmluZXMgdGhlIGZ1bGwgc2V0IG9mIG9wZXJhdGlvbnMgdGhhdCBhcmUgbWVhbmluZ2Z1bCBmb3IgZWFjaCBFZG0gVHlwZVxuXHQvLyBUT0RPIFJlcGxhY2Ugd2l0aCBtb2RlbCAvIGludGVybmFsIHdheSBvZiByZXRyaWV2aW5nIHRoZSBhY3R1YWwgbW9kZWwgdHlwZSB1c2VkIGZvciB0aGUgcHJvcGVydHlcblx0Y29uc3Qgb0RhdGFDbGFzcyA9IFR5cGVVdGlsLmdldERhdGFUeXBlQ2xhc3NOYW1lKHNQcm9wZXJ0eVR5cGUpO1xuXHQvLyBUT0RPIG5lZWQgdG8gcGFzcyBwcm9wZXIgZm9ybWF0T3B0aW9ucywgY29uc3RyYWludHMgaGVyZVxuXHRjb25zdCBvQmFzZVR5cGUgPSBUeXBlVXRpbC5nZXRCYXNlVHlwZShvRGF0YUNsYXNzLCB7fSwge30pO1xuXHRyZXR1cm4gRmlsdGVyT3BlcmF0b3JVdGlsLmdldE9wZXJhdG9yc0ZvclR5cGUob0Jhc2VUeXBlKTtcbn1cblxuZnVuY3Rpb24gX2dldFJlc3RyaWN0aW9ucyhhRGVmYXVsdE9wczogYW55LCBhRXhwcmVzc2lvbk9wczogYW55KTogc3RyaW5nIHtcblx0Ly8gRnJvbSB0aGUgZGVmYXVsdCBzZXQgb2YgT3BlcmF0b3JzIGZvciB0aGUgQmFzZSBUeXBlLCBzZWxlY3QgdGhvc2UgdGhhdCBhcmUgZGVmaW5lZCBpbiB0aGUgQWxsb3dlZCBWYWx1ZS5cblx0Ly8gSW4gY2FzZSB0aGF0IG5vIG9wZXJhdG9ycyBhcmUgZm91bmQsIHJldHVybiB1bmRlZmluZWQgc28gdGhhdCB0aGUgZGVmYXVsdCBzZXQgaXMgdXNlZC5cblx0Y29uc3QgYU9wZXJhdG9ycyA9IGFEZWZhdWx0T3BzLmZpbHRlcihmdW5jdGlvbiAoc0VsZW1lbnQ6IGFueSkge1xuXHRcdHJldHVybiBhRXhwcmVzc2lvbk9wcy5pbmRleE9mKHNFbGVtZW50KSA+IC0xO1xuXHR9KTtcblx0cmV0dXJuIGFPcGVyYXRvcnMudG9TdHJpbmcoKSB8fCB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb24oYUV4cHJlc3Npb25zOiBhbnkpIHtcblx0Y29uc3QgYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5ID0gQ29tbW9uVXRpbHMuQWxsb3dlZEV4cHJlc3Npb25zUHJpbztcblxuXHRhRXhwcmVzc2lvbnMuc29ydChmdW5jdGlvbiAoYTogYW55LCBiOiBhbnkpIHtcblx0XHRyZXR1cm4gYUFsbG93ZWRFeHByZXNzaW9uc1ByaW9yaXR5LmluZGV4T2YoYSkgLSBhQWxsb3dlZEV4cHJlc3Npb25zUHJpb3JpdHkuaW5kZXhPZihiKTtcblx0fSk7XG5cblx0cmV0dXJuIGFFeHByZXNzaW9uc1swXTtcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gZmV0Y2ggdGhlIGNvcnJlY3Qgb3BlcmF0b3JzIGJhc2VkIG9uIHRoZSBmaWx0ZXIgcmVzdHJpY3Rpb25zIHRoYXQgY2FuIGJlIGFubm90YXRlZCBvbiBhbiBlbnRpdHkgc2V0IG9yIGEgbmF2aWdhdGlvbiBwcm9wZXJ0eS5cbiAqIFdlIHJldHVybiB0aGUgY29ycmVjdCBvcGVyYXRvcnMgYmFzZWQgb24gdGhlIHNwZWNpZmllZCByZXN0cmljdGlvbiBhbmQgYWxzbyBjaGVjayBmb3IgdGhlIG9wZXJhdG9ycyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdCB0byBpbmNsdWRlIG9yIGV4Y2x1ZGUgdGhlbS5cbiAqXG4gKiBAcGFyYW0gc1Byb3BlcnR5IFN0cmluZyBuYW1lIG9mIHRoZSBwcm9wZXJ0eVxuICogQHBhcmFtIHNFbnRpdHlTZXRQYXRoIFN0cmluZyBwYXRoIHRvIHRoZSBlbnRpdHkgc2V0XG4gKiBAcGFyYW0gb0NvbnRleHQgQ29udGV4dCB1c2VkIGR1cmluZyB0ZW1wbGF0aW5nXG4gKiBAcGFyYW0gc1R5cGUgU3RyaW5nIGRhdGEgdHlwZSBvZCB0aGUgcHJvcGVydHksIGZvciBleGFtcGxlIGVkbS5EYXRlXG4gKiBAcGFyYW0gYlVzZVNlbWFudGljRGF0ZVJhbmdlIEJvb2xlYW4gcGFzc2VkIGZyb20gdGhlIG1hbmlmZXN0IGZvciBzZW1hbnRpYyBkYXRlIHJhbmdlXG4gKiBAcGFyYW0gc1NldHRpbmdzIFN0cmluZ2lmaWVkIG9iamVjdCBvZiB0aGUgcHJvcGVydHkgc2V0dGluZ3NcbiAqIEByZXR1cm5zIFN0cmluZyBjb250YWluaW5nIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIG9wZXJhdG9ycyBmb3IgZmlsdGVyaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0c1Byb3BlcnR5OiBzdHJpbmcsXG5cdHNFbnRpdHlTZXRQYXRoOiBzdHJpbmcsXG5cdG9Db250ZXh0OiBDb250ZXh0LFxuXHRzVHlwZT86IHN0cmluZyxcblx0YlVzZVNlbWFudGljRGF0ZVJhbmdlPzogYm9vbGVhbiB8IHN0cmluZyxcblx0c1NldHRpbmdzPzogc3RyaW5nXG4pOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRjb25zdCBvRmlsdGVyUmVzdHJpY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoKHNFbnRpdHlTZXRQYXRoLCBvQ29udGV4dCk7XG5cdGNvbnN0IGFFcXVhbHNPcHMgPSBbXCJFUVwiXTtcblx0Y29uc3QgYVNpbmdsZVJhbmdlT3BzID0gW1wiRVFcIiwgXCJHRVwiLCBcIkxFXCIsIFwiTFRcIiwgXCJHVFwiLCBcIkJUXCIsIFwiTk9UTEVcIiwgXCJOT1RMVFwiLCBcIk5PVEdFXCIsIFwiTk9UR1RcIl07XG5cdGNvbnN0IGFTaW5nbGVSYW5nZURUQmFzaWNPcHMgPSBbXCJFUVwiLCBcIkJUXCJdO1xuXHRjb25zdCBhU2luZ2xlVmFsdWVEYXRlT3BzID0gW1xuXHRcdFwiVE9EQVlcIixcblx0XHRcIlRPTU9SUk9XXCIsXG5cdFx0XCJZRVNURVJEQVlcIixcblx0XHRcIkRBVEVcIixcblx0XHRcIkZJUlNUREFZV0VFS1wiLFxuXHRcdFwiTEFTVERBWVdFRUtcIixcblx0XHRcIkZJUlNUREFZTU9OVEhcIixcblx0XHRcIkxBU1REQVlNT05USFwiLFxuXHRcdFwiRklSU1REQVlRVUFSVEVSXCIsXG5cdFx0XCJMQVNUREFZUVVBUlRFUlwiLFxuXHRcdFwiRklSU1REQVlZRUFSXCIsXG5cdFx0XCJMQVNUREFZWUVBUlwiXG5cdF07XG5cdGNvbnN0IGFCYXNpY0RhdGVUaW1lT3BzID0gW1wiRVFcIiwgXCJCVFwiXTtcblx0Y29uc3QgYU11bHRpUmFuZ2VPcHMgPSBbXCJFUVwiLCBcIkdFXCIsIFwiTEVcIiwgXCJMVFwiLCBcIkdUXCIsIFwiQlRcIiwgXCJORVwiLCBcIk5PVEJUXCIsIFwiTk9UTEVcIiwgXCJOT1RMVFwiLCBcIk5PVEdFXCIsIFwiTk9UR1RcIl07XG5cdGNvbnN0IGFTZWFyY2hFeHByZXNzaW9uT3BzID0gW1wiQ29udGFpbnNcIiwgXCJOb3RDb250YWluc1wiLCBcIlN0YXJ0c1dpdGhcIiwgXCJOb3RTdGFydHNXaXRoXCIsIFwiRW5kc1dpdGhcIiwgXCJOb3RFbmRzV2l0aFwiXTtcblx0Y29uc3QgYVNlbWFudGljRGF0ZU9wc0V4dCA9IFNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRTdXBwb3J0ZWRPcGVyYXRpb25zKCk7XG5cdGNvbnN0IGJTZW1hbnRpY0RhdGVSYW5nZSA9IGJVc2VTZW1hbnRpY0RhdGVSYW5nZSA9PT0gXCJ0cnVlXCIgfHwgYlVzZVNlbWFudGljRGF0ZVJhbmdlID09PSB0cnVlO1xuXHRsZXQgYVNlbWFudGljRGF0ZU9wczogYW55W10gPSBbXTtcblx0Y29uc3Qgb1NldHRpbmdzID0gdHlwZW9mIHNTZXR0aW5ncyA9PT0gXCJzdHJpbmdcIiA/IEpTT04ucGFyc2Uoc1NldHRpbmdzKS5jdXN0b21EYXRhIDogc1NldHRpbmdzO1xuXG5cdGlmICgob0NvbnRleHQuZ2V0T2JqZWN0KGAke3NFbnRpdHlTZXRQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlc3VsdENvbnRleHRgKSBhcyBhbnkpID09PSB0cnVlKSB7XG5cdFx0cmV0dXJuIGFFcXVhbHNPcHMudG9TdHJpbmcoKTtcblx0fVxuXG5cdGlmIChvU2V0dGluZ3MgJiYgb1NldHRpbmdzLm9wZXJhdG9yQ29uZmlndXJhdGlvbiAmJiBvU2V0dGluZ3Mub3BlcmF0b3JDb25maWd1cmF0aW9uLmxlbmd0aCA+IDApIHtcblx0XHRhU2VtYW50aWNEYXRlT3BzID0gU2VtYW50aWNEYXRlT3BlcmF0b3JzLmdldEZpbHRlck9wZXJhdGlvbnMob1NldHRpbmdzLm9wZXJhdG9yQ29uZmlndXJhdGlvbik7XG5cdH0gZWxzZSB7XG5cdFx0YVNlbWFudGljRGF0ZU9wcyA9IFNlbWFudGljRGF0ZU9wZXJhdG9ycy5nZXRTZW1hbnRpY0RhdGVPcGVyYXRpb25zKCk7XG5cdH1cblx0Ly8gR2V0IHRoZSBkZWZhdWx0IE9wZXJhdG9ycyBmb3IgdGhpcyBQcm9wZXJ0eSBUeXBlXG5cdGxldCBhRGVmYXVsdE9wZXJhdG9ycyA9IF9nZXREZWZhdWx0T3BlcmF0b3JzKHNUeXBlKTtcblx0aWYgKGJTZW1hbnRpY0RhdGVSYW5nZSkge1xuXHRcdGFEZWZhdWx0T3BlcmF0b3JzID0gYVNlbWFudGljRGF0ZU9wc0V4dC5jb25jYXQoYURlZmF1bHRPcGVyYXRvcnMpO1xuXHR9XG5cdGxldCBzUmVzdHJpY3Rpb25zO1xuXG5cdC8vIElzIHRoZXJlIGEgRmlsdGVyIFJlc3RyaWN0aW9uIGRlZmluZWQgZm9yIHRoaXMgcHJvcGVydHk/XG5cdGlmIChvRmlsdGVyUmVzdHJpY3Rpb25zICYmIG9GaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zICYmIG9GaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zW3NQcm9wZXJ0eV0pIHtcblx0XHQvLyBFeHRlbmRpbmcgdGhlIGRlZmF1bHQgb3BlcmF0b3JzIGxpc3Qgd2l0aCBTZW1hbnRpYyBEYXRlIG9wdGlvbnMgREFURVJBTkdFLCBEQVRFLCBGUk9NIGFuZCBUT1xuXHRcdGNvbnN0IHNBbGxvd2VkRXhwcmVzc2lvbiA9IENvbW1vblV0aWxzLmdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb24ob0ZpbHRlclJlc3RyaWN0aW9ucy5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnNbc1Byb3BlcnR5XSk7XG5cdFx0Ly8gSW4gY2FzZSBtb3JlIHRoYW4gb25lIEFsbG93ZWQgRXhwcmVzc2lvbnMgaGFzIGJlZW4gZGVmaW5lZCBmb3IgYSBwcm9wZXJ0eVxuXHRcdC8vIGNob29zZSB0aGUgbW9zdCByZXN0cmljdGl2ZSBBbGxvd2VkIEV4cHJlc3Npb25cblxuXHRcdC8vIE11bHRpVmFsdWUgaGFzIHNhbWUgT3BlcmF0b3IgYXMgU2luZ2xlVmFsdWUsIGJ1dCB0aGVyZSBjYW4gYmUgbW9yZSB0aGFuIG9uZSAobWF4Q29uZGl0aW9ucylcblx0XHRzd2l0Y2ggKHNBbGxvd2VkRXhwcmVzc2lvbikge1xuXHRcdFx0Y2FzZSBcIlNpbmdsZVZhbHVlXCI6XG5cdFx0XHRcdGNvbnN0IGFTaW5nbGVWYWx1ZU9wcyA9IHNUeXBlID09PSBcIkVkbS5EYXRlXCIgJiYgYlNlbWFudGljRGF0ZVJhbmdlID8gYVNpbmdsZVZhbHVlRGF0ZU9wcyA6IGFFcXVhbHNPcHM7XG5cdFx0XHRcdHNSZXN0cmljdGlvbnMgPSBfZ2V0UmVzdHJpY3Rpb25zKGFEZWZhdWx0T3BlcmF0b3JzLCBhU2luZ2xlVmFsdWVPcHMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJNdWx0aVZhbHVlXCI6XG5cdFx0XHRcdHNSZXN0cmljdGlvbnMgPSBfZ2V0UmVzdHJpY3Rpb25zKGFEZWZhdWx0T3BlcmF0b3JzLCBhRXF1YWxzT3BzKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiU2luZ2xlUmFuZ2VcIjpcblx0XHRcdFx0bGV0IGFFeHByZXNzaW9uT3BzO1xuXHRcdFx0XHRpZiAoYlNlbWFudGljRGF0ZVJhbmdlKSB7XG5cdFx0XHRcdFx0aWYgKHNUeXBlID09PSBcIkVkbS5EYXRlXCIpIHtcblx0XHRcdFx0XHRcdGFFeHByZXNzaW9uT3BzID0gYVNlbWFudGljRGF0ZU9wcztcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHNUeXBlID09PSBcIkVkbS5EYXRlVGltZU9mZnNldFwiKSB7XG5cdFx0XHRcdFx0XHRhRXhwcmVzc2lvbk9wcyA9IGFTZW1hbnRpY0RhdGVPcHMuY29uY2F0KGFCYXNpY0RhdGVUaW1lT3BzKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0YUV4cHJlc3Npb25PcHMgPSBhU2luZ2xlUmFuZ2VPcHM7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKHNUeXBlID09PSBcIkVkbS5EYXRlVGltZU9mZnNldFwiKSB7XG5cdFx0XHRcdFx0YUV4cHJlc3Npb25PcHMgPSBhU2luZ2xlUmFuZ2VEVEJhc2ljT3BzO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFFeHByZXNzaW9uT3BzID0gYVNpbmdsZVJhbmdlT3BzO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHNPcGVyYXRvcnMgPSBfZ2V0UmVzdHJpY3Rpb25zKGFEZWZhdWx0T3BlcmF0b3JzLCBhRXhwcmVzc2lvbk9wcyk7XG5cdFx0XHRcdHNSZXN0cmljdGlvbnMgPSBzT3BlcmF0b3JzID8gc09wZXJhdG9ycyA6IFwiXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk11bHRpUmFuZ2VcIjpcblx0XHRcdFx0c1Jlc3RyaWN0aW9ucyA9IF9nZXRSZXN0cmljdGlvbnMoYURlZmF1bHRPcGVyYXRvcnMsIGFNdWx0aVJhbmdlT3BzKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiU2VhcmNoRXhwcmVzc2lvblwiOlxuXHRcdFx0XHRzUmVzdHJpY3Rpb25zID0gX2dldFJlc3RyaWN0aW9ucyhhRGVmYXVsdE9wZXJhdG9ycywgYVNlYXJjaEV4cHJlc3Npb25PcHMpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXCI6XG5cdFx0XHRcdHNSZXN0cmljdGlvbnMgPSBfZ2V0UmVzdHJpY3Rpb25zKGFEZWZhdWx0T3BlcmF0b3JzLCBhU2VhcmNoRXhwcmVzc2lvbk9wcy5jb25jYXQoYU11bHRpUmFuZ2VPcHMpKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0Ly8gSW4gY2FzZSBBbGxvd2VkRXhwcmVzc2lvbnMgaXMgbm90IHJlY29nbmlzZWQsIHVuZGVmaW5lZCBpbiByZXR1cm4gcmVzdWx0cyBpbiB0aGUgZGVmYXVsdCBzZXQgb2Zcblx0XHQvLyBvcGVyYXRvcnMgZm9yIHRoZSB0eXBlLlxuXHR9XG5cdHJldHVybiBzUmVzdHJpY3Rpb25zO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byByZXR1cm4gYWxsb3dlZCBvcGVyYXRvcnMgZm9yIHR5cGUgR3VpZC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIGdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eVxuICogQHJldHVybnMgQWxsb3dlZCBvcGVyYXRvcnMgZm9yIHR5cGUgR3VpZFxuICovXG5mdW5jdGlvbiBnZXRPcGVyYXRvcnNGb3JHdWlkUHJvcGVydHkoKTogc3RyaW5nIHtcblx0Y29uc3QgYWxsb3dlZE9wZXJhdG9yc0Zvckd1aWQgPSBbXCJFUVwiLCBcIk5FXCJdO1xuXHRyZXR1cm4gYWxsb3dlZE9wZXJhdG9yc0Zvckd1aWQudG9TdHJpbmcoKTtcbn1cblxuZnVuY3Rpb24gZ2V0T3BlcmF0b3JzRm9yRGF0ZVByb3BlcnR5KHByb3BlcnR5VHlwZTogc3RyaW5nKTogc3RyaW5nIHtcblx0Ly8gSW4gY2FzZSBBbGxvd2VkRXhwcmVzc2lvbnMgaXMgbm90IHByb3ZpZGVkIGZvciB0eXBlIEVkbS5EYXRlIHRoZW4gYWxsIHRoZSBkZWZhdWx0XG5cdC8vIG9wZXJhdG9ycyBmb3IgdGhlIHR5cGUgc2hvdWxkIGJlIHJldHVybmVkIGV4Y2x1ZGluZyBzZW1hbnRpYyBvcGVyYXRvcnMgZnJvbSB0aGUgbGlzdC5cblx0Y29uc3QgYURlZmF1bHRPcGVyYXRvcnMgPSBfZ2V0RGVmYXVsdE9wZXJhdG9ycyhwcm9wZXJ0eVR5cGUpO1xuXHRjb25zdCBhTXVsdGlSYW5nZU9wcyA9IFtcIkVRXCIsIFwiR0VcIiwgXCJMRVwiLCBcIkxUXCIsIFwiR1RcIiwgXCJCVFwiLCBcIk5FXCIsIFwiTk9UQlRcIiwgXCJOT1RMRVwiLCBcIk5PVExUXCIsIFwiTk9UR0VcIiwgXCJOT1RHVFwiXTtcblx0cmV0dXJuIF9nZXRSZXN0cmljdGlvbnMoYURlZmF1bHRPcGVyYXRvcnMsIGFNdWx0aVJhbmdlT3BzKTtcbn1cblxuZnVuY3Rpb24gZ2V0UGFyYW1ldGVySW5mbyhvTWV0YU1vZGVsOiBhbnksIHNDb250ZXh0UGF0aDogYW55KSB7XG5cdGNvbnN0IHNQYXJhbWV0ZXJDb250ZXh0UGF0aCA9IHNDb250ZXh0UGF0aC5zdWJzdHJpbmcoMCwgc0NvbnRleHRQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSk7XG5cdGNvbnN0IGJSZXN1bHRDb250ZXh0ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhcmFtZXRlckNvbnRleHRQYXRofS9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlc3VsdENvbnRleHRgKTtcblx0Y29uc3Qgb1BhcmFtZXRlckluZm86IGFueSA9IHt9O1xuXHRpZiAoYlJlc3VsdENvbnRleHQgJiYgc1BhcmFtZXRlckNvbnRleHRQYXRoICE9PSBzQ29udGV4dFBhdGgpIHtcblx0XHRvUGFyYW1ldGVySW5mby5jb250ZXh0UGF0aCA9IHNQYXJhbWV0ZXJDb250ZXh0UGF0aDtcblx0XHRvUGFyYW1ldGVySW5mby5wYXJhbWV0ZXJQcm9wZXJ0aWVzID0gQ29tbW9uVXRpbHMuZ2V0Q29udGV4dFBhdGhQcm9wZXJ0aWVzKG9NZXRhTW9kZWwsIHNQYXJhbWV0ZXJDb250ZXh0UGF0aCk7XG5cdH1cblx0cmV0dXJuIG9QYXJhbWV0ZXJJbmZvO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byBhZGQgdGhlIHNlbGVjdCBPcHRpb25zIHRvIGZpbHRlciBjb25kaXRpb25zLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgYWRkU2VsZWN0T3B0aW9uVG9Db25kaXRpb25zXG4gKiBAcGFyYW0gb1Byb3BlcnR5TWV0YWRhdGEgUHJvcGVydHkgbWV0YWRhdGEgaW5mb3JtYXRpb25cbiAqIEBwYXJhbSBhVmFsaWRPcGVyYXRvcnMgT3BlcmF0b3JzIGZvciBhbGwgdGhlIGRhdGEgdHlwZXNcbiAqIEBwYXJhbSBhU2VtYW50aWNEYXRlT3BlcmF0b3JzIE9wZXJhdG9ycyBmb3IgdGhlIERhdGUgdHlwZVxuICogQHBhcmFtIGFDdW11bGF0aXZlQ29uZGl0aW9ucyBGaWx0ZXIgY29uZGl0aW9uc1xuICogQHBhcmFtIG9TZWxlY3RPcHRpb24gU2VsZWN0b3B0aW9uIG9mIHNlbGVjdGlvbiB2YXJpYW50XG4gKiBAcmV0dXJucyBUaGUgZmlsdGVyIGNvbmRpdGlvbnNcbiAqL1xuZnVuY3Rpb24gYWRkU2VsZWN0T3B0aW9uVG9Db25kaXRpb25zKFxuXHRvUHJvcGVydHlNZXRhZGF0YTogYW55LFxuXHRhVmFsaWRPcGVyYXRvcnM6IGFueSxcblx0YVNlbWFudGljRGF0ZU9wZXJhdG9yczogYW55LFxuXHRhQ3VtdWxhdGl2ZUNvbmRpdGlvbnM6IGFueSxcblx0b1NlbGVjdE9wdGlvbjogYW55XG4pIHtcblx0Y29uc3Qgb0NvbmRpdGlvbiA9IGdldENvbmRpdGlvbnMob1NlbGVjdE9wdGlvbiwgb1Byb3BlcnR5TWV0YWRhdGEpO1xuXHRpZiAoXG5cdFx0b1NlbGVjdE9wdGlvbj8uU2VtYW50aWNEYXRlcyAmJlxuXHRcdGFTZW1hbnRpY0RhdGVPcGVyYXRvcnMgJiZcblx0XHRhU2VtYW50aWNEYXRlT3BlcmF0b3JzLmluZGV4T2Yob1NlbGVjdE9wdGlvbj8uU2VtYW50aWNEYXRlcz8ub3BlcmF0b3IpID4gLTFcblx0KSB7XG5cdFx0Y29uc3Qgc2VtYW50aWNEYXRlcyA9IENvbW1vblV0aWxzLmFkZFNlbWFudGljRGF0ZXNUb0NvbmRpdGlvbnMob1NlbGVjdE9wdGlvbj8uU2VtYW50aWNEYXRlcyk7XG5cdFx0aWYgKHNlbWFudGljRGF0ZXMgJiYgT2JqZWN0LmtleXMoc2VtYW50aWNEYXRlcykubGVuZ3RoID4gMCkge1xuXHRcdFx0YUN1bXVsYXRpdmVDb25kaXRpb25zLnB1c2goc2VtYW50aWNEYXRlcyk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKG9Db25kaXRpb24pIHtcblx0XHRpZiAoIWFWYWxpZE9wZXJhdG9ycyB8fCBhVmFsaWRPcGVyYXRvcnMuaW5kZXhPZihvQ29uZGl0aW9uLm9wZXJhdG9yKSA+IC0xKSB7XG5cdFx0XHRhQ3VtdWxhdGl2ZUNvbmRpdGlvbnMucHVzaChvQ29uZGl0aW9uKTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIGFDdW11bGF0aXZlQ29uZGl0aW9ucztcbn1cblxuLyoqXG4gKiBNZXRob2QgdG8gYWRkIHRoZSBzZW1hbnRpYyBkYXRlcyB0byBmaWx0ZXIgY29uZGl0aW9uc1xuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgYWRkU2VtYW50aWNEYXRlc1RvQ29uZGl0aW9uc1xuICogQHBhcmFtIG9TZW1hbnRpY0RhdGVzIFNlbWFudGljIGRhdGUgaW5mb21hdGlvblxuICogQHJldHVybnMgVGhlIGZpbHRlciBjb25kaXRpb25zIGNvbnRhaW5pbmcgc2VtYW50aWMgZGF0ZXNcbiAqL1xuXG5mdW5jdGlvbiBhZGRTZW1hbnRpY0RhdGVzVG9Db25kaXRpb25zKG9TZW1hbnRpY0RhdGVzOiBzZW1hbnRpY0RhdGVDb25maWd1cmF0aW9uKTogb2JqZWN0IHtcblx0Y29uc3QgdmFsdWVzOiBhbnkgPSBbXTtcblx0aWYgKG9TZW1hbnRpY0RhdGVzPy5oaWdoKSB7XG5cdFx0dmFsdWVzLnB1c2gob1NlbWFudGljRGF0ZXM/LmhpZ2gpO1xuXHR9XG5cdGlmIChvU2VtYW50aWNEYXRlcz8ubG93KSB7XG5cdFx0dmFsdWVzLnB1c2gob1NlbWFudGljRGF0ZXM/Lmxvdyk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHR2YWx1ZXM6IHZhbHVlcyxcblx0XHRvcGVyYXRvcjogb1NlbWFudGljRGF0ZXM/Lm9wZXJhdG9yLFxuXHRcdGlzRW1wdHk6IG51bGxcblx0fTtcbn1cblxuLyoqXG4gKiBAcGFyYW0gc0NvbnRleHRQYXRoXG4gKiBAcGFyYW0gb1NlbGVjdGlvblZhcmlhbnRcbiAqIEBwYXJhbSBzU2VsZWN0T3B0aW9uUHJvcFxuICogQHBhcmFtIG9Db25kaXRpb25zXG4gKiBAcGFyYW0gc0NvbmRpdGlvblBhdGhcbiAqIEBwYXJhbSBzQ29uZGl0aW9uUHJvcFxuICogQHBhcmFtIG9WYWxpZFByb3BlcnRpZXNcbiAqIEBwYXJhbSBvTWV0YU1vZGVsXG4gKiBAcGFyYW0gaXNQYXJhbWV0ZXJcbiAqIEBwYXJhbSBiSXNGTFBWYWx1ZVByZXNlbnRcbiAqIEBwYXJhbSBiVXNlU2VtYW50aWNEYXRlUmFuZ2VcbiAqIEBwYXJhbSBvVmlld0RhdGFcbiAqL1xuZnVuY3Rpb24gYWRkU2VsZWN0T3B0aW9uc1RvQ29uZGl0aW9ucyhcblx0c0NvbnRleHRQYXRoOiBhbnksXG5cdG9TZWxlY3Rpb25WYXJpYW50OiBhbnksXG5cdHNTZWxlY3RPcHRpb25Qcm9wOiBhbnksXG5cdG9Db25kaXRpb25zOiBhbnksXG5cdHNDb25kaXRpb25QYXRoOiBhbnksXG5cdHNDb25kaXRpb25Qcm9wOiBhbnksXG5cdG9WYWxpZFByb3BlcnRpZXM6IGFueSxcblx0b01ldGFNb2RlbDogYW55LFxuXHRpc1BhcmFtZXRlcjogYW55LFxuXHRiSXNGTFBWYWx1ZVByZXNlbnQ/OiBib29sZWFuLFxuXHRiVXNlU2VtYW50aWNEYXRlUmFuZ2U/OiBib29sZWFuIHwgc3RyaW5nLFxuXHRvVmlld0RhdGE/OiBhbnlcbikge1xuXHRsZXQgYUNvbmRpdGlvbnM6IGFueVtdID0gW10sXG5cdFx0YVNlbGVjdE9wdGlvbnMsXG5cdFx0YVZhbGlkT3BlcmF0b3JzLFxuXHRcdGFTZW1hbnRpY0RhdGVPcGVyYXRvcnM7XG5cblx0aWYgKGlzUGFyYW1ldGVyIHx8IENvbW1vblV0aWxzLmlzUHJvcGVydHlGaWx0ZXJhYmxlKG9NZXRhTW9kZWwsIHNDb250ZXh0UGF0aCwgc0NvbmRpdGlvblByb3AsIHRydWUpKSB7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5TWV0YWRhdGEgPSBvVmFsaWRQcm9wZXJ0aWVzW3NDb25kaXRpb25Qcm9wXTtcblx0XHRhU2VsZWN0T3B0aW9ucyA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbihzU2VsZWN0T3B0aW9uUHJvcCk7XG5cdFx0Y29uc3Qgc2V0dGluZ3MgPSBnZXRGaWx0ZXJDb25maWd1cmF0aW9uU2V0dGluZyhvVmlld0RhdGEsIHNDb25kaXRpb25Qcm9wKTtcblx0XHRhVmFsaWRPcGVyYXRvcnMgPSBpc1BhcmFtZXRlciA/IFtcIkVRXCJdIDogQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkoc0NvbmRpdGlvblByb3AsIHNDb250ZXh0UGF0aCwgb01ldGFNb2RlbCk7XG5cdFx0aWYgKGJVc2VTZW1hbnRpY0RhdGVSYW5nZSkge1xuXHRcdFx0YVNlbWFudGljRGF0ZU9wZXJhdG9ycyA9IGlzUGFyYW1ldGVyXG5cdFx0XHRcdD8gW1wiRVFcIl1cblx0XHRcdFx0OiBDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0XHRcdFx0XHRcdHNDb25kaXRpb25Qcm9wLFxuXHRcdFx0XHRcdFx0c0NvbnRleHRQYXRoLFxuXHRcdFx0XHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdFx0XHRcdG9Qcm9wZXJ0eU1ldGFkYXRhPy4kVHlwZSxcblx0XHRcdFx0XHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdFx0XHRcdHNldHRpbmdzXG5cdFx0XHRcdCAgKTtcblx0XHR9XG5cdFx0Ly8gQ3JlYXRlIGNvbmRpdGlvbnMgZm9yIGFsbCB0aGUgc2VsZWN0T3B0aW9ucyBvZiB0aGUgcHJvcGVydHlcblx0XHRhQ29uZGl0aW9ucyA9IGlzUGFyYW1ldGVyXG5cdFx0XHQ/IENvbW1vblV0aWxzLmFkZFNlbGVjdE9wdGlvblRvQ29uZGl0aW9ucyhcblx0XHRcdFx0XHRvUHJvcGVydHlNZXRhZGF0YSxcblx0XHRcdFx0XHRhVmFsaWRPcGVyYXRvcnMsXG5cdFx0XHRcdFx0YVNlbWFudGljRGF0ZU9wZXJhdG9ycyxcblx0XHRcdFx0XHRhQ29uZGl0aW9ucyxcblx0XHRcdFx0XHRhU2VsZWN0T3B0aW9uc1swXVxuXHRcdFx0ICApXG5cdFx0XHQ6IGFTZWxlY3RPcHRpb25zLnJlZHVjZShcblx0XHRcdFx0XHRDb21tb25VdGlscy5hZGRTZWxlY3RPcHRpb25Ub0NvbmRpdGlvbnMuYmluZChudWxsLCBvUHJvcGVydHlNZXRhZGF0YSwgYVZhbGlkT3BlcmF0b3JzLCBhU2VtYW50aWNEYXRlT3BlcmF0b3JzKSxcblx0XHRcdFx0XHRhQ29uZGl0aW9uc1xuXHRcdFx0ICApO1xuXHRcdGlmIChhQ29uZGl0aW9ucy5sZW5ndGgpIHtcblx0XHRcdGlmIChzQ29uZGl0aW9uUGF0aCkge1xuXHRcdFx0XHRvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUGF0aCArIHNDb25kaXRpb25Qcm9wXSA9IG9Db25kaXRpb25zLmhhc093blByb3BlcnR5KHNDb25kaXRpb25QYXRoICsgc0NvbmRpdGlvblByb3ApXG5cdFx0XHRcdFx0PyBvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUGF0aCArIHNDb25kaXRpb25Qcm9wXS5jb25jYXQoYUNvbmRpdGlvbnMpXG5cdFx0XHRcdFx0OiBhQ29uZGl0aW9ucztcblx0XHRcdH0gZWxzZSBpZiAoYklzRkxQVmFsdWVQcmVzZW50KSB7XG5cdFx0XHRcdC8vIElmIEZMUCB2YWx1ZXMgYXJlIHByZXNlbnQgcmVwbGFjZSBpdCB3aXRoIEZMUCB2YWx1ZXNcblx0XHRcdFx0YUNvbmRpdGlvbnMuZm9yRWFjaCgoZWxlbWVudDogYW55KSA9PiB7XG5cdFx0XHRcdFx0ZWxlbWVudFtcImZpbHRlcmVkXCJdID0gdHJ1ZTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChvQ29uZGl0aW9ucy5oYXNPd25Qcm9wZXJ0eShzQ29uZGl0aW9uUHJvcCkpIHtcblx0XHRcdFx0XHRvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUHJvcF0uZm9yRWFjaCgoZWxlbWVudDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRlbGVtZW50W1wiZmlsdGVyZWRcIl0gPSBmYWxzZTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUHJvcF0gPSBvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUHJvcF0uY29uY2F0KGFDb25kaXRpb25zKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUHJvcF0gPSBhQ29uZGl0aW9ucztcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b0NvbmRpdGlvbnNbc0NvbmRpdGlvblByb3BdID0gb0NvbmRpdGlvbnMuaGFzT3duUHJvcGVydHkoc0NvbmRpdGlvblByb3ApXG5cdFx0XHRcdFx0PyBvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUHJvcF0uY29uY2F0KGFDb25kaXRpb25zKVxuXHRcdFx0XHRcdDogYUNvbmRpdGlvbnM7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbi8qKlxuICogTWV0aG9kIHRvIGNyZWF0ZSB0aGUgc2VtYW50aWMgZGF0ZXMgZnJvbSBmaWx0ZXIgY29uZGl0aW9uc1xuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgY3JlYXRlU2VtYW50aWNEYXRlc0Zyb21Db25kaXRpb25zXG4gKiBAcGFyYW0gb0NvbmRpdGlvbiBGaWx0ZXIgZmllbGQgY29uZGl0aW9uXG4gKiBAcGFyYW0gc0ZpbHRlck5hbWUgRmlsdGVyIEZpZWxkIFBhdGhcbiAqIEByZXR1cm5zIFRoZSBTZW1hbnRpYyBkYXRlIGNvbmRpdGlvbnNcbiAqL1xuXG5mdW5jdGlvbiBjcmVhdGVTZW1hbnRpY0RhdGVzRnJvbUNvbmRpdGlvbnMob0NvbmRpdGlvbjogQ29uZGl0aW9uVHlwZSkge1xuXHRyZXR1cm4ge1xuXHRcdGhpZ2g6IG9Db25kaXRpb24/LnZhbHVlcz8uWzBdIHx8IG51bGwsXG5cdFx0bG93OiBvQ29uZGl0aW9uPy52YWx1ZXM/LlsxXSB8fCBudWxsLFxuXHRcdG9wZXJhdG9yOiBvQ29uZGl0aW9uPy5vcGVyYXRvclxuXHR9O1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byBSZXR1cm4gdGhlIGZpbHRlciBjb25maWd1cmF0aW9uXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAbmFtZSBnZXRGaWx0ZXJDb25maWd1cmF0aW9uU2V0dGluZ1xuICogQHBhcmFtIG9WaWV3RGF0YSBtYW5pZmVzdCBDb25maWd1cmF0aW9uXG4gKiBAcGFyYW0gc1Byb3BlcnR5IEZpbHRlciBGaWVsZCBQYXRoXG4gKiBAcmV0dXJucyBUaGUgRmlsdGVyIEZpZWxkIENvbmZpZ3VyYXRpb25cbiAqL1xuXG5mdW5jdGlvbiBnZXRGaWx0ZXJDb25maWd1cmF0aW9uU2V0dGluZyhvVmlld0RhdGE6IGFueSwgc1Byb3BlcnR5OiBzdHJpbmcpIHtcblx0Y29uc3Qgb0NvbmZpZyA9IG9WaWV3RGF0YT8uY29udHJvbENvbmZpZ3VyYXRpb247XG5cdGNvbnN0IGZpbHRlckNvbmZpZyA9IG9Db25maWcgJiYgb0NvbmZpZ1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIl0/LmZpbHRlckZpZWxkcztcblx0cmV0dXJuIGZpbHRlckNvbmZpZz8uW3NQcm9wZXJ0eV0gPyBmaWx0ZXJDb25maWdbc1Byb3BlcnR5XT8uc2V0dGluZ3MgOiB1bmRlZmluZWQ7XG59XG5cbmZ1bmN0aW9uIGFkZFNlbGVjdGlvblZhcmlhbnRUb0NvbmRpdGlvbnMoXG5cdG9TZWxlY3Rpb25WYXJpYW50OiBhbnksXG5cdG9Db25kaXRpb25zOiBvYmplY3QsXG5cdG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLFxuXHRzQ29udGV4dFBhdGg6IHN0cmluZyxcblx0YklzRkxQVmFsdWVzPzogYm9vbGVhbixcblx0YlVzZVNlbWFudGljRGF0ZVJhbmdlPzogYm9vbGVhbiB8IHN0cmluZyxcblx0b1ZpZXdEYXRhPzogYW55XG4pIHtcblx0Y29uc3QgYVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMoKSxcblx0XHRvVmFsaWRQcm9wZXJ0aWVzID0gQ29tbW9uVXRpbHMuZ2V0Q29udGV4dFBhdGhQcm9wZXJ0aWVzKG9NZXRhTW9kZWwsIHNDb250ZXh0UGF0aCksXG5cdFx0YU1ldGFkYXRQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMob1ZhbGlkUHJvcGVydGllcyksXG5cdFx0b1BhcmFtZXRlckluZm8gPSBDb21tb25VdGlscy5nZXRQYXJhbWV0ZXJJbmZvKG9NZXRhTW9kZWwsIHNDb250ZXh0UGF0aCksXG5cdFx0c1BhcmFtZXRlckNvbnRleHRQYXRoID0gb1BhcmFtZXRlckluZm8uY29udGV4dFBhdGgsXG5cdFx0b1ZhbGlkUGFyYW1ldGVyUHJvcGVydGllcyA9IG9QYXJhbWV0ZXJJbmZvLnBhcmFtZXRlclByb3BlcnRpZXMsXG5cdFx0Ykhhc1BhcmFtZXRlcnMgPSAhIW9QYXJhbWV0ZXJJbmZvLmNvbnRleHRQYXRoICYmIG9WYWxpZFBhcmFtZXRlclByb3BlcnRpZXMgJiYgT2JqZWN0LmtleXMob1ZhbGlkUGFyYW1ldGVyUHJvcGVydGllcykubGVuZ3RoID4gMDtcblxuXHRpZiAoYkhhc1BhcmFtZXRlcnMpIHtcblx0XHRjb25zdCBhTWV0YWRhdGFQYXJhbWV0ZXJzID0gT2JqZWN0LmtleXMob1ZhbGlkUGFyYW1ldGVyUHJvcGVydGllcyk7XG5cdFx0YU1ldGFkYXRhUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChzTWV0YWRhdGFQYXJhbWV0ZXI6IHN0cmluZykge1xuXHRcdFx0bGV0IHNTZWxlY3RPcHRpb25OYW1lO1xuXHRcdFx0aWYgKGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhgJFBhcmFtZXRlci4ke3NNZXRhZGF0YVBhcmFtZXRlcn1gKSkge1xuXHRcdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IGAkUGFyYW1ldGVyLiR7c01ldGFkYXRhUGFyYW1ldGVyfWA7XG5cdFx0XHR9IGVsc2UgaWYgKGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhzTWV0YWRhdGFQYXJhbWV0ZXIpKSB7XG5cdFx0XHRcdHNTZWxlY3RPcHRpb25OYW1lID0gc01ldGFkYXRhUGFyYW1ldGVyO1xuXHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0c01ldGFkYXRhUGFyYW1ldGVyLnN0YXJ0c1dpdGgoXCJQX1wiKSAmJlxuXHRcdFx0XHRhU2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMuaW5jbHVkZXMoYCRQYXJhbWV0ZXIuJHtzTWV0YWRhdGFQYXJhbWV0ZXIuc2xpY2UoMiwgc01ldGFkYXRhUGFyYW1ldGVyLmxlbmd0aCl9YClcblx0XHRcdCkge1xuXHRcdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IGAkUGFyYW1ldGVyLiR7c01ldGFkYXRhUGFyYW1ldGVyLnNsaWNlKDIsIHNNZXRhZGF0YVBhcmFtZXRlci5sZW5ndGgpfWA7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRzTWV0YWRhdGFQYXJhbWV0ZXIuc3RhcnRzV2l0aChcIlBfXCIpICYmXG5cdFx0XHRcdGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhzTWV0YWRhdGFQYXJhbWV0ZXIuc2xpY2UoMiwgc01ldGFkYXRhUGFyYW1ldGVyLmxlbmd0aCkpXG5cdFx0XHQpIHtcblx0XHRcdFx0c1NlbGVjdE9wdGlvbk5hbWUgPSBzTWV0YWRhdGFQYXJhbWV0ZXIuc2xpY2UoMiwgc01ldGFkYXRhUGFyYW1ldGVyLmxlbmd0aCk7XG5cdFx0XHR9IGVsc2UgaWYgKGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhgJFBhcmFtZXRlci5QXyR7c01ldGFkYXRhUGFyYW1ldGVyfWApKSB7XG5cdFx0XHRcdHNTZWxlY3RPcHRpb25OYW1lID0gYCRQYXJhbWV0ZXIuUF8ke3NNZXRhZGF0YVBhcmFtZXRlcn1gO1xuXHRcdFx0fSBlbHNlIGlmIChhU2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMuaW5jbHVkZXMoYFBfJHtzTWV0YWRhdGFQYXJhbWV0ZXJ9YCkpIHtcblx0XHRcdFx0c1NlbGVjdE9wdGlvbk5hbWUgPSBgUF8ke3NNZXRhZGF0YVBhcmFtZXRlcn1gO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc1NlbGVjdE9wdGlvbk5hbWUpIHtcblx0XHRcdFx0YWRkU2VsZWN0T3B0aW9uc1RvQ29uZGl0aW9ucyhcblx0XHRcdFx0XHRzUGFyYW1ldGVyQ29udGV4dFBhdGgsXG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRcdFx0c1NlbGVjdE9wdGlvbk5hbWUsXG5cdFx0XHRcdFx0b0NvbmRpdGlvbnMsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHNNZXRhZGF0YVBhcmFtZXRlcixcblx0XHRcdFx0XHRvVmFsaWRQYXJhbWV0ZXJQcm9wZXJ0aWVzLFxuXHRcdFx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0XHRiSXNGTFBWYWx1ZXMsXG5cdFx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdG9WaWV3RGF0YVxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdGFNZXRhZGF0UHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChzTWV0YWRhdGFQcm9wZXJ0eTogc3RyaW5nKSB7XG5cdFx0bGV0IHNTZWxlY3RPcHRpb25OYW1lO1xuXHRcdGlmIChhU2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMuaW5jbHVkZXMoc01ldGFkYXRhUHJvcGVydHkpKSB7XG5cdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IHNNZXRhZGF0YVByb3BlcnR5O1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRzTWV0YWRhdGFQcm9wZXJ0eS5zdGFydHNXaXRoKFwiUF9cIikgJiZcblx0XHRcdGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhzTWV0YWRhdGFQcm9wZXJ0eS5zbGljZSgyLCBzTWV0YWRhdGFQcm9wZXJ0eS5sZW5ndGgpKVxuXHRcdCkge1xuXHRcdFx0c1NlbGVjdE9wdGlvbk5hbWUgPSBzTWV0YWRhdGFQcm9wZXJ0eS5zbGljZSgyLCBzTWV0YWRhdGFQcm9wZXJ0eS5sZW5ndGgpO1xuXHRcdH0gZWxzZSBpZiAoYVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzLmluY2x1ZGVzKGBQXyR7c01ldGFkYXRhUHJvcGVydHl9YCkpIHtcblx0XHRcdHNTZWxlY3RPcHRpb25OYW1lID0gYFBfJHtzTWV0YWRhdGFQcm9wZXJ0eX1gO1xuXHRcdH1cblx0XHRpZiAoc1NlbGVjdE9wdGlvbk5hbWUpIHtcblx0XHRcdGFkZFNlbGVjdE9wdGlvbnNUb0NvbmRpdGlvbnMoXG5cdFx0XHRcdHNDb250ZXh0UGF0aCxcblx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRcdHNTZWxlY3RPcHRpb25OYW1lLFxuXHRcdFx0XHRvQ29uZGl0aW9ucyxcblx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRzTWV0YWRhdGFQcm9wZXJ0eSxcblx0XHRcdFx0b1ZhbGlkUHJvcGVydGllcyxcblx0XHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdGJJc0ZMUFZhbHVlcyxcblx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRvVmlld0RhdGFcblx0XHRcdCk7XG5cdFx0fVxuXHR9KTtcblxuXHRhU2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMuZm9yRWFjaChmdW5jdGlvbiAoc1NlbGVjdE9wdGlvbjogYW55KSB7XG5cdFx0aWYgKHNTZWxlY3RPcHRpb24uaW5kZXhPZihcIi5cIikgPiAwICYmICFzU2VsZWN0T3B0aW9uLmluY2x1ZGVzKFwiJFBhcmFtZXRlclwiKSkge1xuXHRcdFx0Y29uc3Qgc1JlcGxhY2VkT3B0aW9uID0gc1NlbGVjdE9wdGlvbi5yZXBsYWNlQWxsKFwiLlwiLCBcIi9cIik7XG5cdFx0XHRjb25zdCBzRnVsbENvbnRleHRQYXRoID0gYC8ke3NSZXBsYWNlZE9wdGlvbn1gLnN0YXJ0c1dpdGgoc0NvbnRleHRQYXRoKVxuXHRcdFx0XHQ/IGAvJHtzUmVwbGFjZWRPcHRpb259YFxuXHRcdFx0XHQ6IGAke3NDb250ZXh0UGF0aH0vJHtzUmVwbGFjZWRPcHRpb259YDsgLy8gY2hlY2sgaWYgdGhlIGZ1bGwgcGF0aCwgZWcgU2FsZXNPcmRlck1hbmFnZS5fSXRlbS5NYXRlcmlhbCBleGlzdHMgaW4gdGhlIG1ldGFtb2RlbFxuXHRcdFx0aWYgKG9NZXRhTW9kZWwuZ2V0T2JqZWN0KHNGdWxsQ29udGV4dFBhdGgucmVwbGFjZShcIlBfXCIsIFwiXCIpKSkge1xuXHRcdFx0XHRfY3JlYXRlQ29uZGl0aW9uc0Zvck5hdlByb3BlcnRpZXMoXG5cdFx0XHRcdFx0c0Z1bGxDb250ZXh0UGF0aCxcblx0XHRcdFx0XHRzQ29udGV4dFBhdGgsXG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRcdFx0c1NlbGVjdE9wdGlvbixcblx0XHRcdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdG9Db25kaXRpb25zLFxuXHRcdFx0XHRcdGJJc0ZMUFZhbHVlcyxcblx0XHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdFx0b1ZpZXdEYXRhXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblx0cmV0dXJuIG9Db25kaXRpb25zO1xufVxuXG4vKipcbiAqIEBwYXJhbSBzRnVsbENvbnRleHRQYXRoXG4gKiBAcGFyYW0gc01haW5FbnRpdHlTZXRQYXRoXG4gKiBAcGFyYW0gb1NlbGVjdGlvblZhcmlhbnRcbiAqIEBwYXJhbSBzU2VsZWN0T3B0aW9uXG4gKiBAcGFyYW0gb01ldGFNb2RlbFxuICogQHBhcmFtIG9Db25kaXRpb25zXG4gKiBAcGFyYW0gYklzRkxQVmFsdWVQcmVzZW50XG4gKiBAcGFyYW0gYlNlbWFudGljRGF0ZVJhbmdlXG4gKiBAcGFyYW0gb1ZpZXdEYXRhXG4gKi9cbmZ1bmN0aW9uIF9jcmVhdGVDb25kaXRpb25zRm9yTmF2UHJvcGVydGllcyhcblx0c0Z1bGxDb250ZXh0UGF0aDogYW55LFxuXHRzTWFpbkVudGl0eVNldFBhdGg6IGFueSxcblx0b1NlbGVjdGlvblZhcmlhbnQ6IGFueSxcblx0c1NlbGVjdE9wdGlvbjogYW55LFxuXHRvTWV0YU1vZGVsOiBhbnksXG5cdG9Db25kaXRpb25zOiBhbnksXG5cdGJJc0ZMUFZhbHVlUHJlc2VudD86IGJvb2xlYW4sXG5cdGJTZW1hbnRpY0RhdGVSYW5nZT86IGFueSxcblx0b1ZpZXdEYXRhPzogYW55XG4pIHtcblx0bGV0IGFOYXZPYmplY3ROYW1lcyA9IHNTZWxlY3RPcHRpb24uc3BsaXQoXCIuXCIpO1xuXHQvLyBFZzogXCJTYWxlc09yZGVyTWFuYWdlLl9JdGVtLl9NYXRlcmlhbC5NYXRlcmlhbFwiIG9yIFwiX0l0ZW0uTWF0ZXJpYWxcIlxuXHRpZiAoYC8ke3NTZWxlY3RPcHRpb24ucmVwbGFjZUFsbChcIi5cIiwgXCIvXCIpfWAuc3RhcnRzV2l0aChzTWFpbkVudGl0eVNldFBhdGgpKSB7XG5cdFx0Y29uc3Qgc0Z1bGxQYXRoID0gKGAvJHtzU2VsZWN0T3B0aW9ufWAgYXMgYW55KS5yZXBsYWNlQWxsKFwiLlwiLCBcIi9cIiksXG5cdFx0XHRzTmF2UGF0aCA9IHNGdWxsUGF0aC5yZXBsYWNlKGAke3NNYWluRW50aXR5U2V0UGF0aH0vYCwgXCJcIik7XG5cdFx0YU5hdk9iamVjdE5hbWVzID0gc05hdlBhdGguc3BsaXQoXCIvXCIpO1xuXHR9XG5cdGxldCBzQ29uZGl0aW9uUGF0aCA9IFwiXCI7XG5cdGNvbnN0IHNQcm9wZXJ0eU5hbWUgPSBhTmF2T2JqZWN0TmFtZXNbYU5hdk9iamVjdE5hbWVzLmxlbmd0aCAtIDFdOyAvLyBNYXRlcmlhbCBmcm9tIFNhbGVzT3JkZXJNYW5hZ2UuX0l0ZW0uTWF0ZXJpYWxcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTmF2T2JqZWN0TmFtZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG5cdFx0aWYgKG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNYWluRW50aXR5U2V0UGF0aH0vJHthTmF2T2JqZWN0TmFtZXNbaV0ucmVwbGFjZShcIlBfXCIsIFwiXCIpfWApLiRpc0NvbGxlY3Rpb24pIHtcblx0XHRcdHNDb25kaXRpb25QYXRoID0gYCR7c0NvbmRpdGlvblBhdGggKyBhTmF2T2JqZWN0TmFtZXNbaV19Ki9gOyAvLyBfSXRlbSovIGluIGNhc2Ugb2YgMTpuIGNhcmRpbmFsaXR5XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNDb25kaXRpb25QYXRoID0gYCR7c0NvbmRpdGlvblBhdGggKyBhTmF2T2JqZWN0TmFtZXNbaV19L2A7IC8vIF9JdGVtLyBpbiBjYXNlIG9mIDE6MSBjYXJkaW5hbGl0eVxuXHRcdH1cblx0XHRzTWFpbkVudGl0eVNldFBhdGggPSBgJHtzTWFpbkVudGl0eVNldFBhdGh9LyR7YU5hdk9iamVjdE5hbWVzW2ldfWA7XG5cdH1cblx0Y29uc3Qgc05hdlByb3BlcnR5UGF0aCA9IHNGdWxsQ29udGV4dFBhdGguc2xpY2UoMCwgc0Z1bGxDb250ZXh0UGF0aC5sYXN0SW5kZXhPZihcIi9cIikpLFxuXHRcdG9WYWxpZFByb3BlcnRpZXMgPSBDb21tb25VdGlscy5nZXRDb250ZXh0UGF0aFByb3BlcnRpZXMob01ldGFNb2RlbCwgc05hdlByb3BlcnR5UGF0aCksXG5cdFx0YVNlbGVjdE9wdGlvbnNQcm9wZXJ0eU5hbWVzID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMoKTtcblx0bGV0IHNTZWxlY3RPcHRpb25OYW1lID0gc1Byb3BlcnR5TmFtZTtcblx0aWYgKG9WYWxpZFByb3BlcnRpZXNbc1Byb3BlcnR5TmFtZV0pIHtcblx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IHNQcm9wZXJ0eU5hbWU7XG5cdH0gZWxzZSBpZiAoc1Byb3BlcnR5TmFtZS5zdGFydHNXaXRoKFwiUF9cIikgJiYgb1ZhbGlkUHJvcGVydGllc1tzUHJvcGVydHlOYW1lLnJlcGxhY2UoXCJQX1wiLCBcIlwiKV0pIHtcblx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IHNQcm9wZXJ0eU5hbWUucmVwbGFjZShcIlBfXCIsIFwiXCIpO1xuXHR9IGVsc2UgaWYgKG9WYWxpZFByb3BlcnRpZXNbYFBfJHtzUHJvcGVydHlOYW1lfWBdICYmIGFTZWxlY3RPcHRpb25zUHJvcGVydHlOYW1lcy5pbmNsdWRlcyhgUF8ke3NQcm9wZXJ0eU5hbWV9YCkpIHtcblx0XHRzU2VsZWN0T3B0aW9uTmFtZSA9IGBQXyR7c1Byb3BlcnR5TmFtZX1gO1xuXHR9XG5cdGlmIChzUHJvcGVydHlOYW1lLnN0YXJ0c1dpdGgoXCJQX1wiKSAmJiBvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUGF0aCArIHNTZWxlY3RPcHRpb25OYW1lXSkge1xuXHRcdC8vIGlmIHRoZXJlIGlzIG5vIFNhbGVzT3JkZXJNYW5hZ2UuX0l0ZW0uTWF0ZXJpYWwgeWV0IGluIHRoZSBvQ29uZGl0aW9uc1xuXHR9IGVsc2UgaWYgKCFzUHJvcGVydHlOYW1lLnN0YXJ0c1dpdGgoXCJQX1wiKSAmJiBvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUGF0aCArIHNTZWxlY3RPcHRpb25OYW1lXSkge1xuXHRcdGRlbGV0ZSBvQ29uZGl0aW9uc1tzQ29uZGl0aW9uUGF0aCArIHNTZWxlY3RPcHRpb25OYW1lXTtcblx0XHRhZGRTZWxlY3RPcHRpb25zVG9Db25kaXRpb25zKFxuXHRcdFx0c05hdlByb3BlcnR5UGF0aCxcblx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LFxuXHRcdFx0c1NlbGVjdE9wdGlvbixcblx0XHRcdG9Db25kaXRpb25zLFxuXHRcdFx0c0NvbmRpdGlvblBhdGgsXG5cdFx0XHRzU2VsZWN0T3B0aW9uTmFtZSxcblx0XHRcdG9WYWxpZFByb3BlcnRpZXMsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0ZmFsc2UsXG5cdFx0XHRiSXNGTFBWYWx1ZVByZXNlbnQsXG5cdFx0XHRiU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRvVmlld0RhdGFcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdGFkZFNlbGVjdE9wdGlvbnNUb0NvbmRpdGlvbnMoXG5cdFx0XHRzTmF2UHJvcGVydHlQYXRoLFxuXHRcdFx0b1NlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRzU2VsZWN0T3B0aW9uLFxuXHRcdFx0b0NvbmRpdGlvbnMsXG5cdFx0XHRzQ29uZGl0aW9uUGF0aCxcblx0XHRcdHNTZWxlY3RPcHRpb25OYW1lLFxuXHRcdFx0b1ZhbGlkUHJvcGVydGllcyxcblx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRmYWxzZSxcblx0XHRcdGJJc0ZMUFZhbHVlUHJlc2VudCxcblx0XHRcdGJTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdG9WaWV3RGF0YVxuXHRcdCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gYWRkUGFnZUNvbnRleHRUb1NlbGVjdGlvblZhcmlhbnQob1NlbGVjdGlvblZhcmlhbnQ6IGFueSwgbVBhZ2VDb250ZXh0OiBhbnlbXSwgb1ZpZXc6IGFueSkge1xuXHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG9WaWV3KTtcblx0Y29uc3Qgb05hdmlnYXRpb25TZXJ2aWNlID0gb0FwcENvbXBvbmVudC5nZXROYXZpZ2F0aW9uU2VydmljZSgpO1xuXHRyZXR1cm4gb05hdmlnYXRpb25TZXJ2aWNlLm1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50KG1QYWdlQ29udGV4dCwgb1NlbGVjdGlvblZhcmlhbnQudG9KU09OU3RyaW5nKCkpO1xufVxuXG5mdW5jdGlvbiBhZGRFeHRlcm5hbFN0YXRlRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudChvU2VsZWN0aW9uVmFyaWFudDogYW55LCBtRmlsdGVyczogYW55LCBvVGFyZ2V0SW5mbzogYW55LCBvRmlsdGVyQmFyPzogYW55KSB7XG5cdGxldCBzRmlsdGVyOiBhbnk7XG5cdGNvbnN0IGZuR2V0U2lnbkFuZE9wdGlvbiA9IGZ1bmN0aW9uIChzT3BlcmF0b3I6IGFueSwgc0xvd1ZhbHVlOiBhbnksIHNIaWdoVmFsdWU6IGFueSkge1xuXHRcdGNvbnN0IG9TZWxlY3RPcHRpb25TdGF0ZSA9IHtcblx0XHRcdG9wdGlvbjogXCJcIixcblx0XHRcdHNpZ246IFwiSVwiLFxuXHRcdFx0bG93OiBzTG93VmFsdWUsXG5cdFx0XHRoaWdoOiBzSGlnaFZhbHVlXG5cdFx0fTtcblx0XHRzd2l0Y2ggKHNPcGVyYXRvcikge1xuXHRcdFx0Y2FzZSBcIkNvbnRhaW5zXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkNQXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlN0YXJ0c1dpdGhcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiQ1BcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLmxvdyArPSBcIipcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRW5kc1dpdGhcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiQ1BcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLmxvdyA9IGAqJHtvU2VsZWN0T3B0aW9uU3RhdGUubG93fWA7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkJUXCI6XG5cdFx0XHRjYXNlIFwiTEVcIjpcblx0XHRcdGNhc2UgXCJMVFwiOlxuXHRcdFx0Y2FzZSBcIkdUXCI6XG5cdFx0XHRjYXNlIFwiTkVcIjpcblx0XHRcdGNhc2UgXCJFUVwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gc09wZXJhdG9yO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJEQVRFXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkVRXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkRBVEVSQU5HRVwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJCVFwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJGUk9NXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkdFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlRPXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkxFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkVFUVwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJFUVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJFbXB0eVwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJFUVwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUubG93ID0gXCJcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTm90Q29udGFpbnNcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiQ1BcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLnNpZ24gPSBcIkVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTk9UQlRcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiQlRcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLnNpZ24gPSBcIkVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTm90U3RhcnRzV2l0aFwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJDUFwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUubG93ICs9IFwiKlwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUuc2lnbiA9IFwiRVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJOb3RFbmRzV2l0aFwiOlxuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUub3B0aW9uID0gXCJDUFwiO1xuXHRcdFx0XHRvU2VsZWN0T3B0aW9uU3RhdGUubG93ID0gYCoke29TZWxlY3RPcHRpb25TdGF0ZS5sb3d9YDtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLnNpZ24gPSBcIkVcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiTm90RW1wdHlcIjpcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLm9wdGlvbiA9IFwiTkVcIjtcblx0XHRcdFx0b1NlbGVjdE9wdGlvblN0YXRlLmxvdyA9IFwiXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5PVExFXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkxFXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5zaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5PVEdFXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkdFXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5zaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5PVExUXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkxUXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5zaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIk5PVEdUXCI6XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5vcHRpb24gPSBcIkdUXCI7XG5cdFx0XHRcdG9TZWxlY3RPcHRpb25TdGF0ZS5zaWduID0gXCJFXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0TG9nLndhcm5pbmcoYCR7c09wZXJhdG9yfSBpcyBub3Qgc3VwcG9ydGVkLiAke3NGaWx0ZXJ9IGNvdWxkIG5vdCBiZSBhZGRlZCB0byB0aGUgbmF2aWdhdGlvbiBjb250ZXh0YCk7XG5cdFx0fVxuXHRcdHJldHVybiBvU2VsZWN0T3B0aW9uU3RhdGU7XG5cdH07XG5cdGNvbnN0IG9GaWx0ZXJDb25kaXRpb25zID0gbUZpbHRlcnMuZmlsdGVyQ29uZGl0aW9ucztcblx0Y29uc3Qgb0ZpbHRlcnNXaXRob3V0Q29uZmxpY3QgPSBtRmlsdGVycy5maWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0ID8gbUZpbHRlcnMuZmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdCA6IHt9O1xuXHRjb25zdCBvVGFibGVQcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0ID0gb1RhcmdldEluZm8ucHJvcGVydGllc1dpdGhvdXRDb25mbGljdCA/IG9UYXJnZXRJbmZvLnByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QgOiB7fTtcblx0Y29uc3QgYWRkRmlsdGVyc1RvU2VsZWN0aW9uVmFyaWFudCA9IGZ1bmN0aW9uIChzZWxlY3Rpb25WYXJpYW50OiBhbnksIHNGaWx0ZXJOYW1lOiBhbnksIHNQYXRoPzogYW55KSB7XG5cdFx0Y29uc3QgYUNvbmRpdGlvbnMgPSBvRmlsdGVyQ29uZGl0aW9uc1tzRmlsdGVyTmFtZV07XG5cdFx0Y29uc3Qgb1Byb3BlcnR5SW5mbyA9IG9GaWx0ZXJCYXIgJiYgb0ZpbHRlckJhci5nZXRQcm9wZXJ0eUhlbHBlcigpLmdldFByb3BlcnR5KHNGaWx0ZXJOYW1lKTtcblx0XHRjb25zdCBvVHlwZUNvbmZpZyA9IG9Qcm9wZXJ0eUluZm8/LnR5cGVDb25maWc7XG5cdFx0Y29uc3Qgb1R5cGVVdGlsID0gb0ZpbHRlckJhciAmJiBvRmlsdGVyQmFyLmdldENvbnRyb2xEZWxlZ2F0ZSgpLmdldFR5cGVVdGlsKCk7XG5cblx0XHRmb3IgKGNvbnN0IGl0ZW0gaW4gYUNvbmRpdGlvbnMpIHtcblx0XHRcdGNvbnN0IG9Db25kaXRpb24gPSBhQ29uZGl0aW9uc1tpdGVtXTtcblxuXHRcdFx0bGV0IG9wdGlvbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gXCJcIixcblx0XHRcdFx0c2lnbiA9IFwiSVwiLFxuXHRcdFx0XHRsb3cgPSBcIlwiLFxuXHRcdFx0XHRoaWdoID0gbnVsbCxcblx0XHRcdFx0c2VtYW50aWNEYXRlcztcblxuXHRcdFx0Y29uc3Qgb09wZXJhdG9yOiBhbnkgPSBGaWx0ZXJPcGVyYXRvclV0aWwuZ2V0T3BlcmF0b3Iob0NvbmRpdGlvbi5vcGVyYXRvcik7XG5cdFx0XHRpZiAob09wZXJhdG9yIGluc3RhbmNlb2YgUmFuZ2VPcGVyYXRvcikge1xuXHRcdFx0XHRzZW1hbnRpY0RhdGVzID0gQ29tbW9uVXRpbHMuY3JlYXRlU2VtYW50aWNEYXRlc0Zyb21Db25kaXRpb25zKG9Db25kaXRpb24pO1xuXHRcdFx0XHQvLyBoYW5kbGluZyBvZiBEYXRlIFJhbmdlT3BlcmF0b3JzXG5cdFx0XHRcdGNvbnN0IG9Nb2RlbEZpbHRlciA9IG9PcGVyYXRvci5nZXRNb2RlbEZpbHRlcihcblx0XHRcdFx0XHRvQ29uZGl0aW9uLFxuXHRcdFx0XHRcdHNGaWx0ZXJOYW1lLFxuXHRcdFx0XHRcdG9UeXBlQ29uZmlnPy50eXBlSW5zdGFuY2UsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0b1R5cGVDb25maWc/LmJhc2VUeXBlXG5cdFx0XHRcdCkgYXMgYW55O1xuXHRcdFx0XHRpZiAoIW9Nb2RlbEZpbHRlcj8uYUZpbHRlcnMgJiYgIW9Nb2RlbEZpbHRlcj8uYUZpbHRlcnM/Lmxlbmd0aCkge1xuXHRcdFx0XHRcdHNpZ24gPSAob09wZXJhdG9yIGFzIGFueSk/LmV4Y2x1ZGUgPyBcIkVcIiA6IFwiSVwiO1xuXHRcdFx0XHRcdGxvdyA9IG9UeXBlVXRpbC5leHRlcm5hbGl6ZVZhbHVlKG9Nb2RlbEZpbHRlci5nZXRWYWx1ZTEoKSwgb1R5cGVDb25maWcudHlwZUluc3RhbmNlKTtcblx0XHRcdFx0XHRoaWdoID0gb1R5cGVVdGlsLmV4dGVybmFsaXplVmFsdWUob01vZGVsRmlsdGVyLmdldFZhbHVlMigpLCBvVHlwZUNvbmZpZy50eXBlSW5zdGFuY2UpO1xuXHRcdFx0XHRcdG9wdGlvbiA9IG9Nb2RlbEZpbHRlci5nZXRPcGVyYXRvcigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBhU2VtYW50aWNEYXRlT3BzRXh0ID0gU2VtYW50aWNEYXRlT3BlcmF0b3JzLmdldFN1cHBvcnRlZE9wZXJhdGlvbnMoKTtcblx0XHRcdFx0aWYgKGFTZW1hbnRpY0RhdGVPcHNFeHQuaW5jbHVkZXMob0NvbmRpdGlvbj8ub3BlcmF0b3IpKSB7XG5cdFx0XHRcdFx0c2VtYW50aWNEYXRlcyA9IENvbW1vblV0aWxzLmNyZWF0ZVNlbWFudGljRGF0ZXNGcm9tQ29uZGl0aW9ucyhvQ29uZGl0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCB2YWx1ZTEgPSAob0NvbmRpdGlvbi52YWx1ZXNbMF0gJiYgb0NvbmRpdGlvbi52YWx1ZXNbMF0udG9TdHJpbmcoKSkgfHwgXCJcIjtcblx0XHRcdFx0Y29uc3QgdmFsdWUyID0gKG9Db25kaXRpb24udmFsdWVzWzFdICYmIG9Db25kaXRpb24udmFsdWVzWzFdLnRvU3RyaW5nKCkpIHx8IG51bGw7XG5cdFx0XHRcdGNvbnN0IG9TZWxlY3RPcHRpb24gPSBmbkdldFNpZ25BbmRPcHRpb24ob0NvbmRpdGlvbi5vcGVyYXRvciwgdmFsdWUxLCB2YWx1ZTIpO1xuXHRcdFx0XHRzaWduID0gb09wZXJhdG9yPy5leGNsdWRlID8gXCJFXCIgOiBcIklcIjtcblx0XHRcdFx0bG93ID0gb1NlbGVjdE9wdGlvbj8ubG93O1xuXHRcdFx0XHRoaWdoID0gb1NlbGVjdE9wdGlvbj8uaGlnaDtcblx0XHRcdFx0b3B0aW9uID0gb1NlbGVjdE9wdGlvbj8ub3B0aW9uO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAob3B0aW9uICYmIHNlbWFudGljRGF0ZXMpIHtcblx0XHRcdFx0c2VsZWN0aW9uVmFyaWFudC5hZGRTZWxlY3RPcHRpb24oc1BhdGggPyBzUGF0aCA6IHNGaWx0ZXJOYW1lLCBzaWduLCBvcHRpb24sIGxvdywgaGlnaCwgdW5kZWZpbmVkLCBzZW1hbnRpY0RhdGVzKTtcblx0XHRcdH0gZWxzZSBpZiAob3B0aW9uKSB7XG5cdFx0XHRcdHNlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKHNQYXRoID8gc1BhdGggOiBzRmlsdGVyTmFtZSwgc2lnbiwgb3B0aW9uLCBsb3csIGhpZ2gpO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblxuXHRmb3IgKHNGaWx0ZXIgaW4gb0ZpbHRlckNvbmRpdGlvbnMpIHtcblx0XHQvLyBvbmx5IGFkZCB0aGUgZmlsdGVyIHZhbHVlcyBpZiBpdCBpcyBub3QgYWxyZWFkeSBwcmVzZW50IGluIHRoZSBTViBhbHJlYWR5XG5cdFx0aWYgKCFvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oc0ZpbHRlcikpIHtcblx0XHRcdC8vIFRPRE8gOiBjdXN0b20gZmlsdGVycyBzaG91bGQgYmUgaWdub3JlZCBtb3JlIGdlbmVyaWNhbGx5XG5cdFx0XHRpZiAoc0ZpbHRlciA9PT0gXCIkZWRpdFN0YXRlXCIpIHtcblx0XHRcdFx0Y29udGludWU7XG5cdFx0XHR9XG5cdFx0XHRhZGRGaWx0ZXJzVG9TZWxlY3Rpb25WYXJpYW50KG9TZWxlY3Rpb25WYXJpYW50LCBzRmlsdGVyKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0aWYgKG9UYWJsZVByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QgJiYgc0ZpbHRlciBpbiBvVGFibGVQcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0KSB7XG5cdFx0XHRcdGFkZEZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQob1NlbGVjdGlvblZhcmlhbnQsIHNGaWx0ZXIsIG9UYWJsZVByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3Rbc0ZpbHRlcl0pO1xuXHRcdFx0fVxuXHRcdFx0Ly8gaWYgcHJvcGVydHkgd2FzIHdpdGhvdXQgY29uZmxpY3QgaW4gcGFnZSBjb250ZXh0IHRoZW4gYWRkIHBhdGggZnJvbSBwYWdlIGNvbnRleHQgdG8gU1Zcblx0XHRcdGlmIChzRmlsdGVyIGluIG9GaWx0ZXJzV2l0aG91dENvbmZsaWN0KSB7XG5cdFx0XHRcdGFkZEZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQob1NlbGVjdGlvblZhcmlhbnQsIHNGaWx0ZXIsIG9GaWx0ZXJzV2l0aG91dENvbmZsaWN0W3NGaWx0ZXJdKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG9TZWxlY3Rpb25WYXJpYW50O1xufVxuXG5mdW5jdGlvbiBpc1N0aWNreUVkaXRNb2RlKG9Db250cm9sOiBDb250cm9sKSB7XG5cdGNvbnN0IGJJc1N0aWNreU1vZGUgPSBNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQoKG9Db250cm9sLmdldE1vZGVsKCkgYXMgT0RhdGFNb2RlbCkuZ2V0TWV0YU1vZGVsKCkpO1xuXHRjb25zdCBiVUlFZGl0YWJsZSA9IG9Db250cm9sLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKTtcblx0cmV0dXJuIGJJc1N0aWNreU1vZGUgJiYgYlVJRWRpdGFibGU7XG59XG5cbi8qKlxuICogQHBhcmFtIGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHNcbiAqIEBwYXJhbSBvU2VsZWN0aW9uVmFyaWFudFxuICogQHBhcmFtIG9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHNcbiAqL1xuZnVuY3Rpb24gYWRkRGVmYXVsdERpc3BsYXlDdXJyZW5jeShhTWFuZGF0b3J5RmlsdGVyRmllbGRzOiBhbnlbXSwgb1NlbGVjdGlvblZhcmlhbnQ6IGFueSwgb1NlbGVjdGlvblZhcmlhbnREZWZhdWx0czogYW55KSB7XG5cdGlmIChvU2VsZWN0aW9uVmFyaWFudCAmJiBhTWFuZGF0b3J5RmlsdGVyRmllbGRzICYmIGFNYW5kYXRvcnlGaWx0ZXJGaWVsZHMubGVuZ3RoKSB7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTWFuZGF0b3J5RmlsdGVyRmllbGRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBhU1ZPcHRpb24gPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oXCJEaXNwbGF5Q3VycmVuY3lcIiksXG5cdFx0XHRcdGFEZWZhdWx0U1ZPcHRpb24gPSBvU2VsZWN0aW9uVmFyaWFudERlZmF1bHRzICYmIG9TZWxlY3Rpb25WYXJpYW50RGVmYXVsdHMuZ2V0U2VsZWN0T3B0aW9uKFwiRGlzcGxheUN1cnJlbmN5XCIpO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRhTWFuZGF0b3J5RmlsdGVyRmllbGRzW2ldLiRQcm9wZXJ0eVBhdGggPT09IFwiRGlzcGxheUN1cnJlbmN5XCIgJiZcblx0XHRcdFx0KCFhU1ZPcHRpb24gfHwgIWFTVk9wdGlvbi5sZW5ndGgpICYmXG5cdFx0XHRcdGFEZWZhdWx0U1ZPcHRpb24gJiZcblx0XHRcdFx0YURlZmF1bHRTVk9wdGlvbi5sZW5ndGhcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBkaXNwbGF5Q3VycmVuY3lTZWxlY3RPcHRpb24gPSBhRGVmYXVsdFNWT3B0aW9uWzBdO1xuXHRcdFx0XHRjb25zdCBzU2lnbiA9IGRpc3BsYXlDdXJyZW5jeVNlbGVjdE9wdGlvbltcIlNpZ25cIl07XG5cdFx0XHRcdGNvbnN0IHNPcHRpb24gPSBkaXNwbGF5Q3VycmVuY3lTZWxlY3RPcHRpb25bXCJPcHRpb25cIl07XG5cdFx0XHRcdGNvbnN0IHNMb3cgPSBkaXNwbGF5Q3VycmVuY3lTZWxlY3RPcHRpb25bXCJMb3dcIl07XG5cdFx0XHRcdGNvbnN0IHNIaWdoID0gZGlzcGxheUN1cnJlbmN5U2VsZWN0T3B0aW9uW1wiSGlnaFwiXTtcblx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQuYWRkU2VsZWN0T3B0aW9uKFwiRGlzcGxheUN1cnJlbmN5XCIsIHNTaWduLCBzT3B0aW9uLCBzTG93LCBzSGlnaCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGdldE5vbkNvbXB1dGVkVmlzaWJsZUZpZWxkcyhvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgc1BhdGg6IGFueSwgb1ZpZXc/OiBhbnkpIHtcblx0Y29uc3QgYVRlY2huaWNhbEtleXMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH0vYCkuJEtleTtcblx0Y29uc3QgYU5vbkNvbXB1dGVkVmlzaWJsZUZpZWxkczogYW55ID0gW107XG5cdGNvbnN0IGFJbW11dGFibGVWaXNpYmxlRmllbGRzOiBhbnkgPSBbXTtcblx0Y29uc3Qgb0VudGl0eVR5cGUgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH0vYCk7XG5cdGZvciAoY29uc3QgaXRlbSBpbiBvRW50aXR5VHlwZSkge1xuXHRcdGlmIChvRW50aXR5VHlwZVtpdGVtXS4ka2luZCAmJiBvRW50aXR5VHlwZVtpdGVtXS4ka2luZCA9PT0gXCJQcm9wZXJ0eVwiKSB7XG5cdFx0XHRjb25zdCBvQW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH0vJHtpdGVtfUBgKSB8fCB7fSxcblx0XHRcdFx0YklzS2V5ID0gYVRlY2huaWNhbEtleXMuaW5kZXhPZihpdGVtKSA+IC0xLFxuXHRcdFx0XHRiSXNJbW11dGFibGUgPSBvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuSW1tdXRhYmxlXCJdLFxuXHRcdFx0XHRiSXNOb25Db21wdXRlZCA9ICFvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWRcIl0sXG5cdFx0XHRcdGJJc1Zpc2libGUgPSAhb0Fubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXSxcblx0XHRcdFx0YklzQ29tcHV0ZWREZWZhdWx0VmFsdWUgPSBvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWREZWZhdWx0VmFsdWVcIl0sXG5cdFx0XHRcdGJJc0tleUNvbXB1dGVkRGVmYXVsdFZhbHVlV2l0aFRleHQgPVxuXHRcdFx0XHRcdGJJc0tleSAmJiBvRW50aXR5VHlwZVtpdGVtXS4kVHlwZSA9PT0gXCJFZG0uR3VpZFwiXG5cdFx0XHRcdFx0XHQ/IGJJc0NvbXB1dGVkRGVmYXVsdFZhbHVlICYmIG9Bbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiXVxuXHRcdFx0XHRcdFx0OiBmYWxzZTtcblx0XHRcdGlmIChcblx0XHRcdFx0KGJJc0tleUNvbXB1dGVkRGVmYXVsdFZhbHVlV2l0aFRleHQgfHwgKGJJc0tleSAmJiBvRW50aXR5VHlwZVtpdGVtXS4kVHlwZSAhPT0gXCJFZG0uR3VpZFwiKSkgJiZcblx0XHRcdFx0YklzTm9uQ29tcHV0ZWQgJiZcblx0XHRcdFx0YklzVmlzaWJsZVxuXHRcdFx0KSB7XG5cdFx0XHRcdGFOb25Db21wdXRlZFZpc2libGVGaWVsZHMucHVzaChpdGVtKTtcblx0XHRcdH0gZWxzZSBpZiAoYklzSW1tdXRhYmxlICYmIGJJc05vbkNvbXB1dGVkICYmIGJJc1Zpc2libGUpIHtcblx0XHRcdFx0YUltbXV0YWJsZVZpc2libGVGaWVsZHMucHVzaChpdGVtKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCFiSXNOb25Db21wdXRlZCAmJiBiSXNDb21wdXRlZERlZmF1bHRWYWx1ZSAmJiBvVmlldykge1xuXHRcdFx0XHRjb25zdCBvRGlhZ25vc3RpY3MgPSBnZXRBcHBDb21wb25lbnQob1ZpZXcpLmdldERpYWdub3N0aWNzKCk7XG5cdFx0XHRcdGNvbnN0IHNNZXNzYWdlID0gXCJDb3JlLkNvbXB1dGVkRGVmYXVsdFZhbHVlIGlzIGlnbm9yZWQgYXMgQ29yZS5Db21wdXRlZCBpcyBhbHJlYWR5IHNldCB0byB0cnVlXCI7XG5cdFx0XHRcdG9EaWFnbm9zdGljcy5hZGRJc3N1ZShcblx0XHRcdFx0XHRJc3N1ZUNhdGVnb3J5LkFubm90YXRpb24sXG5cdFx0XHRcdFx0SXNzdWVTZXZlcml0eS5NZWRpdW0sXG5cdFx0XHRcdFx0c01lc3NhZ2UsXG5cdFx0XHRcdFx0SXNzdWVDYXRlZ29yeVR5cGUsXG5cdFx0XHRcdFx0SXNzdWVDYXRlZ29yeVR5cGU/LkFubm90YXRpb25zPy5JZ25vcmVkQW5ub3RhdGlvblxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRjb25zdCBhUmVxdWlyZWRQcm9wZXJ0aWVzID0gQ29tbW9uVXRpbHMuZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyhzUGF0aCwgb01ldGFNb2RlbCk7XG5cdGlmIChhUmVxdWlyZWRQcm9wZXJ0aWVzLmxlbmd0aCkge1xuXHRcdGFSZXF1aXJlZFByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAoc1Byb3BlcnR5OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9Bbm5vdGF0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NQYXRofS8ke3NQcm9wZXJ0eX1AYCksXG5cdFx0XHRcdGJJc1Zpc2libGUgPSAhb0Fubm90YXRpb25zIHx8ICFvQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdO1xuXHRcdFx0aWYgKGJJc1Zpc2libGUgJiYgYU5vbkNvbXB1dGVkVmlzaWJsZUZpZWxkcy5pbmRleE9mKHNQcm9wZXJ0eSkgPT09IC0xICYmIGFJbW11dGFibGVWaXNpYmxlRmllbGRzLmluZGV4T2Yoc1Byb3BlcnR5KSA9PT0gLTEpIHtcblx0XHRcdFx0YU5vbkNvbXB1dGVkVmlzaWJsZUZpZWxkcy5wdXNoKHNQcm9wZXJ0eSk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIGFOb25Db21wdXRlZFZpc2libGVGaWVsZHMuY29uY2F0KGFJbW11dGFibGVWaXNpYmxlRmllbGRzKTtcbn1cblxuZnVuY3Rpb24gZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzKHNQYXRoOiBhbnksIG9NZXRhTW9kZWw6IGFueSwgYkNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zOiBib29sZWFuID0gZmFsc2UpIHtcblx0Y29uc3QgYVJlcXVpcmVkUHJvcGVydGllczogYW55ID0gW107XG5cdGxldCBhUmVxdWlyZWRQcm9wZXJ0aWVzV2l0aFBhdGhzOiBhbnkgPSBbXTtcblx0Y29uc3QgbmF2aWdhdGlvblRleHQgPSBcIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCI7XG5cdGxldCBvRW50aXR5U2V0QW5ub3RhdGlvbnM7XG5cdGlmIChzUGF0aC5lbmRzV2l0aChcIiRcIikpIHtcblx0XHQvLyBpZiBzUGF0aCBjb21lcyB3aXRoIGEgJCBpbiB0aGUgZW5kLCByZW1vdmluZyBpdCBhcyBpdCBpcyBvZiBubyBzaWduaWZpY2FuY2Vcblx0XHRzUGF0aCA9IHNQYXRoLnJlcGxhY2UoXCIvJFwiLCBcIlwiKTtcblx0fVxuXHRjb25zdCBlbnRpdHlUeXBlUGF0aFBhcnRzID0gc1BhdGgucmVwbGFjZUFsbChcIiUyRlwiLCBcIi9cIikuc3BsaXQoXCIvXCIpLmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZyk7XG5cdGNvbnN0IGVudGl0eVNldFBhdGggPSBNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKHNQYXRoLCBvTWV0YU1vZGVsKTtcblx0Y29uc3QgZW50aXR5U2V0UGF0aFBhcnRzID0gZW50aXR5U2V0UGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKE1vZGVsSGVscGVyLmZpbHRlck91dE5hdlByb3BCaW5kaW5nKTtcblx0Y29uc3QgaXNDb250YWlubWVudCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtlbnRpdHlUeXBlUGF0aFBhcnRzLmpvaW4oXCIvXCIpfS8kQ29udGFpbnNUYXJnZXRgKTtcblx0Y29uc3QgY29udGFpbm1lbnROYXZQYXRoID0gaXNDb250YWlubWVudCAmJiBlbnRpdHlUeXBlUGF0aFBhcnRzW2VudGl0eVR5cGVQYXRoUGFydHMubGVuZ3RoIC0gMV07XG5cblx0Ly9SZXN0cmljdGlvbnMgZGlyZWN0bHkgYXQgRW50aXR5IFNldFxuXHQvL2UuZy4gRlIgaW4gXCJOUy5FbnRpdHlDb250YWluZXIvU2FsZXNPcmRlck1hbmFnZVwiIENvbnRleHRQYXRoOiAvU2FsZXNPcmRlck1hbmFnZVxuXHRpZiAoIWlzQ29udGFpbm1lbnQpIHtcblx0XHRvRW50aXR5U2V0QW5ub3RhdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofUBgKTtcblx0fVxuXHRpZiAoZW50aXR5VHlwZVBhdGhQYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0Y29uc3QgbmF2UGF0aCA9IGlzQ29udGFpbm1lbnQgPyBjb250YWlubWVudE5hdlBhdGggOiBlbnRpdHlTZXRQYXRoUGFydHNbZW50aXR5U2V0UGF0aFBhcnRzLmxlbmd0aCAtIDFdO1xuXHRcdGNvbnN0IHBhcmVudEVudGl0eVNldFBhdGggPSBpc0NvbnRhaW5tZW50ID8gZW50aXR5U2V0UGF0aCA6IGAvJHtlbnRpdHlTZXRQYXRoUGFydHMuc2xpY2UoMCwgLTEpLmpvaW4oYC8ke25hdmlnYXRpb25UZXh0fS9gKX1gO1xuXHRcdC8vTmF2aWdhdGlvbiByZXN0cmljdGlvbnNcblx0XHQvL2UuZy4gUGFyZW50IFwiL0N1c3RvbWVyXCIgd2l0aCBOYXZpZ2F0aW9uUHJvcGVydHlQYXRoPVwiU2V0XCIgQ29udGV4dFBhdGg6IEN1c3RvbWVyL1NldFxuXHRcdGNvbnN0IG9OYXZSZXN0ID0gQ29tbW9uVXRpbHMuZ2V0TmF2aWdhdGlvblJlc3RyaWN0aW9ucyhvTWV0YU1vZGVsLCBwYXJlbnRFbnRpdHlTZXRQYXRoLCBuYXZQYXRoLnJlcGxhY2VBbGwoXCIlMkZcIiwgXCIvXCIpKTtcblxuXHRcdGlmIChDb21tb25VdGlscy5oYXNSZXN0cmljdGVkUHJvcGVydGllc0luQW5ub3RhdGlvbnMob05hdlJlc3QsIHRydWUsIGJDaGVja1VwZGF0ZVJlc3RyaWN0aW9ucykpIHtcblx0XHRcdGFSZXF1aXJlZFByb3BlcnRpZXNXaXRoUGF0aHMgPSBiQ2hlY2tVcGRhdGVSZXN0cmljdGlvbnNcblx0XHRcdFx0PyBvTmF2UmVzdFtcIlVwZGF0ZVJlc3RyaWN0aW9uc1wiXS5SZXF1aXJlZFByb3BlcnRpZXNcblx0XHRcdFx0OiBvTmF2UmVzdFtcIkluc2VydFJlc3RyaWN0aW9uc1wiXS5SZXF1aXJlZFByb3BlcnRpZXM7XG5cdFx0fVxuXHRcdGlmIChcblx0XHRcdCghYVJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRocyB8fCAhYVJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRocy5sZW5ndGgpICYmXG5cdFx0XHRDb21tb25VdGlscy5oYXNSZXN0cmljdGVkUHJvcGVydGllc0luQW5ub3RhdGlvbnMob0VudGl0eVNldEFubm90YXRpb25zLCBmYWxzZSwgYkNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zKVxuXHRcdCkge1xuXHRcdFx0YVJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRocyA9IENvbW1vblV0aWxzLmdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21Bbm5vdGF0aW9ucyhcblx0XHRcdFx0b0VudGl0eVNldEFubm90YXRpb25zLFxuXHRcdFx0XHRiQ2hlY2tVcGRhdGVSZXN0cmljdGlvbnNcblx0XHRcdCk7XG5cdFx0fVxuXHR9IGVsc2UgaWYgKENvbW1vblV0aWxzLmhhc1Jlc3RyaWN0ZWRQcm9wZXJ0aWVzSW5Bbm5vdGF0aW9ucyhvRW50aXR5U2V0QW5ub3RhdGlvbnMsIGZhbHNlLCBiQ2hlY2tVcGRhdGVSZXN0cmljdGlvbnMpKSB7XG5cdFx0YVJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRocyA9IENvbW1vblV0aWxzLmdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21Bbm5vdGF0aW9ucyhvRW50aXR5U2V0QW5ub3RhdGlvbnMsIGJDaGVja1VwZGF0ZVJlc3RyaWN0aW9ucyk7XG5cdH1cblx0YVJlcXVpcmVkUHJvcGVydGllc1dpdGhQYXRocy5mb3JFYWNoKGZ1bmN0aW9uIChvUmVxdWlyZWRQcm9wZXJ0eTogYW55KSB7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5ID0gb1JlcXVpcmVkUHJvcGVydHlbXCIkUHJvcGVydHlQYXRoXCJdO1xuXHRcdGFSZXF1aXJlZFByb3BlcnRpZXMucHVzaChzUHJvcGVydHkpO1xuXHR9KTtcblx0cmV0dXJuIGFSZXF1aXJlZFByb3BlcnRpZXM7XG59XG5cbmZ1bmN0aW9uIGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMoc1BhdGg6IGFueSwgb01ldGFNb2RlbDogYW55KSB7XG5cdHJldHVybiBDb21tb25VdGlscy5nZXRSZXF1aXJlZFByb3BlcnRpZXMoc1BhdGgsIG9NZXRhTW9kZWwpO1xufVxuXG5mdW5jdGlvbiBnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zKHNQYXRoOiBhbnksIG9NZXRhTW9kZWw6IGFueSkge1xuXHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzKHNQYXRoLCBvTWV0YU1vZGVsLCB0cnVlKTtcbn1cblxuZnVuY3Rpb24gZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUFubm90YXRpb25zKG9Bbm5vdGF0aW9uczogYW55LCBiQ2hlY2tVcGRhdGVSZXN0cmljdGlvbnM6IGJvb2xlYW4gPSBmYWxzZSkge1xuXHRpZiAoYkNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zKSB7XG5cdFx0cmV0dXJuIG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlVwZGF0ZVJlc3RyaWN0aW9uc1wiXS5SZXF1aXJlZFByb3BlcnRpZXM7XG5cdH1cblx0cmV0dXJuIG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkluc2VydFJlc3RyaWN0aW9uc1wiXS5SZXF1aXJlZFByb3BlcnRpZXM7XG59XG5cbmZ1bmN0aW9uIGhhc1Jlc3RyaWN0ZWRQcm9wZXJ0aWVzSW5Bbm5vdGF0aW9ucyhcblx0b0Fubm90YXRpb25zOiBhbnksXG5cdGJJc05hdmlnYXRpb25SZXN0cmljdGlvbnM6IGJvb2xlYW4gPSBmYWxzZSxcblx0YkNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zOiBib29sZWFuID0gZmFsc2Vcbikge1xuXHRpZiAoYklzTmF2aWdhdGlvblJlc3RyaWN0aW9ucykge1xuXHRcdGlmIChiQ2hlY2tVcGRhdGVSZXN0cmljdGlvbnMpIHtcblx0XHRcdHJldHVybiBvQW5ub3RhdGlvbnMgJiYgb0Fubm90YXRpb25zW1wiVXBkYXRlUmVzdHJpY3Rpb25zXCJdICYmIG9Bbm5vdGF0aW9uc1tcIlVwZGF0ZVJlc3RyaWN0aW9uc1wiXS5SZXF1aXJlZFByb3BlcnRpZXNcblx0XHRcdFx0PyB0cnVlXG5cdFx0XHRcdDogZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiBvQW5ub3RhdGlvbnMgJiYgb0Fubm90YXRpb25zW1wiSW5zZXJ0UmVzdHJpY3Rpb25zXCJdICYmIG9Bbm5vdGF0aW9uc1tcIkluc2VydFJlc3RyaWN0aW9uc1wiXS5SZXF1aXJlZFByb3BlcnRpZXMgPyB0cnVlIDogZmFsc2U7XG5cdH0gZWxzZSBpZiAoYkNoZWNrVXBkYXRlUmVzdHJpY3Rpb25zKSB7XG5cdFx0cmV0dXJuIG9Bbm5vdGF0aW9ucyAmJlxuXHRcdFx0b0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuVXBkYXRlUmVzdHJpY3Rpb25zXCJdICYmXG5cdFx0XHRvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5VcGRhdGVSZXN0cmljdGlvbnNcIl0uUmVxdWlyZWRQcm9wZXJ0aWVzXG5cdFx0XHQ/IHRydWVcblx0XHRcdDogZmFsc2U7XG5cdH1cblx0cmV0dXJuIG9Bbm5vdGF0aW9ucyAmJlxuXHRcdG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkluc2VydFJlc3RyaWN0aW9uc1wiXSAmJlxuXHRcdG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkluc2VydFJlc3RyaWN0aW9uc1wiXS5SZXF1aXJlZFByb3BlcnRpZXNcblx0XHQ/IHRydWVcblx0XHQ6IGZhbHNlO1xufVxuXG5mdW5jdGlvbiBzZXRVc2VyRGVmYXVsdHMoXG5cdG9BcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudCxcblx0YVBhcmFtZXRlcnM6IGFueVtdLFxuXHRvTW9kZWw6IEpTT05Nb2RlbCB8IE9EYXRhVjRDb250ZXh0LFxuXHRiSXNBY3Rpb246IGJvb2xlYW4sXG5cdGJJc0NyZWF0ZT86IGJvb2xlYW4sXG5cdG9BY3Rpb25EZWZhdWx0VmFsdWVzPzogYW55XG4pIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCkge1xuXHRcdGNvbnN0IG9Db21wb25lbnREYXRhID0gb0FwcENvbXBvbmVudC5nZXRDb21wb25lbnREYXRhKCksXG5cdFx0XHRvU3RhcnR1cFBhcmFtZXRlcnMgPSAob0NvbXBvbmVudERhdGEgJiYgb0NvbXBvbmVudERhdGEuc3RhcnR1cFBhcmFtZXRlcnMpIHx8IHt9LFxuXHRcdFx0b1NoZWxsU2VydmljZXMgPSBvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKTtcblx0XHRpZiAoIW9TaGVsbFNlcnZpY2VzLmhhc1VTaGVsbCgpKSB7XG5cdFx0XHRhUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChvUGFyYW1ldGVyOiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgc1Byb3BlcnR5TmFtZSA9IGJJc0FjdGlvblxuXHRcdFx0XHRcdD8gYC8ke29QYXJhbWV0ZXIuJE5hbWV9YFxuXHRcdFx0XHRcdDogKG9QYXJhbWV0ZXIuZ2V0UGF0aD8uKCkuc2xpY2Uob1BhcmFtZXRlci5nZXRQYXRoKCkubGFzdEluZGV4T2YoXCIvXCIpICsgMSkgYXMgc3RyaW5nKTtcblx0XHRcdFx0Y29uc3Qgc1BhcmFtZXRlck5hbWUgPSBiSXNBY3Rpb24gPyBzUHJvcGVydHlOYW1lLnNsaWNlKDEpIDogc1Byb3BlcnR5TmFtZTtcblx0XHRcdFx0aWYgKG9BY3Rpb25EZWZhdWx0VmFsdWVzICYmIGJJc0NyZWF0ZSkge1xuXHRcdFx0XHRcdGlmIChvQWN0aW9uRGVmYXVsdFZhbHVlc1tzUGFyYW1ldGVyTmFtZV0pIHtcblx0XHRcdFx0XHRcdG9Nb2RlbC5zZXRQcm9wZXJ0eShzUHJvcGVydHlOYW1lLCBvQWN0aW9uRGVmYXVsdFZhbHVlc1tzUGFyYW1ldGVyTmFtZV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChvU3RhcnR1cFBhcmFtZXRlcnNbc1BhcmFtZXRlck5hbWVdKSB7XG5cdFx0XHRcdFx0b01vZGVsLnNldFByb3BlcnR5KHNQcm9wZXJ0eU5hbWUsIG9TdGFydHVwUGFyYW1ldGVyc1tzUGFyYW1ldGVyTmFtZV1bMF0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiByZXNvbHZlKHRydWUpO1xuXHRcdH1cblx0XHRyZXR1cm4gb1NoZWxsU2VydmljZXMuZ2V0U3RhcnR1cEFwcFN0YXRlKG9BcHBDb21wb25lbnQpLnRoZW4oZnVuY3Rpb24gKG9TdGFydHVwQXBwU3RhdGU6IGFueSkge1xuXHRcdFx0Y29uc3Qgb0RhdGEgPSBvU3RhcnR1cEFwcFN0YXRlLmdldERhdGEoKSB8fCB7fSxcblx0XHRcdFx0YUV4dGVuZGVkUGFyYW1ldGVycyA9IChvRGF0YS5zZWxlY3Rpb25WYXJpYW50ICYmIG9EYXRhLnNlbGVjdGlvblZhcmlhbnQuU2VsZWN0T3B0aW9ucykgfHwgW107XG5cdFx0XHRhUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChvUGFyYW1ldGVyOiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgc1Byb3BlcnR5TmFtZSA9IGJJc0FjdGlvblxuXHRcdFx0XHRcdD8gYC8ke29QYXJhbWV0ZXIuJE5hbWV9YFxuXHRcdFx0XHRcdDogKG9QYXJhbWV0ZXIuZ2V0UGF0aD8uKCkuc2xpY2Uob1BhcmFtZXRlci5nZXRQYXRoKCkubGFzdEluZGV4T2YoXCIvXCIpICsgMSkgYXMgc3RyaW5nKTtcblx0XHRcdFx0Y29uc3Qgc1BhcmFtZXRlck5hbWUgPSBiSXNBY3Rpb24gPyBzUHJvcGVydHlOYW1lLnNsaWNlKDEpIDogc1Byb3BlcnR5TmFtZTtcblx0XHRcdFx0aWYgKG9BY3Rpb25EZWZhdWx0VmFsdWVzICYmIGJJc0NyZWF0ZSkge1xuXHRcdFx0XHRcdGlmIChvQWN0aW9uRGVmYXVsdFZhbHVlc1tzUGFyYW1ldGVyTmFtZV0pIHtcblx0XHRcdFx0XHRcdG9Nb2RlbC5zZXRQcm9wZXJ0eShzUHJvcGVydHlOYW1lLCBvQWN0aW9uRGVmYXVsdFZhbHVlc1tzUGFyYW1ldGVyTmFtZV0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIGlmIChvU3RhcnR1cFBhcmFtZXRlcnNbc1BhcmFtZXRlck5hbWVdKSB7XG5cdFx0XHRcdFx0b01vZGVsLnNldFByb3BlcnR5KHNQcm9wZXJ0eU5hbWUsIG9TdGFydHVwUGFyYW1ldGVyc1tzUGFyYW1ldGVyTmFtZV1bMF0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFFeHRlbmRlZFBhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGZvciAoY29uc3QgaSBpbiBhRXh0ZW5kZWRQYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvRXh0ZW5kZWRQYXJhbWV0ZXIgPSBhRXh0ZW5kZWRQYXJhbWV0ZXJzW2ldO1xuXHRcdFx0XHRcdFx0aWYgKG9FeHRlbmRlZFBhcmFtZXRlci5Qcm9wZXJ0eU5hbWUgPT09IHNQYXJhbWV0ZXJOYW1lKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9SYW5nZSA9IG9FeHRlbmRlZFBhcmFtZXRlci5SYW5nZXMubGVuZ3RoXG5cdFx0XHRcdFx0XHRcdFx0PyBvRXh0ZW5kZWRQYXJhbWV0ZXIuUmFuZ2VzW29FeHRlbmRlZFBhcmFtZXRlci5SYW5nZXMubGVuZ3RoIC0gMV1cblx0XHRcdFx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdFx0aWYgKG9SYW5nZSAmJiBvUmFuZ2UuU2lnbiA9PT0gXCJJXCIgJiYgb1JhbmdlLk9wdGlvbiA9PT0gXCJFUVwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0b01vZGVsLnNldFByb3BlcnR5KHNQcm9wZXJ0eU5hbWUsIG9SYW5nZS5Mb3cpOyAvLyBoaWdoIGlzIGlnbm9yZWQgd2hlbiBPcHRpb249RVFcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gcmVzb2x2ZSh0cnVlKTtcblx0XHR9KTtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldEFkZGl0aW9uYWxQYXJhbXNGb3JDcmVhdGUob1N0YXJ0dXBQYXJhbWV0ZXJzOiBhbnksIG9JbmJvdW5kUGFyYW1ldGVyczogYW55KSB7XG5cdGNvbnN0IG9JbmJvdW5kcyA9IG9JbmJvdW5kUGFyYW1ldGVycyxcblx0XHRhQ3JlYXRlUGFyYW1ldGVycyA9IG9JbmJvdW5kc1xuXHRcdFx0PyBPYmplY3Qua2V5cyhvSW5ib3VuZHMpLmZpbHRlcihmdW5jdGlvbiAoc1BhcmFtZXRlcjogc3RyaW5nKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9JbmJvdW5kc1tzUGFyYW1ldGVyXS51c2VGb3JDcmVhdGU7XG5cdFx0XHQgIH0pXG5cdFx0XHQ6IFtdO1xuXHRsZXQgb1JldDtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhQ3JlYXRlUGFyYW1ldGVycy5sZW5ndGg7IGkrKykge1xuXHRcdGNvbnN0IHNDcmVhdGVQYXJhbWV0ZXIgPSBhQ3JlYXRlUGFyYW1ldGVyc1tpXTtcblx0XHRjb25zdCBhVmFsdWVzID0gb1N0YXJ0dXBQYXJhbWV0ZXJzICYmIG9TdGFydHVwUGFyYW1ldGVyc1tzQ3JlYXRlUGFyYW1ldGVyXTtcblx0XHRpZiAoYVZhbHVlcyAmJiBhVmFsdWVzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0b1JldCA9IG9SZXQgfHwgT2JqZWN0LmNyZWF0ZShudWxsKTtcblx0XHRcdG9SZXRbc0NyZWF0ZVBhcmFtZXRlcl0gPSBhVmFsdWVzWzBdO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb1JldDtcbn1cblxuZnVuY3Rpb24gZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5nKG9PdXRib3VuZDogYW55KSB7XG5cdGNvbnN0IGFTZW1hbnRpY09iamVjdE1hcHBpbmc6IGFueVtdID0gW107XG5cdGlmIChvT3V0Ym91bmQucGFyYW1ldGVycykge1xuXHRcdGNvbnN0IGFQYXJhbWV0ZXJzID0gT2JqZWN0LmtleXMob091dGJvdW5kLnBhcmFtZXRlcnMpIHx8IFtdO1xuXHRcdGlmIChhUGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRhUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChzUGFyYW06IHN0cmluZykge1xuXHRcdFx0XHRjb25zdCBvTWFwcGluZyA9IG9PdXRib3VuZC5wYXJhbWV0ZXJzW3NQYXJhbV07XG5cdFx0XHRcdGlmIChvTWFwcGluZy52YWx1ZSAmJiBvTWFwcGluZy52YWx1ZS52YWx1ZSAmJiBvTWFwcGluZy52YWx1ZS5mb3JtYXQgPT09IFwiYmluZGluZ1wiKSB7XG5cdFx0XHRcdFx0Ly8gdXNpbmcgdGhlIGZvcm1hdCBvZiBVSS5NYXBwaW5nXG5cdFx0XHRcdFx0Y29uc3Qgb1NlbWFudGljTWFwcGluZyA9IHtcblx0XHRcdFx0XHRcdFwiTG9jYWxQcm9wZXJ0eVwiOiB7XG5cdFx0XHRcdFx0XHRcdFwiJFByb3BlcnR5UGF0aFwiOiBvTWFwcGluZy52YWx1ZS52YWx1ZVxuXHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFwiU2VtYW50aWNPYmplY3RQcm9wZXJ0eVwiOiBzUGFyYW1cblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0aWYgKGFTZW1hbnRpY09iamVjdE1hcHBpbmcubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0Ly8gVG8gY2hlY2sgaWYgdGhlIHNlbWFudGljT2JqZWN0IE1hcHBpbmcgaXMgZG9uZSBmb3IgdGhlIHNhbWUgbG9jYWwgcHJvcGVydHkgbW9yZSB0aGF0IG9uY2UgdGhlbiBmaXJzdCBvbmUgd2lsbCBiZSBjb25zaWRlcmVkXG5cdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFTZW1hbnRpY09iamVjdE1hcHBpbmcubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHRcdGFTZW1hbnRpY09iamVjdE1hcHBpbmdbaV1bXCJMb2NhbFByb3BlcnR5XCJdW1wiJFByb3BlcnR5UGF0aFwiXSAhPT1cblx0XHRcdFx0XHRcdFx0XHRvU2VtYW50aWNNYXBwaW5nW1wiTG9jYWxQcm9wZXJ0eVwiXVtcIiRQcm9wZXJ0eVBhdGhcIl1cblx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0YVNlbWFudGljT2JqZWN0TWFwcGluZy5wdXNoKG9TZW1hbnRpY01hcHBpbmcpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGFTZW1hbnRpY09iamVjdE1hcHBpbmcucHVzaChvU2VtYW50aWNNYXBwaW5nKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gYVNlbWFudGljT2JqZWN0TWFwcGluZztcbn1cblxuZnVuY3Rpb24gZ2V0SGVhZGVyRmFjZXRJdGVtQ29uZmlnRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uKG9WaWV3RGF0YTogYW55LCBvQ3Jvc3NOYXY6IGFueSkge1xuXHRjb25zdCBvSGVhZGVyRmFjZXRJdGVtczogYW55ID0ge307XG5cdGxldCBzSWQ7XG5cdGNvbnN0IG9Db250cm9sQ29uZmlnID0gb1ZpZXdEYXRhLmNvbnRyb2xDb25maWd1cmF0aW9uO1xuXHRmb3IgKGNvbnN0IGNvbmZpZyBpbiBvQ29udHJvbENvbmZpZykge1xuXHRcdGlmIChjb25maWcuaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIikgPiAtMSB8fCBjb25maWcuaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFwiKSA+IC0xKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9Db250cm9sQ29uZmlnW2NvbmZpZ10ubmF2aWdhdGlvbiAmJlxuXHRcdFx0XHRvQ29udHJvbENvbmZpZ1tjb25maWddLm5hdmlnYXRpb24udGFyZ2V0T3V0Ym91bmQgJiZcblx0XHRcdFx0b0NvbnRyb2xDb25maWdbY29uZmlnXS5uYXZpZ2F0aW9uLnRhcmdldE91dGJvdW5kLm91dGJvdW5kXG5cdFx0XHQpIHtcblx0XHRcdFx0Y29uc3Qgc091dGJvdW5kID0gb0NvbnRyb2xDb25maWdbY29uZmlnXS5uYXZpZ2F0aW9uLnRhcmdldE91dGJvdW5kLm91dGJvdW5kO1xuXHRcdFx0XHRjb25zdCBvT3V0Ym91bmQgPSBvQ3Jvc3NOYXZbc091dGJvdW5kXTtcblx0XHRcdFx0aWYgKG9PdXRib3VuZC5zZW1hbnRpY09iamVjdCAmJiBvT3V0Ym91bmQuYWN0aW9uKSB7XG5cdFx0XHRcdFx0aWYgKGNvbmZpZy5pbmRleE9mKFwiQ2hhcnRcIikgPiAtMSkge1xuXHRcdFx0XHRcdFx0c0lkID0gZ2VuZXJhdGUoW1wiZmVcIiwgXCJNaWNyb0NoYXJ0TGlua1wiLCBjb25maWddKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c0lkID0gZ2VuZXJhdGUoW1wiZmVcIiwgXCJIZWFkZXJEUExpbmtcIiwgY29uZmlnXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdE1hcHBpbmcgPSBDb21tb25VdGlscy5nZXRTZW1hbnRpY09iamVjdE1hcHBpbmcob091dGJvdW5kKTtcblx0XHRcdFx0XHRvSGVhZGVyRmFjZXRJdGVtc1tzSWRdID0ge1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG9PdXRib3VuZC5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdGFjdGlvbjogb091dGJvdW5kLmFjdGlvbixcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0TWFwcGluZzogYVNlbWFudGljT2JqZWN0TWFwcGluZ1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKGBDcm9zcyBuYXZpZ2F0aW9uIG91dGJvdW5kIGlzIGNvbmZpZ3VyZWQgd2l0aG91dCBzZW1hbnRpYyBvYmplY3QgYW5kIGFjdGlvbiBmb3IgJHtzT3V0Ym91bmR9YCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblx0cmV0dXJuIG9IZWFkZXJGYWNldEl0ZW1zO1xufVxuXG5mdW5jdGlvbiBzZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzKG9TZWxlY3Rpb25WYXJpYW50OiBhbnksIHZNYXBwaW5nczogb2JqZWN0KSB7XG5cdGNvbnN0IG9NYXBwaW5ncyA9IHR5cGVvZiB2TWFwcGluZ3MgPT09IFwic3RyaW5nXCIgPyBKU09OLnBhcnNlKHZNYXBwaW5ncykgOiB2TWFwcGluZ3M7XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgb01hcHBpbmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y29uc3Qgc0xvY2FsUHJvcGVydHkgPVxuXHRcdFx0KG9NYXBwaW5nc1tpXVtcIkxvY2FsUHJvcGVydHlcIl0gJiYgb01hcHBpbmdzW2ldW1wiTG9jYWxQcm9wZXJ0eVwiXVtcIiRQcm9wZXJ0eVBhdGhcIl0pIHx8XG5cdFx0XHQob01hcHBpbmdzW2ldW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Mb2NhbFByb3BlcnR5XCJdICYmXG5cdFx0XHRcdG9NYXBwaW5nc1tpXVtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTG9jYWxQcm9wZXJ0eVwiXVtcIiRQYXRoXCJdKTtcblx0XHRjb25zdCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSA9XG5cdFx0XHRvTWFwcGluZ3NbaV1bXCJTZW1hbnRpY09iamVjdFByb3BlcnR5XCJdIHx8IG9NYXBwaW5nc1tpXVtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RQcm9wZXJ0eVwiXTtcblx0XHRpZiAob1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uKHNMb2NhbFByb3BlcnR5KSkge1xuXHRcdFx0Y29uc3Qgb1NlbGVjdE9wdGlvbiA9IG9TZWxlY3Rpb25WYXJpYW50LmdldFNlbGVjdE9wdGlvbihzTG9jYWxQcm9wZXJ0eSk7XG5cblx0XHRcdC8vQ3JlYXRlIGEgbmV3IFNlbGVjdE9wdGlvbiB3aXRoIHNTZW1hbnRpY09iamVjdFByb3BlcnR5IGFzIHRoZSBwcm9wZXJ0eSBOYW1lIGFuZCByZW1vdmUgdGhlIG9sZGVyIG9uZVxuXHRcdFx0b1NlbGVjdGlvblZhcmlhbnQucmVtb3ZlU2VsZWN0T3B0aW9uKHNMb2NhbFByb3BlcnR5KTtcblx0XHRcdG9TZWxlY3Rpb25WYXJpYW50Lm1hc3NBZGRTZWxlY3RPcHRpb24oc1NlbWFudGljT2JqZWN0UHJvcGVydHksIG9TZWxlY3RPcHRpb24pO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb1NlbGVjdGlvblZhcmlhbnQ7XG59XG5cbmZ1bmN0aW9uIGZuR2V0U2VtYW50aWNPYmplY3RzRnJvbVBhdGgob01ldGFNb2RlbDogYW55LCBzUGF0aDogc3RyaW5nLCBzUXVhbGlmaWVyOiBzdHJpbmcpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiAodmFsdWU6IGFueSkgPT4gdm9pZCkge1xuXHRcdGxldCBzU2VtYW50aWNPYmplY3QsIGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucztcblx0XHRpZiAoc1F1YWxpZmllciA9PT0gXCJcIikge1xuXHRcdFx0c1NlbWFudGljT2JqZWN0ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhdGh9QCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0fWApO1xuXHRcdFx0YVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c1BhdGh9QCR7Q29tbW9uQW5ub3RhdGlvblRlcm1zLlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zfWApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzU2VtYW50aWNPYmplY3QgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH1AJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3R9IyR7c1F1YWxpZmllcn1gKTtcblx0XHRcdGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRgJHtzUGF0aH1AJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnN9IyR7c1F1YWxpZmllcn1gXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdEZvckdldExpbmtzID0gW3sgc2VtYW50aWNPYmplY3Q6IHNTZW1hbnRpY09iamVjdCB9XTtcblx0XHRjb25zdCBvU2VtYW50aWNPYmplY3QgPSB7XG5cdFx0XHRzZW1hbnRpY09iamVjdDogc1NlbWFudGljT2JqZWN0XG5cdFx0fTtcblx0XHRyZXNvbHZlKHtcblx0XHRcdHNlbWFudGljT2JqZWN0UGF0aDogc1BhdGgsXG5cdFx0XHRzZW1hbnRpY09iamVjdEZvckdldExpbmtzOiBhU2VtYW50aWNPYmplY3RGb3JHZXRMaW5rcyxcblx0XHRcdHNlbWFudGljT2JqZWN0OiBvU2VtYW50aWNPYmplY3QsXG5cdFx0XHR1bmF2YWlsYWJsZUFjdGlvbnM6IGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1xuXHRcdH0pO1xuXHR9KS5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRMb2cuZXJyb3IoXCJFcnJvciBpbiBmbkdldFNlbWFudGljT2JqZWN0c0Zyb21QYXRoXCIsIG9FcnJvcik7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBmblVwZGF0ZVNlbWFudGljVGFyZ2V0c01vZGVsKGFHZXRMaW5rc1Byb21pc2VzOiBhbnksIGFTZW1hbnRpY09iamVjdHM6IGFueSwgb0ludGVybmFsTW9kZWxDb250ZXh0OiBhbnksIHNDdXJyZW50SGFzaDogYW55KSB7XG5cdHJldHVybiBQcm9taXNlLmFsbChhR2V0TGlua3NQcm9taXNlcylcblx0XHQudGhlbihmdW5jdGlvbiAoYVZhbHVlczogYW55W10pIHtcblx0XHRcdGxldCBhTGlua3MsXG5cdFx0XHRcdF9vTGluayxcblx0XHRcdFx0X3NMaW5rSW50ZW50QWN0aW9uLFxuXHRcdFx0XHRhRmluYWxMaW5rczogYW55W10gPSBbXTtcblx0XHRcdGxldCBvRmluYWxTZW1hbnRpY09iamVjdHM6IGFueSA9IHt9O1xuXHRcdFx0Y29uc3QgYkludGVudEhhc0FjdGlvbnMgPSBmdW5jdGlvbiAoc0ludGVudDogYW55LCBhQWN0aW9uczogYW55KSB7XG5cdFx0XHRcdGZvciAoY29uc3QgaW50ZW50IGluIGFBY3Rpb25zKSB7XG5cdFx0XHRcdFx0aWYgKGludGVudCA9PT0gc0ludGVudCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdGZvciAobGV0IGsgPSAwOyBrIDwgYVZhbHVlcy5sZW5ndGg7IGsrKykge1xuXHRcdFx0XHRhTGlua3MgPSBhVmFsdWVzW2tdO1xuXHRcdFx0XHRpZiAoYUxpbmtzICYmIGFMaW5rcy5sZW5ndGggPiAwICYmIGFMaW5rc1swXSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1NlbWFudGljT2JqZWN0OiBhbnkgPSB7fTtcblx0XHRcdFx0XHRsZXQgb1RtcCA9IHt9O1xuXHRcdFx0XHRcdGxldCBzQWx0ZXJuYXRlUGF0aDtcblx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFMaW5rcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0YUZpbmFsTGlua3MucHVzaChbXSk7XG5cdFx0XHRcdFx0XHRsZXQgaGFzVGFyZ2V0c05vdEZpbHRlcmVkID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRsZXQgaGFzVGFyZ2V0cyA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0Zm9yIChsZXQgaUxpbmtDb3VudCA9IDA7IGlMaW5rQ291bnQgPCBhTGlua3NbaV1bMF0ubGVuZ3RoOyBpTGlua0NvdW50KyspIHtcblx0XHRcdFx0XHRcdFx0X29MaW5rID0gYUxpbmtzW2ldWzBdW2lMaW5rQ291bnRdO1xuXHRcdFx0XHRcdFx0XHRfc0xpbmtJbnRlbnRBY3Rpb24gPSBfb0xpbmsgJiYgX29MaW5rLmludGVudC5zcGxpdChcIj9cIilbMF0uc3BsaXQoXCItXCIpWzFdO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghKF9vTGluayAmJiBfb0xpbmsuaW50ZW50ICYmIF9vTGluay5pbnRlbnQuaW5kZXhPZihzQ3VycmVudEhhc2gpID09PSAwKSkge1xuXHRcdFx0XHRcdFx0XHRcdGhhc1RhcmdldHNOb3RGaWx0ZXJlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKCFiSW50ZW50SGFzQWN0aW9ucyhfc0xpbmtJbnRlbnRBY3Rpb24sIGFTZW1hbnRpY09iamVjdHNba10udW5hdmFpbGFibGVBY3Rpb25zKSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0YUZpbmFsTGlua3NbaV0ucHVzaChfb0xpbmspO1xuXHRcdFx0XHRcdFx0XHRcdFx0aGFzVGFyZ2V0cyA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRvVG1wID0ge1xuXHRcdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogYVNlbWFudGljT2JqZWN0c1trXS5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdFx0cGF0aDogYVNlbWFudGljT2JqZWN0c1trXS5wYXRoLFxuXHRcdFx0XHRcdFx0XHRIYXNUYXJnZXRzOiBoYXNUYXJnZXRzLFxuXHRcdFx0XHRcdFx0XHRIYXNUYXJnZXRzTm90RmlsdGVyZWQ6IGhhc1RhcmdldHNOb3RGaWx0ZXJlZFxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGlmIChvU2VtYW50aWNPYmplY3RbYVNlbWFudGljT2JqZWN0c1trXS5zZW1hbnRpY09iamVjdF0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRvU2VtYW50aWNPYmplY3RbYVNlbWFudGljT2JqZWN0c1trXS5zZW1hbnRpY09iamVjdF0gPSB7fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNBbHRlcm5hdGVQYXRoID0gYVNlbWFudGljT2JqZWN0c1trXS5wYXRoLnJlcGxhY2UoL1xcLy9nLCBcIl9cIik7XG5cdFx0XHRcdFx0XHRpZiAob1NlbWFudGljT2JqZWN0W2FTZW1hbnRpY09iamVjdHNba10uc2VtYW50aWNPYmplY3RdW3NBbHRlcm5hdGVQYXRoXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdG9TZW1hbnRpY09iamVjdFthU2VtYW50aWNPYmplY3RzW2tdLnNlbWFudGljT2JqZWN0XVtzQWx0ZXJuYXRlUGF0aF0gPSB7fTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9TZW1hbnRpY09iamVjdFthU2VtYW50aWNPYmplY3RzW2tdLnNlbWFudGljT2JqZWN0XVtzQWx0ZXJuYXRlUGF0aF0gPSBPYmplY3QuYXNzaWduKFxuXHRcdFx0XHRcdFx0XHRvU2VtYW50aWNPYmplY3RbYVNlbWFudGljT2JqZWN0c1trXS5zZW1hbnRpY09iamVjdF1bc0FsdGVybmF0ZVBhdGhdLFxuXHRcdFx0XHRcdFx0XHRvVG1wXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb25zdCBzU2VtYW50aWNPYmplY3ROYW1lID0gT2JqZWN0LmtleXMob1NlbWFudGljT2JqZWN0KVswXTtcblx0XHRcdFx0XHRpZiAoT2JqZWN0LmtleXMob0ZpbmFsU2VtYW50aWNPYmplY3RzKS5pbmNsdWRlcyhzU2VtYW50aWNPYmplY3ROYW1lKSkge1xuXHRcdFx0XHRcdFx0b0ZpbmFsU2VtYW50aWNPYmplY3RzW3NTZW1hbnRpY09iamVjdE5hbWVdID0gT2JqZWN0LmFzc2lnbihcblx0XHRcdFx0XHRcdFx0b0ZpbmFsU2VtYW50aWNPYmplY3RzW3NTZW1hbnRpY09iamVjdE5hbWVdLFxuXHRcdFx0XHRcdFx0XHRvU2VtYW50aWNPYmplY3Rbc1NlbWFudGljT2JqZWN0TmFtZV1cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG9GaW5hbFNlbWFudGljT2JqZWN0cyA9IE9iamVjdC5hc3NpZ24ob0ZpbmFsU2VtYW50aWNPYmplY3RzLCBvU2VtYW50aWNPYmplY3QpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRhRmluYWxMaW5rcyA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoT2JqZWN0LmtleXMob0ZpbmFsU2VtYW50aWNPYmplY3RzKS5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcblx0XHRcdFx0XHRcInNlbWFudGljc1RhcmdldHNcIixcblx0XHRcdFx0XHRtZXJnZU9iamVjdHMob0ZpbmFsU2VtYW50aWNPYmplY3RzLCBvSW50ZXJuYWxNb2RlbENvbnRleHQuZ2V0UHJvcGVydHkoXCJzZW1hbnRpY3NUYXJnZXRzXCIpKVxuXHRcdFx0XHQpO1xuXHRcdFx0XHRyZXR1cm4gb0ZpbmFsU2VtYW50aWNPYmplY3RzO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiZm5VcGRhdGVTZW1hbnRpY1RhcmdldHNNb2RlbDogQ2Fubm90IHJlYWQgbGlua3NcIiwgb0Vycm9yKTtcblx0XHR9KTtcbn1cblxuZnVuY3Rpb24gZm5HZXRTZW1hbnRpY09iamVjdFByb21pc2Uob0FwcENvbXBvbmVudDogYW55LCBvVmlldzogYW55LCBvTWV0YU1vZGVsOiBhbnksIHNQYXRoOiBzdHJpbmcsIHNRdWFsaWZpZXI6IHN0cmluZykge1xuXHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0U2VtYW50aWNPYmplY3RzRnJvbVBhdGgob01ldGFNb2RlbCwgc1BhdGgsIHNRdWFsaWZpZXIpO1xufVxuXG5mdW5jdGlvbiBmblByZXBhcmVTZW1hbnRpY09iamVjdHNQcm9taXNlcyhcblx0X29BcHBDb21wb25lbnQ6IGFueSxcblx0X29WaWV3OiBhbnksXG5cdF9vTWV0YU1vZGVsOiBhbnksXG5cdF9hU2VtYW50aWNPYmplY3RzRm91bmQ6IHN0cmluZ1tdLFxuXHRfYVNlbWFudGljT2JqZWN0c1Byb21pc2VzOiBQcm9taXNlPGFueT5bXVxuKSB7XG5cdGxldCBfS2V5czogc3RyaW5nW10sIHNQYXRoO1xuXHRsZXQgc1F1YWxpZmllcjogc3RyaW5nLCByZWdleFJlc3VsdDtcblx0Zm9yIChsZXQgaSA9IDA7IGkgPCBfYVNlbWFudGljT2JqZWN0c0ZvdW5kLmxlbmd0aDsgaSsrKSB7XG5cdFx0c1BhdGggPSBfYVNlbWFudGljT2JqZWN0c0ZvdW5kW2ldO1xuXHRcdF9LZXlzID0gT2JqZWN0LmtleXMoX29NZXRhTW9kZWwuZ2V0T2JqZWN0KHNQYXRoICsgXCJAXCIpKTtcblx0XHRmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgX0tleXMubGVuZ3RoOyBpbmRleCsrKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdF9LZXlzW2luZGV4XS5pbmRleE9mKGBAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3R9YCkgPT09IDAgJiZcblx0XHRcdFx0X0tleXNbaW5kZXhdLmluZGV4T2YoYEAke0NvbW1vbkFubm90YXRpb25UZXJtcy5TZW1hbnRpY09iamVjdE1hcHBpbmd9YCkgPT09IC0xICYmXG5cdFx0XHRcdF9LZXlzW2luZGV4XS5pbmRleE9mKGBAJHtDb21tb25Bbm5vdGF0aW9uVGVybXMuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnN9YCkgPT09IC0xXG5cdFx0XHQpIHtcblx0XHRcdFx0cmVnZXhSZXN1bHQgPSAvIyguKikvLmV4ZWMoX0tleXNbaW5kZXhdKTtcblx0XHRcdFx0c1F1YWxpZmllciA9IHJlZ2V4UmVzdWx0ID8gcmVnZXhSZXN1bHRbMV0gOiBcIlwiO1xuXHRcdFx0XHRfYVNlbWFudGljT2JqZWN0c1Byb21pc2VzLnB1c2goXG5cdFx0XHRcdFx0Q29tbW9uVXRpbHMuZ2V0U2VtYW50aWNPYmplY3RQcm9taXNlKF9vQXBwQ29tcG9uZW50LCBfb1ZpZXcsIF9vTWV0YU1vZGVsLCBzUGF0aCwgc1F1YWxpZmllcilcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZm5HZXRTZW1hbnRpY1RhcmdldHNGcm9tUGFnZU1vZGVsKG9Db250cm9sbGVyOiBhbnksIHNQYWdlTW9kZWw6IHN0cmluZykge1xuXHRjb25zdCBfZm5maW5kVmFsdWVzSGVscGVyID0gZnVuY3Rpb24gKG9iajogYW55LCBrZXk6IGFueSwgbGlzdDogYW55KSB7XG5cdFx0aWYgKCFvYmopIHtcblx0XHRcdHJldHVybiBsaXN0O1xuXHRcdH1cblx0XHRpZiAob2JqIGluc3RhbmNlb2YgQXJyYXkpIHtcblx0XHRcdGZvciAoY29uc3QgaSBpbiBvYmopIHtcblx0XHRcdFx0bGlzdCA9IGxpc3QuY29uY2F0KF9mbmZpbmRWYWx1ZXNIZWxwZXIob2JqW2ldLCBrZXksIFtdKSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gbGlzdDtcblx0XHR9XG5cdFx0aWYgKG9ialtrZXldKSB7XG5cdFx0XHRsaXN0LnB1c2gob2JqW2tleV0pO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2Ygb2JqID09IFwib2JqZWN0XCIgJiYgb2JqICE9PSBudWxsKSB7XG5cdFx0XHRjb25zdCBjaGlsZHJlbiA9IE9iamVjdC5rZXlzKG9iaik7XG5cdFx0XHRpZiAoY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0bGlzdCA9IGxpc3QuY29uY2F0KF9mbmZpbmRWYWx1ZXNIZWxwZXIob2JqW2NoaWxkcmVuW2ldXSwga2V5LCBbXSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBsaXN0O1xuXHR9O1xuXHRjb25zdCBfZm5maW5kVmFsdWVzID0gZnVuY3Rpb24gKG9iajogYW55LCBrZXk6IGFueSkge1xuXHRcdHJldHVybiBfZm5maW5kVmFsdWVzSGVscGVyKG9iaiwga2V5LCBbXSk7XG5cdH07XG5cdGNvbnN0IF9mbkRlbGV0ZUR1cGxpY2F0ZVNlbWFudGljT2JqZWN0cyA9IGZ1bmN0aW9uIChhU2VtYW50aWNPYmplY3RQYXRoOiBhbnkpIHtcblx0XHRyZXR1cm4gYVNlbWFudGljT2JqZWN0UGF0aC5maWx0ZXIoZnVuY3Rpb24gKHZhbHVlOiBhbnksIGluZGV4OiBhbnkpIHtcblx0XHRcdHJldHVybiBhU2VtYW50aWNPYmplY3RQYXRoLmluZGV4T2YodmFsdWUpID09PSBpbmRleDtcblx0XHR9KTtcblx0fTtcblx0Y29uc3Qgb1ZpZXcgPSBvQ29udHJvbGxlci5nZXRWaWV3KCk7XG5cdGNvbnN0IG9JbnRlcm5hbE1vZGVsQ29udGV4dCA9IG9WaWV3LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik7XG5cblx0aWYgKG9JbnRlcm5hbE1vZGVsQ29udGV4dCkge1xuXHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdHNQcm9taXNlczogUHJvbWlzZTxhbnk+W10gPSBbXTtcblx0XHRjb25zdCBvQ29tcG9uZW50ID0gb0NvbnRyb2xsZXIuZ2V0T3duZXJDb21wb25lbnQoKTtcblx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKG9Db21wb25lbnQpIGFzIEFwcENvbXBvbmVudDtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0FwcENvbXBvbmVudC5nZXRNZXRhTW9kZWwoKTtcblx0XHRsZXQgb1BhZ2VNb2RlbCA9IG9Db21wb25lbnQuZ2V0TW9kZWwoc1BhZ2VNb2RlbCkuZ2V0RGF0YSgpO1xuXHRcdGlmIChKU09OLnN0cmluZ2lmeShvUGFnZU1vZGVsKSA9PT0gXCJ7fVwiKSB7XG5cdFx0XHRvUGFnZU1vZGVsID0gb0NvbXBvbmVudC5nZXRNb2RlbChzUGFnZU1vZGVsKS5fZ2V0T2JqZWN0KFwiL1wiLCB1bmRlZmluZWQpO1xuXHRcdH1cblx0XHRsZXQgYVNlbWFudGljT2JqZWN0c0ZvdW5kID0gX2ZuZmluZFZhbHVlcyhvUGFnZU1vZGVsLCBcInNlbWFudGljT2JqZWN0UGF0aFwiKTtcblx0XHRhU2VtYW50aWNPYmplY3RzRm91bmQgPSBfZm5EZWxldGVEdXBsaWNhdGVTZW1hbnRpY09iamVjdHMoYVNlbWFudGljT2JqZWN0c0ZvdW5kKTtcblx0XHRjb25zdCBvU2hlbGxTZXJ2aWNlSGVscGVyID0gQ29tbW9uVXRpbHMuZ2V0U2hlbGxTZXJ2aWNlcyhvQXBwQ29tcG9uZW50KTtcblx0XHRsZXQgc0N1cnJlbnRIYXNoID0gQ29tbW9uVXRpbHMuZ2V0SGFzaCgpO1xuXHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdHNGb3JHZXRMaW5rcyA9IFtdO1xuXHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdHM6IGFueVtdID0gW107XG5cdFx0bGV0IF9vU2VtYW50aWNPYmplY3Q7XG5cblx0XHRpZiAoc0N1cnJlbnRIYXNoICYmIHNDdXJyZW50SGFzaC5pbmRleE9mKFwiP1wiKSAhPT0gLTEpIHtcblx0XHRcdC8vIHNDdXJyZW50SGFzaCBjYW4gY29udGFpbiBxdWVyeSBzdHJpbmcsIGN1dCBpdCBvZmYhXG5cdFx0XHRzQ3VycmVudEhhc2ggPSBzQ3VycmVudEhhc2guc3BsaXQoXCI/XCIpWzBdO1xuXHRcdH1cblxuXHRcdGZuUHJlcGFyZVNlbWFudGljT2JqZWN0c1Byb21pc2VzKG9BcHBDb21wb25lbnQsIG9WaWV3LCBvTWV0YU1vZGVsLCBhU2VtYW50aWNPYmplY3RzRm91bmQsIGFTZW1hbnRpY09iamVjdHNQcm9taXNlcyk7XG5cblx0XHRpZiAoYVNlbWFudGljT2JqZWN0c1Byb21pc2VzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRQcm9taXNlLmFsbChhU2VtYW50aWNPYmplY3RzUHJvbWlzZXMpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uIChhVmFsdWVzOiBhbnlbXSkge1xuXHRcdFx0XHRcdGNvbnN0IGFHZXRMaW5rc1Byb21pc2VzID0gW107XG5cdFx0XHRcdFx0bGV0IHNTZW1PYmpFeHByZXNzaW9uO1xuXHRcdFx0XHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdHNSZXNvbHZlZCA9IGFWYWx1ZXMuZmlsdGVyKGZ1bmN0aW9uIChlbGVtZW50OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC5zZW1hbnRpY09iamVjdCAhPT0gdW5kZWZpbmVkICYmXG5cdFx0XHRcdFx0XHRcdGVsZW1lbnQuc2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QgJiZcblx0XHRcdFx0XHRcdFx0dHlwZW9mIGVsZW1lbnQuc2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QgPT09IFwib2JqZWN0XCJcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRzU2VtT2JqRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKHBhdGhJbk1vZGVsKGVsZW1lbnQuc2VtYW50aWNPYmplY3Quc2VtYW50aWNPYmplY3QuJFBhdGgpKTtcblx0XHRcdFx0XHRcdFx0ZWxlbWVudC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdCA9IHNTZW1PYmpFeHByZXNzaW9uO1xuXHRcdFx0XHRcdFx0XHRlbGVtZW50LnNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3NbMF0uc2VtYW50aWNPYmplY3QgPSBzU2VtT2JqRXhwcmVzc2lvbjtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGVsZW1lbnQpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGVsZW1lbnQuc2VtYW50aWNPYmplY3QgIT09IHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGFTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0X29TZW1hbnRpY09iamVjdCA9IGFTZW1hbnRpY09iamVjdHNSZXNvbHZlZFtqXTtcblx0XHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdFx0X29TZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0XHRcdFx0XHRfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0ICYmXG5cdFx0XHRcdFx0XHRcdCEoX29TZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdC5zZW1hbnRpY09iamVjdC5pbmRleE9mKFwie1wiKSA9PT0gMClcblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RzRm9yR2V0TGlua3MucHVzaChfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3MpO1xuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNPYmplY3RzLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0XHRcdHVuYXZhaWxhYmxlQWN0aW9uczogX29TZW1hbnRpY09iamVjdC51bmF2YWlsYWJsZUFjdGlvbnMsXG5cdFx0XHRcdFx0XHRcdFx0cGF0aDogYVNlbWFudGljT2JqZWN0c1Jlc29sdmVkW2pdLnNlbWFudGljT2JqZWN0UGF0aFxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0YUdldExpbmtzUHJvbWlzZXMucHVzaChvU2hlbGxTZXJ2aWNlSGVscGVyLmdldExpbmtzV2l0aENhY2hlKFtfb1NlbWFudGljT2JqZWN0LnNlbWFudGljT2JqZWN0Rm9yR2V0TGlua3NdKSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBDb21tb25VdGlscy51cGRhdGVTZW1hbnRpY1RhcmdldHMoYUdldExpbmtzUHJvbWlzZXMsIGFTZW1hbnRpY09iamVjdHMsIG9JbnRlcm5hbE1vZGVsQ29udGV4dCwgc0N1cnJlbnRIYXNoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRcdExvZy5lcnJvcihcImZuR2V0U2VtYW50aWNUYXJnZXRzRnJvbVRhYmxlOiBDYW5ub3QgZ2V0IFNlbWFudGljIE9iamVjdHNcIiwgb0Vycm9yKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0fVxufVxuXG5mdW5jdGlvbiBnZXRGaWx0ZXJSZXN0cmljdGlvbnMob0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb246IGFueSwgc1Jlc3RyaWN0aW9uOiBhbnkpIHtcblx0Y29uc3QgRmlsdGVyUmVzdHJpY3Rpb25zID0gQ29tbW9uVXRpbHMuRmlsdGVyUmVzdHJpY3Rpb25zO1xuXHRpZiAoc1Jlc3RyaWN0aW9uID09PSBGaWx0ZXJSZXN0cmljdGlvbnMuUkVRVUlSRURfUFJPUEVSVElFUyB8fCBzUmVzdHJpY3Rpb24gPT09IEZpbHRlclJlc3RyaWN0aW9ucy5OT05fRklMVEVSQUJMRV9QUk9QRVJUSUVTKSB7XG5cdFx0bGV0IGFQcm9wcyA9IFtdO1xuXHRcdGlmIChvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiAmJiBvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbltzUmVzdHJpY3Rpb25dKSB7XG5cdFx0XHRhUHJvcHMgPSBvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbltzUmVzdHJpY3Rpb25dLm1hcChmdW5jdGlvbiAob1Byb3BlcnR5OiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBhUHJvcHM7XG5cdH0gZWxzZSBpZiAoc1Jlc3RyaWN0aW9uID09PSBGaWx0ZXJSZXN0cmljdGlvbnMuQUxMT1dFRF9FWFBSRVNTSU9OUykge1xuXHRcdGNvbnN0IG1BbGxvd2VkRXhwcmVzc2lvbnM6IGFueSA9IHt9O1xuXHRcdGlmIChvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbiAmJiBvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbi5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zKSB7XG5cdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zQW5ub3RhdGlvbi5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25zLmZvckVhY2goZnVuY3Rpb24gKG9Qcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRcdC8vU2luZ2xlVmFsdWUgfCBNdWx0aVZhbHVlIHwgU2luZ2xlUmFuZ2UgfCBNdWx0aVJhbmdlIHwgU2VhcmNoRXhwcmVzc2lvbiB8IE11bHRpUmFuZ2VPclNlYXJjaEV4cHJlc3Npb25cblx0XHRcdFx0aWYgKG1BbGxvd2VkRXhwcmVzc2lvbnNbb1Byb3BlcnR5LlByb3BlcnR5LiRQcm9wZXJ0eVBhdGhdKSB7XG5cdFx0XHRcdFx0bUFsbG93ZWRFeHByZXNzaW9uc1tvUHJvcGVydHkuUHJvcGVydHkuJFByb3BlcnR5UGF0aF0ucHVzaChvUHJvcGVydHkuQWxsb3dlZEV4cHJlc3Npb25zKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtQWxsb3dlZEV4cHJlc3Npb25zW29Qcm9wZXJ0eS5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoXSA9IFtvUHJvcGVydHkuQWxsb3dlZEV4cHJlc3Npb25zXTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBtQWxsb3dlZEV4cHJlc3Npb25zO1xuXHR9XG5cdC8vIERlZmF1bHQgcmV0dXJuIHRoZSBGaWx0ZXJSZXN0cmljdGlvbnMgQW5ub3RhdGlvblxuXHRyZXR1cm4gb0ZpbHRlclJlc3RyaWN0aW9uc0Fubm90YXRpb247XG59XG5cbmZ1bmN0aW9uIF9mZXRjaFByb3BlcnRpZXNGb3JOYXZQYXRoKHBhdGhzOiBzdHJpbmdbXSwgbmF2UGF0aDogc3RyaW5nLCBwcm9wczogc3RyaW5nW10pIHtcblx0Y29uc3QgbmF2UGF0aFByZWZpeCA9IG5hdlBhdGggKyBcIi9cIjtcblx0cmV0dXJuIHBhdGhzLnJlZHVjZSgob3V0UGF0aHM6IGFueSwgcGF0aFRvQ2hlY2s6IHN0cmluZykgPT4ge1xuXHRcdGlmIChwYXRoVG9DaGVjay5zdGFydHNXaXRoKG5hdlBhdGhQcmVmaXgpKSB7XG5cdFx0XHRjb25zdCBvdXRQYXRoID0gcGF0aFRvQ2hlY2sucmVwbGFjZShuYXZQYXRoUHJlZml4LCBcIlwiKTtcblx0XHRcdGlmIChvdXRQYXRocy5pbmRleE9mKG91dFBhdGgpID09PSAtMSkge1xuXHRcdFx0XHRvdXRQYXRocy5wdXNoKG91dFBhdGgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb3V0UGF0aHM7XG5cdH0sIHByb3BzKTtcbn1cblxuZnVuY3Rpb24gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoKGVudGl0eVBhdGg6IHN0cmluZywgb01ldGFNb2RlbDogYW55KSB7XG5cdGNvbnN0IG9SZXQ6IGFueSA9IHt9LFxuXHRcdEZSID0gQ29tbW9uVXRpbHMuRmlsdGVyUmVzdHJpY3Rpb25zO1xuXHRsZXQgb0ZpbHRlclJlc3RyaWN0aW9ucztcblx0Y29uc3QgbmF2aWdhdGlvblRleHQgPSBcIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCI7XG5cdGNvbnN0IGZyVGVybSA9IFwiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zXCI7XG5cdGNvbnN0IGVudGl0eVR5cGVQYXRoUGFydHMgPSBlbnRpdHlQYXRoLnJlcGxhY2VBbGwoXCIlMkZcIiwgXCIvXCIpLnNwbGl0KFwiL1wiKS5maWx0ZXIoTW9kZWxIZWxwZXIuZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmcpO1xuXHRjb25zdCBlbnRpdHlUeXBlUGF0aCA9IGAvJHtlbnRpdHlUeXBlUGF0aFBhcnRzLmpvaW4oXCIvXCIpfS9gO1xuXHRjb25zdCBlbnRpdHlTZXRQYXRoID0gTW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChlbnRpdHlQYXRoLCBvTWV0YU1vZGVsKTtcblx0Y29uc3QgZW50aXR5U2V0UGF0aFBhcnRzID0gZW50aXR5U2V0UGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKE1vZGVsSGVscGVyLmZpbHRlck91dE5hdlByb3BCaW5kaW5nKTtcblx0Y29uc3QgaXNDb250YWlubWVudCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke2VudGl0eVR5cGVQYXRofSRDb250YWluc1RhcmdldGApO1xuXHRjb25zdCBjb250YWlubWVudE5hdlBhdGggPSBpc0NvbnRhaW5tZW50ICYmIGVudGl0eVR5cGVQYXRoUGFydHNbZW50aXR5VHlwZVBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblxuXHQvL0xFQVNUIFBSSU9SSVRZIC0gRmlsdGVyIHJlc3RyaWN0aW9ucyBkaXJlY3RseSBhdCBFbnRpdHkgU2V0XG5cdC8vZS5nLiBGUiBpbiBcIk5TLkVudGl0eUNvbnRhaW5lci9TYWxlc09yZGVyTWFuYWdlXCIgQ29udGV4dFBhdGg6IC9TYWxlc09yZGVyTWFuYWdlXG5cdGlmICghaXNDb250YWlubWVudCkge1xuXHRcdG9GaWx0ZXJSZXN0cmljdGlvbnMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtlbnRpdHlTZXRQYXRofSR7ZnJUZXJtfWApO1xuXHRcdG9SZXRbRlIuUkVRVUlSRURfUFJPUEVSVElFU10gPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMob0ZpbHRlclJlc3RyaWN0aW9ucywgRlIuUkVRVUlSRURfUFJPUEVSVElFUykgfHwgW107XG5cdFx0Y29uc3QgcmVzdWx0Q29udGV4dENoZWNrID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5VHlwZVBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZXN1bHRDb250ZXh0YCk7XG5cdFx0aWYgKCFyZXN1bHRDb250ZXh0Q2hlY2spIHtcblx0XHRcdG9SZXRbRlIuTk9OX0ZJTFRFUkFCTEVfUFJPUEVSVElFU10gPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMob0ZpbHRlclJlc3RyaWN0aW9ucywgRlIuTk9OX0ZJTFRFUkFCTEVfUFJPUEVSVElFUykgfHwgW107XG5cdFx0fVxuXHRcdC8vU2luZ2xlVmFsdWUgfCBNdWx0aVZhbHVlIHwgU2luZ2xlUmFuZ2UgfCBNdWx0aVJhbmdlIHwgU2VhcmNoRXhwcmVzc2lvbiB8IE11bHRpUmFuZ2VPclNlYXJjaEV4cHJlc3Npb25cblx0XHRvUmV0W0ZSLkFMTE9XRURfRVhQUkVTU0lPTlNdID0gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKG9GaWx0ZXJSZXN0cmljdGlvbnMsIEZSLkFMTE9XRURfRVhQUkVTU0lPTlMpIHx8IHt9O1xuXHR9XG5cblx0aWYgKGVudGl0eVR5cGVQYXRoUGFydHMubGVuZ3RoID4gMSkge1xuXHRcdGNvbnN0IG5hdlBhdGggPSBpc0NvbnRhaW5tZW50ID8gY29udGFpbm1lbnROYXZQYXRoIDogZW50aXR5U2V0UGF0aFBhcnRzW2VudGl0eVNldFBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblx0XHQvLyBJbiBjYXNlIG9mIGNvbnRhaW5tZW50IHdlIHRha2UgZW50aXR5U2V0IHByb3ZpZGVkIGFzIHBhcmVudC4gQW5kIGluIGNhc2Ugb2Ygbm9ybWFsIHdlIHdvdWxkIHJlbW92ZSB0aGUgbGFzdCBuYXZpZ2F0aW9uIGZyb20gZW50aXR5U2V0UGF0aC5cblx0XHRjb25zdCBwYXJlbnRFbnRpdHlTZXRQYXRoID0gaXNDb250YWlubWVudCA/IGVudGl0eVNldFBhdGggOiBgLyR7ZW50aXR5U2V0UGF0aFBhcnRzLnNsaWNlKDAsIC0xKS5qb2luKGAvJHtuYXZpZ2F0aW9uVGV4dH0vYCl9YDtcblx0XHQvL1RISVJEIEhJR0hFU1QgUFJJT1JJVFkgLSBSZWFkaW5nIHByb3BlcnR5IHBhdGggcmVzdHJpY3Rpb25zIC0gQW5ub3RhdGlvbiBhdCBtYWluIGVudGl0eSBidXQgZGlyZWN0bHkgb24gbmF2aWdhdGlvbiBwcm9wZXJ0eSBwYXRoXG5cdFx0Ly9lLmcuIFBhcmVudCBDdXN0b21lciB3aXRoIFByb3BlcnR5UGF0aD1cIlNldC9DaXR5TmFtZVwiIENvbnRleHRQYXRoOiBDdXN0b21lci9TZXRcblx0XHRjb25zdCBvUGFyZW50UmV0OiBhbnkgPSB7fTtcblx0XHRpZiAoIW5hdlBhdGguaW5jbHVkZXMoXCIlMkZcIikpIHtcblx0XHRcdGNvbnN0IG9QYXJlbnRGUiA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3BhcmVudEVudGl0eVNldFBhdGh9JHtmclRlcm19YCk7XG5cdFx0XHRvUmV0W0ZSLlJFUVVJUkVEX1BST1BFUlRJRVNdID0gX2ZldGNoUHJvcGVydGllc0Zvck5hdlBhdGgoXG5cdFx0XHRcdGdldEZpbHRlclJlc3RyaWN0aW9ucyhvUGFyZW50RlIsIEZSLlJFUVVJUkVEX1BST1BFUlRJRVMpIHx8IFtdLFxuXHRcdFx0XHRuYXZQYXRoLFxuXHRcdFx0XHRvUmV0W0ZSLlJFUVVJUkVEX1BST1BFUlRJRVNdIHx8IFtdXG5cdFx0XHQpO1xuXHRcdFx0b1JldFtGUi5OT05fRklMVEVSQUJMRV9QUk9QRVJUSUVTXSA9IF9mZXRjaFByb3BlcnRpZXNGb3JOYXZQYXRoKFxuXHRcdFx0XHRnZXRGaWx0ZXJSZXN0cmljdGlvbnMob1BhcmVudEZSLCBGUi5OT05fRklMVEVSQUJMRV9QUk9QRVJUSUVTKSB8fCBbXSxcblx0XHRcdFx0bmF2UGF0aCxcblx0XHRcdFx0b1JldFtGUi5OT05fRklMVEVSQUJMRV9QUk9QRVJUSUVTXSB8fCBbXVxuXHRcdFx0KTtcblx0XHRcdC8vU2luZ2xlVmFsdWUgfCBNdWx0aVZhbHVlIHwgU2luZ2xlUmFuZ2UgfCBNdWx0aVJhbmdlIHwgU2VhcmNoRXhwcmVzc2lvbiB8IE11bHRpUmFuZ2VPclNlYXJjaEV4cHJlc3Npb25cblx0XHRcdGNvbnN0IGNvbXBsZXRlQWxsb3dlZEV4cHMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMob1BhcmVudEZSLCBGUi5BTExPV0VEX0VYUFJFU1NJT05TKSB8fCB7fTtcblx0XHRcdG9QYXJlbnRSZXRbRlIuQUxMT1dFRF9FWFBSRVNTSU9OU10gPSBPYmplY3Qua2V5cyhjb21wbGV0ZUFsbG93ZWRFeHBzKS5yZWR1Y2UoKG91dFByb3A6IGFueSwgcHJvcFBhdGg6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAocHJvcFBhdGguc3RhcnRzV2l0aChuYXZQYXRoICsgXCIvXCIpKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb3V0UHJvcFBhdGggPSBwcm9wUGF0aC5yZXBsYWNlKG5hdlBhdGggKyBcIi9cIiwgXCJcIik7XG5cdFx0XHRcdFx0b3V0UHJvcFtvdXRQcm9wUGF0aF0gPSBjb21wbGV0ZUFsbG93ZWRFeHBzW3Byb3BQYXRoXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gb3V0UHJvcDtcblx0XHRcdH0sIHt9IGFzIGFueSk7XG5cdFx0fVxuXG5cdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdG9SZXRbRlIuQUxMT1dFRF9FWFBSRVNTSU9OU10gPSBtZXJnZU9iamVjdHMoe30sIG9SZXRbRlIuQUxMT1dFRF9FWFBSRVNTSU9OU10sIG9QYXJlbnRSZXRbRlIuQUxMT1dFRF9FWFBSRVNTSU9OU10gfHwge30pO1xuXG5cdFx0Ly9TRUNPTkQgSElHSEVTVCBwcmlvcml0eSAtIE5hdmlnYXRpb24gcmVzdHJpY3Rpb25zXG5cdFx0Ly9lLmcuIFBhcmVudCBcIi9DdXN0b21lclwiIHdpdGggTmF2aWdhdGlvblByb3BlcnR5UGF0aD1cIlNldFwiIENvbnRleHRQYXRoOiBDdXN0b21lci9TZXRcblx0XHRjb25zdCBvTmF2UmVzdHJpY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0TmF2aWdhdGlvblJlc3RyaWN0aW9ucyhvTWV0YU1vZGVsLCBwYXJlbnRFbnRpdHlTZXRQYXRoLCBuYXZQYXRoLnJlcGxhY2VBbGwoXCIlMkZcIiwgXCIvXCIpKTtcblx0XHRjb25zdCBvTmF2RmlsdGVyUmVzdCA9IG9OYXZSZXN0cmljdGlvbnMgJiYgb05hdlJlc3RyaWN0aW9uc1tcIkZpbHRlclJlc3RyaWN0aW9uc1wiXTtcblx0XHRjb25zdCBuYXZSZXNSZXFQcm9wcyA9IGdldEZpbHRlclJlc3RyaWN0aW9ucyhvTmF2RmlsdGVyUmVzdCwgRlIuUkVRVUlSRURfUFJPUEVSVElFUykgfHwgW107XG5cdFx0b1JldFtGUi5SRVFVSVJFRF9QUk9QRVJUSUVTXSA9IHVuaXF1ZVNvcnQob1JldFtGUi5SRVFVSVJFRF9QUk9QRVJUSUVTXS5jb25jYXQobmF2UmVzUmVxUHJvcHMpKTtcblx0XHRjb25zdCBuYXZOb25GaWx0ZXJQcm9wcyA9IGdldEZpbHRlclJlc3RyaWN0aW9ucyhvTmF2RmlsdGVyUmVzdCwgRlIuTk9OX0ZJTFRFUkFCTEVfUFJPUEVSVElFUykgfHwgW107XG5cdFx0b1JldFtGUi5OT05fRklMVEVSQUJMRV9QUk9QRVJUSUVTXSA9IHVuaXF1ZVNvcnQob1JldFtGUi5OT05fRklMVEVSQUJMRV9QUk9QRVJUSUVTXS5jb25jYXQobmF2Tm9uRmlsdGVyUHJvcHMpKTtcblx0XHQvL1NpbmdsZVZhbHVlIHwgTXVsdGlWYWx1ZSB8IFNpbmdsZVJhbmdlIHwgTXVsdGlSYW5nZSB8IFNlYXJjaEV4cHJlc3Npb24gfCBNdWx0aVJhbmdlT3JTZWFyY2hFeHByZXNzaW9uXG5cdFx0b1JldFtGUi5BTExPV0VEX0VYUFJFU1NJT05TXSA9IG1lcmdlT2JqZWN0cyhcblx0XHRcdHt9LFxuXHRcdFx0b1JldFtGUi5BTExPV0VEX0VYUFJFU1NJT05TXSxcblx0XHRcdGdldEZpbHRlclJlc3RyaWN0aW9ucyhvTmF2RmlsdGVyUmVzdCwgRlIuQUxMT1dFRF9FWFBSRVNTSU9OUykgfHwge31cblx0XHQpO1xuXG5cdFx0Ly9ISUdIRVNUIHByaW9yaXR5IC0gUmVzdHJpY3Rpb25zIGhhdmluZyB0YXJnZXQgd2l0aCBuYXZpZ2F0aW9uIGFzc29jaWF0aW9uIGVudGl0eVxuXHRcdC8vIGUuZy4gRlIgaW4gXCJDdXN0b21lclBhcmFtZXRlcnMvU2V0XCIgQ29udGV4dFBhdGg6IFwiQ3VzdG9tZXIvU2V0XCJcblx0XHRjb25zdCBuYXZBc3NvY2lhdGlvbkVudGl0eVJlc3QgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7ZW50aXR5VHlwZVBhdGhQYXJ0cy5qb2luKFwiL1wiKX0ke2ZyVGVybX1gKTtcblx0XHRjb25zdCBuYXZBc3NvY1JlcVByb3BzID0gZ2V0RmlsdGVyUmVzdHJpY3Rpb25zKG5hdkFzc29jaWF0aW9uRW50aXR5UmVzdCwgRlIuUkVRVUlSRURfUFJPUEVSVElFUykgfHwgW107XG5cdFx0b1JldFtGUi5SRVFVSVJFRF9QUk9QRVJUSUVTXSA9IHVuaXF1ZVNvcnQob1JldFtGUi5SRVFVSVJFRF9QUk9QRVJUSUVTXS5jb25jYXQobmF2QXNzb2NSZXFQcm9wcykpO1xuXHRcdGNvbnN0IG5hdkFzc29jTm9uRmlsdGVyUHJvcHMgPSBnZXRGaWx0ZXJSZXN0cmljdGlvbnMobmF2QXNzb2NpYXRpb25FbnRpdHlSZXN0LCBGUi5OT05fRklMVEVSQUJMRV9QUk9QRVJUSUVTKSB8fCBbXTtcblx0XHRvUmV0W0ZSLk5PTl9GSUxURVJBQkxFX1BST1BFUlRJRVNdID0gdW5pcXVlU29ydChvUmV0W0ZSLk5PTl9GSUxURVJBQkxFX1BST1BFUlRJRVNdLmNvbmNhdChuYXZBc3NvY05vbkZpbHRlclByb3BzKSk7XG5cdFx0Ly9TaW5nbGVWYWx1ZSB8IE11bHRpVmFsdWUgfCBTaW5nbGVSYW5nZSB8IE11bHRpUmFuZ2UgfCBTZWFyY2hFeHByZXNzaW9uIHwgTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblxuXHRcdG9SZXRbRlIuQUxMT1dFRF9FWFBSRVNTSU9OU10gPSBtZXJnZU9iamVjdHMoXG5cdFx0XHR7fSxcblx0XHRcdG9SZXRbRlIuQUxMT1dFRF9FWFBSRVNTSU9OU10sXG5cdFx0XHRnZXRGaWx0ZXJSZXN0cmljdGlvbnMobmF2QXNzb2NpYXRpb25FbnRpdHlSZXN0LCBGUi5BTExPV0VEX0VYUFJFU1NJT05TKSB8fCB7fVxuXHRcdCk7XG5cdH1cblx0cmV0dXJuIG9SZXQ7XG59XG5cbmZ1bmN0aW9uIHRlbXBsYXRlQ29udHJvbEZyYWdtZW50KHNGcmFnbWVudE5hbWU6IGFueSwgb1ByZXByb2Nlc3NvclNldHRpbmdzOiBhbnksIG9PcHRpb25zOiBhbnksIG9Nb2RpZmllcj86IGFueSkge1xuXHRvT3B0aW9ucyA9IG9PcHRpb25zIHx8IHt9O1xuXHRpZiAob01vZGlmaWVyKSB7XG5cdFx0cmV0dXJuIG9Nb2RpZmllci50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChzRnJhZ21lbnROYW1lLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIG9PcHRpb25zLnZpZXcpLnRoZW4oZnVuY3Rpb24gKG9GcmFnbWVudDogYW55KSB7XG5cdFx0XHQvLyBUaGlzIGlzIHJlcXVpcmVkIGFzIEZsZXggcmV0dXJucyBhbiBIVE1MQ29sbGVjdGlvbiBhcyB0ZW1wbGF0aW5nIHJlc3VsdCBpbiBYTUwgdGltZS5cblx0XHRcdHJldHVybiBvTW9kaWZpZXIudGFyZ2V0cyA9PT0gXCJ4bWxUcmVlXCIgJiYgb0ZyYWdtZW50Lmxlbmd0aCA+IDAgPyBvRnJhZ21lbnRbMF0gOiBvRnJhZ21lbnQ7XG5cdFx0fSk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGxvYWRNYWNyb0xpYnJhcnkoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRyZXR1cm4gWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRcdFx0WE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIiksXG5cdFx0XHRcdFx0eyBuYW1lOiBzRnJhZ21lbnROYW1lIH0sXG5cdFx0XHRcdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzXG5cdFx0XHRcdCk7XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9GcmFnbWVudDogYW55KSB7XG5cdFx0XHRcdGNvbnN0IG9Db250cm9sID0gb0ZyYWdtZW50LmZpcnN0RWxlbWVudENoaWxkO1xuXHRcdFx0XHRpZiAoISFvT3B0aW9ucy5pc1hNTCAmJiBvQ29udHJvbCkge1xuXHRcdFx0XHRcdHJldHVybiBvQ29udHJvbDtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gRnJhZ21lbnQubG9hZCh7XG5cdFx0XHRcdFx0aWQ6IG9PcHRpb25zLmlkLFxuXHRcdFx0XHRcdGRlZmluaXRpb246IG9GcmFnbWVudCxcblx0XHRcdFx0XHRjb250cm9sbGVyOiBvT3B0aW9ucy5jb250cm9sbGVyXG5cdFx0XHRcdH0pO1xuXHRcdFx0fSk7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0U2luZ2xldG9uUGF0aChwYXRoOiBzdHJpbmcsIG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRjb25zdCBwYXJ0cyA9IHBhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihCb29sZWFuKSxcblx0XHRwcm9wZXJ0eU5hbWUgPSBwYXJ0cy5wb3AoKSxcblx0XHRuYXZpZ2F0aW9uUGF0aCA9IHBhcnRzLmpvaW4oXCIvXCIpLFxuXHRcdGVudGl0eVNldCA9IG5hdmlnYXRpb25QYXRoICYmIG1ldGFNb2RlbC5nZXRPYmplY3QoYC8ke25hdmlnYXRpb25QYXRofWApO1xuXHRpZiAoZW50aXR5U2V0Py4ka2luZCA9PT0gXCJTaW5nbGV0b25cIikge1xuXHRcdGNvbnN0IHNpbmdsZXRvbk5hbWUgPSBwYXJ0c1twYXJ0cy5sZW5ndGggLSAxXTtcblx0XHRyZXR1cm4gYC8ke3NpbmdsZXRvbk5hbWV9LyR7cHJvcGVydHlOYW1lfWA7XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuZnVuY3Rpb24gcmVxdWVzdFNpbmdsZXRvblByb3BlcnR5KHBhdGg6IHN0cmluZywgbW9kZWw6IE9EYXRhTW9kZWwpIHtcblx0aWYgKCFwYXRoIHx8ICFtb2RlbCkge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG5cdH1cblx0Y29uc3QgbWV0YU1vZGVsID0gbW9kZWwuZ2V0TWV0YU1vZGVsKCk7XG5cdC8vIEZpbmQgdGhlIHVuZGVybHlpbmcgZW50aXR5IHNldCBmcm9tIHRoZSBwcm9wZXJ0eSBwYXRoIGFuZCBjaGVjayB3aGV0aGVyIGl0IGlzIGEgc2luZ2xldG9uLlxuXHRjb25zdCByZXNvbHZlZFBhdGggPSBnZXRTaW5nbGV0b25QYXRoKHBhdGgsIG1ldGFNb2RlbCk7XG5cdGlmIChyZXNvbHZlZFBhdGgpIHtcblx0XHRjb25zdCBwcm9wZXJ0eUJpbmRpbmcgPSBtb2RlbC5iaW5kUHJvcGVydHkocmVzb2x2ZWRQYXRoKTtcblx0XHRyZXR1cm4gcHJvcGVydHlCaW5kaW5nLnJlcXVlc3RWYWx1ZSgpO1xuXHR9XG5cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcbn1cblxuZnVuY3Rpb24gYWRkRXZlbnRUb0JpbmRpbmdJbmZvKG9Db250cm9sOiBDb250cm9sLCBzRXZlbnROYW1lOiBzdHJpbmcsIGZIYW5kbGVyOiBGdW5jdGlvbikge1xuXHRsZXQgb0JpbmRpbmdJbmZvOiBhbnk7XG5cdGNvbnN0IHNldEJpbmRpbmdJbmZvID0gZnVuY3Rpb24gKCkge1xuXHRcdGlmIChvQmluZGluZ0luZm8pIHtcblx0XHRcdGlmICghb0JpbmRpbmdJbmZvLmV2ZW50cykge1xuXHRcdFx0XHRvQmluZGluZ0luZm8uZXZlbnRzID0ge307XG5cdFx0XHR9XG5cdFx0XHRpZiAoIW9CaW5kaW5nSW5mby5ldmVudHNbc0V2ZW50TmFtZV0pIHtcblx0XHRcdFx0b0JpbmRpbmdJbmZvLmV2ZW50c1tzRXZlbnROYW1lXSA9IGZIYW5kbGVyO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgZk9yaWdpbmFsSGFuZGxlciA9IG9CaW5kaW5nSW5mby5ldmVudHNbc0V2ZW50TmFtZV07XG5cdFx0XHRcdG9CaW5kaW5nSW5mby5ldmVudHNbc0V2ZW50TmFtZV0gPSBmdW5jdGlvbiAoLi4uYXJnczogYW55W10pIHtcblx0XHRcdFx0XHRmSGFuZGxlci5hcHBseSh0aGlzLCAuLi5hcmdzKTtcblx0XHRcdFx0XHRmT3JpZ2luYWxIYW5kbGVyLmFwcGx5KHRoaXMsIC4uLmFyZ3MpO1xuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0aWYgKG9Db250cm9sLmlzQShcInNhcC51aS5tZGMuQ2hhcnRcIikpIHtcblx0XHQob0NvbnRyb2wgYXMgYW55KVxuXHRcdFx0LmlubmVyQ2hhcnRCb3VuZCgpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdG9CaW5kaW5nSW5mbyA9IChvQ29udHJvbCBhcyBhbnkpLmdldENvbnRyb2xEZWxlZ2F0ZSgpLl9nZXRDaGFydChvQ29udHJvbCkuZ2V0QmluZGluZ0luZm8oXCJkYXRhXCIpO1xuXHRcdFx0XHRzZXRCaW5kaW5nSW5mbygpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAoc0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0TG9nLmVycm9yKHNFcnJvcik7XG5cdFx0XHR9KTtcblx0fSBlbHNlIHtcblx0XHRvQmluZGluZ0luZm8gPSBvQ29udHJvbC5kYXRhKFwicm93c0JpbmRpbmdJbmZvXCIpO1xuXHRcdHNldEJpbmRpbmdJbmZvKCk7XG5cdH1cbn1cblxuZnVuY3Rpb24gbG9hZE1hY3JvTGlicmFyeSgpIHtcblx0cmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KGZ1bmN0aW9uIChyZXNvbHZlKSB7XG5cdFx0c2FwLnVpLnJlcXVpcmUoW1wic2FwL2ZlL21hY3Jvcy9tYWNyb0xpYnJhcnlcIl0sIGZ1bmN0aW9uICgvKm1hY3JvTGlicmFyeSovKSB7XG5cdFx0XHRyZXNvbHZlKCk7XG5cdFx0fSk7XG5cdH0pO1xufVxuXG4vLyBHZXQgdGhlIHBhdGggZm9yIGFjdGlvbiBwYXJhbWV0ZXJzIHRoYXQgaXMgbmVlZGVkIHRvIHJlYWQgdGhlIGFubm90YXRpb25zXG5mdW5jdGlvbiBnZXRQYXJhbWV0ZXJQYXRoKHNQYXRoOiBhbnksIHNQYXJhbWV0ZXI6IGFueSkge1xuXHRsZXQgc0NvbnRleHQ7XG5cdGlmIChzUGF0aC5pbmRleE9mKFwiQCR1aTUub3ZlcmxvYWRcIikgPiAtMSkge1xuXHRcdHNDb250ZXh0ID0gc1BhdGguc3BsaXQoXCJAJHVpNS5vdmVybG9hZFwiKVswXTtcblx0fSBlbHNlIHtcblx0XHQvLyBGb3IgVW5ib3VuZCBBY3Rpb25zIGluIEFjdGlvbiBQYXJhbWV0ZXIgRGlhbG9nc1xuXHRcdGNvbnN0IGFBY3Rpb24gPSBzUGF0aC5zcGxpdChcIi8wXCIpWzBdLnNwbGl0KFwiLlwiKTtcblx0XHRzQ29udGV4dCA9IGAvJHthQWN0aW9uW2FBY3Rpb24ubGVuZ3RoIC0gMV19L2A7XG5cdH1cblx0cmV0dXJuIHNDb250ZXh0ICsgc1BhcmFtZXRlcjtcbn1cblxuLyoqXG4gKiBHZXQgcmVzb2x2ZWQgZXhwcmVzc2lvbiBiaW5kaW5nIHVzZWQgZm9yIHRleHRzIGF0IHJ1bnRpbWUuXG4gKlxuICogQHBhcmFtIGV4cEJpbmRpbmdcbiAqIEBwYXJhbSBjb250cm9sXG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5Db21tb25VdGlsc1xuICogQHJldHVybnMgQSBzdHJpbmcgYWZ0ZXIgcmVzb2x1dGlvbi5cbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5mdW5jdGlvbiBfZm50cmFuc2xhdGVkVGV4dEZyb21FeHBCaW5kaW5nU3RyaW5nKGV4cEJpbmRpbmc6IHN0cmluZywgY29udHJvbDogQ29udHJvbCkge1xuXHQvLyBUaGUgaWRlYSBoZXJlIGlzIHRvIGNyZWF0ZSBkdW1teSBlbGVtZW50IHdpdGggdGhlIGV4cHJlc2lvbiBiaW5kaW5nLlxuXHQvLyBBZGRpbmcgaXQgYXMgZGVwZW5kZW50IHRvIHRoZSB2aWV3L2NvbnRyb2wgd291bGQgcHJvcGFnYXRlIGFsbCB0aGUgbW9kZWxzIHRvIHRoZSBkdW1teSBlbGVtZW50IGFuZCByZXNvbHZlIHRoZSBiaW5kaW5nLlxuXHQvLyBXZSByZW1vdmUgdGhlIGR1bW15IGVsZW1lbnQgYWZ0ZXIgdGhhdCBhbmQgZGVzdHJveSBpdC5cblxuXHRjb25zdCBhbnlSZXNvdXJjZVRleHQgPSBuZXcgQW55RWxlbWVudCh7IGFueVRleHQ6IGV4cEJpbmRpbmcgfSk7XG5cdGNvbnRyb2wuYWRkRGVwZW5kZW50KGFueVJlc291cmNlVGV4dCk7XG5cdGNvbnN0IHJlc3VsdFRleHQgPSBhbnlSZXNvdXJjZVRleHQuZ2V0QW55VGV4dCgpO1xuXHRjb250cm9sLnJlbW92ZURlcGVuZGVudChhbnlSZXNvdXJjZVRleHQpO1xuXHRhbnlSZXNvdXJjZVRleHQuZGVzdHJveSgpO1xuXG5cdHJldHVybiByZXN1bHRUZXh0O1xufVxuXG5jb25zdCBDb21tb25VdGlscyA9IHtcblx0aXNQcm9wZXJ0eUZpbHRlcmFibGU6IGlzUHJvcGVydHlGaWx0ZXJhYmxlLFxuXHRpc0ZpZWxkQ29udHJvbFBhdGhJbmFwcGxpY2FibGU6IGlzRmllbGRDb250cm9sUGF0aEluYXBwbGljYWJsZSxcblx0cmVtb3ZlU2Vuc2l0aXZlRGF0YTogcmVtb3ZlU2Vuc2l0aXZlRGF0YSxcblx0ZmlyZUJ1dHRvblByZXNzOiBmbkZpcmVCdXR0b25QcmVzcyxcblx0Z2V0VGFyZ2V0VmlldzogZ2V0VGFyZ2V0Vmlldyxcblx0Z2V0Q3VycmVudFBhZ2VWaWV3OiBnZXRDdXJyZW50UGFnZVZpZXcsXG5cdGhhc1RyYW5zaWVudENvbnRleHQ6IGZuSGFzVHJhbnNpZW50Q29udGV4dHMsXG5cdHVwZGF0ZVJlbGF0ZWRBcHBzRGV0YWlsczogZm5VcGRhdGVSZWxhdGVkQXBwc0RldGFpbHMsXG5cdHJlc29sdmVTdHJpbmd0b0Jvb2xlYW46IGZuUmVzb2x2ZVN0cmluZ3RvQm9vbGVhbixcblx0Z2V0QXBwQ29tcG9uZW50OiBnZXRBcHBDb21wb25lbnQsXG5cdGdldE1hbmRhdG9yeUZpbHRlckZpZWxkczogZm5HZXRNYW5kYXRvcnlGaWx0ZXJGaWVsZHMsXG5cdGdldENvbnRleHRQYXRoUHJvcGVydGllczogZm5HZXRDb250ZXh0UGF0aFByb3BlcnRpZXMsXG5cdGdldFBhcmFtZXRlckluZm86IGdldFBhcmFtZXRlckluZm8sXG5cdHVwZGF0ZURhdGFGaWVsZEZvcklCTkJ1dHRvbnNWaXNpYmlsaXR5OiBmblVwZGF0ZURhdGFGaWVsZEZvcklCTkJ1dHRvbnNWaXNpYmlsaXR5LFxuXHRnZXRUcmFuc2xhdGVkVGV4dDogZ2V0VHJhbnNsYXRlZFRleHQsXG5cdGdldEVudGl0eVNldE5hbWU6IGdldEVudGl0eVNldE5hbWUsXG5cdGdldEFjdGlvblBhdGg6IGdldEFjdGlvblBhdGgsXG5cdGNvbXB1dGVEaXNwbGF5TW9kZTogY29tcHV0ZURpc3BsYXlNb2RlLFxuXHRpc1N0aWNreUVkaXRNb2RlOiBpc1N0aWNreUVkaXRNb2RlLFxuXHRnZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eTogZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHksXG5cdGdldE9wZXJhdG9yc0ZvckRhdGVQcm9wZXJ0eTogZ2V0T3BlcmF0b3JzRm9yRGF0ZVByb3BlcnR5LFxuXHRnZXRPcGVyYXRvcnNGb3JHdWlkUHJvcGVydHk6IGdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eSxcblx0YWRkU2VsZWN0aW9uVmFyaWFudFRvQ29uZGl0aW9uczogYWRkU2VsZWN0aW9uVmFyaWFudFRvQ29uZGl0aW9ucyxcblx0YWRkRXh0ZXJuYWxTdGF0ZUZpbHRlcnNUb1NlbGVjdGlvblZhcmlhbnQ6IGFkZEV4dGVybmFsU3RhdGVGaWx0ZXJzVG9TZWxlY3Rpb25WYXJpYW50LFxuXHRhZGRQYWdlQ29udGV4dFRvU2VsZWN0aW9uVmFyaWFudDogYWRkUGFnZUNvbnRleHRUb1NlbGVjdGlvblZhcmlhbnQsXG5cdGFkZERlZmF1bHREaXNwbGF5Q3VycmVuY3k6IGFkZERlZmF1bHREaXNwbGF5Q3VycmVuY3ksXG5cdGdldE5vbkNvbXB1dGVkVmlzaWJsZUZpZWxkczogZ2V0Tm9uQ29tcHV0ZWRWaXNpYmxlRmllbGRzLFxuXHRzZXRVc2VyRGVmYXVsdHM6IHNldFVzZXJEZWZhdWx0cyxcblx0Z2V0U2hlbGxTZXJ2aWNlczogZ2V0U2hlbGxTZXJ2aWNlcyxcblx0Z2V0SGFzaDogZ2V0SGFzaCxcblx0Z2V0SUJOQWN0aW9uczogZm5HZXRJQk5BY3Rpb25zLFxuXHRnZXRIZWFkZXJGYWNldEl0ZW1Db25maWdGb3JFeHRlcm5hbE5hdmlnYXRpb246IGdldEhlYWRlckZhY2V0SXRlbUNvbmZpZ0ZvckV4dGVybmFsTmF2aWdhdGlvbixcblx0Z2V0U2VtYW50aWNPYmplY3RNYXBwaW5nOiBnZXRTZW1hbnRpY09iamVjdE1hcHBpbmcsXG5cdHNldFNlbWFudGljT2JqZWN0TWFwcGluZ3M6IHNldFNlbWFudGljT2JqZWN0TWFwcGluZ3MsXG5cdGdldFNlbWFudGljT2JqZWN0UHJvbWlzZTogZm5HZXRTZW1hbnRpY09iamVjdFByb21pc2UsXG5cdGdldFNlbWFudGljVGFyZ2V0c0Zyb21QYWdlTW9kZWw6IGZuR2V0U2VtYW50aWNUYXJnZXRzRnJvbVBhZ2VNb2RlbCxcblx0Z2V0U2VtYW50aWNPYmplY3RzRnJvbVBhdGg6IGZuR2V0U2VtYW50aWNPYmplY3RzRnJvbVBhdGgsXG5cdHVwZGF0ZVNlbWFudGljVGFyZ2V0czogZm5VcGRhdGVTZW1hbnRpY1RhcmdldHNNb2RlbCxcblx0Z2V0UHJvcGVydHlEYXRhVHlwZTogZ2V0UHJvcGVydHlEYXRhVHlwZSxcblx0Z2V0TmF2aWdhdGlvblJlc3RyaWN0aW9uczogZ2V0TmF2aWdhdGlvblJlc3RyaWN0aW9ucyxcblx0Z2V0U2VhcmNoUmVzdHJpY3Rpb25zOiBnZXRTZWFyY2hSZXN0cmljdGlvbnMsXG5cdGdldEZpbHRlclJlc3RyaWN0aW9uc0J5UGF0aDogZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoLFxuXHRnZXRTcGVjaWZpY0FsbG93ZWRFeHByZXNzaW9uOiBnZXRTcGVjaWZpY0FsbG93ZWRFeHByZXNzaW9uLFxuXHRnZXRBZGRpdGlvbmFsUGFyYW1zRm9yQ3JlYXRlOiBnZXRBZGRpdGlvbmFsUGFyYW1zRm9yQ3JlYXRlLFxuXHRyZXF1ZXN0U2luZ2xldG9uUHJvcGVydHk6IHJlcXVlc3RTaW5nbGV0b25Qcm9wZXJ0eSxcblx0dGVtcGxhdGVDb250cm9sRnJhZ21lbnQ6IHRlbXBsYXRlQ29udHJvbEZyYWdtZW50LFxuXHRhZGRFdmVudFRvQmluZGluZ0luZm86IGFkZEV2ZW50VG9CaW5kaW5nSW5mbyxcblx0RmlsdGVyUmVzdHJpY3Rpb25zOiB7XG5cdFx0UkVRVUlSRURfUFJPUEVSVElFUzogXCJSZXF1aXJlZFByb3BlcnRpZXNcIixcblx0XHROT05fRklMVEVSQUJMRV9QUk9QRVJUSUVTOiBcIk5vbkZpbHRlcmFibGVQcm9wZXJ0aWVzXCIsXG5cdFx0QUxMT1dFRF9FWFBSRVNTSU9OUzogXCJGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnNcIlxuXHR9LFxuXHRBbGxvd2VkRXhwcmVzc2lvbnNQcmlvOiBbXCJTaW5nbGVWYWx1ZVwiLCBcIk11bHRpVmFsdWVcIiwgXCJTaW5nbGVSYW5nZVwiLCBcIk11bHRpUmFuZ2VcIiwgXCJTZWFyY2hFeHByZXNzaW9uXCIsIFwiTXVsdGlSYW5nZU9yU2VhcmNoRXhwcmVzc2lvblwiXSxcblx0bm9ybWFsaXplU2VhcmNoVGVybTogbm9ybWFsaXplU2VhcmNoVGVybSxcblx0Z2V0U2luZ2xldG9uUGF0aDogZ2V0U2luZ2xldG9uUGF0aCxcblx0Z2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbVVwZGF0ZVJlc3RyaWN0aW9uczogZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbVVwZGF0ZVJlc3RyaWN0aW9ucyxcblx0Z2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9uczogZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyxcblx0aGFzUmVzdHJpY3RlZFByb3BlcnRpZXNJbkFubm90YXRpb25zOiBoYXNSZXN0cmljdGVkUHJvcGVydGllc0luQW5ub3RhdGlvbnMsXG5cdGdldFJlcXVpcmVkUHJvcGVydGllc0Zyb21Bbm5vdGF0aW9uczogZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUFubm90YXRpb25zLFxuXHRnZXRSZXF1aXJlZFByb3BlcnRpZXM6IGdldFJlcXVpcmVkUHJvcGVydGllcyxcblx0Y2hlY2tJZlJlc291cmNlS2V5RXhpc3RzOiBjaGVja0lmUmVzb3VyY2VLZXlFeGlzdHMsXG5cdHNldENvbnRleHRzQmFzZWRPbk9wZXJhdGlvbkF2YWlsYWJsZTogc2V0Q29udGV4dHNCYXNlZE9uT3BlcmF0aW9uQXZhaWxhYmxlLFxuXHRzZXREeW5hbWljQWN0aW9uQ29udGV4dHM6IHNldER5bmFtaWNBY3Rpb25Db250ZXh0cyxcblx0cmVxdWVzdFByb3BlcnR5OiByZXF1ZXN0UHJvcGVydHksXG5cdGdldFBhcmFtZXRlclBhdGg6IGdldFBhcmFtZXRlclBhdGgsXG5cdGdldFJlbGF0ZWRBcHBzTWVudUl0ZW1zOiBfZ2V0UmVsYXRlZEFwcHNNZW51SXRlbXMsXG5cdGdldFRyYW5zbGF0ZWRUZXh0RnJvbUV4cEJpbmRpbmdTdHJpbmc6IF9mbnRyYW5zbGF0ZWRUZXh0RnJvbUV4cEJpbmRpbmdTdHJpbmcsXG5cdGFkZFNlbWFudGljRGF0ZXNUb0NvbmRpdGlvbnM6IGFkZFNlbWFudGljRGF0ZXNUb0NvbmRpdGlvbnMsXG5cdGFkZFNlbGVjdE9wdGlvblRvQ29uZGl0aW9uczogYWRkU2VsZWN0T3B0aW9uVG9Db25kaXRpb25zLFxuXHRjcmVhdGVTZW1hbnRpY0RhdGVzRnJvbUNvbmRpdGlvbnM6IGNyZWF0ZVNlbWFudGljRGF0ZXNGcm9tQ29uZGl0aW9ucyxcblx0dXBkYXRlUmVsYXRlQXBwc01vZGVsOiB1cGRhdGVSZWxhdGVBcHBzTW9kZWwsXG5cdGdldFNlbWFudGljT2JqZWN0QW5ub3RhdGlvbnM6IF9nZXRTZW1hbnRpY09iamVjdEFubm90YXRpb25zXG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb21tb25VdGlscztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQWtqQk8sZ0JBQWdCQSxJQUFJLEVBQUVDLE9BQU8sRUFBRTtJQUNyQyxJQUFJO01BQ0gsSUFBSUMsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU1HLENBQUMsRUFBRTtNQUNWLE9BQU9GLE9BQU8sQ0FBQ0UsQ0FBQyxDQUFDO0lBQ2xCO0lBQ0EsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLElBQUksRUFBRTtNQUMxQixPQUFPRixNQUFNLENBQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRUgsT0FBTyxDQUFDO0lBQ3BDO0lBQ0EsT0FBT0MsTUFBTTtFQUNkO0VBMWNPLGdCQUFnQkcsS0FBSyxFQUFFTCxJQUFJLEVBQUVNLEtBQUssRUFBRTtJQUMxQyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO01BQUVDLElBQUk7TUFBRUMsTUFBTTtJQUN4QixTQUFTQyxNQUFNLENBQUNSLE1BQU0sRUFBRTtNQUN2QixJQUFJO1FBQ0gsT0FBTyxFQUFFSyxDQUFDLEdBQUdGLEtBQUssQ0FBQ00sTUFBTSxLQUFLLENBQUNMLEtBQUssSUFBSSxDQUFDQSxLQUFLLEVBQUUsQ0FBQyxFQUFFO1VBQ2xESixNQUFNLEdBQUdGLElBQUksQ0FBQ08sQ0FBQyxDQUFDO1VBQ2hCLElBQUlMLE1BQU0sSUFBSUEsTUFBTSxDQUFDRSxJQUFJLEVBQUU7WUFDMUIsSUFBSSxlQUFlRixNQUFNLENBQUMsRUFBRTtjQUMzQkEsTUFBTSxHQUFHQSxNQUFNLENBQUNVLENBQUM7WUFDbEIsQ0FBQyxNQUFNO2NBQ05WLE1BQU0sQ0FBQ0UsSUFBSSxDQUFDTSxNQUFN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