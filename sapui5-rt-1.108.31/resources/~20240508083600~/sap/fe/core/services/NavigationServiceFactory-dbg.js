/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/navigation/NavigationHandler", "sap/ui/core/service/Service", "sap/ui/core/service/ServiceFactory"], function (NavigationHandler, Service, ServiceFactory) {
  "use strict";

  var _exports = {};
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  var NavigationService = /*#__PURE__*/function (_Service) {
    _inheritsLoose(NavigationService, _Service);
    function NavigationService() {
      return _Service.apply(this, arguments) || this;
    }
    _exports.NavigationService = NavigationService;
    var _proto = NavigationService.prototype;
    _proto.init = function init() {
      var oContext = this.getContext(),
        oComponent = oContext && oContext.scopeObject;
      this.oNavHandler = new NavigationHandler(oComponent);
      this.oNavHandler.setModel(oComponent.getModel());
      this.initPromise = Promise.resolve(this);
    };
    _proto.exit = function exit() {
      this.oNavHandler.destroy();
    }

    /**
     * Triggers a cross-app navigation after saving the inner and the cross-app states.
     *
     * @private
     * @ui5-restricted
     * @param sSemanticObject Semantic object of the target app
     * @param sActionName Action of the target app
     * @param [vNavigationParameters] Navigation parameters as an object with key/value pairs or as a string representation of
     *        such an object. If passed as an object, the properties are not checked against the <code>IsPotentialSensitive</code> or
     *        <code>Measure</code> type.
     * @param [oInnerAppData] Object for storing current state of the app
     * @param [fnOnError] Callback that is called if an error occurs during navigation <br>
     * @param [oExternalAppData] Object for storing the state which will be forwarded to the target component.
     * @param [sNavMode] Argument is used to overwrite the FLP-configured target for opening a URL. If used, only the
     *        <code>explace</code> or <code>inplace</code> values are allowed. Any other value will lead to an exception
     *        <code>NavigationHandler.INVALID_NAV_MODE</code>.
     */;
    _proto.navigate = function navigate(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError, oExternalAppData, sNavMode) {
      // TODO: Navigation Handler does not handle navigation without a context
      // but in v4 DataFieldForIBN with requiresContext false can trigger a navigation without any context
      // This should be handled
      this.oNavHandler.navigate(sSemanticObject, sActionName, vNavigationParameters, oInnerAppData, fnOnError, oExternalAppData, sNavMode);
    }
    /**
     * Parses the incoming URL and returns a Promise.
     *
     * @returns A Promise object which returns the
     * extracted app state, the startup parameters, and the type of navigation when execution is successful,
     * @private
     * @ui5-restricted
     */;
    _proto.parseNavigation = function parseNavigation() {
      return this.oNavHandler.parseNavigation();
    }
    /**
     * Processes navigation-related tasks related to beforePopoverOpens event handling for the SmartLink control and returns a Promise object.
     *
     * @param oTableEventParameters The parameters made available by the SmartTable control when the SmartLink control has been clicked,
     *        an instance of a PopOver object
     * @param sSelectionVariant Stringified JSON object as returned, for example, from getDataSuiteFormat() of the SmartFilterBar control
     * @param [mInnerAppData] Object containing the current state of the app. If provided, opening the Popover is deferred until the
     *        inner app data is saved in a consistent way.
     * @returns A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
     *          modified oTableEventParameters is returned; if an error occurs, an error object of type
     *          {@link sap.fe.navigation.NavError} is returned
     * @private
     */;
    _proto._processBeforeSmartLinkPopoverOpens = function _processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData) {
      return this.oNavHandler.processBeforeSmartLinkPopoverOpens(oTableEventParameters, sSelectionVariant, mInnerAppData);
    }

    /**
     * Processes selectionVariant string and returns a Promise object (semanticAttributes and AppStateKey).
     *
     * @param sSelectionVariant Stringified JSON object
     * @returns A Promise object to monitor when all actions of the function have been executed; if the execution is successful, the
     *          semanticAttributes as well as the appStateKey are returned; if an error occurs, an error object of type
     *          {@link sap.fe.navigation.NavError} is returned
     * <br>
     * @example <code>
     *
     * 		var oSelectionVariant = new sap.fe.navigation.SelectionVariant();
     * 		oSelectionVariant.addSelectOption("CompanyCode", "I", "EQ", "0001");
     * 		oSelectionVariant.addSelectOption("Customer", "I", "EQ", "C0001");
     * 		var sSelectionVariant= oSelectionVariant.toJSONString();
     *
     * 		var oNavigationHandler = new sap.fe.navigation.NavigationHandler(oController);
     * 		var oPromiseObject = oNavigationHandler._getAppStateKeyAndUrlParameters(sSelectionVariant);
     *
     * 		oPromiseObject.done(function(oSemanticAttributes, sAppStateKey){
     * 			// here you can add coding that should run after all app state and the semantic attributes have been returned.
     * 		});
     *
     * 		oPromiseObject.fail(function(oError){
     * 			//some error handling
     * 		});
     *
     * </code>
     * @private
     * @ui5-restricted
     */;
    _proto.getAppStateKeyAndUrlParameters = function getAppStateKeyAndUrlParameters(sSelectionVariant) {
      return this.oNavHandler._getAppStateKeyAndUrlParameters(sSelectionVariant);
    }

    /**
     * Gets the application specific technical parameters.
     *
     * @returns Containing the technical parameters.
     * @private
     * @ui5-restricted
     */;
    _proto.getTechnicalParameters = function getTechnicalParameters() {
      return this.oNavHandler.getTechnicalParameters();
    }
    /**
     * Sets the application specific technical parameters. Technical parameters will not be added to the selection variant passed to the
     * application.
     * As a default sap-system, sap-ushell-defaultedParameterNames and hcpApplicationId are considered as technical parameters.
     *
     * @param aTechnicalParameters List of parameter names to be considered as technical parameters. <code>null</code> or
     *        <code>undefined</code> may be used to reset the complete list.
     * @private
     * @ui5-restricted
     */;
    _proto.setTechnicalParameters = function setTechnicalParameters(aTechnicalParameters) {
      this.oNavHandler.setTechnicalParameters(aTechnicalParameters);
    }
    /**
     * Sets the model that is used for verification of sensitive information. If the model is not set, the unnamed component model is used for the
     * verification of sensitive information.
     *
     * @private
     * @ui5-restricted
     * @param oModel Model For checking sensitive information
     */;
    _proto.setModel = function setModel(oModel) {
      this.oNavHandler.setModel(oModel);
    }
    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @private
     * @ui5-restricted
     * @param mInnerAppData Object containing the current state of the app
     * @param {boolean} [bImmediateHashReplace=true] If set to false, the inner app hash will not be replaced until storing is successful; do not
     *        set to false if you cannot react to the resolution of the Promise, for example, when calling the beforeLinkPressed event
     * @param {boolean} [bSkipHashReplace=false] If set to true, the inner app hash will not be replaced in the storeInnerAppState. Also the bImmediateHashReplace
     * 		  will be ignored.
     * @returns A Promise object to monitor when all the actions of the function have been executed; if the execution is successful, the
     *          app state key is returned; if an error occurs, an object of type {@link sap.fe.navigation.NavError} is
     *          returned
     */;
    _proto.storeInnerAppStateAsync = function storeInnerAppStateAsync(mInnerAppData, bImmediateHashReplace, bSkipHashReplace) {
      return this.oNavHandler.storeInnerAppStateAsync(mInnerAppData, bImmediateHashReplace, bSkipHashReplace);
    }
    /**
     * Changes the URL according to the current app state and stores the app state for later retrieval.
     *
     * @private
     * @ui5-restricted
     * @param mInnerAppData Object containing the current state of the app
     * @param [bImmediateHashReplace=false] If set to false, the inner app hash will not be replaced until storing is successful; do not
     * @returns An object containing the appStateId and a promise object to monitor when all the actions of the function have been
     * executed; Please note that the appStateKey may be undefined or empty.
     */;
    _proto.storeInnerAppStateWithImmediateReturn = function storeInnerAppStateWithImmediateReturn(mInnerAppData, bImmediateHashReplace) {
      return this.oNavHandler.storeInnerAppStateWithImmediateReturn(mInnerAppData, bImmediateHashReplace);
    }
    /**
     * Changes the URL according to the current sAppStateKey. As an reaction route change event will be triggered.
     *
     * @private
     * @ui5-restricted
     * @param sAppStateKey The new app state key.
     */;
    _proto.replaceHash = function replaceHash(sAppStateKey) {
      this.oNavHandler.replaceHash(sAppStateKey);
    };
    _proto.replaceInnerAppStateKey = function replaceInnerAppStateKey(sAppHash, sAppStateKey) {
      return this.oNavHandler._replaceInnerAppStateKey(sAppHash, sAppStateKey);
    }
    /**
     * Get single values from SelectionVariant for url parameters.
     *
     * @private
     * @ui5-restricted
     * @param [vSelectionVariant]
     * @param [vSelectionVariant.oUrlParamaters]
     * @returns The url parameters
     */;
    _proto.getUrlParametersFromSelectionVariant = function getUrlParametersFromSelectionVariant(vSelectionVariant) {
      return this.oNavHandler._getURLParametersFromSelectionVariant(vSelectionVariant);
    }

    /**
     * Save app state and return immediately without waiting for response.
     *
     * @private
     * @ui5-restricted
     * @param oInSelectionVariant Instance of sap.fe.navigation.SelectionVariant
     * @returns AppState key
     */;
    _proto.saveAppStateWithImmediateReturn = function saveAppStateWithImmediateReturn(oInSelectionVariant) {
      if (oInSelectionVariant) {
        var sSelectionVariant = oInSelectionVariant.toJSONString(),
          // create an SV for app state in string format
          oSelectionVariant = JSON.parse(sSelectionVariant),
          // convert string into JSON to store in AppState
          oXAppStateObject = {
            selectionVariant: oSelectionVariant
          },
          oReturn = this.oNavHandler._saveAppStateWithImmediateReturn(oXAppStateObject);
        return oReturn !== null && oReturn !== void 0 && oReturn.appStateKey ? oReturn.appStateKey : "";
      }
    }

    /**
     * Mix Attributes and selectionVariant.
     *
     * @param vSemanticAttributes Object/(Array of Objects) containing key/value pairs
     * @param sSelectionVariant The selection variant in string format as provided by the SmartFilterBar control
     * @param [iSuppressionBehavior=sap.fe.navigation.SuppressionBehavior.standard] Indicates whether semantic
     *        attributes with special values (see {@link sap.fe.navigation.SuppressionBehavior suppression behavior}) must be
     *        suppressed before they are combined with the selection variant; several
     *        {@link sap.fe.navigation.SuppressionBehavior suppression behaviors} can be combined with the bitwise OR operator
     *        (|)
     * @returns Instance of {@link sap.fe.navigation.SelectionVariant}
     */;
    _proto.mixAttributesAndSelectionVariant = function mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant, iSuppressionBehavior) {
      return this.oNavHandler.mixAttributesAndSelectionVariant(vSemanticAttributes, sSelectionVariant, iSuppressionBehavior);
    }

    /**
     * The method creates a context url based on provided data. This context url can either be used as.
     *
     * @param sEntitySetName Used for url determination
     * @param [oModel] The ODataModel used for url determination. If omitted, the NavigationHandler model is used.
     * @returns The context url for the given entities
     */;
    _proto.constructContextUrl = function constructContextUrl(sEntitySetName, oModel) {
      return this.oNavHandler.constructContextUrl(sEntitySetName, oModel);
    };
    _proto.getInterface = function getInterface() {
      return this;
    };
    return NavigationService;
  }(Service);
  _exports.NavigationService = NavigationService;
  function fnGetEmptyObject() {
    return {};
  }
  function fnGetPromise() {
    return Promise.resolve({});
  }
  function fnGetJQueryPromise() {
    var oMyDeffered = jQuery.Deferred();
    oMyDeffered.resolve({}, {}, "initial");
    return oMyDeffered.promise();
  }
  function fnGetEmptyString() {
    return "";
  }
  var NavigationServicesMock = /*#__PURE__*/function () {
    function NavigationServicesMock() {
      this.createEmptyAppState = fnGetEmptyObject;
      this.storeInnerAppStateWithImmediateReturn = fnGetEmptyObject;
      this.mixAttributesAndSelectionVariant = fnGetEmptyObject;
      this.getAppState = fnGetPromise;
      this.getStartupAppState = fnGetPromise;
      this.parseNavigation = fnGetJQueryPromise;
      this.constructContextUrl = fnGetEmptyString;
      this.initPromise = Promise.resolve(this);
    }
    _exports.NavigationServicesMock = NavigationServicesMock;
    var _proto2 = NavigationServicesMock.prototype;
    _proto2.getInterface = function getInterface() {
      return this;
    }

    // return empty object
    ;
    _proto2.replaceInnerAppStateKey = function replaceInnerAppStateKey(sAppHash) {
      return sAppHash ? sAppHash : "";
    };
    _proto2.navigate = function navigate() {
      // Don't do anything
    };
    return NavigationServicesMock;
  }();
  _exports.NavigationServicesMock = NavigationServicesMock;
  var NavigationServiceFactory = /*#__PURE__*/function (_ServiceFactory) {
    _inheritsLoose(NavigationServiceFactory, _ServiceFactory);
    function NavigationServiceFactory() {
      return _ServiceFactory.apply(this, arguments) || this;
    }
    var _proto3 = NavigationServiceFactory.prototype;
    _proto3.createInstance = function createInstance(oServiceContext) {
      var oNavigationService = sap.ushell && sap.ushell.Container ? new NavigationService(oServiceContext) : new NavigationServicesMock();
      // Wait For init
      return oNavigationService.initPromise.then(function (oService) {
        return oService;
      });
    };
    return NavigationServiceFactory;
  }(ServiceFactory);
  return NavigationServiceFactory;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJOYXZpZ2F0aW9uU2VydmljZSIsImluaXQiLCJvQ29udGV4dCIsImdldENvbnRleHQiLCJvQ29tcG9uZW50Iiwic2NvcGVPYmplY3QiLCJvTmF2SGFuZGxlciIsIk5hdmlnYXRpb25IYW5kbGVyIiwic2V0TW9kZWwiLCJnZXRNb2RlbCIsImluaXRQcm9taXNlIiwiUHJvbWlzZSIsInJlc29sdmUiLCJleGl0IiwiZGVzdHJveSIsIm5hdmlnYXRlIiwic1NlbWFudGljT2JqZWN0Iiwic0FjdGlvbk5hbWUiLCJ2TmF2aWdhdGlvblBhcmFtZXRlcnMiLCJvSW5uZXJBcHBEYXRhIiwiZm5PbkVycm9yIiwib0V4dGVybmFsQXBwRGF0YSIsInNOYXZNb2RlIiwicGFyc2VOYXZpZ2F0aW9uIiwiX3Byb2Nlc3NCZWZvcmVTbWFydExpbmtQb3BvdmVyT3BlbnMiLCJvVGFibGVFdmVudFBhcmFtZXRlcnMiLCJzU2VsZWN0aW9uVmFyaWFudCIsIm1Jbm5lckFwcERhdGEiLCJwcm9jZXNzQmVmb3JlU21hcnRMaW5rUG9wb3Zlck9wZW5zIiwiZ2V0QXBwU3RhdGVLZXlBbmRVcmxQYXJhbWV0ZXJzIiwiX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyIsImdldFRlY2huaWNhbFBhcmFtZXRlcnMiLCJzZXRUZWNobmljYWxQYXJhbWV0ZXJzIiwiYVRlY2huaWNhbFBhcmFtZXRlcnMiLCJvTW9kZWwiLCJzdG9yZUlubmVyQXBwU3RhdGVBc3luYyIsImJJbW1lZGlhdGVIYXNoUmVwbGFjZSIsImJTa2lwSGFzaFJlcGxhY2UiLCJzdG9yZUlubmVyQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuIiwicmVwbGFjZUhhc2giLCJzQXBwU3RhdGVLZXkiLCJyZXBsYWNlSW5uZXJBcHBTdGF0ZUtleSIsInNBcHBIYXNoIiwiX3JlcGxhY2VJbm5lckFwcFN0YXRlS2V5IiwiZ2V0VXJsUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50IiwidlNlbGVjdGlvblZhcmlhbnQiLCJfZ2V0VVJMUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50Iiwic2F2ZUFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybiIsIm9JblNlbGVjdGlvblZhcmlhbnQiLCJ0b0pTT05TdHJpbmciLCJvU2VsZWN0aW9uVmFyaWFudCIsIkpTT04iLCJwYXJzZSIsIm9YQXBwU3RhdGVPYmplY3QiLCJzZWxlY3Rpb25WYXJpYW50Iiwib1JldHVybiIsIl9zYXZlQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuIiwiYXBwU3RhdGVLZXkiLCJtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCIsInZTZW1hbnRpY0F0dHJpYnV0ZXMiLCJpU3VwcHJlc3Npb25CZWhhdmlvciIsImNvbnN0cnVjdENvbnRleHRVcmwiLCJzRW50aXR5U2V0TmFtZSIsImdldEludGVyZmFjZSIsIlNlcnZpY2UiLCJmbkdldEVtcHR5T2JqZWN0IiwiZm5HZXRQcm9taXNlIiwiZm5HZXRKUXVlcnlQcm9taXNlIiwib015RGVmZmVyZWQiLCJqUXVlcnkiLCJEZWZlcnJlZCIsInByb21pc2UiLCJmbkdldEVtcHR5U3RyaW5nIiwiTmF2aWdhdGlvblNlcnZpY2VzTW9jayIsImNyZWF0ZUVtcHR5QXBwU3RhdGUiLCJnZXRBcHBTdGF0ZSIsImdldFN0YXJ0dXBBcHBTdGF0ZSIsIk5hdmlnYXRpb25TZXJ2aWNlRmFjdG9yeSIsImNyZWF0ZUluc3RhbmNlIiwib1NlcnZpY2VDb250ZXh0Iiwib05hdmlnYXRpb25TZXJ2aWNlIiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwidGhlbiIsIm9TZXJ2aWNlIiwiU2VydmljZUZhY3RvcnkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk5hdmlnYXRpb25TZXJ2aWNlRmFjdG9yeS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBOYXZpZ2F0aW9uSGFuZGxlciB9IGZyb20gXCJzYXAvZmUvbmF2aWdhdGlvblwiO1xuaW1wb3J0IHR5cGUgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IFNlcnZpY2UgZnJvbSBcInNhcC91aS9jb3JlL3NlcnZpY2UvU2VydmljZVwiO1xuaW1wb3J0IFNlcnZpY2VGYWN0b3J5IGZyb20gXCJzYXAvdWkvY29yZS9zZXJ2aWNlL1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgdHlwZSB7IFNlcnZpY2VDb250ZXh0IH0gZnJvbSBcInR5cGVzL2V4dGVuc2lvbl90eXBlc1wiO1xuXG50eXBlIE5hdmlnYXRpb25TZXJ2aWNlU2V0dGluZ3MgPSB7fTtcbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uU2VydmljZSBleHRlbmRzIFNlcnZpY2U8TmF2aWdhdGlvblNlcnZpY2VTZXR0aW5ncz4ge1xuXHRpbml0UHJvbWlzZSE6IFByb21pc2U8YW55Pjtcblx0b05hdkhhbmRsZXIhOiBOYXZpZ2F0aW9uSGFuZGxlcjtcblx0aW5pdCgpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IHRoaXMuZ2V0Q29udGV4dCgpLFxuXHRcdFx0b0NvbXBvbmVudCA9IG9Db250ZXh0ICYmIG9Db250ZXh0LnNjb3BlT2JqZWN0O1xuXG5cdFx0dGhpcy5vTmF2SGFuZGxlciA9IG5ldyBOYXZpZ2F0aW9uSGFuZGxlcihvQ29tcG9uZW50KTtcblx0XHR0aGlzLm9OYXZIYW5kbGVyLnNldE1vZGVsKG9Db21wb25lbnQuZ2V0TW9kZWwoKSk7XG5cdFx0dGhpcy5pbml0UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh0aGlzKTtcblx0fVxuXHRleGl0KCkge1xuXHRcdHRoaXMub05hdkhhbmRsZXIuZGVzdHJveSgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIGEgY3Jvc3MtYXBwIG5hdmlnYXRpb24gYWZ0ZXIgc2F2aW5nIHRoZSBpbm5lciBhbmQgdGhlIGNyb3NzLWFwcCBzdGF0ZXMuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gc1NlbWFudGljT2JqZWN0IFNlbWFudGljIG9iamVjdCBvZiB0aGUgdGFyZ2V0IGFwcFxuXHQgKiBAcGFyYW0gc0FjdGlvbk5hbWUgQWN0aW9uIG9mIHRoZSB0YXJnZXQgYXBwXG5cdCAqIEBwYXJhbSBbdk5hdmlnYXRpb25QYXJhbWV0ZXJzXSBOYXZpZ2F0aW9uIHBhcmFtZXRlcnMgYXMgYW4gb2JqZWN0IHdpdGgga2V5L3ZhbHVlIHBhaXJzIG9yIGFzIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mXG5cdCAqICAgICAgICBzdWNoIGFuIG9iamVjdC4gSWYgcGFzc2VkIGFzIGFuIG9iamVjdCwgdGhlIHByb3BlcnRpZXMgYXJlIG5vdCBjaGVja2VkIGFnYWluc3QgdGhlIDxjb2RlPklzUG90ZW50aWFsU2Vuc2l0aXZlPC9jb2RlPiBvclxuXHQgKiAgICAgICAgPGNvZGU+TWVhc3VyZTwvY29kZT4gdHlwZS5cblx0ICogQHBhcmFtIFtvSW5uZXJBcHBEYXRhXSBPYmplY3QgZm9yIHN0b3JpbmcgY3VycmVudCBzdGF0ZSBvZiB0aGUgYXBwXG5cdCAqIEBwYXJhbSBbZm5PbkVycm9yXSBDYWxsYmFjayB0aGF0IGlzIGNhbGxlZCBpZiBhbiBlcnJvciBvY2N1cnMgZHVyaW5nIG5hdmlnYXRpb24gPGJyPlxuXHQgKiBAcGFyYW0gW29FeHRlcm5hbEFwcERhdGFdIE9iamVjdCBmb3Igc3RvcmluZyB0aGUgc3RhdGUgd2hpY2ggd2lsbCBiZSBmb3J3YXJkZWQgdG8gdGhlIHRhcmdldCBjb21wb25lbnQuXG5cdCAqIEBwYXJhbSBbc05hdk1vZGVdIEFyZ3VtZW50IGlzIHVzZWQgdG8gb3ZlcndyaXRlIHRoZSBGTFAtY29uZmlndXJlZCB0YXJnZXQgZm9yIG9wZW5pbmcgYSBVUkwuIElmIHVzZWQsIG9ubHkgdGhlXG5cdCAqICAgICAgICA8Y29kZT5leHBsYWNlPC9jb2RlPiBvciA8Y29kZT5pbnBsYWNlPC9jb2RlPiB2YWx1ZXMgYXJlIGFsbG93ZWQuIEFueSBvdGhlciB2YWx1ZSB3aWxsIGxlYWQgdG8gYW4gZXhjZXB0aW9uXG5cdCAqICAgICAgICA8Y29kZT5OYXZpZ2F0aW9uSGFuZGxlci5JTlZBTElEX05BVl9NT0RFPC9jb2RlPi5cblx0ICovXG5cdG5hdmlnYXRlKFxuXHRcdHNTZW1hbnRpY09iamVjdDogc3RyaW5nLFxuXHRcdHNBY3Rpb25OYW1lOiBzdHJpbmcsXG5cdFx0dk5hdmlnYXRpb25QYXJhbWV0ZXJzPzogc3RyaW5nIHwgb2JqZWN0LFxuXHRcdG9Jbm5lckFwcERhdGE/OiBvYmplY3QsXG5cdFx0Zm5PbkVycm9yPzogRnVuY3Rpb24sXG5cdFx0b0V4dGVybmFsQXBwRGF0YT86IGFueSxcblx0XHRzTmF2TW9kZT86IHN0cmluZ1xuXHQpIHtcblx0XHQvLyBUT0RPOiBOYXZpZ2F0aW9uIEhhbmRsZXIgZG9lcyBub3QgaGFuZGxlIG5hdmlnYXRpb24gd2l0aG91dCBhIGNvbnRleHRcblx0XHQvLyBidXQgaW4gdjQgRGF0YUZpZWxkRm9ySUJOIHdpdGggcmVxdWlyZXNDb250ZXh0IGZhbHNlIGNhbiB0cmlnZ2VyIGEgbmF2aWdhdGlvbiB3aXRob3V0IGFueSBjb250ZXh0XG5cdFx0Ly8gVGhpcyBzaG91bGQgYmUgaGFuZGxlZFxuXHRcdHRoaXMub05hdkhhbmRsZXIubmF2aWdhdGUoXG5cdFx0XHRzU2VtYW50aWNPYmplY3QsXG5cdFx0XHRzQWN0aW9uTmFtZSxcblx0XHRcdHZOYXZpZ2F0aW9uUGFyYW1ldGVycyxcblx0XHRcdG9Jbm5lckFwcERhdGEsXG5cdFx0XHRmbk9uRXJyb3IsXG5cdFx0XHRvRXh0ZXJuYWxBcHBEYXRhLFxuXHRcdFx0c05hdk1vZGVcblx0XHQpO1xuXHR9XG5cdC8qKlxuXHQgKiBQYXJzZXMgdGhlIGluY29taW5nIFVSTCBhbmQgcmV0dXJucyBhIFByb21pc2UuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBvYmplY3Qgd2hpY2ggcmV0dXJucyB0aGVcblx0ICogZXh0cmFjdGVkIGFwcCBzdGF0ZSwgdGhlIHN0YXJ0dXAgcGFyYW1ldGVycywgYW5kIHRoZSB0eXBlIG9mIG5hdmlnYXRpb24gd2hlbiBleGVjdXRpb24gaXMgc3VjY2Vzc2Z1bCxcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRwYXJzZU5hdmlnYXRpb24oKSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIucGFyc2VOYXZpZ2F0aW9uKCk7XG5cdH1cblx0LyoqXG5cdCAqIFByb2Nlc3NlcyBuYXZpZ2F0aW9uLXJlbGF0ZWQgdGFza3MgcmVsYXRlZCB0byBiZWZvcmVQb3BvdmVyT3BlbnMgZXZlbnQgaGFuZGxpbmcgZm9yIHRoZSBTbWFydExpbmsgY29udHJvbCBhbmQgcmV0dXJucyBhIFByb21pc2Ugb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RhYmxlRXZlbnRQYXJhbWV0ZXJzIFRoZSBwYXJhbWV0ZXJzIG1hZGUgYXZhaWxhYmxlIGJ5IHRoZSBTbWFydFRhYmxlIGNvbnRyb2wgd2hlbiB0aGUgU21hcnRMaW5rIGNvbnRyb2wgaGFzIGJlZW4gY2xpY2tlZCxcblx0ICogICAgICAgIGFuIGluc3RhbmNlIG9mIGEgUG9wT3ZlciBvYmplY3Rcblx0ICogQHBhcmFtIHNTZWxlY3Rpb25WYXJpYW50IFN0cmluZ2lmaWVkIEpTT04gb2JqZWN0IGFzIHJldHVybmVkLCBmb3IgZXhhbXBsZSwgZnJvbSBnZXREYXRhU3VpdGVGb3JtYXQoKSBvZiB0aGUgU21hcnRGaWx0ZXJCYXIgY29udHJvbFxuXHQgKiBAcGFyYW0gW21Jbm5lckFwcERhdGFdIE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHAuIElmIHByb3ZpZGVkLCBvcGVuaW5nIHRoZSBQb3BvdmVyIGlzIGRlZmVycmVkIHVudGlsIHRoZVxuXHQgKiAgICAgICAgaW5uZXIgYXBwIGRhdGEgaXMgc2F2ZWQgaW4gYSBjb25zaXN0ZW50IHdheS5cblx0ICogQHJldHVybnMgQSBQcm9taXNlIG9iamVjdCB0byBtb25pdG9yIHdoZW4gYWxsIGFjdGlvbnMgb2YgdGhlIGZ1bmN0aW9uIGhhdmUgYmVlbiBleGVjdXRlZDsgaWYgdGhlIGV4ZWN1dGlvbiBpcyBzdWNjZXNzZnVsLCB0aGVcblx0ICogICAgICAgICAgbW9kaWZpZWQgb1RhYmxlRXZlbnRQYXJhbWV0ZXJzIGlzIHJldHVybmVkOyBpZiBhbiBlcnJvciBvY2N1cnMsIGFuIGVycm9yIG9iamVjdCBvZiB0eXBlXG5cdCAqICAgICAgICAgIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5OYXZFcnJvcn0gaXMgcmV0dXJuZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9wcm9jZXNzQmVmb3JlU21hcnRMaW5rUG9wb3Zlck9wZW5zKG9UYWJsZUV2ZW50UGFyYW1ldGVyczogb2JqZWN0LCBzU2VsZWN0aW9uVmFyaWFudDogc3RyaW5nLCBtSW5uZXJBcHBEYXRhOiBvYmplY3QgfCB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gdGhpcy5vTmF2SGFuZGxlci5wcm9jZXNzQmVmb3JlU21hcnRMaW5rUG9wb3Zlck9wZW5zKG9UYWJsZUV2ZW50UGFyYW1ldGVycywgc1NlbGVjdGlvblZhcmlhbnQsIG1Jbm5lckFwcERhdGEpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFByb2Nlc3NlcyBzZWxlY3Rpb25WYXJpYW50IHN0cmluZyBhbmQgcmV0dXJucyBhIFByb21pc2Ugb2JqZWN0IChzZW1hbnRpY0F0dHJpYnV0ZXMgYW5kIEFwcFN0YXRlS2V5KS5cblx0ICpcblx0ICogQHBhcmFtIHNTZWxlY3Rpb25WYXJpYW50IFN0cmluZ2lmaWVkIEpTT04gb2JqZWN0XG5cdCAqIEByZXR1cm5zIEEgUHJvbWlzZSBvYmplY3QgdG8gbW9uaXRvciB3aGVuIGFsbCBhY3Rpb25zIG9mIHRoZSBmdW5jdGlvbiBoYXZlIGJlZW4gZXhlY3V0ZWQ7IGlmIHRoZSBleGVjdXRpb24gaXMgc3VjY2Vzc2Z1bCwgdGhlXG5cdCAqICAgICAgICAgIHNlbWFudGljQXR0cmlidXRlcyBhcyB3ZWxsIGFzIHRoZSBhcHBTdGF0ZUtleSBhcmUgcmV0dXJuZWQ7IGlmIGFuIGVycm9yIG9jY3VycywgYW4gZXJyb3Igb2JqZWN0IG9mIHR5cGVcblx0ICogICAgICAgICAge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLk5hdkVycm9yfSBpcyByZXR1cm5lZFxuXHQgKiA8YnI+XG5cdCAqIEBleGFtcGxlIDxjb2RlPlxuXHQgKlxuXHQgKiBcdFx0dmFyIG9TZWxlY3Rpb25WYXJpYW50ID0gbmV3IHNhcC5mZS5uYXZpZ2F0aW9uLlNlbGVjdGlvblZhcmlhbnQoKTtcblx0ICogXHRcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcIkNvbXBhbnlDb2RlXCIsIFwiSVwiLCBcIkVRXCIsIFwiMDAwMVwiKTtcblx0ICogXHRcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihcIkN1c3RvbWVyXCIsIFwiSVwiLCBcIkVRXCIsIFwiQzAwMDFcIik7XG5cdCAqIFx0XHR2YXIgc1NlbGVjdGlvblZhcmlhbnQ9IG9TZWxlY3Rpb25WYXJpYW50LnRvSlNPTlN0cmluZygpO1xuXHQgKlxuXHQgKiBcdFx0dmFyIG9OYXZpZ2F0aW9uSGFuZGxlciA9IG5ldyBzYXAuZmUubmF2aWdhdGlvbi5OYXZpZ2F0aW9uSGFuZGxlcihvQ29udHJvbGxlcik7XG5cdCAqIFx0XHR2YXIgb1Byb21pc2VPYmplY3QgPSBvTmF2aWdhdGlvbkhhbmRsZXIuX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyhzU2VsZWN0aW9uVmFyaWFudCk7XG5cdCAqXG5cdCAqIFx0XHRvUHJvbWlzZU9iamVjdC5kb25lKGZ1bmN0aW9uKG9TZW1hbnRpY0F0dHJpYnV0ZXMsIHNBcHBTdGF0ZUtleSl7XG5cdCAqIFx0XHRcdC8vIGhlcmUgeW91IGNhbiBhZGQgY29kaW5nIHRoYXQgc2hvdWxkIHJ1biBhZnRlciBhbGwgYXBwIHN0YXRlIGFuZCB0aGUgc2VtYW50aWMgYXR0cmlidXRlcyBoYXZlIGJlZW4gcmV0dXJuZWQuXG5cdCAqIFx0XHR9KTtcblx0ICpcblx0ICogXHRcdG9Qcm9taXNlT2JqZWN0LmZhaWwoZnVuY3Rpb24ob0Vycm9yKXtcblx0ICogXHRcdFx0Ly9zb21lIGVycm9yIGhhbmRsaW5nXG5cdCAqIFx0XHR9KTtcblx0ICpcblx0ICogPC9jb2RlPlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGdldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyhzU2VsZWN0aW9uVmFyaWFudDogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIuX2dldEFwcFN0YXRlS2V5QW5kVXJsUGFyYW1ldGVycyhzU2VsZWN0aW9uVmFyaWFudCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0cyB0aGUgYXBwbGljYXRpb24gc3BlY2lmaWMgdGVjaG5pY2FsIHBhcmFtZXRlcnMuXG5cdCAqXG5cdCAqIEByZXR1cm5zIENvbnRhaW5pbmcgdGhlIHRlY2huaWNhbCBwYXJhbWV0ZXJzLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGdldFRlY2huaWNhbFBhcmFtZXRlcnMoKSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIuZ2V0VGVjaG5pY2FsUGFyYW1ldGVycygpO1xuXHR9XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBhcHBsaWNhdGlvbiBzcGVjaWZpYyB0ZWNobmljYWwgcGFyYW1ldGVycy4gVGVjaG5pY2FsIHBhcmFtZXRlcnMgd2lsbCBub3QgYmUgYWRkZWQgdG8gdGhlIHNlbGVjdGlvbiB2YXJpYW50IHBhc3NlZCB0byB0aGVcblx0ICogYXBwbGljYXRpb24uXG5cdCAqIEFzIGEgZGVmYXVsdCBzYXAtc3lzdGVtLCBzYXAtdXNoZWxsLWRlZmF1bHRlZFBhcmFtZXRlck5hbWVzIGFuZCBoY3BBcHBsaWNhdGlvbklkIGFyZSBjb25zaWRlcmVkIGFzIHRlY2huaWNhbCBwYXJhbWV0ZXJzLlxuXHQgKlxuXHQgKiBAcGFyYW0gYVRlY2huaWNhbFBhcmFtZXRlcnMgTGlzdCBvZiBwYXJhbWV0ZXIgbmFtZXMgdG8gYmUgY29uc2lkZXJlZCBhcyB0ZWNobmljYWwgcGFyYW1ldGVycy4gPGNvZGU+bnVsbDwvY29kZT4gb3Jcblx0ICogICAgICAgIDxjb2RlPnVuZGVmaW5lZDwvY29kZT4gbWF5IGJlIHVzZWQgdG8gcmVzZXQgdGhlIGNvbXBsZXRlIGxpc3QuXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0c2V0VGVjaG5pY2FsUGFyYW1ldGVycyhhVGVjaG5pY2FsUGFyYW1ldGVyczogYW55W10pIHtcblx0XHR0aGlzLm9OYXZIYW5kbGVyLnNldFRlY2huaWNhbFBhcmFtZXRlcnMoYVRlY2huaWNhbFBhcmFtZXRlcnMpO1xuXHR9XG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBtb2RlbCB0aGF0IGlzIHVzZWQgZm9yIHZlcmlmaWNhdGlvbiBvZiBzZW5zaXRpdmUgaW5mb3JtYXRpb24uIElmIHRoZSBtb2RlbCBpcyBub3Qgc2V0LCB0aGUgdW5uYW1lZCBjb21wb25lbnQgbW9kZWwgaXMgdXNlZCBmb3IgdGhlXG5cdCAqIHZlcmlmaWNhdGlvbiBvZiBzZW5zaXRpdmUgaW5mb3JtYXRpb24uXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb01vZGVsIE1vZGVsIEZvciBjaGVja2luZyBzZW5zaXRpdmUgaW5mb3JtYXRpb25cblx0ICovXG5cdHNldE1vZGVsKG9Nb2RlbDogYW55KSB7XG5cdFx0dGhpcy5vTmF2SGFuZGxlci5zZXRNb2RlbChvTW9kZWwpO1xuXHR9XG5cdC8qKlxuXHQgKiBDaGFuZ2VzIHRoZSBVUkwgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IGFwcCBzdGF0ZSBhbmQgc3RvcmVzIHRoZSBhcHAgc3RhdGUgZm9yIGxhdGVyIHJldHJpZXZhbC5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBtSW5uZXJBcHBEYXRhIE9iamVjdCBjb250YWluaW5nIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBhcHBcblx0ICogQHBhcmFtIHtib29sZWFufSBbYkltbWVkaWF0ZUhhc2hSZXBsYWNlPXRydWVdIElmIHNldCB0byBmYWxzZSwgdGhlIGlubmVyIGFwcCBoYXNoIHdpbGwgbm90IGJlIHJlcGxhY2VkIHVudGlsIHN0b3JpbmcgaXMgc3VjY2Vzc2Z1bDsgZG8gbm90XG5cdCAqICAgICAgICBzZXQgdG8gZmFsc2UgaWYgeW91IGNhbm5vdCByZWFjdCB0byB0aGUgcmVzb2x1dGlvbiBvZiB0aGUgUHJvbWlzZSwgZm9yIGV4YW1wbGUsIHdoZW4gY2FsbGluZyB0aGUgYmVmb3JlTGlua1ByZXNzZWQgZXZlbnRcblx0ICogQHBhcmFtIHtib29sZWFufSBbYlNraXBIYXNoUmVwbGFjZT1mYWxzZV0gSWYgc2V0IHRvIHRydWUsIHRoZSBpbm5lciBhcHAgaGFzaCB3aWxsIG5vdCBiZSByZXBsYWNlZCBpbiB0aGUgc3RvcmVJbm5lckFwcFN0YXRlLiBBbHNvIHRoZSBiSW1tZWRpYXRlSGFzaFJlcGxhY2Vcblx0ICogXHRcdCAgd2lsbCBiZSBpZ25vcmVkLlxuXHQgKiBAcmV0dXJucyBBIFByb21pc2Ugb2JqZWN0IHRvIG1vbml0b3Igd2hlbiBhbGwgdGhlIGFjdGlvbnMgb2YgdGhlIGZ1bmN0aW9uIGhhdmUgYmVlbiBleGVjdXRlZDsgaWYgdGhlIGV4ZWN1dGlvbiBpcyBzdWNjZXNzZnVsLCB0aGVcblx0ICogICAgICAgICAgYXBwIHN0YXRlIGtleSBpcyByZXR1cm5lZDsgaWYgYW4gZXJyb3Igb2NjdXJzLCBhbiBvYmplY3Qgb2YgdHlwZSB7QGxpbmsgc2FwLmZlLm5hdmlnYXRpb24uTmF2RXJyb3J9IGlzXG5cdCAqICAgICAgICAgIHJldHVybmVkXG5cdCAqL1xuXHRzdG9yZUlubmVyQXBwU3RhdGVBc3luYyhtSW5uZXJBcHBEYXRhOiBhbnksIGJJbW1lZGlhdGVIYXNoUmVwbGFjZT86IGJvb2xlYW4gfCB1bmRlZmluZWQsIGJTa2lwSGFzaFJlcGxhY2U/OiBib29sZWFuIHwgdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIuc3RvcmVJbm5lckFwcFN0YXRlQXN5bmMobUlubmVyQXBwRGF0YSwgYkltbWVkaWF0ZUhhc2hSZXBsYWNlLCBiU2tpcEhhc2hSZXBsYWNlKTtcblx0fVxuXHQvKipcblx0ICogQ2hhbmdlcyB0aGUgVVJMIGFjY29yZGluZyB0byB0aGUgY3VycmVudCBhcHAgc3RhdGUgYW5kIHN0b3JlcyB0aGUgYXBwIHN0YXRlIGZvciBsYXRlciByZXRyaWV2YWwuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gbUlubmVyQXBwRGF0YSBPYmplY3QgY29udGFpbmluZyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgYXBwXG5cdCAqIEBwYXJhbSBbYkltbWVkaWF0ZUhhc2hSZXBsYWNlPWZhbHNlXSBJZiBzZXQgdG8gZmFsc2UsIHRoZSBpbm5lciBhcHAgaGFzaCB3aWxsIG5vdCBiZSByZXBsYWNlZCB1bnRpbCBzdG9yaW5nIGlzIHN1Y2Nlc3NmdWw7IGRvIG5vdFxuXHQgKiBAcmV0dXJucyBBbiBvYmplY3QgY29udGFpbmluZyB0aGUgYXBwU3RhdGVJZCBhbmQgYSBwcm9taXNlIG9iamVjdCB0byBtb25pdG9yIHdoZW4gYWxsIHRoZSBhY3Rpb25zIG9mIHRoZSBmdW5jdGlvbiBoYXZlIGJlZW5cblx0ICogZXhlY3V0ZWQ7IFBsZWFzZSBub3RlIHRoYXQgdGhlIGFwcFN0YXRlS2V5IG1heSBiZSB1bmRlZmluZWQgb3IgZW1wdHkuXG5cdCAqL1xuXHRzdG9yZUlubmVyQXBwU3RhdGVXaXRoSW1tZWRpYXRlUmV0dXJuKG1Jbm5lckFwcERhdGE6IGFueSwgYkltbWVkaWF0ZUhhc2hSZXBsYWNlOiBib29sZWFuIHwgdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIuc3RvcmVJbm5lckFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihtSW5uZXJBcHBEYXRhLCBiSW1tZWRpYXRlSGFzaFJlcGxhY2UpO1xuXHR9XG5cdC8qKlxuXHQgKiBDaGFuZ2VzIHRoZSBVUkwgYWNjb3JkaW5nIHRvIHRoZSBjdXJyZW50IHNBcHBTdGF0ZUtleS4gQXMgYW4gcmVhY3Rpb24gcm91dGUgY2hhbmdlIGV2ZW50IHdpbGwgYmUgdHJpZ2dlcmVkLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICogQHBhcmFtIHNBcHBTdGF0ZUtleSBUaGUgbmV3IGFwcCBzdGF0ZSBrZXkuXG5cdCAqL1xuXHRyZXBsYWNlSGFzaChzQXBwU3RhdGVLZXk6IHN0cmluZykge1xuXHRcdHRoaXMub05hdkhhbmRsZXIucmVwbGFjZUhhc2goc0FwcFN0YXRlS2V5KTtcblx0fVxuXHRyZXBsYWNlSW5uZXJBcHBTdGF0ZUtleShzQXBwSGFzaDogYW55LCBzQXBwU3RhdGVLZXk6IGFueSkge1xuXHRcdHJldHVybiB0aGlzLm9OYXZIYW5kbGVyLl9yZXBsYWNlSW5uZXJBcHBTdGF0ZUtleShzQXBwSGFzaCwgc0FwcFN0YXRlS2V5KTtcblx0fVxuXHQvKipcblx0ICogR2V0IHNpbmdsZSB2YWx1ZXMgZnJvbSBTZWxlY3Rpb25WYXJpYW50IGZvciB1cmwgcGFyYW1ldGVycy5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqIEBwYXJhbSBbdlNlbGVjdGlvblZhcmlhbnRdXG5cdCAqIEBwYXJhbSBbdlNlbGVjdGlvblZhcmlhbnQub1VybFBhcmFtYXRlcnNdXG5cdCAqIEByZXR1cm5zIFRoZSB1cmwgcGFyYW1ldGVyc1xuXHQgKi9cblx0Z2V0VXJsUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50KHZTZWxlY3Rpb25WYXJpYW50OiBzdHJpbmcgfCBvYmplY3QgfCB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gdGhpcy5vTmF2SGFuZGxlci5fZ2V0VVJMUGFyYW1ldGVyc0Zyb21TZWxlY3Rpb25WYXJpYW50KHZTZWxlY3Rpb25WYXJpYW50KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBTYXZlIGFwcCBzdGF0ZSBhbmQgcmV0dXJuIGltbWVkaWF0ZWx5IHdpdGhvdXQgd2FpdGluZyBmb3IgcmVzcG9uc2UuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKiBAcGFyYW0gb0luU2VsZWN0aW9uVmFyaWFudCBJbnN0YW5jZSBvZiBzYXAuZmUubmF2aWdhdGlvbi5TZWxlY3Rpb25WYXJpYW50XG5cdCAqIEByZXR1cm5zIEFwcFN0YXRlIGtleVxuXHQgKi9cblx0c2F2ZUFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihvSW5TZWxlY3Rpb25WYXJpYW50OiBTZWxlY3Rpb25WYXJpYW50KSB7XG5cdFx0aWYgKG9JblNlbGVjdGlvblZhcmlhbnQpIHtcblx0XHRcdGNvbnN0IHNTZWxlY3Rpb25WYXJpYW50ID0gb0luU2VsZWN0aW9uVmFyaWFudC50b0pTT05TdHJpbmcoKSwgLy8gY3JlYXRlIGFuIFNWIGZvciBhcHAgc3RhdGUgaW4gc3RyaW5nIGZvcm1hdFxuXHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudCA9IEpTT04ucGFyc2Uoc1NlbGVjdGlvblZhcmlhbnQpLCAvLyBjb252ZXJ0IHN0cmluZyBpbnRvIEpTT04gdG8gc3RvcmUgaW4gQXBwU3RhdGVcblx0XHRcdFx0b1hBcHBTdGF0ZU9iamVjdCA9IHtcblx0XHRcdFx0XHRzZWxlY3Rpb25WYXJpYW50OiBvU2VsZWN0aW9uVmFyaWFudFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvUmV0dXJuID0gdGhpcy5vTmF2SGFuZGxlci5fc2F2ZUFwcFN0YXRlV2l0aEltbWVkaWF0ZVJldHVybihvWEFwcFN0YXRlT2JqZWN0KTtcblx0XHRcdHJldHVybiBvUmV0dXJuPy5hcHBTdGF0ZUtleSA/IG9SZXR1cm4uYXBwU3RhdGVLZXkgOiBcIlwiO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBNaXggQXR0cmlidXRlcyBhbmQgc2VsZWN0aW9uVmFyaWFudC5cblx0ICpcblx0ICogQHBhcmFtIHZTZW1hbnRpY0F0dHJpYnV0ZXMgT2JqZWN0LyhBcnJheSBvZiBPYmplY3RzKSBjb250YWluaW5nIGtleS92YWx1ZSBwYWlyc1xuXHQgKiBAcGFyYW0gc1NlbGVjdGlvblZhcmlhbnQgVGhlIHNlbGVjdGlvbiB2YXJpYW50IGluIHN0cmluZyBmb3JtYXQgYXMgcHJvdmlkZWQgYnkgdGhlIFNtYXJ0RmlsdGVyQmFyIGNvbnRyb2xcblx0ICogQHBhcmFtIFtpU3VwcHJlc3Npb25CZWhhdmlvcj1zYXAuZmUubmF2aWdhdGlvbi5TdXBwcmVzc2lvbkJlaGF2aW9yLnN0YW5kYXJkXSBJbmRpY2F0ZXMgd2hldGhlciBzZW1hbnRpY1xuXHQgKiAgICAgICAgYXR0cmlidXRlcyB3aXRoIHNwZWNpYWwgdmFsdWVzIChzZWUge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlN1cHByZXNzaW9uQmVoYXZpb3Igc3VwcHJlc3Npb24gYmVoYXZpb3J9KSBtdXN0IGJlXG5cdCAqICAgICAgICBzdXBwcmVzc2VkIGJlZm9yZSB0aGV5IGFyZSBjb21iaW5lZCB3aXRoIHRoZSBzZWxlY3Rpb24gdmFyaWFudDsgc2V2ZXJhbFxuXHQgKiAgICAgICAge0BsaW5rIHNhcC5mZS5uYXZpZ2F0aW9uLlN1cHByZXNzaW9uQmVoYXZpb3Igc3VwcHJlc3Npb24gYmVoYXZpb3JzfSBjYW4gYmUgY29tYmluZWQgd2l0aCB0aGUgYml0d2lzZSBPUiBvcGVyYXRvclxuXHQgKiAgICAgICAgKHwpXG5cdCAqIEByZXR1cm5zIEluc3RhbmNlIG9mIHtAbGluayBzYXAuZmUubmF2aWdhdGlvbi5TZWxlY3Rpb25WYXJpYW50fVxuXHQgKi9cblx0bWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQoXG5cdFx0dlNlbWFudGljQXR0cmlidXRlczogb2JqZWN0IHwgYW55W10sXG5cdFx0c1NlbGVjdGlvblZhcmlhbnQ6IHN0cmluZyB8IFNlbGVjdGlvblZhcmlhbnQsXG5cdFx0aVN1cHByZXNzaW9uQmVoYXZpb3I/OiBudW1iZXJcblx0KSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIubWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQodlNlbWFudGljQXR0cmlidXRlcywgc1NlbGVjdGlvblZhcmlhbnQsIGlTdXBwcmVzc2lvbkJlaGF2aW9yKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIGNyZWF0ZXMgYSBjb250ZXh0IHVybCBiYXNlZCBvbiBwcm92aWRlZCBkYXRhLiBUaGlzIGNvbnRleHQgdXJsIGNhbiBlaXRoZXIgYmUgdXNlZCBhcy5cblx0ICpcblx0ICogQHBhcmFtIHNFbnRpdHlTZXROYW1lIFVzZWQgZm9yIHVybCBkZXRlcm1pbmF0aW9uXG5cdCAqIEBwYXJhbSBbb01vZGVsXSBUaGUgT0RhdGFNb2RlbCB1c2VkIGZvciB1cmwgZGV0ZXJtaW5hdGlvbi4gSWYgb21pdHRlZCwgdGhlIE5hdmlnYXRpb25IYW5kbGVyIG1vZGVsIGlzIHVzZWQuXG5cdCAqIEByZXR1cm5zIFRoZSBjb250ZXh0IHVybCBmb3IgdGhlIGdpdmVuIGVudGl0aWVzXG5cdCAqL1xuXHRjb25zdHJ1Y3RDb250ZXh0VXJsKHNFbnRpdHlTZXROYW1lOiBzdHJpbmcsIG9Nb2RlbDogYW55KSB7XG5cdFx0cmV0dXJuIHRoaXMub05hdkhhbmRsZXIuY29uc3RydWN0Q29udGV4dFVybChzRW50aXR5U2V0TmFtZSwgb01vZGVsKTtcblx0fVxuXHRnZXRJbnRlcmZhY2UoKSB7XG5cdFx0cmV0dXJuIHRoaXM7XG5cdH1cbn1cbmZ1bmN0aW9uIGZuR2V0RW1wdHlPYmplY3QoKSB7XG5cdHJldHVybiB7fTtcbn1cblxuZnVuY3Rpb24gZm5HZXRQcm9taXNlKCkge1xuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHt9KTtcbn1cblxuZnVuY3Rpb24gZm5HZXRKUXVlcnlQcm9taXNlKCkge1xuXHRjb25zdCBvTXlEZWZmZXJlZCA9IGpRdWVyeS5EZWZlcnJlZCgpO1xuXHRvTXlEZWZmZXJlZC5yZXNvbHZlKHt9LCB7fSwgXCJpbml0aWFsXCIpO1xuXHRyZXR1cm4gb015RGVmZmVyZWQucHJvbWlzZSgpO1xufVxuXG5mdW5jdGlvbiBmbkdldEVtcHR5U3RyaW5nKCkge1xuXHRyZXR1cm4gXCJcIjtcbn1cbmV4cG9ydCBjbGFzcyBOYXZpZ2F0aW9uU2VydmljZXNNb2NrIHtcblx0aW5pdFByb21pc2U6IFByb21pc2U8YW55Pjtcblx0Y29uc3RydWN0b3IoKSB7XG5cdFx0dGhpcy5pbml0UHJvbWlzZSA9IFByb21pc2UucmVzb2x2ZSh0aGlzKTtcblx0fVxuXG5cdGdldEludGVyZmFjZSgpIHtcblx0XHRyZXR1cm4gdGhpcztcblx0fVxuXG5cdC8vIHJldHVybiBlbXB0eSBvYmplY3Rcblx0Y3JlYXRlRW1wdHlBcHBTdGF0ZSA9IGZuR2V0RW1wdHlPYmplY3Q7XG5cdHN0b3JlSW5uZXJBcHBTdGF0ZVdpdGhJbW1lZGlhdGVSZXR1cm4gPSBmbkdldEVtcHR5T2JqZWN0O1xuXHRtaXhBdHRyaWJ1dGVzQW5kU2VsZWN0aW9uVmFyaWFudCA9IGZuR2V0RW1wdHlPYmplY3Q7XG5cblx0Ly8gcmV0dXJuIHByb21pc2Vcblx0Z2V0QXBwU3RhdGUgPSBmbkdldFByb21pc2U7XG5cdGdldFN0YXJ0dXBBcHBTdGF0ZSA9IGZuR2V0UHJvbWlzZTtcblx0cGFyc2VOYXZpZ2F0aW9uID0gZm5HZXRKUXVlcnlQcm9taXNlO1xuXG5cdC8vIHJldHVybiBlbXB0eSBzdHJpbmdcblx0Y29uc3RydWN0Q29udGV4dFVybCA9IGZuR2V0RW1wdHlTdHJpbmc7XG5cblx0cmVwbGFjZUlubmVyQXBwU3RhdGVLZXkoc0FwcEhhc2g6IGFueSkge1xuXHRcdHJldHVybiBzQXBwSGFzaCA/IHNBcHBIYXNoIDogXCJcIjtcblx0fVxuXG5cdG5hdmlnYXRlKCkge1xuXHRcdC8vIERvbid0IGRvIGFueXRoaW5nXG5cdH1cbn1cblxuY2xhc3MgTmF2aWdhdGlvblNlcnZpY2VGYWN0b3J5IGV4dGVuZHMgU2VydmljZUZhY3Rvcnk8TmF2aWdhdGlvblNlcnZpY2VTZXR0aW5ncz4ge1xuXHRjcmVhdGVJbnN0YW5jZShvU2VydmljZUNvbnRleHQ6IFNlcnZpY2VDb250ZXh0PE5hdmlnYXRpb25TZXJ2aWNlU2V0dGluZ3M+KSB7XG5cdFx0Y29uc3Qgb05hdmlnYXRpb25TZXJ2aWNlID1cblx0XHRcdHNhcC51c2hlbGwgJiYgc2FwLnVzaGVsbC5Db250YWluZXIgPyBuZXcgTmF2aWdhdGlvblNlcnZpY2Uob1NlcnZpY2VDb250ZXh0KSA6IG5ldyBOYXZpZ2F0aW9uU2VydmljZXNNb2NrKCk7XG5cdFx0Ly8gV2FpdCBGb3IgaW5pdFxuXHRcdHJldHVybiBvTmF2aWdhdGlvblNlcnZpY2UuaW5pdFByb21pc2UudGhlbihmdW5jdGlvbiAob1NlcnZpY2U6IGFueSkge1xuXHRcdFx0cmV0dXJuIG9TZXJ2aWNlO1xuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE5hdmlnYXRpb25TZXJ2aWNlRmFjdG9yeTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7OztNQU9hQSxpQkFBaUI7SUFBQTtJQUFBO01BQUE7SUFBQTtJQUFBO0lBQUE7SUFBQSxPQUc3QkMsSUFBSSxHQUFKLGdCQUFPO01BQ04sSUFBTUMsUUFBUSxHQUFHLElBQUksQ0FBQ0MsVUFBVSxFQUFFO1FBQ2pDQyxVQUFVLEdBQUdGLFFBQVEsSUFBSUEsUUFBUSxDQUFDRyxXQUFXO01BRTlDLElBQUksQ0FBQ0MsV0FBVyxHQUFHLElBQUlDLGlCQUFpQixDQUFDSCxVQUFVLENBQUM7TUFDcEQsSUFBSSxDQUFDRSxXQUFXLENBQUNFLFFBQVEsQ0FBQ0osVUFBVSxDQUFDSyxRQUFRLEVBQUUsQ0FBQztNQUNoRCxJQUFJLENBQUNDLFdBQVcsR0FBR0MsT0FBTyxDQUFDQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ3pDLENBQUM7SUFBQSxPQUNEQyxJQUFJLEdBQUosZ0JBQU87TUFDTixJQUFJLENBQUNQLFdBQVcsQ0FBQ1EsT0FBTyxFQUFFO0lBQzNCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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