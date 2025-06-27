/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/library", "sap/fe/core/TemplateComponent", "sap/fe/templates/library", "sap/ui/model/odata/v4/ODataListBinding"], function (Log, CommonUtils, ClassSupport, CoreLibrary, TemplateComponent, templateLib, ODataListBinding) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var VariantManagement = CoreLibrary.VariantManagement,
    CreationMode = CoreLibrary.CreationMode;
  var SectionLayout = templateLib.ObjectPage.SectionLayout;
  var ObjectPageComponent = (_dec = defineUI5Class("sap.fe.templates.ObjectPage.Component", {
    library: "sap.fe.templates",
    manifest: "json"
  }), _dec2 = property({
    type: "sap.fe.core.VariantManagement",
    defaultValue: VariantManagement.None
  }), _dec3 = property({
    type: "sap.fe.templates.ObjectPage.SectionLayout",
    defaultValue: SectionLayout.Page
  }), _dec4 = property({
    type: "boolean",
    defaultValue: false
  }), _dec5 = property({
    type: "object"
  }), _dec6 = property({
    type: "boolean",
    defaultValue: true
  }), _dec7 = property({
    type: "boolean",
    defaultValue: true
  }), _dec8 = property({
    type: "object"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_TemplateComponent) {
    _inheritsLoose(ObjectPageComponent, _TemplateComponent);
    function ObjectPageComponent() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _TemplateComponent.call.apply(_TemplateComponent, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "variantManagement", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "sectionLayout", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showRelatedApps", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "additionalSemanticObjects", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editableHeaderContent", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "showBreadCrumbs", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "inboundParameters", _descriptor7, _assertThisInitialized(_this));
      _this.DeferredContextCreated = false;
      return _this;
    }
    var _proto = ObjectPageComponent.prototype;
    _proto.isContextExpected = function isContextExpected() {
      return true;
    }

    // TODO: this should be ideally be handled by the editflow/routing without the need to have this method in the
    // object page - for now keep it here
    ;
    _proto.createDeferredContext = function createDeferredContext(sPath, oListBinding, bActionCreate) {
      var _this2 = this;
      if (!this.DeferredContextCreated) {
        this.DeferredContextCreated = true;
        var oParameters = {
          "$$groupId": "$auto.Heroes",
          "$$updateGroupId": "$auto"
        };
        // In fullscreen mode, we recreate the list binding, as we don't want to have synchronization between views
        // (it causes errors, e.g. pending changes due to creationRow)
        if (!oListBinding || oListBinding.isRelative() === false && !this.oAppComponent.getRootViewController().isFclEnabled()) {
          oListBinding = new ODataListBinding(this.getModel(), sPath.replace("(...)", ""), undefined, undefined, undefined, oParameters);
        }
        var oStartUpParams = this.oAppComponent && this.oAppComponent.getComponentData() && this.oAppComponent.getComponentData().startupParameters,
          oInboundParameters = this.getViewData().inboundParameters;
        var createParams;
        if (oStartUpParams && oStartUpParams.preferredMode && oStartUpParams.preferredMode[0].indexOf("create") !== -1) {
          createParams = CommonUtils.getAdditionalParamsForCreate(oStartUpParams, oInboundParameters);
        }

        // for now wait until the view and the controller is created
        this.getRootControl().getController().editFlow.createDocument(oListBinding, {
          creationMode: CreationMode.Sync,
          createAction: bActionCreate,
          data: createParams,
          bFromDeferred: true
        }).finally(function () {
          _this2.DeferredContextCreated = false;
        }).catch(function () {
          // Do Nothing ?
        });
      }
    };
    _proto.setVariantManagement = function setVariantManagement(sVariantManagement) {
      if (sVariantManagement === VariantManagement.Page) {
        Log.error("ObjectPage does not support Page-level variant management yet");
        sVariantManagement = VariantManagement.None;
      }
      this.setProperty("variantManagement", sVariantManagement);
    };
    return ObjectPageComponent;
  }(TemplateComponent), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "sectionLayout", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "showRelatedApps", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "additionalSemanticObjects", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "editableHeaderContent", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "showBreadCrumbs", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "inboundParameters", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ObjectPageComponent;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYXJpYW50TWFuYWdlbWVudCIsIkNvcmVMaWJyYXJ5IiwiQ3JlYXRpb25Nb2RlIiwiU2VjdGlvbkxheW91dCIsInRlbXBsYXRlTGliIiwiT2JqZWN0UGFnZSIsIk9iamVjdFBhZ2VDb21wb25lbnQiLCJkZWZpbmVVSTVDbGFzcyIsImxpYnJhcnkiLCJtYW5pZmVzdCIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsIk5vbmUiLCJQYWdlIiwiRGVmZXJyZWRDb250ZXh0Q3JlYXRlZCIsImlzQ29udGV4dEV4cGVjdGVkIiwiY3JlYXRlRGVmZXJyZWRDb250ZXh0Iiwic1BhdGgiLCJvTGlzdEJpbmRpbmciLCJiQWN0aW9uQ3JlYXRlIiwib1BhcmFtZXRlcnMiLCJpc1JlbGF0aXZlIiwib0FwcENvbXBvbmVudCIsImdldFJvb3RWaWV3Q29udHJvbGxlciIsImlzRmNsRW5hYmxlZCIsIk9EYXRhTGlzdEJpbmRpbmciLCJnZXRNb2RlbCIsInJlcGxhY2UiLCJ1bmRlZmluZWQiLCJvU3RhcnRVcFBhcmFtcyIsImdldENvbXBvbmVudERhdGEiLCJzdGFydHVwUGFyYW1ldGVycyIsIm9JbmJvdW5kUGFyYW1ldGVycyIsImdldFZpZXdEYXRhIiwiaW5ib3VuZFBhcmFtZXRlcnMiLCJjcmVhdGVQYXJhbXMiLCJwcmVmZXJyZWRNb2RlIiwiaW5kZXhPZiIsIkNvbW1vblV0aWxzIiwiZ2V0QWRkaXRpb25hbFBhcmFtc0ZvckNyZWF0ZSIsImdldFJvb3RDb250cm9sIiwiZ2V0Q29udHJvbGxlciIsImVkaXRGbG93IiwiY3JlYXRlRG9jdW1lbnQiLCJjcmVhdGlvbk1vZGUiLCJTeW5jIiwiY3JlYXRlQWN0aW9uIiwiZGF0YSIsImJGcm9tRGVmZXJyZWQiLCJmaW5hbGx5IiwiY2F0Y2giLCJzZXRWYXJpYW50TWFuYWdlbWVudCIsInNWYXJpYW50TWFuYWdlbWVudCIsIkxvZyIsImVycm9yIiwic2V0UHJvcGVydHkiLCJUZW1wbGF0ZUNvbXBvbmVudCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ29tcG9uZW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgQ29yZUxpYnJhcnkgZnJvbSBcInNhcC9mZS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBUZW1wbGF0ZUNvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVDb21wb25lbnRcIjtcbmltcG9ydCB0ZW1wbGF0ZUxpYiBmcm9tIFwic2FwL2ZlL3RlbXBsYXRlcy9saWJyYXJ5XCI7XG5pbXBvcnQgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcblxuY29uc3QgVmFyaWFudE1hbmFnZW1lbnQgPSBDb3JlTGlicmFyeS5WYXJpYW50TWFuYWdlbWVudCxcblx0Q3JlYXRpb25Nb2RlID0gQ29yZUxpYnJhcnkuQ3JlYXRpb25Nb2RlO1xuY29uc3QgU2VjdGlvbkxheW91dCA9IHRlbXBsYXRlTGliLk9iamVjdFBhZ2UuU2VjdGlvbkxheW91dDtcbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5Db21wb25lbnRcIiwgeyBsaWJyYXJ5OiBcInNhcC5mZS50ZW1wbGF0ZXNcIiwgbWFuaWZlc3Q6IFwianNvblwiIH0pXG5jbGFzcyBPYmplY3RQYWdlQ29tcG9uZW50IGV4dGVuZHMgVGVtcGxhdGVDb21wb25lbnQge1xuXHQvKipcblx0ICogRGVmaW5lcyBpZiBhbmQgb24gd2hpY2ggbGV2ZWwgdmFyaWFudHMgY2FuIGJlIGNvbmZpZ3VyZWQ6XG5cdCAqIFx0XHROb25lOiBubyB2YXJpYW50IGNvbmZpZ3VyYXRpb24gYXQgYWxsXG5cdCAqIFx0XHRQYWdlOiBvbmUgdmFyaWFudCBjb25maWd1cmF0aW9uIGZvciB0aGUgd2hvbGUgcGFnZVxuXHQgKiBcdFx0Q29udHJvbDogdmFyaWFudCBjb25maWd1cmF0aW9uIG9uIGNvbnRyb2wgbGV2ZWxcblx0ICovXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzYXAuZmUuY29yZS5WYXJpYW50TWFuYWdlbWVudFwiLFxuXHRcdGRlZmF1bHRWYWx1ZTogVmFyaWFudE1hbmFnZW1lbnQuTm9uZVxuXHR9KVxuXHR2YXJpYW50TWFuYWdlbWVudDogdHlwZW9mIFZhcmlhbnRNYW5hZ2VtZW50O1xuXHQvKipcblx0ICogRGVmaW5lcyBob3cgdGhlIHNlY3Rpb25zIGFyZSByZW5kZXJlZFxuXHQgKiBcdFx0UGFnZTogYWxsIHNlY3Rpb25zIGFyZSBzaG93biBvbiBvbmUgcGFnZVxuXHQgKiBcdFx0VGFiczogZWFjaCB0b3AtbGV2ZWwgc2VjdGlvbiBpcyBzaG93biBpbiBhbiBvd24gdGFiXG5cdCAqL1xuXHRAcHJvcGVydHkoe1xuXHRcdHR5cGU6IFwic2FwLmZlLnRlbXBsYXRlcy5PYmplY3RQYWdlLlNlY3Rpb25MYXlvdXRcIixcblx0XHRkZWZhdWx0VmFsdWU6IFNlY3Rpb25MYXlvdXQuUGFnZVxuXHR9KVxuXHRzZWN0aW9uTGF5b3V0OiB0eXBlb2YgU2VjdGlvbkxheW91dDtcblx0LyoqXG5cdCAqIEVuYWJsZXMgdGhlIHJlbGF0ZWQgYXBwcyBmZWF0dXJlc1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdH0pXG5cdHNob3dSZWxhdGVkQXBwcyE6IGJvb2xlYW47XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJvYmplY3RcIiB9KVxuXHRhZGRpdGlvbmFsU2VtYW50aWNPYmplY3RzOiBhbnk7XG5cdC8qKlxuXHQgKiBFbmFibGVzIHRoZSBlZGl0YWJsZSBvYmplY3QgcGFnZSBoZWFkZXJcblx0ICovXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiB0cnVlXG5cdH0pXG5cdGVkaXRhYmxlSGVhZGVyQ29udGVudCE6IGJvb2xlYW47XG5cdC8qKlxuXHQgKiBFbmFibGVzIHRoZSBCcmVhZENydW1icyBmZWF0dXJlc1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRkZWZhdWx0VmFsdWU6IHRydWVcblx0fSlcblx0c2hvd0JyZWFkQ3J1bWJzITogYm9vbGVhbjtcblx0LyoqXG5cdCAqIERlZmluZXMgdGhlIHByb3BlcnRpZXMgd2hpY2ggY2FuIGJlIHVzZWQgZm9yIGluYm91bmQgTmF2aWdhdGlvblxuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcIm9iamVjdFwiXG5cdH0pXG5cdGluYm91bmRQYXJhbWV0ZXJzOiBhbnk7XG5cdHByaXZhdGUgRGVmZXJyZWRDb250ZXh0Q3JlYXRlZDogQm9vbGVhbiA9IGZhbHNlO1xuXG5cdGlzQ29udGV4dEV4cGVjdGVkKCkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9XG5cblx0Ly8gVE9ETzogdGhpcyBzaG91bGQgYmUgaWRlYWxseSBiZSBoYW5kbGVkIGJ5IHRoZSBlZGl0Zmxvdy9yb3V0aW5nIHdpdGhvdXQgdGhlIG5lZWQgdG8gaGF2ZSB0aGlzIG1ldGhvZCBpbiB0aGVcblx0Ly8gb2JqZWN0IHBhZ2UgLSBmb3Igbm93IGtlZXAgaXQgaGVyZVxuXHRjcmVhdGVEZWZlcnJlZENvbnRleHQoc1BhdGg6IGFueSwgb0xpc3RCaW5kaW5nOiBhbnksIGJBY3Rpb25DcmVhdGU6IGFueSkge1xuXHRcdGlmICghdGhpcy5EZWZlcnJlZENvbnRleHRDcmVhdGVkKSB7XG5cdFx0XHR0aGlzLkRlZmVycmVkQ29udGV4dENyZWF0ZWQgPSB0cnVlO1xuXHRcdFx0Y29uc3Qgb1BhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdFwiJCRncm91cElkXCI6IFwiJGF1dG8uSGVyb2VzXCIsXG5cdFx0XHRcdFwiJCR1cGRhdGVHcm91cElkXCI6IFwiJGF1dG9cIlxuXHRcdFx0fTtcblx0XHRcdC8vIEluIGZ1bGxzY3JlZW4gbW9kZSwgd2UgcmVjcmVhdGUgdGhlIGxpc3QgYmluZGluZywgYXMgd2UgZG9uJ3Qgd2FudCB0byBoYXZlIHN5bmNocm9uaXphdGlvbiBiZXR3ZWVuIHZpZXdzXG5cdFx0XHQvLyAoaXQgY2F1c2VzIGVycm9ycywgZS5nLiBwZW5kaW5nIGNoYW5nZXMgZHVlIHRvIGNyZWF0aW9uUm93KVxuXHRcdFx0aWYgKFxuXHRcdFx0XHQhb0xpc3RCaW5kaW5nIHx8XG5cdFx0XHRcdChvTGlzdEJpbmRpbmcuaXNSZWxhdGl2ZSgpID09PSBmYWxzZSAmJiAhKHRoaXMub0FwcENvbXBvbmVudC5nZXRSb290Vmlld0NvbnRyb2xsZXIoKSBhcyBhbnkpLmlzRmNsRW5hYmxlZCgpKVxuXHRcdFx0KSB7XG5cdFx0XHRcdG9MaXN0QmluZGluZyA9IG5ldyAoT0RhdGFMaXN0QmluZGluZyBhcyBhbnkpKFxuXHRcdFx0XHRcdHRoaXMuZ2V0TW9kZWwoKSxcblx0XHRcdFx0XHRzUGF0aC5yZXBsYWNlKFwiKC4uLilcIiwgXCJcIiksXG5cdFx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0b1BhcmFtZXRlcnNcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHRcdGNvbnN0IG9TdGFydFVwUGFyYW1zID1cblx0XHRcdFx0XHR0aGlzLm9BcHBDb21wb25lbnQgJiYgdGhpcy5vQXBwQ29tcG9uZW50LmdldENvbXBvbmVudERhdGEoKSAmJiB0aGlzLm9BcHBDb21wb25lbnQuZ2V0Q29tcG9uZW50RGF0YSgpLnN0YXJ0dXBQYXJhbWV0ZXJzLFxuXHRcdFx0XHRvSW5ib3VuZFBhcmFtZXRlcnMgPSB0aGlzLmdldFZpZXdEYXRhKCkuaW5ib3VuZFBhcmFtZXRlcnM7XG5cdFx0XHRsZXQgY3JlYXRlUGFyYW1zO1xuXHRcdFx0aWYgKG9TdGFydFVwUGFyYW1zICYmIG9TdGFydFVwUGFyYW1zLnByZWZlcnJlZE1vZGUgJiYgb1N0YXJ0VXBQYXJhbXMucHJlZmVycmVkTW9kZVswXS5pbmRleE9mKFwiY3JlYXRlXCIpICE9PSAtMSkge1xuXHRcdFx0XHRjcmVhdGVQYXJhbXMgPSBDb21tb25VdGlscy5nZXRBZGRpdGlvbmFsUGFyYW1zRm9yQ3JlYXRlKG9TdGFydFVwUGFyYW1zLCBvSW5ib3VuZFBhcmFtZXRlcnMpO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBmb3Igbm93IHdhaXQgdW50aWwgdGhlIHZpZXcgYW5kIHRoZSBjb250cm9sbGVyIGlzIGNyZWF0ZWRcblx0XHRcdCh0aGlzLmdldFJvb3RDb250cm9sKCkgYXMgYW55KVxuXHRcdFx0XHQuZ2V0Q29udHJvbGxlcigpXG5cdFx0XHRcdC5lZGl0Rmxvdy5jcmVhdGVEb2N1bWVudChvTGlzdEJpbmRpbmcsIHtcblx0XHRcdFx0XHRjcmVhdGlvbk1vZGU6IENyZWF0aW9uTW9kZS5TeW5jLFxuXHRcdFx0XHRcdGNyZWF0ZUFjdGlvbjogYkFjdGlvbkNyZWF0ZSxcblx0XHRcdFx0XHRkYXRhOiBjcmVhdGVQYXJhbXMsXG5cdFx0XHRcdFx0YkZyb21EZWZlcnJlZDogdHJ1ZVxuXHRcdFx0XHR9KVxuXHRcdFx0XHQuZmluYWxseSgoKSA9PiB7XG5cdFx0XHRcdFx0dGhpcy5EZWZlcnJlZENvbnRleHRDcmVhdGVkID0gZmFsc2U7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Ly8gRG8gTm90aGluZyA/XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHNldFZhcmlhbnRNYW5hZ2VtZW50KHNWYXJpYW50TWFuYWdlbWVudDogYW55KSB7XG5cdFx0aWYgKHNWYXJpYW50TWFuYWdlbWVudCA9PT0gVmFyaWFudE1hbmFnZW1lbnQuUGFnZSkge1xuXHRcdFx0TG9nLmVycm9yKFwiT2JqZWN0UGFnZSBkb2VzIG5vdCBzdXBwb3J0IFBhZ2UtbGV2ZWwgdmFyaWFudCBtYW5hZ2VtZW50IHlldFwiKTtcblx0XHRcdHNWYXJpYW50TWFuYWdlbWVudCA9IFZhcmlhbnRNYW5hZ2VtZW50Lk5vbmU7XG5cdFx0fVxuXG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcInZhcmlhbnRNYW5hZ2VtZW50XCIsIHNWYXJpYW50TWFuYWdlbWVudCk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgT2JqZWN0UGFnZUNvbXBvbmVudDtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztFQVFBLElBQU1BLGlCQUFpQixHQUFHQyxXQUFXLENBQUNELGlCQUFpQjtJQUN0REUsWUFBWSxHQUFHRCxXQUFXLENBQUNDLFlBQVk7RUFDeEMsSUFBTUMsYUFBYSxHQUFHQyxXQUFXLENBQUNDLFVBQVUsQ0FBQ0YsYUFBYTtFQUFDLElBRXJERyxtQkFBbUIsV0FEeEJDLGNBQWMsQ0FBQyx1Q0FBdUMsRUFBRTtJQUFFQyxPQUFPLEVBQUUsa0JBQWtCO0lBQUVDLFFBQVEsRUFBRTtFQUFPLENBQUMsQ0FBQyxVQVF6R0MsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSwrQkFBK0I7SUFDckNDLFlBQVksRUFBRVosaUJBQWlCLENBQUNhO0VBQ2pDLENBQUMsQ0FBQyxVQU9ESCxRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLDJDQUEyQztJQUNqREMsWUFBWSxFQUFFVCxhQUFhLENBQUNXO0VBQzdCLENBQUMsQ0FBQyxVQUtESixRQUFRLENBQUM7SUFDVEMsSUFBSSxFQUFFLFNBQVM7SUFDZkMsWUFBWSxFQUFFO0VBQ2YsQ0FBQyxDQUFDLFVBR0RGLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFLNUJELFFBQVEsQ0FBQztJQUNUQyxJQUFJLEVBQUUsU0FBUztJQUNmQyxZQUFZLEVBQUU7RUFDZixDQUFDLENBQUMsVUFLREYsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxTQUFTO0lBQ2ZDLFlB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