/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["@sap/cds-compiler", "fs", "@prettier/plugin-xml", "path", "prettier", "sap/base/Log", "sap/base/util/merge", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/ConverterContext", "sap/fe/core/services/SideEffectsServiceFactory", "sap/fe/core/TemplateModel", "sap/ui/base/BindingParser", "sap/ui/core/Component", "sap/ui/core/InvisibleText", "sap/ui/core/util/serializer/Serializer", "sap/ui/core/util/XMLPreprocessor", "sap/ui/fl/apply/_internal/flexState/FlexState", "sap/ui/fl/apply/_internal/preprocessors/XmlPreprocessor", "sap/ui/fl/initial/_internal/Storage", "sap/ui/fl/Utils", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/lib/_MetadataRequestor", "sap/ui/model/odata/v4/ODataMetaModel", "xpath"], function (compiler, fs, plugin, path, prettier, Log, merge, BuildingBlockRuntime, ConverterContext, SideEffectsFactory, TemplateModel, BindingParser, Component, InvisibleText, Serializer, XMLPreprocessor, FlexState, XmlPreprocessor, AppStorage, Utils, JSONModel, _MetadataRequestor, ODataMetaModel, xpath) {
  "use strict";

  var _exports = {};
  var registerBuildingBlock = BuildingBlockRuntime.registerBuildingBlock;
  var format = prettier.format;
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  /**
   * Process the requested XML fragment with the provided data.
   *
   * @param name Fully qualified name of the fragment to be tested.
   * @param testData Test data consisting
   * @returns Templated fragment as string
   */
  var processFragment = function (name, testData) {
    try {
      var inputXml = "<root><core:Fragment fragmentName=\"".concat(name, "\" type=\"XML\" xmlns:core=\"sap.ui.core\" /></root>");
      var parser = new window.DOMParser();
      var inputDoc = parser.parseFromString(inputXml, "text/xml");

      // build model and bindings for given test data
      var settings = {
        models: {},
        bindingContexts: {}
      };
      for (var _model2 in testData) {
        var jsonModel = new JSONModel();
        jsonModel.setData(testData[_model2]);
        settings.models[_model2] = jsonModel;
        settings.bindingContexts[_model2] = settings.models[_model2].createBindingContext("/");
      }

      // execute the pre-processor
      return Promise.resolve(XMLPreprocessor.process(inputDoc.firstElementChild, {
        name: name
      }, settings)).then(function (resultDoc) {
        // exclude nested fragments from test snapshots
        var fragments = resultDoc.getElementsByTagName("core:Fragment");
        if ((fragments === null || fragments === void 0 ? void 0 : fragments.length) > 0) {
          var _iterator = _createForOfIteratorHelper(fragments),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var fragment = _step.value;
              fragment.innerHTML = "";
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
        }

        // Keep the fragment result as child of root node when fragment generates multiple root controls
        var xmlResult = resultDoc.children.length > 1 ? resultDoc.outerHTML : resultDoc.innerHTML;
        return formatXml(xmlResult, {
          filter: function (node) {
            return node.type !== "Comment";
          }
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  _exports.processFragment = processFragment;
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  var formatXml = require("xml-formatter");
  Log.setLevel(1, "sap.ui.core.util.XMLPreprocessor");
  jest.setTimeout(40000);
  var nameSpaceMap = {
    "macros": "sap.fe.macros",
    "macro": "sap.fe.macros",
    "macroField": "sap.fe.macros.field",
    "macrodata": "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1",
    "log": "http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1",
    "unittest": "http://schemas.sap.com/sapui5/preprocessorextension/sap.fe.unittesting/1",
    "control": "sap.fe.core.controls",
    "core": "sap.ui.core",
    "m": "sap.m",
    "f": "sap.ui.layout.form",
    "internalMacro": "sap.fe.macros.internal",
    "mdc": "sap.ui.mdc",
    "mdcat": "sap.ui.mdc.actiontoolbar",
    "mdcField": "sap.ui.mdc.field",
    "mdcTable": "sap.ui.mdc.table",
    "u": "sap.ui.unified",
    "macroMicroChart": "sap.fe.macros.microchart",
    "microChart": "sap.suite.ui.microchart",
    "macroTable": "sap.fe.macros.table"
  };
  var select = xpath.useNamespaces(nameSpaceMap);
  var registerMacro = function (macroMetadata) {
    registerBuildingBlock(macroMetadata);
  };
  _exports.registerMacro = registerMacro;
  var unregisterMacro = function (macroMetadata) {
    XMLPreprocessor.plugIn(null, macroMetadata.namespace, macroMetadata.name);
    if (macroMetadata.publicNamespace) {
      XMLPreprocessor.plugIn(null, macroMetadata.publicNamespace, macroMetadata.name);
    }
  };
  _exports.unregisterMacro = unregisterMacro;
  var runXPathQuery = function (selector, xmldom) {
    return select(selector, xmldom);
  };
  expect.extend({
    toHaveControl: function (xmldom, selector) {
      var nodes = runXPathQuery("/root".concat(selector), xmldom);
      return {
        message: function () {
          var outputXml = serializeXML(xmldom);
          return "did not find controls matching ".concat(selector, " in generated xml:\n ").concat(outputXml);
        },
        pass: nodes && nodes.length >= 1
      };
    },
    toNotHaveControl: function (xmldom, selector) {
      var nodes = runXPathQuery("/root".concat(selector), xmldom);
      return {
        message: function () {
          var outputXml = serializeXML(xmldom);
          return "There is a control matching ".concat(selector, " in generated xml:\n ").concat(outputXml);
        },
        pass: nodes && nodes.length === 0
      };
    }
  });
  _exports.runXPathQuery = runXPathQuery;
  var formatBuildingBlockXML = function (xmlString) {
    if (Array.isArray(xmlString)) {
      xmlString = xmlString.join("");
    }
    var xmlFormatted = formatXML(xmlString);
    xmlFormatted = xmlFormatted.replace(/uid--id-[0-9]{13}-[0-9]{1,2}/g, "uid--id");
    return xmlFormatted;
  };
  _exports.formatBuildingBlockXML = formatBuildingBlockXML;
  var getControlAttribute = function (controlSelector, attributeName, xmlDom) {
    var selector = "string(/root".concat(controlSelector, "/@").concat(attributeName, ")");
    return runXPathQuery(selector, xmlDom);
  };
  _exports.getControlAttribute = getControlAttribute;
  var serializeXML = function (xmlDom) {
    var serializer = new window.XMLSerializer();
    var xmlString = serializer.serializeToString(xmlDom);
    return formatXML(xmlString);
  };
  _exports.serializeXML = serializeXML;
  var formatXML = function (xmlString) {
    return format(xmlString, {
      parser: "xml",
      xmlWhitespaceSensitivity: "ignore",
      plugins: [plugin]
    } /* options by the Prettier XML plugin */);
  };

  /**
   * Compile a CDS file into an EDMX file.
   *
   * @param cdsUrl The path to the file containing the CDS definition. This file must declare the namespace
   * sap.fe.test and a service JestService
   * @param options Options for creating the EDMX output
   * @param edmxFileName Allows you to override the name of the compiled EDMX metadata file
   * @returns The path of the generated EDMX
   */
  _exports.formatXML = formatXML;
  var compileCDS = function (cdsUrl) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var edmxFileName = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : path.basename(cdsUrl).replace(".cds", ".xml");
    var cdsString = fs.readFileSync(cdsUrl, "utf-8");
    var edmxContent = cds2edmx(cdsString, "sap.fe.test.JestService", options);
    var dir = path.resolve(cdsUrl, "..", "gen");
    var edmxFilePath = path.resolve(dir, edmxFileName);
    fs.mkdirSync(dir, {
      recursive: true
    });
    fs.writeFileSync(edmxFilePath, edmxContent);
    return edmxFilePath;
  };

  /**
   * Compile CDS to EDMX.
   *
   * @param cds The CDS model. It must define at least one service.
   * @param service The fully-qualified name of the service to be compiled. Defaults to "sap.fe.test.JestService".
   * @param options Options for creating the EDMX output
   * @returns The compiled service model as EDMX.
   */
  _exports.compileCDS = compileCDS;
  function cds2edmx(cds) {
    var service = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "sap.fe.test.JestService";
    var options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var sources = {
      "source.cds": cds
    };

    // allow to include stuff from @sap/cds/common
    if (cds.includes("'@sap/cds/common'")) {
      sources["common.cds"] = fs.readFileSync(require.resolve("@sap/cds/common.cds"), "utf-8");
    }
    var csn = compiler.compileSources(sources, {});
    var edmxOptions = _objectSpread(_objectSpread({
      odataForeignKeys: true,
      odataFormat: "structured",
      odataContainment: false
    }, options), {}, {
      service: service
    });
    var edmx = compiler.to.edmx(csn, edmxOptions);
    if (!edmx) {
      throw new Error("Compilation failed. Hint: Make sure that the CDS model defines service ".concat(service, "."));
    }
    return edmx;
  }
  _exports.cds2edmx = cds2edmx;
  var getFakeSideEffectsService = function (oMetaModel) {
    try {
      var oServiceContext = {
        scopeObject: {},
        scopeType: "",
        settings: {}
      };
      return Promise.resolve(new SideEffectsFactory().createInstance(oServiceContext).then(function (oServiceInstance) {
        var oJestSideEffectsService = oServiceInstance.getInterface();
        oJestSideEffectsService.getContext = function () {
          return {
            scopeObject: {
              getModel: function () {
                return {
                  getMetaModel: function () {
                    return oMetaModel;
                  }
                };
              }
            }
          };
        };
        return oJestSideEffectsService;
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  _exports.getFakeSideEffectsService = getFakeSideEffectsService;
  var getFakeDiagnostics = function () {
    var issues = [];
    return {
      addIssue: function (issueCategory, issueSeverity, details) {
        issues.push({
          issueCategory: issueCategory,
          issueSeverity: issueSeverity,
          details: details
        });
      },
      getIssues: function () {
        return issues;
      },
      checkIfIssueExists: function (issueCategory, issueSeverity, details) {
        return issues.find(function (issue) {
          return issue.issueCategory === issueCategory && issue.issueSeverity === issueSeverity && issue.details === details;
        });
      }
    };
  };
  _exports.getFakeDiagnostics = getFakeDiagnostics;
  var getConverterContextForTest = function (convertedTypes, manifestSettings) {
    var entitySet = convertedTypes.entitySets.find(function (es) {
      return es.name === manifestSettings.entitySet;
    });
    var dataModelPath = getDataModelObjectPathForProperty(entitySet, convertedTypes, entitySet);
    return new ConverterContext(convertedTypes, manifestSettings, getFakeDiagnostics(), merge, dataModelPath);
  };
  _exports.getConverterContextForTest = getConverterContextForTest;
  var metaModelCache = {};
  var getMetaModel = function (sMetadataUrl) {
    try {
      function _temp3() {
        return metaModelCache[sMetadataUrl];
      }
      var oRequestor = _MetadataRequestor.create({}, "4.0", {});
      var _temp4 = function () {
        if (!metaModelCache[sMetadataUrl]) {
          var oMetaModel = new ODataMetaModel(oRequestor, sMetadataUrl, undefined, null);
          return Promise.resolve(oMetaModel.fetchEntityContainer()).then(function () {
            metaModelCache[sMetadataUrl] = oMetaModel;
          });
        }
      }();
      return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(_temp3) : _temp3(_temp4));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  _exports.getMetaModel = getMetaModel;
  var getDataModelObjectPathForProperty = function (entitySet, convertedTypes, property) {
    var targetPath = {
      startingEntitySet: entitySet,
      navigationProperties: [],
      targetObject: property,
      targetEntitySet: entitySet,
      targetEntityType: entitySet.entityType,
      convertedTypes: convertedTypes
    };
    targetPath.contextLocation = targetPath;
    return targetPath;
  };
  _exports.getDataModelObjectPathForProperty = getDataModelObjectPathForProperty;
  var evaluateBinding = function (bindingString) {
    var bindingElement = BindingParser.complexParser(bindingString);
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    return bindingElement.formatter.apply(undefined, args);
  };
  _exports.evaluateBinding = evaluateBinding;
  /**
   * Evaluate a binding against a model.
   *
   * @param bindingString The binding string.
   * @param modelContent Content of the default model to use for evaluation.
   * @param namedModelsContent Contents of additional, named models to use.
   * @returns The evaluated binding.
   */
  function evaluateBindingWithModel(bindingString, modelContent, namedModelsContent) {
    var bindingElement = BindingParser.complexParser(bindingString);
    var text = new InvisibleText();
    text.bindProperty("text", bindingElement);
    var defaultModel = new JSONModel(modelContent);
    text.setModel(defaultModel);
    text.setBindingContext(defaultModel.createBindingContext("/"));
    if (namedModelsContent) {
      for (var _i = 0, _Object$entries = Object.entries(namedModelsContent); _i < _Object$entries.length; _i++) {
        var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
          _name = _Object$entries$_i[0],
          content = _Object$entries$_i[1];
        var _model = new JSONModel(content);
        text.setModel(_model, _name);
        text.setBindingContext(_model.createBindingContext("/"), _name);
      }
    }
    return text.getText();
  }
  _exports.evaluateBindingWithModel = evaluateBindingWithModel;
  var TESTVIEWID = "testViewId";
  var applyFlexChanges = function (aVariantDependentControlChanges, oMetaModel, resultXML, createChangesObject) {
    try {
      var changes = createChangesObject(TESTVIEWID, aVariantDependentControlChanges);
      var appId = "someComponent";
      var oManifest = {
        "sap.app": {
          id: appId,
          type: "application",
          crossNavigation: {
            outbounds: []
          }
        }
      };
      var oAppComponent = {
        getDiagnostics: jest.fn().mockReturnValue(getFakeDiagnostics()),
        getModel: jest.fn().mockReturnValue({
          getMetaModel: jest.fn().mockReturnValue(oMetaModel)
        }),
        getComponentData: jest.fn().mockReturnValue({}),
        getManifestObject: jest.fn().mockReturnValue({
          getEntry: function (name) {
            return oManifest[name];
          }
        })
      };
      //fake changes
      jest.spyOn(AppStorage, "loadFlexData").mockReturnValue(Promise.resolve(changes));
      jest.spyOn(Component, "get").mockReturnValue(oAppComponent);
      jest.spyOn(Utils, "getAppComponentForControl").mockReturnValue(oAppComponent);
      return Promise.resolve(FlexState.initialize({
        componentId: appId
      })).then(function () {
        return Promise.resolve(XmlPreprocessor.process(resultXML, {
          name: "Test Fragment",
          componentId: appId,
          id: TESTVIEWID
        })).then(function (_XmlPreprocessor$proc) {
          resultXML = _XmlPreprocessor$proc;
          return resultXML;
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  _exports.applyFlexChanges = applyFlexChanges;
  var getChangesFromXML = function (xml) {
    return _toConsumableArray(xml.querySelectorAll("*")).flatMap(function (e) {
      return _toConsumableArray(e.attributes).map(function (a) {
        return a.name;
      });
    }).filter(function (attr) {
      return attr.includes("sap.ui.fl.appliedChanges");
    });
  };
  _exports.getChangesFromXML = getChangesFromXML;
  var getTemplatingResult = function (xmlInput, sMetadataUrl, mBindingContexts, mModels, aVariantDependentControlChanges, createChangesObject) {
    try {
      var templatedXml = "<root>".concat(xmlInput, "</root>");
      var parser = new window.DOMParser();
      var xmlDoc = parser.parseFromString(templatedXml, "text/xml");
      // To ensure our macro can use #setBindingContext we ensure there is a pre existing JSONModel for converterContext
      // if not already passed to teh templating
      return Promise.resolve(getMetaModel(sMetadataUrl)).then(function (oMetaModel) {
        if (!mModels.hasOwnProperty("converterContext")) {
          mModels = Object.assign(mModels, {
            "converterContext": new TemplateModel({}, oMetaModel)
          });
        }
        Object.keys(mModels).forEach(function (sModelName) {
          if (mModels[sModelName] && mModels[sModelName].isTemplateModel) {
            mModels[sModelName] = new TemplateModel(mModels[sModelName].data, oMetaModel);
          }
        });
        var oPreprocessorSettings = {
          models: Object.assign({
            metaModel: oMetaModel
          }, mModels),
          bindingContexts: {}
        };

        //Inject models and bindingContexts
        Object.keys(mBindingContexts).forEach(function (sKey) {
          /* Assert to make sure the annotations are in the test metadata -> avoid misleading tests */
          expect(typeof oMetaModel.getObject(mBindingContexts[sKey])).toBeDefined();
          var oModel = mModels[sKey] || oMetaModel;
          oPreprocessorSettings.bindingContexts[sKey] = oModel.createBindingContext(mBindingContexts[sKey]); //Value is sPath
          oPreprocessorSettings.models[sKey] = oModel;
        });

        //This context for macro testing
        if (oPreprocessorSettings.models["this"]) {
          oPreprocessorSettings.bindingContexts["this"] = oPreprocessorSettings.models["this"].createBindingContext("/");
        }
        return Promise.resolve(XMLPreprocessor.process(xmlDoc.firstElementChild, {
          name: "Test Fragment"
        }, oPreprocessorSettings)).then(function (resultXML) {
          var _temp5 = function () {
            if (aVariantDependentControlChanges && createChangesObject) {
              // prefix Ids
              _toConsumableArray(resultXML.querySelectorAll("[id]")).forEach(function (node) {
                node.id = "".concat(TESTVIEWID, "--").concat(node.id);
              });
              // apply flex changes
              return Promise.resolve(applyFlexChanges(aVariantDependentControlChanges, oMetaModel, resultXML, createChangesObject)).then(function (_applyFlexChanges) {
                resultXML = _applyFlexChanges;
                //Assert that all changes have been applied
                var changesApplied = getChangesFromXML(resultXML);
                expect(changesApplied.length).toBe(aVariantDependentControlChanges.length);
              });
            }
          }();
          return _temp5 && _temp5.then ? _temp5.then(function () {
            return resultXML;
          }) : resultXML;
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  _exports.getTemplatingResult = getTemplatingResult;
  var getTemplatedXML = function (xmlInput, sMetadataUrl, mBindingContexts, mModels, aVariantDependentControlChanges, createChangesObject) {
    try {
      return Promise.resolve(getTemplatingResult(xmlInput, sMetadataUrl, mBindingContexts, mModels, aVariantDependentControlChanges, createChangesObject)).then(serializeXML);
    } catch (e) {
      return Promise.reject(e);
    }
  };
  _exports.getTemplatedXML = getTemplatedXML;
  function serializeControl(controlToSerialize) {
    var tabCount = 0;
    function getTab() {
      var toAdd = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var tab = "";
      for (var i = 0; i < tabCount + toAdd; i++) {
        tab += "\t";
      }
      return tab;
    }
    var serializeDelegate = {
      start: function (control, sAggregationName) {
        var controlDetail = "";
        if (sAggregationName) {
          if (control.getParent()) {
            var _control$getParent$ge, _control$getParent$ge2;
            var indexInParent = (_control$getParent$ge = control.getParent().getAggregation(sAggregationName)) === null || _control$getParent$ge === void 0 ? void 0 : (_control$getParent$ge2 = _control$getParent$ge.indexOf) === null || _control$getParent$ge2 === void 0 ? void 0 : _control$getParent$ge2.call(_control$getParent$ge, control);
            if (indexInParent > 0) {
              controlDetail += ",\n".concat(getTab());
            }
          }
        }
        controlDetail += "".concat(control.getMetadata().getName(), "(");
        return controlDetail;
      },
      end: function () {
        return "})";
      },
      middle: function (control) {
        var data = "{id: ".concat(control.getId());
        for (var oControlKey in control.mProperties) {
          if (control.mProperties.hasOwnProperty(oControlKey)) {
            data += ",\n".concat(getTab(), " ").concat(oControlKey, ": ").concat(control.mProperties[oControlKey]);
          } else if (control.mBindingInfos.hasOwnProperty(oControlKey)) {
            var bindingDetail = control.mBindingInfos[oControlKey];
            data += ",\n".concat(getTab(), " ").concat(oControlKey, ": formatter(").concat(bindingDetail.parts.map(function (bindingInfo) {
              return "\n".concat(getTab(1)).concat(bindingInfo.model ? bindingInfo.model : "", ">").concat(bindingInfo.path);
            }), ")");
          }
        }
        for (var _oControlKey in control.mAssociations) {
          if (control.mAssociations.hasOwnProperty(_oControlKey)) {
            data += ",\n".concat(getTab(), " ").concat(_oControlKey, ": ").concat(control.mAssociations[_oControlKey][0]);
          }
        }
        data += "";
        return data;
      },
      startAggregation: function (control, sName) {
        var out = ",\n".concat(getTab()).concat(sName);
        tabCount++;
        if (control.mBindingInfos[sName]) {
          out += "={ path:'".concat(control.mBindingInfos[sName].path, "', template:\n").concat(getTab());
        } else {
          out += "=[\n".concat(getTab());
        }
        return out;
      },
      endAggregation: function (control, sName) {
        tabCount--;
        if (control.mBindingInfos[sName]) {
          return "\n".concat(getTab(), "}");
        } else {
          return "\n".concat(getTab(), "]");
        }
      }
    };
    if (Array.isArray(controlToSerialize)) {
      return controlToSerialize.map(function (controlToRender) {
        return new Serializer(controlToRender, serializeDelegate).serialize();
      });
    } else {
      return new Serializer(controlToSerialize, serializeDelegate).serialize();
    }
  }
  _exports.serializeControl = serializeControl;
  function createAwaiter() {
    var fnResolve;
    var myPromise = new Promise(function (resolve) {
      fnResolve = resolve;
    });
    return {
      promise: myPromise,
      resolve: fnResolve
    };
  }
  _exports.createAwaiter = createAwaiter;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJwcm9jZXNzRnJhZ21lbnQiLCJuYW1lIiwidGVzdERhdGEiLCJpbnB1dFhtbCIsInBhcnNlciIsIndpbmRvdyIsIkRPTVBhcnNlciIsImlucHV0RG9jIiwicGFyc2VGcm9tU3RyaW5nIiwic2V0dGluZ3MiLCJtb2RlbHMiLCJiaW5kaW5nQ29udGV4dHMiLCJtb2RlbCIsImpzb25Nb2RlbCIsIkpTT05Nb2RlbCIsInNldERhdGEiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsIlhNTFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJmaXJzdEVsZW1lbnRDaGlsZCIsInJlc3VsdERvYyIsImZyYWdtZW50cyIsImdldEVsZW1lbnRzQnlUYWdOYW1lIiwibGVuZ3RoIiwiZnJhZ21lbnQiLCJpbm5lckhUTUwiLCJ4bWxSZXN1bHQiLCJjaGlsZHJlbiIsIm91dGVySFRNTCIsImZvcm1hdFhtbCIsImZpbHRlciIsIm5vZGUiLCJ0eXBlIiwicmVxdWlyZSIsIkxvZyIsInNldExldmVsIiwiamVzdCIsInNldFRpbWVvdXQiLCJuYW1lU3BhY2VNYXAiLCJzZWxlY3QiLCJ4cGF0aCIsInVzZU5hbWVzcGFjZXMiLCJyZWdpc3Rlck1hY3JvIiwibWFjcm9NZXRhZGF0YSIsInJlZ2lzdGVyQnVpbGRpbmdCbG9jayIsInVucmVnaXN0ZXJNYWNybyIsInBsdWdJbiIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsInJ1blhQYXRoUXVlcnkiLCJzZWxlY3RvciIsInhtbGRvbSIsImV4cGVjdCIsImV4dGVuZCIsInRvSGF2ZUNvbnRyb2wiLCJub2RlcyIsIm1lc3NhZ2UiLCJvdXRwdXRYbWwiLCJzZXJpYWxpemVYTUwiLCJwYXNzIiwidG9Ob3RIYXZlQ29udHJvbCIsImZvcm1hdEJ1aWxkaW5nQmxvY2tYTUwiLCJ4bWxTdHJpbmciLCJBcnJheSIsImlzQXJyYXkiLCJqb2luIiwieG1sRm9ybWF0dGVkIiwiZm9ybWF0WE1MIiwicmVwbGFjZSIsImdldENvbnRyb2xBdHRyaWJ1dGUiLCJjb250cm9sU2VsZWN0b3IiLCJhdHRyaWJ1dGVOYW1lIiwieG1sRG9tIiwic2VyaWFsaXplciIsIlhNTFNlcmlhbGl6ZXIiLCJzZXJpYWxpemVUb1N0cmluZyIsImZvcm1hdCIsInhtbFdoaXRlc3BhY2VTZW5zaXRpdml0eSIsInBsdWdpbnMiLCJwbHVnaW4iLCJjb21waWxlQ0RTIiwiY2RzVXJsIiwib3B0aW9ucyIsImVkbXhGaWxlTmFtZSIsInBhdGgiLCJiYXNlbmFtZSIsImNkc1N0cmluZyIsImZzIiwicmVhZEZpbGVTeW5jIiwiZWRteENvbnRlbnQiLCJjZHMyZWRteCIsImRpciIsInJlc29sdmUiLCJlZG14RmlsZVBhdGgiLCJta2RpclN5bmMiLCJyZWN1cnNpdmUiLCJ3cml0ZUZpbGVTeW5jIiwiY2RzIiwic2VydmljZSIsInNvdXJjZXMiLCJpbmNsdWRlcyIsImNzbiIsImNvbXBpbGVyIiwiY29tcGlsZVNvdXJjZXMiLCJlZG14T3B0aW9ucyIsIm9kYXRhRm9yZWlnbktleXMiLCJvZGF0YUZvcm1hdCIsIm9kYXRhQ29udGFpbm1lbnQiLCJlZG14IiwidG8iLCJFcnJvciIsImdldEZha2VTaWRlRWZmZWN0c1NlcnZpY2UiLCJvTWV0YU1vZGVsIiwib1NlcnZpY2VDb250ZXh0Iiwic2NvcGVPYmplY3QiLCJzY29wZVR5cGUiLCJTaWRlRWZmZWN0c0ZhY3RvcnkiLCJjcmVhdGVJbnN0YW5jZSIsInRoZW4iLCJvU2VydmljZUluc3RhbmNlIiwib0plc3RTaWRlRWZmZWN0c1NlcnZpY2UiLCJnZXRJbnRlcmZhY2UiLCJnZXRDb250ZXh0IiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJnZXRGYWtlRGlhZ25vc3RpY3MiLCJpc3N1ZXMiLCJhZGRJc3N1ZSIsImlzc3VlQ2F0ZWdvcnkiLCJpc3N1ZVNldmVyaXR5IiwiZGV0YWlscyIsInB1c2giLCJnZXRJc3N1ZXMiLCJjaGVja0lmSXNzdWVFeGlzdHMiLCJmaW5kIiwiaXNzdWUiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Rm9yVGVzdCIsImNvbnZlcnRlZFR5cGVzIiwibWFuaWZlc3RTZXR0aW5ncyIsImVudGl0eVNldCIsImVudGl0eVNldHMiLCJlcyIsImRhdGFNb2RlbFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoRm9yUHJvcGVydHkiLCJDb252ZXJ0ZXJDb250ZXh0IiwibWVyZ2UiLCJtZXRhTW9kZWxDYWNoZSIsInNNZXRhZGF0YVVybCIsIm9SZXF1ZXN0b3IiLCJfTWV0YWRhdGFSZXF1ZXN0b3IiLCJjcmVhdGUiLCJPRGF0YU1ldGFNb2RlbCIsInVuZGVmaW5lZCIsImZldGNoRW50aXR5Q29udGFpbmVyIiwicHJvcGVydHkiLCJ0YXJnZXRQYXRoIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsInRhcmdldE9iamVjdCIsInRhcmdldEVudGl0eVNldCIsInRhcmdldEVudGl0eVR5cGUiLCJlbnRpdHlUeXBlIiwiY29udGV4dExvY2F0aW9uIiwiZXZhbHVhdGVCaW5kaW5nIiwiYmluZGluZ1N0cmluZyIsImJpbmRpbmdFbGVtZW50IiwiQmluZGluZ1BhcnNlciIsImNvbXBsZXhQYXJzZXIiLCJhcmdzIiwiZm9ybWF0dGVyIiwiYXBwbHkiLCJldmFsdWF0ZUJpbmRpbmdXaXRoTW9kZWwiLCJtb2RlbENvbnRlbnQiLCJuYW1lZE1vZGVsc0NvbnRlbnQiLCJ0ZXh0IiwiSW52aXNpYmxlVGV4dCIsImJpbmRQcm9wZXJ0eSIsImRlZmF1bHRNb2RlbCIsInNldE1vZGVsIiwic2V0QmluZGluZ0NvbnRleHQiLCJPYmplY3QiLCJlbnRyaWVzIiwiY29udGVudCIsImdldFRleHQiLCJURVNUVklFV0lEIiwiYXBwbHlGbGV4Q2hhbmdlcyIsImFWYXJpYW50RGVwZW5kZW50Q29udHJvbENoYW5nZXMiLCJyZXN1bHRYTUwiLCJjcmVhdGVDaGFuZ2VzT2JqZWN0IiwiY2hhbmdlcyIsImFwcElkIiwib01hbmlmZXN0IiwiaWQiLCJjcm9zc05hdmlnYXRpb24iLCJvdXRib3VuZHMiLCJvQXBwQ29tcG9uZW50IiwiZ2V0RGlhZ25vc3RpY3MiLCJmbiIsIm1vY2tSZXR1cm5WYWx1ZSIsImdldENvbXBvbmVudERhdGEiLCJnZXRNYW5pZmVzdE9iamVjdCIsImdldEVudHJ5Iiwic3B5T24iLCJBcHBTdG9yYWdlIiwiUHJvbWlzZSIsIkNvbXBvbmVudCIsIlV0aWxzIiwiRmxleFN0YXRlIiwiaW5pdGlhbGl6ZSIsImNvbXBvbmVudElkIiwiWG1sUHJlcHJvY2Vzc29yIiwiZ2V0Q2hhbmdlc0Zyb21YTUwiLCJ4bWwiLCJxdWVyeVNlbGVjdG9yQWxsIiwiZmxhdE1hcCIsImUiLCJhdHRyaWJ1dGVzIiwibWFwIiwiYSIsImF0dHIiLCJnZXRUZW1wbGF0aW5nUmVzdWx0IiwieG1sSW5wdXQiLCJtQmluZGluZ0NvbnRleHRzIiwibU1vZGVscyIsInRlbXBsYXRlZFhtbCIsInhtbERvYyIsImhhc093blByb3BlcnR5IiwiYXNzaWduIiwiVGVtcGxhdGVNb2RlbCIsImtleXMiLCJmb3JFYWNoIiwic01vZGVsTmFtZSIsImlzVGVtcGxhdGVNb2RlbCIsImRhdGEiLCJvUHJlcHJvY2Vzc29yU2V0dGluZ3MiLCJtZXRhTW9kZWwiLCJzS2V5IiwiZ2V0T2JqZWN0IiwidG9CZURlZmluZWQiLCJvTW9kZWwiLCJjaGFuZ2VzQXBwbGllZCIsInRvQmUiLCJnZXRUZW1wbGF0ZWRYTUwiLCJzZXJpYWxpemVDb250cm9sIiwiY29udHJvbFRvU2VyaWFsaXplIiwidGFiQ291bnQiLCJnZXRUYWIiLCJ0b0FkZCIsInRhYiIsImkiLCJzZXJpYWxpemVEZWxlZ2F0ZSIsInN0YXJ0IiwiY29udHJvbCIsInNBZ2dyZWdhdGlvbk5hbWUiLCJjb250cm9sRGV0YWlsIiwiZ2V0UGFyZW50IiwiaW5kZXhJblBhcmVudCIsImdldEFnZ3JlZ2F0aW9uIiwiaW5kZXhPZiIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsImVuZCIsIm1pZGRsZSIsImdldElkIiwib0NvbnRyb2xLZXkiLCJtUHJvcGVydGllcyIsIm1CaW5kaW5nSW5mb3MiLCJiaW5kaW5nRGV0YWlsIiwicGFydHMiLCJiaW5kaW5nSW5mbyIsIm1Bc3NvY2lhdGlvbnMiLCJzdGFydEFnZ3JlZ2F0aW9uIiwic05hbWUiLCJvdXQiLCJlbmRBZ2dyZWdhdGlvbiIsImNvbnRyb2xUb1JlbmRlciIsIlNlcmlhbGl6ZXIiLCJzZXJpYWxpemUiLCJjcmVhdGVBd2FpdGVyIiwiZm5SZXNvbHZlIiwibXlQcm9taXNlIiwicHJvbWlzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiSmVzdFRlbXBsYXRpbmdIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBBbnlBbm5vdGF0aW9uLCBDb252ZXJ0ZWRNZXRhZGF0YSwgRW50aXR5U2V0LCBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IGNvbXBpbGVyIGZyb20gXCJAc2FwL2Nkcy1jb21waWxlclwiO1xuaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L2Jhbi10cy1jb21tZW50XG4vLyBAdHMtaWdub3JlXG5pbXBvcnQgKiBhcyBwbHVnaW4gZnJvbSBcIkBwcmV0dGllci9wbHVnaW4teG1sXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgdHlwZSB7IFJlcXVpcmVkT3B0aW9ucyB9IGZyb20gXCJwcmV0dGllclwiO1xuaW1wb3J0IHsgZm9ybWF0IH0gZnJvbSBcInByZXR0aWVyXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgeyByZWdpc3RlckJ1aWxkaW5nQmxvY2sgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB0eXBlIHsgSXNzdWVDYXRlZ29yeSwgSXNzdWVTZXZlcml0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSB7IExpc3RSZXBvcnRNYW5pZmVzdFNldHRpbmdzLCBPYmplY3RQYWdlTWFuaWZlc3RTZXR0aW5ncyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB0eXBlIHsgSURpYWdub3N0aWNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvVGVtcGxhdGVDb252ZXJ0ZXJcIjtcbmltcG9ydCBTaWRlRWZmZWN0c0ZhY3RvcnkgZnJvbSBcInNhcC9mZS9jb3JlL3NlcnZpY2VzL1NpZGVFZmZlY3RzU2VydmljZUZhY3RvcnlcIjtcbmltcG9ydCBUZW1wbGF0ZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgQmluZGluZ1BhcnNlciBmcm9tIFwic2FwL3VpL2Jhc2UvQmluZGluZ1BhcnNlclwiO1xuaW1wb3J0IE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCBJbnZpc2libGVUZXh0IGZyb20gXCJzYXAvdWkvY29yZS9JbnZpc2libGVUZXh0XCI7XG5pbXBvcnQgU2VyaWFsaXplciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9zZXJpYWxpemVyL1NlcmlhbGl6ZXJcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgRmxleFN0YXRlIGZyb20gXCJzYXAvdWkvZmwvYXBwbHkvX2ludGVybmFsL2ZsZXhTdGF0ZS9GbGV4U3RhdGVcIjtcbmltcG9ydCBYbWxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9mbC9hcHBseS9faW50ZXJuYWwvcHJlcHJvY2Vzc29ycy9YbWxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCBBcHBTdG9yYWdlIGZyb20gXCJzYXAvdWkvZmwvaW5pdGlhbC9faW50ZXJuYWwvU3RvcmFnZVwiO1xuaW1wb3J0IFV0aWxzIGZyb20gXCJzYXAvdWkvZmwvVXRpbHNcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9NZXRhTW9kZWxcIjtcbmltcG9ydCBfTWV0YWRhdGFSZXF1ZXN0b3IgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9saWIvX01ldGFkYXRhUmVxdWVzdG9yXCI7XG5pbXBvcnQgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHhwYXRoIGZyb20gXCJ4cGF0aFwiO1xuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcbmNvbnN0IGZvcm1hdFhtbCA9IHJlcXVpcmUoXCJ4bWwtZm9ybWF0dGVyXCIpO1xuXG5Mb2cuc2V0TGV2ZWwoMSBhcyBhbnksIFwic2FwLnVpLmNvcmUudXRpbC5YTUxQcmVwcm9jZXNzb3JcIik7XG5qZXN0LnNldFRpbWVvdXQoNDAwMDApO1xuXG5jb25zdCBuYW1lU3BhY2VNYXAgPSB7XG5cdFwibWFjcm9zXCI6IFwic2FwLmZlLm1hY3Jvc1wiLFxuXHRcIm1hY3JvXCI6IFwic2FwLmZlLm1hY3Jvc1wiLFxuXHRcIm1hY3JvRmllbGRcIjogXCJzYXAuZmUubWFjcm9zLmZpZWxkXCIsXG5cdFwibWFjcm9kYXRhXCI6IFwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiLFxuXHRcImxvZ1wiOiBcImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAudWkuY29yZS5DdXN0b21EYXRhLzFcIixcblx0XCJ1bml0dGVzdFwiOiBcImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L3ByZXByb2Nlc3NvcmV4dGVuc2lvbi9zYXAuZmUudW5pdHRlc3RpbmcvMVwiLFxuXHRcImNvbnRyb2xcIjogXCJzYXAuZmUuY29yZS5jb250cm9sc1wiLFxuXHRcImNvcmVcIjogXCJzYXAudWkuY29yZVwiLFxuXHRcIm1cIjogXCJzYXAubVwiLFxuXHRcImZcIjogXCJzYXAudWkubGF5b3V0LmZvcm1cIixcblx0XCJpbnRlcm5hbE1hY3JvXCI6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHRcIm1kY1wiOiBcInNhcC51aS5tZGNcIixcblx0XCJtZGNhdFwiOiBcInNhcC51aS5tZGMuYWN0aW9udG9vbGJhclwiLFxuXHRcIm1kY0ZpZWxkXCI6IFwic2FwLnVpLm1kYy5maWVsZFwiLFxuXHRcIm1kY1RhYmxlXCI6IFwic2FwLnVpLm1kYy50YWJsZVwiLFxuXHRcInVcIjogXCJzYXAudWkudW5pZmllZFwiLFxuXHRcIm1hY3JvTWljcm9DaGFydFwiOiBcInNhcC5mZS5tYWNyb3MubWljcm9jaGFydFwiLFxuXHRcIm1pY3JvQ2hhcnRcIjogXCJzYXAuc3VpdGUudWkubWljcm9jaGFydFwiLFxuXHRcIm1hY3JvVGFibGVcIjogXCJzYXAuZmUubWFjcm9zLnRhYmxlXCJcbn07XG5jb25zdCBzZWxlY3QgPSB4cGF0aC51c2VOYW1lc3BhY2VzKG5hbWVTcGFjZU1hcCk7XG5cbmV4cG9ydCBjb25zdCByZWdpc3Rlck1hY3JvID0gZnVuY3Rpb24gKG1hY3JvTWV0YWRhdGE6IGFueSkge1xuXHRyZWdpc3RlckJ1aWxkaW5nQmxvY2sobWFjcm9NZXRhZGF0YSk7XG59O1xuZXhwb3J0IGNvbnN0IHVucmVnaXN0ZXJNYWNybyA9IGZ1bmN0aW9uIChtYWNyb01ldGFkYXRhOiBhbnkpIHtcblx0WE1MUHJlcHJvY2Vzc29yLnBsdWdJbihudWxsLCBtYWNyb01ldGFkYXRhLm5hbWVzcGFjZSwgbWFjcm9NZXRhZGF0YS5uYW1lKTtcblx0aWYgKG1hY3JvTWV0YWRhdGEucHVibGljTmFtZXNwYWNlKSB7XG5cdFx0WE1MUHJlcHJvY2Vzc29yLnBsdWdJbihudWxsLCBtYWNyb01ldGFkYXRhLnB1YmxpY05hbWVzcGFjZSwgbWFjcm9NZXRhZGF0YS5uYW1lKTtcblx0fVxufTtcbmV4cG9ydCBjb25zdCBydW5YUGF0aFF1ZXJ5ID0gZnVuY3Rpb24gKHNlbGVjdG9yOiBzdHJpbmcsIHhtbGRvbTogTm9kZSB8IHVuZGVmaW5lZCkge1xuXHRyZXR1cm4gc2VsZWN0KHNlbGVjdG9yLCB4bWxkb20pO1xufTtcblxuZXhwZWN0LmV4dGVuZCh7XG5cdHRvSGF2ZUNvbnRyb2woeG1sZG9tLCBzZWxlY3Rvcikge1xuXHRcdGNvbnN0IG5vZGVzID0gcnVuWFBhdGhRdWVyeShgL3Jvb3Qke3NlbGVjdG9yfWAsIHhtbGRvbSk7XG5cdFx0cmV0dXJuIHtcblx0XHRcdG1lc3NhZ2U6ICgpID0+IHtcblx0XHRcdFx0Y29uc3Qgb3V0cHV0WG1sID0gc2VyaWFsaXplWE1MKHhtbGRvbSk7XG5cdFx0XHRcdHJldHVybiBgZGlkIG5vdCBmaW5kIGNvbnRyb2xzIG1hdGNoaW5nICR7c2VsZWN0b3J9IGluIGdlbmVyYXRlZCB4bWw6XFxuICR7b3V0cHV0WG1sfWA7XG5cdFx0XHR9LFxuXHRcdFx0cGFzczogbm9kZXMgJiYgbm9kZXMubGVuZ3RoID49IDFcblx0XHR9O1xuXHR9LFxuXHR0b05vdEhhdmVDb250cm9sKHhtbGRvbSwgc2VsZWN0b3IpIHtcblx0XHRjb25zdCBub2RlcyA9IHJ1blhQYXRoUXVlcnkoYC9yb290JHtzZWxlY3Rvcn1gLCB4bWxkb20pO1xuXHRcdHJldHVybiB7XG5cdFx0XHRtZXNzYWdlOiAoKSA9PiB7XG5cdFx0XHRcdGNvbnN0IG91dHB1dFhtbCA9IHNlcmlhbGl6ZVhNTCh4bWxkb20pO1xuXHRcdFx0XHRyZXR1cm4gYFRoZXJlIGlzIGEgY29udHJvbCBtYXRjaGluZyAke3NlbGVjdG9yfSBpbiBnZW5lcmF0ZWQgeG1sOlxcbiAke291dHB1dFhtbH1gO1xuXHRcdFx0fSxcblx0XHRcdHBhc3M6IG5vZGVzICYmIG5vZGVzLmxlbmd0aCA9PT0gMFxuXHRcdH07XG5cdH1cbn0pO1xuXG5leHBvcnQgY29uc3QgZm9ybWF0QnVpbGRpbmdCbG9ja1hNTCA9IGZ1bmN0aW9uICh4bWxTdHJpbmc6IHN0cmluZyB8IHN0cmluZ1tdKSB7XG5cdGlmIChBcnJheS5pc0FycmF5KHhtbFN0cmluZykpIHtcblx0XHR4bWxTdHJpbmcgPSB4bWxTdHJpbmcuam9pbihcIlwiKTtcblx0fVxuXHRsZXQgeG1sRm9ybWF0dGVkID0gZm9ybWF0WE1MKHhtbFN0cmluZyk7XG5cdHhtbEZvcm1hdHRlZCA9IHhtbEZvcm1hdHRlZC5yZXBsYWNlKC91aWQtLWlkLVswLTldezEzfS1bMC05XXsxLDJ9L2csIFwidWlkLS1pZFwiKTtcblx0cmV0dXJuIHhtbEZvcm1hdHRlZDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRDb250cm9sQXR0cmlidXRlID0gZnVuY3Rpb24gKGNvbnRyb2xTZWxlY3Rvcjogc3RyaW5nLCBhdHRyaWJ1dGVOYW1lOiBzdHJpbmcsIHhtbERvbTogTm9kZSkge1xuXHRjb25zdCBzZWxlY3RvciA9IGBzdHJpbmcoL3Jvb3Qke2NvbnRyb2xTZWxlY3Rvcn0vQCR7YXR0cmlidXRlTmFtZX0pYDtcblx0cmV0dXJuIHJ1blhQYXRoUXVlcnkoc2VsZWN0b3IsIHhtbERvbSk7XG59O1xuXG5leHBvcnQgY29uc3Qgc2VyaWFsaXplWE1MID0gZnVuY3Rpb24gKHhtbERvbTogTm9kZSkge1xuXHRjb25zdCBzZXJpYWxpemVyID0gbmV3IHdpbmRvdy5YTUxTZXJpYWxpemVyKCk7XG5cdGNvbnN0IHhtbFN0cmluZyA9IHNlcmlhbGl6ZXIuc2VyaWFsaXplVG9TdHJpbmcoeG1sRG9tKTtcblx0cmV0dXJuIGZvcm1hdFhNTCh4bWxTdHJpbmcpO1xufTtcblxuZXhwb3J0IGNvbnN0IGZvcm1hdFhNTCA9IGZ1bmN0aW9uICh4bWxTdHJpbmc6IHN0cmluZykge1xuXHRyZXR1cm4gZm9ybWF0KFxuXHRcdHhtbFN0cmluZyxcblxuXHRcdHtcblx0XHRcdHBhcnNlcjogXCJ4bWxcIixcblx0XHRcdHhtbFdoaXRlc3BhY2VTZW5zaXRpdml0eTogXCJpZ25vcmVcIixcblx0XHRcdHBsdWdpbnM6IFtwbHVnaW5dXG5cdFx0fSBhcyBQYXJ0aWFsPFJlcXVpcmVkT3B0aW9ucz4gLyogb3B0aW9ucyBieSB0aGUgUHJldHRpZXIgWE1MIHBsdWdpbiAqL1xuXHQpO1xufTtcblxuLyoqXG4gKiBDb21waWxlIGEgQ0RTIGZpbGUgaW50byBhbiBFRE1YIGZpbGUuXG4gKlxuICogQHBhcmFtIGNkc1VybCBUaGUgcGF0aCB0byB0aGUgZmlsZSBjb250YWluaW5nIHRoZSBDRFMgZGVmaW5pdGlvbi4gVGhpcyBmaWxlIG11c3QgZGVjbGFyZSB0aGUgbmFtZXNwYWNlXG4gKiBzYXAuZmUudGVzdCBhbmQgYSBzZXJ2aWNlIEplc3RTZXJ2aWNlXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBjcmVhdGluZyB0aGUgRURNWCBvdXRwdXRcbiAqIEBwYXJhbSBlZG14RmlsZU5hbWUgQWxsb3dzIHlvdSB0byBvdmVycmlkZSB0aGUgbmFtZSBvZiB0aGUgY29tcGlsZWQgRURNWCBtZXRhZGF0YSBmaWxlXG4gKiBAcmV0dXJucyBUaGUgcGF0aCBvZiB0aGUgZ2VuZXJhdGVkIEVETVhcbiAqL1xuZXhwb3J0IGNvbnN0IGNvbXBpbGVDRFMgPSBmdW5jdGlvbiAoXG5cdGNkc1VybDogc3RyaW5nLFxuXHRvcHRpb25zOiBjb21waWxlci5PRGF0YU9wdGlvbnMgPSB7fSxcblx0ZWRteEZpbGVOYW1lID0gcGF0aC5iYXNlbmFtZShjZHNVcmwpLnJlcGxhY2UoXCIuY2RzXCIsIFwiLnhtbFwiKVxuKSB7XG5cdGNvbnN0IGNkc1N0cmluZyA9IGZzLnJlYWRGaWxlU3luYyhjZHNVcmwsIFwidXRmLThcIik7XG5cdGNvbnN0IGVkbXhDb250ZW50ID0gY2RzMmVkbXgoY2RzU3RyaW5nLCBcInNhcC5mZS50ZXN0Lkplc3RTZXJ2aWNlXCIsIG9wdGlvbnMpO1xuXHRjb25zdCBkaXIgPSBwYXRoLnJlc29sdmUoY2RzVXJsLCBcIi4uXCIsIFwiZ2VuXCIpO1xuXG5cdGNvbnN0IGVkbXhGaWxlUGF0aCA9IHBhdGgucmVzb2x2ZShkaXIsIGVkbXhGaWxlTmFtZSk7XG5cblx0ZnMubWtkaXJTeW5jKGRpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7XG5cblx0ZnMud3JpdGVGaWxlU3luYyhlZG14RmlsZVBhdGgsIGVkbXhDb250ZW50KTtcblx0cmV0dXJuIGVkbXhGaWxlUGF0aDtcbn07XG5cbi8qKlxuICogQ29tcGlsZSBDRFMgdG8gRURNWC5cbiAqXG4gKiBAcGFyYW0gY2RzIFRoZSBDRFMgbW9kZWwuIEl0IG11c3QgZGVmaW5lIGF0IGxlYXN0IG9uZSBzZXJ2aWNlLlxuICogQHBhcmFtIHNlcnZpY2UgVGhlIGZ1bGx5LXF1YWxpZmllZCBuYW1lIG9mIHRoZSBzZXJ2aWNlIHRvIGJlIGNvbXBpbGVkLiBEZWZhdWx0cyB0byBcInNhcC5mZS50ZXN0Lkplc3RTZXJ2aWNlXCIuXG4gKiBAcGFyYW0gb3B0aW9ucyBPcHRpb25zIGZvciBjcmVhdGluZyB0aGUgRURNWCBvdXRwdXRcbiAqIEByZXR1cm5zIFRoZSBjb21waWxlZCBzZXJ2aWNlIG1vZGVsIGFzIEVETVguXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjZHMyZWRteChjZHM6IHN0cmluZywgc2VydmljZSA9IFwic2FwLmZlLnRlc3QuSmVzdFNlcnZpY2VcIiwgb3B0aW9uczogY29tcGlsZXIuT0RhdGFPcHRpb25zID0ge30pIHtcblx0Y29uc3Qgc291cmNlczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHsgXCJzb3VyY2UuY2RzXCI6IGNkcyB9O1xuXG5cdC8vIGFsbG93IHRvIGluY2x1ZGUgc3R1ZmYgZnJvbSBAc2FwL2Nkcy9jb21tb25cblx0aWYgKGNkcy5pbmNsdWRlcyhcIidAc2FwL2Nkcy9jb21tb24nXCIpKSB7XG5cdFx0c291cmNlc1tcImNvbW1vbi5jZHNcIl0gPSBmcy5yZWFkRmlsZVN5bmMocmVxdWlyZS5yZXNvbHZlKFwiQHNhcC9jZHMvY29tbW9uLmNkc1wiKSwgXCJ1dGYtOFwiKTtcblx0fVxuXG5cdGNvbnN0IGNzbiA9IGNvbXBpbGVyLmNvbXBpbGVTb3VyY2VzKHNvdXJjZXMsIHt9KTtcblxuXHRjb25zdCBlZG14T3B0aW9uczogY29tcGlsZXIuT0RhdGFPcHRpb25zID0ge1xuXHRcdG9kYXRhRm9yZWlnbktleXM6IHRydWUsXG5cdFx0b2RhdGFGb3JtYXQ6IFwic3RydWN0dXJlZFwiLFxuXHRcdG9kYXRhQ29udGFpbm1lbnQ6IGZhbHNlLFxuXHRcdC4uLm9wdGlvbnMsXG5cdFx0c2VydmljZTogc2VydmljZVxuXHR9O1xuXG5cdGNvbnN0IGVkbXggPSBjb21waWxlci50by5lZG14KGNzbiwgZWRteE9wdGlvbnMpO1xuXHRpZiAoIWVkbXgpIHtcblx0XHR0aHJvdyBuZXcgRXJyb3IoYENvbXBpbGF0aW9uIGZhaWxlZC4gSGludDogTWFrZSBzdXJlIHRoYXQgdGhlIENEUyBtb2RlbCBkZWZpbmVzIHNlcnZpY2UgJHtzZXJ2aWNlfS5gKTtcblx0fVxuXHRyZXR1cm4gZWRteDtcbn1cblxuZXhwb3J0IGNvbnN0IGdldEZha2VTaWRlRWZmZWN0c1NlcnZpY2UgPSBhc3luYyBmdW5jdGlvbiAob01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwpOiBQcm9taXNlPGFueT4ge1xuXHRjb25zdCBvU2VydmljZUNvbnRleHQgPSB7IHNjb3BlT2JqZWN0OiB7fSwgc2NvcGVUeXBlOiBcIlwiLCBzZXR0aW5nczoge30gfTtcblx0cmV0dXJuIG5ldyBTaWRlRWZmZWN0c0ZhY3RvcnkoKS5jcmVhdGVJbnN0YW5jZShvU2VydmljZUNvbnRleHQpLnRoZW4oZnVuY3Rpb24gKG9TZXJ2aWNlSW5zdGFuY2U6IGFueSkge1xuXHRcdGNvbnN0IG9KZXN0U2lkZUVmZmVjdHNTZXJ2aWNlID0gb1NlcnZpY2VJbnN0YW5jZS5nZXRJbnRlcmZhY2UoKTtcblx0XHRvSmVzdFNpZGVFZmZlY3RzU2VydmljZS5nZXRDb250ZXh0ID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c2NvcGVPYmplY3Q6IHtcblx0XHRcdFx0XHRnZXRNb2RlbDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0Z2V0TWV0YU1vZGVsOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9NZXRhTW9kZWw7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH07XG5cdFx0cmV0dXJuIG9KZXN0U2lkZUVmZmVjdHNTZXJ2aWNlO1xuXHR9KTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRGYWtlRGlhZ25vc3RpY3MgPSBmdW5jdGlvbiAoKTogSURpYWdub3N0aWNzIHtcblx0Y29uc3QgaXNzdWVzOiBhbnlbXSA9IFtdO1xuXHRyZXR1cm4ge1xuXHRcdGFkZElzc3VlKGlzc3VlQ2F0ZWdvcnk6IElzc3VlQ2F0ZWdvcnksIGlzc3VlU2V2ZXJpdHk6IElzc3VlU2V2ZXJpdHksIGRldGFpbHM6IHN0cmluZyk6IHZvaWQge1xuXHRcdFx0aXNzdWVzLnB1c2goe1xuXHRcdFx0XHRpc3N1ZUNhdGVnb3J5LFxuXHRcdFx0XHRpc3N1ZVNldmVyaXR5LFxuXHRcdFx0XHRkZXRhaWxzXG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGdldElzc3VlcygpOiBhbnlbXSB7XG5cdFx0XHRyZXR1cm4gaXNzdWVzO1xuXHRcdH0sXG5cdFx0Y2hlY2tJZklzc3VlRXhpc3RzKGlzc3VlQ2F0ZWdvcnk6IElzc3VlQ2F0ZWdvcnksIGlzc3VlU2V2ZXJpdHk6IElzc3VlU2V2ZXJpdHksIGRldGFpbHM6IHN0cmluZyk6IGJvb2xlYW4ge1xuXHRcdFx0cmV0dXJuIGlzc3Vlcy5maW5kKChpc3N1ZSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gaXNzdWUuaXNzdWVDYXRlZ29yeSA9PT0gaXNzdWVDYXRlZ29yeSAmJiBpc3N1ZS5pc3N1ZVNldmVyaXR5ID09PSBpc3N1ZVNldmVyaXR5ICYmIGlzc3VlLmRldGFpbHMgPT09IGRldGFpbHM7XG5cdFx0XHR9KTtcblx0XHR9XG5cdH07XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0Q29udmVydGVyQ29udGV4dEZvclRlc3QgPSBmdW5jdGlvbiAoXG5cdGNvbnZlcnRlZFR5cGVzOiBDb252ZXJ0ZWRNZXRhZGF0YSxcblx0bWFuaWZlc3RTZXR0aW5nczogTGlzdFJlcG9ydE1hbmlmZXN0U2V0dGluZ3MgfCBPYmplY3RQYWdlTWFuaWZlc3RTZXR0aW5nc1xuKSB7XG5cdGNvbnN0IGVudGl0eVNldCA9IGNvbnZlcnRlZFR5cGVzLmVudGl0eVNldHMuZmluZCgoZXMpID0+IGVzLm5hbWUgPT09IG1hbmlmZXN0U2V0dGluZ3MuZW50aXR5U2V0KTtcblx0Y29uc3QgZGF0YU1vZGVsUGF0aCA9IGdldERhdGFNb2RlbE9iamVjdFBhdGhGb3JQcm9wZXJ0eShlbnRpdHlTZXQgYXMgRW50aXR5U2V0LCBjb252ZXJ0ZWRUeXBlcywgZW50aXR5U2V0KTtcblx0cmV0dXJuIG5ldyBDb252ZXJ0ZXJDb250ZXh0KGNvbnZlcnRlZFR5cGVzLCBtYW5pZmVzdFNldHRpbmdzLCBnZXRGYWtlRGlhZ25vc3RpY3MoKSwgbWVyZ2UsIGRhdGFNb2RlbFBhdGgpO1xufTtcbmNvbnN0IG1ldGFNb2RlbENhY2hlOiBhbnkgPSB7fTtcbmV4cG9ydCBjb25zdCBnZXRNZXRhTW9kZWwgPSBhc3luYyBmdW5jdGlvbiAoc01ldGFkYXRhVXJsOiBzdHJpbmcpIHtcblx0Y29uc3Qgb1JlcXVlc3RvciA9IF9NZXRhZGF0YVJlcXVlc3Rvci5jcmVhdGUoe30sIFwiNC4wXCIsIHt9KTtcblx0aWYgKCFtZXRhTW9kZWxDYWNoZVtzTWV0YWRhdGFVcmxdKSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG5ldyAoT0RhdGFNZXRhTW9kZWwgYXMgYW55KShvUmVxdWVzdG9yLCBzTWV0YWRhdGFVcmwsIHVuZGVmaW5lZCwgbnVsbCk7XG5cdFx0YXdhaXQgb01ldGFNb2RlbC5mZXRjaEVudGl0eUNvbnRhaW5lcigpO1xuXHRcdG1ldGFNb2RlbENhY2hlW3NNZXRhZGF0YVVybF0gPSBvTWV0YU1vZGVsO1xuXHR9XG5cblx0cmV0dXJuIG1ldGFNb2RlbENhY2hlW3NNZXRhZGF0YVVybF07XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aEZvclByb3BlcnR5ID0gZnVuY3Rpb24gKFxuXHRlbnRpdHlTZXQ6IEVudGl0eVNldCxcblx0Y29udmVydGVkVHlwZXM6IENvbnZlcnRlZE1ldGFkYXRhLFxuXHRwcm9wZXJ0eT86IFByb3BlcnR5IHwgRW50aXR5U2V0IHwgQW55QW5ub3RhdGlvblxuKTogRGF0YU1vZGVsT2JqZWN0UGF0aCB7XG5cdGNvbnN0IHRhcmdldFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGggPSB7XG5cdFx0c3RhcnRpbmdFbnRpdHlTZXQ6IGVudGl0eVNldCxcblx0XHRuYXZpZ2F0aW9uUHJvcGVydGllczogW10sXG5cdFx0dGFyZ2V0T2JqZWN0OiBwcm9wZXJ0eSxcblx0XHR0YXJnZXRFbnRpdHlTZXQ6IGVudGl0eVNldCxcblx0XHR0YXJnZXRFbnRpdHlUeXBlOiBlbnRpdHlTZXQuZW50aXR5VHlwZSxcblx0XHRjb252ZXJ0ZWRUeXBlczogY29udmVydGVkVHlwZXNcblx0fTtcblx0dGFyZ2V0UGF0aC5jb250ZXh0TG9jYXRpb24gPSB0YXJnZXRQYXRoO1xuXHRyZXR1cm4gdGFyZ2V0UGF0aDtcbn07XG5cbmV4cG9ydCBjb25zdCBldmFsdWF0ZUJpbmRpbmcgPSBmdW5jdGlvbiAoYmluZGluZ1N0cmluZzogc3RyaW5nLCAuLi5hcmdzOiBhbnlbXSkge1xuXHRjb25zdCBiaW5kaW5nRWxlbWVudCA9IEJpbmRpbmdQYXJzZXIuY29tcGxleFBhcnNlcihiaW5kaW5nU3RyaW5nKTtcblx0cmV0dXJuIGJpbmRpbmdFbGVtZW50LmZvcm1hdHRlci5hcHBseSh1bmRlZmluZWQsIGFyZ3MpO1xufTtcblxudHlwZSBNb2RlbENvbnRlbnQgPSB7XG5cdFtuYW1lOiBzdHJpbmddOiBhbnk7XG59O1xuXG4vKipcbiAqIEV2YWx1YXRlIGEgYmluZGluZyBhZ2FpbnN0IGEgbW9kZWwuXG4gKlxuICogQHBhcmFtIGJpbmRpbmdTdHJpbmcgVGhlIGJpbmRpbmcgc3RyaW5nLlxuICogQHBhcmFtIG1vZGVsQ29udGVudCBDb250ZW50IG9mIHRoZSBkZWZhdWx0IG1vZGVsIHRvIHVzZSBmb3IgZXZhbHVhdGlvbi5cbiAqIEBwYXJhbSBuYW1lZE1vZGVsc0NvbnRlbnQgQ29udGVudHMgb2YgYWRkaXRpb25hbCwgbmFtZWQgbW9kZWxzIHRvIHVzZS5cbiAqIEByZXR1cm5zIFRoZSBldmFsdWF0ZWQgYmluZGluZy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV2YWx1YXRlQmluZGluZ1dpdGhNb2RlbChcblx0YmluZGluZ1N0cmluZzogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRtb2RlbENvbnRlbnQ6IE1vZGVsQ29udGVudCxcblx0bmFtZWRNb2RlbHNDb250ZW50PzogeyBbbW9kZWxOYW1lOiBzdHJpbmddOiBNb2RlbENvbnRlbnQgfVxuKTogc3RyaW5nIHtcblx0Y29uc3QgYmluZGluZ0VsZW1lbnQgPSBCaW5kaW5nUGFyc2VyLmNvbXBsZXhQYXJzZXIoYmluZGluZ1N0cmluZyk7XG5cdGNvbnN0IHRleHQgPSBuZXcgSW52aXNpYmxlVGV4dCgpO1xuXHR0ZXh0LmJpbmRQcm9wZXJ0eShcInRleHRcIiwgYmluZGluZ0VsZW1lbnQpO1xuXG5cdGNvbnN0IGRlZmF1bHRNb2RlbCA9IG5ldyBKU09OTW9kZWwobW9kZWxDb250ZW50KTtcblx0dGV4dC5zZXRNb2RlbChkZWZhdWx0TW9kZWwpO1xuXHR0ZXh0LnNldEJpbmRpbmdDb250ZXh0KGRlZmF1bHRNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIikgYXMgQ29udGV4dCk7XG5cblx0aWYgKG5hbWVkTW9kZWxzQ29udGVudCkge1xuXHRcdGZvciAoY29uc3QgW25hbWUsIGNvbnRlbnRdIG9mIE9iamVjdC5lbnRyaWVzKG5hbWVkTW9kZWxzQ29udGVudCkpIHtcblx0XHRcdGNvbnN0IG1vZGVsID0gbmV3IEpTT05Nb2RlbChjb250ZW50KTtcblx0XHRcdHRleHQuc2V0TW9kZWwobW9kZWwsIG5hbWUpO1xuXHRcdFx0dGV4dC5zZXRCaW5kaW5nQ29udGV4dChtb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIikgYXMgQ29udGV4dCwgbmFtZSk7XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHRleHQuZ2V0VGV4dCgpO1xufVxuXG5jb25zdCBURVNUVklFV0lEID0gXCJ0ZXN0Vmlld0lkXCI7XG5cbmV4cG9ydCBjb25zdCBhcHBseUZsZXhDaGFuZ2VzID0gYXN5bmMgZnVuY3Rpb24gKFxuXHRhVmFyaWFudERlcGVuZGVudENvbnRyb2xDaGFuZ2VzOiBhbnlbXSxcblx0b01ldGFNb2RlbDogTWV0YU1vZGVsLFxuXHRyZXN1bHRYTUw6IGFueSxcblx0Y3JlYXRlQ2hhbmdlc09iamVjdDogRnVuY3Rpb25cbikge1xuXHRjb25zdCBjaGFuZ2VzID0gY3JlYXRlQ2hhbmdlc09iamVjdChURVNUVklFV0lELCBhVmFyaWFudERlcGVuZGVudENvbnRyb2xDaGFuZ2VzKTtcblx0Y29uc3QgYXBwSWQgPSBcInNvbWVDb21wb25lbnRcIjtcblx0Y29uc3Qgb01hbmlmZXN0ID0ge1xuXHRcdFwic2FwLmFwcFwiOiB7XG5cdFx0XHRpZDogYXBwSWQsXG5cdFx0XHR0eXBlOiBcImFwcGxpY2F0aW9uXCIsXG5cdFx0XHRjcm9zc05hdmlnYXRpb246IHtcblx0XHRcdFx0b3V0Ym91bmRzOiBbXVxuXHRcdFx0fVxuXHRcdH1cblx0fTtcblx0Y29uc3Qgb0FwcENvbXBvbmVudDogQXBwQ29tcG9uZW50ID0ge1xuXHRcdGdldERpYWdub3N0aWNzOiBqZXN0LmZuKCkubW9ja1JldHVyblZhbHVlKGdldEZha2VEaWFnbm9zdGljcygpKSxcblx0XHRnZXRNb2RlbDogamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7XG5cdFx0XHRnZXRNZXRhTW9kZWw6IGplc3QuZm4oKS5tb2NrUmV0dXJuVmFsdWUob01ldGFNb2RlbClcblx0XHR9KSxcblx0XHRnZXRDb21wb25lbnREYXRhOiBqZXN0LmZuKCkubW9ja1JldHVyblZhbHVlKHt9KSxcblx0XHRnZXRNYW5pZmVzdE9iamVjdDogamVzdC5mbigpLm1vY2tSZXR1cm5WYWx1ZSh7XG5cdFx0XHRnZXRFbnRyeTogZnVuY3Rpb24gKG5hbWU6IHN0cmluZykge1xuXHRcdFx0XHRyZXR1cm4gKG9NYW5pZmVzdCBhcyBhbnkpW25hbWVdO1xuXHRcdFx0fVxuXHRcdH0pXG5cdH0gYXMgdW5rbm93biBhcyBBcHBDb21wb25lbnQ7XG5cdC8vZmFrZSBjaGFuZ2VzXG5cdGplc3Quc3B5T24oQXBwU3RvcmFnZSwgXCJsb2FkRmxleERhdGFcIikubW9ja1JldHVyblZhbHVlKFByb21pc2UucmVzb2x2ZShjaGFuZ2VzKSk7XG5cdGplc3Quc3B5T24oQ29tcG9uZW50LCBcImdldFwiKS5tb2NrUmV0dXJuVmFsdWUob0FwcENvbXBvbmVudCk7XG5cdGplc3Quc3B5T24oVXRpbHMsIFwiZ2V0QXBwQ29tcG9uZW50Rm9yQ29udHJvbFwiKS5tb2NrUmV0dXJuVmFsdWUob0FwcENvbXBvbmVudCk7XG5cdGF3YWl0IEZsZXhTdGF0ZS5pbml0aWFsaXplKHtcblx0XHRjb21wb25lbnRJZDogYXBwSWRcblx0fSk7XG5cdHJlc3VsdFhNTCA9IGF3YWl0IFhtbFByZXByb2Nlc3Nvci5wcm9jZXNzKHJlc3VsdFhNTCwgeyBuYW1lOiBcIlRlc3QgRnJhZ21lbnRcIiwgY29tcG9uZW50SWQ6IGFwcElkLCBpZDogVEVTVFZJRVdJRCB9KTtcblx0cmV0dXJuIHJlc3VsdFhNTDtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRDaGFuZ2VzRnJvbVhNTCA9ICh4bWw6IGFueSkgPT5cblx0Wy4uLnhtbC5xdWVyeVNlbGVjdG9yQWxsKFwiKlwiKV1cblx0XHQuZmxhdE1hcCgoZSkgPT4gWy4uLmUuYXR0cmlidXRlc10ubWFwKChhKSA9PiBhLm5hbWUpKVxuXHRcdC5maWx0ZXIoKGF0dHIpID0+IGF0dHIuaW5jbHVkZXMoXCJzYXAudWkuZmwuYXBwbGllZENoYW5nZXNcIikpO1xuXG5leHBvcnQgY29uc3QgZ2V0VGVtcGxhdGluZ1Jlc3VsdCA9IGFzeW5jIGZ1bmN0aW9uIChcblx0eG1sSW5wdXQ6IHN0cmluZyxcblx0c01ldGFkYXRhVXJsOiBzdHJpbmcsXG5cdG1CaW5kaW5nQ29udGV4dHM6IHsgW3g6IHN0cmluZ106IGFueTsgZW50aXR5U2V0Pzogc3RyaW5nIH0sXG5cdG1Nb2RlbHM6IHsgW3g6IHN0cmluZ106IGFueSB9LFxuXHRhVmFyaWFudERlcGVuZGVudENvbnRyb2xDaGFuZ2VzPzogYW55W10sXG5cdGNyZWF0ZUNoYW5nZXNPYmplY3Q/OiBGdW5jdGlvblxuKSB7XG5cdGNvbnN0IHRlbXBsYXRlZFhtbCA9IGA8cm9vdD4ke3htbElucHV0fTwvcm9vdD5gO1xuXHRjb25zdCBwYXJzZXIgPSBuZXcgd2luZG93LkRPTVBhcnNlcigpO1xuXHRjb25zdCB4bWxEb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHRlbXBsYXRlZFhtbCwgXCJ0ZXh0L3htbFwiKTtcblx0Ly8gVG8gZW5zdXJlIG91ciBtYWNybyBjYW4gdXNlICNzZXRCaW5kaW5nQ29udGV4dCB3ZSBlbnN1cmUgdGhlcmUgaXMgYSBwcmUgZXhpc3RpbmcgSlNPTk1vZGVsIGZvciBjb252ZXJ0ZXJDb250ZXh0XG5cdC8vIGlmIG5vdCBhbHJlYWR5IHBhc3NlZCB0byB0ZWggdGVtcGxhdGluZ1xuXG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBhd2FpdCBnZXRNZXRhTW9kZWwoc01ldGFkYXRhVXJsKTtcblx0aWYgKCFtTW9kZWxzLmhhc093blByb3BlcnR5KFwiY29udmVydGVyQ29udGV4dFwiKSkge1xuXHRcdG1Nb2RlbHMgPSBPYmplY3QuYXNzaWduKG1Nb2RlbHMsIHsgXCJjb252ZXJ0ZXJDb250ZXh0XCI6IG5ldyBUZW1wbGF0ZU1vZGVsKHt9LCBvTWV0YU1vZGVsKSB9KTtcblx0fVxuXG5cdE9iamVjdC5rZXlzKG1Nb2RlbHMpLmZvckVhY2goZnVuY3Rpb24gKHNNb2RlbE5hbWUpIHtcblx0XHRpZiAobU1vZGVsc1tzTW9kZWxOYW1lXSAmJiBtTW9kZWxzW3NNb2RlbE5hbWVdLmlzVGVtcGxhdGVNb2RlbCkge1xuXHRcdFx0bU1vZGVsc1tzTW9kZWxOYW1lXSA9IG5ldyBUZW1wbGF0ZU1vZGVsKG1Nb2RlbHNbc01vZGVsTmFtZV0uZGF0YSwgb01ldGFNb2RlbCk7XG5cdFx0fVxuXHR9KTtcblxuXHRjb25zdCBvUHJlcHJvY2Vzc29yU2V0dGluZ3M6IGFueSA9IHtcblx0XHRtb2RlbHM6IE9iamVjdC5hc3NpZ24oXG5cdFx0XHR7XG5cdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbFxuXHRcdFx0fSxcblx0XHRcdG1Nb2RlbHNcblx0XHQpLFxuXHRcdGJpbmRpbmdDb250ZXh0czoge31cblx0fTtcblxuXHQvL0luamVjdCBtb2RlbHMgYW5kIGJpbmRpbmdDb250ZXh0c1xuXHRPYmplY3Qua2V5cyhtQmluZGluZ0NvbnRleHRzKS5mb3JFYWNoKGZ1bmN0aW9uIChzS2V5KSB7XG5cdFx0LyogQXNzZXJ0IHRvIG1ha2Ugc3VyZSB0aGUgYW5ub3RhdGlvbnMgYXJlIGluIHRoZSB0ZXN0IG1ldGFkYXRhIC0+IGF2b2lkIG1pc2xlYWRpbmcgdGVzdHMgKi9cblx0XHRleHBlY3QodHlwZW9mIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KG1CaW5kaW5nQ29udGV4dHNbc0tleV0pKS50b0JlRGVmaW5lZCgpO1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG1Nb2RlbHNbc0tleV0gfHwgb01ldGFNb2RlbDtcblx0XHRvUHJlcHJvY2Vzc29yU2V0dGluZ3MuYmluZGluZ0NvbnRleHRzW3NLZXldID0gb01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG1CaW5kaW5nQ29udGV4dHNbc0tleV0pOyAvL1ZhbHVlIGlzIHNQYXRoXG5cdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzLm1vZGVsc1tzS2V5XSA9IG9Nb2RlbDtcblx0fSk7XG5cblx0Ly9UaGlzIGNvbnRleHQgZm9yIG1hY3JvIHRlc3Rpbmdcblx0aWYgKG9QcmVwcm9jZXNzb3JTZXR0aW5ncy5tb2RlbHNbXCJ0aGlzXCJdKSB7XG5cdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzLmJpbmRpbmdDb250ZXh0c1tcInRoaXNcIl0gPSBvUHJlcHJvY2Vzc29yU2V0dGluZ3MubW9kZWxzW1widGhpc1wiXS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdH1cblxuXHRsZXQgcmVzdWx0WE1MID0gYXdhaXQgWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoeG1sRG9jLmZpcnN0RWxlbWVudENoaWxkISwgeyBuYW1lOiBcIlRlc3QgRnJhZ21lbnRcIiB9LCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MpO1xuXG5cdGlmIChhVmFyaWFudERlcGVuZGVudENvbnRyb2xDaGFuZ2VzICYmIGNyZWF0ZUNoYW5nZXNPYmplY3QpIHtcblx0XHQvLyBwcmVmaXggSWRzXG5cdFx0Wy4uLnJlc3VsdFhNTC5xdWVyeVNlbGVjdG9yQWxsKFwiW2lkXVwiKV0uZm9yRWFjaCgobm9kZSkgPT4ge1xuXHRcdFx0bm9kZS5pZCA9IGAke1RFU1RWSUVXSUR9LS0ke25vZGUuaWR9YDtcblx0XHR9KTtcblx0XHQvLyBhcHBseSBmbGV4IGNoYW5nZXNcblx0XHRyZXN1bHRYTUwgPSBhd2FpdCBhcHBseUZsZXhDaGFuZ2VzKGFWYXJpYW50RGVwZW5kZW50Q29udHJvbENoYW5nZXMsIG9NZXRhTW9kZWwsIHJlc3VsdFhNTCwgY3JlYXRlQ2hhbmdlc09iamVjdCk7XG5cdFx0Ly9Bc3NlcnQgdGhhdCBhbGwgY2hhbmdlcyBoYXZlIGJlZW4gYXBwbGllZFxuXHRcdGNvbnN0IGNoYW5nZXNBcHBsaWVkID0gZ2V0Q2hhbmdlc0Zyb21YTUwocmVzdWx0WE1MKTtcblx0XHRleHBlY3QoY2hhbmdlc0FwcGxpZWQubGVuZ3RoKS50b0JlKGFWYXJpYW50RGVwZW5kZW50Q29udHJvbENoYW5nZXMubGVuZ3RoKTtcblx0fVxuXHRyZXR1cm4gcmVzdWx0WE1MO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldFRlbXBsYXRlZFhNTCA9IGFzeW5jIGZ1bmN0aW9uIChcblx0eG1sSW5wdXQ6IHN0cmluZyxcblx0c01ldGFkYXRhVXJsOiBzdHJpbmcsXG5cdG1CaW5kaW5nQ29udGV4dHM6IHsgW3g6IHN0cmluZ106IGFueTsgZW50aXR5U2V0Pzogc3RyaW5nIH0sXG5cdG1Nb2RlbHM6IHsgW3g6IHN0cmluZ106IGFueSB9LFxuXHRhVmFyaWFudERlcGVuZGVudENvbnRyb2xDaGFuZ2VzPzogYW55W10sXG5cdGNyZWF0ZUNoYW5nZXNPYmplY3Q/OiBGdW5jdGlvblxuKSB7XG5cdGNvbnN0IHRlbXBsYXRlZFhNTCA9IGF3YWl0IGdldFRlbXBsYXRpbmdSZXN1bHQoXG5cdFx0eG1sSW5wdXQsXG5cdFx0c01ldGFkYXRhVXJsLFxuXHRcdG1CaW5kaW5nQ29udGV4dHMsXG5cdFx0bU1vZGVscyxcblx0XHRhVmFyaWFudERlcGVuZGVudENvbnRyb2xDaGFuZ2VzLFxuXHRcdGNyZWF0ZUNoYW5nZXNPYmplY3Rcblx0KTtcblx0cmV0dXJuIHNlcmlhbGl6ZVhNTCh0ZW1wbGF0ZWRYTUwpO1xufTtcblxuLyoqXG4gKiBQcm9jZXNzIHRoZSByZXF1ZXN0ZWQgWE1MIGZyYWdtZW50IHdpdGggdGhlIHByb3ZpZGVkIGRhdGEuXG4gKlxuICogQHBhcmFtIG5hbWUgRnVsbHkgcXVhbGlmaWVkIG5hbWUgb2YgdGhlIGZyYWdtZW50IHRvIGJlIHRlc3RlZC5cbiAqIEBwYXJhbSB0ZXN0RGF0YSBUZXN0IGRhdGEgY29uc2lzdGluZ1xuICogQHJldHVybnMgVGVtcGxhdGVkIGZyYWdtZW50IGFzIHN0cmluZ1xuICovXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gcHJvY2Vzc0ZyYWdtZW50KG5hbWU6IHN0cmluZywgdGVzdERhdGE6IHsgW21vZGVsOiBzdHJpbmddOiBvYmplY3QgfSk6IFByb21pc2U8c3RyaW5nPiB7XG5cdGNvbnN0IGlucHV0WG1sID0gYDxyb290Pjxjb3JlOkZyYWdtZW50IGZyYWdtZW50TmFtZT1cIiR7bmFtZX1cIiB0eXBlPVwiWE1MXCIgeG1sbnM6Y29yZT1cInNhcC51aS5jb3JlXCIgLz48L3Jvb3Q+YDtcblx0Y29uc3QgcGFyc2VyID0gbmV3IHdpbmRvdy5ET01QYXJzZXIoKTtcblx0Y29uc3QgaW5wdXREb2MgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKGlucHV0WG1sLCBcInRleHQveG1sXCIpO1xuXG5cdC8vIGJ1aWxkIG1vZGVsIGFuZCBiaW5kaW5ncyBmb3IgZ2l2ZW4gdGVzdCBkYXRhXG5cdGNvbnN0IHNldHRpbmdzID0ge1xuXHRcdG1vZGVsczoge30gYXMgeyBbbmFtZTogc3RyaW5nXTogSlNPTk1vZGVsIH0sXG5cdFx0YmluZGluZ0NvbnRleHRzOiB7fSBhcyB7IFtuYW1lOiBzdHJpbmddOiBvYmplY3QgfVxuXHR9O1xuXHRmb3IgKGNvbnN0IG1vZGVsIGluIHRlc3REYXRhKSB7XG5cdFx0Y29uc3QganNvbk1vZGVsID0gbmV3IEpTT05Nb2RlbCgpO1xuXHRcdGpzb25Nb2RlbC5zZXREYXRhKHRlc3REYXRhW21vZGVsXSk7XG5cdFx0c2V0dGluZ3MubW9kZWxzW21vZGVsXSA9IGpzb25Nb2RlbDtcblx0XHRzZXR0aW5ncy5iaW5kaW5nQ29udGV4dHNbbW9kZWxdID0gc2V0dGluZ3MubW9kZWxzW21vZGVsXS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIikgYXMgQ29udGV4dDtcblx0fVxuXG5cdC8vIGV4ZWN1dGUgdGhlIHByZS1wcm9jZXNzb3Jcblx0Y29uc3QgcmVzdWx0RG9jID0gYXdhaXQgWE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoaW5wdXREb2MuZmlyc3RFbGVtZW50Q2hpbGQsIHsgbmFtZSB9LCBzZXR0aW5ncyk7XG5cblx0Ly8gZXhjbHVkZSBuZXN0ZWQgZnJhZ21lbnRzIGZyb20gdGVzdCBzbmFwc2hvdHNcblx0Y29uc3QgZnJhZ21lbnRzID0gcmVzdWx0RG9jLmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiY29yZTpGcmFnbWVudFwiKTtcblx0aWYgKGZyYWdtZW50cz8ubGVuZ3RoID4gMCkge1xuXHRcdGZvciAoY29uc3QgZnJhZ21lbnQgb2YgZnJhZ21lbnRzKSB7XG5cdFx0XHRmcmFnbWVudC5pbm5lckhUTUwgPSBcIlwiO1xuXHRcdH1cblx0fVxuXG5cdC8vIEtlZXAgdGhlIGZyYWdtZW50IHJlc3VsdCBhcyBjaGlsZCBvZiByb290IG5vZGUgd2hlbiBmcmFnbWVudCBnZW5lcmF0ZXMgbXVsdGlwbGUgcm9vdCBjb250cm9sc1xuXHRjb25zdCB4bWxSZXN1bHQgPSByZXN1bHREb2MuY2hpbGRyZW4ubGVuZ3RoID4gMSA/IHJlc3VsdERvYy5vdXRlckhUTUwgOiByZXN1bHREb2MuaW5uZXJIVE1MO1xuXG5cdHJldHVybiBmb3JtYXRYbWwoeG1sUmVzdWx0LCB7XG5cdFx0ZmlsdGVyOiAobm9kZTogYW55KSA9PiBub2RlLnR5cGUgIT09IFwiQ29tbWVudFwiXG5cdH0pO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc2VyaWFsaXplQ29udHJvbChjb250cm9sVG9TZXJpYWxpemU6IENvbnRyb2wgfCBDb250cm9sW10pIHtcblx0bGV0IHRhYkNvdW50ID0gMDtcblx0ZnVuY3Rpb24gZ2V0VGFiKHRvQWRkOiBudW1iZXIgPSAwKSB7XG5cdFx0bGV0IHRhYiA9IFwiXCI7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCB0YWJDb3VudCArIHRvQWRkOyBpKyspIHtcblx0XHRcdHRhYiArPSBcIlxcdFwiO1xuXHRcdH1cblx0XHRyZXR1cm4gdGFiO1xuXHR9XG5cdGNvbnN0IHNlcmlhbGl6ZURlbGVnYXRlID0ge1xuXHRcdHN0YXJ0OiBmdW5jdGlvbiAoY29udHJvbDogYW55LCBzQWdncmVnYXRpb25OYW1lOiBzdHJpbmcpIHtcblx0XHRcdGxldCBjb250cm9sRGV0YWlsID0gXCJcIjtcblx0XHRcdGlmIChzQWdncmVnYXRpb25OYW1lKSB7XG5cdFx0XHRcdGlmIChjb250cm9sLmdldFBhcmVudCgpKSB7XG5cdFx0XHRcdFx0Y29uc3QgaW5kZXhJblBhcmVudCA9IChjb250cm9sLmdldFBhcmVudCgpLmdldEFnZ3JlZ2F0aW9uKHNBZ2dyZWdhdGlvbk5hbWUpIGFzIE1hbmFnZWRPYmplY3RbXSk/LmluZGV4T2Y/Lihjb250cm9sKTtcblx0XHRcdFx0XHRpZiAoaW5kZXhJblBhcmVudCA+IDApIHtcblx0XHRcdFx0XHRcdGNvbnRyb2xEZXRhaWwgKz0gYCxcXG4ke2dldFRhYigpfWA7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRjb250cm9sRGV0YWlsICs9IGAke2NvbnRyb2wuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCl9KGA7XG5cdFx0XHRyZXR1cm4gY29udHJvbERldGFpbDtcblx0XHR9LFxuXHRcdGVuZDogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIFwifSlcIjtcblx0XHR9LFxuXHRcdG1pZGRsZTogZnVuY3Rpb24gKGNvbnRyb2w6IGFueSkge1xuXHRcdFx0bGV0IGRhdGEgPSBge2lkOiAke2NvbnRyb2wuZ2V0SWQoKX1gO1xuXHRcdFx0Zm9yIChjb25zdCBvQ29udHJvbEtleSBpbiBjb250cm9sLm1Qcm9wZXJ0aWVzKSB7XG5cdFx0XHRcdGlmIChjb250cm9sLm1Qcm9wZXJ0aWVzLmhhc093blByb3BlcnR5KG9Db250cm9sS2V5KSkge1xuXHRcdFx0XHRcdGRhdGEgKz0gYCxcXG4ke2dldFRhYigpfSAke29Db250cm9sS2V5fTogJHtjb250cm9sLm1Qcm9wZXJ0aWVzW29Db250cm9sS2V5XX1gO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGNvbnRyb2wubUJpbmRpbmdJbmZvcy5oYXNPd25Qcm9wZXJ0eShvQ29udHJvbEtleSkpIHtcblx0XHRcdFx0XHRjb25zdCBiaW5kaW5nRGV0YWlsID0gY29udHJvbC5tQmluZGluZ0luZm9zW29Db250cm9sS2V5XTtcblx0XHRcdFx0XHRkYXRhICs9IGAsXFxuJHtnZXRUYWIoKX0gJHtvQ29udHJvbEtleX06IGZvcm1hdHRlcigke2JpbmRpbmdEZXRhaWwucGFydHMubWFwKFxuXHRcdFx0XHRcdFx0KGJpbmRpbmdJbmZvOiBhbnkpID0+IGBcXG4ke2dldFRhYigxKX0ke2JpbmRpbmdJbmZvLm1vZGVsID8gYmluZGluZ0luZm8ubW9kZWwgOiBcIlwifT4ke2JpbmRpbmdJbmZvLnBhdGh9YFxuXHRcdFx0XHRcdCl9KWA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGZvciAoY29uc3Qgb0NvbnRyb2xLZXkgaW4gY29udHJvbC5tQXNzb2NpYXRpb25zKSB7XG5cdFx0XHRcdGlmIChjb250cm9sLm1Bc3NvY2lhdGlvbnMuaGFzT3duUHJvcGVydHkob0NvbnRyb2xLZXkpKSB7XG5cdFx0XHRcdFx0ZGF0YSArPSBgLFxcbiR7Z2V0VGFiKCl9ICR7b0NvbnRyb2xLZXl9OiAke2NvbnRyb2wubUFzc29jaWF0aW9uc1tvQ29udHJvbEtleV1bMF19YDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZGF0YSArPSBgYDtcblx0XHRcdHJldHVybiBkYXRhO1xuXHRcdH0sXG5cdFx0c3RhcnRBZ2dyZWdhdGlvbjogZnVuY3Rpb24gKGNvbnRyb2w6IGFueSwgc05hbWU6IHN0cmluZykge1xuXHRcdFx0bGV0IG91dCA9IGAsXFxuJHtnZXRUYWIoKX0ke3NOYW1lfWA7XG5cdFx0XHR0YWJDb3VudCsrO1xuXG5cdFx0XHRpZiAoY29udHJvbC5tQmluZGluZ0luZm9zW3NOYW1lXSkge1xuXHRcdFx0XHRvdXQgKz0gYD17IHBhdGg6JyR7Y29udHJvbC5tQmluZGluZ0luZm9zW3NOYW1lXS5wYXRofScsIHRlbXBsYXRlOlxcbiR7Z2V0VGFiKCl9YDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG91dCArPSBgPVtcXG4ke2dldFRhYigpfWA7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb3V0O1xuXHRcdH0sXG5cdFx0ZW5kQWdncmVnYXRpb246IGZ1bmN0aW9uIChjb250cm9sOiBhbnksIHNOYW1lOiBzdHJpbmcpIHtcblx0XHRcdHRhYkNvdW50LS07XG5cdFx0XHRpZiAoY29udHJvbC5tQmluZGluZ0luZm9zW3NOYW1lXSkge1xuXHRcdFx0XHRyZXR1cm4gYFxcbiR7Z2V0VGFiKCl9fWA7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gYFxcbiR7Z2V0VGFiKCl9XWA7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXHRpZiAoQXJyYXkuaXNBcnJheShjb250cm9sVG9TZXJpYWxpemUpKSB7XG5cdFx0cmV0dXJuIGNvbnRyb2xUb1NlcmlhbGl6ZS5tYXAoKGNvbnRyb2xUb1JlbmRlcjogQ29udHJvbCkgPT4ge1xuXHRcdFx0cmV0dXJuIG5ldyBTZXJpYWxpemVyKGNvbnRyb2xUb1JlbmRlciwgc2VyaWFsaXplRGVsZWdhdGUpLnNlcmlhbGl6ZSgpO1xuXHRcdH0pO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBuZXcgU2VyaWFsaXplcihjb250cm9sVG9TZXJpYWxpemUsIHNlcmlhbGl6ZURlbGVnYXRlKS5zZXJpYWxpemUoKTtcblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQXdhaXRlcigpIHtcblx0bGV0IGZuUmVzb2x2ZSE6IEZ1bmN0aW9uO1xuXHRjb25zdCBteVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdGZuUmVzb2x2ZSA9IHJlc29sdmU7XG5cdH0pO1xuXHRyZXR1cm4geyBwcm9taXNlOiBteVByb21pc2UsIHJlc29sdmU6IGZuUmVzb2x2ZSB9O1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQTRiQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQU5BLElBT3NCQSxlQUFlLGFBQUNDLElBQVksRUFBRUMsUUFBcUM7SUFBQSxJQUFtQjtNQUMzRyxJQUFNQyxRQUFRLGlEQUF5Q0YsSUFBSSx5REFBaUQ7TUFDNUcsSUFBTUcsTUFBTSxHQUFHLElBQUlDLE1BQU0sQ0FBQ0MsU0FBUyxFQUFFO01BQ3JDLElBQU1DLFFBQVEsR0FBR0gsTUFBTSxDQUFDSSxlQUFlLENBQUNMLFFBQVEsRUFBRSxVQUFVLENBQUM7O01BRTdEO01BQ0EsSUFBTU0sUUFBUSxHQUFHO1FBQ2hCQyxNQUFNLEVBQUUsQ0FBQyxDQUFrQztRQUMzQ0MsZUFBZSxFQUFFLENBQUM7TUFDbkIsQ0FBQztNQUNELEtBQUssSUFBTUMsT0FBSyxJQUFJVixRQUFRLEVBQUU7UUFDN0IsSUFBTVcsU0FBUyxHQUFHLElBQUlDLFNBQVMsRUFBRTtRQUNqQ0QsU0FBUyxDQUFDRSxPQUFPLENBQUNiLFFBQVEsQ0FBQ1UsT0FBSyxDQUFDLENBQUM7UUFDbENILFFBQVEsQ0FBQ0MsTUFBTSxDQUFDRSxPQUFLLENBQUMsR0FBR0MsU0FBUztRQUNsQ0osUUFBUSxDQUFDRSxlQUFlLENBQUNDLE9BQUssQ0FBQyxHQUFHSCxRQUFRLENBQUNDLE1BQU0sQ0FBQ0UsT0FBSyxDQUFDLENBQUNJLG9CQUFvQixDQUFDLEdBQUcsQ0FBWTtNQUM5Rjs7TUFFQTtNQUFBLHVCQUN3QkMsZUFBZSxDQUFDQyxPQUFPLENBQUNYLFFBQVEsQ0FBQ1ksaUJBQWlCLEVBQUU7UUFBRWxCLElBQUksRUFBSkE7TUFBSyxDQUFDLEVBQUVRLFFBQVEsQ0FBQyxp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