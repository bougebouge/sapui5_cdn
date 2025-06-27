/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/macros/ResourceModel", "sap/fe/macros/situations/SituationsPopover"], function (Log, BuildingBlock, BuildingBlockRuntime, MetaModelConverter, BindingToolkit, ResourceModel, SituationsPopover) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2, _templateObject;
  var _exports = {};
  var showPopover = SituationsPopover.showPopover;
  var ref = BindingToolkit.ref;
  var pathInModel = BindingToolkit.pathInModel;
  var ifElse = BindingToolkit.ifElse;
  var greaterThan = BindingToolkit.greaterThan;
  var fn = BindingToolkit.fn;
  var equal = BindingToolkit.equal;
  var and = BindingToolkit.and;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;
  var xml = BuildingBlockRuntime.xml;
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
  var SituationsIndicator = (_dec = defineBuildingBlock({
    name: "SituationsIndicator",
    namespace: "sap.fe.macros.internal.situations"
  }), _dec2 = xmlAttribute({
    type: "sap.ui.model.Context",
    required: true
  }), _dec3 = xmlAttribute({
    type: "string",
    required: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(SituationsIndicator, _BuildingBlockBase);
    function SituationsIndicator() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call.apply(_BuildingBlockBase, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "entitySet", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "propertyPath", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    _exports = SituationsIndicator;
    SituationsIndicator.getSituationsNavigationProperty = function getSituationsNavigationProperty(context) {
      var navigationProperties;
      switch (context._type) {
        case "NavigationProperty":
          navigationProperties = context.targetType.navigationProperties;
          break;
        case "EntityType":
          navigationProperties = context.navigationProperties;
          break;
        default:
          navigationProperties = context.entityType.navigationProperties;
      }
      var situationsNavProps = navigationProperties.filter(function (navigationProperty) {
        var _navigationProperty$t, _navigationProperty$t2;
        return !navigationProperty.isCollection && ((_navigationProperty$t = navigationProperty.targetType.annotations.Common) === null || _navigationProperty$t === void 0 ? void 0 : (_navigationProperty$t2 = _navigationProperty$t.SAPObjectNodeType) === null || _navigationProperty$t2 === void 0 ? void 0 : _navigationProperty$t2.Name) === "BusinessSituation";
      });
      var situationsNavProp = situationsNavProps.length >= 1 ? situationsNavProps[0] : undefined;

      // only one navigation property may lead to an entity tagged as "BusinessSituation"
      if (situationsNavProps.length > 1) {
        var navPropNames = situationsNavProps.map(function (prop) {
          return "'".concat(prop.name, "'");
        }).join(", ");
        var name;
        switch (context._type) {
          case "NavigationProperty":
            name = context.targetType.name;
            break;
          case "EntityType":
            name = context.name;
            break;
          default:
            name = context.entityType.name;
        }
        Log.error("Entity type '".concat(name, "' has multiple paths to SAP Situations (").concat(navPropNames, "). Using '").concat(situationsNavProp === null || situationsNavProp === void 0 ? void 0 : situationsNavProp.name, "'.\nHint: Make sure there is at most one navigation property whose target entity type is annotated with\n<Annotation Term=\"com.sap.vocabularies.Common.v1.SAPObjectNodeType\">\n  <Record>\n    <PropertyValue Property=\"Name\" String=\"BusinessSituation\" />\n  </Record>\n</Annotation>."));
      }
      return situationsNavProp;
    };
    var _proto = SituationsIndicator.prototype;
    _proto.getTemplate = function getTemplate() {
      var context = convertMetaModelContext(this.entitySet);
      var situationsNavProp = SituationsIndicator.getSituationsNavigationProperty(context);
      if (!situationsNavProp) {
        // No path to SAP Situations. That is, the entity type is not situation-enabled. Ignore this fragment.
        return undefined;
      }
      var numberOfSituations = pathInModel("".concat(situationsNavProp.name, "/SitnNumberOfInstances"));

      // Indicator visibility
      var visible;
      if (!this.propertyPath) {
        // no propertyPath --> visibility depends on the number of situations only
        visible = greaterThan(numberOfSituations, 0);
      } else {
        // propertyPath --> visibility depends on the number of situations and on the semantic key used for showing indicators
        visible = and(greaterThan(numberOfSituations, 0), equal(pathInModel("semanticKeyHasDraftIndicator", "internal"), this.propertyPath));
      }

      // Button text: the number of situations if there are multiple, the empty string otherwise
      var text = ifElse(greaterThan(numberOfSituations, 1), numberOfSituations, "");

      // Button tooltip: "There is one situation" / "There are <n> situations"
      var tooltip = ifElse(equal(numberOfSituations, 1), ResourceModel.getText("situationsTooltipSingular"), fn("formatMessage", [ResourceModel.getText("situationsTooltipPlural"), numberOfSituations]));

      // 'press' handler
      var onPress = fn(showPopover, [ref("$controller"), ref("$event"), situationsNavProp.name]);
      return xml(_templateObject || (_templateObject = _taggedTemplateLiteral(["\n\t\t\t<m:Button core:require=\"{rt: 'sap/fe/macros/situations/SituationsPopover', formatMessage: 'sap/base/strings/formatMessage'}\"\n\t\t\t\ttype=\"Attention\"\n\t\t\t\ticon=\"sap-icon://alert\"\n\t\t\t\ttext=\"", "\"\n\t\t\t\ttooltip=\"", "\"\n\t\t\t\tvisible=\"", "\"\n\t\t\t\tpress=\"", "\"\n\t\t\t/>"])), text, tooltip, visible, onPress);
    };
    return SituationsIndicator;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "entitySet", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "propertyPath", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = SituationsIndicator;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaXR1YXRpb25zSW5kaWNhdG9yIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm5hbWUiLCJuYW1lc3BhY2UiLCJ4bWxBdHRyaWJ1dGUiLCJ0eXBlIiwicmVxdWlyZWQiLCJnZXRTaXR1YXRpb25zTmF2aWdhdGlvblByb3BlcnR5IiwiY29udGV4dCIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwiX3R5cGUiLCJ0YXJnZXRUeXBlIiwiZW50aXR5VHlwZSIsInNpdHVhdGlvbnNOYXZQcm9wcyIsImZpbHRlciIsIm5hdmlnYXRpb25Qcm9wZXJ0eSIsImlzQ29sbGVjdGlvbiIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiU0FQT2JqZWN0Tm9kZVR5cGUiLCJOYW1lIiwic2l0dWF0aW9uc05hdlByb3AiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJuYXZQcm9wTmFtZXMiLCJtYXAiLCJwcm9wIiwiam9pbiIsIkxvZyIsImVycm9yIiwiZ2V0VGVtcGxhdGUiLCJjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCIsImVudGl0eVNldCIsIm51bWJlck9mU2l0dWF0aW9ucyIsInBhdGhJbk1vZGVsIiwidmlzaWJsZSIsInByb3BlcnR5UGF0aCIsImdyZWF0ZXJUaGFuIiwiYW5kIiwiZXF1YWwiLCJ0ZXh0IiwiaWZFbHNlIiwidG9vbHRpcCIsIlJlc291cmNlTW9kZWwiLCJnZXRUZXh0IiwiZm4iLCJvblByZXNzIiwic2hvd1BvcG92ZXIiLCJyZWYiLCJ4bWwiLCJCdWlsZGluZ0Jsb2NrQmFzZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2l0dWF0aW9uc0luZGljYXRvci5mcmFnbWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7IEVudGl0eVNldCwgRW50aXR5VHlwZSwgTmF2aWdhdGlvblByb3BlcnR5LCBTaW5nbGV0b24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHsgQnVpbGRpbmdCbG9ja0Jhc2UsIGRlZmluZUJ1aWxkaW5nQmxvY2ssIHhtbEF0dHJpYnV0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgeyB4bWwgfSBmcm9tIFwic2FwL2ZlL2NvcmUvYnVpbGRpbmdCbG9ja3MvQnVpbGRpbmdCbG9ja1J1bnRpbWVcIjtcbmltcG9ydCB7IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgdHlwZSB7IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBhbmQsIGVxdWFsLCBmbiwgZ3JlYXRlclRoYW4sIGlmRWxzZSwgcGF0aEluTW9kZWwsIHJlZiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgeyBzaG93UG9wb3ZlciB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL3NpdHVhdGlvbnMvU2l0dWF0aW9uc1BvcG92ZXJcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHsgbmFtZTogXCJTaXR1YXRpb25zSW5kaWNhdG9yXCIsIG5hbWVzcGFjZTogXCJzYXAuZmUubWFjcm9zLmludGVybmFsLnNpdHVhdGlvbnNcIiB9KVxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU2l0dWF0aW9uc0luZGljYXRvciBleHRlbmRzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0QHhtbEF0dHJpYnV0ZSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiwgcmVxdWlyZWQ6IHRydWUgfSlcblx0ZW50aXR5U2V0ITogQ29udGV4dDtcblxuXHRAeG1sQXR0cmlidXRlKHsgdHlwZTogXCJzdHJpbmdcIiwgcmVxdWlyZWQ6IGZhbHNlIH0pXG5cdHByb3BlcnR5UGF0aD86IHN0cmluZztcblxuXHRzdGF0aWMgZ2V0U2l0dWF0aW9uc05hdmlnYXRpb25Qcm9wZXJ0eShcblx0XHRjb250ZXh0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCBFbnRpdHlUeXBlIHwgTmF2aWdhdGlvblByb3BlcnR5XG5cdCk6IE5hdmlnYXRpb25Qcm9wZXJ0eSB8IHVuZGVmaW5lZCB7XG5cdFx0bGV0IG5hdmlnYXRpb25Qcm9wZXJ0aWVzOiBOYXZpZ2F0aW9uUHJvcGVydHlbXTtcblx0XHRzd2l0Y2ggKGNvbnRleHQuX3R5cGUpIHtcblx0XHRcdGNhc2UgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIjpcblx0XHRcdFx0bmF2aWdhdGlvblByb3BlcnRpZXMgPSBjb250ZXh0LnRhcmdldFR5cGUubmF2aWdhdGlvblByb3BlcnRpZXM7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkVudGl0eVR5cGVcIjpcblx0XHRcdFx0bmF2aWdhdGlvblByb3BlcnRpZXMgPSBjb250ZXh0Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gY29udGV4dC5lbnRpdHlUeXBlLm5hdmlnYXRpb25Qcm9wZXJ0aWVzO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNpdHVhdGlvbnNOYXZQcm9wcyA9IG5hdmlnYXRpb25Qcm9wZXJ0aWVzLmZpbHRlcihcblx0XHRcdChuYXZpZ2F0aW9uUHJvcGVydHkpID0+XG5cdFx0XHRcdCFuYXZpZ2F0aW9uUHJvcGVydHkuaXNDb2xsZWN0aW9uICYmXG5cdFx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0eS50YXJnZXRUeXBlLmFubm90YXRpb25zLkNvbW1vbj8uU0FQT2JqZWN0Tm9kZVR5cGU/Lk5hbWUgPT09IFwiQnVzaW5lc3NTaXR1YXRpb25cIlxuXHRcdCk7XG5cblx0XHRjb25zdCBzaXR1YXRpb25zTmF2UHJvcDogTmF2aWdhdGlvblByb3BlcnR5IHwgdW5kZWZpbmVkID0gc2l0dWF0aW9uc05hdlByb3BzLmxlbmd0aCA+PSAxID8gc2l0dWF0aW9uc05hdlByb3BzWzBdIDogdW5kZWZpbmVkO1xuXG5cdFx0Ly8gb25seSBvbmUgbmF2aWdhdGlvbiBwcm9wZXJ0eSBtYXkgbGVhZCB0byBhbiBlbnRpdHkgdGFnZ2VkIGFzIFwiQnVzaW5lc3NTaXR1YXRpb25cIlxuXHRcdGlmIChzaXR1YXRpb25zTmF2UHJvcHMubGVuZ3RoID4gMSkge1xuXHRcdFx0Y29uc3QgbmF2UHJvcE5hbWVzID0gc2l0dWF0aW9uc05hdlByb3BzLm1hcCgocHJvcCkgPT4gYCcke3Byb3AubmFtZX0nYCkuam9pbihcIiwgXCIpO1xuXG5cdFx0XHRsZXQgbmFtZTogc3RyaW5nO1xuXHRcdFx0c3dpdGNoIChjb250ZXh0Ll90eXBlKSB7XG5cdFx0XHRcdGNhc2UgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIjpcblx0XHRcdFx0XHRuYW1lID0gY29udGV4dC50YXJnZXRUeXBlLm5hbWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJFbnRpdHlUeXBlXCI6XG5cdFx0XHRcdFx0bmFtZSA9IGNvbnRleHQubmFtZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRuYW1lID0gY29udGV4dC5lbnRpdHlUeXBlLm5hbWU7XG5cdFx0XHR9XG5cblx0XHRcdExvZy5lcnJvcihgRW50aXR5IHR5cGUgJyR7bmFtZX0nIGhhcyBtdWx0aXBsZSBwYXRocyB0byBTQVAgU2l0dWF0aW9ucyAoJHtuYXZQcm9wTmFtZXN9KS4gVXNpbmcgJyR7c2l0dWF0aW9uc05hdlByb3A/Lm5hbWV9Jy5cbkhpbnQ6IE1ha2Ugc3VyZSB0aGVyZSBpcyBhdCBtb3N0IG9uZSBuYXZpZ2F0aW9uIHByb3BlcnR5IHdob3NlIHRhcmdldCBlbnRpdHkgdHlwZSBpcyBhbm5vdGF0ZWQgd2l0aFxuPEFubm90YXRpb24gVGVybT1cImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TQVBPYmplY3ROb2RlVHlwZVwiPlxuICA8UmVjb3JkPlxuICAgIDxQcm9wZXJ0eVZhbHVlIFByb3BlcnR5PVwiTmFtZVwiIFN0cmluZz1cIkJ1c2luZXNzU2l0dWF0aW9uXCIgLz5cbiAgPC9SZWNvcmQ+XG48L0Fubm90YXRpb24+LmApO1xuXHRcdH1cblxuXHRcdHJldHVybiBzaXR1YXRpb25zTmF2UHJvcDtcblx0fVxuXG5cdGdldFRlbXBsYXRlKCkge1xuXHRcdGNvbnN0IGNvbnRleHQgPSBjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCh0aGlzLmVudGl0eVNldCk7XG5cdFx0Y29uc3Qgc2l0dWF0aW9uc05hdlByb3AgPSBTaXR1YXRpb25zSW5kaWNhdG9yLmdldFNpdHVhdGlvbnNOYXZpZ2F0aW9uUHJvcGVydHkoY29udGV4dCk7XG5cdFx0aWYgKCFzaXR1YXRpb25zTmF2UHJvcCkge1xuXHRcdFx0Ly8gTm8gcGF0aCB0byBTQVAgU2l0dWF0aW9ucy4gVGhhdCBpcywgdGhlIGVudGl0eSB0eXBlIGlzIG5vdCBzaXR1YXRpb24tZW5hYmxlZC4gSWdub3JlIHRoaXMgZnJhZ21lbnQuXG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGNvbnN0IG51bWJlck9mU2l0dWF0aW9ucyA9IHBhdGhJbk1vZGVsKGAke3NpdHVhdGlvbnNOYXZQcm9wLm5hbWV9L1NpdG5OdW1iZXJPZkluc3RhbmNlc2ApO1xuXG5cdFx0Ly8gSW5kaWNhdG9yIHZpc2liaWxpdHlcblx0XHRsZXQgdmlzaWJsZTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+O1xuXHRcdGlmICghdGhpcy5wcm9wZXJ0eVBhdGgpIHtcblx0XHRcdC8vIG5vIHByb3BlcnR5UGF0aCAtLT4gdmlzaWJpbGl0eSBkZXBlbmRzIG9uIHRoZSBudW1iZXIgb2Ygc2l0dWF0aW9ucyBvbmx5XG5cdFx0XHR2aXNpYmxlID0gZ3JlYXRlclRoYW4obnVtYmVyT2ZTaXR1YXRpb25zLCAwKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gcHJvcGVydHlQYXRoIC0tPiB2aXNpYmlsaXR5IGRlcGVuZHMgb24gdGhlIG51bWJlciBvZiBzaXR1YXRpb25zIGFuZCBvbiB0aGUgc2VtYW50aWMga2V5IHVzZWQgZm9yIHNob3dpbmcgaW5kaWNhdG9yc1xuXHRcdFx0dmlzaWJsZSA9IGFuZChcblx0XHRcdFx0Z3JlYXRlclRoYW4obnVtYmVyT2ZTaXR1YXRpb25zLCAwKSxcblx0XHRcdFx0ZXF1YWwocGF0aEluTW9kZWwoXCJzZW1hbnRpY0tleUhhc0RyYWZ0SW5kaWNhdG9yXCIsIFwiaW50ZXJuYWxcIiksIHRoaXMucHJvcGVydHlQYXRoKVxuXHRcdFx0KTtcblx0XHR9XG5cblx0XHQvLyBCdXR0b24gdGV4dDogdGhlIG51bWJlciBvZiBzaXR1YXRpb25zIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSwgdGhlIGVtcHR5IHN0cmluZyBvdGhlcndpc2Vcblx0XHRjb25zdCB0ZXh0ID0gaWZFbHNlKGdyZWF0ZXJUaGFuKG51bWJlck9mU2l0dWF0aW9ucywgMSksIG51bWJlck9mU2l0dWF0aW9ucywgXCJcIik7XG5cblx0XHQvLyBCdXR0b24gdG9vbHRpcDogXCJUaGVyZSBpcyBvbmUgc2l0dWF0aW9uXCIgLyBcIlRoZXJlIGFyZSA8bj4gc2l0dWF0aW9uc1wiXG5cdFx0Y29uc3QgdG9vbHRpcCA9IGlmRWxzZShcblx0XHRcdGVxdWFsKG51bWJlck9mU2l0dWF0aW9ucywgMSksXG5cdFx0XHRSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJzaXR1YXRpb25zVG9vbHRpcFNpbmd1bGFyXCIpLFxuXHRcdFx0Zm4oXCJmb3JtYXRNZXNzYWdlXCIsIFtSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJzaXR1YXRpb25zVG9vbHRpcFBsdXJhbFwiKSwgbnVtYmVyT2ZTaXR1YXRpb25zXSlcblx0XHQpO1xuXG5cdFx0Ly8gJ3ByZXNzJyBoYW5kbGVyXG5cdFx0Y29uc3Qgb25QcmVzcyA9IGZuKHNob3dQb3BvdmVyLCBbcmVmKFwiJGNvbnRyb2xsZXJcIiksIHJlZihcIiRldmVudFwiKSwgc2l0dWF0aW9uc05hdlByb3AubmFtZV0pO1xuXG5cdFx0cmV0dXJuIHhtbGBcblx0XHRcdDxtOkJ1dHRvbiBjb3JlOnJlcXVpcmU9XCJ7cnQ6ICdzYXAvZmUvbWFjcm9zL3NpdHVhdGlvbnMvU2l0dWF0aW9uc1BvcG92ZXInLCBmb3JtYXRNZXNzYWdlOiAnc2FwL2Jhc2Uvc3RyaW5ncy9mb3JtYXRNZXNzYWdlJ31cIlxuXHRcdFx0XHR0eXBlPVwiQXR0ZW50aW9uXCJcblx0XHRcdFx0aWNvbj1cInNhcC1pY29uOi8vYWxlcnRcIlxuXHRcdFx0XHR0ZXh0PVwiJHt0ZXh0fVwiXG5cdFx0XHRcdHRvb2x0aXA9XCIke3Rvb2x0aXB9XCJcblx0XHRcdFx0dmlzaWJsZT1cIiR7dmlzaWJsZX1cIlxuXHRcdFx0XHRwcmVzcz1cIiR7b25QcmVzc31cIlxuXHRcdFx0Lz5gO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O01BWXFCQSxtQkFBbUIsV0FEdkNDLG1CQUFtQixDQUFDO0lBQUVDLElBQUksRUFBRSxxQkFBcUI7SUFBRUMsU0FBUyxFQUFFO0VBQW9DLENBQUMsQ0FBQyxVQUVuR0MsWUFBWSxDQUFDO0lBQUVDLElBQUksRUFBRSxzQkFBc0I7SUFBRUMsUUFBUSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBRzlERixZQUFZLENBQUM7SUFBRUMsSUFBSSxFQUFFLFFBQVE7SUFBRUMsUUFBUSxFQUFFO0VBQU0sQ0FBQyxDQUFDO0lBQUE7SUFBQTtNQUFBO01BQUE7UUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7SUFBQTtJQUFBO0lBQUEsb0JBRzNDQywrQkFBK0IsR0FBdEMseUNBQ0NDLE9BQWdFLEVBQy9CO01BQ2pDLElBQUlDLG9CQUEwQztNQUM5QyxRQUFRRCxPQUFPLENBQUNFLEtBQUs7UUFDcEIsS0FBSyxvQkFBb0I7VUFDeEJELG9CQUFvQixHQUFHRCxPQUFPLENBQUNHLFVBQVUsQ0FBQ0Ysb0JBQW9CO1VBQzlEO1FBQ0QsS0FBSyxZQUFZO1VBQ2hCQSxvQkFBb0IsR0FBR0QsT0FBTyxDQUFDQyxvQkFBb0I7VUFDbkQ7UUFDRDtVQUNDQSxvQkFBb0IsR0FBR0QsT0FBTyxDQUFDSSxVQUFVLENBQUNILG9CQUFvQjtNQUFDO01BR2pFLElBQU1JLGtCQUFrQixHQUFHSixvQkFBb0IsQ0FBQ0ssTUFBTSxDQUNyRCxVQUFDQyxrQkFBa0I7UUFBQTtRQUFBLE9BQ2xCLENBQUNBLGtCQUFrQixDQUFDQyxZQUFZLElBQ2hDLDBCQUFBRCxrQkFBa0IsQ0FBQ0osVUFBVSxDQUFDTSxXQUFXLENBQUNDLE1BQU0sb0ZBQWhELHNCQUFrREMsaUJBQWlCLDJEQUFuRSx1QkFBcUVDLElBQUksTUFBSyxtQkFBbUI7TUFBQSxFQUNsRztNQUVELElBQU1DLGlCQUFpRCxHQUFHUixrQkFBa0IsQ0FBQ1MsTUFBTSxJQUFJLENBQUMsR0FBR1Qsa0JBQWtCLENBQUMsQ0FBQyxDQUFDLEdBQUdVLFNBQVM7O01BRTVIO01BQ0EsSUFBSVYsa0JBQWtCLENBQUNTLE1BQU0sR0FBRyxDQUFDLEVBQUU7UUFDbEMsSUFBTUUsWUFBWSxHQUFHWCxrQkFBa0IsQ0FBQ1ksR0FBRyxDQUFDLFVBQUNDLElBQUk7VUFBQSxrQkFBU0EsSUFBSSxDQUFDeEIsSUFBSTtRQUFBLENBQUcsQ0FBQyxDQUFDeUIsSUFBSSxDQUFDLElBQUksQ0FBQztRQUVsRixJQUFJekIsSUFBWTtRQUNoQixRQUFRTSxPQUFPLENBQUNFLEtBQUs7VUFDcEIsS0FBSyxvQkFBb0I7WUFDeEJSLElBQUksR0FBR00sT0FBTyxDQUFDRyxVQUFVLENBQUNULElBQUk7WUFDOUI7VUFDRCxLQUFLLFlBQVk7WUFDaEJBLElBQUksR0FBR00sT0FBTyxDQUFDTixJQUFJO1lBQ25CO1VBQ0Q7WUFDQ0EsSUFBSSxHQUFHTSxPQUFPLENBQUNJLFVBQVUsQ0FBQ1YsSUFBSTtRQUFDO1FBR2pDMEIsR0FBRyxDQUFDQyxLQUFLLHdCQUFpQjNCLElBQUkscURBQTJDc0IsWUFBWSx1QkFBYUgsaUJBQWlCLGFBQWpCQSxpQkFBaUIsdUJBQWpCQSxpQkFBaUIsQ0FBRW5CLElBQUksb1NBTTVHO01BQ2Q7TUFFQSxPQUFPbUIsaUJBQWlCO0lBQ3pCLENBQUM7SUFBQTtJQUFBLE9BRURTLFdBQVcsR0FBWCx1QkFBYztNQUNiLElBQU10QixPQUFPLEdBQUd1Qix1QkFBdUIsQ0FBQyxJQUFJLENBQUNDLFNBQVMsQ0FBQztNQUN2RCxJQUFNWCxpQkFBaUIsR0FBR3JCLG1CQUFtQixDQUFDTywrQkFBK0IsQ0FBQ0MsT0FBTyxDQUFDO01BQ3RGLElBQUksQ0FBQ2EsaUJBQWlCLEVBQUU7UUFDdkI7UUFDQSxPQUFPRSxTQUFTO01BQ2pCO01BRUEsSUFBTVUsa0JBQWtCLEdBQUdDLFdBQVcsV0FBSWIsaUJBQWlCLENBQUNuQixJQUFJLDRCQUF5Qjs7TUFFekY7TUFDQSxJQUFJaUMsT0FBMEM7TUFDOUMsSUFBSSxDQUFDLElBQUksQ0FBQ0MsWUFBWSxFQUFFO1FBQ3ZCO1FBQ0FELE9BQU8sR0FBR0UsV0FBVyxDQUFDSixrQkFBa0IsRUFBRSxDQUFDLENBQUM7TUFDN0MsQ0FBQyxNQUFNO1FBQ047UUFDQUUsT0FBTyxHQUFHRyxHQUFHLENBQ1pELFdBQVcsQ0FBQ0osa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEVBQ2xDTSxLQUFLLENBQUNMLFdBQVcsQ0FBQyw4QkFBOEIsRUFBRSxVQUFVLENBQUMsRUFBRSxJQUFJLENBQUNFLFlBQVksQ0FBQyxDQUNqRjtNQUNGOztNQUVBO01BQ0EsSUFBTUksSUFBSSxHQUFHQyxNQUFNLENBQUNKLFdBQVcsQ0FBQ0osa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEVBQUVBLGtCQUFrQixFQUFFLEVBQUUsQ0FBQzs7TUFFL0U7TUFDQSxJQUFNUyxPQUFPLEdBQUdELE1BQU0sQ0FDckJGLEtBQUssQ0FBQ04sa0JBQWtCLEVBQUUsQ0FBQyxDQUFDLEVBQzVCVSxhQUFhLENBQUNDLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxFQUNsREMsRUFBRSxDQUFDLGVBQWUsRUFBRSxDQUFDRixhQUFhLENBQUNDLE9BQU8sQ0FBQyx5QkFBeUIsQ0FBQyxFQUFFWCxrQkFBa0IsQ0FBQyxDQUFDLENBQzNGOztNQUVEO01BQ0EsSUFBTWEsT0FBTyxHQUFHRCxFQUFFLENBQUNFLFdBQVcsRUFBRSxDQUFDQyxHQUFHLENBQUMsYUFBYSxDQUFDLEVBQUVBLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRTNCLGlCQUFpQixDQUFDbkIsSUFBSSxDQUFDLENBQUM7TUFFNUYsT0FBTytDLEdBQUcsd1hBSUFULElBQUksRUFDREUsT0FBTyxFQUNQUCxPQUFPLEVBQ1RXLE9BQU87SUFFbkIsQ0FBQztJQUFBO0VBQUEsRUF2RytDSSxpQkFBaUI7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9