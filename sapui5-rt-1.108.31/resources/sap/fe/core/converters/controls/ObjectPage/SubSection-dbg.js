/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/controls/ObjectPage/HeaderFacet", "sap/fe/core/converters/helpers/IssueManager", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/PropertyHelper", "../../helpers/ConfigurableObject", "../../helpers/ID", "../../ManifestSettings", "../../objectPage/FormMenuActions", "../Common/DataVisualization", "../Common/Form"], function (Log, Action, HeaderFacet, IssueManager, Key, BindingToolkit, PropertyHelper, ConfigurableObject, ID, ManifestSettings, FormMenuActions, DataVisualization, Form) {
  "use strict";

  var _exports = {};
  var isReferenceFacet = Form.isReferenceFacet;
  var createFormDefinition = Form.createFormDefinition;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  var getVisibilityEnablementFormMenuActions = FormMenuActions.getVisibilityEnablementFormMenuActions;
  var getFormHiddenActions = FormMenuActions.getFormHiddenActions;
  var getFormActions = FormMenuActions.getFormActions;
  var ActionType = ManifestSettings.ActionType;
  var getSubSectionID = ID.getSubSectionID;
  var getSideContentID = ID.getSideContentID;
  var getFormID = ID.getFormID;
  var getCustomSubSectionID = ID.getCustomSubSectionID;
  var Placement = ConfigurableObject.Placement;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var isPathExpression = PropertyHelper.isPathExpression;
  var ref = BindingToolkit.ref;
  var pathInModel = BindingToolkit.pathInModel;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var fn = BindingToolkit.fn;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var KeyHelper = Key.KeyHelper;
  var IssueType = IssueManager.IssueType;
  var IssueSeverity = IssueManager.IssueSeverity;
  var IssueCategory = IssueManager.IssueCategory;
  var getStashedSettingsForHeaderFacet = HeaderFacet.getStashedSettingsForHeaderFacet;
  var getHeaderFacetsFromManifest = HeaderFacet.getHeaderFacetsFromManifest;
  var getDesignTimeMetadataSettingsForHeaderFacet = HeaderFacet.getDesignTimeMetadataSettingsForHeaderFacet;
  var removeDuplicateActions = Action.removeDuplicateActions;
  var isActionNavigable = Action.isActionNavigable;
  var getSemanticObjectMapping = Action.getSemanticObjectMapping;
  var getEnabledForAnnotationAction = Action.getEnabledForAnnotationAction;
  var getActionsFromManifest = Action.getActionsFromManifest;
  var ButtonType = Action.ButtonType;
  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  var SubSectionType;
  (function (SubSectionType) {
    SubSectionType["Unknown"] = "Unknown";
    SubSectionType["Form"] = "Form";
    SubSectionType["DataVisualization"] = "DataVisualization";
    SubSectionType["XMLFragment"] = "XMLFragment";
    SubSectionType["Placeholder"] = "Placeholder";
    SubSectionType["Mixed"] = "Mixed";
  })(SubSectionType || (SubSectionType = {}));
  _exports.SubSectionType = SubSectionType;
  var visualizationTerms = ["com.sap.vocabularies.UI.v1.LineItem", "com.sap.vocabularies.UI.v1.Chart", "com.sap.vocabularies.UI.v1.PresentationVariant", "com.sap.vocabularies.UI.v1.SelectionPresentationVariant"];

  /**
   * Create subsections based on facet definition.
   *
   * @param facetCollection Collection of facets
   * @param converterContext The converter context
   * @param isHeaderSection True if header section is generated in this iteration
   * @returns The current subsections
   */
  function createSubSections(facetCollection, converterContext, isHeaderSection) {
    // First we determine which sub section we need to create
    var facetsToCreate = facetCollection.reduce(function (facetsToCreate, facetDefinition) {
      switch (facetDefinition.$Type) {
        case "com.sap.vocabularies.UI.v1.ReferenceFacet":
          facetsToCreate.push(facetDefinition);
          break;
        case "com.sap.vocabularies.UI.v1.CollectionFacet":
          // TODO If the Collection Facet has a child of type Collection Facet we bring them up one level (Form + Table use case) ?
          // first case facet Collection is combination of collection and reference facet or not all facets are reference facets.
          if (facetDefinition.Facets.find(function (facetType) {
            return facetType.$Type === "com.sap.vocabularies.UI.v1.CollectionFacet";
          })) {
            facetsToCreate.splice.apply(facetsToCreate, [facetsToCreate.length, 0].concat(_toConsumableArray(facetDefinition.Facets)));
          } else {
            facetsToCreate.push(facetDefinition);
          }
          break;
        case "com.sap.vocabularies.UI.v1.ReferenceURLFacet":
          // Not supported
          break;
      }
      return facetsToCreate;
    }, []);

    // Then we create the actual subsections
    return facetsToCreate.map(function (facet) {
      var _Facets;
      return createSubSection(facet, facetsToCreate, converterContext, 0, !(facet !== null && facet !== void 0 && (_Facets = facet.Facets) !== null && _Facets !== void 0 && _Facets.length), isHeaderSection);
    });
  }

  /**
   * Creates subsections based on the definition of the custom header facet.
   *
   * @param converterContext The converter context
   * @returns The current subsections
   */
  _exports.createSubSections = createSubSections;
  function createCustomHeaderFacetSubSections(converterContext) {
    var customHeaderFacets = getHeaderFacetsFromManifest(converterContext.getManifestWrapper().getHeaderFacets());
    var aCustomHeaderFacets = [];
    Object.keys(customHeaderFacets).forEach(function (key) {
      aCustomHeaderFacets.push(customHeaderFacets[key]);
      return aCustomHeaderFacets;
    });
    var facetsToCreate = aCustomHeaderFacets.reduce(function (facetsToCreate, customHeaderFacet) {
      if (customHeaderFacet.templateEdit) {
        facetsToCreate.push(customHeaderFacet);
      }
      return facetsToCreate;
    }, []);
    return facetsToCreate.map(function (customHeaderFacet) {
      return createCustomHeaderFacetSubSection(customHeaderFacet);
    });
  }

  /**
   * Creates a subsection based on a custom header facet.
   *
   * @param customHeaderFacet A custom header facet
   * @returns A definition for a subsection
   */
  _exports.createCustomHeaderFacetSubSections = createCustomHeaderFacetSubSections;
  function createCustomHeaderFacetSubSection(customHeaderFacet) {
    var subSectionID = getCustomSubSectionID(customHeaderFacet.key);
    var subSection = {
      id: subSectionID,
      key: customHeaderFacet.key,
      title: customHeaderFacet.title,
      type: SubSectionType.XMLFragment,
      template: customHeaderFacet.templateEdit || "",
      visible: customHeaderFacet.visible,
      level: 1,
      sideContent: undefined,
      stashed: customHeaderFacet.stashed,
      flexSettings: customHeaderFacet.flexSettings,
      actions: {}
    };
    return subSection;
  }

  // function isTargetForCompliant(annotationPath: AnnotationPath) {
  // 	return /.*com\.sap\.vocabularies\.UI\.v1\.(FieldGroup|Identification|DataPoint|StatusInfo).*/.test(annotationPath.value);
  // }
  var getSubSectionKey = function (facetDefinition, fallback) {
    var _facetDefinition$ID, _facetDefinition$Labe;
    return ((_facetDefinition$ID = facetDefinition.ID) === null || _facetDefinition$ID === void 0 ? void 0 : _facetDefinition$ID.toString()) || ((_facetDefinition$Labe = facetDefinition.Label) === null || _facetDefinition$Labe === void 0 ? void 0 : _facetDefinition$Labe.toString()) || fallback;
  };
  /**
   * Adds Form menu action to all form actions, removes duplicate actions and hidden actions.
   *
   * @param actions The actions involved
   * @param facetDefinition The definition for the facet
   * @param converterContext The converter context
   * @returns The form menu actions
   */
  function addFormMenuActions(actions, facetDefinition, converterContext) {
    var hiddenActions = getFormHiddenActions(facetDefinition, converterContext) || [],
      formActions = getFormActions(facetDefinition, converterContext),
      manifestActions = getActionsFromManifest(formActions, converterContext, actions, undefined, undefined, hiddenActions),
      formAllActions = insertCustomElements(actions, manifestActions.actions, {
        command: "overwrite"
      });
    return {
      "actions": formAllActions ? getVisibilityEnablementFormMenuActions(removeDuplicateActions(formAllActions)) : actions,
      "commandActions": manifestActions.commandActions
    };
  }

  /**
   * Retrieves the action form a facet.
   *
   * @param facetDefinition
   * @param converterContext
   * @returns The current facet actions
   */
  function getFacetActions(facetDefinition, converterContext) {
    var actions = new Array();
    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        actions = facetDefinition.Facets.filter(function (subFacetDefinition) {
          return isReferenceFacet(subFacetDefinition);
        }).reduce(function (actionReducer, referenceFacet) {
          return createFormActionReducer(actionReducer, referenceFacet, converterContext);
        }, []);
        break;
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        actions = createFormActionReducer([], facetDefinition, converterContext);
        break;
      default:
        break;
    }
    return addFormMenuActions(actions, facetDefinition, converterContext);
  }
  /**
   * Returns the button type based on @UI.Emphasized annotation.
   *
   * @param emphasized Emphasized annotation value.
   * @returns The button type or path based expression.
   */
  function getButtonType(emphasized) {
    // Emphasized is a boolean so if it's equal to true we show the button as Ghost, otherwise as Transparent
    var buttonTypeCondition = equal(getExpressionFromAnnotation(emphasized), true);
    return compileExpression(ifElse(buttonTypeCondition, ButtonType.Ghost, ButtonType.Transparent));
  }

  /**
   * Create a subsection based on FacetTypes.
   *
   * @param facetDefinition
   * @param facetsToCreate
   * @param converterContext
   * @param level
   * @param hasSingleContent
   * @param isHeaderSection
   * @returns A subsection definition
   */
  function createSubSection(facetDefinition, facetsToCreate, converterContext, level, hasSingleContent, isHeaderSection) {
    var _facetDefinition$anno, _facetDefinition$anno2, _presentation$visuali, _presentation$visuali2, _presentation$visuali3;
    var subSectionID = getSubSectionID({
      Facet: facetDefinition
    });
    var oHiddenAnnotation = (_facetDefinition$anno = facetDefinition.annotations) === null || _facetDefinition$anno === void 0 ? void 0 : (_facetDefinition$anno2 = _facetDefinition$anno.UI) === null || _facetDefinition$anno2 === void 0 ? void 0 : _facetDefinition$anno2.Hidden;
    var isVisibleExpression = not(equal(true, getExpressionFromAnnotation(oHiddenAnnotation)));
    var isVisible = compileExpression(isVisibleExpression);
    var isDynamicExpression = isVisible !== undefined && typeof isVisible === "string" && isVisible.indexOf("{=") === 0 && !isPathExpression(oHiddenAnnotation);
    var isVisibleDynamicExpression = isVisible && isDynamicExpression ? isVisible.substring(isVisible.indexOf("{=") + 2, isVisible.lastIndexOf("}")) !== undefined : false;
    var title = compileExpression(getExpressionFromAnnotation(facetDefinition.Label));
    var subSection = {
      id: subSectionID,
      key: getSubSectionKey(facetDefinition, subSectionID),
      title: title,
      type: SubSectionType.Unknown,
      annotationPath: converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName),
      visible: isVisible,
      isVisibilityDynamic: isDynamicExpression,
      level: level,
      sideContent: undefined
    };
    if (isHeaderSection) {
      subSection.stashed = getStashedSettingsForHeaderFacet(facetDefinition, facetDefinition, converterContext);
      subSection.flexSettings = {
        designtime: getDesignTimeMetadataSettingsForHeaderFacet(facetDefinition, facetDefinition, converterContext)
      };
    }
    var unsupportedText = "";
    level++;
    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        var facets = facetDefinition.Facets;

        // Filter for all facets of this subsection that are referring to an annotation describing a visualization (e.g. table or chart)
        var visualizationFacets = facets.map(function (facet, index) {
          return {
            index: index,
            facet: facet
          };
        }) // Remember the index assigned to each facet
        .filter(function (_ref) {
          var _Target, _Target$$target;
          var facet = _ref.facet;
          return visualizationTerms.includes((_Target = facet.Target) === null || _Target === void 0 ? void 0 : (_Target$$target = _Target.$target) === null || _Target$$target === void 0 ? void 0 : _Target$$target.term);
        });

        // Filter out all visualization facets; "visualizationFacets" and "nonVisualizationFacets" are disjoint
        var nonVisualizationFacets = facets.filter(function (facet) {
          return !visualizationFacets.find(function (visualization) {
            return visualization.facet === facet;
          });
        });
        if (visualizationFacets.length > 0) {
          // CollectionFacets with visualizations must be handled separately as they cannot be included in forms
          var visualizationContent = [];
          var formContent = [];
          var mixedContent = [];

          // Create each visualization facet as if it was its own subsection (via recursion), and keep their relative ordering
          var _iterator = _createForOfIteratorHelper(visualizationFacets),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var facet = _step.value.facet;
              visualizationContent.push(createSubSection(facet, [], converterContext, level, true, isHeaderSection));
            }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          if (nonVisualizationFacets.length > 0) {
            // This subsection includes visualizations and other content, so it is a "Mixed" subsection
            Log.warning("Warning: CollectionFacet '".concat(facetDefinition.ID, "' includes a combination of either a chart or a table and other content. This can lead to rendering issues. Consider moving the chart or table into a separate CollectionFacet."));
            facetDefinition.Facets = nonVisualizationFacets;
            // Create a joined form of all facets that are not referring to visualizations
            formContent.push(createSubSection(facetDefinition, [], converterContext, level, hasSingleContent, isHeaderSection));
          }

          // Merge the visualization content with the form content
          if (visualizationFacets.find(function (_ref2) {
            var index = _ref2.index;
            return index === 0;
          })) {
            // If the first facet is a visualization, display the visualizations first
            mixedContent.push.apply(mixedContent, visualizationContent);
            mixedContent.push.apply(mixedContent, formContent);
          } else {
            // Otherwise, display the form first
            mixedContent.push.apply(mixedContent, formContent);
            mixedContent.push.apply(mixedContent, visualizationContent);
          }
          var mixedSubSection = _objectSpread(_objectSpread({}, subSection), {}, {
            type: SubSectionType.Mixed,
            level: level,
            content: mixedContent
          });
          return mixedSubSection;
        } else {
          // This CollectionFacet only includes content that can be rendered in a merged form
          var facetActions = getFacetActions(facetDefinition, converterContext),
            formCollectionSubSection = _objectSpread(_objectSpread({}, subSection), {}, {
              type: SubSectionType.Form,
              formDefinition: createFormDefinition(facetDefinition, isVisible, converterContext, facetActions.actions),
              level: level,
              actions: facetActions.actions.filter(function (action) {
                return action.facetName === undefined;
              }),
              commandActions: facetActions.commandActions
            });
          return formCollectionSubSection;
        }
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        if (!facetDefinition.Target.$target) {
          unsupportedText = "Unable to find annotationPath ".concat(facetDefinition.Target.value);
        } else {
          switch (facetDefinition.Target.$target.term) {
            case "com.sap.vocabularies.UI.v1.LineItem":
            case "com.sap.vocabularies.UI.v1.Chart":
            case "com.sap.vocabularies.UI.v1.PresentationVariant":
            case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
              var presentation = getDataVisualizationConfiguration(facetDefinition.Target.value, getCondensedTableLayoutCompliance(facetDefinition, facetsToCreate, converterContext), converterContext, undefined, isHeaderSection);
              var controlTitle = ((_presentation$visuali = presentation.visualizations[0]) === null || _presentation$visuali === void 0 ? void 0 : (_presentation$visuali2 = _presentation$visuali.annotation) === null || _presentation$visuali2 === void 0 ? void 0 : _presentation$visuali2.title) || ((_presentation$visuali3 = presentation.visualizations[0]) === null || _presentation$visuali3 === void 0 ? void 0 : _presentation$visuali3.title);
              var showTitle = isSubsectionTitleShown(hasSingleContent, subSection.title, controlTitle);

              // Either calculate the title visibility statically or dynamically
              // Additionally to checking whether a title exists,
              // we also need to check that the facet title is not the same as the control (i.e. visualization) title;
              // this is done by including "showTitle" in the and expression
              var titleVisible = ifElse(isDynamicExpression, and(isVisibleDynamicExpression, not(equal(title, "undefined")), showTitle), and(isVisible !== undefined, title !== "undefined", title !== undefined, isVisibleExpression, showTitle));
              var dataVisualizationSubSection = _objectSpread(_objectSpread({}, subSection), {}, {
                type: SubSectionType.DataVisualization,
                level: level,
                presentation: presentation,
                showTitle: showTitle,
                // This is used on the ObjectPageSubSection
                titleVisible: compileExpression(titleVisible) // This is used to hide the actual Title control
              });

              return dataVisualizationSubSection;
            case "com.sap.vocabularies.UI.v1.FieldGroup":
            case "com.sap.vocabularies.UI.v1.Identification":
            case "com.sap.vocabularies.UI.v1.DataPoint":
            case "com.sap.vocabularies.UI.v1.StatusInfo":
            case "com.sap.vocabularies.Communication.v1.Contact":
              // All those element belong to a form facet
              var _facetActions = getFacetActions(facetDefinition, converterContext),
                formElementSubSection = _objectSpread(_objectSpread({}, subSection), {}, {
                  type: SubSectionType.Form,
                  level: level,
                  formDefinition: createFormDefinition(facetDefinition, isVisible, converterContext, _facetActions.actions),
                  actions: _facetActions.actions.filter(function (action) {
                    return action.facetName === undefined;
                  }),
                  commandActions: _facetActions.commandActions
                });
              return formElementSubSection;
            default:
              unsupportedText = "For ".concat(facetDefinition.Target.$target.term, " Fragment");
              break;
          }
        }
        break;
      case "com.sap.vocabularies.UI.v1.ReferenceURLFacet":
        unsupportedText = "For Reference URL Facet";
        break;
      default:
        break;
    }
    // If we reach here we ended up with an unsupported SubSection type
    var unsupportedSubSection = _objectSpread(_objectSpread({}, subSection), {}, {
      text: unsupportedText
    });
    return unsupportedSubSection;
  }
  _exports.createSubSection = createSubSection;
  function isSubsectionTitleShown(hasSingleContent, subSectionTitle, controlTitle) {
    if (hasSingleContent && controlTitle === subSectionTitle) {
      return false;
    }
    return true;
  }
  function createFormActionReducer(actions, facetDefinition, converterContext) {
    var referenceTarget = facetDefinition.Target.$target;
    var targetValue = facetDefinition.Target.value;
    var manifestActions = {};
    var dataFieldCollection = [];
    var _targetValue$split = targetValue.split("@"),
      _targetValue$split2 = _slicedToArray(_targetValue$split, 1),
      navigationPropertyPath = _targetValue$split2[0];
    if (navigationPropertyPath.length > 0) {
      if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
        navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
      }
    } else {
      navigationPropertyPath = undefined;
    }
    if (referenceTarget) {
      switch (referenceTarget.term) {
        case "com.sap.vocabularies.UI.v1.FieldGroup":
          dataFieldCollection = referenceTarget.Data;
          manifestActions = getActionsFromManifest(converterContext.getManifestControlConfiguration(referenceTarget).actions, converterContext, undefined, undefined, undefined, undefined, facetDefinition.fullyQualifiedName).actions;
          break;
        case "com.sap.vocabularies.UI.v1.Identification":
        case "com.sap.vocabularies.UI.v1.StatusInfo":
          if (referenceTarget.qualifier) {
            dataFieldCollection = referenceTarget;
          }
          break;
        default:
          break;
      }
    }
    actions = dataFieldCollection.reduce(function (actionReducer, dataField) {
      var _dataField$RequiresCo, _dataField$Inline, _dataField$Determinin, _dataField$Label, _dataField$Navigation, _dataField$annotation, _dataField$annotation2, _dataField$annotation3, _dataField$annotation4, _dataField$annotation5, _dataField$Label2, _dataField$annotation6, _dataField$annotation7, _dataField$annotation8, _dataField$annotation9, _dataField$annotation10;
      switch (dataField.$Type) {
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          if (((_dataField$RequiresCo = dataField.RequiresContext) === null || _dataField$RequiresCo === void 0 ? void 0 : _dataField$RequiresCo.valueOf()) === true) {
            converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Low, IssueType.MALFORMED_DATAFIELD_FOR_IBN.REQUIRESCONTEXT);
          }
          if (((_dataField$Inline = dataField.Inline) === null || _dataField$Inline === void 0 ? void 0 : _dataField$Inline.valueOf()) === true) {
            converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Low, IssueType.MALFORMED_DATAFIELD_FOR_IBN.INLINE);
          }
          if (((_dataField$Determinin = dataField.Determining) === null || _dataField$Determinin === void 0 ? void 0 : _dataField$Determinin.valueOf()) === true) {
            converterContext.getDiagnostics().addIssue(IssueCategory.Annotation, IssueSeverity.Low, IssueType.MALFORMED_DATAFIELD_FOR_IBN.DETERMINING);
          }
          var mNavigationParameters = {};
          if (dataField.Mapping) {
            mNavigationParameters.semanticObjectMapping = getSemanticObjectMapping(dataField.Mapping);
          }
          actionReducer.push({
            type: ActionType.DataFieldForIntentBasedNavigation,
            id: getFormID({
              Facet: facetDefinition
            }, dataField),
            key: KeyHelper.generateKeyFromDataField(dataField),
            text: (_dataField$Label = dataField.Label) === null || _dataField$Label === void 0 ? void 0 : _dataField$Label.toString(),
            annotationPath: "",
            enabled: dataField.NavigationAvailable !== undefined ? compileExpression(equal(getExpressionFromAnnotation((_dataField$Navigation = dataField.NavigationAvailable) === null || _dataField$Navigation === void 0 ? void 0 : _dataField$Navigation.valueOf()), true)) : "true",
            visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.Hidden) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()), true))),
            buttonType: getButtonType((_dataField$annotation4 = dataField.annotations) === null || _dataField$annotation4 === void 0 ? void 0 : (_dataField$annotation5 = _dataField$annotation4.UI) === null || _dataField$annotation5 === void 0 ? void 0 : _dataField$annotation5.Emphasized),
            press: compileExpression(fn("._intentBasedNavigation.navigate", [getExpressionFromAnnotation(dataField.SemanticObject), getExpressionFromAnnotation(dataField.Action), mNavigationParameters])),
            customData: compileExpression({
              semanticObject: getExpressionFromAnnotation(dataField.SemanticObject),
              action: getExpressionFromAnnotation(dataField.Action)
            })
          });
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
          var formManifestActionsConfiguration = converterContext.getManifestControlConfiguration(referenceTarget).actions;
          var key = KeyHelper.generateKeyFromDataField(dataField);
          actionReducer.push({
            type: ActionType.DataFieldForAction,
            id: getFormID({
              Facet: facetDefinition
            }, dataField),
            key: key,
            text: (_dataField$Label2 = dataField.Label) === null || _dataField$Label2 === void 0 ? void 0 : _dataField$Label2.toString(),
            annotationPath: "",
            enabled: getEnabledForAnnotationAction(converterContext, dataField.ActionTarget),
            binding: navigationPropertyPath ? "{ 'path' : '".concat(navigationPropertyPath, "'}") : undefined,
            visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation6 = dataField.annotations) === null || _dataField$annotation6 === void 0 ? void 0 : (_dataField$annotation7 = _dataField$annotation6.UI) === null || _dataField$annotation7 === void 0 ? void 0 : (_dataField$annotation8 = _dataField$annotation7.Hidden) === null || _dataField$annotation8 === void 0 ? void 0 : _dataField$annotation8.valueOf()), true))),
            requiresDialog: isDialog(dataField.ActionTarget),
            buttonType: getButtonType((_dataField$annotation9 = dataField.annotations) === null || _dataField$annotation9 === void 0 ? void 0 : (_dataField$annotation10 = _dataField$annotation9.UI) === null || _dataField$annotation10 === void 0 ? void 0 : _dataField$annotation10.Emphasized),
            press: compileExpression(fn("invokeAction", [dataField.Action, {
              contexts: fn("getBindingContext", [], pathInModel("", "$source")),
              invocationGrouping: dataField.InvocationGrouping === "UI.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated",
              label: getExpressionFromAnnotation(dataField.Label),
              model: fn("getModel", [], pathInModel("/", "$source")),
              isNavigable: isActionNavigable(formManifestActionsConfiguration && formManifestActionsConfiguration[key])
            }], ref(".editFlow"))),
            facetName: dataField.Inline ? facetDefinition.fullyQualifiedName : undefined
          });
          break;
        default:
          break;
      }
      return actionReducer;
    }, actions);
    return insertCustomElements(actions, manifestActions);
  }
  function isDialog(actionDefinition) {
    if (actionDefinition) {
      var _actionDefinition$ann, _actionDefinition$ann2;
      var bCritical = (_actionDefinition$ann = actionDefinition.annotations) === null || _actionDefinition$ann === void 0 ? void 0 : (_actionDefinition$ann2 = _actionDefinition$ann.Common) === null || _actionDefinition$ann2 === void 0 ? void 0 : _actionDefinition$ann2.IsActionCritical;
      if (actionDefinition.parameters.length > 1 || bCritical) {
        return "Dialog";
      } else {
        return "None";
      }
    } else {
      return "None";
    }
  }
  _exports.isDialog = isDialog;
  function createCustomSubSections(manifestSubSections, converterContext) {
    var subSections = {};
    Object.keys(manifestSubSections).forEach(function (subSectionKey) {
      return subSections[subSectionKey] = createCustomSubSection(manifestSubSections[subSectionKey], subSectionKey, converterContext);
    });
    return subSections;
  }
  _exports.createCustomSubSections = createCustomSubSections;
  function createCustomSubSection(manifestSubSection, subSectionKey, converterContext) {
    var sideContent = manifestSubSection.sideContent ? {
      template: manifestSubSection.sideContent.template,
      id: getSideContentID(subSectionKey),
      visible: false,
      equalSplit: manifestSubSection.sideContent.equalSplit
    } : undefined;
    var position = manifestSubSection.position;
    if (!position) {
      position = {
        placement: Placement.After
      };
    }
    var isVisible = manifestSubSection.visible !== undefined ? manifestSubSection.visible : true;
    var isDynamicExpression = isVisible && typeof isVisible === "string" && isVisible.indexOf("{=") === 0;
    var manifestActions = getActionsFromManifest(manifestSubSection.actions, converterContext);
    var subSectionDefinition = {
      type: SubSectionType.Unknown,
      id: manifestSubSection.id || getCustomSubSectionID(subSectionKey),
      actions: manifestActions.actions,
      key: subSectionKey,
      title: manifestSubSection.title,
      level: 1,
      position: position,
      visible: manifestSubSection.visible !== undefined ? manifestSubSection.visible : true,
      sideContent: sideContent,
      isVisibilityDynamic: isDynamicExpression
    };
    if (manifestSubSection.template || manifestSubSection.name) {
      subSectionDefinition.type = SubSectionType.XMLFragment;
      subSectionDefinition.template = manifestSubSection.template || manifestSubSection.name || "";
    } else {
      subSectionDefinition.type = SubSectionType.Placeholder;
    }
    return subSectionDefinition;
  }

  /**
   * Evaluate if the condensed mode can be appli3ed on the table.
   *
   * @param currentFacet
   * @param facetsToCreateInSection
   * @param converterContext
   * @returns `true` for compliant, false otherwise
   */
  _exports.createCustomSubSection = createCustomSubSection;
  function getCondensedTableLayoutCompliance(currentFacet, facetsToCreateInSection, converterContext) {
    var manifestWrapper = converterContext.getManifestWrapper();
    if (manifestWrapper.useIconTabBar()) {
      // If the OP use the tab based we check if the facets that will be created for this section are all non visible
      return hasNoOtherVisibleTableInTargets(currentFacet, facetsToCreateInSection);
    } else {
      var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3, _entityType$annotatio4, _entityType$annotatio5, _entityType$annotatio6;
      var entityType = converterContext.getEntityType();
      if ((_entityType$annotatio = entityType.annotations) !== null && _entityType$annotatio !== void 0 && (_entityType$annotatio2 = _entityType$annotatio.UI) !== null && _entityType$annotatio2 !== void 0 && (_entityType$annotatio3 = _entityType$annotatio2.Facets) !== null && _entityType$annotatio3 !== void 0 && _entityType$annotatio3.length && ((_entityType$annotatio4 = entityType.annotations) === null || _entityType$annotatio4 === void 0 ? void 0 : (_entityType$annotatio5 = _entityType$annotatio4.UI) === null || _entityType$annotatio5 === void 0 ? void 0 : (_entityType$annotatio6 = _entityType$annotatio5.Facets) === null || _entityType$annotatio6 === void 0 ? void 0 : _entityType$annotatio6.length) > 1) {
        return hasNoOtherVisibleTableInTargets(currentFacet, facetsToCreateInSection);
      } else {
        return true;
      }
    }
  }
  function hasNoOtherVisibleTableInTargets(currentFacet, facetsToCreateInSection) {
    return facetsToCreateInSection.every(function (subFacet) {
      if (subFacet !== currentFacet) {
        if (subFacet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
          var _refFacet$Target, _refFacet$Target$$tar, _refFacet$Target2, _refFacet$Target2$$ta, _refFacet$Target$$tar2;
          var refFacet = subFacet;
          if (((_refFacet$Target = refFacet.Target) === null || _refFacet$Target === void 0 ? void 0 : (_refFacet$Target$$tar = _refFacet$Target.$target) === null || _refFacet$Target$$tar === void 0 ? void 0 : _refFacet$Target$$tar.term) === "com.sap.vocabularies.UI.v1.LineItem" || ((_refFacet$Target2 = refFacet.Target) === null || _refFacet$Target2 === void 0 ? void 0 : (_refFacet$Target2$$ta = _refFacet$Target2.$target) === null || _refFacet$Target2$$ta === void 0 ? void 0 : _refFacet$Target2$$ta.term) === "com.sap.vocabularies.UI.v1.PresentationVariant" || ((_refFacet$Target$$tar2 = refFacet.Target.$target) === null || _refFacet$Target$$tar2 === void 0 ? void 0 : _refFacet$Target$$tar2.term) === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
            var _refFacet$annotations, _refFacet$annotations2, _refFacet$annotations3, _refFacet$annotations4;
            return ((_refFacet$annotations = refFacet.annotations) === null || _refFacet$annotations === void 0 ? void 0 : (_refFacet$annotations2 = _refFacet$annotations.UI) === null || _refFacet$annotations2 === void 0 ? void 0 : _refFacet$annotations2.Hidden) !== undefined ? (_refFacet$annotations3 = refFacet.annotations) === null || _refFacet$annotations3 === void 0 ? void 0 : (_refFacet$annotations4 = _refFacet$annotations3.UI) === null || _refFacet$annotations4 === void 0 ? void 0 : _refFacet$annotations4.Hidden : false;
          }
          return true;
        } else {
          var subCollectionFacet = subFacet;
          return subCollectionFacet.Facets.every(function (facet) {
            var _subRefFacet$Target, _subRefFacet$Target$$, _subRefFacet$Target2, _subRefFacet$Target2$, _subRefFacet$Target3, _subRefFacet$Target3$;
            var subRefFacet = facet;
            if (((_subRefFacet$Target = subRefFacet.Target) === null || _subRefFacet$Target === void 0 ? void 0 : (_subRefFacet$Target$$ = _subRefFacet$Target.$target) === null || _subRefFacet$Target$$ === void 0 ? void 0 : _subRefFacet$Target$$.term) === "com.sap.vocabularies.UI.v1.LineItem" || ((_subRefFacet$Target2 = subRefFacet.Target) === null || _subRefFacet$Target2 === void 0 ? void 0 : (_subRefFacet$Target2$ = _subRefFacet$Target2.$target) === null || _subRefFacet$Target2$ === void 0 ? void 0 : _subRefFacet$Target2$.term) === "com.sap.vocabularies.UI.v1.PresentationVariant" || ((_subRefFacet$Target3 = subRefFacet.Target) === null || _subRefFacet$Target3 === void 0 ? void 0 : (_subRefFacet$Target3$ = _subRefFacet$Target3.$target) === null || _subRefFacet$Target3$ === void 0 ? void 0 : _subRefFacet$Target3$.term) === "com.sap.vocabularies.UI.v1.SelectionPresentationVariant") {
              var _subRefFacet$annotati, _subRefFacet$annotati2, _subRefFacet$annotati3, _subRefFacet$annotati4;
              return ((_subRefFacet$annotati = subRefFacet.annotations) === null || _subRefFacet$annotati === void 0 ? void 0 : (_subRefFacet$annotati2 = _subRefFacet$annotati.UI) === null || _subRefFacet$annotati2 === void 0 ? void 0 : _subRefFacet$annotati2.Hidden) !== undefined ? (_subRefFacet$annotati3 = subRefFacet.annotations) === null || _subRefFacet$annotati3 === void 0 ? void 0 : (_subRefFacet$annotati4 = _subRefFacet$annotati3.UI) === null || _subRefFacet$annotati4 === void 0 ? void 0 : _subRefFacet$annotati4.Hidden : false;
            }
            return true;
          });
        }
      }
      return true;
    });
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTdWJTZWN0aW9uVHlwZSIsInZpc3VhbGl6YXRpb25UZXJtcyIsImNyZWF0ZVN1YlNlY3Rpb25zIiwiZmFjZXRDb2xsZWN0aW9uIiwiY29udmVydGVyQ29udGV4dCIsImlzSGVhZGVyU2VjdGlvbiIsImZhY2V0c1RvQ3JlYXRlIiwicmVkdWNlIiwiZmFjZXREZWZpbml0aW9uIiwiJFR5cGUiLCJwdXNoIiwiRmFjZXRzIiwiZmluZCIsImZhY2V0VHlwZSIsInNwbGljZSIsImxlbmd0aCIsIm1hcCIsImZhY2V0IiwiY3JlYXRlU3ViU2VjdGlvbiIsImNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbnMiLCJjdXN0b21IZWFkZXJGYWNldHMiLCJnZXRIZWFkZXJGYWNldHNGcm9tTWFuaWZlc3QiLCJnZXRNYW5pZmVzdFdyYXBwZXIiLCJnZXRIZWFkZXJGYWNldHMiLCJhQ3VzdG9tSGVhZGVyRmFjZXRzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJrZXkiLCJjdXN0b21IZWFkZXJGYWNldCIsInRlbXBsYXRlRWRpdCIsImNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbiIsInN1YlNlY3Rpb25JRCIsImdldEN1c3RvbVN1YlNlY3Rpb25JRCIsInN1YlNlY3Rpb24iLCJpZCIsInRpdGxlIiwidHlwZSIsIlhNTEZyYWdtZW50IiwidGVtcGxhdGUiLCJ2aXNpYmxlIiwibGV2ZWwiLCJzaWRlQ29udGVudCIsInVuZGVmaW5lZCIsInN0YXNoZWQiLCJmbGV4U2V0dGluZ3MiLCJhY3Rpb25zIiwiZ2V0U3ViU2VjdGlvbktleSIsImZhbGxiYWNrIiwiSUQiLCJ0b1N0cmluZyIsIkxhYmVsIiwiYWRkRm9ybU1lbnVBY3Rpb25zIiwiaGlkZGVuQWN0aW9ucyIsImdldEZvcm1IaWRkZW5BY3Rpb25zIiwiZm9ybUFjdGlvbnMiLCJnZXRGb3JtQWN0aW9ucyIsIm1hbmlmZXN0QWN0aW9ucyIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJmb3JtQWxsQWN0aW9ucyIsImluc2VydEN1c3RvbUVsZW1lbnRzIiwiY29tbWFuZCIsImdldFZpc2liaWxpdHlFbmFibGVtZW50Rm9ybU1lbnVBY3Rpb25zIiwicmVtb3ZlRHVwbGljYXRlQWN0aW9ucyIsImNvbW1hbmRBY3Rpb25zIiwiZ2V0RmFjZXRBY3Rpb25zIiwiQXJyYXkiLCJmaWx0ZXIiLCJzdWJGYWNldERlZmluaXRpb24iLCJpc1JlZmVyZW5jZUZhY2V0IiwiYWN0aW9uUmVkdWNlciIsInJlZmVyZW5jZUZhY2V0IiwiY3JlYXRlRm9ybUFjdGlvblJlZHVjZXIiLCJnZXRCdXR0b25UeXBlIiwiZW1waGFzaXplZCIsImJ1dHRvblR5cGVDb25kaXRpb24iLCJlcXVhbCIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsImNvbXBpbGVFeHByZXNzaW9uIiwiaWZFbHNlIiwiQnV0dG9uVHlwZSIsIkdob3N0IiwiVHJhbnNwYXJlbnQiLCJoYXNTaW5nbGVDb250ZW50IiwiZ2V0U3ViU2VjdGlvbklEIiwiRmFjZXQiLCJvSGlkZGVuQW5ub3RhdGlvbiIsImFubm90YXRpb25zIiwiVUkiLCJIaWRkZW4iLCJpc1Zpc2libGVFeHByZXNzaW9uIiwibm90IiwiaXNWaXNpYmxlIiwiaXNEeW5hbWljRXhwcmVzc2lvbiIsImluZGV4T2YiLCJpc1BhdGhFeHByZXNzaW9uIiwiaXNWaXNpYmxlRHluYW1pY0V4cHJlc3Npb24iLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsIlVua25vd24iLCJhbm5vdGF0aW9uUGF0aCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJpc1Zpc2liaWxpdHlEeW5hbWljIiwiZ2V0U3Rhc2hlZFNldHRpbmdzRm9ySGVhZGVyRmFjZXQiLCJkZXNpZ250aW1lIiwiZ2V0RGVzaWduVGltZU1ldGFkYXRhU2V0dGluZ3NGb3JIZWFkZXJGYWNldCIsInVuc3VwcG9ydGVkVGV4dCIsImZhY2V0cyIsInZpc3VhbGl6YXRpb25GYWNldHMiLCJpbmRleCIsImluY2x1ZGVzIiwiVGFyZ2V0IiwiJHRhcmdldCIsInRlcm0iLCJub25WaXN1YWxpemF0aW9uRmFjZXRzIiwidmlzdWFsaXphdGlvbiIsInZpc3VhbGl6YXRpb25Db250ZW50IiwiZm9ybUNvbnRlbnQiLCJtaXhlZENvbnRlbnQiLCJMb2ciLCJ3YXJuaW5nIiwibWl4ZWRTdWJTZWN0aW9uIiwiTWl4ZWQiLCJjb250ZW50IiwiZmFjZXRBY3Rpb25zIiwiZm9ybUNvbGxlY3Rpb25TdWJTZWN0aW9uIiwiRm9ybSIsImZvcm1EZWZpbml0aW9uIiwiY3JlYXRlRm9ybURlZmluaXRpb24iLCJhY3Rpb24iLCJmYWNldE5hbWUiLCJ2YWx1ZSIsInByZXNlbnRhdGlvbiIsImdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbiIsImdldENvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW5jZSIsImNvbnRyb2xUaXRsZSIsInZpc3VhbGl6YXRpb25zIiwiYW5ub3RhdGlvbiIsInNob3dUaXRsZSIsImlzU3Vic2VjdGlvblRpdGxlU2hvd24iLCJ0aXRsZVZpc2libGUiLCJhbmQiLCJkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb24iLCJEYXRhVmlzdWFsaXphdGlvbiIsImZvcm1FbGVtZW50U3ViU2VjdGlvbiIsInVuc3VwcG9ydGVkU3ViU2VjdGlvbiIsInRleHQiLCJzdWJTZWN0aW9uVGl0bGUiLCJyZWZlcmVuY2VUYXJnZXQiLCJ0YXJnZXRWYWx1ZSIsImRhdGFGaWVsZENvbGxlY3Rpb24iLCJzcGxpdCIsIm5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJzdWJzdHIiLCJEYXRhIiwiZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbiIsInF1YWxpZmllciIsImRhdGFGaWVsZCIsIlJlcXVpcmVzQ29udGV4dCIsInZhbHVlT2YiLCJnZXREaWFnbm9zdGljcyIsImFkZElzc3VlIiwiSXNzdWVDYXRlZ29yeSIsIkFubm90YXRpb24iLCJJc3N1ZVNldmVyaXR5IiwiTG93IiwiSXNzdWVUeXBlIiwiTUFMRk9STUVEX0RBVEFGSUVMRF9GT1JfSUJOIiwiUkVRVUlSRVNDT05URVhUIiwiSW5saW5lIiwiSU5MSU5FIiwiRGV0ZXJtaW5pbmciLCJERVRFUk1JTklORyIsIm1OYXZpZ2F0aW9uUGFyYW1ldGVycyIsIk1hcHBpbmciLCJzZW1hbnRpY09iamVjdE1hcHBpbmciLCJnZXRTZW1hbnRpY09iamVjdE1hcHBpbmciLCJBY3Rpb25UeXBlIiwiRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiZ2V0Rm9ybUlEIiwiS2V5SGVscGVyIiwiZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkIiwiZW5hYmxlZCIsIk5hdmlnYXRpb25BdmFpbGFibGUiLCJidXR0b25UeXBlIiwiRW1waGFzaXplZCIsInByZXNzIiwiZm4iLCJTZW1hbnRpY09iamVjdCIsIkFjdGlvbiIsImN1c3RvbURhdGEiLCJzZW1hbnRpY09iamVjdCIsImZvcm1NYW5pZmVzdEFjdGlvbnNDb25maWd1cmF0aW9uIiwiRGF0YUZpZWxkRm9yQWN0aW9uIiwiZ2V0RW5hYmxlZEZvckFubm90YXRpb25BY3Rpb24iLCJBY3Rpb25UYXJnZXQiLCJiaW5kaW5nIiwicmVxdWlyZXNEaWFsb2ciLCJpc0RpYWxvZyIsImNvbnRleHRzIiwicGF0aEluTW9kZWwiLCJpbnZvY2F0aW9uR3JvdXBpbmciLCJJbnZvY2F0aW9uR3JvdXBpbmciLCJsYWJlbCIsIm1vZGVsIiwiaXNOYXZpZ2FibGUiLCJpc0FjdGlvbk5hdmlnYWJsZSIsInJlZiIsImFjdGlvbkRlZmluaXRpb24iLCJiQ3JpdGljYWwiLCJDb21tb24iLCJJc0FjdGlvbkNyaXRpY2FsIiwicGFyYW1ldGVycyIsImNyZWF0ZUN1c3RvbVN1YlNlY3Rpb25zIiwibWFuaWZlc3RTdWJTZWN0aW9ucyIsInN1YlNlY3Rpb25zIiwic3ViU2VjdGlvbktleSIsImNyZWF0ZUN1c3RvbVN1YlNlY3Rpb24iLCJtYW5pZmVzdFN1YlNlY3Rpb24iLCJnZXRTaWRlQ29udGVudElEIiwiZXF1YWxTcGxpdCIsInBvc2l0aW9uIiwicGxhY2VtZW50IiwiUGxhY2VtZW50IiwiQWZ0ZXIiLCJzdWJTZWN0aW9uRGVmaW5pdGlvbiIsIm5hbWUiLCJQbGFjZWhvbGRlciIsImN1cnJlbnRGYWNldCIsImZhY2V0c1RvQ3JlYXRlSW5TZWN0aW9uIiwibWFuaWZlc3RXcmFwcGVyIiwidXNlSWNvblRhYkJhciIsImhhc05vT3RoZXJWaXNpYmxlVGFibGVJblRhcmdldHMiLCJlbnRpdHlUeXBlIiwiZ2V0RW50aXR5VHlwZSIsImV2ZXJ5Iiwic3ViRmFjZXQiLCJyZWZGYWNldCIsInN1YkNvbGxlY3Rpb25GYWNldCIsInN1YlJlZkZhY2V0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJTdWJTZWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW11bmljYXRpb25Bbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW11bmljYXRpb25cIjtcbmltcG9ydCB0eXBlIHtcblx0Q29sbGVjdGlvbkZhY2V0VHlwZXMsXG5cdERhdGFGaWVsZEFic3RyYWN0VHlwZXMsXG5cdEVtcGhhc2l6ZWQsXG5cdEZhY2V0VHlwZXMsXG5cdEZpZWxkR3JvdXAsXG5cdE9wZXJhdGlvbkdyb3VwaW5nVHlwZSxcblx0UmVmZXJlbmNlRmFjZXQsXG5cdFJlZmVyZW5jZUZhY2V0VHlwZXNcbn0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMsIFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgdHlwZSB7IEJhc2VBY3Rpb24sIENvbWJpbmVkQWN0aW9uLCBDb252ZXJ0ZXJBY3Rpb24sIEN1c3RvbUFjdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7XG5cdEJ1dHRvblR5cGUsXG5cdGdldEFjdGlvbnNGcm9tTWFuaWZlc3QsXG5cdGdldEVuYWJsZWRGb3JBbm5vdGF0aW9uQWN0aW9uLFxuXHRnZXRTZW1hbnRpY09iamVjdE1hcHBpbmcsXG5cdGlzQWN0aW9uTmF2aWdhYmxlLFxuXHRyZW1vdmVEdXBsaWNhdGVBY3Rpb25zXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB0eXBlIHsgQ3VzdG9tT2JqZWN0UGFnZUhlYWRlckZhY2V0LCBGbGV4U2V0dGluZ3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9PYmplY3RQYWdlL0hlYWRlckZhY2V0XCI7XG5pbXBvcnQge1xuXHRnZXREZXNpZ25UaW1lTWV0YWRhdGFTZXR0aW5nc0ZvckhlYWRlckZhY2V0LFxuXHRnZXRIZWFkZXJGYWNldHNGcm9tTWFuaWZlc3QsXG5cdGdldFN0YXNoZWRTZXR0aW5nc0ZvckhlYWRlckZhY2V0XG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL09iamVjdFBhZ2UvSGVhZGVyRmFjZXRcIjtcbmltcG9ydCB7IElzc3VlQ2F0ZWdvcnksIElzc3VlU2V2ZXJpdHksIElzc3VlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHR5cGUgeyBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQge1xuXHRhbmQsXG5cdGNvbXBpbGVFeHByZXNzaW9uLFxuXHRlcXVhbCxcblx0Zm4sXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRub3QsXG5cdHBhdGhJbk1vZGVsLFxuXHRyZWZcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGlzUGF0aEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vLi4vQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgeyBDb25maWd1cmFibGVPYmplY3QsIENvbmZpZ3VyYWJsZVJlY29yZCwgQ3VzdG9tRWxlbWVudCB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgaW5zZXJ0Q3VzdG9tRWxlbWVudHMsIFBsYWNlbWVudCB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgZ2V0Q3VzdG9tU3ViU2VjdGlvbklELCBnZXRGb3JtSUQsIGdldFNpZGVDb250ZW50SUQsIGdldFN1YlNlY3Rpb25JRCB9IGZyb20gXCIuLi8uLi9oZWxwZXJzL0lEXCI7XG5pbXBvcnQgdHlwZSB7IE1hbmlmZXN0QWN0aW9uLCBNYW5pZmVzdFN1YlNlY3Rpb24gfSBmcm9tIFwiLi4vLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHsgQWN0aW9uVHlwZSB9IGZyb20gXCIuLi8uLi9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgeyBnZXRGb3JtQWN0aW9ucywgZ2V0Rm9ybUhpZGRlbkFjdGlvbnMsIGdldFZpc2liaWxpdHlFbmFibGVtZW50Rm9ybU1lbnVBY3Rpb25zIH0gZnJvbSBcIi4uLy4uL29iamVjdFBhZ2UvRm9ybU1lbnVBY3Rpb25zXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFWaXN1YWxpemF0aW9uRGVmaW5pdGlvbiB9IGZyb20gXCIuLi9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB7IGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbiB9IGZyb20gXCIuLi9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB0eXBlIHsgRm9ybURlZmluaXRpb24gfSBmcm9tIFwiLi4vQ29tbW9uL0Zvcm1cIjtcbmltcG9ydCB7IGNyZWF0ZUZvcm1EZWZpbml0aW9uLCBpc1JlZmVyZW5jZUZhY2V0IH0gZnJvbSBcIi4uL0NvbW1vbi9Gb3JtXCI7XG5cbmV4cG9ydCBlbnVtIFN1YlNlY3Rpb25UeXBlIHtcblx0VW5rbm93biA9IFwiVW5rbm93blwiLCAvLyBEZWZhdWx0IFR5cGVcblx0Rm9ybSA9IFwiRm9ybVwiLFxuXHREYXRhVmlzdWFsaXphdGlvbiA9IFwiRGF0YVZpc3VhbGl6YXRpb25cIixcblx0WE1MRnJhZ21lbnQgPSBcIlhNTEZyYWdtZW50XCIsXG5cdFBsYWNlaG9sZGVyID0gXCJQbGFjZWhvbGRlclwiLFxuXHRNaXhlZCA9IFwiTWl4ZWRcIlxufVxuXG5leHBvcnQgdHlwZSBPYmplY3RQYWdlU3ViU2VjdGlvbiA9XG5cdHwgVW5zdXBwb3J0ZWRTdWJTZWN0aW9uXG5cdHwgRm9ybVN1YlNlY3Rpb25cblx0fCBEYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb25cblx0fCBDb250YWN0U3ViU2VjdGlvblxuXHR8IFhNTEZyYWdtZW50U3ViU2VjdGlvblxuXHR8IFBsYWNlaG9sZGVyRnJhZ21lbnRTdWJTZWN0aW9uXG5cdHwgTWl4ZWRTdWJTZWN0aW9uO1xuXG50eXBlIEJhc2VTdWJTZWN0aW9uID0ge1xuXHRpZDogc3RyaW5nO1xuXHRrZXk6IHN0cmluZztcblx0dGl0bGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRhbm5vdGF0aW9uUGF0aDogc3RyaW5nO1xuXHR0eXBlOiBTdWJTZWN0aW9uVHlwZTtcblx0dmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGlzVmlzaWJpbGl0eUR5bmFtaWM/OiBib29sZWFuIHwgXCJcIjtcblx0ZmxleFNldHRpbmdzPzogRmxleFNldHRpbmdzO1xuXHRzdGFzaGVkPzogYm9vbGVhbjtcblx0bGV2ZWw6IG51bWJlcjtcblx0Y29udGVudD86IEFycmF5PE9iamVjdFBhZ2VTdWJTZWN0aW9uPjtcblx0c2lkZUNvbnRlbnQ/OiBTaWRlQ29udGVudERlZjtcbn07XG5cbnR5cGUgVW5zdXBwb3J0ZWRTdWJTZWN0aW9uID0gQmFzZVN1YlNlY3Rpb24gJiB7XG5cdHRleHQ6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbiA9IEJhc2VTdWJTZWN0aW9uICYge1xuXHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5EYXRhVmlzdWFsaXphdGlvbjtcblx0cHJlc2VudGF0aW9uOiBEYXRhVmlzdWFsaXphdGlvbkRlZmluaXRpb247XG5cdHNob3dUaXRsZTogYm9vbGVhbjtcblx0dGl0bGVWaXNpYmxlPzogc3RyaW5nIHwgYm9vbGVhbjtcbn07XG5cbnR5cGUgQ29udGFjdFN1YlNlY3Rpb24gPSBVbnN1cHBvcnRlZFN1YlNlY3Rpb247XG5cbnR5cGUgWE1MRnJhZ21lbnRTdWJTZWN0aW9uID0gT21pdDxCYXNlU3ViU2VjdGlvbiwgXCJhbm5vdGF0aW9uUGF0aFwiPiAmIHtcblx0dHlwZTogU3ViU2VjdGlvblR5cGUuWE1MRnJhZ21lbnQ7XG5cdHRlbXBsYXRlOiBzdHJpbmc7XG5cdGFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj47XG59O1xuXG50eXBlIFBsYWNlaG9sZGVyRnJhZ21lbnRTdWJTZWN0aW9uID0gT21pdDxCYXNlU3ViU2VjdGlvbiwgXCJhbm5vdGF0aW9uUGF0aFwiPiAmIHtcblx0dHlwZTogU3ViU2VjdGlvblR5cGUuUGxhY2Vob2xkZXI7XG5cdGFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj47XG59O1xuXG5leHBvcnQgdHlwZSBNaXhlZFN1YlNlY3Rpb24gPSBCYXNlU3ViU2VjdGlvbiAmIHtcblx0Y29udGVudDogQXJyYXk8T2JqZWN0UGFnZVN1YlNlY3Rpb24+O1xufTtcblxuZXhwb3J0IHR5cGUgRm9ybVN1YlNlY3Rpb24gPSBCYXNlU3ViU2VjdGlvbiAmIHtcblx0dHlwZTogU3ViU2VjdGlvblR5cGUuRm9ybTtcblx0Zm9ybURlZmluaXRpb246IEZvcm1EZWZpbml0aW9uO1xuXHRhY3Rpb25zOiBDb252ZXJ0ZXJBY3Rpb25bXSB8IEJhc2VBY3Rpb25bXTtcblx0Y29tbWFuZEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj47XG59O1xuXG5leHBvcnQgdHlwZSBPYmplY3RQYWdlU2VjdGlvbiA9IENvbmZpZ3VyYWJsZU9iamVjdCAmIHtcblx0aWQ6IHN0cmluZztcblx0dGl0bGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRzaG93VGl0bGU/OiBib29sZWFuO1xuXHR2aXNpYmxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0c3ViU2VjdGlvbnM6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW107XG59O1xuXG50eXBlIFNpZGVDb250ZW50RGVmID0ge1xuXHR0ZW1wbGF0ZT86IHN0cmluZztcblx0aWQ/OiBzdHJpbmc7XG5cdHNpZGVDb250ZW50RmFsbERvd24/OiBzdHJpbmc7XG5cdGNvbnRhaW5lclF1ZXJ5Pzogc3RyaW5nO1xuXHR2aXNpYmxlPzogYm9vbGVhbjtcblx0ZXF1YWxTcGxpdD86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgdHlwZSBDdXN0b21PYmplY3RQYWdlU2VjdGlvbiA9IEN1c3RvbUVsZW1lbnQ8T2JqZWN0UGFnZVNlY3Rpb24+O1xuXG5leHBvcnQgdHlwZSBDdXN0b21PYmplY3RQYWdlU3ViU2VjdGlvbiA9IEN1c3RvbUVsZW1lbnQ8T2JqZWN0UGFnZVN1YlNlY3Rpb24+O1xuXG5jb25zdCB2aXN1YWxpemF0aW9uVGVybXM6IHN0cmluZ1tdID0gW1xuXHRVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbSxcblx0VUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQsXG5cdFVJQW5ub3RhdGlvblRlcm1zLlByZXNlbnRhdGlvblZhcmlhbnQsXG5cdFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRcbl07XG5cbi8qKlxuICogQ3JlYXRlIHN1YnNlY3Rpb25zIGJhc2VkIG9uIGZhY2V0IGRlZmluaXRpb24uXG4gKlxuICogQHBhcmFtIGZhY2V0Q29sbGVjdGlvbiBDb2xsZWN0aW9uIG9mIGZhY2V0c1xuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcGFyYW0gaXNIZWFkZXJTZWN0aW9uIFRydWUgaWYgaGVhZGVyIHNlY3Rpb24gaXMgZ2VuZXJhdGVkIGluIHRoaXMgaXRlcmF0aW9uXG4gKiBAcmV0dXJucyBUaGUgY3VycmVudCBzdWJzZWN0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ViU2VjdGlvbnMoXG5cdGZhY2V0Q29sbGVjdGlvbjogRmFjZXRUeXBlc1tdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRpc0hlYWRlclNlY3Rpb24/OiBib29sZWFuXG4pOiBPYmplY3RQYWdlU3ViU2VjdGlvbltdIHtcblx0Ly8gRmlyc3Qgd2UgZGV0ZXJtaW5lIHdoaWNoIHN1YiBzZWN0aW9uIHdlIG5lZWQgdG8gY3JlYXRlXG5cdGNvbnN0IGZhY2V0c1RvQ3JlYXRlID0gZmFjZXRDb2xsZWN0aW9uLnJlZHVjZSgoZmFjZXRzVG9DcmVhdGU6IEZhY2V0VHlwZXNbXSwgZmFjZXREZWZpbml0aW9uKSA9PiB7XG5cdFx0c3dpdGNoIChmYWNldERlZmluaXRpb24uJFR5cGUpIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQ6XG5cdFx0XHRcdGZhY2V0c1RvQ3JlYXRlLnB1c2goZmFjZXREZWZpbml0aW9uKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkNvbGxlY3Rpb25GYWNldDpcblx0XHRcdFx0Ly8gVE9ETyBJZiB0aGUgQ29sbGVjdGlvbiBGYWNldCBoYXMgYSBjaGlsZCBvZiB0eXBlIENvbGxlY3Rpb24gRmFjZXQgd2UgYnJpbmcgdGhlbSB1cCBvbmUgbGV2ZWwgKEZvcm0gKyBUYWJsZSB1c2UgY2FzZSkgP1xuXHRcdFx0XHQvLyBmaXJzdCBjYXNlIGZhY2V0IENvbGxlY3Rpb24gaXMgY29tYmluYXRpb24gb2YgY29sbGVjdGlvbiBhbmQgcmVmZXJlbmNlIGZhY2V0IG9yIG5vdCBhbGwgZmFjZXRzIGFyZSByZWZlcmVuY2UgZmFjZXRzLlxuXHRcdFx0XHRpZiAoZmFjZXREZWZpbml0aW9uLkZhY2V0cy5maW5kKChmYWNldFR5cGUpID0+IGZhY2V0VHlwZS4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0KSkge1xuXHRcdFx0XHRcdGZhY2V0c1RvQ3JlYXRlLnNwbGljZShmYWNldHNUb0NyZWF0ZS5sZW5ndGgsIDAsIC4uLmZhY2V0RGVmaW5pdGlvbi5GYWNldHMpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGZhY2V0c1RvQ3JlYXRlLnB1c2goZmFjZXREZWZpbml0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlVVJMRmFjZXQ6XG5cdFx0XHRcdC8vIE5vdCBzdXBwb3J0ZWRcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdHJldHVybiBmYWNldHNUb0NyZWF0ZTtcblx0fSwgW10pO1xuXG5cdC8vIFRoZW4gd2UgY3JlYXRlIHRoZSBhY3R1YWwgc3Vic2VjdGlvbnNcblx0cmV0dXJuIGZhY2V0c1RvQ3JlYXRlLm1hcCgoZmFjZXQpID0+XG5cdFx0Y3JlYXRlU3ViU2VjdGlvbihmYWNldCwgZmFjZXRzVG9DcmVhdGUsIGNvbnZlcnRlckNvbnRleHQsIDAsICEoZmFjZXQgYXMgYW55KT8uRmFjZXRzPy5sZW5ndGgsIGlzSGVhZGVyU2VjdGlvbilcblx0KTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIHN1YnNlY3Rpb25zIGJhc2VkIG9uIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBjdXN0b20gaGVhZGVyIGZhY2V0LlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIGN1cnJlbnQgc3Vic2VjdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0U3ViU2VjdGlvbnMoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW10ge1xuXHRjb25zdCBjdXN0b21IZWFkZXJGYWNldHM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldD4gPSBnZXRIZWFkZXJGYWNldHNGcm9tTWFuaWZlc3QoXG5cdFx0Y29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKS5nZXRIZWFkZXJGYWNldHMoKVxuXHQpO1xuXHRjb25zdCBhQ3VzdG9tSGVhZGVyRmFjZXRzOiBDdXN0b21PYmplY3RQYWdlSGVhZGVyRmFjZXRbXSA9IFtdO1xuXHRPYmplY3Qua2V5cyhjdXN0b21IZWFkZXJGYWNldHMpLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuXHRcdGFDdXN0b21IZWFkZXJGYWNldHMucHVzaChjdXN0b21IZWFkZXJGYWNldHNba2V5XSk7XG5cdFx0cmV0dXJuIGFDdXN0b21IZWFkZXJGYWNldHM7XG5cdH0pO1xuXHRjb25zdCBmYWNldHNUb0NyZWF0ZSA9IGFDdXN0b21IZWFkZXJGYWNldHMucmVkdWNlKChmYWNldHNUb0NyZWF0ZTogQ3VzdG9tT2JqZWN0UGFnZUhlYWRlckZhY2V0W10sIGN1c3RvbUhlYWRlckZhY2V0KSA9PiB7XG5cdFx0aWYgKGN1c3RvbUhlYWRlckZhY2V0LnRlbXBsYXRlRWRpdCkge1xuXHRcdFx0ZmFjZXRzVG9DcmVhdGUucHVzaChjdXN0b21IZWFkZXJGYWNldCk7XG5cdFx0fVxuXHRcdHJldHVybiBmYWNldHNUb0NyZWF0ZTtcblx0fSwgW10pO1xuXG5cdHJldHVybiBmYWNldHNUb0NyZWF0ZS5tYXAoKGN1c3RvbUhlYWRlckZhY2V0KSA9PiBjcmVhdGVDdXN0b21IZWFkZXJGYWNldFN1YlNlY3Rpb24oY3VzdG9tSGVhZGVyRmFjZXQpKTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgc3Vic2VjdGlvbiBiYXNlZCBvbiBhIGN1c3RvbSBoZWFkZXIgZmFjZXQuXG4gKlxuICogQHBhcmFtIGN1c3RvbUhlYWRlckZhY2V0IEEgY3VzdG9tIGhlYWRlciBmYWNldFxuICogQHJldHVybnMgQSBkZWZpbml0aW9uIGZvciBhIHN1YnNlY3Rpb25cbiAqL1xuZnVuY3Rpb24gY3JlYXRlQ3VzdG9tSGVhZGVyRmFjZXRTdWJTZWN0aW9uKGN1c3RvbUhlYWRlckZhY2V0OiBDdXN0b21PYmplY3RQYWdlSGVhZGVyRmFjZXQpOiBPYmplY3RQYWdlU3ViU2VjdGlvbiB7XG5cdGNvbnN0IHN1YlNlY3Rpb25JRCA9IGdldEN1c3RvbVN1YlNlY3Rpb25JRChjdXN0b21IZWFkZXJGYWNldC5rZXkpO1xuXHRjb25zdCBzdWJTZWN0aW9uOiBYTUxGcmFnbWVudFN1YlNlY3Rpb24gPSB7XG5cdFx0aWQ6IHN1YlNlY3Rpb25JRCxcblx0XHRrZXk6IGN1c3RvbUhlYWRlckZhY2V0LmtleSxcblx0XHR0aXRsZTogY3VzdG9tSGVhZGVyRmFjZXQudGl0bGUsXG5cdFx0dHlwZTogU3ViU2VjdGlvblR5cGUuWE1MRnJhZ21lbnQsXG5cdFx0dGVtcGxhdGU6IGN1c3RvbUhlYWRlckZhY2V0LnRlbXBsYXRlRWRpdCB8fCBcIlwiLFxuXHRcdHZpc2libGU6IGN1c3RvbUhlYWRlckZhY2V0LnZpc2libGUsXG5cdFx0bGV2ZWw6IDEsXG5cdFx0c2lkZUNvbnRlbnQ6IHVuZGVmaW5lZCxcblx0XHRzdGFzaGVkOiBjdXN0b21IZWFkZXJGYWNldC5zdGFzaGVkLFxuXHRcdGZsZXhTZXR0aW5nczogY3VzdG9tSGVhZGVyRmFjZXQuZmxleFNldHRpbmdzLFxuXHRcdGFjdGlvbnM6IHt9XG5cdH07XG5cdHJldHVybiBzdWJTZWN0aW9uO1xufVxuXG4vLyBmdW5jdGlvbiBpc1RhcmdldEZvckNvbXBsaWFudChhbm5vdGF0aW9uUGF0aDogQW5ub3RhdGlvblBhdGgpIHtcbi8vIFx0cmV0dXJuIC8uKmNvbVxcLnNhcFxcLnZvY2FidWxhcmllc1xcLlVJXFwudjFcXC4oRmllbGRHcm91cHxJZGVudGlmaWNhdGlvbnxEYXRhUG9pbnR8U3RhdHVzSW5mbykuKi8udGVzdChhbm5vdGF0aW9uUGF0aC52YWx1ZSk7XG4vLyB9XG5jb25zdCBnZXRTdWJTZWN0aW9uS2V5ID0gKGZhY2V0RGVmaW5pdGlvbjogRmFjZXRUeXBlcywgZmFsbGJhY2s6IHN0cmluZyk6IHN0cmluZyA9PiB7XG5cdHJldHVybiBmYWNldERlZmluaXRpb24uSUQ/LnRvU3RyaW5nKCkgfHwgZmFjZXREZWZpbml0aW9uLkxhYmVsPy50b1N0cmluZygpIHx8IGZhbGxiYWNrO1xufTtcbi8qKlxuICogQWRkcyBGb3JtIG1lbnUgYWN0aW9uIHRvIGFsbCBmb3JtIGFjdGlvbnMsIHJlbW92ZXMgZHVwbGljYXRlIGFjdGlvbnMgYW5kIGhpZGRlbiBhY3Rpb25zLlxuICpcbiAqIEBwYXJhbSBhY3Rpb25zIFRoZSBhY3Rpb25zIGludm9sdmVkXG4gKiBAcGFyYW0gZmFjZXREZWZpbml0aW9uIFRoZSBkZWZpbml0aW9uIGZvciB0aGUgZmFjZXRcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHJldHVybnMgVGhlIGZvcm0gbWVudSBhY3Rpb25zXG4gKi9cbmZ1bmN0aW9uIGFkZEZvcm1NZW51QWN0aW9ucyhhY3Rpb25zOiBDb252ZXJ0ZXJBY3Rpb25bXSwgZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQ29tYmluZWRBY3Rpb24ge1xuXHRjb25zdCBoaWRkZW5BY3Rpb25zOiBCYXNlQWN0aW9uW10gPSBnZXRGb3JtSGlkZGVuQWN0aW9ucyhmYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpIHx8IFtdLFxuXHRcdGZvcm1BY3Rpb25zOiBDb25maWd1cmFibGVSZWNvcmQ8TWFuaWZlc3RBY3Rpb24+ID0gZ2V0Rm9ybUFjdGlvbnMoZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRtYW5pZmVzdEFjdGlvbnMgPSBnZXRBY3Rpb25zRnJvbU1hbmlmZXN0KGZvcm1BY3Rpb25zLCBjb252ZXJ0ZXJDb250ZXh0LCBhY3Rpb25zLCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgaGlkZGVuQWN0aW9ucyksXG5cdFx0Zm9ybUFsbEFjdGlvbnMgPSBpbnNlcnRDdXN0b21FbGVtZW50cyhhY3Rpb25zLCBtYW5pZmVzdEFjdGlvbnMuYWN0aW9ucywgeyBjb21tYW5kOiBcIm92ZXJ3cml0ZVwiIH0pO1xuXHRyZXR1cm4ge1xuXHRcdFwiYWN0aW9uc1wiOiBmb3JtQWxsQWN0aW9ucyA/IGdldFZpc2liaWxpdHlFbmFibGVtZW50Rm9ybU1lbnVBY3Rpb25zKHJlbW92ZUR1cGxpY2F0ZUFjdGlvbnMoZm9ybUFsbEFjdGlvbnMpKSA6IGFjdGlvbnMsXG5cdFx0XCJjb21tYW5kQWN0aW9uc1wiOiBtYW5pZmVzdEFjdGlvbnMuY29tbWFuZEFjdGlvbnNcblx0fTtcbn1cblxuLyoqXG4gKiBSZXRyaWV2ZXMgdGhlIGFjdGlvbiBmb3JtIGEgZmFjZXQuXG4gKlxuICogQHBhcmFtIGZhY2V0RGVmaW5pdGlvblxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIFRoZSBjdXJyZW50IGZhY2V0IGFjdGlvbnNcbiAqL1xuZnVuY3Rpb24gZ2V0RmFjZXRBY3Rpb25zKGZhY2V0RGVmaW5pdGlvbjogRmFjZXRUeXBlcywgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IENvbWJpbmVkQWN0aW9uIHtcblx0bGV0IGFjdGlvbnMgPSBuZXcgQXJyYXk8Q29udmVydGVyQWN0aW9uPigpO1xuXHRzd2l0Y2ggKGZhY2V0RGVmaW5pdGlvbi4kVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0OlxuXHRcdFx0YWN0aW9ucyA9IChcblx0XHRcdFx0ZmFjZXREZWZpbml0aW9uLkZhY2V0cy5maWx0ZXIoKHN1YkZhY2V0RGVmaW5pdGlvbikgPT4gaXNSZWZlcmVuY2VGYWNldChzdWJGYWNldERlZmluaXRpb24pKSBhcyBSZWZlcmVuY2VGYWNldFR5cGVzW11cblx0XHRcdCkucmVkdWNlKFxuXHRcdFx0XHQoYWN0aW9uUmVkdWNlcjogQ29udmVydGVyQWN0aW9uW10sIHJlZmVyZW5jZUZhY2V0KSA9PlxuXHRcdFx0XHRcdGNyZWF0ZUZvcm1BY3Rpb25SZWR1Y2VyKGFjdGlvblJlZHVjZXIsIHJlZmVyZW5jZUZhY2V0LCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdFx0W11cblx0XHRcdCk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0OlxuXHRcdFx0YWN0aW9ucyA9IGNyZWF0ZUZvcm1BY3Rpb25SZWR1Y2VyKFtdLCBmYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0YnJlYWs7XG5cdFx0ZGVmYXVsdDpcblx0XHRcdGJyZWFrO1xuXHR9XG5cdHJldHVybiBhZGRGb3JtTWVudUFjdGlvbnMoYWN0aW9ucywgZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KTtcbn1cbi8qKlxuICogUmV0dXJucyB0aGUgYnV0dG9uIHR5cGUgYmFzZWQgb24gQFVJLkVtcGhhc2l6ZWQgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gZW1waGFzaXplZCBFbXBoYXNpemVkIGFubm90YXRpb24gdmFsdWUuXG4gKiBAcmV0dXJucyBUaGUgYnV0dG9uIHR5cGUgb3IgcGF0aCBiYXNlZCBleHByZXNzaW9uLlxuICovXG5mdW5jdGlvbiBnZXRCdXR0b25UeXBlKGVtcGhhc2l6ZWQ6IEVtcGhhc2l6ZWQgfCB1bmRlZmluZWQpOiBCdXR0b25UeXBlIHtcblx0Ly8gRW1waGFzaXplZCBpcyBhIGJvb2xlYW4gc28gaWYgaXQncyBlcXVhbCB0byB0cnVlIHdlIHNob3cgdGhlIGJ1dHRvbiBhcyBHaG9zdCwgb3RoZXJ3aXNlIGFzIFRyYW5zcGFyZW50XG5cdGNvbnN0IGJ1dHRvblR5cGVDb25kaXRpb24gPSBlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZW1waGFzaXplZCksIHRydWUpO1xuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oaWZFbHNlKGJ1dHRvblR5cGVDb25kaXRpb24sIEJ1dHRvblR5cGUuR2hvc3QsIEJ1dHRvblR5cGUuVHJhbnNwYXJlbnQpKSBhcyBCdXR0b25UeXBlO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIHN1YnNlY3Rpb24gYmFzZWQgb24gRmFjZXRUeXBlcy5cbiAqXG4gKiBAcGFyYW0gZmFjZXREZWZpbml0aW9uXG4gKiBAcGFyYW0gZmFjZXRzVG9DcmVhdGVcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcGFyYW0gbGV2ZWxcbiAqIEBwYXJhbSBoYXNTaW5nbGVDb250ZW50XG4gKiBAcGFyYW0gaXNIZWFkZXJTZWN0aW9uXG4gKiBAcmV0dXJucyBBIHN1YnNlY3Rpb24gZGVmaW5pdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlU3ViU2VjdGlvbihcblx0ZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLFxuXHRmYWNldHNUb0NyZWF0ZTogRmFjZXRUeXBlc1tdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRsZXZlbDogbnVtYmVyLFxuXHRoYXNTaW5nbGVDb250ZW50OiBib29sZWFuLFxuXHRpc0hlYWRlclNlY3Rpb24/OiBib29sZWFuXG4pOiBPYmplY3RQYWdlU3ViU2VjdGlvbiB7XG5cdGNvbnN0IHN1YlNlY3Rpb25JRCA9IGdldFN1YlNlY3Rpb25JRCh7IEZhY2V0OiBmYWNldERlZmluaXRpb24gfSk7XG5cdGNvbnN0IG9IaWRkZW5Bbm5vdGF0aW9uOiBhbnkgPSBmYWNldERlZmluaXRpb24uYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW47XG5cdGNvbnN0IGlzVmlzaWJsZUV4cHJlc3Npb24gPSBub3QoZXF1YWwodHJ1ZSwgZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9IaWRkZW5Bbm5vdGF0aW9uKSkpO1xuXHRjb25zdCBpc1Zpc2libGUgPSBjb21waWxlRXhwcmVzc2lvbihpc1Zpc2libGVFeHByZXNzaW9uKTtcblx0Y29uc3QgaXNEeW5hbWljRXhwcmVzc2lvbiA9XG5cdFx0aXNWaXNpYmxlICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGlzVmlzaWJsZSA9PT0gXCJzdHJpbmdcIiAmJiBpc1Zpc2libGUuaW5kZXhPZihcIns9XCIpID09PSAwICYmICFpc1BhdGhFeHByZXNzaW9uKG9IaWRkZW5Bbm5vdGF0aW9uKTtcblx0Y29uc3QgaXNWaXNpYmxlRHluYW1pY0V4cHJlc3Npb24gPVxuXHRcdGlzVmlzaWJsZSAmJiBpc0R5bmFtaWNFeHByZXNzaW9uXG5cdFx0XHQ/IGlzVmlzaWJsZS5zdWJzdHJpbmcoaXNWaXNpYmxlLmluZGV4T2YoXCJ7PVwiKSArIDIsIGlzVmlzaWJsZS5sYXN0SW5kZXhPZihcIn1cIikpICE9PSB1bmRlZmluZWRcblx0XHRcdDogZmFsc2U7XG5cdGNvbnN0IHRpdGxlID0gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGZhY2V0RGVmaW5pdGlvbi5MYWJlbCkpO1xuXHRjb25zdCBzdWJTZWN0aW9uOiBCYXNlU3ViU2VjdGlvbiA9IHtcblx0XHRpZDogc3ViU2VjdGlvbklELFxuXHRcdGtleTogZ2V0U3ViU2VjdGlvbktleShmYWNldERlZmluaXRpb24sIHN1YlNlY3Rpb25JRCksXG5cdFx0dGl0bGU6IHRpdGxlLFxuXHRcdHR5cGU6IFN1YlNlY3Rpb25UeXBlLlVua25vd24sXG5cdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChmYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHR2aXNpYmxlOiBpc1Zpc2libGUsXG5cdFx0aXNWaXNpYmlsaXR5RHluYW1pYzogaXNEeW5hbWljRXhwcmVzc2lvbixcblx0XHRsZXZlbDogbGV2ZWwsXG5cdFx0c2lkZUNvbnRlbnQ6IHVuZGVmaW5lZFxuXHR9O1xuXHRpZiAoaXNIZWFkZXJTZWN0aW9uKSB7XG5cdFx0c3ViU2VjdGlvbi5zdGFzaGVkID0gZ2V0U3Rhc2hlZFNldHRpbmdzRm9ySGVhZGVyRmFjZXQoZmFjZXREZWZpbml0aW9uLCBmYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdHN1YlNlY3Rpb24uZmxleFNldHRpbmdzID0ge1xuXHRcdFx0ZGVzaWdudGltZTogZ2V0RGVzaWduVGltZU1ldGFkYXRhU2V0dGluZ3NGb3JIZWFkZXJGYWNldChmYWNldERlZmluaXRpb24sIGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dClcblx0XHR9O1xuXHR9XG5cdGxldCB1bnN1cHBvcnRlZFRleHQgPSBcIlwiO1xuXHRsZXZlbCsrO1xuXHRzd2l0Y2ggKGZhY2V0RGVmaW5pdGlvbi4kVHlwZSkge1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0OlxuXHRcdFx0Y29uc3QgZmFjZXRzID0gZmFjZXREZWZpbml0aW9uLkZhY2V0cztcblxuXHRcdFx0Ly8gRmlsdGVyIGZvciBhbGwgZmFjZXRzIG9mIHRoaXMgc3Vic2VjdGlvbiB0aGF0IGFyZSByZWZlcnJpbmcgdG8gYW4gYW5ub3RhdGlvbiBkZXNjcmliaW5nIGEgdmlzdWFsaXphdGlvbiAoZS5nLiB0YWJsZSBvciBjaGFydClcblx0XHRcdGNvbnN0IHZpc3VhbGl6YXRpb25GYWNldHMgPSBmYWNldHNcblx0XHRcdFx0Lm1hcCgoZmFjZXQsIGluZGV4KSA9PiAoeyBpbmRleCwgZmFjZXQgfSkpIC8vIFJlbWVtYmVyIHRoZSBpbmRleCBhc3NpZ25lZCB0byBlYWNoIGZhY2V0XG5cdFx0XHRcdC5maWx0ZXIoKHsgZmFjZXQgfSkgPT4ge1xuXHRcdFx0XHRcdHJldHVybiB2aXN1YWxpemF0aW9uVGVybXMuaW5jbHVkZXMoKGZhY2V0IGFzIFJlZmVyZW5jZUZhY2V0KS5UYXJnZXQ/LiR0YXJnZXQ/LnRlcm0pO1xuXHRcdFx0XHR9KTtcblxuXHRcdFx0Ly8gRmlsdGVyIG91dCBhbGwgdmlzdWFsaXphdGlvbiBmYWNldHM7IFwidmlzdWFsaXphdGlvbkZhY2V0c1wiIGFuZCBcIm5vblZpc3VhbGl6YXRpb25GYWNldHNcIiBhcmUgZGlzam9pbnRcblx0XHRcdGNvbnN0IG5vblZpc3VhbGl6YXRpb25GYWNldHMgPSBmYWNldHMuZmlsdGVyKFxuXHRcdFx0XHQoZmFjZXQpID0+ICF2aXN1YWxpemF0aW9uRmFjZXRzLmZpbmQoKHZpc3VhbGl6YXRpb24pID0+IHZpc3VhbGl6YXRpb24uZmFjZXQgPT09IGZhY2V0KVxuXHRcdFx0KTtcblxuXHRcdFx0aWYgKHZpc3VhbGl6YXRpb25GYWNldHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHQvLyBDb2xsZWN0aW9uRmFjZXRzIHdpdGggdmlzdWFsaXphdGlvbnMgbXVzdCBiZSBoYW5kbGVkIHNlcGFyYXRlbHkgYXMgdGhleSBjYW5ub3QgYmUgaW5jbHVkZWQgaW4gZm9ybXNcblx0XHRcdFx0Y29uc3QgdmlzdWFsaXphdGlvbkNvbnRlbnQ6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW10gPSBbXTtcblx0XHRcdFx0Y29uc3QgZm9ybUNvbnRlbnQ6IE9iamVjdFBhZ2VTdWJTZWN0aW9uW10gPSBbXTtcblx0XHRcdFx0Y29uc3QgbWl4ZWRDb250ZW50OiBPYmplY3RQYWdlU3ViU2VjdGlvbltdID0gW107XG5cblx0XHRcdFx0Ly8gQ3JlYXRlIGVhY2ggdmlzdWFsaXphdGlvbiBmYWNldCBhcyBpZiBpdCB3YXMgaXRzIG93biBzdWJzZWN0aW9uICh2aWEgcmVjdXJzaW9uKSwgYW5kIGtlZXAgdGhlaXIgcmVsYXRpdmUgb3JkZXJpbmdcblx0XHRcdFx0Zm9yIChjb25zdCB7IGZhY2V0IH0gb2YgdmlzdWFsaXphdGlvbkZhY2V0cykge1xuXHRcdFx0XHRcdHZpc3VhbGl6YXRpb25Db250ZW50LnB1c2goY3JlYXRlU3ViU2VjdGlvbihmYWNldCwgW10sIGNvbnZlcnRlckNvbnRleHQsIGxldmVsLCB0cnVlLCBpc0hlYWRlclNlY3Rpb24pKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdGlmIChub25WaXN1YWxpemF0aW9uRmFjZXRzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHQvLyBUaGlzIHN1YnNlY3Rpb24gaW5jbHVkZXMgdmlzdWFsaXphdGlvbnMgYW5kIG90aGVyIGNvbnRlbnQsIHNvIGl0IGlzIGEgXCJNaXhlZFwiIHN1YnNlY3Rpb25cblx0XHRcdFx0XHRMb2cud2FybmluZyhcblx0XHRcdFx0XHRcdGBXYXJuaW5nOiBDb2xsZWN0aW9uRmFjZXQgJyR7ZmFjZXREZWZpbml0aW9uLklEfScgaW5jbHVkZXMgYSBjb21iaW5hdGlvbiBvZiBlaXRoZXIgYSBjaGFydCBvciBhIHRhYmxlIGFuZCBvdGhlciBjb250ZW50LiBUaGlzIGNhbiBsZWFkIHRvIHJlbmRlcmluZyBpc3N1ZXMuIENvbnNpZGVyIG1vdmluZyB0aGUgY2hhcnQgb3IgdGFibGUgaW50byBhIHNlcGFyYXRlIENvbGxlY3Rpb25GYWNldC5gXG5cdFx0XHRcdFx0KTtcblxuXHRcdFx0XHRcdGZhY2V0RGVmaW5pdGlvbi5GYWNldHMgPSBub25WaXN1YWxpemF0aW9uRmFjZXRzO1xuXHRcdFx0XHRcdC8vIENyZWF0ZSBhIGpvaW5lZCBmb3JtIG9mIGFsbCBmYWNldHMgdGhhdCBhcmUgbm90IHJlZmVycmluZyB0byB2aXN1YWxpemF0aW9uc1xuXHRcdFx0XHRcdGZvcm1Db250ZW50LnB1c2goY3JlYXRlU3ViU2VjdGlvbihmYWNldERlZmluaXRpb24sIFtdLCBjb252ZXJ0ZXJDb250ZXh0LCBsZXZlbCwgaGFzU2luZ2xlQ29udGVudCwgaXNIZWFkZXJTZWN0aW9uKSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBNZXJnZSB0aGUgdmlzdWFsaXphdGlvbiBjb250ZW50IHdpdGggdGhlIGZvcm0gY29udGVudFxuXHRcdFx0XHRpZiAodmlzdWFsaXphdGlvbkZhY2V0cy5maW5kKCh7IGluZGV4IH0pID0+IGluZGV4ID09PSAwKSkge1xuXHRcdFx0XHRcdC8vIElmIHRoZSBmaXJzdCBmYWNldCBpcyBhIHZpc3VhbGl6YXRpb24sIGRpc3BsYXkgdGhlIHZpc3VhbGl6YXRpb25zIGZpcnN0XG5cdFx0XHRcdFx0bWl4ZWRDb250ZW50LnB1c2goLi4udmlzdWFsaXphdGlvbkNvbnRlbnQpO1xuXHRcdFx0XHRcdG1peGVkQ29udGVudC5wdXNoKC4uLmZvcm1Db250ZW50KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBPdGhlcndpc2UsIGRpc3BsYXkgdGhlIGZvcm0gZmlyc3Rcblx0XHRcdFx0XHRtaXhlZENvbnRlbnQucHVzaCguLi5mb3JtQ29udGVudCk7XG5cdFx0XHRcdFx0bWl4ZWRDb250ZW50LnB1c2goLi4udmlzdWFsaXphdGlvbkNvbnRlbnQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y29uc3QgbWl4ZWRTdWJTZWN0aW9uOiBNaXhlZFN1YlNlY3Rpb24gPSB7XG5cdFx0XHRcdFx0Li4uc3ViU2VjdGlvbixcblx0XHRcdFx0XHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5NaXhlZCxcblx0XHRcdFx0XHRsZXZlbDogbGV2ZWwsXG5cdFx0XHRcdFx0Y29udGVudDogbWl4ZWRDb250ZW50XG5cdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiBtaXhlZFN1YlNlY3Rpb247XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBUaGlzIENvbGxlY3Rpb25GYWNldCBvbmx5IGluY2x1ZGVzIGNvbnRlbnQgdGhhdCBjYW4gYmUgcmVuZGVyZWQgaW4gYSBtZXJnZWQgZm9ybVxuXHRcdFx0XHRjb25zdCBmYWNldEFjdGlvbnMgPSBnZXRGYWNldEFjdGlvbnMoZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdFx0XHRmb3JtQ29sbGVjdGlvblN1YlNlY3Rpb246IEZvcm1TdWJTZWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0Li4uc3ViU2VjdGlvbixcblx0XHRcdFx0XHRcdHR5cGU6IFN1YlNlY3Rpb25UeXBlLkZvcm0sXG5cdFx0XHRcdFx0XHRmb3JtRGVmaW5pdGlvbjogY3JlYXRlRm9ybURlZmluaXRpb24oZmFjZXREZWZpbml0aW9uLCBpc1Zpc2libGUsIGNvbnZlcnRlckNvbnRleHQsIGZhY2V0QWN0aW9ucy5hY3Rpb25zKSxcblx0XHRcdFx0XHRcdGxldmVsOiBsZXZlbCxcblx0XHRcdFx0XHRcdGFjdGlvbnM6IGZhY2V0QWN0aW9ucy5hY3Rpb25zLmZpbHRlcigoYWN0aW9uKSA9PiBhY3Rpb24uZmFjZXROYW1lID09PSB1bmRlZmluZWQpLFxuXHRcdFx0XHRcdFx0Y29tbWFuZEFjdGlvbnM6IGZhY2V0QWN0aW9ucy5jb21tYW5kQWN0aW9uc1xuXHRcdFx0XHRcdH07XG5cdFx0XHRcdHJldHVybiBmb3JtQ29sbGVjdGlvblN1YlNlY3Rpb247XG5cdFx0XHR9XG5cdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldDpcblx0XHRcdGlmICghZmFjZXREZWZpbml0aW9uLlRhcmdldC4kdGFyZ2V0KSB7XG5cdFx0XHRcdHVuc3VwcG9ydGVkVGV4dCA9IGBVbmFibGUgdG8gZmluZCBhbm5vdGF0aW9uUGF0aCAke2ZhY2V0RGVmaW5pdGlvbi5UYXJnZXQudmFsdWV9YDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHN3aXRjaCAoZmFjZXREZWZpbml0aW9uLlRhcmdldC4kdGFyZ2V0LnRlcm0pIHtcblx0XHRcdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtOlxuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuQ2hhcnQ6XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudDpcblx0XHRcdFx0XHRcdGNvbnN0IHByZXNlbnRhdGlvbiA9IGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbihcblx0XHRcdFx0XHRcdFx0ZmFjZXREZWZpbml0aW9uLlRhcmdldC52YWx1ZSxcblx0XHRcdFx0XHRcdFx0Z2V0Q29uZGVuc2VkVGFibGVMYXlvdXRDb21wbGlhbmNlKGZhY2V0RGVmaW5pdGlvbiwgZmFjZXRzVG9DcmVhdGUsIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdFx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0XHRcdGlzSGVhZGVyU2VjdGlvblxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGNvbnN0IGNvbnRyb2xUaXRsZSA9XG5cdFx0XHRcdFx0XHRcdChwcmVzZW50YXRpb24udmlzdWFsaXphdGlvbnNbMF0gYXMgYW55KT8uYW5ub3RhdGlvbj8udGl0bGUgfHwgKHByZXNlbnRhdGlvbi52aXN1YWxpemF0aW9uc1swXSBhcyBhbnkpPy50aXRsZTtcblx0XHRcdFx0XHRcdGNvbnN0IHNob3dUaXRsZSA9IGlzU3Vic2VjdGlvblRpdGxlU2hvd24oaGFzU2luZ2xlQ29udGVudCwgc3ViU2VjdGlvbi50aXRsZSwgY29udHJvbFRpdGxlKTtcblxuXHRcdFx0XHRcdFx0Ly8gRWl0aGVyIGNhbGN1bGF0ZSB0aGUgdGl0bGUgdmlzaWJpbGl0eSBzdGF0aWNhbGx5IG9yIGR5bmFtaWNhbGx5XG5cdFx0XHRcdFx0XHQvLyBBZGRpdGlvbmFsbHkgdG8gY2hlY2tpbmcgd2hldGhlciBhIHRpdGxlIGV4aXN0cyxcblx0XHRcdFx0XHRcdC8vIHdlIGFsc28gbmVlZCB0byBjaGVjayB0aGF0IHRoZSBmYWNldCB0aXRsZSBpcyBub3QgdGhlIHNhbWUgYXMgdGhlIGNvbnRyb2wgKGkuZS4gdmlzdWFsaXphdGlvbikgdGl0bGU7XG5cdFx0XHRcdFx0XHQvLyB0aGlzIGlzIGRvbmUgYnkgaW5jbHVkaW5nIFwic2hvd1RpdGxlXCIgaW4gdGhlIGFuZCBleHByZXNzaW9uXG5cdFx0XHRcdFx0XHRjb25zdCB0aXRsZVZpc2libGUgPSBpZkVsc2UoXG5cdFx0XHRcdFx0XHRcdGlzRHluYW1pY0V4cHJlc3Npb24sXG5cdFx0XHRcdFx0XHRcdGFuZChpc1Zpc2libGVEeW5hbWljRXhwcmVzc2lvbiwgbm90KGVxdWFsKHRpdGxlLCBcInVuZGVmaW5lZFwiKSksIHNob3dUaXRsZSksXG5cdFx0XHRcdFx0XHRcdGFuZChpc1Zpc2libGUgIT09IHVuZGVmaW5lZCwgdGl0bGUgIT09IFwidW5kZWZpbmVkXCIsIHRpdGxlICE9PSB1bmRlZmluZWQsIGlzVmlzaWJsZUV4cHJlc3Npb24sIHNob3dUaXRsZSlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRjb25zdCBkYXRhVmlzdWFsaXphdGlvblN1YlNlY3Rpb246IERhdGFWaXN1YWxpemF0aW9uU3ViU2VjdGlvbiA9IHtcblx0XHRcdFx0XHRcdFx0Li4uc3ViU2VjdGlvbixcblx0XHRcdFx0XHRcdFx0dHlwZTogU3ViU2VjdGlvblR5cGUuRGF0YVZpc3VhbGl6YXRpb24sXG5cdFx0XHRcdFx0XHRcdGxldmVsOiBsZXZlbCxcblx0XHRcdFx0XHRcdFx0cHJlc2VudGF0aW9uOiBwcmVzZW50YXRpb24sXG5cdFx0XHRcdFx0XHRcdHNob3dUaXRsZTogc2hvd1RpdGxlLCAvLyBUaGlzIGlzIHVzZWQgb24gdGhlIE9iamVjdFBhZ2VTdWJTZWN0aW9uXG5cdFx0XHRcdFx0XHRcdHRpdGxlVmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24odGl0bGVWaXNpYmxlKSAvLyBUaGlzIGlzIHVzZWQgdG8gaGlkZSB0aGUgYWN0dWFsIFRpdGxlIGNvbnRyb2xcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRyZXR1cm4gZGF0YVZpc3VhbGl6YXRpb25TdWJTZWN0aW9uO1xuXG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5GaWVsZEdyb3VwOlxuXHRcdFx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuSWRlbnRpZmljYXRpb246XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5EYXRhUG9pbnQ6XG5cdFx0XHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5TdGF0dXNJbmZvOlxuXHRcdFx0XHRcdGNhc2UgQ29tbXVuaWNhdGlvbkFubm90YXRpb25UZXJtcy5Db250YWN0OlxuXHRcdFx0XHRcdFx0Ly8gQWxsIHRob3NlIGVsZW1lbnQgYmVsb25nIHRvIGEgZm9ybSBmYWNldFxuXHRcdFx0XHRcdFx0Y29uc3QgZmFjZXRBY3Rpb25zID0gZ2V0RmFjZXRBY3Rpb25zKGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRcdFx0XHRcdGZvcm1FbGVtZW50U3ViU2VjdGlvbjogRm9ybVN1YlNlY3Rpb24gPSB7XG5cdFx0XHRcdFx0XHRcdFx0Li4uc3ViU2VjdGlvbixcblx0XHRcdFx0XHRcdFx0XHR0eXBlOiBTdWJTZWN0aW9uVHlwZS5Gb3JtLFxuXHRcdFx0XHRcdFx0XHRcdGxldmVsOiBsZXZlbCxcblx0XHRcdFx0XHRcdFx0XHRmb3JtRGVmaW5pdGlvbjogY3JlYXRlRm9ybURlZmluaXRpb24oZmFjZXREZWZpbml0aW9uLCBpc1Zpc2libGUsIGNvbnZlcnRlckNvbnRleHQsIGZhY2V0QWN0aW9ucy5hY3Rpb25zKSxcblx0XHRcdFx0XHRcdFx0XHRhY3Rpb25zOiBmYWNldEFjdGlvbnMuYWN0aW9ucy5maWx0ZXIoKGFjdGlvbikgPT4gYWN0aW9uLmZhY2V0TmFtZSA9PT0gdW5kZWZpbmVkKSxcblx0XHRcdFx0XHRcdFx0XHRjb21tYW5kQWN0aW9uczogZmFjZXRBY3Rpb25zLmNvbW1hbmRBY3Rpb25zXG5cdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRyZXR1cm4gZm9ybUVsZW1lbnRTdWJTZWN0aW9uO1xuXG5cdFx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRcdHVuc3VwcG9ydGVkVGV4dCA9IGBGb3IgJHtmYWNldERlZmluaXRpb24uVGFyZ2V0LiR0YXJnZXQudGVybX0gRnJhZ21lbnRgO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlVVJMRmFjZXQ6XG5cdFx0XHR1bnN1cHBvcnRlZFRleHQgPSBcIkZvciBSZWZlcmVuY2UgVVJMIEZhY2V0XCI7XG5cdFx0XHRicmVhaztcblx0XHRkZWZhdWx0OlxuXHRcdFx0YnJlYWs7XG5cdH1cblx0Ly8gSWYgd2UgcmVhY2ggaGVyZSB3ZSBlbmRlZCB1cCB3aXRoIGFuIHVuc3VwcG9ydGVkIFN1YlNlY3Rpb24gdHlwZVxuXHRjb25zdCB1bnN1cHBvcnRlZFN1YlNlY3Rpb246IFVuc3VwcG9ydGVkU3ViU2VjdGlvbiA9IHtcblx0XHQuLi5zdWJTZWN0aW9uLFxuXHRcdHRleHQ6IHVuc3VwcG9ydGVkVGV4dFxuXHR9O1xuXHRyZXR1cm4gdW5zdXBwb3J0ZWRTdWJTZWN0aW9uO1xufVxuZnVuY3Rpb24gaXNTdWJzZWN0aW9uVGl0bGVTaG93bihcblx0aGFzU2luZ2xlQ29udGVudDogYm9vbGVhbixcblx0c3ViU2VjdGlvblRpdGxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbixcblx0Y29udHJvbFRpdGxlOiBzdHJpbmdcbik6IGJvb2xlYW4ge1xuXHRpZiAoaGFzU2luZ2xlQ29udGVudCAmJiBjb250cm9sVGl0bGUgPT09IHN1YlNlY3Rpb25UaXRsZSkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXHRyZXR1cm4gdHJ1ZTtcbn1cbmZ1bmN0aW9uIGNyZWF0ZUZvcm1BY3Rpb25SZWR1Y2VyKFxuXHRhY3Rpb25zOiBDb252ZXJ0ZXJBY3Rpb25bXSxcblx0ZmFjZXREZWZpbml0aW9uOiBSZWZlcmVuY2VGYWNldFR5cGVzLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBDb252ZXJ0ZXJBY3Rpb25bXSB7XG5cdGNvbnN0IHJlZmVyZW5jZVRhcmdldCA9IGZhY2V0RGVmaW5pdGlvbi5UYXJnZXQuJHRhcmdldDtcblx0Y29uc3QgdGFyZ2V0VmFsdWUgPSBmYWNldERlZmluaXRpb24uVGFyZ2V0LnZhbHVlO1xuXHRsZXQgbWFuaWZlc3RBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+ID0ge307XG5cdGxldCBkYXRhRmllbGRDb2xsZWN0aW9uOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzW10gPSBbXTtcblx0bGV0IFtuYXZpZ2F0aW9uUHJvcGVydHlQYXRoXTogYW55ID0gdGFyZ2V0VmFsdWUuc3BsaXQoXCJAXCIpO1xuXHRpZiAobmF2aWdhdGlvblByb3BlcnR5UGF0aC5sZW5ndGggPiAwKSB7XG5cdFx0aWYgKG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgubGFzdEluZGV4T2YoXCIvXCIpID09PSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCAtIDEpIHtcblx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPSBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLnN1YnN0cigwLCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoLmxlbmd0aCAtIDEpO1xuXHRcdH1cblx0fSBlbHNlIHtcblx0XHRuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID0gdW5kZWZpbmVkO1xuXHR9XG5cblx0aWYgKHJlZmVyZW5jZVRhcmdldCkge1xuXHRcdHN3aXRjaCAocmVmZXJlbmNlVGFyZ2V0LnRlcm0pIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuRmllbGRHcm91cDpcblx0XHRcdFx0ZGF0YUZpZWxkQ29sbGVjdGlvbiA9IChyZWZlcmVuY2VUYXJnZXQgYXMgRmllbGRHcm91cCkuRGF0YTtcblx0XHRcdFx0bWFuaWZlc3RBY3Rpb25zID0gZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0LmdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24ocmVmZXJlbmNlVGFyZ2V0KS5hY3Rpb25zLFxuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdGZhY2V0RGVmaW5pdGlvbi5mdWxseVF1YWxpZmllZE5hbWVcblx0XHRcdFx0KS5hY3Rpb25zO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuSWRlbnRpZmljYXRpb246XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLlN0YXR1c0luZm86XG5cdFx0XHRcdGlmIChyZWZlcmVuY2VUYXJnZXQucXVhbGlmaWVyKSB7XG5cdFx0XHRcdFx0ZGF0YUZpZWxkQ29sbGVjdGlvbiA9IHJlZmVyZW5jZVRhcmdldDtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0fVxuXG5cdGFjdGlvbnMgPSBkYXRhRmllbGRDb2xsZWN0aW9uLnJlZHVjZSgoYWN0aW9uUmVkdWNlciwgZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSA9PiB7XG5cdFx0c3dpdGNoIChkYXRhRmllbGQuJFR5cGUpIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uOlxuXHRcdFx0XHRpZiAoZGF0YUZpZWxkLlJlcXVpcmVzQ29udGV4dD8udmFsdWVPZigpID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdFx0XHRcdFx0LmdldERpYWdub3N0aWNzKClcblx0XHRcdFx0XHRcdC5hZGRJc3N1ZShJc3N1ZUNhdGVnb3J5LkFubm90YXRpb24sIElzc3VlU2V2ZXJpdHkuTG93LCBJc3N1ZVR5cGUuTUFMRk9STUVEX0RBVEFGSUVMRF9GT1JfSUJOLlJFUVVJUkVTQ09OVEVYVCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGRhdGFGaWVsZC5JbmxpbmU/LnZhbHVlT2YoKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0XHRcdC5nZXREaWFnbm9zdGljcygpXG5cdFx0XHRcdFx0XHQuYWRkSXNzdWUoSXNzdWVDYXRlZ29yeS5Bbm5vdGF0aW9uLCBJc3N1ZVNldmVyaXR5LkxvdywgSXNzdWVUeXBlLk1BTEZPUk1FRF9EQVRBRklFTERfRk9SX0lCTi5JTkxJTkUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChkYXRhRmllbGQuRGV0ZXJtaW5pbmc/LnZhbHVlT2YoKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0XHRcdC5nZXREaWFnbm9zdGljcygpXG5cdFx0XHRcdFx0XHQuYWRkSXNzdWUoSXNzdWVDYXRlZ29yeS5Bbm5vdGF0aW9uLCBJc3N1ZVNldmVyaXR5LkxvdywgSXNzdWVUeXBlLk1BTEZPUk1FRF9EQVRBRklFTERfRk9SX0lCTi5ERVRFUk1JTklORyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgbU5hdmlnYXRpb25QYXJhbWV0ZXJzOiBhbnkgPSB7fTtcblx0XHRcdFx0aWYgKGRhdGFGaWVsZC5NYXBwaW5nKSB7XG5cdFx0XHRcdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzLnNlbWFudGljT2JqZWN0TWFwcGluZyA9IGdldFNlbWFudGljT2JqZWN0TWFwcGluZyhkYXRhRmllbGQuTWFwcGluZyk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YWN0aW9uUmVkdWNlci5wdXNoKHtcblx0XHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0XHRcdFx0XHRpZDogZ2V0Rm9ybUlEKHsgRmFjZXQ6IGZhY2V0RGVmaW5pdGlvbiB9LCBkYXRhRmllbGQpLFxuXHRcdFx0XHRcdGtleTogS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpLFxuXHRcdFx0XHRcdHRleHQ6IGRhdGFGaWVsZC5MYWJlbD8udG9TdHJpbmcoKSxcblx0XHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogXCJcIixcblx0XHRcdFx0XHRlbmFibGVkOlxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkLk5hdmlnYXRpb25BdmFpbGFibGUgIT09IHVuZGVmaW5lZFxuXHRcdFx0XHRcdFx0XHQ/IGNvbXBpbGVFeHByZXNzaW9uKGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGQuTmF2aWdhdGlvbkF2YWlsYWJsZT8udmFsdWVPZigpKSwgdHJ1ZSkpXG5cdFx0XHRcdFx0XHRcdDogXCJ0cnVlXCIsXG5cdFx0XHRcdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24obm90KGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSksIHRydWUpKSksXG5cdFx0XHRcdFx0YnV0dG9uVHlwZTogZ2V0QnV0dG9uVHlwZShkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5FbXBoYXNpemVkKSxcblx0XHRcdFx0XHRwcmVzczogY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFx0XHRmbihcIi5faW50ZW50QmFzZWROYXZpZ2F0aW9uLm5hdmlnYXRlXCIsIFtcblx0XHRcdFx0XHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFGaWVsZC5TZW1hbnRpY09iamVjdCksXG5cdFx0XHRcdFx0XHRcdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGQuQWN0aW9uKSxcblx0XHRcdFx0XHRcdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzXG5cdFx0XHRcdFx0XHRdKVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0Y3VzdG9tRGF0YTogY29tcGlsZUV4cHJlc3Npb24oe1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3Q6IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGQuU2VtYW50aWNPYmplY3QpLFxuXHRcdFx0XHRcdFx0YWN0aW9uOiBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLkFjdGlvbilcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFjdGlvbjpcblx0XHRcdFx0Y29uc3QgZm9ybU1hbmlmZXN0QWN0aW9uc0NvbmZpZ3VyYXRpb246IGFueSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbihyZWZlcmVuY2VUYXJnZXQpLmFjdGlvbnM7XG5cdFx0XHRcdGNvbnN0IGtleTogc3RyaW5nID0gS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpO1xuXHRcdFx0XHRhY3Rpb25SZWR1Y2VyLnB1c2goe1xuXHRcdFx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGF0YUZpZWxkRm9yQWN0aW9uLFxuXHRcdFx0XHRcdGlkOiBnZXRGb3JtSUQoeyBGYWNldDogZmFjZXREZWZpbml0aW9uIH0sIGRhdGFGaWVsZCksXG5cdFx0XHRcdFx0a2V5OiBrZXksXG5cdFx0XHRcdFx0dGV4dDogZGF0YUZpZWxkLkxhYmVsPy50b1N0cmluZygpLFxuXHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBcIlwiLFxuXHRcdFx0XHRcdGVuYWJsZWQ6IGdldEVuYWJsZWRGb3JBbm5vdGF0aW9uQWN0aW9uKGNvbnZlcnRlckNvbnRleHQsIGRhdGFGaWVsZC5BY3Rpb25UYXJnZXQpLFxuXHRcdFx0XHRcdGJpbmRpbmc6IG5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggPyBgeyAncGF0aCcgOiAnJHtuYXZpZ2F0aW9uUHJvcGVydHlQYXRofSd9YCA6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpKSwgdHJ1ZSkpKSxcblx0XHRcdFx0XHRyZXF1aXJlc0RpYWxvZzogaXNEaWFsb2coZGF0YUZpZWxkLkFjdGlvblRhcmdldCksXG5cdFx0XHRcdFx0YnV0dG9uVHlwZTogZ2V0QnV0dG9uVHlwZShkYXRhRmllbGQuYW5ub3RhdGlvbnM/LlVJPy5FbXBoYXNpemVkKSxcblx0XHRcdFx0XHRwcmVzczogY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFx0XHRmbihcblx0XHRcdFx0XHRcdFx0XCJpbnZva2VBY3Rpb25cIixcblx0XHRcdFx0XHRcdFx0W1xuXHRcdFx0XHRcdFx0XHRcdGRhdGFGaWVsZC5BY3Rpb24sXG5cdFx0XHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29udGV4dHM6IGZuKFwiZ2V0QmluZGluZ0NvbnRleHRcIiwgW10sIHBhdGhJbk1vZGVsKFwiXCIsIFwiJHNvdXJjZVwiKSksXG5cdFx0XHRcdFx0XHRcdFx0XHRpbnZvY2F0aW9uR3JvdXBpbmc6IChkYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nID09PSBcIlVJLk9wZXJhdGlvbkdyb3VwaW5nVHlwZS9DaGFuZ2VTZXRcIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ/IFwiQ2hhbmdlU2V0XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0OiBcIklzb2xhdGVkXCIpIGFzIE9wZXJhdGlvbkdyb3VwaW5nVHlwZSxcblx0XHRcdFx0XHRcdFx0XHRcdGxhYmVsOiBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLkxhYmVsKSxcblx0XHRcdFx0XHRcdFx0XHRcdG1vZGVsOiBmbihcImdldE1vZGVsXCIsIFtdLCBwYXRoSW5Nb2RlbChcIi9cIiwgXCIkc291cmNlXCIpKSxcblx0XHRcdFx0XHRcdFx0XHRcdGlzTmF2aWdhYmxlOiBpc0FjdGlvbk5hdmlnYWJsZShcblx0XHRcdFx0XHRcdFx0XHRcdFx0Zm9ybU1hbmlmZXN0QWN0aW9uc0NvbmZpZ3VyYXRpb24gJiYgZm9ybU1hbmlmZXN0QWN0aW9uc0NvbmZpZ3VyYXRpb25ba2V5XVxuXHRcdFx0XHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XSxcblx0XHRcdFx0XHRcdFx0cmVmKFwiLmVkaXRGbG93XCIpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0XHRmYWNldE5hbWU6IGRhdGFGaWVsZC5JbmxpbmUgPyBmYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lIDogdW5kZWZpbmVkXG5cdFx0XHRcdH0pO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gYWN0aW9uUmVkdWNlcjtcblx0fSwgYWN0aW9ucyk7XG5cdHJldHVybiBpbnNlcnRDdXN0b21FbGVtZW50cyhhY3Rpb25zLCBtYW5pZmVzdEFjdGlvbnMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNEaWFsb2coYWN0aW9uRGVmaW5pdGlvbjogYW55IHwgdW5kZWZpbmVkKTogc3RyaW5nIHtcblx0aWYgKGFjdGlvbkRlZmluaXRpb24pIHtcblx0XHRjb25zdCBiQ3JpdGljYWwgPSBhY3Rpb25EZWZpbml0aW9uLmFubm90YXRpb25zPy5Db21tb24/LklzQWN0aW9uQ3JpdGljYWw7XG5cdFx0aWYgKGFjdGlvbkRlZmluaXRpb24ucGFyYW1ldGVycy5sZW5ndGggPiAxIHx8IGJDcml0aWNhbCkge1xuXHRcdFx0cmV0dXJuIFwiRGlhbG9nXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBcIk5vbmVcIjtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIFwiTm9uZVwiO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVDdXN0b21TdWJTZWN0aW9ucyhcblx0bWFuaWZlc3RTdWJTZWN0aW9uczogUmVjb3JkPHN0cmluZywgTWFuaWZlc3RTdWJTZWN0aW9uPixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogUmVjb3JkPHN0cmluZywgQ3VzdG9tT2JqZWN0UGFnZVN1YlNlY3Rpb24+IHtcblx0Y29uc3Qgc3ViU2VjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VTdWJTZWN0aW9uPiA9IHt9O1xuXHRPYmplY3Qua2V5cyhtYW5pZmVzdFN1YlNlY3Rpb25zKS5mb3JFYWNoKFxuXHRcdChzdWJTZWN0aW9uS2V5KSA9PlxuXHRcdFx0KHN1YlNlY3Rpb25zW3N1YlNlY3Rpb25LZXldID0gY3JlYXRlQ3VzdG9tU3ViU2VjdGlvbihtYW5pZmVzdFN1YlNlY3Rpb25zW3N1YlNlY3Rpb25LZXldLCBzdWJTZWN0aW9uS2V5LCBjb252ZXJ0ZXJDb250ZXh0KSlcblx0KTtcblx0cmV0dXJuIHN1YlNlY3Rpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ3VzdG9tU3ViU2VjdGlvbihcblx0bWFuaWZlc3RTdWJTZWN0aW9uOiBNYW5pZmVzdFN1YlNlY3Rpb24sXG5cdHN1YlNlY3Rpb25LZXk6IHN0cmluZyxcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogQ3VzdG9tT2JqZWN0UGFnZVN1YlNlY3Rpb24ge1xuXHRjb25zdCBzaWRlQ29udGVudDogU2lkZUNvbnRlbnREZWYgfCB1bmRlZmluZWQgPSBtYW5pZmVzdFN1YlNlY3Rpb24uc2lkZUNvbnRlbnRcblx0XHQ/IHtcblx0XHRcdFx0dGVtcGxhdGU6IG1hbmlmZXN0U3ViU2VjdGlvbi5zaWRlQ29udGVudC50ZW1wbGF0ZSxcblx0XHRcdFx0aWQ6IGdldFNpZGVDb250ZW50SUQoc3ViU2VjdGlvbktleSksXG5cdFx0XHRcdHZpc2libGU6IGZhbHNlLFxuXHRcdFx0XHRlcXVhbFNwbGl0OiBtYW5pZmVzdFN1YlNlY3Rpb24uc2lkZUNvbnRlbnQuZXF1YWxTcGxpdFxuXHRcdCAgfVxuXHRcdDogdW5kZWZpbmVkO1xuXHRsZXQgcG9zaXRpb24gPSBtYW5pZmVzdFN1YlNlY3Rpb24ucG9zaXRpb247XG5cdGlmICghcG9zaXRpb24pIHtcblx0XHRwb3NpdGlvbiA9IHtcblx0XHRcdHBsYWNlbWVudDogUGxhY2VtZW50LkFmdGVyXG5cdFx0fTtcblx0fVxuXHRjb25zdCBpc1Zpc2libGUgPSBtYW5pZmVzdFN1YlNlY3Rpb24udmlzaWJsZSAhPT0gdW5kZWZpbmVkID8gbWFuaWZlc3RTdWJTZWN0aW9uLnZpc2libGUgOiB0cnVlO1xuXHRjb25zdCBpc0R5bmFtaWNFeHByZXNzaW9uID0gaXNWaXNpYmxlICYmIHR5cGVvZiBpc1Zpc2libGUgPT09IFwic3RyaW5nXCIgJiYgaXNWaXNpYmxlLmluZGV4T2YoXCJ7PVwiKSA9PT0gMDtcblx0Y29uc3QgbWFuaWZlc3RBY3Rpb25zID0gZ2V0QWN0aW9uc0Zyb21NYW5pZmVzdChtYW5pZmVzdFN1YlNlY3Rpb24uYWN0aW9ucywgY29udmVydGVyQ29udGV4dCk7XG5cdGNvbnN0IHN1YlNlY3Rpb25EZWZpbml0aW9uID0ge1xuXHRcdHR5cGU6IFN1YlNlY3Rpb25UeXBlLlVua25vd24sXG5cdFx0aWQ6IG1hbmlmZXN0U3ViU2VjdGlvbi5pZCB8fCBnZXRDdXN0b21TdWJTZWN0aW9uSUQoc3ViU2VjdGlvbktleSksXG5cdFx0YWN0aW9uczogbWFuaWZlc3RBY3Rpb25zLmFjdGlvbnMsXG5cdFx0a2V5OiBzdWJTZWN0aW9uS2V5LFxuXHRcdHRpdGxlOiBtYW5pZmVzdFN1YlNlY3Rpb24udGl0bGUsXG5cdFx0bGV2ZWw6IDEsXG5cdFx0cG9zaXRpb246IHBvc2l0aW9uLFxuXHRcdHZpc2libGU6IG1hbmlmZXN0U3ViU2VjdGlvbi52aXNpYmxlICE9PSB1bmRlZmluZWQgPyBtYW5pZmVzdFN1YlNlY3Rpb24udmlzaWJsZSA6IHRydWUsXG5cdFx0c2lkZUNvbnRlbnQ6IHNpZGVDb250ZW50LFxuXHRcdGlzVmlzaWJpbGl0eUR5bmFtaWM6IGlzRHluYW1pY0V4cHJlc3Npb25cblx0fTtcblx0aWYgKG1hbmlmZXN0U3ViU2VjdGlvbi50ZW1wbGF0ZSB8fCBtYW5pZmVzdFN1YlNlY3Rpb24ubmFtZSkge1xuXHRcdHN1YlNlY3Rpb25EZWZpbml0aW9uLnR5cGUgPSBTdWJTZWN0aW9uVHlwZS5YTUxGcmFnbWVudDtcblx0XHQoc3ViU2VjdGlvbkRlZmluaXRpb24gYXMgdW5rbm93biBhcyBYTUxGcmFnbWVudFN1YlNlY3Rpb24pLnRlbXBsYXRlID0gbWFuaWZlc3RTdWJTZWN0aW9uLnRlbXBsYXRlIHx8IG1hbmlmZXN0U3ViU2VjdGlvbi5uYW1lIHx8IFwiXCI7XG5cdH0gZWxzZSB7XG5cdFx0c3ViU2VjdGlvbkRlZmluaXRpb24udHlwZSA9IFN1YlNlY3Rpb25UeXBlLlBsYWNlaG9sZGVyO1xuXHR9XG5cdHJldHVybiBzdWJTZWN0aW9uRGVmaW5pdGlvbiBhcyBDdXN0b21PYmplY3RQYWdlU3ViU2VjdGlvbjtcbn1cblxuLyoqXG4gKiBFdmFsdWF0ZSBpZiB0aGUgY29uZGVuc2VkIG1vZGUgY2FuIGJlIGFwcGxpM2VkIG9uIHRoZSB0YWJsZS5cbiAqXG4gKiBAcGFyYW0gY3VycmVudEZhY2V0XG4gKiBAcGFyYW0gZmFjZXRzVG9DcmVhdGVJblNlY3Rpb25cbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBgdHJ1ZWAgZm9yIGNvbXBsaWFudCwgZmFsc2Ugb3RoZXJ3aXNlXG4gKi9cbmZ1bmN0aW9uIGdldENvbmRlbnNlZFRhYmxlTGF5b3V0Q29tcGxpYW5jZShcblx0Y3VycmVudEZhY2V0OiBGYWNldFR5cGVzLFxuXHRmYWNldHNUb0NyZWF0ZUluU2VjdGlvbjogRmFjZXRUeXBlc1tdLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBib29sZWFuIHtcblx0Y29uc3QgbWFuaWZlc3RXcmFwcGVyID0gY29udmVydGVyQ29udGV4dC5nZXRNYW5pZmVzdFdyYXBwZXIoKTtcblx0aWYgKG1hbmlmZXN0V3JhcHBlci51c2VJY29uVGFiQmFyKCkpIHtcblx0XHQvLyBJZiB0aGUgT1AgdXNlIHRoZSB0YWIgYmFzZWQgd2UgY2hlY2sgaWYgdGhlIGZhY2V0cyB0aGF0IHdpbGwgYmUgY3JlYXRlZCBmb3IgdGhpcyBzZWN0aW9uIGFyZSBhbGwgbm9uIHZpc2libGVcblx0XHRyZXR1cm4gaGFzTm9PdGhlclZpc2libGVUYWJsZUluVGFyZ2V0cyhjdXJyZW50RmFjZXQsIGZhY2V0c1RvQ3JlYXRlSW5TZWN0aW9uKTtcblx0fSBlbHNlIHtcblx0XHRjb25zdCBlbnRpdHlUeXBlID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCk7XG5cdFx0aWYgKGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5GYWNldHM/Lmxlbmd0aCAmJiBlbnRpdHlUeXBlLmFubm90YXRpb25zPy5VST8uRmFjZXRzPy5sZW5ndGggPiAxKSB7XG5cdFx0XHRyZXR1cm4gaGFzTm9PdGhlclZpc2libGVUYWJsZUluVGFyZ2V0cyhjdXJyZW50RmFjZXQsIGZhY2V0c1RvQ3JlYXRlSW5TZWN0aW9uKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9XG59XG5cbmZ1bmN0aW9uIGhhc05vT3RoZXJWaXNpYmxlVGFibGVJblRhcmdldHMoY3VycmVudEZhY2V0OiBGYWNldFR5cGVzLCBmYWNldHNUb0NyZWF0ZUluU2VjdGlvbjogRmFjZXRUeXBlc1tdKTogYm9vbGVhbiB7XG5cdHJldHVybiBmYWNldHNUb0NyZWF0ZUluU2VjdGlvbi5ldmVyeShmdW5jdGlvbiAoc3ViRmFjZXQpIHtcblx0XHRpZiAoc3ViRmFjZXQgIT09IGN1cnJlbnRGYWNldCkge1xuXHRcdFx0aWYgKHN1YkZhY2V0LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldCkge1xuXHRcdFx0XHRjb25zdCByZWZGYWNldCA9IHN1YkZhY2V0O1xuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0cmVmRmFjZXQuVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbSB8fFxuXHRcdFx0XHRcdHJlZkZhY2V0LlRhcmdldD8uJHRhcmdldD8udGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuUHJlc2VudGF0aW9uVmFyaWFudCB8fFxuXHRcdFx0XHRcdHJlZkZhY2V0LlRhcmdldC4kdGFyZ2V0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50XG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHJldHVybiByZWZGYWNldC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiAhPT0gdW5kZWZpbmVkID8gcmVmRmFjZXQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4gOiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IHN1YkNvbGxlY3Rpb25GYWNldCA9IHN1YkZhY2V0IGFzIENvbGxlY3Rpb25GYWNldFR5cGVzO1xuXHRcdFx0XHRyZXR1cm4gc3ViQ29sbGVjdGlvbkZhY2V0LkZhY2V0cy5ldmVyeShmdW5jdGlvbiAoZmFjZXQpIHtcblx0XHRcdFx0XHRjb25zdCBzdWJSZWZGYWNldCA9IGZhY2V0IGFzIFJlZmVyZW5jZUZhY2V0VHlwZXM7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0c3ViUmVmRmFjZXQuVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbSB8fFxuXHRcdFx0XHRcdFx0c3ViUmVmRmFjZXQuVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50IHx8XG5cdFx0XHRcdFx0XHRzdWJSZWZGYWNldC5UYXJnZXQ/LiR0YXJnZXQ/LnRlcm0gPT09IFVJQW5ub3RhdGlvblRlcm1zLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdHJldHVybiBzdWJSZWZGYWNldC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiAhPT0gdW5kZWZpbmVkID8gc3ViUmVmRmFjZXQuYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4gOiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSk7XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQXVEWUEsY0FBYztFQUFBLFdBQWRBLGNBQWM7SUFBZEEsY0FBYztJQUFkQSxjQUFjO0lBQWRBLGNBQWM7SUFBZEEsY0FBYztJQUFkQSxjQUFjO0lBQWRBLGNBQWM7RUFBQSxHQUFkQSxjQUFjLEtBQWRBLGNBQWM7RUFBQTtFQXlGMUIsSUFBTUMsa0JBQTRCLEdBQUcsd0xBS3BDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTQyxpQkFBaUIsQ0FDaENDLGVBQTZCLEVBQzdCQyxnQkFBa0MsRUFDbENDLGVBQXlCLEVBQ0E7SUFDekI7SUFDQSxJQUFNQyxjQUFjLEdBQUdILGVBQWUsQ0FBQ0ksTUFBTSxDQUFDLFVBQUNELGNBQTRCLEVBQUVFLGVBQWUsRUFBSztNQUNoRyxRQUFRQSxlQUFlLENBQUNDLEtBQUs7UUFDNUI7VUFDQ0gsY0FBYyxDQUFDSSxJQUFJLENBQUNGLGVBQWUsQ0FBQztVQUNwQztRQUNE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