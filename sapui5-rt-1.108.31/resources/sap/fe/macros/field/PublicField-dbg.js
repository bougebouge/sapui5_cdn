/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/field/FieldHelper"], function (BuildingBlock, BuildingBlockRuntime, BindingToolkit, FieldHelper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _templateObject, _templateObject2, _templateObject3;
  var _exports = {};
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var ifElse = BindingToolkit.ifElse;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var xml = BuildingBlockRuntime.xml;
  var xmlEvent = BuildingBlock.xmlEvent;
  var xmlAttribute = BuildingBlock.xmlAttribute;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var Field = (_dec = defineBuildingBlock({
    name: "Field",
    namespace: "sap.fe.macros"
  }), _dec2 = xmlAttribute({
    type: "string",
    isPublic: true,
    required: true
  }), _dec3 = xmlAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec4 = xmlAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec5 = xmlAttribute({
    type: "boolean",
    required: false
  }), _dec6 = xmlAttribute({
    type: "string",
    required: false
  }), _dec7 = xmlAttribute({
    type: "string",
    required: false
  }), _dec8 = xmlAttribute({
    type: "object"
  }), _dec9 = xmlEvent(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(Field, _BuildingBlockBase);
    function Field(oProps) {
      var _this;
      if (oProps.readOnly !== undefined) {
        oProps.editModeExpression = compileExpression(ifElse(equal(resolveBindingString(oProps.readOnly, "boolean"), true), "Display", "Editable"));
      } else {
        oProps.editModeExpression = undefined;
      }
      _this = _BuildingBlockBase.call(this, oProps) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObject", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editModeExpression", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "change", _descriptor8, _assertThisInitialized(_this));
      return _this;
    }

    /**
     * The 'id' property
     */
    _exports = Field;
    var _proto = Field.prototype;
    /**
     * Sets the internal formatOptions for the building block.
     *
     * @returns A string with the internal formatOptions for the building block
     */
    _proto.getFormatOptions = function getFormatOptions() {
      return xml(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n\t\t<internalMacro:formatOptions\n\t\t\ttextAlignMode=\"Form\"\n\t\t\tshowEmptyIndicator=\"true\"\n\t\t\tdisplayMode=\"", "\"\n\t\t\tmeasureDisplayMode=\"", "\"\n\t\t\ttextLinesEdit=\"", "\"\n\t\t\ttextMaxLines=\"", "\"\n\t\t\ttextMaxCharactersDisplay=\"", "\"\n\t\t\ttextExpandBehaviorDisplay=\"", "\"\n\t\t/>"])), this.formatOptions.displayMode, this.formatOptions.measureDisplayMode, this.formatOptions.textLinesEdit, this.formatOptions.textMaxLines, this.formatOptions.textMaxCharactersDisplay, this.formatOptions.textExpandBehaviorDisplay);
    }

    /**
     * The function calculates the corresponding ValueHelp field in case it´s
     * defined for the specific control.
     *
     * @returns An XML-based string with a possible ValueHelp control.
     */;
    _proto.getPossibleValueHelpTemplate = function getPossibleValueHelpTemplate() {
      var vhp = FieldHelper.valueHelpProperty(this.metaPath);
      var vhpCtx = this.metaPath.getModel().createBindingContext(vhp, this.metaPath);
      var hasValueHelpAnnotations = FieldHelper.hasValueHelpAnnotation(vhpCtx.getObject("@"));
      if (hasValueHelpAnnotations) {
        //depending whether this one has a value help annotation included, add the dependent
        return xml(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["\n\t\t\t<internalMacro:dependents>\n\t\t\t\t<macros:ValueHelp _flexId=\"", "-content_FieldValueHelp\" property=\"", "\" />\n\t\t\t</internalMacro:dependents>"])), this.id, vhpCtx);
      }
      return "";
    }

    /**
     * The building block template function.
     *
     * @returns An XML-based string with the definition of the field control
     */;
    _proto.getTemplate = function getTemplate() {
      var contextPathPath = this.contextPath.getPath();
      var metaPathPath = this.metaPath.getPath();
      return xml(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["\t\n\t\t<internalMacro:Field\n\t\t\txmlns:internalMacro=\"sap.fe.macros.internal\"\n\t\t\tentitySet=\"", "\"\n\t\t\tdataField=\"", "\"\n\t\t\teditMode=\"", "\"\n\t\t\tonChange=\"", "\"\n\t\t\t_flexId=\"", "\"\n\t\t\tsemanticObject=\"", "\"\n\t\t>\n\t\t\t", "\n\t\t\t", "\n\t\t</internalMacro:Field>"])), contextPathPath, metaPathPath, this.editModeExpression, this.change, this.id, this.semanticObject, this.getFormatOptions(), this.getPossibleValueHelpTemplate());
    };
    return Field;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "contextPath", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "semanticObject", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "editModeExpression", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return {
        properties: {
          displayMode: {
            type: "string",
            allowedValues: ["Value", "Description", "ValueDescription", "DescriptionValue"]
          },
          measureDisplayMode: {
            type: "string",
            allowedValues: ["Hidden", "ReadOnly"]
          },
          textLinesEdit: {
            type: "number",
            configurable: true
          },
          textMaxLines: {
            type: "number",
            configurable: true
          },
          textMaxCharactersDisplay: {
            type: "number",
            configurable: true
          },
          textExpandBehaviorDisplay: {
            type: "string",
            allowedValues: ["InPlace", "Popover"]
          }
        }
      };
    }
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "change", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return "";
    }
  })), _class2)) || _class);
  _exports = Field;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWVsZCIsImRlZmluZUJ1aWxkaW5nQmxvY2siLCJuYW1lIiwibmFtZXNwYWNlIiwieG1sQXR0cmlidXRlIiwidHlwZSIsImlzUHVibGljIiwicmVxdWlyZWQiLCJ4bWxFdmVudCIsIm9Qcm9wcyIsInJlYWRPbmx5IiwidW5kZWZpbmVkIiwiZWRpdE1vZGVFeHByZXNzaW9uIiwiY29tcGlsZUV4cHJlc3Npb24iLCJpZkVsc2UiLCJlcXVhbCIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiZ2V0Rm9ybWF0T3B0aW9ucyIsInhtbCIsImZvcm1hdE9wdGlvbnMiLCJkaXNwbGF5TW9kZSIsIm1lYXN1cmVEaXNwbGF5TW9kZSIsInRleHRMaW5lc0VkaXQiLCJ0ZXh0TWF4TGluZXMiLCJ0ZXh0TWF4Q2hhcmFjdGVyc0Rpc3BsYXkiLCJ0ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5IiwiZ2V0UG9zc2libGVWYWx1ZUhlbHBUZW1wbGF0ZSIsInZocCIsIkZpZWxkSGVscGVyIiwidmFsdWVIZWxwUHJvcGVydHkiLCJtZXRhUGF0aCIsInZocEN0eCIsImdldE1vZGVsIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJoYXNWYWx1ZUhlbHBBbm5vdGF0aW9ucyIsImhhc1ZhbHVlSGVscEFubm90YXRpb24iLCJnZXRPYmplY3QiLCJpZCIsImdldFRlbXBsYXRlIiwiY29udGV4dFBhdGhQYXRoIiwiY29udGV4dFBhdGgiLCJnZXRQYXRoIiwibWV0YVBhdGhQYXRoIiwiY2hhbmdlIiwic2VtYW50aWNPYmplY3QiLCJCdWlsZGluZ0Jsb2NrQmFzZSIsInByb3BlcnRpZXMiLCJhbGxvd2VkVmFsdWVzIiwiY29uZmlndXJhYmxlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQdWJsaWNGaWVsZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBCdWlsZGluZ0Jsb2NrQmFzZSwgZGVmaW5lQnVpbGRpbmdCbG9jaywgeG1sQXR0cmlidXRlLCB4bWxFdmVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBlcXVhbCwgaWZFbHNlLCByZXNvbHZlQmluZGluZ1N0cmluZyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSB7IFByb3BlcnRpZXNPZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IEZpZWxkSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxuQGRlZmluZUJ1aWxkaW5nQmxvY2soe1xuXHRuYW1lOiBcIkZpZWxkXCIsXG5cdG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zXCJcbn0pXG4vKipcbiAqIFB1YmxpYyBleHRlcm5hbCBmaWVsZCByZXByZXNlbnRhdGlvblxuICovXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBGaWVsZCBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0Y29uc3RydWN0b3Iob1Byb3BzOiBQcm9wZXJ0aWVzT2Y8RmllbGQ+KSB7XG5cdFx0aWYgKG9Qcm9wcy5yZWFkT25seSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRvUHJvcHMuZWRpdE1vZGVFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdGlmRWxzZShlcXVhbChyZXNvbHZlQmluZGluZ1N0cmluZyhvUHJvcHMucmVhZE9ubHksIFwiYm9vbGVhblwiKSwgdHJ1ZSksIFwiRGlzcGxheVwiLCBcIkVkaXRhYmxlXCIpXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUHJvcHMuZWRpdE1vZGVFeHByZXNzaW9uID0gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRzdXBlcihvUHJvcHMpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSAnaWQnIHByb3BlcnR5XG5cdCAqL1xuXHRAeG1sQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgaXNQdWJsaWM6IHRydWUsIHJlcXVpcmVkOiB0cnVlIH0pXG5cdHB1YmxpYyBpZCE6IHN0cmluZztcblxuXHQvKipcblx0ICogVGhlIG1ldGEgcGF0aCBwcm92aWRlZCBmb3IgdGhlIGZpZWxkXG5cdCAqL1xuXHRAeG1sQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0cmVxdWlyZWQ6IHRydWVcblx0fSlcblx0cHVibGljIG1ldGFQYXRoITogVjRDb250ZXh0O1xuXG5cdC8qKlxuXHQgKiBUaGUgY29udGV4dCBwYXRoIHByb3ZpZGVkIGZvciB0aGUgZmllbGRcblx0ICovXG5cdEB4bWxBdHRyaWJ1dGUoe1xuXHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRyZXF1aXJlZDogdHJ1ZVxuXHR9KVxuXHRwdWJsaWMgY29udGV4dFBhdGghOiBWNENvbnRleHQ7XG5cblx0LyoqXG5cdCAqIFRoZSByZWFkT25seSBmbGFnXG5cdCAqL1xuXHRAeG1sQXR0cmlidXRlKHsgdHlwZTogXCJib29sZWFuXCIsIHJlcXVpcmVkOiBmYWxzZSB9KVxuXHRwdWJsaWMgcmVhZE9ubHkhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBUaGUgc2VtYW50aWMgb2JqZWN0IGFzc29jaWF0ZWQgdG8gdGhlIGZpZWxkXG5cdCAqL1xuXHRAeG1sQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiBmYWxzZVxuXHR9KVxuXHRwdWJsaWMgc2VtYW50aWNPYmplY3QhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFRoZSBlZGl0IG1vZGUgZXhwcmVzc2lvbiBmb3IgdGhlIGZpZWxkXG5cdCAqL1xuXHRAeG1sQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiBmYWxzZVxuXHR9KVxuXHRwdWJsaWMgZWRpdE1vZGVFeHByZXNzaW9uITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBUaGUgb2JqZWN0IHdpdGggdGhlIGZvcm1hdHRpbmcgb3B0aW9uc1xuXHQgKi9cblx0QHhtbEF0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJvYmplY3RcIlxuXHR9KVxuXHRwdWJsaWMgZm9ybWF0T3B0aW9uczogYW55ID0ge1xuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdGRpc3BsYXlNb2RlOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGFsbG93ZWRWYWx1ZXM6IFtcIlZhbHVlXCIsIFwiRGVzY3JpcHRpb25cIiwgXCJWYWx1ZURlc2NyaXB0aW9uXCIsIFwiRGVzY3JpcHRpb25WYWx1ZVwiXVxuXHRcdFx0fSxcblx0XHRcdG1lYXN1cmVEaXNwbGF5TW9kZToge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRhbGxvd2VkVmFsdWVzOiBbXCJIaWRkZW5cIiwgXCJSZWFkT25seVwiXVxuXHRcdFx0fSxcblx0XHRcdHRleHRMaW5lc0VkaXQ6IHtcblx0XHRcdFx0dHlwZTogXCJudW1iZXJcIixcblx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0dGV4dE1heExpbmVzOiB7XG5cdFx0XHRcdHR5cGU6IFwibnVtYmVyXCIsXG5cdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdHRleHRNYXhDaGFyYWN0ZXJzRGlzcGxheToge1xuXHRcdFx0XHR0eXBlOiBcIm51bWJlclwiLFxuXHRcdFx0XHRjb25maWd1cmFibGU6IHRydWVcblx0XHRcdH0sXG5cdFx0XHR0ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGFsbG93ZWRWYWx1ZXM6IFtcIkluUGxhY2VcIiwgXCJQb3BvdmVyXCJdXG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdC8qKlxuXHQgKiBUaGUgZ2VuZXJpYyBjaGFuZ2UgZXZlbnRcblx0ICovXG5cdEB4bWxFdmVudCgpXG5cdGNoYW5nZTogc3RyaW5nID0gXCJcIjtcblxuXHQvKipcblx0ICogU2V0cyB0aGUgaW50ZXJuYWwgZm9ybWF0T3B0aW9ucyBmb3IgdGhlIGJ1aWxkaW5nIGJsb2NrLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBIHN0cmluZyB3aXRoIHRoZSBpbnRlcm5hbCBmb3JtYXRPcHRpb25zIGZvciB0aGUgYnVpbGRpbmcgYmxvY2tcblx0ICovXG5cdGdldEZvcm1hdE9wdGlvbnMoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4geG1sYFxuXHRcdDxpbnRlcm5hbE1hY3JvOmZvcm1hdE9wdGlvbnNcblx0XHRcdHRleHRBbGlnbk1vZGU9XCJGb3JtXCJcblx0XHRcdHNob3dFbXB0eUluZGljYXRvcj1cInRydWVcIlxuXHRcdFx0ZGlzcGxheU1vZGU9XCIke3RoaXMuZm9ybWF0T3B0aW9ucy5kaXNwbGF5TW9kZX1cIlxuXHRcdFx0bWVhc3VyZURpc3BsYXlNb2RlPVwiJHt0aGlzLmZvcm1hdE9wdGlvbnMubWVhc3VyZURpc3BsYXlNb2RlfVwiXG5cdFx0XHR0ZXh0TGluZXNFZGl0PVwiJHt0aGlzLmZvcm1hdE9wdGlvbnMudGV4dExpbmVzRWRpdH1cIlxuXHRcdFx0dGV4dE1heExpbmVzPVwiJHt0aGlzLmZvcm1hdE9wdGlvbnMudGV4dE1heExpbmVzfVwiXG5cdFx0XHR0ZXh0TWF4Q2hhcmFjdGVyc0Rpc3BsYXk9XCIke3RoaXMuZm9ybWF0T3B0aW9ucy50ZXh0TWF4Q2hhcmFjdGVyc0Rpc3BsYXl9XCJcblx0XHRcdHRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXk9XCIke3RoaXMuZm9ybWF0T3B0aW9ucy50ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5fVwiXG5cdFx0Lz5gO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBmdW5jdGlvbiBjYWxjdWxhdGVzIHRoZSBjb3JyZXNwb25kaW5nIFZhbHVlSGVscCBmaWVsZCBpbiBjYXNlIGl0wrRzXG5cdCAqIGRlZmluZWQgZm9yIHRoZSBzcGVjaWZpYyBjb250cm9sLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBBbiBYTUwtYmFzZWQgc3RyaW5nIHdpdGggYSBwb3NzaWJsZSBWYWx1ZUhlbHAgY29udHJvbC5cblx0ICovXG5cdGdldFBvc3NpYmxlVmFsdWVIZWxwVGVtcGxhdGUoKTogc3RyaW5nIHtcblx0XHRjb25zdCB2aHAgPSBGaWVsZEhlbHBlci52YWx1ZUhlbHBQcm9wZXJ0eSh0aGlzLm1ldGFQYXRoKTtcblx0XHRjb25zdCB2aHBDdHggPSB0aGlzLm1ldGFQYXRoLmdldE1vZGVsKCkuY3JlYXRlQmluZGluZ0NvbnRleHQodmhwLCB0aGlzLm1ldGFQYXRoKTtcblx0XHRjb25zdCBoYXNWYWx1ZUhlbHBBbm5vdGF0aW9ucyA9IEZpZWxkSGVscGVyLmhhc1ZhbHVlSGVscEFubm90YXRpb24odmhwQ3R4LmdldE9iamVjdChcIkBcIikpO1xuXHRcdGlmIChoYXNWYWx1ZUhlbHBBbm5vdGF0aW9ucykge1xuXHRcdFx0Ly9kZXBlbmRpbmcgd2hldGhlciB0aGlzIG9uZSBoYXMgYSB2YWx1ZSBoZWxwIGFubm90YXRpb24gaW5jbHVkZWQsIGFkZCB0aGUgZGVwZW5kZW50XG5cdFx0XHRyZXR1cm4geG1sYFxuXHRcdFx0PGludGVybmFsTWFjcm86ZGVwZW5kZW50cz5cblx0XHRcdFx0PG1hY3JvczpWYWx1ZUhlbHAgX2ZsZXhJZD1cIiR7dGhpcy5pZH0tY29udGVudF9GaWVsZFZhbHVlSGVscFwiIHByb3BlcnR5PVwiJHt2aHBDdHh9XCIgLz5cblx0XHRcdDwvaW50ZXJuYWxNYWNybzpkZXBlbmRlbnRzPmA7XG5cdFx0fVxuXHRcdHJldHVybiBcIlwiO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBidWlsZGluZyBibG9jayB0ZW1wbGF0ZSBmdW5jdGlvbi5cblx0ICpcblx0ICogQHJldHVybnMgQW4gWE1MLWJhc2VkIHN0cmluZyB3aXRoIHRoZSBkZWZpbml0aW9uIG9mIHRoZSBmaWVsZCBjb250cm9sXG5cdCAqL1xuXHRnZXRUZW1wbGF0ZSgpIHtcblx0XHRjb25zdCBjb250ZXh0UGF0aFBhdGggPSB0aGlzLmNvbnRleHRQYXRoLmdldFBhdGgoKTtcblx0XHRjb25zdCBtZXRhUGF0aFBhdGggPSB0aGlzLm1ldGFQYXRoLmdldFBhdGgoKTtcblx0XHRyZXR1cm4geG1sYFx0XG5cdFx0PGludGVybmFsTWFjcm86RmllbGRcblx0XHRcdHhtbG5zOmludGVybmFsTWFjcm89XCJzYXAuZmUubWFjcm9zLmludGVybmFsXCJcblx0XHRcdGVudGl0eVNldD1cIiR7Y29udGV4dFBhdGhQYXRofVwiXG5cdFx0XHRkYXRhRmllbGQ9XCIke21ldGFQYXRoUGF0aH1cIlxuXHRcdFx0ZWRpdE1vZGU9XCIke3RoaXMuZWRpdE1vZGVFeHByZXNzaW9ufVwiXG5cdFx0XHRvbkNoYW5nZT1cIiR7dGhpcy5jaGFuZ2V9XCJcblx0XHRcdF9mbGV4SWQ9XCIke3RoaXMuaWR9XCJcblx0XHRcdHNlbWFudGljT2JqZWN0PVwiJHt0aGlzLnNlbWFudGljT2JqZWN0fVwiXG5cdFx0PlxuXHRcdFx0JHt0aGlzLmdldEZvcm1hdE9wdGlvbnMoKX1cblx0XHRcdCR7dGhpcy5nZXRQb3NzaWJsZVZhbHVlSGVscFRlbXBsYXRlKCl9XG5cdFx0PC9pbnRlcm5hbE1hY3JvOkZpZWxkPmA7XG5cdH1cbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztNQWNxQkEsS0FBSyxXQVB6QkMsbUJBQW1CLENBQUM7SUFDcEJDLElBQUksRUFBRSxPQUFPO0lBQ2JDLFNBQVMsRUFBRTtFQUNaLENBQUMsQ0FBQyxVQW1CQUMsWUFBWSxDQUFDO0lBQUVDLElBQUksRUFBRSxRQUFRO0lBQUVDLFFBQVEsRUFBRSxJQUFJO0lBQUVDLFFBQVEsRUFBRTtFQUFLLENBQUMsQ0FBQyxVQU1oRUgsWUFBWSxDQUFDO0lBQ2JDLElBQUksRUFBRSxzQkFBc0I7SUFDNUJFLFFBQVEsRUFBRTtFQUNYLENBQUMsQ0FBQyxVQU1ESCxZQUFZLENBQUM7SUFDYkMsSUFBSSxFQUFFLHNCQUFzQjtJQUM1QkUsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDLFVBTURILFlBQVksQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRSxRQUFRLEVBQUU7RUFBTSxDQUFDLENBQUMsVUFNbERILFlBQVksQ0FBQztJQUNiQyxJQUFJLEVBQUUsUUFBUTtJQUNkRSxRQUFRLEVBQUU7RUFDWCxDQUFDLENBQUMsVUFNREgsWUFBWSxDQUFDO0lBQ2JDLElBQUksRUFBRSxRQUFRO0lBQ2RFLFFBQVEsRUFBRTtFQUNYLENBQUMsQ0FBQyxVQU1ESCxZQUFZLENBQUM7SUFDYkMsSUFBSSxFQUFFO0VBQ1AsQ0FBQyxDQUFDLFVBaUNERyxRQUFRLEVBQUU7SUFBQTtJQWpHWCxlQUFZQyxNQUEyQixFQUFFO01BQUE7TUFDeEMsSUFBSUEsTUFBTSxDQUFDQyxRQUFRLEtBQUtDLFNBQVMsRUFBRTtRQUNsQ0YsTUFBTSxDQUFDRyxrQkFBa0IsR0FBR0MsaUJBQWlCLENBQzVDQyxNQUFNLENBQUNDLEtBQUssQ0FBQ0Msb0JBQW9CLENBQUNQLE1BQU0sQ0FBQ0MsUUFBUSxFQUFFLFNBQVMsQ0FBQyxFQUFFLElBQUksQ0FBQyxFQUFFLFNBQVMsRUFBRSxVQUFVLENBQUMsQ0FDNUY7TUFDRixDQUFDLE1BQU07UUFDTkQsTUFBTSxDQUFDRyxrQkFBa0IsR0FBR0QsU0FBUztNQUN0QztNQUNBLHNDQUFNRixNQUFNLENBQUM7TUFBQztNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFDZjs7SUFFQTtBQUNEO0FBQ0E7SUFGQztJQUFBO0lBeUZBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFKQyxPQUtBUSxnQkFBZ0IsR0FBaEIsNEJBQTJCO01BQzFCLE9BQU9DLEdBQUcsOFhBSU0sSUFBSSxDQUFDQyxhQUFhLENBQUNDLFdBQVcsRUFDdkIsSUFBSSxDQUFDRCxhQUFhLENBQUNFLGtCQUFrQixFQUMxQyxJQUFJLENBQUNGLGFBQWEsQ0FBQ0csYUFBYSxFQUNqQyxJQUFJLENBQUNILGFBQWEsQ0FBQ0ksWUFBWSxFQUNuQixJQUFJLENBQUNKLGFBQWEsQ0FBQ0ssd0JBQXdCLEVBQzFDLElBQUksQ0FBQ0wsYUFBYSxDQUFDTSx5QkFBeUI7SUFFM0U7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BQyw0QkFBNEIsR0FBNUIsd0NBQXVDO01BQ3RDLElBQU1DLEdBQUcsR0FBR0MsV0FBVyxDQUFDQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUNDLFFBQVEsQ0FBQztNQUN4RCxJQUFNQyxNQUFNLEdBQUcsSUFBSSxDQUFDRCxRQUFRLENBQUNFLFFBQVEsRUFBRSxDQUFDQyxvQkFBb0IsQ0FBQ04sR0FBRyxFQUFFLElBQUksQ0FBQ0csUUFBUSxDQUFDO01BQ2hGLElBQU1JLHVCQUF1QixHQUFHTixXQUFXLENBQUNPLHNCQUFzQixDQUFDSixNQUFNLENBQUNLLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQztNQUN6RixJQUFJRix1QkFBdUIsRUFBRTtRQUM1QjtRQUNBLE9BQU9oQixHQUFHLHFPQUVvQixJQUFJLENBQUNtQixFQUFFLEVBQXNDTixNQUFNO01BRWxGO01BQ0EsT0FBTyxFQUFFO0lBQ1Y7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQSxPQUpDO0lBQUEsT0FLQU8sV0FBVyxHQUFYLHVCQUFjO01BQ2IsSUFBTUMsZUFBZSxHQUFHLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxPQUFPLEVBQUU7TUFDbEQsSUFBTUMsWUFBWSxHQUFHLElBQUksQ0FBQ1osUUFBUSxDQUFDVyxPQUFPLEVBQUU7TUFDNUMsT0FBT3ZCLEdBQUcsa1hBR0lxQixlQUFlLEVBQ2ZHLFlBQVksRUFDYixJQUFJLENBQUM5QixrQkFBa0IsRUFDdkIsSUFBSSxDQUFDK0IsTUFBTSxFQUNaLElBQUksQ0FBQ04sRUFBRSxFQUNBLElBQUksQ0FBQ08sY0FBYyxFQUVuQyxJQUFJLENBQUMzQixnQkFBZ0IsRUFBRSxFQUN2QixJQUFJLENBQUNTLDRCQUE0QixFQUFFO0lBRXZDLENBQUM7SUFBQTtFQUFBLEVBaktpQ21CLGlCQUFpQjtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO01BQUEsT0FrRXZCO1FBQzNCQyxVQUFVLEVBQUU7VUFDWDFCLFdBQVcsRUFBRTtZQUNaZixJQUFJLEVBQUUsUUFBUTtZQUNkMEMsYUFBYSxFQUFFLENBQUMsT0FBTyxFQUFFLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxrQkFBa0I7VUFDL0UsQ0FBQztVQUNEMUIsa0JBQWtCLEVBQUU7WUFDbkJoQixJQUFJLEVBQUUsUUFBUTtZQUNkMEMsYUFBYSxFQUFFLENBQUMsUUFBUSxFQUFFLFVBQVU7VUFDckMsQ0FBQztVQUNEekIsYUFBYSxFQUFFO1lBQ2RqQixJQUFJLEVBQUUsUUFBUTtZQUNkMkMsWUFBWSxFQUFFO1VBQ2YsQ0FBQztVQUNEekIsWUFBWSxFQUFFO1lBQ2JsQixJQUFJLEVBQUUsUUFBUTtZQUNkMkMsWUFBWSxFQUFFO1VBQ2YsQ0FBQztVQUNEeEIsd0JBQXdCLEVBQUU7WUFDekJuQixJQUFJLEVBQUUsUUFBUTtZQUNkMkMsWUFBWSxFQUFFO1VBQ2YsQ0FBQztVQUNEdkIseUJBQXlCLEVBQUU7WUFDMUJwQixJQUFJLEVBQUUsUUFBUTtZQUNkMEMsYUFBYSxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVM7VUFDckM7UUFDRDtNQUNELENBQUM7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQU1nQixFQUFFO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9