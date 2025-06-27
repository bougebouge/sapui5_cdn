/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/merge", "sap/fe/core/CommonUtils", "sap/fe/core/converters/controls/ListReport/FilterBar", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/TemplateModel", "sap/fe/core/templating/PropertyFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/macros/ResourceModel", "sap/ui/mdc/FilterBarDelegate", "sap/fe/core/type/TypeUtil", "sap/ui/model/json/JSONModel"], function (Log, mergeObjects, CommonUtils, FilterBar, ModelHelper, StableIdHelper, TemplateModel, PropertyFormatters, CommonHelper, DelegateUtil, FilterUtils, ResourceModel, FilterBarDelegate, TypeUtil, JSONModel) {
  "use strict";

  var hasValueHelp = PropertyFormatters.hasValueHelp;
  var generate = StableIdHelper.generate;
  var processSelectionFields = FilterBar.processSelectionFields;
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  var _addPropertyInfo = function (oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName) {
    try {
      return Promise.resolve(_catch(function () {
        sPropertyInfoName = sPropertyInfoName.replace("*", "");
        var sPropertyInfoKey = generate([sPropertyInfoName]); //Making sure that navigation property names are generated properly e.g. _Item::Material
        if (mPropertyBag && !mPropertyBag.modifier) {
          throw "FilterBar Delegate method called without modifier.";
        }
        return Promise.resolve(mPropertyBag.modifier.getProperty(oParentControl, "delegate")).then(function (delegate) {
          return Promise.resolve(mPropertyBag.modifier.getProperty(oParentControl, "propertyInfo")).then(function (aPropertyInfo) {
            if (aPropertyInfo) {
              var hasPropertyInfo = aPropertyInfo.some(function (prop) {
                return prop.key === sPropertyInfoKey || prop.name === sPropertyInfoKey;
              });
              if (!hasPropertyInfo) {
                var entityTypePath = delegate.payload.entityTypePath;
                var converterContext = FilterUtils.createConverterContext(oParentControl, entityTypePath, oMetaModel, mPropertyBag.appComponent);
                var entityType = converterContext.getEntityType();
                var filterField = FilterUtils.getFilterField(sPropertyInfoName, converterContext, entityType);
                filterField = FilterUtils.buildProperyInfo(filterField, converterContext);
                aPropertyInfo.push(filterField);
                mPropertyBag.modifier.setProperty(oParentControl, "propertyInfo", aPropertyInfo);
              }
            }
          }); //We do not get propertyInfo in case of table filters
        });
      }, function (errorMsg) {
        Log.warning("".concat(oParentControl.getId(), " : ").concat(errorMsg));
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Method responsible for creating filter field in standalone / personalization filter bar.
   *
   * @param sPropertyInfoName Name of the property being added as filter field
   * @param oParentControl Parent control instance to which the filter field is added
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns Once resolved, a filter field definition is returned
   */
  var _addXMLCustomFilterField = function (oFilterBar, oModifier, sPropertyPath) {
    try {
      return Promise.resolve(_catch(function () {
        return Promise.resolve(Promise.resolve(oModifier.getAggregation(oFilterBar, "dependents"))).then(function (aDependents) {
          var i;
          if (aDependents && aDependents.length > 1) {
            for (i = 0; i <= aDependents.length; i++) {
              var oFilterField = aDependents[i];
              if (oFilterField && oFilterField.isA("sap.ui.mdc.FilterField")) {
                var sDataProperty = oFilterField.getFieldPath(),
                  sFilterFieldId = oFilterField.getId();
                if (sPropertyPath === sDataProperty && sFilterFieldId.indexOf("CustomFilterField")) {
                  return Promise.resolve(oFilterField);
                }
              }
            }
          }
        });
      }, function (oError) {
        Log.error("Filter Cannot be added", oError);
      }));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var ODataFilterBarDelegate = Object.assign({}, FilterBarDelegate);
  var EDIT_STATE_PROPERTY_NAME = "$editState",
    SEARCH_PROPERTY_NAME = "$search",
    VALUE_HELP_TYPE = "FilterFieldValueHelp",
    FETCHED_PROPERTIES_DATA_KEY = "sap_fe_FilterBarDelegate_propertyInfoMap",
    CONDITION_PATH_TO_PROPERTY_PATH_REGEX = /\+|\*/g;
  function _templateEditState(sIdPrefix, metaModel, oModifier) {
    var oThis = new JSONModel({
        id: sIdPrefix,
        isDraftCollaborative: ModelHelper.isCollaborationDraftSupported(metaModel)
      }),
      oPreprocessorSettings = {
        bindingContexts: {
          "this": oThis.createBindingContext("/")
        },
        models: {
          "this.i18n": ResourceModel.getModel(),
          "this": oThis
        }
      };
    return DelegateUtil.templateControlFragment("sap.fe.macros.filter.DraftEditState", oPreprocessorSettings, undefined, oModifier).finally(function () {
      oThis.destroy();
    });
  }
  ODataFilterBarDelegate._templateCustomFilter = function (oFilterBar, sIdPrefix, oSelectionFieldInfo, oMetaModel, oModifier) {
    try {
      return Promise.resolve(DelegateUtil.getCustomData(oFilterBar, "entityType", oModifier)).then(function (sEntityTypePath) {
        var oThis = new JSONModel({
            id: sIdPrefix
          }),
          oItemModel = new TemplateModel(oSelectionFieldInfo, oMetaModel),
          oPreprocessorSettings = {
            bindingContexts: {
              "contextPath": oMetaModel.createBindingContext(sEntityTypePath),
              "this": oThis.createBindingContext("/"),
              "item": oItemModel.createBindingContext("/")
            },
            models: {
              "contextPath": oMetaModel,
              "this": oThis,
              "item": oItemModel
            }
          },
          oView = CommonUtils.getTargetView(oFilterBar),
          oController = oView ? oView.getController() : undefined,
          oOptions = {
            controller: oController ? oController : undefined,
            view: oView
          };
        return DelegateUtil.templateControlFragment("sap.fe.macros.filter.CustomFilter", oPreprocessorSettings, oOptions, oModifier).finally(function () {
          oThis.destroy();
          oItemModel.destroy();
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  function _getPropertyPath(sConditionPath) {
    return sConditionPath.replace(CONDITION_PATH_TO_PROPERTY_PATH_REGEX, "");
  }
  ODataFilterBarDelegate._findSelectionField = function (aSelectionFields, sFlexName) {
    return aSelectionFields.find(function (oSelectionField) {
      return (oSelectionField.conditionPath === sFlexName || oSelectionField.conditionPath.replaceAll(/\*/g, "") === sFlexName) && oSelectionField.availability !== "Hidden";
    });
  };
  function _generateIdPrefix(sFilterBarId, sControlType, sNavigationPrefix) {
    return sNavigationPrefix ? generate([sFilterBarId, sControlType, sNavigationPrefix]) : generate([sFilterBarId, sControlType]);
  }
  function _templateValueHelp(oSettings, oParameters) {
    var oThis = new JSONModel({
      idPrefix: oParameters.sVhIdPrefix,
      conditionModel: "$filters",
      navigationPrefix: oParameters.sNavigationPrefix ? "/".concat(oParameters.sNavigationPrefix) : "",
      filterFieldValueHelp: true,
      useSemanticDateRange: oParameters.bUseSemanticDateRange,
      useNewValueHelp: location.href.indexOf("sap-fe-oldFieldValueHelp=true") < 0
    });
    var oPreprocessorSettings = mergeObjects({}, oSettings, {
      bindingContexts: {
        "this": oThis.createBindingContext("/")
      },
      models: {
        "this": oThis
      }
    });
    return Promise.resolve(DelegateUtil.templateControlFragment("sap.fe.macros.internal.valuehelp.ValueHelp", oPreprocessorSettings, {
      isXML: oSettings.isXML
    })).then(function (aVHElements) {
      if (aVHElements) {
        var sAggregationName = "dependents";
        //Some filter fields have the PersistenceProvider aggregation besides the FVH :
        if (aVHElements.length) {
          aVHElements.forEach(function (elt) {
            if (oParameters.oModifier) {
              oParameters.oModifier.insertAggregation(oParameters.oControl, sAggregationName, elt, 0);
            } else {
              oParameters.oControl.insertAggregation(sAggregationName, elt, 0, false);
            }
          });
        } else if (oParameters.oModifier) {
          oParameters.oModifier.insertAggregation(oParameters.oControl, sAggregationName, aVHElements, 0);
        } else {
          oParameters.oControl.insertAggregation(sAggregationName, aVHElements, 0, false);
        }
      }
    }).catch(function (oError) {
      Log.error("Error while evaluating DelegateUtil.isValueHelpRequired", oError);
    }).finally(function () {
      oThis.destroy();
    });
  }
  function _templateFilterField(oSettings, oParameters) {
    var oThis = new JSONModel({
      idPrefix: oParameters.sIdPrefix,
      vhIdPrefix: oParameters.sVhIdPrefix,
      propertyPath: oParameters.sPropertyName,
      navigationPrefix: oParameters.sNavigationPrefix ? "/".concat(oParameters.sNavigationPrefix) : "",
      useSemanticDateRange: oParameters.bUseSemanticDateRange,
      settings: oParameters.oSettings,
      visualFilter: oParameters.visualFilter
    });
    var oMetaModel = oParameters.oMetaModel;
    var oVisualFilter = new TemplateModel(oParameters.visualFilter, oMetaModel);
    var oPreprocessorSettings = mergeObjects({}, oSettings, {
      bindingContexts: {
        "this": oThis.createBindingContext("/"),
        "visualFilter": oVisualFilter.createBindingContext("/")
      },
      models: {
        "this": oThis,
        "visualFilter": oVisualFilter,
        "metaModel": oMetaModel
      }
    });
    return DelegateUtil.templateControlFragment("sap.fe.macros.internal.FilterField", oPreprocessorSettings, {
      isXML: oSettings.isXML
    }).finally(function () {
      oThis.destroy();
    });
  }
  ODataFilterBarDelegate.addItem = function (sPropertyInfoName, oParentControl, mPropertyBag) {
    try {
      if (!mPropertyBag) {
        // Invoked during runtime.
        return Promise.resolve(ODataFilterBarDelegate._addP13nItem(sPropertyInfoName, oParentControl));
      }
      var oMetaModel = mPropertyBag.appComponent && mPropertyBag.appComponent.getModel().getMetaModel();
      if (!oMetaModel) {
        return Promise.resolve(null);
      }
      return Promise.resolve(_addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName)).then(function () {
        return ODataFilterBarDelegate._addFlexItem(sPropertyInfoName, oParentControl, oMetaModel, mPropertyBag.modifier, mPropertyBag.appComponent);
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Method responsible for removing filter field in standalone / personalization filter bar.
   *
   * @param oFilterFieldProperty Object of the filter field property being removed as filter field
   * @param oParentControl Parent control instance from which the filter field is removed
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.removeItem = function (oFilterFieldProperty, oParentControl, mPropertyBag) {
    try {
      var _exit2 = false;
      function _temp4(_result) {
        if (_exit2) return _result;
        if (typeof oFilterFieldProperty !== "string" && oFilterFieldProperty.isA && oFilterFieldProperty.isA("sap.ui.mdc.FilterField")) {
          if (oFilterFieldProperty.data("isSlot") === "true" && mPropertyBag) {
            // Inserting into the modifier creates a change from flex also filter is been removed hence promise is resolved to false
            var oModifier = mPropertyBag.modifier;
            oModifier.insertAggregation(oParentControl, "dependents", oFilterFieldProperty);
            doRemoveItem = false;
          }
        }
        return Promise.resolve(doRemoveItem);
      }
      var doRemoveItem = true;
      var _temp5 = function () {
        if (!oParentControl.data("sap_fe_FilterBarDelegate_propertyInfoMap")) {
          var oMetaModel = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel().getMetaModel();
          if (!oMetaModel) {
            var _Promise$resolve2 = Promise.resolve(null);
            _exit2 = true;
            return _Promise$resolve2;
          }
          var _temp6 = function () {
            if (typeof oFilterFieldProperty !== "string" && oFilterFieldProperty.getFieldPath()) {
              return Promise.resolve(_addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, oFilterFieldProperty.getFieldPath())).then(function () {});
            } else {
              return Promise.resolve(_addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, oFilterFieldProperty)).then(function () {});
            }
          }();
          if (_temp6 && _temp6.then) return _temp6.then(function () {});
        }
      }();
      return Promise.resolve(_temp5 && _temp5.then ? _temp5.then(_temp4) : _temp4(_temp5));
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Method responsible for creating filter field condition in standalone / personalization filter bar.
   *
   * @param sPropertyInfoName Name of the property being added as filter field
   * @param oParentControl Parent control instance to which the filter field is added
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.addCondition = function (sPropertyInfoName, oParentControl, mPropertyBag) {
    try {
      var oMetaModel = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel().getMetaModel();
      if (!oMetaModel) {
        return Promise.resolve(null);
      }
      return Promise.resolve(_addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName)).then(function () {
        return Promise.resolve();
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };

  /**
   * Method responsible for removing filter field in standalone / personalization filter bar.
   *
   * @param sPropertyInfoName Name of the property being removed as filter field
   * @param oParentControl Parent control instance from which the filter field is removed
   * @param mPropertyBag Instance of property bag from Flex API
   * @returns The resolved promise
   */
  ODataFilterBarDelegate.removeCondition = function (sPropertyInfoName, oParentControl, mPropertyBag) {
    try {
      var _exit4 = false;
      function _temp9(_result2) {
        return _exit4 ? _result2 : Promise.resolve();
      }
      var _temp10 = function () {
        if (!oParentControl.data("sap_fe_FilterBarDelegate_propertyInfoMap")) {
          var oMetaModel = mPropertyBag && mPropertyBag.appComponent && mPropertyBag.appComponent.getModel().getMetaModel();
          if (!oMetaModel) {
            var _Promise$resolve4 = Promise.resolve(null);
            _exit4 = true;
            return _Promise$resolve4;
          }
          return Promise.resolve(_addPropertyInfo(oParentControl, mPropertyBag, oMetaModel, sPropertyInfoName)).then(function () {});
        }
      }();
      return Promise.resolve(_temp10 && _temp10.then ? _temp10.then(_temp9) : _temp9(_temp10));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  /**
   * Creates the filter field in the table adaptation of the FilterBar.
   *
   * @param sPropertyInfoName The property name of the entity type for which the filter field needs to be created
   * @param oParentControl Instance of the parent control
   * @returns Once resolved, a filter field definition is returned
   */
  ODataFilterBarDelegate._addP13nItem = function (sPropertyInfoName, oParentControl) {
    return DelegateUtil.fetchModel(oParentControl).then(function (oModel) {
      return ODataFilterBarDelegate._addFlexItem(sPropertyInfoName, oParentControl, oModel.getMetaModel(), undefined);
    }).catch(function (oError) {
      Log.error("Model could not be resolved", oError);
      return null;
    });
  };
  ODataFilterBarDelegate.fetchPropertiesForEntity = function (sEntityTypePath, oMetaModel, oFilterControl) {
    var oEntityType = oMetaModel.getObject(sEntityTypePath);
    var includeHidden = oFilterControl.isA("sap.ui.mdc.filterbar.vh.FilterBar") ? true : undefined;
    if (!oFilterControl || !oEntityType) {
      return [];
    }
    var oConverterContext = FilterUtils.createConverterContext(oFilterControl, sEntityTypePath);
    var sEntitySetPath = ModelHelper.getEntitySetPath(sEntityTypePath);
    var mFilterFields = FilterUtils.getConvertedFilterFields(oFilterControl, sEntityTypePath, includeHidden);
    var aFetchedProperties = [];
    mFilterFields.forEach(function (oFilterFieldInfo) {
      if (oFilterFieldInfo.annotationPath) {
        var sTargetPropertyPrefix = CommonHelper.getLocationForPropertyPath(oMetaModel, oFilterFieldInfo.annotationPath);
        var sProperty = oFilterFieldInfo.annotationPath.replace("".concat(sTargetPropertyPrefix, "/"), "");
        if (CommonUtils.isPropertyFilterable(oMetaModel, sTargetPropertyPrefix, _getPropertyPath(sProperty), true)) {
          aFetchedProperties.push(oFilterFieldInfo);
        }
      } else {
        //Custom Filters
        aFetchedProperties.push(oFilterFieldInfo);
      }
    });
    var aParameterFields = [];
    var processedFields = processSelectionFields(aFetchedProperties, oConverterContext);
    var processedFieldsKeys = [];
    processedFields.forEach(function (oProps) {
      if (oProps.key) {
        processedFieldsKeys.push(oProps.key);
      }
    });
    aFetchedProperties = aFetchedProperties.filter(function (oProp) {
      return processedFieldsKeys.includes(oProp.key);
    });
    var oFR = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oMetaModel),
      mAllowedExpressions = oFR.FilterAllowedExpressions;
    Object.keys(processedFields).forEach(function (sFilterFieldKey) {
      var oProp = processedFields[sFilterFieldKey];
      var oSelField = aFetchedProperties[sFilterFieldKey];
      if (!oSelField || !oSelField.conditionPath) {
        return;
      }
      var sPropertyPath = _getPropertyPath(oSelField.conditionPath);
      //fetchBasic
      oProp = Object.assign(oProp, {
        group: oSelField.group,
        groupLabel: oSelField.groupLabel,
        path: oSelField.conditionPath,
        tooltip: null,
        removeFromAppState: false,
        hasValueHelp: false
      });

      //fetchPropInfo
      if (oSelField.annotationPath) {
        var sAnnotationPath = oSelField.annotationPath;
        var oProperty = oMetaModel.getObject(sAnnotationPath),
          oPropertyAnnotations = oMetaModel.getObject("".concat(sAnnotationPath, "@")),
          oPropertyContext = oMetaModel.createBindingContext(sAnnotationPath);
        var bRemoveFromAppState = oPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] || oPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] || oPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"];
        var sTargetPropertyPrefix = CommonHelper.getLocationForPropertyPath(oMetaModel, oSelField.annotationPath);
        var sProperty = sAnnotationPath.replace("".concat(sTargetPropertyPrefix, "/"), "");
        var oFilterDefaultValueAnnotation;
        var oFilterDefaultValue;
        if (CommonUtils.isPropertyFilterable(oMetaModel, sTargetPropertyPrefix, _getPropertyPath(sProperty), true)) {
          oFilterDefaultValueAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.FilterDefaultValue"];
          if (oFilterDefaultValueAnnotation) {
            oFilterDefaultValue = oFilterDefaultValueAnnotation["$".concat(DelegateUtil.getModelType(oProperty.$Type))];
          }
          oProp = Object.assign(oProp, {
            tooltip: oPropertyAnnotations["@com.sap.vocabularies.Common.v1.QuickInfo"] || undefined,
            removeFromAppState: bRemoveFromAppState,
            hasValueHelp: hasValueHelp(oPropertyContext.getObject(), {
              context: oPropertyContext
            }),
            defaultFilterConditions: oFilterDefaultValue ? [{
              fieldPath: oSelField.conditionPath,
              operator: "EQ",
              values: [oFilterDefaultValue]
            }] : undefined
          });
        }
      }

      //base

      if (oProp) {
        if (mAllowedExpressions[sPropertyPath] && mAllowedExpressions[sPropertyPath].length > 0) {
          oProp.filterExpression = CommonUtils.getSpecificAllowedExpression(mAllowedExpressions[sPropertyPath]);
        } else {
          oProp.filterExpression = "auto";
        }
        oProp = Object.assign(oProp, {
          visible: oSelField.availability === "Default"
        });
      }
      processedFields[sFilterFieldKey] = oProp;
    });
    processedFields.forEach(function (propInfo) {
      if (propInfo.path === "$editState") {
        propInfo.label = ResourceModel.getText("FILTERBAR_EDITING_STATUS");
      }
      propInfo.typeConfig = TypeUtil.getTypeConfig(propInfo.dataType, propInfo.formatOptions, propInfo.constraints);
      propInfo.label = DelegateUtil.getLocalizedText(propInfo.label, oFilterControl) || "";
      if (propInfo.isParameter) {
        aParameterFields.push(propInfo.name);
      }
    });
    aFetchedProperties = processedFields;
    DelegateUtil.setCustomData(oFilterControl, "parameters", aParameterFields);
    return aFetchedProperties;
  };
  function getLineItemQualifierFromTable(oControl, oMetaModel) {
    if (oControl.isA("sap.fe.macros.table.TableAPI")) {
      var annotationPaths = oControl.getMetaPath().split("#")[0].split("/");
      switch (annotationPaths[annotationPaths.length - 1]) {
        case "@".concat("com.sap.vocabularies.UI.v1.SelectionPresentationVariant"):
        case "@".concat("com.sap.vocabularies.UI.v1.PresentationVariant"):
          return oMetaModel.getObject(oControl.getMetaPath()).Visualizations.find(function (visualization) {
            return visualization.$AnnotationPath.includes("@".concat("com.sap.vocabularies.UI.v1.LineItem"));
          }).$AnnotationPath;
        case "@".concat("com.sap.vocabularies.UI.v1.LineItem"):
          var metaPaths = oControl.getMetaPath().split("/");
          return metaPaths[metaPaths.length - 1];
      }
    }
    return undefined;
  }
  ODataFilterBarDelegate._addFlexItem = function (sFlexPropertyName, oParentControl, oMetaModel, oModifier, oAppComponent) {
    var sFilterBarId = oModifier ? oModifier.getId(oParentControl) : oParentControl.getId(),
      sIdPrefix = oModifier ? "" : "Adaptation",
      aSelectionFields = FilterUtils.getConvertedFilterFields(oParentControl, null, undefined, oMetaModel, oAppComponent, oModifier, oModifier ? undefined : getLineItemQualifierFromTable(oParentControl.getParent(), oMetaModel)),
      oSelectionField = ODataFilterBarDelegate._findSelectionField(aSelectionFields, sFlexPropertyName),
      sPropertyPath = _getPropertyPath(sFlexPropertyName),
      bIsXML = !!oModifier && oModifier.targets === "xmlTree";
    if (sFlexPropertyName === EDIT_STATE_PROPERTY_NAME) {
      return _templateEditState(sFilterBarId, oMetaModel, oModifier);
    } else if (sFlexPropertyName === SEARCH_PROPERTY_NAME) {
      return Promise.resolve(null);
    } else if (oSelectionField && oSelectionField.template) {
      return ODataFilterBarDelegate._templateCustomFilter(oParentControl, _generateIdPrefix(sFilterBarId, "".concat(sIdPrefix, "FilterField")), oSelectionField, oMetaModel, oModifier);
    }
    if (oSelectionField.type === "Slot" && oModifier) {
      return _addXMLCustomFilterField(oParentControl, oModifier, sPropertyPath);
    }
    var sNavigationPath = CommonHelper.getNavigationPath(sPropertyPath);
    var sAnnotationPath = oSelectionField.annotationPath;
    var sEntityTypePath;
    var sUseSemanticDateRange;
    var oSettings;
    var sBindingPath;
    var oParameters;
    return Promise.resolve().then(function () {
      if (oSelectionField.isParameter) {
        return sAnnotationPath.substr(0, sAnnotationPath.lastIndexOf("/") + 1);
      }
      return DelegateUtil.getCustomData(oParentControl, "entityType", oModifier);
    }).then(function (sRetrievedEntityTypePath) {
      sEntityTypePath = sRetrievedEntityTypePath;
      return DelegateUtil.getCustomData(oParentControl, "useSemanticDateRange", oModifier);
    }).then(function (sRetrievedUseSemanticDateRange) {
      sUseSemanticDateRange = sRetrievedUseSemanticDateRange;
      var oPropertyContext = oMetaModel.createBindingContext(sEntityTypePath + sPropertyPath);
      var sInFilterBarId = oModifier ? oModifier.getId(oParentControl) : oParentControl.getId();
      oSettings = {
        bindingContexts: {
          "contextPath": oMetaModel.createBindingContext(sEntityTypePath),
          "property": oPropertyContext
        },
        models: {
          "contextPath": oMetaModel,
          "property": oMetaModel
        },
        isXML: bIsXML
      };
      sBindingPath = "/".concat(ModelHelper.getEntitySetPath(sEntityTypePath).split("/").filter(ModelHelper.filterOutNavPropBinding).join("/"));
      oParameters = {
        sPropertyName: sPropertyPath,
        sBindingPath: sBindingPath,
        sValueHelpType: sIdPrefix + VALUE_HELP_TYPE,
        oControl: oParentControl,
        oMetaModel: oMetaModel,
        oModifier: oModifier,
        sIdPrefix: _generateIdPrefix(sInFilterBarId, "".concat(sIdPrefix, "FilterField"), sNavigationPath),
        sVhIdPrefix: _generateIdPrefix(sInFilterBarId, sIdPrefix + VALUE_HELP_TYPE),
        sNavigationPrefix: sNavigationPath,
        bUseSemanticDateRange: sUseSemanticDateRange,
        oSettings: oSelectionField ? oSelectionField.settings : {},
        visualFilter: oSelectionField ? oSelectionField.visualFilter : undefined
      };
      return DelegateUtil.doesValueHelpExist(oParameters);
    }).then(function (bValueHelpExists) {
      if (!bValueHelpExists) {
        return _templateValueHelp(oSettings, oParameters);
      }
      return Promise.resolve();
    }).then(function () {
      return _templateFilterField(oSettings, oParameters);
    });
  };
  function _getCachedProperties(oFilterBar) {
    // properties are not cached during templating
    if (oFilterBar instanceof window.Element) {
      return null;
    }
    return DelegateUtil.getCustomData(oFilterBar, FETCHED_PROPERTIES_DATA_KEY);
  }
  function _setCachedProperties(oFilterBar, aFetchedProperties) {
    // do not cache during templating, else it becomes part of the cached view
    if (oFilterBar instanceof window.Element) {
      return;
    }
    DelegateUtil.setCustomData(oFilterBar, FETCHED_PROPERTIES_DATA_KEY, aFetchedProperties);
  }
  function _getCachedOrFetchPropertiesForEntity(sEntityTypePath, oMetaModel, oFilterBar) {
    var aFetchedProperties = _getCachedProperties(oFilterBar);
    var localGroupLabel;
    if (!aFetchedProperties) {
      aFetchedProperties = ODataFilterBarDelegate.fetchPropertiesForEntity(sEntityTypePath, oMetaModel, oFilterBar);
      aFetchedProperties.forEach(function (oGroup) {
        localGroupLabel = null;
        if (oGroup.groupLabel) {
          localGroupLabel = DelegateUtil.getLocalizedText(oGroup.groupLabel, oFilterBar);
          oGroup.groupLabel = localGroupLabel === null ? oGroup.groupLabel : localGroupLabel;
        }
      });
      aFetchedProperties.sort(function (a, b) {
        if (a.groupLabel === undefined || a.groupLabel === null) {
          return -1;
        }
        if (b.groupLabel === undefined || b.groupLabel === null) {
          return 1;
        }
        return a.groupLabel.localeCompare(b.groupLabel);
      });
      _setCachedProperties(oFilterBar, aFetchedProperties);
    }
    return aFetchedProperties;
  }
  ODataFilterBarDelegate.fetchProperties = function (oFilterBar) {
    var sEntityTypePath = DelegateUtil.getCustomData(oFilterBar, "entityType");
    return DelegateUtil.fetchModel(oFilterBar).then(function (oModel) {
      if (!oModel) {
        return [];
      }
      return _getCachedOrFetchPropertiesForEntity(sEntityTypePath, oModel.getMetaModel(), oFilterBar);
      // var aCleanedProperties = aProperties.concat();
      // var aAllowedAttributes = ["name", "label", "visible", "path", "typeConfig", "maxConditions", "group", "groupLabel"];
      // aCleanedProperties.forEach(function(oProperty) {
      // 	Object.keys(oProperty).forEach(function(sPropName) {
      // 		if (aAllowedAttributes.indexOf(sPropName) === -1) {
      // 			delete oProperty[sPropName];
      // 		}
      // 	});
      // });
      // return aCleanedProperties;
    });
  };

  ODataFilterBarDelegate.getTypeUtil = function () {
    return TypeUtil;
  };
  return ODataFilterBarDelegate;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiX2FkZFByb3BlcnR5SW5mbyIsIm9QYXJlbnRDb250cm9sIiwibVByb3BlcnR5QmFnIiwib01ldGFNb2RlbCIsInNQcm9wZXJ0eUluZm9OYW1lIiwicmVwbGFjZSIsInNQcm9wZXJ0eUluZm9LZXkiLCJnZW5lcmF0ZSIsIm1vZGlmaWVyIiwiZ2V0UHJvcGVydHkiLCJkZWxlZ2F0ZSIsImFQcm9wZXJ0eUluZm8iLCJoYXNQcm9wZXJ0eUluZm8iLCJzb21lIiwicHJvcCIsImtleSIsIm5hbWUiLCJlbnRpdHlUeXBlUGF0aCIsInBheWxvYWQiLCJjb252ZXJ0ZXJDb250ZXh0IiwiRmlsdGVyVXRpbHMiLCJjcmVhdGVDb252ZXJ0ZXJDb250ZXh0IiwiYXBwQ29tcG9uZW50IiwiZW50aXR5VHlwZSIsImdldEVudGl0eVR5cGUiLCJmaWx0ZXJGaWVsZCIsImdldEZpbHRlckZpZWxkIiwiYnVpbGRQcm9wZXJ5SW5mbyIsInB1c2giLCJzZXRQcm9wZXJ0eSIsImVycm9yTXNnIiwiTG9nIiwid2FybmluZyIsImdldElkIiwiX2FkZFhNTEN1c3RvbUZpbHRlckZpZWxkIiwib0ZpbHRlckJhciIsIm9Nb2RpZmllciIsInNQcm9wZXJ0eVBhdGgiLCJQcm9taXNlIiwicmVzb2x2ZSIsImdldEFnZ3JlZ2F0aW9uIiwiYURlcGVuZGVudHMiLCJpIiwibGVuZ3RoIiwib0ZpbHRlckZpZWxkIiwiaXNBIiwic0RhdGFQcm9wZXJ0eSIsImdldEZpZWxkUGF0aCIsInNGaWx0ZXJGaWVsZElkIiwiaW5kZXhPZiIsIm9FcnJvciIsImVycm9yIiwiT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZSIsIk9iamVjdCIsImFzc2lnbiIsIkZpbHRlckJhckRlbGVnYXRlIiwiRURJVF9TVEFURV9QUk9QRVJUWV9OQU1FIiwiU0VBUkNIX1BST1BFUlRZX05BTUUiLCJWQUxVRV9IRUxQX1RZUEUiLCJGRVRDSEVEX1BST1BFUlRJRVNfREFUQV9LRVkiLCJDT05ESVRJT05fUEFUSF9UT19QUk9QRVJUWV9QQVRIX1JFR0VYIiwiX3RlbXBsYXRlRWRpdFN0YXRlIiwic0lkUHJlZml4IiwibWV0YU1vZGVsIiwib1RoaXMiLCJKU09OTW9kZWwiLCJpZCIsImlzRHJhZnRDb2xsYWJvcmF0aXZlIiwiTW9kZWxIZWxwZXIiLCJpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCIsIm9QcmVwcm9jZXNzb3JTZXR0aW5ncyIsImJpbmRpbmdDb250ZXh0cyIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwibW9kZWxzIiwiUmVzb3VyY2VNb2RlbCIsImdldE1vZGVsIiwiRGVsZWdhdGVVdGlsIiwidGVtcGxhdGVDb250cm9sRnJhZ21lbnQiLCJ1bmRlZmluZWQiLCJmaW5hbGx5IiwiZGVzdHJveSIsIl90ZW1wbGF0ZUN1c3RvbUZpbHRlciIsIm9TZWxlY3Rpb25GaWVsZEluZm8iLCJnZXRDdXN0b21EYXRhIiwic0VudGl0eVR5cGVQYXRoIiwib0l0ZW1Nb2RlbCIsIlRlbXBsYXRlTW9kZWwiLCJvVmlldyIsIkNvbW1vblV0aWxzIiwiZ2V0VGFyZ2V0VmlldyIsIm9Db250cm9sbGVyIiwiZ2V0Q29udHJvbGxlciIsIm9PcHRpb25zIiwiY29udHJvbGxlciIsInZpZXciLCJfZ2V0UHJvcGVydHlQYXRoIiwic0NvbmRpdGlvblBhdGgiLCJfZmluZFNlbGVjdGlvbkZpZWxkIiwiYVNlbGVjdGlvbkZpZWxkcyIsInNGbGV4TmFtZSIsImZpbmQiLCJvU2VsZWN0aW9uRmllbGQiLCJjb25kaXRpb25QYXRoIiwicmVwbGFjZUFsbCIsImF2YWlsYWJpbGl0eSIsIl9nZW5lcmF0ZUlkUHJlZml4Iiwic0ZpbHRlckJhcklkIiwic0NvbnRyb2xUeXBlIiwic05hdmlnYXRpb25QcmVmaXgiLCJfdGVtcGxhdGVWYWx1ZUhlbHAiLCJvU2V0dGluZ3MiLCJvUGFyYW1ldGVycyIsImlkUHJlZml4Iiwic1ZoSWRQcmVmaXgiLCJjb25kaXRpb25Nb2RlbCIsIm5hdmlnYXRpb25QcmVmaXgiLCJmaWx0ZXJGaWVsZFZhbHVlSGVscCIsInVzZVNlbWFudGljRGF0ZVJhbmdlIiwiYlVzZVNlbWFudGljRGF0ZVJhbmdlIiwidXNlTmV3VmFsdWVIZWxwIiwibG9jYXRpb24iLCJocmVmIiwibWVyZ2VPYmplY3RzIiwiaXNYTUwiLCJhVkhFbGVtZW50cyIsInNBZ2dyZWdhdGlvbk5hbWUiLCJmb3JFYWNoIiwiZWx0IiwiaW5zZXJ0QWdncmVnYXRpb24iLCJvQ29udHJvbCIsImNhdGNoIiwiX3RlbXBsYXRlRmlsdGVyRmllbGQiLCJ2aElkUHJlZml4IiwicHJvcGVydHlQYXRoIiwic1Byb3BlcnR5TmFtZSIsInNldHRpbmdzIiwidmlzdWFsRmlsdGVyIiwib1Zpc3VhbEZpbHRlciIsImFkZEl0ZW0iLCJfYWRkUDEzbkl0ZW0iLCJnZXRNZXRhTW9kZWwiLCJfYWRkRmxleEl0ZW0iLCJyZW1vdmVJdGVtIiwib0ZpbHRlckZpZWxkUHJvcGVydHkiLCJkYXRhIiwiZG9SZW1vdmVJdGVtIiwiYWRkQ29uZGl0aW9uIiwicmVtb3ZlQ29uZGl0aW9uIiwiZmV0Y2hNb2RlbCIsIm9Nb2RlbCIsImZldGNoUHJvcGVydGllc0ZvckVudGl0eSIsIm9GaWx0ZXJDb250cm9sIiwib0VudGl0eVR5cGUiLCJnZXRPYmplY3QiLCJpbmNsdWRlSGlkZGVuIiwib0NvbnZlcnRlckNvbnRleHQiLCJzRW50aXR5U2V0UGF0aCIsImdldEVudGl0eVNldFBhdGgiLCJtRmlsdGVyRmllbGRzIiwiZ2V0Q29udmVydGVkRmlsdGVyRmllbGRzIiwiYUZldGNoZWRQcm9wZXJ0aWVzIiwib0ZpbHRlckZpZWxkSW5mbyIsImFubm90YXRpb25QYXRoIiwic1RhcmdldFByb3BlcnR5UHJlZml4IiwiQ29tbW9uSGVscGVyIiwiZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgiLCJzUHJvcGVydHkiLCJpc1Byb3BlcnR5RmlsdGVyYWJsZSIsImFQYXJhbWV0ZXJGaWVsZHMiLCJwcm9jZXNzZWRGaWVsZHMiLCJwcm9jZXNzU2VsZWN0aW9uRmllbGRzIiwicHJvY2Vzc2VkRmllbGRzS2V5cyIsIm9Qcm9wcyIsImZpbHRlciIsIm9Qcm9wIiwiaW5jbHVkZXMiLCJvRlIiLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgiLCJtQWxsb3dlZEV4cHJlc3Npb25zIiwiRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zIiwia2V5cyIsInNGaWx0ZXJGaWVsZEtleSIsIm9TZWxGaWVsZCIsImdyb3VwIiwiZ3JvdXBMYWJlbCIsInBhdGgiLCJ0b29sdGlwIiwicmVtb3ZlRnJvbUFwcFN0YXRlIiwiaGFzVmFsdWVIZWxwIiwic0Fubm90YXRpb25QYXRoIiwib1Byb3BlcnR5Iiwib1Byb3BlcnR5QW5ub3RhdGlvbnMiLCJvUHJvcGVydHlDb250ZXh0IiwiYlJlbW92ZUZyb21BcHBTdGF0ZSIsIm9GaWx0ZXJEZWZhdWx0VmFsdWVBbm5vdGF0aW9uIiwib0ZpbHRlckRlZmF1bHRWYWx1ZSIsImdldE1vZGVsVHlwZSIsIiRUeXBlIiwiY29udGV4dCIsImRlZmF1bHRGaWx0ZXJDb25kaXRpb25zIiwiZmllbGRQYXRoIiwib3BlcmF0b3IiLCJ2YWx1ZXMiLCJmaWx0ZXJFeHByZXNzaW9uIiwiZ2V0U3BlY2lmaWNBbGxvd2VkRXhwcmVzc2lvbiIsInZpc2libGUiLCJwcm9wSW5mbyIsImxhYmVsIiwiZ2V0VGV4dCIsInR5cGVDb25maWciLCJUeXBlVXRpbCIsImdldFR5cGVDb25maWciLCJkYXRhVHlwZSIsImZvcm1hdE9wdGlvbnMiLCJjb25zdHJhaW50cyIsImdldExvY2FsaXplZFRleHQiLCJpc1BhcmFtZXRlciIsInNldEN1c3RvbURhdGEiLCJnZXRMaW5lSXRlbVF1YWxpZmllckZyb21UYWJsZSIsImFubm90YXRpb25QYXRocyIsImdldE1ldGFQYXRoIiwic3BsaXQiLCJWaXN1YWxpemF0aW9ucyIsInZpc3VhbGl6YXRpb24iLCIkQW5ub3RhdGlvblBhdGgiLCJtZXRhUGF0aHMiLCJzRmxleFByb3BlcnR5TmFtZSIsIm9BcHBDb21wb25lbnQiLCJnZXRQYXJlbnQiLCJiSXNYTUwiLCJ0YXJnZXRzIiwidGVtcGxhdGUiLCJ0eXBlIiwic05hdmlnYXRpb25QYXRoIiwiZ2V0TmF2aWdhdGlvblBhdGgiLCJzVXNlU2VtYW50aWNEYXRlUmFuZ2UiLCJzQmluZGluZ1BhdGgiLCJzdWJzdHIiLCJsYXN0SW5kZXhPZiIsInNSZXRyaWV2ZWRFbnRpdHlUeXBlUGF0aCIsInNSZXRyaWV2ZWRVc2VTZW1hbnRpY0RhdGVSYW5nZSIsInNJbkZpbHRlckJhcklkIiwiZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmciLCJqb2luIiwic1ZhbHVlSGVscFR5cGUiLCJkb2VzVmFsdWVIZWxwRXhpc3QiLCJiVmFsdWVIZWxwRXhpc3RzIiwiX2dldENhY2hlZFByb3BlcnRpZXMiLCJ3aW5kb3ciLCJFbGVtZW50IiwiX3NldENhY2hlZFByb3BlcnRpZXMiLCJfZ2V0Q2FjaGVkT3JGZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkiLCJsb2NhbEdyb3VwTGFiZWwiLCJvR3JvdXAiLCJzb3J0IiwiYSIsImIiLCJsb2NhbGVDb21wYXJlIiwiZmV0Y2hQcm9wZXJ0aWVzIiwiZ2V0VHlwZVV0aWwiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpbHRlckJhckRlbGVnYXRlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgbWVyZ2VPYmplY3RzIGZyb20gXCJzYXAvYmFzZS91dGlsL21lcmdlXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBwcm9jZXNzU2VsZWN0aW9uRmllbGRzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvTGlzdFJlcG9ydC9GaWx0ZXJCYXJcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2VuZXJhdGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9TdGFibGVJZEhlbHBlclwiO1xuaW1wb3J0IFRlbXBsYXRlTW9kZWwgZnJvbSBcInNhcC9mZS9jb3JlL1RlbXBsYXRlTW9kZWxcIjtcbmltcG9ydCB7IGhhc1ZhbHVlSGVscCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5Rm9ybWF0dGVyc1wiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCBEZWxlZ2F0ZVV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgUmVzb3VyY2VNb2RlbCBmcm9tIFwic2FwL2ZlL21hY3Jvcy9SZXNvdXJjZU1vZGVsXCI7XG5pbXBvcnQgRmlsdGVyQmFyIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhclwiO1xuaW1wb3J0IEZpbHRlckJhckRlbGVnYXRlIGZyb20gXCJzYXAvdWkvbWRjL0ZpbHRlckJhckRlbGVnYXRlXCI7XG5pbXBvcnQgVHlwZVV0aWwgZnJvbSBcInNhcC9mZS9jb3JlL3R5cGUvVHlwZVV0aWxcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuXG5jb25zdCBPRGF0YUZpbHRlckJhckRlbGVnYXRlID0gT2JqZWN0LmFzc2lnbih7fSwgRmlsdGVyQmFyRGVsZWdhdGUpIGFzIGFueTtcbmNvbnN0IEVESVRfU1RBVEVfUFJPUEVSVFlfTkFNRSA9IFwiJGVkaXRTdGF0ZVwiLFxuXHRTRUFSQ0hfUFJPUEVSVFlfTkFNRSA9IFwiJHNlYXJjaFwiLFxuXHRWQUxVRV9IRUxQX1RZUEUgPSBcIkZpbHRlckZpZWxkVmFsdWVIZWxwXCIsXG5cdEZFVENIRURfUFJPUEVSVElFU19EQVRBX0tFWSA9IFwic2FwX2ZlX0ZpbHRlckJhckRlbGVnYXRlX3Byb3BlcnR5SW5mb01hcFwiLFxuXHRDT05ESVRJT05fUEFUSF9UT19QUk9QRVJUWV9QQVRIX1JFR0VYID0gL1xcK3xcXCovZztcblxuZnVuY3Rpb24gX3RlbXBsYXRlRWRpdFN0YXRlKHNJZFByZWZpeDogYW55LCBtZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBvTW9kaWZpZXI6IGFueSkge1xuXHRjb25zdCBvVGhpcyA9IG5ldyBKU09OTW9kZWwoe1xuXHRcdFx0aWQ6IHNJZFByZWZpeCxcblx0XHRcdGlzRHJhZnRDb2xsYWJvcmF0aXZlOiBNb2RlbEhlbHBlci5pc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZChtZXRhTW9kZWwpXG5cdFx0fSksXG5cdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzID0ge1xuXHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFwidGhpc1wiOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdH0sXG5cdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XCJ0aGlzLmkxOG5cIjogUmVzb3VyY2VNb2RlbC5nZXRNb2RlbCgpLFxuXHRcdFx0XHRcInRoaXNcIjogb1RoaXNcblx0XHRcdH1cblx0XHR9O1xuXG5cdHJldHVybiBEZWxlZ2F0ZVV0aWwudGVtcGxhdGVDb250cm9sRnJhZ21lbnQoXCJzYXAuZmUubWFjcm9zLmZpbHRlci5EcmFmdEVkaXRTdGF0ZVwiLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIHVuZGVmaW5lZCwgb01vZGlmaWVyKS5maW5hbGx5KFxuXHRcdGZ1bmN0aW9uICgpIHtcblx0XHRcdG9UaGlzLmRlc3Ryb3koKTtcblx0XHR9XG5cdCk7XG59XG5cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX3RlbXBsYXRlQ3VzdG9tRmlsdGVyID0gYXN5bmMgZnVuY3Rpb24gKFxuXHRvRmlsdGVyQmFyOiBhbnksXG5cdHNJZFByZWZpeDogYW55LFxuXHRvU2VsZWN0aW9uRmllbGRJbmZvOiBhbnksXG5cdG9NZXRhTW9kZWw6IGFueSxcblx0b01vZGlmaWVyOiBhbnlcbikge1xuXHRjb25zdCBzRW50aXR5VHlwZVBhdGggPSBhd2FpdCBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvRmlsdGVyQmFyLCBcImVudGl0eVR5cGVcIiwgb01vZGlmaWVyKTtcblx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRcdGlkOiBzSWRQcmVmaXhcblx0XHR9KSxcblx0XHRvSXRlbU1vZGVsID0gbmV3IFRlbXBsYXRlTW9kZWwob1NlbGVjdGlvbkZpZWxkSW5mbywgb01ldGFNb2RlbCksXG5cdFx0b1ByZXByb2Nlc3NvclNldHRpbmdzID0ge1xuXHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFwiY29udGV4dFBhdGhcIjogb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzRW50aXR5VHlwZVBhdGgpLFxuXHRcdFx0XHRcInRoaXNcIjogb1RoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpLFxuXHRcdFx0XHRcIml0ZW1cIjogb0l0ZW1Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdH0sXG5cdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XCJjb250ZXh0UGF0aFwiOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcInRoaXNcIjogb1RoaXMsXG5cdFx0XHRcdFwiaXRlbVwiOiBvSXRlbU1vZGVsXG5cdFx0XHR9XG5cdFx0fSxcblx0XHRvVmlldyA9IENvbW1vblV0aWxzLmdldFRhcmdldFZpZXcob0ZpbHRlckJhciksXG5cdFx0b0NvbnRyb2xsZXIgPSBvVmlldyA/IG9WaWV3LmdldENvbnRyb2xsZXIoKSA6IHVuZGVmaW5lZCxcblx0XHRvT3B0aW9ucyA9IHtcblx0XHRcdGNvbnRyb2xsZXI6IG9Db250cm9sbGVyID8gb0NvbnRyb2xsZXIgOiB1bmRlZmluZWQsXG5cdFx0XHR2aWV3OiBvVmlld1xuXHRcdH07XG5cblx0cmV0dXJuIERlbGVnYXRlVXRpbC50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChcInNhcC5mZS5tYWNyb3MuZmlsdGVyLkN1c3RvbUZpbHRlclwiLCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MsIG9PcHRpb25zLCBvTW9kaWZpZXIpLmZpbmFsbHkoXG5cdFx0ZnVuY3Rpb24gKCkge1xuXHRcdFx0b1RoaXMuZGVzdHJveSgpO1xuXHRcdFx0b0l0ZW1Nb2RlbC5kZXN0cm95KCk7XG5cdFx0fVxuXHQpO1xufTtcbmZ1bmN0aW9uIF9nZXRQcm9wZXJ0eVBhdGgoc0NvbmRpdGlvblBhdGg6IGFueSkge1xuXHRyZXR1cm4gc0NvbmRpdGlvblBhdGgucmVwbGFjZShDT05ESVRJT05fUEFUSF9UT19QUk9QRVJUWV9QQVRIX1JFR0VYLCBcIlwiKTtcbn1cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX2ZpbmRTZWxlY3Rpb25GaWVsZCA9IGZ1bmN0aW9uIChhU2VsZWN0aW9uRmllbGRzOiBhbnksIHNGbGV4TmFtZTogYW55KSB7XG5cdHJldHVybiBhU2VsZWN0aW9uRmllbGRzLmZpbmQoZnVuY3Rpb24gKG9TZWxlY3Rpb25GaWVsZDogYW55KSB7XG5cdFx0cmV0dXJuIChcblx0XHRcdChvU2VsZWN0aW9uRmllbGQuY29uZGl0aW9uUGF0aCA9PT0gc0ZsZXhOYW1lIHx8IG9TZWxlY3Rpb25GaWVsZC5jb25kaXRpb25QYXRoLnJlcGxhY2VBbGwoL1xcKi9nLCBcIlwiKSA9PT0gc0ZsZXhOYW1lKSAmJlxuXHRcdFx0b1NlbGVjdGlvbkZpZWxkLmF2YWlsYWJpbGl0eSAhPT0gXCJIaWRkZW5cIlxuXHRcdCk7XG5cdH0pO1xufTtcbmZ1bmN0aW9uIF9nZW5lcmF0ZUlkUHJlZml4KHNGaWx0ZXJCYXJJZDogYW55LCBzQ29udHJvbFR5cGU6IGFueSwgc05hdmlnYXRpb25QcmVmaXg/OiBhbnkpIHtcblx0cmV0dXJuIHNOYXZpZ2F0aW9uUHJlZml4ID8gZ2VuZXJhdGUoW3NGaWx0ZXJCYXJJZCwgc0NvbnRyb2xUeXBlLCBzTmF2aWdhdGlvblByZWZpeF0pIDogZ2VuZXJhdGUoW3NGaWx0ZXJCYXJJZCwgc0NvbnRyb2xUeXBlXSk7XG59XG5mdW5jdGlvbiBfdGVtcGxhdGVWYWx1ZUhlbHAob1NldHRpbmdzOiBhbnksIG9QYXJhbWV0ZXJzOiBhbnkpIHtcblx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRpZFByZWZpeDogb1BhcmFtZXRlcnMuc1ZoSWRQcmVmaXgsXG5cdFx0Y29uZGl0aW9uTW9kZWw6IFwiJGZpbHRlcnNcIixcblx0XHRuYXZpZ2F0aW9uUHJlZml4OiBvUGFyYW1ldGVycy5zTmF2aWdhdGlvblByZWZpeCA/IGAvJHtvUGFyYW1ldGVycy5zTmF2aWdhdGlvblByZWZpeH1gIDogXCJcIixcblx0XHRmaWx0ZXJGaWVsZFZhbHVlSGVscDogdHJ1ZSxcblx0XHR1c2VTZW1hbnRpY0RhdGVSYW5nZTogb1BhcmFtZXRlcnMuYlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdHVzZU5ld1ZhbHVlSGVscDogbG9jYXRpb24uaHJlZi5pbmRleE9mKFwic2FwLWZlLW9sZEZpZWxkVmFsdWVIZWxwPXRydWVcIikgPCAwXG5cdH0pO1xuXHRjb25zdCBvUHJlcHJvY2Vzc29yU2V0dGluZ3MgPSBtZXJnZU9iamVjdHMoe30sIG9TZXR0aW5ncywge1xuXHRcdGJpbmRpbmdDb250ZXh0czoge1xuXHRcdFx0XCJ0aGlzXCI6IG9UaGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdH0sXG5cdFx0bW9kZWxzOiB7XG5cdFx0XHRcInRoaXNcIjogb1RoaXNcblx0XHR9XG5cdH0pO1xuXG5cdHJldHVybiBQcm9taXNlLnJlc29sdmUoXG5cdFx0RGVsZWdhdGVVdGlsLnRlbXBsYXRlQ29udHJvbEZyYWdtZW50KFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC52YWx1ZWhlbHAuVmFsdWVIZWxwXCIsIG9QcmVwcm9jZXNzb3JTZXR0aW5ncywge1xuXHRcdFx0aXNYTUw6IG9TZXR0aW5ncy5pc1hNTFxuXHRcdH0pXG5cdClcblx0XHQudGhlbihmdW5jdGlvbiAoYVZIRWxlbWVudHM6IGFueSkge1xuXHRcdFx0aWYgKGFWSEVsZW1lbnRzKSB7XG5cdFx0XHRcdGNvbnN0IHNBZ2dyZWdhdGlvbk5hbWUgPSBcImRlcGVuZGVudHNcIjtcblx0XHRcdFx0Ly9Tb21lIGZpbHRlciBmaWVsZHMgaGF2ZSB0aGUgUGVyc2lzdGVuY2VQcm92aWRlciBhZ2dyZWdhdGlvbiBiZXNpZGVzIHRoZSBGVkggOlxuXHRcdFx0XHRpZiAoYVZIRWxlbWVudHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0YVZIRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbiAoZWx0OiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmIChvUGFyYW1ldGVycy5vTW9kaWZpZXIpIHtcblx0XHRcdFx0XHRcdFx0b1BhcmFtZXRlcnMub01vZGlmaWVyLmluc2VydEFnZ3JlZ2F0aW9uKG9QYXJhbWV0ZXJzLm9Db250cm9sLCBzQWdncmVnYXRpb25OYW1lLCBlbHQsIDApO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0b1BhcmFtZXRlcnMub0NvbnRyb2wuaW5zZXJ0QWdncmVnYXRpb24oc0FnZ3JlZ2F0aW9uTmFtZSwgZWx0LCAwLCBmYWxzZSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSBpZiAob1BhcmFtZXRlcnMub01vZGlmaWVyKSB7XG5cdFx0XHRcdFx0b1BhcmFtZXRlcnMub01vZGlmaWVyLmluc2VydEFnZ3JlZ2F0aW9uKG9QYXJhbWV0ZXJzLm9Db250cm9sLCBzQWdncmVnYXRpb25OYW1lLCBhVkhFbGVtZW50cywgMCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0b1BhcmFtZXRlcnMub0NvbnRyb2wuaW5zZXJ0QWdncmVnYXRpb24oc0FnZ3JlZ2F0aW9uTmFtZSwgYVZIRWxlbWVudHMsIDAsIGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LmNhdGNoKGZ1bmN0aW9uIChvRXJyb3I6IGFueSkge1xuXHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgZXZhbHVhdGluZyBEZWxlZ2F0ZVV0aWwuaXNWYWx1ZUhlbHBSZXF1aXJlZFwiLCBvRXJyb3IpO1xuXHRcdH0pXG5cdFx0LmZpbmFsbHkoZnVuY3Rpb24gKCkge1xuXHRcdFx0b1RoaXMuZGVzdHJveSgpO1xuXHRcdH0pO1xufVxuYXN5bmMgZnVuY3Rpb24gX2FkZFhNTEN1c3RvbUZpbHRlckZpZWxkKG9GaWx0ZXJCYXI6IGFueSwgb01vZGlmaWVyOiBhbnksIHNQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHR0cnkge1xuXHRcdGNvbnN0IGFEZXBlbmRlbnRzID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKG9Nb2RpZmllci5nZXRBZ2dyZWdhdGlvbihvRmlsdGVyQmFyLCBcImRlcGVuZGVudHNcIikpO1xuXHRcdGxldCBpO1xuXHRcdGlmIChhRGVwZW5kZW50cyAmJiBhRGVwZW5kZW50cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRmb3IgKGkgPSAwOyBpIDw9IGFEZXBlbmRlbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IG9GaWx0ZXJGaWVsZCA9IGFEZXBlbmRlbnRzW2ldO1xuXHRcdFx0XHRpZiAob0ZpbHRlckZpZWxkICYmIG9GaWx0ZXJGaWVsZC5pc0EoXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc0RhdGFQcm9wZXJ0eSA9IG9GaWx0ZXJGaWVsZC5nZXRGaWVsZFBhdGgoKSxcblx0XHRcdFx0XHRcdHNGaWx0ZXJGaWVsZElkID0gb0ZpbHRlckZpZWxkLmdldElkKCk7XG5cdFx0XHRcdFx0aWYgKHNQcm9wZXJ0eVBhdGggPT09IHNEYXRhUHJvcGVydHkgJiYgc0ZpbHRlckZpZWxkSWQuaW5kZXhPZihcIkN1c3RvbUZpbHRlckZpZWxkXCIpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG9GaWx0ZXJGaWVsZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdExvZy5lcnJvcihcIkZpbHRlciBDYW5ub3QgYmUgYWRkZWRcIiwgb0Vycm9yKTtcblx0fVxufVxuZnVuY3Rpb24gX3RlbXBsYXRlRmlsdGVyRmllbGQob1NldHRpbmdzOiBhbnksIG9QYXJhbWV0ZXJzOiBhbnkpIHtcblx0Y29uc3Qgb1RoaXMgPSBuZXcgSlNPTk1vZGVsKHtcblx0XHRpZFByZWZpeDogb1BhcmFtZXRlcnMuc0lkUHJlZml4LFxuXHRcdHZoSWRQcmVmaXg6IG9QYXJhbWV0ZXJzLnNWaElkUHJlZml4LFxuXHRcdHByb3BlcnR5UGF0aDogb1BhcmFtZXRlcnMuc1Byb3BlcnR5TmFtZSxcblx0XHRuYXZpZ2F0aW9uUHJlZml4OiBvUGFyYW1ldGVycy5zTmF2aWdhdGlvblByZWZpeCA/IGAvJHtvUGFyYW1ldGVycy5zTmF2aWdhdGlvblByZWZpeH1gIDogXCJcIixcblx0XHR1c2VTZW1hbnRpY0RhdGVSYW5nZTogb1BhcmFtZXRlcnMuYlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdHNldHRpbmdzOiBvUGFyYW1ldGVycy5vU2V0dGluZ3MsXG5cdFx0dmlzdWFsRmlsdGVyOiBvUGFyYW1ldGVycy52aXN1YWxGaWx0ZXJcblx0fSk7XG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBvUGFyYW1ldGVycy5vTWV0YU1vZGVsO1xuXHRjb25zdCBvVmlzdWFsRmlsdGVyID0gbmV3IFRlbXBsYXRlTW9kZWwob1BhcmFtZXRlcnMudmlzdWFsRmlsdGVyLCBvTWV0YU1vZGVsKTtcblx0Y29uc3Qgb1ByZXByb2Nlc3NvclNldHRpbmdzID0gbWVyZ2VPYmplY3RzKHt9LCBvU2V0dGluZ3MsIHtcblx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFwidGhpc1wiOiBvVGhpcy5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcInZpc3VhbEZpbHRlclwiOiBvVmlzdWFsRmlsdGVyLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKVxuXHRcdH0sXG5cdFx0bW9kZWxzOiB7XG5cdFx0XHRcInRoaXNcIjogb1RoaXMsXG5cdFx0XHRcInZpc3VhbEZpbHRlclwiOiBvVmlzdWFsRmlsdGVyLFxuXHRcdFx0XCJtZXRhTW9kZWxcIjogb01ldGFNb2RlbFxuXHRcdH1cblx0fSk7XG5cblx0cmV0dXJuIERlbGVnYXRlVXRpbC50ZW1wbGF0ZUNvbnRyb2xGcmFnbWVudChcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuRmlsdGVyRmllbGRcIiwgb1ByZXByb2Nlc3NvclNldHRpbmdzLCB7XG5cdFx0aXNYTUw6IG9TZXR0aW5ncy5pc1hNTFxuXHR9KS5maW5hbGx5KGZ1bmN0aW9uICgpIHtcblx0XHRvVGhpcy5kZXN0cm95KCk7XG5cdH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBfYWRkUHJvcGVydHlJbmZvKG9QYXJlbnRDb250cm9sOiBGaWx0ZXJCYXIsIG1Qcm9wZXJ0eUJhZzogYW55LCBvTWV0YU1vZGVsOiBhbnksIHNQcm9wZXJ0eUluZm9OYW1lOiBzdHJpbmcpIHtcblx0dHJ5IHtcblx0XHRzUHJvcGVydHlJbmZvTmFtZSA9IHNQcm9wZXJ0eUluZm9OYW1lLnJlcGxhY2UoXCIqXCIsIFwiXCIpO1xuXHRcdGNvbnN0IHNQcm9wZXJ0eUluZm9LZXkgPSBnZW5lcmF0ZShbc1Byb3BlcnR5SW5mb05hbWVdKTsgLy9NYWtpbmcgc3VyZSB0aGF0IG5hdmlnYXRpb24gcHJvcGVydHkgbmFtZXMgYXJlIGdlbmVyYXRlZCBwcm9wZXJseSBlLmcuIF9JdGVtOjpNYXRlcmlhbFxuXHRcdGlmIChtUHJvcGVydHlCYWcgJiYgIW1Qcm9wZXJ0eUJhZy5tb2RpZmllcikge1xuXHRcdFx0dGhyb3cgXCJGaWx0ZXJCYXIgRGVsZWdhdGUgbWV0aG9kIGNhbGxlZCB3aXRob3V0IG1vZGlmaWVyLlwiO1xuXHRcdH1cblxuXHRcdGNvbnN0IGRlbGVnYXRlID0gYXdhaXQgbVByb3BlcnR5QmFnLm1vZGlmaWVyLmdldFByb3BlcnR5KG9QYXJlbnRDb250cm9sLCBcImRlbGVnYXRlXCIpO1xuXHRcdGNvbnN0IGFQcm9wZXJ0eUluZm8gPSBhd2FpdCBtUHJvcGVydHlCYWcubW9kaWZpZXIuZ2V0UHJvcGVydHkob1BhcmVudENvbnRyb2wsIFwicHJvcGVydHlJbmZvXCIpO1xuXHRcdC8vV2UgZG8gbm90IGdldCBwcm9wZXJ0eUluZm8gaW4gY2FzZSBvZiB0YWJsZSBmaWx0ZXJzXG5cdFx0aWYgKGFQcm9wZXJ0eUluZm8pIHtcblx0XHRcdGNvbnN0IGhhc1Byb3BlcnR5SW5mbyA9IGFQcm9wZXJ0eUluZm8uc29tZShmdW5jdGlvbiAocHJvcDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBwcm9wLmtleSA9PT0gc1Byb3BlcnR5SW5mb0tleSB8fCBwcm9wLm5hbWUgPT09IHNQcm9wZXJ0eUluZm9LZXk7XG5cdFx0XHR9KTtcblx0XHRcdGlmICghaGFzUHJvcGVydHlJbmZvKSB7XG5cdFx0XHRcdGNvbnN0IGVudGl0eVR5cGVQYXRoID0gZGVsZWdhdGUucGF5bG9hZC5lbnRpdHlUeXBlUGF0aDtcblx0XHRcdFx0Y29uc3QgY29udmVydGVyQ29udGV4dCA9IEZpbHRlclV0aWxzLmNyZWF0ZUNvbnZlcnRlckNvbnRleHQoXG5cdFx0XHRcdFx0b1BhcmVudENvbnRyb2wsXG5cdFx0XHRcdFx0ZW50aXR5VHlwZVBhdGgsXG5cdFx0XHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdFx0XHRtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0XHRcdFx0bGV0IGZpbHRlckZpZWxkID0gRmlsdGVyVXRpbHMuZ2V0RmlsdGVyRmllbGQoc1Byb3BlcnR5SW5mb05hbWUsIGNvbnZlcnRlckNvbnRleHQsIGVudGl0eVR5cGUpO1xuXHRcdFx0XHRmaWx0ZXJGaWVsZCA9IEZpbHRlclV0aWxzLmJ1aWxkUHJvcGVyeUluZm8oZmlsdGVyRmllbGQsIGNvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0XHRhUHJvcGVydHlJbmZvLnB1c2goZmlsdGVyRmllbGQpO1xuXHRcdFx0XHRtUHJvcGVydHlCYWcubW9kaWZpZXIuc2V0UHJvcGVydHkob1BhcmVudENvbnRyb2wsIFwicHJvcGVydHlJbmZvXCIsIGFQcm9wZXJ0eUluZm8pO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBjYXRjaCAoZXJyb3JNc2cpIHtcblx0XHRMb2cud2FybmluZyhgJHtvUGFyZW50Q29udHJvbC5nZXRJZCgpfSA6ICR7ZXJyb3JNc2d9YCk7XG5cdH1cbn1cblxuLyoqXG4gKiBNZXRob2QgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIGZpbHRlciBmaWVsZCBpbiBzdGFuZGFsb25lIC8gcGVyc29uYWxpemF0aW9uIGZpbHRlciBiYXIuXG4gKlxuICogQHBhcmFtIHNQcm9wZXJ0eUluZm9OYW1lIE5hbWUgb2YgdGhlIHByb3BlcnR5IGJlaW5nIGFkZGVkIGFzIGZpbHRlciBmaWVsZFxuICogQHBhcmFtIG9QYXJlbnRDb250cm9sIFBhcmVudCBjb250cm9sIGluc3RhbmNlIHRvIHdoaWNoIHRoZSBmaWx0ZXIgZmllbGQgaXMgYWRkZWRcbiAqIEBwYXJhbSBtUHJvcGVydHlCYWcgSW5zdGFuY2Ugb2YgcHJvcGVydHkgYmFnIGZyb20gRmxleCBBUElcbiAqIEByZXR1cm5zIE9uY2UgcmVzb2x2ZWQsIGEgZmlsdGVyIGZpZWxkIGRlZmluaXRpb24gaXMgcmV0dXJuZWRcbiAqL1xuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5hZGRJdGVtID0gYXN5bmMgZnVuY3Rpb24gKHNQcm9wZXJ0eUluZm9OYW1lOiBzdHJpbmcsIG9QYXJlbnRDb250cm9sOiBGaWx0ZXJCYXIsIG1Qcm9wZXJ0eUJhZzogYW55KSB7XG5cdGlmICghbVByb3BlcnR5QmFnKSB7XG5cdFx0Ly8gSW52b2tlZCBkdXJpbmcgcnVudGltZS5cblx0XHRyZXR1cm4gT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fYWRkUDEzbkl0ZW0oc1Byb3BlcnR5SW5mb05hbWUsIG9QYXJlbnRDb250cm9sKTtcblx0fVxuXG5cdGNvbnN0IG9NZXRhTW9kZWwgPSBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50ICYmIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0aWYgKCFvTWV0YU1vZGVsKSB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0fVxuXHRhd2FpdCBfYWRkUHJvcGVydHlJbmZvKG9QYXJlbnRDb250cm9sLCBtUHJvcGVydHlCYWcsIG9NZXRhTW9kZWwsIHNQcm9wZXJ0eUluZm9OYW1lKTtcblx0cmV0dXJuIE9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX2FkZEZsZXhJdGVtKFxuXHRcdHNQcm9wZXJ0eUluZm9OYW1lLFxuXHRcdG9QYXJlbnRDb250cm9sLFxuXHRcdG9NZXRhTW9kZWwsXG5cdFx0bVByb3BlcnR5QmFnLm1vZGlmaWVyLFxuXHRcdG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnRcblx0KTtcbn07XG5cbi8qKlxuICogTWV0aG9kIHJlc3BvbnNpYmxlIGZvciByZW1vdmluZyBmaWx0ZXIgZmllbGQgaW4gc3RhbmRhbG9uZSAvIHBlcnNvbmFsaXphdGlvbiBmaWx0ZXIgYmFyLlxuICpcbiAqIEBwYXJhbSBvRmlsdGVyRmllbGRQcm9wZXJ0eSBPYmplY3Qgb2YgdGhlIGZpbHRlciBmaWVsZCBwcm9wZXJ0eSBiZWluZyByZW1vdmVkIGFzIGZpbHRlciBmaWVsZFxuICogQHBhcmFtIG9QYXJlbnRDb250cm9sIFBhcmVudCBjb250cm9sIGluc3RhbmNlIGZyb20gd2hpY2ggdGhlIGZpbHRlciBmaWVsZCBpcyByZW1vdmVkXG4gKiBAcGFyYW0gbVByb3BlcnR5QmFnIEluc3RhbmNlIG9mIHByb3BlcnR5IGJhZyBmcm9tIEZsZXggQVBJXG4gKiBAcmV0dXJucyBUaGUgcmVzb2x2ZWQgcHJvbWlzZVxuICovXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLnJlbW92ZUl0ZW0gPSBhc3luYyBmdW5jdGlvbiAob0ZpbHRlckZpZWxkUHJvcGVydHk6IGFueSwgb1BhcmVudENvbnRyb2w6IGFueSwgbVByb3BlcnR5QmFnOiBhbnkpIHtcblx0bGV0IGRvUmVtb3ZlSXRlbSA9IHRydWU7XG5cdGlmICghb1BhcmVudENvbnRyb2wuZGF0YShcInNhcF9mZV9GaWx0ZXJCYXJEZWxlZ2F0ZV9wcm9wZXJ0eUluZm9NYXBcIikpIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gbVByb3BlcnR5QmFnICYmIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQgJiYgbVByb3BlcnR5QmFnLmFwcENvbXBvbmVudC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRcdGlmICghb01ldGFNb2RlbCkge1xuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcblx0XHR9XG5cdFx0aWYgKHR5cGVvZiBvRmlsdGVyRmllbGRQcm9wZXJ0eSAhPT0gXCJzdHJpbmdcIiAmJiBvRmlsdGVyRmllbGRQcm9wZXJ0eS5nZXRGaWVsZFBhdGgoKSkge1xuXHRcdFx0YXdhaXQgX2FkZFByb3BlcnR5SW5mbyhvUGFyZW50Q29udHJvbCwgbVByb3BlcnR5QmFnLCBvTWV0YU1vZGVsLCBvRmlsdGVyRmllbGRQcm9wZXJ0eS5nZXRGaWVsZFBhdGgoKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGF3YWl0IF9hZGRQcm9wZXJ0eUluZm8ob1BhcmVudENvbnRyb2wsIG1Qcm9wZXJ0eUJhZywgb01ldGFNb2RlbCwgb0ZpbHRlckZpZWxkUHJvcGVydHkpO1xuXHRcdH1cblx0fVxuXHRpZiAodHlwZW9mIG9GaWx0ZXJGaWVsZFByb3BlcnR5ICE9PSBcInN0cmluZ1wiICYmIG9GaWx0ZXJGaWVsZFByb3BlcnR5LmlzQSAmJiBvRmlsdGVyRmllbGRQcm9wZXJ0eS5pc0EoXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpKSB7XG5cdFx0aWYgKG9GaWx0ZXJGaWVsZFByb3BlcnR5LmRhdGEoXCJpc1Nsb3RcIikgPT09IFwidHJ1ZVwiICYmIG1Qcm9wZXJ0eUJhZykge1xuXHRcdFx0Ly8gSW5zZXJ0aW5nIGludG8gdGhlIG1vZGlmaWVyIGNyZWF0ZXMgYSBjaGFuZ2UgZnJvbSBmbGV4IGFsc28gZmlsdGVyIGlzIGJlZW4gcmVtb3ZlZCBoZW5jZSBwcm9taXNlIGlzIHJlc29sdmVkIHRvIGZhbHNlXG5cdFx0XHRjb25zdCBvTW9kaWZpZXIgPSBtUHJvcGVydHlCYWcubW9kaWZpZXI7XG5cdFx0XHRvTW9kaWZpZXIuaW5zZXJ0QWdncmVnYXRpb24ob1BhcmVudENvbnRyb2wsIFwiZGVwZW5kZW50c1wiLCBvRmlsdGVyRmllbGRQcm9wZXJ0eSk7XG5cdFx0XHRkb1JlbW92ZUl0ZW0gPSBmYWxzZTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShkb1JlbW92ZUl0ZW0pO1xufTtcblxuLyoqXG4gKiBNZXRob2QgcmVzcG9uc2libGUgZm9yIGNyZWF0aW5nIGZpbHRlciBmaWVsZCBjb25kaXRpb24gaW4gc3RhbmRhbG9uZSAvIHBlcnNvbmFsaXphdGlvbiBmaWx0ZXIgYmFyLlxuICpcbiAqIEBwYXJhbSBzUHJvcGVydHlJbmZvTmFtZSBOYW1lIG9mIHRoZSBwcm9wZXJ0eSBiZWluZyBhZGRlZCBhcyBmaWx0ZXIgZmllbGRcbiAqIEBwYXJhbSBvUGFyZW50Q29udHJvbCBQYXJlbnQgY29udHJvbCBpbnN0YW5jZSB0byB3aGljaCB0aGUgZmlsdGVyIGZpZWxkIGlzIGFkZGVkXG4gKiBAcGFyYW0gbVByb3BlcnR5QmFnIEluc3RhbmNlIG9mIHByb3BlcnR5IGJhZyBmcm9tIEZsZXggQVBJXG4gKiBAcmV0dXJucyBUaGUgcmVzb2x2ZWQgcHJvbWlzZVxuICovXG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLmFkZENvbmRpdGlvbiA9IGFzeW5jIGZ1bmN0aW9uIChzUHJvcGVydHlJbmZvTmFtZTogc3RyaW5nLCBvUGFyZW50Q29udHJvbDogRmlsdGVyQmFyLCBtUHJvcGVydHlCYWc6IGFueSkge1xuXHRjb25zdCBvTWV0YU1vZGVsID0gbVByb3BlcnR5QmFnICYmIG1Qcm9wZXJ0eUJhZy5hcHBDb21wb25lbnQgJiYgbVByb3BlcnR5QmFnLmFwcENvbXBvbmVudC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpO1xuXHRpZiAoIW9NZXRhTW9kZWwpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHR9XG5cdGF3YWl0IF9hZGRQcm9wZXJ0eUluZm8ob1BhcmVudENvbnRyb2wsIG1Qcm9wZXJ0eUJhZywgb01ldGFNb2RlbCwgc1Byb3BlcnR5SW5mb05hbWUpO1xuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG59O1xuXG4vKipcbiAqIE1ldGhvZCByZXNwb25zaWJsZSBmb3IgcmVtb3ZpbmcgZmlsdGVyIGZpZWxkIGluIHN0YW5kYWxvbmUgLyBwZXJzb25hbGl6YXRpb24gZmlsdGVyIGJhci5cbiAqXG4gKiBAcGFyYW0gc1Byb3BlcnR5SW5mb05hbWUgTmFtZSBvZiB0aGUgcHJvcGVydHkgYmVpbmcgcmVtb3ZlZCBhcyBmaWx0ZXIgZmllbGRcbiAqIEBwYXJhbSBvUGFyZW50Q29udHJvbCBQYXJlbnQgY29udHJvbCBpbnN0YW5jZSBmcm9tIHdoaWNoIHRoZSBmaWx0ZXIgZmllbGQgaXMgcmVtb3ZlZFxuICogQHBhcmFtIG1Qcm9wZXJ0eUJhZyBJbnN0YW5jZSBvZiBwcm9wZXJ0eSBiYWcgZnJvbSBGbGV4IEFQSVxuICogQHJldHVybnMgVGhlIHJlc29sdmVkIHByb21pc2VcbiAqL1xuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5yZW1vdmVDb25kaXRpb24gPSBhc3luYyBmdW5jdGlvbiAoc1Byb3BlcnR5SW5mb05hbWU6IHN0cmluZywgb1BhcmVudENvbnRyb2w6IGFueSwgbVByb3BlcnR5QmFnOiBhbnkpIHtcblx0aWYgKCFvUGFyZW50Q29udHJvbC5kYXRhKFwic2FwX2ZlX0ZpbHRlckJhckRlbGVnYXRlX3Byb3BlcnR5SW5mb01hcFwiKSkge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBtUHJvcGVydHlCYWcgJiYgbVByb3BlcnR5QmFnLmFwcENvbXBvbmVudCAmJiBtUHJvcGVydHlCYWcuYXBwQ29tcG9uZW50LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCk7XG5cdFx0aWYgKCFvTWV0YU1vZGVsKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHRcdH1cblx0XHRhd2FpdCBfYWRkUHJvcGVydHlJbmZvKG9QYXJlbnRDb250cm9sLCBtUHJvcGVydHlCYWcsIG9NZXRhTW9kZWwsIHNQcm9wZXJ0eUluZm9OYW1lKTtcblx0fVxuXHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG59O1xuLyoqXG4gKiBDcmVhdGVzIHRoZSBmaWx0ZXIgZmllbGQgaW4gdGhlIHRhYmxlIGFkYXB0YXRpb24gb2YgdGhlIEZpbHRlckJhci5cbiAqXG4gKiBAcGFyYW0gc1Byb3BlcnR5SW5mb05hbWUgVGhlIHByb3BlcnR5IG5hbWUgb2YgdGhlIGVudGl0eSB0eXBlIGZvciB3aGljaCB0aGUgZmlsdGVyIGZpZWxkIG5lZWRzIHRvIGJlIGNyZWF0ZWRcbiAqIEBwYXJhbSBvUGFyZW50Q29udHJvbCBJbnN0YW5jZSBvZiB0aGUgcGFyZW50IGNvbnRyb2xcbiAqIEByZXR1cm5zIE9uY2UgcmVzb2x2ZWQsIGEgZmlsdGVyIGZpZWxkIGRlZmluaXRpb24gaXMgcmV0dXJuZWRcbiAqL1xuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fYWRkUDEzbkl0ZW0gPSBmdW5jdGlvbiAoc1Byb3BlcnR5SW5mb05hbWU6IHN0cmluZywgb1BhcmVudENvbnRyb2w6IG9iamVjdCkge1xuXHRyZXR1cm4gRGVsZWdhdGVVdGlsLmZldGNoTW9kZWwob1BhcmVudENvbnRyb2wpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKG9Nb2RlbDogYW55KSB7XG5cdFx0XHRyZXR1cm4gT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fYWRkRmxleEl0ZW0oc1Byb3BlcnR5SW5mb05hbWUsIG9QYXJlbnRDb250cm9sLCBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksIHVuZGVmaW5lZCk7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRMb2cuZXJyb3IoXCJNb2RlbCBjb3VsZCBub3QgYmUgcmVzb2x2ZWRcIiwgb0Vycm9yKTtcblx0XHRcdHJldHVybiBudWxsO1xuXHRcdH0pO1xufTtcbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuZmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5ID0gZnVuY3Rpb24gKHNFbnRpdHlUeXBlUGF0aDogYW55LCBvTWV0YU1vZGVsOiBhbnksIG9GaWx0ZXJDb250cm9sOiBhbnkpIHtcblx0Y29uc3Qgb0VudGl0eVR5cGUgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzRW50aXR5VHlwZVBhdGgpO1xuXHRjb25zdCBpbmNsdWRlSGlkZGVuID0gb0ZpbHRlckNvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5maWx0ZXJiYXIudmguRmlsdGVyQmFyXCIpID8gdHJ1ZSA6IHVuZGVmaW5lZDtcblx0aWYgKCFvRmlsdGVyQ29udHJvbCB8fCAhb0VudGl0eVR5cGUpIHtcblx0XHRyZXR1cm4gW107XG5cdH1cblx0Y29uc3Qgb0NvbnZlcnRlckNvbnRleHQgPSBGaWx0ZXJVdGlscy5jcmVhdGVDb252ZXJ0ZXJDb250ZXh0KG9GaWx0ZXJDb250cm9sLCBzRW50aXR5VHlwZVBhdGgpO1xuXHRjb25zdCBzRW50aXR5U2V0UGF0aCA9IE1vZGVsSGVscGVyLmdldEVudGl0eVNldFBhdGgoc0VudGl0eVR5cGVQYXRoKTtcblxuXHRjb25zdCBtRmlsdGVyRmllbGRzID0gRmlsdGVyVXRpbHMuZ2V0Q29udmVydGVkRmlsdGVyRmllbGRzKG9GaWx0ZXJDb250cm9sLCBzRW50aXR5VHlwZVBhdGgsIGluY2x1ZGVIaWRkZW4pO1xuXHRsZXQgYUZldGNoZWRQcm9wZXJ0aWVzOiBhbnlbXSA9IFtdO1xuXHRtRmlsdGVyRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKG9GaWx0ZXJGaWVsZEluZm86IGFueSkge1xuXHRcdGlmIChvRmlsdGVyRmllbGRJbmZvLmFubm90YXRpb25QYXRoKSB7XG5cdFx0XHRjb25zdCBzVGFyZ2V0UHJvcGVydHlQcmVmaXggPSBDb21tb25IZWxwZXIuZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgob01ldGFNb2RlbCwgb0ZpbHRlckZpZWxkSW5mby5hbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRjb25zdCBzUHJvcGVydHkgPSBvRmlsdGVyRmllbGRJbmZvLmFubm90YXRpb25QYXRoLnJlcGxhY2UoYCR7c1RhcmdldFByb3BlcnR5UHJlZml4fS9gLCBcIlwiKTtcblxuXHRcdFx0aWYgKENvbW1vblV0aWxzLmlzUHJvcGVydHlGaWx0ZXJhYmxlKG9NZXRhTW9kZWwsIHNUYXJnZXRQcm9wZXJ0eVByZWZpeCwgX2dldFByb3BlcnR5UGF0aChzUHJvcGVydHkpLCB0cnVlKSkge1xuXHRcdFx0XHRhRmV0Y2hlZFByb3BlcnRpZXMucHVzaChvRmlsdGVyRmllbGRJbmZvKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly9DdXN0b20gRmlsdGVyc1xuXHRcdFx0YUZldGNoZWRQcm9wZXJ0aWVzLnB1c2gob0ZpbHRlckZpZWxkSW5mbyk7XG5cdFx0fVxuXHR9KTtcblxuXHRjb25zdCBhUGFyYW1ldGVyRmllbGRzOiBhbnlbXSA9IFtdO1xuXHRjb25zdCBwcm9jZXNzZWRGaWVsZHMgPSBwcm9jZXNzU2VsZWN0aW9uRmllbGRzKGFGZXRjaGVkUHJvcGVydGllcywgb0NvbnZlcnRlckNvbnRleHQpO1xuXHRjb25zdCBwcm9jZXNzZWRGaWVsZHNLZXlzOiBhbnlbXSA9IFtdO1xuXHRwcm9jZXNzZWRGaWVsZHMuZm9yRWFjaChmdW5jdGlvbiAob1Byb3BzOiBhbnkpIHtcblx0XHRpZiAob1Byb3BzLmtleSkge1xuXHRcdFx0cHJvY2Vzc2VkRmllbGRzS2V5cy5wdXNoKG9Qcm9wcy5rZXkpO1xuXHRcdH1cblx0fSk7XG5cblx0YUZldGNoZWRQcm9wZXJ0aWVzID0gYUZldGNoZWRQcm9wZXJ0aWVzLmZpbHRlcihmdW5jdGlvbiAob1Byb3A6IGFueSkge1xuXHRcdHJldHVybiBwcm9jZXNzZWRGaWVsZHNLZXlzLmluY2x1ZGVzKG9Qcm9wLmtleSk7XG5cdH0pO1xuXG5cdGNvbnN0IG9GUiA9IENvbW1vblV0aWxzLmdldEZpbHRlclJlc3RyaWN0aW9uc0J5UGF0aChzRW50aXR5U2V0UGF0aCwgb01ldGFNb2RlbCksXG5cdFx0bUFsbG93ZWRFeHByZXNzaW9ucyA9IG9GUi5GaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnM7XG5cdE9iamVjdC5rZXlzKHByb2Nlc3NlZEZpZWxkcykuZm9yRWFjaChmdW5jdGlvbiAoc0ZpbHRlckZpZWxkS2V5OiBzdHJpbmcpIHtcblx0XHRsZXQgb1Byb3AgPSBwcm9jZXNzZWRGaWVsZHNbc0ZpbHRlckZpZWxkS2V5XTtcblx0XHRjb25zdCBvU2VsRmllbGQgPSBhRmV0Y2hlZFByb3BlcnRpZXNbc0ZpbHRlckZpZWxkS2V5IGFzIGFueV07XG5cdFx0aWYgKCFvU2VsRmllbGQgfHwgIW9TZWxGaWVsZC5jb25kaXRpb25QYXRoKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBfZ2V0UHJvcGVydHlQYXRoKG9TZWxGaWVsZC5jb25kaXRpb25QYXRoKTtcblx0XHQvL2ZldGNoQmFzaWNcblx0XHRvUHJvcCA9IE9iamVjdC5hc3NpZ24ob1Byb3AsIHtcblx0XHRcdGdyb3VwOiBvU2VsRmllbGQuZ3JvdXAsXG5cdFx0XHRncm91cExhYmVsOiBvU2VsRmllbGQuZ3JvdXBMYWJlbCxcblx0XHRcdHBhdGg6IG9TZWxGaWVsZC5jb25kaXRpb25QYXRoLFxuXHRcdFx0dG9vbHRpcDogbnVsbCxcblx0XHRcdHJlbW92ZUZyb21BcHBTdGF0ZTogZmFsc2UsXG5cdFx0XHRoYXNWYWx1ZUhlbHA6IGZhbHNlXG5cdFx0fSk7XG5cblx0XHQvL2ZldGNoUHJvcEluZm9cblx0XHRpZiAob1NlbEZpZWxkLmFubm90YXRpb25QYXRoKSB7XG5cdFx0XHRjb25zdCBzQW5ub3RhdGlvblBhdGggPSBvU2VsRmllbGQuYW5ub3RhdGlvblBhdGg7XG5cdFx0XHRjb25zdCBvUHJvcGVydHkgPSBvTWV0YU1vZGVsLmdldE9iamVjdChzQW5ub3RhdGlvblBhdGgpLFxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NBbm5vdGF0aW9uUGF0aH1AYCksXG5cdFx0XHRcdG9Qcm9wZXJ0eUNvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNBbm5vdGF0aW9uUGF0aCk7XG5cblx0XHRcdGNvbnN0IGJSZW1vdmVGcm9tQXBwU3RhdGUgPVxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuSXNQb3RlbnRpYWxseVNlbnNpdGl2ZVwiXSB8fFxuXHRcdFx0XHRvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5FeGNsdWRlRnJvbU5hdmlnYXRpb25Db250ZXh0XCJdIHx8XG5cdFx0XHRcdG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5NZWFzdXJlXCJdO1xuXG5cdFx0XHRjb25zdCBzVGFyZ2V0UHJvcGVydHlQcmVmaXggPSBDb21tb25IZWxwZXIuZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgob01ldGFNb2RlbCwgb1NlbEZpZWxkLmFubm90YXRpb25QYXRoKTtcblx0XHRcdGNvbnN0IHNQcm9wZXJ0eSA9IHNBbm5vdGF0aW9uUGF0aC5yZXBsYWNlKGAke3NUYXJnZXRQcm9wZXJ0eVByZWZpeH0vYCwgXCJcIik7XG5cdFx0XHRsZXQgb0ZpbHRlckRlZmF1bHRWYWx1ZUFubm90YXRpb247XG5cdFx0XHRsZXQgb0ZpbHRlckRlZmF1bHRWYWx1ZTtcblx0XHRcdGlmIChDb21tb25VdGlscy5pc1Byb3BlcnR5RmlsdGVyYWJsZShvTWV0YU1vZGVsLCBzVGFyZ2V0UHJvcGVydHlQcmVmaXgsIF9nZXRQcm9wZXJ0eVBhdGgoc1Byb3BlcnR5KSwgdHJ1ZSkpIHtcblx0XHRcdFx0b0ZpbHRlckRlZmF1bHRWYWx1ZUFubm90YXRpb24gPSBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmlsdGVyRGVmYXVsdFZhbHVlXCJdO1xuXHRcdFx0XHRpZiAob0ZpbHRlckRlZmF1bHRWYWx1ZUFubm90YXRpb24pIHtcblx0XHRcdFx0XHRvRmlsdGVyRGVmYXVsdFZhbHVlID0gb0ZpbHRlckRlZmF1bHRWYWx1ZUFubm90YXRpb25bYCQke0RlbGVnYXRlVXRpbC5nZXRNb2RlbFR5cGUob1Byb3BlcnR5LiRUeXBlKX1gXTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdG9Qcm9wID0gT2JqZWN0LmFzc2lnbihvUHJvcCwge1xuXHRcdFx0XHRcdHRvb2x0aXA6IG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5RdWlja0luZm9cIl0gfHwgdW5kZWZpbmVkLFxuXHRcdFx0XHRcdHJlbW92ZUZyb21BcHBTdGF0ZTogYlJlbW92ZUZyb21BcHBTdGF0ZSxcblx0XHRcdFx0XHRoYXNWYWx1ZUhlbHA6IGhhc1ZhbHVlSGVscChvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpLCB7IGNvbnRleHQ6IG9Qcm9wZXJ0eUNvbnRleHQgfSksXG5cdFx0XHRcdFx0ZGVmYXVsdEZpbHRlckNvbmRpdGlvbnM6IG9GaWx0ZXJEZWZhdWx0VmFsdWVcblx0XHRcdFx0XHRcdD8gW1xuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdGZpZWxkUGF0aDogb1NlbEZpZWxkLmNvbmRpdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0XHRvcGVyYXRvcjogXCJFUVwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0dmFsdWVzOiBbb0ZpbHRlckRlZmF1bHRWYWx1ZV1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQgIF1cblx0XHRcdFx0XHRcdDogdW5kZWZpbmVkXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8vYmFzZVxuXG5cdFx0aWYgKG9Qcm9wKSB7XG5cdFx0XHRpZiAobUFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHlQYXRoXSAmJiBtQWxsb3dlZEV4cHJlc3Npb25zW3NQcm9wZXJ0eVBhdGhdLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0b1Byb3AuZmlsdGVyRXhwcmVzc2lvbiA9IENvbW1vblV0aWxzLmdldFNwZWNpZmljQWxsb3dlZEV4cHJlc3Npb24obUFsbG93ZWRFeHByZXNzaW9uc1tzUHJvcGVydHlQYXRoXSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvUHJvcC5maWx0ZXJFeHByZXNzaW9uID0gXCJhdXRvXCI7XG5cdFx0XHR9XG5cblx0XHRcdG9Qcm9wID0gT2JqZWN0LmFzc2lnbihvUHJvcCwge1xuXHRcdFx0XHR2aXNpYmxlOiBvU2VsRmllbGQuYXZhaWxhYmlsaXR5ID09PSBcIkRlZmF1bHRcIlxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cHJvY2Vzc2VkRmllbGRzW3NGaWx0ZXJGaWVsZEtleV0gPSBvUHJvcDtcblx0fSk7XG5cdHByb2Nlc3NlZEZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChwcm9wSW5mbzogYW55KSB7XG5cdFx0aWYgKHByb3BJbmZvLnBhdGggPT09IFwiJGVkaXRTdGF0ZVwiKSB7XG5cdFx0XHRwcm9wSW5mby5sYWJlbCA9IFJlc291cmNlTW9kZWwuZ2V0VGV4dChcIkZJTFRFUkJBUl9FRElUSU5HX1NUQVRVU1wiKTtcblx0XHR9XG5cdFx0cHJvcEluZm8udHlwZUNvbmZpZyA9IFR5cGVVdGlsLmdldFR5cGVDb25maWcocHJvcEluZm8uZGF0YVR5cGUsIHByb3BJbmZvLmZvcm1hdE9wdGlvbnMsIHByb3BJbmZvLmNvbnN0cmFpbnRzKTtcblx0XHRwcm9wSW5mby5sYWJlbCA9IERlbGVnYXRlVXRpbC5nZXRMb2NhbGl6ZWRUZXh0KHByb3BJbmZvLmxhYmVsLCBvRmlsdGVyQ29udHJvbCkgfHwgXCJcIjtcblx0XHRpZiAocHJvcEluZm8uaXNQYXJhbWV0ZXIpIHtcblx0XHRcdGFQYXJhbWV0ZXJGaWVsZHMucHVzaChwcm9wSW5mby5uYW1lKTtcblx0XHR9XG5cdH0pO1xuXG5cdGFGZXRjaGVkUHJvcGVydGllcyA9IHByb2Nlc3NlZEZpZWxkcztcblx0RGVsZWdhdGVVdGlsLnNldEN1c3RvbURhdGEob0ZpbHRlckNvbnRyb2wsIFwicGFyYW1ldGVyc1wiLCBhUGFyYW1ldGVyRmllbGRzKTtcblxuXHRyZXR1cm4gYUZldGNoZWRQcm9wZXJ0aWVzO1xufTtcblxuZnVuY3Rpb24gZ2V0TGluZUl0ZW1RdWFsaWZpZXJGcm9tVGFibGUob0NvbnRyb2w6IGFueSwgb01ldGFNb2RlbDogYW55KSB7XG5cdGlmIChvQ29udHJvbC5pc0EoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlQVBJXCIpKSB7XG5cdFx0Y29uc3QgYW5ub3RhdGlvblBhdGhzID0gb0NvbnRyb2wuZ2V0TWV0YVBhdGgoKS5zcGxpdChcIiNcIilbMF0uc3BsaXQoXCIvXCIpO1xuXHRcdHN3aXRjaCAoYW5ub3RhdGlvblBhdGhzW2Fubm90YXRpb25QYXRocy5sZW5ndGggLSAxXSkge1xuXHRcdFx0Y2FzZSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudH1gOlxuXHRcdFx0Y2FzZSBgQCR7VUlBbm5vdGF0aW9uVGVybXMuUHJlc2VudGF0aW9uVmFyaWFudH1gOlxuXHRcdFx0XHRyZXR1cm4gb01ldGFNb2RlbFxuXHRcdFx0XHRcdC5nZXRPYmplY3Qob0NvbnRyb2wuZ2V0TWV0YVBhdGgoKSlcblx0XHRcdFx0XHQuVmlzdWFsaXphdGlvbnMuZmluZCgodmlzdWFsaXphdGlvbjogYW55KSA9PiB2aXN1YWxpemF0aW9uLiRBbm5vdGF0aW9uUGF0aC5pbmNsdWRlcyhgQCR7VUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW19YCkpXG5cdFx0XHRcdFx0LiRBbm5vdGF0aW9uUGF0aDtcblx0XHRcdGNhc2UgYEAke1VJQW5ub3RhdGlvblRlcm1zLkxpbmVJdGVtfWA6XG5cdFx0XHRcdGNvbnN0IG1ldGFQYXRocyA9IG9Db250cm9sLmdldE1ldGFQYXRoKCkuc3BsaXQoXCIvXCIpO1xuXHRcdFx0XHRyZXR1cm4gbWV0YVBhdGhzW21ldGFQYXRocy5sZW5ndGggLSAxXTtcblx0XHR9XG5cdH1cblx0cmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fYWRkRmxleEl0ZW0gPSBmdW5jdGlvbiAoXG5cdHNGbGV4UHJvcGVydHlOYW1lOiBhbnksXG5cdG9QYXJlbnRDb250cm9sOiBhbnksXG5cdG9NZXRhTW9kZWw6IGFueSxcblx0b01vZGlmaWVyOiBhbnksXG5cdG9BcHBDb21wb25lbnQ6IGFueVxuKSB7XG5cdGNvbnN0IHNGaWx0ZXJCYXJJZCA9IG9Nb2RpZmllciA/IG9Nb2RpZmllci5nZXRJZChvUGFyZW50Q29udHJvbCkgOiBvUGFyZW50Q29udHJvbC5nZXRJZCgpLFxuXHRcdHNJZFByZWZpeCA9IG9Nb2RpZmllciA/IFwiXCIgOiBcIkFkYXB0YXRpb25cIixcblx0XHRhU2VsZWN0aW9uRmllbGRzID0gRmlsdGVyVXRpbHMuZ2V0Q29udmVydGVkRmlsdGVyRmllbGRzKFxuXHRcdFx0b1BhcmVudENvbnRyb2wsXG5cdFx0XHRudWxsLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0b01ldGFNb2RlbCxcblx0XHRcdG9BcHBDb21wb25lbnQsXG5cdFx0XHRvTW9kaWZpZXIsXG5cdFx0XHRvTW9kaWZpZXIgPyB1bmRlZmluZWQgOiBnZXRMaW5lSXRlbVF1YWxpZmllckZyb21UYWJsZShvUGFyZW50Q29udHJvbC5nZXRQYXJlbnQoKSwgb01ldGFNb2RlbClcblx0XHQpLFxuXHRcdG9TZWxlY3Rpb25GaWVsZCA9IE9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuX2ZpbmRTZWxlY3Rpb25GaWVsZChhU2VsZWN0aW9uRmllbGRzLCBzRmxleFByb3BlcnR5TmFtZSksXG5cdFx0c1Byb3BlcnR5UGF0aCA9IF9nZXRQcm9wZXJ0eVBhdGgoc0ZsZXhQcm9wZXJ0eU5hbWUpLFxuXHRcdGJJc1hNTCA9ICEhb01vZGlmaWVyICYmIG9Nb2RpZmllci50YXJnZXRzID09PSBcInhtbFRyZWVcIjtcblx0aWYgKHNGbGV4UHJvcGVydHlOYW1lID09PSBFRElUX1NUQVRFX1BST1BFUlRZX05BTUUpIHtcblx0XHRyZXR1cm4gX3RlbXBsYXRlRWRpdFN0YXRlKHNGaWx0ZXJCYXJJZCwgb01ldGFNb2RlbCwgb01vZGlmaWVyKTtcblx0fSBlbHNlIGlmIChzRmxleFByb3BlcnR5TmFtZSA9PT0gU0VBUkNIX1BST1BFUlRZX05BTUUpIHtcblx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuXHR9IGVsc2UgaWYgKG9TZWxlY3Rpb25GaWVsZCAmJiBvU2VsZWN0aW9uRmllbGQudGVtcGxhdGUpIHtcblx0XHRyZXR1cm4gT0RhdGFGaWx0ZXJCYXJEZWxlZ2F0ZS5fdGVtcGxhdGVDdXN0b21GaWx0ZXIoXG5cdFx0XHRvUGFyZW50Q29udHJvbCxcblx0XHRcdF9nZW5lcmF0ZUlkUHJlZml4KHNGaWx0ZXJCYXJJZCwgYCR7c0lkUHJlZml4fUZpbHRlckZpZWxkYCksXG5cdFx0XHRvU2VsZWN0aW9uRmllbGQsXG5cdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0b01vZGlmaWVyXG5cdFx0KTtcblx0fVxuXG5cdGlmIChvU2VsZWN0aW9uRmllbGQudHlwZSA9PT0gXCJTbG90XCIgJiYgb01vZGlmaWVyKSB7XG5cdFx0cmV0dXJuIF9hZGRYTUxDdXN0b21GaWx0ZXJGaWVsZChvUGFyZW50Q29udHJvbCwgb01vZGlmaWVyLCBzUHJvcGVydHlQYXRoKTtcblx0fVxuXG5cdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9IENvbW1vbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChzUHJvcGVydHlQYXRoKTtcblx0Y29uc3Qgc0Fubm90YXRpb25QYXRoID0gb1NlbGVjdGlvbkZpZWxkLmFubm90YXRpb25QYXRoO1xuXHRsZXQgc0VudGl0eVR5cGVQYXRoOiBzdHJpbmc7XG5cdGxldCBzVXNlU2VtYW50aWNEYXRlUmFuZ2U7XG5cdGxldCBvU2V0dGluZ3M6IGFueTtcblx0bGV0IHNCaW5kaW5nUGF0aDtcblx0bGV0IG9QYXJhbWV0ZXJzOiBhbnk7XG5cblx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpXG5cdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0aWYgKG9TZWxlY3Rpb25GaWVsZC5pc1BhcmFtZXRlcikge1xuXHRcdFx0XHRyZXR1cm4gc0Fubm90YXRpb25QYXRoLnN1YnN0cigwLCBzQW5ub3RhdGlvblBhdGgubGFzdEluZGV4T2YoXCIvXCIpICsgMSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1BhcmVudENvbnRyb2wsIFwiZW50aXR5VHlwZVwiLCBvTW9kaWZpZXIpO1xuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHNSZXRyaWV2ZWRFbnRpdHlUeXBlUGF0aDogYW55KSB7XG5cdFx0XHRzRW50aXR5VHlwZVBhdGggPSBzUmV0cmlldmVkRW50aXR5VHlwZVBhdGg7XG5cdFx0XHRyZXR1cm4gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob1BhcmVudENvbnRyb2wsIFwidXNlU2VtYW50aWNEYXRlUmFuZ2VcIiwgb01vZGlmaWVyKTtcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uIChzUmV0cmlldmVkVXNlU2VtYW50aWNEYXRlUmFuZ2U6IGFueSkge1xuXHRcdFx0c1VzZVNlbWFudGljRGF0ZVJhbmdlID0gc1JldHJpZXZlZFVzZVNlbWFudGljRGF0ZVJhbmdlO1xuXHRcdFx0Y29uc3Qgb1Byb3BlcnR5Q29udGV4dCA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0VudGl0eVR5cGVQYXRoICsgc1Byb3BlcnR5UGF0aCk7XG5cdFx0XHRjb25zdCBzSW5GaWx0ZXJCYXJJZCA9IG9Nb2RpZmllciA/IG9Nb2RpZmllci5nZXRJZChvUGFyZW50Q29udHJvbCkgOiBvUGFyZW50Q29udHJvbC5nZXRJZCgpO1xuXHRcdFx0b1NldHRpbmdzID0ge1xuXHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcImNvbnRleHRQYXRoXCI6IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc0VudGl0eVR5cGVQYXRoKSxcblx0XHRcdFx0XHRcInByb3BlcnR5XCI6IG9Qcm9wZXJ0eUNvbnRleHRcblx0XHRcdFx0fSxcblx0XHRcdFx0bW9kZWxzOiB7XG5cdFx0XHRcdFx0XCJjb250ZXh0UGF0aFwiOiBvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFwicHJvcGVydHlcIjogb01ldGFNb2RlbFxuXHRcdFx0XHR9LFxuXHRcdFx0XHRpc1hNTDogYklzWE1MXG5cdFx0XHR9O1xuXHRcdFx0c0JpbmRpbmdQYXRoID0gYC8ke01vZGVsSGVscGVyLmdldEVudGl0eVNldFBhdGgoc0VudGl0eVR5cGVQYXRoKVxuXHRcdFx0XHQuc3BsaXQoXCIvXCIpXG5cdFx0XHRcdC5maWx0ZXIoTW9kZWxIZWxwZXIuZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmcpXG5cdFx0XHRcdC5qb2luKFwiL1wiKX1gO1xuXHRcdFx0b1BhcmFtZXRlcnMgPSB7XG5cdFx0XHRcdHNQcm9wZXJ0eU5hbWU6IHNQcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdHNCaW5kaW5nUGF0aDogc0JpbmRpbmdQYXRoLFxuXHRcdFx0XHRzVmFsdWVIZWxwVHlwZTogc0lkUHJlZml4ICsgVkFMVUVfSEVMUF9UWVBFLFxuXHRcdFx0XHRvQ29udHJvbDogb1BhcmVudENvbnRyb2wsXG5cdFx0XHRcdG9NZXRhTW9kZWw6IG9NZXRhTW9kZWwsXG5cdFx0XHRcdG9Nb2RpZmllcjogb01vZGlmaWVyLFxuXHRcdFx0XHRzSWRQcmVmaXg6IF9nZW5lcmF0ZUlkUHJlZml4KHNJbkZpbHRlckJhcklkLCBgJHtzSWRQcmVmaXh9RmlsdGVyRmllbGRgLCBzTmF2aWdhdGlvblBhdGgpLFxuXHRcdFx0XHRzVmhJZFByZWZpeDogX2dlbmVyYXRlSWRQcmVmaXgoc0luRmlsdGVyQmFySWQsIHNJZFByZWZpeCArIFZBTFVFX0hFTFBfVFlQRSksXG5cdFx0XHRcdHNOYXZpZ2F0aW9uUHJlZml4OiBzTmF2aWdhdGlvblBhdGgsXG5cdFx0XHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZTogc1VzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRvU2V0dGluZ3M6IG9TZWxlY3Rpb25GaWVsZCA/IG9TZWxlY3Rpb25GaWVsZC5zZXR0aW5ncyA6IHt9LFxuXHRcdFx0XHR2aXN1YWxGaWx0ZXI6IG9TZWxlY3Rpb25GaWVsZCA/IG9TZWxlY3Rpb25GaWVsZC52aXN1YWxGaWx0ZXIgOiB1bmRlZmluZWRcblx0XHRcdH07XG5cblx0XHRcdHJldHVybiBEZWxlZ2F0ZVV0aWwuZG9lc1ZhbHVlSGVscEV4aXN0KG9QYXJhbWV0ZXJzKTtcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uIChiVmFsdWVIZWxwRXhpc3RzOiBhbnkpIHtcblx0XHRcdGlmICghYlZhbHVlSGVscEV4aXN0cykge1xuXHRcdFx0XHRyZXR1cm4gX3RlbXBsYXRlVmFsdWVIZWxwKG9TZXR0aW5ncywgb1BhcmFtZXRlcnMpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIF90ZW1wbGF0ZUZpbHRlckZpZWxkKG9TZXR0aW5ncywgb1BhcmFtZXRlcnMpO1xuXHRcdH0pO1xufTtcbmZ1bmN0aW9uIF9nZXRDYWNoZWRQcm9wZXJ0aWVzKG9GaWx0ZXJCYXI6IGFueSkge1xuXHQvLyBwcm9wZXJ0aWVzIGFyZSBub3QgY2FjaGVkIGR1cmluZyB0ZW1wbGF0aW5nXG5cdGlmIChvRmlsdGVyQmFyIGluc3RhbmNlb2Ygd2luZG93LkVsZW1lbnQpIHtcblx0XHRyZXR1cm4gbnVsbDtcblx0fVxuXHRyZXR1cm4gRGVsZWdhdGVVdGlsLmdldEN1c3RvbURhdGEob0ZpbHRlckJhciwgRkVUQ0hFRF9QUk9QRVJUSUVTX0RBVEFfS0VZKTtcbn1cbmZ1bmN0aW9uIF9zZXRDYWNoZWRQcm9wZXJ0aWVzKG9GaWx0ZXJCYXI6IGFueSwgYUZldGNoZWRQcm9wZXJ0aWVzOiBhbnkpIHtcblx0Ly8gZG8gbm90IGNhY2hlIGR1cmluZyB0ZW1wbGF0aW5nLCBlbHNlIGl0IGJlY29tZXMgcGFydCBvZiB0aGUgY2FjaGVkIHZpZXdcblx0aWYgKG9GaWx0ZXJCYXIgaW5zdGFuY2VvZiB3aW5kb3cuRWxlbWVudCkge1xuXHRcdHJldHVybjtcblx0fVxuXHREZWxlZ2F0ZVV0aWwuc2V0Q3VzdG9tRGF0YShvRmlsdGVyQmFyLCBGRVRDSEVEX1BST1BFUlRJRVNfREFUQV9LRVksIGFGZXRjaGVkUHJvcGVydGllcyk7XG59XG5mdW5jdGlvbiBfZ2V0Q2FjaGVkT3JGZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkoc0VudGl0eVR5cGVQYXRoOiBhbnksIG9NZXRhTW9kZWw6IGFueSwgb0ZpbHRlckJhcjogYW55KSB7XG5cdGxldCBhRmV0Y2hlZFByb3BlcnRpZXMgPSBfZ2V0Q2FjaGVkUHJvcGVydGllcyhvRmlsdGVyQmFyKTtcblx0bGV0IGxvY2FsR3JvdXBMYWJlbDtcblxuXHRpZiAoIWFGZXRjaGVkUHJvcGVydGllcykge1xuXHRcdGFGZXRjaGVkUHJvcGVydGllcyA9IE9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuZmV0Y2hQcm9wZXJ0aWVzRm9yRW50aXR5KHNFbnRpdHlUeXBlUGF0aCwgb01ldGFNb2RlbCwgb0ZpbHRlckJhcik7XG5cdFx0YUZldGNoZWRQcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKG9Hcm91cDogYW55KSB7XG5cdFx0XHRsb2NhbEdyb3VwTGFiZWwgPSBudWxsO1xuXHRcdFx0aWYgKG9Hcm91cC5ncm91cExhYmVsKSB7XG5cdFx0XHRcdGxvY2FsR3JvdXBMYWJlbCA9IERlbGVnYXRlVXRpbC5nZXRMb2NhbGl6ZWRUZXh0KG9Hcm91cC5ncm91cExhYmVsLCBvRmlsdGVyQmFyKTtcblx0XHRcdFx0b0dyb3VwLmdyb3VwTGFiZWwgPSBsb2NhbEdyb3VwTGFiZWwgPT09IG51bGwgPyBvR3JvdXAuZ3JvdXBMYWJlbCA6IGxvY2FsR3JvdXBMYWJlbDtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRhRmV0Y2hlZFByb3BlcnRpZXMuc29ydChmdW5jdGlvbiAoYTogYW55LCBiOiBhbnkpIHtcblx0XHRcdGlmIChhLmdyb3VwTGFiZWwgPT09IHVuZGVmaW5lZCB8fCBhLmdyb3VwTGFiZWwgPT09IG51bGwpIHtcblx0XHRcdFx0cmV0dXJuIC0xO1xuXHRcdFx0fVxuXHRcdFx0aWYgKGIuZ3JvdXBMYWJlbCA9PT0gdW5kZWZpbmVkIHx8IGIuZ3JvdXBMYWJlbCA9PT0gbnVsbCkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBhLmdyb3VwTGFiZWwubG9jYWxlQ29tcGFyZShiLmdyb3VwTGFiZWwpO1xuXHRcdH0pO1xuXHRcdF9zZXRDYWNoZWRQcm9wZXJ0aWVzKG9GaWx0ZXJCYXIsIGFGZXRjaGVkUHJvcGVydGllcyk7XG5cdH1cblx0cmV0dXJuIGFGZXRjaGVkUHJvcGVydGllcztcbn1cbk9EYXRhRmlsdGVyQmFyRGVsZWdhdGUuZmV0Y2hQcm9wZXJ0aWVzID0gZnVuY3Rpb24gKG9GaWx0ZXJCYXI6IGFueSkge1xuXHRjb25zdCBzRW50aXR5VHlwZVBhdGggPSBEZWxlZ2F0ZVV0aWwuZ2V0Q3VzdG9tRGF0YShvRmlsdGVyQmFyLCBcImVudGl0eVR5cGVcIik7XG5cdHJldHVybiBEZWxlZ2F0ZVV0aWwuZmV0Y2hNb2RlbChvRmlsdGVyQmFyKS50aGVuKGZ1bmN0aW9uIChvTW9kZWw6IGFueSkge1xuXHRcdGlmICghb01vZGVsKSB7XG5cdFx0XHRyZXR1cm4gW107XG5cdFx0fVxuXHRcdHJldHVybiBfZ2V0Q2FjaGVkT3JGZXRjaFByb3BlcnRpZXNGb3JFbnRpdHkoc0VudGl0eVR5cGVQYXRoLCBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksIG9GaWx0ZXJCYXIpO1xuXHRcdC8vIHZhciBhQ2xlYW5lZFByb3BlcnRpZXMgPSBhUHJvcGVydGllcy5jb25jYXQoKTtcblx0XHQvLyB2YXIgYUFsbG93ZWRBdHRyaWJ1dGVzID0gW1wibmFtZVwiLCBcImxhYmVsXCIsIFwidmlzaWJsZVwiLCBcInBhdGhcIiwgXCJ0eXBlQ29uZmlnXCIsIFwibWF4Q29uZGl0aW9uc1wiLCBcImdyb3VwXCIsIFwiZ3JvdXBMYWJlbFwiXTtcblx0XHQvLyBhQ2xlYW5lZFByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbihvUHJvcGVydHkpIHtcblx0XHQvLyBcdE9iamVjdC5rZXlzKG9Qcm9wZXJ0eSkuZm9yRWFjaChmdW5jdGlvbihzUHJvcE5hbWUpIHtcblx0XHQvLyBcdFx0aWYgKGFBbGxvd2VkQXR0cmlidXRlcy5pbmRleE9mKHNQcm9wTmFtZSkgPT09IC0xKSB7XG5cdFx0Ly8gXHRcdFx0ZGVsZXRlIG9Qcm9wZXJ0eVtzUHJvcE5hbWVdO1xuXHRcdC8vIFx0XHR9XG5cdFx0Ly8gXHR9KTtcblx0XHQvLyB9KTtcblx0XHQvLyByZXR1cm4gYUNsZWFuZWRQcm9wZXJ0aWVzO1xuXHR9KTtcbn07XG5PRGF0YUZpbHRlckJhckRlbGVnYXRlLmdldFR5cGVVdGlsID0gZnVuY3Rpb24gKCkge1xuXHRyZXR1cm4gVHlwZVV0aWw7XG59O1xuXG5leHBvcnQgZGVmYXVsdCBPRGF0YUZpbHRlckJhckRlbGVnYXRlO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O0VBa2pCTyxnQkFBZ0JBLElBQUksRUFBRUMsT0FBTyxFQUFFO0lBQ3JDLElBQUk7TUFDSCxJQUFJQyxNQUFNLEdBQUdGLElBQUksRUFBRTtJQUNwQixDQUFDLENBQUMsT0FB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