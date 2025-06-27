/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/controls/Common/Form", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/ID", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/form/FormHelper", "sap/ui/model/odata/v4/AnnotationHelper"], function (BuildingBlock, BuildingBlockRuntime, Form, BindingHelper, ID, MetaModelConverter, BindingToolkit, DataModelPathHelper, FormHelper, AnnotationHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _templateObject, _templateObject2, _templateObject3, _templateObject4, _templateObject5, _templateObject6, _templateObject7, _templateObject8;
  var _exports = {};
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var ifElse = BindingToolkit.ifElse;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getFormContainerID = ID.getFormContainerID;
  var UI = BindingHelper.UI;
  var createFormDefinition = Form.createFormDefinition;
  var xml = BuildingBlockRuntime.xml;
  var xmlEvent = BuildingBlock.xmlEvent;
  var xmlAttribute = BuildingBlock.xmlAttribute;
  var xmlAggregation = BuildingBlock.xmlAggregation;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Building block for creating a Form based on the metadata provided by OData V4.
   * <br>
   * It is designed to work based on a FieldGroup annotation but can also work if you provide a ReferenceFacet or a CollectionFacet
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Form id="MyForm" metaPath="@com.sap.vocabularies.UI.v1.FieldGroup#GeneralInformation" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Form
   */
  var FormBuildingBlock = (_dec = defineBuildingBlock({
    name: "Form",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros"
  }), _dec2 = xmlAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = xmlAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true,
    $kind: ["EntitySet", "NavigationProperty", "EntityType"]
  }), _dec4 = xmlAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true
  }), _dec5 = xmlAttribute({
    type: "sap.ui.model.Context"
  }), _dec6 = xmlAttribute({
    type: "boolean"
  }), _dec7 = xmlAttribute({
    type: "boolean",
    defaultValue: true
  }), _dec8 = xmlAttribute({
    type: "string",
    isPublic: true
  }), _dec9 = xmlAttribute({
    type: "sap.ui.core.TitleLevel",
    isPublic: true,
    defaultValue: "Auto"
  }), _dec10 = xmlAttribute({
    type: "string"
  }), _dec11 = xmlAttribute({
    type: "string",
    defaultValue: "true"
  }), _dec12 = xmlEvent(), _dec13 = xmlAggregation({
    type: "sap.fe.macros.form.FormElement",
    isPublic: true,
    slot: "formElements",
    isDefault: true
  }), _dec14 = xmlAttribute({
    type: "object",
    isPublic: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FormBuildingBlock, _BuildingBlockBase);
    /**
     * The manifest defined form containers to be shown in the action area of the table
     */

    /**
     * Control the rendering of the form container labels
     */

    /**
     * Toggle Preview: Part of Preview / Preview via 'Show More' Button
     */

    // Other public properties or overrides

    /**
     * Defines the "aria-level" of the form title, titles of internally used form containers are nested subsequently
     */

    /**
     * 	If set to false, the Form is not rendered.
     */

    // Independent from the form title, can be a bit confusing in standalone usage at is not showing anything by default

    // Just proxied down to the Field may need to see if needed or not

    /**
     * Defines the layout to be used within the form.
     * It defaults to the ColumnLayout, but you can also use a ResponsiveGridLayout.
     * All the properties of the ResponsiveGridLayout can be added to the configuration.
     */

    function FormBuildingBlock(oProps, configuration, mSettings) {
      var _this;
      _this = _BuildingBlockBase.call(this, oProps, configuration, mSettings) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formContainers", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "useFormContainerLabels", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "partOfPreview", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "titleLevel", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "displayMode", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isVisible", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onChange", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formElements", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "layout", _descriptor13, _assertThisInitialized(_this));
      if (_this.metaPath && _this.contextPath && (_this.formContainers === undefined || _this.formContainers === null)) {
        var oContextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
        var mExtraSettings = {};
        var oFacetDefinition = oContextObjectPath.targetObject;
        var hasFieldGroup = false;
        if (oFacetDefinition && oFacetDefinition.$Type === "com.sap.vocabularies.UI.v1.FieldGroupType") {
          // Wrap the facet in a fake Facet annotation
          hasFieldGroup = true;
          oFacetDefinition = {
            $Type: "com.sap.vocabularies.UI.v1.ReferenceFacet",
            Label: oFacetDefinition.Label,
            Target: {
              $target: oFacetDefinition,
              fullyQualifiedName: oFacetDefinition.fullyQualifiedName,
              path: "",
              term: "",
              type: "AnnotationPath",
              value: getContextRelativeTargetObjectPath(oContextObjectPath)
            },
            annotations: {},
            fullyQualifiedName: oFacetDefinition.fullyQualifiedName
          };
          mExtraSettings[oFacetDefinition.Target.value] = {
            fields: _this.formElements
          };
        }
        var oConverterContext = _this.getConverterContext(oContextObjectPath, _this.contextPath, mSettings, mExtraSettings);
        var oFormDefinition = createFormDefinition(oFacetDefinition, _this.isVisible, oConverterContext);
        if (hasFieldGroup) {
          oFormDefinition.formContainers[0].annotationPath = _this.metaPath.getPath();
        }
        _this.formContainers = oFormDefinition.formContainers;
        _this.useFormContainerLabels = oFormDefinition.useFormContainerLabels;
        _this.facetType = oFacetDefinition && oFacetDefinition.$Type;
      } else {
        var _this$metaPath$getObj;
        _this.facetType = (_this$metaPath$getObj = _this.metaPath.getObject()) === null || _this$metaPath$getObj === void 0 ? void 0 : _this$metaPath$getObj.$Type;
      }
      if (!_this.isPublic) {
        _this._apiId = _this.createId("Form");
        _this._contentId = _this.id;
      } else {
        _this._apiId = _this.id;
        _this._contentId = "".concat(_this.id, "-content");
      }
      // if displayMode === true -> _editable = false
      // if displayMode === false -> _editable = true
      //  => if displayMode === {myBindingValue} -> _editable = {myBindingValue} === true ? true : false
      // if DisplayMode === undefined -> _editable = {ui>/isEditable}
      if (_this.displayMode !== undefined) {
        _this._editable = compileExpression(ifElse(equal(resolveBindingString(_this.displayMode, "boolean"), false), true, false));
      } else {
        _this._editable = compileExpression(UI.IsEditable);
      }
      return _this;
    }
    _exports = FormBuildingBlock;
    var _proto = FormBuildingBlock.prototype;
    _proto.getDataFieldCollection = function getDataFieldCollection(formContainer, facetContext) {
      var facet = facetContext.getObject();
      var navigationPath;
      var idPart;
      if (facet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
        navigationPath = AnnotationHelper.getNavigationPath(facet.Target.$AnnotationPath);
        idPart = {
          Facet: facet
        };
      } else {
        var contextPathPath = this.contextPath.getPath();
        var facetPath = facetContext.getPath();
        if (facetPath.startsWith(contextPathPath)) {
          facetPath = facetPath.substring(contextPathPath.length);
          if (facetPath.charAt(0) === "/") {
            facetPath = facetPath.slice(1);
          }
        }
        navigationPath = AnnotationHelper.getNavigationPath(facetPath);
        idPart = facetPath;
      }
      var titleLevel = FormHelper.getFormContainerTitleLevel(this.title, this.titleLevel);
      var title = this.useFormContainerLabels && facet ? AnnotationHelper.label(facet, {
        context: facetContext
      }) : "";
      var id = this.id ? getFormContainerID(idPart) : undefined;
      return xml(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n\t\t\t\t\t<macro:FormContainer\n\t\t\t\t\txmlns:macro=\"sap.fe.macros\"\n\t\t\t\t\t", "\n\t\t\t\t\ttitle=\"", "\"\n\t\t\t\t\ttitleLevel=\"", "\"\n\t\t\t\t\tcontextPath=\"", "\"\n\t\t\t\t\tmetaPath=\"", "\"\n\t\t\t\t\tdataFieldCollection=\"", "\"\n\t\t\t\t\tnavigationPath=\"", "\"\n\t\t\t\t\tvisible=\"", "\"\n\t\t\t\t\tdisplayMode=\"", "\"\n\t\t\t\t\tonChange=\"", "\"\n\t\t\t\t\tactions=\"", "\"\n\t\t\t\t>\n\t\t\t\t<macro:formElements>\n\t\t\t\t\t<slot name=\"formElements\" />\n\t\t\t\t</macro:formElements>\n\t\t\t</macro:FormContainer>"])), this.attr("id", id), title, titleLevel, navigationPath ? formContainer.entitySet : this.contextPath, facetContext, formContainer.formElements, navigationPath, formContainer.isVisible, this.displayMode, this.onChange, formContainer.actions);
    };
    _proto.getFormContainers = function getFormContainers() {
      var _this2 = this;
      if (this.formContainers.length === 0) {
        return "";
      }
      if (this.facetType.indexOf("com.sap.vocabularies.UI.v1.CollectionFacet") >= 0) {
        return this.formContainers.map(function (formContainer, formContainerIdx) {
          if (formContainer.isVisible) {
            var facetContext = _this2.contextPath.getModel().createBindingContext(formContainer.annotationPath, _this2.contextPath);
            var facet = facetContext.getObject();
            if (facet.$Type === "com.sap.vocabularies.UI.v1.ReferenceFacet" && FormHelper.isReferenceFacetPartOfPreview(facet, _this2.partOfPreview)) {
              if (facet.Target.$AnnotationPath.$Type === "com.sap.vocabularies.Communication.v1.AddressType") {
                return xml(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["<template:with path=\"formContainers>", "\" var=\"formContainer\">\n\t\t\t\t\t\t\t\t\t\t\t<template:with path=\"formContainers>", "/annotationPath\" var=\"facet\">\n\t\t\t\t\t\t\t\t\t\t\t\t<core:Fragment fragmentName=\"sap.fe.macros.form.AddressSection\" type=\"XML\" />\n\t\t\t\t\t\t\t\t\t\t\t</template:with>\n\t\t\t\t\t\t\t\t\t\t</template:with>"])), formContainerIdx, formContainerIdx);
              }
              return _this2.getDataFieldCollection(formContainer, facetContext);
            }
          }
          return "";
        });
      } else if (this.facetType === "com.sap.vocabularies.UI.v1.ReferenceFacet") {
        return this.formContainers.map(function (formContainer) {
          if (formContainer.isVisible) {
            var facetContext = _this2.contextPath.getModel().createBindingContext(formContainer.annotationPath, _this2.contextPath);
            return _this2.getDataFieldCollection(formContainer, facetContext);
          } else {
            return "";
          }
        });
      }
      return xml(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral([""])));
    }

    /**
     * Create the proper layout information based on the `layout` property defined externally.
     *
     * @returns The layout information for the xml.
     */;
    _proto.getLayoutInformation = function getLayoutInformation() {
      switch (this.layout.type) {
        case "ResponsiveGridLayout":
          return xml(_templateObject4 || (_templateObject4 = _taggedTemplateLiteral(["<f:ResponsiveGridLayout adjustLabelSpan=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\tbreakpointL=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\tbreakpointM=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\tbreakpointXL=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\tcolumnsL=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\tcolumnsM=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\tcolumnsXL=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\temptySpanL=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\temptySpanM=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\temptySpanS=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\temptySpanXL=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\tlabelSpanL=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\tlabelSpanM=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\tlabelSpanS=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\tlabelSpanXL=\"", "\"\n\t\t\t\t\t\t\t\t\t\t\t\t\tsingleContainerFullSize=\"", "\" />"])), this.layout.adjustLabelSpan, this.layout.breakpointL, this.layout.breakpointM, this.layout.breakpointXL, this.layout.columnsL, this.layout.columnsM, this.layout.columnsXL, this.layout.emptySpanL, this.layout.emptySpanM, this.layout.emptySpanS, this.layout.emptySpanXL, this.layout.labelSpanL, this.layout.labelSpanM, this.layout.labelSpanS, this.layout.labelSpanXL, this.layout.singleContainerFullSize);
        case "ColumnLayout":
        default:
          return xml(_templateObject5 || (_templateObject5 = _taggedTemplateLiteral(["<f:ColumnLayout\n\t\t\t\t\t\t\t\tcolumnsM=\"", "\"\n\t\t\t\t\t\t\t\tcolumnsL=\"", "\"\n\t\t\t\t\t\t\t\tcolumnsXL=\"", "\"\n\t\t\t\t\t\t\t\tlabelCellsLarge=\"", "\"\n\t\t\t\t\t\t\t\temptyCellsLarge=\"", "\" />"])), this.layout.columnsM, this.layout.columnsL, this.layout.columnsXL, this.layout.labelCellsLarge, this.layout.emptyCellsLarge);
      }
    };
    _proto.getTemplate = function getTemplate() {
      var onChangeStr = this.onChange && this.onChange.replace("{", "\\{").replace("}", "\\}") || "";
      var metaPathPath = this.metaPath.getPath();
      var contextPathPath = this.contextPath.getPath();
      if (!this.isVisible) {
        return xml(_templateObject6 || (_templateObject6 = _taggedTemplateLiteral([""])));
      } else {
        return xml(_templateObject7 || (_templateObject7 = _taggedTemplateLiteral(["<macro:FormAPI xmlns:macro=\"sap.fe.macros.form\"\n\t\t\t\t\txmlns:macrodata=\"http://schemas.sap.com/sapui5/extension/sap.ui.core.CustomData/1\"\n\t\t\t\t\txmlns:f=\"sap.ui.layout.form\"\n\t\t\t\t\txmlns:fl=\"sap.ui.fl\"\n\t\t\t\t\tid=\"", "\"\n\t\t\t\t\tmetaPath=\"", "\"\n\t\t\t\t\tcontextPath=\"", "\">\n\t\t\t\t<f:Form\n\t\t\t\t\tfl:delegate='{\n\t\t\t\t\t\t\"name\": \"sap/fe/macros/form/FormDelegate\",\n\t\t\t\t\t\t\"delegateType\": \"complete\"\n\t\t\t\t\t}'\n\t\t\t\t\tid=\"", "\"\n\t\t\t\t\teditable=\"", "\"\n\t\t\t\t\tmacrodata:entitySet=\"{contextPath>@sapui.name}\"\n\t\t\t\t\tvisible=\"", "\"\n\t\t\t\t\tclass=\"sapUxAPObjectPageSubSectionAlignContent\"\n\t\t\t\t\tmacrodata:navigationPath=\"", "\"\n\t\t\t\t\tmacrodata:onChange=\"", "\"\n\t\t\t\t>\n\t\t\t\t\t", "\n\t\t\t\t\t<f:layout>\n\t\t\t\t\t", "\n\n\t\t\t\t\t</f:layout>\n\t\t\t\t\t<f:formContainers>\n\t\t\t\t\t\t", "\n\t\t\t\t\t</f:formContainers>\n\t\t\t\t</f:Form>\n\t\t\t</macro:FormAPI>"])), this._apiId, metaPathPath, contextPathPath, this._contentId, this._editable, this.isVisible, contextPathPath, onChangeStr, this.addConditionally(this.title !== undefined, xml(_templateObject8 || (_templateObject8 = _taggedTemplateLiteral(["<f:title>\n\t\t\t\t\t\t\t<core:Title level=\"", "\" text=\"", "\" />\n\t\t\t\t\t\t</f:title>"])), this.titleLevel, this.title)), this.getLayoutInformation(), this.getFormContainers());
      }
    };
    return FormBuildingBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "formContainers", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "useFormContainerLabels", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "partOfPreview", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "title", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "titleLevel", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "displayMode", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "isVisible", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "onChange", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "formElements", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "layout", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {
        type: "ColumnLayout",
        columnsM: 2,
        columnsXL: 6,
        columnsL: 3,
        labelCellsLarge: 12
      };
    }
  })), _class2)) || _class);
  _exports = FormBuildingBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtQnVpbGRpbmdCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwieG1sQXR0cmlidXRlIiwidHlwZSIsImlzUHVibGljIiwicmVxdWlyZWQiLCIka2luZCIsImRlZmF1bHRWYWx1ZSIsInhtbEV2ZW50IiwieG1sQWdncmVnYXRpb24iLCJzbG90IiwiaXNEZWZhdWx0Iiwib1Byb3BzIiwiY29uZmlndXJhdGlvbiIsIm1TZXR0aW5ncyIsIm1ldGFQYXRoIiwiY29udGV4dFBhdGgiLCJmb3JtQ29udGFpbmVycyIsInVuZGVmaW5lZCIsIm9Db250ZXh0T2JqZWN0UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIm1FeHRyYVNldHRpbmdzIiwib0ZhY2V0RGVmaW5pdGlvbiIsInRhcmdldE9iamVjdCIsImhhc0ZpZWxkR3JvdXAiLCIkVHlwZSIsIkxhYmVsIiwiVGFyZ2V0IiwiJHRhcmdldCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInBhdGgiLCJ0ZXJtIiwidmFsdWUiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwiYW5ub3RhdGlvbnMiLCJmaWVsZHMiLCJmb3JtRWxlbWVudHMiLCJvQ29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHQiLCJvRm9ybURlZmluaXRpb24iLCJjcmVhdGVGb3JtRGVmaW5pdGlvbiIsImlzVmlzaWJsZSIsImFubm90YXRpb25QYXRoIiwiZ2V0UGF0aCIsInVzZUZvcm1Db250YWluZXJMYWJlbHMiLCJmYWNldFR5cGUiLCJnZXRPYmplY3QiLCJfYXBpSWQiLCJjcmVhdGVJZCIsIl9jb250ZW50SWQiLCJpZCIsImRpc3BsYXlNb2RlIiwiX2VkaXRhYmxlIiwiY29tcGlsZUV4cHJlc3Npb24iLCJpZkVsc2UiLCJlcXVhbCIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiVUkiLCJJc0VkaXRhYmxlIiwiZ2V0RGF0YUZpZWxkQ29sbGVjdGlvbiIsImZvcm1Db250YWluZXIiLCJmYWNldENvbnRleHQiLCJmYWNldCIsIm5hdmlnYXRpb25QYXRoIiwiaWRQYXJ0IiwiQW5ub3RhdGlvbkhlbHBlciIsImdldE5hdmlnYXRpb25QYXRoIiwiJEFubm90YXRpb25QYXRoIiwiRmFjZXQiLCJjb250ZXh0UGF0aFBhdGgiLCJmYWNldFBhdGgiLCJzdGFydHNXaXRoIiwic3Vic3RyaW5nIiwibGVuZ3RoIiwiY2hhckF0Iiwic2xpY2UiLCJ0aXRsZUxldmVsIiwiRm9ybUhlbHBlciIsImdldEZvcm1Db250YWluZXJUaXRsZUxldmVsIiwidGl0bGUiLCJsYWJlbCIsImNvbnRleHQiLCJnZXRGb3JtQ29udGFpbmVySUQiLCJ4bWwiLCJhdHRyIiwiZW50aXR5U2V0Iiwib25DaGFuZ2UiLCJhY3Rpb25zIiwiZ2V0Rm9ybUNvbnRhaW5lcnMiLCJpbmRleE9mIiwibWFwIiwiZm9ybUNvbnRhaW5lcklkeCIsImdldE1vZGVsIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJpc1JlZmVyZW5jZUZhY2V0UGFydE9mUHJldmlldyIsInBhcnRPZlByZXZpZXciLCJnZXRMYXlvdXRJbmZvcm1hdGlvbiIsImxheW91dCIsImFkanVzdExhYmVsU3BhbiIsImJyZWFrcG9pbnRMIiwiYnJlYWtwb2ludE0iLCJicmVha3BvaW50WEwiLCJjb2x1bW5zTCIsImNvbHVtbnNNIiwiY29sdW1uc1hMIiwiZW1wdHlTcGFuTCIsImVtcHR5U3Bhbk0iLCJlbXB0eVNwYW5TIiwiZW1wdHlTcGFuWEwiLCJsYWJlbFNwYW5MIiwibGFiZWxTcGFuTSIsImxhYmVsU3BhblMiLCJsYWJlbFNwYW5YTCIsInNpbmdsZUNvbnRhaW5lckZ1bGxTaXplIiwibGFiZWxDZWxsc0xhcmdlIiwiZW1wdHlDZWxsc0xhcmdlIiwiZ2V0VGVtcGxhdGUiLCJvbkNoYW5nZVN0ciIsInJlcGxhY2UiLCJtZXRhUGF0aFBhdGgiLCJhZGRDb25kaXRpb25hbGx5IiwiQnVpbGRpbmdCbG9ja0Jhc2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZvcm1CdWlsZGluZ0Jsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbW11bmljYXRpb25Bbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW11bmljYXRpb25cIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IHsgQnVpbGRpbmdCbG9ja0Jhc2UsIGRlZmluZUJ1aWxkaW5nQmxvY2ssIHhtbEFnZ3JlZ2F0aW9uLCB4bWxBdHRyaWJ1dGUsIHhtbEV2ZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCB7IHhtbCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrUnVudGltZVwiO1xuaW1wb3J0IHR5cGUgeyBGb3JtQ29udGFpbmVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0Zvcm1cIjtcbmltcG9ydCB7IGNyZWF0ZUZvcm1EZWZpbml0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0Zvcm1cIjtcbmltcG9ydCB7IFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRGb3JtQ29udGFpbmVySUQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0lEXCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGVxdWFsLCBpZkVsc2UsIHJlc29sdmVCaW5kaW5nU3RyaW5nIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB0eXBlIHsgUHJvcGVydGllc09mIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IEZvcm1IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvZm9ybS9Gb3JtSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFRpdGxlTGV2ZWwgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IHsgJENvbHVtbkxheW91dFNldHRpbmdzIH0gZnJvbSBcInNhcC91aS9sYXlvdXQvZm9ybS9Db2x1bW5MYXlvdXRcIjtcbmltcG9ydCB0eXBlIHsgJFJlc3BvbnNpdmVHcmlkTGF5b3V0U2V0dGluZ3MgfSBmcm9tIFwic2FwL3VpL2xheW91dC9mb3JtL1Jlc3BvbnNpdmVHcmlkTGF5b3V0XCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEFubm90YXRpb25IZWxwZXIgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Bbm5vdGF0aW9uSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxudHlwZSBDb2x1bW5MYXlvdXQgPSAkQ29sdW1uTGF5b3V0U2V0dGluZ3MgJiB7XG5cdHR5cGU6IFwiQ29sdW1uTGF5b3V0XCI7XG59O1xudHlwZSBSZXNwb25zaXZlR3JpZExheW91dCA9ICRSZXNwb25zaXZlR3JpZExheW91dFNldHRpbmdzICYge1xuXHR0eXBlOiBcIlJlc3BvbnNpdmVHcmlkTGF5b3V0XCI7XG59O1xudHlwZSBGb3JtTGF5b3V0SW5mb3JtYXRpb24gPSBDb2x1bW5MYXlvdXQgfCBSZXNwb25zaXZlR3JpZExheW91dDtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBGb3JtIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIEl0IGlzIGRlc2lnbmVkIHRvIHdvcmsgYmFzZWQgb24gYSBGaWVsZEdyb3VwIGFubm90YXRpb24gYnV0IGNhbiBhbHNvIHdvcmsgaWYgeW91IHByb3ZpZGUgYSBSZWZlcmVuY2VGYWNldCBvciBhIENvbGxlY3Rpb25GYWNldFxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpGb3JtIGlkPVwiTXlGb3JtXCIgbWV0YVBhdGg9XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmllbGRHcm91cCNHZW5lcmFsSW5mb3JtYXRpb25cIiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuRm9ybVxuICovXG5AZGVmaW5lQnVpbGRpbmdCbG9jayh7XG5cdG5hbWU6IFwiRm9ybVwiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHRwdWJsaWNOYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiXG59KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgRm9ybUJ1aWxkaW5nQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSB7XG5cdEB4bWxBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiLCBpc1B1YmxpYzogdHJ1ZSwgcmVxdWlyZWQ6IHRydWUgfSlcblx0aWQhOiBzdHJpbmc7XG5cblx0QHhtbEF0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdCRraW5kOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJFbnRpdHlUeXBlXCJdXG5cdH0pXG5cdGNvbnRleHRQYXRoITogVjRDb250ZXh0O1xuXG5cdEB4bWxBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRpc1B1YmxpYzogdHJ1ZSxcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRtZXRhUGF0aCE6IFY0Q29udGV4dDtcblxuXHQvKipcblx0ICogVGhlIG1hbmlmZXN0IGRlZmluZWQgZm9ybSBjb250YWluZXJzIHRvIGJlIHNob3duIGluIHRoZSBhY3Rpb24gYXJlYSBvZiB0aGUgdGFibGVcblx0ICovXG5cdEB4bWxBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIgfSlcblx0Zm9ybUNvbnRhaW5lcnM/OiBGb3JtQ29udGFpbmVyW107XG5cblx0LyoqXG5cdCAqIENvbnRyb2wgdGhlIHJlbmRlcmluZyBvZiB0aGUgZm9ybSBjb250YWluZXIgbGFiZWxzXG5cdCAqL1xuXHRAeG1sQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0dXNlRm9ybUNvbnRhaW5lckxhYmVscyE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRvZ2dsZSBQcmV2aWV3OiBQYXJ0IG9mIFByZXZpZXcgLyBQcmV2aWV3IHZpYSAnU2hvdyBNb3JlJyBCdXR0b25cblx0ICovXG5cdEB4bWxBdHRyaWJ1dGUoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdHBhcnRPZlByZXZpZXchOiBib29sZWFuO1xuXG5cdC8vIE90aGVyIHB1YmxpYyBwcm9wZXJ0aWVzIG9yIG92ZXJyaWRlc1xuXHRAeG1sQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUgfSlcblx0dGl0bGU/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIFwiYXJpYS1sZXZlbFwiIG9mIHRoZSBmb3JtIHRpdGxlLCB0aXRsZXMgb2YgaW50ZXJuYWxseSB1c2VkIGZvcm0gY29udGFpbmVycyBhcmUgbmVzdGVkIHN1YnNlcXVlbnRseVxuXHQgKi9cblx0QHhtbEF0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLmNvcmUuVGl0bGVMZXZlbFwiLCBpc1B1YmxpYzogdHJ1ZSwgZGVmYXVsdFZhbHVlOiBcIkF1dG9cIiB9KVxuXHR0aXRsZUxldmVsPzogVGl0bGVMZXZlbDtcblxuXHRAeG1sQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRkaXNwbGF5TW9kZSE6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXG5cdC8qKlxuXHQgKiBcdElmIHNldCB0byBmYWxzZSwgdGhlIEZvcm0gaXMgbm90IHJlbmRlcmVkLlxuXHQgKi9cblx0QHhtbEF0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGRlZmF1bHRWYWx1ZTogXCJ0cnVlXCIgfSlcblx0aXNWaXNpYmxlITogc3RyaW5nO1xuXHQvLyBJbmRlcGVuZGVudCBmcm9tIHRoZSBmb3JtIHRpdGxlLCBjYW4gYmUgYSBiaXQgY29uZnVzaW5nIGluIHN0YW5kYWxvbmUgdXNhZ2UgYXQgaXMgbm90IHNob3dpbmcgYW55dGhpbmcgYnkgZGVmYXVsdFxuXG5cdC8vIEp1c3QgcHJveGllZCBkb3duIHRvIHRoZSBGaWVsZCBtYXkgbmVlZCB0byBzZWUgaWYgbmVlZGVkIG9yIG5vdFxuXHRAeG1sRXZlbnQoKVxuXHRvbkNoYW5nZTogc3RyaW5nID0gXCJcIjtcblxuXHRAeG1sQWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC5mZS5tYWNyb3MuZm9ybS5Gb3JtRWxlbWVudFwiLCBpc1B1YmxpYzogdHJ1ZSwgc2xvdDogXCJmb3JtRWxlbWVudHNcIiwgaXNEZWZhdWx0OiB0cnVlIH0pXG5cdGZvcm1FbGVtZW50czogYW55O1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBsYXlvdXQgdG8gYmUgdXNlZCB3aXRoaW4gdGhlIGZvcm0uXG5cdCAqIEl0IGRlZmF1bHRzIHRvIHRoZSBDb2x1bW5MYXlvdXQsIGJ1dCB5b3UgY2FuIGFsc28gdXNlIGEgUmVzcG9uc2l2ZUdyaWRMYXlvdXQuXG5cdCAqIEFsbCB0aGUgcHJvcGVydGllcyBvZiB0aGUgUmVzcG9uc2l2ZUdyaWRMYXlvdXQgY2FuIGJlIGFkZGVkIHRvIHRoZSBjb25maWd1cmF0aW9uLlxuXHQgKi9cblx0QHhtbEF0dHJpYnV0ZSh7IHR5cGU6IFwib2JqZWN0XCIsIGlzUHVibGljOiB0cnVlIH0pXG5cdGxheW91dDogRm9ybUxheW91dEluZm9ybWF0aW9uID0geyB0eXBlOiBcIkNvbHVtbkxheW91dFwiLCBjb2x1bW5zTTogMiwgY29sdW1uc1hMOiA2LCBjb2x1bW5zTDogMywgbGFiZWxDZWxsc0xhcmdlOiAxMiB9O1xuXG5cdC8vIFVzZWZ1bCBmb3Igb3VyIGR5bmFtaWMgdGhpbmcgYnV0IGFsc28gZGVwZW5kcyBvbiB0aGUgbWV0YWRhdGEgLT4gbWFrZSBzdXJlIHRoaXMgaXMgdGFrZW4gaW50byBhY2NvdW50XG5cdF9lZGl0YWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cblx0X2FwaUlkOiBzdHJpbmc7XG5cdF9jb250ZW50SWQ6IHN0cmluZztcblx0ZmFjZXRUeXBlOiBzdHJpbmc7XG5cdGNvbnN0cnVjdG9yKG9Qcm9wczogUHJvcGVydGllc09mPEZvcm1CdWlsZGluZ0Jsb2NrPiwgY29uZmlndXJhdGlvbjogYW55LCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdHN1cGVyKG9Qcm9wcywgY29uZmlndXJhdGlvbiwgbVNldHRpbmdzKTtcblx0XHRpZiAodGhpcy5tZXRhUGF0aCAmJiB0aGlzLmNvbnRleHRQYXRoICYmICh0aGlzLmZvcm1Db250YWluZXJzID09PSB1bmRlZmluZWQgfHwgdGhpcy5mb3JtQ29udGFpbmVycyA9PT0gbnVsbCkpIHtcblx0XHRcdGNvbnN0IG9Db250ZXh0T2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRcdGNvbnN0IG1FeHRyYVNldHRpbmdzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cdFx0XHRsZXQgb0ZhY2V0RGVmaW5pdGlvbiA9IG9Db250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3Q7XG5cdFx0XHRsZXQgaGFzRmllbGRHcm91cCA9IGZhbHNlO1xuXHRcdFx0aWYgKG9GYWNldERlZmluaXRpb24gJiYgb0ZhY2V0RGVmaW5pdGlvbi4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRmllbGRHcm91cFR5cGUpIHtcblx0XHRcdFx0Ly8gV3JhcCB0aGUgZmFjZXQgaW4gYSBmYWtlIEZhY2V0IGFubm90YXRpb25cblx0XHRcdFx0aGFzRmllbGRHcm91cCA9IHRydWU7XG5cdFx0XHRcdG9GYWNldERlZmluaXRpb24gPSB7XG5cdFx0XHRcdFx0JFR5cGU6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVmZXJlbmNlRmFjZXRcIixcblx0XHRcdFx0XHRMYWJlbDogb0ZhY2V0RGVmaW5pdGlvbi5MYWJlbCxcblx0XHRcdFx0XHRUYXJnZXQ6IHtcblx0XHRcdFx0XHRcdCR0YXJnZXQ6IG9GYWNldERlZmluaXRpb24sXG5cdFx0XHRcdFx0XHRmdWxseVF1YWxpZmllZE5hbWU6IG9GYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lLFxuXHRcdFx0XHRcdFx0cGF0aDogXCJcIixcblx0XHRcdFx0XHRcdHRlcm06IFwiXCIsXG5cdFx0XHRcdFx0XHR0eXBlOiBcIkFubm90YXRpb25QYXRoXCIsXG5cdFx0XHRcdFx0XHR2YWx1ZTogZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChvQ29udGV4dE9iamVjdFBhdGgpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRhbm5vdGF0aW9uczoge30sXG5cdFx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBvRmFjZXREZWZpbml0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRtRXh0cmFTZXR0aW5nc1tvRmFjZXREZWZpbml0aW9uLlRhcmdldC52YWx1ZV0gPSB7IGZpZWxkczogdGhpcy5mb3JtRWxlbWVudHMgfTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3Qgb0NvbnZlcnRlckNvbnRleHQgPSB0aGlzLmdldENvbnZlcnRlckNvbnRleHQob0NvbnRleHRPYmplY3RQYXRoLCB0aGlzLmNvbnRleHRQYXRoLCBtU2V0dGluZ3MsIG1FeHRyYVNldHRpbmdzKTtcblx0XHRcdGNvbnN0IG9Gb3JtRGVmaW5pdGlvbiA9IGNyZWF0ZUZvcm1EZWZpbml0aW9uKG9GYWNldERlZmluaXRpb24sIHRoaXMuaXNWaXNpYmxlLCBvQ29udmVydGVyQ29udGV4dCk7XG5cdFx0XHRpZiAoaGFzRmllbGRHcm91cCkge1xuXHRcdFx0XHRvRm9ybURlZmluaXRpb24uZm9ybUNvbnRhaW5lcnNbMF0uYW5ub3RhdGlvblBhdGggPSB0aGlzLm1ldGFQYXRoLmdldFBhdGgoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuZm9ybUNvbnRhaW5lcnMgPSBvRm9ybURlZmluaXRpb24uZm9ybUNvbnRhaW5lcnM7XG5cdFx0XHR0aGlzLnVzZUZvcm1Db250YWluZXJMYWJlbHMgPSBvRm9ybURlZmluaXRpb24udXNlRm9ybUNvbnRhaW5lckxhYmVscztcblx0XHRcdHRoaXMuZmFjZXRUeXBlID0gb0ZhY2V0RGVmaW5pdGlvbiAmJiBvRmFjZXREZWZpbml0aW9uLiRUeXBlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLmZhY2V0VHlwZSA9IHRoaXMubWV0YVBhdGguZ2V0T2JqZWN0KCk/LiRUeXBlO1xuXHRcdH1cblxuXHRcdGlmICghdGhpcy5pc1B1YmxpYykge1xuXHRcdFx0dGhpcy5fYXBpSWQgPSB0aGlzLmNyZWF0ZUlkKFwiRm9ybVwiKSE7XG5cdFx0XHR0aGlzLl9jb250ZW50SWQgPSB0aGlzLmlkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLl9hcGlJZCA9IHRoaXMuaWQ7XG5cdFx0XHR0aGlzLl9jb250ZW50SWQgPSBgJHt0aGlzLmlkfS1jb250ZW50YDtcblx0XHR9XG5cdFx0Ly8gaWYgZGlzcGxheU1vZGUgPT09IHRydWUgLT4gX2VkaXRhYmxlID0gZmFsc2Vcblx0XHQvLyBpZiBkaXNwbGF5TW9kZSA9PT0gZmFsc2UgLT4gX2VkaXRhYmxlID0gdHJ1ZVxuXHRcdC8vICA9PiBpZiBkaXNwbGF5TW9kZSA9PT0ge215QmluZGluZ1ZhbHVlfSAtPiBfZWRpdGFibGUgPSB7bXlCaW5kaW5nVmFsdWV9ID09PSB0cnVlID8gdHJ1ZSA6IGZhbHNlXG5cdFx0Ly8gaWYgRGlzcGxheU1vZGUgPT09IHVuZGVmaW5lZCAtPiBfZWRpdGFibGUgPSB7dWk+L2lzRWRpdGFibGV9XG5cdFx0aWYgKHRoaXMuZGlzcGxheU1vZGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGhpcy5fZWRpdGFibGUgPSBjb21waWxlRXhwcmVzc2lvbihpZkVsc2UoZXF1YWwocmVzb2x2ZUJpbmRpbmdTdHJpbmcodGhpcy5kaXNwbGF5TW9kZSwgXCJib29sZWFuXCIpLCBmYWxzZSksIHRydWUsIGZhbHNlKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHRoaXMuX2VkaXRhYmxlID0gY29tcGlsZUV4cHJlc3Npb24oVUkuSXNFZGl0YWJsZSk7XG5cdFx0fVxuXHR9XG5cblx0Z2V0RGF0YUZpZWxkQ29sbGVjdGlvbihmb3JtQ29udGFpbmVyOiBGb3JtQ29udGFpbmVyLCBmYWNldENvbnRleHQ6IENvbnRleHQpIHtcblx0XHRjb25zdCBmYWNldCA9IGZhY2V0Q29udGV4dC5nZXRPYmplY3QoKSBhcyBhbnk7XG5cdFx0bGV0IG5hdmlnYXRpb25QYXRoO1xuXHRcdGxldCBpZFBhcnQ7XG5cdFx0aWYgKGZhY2V0LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5SZWZlcmVuY2VGYWNldCkge1xuXHRcdFx0bmF2aWdhdGlvblBhdGggPSBBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKGZhY2V0LlRhcmdldC4kQW5ub3RhdGlvblBhdGgpO1xuXHRcdFx0aWRQYXJ0ID0geyBGYWNldDogZmFjZXQgfTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgY29udGV4dFBhdGhQYXRoID0gdGhpcy5jb250ZXh0UGF0aC5nZXRQYXRoKCk7XG5cdFx0XHRsZXQgZmFjZXRQYXRoID0gZmFjZXRDb250ZXh0LmdldFBhdGgoKTtcblx0XHRcdGlmIChmYWNldFBhdGguc3RhcnRzV2l0aChjb250ZXh0UGF0aFBhdGgpKSB7XG5cdFx0XHRcdGZhY2V0UGF0aCA9IGZhY2V0UGF0aC5zdWJzdHJpbmcoY29udGV4dFBhdGhQYXRoLmxlbmd0aCk7XG5cdFx0XHRcdGlmIChmYWNldFBhdGguY2hhckF0KDApID09PSBcIi9cIikge1xuXHRcdFx0XHRcdGZhY2V0UGF0aCA9IGZhY2V0UGF0aC5zbGljZSgxKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0bmF2aWdhdGlvblBhdGggPSBBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKGZhY2V0UGF0aCk7XG5cdFx0XHRpZFBhcnQgPSBmYWNldFBhdGg7XG5cdFx0fVxuXHRcdGNvbnN0IHRpdGxlTGV2ZWwgPSBGb3JtSGVscGVyLmdldEZvcm1Db250YWluZXJUaXRsZUxldmVsKHRoaXMudGl0bGUsIHRoaXMudGl0bGVMZXZlbCk7XG5cdFx0Y29uc3QgdGl0bGUgPSB0aGlzLnVzZUZvcm1Db250YWluZXJMYWJlbHMgJiYgZmFjZXQgPyBBbm5vdGF0aW9uSGVscGVyLmxhYmVsKGZhY2V0LCB7IGNvbnRleHQ6IGZhY2V0Q29udGV4dCB9KSA6IFwiXCI7XG5cdFx0Y29uc3QgaWQgPSB0aGlzLmlkID8gZ2V0Rm9ybUNvbnRhaW5lcklEKGlkUGFydCkgOiB1bmRlZmluZWQ7XG5cblx0XHRyZXR1cm4geG1sYFxuXHRcdFx0XHRcdDxtYWNybzpGb3JtQ29udGFpbmVyXG5cdFx0XHRcdFx0eG1sbnM6bWFjcm89XCJzYXAuZmUubWFjcm9zXCJcblx0XHRcdFx0XHQke3RoaXMuYXR0cihcImlkXCIsIGlkKX1cblx0XHRcdFx0XHR0aXRsZT1cIiR7dGl0bGV9XCJcblx0XHRcdFx0XHR0aXRsZUxldmVsPVwiJHt0aXRsZUxldmVsfVwiXG5cdFx0XHRcdFx0Y29udGV4dFBhdGg9XCIke25hdmlnYXRpb25QYXRoID8gZm9ybUNvbnRhaW5lci5lbnRpdHlTZXQgOiB0aGlzLmNvbnRleHRQYXRofVwiXG5cdFx0XHRcdFx0bWV0YVBhdGg9XCIke2ZhY2V0Q29udGV4dH1cIlxuXHRcdFx0XHRcdGRhdGFGaWVsZENvbGxlY3Rpb249XCIke2Zvcm1Db250YWluZXIuZm9ybUVsZW1lbnRzfVwiXG5cdFx0XHRcdFx0bmF2aWdhdGlvblBhdGg9XCIke25hdmlnYXRpb25QYXRofVwiXG5cdFx0XHRcdFx0dmlzaWJsZT1cIiR7Zm9ybUNvbnRhaW5lci5pc1Zpc2libGV9XCJcblx0XHRcdFx0XHRkaXNwbGF5TW9kZT1cIiR7dGhpcy5kaXNwbGF5TW9kZX1cIlxuXHRcdFx0XHRcdG9uQ2hhbmdlPVwiJHt0aGlzLm9uQ2hhbmdlfVwiXG5cdFx0XHRcdFx0YWN0aW9ucz1cIiR7Zm9ybUNvbnRhaW5lci5hY3Rpb25zfVwiXG5cdFx0XHRcdD5cblx0XHRcdFx0PG1hY3JvOmZvcm1FbGVtZW50cz5cblx0XHRcdFx0XHQ8c2xvdCBuYW1lPVwiZm9ybUVsZW1lbnRzXCIgLz5cblx0XHRcdFx0PC9tYWNybzpmb3JtRWxlbWVudHM+XG5cdFx0XHQ8L21hY3JvOkZvcm1Db250YWluZXI+YDtcblx0fVxuXG5cdGdldEZvcm1Db250YWluZXJzKCkge1xuXHRcdGlmICh0aGlzLmZvcm1Db250YWluZXJzIS5sZW5ndGggPT09IDApIHtcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0XHRpZiAodGhpcy5mYWNldFR5cGUuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNvbGxlY3Rpb25GYWNldFwiKSA+PSAwKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5mb3JtQ29udGFpbmVycyEubWFwKChmb3JtQ29udGFpbmVyLCBmb3JtQ29udGFpbmVySWR4KSA9PiB7XG5cdFx0XHRcdGlmIChmb3JtQ29udGFpbmVyLmlzVmlzaWJsZSkge1xuXHRcdFx0XHRcdGNvbnN0IGZhY2V0Q29udGV4dCA9IHRoaXMuY29udGV4dFBhdGguZ2V0TW9kZWwoKS5jcmVhdGVCaW5kaW5nQ29udGV4dChmb3JtQ29udGFpbmVyLmFubm90YXRpb25QYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRcdFx0XHRjb25zdCBmYWNldCA9IGZhY2V0Q29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRmYWNldC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuUmVmZXJlbmNlRmFjZXQgJiZcblx0XHRcdFx0XHRcdEZvcm1IZWxwZXIuaXNSZWZlcmVuY2VGYWNldFBhcnRPZlByZXZpZXcoZmFjZXQsIHRoaXMucGFydE9mUHJldmlldylcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdGlmIChmYWNldC5UYXJnZXQuJEFubm90YXRpb25QYXRoLiRUeXBlID09PSBDb21tdW5pY2F0aW9uQW5ub3RhdGlvblR5cGVzLkFkZHJlc3NUeXBlKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiB4bWxgPHRlbXBsYXRlOndpdGggcGF0aD1cImZvcm1Db250YWluZXJzPiR7Zm9ybUNvbnRhaW5lcklkeH1cIiB2YXI9XCJmb3JtQ29udGFpbmVyXCI+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PHRlbXBsYXRlOndpdGggcGF0aD1cImZvcm1Db250YWluZXJzPiR7Zm9ybUNvbnRhaW5lcklkeH0vYW5ub3RhdGlvblBhdGhcIiB2YXI9XCJmYWNldFwiPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0PGNvcmU6RnJhZ21lbnQgZnJhZ21lbnROYW1lPVwic2FwLmZlLm1hY3Jvcy5mb3JtLkFkZHJlc3NTZWN0aW9uXCIgdHlwZT1cIlhNTFwiIC8+XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0PC90ZW1wbGF0ZTp3aXRoPlxuXHRcdFx0XHRcdFx0XHRcdFx0XHQ8L3RlbXBsYXRlOndpdGg+YDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHJldHVybiB0aGlzLmdldERhdGFGaWVsZENvbGxlY3Rpb24oZm9ybUNvbnRhaW5lciwgZmFjZXRDb250ZXh0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIFwiXCI7XG5cdFx0XHR9KTtcblx0XHR9IGVsc2UgaWYgKHRoaXMuZmFjZXRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlJlZmVyZW5jZUZhY2V0XCIpIHtcblx0XHRcdHJldHVybiB0aGlzLmZvcm1Db250YWluZXJzIS5tYXAoKGZvcm1Db250YWluZXIpID0+IHtcblx0XHRcdFx0aWYgKGZvcm1Db250YWluZXIuaXNWaXNpYmxlKSB7XG5cdFx0XHRcdFx0Y29uc3QgZmFjZXRDb250ZXh0ID0gdGhpcy5jb250ZXh0UGF0aC5nZXRNb2RlbCgpLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGZvcm1Db250YWluZXIuYW5ub3RhdGlvblBhdGgsIHRoaXMuY29udGV4dFBhdGgpO1xuXHRcdFx0XHRcdHJldHVybiB0aGlzLmdldERhdGFGaWVsZENvbGxlY3Rpb24oZm9ybUNvbnRhaW5lciwgZmFjZXRDb250ZXh0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gXCJcIjtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiB4bWxgYDtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIHByb3BlciBsYXlvdXQgaW5mb3JtYXRpb24gYmFzZWQgb24gdGhlIGBsYXlvdXRgIHByb3BlcnR5IGRlZmluZWQgZXh0ZXJuYWxseS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGxheW91dCBpbmZvcm1hdGlvbiBmb3IgdGhlIHhtbC5cblx0ICovXG5cdGdldExheW91dEluZm9ybWF0aW9uKCkge1xuXHRcdHN3aXRjaCAodGhpcy5sYXlvdXQudHlwZSkge1xuXHRcdFx0Y2FzZSBcIlJlc3BvbnNpdmVHcmlkTGF5b3V0XCI6XG5cdFx0XHRcdHJldHVybiB4bWxgPGY6UmVzcG9uc2l2ZUdyaWRMYXlvdXQgYWRqdXN0TGFiZWxTcGFuPVwiJHt0aGlzLmxheW91dC5hZGp1c3RMYWJlbFNwYW59XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWtwb2ludEw9XCIke3RoaXMubGF5b3V0LmJyZWFrcG9pbnRMfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGJyZWFrcG9pbnRNPVwiJHt0aGlzLmxheW91dC5icmVha3BvaW50TX1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRicmVha3BvaW50WEw9XCIke3RoaXMubGF5b3V0LmJyZWFrcG9pbnRYTH1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRjb2x1bW5zTD1cIiR7dGhpcy5sYXlvdXQuY29sdW1uc0x9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Y29sdW1uc009XCIke3RoaXMubGF5b3V0LmNvbHVtbnNNfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbHVtbnNYTD1cIiR7dGhpcy5sYXlvdXQuY29sdW1uc1hMfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGVtcHR5U3Bhbkw9XCIke3RoaXMubGF5b3V0LmVtcHR5U3Bhbkx9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZW1wdHlTcGFuTT1cIiR7dGhpcy5sYXlvdXQuZW1wdHlTcGFuTX1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRlbXB0eVNwYW5TPVwiJHt0aGlzLmxheW91dC5lbXB0eVNwYW5TfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGVtcHR5U3BhblhMPVwiJHt0aGlzLmxheW91dC5lbXB0eVNwYW5YTH1cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsYWJlbFNwYW5MPVwiJHt0aGlzLmxheW91dC5sYWJlbFNwYW5MfVwiXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGxhYmVsU3Bhbk09XCIke3RoaXMubGF5b3V0LmxhYmVsU3Bhbk19XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0bGFiZWxTcGFuUz1cIiR7dGhpcy5sYXlvdXQubGFiZWxTcGFuU31cIlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRsYWJlbFNwYW5YTD1cIiR7dGhpcy5sYXlvdXQubGFiZWxTcGFuWEx9XCJcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0c2luZ2xlQ29udGFpbmVyRnVsbFNpemU9XCIke3RoaXMubGF5b3V0LnNpbmdsZUNvbnRhaW5lckZ1bGxTaXplfVwiIC8+YDtcblx0XHRcdGNhc2UgXCJDb2x1bW5MYXlvdXRcIjpcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiB4bWxgPGY6Q29sdW1uTGF5b3V0XG5cdFx0XHRcdFx0XHRcdFx0Y29sdW1uc009XCIke3RoaXMubGF5b3V0LmNvbHVtbnNNfVwiXG5cdFx0XHRcdFx0XHRcdFx0Y29sdW1uc0w9XCIke3RoaXMubGF5b3V0LmNvbHVtbnNMfVwiXG5cdFx0XHRcdFx0XHRcdFx0Y29sdW1uc1hMPVwiJHt0aGlzLmxheW91dC5jb2x1bW5zWEx9XCJcblx0XHRcdFx0XHRcdFx0XHRsYWJlbENlbGxzTGFyZ2U9XCIke3RoaXMubGF5b3V0LmxhYmVsQ2VsbHNMYXJnZX1cIlxuXHRcdFx0XHRcdFx0XHRcdGVtcHR5Q2VsbHNMYXJnZT1cIiR7dGhpcy5sYXlvdXQuZW1wdHlDZWxsc0xhcmdlfVwiIC8+YDtcblx0XHR9XG5cdH1cblxuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCBvbkNoYW5nZVN0ciA9ICh0aGlzLm9uQ2hhbmdlICYmIHRoaXMub25DaGFuZ2UucmVwbGFjZShcIntcIiwgXCJcXFxce1wiKS5yZXBsYWNlKFwifVwiLCBcIlxcXFx9XCIpKSB8fCBcIlwiO1xuXHRcdGNvbnN0IG1ldGFQYXRoUGF0aCA9IHRoaXMubWV0YVBhdGguZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGNvbnRleHRQYXRoUGF0aCA9IHRoaXMuY29udGV4dFBhdGguZ2V0UGF0aCgpO1xuXHRcdGlmICghdGhpcy5pc1Zpc2libGUpIHtcblx0XHRcdHJldHVybiB4bWxgYDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHhtbGA8bWFjcm86Rm9ybUFQSSB4bWxuczptYWNybz1cInNhcC5mZS5tYWNyb3MuZm9ybVwiXG5cdFx0XHRcdFx0eG1sbnM6bWFjcm9kYXRhPVwiaHR0cDovL3NjaGVtYXMuc2FwLmNvbS9zYXB1aTUvZXh0ZW5zaW9uL3NhcC51aS5jb3JlLkN1c3RvbURhdGEvMVwiXG5cdFx0XHRcdFx0eG1sbnM6Zj1cInNhcC51aS5sYXlvdXQuZm9ybVwiXG5cdFx0XHRcdFx0eG1sbnM6Zmw9XCJzYXAudWkuZmxcIlxuXHRcdFx0XHRcdGlkPVwiJHt0aGlzLl9hcGlJZH1cIlxuXHRcdFx0XHRcdG1ldGFQYXRoPVwiJHttZXRhUGF0aFBhdGh9XCJcblx0XHRcdFx0XHRjb250ZXh0UGF0aD1cIiR7Y29udGV4dFBhdGhQYXRofVwiPlxuXHRcdFx0XHQ8ZjpGb3JtXG5cdFx0XHRcdFx0Zmw6ZGVsZWdhdGU9J3tcblx0XHRcdFx0XHRcdFwibmFtZVwiOiBcInNhcC9mZS9tYWNyb3MvZm9ybS9Gb3JtRGVsZWdhdGVcIixcblx0XHRcdFx0XHRcdFwiZGVsZWdhdGVUeXBlXCI6IFwiY29tcGxldGVcIlxuXHRcdFx0XHRcdH0nXG5cdFx0XHRcdFx0aWQ9XCIke3RoaXMuX2NvbnRlbnRJZH1cIlxuXHRcdFx0XHRcdGVkaXRhYmxlPVwiJHt0aGlzLl9lZGl0YWJsZX1cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTplbnRpdHlTZXQ9XCJ7Y29udGV4dFBhdGg+QHNhcHVpLm5hbWV9XCJcblx0XHRcdFx0XHR2aXNpYmxlPVwiJHt0aGlzLmlzVmlzaWJsZX1cIlxuXHRcdFx0XHRcdGNsYXNzPVwic2FwVXhBUE9iamVjdFBhZ2VTdWJTZWN0aW9uQWxpZ25Db250ZW50XCJcblx0XHRcdFx0XHRtYWNyb2RhdGE6bmF2aWdhdGlvblBhdGg9XCIke2NvbnRleHRQYXRoUGF0aH1cIlxuXHRcdFx0XHRcdG1hY3JvZGF0YTpvbkNoYW5nZT1cIiR7b25DaGFuZ2VTdHJ9XCJcblx0XHRcdFx0PlxuXHRcdFx0XHRcdCR7dGhpcy5hZGRDb25kaXRpb25hbGx5KFxuXHRcdFx0XHRcdFx0dGhpcy50aXRsZSAhPT0gdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0eG1sYDxmOnRpdGxlPlxuXHRcdFx0XHRcdFx0XHQ8Y29yZTpUaXRsZSBsZXZlbD1cIiR7dGhpcy50aXRsZUxldmVsfVwiIHRleHQ9XCIke3RoaXMudGl0bGV9XCIgLz5cblx0XHRcdFx0XHRcdDwvZjp0aXRsZT5gXG5cdFx0XHRcdFx0KX1cblx0XHRcdFx0XHQ8ZjpsYXlvdXQ+XG5cdFx0XHRcdFx0JHt0aGlzLmdldExheW91dEluZm9ybWF0aW9uKCl9XG5cblx0XHRcdFx0XHQ8L2Y6bGF5b3V0PlxuXHRcdFx0XHRcdDxmOmZvcm1Db250YWluZXJzPlxuXHRcdFx0XHRcdFx0JHt0aGlzLmdldEZvcm1Db250YWluZXJzKCl9XG5cdFx0XHRcdFx0PC9mOmZvcm1Db250YWluZXJzPlxuXHRcdFx0XHQ8L2Y6Rm9ybT5cblx0XHRcdDwvbWFjcm86Rm9ybUFQST5gO1xuXHRcdH1cblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0VBNkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBWkEsSUFrQnFCQSxpQkFBaUIsV0FMckNDLG1CQUFtQixDQUFDO0lBQ3BCQyxJQUFJLEVBQUUsTUFBTTtJQUNaQyxTQUFTLEVBQUUsd0JBQXdCO0lBQ25DQyxlQUFlLEVBQUU7RUFDbEIs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O0lBQ0QsQ0FBQztJQUFBO0VBQUEsRUF2UzZDaUMsaUJBQWlCO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0EyRDVDLEVBQUU7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FXVztRQUFFdEgsSUFBSSxFQUFFLGNBQWM7UUFBRW9HLFFBQVEsRUFBRSxDQUFDO1FBQUVDLFNBQVMsRUFBRSxDQUFDO1FBQUVGLFFBQVEsRUFBRSxDQUFDO1FBQUVZLGVBQWUsRUFBRTtNQUFHLENBQUM7SUFBQTtFQUFBO0VBQUE7RUFBQTtBQUFBIn0=