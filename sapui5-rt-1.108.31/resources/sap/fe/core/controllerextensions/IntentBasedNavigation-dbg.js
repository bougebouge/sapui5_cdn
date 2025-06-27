/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution"], function (ClassSupport, ControllerExtension, OverrideExecution) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _class, _class2;
  var _exports = {};
  var publicExtension = ClassSupport.publicExtension;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  var ContextStrategy;
  /**
   * Controller extension providing hooks for intent-based navigation
   *
   * @hideconstructor
   * @public
   * @since 1.86.0
   */
  (function (ContextStrategy) {
    ContextStrategy["Default"] = "default";
    ContextStrategy["Initiator"] = "initiator";
  })(ContextStrategy || (ContextStrategy = {}));
  _exports.ContextStrategy = ContextStrategy;
  var IntentBasedNavigation = (_dec = defineUI5Class("sap.fe.core.controllerextensions.IntentBasedNavigation"), _dec2 = publicExtension(), _dec3 = extensible(OverrideExecution.After), _dec4 = publicExtension(), _dec5 = extensible(OverrideExecution.After), _dec6 = finalExtension(), _dec7 = publicExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(IntentBasedNavigation, _ControllerExtension);
    function IntentBasedNavigation() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = IntentBasedNavigation.prototype;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptContextPreparationStrategy = function adaptContextPreparationStrategy(oNavigationInfo) {
      // to be overriden by the application
      return ContextStrategy.Default;
    }

    /**
     * Provides a hook to customize the {@link sap.fe.navigation.SelectionVariant} related to the intent-based navigation.
     *
     * @function
     * @param oSelectionVariant SelectionVariant provided by SAP Fiori elements.
     * @param oNavigationInfo Object containing intent-based navigation-related info
     * @param oNavigationInfo.semanticObject Semantic object related to the intent
     * @param oNavigationInfo.action Action related to the intent
     * @alias sap.fe.core.controllerextensions.IntentBasedNavigation#adaptNavigationContext
     * @public
     * @since 1.86.0
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    adaptNavigationContext = function adaptNavigationContext(oSelectionVariant, oNavigationInfo) {
      // to be overriden by the application
    }

    /**
     * Navigates to an intent defined by an outbound definition in the manifest.
     *
     * @function
     * @param sOutbound Identifier to locate the outbound definition in the manifest.
     * This provides the semantic object and action for the intent-based navigation.
     * Additionally, the outbound definition can be used to provide parameters for intent-based navigation.
     * See {@link topic:be0cf40f61184b358b5faedaec98b2da Descriptor for Applications, Components, and Libraries} for more information.
     * @param mNavigationParameters Optional map containing key/value pairs to be passed to the intent.
     * If mNavigationParameters are provided, the parameters provided in the outbound definition of the manifest are ignored.
     * @alias sap.fe.core.controllerextensions.IntentBasedNavigation#navigateOutbound
     * @public
     * @since 1.86.0
     */;
    _proto.navigateOutbound = function navigateOutbound(sOutbound, mNavigationParameters) {
      var _this$base, _this$base2;
      var oInternalModelContext = (_this$base = this.base) === null || _this$base === void 0 ? void 0 : _this$base.getView().getBindingContext("internal");
      oInternalModelContext.setProperty("externalNavigationContext", {
        "page": false
      });
      (_this$base2 = this.base) === null || _this$base2 === void 0 ? void 0 : _this$base2._intentBasedNavigation.navigateOutbound(sOutbound, mNavigationParameters);
    };
    return IntentBasedNavigation;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "adaptContextPreparationStrategy", [_dec2, _dec3], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptContextPreparationStrategy"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "adaptNavigationContext", [_dec4, _dec5], Object.getOwnPropertyDescriptor(_class2.prototype, "adaptNavigationContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateOutbound", [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateOutbound"), _class2.prototype)), _class2)) || _class);
  return IntentBasedNavigation;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb250ZXh0U3RyYXRlZ3kiLCJJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJkZWZpbmVVSTVDbGFzcyIsInB1YmxpY0V4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkFmdGVyIiwiZmluYWxFeHRlbnNpb24iLCJhZGFwdENvbnRleHRQcmVwYXJhdGlvblN0cmF0ZWd5Iiwib05hdmlnYXRpb25JbmZvIiwiRGVmYXVsdCIsImFkYXB0TmF2aWdhdGlvbkNvbnRleHQiLCJvU2VsZWN0aW9uVmFyaWFudCIsIm5hdmlnYXRlT3V0Ym91bmQiLCJzT3V0Ym91bmQiLCJtTmF2aWdhdGlvblBhcmFtZXRlcnMiLCJvSW50ZXJuYWxNb2RlbENvbnRleHQiLCJiYXNlIiwiZ2V0VmlldyIsImdldEJpbmRpbmdDb250ZXh0Iiwic2V0UHJvcGVydHkiLCJfaW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiQ29udHJvbGxlckV4dGVuc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiSW50ZW50QmFzZWROYXZpZ2F0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBleHRlbnNpYmxlLCBmaW5hbEV4dGVuc2lvbiwgcHVibGljRXh0ZW5zaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgdHlwZSB7IEludGVybmFsTW9kZWxDb250ZXh0IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuXG5leHBvcnQgZW51bSBDb250ZXh0U3RyYXRlZ3kge1xuXHREZWZhdWx0ID0gXCJkZWZhdWx0XCIsXG5cdEluaXRpYXRvciA9IFwiaW5pdGlhdG9yXCJcbn1cblxuLyoqXG4gKiBDb250cm9sbGVyIGV4dGVuc2lvbiBwcm92aWRpbmcgaG9va3MgZm9yIGludGVudC1iYXNlZCBuYXZpZ2F0aW9uXG4gKlxuICogQGhpZGVjb25zdHJ1Y3RvclxuICogQHB1YmxpY1xuICogQHNpbmNlIDEuODYuMFxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5JbnRlbnRCYXNlZE5hdmlnYXRpb25cIilcbmNsYXNzIEludGVudEJhc2VkTmF2aWdhdGlvbiBleHRlbmRzIENvbnRyb2xsZXJFeHRlbnNpb24ge1xuXHRiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdGFkYXB0Q29udGV4dFByZXBhcmF0aW9uU3RyYXRlZ3kob05hdmlnYXRpb25JbmZvOiB7IHNlbWFudGljT2JqZWN0OiBzdHJpbmc7IGFjdGlvbjogc3RyaW5nIH0pIHtcblx0XHQvLyB0byBiZSBvdmVycmlkZW4gYnkgdGhlIGFwcGxpY2F0aW9uXG5cdFx0cmV0dXJuIENvbnRleHRTdHJhdGVneS5EZWZhdWx0O1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb3ZpZGVzIGEgaG9vayB0byBjdXN0b21pemUgdGhlIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5TZWxlY3Rpb25WYXJpYW50fSByZWxhdGVkIHRvIHRoZSBpbnRlbnQtYmFzZWQgbmF2aWdhdGlvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBvU2VsZWN0aW9uVmFyaWFudCBTZWxlY3Rpb25WYXJpYW50IHByb3ZpZGVkIGJ5IFNBUCBGaW9yaSBlbGVtZW50cy5cblx0ICogQHBhcmFtIG9OYXZpZ2F0aW9uSW5mbyBPYmplY3QgY29udGFpbmluZyBpbnRlbnQtYmFzZWQgbmF2aWdhdGlvbi1yZWxhdGVkIGluZm9cblx0ICogQHBhcmFtIG9OYXZpZ2F0aW9uSW5mby5zZW1hbnRpY09iamVjdCBTZW1hbnRpYyBvYmplY3QgcmVsYXRlZCB0byB0aGUgaW50ZW50XG5cdCAqIEBwYXJhbSBvTmF2aWdhdGlvbkluZm8uYWN0aW9uIEFjdGlvbiByZWxhdGVkIHRvIHRoZSBpbnRlbnRcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVudEJhc2VkTmF2aWdhdGlvbiNhZGFwdE5hdmlnYXRpb25Db250ZXh0XG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuODYuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdGFkYXB0TmF2aWdhdGlvbkNvbnRleHQob1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsIG9OYXZpZ2F0aW9uSW5mbzogeyBzZW1hbnRpY09iamVjdDogc3RyaW5nOyBhY3Rpb246IHN0cmluZyB9KSB7XG5cdFx0Ly8gdG8gYmUgb3ZlcnJpZGVuIGJ5IHRoZSBhcHBsaWNhdGlvblxuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyB0byBhbiBpbnRlbnQgZGVmaW5lZCBieSBhbiBvdXRib3VuZCBkZWZpbml0aW9uIGluIHRoZSBtYW5pZmVzdC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBzT3V0Ym91bmQgSWRlbnRpZmllciB0byBsb2NhdGUgdGhlIG91dGJvdW5kIGRlZmluaXRpb24gaW4gdGhlIG1hbmlmZXN0LlxuXHQgKiBUaGlzIHByb3ZpZGVzIHRoZSBzZW1hbnRpYyBvYmplY3QgYW5kIGFjdGlvbiBmb3IgdGhlIGludGVudC1iYXNlZCBuYXZpZ2F0aW9uLlxuXHQgKiBBZGRpdGlvbmFsbHksIHRoZSBvdXRib3VuZCBkZWZpbml0aW9uIGNhbiBiZSB1c2VkIHRvIHByb3ZpZGUgcGFyYW1ldGVycyBmb3IgaW50ZW50LWJhc2VkIG5hdmlnYXRpb24uXG5cdCAqIFNlZSB7QGxpbmsgdG9waWM6YmUwY2Y0MGY2MTE4NGIzNThiNWZhZWRhZWM5OGIyZGEgRGVzY3JpcHRvciBmb3IgQXBwbGljYXRpb25zLCBDb21wb25lbnRzLCBhbmQgTGlicmFyaWVzfSBmb3IgbW9yZSBpbmZvcm1hdGlvbi5cblx0ICogQHBhcmFtIG1OYXZpZ2F0aW9uUGFyYW1ldGVycyBPcHRpb25hbCBtYXAgY29udGFpbmluZyBrZXkvdmFsdWUgcGFpcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBpbnRlbnQuXG5cdCAqIElmIG1OYXZpZ2F0aW9uUGFyYW1ldGVycyBhcmUgcHJvdmlkZWQsIHRoZSBwYXJhbWV0ZXJzIHByb3ZpZGVkIGluIHRoZSBvdXRib3VuZCBkZWZpbml0aW9uIG9mIHRoZSBtYW5pZmVzdCBhcmUgaWdub3JlZC5cblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVudEJhc2VkTmF2aWdhdGlvbiNuYXZpZ2F0ZU91dGJvdW5kXG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuODYuMFxuXHQgKi9cblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdG5hdmlnYXRlT3V0Ym91bmQoc091dGJvdW5kOiBzdHJpbmcsIG1OYXZpZ2F0aW9uUGFyYW1ldGVyczogb2JqZWN0KSB7XG5cdFx0Y29uc3Qgb0ludGVybmFsTW9kZWxDb250ZXh0ID0gdGhpcy5iYXNlPy5nZXRWaWV3KCkuZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dDtcblx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJleHRlcm5hbE5hdmlnYXRpb25Db250ZXh0XCIsIHsgXCJwYWdlXCI6IGZhbHNlIH0pO1xuXHRcdHRoaXMuYmFzZT8uX2ludGVudEJhc2VkTmF2aWdhdGlvbi5uYXZpZ2F0ZU91dGJvdW5kKHNPdXRib3VuZCwgbU5hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBJbnRlbnRCYXNlZE5hdmlnYXRpb247XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7TUFPWUEsZUFBZTtFQUszQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQU5BLFdBTFlBLGVBQWU7SUFBZkEsZUFBZTtJQUFmQSxlQUFlO0VBQUEsR0FBZkEsZUFBZSxLQUFmQSxlQUFlO0VBQUE7RUFBQSxJQWFyQkMscUJBQXFCLFdBRDFCQyxjQUFjLENBQUMsd0RBQXdELENBQUMsVUFJdkVDLGVBQWUsRUFBRSxVQUNqQkMsVUFBVSxDQUFDQyxpQkFBaUIsQ0FBQ0MsS0FBSyxDQUFDLFVBbUJuQ0gsZUFBZSxFQUFFLFVBQ2pCQyxVQUFVLENBQUNDLGlCQUFpQixDQUFDQyxLQUFLLENBQUMsVUFvQm5DQyxjQUFjLEVBQUUsVUFDaEJKLGVBQWUsRUFBRTtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFBQTtJQXhDbEI7SUFDQUssK0JBQStCLEdBSC9CLHlDQUdnQ0MsZUFBMkQsRUFBRTtNQUM1RjtNQUNBLE9BQU9ULGVBQWUsQ0FBQ1UsT0FBTztJQUMvQjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FYQztJQUFBO0lBY0E7SUFDQUMsc0JBQXNCLEdBSHRCLGdDQUd1QkMsaUJBQW1DLEVBQUVILGVBQTJELEVBQUU7TUFDeEg7SUFBQTs7SUFHRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BYkM7SUFBQSxPQWdCQUksZ0JBQWdCLEdBRmhCLDBCQUVpQkMsU0FBaUIsRUFBRUMscUJBQTZCLEVBQUU7TUFBQTtNQUNsRSxJQUFNQyxxQkFBcUIsaUJBQUcsSUFBSSxDQUFDQyxJQUFJLCtDQUFULFdBQVdDLE9BQU8sRUFBRSxDQUFDQyxpQkFBaUIsQ0FBQyxVQUFVLENBQXlCO01BQ3hHSCxxQkFBcUIsQ0FBQ0ksV0FBVyxDQUFDLDJCQUEyQixFQUFFO1FBQUUsTUFBTSxFQUFFO01BQU0sQ0FBQyxDQUFDO01BQ2pGLG1CQUFJLENBQUNILElBQUksZ0RBQVQsWUFBV0ksc0JBQXNCLENBQUNSLGdCQUFnQixDQUFDQyxTQUFTLEVBQUVDLHFCQUFxQixDQUFDO0lBQ3JGLENBQUM7SUFBQTtFQUFBLEVBbERrQ08sbUJBQW1CO0VBQUEsT0FxRHhDckIscUJBQXFCO0FBQUEifQ==