/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/fe/macros/ResourceModel", "sap/m/BusyDialog", "./FieldWrapper"], function (CommonUtils, ClassSupport, ResourceModel, BusyDialog, FieldWrapper) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var FileWrapper = (_dec = defineUI5Class("sap.fe.core.controls.FileWrapper"), _dec2 = property({
    type: "sap.ui.core.URI"
  }), _dec3 = property({
    type: "sap.ui.model.Context"
  }), _dec4 = property({
    type: "sap.ui.model.Context"
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "string"
  }), _dec7 = property({
    type: "string"
  }), _dec8 = aggregation({
    type: "sap.m.Avatar",
    multiple: false
  }), _dec9 = aggregation({
    type: "sap.ui.core.Icon",
    multiple: false
  }), _dec10 = aggregation({
    type: "sap.m.Link",
    multiple: false
  }), _dec11 = aggregation({
    type: "sap.m.Text",
    multiple: false
  }), _dec12 = aggregation({
    type: "sap.ui.unified.FileUploader",
    multiple: false
  }), _dec13 = aggregation({
    type: "sap.m.Button",
    multiple: false
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_FieldWrapper) {
    _inheritsLoose(FileWrapper, _FieldWrapper);
    function FileWrapper() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _FieldWrapper.call.apply(_FieldWrapper, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "uploadUrl", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "parentEntitySet", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "parentEntityType", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "propertyPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filename", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "mediaType", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "avatar", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "icon", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "link", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "text", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "fileUploader", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "deleteButton", _descriptor12, _assertThisInitialized(_this));
      _this._busy = false;
      return _this;
    }
    var _proto = FileWrapper.prototype;
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      var accInfo = [];
      if (this.avatar) {
        accInfo.push(this.avatar);
      }
      if (this.icon) {
        accInfo.push(this.icon);
      }
      if (this.link) {
        accInfo.push(this.link);
      }
      if (this.text) {
        accInfo.push(this.text);
      }
      if (this.fileUploader) {
        accInfo.push(this.fileUploader);
      }
      if (this.deleteButton) {
        accInfo.push(this.deleteButton);
      }
      return {
        children: accInfo
      };
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      this._setAriaLabels();
      this._addSideEffects();
    };
    _proto._setAriaLabels = function _setAriaLabels() {
      this._setAriaLabelledBy(this.avatar);
      this._setAriaLabelledBy(this.icon);
      this._setAriaLabelledBy(this.link);
      this._setAriaLabelledBy(this.text);
      this._setAriaLabelledBy(this.fileUploader);
      this._setAriaLabelledBy(this.deleteButton);
    };
    _proto._addSideEffects = function _addSideEffects() {
      // add SideEffects for stream content, filename and mediatype
      var sourceProperty = "",
        sourcePath = "",
        path = "",
        parentEntitySetWithSlash = "";
      var navigationProperties = [];
      this.getCustomData().forEach(function (item) {
        if (item.getProperty("key") === "sourcePath") {
          sourcePath = item.getProperty("value");
        }
      });
      parentEntitySetWithSlash = "/".concat(this.parentEntitySet, "/");
      sourceProperty = sourcePath.substring(sourcePath.indexOf(parentEntitySetWithSlash) + parentEntitySetWithSlash.length, sourcePath.length);
      path = sourceProperty.replace(this.propertyPath, "");
      navigationProperties.push({
        "$NavigationPropertyPath": sourceProperty
      });
      if (this.filename) {
        navigationProperties.push({
          "$NavigationPropertyPath": path + this.filename
        });
      }
      if (this.mediaType) {
        navigationProperties.push({
          "$NavigationPropertyPath": path + this.mediaType
        });
      }
      this._getSideEffectController().addControlSideEffects(this.parentEntityType, {
        SourceProperties: sourceProperty,
        TargetEntities: navigationProperties,
        sourceControlId: this.getId()
      });
    };
    _proto._getSideEffectController = function _getSideEffectController() {
      var controller = this._getViewController();
      return controller ? controller._sideEffects : undefined;
    };
    _proto._getViewController = function _getViewController() {
      var view = CommonUtils.getTargetView(this);
      return view && view.getController();
    };
    _proto.getUploadUrl = function getUploadUrl() {
      // set upload url as canonical url for NavigationProperties
      // this is a workaround as some backends cannot resolve NavigationsProperties for stream types
      var context = this.getBindingContext();
      return context && this.uploadUrl ? this.uploadUrl.replace(context.getPath(), context.getCanonicalPath()) : "";
    };
    _proto.setUIBusy = function setUIBusy(busy) {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      this._busy = busy;
      if (busy) {
        if (!this.busyDialog) {
          this.busyDialog = new BusyDialog({
            text: ResourceModel.getText("M_FILEWRAPPER_BUSY_DIALOG_TITLE"),
            showCancelButton: false
          });
        }
        setTimeout(function () {
          if (that._busy) {
            var _that$busyDialog;
            (_that$busyDialog = that.busyDialog) === null || _that$busyDialog === void 0 ? void 0 : _that$busyDialog.open();
          }
        }, 1000);
      } else {
        var _this$busyDialog;
        (_this$busyDialog = this.busyDialog) === null || _this$busyDialog === void 0 ? void 0 : _this$busyDialog.close(false);
      }
    };
    _proto.getUIBusy = function getUIBusy() {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      return this._busy;
    };
    FileWrapper.render = function render(renderManager, fileWrapper) {
      renderManager.openStart("div", fileWrapper); // FileWrapper control div
      renderManager.style("width", fileWrapper.width);
      renderManager.openEnd();

      // Outer Box
      renderManager.openStart("div"); // div for all controls
      renderManager.style("display", "flex");
      renderManager.style("box-sizing", "border-box");
      renderManager.style("justify-content", "space-between");
      renderManager.style("align-items", "center");
      renderManager.style("flex-wrap", "wrap");
      renderManager.style("align-content", "stretch");
      renderManager.style("width", "100%");
      renderManager.openEnd();

      // Display Mode
      renderManager.openStart("div"); // div for controls shown in Display mode
      renderManager.style("display", "flex");
      renderManager.style("align-items", "center");
      renderManager.openEnd();
      if (fileWrapper.avatar) {
        renderManager.renderControl(fileWrapper.avatar); // render the Avatar Control
      } else {
        renderManager.renderControl(fileWrapper.icon); // render the Icon Control
        renderManager.renderControl(fileWrapper.link); // render the Link Control
        renderManager.renderControl(fileWrapper.text); // render the Text Control for empty file indication
      }

      renderManager.close("div"); // div for controls shown in Display mode

      // Additional content for Edit Mode
      renderManager.openStart("div"); // div for controls shown in Display + Edit mode
      renderManager.style("display", "flex");
      renderManager.style("align-items", "center");
      renderManager.openEnd();
      renderManager.renderControl(fileWrapper.fileUploader); // render the FileUploader Control
      renderManager.renderControl(fileWrapper.deleteButton); // render the Delete Button Control
      renderManager.close("div"); // div for controls shown in Display + Edit mode

      renderManager.close("div"); // div for all controls

      renderManager.close("div"); // end of the complete Control
    };
    _proto.destroy = function destroy(bSuppressInvalidate) {
      var oSideEffects = this._getSideEffectController();
      if (oSideEffects) {
        oSideEffects.removeControlSideEffects(this);
      }
      delete this.busyDialog;
      FieldWrapper.prototype.destroy.apply(this, [bSuppressInvalidate]);
    };
    return FileWrapper;
  }(FieldWrapper), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "uploadUrl", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "parentEntitySet", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "parentEntityType", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "propertyPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "filename", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "mediaType", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "avatar", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "icon", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "link", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "text", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "fileUploader", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "deleteButton", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return FileWrapper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWxlV3JhcHBlciIsImRlZmluZVVJNUNsYXNzIiwicHJvcGVydHkiLCJ0eXBlIiwiYWdncmVnYXRpb24iLCJtdWx0aXBsZSIsIl9idXN5IiwiZ2V0QWNjZXNzaWJpbGl0eUluZm8iLCJhY2NJbmZvIiwiYXZhdGFyIiwicHVzaCIsImljb24iLCJsaW5rIiwidGV4dCIsImZpbGVVcGxvYWRlciIsImRlbGV0ZUJ1dHRvbiIsImNoaWxkcmVuIiwib25CZWZvcmVSZW5kZXJpbmciLCJfc2V0QXJpYUxhYmVscyIsIl9hZGRTaWRlRWZmZWN0cyIsIl9zZXRBcmlhTGFiZWxsZWRCeSIsInNvdXJjZVByb3BlcnR5Iiwic291cmNlUGF0aCIsInBhdGgiLCJwYXJlbnRFbnRpdHlTZXRXaXRoU2xhc2giLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsImdldEN1c3RvbURhdGEiLCJmb3JFYWNoIiwiaXRlbSIsImdldFByb3BlcnR5IiwicGFyZW50RW50aXR5U2V0Iiwic3Vic3RyaW5nIiwiaW5kZXhPZiIsImxlbmd0aCIsInJlcGxhY2UiLCJwcm9wZXJ0eVBhdGgiLCJmaWxlbmFtZSIsIm1lZGlhVHlwZSIsIl9nZXRTaWRlRWZmZWN0Q29udHJvbGxlciIsImFkZENvbnRyb2xTaWRlRWZmZWN0cyIsInBhcmVudEVudGl0eVR5cGUiLCJTb3VyY2VQcm9wZXJ0aWVzIiwiVGFyZ2V0RW50aXRpZXMiLCJzb3VyY2VDb250cm9sSWQiLCJnZXRJZCIsImNvbnRyb2xsZXIiLCJfZ2V0Vmlld0NvbnRyb2xsZXIiLCJfc2lkZUVmZmVjdHMiLCJ1bmRlZmluZWQiLCJ2aWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwiZ2V0Q29udHJvbGxlciIsImdldFVwbG9hZFVybCIsImNvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsInVwbG9hZFVybCIsImdldFBhdGgiLCJnZXRDYW5vbmljYWxQYXRoIiwic2V0VUlCdXN5IiwiYnVzeSIsInRoYXQiLCJidXN5RGlhbG9nIiwiQnVzeURpYWxvZyIsIlJlc291cmNlTW9kZWwiLCJnZXRUZXh0Iiwic2hvd0NhbmNlbEJ1dHRvbiIsInNldFRpbWVvdXQiLCJvcGVuIiwiY2xvc2UiLCJnZXRVSUJ1c3kiLCJyZW5kZXIiLCJyZW5kZXJNYW5hZ2VyIiwiZmlsZVdyYXBwZXIiLCJvcGVuU3RhcnQiLCJzdHlsZSIsIndpZHRoIiwib3BlbkVuZCIsInJlbmRlckNvbnRyb2wiLCJkZXN0cm95IiwiYlN1cHByZXNzSW52YWxpZGF0ZSIsIm9TaWRlRWZmZWN0cyIsInJlbW92ZUNvbnRyb2xTaWRlRWZmZWN0cyIsIkZpZWxkV3JhcHBlciIsInByb3RvdHlwZSIsImFwcGx5Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWxlV3JhcHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIHByb3BlcnR5IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBBdmF0YXIgZnJvbSBcInNhcC9tL0F2YXRhclwiO1xuaW1wb3J0IEJ1c3lEaWFsb2cgZnJvbSBcInNhcC9tL0J1c3lEaWFsb2dcIjtcbmltcG9ydCB0eXBlIEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgdHlwZSBMaW5rIGZyb20gXCJzYXAvbS9MaW5rXCI7XG5pbXBvcnQgdHlwZSBUZXh0IGZyb20gXCJzYXAvbS9UZXh0XCI7XG5pbXBvcnQgdHlwZSBJY29uIGZyb20gXCJzYXAvdWkvY29yZS9JY29uXCI7XG5pbXBvcnQgdHlwZSB7IFVSSSB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBSZW5kZXJNYW5hZ2VyIGZyb20gXCJzYXAvdWkvY29yZS9SZW5kZXJNYW5hZ2VyXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgVjRDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgRmlsZVVwbG9hZGVyIGZyb20gXCJzYXAvdWkvdW5pZmllZC9GaWxlVXBsb2FkZXJcIjtcbmltcG9ydCBGaWVsZFdyYXBwZXIgZnJvbSBcIi4vRmllbGRXcmFwcGVyXCI7XG5cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xzLkZpbGVXcmFwcGVyXCIpXG5jbGFzcyBGaWxlV3JhcHBlciBleHRlbmRzIEZpZWxkV3JhcHBlciB7XG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic2FwLnVpLmNvcmUuVVJJXCIgfSlcblx0dXBsb2FkVXJsITogVVJJO1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIgfSlcblx0cGFyZW50RW50aXR5U2V0ITogQ29udGV4dDtcblx0QHByb3BlcnR5KHsgdHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiIH0pXG5cdHBhcmVudEVudGl0eVR5cGUhOiBDb250ZXh0O1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHByb3BlcnR5UGF0aCE6IHN0cmluZztcblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRmaWxlbmFtZSE6IHN0cmluZztcblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRtZWRpYVR5cGUhOiBzdHJpbmc7XG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLm0uQXZhdGFyXCIsIG11bHRpcGxlOiBmYWxzZSB9KVxuXHRhdmF0YXIhOiBBdmF0YXI7XG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLnVpLmNvcmUuSWNvblwiLCBtdWx0aXBsZTogZmFsc2UgfSlcblx0aWNvbiE6IEljb247XG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLm0uTGlua1wiLCBtdWx0aXBsZTogZmFsc2UgfSlcblx0bGluayE6IExpbms7XG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLm0uVGV4dFwiLCBtdWx0aXBsZTogZmFsc2UgfSlcblx0dGV4dCE6IFRleHQ7XG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLnVpLnVuaWZpZWQuRmlsZVVwbG9hZGVyXCIsIG11bHRpcGxlOiBmYWxzZSB9KVxuXHRmaWxlVXBsb2FkZXIhOiBGaWxlVXBsb2FkZXI7XG5cdEBhZ2dyZWdhdGlvbih7IHR5cGU6IFwic2FwLm0uQnV0dG9uXCIsIG11bHRpcGxlOiBmYWxzZSB9KVxuXHRkZWxldGVCdXR0b24hOiBCdXR0b247XG5cdHByaXZhdGUgX2J1c3k6IGJvb2xlYW4gPSBmYWxzZTtcblx0cHJpdmF0ZSBidXN5RGlhbG9nPzogQnVzeURpYWxvZztcblxuXHRnZXRBY2Nlc3NpYmlsaXR5SW5mbygpIHtcblx0XHRjb25zdCBhY2NJbmZvID0gW107XG5cdFx0aWYgKHRoaXMuYXZhdGFyKSB7XG5cdFx0XHRhY2NJbmZvLnB1c2godGhpcy5hdmF0YXIpO1xuXHRcdH1cblx0XHRpZiAodGhpcy5pY29uKSB7XG5cdFx0XHRhY2NJbmZvLnB1c2godGhpcy5pY29uKTtcblx0XHR9XG5cdFx0aWYgKHRoaXMubGluaykge1xuXHRcdFx0YWNjSW5mby5wdXNoKHRoaXMubGluayk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLnRleHQpIHtcblx0XHRcdGFjY0luZm8ucHVzaCh0aGlzLnRleHQpO1xuXHRcdH1cblx0XHRpZiAodGhpcy5maWxlVXBsb2FkZXIpIHtcblx0XHRcdGFjY0luZm8ucHVzaCh0aGlzLmZpbGVVcGxvYWRlcik7XG5cdFx0fVxuXHRcdGlmICh0aGlzLmRlbGV0ZUJ1dHRvbikge1xuXHRcdFx0YWNjSW5mby5wdXNoKHRoaXMuZGVsZXRlQnV0dG9uKTtcblx0XHR9XG5cdFx0cmV0dXJuIHsgY2hpbGRyZW46IGFjY0luZm8gfTtcblx0fVxuXG5cdG9uQmVmb3JlUmVuZGVyaW5nKCkge1xuXHRcdHRoaXMuX3NldEFyaWFMYWJlbHMoKTtcblx0XHR0aGlzLl9hZGRTaWRlRWZmZWN0cygpO1xuXHR9XG5cblx0X3NldEFyaWFMYWJlbHMoKSB7XG5cdFx0dGhpcy5fc2V0QXJpYUxhYmVsbGVkQnkodGhpcy5hdmF0YXIpO1xuXHRcdHRoaXMuX3NldEFyaWFMYWJlbGxlZEJ5KHRoaXMuaWNvbik7XG5cdFx0dGhpcy5fc2V0QXJpYUxhYmVsbGVkQnkodGhpcy5saW5rKTtcblx0XHR0aGlzLl9zZXRBcmlhTGFiZWxsZWRCeSh0aGlzLnRleHQpO1xuXHRcdHRoaXMuX3NldEFyaWFMYWJlbGxlZEJ5KHRoaXMuZmlsZVVwbG9hZGVyKTtcblx0XHR0aGlzLl9zZXRBcmlhTGFiZWxsZWRCeSh0aGlzLmRlbGV0ZUJ1dHRvbik7XG5cdH1cblxuXHRfYWRkU2lkZUVmZmVjdHMoKSB7XG5cdFx0Ly8gYWRkIFNpZGVFZmZlY3RzIGZvciBzdHJlYW0gY29udGVudCwgZmlsZW5hbWUgYW5kIG1lZGlhdHlwZVxuXHRcdGxldCBzb3VyY2VQcm9wZXJ0eSA9IFwiXCIsXG5cdFx0XHRzb3VyY2VQYXRoID0gXCJcIixcblx0XHRcdHBhdGggPSBcIlwiLFxuXHRcdFx0cGFyZW50RW50aXR5U2V0V2l0aFNsYXNoID0gXCJcIjtcblx0XHRjb25zdCBuYXZpZ2F0aW9uUHJvcGVydGllczogb2JqZWN0W10gPSBbXTtcblx0XHR0aGlzLmdldEN1c3RvbURhdGEoKS5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtOiBhbnkpIHtcblx0XHRcdGlmIChpdGVtLmdldFByb3BlcnR5KFwia2V5XCIpID09PSBcInNvdXJjZVBhdGhcIikge1xuXHRcdFx0XHRzb3VyY2VQYXRoID0gaXRlbS5nZXRQcm9wZXJ0eShcInZhbHVlXCIpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHBhcmVudEVudGl0eVNldFdpdGhTbGFzaCA9IGAvJHt0aGlzLnBhcmVudEVudGl0eVNldH0vYDtcblx0XHRzb3VyY2VQcm9wZXJ0eSA9IHNvdXJjZVBhdGguc3Vic3RyaW5nKFxuXHRcdFx0c291cmNlUGF0aC5pbmRleE9mKHBhcmVudEVudGl0eVNldFdpdGhTbGFzaCkgKyBwYXJlbnRFbnRpdHlTZXRXaXRoU2xhc2gubGVuZ3RoLFxuXHRcdFx0c291cmNlUGF0aC5sZW5ndGhcblx0XHQpO1xuXHRcdHBhdGggPSBzb3VyY2VQcm9wZXJ0eS5yZXBsYWNlKHRoaXMucHJvcGVydHlQYXRoLCBcIlwiKTtcblx0XHRuYXZpZ2F0aW9uUHJvcGVydGllcy5wdXNoKHsgXCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiOiBzb3VyY2VQcm9wZXJ0eSB9KTtcblx0XHRpZiAodGhpcy5maWxlbmFtZSkge1xuXHRcdFx0bmF2aWdhdGlvblByb3BlcnRpZXMucHVzaCh7IFwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIjogcGF0aCArIHRoaXMuZmlsZW5hbWUgfSk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLm1lZGlhVHlwZSkge1xuXHRcdFx0bmF2aWdhdGlvblByb3BlcnRpZXMucHVzaCh7IFwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIjogcGF0aCArIHRoaXMubWVkaWFUeXBlIH0pO1xuXHRcdH1cblx0XHR0aGlzLl9nZXRTaWRlRWZmZWN0Q29udHJvbGxlcigpLmFkZENvbnRyb2xTaWRlRWZmZWN0cyh0aGlzLnBhcmVudEVudGl0eVR5cGUsIHtcblx0XHRcdFNvdXJjZVByb3BlcnRpZXM6IHNvdXJjZVByb3BlcnR5LFxuXHRcdFx0VGFyZ2V0RW50aXRpZXM6IG5hdmlnYXRpb25Qcm9wZXJ0aWVzLFxuXHRcdFx0c291cmNlQ29udHJvbElkOiB0aGlzLmdldElkKClcblx0XHR9KTtcblx0fVxuXHRfZ2V0U2lkZUVmZmVjdENvbnRyb2xsZXIoKSB7XG5cdFx0Y29uc3QgY29udHJvbGxlciA9IHRoaXMuX2dldFZpZXdDb250cm9sbGVyKCk7XG5cdFx0cmV0dXJuIGNvbnRyb2xsZXIgPyBjb250cm9sbGVyLl9zaWRlRWZmZWN0cyA6IHVuZGVmaW5lZDtcblx0fVxuXHRfZ2V0Vmlld0NvbnRyb2xsZXIoKSB7XG5cdFx0Y29uc3QgdmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcodGhpcyk7XG5cdFx0cmV0dXJuIHZpZXcgJiYgdmlldy5nZXRDb250cm9sbGVyKCk7XG5cdH1cblx0Z2V0VXBsb2FkVXJsKCkge1xuXHRcdC8vIHNldCB1cGxvYWQgdXJsIGFzIGNhbm9uaWNhbCB1cmwgZm9yIE5hdmlnYXRpb25Qcm9wZXJ0aWVzXG5cdFx0Ly8gdGhpcyBpcyBhIHdvcmthcm91bmQgYXMgc29tZSBiYWNrZW5kcyBjYW5ub3QgcmVzb2x2ZSBOYXZpZ2F0aW9uc1Byb3BlcnRpZXMgZm9yIHN0cmVhbSB0eXBlc1xuXHRcdGNvbnN0IGNvbnRleHQgPSB0aGlzLmdldEJpbmRpbmdDb250ZXh0KCkgYXMgVjRDb250ZXh0O1xuXHRcdHJldHVybiBjb250ZXh0ICYmIHRoaXMudXBsb2FkVXJsID8gdGhpcy51cGxvYWRVcmwucmVwbGFjZShjb250ZXh0LmdldFBhdGgoKSwgY29udGV4dC5nZXRDYW5vbmljYWxQYXRoKCkpIDogXCJcIjtcblx0fVxuXHRzZXRVSUJ1c3koYnVzeTogYm9vbGVhbikge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuXHRcdGNvbnN0IHRoYXQgPSB0aGlzO1xuXHRcdHRoaXMuX2J1c3kgPSBidXN5O1xuXHRcdGlmIChidXN5KSB7XG5cdFx0XHRpZiAoIXRoaXMuYnVzeURpYWxvZykge1xuXHRcdFx0XHR0aGlzLmJ1c3lEaWFsb2cgPSBuZXcgQnVzeURpYWxvZyh7XG5cdFx0XHRcdFx0dGV4dDogUmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwiTV9GSUxFV1JBUFBFUl9CVVNZX0RJQUxPR19USVRMRVwiKSxcblx0XHRcdFx0XHRzaG93Q2FuY2VsQnV0dG9uOiBmYWxzZVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRpZiAodGhhdC5fYnVzeSkge1xuXHRcdFx0XHRcdHRoYXQuYnVzeURpYWxvZz8ub3BlbigpO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCAxMDAwKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5idXN5RGlhbG9nPy5jbG9zZShmYWxzZSk7XG5cdFx0fVxuXHR9XG5cdGdldFVJQnVzeSgpIHtcblx0XHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXRoaXMtYWxpYXNcblx0XHRyZXR1cm4gdGhpcy5fYnVzeTtcblx0fVxuXHRzdGF0aWMgcmVuZGVyKHJlbmRlck1hbmFnZXI6IFJlbmRlck1hbmFnZXIsIGZpbGVXcmFwcGVyOiBGaWxlV3JhcHBlcikge1xuXHRcdHJlbmRlck1hbmFnZXIub3BlblN0YXJ0KFwiZGl2XCIsIGZpbGVXcmFwcGVyKTsgLy8gRmlsZVdyYXBwZXIgY29udHJvbCBkaXZcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwid2lkdGhcIiwgZmlsZVdyYXBwZXIud2lkdGgpO1xuXHRcdHJlbmRlck1hbmFnZXIub3BlbkVuZCgpO1xuXG5cdFx0Ly8gT3V0ZXIgQm94XG5cdFx0cmVuZGVyTWFuYWdlci5vcGVuU3RhcnQoXCJkaXZcIik7IC8vIGRpdiBmb3IgYWxsIGNvbnRyb2xzXG5cdFx0cmVuZGVyTWFuYWdlci5zdHlsZShcImRpc3BsYXlcIiwgXCJmbGV4XCIpO1xuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJib3gtc2l6aW5nXCIsIFwiYm9yZGVyLWJveFwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwianVzdGlmeS1jb250ZW50XCIsIFwic3BhY2UtYmV0d2VlblwiKTtcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwiYWxpZ24taXRlbXNcIiwgXCJjZW50ZXJcIik7XG5cdFx0cmVuZGVyTWFuYWdlci5zdHlsZShcImZsZXgtd3JhcFwiLCBcIndyYXBcIik7XG5cdFx0cmVuZGVyTWFuYWdlci5zdHlsZShcImFsaWduLWNvbnRlbnRcIiwgXCJzdHJldGNoXCIpO1xuXHRcdHJlbmRlck1hbmFnZXIuc3R5bGUoXCJ3aWR0aFwiLCBcIjEwMCVcIik7XG5cdFx0cmVuZGVyTWFuYWdlci5vcGVuRW5kKCk7XG5cblx0XHQvLyBEaXNwbGF5IE1vZGVcblx0XHRyZW5kZXJNYW5hZ2VyLm9wZW5TdGFydChcImRpdlwiKTsgLy8gZGl2IGZvciBjb250cm9scyBzaG93biBpbiBEaXNwbGF5IG1vZGVcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwiZGlzcGxheVwiLCBcImZsZXhcIik7XG5cdFx0cmVuZGVyTWFuYWdlci5zdHlsZShcImFsaWduLWl0ZW1zXCIsIFwiY2VudGVyXCIpO1xuXHRcdHJlbmRlck1hbmFnZXIub3BlbkVuZCgpO1xuXG5cdFx0aWYgKGZpbGVXcmFwcGVyLmF2YXRhcikge1xuXHRcdFx0cmVuZGVyTWFuYWdlci5yZW5kZXJDb250cm9sKGZpbGVXcmFwcGVyLmF2YXRhcik7IC8vIHJlbmRlciB0aGUgQXZhdGFyIENvbnRyb2xcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmVuZGVyTWFuYWdlci5yZW5kZXJDb250cm9sKGZpbGVXcmFwcGVyLmljb24pOyAvLyByZW5kZXIgdGhlIEljb24gQ29udHJvbFxuXHRcdFx0cmVuZGVyTWFuYWdlci5yZW5kZXJDb250cm9sKGZpbGVXcmFwcGVyLmxpbmspOyAvLyByZW5kZXIgdGhlIExpbmsgQ29udHJvbFxuXHRcdFx0cmVuZGVyTWFuYWdlci5yZW5kZXJDb250cm9sKGZpbGVXcmFwcGVyLnRleHQpOyAvLyByZW5kZXIgdGhlIFRleHQgQ29udHJvbCBmb3IgZW1wdHkgZmlsZSBpbmRpY2F0aW9uXG5cdFx0fVxuXHRcdHJlbmRlck1hbmFnZXIuY2xvc2UoXCJkaXZcIik7IC8vIGRpdiBmb3IgY29udHJvbHMgc2hvd24gaW4gRGlzcGxheSBtb2RlXG5cblx0XHQvLyBBZGRpdGlvbmFsIGNvbnRlbnQgZm9yIEVkaXQgTW9kZVxuXHRcdHJlbmRlck1hbmFnZXIub3BlblN0YXJ0KFwiZGl2XCIpOyAvLyBkaXYgZm9yIGNvbnRyb2xzIHNob3duIGluIERpc3BsYXkgKyBFZGl0IG1vZGVcblx0XHRyZW5kZXJNYW5hZ2VyLnN0eWxlKFwiZGlzcGxheVwiLCBcImZsZXhcIik7XG5cdFx0cmVuZGVyTWFuYWdlci5zdHlsZShcImFsaWduLWl0ZW1zXCIsIFwiY2VudGVyXCIpO1xuXHRcdHJlbmRlck1hbmFnZXIub3BlbkVuZCgpO1xuXHRcdHJlbmRlck1hbmFnZXIucmVuZGVyQ29udHJvbChmaWxlV3JhcHBlci5maWxlVXBsb2FkZXIpOyAvLyByZW5kZXIgdGhlIEZpbGVVcGxvYWRlciBDb250cm9sXG5cdFx0cmVuZGVyTWFuYWdlci5yZW5kZXJDb250cm9sKGZpbGVXcmFwcGVyLmRlbGV0ZUJ1dHRvbik7IC8vIHJlbmRlciB0aGUgRGVsZXRlIEJ1dHRvbiBDb250cm9sXG5cdFx0cmVuZGVyTWFuYWdlci5jbG9zZShcImRpdlwiKTsgLy8gZGl2IGZvciBjb250cm9scyBzaG93biBpbiBEaXNwbGF5ICsgRWRpdCBtb2RlXG5cblx0XHRyZW5kZXJNYW5hZ2VyLmNsb3NlKFwiZGl2XCIpOyAvLyBkaXYgZm9yIGFsbCBjb250cm9sc1xuXG5cdFx0cmVuZGVyTWFuYWdlci5jbG9zZShcImRpdlwiKTsgLy8gZW5kIG9mIHRoZSBjb21wbGV0ZSBDb250cm9sXG5cdH1cblx0ZGVzdHJveShiU3VwcHJlc3NJbnZhbGlkYXRlOiBib29sZWFuKSB7XG5cdFx0Y29uc3Qgb1NpZGVFZmZlY3RzID0gdGhpcy5fZ2V0U2lkZUVmZmVjdENvbnRyb2xsZXIoKTtcblx0XHRpZiAob1NpZGVFZmZlY3RzKSB7XG5cdFx0XHRvU2lkZUVmZmVjdHMucmVtb3ZlQ29udHJvbFNpZGVFZmZlY3RzKHRoaXMpO1xuXHRcdH1cblx0XHRkZWxldGUgdGhpcy5idXN5RGlhbG9nO1xuXHRcdEZpZWxkV3JhcHBlci5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzLCBbYlN1cHByZXNzSW52YWxpZGF0ZV0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZpbGVXcmFwcGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7OztNQWlCTUEsV0FBVyxXQURoQkMsY0FBYyxDQUFDLGtDQUFrQyxDQUFDLFVBRWpEQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQWtCLENBQUMsQ0FBQyxVQUVyQ0QsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUF1QixDQUFDLENBQUMsVUFFMUNELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBdUIsQ0FBQyxDQUFDLFVBRTFDRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRTVCQyxXQUFXLENBQUM7SUFBRUQsSUFBSSxFQUFFLGNBQWM7SUFBRUUsUUFBUSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFVBRXRERCxXQUFXLENBQUM7SUFBRUQsSUFBSSxFQUFFLGtCQUFrQjtJQUFFRSxRQUFRLEVBQUU7RUFBTSxDQUFDLENBQUMsV0FFMURELFdBQVcsQ0FBQztJQUFFRCxJQUFJLEVBQUUsWUFBWTtJQUFFRSxRQUFRLEVBQUU7RUFBTSxDQUFDLENBQUMsV0FFcERELFdBQVcsQ0FBQztJQUFFRCxJQUFJLEVBQUUsWUFBWTtJQUFFRSxRQUFRLEVBQUU7RUFBTSxDQUFDLENBQUMsV0FFcERELFdBQVcsQ0FBQztJQUFFRCxJQUFJLEVBQUUsNkJBQTZCO0lBQUVFLFFBQVEsRUFBRTtFQUFNLENBQUMsQ0FBQyxXQUVyRUQsV0FBVyxDQUFDO0lBQUVELElBQUksRUFBRSxjQUFjO0lBQUVFLFFBQVEsRUFBRTtFQUFNLENBQUMsQ0FBQztJQUFBO0lBQUE7TUFBQTtNQUFBO1FBQUE7TUFBQTtNQUFBO01BQUE7TUFB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Q0FBQ0UsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7TUFDaENGLGFBQWEsQ0FBQ0csS0FBSyxDQUFDLFNBQVMsRUFBRSxNQUFNLENBQUM7TUFDdENILGFBQWEsQ0FBQ0csS0FBSyxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUM7TUFDNUNILGFBQWEsQ0FBQ0ssT0FBTyxFQUFFO01BQ3ZCTCxhQUFhLENBQUNNLGFBQWEsQ0FBQ0wsV0FBVyxDQUFDM0QsWUFBWSxDQUFDLENBQUMsQ0FBQztNQUN2RDBELGFBQWEsQ0FBQ00sYUFBYSxDQUFDTCxXQUFXLENBQUMxRCxZQUFZLENBQUMsQ0FBQyxDQUFDO01BQ3ZEeUQsYUFBYSxDQUFDSCxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQzs7TUFFNUJHLGFBQWEsQ0FBQ0gsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7O01BRTVCRyxhQUFhLENBQUNILEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDO0lBQzdCLENBQUM7SUFBQSxPQUNEVSxPQUFPLEdBQVAsaUJBQVFDLG1CQUE0QixFQUFFO01BQ3JDLElBQU1DLFlBQVksR0FBRyxJQUFJLENBQUMzQyx3QkFBd0IsRUFBRTtNQUNwRCxJQUFJMkMsWUFBWSxFQUFFO1FBQ2pCQSxZQUFZLENBQUNDLHdCQUF3QixDQUFDLElBQUksQ0FBQztNQUM1QztNQUNBLE9BQU8sSUFBSSxDQUFDcEIsVUFBVTtNQUN0QnFCLFlBQVksQ0FBQ0MsU0FBUyxDQUFDTCxPQUFPLENBQUNNLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQ0wsbUJBQW1CLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBQUE7RUFBQSxFQXpMd0JHLFlBQVk7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQTRMdkJuRixXQUFXO0FBQUEifQ==