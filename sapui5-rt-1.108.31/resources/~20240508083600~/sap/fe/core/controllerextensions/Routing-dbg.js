/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/ModelHelper", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution"], function (ClassSupport, ModelHelper, ControllerExtension, OverrideExecution) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * A controller extension offering hooks into the routing flow of the application
   *
   * @hideconstructor
   * @public
   * @since 1.86.0
   */
  var Routing = (_dec = defineUI5Class("sap.fe.core.controllerextensions.Routing"), _dec2 = publicExtension(), _dec3 = extensible(OverrideExecution.After), _dec4 = publicExtension(), _dec5 = finalExtension(), _dec6 = publicExtension(), _dec7 = extensible(OverrideExecution.After), _dec8 = publicExtension(), _dec9 = extensible(OverrideExecution.After), _dec10 = publicExtension(), _dec11 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(Routing, _ControllerExtension);
    function Routing() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = Routing.prototype;
    /**
     * @private
     * @name sap.fe.core.controllerextensions.Routing.getMetadata
     * @function
     */
    /**
     * @private
     * @name sap.fe.core.controllerextensions.Routing.extend
     * @function
     */
    /**
     * This function can be used to intercept the routing event happening during the normal process of navigating from one page to another.
     *
     * If declared as an extension, it allows you to intercept and change the normal navigation flow.
     * If you decide to do your own navigation processing, you can return `true` to prevent the default routing behavior.
     *
     * This function is meant to be individually overridden by consuming controllers, but not to be called directly.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param mNavigationParameters Object containing row context and page context
     * @param mNavigationParameters.bindingContext The currently selected context
     * @returns `true` to prevent the default execution, false to keep the standard behavior
     * @alias sap.fe.core.controllerextensions.Routing#onBeforeNavigation
     * @public
     * @since 1.86.0
     */
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeNavigation = function onBeforeNavigation(mNavigationParameters) {
      // to be overriden by the application
      return false;
    }

    /**
     * Allows navigation to a specific context.
     *
     * @param oContext Object containing the context to be navigated
     * @alias sap.fe.core.controllerextensions.Routing#navigate
     * @public
     * @since 1.90.0
     */;
    _proto.navigate = function navigate(oContext) {
      this.base._routing.navigateToContext(oContext);
    }

    /**
     * This function is used to intercept the routing event before binding a page.
     *
     * If it is declared as an extension, it allows you to intercept and change the normal flow of binding.
     *
     * This function is not called directly, but overridden separately by consuming controllers.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oContext Object containing the context for the navigation
     * @alias sap.fe.core.controllerextensions.Routing#onBeforeBinding
     * @public
     * @since 1.90.0
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeBinding = function onBeforeBinding(oContext) {
      // to be overriden by the application
    }

    /**
     * This function is used to intercept the routing event after binding a page.
     *
     * If it is declared as an extension, it allows you to intercept and change the normal flow of binding.
     *
     * This function is not called directly, but overridden separately by consuming controllers.
     * The override execution is: {@link sap.ui.core.mvc.OverrideExecution.After}.
     *
     * @param oContext Object containing the context to be navigated
     * @alias sap.fe.core.controllerextensions.Routing#onAfterBinding
     * @public
     * @since 1.90.0
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onAfterBinding = function onAfterBinding(oContext) {
      // to be overriden by the application
    }

    /**
     * Navigate to another target.
     *
     * @alias sap.fe.core.controllerextensions.Routing#navigateToRoute
     * @param sTargetRouteName Name of the target route
     * @param oParameters Parameters to be used with route to create the target hash
     * @returns Promise that is resolved when the navigation is finalized
     * @public
     */;
    _proto.navigateToRoute = function navigateToRoute(sTargetRouteName, oParameters) {
      var oMetaModel = this.base.getModel().getMetaModel();
      var bIsStickyMode = ModelHelper.isStickySessionSupported(oMetaModel);
      if (!oParameters) {
        oParameters = {};
      }
      oParameters.bIsStickyMode = bIsStickyMode;
      return this.base._routing.navigateToRoute(sTargetRouteName, oParameters);
    };
    return Routing;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onBeforeNavigation", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeNavigation"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigate", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "navigate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeBinding", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onAfterBinding", [_dec8, _dec9], Object.getOwnPropertyDescriptor(_class2.prototype, "onAfterBinding"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateToRoute", [_dec10, _dec11], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateToRoute"), _class2.prototype)), _class2)) || _class);
  return Routing;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJSb3V0aW5nIiwiZGVmaW5lVUk1Q2xhc3MiLCJwdWJsaWNFeHRlbnNpb24iLCJleHRlbnNpYmxlIiwiT3ZlcnJpZGVFeGVjdXRpb24iLCJBZnRlciIsImZpbmFsRXh0ZW5zaW9uIiwib25CZWZvcmVOYXZpZ2F0aW9uIiwibU5hdmlnYXRpb25QYXJhbWV0ZXJzIiwibmF2aWdhdGUiLCJvQ29udGV4dCIsImJhc2UiLCJfcm91dGluZyIsIm5hdmlnYXRlVG9Db250ZXh0Iiwib25CZWZvcmVCaW5kaW5nIiwib25BZnRlckJpbmRpbmciLCJuYXZpZ2F0ZVRvUm91dGUiLCJzVGFyZ2V0Um91dGVOYW1lIiwib1BhcmFtZXRlcnMiLCJvTWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJiSXNTdGlja3lNb2RlIiwiTW9kZWxIZWxwZXIiLCJpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJSb3V0aW5nLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBleHRlbnNpYmxlLCBmaW5hbEV4dGVuc2lvbiwgcHVibGljRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxuLyoqXG4gKiBBIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIG9mZmVyaW5nIGhvb2tzIGludG8gdGhlIHJvdXRpbmcgZmxvdyBvZiB0aGUgYXBwbGljYXRpb25cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS44Ni4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlJvdXRpbmdcIilcbmNsYXNzIFJvdXRpbmcgZXh0ZW5kcyBDb250cm9sbGVyRXh0ZW5zaW9uIHtcblx0cHJpdmF0ZSBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cdC8qKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5Sb3V0aW5nLmdldE1ldGFkYXRhXG5cdCAqIEBmdW5jdGlvblxuXHQgKi9cblx0LyoqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlJvdXRpbmcuZXh0ZW5kXG5cdCAqIEBmdW5jdGlvblxuXHQgKi9cblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBjYW4gYmUgdXNlZCB0byBpbnRlcmNlcHQgdGhlIHJvdXRpbmcgZXZlbnQgaGFwcGVuaW5nIGR1cmluZyB0aGUgbm9ybWFsIHByb2Nlc3Mgb2YgbmF2aWdhdGluZyBmcm9tIG9uZSBwYWdlIHRvIGFub3RoZXIuXG5cdCAqXG5cdCAqIElmIGRlY2xhcmVkIGFzIGFuIGV4dGVuc2lvbiwgaXQgYWxsb3dzIHlvdSB0byBpbnRlcmNlcHQgYW5kIGNoYW5nZSB0aGUgbm9ybWFsIG5hdmlnYXRpb24gZmxvdy5cblx0ICogSWYgeW91IGRlY2lkZSB0byBkbyB5b3VyIG93biBuYXZpZ2F0aW9uIHByb2Nlc3NpbmcsIHlvdSBjYW4gcmV0dXJuIGB0cnVlYCB0byBwcmV2ZW50IHRoZSBkZWZhdWx0IHJvdXRpbmcgYmVoYXZpb3IuXG5cdCAqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgbWVhbnQgdG8gYmUgaW5kaXZpZHVhbGx5IG92ZXJyaWRkZW4gYnkgY29uc3VtaW5nIGNvbnRyb2xsZXJzLCBidXQgbm90IHRvIGJlIGNhbGxlZCBkaXJlY3RseS5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBtTmF2aWdhdGlvblBhcmFtZXRlcnMgT2JqZWN0IGNvbnRhaW5pbmcgcm93IGNvbnRleHQgYW5kIHBhZ2UgY29udGV4dFxuXHQgKiBAcGFyYW0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzLmJpbmRpbmdDb250ZXh0IFRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgY29udGV4dFxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgdG8gcHJldmVudCB0aGUgZGVmYXVsdCBleGVjdXRpb24sIGZhbHNlIHRvIGtlZXAgdGhlIHN0YW5kYXJkIGJlaGF2aW9yXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5Sb3V0aW5nI29uQmVmb3JlTmF2aWdhdGlvblxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjg2LjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5BZnRlcilcblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bnVzZWQtdmFyc1xuXHRvbkJlZm9yZU5hdmlnYXRpb24obU5hdmlnYXRpb25QYXJhbWV0ZXJzOiB7IGJpbmRpbmdDb250ZXh0OiBDb250ZXh0IH0pIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZW4gYnkgdGhlIGFwcGxpY2F0aW9uXG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFsbG93cyBuYXZpZ2F0aW9uIHRvIGEgc3BlY2lmaWMgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IE9iamVjdCBjb250YWluaW5nIHRoZSBjb250ZXh0IHRvIGJlIG5hdmlnYXRlZFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUm91dGluZyNuYXZpZ2F0ZVxuXHQgKiBAcHVibGljXG5cdCAqIEBzaW5jZSAxLjkwLjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZShvQ29udGV4dDogQ29udGV4dCkge1xuXHRcdHRoaXMuYmFzZS5fcm91dGluZy5uYXZpZ2F0ZVRvQ29udGV4dChvQ29udGV4dCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIGludGVyY2VwdCB0aGUgcm91dGluZyBldmVudCBiZWZvcmUgYmluZGluZyBhIHBhZ2UuXG5cdCAqXG5cdCAqIElmIGl0IGlzIGRlY2xhcmVkIGFzIGFuIGV4dGVuc2lvbiwgaXQgYWxsb3dzIHlvdSB0byBpbnRlcmNlcHQgYW5kIGNoYW5nZSB0aGUgbm9ybWFsIGZsb3cgb2YgYmluZGluZy5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBub3QgY2FsbGVkIGRpcmVjdGx5LCBidXQgb3ZlcnJpZGRlbiBzZXBhcmF0ZWx5IGJ5IGNvbnN1bWluZyBjb250cm9sbGVycy5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBPYmplY3QgY29udGFpbmluZyB0aGUgY29udGV4dCBmb3IgdGhlIG5hdmlnYXRpb25cblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlJvdXRpbmcjb25CZWZvcmVCaW5kaW5nXG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTAuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdG9uQmVmb3JlQmluZGluZyhvQ29udGV4dDogb2JqZWN0KSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGVuIGJ5IHRoZSBhcHBsaWNhdGlvblxuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gaXMgdXNlZCB0byBpbnRlcmNlcHQgdGhlIHJvdXRpbmcgZXZlbnQgYWZ0ZXIgYmluZGluZyBhIHBhZ2UuXG5cdCAqXG5cdCAqIElmIGl0IGlzIGRlY2xhcmVkIGFzIGFuIGV4dGVuc2lvbiwgaXQgYWxsb3dzIHlvdSB0byBpbnRlcmNlcHQgYW5kIGNoYW5nZSB0aGUgbm9ybWFsIGZsb3cgb2YgYmluZGluZy5cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBpcyBub3QgY2FsbGVkIGRpcmVjdGx5LCBidXQgb3ZlcnJpZGRlbiBzZXBhcmF0ZWx5IGJ5IGNvbnN1bWluZyBjb250cm9sbGVycy5cblx0ICogVGhlIG92ZXJyaWRlIGV4ZWN1dGlvbiBpczoge0BsaW5rIHNhcC51aS5jb3JlLm12Yy5PdmVycmlkZUV4ZWN1dGlvbi5BZnRlcn0uXG5cdCAqXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBPYmplY3QgY29udGFpbmluZyB0aGUgY29udGV4dCB0byBiZSBuYXZpZ2F0ZWRcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlJvdXRpbmcjb25BZnRlckJpbmRpbmdcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45MC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGV4dGVuc2libGUoT3ZlcnJpZGVFeGVjdXRpb24uQWZ0ZXIpXG5cdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW51c2VkLXZhcnNcblx0b25BZnRlckJpbmRpbmcob0NvbnRleHQ6IG9iamVjdCkge1xuXHRcdC8vIHRvIGJlIG92ZXJyaWRlbiBieSB0aGUgYXBwbGljYXRpb25cblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZSB0byBhbm90aGVyIHRhcmdldC5cblx0ICpcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlJvdXRpbmcjbmF2aWdhdGVUb1JvdXRlXG5cdCAqIEBwYXJhbSBzVGFyZ2V0Um91dGVOYW1lIE5hbWUgb2YgdGhlIHRhcmdldCByb3V0ZVxuXHQgKiBAcGFyYW0gb1BhcmFtZXRlcnMgUGFyYW1ldGVycyB0byBiZSB1c2VkIHdpdGggcm91dGUgdG8gY3JlYXRlIHRoZSB0YXJnZXQgaGFzaFxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBpcyBmaW5hbGl6ZWRcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdG5hdmlnYXRlVG9Sb3V0ZShzVGFyZ2V0Um91dGVOYW1lOiBzdHJpbmcsIG9QYXJhbWV0ZXJzPzogYW55KSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IHRoaXMuYmFzZS5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdGNvbnN0IGJJc1N0aWNreU1vZGUgPSBNb2RlbEhlbHBlci5pc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQob01ldGFNb2RlbCk7XG5cdFx0aWYgKCFvUGFyYW1ldGVycykge1xuXHRcdFx0b1BhcmFtZXRlcnMgPSB7fTtcblx0XHR9XG5cdFx0b1BhcmFtZXRlcnMuYklzU3RpY2t5TW9kZSA9IGJJc1N0aWNreU1vZGU7XG5cdFx0cmV0dXJuIHRoaXMuYmFzZS5fcm91dGluZy5uYXZpZ2F0ZVRvUm91dGUoc1RhcmdldFJvdXRlTmFtZSwgb1BhcmFtZXRlcnMpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJvdXRpbmc7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7OztFQVFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBTkEsSUFRTUEsT0FBTyxXQURaQyxjQUFjLENBQUMsMENBQTBDLENBQUMsVUE4QnpEQyxlQUFlLEVBQUUsVUFDakJDLFVBQVUsQ0FBQ0MsaUJBQWlCLENBQUNDLEtBQUssQ0FBQyxVQWVuQ0gsZUFBZSxFQUFFLFVBQ2pCSSxjQUFjLEVBQUUsVUFrQmhCSixlQUFlLEVBQUUsVUFDakJDLFVBQVUsQ0FBQ0MsaUJBQWlCLENBQUNDLEtBQUssQ0FBQyxVQW1CbkNILGVBQWUsRUFBRSxVQUNqQkMsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDLFdBZW5DSCxlQUFlLEVBQUUsV0FDakJJLGNBQWMsRUFBRTtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFuR2pCO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFDQztBQUNEO0FBQ0E7QUFDQTtBQUNBO0lBRUM7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFmQztJQWtCQTtJQUNBQyxrQkFBa0IsR0FIbEIsNEJBR21CQyxxQkFBa0QsRUFBRTtNQUN0RTtNQUNBLE9BQU8sS0FBSztJQUNiOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FQQztJQUFBLE9BVUFDLFFBQVEsR0FGUixrQkFFU0MsUUFBaUIsRUFBRTtNQUMzQixJQUFJLENBQUNDLElBQUksQ0FBQ0MsUUFBUSxDQUFDQyxpQkFBaUIsQ0FBQ0gsUUFBUSxDQUFDO0lBQy9DOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BWkM7SUFBQTtJQWVBO0lBQ0FJLGVBQWUsR0FIZix5QkFHZ0JKLFFBQWdCLEVBQUU7TUFDakM7SUFBQTs7SUFHRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVpDO0lBQUE7SUFlQTtJQUNBSyxjQUFjLEdBSGQsd0JBR2VMLFFBQWdCLEVBQUU7TUFDaEM7SUFBQTs7SUFHRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FSQztJQUFBLE9BV0FNLGVBQWUsR0FGZix5QkFFZ0JDLGdCQUF3QixFQUFFQyxXQUFpQixFQUFFO01BQzVELElBQU1DLFVBQVUsR0FBRyxJQUFJLENBQUNSLElBQUksQ0FBQ1MsUUFBUSxFQUFFLENBQUNDLFlBQVksRUFBb0I7TUFDeEUsSUFBTUMsYUFBYSxHQUFHQyxXQUFXLENBQUNDLHdCQUF3QixDQUFDTCxVQUFVLENBQUM7TUFDdEUsSUFBSSxDQUFDRCxXQUFXLEVBQUU7UUFDakJBLFdBQVcsR0FBRyxDQUFDLENBQUM7TUFDakI7TUFDQUEsV0FBVyxDQUFDSSxhQUFhLEdBQUdBLGFBQWE7TUFDekMsT0FBTyxJQUFJLENBQUNYLElBQUksQ0FBQ0MsUUFBUSxDQUFDSSxlQUFlLENBQUNDLGdCQUFnQixFQUFFQyxXQUFXLENBQUM7SUFDekUsQ0FBQztJQUFBO0VBQUEsRUE5R29CTyxtQkFBbUI7RUFBQSxPQWlIMUJ6QixPQUFPO0FBQUEifQ==