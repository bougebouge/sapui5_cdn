/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/model/json/JSONModel"], function (ClassSupport, ControllerExtension, OverrideExecution, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _class, _class2;
  var publicExtension = ClassSupport.publicExtension;
  var privateExtension = ClassSupport.privateExtension;
  var methodOverride = ClassSupport.methodOverride;
  var finalExtension = ClassSupport.finalExtension;
  var extensible = ClassSupport.extensible;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  /**
   * Controller extension providing hooks for the navigation using paginators
   *
   * @hideconstructor
   * @public
   * @since 1.94.0
   */
  var Paginator = (_dec = defineUI5Class("sap.fe.core.controllerextensions.Paginator"), _dec2 = methodOverride(), _dec3 = publicExtension(), _dec4 = finalExtension(), _dec5 = publicExtension(), _dec6 = finalExtension(), _dec7 = privateExtension(), _dec8 = extensible(OverrideExecution.After), _dec9 = privateExtension(), _dec10 = extensible(OverrideExecution.After), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(Paginator, _ControllerExtension);
    function Paginator() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _ControllerExtension.call.apply(_ControllerExtension, [this].concat(args)) || this;
      _this._iCurrentIndex = -1;
      return _this;
    }
    var _proto = Paginator.prototype;
    _proto.onInit = function onInit() {
      this._oView = this.base.getView();
      this._oView.setModel(new JSONModel({
        navUpEnabled: false,
        navDownEnabled: false
      }), "paginator");
    }
    /**
     * Initiates the paginator control.
     *
     * @function
     * @param oBinding ODataListBinding object
     * @param oContext Current context where the navigation is initiated
     * @alias sap.fe.core.controllerextensions.Paginator#initialize
     * @public
     * @since 1.94.0
     */;
    _proto.initialize = function initialize(oBinding, oContext) {
      if (oBinding && oBinding.getAllCurrentContexts) {
        this._oListBinding = oBinding;
      }
      if (oContext) {
        this._oCurrentContext = oContext;
      }
      this._updateCurrentIndexAndButtonEnablement();
    };
    _proto._updateCurrentIndexAndButtonEnablement = function _updateCurrentIndexAndButtonEnablement() {
      if (this._oCurrentContext && this._oListBinding) {
        var sPath = this._oCurrentContext.getPath();
        // Storing the currentIndex in global variable
        this._iCurrentIndex = this._oListBinding.getAllCurrentContexts().findIndex(function (oContext) {
          return oContext && oContext.getPath() === sPath;
        });
        var oCurrentIndexContext = this._oListBinding.getAllCurrentContexts()[this._iCurrentIndex];
        if (!this._iCurrentIndex && this._iCurrentIndex !== 0 || !oCurrentIndexContext || this._oCurrentContext.getPath() !== oCurrentIndexContext.getPath()) {
          this._updateCurrentIndex();
        }
      }
      this._handleButtonEnablement();
    };
    _proto._handleButtonEnablement = function _handleButtonEnablement() {
      //Enabling and Disabling the Buttons on change of the control context
      var mButtonEnablementModel = this.base.getView().getModel("paginator");
      if (this._oListBinding && this._oListBinding.getAllCurrentContexts().length > 1 && this._iCurrentIndex > -1) {
        if (this._iCurrentIndex === this._oListBinding.getAllCurrentContexts().length - 1) {
          mButtonEnablementModel.setProperty("/navDownEnabled", false);
        } else if (this._oListBinding.getAllCurrentContexts()[this._iCurrentIndex + 1].isInactive()) {
          //check the next context is not an inactive context
          mButtonEnablementModel.setProperty("/navDownEnabled", false);
        } else {
          mButtonEnablementModel.setProperty("/navDownEnabled", true);
        }
        if (this._iCurrentIndex === 0) {
          mButtonEnablementModel.setProperty("/navUpEnabled", false);
        } else if (this._oListBinding.getAllCurrentContexts()[this._iCurrentIndex - 1].isInactive()) {
          mButtonEnablementModel.setProperty("/navUpEnabled", false);
        } else {
          mButtonEnablementModel.setProperty("/navUpEnabled", true);
        }
      } else {
        // Don't show the paginator buttons
        // 1. When no listbinding is available
        // 2. Only '1' or '0' context exists in the listBinding
        // 3. The current index is -ve, i.e the currentIndex is invalid.
        mButtonEnablementModel.setProperty("/navUpEnabled", false);
        mButtonEnablementModel.setProperty("/navDownEnabled", false);
      }
    };
    _proto._updateCurrentIndex = function _updateCurrentIndex() {
      if (this._oCurrentContext && this._oListBinding) {
        var sPath = this._oCurrentContext.getPath();
        // Storing the currentIndex in global variable
        this._iCurrentIndex = this._oListBinding.getAllCurrentContexts().findIndex(function (oContext) {
          return oContext && oContext.getPath() === sPath;
        });
      }
    };
    _proto.updateCurrentContext = function updateCurrentContext(iDeltaIndex) {
      try {
        var _this3$_oCurrentConte, _this3$_oCurrentConte2;
        var _this3 = this;
        if (!_this3._oListBinding) {
          return Promise.resolve();
        }
        var oModel = (_this3$_oCurrentConte = _this3._oCurrentContext) !== null && _this3$_oCurrentConte !== void 0 && _this3$_oCurrentConte.getModel ? (_this3$_oCurrentConte2 = _this3._oCurrentContext) === null || _this3$_oCurrentConte2 === void 0 ? void 0 : _this3$_oCurrentConte2.getModel() : undefined;
        //Submitting any pending changes that might be there before navigating to next context.
        // adding any only for 1.108
        return Promise.resolve(oModel === null || oModel === void 0 ? void 0 : oModel.submitBatch("$auto")).then(function () {
          var aCurrentContexts = _this3._oListBinding.getAllCurrentContexts();
          var iNewIndex = _this3._iCurrentIndex + iDeltaIndex;
          var oNewContext = aCurrentContexts[iNewIndex];
          if (oNewContext) {
            var bPreventIdxUpdate = _this3.onBeforeContextUpdate(_this3._oListBinding, _this3._iCurrentIndex, iDeltaIndex);
            if (!bPreventIdxUpdate) {
              _this3._iCurrentIndex = iNewIndex;
              _this3._oCurrentContext = oNewContext;
            }
            _this3.onContextUpdate(oNewContext);
          }
          _this3._handleButtonEnablement();
        });
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Called before context update.
     *
     * @function
     * @param oListBinding ODataListBinding object
     * @param iCurrentIndex Current index of context in listBinding from where the navigation is initiated
     * @param iIndexUpdate The delta index for update
     * @returns `true` to prevent the update of current context.
     * @alias sap.fe.core.controllerextensions.Paginator#onBeforeContextUpdate
     * @private
     */
    ;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onBeforeContextUpdate = function onBeforeContextUpdate(oListBinding, iCurrentIndex, iIndexUpdate) {
      return false;
    }

    /**
     * Returns the updated context after the paginator operation.
     *
     * @function
     * @param oContext Final context returned after the paginator action
     * @alias sap.fe.core.controllerextensions.Paginator#onContextUpdate
     * @public
     * @since 1.94.0
     */;
    _proto.
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onContextUpdate = function onContextUpdate(oContext) {
      //To be overridden by the application
    };
    return Paginator;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "initialize", [_dec3, _dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "initialize"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "updateCurrentContext", [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "updateCurrentContext"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeContextUpdate", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeContextUpdate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onContextUpdate", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "onContextUpdate"), _class2.prototype)), _class2)) || _class);
  return Paginator;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJQYWdpbmF0b3IiLCJkZWZpbmVVSTVDbGFzcyIsIm1ldGhvZE92ZXJyaWRlIiwicHVibGljRXh0ZW5zaW9uIiwiZmluYWxFeHRlbnNpb24iLCJwcml2YXRlRXh0ZW5zaW9uIiwiZXh0ZW5zaWJsZSIsIk92ZXJyaWRlRXhlY3V0aW9uIiwiQWZ0ZXIiLCJfaUN1cnJlbnRJbmRleCIsIm9uSW5pdCIsIl9vVmlldyIsImJhc2UiLCJnZXRWaWV3Iiwic2V0TW9kZWwiLCJKU09OTW9kZWwiLCJuYXZVcEVuYWJsZWQiLCJuYXZEb3duRW5hYmxlZCIsImluaXRpYWxpemUiLCJvQmluZGluZyIsIm9Db250ZXh0IiwiZ2V0QWxsQ3VycmVudENvbnRleHRzIiwiX29MaXN0QmluZGluZyIsIl9vQ3VycmVudENvbnRleHQiLCJfdXBkYXRlQ3VycmVudEluZGV4QW5kQnV0dG9uRW5hYmxlbWVudCIsInNQYXRoIiwiZ2V0UGF0aCIsImZpbmRJbmRleCIsIm9DdXJyZW50SW5kZXhDb250ZXh0IiwiX3VwZGF0ZUN1cnJlbnRJbmRleCIsIl9oYW5kbGVCdXR0b25FbmFibGVtZW50IiwibUJ1dHRvbkVuYWJsZW1lbnRNb2RlbCIsImdldE1vZGVsIiwibGVuZ3RoIiwic2V0UHJvcGVydHkiLCJpc0luYWN0aXZlIiwidXBkYXRlQ3VycmVudENvbnRleHQiLCJpRGVsdGFJbmRleCIsIm9Nb2RlbCIsInVuZGVmaW5lZCIsInN1Ym1pdEJhdGNoIiwiYUN1cnJlbnRDb250ZXh0cyIsImlOZXdJbmRleCIsIm9OZXdDb250ZXh0IiwiYlByZXZlbnRJZHhVcGRhdGUiLCJvbkJlZm9yZUNvbnRleHRVcGRhdGUiLCJvbkNvbnRleHRVcGRhdGUiLCJvTGlzdEJpbmRpbmciLCJpQ3VycmVudEluZGV4IiwiaUluZGV4VXBkYXRlIiwiQ29udHJvbGxlckV4dGVuc2lvbiJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiUGFnaW5hdG9yLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7XG5cdGRlZmluZVVJNUNsYXNzLFxuXHRleHRlbnNpYmxlLFxuXHRmaW5hbEV4dGVuc2lvbixcblx0bWV0aG9kT3ZlcnJpZGUsXG5cdHByaXZhdGVFeHRlbnNpb24sXG5cdHB1YmxpY0V4dGVuc2lvblxufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IENvbnRyb2xsZXJFeHRlbnNpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9Db250cm9sbGVyRXh0ZW5zaW9uXCI7XG5pbXBvcnQgT3ZlcnJpZGVFeGVjdXRpb24gZnJvbSBcInNhcC91aS9jb3JlL212Yy9PdmVycmlkZUV4ZWN1dGlvblwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5pbXBvcnQgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcblxuLyoqXG4gKiBDb250cm9sbGVyIGV4dGVuc2lvbiBwcm92aWRpbmcgaG9va3MgZm9yIHRoZSBuYXZpZ2F0aW9uIHVzaW5nIHBhZ2luYXRvcnNcbiAqXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS45NC4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlBhZ2luYXRvclwiKVxuY2xhc3MgUGFnaW5hdG9yIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByaXZhdGUgX29WaWV3ITogVmlldztcblx0cHJvdGVjdGVkIGJhc2UhOiBQYWdlQ29udHJvbGxlcjtcblx0cHJpdmF0ZSBfb0xpc3RCaW5kaW5nOiBhbnk7XG5cdHByaXZhdGUgX29DdXJyZW50Q29udGV4dD86IENvbnRleHQ7XG5cdHByaXZhdGUgX2lDdXJyZW50SW5kZXg6IG51bWJlciA9IC0xO1xuXHRAbWV0aG9kT3ZlcnJpZGUoKVxuXHRvbkluaXQoKSB7XG5cdFx0dGhpcy5fb1ZpZXcgPSB0aGlzLmJhc2UuZ2V0VmlldygpO1xuXHRcdHRoaXMuX29WaWV3LnNldE1vZGVsKFxuXHRcdFx0bmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdG5hdlVwRW5hYmxlZDogZmFsc2UsXG5cdFx0XHRcdG5hdkRvd25FbmFibGVkOiBmYWxzZVxuXHRcdFx0fSksXG5cdFx0XHRcInBhZ2luYXRvclwiXG5cdFx0KTtcblx0fVxuXHQvKipcblx0ICogSW5pdGlhdGVzIHRoZSBwYWdpbmF0b3IgY29udHJvbC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBvQmluZGluZyBPRGF0YUxpc3RCaW5kaW5nIG9iamVjdFxuXHQgKiBAcGFyYW0gb0NvbnRleHQgQ3VycmVudCBjb250ZXh0IHdoZXJlIHRoZSBuYXZpZ2F0aW9uIGlzIGluaXRpYXRlZFxuXHQgKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbGxlcmV4dGVuc2lvbnMuUGFnaW5hdG9yI2luaXRpYWxpemVcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45NC4wXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0aW5pdGlhbGl6ZShvQmluZGluZzogT0RhdGFMaXN0QmluZGluZyB8IGFueSwgb0NvbnRleHQ/OiBDb250ZXh0KSB7XG5cdFx0aWYgKG9CaW5kaW5nICYmIG9CaW5kaW5nLmdldEFsbEN1cnJlbnRDb250ZXh0cykge1xuXHRcdFx0dGhpcy5fb0xpc3RCaW5kaW5nID0gb0JpbmRpbmc7XG5cdFx0fVxuXHRcdGlmIChvQ29udGV4dCkge1xuXHRcdFx0dGhpcy5fb0N1cnJlbnRDb250ZXh0ID0gb0NvbnRleHQ7XG5cdFx0fVxuXHRcdHRoaXMuX3VwZGF0ZUN1cnJlbnRJbmRleEFuZEJ1dHRvbkVuYWJsZW1lbnQoKTtcblx0fVxuXG5cdF91cGRhdGVDdXJyZW50SW5kZXhBbmRCdXR0b25FbmFibGVtZW50KCkge1xuXHRcdGlmICh0aGlzLl9vQ3VycmVudENvbnRleHQgJiYgdGhpcy5fb0xpc3RCaW5kaW5nKSB7XG5cdFx0XHRjb25zdCBzUGF0aCA9IHRoaXMuX29DdXJyZW50Q29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHQvLyBTdG9yaW5nIHRoZSBjdXJyZW50SW5kZXggaW4gZ2xvYmFsIHZhcmlhYmxlXG5cdFx0XHR0aGlzLl9pQ3VycmVudEluZGV4ID0gdGhpcy5fb0xpc3RCaW5kaW5nLmdldEFsbEN1cnJlbnRDb250ZXh0cygpLmZpbmRJbmRleChmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRleHQgJiYgb0NvbnRleHQuZ2V0UGF0aCgpID09PSBzUGF0aDtcblx0XHRcdH0pO1xuXHRcdFx0Y29uc3Qgb0N1cnJlbnRJbmRleENvbnRleHQgPSB0aGlzLl9vTGlzdEJpbmRpbmcuZ2V0QWxsQ3VycmVudENvbnRleHRzKClbdGhpcy5faUN1cnJlbnRJbmRleF07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdCghdGhpcy5faUN1cnJlbnRJbmRleCAmJiB0aGlzLl9pQ3VycmVudEluZGV4ICE9PSAwKSB8fFxuXHRcdFx0XHQhb0N1cnJlbnRJbmRleENvbnRleHQgfHxcblx0XHRcdFx0dGhpcy5fb0N1cnJlbnRDb250ZXh0LmdldFBhdGgoKSAhPT0gb0N1cnJlbnRJbmRleENvbnRleHQuZ2V0UGF0aCgpXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhpcy5fdXBkYXRlQ3VycmVudEluZGV4KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHRoaXMuX2hhbmRsZUJ1dHRvbkVuYWJsZW1lbnQoKTtcblx0fVxuXG5cdF9oYW5kbGVCdXR0b25FbmFibGVtZW50KCkge1xuXHRcdC8vRW5hYmxpbmcgYW5kIERpc2FibGluZyB0aGUgQnV0dG9ucyBvbiBjaGFuZ2Ugb2YgdGhlIGNvbnRyb2wgY29udGV4dFxuXHRcdGNvbnN0IG1CdXR0b25FbmFibGVtZW50TW9kZWwgPSB0aGlzLmJhc2UuZ2V0VmlldygpLmdldE1vZGVsKFwicGFnaW5hdG9yXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRpZiAodGhpcy5fb0xpc3RCaW5kaW5nICYmIHRoaXMuX29MaXN0QmluZGluZy5nZXRBbGxDdXJyZW50Q29udGV4dHMoKS5sZW5ndGggPiAxICYmIHRoaXMuX2lDdXJyZW50SW5kZXggPiAtMSkge1xuXHRcdFx0aWYgKHRoaXMuX2lDdXJyZW50SW5kZXggPT09IHRoaXMuX29MaXN0QmluZGluZy5nZXRBbGxDdXJyZW50Q29udGV4dHMoKS5sZW5ndGggLSAxKSB7XG5cdFx0XHRcdG1CdXR0b25FbmFibGVtZW50TW9kZWwuc2V0UHJvcGVydHkoXCIvbmF2RG93bkVuYWJsZWRcIiwgZmFsc2UpO1xuXHRcdFx0fSBlbHNlIGlmICh0aGlzLl9vTGlzdEJpbmRpbmcuZ2V0QWxsQ3VycmVudENvbnRleHRzKClbdGhpcy5faUN1cnJlbnRJbmRleCArIDFdLmlzSW5hY3RpdmUoKSkge1xuXHRcdFx0XHQvL2NoZWNrIHRoZSBuZXh0IGNvbnRleHQgaXMgbm90IGFuIGluYWN0aXZlIGNvbnRleHRcblx0XHRcdFx0bUJ1dHRvbkVuYWJsZW1lbnRNb2RlbC5zZXRQcm9wZXJ0eShcIi9uYXZEb3duRW5hYmxlZFwiLCBmYWxzZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRtQnV0dG9uRW5hYmxlbWVudE1vZGVsLnNldFByb3BlcnR5KFwiL25hdkRvd25FbmFibGVkXCIsIHRydWUpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHRoaXMuX2lDdXJyZW50SW5kZXggPT09IDApIHtcblx0XHRcdFx0bUJ1dHRvbkVuYWJsZW1lbnRNb2RlbC5zZXRQcm9wZXJ0eShcIi9uYXZVcEVuYWJsZWRcIiwgZmFsc2UpO1xuXHRcdFx0fSBlbHNlIGlmICh0aGlzLl9vTGlzdEJpbmRpbmcuZ2V0QWxsQ3VycmVudENvbnRleHRzKClbdGhpcy5faUN1cnJlbnRJbmRleCAtIDFdLmlzSW5hY3RpdmUoKSkge1xuXHRcdFx0XHRtQnV0dG9uRW5hYmxlbWVudE1vZGVsLnNldFByb3BlcnR5KFwiL25hdlVwRW5hYmxlZFwiLCBmYWxzZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRtQnV0dG9uRW5hYmxlbWVudE1vZGVsLnNldFByb3BlcnR5KFwiL25hdlVwRW5hYmxlZFwiLCB0cnVlKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gRG9uJ3Qgc2hvdyB0aGUgcGFnaW5hdG9yIGJ1dHRvbnNcblx0XHRcdC8vIDEuIFdoZW4gbm8gbGlzdGJpbmRpbmcgaXMgYXZhaWxhYmxlXG5cdFx0XHQvLyAyLiBPbmx5ICcxJyBvciAnMCcgY29udGV4dCBleGlzdHMgaW4gdGhlIGxpc3RCaW5kaW5nXG5cdFx0XHQvLyAzLiBUaGUgY3VycmVudCBpbmRleCBpcyAtdmUsIGkuZSB0aGUgY3VycmVudEluZGV4IGlzIGludmFsaWQuXG5cdFx0XHRtQnV0dG9uRW5hYmxlbWVudE1vZGVsLnNldFByb3BlcnR5KFwiL25hdlVwRW5hYmxlZFwiLCBmYWxzZSk7XG5cdFx0XHRtQnV0dG9uRW5hYmxlbWVudE1vZGVsLnNldFByb3BlcnR5KFwiL25hdkRvd25FbmFibGVkXCIsIGZhbHNlKTtcblx0XHR9XG5cdH1cblxuXHRfdXBkYXRlQ3VycmVudEluZGV4KCkge1xuXHRcdGlmICh0aGlzLl9vQ3VycmVudENvbnRleHQgJiYgdGhpcy5fb0xpc3RCaW5kaW5nKSB7XG5cdFx0XHRjb25zdCBzUGF0aCA9IHRoaXMuX29DdXJyZW50Q29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHQvLyBTdG9yaW5nIHRoZSBjdXJyZW50SW5kZXggaW4gZ2xvYmFsIHZhcmlhYmxlXG5cdFx0XHR0aGlzLl9pQ3VycmVudEluZGV4ID0gdGhpcy5fb0xpc3RCaW5kaW5nLmdldEFsbEN1cnJlbnRDb250ZXh0cygpLmZpbmRJbmRleChmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRleHQgJiYgb0NvbnRleHQuZ2V0UGF0aCgpID09PSBzUGF0aDtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0YXN5bmMgdXBkYXRlQ3VycmVudENvbnRleHQoaURlbHRhSW5kZXg6IGFueSkge1xuXHRcdGlmICghdGhpcy5fb0xpc3RCaW5kaW5nKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuX29DdXJyZW50Q29udGV4dD8uZ2V0TW9kZWwgPyAodGhpcy5fb0N1cnJlbnRDb250ZXh0Py5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWwpIDogdW5kZWZpbmVkO1xuXHRcdC8vU3VibWl0dGluZyBhbnkgcGVuZGluZyBjaGFuZ2VzIHRoYXQgbWlnaHQgYmUgdGhlcmUgYmVmb3JlIG5hdmlnYXRpbmcgdG8gbmV4dCBjb250ZXh0LlxuXHRcdC8vIGFkZGluZyBhbnkgb25seSBmb3IgMS4xMDhcblx0XHRhd2FpdCBvTW9kZWw/LnN1Ym1pdEJhdGNoKFwiJGF1dG9cIik7XG5cdFx0Y29uc3QgYUN1cnJlbnRDb250ZXh0cyA9IHRoaXMuX29MaXN0QmluZGluZy5nZXRBbGxDdXJyZW50Q29udGV4dHMoKTtcblx0XHRjb25zdCBpTmV3SW5kZXggPSB0aGlzLl9pQ3VycmVudEluZGV4ICsgaURlbHRhSW5kZXg7XG5cdFx0Y29uc3Qgb05ld0NvbnRleHQgPSBhQ3VycmVudENvbnRleHRzW2lOZXdJbmRleF07XG5cblx0XHRpZiAob05ld0NvbnRleHQpIHtcblx0XHRcdGNvbnN0IGJQcmV2ZW50SWR4VXBkYXRlID0gdGhpcy5vbkJlZm9yZUNvbnRleHRVcGRhdGUodGhpcy5fb0xpc3RCaW5kaW5nLCB0aGlzLl9pQ3VycmVudEluZGV4LCBpRGVsdGFJbmRleCk7XG5cdFx0XHRpZiAoIWJQcmV2ZW50SWR4VXBkYXRlKSB7XG5cdFx0XHRcdHRoaXMuX2lDdXJyZW50SW5kZXggPSBpTmV3SW5kZXg7XG5cdFx0XHRcdHRoaXMuX29DdXJyZW50Q29udGV4dCA9IG9OZXdDb250ZXh0O1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5vbkNvbnRleHRVcGRhdGUob05ld0NvbnRleHQpO1xuXHRcdH1cblx0XHR0aGlzLl9oYW5kbGVCdXR0b25FbmFibGVtZW50KCk7XG5cdH1cblxuXHQvKipcblx0ICogQ2FsbGVkIGJlZm9yZSBjb250ZXh0IHVwZGF0ZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBvTGlzdEJpbmRpbmcgT0RhdGFMaXN0QmluZGluZyBvYmplY3Rcblx0ICogQHBhcmFtIGlDdXJyZW50SW5kZXggQ3VycmVudCBpbmRleCBvZiBjb250ZXh0IGluIGxpc3RCaW5kaW5nIGZyb20gd2hlcmUgdGhlIG5hdmlnYXRpb24gaXMgaW5pdGlhdGVkXG5cdCAqIEBwYXJhbSBpSW5kZXhVcGRhdGUgVGhlIGRlbHRhIGluZGV4IGZvciB1cGRhdGVcblx0ICogQHJldHVybnMgYHRydWVgIHRvIHByZXZlbnQgdGhlIHVwZGF0ZSBvZiBjdXJyZW50IGNvbnRleHQuXG5cdCAqIEBhbGlhcyBzYXAuZmUuY29yZS5jb250cm9sbGVyZXh0ZW5zaW9ucy5QYWdpbmF0b3Ijb25CZWZvcmVDb250ZXh0VXBkYXRlXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdG9uQmVmb3JlQ29udGV4dFVwZGF0ZShvTGlzdEJpbmRpbmc6IE9EYXRhTGlzdEJpbmRpbmcsIGlDdXJyZW50SW5kZXg6IG51bWJlciwgaUluZGV4VXBkYXRlOiBudW1iZXIpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdXBkYXRlZCBjb250ZXh0IGFmdGVyIHRoZSBwYWdpbmF0b3Igb3BlcmF0aW9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIG9Db250ZXh0IEZpbmFsIGNvbnRleHQgcmV0dXJuZWQgYWZ0ZXIgdGhlIHBhZ2luYXRvciBhY3Rpb25cblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLlBhZ2luYXRvciNvbkNvbnRleHRVcGRhdGVcblx0ICogQHB1YmxpY1xuXHQgKiBAc2luY2UgMS45NC4wXG5cdCAqL1xuXHRAcHJpdmF0ZUV4dGVuc2lvbigpXG5cdEBleHRlbnNpYmxlKE92ZXJyaWRlRXhlY3V0aW9uLkFmdGVyKVxuXHQvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVudXNlZC12YXJzXG5cdG9uQ29udGV4dFVwZGF0ZShvQ29udGV4dDogQ29udGV4dCkge1xuXHRcdC8vVG8gYmUgb3ZlcnJpZGRlbiBieSB0aGUgYXBwbGljYXRpb25cblx0fVxufVxuZXhwb3J0IGRlZmF1bHQgUGFnaW5hdG9yO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7OztFQWlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQU5BLElBUU1BLFNBQVMsV0FEZEMsY0FBYyxDQUFDLDRDQUE0QyxDQUFDLFVBTzNEQyxjQUFjLEVBQUUsVUFxQmhCQyxlQUFlLEVBQUUsVUFDakJDLGNBQWMsRUFBRSxVQW9FaEJELGVBQWUsRUFBRSxVQUNqQkMsY0FBYyxFQUFFLFVBbUNoQkMsZ0JBQWdCLEVBQUUsVUFDbEJDLFVBQVUsQ0FBQ0MsaUJBQWlCLENBQUNDLEtBQUssQ0FBQyxVQWVuQ0gs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