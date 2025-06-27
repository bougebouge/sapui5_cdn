/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/ui/base/Object", "sap/ui/core/Component", "sap/ui/model/json/JSONModel", "./helpers/ClassSupport"], function (Log, CommonUtils, BaseObject, Component, JSONModel, ClassSupport) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _class, _class2, _descriptor, _descriptor2, _descriptor3;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Common Extension API for all pages of SAP Fiori elements for OData V4.
   *
   * @alias sap.fe.core.ExtensionAPI
   * @public
   * @hideconstructor
   * @extends sap.ui.base.Object
   * @since 1.79.0
   */
  var ExtensionAPI = (_dec = defineUI5Class("sap.fe.core.ExtensionAPI"), _dec2 = property({
    type: "sap/fe/core/controllerextensions/EditFlow"
  }), _dec3 = property({
    type: "sap/fe/core/controllerextensions/Routing"
  }), _dec4 = property({
    type: "sap/fe/core/controllerextensions/IntentBasedNavigation"
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(ExtensionAPI, _BaseObject);
    /**
     * A controller extension offering hooks into the edit flow of the application.
     *
     * @public
     */

    /**
     * A controller extension offering hooks into the routing flow of the application.
     *
     * @public
     */

    /**
     * ExtensionAPI for intent-based navigation
     *
     * @public
     */

    function ExtensionAPI(oController, sId) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _initializerDefineProperty(_this, "editFlow", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "routing", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor3, _assertThisInitialized(_this));
      _this._controller = oController;
      _this._view = oController.getView();
      _this.extension = _this._controller.extension;
      _this.editFlow = _this._controller.editFlow;
      _this.routing = _this._controller.routing;
      _this._routing = _this._controller._routing;
      _this.intentBasedNavigation = _this._controller.intentBasedNavigation;
      _this._prefix = sId;
      return _this;
    }
    var _proto = ExtensionAPI.prototype;
    _proto.destroy = function destroy() {
      // delete this._controller;
      // delete this._view;
      // delete this.editFlow._controller;
      // delete this.intentBasedNavigation._controller;
    }

    /**
     * Retrieves the editFlow controller extension for this page.
     *
     * @public
     * @returns The editFlow controller extension
     */;
    _proto.getEditFlow = function getEditFlow() {
      return this.editFlow;
    }

    /**
     * Retrieves the routing controller extension for this page.
     *
     * @public
     * @returns The routing controller extension
     */;
    _proto.getRouting = function getRouting() {
      return this.routing;
    }

    /**
     * Retrieves the intentBasedNavigation controller extension for this page.
     *
     * @public
     * @returns The intentBasedNavigation controller extension
     */;
    _proto.getIntentBasedNavigation = function getIntentBasedNavigation() {
      return this.intentBasedNavigation;
    }

    /**
     * Access any control by ID.
     *
     * @alias sap.fe.core.ExtensionAPI#byId
     * @param sId ID of the control without the view prefix. Either the ID prefixed by SAP Fiori elements
     * (for example with the section) or the control ID only. The latter works only for an extension running in
     * the same context (like in the same section). You can use the prefix for SAP Fiori elements to also access other controls located in different sections.
     * @returns The requested control, if found in the view.
     * @private
     */;
    _proto.byId = function byId(sId) {
      var oControl = this._view.byId(sId);
      if (!oControl && this._prefix) {
        // give it a try with the prefix
        oControl = this._view.byId("".concat(this._prefix, "--").concat(sId));
      }
      if (oControl) {
        return oControl;
      }
    }

    /**
     * Get access to models managed by SAP Fiori elements.<br>
     * The following models can be accessed:
     * <ul>
     * <li>undefined: the undefined model returns the SAPUI5 OData V4 model bound to this page</li>
     * <li>i18n / further data models defined in the manifest</li>
     * <li>ui: returns a SAPUI5 JSON model containing UI information.
     * Only the following properties are public and supported:
     * 	<ul>
     *     <li>isEditable: set to true if the application is in edit mode</li>
     *  </ul>
     * </li>
     * </ul>.
     * editMode is deprecated and should not be used anymore. Use isEditable instead.
     *
     * @alias sap.fe.core.ExtensionAPI#getModel
     * @param sModelName Name of the model
     * @returns The required model
     * @public
     */;
    _proto.getModel = function getModel(sModelName) {
      var oAppComponent;
      if (sModelName && sModelName !== "ui") {
        oAppComponent = CommonUtils.getAppComponent(this._view);
        if (!oAppComponent.getManifestEntry("sap.ui5").models[sModelName]) {
          // don't allow access to our internal models
          return undefined;
        }
      }
      return this._view.getModel(sModelName);
    }

    /**
     * Add any control as a dependent control to this SAP Fiori elements page.
     *
     * @alias sap.fe.core.ExtensionAPI#addDependent
     * @param oControl Control to be added as a dependent control
     * @public
     */;
    _proto.addDependent = function addDependent(oControl) {
      this._view.addDependent(oControl);
    }

    /**
     * Remove a dependent control from this SAP Fiori elements page.
     *
     * @alias sap.fe.core.ExtensionAPI#removeDependent
     * @param oControl Control to be added as a dependent control
     * @public
     */;
    _proto.removeDependent = function removeDependent(oControl) {
      this._view.removeDependent(oControl);
    }

    /**
     * Navigate to another target.
     *
     * @alias sap.fe.core.ExtensionAPI#navigateToTarget
     * @param sTarget Name of the target route
     * @param [oContext] Context instance
     * @public
     */;
    _proto.navigateToTarget = function navigateToTarget(sTarget, oContext) {
      this._controller._routing.navigateToTarget(oContext, sTarget);
    }

    /**
     * Load a fragment and go through the template preprocessor with the current page context.
     *
     * @alias sap.fe.core.ExtensionAPI#loadFragment
     * @param mSettings The settings object
     * @param mSettings.id The ID of the fragment itself
     * @param mSettings.name The name of the fragment to be loaded
     * @param mSettings.controller The controller to be attached to the fragment
     * @param mSettings.contextPath The contextPath to be used for the templating process
     * @param mSettings.initialBindingContext The initial binding context
     * @returns The fragment definition
     * @public
     */;
    _proto.loadFragment = function loadFragment(mSettings) {
      var _this$getModel,
        _this2 = this;
      var oTemplateComponent = Component.getOwnerComponentFor(this._view);
      var oPageModel = this._view.getModel("_pageModel");
      var oMetaModel = (_this$getModel = this.getModel()) === null || _this$getModel === void 0 ? void 0 : _this$getModel.getMetaModel();
      var mViewData = oTemplateComponent.getViewData();
      var oViewDataModel = new JSONModel(mViewData),
        oPreprocessorSettings = {
          bindingContexts: {
            "contextPath": oMetaModel === null || oMetaModel === void 0 ? void 0 : oMetaModel.createBindingContext(mSettings.contextPath || "/".concat(oTemplateComponent.getEntitySet())),
            converterContext: oPageModel.createBindingContext("/", undefined, {
              noResolve: true
            }),
            viewData: mViewData ? oViewDataModel.createBindingContext("/") : null
          },
          models: {
            "contextPath": oMetaModel,
            converterContext: oPageModel,
            metaModel: oMetaModel,
            viewData: oViewDataModel
          },
          appComponent: CommonUtils.getAppComponent(this._view)
        };
      var oTemplatePromise = CommonUtils.templateControlFragment(mSettings.name, oPreprocessorSettings, {
        controller: mSettings.controller || this,
        isXML: false,
        id: mSettings.id
      });
      oTemplatePromise.then(function (oFragment) {
        if (mSettings.initialBindingContext !== undefined) {
          oFragment.setBindingContext(mSettings.initialBindingContext);
        }
        _this2.addDependent(oFragment);
      }).catch(function (oError) {
        Log.error(oError);
      });
      return oTemplatePromise;
    }

    /**
     * Triggers an update of the app state.
     * Should be called if the state of a control, or any other state-relevant information, was changed.
     *
     * @alias sap.fe.core.ExtensionAPI#updateAppState
     * @returns A promise that resolves with the new app state object.
     * @public
     */;
    _proto.updateAppState = function updateAppState() {
      return this._controller.getAppComponent().getAppStateHandler().createAppState();
    };
    return ExtensionAPI;
  }(BaseObject), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "editFlow", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "routing", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ExtensionAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJFeHRlbnNpb25BUEkiLCJkZWZpbmVVSTVDbGFzcyIsInByb3BlcnR5IiwidHlwZSIsIm9Db250cm9sbGVyIiwic0lkIiwiX2NvbnRyb2xsZXIiLCJfdmlldyIsImdldFZpZXciLCJleHRlbnNpb24iLCJlZGl0RmxvdyIsInJvdXRpbmciLCJfcm91dGluZyIsImludGVudEJhc2VkTmF2aWdhdGlvbiIsIl9wcmVmaXgiLCJkZXN0cm95IiwiZ2V0RWRpdEZsb3ciLCJnZXRSb3V0aW5nIiwiZ2V0SW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiYnlJZCIsIm9Db250cm9sIiwiZ2V0TW9kZWwiLCJzTW9kZWxOYW1lIiwib0FwcENvbXBvbmVudCIsIkNvbW1vblV0aWxzIiwiZ2V0QXBwQ29tcG9uZW50IiwiZ2V0TWFuaWZlc3RFbnRyeSIsIm1vZGVscyIsInVuZGVmaW5lZCIsImFkZERlcGVuZGVudCIsInJlbW92ZURlcGVuZGVudCIsIm5hdmlnYXRlVG9UYXJnZXQiLCJzVGFyZ2V0Iiwib0NvbnRleHQiLCJsb2FkRnJhZ21lbnQiLCJtU2V0dGluZ3MiLCJvVGVtcGxhdGVDb21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsIm9QYWdlTW9kZWwiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwibVZpZXdEYXRhIiwiZ2V0Vmlld0RhdGEiLCJvVmlld0RhdGFNb2RlbCIsIkpTT05Nb2RlbCIsIm9QcmVwcm9jZXNzb3JTZXR0aW5ncyIsImJpbmRpbmdDb250ZXh0cyIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiY29udGV4dFBhdGgiLCJnZXRFbnRpdHlTZXQiLCJjb252ZXJ0ZXJDb250ZXh0Iiwibm9SZXNvbHZlIiwidmlld0RhdGEiLCJtZXRhTW9kZWwiLCJhcHBDb21wb25lbnQiLCJvVGVtcGxhdGVQcm9taXNlIiwidGVtcGxhdGVDb250cm9sRnJhZ21lbnQiLCJuYW1lIiwiY29udHJvbGxlciIsImlzWE1MIiwiaWQiLCJ0aGVuIiwib0ZyYWdtZW50IiwiaW5pdGlhbEJpbmRpbmdDb250ZXh0Iiwic2V0QmluZGluZ0NvbnRleHQiLCJjYXRjaCIsIm9FcnJvciIsIkxvZyIsImVycm9yIiwidXBkYXRlQXBwU3RhdGUiLCJnZXRBcHBTdGF0ZUhhbmRsZXIiLCJjcmVhdGVBcHBTdGF0ZSIsIkJhc2VPYmplY3QiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkV4dGVuc2lvbkFQSS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB0eXBlIEVkaXRGbG93IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9FZGl0Rmxvd1wiO1xuaW1wb3J0IHR5cGUgSW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCB0eXBlIEludGVybmFsUm91dGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvSW50ZXJuYWxSb3V0aW5nXCI7XG5pbXBvcnQgdHlwZSBSb3V0aW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9Sb3V0aW5nXCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIFRlbXBsYXRlQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZUNvbXBvbmVudFwiO1xuaW1wb3J0IEJhc2VPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL09iamVjdFwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSBFbGVtZW50IGZyb20gXCJzYXAvdWkvY29yZS9FbGVtZW50XCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL0NvbnRleHRcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBFbmhhbmNlV2l0aFVJNSB9IGZyb20gXCIuL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwiLi9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuXG4vKipcbiAqIENvbW1vbiBFeHRlbnNpb24gQVBJIGZvciBhbGwgcGFnZXMgb2YgU0FQIEZpb3JpIGVsZW1lbnRzIGZvciBPRGF0YSBWNC5cbiAqXG4gKiBAYWxpYXMgc2FwLmZlLmNvcmUuRXh0ZW5zaW9uQVBJXG4gKiBAcHVibGljXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBzYXAudWkuYmFzZS5PYmplY3RcbiAqIEBzaW5jZSAxLjc5LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuRXh0ZW5zaW9uQVBJXCIpXG5jbGFzcyBFeHRlbnNpb25BUEkgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcblx0LyoqXG5cdCAqIEEgY29udHJvbGxlciBleHRlbnNpb24gb2ZmZXJpbmcgaG9va3MgaW50byB0aGUgZWRpdCBmbG93IG9mIHRoZSBhcHBsaWNhdGlvbi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9FZGl0Rmxvd1wiIH0pXG5cdGVkaXRGbG93OiBFZGl0Rmxvdztcblx0LyoqXG5cdCAqIEEgY29udHJvbGxlciBleHRlbnNpb24gb2ZmZXJpbmcgaG9va3MgaW50byB0aGUgcm91dGluZyBmbG93IG9mIHRoZSBhcHBsaWNhdGlvbi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9Sb3V0aW5nXCIgfSlcblx0cm91dGluZzogUm91dGluZztcblx0LyoqXG5cdCAqIEV4dGVuc2lvbkFQSSBmb3IgaW50ZW50LWJhc2VkIG5hdmlnYXRpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIiB9KVxuXHRpbnRlbnRCYXNlZE5hdmlnYXRpb246IEludGVudEJhc2VkTmF2aWdhdGlvbjtcblxuXHRwcm90ZWN0ZWQgX2NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyO1xuXHRwcm90ZWN0ZWQgX3ZpZXc6IFZpZXc7XG5cdHByaXZhdGUgX3JvdXRpbmc6IEludGVybmFsUm91dGluZztcblx0cHJpdmF0ZSBfcHJlZml4Pzogc3RyaW5nO1xuXHRwcml2YXRlIGV4dGVuc2lvbjogYW55O1xuXG5cdGNvbnN0cnVjdG9yKG9Db250cm9sbGVyOiBQYWdlQ29udHJvbGxlciwgc0lkPzogc3RyaW5nKSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLl9jb250cm9sbGVyID0gb0NvbnRyb2xsZXI7XG5cdFx0dGhpcy5fdmlldyA9IG9Db250cm9sbGVyLmdldFZpZXcoKTtcblx0XHR0aGlzLmV4dGVuc2lvbiA9ICh0aGlzLl9jb250cm9sbGVyIGFzIGFueSkuZXh0ZW5zaW9uO1xuXHRcdHRoaXMuZWRpdEZsb3cgPSB0aGlzLl9jb250cm9sbGVyLmVkaXRGbG93O1xuXHRcdHRoaXMucm91dGluZyA9IHRoaXMuX2NvbnRyb2xsZXIucm91dGluZztcblx0XHR0aGlzLl9yb3V0aW5nID0gdGhpcy5fY29udHJvbGxlci5fcm91dGluZztcblx0XHR0aGlzLmludGVudEJhc2VkTmF2aWdhdGlvbiA9IHRoaXMuX2NvbnRyb2xsZXIuaW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXHRcdHRoaXMuX3ByZWZpeCA9IHNJZDtcblx0fVxuXHRkZXN0cm95KCkge1xuXHRcdC8vIGRlbGV0ZSB0aGlzLl9jb250cm9sbGVyO1xuXHRcdC8vIGRlbGV0ZSB0aGlzLl92aWV3O1xuXHRcdC8vIGRlbGV0ZSB0aGlzLmVkaXRGbG93Ll9jb250cm9sbGVyO1xuXHRcdC8vIGRlbGV0ZSB0aGlzLmludGVudEJhc2VkTmF2aWdhdGlvbi5fY29udHJvbGxlcjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGVkaXRGbG93IGNvbnRyb2xsZXIgZXh0ZW5zaW9uIGZvciB0aGlzIHBhZ2UuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHJldHVybnMgVGhlIGVkaXRGbG93IGNvbnRyb2xsZXIgZXh0ZW5zaW9uXG5cdCAqL1xuXHRnZXRFZGl0RmxvdygpIHtcblx0XHRyZXR1cm4gdGhpcy5lZGl0Rmxvdztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHJvdXRpbmcgY29udHJvbGxlciBleHRlbnNpb24gZm9yIHRoaXMgcGFnZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcmV0dXJucyBUaGUgcm91dGluZyBjb250cm9sbGVyIGV4dGVuc2lvblxuXHQgKi9cblx0Z2V0Um91dGluZygpIHtcblx0XHRyZXR1cm4gdGhpcy5yb3V0aW5nO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgaW50ZW50QmFzZWROYXZpZ2F0aW9uIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIGZvciB0aGlzIHBhZ2UuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHJldHVybnMgVGhlIGludGVudEJhc2VkTmF2aWdhdGlvbiBjb250cm9sbGVyIGV4dGVuc2lvblxuXHQgKi9cblx0Z2V0SW50ZW50QmFzZWROYXZpZ2F0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmludGVudEJhc2VkTmF2aWdhdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBBY2Nlc3MgYW55IGNvbnRyb2wgYnkgSUQuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5FeHRlbnNpb25BUEkjYnlJZFxuXHQgKiBAcGFyYW0gc0lkIElEIG9mIHRoZSBjb250cm9sIHdpdGhvdXQgdGhlIHZpZXcgcHJlZml4LiBFaXRoZXIgdGhlIElEIHByZWZpeGVkIGJ5IFNBUCBGaW9yaSBlbGVtZW50c1xuXHQgKiAoZm9yIGV4YW1wbGUgd2l0aCB0aGUgc2VjdGlvbikgb3IgdGhlIGNvbnRyb2wgSUQgb25seS4gVGhlIGxhdHRlciB3b3JrcyBvbmx5IGZvciBhbiBleHRlbnNpb24gcnVubmluZyBpblxuXHQgKiB0aGUgc2FtZSBjb250ZXh0IChsaWtlIGluIHRoZSBzYW1lIHNlY3Rpb24pLiBZb3UgY2FuIHVzZSB0aGUgcHJlZml4IGZvciBTQVAgRmlvcmkgZWxlbWVudHMgdG8gYWxzbyBhY2Nlc3Mgb3RoZXIgY29udHJvbHMgbG9jYXRlZCBpbiBkaWZmZXJlbnQgc2VjdGlvbnMuXG5cdCAqIEByZXR1cm5zIFRoZSByZXF1ZXN0ZWQgY29udHJvbCwgaWYgZm91bmQgaW4gdGhlIHZpZXcuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRieUlkKHNJZDogc3RyaW5nKSB7XG5cdFx0bGV0IG9Db250cm9sID0gdGhpcy5fdmlldy5ieUlkKHNJZCk7XG5cblx0XHRpZiAoIW9Db250cm9sICYmIHRoaXMuX3ByZWZpeCkge1xuXHRcdFx0Ly8gZ2l2ZSBpdCBhIHRyeSB3aXRoIHRoZSBwcmVmaXhcblx0XHRcdG9Db250cm9sID0gdGhpcy5fdmlldy5ieUlkKGAke3RoaXMuX3ByZWZpeH0tLSR7c0lkfWApO1xuXHRcdH1cblxuXHRcdGlmIChvQ29udHJvbCkge1xuXHRcdFx0cmV0dXJuIG9Db250cm9sO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgYWNjZXNzIHRvIG1vZGVscyBtYW5hZ2VkIGJ5IFNBUCBGaW9yaSBlbGVtZW50cy48YnI+XG5cdCAqIFRoZSBmb2xsb3dpbmcgbW9kZWxzIGNhbiBiZSBhY2Nlc3NlZDpcblx0ICogPHVsPlxuXHQgKiA8bGk+dW5kZWZpbmVkOiB0aGUgdW5kZWZpbmVkIG1vZGVsIHJldHVybnMgdGhlIFNBUFVJNSBPRGF0YSBWNCBtb2RlbCBib3VuZCB0byB0aGlzIHBhZ2U8L2xpPlxuXHQgKiA8bGk+aTE4biAvIGZ1cnRoZXIgZGF0YSBtb2RlbHMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3Q8L2xpPlxuXHQgKiA8bGk+dWk6IHJldHVybnMgYSBTQVBVSTUgSlNPTiBtb2RlbCBjb250YWluaW5nIFVJIGluZm9ybWF0aW9uLlxuXHQgKiBPbmx5IHRoZSBmb2xsb3dpbmcgcHJvcGVydGllcyBhcmUgcHVibGljIGFuZCBzdXBwb3J0ZWQ6XG5cdCAqIFx0PHVsPlxuXHQgKiAgICAgPGxpPmlzRWRpdGFibGU6IHNldCB0byB0cnVlIGlmIHRoZSBhcHBsaWNhdGlvbiBpcyBpbiBlZGl0IG1vZGU8L2xpPlxuXHQgKiAgPC91bD5cblx0ICogPC9saT5cblx0ICogPC91bD4uXG5cdCAqIGVkaXRNb2RlIGlzIGRlcHJlY2F0ZWQgYW5kIHNob3VsZCBub3QgYmUgdXNlZCBhbnltb3JlLiBVc2UgaXNFZGl0YWJsZSBpbnN0ZWFkLlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuRXh0ZW5zaW9uQVBJI2dldE1vZGVsXG5cdCAqIEBwYXJhbSBzTW9kZWxOYW1lIE5hbWUgb2YgdGhlIG1vZGVsXG5cdCAqIEByZXR1cm5zIFRoZSByZXF1aXJlZCBtb2RlbFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRNb2RlbChzTW9kZWxOYW1lPzogc3RyaW5nKTogTW9kZWwgfCB1bmRlZmluZWQge1xuXHRcdGxldCBvQXBwQ29tcG9uZW50O1xuXG5cdFx0aWYgKHNNb2RlbE5hbWUgJiYgc01vZGVsTmFtZSAhPT0gXCJ1aVwiKSB7XG5cdFx0XHRvQXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KHRoaXMuX3ZpZXcpO1xuXHRcdFx0aWYgKCFvQXBwQ29tcG9uZW50LmdldE1hbmlmZXN0RW50cnkoXCJzYXAudWk1XCIpLm1vZGVsc1tzTW9kZWxOYW1lXSkge1xuXHRcdFx0XHQvLyBkb24ndCBhbGxvdyBhY2Nlc3MgdG8gb3VyIGludGVybmFsIG1vZGVsc1xuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLl92aWV3LmdldE1vZGVsKHNNb2RlbE5hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFkZCBhbnkgY29udHJvbCBhcyBhIGRlcGVuZGVudCBjb250cm9sIHRvIHRoaXMgU0FQIEZpb3JpIGVsZW1lbnRzIHBhZ2UuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5FeHRlbnNpb25BUEkjYWRkRGVwZW5kZW50XG5cdCAqIEBwYXJhbSBvQ29udHJvbCBDb250cm9sIHRvIGJlIGFkZGVkIGFzIGEgZGVwZW5kZW50IGNvbnRyb2xcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YWRkRGVwZW5kZW50KG9Db250cm9sOiBDb250cm9sKSB7XG5cdFx0dGhpcy5fdmlldy5hZGREZXBlbmRlbnQob0NvbnRyb2wpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZSBhIGRlcGVuZGVudCBjb250cm9sIGZyb20gdGhpcyBTQVAgRmlvcmkgZWxlbWVudHMgcGFnZS5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLkV4dGVuc2lvbkFQSSNyZW1vdmVEZXBlbmRlbnRcblx0ICogQHBhcmFtIG9Db250cm9sIENvbnRyb2wgdG8gYmUgYWRkZWQgYXMgYSBkZXBlbmRlbnQgY29udHJvbFxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRyZW1vdmVEZXBlbmRlbnQob0NvbnRyb2w6IENvbnRyb2wpIHtcblx0XHR0aGlzLl92aWV3LnJlbW92ZURlcGVuZGVudChvQ29udHJvbCk7XG5cdH1cblxuXHQvKipcblx0ICogTmF2aWdhdGUgdG8gYW5vdGhlciB0YXJnZXQuXG5cdCAqXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5FeHRlbnNpb25BUEkjbmF2aWdhdGVUb1RhcmdldFxuXHQgKiBAcGFyYW0gc1RhcmdldCBOYW1lIG9mIHRoZSB0YXJnZXQgcm91dGVcblx0ICogQHBhcmFtIFtvQ29udGV4dF0gQ29udGV4dCBpbnN0YW5jZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRuYXZpZ2F0ZVRvVGFyZ2V0KHNUYXJnZXQ6IHN0cmluZywgb0NvbnRleHQ6IENvbnRleHQpOiB2b2lkIHtcblx0XHR0aGlzLl9jb250cm9sbGVyLl9yb3V0aW5nLm5hdmlnYXRlVG9UYXJnZXQob0NvbnRleHQsIHNUYXJnZXQpO1xuXHR9XG5cblx0LyoqXG5cdCAqIExvYWQgYSBmcmFnbWVudCBhbmQgZ28gdGhyb3VnaCB0aGUgdGVtcGxhdGUgcHJlcHJvY2Vzc29yIHdpdGggdGhlIGN1cnJlbnQgcGFnZSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuRXh0ZW5zaW9uQVBJI2xvYWRGcmFnbWVudFxuXHQgKiBAcGFyYW0gbVNldHRpbmdzIFRoZSBzZXR0aW5ncyBvYmplY3Rcblx0ICogQHBhcmFtIG1TZXR0aW5ncy5pZCBUaGUgSUQgb2YgdGhlIGZyYWdtZW50IGl0c2VsZlxuXHQgKiBAcGFyYW0gbVNldHRpbmdzLm5hbWUgVGhlIG5hbWUgb2YgdGhlIGZyYWdtZW50IHRvIGJlIGxvYWRlZFxuXHQgKiBAcGFyYW0gbVNldHRpbmdzLmNvbnRyb2xsZXIgVGhlIGNvbnRyb2xsZXIgdG8gYmUgYXR0YWNoZWQgdG8gdGhlIGZyYWdtZW50XG5cdCAqIEBwYXJhbSBtU2V0dGluZ3MuY29udGV4dFBhdGggVGhlIGNvbnRleHRQYXRoIHRvIGJlIHVzZWQgZm9yIHRoZSB0ZW1wbGF0aW5nIHByb2Nlc3Ncblx0ICogQHBhcmFtIG1TZXR0aW5ncy5pbml0aWFsQmluZGluZ0NvbnRleHQgVGhlIGluaXRpYWwgYmluZGluZyBjb250ZXh0XG5cdCAqIEByZXR1cm5zIFRoZSBmcmFnbWVudCBkZWZpbml0aW9uXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGxvYWRGcmFnbWVudChtU2V0dGluZ3M6IHtcblx0XHRpZDogc3RyaW5nO1xuXHRcdG5hbWU6IHN0cmluZztcblx0XHRjb250cm9sbGVyOiBvYmplY3Q7XG5cdFx0Y29udGV4dFBhdGg6IHN0cmluZztcblx0XHRpbml0aWFsQmluZGluZ0NvbnRleHQ6IENvbnRleHQ7XG5cdH0pOiBQcm9taXNlPEVsZW1lbnQgfCBFbGVtZW50W10+IHtcblx0XHRjb25zdCBvVGVtcGxhdGVDb21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3IodGhpcy5fdmlldykgYXMgRW5oYW5jZVdpdGhVSTU8VGVtcGxhdGVDb21wb25lbnQ+O1xuXHRcdGNvbnN0IG9QYWdlTW9kZWwgPSB0aGlzLl92aWV3LmdldE1vZGVsKFwiX3BhZ2VNb2RlbFwiKTtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gdGhpcy5nZXRNb2RlbCgpPy5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBtVmlld0RhdGEgPSBvVGVtcGxhdGVDb21wb25lbnQuZ2V0Vmlld0RhdGEoKTtcblx0XHRjb25zdCBvVmlld0RhdGFNb2RlbCA9IG5ldyBKU09OTW9kZWwobVZpZXdEYXRhKSxcblx0XHRcdG9QcmVwcm9jZXNzb3JTZXR0aW5ncyA9IHtcblx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0XCJjb250ZXh0UGF0aFwiOiBvTWV0YU1vZGVsPy5jcmVhdGVCaW5kaW5nQ29udGV4dChtU2V0dGluZ3MuY29udGV4dFBhdGggfHwgYC8ke29UZW1wbGF0ZUNvbXBvbmVudC5nZXRFbnRpdHlTZXQoKX1gKSxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0OiBvUGFnZU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiLCB1bmRlZmluZWQsIHsgbm9SZXNvbHZlOiB0cnVlIH0pLFxuXHRcdFx0XHRcdHZpZXdEYXRhOiBtVmlld0RhdGEgPyBvVmlld0RhdGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIikgOiBudWxsXG5cdFx0XHRcdH0sXG5cdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFwiY29udGV4dFBhdGhcIjogb01ldGFNb2RlbCxcblx0XHRcdFx0XHRjb252ZXJ0ZXJDb250ZXh0OiBvUGFnZU1vZGVsLFxuXHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbCxcblx0XHRcdFx0XHR2aWV3RGF0YTogb1ZpZXdEYXRhTW9kZWxcblx0XHRcdFx0fSxcblx0XHRcdFx0YXBwQ29tcG9uZW50OiBDb21tb25VdGlscy5nZXRBcHBDb21wb25lbnQodGhpcy5fdmlldylcblx0XHRcdH07XG5cdFx0Y29uc3Qgb1RlbXBsYXRlUHJvbWlzZSA9IENvbW1vblV0aWxzLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KG1TZXR0aW5ncy5uYW1lLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIHtcblx0XHRcdGNvbnRyb2xsZXI6IG1TZXR0aW5ncy5jb250cm9sbGVyIHx8IHRoaXMsXG5cdFx0XHRpc1hNTDogZmFsc2UsXG5cdFx0XHRpZDogbVNldHRpbmdzLmlkXG5cdFx0fSk7XG5cdFx0b1RlbXBsYXRlUHJvbWlzZVxuXHRcdFx0LnRoZW4oKG9GcmFnbWVudDogYW55KSA9PiB7XG5cdFx0XHRcdGlmIChtU2V0dGluZ3MuaW5pdGlhbEJpbmRpbmdDb250ZXh0ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRvRnJhZ21lbnQuc2V0QmluZGluZ0NvbnRleHQobVNldHRpbmdzLmluaXRpYWxCaW5kaW5nQ29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5hZGREZXBlbmRlbnQob0ZyYWdtZW50KTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihvRXJyb3IpO1xuXHRcdFx0fSk7XG5cdFx0cmV0dXJuIG9UZW1wbGF0ZVByb21pc2U7XG5cdH1cblxuXHQvKipcblx0ICogVHJpZ2dlcnMgYW4gdXBkYXRlIG9mIHRoZSBhcHAgc3RhdGUuXG5cdCAqIFNob3VsZCBiZSBjYWxsZWQgaWYgdGhlIHN0YXRlIG9mIGEgY29udHJvbCwgb3IgYW55IG90aGVyIHN0YXRlLXJlbGV2YW50IGluZm9ybWF0aW9uLCB3YXMgY2hhbmdlZC5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLkV4dGVuc2lvbkFQSSN1cGRhdGVBcHBTdGF0ZVxuXHQgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSBuZXcgYXBwIHN0YXRlIG9iamVjdC5cblx0ICogQHB1YmxpY1xuXHQgKi9cblx0dXBkYXRlQXBwU3RhdGUoKTogUHJvbWlzZTx2b2lkPiB8IHVuZGVmaW5lZCB7XG5cdFx0cmV0dXJuIHRoaXMuX2NvbnRyb2xsZXIuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0QXBwU3RhdGVIYW5kbGVyKCkuY3JlYXRlQXBwU3RhdGUoKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBFeHRlbnNpb25BUEk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7RUFtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUkEsSUFVTUEsWUFBWSxXQURqQkMsY0FBYyxDQUFDLDBCQUEwQixDQUFDLFVBT3pDQyxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQTRDLENBQUMsQ0FBQyxVQU8vREQsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUEyQyxDQUFDLENBQUMsVUFPOURELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBeUQsQ0FBQyxDQUFDO0lBQUE7SUFuQjdFO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7O0lBR0M7QUFDRDtBQUNBO0FBQ0E7QUFDQTs7SUFHQztBQUNE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