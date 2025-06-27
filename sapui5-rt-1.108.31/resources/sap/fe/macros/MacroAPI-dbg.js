/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/merge", "sap/base/util/uid", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/converters/ConverterContext", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/Component", "sap/ui/core/Control", "sap/ui/core/util/XMLPreprocessor"], function (merge, uid, BuildingBlockRuntime, ConverterContext, ClassSupport, Component, Control, XMLPreprocessor) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _class3;
  var property = ClassSupport.property;
  var implementInterface = ClassSupport.implementInterface;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
  var registerBuildingBlock = BuildingBlockRuntime.registerBuildingBlock;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var MacroAPIFQN = "sap.fe.macros.MacroAPI";

  /**
   * Base API control for building blocks.
   *
   * @hideconstructor
   * @name sap.fe.macros.MacroAPI
   * @public
   */
  var MacroAPI = (_dec = defineUI5Class(MacroAPIFQN), _dec2 = implementInterface("sap.ui.core.IFormContent"), _dec3 = property({
    type: "string"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = aggregation({
    type: "sap.ui.core.Control",
    multiple: false,
    isDefault: true
  }), _dec(_class = (_class2 = (_class3 = /*#__PURE__*/function (_Control) {
    _inheritsLoose(MacroAPI, _Control);
    function MacroAPI(mSettings) {
      var _this;
      for (var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        others[_key - 1] = arguments[_key];
      }
      _this = _Control.call.apply(_Control, [this, mSettings].concat(others)) || this;
      _initializerDefineProperty(_this, "__implements__sap_ui_core_IFormContent", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "contextPath", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "content", _descriptor4, _assertThisInitialized(_this));
      _this.parentContextToBind = {};
      MacroAPI.registerInstance(_assertThisInitialized(_this));
      return _this;
    }
    var _proto = MacroAPI.prototype;
    _proto.init = function init() {
      _Control.prototype.init.call(this);
      if (!this.getModel("_pageModel")) {
        var _Component$getOwnerCo;
        var oPageModel = (_Component$getOwnerCo = Component.getOwnerComponentFor(this)) === null || _Component$getOwnerCo === void 0 ? void 0 : _Component$getOwnerCo.getModel("_pageModel");
        if (oPageModel) {
          this.setModel(oPageModel, "_pageModel");
        }
      }
    };
    MacroAPI.registerInstance = function registerInstance(_instance) {
      if (!this.instanceMap.get(_instance.constructor)) {
        this.instanceMap.set(_instance.constructor, []);
      }
      this.instanceMap.get(_instance.constructor).push(_instance);
    }
    /**
     * Defines the path of the context used in the current page or block.
     * This setting is defined by the framework.
     *
     * @public
     */;
    MacroAPI.render = function render(oRm, oControl) {
      oRm.renderControl(oControl.content);
    };
    _proto.rerender = function rerender() {
      this.content.rerender();
    };
    _proto.getDomRef = function getDomRef() {
      var oContent = this.content;
      return oContent ? oContent.getDomRef() : _Control.prototype.getDomRef.call(this);
    };
    _proto.getController = function getController() {
      return this.getModel("$view").getObject().getController();
    };
    MacroAPI.getAPI = function getAPI(oEvent) {
      var oSource = oEvent.getSource();
      if (this.isDependentBound) {
        while (oSource && !oSource.isA(MacroAPIFQN) && oSource.getParent) {
          var oDependents = oSource.getDependents();
          var hasCorrectDependent = oDependents.find(function (oDependent) {
            return oDependent.isA(MacroAPIFQN);
          });
          if (hasCorrectDependent) {
            oSource = hasCorrectDependent;
          } else {
            oSource = oSource.getParent();
          }
        }
      } else {
        while (oSource && !oSource.isA(MacroAPIFQN) && oSource.getParent) {
          oSource = oSource.getParent();
        }
      }
      if (!oSource || !oSource.isA(MacroAPIFQN)) {
        var oSourceMap = this.instanceMap.get(this);
        oSource = oSourceMap === null || oSourceMap === void 0 ? void 0 : oSourceMap[oSourceMap.length - 1];
      }
      return oSource && oSource.isA(MacroAPIFQN) && oSource;
    };
    MacroAPI.setDefaultValue = function setDefaultValue(oProps, sPropName, oOverrideValue) {
      if (oProps[sPropName] === undefined) {
        oProps[sPropName] = oOverrideValue;
      }
    }

    /**
     * Retrieve a Converter Context.
     *
     * @param oDataModelPath
     * @param contextPath
     * @param mSettings
     * @returns A Converter Context
     */;
    MacroAPI.register = function register() {
      registerBuildingBlock(this);
    };
    MacroAPI.unregister = function unregister() {
      XMLPreprocessor.plugIn(null, this.namespace, this.macroName);
    };
    /**
     * Keep track of a binding context that should be assigned to the parent of that control.
     *
     * @param modelName The model name that the context will relate to
     * @param path The path of the binding context
     */
    _proto.setParentBindingContext = function setParentBindingContext(modelName, path) {
      this.parentContextToBind[modelName] = path;
    };
    _proto.setParent = function setParent() {
      var _Control$prototype$se,
        _this2 = this;
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      (_Control$prototype$se = _Control.prototype.setParent).call.apply(_Control$prototype$se, [this].concat(args));
      Object.keys(this.parentContextToBind).forEach(function (modelName) {
        _this2.getParent().bindObject({
          path: _this2.parentContextToBind[modelName],
          model: modelName,
          events: {
            change: function () {
              var oBoundContext = this.getBoundContext();
              if (oBoundContext && !oBoundContext.getObject()) {
                oBoundContext.setProperty("", {});
              }
            }
          }
        });
      });
    };
    return MacroAPI;
  }(Control), _class3.namespace = "sap.fe.macros", _class3.macroName = "Macro", _class3.fragment = "sap.fe.macros.Macro", _class3.hasValidation = true, _class3.instanceMap = new WeakMap(), _class3.isDependentBound = false, _class3.getConverterContext = function (oDataModelPath, contextPath, mSettings) {
    var oAppComponent = mSettings.appComponent;
    var viewData = mSettings.models.viewData && mSettings.models.viewData.getData();
    return ConverterContext.createConverterContextForMacro(oDataModelPath.startingEntitySet.name, mSettings.models.metaModel, oAppComponent && oAppComponent.getDiagnostics(), merge, oDataModelPath.contextLocation, viewData);
  }, _class3.createBindingContext = function (oData, mSettings) {
    var sContextPath = "/".concat(uid());
    mSettings.models.converterContext.setProperty(sContextPath, oData);
    return mSettings.models.converterContext.createBindingContext(sContextPath);
  }, _class3), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "__implements__sap_ui_core_IFormContent", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: function () {
      return true;
    }
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
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "content", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return MacroAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYWNyb0FQSUZRTiIsIk1hY3JvQVBJIiwiZGVmaW5lVUk1Q2xhc3MiLCJpbXBsZW1lbnRJbnRlcmZhY2UiLCJwcm9wZXJ0eSIsInR5cGUiLCJhZ2dyZWdhdGlvbiIsIm11bHRpcGxlIiwiaXNEZWZhdWx0IiwibVNldHRpbmdzIiwib3RoZXJzIiwicGFyZW50Q29udGV4dFRvQmluZCIsInJlZ2lzdGVySW5zdGFuY2UiLCJpbml0IiwiZ2V0TW9kZWwiLCJvUGFnZU1vZGVsIiwiQ29tcG9uZW50IiwiZ2V0T3duZXJDb21wb25lbnRGb3IiLCJzZXRNb2RlbCIsIl9pbnN0YW5jZSIsImluc3RhbmNlTWFwIiwiZ2V0IiwiY29uc3RydWN0b3IiLCJzZXQiLCJwdXNoIiwicmVuZGVyIiwib1JtIiwib0NvbnRyb2wiLCJyZW5kZXJDb250cm9sIiwiY29udGVudCIsInJlcmVuZGVyIiwiZ2V0RG9tUmVmIiwib0NvbnRlbnQiLCJnZXRDb250cm9sbGVyIiwiZ2V0T2JqZWN0IiwiZ2V0QVBJIiwib0V2ZW50Iiwib1NvdXJjZSIsImdldFNvdXJjZSIsImlzRGVwZW5kZW50Qm91bmQiLCJpc0EiLCJnZXRQYXJlbnQiLCJvRGVwZW5kZW50cyIsImdldERlcGVuZGVudHMiLCJoYXNDb3JyZWN0RGVwZW5kZW50IiwiZmluZCIsIm9EZXBlbmRlbnQiLCJvU291cmNlTWFwIiwibGVuZ3RoIiwic2V0RGVmYXVsdFZhbHVlIiwib1Byb3BzIiwic1Byb3BOYW1lIiwib092ZXJyaWRlVmFsdWUiLCJ1bmRlZmluZWQiLCJyZWdpc3RlciIsInJlZ2lzdGVyQnVpbGRpbmdCbG9jayIsInVucmVnaXN0ZXIiLCJYTUxQcmVwcm9jZXNzb3IiLCJwbHVnSW4iLCJuYW1lc3BhY2UiLCJtYWNyb05hbWUiLCJzZXRQYXJlbnRCaW5kaW5nQ29udGV4dCIsIm1vZGVsTmFtZSIsInBhdGgiLCJzZXRQYXJlbnQiLCJhcmdzIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJiaW5kT2JqZWN0IiwibW9kZWwiLCJldmVudHMiLCJjaGFuZ2UiLCJvQm91bmRDb250ZXh0IiwiZ2V0Qm91bmRDb250ZXh0Iiwic2V0UHJvcGVydHkiLCJDb250cm9sIiwiZnJhZ21lbnQiLCJoYXNWYWxpZGF0aW9uIiwiV2Vha01hcCIsImdldENvbnZlcnRlckNvbnRleHQiLCJvRGF0YU1vZGVsUGF0aCIsImNvbnRleHRQYXRoIiwib0FwcENvbXBvbmVudCIsImFwcENvbXBvbmVudCIsInZpZXdEYXRhIiwibW9kZWxzIiwiZ2V0RGF0YSIsIkNvbnZlcnRlckNvbnRleHQiLCJjcmVhdGVDb252ZXJ0ZXJDb250ZXh0Rm9yTWFjcm8iLCJzdGFydGluZ0VudGl0eVNldCIsIm5hbWUiLCJtZXRhTW9kZWwiLCJnZXREaWFnbm9zdGljcyIsIm1lcmdlIiwiY29udGV4dExvY2F0aW9uIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJvRGF0YSIsInNDb250ZXh0UGF0aCIsInVpZCIsImNvbnZlcnRlckNvbnRleHQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk1hY3JvQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBtZXJnZSBmcm9tIFwic2FwL2Jhc2UvdXRpbC9tZXJnZVwiO1xuaW1wb3J0IHVpZCBmcm9tIFwic2FwL2Jhc2UvdXRpbC91aWRcIjtcbmltcG9ydCB7IHJlZ2lzdGVyQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrUnVudGltZVwiO1xuaW1wb3J0IENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGFnZ3JlZ2F0aW9uLCBkZWZpbmVVSTVDbGFzcywgaW1wbGVtZW50SW50ZXJmYWNlLCBwcm9wZXJ0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbE1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBVSTVFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBDb21wb25lbnQgZnJvbSBcInNhcC91aS9jb3JlL0NvbXBvbmVudFwiO1xuaW1wb3J0IENvbnRyb2wgZnJvbSBcInNhcC91aS9jb3JlL0NvbnRyb2xcIjtcbmltcG9ydCB0eXBlIFVJNUVsZW1lbnQgZnJvbSBcInNhcC91aS9jb3JlL0VsZW1lbnRcIjtcbmltcG9ydCB0eXBlIHsgSUZvcm1Db250ZW50IH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCB0eXBlIFJlbmRlck1hbmFnZXIgZnJvbSBcInNhcC91aS9jb3JlL1JlbmRlck1hbmFnZXJcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgdHlwZSBDbGllbnRDb250ZXh0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL0NsaWVudENvbnRleHRCaW5kaW5nXCI7XG5cbmNvbnN0IE1hY3JvQVBJRlFOID0gXCJzYXAuZmUubWFjcm9zLk1hY3JvQVBJXCI7XG5cbi8qKlxuICogQmFzZSBBUEkgY29udHJvbCBmb3IgYnVpbGRpbmcgYmxvY2tzLlxuICpcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBuYW1lIHNhcC5mZS5tYWNyb3MuTWFjcm9BUElcbiAqIEBwdWJsaWNcbiAqL1xuQGRlZmluZVVJNUNsYXNzKE1hY3JvQVBJRlFOKVxuY2xhc3MgTWFjcm9BUEkgZXh0ZW5kcyBDb250cm9sIGltcGxlbWVudHMgSUZvcm1Db250ZW50IHtcblx0QGltcGxlbWVudEludGVyZmFjZShcInNhcC51aS5jb3JlLklGb3JtQ29udGVudFwiKVxuXHRfX2ltcGxlbWVudHNfX3NhcF91aV9jb3JlX0lGb3JtQ29udGVudDogYm9vbGVhbiA9IHRydWU7XG5cblx0c3RhdGljIG5hbWVzcGFjZTogc3RyaW5nID0gXCJzYXAuZmUubWFjcm9zXCI7XG5cdHN0YXRpYyBtYWNyb05hbWU6IHN0cmluZyA9IFwiTWFjcm9cIjtcblx0c3RhdGljIGZyYWdtZW50OiBzdHJpbmcgPSBcInNhcC5mZS5tYWNyb3MuTWFjcm9cIjtcblx0c3RhdGljIGhhc1ZhbGlkYXRpb246IGJvb2xlYW4gPSB0cnVlO1xuXHRzdGF0aWMgaW5zdGFuY2VNYXA6IFdlYWtNYXA8b2JqZWN0LCBvYmplY3RbXT4gPSBuZXcgV2Vha01hcDxvYmplY3QsIG9iamVjdFtdPigpO1xuXHRwcm90ZWN0ZWQgc3RhdGljIGlzRGVwZW5kZW50Qm91bmQgPSBmYWxzZTtcblxuXHRjb25zdHJ1Y3RvcihtU2V0dGluZ3M/OiBQcm9wZXJ0aWVzT2Y8TWFjcm9BUEk+LCAuLi5vdGhlcnM6IGFueVtdKSB7XG5cdFx0c3VwZXIobVNldHRpbmdzIGFzIGFueSwgLi4ub3RoZXJzKTtcblx0XHRNYWNyb0FQSS5yZWdpc3Rlckluc3RhbmNlKHRoaXMpO1xuXHR9XG5cblx0aW5pdCgpIHtcblx0XHRzdXBlci5pbml0KCk7XG5cdFx0aWYgKCF0aGlzLmdldE1vZGVsKFwiX3BhZ2VNb2RlbFwiKSkge1xuXHRcdFx0Y29uc3Qgb1BhZ2VNb2RlbCA9IENvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcih0aGlzKT8uZ2V0TW9kZWwoXCJfcGFnZU1vZGVsXCIpO1xuXHRcdFx0aWYgKG9QYWdlTW9kZWwpIHtcblx0XHRcdFx0dGhpcy5zZXRNb2RlbChvUGFnZU1vZGVsLCBcIl9wYWdlTW9kZWxcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0c3RhdGljIHJlZ2lzdGVySW5zdGFuY2UoX2luc3RhbmNlOiBhbnkpIHtcblx0XHRpZiAoIXRoaXMuaW5zdGFuY2VNYXAuZ2V0KF9pbnN0YW5jZS5jb25zdHJ1Y3RvcikpIHtcblx0XHRcdHRoaXMuaW5zdGFuY2VNYXAuc2V0KF9pbnN0YW5jZS5jb25zdHJ1Y3RvciwgW10pO1xuXHRcdH1cblx0XHQodGhpcy5pbnN0YW5jZU1hcC5nZXQoX2luc3RhbmNlLmNvbnN0cnVjdG9yKSBhcyBvYmplY3RbXSkucHVzaChfaW5zdGFuY2UpO1xuXHR9XG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBwYXRoIG9mIHRoZSBjb250ZXh0IHVzZWQgaW4gdGhlIGN1cnJlbnQgcGFnZSBvciBibG9jay5cblx0ICogVGhpcyBzZXR0aW5nIGlzIGRlZmluZWQgYnkgdGhlIGZyYW1ld29yay5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRjb250ZXh0UGF0aCE6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcmVsYXRpdmUgcGF0aCBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1ldGFtb2RlbCwgYmFzZWQgb24gdGhlIGN1cnJlbnQgY29udGV4dFBhdGguXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0bWV0YVBhdGghOiBzdHJpbmc7XG5cblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIG11bHRpcGxlOiBmYWxzZSwgaXNEZWZhdWx0OiB0cnVlIH0pXG5cdGNvbnRlbnQhOiBDb250cm9sO1xuXG5cdHN0YXRpYyByZW5kZXIob1JtOiBSZW5kZXJNYW5hZ2VyLCBvQ29udHJvbDogTWFjcm9BUEkpIHtcblx0XHRvUm0ucmVuZGVyQ29udHJvbChvQ29udHJvbC5jb250ZW50KTtcblx0fVxuXG5cdHJlcmVuZGVyKCkge1xuXHRcdHRoaXMuY29udGVudC5yZXJlbmRlcigpO1xuXHR9XG5cblx0Z2V0RG9tUmVmKCkge1xuXHRcdGNvbnN0IG9Db250ZW50ID0gdGhpcy5jb250ZW50O1xuXHRcdHJldHVybiBvQ29udGVudCA/IG9Db250ZW50LmdldERvbVJlZigpIDogc3VwZXIuZ2V0RG9tUmVmKCk7XG5cdH1cblx0Z2V0Q29udHJvbGxlcigpOiBhbnkge1xuXHRcdHJldHVybiAodGhpcy5nZXRNb2RlbChcIiR2aWV3XCIpIGFzIGFueSkuZ2V0T2JqZWN0KCkuZ2V0Q29udHJvbGxlcigpO1xuXHR9XG5cblx0c3RhdGljIGdldEFQSShvRXZlbnQ6IFVJNUV2ZW50KTogTWFjcm9BUEkgfCBmYWxzZSB7XG5cdFx0bGV0IG9Tb3VyY2UgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgTWFjcm9BUEk7XG5cdFx0aWYgKHRoaXMuaXNEZXBlbmRlbnRCb3VuZCkge1xuXHRcdFx0d2hpbGUgKG9Tb3VyY2UgJiYgIW9Tb3VyY2UuaXNBKE1hY3JvQVBJRlFOKSAmJiBvU291cmNlLmdldFBhcmVudCkge1xuXHRcdFx0XHRjb25zdCBvRGVwZW5kZW50cyA9IChvU291cmNlIGFzIENvbnRyb2wpLmdldERlcGVuZGVudHMoKTtcblx0XHRcdFx0Y29uc3QgaGFzQ29ycmVjdERlcGVuZGVudCA9IG9EZXBlbmRlbnRzLmZpbmQoKG9EZXBlbmRlbnQ6IFVJNUVsZW1lbnQpID0+IG9EZXBlbmRlbnQuaXNBKE1hY3JvQVBJRlFOKSk7XG5cdFx0XHRcdGlmIChoYXNDb3JyZWN0RGVwZW5kZW50KSB7XG5cdFx0XHRcdFx0b1NvdXJjZSA9IGhhc0NvcnJlY3REZXBlbmRlbnQgYXMgTWFjcm9BUEk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b1NvdXJjZSA9IG9Tb3VyY2UuZ2V0UGFyZW50KCkgYXMgTWFjcm9BUEk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0d2hpbGUgKG9Tb3VyY2UgJiYgIW9Tb3VyY2UuaXNBKE1hY3JvQVBJRlFOKSAmJiBvU291cmNlLmdldFBhcmVudCkge1xuXHRcdFx0XHRvU291cmNlID0gb1NvdXJjZS5nZXRQYXJlbnQoKSBhcyBNYWNyb0FQSTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIW9Tb3VyY2UgfHwgIW9Tb3VyY2UuaXNBKE1hY3JvQVBJRlFOKSkge1xuXHRcdFx0Y29uc3Qgb1NvdXJjZU1hcCA9IHRoaXMuaW5zdGFuY2VNYXAuZ2V0KHRoaXMpIGFzIE1hY3JvQVBJW107XG5cdFx0XHRvU291cmNlID0gb1NvdXJjZU1hcD8uW29Tb3VyY2VNYXAubGVuZ3RoIC0gMV07XG5cdFx0fVxuXHRcdHJldHVybiBvU291cmNlICYmIG9Tb3VyY2UuaXNBKE1hY3JvQVBJRlFOKSAmJiBvU291cmNlO1xuXHR9XG5cblx0c3RhdGljIHNldERlZmF1bHRWYWx1ZShvUHJvcHM6IGFueSwgc1Byb3BOYW1lOiBzdHJpbmcsIG9PdmVycmlkZVZhbHVlOiBhbnkpIHtcblx0XHRpZiAob1Byb3BzW3NQcm9wTmFtZV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0b1Byb3BzW3NQcm9wTmFtZV0gPSBvT3ZlcnJpZGVWYWx1ZTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmUgYSBDb252ZXJ0ZXIgQ29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9EYXRhTW9kZWxQYXRoXG5cdCAqIEBwYXJhbSBjb250ZXh0UGF0aFxuXHQgKiBAcGFyYW0gbVNldHRpbmdzXG5cdCAqIEByZXR1cm5zIEEgQ29udmVydGVyIENvbnRleHRcblx0ICovXG5cdHN0YXRpYyBnZXRDb252ZXJ0ZXJDb250ZXh0ID0gZnVuY3Rpb24gKG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLCBjb250ZXh0UGF0aDogc3RyaW5nLCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBtU2V0dGluZ3MuYXBwQ29tcG9uZW50O1xuXHRcdGNvbnN0IHZpZXdEYXRhID0gbVNldHRpbmdzLm1vZGVscy52aWV3RGF0YSAmJiBtU2V0dGluZ3MubW9kZWxzLnZpZXdEYXRhLmdldERhdGEoKTtcblx0XHRyZXR1cm4gQ29udmVydGVyQ29udGV4dC5jcmVhdGVDb252ZXJ0ZXJDb250ZXh0Rm9yTWFjcm8oXG5cdFx0XHRvRGF0YU1vZGVsUGF0aC5zdGFydGluZ0VudGl0eVNldC5uYW1lLFxuXHRcdFx0bVNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwsXG5cdFx0XHRvQXBwQ29tcG9uZW50ICYmIG9BcHBDb21wb25lbnQuZ2V0RGlhZ25vc3RpY3MoKSxcblx0XHRcdG1lcmdlLFxuXHRcdFx0b0RhdGFNb2RlbFBhdGguY29udGV4dExvY2F0aW9uLFxuXHRcdFx0dmlld0RhdGFcblx0XHQpO1xuXHR9O1xuXHQvKipcblx0ICogQ3JlYXRlIGEgQmluZGluZyBDb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RhdGFcblx0ICogQHBhcmFtIG1TZXR0aW5nc1xuXHQgKiBAcmV0dXJucyBUaGUgYmluZGluZyBjb250ZXh0XG5cdCAqL1xuXHRzdGF0aWMgY3JlYXRlQmluZGluZ0NvbnRleHQgPSBmdW5jdGlvbiAob0RhdGE6IG9iamVjdCwgbVNldHRpbmdzOiBhbnkpIHtcblx0XHRjb25zdCBzQ29udGV4dFBhdGggPSBgLyR7dWlkKCl9YDtcblx0XHRtU2V0dGluZ3MubW9kZWxzLmNvbnZlcnRlckNvbnRleHQuc2V0UHJvcGVydHkoc0NvbnRleHRQYXRoLCBvRGF0YSk7XG5cdFx0cmV0dXJuIG1TZXR0aW5ncy5tb2RlbHMuY29udmVydGVyQ29udGV4dC5jcmVhdGVCaW5kaW5nQ29udGV4dChzQ29udGV4dFBhdGgpO1xuXHR9O1xuXHRzdGF0aWMgcmVnaXN0ZXIoKSB7XG5cdFx0cmVnaXN0ZXJCdWlsZGluZ0Jsb2NrKHRoaXMgYXMgYW55KTtcblx0fVxuXHRzdGF0aWMgdW5yZWdpc3RlcigpIHtcblx0XHQoWE1MUHJlcHJvY2Vzc29yIGFzIGFueSkucGx1Z0luKG51bGwsIHRoaXMubmFtZXNwYWNlLCB0aGlzLm1hY3JvTmFtZSk7XG5cdH1cblxuXHRwYXJlbnRDb250ZXh0VG9CaW5kOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+ID0ge307XG5cblx0LyoqXG5cdCAqIEtlZXAgdHJhY2sgb2YgYSBiaW5kaW5nIGNvbnRleHQgdGhhdCBzaG91bGQgYmUgYXNzaWduZWQgdG8gdGhlIHBhcmVudCBvZiB0aGF0IGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBwYXJhbSBtb2RlbE5hbWUgVGhlIG1vZGVsIG5hbWUgdGhhdCB0aGUgY29udGV4dCB3aWxsIHJlbGF0ZSB0b1xuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBvZiB0aGUgYmluZGluZyBjb250ZXh0XG5cdCAqL1xuXHRzZXRQYXJlbnRCaW5kaW5nQ29udGV4dChtb2RlbE5hbWU6IHN0cmluZywgcGF0aDogc3RyaW5nKSB7XG5cdFx0dGhpcy5wYXJlbnRDb250ZXh0VG9CaW5kW21vZGVsTmFtZV0gPSBwYXRoO1xuXHR9XG5cblx0c2V0UGFyZW50KC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRzdXBlci5zZXRQYXJlbnQoLi4uYXJncyk7XG5cdFx0T2JqZWN0LmtleXModGhpcy5wYXJlbnRDb250ZXh0VG9CaW5kKS5mb3JFYWNoKChtb2RlbE5hbWUpID0+IHtcblx0XHRcdHRoaXMuZ2V0UGFyZW50KCkuYmluZE9iamVjdCh7XG5cdFx0XHRcdHBhdGg6IHRoaXMucGFyZW50Q29udGV4dFRvQmluZFttb2RlbE5hbWVdLFxuXHRcdFx0XHRtb2RlbDogbW9kZWxOYW1lLFxuXHRcdFx0XHRldmVudHM6IHtcblx0XHRcdFx0XHRjaGFuZ2U6IGZ1bmN0aW9uICh0aGlzOiBDbGllbnRDb250ZXh0QmluZGluZykge1xuXHRcdFx0XHRcdFx0Y29uc3Qgb0JvdW5kQ29udGV4dCA9IHRoaXMuZ2V0Qm91bmRDb250ZXh0KCkgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQ7XG5cdFx0XHRcdFx0XHRpZiAob0JvdW5kQ29udGV4dCAmJiAhb0JvdW5kQ29udGV4dC5nZXRPYmplY3QoKSkge1xuXHRcdFx0XHRcdFx0XHRvQm91bmRDb250ZXh0LnNldFByb3BlcnR5KFwiXCIsIHt9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE1hY3JvQVBJO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0VBaUJBLElBQU1BLFdBQVcsR0FBRyx3QkFBd0I7O0VBRTVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkEsSUFRTUMsUUFBUSxXQURiQyxjQUFjLENBQUNGLFdBQVcsQ0FBQyxVQUUxQkcsa0JBQWtCLENBQUMsMEJBQTBCLENBQUMsVUFxQzlDQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBUTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFVBRzVCQyxXQUFXLENBQUM7SUFBRUQsSUFBSSxFQUFFLHFCQUFxQjtJQUFFRSxRQUFRLEVBQUUsS0FBSztJQUFFQyxTQUFTLEVBQUU7RUFBSyxDQUFDLENBQUM7SUFBQTtJQXRDL0Usa0JBQVlDLFNBQWtDLEVBQW9CO01BQUE7TUFBQSxrQ0FBZkMsTUFBTTtRQUFOQSxNQUFNO01BQUE7TUFDeEQsNkNBQU1ELFNBQVMsU0FBWUMsTUFBTSxFQUFDO01BQUM7TUFBQTtNQUFBO01BQUE7TUFBQSxNQThIcENDLG1CQUFtQixHQUEyQixDQUFDLENBQUM7TUE3SC9DVixRQUFRLENBQUNXLGdCQUFnQiwrQkFBTTtNQUFDO0lBQ2pDO0lBQUM7SUFBQSxPQUVEQyxJQUFJLEdBQUosZ0JBQU87TUFDTixtQkFBTUEsSUFBSTtNQUNWLElBQUksQ0FBQyxJQUFJLENBQUNDLFFBQVEsQ0FBQyxZQUFZLENBQUMsRUFBRTtRQUFBO1FBQ2pDLElBQU1DLFVBQVUsNEJBQUdDLFNBQVMsQ0FBQ0Msb0JBQW9CLENBQUMsSUFBSSxDQUFDLDBEQUFwQyxzQkFBc0NILFFBQVEsQ0FBQyxZQUFZLENBQUM7UUFDL0UsSUFBSUMsVUFBVSxFQUFFO1VBQ2YsSUFBSSxDQUFDRyxRQUFRLENBQUNILFVBQVUsRUFBRSxZQUFZLENBQUM7UUFDeEM7TUFDRDtJQUNELENBQUM7SUFBQSxTQUVNSCxnQkFBZ0IsR0FBdkIsMEJBQXdCTyxTQUFjLEVBQUU7TUFDdkMsSUFBSSxDQUFDLElBQUksQ0FBQ0MsV0FBVyxDQUFDQyxHQUFHLENBQUNGLFNBQVMsQ0FBQ0csV0FBVyxDQUFDLEVBQUU7UUFDakQsSUFBSSxDQUFDRixXQUFXLENBQUNHLEdBQUcsQ0FBQ0osU0FBUyxDQUFDRyxXQUFXLEVBQUUsRUFBRSxDQUFDO01BQ2hEO01BQ0MsSUFBSSxDQUFDRixXQUFXLENBQUNDLEdBQUcsQ0FBQ0YsU0FBUyxDQUFDRyxXQUFXLENBQUMsQ0FBY0UsSUFBSSxDQUFDTCxTQUFTLENBQUM7SUFDMUU7SUFDQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FMQztJQUFBLFNBb0JPTSxNQUFNLEdBQWIsZ0JBQWNDLEdBQWtCLEVBQUVDLFFBQWtCLEVBQUU7TUFDckRELEdBQUcsQ0FBQ0UsYUFBYSxDQUFDRCxRQUFRLENBQUNFLE9BQU8sQ0FBQztJQUNwQyxDQUFDO0lBQUEsT0FFREMsUUFBUSxHQUFSLG9CQUFXO01BQ1YsSUFBSSxDQUFDRCxPQUFPLENBQUNDLFFBQVEsRUFBRTtJQUN4QixDQUFDO0lBQUEsT0FFREMsU0FBUyxHQUFULHFCQUFZO01BQ1gsSUFBTUMsUUFBUSxHQUFHLElBQUksQ0FBQ0gsT0FBTztNQUM3QixPQUFPRyxRQUFRLEdBQUdBLFFBQVEsQ0FBQ0QsU0FBUyxFQUFFLHNCQUFTQSxTQUFTLFdBQUU7SUFDM0QsQ0FBQztJQUFBLE9BQ0RFLGFBQWEsR0FBYix5QkFBcUI7TUFDcEIsT0FBUSxJQUFJLENBQUNuQixRQUFRLENBQUMsT0FBTyxDQUFDLENBQVNvQixTQUFTLEVBQUUsQ0FBQ0QsYUFBYSxFQUFFO0lBQ25FLENBQUM7SUFBQSxTQUVNRSxNQUFNLEdBQWIsZ0JBQWNDLE1BQWdCLEVBQW9CO01BQ2pELElBQUlDLE9BQU8sR0FBR0QsTUFBTSxDQUFDRSxTQUFTLEVBQWM7TUFDNUMsSUFBSSxJQUFJLENBQUNDLGdCQUFnQixFQUFFO1FBQzFCLE9BQU9GLE9BQU8sSUFBSSxDQUFDQSxPQUFPLENBQUNHLEdBQUcsQ0FBQ3hDLFdBQVcsQ0FBQyxJQUFJcUMsT0FBTyxDQUFDSSxTQUFTLEVBQUU7VUFDakUsSUFBTUMsV0FBVyxHQUFJTCxPQUFPLENBQWFNLGFBQWEsRUFBRTtVQUN4RCxJQUFNQyxtQkFBbUIsR0FBR0YsV0FBVyxDQUFDRyxJQUFJLENBQUMsVUFBQ0MsVUFBc0I7WUFBQSxPQUFLQSxVQUFVLENBQUNOLEdBQUcsQ0FBQ3hDLFdBQVcsQ0FBQztVQUFBLEVBQUM7VUFDckcsSUFBSTRDLG1CQUFtQixFQUFFO1lBQ3hCUCxPQUFPLEdBQUdPLG1CQUErQjtVQUMxQyxDQUFDLE1BQU07WUFDTlAsT0FBTyxHQUFHQSxPQUFPLENBQUNJLFNBQVMsRUFBYztVQUMxQztRQUNEO01BQ0QsQ0FBQyxNQUFNO1FBQ04sT0FBT0osT0FBTyxJQUFJLENBQUNBLE9BQU8sQ0FBQ0csR0FBRyxDQUFDeEMsV0FBVyxDQUFDLElBQUlxQyxPQUFPLENBQUNJLFNBQVMsRUFBRTtVQUNqRUosT0FBTyxHQUFHQSxPQUFPLENBQUNJLFNBQVMsRUFBYztRQUMxQztNQUNEO01BRUEsSUFBSSxDQUFDSixPQUFPLElBQUksQ0FBQ0EsT0FBTyxDQUFDRyxHQUFHLENBQUN4QyxXQUFXLENBQUMsRUFBRTtRQUMxQyxJQUFNK0MsVUFBVSxHQUFHLElBQUksQ0FBQzNCLFdBQVcsQ0FBQ0MsR0FBRyxDQUFDLElBQUksQ0FBZTtRQUMzRGdCLE9BQU8sR0FBR1UsVUFBVSxhQUFWQSxVQUFVLHVCQUFWQSxVQUFVLENBQUdBLFVBQVUsQ0FBQ0MsTUFBTSxHQUFHLENBQUMsQ0FBQztNQUM5QztNQUNBLE9BQU9YLE9BQU8sSUFBSUEsT0FBTyxDQUFDRyxHQUFHLENBQUN4QyxXQUFXLENBQUMsSUFBSXFDLE9BQU87SUFDdEQsQ0FBQztJQUFBLFNBRU1ZLGVBQWUsR0FBdEIseUJBQXVCQyxNQUFXLEVBQUVDLFNBQWlCLEVBQUVDLGNBQW1CLEVBQUU7TUFDM0UsSUFBSUYsTUFBTSxDQUFDQyxTQUFTLENBQUMsS0FBS0UsU0FBUyxFQUFFO1FBQ3BDSCxNQUFNLENBQUNDLFNBQVMsQ0FBQyxHQUFHQyxjQUFjO01BQ25DO0lBQ0Q7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVBDO0lBQUEsU0FnQ09FLFFBQVEsR0FBZixvQkFBa0I7TUFDakJDLHFCQUFxQixDQUFDLElBQUksQ0FBUTtJQUNuQyxDQUFDO0lBQUEsU0FDTUMsVUFBVSxHQUFqQixzQkFBb0I7TUFDbEJDLGVBQWUsQ0FBU0MsTUFBTSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUNDLFNBQVMsRUFBRSxJQUFJLENBQUNDLFNBQVMsQ0FBQztJQUN0RSxDQUFDO0lBSUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBTEMsT0FNQUMsdUJBQXVCLEdBQXZCLGlDQUF3QkMsU0FBaUIsRUFBRUMsSUFBWSxFQUFFO01BQ3hELElBQUksQ0FBQ3BELG1CQUFtQixDQUFDbUQsU0FBUyxDQUFDLEdBQUdDLElBQUk7SUFDM0MsQ0FBQztJQUFBLE9BRURDLFNBQVMsR0FBVCxxQkFBMEI7TUFBQTtRQUFBO01BQUEsbUNBQWJDLElBQUk7UUFBSkEsSUFBSTtNQUFBO01BQ2hCO01BQ0E7TUFDQSw0Q0FBTUQsU0FBUyxrREFBSUMsSUFBSTtNQUN2QkMsTUFBTSxDQUFDQyxJQUFJLENBQUMsSUFBSSxDQUFDeEQsbUJBQW1CLENBQUMsQ0FBQ3lELE9BQU8sQ0FBQyxVQUFDTixTQUFTLEVBQUs7UUFDNUQsTUFBSSxDQUFDckIsU0FBUyxFQUFFLENBQUM0QixVQUFVLENBQUM7VUFDM0JOLElBQUksRUFBRSxNQUFJLENBQUNwRCxtQkFBbUIsQ0FBQ21ELFNBQVMsQ0FBQztVQUN6Q1EsS0FBSyxFQUFFUixTQUFTO1VBQ2hCUyxNQUFNLEVBQUU7WUFDUEMsTUFBTSxFQUFFLFlBQXNDO2NBQzdDLElBQU1DLGFBQWEsR0FBRyxJQUFJLENBQUNDLGVBQWUsRUFBMEI7Y0FDcEUsSUFBSUQsYUFBYSxJQUFJLENBQUNBLGFBQWEsQ0FBQ3ZDLFNBQVMsRUFBRSxFQUFFO2dCQUNoRHVDLGFBQWEsQ0FBQ0UsV0FBVyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztjQUNsQztZQUNEO1VBQ0Q7UUFDRCxDQUFDLENBQUM7TUFDSCxDQUFDLENBQUM7SUFDSCxDQUFDO0lBQUE7RUFBQSxFQXhLcUJDLE9BQU8sV0FJdEJqQixTQUFTLEdBQVcsZUFBZSxVQUNuQ0MsU0FBUyxHQUFXLE9BQU8sVUFDM0JpQixRQUFRLEdBQVcscUJBQXFCLFVBQ3hDQyxhQUFhLEdBQVksSUFBSSxVQUM3QjFELFdBQVcsR0FBOEIsSUFBSTJELE9BQU8sRUFBb0IsVUFDOUR4QyxnQkFBZ0IsR0FBRyxLQUFLLFVBa0dsQ3lDLG1CQUFtQixHQUFHLFVBQVVDLGNBQW1DLEVBQUVDLFdBQW1CLEVBQUV6RSxTQUFjLEVBQUU7SUFDaEgsSUFBTTBFLGFBQWEsR0FBRzFFLFNBQVMsQ0FBQzJFLFlBQVk7SUFDNUMsSUFBTUMsUUFBUSxHQUFHNUUsU0FBUyxDQUFDNkUsTUFBTSxDQUFDRCxRQUFRLElBQUk1RSxTQUFTLENBQUM2RSxNQUFNLENBQUNELFFBQVEsQ0FBQ0UsT0FBTyxFQUFFO0lBQ2pGLE9BQU9DLGdCQUFnQixDQUFDQyw4QkFBOEIsQ0FDckRSLGNBQWMsQ0FBQ1MsaUJBQWlCLENBQUNDLElBQUksRUFDckNsRixTQUFTLENBQUM2RSxNQUFNLENBQUNNLFNBQVMsRUFDMUJULGFBQWEsSUFBSUEsYUFBYSxDQUFDVSxjQUFjLEVBQUUsRUFDL0NDLEtBQUssRUFDTGIsY0FBYyxDQUFDYyxlQUFlLEVBQzlCVixRQUFRLENBQ1I7RUFDRixDQUFDLFVBUU1XLG9CQUFvQixHQUFHLFVBQVVDLEtBQWEsRUFBRXhGLFNBQWMsRUFBRTtJQUN0RSxJQUFNeUYsWUFBWSxjQUFPQyxHQUFHLEVBQUUsQ0FBRTtJQUNoQzFGLFNBQVMsQ0FBQzZFLE1BQU0sQ0FBQ2MsZ0JBQWdCLENBQUN6QixXQUFXLENBQUN1QixZQUFZLEVBQUVELEtBQUssQ0FBQztJQUNsRSxPQUFPeEYsU0FBUyxDQUFDNkUsTUFBTSxDQUFDYyxnQkFBZ0IsQ0FBQ0osb0JBQW9CLENBQUNFLFlBQVksQ0FBQztFQUM1RSxDQUFDO0lBQUE7SUFBQTtJQUFBO0lBQUE7TUFBQSxPQWhJaUQsSUFBSTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7RUFBQSxPQXlLeENqRyxRQUFRO0FBQUEifQ==