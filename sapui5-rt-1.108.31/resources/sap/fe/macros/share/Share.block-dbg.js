/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/buildingBlocks/BuildingBlock", "sap/fe/core/CommonUtils", "sap/fe/core/controls/CommandExecution", "sap/fe/core/helpers/ClassSupport", "sap/m/Menu", "sap/m/MenuButton", "sap/m/MenuItem", "sap/suite/ui/commons/collaboration/CollaborationHelper", "sap/suite/ui/commons/collaboration/ServiceContainer", "sap/ui/core/Core", "sap/ui/core/CustomData", "sap/ui/performance/trace/FESRHelper", "sap/ushell/ui/footerbar/AddBookmarkButton", "./ShareAPI", "sap/fe/core/jsx-runtime/jsx"], function (Log, BuildingBlock, CommonUtils, CommandExecution, ClassSupport, Menu, MenuButton, MenuItem, CollaborationHelper, ServiceContainer, Core, CustomData, FESRHelper, AddBookmarkButton, ShareAPI, _jsx) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5;
  var _exports = {};
  var defineReference = ClassSupport.defineReference;
  var defineBuildingBlock = BuildingBlock.defineBuildingBlock;
  var BuildingBlockBase = BuildingBlock.BuildingBlockBase;
  var blockAttribute = BuildingBlock.blockAttribute;
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * @classdesc
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
   * @class sap.fe.macros.Share
   * @hideconstructor
   * @public
   * @since 1.93.0
   */
  var ShareBuildingBlock = (_dec = defineBuildingBlock({
    name: "Share",
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros",
    isRuntime: true
  }), _dec2 = blockAttribute({
    type: "string",
    required: true,
    isPublic: true
  }), _dec3 = blockAttribute({
    type: "boolean",
    defaultValue: true,
    isPublic: true,
    bindable: true
  }), _dec4 = defineReference(), _dec5 = defineReference(), _dec6 = defineReference(), _dec(_class = (_class2 = /*#__PURE__*/function (_BuildingBlockBase) {
    _inheritsLoose(ShareBuildingBlock, _BuildingBlockBase);
    function ShareBuildingBlock() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BuildingBlockBase.call.apply(_BuildingBlockBase, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "id", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "visible", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "menuButton", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "menu", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "saveAsTileMenuItem", _descriptor5, _assertThisInitialized(_this));
      return _this;
    }
    _exports = ShareBuildingBlock;
    var _proto = ShareBuildingBlock.prototype;
    /**
     * Retrieves the share option from the shell configuration asynchronously and prepare the content of the menu button.
     * Options order are:
     * - Send E-Mail.
     * - Share in SAP Jam.
     * - Chat in Microsoft Teams.
     * - Save as Tile.
     *
     * @param view The view this building block is used in
     * @param appComponent The AppComponent instance
     */
    _proto._initializeMenuItems = function _initializeMenuItems(view, appComponent) {
      try {
        var _this3 = this;
        return Promise.resolve(CollaborationHelper.isTeamsModeActive()).then(function (isTeamsModeActive) {
          if (isTeamsModeActive) {
            var _this3$menuButton$cur, _this3$menuButton$cur2;
            //need to clear the visible property bindings otherwise when the binding value changes then it will set back the visible to the resolved value
            (_this3$menuButton$cur = _this3.menuButton.current) === null || _this3$menuButton$cur === void 0 ? void 0 : _this3$menuButton$cur.unbindProperty("visible", true);
            (_this3$menuButton$cur2 = _this3.menuButton.current) === null || _this3$menuButton$cur2 === void 0 ? void 0 : _this3$menuButton$cur2.setVisible(false);
            return;
          }
          var controller = view.getController();
          var coreResource = Core.getLibraryResourceBundle("sap.fe.core");
          var shellServices = appComponent.getShellServices();
          return Promise.resolve(shellServices.waitForPluginsLoad()).then(function (isPluginInfoStable) {
            if (!isPluginInfoStable) {
              var _this3$menuButton$cur3;
              // In case the plugin info is not yet available we need to do this computation again on the next button click
              var internalButton = (_this3$menuButton$cur3 = _this3.menuButton.current) === null || _this3$menuButton$cur3 === void 0 ? void 0 : _this3$menuButton$cur3.getAggregation("_control");
              internalButton === null || internalButton === void 0 ? void 0 : internalButton.attachEventOnce("press", {}, function () {
                return _this3._initializeMenuItems;
              }, _this3);
            }
            if (_this3.menu.current) {
              _this3.menu.current.addItem(_jsx(MenuItem, {
                text: coreResource.getText("T_SEMANTIC_CONTROL_SEND_EMAIL"),
                icon: "sap-icon://email",
                press: function () {
                  return controller.share._triggerEmail();
                }
              }));
              _this3._addShellBasedMenuItems(controller, shellServices, coreResource);
            }
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._addShellBasedMenuItems = function _addShellBasedMenuItems(controller, shellServices, coreResource) {
      try {
        var _shellServices$getUse, _shellServices$getUse2;
        var _this5 = this;
        var hasUshell = shellServices.hasUShell();
        var hasJam = !!((_shellServices$getUse = (_shellServices$getUse2 = shellServices.getUser()).isJamActive) !== null && _shellServices$getUse !== void 0 && _shellServices$getUse.call(_shellServices$getUse2));
        return Promise.resolve(ServiceContainer.getServiceAsync()).then(function (collaborationTeamsHelper) {
          var shareCollaborationOptions = collaborationTeamsHelper.getOptions();
          if (hasUshell) {
            if (hasJam) {
              var _this5$menu, _this5$menu$current;
              _this5 === null || _this5 === void 0 ? void 0 : (_this5$menu = _this5.menu) === null || _this5$menu === void 0 ? void 0 : (_this5$menu$current = _this5$menu.current) === null || _this5$menu$current === void 0 ? void 0 : _this5$menu$current.addItem(_jsx(MenuItem, {
                text: coreResource.getText("T_COMMON_SAPFE_SHARE_JAM"),
                icon: "sap-icon://share-2",
                press: function () {
                  return controller.share._triggerShareToJam();
                }
              }));
            }
            // prepare teams menu items
            var _iterator = _createForOfIteratorHelper(shareCollaborationOptions),
              _step;
            try {
              var _loop = function () {
                var _collaborationOption$, _this5$menu3, _this5$menu3$current;
                var collaborationOption = _step.value;
                var menuItemSettings = {
                  text: collaborationOption.text,
                  icon: collaborationOption.icon,
                  items: []
                };
                if (collaborationOption !== null && collaborationOption !== void 0 && collaborationOption.subOptions && (collaborationOption === null || collaborationOption === void 0 ? void 0 : (_collaborationOption$ = collaborationOption.subOptions) === null || _collaborationOption$ === void 0 ? void 0 : _collaborationOption$.length) > 0) {
                  menuItemSettings.items = [];
                  collaborationOption.subOptions.forEach(function (subOption) {
                    var subMenuItem = new MenuItem({
                      text: subOption.text,
                      icon: subOption.icon,
                      press: _this5.collaborationMenuItemPress,
                      customData: new CustomData({
                        key: "collaborationData",
                        value: subOption
                      })
                    });
                    if (subOption.fesrStepName) {
                      FESRHelper.setSemanticStepname(subMenuItem, "press", subOption.fesrStepName);
                    }
                    menuItemSettings.items.push(subMenuItem);
                  });
                } else {
                  // if there are no sub option then the main option should be clickable
                  // so add a press handler.
                  menuItemSettings.press = _this5.collaborationMenuItemPress;
                  menuItemSettings["customData"] = new CustomData({
                    key: "collaborationData",
                    value: collaborationOption
                  });
                }
                var menuItem = new MenuItem(menuItemSettings);
                if (menuItemSettings.press && collaborationOption.fesrStepName) {
                  FESRHelper.setSemanticStepname(menuItem, "press", collaborationOption.fesrStepName);
                }
                _this5 === null || _this5 === void 0 ? void 0 : (_this5$menu3 = _this5.menu) === null || _this5$menu3 === void 0 ? void 0 : (_this5$menu3$current = _this5$menu3.current) === null || _this5$menu3$current === void 0 ? void 0 : _this5$menu3$current.addItem(menuItem);
              };
              for (_iterator.s(); !(_step = _iterator.n()).done;) {
                _loop();
              }
              // set save as tile
              // for now we need to create addBookmarkButton to use the save as tile feature.
              // In the future save as tile should be available as an API or a MenuItem so that it can be added to the Menu button.
              // This needs to be discussed with AddBookmarkButton team.
            } catch (err) {
              _iterator.e(err);
            } finally {
              _iterator.f();
            }
            var addBookmarkButton = new AddBookmarkButton();
            if (addBookmarkButton.getEnabled()) {
              var _this5$menu2, _this5$menu2$current;
              _this5 === null || _this5 === void 0 ? void 0 : (_this5$menu2 = _this5.menu) === null || _this5$menu2 === void 0 ? void 0 : (_this5$menu2$current = _this5$menu2.current) === null || _this5$menu2$current === void 0 ? void 0 : _this5$menu2$current.addItem(_jsx(MenuItem, {
                ref: _this5.saveAsTileMenuItem,
                text: addBookmarkButton.getText(),
                icon: addBookmarkButton.getIcon(),
                press: function () {
                  return controller.share._saveAsTile(_this5.saveAsTileMenuItem.current);
                },
                children: {
                  dependents: [addBookmarkButton]
                }
              }));
            } else {
              addBookmarkButton.destroy();
            }
          }
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto.collaborationMenuItemPress = function collaborationMenuItemPress(event) {
      try {
        var clickedMenuItem = event.getSource();
        return Promise.resolve(ServiceContainer.getServiceAsync()).then(function (collaborationTeamsHelper) {
          var view = CommonUtils.getTargetView(clickedMenuItem);
          var controller = view.getController();
          // call adapt share metadata so that the collaboration info model is updated with the required info
          return Promise.resolve(controller.share._adaptShareMetadata()).then(function () {
            var collaborationInfo = view.getModel("collaborationInfo").getData();
            collaborationTeamsHelper.share(clickedMenuItem.data("collaborationData"), collaborationInfo);
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto.render = function render(view, appComponent) {
      var _this6 = this;
      // Ctrl+Shift+S is needed for the time being but this needs to be removed after backlog from menu button
      var menuButton = _jsx(ShareAPI, {
        id: this.id,
        children: _jsx(MenuButton, {
          ref: this.menuButton,
          icon: "sap-icon://action",
          visible: this.visible,
          tooltip: "{sap.fe.i18n>M_COMMON_SAPFE_ACTION_SHARE} (Ctrl+Shift+S)",
          children: _jsx(Menu, {
            ref: this.menu
          })
        })
      });
      view.addDependent(_jsx(CommandExecution, {
        visible: this.visible,
        enabled: this.visible,
        command: "Share",
        execute: function () {
          var _this6$menuButton$cur;
          return (_this6$menuButton$cur = _this6.menuButton.current) === null || _this6$menuButton$cur === void 0 ? void 0 : _this6$menuButton$cur.getMenu().openBy(_this6.menuButton.current, true);
        }
      }));
      // The initialization is asynchronous, so we just trigger it and hope for the best
      this.isInitialized = this._initializeMenuItems(view, appComponent).catch(function (error) {
        Log.error(error);
      });
      return menuButton;
    };
    return ShareBuildingBlock;
  }(BuildingBlockBase), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "visible", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "menuButton", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "menu", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "saveAsTileMenuItem", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  _exports = ShareBuildingBlock;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJTaGFyZUJ1aWxkaW5nQmxvY2siLCJkZWZpbmVCdWlsZGluZ0Jsb2NrIiwibmFtZSIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsImlzUnVudGltZSIsImJsb2NrQXR0cmlidXRlIiwidHlwZSIsInJlcXVpcmVkIiwiaXNQdWJsaWMiLCJkZWZhdWx0VmFsdWUiLCJiaW5kYWJsZSIsImRlZmluZVJlZmVyZW5jZSIsIl9pbml0aWFsaXplTWVudUl0ZW1zIiwidmlldyIsImFwcENvbXBvbmVudCIsIkNvbGxhYm9yYXRpb25IZWxwZXIiLCJpc1RlYW1zTW9kZUFjdGl2ZSIsIm1lbnVCdXR0b24iLCJjdXJyZW50IiwidW5iaW5kUHJvcGVydHkiLCJzZXRWaXNpYmxlIiwiY29udHJvbGxlciIsImdldENvbnRyb2xsZXIiLCJjb3JlUmVzb3VyY2UiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwic2hlbGxTZXJ2aWNlcyIsImdldFNoZWxsU2VydmljZXMiLCJ3YWl0Rm9yUGx1Z2luc0xvYWQiLCJpc1BsdWdpbkluZm9TdGFibGUiLCJpbnRlcm5hbEJ1dHRvbiIsImdldEFnZ3JlZ2F0aW9uIiwiYXR0YWNoRXZlbnRPbmNlIiwibWVudSIsImFkZEl0ZW0iLCJnZXRUZXh0Iiwic2hhcmUiLCJfdHJpZ2dlckVtYWlsIiwiX2FkZFNoZWxsQmFzZWRNZW51SXRlbXMiLCJoYXNVc2hlbGwiLCJoYXNVU2hlbGwiLCJoYXNKYW0iLCJnZXRVc2VyIiwiaXNKYW1BY3RpdmUiLCJTZXJ2aWNlQ29udGFpbmVyIiwiZ2V0U2VydmljZUFzeW5jIiwiY29sbGFib3JhdGlvblRlYW1zSGVscGVyIiwic2hhcmVDb2xsYWJvcmF0aW9uT3B0aW9ucyIsImdldE9wdGlvbnMiLCJfdHJpZ2dlclNoYXJlVG9KYW0iLCJjb2xsYWJvcmF0aW9uT3B0aW9uIiwibWVudUl0ZW1TZXR0aW5ncyIsInRleHQiLCJpY29uIiwiaXRlbXMiLCJzdWJPcHRpb25zIiwibGVuZ3RoIiwiZm9yRWFjaCIsInN1Yk9wdGlvbiIsInN1Yk1lbnVJdGVtIiwiTWVudUl0ZW0iLCJwcmVzcyIsImNvbGxhYm9yYXRpb25NZW51SXRlbVByZXNzIiwiY3VzdG9tRGF0YSIsIkN1c3RvbURhdGEiLCJrZXkiLCJ2YWx1ZSIsImZlc3JTdGVwTmFtZSIsIkZFU1JIZWxwZXIiLCJzZXRTZW1hbnRpY1N0ZXBuYW1lIiwicHVzaCIsIm1lbnVJdGVtIiwiYWRkQm9va21hcmtCdXR0b24iLCJBZGRCb29rbWFya0J1dHRvbiIsImdldEVuYWJsZWQiLCJzYXZlQXNUaWxlTWVudUl0ZW0iLCJnZXRJY29uIiwiX3NhdmVBc1RpbGUiLCJkZXBlbmRlbnRzIiwiZGVzdHJveSIsImV2ZW50IiwiY2xpY2tlZE1lbnVJdGVtIiwiZ2V0U291cmNlIiwiQ29tbW9uVXRpbHMiLCJnZXRUYXJnZXRWaWV3IiwiX2FkYXB0U2hhcmVNZXRhZGF0YSIsImNvbGxhYm9yYXRpb25JbmZvIiwiZ2V0TW9kZWwiLCJnZXREYXRhIiwiZGF0YSIsInJlbmRlciIsImlkIiwidmlzaWJsZSIsImFkZERlcGVuZGVudCIsImdldE1lbnUiLCJvcGVuQnkiLCJpc0luaXRpYWxpemVkIiwiY2F0Y2giLCJlcnJvciIsIkxvZyIsIkJ1aWxkaW5nQmxvY2tCYXNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJTaGFyZS5ibG9jay50c3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlc291cmNlQnVuZGxlIGZyb20gXCJzYXAvYmFzZS9pMThuL1Jlc291cmNlQnVuZGxlXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHsgYmxvY2tBdHRyaWJ1dGUsIEJ1aWxkaW5nQmxvY2tCYXNlLCBkZWZpbmVCdWlsZGluZ0Jsb2NrLCBSdW50aW1lQnVpbGRpbmdCbG9jayB9IGZyb20gXCJzYXAvZmUvY29yZS9idWlsZGluZ0Jsb2Nrcy9CdWlsZGluZ0Jsb2NrXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgQ29tbWFuZEV4ZWN1dGlvbiBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbHMvQ29tbWFuZEV4ZWN1dGlvblwiO1xuaW1wb3J0IHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGRlZmluZVJlZmVyZW5jZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgUmVmIH0gZnJvbSBcInNhcC9mZS9jb3JlL2pzeC1ydW50aW1lL2pzeFwiO1xuaW1wb3J0IFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IHR5cGUgeyBJU2hlbGxTZXJ2aWNlcyB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaGVsbFNlcnZpY2VzRmFjdG9yeVwiO1xuaW1wb3J0IE1lbnUgZnJvbSBcInNhcC9tL01lbnVcIjtcbmltcG9ydCBNZW51QnV0dG9uIGZyb20gXCJzYXAvbS9NZW51QnV0dG9uXCI7XG5pbXBvcnQgTWVudUl0ZW0sIHsgJE1lbnVJdGVtU2V0dGluZ3MgfSBmcm9tIFwic2FwL20vTWVudUl0ZW1cIjtcbmltcG9ydCBDb2xsYWJvcmF0aW9uSGVscGVyIGZyb20gXCJzYXAvc3VpdGUvdWkvY29tbW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25IZWxwZXJcIjtcbmltcG9ydCBTZXJ2aWNlQ29udGFpbmVyIGZyb20gXCJzYXAvc3VpdGUvdWkvY29tbW9ucy9jb2xsYWJvcmF0aW9uL1NlcnZpY2VDb250YWluZXJcIjtcbmltcG9ydCBUZWFtc0hlbHBlclNlcnZpY2UsIHsgQ29sbGFib3JhdGlvbk9wdGlvbnMgfSBmcm9tIFwic2FwL3N1aXRlL3VpL2NvbW1vbnMvY29sbGFib3JhdGlvbi9UZWFtc0hlbHBlclNlcnZpY2VcIjtcbmltcG9ydCBVSTVFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuaW1wb3J0IEN1c3RvbURhdGEgZnJvbSBcInNhcC91aS9jb3JlL0N1c3RvbURhdGFcIjtcbmltcG9ydCBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgRkVTUkhlbHBlciBmcm9tIFwic2FwL3VpL3BlcmZvcm1hbmNlL3RyYWNlL0ZFU1JIZWxwZXJcIjtcbmltcG9ydCBBZGRCb29rbWFya0J1dHRvbiBmcm9tIFwic2FwL3VzaGVsbC91aS9mb290ZXJiYXIvQWRkQm9va21hcmtCdXR0b25cIjtcbmltcG9ydCBTaGFyZUFQSSBmcm9tIFwiLi9TaGFyZUFQSVwiO1xuXG4vKipcbiAqIEBjbGFzc2Rlc2NcbiAqIEJ1aWxkaW5nIGJsb2NrIHVzZWQgdG8gY3JlYXRlIHRoZSDigJhTaGFyZeKAmSBmdW5jdGlvbmFsaXR5LlxuICogPGJyPlxuICogUGxlYXNlIG5vdGUgdGhhdCB0aGUgJ1NoYXJlIGluIFNBUCBKYW0nIG9wdGlvbiBpcyBvbmx5IGF2YWlsYWJsZSBvbiBwbGF0Zm9ybXMgdGhhdCBhcmUgaW50ZWdyYXRlZCB3aXRoIFNBUCBKYW0uXG4gKiA8YnI+XG4gKiBJZiB5b3UgYXJlIGNvbnN1bWluZyB0aGlzIGJ1aWxkaW5nIGJsb2NrIGluIGFuIGVudmlyb25tZW50IHdoZXJlIHRoZSBTQVAgRmlvcmkgbGF1bmNocGFkIGlzIG5vdCBhdmFpbGFibGUsIHRoZW4gdGhlICdTYXZlIGFzIFRpbGUnIG9wdGlvbiBpcyBub3QgdmlzaWJsZS5cbiAqXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86U2hhcmVcbiAqIFx0aWQ9XCJzb21lSURcIlxuICpcdHZpc2libGU9XCJ0cnVlXCJcbiAqIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqIEBjbGFzcyBzYXAuZmUubWFjcm9zLlNoYXJlXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHVibGljXG4gKiBAc2luY2UgMS45My4wXG4gKi9cbkBkZWZpbmVCdWlsZGluZ0Jsb2NrKHtcblx0bmFtZTogXCJTaGFyZVwiLFxuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHRwdWJsaWNOYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiLFxuXHRpc1J1bnRpbWU6IHRydWVcbn0pXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBTaGFyZUJ1aWxkaW5nQmxvY2sgZXh0ZW5kcyBCdWlsZGluZ0Jsb2NrQmFzZSBpbXBsZW1lbnRzIFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIHtcblx0QGJsb2NrQXR0cmlidXRlKHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdHJlcXVpcmVkOiB0cnVlLFxuXHRcdGlzUHVibGljOiB0cnVlXG5cdH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdEBibG9ja0F0dHJpYnV0ZSh7XG5cdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0ZGVmYXVsdFZhbHVlOiB0cnVlLFxuXHRcdGlzUHVibGljOiB0cnVlLFxuXHRcdGJpbmRhYmxlOiB0cnVlXG5cdH0pXG5cdHZpc2libGUhOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj47XG5cblx0QGRlZmluZVJlZmVyZW5jZSgpXG5cdG1lbnVCdXR0b24hOiBSZWY8TWVudUJ1dHRvbj47XG5cblx0QGRlZmluZVJlZmVyZW5jZSgpXG5cdG1lbnUhOiBSZWY8TWVudT47XG5cblx0QGRlZmluZVJlZmVyZW5jZSgpXG5cdHNhdmVBc1RpbGVNZW51SXRlbSE6IFJlZjxNZW51SXRlbT47XG5cblx0cHVibGljIGlzSW5pdGlhbGl6ZWQ/OiBQcm9taXNlPHZvaWQ+O1xuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHNoYXJlIG9wdGlvbiBmcm9tIHRoZSBzaGVsbCBjb25maWd1cmF0aW9uIGFzeW5jaHJvbm91c2x5IGFuZCBwcmVwYXJlIHRoZSBjb250ZW50IG9mIHRoZSBtZW51IGJ1dHRvbi5cblx0ICogT3B0aW9ucyBvcmRlciBhcmU6XG5cdCAqIC0gU2VuZCBFLU1haWwuXG5cdCAqIC0gU2hhcmUgaW4gU0FQIEphbS5cblx0ICogLSBDaGF0IGluIE1pY3Jvc29mdCBUZWFtcy5cblx0ICogLSBTYXZlIGFzIFRpbGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB2aWV3IFRoZSB2aWV3IHRoaXMgYnVpbGRpbmcgYmxvY2sgaXMgdXNlZCBpblxuXHQgKiBAcGFyYW0gYXBwQ29tcG9uZW50IFRoZSBBcHBDb21wb25lbnQgaW5zdGFuY2Vcblx0ICovXG5cdGFzeW5jIF9pbml0aWFsaXplTWVudUl0ZW1zKHZpZXc6IFZpZXcsIGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50KSB7XG5cdFx0Y29uc3QgaXNUZWFtc01vZGVBY3RpdmUgPSBhd2FpdCBDb2xsYWJvcmF0aW9uSGVscGVyLmlzVGVhbXNNb2RlQWN0aXZlKCk7XG5cdFx0aWYgKGlzVGVhbXNNb2RlQWN0aXZlKSB7XG5cdFx0XHQvL25lZWQgdG8gY2xlYXIgdGhlIHZpc2libGUgcHJvcGVydHkgYmluZGluZ3Mgb3RoZXJ3aXNlIHdoZW4gdGhlIGJpbmRpbmcgdmFsdWUgY2hhbmdlcyB0aGVuIGl0IHdpbGwgc2V0IGJhY2sgdGhlIHZpc2libGUgdG8gdGhlIHJlc29sdmVkIHZhbHVlXG5cdFx0XHR0aGlzLm1lbnVCdXR0b24uY3VycmVudD8udW5iaW5kUHJvcGVydHkoXCJ2aXNpYmxlXCIsIHRydWUpO1xuXHRcdFx0dGhpcy5tZW51QnV0dG9uLmN1cnJlbnQ/LnNldFZpc2libGUoZmFsc2UpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBjb250cm9sbGVyID0gdmlldy5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXI7XG5cdFx0Y29uc3QgY29yZVJlc291cmNlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHRjb25zdCBzaGVsbFNlcnZpY2VzID0gYXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKTtcblx0XHRjb25zdCBpc1BsdWdpbkluZm9TdGFibGUgPSBhd2FpdCBzaGVsbFNlcnZpY2VzLndhaXRGb3JQbHVnaW5zTG9hZCgpO1xuXHRcdGlmICghaXNQbHVnaW5JbmZvU3RhYmxlKSB7XG5cdFx0XHQvLyBJbiBjYXNlIHRoZSBwbHVnaW4gaW5mbyBpcyBub3QgeWV0IGF2YWlsYWJsZSB3ZSBuZWVkIHRvIGRvIHRoaXMgY29tcHV0YXRpb24gYWdhaW4gb24gdGhlIG5leHQgYnV0dG9uIGNsaWNrXG5cdFx0XHRjb25zdCBpbnRlcm5hbEJ1dHRvbiA9IHRoaXMubWVudUJ1dHRvbi5jdXJyZW50Py5nZXRBZ2dyZWdhdGlvbihcIl9jb250cm9sXCIpIGFzIE1hbmFnZWRPYmplY3Q7XG5cdFx0XHRpbnRlcm5hbEJ1dHRvbj8uYXR0YWNoRXZlbnRPbmNlKFwicHJlc3NcIiwge30sICgpID0+IHRoaXMuX2luaXRpYWxpemVNZW51SXRlbXMsIHRoaXMpO1xuXHRcdH1cblx0XHRpZiAodGhpcy5tZW51LmN1cnJlbnQpIHtcblx0XHRcdHRoaXMubWVudS5jdXJyZW50LmFkZEl0ZW0oXG5cdFx0XHRcdDxNZW51SXRlbVxuXHRcdFx0XHRcdHRleHQ9e2NvcmVSZXNvdXJjZS5nZXRUZXh0KFwiVF9TRU1BTlRJQ19DT05UUk9MX1NFTkRfRU1BSUxcIil9XG5cdFx0XHRcdFx0aWNvbj17XCJzYXAtaWNvbjovL2VtYWlsXCJ9XG5cdFx0XHRcdFx0cHJlc3M9eygpID0+IGNvbnRyb2xsZXIuc2hhcmUuX3RyaWdnZXJFbWFpbCgpfVxuXHRcdFx0XHQvPlxuXHRcdFx0KTtcblx0XHRcdHRoaXMuX2FkZFNoZWxsQmFzZWRNZW51SXRlbXMoY29udHJvbGxlciwgc2hlbGxTZXJ2aWNlcywgY29yZVJlc291cmNlKTtcblx0XHR9XG5cdH1cblxuXHRhc3luYyBfYWRkU2hlbGxCYXNlZE1lbnVJdGVtcyhjb250cm9sbGVyOiBQYWdlQ29udHJvbGxlciwgc2hlbGxTZXJ2aWNlczogSVNoZWxsU2VydmljZXMsIGNvcmVSZXNvdXJjZTogUmVzb3VyY2VCdW5kbGUpIHtcblx0XHRjb25zdCBoYXNVc2hlbGwgPSBzaGVsbFNlcnZpY2VzLmhhc1VTaGVsbCgpO1xuXHRcdGNvbnN0IGhhc0phbSA9ICEhc2hlbGxTZXJ2aWNlcy5nZXRVc2VyKCkuaXNKYW1BY3RpdmU/LigpO1xuXG5cdFx0Y29uc3QgY29sbGFib3JhdGlvblRlYW1zSGVscGVyOiBUZWFtc0hlbHBlclNlcnZpY2UgPSBhd2FpdCBTZXJ2aWNlQ29udGFpbmVyLmdldFNlcnZpY2VBc3luYygpO1xuXHRcdGNvbnN0IHNoYXJlQ29sbGFib3JhdGlvbk9wdGlvbnM6IENvbGxhYm9yYXRpb25PcHRpb25zW10gPSBjb2xsYWJvcmF0aW9uVGVhbXNIZWxwZXIuZ2V0T3B0aW9ucygpO1xuXHRcdGlmIChoYXNVc2hlbGwpIHtcblx0XHRcdGlmIChoYXNKYW0pIHtcblx0XHRcdFx0dGhpcz8ubWVudT8uY3VycmVudD8uYWRkSXRlbShcblx0XHRcdFx0XHQ8TWVudUl0ZW1cblx0XHRcdFx0XHRcdHRleHQ9e2NvcmVSZXNvdXJjZS5nZXRUZXh0KFwiVF9DT01NT05fU0FQRkVfU0hBUkVfSkFNXCIpfVxuXHRcdFx0XHRcdFx0aWNvbj17XCJzYXAtaWNvbjovL3NoYXJlLTJcIn1cblx0XHRcdFx0XHRcdHByZXNzPXsoKSA9PiBjb250cm9sbGVyLnNoYXJlLl90cmlnZ2VyU2hhcmVUb0phbSgpfVxuXHRcdFx0XHRcdC8+XG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0XHQvLyBwcmVwYXJlIHRlYW1zIG1lbnUgaXRlbXNcblx0XHRcdGZvciAoY29uc3QgY29sbGFib3JhdGlvbk9wdGlvbiBvZiBzaGFyZUNvbGxhYm9yYXRpb25PcHRpb25zKSB7XG5cdFx0XHRcdGNvbnN0IG1lbnVJdGVtU2V0dGluZ3M6ICRNZW51SXRlbVNldHRpbmdzID0ge1xuXHRcdFx0XHRcdHRleHQ6IGNvbGxhYm9yYXRpb25PcHRpb24udGV4dCxcblx0XHRcdFx0XHRpY29uOiBjb2xsYWJvcmF0aW9uT3B0aW9uLmljb24sXG5cdFx0XHRcdFx0aXRlbXM6IFtdXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0aWYgKGNvbGxhYm9yYXRpb25PcHRpb24/LnN1Yk9wdGlvbnMgJiYgY29sbGFib3JhdGlvbk9wdGlvbj8uc3ViT3B0aW9ucz8ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdG1lbnVJdGVtU2V0dGluZ3MuaXRlbXMgPSBbXTtcblx0XHRcdFx0XHRjb2xsYWJvcmF0aW9uT3B0aW9uLnN1Yk9wdGlvbnMuZm9yRWFjaCgoc3ViT3B0aW9uOiBDb2xsYWJvcmF0aW9uT3B0aW9ucykgPT4ge1xuXHRcdFx0XHRcdFx0Y29uc3Qgc3ViTWVudUl0ZW0gPSBuZXcgTWVudUl0ZW0oe1xuXHRcdFx0XHRcdFx0XHR0ZXh0OiBzdWJPcHRpb24udGV4dCxcblx0XHRcdFx0XHRcdFx0aWNvbjogc3ViT3B0aW9uLmljb24sXG5cdFx0XHRcdFx0XHRcdHByZXNzOiB0aGlzLmNvbGxhYm9yYXRpb25NZW51SXRlbVByZXNzLFxuXHRcdFx0XHRcdFx0XHRjdXN0b21EYXRhOiBuZXcgQ3VzdG9tRGF0YSh7XG5cdFx0XHRcdFx0XHRcdFx0a2V5OiBcImNvbGxhYm9yYXRpb25EYXRhXCIsXG5cdFx0XHRcdFx0XHRcdFx0dmFsdWU6IHN1Yk9wdGlvblxuXHRcdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRpZiAoc3ViT3B0aW9uLmZlc3JTdGVwTmFtZSkge1xuXHRcdFx0XHRcdFx0XHRGRVNSSGVscGVyLnNldFNlbWFudGljU3RlcG5hbWUoc3ViTWVudUl0ZW0sIFwicHJlc3NcIiwgc3ViT3B0aW9uLmZlc3JTdGVwTmFtZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQobWVudUl0ZW1TZXR0aW5ncy5pdGVtcyBhcyBNZW51SXRlbVtdKS5wdXNoKHN1Yk1lbnVJdGVtKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBpZiB0aGVyZSBhcmUgbm8gc3ViIG9wdGlvbiB0aGVuIHRoZSBtYWluIG9wdGlvbiBzaG91bGQgYmUgY2xpY2thYmxlXG5cdFx0XHRcdFx0Ly8gc28gYWRkIGEgcHJlc3MgaGFuZGxlci5cblx0XHRcdFx0XHRtZW51SXRlbVNldHRpbmdzLnByZXNzID0gdGhpcy5jb2xsYWJvcmF0aW9uTWVudUl0ZW1QcmVzcztcblx0XHRcdFx0XHRtZW51SXRlbVNldHRpbmdzW1wiY3VzdG9tRGF0YVwiXSA9IG5ldyBDdXN0b21EYXRhKHtcblx0XHRcdFx0XHRcdGtleTogXCJjb2xsYWJvcmF0aW9uRGF0YVwiLFxuXHRcdFx0XHRcdFx0dmFsdWU6IGNvbGxhYm9yYXRpb25PcHRpb25cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBtZW51SXRlbSA9IG5ldyBNZW51SXRlbShtZW51SXRlbVNldHRpbmdzKTtcblx0XHRcdFx0aWYgKG1lbnVJdGVtU2V0dGluZ3MucHJlc3MgJiYgY29sbGFib3JhdGlvbk9wdGlvbi5mZXNyU3RlcE5hbWUpIHtcblx0XHRcdFx0XHRGRVNSSGVscGVyLnNldFNlbWFudGljU3RlcG5hbWUobWVudUl0ZW0sIFwicHJlc3NcIiwgY29sbGFib3JhdGlvbk9wdGlvbi5mZXNyU3RlcE5hbWUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXM/Lm1lbnU/LmN1cnJlbnQ/LmFkZEl0ZW0obWVudUl0ZW0pO1xuXHRcdFx0fVxuXHRcdFx0Ly8gc2V0IHNhdmUgYXMgdGlsZVxuXHRcdFx0Ly8gZm9yIG5vdyB3ZSBuZWVkIHRvIGNyZWF0ZSBhZGRCb29rbWFya0J1dHRvbiB0byB1c2UgdGhlIHNhdmUgYXMgdGlsZSBmZWF0dXJlLlxuXHRcdFx0Ly8gSW4gdGhlIGZ1dHVyZSBzYXZlIGFzIHRpbGUgc2hvdWxkIGJlIGF2YWlsYWJsZSBhcyBhbiBBUEkgb3IgYSBNZW51SXRlbSBzbyB0aGF0IGl0IGNhbiBiZSBhZGRlZCB0byB0aGUgTWVudSBidXR0b24uXG5cdFx0XHQvLyBUaGlzIG5lZWRzIHRvIGJlIGRpc2N1c3NlZCB3aXRoIEFkZEJvb2ttYXJrQnV0dG9uIHRlYW0uXG5cdFx0XHRjb25zdCBhZGRCb29rbWFya0J1dHRvbiA9IG5ldyBBZGRCb29rbWFya0J1dHRvbigpO1xuXHRcdFx0aWYgKGFkZEJvb2ttYXJrQnV0dG9uLmdldEVuYWJsZWQoKSkge1xuXHRcdFx0XHR0aGlzPy5tZW51Py5jdXJyZW50Py5hZGRJdGVtKFxuXHRcdFx0XHRcdDxNZW51SXRlbVxuXHRcdFx0XHRcdFx0cmVmPXt0aGlzLnNhdmVBc1RpbGVNZW51SXRlbX1cblx0XHRcdFx0XHRcdHRleHQ9e2FkZEJvb2ttYXJrQnV0dG9uLmdldFRleHQoKX1cblx0XHRcdFx0XHRcdGljb249e2FkZEJvb2ttYXJrQnV0dG9uLmdldEljb24oKX1cblx0XHRcdFx0XHRcdHByZXNzPXsoKSA9PiBjb250cm9sbGVyLnNoYXJlLl9zYXZlQXNUaWxlKHRoaXMuc2F2ZUFzVGlsZU1lbnVJdGVtLmN1cnJlbnQpfVxuXHRcdFx0XHRcdD5cblx0XHRcdFx0XHRcdHt7IGRlcGVuZGVudHM6IFthZGRCb29rbWFya0J1dHRvbl0gfX1cblx0XHRcdFx0XHQ8L01lbnVJdGVtPlxuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0YWRkQm9va21hcmtCdXR0b24uZGVzdHJveSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGFzeW5jIGNvbGxhYm9yYXRpb25NZW51SXRlbVByZXNzKGV2ZW50OiBVSTVFdmVudCkge1xuXHRcdGNvbnN0IGNsaWNrZWRNZW51SXRlbSA9IGV2ZW50LmdldFNvdXJjZSgpIGFzIE1lbnVJdGVtO1xuXHRcdGNvbnN0IGNvbGxhYm9yYXRpb25UZWFtc0hlbHBlcjogVGVhbXNIZWxwZXJTZXJ2aWNlID0gYXdhaXQgU2VydmljZUNvbnRhaW5lci5nZXRTZXJ2aWNlQXN5bmMoKTtcblx0XHRjb25zdCB2aWV3OiBWaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhjbGlja2VkTWVudUl0ZW0pO1xuXHRcdGNvbnN0IGNvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyID0gdmlldy5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXI7XG5cdFx0Ly8gY2FsbCBhZGFwdCBzaGFyZSBtZXRhZGF0YSBzbyB0aGF0IHRoZSBjb2xsYWJvcmF0aW9uIGluZm8gbW9kZWwgaXMgdXBkYXRlZCB3aXRoIHRoZSByZXF1aXJlZCBpbmZvXG5cdFx0YXdhaXQgY29udHJvbGxlci5zaGFyZS5fYWRhcHRTaGFyZU1ldGFkYXRhKCk7XG5cdFx0Y29uc3QgY29sbGFib3JhdGlvbkluZm8gPSAodmlldy5nZXRNb2RlbChcImNvbGxhYm9yYXRpb25JbmZvXCIpIGFzIEpTT05Nb2RlbCkuZ2V0RGF0YSgpO1xuXHRcdGNvbGxhYm9yYXRpb25UZWFtc0hlbHBlci5zaGFyZShjbGlja2VkTWVudUl0ZW0uZGF0YShcImNvbGxhYm9yYXRpb25EYXRhXCIpLCBjb2xsYWJvcmF0aW9uSW5mbyk7XG5cdH1cblxuXHRyZW5kZXIodmlldzogVmlldywgYXBwQ29tcG9uZW50OiBBcHBDb21wb25lbnQpIHtcblx0XHQvLyBDdHJsK1NoaWZ0K1MgaXMgbmVlZGVkIGZvciB0aGUgdGltZSBiZWluZyBidXQgdGhpcyBuZWVkcyB0byBiZSByZW1vdmVkIGFmdGVyIGJhY2tsb2cgZnJvbSBtZW51IGJ1dHRvblxuXHRcdGNvbnN0IG1lbnVCdXR0b24gPSAoXG5cdFx0XHQ8U2hhcmVBUEkgaWQ9e3RoaXMuaWR9PlxuXHRcdFx0XHQ8TWVudUJ1dHRvblxuXHRcdFx0XHRcdHJlZj17dGhpcy5tZW51QnV0dG9ufVxuXHRcdFx0XHRcdGljb249e1wic2FwLWljb246Ly9hY3Rpb25cIn1cblx0XHRcdFx0XHR2aXNpYmxlPXt0aGlzLnZpc2libGUgYXMgYW55fVxuXHRcdFx0XHRcdHRvb2x0aXA9e1wie3NhcC5mZS5pMThuPk1fQ09NTU9OX1NBUEZFX0FDVElPTl9TSEFSRX0gKEN0cmwrU2hpZnQrUylcIn1cblx0XHRcdFx0PlxuXHRcdFx0XHRcdDxNZW51IHJlZj17dGhpcy5tZW51fT48L01lbnU+XG5cdFx0XHRcdDwvTWVudUJ1dHRvbj5cblx0XHRcdDwvU2hhcmVBUEk+XG5cdFx0KTtcblx0XHR2aWV3LmFkZERlcGVuZGVudChcblx0XHRcdDxDb21tYW5kRXhlY3V0aW9uXG5cdFx0XHRcdHZpc2libGU9e3RoaXMudmlzaWJsZX1cblx0XHRcdFx0ZW5hYmxlZD17dGhpcy52aXNpYmxlfVxuXHRcdFx0XHRjb21tYW5kPVwiU2hhcmVcIlxuXHRcdFx0XHRleGVjdXRlPXsoKSA9PiB0aGlzLm1lbnVCdXR0b24uY3VycmVudD8uZ2V0TWVudSgpLm9wZW5CeSh0aGlzLm1lbnVCdXR0b24uY3VycmVudCwgdHJ1ZSl9XG5cdFx0XHQvPlxuXHRcdCk7XG5cdFx0Ly8gVGhlIGluaXRpYWxpemF0aW9uIGlzIGFzeW5jaHJvbm91cywgc28gd2UganVzdCB0cmlnZ2VyIGl0IGFuZCBob3BlIGZvciB0aGUgYmVzdFxuXHRcdHRoaXMuaXNJbml0aWFsaXplZCA9IHRoaXMuX2luaXRpYWxpemVNZW51SXRlbXModmlldywgYXBwQ29tcG9uZW50KS5jYXRjaCgoZXJyb3IpID0+IHtcblx0XHRcdExvZy5lcnJvcihlcnJvciBhcyBzdHJpbmcpO1xuXHRcdH0pO1xuXHRcdHJldHVybiBtZW51QnV0dG9uO1xuXHR9XG59XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUEyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBcEJBLElBMkJxQkEsa0JBQWtCLFdBTnRDQyxtQkFBbUIsQ0FBQztJQUNwQkMsSUFBSSxFQUFFLE9BQU87SUFDYkMsU0FBUyxFQUFFLHdCQUF3QjtJQUNuQ0MsZUFBZSxFQUFFLGVBQWU7SUFDaENDLFNBQVMsRUFBRTtFQUNaLENBQUMsQ0FBQyxVQUVBQyxjQUFjLENBQUM7SUFDZkMsSUFBSSxFQUFFLFFBQVE7SUFDZEMsUUFBUSxFQUFFLElBQUk7SUFDZEMsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDLFVBR0RILGNBQWMsQ0FBQztJQUNmQyxJQUFJLEVBQUUsU0FBUztJQUNmRyxZQUFZLEVBQUUsSUFBSTtJQUNsQkQsUUFBUSxFQUFFLElBQUk7SUFDZEUsUUFBUSxFQUFFO0VBQ1gsQ0FBQyxDQUFDLFVBR0RDLGVBQWUsRUFBRSxVQUdqQkEsZUFBZSxFQUFFLFVBR2pCQSxlQUFlLEVBQUU7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQTtJQUFBO0lBQUE7SUFBQTtJQUtsQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBVkMsT0FXTUMsb0JBQW9CLGlDQUFDQyxJQUFVLEVBQUVDLFlBQTBCO01BQUEsSUFBRTtRQUFBLGFBSWpFLElBQUk7UUFBQSx1QkFIMkJDLG1CQUFtQixDQUFDQyxpQkFBaUIsRUFBRSxpQkFBakVBLGlCQUFpQjtVQUN2QixJQUFJQSxpQkFBaUIsRUFBRTtZQUFBO1lBQ3RCO1lBQ0EsZ0NBQUtDLFVBQVUsQ0FBQ0MsT0FBTywwREFBdkIsc0JBQXlCQyxjQUFjLENBQUMsU0FBUyxFQUFFLElBQUksQ0FBQztZQUN4RCxpQ0FBS0YsVUFBVSxDQUFDQyxPQUFPLDJEQUF2Qix1QkFBeUJFLFVBQVUsQ0FBQyxLQUFLLENBQUM7WUFDMUM7VUFDRDtVQUNBLElBQU1DLFVBQVUsR0FBR1IsSUFBSSxDQUFDUyxhQUFhLEVBQW9CO1VBQ3pELElBQU1DLFlBQVksR0FBR0MsSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUM7VUFDakUsSUFBTUMsYUFBYSxHQUFHWixZQUFZLENBQUNhLGdCQUFnQixFQUFFO1VBQUMsdUJBQ3JCRCxhQUFhLENBQUNFLGtCQUFrQixFQUFFLGlCQUE3REMsa0JBQWtCO1lBQ3hCLElBQUksQ0FBQ0Esa0JBQWtCLEVBQUU7Y0FBQTtjQUN4QjtjQUNBLElBQU1DLGNBQWMsNkJBQUcsT0FBS2IsVUFBVSxDQUFDQyxPQUFPLDJEQUF2Qix1QkFBeUJhLGNBQWMsQ0FBQyxVQUFVLENBQWtCO2NBQzNGRCxjQUFjLGFBQWRBLGNBQWMsdUJBQWRBLGNBQWMsQ0FBRUUsZUFBZSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsRUFBRTtnQkFBQSxPQUFNLE9BQUtwQixvQkFBb0I7Y0FBQSxVQUFPO1lBQ3BGO1lBQUMsSUFDRyxPQUFLcUIsSUFBSSxDQUFDZixPQUFPO2NBQ3BCLE9BQUtlLElBQUksQ0FBQ2YsT0FBTyxDQUFDZ0IsT0FBTyxDQUN4QixLQUFDLFFBQVE7Z0JBQ1IsSUFBSSxFQUFFWCxZQUFZLENBQUNZLE9BQU8sQ0FBQywrQkFBK0IsQ0FBRTtnQkFDNUQsSUFBSSxFQUFFLGtCQUFtQjtnQkFDekIsS0FBSyxFQUFFO2tCQUFBLE9BQU1kLFVBQVUsQ0FBQ2UsS0FBSyxDQUFDQyxhQUFhLEVBQUU7Z0JBQUE7Y0FBQyxFQUM3QyxDQUNGO2NBQ0QsT0FBS0MsdUJBQXVCLENBQUNqQixVQUFVLEVBQUVLLGFBQWEsRUFBRUgsWUFBWSxDQUFDO1lBQUM7VUFBQTtRQUFBO01BRXhFLENBQUM7UUFBQTtNQUFBO0lBQUE7SUFBQSxPQUVLZSx1QkFBdUIsb0NBQUNqQixVQUEwQixFQUFFSyxhQUE2QixFQUFFSCxZQUE0QjtNQUFBLElBQUU7UUFBQTtRQUFBLGFBUXBILElBQUk7UUFQTixJQUFNZ0IsU0FBUyxHQUFHYixhQUFhLENBQUNjLFNBQVMsRUFBRTtRQUMzQyxJQUFNQyxNQUFNLEdBQUcsQ0FBQywyQkFBQywwQkFBQWYsYUFBYSxDQUFDZ0IsT0FBTyxFQUFFLEVBQUNDLFdBQVcsa0RBQW5DLGtEQUF1QztRQUFDLHVCQUVFQyxnQkFBZ0IsQ0FBQ0MsZUFBZSxFQUFFLGlCQUF2RkMsd0JBQTRDO1VBQ2xELElBQU1DLHlCQUFpRCxHQUFHRCx3QkFBd0IsQ0FBQ0UsVUFBVSxFQUFFO1VBQUMsSUFDNUZULFNBQVM7WUFDWixJQUFJRSxNQUFNLEVBQUU7Y0FBQTtjQUNYLHNFQUFNUixJQUFJLHVFQUFWLFlBQVlmLE9BQU8sd0RBQW5CLG9CQUFxQmdCLE9BQU8sQ0FDM0IsS0FBQyxRQUFRO2dCQUNSLElBQUksRUFBRVgsWUFBWSxDQUFDWSxPQUFPLENBQUMsMEJBQTBCLENBQUU7Z0JBQ3ZELElBQUksRUFBRSxvQkFBcUI7Z0JBQzNCLEtBQUssRUFBRTtrQkFBQSxPQUFNZCxVQUFVLENBQUNlLEtBQUssQ0FBQ2Esa0JBQWtCLEVBQUU7Z0JBQUE7Y0FBQyxFQUNsRCxDQUNGO1lBQ0Y7WUFDQTtZQUFBLDJDQUNrQ0YseUJBQXlCO2NBQUE7WUFBQTtjQUFBO2dCQUFBO2dCQUFBLElBQWhERyxtQkFBbUI7Z0JBQzdCLElBQU1DLGdCQUFtQyxHQUFHO2tCQUMzQ0MsSUFBSSxFQUFFRixtQkFBbUIsQ0FBQ0UsSUFBSTtrQkFDOUJDLElBQUksRUFBRUgsbUJBQW1CLENBQUNHLElBQUk7a0JBQzlCQyxLQUFLLEVBQUU7Z0JBQ1IsQ0FBQztnQkFFRCxJQUFJSixtQkFBbUIsYUFBbkJBLG1CQUFtQixlQUFuQkEsbUJBQW1CLENBQUVLLFVBQVUsSUFBSSxDQUFBTCxtQkFBbUIsYUFBbkJBLG1CQUFtQixnREFBbkJBLG1CQUFtQixDQUFFSyxVQUFVLDBEQUEvQixzQkFBaUNDLE1BQU0sSUFBRyxDQUFDLEVBQUU7a0JBQ25GTCxnQkFBZ0IsQ0FBQ0csS0FBSyxHQUFHLEVBQUU7a0JBQzNCSixtQkFBbUIsQ0FBQ0ssVUFBVSxDQUFDRSxPQUFPLENBQUMsVUFBQ0MsU0FBK0IsRUFBSztvQkFDM0UsSUFBTUMsV0FBVyxHQUFHLElBQUlDLFFBQVEsQ0FBQztzQkFDaENSLElBQUksRUFBRU0sU0FBUyxDQUFDTixJQUFJO3NCQUNwQkMsSUFBSSxFQUFFSyxTQUFTLENBQUNMLElBQUk7c0JBQ3BCUSxLQUFLLEVBQUUsT0FBS0MsMEJBQTBCO3NCQUN0Q0MsVUFBVSxFQUFFLElBQUlDLFVBQVUsQ0FBQzt3QkFDMUJDLEdBQUcsRUFBRSxtQkFBbUI7d0JBQ3hCQyxLQUFLLEVBQUVSO3NCQUNSLENBQUM7b0JBQ0YsQ0FBQyxDQUFDO29CQUNGLElBQUlBLFNBQVMsQ0FBQ1MsWUFBWSxFQUFFO3NCQUMzQkMsVUFBVSxDQUFDQyxtQkFBbUIsQ0FBQ1YsV0FBVyxFQUFFLE9BQU8sRUFBRUQsU0FBUyxDQUFDUyxZQUFZLENBQUM7b0JBQzdFO29CQUNDaEIsZ0JBQWdCLENBQUNHLEtBQUssQ0FBZ0JnQixJQUFJLENBQUNYLFdBQVcsQ0FBQztrQkFDekQsQ0FBQyxDQUFDO2dCQUNILENBQUMsTUFBTTtrQkFDTjtrQkFDQTtrQkFDQVIsZ0JBQWdCLENBQUNVLEtBQUssR0FBRyxPQUFLQywwQkFBMEI7a0JBQ3hEWCxnQkFBZ0IsQ0FBQyxZQUFZLENBQUMsR0FBRyxJQUFJYSxVQUFVLENBQUM7b0JBQy9DQyxHQUFHLEVBQUUsbUJBQW1CO29CQUN4QkMsS0FBSyxFQUFFaEI7a0JBQ1IsQ0FBQyxDQUFDO2dCQUNIO2dCQUNBLElBQU1xQixRQUFRLEdBQUcsSUFBSVgsUUFBUSxDQUFDVCxnQkFBZ0IsQ0FBQztnQkFDL0MsSUFBSUEsZ0JBQWdCLENBQUNVLEtBQUssSUFBSVgsbUJBQW1CLENBQUNpQixZQUFZLEVBQUU7a0JBQy9EQyxVQUFVLENBQUNDLG1CQUFtQixDQUFDRSxRQUFRLEVBQUUsT0FBTyxFQUFFckIsbUJBQW1CLENBQUNpQixZQUFZLENBQUM7Z0JBQ3BGO2dCQUNBLHVFQUFNbEMsSUFBSSx5RUFBVixhQUFZZixPQUFPLHlEQUFuQixxQkFBcUJnQixPQUFPLENBQUNxQyxRQUFRLENBQUM7Y0FBQztjQXJDeEMsb0RBQTZEO2dCQUFBO2NBc0M3RDtjQUNBO2NBQ0E7Y0FDQTtjQUNBO1lBQUE7Y0FBQTtZQUFBO2NBQUE7WUFBQTtZQUNBLElBQU1DLGlCQUFpQixHQUFHLElBQUlDLGlCQUFpQixFQUFFO1lBQUMsSUFDOUNELGlCQUFpQixDQUFDRSxVQUFVLEVBQUU7Y0FBQTtjQUNqQyx1RUFBTXpDLElBQUkseUVBQVYsYUFBWWYsT0FBTyx5REFBbkIscUJBQXFCZ0IsT0FBTyxDQUMzQixLQUFDLFFBQVE7Z0JBQ1IsR0FBRyxFQUFFLE9BQUt5QyxrQkFBbUI7Z0JBQzdCLElBQUksRUFBRUgsaUJBQWlCLENBQUNyQyxPQUFPLEVBQUc7Z0JBQ2xDLElBQUksRUFBRXFDLGlCQUFpQixDQUFDSSxPQUFPLEVBQUc7Z0JBQ2xDLEtBQUssRUFBRTtrQkFBQSxPQUFNdkQsVUFBVSxDQUFDZSxLQUFLLENBQUN5QyxXQUFXLENBQUMsT0FBS0Ysa0JBQWtCLENBQUN6RCxPQUFPLENBQUM7Z0JBQUEsQ0FBQztnQkFBQSxVQUUxRTtrQkFBRTRELFVBQVUsRUFBRSxDQUFDTixpQkFBaUI7Z0JBQUU7Y0FBQyxFQUMxQixDQUNYO1lBQUM7Y0FFRkEsaUJBQWlCLENBQUNPLE9BQU8sRUFBRTtZQUFDO1VBQUE7UUFBQTtNQUcvQixDQUFDO1FBQUE7TUFBQTtJQUFBO0lBQUEsT0FFS2pCLDBCQUEwQix1Q0FBQ2tCLEtBQWU7TUFBQSxJQUFFO1FBQ2pELElBQU1DLGVBQWUsR0FBR0QsS0FBSyxDQUFDRSxTQUFTLEVBQWM7UUFBQyx1QkFDS3RDLGdCQUFnQixDQUFDQyxlQUFlLEVBQUUsaUJBQXZGQyx3QkFBNEM7VUFDbEQsSUFBTWpDLElBQVUsR0FBR3NFLFdBQVcsQ0FBQ0MsYUFBYSxDQUFDSCxlQUFlLENBQUM7VUFDN0QsSUFBTTVELFVBQTBCLEdBQUdSLElBQUksQ0FBQ1MsYUFBYSxFQUFvQjtVQUN6RTtVQUFBLHVCQUNNRCxVQUFVLENBQUNlLEtBQUssQ0FBQ2lELG1CQUFtQixFQUFFO1lBQzVDLElBQU1DLGlCQUFpQixHQUFJekUsSUFBSSxDQUFDMEUsUUFBUSxDQUFDLG1CQUFtQixDQUFDLENBQWVDLE9BQU8sRUFBRTtZQUNyRjFDLHdCQUF3QixDQUFDVixLQUFLLENBQUM2QyxlQUFlLENBQUNRLElBQUksQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFSCxpQkFBaUIsQ0FBQztVQUFDO1FBQUE7TUFDOUYsQ0FBQztRQUFBO01BQUE7SUFBQTtJQUFBLE9BRURJLE1BQU0sR0FBTixnQkFBTzdFLElBQVUsRUFBRUMsWUFBMEIsRUFBRTtNQUFBO01BQzlDO01BQ0EsSUFBTUcsVUFBVSxHQUNmLEtBQUMsUUFBUTtRQUFDLEVBQUUsRUFBRSxJQUFJLENBQUMwRSxFQUFHO1FBQUEsVUFDckIsS0FBQyxVQUFVO1VBQ1YsR0FBRyxFQUFFLElBQUksQ0FBQzFFLFVBQVc7VUFDckIsSUFBSSxFQUFFLG1CQUFvQjtVQUMxQixPQUFPLEVBQUUsSUFBSSxDQUFDMkUsT0FBZTtVQUM3QixPQUFPLEVBQUUsMERBQTJEO1VBQUEsVUFFcEUsS0FBQyxJQUFJO1lBQUMsR0FBRyxFQUFFLElBQUksQ0FBQzNEO1VBQUs7UUFBUTtNQUNqQixFQUVkO01BQ0RwQixJQUFJLENBQUNnRixZQUFZLENBQ2hCLEtBQUMsZ0JBQWdCO1FBQ2hCLE9BQU8sRUFBRSxJQUFJLENBQUNELE9BQVE7UUFDdEIsT0FBTyxFQUFFLElBQUksQ0FBQ0EsT0FBUTtRQUN0QixPQUFPLEVBQUMsT0FBTztRQUNmLE9BQU8sRUFBRTtVQUFBO1VBQUEsZ0NBQU0sTUFBSSxDQUFDM0UsVUFBVSxDQUFDQyxPQUFPLDBEQUF2QixzQkFBeUI0RSxPQUFPLEVBQUUsQ0FBQ0MsTUFBTSxDQUFDLE1BQUksQ0FBQzlFLFVBQVUsQ0FBQ0MsT0FBTyxFQUFFLElBQUksQ0FBQztRQUFBO01BQUMsRUFDdkYsQ0FDRjtNQUNEO01BQ0EsSUFBSSxDQUFDOEUsYUFBYSxHQUFHLElBQUksQ0FBQ3BGLG9CQUFvQixDQUFDQyxJQUFJLEVBQUVDLFlBQVksQ0FBQyxDQUFDbUYsS0FBSyxDQUFDLFVBQUNDLEtBQUssRUFBSztRQUNuRkMsR0FBRyxDQUFDRCxLQUFLLENBQUNBLEtBQUssQ0FBVztNQUMzQixDQUFDLENBQUM7TUFDRixPQUFPakYsVUFBVTtJQUNsQixDQUFDO0lBQUE7RUFBQSxFQXZMOENtRixpQkFBaUI7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBO0VBQUE7QUFBQSJ9