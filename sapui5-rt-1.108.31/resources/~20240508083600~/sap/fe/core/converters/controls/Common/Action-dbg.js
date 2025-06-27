/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/ID", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/formatters/FPMFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper"], function (BindingHelper, ConfigurableObject, ID, ManifestSettings, fpmFormatter, BindingToolkit, StableIdHelper) {
  "use strict";

  var _exports = {};
  var replaceSpecialChars = StableIdHelper.replaceSpecialChars;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var isConstant = BindingToolkit.isConstant;
  var ifElse = BindingToolkit.ifElse;
  var greaterOrEqual = BindingToolkit.greaterOrEqual;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var equal = BindingToolkit.equal;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var ActionType = ManifestSettings.ActionType;
  var getCustomActionID = ID.getCustomActionID;
  var Placement = ConfigurableObject.Placement;
  var bindingContextPathVisitor = BindingHelper.bindingContextPathVisitor;
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var ButtonType;
  (function (ButtonType) {
    ButtonType["Accept"] = "Accept";
    ButtonType["Attention"] = "Attention";
    ButtonType["Back"] = "Back";
    ButtonType["Critical"] = "Critical";
    ButtonType["Default"] = "Default";
    ButtonType["Emphasized"] = "Emphasized";
    ButtonType["Ghost"] = "Ghost";
    ButtonType["Negative"] = "Negative";
    ButtonType["Neutral"] = "Neutral";
    ButtonType["Reject"] = "Reject";
    ButtonType["Success"] = "Success";
    ButtonType["Transparent"] = "Transparent";
    ButtonType["Unstyled"] = "Unstyled";
    ButtonType["Up"] = "Up";
  })(ButtonType || (ButtonType = {}));
  _exports.ButtonType = ButtonType;
  /**
   * Maps an action by its key, based on the given annotation actions and manifest configuration. The result already represents the
   * merged action from both configuration sources.
   *
   * This function also returns an indication whether the action can be a menu item, saying whether it is visible or of a specific type
   * that allows this.
   *
   * @param manifestActions Actions defined in the manifest
   * @param annotationActions Actions defined through annotations
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   * @param actionKey Key to look up
   * @returns Merged action and indicator whether it can be a menu item
   */
  function mapActionByKey(manifestActions, annotationActions, hiddenActions, actionKey) {
    var annotationAction = annotationActions.find(function (action) {
      return action.key === actionKey;
    });
    var manifestAction = manifestActions[actionKey];
    var resultAction = _objectSpread({}, annotationAction !== null && annotationAction !== void 0 ? annotationAction : manifestAction);

    // Annotation action and manifest configuration already has to be merged here as insertCustomElements only considers top-level actions
    if (annotationAction) {
      var _manifestAction$enabl, _manifestAction$visib;
      // If enabled or visible is not set in the manifest, use the annotation value and hence do not overwrite
      resultAction.enabled = (_manifestAction$enabl = manifestAction === null || manifestAction === void 0 ? void 0 : manifestAction.enabled) !== null && _manifestAction$enabl !== void 0 ? _manifestAction$enabl : annotationAction.enabled;
      resultAction.visible = (_manifestAction$visib = manifestAction === null || manifestAction === void 0 ? void 0 : manifestAction.visible) !== null && _manifestAction$visib !== void 0 ? _manifestAction$visib : annotationAction.visible;
      for (var prop in manifestAction || {}) {
        if (!annotationAction[prop] && prop !== "menu") {
          resultAction[prop] = manifestAction[prop];
        }
      }
    }
    var canBeMenuItem = ((resultAction === null || resultAction === void 0 ? void 0 : resultAction.visible) || (resultAction === null || resultAction === void 0 ? void 0 : resultAction.type) === ActionType.DataFieldForAction || (resultAction === null || resultAction === void 0 ? void 0 : resultAction.type) === ActionType.DataFieldForIntentBasedNavigation) && !hiddenActions.find(function (hiddenAction) {
      return hiddenAction.key === (resultAction === null || resultAction === void 0 ? void 0 : resultAction.key);
    });
    return {
      action: resultAction,
      canBeMenuItem: canBeMenuItem
    };
  }

  /**
   * Map the default action key of a menu to its actual action configuration and identify whether this default action is a command.
   *
   * @param menuAction Menu action to map the default action for
   * @param manifestActions Actions defined in the manifest
   * @param annotationActions Actions defined through annotations
   * @param commandActions Array of command actions to push the default action to if applicable
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   */
  function mapMenuDefaultAction(menuAction, manifestActions, annotationActions, commandActions, hiddenActions) {
    var _mapActionByKey = mapActionByKey(manifestActions, annotationActions, hiddenActions, menuAction.defaultAction),
      action = _mapActionByKey.action,
      canBeMenuItem = _mapActionByKey.canBeMenuItem;
    if (canBeMenuItem) {
      menuAction.defaultAction = action;
    }
    if (action.command) {
      commandActions[action.key] = action;
    }
  }

  /**
   * Map the menu item keys of a menu to their actual action configurations and identify whether they are commands.
   *
   * @param menuAction Menu action to map the menu items for
   * @param manifestActions Actions defined in the manifest
   * @param annotationActions Actions defined through annotations
   * @param commandActions Array of command actions to push the menu item actions to if applicable
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   */
  function mapMenuItems(menuAction, manifestActions, annotationActions, commandActions, hiddenActions) {
    var _menuAction$menu;
    var mappedMenuItems = [];
    var _iterator = _createForOfIteratorHelper((_menuAction$menu = menuAction.menu) !== null && _menuAction$menu !== void 0 ? _menuAction$menu : []),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var menuItemKey = _step.value;
        var _mapActionByKey2 = mapActionByKey(manifestActions, annotationActions, hiddenActions, menuItemKey),
          action = _mapActionByKey2.action,
          canBeMenuItem = _mapActionByKey2.canBeMenuItem;
        if (canBeMenuItem) {
          mappedMenuItems.push(action);
        }
        if (action.command) {
          commandActions[menuItemKey] = action;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    menuAction.menu = mappedMenuItems;

    // If the menu is set to invisible, it should be invisible, otherwise the visibility should be calculated from the items
    var visibleExpressions = mappedMenuItems.map(function (menuItem) {
      return resolveBindingString(menuItem.visible, "boolean");
    });
    menuAction.visible = compileExpression(and(resolveBindingString(menuAction.visible, "boolean"), or.apply(void 0, _toConsumableArray(visibleExpressions))));
  }

  /**
   * Transforms the flat collection of actions into a nested structures of menus. The result is a record of actions that are either menus or
   * ones that do not appear in menus as menu items. It also returns a list of actions that have an assigned command.
   *
   * Note that menu items are already the merged result of annotation actions and their manifest configuration, as {@link insertCustomElements}
   * only considers root-level actions.
   *
   * @param manifestActions Actions defined in the manifest
   * @param annotationActions Actions defined through annotations
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   * @returns The transformed actions from the manifest and a list of command actions
   */
  function transformMenuActionsAndIdentifyCommands(manifestActions, annotationActions, hiddenActions) {
    var allActions = {};
    var actionKeysToDelete = [];
    var commandActions = {};
    for (var actionKey in manifestActions) {
      var manifestAction = manifestActions[actionKey];
      if (manifestAction.defaultAction !== undefined) {
        mapMenuDefaultAction(manifestAction, manifestActions, annotationActions, commandActions, hiddenActions);
      }
      if (manifestAction.type === ActionType.Menu) {
        var _manifestAction$menu;
        // Menu items should not appear as top-level actions themselves
        actionKeysToDelete.push.apply(actionKeysToDelete, _toConsumableArray(manifestAction.menu));
        mapMenuItems(manifestAction, manifestActions, annotationActions, commandActions, hiddenActions);

        // Menu has no visible items, so remove it
        if (!((_manifestAction$menu = manifestAction.menu) !== null && _manifestAction$menu !== void 0 && _manifestAction$menu.length)) {
          actionKeysToDelete.push(manifestAction.key);
        }
      }
      if (manifestAction.command) {
        commandActions[actionKey] = manifestAction;
      }
      allActions[actionKey] = manifestAction;
    }
    actionKeysToDelete.forEach(function (actionKey) {
      return delete allActions[actionKey];
    });
    return {
      actions: allActions,
      commandActions: commandActions
    };
  }

  /**
   * Gets the binding expression for the enablement of a manifest action.
   *
   * @param manifestAction The action configured in the manifest
   * @param isAnnotationAction Whether the action, defined in manifest, corresponds to an existing annotation action.
   * @param converterContext
   * @returns Determined property value for the enablement
   */
  var _getManifestEnabled = function (manifestAction, isAnnotationAction, converterContext) {
    if (isAnnotationAction && manifestAction.enabled === undefined) {
      // If annotation action has no property defined in manifest,
      // do not overwrite it with manifest action's default value.
      return undefined;
    }
    var result = getManifestActionBooleanPropertyWithFormatter(manifestAction.enabled, converterContext);

    // Consider requiresSelection property to include selectedContexts in the binding expression
    return compileExpression(ifElse(manifestAction.requiresSelection === true, and(greaterOrEqual(pathInModel("numberOfSelectedContexts", "internal"), 1), result), result));
  };

  /**
   * Gets the binding expression for the visibility of a manifest action.
   *
   * @param manifestAction The action configured in the manifest
   * @param isAnnotationAction Whether the action, defined in manifest, corresponds to an existing annotation action.
   * @param converterContext
   * @returns Determined property value for the visibility
   */
  var _getManifestVisible = function (manifestAction, isAnnotationAction, converterContext) {
    if (isAnnotationAction && manifestAction.visible === undefined) {
      // If annotation action has no property defined in manifest,
      // do not overwrite it with manifest action's default value.
      return undefined;
    }
    var result = getManifestActionBooleanPropertyWithFormatter(manifestAction.visible, converterContext);
    return compileExpression(result);
  };

  /**
   * As some properties should not be overridable by the manifest, make sure that the manifest configuration gets the annotation values for these.
   *
   * @param manifestAction Action defined in the manifest
   * @param annotationAction Action defined through annotations
   */
  function overrideManifestConfigurationWithAnnotation(manifestAction, annotationAction) {
    var _manifestAction$enabl2, _manifestAction$visib2;
    if (!annotationAction) {
      return;
    }

    // Do not override the 'type' given in an annotation action
    manifestAction.type = annotationAction.type;
    manifestAction.annotationPath = annotationAction.annotationPath;
    manifestAction.press = annotationAction.press;

    // Only use the annotation values for enablement and visibility if not set in the manifest
    manifestAction.enabled = (_manifestAction$enabl2 = manifestAction.enabled) !== null && _manifestAction$enabl2 !== void 0 ? _manifestAction$enabl2 : annotationAction.enabled;
    manifestAction.visible = (_manifestAction$visib2 = manifestAction.visible) !== null && _manifestAction$visib2 !== void 0 ? _manifestAction$visib2 : annotationAction.visible;
  }

  /**
   * Hide an action if it is a hidden header action.
   *
   * @param action The action to hide
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   */
  function hideActionIfHiddenAction(action, hiddenActions) {
    if (hiddenActions !== null && hiddenActions !== void 0 && hiddenActions.find(function (hiddenAction) {
      return hiddenAction.key === action.key;
    })) {
      action.visible = "false";
    }
  }

  /**
   * Creates the action configuration based on the manifest settings.
   *
   * @param manifestActions The manifest actions
   * @param converterContext The converter context
   * @param annotationActions The annotation actions definition
   * @param navigationSettings The navigation settings
   * @param considerNavigationSettings The navigation settings to be considered
   * @param hiddenActions Actions that are configured as hidden (additional to the visible property)
   * @param facetName The facet where an action is displayed if it is inline
   * @returns The actions from the manifest
   */
  function getActionsFromManifest(manifestActions, converterContext, annotationActions, navigationSettings, considerNavigationSettings, hiddenActions, facetName) {
    var actions = {};
    var _loop = function (actionKey) {
      var _manifestAction$press, _manifestAction$posit, _manifestAction$menu2;
      var manifestAction = manifestActions[actionKey];
      var lastDotIndex = ((_manifestAction$press = manifestAction.press) === null || _manifestAction$press === void 0 ? void 0 : _manifestAction$press.lastIndexOf(".")) || -1;
      var oAnnotationAction = annotationActions === null || annotationActions === void 0 ? void 0 : annotationActions.find(function (obj) {
        return obj.key === actionKey;
      });

      // To identify the annotation action property overwrite via manifest use-case.
      var isAnnotationAction = !!oAnnotationAction;
      if (manifestAction.facetName) {
        facetName = manifestAction.facetName;
      }
      actions[actionKey] = {
        id: oAnnotationAction ? actionKey : getCustomActionID(actionKey),
        type: manifestAction.menu ? ActionType.Menu : ActionType.Default,
        visible: _getManifestVisible(manifestAction, isAnnotationAction, converterContext),
        enabled: _getManifestEnabled(manifestAction, isAnnotationAction, converterContext),
        handlerModule: manifestAction.press && manifestAction.press.substring(0, lastDotIndex).replace(/\./gi, "/"),
        handlerMethod: manifestAction.press && manifestAction.press.substring(lastDotIndex + 1),
        press: manifestAction.press,
        text: manifestAction.text,
        noWrap: manifestAction.__noWrap,
        key: replaceSpecialChars(actionKey),
        enableOnSelect: manifestAction.enableOnSelect,
        defaultValuesExtensionFunction: manifestAction.defaultValuesFunction,
        position: {
          anchor: (_manifestAction$posit = manifestAction.position) === null || _manifestAction$posit === void 0 ? void 0 : _manifestAction$posit.anchor,
          placement: manifestAction.position === undefined ? Placement.After : manifestAction.position.placement
        },
        isNavigable: isActionNavigable(manifestAction, navigationSettings, considerNavigationSettings),
        command: manifestAction.command,
        requiresSelection: manifestAction.requiresSelection === undefined ? false : manifestAction.requiresSelection,
        enableAutoScroll: enableAutoScroll(manifestAction),
        menu: (_manifestAction$menu2 = manifestAction.menu) !== null && _manifestAction$menu2 !== void 0 ? _manifestAction$menu2 : [],
        facetName: manifestAction.inline ? facetName : undefined,
        defaultAction: manifestAction.defaultAction
      };
      overrideManifestConfigurationWithAnnotation(actions[actionKey], oAnnotationAction);
      hideActionIfHiddenAction(actions[actionKey], hiddenActions);
    };
    for (var actionKey in manifestActions) {
      _loop(actionKey);
    }
    return transformMenuActionsAndIdentifyCommands(actions, annotationActions !== null && annotationActions !== void 0 ? annotationActions : [], hiddenActions !== null && hiddenActions !== void 0 ? hiddenActions : []);
  }

  /**
   * Gets a binding expression representing a Boolean manifest property that can either be represented by a static value, a binding string,
   * or a runtime formatter function.
   *
   * @param propertyValue String representing the configured property value
   * @param converterContext
   * @returns A binding expression representing the property
   */
  _exports.getActionsFromManifest = getActionsFromManifest;
  function getManifestActionBooleanPropertyWithFormatter(propertyValue, converterContext) {
    var resolvedBinding = resolveBindingString(propertyValue, "boolean");
    var result;
    if (isConstant(resolvedBinding) && resolvedBinding.value === undefined) {
      // No property value configured in manifest for the custom action --> default value is true
      result = true;
    } else if (isConstant(resolvedBinding) && typeof resolvedBinding.value === "boolean") {
      // true / false
      result = resolvedBinding.value;
    } else if (resolvedBinding._type !== "EmbeddedBinding" && resolvedBinding._type !== "EmbeddedExpressionBinding") {
      var _converterContext$get;
      // Then it's a module-method reference "sap.xxx.yyy.doSomething"
      var methodPath = resolvedBinding.value;
      // FIXME: The custom "isEnabled" check does not trigger (because none of the bound values changes)
      result = formatResult([pathInModel("/", "$view"), methodPath, pathInModel("selectedContexts", "internal")], fpmFormatter.customBooleanPropertyCheck, ((_converterContext$get = converterContext.getDataModelObjectPath().contextLocation) === null || _converterContext$get === void 0 ? void 0 : _converterContext$get.targetEntityType) || converterContext.getEntityType());
    } else {
      // then it's a binding
      result = resolvedBinding;
    }
    return result;
  }
  var removeDuplicateActions = function (actions) {
    var oMenuItemKeys = {};
    actions.forEach(function (action) {
      var _action$menu;
      if (action !== null && action !== void 0 && (_action$menu = action.menu) !== null && _action$menu !== void 0 && _action$menu.length) {
        oMenuItemKeys = action.menu.reduce(function (item, _ref) {
          var key = _ref.key;
          if (key && !item[key]) {
            item[key] = true;
          }
          return item;
        }, oMenuItemKeys);
      }
    });
    return actions.filter(function (action) {
      return !oMenuItemKeys[action.key];
    });
  };

  /**
   * Method to determine the value of the 'enabled' property of an annotation-based action.
   *
   * @param converterContext The instance of the converter context
   * @param actionTarget The instance of the action
   * @returns The binding expression for the 'enabled' property of the action button.
   */
  _exports.removeDuplicateActions = removeDuplicateActions;
  function getEnabledForAnnotationAction(converterContext, actionTarget) {
    var _actionTarget$paramet;
    if ((actionTarget === null || actionTarget === void 0 ? void 0 : actionTarget.isBound) !== true) {
      return "true";
    }
    if (actionTarget !== null && actionTarget !== void 0 && (_actionTarget$paramet = actionTarget.parameters) !== null && _actionTarget$paramet !== void 0 && _actionTarget$paramet.length) {
      var _actionTarget$annotat, _actionTarget$annotat2;
      var bindingParameterFullName = actionTarget === null || actionTarget === void 0 ? void 0 : actionTarget.parameters[0].fullyQualifiedName,
        operationAvailableExpression = getExpressionFromAnnotation(actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$annotat = actionTarget.annotations.Core) === null || _actionTarget$annotat === void 0 ? void 0 : _actionTarget$annotat.OperationAvailable, [], undefined, function (path) {
          return bindingContextPathVisitor(path, converterContext, bindingParameterFullName);
        });
      if ((actionTarget === null || actionTarget === void 0 ? void 0 : (_actionTarget$annotat2 = actionTarget.annotations.Core) === null || _actionTarget$annotat2 === void 0 ? void 0 : _actionTarget$annotat2.OperationAvailable) !== undefined) {
        return compileExpression(equal(operationAvailableExpression, true));
      }
    }
    return "true";
  }
  _exports.getEnabledForAnnotationAction = getEnabledForAnnotationAction;
  function getSemanticObjectMapping(aMappings) {
    var aSemanticObjectMappings = [];
    aMappings.forEach(function (oMapping) {
      var oSOMapping = {
        "LocalProperty": {
          "$PropertyPath": oMapping.LocalProperty.value
        },
        "SemanticObjectProperty": oMapping.SemanticObjectProperty
      };
      aSemanticObjectMappings.push(oSOMapping);
    });
    return aSemanticObjectMappings;
  }
  _exports.getSemanticObjectMapping = getSemanticObjectMapping;
  function isActionNavigable(action, navigationSettings, considerNavigationSettings) {
    var _action$afterExecutio, _action$afterExecutio2;
    var bIsNavigationConfigured = true;
    if (considerNavigationSettings) {
      var detailOrDisplay = navigationSettings && (navigationSettings.detail || navigationSettings.display);
      bIsNavigationConfigured = detailOrDisplay !== null && detailOrDisplay !== void 0 && detailOrDisplay.route ? true : false;
    }
    // when enableAutoScroll is true the navigateToInstance feature is disabled
    if (action && action.afterExecution && (((_action$afterExecutio = action.afterExecution) === null || _action$afterExecutio === void 0 ? void 0 : _action$afterExecutio.navigateToInstance) === false || ((_action$afterExecutio2 = action.afterExecution) === null || _action$afterExecutio2 === void 0 ? void 0 : _action$afterExecutio2.enableAutoScroll) === true) || !bIsNavigationConfigured) {
      return false;
    }
    return true;
  }
  _exports.isActionNavigable = isActionNavigable;
  function enableAutoScroll(action) {
    var _action$afterExecutio3;
    return (action === null || action === void 0 ? void 0 : (_action$afterExecutio3 = action.afterExecution) === null || _action$afterExecutio3 === void 0 ? void 0 : _action$afterExecutio3.enableAutoScroll) === true;
  }
  _exports.enableAutoScroll = enableAutoScroll;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b25UeXBlIiwibWFwQWN0aW9uQnlLZXkiLCJtYW5pZmVzdEFjdGlvbnMiLCJhbm5vdGF0aW9uQWN0aW9ucyIsImhpZGRlbkFjdGlvbnMiLCJhY3Rpb25LZXkiLCJhbm5vdGF0aW9uQWN0aW9uIiwiZmluZCIsImFjdGlvbiIsImtleSIsIm1hbmlmZXN0QWN0aW9uIiwicmVzdWx0QWN0aW9uIiwiZW5hYmxlZCIsInZpc2libGUiLCJwcm9wIiwiY2FuQmVNZW51SXRlbSIsInR5cGUiLCJBY3Rpb25UeXBlIiwiRGF0YUZpZWxkRm9yQWN0aW9uIiwiRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiaGlkZGVuQWN0aW9uIiwibWFwTWVudURlZmF1bHRBY3Rpb24iLCJtZW51QWN0aW9uIiwiY29tbWFuZEFjdGlvbnMiLCJkZWZhdWx0QWN0aW9uIiwiY29tbWFuZCIsIm1hcE1lbnVJdGVtcyIsIm1hcHBlZE1lbnVJdGVtcyIsIm1lbnUiLCJtZW51SXRlbUtleSIsInB1c2giLCJ2aXNpYmxlRXhwcmVzc2lvbnMiLCJtYXAiLCJtZW51SXRlbSIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiY29tcGlsZUV4cHJlc3Npb24iLCJhbmQiLCJvciIsInRyYW5zZm9ybU1lbnVBY3Rpb25zQW5kSWRlbnRpZnlDb21tYW5kcyIsImFsbEFjdGlvbnMiLCJhY3Rpb25LZXlzVG9EZWxldGUiLCJ1bmRlZmluZWQiLCJNZW51IiwibGVuZ3RoIiwiZm9yRWFjaCIsImFjdGlvbnMiLCJfZ2V0TWFuaWZlc3RFbmFibGVkIiwiaXNBbm5vdGF0aW9uQWN0aW9uIiwiY29udmVydGVyQ29udGV4dCIsInJlc3VsdCIsImdldE1hbmlmZXN0QWN0aW9uQm9vbGVhblByb3BlcnR5V2l0aEZvcm1hdHRlciIsImlmRWxzZSIsInJlcXVpcmVzU2VsZWN0aW9uIiwiZ3JlYXRlck9yRXF1YWwiLCJwYXRoSW5Nb2RlbCIsIl9nZXRNYW5pZmVzdFZpc2libGUiLCJvdmVycmlkZU1hbmlmZXN0Q29uZmlndXJhdGlvbldpdGhBbm5vdGF0aW9uIiwiYW5ub3RhdGlvblBhdGgiLCJwcmVzcyIsImhpZGVBY3Rpb25JZkhpZGRlbkFjdGlvbiIsImdldEFjdGlvbnNGcm9tTWFuaWZlc3QiLCJuYXZpZ2F0aW9uU2V0dGluZ3MiLCJjb25zaWRlck5hdmlnYXRpb25TZXR0aW5ncyIsImZhY2V0TmFtZSIsImxhc3REb3RJbmRleCIsImxhc3RJbmRleE9mIiwib0Fubm90YXRpb25BY3Rpb24iLCJvYmoiLCJpZCIsImdldEN1c3RvbUFjdGlvbklEIiwiRGVmYXVsdCIsImhhbmRsZXJNb2R1bGUiLCJzdWJzdHJpbmciLCJyZXBsYWNlIiwiaGFuZGxlck1ldGhvZCIsInRleHQiLCJub1dyYXAiLCJfX25vV3JhcCIsInJlcGxhY2VTcGVjaWFsQ2hhcnMiLCJlbmFibGVPblNlbGVjdCIsImRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiIsImRlZmF1bHRWYWx1ZXNGdW5jdGlvbiIsInBvc2l0aW9uIiwiYW5jaG9yIiwicGxhY2VtZW50IiwiUGxhY2VtZW50IiwiQWZ0ZXIiLCJpc05hdmlnYWJsZSIsImlzQWN0aW9uTmF2aWdhYmxlIiwiZW5hYmxlQXV0b1Njcm9sbCIsImlubGluZSIsInByb3BlcnR5VmFsdWUiLCJyZXNvbHZlZEJpbmRpbmciLCJpc0NvbnN0YW50IiwidmFsdWUiLCJfdHlwZSIsIm1ldGhvZFBhdGgiLCJmb3JtYXRSZXN1bHQiLCJmcG1Gb3JtYXR0ZXIiLCJjdXN0b21Cb29sZWFuUHJvcGVydHlDaGVjayIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJjb250ZXh0TG9jYXRpb24iLCJ0YXJnZXRFbnRpdHlUeXBlIiwiZ2V0RW50aXR5VHlwZSIsInJlbW92ZUR1cGxpY2F0ZUFjdGlvbnMiLCJvTWVudUl0ZW1LZXlzIiwicmVkdWNlIiwiaXRlbSIsImZpbHRlciIsImdldEVuYWJsZWRGb3JBbm5vdGF0aW9uQWN0aW9uIiwiYWN0aW9uVGFyZ2V0IiwiaXNCb3VuZCIsInBhcmFtZXRlcnMiLCJiaW5kaW5nUGFyYW1ldGVyRnVsbE5hbWUiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJvcGVyYXRpb25BdmFpbGFibGVFeHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiYW5ub3RhdGlvbnMiLCJDb3JlIiwiT3BlcmF0aW9uQXZhaWxhYmxlIiwicGF0aCIsImJpbmRpbmdDb250ZXh0UGF0aFZpc2l0b3IiLCJlcXVhbCIsImdldFNlbWFudGljT2JqZWN0TWFwcGluZyIsImFNYXBwaW5ncyIsImFTZW1hbnRpY09iamVjdE1hcHBpbmdzIiwib01hcHBpbmciLCJvU09NYXBwaW5nIiwiTG9jYWxQcm9wZXJ0eSIsIlNlbWFudGljT2JqZWN0UHJvcGVydHkiLCJiSXNOYXZpZ2F0aW9uQ29uZmlndXJlZCIsImRldGFpbE9yRGlzcGxheSIsImRldGFpbCIsImRpc3BsYXkiLCJyb3V0ZSIsImFmdGVyRXhlY3V0aW9uIiwibmF2aWdhdGVUb0luc3RhbmNlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBY3Rpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBBY3Rpb24gfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IGJpbmRpbmdDb250ZXh0UGF0aFZpc2l0b3IgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgQ29uZmlndXJhYmxlT2JqZWN0LCBDdXN0b21FbGVtZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9Db25maWd1cmFibGVPYmplY3RcIjtcbmltcG9ydCB7IFBsYWNlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQ29uZmlndXJhYmxlT2JqZWN0XCI7XG5pbXBvcnQgeyBnZXRDdXN0b21BY3Rpb25JRCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSURcIjtcbmltcG9ydCB0eXBlIHtcblx0Q3VzdG9tRGVmaW5lZFRhYmxlQ29sdW1uRm9yT3ZlcnJpZGUsXG5cdE1hbmlmZXN0QWN0aW9uLFxuXHROYXZpZ2F0aW9uU2V0dGluZ3NDb25maWd1cmF0aW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NYW5pZmVzdFNldHRpbmdzXCI7XG5pbXBvcnQgZnBtRm9ybWF0dGVyIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL0ZQTUZvcm1hdHRlclwiO1xuaW1wb3J0IHR5cGUgeyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7XG5cdGFuZCxcblx0Y29tcGlsZUV4cHJlc3Npb24sXG5cdGVxdWFsLFxuXHRmb3JtYXRSZXN1bHQsXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0Z3JlYXRlck9yRXF1YWwsXG5cdGlmRWxzZSxcblx0aXNDb25zdGFudCxcblx0b3IsXG5cdHBhdGhJbk1vZGVsLFxuXHRyZXNvbHZlQmluZGluZ1N0cmluZ1xufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgcmVwbGFjZVNwZWNpYWxDaGFycyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCIuLi8uLi9Db252ZXJ0ZXJDb250ZXh0XCI7XG5cbmV4cG9ydCBlbnVtIEJ1dHRvblR5cGUge1xuXHRBY2NlcHQgPSBcIkFjY2VwdFwiLFxuXHRBdHRlbnRpb24gPSBcIkF0dGVudGlvblwiLFxuXHRCYWNrID0gXCJCYWNrXCIsXG5cdENyaXRpY2FsID0gXCJDcml0aWNhbFwiLFxuXHREZWZhdWx0ID0gXCJEZWZhdWx0XCIsXG5cdEVtcGhhc2l6ZWQgPSBcIkVtcGhhc2l6ZWRcIixcblx0R2hvc3QgPSBcIkdob3N0XCIsXG5cdE5lZ2F0aXZlID0gXCJOZWdhdGl2ZVwiLFxuXHROZXV0cmFsID0gXCJOZXV0cmFsXCIsXG5cdFJlamVjdCA9IFwiUmVqZWN0XCIsXG5cdFN1Y2Nlc3MgPSBcIlN1Y2Nlc3NcIixcblx0VHJhbnNwYXJlbnQgPSBcIlRyYW5zcGFyZW50XCIsXG5cdFVuc3R5bGVkID0gXCJVbnN0eWxlZFwiLFxuXHRVcCA9IFwiVXBcIlxufVxuXG5leHBvcnQgdHlwZSBCYXNlQWN0aW9uID0gQ29uZmlndXJhYmxlT2JqZWN0ICYge1xuXHRpZD86IHN0cmluZztcblx0dGV4dD86IHN0cmluZztcblx0dHlwZT86IEFjdGlvblR5cGU7XG5cdHByZXNzPzogc3RyaW5nO1xuXHRlbmFibGVkPzogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdHZpc2libGU/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0ZW5hYmxlT25TZWxlY3Q/OiBzdHJpbmc7XG5cdGFubm90YXRpb25QYXRoPzogc3RyaW5nO1xuXHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24/OiBzdHJpbmc7XG5cdGlzTmF2aWdhYmxlPzogYm9vbGVhbjtcblx0ZW5hYmxlQXV0b1Njcm9sbD86IGJvb2xlYW47XG5cdHJlcXVpcmVzRGlhbG9nPzogc3RyaW5nO1xuXHRiaW5kaW5nPzogc3RyaW5nO1xuXHRidXR0b25UeXBlPzogQnV0dG9uVHlwZS5HaG9zdCB8IEJ1dHRvblR5cGUuVHJhbnNwYXJlbnQgfCBzdHJpbmc7XG5cdHBhcmVudEVudGl0eURlbGV0ZUVuYWJsZWQ/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0bWVudT86IChzdHJpbmcgfCBDdXN0b21BY3Rpb24gfCBCYXNlQWN0aW9uKVtdO1xuXHRmYWNldE5hbWU/OiBzdHJpbmc7XG5cdGNvbW1hbmQ/OiBzdHJpbmcgfCB1bmRlZmluZWQ7XG59O1xuXG5leHBvcnQgdHlwZSBBbm5vdGF0aW9uQWN0aW9uID0gQmFzZUFjdGlvbiAmIHtcblx0dHlwZTogQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24gfCBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckFjdGlvbjtcblx0YW5ub3RhdGlvblBhdGg6IHN0cmluZztcblx0aWQ/OiBzdHJpbmc7XG5cdGN1c3RvbURhdGE/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIERlZmluaXRpb24gZm9yIGN1c3RvbSBhY3Rpb25zXG4gKlxuICogQHR5cGVkZWYgQ3VzdG9tQWN0aW9uXG4gKi9cbmV4cG9ydCB0eXBlIEN1c3RvbUFjdGlvbiA9IEN1c3RvbUVsZW1lbnQ8XG5cdEJhc2VBY3Rpb24gJiB7XG5cdFx0dHlwZT86IEFjdGlvblR5cGU7XG5cdFx0aGFuZGxlck1ldGhvZD86IHN0cmluZztcblx0XHRoYW5kbGVyTW9kdWxlPzogc3RyaW5nO1xuXHRcdG1lbnU/OiAoc3RyaW5nIHwgQ3VzdG9tQWN0aW9uIHwgQmFzZUFjdGlvbilbXTtcblx0XHRub1dyYXA/OiBib29sZWFuOyAvLyBJbmRpY2F0ZXMgdGhhdCB3ZSB3YW50IHRvIGF2b2lkIHRoZSB3cmFwcGluZyBmcm9tIHRoZSBGUE1IZWxwZXJcblx0XHRyZXF1aXJlc1NlbGVjdGlvbj86IGJvb2xlYW47XG5cdFx0ZGVmYXVsdEFjdGlvbj86IHN0cmluZyB8IEN1c3RvbUFjdGlvbiB8IEJhc2VBY3Rpb247IC8vSW5kaWNhdGVzIHdoZXRoZXIgYSBkZWZhdWx0IGFjdGlvbiBleGlzdHMgaW4gdGhpcyBjb250ZXh0XG5cdH1cbj47XG5cbi8vIFJldXNlIG9mIENvbmZpZ3VyYWJsZU9iamVjdCBhbmQgQ3VzdG9tRWxlbWVudCBpcyBkb25lIGZvciBvcmRlcmluZ1xuZXhwb3J0IHR5cGUgQ29udmVydGVyQWN0aW9uID0gQW5ub3RhdGlvbkFjdGlvbiB8IEN1c3RvbUFjdGlvbjtcblxuZXhwb3J0IHR5cGUgQ29tYmluZWRBY3Rpb24gPSB7XG5cdGFjdGlvbnM6IEJhc2VBY3Rpb25bXTtcblx0Y29tbWFuZEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj47XG59O1xuXG4vKipcbiAqIE1hcHMgYW4gYWN0aW9uIGJ5IGl0cyBrZXksIGJhc2VkIG9uIHRoZSBnaXZlbiBhbm5vdGF0aW9uIGFjdGlvbnMgYW5kIG1hbmlmZXN0IGNvbmZpZ3VyYXRpb24uIFRoZSByZXN1bHQgYWxyZWFkeSByZXByZXNlbnRzIHRoZVxuICogbWVyZ2VkIGFjdGlvbiBmcm9tIGJvdGggY29uZmlndXJhdGlvbiBzb3VyY2VzLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gYWxzbyByZXR1cm5zIGFuIGluZGljYXRpb24gd2hldGhlciB0aGUgYWN0aW9uIGNhbiBiZSBhIG1lbnUgaXRlbSwgc2F5aW5nIHdoZXRoZXIgaXQgaXMgdmlzaWJsZSBvciBvZiBhIHNwZWNpZmljIHR5cGVcbiAqIHRoYXQgYWxsb3dzIHRoaXMuXG4gKlxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9ucyBBY3Rpb25zIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG4gKiBAcGFyYW0gYW5ub3RhdGlvbkFjdGlvbnMgQWN0aW9ucyBkZWZpbmVkIHRocm91Z2ggYW5ub3RhdGlvbnNcbiAqIEBwYXJhbSBoaWRkZW5BY3Rpb25zIEFjdGlvbnMgdGhhdCBhcmUgY29uZmlndXJlZCBhcyBoaWRkZW4gKGFkZGl0aW9uYWwgdG8gdGhlIHZpc2libGUgcHJvcGVydHkpXG4gKiBAcGFyYW0gYWN0aW9uS2V5IEtleSB0byBsb29rIHVwXG4gKiBAcmV0dXJucyBNZXJnZWQgYWN0aW9uIGFuZCBpbmRpY2F0b3Igd2hldGhlciBpdCBjYW4gYmUgYSBtZW51IGl0ZW1cbiAqL1xuZnVuY3Rpb24gbWFwQWN0aW9uQnlLZXkoXG5cdG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPixcblx0YW5ub3RhdGlvbkFjdGlvbnM6IEJhc2VBY3Rpb25bXSxcblx0aGlkZGVuQWN0aW9uczogQmFzZUFjdGlvbltdLFxuXHRhY3Rpb25LZXk6IHN0cmluZ1xuKSB7XG5cdGNvbnN0IGFubm90YXRpb25BY3Rpb246IEJhc2VBY3Rpb24gfCBDdXN0b21BY3Rpb24gfCB1bmRlZmluZWQgPSBhbm5vdGF0aW9uQWN0aW9ucy5maW5kKFxuXHRcdChhY3Rpb246IEJhc2VBY3Rpb24pID0+IGFjdGlvbi5rZXkgPT09IGFjdGlvbktleVxuXHQpO1xuXHRjb25zdCBtYW5pZmVzdEFjdGlvbiA9IG1hbmlmZXN0QWN0aW9uc1thY3Rpb25LZXldO1xuXHRjb25zdCByZXN1bHRBY3Rpb24gPSB7IC4uLihhbm5vdGF0aW9uQWN0aW9uID8/IG1hbmlmZXN0QWN0aW9uKSB9O1xuXG5cdC8vIEFubm90YXRpb24gYWN0aW9uIGFuZCBtYW5pZmVzdCBjb25maWd1cmF0aW9uIGFscmVhZHkgaGFzIHRvIGJlIG1lcmdlZCBoZXJlIGFzIGluc2VydEN1c3RvbUVsZW1lbnRzIG9ubHkgY29uc2lkZXJzIHRvcC1sZXZlbCBhY3Rpb25zXG5cdGlmIChhbm5vdGF0aW9uQWN0aW9uKSB7XG5cdFx0Ly8gSWYgZW5hYmxlZCBvciB2aXNpYmxlIGlzIG5vdCBzZXQgaW4gdGhlIG1hbmlmZXN0LCB1c2UgdGhlIGFubm90YXRpb24gdmFsdWUgYW5kIGhlbmNlIGRvIG5vdCBvdmVyd3JpdGVcblx0XHRyZXN1bHRBY3Rpb24uZW5hYmxlZCA9IG1hbmlmZXN0QWN0aW9uPy5lbmFibGVkID8/IGFubm90YXRpb25BY3Rpb24uZW5hYmxlZDtcblx0XHRyZXN1bHRBY3Rpb24udmlzaWJsZSA9IG1hbmlmZXN0QWN0aW9uPy52aXNpYmxlID8/IGFubm90YXRpb25BY3Rpb24udmlzaWJsZTtcblxuXHRcdGZvciAoY29uc3QgcHJvcCBpbiBtYW5pZmVzdEFjdGlvbiB8fCB7fSkge1xuXHRcdFx0aWYgKCEoYW5ub3RhdGlvbkFjdGlvbiBhcyBhbnkpW3Byb3BdICYmIHByb3AgIT09IFwibWVudVwiKSB7XG5cdFx0XHRcdChyZXN1bHRBY3Rpb24gYXMgYW55KVtwcm9wXSA9IChtYW5pZmVzdEFjdGlvbiBhcyBhbnkpW3Byb3BdO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGNvbnN0IGNhbkJlTWVudUl0ZW0gPVxuXHRcdChyZXN1bHRBY3Rpb24/LnZpc2libGUgfHxcblx0XHRcdHJlc3VsdEFjdGlvbj8udHlwZSA9PT0gQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JBY3Rpb24gfHxcblx0XHRcdHJlc3VsdEFjdGlvbj8udHlwZSA9PT0gQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24pICYmXG5cdFx0IWhpZGRlbkFjdGlvbnMuZmluZCgoaGlkZGVuQWN0aW9uKSA9PiBoaWRkZW5BY3Rpb24ua2V5ID09PSByZXN1bHRBY3Rpb24/LmtleSk7XG5cblx0cmV0dXJuIHtcblx0XHRhY3Rpb246IHJlc3VsdEFjdGlvbixcblx0XHRjYW5CZU1lbnVJdGVtXG5cdH07XG59XG5cbi8qKlxuICogTWFwIHRoZSBkZWZhdWx0IGFjdGlvbiBrZXkgb2YgYSBtZW51IHRvIGl0cyBhY3R1YWwgYWN0aW9uIGNvbmZpZ3VyYXRpb24gYW5kIGlkZW50aWZ5IHdoZXRoZXIgdGhpcyBkZWZhdWx0IGFjdGlvbiBpcyBhIGNvbW1hbmQuXG4gKlxuICogQHBhcmFtIG1lbnVBY3Rpb24gTWVudSBhY3Rpb24gdG8gbWFwIHRoZSBkZWZhdWx0IGFjdGlvbiBmb3JcbiAqIEBwYXJhbSBtYW5pZmVzdEFjdGlvbnMgQWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHBhcmFtIGFubm90YXRpb25BY3Rpb25zIEFjdGlvbnMgZGVmaW5lZCB0aHJvdWdoIGFubm90YXRpb25zXG4gKiBAcGFyYW0gY29tbWFuZEFjdGlvbnMgQXJyYXkgb2YgY29tbWFuZCBhY3Rpb25zIHRvIHB1c2ggdGhlIGRlZmF1bHQgYWN0aW9uIHRvIGlmIGFwcGxpY2FibGVcbiAqIEBwYXJhbSBoaWRkZW5BY3Rpb25zIEFjdGlvbnMgdGhhdCBhcmUgY29uZmlndXJlZCBhcyBoaWRkZW4gKGFkZGl0aW9uYWwgdG8gdGhlIHZpc2libGUgcHJvcGVydHkpXG4gKi9cbmZ1bmN0aW9uIG1hcE1lbnVEZWZhdWx0QWN0aW9uKFxuXHRtZW51QWN0aW9uOiBDdXN0b21BY3Rpb24sXG5cdG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPixcblx0YW5ub3RhdGlvbkFjdGlvbnM6IEJhc2VBY3Rpb25bXSxcblx0Y29tbWFuZEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4sXG5cdGhpZGRlbkFjdGlvbnM6IEJhc2VBY3Rpb25bXVxuKSB7XG5cdGNvbnN0IHsgYWN0aW9uLCBjYW5CZU1lbnVJdGVtIH0gPSBtYXBBY3Rpb25CeUtleShtYW5pZmVzdEFjdGlvbnMsIGFubm90YXRpb25BY3Rpb25zLCBoaWRkZW5BY3Rpb25zLCBtZW51QWN0aW9uLmRlZmF1bHRBY3Rpb24gYXMgc3RyaW5nKTtcblxuXHRpZiAoY2FuQmVNZW51SXRlbSkge1xuXHRcdG1lbnVBY3Rpb24uZGVmYXVsdEFjdGlvbiA9IGFjdGlvbjtcblx0fVxuXG5cdGlmIChhY3Rpb24uY29tbWFuZCkge1xuXHRcdChjb21tYW5kQWN0aW9ucyBhcyBhbnkpW2FjdGlvbi5rZXldID0gYWN0aW9uO1xuXHR9XG59XG5cbi8qKlxuICogTWFwIHRoZSBtZW51IGl0ZW0ga2V5cyBvZiBhIG1lbnUgdG8gdGhlaXIgYWN0dWFsIGFjdGlvbiBjb25maWd1cmF0aW9ucyBhbmQgaWRlbnRpZnkgd2hldGhlciB0aGV5IGFyZSBjb21tYW5kcy5cbiAqXG4gKiBAcGFyYW0gbWVudUFjdGlvbiBNZW51IGFjdGlvbiB0byBtYXAgdGhlIG1lbnUgaXRlbXMgZm9yXG4gKiBAcGFyYW0gbWFuaWZlc3RBY3Rpb25zIEFjdGlvbnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3RcbiAqIEBwYXJhbSBhbm5vdGF0aW9uQWN0aW9ucyBBY3Rpb25zIGRlZmluZWQgdGhyb3VnaCBhbm5vdGF0aW9uc1xuICogQHBhcmFtIGNvbW1hbmRBY3Rpb25zIEFycmF5IG9mIGNvbW1hbmQgYWN0aW9ucyB0byBwdXNoIHRoZSBtZW51IGl0ZW0gYWN0aW9ucyB0byBpZiBhcHBsaWNhYmxlXG4gKiBAcGFyYW0gaGlkZGVuQWN0aW9ucyBBY3Rpb25zIHRoYXQgYXJlIGNvbmZpZ3VyZWQgYXMgaGlkZGVuIChhZGRpdGlvbmFsIHRvIHRoZSB2aXNpYmxlIHByb3BlcnR5KVxuICovXG5mdW5jdGlvbiBtYXBNZW51SXRlbXMoXG5cdG1lbnVBY3Rpb246IEN1c3RvbUFjdGlvbixcblx0bWFuaWZlc3RBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+LFxuXHRhbm5vdGF0aW9uQWN0aW9uczogQmFzZUFjdGlvbltdLFxuXHRjb21tYW5kQWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPixcblx0aGlkZGVuQWN0aW9uczogQmFzZUFjdGlvbltdXG4pIHtcblx0Y29uc3QgbWFwcGVkTWVudUl0ZW1zOiAoQ3VzdG9tQWN0aW9uIHwgQmFzZUFjdGlvbilbXSA9IFtdO1xuXG5cdGZvciAoY29uc3QgbWVudUl0ZW1LZXkgb2YgbWVudUFjdGlvbi5tZW51ID8/IFtdKSB7XG5cdFx0Y29uc3QgeyBhY3Rpb24sIGNhbkJlTWVudUl0ZW0gfSA9IG1hcEFjdGlvbkJ5S2V5KG1hbmlmZXN0QWN0aW9ucywgYW5ub3RhdGlvbkFjdGlvbnMsIGhpZGRlbkFjdGlvbnMsIG1lbnVJdGVtS2V5KTtcblxuXHRcdGlmIChjYW5CZU1lbnVJdGVtKSB7XG5cdFx0XHRtYXBwZWRNZW51SXRlbXMucHVzaChhY3Rpb24pO1xuXHRcdH1cblxuXHRcdGlmIChhY3Rpb24uY29tbWFuZCkge1xuXHRcdFx0KGNvbW1hbmRBY3Rpb25zIGFzIGFueSlbbWVudUl0ZW1LZXldID0gYWN0aW9uO1xuXHRcdH1cblx0fVxuXG5cdG1lbnVBY3Rpb24ubWVudSA9IG1hcHBlZE1lbnVJdGVtcztcblxuXHQvLyBJZiB0aGUgbWVudSBpcyBzZXQgdG8gaW52aXNpYmxlLCBpdCBzaG91bGQgYmUgaW52aXNpYmxlLCBvdGhlcndpc2UgdGhlIHZpc2liaWxpdHkgc2hvdWxkIGJlIGNhbGN1bGF0ZWQgZnJvbSB0aGUgaXRlbXNcblx0Y29uc3QgdmlzaWJsZUV4cHJlc3Npb25zOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj5bXSA9IG1hcHBlZE1lbnVJdGVtcy5tYXAoKG1lbnVJdGVtKSA9PlxuXHRcdHJlc29sdmVCaW5kaW5nU3RyaW5nKG1lbnVJdGVtLnZpc2libGUgYXMgc3RyaW5nLCBcImJvb2xlYW5cIilcblx0KTtcblx0bWVudUFjdGlvbi52aXNpYmxlID0gY29tcGlsZUV4cHJlc3Npb24oYW5kKHJlc29sdmVCaW5kaW5nU3RyaW5nKG1lbnVBY3Rpb24udmlzaWJsZSBhcyBzdHJpbmcsIFwiYm9vbGVhblwiKSwgb3IoLi4udmlzaWJsZUV4cHJlc3Npb25zKSkpO1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIGZsYXQgY29sbGVjdGlvbiBvZiBhY3Rpb25zIGludG8gYSBuZXN0ZWQgc3RydWN0dXJlcyBvZiBtZW51cy4gVGhlIHJlc3VsdCBpcyBhIHJlY29yZCBvZiBhY3Rpb25zIHRoYXQgYXJlIGVpdGhlciBtZW51cyBvclxuICogb25lcyB0aGF0IGRvIG5vdCBhcHBlYXIgaW4gbWVudXMgYXMgbWVudSBpdGVtcy4gSXQgYWxzbyByZXR1cm5zIGEgbGlzdCBvZiBhY3Rpb25zIHRoYXQgaGF2ZSBhbiBhc3NpZ25lZCBjb21tYW5kLlxuICpcbiAqIE5vdGUgdGhhdCBtZW51IGl0ZW1zIGFyZSBhbHJlYWR5IHRoZSBtZXJnZWQgcmVzdWx0IG9mIGFubm90YXRpb24gYWN0aW9ucyBhbmQgdGhlaXIgbWFuaWZlc3QgY29uZmlndXJhdGlvbiwgYXMge0BsaW5rIGluc2VydEN1c3RvbUVsZW1lbnRzfVxuICogb25seSBjb25zaWRlcnMgcm9vdC1sZXZlbCBhY3Rpb25zLlxuICpcbiAqIEBwYXJhbSBtYW5pZmVzdEFjdGlvbnMgQWN0aW9ucyBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHBhcmFtIGFubm90YXRpb25BY3Rpb25zIEFjdGlvbnMgZGVmaW5lZCB0aHJvdWdoIGFubm90YXRpb25zXG4gKiBAcGFyYW0gaGlkZGVuQWN0aW9ucyBBY3Rpb25zIHRoYXQgYXJlIGNvbmZpZ3VyZWQgYXMgaGlkZGVuIChhZGRpdGlvbmFsIHRvIHRoZSB2aXNpYmxlIHByb3BlcnR5KVxuICogQHJldHVybnMgVGhlIHRyYW5zZm9ybWVkIGFjdGlvbnMgZnJvbSB0aGUgbWFuaWZlc3QgYW5kIGEgbGlzdCBvZiBjb21tYW5kIGFjdGlvbnNcbiAqL1xuZnVuY3Rpb24gdHJhbnNmb3JtTWVudUFjdGlvbnNBbmRJZGVudGlmeUNvbW1hbmRzKFxuXHRtYW5pZmVzdEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4sXG5cdGFubm90YXRpb25BY3Rpb25zOiBCYXNlQWN0aW9uW10sXG5cdGhpZGRlbkFjdGlvbnM6IEJhc2VBY3Rpb25bXVxuKTogUmVjb3JkPHN0cmluZywgUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPj4ge1xuXHRjb25zdCBhbGxBY3Rpb25zOiBSZWNvcmQ8c3RyaW5nLCBDdXN0b21BY3Rpb24+ID0ge307XG5cdGNvbnN0IGFjdGlvbktleXNUb0RlbGV0ZTogc3RyaW5nW10gPSBbXTtcblx0Y29uc3QgY29tbWFuZEFjdGlvbnM6IFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4gPSB7fTtcblxuXHRmb3IgKGNvbnN0IGFjdGlvbktleSBpbiBtYW5pZmVzdEFjdGlvbnMpIHtcblx0XHRjb25zdCBtYW5pZmVzdEFjdGlvbjogQ3VzdG9tQWN0aW9uID0gbWFuaWZlc3RBY3Rpb25zW2FjdGlvbktleV07XG5cblx0XHRpZiAobWFuaWZlc3RBY3Rpb24uZGVmYXVsdEFjdGlvbiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRtYXBNZW51RGVmYXVsdEFjdGlvbihtYW5pZmVzdEFjdGlvbiwgbWFuaWZlc3RBY3Rpb25zLCBhbm5vdGF0aW9uQWN0aW9ucywgY29tbWFuZEFjdGlvbnMsIGhpZGRlbkFjdGlvbnMpO1xuXHRcdH1cblxuXHRcdGlmIChtYW5pZmVzdEFjdGlvbi50eXBlID09PSBBY3Rpb25UeXBlLk1lbnUpIHtcblx0XHRcdC8vIE1lbnUgaXRlbXMgc2hvdWxkIG5vdCBhcHBlYXIgYXMgdG9wLWxldmVsIGFjdGlvbnMgdGhlbXNlbHZlc1xuXHRcdFx0YWN0aW9uS2V5c1RvRGVsZXRlLnB1c2goLi4uKG1hbmlmZXN0QWN0aW9uLm1lbnUgYXMgc3RyaW5nW10pKTtcblxuXHRcdFx0bWFwTWVudUl0ZW1zKG1hbmlmZXN0QWN0aW9uLCBtYW5pZmVzdEFjdGlvbnMsIGFubm90YXRpb25BY3Rpb25zLCBjb21tYW5kQWN0aW9ucywgaGlkZGVuQWN0aW9ucyk7XG5cblx0XHRcdC8vIE1lbnUgaGFzIG5vIHZpc2libGUgaXRlbXMsIHNvIHJlbW92ZSBpdFxuXHRcdFx0aWYgKCFtYW5pZmVzdEFjdGlvbi5tZW51Py5sZW5ndGgpIHtcblx0XHRcdFx0YWN0aW9uS2V5c1RvRGVsZXRlLnB1c2gobWFuaWZlc3RBY3Rpb24ua2V5KTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAobWFuaWZlc3RBY3Rpb24uY29tbWFuZCkge1xuXHRcdFx0Y29tbWFuZEFjdGlvbnNbYWN0aW9uS2V5XSA9IG1hbmlmZXN0QWN0aW9uO1xuXHRcdH1cblxuXHRcdGFsbEFjdGlvbnNbYWN0aW9uS2V5XSA9IG1hbmlmZXN0QWN0aW9uO1xuXHR9XG5cblx0YWN0aW9uS2V5c1RvRGVsZXRlLmZvckVhY2goKGFjdGlvbktleTogc3RyaW5nKSA9PiBkZWxldGUgYWxsQWN0aW9uc1thY3Rpb25LZXldKTtcblxuXHRyZXR1cm4ge1xuXHRcdGFjdGlvbnM6IGFsbEFjdGlvbnMsXG5cdFx0Y29tbWFuZEFjdGlvbnM6IGNvbW1hbmRBY3Rpb25zXG5cdH07XG59XG5cbi8qKlxuICogR2V0cyB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciB0aGUgZW5hYmxlbWVudCBvZiBhIG1hbmlmZXN0IGFjdGlvbi5cbiAqXG4gKiBAcGFyYW0gbWFuaWZlc3RBY3Rpb24gVGhlIGFjdGlvbiBjb25maWd1cmVkIGluIHRoZSBtYW5pZmVzdFxuICogQHBhcmFtIGlzQW5ub3RhdGlvbkFjdGlvbiBXaGV0aGVyIHRoZSBhY3Rpb24sIGRlZmluZWQgaW4gbWFuaWZlc3QsIGNvcnJlc3BvbmRzIHRvIGFuIGV4aXN0aW5nIGFubm90YXRpb24gYWN0aW9uLlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHRcbiAqIEByZXR1cm5zIERldGVybWluZWQgcHJvcGVydHkgdmFsdWUgZm9yIHRoZSBlbmFibGVtZW50XG4gKi9cbmNvbnN0IF9nZXRNYW5pZmVzdEVuYWJsZWQgPSBmdW5jdGlvbiAoXG5cdG1hbmlmZXN0QWN0aW9uOiBNYW5pZmVzdEFjdGlvbixcblx0aXNBbm5vdGF0aW9uQWN0aW9uOiBib29sZWFuLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHVuZGVmaW5lZCB7XG5cdGlmIChpc0Fubm90YXRpb25BY3Rpb24gJiYgbWFuaWZlc3RBY3Rpb24uZW5hYmxlZCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0Ly8gSWYgYW5ub3RhdGlvbiBhY3Rpb24gaGFzIG5vIHByb3BlcnR5IGRlZmluZWQgaW4gbWFuaWZlc3QsXG5cdFx0Ly8gZG8gbm90IG92ZXJ3cml0ZSBpdCB3aXRoIG1hbmlmZXN0IGFjdGlvbidzIGRlZmF1bHQgdmFsdWUuXG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdGNvbnN0IHJlc3VsdCA9IGdldE1hbmlmZXN0QWN0aW9uQm9vbGVhblByb3BlcnR5V2l0aEZvcm1hdHRlcihtYW5pZmVzdEFjdGlvbi5lbmFibGVkLCBjb252ZXJ0ZXJDb250ZXh0KTtcblxuXHQvLyBDb25zaWRlciByZXF1aXJlc1NlbGVjdGlvbiBwcm9wZXJ0eSB0byBpbmNsdWRlIHNlbGVjdGVkQ29udGV4dHMgaW4gdGhlIGJpbmRpbmcgZXhwcmVzc2lvblxuXHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0aWZFbHNlKFxuXHRcdFx0bWFuaWZlc3RBY3Rpb24ucmVxdWlyZXNTZWxlY3Rpb24gPT09IHRydWUsXG5cdFx0XHRhbmQoZ3JlYXRlck9yRXF1YWwocGF0aEluTW9kZWwoXCJudW1iZXJPZlNlbGVjdGVkQ29udGV4dHNcIiwgXCJpbnRlcm5hbFwiKSwgMSksIHJlc3VsdCksXG5cdFx0XHRyZXN1bHRcblx0XHQpXG5cdCk7XG59O1xuXG4vKipcbiAqIEdldHMgdGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIHZpc2liaWxpdHkgb2YgYSBtYW5pZmVzdCBhY3Rpb24uXG4gKlxuICogQHBhcmFtIG1hbmlmZXN0QWN0aW9uIFRoZSBhY3Rpb24gY29uZmlndXJlZCBpbiB0aGUgbWFuaWZlc3RcbiAqIEBwYXJhbSBpc0Fubm90YXRpb25BY3Rpb24gV2hldGhlciB0aGUgYWN0aW9uLCBkZWZpbmVkIGluIG1hbmlmZXN0LCBjb3JyZXNwb25kcyB0byBhbiBleGlzdGluZyBhbm5vdGF0aW9uIGFjdGlvbi5cbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBEZXRlcm1pbmVkIHByb3BlcnR5IHZhbHVlIGZvciB0aGUgdmlzaWJpbGl0eVxuICovXG5jb25zdCBfZ2V0TWFuaWZlc3RWaXNpYmxlID0gZnVuY3Rpb24gKFxuXHRtYW5pZmVzdEFjdGlvbjogTWFuaWZlc3RBY3Rpb24sXG5cdGlzQW5ub3RhdGlvbkFjdGlvbjogYm9vbGVhbixcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dFxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCB1bmRlZmluZWQge1xuXHRpZiAoaXNBbm5vdGF0aW9uQWN0aW9uICYmIG1hbmlmZXN0QWN0aW9uLnZpc2libGUgPT09IHVuZGVmaW5lZCkge1xuXHRcdC8vIElmIGFubm90YXRpb24gYWN0aW9uIGhhcyBubyBwcm9wZXJ0eSBkZWZpbmVkIGluIG1hbmlmZXN0LFxuXHRcdC8vIGRvIG5vdCBvdmVyd3JpdGUgaXQgd2l0aCBtYW5pZmVzdCBhY3Rpb24ncyBkZWZhdWx0IHZhbHVlLlxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblxuXHRjb25zdCByZXN1bHQgPSBnZXRNYW5pZmVzdEFjdGlvbkJvb2xlYW5Qcm9wZXJ0eVdpdGhGb3JtYXR0ZXIobWFuaWZlc3RBY3Rpb24udmlzaWJsZSwgY29udmVydGVyQ29udGV4dCk7XG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihyZXN1bHQpO1xufTtcblxuLyoqXG4gKiBBcyBzb21lIHByb3BlcnRpZXMgc2hvdWxkIG5vdCBiZSBvdmVycmlkYWJsZSBieSB0aGUgbWFuaWZlc3QsIG1ha2Ugc3VyZSB0aGF0IHRoZSBtYW5pZmVzdCBjb25maWd1cmF0aW9uIGdldHMgdGhlIGFubm90YXRpb24gdmFsdWVzIGZvciB0aGVzZS5cbiAqXG4gKiBAcGFyYW0gbWFuaWZlc3RBY3Rpb24gQWN0aW9uIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG4gKiBAcGFyYW0gYW5ub3RhdGlvbkFjdGlvbiBBY3Rpb24gZGVmaW5lZCB0aHJvdWdoIGFubm90YXRpb25zXG4gKi9cbmZ1bmN0aW9uIG92ZXJyaWRlTWFuaWZlc3RDb25maWd1cmF0aW9uV2l0aEFubm90YXRpb24obWFuaWZlc3RBY3Rpb246IEN1c3RvbUFjdGlvbiwgYW5ub3RhdGlvbkFjdGlvbj86IEJhc2VBY3Rpb24pIHtcblx0aWYgKCFhbm5vdGF0aW9uQWN0aW9uKSB7XG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Ly8gRG8gbm90IG92ZXJyaWRlIHRoZSAndHlwZScgZ2l2ZW4gaW4gYW4gYW5ub3RhdGlvbiBhY3Rpb25cblx0bWFuaWZlc3RBY3Rpb24udHlwZSA9IGFubm90YXRpb25BY3Rpb24udHlwZTtcblx0bWFuaWZlc3RBY3Rpb24uYW5ub3RhdGlvblBhdGggPSBhbm5vdGF0aW9uQWN0aW9uLmFubm90YXRpb25QYXRoO1xuXHRtYW5pZmVzdEFjdGlvbi5wcmVzcyA9IGFubm90YXRpb25BY3Rpb24ucHJlc3M7XG5cblx0Ly8gT25seSB1c2UgdGhlIGFubm90YXRpb24gdmFsdWVzIGZvciBlbmFibGVtZW50IGFuZCB2aXNpYmlsaXR5IGlmIG5vdCBzZXQgaW4gdGhlIG1hbmlmZXN0XG5cdG1hbmlmZXN0QWN0aW9uLmVuYWJsZWQgPSBtYW5pZmVzdEFjdGlvbi5lbmFibGVkID8/IGFubm90YXRpb25BY3Rpb24uZW5hYmxlZDtcblx0bWFuaWZlc3RBY3Rpb24udmlzaWJsZSA9IG1hbmlmZXN0QWN0aW9uLnZpc2libGUgPz8gYW5ub3RhdGlvbkFjdGlvbi52aXNpYmxlO1xufVxuXG4vKipcbiAqIEhpZGUgYW4gYWN0aW9uIGlmIGl0IGlzIGEgaGlkZGVuIGhlYWRlciBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGFjdGlvbiBUaGUgYWN0aW9uIHRvIGhpZGVcbiAqIEBwYXJhbSBoaWRkZW5BY3Rpb25zIEFjdGlvbnMgdGhhdCBhcmUgY29uZmlndXJlZCBhcyBoaWRkZW4gKGFkZGl0aW9uYWwgdG8gdGhlIHZpc2libGUgcHJvcGVydHkpXG4gKi9cbmZ1bmN0aW9uIGhpZGVBY3Rpb25JZkhpZGRlbkFjdGlvbihhY3Rpb246IEN1c3RvbUFjdGlvbiwgaGlkZGVuQWN0aW9ucz86IEJhc2VBY3Rpb25bXSkge1xuXHRpZiAoaGlkZGVuQWN0aW9ucz8uZmluZCgoaGlkZGVuQWN0aW9uKSA9PiBoaWRkZW5BY3Rpb24ua2V5ID09PSBhY3Rpb24ua2V5KSkge1xuXHRcdGFjdGlvbi52aXNpYmxlID0gXCJmYWxzZVwiO1xuXHR9XG59XG5cbi8qKlxuICogQ3JlYXRlcyB0aGUgYWN0aW9uIGNvbmZpZ3VyYXRpb24gYmFzZWQgb24gdGhlIG1hbmlmZXN0IHNldHRpbmdzLlxuICpcbiAqIEBwYXJhbSBtYW5pZmVzdEFjdGlvbnMgVGhlIG1hbmlmZXN0IGFjdGlvbnNcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IFRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIGFubm90YXRpb25BY3Rpb25zIFRoZSBhbm5vdGF0aW9uIGFjdGlvbnMgZGVmaW5pdGlvblxuICogQHBhcmFtIG5hdmlnYXRpb25TZXR0aW5ncyBUaGUgbmF2aWdhdGlvbiBzZXR0aW5nc1xuICogQHBhcmFtIGNvbnNpZGVyTmF2aWdhdGlvblNldHRpbmdzIFRoZSBuYXZpZ2F0aW9uIHNldHRpbmdzIHRvIGJlIGNvbnNpZGVyZWRcbiAqIEBwYXJhbSBoaWRkZW5BY3Rpb25zIEFjdGlvbnMgdGhhdCBhcmUgY29uZmlndXJlZCBhcyBoaWRkZW4gKGFkZGl0aW9uYWwgdG8gdGhlIHZpc2libGUgcHJvcGVydHkpXG4gKiBAcGFyYW0gZmFjZXROYW1lIFRoZSBmYWNldCB3aGVyZSBhbiBhY3Rpb24gaXMgZGlzcGxheWVkIGlmIGl0IGlzIGlubGluZVxuICogQHJldHVybnMgVGhlIGFjdGlvbnMgZnJvbSB0aGUgbWFuaWZlc3RcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEFjdGlvbnNGcm9tTWFuaWZlc3QoXG5cdG1hbmlmZXN0QWN0aW9uczogUmVjb3JkPHN0cmluZywgTWFuaWZlc3RBY3Rpb24+IHwgdW5kZWZpbmVkLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRhbm5vdGF0aW9uQWN0aW9ucz86IEJhc2VBY3Rpb25bXSxcblx0bmF2aWdhdGlvblNldHRpbmdzPzogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0Y29uc2lkZXJOYXZpZ2F0aW9uU2V0dGluZ3M/OiBib29sZWFuLFxuXHRoaWRkZW5BY3Rpb25zPzogQmFzZUFjdGlvbltdLFxuXHRmYWNldE5hbWU/OiBzdHJpbmdcbik6IFJlY29yZDxzdHJpbmcsIFJlY29yZDxzdHJpbmcsIEN1c3RvbUFjdGlvbj4+IHtcblx0Y29uc3QgYWN0aW9uczogUmVjb3JkPHN0cmluZywgQ3VzdG9tQWN0aW9uPiA9IHt9O1xuXHRmb3IgKGNvbnN0IGFjdGlvbktleSBpbiBtYW5pZmVzdEFjdGlvbnMpIHtcblx0XHRjb25zdCBtYW5pZmVzdEFjdGlvbjogTWFuaWZlc3RBY3Rpb24gPSBtYW5pZmVzdEFjdGlvbnNbYWN0aW9uS2V5XTtcblx0XHRjb25zdCBsYXN0RG90SW5kZXggPSBtYW5pZmVzdEFjdGlvbi5wcmVzcz8ubGFzdEluZGV4T2YoXCIuXCIpIHx8IC0xO1xuXHRcdGNvbnN0IG9Bbm5vdGF0aW9uQWN0aW9uID0gYW5ub3RhdGlvbkFjdGlvbnM/LmZpbmQoKG9iaikgPT4gb2JqLmtleSA9PT0gYWN0aW9uS2V5KTtcblxuXHRcdC8vIFRvIGlkZW50aWZ5IHRoZSBhbm5vdGF0aW9uIGFjdGlvbiBwcm9wZXJ0eSBvdmVyd3JpdGUgdmlhIG1hbmlmZXN0IHVzZS1jYXNlLlxuXHRcdGNvbnN0IGlzQW5ub3RhdGlvbkFjdGlvbiA9ICEhb0Fubm90YXRpb25BY3Rpb247XG5cdFx0aWYgKG1hbmlmZXN0QWN0aW9uLmZhY2V0TmFtZSkge1xuXHRcdFx0ZmFjZXROYW1lID0gbWFuaWZlc3RBY3Rpb24uZmFjZXROYW1lO1xuXHRcdH1cblxuXHRcdGFjdGlvbnNbYWN0aW9uS2V5XSA9IHtcblx0XHRcdGlkOiBvQW5ub3RhdGlvbkFjdGlvbiA/IGFjdGlvbktleSA6IGdldEN1c3RvbUFjdGlvbklEKGFjdGlvbktleSksXG5cdFx0XHR0eXBlOiBtYW5pZmVzdEFjdGlvbi5tZW51ID8gQWN0aW9uVHlwZS5NZW51IDogQWN0aW9uVHlwZS5EZWZhdWx0LFxuXHRcdFx0dmlzaWJsZTogX2dldE1hbmlmZXN0VmlzaWJsZShtYW5pZmVzdEFjdGlvbiwgaXNBbm5vdGF0aW9uQWN0aW9uLCBjb252ZXJ0ZXJDb250ZXh0KSxcblx0XHRcdGVuYWJsZWQ6IF9nZXRNYW5pZmVzdEVuYWJsZWQobWFuaWZlc3RBY3Rpb24sIGlzQW5ub3RhdGlvbkFjdGlvbiwgY29udmVydGVyQ29udGV4dCksXG5cdFx0XHRoYW5kbGVyTW9kdWxlOiBtYW5pZmVzdEFjdGlvbi5wcmVzcyAmJiBtYW5pZmVzdEFjdGlvbi5wcmVzcy5zdWJzdHJpbmcoMCwgbGFzdERvdEluZGV4KS5yZXBsYWNlKC9cXC4vZ2ksIFwiL1wiKSxcblx0XHRcdGhhbmRsZXJNZXRob2Q6IG1hbmlmZXN0QWN0aW9uLnByZXNzICYmIG1hbmlmZXN0QWN0aW9uLnByZXNzLnN1YnN0cmluZyhsYXN0RG90SW5kZXggKyAxKSxcblx0XHRcdHByZXNzOiBtYW5pZmVzdEFjdGlvbi5wcmVzcyxcblx0XHRcdHRleHQ6IG1hbmlmZXN0QWN0aW9uLnRleHQsXG5cdFx0XHRub1dyYXA6IG1hbmlmZXN0QWN0aW9uLl9fbm9XcmFwLFxuXHRcdFx0a2V5OiByZXBsYWNlU3BlY2lhbENoYXJzKGFjdGlvbktleSksXG5cdFx0XHRlbmFibGVPblNlbGVjdDogbWFuaWZlc3RBY3Rpb24uZW5hYmxlT25TZWxlY3QsXG5cdFx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246IG1hbmlmZXN0QWN0aW9uLmRlZmF1bHRWYWx1ZXNGdW5jdGlvbixcblx0XHRcdHBvc2l0aW9uOiB7XG5cdFx0XHRcdGFuY2hvcjogbWFuaWZlc3RBY3Rpb24ucG9zaXRpb24/LmFuY2hvcixcblx0XHRcdFx0cGxhY2VtZW50OiBtYW5pZmVzdEFjdGlvbi5wb3NpdGlvbiA9PT0gdW5kZWZpbmVkID8gUGxhY2VtZW50LkFmdGVyIDogbWFuaWZlc3RBY3Rpb24ucG9zaXRpb24ucGxhY2VtZW50XG5cdFx0XHR9LFxuXHRcdFx0aXNOYXZpZ2FibGU6IGlzQWN0aW9uTmF2aWdhYmxlKG1hbmlmZXN0QWN0aW9uLCBuYXZpZ2F0aW9uU2V0dGluZ3MsIGNvbnNpZGVyTmF2aWdhdGlvblNldHRpbmdzKSxcblx0XHRcdGNvbW1hbmQ6IG1hbmlmZXN0QWN0aW9uLmNvbW1hbmQsXG5cdFx0XHRyZXF1aXJlc1NlbGVjdGlvbjogbWFuaWZlc3RBY3Rpb24ucmVxdWlyZXNTZWxlY3Rpb24gPT09IHVuZGVmaW5lZCA/IGZhbHNlIDogbWFuaWZlc3RBY3Rpb24ucmVxdWlyZXNTZWxlY3Rpb24sXG5cdFx0XHRlbmFibGVBdXRvU2Nyb2xsOiBlbmFibGVBdXRvU2Nyb2xsKG1hbmlmZXN0QWN0aW9uKSxcblx0XHRcdG1lbnU6IG1hbmlmZXN0QWN0aW9uLm1lbnUgPz8gW10sXG5cdFx0XHRmYWNldE5hbWU6IG1hbmlmZXN0QWN0aW9uLmlubGluZSA/IGZhY2V0TmFtZSA6IHVuZGVmaW5lZCxcblx0XHRcdGRlZmF1bHRBY3Rpb246IG1hbmlmZXN0QWN0aW9uLmRlZmF1bHRBY3Rpb25cblx0XHR9O1xuXG5cdFx0b3ZlcnJpZGVNYW5pZmVzdENvbmZpZ3VyYXRpb25XaXRoQW5ub3RhdGlvbihhY3Rpb25zW2FjdGlvbktleV0sIG9Bbm5vdGF0aW9uQWN0aW9uKTtcblx0XHRoaWRlQWN0aW9uSWZIaWRkZW5BY3Rpb24oYWN0aW9uc1thY3Rpb25LZXldLCBoaWRkZW5BY3Rpb25zKTtcblx0fVxuXG5cdHJldHVybiB0cmFuc2Zvcm1NZW51QWN0aW9uc0FuZElkZW50aWZ5Q29tbWFuZHMoYWN0aW9ucywgYW5ub3RhdGlvbkFjdGlvbnMgPz8gW10sIGhpZGRlbkFjdGlvbnMgPz8gW10pO1xufVxuXG4vKipcbiAqIEdldHMgYSBiaW5kaW5nIGV4cHJlc3Npb24gcmVwcmVzZW50aW5nIGEgQm9vbGVhbiBtYW5pZmVzdCBwcm9wZXJ0eSB0aGF0IGNhbiBlaXRoZXIgYmUgcmVwcmVzZW50ZWQgYnkgYSBzdGF0aWMgdmFsdWUsIGEgYmluZGluZyBzdHJpbmcsXG4gKiBvciBhIHJ1bnRpbWUgZm9ybWF0dGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBwYXJhbSBwcm9wZXJ0eVZhbHVlIFN0cmluZyByZXByZXNlbnRpbmcgdGhlIGNvbmZpZ3VyZWQgcHJvcGVydHkgdmFsdWVcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0XG4gKiBAcmV0dXJucyBBIGJpbmRpbmcgZXhwcmVzc2lvbiByZXByZXNlbnRpbmcgdGhlIHByb3BlcnR5XG4gKi9cbmZ1bmN0aW9uIGdldE1hbmlmZXN0QWN0aW9uQm9vbGVhblByb3BlcnR5V2l0aEZvcm1hdHRlcihcblx0cHJvcGVydHlWYWx1ZTogc3RyaW5nIHwgdW5kZWZpbmVkLFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0XG4pOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4gfCBib29sZWFuIHtcblx0Y29uc3QgcmVzb2x2ZWRCaW5kaW5nID0gcmVzb2x2ZUJpbmRpbmdTdHJpbmcocHJvcGVydHlWYWx1ZSBhcyBzdHJpbmcsIFwiYm9vbGVhblwiKTtcblx0bGV0IHJlc3VsdDogYW55O1xuXHRpZiAoaXNDb25zdGFudChyZXNvbHZlZEJpbmRpbmcpICYmIHJlc29sdmVkQmluZGluZy52YWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0Ly8gTm8gcHJvcGVydHkgdmFsdWUgY29uZmlndXJlZCBpbiBtYW5pZmVzdCBmb3IgdGhlIGN1c3RvbSBhY3Rpb24gLS0+IGRlZmF1bHQgdmFsdWUgaXMgdHJ1ZVxuXHRcdHJlc3VsdCA9IHRydWU7XG5cdH0gZWxzZSBpZiAoaXNDb25zdGFudChyZXNvbHZlZEJpbmRpbmcpICYmIHR5cGVvZiByZXNvbHZlZEJpbmRpbmcudmFsdWUgPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0Ly8gdHJ1ZSAvIGZhbHNlXG5cdFx0cmVzdWx0ID0gcmVzb2x2ZWRCaW5kaW5nLnZhbHVlO1xuXHR9IGVsc2UgaWYgKHJlc29sdmVkQmluZGluZy5fdHlwZSAhPT0gXCJFbWJlZGRlZEJpbmRpbmdcIiAmJiByZXNvbHZlZEJpbmRpbmcuX3R5cGUgIT09IFwiRW1iZWRkZWRFeHByZXNzaW9uQmluZGluZ1wiKSB7XG5cdFx0Ly8gVGhlbiBpdCdzIGEgbW9kdWxlLW1ldGhvZCByZWZlcmVuY2UgXCJzYXAueHh4Lnl5eS5kb1NvbWV0aGluZ1wiXG5cdFx0Y29uc3QgbWV0aG9kUGF0aCA9IHJlc29sdmVkQmluZGluZy52YWx1ZSBhcyBzdHJpbmc7XG5cdFx0Ly8gRklYTUU6IFRoZSBjdXN0b20gXCJpc0VuYWJsZWRcIiBjaGVjayBkb2VzIG5vdCB0cmlnZ2VyIChiZWNhdXNlIG5vbmUgb2YgdGhlIGJvdW5kIHZhbHVlcyBjaGFuZ2VzKVxuXHRcdHJlc3VsdCA9IGZvcm1hdFJlc3VsdChcblx0XHRcdFtwYXRoSW5Nb2RlbChcIi9cIiwgXCIkdmlld1wiKSwgbWV0aG9kUGF0aCwgcGF0aEluTW9kZWwoXCJzZWxlY3RlZENvbnRleHRzXCIsIFwiaW50ZXJuYWxcIildLFxuXHRcdFx0ZnBtRm9ybWF0dGVyLmN1c3RvbUJvb2xlYW5Qcm9wZXJ0eUNoZWNrIGFzIGFueSxcblx0XHRcdGNvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpLmNvbnRleHRMb2NhdGlvbj8udGFyZ2V0RW50aXR5VHlwZSB8fCBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKVxuXHRcdCk7XG5cdH0gZWxzZSB7XG5cdFx0Ly8gdGhlbiBpdCdzIGEgYmluZGluZ1xuXHRcdHJlc3VsdCA9IHJlc29sdmVkQmluZGluZztcblx0fVxuXG5cdHJldHVybiByZXN1bHQ7XG59XG5cbmV4cG9ydCBjb25zdCByZW1vdmVEdXBsaWNhdGVBY3Rpb25zID0gKGFjdGlvbnM6IEJhc2VBY3Rpb25bXSk6IEJhc2VBY3Rpb25bXSA9PiB7XG5cdGxldCBvTWVudUl0ZW1LZXlzOiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge307XG5cdGFjdGlvbnMuZm9yRWFjaCgoYWN0aW9uKSA9PiB7XG5cdFx0aWYgKGFjdGlvbj8ubWVudT8ubGVuZ3RoKSB7XG5cdFx0XHRvTWVudUl0ZW1LZXlzID0gYWN0aW9uLm1lbnUucmVkdWNlKChpdGVtLCB7IGtleSB9OiBhbnkpID0+IHtcblx0XHRcdFx0aWYgKGtleSAmJiAhaXRlbVtrZXldKSB7XG5cdFx0XHRcdFx0aXRlbVtrZXldID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gaXRlbTtcblx0XHRcdH0sIG9NZW51SXRlbUtleXMpO1xuXHRcdH1cblx0fSk7XG5cdHJldHVybiBhY3Rpb25zLmZpbHRlcigoYWN0aW9uKSA9PiAhb01lbnVJdGVtS2V5c1thY3Rpb24ua2V5XSk7XG59O1xuXG4vKipcbiAqIE1ldGhvZCB0byBkZXRlcm1pbmUgdGhlIHZhbHVlIG9mIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgYW4gYW5ub3RhdGlvbi1iYXNlZCBhY3Rpb24uXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dFxuICogQHBhcmFtIGFjdGlvblRhcmdldCBUaGUgaW5zdGFuY2Ugb2YgdGhlIGFjdGlvblxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICdlbmFibGVkJyBwcm9wZXJ0eSBvZiB0aGUgYWN0aW9uIGJ1dHRvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEVuYWJsZWRGb3JBbm5vdGF0aW9uQWN0aW9uKFxuXHRjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0LFxuXHRhY3Rpb25UYXJnZXQ6IEFjdGlvbiB8IHVuZGVmaW5lZFxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRpZiAoYWN0aW9uVGFyZ2V0Py5pc0JvdW5kICE9PSB0cnVlKSB7XG5cdFx0cmV0dXJuIFwidHJ1ZVwiO1xuXHR9XG5cdGlmIChhY3Rpb25UYXJnZXQ/LnBhcmFtZXRlcnM/Lmxlbmd0aCkge1xuXHRcdGNvbnN0IGJpbmRpbmdQYXJhbWV0ZXJGdWxsTmFtZSA9IGFjdGlvblRhcmdldD8ucGFyYW1ldGVyc1swXS5mdWxseVF1YWxpZmllZE5hbWUsXG5cdFx0XHRvcGVyYXRpb25BdmFpbGFibGVFeHByZXNzaW9uID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKFxuXHRcdFx0XHRhY3Rpb25UYXJnZXQ/LmFubm90YXRpb25zLkNvcmU/Lk9wZXJhdGlvbkF2YWlsYWJsZSxcblx0XHRcdFx0W10sXG5cdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0KHBhdGg6IHN0cmluZykgPT4gYmluZGluZ0NvbnRleHRQYXRoVmlzaXRvcihwYXRoLCBjb252ZXJ0ZXJDb250ZXh0LCBiaW5kaW5nUGFyYW1ldGVyRnVsbE5hbWUpXG5cdFx0XHQpO1xuXHRcdGlmIChhY3Rpb25UYXJnZXQ/LmFubm90YXRpb25zLkNvcmU/Lk9wZXJhdGlvbkF2YWlsYWJsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oZXF1YWwob3BlcmF0aW9uQXZhaWxhYmxlRXhwcmVzc2lvbiwgdHJ1ZSkpO1xuXHRcdH1cblx0fVxuXHRyZXR1cm4gXCJ0cnVlXCI7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTZW1hbnRpY09iamVjdE1hcHBpbmcoYU1hcHBpbmdzOiBhbnlbXSk6IGFueVtdIHtcblx0Y29uc3QgYVNlbWFudGljT2JqZWN0TWFwcGluZ3M6IGFueVtdID0gW107XG5cdGFNYXBwaW5ncy5mb3JFYWNoKChvTWFwcGluZykgPT4ge1xuXHRcdGNvbnN0IG9TT01hcHBpbmcgPSB7XG5cdFx0XHRcIkxvY2FsUHJvcGVydHlcIjoge1xuXHRcdFx0XHRcIiRQcm9wZXJ0eVBhdGhcIjogb01hcHBpbmcuTG9jYWxQcm9wZXJ0eS52YWx1ZVxuXHRcdFx0fSxcblx0XHRcdFwiU2VtYW50aWNPYmplY3RQcm9wZXJ0eVwiOiBvTWFwcGluZy5TZW1hbnRpY09iamVjdFByb3BlcnR5XG5cdFx0fTtcblx0XHRhU2VtYW50aWNPYmplY3RNYXBwaW5ncy5wdXNoKG9TT01hcHBpbmcpO1xuXHR9KTtcblx0cmV0dXJuIGFTZW1hbnRpY09iamVjdE1hcHBpbmdzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNBY3Rpb25OYXZpZ2FibGUoXG5cdGFjdGlvbjogTWFuaWZlc3RBY3Rpb24gfCBDdXN0b21EZWZpbmVkVGFibGVDb2x1bW5Gb3JPdmVycmlkZSxcblx0bmF2aWdhdGlvblNldHRpbmdzPzogTmF2aWdhdGlvblNldHRpbmdzQ29uZmlndXJhdGlvbixcblx0Y29uc2lkZXJOYXZpZ2F0aW9uU2V0dGluZ3M/OiBib29sZWFuXG4pOiBib29sZWFuIHtcblx0bGV0IGJJc05hdmlnYXRpb25Db25maWd1cmVkOiBib29sZWFuID0gdHJ1ZTtcblx0aWYgKGNvbnNpZGVyTmF2aWdhdGlvblNldHRpbmdzKSB7XG5cdFx0Y29uc3QgZGV0YWlsT3JEaXNwbGF5ID0gbmF2aWdhdGlvblNldHRpbmdzICYmIChuYXZpZ2F0aW9uU2V0dGluZ3MuZGV0YWlsIHx8IG5hdmlnYXRpb25TZXR0aW5ncy5kaXNwbGF5KTtcblx0XHRiSXNOYXZpZ2F0aW9uQ29uZmlndXJlZCA9IGRldGFpbE9yRGlzcGxheT8ucm91dGUgPyB0cnVlIDogZmFsc2U7XG5cdH1cblx0Ly8gd2hlbiBlbmFibGVBdXRvU2Nyb2xsIGlzIHRydWUgdGhlIG5hdmlnYXRlVG9JbnN0YW5jZSBmZWF0dXJlIGlzIGRpc2FibGVkXG5cdGlmIChcblx0XHQoYWN0aW9uICYmXG5cdFx0XHRhY3Rpb24uYWZ0ZXJFeGVjdXRpb24gJiZcblx0XHRcdChhY3Rpb24uYWZ0ZXJFeGVjdXRpb24/Lm5hdmlnYXRlVG9JbnN0YW5jZSA9PT0gZmFsc2UgfHwgYWN0aW9uLmFmdGVyRXhlY3V0aW9uPy5lbmFibGVBdXRvU2Nyb2xsID09PSB0cnVlKSkgfHxcblx0XHQhYklzTmF2aWdhdGlvbkNvbmZpZ3VyZWRcblx0KSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cdHJldHVybiB0cnVlO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5hYmxlQXV0b1Njcm9sbChhY3Rpb246IE1hbmlmZXN0QWN0aW9uKTogYm9vbGVhbiB7XG5cdHJldHVybiBhY3Rpb24/LmFmdGVyRXhlY3V0aW9uPy5lbmFibGVBdXRvU2Nyb2xsID09PSB0cnVlO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7TUE2QllBLFVBQVU7RUFBQSxXQUFWQSxVQUFVO0lBQVZBLFVBQVU7SUFBVkEs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