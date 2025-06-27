/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/controllerextensions/editFlow/draft", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/KeepAliveHelper", "sap/fe/core/helpers/ModelHelper", "sap/fe/navigation/SelectionVariant", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/mvc/ControllerExtension", "sap/ui/core/mvc/OverrideExecution", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/model/json/JSONModel"], function (Log, mergeObjects, draft, ClassSupport, KeepAliveHelper, ModelHelper, SelectionVariant, Core, Fragment, ControllerExtension, OverrideExecution, XMLPreprocessor, XMLTemplateProcessor, JSONModel) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _class, _class2;
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
   * {@link sap.ui.core.mvc.ControllerExtension Controller extension}
   *
   * @namespace
   * @alias sap.fe.core.controllerextensions.InternalInternalBasedNavigation
   * @private
   * @since 1.84.0
   */
  var InternalIntentBasedNavigation = (_dec = defineUI5Class("sap.fe.core.controllerextensions.InternalInternalBasedNavigation"), _dec2 = methodOverride(), _dec3 = publicExtension(), _dec4 = finalExtension(), _dec5 = publicExtension(), _dec6 = finalExtension(), _dec7 = publicExtension(), _dec8 = finalExtension(), _dec9 = publicExtension(), _dec10 = extensible(OverrideExecution.Instead), _dec11 = publicExtension(), _dec12 = finalExtension(), _dec13 = privateExtension(), _dec14 = publicExtension(), _dec15 = finalExtension(), _dec16 = publicExtension(), _dec17 = finalExtension(), _dec18 = publicExtension(), _dec19 = finalExtension(), _dec20 = publicExtension(), _dec21 = finalExtension(), _dec(_class = (_class2 = /*#__PURE__*/function (_ControllerExtension) {
    _inheritsLoose(InternalIntentBasedNavigation, _ControllerExtension);
    function InternalIntentBasedNavigation() {
      return _ControllerExtension.apply(this, arguments) || this;
    }
    var _proto = InternalIntentBasedNavigation.prototype;
    _proto.onInit = function onInit() {
      this._oAppComponent = this.base.getAppComponent();
      this._oMetaModel = this._oAppComponent.getModel().getMetaModel();
      this._oNavigationService = this._oAppComponent.getNavigationService();
      this._oView = this.base.getView();
    }

    /**
     * Enables intent-based navigation (SemanticObject-Action) with the provided context.
     * If semantic object mapping is provided, this is also applied to the selection variant after the adaptation by a consumer.
     * This takes care of removing any technical parameters and determines if an explace or inplace navigation should take place.
     *
     * @param sSemanticObject Semantic object for the target app
     * @param sAction  Action for the target app
     * @param [mNavigationParameters] Optional parameters to be passed to the external navigation
     * @param [mNavigationParameters.navigationContexts] Uses one of the following to be passed to the intent:
     *    a single instance of {@link sap.ui.model.odata.v4.Context}
     *    multiple instances of {@link sap.ui.model.odata.v4.Context}
     *    an object or an array of objects
     *		  If an array of objects is passed, the context is used to determine the metaPath and to remove any sensitive data
     *		  If an array of objects is passed, the following format ix expected:
     *		  {
     *			data: {
     *	 			ProductID: 7634,
     *				Name: "Laptop"
     *			 },
     *			 metaPath: "/SalesOrderManage"
     *        }
     * @param [mNavigationParameters.semanticObjectMapping] String representation of the SemanticObjectMapping or SemanticObjectMapping that applies to this navigation
     * @param [mNavigationParameters.defaultRefreshStrategy] Default refresh strategy to be used in case no refresh strategy is specified for the intent in the view.
     * @param [mNavigationParameters.refreshStrategies]
     * @param [mNavigationParameters.additionalNavigationParameters] Additional navigation parameters configured in the crossAppNavigation outbound parameters.
     */;
    _proto.navigate = function navigate(sSemanticObject, sAction, mNavigationParameters) {
      var _this = this;
      var _doNavigate = function (oContext) {
        var vNavigationContexts = mNavigationParameters && mNavigationParameters.navigationContexts,
          aNavigationContexts = vNavigationContexts && !Array.isArray(vNavigationContexts) ? [vNavigationContexts] : vNavigationContexts,
          vSemanticObjectMapping = mNavigationParameters && mNavigationParameters.semanticObjectMapping,
          vOutboundParams = mNavigationParameters && mNavigationParameters.additionalNavigationParameters,
          oTargetInfo = {
            semanticObject: sSemanticObject,
            action: sAction
          },
          oView = _this.base.getView(),
          oController = oView.getController();
        if (oContext) {
          _this._oView.setBindingContext(oContext);
        }
        if (sSemanticObject && sAction) {
          var aSemanticAttributes = [],
            oSelectionVariant = new SelectionVariant();
          // 1. get SemanticAttributes for navigation
          if (aNavigationContexts && aNavigationContexts.length) {
            aNavigationContexts.forEach(function (oNavigationContext) {
              // 1.1.a if navigation context is instance of sap.ui.mode.odata.v4.Context
              // else check if navigation context is of type object
              if (oNavigationContext.isA && oNavigationContext.isA("sap.ui.model.odata.v4.Context")) {
                // 1.1.b remove sensitive data
                var oSemanticAttributes = oNavigationContext.getObject();
                var sMetaPath = _this._oMetaModel.getMetaPath(oNavigationContext.getPath());
                // TODO: also remove sensitive data from  navigation properties
                oSemanticAttributes = _this.removeSensitiveData(oSemanticAttributes, sMetaPath);
                var oNavContext = _this.prepareContextForExternalNavigation(oSemanticAttributes, oNavigationContext);
                oTargetInfo["propertiesWithoutConflict"] = oNavContext.propertiesWithoutConflict;
                aSemanticAttributes.push(oNavContext.semanticAttributes);
              } else if (!(oNavigationContext && Array.isArray(oNavigationContext.data)) && typeof oNavigationContext === "object") {
                // 1.1.b remove sensitive data from object
                aSemanticAttributes.push(_this.removeSensitiveData(oNavigationContext.data, oNavigationContext.metaPath));
              } else if (oNavigationContext && Array.isArray(oNavigationContext.data)) {
                // oNavigationContext.data can be array already ex : [{Customer: "10001"}, {Customer: "10091"}]
                // hence assigning it to the aSemanticAttributes
                aSemanticAttributes = _this.removeSensitiveData(oNavigationContext.data, oNavigationContext.metaPath);
              }
            });
          }
          // 2.1 Merge base selection variant and sanitized semantic attributes into one SelectionVariant
          if (aSemanticAttributes && aSemanticAttributes.length) {
            oSelectionVariant = _this._oNavigationService.mixAttributesAndSelectionVariant(aSemanticAttributes, oSelectionVariant.toJSONString());
          }

          // 3. Add filterContextUrl to SV so the NavigationHandler can remove any sensitive data based on view entitySet
          var oModel = _this._oView.getModel(),
            sEntitySet = _this.getEntitySet(),
            sContextUrl = sEntitySet ? _this._oNavigationService.constructContextUrl(sEntitySet, oModel) : undefined;
          if (sContextUrl) {
            oSelectionVariant.setFilterContextUrl(sContextUrl);
          }

          // Apply Outbound Parameters to the SV
          if (vOutboundParams) {
            _this._applyOutboundParams(oSelectionVariant, vOutboundParams);
          }

          // 4. give an opportunity for the application to influence the SelectionVariant
          oController.intentBasedNavigation.adaptNavigationContext(oSelectionVariant, oTargetInfo);

          // 5. Apply semantic object mappings to the SV
          if (vSemanticObjectMapping) {
            _this._applySemanticObjectMappings(oSelectionVariant, vSemanticObjectMapping);
          }

          // 6. remove technical parameters from Selection Variant
          _this._removeTechnicalParameters(oSelectionVariant);

          // 7. check if programming model is sticky and page is editable
          var sNavMode = oController._intentBasedNavigation.getNavigationMode();

          // 8. Updating refresh strategy in internal model
          var mRefreshStrategies = mNavigationParameters && mNavigationParameters.refreshStrategies || {},
            oInternalModel = oView.getModel("internal");
          if (oInternalModel) {
            if ((oView && oView.getViewData()).refreshStrategyOnAppRestore) {
              var mViewRefreshStrategies = oView.getViewData().refreshStrategyOnAppRestore || {};
              mergeObjects(mRefreshStrategies, mViewRefreshStrategies);
            }
            var mRefreshStrategy = KeepAliveHelper.getRefreshStrategyForIntent(mRefreshStrategies, sSemanticObject, sAction);
            if (mRefreshStrategy) {
              oInternalModel.setProperty("/refreshStrategyOnAppRestore", mRefreshStrategy);
            }
          }

          // 9. Navigate via NavigationHandler
          var onError = function () {
            sap.ui.require(["sap/m/MessageBox"], function (MessageBox) {
              var oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
              MessageBox.error(oResourceBundle.getText("C_COMMON_HELPER_NAVIGATION_ERROR_MESSAGE"), {
                title: oResourceBundle.getText("C_COMMON_SAPFE_ERROR")
              });
            });
          };
          _this._oNavigationService.navigate(sSemanticObject, sAction, oSelectionVariant.toJSONString(), undefined, onError, undefined, sNavMode);
        } else {
          throw new Error("Semantic Object/action is not provided");
        }
      };
      var oBindingContext = this.base.getView().getBindingContext();
      var oMetaModel = oBindingContext && oBindingContext.getModel().getMetaModel();
      if (this.getView().getViewData().converterType === "ObjectPage" && oMetaModel && !ModelHelper.isStickySessionSupported(oMetaModel)) {
        draft.processDataLossOrDraftDiscardConfirmation(_doNavigate.bind(this), Function.prototype, this.base.getView().getBindingContext(), this.base.getView().getController(), true, draft.NavigationType.ForwardNavigation);
      } else {
        _doNavigate();
      }
    }

    /**
     * Prepare attributes to be passed to external navigation.
     *
     * @param oSemanticAttributes Context data after removing all sensitive information.
     * @param oContext Actual context from which the semanticAttributes were derived.
     * @returns Object of prepared attributes for external navigation and no conflict properties.
     */;
    _proto.prepareContextForExternalNavigation = function prepareContextForExternalNavigation(oSemanticAttributes, oContext) {
      // 1. Find all distinct keys in the object SemanticAttributes
      // Store meta path for each occurence of the key
      var oDistinctKeys = {},
        sContextPath = oContext.getPath(),
        oMetaModel = oContext.getModel().getMetaModel(),
        sMetaPath = oMetaModel.getMetaPath(sContextPath),
        aMetaPathParts = sMetaPath.split("/").filter(Boolean);
      function _findDistinctKeysInObject(LookUpObject, sLookUpObjectMetaPath) {
        for (var sKey in LookUpObject) {
          // null case??
          if (LookUpObject[sKey] === null || typeof LookUpObject[sKey] !== "object") {
            if (!oDistinctKeys[sKey]) {
              // if key is found for the first time then create array
              oDistinctKeys[sKey] = [];
            }
            // push path to array
            oDistinctKeys[sKey].push(sLookUpObjectMetaPath);
          } else {
            // if a nested object is found
            var oNewLookUpObject = LookUpObject[sKey];
            _findDistinctKeysInObject(oNewLookUpObject, "".concat(sLookUpObjectMetaPath, "/").concat(sKey));
          }
        }
      }
      _findDistinctKeysInObject(oSemanticAttributes, sMetaPath);

      // 2. Determine distinct key value and add conflicted paths to semantic attributes
      var sMainEntitySetName = aMetaPathParts[0],
        sMainEntityTypeName = oMetaModel.getObject("/".concat(sMainEntitySetName, "/@sapui.name")),
        oPropertiesWithoutConflict = {};
      var sMainEntityValuePath, sCurrentValuePath, sLastValuePath;
      for (var sDistinctKey in oDistinctKeys) {
        var aConflictingPaths = oDistinctKeys[sDistinctKey];
        var sWinnerValuePath = void 0;
        // Find winner value for each distinct key in case of conflict by the following rule:

        // -> A. if any meta path for a distinct key is the same as main entity take that as the value
        // -> B. if A is not met keep the value from the current context (sMetaPath === path of distince key)
        // -> C. if A, B or C are not met take the last path for value
        if (aConflictingPaths.length > 1) {
          // conflict
          for (var i = 0; i <= aConflictingPaths.length - 1; i++) {
            var sPath = aConflictingPaths[i];
            var sPathInContext = sPath.replace(sPath === sMetaPath ? sMetaPath : "".concat(sMetaPath, "/"), "");
            sPathInContext = (sPathInContext === "" ? sPathInContext : "".concat(sPathInContext, "/")) + sDistinctKey;
            var sEntityTypeName = oMetaModel.getObject("".concat(sPath, "/@sapui.name"));
            // rule A

            // rule A
            if (sEntityTypeName === sMainEntityTypeName) {
              sMainEntityValuePath = sPathInContext;
            }

            // rule B
            if (sPath === sMetaPath) {
              sCurrentValuePath = sPathInContext;
            }

            // rule C
            sLastValuePath = sPathInContext;

            // add conflicted path to semantic attributes
            // check if the current path points to main entity and prefix attribute names accordingly
            oSemanticAttributes["".concat(sMetaPath, "/").concat(sPathInContext).split("/").filter(function (sValue) {
              return sValue != "";
            }).join(".")] = oContext.getProperty(sPathInContext);
          }
          // A || B || C
          sWinnerValuePath = sMainEntityValuePath || sCurrentValuePath || sLastValuePath;
          oSemanticAttributes[sDistinctKey] = oContext.getProperty(sWinnerValuePath);
          sMainEntityValuePath = undefined;
          sCurrentValuePath = undefined;
          sLastValuePath = undefined;
        } else {
          // no conflict, add distinct key without adding paths
          var _sPath = aConflictingPaths[0]; // because there is only one and hence no conflict
          var _sPathInContext = _sPath.replace(_sPath === sMetaPath ? sMetaPath : "".concat(sMetaPath, "/"), "");
          _sPathInContext = (_sPathInContext === "" ? _sPathInContext : "".concat(_sPathInContext, "/")) + sDistinctKey;
          oSemanticAttributes[sDistinctKey] = oContext.getProperty(_sPathInContext);
          oPropertiesWithoutConflict[sDistinctKey] = "".concat(sMetaPath, "/").concat(_sPathInContext).split("/").filter(function (sValue) {
            return sValue != "";
          }).join(".");
        }
      }
      // 3. Remove all Navigation properties
      for (var sProperty in oSemanticAttributes) {
        if (oSemanticAttributes[sProperty] !== null && typeof oSemanticAttributes[sProperty] === "object") {
          delete oSemanticAttributes[sProperty];
        }
      }
      return {
        semanticAttributes: oSemanticAttributes,
        propertiesWithoutConflict: oPropertiesWithoutConflict
      };
    }
    /**
     * Prepare filter conditions to be passed to external navigation.
     *
     * @param oFilterBarConditions Filter conditions.
     * @param sRootPath Root path of the application.
     * @param aParameters Names of parameters to be considered.
     * @returns Object of prepared filter conditions for external navigation and no conflict filters.
     */;
    _proto.prepareFiltersForExternalNavigation = function prepareFiltersForExternalNavigation(oFilterBarConditions, sRootPath, aParameters) {
      var sPath;
      var oDistinctKeys = {};
      var oFilterConditionsWithoutConflict = {};
      var sMainEntityValuePath, sCurrentValuePath, sFullContextPath, sWinnerValuePath, sPathInContext;
      function _findDistinctKeysInObject(LookUpObject) {
        var sLookUpObjectMetaPath;
        for (var sKey in LookUpObject) {
          if (LookUpObject[sKey]) {
            if (sKey.includes("/")) {
              sLookUpObjectMetaPath = sKey; // "/SalesOrdermanage/_Item/Material"
              var aPathParts = sKey.split("/");
              sKey = aPathParts[aPathParts.length - 1];
            } else {
              sLookUpObjectMetaPath = sRootPath;
            }
            if (!oDistinctKeys[sKey]) {
              // if key is found for the first time then create array
              oDistinctKeys[sKey] = [];
            }

            // push path to array
            oDistinctKeys[sKey].push(sLookUpObjectMetaPath);
          }
        }
      }
      _findDistinctKeysInObject(oFilterBarConditions);
      for (var sDistinctKey in oDistinctKeys) {
        var aConflictingPaths = oDistinctKeys[sDistinctKey];
        if (aConflictingPaths.length > 1) {
          // conflict
          for (var i = 0; i <= aConflictingPaths.length - 1; i++) {
            sPath = aConflictingPaths[i];
            if (sPath === sRootPath) {
              sFullContextPath = "".concat(sRootPath, "/").concat(sDistinctKey);
              sPathInContext = sDistinctKey;
              sMainEntityValuePath = sDistinctKey;
              if (aParameters && aParameters.includes(sDistinctKey)) {
                oFilterBarConditions["$Parameter.".concat(sDistinctKey)] = oFilterBarConditions[sDistinctKey];
              }
            } else {
              sPathInContext = sPath;
              sFullContextPath = "".concat(sRootPath, "/").concat(sPath).replaceAll(/\*/g, "");
              sCurrentValuePath = sPath;
            }
            oFilterBarConditions[sFullContextPath.split("/").filter(function (sValue) {
              return sValue != "";
            }).join(".")] = oFilterBarConditions[sPathInContext];
            delete oFilterBarConditions[sPath];
          }
          sWinnerValuePath = sMainEntityValuePath || sCurrentValuePath;
          oFilterBarConditions[sDistinctKey] = oFilterBarConditions[sWinnerValuePath];
        } else {
          // no conflict, add distinct key without adding paths
          sPath = aConflictingPaths[0];
          sFullContextPath = sPath === sRootPath ? "".concat(sRootPath, "/").concat(sDistinctKey) : "".concat(sRootPath, "/").concat(sPath).replaceAll("*", "");
          oFilterConditionsWithoutConflict[sDistinctKey] = sFullContextPath.split("/").filter(function (sValue) {
            return sValue != "";
          }).join(".");
          if (aParameters && aParameters.includes(sDistinctKey)) {
            oFilterBarConditions["$Parameter.".concat(sDistinctKey)] = oFilterBarConditions[sDistinctKey];
          }
        }
      }
      return {
        filterConditions: oFilterBarConditions,
        filterConditionsWithoutConflict: oFilterConditionsWithoutConflict
      };
    }

    /**
     * Get Navigation mode.
     *
     * @returns The navigation mode
     */;
    _proto.getNavigationMode = function getNavigationMode() {
      return undefined;
    }
    /**
     * Allows for navigation to a given intent (SemanticObject-Action) with the provided context, using a dialog that shows the contexts which cannot be passed
     * If semantic object mapping is provided, this setting is also applied to the selection variant after adaptation by a consumer.
     * This setting also removes any technical parameters and determines if an inplace or explace navigation should take place.
     *
     * @param sSemanticObject Semantic object for the target app
     * @param sAction  Action for the target app
     * @param [mNavigationParameters] Optional parameters to be passed to the external navigation
     * @param [mNavigationParameters.label]
     * @param [mNavigationParameters.navigationContexts] Single instance or multiple instances of {@link sap.ui.model.odata.v4.Context}, or alternatively an object or array of objects, to be passed to the intent.
     * @param [mNavigationParameters.applicableContexts] Single instance or multiple instances of {@link sap.ui.model.odata.v4.Context}, or alternatively an object or array of objects, to be passed to the intent and for which the IBN button is enabled
     * @param [mNavigationParameters.notApplicableContexts] Single instance or multiple instances of {@link sap.ui.model.odata.v4.Context}, or alternatively an object or array of objects, which cannot be passed to the intent.
     *		  if an array of contexts is passed the context is used to determine the meta path and accordingly remove the sensitive data
     *		  If an array of objects is passed, the following format is expected:
     *		  {
     *			data: {
     *	 			ProductID: 7634,
     *				Name: "Laptop"
     *			 },
     *			 metaPath: "/SalesOrderManage"
     *        }
     *		The metaPath is used to remove any sensitive data.
     * @param [mNavigationParameters.semanticObjectMapping] String representation of SemanticObjectMapping or SemanticObjectMapping that applies to this navigation
     */;
    _proto.navigateWithConfirmationDialog = function navigateWithConfirmationDialog(sSemanticObject, sAction, mNavigationParameters) {
      var _mNavigationParameter,
        _this2 = this;
      if (mNavigationParameters !== null && mNavigationParameters !== void 0 && mNavigationParameters.notApplicableContexts && ((_mNavigationParameter = mNavigationParameters.notApplicableContexts) === null || _mNavigationParameter === void 0 ? void 0 : _mNavigationParameter.length) >= 1) {
        var oApplicableContextDialog;
        var oController = {
          onClose: function () {
            // User cancels action
            oApplicableContextDialog.close();
          },
          onContinue: function () {
            // Users continues the action with the bound contexts
            mNavigationParameters.navigationContexts = mNavigationParameters.applicableContexts;
            oApplicableContextDialog.close();
            _this2.navigate(sSemanticObject, sAction, mNavigationParameters);
          }
        };
        var fnOpenAndFillDialog = function () {
          var oDialogContent;
          var nNotApplicable = mNavigationParameters.notApplicableContexts.length,
            aNotApplicableItems = [];
          for (var i = 0; i < mNavigationParameters.notApplicableContexts.length; i++) {
            oDialogContent = mNavigationParameters.notApplicableContexts[i].getObject();
            aNotApplicableItems.push(oDialogContent);
          }
          var oNotApplicableItemsModel = new JSONModel(aNotApplicableItems);
          var oTotals = new JSONModel({
            total: nNotApplicable,
            label: mNavigationParameters.label
          });
          oApplicableContextDialog.setModel(oNotApplicableItemsModel, "notApplicable");
          oApplicableContextDialog.setModel(oTotals, "totals");
          oApplicableContextDialog.open();
        };
        // Show the contexts that are not applicable and will not therefore be processed
        var sFragmentName = "sap.fe.core.controls.ActionPartial";
        var oDialogFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
        var oModel = this._oView.getModel();
        var oMetaModel = oModel.getMetaModel();
        var sCanonicalPath = mNavigationParameters.notApplicableContexts[0].getCanonicalPath();
        var sEntitySet = "".concat(sCanonicalPath.substr(0, sCanonicalPath.indexOf("(")), "/");
        Promise.resolve(XMLPreprocessor.process(oDialogFragment, {
          name: sFragmentName
        }, {
          bindingContexts: {
            entityType: oMetaModel.createBindingContext(sEntitySet)
          },
          models: {
            entityType: oMetaModel,
            metaModel: oMetaModel
          }
        })).then(function (oFragment) {
          return Fragment.load({
            definition: oFragment,
            controller: oController
          });
        }).then(function (oPopover) {
          oApplicableContextDialog = oPopover;
          _this2.getView().addDependent(oPopover);
          fnOpenAndFillDialog();
        }).catch(function () {
          Log.error("Error");
        });
      } else {
        this.navigate(sSemanticObject, sAction, mNavigationParameters);
      }
    };
    _proto._removeTechnicalParameters = function _removeTechnicalParameters(oSelectionVariant) {
      oSelectionVariant.removeSelectOption("@odata.context");
      oSelectionVariant.removeSelectOption("@odata.metadataEtag");
      oSelectionVariant.removeSelectOption("SAP__Messages");
    }
    /**
     * Get targeted Entity set.
     *
     * @returns Entity set name
     */;
    _proto.getEntitySet = function getEntitySet() {
      return this._oView.getViewData().entitySet;
    }
    /**
     * Removes sensitive data from the semantic attribute with respect to the entitySet.
     *
     * @param oAttributes Context data
     * @param sMetaPath Meta path to reach the entitySet in the MetaModel
     * @returns Array of semantic Attributes
     * @private
     */
    // TO-DO add unit tests for this function in the controller extension qunit.
    ;
    _proto.removeSensitiveData = function removeSensitiveData(oAttributes, sMetaPath) {
      if (oAttributes) {
        var aProperties = Object.keys(oAttributes);
        if (aProperties.length) {
          delete oAttributes["@odata.context"];
          delete oAttributes["@odata.metadataEtag"];
          delete oAttributes["SAP__Messages"];
          for (var j = 0; j < aProperties.length; j++) {
            if (oAttributes[aProperties[j]] && typeof oAttributes[aProperties[j]] === "object") {
              this.removeSensitiveData(oAttributes[aProperties[j]], "".concat(sMetaPath, "/").concat(aProperties[j]));
            }
            var sProp = aProperties[j],
              aPropertyAnnotations = this._oMetaModel.getObject("".concat(sMetaPath, "/").concat(sProp, "@"));
            if (aPropertyAnnotations) {
              if (aPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] || aPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] || aPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"]) {
                delete oAttributes[sProp];
              } else if (aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"]) {
                var oFieldControl = aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
                if (oFieldControl["$EnumMember"] && oFieldControl["$EnumMember"].split("/")[1] === "Inapplicable") {
                  delete oAttributes[sProp];
                } else if (oFieldControl["$Path"] && this._isFieldControlPathInapplicable(oFieldControl["$Path"], oAttributes)) {
                  delete oAttributes[sProp];
                }
              }
            }
          }
        }
      }
      return oAttributes;
    }

    /**
     * Check if path-based FieldControl evaluates to inapplicable.
     *
     * @param sFieldControlPath Field control path
     * @param oAttribute SemanticAttributes
     * @returns `true` if inapplicable
     */;
    _proto._isFieldControlPathInapplicable = function _isFieldControlPathInapplicable(sFieldControlPath, oAttribute) {
      var bInapplicable = false;
      var aParts = sFieldControlPath.split("/");
      // sensitive data is removed only if the path has already been resolved.
      if (aParts.length > 1) {
        bInapplicable = oAttribute[aParts[0]] && oAttribute[aParts[0]].hasOwnProperty(aParts[1]) && oAttribute[aParts[0]][aParts[1]] === 0;
      } else {
        bInapplicable = oAttribute[sFieldControlPath] === 0;
      }
      return bInapplicable;
    }
    /**
     * Method to replace Local Properties with Semantic Object mappings.
     *
     * @param oSelectionVariant SelectionVariant consisting of filterbar, Table and Page Context
     * @param vMappings A string representation of semantic object mapping
     * @returns - Modified SelectionVariant with LocalProperty replaced with SemanticObjectProperties.
     */;
    _proto._applySemanticObjectMappings = function _applySemanticObjectMappings(oSelectionVariant, vMappings) {
      var oMappings = typeof vMappings === "string" ? JSON.parse(vMappings) : vMappings;
      for (var i = 0; i < oMappings.length; i++) {
        var sLocalProperty = oMappings[i]["LocalProperty"] && oMappings[i]["LocalProperty"]["$PropertyPath"] || oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"] && oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"]["$Path"];
        var sSemanticObjectProperty = oMappings[i]["SemanticObjectProperty"] || oMappings[i]["@com.sap.vocabularies.Common.v1.SemanticObjectProperty"];
        if (oSelectionVariant.getSelectOption(sLocalProperty)) {
          var oSelectOption = oSelectionVariant.getSelectOption(sLocalProperty);

          //Create a new SelectOption with sSemanticObjectProperty as the property Name and remove the older one
          oSelectionVariant.removeSelectOption(sLocalProperty);
          oSelectionVariant.massAddSelectOption(sSemanticObjectProperty, oSelectOption);
        }
      }
      return oSelectionVariant;
    }
    /**
     * Navigates to an Outbound provided in the manifest.
     *
     * @function
     * @param sOutbound Identifier to location the outbound in the manifest
     * @param mNavigationParameters Optional map containing key/value pairs to be passed to the intent
     * @alias sap.fe.core.controllerextensions.IntentBasedNavigation#navigateOutbound
     * @since 1.86.0
     */;
    _proto.navigateOutbound = function navigateOutbound(sOutbound, mNavigationParameters) {
      var aNavParams;
      var oManifestEntry = this.base.getAppComponent().getManifestEntry("sap.app"),
        oOutbound = oManifestEntry.crossNavigation && oManifestEntry.crossNavigation.outbounds[sOutbound];
      if (!oOutbound) {
        Log.error("Outbound is not defined in manifest!!");
        return;
      }
      var sSemanticObject = oOutbound.semanticObject,
        sAction = oOutbound.action,
        outboundParams = oOutbound.parameters && this.getOutboundParams(oOutbound.parameters);
      if (mNavigationParameters) {
        aNavParams = [];
        Object.keys(mNavigationParameters).forEach(function (key) {
          var oParams;
          if (Array.isArray(mNavigationParameters[key])) {
            var aValues = mNavigationParameters[key];
            for (var i = 0; i < aValues.length; i++) {
              var _aNavParams;
              oParams = {};
              oParams[key] = aValues[i];
              (_aNavParams = aNavParams) === null || _aNavParams === void 0 ? void 0 : _aNavParams.push(oParams);
            }
          } else {
            var _aNavParams2;
            oParams = {};
            oParams[key] = mNavigationParameters[key];
            (_aNavParams2 = aNavParams) === null || _aNavParams2 === void 0 ? void 0 : _aNavParams2.push(oParams);
          }
        });
      }
      if (aNavParams || outboundParams) {
        mNavigationParameters = {
          navigationContexts: {
            data: aNavParams || outboundParams
          }
        };
      }
      this.base._intentBasedNavigation.navigate(sSemanticObject, sAction, mNavigationParameters);
    }

    /**
     * Method to apply outbound parameters defined in the manifest.
     *
     * @param oSelectionVariant SelectionVariant consisting of a filter bar, a table, and a page context
     * @param vOutboundParams Outbound Properties defined in the manifest
     * @returns - The modified SelectionVariant with outbound parameters.
     */;
    _proto._applyOutboundParams = function _applyOutboundParams(oSelectionVariant, vOutboundParams) {
      var aParameters = Object.keys(vOutboundParams);
      var aSelectProperties = oSelectionVariant.getSelectOptionsPropertyNames();
      aParameters.forEach(function (key) {
        if (!aSelectProperties.includes(key)) {
          oSelectionVariant.addSelectOption(key, "I", "EQ", vOutboundParams[key]);
        }
      });
      return oSelectionVariant;
    }
    /**
     * Method to get the outbound parameters defined in the manifest.
     *
     * @function
     * @param oOutboundParams Parameters defined in the outbounds. Only "plain" is supported
     * @returns Parameters with the key-Value pair
     */;
    _proto.getOutboundParams = function getOutboundParams(oOutboundParams) {
      var oParamsMapping = {};
      if (oOutboundParams) {
        var aParameters = Object.keys(oOutboundParams) || [];
        if (aParameters.length > 0) {
          aParameters.forEach(function (key) {
            var oMapping = oOutboundParams[key];
            if (oMapping.value && oMapping.value.value && oMapping.value.format === "plain") {
              if (!oParamsMapping[key]) {
                oParamsMapping[key] = oMapping.value.value;
              }
            }
          });
        }
      }
      return oParamsMapping;
    }

    /**
     * Triggers an outbound navigation when a user chooses the chevron.
     *
     * @param {object} oController
     * @param {string} sOutboundTarget Name of the outbound target (needs to be defined in the manifest)
     * @param {sap.ui.model.odata.v4.Context} oContext The context that contains the data for the target app
     * @param {string} sCreatePath Create path when the chevron is created.
     * @returns {Promise} Promise which is resolved once the navigation is triggered
     */;
    _proto.onChevronPressNavigateOutBound = function onChevronPressNavigateOutBound(oController, sOutboundTarget, oContext, sCreatePath) {
      var oOutbounds = oController.getAppComponent().getRoutingService().getOutbounds();
      var oDisplayOutbound = oOutbounds[sOutboundTarget];
      var additionalNavigationParameters;
      if (oDisplayOutbound && oDisplayOutbound.semanticObject && oDisplayOutbound.action) {
        var oRefreshStrategies = {
          intents: {}
        };
        var oDefaultRefreshStrategy = {};
        var sMetaPath;
        if (oContext) {
          if (oContext.isA && oContext.isA("sap.ui.model.odata.v4.Context")) {
            sMetaPath = ModelHelper.getMetaPathForContext(oContext);
            oContext = [oContext];
          } else {
            sMetaPath = ModelHelper.getMetaPathForContext(oContext[0]);
          }
          oDefaultRefreshStrategy[sMetaPath] = "self";
          oRefreshStrategies["_feDefault"] = oDefaultRefreshStrategy;
        }
        if (sCreatePath) {
          var sKey = "".concat(oDisplayOutbound.semanticObject, "-").concat(oDisplayOutbound.action);
          oRefreshStrategies.intents[sKey] = {};
          oRefreshStrategies.intents[sKey][sCreatePath] = "self";
        }
        if (oDisplayOutbound && oDisplayOutbound.parameters) {
          var oParams = oDisplayOutbound.parameters && this.getOutboundParams(oDisplayOutbound.parameters);
          if (Object.keys(oParams).length > 0) {
            additionalNavigationParameters = oParams;
          }
        }
        oController._intentBasedNavigation.navigate(oDisplayOutbound.semanticObject, oDisplayOutbound.action, {
          navigationContexts: oContext,
          refreshStrategies: oRefreshStrategies,
          additionalNavigationParameters: additionalNavigationParameters
        });

        //TODO: check why returning a promise is required
        return Promise.resolve();
      } else {
        throw new Error("outbound target ".concat(sOutboundTarget, " not found in cross navigation definition of manifest"));
      }
    };
    return InternalIntentBasedNavigation;
  }(ControllerExtension), (_applyDecoratedDescriptor(_class2.prototype, "onInit", [_dec2], Object.getOwnPropertyDescriptor(_class2.prototype, "onInit"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigate", [_dec3, _dec4], Object.getOwnPropertyDescriptor(_class2.prototype, "navigate"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "prepareContextForExternalNavigation", [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class2.prototype, "prepareContextForExternalNavigation"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "prepareFiltersForExternalNavigation", [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, "prepareFiltersForExternalNavigation"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getNavigationMode", [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2.prototype, "getNavigationMode"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateWithConfirmationDialog", [_dec11, _dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateWithConfirmationDialog"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getEntitySet", [_dec13], Object.getOwnPropertyDescriptor(_class2.prototype, "getEntitySet"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "removeSensitiveData", [_dec14, _dec15], Object.getOwnPropertyDescriptor(_class2.prototype, "removeSensitiveData"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "navigateOutbound", [_dec16, _dec17], Object.getOwnPropertyDescriptor(_class2.prototype, "navigateOutbound"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "getOutboundParams", [_dec18, _dec19], Object.getOwnPropertyDescriptor(_class2.prototype, "getOutboundParams"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onChevronPressNavigateOutBound", [_dec20, _dec21], Object.getOwnPropertyDescriptor(_class2.prototype, "onChevronPressNavigateOutBound"), _class2.prototype)), _class2)) || _class);
  return InternalIntentBasedNavigation;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbiIsImRlZmluZVVJNUNsYXNzIiwibWV0aG9kT3ZlcnJpZGUiLCJwdWJsaWNFeHRlbnNpb24iLCJmaW5hbEV4dGVuc2lvbiIsImV4dGVuc2libGUiLCJPdmVycmlkZUV4ZWN1dGlvbiIsIkluc3RlYWQiLCJwcml2YXRlRXh0ZW5zaW9uIiwib25Jbml0IiwiX29BcHBDb21wb25lbnQiLCJiYXNlIiwiZ2V0QXBwQ29tcG9uZW50IiwiX29NZXRhTW9kZWwiLCJnZXRNb2RlbCIsImdldE1ldGFNb2RlbCIsIl9vTmF2aWdhdGlvblNlcnZpY2UiLCJnZXROYXZpZ2F0aW9uU2VydmljZSIsIl9vVmlldyIsImdldFZpZXciLCJuYXZpZ2F0ZSIsInNTZW1hbnRpY09iamVjdCIsInNBY3Rpb24iLCJtTmF2aWdhdGlvblBhcmFtZXRlcnMiLCJfZG9OYXZpZ2F0ZSIsIm9Db250ZXh0Iiwidk5hdmlnYXRpb25Db250ZXh0cyIsIm5hdmlnYXRpb25Db250ZXh0cyIsImFOYXZpZ2F0aW9uQ29udGV4dHMiLCJBcnJheSIsImlzQXJyYXkiLCJ2U2VtYW50aWNPYmplY3RNYXBwaW5nIiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwidk91dGJvdW5kUGFyYW1zIiwiYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzIiwib1RhcmdldEluZm8iLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsIm9WaWV3Iiwib0NvbnRyb2xsZXIiLCJnZXRDb250cm9sbGVyIiwic2V0QmluZGluZ0NvbnRleHQiLCJhU2VtYW50aWNBdHRyaWJ1dGVzIiwib1NlbGVjdGlvblZhcmlhbnQiLCJTZWxlY3Rpb25WYXJpYW50IiwibGVuZ3RoIiwiZm9yRWFjaCIsIm9OYXZpZ2F0aW9uQ29udGV4dCIsImlzQSIsIm9TZW1hbnRpY0F0dHJpYnV0ZXMiLCJnZXRPYmplY3QiLCJzTWV0YVBhdGgiLCJnZXRNZXRhUGF0aCIsImdldFBhdGgiLCJyZW1vdmVTZW5zaXRpdmVEYXRhIiwib05hdkNvbnRleHQiLCJwcmVwYXJlQ29udGV4dEZvckV4dGVybmFsTmF2aWdhdGlvbiIsInByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3QiLCJwdXNoIiwic2VtYW50aWNBdHRyaWJ1dGVzIiwiZGF0YSIsIm1ldGFQYXRoIiwibWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQiLCJ0b0pTT05TdHJpbmciLCJvTW9kZWwiLCJzRW50aXR5U2V0IiwiZ2V0RW50aXR5U2V0Iiwic0NvbnRleHRVcmwiLCJjb25zdHJ1Y3RDb250ZXh0VXJsIiwidW5kZWZpbmVkIiwic2V0RmlsdGVyQ29udGV4dFVybCIsIl9hcHBseU91dGJvdW5kUGFyYW1zIiwiaW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiYWRhcHROYXZpZ2F0aW9uQ29udGV4dCIsIl9hcHBseVNlbWFudGljT2JqZWN0TWFwcGluZ3MiLCJfcmVtb3ZlVGVjaG5pY2FsUGFyYW1ldGVycyIsInNOYXZNb2RlIiwiX2ludGVudEJhc2VkTmF2aWdhdGlvbiIsImdldE5hdmlnYXRpb25Nb2RlIiwibVJlZnJlc2hTdHJhdGVnaWVzIiwicmVmcmVzaFN0cmF0ZWdpZXMiLCJvSW50ZXJuYWxNb2RlbCIsImdldFZpZXdEYXRhIiwicmVmcmVzaFN0cmF0ZWd5T25BcHBSZXN0b3JlIiwibVZpZXdSZWZyZXNoU3RyYXRlZ2llcyIsIm1lcmdlT2JqZWN0cyIsIm1SZWZyZXNoU3RyYXRlZ3kiLCJLZWVwQWxpdmVIZWxwZXIiLCJnZXRSZWZyZXNoU3RyYXRlZ3lGb3JJbnRlbnQiLCJzZXRQcm9wZXJ0eSIsIm9uRXJyb3IiLCJzYXAiLCJ1aSIsInJlcXVpcmUiLCJNZXNzYWdlQm94Iiwib1Jlc291cmNlQnVuZGxlIiwiQ29yZSIsImdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZSIsImVycm9yIiwiZ2V0VGV4dCIsInRpdGxlIiwiRXJyb3IiLCJvQmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIm9NZXRhTW9kZWwiLCJjb252ZXJ0ZXJUeXBlIiwiTW9kZWxIZWxwZXIiLCJpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQiLCJkcmFmdCIsInByb2Nlc3NEYXRhTG9zc09yRHJhZnREaXNjYXJkQ29uZmlybWF0aW9uIiwiYmluZCIsIkZ1bmN0aW9uIiwicHJvdG90eXBlIiwiTmF2aWdhdGlvblR5cGUiLCJGb3J3YXJkTmF2aWdhdGlvbiIsIm9EaXN0aW5jdEtleXMiLCJzQ29udGV4dFBhdGgiLCJhTWV0YVBhdGhQYXJ0cyIsInNwbGl0IiwiZmlsdGVyIiwiQm9vbGVhbiIsIl9maW5kRGlzdGluY3RLZXlzSW5PYmplY3QiLCJMb29rVXBPYmplY3QiLCJzTG9va1VwT2JqZWN0TWV0YVBhdGgiLCJzS2V5Iiwib05ld0xvb2tVcE9iamVjdCIsInNNYWluRW50aXR5U2V0TmFtZSIsInNNYWluRW50aXR5VHlwZU5hbWUiLCJvUHJvcGVydGllc1dpdGhvdXRDb25mbGljdCIsInNNYWluRW50aXR5VmFsdWVQYXRoIiwic0N1cnJlbnRWYWx1ZVBhdGgiLCJzTGFzdFZhbHVlUGF0aCIsInNEaXN0aW5jdEtleSIsImFDb25mbGljdGluZ1BhdGhzIiwic1dpbm5lclZhbHVlUGF0aCIsImkiLCJzUGF0aCIsInNQYXRoSW5Db250ZXh0IiwicmVwbGFjZSIsInNFbnRpdHlUeXBlTmFtZSIsInNWYWx1ZSIsImpvaW4iLCJnZXRQcm9wZXJ0eSIsInNQcm9wZXJ0eSIsInByZXBhcmVGaWx0ZXJzRm9yRXh0ZXJuYWxOYXZpZ2F0aW9uIiwib0ZpbHRlckJhckNvbmRpdGlvbnMiLCJzUm9vdFBhdGgiLCJhUGFyYW1ldGVycyIsIm9GaWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0Iiwic0Z1bGxDb250ZXh0UGF0aCIsImluY2x1ZGVzIiwiYVBhdGhQYXJ0cyIsInJlcGxhY2VBbGwiLCJmaWx0ZXJDb25kaXRpb25zIiwiZmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdCIsIm5hdmlnYXRlV2l0aENvbmZpcm1hdGlvbkRpYWxvZyIsIm5vdEFwcGxpY2FibGVDb250ZXh0cyIsIm9BcHBsaWNhYmxlQ29udGV4dERpYWxvZyIsIm9uQ2xvc2UiLCJjbG9zZSIsIm9uQ29udGludWUiLCJhcHBsaWNhYmxlQ29udGV4dHMiLCJmbk9wZW5BbmRGaWxsRGlhbG9nIiwib0RpYWxvZ0NvbnRlbnQiLCJuTm90QXBwbGljYWJsZSIsImFOb3RBcHBsaWNhYmxlSXRlbXMiLCJvTm90QXBwbGljYWJsZUl0ZW1zTW9kZWwiLCJKU09OTW9kZWwiLCJvVG90YWxzIiwidG90YWwiLCJsYWJlbCIsInNldE1vZGVsIiwib3BlbiIsInNGcmFnbWVudE5hbWUiLCJvRGlhbG9nRnJhZ21lbnQiLCJYTUxUZW1wbGF0ZVByb2Nlc3NvciIsImxvYWRUZW1wbGF0ZSIsInNDYW5vbmljYWxQYXRoIiwiZ2V0Q2Fub25pY2FsUGF0aCIsInN1YnN0ciIsImluZGV4T2YiLCJQcm9taXNlIiwicmVzb2x2ZSIsIlhNTFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJuYW1lIiwiYmluZGluZ0NvbnRleHRzIiwiZW50aXR5VHlwZSIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwibW9kZWxzIiwibWV0YU1vZGVsIiwidGhlbiIsIm9GcmFnbWVudCIsIkZyYWdtZW50IiwibG9hZCIsImRlZmluaXRpb24iLCJjb250cm9sbGVyIiwib1BvcG92ZXIiLCJhZGREZXBlbmRlbnQiLCJjYXRjaCIsIkxvZyIsInJlbW92ZVNlbGVjdE9wdGlvbiIsImVudGl0eVNldCIsIm9BdHRyaWJ1dGVzIiwiYVByb3BlcnRpZXMiLCJPYmplY3QiLCJrZXlzIiwiaiIsInNQcm9wIiwiYVByb3BlcnR5QW5ub3RhdGlvbnMiLCJvRmllbGRDb250cm9sIiwiX2lzRmllbGRDb250cm9sUGF0aEluYXBwbGljYWJsZSIsInNGaWVsZENvbnRyb2xQYXRoIiwib0F0dHJpYnV0ZSIsImJJbmFwcGxpY2FibGUiLCJhUGFydHMiLCJoYXNPd25Qcm9wZXJ0eSIsInZNYXBwaW5ncyIsIm9NYXBwaW5ncyIsIkpTT04iLCJwYXJzZSIsInNMb2NhbFByb3BlcnR5Iiwic1NlbWFudGljT2JqZWN0UHJvcGVydHkiLCJnZXRTZWxlY3RPcHRpb24iLCJvU2VsZWN0T3B0aW9uIiwibWFzc0FkZFNlbGVjdE9wdGlvbiIsIm5hdmlnYXRlT3V0Ym91bmQiLCJzT3V0Ym91bmQiLCJhTmF2UGFyYW1zIiwib01hbmlmZXN0RW50cnkiLCJnZXRNYW5pZmVzdEVudHJ5Iiwib091dGJvdW5kIiwiY3Jvc3NOYXZpZ2F0aW9uIiwib3V0Ym91bmRzIiwib3V0Ym91bmRQYXJhbXMiLCJwYXJhbWV0ZXJzIiwiZ2V0T3V0Ym91bmRQYXJhbXMiLCJrZXkiLCJvUGFyYW1zIiwiYVZhbHVlcyIsImFTZWxlY3RQcm9wZXJ0aWVzIiwiZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMiLCJhZGRTZWxlY3RPcHRpb24iLCJvT3V0Ym91bmRQYXJhbXMiLCJvUGFyYW1zTWFwcGluZyIsIm9NYXBwaW5nIiwidmFsdWUiLCJmb3JtYXQiLCJvbkNoZXZyb25QcmVzc05hdmlnYXRlT3V0Qm91bmQiLCJzT3V0Ym91bmRUYXJnZXQiLCJzQ3JlYXRlUGF0aCIsIm9PdXRib3VuZHMiLCJnZXRSb3V0aW5nU2VydmljZSIsImdldE91dGJvdW5kcyIsIm9EaXNwbGF5T3V0Ym91bmQiLCJvUmVmcmVzaFN0cmF0ZWdpZXMiLCJpbnRlbnRzIiwib0RlZmF1bHRSZWZyZXNoU3RyYXRlZ3kiLCJnZXRNZXRhUGF0aEZvckNvbnRleHQiLCJDb250cm9sbGVyRXh0ZW5zaW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJJbnRlcm5hbEludGVudEJhc2VkTmF2aWdhdGlvbi50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBtZXJnZU9iamVjdHMgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgZHJhZnQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L2RyYWZ0XCI7XG5pbXBvcnQge1xuXHRkZWZpbmVVSTVDbGFzcyxcblx0ZXh0ZW5zaWJsZSxcblx0ZmluYWxFeHRlbnNpb24sXG5cdG1ldGhvZE92ZXJyaWRlLFxuXHRwcml2YXRlRXh0ZW5zaW9uLFxuXHRwdWJsaWNFeHRlbnNpb25cbn0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgS2VlcEFsaXZlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0tlZXBBbGl2ZUhlbHBlclwiO1xuaW1wb3J0IE1vZGVsSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIHsgTmF2aWdhdGlvblNlcnZpY2UgfSBmcm9tIFwic2FwL2ZlL2NvcmUvc2VydmljZXMvTmF2aWdhdGlvblNlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgU2VsZWN0aW9uVmFyaWFudCBmcm9tIFwic2FwL2ZlL25hdmlnYXRpb24vU2VsZWN0aW9uVmFyaWFudFwiO1xuaW1wb3J0IHR5cGUgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgQ29udHJvbGxlckV4dGVuc2lvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL0NvbnRyb2xsZXJFeHRlbnNpb25cIjtcbmltcG9ydCBPdmVycmlkZUV4ZWN1dGlvbiBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL092ZXJyaWRlRXhlY3V0aW9uXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCBYTUxUZW1wbGF0ZVByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvWE1MVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxuLyoqXG4gKiB7QGxpbmsgc2FwLnVpLmNvcmUubXZjLkNvbnRyb2xsZXJFeHRlbnNpb24gQ29udHJvbGxlciBleHRlbnNpb259XG4gKlxuICogQG5hbWVzcGFjZVxuICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVybmFsSW50ZXJuYWxCYXNlZE5hdmlnYXRpb25cbiAqIEBwcml2YXRlXG4gKiBAc2luY2UgMS44NC4wXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVybmFsSW50ZXJuYWxCYXNlZE5hdmlnYXRpb25cIilcbmNsYXNzIEludGVybmFsSW50ZW50QmFzZWROYXZpZ2F0aW9uIGV4dGVuZHMgQ29udHJvbGxlckV4dGVuc2lvbiB7XG5cdHByb3RlY3RlZCBiYXNlITogUGFnZUNvbnRyb2xsZXI7XG5cdHByaXZhdGUgX29BcHBDb21wb25lbnQhOiBBcHBDb21wb25lbnQ7XG5cdHByaXZhdGUgX29NZXRhTW9kZWwhOiBPRGF0YU1ldGFNb2RlbDtcblx0cHJpdmF0ZSBfb05hdmlnYXRpb25TZXJ2aWNlITogTmF2aWdhdGlvblNlcnZpY2U7XG5cdHByaXZhdGUgX29WaWV3ITogVmlldztcblx0QG1ldGhvZE92ZXJyaWRlKClcblx0b25Jbml0KCkge1xuXHRcdHRoaXMuX29BcHBDb21wb25lbnQgPSB0aGlzLmJhc2UuZ2V0QXBwQ29tcG9uZW50KCk7XG5cdFx0dGhpcy5fb01ldGFNb2RlbCA9IHRoaXMuX29BcHBDb21wb25lbnQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHR0aGlzLl9vTmF2aWdhdGlvblNlcnZpY2UgPSB0aGlzLl9vQXBwQ29tcG9uZW50LmdldE5hdmlnYXRpb25TZXJ2aWNlKCk7XG5cdFx0dGhpcy5fb1ZpZXcgPSB0aGlzLmJhc2UuZ2V0VmlldygpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEVuYWJsZXMgaW50ZW50LWJhc2VkIG5hdmlnYXRpb24gKFNlbWFudGljT2JqZWN0LUFjdGlvbikgd2l0aCB0aGUgcHJvdmlkZWQgY29udGV4dC5cblx0ICogSWYgc2VtYW50aWMgb2JqZWN0IG1hcHBpbmcgaXMgcHJvdmlkZWQsIHRoaXMgaXMgYWxzbyBhcHBsaWVkIHRvIHRoZSBzZWxlY3Rpb24gdmFyaWFudCBhZnRlciB0aGUgYWRhcHRhdGlvbiBieSBhIGNvbnN1bWVyLlxuXHQgKiBUaGlzIHRha2VzIGNhcmUgb2YgcmVtb3ZpbmcgYW55IHRlY2huaWNhbCBwYXJhbWV0ZXJzIGFuZCBkZXRlcm1pbmVzIGlmIGFuIGV4cGxhY2Ugb3IgaW5wbGFjZSBuYXZpZ2F0aW9uIHNob3VsZCB0YWtlIHBsYWNlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1NlbWFudGljT2JqZWN0IFNlbWFudGljIG9iamVjdCBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIHNBY3Rpb24gIEFjdGlvbiBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnNdIE9wdGlvbmFsIHBhcmFtZXRlcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBleHRlcm5hbCBuYXZpZ2F0aW9uXG5cdCAqIEBwYXJhbSBbbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5hdmlnYXRpb25Db250ZXh0c10gVXNlcyBvbmUgb2YgdGhlIGZvbGxvd2luZyB0byBiZSBwYXNzZWQgdG8gdGhlIGludGVudDpcblx0ICogICAgYSBzaW5nbGUgaW5zdGFuY2Ugb2Yge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fVxuXHQgKiAgICBtdWx0aXBsZSBpbnN0YW5jZXMgb2Yge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fVxuXHQgKiAgICBhbiBvYmplY3Qgb3IgYW4gYXJyYXkgb2Ygb2JqZWN0c1xuXHQgKlx0XHQgIElmIGFuIGFycmF5IG9mIG9iamVjdHMgaXMgcGFzc2VkLCB0aGUgY29udGV4dCBpcyB1c2VkIHRvIGRldGVybWluZSB0aGUgbWV0YVBhdGggYW5kIHRvIHJlbW92ZSBhbnkgc2Vuc2l0aXZlIGRhdGFcblx0ICpcdFx0ICBJZiBhbiBhcnJheSBvZiBvYmplY3RzIGlzIHBhc3NlZCwgdGhlIGZvbGxvd2luZyBmb3JtYXQgaXggZXhwZWN0ZWQ6XG5cdCAqXHRcdCAge1xuXHQgKlx0XHRcdGRhdGE6IHtcblx0ICpcdCBcdFx0XHRQcm9kdWN0SUQ6IDc2MzQsXG5cdCAqXHRcdFx0XHROYW1lOiBcIkxhcHRvcFwiXG5cdCAqXHRcdFx0IH0sXG5cdCAqXHRcdFx0IG1ldGFQYXRoOiBcIi9TYWxlc09yZGVyTWFuYWdlXCJcblx0ICogICAgICAgIH1cblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnMuc2VtYW50aWNPYmplY3RNYXBwaW5nXSBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIFNlbWFudGljT2JqZWN0TWFwcGluZyBvciBTZW1hbnRpY09iamVjdE1hcHBpbmcgdGhhdCBhcHBsaWVzIHRvIHRoaXMgbmF2aWdhdGlvblxuXHQgKiBAcGFyYW0gW21OYXZpZ2F0aW9uUGFyYW1ldGVycy5kZWZhdWx0UmVmcmVzaFN0cmF0ZWd5XSBEZWZhdWx0IHJlZnJlc2ggc3RyYXRlZ3kgdG8gYmUgdXNlZCBpbiBjYXNlIG5vIHJlZnJlc2ggc3RyYXRlZ3kgaXMgc3BlY2lmaWVkIGZvciB0aGUgaW50ZW50IGluIHRoZSB2aWV3LlxuXHQgKiBAcGFyYW0gW21OYXZpZ2F0aW9uUGFyYW1ldGVycy5yZWZyZXNoU3RyYXRlZ2llc11cblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnMuYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzXSBBZGRpdGlvbmFsIG5hdmlnYXRpb24gcGFyYW1ldGVycyBjb25maWd1cmVkIGluIHRoZSBjcm9zc0FwcE5hdmlnYXRpb24gb3V0Ym91bmQgcGFyYW1ldGVycy5cblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZShcblx0XHRzU2VtYW50aWNPYmplY3Q6IHN0cmluZyxcblx0XHRzQWN0aW9uOiBzdHJpbmcsXG5cdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzOlxuXHRcdFx0fCB7XG5cdFx0XHRcdFx0bmF2aWdhdGlvbkNvbnRleHRzPzogb2JqZWN0IHwgYW55W10gfCB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nPzogc3RyaW5nIHwgb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0XHRcdGRlZmF1bHRSZWZyZXNoU3RyYXRlZ3k/OiBvYmplY3QgfCB1bmRlZmluZWQ7XG5cdFx0XHRcdFx0cmVmcmVzaFN0cmF0ZWdpZXM/OiBhbnk7XG5cdFx0XHRcdFx0YWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzPzogb2JqZWN0IHwgdW5kZWZpbmVkO1xuXHRcdFx0ICB9XG5cdFx0XHR8IHVuZGVmaW5lZFxuXHQpIHtcblx0XHRjb25zdCBfZG9OYXZpZ2F0ZSA9IChvQ29udGV4dD86IGFueSkgPT4ge1xuXHRcdFx0Y29uc3Qgdk5hdmlnYXRpb25Db250ZXh0cyA9IG1OYXZpZ2F0aW9uUGFyYW1ldGVycyAmJiBtTmF2aWdhdGlvblBhcmFtZXRlcnMubmF2aWdhdGlvbkNvbnRleHRzLFxuXHRcdFx0XHRhTmF2aWdhdGlvbkNvbnRleHRzID1cblx0XHRcdFx0XHR2TmF2aWdhdGlvbkNvbnRleHRzICYmICFBcnJheS5pc0FycmF5KHZOYXZpZ2F0aW9uQ29udGV4dHMpID8gW3ZOYXZpZ2F0aW9uQ29udGV4dHNdIDogdk5hdmlnYXRpb25Db250ZXh0cyxcblx0XHRcdFx0dlNlbWFudGljT2JqZWN0TWFwcGluZyA9IG1OYXZpZ2F0aW9uUGFyYW1ldGVycyAmJiBtTmF2aWdhdGlvblBhcmFtZXRlcnMuc2VtYW50aWNPYmplY3RNYXBwaW5nLFxuXHRcdFx0XHR2T3V0Ym91bmRQYXJhbXMgPSBtTmF2aWdhdGlvblBhcmFtZXRlcnMgJiYgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLmFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVycyxcblx0XHRcdFx0b1RhcmdldEluZm86IGFueSA9IHtcblx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogc1NlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdGFjdGlvbjogc0FjdGlvblxuXHRcdFx0XHR9LFxuXHRcdFx0XHRvVmlldyA9IHRoaXMuYmFzZS5nZXRWaWV3KCksXG5cdFx0XHRcdG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyO1xuXG5cdFx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdFx0dGhpcy5fb1ZpZXcuc2V0QmluZGluZ0NvbnRleHQob0NvbnRleHQpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoc1NlbWFudGljT2JqZWN0ICYmIHNBY3Rpb24pIHtcblx0XHRcdFx0bGV0IGFTZW1hbnRpY0F0dHJpYnV0ZXM6IGFueVtdID0gW10sXG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQ6IGFueSA9IG5ldyBTZWxlY3Rpb25WYXJpYW50KCk7XG5cdFx0XHRcdC8vIDEuIGdldCBTZW1hbnRpY0F0dHJpYnV0ZXMgZm9yIG5hdmlnYXRpb25cblx0XHRcdFx0aWYgKGFOYXZpZ2F0aW9uQ29udGV4dHMgJiYgYU5hdmlnYXRpb25Db250ZXh0cy5sZW5ndGgpIHtcblx0XHRcdFx0XHRhTmF2aWdhdGlvbkNvbnRleHRzLmZvckVhY2goKG9OYXZpZ2F0aW9uQ29udGV4dDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHQvLyAxLjEuYSBpZiBuYXZpZ2F0aW9uIGNvbnRleHQgaXMgaW5zdGFuY2Ugb2Ygc2FwLnVpLm1vZGUub2RhdGEudjQuQ29udGV4dFxuXHRcdFx0XHRcdFx0Ly8gZWxzZSBjaGVjayBpZiBuYXZpZ2F0aW9uIGNvbnRleHQgaXMgb2YgdHlwZSBvYmplY3Rcblx0XHRcdFx0XHRcdGlmIChvTmF2aWdhdGlvbkNvbnRleHQuaXNBICYmIG9OYXZpZ2F0aW9uQ29udGV4dC5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dFwiKSkge1xuXHRcdFx0XHRcdFx0XHQvLyAxLjEuYiByZW1vdmUgc2Vuc2l0aXZlIGRhdGFcblx0XHRcdFx0XHRcdFx0bGV0IG9TZW1hbnRpY0F0dHJpYnV0ZXMgPSBvTmF2aWdhdGlvbkNvbnRleHQuZ2V0T2JqZWN0KCk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IHNNZXRhUGF0aCA9IHRoaXMuX29NZXRhTW9kZWwuZ2V0TWV0YVBhdGgob05hdmlnYXRpb25Db250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRcdFx0XHRcdC8vIFRPRE86IGFsc28gcmVtb3ZlIHNlbnNpdGl2ZSBkYXRhIGZyb20gIG5hdmlnYXRpb24gcHJvcGVydGllc1xuXHRcdFx0XHRcdFx0XHRvU2VtYW50aWNBdHRyaWJ1dGVzID0gdGhpcy5yZW1vdmVTZW5zaXRpdmVEYXRhKG9TZW1hbnRpY0F0dHJpYnV0ZXMsIHNNZXRhUGF0aCk7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9OYXZDb250ZXh0ID0gdGhpcy5wcmVwYXJlQ29udGV4dEZvckV4dGVybmFsTmF2aWdhdGlvbihvU2VtYW50aWNBdHRyaWJ1dGVzLCBvTmF2aWdhdGlvbkNvbnRleHQpO1xuXHRcdFx0XHRcdFx0XHRvVGFyZ2V0SW5mb1tcInByb3BlcnRpZXNXaXRob3V0Q29uZmxpY3RcIl0gPSBvTmF2Q29udGV4dC5wcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0O1xuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNBdHRyaWJ1dGVzLnB1c2gob05hdkNvbnRleHQuc2VtYW50aWNBdHRyaWJ1dGVzKTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdFx0XHRcdCEob05hdmlnYXRpb25Db250ZXh0ICYmIEFycmF5LmlzQXJyYXkob05hdmlnYXRpb25Db250ZXh0LmRhdGEpKSAmJlxuXHRcdFx0XHRcdFx0XHR0eXBlb2Ygb05hdmlnYXRpb25Db250ZXh0ID09PSBcIm9iamVjdFwiXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0Ly8gMS4xLmIgcmVtb3ZlIHNlbnNpdGl2ZSBkYXRhIGZyb20gb2JqZWN0XG5cdFx0XHRcdFx0XHRcdGFTZW1hbnRpY0F0dHJpYnV0ZXMucHVzaCh0aGlzLnJlbW92ZVNlbnNpdGl2ZURhdGEob05hdmlnYXRpb25Db250ZXh0LmRhdGEsIG9OYXZpZ2F0aW9uQ29udGV4dC5tZXRhUGF0aCkpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChvTmF2aWdhdGlvbkNvbnRleHQgJiYgQXJyYXkuaXNBcnJheShvTmF2aWdhdGlvbkNvbnRleHQuZGF0YSkpIHtcblx0XHRcdFx0XHRcdFx0Ly8gb05hdmlnYXRpb25Db250ZXh0LmRhdGEgY2FuIGJlIGFycmF5IGFscmVhZHkgZXggOiBbe0N1c3RvbWVyOiBcIjEwMDAxXCJ9LCB7Q3VzdG9tZXI6IFwiMTAwOTFcIn1dXG5cdFx0XHRcdFx0XHRcdC8vIGhlbmNlIGFzc2lnbmluZyBpdCB0byB0aGUgYVNlbWFudGljQXR0cmlidXRlc1xuXHRcdFx0XHRcdFx0XHRhU2VtYW50aWNBdHRyaWJ1dGVzID0gdGhpcy5yZW1vdmVTZW5zaXRpdmVEYXRhKG9OYXZpZ2F0aW9uQ29udGV4dC5kYXRhLCBvTmF2aWdhdGlvbkNvbnRleHQubWV0YVBhdGgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdC8vIDIuMSBNZXJnZSBiYXNlIHNlbGVjdGlvbiB2YXJpYW50IGFuZCBzYW5pdGl6ZWQgc2VtYW50aWMgYXR0cmlidXRlcyBpbnRvIG9uZSBTZWxlY3Rpb25WYXJpYW50XG5cdFx0XHRcdGlmIChhU2VtYW50aWNBdHRyaWJ1dGVzICYmIGFTZW1hbnRpY0F0dHJpYnV0ZXMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQgPSB0aGlzLl9vTmF2aWdhdGlvblNlcnZpY2UubWl4QXR0cmlidXRlc0FuZFNlbGVjdGlvblZhcmlhbnQoXG5cdFx0XHRcdFx0XHRhU2VtYW50aWNBdHRyaWJ1dGVzLFxuXHRcdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQudG9KU09OU3RyaW5nKClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gMy4gQWRkIGZpbHRlckNvbnRleHRVcmwgdG8gU1Ygc28gdGhlIE5hdmlnYXRpb25IYW5kbGVyIGNhbiByZW1vdmUgYW55IHNlbnNpdGl2ZSBkYXRhIGJhc2VkIG9uIHZpZXcgZW50aXR5U2V0XG5cdFx0XHRcdGNvbnN0IG9Nb2RlbCA9IHRoaXMuX29WaWV3LmdldE1vZGVsKCksXG5cdFx0XHRcdFx0c0VudGl0eVNldCA9IHRoaXMuZ2V0RW50aXR5U2V0KCksXG5cdFx0XHRcdFx0c0NvbnRleHRVcmwgPSBzRW50aXR5U2V0ID8gdGhpcy5fb05hdmlnYXRpb25TZXJ2aWNlLmNvbnN0cnVjdENvbnRleHRVcmwoc0VudGl0eVNldCwgb01vZGVsKSA6IHVuZGVmaW5lZDtcblx0XHRcdFx0aWYgKHNDb250ZXh0VXJsKSB7XG5cdFx0XHRcdFx0b1NlbGVjdGlvblZhcmlhbnQuc2V0RmlsdGVyQ29udGV4dFVybChzQ29udGV4dFVybCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBBcHBseSBPdXRib3VuZCBQYXJhbWV0ZXJzIHRvIHRoZSBTVlxuXHRcdFx0XHRpZiAodk91dGJvdW5kUGFyYW1zKSB7XG5cdFx0XHRcdFx0dGhpcy5fYXBwbHlPdXRib3VuZFBhcmFtcyhvU2VsZWN0aW9uVmFyaWFudCwgdk91dGJvdW5kUGFyYW1zKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIDQuIGdpdmUgYW4gb3Bwb3J0dW5pdHkgZm9yIHRoZSBhcHBsaWNhdGlvbiB0byBpbmZsdWVuY2UgdGhlIFNlbGVjdGlvblZhcmlhbnRcblx0XHRcdFx0b0NvbnRyb2xsZXIuaW50ZW50QmFzZWROYXZpZ2F0aW9uLmFkYXB0TmF2aWdhdGlvbkNvbnRleHQob1NlbGVjdGlvblZhcmlhbnQsIG9UYXJnZXRJbmZvKTtcblxuXHRcdFx0XHQvLyA1LiBBcHBseSBzZW1hbnRpYyBvYmplY3QgbWFwcGluZ3MgdG8gdGhlIFNWXG5cdFx0XHRcdGlmICh2U2VtYW50aWNPYmplY3RNYXBwaW5nKSB7XG5cdFx0XHRcdFx0dGhpcy5fYXBwbHlTZW1hbnRpY09iamVjdE1hcHBpbmdzKG9TZWxlY3Rpb25WYXJpYW50LCB2U2VtYW50aWNPYmplY3RNYXBwaW5nKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIDYuIHJlbW92ZSB0ZWNobmljYWwgcGFyYW1ldGVycyBmcm9tIFNlbGVjdGlvbiBWYXJpYW50XG5cdFx0XHRcdHRoaXMuX3JlbW92ZVRlY2huaWNhbFBhcmFtZXRlcnMob1NlbGVjdGlvblZhcmlhbnQpO1xuXG5cdFx0XHRcdC8vIDcuIGNoZWNrIGlmIHByb2dyYW1taW5nIG1vZGVsIGlzIHN0aWNreSBhbmQgcGFnZSBpcyBlZGl0YWJsZVxuXHRcdFx0XHRjb25zdCBzTmF2TW9kZSA9IG9Db250cm9sbGVyLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24uZ2V0TmF2aWdhdGlvbk1vZGUoKTtcblxuXHRcdFx0XHQvLyA4LiBVcGRhdGluZyByZWZyZXNoIHN0cmF0ZWd5IGluIGludGVybmFsIG1vZGVsXG5cdFx0XHRcdGNvbnN0IG1SZWZyZXNoU3RyYXRlZ2llcyA9IChtTmF2aWdhdGlvblBhcmFtZXRlcnMgJiYgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLnJlZnJlc2hTdHJhdGVnaWVzKSB8fCB7fSxcblx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbCA9IG9WaWV3LmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsO1xuXHRcdFx0XHRpZiAob0ludGVybmFsTW9kZWwpIHtcblx0XHRcdFx0XHRpZiAoKG9WaWV3ICYmIChvVmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSkpLnJlZnJlc2hTdHJhdGVneU9uQXBwUmVzdG9yZSkge1xuXHRcdFx0XHRcdFx0Y29uc3QgbVZpZXdSZWZyZXNoU3RyYXRlZ2llcyA9IChvVmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSkucmVmcmVzaFN0cmF0ZWd5T25BcHBSZXN0b3JlIHx8IHt9O1xuXHRcdFx0XHRcdFx0bWVyZ2VPYmplY3RzKG1SZWZyZXNoU3RyYXRlZ2llcywgbVZpZXdSZWZyZXNoU3RyYXRlZ2llcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IG1SZWZyZXNoU3RyYXRlZ3kgPSBLZWVwQWxpdmVIZWxwZXIuZ2V0UmVmcmVzaFN0cmF0ZWd5Rm9ySW50ZW50KG1SZWZyZXNoU3RyYXRlZ2llcywgc1NlbWFudGljT2JqZWN0LCBzQWN0aW9uKTtcblx0XHRcdFx0XHRpZiAobVJlZnJlc2hTdHJhdGVneSkge1xuXHRcdFx0XHRcdFx0b0ludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoXCIvcmVmcmVzaFN0cmF0ZWd5T25BcHBSZXN0b3JlXCIsIG1SZWZyZXNoU3RyYXRlZ3kpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIDkuIE5hdmlnYXRlIHZpYSBOYXZpZ2F0aW9uSGFuZGxlclxuXHRcdFx0XHRjb25zdCBvbkVycm9yID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHNhcC51aS5yZXF1aXJlKFtcInNhcC9tL01lc3NhZ2VCb3hcIl0sIGZ1bmN0aW9uIChNZXNzYWdlQm94OiBhbnkpIHtcblx0XHRcdFx0XHRcdGNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0XHRcdFx0XHRNZXNzYWdlQm94LmVycm9yKG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19DT01NT05fSEVMUEVSX05BVklHQVRJT05fRVJST1JfTUVTU0FHRVwiKSwge1xuXHRcdFx0XHRcdFx0XHR0aXRsZTogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX0NPTU1PTl9TQVBGRV9FUlJPUlwiKVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdHRoaXMuX29OYXZpZ2F0aW9uU2VydmljZS5uYXZpZ2F0ZShcblx0XHRcdFx0XHRzU2VtYW50aWNPYmplY3QsXG5cdFx0XHRcdFx0c0FjdGlvbixcblx0XHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC50b0pTT05TdHJpbmcoKSxcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0b25FcnJvcixcblx0XHRcdFx0XHR1bmRlZmluZWQsXG5cdFx0XHRcdFx0c05hdk1vZGVcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHRocm93IG5ldyBFcnJvcihcIlNlbWFudGljIE9iamVjdC9hY3Rpb24gaXMgbm90IHByb3ZpZGVkXCIpO1xuXHRcdFx0fVxuXHRcdH07XG5cdFx0Y29uc3Qgb0JpbmRpbmdDb250ZXh0ID0gdGhpcy5iYXNlLmdldFZpZXcoKS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQmluZGluZ0NvbnRleHQgJiYgKG9CaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0XHRpZiAoXG5cdFx0XHQodGhpcy5nZXRWaWV3KCkuZ2V0Vmlld0RhdGEoKSBhcyBhbnkpLmNvbnZlcnRlclR5cGUgPT09IFwiT2JqZWN0UGFnZVwiICYmXG5cdFx0XHRvTWV0YU1vZGVsICYmXG5cdFx0XHQhTW9kZWxIZWxwZXIuaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkKG9NZXRhTW9kZWwpXG5cdFx0KSB7XG5cdFx0XHRkcmFmdC5wcm9jZXNzRGF0YUxvc3NPckRyYWZ0RGlzY2FyZENvbmZpcm1hdGlvbihcblx0XHRcdFx0X2RvTmF2aWdhdGUuYmluZCh0aGlzKSxcblx0XHRcdFx0RnVuY3Rpb24ucHJvdG90eXBlLFxuXHRcdFx0XHR0aGlzLmJhc2UuZ2V0VmlldygpLmdldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRcdHRoaXMuYmFzZS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpLFxuXHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRkcmFmdC5OYXZpZ2F0aW9uVHlwZS5Gb3J3YXJkTmF2aWdhdGlvblxuXHRcdFx0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0X2RvTmF2aWdhdGUoKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUHJlcGFyZSBhdHRyaWJ1dGVzIHRvIGJlIHBhc3NlZCB0byBleHRlcm5hbCBuYXZpZ2F0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1NlbWFudGljQXR0cmlidXRlcyBDb250ZXh0IGRhdGEgYWZ0ZXIgcmVtb3ZpbmcgYWxsIHNlbnNpdGl2ZSBpbmZvcm1hdGlvbi5cblx0ICogQHBhcmFtIG9Db250ZXh0IEFjdHVhbCBjb250ZXh0IGZyb20gd2hpY2ggdGhlIHNlbWFudGljQXR0cmlidXRlcyB3ZXJlIGRlcml2ZWQuXG5cdCAqIEByZXR1cm5zIE9iamVjdCBvZiBwcmVwYXJlZCBhdHRyaWJ1dGVzIGZvciBleHRlcm5hbCBuYXZpZ2F0aW9uIGFuZCBubyBjb25mbGljdCBwcm9wZXJ0aWVzLlxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdHByZXBhcmVDb250ZXh0Rm9yRXh0ZXJuYWxOYXZpZ2F0aW9uKG9TZW1hbnRpY0F0dHJpYnV0ZXM6IGFueSwgb0NvbnRleHQ6IENvbnRleHQpIHtcblx0XHQvLyAxLiBGaW5kIGFsbCBkaXN0aW5jdCBrZXlzIGluIHRoZSBvYmplY3QgU2VtYW50aWNBdHRyaWJ1dGVzXG5cdFx0Ly8gU3RvcmUgbWV0YSBwYXRoIGZvciBlYWNoIG9jY3VyZW5jZSBvZiB0aGUga2V5XG5cdFx0Y29uc3Qgb0Rpc3RpbmN0S2V5czogYW55ID0ge30sXG5cdFx0XHRzQ29udGV4dFBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoc0NvbnRleHRQYXRoKSxcblx0XHRcdGFNZXRhUGF0aFBhcnRzID0gc01ldGFQYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoQm9vbGVhbik7XG5cblx0XHRmdW5jdGlvbiBfZmluZERpc3RpbmN0S2V5c0luT2JqZWN0KExvb2tVcE9iamVjdDogYW55LCBzTG9va1VwT2JqZWN0TWV0YVBhdGg6IGFueSkge1xuXHRcdFx0Zm9yIChjb25zdCBzS2V5IGluIExvb2tVcE9iamVjdCkge1xuXHRcdFx0XHQvLyBudWxsIGNhc2U/P1xuXHRcdFx0XHRpZiAoTG9va1VwT2JqZWN0W3NLZXldID09PSBudWxsIHx8IHR5cGVvZiBMb29rVXBPYmplY3Rbc0tleV0gIT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRpZiAoIW9EaXN0aW5jdEtleXNbc0tleV0pIHtcblx0XHRcdFx0XHRcdC8vIGlmIGtleSBpcyBmb3VuZCBmb3IgdGhlIGZpcnN0IHRpbWUgdGhlbiBjcmVhdGUgYXJyYXlcblx0XHRcdFx0XHRcdG9EaXN0aW5jdEtleXNbc0tleV0gPSBbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Ly8gcHVzaCBwYXRoIHRvIGFycmF5XG5cdFx0XHRcdFx0b0Rpc3RpbmN0S2V5c1tzS2V5XS5wdXNoKHNMb29rVXBPYmplY3RNZXRhUGF0aCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gaWYgYSBuZXN0ZWQgb2JqZWN0IGlzIGZvdW5kXG5cdFx0XHRcdFx0Y29uc3Qgb05ld0xvb2tVcE9iamVjdCA9IExvb2tVcE9iamVjdFtzS2V5XTtcblx0XHRcdFx0XHRfZmluZERpc3RpbmN0S2V5c0luT2JqZWN0KG9OZXdMb29rVXBPYmplY3QsIGAke3NMb29rVXBPYmplY3RNZXRhUGF0aH0vJHtzS2V5fWApO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0X2ZpbmREaXN0aW5jdEtleXNJbk9iamVjdChvU2VtYW50aWNBdHRyaWJ1dGVzLCBzTWV0YVBhdGgpO1xuXG5cdFx0Ly8gMi4gRGV0ZXJtaW5lIGRpc3RpbmN0IGtleSB2YWx1ZSBhbmQgYWRkIGNvbmZsaWN0ZWQgcGF0aHMgdG8gc2VtYW50aWMgYXR0cmlidXRlc1xuXHRcdGNvbnN0IHNNYWluRW50aXR5U2V0TmFtZSA9IGFNZXRhUGF0aFBhcnRzWzBdLFxuXHRcdFx0c01haW5FbnRpdHlUeXBlTmFtZSA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAvJHtzTWFpbkVudGl0eVNldE5hbWV9L0BzYXB1aS5uYW1lYCksXG5cdFx0XHRvUHJvcGVydGllc1dpdGhvdXRDb25mbGljdDogYW55ID0ge307XG5cdFx0bGV0IHNNYWluRW50aXR5VmFsdWVQYXRoLCBzQ3VycmVudFZhbHVlUGF0aCwgc0xhc3RWYWx1ZVBhdGg7XG5cdFx0Zm9yIChjb25zdCBzRGlzdGluY3RLZXkgaW4gb0Rpc3RpbmN0S2V5cykge1xuXHRcdFx0Y29uc3QgYUNvbmZsaWN0aW5nUGF0aHMgPSBvRGlzdGluY3RLZXlzW3NEaXN0aW5jdEtleV07XG5cdFx0XHRsZXQgc1dpbm5lclZhbHVlUGF0aDtcblx0XHRcdC8vIEZpbmQgd2lubmVyIHZhbHVlIGZvciBlYWNoIGRpc3RpbmN0IGtleSBpbiBjYXNlIG9mIGNvbmZsaWN0IGJ5IHRoZSBmb2xsb3dpbmcgcnVsZTpcblxuXHRcdFx0Ly8gLT4gQS4gaWYgYW55IG1ldGEgcGF0aCBmb3IgYSBkaXN0aW5jdCBrZXkgaXMgdGhlIHNhbWUgYXMgbWFpbiBlbnRpdHkgdGFrZSB0aGF0IGFzIHRoZSB2YWx1ZVxuXHRcdFx0Ly8gLT4gQi4gaWYgQSBpcyBub3QgbWV0IGtlZXAgdGhlIHZhbHVlIGZyb20gdGhlIGN1cnJlbnQgY29udGV4dCAoc01ldGFQYXRoID09PSBwYXRoIG9mIGRpc3RpbmNlIGtleSlcblx0XHRcdC8vIC0+IEMuIGlmIEEsIEIgb3IgQyBhcmUgbm90IG1ldCB0YWtlIHRoZSBsYXN0IHBhdGggZm9yIHZhbHVlXG5cdFx0XHRpZiAoYUNvbmZsaWN0aW5nUGF0aHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHQvLyBjb25mbGljdFxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8PSBhQ29uZmxpY3RpbmdQYXRocy5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdFx0XHRjb25zdCBzUGF0aCA9IGFDb25mbGljdGluZ1BhdGhzW2ldO1xuXHRcdFx0XHRcdGxldCBzUGF0aEluQ29udGV4dCA9IHNQYXRoLnJlcGxhY2Uoc1BhdGggPT09IHNNZXRhUGF0aCA/IHNNZXRhUGF0aCA6IGAke3NNZXRhUGF0aH0vYCwgXCJcIik7XG5cdFx0XHRcdFx0c1BhdGhJbkNvbnRleHQgPSAoc1BhdGhJbkNvbnRleHQgPT09IFwiXCIgPyBzUGF0aEluQ29udGV4dCA6IGAke3NQYXRoSW5Db250ZXh0fS9gKSArIHNEaXN0aW5jdEtleTtcblx0XHRcdFx0XHRjb25zdCBzRW50aXR5VHlwZU5hbWUgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzUGF0aH0vQHNhcHVpLm5hbWVgKTtcblx0XHRcdFx0XHQvLyBydWxlIEFcblxuXHRcdFx0XHRcdC8vIHJ1bGUgQVxuXHRcdFx0XHRcdGlmIChzRW50aXR5VHlwZU5hbWUgPT09IHNNYWluRW50aXR5VHlwZU5hbWUpIHtcblx0XHRcdFx0XHRcdHNNYWluRW50aXR5VmFsdWVQYXRoID0gc1BhdGhJbkNvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcnVsZSBCXG5cdFx0XHRcdFx0aWYgKHNQYXRoID09PSBzTWV0YVBhdGgpIHtcblx0XHRcdFx0XHRcdHNDdXJyZW50VmFsdWVQYXRoID0gc1BhdGhJbkNvbnRleHQ7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gcnVsZSBDXG5cdFx0XHRcdFx0c0xhc3RWYWx1ZVBhdGggPSBzUGF0aEluQ29udGV4dDtcblxuXHRcdFx0XHRcdC8vIGFkZCBjb25mbGljdGVkIHBhdGggdG8gc2VtYW50aWMgYXR0cmlidXRlc1xuXHRcdFx0XHRcdC8vIGNoZWNrIGlmIHRoZSBjdXJyZW50IHBhdGggcG9pbnRzIHRvIG1haW4gZW50aXR5IGFuZCBwcmVmaXggYXR0cmlidXRlIG5hbWVzIGFjY29yZGluZ2x5XG5cdFx0XHRcdFx0b1NlbWFudGljQXR0cmlidXRlc1tcblx0XHRcdFx0XHRcdGAke3NNZXRhUGF0aH0vJHtzUGF0aEluQ29udGV4dH1gXG5cdFx0XHRcdFx0XHRcdC5zcGxpdChcIi9cIilcblx0XHRcdFx0XHRcdFx0LmZpbHRlcihmdW5jdGlvbiAoc1ZhbHVlOiBzdHJpbmcpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc1ZhbHVlICE9IFwiXCI7XG5cdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdC5qb2luKFwiLlwiKVxuXHRcdFx0XHRcdF0gPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShzUGF0aEluQ29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gQSB8fCBCIHx8IENcblx0XHRcdFx0c1dpbm5lclZhbHVlUGF0aCA9IHNNYWluRW50aXR5VmFsdWVQYXRoIHx8IHNDdXJyZW50VmFsdWVQYXRoIHx8IHNMYXN0VmFsdWVQYXRoO1xuXHRcdFx0XHRvU2VtYW50aWNBdHRyaWJ1dGVzW3NEaXN0aW5jdEtleV0gPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShzV2lubmVyVmFsdWVQYXRoKTtcblx0XHRcdFx0c01haW5FbnRpdHlWYWx1ZVBhdGggPSB1bmRlZmluZWQ7XG5cdFx0XHRcdHNDdXJyZW50VmFsdWVQYXRoID0gdW5kZWZpbmVkO1xuXHRcdFx0XHRzTGFzdFZhbHVlUGF0aCA9IHVuZGVmaW5lZDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIG5vIGNvbmZsaWN0LCBhZGQgZGlzdGluY3Qga2V5IHdpdGhvdXQgYWRkaW5nIHBhdGhzXG5cdFx0XHRcdGNvbnN0IHNQYXRoID0gYUNvbmZsaWN0aW5nUGF0aHNbMF07IC8vIGJlY2F1c2UgdGhlcmUgaXMgb25seSBvbmUgYW5kIGhlbmNlIG5vIGNvbmZsaWN0XG5cdFx0XHRcdGxldCBzUGF0aEluQ29udGV4dCA9IHNQYXRoLnJlcGxhY2Uoc1BhdGggPT09IHNNZXRhUGF0aCA/IHNNZXRhUGF0aCA6IGAke3NNZXRhUGF0aH0vYCwgXCJcIik7XG5cdFx0XHRcdHNQYXRoSW5Db250ZXh0ID0gKHNQYXRoSW5Db250ZXh0ID09PSBcIlwiID8gc1BhdGhJbkNvbnRleHQgOiBgJHtzUGF0aEluQ29udGV4dH0vYCkgKyBzRGlzdGluY3RLZXk7XG5cdFx0XHRcdG9TZW1hbnRpY0F0dHJpYnV0ZXNbc0Rpc3RpbmN0S2V5XSA9IG9Db250ZXh0LmdldFByb3BlcnR5KHNQYXRoSW5Db250ZXh0KTtcblx0XHRcdFx0b1Byb3BlcnRpZXNXaXRob3V0Q29uZmxpY3Rbc0Rpc3RpbmN0S2V5XSA9IGAke3NNZXRhUGF0aH0vJHtzUGF0aEluQ29udGV4dH1gXG5cdFx0XHRcdFx0LnNwbGl0KFwiL1wiKVxuXHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKHNWYWx1ZTogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc1ZhbHVlICE9IFwiXCI7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuam9pbihcIi5cIik7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIDMuIFJlbW92ZSBhbGwgTmF2aWdhdGlvbiBwcm9wZXJ0aWVzXG5cdFx0Zm9yIChjb25zdCBzUHJvcGVydHkgaW4gb1NlbWFudGljQXR0cmlidXRlcykge1xuXHRcdFx0aWYgKG9TZW1hbnRpY0F0dHJpYnV0ZXNbc1Byb3BlcnR5XSAhPT0gbnVsbCAmJiB0eXBlb2Ygb1NlbWFudGljQXR0cmlidXRlc1tzUHJvcGVydHldID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdGRlbGV0ZSBvU2VtYW50aWNBdHRyaWJ1dGVzW3NQcm9wZXJ0eV07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB7XG5cdFx0XHRzZW1hbnRpY0F0dHJpYnV0ZXM6IG9TZW1hbnRpY0F0dHJpYnV0ZXMsXG5cdFx0XHRwcm9wZXJ0aWVzV2l0aG91dENvbmZsaWN0OiBvUHJvcGVydGllc1dpdGhvdXRDb25mbGljdFxuXHRcdH07XG5cdH1cblx0LyoqXG5cdCAqIFByZXBhcmUgZmlsdGVyIGNvbmRpdGlvbnMgdG8gYmUgcGFzc2VkIHRvIGV4dGVybmFsIG5hdmlnYXRpb24uXG5cdCAqXG5cdCAqIEBwYXJhbSBvRmlsdGVyQmFyQ29uZGl0aW9ucyBGaWx0ZXIgY29uZGl0aW9ucy5cblx0ICogQHBhcmFtIHNSb290UGF0aCBSb290IHBhdGggb2YgdGhlIGFwcGxpY2F0aW9uLlxuXHQgKiBAcGFyYW0gYVBhcmFtZXRlcnMgTmFtZXMgb2YgcGFyYW1ldGVycyB0byBiZSBjb25zaWRlcmVkLlxuXHQgKiBAcmV0dXJucyBPYmplY3Qgb2YgcHJlcGFyZWQgZmlsdGVyIGNvbmRpdGlvbnMgZm9yIGV4dGVybmFsIG5hdmlnYXRpb24gYW5kIG5vIGNvbmZsaWN0IGZpbHRlcnMuXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cHJlcGFyZUZpbHRlcnNGb3JFeHRlcm5hbE5hdmlnYXRpb24ob0ZpbHRlckJhckNvbmRpdGlvbnM6IGFueSwgc1Jvb3RQYXRoOiBzdHJpbmcsIGFQYXJhbWV0ZXJzPzogYW55W10pIHtcblx0XHRsZXQgc1BhdGg7XG5cdFx0Y29uc3Qgb0Rpc3RpbmN0S2V5czogYW55ID0ge307XG5cdFx0Y29uc3Qgb0ZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3Q6IGFueSA9IHt9O1xuXHRcdGxldCBzTWFpbkVudGl0eVZhbHVlUGF0aCwgc0N1cnJlbnRWYWx1ZVBhdGgsIHNGdWxsQ29udGV4dFBhdGgsIHNXaW5uZXJWYWx1ZVBhdGgsIHNQYXRoSW5Db250ZXh0O1xuXG5cdFx0ZnVuY3Rpb24gX2ZpbmREaXN0aW5jdEtleXNJbk9iamVjdChMb29rVXBPYmplY3Q6IGFueSkge1xuXHRcdFx0bGV0IHNMb29rVXBPYmplY3RNZXRhUGF0aDtcblx0XHRcdGZvciAobGV0IHNLZXkgaW4gTG9va1VwT2JqZWN0KSB7XG5cdFx0XHRcdGlmIChMb29rVXBPYmplY3Rbc0tleV0pIHtcblx0XHRcdFx0XHRpZiAoc0tleS5pbmNsdWRlcyhcIi9cIikpIHtcblx0XHRcdFx0XHRcdHNMb29rVXBPYmplY3RNZXRhUGF0aCA9IHNLZXk7IC8vIFwiL1NhbGVzT3JkZXJtYW5hZ2UvX0l0ZW0vTWF0ZXJpYWxcIlxuXHRcdFx0XHRcdFx0Y29uc3QgYVBhdGhQYXJ0cyA9IHNLZXkuc3BsaXQoXCIvXCIpO1xuXHRcdFx0XHRcdFx0c0tleSA9IGFQYXRoUGFydHNbYVBhdGhQYXJ0cy5sZW5ndGggLSAxXTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c0xvb2tVcE9iamVjdE1ldGFQYXRoID0gc1Jvb3RQYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIW9EaXN0aW5jdEtleXNbc0tleV0pIHtcblx0XHRcdFx0XHRcdC8vIGlmIGtleSBpcyBmb3VuZCBmb3IgdGhlIGZpcnN0IHRpbWUgdGhlbiBjcmVhdGUgYXJyYXlcblx0XHRcdFx0XHRcdG9EaXN0aW5jdEtleXNbc0tleV0gPSBbXTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBwdXNoIHBhdGggdG8gYXJyYXlcblx0XHRcdFx0XHRvRGlzdGluY3RLZXlzW3NLZXldLnB1c2goc0xvb2tVcE9iamVjdE1ldGFQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdF9maW5kRGlzdGluY3RLZXlzSW5PYmplY3Qob0ZpbHRlckJhckNvbmRpdGlvbnMpO1xuXHRcdGZvciAoY29uc3Qgc0Rpc3RpbmN0S2V5IGluIG9EaXN0aW5jdEtleXMpIHtcblx0XHRcdGNvbnN0IGFDb25mbGljdGluZ1BhdGhzID0gb0Rpc3RpbmN0S2V5c1tzRGlzdGluY3RLZXldO1xuXG5cdFx0XHRpZiAoYUNvbmZsaWN0aW5nUGF0aHMubGVuZ3RoID4gMSkge1xuXHRcdFx0XHQvLyBjb25mbGljdFxuXHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8PSBhQ29uZmxpY3RpbmdQYXRocy5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdFx0XHRzUGF0aCA9IGFDb25mbGljdGluZ1BhdGhzW2ldO1xuXHRcdFx0XHRcdGlmIChzUGF0aCA9PT0gc1Jvb3RQYXRoKSB7XG5cdFx0XHRcdFx0XHRzRnVsbENvbnRleHRQYXRoID0gYCR7c1Jvb3RQYXRofS8ke3NEaXN0aW5jdEtleX1gO1xuXHRcdFx0XHRcdFx0c1BhdGhJbkNvbnRleHQgPSBzRGlzdGluY3RLZXk7XG5cdFx0XHRcdFx0XHRzTWFpbkVudGl0eVZhbHVlUGF0aCA9IHNEaXN0aW5jdEtleTtcblx0XHRcdFx0XHRcdGlmIChhUGFyYW1ldGVycyAmJiBhUGFyYW1ldGVycy5pbmNsdWRlcyhzRGlzdGluY3RLZXkpKSB7XG5cdFx0XHRcdFx0XHRcdG9GaWx0ZXJCYXJDb25kaXRpb25zW2AkUGFyYW1ldGVyLiR7c0Rpc3RpbmN0S2V5fWBdID0gb0ZpbHRlckJhckNvbmRpdGlvbnNbc0Rpc3RpbmN0S2V5XTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0c1BhdGhJbkNvbnRleHQgPSBzUGF0aDtcblx0XHRcdFx0XHRcdHNGdWxsQ29udGV4dFBhdGggPSAoYCR7c1Jvb3RQYXRofS8ke3NQYXRofWAgYXMgYW55KS5yZXBsYWNlQWxsKC9cXCovZywgXCJcIik7XG5cdFx0XHRcdFx0XHRzQ3VycmVudFZhbHVlUGF0aCA9IHNQYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRvRmlsdGVyQmFyQ29uZGl0aW9uc1tcblx0XHRcdFx0XHRcdHNGdWxsQ29udGV4dFBhdGhcblx0XHRcdFx0XHRcdFx0LnNwbGl0KFwiL1wiKVxuXHRcdFx0XHRcdFx0XHQuZmlsdGVyKGZ1bmN0aW9uIChzVmFsdWU6IGFueSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBzVmFsdWUgIT0gXCJcIjtcblx0XHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdFx0LmpvaW4oXCIuXCIpXG5cdFx0XHRcdFx0XSA9IG9GaWx0ZXJCYXJDb25kaXRpb25zW3NQYXRoSW5Db250ZXh0XTtcblx0XHRcdFx0XHRkZWxldGUgb0ZpbHRlckJhckNvbmRpdGlvbnNbc1BhdGhdO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0c1dpbm5lclZhbHVlUGF0aCA9IHNNYWluRW50aXR5VmFsdWVQYXRoIHx8IHNDdXJyZW50VmFsdWVQYXRoO1xuXHRcdFx0XHRvRmlsdGVyQmFyQ29uZGl0aW9uc1tzRGlzdGluY3RLZXldID0gb0ZpbHRlckJhckNvbmRpdGlvbnNbc1dpbm5lclZhbHVlUGF0aF07XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBubyBjb25mbGljdCwgYWRkIGRpc3RpbmN0IGtleSB3aXRob3V0IGFkZGluZyBwYXRoc1xuXHRcdFx0XHRzUGF0aCA9IGFDb25mbGljdGluZ1BhdGhzWzBdO1xuXHRcdFx0XHRzRnVsbENvbnRleHRQYXRoID1cblx0XHRcdFx0XHRzUGF0aCA9PT0gc1Jvb3RQYXRoID8gYCR7c1Jvb3RQYXRofS8ke3NEaXN0aW5jdEtleX1gIDogKGAke3NSb290UGF0aH0vJHtzUGF0aH1gIGFzIGFueSkucmVwbGFjZUFsbChcIipcIiwgXCJcIik7XG5cdFx0XHRcdG9GaWx0ZXJDb25kaXRpb25zV2l0aG91dENvbmZsaWN0W3NEaXN0aW5jdEtleV0gPSBzRnVsbENvbnRleHRQYXRoXG5cdFx0XHRcdFx0LnNwbGl0KFwiL1wiKVxuXHRcdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKHNWYWx1ZTogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gc1ZhbHVlICE9IFwiXCI7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQuam9pbihcIi5cIik7XG5cdFx0XHRcdGlmIChhUGFyYW1ldGVycyAmJiBhUGFyYW1ldGVycy5pbmNsdWRlcyhzRGlzdGluY3RLZXkpKSB7XG5cdFx0XHRcdFx0b0ZpbHRlckJhckNvbmRpdGlvbnNbYCRQYXJhbWV0ZXIuJHtzRGlzdGluY3RLZXl9YF0gPSBvRmlsdGVyQmFyQ29uZGl0aW9uc1tzRGlzdGluY3RLZXldO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHtcblx0XHRcdGZpbHRlckNvbmRpdGlvbnM6IG9GaWx0ZXJCYXJDb25kaXRpb25zLFxuXHRcdFx0ZmlsdGVyQ29uZGl0aW9uc1dpdGhvdXRDb25mbGljdDogb0ZpbHRlckNvbmRpdGlvbnNXaXRob3V0Q29uZmxpY3Rcblx0XHR9O1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldCBOYXZpZ2F0aW9uIG1vZGUuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBuYXZpZ2F0aW9uIG1vZGVcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZXh0ZW5zaWJsZShPdmVycmlkZUV4ZWN1dGlvbi5JbnN0ZWFkKVxuXHRnZXROYXZpZ2F0aW9uTW9kZSgpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdC8qKlxuXHQgKiBBbGxvd3MgZm9yIG5hdmlnYXRpb24gdG8gYSBnaXZlbiBpbnRlbnQgKFNlbWFudGljT2JqZWN0LUFjdGlvbikgd2l0aCB0aGUgcHJvdmlkZWQgY29udGV4dCwgdXNpbmcgYSBkaWFsb2cgdGhhdCBzaG93cyB0aGUgY29udGV4dHMgd2hpY2ggY2Fubm90IGJlIHBhc3NlZFxuXHQgKiBJZiBzZW1hbnRpYyBvYmplY3QgbWFwcGluZyBpcyBwcm92aWRlZCwgdGhpcyBzZXR0aW5nIGlzIGFsc28gYXBwbGllZCB0byB0aGUgc2VsZWN0aW9uIHZhcmlhbnQgYWZ0ZXIgYWRhcHRhdGlvbiBieSBhIGNvbnN1bWVyLlxuXHQgKiBUaGlzIHNldHRpbmcgYWxzbyByZW1vdmVzIGFueSB0ZWNobmljYWwgcGFyYW1ldGVycyBhbmQgZGV0ZXJtaW5lcyBpZiBhbiBpbnBsYWNlIG9yIGV4cGxhY2UgbmF2aWdhdGlvbiBzaG91bGQgdGFrZSBwbGFjZS5cblx0ICpcblx0ICogQHBhcmFtIHNTZW1hbnRpY09iamVjdCBTZW1hbnRpYyBvYmplY3QgZm9yIHRoZSB0YXJnZXQgYXBwXG5cdCAqIEBwYXJhbSBzQWN0aW9uICBBY3Rpb24gZm9yIHRoZSB0YXJnZXQgYXBwXG5cdCAqIEBwYXJhbSBbbU5hdmlnYXRpb25QYXJhbWV0ZXJzXSBPcHRpb25hbCBwYXJhbWV0ZXJzIHRvIGJlIHBhc3NlZCB0byB0aGUgZXh0ZXJuYWwgbmF2aWdhdGlvblxuXHQgKiBAcGFyYW0gW21OYXZpZ2F0aW9uUGFyYW1ldGVycy5sYWJlbF1cblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnMubmF2aWdhdGlvbkNvbnRleHRzXSBTaW5nbGUgaW5zdGFuY2Ugb3IgbXVsdGlwbGUgaW5zdGFuY2VzIG9mIHtAbGluayBzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0sIG9yIGFsdGVybmF0aXZlbHkgYW4gb2JqZWN0IG9yIGFycmF5IG9mIG9iamVjdHMsIHRvIGJlIHBhc3NlZCB0byB0aGUgaW50ZW50LlxuXHQgKiBAcGFyYW0gW21OYXZpZ2F0aW9uUGFyYW1ldGVycy5hcHBsaWNhYmxlQ29udGV4dHNdIFNpbmdsZSBpbnN0YW5jZSBvciBtdWx0aXBsZSBpbnN0YW5jZXMgb2Yge0BsaW5rIHNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0fSwgb3IgYWx0ZXJuYXRpdmVseSBhbiBvYmplY3Qgb3IgYXJyYXkgb2Ygb2JqZWN0cywgdG8gYmUgcGFzc2VkIHRvIHRoZSBpbnRlbnQgYW5kIGZvciB3aGljaCB0aGUgSUJOIGJ1dHRvbiBpcyBlbmFibGVkXG5cdCAqIEBwYXJhbSBbbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0c10gU2luZ2xlIGluc3RhbmNlIG9yIG11bHRpcGxlIGluc3RhbmNlcyBvZiB7QGxpbmsgc2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHR9LCBvciBhbHRlcm5hdGl2ZWx5IGFuIG9iamVjdCBvciBhcnJheSBvZiBvYmplY3RzLCB3aGljaCBjYW5ub3QgYmUgcGFzc2VkIHRvIHRoZSBpbnRlbnQuXG5cdCAqXHRcdCAgaWYgYW4gYXJyYXkgb2YgY29udGV4dHMgaXMgcGFzc2VkIHRoZSBjb250ZXh0IGlzIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBtZXRhIHBhdGggYW5kIGFjY29yZGluZ2x5IHJlbW92ZSB0aGUgc2Vuc2l0aXZlIGRhdGFcblx0ICpcdFx0ICBJZiBhbiBhcnJheSBvZiBvYmplY3RzIGlzIHBhc3NlZCwgdGhlIGZvbGxvd2luZyBmb3JtYXQgaXMgZXhwZWN0ZWQ6XG5cdCAqXHRcdCAge1xuXHQgKlx0XHRcdGRhdGE6IHtcblx0ICpcdCBcdFx0XHRQcm9kdWN0SUQ6IDc2MzQsXG5cdCAqXHRcdFx0XHROYW1lOiBcIkxhcHRvcFwiXG5cdCAqXHRcdFx0IH0sXG5cdCAqXHRcdFx0IG1ldGFQYXRoOiBcIi9TYWxlc09yZGVyTWFuYWdlXCJcblx0ICogICAgICAgIH1cblx0ICpcdFx0VGhlIG1ldGFQYXRoIGlzIHVzZWQgdG8gcmVtb3ZlIGFueSBzZW5zaXRpdmUgZGF0YS5cblx0ICogQHBhcmFtIFttTmF2aWdhdGlvblBhcmFtZXRlcnMuc2VtYW50aWNPYmplY3RNYXBwaW5nXSBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgU2VtYW50aWNPYmplY3RNYXBwaW5nIG9yIFNlbWFudGljT2JqZWN0TWFwcGluZyB0aGF0IGFwcGxpZXMgdG8gdGhpcyBuYXZpZ2F0aW9uXG5cdCAqL1xuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0bmF2aWdhdGVXaXRoQ29uZmlybWF0aW9uRGlhbG9nKFxuXHRcdHNTZW1hbnRpY09iamVjdDogc3RyaW5nLFxuXHRcdHNBY3Rpb246IHN0cmluZyxcblx0XHRtTmF2aWdhdGlvblBhcmFtZXRlcnM/OiB7XG5cdFx0XHRuYXZpZ2F0aW9uQ29udGV4dHM/OiBvYmplY3QgfCBhbnlbXTtcblx0XHRcdGFwcGxpY2FibGVDb250ZXh0cz86IG9iamVjdCB8IGFueVtdO1xuXHRcdFx0bm90QXBwbGljYWJsZUNvbnRleHRzPzogYW55O1xuXHRcdFx0bGFiZWw/OiBzdHJpbmc7XG5cdFx0XHRzZW1hbnRpY09iamVjdE1hcHBpbmc/OiBzdHJpbmcgfCBvYmplY3Q7XG5cdFx0fVxuXHQpIHtcblx0XHRpZiAobU5hdmlnYXRpb25QYXJhbWV0ZXJzPy5ub3RBcHBsaWNhYmxlQ29udGV4dHMgJiYgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0cz8ubGVuZ3RoID49IDEpIHtcblx0XHRcdGxldCBvQXBwbGljYWJsZUNvbnRleHREaWFsb2c6IERpYWxvZztcblx0XHRcdGNvbnN0IG9Db250cm9sbGVyID0ge1xuXHRcdFx0XHRvbkNsb3NlOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0Ly8gVXNlciBjYW5jZWxzIGFjdGlvblxuXHRcdFx0XHRcdG9BcHBsaWNhYmxlQ29udGV4dERpYWxvZy5jbG9zZSgpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRvbkNvbnRpbnVlOiAoKSA9PiB7XG5cdFx0XHRcdFx0Ly8gVXNlcnMgY29udGludWVzIHRoZSBhY3Rpb24gd2l0aCB0aGUgYm91bmQgY29udGV4dHNcblx0XHRcdFx0XHRtTmF2aWdhdGlvblBhcmFtZXRlcnMubmF2aWdhdGlvbkNvbnRleHRzID0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzLmFwcGxpY2FibGVDb250ZXh0cztcblx0XHRcdFx0XHRvQXBwbGljYWJsZUNvbnRleHREaWFsb2cuY2xvc2UoKTtcblx0XHRcdFx0XHR0aGlzLm5hdmlnYXRlKHNTZW1hbnRpY09iamVjdCwgc0FjdGlvbiwgbU5hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IGZuT3BlbkFuZEZpbGxEaWFsb2cgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdGxldCBvRGlhbG9nQ29udGVudDtcblx0XHRcdFx0Y29uc3Qgbk5vdEFwcGxpY2FibGUgPSBtTmF2aWdhdGlvblBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHRzLmxlbmd0aCxcblx0XHRcdFx0XHRhTm90QXBwbGljYWJsZUl0ZW1zID0gW107XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdG9EaWFsb2dDb250ZW50ID0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0c1tpXS5nZXRPYmplY3QoKTtcblx0XHRcdFx0XHRhTm90QXBwbGljYWJsZUl0ZW1zLnB1c2gob0RpYWxvZ0NvbnRlbnQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IG9Ob3RBcHBsaWNhYmxlSXRlbXNNb2RlbCA9IG5ldyBKU09OTW9kZWwoYU5vdEFwcGxpY2FibGVJdGVtcyk7XG5cdFx0XHRcdGNvbnN0IG9Ub3RhbHMgPSBuZXcgSlNPTk1vZGVsKHsgdG90YWw6IG5Ob3RBcHBsaWNhYmxlLCBsYWJlbDogbU5hdmlnYXRpb25QYXJhbWV0ZXJzLmxhYmVsIH0pO1xuXHRcdFx0XHRvQXBwbGljYWJsZUNvbnRleHREaWFsb2cuc2V0TW9kZWwob05vdEFwcGxpY2FibGVJdGVtc01vZGVsLCBcIm5vdEFwcGxpY2FibGVcIik7XG5cdFx0XHRcdG9BcHBsaWNhYmxlQ29udGV4dERpYWxvZy5zZXRNb2RlbChvVG90YWxzLCBcInRvdGFsc1wiKTtcblx0XHRcdFx0b0FwcGxpY2FibGVDb250ZXh0RGlhbG9nLm9wZW4oKTtcblx0XHRcdH07XG5cdFx0XHQvLyBTaG93IHRoZSBjb250ZXh0cyB0aGF0IGFyZSBub3QgYXBwbGljYWJsZSBhbmQgd2lsbCBub3QgdGhlcmVmb3JlIGJlIHByb2Nlc3NlZFxuXHRcdFx0Y29uc3Qgc0ZyYWdtZW50TmFtZSA9IFwic2FwLmZlLmNvcmUuY29udHJvbHMuQWN0aW9uUGFydGlhbFwiO1xuXHRcdFx0Y29uc3Qgb0RpYWxvZ0ZyYWdtZW50ID0gWE1MVGVtcGxhdGVQcm9jZXNzb3IubG9hZFRlbXBsYXRlKHNGcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIik7XG5cdFx0XHRjb25zdCBvTW9kZWwgPSB0aGlzLl9vVmlldy5nZXRNb2RlbCgpO1xuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Nb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0XHRcdGNvbnN0IHNDYW5vbmljYWxQYXRoID0gbU5hdmlnYXRpb25QYXJhbWV0ZXJzLm5vdEFwcGxpY2FibGVDb250ZXh0c1swXS5nZXRDYW5vbmljYWxQYXRoKCk7XG5cdFx0XHRjb25zdCBzRW50aXR5U2V0ID0gYCR7c0Nhbm9uaWNhbFBhdGguc3Vic3RyKDAsIHNDYW5vbmljYWxQYXRoLmluZGV4T2YoXCIoXCIpKX0vYDtcblx0XHRcdFByb21pc2UucmVzb2x2ZShcblx0XHRcdFx0WE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRcdFx0b0RpYWxvZ0ZyYWdtZW50LFxuXHRcdFx0XHRcdHsgbmFtZTogc0ZyYWdtZW50TmFtZSB9LFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XHRcdFx0XHRlbnRpdHlUeXBlOiBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNFbnRpdHlTZXQpXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XHRcdGVudGl0eVR5cGU6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdG1ldGFNb2RlbDogb01ldGFNb2RlbFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdFx0XHQudGhlbihmdW5jdGlvbiAob0ZyYWdtZW50OiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gRnJhZ21lbnQubG9hZCh7IGRlZmluaXRpb246IG9GcmFnbWVudCwgY29udHJvbGxlcjogb0NvbnRyb2xsZXIgfSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKChvUG9wb3ZlcjogYW55KSA9PiB7XG5cdFx0XHRcdFx0b0FwcGxpY2FibGVDb250ZXh0RGlhbG9nID0gb1BvcG92ZXI7XG5cdFx0XHRcdFx0dGhpcy5nZXRWaWV3KCkuYWRkRGVwZW5kZW50KG9Qb3BvdmVyKTtcblx0XHRcdFx0XHRmbk9wZW5BbmRGaWxsRGlhbG9nKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC5jYXRjaChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3JcIik7XG5cdFx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHR0aGlzLm5hdmlnYXRlKHNTZW1hbnRpY09iamVjdCwgc0FjdGlvbiwgbU5hdmlnYXRpb25QYXJhbWV0ZXJzKTtcblx0XHR9XG5cdH1cblx0X3JlbW92ZVRlY2huaWNhbFBhcmFtZXRlcnMob1NlbGVjdGlvblZhcmlhbnQ6IGFueSkge1xuXHRcdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihcIkBvZGF0YS5jb250ZXh0XCIpO1xuXHRcdG9TZWxlY3Rpb25WYXJpYW50LnJlbW92ZVNlbGVjdE9wdGlvbihcIkBvZGF0YS5tZXRhZGF0YUV0YWdcIik7XG5cdFx0b1NlbGVjdGlvblZhcmlhbnQucmVtb3ZlU2VsZWN0T3B0aW9uKFwiU0FQX19NZXNzYWdlc1wiKTtcblx0fVxuXHQvKipcblx0ICogR2V0IHRhcmdldGVkIEVudGl0eSBzZXQuXG5cdCAqXG5cdCAqIEByZXR1cm5zIEVudGl0eSBzZXQgbmFtZVxuXHQgKi9cblx0QHByaXZhdGVFeHRlbnNpb24oKVxuXHRnZXRFbnRpdHlTZXQoKSB7XG5cdFx0cmV0dXJuICh0aGlzLl9vVmlldy5nZXRWaWV3RGF0YSgpIGFzIGFueSkuZW50aXR5U2V0O1xuXHR9XG5cdC8qKlxuXHQgKiBSZW1vdmVzIHNlbnNpdGl2ZSBkYXRhIGZyb20gdGhlIHNlbWFudGljIGF0dHJpYnV0ZSB3aXRoIHJlc3BlY3QgdG8gdGhlIGVudGl0eVNldC5cblx0ICpcblx0ICogQHBhcmFtIG9BdHRyaWJ1dGVzIENvbnRleHQgZGF0YVxuXHQgKiBAcGFyYW0gc01ldGFQYXRoIE1ldGEgcGF0aCB0byByZWFjaCB0aGUgZW50aXR5U2V0IGluIHRoZSBNZXRhTW9kZWxcblx0ICogQHJldHVybnMgQXJyYXkgb2Ygc2VtYW50aWMgQXR0cmlidXRlc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0Ly8gVE8tRE8gYWRkIHVuaXQgdGVzdHMgZm9yIHRoaXMgZnVuY3Rpb24gaW4gdGhlIGNvbnRyb2xsZXIgZXh0ZW5zaW9uIHF1bml0LlxuXHRAcHVibGljRXh0ZW5zaW9uKClcblx0QGZpbmFsRXh0ZW5zaW9uKClcblx0cmVtb3ZlU2Vuc2l0aXZlRGF0YShvQXR0cmlidXRlczogYW55LCBzTWV0YVBhdGg6IHN0cmluZykge1xuXHRcdGlmIChvQXR0cmlidXRlcykge1xuXHRcdFx0Y29uc3QgYVByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhvQXR0cmlidXRlcyk7XG5cdFx0XHRpZiAoYVByb3BlcnRpZXMubGVuZ3RoKSB7XG5cdFx0XHRcdGRlbGV0ZSBvQXR0cmlidXRlc1tcIkBvZGF0YS5jb250ZXh0XCJdO1xuXHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbXCJAb2RhdGEubWV0YWRhdGFFdGFnXCJdO1xuXHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbXCJTQVBfX01lc3NhZ2VzXCJdO1xuXHRcdFx0XHRmb3IgKGxldCBqID0gMDsgaiA8IGFQcm9wZXJ0aWVzLmxlbmd0aDsgaisrKSB7XG5cdFx0XHRcdFx0aWYgKG9BdHRyaWJ1dGVzW2FQcm9wZXJ0aWVzW2pdXSAmJiB0eXBlb2Ygb0F0dHJpYnV0ZXNbYVByb3BlcnRpZXNbal1dID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlbW92ZVNlbnNpdGl2ZURhdGEob0F0dHJpYnV0ZXNbYVByb3BlcnRpZXNbal1dLCBgJHtzTWV0YVBhdGh9LyR7YVByb3BlcnRpZXNbal19YCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnN0IHNQcm9wID0gYVByb3BlcnRpZXNbal0sXG5cdFx0XHRcdFx0XHRhUHJvcGVydHlBbm5vdGF0aW9ucyA9IHRoaXMuX29NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NNZXRhUGF0aH0vJHtzUHJvcH1AYCk7XG5cdFx0XHRcdFx0aWYgKGFQcm9wZXJ0eUFubm90YXRpb25zKSB7XG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5Jc1BvdGVudGlhbGx5U2Vuc2l0aXZlXCJdIHx8XG5cdFx0XHRcdFx0XHRcdGFQcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkV4Y2x1ZGVGcm9tTmF2aWdhdGlvbkNvbnRleHRcIl0gfHxcblx0XHRcdFx0XHRcdFx0YVByb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLk1lYXN1cmVcIl1cblx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbc1Byb3BdO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChhUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sXCJdKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9GaWVsZENvbnRyb2wgPSBhUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sXCJdO1xuXHRcdFx0XHRcdFx0XHRpZiAob0ZpZWxkQ29udHJvbFtcIiRFbnVtTWVtYmVyXCJdICYmIG9GaWVsZENvbnRyb2xbXCIkRW51bU1lbWJlclwiXS5zcGxpdChcIi9cIilbMV0gPT09IFwiSW5hcHBsaWNhYmxlXCIpIHtcblx0XHRcdFx0XHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbc1Byb3BdO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0XHRcdG9GaWVsZENvbnRyb2xbXCIkUGF0aFwiXSAmJlxuXHRcdFx0XHRcdFx0XHRcdHRoaXMuX2lzRmllbGRDb250cm9sUGF0aEluYXBwbGljYWJsZShvRmllbGRDb250cm9sW1wiJFBhdGhcIl0sIG9BdHRyaWJ1dGVzKVxuXHRcdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0XHRkZWxldGUgb0F0dHJpYnV0ZXNbc1Byb3BdO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvQXR0cmlidXRlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBDaGVjayBpZiBwYXRoLWJhc2VkIEZpZWxkQ29udHJvbCBldmFsdWF0ZXMgdG8gaW5hcHBsaWNhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0ZpZWxkQ29udHJvbFBhdGggRmllbGQgY29udHJvbCBwYXRoXG5cdCAqIEBwYXJhbSBvQXR0cmlidXRlIFNlbWFudGljQXR0cmlidXRlc1xuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaW5hcHBsaWNhYmxlXG5cdCAqL1xuXHRfaXNGaWVsZENvbnRyb2xQYXRoSW5hcHBsaWNhYmxlKHNGaWVsZENvbnRyb2xQYXRoOiBzdHJpbmcsIG9BdHRyaWJ1dGU6IGFueSkge1xuXHRcdGxldCBiSW5hcHBsaWNhYmxlID0gZmFsc2U7XG5cdFx0Y29uc3QgYVBhcnRzID0gc0ZpZWxkQ29udHJvbFBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdC8vIHNlbnNpdGl2ZSBkYXRhIGlzIHJlbW92ZWQgb25seSBpZiB0aGUgcGF0aCBoYXMgYWxyZWFkeSBiZWVuIHJlc29sdmVkLlxuXHRcdGlmIChhUGFydHMubGVuZ3RoID4gMSkge1xuXHRcdFx0YkluYXBwbGljYWJsZSA9XG5cdFx0XHRcdG9BdHRyaWJ1dGVbYVBhcnRzWzBdXSAmJiBvQXR0cmlidXRlW2FQYXJ0c1swXV0uaGFzT3duUHJvcGVydHkoYVBhcnRzWzFdKSAmJiBvQXR0cmlidXRlW2FQYXJ0c1swXV1bYVBhcnRzWzFdXSA9PT0gMDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YkluYXBwbGljYWJsZSA9IG9BdHRyaWJ1dGVbc0ZpZWxkQ29udHJvbFBhdGhdID09PSAwO1xuXHRcdH1cblx0XHRyZXR1cm4gYkluYXBwbGljYWJsZTtcblx0fVxuXHQvKipcblx0ICogTWV0aG9kIHRvIHJlcGxhY2UgTG9jYWwgUHJvcGVydGllcyB3aXRoIFNlbWFudGljIE9iamVjdCBtYXBwaW5ncy5cblx0ICpcblx0ICogQHBhcmFtIG9TZWxlY3Rpb25WYXJpYW50IFNlbGVjdGlvblZhcmlhbnQgY29uc2lzdGluZyBvZiBmaWx0ZXJiYXIsIFRhYmxlIGFuZCBQYWdlIENvbnRleHRcblx0ICogQHBhcmFtIHZNYXBwaW5ncyBBIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBzZW1hbnRpYyBvYmplY3QgbWFwcGluZ1xuXHQgKiBAcmV0dXJucyAtIE1vZGlmaWVkIFNlbGVjdGlvblZhcmlhbnQgd2l0aCBMb2NhbFByb3BlcnR5IHJlcGxhY2VkIHdpdGggU2VtYW50aWNPYmplY3RQcm9wZXJ0aWVzLlxuXHQgKi9cblx0X2FwcGx5U2VtYW50aWNPYmplY3RNYXBwaW5ncyhvU2VsZWN0aW9uVmFyaWFudDogU2VsZWN0aW9uVmFyaWFudCwgdk1hcHBpbmdzOiBvYmplY3QgfCBzdHJpbmcpIHtcblx0XHRjb25zdCBvTWFwcGluZ3MgPSB0eXBlb2Ygdk1hcHBpbmdzID09PSBcInN0cmluZ1wiID8gSlNPTi5wYXJzZSh2TWFwcGluZ3MpIDogdk1hcHBpbmdzO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgb01hcHBpbmdzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBzTG9jYWxQcm9wZXJ0eSA9XG5cdFx0XHRcdChvTWFwcGluZ3NbaV1bXCJMb2NhbFByb3BlcnR5XCJdICYmIG9NYXBwaW5nc1tpXVtcIkxvY2FsUHJvcGVydHlcIl1bXCIkUHJvcGVydHlQYXRoXCJdKSB8fFxuXHRcdFx0XHQob01hcHBpbmdzW2ldW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Mb2NhbFByb3BlcnR5XCJdICYmXG5cdFx0XHRcdFx0b01hcHBpbmdzW2ldW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Mb2NhbFByb3BlcnR5XCJdW1wiJFBhdGhcIl0pO1xuXHRcdFx0Y29uc3Qgc1NlbWFudGljT2JqZWN0UHJvcGVydHkgPVxuXHRcdFx0XHRvTWFwcGluZ3NbaV1bXCJTZW1hbnRpY09iamVjdFByb3BlcnR5XCJdIHx8IG9NYXBwaW5nc1tpXVtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RQcm9wZXJ0eVwiXTtcblx0XHRcdGlmIChvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oc0xvY2FsUHJvcGVydHkpKSB7XG5cdFx0XHRcdGNvbnN0IG9TZWxlY3RPcHRpb24gPSBvU2VsZWN0aW9uVmFyaWFudC5nZXRTZWxlY3RPcHRpb24oc0xvY2FsUHJvcGVydHkpO1xuXG5cdFx0XHRcdC8vQ3JlYXRlIGEgbmV3IFNlbGVjdE9wdGlvbiB3aXRoIHNTZW1hbnRpY09iamVjdFByb3BlcnR5IGFzIHRoZSBwcm9wZXJ0eSBOYW1lIGFuZCByZW1vdmUgdGhlIG9sZGVyIG9uZVxuXHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5yZW1vdmVTZWxlY3RPcHRpb24oc0xvY2FsUHJvcGVydHkpO1xuXHRcdFx0XHRvU2VsZWN0aW9uVmFyaWFudC5tYXNzQWRkU2VsZWN0T3B0aW9uKHNTZW1hbnRpY09iamVjdFByb3BlcnR5LCBvU2VsZWN0T3B0aW9uKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9TZWxlY3Rpb25WYXJpYW50O1xuXHR9XG5cdC8qKlxuXHQgKiBOYXZpZ2F0ZXMgdG8gYW4gT3V0Ym91bmQgcHJvdmlkZWQgaW4gdGhlIG1hbmlmZXN0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIHNPdXRib3VuZCBJZGVudGlmaWVyIHRvIGxvY2F0aW9uIHRoZSBvdXRib3VuZCBpbiB0aGUgbWFuaWZlc3Rcblx0ICogQHBhcmFtIG1OYXZpZ2F0aW9uUGFyYW1ldGVycyBPcHRpb25hbCBtYXAgY29udGFpbmluZyBrZXkvdmFsdWUgcGFpcnMgdG8gYmUgcGFzc2VkIHRvIHRoZSBpbnRlbnRcblx0ICogQGFsaWFzIHNhcC5mZS5jb3JlLmNvbnRyb2xsZXJleHRlbnNpb25zLkludGVudEJhc2VkTmF2aWdhdGlvbiNuYXZpZ2F0ZU91dGJvdW5kXG5cdCAqIEBzaW5jZSAxLjg2LjBcblx0ICovXG5cdEBwdWJsaWNFeHRlbnNpb24oKVxuXHRAZmluYWxFeHRlbnNpb24oKVxuXHRuYXZpZ2F0ZU91dGJvdW5kKHNPdXRib3VuZDogc3RyaW5nLCBtTmF2aWdhdGlvblBhcmFtZXRlcnM6IGFueSkge1xuXHRcdGxldCBhTmF2UGFyYW1zOiBhbnlbXSB8IHVuZGVmaW5lZDtcblx0XHRjb25zdCBvTWFuaWZlc3RFbnRyeSA9IHRoaXMuYmFzZS5nZXRBcHBDb21wb25lbnQoKS5nZXRNYW5pZmVzdEVudHJ5KFwic2FwLmFwcFwiKSxcblx0XHRcdG9PdXRib3VuZCA9IG9NYW5pZmVzdEVudHJ5LmNyb3NzTmF2aWdhdGlvbiAmJiBvTWFuaWZlc3RFbnRyeS5jcm9zc05hdmlnYXRpb24ub3V0Ym91bmRzW3NPdXRib3VuZF07XG5cdFx0aWYgKCFvT3V0Ym91bmQpIHtcblx0XHRcdExvZy5lcnJvcihcIk91dGJvdW5kIGlzIG5vdCBkZWZpbmVkIGluIG1hbmlmZXN0ISFcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHNTZW1hbnRpY09iamVjdCA9IG9PdXRib3VuZC5zZW1hbnRpY09iamVjdCxcblx0XHRcdHNBY3Rpb24gPSBvT3V0Ym91bmQuYWN0aW9uLFxuXHRcdFx0b3V0Ym91bmRQYXJhbXMgPSBvT3V0Ym91bmQucGFyYW1ldGVycyAmJiB0aGlzLmdldE91dGJvdW5kUGFyYW1zKG9PdXRib3VuZC5wYXJhbWV0ZXJzKTtcblxuXHRcdGlmIChtTmF2aWdhdGlvblBhcmFtZXRlcnMpIHtcblx0XHRcdGFOYXZQYXJhbXMgPSBbXTtcblx0XHRcdE9iamVjdC5rZXlzKG1OYXZpZ2F0aW9uUGFyYW1ldGVycykuZm9yRWFjaChmdW5jdGlvbiAoa2V5OiBzdHJpbmcpIHtcblx0XHRcdFx0bGV0IG9QYXJhbXM6IGFueTtcblx0XHRcdFx0aWYgKEFycmF5LmlzQXJyYXkobU5hdmlnYXRpb25QYXJhbWV0ZXJzW2tleV0pKSB7XG5cdFx0XHRcdFx0Y29uc3QgYVZhbHVlcyA9IG1OYXZpZ2F0aW9uUGFyYW1ldGVyc1trZXldO1xuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVZhbHVlcy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdFx0b1BhcmFtcyA9IHt9O1xuXHRcdFx0XHRcdFx0b1BhcmFtc1trZXldID0gYVZhbHVlc1tpXTtcblx0XHRcdFx0XHRcdGFOYXZQYXJhbXM/LnB1c2gob1BhcmFtcyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9QYXJhbXMgPSB7fTtcblx0XHRcdFx0XHRvUGFyYW1zW2tleV0gPSBtTmF2aWdhdGlvblBhcmFtZXRlcnNba2V5XTtcblx0XHRcdFx0XHRhTmF2UGFyYW1zPy5wdXNoKG9QYXJhbXMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0aWYgKGFOYXZQYXJhbXMgfHwgb3V0Ym91bmRQYXJhbXMpIHtcblx0XHRcdG1OYXZpZ2F0aW9uUGFyYW1ldGVycyA9IHtcblx0XHRcdFx0bmF2aWdhdGlvbkNvbnRleHRzOiB7XG5cdFx0XHRcdFx0ZGF0YTogYU5hdlBhcmFtcyB8fCBvdXRib3VuZFBhcmFtc1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdH1cblx0XHR0aGlzLmJhc2UuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5uYXZpZ2F0ZShzU2VtYW50aWNPYmplY3QsIHNBY3Rpb24sIG1OYXZpZ2F0aW9uUGFyYW1ldGVycyk7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGFwcGx5IG91dGJvdW5kIHBhcmFtZXRlcnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBvU2VsZWN0aW9uVmFyaWFudCBTZWxlY3Rpb25WYXJpYW50IGNvbnNpc3Rpbmcgb2YgYSBmaWx0ZXIgYmFyLCBhIHRhYmxlLCBhbmQgYSBwYWdlIGNvbnRleHRcblx0ICogQHBhcmFtIHZPdXRib3VuZFBhcmFtcyBPdXRib3VuZCBQcm9wZXJ0aWVzIGRlZmluZWQgaW4gdGhlIG1hbmlmZXN0XG5cdCAqIEByZXR1cm5zIC0gVGhlIG1vZGlmaWVkIFNlbGVjdGlvblZhcmlhbnQgd2l0aCBvdXRib3VuZCBwYXJhbWV0ZXJzLlxuXHQgKi9cblx0X2FwcGx5T3V0Ym91bmRQYXJhbXMob1NlbGVjdGlvblZhcmlhbnQ6IFNlbGVjdGlvblZhcmlhbnQsIHZPdXRib3VuZFBhcmFtczogYW55KSB7XG5cdFx0Y29uc3QgYVBhcmFtZXRlcnMgPSBPYmplY3Qua2V5cyh2T3V0Ym91bmRQYXJhbXMpO1xuXHRcdGNvbnN0IGFTZWxlY3RQcm9wZXJ0aWVzID0gb1NlbGVjdGlvblZhcmlhbnQuZ2V0U2VsZWN0T3B0aW9uc1Byb3BlcnR5TmFtZXMoKTtcblx0XHRhUGFyYW1ldGVycy5mb3JFYWNoKGZ1bmN0aW9uIChrZXk6IHN0cmluZykge1xuXHRcdFx0aWYgKCFhU2VsZWN0UHJvcGVydGllcy5pbmNsdWRlcyhrZXkpKSB7XG5cdFx0XHRcdG9TZWxlY3Rpb25WYXJpYW50LmFkZFNlbGVjdE9wdGlvbihrZXksIFwiSVwiLCBcIkVRXCIsIHZPdXRib3VuZFBhcmFtc1trZXldKTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gb1NlbGVjdGlvblZhcmlhbnQ7XG5cdH1cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIG91dGJvdW5kIHBhcmFtZXRlcnMgZGVmaW5lZCBpbiB0aGUgbWFuaWZlc3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gb091dGJvdW5kUGFyYW1zIFBhcmFtZXRlcnMgZGVmaW5lZCBpbiB0aGUgb3V0Ym91bmRzLiBPbmx5IFwicGxhaW5cIiBpcyBzdXBwb3J0ZWRcblx0ICogQHJldHVybnMgUGFyYW1ldGVycyB3aXRoIHRoZSBrZXktVmFsdWUgcGFpclxuXHQgKi9cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdGdldE91dGJvdW5kUGFyYW1zKG9PdXRib3VuZFBhcmFtczogYW55KSB7XG5cdFx0Y29uc3Qgb1BhcmFtc01hcHBpbmc6IGFueSA9IHt9O1xuXHRcdGlmIChvT3V0Ym91bmRQYXJhbXMpIHtcblx0XHRcdGNvbnN0IGFQYXJhbWV0ZXJzID0gT2JqZWN0LmtleXMob091dGJvdW5kUGFyYW1zKSB8fCBbXTtcblx0XHRcdGlmIChhUGFyYW1ldGVycy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdGFQYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGtleTogc3RyaW5nKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb01hcHBpbmcgPSBvT3V0Ym91bmRQYXJhbXNba2V5XTtcblx0XHRcdFx0XHRpZiAob01hcHBpbmcudmFsdWUgJiYgb01hcHBpbmcudmFsdWUudmFsdWUgJiYgb01hcHBpbmcudmFsdWUuZm9ybWF0ID09PSBcInBsYWluXCIpIHtcblx0XHRcdFx0XHRcdGlmICghb1BhcmFtc01hcHBpbmdba2V5XSkge1xuXHRcdFx0XHRcdFx0XHRvUGFyYW1zTWFwcGluZ1trZXldID0gb01hcHBpbmcudmFsdWUudmFsdWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9QYXJhbXNNYXBwaW5nO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyaWdnZXJzIGFuIG91dGJvdW5kIG5hdmlnYXRpb24gd2hlbiBhIHVzZXIgY2hvb3NlcyB0aGUgY2hldnJvbi5cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IG9Db250cm9sbGVyXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzT3V0Ym91bmRUYXJnZXQgTmFtZSBvZiB0aGUgb3V0Ym91bmQgdGFyZ2V0IChuZWVkcyB0byBiZSBkZWZpbmVkIGluIHRoZSBtYW5pZmVzdClcblx0ICogQHBhcmFtIHtzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dH0gb0NvbnRleHQgVGhlIGNvbnRleHQgdGhhdCBjb250YWlucyB0aGUgZGF0YSBmb3IgdGhlIHRhcmdldCBhcHBcblx0ICogQHBhcmFtIHtzdHJpbmd9IHNDcmVhdGVQYXRoIENyZWF0ZSBwYXRoIHdoZW4gdGhlIGNoZXZyb24gaXMgY3JlYXRlZC5cblx0ICogQHJldHVybnMge1Byb21pc2V9IFByb21pc2Ugd2hpY2ggaXMgcmVzb2x2ZWQgb25jZSB0aGUgbmF2aWdhdGlvbiBpcyB0cmlnZ2VyZWRcblx0ICovXG5cblx0QHB1YmxpY0V4dGVuc2lvbigpXG5cdEBmaW5hbEV4dGVuc2lvbigpXG5cdG9uQ2hldnJvblByZXNzTmF2aWdhdGVPdXRCb3VuZChvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIHNPdXRib3VuZFRhcmdldDogc3RyaW5nLCBvQ29udGV4dDogYW55LCBzQ3JlYXRlUGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb091dGJvdW5kcyA9IChvQ29udHJvbGxlci5nZXRBcHBDb21wb25lbnQoKSBhcyBhbnkpLmdldFJvdXRpbmdTZXJ2aWNlKCkuZ2V0T3V0Ym91bmRzKCk7XG5cdFx0Y29uc3Qgb0Rpc3BsYXlPdXRib3VuZCA9IG9PdXRib3VuZHNbc091dGJvdW5kVGFyZ2V0XTtcblx0XHRsZXQgYWRkaXRpb25hbE5hdmlnYXRpb25QYXJhbWV0ZXJzO1xuXHRcdGlmIChvRGlzcGxheU91dGJvdW5kICYmIG9EaXNwbGF5T3V0Ym91bmQuc2VtYW50aWNPYmplY3QgJiYgb0Rpc3BsYXlPdXRib3VuZC5hY3Rpb24pIHtcblx0XHRcdGNvbnN0IG9SZWZyZXNoU3RyYXRlZ2llczogYW55ID0ge1xuXHRcdFx0XHRpbnRlbnRzOiB7fVxuXHRcdFx0fTtcblx0XHRcdGNvbnN0IG9EZWZhdWx0UmVmcmVzaFN0cmF0ZWd5OiBhbnkgPSB7fTtcblx0XHRcdGxldCBzTWV0YVBhdGg7XG5cblx0XHRcdGlmIChvQ29udGV4dCkge1xuXHRcdFx0XHRpZiAob0NvbnRleHQuaXNBICYmIG9Db250ZXh0LmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0XCIpKSB7XG5cdFx0XHRcdFx0c01ldGFQYXRoID0gTW9kZWxIZWxwZXIuZ2V0TWV0YVBhdGhGb3JDb250ZXh0KG9Db250ZXh0KTtcblx0XHRcdFx0XHRvQ29udGV4dCA9IFtvQ29udGV4dF07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c01ldGFQYXRoID0gTW9kZWxIZWxwZXIuZ2V0TWV0YVBhdGhGb3JDb250ZXh0KG9Db250ZXh0WzBdKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRvRGVmYXVsdFJlZnJlc2hTdHJhdGVneVtzTWV0YVBhdGhdID0gXCJzZWxmXCI7XG5cdFx0XHRcdG9SZWZyZXNoU3RyYXRlZ2llc1tcIl9mZURlZmF1bHRcIl0gPSBvRGVmYXVsdFJlZnJlc2hTdHJhdGVneTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKHNDcmVhdGVQYXRoKSB7XG5cdFx0XHRcdGNvbnN0IHNLZXkgPSBgJHtvRGlzcGxheU91dGJvdW5kLnNlbWFudGljT2JqZWN0fS0ke29EaXNwbGF5T3V0Ym91bmQuYWN0aW9ufWA7XG5cdFx0XHRcdG9SZWZyZXNoU3RyYXRlZ2llcy5pbnRlbnRzW3NLZXldID0ge307XG5cdFx0XHRcdG9SZWZyZXNoU3RyYXRlZ2llcy5pbnRlbnRzW3NLZXldW3NDcmVhdGVQYXRoXSA9IFwic2VsZlwiO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9EaXNwbGF5T3V0Ym91bmQgJiYgb0Rpc3BsYXlPdXRib3VuZC5wYXJhbWV0ZXJzKSB7XG5cdFx0XHRcdGNvbnN0IG9QYXJhbXMgPSBvRGlzcGxheU91dGJvdW5kLnBhcmFtZXRlcnMgJiYgdGhpcy5nZXRPdXRib3VuZFBhcmFtcyhvRGlzcGxheU91dGJvdW5kLnBhcmFtZXRlcnMpO1xuXHRcdFx0XHRpZiAoT2JqZWN0LmtleXMob1BhcmFtcykubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVycyA9IG9QYXJhbXM7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0b0NvbnRyb2xsZXIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5uYXZpZ2F0ZShvRGlzcGxheU91dGJvdW5kLnNlbWFudGljT2JqZWN0LCBvRGlzcGxheU91dGJvdW5kLmFjdGlvbiwge1xuXHRcdFx0XHRuYXZpZ2F0aW9uQ29udGV4dHM6IG9Db250ZXh0LFxuXHRcdFx0XHRyZWZyZXNoU3RyYXRlZ2llczogb1JlZnJlc2hTdHJhdGVnaWVzLFxuXHRcdFx0XHRhZGRpdGlvbmFsTmF2aWdhdGlvblBhcmFtZXRlcnM6IGFkZGl0aW9uYWxOYXZpZ2F0aW9uUGFyYW1ldGVyc1xuXHRcdFx0fSk7XG5cblx0XHRcdC8vVE9ETzogY2hlY2sgd2h5IHJldHVybmluZyBhIHByb21pc2UgaXMgcmVxdWlyZWRcblx0XHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgbmV3IEVycm9yKGBvdXRib3VuZCB0YXJnZXQgJHtzT3V0Ym91bmRUYXJnZXR9IG5vdCBmb3VuZCBpbiBjcm9zcyBuYXZpZ2F0aW9uIGRlZmluaXRpb24gb2YgbWFuaWZlc3RgKTtcblx0XHR9XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSW50ZXJuYWxJbnRlbnRCYXNlZE5hdmlnYXRpb247XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7O0VBNkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFQQSxJQVNNQSw2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