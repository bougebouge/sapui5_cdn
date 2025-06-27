/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ClassSupport", "sap/suite/ui/commons/collaboration/CollaborationHelper", "../MacroAPI"], function (Log, ClassSupport, CollaborationHelper, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var property = ClassSupport.property;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Building block used to create the ‘Share’ functionality.
   * <br>
   * Please note that the 'Share in SAP Jam' option is only available on platforms that are integrated with SAP Jam.
   * <br>
   * If you are consuming this building block in an environment where the SAP Fiori launchpad is not available, then the 'Save as Tile' option is not visible.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Share
   * 	id="someID"
   *	visible="true"
   * /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.ShareAPI
   * @private
   * @since 1.108.0
   */
  var ShareAPI = (_dec = defineUI5Class("sap.fe.macros.share.ShareAPI", {
    interfaces: ["sap.m.IOverflowToolbarContent"]
  }), _dec2 = property({
    type: "string"
  }), _dec3 = property({
    type: "boolean",
    defaultValue: true
  }), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(ShareAPI, _MacroAPI);
    function ShareAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call.apply(_MacroAPI, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor2, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = ShareAPI.prototype;
    /**
     * Returns properties for the interface IOverflowToolbarContent.
     *
     * @returns {object} Returns the configuration of IOverflowToolbarContent
     */
    _proto.getOverflowToolbarConfig = function getOverflowToolbarConfig() {
      return {
        canOverflow: true
      };
    }
    /**
     * Sets the visibility of the 'Share' building block based on the value.
     * If the 'Share' building block is used in an application that's running in Microsoft Teams,
     * this function does not have any effect,
     * since the 'Share' building block handles the visibility on its own in that case.
     *
     * @param visibility The desired visibility to be set
     * @returns Promise which resolves with the instance of ShareAPI
     * @private
     */;
    _proto.setVisibility = function setVisibility(visibility) {
      try {
        var _this3 = this;
        return Promise.resolve(CollaborationHelper.isTeamsModeActive()).then(function (isTeamsModeActive) {
          // In case of teams mode share should not be visible
          // so we do not do anything
          if (!isTeamsModeActive) {
            _this3.content.setVisible(visibility);
            _this3.visible = visibility;
          } else {
            Log.info("Share Building Block: visibility not changed since application is running in teams mode!");
          }
          return Promise.resolve(_this3);
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };
    return ShareAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return ShareAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFyZUFQSSIsImRlZmluZVVJNUNsYXNzIiwiaW50ZXJmYWNlcyIsInByb3BlcnR5IiwidHlwZSIsImRlZmF1bHRWYWx1ZSIsImdldE92ZXJmbG93VG9vbGJhckNvbmZpZyIsImNhbk92ZXJmbG93Iiwic2V0VmlzaWJpbGl0eSIsInZpc2liaWxpdHkiLCJDb2xsYWJvcmF0aW9uSGVscGVyIiwiaXNUZWFtc01vZGVBY3RpdmUiLCJjb250ZW50Iiwic2V0VmlzaWJsZSIsInZpc2libGUiLCJMb2ciLCJpbmZvIiwiUHJvbWlzZSIsInJlc29sdmUiLCJNYWNyb0FQSSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU2hhcmVBUEkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcywgcHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBDb2xsYWJvcmF0aW9uSGVscGVyIGZyb20gXCJzYXAvc3VpdGUvdWkvY29tbW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25IZWxwZXJcIjtcbmltcG9ydCBNYWNyb0FQSSBmcm9tIFwiLi4vTWFjcm9BUElcIjtcbi8qKlxuICogQnVpbGRpbmcgYmxvY2sgdXNlZCB0byBjcmVhdGUgdGhlIOKAmFNoYXJl4oCZIGZ1bmN0aW9uYWxpdHkuXG4gKiA8YnI+XG4gKiBQbGVhc2Ugbm90ZSB0aGF0IHRoZSAnU2hhcmUgaW4gU0FQIEphbScgb3B0aW9uIGlzIG9ubHkgYXZhaWxhYmxlIG9uIHBsYXRmb3JtcyB0aGF0IGFyZSBpbnRlZ3JhdGVkIHdpdGggU0FQIEphbS5cbiAqIDxicj5cbiAqIElmIHlvdSBhcmUgY29uc3VtaW5nIHRoaXMgYnVpbGRpbmcgYmxvY2sgaW4gYW4gZW52aXJvbm1lbnQgd2hlcmUgdGhlIFNBUCBGaW9yaSBsYXVuY2hwYWQgaXMgbm90IGF2YWlsYWJsZSwgdGhlbiB0aGUgJ1NhdmUgYXMgVGlsZScgb3B0aW9uIGlzIG5vdCB2aXNpYmxlLlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpTaGFyZVxuICogXHRpZD1cInNvbWVJRFwiXG4gKlx0dmlzaWJsZT1cInRydWVcIlxuICogLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLlNoYXJlQVBJXG4gKiBAcHJpdmF0ZVxuICogQHNpbmNlIDEuMTA4LjBcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5zaGFyZS5TaGFyZUFQSVwiLCB7XG5cdGludGVyZmFjZXM6IFtcInNhcC5tLklPdmVyZmxvd1Rvb2xiYXJDb250ZW50XCJdXG59KVxuY2xhc3MgU2hhcmVBUEkgZXh0ZW5kcyBNYWNyb0FQSSB7XG5cdC8qKlxuXHQgKiBUaGUgaWRlbnRpZmllciBvZiB0aGUgJ1NoYXJlJyBidWlsZGluZyBibG9ja1xuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRpZCE6IHN0cmluZztcblx0LyoqXG5cdCAqIFdoZXRoZXIgdGhlICdTaGFyZScgYnVpbGRpbmcgYmxvY2sgaXMgdmlzaWJsZSBvciBub3QuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdHZpc2libGUhOiBib29sZWFuO1xuXHQvKipcblx0ICogUmV0dXJucyBwcm9wZXJ0aWVzIGZvciB0aGUgaW50ZXJmYWNlIElPdmVyZmxvd1Rvb2xiYXJDb250ZW50LlxuXHQgKlxuXHQgKiBAcmV0dXJucyB7b2JqZWN0fSBSZXR1cm5zIHRoZSBjb25maWd1cmF0aW9uIG9mIElPdmVyZmxvd1Rvb2xiYXJDb250ZW50XG5cdCAqL1xuXHRnZXRPdmVyZmxvd1Rvb2xiYXJDb25maWcoKSB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdGNhbk92ZXJmbG93OiB0cnVlXG5cdFx0fTtcblx0fVxuXHQvKipcblx0ICogU2V0cyB0aGUgdmlzaWJpbGl0eSBvZiB0aGUgJ1NoYXJlJyBidWlsZGluZyBibG9jayBiYXNlZCBvbiB0aGUgdmFsdWUuXG5cdCAqIElmIHRoZSAnU2hhcmUnIGJ1aWxkaW5nIGJsb2NrIGlzIHVzZWQgaW4gYW4gYXBwbGljYXRpb24gdGhhdCdzIHJ1bm5pbmcgaW4gTWljcm9zb2Z0IFRlYW1zLFxuXHQgKiB0aGlzIGZ1bmN0aW9uIGRvZXMgbm90IGhhdmUgYW55IGVmZmVjdCxcblx0ICogc2luY2UgdGhlICdTaGFyZScgYnVpbGRpbmcgYmxvY2sgaGFuZGxlcyB0aGUgdmlzaWJpbGl0eSBvbiBpdHMgb3duIGluIHRoYXQgY2FzZS5cblx0ICpcblx0ICogQHBhcmFtIHZpc2liaWxpdHkgVGhlIGRlc2lyZWQgdmlzaWJpbGl0eSB0byBiZSBzZXRcblx0ICogQHJldHVybnMgUHJvbWlzZSB3aGljaCByZXNvbHZlcyB3aXRoIHRoZSBpbnN0YW5jZSBvZiBTaGFyZUFQSVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YXN5bmMgc2V0VmlzaWJpbGl0eSh2aXNpYmlsaXR5OiBib29sZWFuKTogUHJvbWlzZTx0aGlzPiB7XG5cdFx0Y29uc3QgaXNUZWFtc01vZGVBY3RpdmUgPSBhd2FpdCBDb2xsYWJvcmF0aW9uSGVscGVyLmlzVGVhbXNNb2RlQWN0aXZlKCk7XG5cdFx0Ly8gSW4gY2FzZSBvZiB0ZWFtcyBtb2RlIHNoYXJlIHNob3VsZCBub3QgYmUgdmlzaWJsZVxuXHRcdC8vIHNvIHdlIGRvIG5vdCBkbyBhbnl0aGluZ1xuXHRcdGlmICghaXNUZWFtc01vZGVBY3RpdmUpIHtcblx0XHRcdHRoaXMuY29udGVudC5zZXRWaXNpYmxlKHZpc2liaWxpdHkpO1xuXHRcdFx0dGhpcy52aXNpYmxlID0gdmlzaWJpbGl0eTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0TG9nLmluZm8oXCJTaGFyZSBCdWlsZGluZyBCbG9jazogdmlzaWJpbGl0eSBub3QgY2hhbmdlZCBzaW5jZSBhcHBsaWNhdGlvbiBpcyBydW5uaW5nIGluIHRlYW1zIG1vZGUhXCIpO1xuXHRcdH1cblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRoaXMpO1xuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBTaGFyZUFQSTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztFQUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFuQkEsSUF1Qk1BLFFBQVEsV0FIYkMsY0FBYyxDQUFDLDhCQUE4QixFQUFFO0lBQy9DQyxVQUFVLEVBQUUsQ0FBQywrQkFBK0I7RUFDN0MsQ0FBQyxDQUFDLFVBT0FDLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFPNUJELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFQyxZQUFZLEVBQUU7RUFBSyxDQUFDLENBQUM7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFFbEQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtJQUpDLE9BS0FDLHdCQUF3QixHQUF4QixvQ0FBMkI7TUFDMUIsT0FBTztRQUNOQyxXQUFXLEVBQUU7TUFDZCxDQUFDO0lBQ0Y7SUFDQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVRDO0lBQUEsT0FVTUMsYUFBYSwwQkFBQ0MsVUFBbUI7TUFBQSxJQUFpQjtRQUFBLGFBS3RELElBQUk7UUFBQSx1QkFKMkJDLG1CQUFtQixDQUFDQyxpQkFBaUIsRUFBRSxpQkFBakVBLGlCQUFpQjtVQUN2QjtVQUNBO1VBQ0EsSUFBSSxDQUFDQSxpQkFBaUIsRUFBRTtZQUN2QixPQUFLQyxPQUFPLENBQUNDLFVBQVUsQ0FBQ0osVUFBVSxDQUFDO1lBQ25DLE9BQUtLLE9BQU8sR0FBR0wsVUFBVTtVQUMxQixDQUFDLE1BQU07WUFDTk0sR0FBRyxDQUFDQyxJQUFJLENBQUMsMEZBQTBGLENBQUM7VUFDckc7VUFDQSxPQUFPQyxPQUFPLENBQUNDLE9BQU8sUUFBTTtRQUFDO01BQzlCLENBQUM7UUFBQTtNQUFBO0lBQUE7SUFBQTtFQUFBLEVBOUNxQkMsUUFBUTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUEsT0FnRGhCbkIsUUFBUTtBQUFBIn0=