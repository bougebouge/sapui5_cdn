/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/BaseController", "sap/fe/core/controllerextensions/EditFlow", "sap/fe/core/controllerextensions/IntentBasedNavigation", "sap/fe/core/controllerextensions/InternalEditFlow", "sap/fe/core/controllerextensions/InternalIntentBasedNavigation", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/MassEdit", "sap/fe/core/controllerextensions/MessageHandler", "sap/fe/core/controllerextensions/PageReady", "sap/fe/core/controllerextensions/Paginator", "sap/fe/core/controllerextensions/Placeholder", "sap/fe/core/controllerextensions/Routing", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/SideEffects", "sap/fe/core/controllerextensions/ViewState", "sap/fe/core/ExtensionAPI", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/mvc/OverrideExecution"], function (BaseController, EditFlow, IntentBasedNavigation, InternalEditFlow, InternalIntentBasedNavigation, InternalRouting, MassEdit, MessageHandler, PageReady, Paginator, Placeholder, Routing, Share, SideEffects, ViewState, ExtensionAPI, ClassSupport, OverrideExecution) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14;
  var usingExtension = ClassSupport.usingExtension;
  var publicExtension = ClassSupport.publicExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Base controller class for your custom page used inside an SAP Fiori elements application.
   *
   * This controller provides preconfigured extensions that will ensure you have the basic functionalities required to use the building blocks.
   *
   * @hideconstructor
   * @public
   * @since 1.88.0
   */
  var PageController = (_dec = defineUI5Class("sap.fe.core.PageController"), _dec2 = usingExtension(Routing), _dec3 = usingExtension(InternalRouting), _dec4 = usingExtension(EditFlow), _dec5 = usingExtension(InternalEditFlow), _dec6 = usingExtension(IntentBasedNavigation), _dec7 = usingExtension(InternalIntentBasedNavigation), _dec8 = usingExtension(PageReady), _dec9 = usingExtension(MessageHandler), _dec10 = usingExtension(Share), _dec11 = usingExtension(Paginator), _dec12 = usingExtension(ViewState), _dec13 = usingExtension(Placeholder), _dec14 = usingExtension(SideEffects), _dec15 = usingExtension(MassEdit), _dec16 = publicExtension(), _dec17 = publicExtension(), _dec18 = publicExtension(), _dec19 = publicExtension(), _dec20 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_BaseController) {
    _inheritsLoose(PageController, _BaseController);
    function PageController() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseController.call.apply(_BaseController, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "routing", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_routing", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "editFlow", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_editFlow", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "intentBasedNavigation", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_intentBasedNavigation", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "pageReady", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageHandler", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "share", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "paginator", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "viewState", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "placeholder", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "_sideEffects", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "massEdit", _descriptor14, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = PageController.prototype;
    /**
     * @private
     * @name sap.fe.core.PageController.getMetadata
     * @function
     */
    /**
     * @private
     * @name sap.fe.core.PageController.extend
     * @function
     */
    _proto.onInit = function onInit() {
      var oUIModel = this.getAppComponent().getModel("ui"),
        oInternalModel = this.getAppComponent().getModel("internal"),
        sPath = "/pages/".concat(this.getView().getId());
      oUIModel.setProperty(sPath, {
        controls: {}
      });
      oInternalModel.setProperty(sPath, {
        controls: {},
        collaboration: {}
      });
      this.getView().bindElement({
        path: sPath,
        model: "ui"
      });
      this.getView().bindElement({
        path: sPath,
        model: "internal"
      });

      // for the time being provide it also pageInternal as some macros access it - to be removed
      this.getView().bindElement({
        path: sPath,
        model: "pageInternal"
      });
      this.getView().setModel(oInternalModel, "pageInternal");

      // as the model propagation happens after init but we actually want to access the binding context in the
      // init phase already setting the model here
      this.getView().setModel(oUIModel, "ui");
      this.getView().setModel(oInternalModel, "internal");
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      if (this.placeholder.attachHideCallback) {
        this.placeholder.attachHideCallback();
      }
    }

    /**
     * Get the extension API for the current page.
     *
     * @public
     * @returns The extension API.
     */;
    _proto.getExtensionAPI = function getExtensionAPI() {
      if (!this.extensionAPI) {
        this.extensionAPI = new ExtensionAPI(this);
      }
      return this.extensionAPI;
    }
    // We specify the extensibility here the same way as it is done in the object page controller
    // since the specification here overrides it and if we do not specify anything here, the
    // behavior defaults to an execute instead!
    // TODO This may not be ideal, since it also influences the list report controller but currently it's the best solution.
    ;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onPageReady = function onPageReady(mParameters) {
      // Apply app state only after the page is ready with the first section selected
      this.getAppComponent().getAppStateHandler().applyAppState();
    };
    return PageController;
  }(BaseController), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "routing", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "_routing", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "editFlow", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "_editFlow", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "intentBasedNavigation", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "_intentBasedNavigation", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "pageReady", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "messageHandler", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "share", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "paginator", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "viewState", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "placeholder", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "_sideEffects", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "massEdit", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec16], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeRendering", [_dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeRendering"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getExtensionAPI", [_dec18], Object.getOwnPropertyDescriptor(_class2.prototype, "getExtensionAPI"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPageReady", [_dec19, _dec20], Object.getOwnPropertyDescriptor(_class2.prototype, "onPageReady"), _class2.prototype)), _class2)) || _class);
  return PageController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWdlQ29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwidXNpbmdFeHRlbnNpb24iLCJSb3V0aW5nIiwiSW50ZXJuYWxSb3V0aW5nIiwiRWRpdEZsb3ciLCJJbnRlcm5hbEVkaXRGbG93IiwiSW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJQYWdlUmVhZHkiLCJNZXNzYWdlSGFuZGxlciIsIlNoYXJlIiwiUGFnaW5hdG9yIiwiVmlld1N0YXRlIiwiUGxhY2Vob2xkZXIiLCJTaWRlRWZmZWN0cyIsIk1hc3NFZGl0IiwicHVibGljRXh0ZW5zaW9uIiwiZXh0ZW5zaWJsZSIsIk92ZXJyaWRlRXhlY3V0aW9uIiwiQWZ0ZXIiLCJvbkluaXQiLCJvVUlNb2RlbCIsImdldEFwcENvbXBvbmVudCIsImdldE1vZGVsIiwib0ludGVybmFsTW9kZWwiLCJzUGF0aCIsImdldFZpZXciLCJnZXRJZCIsInNldFByb3BlcnR5IiwiY29udHJvbHMiLCJjb2xsYWJvcmF0aW9uIiwiYmluZEVsZW1lbnQiLCJwYXRoIiwibW9kZWwiLCJzZXRNb2RlbCIsIm9uQmVmb3JlUmVuZGVyaW5nIiwicGxhY2Vob2xkZXIiLCJhdHRhY2hIaWRlQ2FsbGJhY2siLCJnZXRFeHRlbnNpb25BUEkiLCJleHRlbnNpb25BUEkiLCJFeHRlbnNpb25BUEkiLCJvblBhZ2VSZWFkeSIsIm1QYXJhbWV0ZXJzIiwiZ2V0QXBwU3RhdGVIYW5kbGVyIiwiYXBwbHlBcHBTdGF0ZSIsIkJhc2VDb250cm9sbGVyIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQYWdlQ29udHJvbGxlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQmFzZUNvbnRyb2xsZXIgZnJvbSBcInNhcC9mZS9jb3JlL0Jhc2VDb250cm9sbGVyXCI7XG5pbXBvcnQgRWRpdEZsb3cgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0VkaXRGbG93XCI7XG5pbXBvcnQgSW50ZW50QmFzZWROYXZpZ2F0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlbnRCYXNlZE5hdmlnYXRpb25cIjtcbmltcG9ydCBJbnRlcm5hbEVkaXRGbG93IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbEVkaXRGbG93XCI7XG5pbXBvcnQgSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb24gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL0ludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5pbXBvcnQgSW50ZXJuYWxSb3V0aW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbFJvdXRpbmdcIjtcbmltcG9ydCBNYXNzRWRpdCBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvTWFzc0VkaXRcIjtcbmltcG9ydCBNZXNzYWdlSGFuZGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvTWVzc2FnZUhhbmRsZXJcIjtcbmltcG9ydCBQYWdlUmVhZHkgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BhZ2VSZWFkeVwiO1xuaW1wb3J0IFBhZ2luYXRvciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUGFnaW5hdG9yXCI7XG5pbXBvcnQgUGxhY2Vob2xkZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL1BsYWNlaG9sZGVyXCI7XG5pbXBvcnQgUm91dGluZyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvUm91dGluZ1wiO1xuaW1wb3J0IFNoYXJlIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9TaGFyZVwiO1xuaW1wb3J0IFNpZGVFZmZlY3RzIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9TaWRlRWZmZWN0c1wiO1xuaW1wb3J0IFZpZXdTdGF0ZSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvVmlld1N0YXRlXCI7XG5pbXBvcnQgRXh0ZW5zaW9uQVBJIGZyb20gXCJzYXAvZmUvY29yZS9FeHRlbnNpb25BUElcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBleHRlbnNpYmxlLCBwdWJsaWNFeHRlbnNpb24sIHVzaW5nRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcblxuLyoqXG4gKiBCYXNlIGNvbnRyb2xsZXIgY2xhc3MgZm9yIHlvdXIgY3VzdG9tIHBhZ2UgdXNlZCBpbnNpZGUgYW4gU0FQIEZpb3JpIGVsZW1lbnRzIGFwcGxpY2F0aW9uLlxuICpcbiAqIFRoaXMgY29udHJvbGxlciBwcm92aWRlcyBwcmVjb25maWd1cmVkIGV4dGVuc2lvbnMgdGhhdCB3aWxsIGVuc3VyZSB5b3UgaGF2ZSB0aGUgYmFzaWMgZnVuY3Rpb25hbGl0aWVzIHJlcXVpcmVkIHRvIHVzZSB0aGUgYnVpbGRpbmcgYmxvY2tzLlxuICpcbiAqIEBoaWRlY29uc3RydWN0b3JcbiAqIEBwdWJsaWNcbiAqIEBzaW5jZSAxLjg4LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvcmUuUGFnZUNvbnRyb2xsZXJcIilcbmNsYXNzIFBhZ2VDb250cm9sbGVyIGV4dGVuZHMgQmFzZUNvbnRyb2xsZXIge1xuXHRAdXNpbmdFeHRlbnNpb24oUm91dGluZylcblx0cm91dGluZyE6IFJvdXRpbmc7XG5cdEB1c2luZ0V4dGVuc2lvbihJbnRlcm5hbFJvdXRpbmcpXG5cdF9yb3V0aW5nITogSW50ZXJuYWxSb3V0aW5nO1xuXHRAdXNpbmdFeHRlbnNpb24oRWRpdEZsb3cpXG5cdGVkaXRGbG93ITogRWRpdEZsb3c7XG5cdEB1c2luZ0V4dGVuc2lvbihJbnRlcm5hbEVkaXRGbG93KVxuXHRfZWRpdEZsb3chOiBJbnRlcm5hbEVkaXRGbG93O1xuXHRAdXNpbmdFeHRlbnNpb24oSW50ZW50QmFzZWROYXZpZ2F0aW9uKVxuXHRpbnRlbnRCYXNlZE5hdmlnYXRpb24hOiBJbnRlbnRCYXNlZE5hdmlnYXRpb247XG5cdEB1c2luZ0V4dGVuc2lvbihJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbilcblx0X2ludGVudEJhc2VkTmF2aWdhdGlvbiE6IEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uO1xuXHRAdXNpbmdFeHRlbnNpb24oUGFnZVJlYWR5KVxuXHRwYWdlUmVhZHkhOiBQYWdlUmVhZHk7XG5cdEB1c2luZ0V4dGVuc2lvbihNZXNzYWdlSGFuZGxlcilcblx0bWVzc2FnZUhhbmRsZXIhOiBNZXNzYWdlSGFuZGxlcjtcblx0QHVzaW5nRXh0ZW5zaW9uKFNoYXJlKVxuXHRzaGFyZSE6IFNoYXJlO1xuXHRAdXNpbmdFeHRlbnNpb24oUGFnaW5hdG9yKVxuXHRwYWdpbmF0b3IhOiBQYWdpbmF0b3I7XG5cdEB1c2luZ0V4dGVuc2lvbihWaWV3U3RhdGUpXG5cdHZpZXdTdGF0ZSE6IFZpZXdTdGF0ZTtcblx0QHVzaW5nRXh0ZW5zaW9uKFBsYWNlaG9sZGVyKVxuXHRwbGFjZWhvbGRlciE6IFBsYWNlaG9sZGVyO1xuXHRAdXNpbmdFeHRlbnNpb24oU2lkZUVmZmVjdHMpXG5cdF9zaWRlRWZmZWN0cyE6IFNpZGVFZmZlY3RzO1xuXHRAdXNpbmdFeHRlbnNpb24oTWFzc0VkaXQpXG5cdG1hc3NFZGl0ITogTWFzc0VkaXQ7XG5cdC8vIEBQdWJsaWNcblx0Ly8gZ2V0VmlldygpOiB7IGdldENvbnRyb2xsZXIoKTogUGFnZUNvbnRyb2xsZXIgfSAmIFZpZXcge1xuXHQvLyBcdHJldHVybiBzdXBlci5nZXRWaWV3KCkgYXMgYW55O1xuXHQvLyB9XG5cblx0cHJvdGVjdGVkIGV4dGVuc2lvbkFQST86IEV4dGVuc2lvbkFQSTtcblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLlBhZ2VDb250cm9sbGVyLmdldE1ldGFkYXRhXG5cdCAqIEBmdW5jdGlvblxuXHQgKi9cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLlBhZ2VDb250cm9sbGVyLmV4dGVuZFxuXHQgKiBAZnVuY3Rpb25cblx0ICovXG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdG9uSW5pdCgpIHtcblx0XHRjb25zdCBvVUlNb2RlbCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0TW9kZWwoXCJ1aVwiKSBhcyBKU09OTW9kZWwsXG5cdFx0XHRvSW50ZXJuYWxNb2RlbCA9IHRoaXMuZ2V0QXBwQ29tcG9uZW50KCkuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWwsXG5cdFx0XHRzUGF0aCA9IGAvcGFnZXMvJHt0aGlzLmdldFZpZXcoKS5nZXRJZCgpfWA7XG5cblx0XHRvVUlNb2RlbC5zZXRQcm9wZXJ0eShzUGF0aCwge1xuXHRcdFx0Y29udHJvbHM6IHt9XG5cdFx0fSk7XG5cdFx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoc1BhdGgsIHtcblx0XHRcdGNvbnRyb2xzOiB7fSxcblx0XHRcdGNvbGxhYm9yYXRpb246IHt9XG5cdFx0fSk7XG5cdFx0dGhpcy5nZXRWaWV3KCkuYmluZEVsZW1lbnQoe1xuXHRcdFx0cGF0aDogc1BhdGgsXG5cdFx0XHRtb2RlbDogXCJ1aVwiXG5cdFx0fSk7XG5cdFx0dGhpcy5nZXRWaWV3KCkuYmluZEVsZW1lbnQoe1xuXHRcdFx0cGF0aDogc1BhdGgsXG5cdFx0XHRtb2RlbDogXCJpbnRlcm5hbFwiXG5cdFx0fSk7XG5cblx0XHQvLyBmb3IgdGhlIHRpbWUgYmVpbmcgcHJvdmlkZSBpdCBhbHNvIHBhZ2VJbnRlcm5hbCBhcyBzb21lIG1hY3JvcyBhY2Nlc3MgaXQgLSB0byBiZSByZW1vdmVkXG5cdFx0dGhpcy5nZXRWaWV3KCkuYmluZEVsZW1lbnQoe1xuXHRcdFx0cGF0aDogc1BhdGgsXG5cdFx0XHRtb2RlbDogXCJwYWdlSW50ZXJuYWxcIlxuXHRcdH0pO1xuXHRcdHRoaXMuZ2V0VmlldygpLnNldE1vZGVsKG9JbnRlcm5hbE1vZGVsLCBcInBhZ2VJbnRlcm5hbFwiKTtcblxuXHRcdC8vIGFzIHRoZSBtb2RlbCBwcm9wYWdhdGlvbiBoYXBwZW5zIGFmdGVyIGluaXQgYnV0IHdlIGFjdHVhbGx5IHdhbnQgdG8gYWNjZXNzIHRoZSBiaW5kaW5nIGNvbnRleHQgaW4gdGhlXG5cdFx0Ly8gaW5pdCBwaGFzZSBhbHJlYWR5IHNldHRpbmcgdGhlIG1vZGVsIGhlcmVcblx0XHR0aGlzLmdldFZpZXcoKS5zZXRNb2RlbChvVUlNb2RlbCwgXCJ1aVwiKTtcblx0XHR0aGlzLmdldFZpZXcoKS5zZXRNb2RlbChvSW50ZXJuYWxNb2RlbCwgXCJpbnRlcm5hbFwiKTtcblx0fVxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0b25CZWZvcmVSZW5kZXJpbmcoKSB7XG5cdFx0aWYgKHRoaXMucGxhY2Vob2xkZXIuYXR0YWNoSGlkZUNhbGxiYWNrKSB7XG5cdFx0XHR0aGlzLnBsYWNlaG9sZGVyLmF0dGFjaEhpZGVDYWxsYmFjaygpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGV4dGVuc2lvbiBBUEkgZm9yIHRoZSBjdXJyZW50IHBhZ2UuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHJldHVybnMgVGhlIGV4dGVuc2lvbiBBUEkuXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0Z2V0RXh0ZW5zaW9uQVBJKCk6IEV4dGVuc2lvbkFQSSB7XG5cdFx0aWYgKCF0aGlzLmV4dGVuc2lvbkFQSSkge1xuXHRcdFx0dGhpcy5leHRlbnNpb25BUEkgPSBuZXcgRXh0ZW5zaW9uQVBJKHRoaXMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5leHRlbnNpb25BUEk7XG5cdH1cblx0Ly8gV2Ugc3BlY2lmeSB0aGUgZXh0ZW5zaWJpbGl0eSBoZXJlIHRoZSBzYW1lIHdheSBhcyBpdCBpcyBkb25lIGluIHRoZSBvYmplY3QgcGFnZSBjb250cm9sbGVyXG5cdC8vIHNpbmNlIHRoZSBzcGVjaWZpY2F0aW9uIGhlcmUgb3ZlcnJpZGVzIGl0IGFuZCBpZiB3ZSBkbyBub3Qgc3BlY2lmeSBhbnl0aGluZyBoZXJlLCB0aGVcblx0Ly8gYmVoYXZpb3IgZGVmYXVsdHMgdG8gYW4gZXhlY3V0ZSBpbnN0ZWFkIVxuXHQvLyBUT0RPIFRoaXMgbWF5IG5vdCBiZSBpZGVhbCwgc2luY2UgaXQgYWxzbyBpbmZsdWVuY2VzIHRoZSBsaXN0IHJlcG9ydCBjb250cm9sbGVyIGJ1dCBjdXJyZW50bHkgaXQncyB0aGUgYmVzdCBzb2x1dGlvbi5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdG9uUGFnZVJlYWR5KG1QYXJhbWV0ZXJzOiBhbnkpIHtcblx0XHQvLyBBcHBseSBhcHAgc3RhdGUgb25seSBhZnRlciB0aGUgcGFnZSBpcyByZWFkeSB3aXRoIHRoZSBmaXJzdCBzZWN0aW9uIHNlbGVjdGVkXG5cdFx0dGhpcy5nZXRBcHBDb21wb25lbnQoKS5nZXRBcHBTdGF0ZUhhbmRsZXIoKS5hcHBseUFwcFN0YXRlKCk7XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IFBhZ2VDb250cm9sbGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7RUFvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBUkEsSUFVTUEsY0FBYyxXQURuQkMsY0FBYyxDQUFDLDRCQUE0QixD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