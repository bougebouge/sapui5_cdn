/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/deepClone", "sap/base/util/uid", "sap/fe/core/buildingBlocks/AttributeModel", "sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/ResourceModel", "sap/ui/base/BindingParser", "sap/ui/core/util/XMLPreprocessor", "./TraceInfo"], function (Log, deepClone, uid, AttributeModel, BindingToolkit, ResourceModel, BindingParser, XMLPreprocessor, TraceInfo) {
  "use strict";

  function _forOf(target, body, check) {
    if (typeof target[_iteratorSymbol] === "function") {
      var iterator = target[_iteratorSymbol](),
        step,
        pact,
        reject;
      function _cycle(result) {
        try {
          while (!(step = iterator.next()).done && (!check || !check())) {
            result = body(step.value);
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
      if (iterator.return) {
        var _fixup = function (value) {
          try {
            if (!step.done) {
              iterator.return();
            }
          } catch (e) {}
          return value;
        };
        if (pact && pact.then) {
          return pact.then(_fixup, function (e) {
            throw _fixup(e);
          });
        }
        _fixup();
      }
      return pact;
    }
    // No support for Symbol.iterator
    if (!("length" in target)) {
      throw new TypeError("Object is not iterable");
    }
    // Handle live collections properly
    var values = [];
    for (var i = 0; i < target.length; i++) {
      values.push(target[i]);
    }
    return _forTo(values, function (i) {
      return body(values[i]);
    }, check);
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
  var _iteratorSymbol = /*#__PURE__*/typeof Symbol !== "undefined" ? Symbol.iterator || (Symbol.iterator = Symbol("Symbol.iterator")) : "@@iterator";
  var _templateObject, _templateObject2, _templateObject3, _templateObject4;
  var _exports = {};
  var compileExpression = BindingToolkit.compileExpression;
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
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
  function _for(test, update, body) {
    var stage;
    for (;;) {
      var shouldContinue = test();
      if (_isSettledPact(shouldContinue)) {
        shouldContinue = shouldContinue.v;
      }
      if (!shouldContinue) {
        return result;
      }
      if (shouldContinue.then) {
        stage = 0;
        break;
      }
      var result = body();
      if (result && result.then) {
        if (_isSettledPact(result)) {
          result = result.s;
        } else {
          stage = 1;
          break;
        }
      }
      if (update) {
        var updateValue = update();
        if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
          stage = 2;
          break;
        }
      }
    }
    var pact = new _Pact();
    var reject = _settle.bind(null, pact, 2);
    (stage === 0 ? shouldContinue.then(_resumeAfterTest) : stage === 1 ? result.then(_resumeAfterBody) : updateValue.then(_resumeAfterUpdate)).then(void 0, reject);
    return pact;
    function _resumeAfterBody(value) {
      result = value;
      do {
        if (update) {
          updateValue = update();
          if (updateValue && updateValue.then && !_isSettledPact(updateValue)) {
            updateValue.then(_resumeAfterUpdate).then(void 0, reject);
            return;
          }
        }
        shouldContinue = test();
        if (!shouldContinue || _isSettledPact(shouldContinue) && !shouldContinue.v) {
          _settle(pact, 1, result);
          return;
        }
        if (shouldContinue.then) {
          shouldContinue.then(_resumeAfterTest).then(void 0, reject);
          return;
        }
        result = body();
        if (_isSettledPact(result)) {
          result = result.v;
        }
      } while (!result || !result.then);
      result.then(_resumeAfterBody).then(void 0, reject);
    }
    function _resumeAfterTest(shouldContinue) {
      if (shouldContinue) {
        result = body();
        if (result && result.then) {
          result.then(_resumeAfterBody).then(void 0, reject);
        } else {
          _resumeAfterBody(result);
        }
      } else {
        _settle(pact, 1, result);
      }
    }
    function _resumeAfterUpdate() {
      if (shouldContinue = test()) {
        if (shouldContinue.then) {
          shouldContinue.then(_resumeAfterTest).then(void 0, reject);
        } else {
          _resumeAfterTest(shouldContinue);
        }
      } else {
        _settle(pact, 1, result);
      }
    }
  }
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
  function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  var processBuildingBlock = function (buildingBlockDefinition, oNode, oVisitor) {
    var isPublic = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    try {
      var sFragmentName = buildingBlockDefinition.fragment || "".concat(buildingBlockDefinition.namespace, ".").concat(buildingBlockDefinition.name);
      var sName = "this";
      var mContexts = {};
      var oMetadataContexts = {};
      var oSettings = oVisitor.getSettings();
      // TODO 0001 Move this elsewhere this is weird :)
      if (oSettings.models["sap.fe.i18n"]) {
        oSettings.models["sap.fe.i18n"].getResourceBundle().then(function (oResourceBundle) {
          ResourceModel.setApplicationI18nBundle(oResourceBundle);
        }).catch(function (error) {
          Log.error(error);
        });
      }
      var oMetadata = prepareMetadata(buildingBlockDefinition.metadata, buildingBlockDefinition.isOpen);

      //Inject storage for macros
      if (!oSettings[sFragmentName]) {
        oSettings[sFragmentName] = {};
      }

      // First of all we need to visit the attributes to resolve the properties and the metadata contexts
      return Promise.resolve(processProperties(oMetadata, oNode, isPublic, oVisitor, buildingBlockDefinition.apiVersion)).then(function (propertyValues) {
        return Promise.resolve(processContexts(oMetadata, oSettings, oNode, isPublic, oVisitor, mContexts, oMetadataContexts)).then(function (_ref) {
          var mMissingContext = _ref.mMissingContext,
            extraPropertyValues = _ref.propertyValues;
          propertyValues = Object.assign(propertyValues, extraPropertyValues);
          var initialKeys = Object.keys(propertyValues);
          var _temp18 = _catch(function () {
            // Aggregation and complex type support
            return Promise.resolve(processChildren(oNode, oVisitor, oMetadata, isPublic, propertyValues, buildingBlockDefinition.apiVersion)).then(function (oAggregations) {
              function _temp17() {
                if (oPreviousMacroInfo) {
                  //restore macro info if available
                  oSettings["_macroInfo"] = oPreviousMacroInfo;
                } else {
                  delete oSettings["_macroInfo"];
                }
              }
              var oInstance;
              var oControlConfig = {};
              if (oSettings.models.viewData) {
                // Only used in the Field macro and even then maybe not really useful
                oControlConfig = oSettings.models.viewData.getProperty("/controlConfiguration");
              }
              var processedPropertyValues = propertyValues;
              if (isV1MacroDef(buildingBlockDefinition) && buildingBlockDefinition.create) {
                processedPropertyValues = buildingBlockDefinition.create.call(buildingBlockDefinition, propertyValues, oControlConfig, oSettings, oAggregations, isPublic);
                Object.keys(oMetadata.metadataContexts).forEach(function (sMetadataName) {
                  if (oMetadata.metadataContexts[sMetadataName].computed === true) {
                    mContexts[sMetadataName] = processedPropertyValues[sMetadataName];
                  }
                });
                Object.keys(mMissingContext).forEach(function (sContextName) {
                  if (processedPropertyValues.hasOwnProperty(sContextName)) {
                    mContexts[sContextName] = processedPropertyValues[sContextName];
                  }
                });
              } else if (buildingBlockDefinition.apiVersion === 2) {
                Object.keys(propertyValues).forEach(function (propName) {
                  var oData = propertyValues[propName];
                  if (oData && oData.isA && oData.isA(SAP_UI_MODEL_CONTEXT) && !oData.getModel().isA("sap.ui.model.odata.v4.ODataMetaModel")) {
                    propertyValues[propName] = oData.getObject();
                  }
                });
                var BuildingBlockClass = buildingBlockDefinition;
                propertyValues.isPublic = isPublic;
                oInstance = new BuildingBlockClass(_objectSpread(_objectSpread({}, propertyValues), oAggregations), oControlConfig, oSettings
                /*, oControlConfig, oSettings, oAggregations, isPublic*/);

                processedPropertyValues = oInstance.getProperties();
                Object.keys(oMetadata.metadataContexts).forEach(function (sContextName) {
                  if (processedPropertyValues.hasOwnProperty(sContextName)) {
                    var targetObject = processedPropertyValues[sContextName];
                    if (typeof targetObject === "object" && !targetObject.getObject) {
                      var sAttributeValue = storeValue(targetObject);
                      var sContextPath = "".concat(sAttributeValue);
                      oSettings.models.converterContext.setProperty(sContextPath, targetObject);
                      targetObject = oSettings.models.converterContext.createBindingContext(sContextPath);
                      delete myStore[sAttributeValue];
                      mContexts[sContextName] = targetObject;
                    } else if (!mContexts.hasOwnProperty(sContextName) && targetObject !== undefined) {
                      mContexts[sContextName] = targetObject;
                    }
                  }
                });
              }
              var oAttributesModel = new AttributeModel(oNode, processedPropertyValues, buildingBlockDefinition);
              mContexts[sName] = oAttributesModel.createBindingContext("/");
              var oPreviousMacroInfo;

              // Keep track
              if (TraceInfo.isTraceInfoActive()) {
                var oTraceInfo = TraceInfo.traceMacroCalls(sFragmentName, oMetadata, mContexts, oNode, oVisitor);
                if (oTraceInfo) {
                  oPreviousMacroInfo = oSettings["_macroInfo"];
                  oSettings["_macroInfo"] = oTraceInfo.macroInfo;
                }
              }
              validateMacroSignature(sFragmentName, oMetadata, mContexts, oNode);
              var oContextVisitor = oVisitor.with(mContexts, buildingBlockDefinition.isOpen !== undefined ? !buildingBlockDefinition.isOpen : true);
              var oParent = oNode.parentNode;
              var iChildIndex;
              var oPromise;
              var processCustomData = true;
              var _temp16 = function () {
                if (oParent) {
                  iChildIndex = Array.from(oParent.children).indexOf(oNode);
                  if (isV1MacroDef(buildingBlockDefinition) && buildingBlockDefinition.getTemplate || buildingBlockDefinition.apiVersion === 2 && !buildingBlockDefinition.fragment) {
                    var oTemplate;
                    var addDefaultNamespace = false;
                    if (buildingBlockDefinition.apiVersion === 2) {
                      oTemplate = oInstance.getTemplate();
                      if (buildingBlockDefinition.isRuntime === true) {
                        for (var myStoreKey in myStore) {
                          var oData = myStore[myStoreKey];
                          var sContextPath = "".concat(myStoreKey);
                          oSettings.models.converterContext.setProperty(sContextPath, oData);
                          delete myStore[myStoreKey];
                        }
                      }
                      addDefaultNamespace = true;
                    } else if (buildingBlockDefinition.getTemplate) {
                      oTemplate = buildingBlockDefinition.getTemplate(processedPropertyValues);
                    }
                    var hasError = "";
                    if (oTemplate) {
                      if (!oTemplate.firstElementChild) {
                        oTemplate = parseXMLString(oTemplate, addDefaultNamespace);
                        // For safety purpose we try to detect trailing text in between XML Tags
                        var iter = document.createNodeIterator(oTemplate, NodeFilter.SHOW_TEXT);
                        var textnode = iter.nextNode();
                        while (textnode) {
                          if (textnode.textContent && textnode.textContent.trim().length > 0) {
                            hasError = textnode.textContent;
                          }
                          textnode = iter.nextNode();
                        }
                      }
                      if (oTemplate.localName === "parsererror") {
                        // If there is a parseerror while processing the XML it means the XML itself is malformed, as such we rerun the template process
                        // Setting isTraceMode true will make it so that each xml` expression is checked for validity from XML perspective
                        // If an error is found it's returned instead of the normal fragment
                        Log.error("Error while processing building block ".concat(buildingBlockDefinition.name));
                        try {
                          var _oInstance;
                          isTraceMode = true;
                          oTemplate = (_oInstance = oInstance) !== null && _oInstance !== void 0 && _oInstance.getTemplate ? oInstance.getTemplate() : buildingBlockDefinition.getTemplate(processedPropertyValues);
                          oTemplate = parseXMLString(oTemplate, true);
                        } finally {
                          isTraceMode = false;
                        }
                      } else if (hasError.length > 0) {
                        // If there is trailing text we create a standard error and display it.
                        Log.error("Error while processing building block ".concat(buildingBlockDefinition.name));
                        var oErrorText = createErrorXML(["Error while processing building block ".concat(buildingBlockDefinition.name), "Trailing text was found in the XML: ".concat(hasError)], oTemplate.outerHTML);
                        oTemplate = parseXMLString(oErrorText, true);
                      }
                      oNode.replaceWith(oTemplate);
                      oNode = oParent.children[iChildIndex];
                      processSlots(oAggregations, oMetadata.aggregations, oNode, processCustomData);
                      processCustomData = false;
                      oPromise = oContextVisitor.visitNode(oNode);
                    } else {
                      oNode.remove();
                      oPromise = Promise.resolve();
                    }
                  } else {
                    oPromise = oContextVisitor.insertFragment(sFragmentName, oNode);
                  }
                  return Promise.resolve(oPromise).then(function () {
                    var oMacroElement = oParent.children[iChildIndex];
                    processSlots(oAggregations, oMetadata.aggregations, oMacroElement, processCustomData);
                    if (oMacroElement !== undefined) {
                      var oRemainingSlots = oMacroElement.querySelectorAll("slot");
                      oRemainingSlots.forEach(function (oSlotElement) {
                        oSlotElement.remove();
                      });
                    }
                  });
                }
              }();
              return _temp16 && _temp16.then ? _temp16.then(_temp17) : _temp17(_temp16);
            });
          }, function (e) {
            // In case there is a generic error (usually code error), we retrieve the current context information and create a dedicated error message
            var traceDetails = {
              initialProperties: {},
              resolvedProperties: {},
              missingContexts: mMissingContext
            };
            var _iterator = _createForOfIteratorHelper(initialKeys),
              _step;
            try {
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                var _propertyName = _step.value;
                var _propertyValue = propertyValues[_propertyName];
                if (_propertyValue && _propertyValue.isA && _propertyValue.isA(SAP_UI_MODEL_CONTEXT)) {
                  traceDetails.initialProperties[_propertyName] = {
                    path: _propertyValue.getPath(),
                    value: _propertyValue.getObject()
                  };
                } else {
                  traceDetails.initialProperties[_propertyName] = _propertyValue;
                }
              }
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
            for (var propertyName in propertyValues) {
              var propertyValue = propertyValues[propertyName];
              if (!initialKeys.includes(propertyName)) {
                if (propertyValue && propertyValue.isA && propertyValue.isA(SAP_UI_MODEL_CONTEXT)) {
                  traceDetails.resolvedProperties[propertyName] = {
                    path: propertyValue.getPath(),
                    value: propertyValue.getObject()
                  };
                } else {
                  traceDetails.resolvedProperties[propertyName] = propertyValue;
                }
              }
            }
            var errorAny = e;
            Log.error(errorAny, errorAny);
            var oError = createErrorXML(["Error while processing building block ".concat(buildingBlockDefinition.name)], oNode.outerHTML, traceDetails, errorAny.stack);
            var oTemplate = parseXMLString(oError, true);
            oNode.replaceWith(oTemplate);
          });
          if (_temp18 && _temp18.then) return _temp18.then(function () {});
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var processChildren = function (oNode, oVisitor, oMetadata, isPublic, propertyValues, apiVersion) {
    try {
      var oAggregations = {};
      var _temp10 = function () {
        if (oNode.firstElementChild !== null) {
          function _temp11() {
            _oFirstElementChild = oNode.firstElementChild;
            var _temp6 = _for(function () {
              return _oFirstElementChild !== null;
            }, void 0, function () {
              function _temp5() {
                _oFirstElementChild = oNextChild;
              }
              var oNextChild = _oFirstElementChild.nextElementSibling;
              var sChildName = _oFirstElementChild.localName;
              var sAggregationName = sChildName;
              if (sAggregationName[0].toUpperCase() === sAggregationName[0]) {
                // not a sub aggregation, go back to default Aggregation
                sAggregationName = oMetadata.defaultAggregation || "";
              }
              var _temp4 = function () {
                if (Object.keys(oMetadata.aggregations).indexOf(sAggregationName) !== -1 && (!isPublic || oMetadata.aggregations[sAggregationName].isPublic === true)) {
                  var _temp13 = function () {
                    if (apiVersion === 2) {
                      var aggregationDefinition = oMetadata.aggregations[sAggregationName];
                      var _temp14 = function () {
                        if (!aggregationDefinition.slot && _oFirstElementChild !== null && _oFirstElementChild.children.length > 0) {
                          return Promise.resolve(oVisitor.visitNode(_oFirstElementChild)).then(function () {
                            var childDefinition = _oFirstElementChild.firstElementChild;
                            while (childDefinition) {
                              var oNewChild = document.createElementNS(oNode.namespaceURI, childDefinition.getAttribute("key"));
                              var nextChild = childDefinition.nextElementSibling;
                              oNewChild.appendChild(childDefinition);
                              oAggregations[childDefinition.getAttribute("key")] = oNewChild;
                              childDefinition.removeAttribute("key");
                              childDefinition = nextChild;
                            }
                          });
                        } else if (aggregationDefinition.slot) {
                          if (sAggregationName !== sChildName) {
                            if (!oAggregations[sAggregationName]) {
                              var oNewChild = document.createElementNS(oNode.namespaceURI, sAggregationName);
                              oAggregations[sAggregationName] = oNewChild;
                            }
                            oAggregations[sAggregationName].appendChild(_oFirstElementChild);
                          } else {
                            oAggregations[sAggregationName] = _oFirstElementChild;
                          }
                        }
                      }();
                      if (_temp14 && _temp14.then) return _temp14.then(function () {});
                    } else {
                      return Promise.resolve(oVisitor.visitNode(_oFirstElementChild)).then(function () {
                        oAggregations[_oFirstElementChild.localName] = _oFirstElementChild;
                      });
                    }
                  }();
                  if (_temp13 && _temp13.then) return _temp13.then(function () {});
                } else {
                  var _temp15 = function () {
                    if (Object.keys(oMetadata.properties).indexOf(sAggregationName) !== -1) {
                      return Promise.resolve(oVisitor.visitNode(_oFirstElementChild)).then(function () {
                        if (oMetadata.properties[sAggregationName].type === "object") {
                          // Object Type properties
                          propertyValues[sAggregationName] = {};
                          for (var _i2 = 0, _Object$keys = Object.keys(_oFirstElementChild.attributes); _i2 < _Object$keys.length; _i2++) {
                            var attributeIndex = _Object$keys[_i2];
                            propertyValues[sAggregationName][_oFirstElementChild.attributes[attributeIndex].localName] = _oFirstElementChild.attributes[attributeIndex].value;
                          }
                        } else if (oMetadata.properties[sAggregationName].type === "array") {
                          if (_oFirstElementChild !== null && _oFirstElementChild.children.length > 0) {
                            var children = _oFirstElementChild.children;
                            var oOutObjects = [];
                            for (var childIdx = 0; childIdx < children.length; childIdx++) {
                              var childDefinition = children[childIdx];
                              // non keyed child, just add it to the aggregation
                              var myChild = {};
                              for (var _i3 = 0, _Object$keys2 = Object.keys(childDefinition.attributes); _i3 < _Object$keys2.length; _i3++) {
                                var _attributeIndex = _Object$keys2[_i3];
                                myChild[childDefinition.attributes[_attributeIndex].localName] = childDefinition.attributes[_attributeIndex].value;
                              }
                              oOutObjects.push(myChild);
                            }
                            propertyValues[sAggregationName] = oOutObjects;
                          }
                        }
                      });
                    }
                  }();
                  if (_temp15 && _temp15.then) return _temp15.then(function () {});
                }
              }();
              return _temp4 && _temp4.then ? _temp4.then(_temp5) : _temp5(_temp4);
            });
            if (_temp6 && _temp6.then) return _temp6.then(function () {});
          }
          var _oFirstElementChild = oNode.firstElementChild;
          if (apiVersion === 2) {
            while (_oFirstElementChild !== null) {
              var sChildName = _oFirstElementChild.localName;
              var sAggregationName = sChildName;
              if (sAggregationName[0].toUpperCase() === sAggregationName[0]) {
                // not a sub aggregation, go back to default Aggregation
                sAggregationName = oMetadata.defaultAggregation || "";
              }
              var aggregationDefinition = oMetadata.aggregations[sAggregationName];
              if (aggregationDefinition !== undefined && !aggregationDefinition.slot) {
                var parsedAggregation = parseAggregation(_oFirstElementChild);
                oAggregations[sAggregationName] = parsedAggregation;
                for (var parsedAggregationKey in parsedAggregation) {
                  oMetadata.aggregations[parsedAggregationKey] = parsedAggregation[parsedAggregationKey];
                }
              }
              _oFirstElementChild = _oFirstElementChild.nextElementSibling;
            }
          }
          var _temp12 = function () {
            if (apiVersion !== 2) {
              // If there are aggregation we need to visit the childNodes to resolve templating instructions
              return Promise.resolve(oVisitor.visitChildNodes(oNode)).then(function () {});
            }
          }();
          return _temp12 && _temp12.then ? _temp12.then(_temp11) : _temp11(_temp12);
        }
      }();
      return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(function () {
        return oAggregations;
      }) : oAggregations);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Parse the incoming XML node and try to resolve the binding contexts defined inside.
   *
   * @param oMetadata The metadata for the building block
   * @param oSettings The settings object
   * @param oNode The XML node to parse
   * @param isPublic Whether the building block is used in a public context or not
   * @param oVisitor The visitor instance
   * @param mContexts The contexts to be used
   * @param oMetadataContexts	The metadata contexts to be used
   */
  var processContexts = function (oMetadata, oSettings, oNode, isPublic, oVisitor, mContexts, oMetadataContexts) {
    try {
      oSettings.currentContextPath = oSettings.bindingContexts.contextPath;
      var mMissingContext = {};
      var propertyValues = {};
      var oDefinitionContexts = oMetadata.metadataContexts;
      var aDefinitionContextsKeys = Object.keys(oDefinitionContexts);
      // Since the metaPath and other property can be relative to the contextPath we need to evaluate the current contextPath first
      var contextPathIndex = aDefinitionContextsKeys.indexOf("contextPath");
      if (contextPathIndex !== -1) {
        // If it is defined we extract it and reinsert it in the first position of the array
        var contextPathDefinition = aDefinitionContextsKeys.splice(contextPathIndex, 1);
        aDefinitionContextsKeys.splice(0, 0, contextPathDefinition[0]);
      }
      for (var _i = 0, _aDefinitionContextsK = aDefinitionContextsKeys; _i < _aDefinitionContextsK.length; _i++) {
        var sAttributeName = _aDefinitionContextsK[_i];
        var bDoNotResolve = isPublic && oDefinitionContexts[sAttributeName].isPublic === false && oNode.hasAttribute(sAttributeName);
        var oMetadataContext = _getMetadataContext(oSettings, oNode, sAttributeName, oVisitor, bDoNotResolve, oMetadata.isOpen);
        if (oMetadataContext) {
          oMetadataContext.name = sAttributeName;
          addSingleContext(mContexts, oVisitor, oMetadataContext, oMetadataContexts);
          if ((sAttributeName === "entitySet" || sAttributeName === "contextPath") && !oSettings.bindingContexts.hasOwnProperty(sAttributeName)) {
            oSettings.bindingContexts[sAttributeName] = mContexts[sAttributeName];
          }
          if (sAttributeName === "contextPath") {
            oSettings.currentContextPath = mContexts[sAttributeName];
          }
          propertyValues[sAttributeName] = mContexts[sAttributeName];
        } else {
          mMissingContext[sAttributeName] = true;
        }
      }
      return Promise.resolve({
        mMissingContext: mMissingContext,
        propertyValues: propertyValues
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Parse the incoming XML node and try to resolve the properties defined there.
   *
   * @param oMetadata The metadata for the building block
   * @param oNode The XML node to parse
   * @param isPublic Whether the building block is used in a public context or not
   * @param oVisitor The visitor instance
   * @param apiVersion The API version of the building block
   */
  var processProperties = function (oMetadata, oNode, isPublic, oVisitor, apiVersion) {
    try {
      var oDefinitionProperties = oMetadata.properties;

      // Retrieve properties values
      var aDefinitionPropertiesKeys = Object.keys(oDefinitionProperties);
      var propertyValues = {};
      var _temp22 = _forOf(aDefinitionPropertiesKeys, function (sKeyValue) {
        if (oDefinitionProperties[sKeyValue].type === "object") {
          propertyValues[sKeyValue] = deepClone(oDefinitionProperties[sKeyValue].defaultValue || {}); // To avoid values being reused across macros
        } else {
          propertyValues[sKeyValue] = oDefinitionProperties[sKeyValue].defaultValue;
        }
        var _temp20 = function () {
          if (oNode.hasAttribute(sKeyValue) && isPublic && oDefinitionProperties[sKeyValue].isPublic === false) {
            Log.error("Property ".concat(sKeyValue, " was ignored as it is not intended for public usage"));
          } else {
            var _temp23 = function () {
              if (oNode.hasAttribute(sKeyValue)) {
                return Promise.resolve(oVisitor.visitAttribute(oNode, oNode.attributes.getNamedItem(sKeyValue))).then(function () {
                  var vValue = oNode.getAttribute(sKeyValue);
                  if (vValue !== undefined) {
                    if (apiVersion === 2 && typeof vValue === "string" && !vValue.startsWith("{")) {
                      switch (oDefinitionProperties[sKeyValue].type) {
                        case "boolean":
                          vValue = vValue === "true";
                          break;
                        case "number":
                          vValue = Number(vValue);
                          break;
                      }
                    }
                    propertyValues[sKeyValue] = vValue;
                  }
                });
              }
            }();
            if (_temp23 && _temp23.then) return _temp23.then(function () {});
          }
        }();
        if (_temp20 && _temp20.then) return _temp20.then(function () {});
      });
      return Promise.resolve(_temp22 && _temp22.then ? _temp22.then(function () {
        return propertyValues;
      }) : propertyValues);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var LOGGER_SCOPE = "sap.fe.core.buildingBlocks.BuildingBlockRuntime";
  var DOMParserInstance = new DOMParser();
  var isTraceMode = false;
  /**
   * Typeguard for checking if a building block use API 1.
   *
   * @param buildingBlockDefinition
   * @returns `true` if the building block is using API 1.
   */
  function isV1MacroDef(buildingBlockDefinition) {
    return buildingBlockDefinition.apiVersion === undefined || buildingBlockDefinition.apiVersion === 1;
  }
  function validateMacroMetadataContext(sName, mContexts, oContextSettings, sKey) {
    var oContext = mContexts[sKey];
    var oContextObject = oContext === null || oContext === void 0 ? void 0 : oContext.getObject();
    if (oContextSettings.required === true && (!oContext || oContextObject === null)) {
      throw new Error("".concat(sName, ": Required metadataContext '").concat(sKey, "' is missing"));
    } else if (oContextObject) {
      // If context object has $kind property, $Type should not be checked
      // Therefore remove from context settings
      if (oContextObject.hasOwnProperty("$kind") && oContextSettings.$kind) {
        // Check if the $kind is part of the allowed ones
        if (oContextSettings.$kind.indexOf(oContextObject["$kind"]) === -1) {
          throw new Error("".concat(sName, ": '").concat(sKey, "' must be '$kind' '").concat(oContextSettings["$kind"], "' but is '").concat(oContextObject.$kind, "': ").concat(oContext.getPath()));
        }
      } else if (oContextObject.hasOwnProperty("$Type") && oContextSettings.$Type) {
        // Check only $Type
        if (oContextSettings.$Type.indexOf(oContextObject["$Type"]) === -1) {
          throw new Error("".concat(sName, ": '").concat(sKey, "' must be '$Type' '").concat(oContextSettings["$Type"], "' but is '").concat(oContextObject.$Type, "': ").concat(oContext.getPath()));
        }
      }
    }
  }
  function validateMacroSignature(sName, oMetadata, mContexts, oNode) {
    var aMetadataContextKeys = oMetadata.metadataContexts && Object.keys(oMetadata.metadataContexts) || [],
      aProperties = oMetadata.properties && Object.keys(oMetadata.properties) || [],
      oAttributeNames = {};

    // collect all attributes to find unchecked properties
    Object.keys(oNode.attributes).forEach(function (iKey) {
      var sKey = oNode.attributes[iKey].name;
      oAttributeNames[sKey] = true;
    });

    //Check metadataContexts
    aMetadataContextKeys.forEach(function (sKey) {
      var oContextSettings = oMetadata.metadataContexts[sKey];
      validateMacroMetadataContext(sName, mContexts, oContextSettings, sKey);
      delete oAttributeNames[sKey];
    });
    //Check properties
    aProperties.forEach(function (sKey) {
      var oPropertySettings = oMetadata.properties[sKey];
      if (!oNode.hasAttribute(sKey)) {
        if (oPropertySettings.required && !oPropertySettings.hasOwnProperty("defaultValue")) {
          throw new Error("".concat(sName, ": ") + "Required property '".concat(sKey, "' is missing"));
        }
      } else {
        delete oAttributeNames[sKey];
      }
    });

    // Unchecked properties
    Object.keys(oAttributeNames).forEach(function (sKey) {
      // no check for properties which start with underscore "_" or contain a colon ":" (different namespace), e.g. xmlns:trace, trace:macroID, unittest:id
      if (sKey.indexOf(":") < 0 && !sKey.startsWith("xmlns")) {
        Log.warning("Unchecked parameter: ".concat(sName, ": ").concat(sKey), undefined, LOGGER_SCOPE);
      }
    });
  }
  _exports.validateMacroSignature = validateMacroSignature;
  var SAP_UI_CORE_ELEMENT = "sap.ui.core.Element";
  var SAP_UI_MODEL_CONTEXT = "sap.ui.model.Context";

  /**
   * Ensures that the metadata for the building block are properly defined.
   *
   * @param buildingBlockMetadata The metadata received from the input
   * @param isOpen Whether the building block is open or not
   * @returns A set of completed metadata for further processing
   */
  function prepareMetadata(buildingBlockMetadata) {
    var isOpen = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (buildingBlockMetadata) {
      var oProperties = {};
      var oAggregations = {
        "dependents": {
          type: SAP_UI_CORE_ELEMENT
        },
        "customData": {
          type: SAP_UI_CORE_ELEMENT
        }
      };
      var oMetadataContexts = {};
      var foundDefaultAggregation;
      Object.keys(buildingBlockMetadata.properties).forEach(function (sPropertyName) {
        if (buildingBlockMetadata.properties[sPropertyName].type !== SAP_UI_MODEL_CONTEXT) {
          oProperties[sPropertyName] = buildingBlockMetadata.properties[sPropertyName];
        } else {
          oMetadataContexts[sPropertyName] = buildingBlockMetadata.properties[sPropertyName];
        }
      });
      // Merge events into properties as they are handled identically
      if (buildingBlockMetadata.events !== undefined) {
        Object.keys(buildingBlockMetadata.events).forEach(function (sEventName) {
          oProperties[sEventName] = buildingBlockMetadata.events[sEventName];
        });
      }
      if (buildingBlockMetadata.aggregations !== undefined) {
        Object.keys(buildingBlockMetadata.aggregations).forEach(function (sPropertyName) {
          oAggregations[sPropertyName] = buildingBlockMetadata.aggregations[sPropertyName];
          if (oAggregations[sPropertyName].isDefault) {
            foundDefaultAggregation = sPropertyName;
          }
        });
      }
      return {
        properties: oProperties,
        aggregations: oAggregations,
        defaultAggregation: foundDefaultAggregation,
        metadataContexts: oMetadataContexts,
        isOpen: isOpen
      };
    } else {
      return {
        metadataContexts: {},
        aggregations: {
          "dependents": {
            type: SAP_UI_CORE_ELEMENT
          },
          "customData": {
            type: SAP_UI_CORE_ELEMENT
          }
        },
        properties: {},
        isOpen: isOpen
      };
    }
  }

  /**
   * Checks the absolute or context paths and returns an appropriate MetaContext.
   *
   * @param oSettings Additional settings
   * @param sAttributeValue The attribute value
   * @returns {MetaDataContext} The meta data context object
   */
  function _checkAbsoluteAndContextPaths(oSettings, sAttributeValue) {
    var sMetaPath;
    if (sAttributeValue && sAttributeValue.startsWith("/")) {
      // absolute path - we just use this one
      sMetaPath = sAttributeValue;
    } else {
      var sContextPath = oSettings.currentContextPath.getPath();
      if (!sContextPath.endsWith("/")) {
        sContextPath += "/";
      }
      sMetaPath = sContextPath + sAttributeValue;
    }
    return {
      model: "metaModel",
      path: sMetaPath
    };
  }

  /**
   * This method helps to create the metadata context in case it is not yet available in the store.
   *
   * @param oSettings Additional settings
   * @param sAttributeName The attribute name
   * @param sAttributeValue The attribute value
   * @returns {MetaDataContext} The meta data context object
   */
  function _createInitialMetadataContext(oSettings, sAttributeName, sAttributeValue) {
    var returnContext;
    if (sAttributeValue.startsWith("/uid--")) {
      var oData = myStore[sAttributeValue];
      oSettings.models.converterContext.setProperty(sAttributeValue, oData);
      returnContext = {
        model: "converterContext",
        path: sAttributeValue
      };
      delete myStore[sAttributeValue];
    } else if (sAttributeName === "metaPath" && oSettings.currentContextPath || sAttributeName === "contextPath") {
      returnContext = _checkAbsoluteAndContextPaths(oSettings, sAttributeValue);
    } else if (sAttributeValue && sAttributeValue.startsWith("/")) {
      // absolute path - we just use this one
      returnContext = {
        model: "metaModel",
        path: sAttributeValue
      };
    } else {
      returnContext = {
        model: "metaModel",
        path: oSettings.bindingContexts.entitySet ? oSettings.bindingContexts.entitySet.getPath(sAttributeValue) : sAttributeValue
      };
    }
    return returnContext;
  }
  function _getMetadataContext(oSettings, oNode, sAttributeName, oVisitor, bDoNotResolve, isOpen) {
    var oMetadataContext;
    if (!bDoNotResolve && oNode.hasAttribute(sAttributeName)) {
      var sAttributeValue = oNode.getAttribute(sAttributeName);
      oMetadataContext = BindingParser.complexParser(sAttributeValue);
      if (!oMetadataContext) {
        oMetadataContext = _createInitialMetadataContext(oSettings, sAttributeName, sAttributeValue);
      }
    } else if (oSettings.bindingContexts.hasOwnProperty(sAttributeName)) {
      oMetadataContext = {
        model: sAttributeName,
        path: ""
      };
    } else if (isOpen) {
      try {
        if (oVisitor.getContext("".concat(sAttributeName, ">"))) {
          oMetadataContext = {
            model: sAttributeName,
            path: ""
          };
        }
      } catch (e) {
        return undefined;
      }
    }
    return oMetadataContext;
  }
  function parseAggregation(oAggregation) {
    var oOutObjects = {};
    if (oAggregation && oAggregation.children.length > 0) {
      var children = oAggregation.children;
      for (var childIdx = 0; childIdx < children.length; childIdx++) {
        var childDefinition = children[childIdx];
        var childKey = childDefinition.getAttribute("key") || childDefinition.getAttribute("id");
        if (childKey) {
          childKey = "InlineXML_".concat(childKey);
          childDefinition.setAttribute("key", childKey);
          oOutObjects[childKey] = {
            key: childKey,
            position: {
              placement: childDefinition.getAttribute("placement"),
              anchor: childDefinition.getAttribute("anchor")
            },
            type: "Slot"
          };
        }
      }
    }
    return oOutObjects;
  }
  function processSlots(oAggregations, oMetadataAggregations, oNode) {
    var processCustomData = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
    if (Object.keys(oAggregations).length > 0) {
      Object.keys(oAggregations).forEach(function (sAggregationName) {
        var oAggregationElement = oAggregations[sAggregationName];
        if (oNode !== null && oNode !== undefined && oAggregationElement) {
          // slots can have :: as keys which is not a valid aggregation name therefore replacing them
          var oNewChild = document.createElementNS(oNode.namespaceURI, sAggregationName.replace(/:/gi, "_"));
          var oElementChild = oAggregationElement.firstElementChild;
          while (oElementChild) {
            var oNextChild = oElementChild.nextElementSibling;
            oNewChild.appendChild(oElementChild);
            oElementChild = oNextChild;
          }
          if (sAggregationName !== "customData" && sAggregationName !== "dependents") {
            var sSlotName = oMetadataAggregations[sAggregationName] !== undefined && oMetadataAggregations[sAggregationName].slot || sAggregationName;
            var oTargetElement = oNode.querySelector("slot[name='".concat(sSlotName, "']"));
            if (oTargetElement !== null) {
              oTargetElement.replaceWith.apply(oTargetElement, _toConsumableArray(oNewChild.children));
            }
          } else if (processCustomData && oNewChild.children.length > 0) {
            oNode.appendChild(oNewChild);
          }
        }
      });
    }
  }
  function addSingleContext(mContexts, oVisitor, oCtx, oMetadataContexts) {
    var sKey = oCtx.name || oCtx.model || undefined;
    if (oMetadataContexts[sKey]) {
      return; // do not add twice
    }

    try {
      var sContextPath = oCtx.path;
      if (oCtx.model != null) {
        sContextPath = "".concat(oCtx.model, ">").concat(sContextPath);
      }
      var mSetting = oVisitor.getSettings();
      if (oCtx.model === "converterContext" && oCtx.path.length > 0) {
        mContexts[sKey] = mSetting.models[oCtx.model].getContext(oCtx.path, mSetting.bindingContexts[oCtx.model]); // add the context to the visitor
      } else if (!mSetting.bindingContexts[oCtx.model] && mSetting.models[oCtx.model]) {
        mContexts[sKey] = mSetting.models[oCtx.model].getContext(oCtx.path); // add the context to the visitor
      } else {
        mContexts[sKey] = oVisitor.getContext(sContextPath); // add the context to the visitor
      }

      oMetadataContexts[sKey] = mContexts[sKey]; // make it available inside metadataContexts JSON object
    } catch (ex) {
      //console.error(ex);
      // ignore the context as this can only be the case if the model is not ready, i.e. not a preprocessing model but maybe a model for
      // providing afterwards
      // TODO 0002 not yet implemented
      //mContexts["_$error"].oModel.setProperty("/" + sKey, ex);
    }
  }

  /**
   * Register a building block definition to be used inside the xml template processor.
   *
   * @param buildingBlockDefinition The building block definition
   */
  function registerBuildingBlock(buildingBlockDefinition) {
    XMLPreprocessor.plugIn(function (oNode, oVisitor) {
      return processBuildingBlock(buildingBlockDefinition, oNode, oVisitor);
    }, buildingBlockDefinition.namespace, buildingBlockDefinition.xmlTag || buildingBlockDefinition.name);
    if (buildingBlockDefinition.publicNamespace) {
      XMLPreprocessor.plugIn(function (oNode, oVisitor) {
        return processBuildingBlock(buildingBlockDefinition, oNode, oVisitor, true);
      }, buildingBlockDefinition.publicNamespace, buildingBlockDefinition.xmlTag || buildingBlockDefinition.name);
    }
  }
  _exports.registerBuildingBlock = registerBuildingBlock;
  function createErrorXML(errorMessages, xmlFragment, additionalData, stack) {
    var errorLabels = errorMessages.map(function (errorMessage) {
      return xml(_templateObject || (_templateObject = _taggedTemplateLiteral(["<m:Label text=\"", "\"/>"])), escapeXMLAttributeValue(errorMessage));
    });
    var errorStack = "";
    if (stack) {
      var stackFormatted = btoa("<pre>".concat(stack, "</pre>"));
      errorStack = xml(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["<m:FormattedText htmlText=\"", "\" />"])), "{= BBF.base64Decode('".concat(stackFormatted, "') }"));
    }
    var additionalText = "";
    if (additionalData) {
      additionalText = xml(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["<m:VBox>\n\t\t\t\t\t\t<m:Label text=\"Trace Info\"/>\n\t\t\t\t\t\t<code:CodeEditor type=\"json\"  value=\"", "\" height=\"300px\" />\n\t\t\t\t\t</m:VBox>"])), "{= BBF.base64Decode('".concat(btoa(JSON.stringify(additionalData, null, 4)), "') }"));
    }
    return xml(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["<m:VBox xmlns:m=\"sap.m\" xmlns:code=\"sap.ui.codeeditor\" core:require=\"{BBF:'sap/fe/core/buildingBlocks/BuildingBlockFormatter'}\">\n\t\t\t\t", "\n\t\t\t\t", "\n\t\t\t\t<grid:CSSGrid gridTemplateRows=\"fr\" gridTemplateColumns=\"repeat(2,1fr)\" gridGap=\"1rem\" xmlns:grid=\"sap.ui.layout.cssgrid\" >\n\t\t\t\t\t<m:VBox>\n\t\t\t\t\t\t<m:Label text=\"How the building block was called\"/>\n\t\t\t\t\t\t<code:CodeEditor type=\"xml\" value=\"", "\" height=\"300px\" />\n\t\t\t\t\t</m:VBox>\n\t\t\t\t\t", "\n\t\t\t\t</grid:CSSGrid>\n\t\t\t</m:VBox>"])), errorLabels, errorStack, "{= BBF.base64Decode('".concat(btoa(xmlFragment.replaceAll("&gt;", ">")), "') }"), additionalText);
  }
  var myStore = {};
  function storeValue(values) {
    var propertyUID = "/uid--".concat(uid());
    myStore[propertyUID] = values;
    return propertyUID;
  }

  /**
   * Parse an XML string and return the associated document.
   *
   * @param xmlString The xml string
   * @param addDefaultNamespaces Whether or not we should add default namespace
   * @returns The XML document.
   */
  function parseXMLString(xmlString) {
    var addDefaultNamespaces = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    if (addDefaultNamespaces) {
      xmlString = "<template\n\t\t\t\t\t\txmlns:template=\"http://schemas.sap.com/sapui5/extension/sap.ui.core.template/1\"\n\t\t\t\t\t\txmlns:m=\"sap.m\"\n\t\t\t\t\t\txmlns:macros=\"sap.fe.macros\"\n\t\t\t\t\t\txmlns:core=\"sap.ui.core\"\n\t\t\t\t\t\txmlns:mdc=\"sap.ui.mdc\"\n\t\t\t\t\t\txmlns:customData=\"http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1\">".concat(xmlString, "</template>");
    }
    var xmlDocument = DOMParserInstance.parseFromString(xmlString, "text/xml");
    var output = xmlDocument.firstElementChild;
    while (((_output = output) === null || _output === void 0 ? void 0 : _output.localName) === "template") {
      var _output;
      output = output.firstElementChild;
    }
    return output;
  }

  /**
   * Escape an XML attribute value.
   *
   * @param value The attribute value to escape.
   * @returns The escaped string.
   */
  _exports.parseXMLString = parseXMLString;
  function escapeXMLAttributeValue(value) {
    return value === null || value === void 0 ? void 0 : value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
  }
  _exports.escapeXMLAttributeValue = escapeXMLAttributeValue;
  function renderInTraceMode(outStr) {
    var xmlResult = parseXMLString(outStr, true);
    if (xmlResult !== undefined && (xmlResult === null || xmlResult === void 0 ? void 0 : xmlResult.localName) === "parsererror") {
      var errorMessage = xmlResult.innerText || xmlResult.innerHTML;
      return createErrorXML([errorMessage.split("\n")[0]], outStr);
    } else {
      return outStr;
    }
  }
  /**
   * Create a string representation of the template literal while handling special object case.
   *
   * @param strings The string parts of the template literal
   * @param values The values part of the template literal
   * @returns The XML string document representing the string that was used.
   */
  var xml = function (strings) {
    var outStr = "";
    var i;
    for (var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      values[_key - 1] = arguments[_key];
    }
    for (i = 0; i < values.length; i++) {
      outStr += strings[i];

      // Handle the different case of object, if it's an array we join them, if it's a binding expression (determined by _type) then we compile it.
      var value = values[i];
      if (Array.isArray(value) && value.length > 0 && typeof value[0] === "string") {
        outStr += value.flat(5).join("\n").trim();
      } else if (Array.isArray(value) && value.length > 0 && typeof value[0] === "function") {
        outStr += value.map(function (valuefn) {
          return valuefn();
        }).join("\n");
      } else if (value !== null && value !== void 0 && value._type) {
        var compiledExpression = compileExpression(value);
        outStr += escapeXMLAttributeValue(compiledExpression);
      } else if (value !== null && value !== void 0 && value.getTemplate) {
        outStr += value.getTemplate();
      } else if (typeof value === "undefined") {
        outStr += "{this>undefinedValue}";
      } else if (typeof value === "function") {
        outStr += value();
      } else if (typeof value === "object" && value !== null) {
        var _value$isA;
        if ((_value$isA = value.isA) !== null && _value$isA !== void 0 && _value$isA.call(value, "sap.ui.model.Context")) {
          outStr += value.getPath();
        } else {
          var propertyUId = storeValue(value);
          outStr += "".concat(propertyUId);
        }
      } else if (value && typeof value === "string" && !value.startsWith("<") && !value.startsWith("&lt;")) {
        outStr += escapeXMLAttributeValue(value);
      } else {
        outStr += value;
      }
    }
    outStr += strings[i];
    outStr = outStr.trim();
    if (isTraceMode) {
      return renderInTraceMode(outStr);
    }
    return outStr;
  };
  _exports.xml = xml;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJ0YXJnZXQiLCJib2R5IiwiY2hlY2siLCJpdGVyYXRvciIsInN0ZXAiLCJwYWN0IiwicmVqZWN0IiwiX2N5Y2xlIiwicmVzdWx0IiwibmV4dCIsImRvbmUiLCJ2YWx1ZSIsInRoZW4iLCJ2IiwiYmluZCIsImUiLCJyZXR1cm4iLCJfZml4dXAiLCJUeXBlRXJyb3IiLCJ2YWx1ZXMiLCJpIiwibGVuZ3RoIiwicHVzaCIsImFycmF5IiwiU3ltYm9sIiwic3RhdGUiLCJzIiwibyIsIm9ic2VydmVyIiwicHJvdG90eXBlIiwib25GdWxmaWxsZWQiLCJvblJlamVjdGVkIiwiY2FsbGJhY2siLCJfdGhpcyIsInRoZW5hYmxlIiwidGVzdCIsInVwZGF0ZSIsInN0YWdlIiwic2hvdWxkQ29udGludWUiLCJ1cGRhdGVWYWx1ZSIsIl9yZXN1bWVBZnRlclRlc3QiLCJfcmVzdW1lQWZ0ZXJCb2R5IiwiX3Jlc3VtZUFmdGVyVXBkYXRlIiwicmVjb3ZlciIsInByb2Nlc3NCdWlsZGluZ0Jsb2NrIiwiYnVpbGRpbmdCbG9ja0RlZmluaXRpb24iLCJvTm9kZSIsIm9WaXNpdG9yIiwiaXNQdWJsaWMiLCJzRnJhZ21lbnROYW1lIiwiZnJhZ21lbnQiLCJuYW1lc3BhY2UiLCJuYW1lIiwic05hbWUiLCJtQ29udGV4dHMiLCJvTWV0YWRhdGFDb250ZXh0cyIsIm9TZXR0aW5ncyIsImdldFNldHRpbmdzIiwibW9kZWxzIiwiZ2V0UmVzb3VyY2VCdW5kbGUiLCJvUmVzb3VyY2VCdW5kbGUiLCJSZXNvdXJjZU1vZGVsIiwic2V0QXBwbGljYXRpb25JMThuQnVuZGxlIiwiY2F0Y2giLCJlcnJvciIsIkxvZyIsIm9NZXRhZGF0YSIsInByZXBhcmVNZXRhZGF0YSIsIm1ldGFkYXRhIiwiaXNPcGVuIiwicHJvY2Vzc1Byb3BlcnRpZXMiLCJhcGlWZXJzaW9uIiwicHJvcGVydHlWYWx1ZXMiLCJwcm9jZXNzQ29udGV4dHMiLCJtTWlzc2luZ0NvbnRleHQiLCJleHRyYVByb3BlcnR5VmFsdWVzIiwiT2JqZWN0IiwiYXNzaWduIiwiaW5pdGlhbEtleXMiLCJrZXlzIiwicHJvY2Vzc0NoaWxkcmVuIiwib0FnZ3JlZ2F0aW9ucyIsIm9QcmV2aW91c01hY3JvSW5mbyIsIm9JbnN0YW5jZSIsIm9Db250cm9sQ29uZmlnIiwidmlld0RhdGEiLCJnZXRQcm9wZXJ0eSIsInByb2Nlc3NlZFByb3BlcnR5VmFsdWVzIiwiaXNWMU1hY3JvRGVmIiwiY3JlYXRlIiwiY2FsbCIsIm1ldGFkYXRhQ29udGV4dHMiLCJmb3JFYWNoIiwic01ldGFkYXRhTmFtZSIsImNvbXB1dGVkIiwic0NvbnRleHROYW1lIiwiaGFzT3duUHJvcGVydHkiLCJwcm9wTmFtZSIsIm9EYXRhIiwiaXNBIiwiU0FQX1VJX01PREVMX0NPTlRFWFQiLCJnZXRNb2RlbCIsImdldE9iamVjdCIsIkJ1aWxkaW5nQmxvY2tDbGFzcyIsImdldFByb3BlcnRpZXMiLCJ0YXJnZXRPYmplY3QiLCJzQXR0cmlidXRlVmFsdWUiLCJzdG9yZVZhbHVlIiwic0NvbnRleHRQYXRoIiwiY29udmVydGVyQ29udGV4dCIsInNldFByb3BlcnR5IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJteVN0b3JlIiwidW5kZWZpbmVkIiwib0F0dHJpYnV0ZXNNb2RlbCIsIkF0dHJpYnV0ZU1vZGVsIiwiVHJhY2VJbmZvIiwiaXNUcmFjZUluZm9BY3RpdmUiLCJvVHJhY2VJbmZvIiwidHJhY2VNYWNyb0NhbGxzIiwibWFjcm9JbmZvIiwidmFsaWRhdGVNYWNyb1NpZ25hdHVyZSIsIm9Db250ZXh0VmlzaXRvciIsIndpdGgiLCJvUGFyZW50IiwicGFyZW50Tm9kZSIsImlDaGlsZEluZGV4Iiwib1Byb21pc2UiLCJwcm9jZXNzQ3VzdG9tRGF0YSIsIkFycmF5IiwiZnJvbSIsImNoaWxkcmVuIiwiaW5kZXhPZiIsImdldFRlbXBsYXRlIiwib1RlbXBsYXRlIiwiYWRkRGVmYXVsdE5hbWVzcGFjZSIsImlzUnVudGltZSIsIm15U3RvcmVLZXkiLCJoYXNFcnJvciIsImZpcnN0RWxlbWVudENoaWxkIiwicGFyc2VYTUxTdHJpbmciLCJpdGVyIiwiZG9jdW1lbnQiLCJjcmVhdGVOb2RlSXRlcmF0b3IiLCJOb2RlRmlsdGVyIiwiU0hPV19URVhUIiwidGV4dG5vZGUiLCJuZXh0Tm9kZSIsInRleHRDb250ZW50IiwidHJpbSIsImxvY2FsTmFtZSIsImlzVHJhY2VNb2RlIiwib0Vycm9yVGV4dCIsImNyZWF0ZUVycm9yWE1MIiwib3V0ZXJIVE1MIiwicmVwbGFjZVdpdGgiLCJwcm9jZXNzU2xvdHMiLCJhZ2dyZWdhdGlvbnMiLCJ2aXNpdE5vZGUiLCJyZW1vdmUiLCJQcm9taXNlIiwicmVzb2x2ZSIsImluc2VydEZyYWdtZW50Iiwib01hY3JvRWxlbWVudCIsIm9SZW1haW5pbmdTbG90cyIsInF1ZXJ5U2VsZWN0b3JBbGwiLCJvU2xvdEVsZW1lbnQiLCJ0cmFjZURldGFpbHMiLCJpbml0aWFsUHJvcGVydGllcyIsInJlc29sdmVkUHJvcGVydGllcyIsIm1pc3NpbmdDb250ZXh0cyIsInByb3BlcnR5TmFtZSIsInByb3BlcnR5VmFsdWUiLCJwYXRoIiwiZ2V0UGF0aCIsImluY2x1ZGVzIiwiZXJyb3JBbnkiLCJvRXJyb3IiLCJzdGFjayIsIm9GaXJzdEVsZW1lbnRDaGlsZCIsIm9OZXh0Q2hpbGQiLCJuZXh0RWxlbWVudFNpYmxpbmciLCJzQ2hpbGROYW1lIiwic0FnZ3JlZ2F0aW9uTmFtZSIsInRvVXBwZXJDYXNlIiwiZGVmYXVsdEFnZ3JlZ2F0aW9uIiwiYWdncmVnYXRpb25EZWZpbml0aW9uIiwic2xvdCIsImNoaWxkRGVmaW5pdGlvbiIsIm9OZXdDaGlsZCIsImNyZWF0ZUVsZW1lbnROUyIsIm5hbWVzcGFjZVVSSSIsImdldEF0dHJpYnV0ZSIsIm5leHRDaGlsZCIsImFwcGVuZENoaWxkIiwicmVtb3ZlQXR0cmlidXRlIiwicHJvcGVydGllcyIsInR5cGUiLCJhdHRyaWJ1dGVzIiwiYXR0cmlidXRlSW5kZXgiLCJvT3V0T2JqZWN0cyIsImNoaWxkSWR4IiwibXlDaGlsZCIsInBhcnNlZEFnZ3JlZ2F0aW9uIiwicGFyc2VBZ2dyZWdhdGlvbiIsInBhcnNlZEFnZ3JlZ2F0aW9uS2V5IiwidmlzaXRDaGlsZE5vZGVzIiwiY3VycmVudENvbnRleHRQYXRoIiwiYmluZGluZ0NvbnRleHRzIiwiY29udGV4dFBhdGgiLCJvRGVmaW5pdGlvbkNvbnRleHRzIiwiYURlZmluaXRpb25Db250ZXh0c0tleXMiLCJjb250ZXh0UGF0aEluZGV4IiwiY29udGV4dFBhdGhEZWZpbml0aW9uIiwic3BsaWNlIiwic0F0dHJpYnV0ZU5hbWUiLCJiRG9Ob3RSZXNvbHZlIiwiaGFzQXR0cmlidXRlIiwib01ldGFkYXRhQ29udGV4dCIsIl9nZXRNZXRhZGF0YUNvbnRleHQiLCJhZGRTaW5nbGVDb250ZXh0Iiwib0RlZmluaXRpb25Qcm9wZXJ0aWVzIiwiYURlZmluaXRpb25Qcm9wZXJ0aWVzS2V5cyIsInNLZXlWYWx1ZSIsImRlZXBDbG9uZSIsImRlZmF1bHRWYWx1ZSIsInZpc2l0QXR0cmlidXRlIiwiZ2V0TmFtZWRJdGVtIiwidlZhbHVlIiwic3RhcnRzV2l0aCIsIk51bWJlciIsIkxPR0dFUl9TQ09QRSIsIkRPTVBhcnNlckluc3RhbmNlIiwiRE9NUGFyc2VyIiwidmFsaWRhdGVNYWNyb01ldGFkYXRhQ29udGV4dCIsIm9Db250ZXh0U2V0dGluZ3MiLCJzS2V5Iiwib0NvbnRleHQiLCJvQ29udGV4dE9iamVjdCIsInJlcXVpcmVkIiwiRXJyb3IiLCIka2luZCIsIiRUeXBlIiwiYU1ldGFkYXRhQ29udGV4dEtleXMiLCJhUHJvcGVydGllcyIsIm9BdHRyaWJ1dGVOYW1lcyIsImlLZXkiLCJvUHJvcGVydHlTZXR0aW5ncyIsIndhcm5pbmciLCJTQVBfVUlfQ09SRV9FTEVNRU5UIiwiYnVpbGRpbmdCbG9ja01ldGFkYXRhIiwib1Byb3BlcnRpZXMiLCJmb3VuZERlZmF1bHRBZ2dyZWdhdGlvbiIsInNQcm9wZXJ0eU5hbWUiLCJldmVudHMiLCJzRXZlbnROYW1lIiwiaXNEZWZhdWx0IiwiX2NoZWNrQWJzb2x1dGVBbmRDb250ZXh0UGF0aHMiLCJzTWV0YVBhdGgiLCJlbmRzV2l0aCIsIm1vZGVsIiwiX2NyZWF0ZUluaXRpYWxNZXRhZGF0YUNvbnRleHQiLCJyZXR1cm5Db250ZXh0IiwiZW50aXR5U2V0IiwiQmluZGluZ1BhcnNlciIsImNvbXBsZXhQYXJzZXIiLCJnZXRDb250ZXh0Iiwib0FnZ3JlZ2F0aW9uIiwiY2hpbGRLZXkiLCJzZXRBdHRyaWJ1dGUiLCJrZXkiLCJwb3NpdGlvbiIsInBsYWNlbWVudCIsImFuY2hvciIsIm9NZXRhZGF0YUFnZ3JlZ2F0aW9ucyIsIm9BZ2dyZWdhdGlvbkVsZW1lbnQiLCJyZXBsYWNlIiwib0VsZW1lbnRDaGlsZCIsInNTbG90TmFtZSIsIm9UYXJnZXRFbGVtZW50IiwicXVlcnlTZWxlY3RvciIsIm9DdHgiLCJtU2V0dGluZyIsImV4IiwicmVnaXN0ZXJCdWlsZGluZ0Jsb2NrIiwiWE1MUHJlcHJvY2Vzc29yIiwicGx1Z0luIiwieG1sVGFnIiwicHVibGljTmFtZXNwYWNlIiwiZXJyb3JNZXNzYWdlcyIsInhtbEZyYWdtZW50IiwiYWRkaXRpb25hbERhdGEiLCJlcnJvckxhYmVscyIsIm1hcCIsImVycm9yTWVzc2FnZSIsInhtbCIsImVzY2FwZVhNTEF0dHJpYnV0ZVZhbHVlIiwiZXJyb3JTdGFjayIsInN0YWNrRm9ybWF0dGVkIiwiYnRvYSIsImFkZGl0aW9uYWxUZXh0IiwiSlNPTiIsInN0cmluZ2lmeSIsInJlcGxhY2VBbGwiLCJwcm9wZXJ0eVVJRCIsInVpZCIsInhtbFN0cmluZyIsImFkZERlZmF1bHROYW1lc3BhY2VzIiwieG1sRG9jdW1lbnQiLCJwYXJzZUZyb21TdHJpbmciLCJvdXRwdXQiLCJyZW5kZXJJblRyYWNlTW9kZSIsIm91dFN0ciIsInhtbFJlc3VsdCIsImlubmVyVGV4dCIsImlubmVySFRNTCIsInNwbGl0Iiwic3RyaW5ncyIsImlzQXJyYXkiLCJmbGF0Iiwiam9pbiIsInZhbHVlZm4iLCJfdHlwZSIsImNvbXBpbGVkRXhwcmVzc2lvbiIsImNvbXBpbGVFeHByZXNzaW9uIiwicHJvcGVydHlVSWQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkJ1aWxkaW5nQmxvY2tSdW50aW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IGRlZXBDbG9uZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9kZWVwQ2xvbmVcIjtcbmltcG9ydCB1aWQgZnJvbSBcInNhcC9iYXNlL3V0aWwvdWlkXCI7XG5pbXBvcnQgQXR0cmlidXRlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0F0dHJpYnV0ZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7XG5cdEJ1aWxkaW5nQmxvY2tBZ2dyZWdhdGlvbkRlZmluaXRpb24sXG5cdEJ1aWxkaW5nQmxvY2tCYXNlLFxuXHRCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbixcblx0QnVpbGRpbmdCbG9ja0RlZmluaXRpb25WMSxcblx0QnVpbGRpbmdCbG9ja01ldGFkYXRhLFxuXHRCdWlsZGluZ0Jsb2NrTWV0YWRhdGFDb250ZXh0RGVmaW5pdGlvbixcblx0QnVpbGRpbmdCbG9ja1Byb3BlcnR5RGVmaW5pdGlvblxufSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1wiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IEJpbmRpbmdQYXJzZXIgZnJvbSBcInNhcC91aS9iYXNlL0JpbmRpbmdQYXJzZXJcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBUcmFjZUluZm8gZnJvbSBcIi4vVHJhY2VJbmZvXCI7XG5cbmNvbnN0IExPR0dFUl9TQ09QRSA9IFwic2FwLmZlLmNvcmUuYnVpbGRpbmdCbG9ja3MuQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmNvbnN0IERPTVBhcnNlckluc3RhbmNlID0gbmV3IERPTVBhcnNlcigpO1xubGV0IGlzVHJhY2VNb2RlID0gZmFsc2U7XG5cbnR5cGUgUmVzb2x2ZWRCdWlsZGluZ0Jsb2NrTWV0YWRhdGEgPSB7XG5cdHByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24+O1xuXHRhZ2dyZWdhdGlvbnM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tBZ2dyZWdhdGlvbkRlZmluaXRpb24+O1xuXHRtZXRhZGF0YUNvbnRleHRzOiBSZWNvcmQ8c3RyaW5nLCBCdWlsZGluZ0Jsb2NrTWV0YWRhdGFDb250ZXh0RGVmaW5pdGlvbj47XG5cdGlzT3BlbjogYm9vbGVhbjtcblx0ZGVmYXVsdEFnZ3JlZ2F0aW9uPzogc3RyaW5nO1xufTtcblxuLyoqXG4gKiBEZWZpbml0aW9uIG9mIGEgbWV0YSBkYXRhIGNvbnRleHRcbiAqL1xudHlwZSBNZXRhRGF0YUNvbnRleHQgPSB7XG5cdG5hbWU/OiBzdHJpbmc7XG5cdG1vZGVsOiBzdHJpbmc7XG5cdHBhdGg6IHN0cmluZztcbn07XG5cbnR5cGUgSUNhbGxiYWNrID0ge1xuXHRnZXRTZXR0aW5ncygpOiBhbnk7XG5cdC8qKlxuXHQgKiBWaXNpdHMgdGhlIGdpdmVuIG5vZGUgYW5kIGVpdGhlciBwcm9jZXNzZXMgYSB0ZW1wbGF0ZSBpbnN0cnVjdGlvbiwgY2FsbHNcblx0ICogYSB2aXNpdG9yLCBvciBzaW1wbHkgY2FsbHMgYm90aCB7QGxpbmtcblx0ICogc2FwLnVpLmNvcmUudXRpbC5YTUxQcmVwcm9jZXNzb3IuSUNhbGxiYWNrLnZpc2l0QXR0cmlidXRlcyB2aXNpdEF0dHJpYnV0ZXN9XG5cdCAqIGFuZCB7QGxpbmsgc2FwLnVpLmNvcmUudXRpbC5YTUxQcmVwcm9jZXNzb3IuSUNhbGxiYWNrLnZpc2l0Q2hpbGROb2Rlc1xuXHQgKiB2aXNpdENoaWxkTm9kZXN9LlxuXHQgKlxuXHQgKiBAcGFyYW0ge05vZGV9IG9Ob2RlXG5cdCAqICAgVGhlIFhNTCBET00gbm9kZVxuXHQgKiBAcmV0dXJucyB7c2FwLnVpLmJhc2UuU3luY1Byb21pc2V9XG5cdCAqICAgQSB0aGVuYWJsZSB3aGljaCByZXNvbHZlcyB3aXRoIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gYXMgc29vbiBhcyB2aXNpdGluZ1xuXHQgKiAgIGlzIGRvbmUsIG9yIGlzIHJlamVjdGVkIHdpdGggYSBjb3JyZXNwb25kaW5nIGVycm9yIGlmIHZpc2l0aW5nIGZhaWxzXG5cdCAqL1xuXHR2aXNpdE5vZGUob05vZGU6IE5vZGUpOiBQcm9taXNlPHZvaWQ+O1xuXG5cdC8qKlxuXHQgKiBJbnNlcnRzIHRoZSBmcmFnbWVudCB3aXRoIHRoZSBnaXZlbiBuYW1lIGluIHBsYWNlIG9mIHRoZSBnaXZlbiBlbGVtZW50LiBMb2FkcyB0aGVcblx0ICogZnJhZ21lbnQsIHRha2VzIGNhcmUgb2YgY2FjaGluZyAoZm9yIHRoZSBjdXJyZW50IHByZS1wcm9jZXNzb3IgcnVuKSBhbmQgdmlzaXRzIHRoZVxuXHQgKiBmcmFnbWVudCdzIGNvbnRlbnQgb25jZSBpdCBoYXMgYmVlbiBpbXBvcnRlZCBpbnRvIHRoZSBlbGVtZW50J3Mgb3duZXIgZG9jdW1lbnQgYW5kXG5cdCAqIHB1dCBpbnRvIHBsYWNlLiBMb2FkaW5nIG9mIGZyYWdtZW50cyBpcyBhc3luY2hyb25vdXMgaWYgdGhlIHRlbXBsYXRlIHZpZXcgaXNcblx0ICogYXN5bmNocm9ub3VzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc0ZyYWdtZW50TmFtZVxuXHQgKiAgIHRoZSBmcmFnbWVudCdzIHJlc29sdmVkIG5hbWVcblx0ICogQHBhcmFtIHtFbGVtZW50fSBvRWxlbWVudFxuXHQgKiAgIHRoZSBYTUwgRE9NIGVsZW1lbnQsIGUuZy4gPHNhcC51aS5jb3JlOkZyYWdtZW50PiBvciA8Y29yZTpFeHRlbnNpb25Qb2ludD5cblx0ICogQHBhcmFtIHtzYXAudWkuY29yZS51dGlsLl93aXRofSBvV2l0aENvbnRyb2xcblx0ICogICB0aGUgcGFyZW50J3MgXCJ3aXRoXCIgY29udHJvbFxuXHQgKiBAcmV0dXJucyB7c2FwLnVpLmJhc2UuU3luY1Byb21pc2V9XG5cdCAqIEEgc3luYyBwcm9taXNlIHdoaWNoIHJlc29sdmVzIHdpdGggPGNvZGU+dW5kZWZpbmVkPC9jb2RlPiBhcyBzb29uIGFzIHRoZSBmcmFnbWVudFxuXHQgKiAgIGhhcyBiZWVuIGluc2VydGVkLCBvciBpcyByZWplY3RlZCB3aXRoIGEgY29ycmVzcG9uZGluZyBlcnJvciBpZiBsb2FkaW5nIG9yIHZpc2l0aW5nXG5cdCAqICAgZmFpbHMuXG5cdCAqL1xuXHRpbnNlcnRGcmFnbWVudChzRnJhZ21lbnQ6IHN0cmluZywgb0VsZW1lbnQ6IEVsZW1lbnQsIG9XaXRoPzogYW55KTogUHJvbWlzZTx2b2lkPjtcblx0dmlzaXRBdHRyaWJ1dGUob05vZGU6IEVsZW1lbnQsIG9BdHRyaWJ1dGU6IEF0dHIpOiBQcm9taXNlPHZvaWQ+O1xuXHR2aXNpdENoaWxkTm9kZXMob05vZGU6IE5vZGUpOiBQcm9taXNlPHZvaWQ+O1xuXHQvKipcblx0ICogSW50ZXJwcmV0cyB0aGUgZ2l2ZW4gWE1MIERPTSBhdHRyaWJ1dGUgdmFsdWUgYXMgYSBiaW5kaW5nIGFuZCByZXR1cm5zIHRoZVxuXHQgKiByZXN1bHRpbmcgdmFsdWUuXG5cdCAqXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzVmFsdWVcblx0ICogICBBbiBYTUwgRE9NIGF0dHJpYnV0ZSB2YWx1ZVxuXHQgKiBAcGFyYW0ge0VsZW1lbnR9IFtvRWxlbWVudF1cblx0ICogICBUaGUgWE1MIERPTSBlbGVtZW50IHRoZSBhdHRyaWJ1dGUgdmFsdWUgYmVsb25ncyB0byAobmVlZGVkIG9ubHkgZm9yXG5cdCAqICAgd2FybmluZ3Mgd2hpY2ggYXJlIGxvZ2dlZCB0byB0aGUgY29uc29sZSlcblx0ICogQHJldHVybnMge3NhcC51aS5iYXNlLlN5bmNQcm9taXNlfG51bGx9XG5cdCAqICAgQSB0aGVuYWJsZSB3aGljaCByZXNvbHZlcyB3aXRoIHRoZSByZXN1bHRpbmcgdmFsdWUsIG9yIGlzIHJlamVjdGVkIHdpdGggYVxuXHQgKiAgIGNvcnJlc3BvbmRpbmcgZXJyb3IgKGZvciBleGFtcGxlLCBhbiBlcnJvciB0aHJvd24gYnkgYSBmb3JtYXR0ZXIpIG9yXG5cdCAqICAgPGNvZGU+bnVsbDwvY29kZT4gaW4gY2FzZSB0aGUgYmluZGluZyBpcyBub3QgcmVhZHkgKGJlY2F1c2UgaXQgcmVmZXJzIHRvIGFcblx0ICogICBtb2RlbCB3aGljaCBpcyBub3QgYXZhaWxhYmxlKSAoc2luY2UgMS41Ny4wKVxuXHQgKi9cblx0Z2V0UmVzdWx0KHNWYWx1ZTogc3RyaW5nLCBlbGVtZW50PzogRWxlbWVudCk6IFByb21pc2U8YW55PiB8IG51bGw7XG5cdGdldENvbnRleHQoc1BhdGg6IHN0cmluZyk6IENvbnRleHQgfCB1bmRlZmluZWQ7XG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgY2FsbGJhY2sgaW50ZXJmYWNlIGluc3RhbmNlIGZvciB0aGUgZ2l2ZW4gbWFwIG9mIHZhcmlhYmxlcyB3aGljaFxuXHQgKiBvdmVycmlkZSBjdXJyZW50bHkga25vd24gdmFyaWFibGVzIG9mIHRoZSBzYW1lIG5hbWUgaW4gPGNvZGU+dGhpczwvY29kZT5cblx0ICogcGFyZW50IGludGVyZmFjZSBvciByZXBsYWNlIHRoZW0gYWx0b2dldGhlci4gRWFjaCB2YXJpYWJsZSBuYW1lIGJlY29tZXMgYVxuXHQgKiBuYW1lZCBtb2RlbCB3aXRoIGEgY29ycmVzcG9uZGluZyBvYmplY3QgYmluZGluZyBhbmQgY2FuIGJlIHVzZWQgaW5zaWRlIHRoZVxuXHQgKiBYTUwgdGVtcGxhdGUgaW4gdGhlIHVzdWFsIHdheSwgdGhhdCBpcywgd2l0aCBhIGJpbmRpbmcgZXhwcmVzc2lvbiBsaWtlXG5cdCAqIDxjb2RlPlwie3Zhcj5zb21lL3JlbGF0aXZlL3BhdGh9XCI8L2NvZGU+IChzZWUgZXhhbXBsZSkuXG5cdCAqXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBbbVZhcmlhYmxlcz17fV1cblx0ICogICBNYXAgZnJvbSB2YXJpYWJsZSBuYW1lIChzdHJpbmcpIHRvIHZhbHVlICh7QGxpbmsgc2FwLnVpLm1vZGVsLkNvbnRleHR9KVxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IFtiUmVwbGFjZV1cblx0ICogICBXaGV0aGVyIG9ubHkgdGhlIGdpdmVuIHZhcmlhYmxlcyBhcmUga25vd24gaW4gdGhlIG5ldyBjYWxsYmFjayBpbnRlcmZhY2Vcblx0ICogICBpbnN0YW5jZSwgbm8gaW5oZXJpdGVkIG9uZXNcblx0ICogQHJldHVybnMge3NhcC51aS5jb3JlLnV0aWwuWE1MUHJlcHJvY2Vzc29yLklDYWxsYmFja31cblx0ICogICBBIGNhbGxiYWNrIGludGVyZmFjZSBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gbVZhcmlhYmxlc1xuXHQgKiBAcGFyYW0gYlJlcGxhY2Vcblx0ICovXG5cdFwid2l0aFwiKG1WYXJpYWJsZXM/OiBhbnksIGJSZXBsYWNlPzogYm9vbGVhbik6IElDYWxsYmFjaztcbn07XG5cbi8qKlxuICogVHlwZWd1YXJkIGZvciBjaGVja2luZyBpZiBhIGJ1aWxkaW5nIGJsb2NrIHVzZSBBUEkgMS5cbiAqXG4gKiBAcGFyYW0gYnVpbGRpbmdCbG9ja0RlZmluaXRpb25cbiAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGUgYnVpbGRpbmcgYmxvY2sgaXMgdXNpbmcgQVBJIDEuXG4gKi9cbmZ1bmN0aW9uIGlzVjFNYWNyb0RlZihidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbjogQnVpbGRpbmdCbG9ja0RlZmluaXRpb24pOiBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbiBpcyBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvblYxIHtcblx0cmV0dXJuIGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmFwaVZlcnNpb24gPT09IHVuZGVmaW5lZCB8fCBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5hcGlWZXJzaW9uID09PSAxO1xufVxuZnVuY3Rpb24gdmFsaWRhdGVNYWNyb01ldGFkYXRhQ29udGV4dChcblx0c05hbWU6IHN0cmluZyxcblx0bUNvbnRleHRzOiBhbnksXG5cdG9Db250ZXh0U2V0dGluZ3M6IEJ1aWxkaW5nQmxvY2tNZXRhZGF0YUNvbnRleHREZWZpbml0aW9uLFxuXHRzS2V5OiBzdHJpbmdcbikge1xuXHRjb25zdCBvQ29udGV4dCA9IG1Db250ZXh0c1tzS2V5XTtcblx0Y29uc3Qgb0NvbnRleHRPYmplY3QgPSBvQ29udGV4dD8uZ2V0T2JqZWN0KCk7XG5cblx0aWYgKG9Db250ZXh0U2V0dGluZ3MucmVxdWlyZWQgPT09IHRydWUgJiYgKCFvQ29udGV4dCB8fCBvQ29udGV4dE9iamVjdCA9PT0gbnVsbCkpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYCR7c05hbWV9OiBSZXF1aXJlZCBtZXRhZGF0YUNvbnRleHQgJyR7c0tleX0nIGlzIG1pc3NpbmdgKTtcblx0fSBlbHNlIGlmIChvQ29udGV4dE9iamVjdCkge1xuXHRcdC8vIElmIGNvbnRleHQgb2JqZWN0IGhhcyAka2luZCBwcm9wZXJ0eSwgJFR5cGUgc2hvdWxkIG5vdCBiZSBjaGVja2VkXG5cdFx0Ly8gVGhlcmVmb3JlIHJlbW92ZSBmcm9tIGNvbnRleHQgc2V0dGluZ3Ncblx0XHRpZiAob0NvbnRleHRPYmplY3QuaGFzT3duUHJvcGVydHkoXCIka2luZFwiKSAmJiBvQ29udGV4dFNldHRpbmdzLiRraW5kKSB7XG5cdFx0XHQvLyBDaGVjayBpZiB0aGUgJGtpbmQgaXMgcGFydCBvZiB0aGUgYWxsb3dlZCBvbmVzXG5cdFx0XHRpZiAob0NvbnRleHRTZXR0aW5ncy4ka2luZC5pbmRleE9mKG9Db250ZXh0T2JqZWN0W1wiJGtpbmRcIl0pID09PSAtMSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXG5cdFx0XHRcdFx0YCR7c05hbWV9OiAnJHtzS2V5fScgbXVzdCBiZSAnJGtpbmQnICcke29Db250ZXh0U2V0dGluZ3NbXCIka2luZFwiXX0nIGJ1dCBpcyAnJHtcblx0XHRcdFx0XHRcdG9Db250ZXh0T2JqZWN0LiRraW5kXG5cdFx0XHRcdFx0fSc6ICR7b0NvbnRleHQuZ2V0UGF0aCgpfWBcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKG9Db250ZXh0T2JqZWN0Lmhhc093blByb3BlcnR5KFwiJFR5cGVcIikgJiYgb0NvbnRleHRTZXR0aW5ncy4kVHlwZSkge1xuXHRcdFx0Ly8gQ2hlY2sgb25seSAkVHlwZVxuXHRcdFx0aWYgKG9Db250ZXh0U2V0dGluZ3MuJFR5cGUuaW5kZXhPZihvQ29udGV4dE9iamVjdFtcIiRUeXBlXCJdKSA9PT0gLTEpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFxuXHRcdFx0XHRcdGAke3NOYW1lfTogJyR7c0tleX0nIG11c3QgYmUgJyRUeXBlJyAnJHtvQ29udGV4dFNldHRpbmdzW1wiJFR5cGVcIl19JyBidXQgaXMgJyR7XG5cdFx0XHRcdFx0XHRvQ29udGV4dE9iamVjdC4kVHlwZVxuXHRcdFx0XHRcdH0nOiAke29Db250ZXh0LmdldFBhdGgoKX1gXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5leHBvcnQgZnVuY3Rpb24gdmFsaWRhdGVNYWNyb1NpZ25hdHVyZShzTmFtZTogYW55LCBvTWV0YWRhdGE6IGFueSwgbUNvbnRleHRzOiBhbnksIG9Ob2RlOiBhbnkpIHtcblx0Y29uc3QgYU1ldGFkYXRhQ29udGV4dEtleXMgPSAob01ldGFkYXRhLm1ldGFkYXRhQ29udGV4dHMgJiYgT2JqZWN0LmtleXMob01ldGFkYXRhLm1ldGFkYXRhQ29udGV4dHMpKSB8fCBbXSxcblx0XHRhUHJvcGVydGllcyA9IChvTWV0YWRhdGEucHJvcGVydGllcyAmJiBPYmplY3Qua2V5cyhvTWV0YWRhdGEucHJvcGVydGllcykpIHx8IFtdLFxuXHRcdG9BdHRyaWJ1dGVOYW1lczogYW55ID0ge307XG5cblx0Ly8gY29sbGVjdCBhbGwgYXR0cmlidXRlcyB0byBmaW5kIHVuY2hlY2tlZCBwcm9wZXJ0aWVzXG5cdE9iamVjdC5rZXlzKG9Ob2RlLmF0dHJpYnV0ZXMpLmZvckVhY2goZnVuY3Rpb24gKGlLZXk6IHN0cmluZykge1xuXHRcdGNvbnN0IHNLZXkgPSBvTm9kZS5hdHRyaWJ1dGVzW2lLZXldLm5hbWU7XG5cdFx0b0F0dHJpYnV0ZU5hbWVzW3NLZXldID0gdHJ1ZTtcblx0fSk7XG5cblx0Ly9DaGVjayBtZXRhZGF0YUNvbnRleHRzXG5cdGFNZXRhZGF0YUNvbnRleHRLZXlzLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IGFueSkge1xuXHRcdGNvbnN0IG9Db250ZXh0U2V0dGluZ3MgPSBvTWV0YWRhdGEubWV0YWRhdGFDb250ZXh0c1tzS2V5XTtcblxuXHRcdHZhbGlkYXRlTWFjcm9NZXRhZGF0YUNvbnRleHQoc05hbWUsIG1Db250ZXh0cywgb0NvbnRleHRTZXR0aW5ncywgc0tleSk7XG5cdFx0ZGVsZXRlIG9BdHRyaWJ1dGVOYW1lc1tzS2V5XTtcblx0fSk7XG5cdC8vQ2hlY2sgcHJvcGVydGllc1xuXHRhUHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5OiBhbnkpIHtcblx0XHRjb25zdCBvUHJvcGVydHlTZXR0aW5ncyA9IG9NZXRhZGF0YS5wcm9wZXJ0aWVzW3NLZXldO1xuXHRcdGlmICghb05vZGUuaGFzQXR0cmlidXRlKHNLZXkpKSB7XG5cdFx0XHRpZiAob1Byb3BlcnR5U2V0dGluZ3MucmVxdWlyZWQgJiYgIW9Qcm9wZXJ0eVNldHRpbmdzLmhhc093blByb3BlcnR5KFwiZGVmYXVsdFZhbHVlXCIpKSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihgJHtzTmFtZX06IGAgKyBgUmVxdWlyZWQgcHJvcGVydHkgJyR7c0tleX0nIGlzIG1pc3NpbmdgKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0ZGVsZXRlIG9BdHRyaWJ1dGVOYW1lc1tzS2V5XTtcblx0XHR9XG5cdH0pO1xuXG5cdC8vIFVuY2hlY2tlZCBwcm9wZXJ0aWVzXG5cdE9iamVjdC5rZXlzKG9BdHRyaWJ1dGVOYW1lcykuZm9yRWFjaChmdW5jdGlvbiAoc0tleTogc3RyaW5nKSB7XG5cdFx0Ly8gbm8gY2hlY2sgZm9yIHByb3BlcnRpZXMgd2hpY2ggc3RhcnQgd2l0aCB1bmRlcnNjb3JlIFwiX1wiIG9yIGNvbnRhaW4gYSBjb2xvbiBcIjpcIiAoZGlmZmVyZW50IG5hbWVzcGFjZSksIGUuZy4geG1sbnM6dHJhY2UsIHRyYWNlOm1hY3JvSUQsIHVuaXR0ZXN0OmlkXG5cdFx0aWYgKHNLZXkuaW5kZXhPZihcIjpcIikgPCAwICYmICFzS2V5LnN0YXJ0c1dpdGgoXCJ4bWxuc1wiKSkge1xuXHRcdFx0TG9nLndhcm5pbmcoYFVuY2hlY2tlZCBwYXJhbWV0ZXI6ICR7c05hbWV9OiAke3NLZXl9YCwgdW5kZWZpbmVkLCBMT0dHRVJfU0NPUEUpO1xuXHRcdH1cblx0fSk7XG59XG5cbmNvbnN0IFNBUF9VSV9DT1JFX0VMRU1FTlQgPSBcInNhcC51aS5jb3JlLkVsZW1lbnRcIjtcblxuY29uc3QgU0FQX1VJX01PREVMX0NPTlRFWFQgPSBcInNhcC51aS5tb2RlbC5Db250ZXh0XCI7XG5cbi8qKlxuICogRW5zdXJlcyB0aGF0IHRoZSBtZXRhZGF0YSBmb3IgdGhlIGJ1aWxkaW5nIGJsb2NrIGFyZSBwcm9wZXJseSBkZWZpbmVkLlxuICpcbiAqIEBwYXJhbSBidWlsZGluZ0Jsb2NrTWV0YWRhdGEgVGhlIG1ldGFkYXRhIHJlY2VpdmVkIGZyb20gdGhlIGlucHV0XG4gKiBAcGFyYW0gaXNPcGVuIFdoZXRoZXIgdGhlIGJ1aWxkaW5nIGJsb2NrIGlzIG9wZW4gb3Igbm90XG4gKiBAcmV0dXJucyBBIHNldCBvZiBjb21wbGV0ZWQgbWV0YWRhdGEgZm9yIGZ1cnRoZXIgcHJvY2Vzc2luZ1xuICovXG5mdW5jdGlvbiBwcmVwYXJlTWV0YWRhdGEoYnVpbGRpbmdCbG9ja01ldGFkYXRhPzogQnVpbGRpbmdCbG9ja01ldGFkYXRhLCBpc09wZW4gPSBmYWxzZSk6IFJlc29sdmVkQnVpbGRpbmdCbG9ja01ldGFkYXRhIHtcblx0aWYgKGJ1aWxkaW5nQmxvY2tNZXRhZGF0YSkge1xuXHRcdGNvbnN0IG9Qcm9wZXJ0aWVzOiBhbnkgPSB7fTtcblx0XHRjb25zdCBvQWdncmVnYXRpb25zOiBhbnkgPSB7XG5cdFx0XHRcImRlcGVuZGVudHNcIjoge1xuXHRcdFx0XHR0eXBlOiBTQVBfVUlfQ09SRV9FTEVNRU5UXG5cdFx0XHR9LFxuXHRcdFx0XCJjdXN0b21EYXRhXCI6IHtcblx0XHRcdFx0dHlwZTogU0FQX1VJX0NPUkVfRUxFTUVOVFxuXHRcdFx0fVxuXHRcdH07XG5cdFx0Y29uc3Qgb01ldGFkYXRhQ29udGV4dHM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24+ID0ge307XG5cdFx0bGV0IGZvdW5kRGVmYXVsdEFnZ3JlZ2F0aW9uO1xuXHRcdE9iamVjdC5rZXlzKGJ1aWxkaW5nQmxvY2tNZXRhZGF0YS5wcm9wZXJ0aWVzKS5mb3JFYWNoKGZ1bmN0aW9uIChzUHJvcGVydHlOYW1lOiBzdHJpbmcpIHtcblx0XHRcdGlmIChidWlsZGluZ0Jsb2NrTWV0YWRhdGEucHJvcGVydGllc1tzUHJvcGVydHlOYW1lXS50eXBlICE9PSBTQVBfVUlfTU9ERUxfQ09OVEVYVCkge1xuXHRcdFx0XHRvUHJvcGVydGllc1tzUHJvcGVydHlOYW1lXSA9IGJ1aWxkaW5nQmxvY2tNZXRhZGF0YS5wcm9wZXJ0aWVzW3NQcm9wZXJ0eU5hbWVdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b01ldGFkYXRhQ29udGV4dHNbc1Byb3BlcnR5TmFtZV0gPSBidWlsZGluZ0Jsb2NrTWV0YWRhdGEucHJvcGVydGllc1tzUHJvcGVydHlOYW1lXTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHQvLyBNZXJnZSBldmVudHMgaW50byBwcm9wZXJ0aWVzIGFzIHRoZXkgYXJlIGhhbmRsZWQgaWRlbnRpY2FsbHlcblx0XHRpZiAoYnVpbGRpbmdCbG9ja01ldGFkYXRhLmV2ZW50cyAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRPYmplY3Qua2V5cyhidWlsZGluZ0Jsb2NrTWV0YWRhdGEuZXZlbnRzKS5mb3JFYWNoKGZ1bmN0aW9uIChzRXZlbnROYW1lOiBzdHJpbmcpIHtcblx0XHRcdFx0b1Byb3BlcnRpZXNbc0V2ZW50TmFtZV0gPSBidWlsZGluZ0Jsb2NrTWV0YWRhdGEuZXZlbnRzW3NFdmVudE5hbWVdO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmIChidWlsZGluZ0Jsb2NrTWV0YWRhdGEuYWdncmVnYXRpb25zICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdE9iamVjdC5rZXlzKGJ1aWxkaW5nQmxvY2tNZXRhZGF0YS5hZ2dyZWdhdGlvbnMpLmZvckVhY2goZnVuY3Rpb24gKHNQcm9wZXJ0eU5hbWU6IHN0cmluZykge1xuXHRcdFx0XHRvQWdncmVnYXRpb25zW3NQcm9wZXJ0eU5hbWVdID0gYnVpbGRpbmdCbG9ja01ldGFkYXRhLmFnZ3JlZ2F0aW9uc1tzUHJvcGVydHlOYW1lXTtcblx0XHRcdFx0aWYgKG9BZ2dyZWdhdGlvbnNbc1Byb3BlcnR5TmFtZV0uaXNEZWZhdWx0KSB7XG5cdFx0XHRcdFx0Zm91bmREZWZhdWx0QWdncmVnYXRpb24gPSBzUHJvcGVydHlOYW1lO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIHtcblx0XHRcdHByb3BlcnRpZXM6IG9Qcm9wZXJ0aWVzLFxuXHRcdFx0YWdncmVnYXRpb25zOiBvQWdncmVnYXRpb25zLFxuXHRcdFx0ZGVmYXVsdEFnZ3JlZ2F0aW9uOiBmb3VuZERlZmF1bHRBZ2dyZWdhdGlvbixcblx0XHRcdG1ldGFkYXRhQ29udGV4dHM6IG9NZXRhZGF0YUNvbnRleHRzLFxuXHRcdFx0aXNPcGVuOiBpc09wZW5cblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB7XG5cdFx0XHRtZXRhZGF0YUNvbnRleHRzOiB7fSxcblx0XHRcdGFnZ3JlZ2F0aW9uczoge1xuXHRcdFx0XHRcImRlcGVuZGVudHNcIjoge1xuXHRcdFx0XHRcdHR5cGU6IFNBUF9VSV9DT1JFX0VMRU1FTlRcblx0XHRcdFx0fSxcblx0XHRcdFx0XCJjdXN0b21EYXRhXCI6IHtcblx0XHRcdFx0XHR0eXBlOiBTQVBfVUlfQ09SRV9FTEVNRU5UXG5cdFx0XHRcdH1cblx0XHRcdH0sXG5cdFx0XHRwcm9wZXJ0aWVzOiB7fSxcblx0XHRcdGlzT3BlbjogaXNPcGVuXG5cdFx0fTtcblx0fVxufVxuXG4vKipcbiAqIENoZWNrcyB0aGUgYWJzb2x1dGUgb3IgY29udGV4dCBwYXRocyBhbmQgcmV0dXJucyBhbiBhcHByb3ByaWF0ZSBNZXRhQ29udGV4dC5cbiAqXG4gKiBAcGFyYW0gb1NldHRpbmdzIEFkZGl0aW9uYWwgc2V0dGluZ3NcbiAqIEBwYXJhbSBzQXR0cmlidXRlVmFsdWUgVGhlIGF0dHJpYnV0ZSB2YWx1ZVxuICogQHJldHVybnMge01ldGFEYXRhQ29udGV4dH0gVGhlIG1ldGEgZGF0YSBjb250ZXh0IG9iamVjdFxuICovXG5mdW5jdGlvbiBfY2hlY2tBYnNvbHV0ZUFuZENvbnRleHRQYXRocyhvU2V0dGluZ3M6IGFueSwgc0F0dHJpYnV0ZVZhbHVlOiBzdHJpbmcpOiBNZXRhRGF0YUNvbnRleHQge1xuXHRsZXQgc01ldGFQYXRoOiBzdHJpbmc7XG5cdGlmIChzQXR0cmlidXRlVmFsdWUgJiYgc0F0dHJpYnV0ZVZhbHVlLnN0YXJ0c1dpdGgoXCIvXCIpKSB7XG5cdFx0Ly8gYWJzb2x1dGUgcGF0aCAtIHdlIGp1c3QgdXNlIHRoaXMgb25lXG5cdFx0c01ldGFQYXRoID0gc0F0dHJpYnV0ZVZhbHVlO1xuXHR9IGVsc2Uge1xuXHRcdGxldCBzQ29udGV4dFBhdGggPSBvU2V0dGluZ3MuY3VycmVudENvbnRleHRQYXRoLmdldFBhdGgoKTtcblx0XHRpZiAoIXNDb250ZXh0UGF0aC5lbmRzV2l0aChcIi9cIikpIHtcblx0XHRcdHNDb250ZXh0UGF0aCArPSBcIi9cIjtcblx0XHR9XG5cdFx0c01ldGFQYXRoID0gc0NvbnRleHRQYXRoICsgc0F0dHJpYnV0ZVZhbHVlO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0bW9kZWw6IFwibWV0YU1vZGVsXCIsXG5cdFx0cGF0aDogc01ldGFQYXRoXG5cdH07XG59XG5cbi8qKlxuICogVGhpcyBtZXRob2QgaGVscHMgdG8gY3JlYXRlIHRoZSBtZXRhZGF0YSBjb250ZXh0IGluIGNhc2UgaXQgaXMgbm90IHlldCBhdmFpbGFibGUgaW4gdGhlIHN0b3JlLlxuICpcbiAqIEBwYXJhbSBvU2V0dGluZ3MgQWRkaXRpb25hbCBzZXR0aW5nc1xuICogQHBhcmFtIHNBdHRyaWJ1dGVOYW1lIFRoZSBhdHRyaWJ1dGUgbmFtZVxuICogQHBhcmFtIHNBdHRyaWJ1dGVWYWx1ZSBUaGUgYXR0cmlidXRlIHZhbHVlXG4gKiBAcmV0dXJucyB7TWV0YURhdGFDb250ZXh0fSBUaGUgbWV0YSBkYXRhIGNvbnRleHQgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIF9jcmVhdGVJbml0aWFsTWV0YWRhdGFDb250ZXh0KG9TZXR0aW5nczogYW55LCBzQXR0cmlidXRlTmFtZTogc3RyaW5nLCBzQXR0cmlidXRlVmFsdWU6IHN0cmluZyk6IE1ldGFEYXRhQ29udGV4dCB7XG5cdGxldCByZXR1cm5Db250ZXh0OiBNZXRhRGF0YUNvbnRleHQ7XG5cdGlmIChzQXR0cmlidXRlVmFsdWUuc3RhcnRzV2l0aChcIi91aWQtLVwiKSkge1xuXHRcdGNvbnN0IG9EYXRhID0gbXlTdG9yZVtzQXR0cmlidXRlVmFsdWVdO1xuXHRcdG9TZXR0aW5ncy5tb2RlbHMuY29udmVydGVyQ29udGV4dC5zZXRQcm9wZXJ0eShzQXR0cmlidXRlVmFsdWUsIG9EYXRhKTtcblx0XHRyZXR1cm5Db250ZXh0ID0ge1xuXHRcdFx0bW9kZWw6IFwiY29udmVydGVyQ29udGV4dFwiLFxuXHRcdFx0cGF0aDogc0F0dHJpYnV0ZVZhbHVlXG5cdFx0fTtcblx0XHRkZWxldGUgbXlTdG9yZVtzQXR0cmlidXRlVmFsdWVdO1xuXHR9IGVsc2UgaWYgKChzQXR0cmlidXRlTmFtZSA9PT0gXCJtZXRhUGF0aFwiICYmIG9TZXR0aW5ncy5jdXJyZW50Q29udGV4dFBhdGgpIHx8IHNBdHRyaWJ1dGVOYW1lID09PSBcImNvbnRleHRQYXRoXCIpIHtcblx0XHRyZXR1cm5Db250ZXh0ID0gX2NoZWNrQWJzb2x1dGVBbmRDb250ZXh0UGF0aHMob1NldHRpbmdzLCBzQXR0cmlidXRlVmFsdWUpO1xuXHR9IGVsc2UgaWYgKHNBdHRyaWJ1dGVWYWx1ZSAmJiBzQXR0cmlidXRlVmFsdWUuc3RhcnRzV2l0aChcIi9cIikpIHtcblx0XHQvLyBhYnNvbHV0ZSBwYXRoIC0gd2UganVzdCB1c2UgdGhpcyBvbmVcblx0XHRyZXR1cm5Db250ZXh0ID0ge1xuXHRcdFx0bW9kZWw6IFwibWV0YU1vZGVsXCIsXG5cdFx0XHRwYXRoOiBzQXR0cmlidXRlVmFsdWVcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybkNvbnRleHQgPSB7XG5cdFx0XHRtb2RlbDogXCJtZXRhTW9kZWxcIixcblx0XHRcdHBhdGg6IG9TZXR0aW5ncy5iaW5kaW5nQ29udGV4dHMuZW50aXR5U2V0ID8gb1NldHRpbmdzLmJpbmRpbmdDb250ZXh0cy5lbnRpdHlTZXQuZ2V0UGF0aChzQXR0cmlidXRlVmFsdWUpIDogc0F0dHJpYnV0ZVZhbHVlXG5cdFx0fTtcblx0fVxuXHRyZXR1cm4gcmV0dXJuQ29udGV4dDtcbn1cblxuZnVuY3Rpb24gX2dldE1ldGFkYXRhQ29udGV4dChcblx0b1NldHRpbmdzOiBhbnksXG5cdG9Ob2RlOiBFbGVtZW50LFxuXHRzQXR0cmlidXRlTmFtZTogc3RyaW5nLFxuXHRvVmlzaXRvcjogSUNhbGxiYWNrLFxuXHRiRG9Ob3RSZXNvbHZlOiBib29sZWFuLFxuXHRpc09wZW46IGJvb2xlYW5cbikge1xuXHRsZXQgb01ldGFkYXRhQ29udGV4dDogTWV0YURhdGFDb250ZXh0IHwgdW5kZWZpbmVkO1xuXHRpZiAoIWJEb05vdFJlc29sdmUgJiYgb05vZGUuaGFzQXR0cmlidXRlKHNBdHRyaWJ1dGVOYW1lKSkge1xuXHRcdGNvbnN0IHNBdHRyaWJ1dGVWYWx1ZSA9IG9Ob2RlLmdldEF0dHJpYnV0ZShzQXR0cmlidXRlTmFtZSkgYXMgc3RyaW5nO1xuXHRcdG9NZXRhZGF0YUNvbnRleHQgPSBCaW5kaW5nUGFyc2VyLmNvbXBsZXhQYXJzZXIoc0F0dHJpYnV0ZVZhbHVlKTtcblx0XHRpZiAoIW9NZXRhZGF0YUNvbnRleHQpIHtcblx0XHRcdG9NZXRhZGF0YUNvbnRleHQgPSBfY3JlYXRlSW5pdGlhbE1ldGFkYXRhQ29udGV4dChvU2V0dGluZ3MsIHNBdHRyaWJ1dGVOYW1lLCBzQXR0cmlidXRlVmFsdWUpO1xuXHRcdH1cblx0fSBlbHNlIGlmIChvU2V0dGluZ3MuYmluZGluZ0NvbnRleHRzLmhhc093blByb3BlcnR5KHNBdHRyaWJ1dGVOYW1lKSkge1xuXHRcdG9NZXRhZGF0YUNvbnRleHQgPSB7XG5cdFx0XHRtb2RlbDogc0F0dHJpYnV0ZU5hbWUsXG5cdFx0XHRwYXRoOiBcIlwiXG5cdFx0fTtcblx0fSBlbHNlIGlmIChpc09wZW4pIHtcblx0XHR0cnkge1xuXHRcdFx0aWYgKG9WaXNpdG9yLmdldENvbnRleHQoYCR7c0F0dHJpYnV0ZU5hbWV9PmApKSB7XG5cdFx0XHRcdG9NZXRhZGF0YUNvbnRleHQgPSB7XG5cdFx0XHRcdFx0bW9kZWw6IHNBdHRyaWJ1dGVOYW1lLFxuXHRcdFx0XHRcdHBhdGg6IFwiXCJcblx0XHRcdFx0fTtcblx0XHRcdH1cblx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb01ldGFkYXRhQ29udGV4dDtcbn1cblxuLyoqXG4gKiBQYXJzZSB0aGUgaW5jb21pbmcgWE1MIG5vZGUgYW5kIHRyeSB0byByZXNvbHZlIHRoZSBwcm9wZXJ0aWVzIGRlZmluZWQgdGhlcmUuXG4gKlxuICogQHBhcmFtIG9NZXRhZGF0YSBUaGUgbWV0YWRhdGEgZm9yIHRoZSBidWlsZGluZyBibG9ja1xuICogQHBhcmFtIG9Ob2RlIFRoZSBYTUwgbm9kZSB0byBwYXJzZVxuICogQHBhcmFtIGlzUHVibGljIFdoZXRoZXIgdGhlIGJ1aWxkaW5nIGJsb2NrIGlzIHVzZWQgaW4gYSBwdWJsaWMgY29udGV4dCBvciBub3RcbiAqIEBwYXJhbSBvVmlzaXRvciBUaGUgdmlzaXRvciBpbnN0YW5jZVxuICogQHBhcmFtIGFwaVZlcnNpb24gVGhlIEFQSSB2ZXJzaW9uIG9mIHRoZSBidWlsZGluZyBibG9ja1xuICovXG5hc3luYyBmdW5jdGlvbiBwcm9jZXNzUHJvcGVydGllcyhcblx0b01ldGFkYXRhOiBSZXNvbHZlZEJ1aWxkaW5nQmxvY2tNZXRhZGF0YSxcblx0b05vZGU6IEVsZW1lbnQsXG5cdGlzUHVibGljOiBib29sZWFuLFxuXHRvVmlzaXRvcjogSUNhbGxiYWNrLFxuXHRhcGlWZXJzaW9uPzogbnVtYmVyXG4pIHtcblx0Y29uc3Qgb0RlZmluaXRpb25Qcm9wZXJ0aWVzID0gb01ldGFkYXRhLnByb3BlcnRpZXM7XG5cblx0Ly8gUmV0cmlldmUgcHJvcGVydGllcyB2YWx1ZXNcblx0Y29uc3QgYURlZmluaXRpb25Qcm9wZXJ0aWVzS2V5cyA9IE9iamVjdC5rZXlzKG9EZWZpbml0aW9uUHJvcGVydGllcyk7XG5cblx0Y29uc3QgcHJvcGVydHlWYWx1ZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblx0Zm9yIChjb25zdCBzS2V5VmFsdWUgb2YgYURlZmluaXRpb25Qcm9wZXJ0aWVzS2V5cykge1xuXHRcdGlmIChvRGVmaW5pdGlvblByb3BlcnRpZXNbc0tleVZhbHVlXS50eXBlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRwcm9wZXJ0eVZhbHVlc1tzS2V5VmFsdWVdID0gZGVlcENsb25lKG9EZWZpbml0aW9uUHJvcGVydGllc1tzS2V5VmFsdWVdLmRlZmF1bHRWYWx1ZSB8fCB7fSk7IC8vIFRvIGF2b2lkIHZhbHVlcyBiZWluZyByZXVzZWQgYWNyb3NzIG1hY3Jvc1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRwcm9wZXJ0eVZhbHVlc1tzS2V5VmFsdWVdID0gb0RlZmluaXRpb25Qcm9wZXJ0aWVzW3NLZXlWYWx1ZV0uZGVmYXVsdFZhbHVlO1xuXHRcdH1cblx0XHRpZiAob05vZGUuaGFzQXR0cmlidXRlKHNLZXlWYWx1ZSkgJiYgaXNQdWJsaWMgJiYgb0RlZmluaXRpb25Qcm9wZXJ0aWVzW3NLZXlWYWx1ZV0uaXNQdWJsaWMgPT09IGZhbHNlKSB7XG5cdFx0XHRMb2cuZXJyb3IoYFByb3BlcnR5ICR7c0tleVZhbHVlfSB3YXMgaWdub3JlZCBhcyBpdCBpcyBub3QgaW50ZW5kZWQgZm9yIHB1YmxpYyB1c2FnZWApO1xuXHRcdH0gZWxzZSBpZiAob05vZGUuaGFzQXR0cmlidXRlKHNLZXlWYWx1ZSkpIHtcblx0XHRcdGF3YWl0IG9WaXNpdG9yLnZpc2l0QXR0cmlidXRlKG9Ob2RlLCBvTm9kZS5hdHRyaWJ1dGVzLmdldE5hbWVkSXRlbShzS2V5VmFsdWUpIGFzIEF0dHIpO1xuXHRcdFx0bGV0IHZWYWx1ZTogYW55ID0gb05vZGUuZ2V0QXR0cmlidXRlKHNLZXlWYWx1ZSk7XG5cdFx0XHRpZiAodlZhbHVlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0aWYgKGFwaVZlcnNpb24gPT09IDIgJiYgdHlwZW9mIHZWYWx1ZSA9PT0gXCJzdHJpbmdcIiAmJiAhdlZhbHVlLnN0YXJ0c1dpdGgoXCJ7XCIpKSB7XG5cdFx0XHRcdFx0c3dpdGNoIChvRGVmaW5pdGlvblByb3BlcnRpZXNbc0tleVZhbHVlXS50eXBlKSB7XG5cdFx0XHRcdFx0XHRjYXNlIFwiYm9vbGVhblwiOlxuXHRcdFx0XHRcdFx0XHR2VmFsdWUgPSB2VmFsdWUgPT09IFwidHJ1ZVwiO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdGNhc2UgXCJudW1iZXJcIjpcblx0XHRcdFx0XHRcdFx0dlZhbHVlID0gTnVtYmVyKHZWYWx1ZSk7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRwcm9wZXJ0eVZhbHVlc1tzS2V5VmFsdWVdID0gdlZhbHVlO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXHRyZXR1cm4gcHJvcGVydHlWYWx1ZXM7XG59XG5cbi8qKlxuICogUGFyc2UgdGhlIGluY29taW5nIFhNTCBub2RlIGFuZCB0cnkgdG8gcmVzb2x2ZSB0aGUgYmluZGluZyBjb250ZXh0cyBkZWZpbmVkIGluc2lkZS5cbiAqXG4gKiBAcGFyYW0gb01ldGFkYXRhIFRoZSBtZXRhZGF0YSBmb3IgdGhlIGJ1aWxkaW5nIGJsb2NrXG4gKiBAcGFyYW0gb1NldHRpbmdzIFRoZSBzZXR0aW5ncyBvYmplY3RcbiAqIEBwYXJhbSBvTm9kZSBUaGUgWE1MIG5vZGUgdG8gcGFyc2VcbiAqIEBwYXJhbSBpc1B1YmxpYyBXaGV0aGVyIHRoZSBidWlsZGluZyBibG9jayBpcyB1c2VkIGluIGEgcHVibGljIGNvbnRleHQgb3Igbm90XG4gKiBAcGFyYW0gb1Zpc2l0b3IgVGhlIHZpc2l0b3IgaW5zdGFuY2VcbiAqIEBwYXJhbSBtQ29udGV4dHMgVGhlIGNvbnRleHRzIHRvIGJlIHVzZWRcbiAqIEBwYXJhbSBvTWV0YWRhdGFDb250ZXh0c1x0VGhlIG1ldGFkYXRhIGNvbnRleHRzIHRvIGJlIHVzZWRcbiAqL1xuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0NvbnRleHRzKFxuXHRvTWV0YWRhdGE6IFJlc29sdmVkQnVpbGRpbmdCbG9ja01ldGFkYXRhLFxuXHRvU2V0dGluZ3M6IGFueSxcblx0b05vZGU6IEVsZW1lbnQsXG5cdGlzUHVibGljOiBib29sZWFuLFxuXHRvVmlzaXRvcjogSUNhbGxiYWNrLFxuXHRtQ29udGV4dHM6IGFueSxcblx0b01ldGFkYXRhQ29udGV4dHM6IGFueVxuKSB7XG5cdG9TZXR0aW5ncy5jdXJyZW50Q29udGV4dFBhdGggPSBvU2V0dGluZ3MuYmluZGluZ0NvbnRleHRzLmNvbnRleHRQYXRoO1xuXHRjb25zdCBtTWlzc2luZ0NvbnRleHQ6IFJlY29yZDxzdHJpbmcsIGJvb2xlYW4+ID0ge307XG5cdGNvbnN0IHByb3BlcnR5VmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cdGNvbnN0IG9EZWZpbml0aW9uQ29udGV4dHMgPSBvTWV0YWRhdGEubWV0YWRhdGFDb250ZXh0cztcblx0Y29uc3QgYURlZmluaXRpb25Db250ZXh0c0tleXMgPSBPYmplY3Qua2V5cyhvRGVmaW5pdGlvbkNvbnRleHRzKTtcblx0Ly8gU2luY2UgdGhlIG1ldGFQYXRoIGFuZCBvdGhlciBwcm9wZXJ0eSBjYW4gYmUgcmVsYXRpdmUgdG8gdGhlIGNvbnRleHRQYXRoIHdlIG5lZWQgdG8gZXZhbHVhdGUgdGhlIGN1cnJlbnQgY29udGV4dFBhdGggZmlyc3Rcblx0Y29uc3QgY29udGV4dFBhdGhJbmRleCA9IGFEZWZpbml0aW9uQ29udGV4dHNLZXlzLmluZGV4T2YoXCJjb250ZXh0UGF0aFwiKTtcblx0aWYgKGNvbnRleHRQYXRoSW5kZXggIT09IC0xKSB7XG5cdFx0Ly8gSWYgaXQgaXMgZGVmaW5lZCB3ZSBleHRyYWN0IGl0IGFuZCByZWluc2VydCBpdCBpbiB0aGUgZmlyc3QgcG9zaXRpb24gb2YgdGhlIGFycmF5XG5cdFx0Y29uc3QgY29udGV4dFBhdGhEZWZpbml0aW9uID0gYURlZmluaXRpb25Db250ZXh0c0tleXMuc3BsaWNlKGNvbnRleHRQYXRoSW5kZXgsIDEpO1xuXHRcdGFEZWZpbml0aW9uQ29udGV4dHNLZXlzLnNwbGljZSgwLCAwLCBjb250ZXh0UGF0aERlZmluaXRpb25bMF0pO1xuXHR9XG5cdGZvciAoY29uc3Qgc0F0dHJpYnV0ZU5hbWUgb2YgYURlZmluaXRpb25Db250ZXh0c0tleXMpIHtcblx0XHRjb25zdCBiRG9Ob3RSZXNvbHZlID0gaXNQdWJsaWMgJiYgb0RlZmluaXRpb25Db250ZXh0c1tzQXR0cmlidXRlTmFtZV0uaXNQdWJsaWMgPT09IGZhbHNlICYmIG9Ob2RlLmhhc0F0dHJpYnV0ZShzQXR0cmlidXRlTmFtZSk7XG5cdFx0Y29uc3Qgb01ldGFkYXRhQ29udGV4dCA9IF9nZXRNZXRhZGF0YUNvbnRleHQob1NldHRpbmdzLCBvTm9kZSwgc0F0dHJpYnV0ZU5hbWUsIG9WaXNpdG9yLCBiRG9Ob3RSZXNvbHZlLCBvTWV0YWRhdGEuaXNPcGVuKTtcblx0XHRpZiAob01ldGFkYXRhQ29udGV4dCkge1xuXHRcdFx0b01ldGFkYXRhQ29udGV4dC5uYW1lID0gc0F0dHJpYnV0ZU5hbWU7XG5cdFx0XHRhZGRTaW5nbGVDb250ZXh0KG1Db250ZXh0cywgb1Zpc2l0b3IsIG9NZXRhZGF0YUNvbnRleHQsIG9NZXRhZGF0YUNvbnRleHRzKTtcblx0XHRcdGlmIChcblx0XHRcdFx0KHNBdHRyaWJ1dGVOYW1lID09PSBcImVudGl0eVNldFwiIHx8IHNBdHRyaWJ1dGVOYW1lID09PSBcImNvbnRleHRQYXRoXCIpICYmXG5cdFx0XHRcdCFvU2V0dGluZ3MuYmluZGluZ0NvbnRleHRzLmhhc093blByb3BlcnR5KHNBdHRyaWJ1dGVOYW1lKVxuXHRcdFx0KSB7XG5cdFx0XHRcdG9TZXR0aW5ncy5iaW5kaW5nQ29udGV4dHNbc0F0dHJpYnV0ZU5hbWVdID0gbUNvbnRleHRzW3NBdHRyaWJ1dGVOYW1lXTtcblx0XHRcdH1cblx0XHRcdGlmIChzQXR0cmlidXRlTmFtZSA9PT0gXCJjb250ZXh0UGF0aFwiKSB7XG5cdFx0XHRcdG9TZXR0aW5ncy5jdXJyZW50Q29udGV4dFBhdGggPSBtQ29udGV4dHNbc0F0dHJpYnV0ZU5hbWVdO1xuXHRcdFx0fVxuXHRcdFx0cHJvcGVydHlWYWx1ZXNbc0F0dHJpYnV0ZU5hbWVdID0gbUNvbnRleHRzW3NBdHRyaWJ1dGVOYW1lXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0bU1pc3NpbmdDb250ZXh0W3NBdHRyaWJ1dGVOYW1lXSA9IHRydWU7XG5cdFx0fVxuXHR9XG5cdHJldHVybiB7IG1NaXNzaW5nQ29udGV4dCwgcHJvcGVydHlWYWx1ZXM6IHByb3BlcnR5VmFsdWVzIH07XG59XG5mdW5jdGlvbiBwYXJzZUFnZ3JlZ2F0aW9uKG9BZ2dyZWdhdGlvbj86IEVsZW1lbnQpIHtcblx0Y29uc3Qgb091dE9iamVjdHM6IGFueSA9IHt9O1xuXHRpZiAob0FnZ3JlZ2F0aW9uICYmIG9BZ2dyZWdhdGlvbi5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0Y29uc3QgY2hpbGRyZW4gPSBvQWdncmVnYXRpb24uY2hpbGRyZW47XG5cdFx0Zm9yIChsZXQgY2hpbGRJZHggPSAwOyBjaGlsZElkeCA8IGNoaWxkcmVuLmxlbmd0aDsgY2hpbGRJZHgrKykge1xuXHRcdFx0Y29uc3QgY2hpbGREZWZpbml0aW9uID0gY2hpbGRyZW5bY2hpbGRJZHhdO1xuXHRcdFx0bGV0IGNoaWxkS2V5ID0gY2hpbGREZWZpbml0aW9uLmdldEF0dHJpYnV0ZShcImtleVwiKSB8fCBjaGlsZERlZmluaXRpb24uZ2V0QXR0cmlidXRlKFwiaWRcIik7XG5cdFx0XHRpZiAoY2hpbGRLZXkpIHtcblx0XHRcdFx0Y2hpbGRLZXkgPSBgSW5saW5lWE1MXyR7Y2hpbGRLZXl9YDtcblx0XHRcdFx0Y2hpbGREZWZpbml0aW9uLnNldEF0dHJpYnV0ZShcImtleVwiLCBjaGlsZEtleSk7XG5cdFx0XHRcdG9PdXRPYmplY3RzW2NoaWxkS2V5XSA9IHtcblx0XHRcdFx0XHRrZXk6IGNoaWxkS2V5LFxuXHRcdFx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdFx0XHRwbGFjZW1lbnQ6IGNoaWxkRGVmaW5pdGlvbi5nZXRBdHRyaWJ1dGUoXCJwbGFjZW1lbnRcIiksXG5cdFx0XHRcdFx0XHRhbmNob3I6IGNoaWxkRGVmaW5pdGlvbi5nZXRBdHRyaWJ1dGUoXCJhbmNob3JcIilcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdHR5cGU6IFwiU2xvdFwiXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBvT3V0T2JqZWN0cztcbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0NoaWxkcmVuKFxuXHRvTm9kZTogRWxlbWVudCxcblx0b1Zpc2l0b3I6IElDYWxsYmFjayxcblx0b01ldGFkYXRhOiBSZXNvbHZlZEJ1aWxkaW5nQmxvY2tNZXRhZGF0YSxcblx0aXNQdWJsaWM6IGJvb2xlYW4sXG5cdHByb3BlcnR5VmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuXHRhcGlWZXJzaW9uPzogbnVtYmVyXG4pIHtcblx0Y29uc3Qgb0FnZ3JlZ2F0aW9uczogYW55ID0ge307XG5cdGlmIChvTm9kZS5maXJzdEVsZW1lbnRDaGlsZCAhPT0gbnVsbCkge1xuXHRcdGxldCBvRmlyc3RFbGVtZW50Q2hpbGQ6IEVsZW1lbnQgfCBudWxsID0gb05vZGUuZmlyc3RFbGVtZW50Q2hpbGQgYXMgRWxlbWVudCB8IG51bGw7XG5cdFx0aWYgKGFwaVZlcnNpb24gPT09IDIpIHtcblx0XHRcdHdoaWxlIChvRmlyc3RFbGVtZW50Q2hpbGQgIT09IG51bGwpIHtcblx0XHRcdFx0Y29uc3Qgc0NoaWxkTmFtZSA9IG9GaXJzdEVsZW1lbnRDaGlsZC5sb2NhbE5hbWU7XG5cdFx0XHRcdGxldCBzQWdncmVnYXRpb25OYW1lID0gc0NoaWxkTmFtZTtcblx0XHRcdFx0aWYgKHNBZ2dyZWdhdGlvbk5hbWVbMF0udG9VcHBlckNhc2UoKSA9PT0gc0FnZ3JlZ2F0aW9uTmFtZVswXSkge1xuXHRcdFx0XHRcdC8vIG5vdCBhIHN1YiBhZ2dyZWdhdGlvbiwgZ28gYmFjayB0byBkZWZhdWx0IEFnZ3JlZ2F0aW9uXG5cdFx0XHRcdFx0c0FnZ3JlZ2F0aW9uTmFtZSA9IG9NZXRhZGF0YS5kZWZhdWx0QWdncmVnYXRpb24gfHwgXCJcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBhZ2dyZWdhdGlvbkRlZmluaXRpb24gPSBvTWV0YWRhdGEuYWdncmVnYXRpb25zW3NBZ2dyZWdhdGlvbk5hbWVdO1xuXHRcdFx0XHRpZiAoYWdncmVnYXRpb25EZWZpbml0aW9uICE9PSB1bmRlZmluZWQgJiYgIWFnZ3JlZ2F0aW9uRGVmaW5pdGlvbi5zbG90KSB7XG5cdFx0XHRcdFx0Y29uc3QgcGFyc2VkQWdncmVnYXRpb24gPSBwYXJzZUFnZ3JlZ2F0aW9uKG9GaXJzdEVsZW1lbnRDaGlsZCk7XG5cdFx0XHRcdFx0b0FnZ3JlZ2F0aW9uc1tzQWdncmVnYXRpb25OYW1lXSA9IHBhcnNlZEFnZ3JlZ2F0aW9uO1xuXHRcdFx0XHRcdGZvciAoY29uc3QgcGFyc2VkQWdncmVnYXRpb25LZXkgaW4gcGFyc2VkQWdncmVnYXRpb24pIHtcblx0XHRcdFx0XHRcdG9NZXRhZGF0YS5hZ2dyZWdhdGlvbnNbcGFyc2VkQWdncmVnYXRpb25LZXldID0gcGFyc2VkQWdncmVnYXRpb25bcGFyc2VkQWdncmVnYXRpb25LZXldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRvRmlyc3RFbGVtZW50Q2hpbGQgPSBvRmlyc3RFbGVtZW50Q2hpbGQubmV4dEVsZW1lbnRTaWJsaW5nO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChhcGlWZXJzaW9uICE9PSAyKSB7XG5cdFx0XHQvLyBJZiB0aGVyZSBhcmUgYWdncmVnYXRpb24gd2UgbmVlZCB0byB2aXNpdCB0aGUgY2hpbGROb2RlcyB0byByZXNvbHZlIHRlbXBsYXRpbmcgaW5zdHJ1Y3Rpb25zXG5cdFx0XHRhd2FpdCBvVmlzaXRvci52aXNpdENoaWxkTm9kZXMob05vZGUpO1xuXHRcdH1cblx0XHRvRmlyc3RFbGVtZW50Q2hpbGQgPSBvTm9kZS5maXJzdEVsZW1lbnRDaGlsZDtcblx0XHR3aGlsZSAob0ZpcnN0RWxlbWVudENoaWxkICE9PSBudWxsKSB7XG5cdFx0XHRjb25zdCBvTmV4dENoaWxkOiBFbGVtZW50IHwgbnVsbCA9IG9GaXJzdEVsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmc7XG5cdFx0XHRjb25zdCBzQ2hpbGROYW1lID0gb0ZpcnN0RWxlbWVudENoaWxkLmxvY2FsTmFtZTtcblx0XHRcdGxldCBzQWdncmVnYXRpb25OYW1lID0gc0NoaWxkTmFtZTtcblx0XHRcdGlmIChzQWdncmVnYXRpb25OYW1lWzBdLnRvVXBwZXJDYXNlKCkgPT09IHNBZ2dyZWdhdGlvbk5hbWVbMF0pIHtcblx0XHRcdFx0Ly8gbm90IGEgc3ViIGFnZ3JlZ2F0aW9uLCBnbyBiYWNrIHRvIGRlZmF1bHQgQWdncmVnYXRpb25cblx0XHRcdFx0c0FnZ3JlZ2F0aW9uTmFtZSA9IG9NZXRhZGF0YS5kZWZhdWx0QWdncmVnYXRpb24gfHwgXCJcIjtcblx0XHRcdH1cblx0XHRcdGlmIChcblx0XHRcdFx0T2JqZWN0LmtleXMob01ldGFkYXRhLmFnZ3JlZ2F0aW9ucykuaW5kZXhPZihzQWdncmVnYXRpb25OYW1lKSAhPT0gLTEgJiZcblx0XHRcdFx0KCFpc1B1YmxpYyB8fCBvTWV0YWRhdGEuYWdncmVnYXRpb25zW3NBZ2dyZWdhdGlvbk5hbWVdLmlzUHVibGljID09PSB0cnVlKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGlmIChhcGlWZXJzaW9uID09PSAyKSB7XG5cdFx0XHRcdFx0Y29uc3QgYWdncmVnYXRpb25EZWZpbml0aW9uID0gb01ldGFkYXRhLmFnZ3JlZ2F0aW9uc1tzQWdncmVnYXRpb25OYW1lXTtcblx0XHRcdFx0XHRpZiAoIWFnZ3JlZ2F0aW9uRGVmaW5pdGlvbi5zbG90ICYmIG9GaXJzdEVsZW1lbnRDaGlsZCAhPT0gbnVsbCAmJiBvRmlyc3RFbGVtZW50Q2hpbGQuY2hpbGRyZW4ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0YXdhaXQgb1Zpc2l0b3IudmlzaXROb2RlKG9GaXJzdEVsZW1lbnRDaGlsZCk7XG5cdFx0XHRcdFx0XHRsZXQgY2hpbGREZWZpbml0aW9uID0gb0ZpcnN0RWxlbWVudENoaWxkLmZpcnN0RWxlbWVudENoaWxkO1xuXHRcdFx0XHRcdFx0d2hpbGUgKGNoaWxkRGVmaW5pdGlvbikge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBvTmV3Q2hpbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMob05vZGUubmFtZXNwYWNlVVJJLCBjaGlsZERlZmluaXRpb24uZ2V0QXR0cmlidXRlKFwia2V5XCIpISk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG5leHRDaGlsZCA9IGNoaWxkRGVmaW5pdGlvbi5uZXh0RWxlbWVudFNpYmxpbmc7XG5cdFx0XHRcdFx0XHRcdG9OZXdDaGlsZC5hcHBlbmRDaGlsZChjaGlsZERlZmluaXRpb24pO1xuXHRcdFx0XHRcdFx0XHRvQWdncmVnYXRpb25zW2NoaWxkRGVmaW5pdGlvbi5nZXRBdHRyaWJ1dGUoXCJrZXlcIikhXSA9IG9OZXdDaGlsZDtcblx0XHRcdFx0XHRcdFx0Y2hpbGREZWZpbml0aW9uLnJlbW92ZUF0dHJpYnV0ZShcImtleVwiKTtcblx0XHRcdFx0XHRcdFx0Y2hpbGREZWZpbml0aW9uID0gbmV4dENoaWxkO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoYWdncmVnYXRpb25EZWZpbml0aW9uLnNsb3QpIHtcblx0XHRcdFx0XHRcdGlmIChzQWdncmVnYXRpb25OYW1lICE9PSBzQ2hpbGROYW1lKSB7XG5cdFx0XHRcdFx0XHRcdGlmICghb0FnZ3JlZ2F0aW9uc1tzQWdncmVnYXRpb25OYW1lXSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IG9OZXdDaGlsZCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhvTm9kZS5uYW1lc3BhY2VVUkksIHNBZ2dyZWdhdGlvbk5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdG9BZ2dyZWdhdGlvbnNbc0FnZ3JlZ2F0aW9uTmFtZV0gPSBvTmV3Q2hpbGQ7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0b0FnZ3JlZ2F0aW9uc1tzQWdncmVnYXRpb25OYW1lXS5hcHBlbmRDaGlsZChvRmlyc3RFbGVtZW50Q2hpbGQpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0b0FnZ3JlZ2F0aW9uc1tzQWdncmVnYXRpb25OYW1lXSA9IG9GaXJzdEVsZW1lbnRDaGlsZDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YXdhaXQgb1Zpc2l0b3IudmlzaXROb2RlKG9GaXJzdEVsZW1lbnRDaGlsZCk7XG5cdFx0XHRcdFx0b0FnZ3JlZ2F0aW9uc1tvRmlyc3RFbGVtZW50Q2hpbGQubG9jYWxOYW1lXSA9IG9GaXJzdEVsZW1lbnRDaGlsZDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIGlmIChPYmplY3Qua2V5cyhvTWV0YWRhdGEucHJvcGVydGllcykuaW5kZXhPZihzQWdncmVnYXRpb25OYW1lKSAhPT0gLTEpIHtcblx0XHRcdFx0YXdhaXQgb1Zpc2l0b3IudmlzaXROb2RlKG9GaXJzdEVsZW1lbnRDaGlsZCk7XG5cdFx0XHRcdGlmIChvTWV0YWRhdGEucHJvcGVydGllc1tzQWdncmVnYXRpb25OYW1lXS50eXBlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0Ly8gT2JqZWN0IFR5cGUgcHJvcGVydGllc1xuXHRcdFx0XHRcdHByb3BlcnR5VmFsdWVzW3NBZ2dyZWdhdGlvbk5hbWVdID0ge307XG5cdFx0XHRcdFx0Zm9yIChjb25zdCBhdHRyaWJ1dGVJbmRleCBvZiBPYmplY3Qua2V5cyhvRmlyc3RFbGVtZW50Q2hpbGQuYXR0cmlidXRlcykpIHtcblx0XHRcdFx0XHRcdHByb3BlcnR5VmFsdWVzW3NBZ2dyZWdhdGlvbk5hbWVdW29GaXJzdEVsZW1lbnRDaGlsZC5hdHRyaWJ1dGVzW2F0dHJpYnV0ZUluZGV4IGFzIGFueV0ubG9jYWxOYW1lXSA9XG5cdFx0XHRcdFx0XHRcdG9GaXJzdEVsZW1lbnRDaGlsZC5hdHRyaWJ1dGVzW2F0dHJpYnV0ZUluZGV4IGFzIGFueV0udmFsdWU7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2UgaWYgKG9NZXRhZGF0YS5wcm9wZXJ0aWVzW3NBZ2dyZWdhdGlvbk5hbWVdLnR5cGUgPT09IFwiYXJyYXlcIikge1xuXHRcdFx0XHRcdGlmIChvRmlyc3RFbGVtZW50Q2hpbGQgIT09IG51bGwgJiYgb0ZpcnN0RWxlbWVudENoaWxkLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdGNvbnN0IGNoaWxkcmVuID0gb0ZpcnN0RWxlbWVudENoaWxkLmNoaWxkcmVuO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb091dE9iamVjdHMgPSBbXTtcblx0XHRcdFx0XHRcdGZvciAobGV0IGNoaWxkSWR4ID0gMDsgY2hpbGRJZHggPCBjaGlsZHJlbi5sZW5ndGg7IGNoaWxkSWR4KyspIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgY2hpbGREZWZpbml0aW9uID0gY2hpbGRyZW5bY2hpbGRJZHhdO1xuXHRcdFx0XHRcdFx0XHQvLyBub24ga2V5ZWQgY2hpbGQsIGp1c3QgYWRkIGl0IHRvIHRoZSBhZ2dyZWdhdGlvblxuXHRcdFx0XHRcdFx0XHRjb25zdCBteUNoaWxkOiBhbnkgPSB7fTtcblx0XHRcdFx0XHRcdFx0Zm9yIChjb25zdCBhdHRyaWJ1dGVJbmRleCBvZiBPYmplY3Qua2V5cyhjaGlsZERlZmluaXRpb24uYXR0cmlidXRlcykpIHtcblx0XHRcdFx0XHRcdFx0XHRteUNoaWxkW2NoaWxkRGVmaW5pdGlvbi5hdHRyaWJ1dGVzW2F0dHJpYnV0ZUluZGV4IGFzIGFueV0ubG9jYWxOYW1lXSA9XG5cdFx0XHRcdFx0XHRcdFx0XHRjaGlsZERlZmluaXRpb24uYXR0cmlidXRlc1thdHRyaWJ1dGVJbmRleCBhcyBhbnldLnZhbHVlO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdG9PdXRPYmplY3RzLnB1c2gobXlDaGlsZCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlc1tzQWdncmVnYXRpb25OYW1lXSA9IG9PdXRPYmplY3RzO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRvRmlyc3RFbGVtZW50Q2hpbGQgPSBvTmV4dENoaWxkO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gb0FnZ3JlZ2F0aW9ucztcbn1cblxuZnVuY3Rpb24gcHJvY2Vzc1Nsb3RzKFxuXHRvQWdncmVnYXRpb25zOiBSZWNvcmQ8c3RyaW5nLCBhbnk+LFxuXHRvTWV0YWRhdGFBZ2dyZWdhdGlvbnM6IFJlY29yZDxzdHJpbmcsIEJ1aWxkaW5nQmxvY2tBZ2dyZWdhdGlvbkRlZmluaXRpb24+LFxuXHRvTm9kZTogRWxlbWVudCxcblx0cHJvY2Vzc0N1c3RvbURhdGE6IGJvb2xlYW4gPSBmYWxzZVxuKSB7XG5cdGlmIChPYmplY3Qua2V5cyhvQWdncmVnYXRpb25zKS5sZW5ndGggPiAwKSB7XG5cdFx0T2JqZWN0LmtleXMob0FnZ3JlZ2F0aW9ucykuZm9yRWFjaChmdW5jdGlvbiAoc0FnZ3JlZ2F0aW9uTmFtZTogc3RyaW5nKSB7XG5cdFx0XHRjb25zdCBvQWdncmVnYXRpb25FbGVtZW50ID0gb0FnZ3JlZ2F0aW9uc1tzQWdncmVnYXRpb25OYW1lXTtcblx0XHRcdGlmIChvTm9kZSAhPT0gbnVsbCAmJiBvTm9kZSAhPT0gdW5kZWZpbmVkICYmIG9BZ2dyZWdhdGlvbkVsZW1lbnQpIHtcblx0XHRcdFx0Ly8gc2xvdHMgY2FuIGhhdmUgOjogYXMga2V5cyB3aGljaCBpcyBub3QgYSB2YWxpZCBhZ2dyZWdhdGlvbiBuYW1lIHRoZXJlZm9yZSByZXBsYWNpbmcgdGhlbVxuXHRcdFx0XHRjb25zdCBvTmV3Q2hpbGQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50TlMob05vZGUubmFtZXNwYWNlVVJJLCBzQWdncmVnYXRpb25OYW1lLnJlcGxhY2UoLzovZ2ksIFwiX1wiKSk7XG5cdFx0XHRcdGxldCBvRWxlbWVudENoaWxkID0gb0FnZ3JlZ2F0aW9uRWxlbWVudC5maXJzdEVsZW1lbnRDaGlsZDtcblx0XHRcdFx0d2hpbGUgKG9FbGVtZW50Q2hpbGQpIHtcblx0XHRcdFx0XHRjb25zdCBvTmV4dENoaWxkID0gb0VsZW1lbnRDaGlsZC5uZXh0RWxlbWVudFNpYmxpbmc7XG5cdFx0XHRcdFx0b05ld0NoaWxkLmFwcGVuZENoaWxkKG9FbGVtZW50Q2hpbGQpO1xuXHRcdFx0XHRcdG9FbGVtZW50Q2hpbGQgPSBvTmV4dENoaWxkO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChzQWdncmVnYXRpb25OYW1lICE9PSBcImN1c3RvbURhdGFcIiAmJiBzQWdncmVnYXRpb25OYW1lICE9PSBcImRlcGVuZGVudHNcIikge1xuXHRcdFx0XHRcdGNvbnN0IHNTbG90TmFtZSA9XG5cdFx0XHRcdFx0XHQob01ldGFkYXRhQWdncmVnYXRpb25zW3NBZ2dyZWdhdGlvbk5hbWVdICE9PSB1bmRlZmluZWQgJiYgb01ldGFkYXRhQWdncmVnYXRpb25zW3NBZ2dyZWdhdGlvbk5hbWVdLnNsb3QpIHx8XG5cdFx0XHRcdFx0XHRzQWdncmVnYXRpb25OYW1lO1xuXHRcdFx0XHRcdGNvbnN0IG9UYXJnZXRFbGVtZW50ID0gb05vZGUucXVlcnlTZWxlY3Rvcihgc2xvdFtuYW1lPScke3NTbG90TmFtZX0nXWApO1xuXHRcdFx0XHRcdGlmIChvVGFyZ2V0RWxlbWVudCAhPT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0b1RhcmdldEVsZW1lbnQucmVwbGFjZVdpdGgoLi4uKG9OZXdDaGlsZC5jaGlsZHJlbiBhcyBhbnkpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSBpZiAocHJvY2Vzc0N1c3RvbURhdGEgJiYgb05ld0NoaWxkLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRvTm9kZS5hcHBlbmRDaGlsZChvTmV3Q2hpbGQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0J1aWxkaW5nQmxvY2soXG5cdGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uOiBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbixcblx0b05vZGU6IEVsZW1lbnQsXG5cdG9WaXNpdG9yOiBJQ2FsbGJhY2ssXG5cdGlzUHVibGljID0gZmFsc2Vcbikge1xuXHRjb25zdCBzRnJhZ21lbnROYW1lID0gYnVpbGRpbmdCbG9ja0RlZmluaXRpb24uZnJhZ21lbnQgfHwgYCR7YnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubmFtZXNwYWNlfS4ke2J1aWxkaW5nQmxvY2tEZWZpbml0aW9uLm5hbWV9YDtcblxuXHRjb25zdCBzTmFtZSA9IFwidGhpc1wiO1xuXG5cdGNvbnN0IG1Db250ZXh0czogYW55ID0ge307XG5cdGNvbnN0IG9NZXRhZGF0YUNvbnRleHRzOiBhbnkgPSB7fTtcblx0Y29uc3Qgb1NldHRpbmdzID0gb1Zpc2l0b3IuZ2V0U2V0dGluZ3MoKTtcblx0Ly8gVE9ETyAwMDAxIE1vdmUgdGhpcyBlbHNld2hlcmUgdGhpcyBpcyB3ZWlyZCA6KVxuXHRpZiAob1NldHRpbmdzLm1vZGVsc1tcInNhcC5mZS5pMThuXCJdKSB7XG5cdFx0b1NldHRpbmdzLm1vZGVsc1tcInNhcC5mZS5pMThuXCJdXG5cdFx0XHQuZ2V0UmVzb3VyY2VCdW5kbGUoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKG9SZXNvdXJjZUJ1bmRsZTogYW55KSB7XG5cdFx0XHRcdFJlc291cmNlTW9kZWwuc2V0QXBwbGljYXRpb25JMThuQnVuZGxlKG9SZXNvdXJjZUJ1bmRsZSk7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChlcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihlcnJvcik7XG5cdFx0XHR9KTtcblx0fVxuXHRjb25zdCBvTWV0YWRhdGEgPSBwcmVwYXJlTWV0YWRhdGEoYnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubWV0YWRhdGEsIGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmlzT3Blbik7XG5cblx0Ly9JbmplY3Qgc3RvcmFnZSBmb3IgbWFjcm9zXG5cdGlmICghb1NldHRpbmdzW3NGcmFnbWVudE5hbWVdKSB7XG5cdFx0b1NldHRpbmdzW3NGcmFnbWVudE5hbWVdID0ge307XG5cdH1cblxuXHQvLyBGaXJzdCBvZiBhbGwgd2UgbmVlZCB0byB2aXNpdCB0aGUgYXR0cmlidXRlcyB0byByZXNvbHZlIHRoZSBwcm9wZXJ0aWVzIGFuZCB0aGUgbWV0YWRhdGEgY29udGV4dHNcblx0bGV0IHByb3BlcnR5VmFsdWVzID0gYXdhaXQgcHJvY2Vzc1Byb3BlcnRpZXMob01ldGFkYXRhLCBvTm9kZSwgaXNQdWJsaWMsIG9WaXNpdG9yLCBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5hcGlWZXJzaW9uKTtcblxuXHRjb25zdCB7IG1NaXNzaW5nQ29udGV4dCwgcHJvcGVydHlWYWx1ZXM6IGV4dHJhUHJvcGVydHlWYWx1ZXMgfSA9IGF3YWl0IHByb2Nlc3NDb250ZXh0cyhcblx0XHRvTWV0YWRhdGEsXG5cdFx0b1NldHRpbmdzLFxuXHRcdG9Ob2RlLFxuXHRcdGlzUHVibGljLFxuXHRcdG9WaXNpdG9yLFxuXHRcdG1Db250ZXh0cyxcblx0XHRvTWV0YWRhdGFDb250ZXh0c1xuXHQpO1xuXHRwcm9wZXJ0eVZhbHVlcyA9IE9iamVjdC5hc3NpZ24ocHJvcGVydHlWYWx1ZXMsIGV4dHJhUHJvcGVydHlWYWx1ZXMpO1xuXHRjb25zdCBpbml0aWFsS2V5cyA9IE9iamVjdC5rZXlzKHByb3BlcnR5VmFsdWVzKTtcblx0dHJ5IHtcblx0XHQvLyBBZ2dyZWdhdGlvbiBhbmQgY29tcGxleCB0eXBlIHN1cHBvcnRcblx0XHRjb25zdCBvQWdncmVnYXRpb25zID0gYXdhaXQgcHJvY2Vzc0NoaWxkcmVuKFxuXHRcdFx0b05vZGUsXG5cdFx0XHRvVmlzaXRvcixcblx0XHRcdG9NZXRhZGF0YSxcblx0XHRcdGlzUHVibGljLFxuXHRcdFx0cHJvcGVydHlWYWx1ZXMsXG5cdFx0XHRidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5hcGlWZXJzaW9uXG5cdFx0KTtcblx0XHRsZXQgb0luc3RhbmNlOiBhbnk7XG5cdFx0bGV0IG9Db250cm9sQ29uZmlnID0ge307XG5cblx0XHRpZiAob1NldHRpbmdzLm1vZGVscy52aWV3RGF0YSkge1xuXHRcdFx0Ly8gT25seSB1c2VkIGluIHRoZSBGaWVsZCBtYWNybyBhbmQgZXZlbiB0aGVuIG1heWJlIG5vdCByZWFsbHkgdXNlZnVsXG5cdFx0XHRvQ29udHJvbENvbmZpZyA9IG9TZXR0aW5ncy5tb2RlbHMudmlld0RhdGEuZ2V0UHJvcGVydHkoXCIvY29udHJvbENvbmZpZ3VyYXRpb25cIik7XG5cdFx0fVxuXHRcdGxldCBwcm9jZXNzZWRQcm9wZXJ0eVZhbHVlcyA9IHByb3BlcnR5VmFsdWVzO1xuXHRcdGlmIChpc1YxTWFjcm9EZWYoYnVpbGRpbmdCbG9ja0RlZmluaXRpb24pICYmIGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmNyZWF0ZSkge1xuXHRcdFx0cHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXMgPSBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5jcmVhdGUuY2FsbChcblx0XHRcdFx0YnVpbGRpbmdCbG9ja0RlZmluaXRpb24sXG5cdFx0XHRcdHByb3BlcnR5VmFsdWVzLFxuXHRcdFx0XHRvQ29udHJvbENvbmZpZyxcblx0XHRcdFx0b1NldHRpbmdzLFxuXHRcdFx0XHRvQWdncmVnYXRpb25zLFxuXHRcdFx0XHRpc1B1YmxpY1xuXHRcdFx0KTtcblx0XHRcdE9iamVjdC5rZXlzKG9NZXRhZGF0YS5tZXRhZGF0YUNvbnRleHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChzTWV0YWRhdGFOYW1lOiBzdHJpbmcpIHtcblx0XHRcdFx0aWYgKG9NZXRhZGF0YS5tZXRhZGF0YUNvbnRleHRzW3NNZXRhZGF0YU5hbWVdLmNvbXB1dGVkID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0bUNvbnRleHRzW3NNZXRhZGF0YU5hbWVdID0gcHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXNbc01ldGFkYXRhTmFtZV07XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0T2JqZWN0LmtleXMobU1pc3NpbmdDb250ZXh0KS5mb3JFYWNoKGZ1bmN0aW9uIChzQ29udGV4dE5hbWU6IHN0cmluZykge1xuXHRcdFx0XHRpZiAocHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXMuaGFzT3duUHJvcGVydHkoc0NvbnRleHROYW1lKSkge1xuXHRcdFx0XHRcdG1Db250ZXh0c1tzQ29udGV4dE5hbWVdID0gcHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXNbc0NvbnRleHROYW1lXTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIGlmIChidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5hcGlWZXJzaW9uID09PSAyKSB7XG5cdFx0XHRPYmplY3Qua2V5cyhwcm9wZXJ0eVZhbHVlcykuZm9yRWFjaCgocHJvcE5hbWUpID0+IHtcblx0XHRcdFx0Y29uc3Qgb0RhdGEgPSBwcm9wZXJ0eVZhbHVlc1twcm9wTmFtZV07XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRvRGF0YSAmJlxuXHRcdFx0XHRcdG9EYXRhLmlzQSAmJlxuXHRcdFx0XHRcdG9EYXRhLmlzQShTQVBfVUlfTU9ERUxfQ09OVEVYVCkgJiZcblx0XHRcdFx0XHQhb0RhdGEuZ2V0TW9kZWwoKS5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFNZXRhTW9kZWxcIilcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0cHJvcGVydHlWYWx1ZXNbcHJvcE5hbWVdID0gb0RhdGEuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgQnVpbGRpbmdCbG9ja0NsYXNzID0gYnVpbGRpbmdCbG9ja0RlZmluaXRpb24gYXMgdHlwZW9mIEJ1aWxkaW5nQmxvY2tCYXNlO1xuXHRcdFx0cHJvcGVydHlWYWx1ZXMuaXNQdWJsaWMgPSBpc1B1YmxpYztcblxuXHRcdFx0b0luc3RhbmNlID0gbmV3IEJ1aWxkaW5nQmxvY2tDbGFzcyhcblx0XHRcdFx0eyAuLi5wcm9wZXJ0eVZhbHVlcywgLi4ub0FnZ3JlZ2F0aW9ucyB9LFxuXHRcdFx0XHRvQ29udHJvbENvbmZpZyxcblx0XHRcdFx0b1NldHRpbmdzXG5cdFx0XHRcdC8qLCBvQ29udHJvbENvbmZpZywgb1NldHRpbmdzLCBvQWdncmVnYXRpb25zLCBpc1B1YmxpYyovXG5cdFx0XHQpO1xuXHRcdFx0cHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXMgPSBvSW5zdGFuY2UuZ2V0UHJvcGVydGllcygpO1xuXHRcdFx0T2JqZWN0LmtleXMob01ldGFkYXRhLm1ldGFkYXRhQ29udGV4dHMpLmZvckVhY2goZnVuY3Rpb24gKHNDb250ZXh0TmFtZTogc3RyaW5nKSB7XG5cdFx0XHRcdGlmIChwcm9jZXNzZWRQcm9wZXJ0eVZhbHVlcy5oYXNPd25Qcm9wZXJ0eShzQ29udGV4dE5hbWUpKSB7XG5cdFx0XHRcdFx0bGV0IHRhcmdldE9iamVjdCA9IHByb2Nlc3NlZFByb3BlcnR5VmFsdWVzW3NDb250ZXh0TmFtZV07XG5cdFx0XHRcdFx0aWYgKHR5cGVvZiB0YXJnZXRPYmplY3QgPT09IFwib2JqZWN0XCIgJiYgIXRhcmdldE9iamVjdC5nZXRPYmplY3QpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHNBdHRyaWJ1dGVWYWx1ZSA9IHN0b3JlVmFsdWUodGFyZ2V0T2JqZWN0KTtcblx0XHRcdFx0XHRcdGNvbnN0IHNDb250ZXh0UGF0aCA9IGAke3NBdHRyaWJ1dGVWYWx1ZX1gO1xuXHRcdFx0XHRcdFx0b1NldHRpbmdzLm1vZGVscy5jb252ZXJ0ZXJDb250ZXh0LnNldFByb3BlcnR5KHNDb250ZXh0UGF0aCwgdGFyZ2V0T2JqZWN0KTtcblx0XHRcdFx0XHRcdHRhcmdldE9iamVjdCA9IG9TZXR0aW5ncy5tb2RlbHMuY29udmVydGVyQ29udGV4dC5jcmVhdGVCaW5kaW5nQ29udGV4dChzQ29udGV4dFBhdGgpO1xuXHRcdFx0XHRcdFx0ZGVsZXRlIG15U3RvcmVbc0F0dHJpYnV0ZVZhbHVlXTtcblx0XHRcdFx0XHRcdG1Db250ZXh0c1tzQ29udGV4dE5hbWVdID0gdGFyZ2V0T2JqZWN0O1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIW1Db250ZXh0cy5oYXNPd25Qcm9wZXJ0eShzQ29udGV4dE5hbWUpICYmIHRhcmdldE9iamVjdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRtQ29udGV4dHNbc0NvbnRleHROYW1lXSA9IHRhcmdldE9iamVjdDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRjb25zdCBvQXR0cmlidXRlc01vZGVsOiBKU09OTW9kZWwgPSBuZXcgQXR0cmlidXRlTW9kZWwob05vZGUsIHByb2Nlc3NlZFByb3BlcnR5VmFsdWVzLCBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbik7XG5cdFx0bUNvbnRleHRzW3NOYW1lXSA9IG9BdHRyaWJ1dGVzTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpO1xuXHRcdGxldCBvUHJldmlvdXNNYWNyb0luZm86IGFueTtcblxuXHRcdC8vIEtlZXAgdHJhY2tcblx0XHRpZiAoVHJhY2VJbmZvLmlzVHJhY2VJbmZvQWN0aXZlKCkpIHtcblx0XHRcdGNvbnN0IG9UcmFjZUluZm8gPSBUcmFjZUluZm8udHJhY2VNYWNyb0NhbGxzKHNGcmFnbWVudE5hbWUsIG9NZXRhZGF0YSwgbUNvbnRleHRzLCBvTm9kZSwgb1Zpc2l0b3IpO1xuXHRcdFx0aWYgKG9UcmFjZUluZm8pIHtcblx0XHRcdFx0b1ByZXZpb3VzTWFjcm9JbmZvID0gb1NldHRpbmdzW1wiX21hY3JvSW5mb1wiXTtcblx0XHRcdFx0b1NldHRpbmdzW1wiX21hY3JvSW5mb1wiXSA9IG9UcmFjZUluZm8ubWFjcm9JbmZvO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR2YWxpZGF0ZU1hY3JvU2lnbmF0dXJlKHNGcmFnbWVudE5hbWUsIG9NZXRhZGF0YSwgbUNvbnRleHRzLCBvTm9kZSk7XG5cblx0XHRjb25zdCBvQ29udGV4dFZpc2l0b3IgPSBvVmlzaXRvci53aXRoKFxuXHRcdFx0bUNvbnRleHRzLFxuXHRcdFx0YnVpbGRpbmdCbG9ja0RlZmluaXRpb24uaXNPcGVuICE9PSB1bmRlZmluZWQgPyAhYnVpbGRpbmdCbG9ja0RlZmluaXRpb24uaXNPcGVuIDogdHJ1ZVxuXHRcdCk7XG5cdFx0Y29uc3Qgb1BhcmVudCA9IG9Ob2RlLnBhcmVudE5vZGU7XG5cblx0XHRsZXQgaUNoaWxkSW5kZXg6IG51bWJlcjtcblx0XHRsZXQgb1Byb21pc2U7XG5cdFx0bGV0IHByb2Nlc3NDdXN0b21EYXRhID0gdHJ1ZTtcblx0XHRpZiAob1BhcmVudCkge1xuXHRcdFx0aUNoaWxkSW5kZXggPSBBcnJheS5mcm9tKG9QYXJlbnQuY2hpbGRyZW4pLmluZGV4T2Yob05vZGUpO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHQoaXNWMU1hY3JvRGVmKGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uKSAmJiBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5nZXRUZW1wbGF0ZSkgfHxcblx0XHRcdFx0KGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmFwaVZlcnNpb24gPT09IDIgJiYgIWJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmZyYWdtZW50KVxuXHRcdFx0KSB7XG5cdFx0XHRcdGxldCBvVGVtcGxhdGU7XG5cdFx0XHRcdGxldCBhZGREZWZhdWx0TmFtZXNwYWNlID0gZmFsc2U7XG5cdFx0XHRcdGlmIChidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5hcGlWZXJzaW9uID09PSAyKSB7XG5cdFx0XHRcdFx0b1RlbXBsYXRlID0gb0luc3RhbmNlLmdldFRlbXBsYXRlKCk7XG5cdFx0XHRcdFx0aWYgKGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmlzUnVudGltZSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdFx0Zm9yIChjb25zdCBteVN0b3JlS2V5IGluIG15U3RvcmUpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb0RhdGEgPSBteVN0b3JlW215U3RvcmVLZXldO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzQ29udGV4dFBhdGggPSBgJHtteVN0b3JlS2V5fWA7XG5cdFx0XHRcdFx0XHRcdG9TZXR0aW5ncy5tb2RlbHMuY29udmVydGVyQ29udGV4dC5zZXRQcm9wZXJ0eShzQ29udGV4dFBhdGgsIG9EYXRhKTtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIG15U3RvcmVbbXlTdG9yZUtleV07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGFkZERlZmF1bHROYW1lc3BhY2UgPSB0cnVlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmdldFRlbXBsYXRlKSB7XG5cdFx0XHRcdFx0b1RlbXBsYXRlID0gYnVpbGRpbmdCbG9ja0RlZmluaXRpb24uZ2V0VGVtcGxhdGUocHJvY2Vzc2VkUHJvcGVydHlWYWx1ZXMpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bGV0IGhhc0Vycm9yID0gXCJcIjtcblx0XHRcdFx0aWYgKG9UZW1wbGF0ZSkge1xuXHRcdFx0XHRcdGlmICghb1RlbXBsYXRlLmZpcnN0RWxlbWVudENoaWxkKSB7XG5cdFx0XHRcdFx0XHRvVGVtcGxhdGUgPSBwYXJzZVhNTFN0cmluZyhvVGVtcGxhdGUsIGFkZERlZmF1bHROYW1lc3BhY2UpO1xuXHRcdFx0XHRcdFx0Ly8gRm9yIHNhZmV0eSBwdXJwb3NlIHdlIHRyeSB0byBkZXRlY3QgdHJhaWxpbmcgdGV4dCBpbiBiZXR3ZWVuIFhNTCBUYWdzXG5cdFx0XHRcdFx0XHRjb25zdCBpdGVyID0gZG9jdW1lbnQuY3JlYXRlTm9kZUl0ZXJhdG9yKG9UZW1wbGF0ZSwgTm9kZUZpbHRlci5TSE9XX1RFWFQpO1xuXHRcdFx0XHRcdFx0bGV0IHRleHRub2RlID0gaXRlci5uZXh0Tm9kZSgpO1xuXHRcdFx0XHRcdFx0d2hpbGUgKHRleHRub2RlKSB7XG5cdFx0XHRcdFx0XHRcdGlmICh0ZXh0bm9kZS50ZXh0Q29udGVudCAmJiB0ZXh0bm9kZS50ZXh0Q29udGVudC50cmltKCkubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRcdGhhc0Vycm9yID0gdGV4dG5vZGUudGV4dENvbnRlbnQ7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0dGV4dG5vZGUgPSBpdGVyLm5leHROb2RlKCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKG9UZW1wbGF0ZS5sb2NhbE5hbWUgPT09IFwicGFyc2VyZXJyb3JcIikge1xuXHRcdFx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgYSBwYXJzZWVycm9yIHdoaWxlIHByb2Nlc3NpbmcgdGhlIFhNTCBpdCBtZWFucyB0aGUgWE1MIGl0c2VsZiBpcyBtYWxmb3JtZWQsIGFzIHN1Y2ggd2UgcmVydW4gdGhlIHRlbXBsYXRlIHByb2Nlc3Ncblx0XHRcdFx0XHRcdC8vIFNldHRpbmcgaXNUcmFjZU1vZGUgdHJ1ZSB3aWxsIG1ha2UgaXQgc28gdGhhdCBlYWNoIHhtbGAgZXhwcmVzc2lvbiBpcyBjaGVja2VkIGZvciB2YWxpZGl0eSBmcm9tIFhNTCBwZXJzcGVjdGl2ZVxuXHRcdFx0XHRcdFx0Ly8gSWYgYW4gZXJyb3IgaXMgZm91bmQgaXQncyByZXR1cm5lZCBpbnN0ZWFkIG9mIHRoZSBub3JtYWwgZnJhZ21lbnRcblx0XHRcdFx0XHRcdExvZy5lcnJvcihgRXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBidWlsZGluZyBibG9jayAke2J1aWxkaW5nQmxvY2tEZWZpbml0aW9uLm5hbWV9YCk7XG5cdFx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0XHRpc1RyYWNlTW9kZSA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdG9UZW1wbGF0ZSA9IG9JbnN0YW5jZT8uZ2V0VGVtcGxhdGVcblx0XHRcdFx0XHRcdFx0XHQ/IG9JbnN0YW5jZS5nZXRUZW1wbGF0ZSgpXG5cdFx0XHRcdFx0XHRcdFx0OiAoYnVpbGRpbmdCbG9ja0RlZmluaXRpb24gYXMgYW55KS5nZXRUZW1wbGF0ZShwcm9jZXNzZWRQcm9wZXJ0eVZhbHVlcyk7XG5cdFx0XHRcdFx0XHRcdG9UZW1wbGF0ZSA9IHBhcnNlWE1MU3RyaW5nKG9UZW1wbGF0ZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHRcdFx0XHRpc1RyYWNlTW9kZSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAoaGFzRXJyb3IubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0Ly8gSWYgdGhlcmUgaXMgdHJhaWxpbmcgdGV4dCB3ZSBjcmVhdGUgYSBzdGFuZGFyZCBlcnJvciBhbmQgZGlzcGxheSBpdC5cblx0XHRcdFx0XHRcdExvZy5lcnJvcihgRXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBidWlsZGluZyBibG9jayAke2J1aWxkaW5nQmxvY2tEZWZpbml0aW9uLm5hbWV9YCk7XG5cdFx0XHRcdFx0XHRjb25zdCBvRXJyb3JUZXh0ID0gY3JlYXRlRXJyb3JYTUwoXG5cdFx0XHRcdFx0XHRcdFtcblx0XHRcdFx0XHRcdFx0XHRgRXJyb3Igd2hpbGUgcHJvY2Vzc2luZyBidWlsZGluZyBibG9jayAke2J1aWxkaW5nQmxvY2tEZWZpbml0aW9uLm5hbWV9YCxcblx0XHRcdFx0XHRcdFx0XHRgVHJhaWxpbmcgdGV4dCB3YXMgZm91bmQgaW4gdGhlIFhNTDogJHtoYXNFcnJvcn1gXG5cdFx0XHRcdFx0XHRcdF0sXG5cdFx0XHRcdFx0XHRcdG9UZW1wbGF0ZS5vdXRlckhUTUxcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRvVGVtcGxhdGUgPSBwYXJzZVhNTFN0cmluZyhvRXJyb3JUZXh0LCB0cnVlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0b05vZGUucmVwbGFjZVdpdGgob1RlbXBsYXRlKTtcblx0XHRcdFx0XHRvTm9kZSA9IG9QYXJlbnQuY2hpbGRyZW5baUNoaWxkSW5kZXhdO1xuXHRcdFx0XHRcdHByb2Nlc3NTbG90cyhvQWdncmVnYXRpb25zLCBvTWV0YWRhdGEuYWdncmVnYXRpb25zLCBvTm9kZSwgcHJvY2Vzc0N1c3RvbURhdGEpO1xuXHRcdFx0XHRcdHByb2Nlc3NDdXN0b21EYXRhID0gZmFsc2U7XG5cdFx0XHRcdFx0b1Byb21pc2UgPSBvQ29udGV4dFZpc2l0b3IudmlzaXROb2RlKG9Ob2RlKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRvTm9kZS5yZW1vdmUoKTtcblx0XHRcdFx0XHRvUHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvUHJvbWlzZSA9IG9Db250ZXh0VmlzaXRvci5pbnNlcnRGcmFnbWVudChzRnJhZ21lbnROYW1lLCBvTm9kZSk7XG5cdFx0XHR9XG5cblx0XHRcdGF3YWl0IG9Qcm9taXNlO1xuXHRcdFx0Y29uc3Qgb01hY3JvRWxlbWVudCA9IG9QYXJlbnQuY2hpbGRyZW5baUNoaWxkSW5kZXhdO1xuXHRcdFx0cHJvY2Vzc1Nsb3RzKG9BZ2dyZWdhdGlvbnMsIG9NZXRhZGF0YS5hZ2dyZWdhdGlvbnMsIG9NYWNyb0VsZW1lbnQsIHByb2Nlc3NDdXN0b21EYXRhKTtcblx0XHRcdGlmIChvTWFjcm9FbGVtZW50ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Y29uc3Qgb1JlbWFpbmluZ1Nsb3RzID0gb01hY3JvRWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKFwic2xvdFwiKTtcblx0XHRcdFx0b1JlbWFpbmluZ1Nsb3RzLmZvckVhY2goZnVuY3Rpb24gKG9TbG90RWxlbWVudDogYW55KSB7XG5cdFx0XHRcdFx0b1Nsb3RFbGVtZW50LnJlbW92ZSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG9QcmV2aW91c01hY3JvSW5mbykge1xuXHRcdFx0Ly9yZXN0b3JlIG1hY3JvIGluZm8gaWYgYXZhaWxhYmxlXG5cdFx0XHRvU2V0dGluZ3NbXCJfbWFjcm9JbmZvXCJdID0gb1ByZXZpb3VzTWFjcm9JbmZvO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRkZWxldGUgb1NldHRpbmdzW1wiX21hY3JvSW5mb1wiXTtcblx0XHR9XG5cdH0gY2F0Y2ggKGUpIHtcblx0XHQvLyBJbiBjYXNlIHRoZXJlIGlzIGEgZ2VuZXJpYyBlcnJvciAodXN1YWxseSBjb2RlIGVycm9yKSwgd2UgcmV0cmlldmUgdGhlIGN1cnJlbnQgY29udGV4dCBpbmZvcm1hdGlvbiBhbmQgY3JlYXRlIGEgZGVkaWNhdGVkIGVycm9yIG1lc3NhZ2Vcblx0XHRjb25zdCB0cmFjZURldGFpbHMgPSB7XG5cdFx0XHRpbml0aWFsUHJvcGVydGllczoge30gYXMgYW55LFxuXHRcdFx0cmVzb2x2ZWRQcm9wZXJ0aWVzOiB7fSBhcyBhbnksXG5cdFx0XHRtaXNzaW5nQ29udGV4dHM6IG1NaXNzaW5nQ29udGV4dFxuXHRcdH07XG5cdFx0Zm9yIChjb25zdCBwcm9wZXJ0eU5hbWUgb2YgaW5pdGlhbEtleXMpIHtcblx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0eVZhbHVlc1twcm9wZXJ0eU5hbWVdO1xuXHRcdFx0aWYgKHByb3BlcnR5VmFsdWUgJiYgcHJvcGVydHlWYWx1ZS5pc0EgJiYgcHJvcGVydHlWYWx1ZS5pc0EoU0FQX1VJX01PREVMX0NPTlRFWFQpKSB7XG5cdFx0XHRcdHRyYWNlRGV0YWlscy5pbml0aWFsUHJvcGVydGllc1twcm9wZXJ0eU5hbWVdID0ge1xuXHRcdFx0XHRcdHBhdGg6IHByb3BlcnR5VmFsdWUuZ2V0UGF0aCgpLFxuXHRcdFx0XHRcdHZhbHVlOiBwcm9wZXJ0eVZhbHVlLmdldE9iamVjdCgpXG5cdFx0XHRcdH07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0cmFjZURldGFpbHMuaW5pdGlhbFByb3BlcnRpZXNbcHJvcGVydHlOYW1lXSA9IHByb3BlcnR5VmFsdWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAoY29uc3QgcHJvcGVydHlOYW1lIGluIHByb3BlcnR5VmFsdWVzKSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eVZhbHVlID0gcHJvcGVydHlWYWx1ZXNbcHJvcGVydHlOYW1lXTtcblx0XHRcdGlmICghaW5pdGlhbEtleXMuaW5jbHVkZXMocHJvcGVydHlOYW1lKSkge1xuXHRcdFx0XHRpZiAocHJvcGVydHlWYWx1ZSAmJiBwcm9wZXJ0eVZhbHVlLmlzQSAmJiBwcm9wZXJ0eVZhbHVlLmlzQShTQVBfVUlfTU9ERUxfQ09OVEVYVCkpIHtcblx0XHRcdFx0XHR0cmFjZURldGFpbHMucmVzb2x2ZWRQcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSB7XG5cdFx0XHRcdFx0XHRwYXRoOiBwcm9wZXJ0eVZhbHVlLmdldFBhdGgoKSxcblx0XHRcdFx0XHRcdHZhbHVlOiBwcm9wZXJ0eVZhbHVlLmdldE9iamVjdCgpXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0cmFjZURldGFpbHMucmVzb2x2ZWRQcm9wZXJ0aWVzW3Byb3BlcnR5TmFtZV0gPSBwcm9wZXJ0eVZhbHVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IGVycm9yQW55ID0gZSBhcyBhbnk7XG5cdFx0TG9nLmVycm9yKGVycm9yQW55LCBlcnJvckFueSk7XG5cdFx0Y29uc3Qgb0Vycm9yID0gY3JlYXRlRXJyb3JYTUwoXG5cdFx0XHRbYEVycm9yIHdoaWxlIHByb2Nlc3NpbmcgYnVpbGRpbmcgYmxvY2sgJHtidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5uYW1lfWBdLFxuXHRcdFx0b05vZGUub3V0ZXJIVE1MLFxuXHRcdFx0dHJhY2VEZXRhaWxzLFxuXHRcdFx0ZXJyb3JBbnkuc3RhY2tcblx0XHQpO1xuXHRcdGNvbnN0IG9UZW1wbGF0ZSA9IHBhcnNlWE1MU3RyaW5nKG9FcnJvciwgdHJ1ZSk7XG5cdFx0b05vZGUucmVwbGFjZVdpdGgob1RlbXBsYXRlIGFzIGFueSk7XG5cdH1cbn1cbmZ1bmN0aW9uIGFkZFNpbmdsZUNvbnRleHQobUNvbnRleHRzOiBhbnksIG9WaXNpdG9yOiBhbnksIG9DdHg6IGFueSwgb01ldGFkYXRhQ29udGV4dHM6IGFueSkge1xuXHRjb25zdCBzS2V5ID0gb0N0eC5uYW1lIHx8IG9DdHgubW9kZWwgfHwgdW5kZWZpbmVkO1xuXG5cdGlmIChvTWV0YWRhdGFDb250ZXh0c1tzS2V5XSkge1xuXHRcdHJldHVybjsgLy8gZG8gbm90IGFkZCB0d2ljZVxuXHR9XG5cdHRyeSB7XG5cdFx0bGV0IHNDb250ZXh0UGF0aCA9IG9DdHgucGF0aDtcblx0XHRpZiAob0N0eC5tb2RlbCAhPSBudWxsKSB7XG5cdFx0XHRzQ29udGV4dFBhdGggPSBgJHtvQ3R4Lm1vZGVsfT4ke3NDb250ZXh0UGF0aH1gO1xuXHRcdH1cblx0XHRjb25zdCBtU2V0dGluZyA9IG9WaXNpdG9yLmdldFNldHRpbmdzKCk7XG5cdFx0aWYgKG9DdHgubW9kZWwgPT09IFwiY29udmVydGVyQ29udGV4dFwiICYmIG9DdHgucGF0aC5sZW5ndGggPiAwKSB7XG5cdFx0XHRtQ29udGV4dHNbc0tleV0gPSBtU2V0dGluZy5tb2RlbHNbb0N0eC5tb2RlbF0uZ2V0Q29udGV4dChvQ3R4LnBhdGgsIG1TZXR0aW5nLmJpbmRpbmdDb250ZXh0c1tvQ3R4Lm1vZGVsXSk7IC8vIGFkZCB0aGUgY29udGV4dCB0byB0aGUgdmlzaXRvclxuXHRcdH0gZWxzZSBpZiAoIW1TZXR0aW5nLmJpbmRpbmdDb250ZXh0c1tvQ3R4Lm1vZGVsXSAmJiBtU2V0dGluZy5tb2RlbHNbb0N0eC5tb2RlbF0pIHtcblx0XHRcdG1Db250ZXh0c1tzS2V5XSA9IG1TZXR0aW5nLm1vZGVsc1tvQ3R4Lm1vZGVsXS5nZXRDb250ZXh0KG9DdHgucGF0aCk7IC8vIGFkZCB0aGUgY29udGV4dCB0byB0aGUgdmlzaXRvclxuXHRcdH0gZWxzZSB7XG5cdFx0XHRtQ29udGV4dHNbc0tleV0gPSBvVmlzaXRvci5nZXRDb250ZXh0KHNDb250ZXh0UGF0aCk7IC8vIGFkZCB0aGUgY29udGV4dCB0byB0aGUgdmlzaXRvclxuXHRcdH1cblxuXHRcdG9NZXRhZGF0YUNvbnRleHRzW3NLZXldID0gbUNvbnRleHRzW3NLZXldOyAvLyBtYWtlIGl0IGF2YWlsYWJsZSBpbnNpZGUgbWV0YWRhdGFDb250ZXh0cyBKU09OIG9iamVjdFxuXHR9IGNhdGNoIChleCkge1xuXHRcdC8vY29uc29sZS5lcnJvcihleCk7XG5cdFx0Ly8gaWdub3JlIHRoZSBjb250ZXh0IGFzIHRoaXMgY2FuIG9ubHkgYmUgdGhlIGNhc2UgaWYgdGhlIG1vZGVsIGlzIG5vdCByZWFkeSwgaS5lLiBub3QgYSBwcmVwcm9jZXNzaW5nIG1vZGVsIGJ1dCBtYXliZSBhIG1vZGVsIGZvclxuXHRcdC8vIHByb3ZpZGluZyBhZnRlcndhcmRzXG5cdFx0Ly8gVE9ETyAwMDAyIG5vdCB5ZXQgaW1wbGVtZW50ZWRcblx0XHQvL21Db250ZXh0c1tcIl8kZXJyb3JcIl0ub01vZGVsLnNldFByb3BlcnR5KFwiL1wiICsgc0tleSwgZXgpO1xuXHR9XG59XG5cbi8qKlxuICogUmVnaXN0ZXIgYSBidWlsZGluZyBibG9jayBkZWZpbml0aW9uIHRvIGJlIHVzZWQgaW5zaWRlIHRoZSB4bWwgdGVtcGxhdGUgcHJvY2Vzc29yLlxuICpcbiAqIEBwYXJhbSBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbiBUaGUgYnVpbGRpbmcgYmxvY2sgZGVmaW5pdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVnaXN0ZXJCdWlsZGluZ0Jsb2NrKGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uOiBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbik6IHZvaWQge1xuXHRYTUxQcmVwcm9jZXNzb3IucGx1Z0luKFxuXHRcdChvTm9kZTogRWxlbWVudCwgb1Zpc2l0b3I6IElDYWxsYmFjaykgPT4gcHJvY2Vzc0J1aWxkaW5nQmxvY2soYnVpbGRpbmdCbG9ja0RlZmluaXRpb24sIG9Ob2RlLCBvVmlzaXRvciksXG5cdFx0YnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubmFtZXNwYWNlLFxuXHRcdGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLnhtbFRhZyB8fCBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5uYW1lXG5cdCk7XG5cdGlmIChidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5wdWJsaWNOYW1lc3BhY2UpIHtcblx0XHRYTUxQcmVwcm9jZXNzb3IucGx1Z0luKFxuXHRcdFx0KG9Ob2RlOiBFbGVtZW50LCBvVmlzaXRvcjogSUNhbGxiYWNrKSA9PiBwcm9jZXNzQnVpbGRpbmdCbG9jayhidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbiwgb05vZGUsIG9WaXNpdG9yLCB0cnVlKSxcblx0XHRcdGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLnB1YmxpY05hbWVzcGFjZSxcblx0XHRcdGJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uLnhtbFRhZyB8fCBidWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5uYW1lXG5cdFx0KTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVFcnJvclhNTChlcnJvck1lc3NhZ2VzOiBzdHJpbmdbXSwgeG1sRnJhZ21lbnQ6IHN0cmluZywgYWRkaXRpb25hbERhdGE/OiBvYmplY3QsIHN0YWNrPzogc3RyaW5nKTogc3RyaW5nIHtcblx0Y29uc3QgZXJyb3JMYWJlbHMgPSBlcnJvck1lc3NhZ2VzLm1hcCgoZXJyb3JNZXNzYWdlKSA9PiB4bWxgPG06TGFiZWwgdGV4dD1cIiR7ZXNjYXBlWE1MQXR0cmlidXRlVmFsdWUoZXJyb3JNZXNzYWdlKX1cIi8+YCk7XG5cdGxldCBlcnJvclN0YWNrID0gXCJcIjtcblx0aWYgKHN0YWNrKSB7XG5cdFx0Y29uc3Qgc3RhY2tGb3JtYXR0ZWQgPSBidG9hKGA8cHJlPiR7c3RhY2t9PC9wcmU+YCk7XG5cdFx0ZXJyb3JTdGFjayA9IHhtbGA8bTpGb3JtYXR0ZWRUZXh0IGh0bWxUZXh0PVwiJHtgez0gQkJGLmJhc2U2NERlY29kZSgnJHtzdGFja0Zvcm1hdHRlZH0nKSB9YH1cIiAvPmA7XG5cdH1cblx0bGV0IGFkZGl0aW9uYWxUZXh0ID0gXCJcIjtcblx0aWYgKGFkZGl0aW9uYWxEYXRhKSB7XG5cdFx0YWRkaXRpb25hbFRleHQgPSB4bWxgPG06VkJveD5cblx0XHRcdFx0XHRcdDxtOkxhYmVsIHRleHQ9XCJUcmFjZSBJbmZvXCIvPlxuXHRcdFx0XHRcdFx0PGNvZGU6Q29kZUVkaXRvciB0eXBlPVwianNvblwiICB2YWx1ZT1cIiR7YHs9IEJCRi5iYXNlNjREZWNvZGUoJyR7YnRvYShKU09OLnN0cmluZ2lmeShhZGRpdGlvbmFsRGF0YSwgbnVsbCwgNCkpfScpIH1gfVwiIGhlaWdodD1cIjMwMHB4XCIgLz5cblx0XHRcdFx0XHQ8L206VkJveD5gO1xuXHR9XG5cdHJldHVybiB4bWxgPG06VkJveCB4bWxuczptPVwic2FwLm1cIiB4bWxuczpjb2RlPVwic2FwLnVpLmNvZGVlZGl0b3JcIiBjb3JlOnJlcXVpcmU9XCJ7QkJGOidzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrRm9ybWF0dGVyJ31cIj5cblx0XHRcdFx0JHtlcnJvckxhYmVsc31cblx0XHRcdFx0JHtlcnJvclN0YWNrfVxuXHRcdFx0XHQ8Z3JpZDpDU1NHcmlkIGdyaWRUZW1wbGF0ZVJvd3M9XCJmclwiIGdyaWRUZW1wbGF0ZUNvbHVtbnM9XCJyZXBlYXQoMiwxZnIpXCIgZ3JpZEdhcD1cIjFyZW1cIiB4bWxuczpncmlkPVwic2FwLnVpLmxheW91dC5jc3NncmlkXCIgPlxuXHRcdFx0XHRcdDxtOlZCb3g+XG5cdFx0XHRcdFx0XHQ8bTpMYWJlbCB0ZXh0PVwiSG93IHRoZSBidWlsZGluZyBibG9jayB3YXMgY2FsbGVkXCIvPlxuXHRcdFx0XHRcdFx0PGNvZGU6Q29kZUVkaXRvciB0eXBlPVwieG1sXCIgdmFsdWU9XCIke2B7PSBCQkYuYmFzZTY0RGVjb2RlKCcke2J0b2EoeG1sRnJhZ21lbnQucmVwbGFjZUFsbChcIiZndDtcIiwgXCI+XCIpKX0nKSB9YH1cIiBoZWlnaHQ9XCIzMDBweFwiIC8+XG5cdFx0XHRcdFx0PC9tOlZCb3g+XG5cdFx0XHRcdFx0JHthZGRpdGlvbmFsVGV4dH1cblx0XHRcdFx0PC9ncmlkOkNTU0dyaWQ+XG5cdFx0XHQ8L206VkJveD5gO1xufVxuXG5jb25zdCBteVN0b3JlOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5mdW5jdGlvbiBzdG9yZVZhbHVlKHZhbHVlczogYW55KSB7XG5cdGNvbnN0IHByb3BlcnR5VUlEID0gYC91aWQtLSR7dWlkKCl9YDtcblx0bXlTdG9yZVtwcm9wZXJ0eVVJRF0gPSB2YWx1ZXM7XG5cdHJldHVybiBwcm9wZXJ0eVVJRDtcbn1cblxuLyoqXG4gKiBQYXJzZSBhbiBYTUwgc3RyaW5nIGFuZCByZXR1cm4gdGhlIGFzc29jaWF0ZWQgZG9jdW1lbnQuXG4gKlxuICogQHBhcmFtIHhtbFN0cmluZyBUaGUgeG1sIHN0cmluZ1xuICogQHBhcmFtIGFkZERlZmF1bHROYW1lc3BhY2VzIFdoZXRoZXIgb3Igbm90IHdlIHNob3VsZCBhZGQgZGVmYXVsdCBuYW1lc3BhY2VcbiAqIEByZXR1cm5zIFRoZSBYTUwgZG9jdW1lbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZVhNTFN0cmluZyh4bWxTdHJpbmc6IHN0cmluZywgYWRkRGVmYXVsdE5hbWVzcGFjZXMgPSBmYWxzZSk6IEVsZW1lbnQge1xuXHRpZiAoYWRkRGVmYXVsdE5hbWVzcGFjZXMpIHtcblx0XHR4bWxTdHJpbmcgPSBgPHRlbXBsYXRlXG5cdFx0XHRcdFx0XHR4bWxuczp0ZW1wbGF0ZT1cImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS50ZW1wbGF0ZS8xXCJcblx0XHRcdFx0XHRcdHhtbG5zOm09XCJzYXAubVwiXG5cdFx0XHRcdFx0XHR4bWxuczptYWNyb3M9XCJzYXAuZmUubWFjcm9zXCJcblx0XHRcdFx0XHRcdHhtbG5zOmNvcmU9XCJzYXAudWkuY29yZVwiXG5cdFx0XHRcdFx0XHR4bWxuczptZGM9XCJzYXAudWkubWRjXCJcblx0XHRcdFx0XHRcdHhtbG5zOmN1c3RvbURhdGE9XCJodHRwOi8vc2NoZW1hcy5zYXAuY29tL3NhcHVpNS9leHRlbnNpb24vc2FwLnVpLmNvcmUuQ3VzdG9tRGF0YS8xXCI+JHt4bWxTdHJpbmd9PC90ZW1wbGF0ZT5gO1xuXHR9XG5cdGNvbnN0IHhtbERvY3VtZW50ID0gRE9NUGFyc2VySW5zdGFuY2UucGFyc2VGcm9tU3RyaW5nKHhtbFN0cmluZywgXCJ0ZXh0L3htbFwiKTtcblx0bGV0IG91dHB1dCA9IHhtbERvY3VtZW50LmZpcnN0RWxlbWVudENoaWxkO1xuXHR3aGlsZSAob3V0cHV0Py5sb2NhbE5hbWUgPT09IFwidGVtcGxhdGVcIikge1xuXHRcdG91dHB1dCA9IG91dHB1dC5maXJzdEVsZW1lbnRDaGlsZDtcblx0fVxuXHRyZXR1cm4gb3V0cHV0IGFzIEVsZW1lbnQ7XG59XG5cbi8qKlxuICogRXNjYXBlIGFuIFhNTCBhdHRyaWJ1dGUgdmFsdWUuXG4gKlxuICogQHBhcmFtIHZhbHVlIFRoZSBhdHRyaWJ1dGUgdmFsdWUgdG8gZXNjYXBlLlxuICogQHJldHVybnMgVGhlIGVzY2FwZWQgc3RyaW5nLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXNjYXBlWE1MQXR0cmlidXRlVmFsdWUodmFsdWU/OiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRyZXR1cm4gdmFsdWU/LnJlcGxhY2UoLyYvZywgXCImYW1wO1wiKS5yZXBsYWNlKC88L2csIFwiJmx0O1wiKS5yZXBsYWNlKC9cIi9nLCBcIiZxdW90O1wiKS5yZXBsYWNlKC8nL2csIFwiJmFwb3M7XCIpO1xufVxuXG5mdW5jdGlvbiByZW5kZXJJblRyYWNlTW9kZShvdXRTdHI6IHN0cmluZykge1xuXHRjb25zdCB4bWxSZXN1bHQgPSBwYXJzZVhNTFN0cmluZyhvdXRTdHIsIHRydWUpO1xuXHRpZiAoeG1sUmVzdWx0ICE9PSB1bmRlZmluZWQgJiYgeG1sUmVzdWx0Py5sb2NhbE5hbWUgPT09IFwicGFyc2VyZXJyb3JcIikge1xuXHRcdGNvbnN0IGVycm9yTWVzc2FnZSA9ICh4bWxSZXN1bHQgYXMgYW55KS5pbm5lclRleHQgfHwgKHhtbFJlc3VsdCBhcyBhbnkpLmlubmVySFRNTDtcblx0XHRyZXR1cm4gY3JlYXRlRXJyb3JYTUwoW2Vycm9yTWVzc2FnZS5zcGxpdChcIlxcblwiKVswXV0sIG91dFN0cik7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIG91dFN0cjtcblx0fVxufVxuLyoqXG4gKiBDcmVhdGUgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHRlbXBsYXRlIGxpdGVyYWwgd2hpbGUgaGFuZGxpbmcgc3BlY2lhbCBvYmplY3QgY2FzZS5cbiAqXG4gKiBAcGFyYW0gc3RyaW5ncyBUaGUgc3RyaW5nIHBhcnRzIG9mIHRoZSB0ZW1wbGF0ZSBsaXRlcmFsXG4gKiBAcGFyYW0gdmFsdWVzIFRoZSB2YWx1ZXMgcGFydCBvZiB0aGUgdGVtcGxhdGUgbGl0ZXJhbFxuICogQHJldHVybnMgVGhlIFhNTCBzdHJpbmcgZG9jdW1lbnQgcmVwcmVzZW50aW5nIHRoZSBzdHJpbmcgdGhhdCB3YXMgdXNlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IHhtbCA9IChzdHJpbmdzOiBUZW1wbGF0ZVN0cmluZ3NBcnJheSwgLi4udmFsdWVzOiBhbnlbXSkgPT4ge1xuXHRsZXQgb3V0U3RyID0gXCJcIjtcblx0bGV0IGk7XG5cdGZvciAoaSA9IDA7IGkgPCB2YWx1ZXMubGVuZ3RoOyBpKyspIHtcblx0XHRvdXRTdHIgKz0gc3RyaW5nc1tpXTtcblxuXHRcdC8vIEhhbmRsZSB0aGUgZGlmZmVyZW50IGNhc2Ugb2Ygb2JqZWN0LCBpZiBpdCdzIGFuIGFycmF5IHdlIGpvaW4gdGhlbSwgaWYgaXQncyBhIGJpbmRpbmcgZXhwcmVzc2lvbiAoZGV0ZXJtaW5lZCBieSBfdHlwZSkgdGhlbiB3ZSBjb21waWxlIGl0LlxuXHRcdGNvbnN0IHZhbHVlID0gdmFsdWVzW2ldO1xuXG5cdFx0aWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA+IDAgJiYgdHlwZW9mIHZhbHVlWzBdID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRvdXRTdHIgKz0gdmFsdWUuZmxhdCg1KS5qb2luKFwiXFxuXCIpLnRyaW0oKTtcblx0XHR9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkodmFsdWUpICYmIHZhbHVlLmxlbmd0aCA+IDAgJiYgdHlwZW9mIHZhbHVlWzBdID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdG91dFN0ciArPSB2YWx1ZS5tYXAoKHZhbHVlZm4pID0+IHZhbHVlZm4oKSkuam9pbihcIlxcblwiKTtcblx0XHR9IGVsc2UgaWYgKHZhbHVlPy5fdHlwZSkge1xuXHRcdFx0Y29uc3QgY29tcGlsZWRFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24odmFsdWUpO1xuXHRcdFx0b3V0U3RyICs9IGVzY2FwZVhNTEF0dHJpYnV0ZVZhbHVlKGNvbXBpbGVkRXhwcmVzc2lvbik7XG5cdFx0fSBlbHNlIGlmICh2YWx1ZT8uZ2V0VGVtcGxhdGUpIHtcblx0XHRcdG91dFN0ciArPSB2YWx1ZS5nZXRUZW1wbGF0ZSgpO1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRvdXRTdHIgKz0gXCJ7dGhpcz51bmRlZmluZWRWYWx1ZX1cIjtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJmdW5jdGlvblwiKSB7XG5cdFx0XHRvdXRTdHIgKz0gdmFsdWUoKTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gXCJvYmplY3RcIiAmJiB2YWx1ZSAhPT0gbnVsbCkge1xuXHRcdFx0aWYgKHZhbHVlLmlzQT8uKFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIikpIHtcblx0XHRcdFx0b3V0U3RyICs9IHZhbHVlLmdldFBhdGgoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5VUlkID0gc3RvcmVWYWx1ZSh2YWx1ZSk7XG5cdFx0XHRcdG91dFN0ciArPSBgJHtwcm9wZXJ0eVVJZH1gO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodmFsdWUgJiYgdHlwZW9mIHZhbHVlID09PSBcInN0cmluZ1wiICYmICF2YWx1ZS5zdGFydHNXaXRoKFwiPFwiKSAmJiAhdmFsdWUuc3RhcnRzV2l0aChcIiZsdDtcIikpIHtcblx0XHRcdG91dFN0ciArPSBlc2NhcGVYTUxBdHRyaWJ1dGVWYWx1ZSh2YWx1ZSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG91dFN0ciArPSB2YWx1ZTtcblx0XHR9XG5cdH1cblx0b3V0U3RyICs9IHN0cmluZ3NbaV07XG5cdG91dFN0ciA9IG91dFN0ci50cmltKCk7XG5cdGlmIChpc1RyYWNlTW9kZSkge1xuXHRcdHJldHVybiByZW5kZXJJblRyYWNlTW9kZShvdXRTdHIpO1xuXHR9XG5cdHJldHVybiBvdXRTdHI7XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBd0tPLGdCQUFnQkEsTUFBTSxFQUFFQyxJQUFJLEVBQUVDLEtBQUssRUFBRTtJQUMzQyxJQUFJLE9BQU9GLE1BQU0saUJBQWlCLEtBQUssVUFBVSxFQUFFO01BQ2xELElBQUlHLFFB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