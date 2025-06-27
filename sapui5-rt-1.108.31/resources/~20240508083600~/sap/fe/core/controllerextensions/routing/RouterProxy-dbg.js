/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/Synchronization", "sap/ui/base/Object", "sap/ui/core/Core", "sap/ui/thirdparty/URI"], function (Log, ClassSupport, Synchronization, BaseObject, Core, URI) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  var enumState = {
    EQUAL: 0,
    COMPATIBLE: 1,
    ANCESTOR: 2,
    DIFFERENT: 3
  };
  var enumURLParams = {
    LAYOUTPARAM: "layout",
    IAPPSTATEPARAM: "sap-iapp-state"
  };

  /**
   * Creates a HashGuard object.
   *
   * @param sGuardHash The hash used for the guard
   * @returns The created hash guard
   */
  function createGuardFromHash(sGuardHash) {
    return {
      _guardHash: sGuardHash.replace(/\?[^\?]*$/, ""),
      // Remove query part
      check: function (sHash) {
        return sHash.indexOf(this._guardHash) === 0;
      }
    };
  }
  /**
   * Returns the iAppState part from a hash (or null if not found).
   *
   * @param sHash The hash
   * @returns The iAppState part of the hash
   */
  function findAppStateInHash(sHash) {
    var aAppState = sHash.match(new RegExp("\\?.*".concat(enumURLParams.IAPPSTATEPARAM, "=([^&]*)")));
    return aAppState && aAppState.length > 1 ? aAppState[1] : null;
  }
  /**
   * Returns a hash without its iAppState part.
   *
   * @param sHash The hash
   * @returns The hash without the iAppState
   */
  function removeAppStateInHash(sHash) {
    return sHash.replace(new RegExp("[&?]*".concat(enumURLParams.IAPPSTATEPARAM, "=[^&]*")), "");
  }
  /**
   * Adds an iAppState inside a hash (or replaces an existing one).
   *
   * @param sHash The hash
   * @param sAppStateKey The iAppState to add
   * @returns The hash with the app state
   */
  function setAppStateInHash(sHash, sAppStateKey) {
    var sNewHash;
    if (sHash.indexOf(enumURLParams.IAPPSTATEPARAM) >= 0) {
      // If there's already an iAppState parameter in the hash, replace it
      sNewHash = sHash.replace(new RegExp("".concat(enumURLParams.IAPPSTATEPARAM, "=[^&]*")), "".concat(enumURLParams.IAPPSTATEPARAM, "=").concat(sAppStateKey));
    } else {
      // Add the iAppState parameter in the hash
      if (sHash.indexOf("?") < 0) {
        sNewHash = "".concat(sHash, "?");
      } else {
        sNewHash = "".concat(sHash, "&");
      }
      sNewHash += "".concat(enumURLParams.IAPPSTATEPARAM, "=").concat(sAppStateKey);
    }
    return sNewHash;
  }
  var RouterProxy = (_dec = defineUI5Class("sap.fe.core.RouterProxy"), _dec(_class = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(RouterProxy, _BaseObject);
    function RouterProxy() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _BaseObject.call.apply(_BaseObject, [this].concat(args)) || this;
      _this.bIsRebuildHistoryRunning = false;
      _this.bIsComputingTitleHierachy = false;
      _this.bIsGuardCrossAllowed = false;
      _this.sIAppStateKey = null;
      _this._bActivateRouteMatchSynchro = false;
      _this._bApplyRestore = false;
      _this._bDelayedRebuild = false;
      _this._pathMappings = [];
      return _this;
    }
    var _proto = RouterProxy.prototype;
    _proto.init = function init(oAppComponent, isfclEnabled) {
      var _this2 = this;
      // Save the name of the app (including startup parameters) for rebuilding full hashes later
      oAppComponent.getService("shellServices").then(function () {
        _this2._oShellServices = oAppComponent.getShellServices();
        _this2.initRaw(oAppComponent.getRouter());
        // We want to wait until the initial routeMatched is done before doing any navigation
        _this2.waitForRouteMatchBeforeNavigation();

        // Set feLevel=0 for the first Application page in the history
        history.replaceState(Object.assign({
          feLevel: 0
        }, history.state), "", window.location);
        _this2.fclEnabled = isfclEnabled;
        _this2._fnBlockingNavFilter = _this2._blockingNavigationFilter.bind(_this2);
        _this2._oShellServices.registerNavigationFilter(_this2._fnBlockingNavFilter);
      }).catch(function (oError) {
        Log.error("Cannot retrieve the shell services", oError);
      });
      this._fnHashGuard = this.hashGuard.bind(this);
      window.addEventListener("popstate", this._fnHashGuard);
      this._bDisableOnHashChange = false;
      this._bIgnoreRestore = false;
      this._bForceFocus = true; // Trigger the focus mechanism for the first view displayed by the app
    };
    _proto.destroy = function destroy() {
      if (this._oShellServices) {
        this._oShellServices.unregisterNavigationFilter(this._fnBlockingNavFilter);
      }
      window.removeEventListener("popstate", this._fnHashGuard);
    }

    /**
     * Raw initialization (for unit tests).
     *
     * @param oRouter The router used by this proxy
     */;
    _proto.initRaw = function initRaw(oRouter) {
      this._oRouter = oRouter;
      this._oManagedHistory = [];
      this._oNavigationGuard = null;
      var sCurrentAppHash = this.getHash();
      this._oManagedHistory.push(this._extractStateFromHash(sCurrentAppHash));

      // Set the iAppState if the initial hash contains one
      this.sIAppStateKey = findAppStateInHash(sCurrentAppHash);
    };
    _proto.getHash = function getHash() {
      return this._oRouter.getHashChanger().getHash();
    };
    _proto.isFocusForced = function isFocusForced() {
      return this._bForceFocus;
    };
    _proto.setFocusForced = function setFocusForced(bForced) {
      this._bForceFocus = bForced;
    }

    /**
     * Resets the internal variable sIAppStateKey.
     *
     * @function
     * @name sap.fe.core.RouterProxy#removeIAppStateKey
     * @ui5-restricted
     */;
    _proto.removeIAppStateKey = function removeIAppStateKey() {
      this.sIAppStateKey = null;
    }

    /**
     * Navigates to a specific hash.
     *
     * @function
     * @name sap.fe.core.RouterProxy#navToHash
     * @memberof sap.fe.core.RouterProxy
     * @static
     * @param sHash Hash to be navigated to
     * @param bPreserveHistory If set to true, non-ancestor entries in history will be retained
     * @param bDisablePreservationCache If set to true, cache preservation mechanism is disabled for the current navigation
     * @param bForceFocus If set to true, the logic to set the focus once the navigation is finalized will be triggered (onPageReady)
     * @param bPreserveShellBackNavigationHandler If not set to false, the back navigation is set to undefined
     * @returns Promise (resolved when the navigation is finalized) that returns 'true' if a navigation took place, 'false' if the navigation didn't happen
     * @ui5-restricted
     */;
    _proto.navToHash = function navToHash(sHash, bPreserveHistory, bDisablePreservationCache, bForceFocus, bPreserveShellBackNavigationHandler) {
      var _this3 = this;
      if (bPreserveShellBackNavigationHandler !== false) {
        this._oShellServices.setBackNavigation();
      }
      if (this._oRouteMatchSynchronization) {
        return this._oRouteMatchSynchronization.waitFor().then(function () {
          _this3._oRouteMatchSynchronization = undefined;
          return _this3._internalNavToHash(sHash, bPreserveHistory, bDisablePreservationCache, bForceFocus);
        });
      } else {
        if (this._bActivateRouteMatchSynchro) {
          this.waitForRouteMatchBeforeNavigation();
        }
        return this._internalNavToHash(sHash, bPreserveHistory, bDisablePreservationCache, bForceFocus);
      }
    };
    _proto._internalNavToHash = function _internalNavToHash(sHash, bPreserveHistory, bDisablePreservationCache, bForceFocus) {
      // Add the app state in the hash if needed
      if (this.fclEnabled && this.sIAppStateKey && !findAppStateInHash(sHash)) {
        sHash = setAppStateInHash(sHash, this.sIAppStateKey);
      }
      if (!this.checkHashWithGuard(sHash)) {
        if (!this.oResourceBundle) {
          this.oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
        }

        // We have to use a confirm here for UI consistency reasons, as with some scenarios
        // in the EditFlow we rely on a UI5 mechanism that displays a confirm dialog.
        // eslint-disable-next-line no-alert
        if (!confirm(this.oResourceBundle.getText("C_ROUTER_PROXY_SAPFE_EXIT_NOTSAVED_MESSAGE"))) {
          // The user clicked on Cancel --> cancel navigation
          return Promise.resolve(false);
        }
        this.bIsGuardCrossAllowed = true;
      }

      // In case the navigation will cause a new view to be displayed, we force the focus
      // I.e. if the keys for the hash we're navigating to is a superset of the current hash keys.
      var oNewState = this._extractStateFromHash(sHash);
      if (!this._bForceFocus) {
        // If the focus was already forced, keep it
        var aCurrentHashKeys = this._extractEntitySetsFromHash(this.getHash());
        this._bForceFocus = bForceFocus || aCurrentHashKeys.length < oNewState.keys.length && aCurrentHashKeys.every(function (key, index) {
          return key === oNewState.keys[index];
        });
      }
      var oHistoryAction = this._pushNewState(oNewState, false, bPreserveHistory, bDisablePreservationCache);
      return this._rebuildBrowserHistory(oHistoryAction, false);
    }

    /**
     * Clears browser history if entries have been added without using the RouterProxy.
     * Updates the internal history accordingly.
     *
     * @returns Promise that is resolved once the history is rebuilt
     */;
    _proto.restoreHistory = function restoreHistory() {
      if (this._bApplyRestore) {
        this._bApplyRestore = false;
        var sTargetHash = this.getHash();
        sTargetHash = sTargetHash.replace(/(\?|&)restoreHistory=true/, "");
        var oNewState = this._extractStateFromHash(sTargetHash);
        var oHistoryAction = this._pushNewState(oNewState, true, false, true);
        return this._rebuildBrowserHistory(oHistoryAction, true);
      } else {
        return Promise.resolve();
      }
    }

    /**
     * Navigates back in the history.
     *
     * @returns Promise that is resolved when the navigation is finalized
     */;
    _proto.navBack = function navBack() {
      var sCurrentHash = this.getHash();
      var sPreviousHash;

      // Look for the current hash in the managed history
      for (var i = this._oManagedHistory.length - 1; i > 0; i--) {
        if (this._oManagedHistory[i].hash === sCurrentHash) {
          sPreviousHash = this._oManagedHistory[i - 1].hash;
          break;
        }
      }
      if (sPreviousHash) {
        return this.navToHash(sPreviousHash);
      } else {
        // We couldn't find a previous hash in history
        // This can happen when navigating from a transient hash in a create app, and
        // in that case history.back would go back to the FLP
        window.history.back();
        return Promise.resolve();
      }
    }

    /**
     * Navigates to a route with parameters.
     *
     * @param sRouteName The route name to be navigated to
     * @param oParameters Parameters for the navigation
     * @returns Promise that is resolved when the navigation is finalized
     * @ui5-restricted
     */;
    _proto.navTo = function navTo(sRouteName, oParameters) {
      var sHash = this._oRouter.getURL(sRouteName, oParameters);
      return this.navToHash(sHash, false, oParameters.noPreservationCache, false, !oParameters.bIsStickyMode);
    }

    /**
     * Exits the current app by navigating back
     * to the previous app (if any) or the FLP.
     *
     * @returns Promise that is resolved when we exit the app
     */;
    _proto.exitFromApp = function exitFromApp() {
      return this._oShellServices.backToPreviousApp();
    }

    /**
     * Checks whether a given hash can have an impact on the current state
     * i.e. if the hash is equal, compatible or an ancestor of the current state.
     *
     * @param sHash `true` if there is an impact
     * @returns If there is an impact
     */;
    _proto.isCurrentStateImpactedBy = function isCurrentStateImpactedBy(sHash) {
      if (sHash[0] === "/") {
        sHash = sHash.substring(1);
      }
      var oLocalGuard = createGuardFromHash(sHash);
      return oLocalGuard.check(this.getHash());
    }

    /**
     * Checks if a navigation is currently being processed.
     *
     * @returns `false` if a navigation has been triggered in the RouterProxy and is not yet finalized
     */;
    _proto.isNavigationFinalized = function isNavigationFinalized() {
      return !this.bIsRebuildHistoryRunning && !this._bDelayedRebuild;
    }

    /**
     * Sets the last state as a guard.
     * Each future navigation will be checked against this guard, and a confirmation dialog will
     * be displayed before the navigation crosses the guard (i.e. goes to an ancestor of the guard).
     *
     * @param sHash The hash for the guard
     */;
    _proto.setNavigationGuard = function setNavigationGuard(sHash) {
      this._oNavigationGuard = createGuardFromHash(sHash);
      this.bIsGuardCrossAllowed = false;
    }

    /**
     * Disables the navigation guard.
     */;
    _proto.discardNavigationGuard = function discardNavigationGuard() {
      this._oNavigationGuard = null;
    }

    /**
     * Checks for the availability of the navigation guard.
     *
     * @returns `true` if navigating guard is available
     */;
    _proto.hasNavigationGuard = function hasNavigationGuard() {
      return this._oNavigationGuard !== null;
    }

    /**
     * Tests a hash against the navigation guard.
     *
     * @param sHash The hash to be tested
     * @returns `true` if navigating to the hash doesn't cross the guard
     */;
    _proto.checkHashWithGuard = function checkHashWithGuard(sHash) {
      return this._oNavigationGuard === null || this._oNavigationGuard.check(sHash);
    }

    /**
     * Checks if the user allowed the navigation guard to be crossed.
     *
     * @returns `true` if crossing the guard has been allowed by the user
     */;
    _proto.isGuardCrossAllowedByUser = function isGuardCrossAllowedByUser() {
      return this.bIsGuardCrossAllowed;
    }

    /**
     * Activates the synchronization for routeMatchedEvent.
     * The next NavToHash call will create a Synchronization object that will be resolved
     * by the corresponding onRouteMatched event, preventing another NavToHash to happen in parallel.
     */;
    _proto.activateRouteMatchSynchronization = function activateRouteMatchSynchronization() {
      this._bActivateRouteMatchSynchro = true;
    }

    /**
     * Resolve the routeMatch synchronization object, unlocking potential pending NavToHash calls.
     */;
    _proto.resolveRouteMatch = function resolveRouteMatch() {
      if (this._oRouteMatchSynchronization) {
        this._oRouteMatchSynchronization.resolve();
      }
    }

    /**
     * Makes sure no navigation can happen before a routeMatch happened.
     */;
    _proto.waitForRouteMatchBeforeNavigation = function waitForRouteMatchBeforeNavigation() {
      this._oRouteMatchSynchronization = new Synchronization();
      this._bActivateRouteMatchSynchro = false;
    };
    _proto._extractEntitySetsFromHash = function _extractEntitySetsFromHash(sHash) {
      if (sHash === undefined) {
        sHash = "";
      }
      var sHashNoParams = sHash.split("?")[0]; // remove params
      var aTokens = sHashNoParams.split("/");
      var names = [];
      aTokens.forEach(function (sToken) {
        if (sToken.length) {
          names.push(sToken.split("(")[0]);
        }
      });
      return names;
    }

    /**
     * Builds a state from a hash.
     *
     * @param sHash The hash to be used as entry
     * @returns The state
     * @ui5-restricted
     */;
    _proto._extractStateFromHash = function _extractStateFromHash(sHash) {
      if (sHash === undefined) {
        sHash = "";
      }
      var oState = {
        keys: this._extractEntitySetsFromHash(sHash)
      };

      // Retrieve layout (if any)
      var aLayout = sHash.match(new RegExp("\\?.*".concat(enumURLParams.LAYOUTPARAM, "=([^&]*)")));
      oState.sLayout = aLayout && aLayout.length > 1 ? aLayout[1] : null;
      if (oState.sLayout === "MidColumnFullScreen") {
        oState.screenMode = 1;
      } else if (oState.sLayout === "EndColumnFullScreen") {
        oState.screenMode = 2;
      } else {
        oState.screenMode = 0;
      }
      oState.hash = sHash;
      return oState;
    }

    /**
     * Adds a new state into the internal history structure.
     * Makes sure this new state is added after an ancestor.
     * Also sets the iAppState key in the whole history.
     *
     * @memberof sap.fe.core.RouterProxy
     * @param oNewState The new state to be added
     * @param bRebuildOnly `true` if we're rebuilding the history after a shell menu navigation
     * @param bPreserveHistory If set to true, non-ancestor entries in history will be retained
     * @param bDisableHistoryPreservation Disable the mechanism to retained marked entries in cache
     * @returns The new state
     * @ui5-restricted
     * @final
     */;
    _proto._pushNewState = function _pushNewState(oNewState, bRebuildOnly, bPreserveHistory, bDisableHistoryPreservation) {
      var sCurrentHash = this.getHash();
      var lastIndex = this._oManagedHistory.length - 1;
      var iPopCount = bRebuildOnly ? 1 : 0;

      // 1. Do some cleanup in the managed history : in case the user has navigated back in the browser history, we need to remove
      // the states ahead in history and make sure the top state corresponds to the current page
      // We don't do that when restoring the history, as the current state has been added on top of the browser history
      // and is not reflected in the managed history
      if (!bRebuildOnly) {
        while (lastIndex >= 0 && this._oManagedHistory[lastIndex].hash !== sCurrentHash) {
          this._oManagedHistory.pop();
          lastIndex--;
        }
        if (this._oManagedHistory.length === 0) {
          // We couldn't find the current location in the history. This can happen if a browser reload
          // happened, causing a reinitialization of the managed history.
          // In that case, we use the current location as the new starting point in the managed history
          this._oManagedHistory.push(this._extractStateFromHash(sCurrentHash));
          history.replaceState(Object.assign({
            feLevel: 0
          }, history.state), "");
        }
      }

      // 2. Mark the top state as preserved if required
      if (bPreserveHistory && !bDisableHistoryPreservation) {
        this._oManagedHistory[this._oManagedHistory.length - 1].preserved = true;
      }

      // 3. Then pop all states until we find an ancestor of the new state, or we find a state that need to be preserved
      var oLastRemovedItem;
      while (this._oManagedHistory.length > 0) {
        var oTopState = this._oManagedHistory[this._oManagedHistory.length - 1];
        if ((bDisableHistoryPreservation || !oTopState.preserved) && this._compareCacheStates(oTopState, oNewState) !== enumState.ANCESTOR) {
          // The top state is not an ancestor of oNewState and is not preserved --> we can pop it
          oLastRemovedItem = this._oManagedHistory.pop();
          iPopCount++;
        } else if (oTopState.preserved && removeAppStateInHash(oTopState.hash) === removeAppStateInHash(oNewState.hash)) {
          // We try to add a state that is already in cache (due to preserved flag) but with a different iapp-state
          // --> we should delete the previous entry (it will be later replaced by the new one) and stop popping
          oLastRemovedItem = this._oManagedHistory.pop();
          iPopCount++;
          oNewState.preserved = true;
          break;
        } else {
          break; // Ancestor or preserved state found --> we stop popping out states
        }
      }

      // 4. iAppState management
      this.sIAppStateKey = findAppStateInHash(oNewState.hash);
      if (!this.fclEnabled && oLastRemovedItem) {
        var sPreviousIAppStateKey = findAppStateInHash(oLastRemovedItem.hash);
        var oComparisonStateResult = this._compareCacheStates(oLastRemovedItem, oNewState);
        // if current state doesn't contain a i-appstate and this state should replace a state containing a iAppState
        // then the previous iAppState is preserved
        if (!this.sIAppStateKey && sPreviousIAppStateKey && (oComparisonStateResult === enumState.EQUAL || oComparisonStateResult === enumState.COMPATIBLE)) {
          oNewState.hash = setAppStateInHash(oNewState.hash, sPreviousIAppStateKey);
        }
      }

      // 5. Now we can push the state at the top of the internal history
      var bHasSameHash = oLastRemovedItem && oNewState.hash === oLastRemovedItem.hash;
      if (this._oManagedHistory.length === 0 || this._oManagedHistory[this._oManagedHistory.length - 1].hash !== oNewState.hash) {
        this._oManagedHistory.push(oNewState);
      }

      // 6. Determine which actions to do on the history
      if (iPopCount === 0) {
        // No state was popped --> append
        return {
          type: "append"
        };
      } else if (iPopCount === 1) {
        // Only 1 state was popped --> replace current hash unless hash is the same (then nothing to do)
        return bHasSameHash ? {
          type: "none"
        } : {
          type: "replace"
        };
      } else {
        // More than 1 state was popped --> go bakc in history and replace hash if necessary
        return bHasSameHash ? {
          type: "back",
          steps: iPopCount - 1
        } : {
          type: "back-replace",
          steps: iPopCount - 1
        };
      }
    };
    _proto._blockingNavigationFilter = function _blockingNavigationFilter() {
      return this._bDisableOnHashChange ? "Custom" : "Continue";
    }

    /**
     * Disable the routing by calling the router stop method.
     *
     * @function
     * @memberof sap.fe.core.RouterProxy
     * @ui5-restricted
     * @final
     */;
    _proto._disableEventOnHashChange = function _disableEventOnHashChange() {
      this._bDisableOnHashChange = true;
      this._oRouter.stop();
    }

    /**
     * Enable the routing by calling the router initialize method.
     *
     * @function
     * @name sap.fe.core.RouterProxy#_enableEventOnHashChange
     * @memberof sap.fe.core.RouterProxy
     * @param [bIgnoreCurrentHash] Ignore the last hash event triggered before the router has initialized
     * @ui5-restricted
     * @final
     */;
    _proto._enableEventOnHashChange = function _enableEventOnHashChange(bIgnoreCurrentHash) {
      this._bDisableOnHashChange = false;
      this._oRouter.initialize(bIgnoreCurrentHash);
    }

    /**
     * Synchronizes the browser history with the internal history of the routerProxy, and triggers a navigation if needed.
     *
     * @memberof sap.fe.core.RouterProxy
     * @param oHistoryAction Specifies the navigation action to be performed
     * @param bRebuildOnly `true` if internal history is currently being rebuilt
     * @returns Promise (resolved when the navigation is finalized) that returns 'true' if a navigation took place, 'false' if the navigation didn't happen
     * @ui5-restricted
     * @final
     */;
    _proto._rebuildBrowserHistory = function _rebuildBrowserHistory(oHistoryAction, bRebuildOnly) {
      var _this4 = this;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = this;
      return new Promise(function (resolve) {
        _this4.bIsRebuildHistoryRunning = true;
        var oTargetState = _this4._oManagedHistory[_this4._oManagedHistory.length - 1],
          newLevel = _this4._oManagedHistory.length - 1;
        function replaceAsync() {
          if (!bRebuildOnly) {
            that._enableEventOnHashChange(true);
          }
          that._oRouter.getHashChanger().replaceHash(oTargetState.hash);
          history.replaceState(Object.assign({
            feLevel: newLevel
          }, history.state), "");
          if (bRebuildOnly) {
            setTimeout(function () {
              // Timeout to let 'hashchange' event be processed before by the HashChanger, so that
              // onRouteMatched notification isn't raised
              that._enableEventOnHashChange(true);
            }, 0);
          }
          that.bIsRebuildHistoryRunning = false;
          resolve(true); // a navigation occurred
        }

        // Async callbacks when navigating back, in order to let all notifications and events get processed
        function backReplaceAsync() {
          window.removeEventListener("popstate", backReplaceAsync);
          setTimeout(function () {
            // Timeout to let 'hashchange' event be processed before by the HashChanger
            replaceAsync();
          }, 0);
        }
        function backAsync() {
          window.removeEventListener("popstate", backAsync);
          that.bIsRebuildHistoryRunning = false;
          resolve(true); // a navigation occurred
        }

        that._bIgnoreRestore = true;
        switch (oHistoryAction.type) {
          case "replace":
            that._oRouter.getHashChanger().replaceHash(oTargetState.hash);
            history.replaceState(Object.assign({
              feLevel: newLevel
            }, history.state), "");
            that.bIsRebuildHistoryRunning = false;
            resolve(true); // a navigation occurred
            break;
          case "append":
            that._oRouter.getHashChanger().setHash(oTargetState.hash);
            history.replaceState(Object.assign({
              feLevel: newLevel
            }, history.state), "");
            that.bIsRebuildHistoryRunning = false;
            resolve(true); // a navigation occurred
            break;
          case "back":
            window.addEventListener("popstate", backAsync);
            history.go(-oHistoryAction.steps);
            break;
          case "back-replace":
            _this4._disableEventOnHashChange();
            window.addEventListener("popstate", backReplaceAsync);
            history.go(-oHistoryAction.steps);
            break;
          default:
            // No navigation
            _this4.bIsRebuildHistoryRunning = false;
            resolve(false);
          // no navigation --> resolve to false
        }
      });
    };
    _proto.getLastHistoryEntry = function getLastHistoryEntry() {
      return this._oManagedHistory[this._oManagedHistory.length - 1];
    };
    _proto.setPathMapping = function setPathMapping(mappings) {
      this._pathMappings = mappings.filter(function (mapping) {
        return mapping.oldPath !== mapping.newPath;
      });
    };
    _proto.hashGuard = function hashGuard() {
      var _this5 = this;
      var sHash = window.location.hash;
      if (sHash.indexOf("restoreHistory=true") !== -1) {
        this._bApplyRestore = true;
      } else if (!this.bIsRebuildHistoryRunning) {
        // Check if the hash needs to be changed (this happens in FCL when switching b/w edit and read-only with 3 columns open)
        var mapping = this._pathMappings.find(function (m) {
          return sHash.indexOf(m.oldPath) >= 0;
        });
        if (mapping) {
          // Replace the current hash
          sHash = sHash.replace(mapping.oldPath, mapping.newPath);
          history.replaceState(Object.assign({}, history.state), "", sHash);
        } else {
          var aHashSplit = sHash.split("&/");
          var sAppHash = aHashSplit[1] ? aHashSplit[1] : "";
          if (this.checkHashWithGuard(sAppHash)) {
            this._bDelayedRebuild = true;
            var oNewState = this._extractStateFromHash(sAppHash);
            this._pushNewState(oNewState, false, false, true);
            setTimeout(function () {
              _this5._bDelayedRebuild = false;
            }, 0);
          }
        }
      }
    }

    /**
     * Compares 2 states.
     *
     * @param {object} oState1
     * @param {object} oState2
     * @returns {number} The result of the comparison:
     *        - enumState.EQUAL if oState1 and oState2 are equal
     *        - enumState.COMPATIBLE if oState1 and oState2 are compatible
     *        - enumState.ANCESTOR if oState1 is an ancestor of oState2
     *        - enumState.DIFFERENT if the 2 states are different
     */;
    _proto._compareCacheStates = function _compareCacheStates(oState1, oState2) {
      // First compare object keys
      if (oState1.keys.length > oState2.keys.length) {
        return enumState.DIFFERENT;
      }
      var equal = true;
      var index;
      for (index = 0; equal && index < oState1.keys.length; index++) {
        if (oState1.keys[index] !== oState2.keys[index]) {
          equal = false;
        }
      }
      if (!equal) {
        // Some objects keys are different
        return enumState.DIFFERENT;
      }

      // All keys from oState1 are in oState2 --> check if ancestor
      if (oState1.keys.length < oState2.keys.length || oState1.screenMode < oState2.screenMode) {
        return enumState.ANCESTOR;
      }
      if (oState1.screenMode > oState2.screenMode) {
        return enumState.DIFFERENT; // Not sure this case can happen...
      }

      // At this stage, the 2 states have the same object keys (in the same order) and same screenmode
      // They can be either compatible or equal
      return oState1.sLayout === oState2.sLayout ? enumState.EQUAL : enumState.COMPATIBLE;
    }

    /**
     * Checks if back exits the present guard set.
     *
     * @param sPresentHash The current hash. Only used for unit tests.
     * @returns `true` if back exits there is a guard exit on back
     */;
    _proto.checkIfBackIsOutOfGuard = function checkIfBackIsOutOfGuard(sPresentHash) {
      var sPrevHash;
      var sCurrentHash;
      if (sPresentHash === undefined) {
        // We use window.location.hash instead of HashChanger.getInstance().getHash() because the latter
        // replaces characters in the URL (e.g. %24 replaced by $) and it causes issues when comparing
        // with the URLs in the managed history
        var oSplitHash = this._oShellServices.splitHash(window.location.hash);
        if (oSplitHash && oSplitHash.appSpecificRoute) {
          sCurrentHash = oSplitHash.appSpecificRoute;
          if (sCurrentHash.indexOf("&/") === 0) {
            sCurrentHash = sCurrentHash.substring(2);
          }
        } else {
          sCurrentHash = window.location.hash.substring(1); // To remove the '#'
          if (sCurrentHash[0] === "/") {
            sCurrentHash = sCurrentHash.substring(1);
          }
        }
      } else {
        sCurrentHash = sPresentHash;
      }
      sPresentHash = URI.decode(sCurrentHash);
      if (this._oNavigationGuard) {
        for (var i = this._oManagedHistory.length - 1; i > 0; i--) {
          if (this._oManagedHistory[i].hash === sPresentHash) {
            sPrevHash = this._oManagedHistory[i - 1].hash;
            break;
          }
        }
        return !sPrevHash || !this.checkHashWithGuard(sPrevHash);
      }
      return false;
    }

    /**
     * Checks if the last 2 entries in the history share the same context.
     *
     * @returns `true` if they share the same context.
     */;
    _proto.checkIfBackHasSameContext = function checkIfBackHasSameContext() {
      if (this._oManagedHistory.length < 2) {
        return false;
      }
      var oCurrentState = this._oManagedHistory[this._oManagedHistory.length - 1];
      var oPreviousState = this._oManagedHistory[this._oManagedHistory.length - 2];
      return oCurrentState.hash.split("?")[0] === oPreviousState.hash.split("?")[0];
    };
    return RouterProxy;
  }(BaseObject)) || _class);
  return RouterProxy;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJlbnVtU3RhdGUiLCJFUVVBTCIsIkNPTVBBVElCTEUiLCJBTkNFU1RPUiIsIkRJRkZFUkVOVCIsImVudW1VUkxQYXJhbXMiLCJMQVlPVVRQQVJBTSIsIklBUFBTVEFURVBBUkFNIiwiY3JlYXRlR3VhcmRGcm9tSGFzaCIsInNHdWFyZEhhc2giLCJfZ3VhcmRIYXNoIiwicmVwbGFjZSIsImNoZWNrIiwic0hhc2giLCJpbmRleE9mIiwiZmluZEFwcFN0YXRlSW5IYXNoIiwiYUFwcFN0YXRlIiwibWF0Y2giLCJSZWdFeHAiLCJsZW5ndGgiLCJyZW1vdmVBcHBTdGF0ZUluSGFzaCIsInNldEFwcFN0YXRlSW5IYXNoIiwic0FwcFN0YXRlS2V5Iiwic05ld0hhc2giLCJSb3V0ZXJQcm94eSIsImRlZmluZVVJNUNsYXNzIiwiYklzUmVidWlsZEhpc3RvcnlSdW5uaW5nIiwiYklzQ29tcHV0aW5nVGl0bGVIaWVyYWNoeSIsImJJc0d1YXJkQ3Jvc3NBbGxvd2VkIiwic0lBcHBTdGF0ZUtleSIsIl9iQWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hybyIsIl9iQXBwbHlSZXN0b3JlIiwiX2JEZWxheWVkUmVidWlsZCIsIl9wYXRoTWFwcGluZ3MiLCJpbml0Iiwib0FwcENvbXBvbmVudCIsImlzZmNsRW5hYmxlZCIsImdldFNlcnZpY2UiLCJ0aGVuIiwiX29TaGVsbFNlcnZpY2VzIiwiZ2V0U2hlbGxTZXJ2aWNlcyIsImluaXRSYXciLCJnZXRSb3V0ZXIiLCJ3YWl0Rm9yUm91dGVNYXRjaEJlZm9yZU5hdmlnYXRpb24iLCJoaXN0b3J5IiwicmVwbGFjZVN0YXRlIiwiT2JqZWN0IiwiYXNzaWduIiwiZmVMZXZlbCIsInN0YXRlIiwid2luZG93IiwibG9jYXRpb24iLCJmY2xFbmFibGVkIiwiX2ZuQmxvY2tpbmdOYXZGaWx0ZXIiLCJfYmxvY2tpbmdOYXZpZ2F0aW9uRmlsdGVyIiwiYmluZCIsInJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlciIsImNhdGNoIiwib0Vycm9yIiwiTG9nIiwiZXJyb3IiLCJfZm5IYXNoR3VhcmQiLCJoYXNoR3VhcmQiLCJhZGRFdmVudExpc3RlbmVyIiwiX2JEaXNhYmxlT25IYXNoQ2hhbmdlIiwiX2JJZ25vcmVSZXN0b3JlIiwiX2JGb3JjZUZvY3VzIiwiZGVzdHJveSIsInVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyIiwicmVtb3ZlRXZlbnRMaXN0ZW5lciIsIm9Sb3V0ZXIiLCJfb1JvdXRlciIsIl9vTWFuYWdlZEhpc3RvcnkiLCJfb05hdmlnYXRpb25HdWFyZCIsInNDdXJyZW50QXBwSGFzaCIsImdldEhhc2giLCJwdXNoIiwiX2V4dHJhY3RTdGF0ZUZyb21IYXNoIiwiZ2V0SGFzaENoYW5nZXIiLCJpc0ZvY3VzRm9yY2VkIiwic2V0Rm9jdXNGb3JjZWQiLCJiRm9yY2VkIiwicmVtb3ZlSUFwcFN0YXRlS2V5IiwibmF2VG9IYXNoIiwiYlByZXNlcnZlSGlzdG9yeSIsImJEaXNhYmxlUHJlc2VydmF0aW9uQ2FjaGUiLCJiRm9yY2VGb2N1cyIsImJQcmVzZXJ2ZVNoZWxsQmFja05hdmlnYXRpb25IYW5kbGVyIiwic2V0QmFja05hdmlnYXRpb24iLCJfb1JvdXRlTWF0Y2hTeW5jaHJvbml6YXRpb24iLCJ3YWl0Rm9yIiwidW5kZWZpbmVkIiwiX2ludGVybmFsTmF2VG9IYXNoIiwiY2hlY2tIYXNoV2l0aEd1YXJkIiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImNvbmZpcm0iLCJnZXRUZXh0IiwiUHJvbWlzZSIsInJlc29sdmUiLCJvTmV3U3RhdGUiLCJhQ3VycmVudEhhc2hLZXlzIiwiX2V4dHJhY3RFbnRpdHlTZXRzRnJvbUhhc2giLCJrZXlzIiwiZXZlcnkiLCJrZXkiLCJpbmRleCIsIm9IaXN0b3J5QWN0aW9uIiwiX3B1c2hOZXdTdGF0ZSIsIl9yZWJ1aWxkQnJvd3Nlckhpc3RvcnkiLCJyZXN0b3JlSGlzdG9yeSIsInNUYXJnZXRIYXNoIiwibmF2QmFjayIsInNDdXJyZW50SGFzaCIsInNQcmV2aW91c0hhc2giLCJpIiwiaGFzaCIsImJhY2siLCJuYXZUbyIsInNSb3V0ZU5hbWUiLCJvUGFyYW1ldGVycyIsImdldFVSTCIsIm5vUHJlc2VydmF0aW9uQ2FjaGUiLCJiSXNTdGlja3lNb2RlIiwiZXhpdEZyb21BcHAiLCJiYWNrVG9QcmV2aW91c0FwcCIsImlzQ3VycmVudFN0YXRlSW1wYWN0ZWRCeSIsInN1YnN0cmluZyIsIm9Mb2NhbEd1YXJkIiwiaXNOYXZpZ2F0aW9uRmluYWxpemVkIiwic2V0TmF2aWdhdGlvbkd1YXJkIiwiZGlzY2FyZE5hdmlnYXRpb25HdWFyZCIsImhhc05hdmlnYXRpb25HdWFyZCIsImlzR3VhcmRDcm9zc0FsbG93ZWRCeVVzZXIiLCJhY3RpdmF0ZVJvdXRlTWF0Y2hTeW5jaHJvbml6YXRpb24iLCJyZXNvbHZlUm91dGVNYXRjaCIsIlN5bmNocm9uaXphdGlvbiIsInNIYXNoTm9QYXJhbXMiLCJzcGxpdCIsImFUb2tlbnMiLCJuYW1lcyIsImZvckVhY2giLCJzVG9rZW4iLCJvU3RhdGUiLCJhTGF5b3V0Iiwic0xheW91dCIsInNjcmVlbk1vZGUiLCJiUmVidWlsZE9ubHkiLCJiRGlzYWJsZUhpc3RvcnlQcmVzZXJ2YXRpb24iLCJsYXN0SW5kZXgiLCJpUG9wQ291bnQiLCJwb3AiLCJwcmVzZXJ2ZWQiLCJvTGFzdFJlbW92ZWRJdGVtIiwib1RvcFN0YXRlIiwiX2NvbXBhcmVDYWNoZVN0YXRlcyIsInNQcmV2aW91c0lBcHBTdGF0ZUtleSIsIm9Db21wYXJpc29uU3RhdGVSZXN1bHQiLCJiSGFzU2FtZUhhc2giLCJ0eXBlIiwic3RlcHMiLCJfZGlzYWJsZUV2ZW50T25IYXNoQ2hhbmdlIiwic3RvcCIsIl9lbmFibGVFdmVudE9uSGFzaENoYW5nZSIsImJJZ25vcmVDdXJyZW50SGFzaCIsImluaXRpYWxpemUiLCJ0aGF0Iiwib1RhcmdldFN0YXRlIiwibmV3TGV2ZWwiLCJyZXBsYWNlQXN5bmMiLCJyZXBsYWNlSGFzaCIsInNldFRpbWVvdXQiLCJiYWNrUmVwbGFjZUFzeW5jIiwiYmFja0FzeW5jIiwic2V0SGFzaCIsImdvIiwiZ2V0TGFzdEhpc3RvcnlFbnRyeSIsInNldFBhdGhNYXBwaW5nIiwibWFwcGluZ3MiLCJmaWx0ZXIiLCJtYXBwaW5nIiwib2xkUGF0aCIsIm5ld1BhdGgiLCJmaW5kIiwibSIsImFIYXNoU3BsaXQiLCJzQXBwSGFzaCIsIm9TdGF0ZTEiLCJvU3RhdGUyIiwiZXF1YWwiLCJjaGVja0lmQmFja0lzT3V0T2ZHdWFyZCIsInNQcmVzZW50SGFzaCIsInNQcmV2SGFzaCIsIm9TcGxpdEhhc2giLCJzcGxpdEhhc2giLCJhcHBTcGVjaWZpY1JvdXRlIiwiVVJJIiwiZGVjb2RlIiwiY2hlY2tJZkJhY2tIYXNTYW1lQ29udGV4dCIsIm9DdXJyZW50U3RhdGUiLCJvUHJldmlvdXNTdGF0ZSIsIkJhc2VPYmplY3QiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlJvdXRlclByb3h5LnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIFJlc291cmNlQnVuZGxlIGZyb20gXCJzYXAvYmFzZS9pMThuL1Jlc291cmNlQnVuZGxlXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgU3luY2hyb25pemF0aW9uIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N5bmNocm9uaXphdGlvblwiO1xuaW1wb3J0IHR5cGUgeyBJU2hlbGxTZXJ2aWNlcyB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaGVsbFNlcnZpY2VzRmFjdG9yeVwiO1xuaW1wb3J0IEJhc2VPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL09iamVjdFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB0eXBlIFJvdXRlciBmcm9tIFwic2FwL3VpL2NvcmUvcm91dGluZy9Sb3V0ZXJcIjtcbmltcG9ydCBVUkkgZnJvbSBcInNhcC91aS90aGlyZHBhcnR5L1VSSVwiO1xuXG5jb25zdCBlbnVtU3RhdGUgPSB7XG5cdEVRVUFMOiAwLFxuXHRDT01QQVRJQkxFOiAxLFxuXHRBTkNFU1RPUjogMixcblx0RElGRkVSRU5UOiAzXG59O1xuY29uc3QgZW51bVVSTFBhcmFtcyA9IHtcblx0TEFZT1VUUEFSQU06IFwibGF5b3V0XCIsXG5cdElBUFBTVEFURVBBUkFNOiBcInNhcC1pYXBwLXN0YXRlXCJcbn07XG5cbi8qKlxuICogQ3JlYXRlcyBhIEhhc2hHdWFyZCBvYmplY3QuXG4gKlxuICogQHBhcmFtIHNHdWFyZEhhc2ggVGhlIGhhc2ggdXNlZCBmb3IgdGhlIGd1YXJkXG4gKiBAcmV0dXJucyBUaGUgY3JlYXRlZCBoYXNoIGd1YXJkXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUd1YXJkRnJvbUhhc2goc0d1YXJkSGFzaDogc3RyaW5nKSB7XG5cdHJldHVybiB7XG5cdFx0X2d1YXJkSGFzaDogc0d1YXJkSGFzaC5yZXBsYWNlKC9cXD9bXlxcP10qJC8sIFwiXCIpLCAvLyBSZW1vdmUgcXVlcnkgcGFydFxuXHRcdGNoZWNrOiBmdW5jdGlvbiAoc0hhc2g6IGFueSkge1xuXHRcdFx0cmV0dXJuIHNIYXNoLmluZGV4T2YodGhpcy5fZ3VhcmRIYXNoKSA9PT0gMDtcblx0XHR9XG5cdH07XG59XG4vKipcbiAqIFJldHVybnMgdGhlIGlBcHBTdGF0ZSBwYXJ0IGZyb20gYSBoYXNoIChvciBudWxsIGlmIG5vdCBmb3VuZCkuXG4gKlxuICogQHBhcmFtIHNIYXNoIFRoZSBoYXNoXG4gKiBAcmV0dXJucyBUaGUgaUFwcFN0YXRlIHBhcnQgb2YgdGhlIGhhc2hcbiAqL1xuZnVuY3Rpb24gZmluZEFwcFN0YXRlSW5IYXNoKHNIYXNoOiBzdHJpbmcpOiBzdHJpbmcgfCBudWxsIHtcblx0Y29uc3QgYUFwcFN0YXRlID0gc0hhc2gubWF0Y2gobmV3IFJlZ0V4cChgXFxcXD8uKiR7ZW51bVVSTFBhcmFtcy5JQVBQU1RBVEVQQVJBTX09KFteJl0qKWApKTtcblx0cmV0dXJuIGFBcHBTdGF0ZSAmJiBhQXBwU3RhdGUubGVuZ3RoID4gMSA/IGFBcHBTdGF0ZVsxXSA6IG51bGw7XG59XG4vKipcbiAqIFJldHVybnMgYSBoYXNoIHdpdGhvdXQgaXRzIGlBcHBTdGF0ZSBwYXJ0LlxuICpcbiAqIEBwYXJhbSBzSGFzaCBUaGUgaGFzaFxuICogQHJldHVybnMgVGhlIGhhc2ggd2l0aG91dCB0aGUgaUFwcFN0YXRlXG4gKi9cbmZ1bmN0aW9uIHJlbW92ZUFwcFN0YXRlSW5IYXNoKHNIYXNoOiBzdHJpbmcpIHtcblx0cmV0dXJuIHNIYXNoLnJlcGxhY2UobmV3IFJlZ0V4cChgWyY/XSoke2VudW1VUkxQYXJhbXMuSUFQUFNUQVRFUEFSQU19PVteJl0qYCksIFwiXCIpO1xufVxuLyoqXG4gKiBBZGRzIGFuIGlBcHBTdGF0ZSBpbnNpZGUgYSBoYXNoIChvciByZXBsYWNlcyBhbiBleGlzdGluZyBvbmUpLlxuICpcbiAqIEBwYXJhbSBzSGFzaCBUaGUgaGFzaFxuICogQHBhcmFtIHNBcHBTdGF0ZUtleSBUaGUgaUFwcFN0YXRlIHRvIGFkZFxuICogQHJldHVybnMgVGhlIGhhc2ggd2l0aCB0aGUgYXBwIHN0YXRlXG4gKi9cbmZ1bmN0aW9uIHNldEFwcFN0YXRlSW5IYXNoKHNIYXNoOiBhbnksIHNBcHBTdGF0ZUtleTogYW55KSB7XG5cdGxldCBzTmV3SGFzaDtcblxuXHRpZiAoc0hhc2guaW5kZXhPZihlbnVtVVJMUGFyYW1zLklBUFBTVEFURVBBUkFNKSA+PSAwKSB7XG5cdFx0Ly8gSWYgdGhlcmUncyBhbHJlYWR5IGFuIGlBcHBTdGF0ZSBwYXJhbWV0ZXIgaW4gdGhlIGhhc2gsIHJlcGxhY2UgaXRcblx0XHRzTmV3SGFzaCA9IHNIYXNoLnJlcGxhY2UobmV3IFJlZ0V4cChgJHtlbnVtVVJMUGFyYW1zLklBUFBTVEFURVBBUkFNfT1bXiZdKmApLCBgJHtlbnVtVVJMUGFyYW1zLklBUFBTVEFURVBBUkFNfT0ke3NBcHBTdGF0ZUtleX1gKTtcblx0fSBlbHNlIHtcblx0XHQvLyBBZGQgdGhlIGlBcHBTdGF0ZSBwYXJhbWV0ZXIgaW4gdGhlIGhhc2hcblx0XHRpZiAoc0hhc2guaW5kZXhPZihcIj9cIikgPCAwKSB7XG5cdFx0XHRzTmV3SGFzaCA9IGAke3NIYXNofT9gO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzTmV3SGFzaCA9IGAke3NIYXNofSZgO1xuXHRcdH1cblx0XHRzTmV3SGFzaCArPSBgJHtlbnVtVVJMUGFyYW1zLklBUFBTVEFURVBBUkFNfT0ke3NBcHBTdGF0ZUtleX1gO1xuXHR9XG5cblx0cmV0dXJuIHNOZXdIYXNoO1xufVxuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5Sb3V0ZXJQcm94eVwiKVxuY2xhc3MgUm91dGVyUHJveHkgZXh0ZW5kcyBCYXNlT2JqZWN0IHtcblx0YklzUmVidWlsZEhpc3RvcnlSdW5uaW5nID0gZmFsc2U7XG5cdGJJc0NvbXB1dGluZ1RpdGxlSGllcmFjaHkgPSBmYWxzZTtcblx0YklzR3VhcmRDcm9zc0FsbG93ZWQgPSBmYWxzZTtcblx0c0lBcHBTdGF0ZUtleTogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cdF9vU2hlbGxTZXJ2aWNlcyE6IElTaGVsbFNlcnZpY2VzO1xuXHRmY2xFbmFibGVkITogYm9vbGVhbjtcblx0X2ZuQmxvY2tpbmdOYXZGaWx0ZXIhOiBGdW5jdGlvbjtcblx0X2ZuSGFzaEd1YXJkITogRnVuY3Rpb247XG5cdF9iRGlzYWJsZU9uSGFzaENoYW5nZSE6IGJvb2xlYW47XG5cdF9iSWdub3JlUmVzdG9yZSE6IGJvb2xlYW47XG5cdF9iRm9yY2VGb2N1cyE6IGJvb2xlYW47XG5cdF9vUm91dGVyITogUm91dGVyO1xuXHRfb01hbmFnZWRIaXN0b3J5ITogYW55W107XG5cdF9vTmF2aWdhdGlvbkd1YXJkOiBhbnk7XG5cdG9SZXNvdXJjZUJ1bmRsZT86IFJlc291cmNlQnVuZGxlO1xuXHRfb1JvdXRlTWF0Y2hTeW5jaHJvbml6YXRpb24/OiBTeW5jaHJvbml6YXRpb247XG5cdF9iQWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hybzogYm9vbGVhbiA9IGZhbHNlO1xuXHRfYkFwcGx5UmVzdG9yZTogYm9vbGVhbiA9IGZhbHNlO1xuXHRfYkRlbGF5ZWRSZWJ1aWxkOiBib29sZWFuID0gZmFsc2U7XG5cdF9wYXRoTWFwcGluZ3M6IHsgb2xkUGF0aDogc3RyaW5nOyBuZXdQYXRoOiBzdHJpbmcgfVtdID0gW107XG5cblx0aW5pdChvQXBwQ29tcG9uZW50OiBhbnksIGlzZmNsRW5hYmxlZDogYm9vbGVhbikge1xuXHRcdC8vIFNhdmUgdGhlIG5hbWUgb2YgdGhlIGFwcCAoaW5jbHVkaW5nIHN0YXJ0dXAgcGFyYW1ldGVycykgZm9yIHJlYnVpbGRpbmcgZnVsbCBoYXNoZXMgbGF0ZXJcblx0XHRvQXBwQ29tcG9uZW50XG5cdFx0XHQuZ2V0U2VydmljZShcInNoZWxsU2VydmljZXNcIilcblx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0dGhpcy5fb1NoZWxsU2VydmljZXMgPSBvQXBwQ29tcG9uZW50LmdldFNoZWxsU2VydmljZXMoKTtcblxuXHRcdFx0XHR0aGlzLmluaXRSYXcob0FwcENvbXBvbmVudC5nZXRSb3V0ZXIoKSk7XG5cdFx0XHRcdC8vIFdlIHdhbnQgdG8gd2FpdCB1bnRpbCB0aGUgaW5pdGlhbCByb3V0ZU1hdGNoZWQgaXMgZG9uZSBiZWZvcmUgZG9pbmcgYW55IG5hdmlnYXRpb25cblx0XHRcdFx0dGhpcy53YWl0Rm9yUm91dGVNYXRjaEJlZm9yZU5hdmlnYXRpb24oKTtcblxuXHRcdFx0XHQvLyBTZXQgZmVMZXZlbD0wIGZvciB0aGUgZmlyc3QgQXBwbGljYXRpb24gcGFnZSBpbiB0aGUgaGlzdG9yeVxuXHRcdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZShcblx0XHRcdFx0XHRPYmplY3QuYXNzaWduKFxuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRmZUxldmVsOiAwXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0aGlzdG9yeS5zdGF0ZVxuXHRcdFx0XHRcdCksXG5cdFx0XHRcdFx0XCJcIixcblx0XHRcdFx0XHR3aW5kb3cubG9jYXRpb24gYXMgYW55XG5cdFx0XHRcdCk7XG5cdFx0XHRcdHRoaXMuZmNsRW5hYmxlZCA9IGlzZmNsRW5hYmxlZDtcblxuXHRcdFx0XHR0aGlzLl9mbkJsb2NraW5nTmF2RmlsdGVyID0gdGhpcy5fYmxvY2tpbmdOYXZpZ2F0aW9uRmlsdGVyLmJpbmQodGhpcyk7XG5cdFx0XHRcdHRoaXMuX29TaGVsbFNlcnZpY2VzLnJlZ2lzdGVyTmF2aWdhdGlvbkZpbHRlcih0aGlzLl9mbkJsb2NraW5nTmF2RmlsdGVyKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkNhbm5vdCByZXRyaWV2ZSB0aGUgc2hlbGwgc2VydmljZXNcIiwgb0Vycm9yKTtcblx0XHRcdH0pO1xuXHRcdHRoaXMuX2ZuSGFzaEd1YXJkID0gdGhpcy5oYXNoR3VhcmQuYmluZCh0aGlzKTtcblx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIHRoaXMuX2ZuSGFzaEd1YXJkIGFzIGFueSk7XG5cdFx0dGhpcy5fYkRpc2FibGVPbkhhc2hDaGFuZ2UgPSBmYWxzZTtcblx0XHR0aGlzLl9iSWdub3JlUmVzdG9yZSA9IGZhbHNlO1xuXHRcdHRoaXMuX2JGb3JjZUZvY3VzID0gdHJ1ZTsgLy8gVHJpZ2dlciB0aGUgZm9jdXMgbWVjaGFuaXNtIGZvciB0aGUgZmlyc3QgdmlldyBkaXNwbGF5ZWQgYnkgdGhlIGFwcFxuXHR9XG5cblx0ZGVzdHJveSgpIHtcblx0XHRpZiAodGhpcy5fb1NoZWxsU2VydmljZXMpIHtcblx0XHRcdHRoaXMuX29TaGVsbFNlcnZpY2VzLnVucmVnaXN0ZXJOYXZpZ2F0aW9uRmlsdGVyKHRoaXMuX2ZuQmxvY2tpbmdOYXZGaWx0ZXIpO1xuXHRcdH1cblx0XHR3aW5kb3cucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIHRoaXMuX2ZuSGFzaEd1YXJkIGFzIGFueSk7XG5cdH1cblxuXHQvKipcblx0ICogUmF3IGluaXRpYWxpemF0aW9uIChmb3IgdW5pdCB0ZXN0cykuXG5cdCAqXG5cdCAqIEBwYXJhbSBvUm91dGVyIFRoZSByb3V0ZXIgdXNlZCBieSB0aGlzIHByb3h5XG5cdCAqL1xuXHRpbml0UmF3KG9Sb3V0ZXI6IFJvdXRlcikge1xuXHRcdHRoaXMuX29Sb3V0ZXIgPSBvUm91dGVyO1xuXHRcdHRoaXMuX29NYW5hZ2VkSGlzdG9yeSA9IFtdO1xuXHRcdHRoaXMuX29OYXZpZ2F0aW9uR3VhcmQgPSBudWxsO1xuXG5cdFx0Y29uc3Qgc0N1cnJlbnRBcHBIYXNoID0gdGhpcy5nZXRIYXNoKCk7XG5cdFx0dGhpcy5fb01hbmFnZWRIaXN0b3J5LnB1c2godGhpcy5fZXh0cmFjdFN0YXRlRnJvbUhhc2goc0N1cnJlbnRBcHBIYXNoKSk7XG5cblx0XHQvLyBTZXQgdGhlIGlBcHBTdGF0ZSBpZiB0aGUgaW5pdGlhbCBoYXNoIGNvbnRhaW5zIG9uZVxuXHRcdHRoaXMuc0lBcHBTdGF0ZUtleSA9IGZpbmRBcHBTdGF0ZUluSGFzaChzQ3VycmVudEFwcEhhc2gpO1xuXHR9XG5cblx0Z2V0SGFzaCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fb1JvdXRlci5nZXRIYXNoQ2hhbmdlcigpLmdldEhhc2goKTtcblx0fVxuXG5cdGlzRm9jdXNGb3JjZWQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2JGb3JjZUZvY3VzO1xuXHR9XG5cblx0c2V0Rm9jdXNGb3JjZWQoYkZvcmNlZDogYm9vbGVhbikge1xuXHRcdHRoaXMuX2JGb3JjZUZvY3VzID0gYkZvcmNlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXNldHMgdGhlIGludGVybmFsIHZhcmlhYmxlIHNJQXBwU3RhdGVLZXkuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUuY29yZS5Sb3V0ZXJQcm94eSNyZW1vdmVJQXBwU3RhdGVLZXlcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRyZW1vdmVJQXBwU3RhdGVLZXkoKSB7XG5cdFx0dGhpcy5zSUFwcFN0YXRlS2V5ID0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gYSBzcGVjaWZpYyBoYXNoLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgc2FwLmZlLmNvcmUuUm91dGVyUHJveHkjbmF2VG9IYXNoXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUuY29yZS5Sb3V0ZXJQcm94eVxuXHQgKiBAc3RhdGljXG5cdCAqIEBwYXJhbSBzSGFzaCBIYXNoIHRvIGJlIG5hdmlnYXRlZCB0b1xuXHQgKiBAcGFyYW0gYlByZXNlcnZlSGlzdG9yeSBJZiBzZXQgdG8gdHJ1ZSwgbm9uLWFuY2VzdG9yIGVudHJpZXMgaW4gaGlzdG9yeSB3aWxsIGJlIHJldGFpbmVkXG5cdCAqIEBwYXJhbSBiRGlzYWJsZVByZXNlcnZhdGlvbkNhY2hlIElmIHNldCB0byB0cnVlLCBjYWNoZSBwcmVzZXJ2YXRpb24gbWVjaGFuaXNtIGlzIGRpc2FibGVkIGZvciB0aGUgY3VycmVudCBuYXZpZ2F0aW9uXG5cdCAqIEBwYXJhbSBiRm9yY2VGb2N1cyBJZiBzZXQgdG8gdHJ1ZSwgdGhlIGxvZ2ljIHRvIHNldCB0aGUgZm9jdXMgb25jZSB0aGUgbmF2aWdhdGlvbiBpcyBmaW5hbGl6ZWQgd2lsbCBiZSB0cmlnZ2VyZWQgKG9uUGFnZVJlYWR5KVxuXHQgKiBAcGFyYW0gYlByZXNlcnZlU2hlbGxCYWNrTmF2aWdhdGlvbkhhbmRsZXIgSWYgbm90IHNldCB0byBmYWxzZSwgdGhlIGJhY2sgbmF2aWdhdGlvbiBpcyBzZXQgdG8gdW5kZWZpbmVkXG5cdCAqIEByZXR1cm5zIFByb21pc2UgKHJlc29sdmVkIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgZmluYWxpemVkKSB0aGF0IHJldHVybnMgJ3RydWUnIGlmIGEgbmF2aWdhdGlvbiB0b29rIHBsYWNlLCAnZmFsc2UnIGlmIHRoZSBuYXZpZ2F0aW9uIGRpZG4ndCBoYXBwZW5cblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRuYXZUb0hhc2goXG5cdFx0c0hhc2g6IHN0cmluZyB8IHVuZGVmaW5lZCxcblx0XHRiUHJlc2VydmVIaXN0b3J5PzogYm9vbGVhbixcblx0XHRiRGlzYWJsZVByZXNlcnZhdGlvbkNhY2hlPzogYm9vbGVhbixcblx0XHRiRm9yY2VGb2N1cz86IGJvb2xlYW4sXG5cdFx0YlByZXNlcnZlU2hlbGxCYWNrTmF2aWdhdGlvbkhhbmRsZXI/OiBib29sZWFuXG5cdCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdGlmIChiUHJlc2VydmVTaGVsbEJhY2tOYXZpZ2F0aW9uSGFuZGxlciAhPT0gZmFsc2UpIHtcblx0XHRcdHRoaXMuX29TaGVsbFNlcnZpY2VzLnNldEJhY2tOYXZpZ2F0aW9uKCk7XG5cdFx0fVxuXHRcdGlmICh0aGlzLl9vUm91dGVNYXRjaFN5bmNocm9uaXphdGlvbikge1xuXHRcdFx0cmV0dXJuIHRoaXMuX29Sb3V0ZU1hdGNoU3luY2hyb25pemF0aW9uLndhaXRGb3IoKS50aGVuKCgpID0+IHtcblx0XHRcdFx0dGhpcy5fb1JvdXRlTWF0Y2hTeW5jaHJvbml6YXRpb24gPSB1bmRlZmluZWQ7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9pbnRlcm5hbE5hdlRvSGFzaChzSGFzaCwgYlByZXNlcnZlSGlzdG9yeSwgYkRpc2FibGVQcmVzZXJ2YXRpb25DYWNoZSwgYkZvcmNlRm9jdXMpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmICh0aGlzLl9iQWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hybykge1xuXHRcdFx0XHR0aGlzLndhaXRGb3JSb3V0ZU1hdGNoQmVmb3JlTmF2aWdhdGlvbigpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRoaXMuX2ludGVybmFsTmF2VG9IYXNoKHNIYXNoLCBiUHJlc2VydmVIaXN0b3J5LCBiRGlzYWJsZVByZXNlcnZhdGlvbkNhY2hlLCBiRm9yY2VGb2N1cyk7XG5cdFx0fVxuXHR9XG5cblx0X2ludGVybmFsTmF2VG9IYXNoKHNIYXNoOiBhbnksIGJQcmVzZXJ2ZUhpc3Rvcnk6IGFueSwgYkRpc2FibGVQcmVzZXJ2YXRpb25DYWNoZTogYW55LCBiRm9yY2VGb2N1cz86IGJvb2xlYW4pOiBQcm9taXNlPGJvb2xlYW4+IHtcblx0XHQvLyBBZGQgdGhlIGFwcCBzdGF0ZSBpbiB0aGUgaGFzaCBpZiBuZWVkZWRcblx0XHRpZiAodGhpcy5mY2xFbmFibGVkICYmIHRoaXMuc0lBcHBTdGF0ZUtleSAmJiAhZmluZEFwcFN0YXRlSW5IYXNoKHNIYXNoKSkge1xuXHRcdFx0c0hhc2ggPSBzZXRBcHBTdGF0ZUluSGFzaChzSGFzaCwgdGhpcy5zSUFwcFN0YXRlS2V5KTtcblx0XHR9XG5cblx0XHRpZiAoIXRoaXMuY2hlY2tIYXNoV2l0aEd1YXJkKHNIYXNoKSkge1xuXHRcdFx0aWYgKCF0aGlzLm9SZXNvdXJjZUJ1bmRsZSkge1xuXHRcdFx0XHR0aGlzLm9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0XHR9XG5cblx0XHRcdC8vIFdlIGhhdmUgdG8gdXNlIGEgY29uZmlybSBoZXJlIGZvciBVSSBjb25zaXN0ZW5jeSByZWFzb25zLCBhcyB3aXRoIHNvbWUgc2NlbmFyaW9zXG5cdFx0XHQvLyBpbiB0aGUgRWRpdEZsb3cgd2UgcmVseSBvbiBhIFVJNSBtZWNoYW5pc20gdGhhdCBkaXNwbGF5cyBhIGNvbmZpcm0gZGlhbG9nLlxuXHRcdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWFsZXJ0XG5cdFx0XHRpZiAoIWNvbmZpcm0odGhpcy5vUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfUk9VVEVSX1BST1hZX1NBUEZFX0VYSVRfTk9UU0FWRURfTUVTU0FHRVwiKSkpIHtcblx0XHRcdFx0Ly8gVGhlIHVzZXIgY2xpY2tlZCBvbiBDYW5jZWwgLS0+IGNhbmNlbCBuYXZpZ2F0aW9uXG5cdFx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFx0dGhpcy5iSXNHdWFyZENyb3NzQWxsb3dlZCA9IHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gSW4gY2FzZSB0aGUgbmF2aWdhdGlvbiB3aWxsIGNhdXNlIGEgbmV3IHZpZXcgdG8gYmUgZGlzcGxheWVkLCB3ZSBmb3JjZSB0aGUgZm9jdXNcblx0XHQvLyBJLmUuIGlmIHRoZSBrZXlzIGZvciB0aGUgaGFzaCB3ZSdyZSBuYXZpZ2F0aW5nIHRvIGlzIGEgc3VwZXJzZXQgb2YgdGhlIGN1cnJlbnQgaGFzaCBrZXlzLlxuXHRcdGNvbnN0IG9OZXdTdGF0ZSA9IHRoaXMuX2V4dHJhY3RTdGF0ZUZyb21IYXNoKHNIYXNoKTtcblx0XHRpZiAoIXRoaXMuX2JGb3JjZUZvY3VzKSB7XG5cdFx0XHQvLyBJZiB0aGUgZm9jdXMgd2FzIGFscmVhZHkgZm9yY2VkLCBrZWVwIGl0XG5cdFx0XHRjb25zdCBhQ3VycmVudEhhc2hLZXlzID0gdGhpcy5fZXh0cmFjdEVudGl0eVNldHNGcm9tSGFzaCh0aGlzLmdldEhhc2goKSk7XG5cdFx0XHR0aGlzLl9iRm9yY2VGb2N1cyA9XG5cdFx0XHRcdGJGb3JjZUZvY3VzIHx8XG5cdFx0XHRcdChhQ3VycmVudEhhc2hLZXlzLmxlbmd0aCA8IG9OZXdTdGF0ZS5rZXlzLmxlbmd0aCAmJlxuXHRcdFx0XHRcdGFDdXJyZW50SGFzaEtleXMuZXZlcnkoZnVuY3Rpb24gKGtleTogYW55LCBpbmRleDogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4ga2V5ID09PSBvTmV3U3RhdGUua2V5c1tpbmRleF07XG5cdFx0XHRcdFx0fSkpO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9IaXN0b3J5QWN0aW9uID0gdGhpcy5fcHVzaE5ld1N0YXRlKG9OZXdTdGF0ZSwgZmFsc2UsIGJQcmVzZXJ2ZUhpc3RvcnksIGJEaXNhYmxlUHJlc2VydmF0aW9uQ2FjaGUpO1xuXG5cdFx0cmV0dXJuIHRoaXMuX3JlYnVpbGRCcm93c2VySGlzdG9yeShvSGlzdG9yeUFjdGlvbiwgZmFsc2UpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENsZWFycyBicm93c2VyIGhpc3RvcnkgaWYgZW50cmllcyBoYXZlIGJlZW4gYWRkZWQgd2l0aG91dCB1c2luZyB0aGUgUm91dGVyUHJveHkuXG5cdCAqIFVwZGF0ZXMgdGhlIGludGVybmFsIGhpc3RvcnkgYWNjb3JkaW5nbHkuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCBvbmNlIHRoZSBoaXN0b3J5IGlzIHJlYnVpbHRcblx0ICovXG5cdHJlc3RvcmVIaXN0b3J5KCkge1xuXHRcdGlmICh0aGlzLl9iQXBwbHlSZXN0b3JlKSB7XG5cdFx0XHR0aGlzLl9iQXBwbHlSZXN0b3JlID0gZmFsc2U7XG5cdFx0XHRsZXQgc1RhcmdldEhhc2ggPSB0aGlzLmdldEhhc2goKTtcblx0XHRcdHNUYXJnZXRIYXNoID0gc1RhcmdldEhhc2gucmVwbGFjZSgvKFxcP3wmKXJlc3RvcmVIaXN0b3J5PXRydWUvLCBcIlwiKTtcblx0XHRcdGNvbnN0IG9OZXdTdGF0ZSA9IHRoaXMuX2V4dHJhY3RTdGF0ZUZyb21IYXNoKHNUYXJnZXRIYXNoKTtcblxuXHRcdFx0Y29uc3Qgb0hpc3RvcnlBY3Rpb24gPSB0aGlzLl9wdXNoTmV3U3RhdGUob05ld1N0YXRlLCB0cnVlLCBmYWxzZSwgdHJ1ZSk7XG5cblx0XHRcdHJldHVybiB0aGlzLl9yZWJ1aWxkQnJvd3Nlckhpc3Rvcnkob0hpc3RvcnlBY3Rpb24sIHRydWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyBiYWNrIGluIHRoZSBoaXN0b3J5LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBpcyBmaW5hbGl6ZWRcblx0ICovXG5cdG5hdkJhY2soKSB7XG5cdFx0Y29uc3Qgc0N1cnJlbnRIYXNoID0gdGhpcy5nZXRIYXNoKCk7XG5cdFx0bGV0IHNQcmV2aW91c0hhc2g7XG5cblx0XHQvLyBMb29rIGZvciB0aGUgY3VycmVudCBoYXNoIGluIHRoZSBtYW5hZ2VkIGhpc3Rvcnlcblx0XHRmb3IgKGxldCBpID0gdGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCAtIDE7IGkgPiAwOyBpLS0pIHtcblx0XHRcdGlmICh0aGlzLl9vTWFuYWdlZEhpc3RvcnlbaV0uaGFzaCA9PT0gc0N1cnJlbnRIYXNoKSB7XG5cdFx0XHRcdHNQcmV2aW91c0hhc2ggPSB0aGlzLl9vTWFuYWdlZEhpc3RvcnlbaSAtIDFdLmhhc2g7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChzUHJldmlvdXNIYXNoKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5uYXZUb0hhc2goc1ByZXZpb3VzSGFzaCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFdlIGNvdWxkbid0IGZpbmQgYSBwcmV2aW91cyBoYXNoIGluIGhpc3Rvcnlcblx0XHRcdC8vIFRoaXMgY2FuIGhhcHBlbiB3aGVuIG5hdmlnYXRpbmcgZnJvbSBhIHRyYW5zaWVudCBoYXNoIGluIGEgY3JlYXRlIGFwcCwgYW5kXG5cdFx0XHQvLyBpbiB0aGF0IGNhc2UgaGlzdG9yeS5iYWNrIHdvdWxkIGdvIGJhY2sgdG8gdGhlIEZMUFxuXHRcdFx0d2luZG93Lmhpc3RvcnkuYmFjaygpO1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gYSByb3V0ZSB3aXRoIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUm91dGVOYW1lIFRoZSByb3V0ZSBuYW1lIHRvIGJlIG5hdmlnYXRlZCB0b1xuXHQgKiBAcGFyYW0gb1BhcmFtZXRlcnMgUGFyYW1ldGVycyBmb3IgdGhlIG5hdmlnYXRpb25cblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIG5hdmlnYXRpb24gaXMgZmluYWxpemVkXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0bmF2VG8oc1JvdXRlTmFtZTogc3RyaW5nLCBvUGFyYW1ldGVyczogYW55KSB7XG5cdFx0Y29uc3Qgc0hhc2ggPSB0aGlzLl9vUm91dGVyLmdldFVSTChzUm91dGVOYW1lLCBvUGFyYW1ldGVycyk7XG5cdFx0cmV0dXJuIHRoaXMubmF2VG9IYXNoKHNIYXNoLCBmYWxzZSwgb1BhcmFtZXRlcnMubm9QcmVzZXJ2YXRpb25DYWNoZSwgZmFsc2UsICFvUGFyYW1ldGVycy5iSXNTdGlja3lNb2RlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBFeGl0cyB0aGUgY3VycmVudCBhcHAgYnkgbmF2aWdhdGluZyBiYWNrXG5cdCAqIHRvIHRoZSBwcmV2aW91cyBhcHAgKGlmIGFueSkgb3IgdGhlIEZMUC5cblx0ICpcblx0ICogQHJldHVybnMgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gd2UgZXhpdCB0aGUgYXBwXG5cdCAqL1xuXHRleGl0RnJvbUFwcCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fb1NoZWxsU2VydmljZXMuYmFja1RvUHJldmlvdXNBcHAoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIGhhc2ggY2FuIGhhdmUgYW4gaW1wYWN0IG9uIHRoZSBjdXJyZW50IHN0YXRlXG5cdCAqIGkuZS4gaWYgdGhlIGhhc2ggaXMgZXF1YWwsIGNvbXBhdGlibGUgb3IgYW4gYW5jZXN0b3Igb2YgdGhlIGN1cnJlbnQgc3RhdGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBzSGFzaCBgdHJ1ZWAgaWYgdGhlcmUgaXMgYW4gaW1wYWN0XG5cdCAqIEByZXR1cm5zIElmIHRoZXJlIGlzIGFuIGltcGFjdFxuXHQgKi9cblx0aXNDdXJyZW50U3RhdGVJbXBhY3RlZEJ5KHNIYXNoOiBhbnkpIHtcblx0XHRpZiAoc0hhc2hbMF0gPT09IFwiL1wiKSB7XG5cdFx0XHRzSGFzaCA9IHNIYXNoLnN1YnN0cmluZygxKTtcblx0XHR9XG5cdFx0Y29uc3Qgb0xvY2FsR3VhcmQgPSBjcmVhdGVHdWFyZEZyb21IYXNoKHNIYXNoKTtcblx0XHRyZXR1cm4gb0xvY2FsR3VhcmQuY2hlY2sodGhpcy5nZXRIYXNoKCkpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIG5hdmlnYXRpb24gaXMgY3VycmVudGx5IGJlaW5nIHByb2Nlc3NlZC5cblx0ICpcblx0ICogQHJldHVybnMgYGZhbHNlYCBpZiBhIG5hdmlnYXRpb24gaGFzIGJlZW4gdHJpZ2dlcmVkIGluIHRoZSBSb3V0ZXJQcm94eSBhbmQgaXMgbm90IHlldCBmaW5hbGl6ZWRcblx0ICovXG5cdGlzTmF2aWdhdGlvbkZpbmFsaXplZCgpIHtcblx0XHRyZXR1cm4gIXRoaXMuYklzUmVidWlsZEhpc3RvcnlSdW5uaW5nICYmICF0aGlzLl9iRGVsYXllZFJlYnVpbGQ7XG5cdH1cblxuXHQvKipcblx0ICogU2V0cyB0aGUgbGFzdCBzdGF0ZSBhcyBhIGd1YXJkLlxuXHQgKiBFYWNoIGZ1dHVyZSBuYXZpZ2F0aW9uIHdpbGwgYmUgY2hlY2tlZCBhZ2FpbnN0IHRoaXMgZ3VhcmQsIGFuZCBhIGNvbmZpcm1hdGlvbiBkaWFsb2cgd2lsbFxuXHQgKiBiZSBkaXNwbGF5ZWQgYmVmb3JlIHRoZSBuYXZpZ2F0aW9uIGNyb3NzZXMgdGhlIGd1YXJkIChpLmUuIGdvZXMgdG8gYW4gYW5jZXN0b3Igb2YgdGhlIGd1YXJkKS5cblx0ICpcblx0ICogQHBhcmFtIHNIYXNoIFRoZSBoYXNoIGZvciB0aGUgZ3VhcmRcblx0ICovXG5cdHNldE5hdmlnYXRpb25HdWFyZChzSGFzaDogc3RyaW5nKSB7XG5cdFx0dGhpcy5fb05hdmlnYXRpb25HdWFyZCA9IGNyZWF0ZUd1YXJkRnJvbUhhc2goc0hhc2gpO1xuXHRcdHRoaXMuYklzR3VhcmRDcm9zc0FsbG93ZWQgPSBmYWxzZTtcblx0fVxuXG5cdC8qKlxuXHQgKiBEaXNhYmxlcyB0aGUgbmF2aWdhdGlvbiBndWFyZC5cblx0ICovXG5cdGRpc2NhcmROYXZpZ2F0aW9uR3VhcmQoKSB7XG5cdFx0dGhpcy5fb05hdmlnYXRpb25HdWFyZCA9IG51bGw7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGZvciB0aGUgYXZhaWxhYmlsaXR5IG9mIHRoZSBuYXZpZ2F0aW9uIGd1YXJkLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgbmF2aWdhdGluZyBndWFyZCBpcyBhdmFpbGFibGVcblx0ICovXG5cdGhhc05hdmlnYXRpb25HdWFyZCgpIHtcblx0XHRyZXR1cm4gdGhpcy5fb05hdmlnYXRpb25HdWFyZCAhPT0gbnVsbDtcblx0fVxuXG5cdC8qKlxuXHQgKiBUZXN0cyBhIGhhc2ggYWdhaW5zdCB0aGUgbmF2aWdhdGlvbiBndWFyZC5cblx0ICpcblx0ICogQHBhcmFtIHNIYXNoIFRoZSBoYXNoIHRvIGJlIHRlc3RlZFxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgbmF2aWdhdGluZyB0byB0aGUgaGFzaCBkb2Vzbid0IGNyb3NzIHRoZSBndWFyZFxuXHQgKi9cblx0Y2hlY2tIYXNoV2l0aEd1YXJkKHNIYXNoOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gdGhpcy5fb05hdmlnYXRpb25HdWFyZCA9PT0gbnVsbCB8fCB0aGlzLl9vTmF2aWdhdGlvbkd1YXJkLmNoZWNrKHNIYXNoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIHVzZXIgYWxsb3dlZCB0aGUgbmF2aWdhdGlvbiBndWFyZCB0byBiZSBjcm9zc2VkLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgY3Jvc3NpbmcgdGhlIGd1YXJkIGhhcyBiZWVuIGFsbG93ZWQgYnkgdGhlIHVzZXJcblx0ICovXG5cdGlzR3VhcmRDcm9zc0FsbG93ZWRCeVVzZXIoKSB7XG5cdFx0cmV0dXJuIHRoaXMuYklzR3VhcmRDcm9zc0FsbG93ZWQ7XG5cdH1cblxuXHQvKipcblx0ICogQWN0aXZhdGVzIHRoZSBzeW5jaHJvbml6YXRpb24gZm9yIHJvdXRlTWF0Y2hlZEV2ZW50LlxuXHQgKiBUaGUgbmV4dCBOYXZUb0hhc2ggY2FsbCB3aWxsIGNyZWF0ZSBhIFN5bmNocm9uaXphdGlvbiBvYmplY3QgdGhhdCB3aWxsIGJlIHJlc29sdmVkXG5cdCAqIGJ5IHRoZSBjb3JyZXNwb25kaW5nIG9uUm91dGVNYXRjaGVkIGV2ZW50LCBwcmV2ZW50aW5nIGFub3RoZXIgTmF2VG9IYXNoIHRvIGhhcHBlbiBpbiBwYXJhbGxlbC5cblx0ICovXG5cdGFjdGl2YXRlUm91dGVNYXRjaFN5bmNocm9uaXphdGlvbigpIHtcblx0XHR0aGlzLl9iQWN0aXZhdGVSb3V0ZU1hdGNoU3luY2hybyA9IHRydWU7XG5cdH1cblxuXHQvKipcblx0ICogUmVzb2x2ZSB0aGUgcm91dGVNYXRjaCBzeW5jaHJvbml6YXRpb24gb2JqZWN0LCB1bmxvY2tpbmcgcG90ZW50aWFsIHBlbmRpbmcgTmF2VG9IYXNoIGNhbGxzLlxuXHQgKi9cblx0cmVzb2x2ZVJvdXRlTWF0Y2goKSB7XG5cdFx0aWYgKHRoaXMuX29Sb3V0ZU1hdGNoU3luY2hyb25pemF0aW9uKSB7XG5cdFx0XHR0aGlzLl9vUm91dGVNYXRjaFN5bmNocm9uaXphdGlvbi5yZXNvbHZlKCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ha2VzIHN1cmUgbm8gbmF2aWdhdGlvbiBjYW4gaGFwcGVuIGJlZm9yZSBhIHJvdXRlTWF0Y2ggaGFwcGVuZWQuXG5cdCAqL1xuXHR3YWl0Rm9yUm91dGVNYXRjaEJlZm9yZU5hdmlnYXRpb24oKSB7XG5cdFx0dGhpcy5fb1JvdXRlTWF0Y2hTeW5jaHJvbml6YXRpb24gPSBuZXcgU3luY2hyb25pemF0aW9uKCk7XG5cdFx0dGhpcy5fYkFjdGl2YXRlUm91dGVNYXRjaFN5bmNocm8gPSBmYWxzZTtcblx0fVxuXG5cdF9leHRyYWN0RW50aXR5U2V0c0Zyb21IYXNoKHNIYXNoOiBzdHJpbmcgfCB1bmRlZmluZWQpOiBzdHJpbmdbXSB7XG5cdFx0aWYgKHNIYXNoID09PSB1bmRlZmluZWQpIHtcblx0XHRcdHNIYXNoID0gXCJcIjtcblx0XHR9XG5cdFx0Y29uc3Qgc0hhc2hOb1BhcmFtcyA9IHNIYXNoLnNwbGl0KFwiP1wiKVswXTsgLy8gcmVtb3ZlIHBhcmFtc1xuXHRcdGNvbnN0IGFUb2tlbnMgPSBzSGFzaE5vUGFyYW1zLnNwbGl0KFwiL1wiKTtcblx0XHRjb25zdCBuYW1lczogc3RyaW5nW10gPSBbXTtcblxuXHRcdGFUb2tlbnMuZm9yRWFjaCgoc1Rva2VuKSA9PiB7XG5cdFx0XHRpZiAoc1Rva2VuLmxlbmd0aCkge1xuXHRcdFx0XHRuYW1lcy5wdXNoKHNUb2tlbi5zcGxpdChcIihcIilbMF0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIG5hbWVzO1xuXHR9XG5cblx0LyoqXG5cdCAqIEJ1aWxkcyBhIHN0YXRlIGZyb20gYSBoYXNoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0hhc2ggVGhlIGhhc2ggdG8gYmUgdXNlZCBhcyBlbnRyeVxuXHQgKiBAcmV0dXJucyBUaGUgc3RhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRfZXh0cmFjdFN0YXRlRnJvbUhhc2goc0hhc2g6IHN0cmluZykge1xuXHRcdGlmIChzSGFzaCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRzSGFzaCA9IFwiXCI7XG5cdFx0fVxuXG5cdFx0Y29uc3Qgb1N0YXRlOiBhbnkgPSB7XG5cdFx0XHRrZXlzOiB0aGlzLl9leHRyYWN0RW50aXR5U2V0c0Zyb21IYXNoKHNIYXNoKVxuXHRcdH07XG5cblx0XHQvLyBSZXRyaWV2ZSBsYXlvdXQgKGlmIGFueSlcblx0XHRjb25zdCBhTGF5b3V0ID0gc0hhc2gubWF0Y2gobmV3IFJlZ0V4cChgXFxcXD8uKiR7ZW51bVVSTFBhcmFtcy5MQVlPVVRQQVJBTX09KFteJl0qKWApKTtcblx0XHRvU3RhdGUuc0xheW91dCA9IGFMYXlvdXQgJiYgYUxheW91dC5sZW5ndGggPiAxID8gYUxheW91dFsxXSA6IG51bGw7XG5cdFx0aWYgKG9TdGF0ZS5zTGF5b3V0ID09PSBcIk1pZENvbHVtbkZ1bGxTY3JlZW5cIikge1xuXHRcdFx0b1N0YXRlLnNjcmVlbk1vZGUgPSAxO1xuXHRcdH0gZWxzZSBpZiAob1N0YXRlLnNMYXlvdXQgPT09IFwiRW5kQ29sdW1uRnVsbFNjcmVlblwiKSB7XG5cdFx0XHRvU3RhdGUuc2NyZWVuTW9kZSA9IDI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9TdGF0ZS5zY3JlZW5Nb2RlID0gMDtcblx0XHR9XG5cblx0XHRvU3RhdGUuaGFzaCA9IHNIYXNoO1xuXHRcdHJldHVybiBvU3RhdGU7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIG5ldyBzdGF0ZSBpbnRvIHRoZSBpbnRlcm5hbCBoaXN0b3J5IHN0cnVjdHVyZS5cblx0ICogTWFrZXMgc3VyZSB0aGlzIG5ldyBzdGF0ZSBpcyBhZGRlZCBhZnRlciBhbiBhbmNlc3Rvci5cblx0ICogQWxzbyBzZXRzIHRoZSBpQXBwU3RhdGUga2V5IGluIHRoZSB3aG9sZSBoaXN0b3J5LlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuUm91dGVyUHJveHlcblx0ICogQHBhcmFtIG9OZXdTdGF0ZSBUaGUgbmV3IHN0YXRlIHRvIGJlIGFkZGVkXG5cdCAqIEBwYXJhbSBiUmVidWlsZE9ubHkgYHRydWVgIGlmIHdlJ3JlIHJlYnVpbGRpbmcgdGhlIGhpc3RvcnkgYWZ0ZXIgYSBzaGVsbCBtZW51IG5hdmlnYXRpb25cblx0ICogQHBhcmFtIGJQcmVzZXJ2ZUhpc3RvcnkgSWYgc2V0IHRvIHRydWUsIG5vbi1hbmNlc3RvciBlbnRyaWVzIGluIGhpc3Rvcnkgd2lsbCBiZSByZXRhaW5lZFxuXHQgKiBAcGFyYW0gYkRpc2FibGVIaXN0b3J5UHJlc2VydmF0aW9uIERpc2FibGUgdGhlIG1lY2hhbmlzbSB0byByZXRhaW5lZCBtYXJrZWQgZW50cmllcyBpbiBjYWNoZVxuXHQgKiBAcmV0dXJucyBUaGUgbmV3IHN0YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAZmluYWxcblx0ICovXG5cdF9wdXNoTmV3U3RhdGUob05ld1N0YXRlOiBhbnksIGJSZWJ1aWxkT25seTogYm9vbGVhbiwgYlByZXNlcnZlSGlzdG9yeTogYm9vbGVhbiwgYkRpc2FibGVIaXN0b3J5UHJlc2VydmF0aW9uOiBib29sZWFuKSB7XG5cdFx0Y29uc3Qgc0N1cnJlbnRIYXNoID0gdGhpcy5nZXRIYXNoKCk7XG5cdFx0bGV0IGxhc3RJbmRleCA9IHRoaXMuX29NYW5hZ2VkSGlzdG9yeS5sZW5ndGggLSAxO1xuXHRcdGxldCBpUG9wQ291bnQgPSBiUmVidWlsZE9ubHkgPyAxIDogMDtcblxuXHRcdC8vIDEuIERvIHNvbWUgY2xlYW51cCBpbiB0aGUgbWFuYWdlZCBoaXN0b3J5IDogaW4gY2FzZSB0aGUgdXNlciBoYXMgbmF2aWdhdGVkIGJhY2sgaW4gdGhlIGJyb3dzZXIgaGlzdG9yeSwgd2UgbmVlZCB0byByZW1vdmVcblx0XHQvLyB0aGUgc3RhdGVzIGFoZWFkIGluIGhpc3RvcnkgYW5kIG1ha2Ugc3VyZSB0aGUgdG9wIHN0YXRlIGNvcnJlc3BvbmRzIHRvIHRoZSBjdXJyZW50IHBhZ2Vcblx0XHQvLyBXZSBkb24ndCBkbyB0aGF0IHdoZW4gcmVzdG9yaW5nIHRoZSBoaXN0b3J5LCBhcyB0aGUgY3VycmVudCBzdGF0ZSBoYXMgYmVlbiBhZGRlZCBvbiB0b3Agb2YgdGhlIGJyb3dzZXIgaGlzdG9yeVxuXHRcdC8vIGFuZCBpcyBub3QgcmVmbGVjdGVkIGluIHRoZSBtYW5hZ2VkIGhpc3Rvcnlcblx0XHRpZiAoIWJSZWJ1aWxkT25seSkge1xuXHRcdFx0d2hpbGUgKGxhc3RJbmRleCA+PSAwICYmIHRoaXMuX29NYW5hZ2VkSGlzdG9yeVtsYXN0SW5kZXhdLmhhc2ggIT09IHNDdXJyZW50SGFzaCkge1xuXHRcdFx0XHR0aGlzLl9vTWFuYWdlZEhpc3RvcnkucG9wKCk7XG5cdFx0XHRcdGxhc3RJbmRleC0tO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAodGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHQvLyBXZSBjb3VsZG4ndCBmaW5kIHRoZSBjdXJyZW50IGxvY2F0aW9uIGluIHRoZSBoaXN0b3J5LiBUaGlzIGNhbiBoYXBwZW4gaWYgYSBicm93c2VyIHJlbG9hZFxuXHRcdFx0XHQvLyBoYXBwZW5lZCwgY2F1c2luZyBhIHJlaW5pdGlhbGl6YXRpb24gb2YgdGhlIG1hbmFnZWQgaGlzdG9yeS5cblx0XHRcdFx0Ly8gSW4gdGhhdCBjYXNlLCB3ZSB1c2UgdGhlIGN1cnJlbnQgbG9jYXRpb24gYXMgdGhlIG5ldyBzdGFydGluZyBwb2ludCBpbiB0aGUgbWFuYWdlZCBoaXN0b3J5XG5cdFx0XHRcdHRoaXMuX29NYW5hZ2VkSGlzdG9yeS5wdXNoKHRoaXMuX2V4dHJhY3RTdGF0ZUZyb21IYXNoKHNDdXJyZW50SGFzaCkpO1xuXHRcdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZShPYmplY3QuYXNzaWduKHsgZmVMZXZlbDogMCB9LCBoaXN0b3J5LnN0YXRlKSwgXCJcIik7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0Ly8gMi4gTWFyayB0aGUgdG9wIHN0YXRlIGFzIHByZXNlcnZlZCBpZiByZXF1aXJlZFxuXHRcdGlmIChiUHJlc2VydmVIaXN0b3J5ICYmICFiRGlzYWJsZUhpc3RvcnlQcmVzZXJ2YXRpb24pIHtcblx0XHRcdHRoaXMuX29NYW5hZ2VkSGlzdG9yeVt0aGlzLl9vTWFuYWdlZEhpc3RvcnkubGVuZ3RoIC0gMV0ucHJlc2VydmVkID0gdHJ1ZTtcblx0XHR9XG5cblx0XHQvLyAzLiBUaGVuIHBvcCBhbGwgc3RhdGVzIHVudGlsIHdlIGZpbmQgYW4gYW5jZXN0b3Igb2YgdGhlIG5ldyBzdGF0ZSwgb3Igd2UgZmluZCBhIHN0YXRlIHRoYXQgbmVlZCB0byBiZSBwcmVzZXJ2ZWRcblx0XHRsZXQgb0xhc3RSZW1vdmVkSXRlbTtcblx0XHR3aGlsZSAodGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCA+IDApIHtcblx0XHRcdGNvbnN0IG9Ub3BTdGF0ZSA9IHRoaXMuX29NYW5hZ2VkSGlzdG9yeVt0aGlzLl9vTWFuYWdlZEhpc3RvcnkubGVuZ3RoIC0gMV07XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChiRGlzYWJsZUhpc3RvcnlQcmVzZXJ2YXRpb24gfHwgIW9Ub3BTdGF0ZS5wcmVzZXJ2ZWQpICYmXG5cdFx0XHRcdHRoaXMuX2NvbXBhcmVDYWNoZVN0YXRlcyhvVG9wU3RhdGUsIG9OZXdTdGF0ZSkgIT09IGVudW1TdGF0ZS5BTkNFU1RPUlxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIFRoZSB0b3Agc3RhdGUgaXMgbm90IGFuIGFuY2VzdG9yIG9mIG9OZXdTdGF0ZSBhbmQgaXMgbm90IHByZXNlcnZlZCAtLT4gd2UgY2FuIHBvcCBpdFxuXHRcdFx0XHRvTGFzdFJlbW92ZWRJdGVtID0gdGhpcy5fb01hbmFnZWRIaXN0b3J5LnBvcCgpO1xuXHRcdFx0XHRpUG9wQ291bnQrKztcblx0XHRcdH0gZWxzZSBpZiAob1RvcFN0YXRlLnByZXNlcnZlZCAmJiByZW1vdmVBcHBTdGF0ZUluSGFzaChvVG9wU3RhdGUuaGFzaCkgPT09IHJlbW92ZUFwcFN0YXRlSW5IYXNoKG9OZXdTdGF0ZS5oYXNoKSkge1xuXHRcdFx0XHQvLyBXZSB0cnkgdG8gYWRkIGEgc3RhdGUgdGhhdCBpcyBhbHJlYWR5IGluIGNhY2hlIChkdWUgdG8gcHJlc2VydmVkIGZsYWcpIGJ1dCB3aXRoIGEgZGlmZmVyZW50IGlhcHAtc3RhdGVcblx0XHRcdFx0Ly8gLS0+IHdlIHNob3VsZCBkZWxldGUgdGhlIHByZXZpb3VzIGVudHJ5IChpdCB3aWxsIGJlIGxhdGVyIHJlcGxhY2VkIGJ5IHRoZSBuZXcgb25lKSBhbmQgc3RvcCBwb3BwaW5nXG5cdFx0XHRcdG9MYXN0UmVtb3ZlZEl0ZW0gPSB0aGlzLl9vTWFuYWdlZEhpc3RvcnkucG9wKCk7XG5cdFx0XHRcdGlQb3BDb3VudCsrO1xuXHRcdFx0XHRvTmV3U3RhdGUucHJlc2VydmVkID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRicmVhazsgLy8gQW5jZXN0b3Igb3IgcHJlc2VydmVkIHN0YXRlIGZvdW5kIC0tPiB3ZSBzdG9wIHBvcHBpbmcgb3V0IHN0YXRlc1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIDQuIGlBcHBTdGF0ZSBtYW5hZ2VtZW50XG5cdFx0dGhpcy5zSUFwcFN0YXRlS2V5ID0gZmluZEFwcFN0YXRlSW5IYXNoKG9OZXdTdGF0ZS5oYXNoKTtcblx0XHRpZiAoIXRoaXMuZmNsRW5hYmxlZCAmJiBvTGFzdFJlbW92ZWRJdGVtKSB7XG5cdFx0XHRjb25zdCBzUHJldmlvdXNJQXBwU3RhdGVLZXkgPSBmaW5kQXBwU3RhdGVJbkhhc2gob0xhc3RSZW1vdmVkSXRlbS5oYXNoKTtcblx0XHRcdGNvbnN0IG9Db21wYXJpc29uU3RhdGVSZXN1bHQgPSB0aGlzLl9jb21wYXJlQ2FjaGVTdGF0ZXMob0xhc3RSZW1vdmVkSXRlbSwgb05ld1N0YXRlKTtcblx0XHRcdC8vIGlmIGN1cnJlbnQgc3RhdGUgZG9lc24ndCBjb250YWluIGEgaS1hcHBzdGF0ZSBhbmQgdGhpcyBzdGF0ZSBzaG91bGQgcmVwbGFjZSBhIHN0YXRlIGNvbnRhaW5pbmcgYSBpQXBwU3RhdGVcblx0XHRcdC8vIHRoZW4gdGhlIHByZXZpb3VzIGlBcHBTdGF0ZSBpcyBwcmVzZXJ2ZWRcblx0XHRcdGlmIChcblx0XHRcdFx0IXRoaXMuc0lBcHBTdGF0ZUtleSAmJlxuXHRcdFx0XHRzUHJldmlvdXNJQXBwU3RhdGVLZXkgJiZcblx0XHRcdFx0KG9Db21wYXJpc29uU3RhdGVSZXN1bHQgPT09IGVudW1TdGF0ZS5FUVVBTCB8fCBvQ29tcGFyaXNvblN0YXRlUmVzdWx0ID09PSBlbnVtU3RhdGUuQ09NUEFUSUJMRSlcblx0XHRcdCkge1xuXHRcdFx0XHRvTmV3U3RhdGUuaGFzaCA9IHNldEFwcFN0YXRlSW5IYXNoKG9OZXdTdGF0ZS5oYXNoLCBzUHJldmlvdXNJQXBwU3RhdGVLZXkpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vIDUuIE5vdyB3ZSBjYW4gcHVzaCB0aGUgc3RhdGUgYXQgdGhlIHRvcCBvZiB0aGUgaW50ZXJuYWwgaGlzdG9yeVxuXHRcdGNvbnN0IGJIYXNTYW1lSGFzaCA9IG9MYXN0UmVtb3ZlZEl0ZW0gJiYgb05ld1N0YXRlLmhhc2ggPT09IG9MYXN0UmVtb3ZlZEl0ZW0uaGFzaDtcblx0XHRpZiAodGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCA9PT0gMCB8fCB0aGlzLl9vTWFuYWdlZEhpc3RvcnlbdGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCAtIDFdLmhhc2ggIT09IG9OZXdTdGF0ZS5oYXNoKSB7XG5cdFx0XHR0aGlzLl9vTWFuYWdlZEhpc3RvcnkucHVzaChvTmV3U3RhdGUpO1xuXHRcdH1cblxuXHRcdC8vIDYuIERldGVybWluZSB3aGljaCBhY3Rpb25zIHRvIGRvIG9uIHRoZSBoaXN0b3J5XG5cdFx0aWYgKGlQb3BDb3VudCA9PT0gMCkge1xuXHRcdFx0Ly8gTm8gc3RhdGUgd2FzIHBvcHBlZCAtLT4gYXBwZW5kXG5cdFx0XHRyZXR1cm4geyB0eXBlOiBcImFwcGVuZFwiIH07XG5cdFx0fSBlbHNlIGlmIChpUG9wQ291bnQgPT09IDEpIHtcblx0XHRcdC8vIE9ubHkgMSBzdGF0ZSB3YXMgcG9wcGVkIC0tPiByZXBsYWNlIGN1cnJlbnQgaGFzaCB1bmxlc3MgaGFzaCBpcyB0aGUgc2FtZSAodGhlbiBub3RoaW5nIHRvIGRvKVxuXHRcdFx0cmV0dXJuIGJIYXNTYW1lSGFzaCA/IHsgdHlwZTogXCJub25lXCIgfSA6IHsgdHlwZTogXCJyZXBsYWNlXCIgfTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gTW9yZSB0aGFuIDEgc3RhdGUgd2FzIHBvcHBlZCAtLT4gZ28gYmFrYyBpbiBoaXN0b3J5IGFuZCByZXBsYWNlIGhhc2ggaWYgbmVjZXNzYXJ5XG5cdFx0XHRyZXR1cm4gYkhhc1NhbWVIYXNoID8geyB0eXBlOiBcImJhY2tcIiwgc3RlcHM6IGlQb3BDb3VudCAtIDEgfSA6IHsgdHlwZTogXCJiYWNrLXJlcGxhY2VcIiwgc3RlcHM6IGlQb3BDb3VudCAtIDEgfTtcblx0XHR9XG5cdH1cblxuXHRfYmxvY2tpbmdOYXZpZ2F0aW9uRmlsdGVyKCkge1xuXHRcdHJldHVybiB0aGlzLl9iRGlzYWJsZU9uSGFzaENoYW5nZSA/IFwiQ3VzdG9tXCIgOiBcIkNvbnRpbnVlXCI7XG5cdH1cblxuXHQvKipcblx0ICogRGlzYWJsZSB0aGUgcm91dGluZyBieSBjYWxsaW5nIHRoZSByb3V0ZXIgc3RvcCBtZXRob2QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuUm91dGVyUHJveHlcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0X2Rpc2FibGVFdmVudE9uSGFzaENoYW5nZSgpIHtcblx0XHR0aGlzLl9iRGlzYWJsZU9uSGFzaENoYW5nZSA9IHRydWU7XG5cdFx0dGhpcy5fb1JvdXRlci5zdG9wKCk7XG5cdH1cblxuXHQvKipcblx0ICogRW5hYmxlIHRoZSByb3V0aW5nIGJ5IGNhbGxpbmcgdGhlIHJvdXRlciBpbml0aWFsaXplIG1ldGhvZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNhcC5mZS5jb3JlLlJvdXRlclByb3h5I19lbmFibGVFdmVudE9uSGFzaENoYW5nZVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuUm91dGVyUHJveHlcblx0ICogQHBhcmFtIFtiSWdub3JlQ3VycmVudEhhc2hdIElnbm9yZSB0aGUgbGFzdCBoYXNoIGV2ZW50IHRyaWdnZXJlZCBiZWZvcmUgdGhlIHJvdXRlciBoYXMgaW5pdGlhbGl6ZWRcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBmaW5hbFxuXHQgKi9cblx0X2VuYWJsZUV2ZW50T25IYXNoQ2hhbmdlKGJJZ25vcmVDdXJyZW50SGFzaDogYm9vbGVhbiB8IHVuZGVmaW5lZCkge1xuXHRcdHRoaXMuX2JEaXNhYmxlT25IYXNoQ2hhbmdlID0gZmFsc2U7XG5cdFx0dGhpcy5fb1JvdXRlci5pbml0aWFsaXplKGJJZ25vcmVDdXJyZW50SGFzaCk7XG5cdH1cblxuXHQvKipcblx0ICogU3luY2hyb25pemVzIHRoZSBicm93c2VyIGhpc3Rvcnkgd2l0aCB0aGUgaW50ZXJuYWwgaGlzdG9yeSBvZiB0aGUgcm91dGVyUHJveHksIGFuZCB0cmlnZ2VycyBhIG5hdmlnYXRpb24gaWYgbmVlZGVkLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLmNvcmUuUm91dGVyUHJveHlcblx0ICogQHBhcmFtIG9IaXN0b3J5QWN0aW9uIFNwZWNpZmllcyB0aGUgbmF2aWdhdGlvbiBhY3Rpb24gdG8gYmUgcGVyZm9ybWVkXG5cdCAqIEBwYXJhbSBiUmVidWlsZE9ubHkgYHRydWVgIGlmIGludGVybmFsIGhpc3RvcnkgaXMgY3VycmVudGx5IGJlaW5nIHJlYnVpbHRcblx0ICogQHJldHVybnMgUHJvbWlzZSAocmVzb2x2ZWQgd2hlbiB0aGUgbmF2aWdhdGlvbiBpcyBmaW5hbGl6ZWQpIHRoYXQgcmV0dXJucyAndHJ1ZScgaWYgYSBuYXZpZ2F0aW9uIHRvb2sgcGxhY2UsICdmYWxzZScgaWYgdGhlIG5hdmlnYXRpb24gZGlkbid0IGhhcHBlblxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQGZpbmFsXG5cdCAqL1xuXHRfcmVidWlsZEJyb3dzZXJIaXN0b3J5KG9IaXN0b3J5QWN0aW9uOiBhbnksIGJSZWJ1aWxkT25seTogYm9vbGVhbik6IFByb21pc2U8Ym9vbGVhbj4ge1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuXHRcdGNvbnN0IHRoYXQgPSB0aGlzO1xuXHRcdHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXHRcdFx0dGhpcy5iSXNSZWJ1aWxkSGlzdG9yeVJ1bm5pbmcgPSB0cnVlO1xuXHRcdFx0Y29uc3Qgb1RhcmdldFN0YXRlID0gdGhpcy5fb01hbmFnZWRIaXN0b3J5W3RoaXMuX29NYW5hZ2VkSGlzdG9yeS5sZW5ndGggLSAxXSxcblx0XHRcdFx0bmV3TGV2ZWwgPSB0aGlzLl9vTWFuYWdlZEhpc3RvcnkubGVuZ3RoIC0gMTtcblxuXHRcdFx0ZnVuY3Rpb24gcmVwbGFjZUFzeW5jKCkge1xuXHRcdFx0XHRpZiAoIWJSZWJ1aWxkT25seSkge1xuXHRcdFx0XHRcdHRoYXQuX2VuYWJsZUV2ZW50T25IYXNoQ2hhbmdlKHRydWUpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0KHRoYXQuX29Sb3V0ZXIuZ2V0SGFzaENoYW5nZXIoKS5yZXBsYWNlSGFzaCBhcyBhbnkpKG9UYXJnZXRTdGF0ZS5oYXNoKTtcblx0XHRcdFx0aGlzdG9yeS5yZXBsYWNlU3RhdGUoT2JqZWN0LmFzc2lnbih7IGZlTGV2ZWw6IG5ld0xldmVsIH0sIGhpc3Rvcnkuc3RhdGUpLCBcIlwiKTtcblxuXHRcdFx0XHRpZiAoYlJlYnVpbGRPbmx5KSB7XG5cdFx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHQvLyBUaW1lb3V0IHRvIGxldCAnaGFzaGNoYW5nZScgZXZlbnQgYmUgcHJvY2Vzc2VkIGJlZm9yZSBieSB0aGUgSGFzaENoYW5nZXIsIHNvIHRoYXRcblx0XHRcdFx0XHRcdC8vIG9uUm91dGVNYXRjaGVkIG5vdGlmaWNhdGlvbiBpc24ndCByYWlzZWRcblx0XHRcdFx0XHRcdHRoYXQuX2VuYWJsZUV2ZW50T25IYXNoQ2hhbmdlKHRydWUpO1xuXHRcdFx0XHRcdH0sIDApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dGhhdC5iSXNSZWJ1aWxkSGlzdG9yeVJ1bm5pbmcgPSBmYWxzZTtcblx0XHRcdFx0cmVzb2x2ZSh0cnVlKTsgLy8gYSBuYXZpZ2F0aW9uIG9jY3VycmVkXG5cdFx0XHR9XG5cblx0XHRcdC8vIEFzeW5jIGNhbGxiYWNrcyB3aGVuIG5hdmlnYXRpbmcgYmFjaywgaW4gb3JkZXIgdG8gbGV0IGFsbCBub3RpZmljYXRpb25zIGFuZCBldmVudHMgZ2V0IHByb2Nlc3NlZFxuXHRcdFx0ZnVuY3Rpb24gYmFja1JlcGxhY2VBc3luYygpIHtcblx0XHRcdFx0d2luZG93LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJwb3BzdGF0ZVwiLCBiYWNrUmVwbGFjZUFzeW5jKTtcblx0XHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Ly8gVGltZW91dCB0byBsZXQgJ2hhc2hjaGFuZ2UnIGV2ZW50IGJlIHByb2Nlc3NlZCBiZWZvcmUgYnkgdGhlIEhhc2hDaGFuZ2VyXG5cdFx0XHRcdFx0cmVwbGFjZUFzeW5jKCk7XG5cdFx0XHRcdH0sIDApO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBiYWNrQXN5bmMoKSB7XG5cdFx0XHRcdHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKFwicG9wc3RhdGVcIiwgYmFja0FzeW5jKTtcblx0XHRcdFx0dGhhdC5iSXNSZWJ1aWxkSGlzdG9yeVJ1bm5pbmcgPSBmYWxzZTtcblx0XHRcdFx0cmVzb2x2ZSh0cnVlKTsgLy8gYSBuYXZpZ2F0aW9uIG9jY3VycmVkXG5cdFx0XHR9XG5cblx0XHRcdHRoYXQuX2JJZ25vcmVSZXN0b3JlID0gdHJ1ZTtcblxuXHRcdFx0c3dpdGNoIChvSGlzdG9yeUFjdGlvbi50eXBlKSB7XG5cdFx0XHRcdGNhc2UgXCJyZXBsYWNlXCI6XG5cdFx0XHRcdFx0KHRoYXQuX29Sb3V0ZXIuZ2V0SGFzaENoYW5nZXIoKS5yZXBsYWNlSGFzaCBhcyBhbnkpKG9UYXJnZXRTdGF0ZS5oYXNoKTtcblx0XHRcdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZShPYmplY3QuYXNzaWduKHsgZmVMZXZlbDogbmV3TGV2ZWwgfSwgaGlzdG9yeS5zdGF0ZSksIFwiXCIpO1xuXHRcdFx0XHRcdHRoYXQuYklzUmVidWlsZEhpc3RvcnlSdW5uaW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0cmVzb2x2ZSh0cnVlKTsgLy8gYSBuYXZpZ2F0aW9uIG9jY3VycmVkXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcImFwcGVuZFwiOlxuXHRcdFx0XHRcdHRoYXQuX29Sb3V0ZXIuZ2V0SGFzaENoYW5nZXIoKS5zZXRIYXNoKG9UYXJnZXRTdGF0ZS5oYXNoKTtcblx0XHRcdFx0XHRoaXN0b3J5LnJlcGxhY2VTdGF0ZShPYmplY3QuYXNzaWduKHsgZmVMZXZlbDogbmV3TGV2ZWwgfSwgaGlzdG9yeS5zdGF0ZSksIFwiXCIpO1xuXHRcdFx0XHRcdHRoYXQuYklzUmVidWlsZEhpc3RvcnlSdW5uaW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0cmVzb2x2ZSh0cnVlKTsgLy8gYSBuYXZpZ2F0aW9uIG9jY3VycmVkXG5cdFx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdFx0Y2FzZSBcImJhY2tcIjpcblx0XHRcdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIGJhY2tBc3luYyk7XG5cdFx0XHRcdFx0aGlzdG9yeS5nbygtb0hpc3RvcnlBY3Rpb24uc3RlcHMpO1xuXHRcdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRcdGNhc2UgXCJiYWNrLXJlcGxhY2VcIjpcblx0XHRcdFx0XHR0aGlzLl9kaXNhYmxlRXZlbnRPbkhhc2hDaGFuZ2UoKTtcblx0XHRcdFx0XHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcInBvcHN0YXRlXCIsIGJhY2tSZXBsYWNlQXN5bmMpO1xuXHRcdFx0XHRcdGhpc3RvcnkuZ28oLW9IaXN0b3J5QWN0aW9uLnN0ZXBzKTtcblx0XHRcdFx0XHRicmVhaztcblxuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdC8vIE5vIG5hdmlnYXRpb25cblx0XHRcdFx0XHR0aGlzLmJJc1JlYnVpbGRIaXN0b3J5UnVubmluZyA9IGZhbHNlO1xuXHRcdFx0XHRcdHJlc29sdmUoZmFsc2UpOyAvLyBubyBuYXZpZ2F0aW9uIC0tPiByZXNvbHZlIHRvIGZhbHNlXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblxuXHRnZXRMYXN0SGlzdG9yeUVudHJ5KCkge1xuXHRcdHJldHVybiB0aGlzLl9vTWFuYWdlZEhpc3RvcnlbdGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCAtIDFdO1xuXHR9XG5cblx0c2V0UGF0aE1hcHBpbmcobWFwcGluZ3M6IHsgb2xkUGF0aDogc3RyaW5nOyBuZXdQYXRoOiBzdHJpbmcgfVtdKSB7XG5cdFx0dGhpcy5fcGF0aE1hcHBpbmdzID0gbWFwcGluZ3MuZmlsdGVyKChtYXBwaW5nKSA9PiB7XG5cdFx0XHRyZXR1cm4gbWFwcGluZy5vbGRQYXRoICE9PSBtYXBwaW5nLm5ld1BhdGg7XG5cdFx0fSk7XG5cdH1cblxuXHRoYXNoR3VhcmQoKSB7XG5cdFx0bGV0IHNIYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG5cblx0XHRpZiAoc0hhc2guaW5kZXhPZihcInJlc3RvcmVIaXN0b3J5PXRydWVcIikgIT09IC0xKSB7XG5cdFx0XHR0aGlzLl9iQXBwbHlSZXN0b3JlID0gdHJ1ZTtcblx0XHR9IGVsc2UgaWYgKCF0aGlzLmJJc1JlYnVpbGRIaXN0b3J5UnVubmluZykge1xuXHRcdFx0Ly8gQ2hlY2sgaWYgdGhlIGhhc2ggbmVlZHMgdG8gYmUgY2hhbmdlZCAodGhpcyBoYXBwZW5zIGluIEZDTCB3aGVuIHN3aXRjaGluZyBiL3cgZWRpdCBhbmQgcmVhZC1vbmx5IHdpdGggMyBjb2x1bW5zIG9wZW4pXG5cdFx0XHRjb25zdCBtYXBwaW5nID0gdGhpcy5fcGF0aE1hcHBpbmdzLmZpbmQoKG0pID0+IHtcblx0XHRcdFx0cmV0dXJuIHNIYXNoLmluZGV4T2YobS5vbGRQYXRoKSA+PSAwO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAobWFwcGluZykge1xuXHRcdFx0XHQvLyBSZXBsYWNlIHRoZSBjdXJyZW50IGhhc2hcblx0XHRcdFx0c0hhc2ggPSBzSGFzaC5yZXBsYWNlKG1hcHBpbmcub2xkUGF0aCwgbWFwcGluZy5uZXdQYXRoKTtcblx0XHRcdFx0aGlzdG9yeS5yZXBsYWNlU3RhdGUoT2JqZWN0LmFzc2lnbih7fSwgaGlzdG9yeS5zdGF0ZSksIFwiXCIsIHNIYXNoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGNvbnN0IGFIYXNoU3BsaXQgPSBzSGFzaC5zcGxpdChcIiYvXCIpO1xuXHRcdFx0XHRjb25zdCBzQXBwSGFzaCA9IGFIYXNoU3BsaXRbMV0gPyBhSGFzaFNwbGl0WzFdIDogXCJcIjtcblx0XHRcdFx0aWYgKHRoaXMuY2hlY2tIYXNoV2l0aEd1YXJkKHNBcHBIYXNoKSkge1xuXHRcdFx0XHRcdHRoaXMuX2JEZWxheWVkUmVidWlsZCA9IHRydWU7XG5cdFx0XHRcdFx0Y29uc3Qgb05ld1N0YXRlID0gdGhpcy5fZXh0cmFjdFN0YXRlRnJvbUhhc2goc0FwcEhhc2gpO1xuXHRcdFx0XHRcdHRoaXMuX3B1c2hOZXdTdGF0ZShvTmV3U3RhdGUsIGZhbHNlLCBmYWxzZSwgdHJ1ZSk7XG5cblx0XHRcdFx0XHRzZXRUaW1lb3V0KCgpID0+IHtcblx0XHRcdFx0XHRcdHRoaXMuX2JEZWxheWVkUmVidWlsZCA9IGZhbHNlO1xuXHRcdFx0XHRcdH0sIDApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENvbXBhcmVzIDIgc3RhdGVzLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gb1N0YXRlMVxuXHQgKiBAcGFyYW0ge29iamVjdH0gb1N0YXRlMlxuXHQgKiBAcmV0dXJucyB7bnVtYmVyfSBUaGUgcmVzdWx0IG9mIHRoZSBjb21wYXJpc29uOlxuXHQgKiAgICAgICAgLSBlbnVtU3RhdGUuRVFVQUwgaWYgb1N0YXRlMSBhbmQgb1N0YXRlMiBhcmUgZXF1YWxcblx0ICogICAgICAgIC0gZW51bVN0YXRlLkNPTVBBVElCTEUgaWYgb1N0YXRlMSBhbmQgb1N0YXRlMiBhcmUgY29tcGF0aWJsZVxuXHQgKiAgICAgICAgLSBlbnVtU3RhdGUuQU5DRVNUT1IgaWYgb1N0YXRlMSBpcyBhbiBhbmNlc3RvciBvZiBvU3RhdGUyXG5cdCAqICAgICAgICAtIGVudW1TdGF0ZS5ESUZGRVJFTlQgaWYgdGhlIDIgc3RhdGVzIGFyZSBkaWZmZXJlbnRcblx0ICovXG5cblx0X2NvbXBhcmVDYWNoZVN0YXRlcyhvU3RhdGUxOiBhbnksIG9TdGF0ZTI6IGFueSkge1xuXHRcdC8vIEZpcnN0IGNvbXBhcmUgb2JqZWN0IGtleXNcblx0XHRpZiAob1N0YXRlMS5rZXlzLmxlbmd0aCA+IG9TdGF0ZTIua2V5cy5sZW5ndGgpIHtcblx0XHRcdHJldHVybiBlbnVtU3RhdGUuRElGRkVSRU5UO1xuXHRcdH1cblx0XHRsZXQgZXF1YWwgPSB0cnVlO1xuXHRcdGxldCBpbmRleDtcblx0XHRmb3IgKGluZGV4ID0gMDsgZXF1YWwgJiYgaW5kZXggPCBvU3RhdGUxLmtleXMubGVuZ3RoOyBpbmRleCsrKSB7XG5cdFx0XHRpZiAob1N0YXRlMS5rZXlzW2luZGV4XSAhPT0gb1N0YXRlMi5rZXlzW2luZGV4XSkge1xuXHRcdFx0XHRlcXVhbCA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoIWVxdWFsKSB7XG5cdFx0XHQvLyBTb21lIG9iamVjdHMga2V5cyBhcmUgZGlmZmVyZW50XG5cdFx0XHRyZXR1cm4gZW51bVN0YXRlLkRJRkZFUkVOVDtcblx0XHR9XG5cblx0XHQvLyBBbGwga2V5cyBmcm9tIG9TdGF0ZTEgYXJlIGluIG9TdGF0ZTIgLS0+IGNoZWNrIGlmIGFuY2VzdG9yXG5cdFx0aWYgKG9TdGF0ZTEua2V5cy5sZW5ndGggPCBvU3RhdGUyLmtleXMubGVuZ3RoIHx8IG9TdGF0ZTEuc2NyZWVuTW9kZSA8IG9TdGF0ZTIuc2NyZWVuTW9kZSkge1xuXHRcdFx0cmV0dXJuIGVudW1TdGF0ZS5BTkNFU1RPUjtcblx0XHR9XG5cdFx0aWYgKG9TdGF0ZTEuc2NyZWVuTW9kZSA+IG9TdGF0ZTIuc2NyZWVuTW9kZSkge1xuXHRcdFx0cmV0dXJuIGVudW1TdGF0ZS5ESUZGRVJFTlQ7IC8vIE5vdCBzdXJlIHRoaXMgY2FzZSBjYW4gaGFwcGVuLi4uXG5cdFx0fVxuXG5cdFx0Ly8gQXQgdGhpcyBzdGFnZSwgdGhlIDIgc3RhdGVzIGhhdmUgdGhlIHNhbWUgb2JqZWN0IGtleXMgKGluIHRoZSBzYW1lIG9yZGVyKSBhbmQgc2FtZSBzY3JlZW5tb2RlXG5cdFx0Ly8gVGhleSBjYW4gYmUgZWl0aGVyIGNvbXBhdGlibGUgb3IgZXF1YWxcblx0XHRyZXR1cm4gb1N0YXRlMS5zTGF5b3V0ID09PSBvU3RhdGUyLnNMYXlvdXQgPyBlbnVtU3RhdGUuRVFVQUwgOiBlbnVtU3RhdGUuQ09NUEFUSUJMRTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgYmFjayBleGl0cyB0aGUgcHJlc2VudCBndWFyZCBzZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUHJlc2VudEhhc2ggVGhlIGN1cnJlbnQgaGFzaC4gT25seSB1c2VkIGZvciB1bml0IHRlc3RzLlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYmFjayBleGl0cyB0aGVyZSBpcyBhIGd1YXJkIGV4aXQgb24gYmFja1xuXHQgKi9cblx0Y2hlY2tJZkJhY2tJc091dE9mR3VhcmQoc1ByZXNlbnRIYXNoPzogc3RyaW5nKSB7XG5cdFx0bGV0IHNQcmV2SGFzaDtcblx0XHRsZXQgc0N1cnJlbnRIYXNoOiBzdHJpbmc7XG5cdFx0aWYgKHNQcmVzZW50SGFzaCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBXZSB1c2Ugd2luZG93LmxvY2F0aW9uLmhhc2ggaW5zdGVhZCBvZiBIYXNoQ2hhbmdlci5nZXRJbnN0YW5jZSgpLmdldEhhc2goKSBiZWNhdXNlIHRoZSBsYXR0ZXJcblx0XHRcdC8vIHJlcGxhY2VzIGNoYXJhY3RlcnMgaW4gdGhlIFVSTCAoZS5nLiAlMjQgcmVwbGFjZWQgYnkgJCkgYW5kIGl0IGNhdXNlcyBpc3N1ZXMgd2hlbiBjb21wYXJpbmdcblx0XHRcdC8vIHdpdGggdGhlIFVSTHMgaW4gdGhlIG1hbmFnZWQgaGlzdG9yeVxuXHRcdFx0Y29uc3Qgb1NwbGl0SGFzaCA9IHRoaXMuX29TaGVsbFNlcnZpY2VzLnNwbGl0SGFzaCh3aW5kb3cubG9jYXRpb24uaGFzaCkgYXMgYW55O1xuXHRcdFx0aWYgKG9TcGxpdEhhc2ggJiYgb1NwbGl0SGFzaC5hcHBTcGVjaWZpY1JvdXRlKSB7XG5cdFx0XHRcdHNDdXJyZW50SGFzaCA9IG9TcGxpdEhhc2guYXBwU3BlY2lmaWNSb3V0ZTtcblx0XHRcdFx0aWYgKHNDdXJyZW50SGFzaC5pbmRleE9mKFwiJi9cIikgPT09IDApIHtcblx0XHRcdFx0XHRzQ3VycmVudEhhc2ggPSBzQ3VycmVudEhhc2guc3Vic3RyaW5nKDIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzQ3VycmVudEhhc2ggPSB3aW5kb3cubG9jYXRpb24uaGFzaC5zdWJzdHJpbmcoMSk7IC8vIFRvIHJlbW92ZSB0aGUgJyMnXG5cdFx0XHRcdGlmIChzQ3VycmVudEhhc2hbMF0gPT09IFwiL1wiKSB7XG5cdFx0XHRcdFx0c0N1cnJlbnRIYXNoID0gc0N1cnJlbnRIYXNoLnN1YnN0cmluZygxKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzQ3VycmVudEhhc2ggPSBzUHJlc2VudEhhc2g7XG5cdFx0fVxuXHRcdHNQcmVzZW50SGFzaCA9IFVSSS5kZWNvZGUoc0N1cnJlbnRIYXNoKTtcblx0XHRpZiAodGhpcy5fb05hdmlnYXRpb25HdWFyZCkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IHRoaXMuX29NYW5hZ2VkSGlzdG9yeS5sZW5ndGggLSAxOyBpID4gMDsgaS0tKSB7XG5cdFx0XHRcdGlmICh0aGlzLl9vTWFuYWdlZEhpc3RvcnlbaV0uaGFzaCA9PT0gc1ByZXNlbnRIYXNoKSB7XG5cdFx0XHRcdFx0c1ByZXZIYXNoID0gdGhpcy5fb01hbmFnZWRIaXN0b3J5W2kgLSAxXS5oYXNoO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiAhc1ByZXZIYXNoIHx8ICF0aGlzLmNoZWNrSGFzaFdpdGhHdWFyZChzUHJldkhhc2gpO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBsYXN0IDIgZW50cmllcyBpbiB0aGUgaGlzdG9yeSBzaGFyZSB0aGUgc2FtZSBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhleSBzaGFyZSB0aGUgc2FtZSBjb250ZXh0LlxuXHQgKi9cblx0Y2hlY2tJZkJhY2tIYXNTYW1lQ29udGV4dCgpIHtcblx0XHRpZiAodGhpcy5fb01hbmFnZWRIaXN0b3J5Lmxlbmd0aCA8IDIpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBvQ3VycmVudFN0YXRlID0gdGhpcy5fb01hbmFnZWRIaXN0b3J5W3RoaXMuX29NYW5hZ2VkSGlzdG9yeS5sZW5ndGggLSAxXTtcblx0XHRjb25zdCBvUHJldmlvdXNTdGF0ZSA9IHRoaXMuX29NYW5hZ2VkSGlzdG9yeVt0aGlzLl9vTWFuYWdlZEhpc3RvcnkubGVuZ3RoIC0gMl07XG5cblx0XHRyZXR1cm4gb0N1cnJlbnRTdGF0ZS5oYXNoLnNwbGl0KFwiP1wiKVswXSA9PT0gb1ByZXZpb3VzU3RhdGUuaGFzaC5zcGxpdChcIj9cIilbMF07XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUm91dGVyUHJveHk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7O0VBVUEsSUFBTUEsU0FBUyxHQUFHO0lBQ2pCQyxLQUFLLEVBQUUsQ0FBQztJQUNSQyxVQUFVLEVBQUUsQ0FBQztJQUNiQyxRQUFRLEVBQUUsQ0FBQztJQUNYQyxTQUFTLEVBQUU7RUFDWixDQUFDO0VBQ0QsSUFBTUMsYUFBYSxHQUFHO0lBQ3JCQyxXQUFXLEVBQUUsUUFBUTtJQUNyQkMsY0FBYyxFQUFFO0VBQ2pCLENBQUM7O0VBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0MsbUJBQW1CLENBQUNDLFVBQWtCLEVBQUU7SUFDaEQsT0FBTztNQUNOQyxVQUFVLEVBQUVELFVBQVUsQ0FBQ0UsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUM7TUFBRTtNQUNqREMsS0FBSyxFQUFFLFVBQVVDLEtBQVUsRUFBRTtRQUM1QixPQUFPQSxLQUFLLENBQUNDLE9BQU8sQ0FBQyxJQUFJLENBQUNKLFVB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