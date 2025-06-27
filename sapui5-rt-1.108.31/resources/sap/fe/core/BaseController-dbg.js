/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/ui/core/mvc/Controller"], function (CommonUtils, ClassSupport, Controller) {
  "use strict";

  var _dec, _dec2, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * Internal base controller class for SAP Fiori elements application.
   *
   * If you want to extend a base controller for your custom page, please use for sap.fe.core.PageController.
   *
   * @hideconstructor
   * @public
   * @name sap.fe.core.BaseController
   * @since 1.90.0
   */
  var BaseController = (_dec = defineUI5Class("sap.fe.core.BaseController"), _dec2 = publicExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_Controller) {
    _inheritsLoose(BaseController, _Controller);
    function BaseController() {
      return _Controller.apply(this, arguments) || this;
    }
    var _proto = BaseController.prototype;
    /**
     * Returns the current app component.
     *
     * @returns The app component or, if not found, null
     * @alias sap.fe.core.BaseController#getAppComponent
     * @public
     * @since 1.91.0
     */
    _proto.getAppComponent = function getAppComponent() {
      if (!this._oAppComponent) {
        this._oAppComponent = CommonUtils.getAppComponent(this.getView());
      }
      return this._oAppComponent;
    }

    /**
     * Convenience method provided by SAP Fiori elements to enable applications to include the view model by name into each controller.
     *
     * @public
     * @param sName The model name
     * @returns The model instance
     */;
    _proto.getModel = function getModel(sName) {
      return this.getView().getModel(sName);
    }

    /**
     * Convenience method for setting the view model in every controller of the application.
     *
     * @public
     * @param oModel The model instance
     * @param sName The model name
     * @returns The view instance
     */;
    _proto.setModel = function setModel(oModel, sName) {
      return this.getView().setModel(oModel, sName);
    };
    _proto.getResourceBundle = function getResourceBundle(sI18nModelName) {
      if (!sI18nModelName) {
        sI18nModelName = "i18n";
      }
      return this.getAppComponent().getModel(sI18nModelName).getResourceBundle();
    };
    return BaseController;
  }(Controller), (_applyDecoratedDescriptor(_class2.prototype, "getAppComponent", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "getAppComponent"), _class2.prototype)), _class2)) || _class);
  return BaseController;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCYXNlQ29udHJvbGxlciIsImRlZmluZVVJNUNsYXNzIiwicHVibGljRXh0ZW5zaW9uIiwiZ2V0QXBwQ29tcG9uZW50IiwiX29BcHBDb21wb25lbnQiLCJDb21tb25VdGlscyIsImdldFZpZXciLCJnZXRNb2RlbCIsInNOYW1lIiwic2V0TW9kZWwiLCJvTW9kZWwiLCJnZXRSZXNvdXJjZUJ1bmRsZSIsInNJMThuTW9kZWxOYW1lIiwiQ29udHJvbGxlciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQmFzZUNvbnRyb2xsZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgQXBwQ29tcG9uZW50IGZyb20gXCJzYXAvZmUvY29yZS9BcHBDb21wb25lbnRcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBwdWJsaWNFeHRlbnNpb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBDb250cm9sbGVyIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIE1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvTW9kZWxcIjtcbmltcG9ydCB0eXBlIFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9yZXNvdXJjZS9SZXNvdXJjZU1vZGVsXCI7XG5cbi8qKlxuICogSW50ZXJuYWwgYmFzZSBjb250cm9sbGVyIGNsYXNzIGZvciBTQVAgRmlvcmkgZWxlbWVudHMgYXBwbGljYXRpb24uXG4gKlxuICogSWYgeW91IHdhbnQgdG8gZXh0ZW5kIGEgYmFzZSBjb250cm9sbGVyIGZvciB5b3VyIGN1c3RvbSBwYWdlLCBwbGVhc2UgdXNlIGZvciBzYXAuZmUuY29yZS5QYWdlQ29udHJvbGxlci5cbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAbmFtZSBzYXAuZmUuY29yZS5CYXNlQ29udHJvbGxlclxuICogQHNpbmNlIDEuOTAuMFxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5CYXNlQ29udHJvbGxlclwiKVxuY2xhc3MgQmFzZUNvbnRyb2xsZXIgZXh0ZW5kcyBDb250cm9sbGVyIHtcblx0cHJpdmF0ZSBfb0FwcENvbXBvbmVudD86IEFwcENvbXBvbmVudDtcblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGN1cnJlbnQgYXBwIGNvbXBvbmVudC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGFwcCBjb21wb25lbnQgb3IsIGlmIG5vdCBmb3VuZCwgbnVsbFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuQmFzZUNvbnRyb2xsZXIjZ2V0QXBwQ29tcG9uZW50XG5cdCAqIEBwdWJsaWNcblx0ICogQHNpbmNlIDEuOTEuMFxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdGdldEFwcENvbXBvbmVudCgpOiBBcHBDb21wb25lbnQge1xuXHRcdGlmICghdGhpcy5fb0FwcENvbXBvbmVudCkge1xuXHRcdFx0dGhpcy5fb0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudCh0aGlzLmdldFZpZXcoKSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9vQXBwQ29tcG9uZW50O1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlbmllbmNlIG1ldGhvZCBwcm92aWRlZCBieSBTQVAgRmlvcmkgZWxlbWVudHMgdG8gZW5hYmxlIGFwcGxpY2F0aW9ucyB0byBpbmNsdWRlIHRoZSB2aWV3IG1vZGVsIGJ5IG5hbWUgaW50byBlYWNoIGNvbnRyb2xsZXIuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHBhcmFtIHNOYW1lIFRoZSBtb2RlbCBuYW1lXG5cdCAqIEByZXR1cm5zIFRoZSBtb2RlbCBpbnN0YW5jZVxuXHQgKi9cblx0Z2V0TW9kZWwoc05hbWU/OiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCkuZ2V0TW9kZWwoc05hbWUpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENvbnZlbmllbmNlIG1ldGhvZCBmb3Igc2V0dGluZyB0aGUgdmlldyBtb2RlbCBpbiBldmVyeSBjb250cm9sbGVyIG9mIHRoZSBhcHBsaWNhdGlvbi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKiBAcGFyYW0gb01vZGVsIFRoZSBtb2RlbCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gc05hbWUgVGhlIG1vZGVsIG5hbWVcblx0ICogQHJldHVybnMgVGhlIHZpZXcgaW5zdGFuY2Vcblx0ICovXG5cdHNldE1vZGVsKG9Nb2RlbDogTW9kZWwsIHNOYW1lOiBzdHJpbmcpOiBWaWV3IHtcblx0XHRyZXR1cm4gdGhpcy5nZXRWaWV3KCkuc2V0TW9kZWwob01vZGVsLCBzTmFtZSk7XG5cdH1cblxuXHRnZXRSZXNvdXJjZUJ1bmRsZShzSTE4bk1vZGVsTmFtZTogYW55KSB7XG5cdFx0aWYgKCFzSTE4bk1vZGVsTmFtZSkge1xuXHRcdFx0c0kxOG5Nb2RlbE5hbWUgPSBcImkxOG5cIjtcblx0XHR9XG5cdFx0cmV0dXJuICh0aGlzLmdldEFwcENvbXBvbmVudCgpLmdldE1vZGVsKHNJMThuTW9kZWxOYW1lKSBhcyBSZXNvdXJjZU1vZGVsKS5nZXRSZXNvdXJjZUJ1bmRsZSgpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEJhc2VDb250cm9sbGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O0VBUUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFUQSxJQVdNQSxjQUFjLFdBRG5CQyxjQUFjLENBQUMsNEJBQTRCLENBQUMsVUFXM0NDLGVBQWUsRUFBRTtJQUFBO0lBQUE7TUFBQTtJQUFBO0lBQUE7SUFSbEI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQVBDLE9BU0FDLGVBQWUsR0FEZiwyQkFDZ0M7TUFDL0IsSUFBSSxDQUFDLElBQUksQ0FBQ0MsY0FBYyxFQUFFO1FBQ3pCLElBQUksQ0FBQ0EsY0FBYyxHQUFHQyxXQUFXLENBQUNGLGVBQWUsQ0FBQyxJQUFJLENBQUNHLE9BQU8sRUFBRSxDQUFDO01BQ2xFO01BQ0EsT0FBTyxJQUFJLENBQUNGLGNBQWM7SUFDM0I7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BT0FHLFFBQVEsR0FBUixrQkFBU0MsS0FBYyxFQUFFO01BQ3hCLE9BQU8sSUFBSSxDQUFDRixPQUFPLEVBQUUsQ0FBQ0MsUUFBUSxDQUFDQyxLQUFLLENBQUM7SUFDdEM7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVBDO0lBQUEsT0FRQUMsUUFBUSxHQUFSLGtCQUFTQyxNQUFhLEVBQUVGLEtBQWEsRUFBUTtNQUM1QyxPQUFPLElBQUksQ0FBQ0YsT0FBTyxFQUFFLENBQUNHLFFBQVEsQ0FBQ0MsTUFBTSxFQUFFRixLQUFLLENBQUM7SUFDOUMsQ0FBQztJQUFBLE9BRURHLGlCQUFpQixHQUFqQiwyQkFBa0JDLGNBQW1CLEVBQUU7TUFDdEMsSUFBSSxDQUFDQSxjQUFjLEVBQUU7UUFDcEJBLGNBQWMsR0FBRyxNQUFNO01BQ3hCO01BQ0EsT0FBUSxJQUFJLENBQUNULGVBQWUsRUFBRSxDQUFDSSxRQUFRLENBQUNLLGNBQWMsQ0FBQyxDQUFtQkQsaUJBQWlCLEVBQUU7SUFDOUYsQ0FBQztJQUFBO0VBQUEsRUE5QzJCRSxVQUFVO0VBQUEsT0FpRHhCYixjQUFjO0FBQUEifQ==