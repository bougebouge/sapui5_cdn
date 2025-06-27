/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/annotations/DataField", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/ID", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "../../../helpers/StableIdHelper", "../../helpers/DataFieldHelper", "../Common/Form"], function (DataField, ConfigurableObject, ID, Key, BindingToolkit, StableIdHelper, DataFieldHelper, Form) {
  "use strict";

  var _exports = {};
  var getFormElementsFromManifest = Form.getFormElementsFromManifest;
  var FormElementType = Form.FormElementType;
  var isReferencePropertyStaticallyHidden = DataFieldHelper.isReferencePropertyStaticallyHidden;
  var isAnnotationFieldStaticallyHidden = DataFieldHelper.isAnnotationFieldStaticallyHidden;
  var generate = StableIdHelper.generate;
  var not = BindingToolkit.not;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var getHeaderFacetID = ID.getHeaderFacetID;
  var getHeaderFacetFormID = ID.getHeaderFacetFormID;
  var getHeaderFacetContainerID = ID.getHeaderFacetContainerID;
  var getCustomHeaderFacetID = ID.getCustomHeaderFacetID;
  var Placement = ConfigurableObject.Placement;
  var insertCustomElements = ConfigurableObject.insertCustomElements;
  var getSemanticObjectPath = DataField.getSemanticObjectPath;
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  // region definitions
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Definitions: Header Facet Types, Generic OP Header Facet, Manifest Properties for Custom Header Facet
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  var HeaderFacetType;
  (function (HeaderFacetType) {
    HeaderFacetType["Annotation"] = "Annotation";
    HeaderFacetType["XMLFragment"] = "XMLFragment";
  })(HeaderFacetType || (HeaderFacetType = {}));
  _exports.HeaderFacetType = HeaderFacetType;
  var FacetType;
  (function (FacetType) {
    FacetType["Reference"] = "Reference";
    FacetType["Collection"] = "Collection";
  })(FacetType || (FacetType = {}));
  _exports.FacetType = FacetType;
  var FlexDesignTimeType;
  (function (FlexDesignTimeType) {
    FlexDesignTimeType["Default"] = "Default";
    FlexDesignTimeType["NotAdaptable"] = "not-adaptable";
    FlexDesignTimeType["NotAdaptableTree"] = "not-adaptable-tree";
    FlexDesignTimeType["NotAdaptableVisibility"] = "not-adaptable-visibility";
  })(FlexDesignTimeType || (FlexDesignTimeType = {}));
  _exports.FlexDesignTimeType = FlexDesignTimeType;
  var HeaderDataPointType;
  (function (HeaderDataPointType) {
    HeaderDataPointType["ProgressIndicator"] = "ProgressIndicator";
    HeaderDataPointType["RatingIndicator"] = "RatingIndicator";
    HeaderDataPointType["Content"] = "Content";
  })(HeaderDataPointType || (HeaderDataPointType = {}));
  var TargetAnnotationType;
  (function (TargetAnnotationType) {
    TargetAnnotationType["None"] = "None";
    TargetAnnotationType["DataPoint"] = "DataPoint";
    TargetAnnotationType["Chart"] = "Chart";
    TargetAnnotationType["Identification"] = "Identification";
    TargetAnnotationType["Contact"] = "Contact";
    TargetAnnotationType["Address"] = "Address";
    TargetAnnotationType["FieldGroup"] = "FieldGroup";
  })(TargetAnnotationType || (TargetAnnotationType = {}));
  // endregion definitions

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Collect All Header Facets: Custom (via Manifest) and Annotation Based (via Metamodel)
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  /**
   * Retrieve header facets from annotations.
   *
   * @param converterContext
   * @returns Header facets from annotations
   */
  function getHeaderFacetsFromAnnotations(converterContext) {
    var _converterContext$get, _converterContext$get2, _converterContext$get3;
    var headerFacets = [];
    (_converterContext$get = converterContext.getEntityType().annotations) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.UI) === null || _converterContext$get2 === void 0 ? void 0 : (_converterContext$get3 = _converterContext$get2.HeaderFacets) === null || _converterContext$get3 === void 0 ? void 0 : _converterContext$get3.forEach(function (facet) {
      var headerFacet = createHeaderFacet(facet, converterContext);
      if (headerFacet) {
        headerFacets.push(headerFacet);
      }
    });
    return headerFacets;
  }

  /**
   * Retrieve custom header facets from manifest.
   *
   * @param manifestCustomHeaderFacets
   * @returns HeaderFacets from manifest
   */
  _exports.getHeaderFacetsFromAnnotations = getHeaderFacetsFromAnnotations;
  function getHeaderFacetsFromManifest(manifestCustomHeaderFacets) {
    var customHeaderFacets = {};
    Object.keys(manifestCustomHeaderFacets).forEach(function (manifestHeaderFacetKey) {
      var customHeaderFacet = manifestCustomHeaderFacets[manifestHeaderFacetKey];
      customHeaderFacets[manifestHeaderFacetKey] = createCustomHeaderFacet(customHeaderFacet, manifestHeaderFacetKey);
    });
    return customHeaderFacets;
  }

  /**
   * Retrieve stashed settings for header facets from manifest.
   *
   * @param facetDefinition
   * @param collectionFacetDefinition
   * @param converterContext
   * @returns Stashed setting for header facet or false
   */
  _exports.getHeaderFacetsFromManifest = getHeaderFacetsFromManifest;
  function getStashedSettingsForHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext) {
    var _headerFacetsControlC;
    // When a HeaderFacet is nested inside a CollectionFacet, stashing is not supported
    if (facetDefinition.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet" && collectionFacetDefinition.$Type === "com.sap.vocabularies.UI.v1.CollectionFacet") {
      return false;
    }
    var headerFacetID = generate([{
      Facet: facetDefinition
    }]);
    var headerFacetsControlConfig = converterContext.getManifestWrapper().getHeaderFacets();
    var stashedSetting = (_headerFacetsControlC = headerFacetsControlConfig[headerFacetID]) === null || _headerFacetsControlC === void 0 ? void 0 : _headerFacetsControlC.stashed;
    return stashedSetting === true;
  }

  /**
   * Retrieve flexibility designtime settings from manifest.
   *
   * @param facetDefinition
   * @param collectionFacetDefinition
   * @param converterContext
   * @returns Designtime setting or default
   */
  _exports.getStashedSettingsForHeaderFacet = getStashedSettingsForHeaderFacet;
  function getDesignTimeMetadataSettingsForHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext) {
    var designTimeMetadata = FlexDesignTimeType.Default;
    var headerFacetID = generate([{
      Facet: facetDefinition
    }]);

    // For HeaderFacets nested inside CollectionFacet RTA should be disabled, therefore set to "not-adaptable-tree"
    if (facetDefinition.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet" && collectionFacetDefinition.$Type === "com.sap.vocabularies.UI.v1.CollectionFacet") {
      designTimeMetadata = FlexDesignTimeType.NotAdaptableTree;
    } else {
      var headerFacetsControlConfig = converterContext.getManifestWrapper().getHeaderFacets();
      if (headerFacetID) {
        var _headerFacetsControlC2, _headerFacetsControlC3;
        var designTime = (_headerFacetsControlC2 = headerFacetsControlConfig[headerFacetID]) === null || _headerFacetsControlC2 === void 0 ? void 0 : (_headerFacetsControlC3 = _headerFacetsControlC2.flexSettings) === null || _headerFacetsControlC3 === void 0 ? void 0 : _headerFacetsControlC3.designtime;
        switch (designTime) {
          case FlexDesignTimeType.NotAdaptable:
          case FlexDesignTimeType.NotAdaptableTree:
          case FlexDesignTimeType.NotAdaptableVisibility:
            designTimeMetadata = designTime;
            break;
          default:
            break;
        }
      }
    }
    return designTimeMetadata;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Convert & Build Annotation Based Header Facets
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  _exports.getDesignTimeMetadataSettingsForHeaderFacet = getDesignTimeMetadataSettingsForHeaderFacet;
  function createReferenceHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext) {
    var _facetDefinition$anno, _facetDefinition$anno2, _facetDefinition$anno3;
    if (facetDefinition.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet" && !(((_facetDefinition$anno = facetDefinition.annotations) === null || _facetDefinition$anno === void 0 ? void 0 : (_facetDefinition$anno2 = _facetDefinition$anno.UI) === null || _facetDefinition$anno2 === void 0 ? void 0 : (_facetDefinition$anno3 = _facetDefinition$anno2.Hidden) === null || _facetDefinition$anno3 === void 0 ? void 0 : _facetDefinition$anno3.valueOf()) === true)) {
      var _facetDefinition$Targ, _facetDefinition$Targ2;
      var headerFacetID = getHeaderFacetID({
          Facet: facetDefinition
        }),
        getHeaderFacetKey = function (facetDefinitionToCheck, fallback) {
          var _facetDefinitionToChe, _facetDefinitionToChe2;
          return ((_facetDefinitionToChe = facetDefinitionToCheck.ID) === null || _facetDefinitionToChe === void 0 ? void 0 : _facetDefinitionToChe.toString()) || ((_facetDefinitionToChe2 = facetDefinitionToCheck.Label) === null || _facetDefinitionToChe2 === void 0 ? void 0 : _facetDefinitionToChe2.toString()) || fallback;
        },
        targetAnnotationValue = facetDefinition.Target.value,
        targetAnnotationType = getTargetAnnotationType(facetDefinition);
      var headerFormData;
      var headerDataPointData;
      switch (targetAnnotationType) {
        case TargetAnnotationType.FieldGroup:
          headerFormData = getFieldGroupFormData(facetDefinition, converterContext);
          break;
        case TargetAnnotationType.DataPoint:
          headerDataPointData = getDataPointData(facetDefinition, converterContext);
          break;
        // ToDo: Handle other cases
        default:
          break;
      }
      var annotations = facetDefinition.annotations;
      if (((_facetDefinition$Targ = facetDefinition.Target) === null || _facetDefinition$Targ === void 0 ? void 0 : (_facetDefinition$Targ2 = _facetDefinition$Targ.$target) === null || _facetDefinition$Targ2 === void 0 ? void 0 : _facetDefinition$Targ2.term) === "com.sap.vocabularies.UI.v1.Chart" && isAnnotationFieldStaticallyHidden(facetDefinition)) {
        return undefined;
      } else {
        var _annotations$UI, _annotations$UI$Hidde;
        return {
          type: HeaderFacetType.Annotation,
          facetType: FacetType.Reference,
          id: headerFacetID,
          containerId: getHeaderFacetContainerID({
            Facet: facetDefinition
          }),
          key: getHeaderFacetKey(facetDefinition, headerFacetID),
          flexSettings: {
            designtime: getDesignTimeMetadataSettingsForHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext)
          },
          stashed: getStashedSettingsForHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext),
          visible: compileExpression(not(equal(getExpressionFromAnnotation(annotations === null || annotations === void 0 ? void 0 : (_annotations$UI = annotations.UI) === null || _annotations$UI === void 0 ? void 0 : (_annotations$UI$Hidde = _annotations$UI.Hidden) === null || _annotations$UI$Hidde === void 0 ? void 0 : _annotations$UI$Hidde.valueOf()), true))),
          annotationPath: "".concat(converterContext.getEntitySetBasedAnnotationPath(facetDefinition.fullyQualifiedName), "/"),
          targetAnnotationValue: targetAnnotationValue,
          targetAnnotationType: targetAnnotationType,
          headerFormData: headerFormData,
          headerDataPointData: headerDataPointData
        };
      }
    }
    return undefined;
  }
  function createCollectionHeaderFacet(collectionFacetDefinition, converterContext) {
    if (collectionFacetDefinition.$Type === "com.sap.vocabularies.UI.v1.CollectionFacet") {
      var _collectionFacetDefin, _collectionFacetDefin2, _collectionFacetDefin3;
      var facets = [],
        headerFacetID = getHeaderFacetID({
          Facet: collectionFacetDefinition
        }),
        getHeaderFacetKey = function (facetDefinition, fallback) {
          var _facetDefinition$ID, _facetDefinition$Labe;
          return ((_facetDefinition$ID = facetDefinition.ID) === null || _facetDefinition$ID === void 0 ? void 0 : _facetDefinition$ID.toString()) || ((_facetDefinition$Labe = facetDefinition.Label) === null || _facetDefinition$Labe === void 0 ? void 0 : _facetDefinition$Labe.toString()) || fallback;
        };
      collectionFacetDefinition.Facets.forEach(function (facetDefinition) {
        var facet = createReferenceHeaderFacet(facetDefinition, collectionFacetDefinition, converterContext);
        if (facet) {
          facets.push(facet);
        }
      });
      return {
        type: HeaderFacetType.Annotation,
        facetType: FacetType.Collection,
        id: headerFacetID,
        containerId: getHeaderFacetContainerID({
          Facet: collectionFacetDefinition
        }),
        key: getHeaderFacetKey(collectionFacetDefinition, headerFacetID),
        flexSettings: {
          designtime: getDesignTimeMetadataSettingsForHeaderFacet(collectionFacetDefinition, collectionFacetDefinition, converterContext)
        },
        stashed: getStashedSettingsForHeaderFacet(collectionFacetDefinition, collectionFacetDefinition, converterContext),
        visible: compileExpression(not(equal(getExpressionFromAnnotation((_collectionFacetDefin = collectionFacetDefinition.annotations) === null || _collectionFacetDefin === void 0 ? void 0 : (_collectionFacetDefin2 = _collectionFacetDefin.UI) === null || _collectionFacetDefin2 === void 0 ? void 0 : (_collectionFacetDefin3 = _collectionFacetDefin2.Hidden) === null || _collectionFacetDefin3 === void 0 ? void 0 : _collectionFacetDefin3.valueOf()), true))),
        annotationPath: "".concat(converterContext.getEntitySetBasedAnnotationPath(collectionFacetDefinition.fullyQualifiedName), "/"),
        facets: facets
      };
    }
    return undefined;
  }
  function getTargetAnnotationType(facetDefinition) {
    var annotationType = TargetAnnotationType.None;
    var annotationTypeMap = {
      "com.sap.vocabularies.UI.v1.DataPoint": TargetAnnotationType.DataPoint,
      "com.sap.vocabularies.UI.v1.Chart": TargetAnnotationType.Chart,
      "com.sap.vocabularies.UI.v1.Identification": TargetAnnotationType.Identification,
      "com.sap.vocabularies.Communication.v1.Contact": TargetAnnotationType.Contact,
      "com.sap.vocabularies.Communication.v1.Address": TargetAnnotationType.Address,
      "com.sap.vocabularies.UI.v1.FieldGroup": TargetAnnotationType.FieldGroup
    };
    // ReferenceURLFacet and CollectionFacet do not have Target property.
    if (facetDefinition.$Type !== "com.sap.vocabularies.UI.v1.ReferenceURLFacet" && facetDefinition.$Type !== "com.sap.vocabularies.UI.v1.CollectionFacet") {
      var _facetDefinition$Targ3, _facetDefinition$Targ4;
      annotationType = annotationTypeMap[(_facetDefinition$Targ3 = facetDefinition.Target) === null || _facetDefinition$Targ3 === void 0 ? void 0 : (_facetDefinition$Targ4 = _facetDefinition$Targ3.$target) === null || _facetDefinition$Targ4 === void 0 ? void 0 : _facetDefinition$Targ4.term] || TargetAnnotationType.None;
    }
    return annotationType;
  }
  function getFieldGroupFormData(facetDefinition, converterContext) {
    var _facetDefinition$Labe2;
    // split in this from annotation + getFieldGroupFromDefault
    if (!facetDefinition) {
      throw new Error("Cannot get FieldGroup form data without facet definition");
    }
    var formElements = insertCustomElements(getFormElementsFromAnnotations(facetDefinition, converterContext), getFormElementsFromManifest(facetDefinition, converterContext));
    return {
      id: getHeaderFacetFormID({
        Facet: facetDefinition
      }),
      label: (_facetDefinition$Labe2 = facetDefinition.Label) === null || _facetDefinition$Labe2 === void 0 ? void 0 : _facetDefinition$Labe2.toString(),
      formElements: formElements
    };
  }

  /**
   * Creates an array of manifest-based FormElements.
   *
   * @param facetDefinition The definition of the facet
   * @param converterContext The converter context for the facet
   * @returns Annotation-based FormElements
   */
  function getFormElementsFromAnnotations(facetDefinition, converterContext) {
    var annotationBasedFormElements = [];

    // ReferenceURLFacet and CollectionFacet do not have Target property.
    if (facetDefinition.$Type !== "com.sap.vocabularies.UI.v1.ReferenceURLFacet" && facetDefinition.$Type !== "com.sap.vocabularies.UI.v1.CollectionFacet") {
      var _facetDefinition$Targ5, _facetDefinition$Targ6;
      (_facetDefinition$Targ5 = facetDefinition.Target) === null || _facetDefinition$Targ5 === void 0 ? void 0 : (_facetDefinition$Targ6 = _facetDefinition$Targ5.$target) === null || _facetDefinition$Targ6 === void 0 ? void 0 : _facetDefinition$Targ6.Data.forEach(function (dataField) {
        var _dataField$annotation, _dataField$annotation2, _dataField$annotation3;
        if (!(((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : (_dataField$annotation3 = _dataField$annotation2.Hidden) === null || _dataField$annotation3 === void 0 ? void 0 : _dataField$annotation3.valueOf()) === true)) {
          var semanticObjectAnnotationPath = getSemanticObjectPath(converterContext, dataField);
          if ((dataField.$Type === "com.sap.vocabularies.UI.v1.DataField" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation" || dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithAction") && !isReferencePropertyStaticallyHidden(dataField)) {
            var _dataField$Value, _dataField$Value$$tar, _dataField$Value$$tar2, _dataField$Value$$tar3, _dataField$Value$$tar4, _annotations$UI2, _annotations$UI2$Hidd, _dataField$Value2, _dataField$Value2$$ta, _dataField$Value2$$ta2, _dataField$Value2$$ta3;
            var annotations = dataField.annotations;
            annotationBasedFormElements.push({
              isValueMultilineText: ((_dataField$Value = dataField.Value) === null || _dataField$Value === void 0 ? void 0 : (_dataField$Value$$tar = _dataField$Value.$target) === null || _dataField$Value$$tar === void 0 ? void 0 : (_dataField$Value$$tar2 = _dataField$Value$$tar.annotations) === null || _dataField$Value$$tar2 === void 0 ? void 0 : (_dataField$Value$$tar3 = _dataField$Value$$tar2.UI) === null || _dataField$Value$$tar3 === void 0 ? void 0 : (_dataField$Value$$tar4 = _dataField$Value$$tar3.MultiLineText) === null || _dataField$Value$$tar4 === void 0 ? void 0 : _dataField$Value$$tar4.valueOf()) === true,
              type: FormElementType.Annotation,
              key: KeyHelper.generateKeyFromDataField(dataField),
              visible: compileExpression(not(equal(getExpressionFromAnnotation(annotations === null || annotations === void 0 ? void 0 : (_annotations$UI2 = annotations.UI) === null || _annotations$UI2 === void 0 ? void 0 : (_annotations$UI2$Hidd = _annotations$UI2.Hidden) === null || _annotations$UI2$Hidd === void 0 ? void 0 : _annotations$UI2$Hidd.valueOf()), true))),
              label: ((_dataField$Value2 = dataField.Value) === null || _dataField$Value2 === void 0 ? void 0 : (_dataField$Value2$$ta = _dataField$Value2.$target) === null || _dataField$Value2$$ta === void 0 ? void 0 : (_dataField$Value2$$ta2 = _dataField$Value2$$ta.annotations) === null || _dataField$Value2$$ta2 === void 0 ? void 0 : (_dataField$Value2$$ta3 = _dataField$Value2$$ta2.Common) === null || _dataField$Value2$$ta3 === void 0 ? void 0 : _dataField$Value2$$ta3.Label) || dataField.Label,
              idPrefix: getHeaderFacetFormID({
                Facet: facetDefinition
              }, dataField),
              annotationPath: "".concat(converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName), "/"),
              semanticObjectPath: semanticObjectAnnotationPath
            });
          } else if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && !isReferencePropertyStaticallyHidden(dataField)) {
            var _dataField$Target, _dataField$Target$$ta, _dataField$Target$$ta2, _dataField$Target$$ta3, _dataField$Target$$ta4, _annotations$UI3, _annotations$UI3$Hidd, _dataField$Target2, _dataField$Target2$$t, _dataField$Target2$$t2, _dataField$Target2$$t3, _dataField$Target2$$t4, _dataField$Label;
            var _annotations = dataField.annotations;
            annotationBasedFormElements.push({
              // FIXME this is wrong, the annotation should exist, so the target is not properly identified
              isValueMultilineText: ((_dataField$Target = dataField.Target) === null || _dataField$Target === void 0 ? void 0 : (_dataField$Target$$ta = _dataField$Target.$target) === null || _dataField$Target$$ta === void 0 ? void 0 : (_dataField$Target$$ta2 = _dataField$Target$$ta.annotations) === null || _dataField$Target$$ta2 === void 0 ? void 0 : (_dataField$Target$$ta3 = _dataField$Target$$ta2.UI) === null || _dataField$Target$$ta3 === void 0 ? void 0 : (_dataField$Target$$ta4 = _dataField$Target$$ta3.MultiLineText) === null || _dataField$Target$$ta4 === void 0 ? void 0 : _dataField$Target$$ta4.valueOf()) === true,
              type: FormElementType.Annotation,
              key: KeyHelper.generateKeyFromDataField(dataField),
              visible: compileExpression(not(equal(getExpressionFromAnnotation(_annotations === null || _annotations === void 0 ? void 0 : (_annotations$UI3 = _annotations.UI) === null || _annotations$UI3 === void 0 ? void 0 : (_annotations$UI3$Hidd = _annotations$UI3.Hidden) === null || _annotations$UI3$Hidd === void 0 ? void 0 : _annotations$UI3$Hidd.valueOf()), true))),
              label: ((_dataField$Target2 = dataField.Target) === null || _dataField$Target2 === void 0 ? void 0 : (_dataField$Target2$$t = _dataField$Target2.$target) === null || _dataField$Target2$$t === void 0 ? void 0 : (_dataField$Target2$$t2 = _dataField$Target2$$t.annotations) === null || _dataField$Target2$$t2 === void 0 ? void 0 : (_dataField$Target2$$t3 = _dataField$Target2$$t2.Common) === null || _dataField$Target2$$t3 === void 0 ? void 0 : (_dataField$Target2$$t4 = _dataField$Target2$$t3.Label) === null || _dataField$Target2$$t4 === void 0 ? void 0 : _dataField$Target2$$t4.toString()) || ((_dataField$Label = dataField.Label) === null || _dataField$Label === void 0 ? void 0 : _dataField$Label.toString()),
              idPrefix: getHeaderFacetFormID({
                Facet: facetDefinition
              }, dataField),
              annotationPath: "".concat(converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName), "/"),
              semanticObjectPath: semanticObjectAnnotationPath
            });
          }
        }
      });
    }
    return annotationBasedFormElements;
  }
  function getDataPointData(facetDefinition, converterContext) {
    var type = HeaderDataPointType.Content;
    var semanticObjectPath;
    if (facetDefinition.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet" && !isAnnotationFieldStaticallyHidden(facetDefinition)) {
      var _facetDefinition$Targ7, _facetDefinition$Targ8, _facetDefinition$Targ9, _facetDefinition$Targ10, _facetDefinition$Targ11;
      if (((_facetDefinition$Targ7 = facetDefinition.Target) === null || _facetDefinition$Targ7 === void 0 ? void 0 : (_facetDefinition$Targ8 = _facetDefinition$Targ7.$target) === null || _facetDefinition$Targ8 === void 0 ? void 0 : _facetDefinition$Targ8.Visualization) === "UI.VisualizationType/Progress") {
        type = HeaderDataPointType.ProgressIndicator;
      } else if (((_facetDefinition$Targ9 = facetDefinition.Target) === null || _facetDefinition$Targ9 === void 0 ? void 0 : (_facetDefinition$Targ10 = _facetDefinition$Targ9.$target) === null || _facetDefinition$Targ10 === void 0 ? void 0 : _facetDefinition$Targ10.Visualization) === "UI.VisualizationType/Rating") {
        type = HeaderDataPointType.RatingIndicator;
      }
      var dataPoint = (_facetDefinition$Targ11 = facetDefinition.Target) === null || _facetDefinition$Targ11 === void 0 ? void 0 : _facetDefinition$Targ11.$target;
      if (typeof dataPoint === "object") {
        var _dataPoint$Value;
        if (dataPoint !== null && dataPoint !== void 0 && (_dataPoint$Value = dataPoint.Value) !== null && _dataPoint$Value !== void 0 && _dataPoint$Value.$target) {
          var _property$annotations, _property$annotations2;
          var property = dataPoint.Value.$target;
          if ((property === null || property === void 0 ? void 0 : (_property$annotations = property.annotations) === null || _property$annotations === void 0 ? void 0 : (_property$annotations2 = _property$annotations.Common) === null || _property$annotations2 === void 0 ? void 0 : _property$annotations2.SemanticObject) !== undefined) {
            semanticObjectPath = converterContext.getEntitySetBasedAnnotationPath(property === null || property === void 0 ? void 0 : property.fullyQualifiedName);
          }
        }
      }
    }
    return {
      type: type,
      semanticObjectPath: semanticObjectPath
    };
  }

  /**
   * Creates an annotation-based header facet.
   *
   * @param facetDefinition The definition of the facet
   * @param converterContext The converter context
   * @returns The created annotation-based header facet
   */
  function createHeaderFacet(facetDefinition, converterContext) {
    var headerFacet;
    switch (facetDefinition.$Type) {
      case "com.sap.vocabularies.UI.v1.ReferenceFacet":
        headerFacet = createReferenceHeaderFacet(facetDefinition, facetDefinition, converterContext);
        break;
      case "com.sap.vocabularies.UI.v1.CollectionFacet":
        headerFacet = createCollectionHeaderFacet(facetDefinition, converterContext);
        break;
      default:
        break;
    }
    return headerFacet;
  }

  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Convert & Build Manifest Based Header Facets
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  function generateBinding(requestGroupId) {
    if (!requestGroupId) {
      return undefined;
    }
    var groupId = ["Heroes", "Decoration", "Workers", "LongRunners"].indexOf(requestGroupId) !== -1 ? "$auto.".concat(requestGroupId) : requestGroupId;
    return "{ path : '', parameters : { $$groupId : '".concat(groupId, "' } }");
  }

  /**
   * Create a manifest based custom header facet.
   *
   * @param customHeaderFacetDefinition
   * @param headerFacetKey
   * @returns The manifest based custom header facet created
   */
  function createCustomHeaderFacet(customHeaderFacetDefinition, headerFacetKey) {
    var customHeaderFacetID = getCustomHeaderFacetID(headerFacetKey);
    var position = customHeaderFacetDefinition.position;
    if (!position) {
      position = {
        placement: Placement.After
      };
    }
    // TODO for an non annotation fragment the name is mandatory -> Not checked
    return {
      facetType: FacetType.Reference,
      facets: [],
      type: customHeaderFacetDefinition.type,
      id: customHeaderFacetID,
      containerId: customHeaderFacetID,
      key: headerFacetKey,
      position: position,
      visible: customHeaderFacetDefinition.visible,
      fragmentName: customHeaderFacetDefinition.template || customHeaderFacetDefinition.name,
      title: customHeaderFacetDefinition.title,
      subTitle: customHeaderFacetDefinition.subTitle,
      stashed: customHeaderFacetDefinition.stashed || false,
      flexSettings: _objectSpread(_objectSpread({}, {
        designtime: FlexDesignTimeType.Default
      }), customHeaderFacetDefinition.flexSettings),
      binding: generateBinding(customHeaderFacetDefinition.requestGroupId),
      templateEdit: customHeaderFacetDefinition.templateEdit
    };
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJIZWFkZXJGYWNldFR5cGUiLCJGYWNldFR5cGUiLCJGbGV4RGVzaWduVGltZVR5cGUiLCJIZWFkZXJEYXRhUG9pbnRUeXBlIiwiVGFyZ2V0QW5ub3RhdGlvblR5cGUiLCJnZXRIZWFkZXJGYWNldHNGcm9tQW5ub3RhdGlvbnMiLCJjb252ZXJ0ZXJDb250ZXh0IiwiaGVhZGVyRmFjZXRzIiwiZ2V0RW50aXR5VHlwZSIsImFubm90YXRpb25zIiwiVUkiLCJIZWFkZXJGYWNldHMiLCJmb3JFYWNoIiwiZmFjZXQiLCJoZWFkZXJGYWNldCIsImNyZWF0ZUhlYWRlckZhY2V0IiwicHVzaCIsImdldEhlYWRlckZhY2V0c0Zyb21NYW5pZmVzdCIsIm1hbmlmZXN0Q3VzdG9tSGVhZGVyRmFjZXRzIiwiY3VzdG9tSGVhZGVyRmFjZXRzIiwiT2JqZWN0Iiwia2V5cyIsIm1hbmlmZXN0SGVhZGVyRmFjZXRLZXkiLCJjdXN0b21IZWFkZXJGYWNldCIsImNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0IiwiZ2V0U3Rhc2hlZFNldHRpbmdzRm9ySGVhZGVyRmFjZXQiLCJmYWNldERlZmluaXRpb24iLCJjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uIiwiJFR5cGUiLCJoZWFkZXJGYWNldElEIiwiZ2VuZXJhdGUiLCJGYWNldCIsImhlYWRlckZhY2V0c0NvbnRyb2xDb25maWciLCJnZXRNYW5pZmVzdFdyYXBwZXIiLCJnZXRIZWFkZXJGYWNldHMiLCJzdGFzaGVkU2V0dGluZyIsInN0YXNoZWQiLCJnZXREZXNpZ25UaW1lTWV0YWRhdGFTZXR0aW5nc0ZvckhlYWRlckZhY2V0IiwiZGVzaWduVGltZU1ldGFkYXRhIiwiRGVmYXVsdCIsIk5vdEFkYXB0YWJsZVRyZWUiLCJkZXNpZ25UaW1lIiwiZmxleFNldHRpbmdzIiwiZGVzaWdudGltZSIsIk5vdEFkYXB0YWJsZSIsIk5vdEFkYXB0YWJsZVZpc2liaWxpdHkiLCJjcmVhdGVSZWZlcmVuY2VIZWFkZXJGYWNldCIsIkhpZGRlbiIsInZhbHVlT2YiLCJnZXRIZWFkZXJGYWNldElEIiwiZ2V0SGVhZGVyRmFjZXRLZXkiLCJmYWNldERlZmluaXRpb25Ub0NoZWNrIiwiZmFsbGJhY2siLCJJRCIsInRvU3RyaW5nIiwiTGFiZWwiLCJ0YXJnZXRBbm5vdGF0aW9uVmFsdWUiLCJUYXJnZXQiLCJ2YWx1ZSIsInRhcmdldEFubm90YXRpb25UeXBlIiwiZ2V0VGFyZ2V0QW5ub3RhdGlvblR5cGUiLCJoZWFkZXJGb3JtRGF0YSIsImhlYWRlckRhdGFQb2ludERhdGEiLCJGaWVsZEdyb3VwIiwiZ2V0RmllbGRHcm91cEZvcm1EYXRhIiwiRGF0YVBvaW50IiwiZ2V0RGF0YVBvaW50RGF0YSIsIiR0YXJnZXQiLCJ0ZXJtIiwiaXNBbm5vdGF0aW9uRmllbGRTdGF0aWNhbGx5SGlkZGVuIiwidW5kZWZpbmVkIiwidHlwZSIsIkFubm90YXRpb24iLCJmYWNldFR5cGUiLCJSZWZlcmVuY2UiLCJpZCIsImNvbnRhaW5lcklkIiwiZ2V0SGVhZGVyRmFjZXRDb250YWluZXJJRCIsImtleSIsInZpc2libGUiLCJjb21waWxlRXhwcmVzc2lvbiIsIm5vdCIsImVxdWFsIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiYW5ub3RhdGlvblBhdGgiLCJnZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiY3JlYXRlQ29sbGVjdGlvbkhlYWRlckZhY2V0IiwiZmFjZXRzIiwiRmFjZXRzIiwiQ29sbGVjdGlvbiIsImFubm90YXRpb25UeXBlIiwiTm9uZSIsImFubm90YXRpb25UeXBlTWFwIiwiQ2hhcnQiLCJJZGVudGlmaWNhdGlvbiIsIkNvbnRhY3QiLCJBZGRyZXNzIiwiRXJyb3IiLCJmb3JtRWxlbWVudHMiLCJpbnNlcnRDdXN0b21FbGVtZW50cyIsImdldEZvcm1FbGVtZW50c0Zyb21Bbm5vdGF0aW9ucyIsImdldEZvcm1FbGVtZW50c0Zyb21NYW5pZmVzdCIsImdldEhlYWRlckZhY2V0Rm9ybUlEIiwibGFiZWwiLCJhbm5vdGF0aW9uQmFzZWRGb3JtRWxlbWVudHMiLCJEYXRhIiwiZGF0YUZpZWxkIiwic2VtYW50aWNPYmplY3RBbm5vdGF0aW9uUGF0aCIsImdldFNlbWFudGljT2JqZWN0UGF0aCIsImlzUmVmZXJlbmNlUHJvcGVydHlTdGF0aWNhbGx5SGlkZGVuIiwiaXNWYWx1ZU11bHRpbGluZVRleHQiLCJWYWx1ZSIsIk11bHRpTGluZVRleHQiLCJGb3JtRWxlbWVudFR5cGUiLCJLZXlIZWxwZXIiLCJnZW5lcmF0ZUtleUZyb21EYXRhRmllbGQiLCJDb21tb24iLCJpZFByZWZpeCIsInNlbWFudGljT2JqZWN0UGF0aCIsIkNvbnRlbnQiLCJWaXN1YWxpemF0aW9uIiwiUHJvZ3Jlc3NJbmRpY2F0b3IiLCJSYXRpbmdJbmRpY2F0b3IiLCJkYXRhUG9pbnQiLCJwcm9wZXJ0eSIsIlNlbWFudGljT2JqZWN0IiwiZ2VuZXJhdGVCaW5kaW5nIiwicmVxdWVzdEdyb3VwSWQiLCJncm91cElkIiwiaW5kZXhPZiIsImN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbiIsImhlYWRlckZhY2V0S2V5IiwiY3VzdG9tSGVhZGVyRmFjZXRJRCIsImdldEN1c3RvbUhlYWRlckZhY2V0SUQiLCJwb3NpdGlvbiIsInBsYWNlbWVudCIsIlBsYWNlbWVudCIsIkFmdGVyIiwiZnJhZ21lbnROYW1lIiwidGVtcGxhdGUiLCJuYW1lIiwidGl0bGUiLCJzdWJUaXRsZSIsImJpbmRpbmciLCJ0ZW1wbGF0ZUVkaXQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkhlYWRlckZhY2V0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHtcblx0RGF0YUZpZWxkQWJzdHJhY3RUeXBlcyxcblx0RGF0YVBvaW50LFxuXHRGYWNldFR5cGVzLFxuXHRGaWVsZEdyb3VwLFxuXHRSZWZlcmVuY2VGYWNldFR5cGVzXG59IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zLCBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IGdldFNlbWFudGljT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2Fubm90YXRpb25zL0RhdGFGaWVsZFwiO1xuaW1wb3J0IHR5cGUgeyBDb25maWd1cmFibGVPYmplY3QsIENvbmZpZ3VyYWJsZVJlY29yZCwgQ3VzdG9tRWxlbWVudCwgUG9zaXRpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgaW5zZXJ0Q3VzdG9tRWxlbWVudHMsIFBsYWNlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQge1xuXHRnZXRDdXN0b21IZWFkZXJGYWNldElELFxuXHRnZXRIZWFkZXJGYWNldENvbnRhaW5lcklELFxuXHRnZXRIZWFkZXJGYWNldEZvcm1JRCxcblx0Z2V0SGVhZGVyRmFjZXRJRFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0lEXCI7XG5pbXBvcnQgeyBLZXlIZWxwZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0tleVwiO1xuaW1wb3J0IHR5cGUgeyBNYW5pZmVzdEhlYWRlckZhY2V0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHR5cGUgeyBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBjb21waWxlRXhwcmVzc2lvbiwgZXF1YWwsIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiwgbm90IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcIi4uLy4uLy4uL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcIi4uLy4uL0NvbnZlcnRlckNvbnRleHRcIjtcbmltcG9ydCB7IGlzQW5ub3RhdGlvbkZpZWxkU3RhdGljYWxseUhpZGRlbiwgaXNSZWZlcmVuY2VQcm9wZXJ0eVN0YXRpY2FsbHlIaWRkZW4gfSBmcm9tIFwiLi4vLi4vaGVscGVycy9EYXRhRmllbGRIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgQW5ub3RhdGlvbkZvcm1FbGVtZW50LCBGb3JtRWxlbWVudCB9IGZyb20gXCIuLi9Db21tb24vRm9ybVwiO1xuaW1wb3J0IHsgRm9ybUVsZW1lbnRUeXBlLCBnZXRGb3JtRWxlbWVudHNGcm9tTWFuaWZlc3QgfSBmcm9tIFwiLi4vQ29tbW9uL0Zvcm1cIjtcblxuLy8gcmVnaW9uIGRlZmluaXRpb25zXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIERlZmluaXRpb25zOiBIZWFkZXIgRmFjZXQgVHlwZXMsIEdlbmVyaWMgT1AgSGVhZGVyIEZhY2V0LCBNYW5pZmVzdCBQcm9wZXJ0aWVzIGZvciBDdXN0b20gSGVhZGVyIEZhY2V0XG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuZXhwb3J0IGVudW0gSGVhZGVyRmFjZXRUeXBlIHtcblx0QW5ub3RhdGlvbiA9IFwiQW5ub3RhdGlvblwiLFxuXHRYTUxGcmFnbWVudCA9IFwiWE1MRnJhZ21lbnRcIlxufVxuXG5leHBvcnQgZW51bSBGYWNldFR5cGUge1xuXHRSZWZlcmVuY2UgPSBcIlJlZmVyZW5jZVwiLFxuXHRDb2xsZWN0aW9uID0gXCJDb2xsZWN0aW9uXCJcbn1cblxuZXhwb3J0IGVudW0gRmxleERlc2lnblRpbWVUeXBlIHtcblx0RGVmYXVsdCA9IFwiRGVmYXVsdFwiLFxuXHROb3RBZGFwdGFibGUgPSBcIm5vdC1hZGFwdGFibGVcIiwgLy8gZGlzYWJsZSBhbGwgYWN0aW9ucyBvbiB0aGF0IGluc3RhbmNlXG5cdE5vdEFkYXB0YWJsZVRyZWUgPSBcIm5vdC1hZGFwdGFibGUtdHJlZVwiLCAvLyBkaXNhYmxlIGFsbCBhY3Rpb25zIG9uIHRoYXQgaW5zdGFuY2UgYW5kIG9uIGFsbCBjaGlsZHJlbiBvZiB0aGF0IGluc3RhbmNlXG5cdE5vdEFkYXB0YWJsZVZpc2liaWxpdHkgPSBcIm5vdC1hZGFwdGFibGUtdmlzaWJpbGl0eVwiIC8vIGRpc2FibGUgYWxsIGFjdGlvbnMgdGhhdCBpbmZsdWVuY2UgdGhlIHZpc2liaWxpdHksIG5hbWVseSByZXZlYWwgYW5kIHJlbW92ZVxufVxuXG5leHBvcnQgdHlwZSBGbGV4U2V0dGluZ3MgPSB7XG5cdGRlc2lnbnRpbWU/OiBGbGV4RGVzaWduVGltZVR5cGU7XG59O1xuXG50eXBlIEhlYWRlckZvcm1EYXRhID0ge1xuXHRpZDogc3RyaW5nO1xuXHRsYWJlbD86IHN0cmluZztcblx0Zm9ybUVsZW1lbnRzOiBGb3JtRWxlbWVudFtdO1xufTtcblxuZW51bSBIZWFkZXJEYXRhUG9pbnRUeXBlIHtcblx0UHJvZ3Jlc3NJbmRpY2F0b3IgPSBcIlByb2dyZXNzSW5kaWNhdG9yXCIsXG5cdFJhdGluZ0luZGljYXRvciA9IFwiUmF0aW5nSW5kaWNhdG9yXCIsXG5cdENvbnRlbnQgPSBcIkNvbnRlbnRcIlxufVxuXG50eXBlIEhlYWRlckRhdGFQb2ludERhdGEgPSB7XG5cdHR5cGU6IEhlYWRlckRhdGFQb2ludFR5cGU7XG5cdHNlbWFudGljT2JqZWN0UGF0aD86IHN0cmluZztcbn07XG5cbmVudW0gVGFyZ2V0QW5ub3RhdGlvblR5cGUge1xuXHROb25lID0gXCJOb25lXCIsXG5cdERhdGFQb2ludCA9IFwiRGF0YVBvaW50XCIsXG5cdENoYXJ0ID0gXCJDaGFydFwiLFxuXHRJZGVudGlmaWNhdGlvbiA9IFwiSWRlbnRpZmljYXRpb25cIixcblx0Q29udGFjdCA9IFwiQ29udGFjdFwiLFxuXHRBZGRyZXNzID0gXCJBZGRyZXNzXCIsXG5cdEZpZWxkR3JvdXAgPSBcIkZpZWxkR3JvdXBcIlxufVxuXG50eXBlIEJhc2VIZWFkZXJGYWNldCA9IENvbmZpZ3VyYWJsZU9iamVjdCAmIHtcblx0dHlwZT86IEhlYWRlckZhY2V0VHlwZTsgLy8gTWFuaWZlc3Qgb3IgTWV0YWRhdGFcblx0aWQ6IHN0cmluZztcblx0Y29udGFpbmVySWQ6IHN0cmluZztcblx0YW5ub3RhdGlvblBhdGg/OiBzdHJpbmc7XG5cdGZsZXhTZXR0aW5nczogRmxleFNldHRpbmdzO1xuXHRzdGFzaGVkOiBib29sZWFuO1xuXHR2aXNpYmxlOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0dGFyZ2V0QW5ub3RhdGlvblZhbHVlPzogc3RyaW5nO1xuXHR0YXJnZXRBbm5vdGF0aW9uVHlwZT86IFRhcmdldEFubm90YXRpb25UeXBlO1xufTtcblxudHlwZSBCYXNlUmVmZXJlbmNlRmFjZXQgPSBCYXNlSGVhZGVyRmFjZXQgJiB7XG5cdGZhY2V0VHlwZTogRmFjZXRUeXBlLlJlZmVyZW5jZTtcbn07XG5cbmV4cG9ydCB0eXBlIEZpZWxkR3JvdXBGYWNldCA9IEJhc2VSZWZlcmVuY2VGYWNldCAmIHtcblx0aGVhZGVyRm9ybURhdGE6IEhlYWRlckZvcm1EYXRhO1xufTtcblxudHlwZSBEYXRhUG9pbnRGYWNldCA9IEJhc2VSZWZlcmVuY2VGYWNldCAmIHtcblx0aGVhZGVyRGF0YVBvaW50RGF0YT86IEhlYWRlckRhdGFQb2ludERhdGE7XG59O1xuXG50eXBlIFJlZmVyZW5jZUZhY2V0ID0gRmllbGRHcm91cEZhY2V0IHwgRGF0YVBvaW50RmFjZXQ7XG5cbmV4cG9ydCB0eXBlIENvbGxlY3Rpb25GYWNldCA9IEJhc2VIZWFkZXJGYWNldCAmIHtcblx0ZmFjZXRUeXBlOiBGYWNldFR5cGUuQ29sbGVjdGlvbjtcblx0ZmFjZXRzOiBSZWZlcmVuY2VGYWNldFtdO1xufTtcblxuZXhwb3J0IHR5cGUgT2JqZWN0UGFnZUhlYWRlckZhY2V0ID0gUmVmZXJlbmNlRmFjZXQgfCBDb2xsZWN0aW9uRmFjZXQ7XG5cbmV4cG9ydCB0eXBlIEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldCA9IEN1c3RvbUVsZW1lbnQ8T2JqZWN0UGFnZUhlYWRlckZhY2V0PiAmIHtcblx0ZnJhZ21lbnROYW1lPzogc3RyaW5nO1xuXHR0aXRsZT86IHN0cmluZztcblx0c3ViVGl0bGU/OiBzdHJpbmc7XG5cdHN0YXNoZWQ/OiBib29sZWFuO1xuXHRiaW5kaW5nPzogc3RyaW5nO1xuXHR0ZW1wbGF0ZUVkaXQ/OiBzdHJpbmc7XG59O1xuXG4vLyBlbmRyZWdpb24gZGVmaW5pdGlvbnNcblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBDb2xsZWN0IEFsbCBIZWFkZXIgRmFjZXRzOiBDdXN0b20gKHZpYSBNYW5pZmVzdCkgYW5kIEFubm90YXRpb24gQmFzZWQgKHZpYSBNZXRhbW9kZWwpXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLyoqXG4gKiBSZXRyaWV2ZSBoZWFkZXIgZmFjZXRzIGZyb20gYW5ub3RhdGlvbnMuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIEhlYWRlciBmYWNldHMgZnJvbSBhbm5vdGF0aW9uc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGVhZGVyRmFjZXRzRnJvbUFubm90YXRpb25zKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBPYmplY3RQYWdlSGVhZGVyRmFjZXRbXSB7XG5cdGNvbnN0IGhlYWRlckZhY2V0czogT2JqZWN0UGFnZUhlYWRlckZhY2V0W10gPSBbXTtcblx0Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkuYW5ub3RhdGlvbnM/LlVJPy5IZWFkZXJGYWNldHM/LmZvckVhY2goKGZhY2V0KSA9PiB7XG5cdFx0Y29uc3QgaGVhZGVyRmFjZXQ6IE9iamVjdFBhZ2VIZWFkZXJGYWNldCB8IHVuZGVmaW5lZCA9IGNyZWF0ZUhlYWRlckZhY2V0KGZhY2V0LCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRpZiAoaGVhZGVyRmFjZXQpIHtcblx0XHRcdGhlYWRlckZhY2V0cy5wdXNoKGhlYWRlckZhY2V0KTtcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBoZWFkZXJGYWNldHM7XG59XG5cbi8qKlxuICogUmV0cmlldmUgY3VzdG9tIGhlYWRlciBmYWNldHMgZnJvbSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gbWFuaWZlc3RDdXN0b21IZWFkZXJGYWNldHNcbiAqIEByZXR1cm5zIEhlYWRlckZhY2V0cyBmcm9tIG1hbmlmZXN0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRIZWFkZXJGYWNldHNGcm9tTWFuaWZlc3QoXG5cdG1hbmlmZXN0Q3VzdG9tSGVhZGVyRmFjZXRzOiBDb25maWd1cmFibGVSZWNvcmQ8TWFuaWZlc3RIZWFkZXJGYWNldD5cbik6IFJlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldD4ge1xuXHRjb25zdCBjdXN0b21IZWFkZXJGYWNldHM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldD4gPSB7fTtcblxuXHRPYmplY3Qua2V5cyhtYW5pZmVzdEN1c3RvbUhlYWRlckZhY2V0cykuZm9yRWFjaCgobWFuaWZlc3RIZWFkZXJGYWNldEtleSkgPT4ge1xuXHRcdGNvbnN0IGN1c3RvbUhlYWRlckZhY2V0OiBNYW5pZmVzdEhlYWRlckZhY2V0ID0gbWFuaWZlc3RDdXN0b21IZWFkZXJGYWNldHNbbWFuaWZlc3RIZWFkZXJGYWNldEtleV07XG5cdFx0Y3VzdG9tSGVhZGVyRmFjZXRzW21hbmlmZXN0SGVhZGVyRmFjZXRLZXldID0gY3JlYXRlQ3VzdG9tSGVhZGVyRmFjZXQoY3VzdG9tSGVhZGVyRmFjZXQsIG1hbmlmZXN0SGVhZGVyRmFjZXRLZXkpO1xuXHR9KTtcblxuXHRyZXR1cm4gY3VzdG9tSGVhZGVyRmFjZXRzO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIHN0YXNoZWQgc2V0dGluZ3MgZm9yIGhlYWRlciBmYWNldHMgZnJvbSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gZmFjZXREZWZpbml0aW9uXG4gKiBAcGFyYW0gY29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvblxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIFN0YXNoZWQgc2V0dGluZyBmb3IgaGVhZGVyIGZhY2V0IG9yIGZhbHNlXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdGFzaGVkU2V0dGluZ3NGb3JIZWFkZXJGYWNldChcblx0ZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLFxuXHRjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBib29sZWFuIHtcblx0Ly8gV2hlbiBhIEhlYWRlckZhY2V0IGlzIG5lc3RlZCBpbnNpZGUgYSBDb2xsZWN0aW9uRmFjZXQsIHN0YXNoaW5nIGlzIG5vdCBzdXBwb3J0ZWRcblx0aWYgKFxuXHRcdGZhY2V0RGVmaW5pdGlvbi4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQgJiZcblx0XHRjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5Db2xsZWN0aW9uRmFjZXRcblx0KSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdGNvbnN0IGhlYWRlckZhY2V0SUQgPSBnZW5lcmF0ZShbeyBGYWNldDogZmFjZXREZWZpbml0aW9uIH1dKTtcblx0Y29uc3QgaGVhZGVyRmFjZXRzQ29udHJvbENvbmZpZyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuZ2V0SGVhZGVyRmFjZXRzKCk7XG5cdGNvbnN0IHN0YXNoZWRTZXR0aW5nID0gaGVhZGVyRmFjZXRzQ29udHJvbENvbmZpZ1toZWFkZXJGYWNldElEXT8uc3Rhc2hlZDtcblx0cmV0dXJuIHN0YXNoZWRTZXR0aW5nID09PSB0cnVlO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIGZsZXhpYmlsaXR5IGRlc2lnbnRpbWUgc2V0dGluZ3MgZnJvbSBtYW5pZmVzdC5cbiAqXG4gKiBAcGFyYW0gZmFjZXREZWZpbml0aW9uXG4gKiBAcGFyYW0gY29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvblxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIERlc2lnbnRpbWUgc2V0dGluZyBvciBkZWZhdWx0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXREZXNpZ25UaW1lTWV0YWRhdGFTZXR0aW5nc0ZvckhlYWRlckZhY2V0KFxuXHRmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsXG5cdGNvbGxlY3Rpb25GYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IEZsZXhEZXNpZ25UaW1lVHlwZSB7XG5cdGxldCBkZXNpZ25UaW1lTWV0YWRhdGE6IEZsZXhEZXNpZ25UaW1lVHlwZSA9IEZsZXhEZXNpZ25UaW1lVHlwZS5EZWZhdWx0O1xuXHRjb25zdCBoZWFkZXJGYWNldElEID0gZ2VuZXJhdGUoW3sgRmFjZXQ6IGZhY2V0RGVmaW5pdGlvbiB9XSk7XG5cblx0Ly8gRm9yIEhlYWRlckZhY2V0cyBuZXN0ZWQgaW5zaWRlIENvbGxlY3Rpb25GYWNldCBSVEEgc2hvdWxkIGJlIGRpc2FibGVkLCB0aGVyZWZvcmUgc2V0IHRvIFwibm90LWFkYXB0YWJsZS10cmVlXCJcblx0aWYgKFxuXHRcdGZhY2V0RGVmaW5pdGlvbi4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQgJiZcblx0XHRjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5Db2xsZWN0aW9uRmFjZXRcblx0KSB7XG5cdFx0ZGVzaWduVGltZU1ldGFkYXRhID0gRmxleERlc2lnblRpbWVUeXBlLk5vdEFkYXB0YWJsZVRyZWU7XG5cdH0gZWxzZSB7XG5cdFx0Y29uc3QgaGVhZGVyRmFjZXRzQ29udHJvbENvbmZpZyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCkuZ2V0SGVhZGVyRmFjZXRzKCk7XG5cdFx0aWYgKGhlYWRlckZhY2V0SUQpIHtcblx0XHRcdGNvbnN0IGRlc2lnblRpbWUgPSBoZWFkZXJGYWNldHNDb250cm9sQ29uZmlnW2hlYWRlckZhY2V0SURdPy5mbGV4U2V0dGluZ3M/LmRlc2lnbnRpbWU7XG5cdFx0XHRzd2l0Y2ggKGRlc2lnblRpbWUpIHtcblx0XHRcdFx0Y2FzZSBGbGV4RGVzaWduVGltZVR5cGUuTm90QWRhcHRhYmxlOlxuXHRcdFx0XHRjYXNlIEZsZXhEZXNpZ25UaW1lVHlwZS5Ob3RBZGFwdGFibGVUcmVlOlxuXHRcdFx0XHRjYXNlIEZsZXhEZXNpZ25UaW1lVHlwZS5Ob3RBZGFwdGFibGVWaXNpYmlsaXR5OlxuXHRcdFx0XHRcdGRlc2lnblRpbWVNZXRhZGF0YSA9IGRlc2lnblRpbWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBkZXNpZ25UaW1lTWV0YWRhdGE7XG59XG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gQ29udmVydCAmIEJ1aWxkIEFubm90YXRpb24gQmFzZWQgSGVhZGVyIEZhY2V0c1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5mdW5jdGlvbiBjcmVhdGVSZWZlcmVuY2VIZWFkZXJGYWNldChcblx0ZmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLFxuXHRjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uOiBGYWNldFR5cGVzLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBSZWZlcmVuY2VGYWNldCB8IHVuZGVmaW5lZCB7XG5cdGlmIChmYWNldERlZmluaXRpb24uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0ICYmICEoZmFjZXREZWZpbml0aW9uLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgPT09IHRydWUpKSB7XG5cdFx0Y29uc3QgaGVhZGVyRmFjZXRJRCA9IGdldEhlYWRlckZhY2V0SUQoeyBGYWNldDogZmFjZXREZWZpbml0aW9uIH0pLFxuXHRcdFx0Z2V0SGVhZGVyRmFjZXRLZXkgPSAoZmFjZXREZWZpbml0aW9uVG9DaGVjazogRmFjZXRUeXBlcywgZmFsbGJhY2s6IHN0cmluZyk6IHN0cmluZyA9PiB7XG5cdFx0XHRcdHJldHVybiBmYWNldERlZmluaXRpb25Ub0NoZWNrLklEPy50b1N0cmluZygpIHx8IGZhY2V0RGVmaW5pdGlvblRvQ2hlY2suTGFiZWw/LnRvU3RyaW5nKCkgfHwgZmFsbGJhY2s7XG5cdFx0XHR9LFxuXHRcdFx0dGFyZ2V0QW5ub3RhdGlvblZhbHVlID0gZmFjZXREZWZpbml0aW9uLlRhcmdldC52YWx1ZSxcblx0XHRcdHRhcmdldEFubm90YXRpb25UeXBlID0gZ2V0VGFyZ2V0QW5ub3RhdGlvblR5cGUoZmFjZXREZWZpbml0aW9uKTtcblxuXHRcdGxldCBoZWFkZXJGb3JtRGF0YTogSGVhZGVyRm9ybURhdGEgfCB1bmRlZmluZWQ7XG5cdFx0bGV0IGhlYWRlckRhdGFQb2ludERhdGE6IEhlYWRlckRhdGFQb2ludERhdGEgfCB1bmRlZmluZWQ7XG5cblx0XHRzd2l0Y2ggKHRhcmdldEFubm90YXRpb25UeXBlKSB7XG5cdFx0XHRjYXNlIFRhcmdldEFubm90YXRpb25UeXBlLkZpZWxkR3JvdXA6XG5cdFx0XHRcdGhlYWRlckZvcm1EYXRhID0gZ2V0RmllbGRHcm91cEZvcm1EYXRhKGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFRhcmdldEFubm90YXRpb25UeXBlLkRhdGFQb2ludDpcblx0XHRcdFx0aGVhZGVyRGF0YVBvaW50RGF0YSA9IGdldERhdGFQb2ludERhdGEoZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHQvLyBUb0RvOiBIYW5kbGUgb3RoZXIgY2FzZXNcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblxuXHRcdGNvbnN0IHsgYW5ub3RhdGlvbnMgfSA9IGZhY2V0RGVmaW5pdGlvbjtcblx0XHRpZiAoXG5cdFx0XHRmYWNldERlZmluaXRpb24uVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5DaGFydCAmJlxuXHRcdFx0aXNBbm5vdGF0aW9uRmllbGRTdGF0aWNhbGx5SGlkZGVuKGZhY2V0RGVmaW5pdGlvbiBhcyBhbnkpXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHR0eXBlOiBIZWFkZXJGYWNldFR5cGUuQW5ub3RhdGlvbixcblx0XHRcdFx0ZmFjZXRUeXBlOiBGYWNldFR5cGUuUmVmZXJlbmNlLFxuXHRcdFx0XHRpZDogaGVhZGVyRmFjZXRJRCxcblx0XHRcdFx0Y29udGFpbmVySWQ6IGdldEhlYWRlckZhY2V0Q29udGFpbmVySUQoeyBGYWNldDogZmFjZXREZWZpbml0aW9uIH0pLFxuXHRcdFx0XHRrZXk6IGdldEhlYWRlckZhY2V0S2V5KGZhY2V0RGVmaW5pdGlvbiwgaGVhZGVyRmFjZXRJRCksXG5cdFx0XHRcdGZsZXhTZXR0aW5nczoge1xuXHRcdFx0XHRcdGRlc2lnbnRpbWU6IGdldERlc2lnblRpbWVNZXRhZGF0YVNldHRpbmdzRm9ySGVhZGVyRmFjZXQoZmFjZXREZWZpbml0aW9uLCBjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KVxuXHRcdFx0XHR9LFxuXHRcdFx0XHRzdGFzaGVkOiBnZXRTdGFzaGVkU2V0dGluZ3NGb3JIZWFkZXJGYWNldChmYWNldERlZmluaXRpb24sIGNvbGxlY3Rpb25GYWNldERlZmluaXRpb24sIGNvbnZlcnRlckNvbnRleHQpLFxuXHRcdFx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkpLCB0cnVlKSkpLFxuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogYCR7Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGZhY2V0RGVmaW5pdGlvbi5mdWxseVF1YWxpZmllZE5hbWUpfS9gLFxuXHRcdFx0XHR0YXJnZXRBbm5vdGF0aW9uVmFsdWUsXG5cdFx0XHRcdHRhcmdldEFubm90YXRpb25UeXBlLFxuXHRcdFx0XHRoZWFkZXJGb3JtRGF0YSxcblx0XHRcdFx0aGVhZGVyRGF0YVBvaW50RGF0YVxuXHRcdFx0fTtcblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVDb2xsZWN0aW9uSGVhZGVyRmFjZXQoXG5cdGNvbGxlY3Rpb25GYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHRcbik6IENvbGxlY3Rpb25GYWNldCB8IHVuZGVmaW5lZCB7XG5cdGlmIChjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5Db2xsZWN0aW9uRmFjZXQpIHtcblx0XHRjb25zdCBmYWNldHM6IFJlZmVyZW5jZUZhY2V0W10gPSBbXSxcblx0XHRcdGhlYWRlckZhY2V0SUQgPSBnZXRIZWFkZXJGYWNldElEKHsgRmFjZXQ6IGNvbGxlY3Rpb25GYWNldERlZmluaXRpb24gfSksXG5cdFx0XHRnZXRIZWFkZXJGYWNldEtleSA9IChmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsIGZhbGxiYWNrOiBzdHJpbmcpOiBzdHJpbmcgPT4ge1xuXHRcdFx0XHRyZXR1cm4gZmFjZXREZWZpbml0aW9uLklEPy50b1N0cmluZygpIHx8IGZhY2V0RGVmaW5pdGlvbi5MYWJlbD8udG9TdHJpbmcoKSB8fCBmYWxsYmFjaztcblx0XHRcdH07XG5cblx0XHRjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uLkZhY2V0cy5mb3JFYWNoKChmYWNldERlZmluaXRpb24pID0+IHtcblx0XHRcdGNvbnN0IGZhY2V0OiBSZWZlcmVuY2VGYWNldCB8IHVuZGVmaW5lZCA9IGNyZWF0ZVJlZmVyZW5jZUhlYWRlckZhY2V0KFxuXHRcdFx0XHRmYWNldERlZmluaXRpb24sXG5cdFx0XHRcdGNvbGxlY3Rpb25GYWNldERlZmluaXRpb24sXG5cdFx0XHRcdGNvbnZlcnRlckNvbnRleHRcblx0XHRcdCk7XG5cdFx0XHRpZiAoZmFjZXQpIHtcblx0XHRcdFx0ZmFjZXRzLnB1c2goZmFjZXQpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6IEhlYWRlckZhY2V0VHlwZS5Bbm5vdGF0aW9uLFxuXHRcdFx0ZmFjZXRUeXBlOiBGYWNldFR5cGUuQ29sbGVjdGlvbixcblx0XHRcdGlkOiBoZWFkZXJGYWNldElELFxuXHRcdFx0Y29udGFpbmVySWQ6IGdldEhlYWRlckZhY2V0Q29udGFpbmVySUQoeyBGYWNldDogY29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvbiB9KSxcblx0XHRcdGtleTogZ2V0SGVhZGVyRmFjZXRLZXkoY29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvbiwgaGVhZGVyRmFjZXRJRCksXG5cdFx0XHRmbGV4U2V0dGluZ3M6IHtcblx0XHRcdFx0ZGVzaWdudGltZTogZ2V0RGVzaWduVGltZU1ldGFkYXRhU2V0dGluZ3NGb3JIZWFkZXJGYWNldChcblx0XHRcdFx0XHRjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uLFxuXHRcdFx0XHRcdGNvbGxlY3Rpb25GYWNldERlZmluaXRpb24sXG5cdFx0XHRcdFx0Y29udmVydGVyQ29udGV4dFxuXHRcdFx0XHQpXG5cdFx0XHR9LFxuXHRcdFx0c3Rhc2hlZDogZ2V0U3Rhc2hlZFNldHRpbmdzRm9ySGVhZGVyRmFjZXQoY29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvbiwgY29sbGVjdGlvbkZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihcblx0XHRcdFx0bm90KGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihjb2xsZWN0aW9uRmFjZXREZWZpbml0aW9uLmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkpLCB0cnVlKSlcblx0XHRcdCksXG5cdFx0XHRhbm5vdGF0aW9uUGF0aDogYCR7Y29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGNvbGxlY3Rpb25GYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lKX0vYCxcblx0XHRcdGZhY2V0c1xuXHRcdH07XG5cdH1cblxuXHRyZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5mdW5jdGlvbiBnZXRUYXJnZXRBbm5vdGF0aW9uVHlwZShmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMpOiBUYXJnZXRBbm5vdGF0aW9uVHlwZSB7XG5cdGxldCBhbm5vdGF0aW9uVHlwZSA9IFRhcmdldEFubm90YXRpb25UeXBlLk5vbmU7XG5cdGNvbnN0IGFubm90YXRpb25UeXBlTWFwOiBSZWNvcmQ8c3RyaW5nLCBUYXJnZXRBbm5vdGF0aW9uVHlwZT4gPSB7XG5cdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIjogVGFyZ2V0QW5ub3RhdGlvblR5cGUuRGF0YVBvaW50LFxuXHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIjogVGFyZ2V0QW5ub3RhdGlvblR5cGUuQ2hhcnQsXG5cdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JZGVudGlmaWNhdGlvblwiOiBUYXJnZXRBbm5vdGF0aW9uVHlwZS5JZGVudGlmaWNhdGlvbixcblx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQ29udGFjdFwiOiBUYXJnZXRBbm5vdGF0aW9uVHlwZS5Db250YWN0LFxuXHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5BZGRyZXNzXCI6IFRhcmdldEFubm90YXRpb25UeXBlLkFkZHJlc3MsXG5cdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GaWVsZEdyb3VwXCI6IFRhcmdldEFubm90YXRpb25UeXBlLkZpZWxkR3JvdXBcblx0fTtcblx0Ly8gUmVmZXJlbmNlVVJMRmFjZXQgYW5kIENvbGxlY3Rpb25GYWNldCBkbyBub3QgaGF2ZSBUYXJnZXQgcHJvcGVydHkuXG5cdGlmIChmYWNldERlZmluaXRpb24uJFR5cGUgIT09IFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZVVSTEZhY2V0ICYmIGZhY2V0RGVmaW5pdGlvbi4kVHlwZSAhPT0gVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0KSB7XG5cdFx0YW5ub3RhdGlvblR5cGUgPSBhbm5vdGF0aW9uVHlwZU1hcFtmYWNldERlZmluaXRpb24uVGFyZ2V0Py4kdGFyZ2V0Py50ZXJtXSB8fCBUYXJnZXRBbm5vdGF0aW9uVHlwZS5Ob25lO1xuXHR9XG5cblx0cmV0dXJuIGFubm90YXRpb25UeXBlO1xufVxuXG5mdW5jdGlvbiBnZXRGaWVsZEdyb3VwRm9ybURhdGEoZmFjZXREZWZpbml0aW9uOiBSZWZlcmVuY2VGYWNldFR5cGVzLCBjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogSGVhZGVyRm9ybURhdGEge1xuXHQvLyBzcGxpdCBpbiB0aGlzIGZyb20gYW5ub3RhdGlvbiArIGdldEZpZWxkR3JvdXBGcm9tRGVmYXVsdFxuXHRpZiAoIWZhY2V0RGVmaW5pdGlvbikge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBnZXQgRmllbGRHcm91cCBmb3JtIGRhdGEgd2l0aG91dCBmYWNldCBkZWZpbml0aW9uXCIpO1xuXHR9XG5cblx0Y29uc3QgZm9ybUVsZW1lbnRzID0gaW5zZXJ0Q3VzdG9tRWxlbWVudHMoXG5cdFx0Z2V0Rm9ybUVsZW1lbnRzRnJvbUFubm90YXRpb25zKGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0Z2V0Rm9ybUVsZW1lbnRzRnJvbU1hbmlmZXN0KGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dClcblx0KTtcblxuXHRyZXR1cm4ge1xuXHRcdGlkOiBnZXRIZWFkZXJGYWNldEZvcm1JRCh7IEZhY2V0OiBmYWNldERlZmluaXRpb24gfSksXG5cdFx0bGFiZWw6IGZhY2V0RGVmaW5pdGlvbi5MYWJlbD8udG9TdHJpbmcoKSxcblx0XHRmb3JtRWxlbWVudHNcblx0fTtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGFycmF5IG9mIG1hbmlmZXN0LWJhc2VkIEZvcm1FbGVtZW50cy5cbiAqXG4gKiBAcGFyYW0gZmFjZXREZWZpbml0aW9uIFRoZSBkZWZpbml0aW9uIG9mIHRoZSBmYWNldFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0IGZvciB0aGUgZmFjZXRcbiAqIEByZXR1cm5zIEFubm90YXRpb24tYmFzZWQgRm9ybUVsZW1lbnRzXG4gKi9cbmZ1bmN0aW9uIGdldEZvcm1FbGVtZW50c0Zyb21Bbm5vdGF0aW9ucyhmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBBbm5vdGF0aW9uRm9ybUVsZW1lbnRbXSB7XG5cdGNvbnN0IGFubm90YXRpb25CYXNlZEZvcm1FbGVtZW50czogQW5ub3RhdGlvbkZvcm1FbGVtZW50W10gPSBbXTtcblxuXHQvLyBSZWZlcmVuY2VVUkxGYWNldCBhbmQgQ29sbGVjdGlvbkZhY2V0IGRvIG5vdCBoYXZlIFRhcmdldCBwcm9wZXJ0eS5cblx0aWYgKGZhY2V0RGVmaW5pdGlvbi4kVHlwZSAhPT0gVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlVVJMRmFjZXQgJiYgZmFjZXREZWZpbml0aW9uLiRUeXBlICE9PSBVSUFubm90YXRpb25UeXBlcy5Db2xsZWN0aW9uRmFjZXQpIHtcblx0XHQoZmFjZXREZWZpbml0aW9uLlRhcmdldD8uJHRhcmdldCBhcyBGaWVsZEdyb3VwKT8uRGF0YS5mb3JFYWNoKChkYXRhRmllbGQ6IERhdGFGaWVsZEFic3RyYWN0VHlwZXMpID0+IHtcblx0XHRcdGlmICghKGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpID09PSB0cnVlKSkge1xuXHRcdFx0XHRjb25zdCBzZW1hbnRpY09iamVjdEFubm90YXRpb25QYXRoID0gZ2V0U2VtYW50aWNPYmplY3RQYXRoKGNvbnZlcnRlckNvbnRleHQsIGRhdGFGaWVsZCk7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHQoZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQgfHxcblx0XHRcdFx0XHRcdGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybCB8fFxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGggfHxcblx0XHRcdFx0XHRcdGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbiB8fFxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoQWN0aW9uKSAmJlxuXHRcdFx0XHRcdCFpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbihkYXRhRmllbGQpXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGNvbnN0IHsgYW5ub3RhdGlvbnMgfSA9IGRhdGFGaWVsZDtcblx0XHRcdFx0XHRhbm5vdGF0aW9uQmFzZWRGb3JtRWxlbWVudHMucHVzaCh7XG5cdFx0XHRcdFx0XHRpc1ZhbHVlTXVsdGlsaW5lVGV4dDogZGF0YUZpZWxkLlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uVUk/Lk11bHRpTGluZVRleHQ/LnZhbHVlT2YoKSA9PT0gdHJ1ZSxcblx0XHRcdFx0XHRcdHR5cGU6IEZvcm1FbGVtZW50VHlwZS5Bbm5vdGF0aW9uLFxuXHRcdFx0XHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCksXG5cdFx0XHRcdFx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkpLCB0cnVlKSkpLFxuXHRcdFx0XHRcdFx0bGFiZWw6IGRhdGFGaWVsZC5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uTGFiZWwgfHwgZGF0YUZpZWxkLkxhYmVsLFxuXHRcdFx0XHRcdFx0aWRQcmVmaXg6IGdldEhlYWRlckZhY2V0Rm9ybUlEKHsgRmFjZXQ6IGZhY2V0RGVmaW5pdGlvbiB9LCBkYXRhRmllbGQpLFxuXHRcdFx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGAke2NvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChkYXRhRmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKX0vYCxcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0UGF0aDogc2VtYW50aWNPYmplY3RBbm5vdGF0aW9uUGF0aFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdGRhdGFGaWVsZC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiAmJlxuXHRcdFx0XHRcdCFpc1JlZmVyZW5jZVByb3BlcnR5U3RhdGljYWxseUhpZGRlbihkYXRhRmllbGQpXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdGNvbnN0IHsgYW5ub3RhdGlvbnMgfSA9IGRhdGFGaWVsZDtcblx0XHRcdFx0XHRhbm5vdGF0aW9uQmFzZWRGb3JtRWxlbWVudHMucHVzaCh7XG5cdFx0XHRcdFx0XHQvLyBGSVhNRSB0aGlzIGlzIHdyb25nLCB0aGUgYW5ub3RhdGlvbiBzaG91bGQgZXhpc3QsIHNvIHRoZSB0YXJnZXQgaXMgbm90IHByb3Blcmx5IGlkZW50aWZpZWRcblx0XHRcdFx0XHRcdGlzVmFsdWVNdWx0aWxpbmVUZXh0OiAoZGF0YUZpZWxkLlRhcmdldD8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LlVJIGFzIGFueSk/Lk11bHRpTGluZVRleHQ/LnZhbHVlT2YoKSA9PT0gdHJ1ZSxcblx0XHRcdFx0XHRcdHR5cGU6IEZvcm1FbGVtZW50VHlwZS5Bbm5vdGF0aW9uLFxuXHRcdFx0XHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCksXG5cdFx0XHRcdFx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkpLCB0cnVlKSkpLFxuXHRcdFx0XHRcdFx0bGFiZWw6IGRhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQ/LmFubm90YXRpb25zPy5Db21tb24/LkxhYmVsPy50b1N0cmluZygpIHx8IGRhdGFGaWVsZC5MYWJlbD8udG9TdHJpbmcoKSxcblx0XHRcdFx0XHRcdGlkUHJlZml4OiBnZXRIZWFkZXJGYWNldEZvcm1JRCh7IEZhY2V0OiBmYWNldERlZmluaXRpb24gfSwgZGF0YUZpZWxkKSxcblx0XHRcdFx0XHRcdGFubm90YXRpb25QYXRoOiBgJHtjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoZGF0YUZpZWxkLmZ1bGx5UXVhbGlmaWVkTmFtZSl9L2AsXG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdFBhdGg6IHNlbWFudGljT2JqZWN0QW5ub3RhdGlvblBhdGhcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIGFubm90YXRpb25CYXNlZEZvcm1FbGVtZW50cztcbn1cblxuZnVuY3Rpb24gZ2V0RGF0YVBvaW50RGF0YShmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBIZWFkZXJEYXRhUG9pbnREYXRhIHtcblx0bGV0IHR5cGUgPSBIZWFkZXJEYXRhUG9pbnRUeXBlLkNvbnRlbnQ7XG5cdGxldCBzZW1hbnRpY09iamVjdFBhdGg7XG5cdGlmIChmYWNldERlZmluaXRpb24uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0ICYmICFpc0Fubm90YXRpb25GaWVsZFN0YXRpY2FsbHlIaWRkZW4oZmFjZXREZWZpbml0aW9uIGFzIGFueSkpIHtcblx0XHRpZiAoKGZhY2V0RGVmaW5pdGlvbi5UYXJnZXQ/LiR0YXJnZXQgYXMgRGF0YVBvaW50KT8uVmlzdWFsaXphdGlvbiA9PT0gXCJVSS5WaXN1YWxpemF0aW9uVHlwZS9Qcm9ncmVzc1wiKSB7XG5cdFx0XHR0eXBlID0gSGVhZGVyRGF0YVBvaW50VHlwZS5Qcm9ncmVzc0luZGljYXRvcjtcblx0XHR9IGVsc2UgaWYgKChmYWNldERlZmluaXRpb24uVGFyZ2V0Py4kdGFyZ2V0IGFzIERhdGFQb2ludCk/LlZpc3VhbGl6YXRpb24gPT09IFwiVUkuVmlzdWFsaXphdGlvblR5cGUvUmF0aW5nXCIpIHtcblx0XHRcdHR5cGUgPSBIZWFkZXJEYXRhUG9pbnRUeXBlLlJhdGluZ0luZGljYXRvcjtcblx0XHR9XG5cdFx0Y29uc3QgZGF0YVBvaW50ID0gZmFjZXREZWZpbml0aW9uLlRhcmdldD8uJHRhcmdldCBhcyBEYXRhUG9pbnQ7XG5cblx0XHRpZiAodHlwZW9mIGRhdGFQb2ludCA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0aWYgKGRhdGFQb2ludD8uVmFsdWU/LiR0YXJnZXQpIHtcblx0XHRcdFx0Y29uc3QgcHJvcGVydHkgPSBkYXRhUG9pbnQuVmFsdWUuJHRhcmdldDtcblx0XHRcdFx0aWYgKHByb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKHByb3BlcnR5Py5mdWxseVF1YWxpZmllZE5hbWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHsgdHlwZSwgc2VtYW50aWNPYmplY3RQYXRoIH07XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBhbm5vdGF0aW9uLWJhc2VkIGhlYWRlciBmYWNldC5cbiAqXG4gKiBAcGFyYW0gZmFjZXREZWZpbml0aW9uIFRoZSBkZWZpbml0aW9uIG9mIHRoZSBmYWNldFxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGNvbnZlcnRlciBjb250ZXh0XG4gKiBAcmV0dXJucyBUaGUgY3JlYXRlZCBhbm5vdGF0aW9uLWJhc2VkIGhlYWRlciBmYWNldFxuICovXG5mdW5jdGlvbiBjcmVhdGVIZWFkZXJGYWNldChmYWNldERlZmluaXRpb246IEZhY2V0VHlwZXMsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBPYmplY3RQYWdlSGVhZGVyRmFjZXQgfCB1bmRlZmluZWQge1xuXHRsZXQgaGVhZGVyRmFjZXQ6IE9iamVjdFBhZ2VIZWFkZXJGYWNldCB8IHVuZGVmaW5lZDtcblx0c3dpdGNoIChmYWNldERlZmluaXRpb24uJFR5cGUpIHtcblx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLlJlZmVyZW5jZUZhY2V0OlxuXHRcdFx0aGVhZGVyRmFjZXQgPSBjcmVhdGVSZWZlcmVuY2VIZWFkZXJGYWNldChmYWNldERlZmluaXRpb24sIGZhY2V0RGVmaW5pdGlvbiwgY29udmVydGVyQ29udGV4dCk7XG5cdFx0XHRicmVhaztcblxuXHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuQ29sbGVjdGlvbkZhY2V0OlxuXHRcdFx0aGVhZGVyRmFjZXQgPSBjcmVhdGVDb2xsZWN0aW9uSGVhZGVyRmFjZXQoZmFjZXREZWZpbml0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KTtcblx0XHRcdGJyZWFrO1xuXHRcdGRlZmF1bHQ6XG5cdFx0XHRicmVhaztcblx0fVxuXG5cdHJldHVybiBoZWFkZXJGYWNldDtcbn1cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBDb252ZXJ0ICYgQnVpbGQgTWFuaWZlc3QgQmFzZWQgSGVhZGVyIEZhY2V0c1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmZ1bmN0aW9uIGdlbmVyYXRlQmluZGluZyhyZXF1ZXN0R3JvdXBJZD86IHN0cmluZyk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGlmICghcmVxdWVzdEdyb3VwSWQpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGNvbnN0IGdyb3VwSWQgPVxuXHRcdFtcIkhlcm9lc1wiLCBcIkRlY29yYXRpb25cIiwgXCJXb3JrZXJzXCIsIFwiTG9uZ1J1bm5lcnNcIl0uaW5kZXhPZihyZXF1ZXN0R3JvdXBJZCkgIT09IC0xID8gYCRhdXRvLiR7cmVxdWVzdEdyb3VwSWR9YCA6IHJlcXVlc3RHcm91cElkO1xuXG5cdHJldHVybiBgeyBwYXRoIDogJycsIHBhcmFtZXRlcnMgOiB7ICQkZ3JvdXBJZCA6ICcke2dyb3VwSWR9JyB9IH1gO1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG1hbmlmZXN0IGJhc2VkIGN1c3RvbSBoZWFkZXIgZmFjZXQuXG4gKlxuICogQHBhcmFtIGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvblxuICogQHBhcmFtIGhlYWRlckZhY2V0S2V5XG4gKiBAcmV0dXJucyBUaGUgbWFuaWZlc3QgYmFzZWQgY3VzdG9tIGhlYWRlciBmYWNldCBjcmVhdGVkXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUN1c3RvbUhlYWRlckZhY2V0KGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbjogTWFuaWZlc3RIZWFkZXJGYWNldCwgaGVhZGVyRmFjZXRLZXk6IHN0cmluZyk6IEN1c3RvbU9iamVjdFBhZ2VIZWFkZXJGYWNldCB7XG5cdGNvbnN0IGN1c3RvbUhlYWRlckZhY2V0SUQgPSBnZXRDdXN0b21IZWFkZXJGYWNldElEKGhlYWRlckZhY2V0S2V5KTtcblxuXHRsZXQgcG9zaXRpb246IFBvc2l0aW9uIHwgdW5kZWZpbmVkID0gY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLnBvc2l0aW9uO1xuXHRpZiAoIXBvc2l0aW9uKSB7XG5cdFx0cG9zaXRpb24gPSB7XG5cdFx0XHRwbGFjZW1lbnQ6IFBsYWNlbWVudC5BZnRlclxuXHRcdH07XG5cdH1cblx0Ly8gVE9ETyBmb3IgYW4gbm9uIGFubm90YXRpb24gZnJhZ21lbnQgdGhlIG5hbWUgaXMgbWFuZGF0b3J5IC0+IE5vdCBjaGVja2VkXG5cdHJldHVybiB7XG5cdFx0ZmFjZXRUeXBlOiBGYWNldFR5cGUuUmVmZXJlbmNlLFxuXHRcdGZhY2V0czogW10sXG5cdFx0dHlwZTogY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLnR5cGUsXG5cdFx0aWQ6IGN1c3RvbUhlYWRlckZhY2V0SUQsXG5cdFx0Y29udGFpbmVySWQ6IGN1c3RvbUhlYWRlckZhY2V0SUQsXG5cdFx0a2V5OiBoZWFkZXJGYWNldEtleSxcblx0XHRwb3NpdGlvbjogcG9zaXRpb24sXG5cdFx0dmlzaWJsZTogY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLnZpc2libGUsXG5cdFx0ZnJhZ21lbnROYW1lOiBjdXN0b21IZWFkZXJGYWNldERlZmluaXRpb24udGVtcGxhdGUgfHwgY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLm5hbWUsXG5cdFx0dGl0bGU6IGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi50aXRsZSxcblx0XHRzdWJUaXRsZTogY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLnN1YlRpdGxlLFxuXHRcdHN0YXNoZWQ6IGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi5zdGFzaGVkIHx8IGZhbHNlLFxuXHRcdGZsZXhTZXR0aW5nczogeyAuLi57IGRlc2lnbnRpbWU6IEZsZXhEZXNpZ25UaW1lVHlwZS5EZWZhdWx0IH0sIC4uLmN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi5mbGV4U2V0dGluZ3MgfSxcblx0XHRiaW5kaW5nOiBnZW5lcmF0ZUJpbmRpbmcoY3VzdG9tSGVhZGVyRmFjZXREZWZpbml0aW9uLnJlcXVlc3RHcm91cElkKSxcblx0XHR0ZW1wbGF0ZUVkaXQ6IGN1c3RvbUhlYWRlckZhY2V0RGVmaW5pdGlvbi50ZW1wbGF0ZUVkaXRcblx0fTtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBMkJBO0VBQ0E7RUFDQTtFQUNBO0VBQUEsSUFFWUEsZUFBZTtFQUFBLFdBQWZBLGVBQWU7SUFBZkEsZUFBZTtJQUFmQSxlQUFlO0VBQUEsR0FBZkEsZUFBZSxLQUFmQSxlQUFlO0VBQUE7RUFBQSxJQUtmQyxTQUFTO0VBQUEsV0FBVEEsU0FBUztJQUFUQSxTQUFTO0lBQVRBLFNBQVM7RUFBQSxHQUFUQSxTQUFTLEtBQVRBLFNBQVM7RUFBQTtFQUFBLElBS1RDLGtCQUFrQjtFQUFBLFdBQWxCQSxrQkFBa0I7SUFBbEJBLGtCQUFrQjtJQUFsQkEsa0JBQWtCO0lBQWxCQSxrQkFBa0I7SUFBbEJBLGtCQUFrQjtFQUFBLEdBQWxCQSxrQkFBa0IsS0FBbEJBLGtCQUFrQjtFQUFBO0VBQUEsSUFpQnpCQyxtQkFBbUI7RUFBQSxXQUFuQkEsbUJBQW1CO0lBQW5CQSxtQkFBbUI7SUFBbkJBLG1CQUFtQjtJQUFuQkEsbUJBQW1CO0VBQUEsR0FBbkJBLG1CQUFtQixLQUFuQkEsbUJBQW1CO0VBQUEsSUFXbkJDLG9CQUFvQjtFQUFBLFdBQXBCQSxvQkFBb0I7SUFBcEJBLG9CQUFvQjtJQUFwQkEsb0JBQW9CO0lBQXBCQSxvQkFBb0I7SUFBcEJBLG9CQUFvQjtJQUFwQkEsb0JBQW9CO0lBQXBCQSxvQkFB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