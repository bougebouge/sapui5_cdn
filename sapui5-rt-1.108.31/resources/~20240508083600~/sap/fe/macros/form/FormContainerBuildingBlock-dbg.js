/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/converters/controls/Common/Form", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/templating/DataModelPathHelper"], function (BuildingBlock, Form, MetaModelConverter, DataModelPathHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
  var _exports = {};
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var createFormDefinition = Form.createFormDefinition;
  var xmlEvent = BuildingBlock.xmlEvent;
  var xmlAttribute = BuildingBlock.xmlAttribute;
  var xmlAggregation = BuildingBlock.xmlAggregation;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * @classdesc
   * Building block for creating a FormContainer based on the provided OData V4 metadata.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:FormContainer
   *   id="SomeId"
   *   entitySet="{entitySet>}"
   *   dataFieldCollection ="{dataFieldCollection>}"
   *   title="someTitle"
   *   navigationPath="{ToSupplier}"
   *   visible=true
   *   onChange=".handlers.onFieldValueChange"
   * /&gt;
   * </pre>
   * @class sap.fe.macros.FormContainer
   * @hideconstructor
   * @private
   * @experimental
   */
  var FormContainerBuildingBlock = (_dec = defineBuildingBlock({
    name: "FormContainer",
    namespace: "sap.fe.macros",
    fragment: "sap.fe.macros.form.FormContainer"
  }), _dec2 = xmlAttribute({
    type: "string"
  }), _dec3 = xmlAttribute({
    type: "sap.ui.model.Context",
    required: true,
    isPublic: true,
    $kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
  }), _dec4 = xmlAttribute({
    type: "sap.ui.model.Context"
  }), _dec5 = xmlAttribute({
    type: "sap.ui.model.Context",
    isPublic: true,
    required: true
  }), _dec6 = xmlAttribute({
    type: "sap.ui.model.Context"
  }), _dec7 = xmlAttribute({
    type: "boolean"
  }), _dec8 = xmlAttribute({
    type: "string"
  }), _dec9 = xmlAttribute({
    type: "sap.ui.core.TitleLevel",
    isPublic: true,
    defaultValue: "Auto"
  }), _dec10 = xmlAttribute({
    type: "string"
  }), _dec11 = xmlAttribute({
    type: "string"
  }), _dec12 = xmlAttribute({
    type: "string",
    defaultValue: "sap/fe/macros/form/FormContainer.designtime"
  }), _dec13 = xmlAttribute({
    type: "sap.ui.model.Context"
  }), _dec14 = xmlAggregation({
    type: "sap.fe.macros.form.FormElement"
  }), _dec15 = xmlEvent(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(FormContainerBuildingBlock, _BuildingBlockBase);
    /**
     * Metadata path to the dataFieldCollection
     */

    /**
     * Control whether the form is in displayMode or not
     */

    /**
     * Title of the form container
     */

    /**
     * Defines the "aria-level" of the form title, titles of internally used form containers are nested subsequently
     */

    /**
     * Binding the form container using a navigation path
     */

    /**
     * Binding the visibility of the form container using an expression binding or Boolean
     */

    /**
     * Flex designtime settings to be applied
     */

    // Just proxied down to the Field may need to see if needed or not

    function FormContainerBuildingBlock(oProps, externalConfiguration, mSettings) {
      var _this;
      _this = _BuildingBlockBase.call(this, oProps) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "entitySet", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataFieldCollection", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "displayMode", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "title", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "titleLevel", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "navigationPath", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "designtimeSettings", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "actions", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formElements", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "onChange", _descriptor14, _assertThisInitialized(_this));
      _this.entitySet = oProps.contextPath;
      if (_this.formElements && Object.keys(_this.formElements).length > 0) {
        var oContextObjectPath = getInvolvedDataModelObjects(_this.metaPath, _this.contextPath);
        var mExtraSettings = {};
        var oFacetDefinition = oContextObjectPath.targetObject;
        // Wrap the facet in a fake Facet annotation
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
        var oConverterContext = _this.getConverterContext(oContextObjectPath, _this.contextPath, mSettings, mExtraSettings);
        var oFormDefinition = createFormDefinition(oFacetDefinition, "true", oConverterContext);
        _this.dataFieldCollection = oFormDefinition.formContainers[0].formElements;
      }
      return _this;
    }
    _exports = FormContainerBuildingBlock;
    return FormContainerBuildingBlock;
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
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "dataFieldCollection", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "displayMode", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return false;
    }
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
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "navigationPath", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "designtimeSettings", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "actions", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "formElements", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {};
    }
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "onChange", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = FormContainerBuildingBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGb3JtQ29udGFpbmVyQnVpbGRpbmdCbG9jayIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJ4bWxBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJpc1B1YmxpYyIsIiRraW5kIiwiZGVmYXVsdFZhbHVlIiwieG1sQWdncmVnYXRpb24iLCJ4bWxFdmVudCIsIm9Qcm9wcyIsImV4dGVybmFsQ29uZmlndXJhdGlvbiIsIm1TZXR0aW5ncyIsImVudGl0eVNldCIsImNvbnRleHRQYXRoIiwiZm9ybUVsZW1lbnRzIiwiT2JqZWN0Iiwia2V5cyIsImxlbmd0aCIsIm9Db250ZXh0T2JqZWN0UGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIm1ldGFQYXRoIiwibUV4dHJhU2V0dGluZ3MiLCJvRmFjZXREZWZpbml0aW9uIiwidGFyZ2V0T2JqZWN0IiwiJFR5cGUiLCJMYWJlbCIsIlRhcmdldCIsIiR0YXJnZXQiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJwYXRoIiwidGVybSIsInZhbHVlIiwiZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCIsImFubm90YXRpb25zIiwiZmllbGRzIiwib0NvbnZlcnRlckNvbnRleHQiLCJnZXRDb252ZXJ0ZXJDb250ZXh0Iiwib0Zvcm1EZWZpbml0aW9uIiwiY3JlYXRlRm9ybURlZmluaXRpb24iLCJkYXRhRmllbGRDb2xsZWN0aW9uIiwiZm9ybUNvbnRhaW5lcnMiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRm9ybUNvbnRhaW5lckJ1aWxkaW5nQmxvY2sudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQnVpbGRpbmdCbG9ja0Jhc2UsIGRlZmluZUJ1aWxkaW5nQmxvY2ssIHhtbEFnZ3JlZ2F0aW9uLCB4bWxBdHRyaWJ1dGUsIHhtbEV2ZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tcIjtcbmltcG9ydCB7IGNyZWF0ZUZvcm1EZWZpbml0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvQ29tbW9uL0Zvcm1cIjtcbmltcG9ydCB7IENvbmZpZ3VyYWJsZU9iamVjdCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IFY0Q29udGV4dCB9IGZyb20gXCIuLi8uLi8uLi8uLi8uLi8uLi8uLi90eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxuLyoqXG4gKiBAY2xhc3NkZXNjXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBGb3JtQ29udGFpbmVyIGJhc2VkIG9uIHRoZSBwcm92aWRlZCBPRGF0YSBWNCBtZXRhZGF0YS5cbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86Rm9ybUNvbnRhaW5lclxuICogICBpZD1cIlNvbWVJZFwiXG4gKiAgIGVudGl0eVNldD1cIntlbnRpdHlTZXQ+fVwiXG4gKiAgIGRhdGFGaWVsZENvbGxlY3Rpb24gPVwie2RhdGFGaWVsZENvbGxlY3Rpb24+fVwiXG4gKiAgIHRpdGxlPVwic29tZVRpdGxlXCJcbiAqICAgbmF2aWdhdGlvblBhdGg9XCJ7VG9TdXBwbGllcn1cIlxuICogICB2aXNpYmxlPXRydWVcbiAqICAgb25DaGFuZ2U9XCIuaGFuZGxlcnMub25GaWVsZFZhbHVlQ2hhbmdlXCJcbiAqIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqIEBjbGFzcyBzYXAuZmUubWFjcm9zLkZvcm1Db250YWluZXJcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHsgbmFtZTogXCJGb3JtQ29udGFpbmVyXCIsIG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCIsIGZyYWdtZW50OiBcInNhcC5mZS5tYWNyb3MuZm9ybS5Gb3JtQ29udGFpbmVyXCIgfSlcbmV4cG9ydCBkZWZhdWx0IGNsYXNzIEZvcm1Db250YWluZXJCdWlsZGluZ0Jsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHRAeG1sQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRpZCE6IHN0cmluZztcblxuXHRAeG1sQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0aXNQdWJsaWM6IHRydWUsXG5cdFx0JGtpbmQ6IFtcIkVudGl0eVNldFwiLCBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIl1cblx0fSlcblx0Y29udGV4dFBhdGghOiBWNENvbnRleHQ7XG5cdEB4bWxBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIlxuXHR9KVxuXHRlbnRpdHlTZXQhOiBWNENvbnRleHQ7XG5cblx0QHhtbEF0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdHJlcXVpcmVkOiB0cnVlXG5cdH0pXG5cdG1ldGFQYXRoITogVjRDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBkYXRhRmllbGRDb2xsZWN0aW9uXG5cdCAqL1xuXHRAeG1sQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCJcblx0fSlcblx0ZGF0YUZpZWxkQ29sbGVjdGlvbj86IGFueTtcblxuXHQvKipcblx0ICogQ29udHJvbCB3aGV0aGVyIHRoZSBmb3JtIGlzIGluIGRpc3BsYXlNb2RlIG9yIG5vdFxuXHQgKi9cblx0QHhtbEF0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCJcblx0fSlcblx0ZGlzcGxheU1vZGU6IGJvb2xlYW4gPSBmYWxzZTtcblx0LyoqXG5cdCAqIFRpdGxlIG9mIHRoZSBmb3JtIGNvbnRhaW5lclxuXHQgKi9cblx0QHhtbEF0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0dGl0bGU/OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBcImFyaWEtbGV2ZWxcIiBvZiB0aGUgZm9ybSB0aXRsZSwgdGl0bGVzIG9mIGludGVybmFsbHkgdXNlZCBmb3JtIGNvbnRhaW5lcnMgYXJlIG5lc3RlZCBzdWJzZXF1ZW50bHlcblx0ICovXG5cdEB4bWxBdHRyaWJ1dGUoeyB0eXBlOiBcInNhcC51aS5jb3JlLlRpdGxlTGV2ZWxcIiwgaXNQdWJsaWM6IHRydWUsIGRlZmF1bHRWYWx1ZTogXCJBdXRvXCIgfSlcblx0dGl0bGVMZXZlbD86IHN0cmluZztcblxuXHQvKipcblx0ICogQmluZGluZyB0aGUgZm9ybSBjb250YWluZXIgdXNpbmcgYSBuYXZpZ2F0aW9uIHBhdGhcblx0ICovXG5cdEB4bWxBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdG5hdmlnYXRpb25QYXRoPzogc3RyaW5nO1xuXHQvKipcblx0ICogQmluZGluZyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgZm9ybSBjb250YWluZXIgdXNpbmcgYW4gZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW5cblx0ICovXG5cdEB4bWxBdHRyaWJ1dGUoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHZpc2libGU/OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBGbGV4IGRlc2lnbnRpbWUgc2V0dGluZ3MgdG8gYmUgYXBwbGllZFxuXHQgKi9cblx0QHhtbEF0dHJpYnV0ZSh7IHR5cGU6IFwic3RyaW5nXCIsIGRlZmF1bHRWYWx1ZTogXCJzYXAvZmUvbWFjcm9zL2Zvcm0vRm9ybUNvbnRhaW5lci5kZXNpZ250aW1lXCIgfSlcblx0ZGVzaWdudGltZVNldHRpbmdzITogc3RyaW5nO1xuXHRAeG1sQXR0cmlidXRlKHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiIH0pXG5cdGFjdGlvbnMhOiBhbnlbXTtcblxuXHRAeG1sQWdncmVnYXRpb24oeyB0eXBlOiBcInNhcC5mZS5tYWNyb3MuZm9ybS5Gb3JtRWxlbWVudFwiIH0pXG5cdGZvcm1FbGVtZW50czogUmVjb3JkPHN0cmluZywgQ29uZmlndXJhYmxlT2JqZWN0PiA9IHt9O1xuXG5cdC8vIEp1c3QgcHJveGllZCBkb3duIHRvIHRoZSBGaWVsZCBtYXkgbmVlZCB0byBzZWUgaWYgbmVlZGVkIG9yIG5vdFxuXHRAeG1sRXZlbnQoKVxuXHRvbkNoYW5nZSE6IEZ1bmN0aW9uO1xuXG5cdGRlZmluaXRpb246IGFueTtcblx0Y29uc3RydWN0b3Iob1Byb3BzOiBQcm9wZXJ0aWVzT2Y8Rm9ybUNvbnRhaW5lckJ1aWxkaW5nQmxvY2s+LCBleHRlcm5hbENvbmZpZ3VyYXRpb246IGFueSwgbVNldHRpbmdzOiBhbnkpIHtcblx0XHRzdXBlcihvUHJvcHMpO1xuXHRcdHRoaXMuZW50aXR5U2V0ID0gb1Byb3BzLmNvbnRleHRQYXRoITtcblx0XHRpZiAodGhpcy5mb3JtRWxlbWVudHMgJiYgT2JqZWN0LmtleXModGhpcy5mb3JtRWxlbWVudHMpLmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IG9Db250ZXh0T2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyh0aGlzLm1ldGFQYXRoLCB0aGlzLmNvbnRleHRQYXRoKTtcblx0XHRcdGNvbnN0IG1FeHRyYVNldHRpbmdzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cdFx0XHRsZXQgb0ZhY2V0RGVmaW5pdGlvbiA9IG9Db250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3Q7XG5cdFx0XHQvLyBXcmFwIHRoZSBmYWNldCBpbiBhIGZha2UgRmFjZXQgYW5ub3RhdGlvblxuXHRcdFx0b0ZhY2V0RGVmaW5pdGlvbiA9IHtcblx0XHRcdFx0JFR5cGU6IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVmZXJlbmNlRmFjZXRcIixcblx0XHRcdFx0TGFiZWw6IG9GYWNldERlZmluaXRpb24uTGFiZWwsXG5cdFx0XHRcdFRhcmdldDoge1xuXHRcdFx0XHRcdCR0YXJnZXQ6IG9GYWNldERlZmluaXRpb24sXG5cdFx0XHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBvRmFjZXREZWZpbml0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSxcblx0XHRcdFx0XHRwYXRoOiBcIlwiLFxuXHRcdFx0XHRcdHRlcm06IFwiXCIsXG5cdFx0XHRcdFx0dHlwZTogXCJBbm5vdGF0aW9uUGF0aFwiLFxuXHRcdFx0XHRcdHZhbHVlOiBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKG9Db250ZXh0T2JqZWN0UGF0aClcblx0XHRcdFx0fSxcblx0XHRcdFx0YW5ub3RhdGlvbnM6IHt9LFxuXHRcdFx0XHRmdWxseVF1YWxpZmllZE5hbWU6IG9GYWNldERlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lXG5cdFx0XHR9O1xuXHRcdFx0bUV4dHJhU2V0dGluZ3Nbb0ZhY2V0RGVmaW5pdGlvbi5UYXJnZXQudmFsdWVdID0geyBmaWVsZHM6IHRoaXMuZm9ybUVsZW1lbnRzIH07XG5cdFx0XHRjb25zdCBvQ29udmVydGVyQ29udGV4dCA9IHRoaXMuZ2V0Q29udmVydGVyQ29udGV4dChvQ29udGV4dE9iamVjdFBhdGgsIHRoaXMuY29udGV4dFBhdGgsIG1TZXR0aW5ncywgbUV4dHJhU2V0dGluZ3MpO1xuXHRcdFx0Y29uc3Qgb0Zvcm1EZWZpbml0aW9uID0gY3JlYXRlRm9ybURlZmluaXRpb24ob0ZhY2V0RGVmaW5pdGlvbiwgXCJ0cnVlXCIsIG9Db252ZXJ0ZXJDb250ZXh0KTtcblxuXHRcdFx0dGhpcy5kYXRhRmllbGRDb2xsZWN0aW9uID0gb0Zvcm1EZWZpbml0aW9uLmZvcm1Db250YWluZXJzWzBdLmZvcm1FbGVtZW50cztcblx0XHR9XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQXJCQSxJQXVCcUJBLDBCQUEwQixXQUQ5Q0MsbUJBQW1CLENBQUM7SUFBRUMsSUFBSSxFQUFFLGVBQWU7SUFBRUMsU0FBUyxFQUFFLGVBQWU7SUFBRUMsUUFBUSxFQUFFO0VBQW1DLENBQUMsQ0FBQyxVQUV2SEMsWUFBWSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUFTLENBQUMsQ0FBQyxVQUdoQ0QsWUFBWSxDQUFDO0lBQ2JDLElBQUksRUFBRSxzQkFBc0I7SUFDNUJDLFFBQVEsRUFBRSxJQUFJO0lBQ2RDLFFBQVEsRUFBRSxJQUFJO0lBQ2RDLEtBQUssRUFBRSxDQUFDLFdBQVcsRUFBRSxvQkFBb0IsRUFBRSxZQUFZLEVBQUUsV0FBVztFQUNyRSxDQUFDLENBQUMsVUFFREosWUFBWSxDQUFDO0lBQ2JDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxVQUdERCxZQUFZLENBQUM7SUFDYkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkUsUUFBUSxFQUFFLElBQUk7SUFDZEQsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDLFVBTURGLFlBQVksQ0FBQztJQUNiQyxJQUFJLEVBQUU7RUFDUCxDQUFDLENBQUMsVUFNREQsWUFBWSxDQUFDO0lBQ2JDLElBQUksRUFBRTtFQUNQLENBQUMsQ0FBQyxVQUtERCxZQUFZLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBS2hDRCxZQUFZLENBQUM7SUFBRUMsSUFBSSxFQUFFLHdCQUF3QjtJQUFFRSxRQUFRLEVBQUUsSUFBSTtJQUFFRSxZQUFZLEVBQUU7RUFBTyxDQUFDLENBQUMsV0FNdEZMLFlBQVksQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsV0FLaENELFlBQVksQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsV0FLaENELFlBQVksQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFSSxZQUFZLEVBQUU7RUFBOEMsQ0FBQyxDQUFDLFdBRTdGTCxZQUFZLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQXVCLENBQUMsQ0FBQyxXQUc5Q0ssY0FBYyxDQUFDO0lBQUVMLElBQUksRUFBRTtFQUFpQyxDQUFDLENBQUMsV0FJMURNLFFBQVEsRUFBRTtJQUFBO0lBaERYO0FBQ0Q7QUFDQTs7SUFNQztBQUNEO0FBQ0E7O0lBS0M7QUFDRDtBQUNBOztJQUdDO0FBQ0Q7QUFDQTs7SUFJQztBQUNEO0FBQ0E7O0lBR0M7QUFDRDtBQUNBOztJQUdDO0FBQ0Q7QUFDQTs7SUFTQzs7SUFLQSxvQ0FBWUMsTUFBZ0QsRUFBRUMscUJBQTBCLEVBQUVDLFNBQWMsRUFBRTtNQUFBO01BQ3pHLHNDQUFNRixNQUFNLENBQUM7TUFBQztNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQ2QsTUFBS0csU0FBUyxHQUFHSCxNQUFNLENBQUNJLFdBQVk7TUFDcEMsSUFBSSxNQUFLQyxZQUFZLElBQUlDLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDLE1BQUtGLFlBQVksQ0FBQyxDQUFDRyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ25FLElBQU1DLGtCQUFrQixHQUFHQywyQkFBMkIsQ0FBQyxNQUFLQyxRQUFRLEVBQUUsTUFBS1AsV0FBVyxDQUFDO1FBQ3ZGLElBQU1RLGNBQW1DLEdBQUcsQ0FBQyxDQUFDO1FBQzlDLElBQUlDLGdCQUFnQixHQUFHSixrQkFBa0IsQ0FBQ0ssWUFBWTtRQUN0RDtRQUNBRCxnQkFBZ0IsR0FBRztVQUNsQkUsS0FBSyxFQUFFLDJDQUEyQztVQUNsREMsS0FBSyxFQUFFSCxnQkFBZ0IsQ0FBQ0csS0FBSztVQUM3QkMsTUFBTSxFQUFFO1lBQ1BDLE9BQU8sRUFBRUwsZ0JBQWdCO1lBQ3pCTSxrQkFBa0IsRUFBRU4sZ0JBQWdCLENBQUNNLGtCQUFrQjtZQUN2REMsSUFBSSxFQUFFLEVBQUU7WUFDUkMsSUFBSSxFQUFFLEVBQUU7WUFDUjVCLElBQUksRUFBRSxnQkFBZ0I7WUFDdEI2QixLQUFLLEVBQUVDLGtDQUFrQyxDQUFDZCxrQkFBa0I7VUFDN0QsQ0FBQztVQUNEZSxXQUFXLEVBQUUsQ0FBQyxDQUFDO1VBQ2ZMLGtCQUFrQixFQUFFTixnQkFBZ0IsQ0FBQ007UUFDdEMsQ0FBQztRQUNEUCxjQUFjLENBQUNDLGdCQUFnQixDQUFDSSxNQUFNLENBQUNLLEtBQUssQ0FBQyxHQUFHO1VBQUVHLE1BQU0sRUFBRSxNQUFLcEI7UUFBYSxDQUFDO1FBQzdFLElBQU1xQixpQkFBaUIsR0FBRyxNQUFLQyxtQkFBbUIsQ0FBQ2xCLGtCQUFrQixFQUFFLE1BQUtMLFdBQVcsRUFBRUYsU0FBUyxFQUFFVSxjQUFjLENBQUM7UUFDbkgsSUFBTWdCLGVBQWUsR0FBR0Msb0JBQW9CLENBQUNoQixnQkFBZ0IsRUFBRSxNQUFNLEVBQUVhLGlCQUFpQixDQUFDO1FBRXpGLE1BQUtJLG1CQUFtQixHQUFHRixlQUFlLENBQUNHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQzFCLFlBQVk7TUFDMUU7TUFBQztJQUNGO0lBQUM7SUFBQTtFQUFBLEVBdkdzRDJCLGlCQUFpQjtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQXFDakQsS0FBSztJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtNQUFBLE9BK0J1QixDQUFDLENBQUM7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9