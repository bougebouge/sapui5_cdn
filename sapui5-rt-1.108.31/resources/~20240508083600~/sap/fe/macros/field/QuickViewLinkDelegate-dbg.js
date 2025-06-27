/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/deepEqual", "sap/base/util/isPlainObject", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ToES6Promise", "sap/fe/core/templating/SemanticObjectHelper", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/field/FieldRuntime", "sap/fe/navigation/SelectionVariant", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/link/Factory", "sap/ui/mdc/link/LinkItem", "sap/ui/mdc/link/SemanticObjectMapping", "sap/ui/mdc/link/SemanticObjectMappingItem", "sap/ui/mdc/link/SemanticObjectUnavailableAction", "sap/ui/mdc/LinkDelegate", "sap/ui/model/json/JSONModel"], function (Log, deepClone, deepEqual, isPlainObject, CommonUtils, KeepAliveHelper, toES6Promise, SemanticObjectHelper, FieldHelper, FieldRuntime, SelectionVariant, Core, Fragment, XMLPreprocessor, XMLTemplateProcessor, Factory, LinkItem, SemanticObjectMapping, SemanticObjectMappingItem, SemanticObjectUnavailableAction, LinkDelegate, JSONModel) {
  "use strict";

  var getDynamicPathFromSemanticObject = SemanticObjectHelper.getDynamicPathFromSemanticObject;
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
          var value = _this.v;
          if (_this.s & 1) {
            _settle(result, 1, onFulfilled ? onFulfilled(value) : value);
          } else if (onRejected) {
            _settle(result, 1, onRejected(value));
          } else {
            _settle(result, 2, value);
          }
        } catch (e) {
          _settle(result, 2, e);
        }
      };
      return result;
    };
    return _Pact;
  }();
  function _isSettledPact(thenable) {
    return thenable instanceof _Pact && thenable.s & 1;
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
  function _forIn(target, body, check) {
    var keys = [];
    for (var key in target) {
      keys.push(key);
    }
    return _forTo(keys, function (i) {
      return body(keys[i]);
    }, check);
  }
  var SimpleLinkDelegate = Object.assign({}, LinkDelegate);
  var CONSTANTS = {
    iLinksShownInPopup: 3,
    sapmLink: "sap.m.Link",
    sapuimdcLink: "sap.ui.mdc.Link",
    sapuimdclinkLinkItem: "sap.ui.mdc.link.LinkItem",
    sapmObjectIdentifier: "sap.m.ObjectIdentifier",
    sapmObjectStatus: "sap.m.ObjectStatus"
  };
  SimpleLinkDelegate.getConstants = function () {
    return CONSTANTS;
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns The context pointing to the current EntityType.
   */
  SimpleLinkDelegate._getEntityType = function (oPayload, oMetaModel) {
    if (oMetaModel) {
      return oMetaModel.createBindingContext(oPayload.entityType);
    } else {
      return undefined;
    }
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns A model containing the payload information
   */
  SimpleLinkDelegate._getSemanticsModel = function (oPayload, oMetaModel) {
    if (oMetaModel) {
      return new JSONModel(oPayload);
    } else {
      return undefined;
    }
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns An array containing SemanticObjects based of the payload
   */
  SimpleLinkDelegate._getDataField = function (oPayload, oMetaModel) {
    return oMetaModel.createBindingContext(oPayload.dataField);
  };
  /**
   * This will return an array of the SemanticObjects as strings given by the payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @param oMetaModel The ODataMetaModel received from the Link
   * @returns Ancontaining SemanticObjects based of the payload
   */
  SimpleLinkDelegate._getContact = function (oPayload, oMetaModel) {
    return oMetaModel.createBindingContext(oPayload.contact);
  };
  SimpleLinkDelegate.fnTemplateFragment = function () {
    var _this2 = this;
    var sFragmentName, titleLinkHref;
    var oFragmentModel = {};
    var oPayloadToUse;

    // payload has been modified by fetching Semantic Objects names with path
    if (this.resolvedpayload) {
      oPayloadToUse = this.resolvedpayload;
    } else {
      oPayloadToUse = this.payload;
    }
    if (oPayloadToUse && !oPayloadToUse.LinkId) {
      oPayloadToUse.LinkId = this.oControl && this.oControl.isA(CONSTANTS.sapuimdcLink) ? this.oControl.getId() : undefined;
    }
    if (oPayloadToUse.LinkId) {
      titleLinkHref = this.oControl.getModel("$sapuimdcLink").getProperty("/titleLinkHref");
      oPayloadToUse.titlelink = titleLinkHref;
    }
    var oSemanticsModel = this._getSemanticsModel(oPayloadToUse, this.oMetaModel);
    this.semanticModel = oSemanticsModel;
    if (oPayloadToUse.entityType && this._getEntityType(oPayloadToUse, this.oMetaModel)) {
      sFragmentName = "sap.fe.macros.field.QuickViewLinkForEntity";
      oFragmentModel.bindingContexts = {
        entityType: this._getEntityType(oPayloadToUse, this.oMetaModel),
        semantic: oSemanticsModel.createBindingContext("/")
      };
      oFragmentModel.models = {
        entityType: this.oMetaModel,
        semantic: oSemanticsModel
      };
    } else if (oPayloadToUse.dataField && this._getDataField(oPayloadToUse, this.oMetaModel)) {
      sFragmentName = "sap.fe.macros.field.QuickViewLinkForDataField";
      oFragmentModel.bindingContexts = {
        dataField: this._getDataField(oPayloadToUse, this.oMetaModel),
        semantic: oSemanticsModel.createBindingContext("/")
      };
      oFragmentModel.models = {
        dataField: this.oMetaModel,
        semantic: oSemanticsModel
      };
    } else if (oPayloadToUse.contact && this._getContact(oPayloadToUse, this.oMetaModel)) {
      sFragmentName = "sap.fe.macros.field.QuickViewLinkForContact";
      oFragmentModel.bindingContexts = {
        contact: this._getContact(oPayloadToUse, this.oMetaModel)
      };
      oFragmentModel.models = {
        contact: this.oMetaModel
      };
    }
    oFragmentModel.models.entitySet = this.oMetaModel;
    oFragmentModel.models.metaModel = this.oMetaModel;
    if (this.oControl && this.oControl.getModel("viewData")) {
      oFragmentModel.models.viewData = this.oControl.getModel("viewData");
      oFragmentModel.bindingContexts.viewData = this.oControl.getModel("viewData").createBindingContext("/");
    }
    var oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
    return Promise.resolve(XMLPreprocessor.process(oFragment, {
      name: sFragmentName
    }, oFragmentModel)).then(function (_internalFragment) {
      return Fragment.load({
        definition: _internalFragment,
        controller: _this2
      });
    }).then(function (oPopoverContent) {
      if (oPopoverContent) {
        if (oFragmentModel.models && oFragmentModel.models.semantic) {
          oPopoverContent.setModel(oFragmentModel.models.semantic, "semantic");
          oPopoverContent.setBindingContext(oFragmentModel.bindingContexts.semantic, "semantic");
        }
        if (oFragmentModel.bindingContexts && oFragmentModel.bindingContexts.entityType) {
          oPopoverContent.setModel(oFragmentModel.models.entityType, "entityType");
          oPopoverContent.setBindingContext(oFragmentModel.bindingContexts.entityType, "entityType");
        }
      }
      _this2.resolvedpayload = undefined;
      return oPopoverContent;
    });
  };
  SimpleLinkDelegate.fetchAdditionalContent = function (oPayLoad, oMdcLinkControl) {
    var _oPayLoad$navigationP;
    this.oControl = oMdcLinkControl;
    var aNavigateRegexpMatch = oPayLoad === null || oPayLoad === void 0 ? void 0 : (_oPayLoad$navigationP = oPayLoad.navigationPath) === null || _oPayLoad$navigationP === void 0 ? void 0 : _oPayLoad$navigationP.match(/{(.*?)}/);
    var oBindingContext = aNavigateRegexpMatch && aNavigateRegexpMatch.length > 1 && aNavigateRegexpMatch[1] ? oMdcLinkControl.getModel().bindContext(aNavigateRegexpMatch[1], oMdcLinkControl.getBindingContext(), {
      $$ownRequest: true
    }) : null;
    this.payload = oPayLoad;
    if (oMdcLinkControl && oMdcLinkControl.isA(CONSTANTS.sapuimdcLink)) {
      this.oMetaModel = oMdcLinkControl.getModel().getMetaModel();
      return this.fnTemplateFragment().then(function (oPopoverContent) {
        if (oBindingContext) {
          oPopoverContent.setBindingContext(oBindingContext.getBoundContext());
        }
        return [oPopoverContent];
      });
    }
    return Promise.resolve([]);
  };
  SimpleLinkDelegate._fetchLinkCustomData = function (_oLink) {
    if (_oLink.getParent() && _oLink.isA(CONSTANTS.sapuimdcLink) && (_oLink.getParent().isA(CONSTANTS.sapmLink) || _oLink.getParent().isA(CONSTANTS.sapmObjectIdentifier) || _oLink.getParent().isA(CONSTANTS.sapmObjectStatus))) {
      return _oLink.getCustomData();
    } else {
      return undefined;
    }
  };
  /**
   * Fetches the relevant {@link sap.ui.mdc.link.LinkItem} for the Link and returns them.
   *
   * @public
   * @param oPayload The Payload of the Link given by the application
   * @param oBindingContext The ContextObject of the Link
   * @param oInfoLog The InfoLog of the Link
   * @returns Once resolved an array of {@link sap.ui.mdc.link.LinkItem} is returned
   */
  SimpleLinkDelegate.fetchLinkItems = function (oPayload, oBindingContext, oInfoLog) {
    if (oBindingContext && SimpleLinkDelegate._getSemanticObjects(oPayload)) {
      var oContextObject = oBindingContext.getObject();
      if (oInfoLog) {
        oInfoLog.initialize(SimpleLinkDelegate._getSemanticObjects(oPayload));
      }
      var _oLinkCustomData = this._link && this._fetchLinkCustomData(this._link);
      this.aLinkCustomData = _oLinkCustomData && this._fetchLinkCustomData(this._link).map(function (linkItem) {
        return linkItem.mProperties.value;
      });
      var oSemanticAttributesResolved = SimpleLinkDelegate._calculateSemanticAttributes(oContextObject, oPayload, oInfoLog, this._link);
      var oSemanticAttributes = oSemanticAttributesResolved.results;
      var oPayloadResolved = oSemanticAttributesResolved.payload;
      return SimpleLinkDelegate._retrieveNavigationTargets("", oSemanticAttributes, oPayloadResolved, oInfoLog, this._link).then(function (aLinks) {
        return aLinks.length === 0 ? null : aLinks;
      });
    } else {
      return Promise.resolve(null);
    }
  };

  /**
   * Find the type of the link.
   *
   * @param payload The payload of the mdc link.
   * @param aLinkItems Links returned by call to mdc _retrieveUnmodifiedLinkItems.
   * @returns The type of the link as defined by mdc.
   */
  SimpleLinkDelegate._findLinkType = function (payload, aLinkItems) {
    var nLinkType, oLinkItem;
    if ((aLinkItems === null || aLinkItems === void 0 ? void 0 : aLinkItems.length) === 1) {
      oLinkItem = new LinkItem({
        text: aLinkItems[0].getText(),
        href: aLinkItems[0].getHref()
      });
      nLinkType = payload.hasQuickViewFacets === "false" ? 1 : 2;
    } else if (payload.hasQuickViewFacets === "false" && (aLinkItems === null || aLinkItems === void 0 ? void 0 : aLinkItems.length) === 0) {
      nLinkType = 0;
    } else {
      nLinkType = 2;
    }
    return {
      linkType: nLinkType,
      linkItem: oLinkItem
    };
  };
  SimpleLinkDelegate.fetchLinkType = function (oPayload, oLink) {
    try {
      var _exit2 = false;
      var _this4 = this;
      var _oCurrentLink = oLink;
      var _oPayload = Object.assign({}, oPayload);
      var oDefaultInitialType = {
        initialType: {
          type: 2,
          directLink: undefined
        },
        runtimeType: undefined
      };
      // clean appStateKeyMap storage
      if (!_this4.appStateKeyMap) {
        _this4.appStateKeyMap = {};
      }
      return Promise.resolve(_catch(function () {
        function _temp4(_result) {
          if (_exit2) return _result;
          throw new Error("no payload or semanticObjects found");
        }
        var _temp3 = function () {
          var _oPayload$contact;
          if (_oPayload !== null && _oPayload !== void 0 && _oPayload.semanticObjects) {
            _this4._link = oLink;
            return Promise.resolve(_oCurrentLink._retrieveUnmodifiedLinkItems()).then(function (aLinkItems) {
              function _temp2() {
                var _LinkType = SimpleLinkDelegate._findLinkType(_oPayload, aLinkItems);
                var _initialType$runtimeT = {
                  initialType: {
                    type: _LinkType.linkType,
                    directLink: _LinkType.linkItem ? _LinkType.linkItem : undefined
                  },
                  runtimeType: undefined
                };
                _exit2 = true;
                return _initialType$runtimeT;
              }
              var _temp = function () {
                if (aLinkItems.length === 1) {
                  // This is the direct navigation use case so we need to perform the appropriate checks / transformations
                  return Promise.resolve(_oCurrentLink.retrieveLinkItems()).then(function (_oCurrentLink$retriev) {
                    aLinkItems = _oCurrentLink$retriev;
                  });
                }
              }();
              return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
            });
          } else if ((_oPayload === null || _oPayload === void 0 ? void 0 : (_oPayload$contact = _oPayload.contact) === null || _oPayload$contact === void 0 ? void 0 : _oPayload$contact.length) > 0) {
            _exit2 = true;
            return oDefaultInitialType;
          } else if (_oPayload !== null && _oPayload !== void 0 && _oPayload.entityType && _oPayload !== null && _oPayload !== void 0 && _oPayload.navigationPath) {
            _exit2 = true;
            return oDefaultInitialType;
          }
        }();
        return _temp3 && _temp3.then ? _temp3.then(_temp4) : _temp4(_temp3);
      }, function (oError) {
        Log.error("Error in SimpleLinkDelegate.fetchLinkType: ", oError);
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  SimpleLinkDelegate._RemoveTitleLinkFromTargets = function (_aLinkItems, _bTitleHasLink, _aTitleLink) {
    var _sTitleLinkHref, _oMDCLink;
    var bResult = false;
    if (_bTitleHasLink && _aTitleLink && _aTitleLink[0]) {
      var linkIsPrimaryAction, _sLinkIntentWithoutParameters;
      var _sTitleIntent = _aTitleLink[0].intent.split("?")[0];
      if (_aLinkItems && _aLinkItems[0]) {
        _sLinkIntentWithoutParameters = "#".concat(_aLinkItems[0].getProperty("key"));
        linkIsPrimaryAction = _sTitleIntent === _sLinkIntentWithoutParameters;
        if (linkIsPrimaryAction) {
          _sTitleLinkHref = _aLinkItems[0].getProperty("href");
          this.payload.titlelinkhref = _sTitleLinkHref;
          if (_aLinkItems[0].isA(CONSTANTS.sapuimdclinkLinkItem)) {
            _oMDCLink = _aLinkItems[0].getParent();
            _oMDCLink.getModel("$sapuimdcLink").setProperty("/titleLinkHref", _sTitleLinkHref);
            var aMLinkItems = _oMDCLink.getModel("$sapuimdcLink").getProperty("/linkItems").filter(function (oLinkItem) {
              if ("#".concat(oLinkItem.key) !== _sLinkIntentWithoutParameters) {
                return oLinkItem;
              }
            });
            if (aMLinkItems && aMLinkItems.length > 0) {
              _oMDCLink.getModel("$sapuimdcLink").setProperty("/linkItems/", aMLinkItems);
            }
            bResult = true;
          }
        }
      }
    }
    return bResult;
  };
  SimpleLinkDelegate._IsSemanticObjectDynamic = function (aNewLinkCustomData, oThis) {
    if (aNewLinkCustomData && oThis.aLinkCustomData) {
      return oThis.aLinkCustomData.filter(function (link) {
        return aNewLinkCustomData.filter(function (otherLink) {
          return otherLink !== link;
        }).length > 0;
      }).length > 0;
    } else {
      return false;
    }
  };
  SimpleLinkDelegate._getLineContext = function (oView, mLineContext) {
    if (!mLineContext) {
      if (oView.getAggregation("content")[0] && oView.getAggregation("content")[0].getBindingContext()) {
        return oView.getAggregation("content")[0].getBindingContext();
      }
    }
    return mLineContext;
  };
  SimpleLinkDelegate._setFilterContextUrlForSelectionVariant = function (oView, oSelectionVariant, oNavigationService) {
    if (oView.getViewData().entitySet && oSelectionVariant) {
      var sContextUrl = oNavigationService.constructContextUrl(oView.getViewData().entitySet, oView.getModel());
      oSelectionVariant.setFilterContextUrl(sContextUrl);
    }
    return oSelectionVariant;
  };
  SimpleLinkDelegate._setObjectMappings = function (sSemanticObject, oParams, aSemanticObjectMappings, oSelectionVariant) {
    var hasChanged = false;
    var modifiedSelectionVariant = new SelectionVariant(oSelectionVariant.toJSONObject());
    // if semanticObjectMappings has items with dynamic semanticObjects we need to resolve them using oParams
    aSemanticObjectMappings.forEach(function (mapping) {
      var mappingSemanticObject = mapping.semanticObject;
      var mappingSemanticObjectPath = getDynamicPathFromSemanticObject(mapping.semanticObject);
      if (mappingSemanticObjectPath && oParams[mappingSemanticObjectPath]) {
        mappingSemanticObject = oParams[mappingSemanticObjectPath];
      }
      if (sSemanticObject === mappingSemanticObject) {
        var oMappings = mapping.items;
        for (var i in oMappings) {
          var sLocalProperty = oMappings[i].key;
          var sSemanticObjectProperty = oMappings[i].value;
          if (sLocalProperty !== sSemanticObjectProperty) {
            if (oParams[sLocalProperty]) {
              modifiedSelectionVariant.removeParameter(sSemanticObjectProperty);
              modifiedSelectionVariant.removeSelectOption(sSemanticObjectProperty);
              modifiedSelectionVariant.renameParameter(sLocalProperty, sSemanticObjectProperty);
              modifiedSelectionVariant.renameSelectOption(sLocalProperty, sSemanticObjectProperty);
              oParams[sSemanticObjectProperty] = oParams[sLocalProperty];
              delete oParams[sLocalProperty];
              hasChanged = true;
            }
            // We remove the parameter as there is no value

            // The local property comes from a navigation property
            else if (sLocalProperty.split("/").length > 1) {
              // find the property to be removed
              var propertyToBeRemoved = sLocalProperty.split("/").slice(-1)[0];
              // The navigation property has no value
              if (!oParams[propertyToBeRemoved]) {
                delete oParams[propertyToBeRemoved];
                modifiedSelectionVariant.removeParameter(propertyToBeRemoved);
                modifiedSelectionVariant.removeSelectOption(propertyToBeRemoved);
              } else if (propertyToBeRemoved !== sSemanticObjectProperty) {
                // The navigation property has a value and properties names are different
                modifiedSelectionVariant.renameParameter(propertyToBeRemoved, sSemanticObjectProperty);
                modifiedSelectionVariant.renameSelectOption(propertyToBeRemoved, sSemanticObjectProperty);
                oParams[sSemanticObjectProperty] = oParams[propertyToBeRemoved];
                delete oParams[propertyToBeRemoved];
              }
            } else {
              delete oParams[sLocalProperty];
              modifiedSelectionVariant.removeParameter(sSemanticObjectProperty);
              modifiedSelectionVariant.removeSelectOption(sSemanticObjectProperty);
            }
          }
        }
      }
    });
    return {
      params: oParams,
      hasChanged: hasChanged,
      selectionVariant: modifiedSelectionVariant
    };
  };

  /**
   * Call getAppStateKeyAndUrlParameters in navigation service and cache its results.
   *
   * @param _this The instance of quickviewdelegate.
   * @param navigationService The navigation service.
   * @param selectionVariant The current selection variant.
   * @param semanticObject The current semanticObject.
   */
  SimpleLinkDelegate._getAppStateKeyAndUrlParameters = function (_this, navigationService, selectionVariant, semanticObject) {
    try {
      var _this$appStateKeyMap$;
      var aValues = [];

      // check if default cache contains already the unmodified selectionVariant
      if (deepEqual(selectionVariant, (_this$appStateKeyMap$ = _this.appStateKeyMap[""]) === null || _this$appStateKeyMap$ === void 0 ? void 0 : _this$appStateKeyMap$.selectionVariant)) {
        var defaultCache = _this.appStateKeyMap[""];
        return Promise.resolve([defaultCache.semanticAttributes, defaultCache.appstatekey]);
      }
      // update url parameters because there is a change in selection variant
      var _temp6 = function () {
        if (_this.appStateKeyMap["".concat(semanticObject)] === undefined || !deepEqual(_this.appStateKeyMap["".concat(semanticObject)].selectionVariant, selectionVariant)) {
          return Promise.resolve(toES6Promise(navigationService.getAppStateKeyAndUrlParameters(selectionVariant.toJSONString()))).then(function (_toES6Promise) {
            aValues = _toES6Promise;
            _this.appStateKeyMap["".concat(semanticObject)] = {
              semanticAttributes: aValues[0],
              appstatekey: aValues[1],
              selectionVariant: selectionVariant
            };
          });
        } else {
          var cache = _this.appStateKeyMap["".concat(semanticObject)];
          aValues = [cache.semanticAttributes, cache.appstatekey];
        }
      }();
      return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(function () {
        return aValues;
      }) : aValues);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  SimpleLinkDelegate._getLinkItemWithNewParameter = function (_that, _bTitleHasLink, _aTitleLink, _oLinkItem, _oShellServices, _oPayload, _oParams, _sAppStateKey, _oSelectionVariant, _oNavigationService) {
    try {
      return Promise.resolve(_oShellServices.expandCompactHash(_oLinkItem.getHref()).then(function (sHash) {
        try {
          function _temp9() {
            var oNewShellHash = {
              target: {
                semanticObject: oShellHash.semanticObject,
                action: oShellHash.action
              },
              params: oNewParams,
              appStateKey: _sAppStateKey
            };
            delete oNewShellHash.params["sap-xapp-state"];
            _oLinkItem.setHref("#".concat(_oShellServices.constructShellHash(oNewShellHash)));
            _oPayload.aSemanticLinks.push(_oLinkItem.getHref());
            // The link is removed from the target list because the title link has same target.
            return SimpleLinkDelegate._RemoveTitleLinkFromTargets.bind(_that)([_oLinkItem], _bTitleHasLink, _aTitleLink);
          }
          var oShellHash = _oShellServices.parseShellHash(sHash);
          var params = Object.assign({}, _oParams);
          var _SimpleLinkDelegate$_ = SimpleLinkDelegate._setObjectMappings(oShellHash.semanticObject, params, _oPayload.semanticObjectMappings, _oSelectionVariant),
            oNewParams = _SimpleLinkDelegate$_.params,
            hasChanged = _SimpleLinkDelegate$_.hasChanged,
            newSelectionVariant = _SimpleLinkDelegate$_.selectionVariant;
          var _temp10 = function () {
            if (hasChanged) {
              return Promise.resolve(SimpleLinkDelegate._getAppStateKeyAndUrlParameters(_that, _oNavigationService, newSelectionVariant, oShellHash.semanticObject)).then(function (aValues) {
                _sAppStateKey = aValues[1];
              });
            }
          }();
          return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(_temp9) : _temp9(_temp10));
        } catch (e) {
          return Promise.reject(e);
        }
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  SimpleLinkDelegate._removeEmptyLinkItem = function (aLinkItems) {
    return aLinkItems.filter(function (linkItem) {
      return linkItem !== undefined;
    });
  };
  /**
   * Enables the modification of LinkItems before the popover opens. This enables additional parameters
   * to be added to the link.
   *
   * @param oPayload The payload of the Link given by the application
   * @param oBindingContext The binding context of the Link
   * @param aLinkItems The LinkItems of the Link that can be modified
   * @returns Once resolved an array of {@link sap.ui.mdc.link.LinkItem} is returned
   */
  SimpleLinkDelegate.modifyLinkItems = function (oPayload, oBindingContext, aLinkItems) {
    try {
      var _this6 = this;
      return Promise.resolve(FieldHelper.checkPrimaryActions(oPayload, true)).then(function (_FieldHelper$checkPri) {
        var primaryActionIsActive = _FieldHelper$checkPri;
        var aTitleLink = primaryActionIsActive.titleLink;
        var bTitleHasLink = primaryActionIsActive.hasTitleLink;
        if (aLinkItems.length !== 0) {
          _this6.payload = oPayload;
          var oLink = aLinkItems[0].getParent();
          var oView = CommonUtils.getTargetView(oLink);
          var oAppComponent = CommonUtils.getAppComponent(oView);
          var oShellServices = oAppComponent.getShellServices();
          if (!oShellServices.hasUShell()) {
            Log.error("QuickViewDelegate: Cannot retrieve the shell services");
            return Promise.reject();
          }
          var oMetaModel = oView.getModel().getMetaModel();
          var mLineContext = oLink.getBindingContext();
          var oTargetInfo = {
            semanticObject: oPayload.mainSemanticObject,
            action: ""
          };
          return _catch(function () {
            function _temp14() {
              var oNavigationService = oAppComponent.getNavigationService();
              var oController = oView.getController();
              var oSelectionVariant;
              var mLineContextData;
              mLineContext = SimpleLinkDelegate._getLineContext(oView, mLineContext);
              var sMetaPath = oMetaModel.getMetaPath(mLineContext.getPath());
              mLineContextData = oController._intentBasedNavigation.removeSensitiveData(mLineContext.getObject(), sMetaPath);
              mLineContextData = oController._intentBasedNavigation.prepareContextForExternalNavigation(mLineContextData, mLineContext);
              oSelectionVariant = oNavigationService.mixAttributesAndSelectionVariant(mLineContextData.semanticAttributes, new SelectionVariant());
              oTargetInfo.propertiesWithoutConflict = mLineContextData.propertiesWithoutConflict;
              //TO modify the selection variant from the Extension API
              oController.intentBasedNavigation.adaptNavigationContext(oSelectionVariant, oTargetInfo);
              SimpleLinkDelegate._removeTechnicalParameters(oSelectionVariant);
              oSelectionVariant = SimpleLinkDelegate._setFilterContextUrlForSelectionVariant(oView, oSelectionVariant, oNavigationService);
              return Promise.resolve(SimpleLinkDelegate._getAppStateKeyAndUrlParameters(_this6, oNavigationService, oSelectionVariant, "")).then(function (aValues) {
                function _temp12() {
                  return SimpleLinkDelegate._removeEmptyLinkItem(aLinkItems);
                }
                var oParams = aValues[0];
                var appStateKey = aValues[1];
                var titleLinktoBeRemove;
                oPayload.aSemanticLinks = [];
                aLinkItems = SimpleLinkDelegate._removeEmptyLinkItem(aLinkItems);
                var _temp11 = _forIn(aLinkItems, function (index) {
                  return Promise.resolve(SimpleLinkDelegate._getLinkItemWithNewParameter(_this6, bTitleHasLink, aTitleLink, aLinkItems[index], oShellServices, oPayload, oParams, appStateKey, oSelectionVariant, oNavigationService)).then(function (_SimpleLinkDelegate$_3) {
                    titleLinktoBeRemove = _SimpleLinkDelegate$_3;
                    if (titleLinktoBeRemove === true) {
                      aLinkItems[index] = undefined;
                    }
                  });
                });
                return _temp11 && _temp11.then ? _temp11.then(_temp12) : _temp12(_temp11);
              });
            }
            var aNewLinkCustomData = oLink && _this6._fetchLinkCustomData(oLink).map(function (linkItem) {
              return linkItem.mProperties.value;
            });
            // check if all link items in this.aLinkCustomData are also present in aNewLinkCustomData
            var _temp13 = function () {
              if (SimpleLinkDelegate._IsSemanticObjectDynamic(aNewLinkCustomData, _this6)) {
                // if the customData changed there are different LinkItems to display
                var oSemanticAttributesResolved = SimpleLinkDelegate._calculateSemanticAttributes(oBindingContext.getObject(), oPayload, undefined, _this6._link);
                var oSemanticAttributes = oSemanticAttributesResolved.results;
                var oPayloadResolved = oSemanticAttributesResolved.payload;
                return Promise.resolve(SimpleLinkDelegate._retrieveNavigationTargets("", oSemanticAttributes, oPayloadResolved, undefined, _this6._link)).then(function (_SimpleLinkDelegate$_2) {
                  aLinkItems = _SimpleLinkDelegate$_2;
                });
              }
            }();
            return _temp13 && _temp13.then ? _temp13.then(_temp14) : _temp14(_temp13);
          }, function (oError) {
            Log.error("Error while getting the navigation service", oError);
            return undefined;
          });
        } else {
          return aLinkItems;
        }
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  SimpleLinkDelegate.beforeNavigationCallback = function (oPayload, oEvent) {
    var oSource = oEvent.getSource(),
      sHref = oEvent.getParameter("href"),
      oURLParsing = Factory.getService("URLParsing"),
      oHash = sHref && oURLParsing.parseShellHash(sHref);
    KeepAliveHelper.storeControlRefreshStrategyForHash(oSource, oHash);
    return Promise.resolve(true);
  };
  SimpleLinkDelegate._removeTechnicalParameters = function (oSelectionVariant) {
    oSelectionVariant.removeSelectOption("@odata.context");
    oSelectionVariant.removeSelectOption("@odata.metadataEtag");
    oSelectionVariant.removeSelectOption("SAP__Messages");
  };
  SimpleLinkDelegate._getSemanticObjectCustomDataValue = function (aLinkCustomData, oSemanticObjectsResolved) {
    var sPropertyName, sCustomDataValue;
    for (var iCustomDataCount = 0; iCustomDataCount < aLinkCustomData.length; iCustomDataCount++) {
      sPropertyName = aLinkCustomData[iCustomDataCount].getKey();
      sCustomDataValue = aLinkCustomData[iCustomDataCount].getValue();
      oSemanticObjectsResolved[sPropertyName] = {
        value: sCustomDataValue
      };
    }
  };

  /**
   * Check the semantic object name if it is dynamic or not.
   *
   * @private
   * @param pathOrValue The semantic object path or name
   * @returns True if semantic object is dynamic
   */
  SimpleLinkDelegate._isDynamicPath = function (pathOrValue) {
    if (pathOrValue && pathOrValue.indexOf("{") === 0 && pathOrValue.indexOf("}") === pathOrValue.length - 1) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Update the payload with semantic object values from custom data of Link.
   *
   * @private
   * @param payload The payload of the mdc link.
   * @param newPayload The new updated payload.
   * @param semanticObjectName The semantic object name resolved.
   */
  SimpleLinkDelegate._updatePayloadWithResolvedSemanticObjectValue = function (payload, newPayload, semanticObjectName) {
    var _newPayload$semanticO;
    if (SimpleLinkDelegate._isDynamicPath(payload.mainSemanticObject)) {
      if (semanticObjectName) {
        newPayload.mainSemanticObject = semanticObjectName;
      } else {
        // no value from Custom Data, so removing mainSemanticObject
        newPayload.mainSemanticObject = undefined;
      }
    }
    switch (typeof semanticObjectName) {
      case "string":
        (_newPayload$semanticO = newPayload.semanticObjectsResolved) === null || _newPayload$semanticO === void 0 ? void 0 : _newPayload$semanticO.push(semanticObjectName);
        newPayload.semanticObjects.push(semanticObjectName);
        break;
      case "object":
        for (var j in semanticObjectName) {
          var _newPayload$semanticO2;
          (_newPayload$semanticO2 = newPayload.semanticObjectsResolved) === null || _newPayload$semanticO2 === void 0 ? void 0 : _newPayload$semanticO2.push(semanticObjectName[j]);
          newPayload.semanticObjects.push(semanticObjectName[j]);
        }
        break;
      default:
    }
  };
  SimpleLinkDelegate._createNewPayloadWithDynamicSemanticObjectsResolved = function (payload, semanticObjectsResolved, newPayload) {
    var semanticObjectName, tmpPropertyName;
    for (var i in payload.semanticObjects) {
      semanticObjectName = payload.semanticObjects[i];
      if (SimpleLinkDelegate._isDynamicPath(semanticObjectName)) {
        tmpPropertyName = semanticObjectName.substr(1, semanticObjectName.indexOf("}") - 1);
        semanticObjectName = semanticObjectsResolved[tmpPropertyName].value;
        SimpleLinkDelegate._updatePayloadWithResolvedSemanticObjectValue(payload, newPayload, semanticObjectName);
      } else {
        newPayload.semanticObjects.push(semanticObjectName);
      }
    }
  };

  /**
   * Update the semantic object name from the resolved value for the mappings attributes.
   *
   * @private
   * @param mdcPayload The payload given by the application.
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload with the resolved value for the semantic object name.
   * @param newPayload The new updated payload.
   */
  SimpleLinkDelegate._updateSemanticObjectsForMappings = function (mdcPayload, mdcPayloadWithDynamicSemanticObjectsResolved, newPayload) {
    // update the semantic object name from the resolved ones in the semantic object mappings.
    mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.forEach(function (semanticObjectMapping) {
      if (semanticObjectMapping.semanticObject && SimpleLinkDelegate._isDynamicPath(semanticObjectMapping.semanticObject)) {
        semanticObjectMapping.semanticObject = newPayload.semanticObjects[mdcPayload.semanticObjects.indexOf(semanticObjectMapping.semanticObject)];
      }
    });
  };

  /**
   * Update the semantic object name from the resolved value for the unavailable actions.
   *
   * @private
   * @param mdcPayload The payload given by the application.
   * @param mdcPayloadSemanticObjectUnavailableActions The unavailable actions given by the application.
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The updated payload with the resolved value for the semantic object name for the unavailable actions.
   */
  SimpleLinkDelegate._updateSemanticObjectsUnavailableActions = function (mdcPayload, mdcPayloadSemanticObjectUnavailableActions, mdcPayloadWithDynamicSemanticObjectsResolved) {
    var _Index;
    mdcPayloadSemanticObjectUnavailableActions.forEach(function (semanticObjectUnavailableAction) {
      // Dynamic SemanticObject has an unavailable action
      if (semanticObjectUnavailableAction !== null && semanticObjectUnavailableAction !== void 0 && semanticObjectUnavailableAction.semanticObject && SimpleLinkDelegate._isDynamicPath(semanticObjectUnavailableAction.semanticObject)) {
        _Index = mdcPayload.semanticObjects.findIndex(function (semanticObject) {
          return semanticObject === semanticObjectUnavailableAction.semanticObject;
        });
        if (_Index !== undefined) {
          // Get the SemanticObject name resolved to a value
          semanticObjectUnavailableAction.semanticObject = mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[_Index];
        }
      }
    });
  };

  /**
   * Update the semantic object name from the resolved value for the unavailable actions.
   *
   * @private
   * @param mdcPayload The updated payload with the information from custom data provided in the link.
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload updated with resolved semantic objects names.
   */
  SimpleLinkDelegate._updateSemanticObjectsWithResolvedValue = function (mdcPayload, mdcPayloadWithDynamicSemanticObjectsResolved) {
    for (var newSemanticObjectsCount = 0; newSemanticObjectsCount < mdcPayload.semanticObjects.length; newSemanticObjectsCount++) {
      if (mdcPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject === (mdcPayload.semanticObjectsResolved && mdcPayload.semanticObjectsResolved[newSemanticObjectsCount])) {
        mdcPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = mdcPayload.semanticObjects[newSemanticObjectsCount];
      }
      if (mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[newSemanticObjectsCount]) {
        mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects[newSemanticObjectsCount] = mdcPayload.semanticObjects[newSemanticObjectsCount];
      } else {
        // no Custom Data value for a Semantic Object name with path
        mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjects.splice(newSemanticObjectsCount, 1);
      }
    }
  };

  /**
   * Remove empty semantic object mappings and if there is no semantic object name, link to it.
   *
   * @private
   * @param mdcPayloadWithDynamicSemanticObjectsResolved The payload used to check the mappings of the semantic objects.
   */
  SimpleLinkDelegate._removeEmptySemanticObjectsMappings = function (mdcPayloadWithDynamicSemanticObjectsResolved) {
    // remove undefined Semantic Object Mapping
    for (var mappingsCount = 0; mappingsCount < mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.length; mappingsCount++) {
      if (mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings[mappingsCount] && mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings[mappingsCount].semanticObject === undefined) {
        mdcPayloadWithDynamicSemanticObjectsResolved.semanticObjectMappings.splice(mappingsCount, 1);
      }
    }
  };
  SimpleLinkDelegate._setPayloadWithDynamicSemanticObjectsResolved = function (payload, newPayload) {
    var oPayloadWithDynamicSemanticObjectsResolved;
    if (newPayload.semanticObjectsResolved && newPayload.semanticObjectsResolved.length > 0) {
      oPayloadWithDynamicSemanticObjectsResolved = {
        entityType: payload.entityType,
        dataField: payload.dataField,
        contact: payload.contact,
        mainSemanticObject: payload.mainSemanticObject,
        navigationPath: payload.navigationPath,
        propertyPathLabel: payload.propertyPathLabel,
        semanticObjectMappings: deepClone(payload.semanticObjectMappings),
        semanticObjects: newPayload.semanticObjects
      };
      SimpleLinkDelegate._updateSemanticObjectsForMappings(payload, oPayloadWithDynamicSemanticObjectsResolved, newPayload);
      var _SemanticObjectUnavailableActions = deepClone(payload.semanticObjectUnavailableActions);
      SimpleLinkDelegate._updateSemanticObjectsUnavailableActions(payload, _SemanticObjectUnavailableActions, oPayloadWithDynamicSemanticObjectsResolved);
      oPayloadWithDynamicSemanticObjectsResolved.semanticObjectUnavailableActions = _SemanticObjectUnavailableActions;
      if (newPayload.mainSemanticObject) {
        oPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = newPayload.mainSemanticObject;
      } else {
        oPayloadWithDynamicSemanticObjectsResolved.mainSemanticObject = undefined;
      }
      SimpleLinkDelegate._updateSemanticObjectsWithResolvedValue(newPayload, oPayloadWithDynamicSemanticObjectsResolved);
      SimpleLinkDelegate._removeEmptySemanticObjectsMappings(oPayloadWithDynamicSemanticObjectsResolved);
      return oPayloadWithDynamicSemanticObjectsResolved;
    } else {
      return {};
    }
  };
  SimpleLinkDelegate._getPayloadWithDynamicSemanticObjectsResolved = function (payload, linkCustomData) {
    var oPayloadWithDynamicSemanticObjectsResolved;
    var oSemanticObjectsResolved = {};
    var newPayload = {
      semanticObjects: [],
      semanticObjectsResolved: [],
      semanticObjectMappings: []
    };
    if (payload.semanticObjects) {
      // sap.m.Link has custom data with Semantic Objects names resolved
      if (linkCustomData && linkCustomData.length > 0) {
        SimpleLinkDelegate._getSemanticObjectCustomDataValue(linkCustomData, oSemanticObjectsResolved);
        SimpleLinkDelegate._createNewPayloadWithDynamicSemanticObjectsResolved(payload, oSemanticObjectsResolved, newPayload);
        oPayloadWithDynamicSemanticObjectsResolved = SimpleLinkDelegate._setPayloadWithDynamicSemanticObjectsResolved(payload, newPayload);
        return oPayloadWithDynamicSemanticObjectsResolved;
      }
    } else {
      return undefined;
    }
  };
  SimpleLinkDelegate._updatePayloadWithSemanticAttributes = function (aSemanticObjects, oInfoLog, oContextObject, oResults, mSemanticObjectMappings) {
    aSemanticObjects.forEach(function (sSemanticObject) {
      if (oInfoLog) {
        oInfoLog.addContextObject(sSemanticObject, oContextObject);
      }
      oResults[sSemanticObject] = {};
      for (var sAttributeName in oContextObject) {
        var oAttribute = null,
          oTransformationAdditional = null;
        if (oInfoLog) {
          oAttribute = oInfoLog.getSemanticObjectAttribute(sSemanticObject, sAttributeName);
          if (!oAttribute) {
            oAttribute = oInfoLog.createAttributeStructure();
            oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeName, oAttribute);
          }
        }
        // Ignore undefined and null values
        if (oContextObject[sAttributeName] === undefined || oContextObject[sAttributeName] === null) {
          if (oAttribute) {
            oAttribute.transformations.push({
              value: undefined,
              description: "\u2139 Undefined and null values have been removed in SimpleLinkDelegate."
            });
          }
          continue;
        }
        // Ignore plain objects (BCP 1770496639)
        if (isPlainObject(oContextObject[sAttributeName])) {
          if (mSemanticObjectMappings && mSemanticObjectMappings[sSemanticObject]) {
            var aKeys = Object.keys(mSemanticObjectMappings[sSemanticObject]);
            var sNewAttributeNameMapped = void 0,
              sNewAttributeName = void 0,
              sValue = void 0,
              sKey = void 0;
            for (var index = 0; index < aKeys.length; index++) {
              sKey = aKeys[index];
              if (sKey.indexOf(sAttributeName) === 0) {
                sNewAttributeNameMapped = mSemanticObjectMappings[sSemanticObject][sKey];
                sNewAttributeName = sKey.split("/")[sKey.split("/").length - 1];
                sValue = oContextObject[sAttributeName][sNewAttributeName];
                if (sNewAttributeNameMapped && sNewAttributeName && sValue) {
                  oResults[sSemanticObject][sNewAttributeNameMapped] = sValue;
                }
              }
            }
          }
          if (oAttribute) {
            oAttribute.transformations.push({
              value: undefined,
              description: "\u2139 Plain objects has been removed in SimpleLinkDelegate."
            });
          }
          continue;
        }

        // Map the attribute name only if 'semanticObjectMapping' is defined.
        // Note: under defined 'semanticObjectMapping' we also mean an empty annotation or an annotation with empty record
        var sAttributeNameMapped = mSemanticObjectMappings && mSemanticObjectMappings[sSemanticObject] && mSemanticObjectMappings[sSemanticObject][sAttributeName] ? mSemanticObjectMappings[sSemanticObject][sAttributeName] : sAttributeName;
        if (oAttribute && sAttributeName !== sAttributeNameMapped) {
          oTransformationAdditional = {
            value: undefined,
            description: "\u2139 The attribute ".concat(sAttributeName, " has been renamed to ").concat(sAttributeNameMapped, " in SimpleLinkDelegate."),
            reason: "\uD83D\uDD34 A com.sap.vocabularies.Common.v1.SemanticObjectMapping annotation is defined for semantic object ".concat(sSemanticObject, " with source attribute ").concat(sAttributeName, " and target attribute ").concat(sAttributeNameMapped, ". You can modify the annotation if the mapping result is not what you expected.")
          };
        }

        // If more then one local property maps to the same target property (clash situation)
        // we take the value of the last property and write an error log
        if (oResults[sSemanticObject][sAttributeNameMapped]) {
          Log.error("SimpleLinkDelegate: The attribute ".concat(sAttributeName, " can not be renamed to the attribute ").concat(sAttributeNameMapped, " due to a clash situation. This can lead to wrong navigation later on."));
        }

        // Copy the value replacing the attribute name by semantic object name
        oResults[sSemanticObject][sAttributeNameMapped] = oContextObject[sAttributeName];
        if (oAttribute) {
          if (oTransformationAdditional) {
            oAttribute.transformations.push(oTransformationAdditional);
            var aAttributeNew = oInfoLog.createAttributeStructure();
            aAttributeNew.transformations.push({
              value: oContextObject[sAttributeName],
              description: "\u2139 The attribute ".concat(sAttributeNameMapped, " with the value ").concat(oContextObject[sAttributeName], " has been added due to a mapping rule regarding the attribute ").concat(sAttributeName, " in SimpleLinkDelegate.")
            });
            oInfoLog.addSemanticObjectAttribute(sSemanticObject, sAttributeNameMapped, aAttributeNew);
          }
        }
      }
    });
  };

  /**
   * Checks which attributes of the ContextObject belong to which SemanticObject and maps them into a two dimensional array.
   *
   * @private
   * @param oContextObject The BindingContext of the SourceControl of the Link / of the Link itself if not set
   * @param oPayload The payload given by the application
   * @param oInfoLog The corresponding InfoLog of the Link
   * @param oLink The corresponding Link
   * @returns A two dimensional array which maps a given SemanticObject name together with a given attribute name to the value of that given attribute
   */
  SimpleLinkDelegate._calculateSemanticAttributes = function (oContextObject, oPayload, oInfoLog, oLink) {
    var aLinkCustomData = oLink && this._fetchLinkCustomData(oLink);
    var oPayloadWithDynamicSemanticObjectsResolved = SimpleLinkDelegate._getPayloadWithDynamicSemanticObjectsResolved(oPayload, aLinkCustomData);
    var oPayloadResolved = oPayloadWithDynamicSemanticObjectsResolved ? oPayloadWithDynamicSemanticObjectsResolved : oPayload;
    this.resolvedpayload = oPayloadWithDynamicSemanticObjectsResolved;
    var aSemanticObjects = SimpleLinkDelegate._getSemanticObjects(oPayloadResolved);
    var mSemanticObjectMappings = SimpleLinkDelegate._convertSemanticObjectMapping(SimpleLinkDelegate._getSemanticObjectMappings(oPayloadResolved));
    if (!aSemanticObjects.length) {
      aSemanticObjects.push("");
    }
    var oResults = {};
    SimpleLinkDelegate._updatePayloadWithSemanticAttributes(aSemanticObjects, oInfoLog, oContextObject, oResults, mSemanticObjectMappings);
    return {
      payload: oPayloadResolved,
      results: oResults
    };
  };
  /**
   * Retrieves the actual targets for the navigation of the link. This uses the UShell loaded by the {@link sap.ui.mdc.link.Factory} to retrieve
   * the navigation targets from the FLP service.
   *
   * @private
   * @param sAppStateKey Key of the appstate (not used yet)
   * @param oSemanticAttributes The calculated by _calculateSemanticAttributes
   * @param oPayload The payload given by the application
   * @param oInfoLog The corresponding InfoLog of the Link
   * @param oLink The corresponding Link
   * @returns Resolving into availableAtions and ownNavigation containing an array of {@link sap.ui.mdc.link.LinkItem}
   */
  SimpleLinkDelegate._retrieveNavigationTargets = function (sAppStateKey, oSemanticAttributes, oPayload, oInfoLog, oLink) {
    var _this7 = this;
    if (!oPayload.semanticObjects) {
      return Promise.resolve([]);
    }
    var aSemanticObjects = oPayload.semanticObjects;
    var oNavigationTargets = {
      ownNavigation: undefined,
      availableActions: []
    };
    var iSuperiorActionLinksFound = 0;
    return Core.loadLibrary("sap.ui.fl", {
      async: true
    }).then(function () {
      return new Promise(function (resolve) {
        sap.ui.require(["sap/ui/fl/Utils"], function (Utils) {
          try {
            var oAppComponent = Utils.getAppComponentForControl(oLink === undefined ? _this7.oControl : oLink);
            var oShellServices = oAppComponent ? oAppComponent.getShellServices() : null;
            if (!oShellServices) {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
            }
            if (!oShellServices.hasUShell()) {
              Log.error("SimpleLinkDelegate: Service 'CrossApplicationNavigation' or 'URLParsing' could not be obtained");
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
            }
            var aParams = aSemanticObjects.map(function (sSemanticObject) {
              return [{
                semanticObject: sSemanticObject,
                params: oSemanticAttributes ? oSemanticAttributes[sSemanticObject] : undefined,
                appStateKey: sAppStateKey,
                sortResultsBy: "text"
              }];
            });
            var _temp16 = _catch(function () {
              return Promise.resolve(oShellServices.getLinks(aParams)).then(function (aLinks) {
                var bHasLinks = false;
                for (var i = 0; i < aLinks.length; i++) {
                  for (var j = 0; j < aLinks[i].length; j++) {
                    if (aLinks[i][j].length > 0) {
                      bHasLinks = true;
                      break;
                    }
                    if (bHasLinks) {
                      break;
                    }
                  }
                }
                if (!aLinks || !aLinks.length || !bHasLinks) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  // @ts-ignore
                  resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
                }
                var aSemanticObjectUnavailableActions = SimpleLinkDelegate._getSemanticObjectUnavailableActions(oPayload);
                var oUnavailableActions = SimpleLinkDelegate._convertSemanticObjectUnavailableAction(aSemanticObjectUnavailableActions);
                var sCurrentHash = FieldRuntime._fnFixHashQueryString(CommonUtils.getHash());
                if (sCurrentHash) {
                  // BCP 1770315035: we have to set the end-point '?' of action in order to avoid matching of "#SalesOrder-manage" in "#SalesOrder-manageFulfillment"
                  sCurrentHash += "?";
                }
                var fnIsUnavailableAction = function (sSemanticObject, sAction) {
                  return !!oUnavailableActions && !!oUnavailableActions[sSemanticObject] && oUnavailableActions[sSemanticObject].indexOf(sAction) > -1;
                };
                var fnAddLink = function (_oLink) {
                  var oShellHash = oShellServices.parseShellHash(_oLink.intent);
                  if (fnIsUnavailableAction(oShellHash.semanticObject, oShellHash.action)) {
                    return;
                  }
                  var sHref = "#".concat(oShellServices.constructShellHash({
                    target: {
                      shellHash: _oLink.intent
                    }
                  }));
                  if (_oLink.intent && _oLink.intent.indexOf(sCurrentHash) === 0) {
                    // Prevent current app from being listed
                    // NOTE: If the navigation target exists in
                    // multiple contexts (~XXXX in hash) they will all be skipped
                    oNavigationTargets.ownNavigation = new LinkItem({
                      href: sHref,
                      text: _oLink.text
                    });
                    return;
                  }
                  var oLinkItem = new LinkItem({
                    // As the retrieveNavigationTargets method can be called several time we can not create the LinkItem instance with the same id
                    key: oShellHash.semanticObject && oShellHash.action ? "".concat(oShellHash.semanticObject, "-").concat(oShellHash.action) : undefined,
                    text: _oLink.text,
                    description: undefined,
                    href: sHref,
                    // target: not supported yet
                    icon: undefined,
                    //_oLink.icon,
                    initiallyVisible: _oLink.tags && _oLink.tags.indexOf("superiorAction") > -1
                  });
                  if (oLinkItem.getProperty("initiallyVisible")) {
                    iSuperiorActionLinksFound++;
                  }
                  oNavigationTargets.availableActions.push(oLinkItem);
                  if (oInfoLog) {
                    oInfoLog.addSemanticObjectIntent(oShellHash.semanticObject, {
                      intent: oLinkItem.getHref(),
                      text: oLinkItem.getText()
                    });
                  }
                };
                for (var n = 0; n < aSemanticObjects.length; n++) {
                  aLinks[n][0].forEach(fnAddLink);
                }
                if (iSuperiorActionLinksFound === 0) {
                  for (var iLinkItemIndex = 0; iLinkItemIndex < oNavigationTargets.availableActions.length; iLinkItemIndex++) {
                    if (iLinkItemIndex < _this7.getConstants().iLinksShownInPopup) {
                      oNavigationTargets.availableActions[iLinkItemIndex].setProperty("initiallyVisible", true);
                    } else {
                      break;
                    }
                  }
                }
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
              });
            }, function () {
              Log.error("SimpleLinkDelegate: '_retrieveNavigationTargets' failed executing getLinks method");
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              resolve(oNavigationTargets.availableActions, oNavigationTargets.ownNavigation);
            });
            return Promise.resolve(_temp16 && _temp16.then ? _temp16.then(function () {}) : void 0);
          } catch (e) {
            return Promise.reject(e);
          }
        });
      });
    });
  };
  SimpleLinkDelegate._getSemanticObjects = function (oPayload) {
    return oPayload.semanticObjects ? oPayload.semanticObjects : [];
  };
  SimpleLinkDelegate._getSemanticObjectUnavailableActions = function (oPayload) {
    var aSemanticObjectUnavailableActions = [];
    if (oPayload.semanticObjectUnavailableActions) {
      oPayload.semanticObjectUnavailableActions.forEach(function (oSemanticObjectUnavailableAction) {
        aSemanticObjectUnavailableActions.push(new SemanticObjectUnavailableAction({
          semanticObject: oSemanticObjectUnavailableAction.semanticObject,
          actions: oSemanticObjectUnavailableAction.actions
        }));
      });
    }
    return aSemanticObjectUnavailableActions;
  };

  /**
   * This will return an array of {@link sap.ui.mdc.link.SemanticObjectMapping} depending on the given payload.
   *
   * @private
   * @param oPayload The payload defined by the application
   * @returns An array of semantic object mappings.
   */
  SimpleLinkDelegate._getSemanticObjectMappings = function (oPayload) {
    var aSemanticObjectMappings = [];
    var aSemanticObjectMappingItems = [];
    if (oPayload.semanticObjectMappings) {
      oPayload.semanticObjectMappings.forEach(function (oSemanticObjectMapping) {
        aSemanticObjectMappingItems = [];
        if (oSemanticObjectMapping.items) {
          oSemanticObjectMapping.items.forEach(function (oSemanticObjectMappingItem) {
            aSemanticObjectMappingItems.push(new SemanticObjectMappingItem({
              key: oSemanticObjectMappingItem.key,
              value: oSemanticObjectMappingItem.value
            }));
          });
        }
        aSemanticObjectMappings.push(new SemanticObjectMapping({
          semanticObject: oSemanticObjectMapping.semanticObject,
          items: aSemanticObjectMappingItems
        }));
      });
    }
    return aSemanticObjectMappings;
  };
  /**
   * Converts a given array of SemanticObjectMapping into a Map containing SemanticObjects as Keys and a Map of it's corresponding SemanticObjectMappings as values.
   *
   * @private
   * @param aSemanticObjectMappings An array of SemanticObjectMappings.
   * @returns The converterd SemanticObjectMappings
   */
  SimpleLinkDelegate._convertSemanticObjectMapping = function (aSemanticObjectMappings) {
    if (!aSemanticObjectMappings.length) {
      return undefined;
    }
    var mSemanticObjectMappings = {};
    aSemanticObjectMappings.forEach(function (oSemanticObjectMapping) {
      if (!oSemanticObjectMapping.getSemanticObject()) {
        throw Error("SimpleLinkDelegate: 'semanticObject' property with value '".concat(oSemanticObjectMapping.getSemanticObject(), "' is not valid"));
      }
      mSemanticObjectMappings[oSemanticObjectMapping.getSemanticObject()] = oSemanticObjectMapping.getItems().reduce(function (oMap, oItem) {
        oMap[oItem.getKey()] = oItem.getValue();
        return oMap;
      }, {});
    });
    return mSemanticObjectMappings;
  };
  /**
   * Converts a given array of SemanticObjectUnavailableActions into a map containing SemanticObjects as keys and a map of its corresponding SemanticObjectUnavailableActions as values.
   *
   * @private
   * @param aSemanticObjectUnavailableActions The SemanticObjectUnavailableActions converted
   * @returns The map containing the converted SemanticObjectUnavailableActions
   */
  SimpleLinkDelegate._convertSemanticObjectUnavailableAction = function (aSemanticObjectUnavailableActions) {
    var _SemanticObjectName;
    var _SemanticObjectHasAlreadyUnavailableActions;
    var _UnavailableActions = [];
    if (!aSemanticObjectUnavailableActions.length) {
      return undefined;
    }
    var mSemanticObjectUnavailableActions = {};
    aSemanticObjectUnavailableActions.forEach(function (oSemanticObjectUnavailableActions) {
      _SemanticObjectName = oSemanticObjectUnavailableActions.getSemanticObject();
      if (!_SemanticObjectName) {
        throw Error("SimpleLinkDelegate: 'semanticObject' property with value '".concat(_SemanticObjectName, "' is not valid"));
      }
      _UnavailableActions = oSemanticObjectUnavailableActions.getActions();
      if (mSemanticObjectUnavailableActions[_SemanticObjectName] === undefined) {
        mSemanticObjectUnavailableActions[_SemanticObjectName] = _UnavailableActions;
      } else {
        _SemanticObjectHasAlreadyUnavailableActions = mSemanticObjectUnavailableActions[_SemanticObjectName];
        _UnavailableActions.forEach(function (UnavailableAction) {
          _SemanticObjectHasAlreadyUnavailableActions.push(UnavailableAction);
        });
        mSemanticObjectUnavailableActions[_SemanticObjectName] = _SemanticObjectHasAlreadyUnavailableActions;
      }
    });
    return mSemanticObjectUnavailableActions;
  };
  return SimpleLinkDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwicGFjdCIsInN0YXRlIiwidmFsdWUiLCJzIiwidiIsIm8iLCJiaW5kIiwib2JzZXJ2ZXIiLCJwcm90b3R5cGUiLCJvbkZ1bGZpbGxlZCIsIm9uUmVqZWN0ZWQiLCJjYWxsYmFjayIsIl90aGlzIiwidGhlbmFibGUiLCJhcnJheSIsImNoZWNrIiwiaSIsInJlamVjdCIsIl9jeWNsZSIsImxlbmd0aCIsInRhcmdldCIsImtleXMiLCJrZXkiLCJwdXNoIiwiU2ltcGxlTGlua0RlbGVnYXRlIiwiT2JqZWN0IiwiYXNzaWduIiwiTGlua0RlbGVnYXRlIiwiQ09OU1RBTlRTIiwiaUxpbmtzU2hvd25JblBvcHVwIiwic2FwbUxpbmsiLCJzYXB1aW1kY0xpbmsiLCJzYXB1aW1kY2xpbmtMaW5rSXRlbSIsInNhcG1PYmplY3RJZGVudGlmaWVyIiwic2FwbU9iamVjdFN0YXR1cyIsImdldENvbnN0YW50cyIsIl9nZXRFbnRpdHlUeXBlIiwib1BheWxvYWQiLCJvTWV0YU1vZGVsIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJlbnRpdHlUeXBlIiwidW5kZWZpbmVkIiwiX2dldFNlbWFudGljc01vZGVsIiwiSlNPTk1vZGVsIiwiX2dldERhdGFGaWVsZCIsImRhdGFGaWVsZCIsIl9nZXRDb250YWN0IiwiY29udGFjdCIsImZuVGVtcGxhdGVGcmFnbWVudCIsInNGcmFnbWVudE5hbWUiLCJ0aXRsZUxpbmtIcmVmIiwib0ZyYWdtZW50TW9kZWwiLCJvUGF5bG9hZFRvVXNlIiwicmVzb2x2ZWRwYXlsb2FkIiwicGF5bG9hZCIsIkxpbmtJZCIsIm9Db250cm9sIiwiaXNBIiwiZ2V0SWQiLCJnZXRNb2RlbCIsImdldFByb3BlcnR5IiwidGl0bGVsaW5rIiwib1NlbWFudGljc01vZGVsIiwic2VtYW50aWNNb2RlbCIsImJpbmRpbmdDb250ZXh0cyIsInNlbWFudGljIiwibW9kZWxzIiwiZW50aXR5U2V0IiwibWV0YU1vZGVsIiwidmlld0RhdGEiLCJvRnJhZ21lbnQiLCJYTUxUZW1wbGF0ZVByb2Nlc3NvciIsImxvYWRUZW1wbGF0ZSIsIlByb21pc2UiLCJyZXNvbHZlIiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsIm5hbWUiLCJfaW50ZXJuYWxGcmFnbWVudCIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJjb250cm9sbGVyIiwib1BvcG92ZXJDb250ZW50Iiwic2V0TW9kZWwiLCJzZXRCaW5kaW5nQ29udGV4dCIsImZldGNoQWRkaXRpb25hbENvbnRlbnQiLCJvUGF5TG9hZCIsIm9NZGNMaW5rQ29udHJvbCIsImFOYXZpZ2F0ZVJlZ2V4cE1hdGNoIiwibmF2aWdhdGlvblBhdGgiLCJtYXRjaCIsIm9CaW5kaW5nQ29udGV4dCIsImJpbmRDb250ZXh0IiwiZ2V0QmluZGluZ0NvbnRleHQiLCIkJG93blJlcXVlc3QiLCJnZXRNZXRhTW9kZWwiLCJnZXRCb3VuZENvbnRleHQiLCJfZmV0Y2hMaW5rQ3VzdG9tRGF0YSIsIl9vTGluayIsImdldFBhcmVudCIsImdldEN1c3RvbURhdGEiLCJmZXRjaExpbmtJdGVtcyIsIm9JbmZvTG9nIiwiX2dldFNlbWFudGljT2JqZWN0cyIsIm9Db250ZXh0T2JqZWN0IiwiZ2V0T2JqZWN0IiwiaW5pdGlhbGl6ZSIsIl9vTGlua0N1c3RvbURhdGEiLCJfbGluayIsImFMaW5rQ3VzdG9tRGF0YSIsIm1hcCIsImxpbmtJdGVtIiwibVByb3BlcnRpZXMiLCJvU2VtYW50aWNBdHRyaWJ1dGVzUmVzb2x2ZWQiLCJfY2FsY3VsYXRlU2VtYW50aWNBdHRyaWJ1dGVzIiwib1NlbWFudGljQXR0cmlidXRlcyIsInJlc3VsdHMiLCJvUGF5bG9hZFJlc29sdmVkIiwiX3JldHJpZXZlTmF2aWdhdGlvblRhcmdldHMiLCJhTGlua3MiLCJfZmluZExpbmtUeXBlIiwiYUxpbmtJdGVtcyIsIm5MaW5rVHlwZSIsIm9MaW5rSXRlbSIsIkxpbmtJdGVtIiwidGV4dCIsImdldFRleHQiLCJocmVmIiwiZ2V0SHJlZiIsImhhc1F1aWNrVmlld0ZhY2V0cyIsImxpbmtUeXBlIiwiZmV0Y2hMaW5rVHlwZSIsIm9MaW5rIiwiX29DdXJyZW50TGluayIsIl9vUGF5bG9hZCIsIm9EZWZhdWx0SW5pdGlhbFR5cGUiLCJpbml0aWFsVHlwZSIsInR5cGUiLCJkaXJlY3RMaW5rIiwicnVudGltZVR5cGUiLCJhcHBTdGF0ZUtleU1hcCIsIkVycm9yIiwic2VtYW50aWNPYmplY3RzIiwiX3JldHJpZXZlVW5tb2RpZmllZExpbmtJdGVtcyIsIl9MaW5rVHlwZSIsInJldHJpZXZlTGlua0l0ZW1zIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJfUmVtb3ZlVGl0bGVMaW5rRnJvbVRhcmdldHMiLCJfYUxpbmtJdGVtcyIsIl9iVGl0bGVIYXNMaW5rIiwiX2FUaXRsZUxpbmsiLCJfc1RpdGxlTGlua0hyZWYiLCJfb01EQ0xpbmsiLCJiUmVzdWx0IiwibGlua0lzUHJpbWFyeUFjdGlvbiIsIl9zTGlua0ludGVudFdpdGhvdXRQYXJhbWV0ZXJzIiwiX3NUaXRsZUludGVudCIsImludGVudCIsInNwbGl0IiwidGl0bGVsaW5raHJlZiIsInNldFByb3BlcnR5IiwiYU1MaW5rSXRlbXMiLCJmaWx0ZXIiLCJfSXNTZW1hbnRpY09iamVjdER5bmFtaWMiLCJhTmV3TGlua0N1c3RvbURhdGEiLCJvVGhpcyIsImxpbmsiLCJvdGhlckxpbmsiLCJfZ2V0TGluZUNvbnRleHQiLCJvVmlldyIsIm1MaW5lQ29udGV4dCIsImdldEFnZ3JlZ2F0aW9uIiwiX3NldEZpbHRlckNvbnRleHRVcmxGb3JTZWxlY3Rpb25WYXJpYW50Iiwib1NlbGVjdGlvblZhcmlhbnQiLCJvTmF2aWdhdGlvblNlcnZpY2UiLCJnZXRWaWV3RGF0YSIsInNDb250ZXh0VXJsIiwiY29uc3RydWN0Q29udGV4dFVybCIsInNldEZpbHRlckNvbnRleHRVcmwiLCJfc2V0T2JqZWN0TWFwcGluZ3MiLCJzU2VtYW50aWNPYmplY3QiLCJvUGFyYW1zIiwiYVNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJoYXNDaGFuZ2VkIiwibW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50IiwiU2VsZWN0aW9uVmFyaWFudCIsInRvSlNPTk9iamVjdCIsImZvckVhY2giLCJtYXBwaW5nIiwibWFwcGluZ1NlbWFudGljT2JqZWN0Iiwic2VtYW50aWNPYmplY3QiLCJtYXBwaW5nU2VtYW50aWNPYmplY3RQYXRoIiwiZ2V0RHluYW1pY1BhdGhGcm9tU2VtYW50aWNPYmplY3QiLCJvTWFwcGluZ3MiLCJpdGVtcyIsInNMb2NhbFByb3BlcnR5Iiwic1NlbWFudGljT2JqZWN0UHJvcGVydHkiLCJyZW1vdmVQYXJhbWV0ZXIiLCJyZW1vdmVTZWxlY3RPcHRpb24iLCJyZW5hbWVQYXJhbWV0ZXIiLCJyZW5hbWVTZWxlY3RPcHRpb24iLCJwcm9wZXJ0eVRvQmVSZW1vdmVkIiwic2xpY2UiLCJwYXJhbXMiLCJzZWxlY3Rpb25WYXJpYW50IiwiX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyIsIm5hdmlnYXRpb25TZXJ2aWNlIiwiYVZhbHVlcyIsImRlZXBFcXVhbCIsImRlZmF1bHRDYWNoZSIsInNlbWFudGljQXR0cmlidXRlcyIsImFwcHN0YXRla2V5IiwidG9FUzZQcm9taXNlIiwiZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzIiwidG9KU09OU3RyaW5nIiwiY2FjaGUiLCJfZ2V0TGlua0l0ZW1XaXRoTmV3UGFyYW1ldGVyIiwiX3RoYXQiLCJfb0xpbmtJdGVtIiwiX29TaGVsbFNlcnZpY2VzIiwiX29QYXJhbXMiLCJfc0FwcFN0YXRlS2V5IiwiX29TZWxlY3Rpb25WYXJpYW50IiwiX29OYXZpZ2F0aW9uU2VydmljZSIsImV4cGFuZENvbXBhY3RIYXNoIiwic0hhc2giLCJvTmV3U2hlbGxIYXNoIiwib1NoZWxsSGFzaCIsImFjdGlvbiIsIm9OZXdQYXJhbXMiLCJhcHBTdGF0ZUtleSIsInNldEhyZWYiLCJjb25zdHJ1Y3RTaGVsbEhhc2giLCJhU2VtYW50aWNMaW5rcyIsInBhcnNlU2hlbGxIYXNoIiwic2VtYW50aWNPYmplY3RNYXBwaW5ncyIsIm5ld1NlbGVjdGlvblZhcmlhbnQiLCJfcmVtb3ZlRW1wdHlMaW5rSXRlbSIsIm1vZGlmeUxpbmtJdGVtcyIsIkZpZWxkSGVscGVyIiwiY2hlY2tQcmltYXJ5QWN0aW9ucyIsInByaW1hcnlBY3Rpb25Jc0FjdGl2ZSIsImFUaXRsZUxpbmsiLCJ0aXRsZUxpbmsiLCJiVGl0bGVIYXNMaW5rIiwiaGFzVGl0bGVMaW5rIiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3Iiwib0FwcENvbXBvbmVudCIsImdldEFwcENvbXBvbmVudCIsIm9TaGVsbFNlcnZpY2VzIiwiZ2V0U2hlbGxTZXJ2aWNlcyIsImhhc1VTaGVsbCIsIm9UYXJnZXRJbmZvIiwibWFpblNlbWFudGljT2JqZWN0IiwiZ2V0TmF2aWdhdGlvblNlcnZpY2UiLCJvQ29udHJvbGxlciIsImdldENvbnRyb2xsZXIiLCJtTGluZUNvbnRleHREYXRhIiwic01ldGFQYXRoIiwiZ2V0TWV0YVBhdGgiLCJnZXRQYXRoIiwiX2ludGVudEJhc2VkTmF2aWdhdGlvbiIsInJlbW92ZVNlbnNpdGl2ZURhdGEiLCJwcmVwYXJlQ29udGV4dEZvckV4dGVybmFsTmF2aWdhdGlvbiIsIm1peEF0dHJpYnV0ZXNBbmRTZWxlY3Rpb25WYXJpYW50IiwicHJvcGVydGllc1dpdGhvdXRDb25mbGljdCIsImludGVudEJhc2VkTmF2aWdhdGlvbiIsImFkYXB0TmF2aWdhdGlvbkNvbnRleHQiLCJfcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyIsInRpdGxlTGlua3RvQmVSZW1vdmUiLCJpbmRleCIsImJlZm9yZU5hdmlnYXRpb25DYWxsYmFjayIsIm9FdmVudCIsIm9Tb3VyY2UiLCJnZXRTb3VyY2UiLCJzSHJlZiIsImdldFBhcmFtZXRlciIsIm9VUkxQYXJzaW5nIiwiRmFjdG9yeSIsImdldFNlcnZpY2UiLCJvSGFzaCIsIktlZXBBbGl2ZUhlbHBlciIsInN0b3JlQ29udHJvbFJlZnJlc2hTdHJhdGVneUZvckhhc2giLCJfZ2V0U2VtYW50aWNPYmplY3RDdXN0b21EYXRhVmFsdWUiLCJvU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQiLCJzUHJvcGVydHlOYW1lIiwic0N1c3RvbURhdGFWYWx1ZSIsImlDdXN0b21EYXRhQ291bnQiLCJnZXRLZXkiLCJnZXRWYWx1ZSIsIl9pc0R5bmFtaWNQYXRoIiwicGF0aE9yVmFsdWUiLCJpbmRleE9mIiwiX3VwZGF0ZVBheWxvYWRXaXRoUmVzb2x2ZWRTZW1hbnRpY09iamVjdFZhbHVlIiwibmV3UGF5bG9hZCIsInNlbWFudGljT2JqZWN0TmFtZSIsInNlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwiaiIsIl9jcmVhdGVOZXdQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCIsInRtcFByb3BlcnR5TmFtZSIsInN1YnN0ciIsIl91cGRhdGVTZW1hbnRpY09iamVjdHNGb3JNYXBwaW5ncyIsIm1kY1BheWxvYWQiLCJtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCIsInNlbWFudGljT2JqZWN0TWFwcGluZyIsIl91cGRhdGVTZW1hbnRpY09iamVjdHNVbmF2YWlsYWJsZUFjdGlvbnMiLCJtZGNQYXlsb2FkU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJfSW5kZXgiLCJzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uIiwiZmluZEluZGV4IiwiX3VwZGF0ZVNlbWFudGljT2JqZWN0c1dpdGhSZXNvbHZlZFZhbHVlIiwibmV3U2VtYW50aWNPYmplY3RzQ291bnQiLCJzcGxpY2UiLCJfcmVtb3ZlRW1wdHlTZW1hbnRpY09iamVjdHNNYXBwaW5ncyIsIm1hcHBpbmdzQ291bnQiLCJfc2V0UGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQiLCJvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQiLCJwcm9wZXJ0eVBhdGhMYWJlbCIsImRlZXBDbG9uZSIsIl9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsInNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiX2dldFBheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIiwibGlua0N1c3RvbURhdGEiLCJfdXBkYXRlUGF5bG9hZFdpdGhTZW1hbnRpY0F0dHJpYnV0ZXMiLCJhU2VtYW50aWNPYmplY3RzIiwib1Jlc3VsdHMiLCJtU2VtYW50aWNPYmplY3RNYXBwaW5ncyIsImFkZENvbnRleHRPYmplY3QiLCJzQXR0cmlidXRlTmFtZSIsIm9BdHRyaWJ1dGUiLCJvVHJhbnNmb3JtYXRpb25BZGRpdGlvbmFsIiwiZ2V0U2VtYW50aWNPYmplY3RBdHRyaWJ1dGUiLCJjcmVhdGVBdHRyaWJ1dGVTdHJ1Y3R1cmUiLCJhZGRTZW1hbnRpY09iamVjdEF0dHJpYnV0ZSIsInRyYW5zZm9ybWF0aW9ucyIsImRlc2NyaXB0aW9uIiwiaXNQbGFpbk9iamVjdCIsImFLZXlzIiwic05ld0F0dHJpYnV0ZU5hbWVNYXBwZWQiLCJzTmV3QXR0cmlidXRlTmFtZSIsInNWYWx1ZSIsInNLZXkiLCJzQXR0cmlidXRlTmFtZU1hcHBlZCIsInJlYXNvbiIsImFBdHRyaWJ1dGVOZXciLCJfY29udmVydFNlbWFudGljT2JqZWN0TWFwcGluZyIsIl9nZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzIiwic0FwcFN0YXRlS2V5Iiwib05hdmlnYXRpb25UYXJnZXRzIiwib3duTmF2aWdhdGlvbiIsImF2YWlsYWJsZUFjdGlvbnMiLCJpU3VwZXJpb3JBY3Rpb25MaW5rc0ZvdW5kIiwiQ29yZSIsImxvYWRMaWJyYXJ5IiwiYXN5bmMiLCJzYXAiLCJ1aSIsInJlcXVpcmUiLCJVdGlscyIsImdldEFwcENvbXBvbmVudEZvckNvbnRyb2wiLCJhUGFyYW1zIiwic29ydFJlc3VsdHNCeSIsImdldExpbmtzIiwiYkhhc0xpbmtzIiwiYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiX2dldFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwib1VuYXZhaWxhYmxlQWN0aW9ucyIsIl9jb252ZXJ0U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbiIsInNDdXJyZW50SGFzaCIsIkZpZWxkUnVudGltZSIsIl9mbkZpeEhhc2hRdWVyeVN0cmluZyIsImdldEhhc2giLCJmbklzVW5hdmFpbGFibGVBY3Rpb24iLCJzQWN0aW9uIiwiZm5BZGRMaW5rIiwic2hlbGxIYXNoIiwiaWNvbiIsImluaXRpYWxseVZpc2libGUiLCJ0YWdzIiwiYWRkU2VtYW50aWNPYmplY3RJbnRlbnQiLCJuIiwiaUxpbmtJdGVtSW5kZXgiLCJvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbiIsIlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24iLCJhY3Rpb25zIiwiYVNlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW1zIiwib1NlbWFudGljT2JqZWN0TWFwcGluZyIsIm9TZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtIiwiU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbSIsIlNlbWFudGljT2JqZWN0TWFwcGluZyIsImdldFNlbWFudGljT2JqZWN0IiwiZ2V0SXRlbXMiLCJyZWR1Y2UiLCJvTWFwIiwib0l0ZW0iLCJfU2VtYW50aWNPYmplY3ROYW1lIiwiX1NlbWFudGljT2JqZWN0SGFzQWxyZWFkeVVuYXZhaWxhYmxlQWN0aW9ucyIsIl9VbmF2YWlsYWJsZUFjdGlvbnMiLCJtU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJnZXRBY3Rpb25zIiwiVW5hdmFpbGFibGVBY3Rpb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlF1aWNrVmlld0xpbmtEZWxlZ2F0ZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBkZWVwQ2xvbmUgZnJvbSBcInNhcC9iYXNlL3V0aWwvZGVlcENsb25lXCI7XG5pbXBvcnQgZGVlcEVxdWFsIGZyb20gXCJzYXAvYmFzZS91dGlsL2RlZXBFcXVhbFwiO1xuaW1wb3J0IGlzUGxhaW5PYmplY3QgZnJvbSBcInNhcC9iYXNlL3V0aWwvaXNQbGFpbk9iamVjdFwiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IEtlZXBBbGl2ZUhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9LZWVwQWxpdmVIZWxwZXJcIjtcbmltcG9ydCB0b0VTNlByb21pc2UgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvVG9FUzZQcm9taXNlXCI7XG5pbXBvcnQgUGFnZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL1BhZ2VDb250cm9sbGVyXCI7XG5pbXBvcnQgeyBOYXZpZ2F0aW9uU2VydmljZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9OYXZpZ2F0aW9uU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCB7IGdldER5bmFtaWNQYXRoRnJvbVNlbWFudGljT2JqZWN0IH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvU2VtYW50aWNPYmplY3RIZWxwZXJcIjtcbmltcG9ydCBGaWVsZEhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZEhlbHBlclwiO1xuaW1wb3J0IEZpZWxkUnVudGltZSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZFJ1bnRpbWVcIjtcbmltcG9ydCBTZWxlY3Rpb25WYXJpYW50IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvbi9TZWxlY3Rpb25WYXJpYW50XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IEZyYWdtZW50IGZyb20gXCJzYXAvdWkvY29yZS9GcmFnbWVudFwiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCBYTUxUZW1wbGF0ZVByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvWE1MVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCBGYWN0b3J5IGZyb20gXCJzYXAvdWkvbWRjL2xpbmsvRmFjdG9yeVwiO1xuaW1wb3J0IExpbmtJdGVtIGZyb20gXCJzYXAvdWkvbWRjL2xpbmsvTGlua0l0ZW1cIjtcbmltcG9ydCBTZW1hbnRpY09iamVjdE1hcHBpbmcgZnJvbSBcInNhcC91aS9tZGMvbGluay9TZW1hbnRpY09iamVjdE1hcHBpbmdcIjtcbmltcG9ydCBTZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtIGZyb20gXCJzYXAvdWkvbWRjL2xpbmsvU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbVwiO1xuaW1wb3J0IFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24gZnJvbSBcInNhcC91aS9tZGMvbGluay9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uXCI7XG5pbXBvcnQgTGlua0RlbGVnYXRlIGZyb20gXCJzYXAvdWkvbWRjL0xpbmtEZWxlZ2F0ZVwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuXG50eXBlIFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdE1hcHBpbmcgPSB7IHNlbWFudGljT2JqZWN0OiBzdHJpbmc7IGl0ZW1zOiB7IGtleTogc3RyaW5nOyB2YWx1ZTogc3RyaW5nIH1bXSB9O1xudHlwZSBSZWdpc3RlcmVkU2VtYW50aWNPYmplY3RNYXBwaW5ncyA9IFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdE1hcHBpbmdbXTtcbnR5cGUgUmVnaXN0ZXJlZFBheWxvYWQgPSB7XG5cdG1haW5TZW1hbnRpY09iamVjdD86IHN0cmluZztcblx0c2VtYW50aWNPYmplY3RzOiBzdHJpbmdbXTtcblx0c2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ/OiBzdHJpbmdbXTtcblx0c2VtYW50aWNPYmplY3RNYXBwaW5nczogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZ3M7XG5cdHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zPzogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zO1xuXHRlbnRpdHlUeXBlPzogc3RyaW5nO1xuXHRkYXRhRmllbGQ/OiBzdHJpbmc7XG5cdGNvbnRhY3Q/OiBzdHJpbmc7XG5cdG5hdmlnYXRpb25QYXRoPzogc3RyaW5nO1xuXHRwcm9wZXJ0eVBhdGhMYWJlbD86IHN0cmluZztcbn07XG5cbnR5cGUgUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0gW1xuXHR7XG5cdFx0c2VtYW50aWNPYmplY3Q6IHN0cmluZztcblx0XHRhY3Rpb25zOiBzdHJpbmdbXTtcblx0fVxuXTtcblxuY29uc3QgU2ltcGxlTGlua0RlbGVnYXRlID0gT2JqZWN0LmFzc2lnbih7fSwgTGlua0RlbGVnYXRlKSBhcyBhbnk7XG5jb25zdCBDT05TVEFOVFMgPSB7XG5cdGlMaW5rc1Nob3duSW5Qb3B1cDogMyxcblx0c2FwbUxpbms6IFwic2FwLm0uTGlua1wiLFxuXHRzYXB1aW1kY0xpbms6IFwic2FwLnVpLm1kYy5MaW5rXCIsXG5cdHNhcHVpbWRjbGlua0xpbmtJdGVtOiBcInNhcC51aS5tZGMubGluay5MaW5rSXRlbVwiLFxuXHRzYXBtT2JqZWN0SWRlbnRpZmllcjogXCJzYXAubS5PYmplY3RJZGVudGlmaWVyXCIsXG5cdHNhcG1PYmplY3RTdGF0dXM6IFwic2FwLm0uT2JqZWN0U3RhdHVzXCJcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuZ2V0Q29uc3RhbnRzID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gQ09OU1RBTlRTO1xufTtcbi8qKlxuICogVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiB0aGUgU2VtYW50aWNPYmplY3RzIGFzIHN0cmluZ3MgZ2l2ZW4gYnkgdGhlIHBheWxvYWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBkZWZpbmVkIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIE9EYXRhTWV0YU1vZGVsIHJlY2VpdmVkIGZyb20gdGhlIExpbmtcbiAqIEByZXR1cm5zIFRoZSBjb250ZXh0IHBvaW50aW5nIHRvIHRoZSBjdXJyZW50IEVudGl0eVR5cGUuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0RW50aXR5VHlwZSA9IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55LCBvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCkge1xuXHRpZiAob01ldGFNb2RlbCkge1xuXHRcdHJldHVybiBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG9QYXlsb2FkLmVudGl0eVR5cGUpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG4vKipcbiAqIFRoaXMgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2YgdGhlIFNlbWFudGljT2JqZWN0cyBhcyBzdHJpbmdzIGdpdmVuIGJ5IHRoZSBwYXlsb2FkLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gb1BheWxvYWQgVGhlIHBheWxvYWQgZGVmaW5lZCBieSB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSBvTWV0YU1vZGVsIFRoZSBPRGF0YU1ldGFNb2RlbCByZWNlaXZlZCBmcm9tIHRoZSBMaW5rXG4gKiBAcmV0dXJucyBBIG1vZGVsIGNvbnRhaW5pbmcgdGhlIHBheWxvYWQgaW5mb3JtYXRpb25cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY3NNb2RlbCA9IGZ1bmN0aW9uIChvUGF5bG9hZDogb2JqZWN0LCBvTWV0YU1vZGVsOiBvYmplY3QpIHtcblx0aWYgKG9NZXRhTW9kZWwpIHtcblx0XHRyZXR1cm4gbmV3IEpTT05Nb2RlbChvUGF5bG9hZCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxufTtcbi8qKlxuICogVGhpcyB3aWxsIHJldHVybiBhbiBhcnJheSBvZiB0aGUgU2VtYW50aWNPYmplY3RzIGFzIHN0cmluZ3MgZ2l2ZW4gYnkgdGhlIHBheWxvYWQuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBkZWZpbmVkIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9NZXRhTW9kZWwgVGhlIE9EYXRhTWV0YU1vZGVsIHJlY2VpdmVkIGZyb20gdGhlIExpbmtcbiAqIEByZXR1cm5zIEFuIGFycmF5IGNvbnRhaW5pbmcgU2VtYW50aWNPYmplY3RzIGJhc2VkIG9mIHRoZSBwYXlsb2FkXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0RGF0YUZpZWxkID0gZnVuY3Rpb24gKG9QYXlsb2FkOiBhbnksIG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdHJldHVybiBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG9QYXlsb2FkLmRhdGFGaWVsZCk7XG59O1xuLyoqXG4gKiBUaGlzIHdpbGwgcmV0dXJuIGFuIGFycmF5IG9mIHRoZSBTZW1hbnRpY09iamVjdHMgYXMgc3RyaW5ncyBnaXZlbiBieSB0aGUgcGF5bG9hZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBwYXlsb2FkIGRlZmluZWQgYnkgdGhlIGFwcGxpY2F0aW9uXG4gKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgT0RhdGFNZXRhTW9kZWwgcmVjZWl2ZWQgZnJvbSB0aGUgTGlua1xuICogQHJldHVybnMgQW5jb250YWluaW5nIFNlbWFudGljT2JqZWN0cyBiYXNlZCBvZiB0aGUgcGF5bG9hZFxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldENvbnRhY3QgPSBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSwgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpIHtcblx0cmV0dXJuIG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQob1BheWxvYWQuY29udGFjdCk7XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLmZuVGVtcGxhdGVGcmFnbWVudCA9IGZ1bmN0aW9uICgpIHtcblx0bGV0IHNGcmFnbWVudE5hbWU6IHN0cmluZywgdGl0bGVMaW5rSHJlZjtcblx0Y29uc3Qgb0ZyYWdtZW50TW9kZWw6IGFueSA9IHt9O1xuXHRsZXQgb1BheWxvYWRUb1VzZTtcblxuXHQvLyBwYXlsb2FkIGhhcyBiZWVuIG1vZGlmaWVkIGJ5IGZldGNoaW5nIFNlbWFudGljIE9iamVjdHMgbmFtZXMgd2l0aCBwYXRoXG5cdGlmICh0aGlzLnJlc29sdmVkcGF5bG9hZCkge1xuXHRcdG9QYXlsb2FkVG9Vc2UgPSB0aGlzLnJlc29sdmVkcGF5bG9hZDtcblx0fSBlbHNlIHtcblx0XHRvUGF5bG9hZFRvVXNlID0gdGhpcy5wYXlsb2FkO1xuXHR9XG5cblx0aWYgKG9QYXlsb2FkVG9Vc2UgJiYgIW9QYXlsb2FkVG9Vc2UuTGlua0lkKSB7XG5cdFx0b1BheWxvYWRUb1VzZS5MaW5rSWQgPSB0aGlzLm9Db250cm9sICYmIHRoaXMub0NvbnRyb2wuaXNBKENPTlNUQU5UUy5zYXB1aW1kY0xpbmspID8gdGhpcy5vQ29udHJvbC5nZXRJZCgpIDogdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKG9QYXlsb2FkVG9Vc2UuTGlua0lkKSB7XG5cdFx0dGl0bGVMaW5rSHJlZiA9IHRoaXMub0NvbnRyb2wuZ2V0TW9kZWwoXCIkc2FwdWltZGNMaW5rXCIpLmdldFByb3BlcnR5KFwiL3RpdGxlTGlua0hyZWZcIik7XG5cdFx0b1BheWxvYWRUb1VzZS50aXRsZWxpbmsgPSB0aXRsZUxpbmtIcmVmO1xuXHR9XG5cblx0Y29uc3Qgb1NlbWFudGljc01vZGVsID0gdGhpcy5fZ2V0U2VtYW50aWNzTW9kZWwob1BheWxvYWRUb1VzZSwgdGhpcy5vTWV0YU1vZGVsKTtcblx0dGhpcy5zZW1hbnRpY01vZGVsID0gb1NlbWFudGljc01vZGVsO1xuXG5cdGlmIChvUGF5bG9hZFRvVXNlLmVudGl0eVR5cGUgJiYgdGhpcy5fZ2V0RW50aXR5VHlwZShvUGF5bG9hZFRvVXNlLCB0aGlzLm9NZXRhTW9kZWwpKSB7XG5cdFx0c0ZyYWdtZW50TmFtZSA9IFwic2FwLmZlLm1hY3Jvcy5maWVsZC5RdWlja1ZpZXdMaW5rRm9yRW50aXR5XCI7XG5cdFx0b0ZyYWdtZW50TW9kZWwuYmluZGluZ0NvbnRleHRzID0ge1xuXHRcdFx0ZW50aXR5VHlwZTogdGhpcy5fZ2V0RW50aXR5VHlwZShvUGF5bG9hZFRvVXNlLCB0aGlzLm9NZXRhTW9kZWwpLFxuXHRcdFx0c2VtYW50aWM6IG9TZW1hbnRpY3NNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHR9O1xuXHRcdG9GcmFnbWVudE1vZGVsLm1vZGVscyA9IHtcblx0XHRcdGVudGl0eVR5cGU6IHRoaXMub01ldGFNb2RlbCxcblx0XHRcdHNlbWFudGljOiBvU2VtYW50aWNzTW9kZWxcblx0XHR9O1xuXHR9IGVsc2UgaWYgKG9QYXlsb2FkVG9Vc2UuZGF0YUZpZWxkICYmIHRoaXMuX2dldERhdGFGaWVsZChvUGF5bG9hZFRvVXNlLCB0aGlzLm9NZXRhTW9kZWwpKSB7XG5cdFx0c0ZyYWdtZW50TmFtZSA9IFwic2FwLmZlLm1hY3Jvcy5maWVsZC5RdWlja1ZpZXdMaW5rRm9yRGF0YUZpZWxkXCI7XG5cdFx0b0ZyYWdtZW50TW9kZWwuYmluZGluZ0NvbnRleHRzID0ge1xuXHRcdFx0ZGF0YUZpZWxkOiB0aGlzLl9nZXREYXRhRmllbGQob1BheWxvYWRUb1VzZSwgdGhpcy5vTWV0YU1vZGVsKSxcblx0XHRcdHNlbWFudGljOiBvU2VtYW50aWNzTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0fTtcblx0XHRvRnJhZ21lbnRNb2RlbC5tb2RlbHMgPSB7XG5cdFx0XHRkYXRhRmllbGQ6IHRoaXMub01ldGFNb2RlbCxcblx0XHRcdHNlbWFudGljOiBvU2VtYW50aWNzTW9kZWxcblx0XHR9O1xuXHR9IGVsc2UgaWYgKG9QYXlsb2FkVG9Vc2UuY29udGFjdCAmJiB0aGlzLl9nZXRDb250YWN0KG9QYXlsb2FkVG9Vc2UsIHRoaXMub01ldGFNb2RlbCkpIHtcblx0XHRzRnJhZ21lbnROYW1lID0gXCJzYXAuZmUubWFjcm9zLmZpZWxkLlF1aWNrVmlld0xpbmtGb3JDb250YWN0XCI7XG5cdFx0b0ZyYWdtZW50TW9kZWwuYmluZGluZ0NvbnRleHRzID0ge1xuXHRcdFx0Y29udGFjdDogdGhpcy5fZ2V0Q29udGFjdChvUGF5bG9hZFRvVXNlLCB0aGlzLm9NZXRhTW9kZWwpXG5cdFx0fTtcblx0XHRvRnJhZ21lbnRNb2RlbC5tb2RlbHMgPSB7XG5cdFx0XHRjb250YWN0OiB0aGlzLm9NZXRhTW9kZWxcblx0XHR9O1xuXHR9XG5cdG9GcmFnbWVudE1vZGVsLm1vZGVscy5lbnRpdHlTZXQgPSB0aGlzLm9NZXRhTW9kZWw7XG5cdG9GcmFnbWVudE1vZGVsLm1vZGVscy5tZXRhTW9kZWwgPSB0aGlzLm9NZXRhTW9kZWw7XG5cdGlmICh0aGlzLm9Db250cm9sICYmIHRoaXMub0NvbnRyb2wuZ2V0TW9kZWwoXCJ2aWV3RGF0YVwiKSkge1xuXHRcdG9GcmFnbWVudE1vZGVsLm1vZGVscy52aWV3RGF0YSA9IHRoaXMub0NvbnRyb2wuZ2V0TW9kZWwoXCJ2aWV3RGF0YVwiKTtcblx0XHRvRnJhZ21lbnRNb2RlbC5iaW5kaW5nQ29udGV4dHMudmlld0RhdGEgPSB0aGlzLm9Db250cm9sLmdldE1vZGVsKFwidmlld0RhdGFcIikuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpO1xuXHR9XG5cblx0Y29uc3Qgb0ZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUhLCBcImZyYWdtZW50XCIpO1xuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3Mob0ZyYWdtZW50LCB7IG5hbWU6IHNGcmFnbWVudE5hbWUhIH0sIG9GcmFnbWVudE1vZGVsKSlcblx0XHQudGhlbigoX2ludGVybmFsRnJhZ21lbnQ6IGFueSkgPT4ge1xuXHRcdFx0cmV0dXJuIEZyYWdtZW50LmxvYWQoe1xuXHRcdFx0XHRkZWZpbml0aW9uOiBfaW50ZXJuYWxGcmFnbWVudCxcblx0XHRcdFx0Y29udHJvbGxlcjogdGhpc1xuXHRcdFx0fSk7XG5cdFx0fSlcblx0XHQudGhlbigob1BvcG92ZXJDb250ZW50OiBhbnkpID0+IHtcblx0XHRcdGlmIChvUG9wb3ZlckNvbnRlbnQpIHtcblx0XHRcdFx0aWYgKG9GcmFnbWVudE1vZGVsLm1vZGVscyAmJiBvRnJhZ21lbnRNb2RlbC5tb2RlbHMuc2VtYW50aWMpIHtcblx0XHRcdFx0XHRvUG9wb3ZlckNvbnRlbnQuc2V0TW9kZWwob0ZyYWdtZW50TW9kZWwubW9kZWxzLnNlbWFudGljLCBcInNlbWFudGljXCIpO1xuXHRcdFx0XHRcdG9Qb3BvdmVyQ29udGVudC5zZXRCaW5kaW5nQ29udGV4dChvRnJhZ21lbnRNb2RlbC5iaW5kaW5nQ29udGV4dHMuc2VtYW50aWMsIFwic2VtYW50aWNcIik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpZiAob0ZyYWdtZW50TW9kZWwuYmluZGluZ0NvbnRleHRzICYmIG9GcmFnbWVudE1vZGVsLmJpbmRpbmdDb250ZXh0cy5lbnRpdHlUeXBlKSB7XG5cdFx0XHRcdFx0b1BvcG92ZXJDb250ZW50LnNldE1vZGVsKG9GcmFnbWVudE1vZGVsLm1vZGVscy5lbnRpdHlUeXBlLCBcImVudGl0eVR5cGVcIik7XG5cdFx0XHRcdFx0b1BvcG92ZXJDb250ZW50LnNldEJpbmRpbmdDb250ZXh0KG9GcmFnbWVudE1vZGVsLmJpbmRpbmdDb250ZXh0cy5lbnRpdHlUeXBlLCBcImVudGl0eVR5cGVcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHRoaXMucmVzb2x2ZWRwYXlsb2FkID0gdW5kZWZpbmVkO1xuXHRcdFx0cmV0dXJuIG9Qb3BvdmVyQ29udGVudDtcblx0XHR9KTtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuZmV0Y2hBZGRpdGlvbmFsQ29udGVudCA9IGZ1bmN0aW9uIChvUGF5TG9hZDogYW55LCBvTWRjTGlua0NvbnRyb2w6IGFueSkge1xuXHR0aGlzLm9Db250cm9sID0gb01kY0xpbmtDb250cm9sO1xuXHRjb25zdCBhTmF2aWdhdGVSZWdleHBNYXRjaCA9IG9QYXlMb2FkPy5uYXZpZ2F0aW9uUGF0aD8ubWF0Y2goL3soLio/KX0vKTtcblx0Y29uc3Qgb0JpbmRpbmdDb250ZXh0ID1cblx0XHRhTmF2aWdhdGVSZWdleHBNYXRjaCAmJiBhTmF2aWdhdGVSZWdleHBNYXRjaC5sZW5ndGggPiAxICYmIGFOYXZpZ2F0ZVJlZ2V4cE1hdGNoWzFdXG5cdFx0XHQ/IG9NZGNMaW5rQ29udHJvbC5nZXRNb2RlbCgpLmJpbmRDb250ZXh0KGFOYXZpZ2F0ZVJlZ2V4cE1hdGNoWzFdLCBvTWRjTGlua0NvbnRyb2wuZ2V0QmluZGluZ0NvbnRleHQoKSwgeyAkJG93blJlcXVlc3Q6IHRydWUgfSlcblx0XHRcdDogbnVsbDtcblx0dGhpcy5wYXlsb2FkID0gb1BheUxvYWQ7XG5cdGlmIChvTWRjTGlua0NvbnRyb2wgJiYgb01kY0xpbmtDb250cm9sLmlzQShDT05TVEFOVFMuc2FwdWltZGNMaW5rKSkge1xuXHRcdHRoaXMub01ldGFNb2RlbCA9IG9NZGNMaW5rQ29udHJvbC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdHJldHVybiB0aGlzLmZuVGVtcGxhdGVGcmFnbWVudCgpLnRoZW4oZnVuY3Rpb24gKG9Qb3BvdmVyQ29udGVudDogYW55KSB7XG5cdFx0XHRpZiAob0JpbmRpbmdDb250ZXh0KSB7XG5cdFx0XHRcdG9Qb3BvdmVyQ29udGVudC5zZXRCaW5kaW5nQ29udGV4dChvQmluZGluZ0NvbnRleHQuZ2V0Qm91bmRDb250ZXh0KCkpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFtvUG9wb3ZlckNvbnRlbnRdO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZmV0Y2hMaW5rQ3VzdG9tRGF0YSA9IGZ1bmN0aW9uIChfb0xpbms6IGFueSkge1xuXHRpZiAoXG5cdFx0X29MaW5rLmdldFBhcmVudCgpICYmXG5cdFx0X29MaW5rLmlzQShDT05TVEFOVFMuc2FwdWltZGNMaW5rKSAmJlxuXHRcdChfb0xpbmsuZ2V0UGFyZW50KCkuaXNBKENPTlNUQU5UUy5zYXBtTGluaykgfHxcblx0XHRcdF9vTGluay5nZXRQYXJlbnQoKS5pc0EoQ09OU1RBTlRTLnNhcG1PYmplY3RJZGVudGlmaWVyKSB8fFxuXHRcdFx0X29MaW5rLmdldFBhcmVudCgpLmlzQShDT05TVEFOVFMuc2FwbU9iamVjdFN0YXR1cykpXG5cdCkge1xuXHRcdHJldHVybiBfb0xpbmsuZ2V0Q3VzdG9tRGF0YSgpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG4vKipcbiAqIEZldGNoZXMgdGhlIHJlbGV2YW50IHtAbGluayBzYXAudWkubWRjLmxpbmsuTGlua0l0ZW19IGZvciB0aGUgTGluayBhbmQgcmV0dXJucyB0aGVtLlxuICpcbiAqIEBwdWJsaWNcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgUGF5bG9hZCBvZiB0aGUgTGluayBnaXZlbiBieSB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSBvQmluZGluZ0NvbnRleHQgVGhlIENvbnRleHRPYmplY3Qgb2YgdGhlIExpbmtcbiAqIEBwYXJhbSBvSW5mb0xvZyBUaGUgSW5mb0xvZyBvZiB0aGUgTGlua1xuICogQHJldHVybnMgT25jZSByZXNvbHZlZCBhbiBhcnJheSBvZiB7QGxpbmsgc2FwLnVpLm1kYy5saW5rLkxpbmtJdGVtfSBpcyByZXR1cm5lZFxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuZmV0Y2hMaW5rSXRlbXMgPSBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSwgb0JpbmRpbmdDb250ZXh0OiBDb250ZXh0LCBvSW5mb0xvZzogYW55KSB7XG5cdGlmIChvQmluZGluZ0NvbnRleHQgJiYgU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdHMob1BheWxvYWQpKSB7XG5cdFx0Y29uc3Qgb0NvbnRleHRPYmplY3QgPSBvQmluZGluZ0NvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0aWYgKG9JbmZvTG9nKSB7XG5cdFx0XHRvSW5mb0xvZy5pbml0aWFsaXplKFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0U2VtYW50aWNPYmplY3RzKG9QYXlsb2FkKSk7XG5cdFx0fVxuXHRcdGNvbnN0IF9vTGlua0N1c3RvbURhdGEgPSB0aGlzLl9saW5rICYmIHRoaXMuX2ZldGNoTGlua0N1c3RvbURhdGEodGhpcy5fbGluayk7XG5cdFx0dGhpcy5hTGlua0N1c3RvbURhdGEgPVxuXHRcdFx0X29MaW5rQ3VzdG9tRGF0YSAmJlxuXHRcdFx0dGhpcy5fZmV0Y2hMaW5rQ3VzdG9tRGF0YSh0aGlzLl9saW5rKS5tYXAoZnVuY3Rpb24gKGxpbmtJdGVtOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIGxpbmtJdGVtLm1Qcm9wZXJ0aWVzLnZhbHVlO1xuXHRcdFx0fSk7XG5cblx0XHRjb25zdCBvU2VtYW50aWNBdHRyaWJ1dGVzUmVzb2x2ZWQgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2NhbGN1bGF0ZVNlbWFudGljQXR0cmlidXRlcyhvQ29udGV4dE9iamVjdCwgb1BheWxvYWQsIG9JbmZvTG9nLCB0aGlzLl9saW5rKTtcblx0XHRjb25zdCBvU2VtYW50aWNBdHRyaWJ1dGVzID0gb1NlbWFudGljQXR0cmlidXRlc1Jlc29sdmVkLnJlc3VsdHM7XG5cdFx0Y29uc3Qgb1BheWxvYWRSZXNvbHZlZCA9IG9TZW1hbnRpY0F0dHJpYnV0ZXNSZXNvbHZlZC5wYXlsb2FkO1xuXG5cdFx0cmV0dXJuIFNpbXBsZUxpbmtEZWxlZ2F0ZS5fcmV0cmlldmVOYXZpZ2F0aW9uVGFyZ2V0cyhcIlwiLCBvU2VtYW50aWNBdHRyaWJ1dGVzLCBvUGF5bG9hZFJlc29sdmVkLCBvSW5mb0xvZywgdGhpcy5fbGluaykudGhlbihcblx0XHRcdGZ1bmN0aW9uIChhTGlua3M6IGFueSAvKm9Pd25OYXZpZ2F0aW9uTGluazogYW55Ki8pIHtcblx0XHRcdFx0cmV0dXJuIGFMaW5rcy5sZW5ndGggPT09IDAgPyBudWxsIDogYUxpbmtzO1xuXHRcdFx0fVxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0fVxufTtcblxuLyoqXG4gKiBGaW5kIHRoZSB0eXBlIG9mIHRoZSBsaW5rLlxuICpcbiAqIEBwYXJhbSBwYXlsb2FkIFRoZSBwYXlsb2FkIG9mIHRoZSBtZGMgbGluay5cbiAqIEBwYXJhbSBhTGlua0l0ZW1zIExpbmtzIHJldHVybmVkIGJ5IGNhbGwgdG8gbWRjIF9yZXRyaWV2ZVVubW9kaWZpZWRMaW5rSXRlbXMuXG4gKiBAcmV0dXJucyBUaGUgdHlwZSBvZiB0aGUgbGluayBhcyBkZWZpbmVkIGJ5IG1kYy5cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9maW5kTGlua1R5cGUgPSBmdW5jdGlvbiAocGF5bG9hZDogYW55LCBhTGlua0l0ZW1zOiBhbnlbXSk6IGFueSB7XG5cdGxldCBuTGlua1R5cGUsIG9MaW5rSXRlbTtcblx0aWYgKGFMaW5rSXRlbXM/Lmxlbmd0aCA9PT0gMSkge1xuXHRcdG9MaW5rSXRlbSA9IG5ldyBMaW5rSXRlbSh7XG5cdFx0XHR0ZXh0OiBhTGlua0l0ZW1zWzBdLmdldFRleHQoKSxcblx0XHRcdGhyZWY6IGFMaW5rSXRlbXNbMF0uZ2V0SHJlZigpXG5cdFx0fSk7XG5cdFx0bkxpbmtUeXBlID0gcGF5bG9hZC5oYXNRdWlja1ZpZXdGYWNldHMgPT09IFwiZmFsc2VcIiA/IDEgOiAyO1xuXHR9IGVsc2UgaWYgKHBheWxvYWQuaGFzUXVpY2tWaWV3RmFjZXRzID09PSBcImZhbHNlXCIgJiYgYUxpbmtJdGVtcz8ubGVuZ3RoID09PSAwKSB7XG5cdFx0bkxpbmtUeXBlID0gMDtcblx0fSBlbHNlIHtcblx0XHRuTGlua1R5cGUgPSAyO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0bGlua1R5cGU6IG5MaW5rVHlwZSxcblx0XHRsaW5rSXRlbTogb0xpbmtJdGVtXG5cdH07XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLmZldGNoTGlua1R5cGUgPSBhc3luYyBmdW5jdGlvbiAob1BheWxvYWQ6IGFueSwgb0xpbms6IGFueSkge1xuXHRjb25zdCBfb0N1cnJlbnRMaW5rID0gb0xpbms7XG5cdGNvbnN0IF9vUGF5bG9hZCA9IE9iamVjdC5hc3NpZ24oe30sIG9QYXlsb2FkKTtcblx0Y29uc3Qgb0RlZmF1bHRJbml0aWFsVHlwZSA9IHtcblx0XHRpbml0aWFsVHlwZToge1xuXHRcdFx0dHlwZTogMixcblx0XHRcdGRpcmVjdExpbms6IHVuZGVmaW5lZFxuXHRcdH0sXG5cdFx0cnVudGltZVR5cGU6IHVuZGVmaW5lZFxuXHR9O1xuXHQvLyBjbGVhbiBhcHBTdGF0ZUtleU1hcCBzdG9yYWdlXG5cdGlmICghdGhpcy5hcHBTdGF0ZUtleU1hcCkge1xuXHRcdHRoaXMuYXBwU3RhdGVLZXlNYXAgPSB7fTtcblx0fVxuXG5cdHRyeSB7XG5cdFx0aWYgKF9vUGF5bG9hZD8uc2VtYW50aWNPYmplY3RzKSB7XG5cdFx0XHR0aGlzLl9saW5rID0gb0xpbms7XG5cdFx0XHRsZXQgYUxpbmtJdGVtcyA9IGF3YWl0IF9vQ3VycmVudExpbmsuX3JldHJpZXZlVW5tb2RpZmllZExpbmtJdGVtcygpO1xuXHRcdFx0aWYgKGFMaW5rSXRlbXMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdC8vIFRoaXMgaXMgdGhlIGRpcmVjdCBuYXZpZ2F0aW9uIHVzZSBjYXNlIHNvIHdlIG5lZWQgdG8gcGVyZm9ybSB0aGUgYXBwcm9wcmlhdGUgY2hlY2tzIC8gdHJhbnNmb3JtYXRpb25zXG5cdFx0XHRcdGFMaW5rSXRlbXMgPSBhd2FpdCBfb0N1cnJlbnRMaW5rLnJldHJpZXZlTGlua0l0ZW1zKCk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBfTGlua1R5cGUgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2ZpbmRMaW5rVHlwZShfb1BheWxvYWQsIGFMaW5rSXRlbXMpO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0aW5pdGlhbFR5cGU6IHtcblx0XHRcdFx0XHR0eXBlOiBfTGlua1R5cGUubGlua1R5cGUsXG5cdFx0XHRcdFx0ZGlyZWN0TGluazogX0xpbmtUeXBlLmxpbmtJdGVtID8gX0xpbmtUeXBlLmxpbmtJdGVtIDogdW5kZWZpbmVkXG5cdFx0XHRcdH0sXG5cdFx0XHRcdHJ1bnRpbWVUeXBlOiB1bmRlZmluZWRcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChfb1BheWxvYWQ/LmNvbnRhY3Q/Lmxlbmd0aCA+IDApIHtcblx0XHRcdHJldHVybiBvRGVmYXVsdEluaXRpYWxUeXBlO1xuXHRcdH0gZWxzZSBpZiAoX29QYXlsb2FkPy5lbnRpdHlUeXBlICYmIF9vUGF5bG9hZD8ubmF2aWdhdGlvblBhdGgpIHtcblx0XHRcdHJldHVybiBvRGVmYXVsdEluaXRpYWxUeXBlO1xuXHRcdH1cblx0XHR0aHJvdyBuZXcgRXJyb3IoXCJubyBwYXlsb2FkIG9yIHNlbWFudGljT2JqZWN0cyBmb3VuZFwiKTtcblx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRMb2cuZXJyb3IoXCJFcnJvciBpbiBTaW1wbGVMaW5rRGVsZWdhdGUuZmV0Y2hMaW5rVHlwZTogXCIsIG9FcnJvcik7XG5cdH1cbn07XG5cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fUmVtb3ZlVGl0bGVMaW5rRnJvbVRhcmdldHMgPSBmdW5jdGlvbiAoX2FMaW5rSXRlbXM6IGFueVtdLCBfYlRpdGxlSGFzTGluazogYm9vbGVhbiwgX2FUaXRsZUxpbms6IGFueSk6IGFueSB7XG5cdGxldCBfc1RpdGxlTGlua0hyZWYsIF9vTURDTGluaztcblx0bGV0IGJSZXN1bHQ6IGJvb2xlYW4gPSBmYWxzZTtcblx0aWYgKF9iVGl0bGVIYXNMaW5rICYmIF9hVGl0bGVMaW5rICYmIF9hVGl0bGVMaW5rWzBdKSB7XG5cdFx0bGV0IGxpbmtJc1ByaW1hcnlBY3Rpb246IGJvb2xlYW4sIF9zTGlua0ludGVudFdpdGhvdXRQYXJhbWV0ZXJzOiBzdHJpbmc7XG5cdFx0Y29uc3QgX3NUaXRsZUludGVudCA9IF9hVGl0bGVMaW5rWzBdLmludGVudC5zcGxpdChcIj9cIilbMF07XG5cdFx0aWYgKF9hTGlua0l0ZW1zICYmIF9hTGlua0l0ZW1zWzBdKSB7XG5cdFx0XHRfc0xpbmtJbnRlbnRXaXRob3V0UGFyYW1ldGVycyA9IGAjJHtfYUxpbmtJdGVtc1swXS5nZXRQcm9wZXJ0eShcImtleVwiKX1gO1xuXHRcdFx0bGlua0lzUHJpbWFyeUFjdGlvbiA9IF9zVGl0bGVJbnRlbnQgPT09IF9zTGlua0ludGVudFdpdGhvdXRQYXJhbWV0ZXJzO1xuXHRcdFx0aWYgKGxpbmtJc1ByaW1hcnlBY3Rpb24pIHtcblx0XHRcdFx0X3NUaXRsZUxpbmtIcmVmID0gX2FMaW5rSXRlbXNbMF0uZ2V0UHJvcGVydHkoXCJocmVmXCIpO1xuXHRcdFx0XHR0aGlzLnBheWxvYWQudGl0bGVsaW5raHJlZiA9IF9zVGl0bGVMaW5rSHJlZjtcblx0XHRcdFx0aWYgKF9hTGlua0l0ZW1zWzBdLmlzQShDT05TVEFOVFMuc2FwdWltZGNsaW5rTGlua0l0ZW0pKSB7XG5cdFx0XHRcdFx0X29NRENMaW5rID0gX2FMaW5rSXRlbXNbMF0uZ2V0UGFyZW50KCk7XG5cdFx0XHRcdFx0X29NRENMaW5rLmdldE1vZGVsKFwiJHNhcHVpbWRjTGlua1wiKS5zZXRQcm9wZXJ0eShcIi90aXRsZUxpbmtIcmVmXCIsIF9zVGl0bGVMaW5rSHJlZik7XG5cdFx0XHRcdFx0Y29uc3QgYU1MaW5rSXRlbXMgPSBfb01EQ0xpbmtcblx0XHRcdFx0XHRcdC5nZXRNb2RlbChcIiRzYXB1aW1kY0xpbmtcIilcblx0XHRcdFx0XHRcdC5nZXRQcm9wZXJ0eShcIi9saW5rSXRlbXNcIilcblx0XHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9MaW5rSXRlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdGlmIChgIyR7b0xpbmtJdGVtLmtleX1gICE9PSBfc0xpbmtJbnRlbnRXaXRob3V0UGFyYW1ldGVycykge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvTGlua0l0ZW07XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdGlmIChhTUxpbmtJdGVtcyAmJiBhTUxpbmtJdGVtcy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdFx0XHRfb01EQ0xpbmsuZ2V0TW9kZWwoXCIkc2FwdWltZGNMaW5rXCIpLnNldFByb3BlcnR5KFwiL2xpbmtJdGVtcy9cIiwgYU1MaW5rSXRlbXMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRiUmVzdWx0ID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gYlJlc3VsdDtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuX0lzU2VtYW50aWNPYmplY3REeW5hbWljID0gZnVuY3Rpb24gKGFOZXdMaW5rQ3VzdG9tRGF0YTogYW55LCBvVGhpczogYW55KSB7XG5cdGlmIChhTmV3TGlua0N1c3RvbURhdGEgJiYgb1RoaXMuYUxpbmtDdXN0b21EYXRhKSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdG9UaGlzLmFMaW5rQ3VzdG9tRGF0YS5maWx0ZXIoZnVuY3Rpb24gKGxpbms6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdGFOZXdMaW5rQ3VzdG9tRGF0YS5maWx0ZXIoZnVuY3Rpb24gKG90aGVyTGluazogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb3RoZXJMaW5rICE9PSBsaW5rO1xuXHRcdFx0XHRcdH0pLmxlbmd0aCA+IDBcblx0XHRcdFx0KTtcblx0XHRcdH0pLmxlbmd0aCA+IDBcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0TGluZUNvbnRleHQgPSBmdW5jdGlvbiAob1ZpZXc6IGFueSwgbUxpbmVDb250ZXh0OiBhbnkpIHtcblx0aWYgKCFtTGluZUNvbnRleHQpIHtcblx0XHRpZiAob1ZpZXcuZ2V0QWdncmVnYXRpb24oXCJjb250ZW50XCIpWzBdICYmIG9WaWV3LmdldEFnZ3JlZ2F0aW9uKFwiY29udGVudFwiKVswXS5nZXRCaW5kaW5nQ29udGV4dCgpKSB7XG5cdFx0XHRyZXR1cm4gb1ZpZXcuZ2V0QWdncmVnYXRpb24oXCJjb250ZW50XCIpWzBdLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBtTGluZUNvbnRleHQ7XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLl9zZXRGaWx0ZXJDb250ZXh0VXJsRm9yU2VsZWN0aW9uVmFyaWFudCA9IGZ1bmN0aW9uIChcblx0b1ZpZXc6IGFueSxcblx0b1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsXG5cdG9OYXZpZ2F0aW9uU2VydmljZTogYW55XG4pOiBTZWxlY3Rpb25WYXJpYW50IHtcblx0aWYgKG9WaWV3LmdldFZpZXdEYXRhKCkuZW50aXR5U2V0ICYmIG9TZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0Y29uc3Qgc0NvbnRleHRVcmwgPSBvTmF2aWdhdGlvblNlcnZpY2UuY29uc3RydWN0Q29udGV4dFVybChvVmlldy5nZXRWaWV3RGF0YSgpLmVudGl0eVNldCwgb1ZpZXcuZ2V0TW9kZWwoKSk7XG5cdFx0b1NlbGVjdGlvblZhcmlhbnQuc2V0RmlsdGVyQ29udGV4dFVybChzQ29udGV4dFVybCk7XG5cdH1cblx0cmV0dXJuIG9TZWxlY3Rpb25WYXJpYW50O1xufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl9zZXRPYmplY3RNYXBwaW5ncyA9IGZ1bmN0aW9uIChcblx0c1NlbWFudGljT2JqZWN0OiBzdHJpbmcsXG5cdG9QYXJhbXM6IGFueSxcblx0YVNlbWFudGljT2JqZWN0TWFwcGluZ3M6IFJlZ2lzdGVyZWRTZW1hbnRpY09iamVjdE1hcHBpbmdzLFxuXHRvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudFxuKSB7XG5cdGxldCBoYXNDaGFuZ2VkID0gZmFsc2U7XG5cdGNvbnN0IG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudCA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KG9TZWxlY3Rpb25WYXJpYW50LnRvSlNPTk9iamVjdCgpKTtcblx0Ly8gaWYgc2VtYW50aWNPYmplY3RNYXBwaW5ncyBoYXMgaXRlbXMgd2l0aCBkeW5hbWljIHNlbWFudGljT2JqZWN0cyB3ZSBuZWVkIHRvIHJlc29sdmUgdGhlbSB1c2luZyBvUGFyYW1zXG5cdGFTZW1hbnRpY09iamVjdE1hcHBpbmdzLmZvckVhY2goZnVuY3Rpb24gKG1hcHBpbmcpIHtcblx0XHRsZXQgbWFwcGluZ1NlbWFudGljT2JqZWN0ID0gbWFwcGluZy5zZW1hbnRpY09iamVjdDtcblx0XHRjb25zdCBtYXBwaW5nU2VtYW50aWNPYmplY3RQYXRoID0gZ2V0RHluYW1pY1BhdGhGcm9tU2VtYW50aWNPYmplY3QobWFwcGluZy5zZW1hbnRpY09iamVjdCk7XG5cdFx0aWYgKG1hcHBpbmdTZW1hbnRpY09iamVjdFBhdGggJiYgb1BhcmFtc1ttYXBwaW5nU2VtYW50aWNPYmplY3RQYXRoXSkge1xuXHRcdFx0bWFwcGluZ1NlbWFudGljT2JqZWN0ID0gb1BhcmFtc1ttYXBwaW5nU2VtYW50aWNPYmplY3RQYXRoXTtcblx0XHR9XG5cdFx0aWYgKHNTZW1hbnRpY09iamVjdCA9PT0gbWFwcGluZ1NlbWFudGljT2JqZWN0KSB7XG5cdFx0XHRjb25zdCBvTWFwcGluZ3MgPSBtYXBwaW5nLml0ZW1zO1xuXHRcdFx0Zm9yIChjb25zdCBpIGluIG9NYXBwaW5ncykge1xuXHRcdFx0XHRjb25zdCBzTG9jYWxQcm9wZXJ0eSA9IG9NYXBwaW5nc1tpXS5rZXk7XG5cdFx0XHRcdGNvbnN0IHNTZW1hbnRpY09iamVjdFByb3BlcnR5ID0gb01hcHBpbmdzW2ldLnZhbHVlO1xuXHRcdFx0XHRpZiAoc0xvY2FsUHJvcGVydHkgIT09IHNTZW1hbnRpY09iamVjdFByb3BlcnR5KSB7XG5cdFx0XHRcdFx0aWYgKG9QYXJhbXNbc0xvY2FsUHJvcGVydHldKSB7XG5cdFx0XHRcdFx0XHRtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQucmVtb3ZlUGFyYW1ldGVyKHNTZW1hbnRpY09iamVjdFByb3BlcnR5KTtcblx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbmFtZVBhcmFtZXRlcihzTG9jYWxQcm9wZXJ0eSwgc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbmFtZVNlbGVjdE9wdGlvbihzTG9jYWxQcm9wZXJ0eSwgc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0b1BhcmFtc1tzU2VtYW50aWNPYmplY3RQcm9wZXJ0eV0gPSBvUGFyYW1zW3NMb2NhbFByb3BlcnR5XTtcblx0XHRcdFx0XHRcdGRlbGV0ZSBvUGFyYW1zW3NMb2NhbFByb3BlcnR5XTtcblx0XHRcdFx0XHRcdGhhc0NoYW5nZWQgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBXZSByZW1vdmUgdGhlIHBhcmFtZXRlciBhcyB0aGVyZSBpcyBubyB2YWx1ZVxuXG5cdFx0XHRcdFx0Ly8gVGhlIGxvY2FsIHByb3BlcnR5IGNvbWVzIGZyb20gYSBuYXZpZ2F0aW9uIHByb3BlcnR5XG5cdFx0XHRcdFx0ZWxzZSBpZiAoc0xvY2FsUHJvcGVydHkuc3BsaXQoXCIvXCIpLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdC8vIGZpbmQgdGhlIHByb3BlcnR5IHRvIGJlIHJlbW92ZWRcblx0XHRcdFx0XHRcdGNvbnN0IHByb3BlcnR5VG9CZVJlbW92ZWQgPSBzTG9jYWxQcm9wZXJ0eS5zcGxpdChcIi9cIikuc2xpY2UoLTEpWzBdO1xuXHRcdFx0XHRcdFx0Ly8gVGhlIG5hdmlnYXRpb24gcHJvcGVydHkgaGFzIG5vIHZhbHVlXG5cdFx0XHRcdFx0XHRpZiAoIW9QYXJhbXNbcHJvcGVydHlUb0JlUmVtb3ZlZF0pIHtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIG9QYXJhbXNbcHJvcGVydHlUb0JlUmVtb3ZlZF07XG5cdFx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVQYXJhbWV0ZXIocHJvcGVydHlUb0JlUmVtb3ZlZCk7XG5cdFx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24ocHJvcGVydHlUb0JlUmVtb3ZlZCk7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHByb3BlcnR5VG9CZVJlbW92ZWQgIT09IHNTZW1hbnRpY09iamVjdFByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdC8vIFRoZSBuYXZpZ2F0aW9uIHByb3BlcnR5IGhhcyBhIHZhbHVlIGFuZCBwcm9wZXJ0aWVzIG5hbWVzIGFyZSBkaWZmZXJlbnRcblx0XHRcdFx0XHRcdFx0bW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50LnJlbmFtZVBhcmFtZXRlcihwcm9wZXJ0eVRvQmVSZW1vdmVkLCBzU2VtYW50aWNPYmplY3RQcm9wZXJ0eSk7XG5cdFx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW5hbWVTZWxlY3RPcHRpb24ocHJvcGVydHlUb0JlUmVtb3ZlZCwgc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0XHRvUGFyYW1zW3NTZW1hbnRpY09iamVjdFByb3BlcnR5XSA9IG9QYXJhbXNbcHJvcGVydHlUb0JlUmVtb3ZlZF07XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBvUGFyYW1zW3Byb3BlcnR5VG9CZVJlbW92ZWRdO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRkZWxldGUgb1BhcmFtc1tzTG9jYWxQcm9wZXJ0eV07XG5cdFx0XHRcdFx0XHRtb2RpZmllZFNlbGVjdGlvblZhcmlhbnQucmVtb3ZlUGFyYW1ldGVyKHNTZW1hbnRpY09iamVjdFByb3BlcnR5KTtcblx0XHRcdFx0XHRcdG1vZGlmaWVkU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oc1NlbWFudGljT2JqZWN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdHJldHVybiB7IHBhcmFtczogb1BhcmFtcywgaGFzQ2hhbmdlZCwgc2VsZWN0aW9uVmFyaWFudDogbW9kaWZpZWRTZWxlY3Rpb25WYXJpYW50IH07XG59O1xuXG4vKipcbiAqIENhbGwgZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzIGluIG5hdmlnYXRpb24gc2VydmljZSBhbmQgY2FjaGUgaXRzIHJlc3VsdHMuXG4gKlxuICogQHBhcmFtIF90aGlzIFRoZSBpbnN0YW5jZSBvZiBxdWlja3ZpZXdkZWxlZ2F0ZS5cbiAqIEBwYXJhbSBuYXZpZ2F0aW9uU2VydmljZSBUaGUgbmF2aWdhdGlvbiBzZXJ2aWNlLlxuICogQHBhcmFtIHNlbGVjdGlvblZhcmlhbnQgVGhlIGN1cnJlbnQgc2VsZWN0aW9uIHZhcmlhbnQuXG4gKiBAcGFyYW0gc2VtYW50aWNPYmplY3QgVGhlIGN1cnJlbnQgc2VtYW50aWNPYmplY3QuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzID0gYXN5bmMgZnVuY3Rpb24gKFxuXHRfdGhpczogdHlwZW9mIFNpbXBsZUxpbmtEZWxlZ2F0ZSxcblx0bmF2aWdhdGlvblNlcnZpY2U6IGFueSxcblx0c2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCxcblx0c2VtYW50aWNPYmplY3Q6IHN0cmluZ1xuKTogUHJvbWlzZTxzdHJpbmdbXT4ge1xuXHRsZXQgYVZhbHVlcyA9IFtdO1xuXG5cdC8vIGNoZWNrIGlmIGRlZmF1bHQgY2FjaGUgY29udGFpbnMgYWxyZWFkeSB0aGUgdW5tb2RpZmllZCBzZWxlY3Rpb25WYXJpYW50XG5cdGlmIChkZWVwRXF1YWwoc2VsZWN0aW9uVmFyaWFudCwgX3RoaXMuYXBwU3RhdGVLZXlNYXBbXCJcIl0/LnNlbGVjdGlvblZhcmlhbnQpKSB7XG5cdFx0Y29uc3QgZGVmYXVsdENhY2hlID0gX3RoaXMuYXBwU3RhdGVLZXlNYXBbXCJcIl07XG5cdFx0cmV0dXJuIFtkZWZhdWx0Q2FjaGUuc2VtYW50aWNBdHRyaWJ1dGVzLCBkZWZhdWx0Q2FjaGUuYXBwc3RhdGVrZXldO1xuXHR9XG5cdC8vIHVwZGF0ZSB1cmwgcGFyYW1ldGVycyBiZWNhdXNlIHRoZXJlIGlzIGEgY2hhbmdlIGluIHNlbGVjdGlvbiB2YXJpYW50XG5cdGlmIChcblx0XHRfdGhpcy5hcHBTdGF0ZUtleU1hcFtgJHtzZW1hbnRpY09iamVjdH1gXSA9PT0gdW5kZWZpbmVkIHx8XG5cdFx0IWRlZXBFcXVhbChfdGhpcy5hcHBTdGF0ZUtleU1hcFtgJHtzZW1hbnRpY09iamVjdH1gXS5zZWxlY3Rpb25WYXJpYW50LCBzZWxlY3Rpb25WYXJpYW50KVxuXHQpIHtcblx0XHRhVmFsdWVzID0gYXdhaXQgdG9FUzZQcm9taXNlKG5hdmlnYXRpb25TZXJ2aWNlLmdldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyhzZWxlY3Rpb25WYXJpYW50LnRvSlNPTlN0cmluZygpKSk7XG5cdFx0X3RoaXMuYXBwU3RhdGVLZXlNYXBbYCR7c2VtYW50aWNPYmplY3R9YF0gPSB7XG5cdFx0XHRzZW1hbnRpY0F0dHJpYnV0ZXM6IGFWYWx1ZXNbMF0sXG5cdFx0XHRhcHBzdGF0ZWtleTogYVZhbHVlc1sxXSxcblx0XHRcdHNlbGVjdGlvblZhcmlhbnQ6IHNlbGVjdGlvblZhcmlhbnRcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdGNvbnN0IGNhY2hlID0gX3RoaXMuYXBwU3RhdGVLZXlNYXBbYCR7c2VtYW50aWNPYmplY3R9YF07XG5cdFx0YVZhbHVlcyA9IFtjYWNoZS5zZW1hbnRpY0F0dHJpYnV0ZXMsIGNhY2hlLmFwcHN0YXRla2V5XTtcblx0fVxuXHRyZXR1cm4gYVZhbHVlcztcbn07XG5cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0TGlua0l0ZW1XaXRoTmV3UGFyYW1ldGVyID0gYXN5bmMgZnVuY3Rpb24gKFxuXHRfdGhhdDogYW55LFxuXHRfYlRpdGxlSGFzTGluazogYm9vbGVhbixcblx0X2FUaXRsZUxpbms6IHN0cmluZ1tdLFxuXHRfb0xpbmtJdGVtOiBhbnksXG5cdF9vU2hlbGxTZXJ2aWNlczogYW55LFxuXHRfb1BheWxvYWQ6IGFueSxcblx0X29QYXJhbXM6IGFueSxcblx0X3NBcHBTdGF0ZUtleTogc3RyaW5nLFxuXHRfb1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsXG5cdF9vTmF2aWdhdGlvblNlcnZpY2U6IE5hdmlnYXRpb25TZXJ2aWNlXG4pOiBQcm9taXNlPGFueT4ge1xuXHRyZXR1cm4gX29TaGVsbFNlcnZpY2VzLmV4cGFuZENvbXBhY3RIYXNoKF9vTGlua0l0ZW0uZ2V0SHJlZigpKS50aGVuKGFzeW5jIGZ1bmN0aW9uIChzSGFzaDogYW55KSB7XG5cdFx0Y29uc3Qgb1NoZWxsSGFzaCA9IF9vU2hlbGxTZXJ2aWNlcy5wYXJzZVNoZWxsSGFzaChzSGFzaCk7XG5cdFx0Y29uc3QgcGFyYW1zID0gT2JqZWN0LmFzc2lnbih7fSwgX29QYXJhbXMpO1xuXHRcdGNvbnN0IHtcblx0XHRcdHBhcmFtczogb05ld1BhcmFtcyxcblx0XHRcdGhhc0NoYW5nZWQsXG5cdFx0XHRzZWxlY3Rpb25WYXJpYW50OiBuZXdTZWxlY3Rpb25WYXJpYW50XG5cdFx0fSA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fc2V0T2JqZWN0TWFwcGluZ3Mob1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdCwgcGFyYW1zLCBfb1BheWxvYWQuc2VtYW50aWNPYmplY3RNYXBwaW5ncywgX29TZWxlY3Rpb25WYXJpYW50KTtcblx0XHRpZiAoaGFzQ2hhbmdlZCkge1xuXHRcdFx0Y29uc3QgYVZhbHVlcyA9IGF3YWl0IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzKFxuXHRcdFx0XHRfdGhhdCxcblx0XHRcdFx0X29OYXZpZ2F0aW9uU2VydmljZSxcblx0XHRcdFx0bmV3U2VsZWN0aW9uVmFyaWFudCxcblx0XHRcdFx0b1NoZWxsSGFzaC5zZW1hbnRpY09iamVjdFxuXHRcdFx0KTtcblxuXHRcdFx0X3NBcHBTdGF0ZUtleSA9IGFWYWx1ZXNbMV07XG5cdFx0fVxuXHRcdGNvbnN0IG9OZXdTaGVsbEhhc2ggPSB7XG5cdFx0XHR0YXJnZXQ6IHtcblx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG9TaGVsbEhhc2guc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdGFjdGlvbjogb1NoZWxsSGFzaC5hY3Rpb25cblx0XHRcdH0sXG5cdFx0XHRwYXJhbXM6IG9OZXdQYXJhbXMsXG5cdFx0XHRhcHBTdGF0ZUtleTogX3NBcHBTdGF0ZUtleVxuXHRcdH07XG5cdFx0ZGVsZXRlIG9OZXdTaGVsbEhhc2gucGFyYW1zW1wic2FwLXhhcHAtc3RhdGVcIl07XG5cdFx0X29MaW5rSXRlbS5zZXRIcmVmKGAjJHtfb1NoZWxsU2VydmljZXMuY29uc3RydWN0U2hlbGxIYXNoKG9OZXdTaGVsbEhhc2gpfWApO1xuXHRcdF9vUGF5bG9hZC5hU2VtYW50aWNMaW5rcy5wdXNoKF9vTGlua0l0ZW0uZ2V0SHJlZigpKTtcblx0XHQvLyBUaGUgbGluayBpcyByZW1vdmVkIGZyb20gdGhlIHRhcmdldCBsaXN0IGJlY2F1c2UgdGhlIHRpdGxlIGxpbmsgaGFzIHNhbWUgdGFyZ2V0LlxuXHRcdHJldHVybiBTaW1wbGVMaW5rRGVsZWdhdGUuX1JlbW92ZVRpdGxlTGlua0Zyb21UYXJnZXRzLmJpbmQoX3RoYXQpKFtfb0xpbmtJdGVtXSwgX2JUaXRsZUhhc0xpbmssIF9hVGl0bGVMaW5rKTtcblx0fSk7XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLl9yZW1vdmVFbXB0eUxpbmtJdGVtID0gZnVuY3Rpb24gKGFMaW5rSXRlbXM6IGFueSk6IGFueVtdIHtcblx0cmV0dXJuIGFMaW5rSXRlbXMuZmlsdGVyKChsaW5rSXRlbTogYW55KSA9PiB7XG5cdFx0cmV0dXJuIGxpbmtJdGVtICE9PSB1bmRlZmluZWQ7XG5cdH0pO1xufTtcbi8qKlxuICogRW5hYmxlcyB0aGUgbW9kaWZpY2F0aW9uIG9mIExpbmtJdGVtcyBiZWZvcmUgdGhlIHBvcG92ZXIgb3BlbnMuIFRoaXMgZW5hYmxlcyBhZGRpdGlvbmFsIHBhcmFtZXRlcnNcbiAqIHRvIGJlIGFkZGVkIHRvIHRoZSBsaW5rLlxuICpcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBvZiB0aGUgTGluayBnaXZlbiBieSB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSBvQmluZGluZ0NvbnRleHQgVGhlIGJpbmRpbmcgY29udGV4dCBvZiB0aGUgTGlua1xuICogQHBhcmFtIGFMaW5rSXRlbXMgVGhlIExpbmtJdGVtcyBvZiB0aGUgTGluayB0aGF0IGNhbiBiZSBtb2RpZmllZFxuICogQHJldHVybnMgT25jZSByZXNvbHZlZCBhbiBhcnJheSBvZiB7QGxpbmsgc2FwLnVpLm1kYy5saW5rLkxpbmtJdGVtfSBpcyByZXR1cm5lZFxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUubW9kaWZ5TGlua0l0ZW1zID0gYXN5bmMgZnVuY3Rpb24gKG9QYXlsb2FkOiBhbnksIG9CaW5kaW5nQ29udGV4dDogQ29udGV4dCwgYUxpbmtJdGVtczogYW55KSB7XG5cdGNvbnN0IHByaW1hcnlBY3Rpb25Jc0FjdGl2ZSA9IChhd2FpdCBGaWVsZEhlbHBlci5jaGVja1ByaW1hcnlBY3Rpb25zKG9QYXlsb2FkLCB0cnVlKSkgYXMgYW55O1xuXHRjb25zdCBhVGl0bGVMaW5rID0gcHJpbWFyeUFjdGlvbklzQWN0aXZlLnRpdGxlTGluaztcblx0Y29uc3QgYlRpdGxlSGFzTGluazogYm9vbGVhbiA9IHByaW1hcnlBY3Rpb25Jc0FjdGl2ZS5oYXNUaXRsZUxpbms7XG5cdGlmIChhTGlua0l0ZW1zLmxlbmd0aCAhPT0gMCkge1xuXHRcdHRoaXMucGF5bG9hZCA9IG9QYXlsb2FkO1xuXHRcdGNvbnN0IG9MaW5rID0gYUxpbmtJdGVtc1swXS5nZXRQYXJlbnQoKTtcblx0XHRjb25zdCBvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob0xpbmspO1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQob1ZpZXcpO1xuXHRcdGNvbnN0IG9TaGVsbFNlcnZpY2VzID0gb0FwcENvbXBvbmVudC5nZXRTaGVsbFNlcnZpY2VzKCk7XG5cdFx0aWYgKCFvU2hlbGxTZXJ2aWNlcy5oYXNVU2hlbGwoKSkge1xuXHRcdFx0TG9nLmVycm9yKFwiUXVpY2tWaWV3RGVsZWdhdGU6IENhbm5vdCByZXRyaWV2ZSB0aGUgc2hlbGwgc2VydmljZXNcIik7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoKTtcblx0XHR9XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9WaWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0bGV0IG1MaW5lQ29udGV4dCA9IG9MaW5rLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3Qgb1RhcmdldEluZm86IGFueSA9IHtcblx0XHRcdHNlbWFudGljT2JqZWN0OiBvUGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3QsXG5cdFx0XHRhY3Rpb246IFwiXCJcblx0XHR9O1xuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IGFOZXdMaW5rQ3VzdG9tRGF0YSA9XG5cdFx0XHRcdG9MaW5rICYmXG5cdFx0XHRcdHRoaXMuX2ZldGNoTGlua0N1c3RvbURhdGEob0xpbmspLm1hcChmdW5jdGlvbiAobGlua0l0ZW06IGFueSkge1xuXHRcdFx0XHRcdHJldHVybiBsaW5rSXRlbS5tUHJvcGVydGllcy52YWx1ZTtcblx0XHRcdFx0fSk7XG5cdFx0XHQvLyBjaGVjayBpZiBhbGwgbGluayBpdGVtcyBpbiB0aGlzLmFMaW5rQ3VzdG9tRGF0YSBhcmUgYWxzbyBwcmVzZW50IGluIGFOZXdMaW5rQ3VzdG9tRGF0YVxuXHRcdFx0aWYgKFNpbXBsZUxpbmtEZWxlZ2F0ZS5fSXNTZW1hbnRpY09iamVjdER5bmFtaWMoYU5ld0xpbmtDdXN0b21EYXRhLCB0aGlzKSkge1xuXHRcdFx0XHQvLyBpZiB0aGUgY3VzdG9tRGF0YSBjaGFuZ2VkIHRoZXJlIGFyZSBkaWZmZXJlbnQgTGlua0l0ZW1zIHRvIGRpc3BsYXlcblx0XHRcdFx0Y29uc3Qgb1NlbWFudGljQXR0cmlidXRlc1Jlc29sdmVkID0gU2ltcGxlTGlua0RlbGVnYXRlLl9jYWxjdWxhdGVTZW1hbnRpY0F0dHJpYnV0ZXMoXG5cdFx0XHRcdFx0b0JpbmRpbmdDb250ZXh0LmdldE9iamVjdCgpLFxuXHRcdFx0XHRcdG9QYXlsb2FkLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHR0aGlzLl9saW5rXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGNvbnN0IG9TZW1hbnRpY0F0dHJpYnV0ZXMgPSBvU2VtYW50aWNBdHRyaWJ1dGVzUmVzb2x2ZWQucmVzdWx0cztcblx0XHRcdFx0Y29uc3Qgb1BheWxvYWRSZXNvbHZlZCA9IG9TZW1hbnRpY0F0dHJpYnV0ZXNSZXNvbHZlZC5wYXlsb2FkO1xuXHRcdFx0XHRhTGlua0l0ZW1zID0gYXdhaXQgU2ltcGxlTGlua0RlbGVnYXRlLl9yZXRyaWV2ZU5hdmlnYXRpb25UYXJnZXRzKFxuXHRcdFx0XHRcdFwiXCIsXG5cdFx0XHRcdFx0b1NlbWFudGljQXR0cmlidXRlcyxcblx0XHRcdFx0XHRvUGF5bG9hZFJlc29sdmVkLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHR0aGlzLl9saW5rXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBvTmF2aWdhdGlvblNlcnZpY2UgPSBvQXBwQ29tcG9uZW50LmdldE5hdmlnYXRpb25TZXJ2aWNlKCk7XG5cdFx0XHRjb25zdCBvQ29udHJvbGxlciA9IG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcjtcblx0XHRcdGxldCBvU2VsZWN0aW9uVmFyaWFudDtcblx0XHRcdGxldCBtTGluZUNvbnRleHREYXRhO1xuXHRcdFx0bUxpbmVDb250ZXh0ID0gU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRMaW5lQ29udGV4dChvVmlldywgbUxpbmVDb250ZXh0KTtcblx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgobUxpbmVDb250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRtTGluZUNvbnRleHREYXRhID0gb0NvbnRyb2xsZXIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5yZW1vdmVTZW5zaXRpdmVEYXRhKG1MaW5lQ29udGV4dC5nZXRPYmplY3QoKSwgc01ldGFQYXRoKTtcblx0XHRcdG1MaW5lQ29udGV4dERhdGEgPSBvQ29udHJvbGxlci5faW50ZW50QmFzZWROYXZpZ2F0aW9uLnByZXBhcmVDb250ZXh0Rm9yRXh0ZXJuYWxOYXZpZ2F0aW9uKG1MaW5lQ29udGV4dERhdGEsIG1MaW5lQ29udGV4dCk7XG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudCA9IG9OYXZpZ2F0aW9uU2VydmljZS5taXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudChcblx0XHRcdFx0bUxpbmVDb250ZXh0RGF0YS5zZW1hbnRpY0F0dHJpYnV0ZXMsXG5cdFx0XHRcdG5ldyBTZWxlY3Rpb25WYXJpYW50KClcblx0XHRcdCkgYXMgU2VsZWN0aW9uVmFyaWFudDtcblx0XHRcdG9UYXJnZXRJbmZvLnByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QgPSBtTGluZUNvbnRleHREYXRhLnByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3Q7XG5cdFx0XHQvL1RPIG1vZGlmeSB0aGUgc2VsZWN0aW9uIHZhcmlhbnQgZnJvbSB0aGUgRXh0ZW5zaW9uIEFQSVxuXHRcdFx0b0NvbnRyb2xsZXIuaW50ZW50QmFzZWROYXZpZ2F0aW9uLmFkYXB0TmF2aWdhdGlvbkNvbnRleHQob1NlbGVjdGlvblZhcmlhbnQsIG9UYXJnZXRJbmZvKTtcblx0XHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyhvU2VsZWN0aW9uVmFyaWFudCk7XG5cdFx0XHRvU2VsZWN0aW9uVmFyaWFudCA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fc2V0RmlsdGVyQ29udGV4dFVybEZvclNlbGVjdGlvblZhcmlhbnQob1ZpZXcsIG9TZWxlY3Rpb25WYXJpYW50LCBvTmF2aWdhdGlvblNlcnZpY2UpO1xuXHRcdFx0Y29uc3QgYVZhbHVlcyA9IGF3YWl0IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzKHRoaXMsIG9OYXZpZ2F0aW9uU2VydmljZSwgb1NlbGVjdGlvblZhcmlhbnQsIFwiXCIpO1xuXHRcdFx0Y29uc3Qgb1BhcmFtcyA9IGFWYWx1ZXNbMF07XG5cdFx0XHRjb25zdCBhcHBTdGF0ZUtleSA9IGFWYWx1ZXNbMV07XG5cdFx0XHRsZXQgdGl0bGVMaW5rdG9CZVJlbW92ZTogYW55O1xuXHRcdFx0b1BheWxvYWQuYVNlbWFudGljTGlua3MgPSBbXTtcblx0XHRcdGFMaW5rSXRlbXMgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX3JlbW92ZUVtcHR5TGlua0l0ZW0oYUxpbmtJdGVtcyk7XG5cdFx0XHRmb3IgKGNvbnN0IGluZGV4IGluIGFMaW5rSXRlbXMpIHtcblx0XHRcdFx0dGl0bGVMaW5rdG9CZVJlbW92ZSA9IGF3YWl0IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0TGlua0l0ZW1XaXRoTmV3UGFyYW1ldGVyKFxuXHRcdFx0XHRcdHRoaXMsXG5cdFx0XHRcdFx0YlRpdGxlSGFzTGluayxcblx0XHRcdFx0XHRhVGl0bGVMaW5rLFxuXHRcdFx0XHRcdGFMaW5rSXRlbXNbaW5kZXhdLFxuXHRcdFx0XHRcdG9TaGVsbFNlcnZpY2VzLFxuXHRcdFx0XHRcdG9QYXlsb2FkLFxuXHRcdFx0XHRcdG9QYXJhbXMsXG5cdFx0XHRcdFx0YXBwU3RhdGVLZXksXG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQsXG5cdFx0XHRcdFx0b05hdmlnYXRpb25TZXJ2aWNlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmICh0aXRsZUxpbmt0b0JlUmVtb3ZlID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0YUxpbmtJdGVtc1tpbmRleF0gPSB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiBTaW1wbGVMaW5rRGVsZWdhdGUuX3JlbW92ZUVtcHR5TGlua0l0ZW0oYUxpbmtJdGVtcyk7XG5cdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGdldHRpbmcgdGhlIG5hdmlnYXRpb24gc2VydmljZVwiLCBvRXJyb3IpO1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGFMaW5rSXRlbXM7XG5cdH1cbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuYmVmb3JlTmF2aWdhdGlvbkNhbGxiYWNrID0gZnVuY3Rpb24gKG9QYXlsb2FkOiBhbnksIG9FdmVudDogYW55KSB7XG5cdGNvbnN0IG9Tb3VyY2UgPSBvRXZlbnQuZ2V0U291cmNlKCksXG5cdFx0c0hyZWYgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiaHJlZlwiKSxcblx0XHRvVVJMUGFyc2luZyA9IEZhY3RvcnkuZ2V0U2VydmljZShcIlVSTFBhcnNpbmdcIiksXG5cdFx0b0hhc2ggPSBzSHJlZiAmJiBvVVJMUGFyc2luZy5wYXJzZVNoZWxsSGFzaChzSHJlZik7XG5cblx0S2VlcEFsaXZlSGVscGVyLnN0b3JlQ29udHJvbFJlZnJlc2hTdHJhdGVneUZvckhhc2gob1NvdXJjZSwgb0hhc2gpO1xuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG59O1xuU2ltcGxlTGlua0RlbGVnYXRlLl9yZW1vdmVUZWNobmljYWxQYXJhbWV0ZXJzID0gZnVuY3Rpb24gKG9TZWxlY3Rpb25WYXJpYW50OiBhbnkpIHtcblx0b1NlbGVjdGlvblZhcmlhbnQucmVtb3ZlU2VsZWN0T3B0aW9uKFwiQG9kYXRhLmNvbnRleHRcIik7XG5cdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihcIkBvZGF0YS5tZXRhZGF0YUV0YWdcIik7XG5cdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihcIlNBUF9fTWVzc2FnZXNcIik7XG59O1xuXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0Q3VzdG9tRGF0YVZhbHVlID0gZnVuY3Rpb24gKGFMaW5rQ3VzdG9tRGF0YTogYW55LCBvU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IGFueSk6IHZvaWQge1xuXHRsZXQgc1Byb3BlcnR5TmFtZTogc3RyaW5nLCBzQ3VzdG9tRGF0YVZhbHVlOiBzdHJpbmc7XG5cdGZvciAobGV0IGlDdXN0b21EYXRhQ291bnQgPSAwOyBpQ3VzdG9tRGF0YUNvdW50IDwgYUxpbmtDdXN0b21EYXRhLmxlbmd0aDsgaUN1c3RvbURhdGFDb3VudCsrKSB7XG5cdFx0c1Byb3BlcnR5TmFtZSA9IGFMaW5rQ3VzdG9tRGF0YVtpQ3VzdG9tRGF0YUNvdW50XS5nZXRLZXkoKTtcblx0XHRzQ3VzdG9tRGF0YVZhbHVlID0gYUxpbmtDdXN0b21EYXRhW2lDdXN0b21EYXRhQ291bnRdLmdldFZhbHVlKCk7XG5cdFx0b1NlbWFudGljT2JqZWN0c1Jlc29sdmVkW3NQcm9wZXJ0eU5hbWVdID0geyB2YWx1ZTogc0N1c3RvbURhdGFWYWx1ZSB9O1xuXHR9XG59O1xuXG4vKipcbiAqIENoZWNrIHRoZSBzZW1hbnRpYyBvYmplY3QgbmFtZSBpZiBpdCBpcyBkeW5hbWljIG9yIG5vdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHBhdGhPclZhbHVlIFRoZSBzZW1hbnRpYyBvYmplY3QgcGF0aCBvciBuYW1lXG4gKiBAcmV0dXJucyBUcnVlIGlmIHNlbWFudGljIG9iamVjdCBpcyBkeW5hbWljXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5faXNEeW5hbWljUGF0aCA9IGZ1bmN0aW9uIChwYXRoT3JWYWx1ZTogc3RyaW5nKTogYm9vbGVhbiB7XG5cdGlmIChwYXRoT3JWYWx1ZSAmJiBwYXRoT3JWYWx1ZS5pbmRleE9mKFwie1wiKSA9PT0gMCAmJiBwYXRoT3JWYWx1ZS5pbmRleE9mKFwifVwiKSA9PT0gcGF0aE9yVmFsdWUubGVuZ3RoIC0gMSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuLyoqXG4gKiBVcGRhdGUgdGhlIHBheWxvYWQgd2l0aCBzZW1hbnRpYyBvYmplY3QgdmFsdWVzIGZyb20gY3VzdG9tIGRhdGEgb2YgTGluay5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIHBheWxvYWQgVGhlIHBheWxvYWQgb2YgdGhlIG1kYyBsaW5rLlxuICogQHBhcmFtIG5ld1BheWxvYWQgVGhlIG5ldyB1cGRhdGVkIHBheWxvYWQuXG4gKiBAcGFyYW0gc2VtYW50aWNPYmplY3ROYW1lIFRoZSBzZW1hbnRpYyBvYmplY3QgbmFtZSByZXNvbHZlZC5cbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVQYXlsb2FkV2l0aFJlc29sdmVkU2VtYW50aWNPYmplY3RWYWx1ZSA9IGZ1bmN0aW9uIChcblx0cGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWQsXG5cdG5ld1BheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkLFxuXHRzZW1hbnRpY09iamVjdE5hbWU6IHN0cmluZ1xuKTogdm9pZCB7XG5cdGlmIChTaW1wbGVMaW5rRGVsZWdhdGUuX2lzRHluYW1pY1BhdGgocGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3QpKSB7XG5cdFx0aWYgKHNlbWFudGljT2JqZWN0TmFtZSkge1xuXHRcdFx0bmV3UGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3QgPSBzZW1hbnRpY09iamVjdE5hbWU7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIG5vIHZhbHVlIGZyb20gQ3VzdG9tIERhdGEsIHNvIHJlbW92aW5nIG1haW5TZW1hbnRpY09iamVjdFxuXHRcdFx0bmV3UGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3QgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG5cdHN3aXRjaCAodHlwZW9mIHNlbWFudGljT2JqZWN0TmFtZSkge1xuXHRcdGNhc2UgXCJzdHJpbmdcIjpcblx0XHRcdG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ/LnB1c2goc2VtYW50aWNPYmplY3ROYW1lKTtcblx0XHRcdG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzLnB1c2goc2VtYW50aWNPYmplY3ROYW1lKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgXCJvYmplY3RcIjpcblx0XHRcdGZvciAoY29uc3QgaiBpbiBzZW1hbnRpY09iamVjdE5hbWUgYXMgc3RyaW5nW10pIHtcblx0XHRcdFx0bmV3UGF5bG9hZC5zZW1hbnRpY09iamVjdHNSZXNvbHZlZD8ucHVzaChzZW1hbnRpY09iamVjdE5hbWVbal0pO1xuXHRcdFx0XHRuZXdQYXlsb2FkLnNlbWFudGljT2JqZWN0cy5wdXNoKHNlbWFudGljT2JqZWN0TmFtZVtqXSk7XG5cdFx0XHR9XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHR9XG59O1xuXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2NyZWF0ZU5ld1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkID0gZnVuY3Rpb24gKFxuXHRwYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZCxcblx0c2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IGFueSxcblx0bmV3UGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWRcbik6IHZvaWQge1xuXHRsZXQgc2VtYW50aWNPYmplY3ROYW1lOiBzdHJpbmcsIHRtcFByb3BlcnR5TmFtZTogc3RyaW5nO1xuXHRmb3IgKGNvbnN0IGkgaW4gcGF5bG9hZC5zZW1hbnRpY09iamVjdHMpIHtcblx0XHRzZW1hbnRpY09iamVjdE5hbWUgPSBwYXlsb2FkLnNlbWFudGljT2JqZWN0c1tpXTtcblx0XHRpZiAoU2ltcGxlTGlua0RlbGVnYXRlLl9pc0R5bmFtaWNQYXRoKHNlbWFudGljT2JqZWN0TmFtZSkpIHtcblx0XHRcdHRtcFByb3BlcnR5TmFtZSA9IHNlbWFudGljT2JqZWN0TmFtZS5zdWJzdHIoMSwgc2VtYW50aWNPYmplY3ROYW1lLmluZGV4T2YoXCJ9XCIpIC0gMSk7XG5cdFx0XHRzZW1hbnRpY09iamVjdE5hbWUgPSBzZW1hbnRpY09iamVjdHNSZXNvbHZlZFt0bXBQcm9wZXJ0eU5hbWVdLnZhbHVlO1xuXHRcdFx0U2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVQYXlsb2FkV2l0aFJlc29sdmVkU2VtYW50aWNPYmplY3RWYWx1ZShwYXlsb2FkLCBuZXdQYXlsb2FkLCBzZW1hbnRpY09iamVjdE5hbWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRuZXdQYXlsb2FkLnNlbWFudGljT2JqZWN0cy5wdXNoKHNlbWFudGljT2JqZWN0TmFtZSk7XG5cdFx0fVxuXHR9XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgc2VtYW50aWMgb2JqZWN0IG5hbWUgZnJvbSB0aGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZSBtYXBwaW5ncyBhdHRyaWJ1dGVzLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gbWRjUGF5bG9hZCBUaGUgcGF5bG9hZCBnaXZlbiBieSB0aGUgYXBwbGljYXRpb24uXG4gKiBAcGFyYW0gbWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgVGhlIHBheWxvYWQgd2l0aCB0aGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZSBzZW1hbnRpYyBvYmplY3QgbmFtZS5cbiAqIEBwYXJhbSBuZXdQYXlsb2FkIFRoZSBuZXcgdXBkYXRlZCBwYXlsb2FkLlxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVNlbWFudGljT2JqZWN0c0Zvck1hcHBpbmdzID0gZnVuY3Rpb24gKFxuXHRtZGNQYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZCxcblx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IFJlZ2lzdGVyZWRQYXlsb2FkLFxuXHRuZXdQYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZFxuKTogdm9pZCB7XG5cdC8vIHVwZGF0ZSB0aGUgc2VtYW50aWMgb2JqZWN0IG5hbWUgZnJvbSB0aGUgcmVzb2x2ZWQgb25lcyBpbiB0aGUgc2VtYW50aWMgb2JqZWN0IG1hcHBpbmdzLlxuXHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzLmZvckVhY2goZnVuY3Rpb24gKFxuXHRcdHNlbWFudGljT2JqZWN0TWFwcGluZzogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0TWFwcGluZ1xuXHQpIHtcblx0XHRpZiAoc2VtYW50aWNPYmplY3RNYXBwaW5nLnNlbWFudGljT2JqZWN0ICYmIFNpbXBsZUxpbmtEZWxlZ2F0ZS5faXNEeW5hbWljUGF0aChzZW1hbnRpY09iamVjdE1hcHBpbmcuc2VtYW50aWNPYmplY3QpKSB7XG5cdFx0XHRzZW1hbnRpY09iamVjdE1hcHBpbmcuc2VtYW50aWNPYmplY3QgPVxuXHRcdFx0XHRuZXdQYXlsb2FkLnNlbWFudGljT2JqZWN0c1ttZGNQYXlsb2FkLnNlbWFudGljT2JqZWN0cy5pbmRleE9mKHNlbWFudGljT2JqZWN0TWFwcGluZy5zZW1hbnRpY09iamVjdCldO1xuXHRcdH1cblx0fSk7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgc2VtYW50aWMgb2JqZWN0IG5hbWUgZnJvbSB0aGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZSB1bmF2YWlsYWJsZSBhY3Rpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gbWRjUGF5bG9hZCBUaGUgcGF5bG9hZCBnaXZlbiBieSB0aGUgYXBwbGljYXRpb24uXG4gKiBAcGFyYW0gbWRjUGF5bG9hZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIFRoZSB1bmF2YWlsYWJsZSBhY3Rpb25zIGdpdmVuIGJ5IHRoZSBhcHBsaWNhdGlvbi5cbiAqIEBwYXJhbSBtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCBUaGUgdXBkYXRlZCBwYXlsb2FkIHdpdGggdGhlIHJlc29sdmVkIHZhbHVlIGZvciB0aGUgc2VtYW50aWMgb2JqZWN0IG5hbWUgZm9yIHRoZSB1bmF2YWlsYWJsZSBhY3Rpb25zLlxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVNlbWFudGljT2JqZWN0c1VuYXZhaWxhYmxlQWN0aW9ucyA9IGZ1bmN0aW9uIChcblx0bWRjUGF5bG9hZDogUmVnaXN0ZXJlZFBheWxvYWQsXG5cdG1kY1BheWxvYWRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczogUmVnaXN0ZXJlZFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLFxuXHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZDogUmVnaXN0ZXJlZFBheWxvYWRcbik6IHZvaWQge1xuXHRsZXQgX0luZGV4OiBhbnk7XG5cdG1kY1BheWxvYWRTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uOiBhbnkpIHtcblx0XHQvLyBEeW5hbWljIFNlbWFudGljT2JqZWN0IGhhcyBhbiB1bmF2YWlsYWJsZSBhY3Rpb25cblx0XHRpZiAoXG5cdFx0XHRzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uPy5zZW1hbnRpY09iamVjdCAmJlxuXHRcdFx0U2ltcGxlTGlua0RlbGVnYXRlLl9pc0R5bmFtaWNQYXRoKHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24uc2VtYW50aWNPYmplY3QpXG5cdFx0KSB7XG5cdFx0XHRfSW5kZXggPSBtZGNQYXlsb2FkLnNlbWFudGljT2JqZWN0cy5maW5kSW5kZXgoZnVuY3Rpb24gKHNlbWFudGljT2JqZWN0OiBzdHJpbmcpIHtcblx0XHRcdFx0cmV0dXJuIHNlbWFudGljT2JqZWN0ID09PSBzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uLnNlbWFudGljT2JqZWN0O1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoX0luZGV4ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Ly8gR2V0IHRoZSBTZW1hbnRpY09iamVjdCBuYW1lIHJlc29sdmVkIHRvIGEgdmFsdWVcblx0XHRcdFx0c2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbi5zZW1hbnRpY09iamVjdCA9IG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0c1tfSW5kZXhdO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59O1xuXG4vKipcbiAqIFVwZGF0ZSB0aGUgc2VtYW50aWMgb2JqZWN0IG5hbWUgZnJvbSB0aGUgcmVzb2x2ZWQgdmFsdWUgZm9yIHRoZSB1bmF2YWlsYWJsZSBhY3Rpb25zLlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gbWRjUGF5bG9hZCBUaGUgdXBkYXRlZCBwYXlsb2FkIHdpdGggdGhlIGluZm9ybWF0aW9uIGZyb20gY3VzdG9tIGRhdGEgcHJvdmlkZWQgaW4gdGhlIGxpbmsuXG4gKiBAcGFyYW0gbWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgVGhlIHBheWxvYWQgdXBkYXRlZCB3aXRoIHJlc29sdmVkIHNlbWFudGljIG9iamVjdHMgbmFtZXMuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fdXBkYXRlU2VtYW50aWNPYmplY3RzV2l0aFJlc29sdmVkVmFsdWUgPSBmdW5jdGlvbiAoXG5cdG1kY1BheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkLFxuXHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZDogUmVnaXN0ZXJlZFBheWxvYWRcbik6IHZvaWQge1xuXHRmb3IgKGxldCBuZXdTZW1hbnRpY09iamVjdHNDb3VudCA9IDA7IG5ld1NlbWFudGljT2JqZWN0c0NvdW50IDwgbWRjUGF5bG9hZC5zZW1hbnRpY09iamVjdHMubGVuZ3RoOyBuZXdTZW1hbnRpY09iamVjdHNDb3VudCsrKSB7XG5cdFx0aWYgKFxuXHRcdFx0bWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQubWFpblNlbWFudGljT2JqZWN0ID09PVxuXHRcdFx0KG1kY1BheWxvYWQuc2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgJiYgbWRjUGF5bG9hZC5zZW1hbnRpY09iamVjdHNSZXNvbHZlZFtuZXdTZW1hbnRpY09iamVjdHNDb3VudF0pXG5cdFx0KSB7XG5cdFx0XHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5tYWluU2VtYW50aWNPYmplY3QgPSBtZGNQYXlsb2FkLnNlbWFudGljT2JqZWN0c1tuZXdTZW1hbnRpY09iamVjdHNDb3VudF07XG5cdFx0fVxuXHRcdGlmIChtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdHNbbmV3U2VtYW50aWNPYmplY3RzQ291bnRdKSB7XG5cdFx0XHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdHNbbmV3U2VtYW50aWNPYmplY3RzQ291bnRdID1cblx0XHRcdFx0bWRjUGF5bG9hZC5zZW1hbnRpY09iamVjdHNbbmV3U2VtYW50aWNPYmplY3RzQ291bnRdO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBubyBDdXN0b20gRGF0YSB2YWx1ZSBmb3IgYSBTZW1hbnRpYyBPYmplY3QgbmFtZSB3aXRoIHBhdGhcblx0XHRcdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0cy5zcGxpY2UobmV3U2VtYW50aWNPYmplY3RzQ291bnQsIDEpO1xuXHRcdH1cblx0fVxufTtcblxuLyoqXG4gKiBSZW1vdmUgZW1wdHkgc2VtYW50aWMgb2JqZWN0IG1hcHBpbmdzIGFuZCBpZiB0aGVyZSBpcyBubyBzZW1hbnRpYyBvYmplY3QgbmFtZSwgbGluayB0byBpdC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkIFRoZSBwYXlsb2FkIHVzZWQgdG8gY2hlY2sgdGhlIG1hcHBpbmdzIG9mIHRoZSBzZW1hbnRpYyBvYmplY3RzLlxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3JlbW92ZUVtcHR5U2VtYW50aWNPYmplY3RzTWFwcGluZ3MgPSBmdW5jdGlvbiAobWRjUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IFJlZ2lzdGVyZWRQYXlsb2FkKTogdm9pZCB7XG5cdC8vIHJlbW92ZSB1bmRlZmluZWQgU2VtYW50aWMgT2JqZWN0IE1hcHBpbmdcblx0Zm9yIChcblx0XHRsZXQgbWFwcGluZ3NDb3VudCA9IDA7XG5cdFx0bWFwcGluZ3NDb3VudCA8IG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0TWFwcGluZ3MubGVuZ3RoO1xuXHRcdG1hcHBpbmdzQ291bnQrK1xuXHQpIHtcblx0XHRpZiAoXG5cdFx0XHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzW21hcHBpbmdzQ291bnRdICYmXG5cdFx0XHRtZGNQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdE1hcHBpbmdzW21hcHBpbmdzQ291bnRdLnNlbWFudGljT2JqZWN0ID09PSB1bmRlZmluZWRcblx0XHQpIHtcblx0XHRcdG1kY1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLnNlbWFudGljT2JqZWN0TWFwcGluZ3Muc3BsaWNlKG1hcHBpbmdzQ291bnQsIDEpO1xuXHRcdH1cblx0fVxufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl9zZXRQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCA9IGZ1bmN0aW9uIChcblx0cGF5bG9hZDogYW55LFxuXHRuZXdQYXlsb2FkOiBSZWdpc3RlcmVkUGF5bG9hZFxuKTogUmVnaXN0ZXJlZFBheWxvYWQge1xuXHRsZXQgb1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBSZWdpc3RlcmVkUGF5bG9hZDtcblx0aWYgKG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgJiYgbmV3UGF5bG9hZC5zZW1hbnRpY09iamVjdHNSZXNvbHZlZC5sZW5ndGggPiAwKSB7XG5cdFx0b1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkID0ge1xuXHRcdFx0ZW50aXR5VHlwZTogcGF5bG9hZC5lbnRpdHlUeXBlLFxuXHRcdFx0ZGF0YUZpZWxkOiBwYXlsb2FkLmRhdGFGaWVsZCxcblx0XHRcdGNvbnRhY3Q6IHBheWxvYWQuY29udGFjdCxcblx0XHRcdG1haW5TZW1hbnRpY09iamVjdDogcGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3QsXG5cdFx0XHRuYXZpZ2F0aW9uUGF0aDogcGF5bG9hZC5uYXZpZ2F0aW9uUGF0aCxcblx0XHRcdHByb3BlcnR5UGF0aExhYmVsOiBwYXlsb2FkLnByb3BlcnR5UGF0aExhYmVsLFxuXHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nczogZGVlcENsb25lKHBheWxvYWQuc2VtYW50aWNPYmplY3RNYXBwaW5ncyksXG5cdFx0XHRzZW1hbnRpY09iamVjdHM6IG5ld1BheWxvYWQuc2VtYW50aWNPYmplY3RzXG5cdFx0fTtcblx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVNlbWFudGljT2JqZWN0c0Zvck1hcHBpbmdzKHBheWxvYWQsIG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCwgbmV3UGF5bG9hZCk7XG5cdFx0Y29uc3QgX1NlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBSZWdpc3RlcmVkU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPSBkZWVwQ2xvbmUoXG5cdFx0XHRwYXlsb2FkLnNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zXG5cdFx0KTtcblx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVNlbWFudGljT2JqZWN0c1VuYXZhaWxhYmxlQWN0aW9ucyhcblx0XHRcdHBheWxvYWQsXG5cdFx0XHRfU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMsXG5cdFx0XHRvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWRcblx0XHQpO1xuXHRcdG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5zZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA9IF9TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucztcblx0XHRpZiAobmV3UGF5bG9hZC5tYWluU2VtYW50aWNPYmplY3QpIHtcblx0XHRcdG9QYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZC5tYWluU2VtYW50aWNPYmplY3QgPSBuZXdQYXlsb2FkLm1haW5TZW1hbnRpY09iamVjdDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkLm1haW5TZW1hbnRpY09iamVjdCA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0U2ltcGxlTGlua0RlbGVnYXRlLl91cGRhdGVTZW1hbnRpY09iamVjdHNXaXRoUmVzb2x2ZWRWYWx1ZShuZXdQYXlsb2FkLCBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQpO1xuXHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fcmVtb3ZlRW1wdHlTZW1hbnRpY09iamVjdHNNYXBwaW5ncyhvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQpO1xuXHRcdHJldHVybiBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIHt9IGFzIGFueTtcblx0fVxufTtcblxuU2ltcGxlTGlua0RlbGVnYXRlLl9nZXRQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZCA9IGZ1bmN0aW9uIChwYXlsb2FkOiBhbnksIGxpbmtDdXN0b21EYXRhOiBhbnkpOiBhbnkge1xuXHRsZXQgb1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkOiBhbnk7XG5cdGNvbnN0IG9TZW1hbnRpY09iamVjdHNSZXNvbHZlZDogYW55ID0ge307XG5cdGNvbnN0IG5ld1BheWxvYWQ6IFJlZ2lzdGVyZWRQYXlsb2FkID0geyBzZW1hbnRpY09iamVjdHM6IFtdLCBzZW1hbnRpY09iamVjdHNSZXNvbHZlZDogW10sIHNlbWFudGljT2JqZWN0TWFwcGluZ3M6IFtdIH07XG5cdGlmIChwYXlsb2FkLnNlbWFudGljT2JqZWN0cykge1xuXHRcdC8vIHNhcC5tLkxpbmsgaGFzIGN1c3RvbSBkYXRhIHdpdGggU2VtYW50aWMgT2JqZWN0cyBuYW1lcyByZXNvbHZlZFxuXHRcdGlmIChsaW5rQ3VzdG9tRGF0YSAmJiBsaW5rQ3VzdG9tRGF0YS5sZW5ndGggPiAwKSB7XG5cdFx0XHRTaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0Q3VzdG9tRGF0YVZhbHVlKGxpbmtDdXN0b21EYXRhLCBvU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQpO1xuXHRcdFx0U2ltcGxlTGlua0RlbGVnYXRlLl9jcmVhdGVOZXdQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZChwYXlsb2FkLCBvU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQsIG5ld1BheWxvYWQpO1xuXHRcdFx0b1BheWxvYWRXaXRoRHluYW1pY1NlbWFudGljT2JqZWN0c1Jlc29sdmVkID0gU2ltcGxlTGlua0RlbGVnYXRlLl9zZXRQYXlsb2FkV2l0aER5bmFtaWNTZW1hbnRpY09iamVjdHNSZXNvbHZlZChcblx0XHRcdFx0cGF5bG9hZCxcblx0XHRcdFx0bmV3UGF5bG9hZFxuXHRcdFx0KTtcblx0XHRcdHJldHVybiBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG5cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fdXBkYXRlUGF5bG9hZFdpdGhTZW1hbnRpY0F0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoXG5cdGFTZW1hbnRpY09iamVjdHM6IGFueSxcblx0b0luZm9Mb2c6IGFueSxcblx0b0NvbnRleHRPYmplY3Q6IGFueSxcblx0b1Jlc3VsdHM6IGFueSxcblx0bVNlbWFudGljT2JqZWN0TWFwcGluZ3M6IGFueVxuKTogdm9pZCB7XG5cdGFTZW1hbnRpY09iamVjdHMuZm9yRWFjaChmdW5jdGlvbiAoc1NlbWFudGljT2JqZWN0OiBhbnkpIHtcblx0XHRpZiAob0luZm9Mb2cpIHtcblx0XHRcdG9JbmZvTG9nLmFkZENvbnRleHRPYmplY3Qoc1NlbWFudGljT2JqZWN0LCBvQ29udGV4dE9iamVjdCk7XG5cdFx0fVxuXHRcdG9SZXN1bHRzW3NTZW1hbnRpY09iamVjdF0gPSB7fTtcblx0XHRmb3IgKGNvbnN0IHNBdHRyaWJ1dGVOYW1lIGluIG9Db250ZXh0T2JqZWN0KSB7XG5cdFx0XHRsZXQgb0F0dHJpYnV0ZSA9IG51bGwsXG5cdFx0XHRcdG9UcmFuc2Zvcm1hdGlvbkFkZGl0aW9uYWwgPSBudWxsO1xuXHRcdFx0aWYgKG9JbmZvTG9nKSB7XG5cdFx0XHRcdG9BdHRyaWJ1dGUgPSBvSW5mb0xvZy5nZXRTZW1hbnRpY09iamVjdEF0dHJpYnV0ZShzU2VtYW50aWNPYmplY3QsIHNBdHRyaWJ1dGVOYW1lKTtcblx0XHRcdFx0aWYgKCFvQXR0cmlidXRlKSB7XG5cdFx0XHRcdFx0b0F0dHJpYnV0ZSA9IG9JbmZvTG9nLmNyZWF0ZUF0dHJpYnV0ZVN0cnVjdHVyZSgpO1xuXHRcdFx0XHRcdG9JbmZvTG9nLmFkZFNlbWFudGljT2JqZWN0QXR0cmlidXRlKHNTZW1hbnRpY09iamVjdCwgc0F0dHJpYnV0ZU5hbWUsIG9BdHRyaWJ1dGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHQvLyBJZ25vcmUgdW5kZWZpbmVkIGFuZCBudWxsIHZhbHVlc1xuXHRcdFx0aWYgKG9Db250ZXh0T2JqZWN0W3NBdHRyaWJ1dGVOYW1lXSA9PT0gdW5kZWZpbmVkIHx8IG9Db250ZXh0T2JqZWN0W3NBdHRyaWJ1dGVOYW1lXSA9PT0gbnVsbCkge1xuXHRcdFx0XHRpZiAob0F0dHJpYnV0ZSkge1xuXHRcdFx0XHRcdG9BdHRyaWJ1dGUudHJhbnNmb3JtYXRpb25zLnB1c2goe1xuXHRcdFx0XHRcdFx0dmFsdWU6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBcIlxcdTIxMzkgVW5kZWZpbmVkIGFuZCBudWxsIHZhbHVlcyBoYXZlIGJlZW4gcmVtb3ZlZCBpbiBTaW1wbGVMaW5rRGVsZWdhdGUuXCJcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblx0XHRcdC8vIElnbm9yZSBwbGFpbiBvYmplY3RzIChCQ1AgMTc3MDQ5NjYzOSlcblx0XHRcdGlmIChpc1BsYWluT2JqZWN0KG9Db250ZXh0T2JqZWN0W3NBdHRyaWJ1dGVOYW1lXSkpIHtcblx0XHRcdFx0aWYgKG1TZW1hbnRpY09iamVjdE1hcHBpbmdzICYmIG1TZW1hbnRpY09iamVjdE1hcHBpbmdzW3NTZW1hbnRpY09iamVjdF0pIHtcblx0XHRcdFx0XHRjb25zdCBhS2V5cyA9IE9iamVjdC5rZXlzKG1TZW1hbnRpY09iamVjdE1hcHBpbmdzW3NTZW1hbnRpY09iamVjdF0pO1xuXHRcdFx0XHRcdGxldCBzTmV3QXR0cmlidXRlTmFtZU1hcHBlZCwgc05ld0F0dHJpYnV0ZU5hbWUsIHNWYWx1ZSwgc0tleTtcblx0XHRcdFx0XHRmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgYUtleXMubGVuZ3RoOyBpbmRleCsrKSB7XG5cdFx0XHRcdFx0XHRzS2V5ID0gYUtleXNbaW5kZXhdO1xuXHRcdFx0XHRcdFx0aWYgKHNLZXkuaW5kZXhPZihzQXR0cmlidXRlTmFtZSkgPT09IDApIHtcblx0XHRcdFx0XHRcdFx0c05ld0F0dHJpYnV0ZU5hbWVNYXBwZWQgPSBtU2VtYW50aWNPYmplY3RNYXBwaW5nc1tzU2VtYW50aWNPYmplY3RdW3NLZXldO1xuXHRcdFx0XHRcdFx0XHRzTmV3QXR0cmlidXRlTmFtZSA9IHNLZXkuc3BsaXQoXCIvXCIpW3NLZXkuc3BsaXQoXCIvXCIpLmxlbmd0aCAtIDFdO1xuXHRcdFx0XHRcdFx0XHRzVmFsdWUgPSBvQ29udGV4dE9iamVjdFtzQXR0cmlidXRlTmFtZV1bc05ld0F0dHJpYnV0ZU5hbWVdO1xuXHRcdFx0XHRcdFx0XHRpZiAoc05ld0F0dHJpYnV0ZU5hbWVNYXBwZWQgJiYgc05ld0F0dHJpYnV0ZU5hbWUgJiYgc1ZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0b1Jlc3VsdHNbc1NlbWFudGljT2JqZWN0XVtzTmV3QXR0cmlidXRlTmFtZU1hcHBlZF0gPSBzVmFsdWU7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9BdHRyaWJ1dGUpIHtcblx0XHRcdFx0XHRvQXR0cmlidXRlLnRyYW5zZm9ybWF0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdHZhbHVlOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogXCJcXHUyMTM5IFBsYWluIG9iamVjdHMgaGFzIGJlZW4gcmVtb3ZlZCBpbiBTaW1wbGVMaW5rRGVsZWdhdGUuXCJcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb250aW51ZTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gTWFwIHRoZSBhdHRyaWJ1dGUgbmFtZSBvbmx5IGlmICdzZW1hbnRpY09iamVjdE1hcHBpbmcnIGlzIGRlZmluZWQuXG5cdFx0XHQvLyBOb3RlOiB1bmRlciBkZWZpbmVkICdzZW1hbnRpY09iamVjdE1hcHBpbmcnIHdlIGFsc28gbWVhbiBhbiBlbXB0eSBhbm5vdGF0aW9uIG9yIGFuIGFubm90YXRpb24gd2l0aCBlbXB0eSByZWNvcmRcblx0XHRcdGNvbnN0IHNBdHRyaWJ1dGVOYW1lTWFwcGVkID1cblx0XHRcdFx0bVNlbWFudGljT2JqZWN0TWFwcGluZ3MgJiZcblx0XHRcdFx0bVNlbWFudGljT2JqZWN0TWFwcGluZ3Nbc1NlbWFudGljT2JqZWN0XSAmJlxuXHRcdFx0XHRtU2VtYW50aWNPYmplY3RNYXBwaW5nc1tzU2VtYW50aWNPYmplY3RdW3NBdHRyaWJ1dGVOYW1lXVxuXHRcdFx0XHRcdD8gbVNlbWFudGljT2JqZWN0TWFwcGluZ3Nbc1NlbWFudGljT2JqZWN0XVtzQXR0cmlidXRlTmFtZV1cblx0XHRcdFx0XHQ6IHNBdHRyaWJ1dGVOYW1lO1xuXG5cdFx0XHRpZiAob0F0dHJpYnV0ZSAmJiBzQXR0cmlidXRlTmFtZSAhPT0gc0F0dHJpYnV0ZU5hbWVNYXBwZWQpIHtcblx0XHRcdFx0b1RyYW5zZm9ybWF0aW9uQWRkaXRpb25hbCA9IHtcblx0XHRcdFx0XHR2YWx1ZTogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBgXFx1MjEzOSBUaGUgYXR0cmlidXRlICR7c0F0dHJpYnV0ZU5hbWV9IGhhcyBiZWVuIHJlbmFtZWQgdG8gJHtzQXR0cmlidXRlTmFtZU1hcHBlZH0gaW4gU2ltcGxlTGlua0RlbGVnYXRlLmAsXG5cdFx0XHRcdFx0cmVhc29uOiBgXFx1ZDgzZFxcdWRkMzQgQSBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RNYXBwaW5nIGFubm90YXRpb24gaXMgZGVmaW5lZCBmb3Igc2VtYW50aWMgb2JqZWN0ICR7c1NlbWFudGljT2JqZWN0fSB3aXRoIHNvdXJjZSBhdHRyaWJ1dGUgJHtzQXR0cmlidXRlTmFtZX0gYW5kIHRhcmdldCBhdHRyaWJ1dGUgJHtzQXR0cmlidXRlTmFtZU1hcHBlZH0uIFlvdSBjYW4gbW9kaWZ5IHRoZSBhbm5vdGF0aW9uIGlmIHRoZSBtYXBwaW5nIHJlc3VsdCBpcyBub3Qgd2hhdCB5b3UgZXhwZWN0ZWQuYFxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBJZiBtb3JlIHRoZW4gb25lIGxvY2FsIHByb3BlcnR5IG1hcHMgdG8gdGhlIHNhbWUgdGFyZ2V0IHByb3BlcnR5IChjbGFzaCBzaXR1YXRpb24pXG5cdFx0XHQvLyB3ZSB0YWtlIHRoZSB2YWx1ZSBvZiB0aGUgbGFzdCBwcm9wZXJ0eSBhbmQgd3JpdGUgYW4gZXJyb3IgbG9nXG5cdFx0XHRpZiAob1Jlc3VsdHNbc1NlbWFudGljT2JqZWN0XVtzQXR0cmlidXRlTmFtZU1hcHBlZF0pIHtcblx0XHRcdFx0TG9nLmVycm9yKFxuXHRcdFx0XHRcdGBTaW1wbGVMaW5rRGVsZWdhdGU6IFRoZSBhdHRyaWJ1dGUgJHtzQXR0cmlidXRlTmFtZX0gY2FuIG5vdCBiZSByZW5hbWVkIHRvIHRoZSBhdHRyaWJ1dGUgJHtzQXR0cmlidXRlTmFtZU1hcHBlZH0gZHVlIHRvIGEgY2xhc2ggc2l0dWF0aW9uLiBUaGlzIGNhbiBsZWFkIHRvIHdyb25nIG5hdmlnYXRpb24gbGF0ZXIgb24uYFxuXHRcdFx0XHQpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBDb3B5IHRoZSB2YWx1ZSByZXBsYWNpbmcgdGhlIGF0dHJpYnV0ZSBuYW1lIGJ5IHNlbWFudGljIG9iamVjdCBuYW1lXG5cdFx0XHRvUmVzdWx0c1tzU2VtYW50aWNPYmplY3RdW3NBdHRyaWJ1dGVOYW1lTWFwcGVkXSA9IG9Db250ZXh0T2JqZWN0W3NBdHRyaWJ1dGVOYW1lXTtcblxuXHRcdFx0aWYgKG9BdHRyaWJ1dGUpIHtcblx0XHRcdFx0aWYgKG9UcmFuc2Zvcm1hdGlvbkFkZGl0aW9uYWwpIHtcblx0XHRcdFx0XHRvQXR0cmlidXRlLnRyYW5zZm9ybWF0aW9ucy5wdXNoKG9UcmFuc2Zvcm1hdGlvbkFkZGl0aW9uYWwpO1xuXHRcdFx0XHRcdGNvbnN0IGFBdHRyaWJ1dGVOZXcgPSBvSW5mb0xvZy5jcmVhdGVBdHRyaWJ1dGVTdHJ1Y3R1cmUoKTtcblx0XHRcdFx0XHRhQXR0cmlidXRlTmV3LnRyYW5zZm9ybWF0aW9ucy5wdXNoKHtcblx0XHRcdFx0XHRcdHZhbHVlOiBvQ29udGV4dE9iamVjdFtzQXR0cmlidXRlTmFtZV0sXG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogYFxcdTIxMzkgVGhlIGF0dHJpYnV0ZSAke3NBdHRyaWJ1dGVOYW1lTWFwcGVkfSB3aXRoIHRoZSB2YWx1ZSAke29Db250ZXh0T2JqZWN0W3NBdHRyaWJ1dGVOYW1lXX0gaGFzIGJlZW4gYWRkZWQgZHVlIHRvIGEgbWFwcGluZyBydWxlIHJlZ2FyZGluZyB0aGUgYXR0cmlidXRlICR7c0F0dHJpYnV0ZU5hbWV9IGluIFNpbXBsZUxpbmtEZWxlZ2F0ZS5gXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0b0luZm9Mb2cuYWRkU2VtYW50aWNPYmplY3RBdHRyaWJ1dGUoc1NlbWFudGljT2JqZWN0LCBzQXR0cmlidXRlTmFtZU1hcHBlZCwgYUF0dHJpYnV0ZU5ldyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH0pO1xufTtcblxuLyoqXG4gKiBDaGVja3Mgd2hpY2ggYXR0cmlidXRlcyBvZiB0aGUgQ29udGV4dE9iamVjdCBiZWxvbmcgdG8gd2hpY2ggU2VtYW50aWNPYmplY3QgYW5kIG1hcHMgdGhlbSBpbnRvIGEgdHdvIGRpbWVuc2lvbmFsIGFycmF5LlxuICpcbiAqIEBwcml2YXRlXG4gKiBAcGFyYW0gb0NvbnRleHRPYmplY3QgVGhlIEJpbmRpbmdDb250ZXh0IG9mIHRoZSBTb3VyY2VDb250cm9sIG9mIHRoZSBMaW5rIC8gb2YgdGhlIExpbmsgaXRzZWxmIGlmIG5vdCBzZXRcbiAqIEBwYXJhbSBvUGF5bG9hZCBUaGUgcGF5bG9hZCBnaXZlbiBieSB0aGUgYXBwbGljYXRpb25cbiAqIEBwYXJhbSBvSW5mb0xvZyBUaGUgY29ycmVzcG9uZGluZyBJbmZvTG9nIG9mIHRoZSBMaW5rXG4gKiBAcGFyYW0gb0xpbmsgVGhlIGNvcnJlc3BvbmRpbmcgTGlua1xuICogQHJldHVybnMgQSB0d28gZGltZW5zaW9uYWwgYXJyYXkgd2hpY2ggbWFwcyBhIGdpdmVuIFNlbWFudGljT2JqZWN0IG5hbWUgdG9nZXRoZXIgd2l0aCBhIGdpdmVuIGF0dHJpYnV0ZSBuYW1lIHRvIHRoZSB2YWx1ZSBvZiB0aGF0IGdpdmVuIGF0dHJpYnV0ZVxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX2NhbGN1bGF0ZVNlbWFudGljQXR0cmlidXRlcyA9IGZ1bmN0aW9uIChvQ29udGV4dE9iamVjdDogYW55LCBvUGF5bG9hZDogYW55LCBvSW5mb0xvZzogYW55LCBvTGluazogYW55KSB7XG5cdGNvbnN0IGFMaW5rQ3VzdG9tRGF0YSA9IG9MaW5rICYmIHRoaXMuX2ZldGNoTGlua0N1c3RvbURhdGEob0xpbmspO1xuXHRjb25zdCBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ6IGFueSA9IFNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0UGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQoXG5cdFx0b1BheWxvYWQsXG5cdFx0YUxpbmtDdXN0b21EYXRhXG5cdCk7XG5cdGNvbnN0IG9QYXlsb2FkUmVzb2x2ZWQgPSBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgPyBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQgOiBvUGF5bG9hZDtcblx0dGhpcy5yZXNvbHZlZHBheWxvYWQgPSBvUGF5bG9hZFdpdGhEeW5hbWljU2VtYW50aWNPYmplY3RzUmVzb2x2ZWQ7XG5cdGNvbnN0IGFTZW1hbnRpY09iamVjdHMgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0cyhvUGF5bG9hZFJlc29sdmVkKTtcblx0Y29uc3QgbVNlbWFudGljT2JqZWN0TWFwcGluZ3MgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2NvbnZlcnRTZW1hbnRpY09iamVjdE1hcHBpbmcoXG5cdFx0U2ltcGxlTGlua0RlbGVnYXRlLl9nZXRTZW1hbnRpY09iamVjdE1hcHBpbmdzKG9QYXlsb2FkUmVzb2x2ZWQpXG5cdCk7XG5cdGlmICghYVNlbWFudGljT2JqZWN0cy5sZW5ndGgpIHtcblx0XHRhU2VtYW50aWNPYmplY3RzLnB1c2goXCJcIik7XG5cdH1cblx0Y29uc3Qgb1Jlc3VsdHM6IGFueSA9IHt9O1xuXHRTaW1wbGVMaW5rRGVsZWdhdGUuX3VwZGF0ZVBheWxvYWRXaXRoU2VtYW50aWNBdHRyaWJ1dGVzKGFTZW1hbnRpY09iamVjdHMsIG9JbmZvTG9nLCBvQ29udGV4dE9iamVjdCwgb1Jlc3VsdHMsIG1TZW1hbnRpY09iamVjdE1hcHBpbmdzKTtcblx0cmV0dXJuIHsgcGF5bG9hZDogb1BheWxvYWRSZXNvbHZlZCwgcmVzdWx0czogb1Jlc3VsdHMgfTtcbn07XG4vKipcbiAqIFJldHJpZXZlcyB0aGUgYWN0dWFsIHRhcmdldHMgZm9yIHRoZSBuYXZpZ2F0aW9uIG9mIHRoZSBsaW5rLiBUaGlzIHVzZXMgdGhlIFVTaGVsbCBsb2FkZWQgYnkgdGhlIHtAbGluayBzYXAudWkubWRjLmxpbmsuRmFjdG9yeX0gdG8gcmV0cmlldmVcbiAqIHRoZSBuYXZpZ2F0aW9uIHRhcmdldHMgZnJvbSB0aGUgRkxQIHNlcnZpY2UuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBzQXBwU3RhdGVLZXkgS2V5IG9mIHRoZSBhcHBzdGF0ZSAobm90IHVzZWQgeWV0KVxuICogQHBhcmFtIG9TZW1hbnRpY0F0dHJpYnV0ZXMgVGhlIGNhbGN1bGF0ZWQgYnkgX2NhbGN1bGF0ZVNlbWFudGljQXR0cmlidXRlc1xuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBwYXlsb2FkIGdpdmVuIGJ5IHRoZSBhcHBsaWNhdGlvblxuICogQHBhcmFtIG9JbmZvTG9nIFRoZSBjb3JyZXNwb25kaW5nIEluZm9Mb2cgb2YgdGhlIExpbmtcbiAqIEBwYXJhbSBvTGluayBUaGUgY29ycmVzcG9uZGluZyBMaW5rXG4gKiBAcmV0dXJucyBSZXNvbHZpbmcgaW50byBhdmFpbGFibGVBdGlvbnMgYW5kIG93bk5hdmlnYXRpb24gY29udGFpbmluZyBhbiBhcnJheSBvZiB7QGxpbmsgc2FwLnVpLm1kYy5saW5rLkxpbmtJdGVtfVxuICovXG5TaW1wbGVMaW5rRGVsZWdhdGUuX3JldHJpZXZlTmF2aWdhdGlvblRhcmdldHMgPSBmdW5jdGlvbiAoXG5cdHNBcHBTdGF0ZUtleTogc3RyaW5nLFxuXHRvU2VtYW50aWNBdHRyaWJ1dGVzOiBhbnksXG5cdG9QYXlsb2FkOiBhbnksXG5cdG9JbmZvTG9nOiBhbnksXG5cdG9MaW5rOiBhbnlcbikge1xuXHRpZiAoIW9QYXlsb2FkLnNlbWFudGljT2JqZWN0cykge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoW10pO1xuXHR9XG5cdGNvbnN0IGFTZW1hbnRpY09iamVjdHMgPSBvUGF5bG9hZC5zZW1hbnRpY09iamVjdHM7XG5cdGNvbnN0IG9OYXZpZ2F0aW9uVGFyZ2V0czogYW55ID0ge1xuXHRcdG93bk5hdmlnYXRpb246IHVuZGVmaW5lZCxcblx0XHRhdmFpbGFibGVBY3Rpb25zOiBbXVxuXHR9O1xuXHRsZXQgaVN1cGVyaW9yQWN0aW9uTGlua3NGb3VuZCA9IDA7XG5cdHJldHVybiBDb3JlLmxvYWRMaWJyYXJ5KFwic2FwLnVpLmZsXCIsIHtcblx0XHRhc3luYzogdHJ1ZVxuXHR9KS50aGVuKCgpID0+IHtcblx0XHRyZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcblx0XHRcdHNhcC51aS5yZXF1aXJlKFtcInNhcC91aS9mbC9VdGlsc1wiXSwgYXN5bmMgKFV0aWxzOiBhbnkpID0+IHtcblx0XHRcdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IFV0aWxzLmdldEFwcENvbXBvbmVudEZvckNvbnRyb2wob0xpbmsgPT09IHVuZGVmaW5lZCA/IHRoaXMub0NvbnRyb2wgOiBvTGluayk7XG5cdFx0XHRcdGNvbnN0IG9TaGVsbFNlcnZpY2VzID0gb0FwcENvbXBvbmVudCA/IG9BcHBDb21wb25lbnQuZ2V0U2hlbGxTZXJ2aWNlcygpIDogbnVsbDtcblx0XHRcdFx0aWYgKCFvU2hlbGxTZXJ2aWNlcykge1xuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0cmVzb2x2ZShvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9ucywgb05hdmlnYXRpb25UYXJnZXRzLm93bk5hdmlnYXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICghb1NoZWxsU2VydmljZXMuaGFzVVNoZWxsKCkpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJTaW1wbGVMaW5rRGVsZWdhdGU6IFNlcnZpY2UgJ0Nyb3NzQXBwbGljYXRpb25OYXZpZ2F0aW9uJyBvciAnVVJMUGFyc2luZycgY291bGQgbm90IGJlIG9idGFpbmVkXCIpO1xuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0cmVzb2x2ZShvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9ucywgb05hdmlnYXRpb25UYXJnZXRzLm93bk5hdmlnYXRpb24pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGFQYXJhbXMgPSBhU2VtYW50aWNPYmplY3RzLm1hcChmdW5jdGlvbiAoc1NlbWFudGljT2JqZWN0OiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gW1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogc1NlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0XHRwYXJhbXM6IG9TZW1hbnRpY0F0dHJpYnV0ZXMgPyBvU2VtYW50aWNBdHRyaWJ1dGVzW3NTZW1hbnRpY09iamVjdF0gOiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdGFwcFN0YXRlS2V5OiBzQXBwU3RhdGVLZXksXG5cdFx0XHRcdFx0XHRcdHNvcnRSZXN1bHRzQnk6IFwidGV4dFwiXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XTtcblx0XHRcdFx0fSk7XG5cdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0Y29uc3QgYUxpbmtzID0gYXdhaXQgb1NoZWxsU2VydmljZXMuZ2V0TGlua3MoYVBhcmFtcyk7XG5cdFx0XHRcdFx0bGV0IGJIYXNMaW5rcyA9IGZhbHNlO1xuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYUxpbmtzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGFMaW5rc1tpXS5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRcdFx0XHRpZiAoYUxpbmtzW2ldW2pdLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0XHRiSGFzTGlua3MgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGlmIChiSGFzTGlua3MpIHtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghYUxpbmtzIHx8ICFhTGlua3MubGVuZ3RoIHx8ICFiSGFzTGlua3MpIHtcblx0XHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRcdHJlc29sdmUob05hdmlnYXRpb25UYXJnZXRzLmF2YWlsYWJsZUFjdGlvbnMsIG9OYXZpZ2F0aW9uVGFyZ2V0cy5vd25OYXZpZ2F0aW9uKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjb25zdCBhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgPSBTaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zKG9QYXlsb2FkKTtcblx0XHRcdFx0XHRjb25zdCBvVW5hdmFpbGFibGVBY3Rpb25zID1cblx0XHRcdFx0XHRcdFNpbXBsZUxpbmtEZWxlZ2F0ZS5fY29udmVydFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24oYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zKTtcblx0XHRcdFx0XHRsZXQgc0N1cnJlbnRIYXNoID0gRmllbGRSdW50aW1lLl9mbkZpeEhhc2hRdWVyeVN0cmluZyhDb21tb25VdGlscy5nZXRIYXNoKCkpO1xuXG5cdFx0XHRcdFx0aWYgKHNDdXJyZW50SGFzaCkge1xuXHRcdFx0XHRcdFx0Ly8gQkNQIDE3NzAzMTUwMzU6IHdlIGhhdmUgdG8gc2V0IHRoZSBlbmQtcG9pbnQgJz8nIG9mIGFjdGlvbiBpbiBvcmRlciB0byBhdm9pZCBtYXRjaGluZyBvZiBcIiNTYWxlc09yZGVyLW1hbmFnZVwiIGluIFwiI1NhbGVzT3JkZXItbWFuYWdlRnVsZmlsbG1lbnRcIlxuXHRcdFx0XHRcdFx0c0N1cnJlbnRIYXNoICs9IFwiP1wiO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGNvbnN0IGZuSXNVbmF2YWlsYWJsZUFjdGlvbiA9IGZ1bmN0aW9uIChzU2VtYW50aWNPYmplY3Q6IGFueSwgc0FjdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0XHQhIW9VbmF2YWlsYWJsZUFjdGlvbnMgJiZcblx0XHRcdFx0XHRcdFx0ISFvVW5hdmFpbGFibGVBY3Rpb25zW3NTZW1hbnRpY09iamVjdF0gJiZcblx0XHRcdFx0XHRcdFx0b1VuYXZhaWxhYmxlQWN0aW9uc1tzU2VtYW50aWNPYmplY3RdLmluZGV4T2Yoc0FjdGlvbikgPiAtMVxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGNvbnN0IGZuQWRkTGluayA9IGZ1bmN0aW9uIChfb0xpbms6IGFueSkge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1NoZWxsSGFzaCA9IG9TaGVsbFNlcnZpY2VzLnBhcnNlU2hlbGxIYXNoKF9vTGluay5pbnRlbnQpO1xuXHRcdFx0XHRcdFx0aWYgKGZuSXNVbmF2YWlsYWJsZUFjdGlvbihvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0LCBvU2hlbGxIYXNoLmFjdGlvbikpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3Qgc0hyZWYgPSBgIyR7b1NoZWxsU2VydmljZXMuY29uc3RydWN0U2hlbGxIYXNoKHsgdGFyZ2V0OiB7IHNoZWxsSGFzaDogX29MaW5rLmludGVudCB9IH0pfWA7XG5cblx0XHRcdFx0XHRcdGlmIChfb0xpbmsuaW50ZW50ICYmIF9vTGluay5pbnRlbnQuaW5kZXhPZihzQ3VycmVudEhhc2gpID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdC8vIFByZXZlbnQgY3VycmVudCBhcHAgZnJvbSBiZWluZyBsaXN0ZWRcblx0XHRcdFx0XHRcdFx0Ly8gTk9URTogSWYgdGhlIG5hdmlnYXRpb24gdGFyZ2V0IGV4aXN0cyBpblxuXHRcdFx0XHRcdFx0XHQvLyBtdWx0aXBsZSBjb250ZXh0cyAoflhYWFggaW4gaGFzaCkgdGhleSB3aWxsIGFsbCBiZSBza2lwcGVkXG5cdFx0XHRcdFx0XHRcdG9OYXZpZ2F0aW9uVGFyZ2V0cy5vd25OYXZpZ2F0aW9uID0gbmV3IExpbmtJdGVtKHtcblx0XHRcdFx0XHRcdFx0XHRocmVmOiBzSHJlZixcblx0XHRcdFx0XHRcdFx0XHR0ZXh0OiBfb0xpbmsudGV4dFxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29uc3Qgb0xpbmtJdGVtID0gbmV3IExpbmtJdGVtKHtcblx0XHRcdFx0XHRcdFx0Ly8gQXMgdGhlIHJldHJpZXZlTmF2aWdhdGlvblRhcmdldHMgbWV0aG9kIGNhbiBiZSBjYWxsZWQgc2V2ZXJhbCB0aW1lIHdlIGNhbiBub3QgY3JlYXRlIHRoZSBMaW5rSXRlbSBpbnN0YW5jZSB3aXRoIHRoZSBzYW1lIGlkXG5cdFx0XHRcdFx0XHRcdGtleTpcblx0XHRcdFx0XHRcdFx0XHRvU2hlbGxIYXNoLnNlbWFudGljT2JqZWN0ICYmIG9TaGVsbEhhc2guYWN0aW9uXG5cdFx0XHRcdFx0XHRcdFx0XHQ/IGAke29TaGVsbEhhc2guc2VtYW50aWNPYmplY3R9LSR7b1NoZWxsSGFzaC5hY3Rpb259YFxuXHRcdFx0XHRcdFx0XHRcdFx0OiB1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdHRleHQ6IF9vTGluay50ZXh0LFxuXHRcdFx0XHRcdFx0XHRkZXNjcmlwdGlvbjogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XHRocmVmOiBzSHJlZixcblx0XHRcdFx0XHRcdFx0Ly8gdGFyZ2V0OiBub3Qgc3VwcG9ydGVkIHlldFxuXHRcdFx0XHRcdFx0XHRpY29uOiB1bmRlZmluZWQsIC8vX29MaW5rLmljb24sXG5cdFx0XHRcdFx0XHRcdGluaXRpYWxseVZpc2libGU6IF9vTGluay50YWdzICYmIF9vTGluay50YWdzLmluZGV4T2YoXCJzdXBlcmlvckFjdGlvblwiKSA+IC0xXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGlmIChvTGlua0l0ZW0uZ2V0UHJvcGVydHkoXCJpbml0aWFsbHlWaXNpYmxlXCIpKSB7XG5cdFx0XHRcdFx0XHRcdGlTdXBlcmlvckFjdGlvbkxpbmtzRm91bmQrKztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9OYXZpZ2F0aW9uVGFyZ2V0cy5hdmFpbGFibGVBY3Rpb25zLnB1c2gob0xpbmtJdGVtKTtcblxuXHRcdFx0XHRcdFx0aWYgKG9JbmZvTG9nKSB7XG5cdFx0XHRcdFx0XHRcdG9JbmZvTG9nLmFkZFNlbWFudGljT2JqZWN0SW50ZW50KG9TaGVsbEhhc2guc2VtYW50aWNPYmplY3QsIHtcblx0XHRcdFx0XHRcdFx0XHRpbnRlbnQ6IG9MaW5rSXRlbS5nZXRIcmVmKCksXG5cdFx0XHRcdFx0XHRcdFx0dGV4dDogb0xpbmtJdGVtLmdldFRleHQoKVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGZvciAobGV0IG4gPSAwOyBuIDwgYVNlbWFudGljT2JqZWN0cy5sZW5ndGg7IG4rKykge1xuXHRcdFx0XHRcdFx0YUxpbmtzW25dWzBdLmZvckVhY2goZm5BZGRMaW5rKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKGlTdXBlcmlvckFjdGlvbkxpbmtzRm91bmQgPT09IDApIHtcblx0XHRcdFx0XHRcdGZvciAobGV0IGlMaW5rSXRlbUluZGV4ID0gMDsgaUxpbmtJdGVtSW5kZXggPCBvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9ucy5sZW5ndGg7IGlMaW5rSXRlbUluZGV4KyspIHtcblx0XHRcdFx0XHRcdFx0aWYgKGlMaW5rSXRlbUluZGV4IDwgdGhpcy5nZXRDb25zdGFudHMoKS5pTGlua3NTaG93bkluUG9wdXApIHtcblx0XHRcdFx0XHRcdFx0XHRvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9uc1tpTGlua0l0ZW1JbmRleF0uc2V0UHJvcGVydHkoXCJpbml0aWFsbHlWaXNpYmxlXCIsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvYmFuLXRzLWNvbW1lbnRcblx0XHRcdFx0XHQvLyBAdHMtaWdub3JlXG5cdFx0XHRcdFx0cmVzb2x2ZShvTmF2aWdhdGlvblRhcmdldHMuYXZhaWxhYmxlQWN0aW9ucywgb05hdmlnYXRpb25UYXJnZXRzLm93bk5hdmlnYXRpb24pO1xuXHRcdFx0XHR9IGNhdGNoIChvRXJyb3IpIHtcblx0XHRcdFx0XHRMb2cuZXJyb3IoXCJTaW1wbGVMaW5rRGVsZWdhdGU6ICdfcmV0cmlldmVOYXZpZ2F0aW9uVGFyZ2V0cycgZmFpbGVkIGV4ZWN1dGluZyBnZXRMaW5rcyBtZXRob2RcIik7XG5cdFx0XHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdFx0XHRcdC8vIEB0cy1pZ25vcmVcblx0XHRcdFx0XHRyZXNvbHZlKG9OYXZpZ2F0aW9uVGFyZ2V0cy5hdmFpbGFibGVBY3Rpb25zLCBvTmF2aWdhdGlvblRhcmdldHMub3duTmF2aWdhdGlvbik7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9KTtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0cyA9IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55KSB7XG5cdHJldHVybiBvUGF5bG9hZC5zZW1hbnRpY09iamVjdHMgPyBvUGF5bG9hZC5zZW1hbnRpY09iamVjdHMgOiBbXTtcbn07XG5TaW1wbGVMaW5rRGVsZWdhdGUuX2dldFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0gZnVuY3Rpb24gKG9QYXlsb2FkOiBhbnkpIHtcblx0Y29uc3QgYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRpZiAob1BheWxvYWQuc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMpIHtcblx0XHRvUGF5bG9hZC5zZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbjogYW55KSB7XG5cdFx0XHRhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMucHVzaChcblx0XHRcdFx0bmV3IFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb24oe1xuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbi5zZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRhY3Rpb25zOiBvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbi5hY3Rpb25zXG5cdFx0XHRcdH0pXG5cdFx0XHQpO1xuXHRcdH0pO1xuXHR9XG5cdHJldHVybiBhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM7XG59O1xuXG4vKipcbiAqIFRoaXMgd2lsbCByZXR1cm4gYW4gYXJyYXkgb2Yge0BsaW5rIHNhcC51aS5tZGMubGluay5TZW1hbnRpY09iamVjdE1hcHBpbmd9IGRlcGVuZGluZyBvbiB0aGUgZ2l2ZW4gcGF5bG9hZC5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIG9QYXlsb2FkIFRoZSBwYXlsb2FkIGRlZmluZWQgYnkgdGhlIGFwcGxpY2F0aW9uXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBzZW1hbnRpYyBvYmplY3QgbWFwcGluZ3MuXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fZ2V0U2VtYW50aWNPYmplY3RNYXBwaW5ncyA9IGZ1bmN0aW9uIChvUGF5bG9hZDogYW55KSB7XG5cdGNvbnN0IGFTZW1hbnRpY09iamVjdE1hcHBpbmdzOiBhbnlbXSA9IFtdO1xuXHRsZXQgYVNlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW1zOiBhbnlbXSA9IFtdO1xuXHRpZiAob1BheWxvYWQuc2VtYW50aWNPYmplY3RNYXBwaW5ncykge1xuXHRcdG9QYXlsb2FkLnNlbWFudGljT2JqZWN0TWFwcGluZ3MuZm9yRWFjaChmdW5jdGlvbiAob1NlbWFudGljT2JqZWN0TWFwcGluZzogYW55KSB7XG5cdFx0XHRhU2VtYW50aWNPYmplY3RNYXBwaW5nSXRlbXMgPSBbXTtcblx0XHRcdGlmIChvU2VtYW50aWNPYmplY3RNYXBwaW5nLml0ZW1zKSB7XG5cdFx0XHRcdG9TZW1hbnRpY09iamVjdE1hcHBpbmcuaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAob1NlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW06IGFueSkge1xuXHRcdFx0XHRcdGFTZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtcy5wdXNoKFxuXHRcdFx0XHRcdFx0bmV3IFNlbWFudGljT2JqZWN0TWFwcGluZ0l0ZW0oe1xuXHRcdFx0XHRcdFx0XHRrZXk6IG9TZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtLmtleSxcblx0XHRcdFx0XHRcdFx0dmFsdWU6IG9TZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtLnZhbHVlXG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0YVNlbWFudGljT2JqZWN0TWFwcGluZ3MucHVzaChcblx0XHRcdFx0bmV3IFNlbWFudGljT2JqZWN0TWFwcGluZyh7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IG9TZW1hbnRpY09iamVjdE1hcHBpbmcuc2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0aXRlbXM6IGFTZW1hbnRpY09iamVjdE1hcHBpbmdJdGVtc1xuXHRcdFx0XHR9KVxuXHRcdFx0KTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gYVNlbWFudGljT2JqZWN0TWFwcGluZ3M7XG59O1xuLyoqXG4gKiBDb252ZXJ0cyBhIGdpdmVuIGFycmF5IG9mIFNlbWFudGljT2JqZWN0TWFwcGluZyBpbnRvIGEgTWFwIGNvbnRhaW5pbmcgU2VtYW50aWNPYmplY3RzIGFzIEtleXMgYW5kIGEgTWFwIG9mIGl0J3MgY29ycmVzcG9uZGluZyBTZW1hbnRpY09iamVjdE1hcHBpbmdzIGFzIHZhbHVlcy5cbiAqXG4gKiBAcHJpdmF0ZVxuICogQHBhcmFtIGFTZW1hbnRpY09iamVjdE1hcHBpbmdzIEFuIGFycmF5IG9mIFNlbWFudGljT2JqZWN0TWFwcGluZ3MuXG4gKiBAcmV0dXJucyBUaGUgY29udmVydGVyZCBTZW1hbnRpY09iamVjdE1hcHBpbmdzXG4gKi9cblNpbXBsZUxpbmtEZWxlZ2F0ZS5fY29udmVydFNlbWFudGljT2JqZWN0TWFwcGluZyA9IGZ1bmN0aW9uIChhU2VtYW50aWNPYmplY3RNYXBwaW5nczogYW55W10pIHtcblx0aWYgKCFhU2VtYW50aWNPYmplY3RNYXBwaW5ncy5sZW5ndGgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGNvbnN0IG1TZW1hbnRpY09iamVjdE1hcHBpbmdzOiBhbnkgPSB7fTtcblx0YVNlbWFudGljT2JqZWN0TWFwcGluZ3MuZm9yRWFjaChmdW5jdGlvbiAob1NlbWFudGljT2JqZWN0TWFwcGluZzogYW55KSB7XG5cdFx0aWYgKCFvU2VtYW50aWNPYmplY3RNYXBwaW5nLmdldFNlbWFudGljT2JqZWN0KCkpIHtcblx0XHRcdHRocm93IEVycm9yKFxuXHRcdFx0XHRgU2ltcGxlTGlua0RlbGVnYXRlOiAnc2VtYW50aWNPYmplY3QnIHByb3BlcnR5IHdpdGggdmFsdWUgJyR7b1NlbWFudGljT2JqZWN0TWFwcGluZy5nZXRTZW1hbnRpY09iamVjdCgpfScgaXMgbm90IHZhbGlkYFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0bVNlbWFudGljT2JqZWN0TWFwcGluZ3Nbb1NlbWFudGljT2JqZWN0TWFwcGluZy5nZXRTZW1hbnRpY09iamVjdCgpXSA9IG9TZW1hbnRpY09iamVjdE1hcHBpbmdcblx0XHRcdC5nZXRJdGVtcygpXG5cdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChvTWFwOiBhbnksIG9JdGVtOiBhbnkpIHtcblx0XHRcdFx0b01hcFtvSXRlbS5nZXRLZXkoKV0gPSBvSXRlbS5nZXRWYWx1ZSgpO1xuXHRcdFx0XHRyZXR1cm4gb01hcDtcblx0XHRcdH0sIHt9KTtcblx0fSk7XG5cdHJldHVybiBtU2VtYW50aWNPYmplY3RNYXBwaW5ncztcbn07XG4vKipcbiAqIENvbnZlcnRzIGEgZ2l2ZW4gYXJyYXkgb2YgU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgaW50byBhIG1hcCBjb250YWluaW5nIFNlbWFudGljT2JqZWN0cyBhcyBrZXlzIGFuZCBhIG1hcCBvZiBpdHMgY29ycmVzcG9uZGluZyBTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyBhcyB2YWx1ZXMuXG4gKlxuICogQHByaXZhdGVcbiAqIEBwYXJhbSBhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMgVGhlIFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIGNvbnZlcnRlZFxuICogQHJldHVybnMgVGhlIG1hcCBjb250YWluaW5nIHRoZSBjb252ZXJ0ZWQgU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNcbiAqL1xuU2ltcGxlTGlua0RlbGVnYXRlLl9jb252ZXJ0U2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbiA9IGZ1bmN0aW9uIChhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM6IGFueVtdKSB7XG5cdGxldCBfU2VtYW50aWNPYmplY3ROYW1lOiBhbnk7XG5cdGxldCBfU2VtYW50aWNPYmplY3RIYXNBbHJlYWR5VW5hdmFpbGFibGVBY3Rpb25zOiBhbnk7XG5cdGxldCBfVW5hdmFpbGFibGVBY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRpZiAoIWFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5sZW5ndGgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGNvbnN0IG1TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczogYW55ID0ge307XG5cdGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM6IGFueSkge1xuXHRcdF9TZW1hbnRpY09iamVjdE5hbWUgPSBvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMuZ2V0U2VtYW50aWNPYmplY3QoKTtcblx0XHRpZiAoIV9TZW1hbnRpY09iamVjdE5hbWUpIHtcblx0XHRcdHRocm93IEVycm9yKGBTaW1wbGVMaW5rRGVsZWdhdGU6ICdzZW1hbnRpY09iamVjdCcgcHJvcGVydHkgd2l0aCB2YWx1ZSAnJHtfU2VtYW50aWNPYmplY3ROYW1lfScgaXMgbm90IHZhbGlkYCk7XG5cdFx0fVxuXHRcdF9VbmF2YWlsYWJsZUFjdGlvbnMgPSBvU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMuZ2V0QWN0aW9ucygpO1xuXHRcdGlmIChtU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNbX1NlbWFudGljT2JqZWN0TmFtZV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0bVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zW19TZW1hbnRpY09iamVjdE5hbWVdID0gX1VuYXZhaWxhYmxlQWN0aW9ucztcblx0XHR9IGVsc2Uge1xuXHRcdFx0X1NlbWFudGljT2JqZWN0SGFzQWxyZWFkeVVuYXZhaWxhYmxlQWN0aW9ucyA9IG1TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1tfU2VtYW50aWNPYmplY3ROYW1lXTtcblx0XHRcdF9VbmF2YWlsYWJsZUFjdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoVW5hdmFpbGFibGVBY3Rpb246IHN0cmluZykge1xuXHRcdFx0XHRfU2VtYW50aWNPYmplY3RIYXNBbHJlYWR5VW5hdmFpbGFibGVBY3Rpb25zLnB1c2goVW5hdmFpbGFibGVBY3Rpb24pO1xuXHRcdFx0fSk7XG5cdFx0XHRtU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNbX1NlbWFudGljT2JqZWN0TmFtZV0gPSBfU2VtYW50aWNPYmplY3RIYXNBbHJlYWR5VW5hdmFpbGFibGVBY3Rpb25zO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBtU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTaW1wbGVMaW5rRGVsZWdhdGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBa2pCTyxnQkFBZ0JBLElBQUksRUFBRUMsT0FBTyxFQUFFO0lBQ3JDLElBQUk7TUFDSCxJQUFJQyxNQUFNLEdBQUdGLElBQUksRUFBRTtJQUNwQixDQUFDLENBQUMsT0FBTUcsQ0FBQyxFQUFFO01BQ1YsT0FBT0YsT0FBTyxDQUFDRSxDQUFDLENBQUM7SUFDbEI7SUFDQSxJQUFJRCxNQUFNLElBQUlBLE1BQU0sQ0FBQ0UsSUFBSSxFQUFFO01BQzFCLE9BQU9GLE1BQU0sQ0FBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFSCxPQUFPLENBQUM7SUFDcEM7SUFDQSxPQUFPQyxNQUFNO0VBQ2Q7RUFyaEJPLGlCQUFpQkcsSUFBSSxFQUFFQyxLQUFLLEVBQUVDLEtBQUssRUFBRTtJQUMzQyxJQUFJLENBQUNGLElBQUksQ0FBQ0csQ0FBQyxFQUFFO01BQ1osSUFBSUQsS0FBSyxpQkFBaUIsRUFBRTtRQUMzQixJQUFJQSxLQUFLLENBQUNDLENBQUMsRUFBRTtVQUNaLElBQUlGLEtBQUssR0FBRyxDQUFDLEVBQUU7WUFDZEEsS0FBSyxHQUFHQyxLQUFLLENBQUNDLENBQUM7VUFDaEI7VUFDQUQsS0FBSyxHQUFHQSxLQUFLLENBQUNFLENBQUM7UUFDaEIsQ0FBQyxNQUFNO1VBQ05GLEtBQUssQ0FBQ0csQ0FBQyxHQUFHLFFBQVFDLElBQUksQ0FBQyxJQUFJLEVBQUVOLElBQUksRUFBRUMsS0FBSyxDQUFDO1VBQ3pDO1FBQ0Q7TUFDRDtNQUNBLElBQUlDLEtBQUssSUFBSUEsS0FBSyxDQUFDSCxJQUFJLEVBQUU7UUFDeEJHLEtBQUssQ0FBQ0gsSUFBSSxDQUFDLFFBQVFPLElBQUksQ0FBQyxJQUFJLEVBQUVOLElBQUksRUFBRUMsS0FBSyxDQUFDLEVBQUUsUUFBUUssSUFBSSxDQUFD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