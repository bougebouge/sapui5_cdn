/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/SideEffectsHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/FieldControlHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/internal/valuehelp/ValueListHelper", "sap/fe/macros/ResourceModel", "sap/ui/base/ManagedObject", "sap/ui/core/format/DateFormat", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/AnnotationHelper"], function (Log, CommonUtils, BindingHelper, Key, BindingToolkit, ModelHelper, SideEffectsHelper, StableIdHelper, FieldControlHelper, PropertyHelper, UIFormatters, CommonHelper, ValueListHelper, ResourceModel, ManagedObject, DateFormat, JSONModel, AnnotationHelper) {
  "use strict";

  var getAlignmentExpression = UIFormatters.getAlignmentExpression;
  var isProperty = PropertyHelper.isProperty;
  var isRequiredExpression = FieldControlHelper.isRequiredExpression;
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var ifElse = BindingToolkit.ifElse;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var KeyHelper = Key.KeyHelper;
  var UI = BindingHelper.UI;
  /**
   * What does the map look like?
   *    {
   *  	'namespace.of.entityType' : [
   * 			[namespace.of.entityType1#Qualifier,namespace.of.entityType2#Qualifier], --> Search For: mappingSourceEntities
   * 			{
   * 				'property' : [namespace.of.entityType3#Qualifier,namespace.of.entityType4#Qualifier] --> Search For: mappingSourceProperties
   * 			}
   * 	}.
   *
   * @param oInterface Interface instance
   * @returns Promise resolved when the map is ready and provides the map
   */
  var _generateSideEffectsMap = function (oInterface) {
    try {
      var oMetaModel = oInterface.getModel();
      var oFieldSettings = oInterface.getSetting("sap.fe.macros.internal.Field");
      var oSideEffects = oFieldSettings.sideEffects;

      // Generate map once
      if (oSideEffects) {
        return Promise.resolve(oSideEffects);
      }
      return Promise.resolve(SideEffectsHelper.generateSideEffectsMapFromMetaModel(oMetaModel));
    } catch (e) {
      return Promise.reject(e);
    }
  };
  var ISOCurrency = "@Org.OData.Measures.V1.ISOCurrency",
    Unit = "@Org.OData.Measures.V1.Unit";
  var FieldHelper = {
    /**
     * Determine how to show the value by analyzing Text and TextArrangement Annotations.
     *
     * @function
     * @name sap.fe.macros.field.FieldHelper#displayMode
     * @memberof sap.fe.macros.field.FieldHelper
     * @static
     * @param oPropertyAnnotations The Property annotations
     * @param oCollectionAnnotations The EntityType annotations
     * @returns The display mode of the field
     * @private
     * @ui5-restricted
     */
    displayMode: function (oPropertyAnnotations, oCollectionAnnotations) {
      var oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"],
        oTextArrangementAnnotation = oTextAnnotation && (oPropertyAnnotations && oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"] || oCollectionAnnotations && oCollectionAnnotations["@com.sap.vocabularies.UI.v1.TextArrangement"]);
      if (oTextArrangementAnnotation) {
        if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
          return "Description";
        } else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
          return "ValueDescription";
        }
        //Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
        return "DescriptionValue";
      }
      return oTextAnnotation ? "DescriptionValue" : "Value";
    },
    buildExpressionForTextValue: function (sPropertyPath, oDataField) {
      var oMetaModel = oDataField.context.getModel();
      var sPath = oDataField.context.getPath();
      var oTextAnnotationContext = oMetaModel.createBindingContext("".concat(sPath, "@com.sap.vocabularies.Common.v1.Text"));
      var oTextAnnotation = oTextAnnotationContext.getProperty();
      var sTextExpression = oTextAnnotation ? AnnotationHelper.value(oTextAnnotation, {
        context: oTextAnnotationContext
      }) : undefined;
      var sExpression = "";
      sPropertyPath = AnnotationHelper.getNavigationPath(sPropertyPath);
      if (sPropertyPath.indexOf("/") > -1 && sTextExpression) {
        sExpression = sPropertyPath.replace(/[^\/]*$/, sTextExpression.substr(1, sTextExpression.length - 2));
      } else {
        sExpression = sTextExpression;
      }
      if (sExpression) {
        sExpression = "{ path : '" + sExpression.replace(/^\{+/g, "").replace(/\}+$/g, "") + "', parameters: {'$$noPatch': true}}";
      }
      return sExpression;
    },
    buildTargetPathFromDataModelObjectPath: function (oDataModelObjectPath) {
      var sSartEntitySet = oDataModelObjectPath.startingEntitySet.name;
      var sPath = "/".concat(sSartEntitySet);
      var aNavigationProperties = oDataModelObjectPath.navigationProperties;
      for (var i = 0; i < aNavigationProperties.length; i++) {
        sPath += "/".concat(aNavigationProperties[i].name);
      }
      return sPath;
    },
    hasSemanticObjectTargets: function (oPropertyDataModelObjectPath) {
      var _oPropertyDefinition$, _oPropertyDefinition$2, _oPropertyDefinition$3, _oPropertyDefinition$4, _sSemanticObject$valu;
      var oPropertyDefinition = isProperty(oPropertyDataModelObjectPath.targetObject) ? oPropertyDataModelObjectPath.targetObject : oPropertyDataModelObjectPath.targetObject.$target;
      var sSemanticObject = (_oPropertyDefinition$ = oPropertyDefinition.annotations) === null || _oPropertyDefinition$ === void 0 ? void 0 : (_oPropertyDefinition$2 = _oPropertyDefinition$.Common) === null || _oPropertyDefinition$2 === void 0 ? void 0 : _oPropertyDefinition$2.SemanticObject;
      var aSemanticObjectUnavailableActions = (_oPropertyDefinition$3 = oPropertyDefinition.annotations) === null || _oPropertyDefinition$3 === void 0 ? void 0 : (_oPropertyDefinition$4 = _oPropertyDefinition$3.Common) === null || _oPropertyDefinition$4 === void 0 ? void 0 : _oPropertyDefinition$4.SemanticObjectUnavailableActions;
      var sPropertyLocationPath = FieldHelper.buildTargetPathFromDataModelObjectPath(oPropertyDataModelObjectPath);
      var sPropertyPath = "".concat(sPropertyLocationPath, "/").concat(oPropertyDefinition.name);
      var sBindingExpression;
      if (sSemanticObject !== null && sSemanticObject !== void 0 && sSemanticObject.path) {
        sBindingExpression = compileExpression(pathInModel(sSemanticObject.path));
      }
      if (sPropertyPath && (sBindingExpression || (sSemanticObject === null || sSemanticObject === void 0 ? void 0 : (_sSemanticObject$valu = sSemanticObject.valueOf()) === null || _sSemanticObject$valu === void 0 ? void 0 : _sSemanticObject$valu.length) > 0)) {
        var sAlternatePath = sPropertyPath.replace(/\//g, "_"); //replaceAll("/","_");
        if (!sBindingExpression) {
          var sBindingPath = "pageInternal>semanticsTargets/" + (sSemanticObject === null || sSemanticObject === void 0 ? void 0 : sSemanticObject.valueOf()) + "/" + sAlternatePath + (!aSemanticObjectUnavailableActions ? "/HasTargetsNotFiltered" : "/HasTargets");
          return "{parts:[{path:'" + sBindingPath + "'}], formatter:'FieldRuntime.hasTargets'}";
        } else {
          // Semantic Object Name is a path we return undefined
          // this will be updated later via modelContextChange
          return undefined;
        }
      } else {
        return false;
      }
    },
    getStateDependingOnSemanticObjectTargets: function (oPropertyDataModelObjectPath) {
      var _oPropertyDefinition$5, _oPropertyDefinition$6, _oPropertyDefinition$7, _oPropertyDefinition$8, _sSemanticObject$valu2;
      var oPropertyDefinition = isProperty(oPropertyDataModelObjectPath.targetObject) ? oPropertyDataModelObjectPath.targetObject : oPropertyDataModelObjectPath.targetObject.$target;
      var sSemanticObject = (_oPropertyDefinition$5 = oPropertyDefinition.annotations) === null || _oPropertyDefinition$5 === void 0 ? void 0 : (_oPropertyDefinition$6 = _oPropertyDefinition$5.Common) === null || _oPropertyDefinition$6 === void 0 ? void 0 : _oPropertyDefinition$6.SemanticObject;
      var aSemanticObjectUnavailableActions = (_oPropertyDefinition$7 = oPropertyDefinition.annotations) === null || _oPropertyDefinition$7 === void 0 ? void 0 : (_oPropertyDefinition$8 = _oPropertyDefinition$7.Common) === null || _oPropertyDefinition$8 === void 0 ? void 0 : _oPropertyDefinition$8.SemanticObjectUnavailableActions;
      var sPropertyLocationPath = FieldHelper.buildTargetPathFromDataModelObjectPath(oPropertyDataModelObjectPath);
      var sPropertyPath = "".concat(sPropertyLocationPath, "/").concat(oPropertyDefinition.name);
      var sBindingExpression;
      if (sSemanticObject !== null && sSemanticObject !== void 0 && sSemanticObject.path) {
        sBindingExpression = compileExpression(pathInModel(sSemanticObject.path));
      }
      if (sPropertyPath && (sBindingExpression || (sSemanticObject === null || sSemanticObject === void 0 ? void 0 : (_sSemanticObject$valu2 = sSemanticObject.valueOf()) === null || _sSemanticObject$valu2 === void 0 ? void 0 : _sSemanticObject$valu2.length) > 0)) {
        var sAlternatePath = sPropertyPath.replace(/\//g, "_");
        if (!sBindingExpression) {
          var sBindingPath = "pageInternal>semanticsTargets/".concat(sSemanticObject === null || sSemanticObject === void 0 ? void 0 : sSemanticObject.valueOf(), "/").concat(sAlternatePath).concat(!aSemanticObjectUnavailableActions ? "/HasTargetsNotFiltered" : "/HasTargets");
          return "{parts:[{path:'".concat(sBindingPath, "'}], formatter:'FieldRuntime.getStateDependingOnSemanticObjectTargets'}");
        } else {
          return "Information";
        }
      } else {
        return "None";
      }
    },
    isNotAlwaysHidden: function (oDataField, oDetails) {
      var oContext = oDetails.context;
      var isAlwaysHidden = false;
      if (oDataField.Value && oDataField.Value.$Path) {
        isAlwaysHidden = oContext.getObject("Value/$Path@com.sap.vocabularies.UI.v1.Hidden");
      }
      if (!isAlwaysHidden || isAlwaysHidden.$Path) {
        isAlwaysHidden = oContext.getObject("@com.sap.vocabularies.UI.v1.Hidden");
        if (!isAlwaysHidden || isAlwaysHidden.$Path) {
          isAlwaysHidden = false;
        }
      }
      return !isAlwaysHidden;
    },
    isDraftIndicatorVisibleInFieldGroup: function (column) {
      if (column && column.formatOptions && column.formatOptions.fieldGroupDraftIndicatorPropertyPath && column.formatOptions.fieldGroupName) {
        return "{parts: [" + "{value: '" + column.formatOptions.fieldGroupName + "'}," + "{path: 'internal>semanticKeyHasDraftIndicator'} , " + "{path: 'HasDraftEntity', targetType: 'any'}, " + "{path: 'IsActiveEntity', targetType: 'any'}, " + "{path: 'pageInternal>hideDraftInfo', targetType: 'any'}], " + "formatter: 'sap.fe.macros.field.FieldRuntime.isDraftIndicatorVisible'}";
      } else {
        return false;
      }
    },
    isRequired: function (oFieldControl, sEditMode) {
      if (sEditMode === "Display" || sEditMode === "ReadOnly" || sEditMode === "Disabled") {
        return false;
      }
      if (oFieldControl) {
        if (ManagedObject.bindingParser(oFieldControl)) {
          return "{= %" + oFieldControl + " === 7}";
        } else {
          return oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/Mandatory";
        }
      }
      return false;
    },
    getActionParameterVisibility: function (oParam, oContext) {
      // To use the UI.Hidden annotation for controlling visibility the value needs to be negated
      if (typeof oParam === "object") {
        if (oParam && oParam.$If && oParam.$If.length === 3) {
          // In case the UI.Hidden contains a dynamic expression we do this
          // by just switching the "then" and "else" part of the erpression
          // oParam.$If[0] <== Condition part
          // oParam.$If[1] <== Then part
          // oParam.$If[2] <== Else part
          var oNegParam = {
            $If: []
          };
          oNegParam.$If[0] = oParam.$If[0];
          oNegParam.$If[1] = oParam.$If[2];
          oNegParam.$If[2] = oParam.$If[1];
          return AnnotationHelper.value(oNegParam, oContext);
        } else {
          return "{= !%{" + oParam.$Path + "} }";
        }
      } else if (typeof oParam === "boolean") {
        return AnnotationHelper.value(!oParam, oContext);
      } else {
        return undefined;
      }
    },
    /**
     * Computed annotation that returns vProperty for a string and @sapui.name for an object.
     *
     * @param vProperty The property
     * @param oInterface The interface instance
     * @returns The property name
     */
    propertyName: function (vProperty, oInterface) {
      var sPropertyName;
      if (typeof vProperty === "string") {
        if (oInterface.context.getPath().indexOf("$Path") > -1 || oInterface.context.getPath().indexOf("$PropertyPath") > -1) {
          // We could end up with a pure string property (no $Path), and this is not a real property in that case
          sPropertyName = vProperty;
        }
      } else if (vProperty.$Path || vProperty.$PropertyPath) {
        var sPath = vProperty.$Path ? "/$Path" : "/$PropertyPath";
        var sContextPath = oInterface.context.getPath();
        sPropertyName = oInterface.context.getObject("".concat(sContextPath + sPath, "/$@sapui.name"));
      } else if (vProperty.Value && vProperty.Value.$Path) {
        sPropertyName = vProperty.Value.$Path;
      } else {
        sPropertyName = oInterface.context.getObject("@sapui.name");
      }
      return sPropertyName;
    },
    /**
     * This method getFieldGroupIDs uses a map stored in preprocessing data for the macro Field
     * _generateSideEffectsMap generates this map once during templating for the first macro field
     * and then reuses it. Map exists only during templating.
     * The map is used to set the field group IDs for the macro field.
     * A field group ID has the format -- namespace.of.entityType#Qualifier
     * where 'namespace.of.entityType' is the target entity type of the side effect annotation
     * and 'Qualifier' is the qualififer of the side effect annotation.
     * This information is enough to identify the side effect annotation.
     *
     * @param oContext Context instance
     * @param sPropertyPath Property path
     * @returns A promise which provides a string of field group IDs separated by a comma
     */
    getFieldGroupIds: function (oContext, sPropertyPath) {
      if (!sPropertyPath) {
        return undefined;
      }
      var oInterface = oContext.getInterface(0);
      // generate the mapping for side effects or get the generated map if it is already generated
      return _generateSideEffectsMap(oInterface).then(function (oSideEffects) {
        var oFieldSettings = oInterface.getSetting("sap.fe.macros.internal.Field");
        oFieldSettings.sideEffects = oSideEffects;
        var sOwnerEntityType = oContext.getPath(1).substr(1);
        var aFieldGroupIds = FieldHelper.getSideEffectsOnEntityAndProperty(sPropertyPath, sOwnerEntityType, oSideEffects);
        var sFieldGroupIds;
        if (aFieldGroupIds.length) {
          sFieldGroupIds = aFieldGroupIds.reduce(function (sResult, sId) {
            return sResult && "".concat(sResult, ",").concat(sId) || sId;
          });
        }
        return sFieldGroupIds; //"ID1,ID2,ID3..."
      });
    },

    /**
     * Generate map which has data from source entity as well as source property for a given field.
     *
     * @param sPath
     * @param sOwnerEntityType
     * @param oSideEffects
     * @returns An array of side Effect Ids.
     */
    getSideEffectsOnEntityAndProperty: function (sPath, sOwnerEntityType, oSideEffects) {
      var bIsNavigationPath = sPath.indexOf("/") > 0;
      sPath = bIsNavigationPath ? sPath.substr(sPath.lastIndexOf("/") + 1) : sPath;
      // add to fieldGroupIds, all side effects which mention sPath as source property or sOwnerEntityType as source entity
      return oSideEffects[sOwnerEntityType] && oSideEffects[sOwnerEntityType][0].concat(oSideEffects[sOwnerEntityType][1][sPath] || []) || [];
    },
    fieldControl: function (sPropertyPath, oInterface) {
      var oModel = oInterface && oInterface.context.getModel();
      var sPath = oInterface && oInterface.context.getPath();
      var oFieldControlContext = oModel && oModel.createBindingContext("".concat(sPath, "@com.sap.vocabularies.Common.v1.FieldControl"));
      var oFieldControl = oFieldControlContext && oFieldControlContext.getProperty();
      if (oFieldControl) {
        if (oFieldControl.hasOwnProperty("$EnumMember")) {
          return oFieldControl.$EnumMember;
        } else if (oFieldControl.hasOwnProperty("$Path")) {
          return AnnotationHelper.value(oFieldControl, {
            context: oFieldControlContext
          });
        }
      } else {
        return undefined;
      }
    },
    /**
     * Method to get the navigation entity(the entity where should i look for the available quick view facets)
     *    -Loop over all navigation property
     *    -Look into ReferentialConstraint constraint
     *    -If ReferentialConstraint.Property = property(Semantic Object) ==> success QuickView Facets from this entity type can be retrieved
     *
     * @function
     * @name getNavigationEntity
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param {object} oProperty property object on which semantic object is configured
     * @param {object} oContext Metadata Context(Not passed when called with template:with)
     * @returns {string|undefined} - if called with context then navigation entity relative binding like "{supplier}" is returned
     *    else context path for navigation entity for templating is returned  e.g “/Products/$Type/supplier”
     *  where Products - Parent entity, supplier - Navigation entity name
     */

    getNavigationEntity: function (oProperty, oContext) {
      var oContextObject = oContext && oContext.context || oProperty;
      //Get the entity type path ex. /Products/$Type from /Products/$Type@com.sap.vocabularies.UI.v1.HeaderInfo/Description/Value...
      var sNavigationPart = "";
      var sNavigationPath = "".concat(AnnotationHelper.getNavigationPath(oContextObject.getPath()), "/");
      var sPropertyPath = oContextObject.getObject().$Path;
      var sPropertyName = sPropertyPath.split("/").pop();
      if (sNavigationPath.indexOf(sPropertyPath) > -1) {
        sNavigationPath = sNavigationPath.split(sPropertyPath)[0];
      }
      if (sPropertyPath.indexOf("/") > -1) {
        // Navigation property detected.
        sNavigationPart = "".concat(sPropertyPath.substring(0, sPropertyPath.lastIndexOf("/")), "/");
        sNavigationPath += sNavigationPart;
      }

      //Get the entity type object
      var oEntityType = oContextObject.getObject(sNavigationPath),
        //Get the navigation entity details
        aKeys = Object.keys(oEntityType),
        length = aKeys.length;
      for (var index = 0; index < length; index++) {
        if (oEntityType[aKeys[index]].$kind === "NavigationProperty" && oEntityType[aKeys[index]].$ReferentialConstraint && oEntityType[aKeys[index]].$ReferentialConstraint.hasOwnProperty(sPropertyName)) {
          return oContext ? AnnotationHelper.getNavigationBinding(sNavigationPart + aKeys[index]) : sNavigationPath + aKeys[index];
        }
      }
      if (oEntityType["$Key"].includes(sPropertyName)) {
        //return sNavigationPath + sPropertyName;
        return oContext ? AnnotationHelper.getNavigationBinding(sNavigationPart) : sNavigationPath;
      }
      var oAnnotations = oContextObject.getObject(sNavigationPath + "@");
      for (var singleAnnotation in oAnnotations) {
        if (singleAnnotation.includes("SemanticKey")) {
          if (oAnnotations[singleAnnotation][0].$PropertyPath === sPropertyName) {
            return oContext ? AnnotationHelper.getNavigationBinding(sNavigationPart) : sNavigationPath;
          }
        }
      }
      return undefined;
    },
    /**
     * Method to get the value help property from a DataField or a PropertyPath (in case a SelectionField is used)
     * Priority from where to get the property value of the field (examples are "Name" and "Supplier"):
     * 1. If oPropertyContext.getObject() has key '$Path', then we take the value at '$Path'.
     * 2. Else, value at oPropertyContext.getObject().
     * If there is an ISOCurrency or if there are Unit annotations for the field property,
     * then the Path at the ISOCurrency or Unit annotations of the field property is considered.
     *
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param oPropertyContext The context from which value help property need to be extracted.
     * @param bInFilterField Whether or not we're in the filter field and should ignore
     * @returns The value help property path
     */
    valueHelpProperty: function (oPropertyContext, bInFilterField) {
      /* For currency (and later Unit) we need to forward the value help to the annotated field */
      var sContextPath = oPropertyContext.getPath();
      var oContent = oPropertyContext.getObject() || {};
      var sPath = oContent.$Path ? "".concat(sContextPath, "/$Path") : sContextPath;
      var sAnnoPath = "".concat(sPath, "@");
      var oPropertyAnnotations = oPropertyContext.getObject(sAnnoPath);
      var sAnnotation;
      if (oPropertyAnnotations) {
        sAnnotation = oPropertyAnnotations.hasOwnProperty(ISOCurrency) && ISOCurrency || oPropertyAnnotations.hasOwnProperty(Unit) && Unit;
        if (sAnnotation && !bInFilterField) {
          var sUnitOrCurrencyPath = "".concat(sPath + sAnnotation, "/$Path");
          // we check that the currency or unit is a Property and not a fixed value
          if (oPropertyContext.getObject(sUnitOrCurrencyPath)) {
            sPath = sUnitOrCurrencyPath;
          }
        }
      }
      return sPath;
    },
    /**
     * Dedicated method to avoid looking for unit properties.
     *
     * @param oPropertyContext
     * @returns The value help property path
     */
    valueHelpPropertyForFilterField: function (oPropertyContext) {
      return FieldHelper.valueHelpProperty(oPropertyContext, true);
    },
    /**
     * Method to generate the ID for Value Help.
     *
     * @function
     * @name getIDForFieldValueHelp
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param sFlexId Flex ID of the current object
     * @param sIdPrefix Prefix for the ValueHelp ID
     * @param sOriginalPropertyName Name of the property
     * @param sPropertyName Name of the ValueHelp Property
     * @returns The ID generated for the ValueHelp
     */
    getIDForFieldValueHelp: function (sFlexId, sIdPrefix, sOriginalPropertyName, sPropertyName) {
      if (sFlexId) {
        return sFlexId;
      }
      var sProperty = sPropertyName;
      if (sOriginalPropertyName !== sPropertyName) {
        sProperty = "".concat(sOriginalPropertyName, "::").concat(sPropertyName);
      }
      return generate([sIdPrefix, sProperty]);
    },
    /**
     * Method to get the fieldHelp property of the FilterField.
     *
     * @function
     * @name getFieldHelpPropertyForFilterField
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param iContext The interface instance of the context
     * @param oProperty The object of the FieldHelp property
     * @param sPropertyType The $Type of the property
     * @param sVhIdPrefix The ID prefix of the value help
     * @param sPropertyName The name of the property
     * @param sValueHelpPropertyName The property name of the value help
     * @param bHasValueListWithFixedValues `true` if there is a value list with a fixed value annotation
     * @param bUseSemanticDateRange `true` if the semantic date range is set to 'true' in the manifest
     * @returns The field help property of the value help
     */
    getFieldHelpPropertyForFilterField: function (iContext, oProperty, sPropertyType, sVhIdPrefix, sPropertyName, sValueHelpPropertyName, bHasValueListWithFixedValues, bUseSemanticDateRange) {
      var oContext = iContext.getInterface(0).getModel(1).createBindingContext(iContext.getInterface(0).getPath(1));
      var sProperty = FieldHelper.propertyName(oProperty, {
          context: oContext
        }),
        bSemanticDateRange = bUseSemanticDateRange === "true" || bUseSemanticDateRange === true;
      var oModel = oContext.getModel(),
        sPropertyPath = oContext.getPath(),
        sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
        oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sPropertyLocationPath, oContext);
      if ((sPropertyType === "Edm.DateTimeOffset" || sPropertyType === "Edm.Date") && bSemanticDateRange && oFilterRestrictions && oFilterRestrictions.FilterAllowedExpressions && oFilterRestrictions.FilterAllowedExpressions[sProperty] && (oFilterRestrictions.FilterAllowedExpressions[sProperty].indexOf("SingleRange") !== -1 || oFilterRestrictions.FilterAllowedExpressions[sProperty].indexOf("SingleValue") !== -1) || sPropertyType === "Edm.Boolean" && !bHasValueListWithFixedValues) {
        return undefined;
      }
      return FieldHelper.getIDForFieldValueHelp(null, sVhIdPrefix || "FilterFieldValueHelp", sPropertyName, sValueHelpPropertyName);
    },
    /**
     * Method to get semantic key title
     *
     * @function
     * @name getSemanticKeyTitle
     * @memberof sap.fe.macros.field.FieldHelper.js
     * @param {string} sPropertyTextValue String containing the binding of text associated to the property
     * @param {string} sPropertyValue String containing the binding of a property
     * @param {string} sDataField String containing the name of a data field
     * @param {object} oTextArrangement Object containing the text arrangement
     * @param {string} sSemanticKeyStyle enum containing the style of the semantic key
     * @param {object} oDraftRoot Draft root object
     * @returns {string} - Binding that resolves to the title of the semantic key
     */

    getSemanticKeyTitle: function (sPropertyTextValue, sPropertyValue, sDataField, oTextArrangement, sSemanticKeyStyle, oDraftRoot) {
      var sNewObject = ResourceModel.getText("T_NEW_OBJECT");
      var sUnnamedObject = ResourceModel.getText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO");
      var sNewObjectExpression, sUnnnamedObjectExpression;
      var sSemanticKeyTitleExpression;
      var addNewObjectUnNamedObjectExpression = function (sValue) {
        sNewObjectExpression = "($" + sValue + " === '' || $" + sValue + " === undefined || $" + sValue + " === null ? '" + sNewObject + "': $" + sValue + ")";
        sUnnnamedObjectExpression = "($" + sValue + " === '' || $" + sValue + " === undefined || $" + sValue + " === null ? '" + sUnnamedObject + "': $" + sValue + ")";
        return "(!%{IsActiveEntity} ? !%{HasActiveEntity} ? " + sNewObjectExpression + " : " + sUnnnamedObjectExpression + " : " + sUnnnamedObjectExpression + ")";
      };
      var buildExpressionForSemantickKeyTitle = function (sValue, bIsExpressionBinding) {
        var sExpression;
        if (oDraftRoot) {
          //check if it is draft root so that we can add NewObject and UnnamedObject feature
          sExpression = addNewObjectUnNamedObjectExpression(sValue);
          return bIsExpressionBinding ? "{= " + sExpression + "}" : sExpression;
        } else {
          return bIsExpressionBinding ? sValue : "$" + sValue;
        }
      };
      if (sPropertyTextValue) {
        // check for text association
        if (oTextArrangement && sSemanticKeyStyle !== "ObjectIdentifier") {
          // check if text arrangement is present and table type is GridTable
          var sTextArrangement = oTextArrangement.$EnumMember;
          if (sTextArrangement === "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst") {
            // Eg: English (EN)
            sSemanticKeyTitleExpression = buildExpressionForSemantickKeyTitle(sPropertyTextValue, false);
            return "{= " + sSemanticKeyTitleExpression + " +' (' + " + "($" + sPropertyValue + (sDataField ? " || ${" + sDataField + "}" : "") + ") +')' }";
          } else if (sTextArrangement === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
            // Eg: EN (English)
            sSemanticKeyTitleExpression = buildExpressionForSemantickKeyTitle(sPropertyTextValue, false);
            return "{= ($" + sPropertyValue + (sDataField ? " || ${" + sDataField + "}" : "") + ")" + " + ' (' + " + sSemanticKeyTitleExpression + " +')' }";
          } else {
            // for a Grid table when text is available and text arrangement is TextOnly or TextSeperate or no text arrangement then we return Text
            return buildExpressionForSemantickKeyTitle(sPropertyTextValue, true);
          }
        } else {
          return buildExpressionForSemantickKeyTitle(sPropertyTextValue, true);
        }
      } else {
        // if there is no text association then we return the property value
        return buildExpressionForSemantickKeyTitle(sPropertyValue, true);
      }
    },
    getObjectIdentifierText: function (oTextAnnotation, oTextArrangementAnnotation, sPropertyValueBinding, sDataFieldName) {
      if (oTextAnnotation) {
        // There is a text annotation. In this case, the ObjectIdentifier shows:
        //  - the *text* as the ObjectIdentifier's title
        //  - the *value* as the ObjectIdentifier's text
        //
        // So if the TextArrangement is #TextOnly or #TextSeparate, do not set the ObjectIdentifier's text
        // property
        if (oTextArrangementAnnotation && (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" || oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate" || oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst")) {
          return undefined;
        } else {
          return sPropertyValueBinding || "{".concat(sDataFieldName, "}");
        }
      }

      // no text annotation: the property value is part of the ObjectIdentifier's title already
      return undefined;
    },
    getSemanticObjectsList: function (propertyAnnotations) {
      // look for annotations SemanticObject with and without qualifier
      // returns : list of SemanticObjects
      var annotations = propertyAnnotations;
      var aSemanticObjects = [];
      for (var key in annotations.getObject()) {
        // var qualifier;
        if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject") > -1 && key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectMapping") === -1 && key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions") === -1) {
          var semanticObjectValue = annotations.getObject()[key];
          if (typeof semanticObjectValue === "object") {
            semanticObjectValue = AnnotationHelper.value(semanticObjectValue, {
              context: propertyAnnotations
            });
          }
          if (aSemanticObjects.indexOf(semanticObjectValue) === -1) {
            aSemanticObjects.push(semanticObjectValue);
          }
        }
      }
      var oSemanticObjectsModel = new JSONModel(aSemanticObjects);
      oSemanticObjectsModel.$$valueAsPromise = true;
      return oSemanticObjectsModel.createBindingContext("/");
    },
    getSemanticObjectsQualifiers: function (propertyAnnotations) {
      // look for annotations SemanticObject, SemanticObjectUnavailableActions, SemanticObjectMapping
      // returns : list of qualifiers (array of objects with qualifiers : {qualifier, SemanticObject, SemanticObjectUnavailableActions, SemanticObjectMapping for this qualifier}
      var annotations = propertyAnnotations;
      var qualifiersAnnotations = [];
      var findObject = function (qualifier) {
        return qualifiersAnnotations.find(function (object) {
          return object.qualifier === qualifier;
        });
      };
      for (var key in annotations.getObject()) {
        // var qualifier;
        if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject#") > -1 || key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectMapping#") > -1 || key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions#") > -1) {
          var annotationContent = annotations.getObject()[key],
            annotation = key.split("#")[0],
            qualifier = key.split("#")[1];
          var qualifierObject = findObject(qualifier);
          if (!qualifierObject) {
            qualifierObject = {
              qualifier: qualifier
            };
            qualifierObject[annotation] = annotationContent;
            qualifiersAnnotations.push(qualifierObject);
          } else {
            qualifierObject[annotation] = annotationContent;
          }
        }
      }
      qualifiersAnnotations = qualifiersAnnotations.filter(function (oQualifier) {
        return !!oQualifier["@com.sap.vocabularies.Common.v1.SemanticObject"];
      });
      var oQualifiersModel = new JSONModel(qualifiersAnnotations);
      oQualifiersModel.$$valueAsPromise = true;
      return oQualifiersModel.createBindingContext("/");
    },
    // returns array of semanticObjects including main and additional, with their mapping and unavailable Actions
    getSemanticObjectsWithAnnotations: function (propertyAnnotations) {
      // look for annotations SemanticObject, SemanticObjectUnavailableActions, SemanticObjectMapping
      var annotationContent;
      var listItem;
      // returns : list of qualifiers (array of objects with qualifiers : {qualifier, SemanticObject, SemanticObjectUnavailableActions, SemanticObjectMapping for this qualifier}
      var annotations = propertyAnnotations;
      var semanticObjectList = [];
      var findObject = function (qualifier) {
        return semanticObjectList.find(function (object) {
          return object.qualifier === qualifier;
        });
      };
      for (var key in annotations.getObject()) {
        // var qualifier;
        if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject") > -1 || key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectMapping") > -1 || key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions") > -1) {
          if (key.indexOf("#") > -1) {
            annotationContent = annotations.getObject()[key];
            var annotation = key.split("#")[0],
              qualifier = key.split("#")[1];
            listItem = findObject(qualifier);
            if (key === "@com.sap.vocabularies.Common.v1.SemanticObject" && typeof annotationContent === "object") {
              annotationContent = AnnotationHelper.value(annotationContent[0], {
                context: propertyAnnotations
              });
            }
            if (!listItem) {
              listItem = {
                qualifier: qualifier
              };
              listItem[annotation] = annotationContent;
              semanticObjectList.push(listItem);
            } else {
              listItem[annotation] = annotationContent;
            }
          } else {
            annotationContent = annotations.getObject()[key];
            var _annotation = void 0;
            if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectMapping") > -1) {
              _annotation = "@com.sap.vocabularies.Common.v1.SemanticObjectMapping";
            } else if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions") > -1) {
              _annotation = "@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions";
            } else if (key.indexOf("com.sap.vocabularies.Common.v1.SemanticObject") > -1) {
              _annotation = "@com.sap.vocabularies.Common.v1.SemanticObject";
            }
            listItem = findObject("main");
            if (key === "@com.sap.vocabularies.Common.v1.SemanticObject" && typeof annotationContent === "object") {
              annotationContent = AnnotationHelper.value(annotationContent, {
                context: propertyAnnotations
              });
            }
            if (!listItem) {
              listItem = {
                qualifier: "main"
              };
              listItem[_annotation] = annotationContent;
              semanticObjectList.push(listItem);
            } else {
              listItem[_annotation] = annotationContent;
            }
          }
        }
      }
      // filter if no semanticObject was defined
      semanticObjectList = semanticObjectList.filter(function (oQualifier) {
        return !!oQualifier["@com.sap.vocabularies.Common.v1.SemanticObject"];
      });
      var oSemanticObjectsModel = new JSONModel(semanticObjectList);
      oSemanticObjectsModel.$$valueAsPromise = true;
      return oSemanticObjectsModel.createBindingContext("/");
    },
    computeSemanticLinkModelContextChange: function (aSemanticObjects, oDataModelObjectPath) {
      if (FieldHelper.hasSemanticObjectsWithPath(aSemanticObjects)) {
        var sPathToProperty = FieldHelper.buildTargetPathFromDataModelObjectPath(oDataModelObjectPath);
        return "FieldRuntime.LinkModelContextChange($event, '".concat(oDataModelObjectPath.targetObject.name, "', '").concat(sPathToProperty, "')");
      } else {
        return undefined;
      }
    },
    hasSemanticObjectsWithPath: function (aSemanticObjects) {
      var bSemanticObjectHasAPath = false;
      if (aSemanticObjects && aSemanticObjects.length) {
        for (var i = 0; i < aSemanticObjects.length; i++) {
          if (aSemanticObjects[i] && aSemanticObjects[i].value && aSemanticObjects[i].value.indexOf("{") === 0) {
            bSemanticObjectHasAPath = true;
            break;
          }
        }
      }
      return bSemanticObjectHasAPath;
    },
    isSemanticKeyHasFieldGroupColumn: function (isFieldGroupColumn) {
      return isFieldGroupColumn;
    },
    _checkCustomSemanticObjectHasAnnotations: function (_semanticObjectsWithAnnotations) {
      if (_semanticObjectsWithAnnotations && _semanticObjectsWithAnnotations.length == 0) {
        _semanticObjectsWithAnnotations = undefined;
      }
      return _semanticObjectsWithAnnotations;
    },
    _manageCustomSemanticObjects: function (customSemanticObject, semanticObjectsList, semanticObjectsWithAnnotations) {
      if (customSemanticObject) {
        // the custom semantic objects are either a single string/key to custom data or a stringified array
        if (!(customSemanticObject[0] === "[")) {
          // customSemanticObject = "semanticObject" | "{pathInModel}"
          if (semanticObjectsList && semanticObjectsList.indexOf(customSemanticObject) === -1) {
            semanticObjectsList.push(customSemanticObject);
          }
        } else {
          // customSemanticObject = '["semanticObject1","semanticObject2"]'
          JSON.parse(customSemanticObject).forEach(function (semanticObject) {
            if (semanticObjectsList && semanticObjectsList.indexOf(semanticObject) === -1) {
              semanticObjectsList.push(semanticObject);
            }
          });
        }
        semanticObjectsWithAnnotations = this._checkCustomSemanticObjectHasAnnotations(semanticObjectsWithAnnotations);
      }
      return {
        semanticObjectsList: semanticObjectsList,
        semanticObjectsWithAnnotations: semanticObjectsWithAnnotations
      };
    },
    // returns the list of parameters to pass to the Link delegates
    computeLinkParameters: function (delegateName, entityType, semanticObjectsList, semanticObjectsWithAnnotations, dataField, contact, mainSemanticObject, navigationPath, propertyPathLabel, customSemanticObject, hasQuickViewFacets) {
      var _CustomSemanticObjectsFound = this._manageCustomSemanticObjects(customSemanticObject, semanticObjectsList, semanticObjectsWithAnnotations);
      semanticObjectsList = _CustomSemanticObjectsFound.semanticObjectsList;
      semanticObjectsWithAnnotations = _CustomSemanticObjectsFound.semanticObjectsWithAnnotations;
      return Promise.resolve().then(function () {
        var _semanticObjectsWithA;
        var semanticObjectMappings = [],
          semanticObjectUnavailableActions = [];
        var aResolvedMainSemanticObject = (_semanticObjectsWithA = semanticObjectsWithAnnotations) === null || _semanticObjectsWithA === void 0 ? void 0 : _semanticObjectsWithA.filter(function (annotation) {
          return annotation.qualifier === "main";
        });
        var sResolveMainSemanticObject = aResolvedMainSemanticObject && aResolvedMainSemanticObject[0] ? aResolvedMainSemanticObject[0]["@com.sap.vocabularies.Common.v1.SemanticObject"] : undefined;
        if (semanticObjectsWithAnnotations) {
          semanticObjectsWithAnnotations.forEach(function (semObject) {
            var annotationContent = semObject["@com.sap.vocabularies.Common.v1.SemanticObject"];
            if (typeof annotationContent === "object") {
              annotationContent = compileExpression(pathInModel(annotationContent.$Path));
            }
            if (semObject["@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"]) {
              var unAvailableAction = {
                semanticObject: annotationContent,
                actions: semObject["@com.sap.vocabularies.Common.v1.SemanticObjectUnavailableActions"]
              };
              semanticObjectUnavailableActions.push(unAvailableAction);
            }
            if (semObject["@com.sap.vocabularies.Common.v1.SemanticObjectMapping"]) {
              var items = [];
              semObject["@com.sap.vocabularies.Common.v1.SemanticObjectMapping"].forEach(function (mappingItem) {
                items.push({
                  key: mappingItem.LocalProperty.$PropertyPath,
                  value: mappingItem.SemanticObjectProperty
                });
              });
              var mapping = {
                semanticObject: annotationContent,
                items: items
              };
              semanticObjectMappings.push(mapping);
            }
          });
          return JSON.stringify({
            name: delegateName,
            payload: {
              semanticObjects: semanticObjectsList,
              entityType: entityType,
              semanticObjectUnavailableActions: semanticObjectUnavailableActions,
              semanticObjectMappings: semanticObjectMappings,
              semanticPrimaryActions: [],
              mainSemanticObject: sResolveMainSemanticObject,
              propertyPathLabel: propertyPathLabel,
              dataField: dataField,
              contact: contact,
              navigationPath: navigationPath,
              hasQuickViewFacets: hasQuickViewFacets !== null ? hasQuickViewFacets : false
            }
          });
        } else {
          return JSON.stringify({
            name: delegateName,
            payload: {
              semanticObjects: semanticObjectsList,
              entityType: entityType,
              semanticObjectUnavailableActions: semanticObjectUnavailableActions,
              semanticObjectMappings: semanticObjectMappings,
              semanticPrimaryActions: [],
              mainSemanticObject: sResolveMainSemanticObject,
              propertyPathLabel: propertyPathLabel,
              dataField: dataField,
              contact: contact,
              navigationPath: navigationPath,
              hasQuickViewFacets: hasQuickViewFacets !== null ? hasQuickViewFacets : false
            }
          });
        }
      });
    },
    /*
     * Method to compute the delegate with payload
     * @function
     * @param {object} delegateName - name of the delegate methode
     * @param {boolean} retrieveTextFromValueList - added to the payload of the delegate methode
     * @return {object} - returns the delegate with payload
     */
    computeFieldBaseDelegate: function (delegateName, retrieveTextFromValueList) {
      if (retrieveTextFromValueList) {
        return JSON.stringify({
          name: delegateName,
          payload: {
            retrieveTextFromValueList: retrieveTextFromValueList
          }
        });
      }
      return "{name: '".concat(delegateName, "'}");
    },
    _getPrimaryIntents: function (aSemanticObjectsList) {
      var aPromises = [];
      if (aSemanticObjectsList) {
        var oUshellContainer = sap.ushell && sap.ushell.Container;
        var oService = oUshellContainer && oUshellContainer.getService("CrossApplicationNavigation");
        aSemanticObjectsList.forEach(function (semObject) {
          if (typeof semObject === "string") {
            aPromises.push(oService.getPrimaryIntent(semObject, {}));
          }
        });
      }
      return Promise.all(aPromises).then(function (aSemObjectPrimaryAction) {
        return aSemObjectPrimaryAction;
      }).catch(function (oError) {
        Log.error("Error fetching primary intents", oError);
        return [];
      });
    },
    _SemanticObjectsHasPrimaryAction: function (oSemantics, aSemanticObjectsPrimaryActions) {
      var _fnIsSemanticObjectActionUnavailable = function (_oSemantics, _oPrimaryAction, _index) {
        for (var unavailableActionsIndex in _oSemantics.semanticObjectUnavailableActions[_index].actions) {
          if (_oPrimaryAction.intent.split("-")[1].indexOf(_oSemantics.semanticObjectUnavailableActions[_index].actions[unavailableActionsIndex]) === 0) {
            return false;
          }
        }
        return true;
      };
      oSemantics.semanticPrimaryActions = aSemanticObjectsPrimaryActions;
      var oPrimaryAction = oSemantics.semanticObjects && oSemantics.mainSemanticObject && oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)];
      var sCurrentHash = CommonUtils.getHash();
      if (oSemantics.mainSemanticObject && oPrimaryAction !== null && oPrimaryAction.intent !== sCurrentHash) {
        for (var index in oSemantics.semanticObjectUnavailableActions) {
          if (oSemantics.mainSemanticObject.indexOf(oSemantics.semanticObjectUnavailableActions[index].semanticObject) === 0) {
            return _fnIsSemanticObjectActionUnavailable(oSemantics, oPrimaryAction, index);
          }
        }
        return true;
      } else {
        return false;
      }
    },
    checkPrimaryActions: function (oSemantics, bGetTitleLink) {
      var _this = this;
      return this._getPrimaryIntents(oSemantics && oSemantics.semanticObjects).then(function (aSemanticObjectsPrimaryActions) {
        return bGetTitleLink ? {
          titleLink: aSemanticObjectsPrimaryActions,
          hasTitleLink: _this._SemanticObjectsHasPrimaryAction(oSemantics, aSemanticObjectsPrimaryActions)
        } : _this._SemanticObjectsHasPrimaryAction(oSemantics, aSemanticObjectsPrimaryActions);
      }).catch(function (oError) {
        Log.error("Error in checkPrimaryActions", oError);
      });
    },
    _getTitleLinkWithParameters: function (_oSemanticObjectModel, _linkIntent) {
      if (_oSemanticObjectModel && _oSemanticObjectModel.titlelink) {
        return _oSemanticObjectModel.titlelink;
      } else {
        return _linkIntent;
      }
    },
    getPrimaryAction: function (oSemantics) {
      return oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)].intent ? FieldHelper._getTitleLinkWithParameters(oSemantics, oSemantics.semanticPrimaryActions[oSemantics.semanticObjects.indexOf(oSemantics.mainSemanticObject)].intent) : oSemantics.primaryIntentAction;
    },
    /**
     * Method to fetch the filter restrictions. Filter restrictions can be annotated on an entity set or a navigation property.
     * Depending on the path to which the control is bound, we check for filter restrictions on the context path of the control,
     * or on the navigation property (if there is a navigation).
     * Eg. If the table is bound to '/EntitySet', for property path '/EntitySet/_Association/PropertyName', the filter restrictions
     * on '/EntitySet' win over filter restrictions on '/EntitySet/_Association'.
     * If the table is bound to '/EntitySet/_Association', the filter restrictions on '/EntitySet/_Association' win over filter
     * retrictions on '/AssociationEntitySet'.
     *
     * @param iContext Context used during templating
     * @param oProperty Property object in the metadata
     * @param bUseSemanticDateRange Boolean Suggests if semantic date range should be used
     * @param sSettings Stringified object of the property settings
     * @param contextPath Path to which the parent control (the table or the filter bar) is bound
     * @returns String containing comma-separated list of operators for filtering
     */
    operators: function (iContext, oProperty, bUseSemanticDateRange, sSettings, contextPath) {
      if (!oProperty || !contextPath) {
        return undefined;
      }
      var operators;
      var oContext = iContext.getInterface(0).getModel(1).createBindingContext(iContext.getInterface(0).getPath(1));
      var sProperty = FieldHelper.propertyName(oProperty, {
        context: oContext
      });
      var oModel = oContext.getModel(),
        sPropertyPath = oContext.getPath(),
        sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
        propertyType = oProperty.$Type;
      if (propertyType === "Edm.Guid") {
        return CommonUtils.getOperatorsForGuidProperty();
      }

      // remove '/'
      contextPath = contextPath.slice(0, -1);
      var isTableBoundToNavigation = contextPath.lastIndexOf("/") > 0;
      var isNavigationPath = isTableBoundToNavigation && contextPath !== sPropertyLocationPath || !isTableBoundToNavigation && sPropertyLocationPath.lastIndexOf("/") > 0;
      var navigationPath = isNavigationPath && sPropertyLocationPath.substr(sPropertyLocationPath.indexOf(contextPath) + contextPath.length + 1) || "";
      var propertyPath = isNavigationPath && navigationPath + "/" + sProperty || sProperty;
      if (!isTableBoundToNavigation) {
        if (!isNavigationPath) {
          // /SalesOrderManage/ID
          operators = CommonUtils.getOperatorsForProperty(sProperty, sPropertyLocationPath, oContext, propertyType, bUseSemanticDateRange, sSettings);
        } else {
          // /SalesOrderManange/_Item/Material
          //let operators
          operators = CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oContext, propertyType, bUseSemanticDateRange, sSettings) || CommonUtils.getOperatorsForProperty(sProperty, sPropertyLocationPath, oContext, propertyType, bUseSemanticDateRange, sSettings);
        }
      } else if (!isNavigationPath) {
        // /SalesOrderManage/_Item/Material
        operators = CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oContext, propertyType, bUseSemanticDateRange, sSettings) || CommonUtils.getOperatorsForProperty(sProperty, ModelHelper.getEntitySetPath(contextPath), oContext, propertyType, bUseSemanticDateRange, sSettings);
        return operators;
      } else {
        // /SalesOrderManage/_Item/_Association/PropertyName
        // This is currently not supported for tables
        operators = CommonUtils.getOperatorsForProperty(propertyPath, contextPath, oContext, propertyType, bUseSemanticDateRange, sSettings) || CommonUtils.getOperatorsForProperty(propertyPath, ModelHelper.getEntitySetPath(contextPath), oContext, propertyType, bUseSemanticDateRange, sSettings);
      }
      if (!operators && (propertyType === "Edm.Date" || propertyType === "Edm.DateTimeOffset")) {
        operators = CommonUtils.getOperatorsForDateProperty(propertyType);
      }
      return operators;
    },
    /**
     * Return the property context for usage in QuickViewForm.
     *
     * @param oDataFieldContext Context of the data field or associated property
     * @returns Binding context
     */
    getPropertyContextForQuickViewForm: function (oDataFieldContext) {
      if (oDataFieldContext.getObject("Value") !== undefined) {
        // Create a binding context to the property from the data field.
        var oInterface = oDataFieldContext.getInterface(),
          oModel = oInterface.getModel();
        var sPath = oInterface.getPath();
        sPath = sPath + (sPath.endsWith("/") ? "Value" : "/Value");
        return oModel.createBindingContext(sPath);
      } else {
        // It is a property. Just return the context as it is.
        return oDataFieldContext;
      }
    },
    /**
     * Return the binding context corresponding to the property path.
     *
     * @param oPropertyContext Context of the property
     * @returns Binding context
     */
    getPropertyPathForQuickViewForm: function (oPropertyContext) {
      if (oPropertyContext && oPropertyContext.getObject("$Path")) {
        var oInterface = oPropertyContext.getInterface(),
          oModel = oInterface.getModel();
        var sPath = oInterface.getPath();
        sPath = sPath + (sPath.endsWith("/") ? "$Path" : "/$Path");
        return oModel.createBindingContext(sPath);
      }
      return oPropertyContext;
    },
    /**
     * Return the path of the DaFieldDefault (if any). Otherwise, the DataField path is returned.
     *
     * @param oDataFieldContext Context of the DataField
     * @returns Object path
     */
    getDataFieldDefault: function (oDataFieldContext) {
      var oDataFieldDefault = oDataFieldContext.getModel().getObject("".concat(oDataFieldContext.getPath(), "@com.sap.vocabularies.UI.v1.DataFieldDefault"));
      return oDataFieldDefault ? "".concat(oDataFieldContext.getPath(), "@com.sap.vocabularies.UI.v1.DataFieldDefault") : oDataFieldContext.getPath();
    },
    /*
     * Method to get visible expression for DataFieldActionButton
     * @function
     * @name isDataFieldActionButtonVisible
     * @param {object} oThis - Current Object
     * @param {object} oDataField - DataPoint's Value
     * @param {boolean} bIsBound - DataPoint action bound
     * @param {object} oActionContext - ActionContext Value
     * @return {boolean} - returns boolean
     */
    isDataFieldActionButtonVisible: function (oThis, oDataField, bIsBound, oActionContext) {
      return oDataField["@com.sap.vocabularies.UI.v1.Hidden"] !== true && (bIsBound !== true || oActionContext !== false);
    },
    /**
     * Method to get press event for DataFieldActionButton.
     *
     * @function
     * @name getPressEventForDataFieldActionButton
     * @param oThis Current Object
     * @param oDataField DataPoint's Value
     * @returns The binding expression for the DataFieldActionButton press event
     */
    getPressEventForDataFieldActionButton: function (oThis, oDataField) {
      var _oThis$entitySet;
      var sInvocationGrouping = "Isolated";
      if (oDataField.InvocationGrouping && oDataField.InvocationGrouping.$EnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet") {
        sInvocationGrouping = "ChangeSet";
      }
      var bIsNavigable = oThis.navigateAfterAction;
      bIsNavigable = bIsNavigable === "false" ? false : true;
      var entities = oThis === null || oThis === void 0 ? void 0 : (_oThis$entitySet = oThis.entitySet) === null || _oThis$entitySet === void 0 ? void 0 : _oThis$entitySet.getPath().split("/");
      var entitySetName = entities[entities.length - 1];
      var oParams = {
        contexts: "${$source>/}.getBindingContext()",
        invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGrouping),
        model: "${$source>/}.getModel()",
        label: CommonHelper.addSingleQuotes(oDataField.Label, true),
        isNavigable: bIsNavigable,
        entitySetName: CommonHelper.addSingleQuotes(entitySetName)
      };
      return CommonHelper.generateFunction(".editFlow.invokeAction", CommonHelper.addSingleQuotes(oDataField.Action), CommonHelper.objectToString(oParams));
    },
    isNumericDataType: function (sDataFieldType) {
      var _sDataFieldType = sDataFieldType;
      if (_sDataFieldType !== undefined) {
        var aNumericDataTypes = ["Edm.Int16", "Edm.Int32", "Edm.Int64", "Edm.Byte", "Edm.SByte", "Edm.Single", "Edm.Decimal", "Edm.Double"];
        return aNumericDataTypes.indexOf(_sDataFieldType) === -1 ? false : true;
      } else {
        return false;
      }
    },
    isDateOrTimeDataType: function (sPropertyType) {
      if (sPropertyType !== undefined) {
        var aDateTimeDataTypes = ["Edm.DateTimeOffset", "Edm.DateTime", "Edm.Date", "Edm.TimeOfDay", "Edm.Time"];
        return aDateTimeDataTypes.indexOf(sPropertyType) > -1;
      } else {
        return false;
      }
    },
    isDateTimeDataType: function (sPropertyType) {
      if (sPropertyType !== undefined) {
        var aDateDataTypes = ["Edm.DateTimeOffset", "Edm.DateTime"];
        return aDateDataTypes.indexOf(sPropertyType) > -1;
      } else {
        return false;
      }
    },
    isDateDataType: function (sPropertyType) {
      return sPropertyType === "Edm.Date";
    },
    isTimeDataType: function (sPropertyType) {
      if (sPropertyType !== undefined) {
        var aDateDataTypes = ["Edm.TimeOfDay", "Edm.Time"];
        return aDateDataTypes.indexOf(sPropertyType) > -1;
      } else {
        return false;
      }
    },
    /**
     * Method to return the underlying property data type in case TextArrangement annotation of Text annotation 'TextOnly' exists.
     *
     * @param oAnnotations All the annotations of a property
     * @param oModel An instance of OData v4 model
     * @param sEntityPath The path to root Entity
     * @param sType The property data type
     * @returns The underlying property data type for TextOnly annotated property, otherwise the original data type.
     * @private
     */
    getUnderlyingPropertyDataType: function (oAnnotations, oModel, sEntityPath, sType) {
      var sTextAnnotation = "@com.sap.vocabularies.Common.v1.Text",
        sTextArrangementAnnotation = "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement";
      if (!!oAnnotations && !!oAnnotations[sTextArrangementAnnotation] && oAnnotations[sTextArrangementAnnotation].$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" && !!oAnnotations[sTextAnnotation] && !!oAnnotations[sTextAnnotation].$Path) {
        return oModel.getObject("".concat(sEntityPath, "/").concat(oAnnotations[sTextAnnotation].$Path, "/$Type"));
      }
      return sType;
    },
    getColumnAlignment: function (oDataField, oTable) {
      var sEntityPath = oTable.collection.sPath,
        oModel = oTable.collection.oModel;
      if ((oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") && oDataField.Inline && oDataField.IconUrl) {
        return "Center";
      }
      // Columns containing a Semantic Key must be Begin aligned
      var aSemanticKeys = oModel.getObject("".concat(sEntityPath, "/@com.sap.vocabularies.Common.v1.SemanticKey"));
      if (oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataField") {
        var sPropertyPath = oDataField.Value.$Path;
        var bIsSemanticKey = aSemanticKeys && !aSemanticKeys.every(function (oKey) {
          return oKey.$PropertyPath !== sPropertyPath;
        });
        if (bIsSemanticKey) {
          return "Begin";
        }
      }
      return FieldHelper.getDataFieldAlignment(oDataField, oModel, sEntityPath);
    },
    /**
     * Get alignment based only on the property.
     *
     * @param sType The property's type
     * @param oFormatOptions The field format options
     * @param [oComputedEditMode] The computed Edit mode of the property is empty when directly called from the ColumnProperty fragment
     * @returns The property alignment
     */
    getPropertyAlignment: function (sType, oFormatOptions, oComputedEditMode) {
      var sDefaultAlignment = "Begin";
      var sTextAlignment = oFormatOptions ? oFormatOptions.textAlignMode : "";
      switch (sTextAlignment) {
        case "Form":
          if (this.isNumericDataType(sType)) {
            sDefaultAlignment = "Begin";
            if (oComputedEditMode) {
              sDefaultAlignment = getAlignmentExpression(oComputedEditMode, "Begin", "End");
            }
          }
          break;
        default:
          if (this.isNumericDataType(sType) || this.isDateOrTimeDataType(sType)) {
            sDefaultAlignment = "Right";
          }
          break;
      }
      return sDefaultAlignment;
    },
    getDataFieldAlignment: function (oDataField, oModel, sEntityPath, oFormatOptions, oComputedEditMode) {
      var sDataFieldPath,
        sDefaultAlignment = "Begin",
        sType,
        oAnnotations;
      if (oDataField["$Type"] === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        sDataFieldPath = oDataField.Target.$AnnotationPath;
        if (oDataField.Target["$AnnotationPath"] && oDataField.Target["$AnnotationPath"].indexOf("com.sap.vocabularies.UI.v1.FieldGroup") >= 0) {
          var oFieldGroup = oModel.getObject("".concat(sEntityPath, "/").concat(sDataFieldPath));
          for (var i = 0; i < oFieldGroup.Data.length; i++) {
            sType = oModel.getObject("".concat(sEntityPath, "/").concat(sDataFieldPath, "/Data/").concat(i.toString(), "/Value/$Path/$Type"));
            oAnnotations = oModel.getObject("".concat(sEntityPath, "/").concat(sDataFieldPath, "/Data/").concat(i.toString(), "/Value/$Path@"));
            sType = this.getUnderlyingPropertyDataType(oAnnotations, oModel, sEntityPath, sType);
            sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
            if (sDefaultAlignment === "Begin") {
              break;
            }
          }
          return sDefaultAlignment;
        } else if (oDataField.Target["$AnnotationPath"] && oDataField.Target["$AnnotationPath"].indexOf("com.sap.vocabularies.UI.v1.DataPoint") >= 0 && oModel.getObject("".concat(sEntityPath, "/").concat(sDataFieldPath, "/Visualization/$EnumMember")) === "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
          return sDefaultAlignment;
        } else {
          sType = oModel.getObject("".concat(sEntityPath, "/").concat(sDataFieldPath, "/$Type"));
          if (sType === "com.sap.vocabularies.UI.v1.DataPointType") {
            sType = oModel.getObject("".concat(sEntityPath, "/").concat(sDataFieldPath, "/Value/$Path/$Type"));
            oAnnotations = oModel.getObject("".concat(sEntityPath, "/").concat(sDataFieldPath, "/Value/$Path@"));
            sType = this.getUnderlyingPropertyDataType(oAnnotations, oModel, sEntityPath, sType);
          }
          sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
        }
      } else {
        sDataFieldPath = oDataField.Value.$Path;
        sType = oModel.getObject("".concat(sEntityPath, "/").concat(sDataFieldPath, "/$Type"));
        oAnnotations = oModel.getObject("".concat(sEntityPath, "/").concat(sDataFieldPath, "@"));
        sType = this.getUnderlyingPropertyDataType(oAnnotations, oModel, sEntityPath, sType);
        if (!(oModel.getObject("".concat(sEntityPath, "/"))["$Key"].indexOf(sDataFieldPath) === 0)) {
          sDefaultAlignment = this.getPropertyAlignment(sType, oFormatOptions, oComputedEditMode);
        }
      }
      return sDefaultAlignment;
    },
    getTypeAlignment: function (oContext, oDataField, oFormatOptions, sEntityPath, oComputedEditMode, oProperty) {
      var oInterface = oContext.getInterface(0);
      var oModel = oInterface.getModel();
      if (sEntityPath === "/undefined" && oProperty && oProperty.$target) {
        sEntityPath = "/".concat(oProperty.$target.fullyQualifiedName.split("/")[0]);
      }
      return FieldHelper.getDataFieldAlignment(oDataField, oModel, sEntityPath, oFormatOptions, oComputedEditMode);
    },
    /**
     * Method to get enabled expression for DataFieldActionButton.
     *
     * @function
     * @name isDataFieldActionButtonEnabled
     * @param oDataField DataPoint's Value
     * @param bIsBound DataPoint action bound
     * @param oActionContext ActionContext Value
     * @param sActionContextFormat Formatted value of ActionContext
     * @returns A boolean or string expression for enabled property
     */
    isDataFieldActionButtonEnabled: function (oDataField, bIsBound, oActionContext, sActionContextFormat) {
      if (bIsBound !== true) {
        return "true";
      }
      return (oActionContext === null ? "{= !${#" + oDataField.Action + "} ? false : true }" : oActionContext) ? sActionContextFormat : "true";
    },
    /**
     * Method to get labelText for DataField.
     *
     * @function
     * @name getLabelTextForDataField
     * @param oEntitySetModel The EntitySet model Object
     * @param oPropertyPath The Property path's object
     * @param sPropertyPathBuildExpression The evaluated value of expression @@FIELD.buildExpressionForTextValue
     * @param sPropertyValue Property value from model
     * @param sUiName The sapui.name annotation value
     * @param sSemanticKeyStyle
     * @returns The binding expression for datafield label.
     */
    getLabelTextForDataField: function (oEntitySetModel, oPropertyPath, sPropertyPathBuildExpression, sPropertyValue, sUiName, sSemanticKeyStyle) {
      var oDraftRoot = oEntitySetModel["@com.sap.vocabularies.Common.v1.DraftRoot"];
      return FieldHelper.getSemanticKeyTitle(oPropertyPath["@com.sap.vocabularies.Common.v1.Text"] && sPropertyPathBuildExpression, sPropertyValue, sUiName, oPropertyPath["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"], sSemanticKeyStyle, oDraftRoot);
    },
    /**
     * Method to retrieve text from value list for DataField.
     *
     * @function
     * @name retrieveTextFromValueList
     * @param oEntitySetModel The EntitySet model Object
     * @param sPropertyPath The property path's name
     * @param oFormatOptions The evaluated informations for the format option
     * @returns The binding expression for datafield text.
     */
    retrieveTextFromValueList: function (oEntitySetModel, sPropertyPath, oFormatOptions) {
      var sPropertyFullPath = "".concat(oEntitySetModel.sPath, "/").concat(sPropertyPath);
      var sDisplayFormat = oFormatOptions.displayMode;
      CommonHelper.setMetaModel(oEntitySetModel.getModel());
      return "{= FieldRuntime.retrieveTextFromValueList(%{" + sPropertyPath + "},'" + sPropertyFullPath + "','" + sDisplayFormat + "')}";
    },
    /**
     * Method to compute the label for a DataField.
     * If the DataField's label is an empty string, it's not rendered even if a fallback exists.
     *
     * @function
     * @name computeLabelText
     * @param {object} oDataField The DataField being processed
     * @param {object} oInterface The interface for context instance
     * @returns {string} The computed text for the DataField label.
     */

    computeLabelText: function (oDataField, oInterface) {
      var oModel = oInterface.context.getModel();
      var sContextPath = oInterface.context.getPath();
      if (sContextPath.endsWith("/")) {
        sContextPath = sContextPath.slice(0, sContextPath.lastIndexOf("/"));
      }
      var sDataFieldLabel = oModel.getObject("".concat(sContextPath, "/Label"));
      //We do not show an additional label text for a button:
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
        return undefined;
      }
      if (sDataFieldLabel) {
        return sDataFieldLabel;
      } else if (sDataFieldLabel === "") {
        return "";
      }
      var sDataFieldTargetTitle;
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        if (oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 || oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
          sDataFieldTargetTitle = oModel.getObject("".concat(sContextPath, "/Target/$AnnotationPath@/Title"));
        }
        if (oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.Communication.v1.Contact") > -1) {
          sDataFieldTargetTitle = oModel.getObject("".concat(sContextPath, "/Target/$AnnotationPath@/fn/$Path@com.sap.vocabularies.Common.v1.Label"));
        }
      }
      if (sDataFieldTargetTitle) {
        return sDataFieldTargetTitle;
      }
      var sDataFieldTargetLabel;
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        sDataFieldTargetLabel = oModel.getObject("".concat(sContextPath, "/Target/$AnnotationPath@/Label"));
      }
      if (sDataFieldTargetLabel) {
        return sDataFieldTargetLabel;
      }
      var sDataFieldValueLabel = oModel.getObject("".concat(sContextPath, "/Value/$Path@com.sap.vocabularies.Common.v1.Label"));
      if (sDataFieldValueLabel) {
        return sDataFieldValueLabel;
      }
      var sDataFieldTargetValueLabel;
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        sDataFieldTargetValueLabel = oModel.getObject("".concat(sContextPath, "/Target/$AnnotationPath/Value/$Path@com.sap.vocabularies.Common.v1.Label"));
      }
      if (sDataFieldTargetValueLabel) {
        return sDataFieldTargetValueLabel;
      }
      return "";
    },
    /**
     * Method to align the data fields with their label.
     *
     * @function
     * @name buildExpressionForAlignItems
     * @param sVisualization
     * @returns Expression binding for alignItems property
     */
    buildExpressionForAlignItems: function (sVisualization) {
      var fieldVisualizationBindingExpression = constant(sVisualization);
      var progressVisualizationBindingExpression = constant("com.sap.vocabularies.UI.v1.VisualizationType/Progress");
      var ratingVisualizationBindingExpression = constant("com.sap.vocabularies.UI.v1.VisualizationType/Rating");
      return compileExpression(ifElse(or(equal(fieldVisualizationBindingExpression, progressVisualizationBindingExpression), equal(fieldVisualizationBindingExpression, ratingVisualizationBindingExpression)), constant("Center"), ifElse(UI.IsEditable, constant("Center"), constant("Stretch"))));
    },
    /**
     * Method to check ValueListReferences, ValueListMapping and ValueList inside ActionParameters for FieldHelp.
     *
     * @function
     * @name hasValueHelp
     * @param oPropertyAnnotations Action parameter object
     * @returns `true` if there is a ValueList* annotation defined
     */
    hasValueHelpAnnotation: function (oPropertyAnnotations) {
      if (oPropertyAnnotations) {
        return oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListReferences"] || oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListMapping"] || oPropertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"];
      }
    },
    /**
     * Method to get display property for ActionParameter dialog.
     *
     * 	@function
     * @name getAPDialogDisplayFormat
     * @param oProperty The action parameter instance
     * @param oInterface The interface for the context instance
     * @returns The display format  for an action parameter Field
     */
    getAPDialogDisplayFormat: function (oProperty, oInterface) {
      var oAnnotation;
      var oModel = oInterface.context.getModel();
      var sContextPath = oInterface.context.getPath();
      var sPropertyName = oProperty.$Name || oInterface.context.getProperty("".concat(sContextPath, "@sapui.name"));
      var oActionParameterAnnotations = oModel.getObject("".concat(sContextPath, "@"));
      var oValueHelpAnnotation = oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueList"] || oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueListMapping"] || oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.ValueListReferences"];
      var getValueListPropertyName = function (oValueList) {
        var oValueListParameter = oValueList.Parameters.find(function (oParameter) {
          return oParameter.LocalDataProperty && oParameter.LocalDataProperty.$PropertyPath === sPropertyName;
        });
        return oValueListParameter && oValueListParameter.ValueListProperty;
      };
      var sValueListPropertyName;
      if (oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.TextArrangement"] || oActionParameterAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]) {
        return CommonUtils.computeDisplayMode(oActionParameterAnnotations, undefined);
      } else if (oValueHelpAnnotation) {
        if (oValueHelpAnnotation.CollectionPath) {
          // get the name of the corresponding property in value list collection
          sValueListPropertyName = getValueListPropertyName(oValueHelpAnnotation);
          if (!sValueListPropertyName) {
            return "Value";
          }
          // get text for this property
          oAnnotation = oModel.getObject("/".concat(oValueHelpAnnotation.CollectionPath, "/").concat(sValueListPropertyName, "@"));
          return oAnnotation && oAnnotation["@com.sap.vocabularies.Common.v1.Text"] ? CommonUtils.computeDisplayMode(oAnnotation, undefined) : "Value";
        } else {
          return oModel.requestValueListInfo(sContextPath, true).then(function (oValueListInfo) {
            // get the name of the corresponding property in value list collection
            sValueListPropertyName = getValueListPropertyName(oValueListInfo[""]);
            if (!sValueListPropertyName) {
              return "Value";
            }
            // get text for this property
            oAnnotation = oValueListInfo[""].$model.getMetaModel().getObject("/".concat(oValueListInfo[""]["CollectionPath"], "/").concat(sValueListPropertyName, "@"));
            return oAnnotation && oAnnotation["@com.sap.vocabularies.Common.v1.Text"] ? CommonUtils.computeDisplayMode(oAnnotation, undefined) : "Value";
          });
        }
      } else {
        return "Value";
      }
    },
    /**
     * Method to get display property for ActionParameter dialog FieldHelp.
     *
     * @function
     * @name getActionParameterDialogFieldHelp
     * @param oActionParameter Action parameter object
     * @param sSapUIName Action sapui name
     * @param sParamName The parameter name
     * @returns The ID of the fieldHelp used by this action parameter
     */
    getActionParameterDialogFieldHelp: function (oActionParameter, sSapUIName, sParamName) {
      return this.hasValueHelpAnnotation(oActionParameter) ? generate([sSapUIName, sParamName]) : undefined;
    },
    /**
     * Method to get display property for ActionParameter dialog delegate.
     *
     * @function
     * @name getFieldValueHelpDelegate
     * @param bIsBound Action is bound
     * @param sETypePath The EntityType Path
     * @param sSapUIName The name of the Action
     * @param sParamName The name of the ActionParameter
     * @returns The delegate configuration object as a stirng
     */
    getFieldValueHelpDelegate: function (bIsBound, sETypePath, sSapUIName, sParamName) {
      return CommonHelper.objectToString({
        name: CommonHelper.addSingleQuotes("sap/fe/macros/field/FieldValueHelpDelegate"),
        payload: {
          propertyPath: CommonHelper.addSingleQuotes(ValueListHelper.getPropertyPath({
            UnboundAction: !bIsBound,
            EntityTypePath: sETypePath,
            Action: sSapUIName,
            Property: sParamName
          }))
        }
      });
    },
    /**
     * Method to get the delegate configuration for ActionParameter dialog.
     *
     * @function
     * @name getValueHelpDelegate
     * @param isBound Action is bound
     * @param entityTypePath The EntityType Path
     * @param sapUIName The name of the Action
     * @param paramName The name of the ActionParameter
     * @returns The delegate configuration object as a string
     */
    getValueHelpDelegate: function (isBound, entityTypePath, sapUIName, paramName) {
      var delegateConfiguration = {
        name: CommonHelper.addSingleQuotes("sap/fe/macros/valuehelp/ValueHelpDelegate"),
        payload: {
          propertyPath: CommonHelper.addSingleQuotes(ValueListHelper.getPropertyPath({
            UnboundAction: !isBound,
            EntityTypePath: entityTypePath,
            Action: sapUIName,
            Property: paramName
          })),
          qualifiers: {},
          valueHelpQualifier: CommonHelper.addSingleQuotes(""),
          isActionParameterDialog: true
        }
      };
      return CommonHelper.objectToString(delegateConfiguration);
    },
    /**
     * Method to get the delegate configuration for NonComputedVisibleKeyField dialog.
     *
     * @function
     * @name getValueHelpDelegateForNonComputedVisibleKeyField
     * @param propertyPath The current property path
     * @returns The delegate configuration object as a string
     */
    getValueHelpDelegateForNonComputedVisibleKeyField: function (propertyPath) {
      var delegateConfiguration = {
        name: CommonHelper.addSingleQuotes("sap/fe/macros/valuehelp/ValueHelpDelegate"),
        payload: {
          propertyPath: CommonHelper.addSingleQuotes(propertyPath),
          qualifiers: {},
          valueHelpQualifier: CommonHelper.addSingleQuotes("")
        }
      };
      return CommonHelper.objectToString(delegateConfiguration);
    },
    /**
     * Method to fetch entity from a path containing multiple associations.
     *
     * @function
     * @name _getEntitySetFromMultiLevel
     * @param oContext The context whose path is to be checked
     * @param sPath The path from which entity has to be fetched
     * @param sSourceEntity The entity path in which nav entity exists
     * @param iStart The start index : beginning parts of the path to be ignored
     * @param iDiff The diff index : end parts of the path to be ignored
     * @returns The path of the entity set
     */
    _getEntitySetFromMultiLevel: function (oContext, sPath, sSourceEntity, iStart, iDiff) {
      var aNavParts = sPath.split("/").filter(Boolean);
      aNavParts = aNavParts.filter(function (sPart) {
        return sPart !== "$NavigationPropertyBinding";
      });
      if (aNavParts.length > 0) {
        for (var i = iStart; i < aNavParts.length - iDiff; i++) {
          sSourceEntity = "/".concat(oContext.getObject("".concat(sSourceEntity, "/$NavigationPropertyBinding/").concat(aNavParts[i])));
        }
      }
      return sSourceEntity;
    },
    /**
     * Method to find the entity of the property.
     *
     * @function
     * @name getPropertyCollection
     * @param oProperty The context from which datafield's path needs to be extracted.
     * @param oContextObject The Metadata Context(Not passed when called with template:with)
     * @returns The entity set path of the property
     */
    getPropertyCollection: function (oProperty, oContextObject) {
      var oContext = oContextObject && oContextObject.context || oProperty;
      var sPath = oContext.getPath();
      var aMainEntityParts = sPath.split("/").filter(Boolean);
      var sMainEntity = aMainEntityParts[0];
      var sPropertyPath = oContext.getObject("$Path");
      var sFieldSourceEntity = "/".concat(sMainEntity);
      // checking against prefix of annotations, ie. @com.sap.vocabularies.
      // as annotation path can be of a line item, field group or facet
      if (sPath.indexOf("/@com.sap.vocabularies.") > -1) {
        var iAnnoIndex = sPath.indexOf("/@com.sap.vocabularies.");
        var sInnerPath = sPath.substring(0, iAnnoIndex);
        // the facet or line item's entity could be a navigation entity
        sFieldSourceEntity = FieldHelper._getEntitySetFromMultiLevel(oContext, sInnerPath, sFieldSourceEntity, 1, 0);
      }
      if (sPropertyPath && sPropertyPath.indexOf("/") > -1) {
        // the field within facet or line item could be from a navigation entity
        sFieldSourceEntity = FieldHelper._getEntitySetFromMultiLevel(oContext, sPropertyPath, sFieldSourceEntity, 0, 1);
      }
      return sFieldSourceEntity;
    },
    /**
     * Method used in a template with to retrieve the currency or the unit property inside a templating variable.
     *
     * @param oPropertyAnnotations
     * @returns The annotationPath to be dealt with by template:with
     */
    getUnitOrCurrency: function (oPropertyAnnotations) {
      var oPropertyAnnotationsObject = oPropertyAnnotations.getObject();
      var sAnnotationPath = oPropertyAnnotations.sPath;
      if (oPropertyAnnotationsObject["@Org.OData.Measures.V1.ISOCurrency"]) {
        sAnnotationPath = "".concat(sAnnotationPath, "Org.OData.Measures.V1.ISOCurrency");
      } else {
        sAnnotationPath = "".concat(sAnnotationPath, "Org.OData.Measures.V1.Unit");
      }
      return sAnnotationPath;
    },
    hasStaticUnitOrCurrency: function (oPropertyAnnotations) {
      return oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"] ? !oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"].$Path : !oPropertyAnnotations["@Org.OData.Measures.V1.Unit"].$Path;
    },
    getStaticUnitOrCurrency: function (oPropertyAnnotations, oFormatOptions) {
      if (oFormatOptions && oFormatOptions.measureDisplayMode !== "Hidden") {
        var unit = oPropertyAnnotations["@Org.OData.Measures.V1.ISOCurrency"] || oPropertyAnnotations["@Org.OData.Measures.V1.Unit"];
        var dateFormat = DateFormat.getDateInstance();
        var localeData = dateFormat.oLocaleData.mData;
        if (localeData && localeData.units && localeData.units.short && localeData.units.short[unit] && localeData.units.short[unit].displayName) {
          return localeData.units.short[unit].displayName;
        }
        return unit;
      }
    },
    getEmptyIndicatorTrigger: function (bActive, sBinding, sFullTextBinding) {
      if (sFullTextBinding) {
        return bActive ? sFullTextBinding : "inactive";
      }
      return bActive ? sBinding : "inactive";
    },
    /**
     * When the value displayed is in text arrangement TextOnly we also want to retrieve the Text value for tables even if we don't show it.
     * This method will return the value of the original data field.
     *
     * @param oThis The current object
     * @param oDataFieldTextArrangement DataField using text arrangement annotation
     * @param oDataField DataField containing the value using text arrangement annotation
     * @returns The binding to the value
     */
    getBindingInfoForTextArrangement: function (oThis, oDataFieldTextArrangement, oDataField) {
      if (oDataFieldTextArrangement && oDataFieldTextArrangement.$EnumMember && oDataFieldTextArrangement.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly" && oDataField) {
        return "{".concat(oDataField.Value.$Path, "}");
      }
    },
    semanticKeyFormat: function (vRaw, oInterface) {
      // The Empty argument ensures that "groupingEnabled" is added to "formatOptions"
      oInterface.arguments = [{}, {
        groupingEnabled: false
      }];
      return AnnotationHelper.format(vRaw, oInterface);
    },
    getIsMediaContentTypeNullExpr: function (sPropertyPath, sOperator) {
      sOperator = sOperator || "===";
      return "{= %{" + sPropertyPath + "@odata.mediaContentType} " + sOperator + " null }";
    },
    getPathForIconSource: function (sPropertyPath) {
      return "{= FIELDRUNTIME.getIconForMimeType(%{" + sPropertyPath + "@odata.mediaContentType})}";
    },
    getFilenameExpr: function (sFilename, sNoFilenameText) {
      if (sFilename) {
        if (sFilename.indexOf("{") === 0) {
          // filename is referenced via path, i.e. @Core.ContentDisposition.Filename : path
          return "{= $" + sFilename + " ? $" + sFilename + " : $" + sNoFilenameText + "}";
        }
        // static filename, i.e. @Core.ContentDisposition.Filename : 'someStaticName'
        return sFilename;
      }
      // no @Core.ContentDisposition.Filename
      return sNoFilenameText;
    },
    calculateMBfromByte: function (iByte) {
      return iByte ? (iByte / (1024 * 1024)).toFixed(6) : undefined;
    },
    getDownloadUrl: function (propertyPath) {
      return propertyPath + "{= ${internal>/stickySessionToken} ? ('?SAP-ContextId=' + ${internal>/stickySessionToken}) : '' }";
    },
    getMarginClass: function (compactSemanticKey) {
      return compactSemanticKey === "true" || compactSemanticKey === true ? "sapMTableContentMargin" : undefined;
    },
    getRequired: function (immutableKey, target, requiredProperties) {
      var targetRequiredExpression = constant(false);
      if (target !== null) {
        targetRequiredExpression = isRequiredExpression(target === null || target === void 0 ? void 0 : target.targetObject);
      }
      return compileExpression(or(targetRequiredExpression, requiredProperties.indexOf(immutableKey) > -1));
    },
    /**
     * The method checks if the field is already part of a form.
     *
     * @param dataFieldCollection The list of the fields of the form
     * @param dataField The data field which needs to be checked in the form
     * @returns `true` if the field is already part of the form, `false` otherwise
     */
    isFieldPartOfForm: function (dataFieldCollection, dataField) {
      //generating key for the received data field
      var connectedDataFieldKey = KeyHelper.generateKeyFromDataField(dataField);
      // trying to find the generated key in already existing form elements
      var isFieldFound = dataFieldCollection.find(function (field) {
        return field.key === connectedDataFieldKey;
      });
      return isFieldFound ? true : false;
    }
  };
  FieldHelper.buildExpressionForTextValue.requiresIContext = true;
  FieldHelper.getFieldGroupIds.requiresIContext = true;
  FieldHelper.fieldControl.requiresIContext = true;
  FieldHelper.getTypeAlignment.requiresIContext = true;
  FieldHelper.getPropertyCollection.requiresIContext = true;
  FieldHelper.getAPDialogDisplayFormat.requiresIContext = true;
  FieldHelper.operators.requiresIContext = true;
  FieldHelper.semanticKeyFormat.requiresIContext = true;
  FieldHelper.computeLabelText.requiresIContext = true;
  FieldHelper.getFieldHelpPropertyForFilterField.requiresIContext = true;
  FieldHelper.retrieveTextFromValueList.requiresIContext = true;
  FieldHelper.getActionParameterVisibility.requiresIContext = true;
  FieldHelper.computeLinkParameters.requiresIContext = true;
  return FieldHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJfZ2VuZXJhdGVTaWRlRWZmZWN0c01hcCIsIm9JbnRlcmZhY2UiLCJvTWV0YU1vZGVsIiwiZ2V0TW9kZWwiLCJvRmllbGRTZXR0aW5ncyIsImdldFNldHRpbmciLCJvU2lkZUVmZmVjdHMiLCJzaWRlRWZmZWN0cyIsIlNpZGVFZmZlY3RzSGVscGVyIiwiZ2VuZXJhdGVTaWRlRWZmZWN0c01hcEZyb21NZXRhTW9kZWwiLCJJU09DdXJyZW5jeSIsIlVuaXQiLCJGaWVsZEhlbHBlciIsImRpc3BsYXlNb2RlIiwib1Byb3BlcnR5QW5ub3RhdGlvbnMiLCJvQ29sbGVjdGlvbkFubm90YXRpb25zIiwib1RleHRBbm5vdGF0aW9uIiwib1RleHRBcnJhbmdlbWVudEFubm90YXRpb24iLCIkRW51bU1lbWJlciIsImJ1aWxkRXhwcmVzc2lvbkZvclRleHRWYWx1ZSIsInNQcm9wZXJ0eVBhdGgiLCJvRGF0YUZpZWxkIiwiY29udGV4dCIsInNQYXRoIiwiZ2V0UGF0aCIsIm9UZXh0QW5ub3RhdGlvbkNvbnRleHQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImdldFByb3BlcnR5Iiwic1RleHRFeHByZXNzaW9uIiwiQW5ub3RhdGlvbkhlbHBlciIsInZhbHVlIiwidW5kZWZpbmVkIiwic0V4cHJlc3Npb24iLCJnZXROYXZpZ2F0aW9uUGF0aCIsImluZGV4T2YiLCJyZXBsYWNlIiwic3Vic3RyIiwibGVuZ3RoIiwiYnVpbGRUYXJnZXRQYXRoRnJvbURhdGFNb2RlbE9iamVjdFBhdGgiLCJvRGF0YU1vZGVsT2JqZWN0UGF0aCIsInNTYXJ0RW50aXR5U2V0Iiwic3RhcnRpbmdFbnRpdHlTZXQiLCJuYW1lIiwiYU5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJpIiwiaGFzU2VtYW50aWNPYmplY3RUYXJnZXRzIiwib1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCIsIm9Qcm9wZXJ0eURlZmluaXRpb24iLCJpc1Byb3BlcnR5IiwidGFyZ2V0T2JqZWN0IiwiJHRhcmdldCIsInNTZW1hbnRpY09iamVjdCIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiU2VtYW50aWNPYmplY3QiLCJhU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMiLCJTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyIsInNQcm9wZXJ0eUxvY2F0aW9uUGF0aCIsInNCaW5kaW5nRXhwcmVzc2lvbiIsInBhdGgiLCJjb21waWxlRXhwcmVzc2lvbiIsInBhdGhJbk1vZGVsIiwidmFsdWVPZiIsInNBbHRlcm5hdGVQYXRoIiwic0JpbmRpbmdQYXRoIiwiZ2V0U3RhdGVEZXBlbmRpbmdPblNlbWFudGljT2JqZWN0VGFyZ2V0cyIsImlzTm90QWx3YXlzSGlkZGVuIiwib0RldGFpbHMiLCJvQ29udGV4dCIsImlzQWx3YXlzSGlkZGVuIiwiVmFsdWUiLCIkUGF0aCIsImdldE9iamVjdCIsImlzRHJhZnRJbmRpY2F0b3JWaXNpYmxlSW5GaWVsZEdyb3VwIiwiY29sdW1uIiwiZm9ybWF0T3B0aW9ucyIsImZpZWxkR3JvdXBEcmFmdEluZGljYXRvclByb3BlcnR5UGF0aCIsImZpZWxkR3JvdXBOYW1lIiwiaXNSZXF1aXJlZCIsIm9GaWVsZENvbnRyb2wiLCJzRWRpdE1vZGUiLCJNYW5hZ2VkT2JqZWN0IiwiYmluZGluZ1BhcnNlciIsImdldEFjdGlvblBhcmFtZXRlclZpc2liaWxpdHkiLCJvUGFyYW0iLCIkSWYiLCJvTmVnUGFyYW0iLCJwcm9wZXJ0eU5hbWUiLCJ2UHJvcGVydHkiLCJzUHJvcGVydHlOYW1lIiwiJFByb3BlcnR5UGF0aCIsInNDb250ZXh0UGF0aCIsImdldEZpZWxkR3JvdXBJZHMiLCJnZXRJbnRlcmZhY2UiLCJ0aGVuIiwic093bmVyRW50aXR5VHlwZSIsImFGaWVsZEdyb3VwSWRzIiwiZ2V0U2lkZUVmZmVjdHNPbkVudGl0eUFuZFByb3BlcnR5Iiwic0ZpZWxkR3JvdXBJZHMiLCJyZWR1Y2UiLCJzUmVzdWx0Iiwic0lkIiwiYklzTmF2aWdhdGlvblBhdGgiLCJsYXN0SW5kZXhPZiIsImNvbmNhdCIsImZpZWxkQ29udHJvbCIsIm9Nb2RlbCIsIm9GaWVsZENvbnRyb2xDb250ZXh0IiwiaGFzT3duUHJvcGVydHkiLCJnZXROYXZpZ2F0aW9uRW50aXR5Iiwib1Byb3BlcnR5Iiwib0NvbnRleHRPYmplY3QiLCJzTmF2aWdhdGlvblBhcnQiLCJzTmF2aWdhdGlvblBhdGgiLCJzcGxpdCIsInBvcCIsInN1YnN0cmluZyIsIm9FbnRpdHlUeXBlIiwiYUtleXMiLCJPYmplY3QiLCJrZXlzIiwiaW5kZXgiLCIka2luZCIsIiRSZWZlcmVudGlhbENvbnN0cmFpbnQiLCJnZXROYXZpZ2F0aW9uQmluZGluZyIsImluY2x1ZGVzIiwib0Fubm90YXRpb25zIiwic2luZ2xlQW5ub3RhdGlvbiIsInZhbHVlSGVscFByb3BlcnR5Iiwib1Byb3BlcnR5Q29udGV4dCIsImJJbkZpbHRlckZpZWxkIiwib0NvbnRlbnQiLCJzQW5ub1BhdGgiLCJzQW5ub3RhdGlvbiIsInNVbml0T3JDdXJyZW5jeVBhdGgiLCJ2YWx1ZUhlbHBQcm9wZXJ0eUZvckZpbHRlckZpZWxkIiwiZ2V0SURGb3JGaWVsZFZhbHVlSGVscCIsInNGbGV4SWQiLCJzSWRQcmVmaXgiLCJzT3JpZ2luYWxQcm9wZXJ0eU5hbWUiLCJzUHJvcGVydHkiLCJnZW5lcmF0ZSIsImdldEZpZWxkSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQiLCJpQ29udGV4dCIsInNQcm9wZXJ0eVR5cGUiLCJzVmhJZFByZWZpeCIsInNWYWx1ZUhlbHBQcm9wZXJ0eU5hbWUiLCJiSGFzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzIiwiYlVzZVNlbWFudGljRGF0ZVJhbmdlIiwiYlNlbWFudGljRGF0ZVJhbmdlIiwiQ29tbW9uSGVscGVyIiwiZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgiLCJvRmlsdGVyUmVzdHJpY3Rpb25zIiwiQ29tbW9uVXRpbHMiLCJnZXRGaWx0ZXJSZXN0cmljdGlvbnNCeVBhdGgiLCJGaWx0ZXJBbGxvd2VkRXhwcmVzc2lvbnMiLCJnZXRTZW1hbnRpY0tleVRpdGxlIiwic1Byb3BlcnR5VGV4dFZhbHVlIiwic1Byb3BlcnR5VmFsdWUiLCJzRGF0YUZpZWxkIiwib1RleHRBcnJhbmdlbWVudCIsInNTZW1hbnRpY0tleVN0eWxlIiwib0RyYWZ0Um9vdCIsInNOZXdPYmplY3QiLCJSZXNvdXJjZU1vZGVsIiwiZ2V0VGV4dCIsInNVbm5hbWVkT2JqZWN0Iiwic05ld09iamVjdEV4cHJlc3Npb24iLCJzVW5ubmFtZWRPYmplY3RFeHByZXNzaW9uIiwic1NlbWFudGljS2V5VGl0bGVFeHByZXNzaW9uIiwiYWRkTmV3T2JqZWN0VW5OYW1lZE9iamVjdEV4cHJlc3Npb24iLCJzVmFsdWUiLCJidWlsZEV4cHJlc3Npb25Gb3JTZW1hbnRpY2tLZXlUaXRsZSIsImJJc0V4cHJlc3Npb25CaW5kaW5nIiwic1RleHRBcnJhbmdlbWVudCIsImdldE9iamVjdElkZW50aWZpZXJUZXh0Iiwic1Byb3BlcnR5VmFsdWVCaW5kaW5nIiwic0RhdGFGaWVsZE5hbWUiLCJnZXRTZW1hbnRpY09iamVjdHNMaXN0IiwicHJvcGVydHlBbm5vdGF0aW9ucyIsImFTZW1hbnRpY09iamVjdHMiLCJrZXkiLCJzZW1hbnRpY09iamVjdFZhbHVlIiwicHVzaCIsIm9TZW1hbnRpY09iamVjdHNNb2RlbCIsIkpTT05Nb2RlbCIsIiQkdmFsdWVBc1Byb21pc2UiLCJnZXRTZW1hbnRpY09iamVjdHNRdWFsaWZpZXJzIiwicXVhbGlmaWVyc0Fubm90YXRpb25zIiwiZmluZE9iamVjdCIsInF1YWxpZmllciIsImZpbmQiLCJvYmplY3QiLCJhbm5vdGF0aW9uQ29udGVudCIsImFubm90YXRpb24iLCJxdWFsaWZpZXJPYmplY3QiLCJmaWx0ZXIiLCJvUXVhbGlmaWVyIiwib1F1YWxpZmllcnNNb2RlbCIsImdldFNlbWFudGljT2JqZWN0c1dpdGhBbm5vdGF0aW9ucyIsImxpc3RJdGVtIiwic2VtYW50aWNPYmplY3RMaXN0IiwiY29tcHV0ZVNlbWFudGljTGlua01vZGVsQ29udGV4dENoYW5nZSIsImhhc1NlbWFudGljT2JqZWN0c1dpdGhQYXRoIiwic1BhdGhUb1Byb3BlcnR5IiwiYlNlbWFudGljT2JqZWN0SGFzQVBhdGgiLCJpc1NlbWFudGljS2V5SGFzRmllbGRHcm91cENvbHVtbiIsImlzRmllbGRHcm91cENvbHVtbiIsIl9jaGVja0N1c3RvbVNlbWFudGljT2JqZWN0SGFzQW5ub3RhdGlvbnMiLCJfc2VtYW50aWNPYmplY3RzV2l0aEFubm90YXRpb25zIiwiX21hbmFnZUN1c3RvbVNlbWFudGljT2JqZWN0cyIsImN1c3RvbVNlbWFudGljT2JqZWN0Iiwic2VtYW50aWNPYmplY3RzTGlzdCIsInNlbWFudGljT2JqZWN0c1dpdGhBbm5vdGF0aW9ucyIsIkpTT04iLCJwYXJzZSIsImZvckVhY2giLCJzZW1hbnRpY09iamVjdCIsImNvbXB1dGVMaW5rUGFyYW1ldGVycyIsImRlbGVnYXRlTmFtZSIsImVudGl0eVR5cGUiLCJkYXRhRmllbGQiLCJjb250YWN0IiwibWFpblNlbWFudGljT2JqZWN0IiwibmF2aWdhdGlvblBhdGgiLCJwcm9wZXJ0eVBhdGhMYWJlbCIsImhhc1F1aWNrVmlld0ZhY2V0cyIsIl9DdXN0b21TZW1hbnRpY09iamVjdHNGb3VuZCIsIlByb21pc2UiLCJyZXNvbHZlIiwic2VtYW50aWNPYmplY3RNYXBwaW5ncyIsInNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zIiwiYVJlc29sdmVkTWFpblNlbWFudGljT2JqZWN0Iiwic1Jlc29sdmVNYWluU2VtYW50aWNPYmplY3QiLCJzZW1PYmplY3QiLCJ1bkF2YWlsYWJsZUFjdGlvbiIsImFjdGlvbnMiLCJpdGVtcyIsIm1hcHBpbmdJdGVtIiwiTG9jYWxQcm9wZXJ0eSIsIlNlbWFudGljT2JqZWN0UHJvcGVydHkiLCJtYXBwaW5nIiwic3RyaW5naWZ5IiwicGF5bG9hZCIsInNlbWFudGljT2JqZWN0cyIsInNlbWFudGljUHJpbWFyeUFjdGlvbnMiLCJjb21wdXRlRmllbGRCYXNlRGVsZWdhdGUiLCJyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0IiwiX2dldFByaW1hcnlJbnRlbnRzIiwiYVNlbWFudGljT2JqZWN0c0xpc3QiLCJhUHJvbWlzZXMiLCJvVXNoZWxsQ29udGFpbmVyIiwic2FwIiwidXNoZWxsIiwiQ29udGFpbmVyIiwib1NlcnZpY2UiLCJnZXRTZXJ2aWNlIiwiZ2V0UHJpbWFyeUludGVudCIsImFsbCIsImFTZW1PYmplY3RQcmltYXJ5QWN0aW9uIiwiY2F0Y2giLCJvRXJyb3IiLCJMb2ciLCJlcnJvciIsIl9TZW1hbnRpY09iamVjdHNIYXNQcmltYXJ5QWN0aW9uIiwib1NlbWFudGljcyIsImFTZW1hbnRpY09iamVjdHNQcmltYXJ5QWN0aW9ucyIsIl9mbklzU2VtYW50aWNPYmplY3RBY3Rpb25VbmF2YWlsYWJsZSIsIl9vU2VtYW50aWNzIiwiX29QcmltYXJ5QWN0aW9uIiwiX2luZGV4IiwidW5hdmFpbGFibGVBY3Rpb25zSW5kZXgiLCJpbnRlbnQiLCJvUHJpbWFyeUFjdGlvbiIsInNDdXJyZW50SGFzaCIsImdldEhhc2giLCJjaGVja1ByaW1hcnlBY3Rpb25zIiwiYkdldFRpdGxlTGluayIsInRpdGxlTGluayIsImhhc1RpdGxlTGluayIsIl9nZXRUaXRsZUxpbmtXaXRoUGFyYW1ldGVycyIsIl9vU2VtYW50aWNPYmplY3RNb2RlbCIsIl9saW5rSW50ZW50IiwidGl0bGVsaW5rIiwiZ2V0UHJpbWFyeUFjdGlvbiIsInByaW1hcnlJbnRlbnRBY3Rpb24iLCJvcGVyYXRvcnMiLCJzU2V0dGluZ3MiLCJjb250ZXh0UGF0aCIsInByb3BlcnR5VHlwZSIsIiRUeXBlIiwiZ2V0T3BlcmF0b3JzRm9yR3VpZFByb3BlcnR5Iiwic2xpY2UiLCJpc1RhYmxlQm91bmRUb05hdmlnYXRpb24iLCJpc05hdmlnYXRpb25QYXRoIiwicHJvcGVydHlQYXRoIiwiZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkiLCJNb2RlbEhlbHBlciIsImdldEVudGl0eVNldFBhdGgiLCJnZXRPcGVyYXRvcnNGb3JEYXRlUHJvcGVydHkiLCJnZXRQcm9wZXJ0eUNvbnRleHRGb3JRdWlja1ZpZXdGb3JtIiwib0RhdGFGaWVsZENvbnRleHQiLCJlbmRzV2l0aCIsImdldFByb3BlcnR5UGF0aEZvclF1aWNrVmlld0Zvcm0iLCJnZXREYXRhRmllbGREZWZhdWx0Iiwib0RhdGFGaWVsZERlZmF1bHQiLCJpc0RhdGFGaWVsZEFjdGlvbkJ1dHRvblZpc2libGUiLCJvVGhpcyIsImJJc0JvdW5kIiwib0FjdGlvbkNvbnRleHQiLCJnZXRQcmVzc0V2ZW50Rm9yRGF0YUZpZWxkQWN0aW9uQnV0dG9uIiwic0ludm9jYXRpb25Hcm91cGluZyIsIkludm9jYXRpb25Hcm91cGluZyIsImJJc05hdmlnYWJsZSIsIm5hdmlnYXRlQWZ0ZXJBY3Rpb24iLCJlbnRpdGllcyIsImVudGl0eVNldCIsImVudGl0eVNldE5hbWUiLCJvUGFyYW1zIiwiY29udGV4dHMiLCJpbnZvY2F0aW9uR3JvdXBpbmciLCJhZGRTaW5nbGVRdW90ZXMiLCJtb2RlbCIsImxhYmVsIiwiTGFiZWwiLCJpc05hdmlnYWJsZSIsImdlbmVyYXRlRnVuY3Rpb24iLCJBY3Rpb24iLCJvYmplY3RUb1N0cmluZyIsImlzTnVtZXJpY0RhdGFUeXBlIiwic0RhdGFGaWVsZFR5cGUiLCJfc0RhdGFGaWVsZFR5cGUiLCJhTnVtZXJpY0RhdGFUeXBlcyIsImlzRGF0ZU9yVGltZURhdGFUeXBlIiwiYURhdGVUaW1lRGF0YVR5cGVzIiwiaXNEYXRlVGltZURhdGFUeXBlIiwiYURhdGVEYXRhVHlwZXMiLCJpc0RhdGVEYXRhVHlwZSIsImlzVGltZURhdGFUeXBlIiwiZ2V0VW5kZXJseWluZ1Byb3BlcnR5RGF0YVR5cGUiLCJzRW50aXR5UGF0aCIsInNUeXBlIiwic1RleHRBbm5vdGF0aW9uIiwic1RleHRBcnJhbmdlbWVudEFubm90YXRpb24iLCJnZXRDb2x1bW5BbGlnbm1lbnQiLCJvVGFibGUiLCJjb2xsZWN0aW9uIiwiSW5saW5lIiwiSWNvblVybCIsImFTZW1hbnRpY0tleXMiLCJiSXNTZW1hbnRpY0tleSIsImV2ZXJ5Iiwib0tleSIsImdldERhdGFGaWVsZEFsaWdubWVudCIsImdldFByb3BlcnR5QWxpZ25tZW50Iiwib0Zvcm1hdE9wdGlvbnMiLCJvQ29tcHV0ZWRFZGl0TW9kZSIsInNEZWZhdWx0QWxpZ25tZW50Iiwic1RleHRBbGlnbm1lbnQiLCJ0ZXh0QWxpZ25Nb2RlIiwiZ2V0QWxpZ25tZW50RXhwcmVzc2lvbiIsInNEYXRhRmllbGRQYXRoIiwiVGFyZ2V0IiwiJEFubm90YXRpb25QYXRoIiwib0ZpZWxkR3JvdXAiLCJEYXRhIiwidG9TdHJpbmciLCJnZXRUeXBlQWxpZ25tZW50IiwiZnVsbHlRdWFsaWZpZWROYW1lIiwiaXNEYXRhRmllbGRBY3Rpb25CdXR0b25FbmFibGVkIiwic0FjdGlvbkNvbnRleHRGb3JtYXQiLCJnZXRMYWJlbFRleHRGb3JEYXRhRmllbGQiLCJvRW50aXR5U2V0TW9kZWwiLCJvUHJvcGVydHlQYXRoIiwic1Byb3BlcnR5UGF0aEJ1aWxkRXhwcmVzc2lvbiIsInNVaU5hbWUiLCJzUHJvcGVydHlGdWxsUGF0aCIsInNEaXNwbGF5Rm9ybWF0Iiwic2V0TWV0YU1vZGVsIiwiY29tcHV0ZUxhYmVsVGV4dCIsInNEYXRhRmllbGRMYWJlbCIsInNEYXRhRmllbGRUYXJnZXRUaXRsZSIsInNEYXRhRmllbGRUYXJnZXRMYWJlbCIsInNEYXRhRmllbGRWYWx1ZUxhYmVsIiwic0RhdGFGaWVsZFRhcmdldFZhbHVlTGFiZWwiLCJidWlsZEV4cHJlc3Npb25Gb3JBbGlnbkl0ZW1zIiwic1Zpc3VhbGl6YXRpb24iLCJmaWVsZFZpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbiIsImNvbnN0YW50IiwicHJvZ3Jlc3NWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24iLCJyYXRpbmdWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24iLCJpZkVsc2UiLCJvciIsImVxdWFsIiwiVUkiLCJJc0VkaXRhYmxlIiwiaGFzVmFsdWVIZWxwQW5ub3RhdGlvbiIsImdldEFQRGlhbG9nRGlzcGxheUZvcm1hdCIsIm9Bbm5vdGF0aW9uIiwiJE5hbWUiLCJvQWN0aW9uUGFyYW1ldGVyQW5ub3RhdGlvbnMiLCJvVmFsdWVIZWxwQW5ub3RhdGlvbiIsImdldFZhbHVlTGlzdFByb3BlcnR5TmFtZSIsIm9WYWx1ZUxpc3QiLCJvVmFsdWVMaXN0UGFyYW1ldGVyIiwiUGFyYW1ldGVycyIsIm9QYXJhbWV0ZXIiLCJMb2NhbERhdGFQcm9wZXJ0eSIsIlZhbHVlTGlzdFByb3BlcnR5Iiwic1ZhbHVlTGlzdFByb3BlcnR5TmFtZSIsImNvbXB1dGVEaXNwbGF5TW9kZSIsIkNvbGxlY3Rpb25QYXRoIiwicmVxdWVzdFZhbHVlTGlzdEluZm8iLCJvVmFsdWVMaXN0SW5mbyIsIiRtb2RlbCIsImdldE1ldGFNb2RlbCIsImdldEFjdGlvblBhcmFtZXRlckRpYWxvZ0ZpZWxkSGVscCIsIm9BY3Rpb25QYXJhbWV0ZXIiLCJzU2FwVUlOYW1lIiwic1BhcmFtTmFtZSIsImdldEZpZWxkVmFsdWVIZWxwRGVsZWdhdGUiLCJzRVR5cGVQYXRoIiwiVmFsdWVMaXN0SGVscGVyIiwiZ2V0UHJvcGVydHlQYXRoIiwiVW5ib3VuZEFjdGlvbiIsIkVudGl0eVR5cGVQYXRoIiwiUHJvcGVydHkiLCJnZXRWYWx1ZUhlbHBEZWxlZ2F0ZSIsImlzQm91bmQiLCJlbnRpdHlUeXBlUGF0aCIsInNhcFVJTmFtZSIsInBhcmFtTmFtZSIsImRlbGVnYXRlQ29uZmlndXJhdGlvbiIsInF1YWxpZmllcnMiLCJ2YWx1ZUhlbHBRdWFsaWZpZXIiLCJpc0FjdGlvblBhcmFtZXRlckRpYWxvZyIsImdldFZhbHVlSGVscERlbGVnYXRlRm9yTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGQiLCJfZ2V0RW50aXR5U2V0RnJvbU11bHRpTGV2ZWwiLCJzU291cmNlRW50aXR5IiwiaVN0YXJ0IiwiaURpZmYiLCJhTmF2UGFydHMiLCJCb29sZWFuIiwic1BhcnQiLCJnZXRQcm9wZXJ0eUNvbGxlY3Rpb24iLCJhTWFpbkVudGl0eVBhcnRzIiwic01haW5FbnRpdHkiLCJzRmllbGRTb3VyY2VFbnRpdHkiLCJpQW5ub0luZGV4Iiwic0lubmVyUGF0aCIsImdldFVuaXRPckN1cnJlbmN5Iiwib1Byb3BlcnR5QW5ub3RhdGlvbnNPYmplY3QiLCJzQW5ub3RhdGlvblBhdGgiLCJoYXNTdGF0aWNVbml0T3JDdXJyZW5jeSIsImdldFN0YXRpY1VuaXRPckN1cnJlbmN5IiwibWVhc3VyZURpc3BsYXlNb2RlIiwidW5pdCIsImRhdGVGb3JtYXQiLCJEYXRlRm9ybWF0IiwiZ2V0RGF0ZUluc3RhbmNlIiwibG9jYWxlRGF0YSIsIm9Mb2NhbGVEYXRhIiwibURhdGEiLCJ1bml0cyIsInNob3J0IiwiZGlzcGxheU5hbWUiLCJnZXRFbXB0eUluZGljYXRvclRyaWdnZXIiLCJiQWN0aXZlIiwic0JpbmRpbmciLCJzRnVsbFRleHRCaW5kaW5nIiwiZ2V0QmluZGluZ0luZm9Gb3JUZXh0QXJyYW5nZW1lbnQiLCJvRGF0YUZpZWxkVGV4dEFycmFuZ2VtZW50Iiwic2VtYW50aWNLZXlGb3JtYXQiLCJ2UmF3IiwiYXJndW1lbnRzIiwiZ3JvdXBpbmdFbmFibGVkIiwiZm9ybWF0IiwiZ2V0SXNNZWRpYUNvbnRlbnRUeXBlTnVsbEV4cHIiLCJzT3BlcmF0b3IiLCJnZXRQYXRoRm9ySWNvblNvdXJjZSIsImdldEZpbGVuYW1lRXhwciIsInNGaWxlbmFtZSIsInNOb0ZpbGVuYW1lVGV4dCIsImNhbGN1bGF0ZU1CZnJvbUJ5dGUiLCJpQnl0ZSIsInRvRml4ZWQiLCJnZXREb3dubG9hZFVybCIsImdldE1hcmdpbkNsYXNzIiwiY29tcGFjdFNlbWFudGljS2V5IiwiZ2V0UmVxdWlyZWQiLCJpbW11dGFibGVLZXkiLCJ0YXJnZXQiLCJyZXF1aXJlZFByb3BlcnRpZXMiLCJ0YXJnZXRSZXF1aXJlZEV4cHJlc3Npb24iLCJpc1JlcXVpcmVkRXhwcmVzc2lvbiIsImlzRmllbGRQYXJ0T2ZGb3JtIiwiZGF0YUZpZWxkQ29sbGVjdGlvbiIsImNvbm5lY3RlZERhdGFGaWVsZEtleSIsIktleUhlbHBlciIsImdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZCIsImlzRmllbGRGb3VuZCIsImZpZWxkIiwicmVxdWlyZXNJQ29udGV4dCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmllbGRIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHsgRGF0YUZpZWxkQWJzdHJhY3RUeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHR5cGUgeyBGb3JtRWxlbWVudCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9Gb3JtXCI7XG5pbXBvcnQgeyBVSSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvQmluZGluZ0hlbHBlclwiO1xuaW1wb3J0IHsgS2V5SGVscGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9LZXlcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBjb25zdGFudCwgZXF1YWwsIGlmRWxzZSwgb3IsIHBhdGhJbk1vZGVsIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFNpZGVFZmZlY3RzSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1NpZGVFZmZlY3RzSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgaXNSZXF1aXJlZEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9GaWVsZENvbnRyb2xIZWxwZXJcIjtcbmltcG9ydCB7IGlzUHJvcGVydHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9Qcm9wZXJ0eUhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0QWxpZ25tZW50RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1VJRm9ybWF0dGVyc1wiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCBWYWx1ZUxpc3RIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvdmFsdWVoZWxwL1ZhbHVlTGlzdEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgeyBWYWx1ZUhlbHBQYXlsb2FkIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvdmFsdWVoZWxwL1ZhbHVlTGlzdEhlbHBlck5ld1wiO1xuaW1wb3J0IFJlc291cmNlTW9kZWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvUmVzb3VyY2VNb2RlbFwiO1xuaW1wb3J0IE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBEYXRlRm9ybWF0IGZyb20gXCJzYXAvdWkvY29yZS9mb3JtYXQvRGF0ZUZvcm1hdFwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgQW5ub3RhdGlvbkhlbHBlciBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0Fubm90YXRpb25IZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5cbmNvbnN0IElTT0N1cnJlbmN5ID0gXCJAT3JnLk9EYXRhLk1lYXN1cmVzLlYxLklTT0N1cnJlbmN5XCIsXG5cdFVuaXQgPSBcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdFwiO1xuXG4vKipcbiAqIFdoYXQgZG9lcyB0aGUgbWFwIGxvb2sgbGlrZT9cbiAqICAgIHtcbiAqICBcdCduYW1lc3BhY2Uub2YuZW50aXR5VHlwZScgOiBbXG4gKiBcdFx0XHRbbmFtZXNwYWNlLm9mLmVudGl0eVR5cGUxI1F1YWxpZmllcixuYW1lc3BhY2Uub2YuZW50aXR5VHlwZTIjUXVhbGlmaWVyXSwgLS0+IFNlYXJjaCBGb3I6IG1hcHBpbmdTb3VyY2VFbnRpdGllc1xuICogXHRcdFx0e1xuICogXHRcdFx0XHQncHJvcGVydHknIDogW25hbWVzcGFjZS5vZi5lbnRpdHlUeXBlMyNRdWFsaWZpZXIsbmFtZXNwYWNlLm9mLmVudGl0eVR5cGU0I1F1YWxpZmllcl0gLS0+IFNlYXJjaCBGb3I6IG1hcHBpbmdTb3VyY2VQcm9wZXJ0aWVzXG4gKiBcdFx0XHR9XG4gKiBcdH0uXG4gKlxuICogQHBhcmFtIG9JbnRlcmZhY2UgSW50ZXJmYWNlIGluc3RhbmNlXG4gKiBAcmV0dXJucyBQcm9taXNlIHJlc29sdmVkIHdoZW4gdGhlIG1hcCBpcyByZWFkeSBhbmQgcHJvdmlkZXMgdGhlIG1hcFxuICovXG5hc3luYyBmdW5jdGlvbiBfZ2VuZXJhdGVTaWRlRWZmZWN0c01hcChvSW50ZXJmYWNlOiBhbnkpIHtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9JbnRlcmZhY2UuZ2V0TW9kZWwoKTtcblx0Y29uc3Qgb0ZpZWxkU2V0dGluZ3MgPSBvSW50ZXJmYWNlLmdldFNldHRpbmcoXCJzYXAuZmUubWFjcm9zLmludGVybmFsLkZpZWxkXCIpO1xuXHRjb25zdCBvU2lkZUVmZmVjdHMgPSBvRmllbGRTZXR0aW5ncy5zaWRlRWZmZWN0cztcblxuXHQvLyBHZW5lcmF0ZSBtYXAgb25jZVxuXHRpZiAob1NpZGVFZmZlY3RzKSB7XG5cdFx0cmV0dXJuIG9TaWRlRWZmZWN0cztcblx0fVxuXG5cdHJldHVybiBTaWRlRWZmZWN0c0hlbHBlci5nZW5lcmF0ZVNpZGVFZmZlY3RzTWFwRnJvbU1ldGFNb2RlbChvTWV0YU1vZGVsKTtcbn1cblxuY29uc3QgRmllbGRIZWxwZXIgPSB7XG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgaG93IHRvIHNob3cgdGhlIHZhbHVlIGJ5IGFuYWx5emluZyBUZXh0IGFuZCBUZXh0QXJyYW5nZW1lbnQgQW5ub3RhdGlvbnMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkSGVscGVyI2Rpc3BsYXlNb2RlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkSGVscGVyXG5cdCAqIEBzdGF0aWNcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eUFubm90YXRpb25zIFRoZSBQcm9wZXJ0eSBhbm5vdGF0aW9uc1xuXHQgKiBAcGFyYW0gb0NvbGxlY3Rpb25Bbm5vdGF0aW9ucyBUaGUgRW50aXR5VHlwZSBhbm5vdGF0aW9uc1xuXHQgKiBAcmV0dXJucyBUaGUgZGlzcGxheSBtb2RlIG9mIHRoZSBmaWVsZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdGRpc3BsYXlNb2RlOiBmdW5jdGlvbiAob1Byb3BlcnR5QW5ub3RhdGlvbnM6IGFueSwgb0NvbGxlY3Rpb25Bbm5vdGF0aW9uczogYW55KSB7XG5cdFx0Y29uc3Qgb1RleHRBbm5vdGF0aW9uID0gb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl0sXG5cdFx0XHRvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA9XG5cdFx0XHRcdG9UZXh0QW5ub3RhdGlvbiAmJlxuXHRcdFx0XHQoKG9Qcm9wZXJ0eUFubm90YXRpb25zICYmXG5cdFx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCJdKSB8fFxuXHRcdFx0XHRcdChvQ29sbGVjdGlvbkFubm90YXRpb25zICYmIG9Db2xsZWN0aW9uQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCJdKSk7XG5cblx0XHRpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24pIHtcblx0XHRcdGlmIChvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCIpIHtcblx0XHRcdFx0cmV0dXJuIFwiRGVzY3JpcHRpb25cIjtcblx0XHRcdH0gZWxzZSBpZiAob1RleHRBcnJhbmdlbWVudEFubm90YXRpb24uJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0TGFzdFwiKSB7XG5cdFx0XHRcdHJldHVybiBcIlZhbHVlRGVzY3JpcHRpb25cIjtcblx0XHRcdH1cblx0XHRcdC8vRGVmYXVsdCBzaG91bGQgYmUgVGV4dEZpcnN0IGlmIHRoZXJlIGlzIGEgVGV4dCBhbm5vdGF0aW9uIGFuZCBuZWl0aGVyIFRleHRPbmx5IG5vciBUZXh0TGFzdCBhcmUgc2V0XG5cdFx0XHRyZXR1cm4gXCJEZXNjcmlwdGlvblZhbHVlXCI7XG5cdFx0fVxuXHRcdHJldHVybiBvVGV4dEFubm90YXRpb24gPyBcIkRlc2NyaXB0aW9uVmFsdWVcIiA6IFwiVmFsdWVcIjtcblx0fSxcblx0YnVpbGRFeHByZXNzaW9uRm9yVGV4dFZhbHVlOiBmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogYW55LCBvRGF0YUZpZWxkOiBhbnkpIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0RhdGFGaWVsZC5jb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgc1BhdGggPSBvRGF0YUZpZWxkLmNvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IG9UZXh0QW5ub3RhdGlvbkNvbnRleHQgPSBvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke3NQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dGApO1xuXHRcdGNvbnN0IG9UZXh0QW5ub3RhdGlvbiA9IG9UZXh0QW5ub3RhdGlvbkNvbnRleHQuZ2V0UHJvcGVydHkoKTtcblx0XHRjb25zdCBzVGV4dEV4cHJlc3Npb24gPSBvVGV4dEFubm90YXRpb24gPyBBbm5vdGF0aW9uSGVscGVyLnZhbHVlKG9UZXh0QW5ub3RhdGlvbiwgeyBjb250ZXh0OiBvVGV4dEFubm90YXRpb25Db250ZXh0IH0pIDogdW5kZWZpbmVkO1xuXHRcdGxldCBzRXhwcmVzc2lvbjogc3RyaW5nIHwgdW5kZWZpbmVkID0gXCJcIjtcblx0XHRzUHJvcGVydHlQYXRoID0gQW5ub3RhdGlvbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChzUHJvcGVydHlQYXRoKTtcblx0XHRpZiAoc1Byb3BlcnR5UGF0aC5pbmRleE9mKFwiL1wiKSA+IC0xICYmIHNUZXh0RXhwcmVzc2lvbikge1xuXHRcdFx0c0V4cHJlc3Npb24gPSBzUHJvcGVydHlQYXRoLnJlcGxhY2UoL1teXFwvXSokLywgc1RleHRFeHByZXNzaW9uLnN1YnN0cigxLCBzVGV4dEV4cHJlc3Npb24ubGVuZ3RoIC0gMikpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzRXhwcmVzc2lvbiA9IHNUZXh0RXhwcmVzc2lvbjtcblx0XHR9XG5cdFx0aWYgKHNFeHByZXNzaW9uKSB7XG5cdFx0XHRzRXhwcmVzc2lvbiA9IFwieyBwYXRoIDogJ1wiICsgc0V4cHJlc3Npb24ucmVwbGFjZSgvXlxceysvZywgXCJcIikucmVwbGFjZSgvXFx9KyQvZywgXCJcIikgKyBcIicsIHBhcmFtZXRlcnM6IHsnJCRub1BhdGNoJzogdHJ1ZX19XCI7XG5cdFx0fVxuXHRcdHJldHVybiBzRXhwcmVzc2lvbjtcblx0fSxcblxuXHRidWlsZFRhcmdldFBhdGhGcm9tRGF0YU1vZGVsT2JqZWN0UGF0aDogZnVuY3Rpb24gKG9EYXRhTW9kZWxPYmplY3RQYXRoOiBhbnkpIHtcblx0XHRjb25zdCBzU2FydEVudGl0eVNldCA9IG9EYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0Lm5hbWU7XG5cdFx0bGV0IHNQYXRoID0gYC8ke3NTYXJ0RW50aXR5U2V0fWA7XG5cdFx0Y29uc3QgYU5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gb0RhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXM7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhTmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHNQYXRoICs9IGAvJHthTmF2aWdhdGlvblByb3BlcnRpZXNbaV0ubmFtZX1gO1xuXHRcdH1cblx0XHRyZXR1cm4gc1BhdGg7XG5cdH0sXG5cdGhhc1NlbWFudGljT2JqZWN0VGFyZ2V0czogZnVuY3Rpb24gKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRjb25zdCBvUHJvcGVydHlEZWZpbml0aW9uID0gaXNQcm9wZXJ0eShvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdClcblx0XHRcdD8gb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Rcblx0XHRcdDogKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LiR0YXJnZXQgYXMgUHJvcGVydHkpO1xuXHRcdGNvbnN0IHNTZW1hbnRpY09iamVjdCA9IG9Qcm9wZXJ0eURlZmluaXRpb24uYW5ub3RhdGlvbnM/LkNvbW1vbj8uU2VtYW50aWNPYmplY3Q7XG5cdFx0Y29uc3QgYVNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zID0gb1Byb3BlcnR5RGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucztcblx0XHRjb25zdCBzUHJvcGVydHlMb2NhdGlvblBhdGggPSBGaWVsZEhlbHBlci5idWlsZFRhcmdldFBhdGhGcm9tRGF0YU1vZGVsT2JqZWN0UGF0aChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gYCR7c1Byb3BlcnR5TG9jYXRpb25QYXRofS8ke29Qcm9wZXJ0eURlZmluaXRpb24ubmFtZX1gO1xuXHRcdGxldCBzQmluZGluZ0V4cHJlc3Npb247XG5cdFx0aWYgKChzU2VtYW50aWNPYmplY3QgYXMgYW55KT8ucGF0aCkge1xuXHRcdFx0c0JpbmRpbmdFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24ocGF0aEluTW9kZWwoKHNTZW1hbnRpY09iamVjdCBhcyBhbnkpLnBhdGgpKTtcblx0XHR9XG5cdFx0aWYgKHNQcm9wZXJ0eVBhdGggJiYgKHNCaW5kaW5nRXhwcmVzc2lvbiB8fCAoc1NlbWFudGljT2JqZWN0Py52YWx1ZU9mKCkgYXMgYW55KT8ubGVuZ3RoID4gMCkpIHtcblx0XHRcdGNvbnN0IHNBbHRlcm5hdGVQYXRoID0gc1Byb3BlcnR5UGF0aC5yZXBsYWNlKC9cXC8vZywgXCJfXCIpOyAvL3JlcGxhY2VBbGwoXCIvXCIsXCJfXCIpO1xuXHRcdFx0aWYgKCFzQmluZGluZ0V4cHJlc3Npb24pIHtcblx0XHRcdFx0Y29uc3Qgc0JpbmRpbmdQYXRoID1cblx0XHRcdFx0XHRcInBhZ2VJbnRlcm5hbD5zZW1hbnRpY3NUYXJnZXRzL1wiICtcblx0XHRcdFx0XHRzU2VtYW50aWNPYmplY3Q/LnZhbHVlT2YoKSArXG5cdFx0XHRcdFx0XCIvXCIgK1xuXHRcdFx0XHRcdHNBbHRlcm5hdGVQYXRoICtcblx0XHRcdFx0XHQoIWFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA/IFwiL0hhc1RhcmdldHNOb3RGaWx0ZXJlZFwiIDogXCIvSGFzVGFyZ2V0c1wiKTtcblx0XHRcdFx0cmV0dXJuIFwie3BhcnRzOlt7cGF0aDonXCIgKyBzQmluZGluZ1BhdGggKyBcIid9XSwgZm9ybWF0dGVyOidGaWVsZFJ1bnRpbWUuaGFzVGFyZ2V0cyd9XCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBTZW1hbnRpYyBPYmplY3QgTmFtZSBpcyBhIHBhdGggd2UgcmV0dXJuIHVuZGVmaW5lZFxuXHRcdFx0XHQvLyB0aGlzIHdpbGwgYmUgdXBkYXRlZCBsYXRlciB2aWEgbW9kZWxDb250ZXh0Q2hhbmdlXG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdGdldFN0YXRlRGVwZW5kaW5nT25TZW1hbnRpY09iamVjdFRhcmdldHM6IGZ1bmN0aW9uIChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5RGVmaW5pdGlvbiA9IGlzUHJvcGVydHkob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QpXG5cdFx0XHQ/IG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0XG5cdFx0XHQ6IChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC4kdGFyZ2V0IGFzIFByb3BlcnR5KTtcblx0XHRjb25zdCBzU2VtYW50aWNPYmplY3QgPSBvUHJvcGVydHlEZWZpbml0aW9uLmFubm90YXRpb25zPy5Db21tb24/LlNlbWFudGljT2JqZWN0O1xuXHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA9IG9Qcm9wZXJ0eURlZmluaXRpb24uYW5ub3RhdGlvbnM/LkNvbW1vbj8uU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5TG9jYXRpb25QYXRoID0gRmllbGRIZWxwZXIuYnVpbGRUYXJnZXRQYXRoRnJvbURhdGFNb2RlbE9iamVjdFBhdGgob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IGAke3NQcm9wZXJ0eUxvY2F0aW9uUGF0aH0vJHtvUHJvcGVydHlEZWZpbml0aW9uLm5hbWV9YDtcblx0XHRsZXQgc0JpbmRpbmdFeHByZXNzaW9uO1xuXHRcdGlmICgoc1NlbWFudGljT2JqZWN0IGFzIGFueSk/LnBhdGgpIHtcblx0XHRcdHNCaW5kaW5nRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKHBhdGhJbk1vZGVsKChzU2VtYW50aWNPYmplY3QgYXMgYW55KS5wYXRoKSk7XG5cdFx0fVxuXHRcdGlmIChzUHJvcGVydHlQYXRoICYmIChzQmluZGluZ0V4cHJlc3Npb24gfHwgKHNTZW1hbnRpY09iamVjdD8udmFsdWVPZigpIGFzIGFueSk/Lmxlbmd0aCA+IDApKSB7XG5cdFx0XHRjb25zdCBzQWx0ZXJuYXRlUGF0aCA9IHNQcm9wZXJ0eVBhdGgucmVwbGFjZSgvXFwvL2csIFwiX1wiKTtcblx0XHRcdGlmICghc0JpbmRpbmdFeHByZXNzaW9uKSB7XG5cdFx0XHRcdGNvbnN0IHNCaW5kaW5nUGF0aCA9IGBwYWdlSW50ZXJuYWw+c2VtYW50aWNzVGFyZ2V0cy8ke3NTZW1hbnRpY09iamVjdD8udmFsdWVPZigpfS8ke3NBbHRlcm5hdGVQYXRofSR7XG5cdFx0XHRcdFx0IWFTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucyA/IFwiL0hhc1RhcmdldHNOb3RGaWx0ZXJlZFwiIDogXCIvSGFzVGFyZ2V0c1wiXG5cdFx0XHRcdH1gO1xuXHRcdFx0XHRyZXR1cm4gYHtwYXJ0czpbe3BhdGg6JyR7c0JpbmRpbmdQYXRofSd9XSwgZm9ybWF0dGVyOidGaWVsZFJ1bnRpbWUuZ2V0U3RhdGVEZXBlbmRpbmdPblNlbWFudGljT2JqZWN0VGFyZ2V0cyd9YDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBcIkluZm9ybWF0aW9uXCI7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBcIk5vbmVcIjtcblx0XHR9XG5cdH0sXG5cdGlzTm90QWx3YXlzSGlkZGVuOiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBvRGV0YWlsczogYW55KSB7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSBvRGV0YWlscy5jb250ZXh0O1xuXHRcdGxldCBpc0Fsd2F5c0hpZGRlbjogYW55ID0gZmFsc2U7XG5cdFx0aWYgKG9EYXRhRmllbGQuVmFsdWUgJiYgb0RhdGFGaWVsZC5WYWx1ZS4kUGF0aCkge1xuXHRcdFx0aXNBbHdheXNIaWRkZW4gPSBvQ29udGV4dC5nZXRPYmplY3QoXCJWYWx1ZS8kUGF0aEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIik7XG5cdFx0fVxuXHRcdGlmICghaXNBbHdheXNIaWRkZW4gfHwgaXNBbHdheXNIaWRkZW4uJFBhdGgpIHtcblx0XHRcdGlzQWx3YXlzSGlkZGVuID0gb0NvbnRleHQuZ2V0T2JqZWN0KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiKTtcblx0XHRcdGlmICghaXNBbHdheXNIaWRkZW4gfHwgaXNBbHdheXNIaWRkZW4uJFBhdGgpIHtcblx0XHRcdFx0aXNBbHdheXNIaWRkZW4gPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuICFpc0Fsd2F5c0hpZGRlbjtcblx0fSxcblx0aXNEcmFmdEluZGljYXRvclZpc2libGVJbkZpZWxkR3JvdXA6IGZ1bmN0aW9uIChjb2x1bW46IGFueSkge1xuXHRcdGlmIChcblx0XHRcdGNvbHVtbiAmJlxuXHRcdFx0Y29sdW1uLmZvcm1hdE9wdGlvbnMgJiZcblx0XHRcdGNvbHVtbi5mb3JtYXRPcHRpb25zLmZpZWxkR3JvdXBEcmFmdEluZGljYXRvclByb3BlcnR5UGF0aCAmJlxuXHRcdFx0Y29sdW1uLmZvcm1hdE9wdGlvbnMuZmllbGRHcm91cE5hbWVcblx0XHQpIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFwie3BhcnRzOiBbXCIgK1xuXHRcdFx0XHRcInt2YWx1ZTogJ1wiICtcblx0XHRcdFx0Y29sdW1uLmZvcm1hdE9wdGlvbnMuZmllbGRHcm91cE5hbWUgK1xuXHRcdFx0XHRcIid9LFwiICtcblx0XHRcdFx0XCJ7cGF0aDogJ2ludGVybmFsPnNlbWFudGljS2V5SGFzRHJhZnRJbmRpY2F0b3InfSAsIFwiICtcblx0XHRcdFx0XCJ7cGF0aDogJ0hhc0RyYWZ0RW50aXR5JywgdGFyZ2V0VHlwZTogJ2FueSd9LCBcIiArXG5cdFx0XHRcdFwie3BhdGg6ICdJc0FjdGl2ZUVudGl0eScsIHRhcmdldFR5cGU6ICdhbnknfSwgXCIgK1xuXHRcdFx0XHRcIntwYXRoOiAncGFnZUludGVybmFsPmhpZGVEcmFmdEluZm8nLCB0YXJnZXRUeXBlOiAnYW55J31dLCBcIiArXG5cdFx0XHRcdFwiZm9ybWF0dGVyOiAnc2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZFJ1bnRpbWUuaXNEcmFmdEluZGljYXRvclZpc2libGUnfVwiXG5cdFx0XHQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXHRpc1JlcXVpcmVkOiBmdW5jdGlvbiAob0ZpZWxkQ29udHJvbDogYW55LCBzRWRpdE1vZGU6IGFueSkge1xuXHRcdGlmIChzRWRpdE1vZGUgPT09IFwiRGlzcGxheVwiIHx8IHNFZGl0TW9kZSA9PT0gXCJSZWFkT25seVwiIHx8IHNFZGl0TW9kZSA9PT0gXCJEaXNhYmxlZFwiKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdGlmIChvRmllbGRDb250cm9sKSB7XG5cdFx0XHRpZiAoKE1hbmFnZWRPYmplY3QgYXMgYW55KS5iaW5kaW5nUGFyc2VyKG9GaWVsZENvbnRyb2wpKSB7XG5cdFx0XHRcdHJldHVybiBcIns9ICVcIiArIG9GaWVsZENvbnRyb2wgKyBcIiA9PT0gN31cIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBvRmllbGRDb250cm9sID09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFR5cGUvTWFuZGF0b3J5XCI7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblxuXHRnZXRBY3Rpb25QYXJhbWV0ZXJWaXNpYmlsaXR5OiBmdW5jdGlvbiAob1BhcmFtOiBhbnksIG9Db250ZXh0OiBhbnkpIHtcblx0XHQvLyBUbyB1c2UgdGhlIFVJLkhpZGRlbiBhbm5vdGF0aW9uIGZvciBjb250cm9sbGluZyB2aXNpYmlsaXR5IHRoZSB2YWx1ZSBuZWVkcyB0byBiZSBuZWdhdGVkXG5cdFx0aWYgKHR5cGVvZiBvUGFyYW0gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdGlmIChvUGFyYW0gJiYgb1BhcmFtLiRJZiAmJiBvUGFyYW0uJElmLmxlbmd0aCA9PT0gMykge1xuXHRcdFx0XHQvLyBJbiBjYXNlIHRoZSBVSS5IaWRkZW4gY29udGFpbnMgYSBkeW5hbWljIGV4cHJlc3Npb24gd2UgZG8gdGhpc1xuXHRcdFx0XHQvLyBieSBqdXN0IHN3aXRjaGluZyB0aGUgXCJ0aGVuXCIgYW5kIFwiZWxzZVwiIHBhcnQgb2YgdGhlIGVycHJlc3Npb25cblx0XHRcdFx0Ly8gb1BhcmFtLiRJZlswXSA8PT0gQ29uZGl0aW9uIHBhcnRcblx0XHRcdFx0Ly8gb1BhcmFtLiRJZlsxXSA8PT0gVGhlbiBwYXJ0XG5cdFx0XHRcdC8vIG9QYXJhbS4kSWZbMl0gPD09IEVsc2UgcGFydFxuXHRcdFx0XHRjb25zdCBvTmVnUGFyYW06IGFueSA9IHsgJElmOiBbXSB9O1xuXHRcdFx0XHRvTmVnUGFyYW0uJElmWzBdID0gb1BhcmFtLiRJZlswXTtcblx0XHRcdFx0b05lZ1BhcmFtLiRJZlsxXSA9IG9QYXJhbS4kSWZbMl07XG5cdFx0XHRcdG9OZWdQYXJhbS4kSWZbMl0gPSBvUGFyYW0uJElmWzFdO1xuXHRcdFx0XHRyZXR1cm4gQW5ub3RhdGlvbkhlbHBlci52YWx1ZShvTmVnUGFyYW0sIG9Db250ZXh0KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBcIns9ICEle1wiICsgb1BhcmFtLiRQYXRoICsgXCJ9IH1cIjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKHR5cGVvZiBvUGFyYW0gPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRyZXR1cm4gQW5ub3RhdGlvbkhlbHBlci52YWx1ZSghb1BhcmFtLCBvQ29udGV4dCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDb21wdXRlZCBhbm5vdGF0aW9uIHRoYXQgcmV0dXJucyB2UHJvcGVydHkgZm9yIGEgc3RyaW5nIGFuZCBAc2FwdWkubmFtZSBmb3IgYW4gb2JqZWN0LlxuXHQgKlxuXHQgKiBAcGFyYW0gdlByb3BlcnR5IFRoZSBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gb0ludGVyZmFjZSBUaGUgaW50ZXJmYWNlIGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIFRoZSBwcm9wZXJ0eSBuYW1lXG5cdCAqL1xuXHRwcm9wZXJ0eU5hbWU6IGZ1bmN0aW9uICh2UHJvcGVydHk6IGFueSwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0bGV0IHNQcm9wZXJ0eU5hbWU7XG5cdFx0aWYgKHR5cGVvZiB2UHJvcGVydHkgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdGlmIChvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UGF0aCgpLmluZGV4T2YoXCIkUGF0aFwiKSA+IC0xIHx8IG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCkuaW5kZXhPZihcIiRQcm9wZXJ0eVBhdGhcIikgPiAtMSkge1xuXHRcdFx0XHQvLyBXZSBjb3VsZCBlbmQgdXAgd2l0aCBhIHB1cmUgc3RyaW5nIHByb3BlcnR5IChubyAkUGF0aCksIGFuZCB0aGlzIGlzIG5vdCBhIHJlYWwgcHJvcGVydHkgaW4gdGhhdCBjYXNlXG5cdFx0XHRcdHNQcm9wZXJ0eU5hbWUgPSB2UHJvcGVydHk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmICh2UHJvcGVydHkuJFBhdGggfHwgdlByb3BlcnR5LiRQcm9wZXJ0eVBhdGgpIHtcblx0XHRcdGNvbnN0IHNQYXRoID0gdlByb3BlcnR5LiRQYXRoID8gXCIvJFBhdGhcIiA6IFwiLyRQcm9wZXJ0eVBhdGhcIjtcblx0XHRcdGNvbnN0IHNDb250ZXh0UGF0aCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0XHRzUHJvcGVydHlOYW1lID0gb0ludGVyZmFjZS5jb250ZXh0LmdldE9iamVjdChgJHtzQ29udGV4dFBhdGggKyBzUGF0aH0vJEBzYXB1aS5uYW1lYCk7XG5cdFx0fSBlbHNlIGlmICh2UHJvcGVydHkuVmFsdWUgJiYgdlByb3BlcnR5LlZhbHVlLiRQYXRoKSB7XG5cdFx0XHRzUHJvcGVydHlOYW1lID0gdlByb3BlcnR5LlZhbHVlLiRQYXRoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzUHJvcGVydHlOYW1lID0gb0ludGVyZmFjZS5jb250ZXh0LmdldE9iamVjdChcIkBzYXB1aS5uYW1lXCIpO1xuXHRcdH1cblxuXHRcdHJldHVybiBzUHJvcGVydHlOYW1lO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBUaGlzIG1ldGhvZCBnZXRGaWVsZEdyb3VwSURzIHVzZXMgYSBtYXAgc3RvcmVkIGluIHByZXByb2Nlc3NpbmcgZGF0YSBmb3IgdGhlIG1hY3JvIEZpZWxkXG5cdCAqIF9nZW5lcmF0ZVNpZGVFZmZlY3RzTWFwIGdlbmVyYXRlcyB0aGlzIG1hcCBvbmNlIGR1cmluZyB0ZW1wbGF0aW5nIGZvciB0aGUgZmlyc3QgbWFjcm8gZmllbGRcblx0ICogYW5kIHRoZW4gcmV1c2VzIGl0LiBNYXAgZXhpc3RzIG9ubHkgZHVyaW5nIHRlbXBsYXRpbmcuXG5cdCAqIFRoZSBtYXAgaXMgdXNlZCB0byBzZXQgdGhlIGZpZWxkIGdyb3VwIElEcyBmb3IgdGhlIG1hY3JvIGZpZWxkLlxuXHQgKiBBIGZpZWxkIGdyb3VwIElEIGhhcyB0aGUgZm9ybWF0IC0tIG5hbWVzcGFjZS5vZi5lbnRpdHlUeXBlI1F1YWxpZmllclxuXHQgKiB3aGVyZSAnbmFtZXNwYWNlLm9mLmVudGl0eVR5cGUnIGlzIHRoZSB0YXJnZXQgZW50aXR5IHR5cGUgb2YgdGhlIHNpZGUgZWZmZWN0IGFubm90YXRpb25cblx0ICogYW5kICdRdWFsaWZpZXInIGlzIHRoZSBxdWFsaWZpZmVyIG9mIHRoZSBzaWRlIGVmZmVjdCBhbm5vdGF0aW9uLlxuXHQgKiBUaGlzIGluZm9ybWF0aW9uIGlzIGVub3VnaCB0byBpZGVudGlmeSB0aGUgc2lkZSBlZmZlY3QgYW5ub3RhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgaW5zdGFuY2Vcblx0ICogQHBhcmFtIHNQcm9wZXJ0eVBhdGggUHJvcGVydHkgcGF0aFxuXHQgKiBAcmV0dXJucyBBIHByb21pc2Ugd2hpY2ggcHJvdmlkZXMgYSBzdHJpbmcgb2YgZmllbGQgZ3JvdXAgSURzIHNlcGFyYXRlZCBieSBhIGNvbW1hXG5cdCAqL1xuXHRnZXRGaWVsZEdyb3VwSWRzOiBmdW5jdGlvbiAob0NvbnRleHQ6IGFueSwgc1Byb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0aWYgKCFzUHJvcGVydHlQYXRoKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRjb25zdCBvSW50ZXJmYWNlID0gb0NvbnRleHQuZ2V0SW50ZXJmYWNlKDApO1xuXHRcdC8vIGdlbmVyYXRlIHRoZSBtYXBwaW5nIGZvciBzaWRlIGVmZmVjdHMgb3IgZ2V0IHRoZSBnZW5lcmF0ZWQgbWFwIGlmIGl0IGlzIGFscmVhZHkgZ2VuZXJhdGVkXG5cdFx0cmV0dXJuIF9nZW5lcmF0ZVNpZGVFZmZlY3RzTWFwKG9JbnRlcmZhY2UpLnRoZW4oZnVuY3Rpb24gKG9TaWRlRWZmZWN0czogYW55KSB7XG5cdFx0XHRjb25zdCBvRmllbGRTZXR0aW5ncyA9IG9JbnRlcmZhY2UuZ2V0U2V0dGluZyhcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwuRmllbGRcIik7XG5cdFx0XHRvRmllbGRTZXR0aW5ncy5zaWRlRWZmZWN0cyA9IG9TaWRlRWZmZWN0cztcblx0XHRcdGNvbnN0IHNPd25lckVudGl0eVR5cGUgPSBvQ29udGV4dC5nZXRQYXRoKDEpLnN1YnN0cigxKTtcblx0XHRcdGNvbnN0IGFGaWVsZEdyb3VwSWRzID0gRmllbGRIZWxwZXIuZ2V0U2lkZUVmZmVjdHNPbkVudGl0eUFuZFByb3BlcnR5KHNQcm9wZXJ0eVBhdGgsIHNPd25lckVudGl0eVR5cGUsIG9TaWRlRWZmZWN0cyk7XG5cdFx0XHRsZXQgc0ZpZWxkR3JvdXBJZHM7XG5cblx0XHRcdGlmIChhRmllbGRHcm91cElkcy5sZW5ndGgpIHtcblx0XHRcdFx0c0ZpZWxkR3JvdXBJZHMgPSBhRmllbGRHcm91cElkcy5yZWR1Y2UoZnVuY3Rpb24gKHNSZXN1bHQ6IGFueSwgc0lkOiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gKHNSZXN1bHQgJiYgYCR7c1Jlc3VsdH0sJHtzSWR9YCkgfHwgc0lkO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzRmllbGRHcm91cElkczsgLy9cIklEMSxJRDIsSUQzLi4uXCJcblx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogR2VuZXJhdGUgbWFwIHdoaWNoIGhhcyBkYXRhIGZyb20gc291cmNlIGVudGl0eSBhcyB3ZWxsIGFzIHNvdXJjZSBwcm9wZXJ0eSBmb3IgYSBnaXZlbiBmaWVsZC5cblx0ICpcblx0ICogQHBhcmFtIHNQYXRoXG5cdCAqIEBwYXJhbSBzT3duZXJFbnRpdHlUeXBlXG5cdCAqIEBwYXJhbSBvU2lkZUVmZmVjdHNcblx0ICogQHJldHVybnMgQW4gYXJyYXkgb2Ygc2lkZSBFZmZlY3QgSWRzLlxuXHQgKi9cblx0Z2V0U2lkZUVmZmVjdHNPbkVudGl0eUFuZFByb3BlcnR5OiBmdW5jdGlvbiAoc1BhdGg6IHN0cmluZywgc093bmVyRW50aXR5VHlwZTogc3RyaW5nLCBvU2lkZUVmZmVjdHM6IGFueSkge1xuXHRcdGNvbnN0IGJJc05hdmlnYXRpb25QYXRoID0gc1BhdGguaW5kZXhPZihcIi9cIikgPiAwO1xuXHRcdHNQYXRoID0gYklzTmF2aWdhdGlvblBhdGggPyBzUGF0aC5zdWJzdHIoc1BhdGgubGFzdEluZGV4T2YoXCIvXCIpICsgMSkgOiBzUGF0aDtcblx0XHQvLyBhZGQgdG8gZmllbGRHcm91cElkcywgYWxsIHNpZGUgZWZmZWN0cyB3aGljaCBtZW50aW9uIHNQYXRoIGFzIHNvdXJjZSBwcm9wZXJ0eSBvciBzT3duZXJFbnRpdHlUeXBlIGFzIHNvdXJjZSBlbnRpdHlcblx0XHRyZXR1cm4gKFxuXHRcdFx0KG9TaWRlRWZmZWN0c1tzT3duZXJFbnRpdHlUeXBlXSAmJiBvU2lkZUVmZmVjdHNbc093bmVyRW50aXR5VHlwZV1bMF0uY29uY2F0KG9TaWRlRWZmZWN0c1tzT3duZXJFbnRpdHlUeXBlXVsxXVtzUGF0aF0gfHwgW10pKSB8fFxuXHRcdFx0W11cblx0XHQpO1xuXHR9LFxuXG5cdGZpZWxkQ29udHJvbDogZnVuY3Rpb24gKHNQcm9wZXJ0eVBhdGg6IGFueSwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0ludGVyZmFjZSAmJiBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRjb25zdCBzUGF0aCA9IG9JbnRlcmZhY2UgJiYgb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKTtcblx0XHRjb25zdCBvRmllbGRDb250cm9sQ29udGV4dCA9IG9Nb2RlbCAmJiBvTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYCR7c1BhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xgKTtcblx0XHRjb25zdCBvRmllbGRDb250cm9sID0gb0ZpZWxkQ29udHJvbENvbnRleHQgJiYgb0ZpZWxkQ29udHJvbENvbnRleHQuZ2V0UHJvcGVydHkoKTtcblx0XHRpZiAob0ZpZWxkQ29udHJvbCkge1xuXHRcdFx0aWYgKG9GaWVsZENvbnRyb2wuaGFzT3duUHJvcGVydHkoXCIkRW51bU1lbWJlclwiKSkge1xuXHRcdFx0XHRyZXR1cm4gb0ZpZWxkQ29udHJvbC4kRW51bU1lbWJlcjtcblx0XHRcdH0gZWxzZSBpZiAob0ZpZWxkQ29udHJvbC5oYXNPd25Qcm9wZXJ0eShcIiRQYXRoXCIpKSB7XG5cdFx0XHRcdHJldHVybiBBbm5vdGF0aW9uSGVscGVyLnZhbHVlKG9GaWVsZENvbnRyb2wsIHsgY29udGV4dDogb0ZpZWxkQ29udHJvbENvbnRleHQgfSk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgbmF2aWdhdGlvbiBlbnRpdHkodGhlIGVudGl0eSB3aGVyZSBzaG91bGQgaSBsb29rIGZvciB0aGUgYXZhaWxhYmxlIHF1aWNrIHZpZXcgZmFjZXRzKVxuXHQgKiAgICAtTG9vcCBvdmVyIGFsbCBuYXZpZ2F0aW9uIHByb3BlcnR5XG5cdCAqICAgIC1Mb29rIGludG8gUmVmZXJlbnRpYWxDb25zdHJhaW50IGNvbnN0cmFpbnRcblx0ICogICAgLUlmIFJlZmVyZW50aWFsQ29uc3RyYWludC5Qcm9wZXJ0eSA9IHByb3BlcnR5KFNlbWFudGljIE9iamVjdCkgPT0+IHN1Y2Nlc3MgUXVpY2tWaWV3IEZhY2V0cyBmcm9tIHRoaXMgZW50aXR5IHR5cGUgY2FuIGJlIHJldHJpZXZlZFxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0TmF2aWdhdGlvbkVudGl0eVxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEhlbHBlci5qc1xuXHQgKiBAcGFyYW0ge29iamVjdH0gb1Byb3BlcnR5IHByb3BlcnR5IG9iamVjdCBvbiB3aGljaCBzZW1hbnRpYyBvYmplY3QgaXMgY29uZmlndXJlZFxuXHQgKiBAcGFyYW0ge29iamVjdH0gb0NvbnRleHQgTWV0YWRhdGEgQ29udGV4dChOb3QgcGFzc2VkIHdoZW4gY2FsbGVkIHdpdGggdGVtcGxhdGU6d2l0aClcblx0ICogQHJldHVybnMge3N0cmluZ3x1bmRlZmluZWR9IC0gaWYgY2FsbGVkIHdpdGggY29udGV4dCB0aGVuIG5hdmlnYXRpb24gZW50aXR5IHJlbGF0aXZlIGJpbmRpbmcgbGlrZSBcIntzdXBwbGllcn1cIiBpcyByZXR1cm5lZFxuXHQgKiAgICBlbHNlIGNvbnRleHQgcGF0aCBmb3IgbmF2aWdhdGlvbiBlbnRpdHkgZm9yIHRlbXBsYXRpbmcgaXMgcmV0dXJuZWQgIGUuZyDigJwvUHJvZHVjdHMvJFR5cGUvc3VwcGxpZXLigJ1cblx0ICogIHdoZXJlIFByb2R1Y3RzIC0gUGFyZW50IGVudGl0eSwgc3VwcGxpZXIgLSBOYXZpZ2F0aW9uIGVudGl0eSBuYW1lXG5cdCAqL1xuXG5cdGdldE5hdmlnYXRpb25FbnRpdHk6IGZ1bmN0aW9uIChvUHJvcGVydHk6IGFueSwgb0NvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IG9Db250ZXh0T2JqZWN0ID0gKG9Db250ZXh0ICYmIG9Db250ZXh0LmNvbnRleHQpIHx8IG9Qcm9wZXJ0eTtcblx0XHQvL0dldCB0aGUgZW50aXR5IHR5cGUgcGF0aCBleC4gL1Byb2R1Y3RzLyRUeXBlIGZyb20gL1Byb2R1Y3RzLyRUeXBlQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm8vRGVzY3JpcHRpb24vVmFsdWUuLi5cblx0XHRsZXQgc05hdmlnYXRpb25QYXJ0ID0gXCJcIjtcblx0XHRsZXQgc05hdmlnYXRpb25QYXRoID0gYCR7QW5ub3RhdGlvbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChvQ29udGV4dE9iamVjdC5nZXRQYXRoKCkpfS9gO1xuXHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBvQ29udGV4dE9iamVjdC5nZXRPYmplY3QoKS4kUGF0aDtcblx0XHRjb25zdCBzUHJvcGVydHlOYW1lID0gc1Byb3BlcnR5UGF0aC5zcGxpdChcIi9cIikucG9wKCk7XG5cblx0XHRpZiAoc05hdmlnYXRpb25QYXRoLmluZGV4T2Yoc1Byb3BlcnR5UGF0aCkgPiAtMSkge1xuXHRcdFx0c05hdmlnYXRpb25QYXRoID0gc05hdmlnYXRpb25QYXRoLnNwbGl0KHNQcm9wZXJ0eVBhdGgpWzBdO1xuXHRcdH1cblxuXHRcdGlmIChzUHJvcGVydHlQYXRoLmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdC8vIE5hdmlnYXRpb24gcHJvcGVydHkgZGV0ZWN0ZWQuXG5cdFx0XHRzTmF2aWdhdGlvblBhcnQgPSBgJHtzUHJvcGVydHlQYXRoLnN1YnN0cmluZygwLCBzUHJvcGVydHlQYXRoLmxhc3RJbmRleE9mKFwiL1wiKSl9L2A7XG5cdFx0XHRzTmF2aWdhdGlvblBhdGggKz0gc05hdmlnYXRpb25QYXJ0O1xuXHRcdH1cblxuXHRcdC8vR2V0IHRoZSBlbnRpdHkgdHlwZSBvYmplY3Rcblx0XHRjb25zdCBvRW50aXR5VHlwZSA9IG9Db250ZXh0T2JqZWN0LmdldE9iamVjdChzTmF2aWdhdGlvblBhdGgpLFxuXHRcdFx0Ly9HZXQgdGhlIG5hdmlnYXRpb24gZW50aXR5IGRldGFpbHNcblx0XHRcdGFLZXlzID0gT2JqZWN0LmtleXMob0VudGl0eVR5cGUpLFxuXHRcdFx0bGVuZ3RoID0gYUtleXMubGVuZ3RoO1xuXG5cdFx0Zm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRvRW50aXR5VHlwZVthS2V5c1tpbmRleF1dLiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmXG5cdFx0XHRcdG9FbnRpdHlUeXBlW2FLZXlzW2luZGV4XV0uJFJlZmVyZW50aWFsQ29uc3RyYWludCAmJlxuXHRcdFx0XHRvRW50aXR5VHlwZVthS2V5c1tpbmRleF1dLiRSZWZlcmVudGlhbENvbnN0cmFpbnQuaGFzT3duUHJvcGVydHkoc1Byb3BlcnR5TmFtZSlcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRleHQgPyBBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25CaW5kaW5nKHNOYXZpZ2F0aW9uUGFydCArIGFLZXlzW2luZGV4XSkgOiBzTmF2aWdhdGlvblBhdGggKyBhS2V5c1tpbmRleF07XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChvRW50aXR5VHlwZVtcIiRLZXlcIl0uaW5jbHVkZXMoc1Byb3BlcnR5TmFtZSkpIHtcblx0XHRcdC8vcmV0dXJuIHNOYXZpZ2F0aW9uUGF0aCArIHNQcm9wZXJ0eU5hbWU7XG5cdFx0XHRyZXR1cm4gb0NvbnRleHQgPyBBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25CaW5kaW5nKHNOYXZpZ2F0aW9uUGFydCkgOiBzTmF2aWdhdGlvblBhdGg7XG5cdFx0fVxuXHRcdGNvbnN0IG9Bbm5vdGF0aW9ucyA9IG9Db250ZXh0T2JqZWN0LmdldE9iamVjdChzTmF2aWdhdGlvblBhdGggKyBcIkBcIik7XG5cdFx0Zm9yIChjb25zdCBzaW5nbGVBbm5vdGF0aW9uIGluIG9Bbm5vdGF0aW9ucykge1xuXHRcdFx0aWYgKHNpbmdsZUFubm90YXRpb24uaW5jbHVkZXMoXCJTZW1hbnRpY0tleVwiKSkge1xuXHRcdFx0XHRpZiAob0Fubm90YXRpb25zW3NpbmdsZUFubm90YXRpb25dWzBdLiRQcm9wZXJ0eVBhdGggPT09IHNQcm9wZXJ0eU5hbWUpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0NvbnRleHQgPyBBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25CaW5kaW5nKHNOYXZpZ2F0aW9uUGFydCkgOiBzTmF2aWdhdGlvblBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgdmFsdWUgaGVscCBwcm9wZXJ0eSBmcm9tIGEgRGF0YUZpZWxkIG9yIGEgUHJvcGVydHlQYXRoIChpbiBjYXNlIGEgU2VsZWN0aW9uRmllbGQgaXMgdXNlZClcblx0ICogUHJpb3JpdHkgZnJvbSB3aGVyZSB0byBnZXQgdGhlIHByb3BlcnR5IHZhbHVlIG9mIHRoZSBmaWVsZCAoZXhhbXBsZXMgYXJlIFwiTmFtZVwiIGFuZCBcIlN1cHBsaWVyXCIpOlxuXHQgKiAxLiBJZiBvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpIGhhcyBrZXkgJyRQYXRoJywgdGhlbiB3ZSB0YWtlIHRoZSB2YWx1ZSBhdCAnJFBhdGgnLlxuXHQgKiAyLiBFbHNlLCB2YWx1ZSBhdCBvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpLlxuXHQgKiBJZiB0aGVyZSBpcyBhbiBJU09DdXJyZW5jeSBvciBpZiB0aGVyZSBhcmUgVW5pdCBhbm5vdGF0aW9ucyBmb3IgdGhlIGZpZWxkIHByb3BlcnR5LFxuXHQgKiB0aGVuIHRoZSBQYXRoIGF0IHRoZSBJU09DdXJyZW5jeSBvciBVbml0IGFubm90YXRpb25zIG9mIHRoZSBmaWVsZCBwcm9wZXJ0eSBpcyBjb25zaWRlcmVkLlxuXHQgKlxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEhlbHBlci5qc1xuXHQgKiBAcGFyYW0gb1Byb3BlcnR5Q29udGV4dCBUaGUgY29udGV4dCBmcm9tIHdoaWNoIHZhbHVlIGhlbHAgcHJvcGVydHkgbmVlZCB0byBiZSBleHRyYWN0ZWQuXG5cdCAqIEBwYXJhbSBiSW5GaWx0ZXJGaWVsZCBXaGV0aGVyIG9yIG5vdCB3ZSdyZSBpbiB0aGUgZmlsdGVyIGZpZWxkIGFuZCBzaG91bGQgaWdub3JlXG5cdCAqIEByZXR1cm5zIFRoZSB2YWx1ZSBoZWxwIHByb3BlcnR5IHBhdGhcblx0ICovXG5cdHZhbHVlSGVscFByb3BlcnR5OiBmdW5jdGlvbiAob1Byb3BlcnR5Q29udGV4dDogQ29udGV4dCwgYkluRmlsdGVyRmllbGQ/OiBib29sZWFuKSB7XG5cdFx0LyogRm9yIGN1cnJlbmN5IChhbmQgbGF0ZXIgVW5pdCkgd2UgbmVlZCB0byBmb3J3YXJkIHRoZSB2YWx1ZSBoZWxwIHRvIHRoZSBhbm5vdGF0ZWQgZmllbGQgKi9cblx0XHRjb25zdCBzQ29udGV4dFBhdGggPSBvUHJvcGVydHlDb250ZXh0LmdldFBhdGgoKTtcblx0XHRjb25zdCBvQ29udGVudCA9IG9Qcm9wZXJ0eUNvbnRleHQuZ2V0T2JqZWN0KCkgfHwge307XG5cdFx0bGV0IHNQYXRoID0gb0NvbnRlbnQuJFBhdGggPyBgJHtzQ29udGV4dFBhdGh9LyRQYXRoYCA6IHNDb250ZXh0UGF0aDtcblx0XHRjb25zdCBzQW5ub1BhdGggPSBgJHtzUGF0aH1AYDtcblx0XHRjb25zdCBvUHJvcGVydHlBbm5vdGF0aW9ucyA9IG9Qcm9wZXJ0eUNvbnRleHQuZ2V0T2JqZWN0KHNBbm5vUGF0aCk7XG5cdFx0bGV0IHNBbm5vdGF0aW9uO1xuXHRcdGlmIChvUHJvcGVydHlBbm5vdGF0aW9ucykge1xuXHRcdFx0c0Fubm90YXRpb24gPVxuXHRcdFx0XHQob1Byb3BlcnR5QW5ub3RhdGlvbnMuaGFzT3duUHJvcGVydHkoSVNPQ3VycmVuY3kpICYmIElTT0N1cnJlbmN5KSB8fCAob1Byb3BlcnR5QW5ub3RhdGlvbnMuaGFzT3duUHJvcGVydHkoVW5pdCkgJiYgVW5pdCk7XG5cdFx0XHRpZiAoc0Fubm90YXRpb24gJiYgIWJJbkZpbHRlckZpZWxkKSB7XG5cdFx0XHRcdGNvbnN0IHNVbml0T3JDdXJyZW5jeVBhdGggPSBgJHtzUGF0aCArIHNBbm5vdGF0aW9ufS8kUGF0aGA7XG5cdFx0XHRcdC8vIHdlIGNoZWNrIHRoYXQgdGhlIGN1cnJlbmN5IG9yIHVuaXQgaXMgYSBQcm9wZXJ0eSBhbmQgbm90IGEgZml4ZWQgdmFsdWVcblx0XHRcdFx0aWYgKG9Qcm9wZXJ0eUNvbnRleHQuZ2V0T2JqZWN0KHNVbml0T3JDdXJyZW5jeVBhdGgpKSB7XG5cdFx0XHRcdFx0c1BhdGggPSBzVW5pdE9yQ3VycmVuY3lQYXRoO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzUGF0aDtcblx0fSxcblxuXHQvKipcblx0ICogRGVkaWNhdGVkIG1ldGhvZCB0byBhdm9pZCBsb29raW5nIGZvciB1bml0IHByb3BlcnRpZXMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvUHJvcGVydHlDb250ZXh0XG5cdCAqIEByZXR1cm5zIFRoZSB2YWx1ZSBoZWxwIHByb3BlcnR5IHBhdGhcblx0ICovXG5cdHZhbHVlSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGQ6IGZ1bmN0aW9uIChvUHJvcGVydHlDb250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gRmllbGRIZWxwZXIudmFsdWVIZWxwUHJvcGVydHkob1Byb3BlcnR5Q29udGV4dCwgdHJ1ZSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZW5lcmF0ZSB0aGUgSUQgZm9yIFZhbHVlIEhlbHAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRJREZvckZpZWxkVmFsdWVIZWxwXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkSGVscGVyLmpzXG5cdCAqIEBwYXJhbSBzRmxleElkIEZsZXggSUQgb2YgdGhlIGN1cnJlbnQgb2JqZWN0XG5cdCAqIEBwYXJhbSBzSWRQcmVmaXggUHJlZml4IGZvciB0aGUgVmFsdWVIZWxwIElEXG5cdCAqIEBwYXJhbSBzT3JpZ2luYWxQcm9wZXJ0eU5hbWUgTmFtZSBvZiB0aGUgcHJvcGVydHlcblx0ICogQHBhcmFtIHNQcm9wZXJ0eU5hbWUgTmFtZSBvZiB0aGUgVmFsdWVIZWxwIFByb3BlcnR5XG5cdCAqIEByZXR1cm5zIFRoZSBJRCBnZW5lcmF0ZWQgZm9yIHRoZSBWYWx1ZUhlbHBcblx0ICovXG5cdGdldElERm9yRmllbGRWYWx1ZUhlbHA6IGZ1bmN0aW9uIChzRmxleElkOiBzdHJpbmcgfCBudWxsLCBzSWRQcmVmaXg6IHN0cmluZywgc09yaWdpbmFsUHJvcGVydHlOYW1lOiBzdHJpbmcsIHNQcm9wZXJ0eU5hbWU6IHN0cmluZykge1xuXHRcdGlmIChzRmxleElkKSB7XG5cdFx0XHRyZXR1cm4gc0ZsZXhJZDtcblx0XHR9XG5cdFx0bGV0IHNQcm9wZXJ0eSA9IHNQcm9wZXJ0eU5hbWU7XG5cdFx0aWYgKHNPcmlnaW5hbFByb3BlcnR5TmFtZSAhPT0gc1Byb3BlcnR5TmFtZSkge1xuXHRcdFx0c1Byb3BlcnR5ID0gYCR7c09yaWdpbmFsUHJvcGVydHlOYW1lfTo6JHtzUHJvcGVydHlOYW1lfWA7XG5cdFx0fVxuXHRcdHJldHVybiBnZW5lcmF0ZShbc0lkUHJlZml4LCBzUHJvcGVydHldKTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgZmllbGRIZWxwIHByb3BlcnR5IG9mIHRoZSBGaWx0ZXJGaWVsZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEZpZWxkSGVscFByb3BlcnR5Rm9yRmlsdGVyRmllbGRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuZmllbGQuRmllbGRIZWxwZXIuanNcblx0ICogQHBhcmFtIGlDb250ZXh0IFRoZSBpbnRlcmZhY2UgaW5zdGFuY2Ugb2YgdGhlIGNvbnRleHRcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eSBUaGUgb2JqZWN0IG9mIHRoZSBGaWVsZEhlbHAgcHJvcGVydHlcblx0ICogQHBhcmFtIHNQcm9wZXJ0eVR5cGUgVGhlICRUeXBlIG9mIHRoZSBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gc1ZoSWRQcmVmaXggVGhlIElEIHByZWZpeCBvZiB0aGUgdmFsdWUgaGVscFxuXHQgKiBAcGFyYW0gc1Byb3BlcnR5TmFtZSBUaGUgbmFtZSBvZiB0aGUgcHJvcGVydHlcblx0ICogQHBhcmFtIHNWYWx1ZUhlbHBQcm9wZXJ0eU5hbWUgVGhlIHByb3BlcnR5IG5hbWUgb2YgdGhlIHZhbHVlIGhlbHBcblx0ICogQHBhcmFtIGJIYXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMgYHRydWVgIGlmIHRoZXJlIGlzIGEgdmFsdWUgbGlzdCB3aXRoIGEgZml4ZWQgdmFsdWUgYW5ub3RhdGlvblxuXHQgKiBAcGFyYW0gYlVzZVNlbWFudGljRGF0ZVJhbmdlIGB0cnVlYCBpZiB0aGUgc2VtYW50aWMgZGF0ZSByYW5nZSBpcyBzZXQgdG8gJ3RydWUnIGluIHRoZSBtYW5pZmVzdFxuXHQgKiBAcmV0dXJucyBUaGUgZmllbGQgaGVscCBwcm9wZXJ0eSBvZiB0aGUgdmFsdWUgaGVscFxuXHQgKi9cblx0Z2V0RmllbGRIZWxwUHJvcGVydHlGb3JGaWx0ZXJGaWVsZDogZnVuY3Rpb24gKFxuXHRcdGlDb250ZXh0OiBhbnksXG5cdFx0b1Byb3BlcnR5OiBhbnksXG5cdFx0c1Byb3BlcnR5VHlwZTogc3RyaW5nLFxuXHRcdHNWaElkUHJlZml4OiBzdHJpbmcsXG5cdFx0c1Byb3BlcnR5TmFtZTogc3RyaW5nLFxuXHRcdHNWYWx1ZUhlbHBQcm9wZXJ0eU5hbWU6IHN0cmluZyxcblx0XHRiSGFzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzOiBib29sZWFuLFxuXHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZTogYm9vbGVhbiB8IHN0cmluZ1xuXHQpIHtcblx0XHRjb25zdCBvQ29udGV4dCA9IGlDb250ZXh0LmdldEludGVyZmFjZSgwKS5nZXRNb2RlbCgxKS5jcmVhdGVCaW5kaW5nQ29udGV4dChpQ29udGV4dC5nZXRJbnRlcmZhY2UoMCkuZ2V0UGF0aCgxKSk7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5ID0gRmllbGRIZWxwZXIucHJvcGVydHlOYW1lKG9Qcm9wZXJ0eSwgeyBjb250ZXh0OiBvQ29udGV4dCB9KSxcblx0XHRcdGJTZW1hbnRpY0RhdGVSYW5nZSA9IGJVc2VTZW1hbnRpY0RhdGVSYW5nZSA9PT0gXCJ0cnVlXCIgfHwgYlVzZVNlbWFudGljRGF0ZVJhbmdlID09PSB0cnVlO1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRzUHJvcGVydHlQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpLFxuXHRcdFx0c1Byb3BlcnR5TG9jYXRpb25QYXRoID0gQ29tbW9uSGVscGVyLmdldExvY2F0aW9uRm9yUHJvcGVydHlQYXRoKG9Nb2RlbCwgc1Byb3BlcnR5UGF0aCksXG5cdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0RmlsdGVyUmVzdHJpY3Rpb25zQnlQYXRoKHNQcm9wZXJ0eUxvY2F0aW9uUGF0aCwgb0NvbnRleHQpO1xuXHRcdGlmIChcblx0XHRcdCgoc1Byb3BlcnR5VHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIiB8fCBzUHJvcGVydHlUeXBlID09PSBcIkVkbS5EYXRlXCIpICYmXG5cdFx0XHRcdGJTZW1hbnRpY0RhdGVSYW5nZSAmJlxuXHRcdFx0XHRvRmlsdGVyUmVzdHJpY3Rpb25zICYmXG5cdFx0XHRcdG9GaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zICYmXG5cdFx0XHRcdG9GaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zW3NQcm9wZXJ0eV0gJiZcblx0XHRcdFx0KG9GaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zW3NQcm9wZXJ0eV0uaW5kZXhPZihcIlNpbmdsZVJhbmdlXCIpICE9PSAtMSB8fFxuXHRcdFx0XHRcdG9GaWx0ZXJSZXN0cmljdGlvbnMuRmlsdGVyQWxsb3dlZEV4cHJlc3Npb25zW3NQcm9wZXJ0eV0uaW5kZXhPZihcIlNpbmdsZVZhbHVlXCIpICE9PSAtMSkpIHx8XG5cdFx0XHQoc1Byb3BlcnR5VHlwZSA9PT0gXCJFZG0uQm9vbGVhblwiICYmICFiSGFzVmFsdWVMaXN0V2l0aEZpeGVkVmFsdWVzKVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cmV0dXJuIEZpZWxkSGVscGVyLmdldElERm9yRmllbGRWYWx1ZUhlbHAobnVsbCwgc1ZoSWRQcmVmaXggfHwgXCJGaWx0ZXJGaWVsZFZhbHVlSGVscFwiLCBzUHJvcGVydHlOYW1lLCBzVmFsdWVIZWxwUHJvcGVydHlOYW1lKTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgc2VtYW50aWMga2V5IHRpdGxlXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRTZW1hbnRpY0tleVRpdGxlXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkSGVscGVyLmpzXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzUHJvcGVydHlUZXh0VmFsdWUgU3RyaW5nIGNvbnRhaW5pbmcgdGhlIGJpbmRpbmcgb2YgdGV4dCBhc3NvY2lhdGVkIHRvIHRoZSBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc1Byb3BlcnR5VmFsdWUgU3RyaW5nIGNvbnRhaW5pbmcgdGhlIGJpbmRpbmcgb2YgYSBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0ge3N0cmluZ30gc0RhdGFGaWVsZCBTdHJpbmcgY29udGFpbmluZyB0aGUgbmFtZSBvZiBhIGRhdGEgZmllbGRcblx0ICogQHBhcmFtIHtvYmplY3R9IG9UZXh0QXJyYW5nZW1lbnQgT2JqZWN0IGNvbnRhaW5pbmcgdGhlIHRleHQgYXJyYW5nZW1lbnRcblx0ICogQHBhcmFtIHtzdHJpbmd9IHNTZW1hbnRpY0tleVN0eWxlIGVudW0gY29udGFpbmluZyB0aGUgc3R5bGUgb2YgdGhlIHNlbWFudGljIGtleVxuXHQgKiBAcGFyYW0ge29iamVjdH0gb0RyYWZ0Um9vdCBEcmFmdCByb290IG9iamVjdFxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSAtIEJpbmRpbmcgdGhhdCByZXNvbHZlcyB0byB0aGUgdGl0bGUgb2YgdGhlIHNlbWFudGljIGtleVxuXHQgKi9cblxuXHRnZXRTZW1hbnRpY0tleVRpdGxlOiBmdW5jdGlvbiAoXG5cdFx0c1Byb3BlcnR5VGV4dFZhbHVlOiBzdHJpbmcsXG5cdFx0c1Byb3BlcnR5VmFsdWU6IHN0cmluZyxcblx0XHRzRGF0YUZpZWxkOiBzdHJpbmcsXG5cdFx0b1RleHRBcnJhbmdlbWVudDogYW55LFxuXHRcdHNTZW1hbnRpY0tleVN0eWxlOiBzdHJpbmcsXG5cdFx0b0RyYWZ0Um9vdDogYW55XG5cdCkge1xuXHRcdGNvbnN0IHNOZXdPYmplY3QgPSBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJUX05FV19PQkpFQ1RcIik7XG5cdFx0Y29uc3Qgc1VubmFtZWRPYmplY3QgPSBSZXNvdXJjZU1vZGVsLmdldFRleHQoXCJUX0FOTk9UQVRJT05fSEVMUEVSX0RFRkFVTFRfT0JKRUNUX1BBR0VfSEVBREVSX1RJVExFX05PX0hFQURFUl9JTkZPXCIpO1xuXHRcdGxldCBzTmV3T2JqZWN0RXhwcmVzc2lvbiwgc1Vubm5hbWVkT2JqZWN0RXhwcmVzc2lvbjtcblx0XHRsZXQgc1NlbWFudGljS2V5VGl0bGVFeHByZXNzaW9uO1xuXHRcdGNvbnN0IGFkZE5ld09iamVjdFVuTmFtZWRPYmplY3RFeHByZXNzaW9uID0gZnVuY3Rpb24gKHNWYWx1ZTogc3RyaW5nKSB7XG5cdFx0XHRzTmV3T2JqZWN0RXhwcmVzc2lvbiA9XG5cdFx0XHRcdFwiKCRcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID09PSAnJyB8fCAkXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA9PT0gdW5kZWZpbmVkIHx8ICRcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID09PSBudWxsID8gJ1wiICtcblx0XHRcdFx0c05ld09iamVjdCArXG5cdFx0XHRcdFwiJzogJFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIpXCI7XG5cdFx0XHRzVW5ubmFtZWRPYmplY3RFeHByZXNzaW9uID1cblx0XHRcdFx0XCIoJFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPT09ICcnIHx8ICRcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID09PSB1bmRlZmluZWQgfHwgJFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPT09IG51bGwgPyAnXCIgK1xuXHRcdFx0XHRzVW5uYW1lZE9iamVjdCArXG5cdFx0XHRcdFwiJzogJFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIpXCI7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcIighJXtJc0FjdGl2ZUVudGl0eX0gPyAhJXtIYXNBY3RpdmVFbnRpdHl9ID8gXCIgK1xuXHRcdFx0XHRzTmV3T2JqZWN0RXhwcmVzc2lvbiArXG5cdFx0XHRcdFwiIDogXCIgK1xuXHRcdFx0XHRzVW5ubmFtZWRPYmplY3RFeHByZXNzaW9uICtcblx0XHRcdFx0XCIgOiBcIiArXG5cdFx0XHRcdHNVbm5uYW1lZE9iamVjdEV4cHJlc3Npb24gK1xuXHRcdFx0XHRcIilcIlxuXHRcdFx0KTtcblx0XHR9O1xuXHRcdGNvbnN0IGJ1aWxkRXhwcmVzc2lvbkZvclNlbWFudGlja0tleVRpdGxlID0gZnVuY3Rpb24gKHNWYWx1ZTogc3RyaW5nLCBiSXNFeHByZXNzaW9uQmluZGluZzogYm9vbGVhbikge1xuXHRcdFx0bGV0IHNFeHByZXNzaW9uO1xuXHRcdFx0aWYgKG9EcmFmdFJvb3QpIHtcblx0XHRcdFx0Ly9jaGVjayBpZiBpdCBpcyBkcmFmdCByb290IHNvIHRoYXQgd2UgY2FuIGFkZCBOZXdPYmplY3QgYW5kIFVubmFtZWRPYmplY3QgZmVhdHVyZVxuXHRcdFx0XHRzRXhwcmVzc2lvbiA9IGFkZE5ld09iamVjdFVuTmFtZWRPYmplY3RFeHByZXNzaW9uKHNWYWx1ZSk7XG5cdFx0XHRcdHJldHVybiBiSXNFeHByZXNzaW9uQmluZGluZyA/IFwiez0gXCIgKyBzRXhwcmVzc2lvbiArIFwifVwiIDogc0V4cHJlc3Npb247XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gYklzRXhwcmVzc2lvbkJpbmRpbmcgPyBzVmFsdWUgOiBcIiRcIiArIHNWYWx1ZTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0aWYgKHNQcm9wZXJ0eVRleHRWYWx1ZSkge1xuXHRcdFx0Ly8gY2hlY2sgZm9yIHRleHQgYXNzb2NpYXRpb25cblx0XHRcdGlmIChvVGV4dEFycmFuZ2VtZW50ICYmIHNTZW1hbnRpY0tleVN0eWxlICE9PSBcIk9iamVjdElkZW50aWZpZXJcIikge1xuXHRcdFx0XHQvLyBjaGVjayBpZiB0ZXh0IGFycmFuZ2VtZW50IGlzIHByZXNlbnQgYW5kIHRhYmxlIHR5cGUgaXMgR3JpZFRhYmxlXG5cdFx0XHRcdGNvbnN0IHNUZXh0QXJyYW5nZW1lbnQgPSBvVGV4dEFycmFuZ2VtZW50LiRFbnVtTWVtYmVyO1xuXHRcdFx0XHRpZiAoc1RleHRBcnJhbmdlbWVudCA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRGaXJzdFwiKSB7XG5cdFx0XHRcdFx0Ly8gRWc6IEVuZ2xpc2ggKEVOKVxuXHRcdFx0XHRcdHNTZW1hbnRpY0tleVRpdGxlRXhwcmVzc2lvbiA9IGJ1aWxkRXhwcmVzc2lvbkZvclNlbWFudGlja0tleVRpdGxlKHNQcm9wZXJ0eVRleHRWYWx1ZSwgZmFsc2UpO1xuXHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRcIns9IFwiICtcblx0XHRcdFx0XHRcdHNTZW1hbnRpY0tleVRpdGxlRXhwcmVzc2lvbiArXG5cdFx0XHRcdFx0XHRcIiArJyAoJyArIFwiICtcblx0XHRcdFx0XHRcdFwiKCRcIiArXG5cdFx0XHRcdFx0XHRzUHJvcGVydHlWYWx1ZSArXG5cdFx0XHRcdFx0XHQoc0RhdGFGaWVsZCA/IFwiIHx8ICR7XCIgKyBzRGF0YUZpZWxkICsgXCJ9XCIgOiBcIlwiKSArXG5cdFx0XHRcdFx0XHRcIikgKycpJyB9XCJcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHNUZXh0QXJyYW5nZW1lbnQgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0TGFzdFwiKSB7XG5cdFx0XHRcdFx0Ly8gRWc6IEVOIChFbmdsaXNoKVxuXHRcdFx0XHRcdHNTZW1hbnRpY0tleVRpdGxlRXhwcmVzc2lvbiA9IGJ1aWxkRXhwcmVzc2lvbkZvclNlbWFudGlja0tleVRpdGxlKHNQcm9wZXJ0eVRleHRWYWx1ZSwgZmFsc2UpO1xuXHRcdFx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFx0XHRcIns9ICgkXCIgK1xuXHRcdFx0XHRcdFx0c1Byb3BlcnR5VmFsdWUgK1xuXHRcdFx0XHRcdFx0KHNEYXRhRmllbGQgPyBcIiB8fCAke1wiICsgc0RhdGFGaWVsZCArIFwifVwiIDogXCJcIikgK1xuXHRcdFx0XHRcdFx0XCIpXCIgK1xuXHRcdFx0XHRcdFx0XCIgKyAnICgnICsgXCIgK1xuXHRcdFx0XHRcdFx0c1NlbWFudGljS2V5VGl0bGVFeHByZXNzaW9uICtcblx0XHRcdFx0XHRcdFwiICsnKScgfVwiXG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBmb3IgYSBHcmlkIHRhYmxlIHdoZW4gdGV4dCBpcyBhdmFpbGFibGUgYW5kIHRleHQgYXJyYW5nZW1lbnQgaXMgVGV4dE9ubHkgb3IgVGV4dFNlcGVyYXRlIG9yIG5vIHRleHQgYXJyYW5nZW1lbnQgdGhlbiB3ZSByZXR1cm4gVGV4dFxuXHRcdFx0XHRcdHJldHVybiBidWlsZEV4cHJlc3Npb25Gb3JTZW1hbnRpY2tLZXlUaXRsZShzUHJvcGVydHlUZXh0VmFsdWUsIHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gYnVpbGRFeHByZXNzaW9uRm9yU2VtYW50aWNrS2V5VGl0bGUoc1Byb3BlcnR5VGV4dFZhbHVlLCB0cnVlKTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaWYgdGhlcmUgaXMgbm8gdGV4dCBhc3NvY2lhdGlvbiB0aGVuIHdlIHJldHVybiB0aGUgcHJvcGVydHkgdmFsdWVcblx0XHRcdHJldHVybiBidWlsZEV4cHJlc3Npb25Gb3JTZW1hbnRpY2tLZXlUaXRsZShzUHJvcGVydHlWYWx1ZSwgdHJ1ZSk7XG5cdFx0fVxuXHR9LFxuXG5cdGdldE9iamVjdElkZW50aWZpZXJUZXh0OiBmdW5jdGlvbiAoXG5cdFx0b1RleHRBbm5vdGF0aW9uOiBhbnksXG5cdFx0b1RleHRBcnJhbmdlbWVudEFubm90YXRpb246IGFueSxcblx0XHRzUHJvcGVydHlWYWx1ZUJpbmRpbmc6IGFueSxcblx0XHRzRGF0YUZpZWxkTmFtZTogYW55XG5cdCkge1xuXHRcdGlmIChvVGV4dEFubm90YXRpb24pIHtcblx0XHRcdC8vIFRoZXJlIGlzIGEgdGV4dCBhbm5vdGF0aW9uLiBJbiB0aGlzIGNhc2UsIHRoZSBPYmplY3RJZGVudGlmaWVyIHNob3dzOlxuXHRcdFx0Ly8gIC0gdGhlICp0ZXh0KiBhcyB0aGUgT2JqZWN0SWRlbnRpZmllcidzIHRpdGxlXG5cdFx0XHQvLyAgLSB0aGUgKnZhbHVlKiBhcyB0aGUgT2JqZWN0SWRlbnRpZmllcidzIHRleHRcblx0XHRcdC8vXG5cdFx0XHQvLyBTbyBpZiB0aGUgVGV4dEFycmFuZ2VtZW50IGlzICNUZXh0T25seSBvciAjVGV4dFNlcGFyYXRlLCBkbyBub3Qgc2V0IHRoZSBPYmplY3RJZGVudGlmaWVyJ3MgdGV4dFxuXHRcdFx0Ly8gcHJvcGVydHlcblx0XHRcdGlmIChcblx0XHRcdFx0b1RleHRBcnJhbmdlbWVudEFubm90YXRpb24gJiZcblx0XHRcdFx0KG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dE9ubHlcIiB8fFxuXHRcdFx0XHRcdG9UZXh0QXJyYW5nZW1lbnRBbm5vdGF0aW9uLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dFNlcGFyYXRlXCIgfHxcblx0XHRcdFx0XHRvVGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbi4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRGaXJzdFwiKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gc1Byb3BlcnR5VmFsdWVCaW5kaW5nIHx8IGB7JHtzRGF0YUZpZWxkTmFtZX19YDtcblx0XHRcdH1cblx0XHR9XG5cblx0XHQvLyBubyB0ZXh0IGFubm90YXRpb246IHRoZSBwcm9wZXJ0eSB2YWx1ZSBpcyBwYXJ0IG9mIHRoZSBPYmplY3RJZGVudGlmaWVyJ3MgdGl0bGUgYWxyZWFkeVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0Z2V0U2VtYW50aWNPYmplY3RzTGlzdDogZnVuY3Rpb24gKHByb3BlcnR5QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdC8vIGxvb2sgZm9yIGFubm90YXRpb25zIFNlbWFudGljT2JqZWN0IHdpdGggYW5kIHdpdGhvdXQgcXVhbGlmaWVyXG5cdFx0Ly8gcmV0dXJucyA6IGxpc3Qgb2YgU2VtYW50aWNPYmplY3RzXG5cdFx0Y29uc3QgYW5ub3RhdGlvbnMgPSBwcm9wZXJ0eUFubm90YXRpb25zO1xuXHRcdGNvbnN0IGFTZW1hbnRpY09iamVjdHMgPSBbXTtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBhbm5vdGF0aW9ucy5nZXRPYmplY3QoKSkge1xuXHRcdFx0Ly8gdmFyIHF1YWxpZmllcjtcblx0XHRcdGlmIChcblx0XHRcdFx0a2V5LmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RcIikgPiAtMSAmJlxuXHRcdFx0XHRrZXkuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdE1hcHBpbmdcIikgPT09IC0xICYmXG5cdFx0XHRcdGtleS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zXCIpID09PSAtMVxuXHRcdFx0KSB7XG5cdFx0XHRcdGxldCBzZW1hbnRpY09iamVjdFZhbHVlID0gYW5ub3RhdGlvbnMuZ2V0T2JqZWN0KClba2V5XTtcblx0XHRcdFx0aWYgKHR5cGVvZiBzZW1hbnRpY09iamVjdFZhbHVlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0c2VtYW50aWNPYmplY3RWYWx1ZSA9IEFubm90YXRpb25IZWxwZXIudmFsdWUoc2VtYW50aWNPYmplY3RWYWx1ZSwgeyBjb250ZXh0OiBwcm9wZXJ0eUFubm90YXRpb25zIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChhU2VtYW50aWNPYmplY3RzLmluZGV4T2Yoc2VtYW50aWNPYmplY3RWYWx1ZSkgPT09IC0xKSB7XG5cdFx0XHRcdFx0YVNlbWFudGljT2JqZWN0cy5wdXNoKHNlbWFudGljT2JqZWN0VmFsdWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IG9TZW1hbnRpY09iamVjdHNNb2RlbCA9IG5ldyBKU09OTW9kZWwoYVNlbWFudGljT2JqZWN0cyk7XG5cdFx0KG9TZW1hbnRpY09iamVjdHNNb2RlbCBhcyBhbnkpLiQkdmFsdWVBc1Byb21pc2UgPSB0cnVlO1xuXHRcdHJldHVybiBvU2VtYW50aWNPYmplY3RzTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpO1xuXHR9LFxuXHRnZXRTZW1hbnRpY09iamVjdHNRdWFsaWZpZXJzOiBmdW5jdGlvbiAocHJvcGVydHlBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0Ly8gbG9vayBmb3IgYW5ub3RhdGlvbnMgU2VtYW50aWNPYmplY3QsIFNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLCBTZW1hbnRpY09iamVjdE1hcHBpbmdcblx0XHQvLyByZXR1cm5zIDogbGlzdCBvZiBxdWFsaWZpZXJzIChhcnJheSBvZiBvYmplY3RzIHdpdGggcXVhbGlmaWVycyA6IHtxdWFsaWZpZXIsIFNlbWFudGljT2JqZWN0LCBTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucywgU2VtYW50aWNPYmplY3RNYXBwaW5nIGZvciB0aGlzIHF1YWxpZmllcn1cblx0XHRjb25zdCBhbm5vdGF0aW9ucyA9IHByb3BlcnR5QW5ub3RhdGlvbnM7XG5cdFx0bGV0IHF1YWxpZmllcnNBbm5vdGF0aW9uczogYW55W10gPSBbXTtcblx0XHRjb25zdCBmaW5kT2JqZWN0ID0gZnVuY3Rpb24gKHF1YWxpZmllcjogYW55KSB7XG5cdFx0XHRyZXR1cm4gcXVhbGlmaWVyc0Fubm90YXRpb25zLmZpbmQoZnVuY3Rpb24gKG9iamVjdDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvYmplY3QucXVhbGlmaWVyID09PSBxdWFsaWZpZXI7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdGZvciAoY29uc3Qga2V5IGluIGFubm90YXRpb25zLmdldE9iamVjdCgpKSB7XG5cdFx0XHQvLyB2YXIgcXVhbGlmaWVyO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRrZXkuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdCNcIikgPiAtMSB8fFxuXHRcdFx0XHRrZXkuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdE1hcHBpbmcjXCIpID4gLTEgfHxcblx0XHRcdFx0a2V5LmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMjXCIpID4gLTFcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBhbm5vdGF0aW9uQ29udGVudCA9IGFubm90YXRpb25zLmdldE9iamVjdCgpW2tleV0sXG5cdFx0XHRcdFx0YW5ub3RhdGlvbiA9IGtleS5zcGxpdChcIiNcIilbMF0sXG5cdFx0XHRcdFx0cXVhbGlmaWVyID0ga2V5LnNwbGl0KFwiI1wiKVsxXTtcblx0XHRcdFx0bGV0IHF1YWxpZmllck9iamVjdCA9IGZpbmRPYmplY3QocXVhbGlmaWVyKTtcblxuXHRcdFx0XHRpZiAoIXF1YWxpZmllck9iamVjdCkge1xuXHRcdFx0XHRcdHF1YWxpZmllck9iamVjdCA9IHtcblx0XHRcdFx0XHRcdHF1YWxpZmllcjogcXVhbGlmaWVyXG5cdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRxdWFsaWZpZXJPYmplY3RbYW5ub3RhdGlvbl0gPSBhbm5vdGF0aW9uQ29udGVudDtcblx0XHRcdFx0XHRxdWFsaWZpZXJzQW5ub3RhdGlvbnMucHVzaChxdWFsaWZpZXJPYmplY3QpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHF1YWxpZmllck9iamVjdFthbm5vdGF0aW9uXSA9IGFubm90YXRpb25Db250ZW50O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHF1YWxpZmllcnNBbm5vdGF0aW9ucyA9IHF1YWxpZmllcnNBbm5vdGF0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKG9RdWFsaWZpZXI6IGFueSkge1xuXHRcdFx0cmV0dXJuICEhb1F1YWxpZmllcltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RcIl07XG5cdFx0fSk7XG5cdFx0Y29uc3Qgb1F1YWxpZmllcnNNb2RlbCA9IG5ldyBKU09OTW9kZWwocXVhbGlmaWVyc0Fubm90YXRpb25zKTtcblx0XHQob1F1YWxpZmllcnNNb2RlbCBhcyBhbnkpLiQkdmFsdWVBc1Byb21pc2UgPSB0cnVlO1xuXHRcdHJldHVybiBvUXVhbGlmaWVyc01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0fSxcblx0Ly8gcmV0dXJucyBhcnJheSBvZiBzZW1hbnRpY09iamVjdHMgaW5jbHVkaW5nIG1haW4gYW5kIGFkZGl0aW9uYWwsIHdpdGggdGhlaXIgbWFwcGluZyBhbmQgdW5hdmFpbGFibGUgQWN0aW9uc1xuXHRnZXRTZW1hbnRpY09iamVjdHNXaXRoQW5ub3RhdGlvbnM6IGZ1bmN0aW9uIChwcm9wZXJ0eUFubm90YXRpb25zOiBhbnkpIHtcblx0XHQvLyBsb29rIGZvciBhbm5vdGF0aW9ucyBTZW1hbnRpY09iamVjdCwgU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMsIFNlbWFudGljT2JqZWN0TWFwcGluZ1xuXHRcdGxldCBhbm5vdGF0aW9uQ29udGVudDtcblx0XHRsZXQgbGlzdEl0ZW06IGFueTtcblx0XHQvLyByZXR1cm5zIDogbGlzdCBvZiBxdWFsaWZpZXJzIChhcnJheSBvZiBvYmplY3RzIHdpdGggcXVhbGlmaWVycyA6IHtxdWFsaWZpZXIsIFNlbWFudGljT2JqZWN0LCBTZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucywgU2VtYW50aWNPYmplY3RNYXBwaW5nIGZvciB0aGlzIHF1YWxpZmllcn1cblx0XHRjb25zdCBhbm5vdGF0aW9ucyA9IHByb3BlcnR5QW5ub3RhdGlvbnM7XG5cdFx0bGV0IHNlbWFudGljT2JqZWN0TGlzdDogYW55W10gPSBbXTtcblx0XHRjb25zdCBmaW5kT2JqZWN0ID0gZnVuY3Rpb24gKHF1YWxpZmllcjogYW55KSB7XG5cdFx0XHRyZXR1cm4gc2VtYW50aWNPYmplY3RMaXN0LmZpbmQoZnVuY3Rpb24gKG9iamVjdDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvYmplY3QucXVhbGlmaWVyID09PSBxdWFsaWZpZXI7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdGZvciAoY29uc3Qga2V5IGluIGFubm90YXRpb25zLmdldE9iamVjdCgpKSB7XG5cdFx0XHQvLyB2YXIgcXVhbGlmaWVyO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRrZXkuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFwiKSA+IC0xIHx8XG5cdFx0XHRcdGtleS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0TWFwcGluZ1wiKSA+IC0xIHx8XG5cdFx0XHRcdGtleS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zXCIpID4gLTFcblx0XHRcdCkge1xuXHRcdFx0XHRpZiAoa2V5LmluZGV4T2YoXCIjXCIpID4gLTEpIHtcblx0XHRcdFx0XHRhbm5vdGF0aW9uQ29udGVudCA9IGFubm90YXRpb25zLmdldE9iamVjdCgpW2tleV07XG5cdFx0XHRcdFx0Y29uc3QgYW5ub3RhdGlvbiA9IGtleS5zcGxpdChcIiNcIilbMF0sXG5cdFx0XHRcdFx0XHRxdWFsaWZpZXIgPSBrZXkuc3BsaXQoXCIjXCIpWzFdO1xuXHRcdFx0XHRcdGxpc3RJdGVtID0gZmluZE9iamVjdChxdWFsaWZpZXIpO1xuXHRcdFx0XHRcdGlmIChrZXkgPT09IFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdFwiICYmIHR5cGVvZiBhbm5vdGF0aW9uQ29udGVudCA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRcdFx0YW5ub3RhdGlvbkNvbnRlbnQgPSBBbm5vdGF0aW9uSGVscGVyLnZhbHVlKGFubm90YXRpb25Db250ZW50WzBdLCB7IGNvbnRleHQ6IHByb3BlcnR5QW5ub3RhdGlvbnMgfSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmICghbGlzdEl0ZW0pIHtcblx0XHRcdFx0XHRcdGxpc3RJdGVtID0ge1xuXHRcdFx0XHRcdFx0XHRxdWFsaWZpZXI6IHF1YWxpZmllclxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGxpc3RJdGVtW2Fubm90YXRpb25dID0gYW5ub3RhdGlvbkNvbnRlbnQ7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdExpc3QucHVzaChsaXN0SXRlbSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGxpc3RJdGVtW2Fubm90YXRpb25dID0gYW5ub3RhdGlvbkNvbnRlbnQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFubm90YXRpb25Db250ZW50ID0gYW5ub3RhdGlvbnMuZ2V0T2JqZWN0KClba2V5XTtcblx0XHRcdFx0XHRsZXQgYW5ub3RhdGlvbjogYW55O1xuXHRcdFx0XHRcdGlmIChrZXkuaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdE1hcHBpbmdcIikgPiAtMSkge1xuXHRcdFx0XHRcdFx0YW5ub3RhdGlvbiA9IFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdE1hcHBpbmdcIjtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGtleS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zXCIpID4gLTEpIHtcblx0XHRcdFx0XHRcdGFubm90YXRpb24gPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNcIjtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGtleS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0XCIpID4gLTEpIHtcblx0XHRcdFx0XHRcdGFubm90YXRpb24gPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0bGlzdEl0ZW0gPSBmaW5kT2JqZWN0KFwibWFpblwiKTtcblx0XHRcdFx0XHRpZiAoa2V5ID09PSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RcIiAmJiB0eXBlb2YgYW5ub3RhdGlvbkNvbnRlbnQgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRcdGFubm90YXRpb25Db250ZW50ID0gQW5ub3RhdGlvbkhlbHBlci52YWx1ZShhbm5vdGF0aW9uQ29udGVudCwgeyBjb250ZXh0OiBwcm9wZXJ0eUFubm90YXRpb25zIH0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAoIWxpc3RJdGVtKSB7XG5cdFx0XHRcdFx0XHRsaXN0SXRlbSA9IHtcblx0XHRcdFx0XHRcdFx0cXVhbGlmaWVyOiBcIm1haW5cIlxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdGxpc3RJdGVtW2Fubm90YXRpb25dID0gYW5ub3RhdGlvbkNvbnRlbnQ7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdExpc3QucHVzaChsaXN0SXRlbSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGxpc3RJdGVtW2Fubm90YXRpb25dID0gYW5ub3RhdGlvbkNvbnRlbnQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdC8vIGZpbHRlciBpZiBubyBzZW1hbnRpY09iamVjdCB3YXMgZGVmaW5lZFxuXHRcdHNlbWFudGljT2JqZWN0TGlzdCA9IHNlbWFudGljT2JqZWN0TGlzdC5maWx0ZXIoZnVuY3Rpb24gKG9RdWFsaWZpZXI6IGFueSkge1xuXHRcdFx0cmV0dXJuICEhb1F1YWxpZmllcltcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RcIl07XG5cdFx0fSk7XG5cdFx0Y29uc3Qgb1NlbWFudGljT2JqZWN0c01vZGVsID0gbmV3IEpTT05Nb2RlbChzZW1hbnRpY09iamVjdExpc3QpO1xuXHRcdChvU2VtYW50aWNPYmplY3RzTW9kZWwgYXMgYW55KS4kJHZhbHVlQXNQcm9taXNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gb1NlbWFudGljT2JqZWN0c01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0fSxcblx0Y29tcHV0ZVNlbWFudGljTGlua01vZGVsQ29udGV4dENoYW5nZTogZnVuY3Rpb24gKGFTZW1hbnRpY09iamVjdHM6IGFueSwgb0RhdGFNb2RlbE9iamVjdFBhdGg6IGFueSkge1xuXHRcdGlmIChGaWVsZEhlbHBlci5oYXNTZW1hbnRpY09iamVjdHNXaXRoUGF0aChhU2VtYW50aWNPYmplY3RzKSkge1xuXHRcdFx0Y29uc3Qgc1BhdGhUb1Byb3BlcnR5ID0gRmllbGRIZWxwZXIuYnVpbGRUYXJnZXRQYXRoRnJvbURhdGFNb2RlbE9iamVjdFBhdGgob0RhdGFNb2RlbE9iamVjdFBhdGgpO1xuXHRcdFx0cmV0dXJuIGBGaWVsZFJ1bnRpbWUuTGlua01vZGVsQ29udGV4dENoYW5nZSgkZXZlbnQsICcke1xuXHRcdFx0XHQob0RhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0IGFzIFByb3BlcnR5KS5uYW1lXG5cdFx0XHR9JywgJyR7c1BhdGhUb1Byb3BlcnR5fScpYDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdH0sXG5cdGhhc1NlbWFudGljT2JqZWN0c1dpdGhQYXRoOiBmdW5jdGlvbiAoYVNlbWFudGljT2JqZWN0czogYW55KSB7XG5cdFx0bGV0IGJTZW1hbnRpY09iamVjdEhhc0FQYXRoID0gZmFsc2U7XG5cdFx0aWYgKGFTZW1hbnRpY09iamVjdHMgJiYgYVNlbWFudGljT2JqZWN0cy5sZW5ndGgpIHtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVNlbWFudGljT2JqZWN0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoYVNlbWFudGljT2JqZWN0c1tpXSAmJiBhU2VtYW50aWNPYmplY3RzW2ldLnZhbHVlICYmIGFTZW1hbnRpY09iamVjdHNbaV0udmFsdWUuaW5kZXhPZihcIntcIikgPT09IDApIHtcblx0XHRcdFx0XHRiU2VtYW50aWNPYmplY3RIYXNBUGF0aCA9IHRydWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGJTZW1hbnRpY09iamVjdEhhc0FQYXRoO1xuXHR9LFxuXHRpc1NlbWFudGljS2V5SGFzRmllbGRHcm91cENvbHVtbjogZnVuY3Rpb24gKGlzRmllbGRHcm91cENvbHVtbjogYW55KSB7XG5cdFx0cmV0dXJuIGlzRmllbGRHcm91cENvbHVtbjtcblx0fSxcblx0X2NoZWNrQ3VzdG9tU2VtYW50aWNPYmplY3RIYXNBbm5vdGF0aW9uczogZnVuY3Rpb24gKF9zZW1hbnRpY09iamVjdHNXaXRoQW5ub3RhdGlvbnM6IGFueVtdIHwgdW5kZWZpbmVkKSB7XG5cdFx0aWYgKF9zZW1hbnRpY09iamVjdHNXaXRoQW5ub3RhdGlvbnMgJiYgX3NlbWFudGljT2JqZWN0c1dpdGhBbm5vdGF0aW9ucy5sZW5ndGggPT0gMCkge1xuXHRcdFx0X3NlbWFudGljT2JqZWN0c1dpdGhBbm5vdGF0aW9ucyA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cmV0dXJuIF9zZW1hbnRpY09iamVjdHNXaXRoQW5ub3RhdGlvbnM7XG5cdH0sXG5cdF9tYW5hZ2VDdXN0b21TZW1hbnRpY09iamVjdHM6IGZ1bmN0aW9uIChcblx0XHRjdXN0b21TZW1hbnRpY09iamVjdDogc3RyaW5nLFxuXHRcdHNlbWFudGljT2JqZWN0c0xpc3Q6IHN0cmluZ1tdIHwgdW5kZWZpbmVkLFxuXHRcdHNlbWFudGljT2JqZWN0c1dpdGhBbm5vdGF0aW9uczogYW55W10gfCB1bmRlZmluZWRcblx0KSB7XG5cdFx0aWYgKGN1c3RvbVNlbWFudGljT2JqZWN0KSB7XG5cdFx0XHQvLyB0aGUgY3VzdG9tIHNlbWFudGljIG9iamVjdHMgYXJlIGVpdGhlciBhIHNpbmdsZSBzdHJpbmcva2V5IHRvIGN1c3RvbSBkYXRhIG9yIGEgc3RyaW5naWZpZWQgYXJyYXlcblx0XHRcdGlmICghKGN1c3RvbVNlbWFudGljT2JqZWN0WzBdID09PSBcIltcIikpIHtcblx0XHRcdFx0Ly8gY3VzdG9tU2VtYW50aWNPYmplY3QgPSBcInNlbWFudGljT2JqZWN0XCIgfCBcIntwYXRoSW5Nb2RlbH1cIlxuXHRcdFx0XHRpZiAoc2VtYW50aWNPYmplY3RzTGlzdCAmJiBzZW1hbnRpY09iamVjdHNMaXN0LmluZGV4T2YoY3VzdG9tU2VtYW50aWNPYmplY3QpID09PSAtMSkge1xuXHRcdFx0XHRcdHNlbWFudGljT2JqZWN0c0xpc3QucHVzaChjdXN0b21TZW1hbnRpY09iamVjdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8vIGN1c3RvbVNlbWFudGljT2JqZWN0ID0gJ1tcInNlbWFudGljT2JqZWN0MVwiLFwic2VtYW50aWNPYmplY3QyXCJdJ1xuXHRcdFx0XHRKU09OLnBhcnNlKGN1c3RvbVNlbWFudGljT2JqZWN0KS5mb3JFYWNoKGZ1bmN0aW9uIChzZW1hbnRpY09iamVjdDogYW55KSB7XG5cdFx0XHRcdFx0aWYgKHNlbWFudGljT2JqZWN0c0xpc3QgJiYgc2VtYW50aWNPYmplY3RzTGlzdC5pbmRleE9mKHNlbWFudGljT2JqZWN0KSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0c0xpc3QucHVzaChzZW1hbnRpY09iamVjdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHNlbWFudGljT2JqZWN0c1dpdGhBbm5vdGF0aW9ucyA9IHRoaXMuX2NoZWNrQ3VzdG9tU2VtYW50aWNPYmplY3RIYXNBbm5vdGF0aW9ucyhzZW1hbnRpY09iamVjdHNXaXRoQW5ub3RhdGlvbnMpO1xuXHRcdH1cblx0XHRyZXR1cm4ge1xuXHRcdFx0c2VtYW50aWNPYmplY3RzTGlzdDogc2VtYW50aWNPYmplY3RzTGlzdCxcblx0XHRcdHNlbWFudGljT2JqZWN0c1dpdGhBbm5vdGF0aW9uczogc2VtYW50aWNPYmplY3RzV2l0aEFubm90YXRpb25zXG5cdFx0fTtcblx0fSxcblx0Ly8gcmV0dXJucyB0aGUgbGlzdCBvZiBwYXJhbWV0ZXJzIHRvIHBhc3MgdG8gdGhlIExpbmsgZGVsZWdhdGVzXG5cdGNvbXB1dGVMaW5rUGFyYW1ldGVyczogZnVuY3Rpb24gKFxuXHRcdGRlbGVnYXRlTmFtZTogc3RyaW5nLFxuXHRcdGVudGl0eVR5cGU6IHN0cmluZyxcblx0XHRzZW1hbnRpY09iamVjdHNMaXN0OiBzdHJpbmdbXSB8IHVuZGVmaW5lZCxcblx0XHRzZW1hbnRpY09iamVjdHNXaXRoQW5ub3RhdGlvbnM6IGFueVtdIHwgdW5kZWZpbmVkLFxuXHRcdGRhdGFGaWVsZDogc3RyaW5nLFxuXHRcdGNvbnRhY3Q6IHN0cmluZyxcblx0XHRtYWluU2VtYW50aWNPYmplY3Q6IHN0cmluZyxcblx0XHRuYXZpZ2F0aW9uUGF0aDogc3RyaW5nLFxuXHRcdHByb3BlcnR5UGF0aExhYmVsOiBzdHJpbmcsXG5cdFx0Y3VzdG9tU2VtYW50aWNPYmplY3Q6IHN0cmluZyxcblx0XHRoYXNRdWlja1ZpZXdGYWNldHM6IGJvb2xlYW4gfCBmYWxzZVxuXHQpIHtcblx0XHRjb25zdCBfQ3VzdG9tU2VtYW50aWNPYmplY3RzRm91bmQgPSB0aGlzLl9tYW5hZ2VDdXN0b21TZW1hbnRpY09iamVjdHMoXG5cdFx0XHRjdXN0b21TZW1hbnRpY09iamVjdCxcblx0XHRcdHNlbWFudGljT2JqZWN0c0xpc3QsXG5cdFx0XHRzZW1hbnRpY09iamVjdHNXaXRoQW5ub3RhdGlvbnNcblx0XHQpO1xuXHRcdHNlbWFudGljT2JqZWN0c0xpc3QgPSBfQ3VzdG9tU2VtYW50aWNPYmplY3RzRm91bmQuc2VtYW50aWNPYmplY3RzTGlzdDtcblx0XHRzZW1hbnRpY09iamVjdHNXaXRoQW5ub3RhdGlvbnMgPSBfQ3VzdG9tU2VtYW50aWNPYmplY3RzRm91bmQuc2VtYW50aWNPYmplY3RzV2l0aEFubm90YXRpb25zO1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUoKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdGNvbnN0IHNlbWFudGljT2JqZWN0TWFwcGluZ3M6IGFueVtdID0gW10sXG5cdFx0XHRcdHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zOiBhbnlbXSA9IFtdO1xuXHRcdFx0Y29uc3QgYVJlc29sdmVkTWFpblNlbWFudGljT2JqZWN0ID0gc2VtYW50aWNPYmplY3RzV2l0aEFubm90YXRpb25zPy5maWx0ZXIoZnVuY3Rpb24gKGFubm90YXRpb246IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gYW5ub3RhdGlvbi5xdWFsaWZpZXIgPT09IFwibWFpblwiO1xuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBzUmVzb2x2ZU1haW5TZW1hbnRpY09iamVjdCA9XG5cdFx0XHRcdGFSZXNvbHZlZE1haW5TZW1hbnRpY09iamVjdCAmJiBhUmVzb2x2ZWRNYWluU2VtYW50aWNPYmplY3RbMF1cblx0XHRcdFx0XHQ/IGFSZXNvbHZlZE1haW5TZW1hbnRpY09iamVjdFswXVtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RcIl1cblx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblxuXHRcdFx0aWYgKHNlbWFudGljT2JqZWN0c1dpdGhBbm5vdGF0aW9ucykge1xuXHRcdFx0XHRzZW1hbnRpY09iamVjdHNXaXRoQW5ub3RhdGlvbnMuZm9yRWFjaChmdW5jdGlvbiAoc2VtT2JqZWN0OiBhbnkpIHtcblx0XHRcdFx0XHRsZXQgYW5ub3RhdGlvbkNvbnRlbnQgPSBzZW1PYmplY3RbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNlbWFudGljT2JqZWN0XCJdO1xuXHRcdFx0XHRcdGlmICh0eXBlb2YgYW5ub3RhdGlvbkNvbnRlbnQgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRcdGFubm90YXRpb25Db250ZW50ID0gY29tcGlsZUV4cHJlc3Npb24ocGF0aEluTW9kZWwoYW5ub3RhdGlvbkNvbnRlbnQuJFBhdGgpKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHNlbU9iamVjdFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNcIl0pIHtcblx0XHRcdFx0XHRcdGNvbnN0IHVuQXZhaWxhYmxlQWN0aW9uID0ge1xuXHRcdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogYW5ub3RhdGlvbkNvbnRlbnQsXG5cdFx0XHRcdFx0XHRcdGFjdGlvbnM6IHNlbU9iamVjdFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnNcIl1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucy5wdXNoKHVuQXZhaWxhYmxlQWN0aW9uKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKHNlbU9iamVjdFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RNYXBwaW5nXCJdKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBpdGVtczogYW55W10gPSBbXTtcblx0XHRcdFx0XHRcdHNlbU9iamVjdFtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNPYmplY3RNYXBwaW5nXCJdLmZvckVhY2goZnVuY3Rpb24gKG1hcHBpbmdJdGVtOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0aXRlbXMucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0a2V5OiBtYXBwaW5nSXRlbS5Mb2NhbFByb3BlcnR5LiRQcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0dmFsdWU6IG1hcHBpbmdJdGVtLlNlbWFudGljT2JqZWN0UHJvcGVydHlcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdGNvbnN0IG1hcHBpbmcgPSB7XG5cdFx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0OiBhbm5vdGF0aW9uQ29udGVudCxcblx0XHRcdFx0XHRcdFx0aXRlbXM6IGl0ZW1zXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5ncy5wdXNoKG1hcHBpbmcpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG5cdFx0XHRcdFx0bmFtZTogZGVsZWdhdGVOYW1lLFxuXHRcdFx0XHRcdHBheWxvYWQ6IHtcblx0XHRcdFx0XHRcdHNlbWFudGljT2JqZWN0czogc2VtYW50aWNPYmplY3RzTGlzdCxcblx0XHRcdFx0XHRcdGVudGl0eVR5cGU6IGVudGl0eVR5cGUsXG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uczogc2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnMsXG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdE1hcHBpbmdzOiBzZW1hbnRpY09iamVjdE1hcHBpbmdzLFxuXHRcdFx0XHRcdFx0c2VtYW50aWNQcmltYXJ5QWN0aW9uczogW10sXG5cdFx0XHRcdFx0XHRtYWluU2VtYW50aWNPYmplY3Q6IHNSZXNvbHZlTWFpblNlbWFudGljT2JqZWN0LFxuXHRcdFx0XHRcdFx0cHJvcGVydHlQYXRoTGFiZWw6IHByb3BlcnR5UGF0aExhYmVsLFxuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkOiBkYXRhRmllbGQsXG5cdFx0XHRcdFx0XHRjb250YWN0OiBjb250YWN0LFxuXHRcdFx0XHRcdFx0bmF2aWdhdGlvblBhdGg6IG5hdmlnYXRpb25QYXRoLFxuXHRcdFx0XHRcdFx0aGFzUXVpY2tWaWV3RmFjZXRzOiBoYXNRdWlja1ZpZXdGYWNldHMgIT09IG51bGwgPyBoYXNRdWlja1ZpZXdGYWNldHMgOiBmYWxzZVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0XHRcdG5hbWU6IGRlbGVnYXRlTmFtZSxcblx0XHRcdFx0XHRwYXlsb2FkOiB7XG5cdFx0XHRcdFx0XHRzZW1hbnRpY09iamVjdHM6IHNlbWFudGljT2JqZWN0c0xpc3QsXG5cdFx0XHRcdFx0XHRlbnRpdHlUeXBlOiBlbnRpdHlUeXBlLFxuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3RVbmF2YWlsYWJsZUFjdGlvbnM6IHNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zLFxuXHRcdFx0XHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nczogc2VtYW50aWNPYmplY3RNYXBwaW5ncyxcblx0XHRcdFx0XHRcdHNlbWFudGljUHJpbWFyeUFjdGlvbnM6IFtdLFxuXHRcdFx0XHRcdFx0bWFpblNlbWFudGljT2JqZWN0OiBzUmVzb2x2ZU1haW5TZW1hbnRpY09iamVjdCxcblx0XHRcdFx0XHRcdHByb3BlcnR5UGF0aExhYmVsOiBwcm9wZXJ0eVBhdGhMYWJlbCxcblx0XHRcdFx0XHRcdGRhdGFGaWVsZDogZGF0YUZpZWxkLFxuXHRcdFx0XHRcdFx0Y29udGFjdDogY29udGFjdCxcblx0XHRcdFx0XHRcdG5hdmlnYXRpb25QYXRoOiBuYXZpZ2F0aW9uUGF0aCxcblx0XHRcdFx0XHRcdGhhc1F1aWNrVmlld0ZhY2V0czogaGFzUXVpY2tWaWV3RmFjZXRzICE9PSBudWxsID8gaGFzUXVpY2tWaWV3RmFjZXRzIDogZmFsc2Vcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9LFxuXHQvKlxuXHQgKiBNZXRob2QgdG8gY29tcHV0ZSB0aGUgZGVsZWdhdGUgd2l0aCBwYXlsb2FkXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0ge29iamVjdH0gZGVsZWdhdGVOYW1lIC0gbmFtZSBvZiB0aGUgZGVsZWdhdGUgbWV0aG9kZVxuXHQgKiBAcGFyYW0ge2Jvb2xlYW59IHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QgLSBhZGRlZCB0byB0aGUgcGF5bG9hZCBvZiB0aGUgZGVsZWdhdGUgbWV0aG9kZVxuXHQgKiBAcmV0dXJuIHtvYmplY3R9IC0gcmV0dXJucyB0aGUgZGVsZWdhdGUgd2l0aCBwYXlsb2FkXG5cdCAqL1xuXHRjb21wdXRlRmllbGRCYXNlRGVsZWdhdGU6IGZ1bmN0aW9uIChkZWxlZ2F0ZU5hbWU6IHN0cmluZywgcmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdDogYm9vbGVhbikge1xuXHRcdGlmIChyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0KSB7XG5cdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoe1xuXHRcdFx0XHRuYW1lOiBkZWxlZ2F0ZU5hbWUsXG5cdFx0XHRcdHBheWxvYWQ6IHtcblx0XHRcdFx0XHRyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0OiByZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gYHtuYW1lOiAnJHtkZWxlZ2F0ZU5hbWV9J31gO1xuXHR9LFxuXHRfZ2V0UHJpbWFyeUludGVudHM6IGZ1bmN0aW9uIChhU2VtYW50aWNPYmplY3RzTGlzdDogYW55W10pOiBQcm9taXNlPGFueVtdPiB7XG5cdFx0Y29uc3QgYVByb21pc2VzOiBhbnlbXSA9IFtdO1xuXHRcdGlmIChhU2VtYW50aWNPYmplY3RzTGlzdCkge1xuXHRcdFx0Y29uc3Qgb1VzaGVsbENvbnRhaW5lciA9IHNhcC51c2hlbGwgJiYgc2FwLnVzaGVsbC5Db250YWluZXI7XG5cdFx0XHRjb25zdCBvU2VydmljZSA9IG9Vc2hlbGxDb250YWluZXIgJiYgb1VzaGVsbENvbnRhaW5lci5nZXRTZXJ2aWNlKFwiQ3Jvc3NBcHBsaWNhdGlvbk5hdmlnYXRpb25cIik7XG5cdFx0XHRhU2VtYW50aWNPYmplY3RzTGlzdC5mb3JFYWNoKGZ1bmN0aW9uIChzZW1PYmplY3QpIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBzZW1PYmplY3QgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0XHRhUHJvbWlzZXMucHVzaChvU2VydmljZS5nZXRQcmltYXJ5SW50ZW50KHNlbU9iamVjdCwge30pKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLmFsbChhUHJvbWlzZXMpXG5cdFx0XHQudGhlbihmdW5jdGlvbiAoYVNlbU9iamVjdFByaW1hcnlBY3Rpb24pIHtcblx0XHRcdFx0cmV0dXJuIGFTZW1PYmplY3RQcmltYXJ5QWN0aW9uO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaChmdW5jdGlvbiAob0Vycm9yKSB7XG5cdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIGZldGNoaW5nIHByaW1hcnkgaW50ZW50c1wiLCBvRXJyb3IpO1xuXHRcdFx0XHRyZXR1cm4gW107XG5cdFx0XHR9KTtcblx0fSxcblx0X1NlbWFudGljT2JqZWN0c0hhc1ByaW1hcnlBY3Rpb246IGZ1bmN0aW9uIChvU2VtYW50aWNzOiBhbnksIGFTZW1hbnRpY09iamVjdHNQcmltYXJ5QWN0aW9uczogYW55KTogYm9vbGVhbiB7XG5cdFx0Y29uc3QgX2ZuSXNTZW1hbnRpY09iamVjdEFjdGlvblVuYXZhaWxhYmxlID0gZnVuY3Rpb24gKF9vU2VtYW50aWNzOiBhbnksIF9vUHJpbWFyeUFjdGlvbjogYW55LCBfaW5kZXg6IHN0cmluZykge1xuXHRcdFx0Zm9yIChjb25zdCB1bmF2YWlsYWJsZUFjdGlvbnNJbmRleCBpbiBfb1NlbWFudGljcy5zZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9uc1tfaW5kZXhdLmFjdGlvbnMpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdF9vUHJpbWFyeUFjdGlvbi5pbnRlbnRcblx0XHRcdFx0XHRcdC5zcGxpdChcIi1cIilbMV1cblx0XHRcdFx0XHRcdC5pbmRleE9mKF9vU2VtYW50aWNzLnNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zW19pbmRleF0uYWN0aW9uc1t1bmF2YWlsYWJsZUFjdGlvbnNJbmRleF0pID09PSAwXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fTtcblx0XHRvU2VtYW50aWNzLnNlbWFudGljUHJpbWFyeUFjdGlvbnMgPSBhU2VtYW50aWNPYmplY3RzUHJpbWFyeUFjdGlvbnM7XG5cdFx0Y29uc3Qgb1ByaW1hcnlBY3Rpb24gPVxuXHRcdFx0b1NlbWFudGljcy5zZW1hbnRpY09iamVjdHMgJiZcblx0XHRcdG9TZW1hbnRpY3MubWFpblNlbWFudGljT2JqZWN0ICYmXG5cdFx0XHRvU2VtYW50aWNzLnNlbWFudGljUHJpbWFyeUFjdGlvbnNbb1NlbWFudGljcy5zZW1hbnRpY09iamVjdHMuaW5kZXhPZihvU2VtYW50aWNzLm1haW5TZW1hbnRpY09iamVjdCldO1xuXHRcdGNvbnN0IHNDdXJyZW50SGFzaCA9IENvbW1vblV0aWxzLmdldEhhc2goKTtcblx0XHRpZiAob1NlbWFudGljcy5tYWluU2VtYW50aWNPYmplY3QgJiYgb1ByaW1hcnlBY3Rpb24gIT09IG51bGwgJiYgb1ByaW1hcnlBY3Rpb24uaW50ZW50ICE9PSBzQ3VycmVudEhhc2gpIHtcblx0XHRcdGZvciAoY29uc3QgaW5kZXggaW4gb1NlbWFudGljcy5zZW1hbnRpY09iamVjdFVuYXZhaWxhYmxlQWN0aW9ucykge1xuXHRcdFx0XHRpZiAob1NlbWFudGljcy5tYWluU2VtYW50aWNPYmplY3QuaW5kZXhPZihvU2VtYW50aWNzLnNlbWFudGljT2JqZWN0VW5hdmFpbGFibGVBY3Rpb25zW2luZGV4XS5zZW1hbnRpY09iamVjdCkgPT09IDApIHtcblx0XHRcdFx0XHRyZXR1cm4gX2ZuSXNTZW1hbnRpY09iamVjdEFjdGlvblVuYXZhaWxhYmxlKG9TZW1hbnRpY3MsIG9QcmltYXJ5QWN0aW9uLCBpbmRleCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHR9LFxuXHRjaGVja1ByaW1hcnlBY3Rpb25zOiBmdW5jdGlvbiAob1NlbWFudGljczogYW55LCBiR2V0VGl0bGVMaW5rOiBib29sZWFuKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2dldFByaW1hcnlJbnRlbnRzKG9TZW1hbnRpY3MgJiYgb1NlbWFudGljcy5zZW1hbnRpY09iamVjdHMpXG5cdFx0XHQudGhlbigoYVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zOiBhbnlbXSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gYkdldFRpdGxlTGlua1xuXHRcdFx0XHRcdD8ge1xuXHRcdFx0XHRcdFx0XHR0aXRsZUxpbms6IGFTZW1hbnRpY09iamVjdHNQcmltYXJ5QWN0aW9ucyxcblx0XHRcdFx0XHRcdFx0aGFzVGl0bGVMaW5rOiB0aGlzLl9TZW1hbnRpY09iamVjdHNIYXNQcmltYXJ5QWN0aW9uKG9TZW1hbnRpY3MsIGFTZW1hbnRpY09iamVjdHNQcmltYXJ5QWN0aW9ucylcblx0XHRcdFx0XHQgIH1cblx0XHRcdFx0XHQ6IHRoaXMuX1NlbWFudGljT2JqZWN0c0hhc1ByaW1hcnlBY3Rpb24ob1NlbWFudGljcywgYVNlbWFudGljT2JqZWN0c1ByaW1hcnlBY3Rpb25zKTtcblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcikge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJFcnJvciBpbiBjaGVja1ByaW1hcnlBY3Rpb25zXCIsIG9FcnJvcik7XG5cdFx0XHR9KTtcblx0fSxcblx0X2dldFRpdGxlTGlua1dpdGhQYXJhbWV0ZXJzOiBmdW5jdGlvbiAoX29TZW1hbnRpY09iamVjdE1vZGVsOiBhbnksIF9saW5rSW50ZW50OiBzdHJpbmcpIHtcblx0XHRpZiAoX29TZW1hbnRpY09iamVjdE1vZGVsICYmIF9vU2VtYW50aWNPYmplY3RNb2RlbC50aXRsZWxpbmspIHtcblx0XHRcdHJldHVybiBfb1NlbWFudGljT2JqZWN0TW9kZWwudGl0bGVsaW5rO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gX2xpbmtJbnRlbnQ7XG5cdFx0fVxuXHR9LFxuXG5cdGdldFByaW1hcnlBY3Rpb246IGZ1bmN0aW9uIChvU2VtYW50aWNzOiBhbnkpIHtcblx0XHRyZXR1cm4gb1NlbWFudGljcy5zZW1hbnRpY1ByaW1hcnlBY3Rpb25zW29TZW1hbnRpY3Muc2VtYW50aWNPYmplY3RzLmluZGV4T2Yob1NlbWFudGljcy5tYWluU2VtYW50aWNPYmplY3QpXS5pbnRlbnRcblx0XHRcdD8gRmllbGRIZWxwZXIuX2dldFRpdGxlTGlua1dpdGhQYXJhbWV0ZXJzKFxuXHRcdFx0XHRcdG9TZW1hbnRpY3MsXG5cdFx0XHRcdFx0b1NlbWFudGljcy5zZW1hbnRpY1ByaW1hcnlBY3Rpb25zW29TZW1hbnRpY3Muc2VtYW50aWNPYmplY3RzLmluZGV4T2Yob1NlbWFudGljcy5tYWluU2VtYW50aWNPYmplY3QpXS5pbnRlbnRcblx0XHRcdCAgKVxuXHRcdFx0OiBvU2VtYW50aWNzLnByaW1hcnlJbnRlbnRBY3Rpb247XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZmV0Y2ggdGhlIGZpbHRlciByZXN0cmljdGlvbnMuIEZpbHRlciByZXN0cmljdGlvbnMgY2FuIGJlIGFubm90YXRlZCBvbiBhbiBlbnRpdHkgc2V0IG9yIGEgbmF2aWdhdGlvbiBwcm9wZXJ0eS5cblx0ICogRGVwZW5kaW5nIG9uIHRoZSBwYXRoIHRvIHdoaWNoIHRoZSBjb250cm9sIGlzIGJvdW5kLCB3ZSBjaGVjayBmb3IgZmlsdGVyIHJlc3RyaWN0aW9ucyBvbiB0aGUgY29udGV4dCBwYXRoIG9mIHRoZSBjb250cm9sLFxuXHQgKiBvciBvbiB0aGUgbmF2aWdhdGlvbiBwcm9wZXJ0eSAoaWYgdGhlcmUgaXMgYSBuYXZpZ2F0aW9uKS5cblx0ICogRWcuIElmIHRoZSB0YWJsZSBpcyBib3VuZCB0byAnL0VudGl0eVNldCcsIGZvciBwcm9wZXJ0eSBwYXRoICcvRW50aXR5U2V0L19Bc3NvY2lhdGlvbi9Qcm9wZXJ0eU5hbWUnLCB0aGUgZmlsdGVyIHJlc3RyaWN0aW9uc1xuXHQgKiBvbiAnL0VudGl0eVNldCcgd2luIG92ZXIgZmlsdGVyIHJlc3RyaWN0aW9ucyBvbiAnL0VudGl0eVNldC9fQXNzb2NpYXRpb24nLlxuXHQgKiBJZiB0aGUgdGFibGUgaXMgYm91bmQgdG8gJy9FbnRpdHlTZXQvX0Fzc29jaWF0aW9uJywgdGhlIGZpbHRlciByZXN0cmljdGlvbnMgb24gJy9FbnRpdHlTZXQvX0Fzc29jaWF0aW9uJyB3aW4gb3ZlciBmaWx0ZXJcblx0ICogcmV0cmljdGlvbnMgb24gJy9Bc3NvY2lhdGlvbkVudGl0eVNldCcuXG5cdCAqXG5cdCAqIEBwYXJhbSBpQ29udGV4dCBDb250ZXh0IHVzZWQgZHVyaW5nIHRlbXBsYXRpbmdcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eSBQcm9wZXJ0eSBvYmplY3QgaW4gdGhlIG1ldGFkYXRhXG5cdCAqIEBwYXJhbSBiVXNlU2VtYW50aWNEYXRlUmFuZ2UgQm9vbGVhbiBTdWdnZXN0cyBpZiBzZW1hbnRpYyBkYXRlIHJhbmdlIHNob3VsZCBiZSB1c2VkXG5cdCAqIEBwYXJhbSBzU2V0dGluZ3MgU3RyaW5naWZpZWQgb2JqZWN0IG9mIHRoZSBwcm9wZXJ0eSBzZXR0aW5nc1xuXHQgKiBAcGFyYW0gY29udGV4dFBhdGggUGF0aCB0byB3aGljaCB0aGUgcGFyZW50IGNvbnRyb2wgKHRoZSB0YWJsZSBvciB0aGUgZmlsdGVyIGJhcikgaXMgYm91bmRcblx0ICogQHJldHVybnMgU3RyaW5nIGNvbnRhaW5pbmcgY29tbWEtc2VwYXJhdGVkIGxpc3Qgb2Ygb3BlcmF0b3JzIGZvciBmaWx0ZXJpbmdcblx0ICovXG5cdG9wZXJhdG9yczogZnVuY3Rpb24gKGlDb250ZXh0OiBhbnksIG9Qcm9wZXJ0eTogYW55LCBiVXNlU2VtYW50aWNEYXRlUmFuZ2U6IGJvb2xlYW4sIHNTZXR0aW5nczogc3RyaW5nLCBjb250ZXh0UGF0aDogc3RyaW5nKSB7XG5cdFx0aWYgKCFvUHJvcGVydHkgfHwgIWNvbnRleHRQYXRoKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRsZXQgb3BlcmF0b3JzOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSBpQ29udGV4dC5nZXRJbnRlcmZhY2UoMCkuZ2V0TW9kZWwoMSkuY3JlYXRlQmluZGluZ0NvbnRleHQoaUNvbnRleHQuZ2V0SW50ZXJmYWNlKDApLmdldFBhdGgoMSkpO1xuXHRcdGNvbnN0IHNQcm9wZXJ0eSA9IEZpZWxkSGVscGVyLnByb3BlcnR5TmFtZShvUHJvcGVydHksIHsgY29udGV4dDogb0NvbnRleHQgfSk7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdHNQcm9wZXJ0eVBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRzUHJvcGVydHlMb2NhdGlvblBhdGggPSBDb21tb25IZWxwZXIuZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgob01vZGVsLCBzUHJvcGVydHlQYXRoKSxcblx0XHRcdHByb3BlcnR5VHlwZSA9IG9Qcm9wZXJ0eS4kVHlwZTtcblxuXHRcdGlmIChwcm9wZXJ0eVR5cGUgPT09IFwiRWRtLkd1aWRcIikge1xuXHRcdFx0cmV0dXJuIENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0Zvckd1aWRQcm9wZXJ0eSgpO1xuXHRcdH1cblxuXHRcdC8vIHJlbW92ZSAnLydcblx0XHRjb250ZXh0UGF0aCA9IGNvbnRleHRQYXRoLnNsaWNlKDAsIC0xKTtcblx0XHRjb25zdCBpc1RhYmxlQm91bmRUb05hdmlnYXRpb246IEJvb2xlYW4gPSBjb250ZXh0UGF0aC5sYXN0SW5kZXhPZihcIi9cIikgPiAwO1xuXHRcdGNvbnN0IGlzTmF2aWdhdGlvblBhdGg6IEJvb2xlYW4gPVxuXHRcdFx0KGlzVGFibGVCb3VuZFRvTmF2aWdhdGlvbiAmJiBjb250ZXh0UGF0aCAhPT0gc1Byb3BlcnR5TG9jYXRpb25QYXRoKSB8fFxuXHRcdFx0KCFpc1RhYmxlQm91bmRUb05hdmlnYXRpb24gJiYgc1Byb3BlcnR5TG9jYXRpb25QYXRoLmxhc3RJbmRleE9mKFwiL1wiKSA+IDApO1xuXHRcdGNvbnN0IG5hdmlnYXRpb25QYXRoOiBzdHJpbmcgPVxuXHRcdFx0KGlzTmF2aWdhdGlvblBhdGggJiYgc1Byb3BlcnR5TG9jYXRpb25QYXRoLnN1YnN0cihzUHJvcGVydHlMb2NhdGlvblBhdGguaW5kZXhPZihjb250ZXh0UGF0aCkgKyBjb250ZXh0UGF0aC5sZW5ndGggKyAxKSkgfHwgXCJcIjtcblx0XHRjb25zdCBwcm9wZXJ0eVBhdGg6IHN0cmluZyA9IChpc05hdmlnYXRpb25QYXRoICYmIG5hdmlnYXRpb25QYXRoICsgXCIvXCIgKyBzUHJvcGVydHkpIHx8IHNQcm9wZXJ0eTtcblxuXHRcdGlmICghaXNUYWJsZUJvdW5kVG9OYXZpZ2F0aW9uKSB7XG5cdFx0XHRpZiAoIWlzTmF2aWdhdGlvblBhdGgpIHtcblx0XHRcdFx0Ly8gL1NhbGVzT3JkZXJNYW5hZ2UvSURcblx0XHRcdFx0b3BlcmF0b3JzID0gQ29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkoXG5cdFx0XHRcdFx0c1Byb3BlcnR5LFxuXHRcdFx0XHRcdHNQcm9wZXJ0eUxvY2F0aW9uUGF0aCxcblx0XHRcdFx0XHRvQ29udGV4dCxcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGUsXG5cdFx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdHNTZXR0aW5nc1xuXHRcdFx0XHQpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gL1NhbGVzT3JkZXJNYW5hbmdlL19JdGVtL01hdGVyaWFsXG5cdFx0XHRcdC8vbGV0IG9wZXJhdG9yc1xuXHRcdFx0XHRvcGVyYXRvcnMgPVxuXHRcdFx0XHRcdENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvclByb3BlcnR5KFxuXHRcdFx0XHRcdFx0cHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdFx0Y29udGV4dFBhdGgsXG5cdFx0XHRcdFx0XHRvQ29udGV4dCxcblx0XHRcdFx0XHRcdHByb3BlcnR5VHlwZSxcblx0XHRcdFx0XHRcdGJVc2VTZW1hbnRpY0RhdGVSYW5nZSxcblx0XHRcdFx0XHRcdHNTZXR0aW5nc1xuXHRcdFx0XHRcdCkgfHxcblx0XHRcdFx0XHRDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShcblx0XHRcdFx0XHRcdHNQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdHNQcm9wZXJ0eUxvY2F0aW9uUGF0aCxcblx0XHRcdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHRcdFx0cHJvcGVydHlUeXBlLFxuXHRcdFx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdFx0c1NldHRpbmdzXG5cdFx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKCFpc05hdmlnYXRpb25QYXRoKSB7XG5cdFx0XHQvLyAvU2FsZXNPcmRlck1hbmFnZS9fSXRlbS9NYXRlcmlhbFxuXHRcdFx0b3BlcmF0b3JzID1cblx0XHRcdFx0Q29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkocHJvcGVydHlQYXRoLCBjb250ZXh0UGF0aCwgb0NvbnRleHQsIHByb3BlcnR5VHlwZSwgYlVzZVNlbWFudGljRGF0ZVJhbmdlLCBzU2V0dGluZ3MpIHx8XG5cdFx0XHRcdENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvclByb3BlcnR5KFxuXHRcdFx0XHRcdHNQcm9wZXJ0eSxcblx0XHRcdFx0XHRNb2RlbEhlbHBlci5nZXRFbnRpdHlTZXRQYXRoKGNvbnRleHRQYXRoKSxcblx0XHRcdFx0XHRvQ29udGV4dCxcblx0XHRcdFx0XHRwcm9wZXJ0eVR5cGUsXG5cdFx0XHRcdFx0YlVzZVNlbWFudGljRGF0ZVJhbmdlLFxuXHRcdFx0XHRcdHNTZXR0aW5nc1xuXHRcdFx0XHQpO1xuXHRcdFx0cmV0dXJuIG9wZXJhdG9ycztcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gL1NhbGVzT3JkZXJNYW5hZ2UvX0l0ZW0vX0Fzc29jaWF0aW9uL1Byb3BlcnR5TmFtZVxuXHRcdFx0Ly8gVGhpcyBpcyBjdXJyZW50bHkgbm90IHN1cHBvcnRlZCBmb3IgdGFibGVzXG5cdFx0XHRvcGVyYXRvcnMgPVxuXHRcdFx0XHRDb21tb25VdGlscy5nZXRPcGVyYXRvcnNGb3JQcm9wZXJ0eShwcm9wZXJ0eVBhdGgsIGNvbnRleHRQYXRoLCBvQ29udGV4dCwgcHJvcGVydHlUeXBlLCBiVXNlU2VtYW50aWNEYXRlUmFuZ2UsIHNTZXR0aW5ncykgfHxcblx0XHRcdFx0Q29tbW9uVXRpbHMuZ2V0T3BlcmF0b3JzRm9yUHJvcGVydHkoXG5cdFx0XHRcdFx0cHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdE1vZGVsSGVscGVyLmdldEVudGl0eVNldFBhdGgoY29udGV4dFBhdGgpLFxuXHRcdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHRcdHByb3BlcnR5VHlwZSxcblx0XHRcdFx0XHRiVXNlU2VtYW50aWNEYXRlUmFuZ2UsXG5cdFx0XHRcdFx0c1NldHRpbmdzXG5cdFx0XHRcdCk7XG5cdFx0fVxuXG5cdFx0aWYgKCFvcGVyYXRvcnMgJiYgKHByb3BlcnR5VHlwZSA9PT0gXCJFZG0uRGF0ZVwiIHx8IHByb3BlcnR5VHlwZSA9PT0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIikpIHtcblx0XHRcdG9wZXJhdG9ycyA9IENvbW1vblV0aWxzLmdldE9wZXJhdG9yc0ZvckRhdGVQcm9wZXJ0eShwcm9wZXJ0eVR5cGUpO1xuXHRcdH1cblxuXHRcdHJldHVybiBvcGVyYXRvcnM7XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIHByb3BlcnR5IGNvbnRleHQgZm9yIHVzYWdlIGluIFF1aWNrVmlld0Zvcm0uXG5cdCAqXG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkQ29udGV4dCBDb250ZXh0IG9mIHRoZSBkYXRhIGZpZWxkIG9yIGFzc29jaWF0ZWQgcHJvcGVydHlcblx0ICogQHJldHVybnMgQmluZGluZyBjb250ZXh0XG5cdCAqL1xuXHRnZXRQcm9wZXJ0eUNvbnRleHRGb3JRdWlja1ZpZXdGb3JtOiBmdW5jdGlvbiAob0RhdGFGaWVsZENvbnRleHQ6IGFueSkge1xuXHRcdGlmIChvRGF0YUZpZWxkQ29udGV4dC5nZXRPYmplY3QoXCJWYWx1ZVwiKSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBDcmVhdGUgYSBiaW5kaW5nIGNvbnRleHQgdG8gdGhlIHByb3BlcnR5IGZyb20gdGhlIGRhdGEgZmllbGQuXG5cdFx0XHRjb25zdCBvSW50ZXJmYWNlID0gb0RhdGFGaWVsZENvbnRleHQuZ2V0SW50ZXJmYWNlKCksXG5cdFx0XHRcdG9Nb2RlbCA9IG9JbnRlcmZhY2UuZ2V0TW9kZWwoKTtcblx0XHRcdGxldCBzUGF0aCA9IG9JbnRlcmZhY2UuZ2V0UGF0aCgpO1xuXHRcdFx0c1BhdGggPSBzUGF0aCArIChzUGF0aC5lbmRzV2l0aChcIi9cIikgPyBcIlZhbHVlXCIgOiBcIi9WYWx1ZVwiKTtcblx0XHRcdHJldHVybiBvTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoc1BhdGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBJdCBpcyBhIHByb3BlcnR5LiBKdXN0IHJldHVybiB0aGUgY29udGV4dCBhcyBpdCBpcy5cblx0XHRcdHJldHVybiBvRGF0YUZpZWxkQ29udGV4dDtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIGJpbmRpbmcgY29udGV4dCBjb3JyZXNwb25kaW5nIHRvIHRoZSBwcm9wZXJ0eSBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5Q29udGV4dCBDb250ZXh0IG9mIHRoZSBwcm9wZXJ0eVxuXHQgKiBAcmV0dXJucyBCaW5kaW5nIGNvbnRleHRcblx0ICovXG5cdGdldFByb3BlcnR5UGF0aEZvclF1aWNrVmlld0Zvcm06IGZ1bmN0aW9uIChvUHJvcGVydHlDb250ZXh0OiBhbnkpIHtcblx0XHRpZiAob1Byb3BlcnR5Q29udGV4dCAmJiBvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdChcIiRQYXRoXCIpKSB7XG5cdFx0XHRjb25zdCBvSW50ZXJmYWNlID0gb1Byb3BlcnR5Q29udGV4dC5nZXRJbnRlcmZhY2UoKSxcblx0XHRcdFx0b01vZGVsID0gb0ludGVyZmFjZS5nZXRNb2RlbCgpO1xuXHRcdFx0bGV0IHNQYXRoID0gb0ludGVyZmFjZS5nZXRQYXRoKCk7XG5cdFx0XHRzUGF0aCA9IHNQYXRoICsgKHNQYXRoLmVuZHNXaXRoKFwiL1wiKSA/IFwiJFBhdGhcIiA6IFwiLyRQYXRoXCIpO1xuXHRcdFx0cmV0dXJuIG9Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChzUGF0aCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9Qcm9wZXJ0eUNvbnRleHQ7XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIHBhdGggb2YgdGhlIERhRmllbGREZWZhdWx0IChpZiBhbnkpLiBPdGhlcndpc2UsIHRoZSBEYXRhRmllbGQgcGF0aCBpcyByZXR1cm5lZC5cblx0ICpcblx0ICogQHBhcmFtIG9EYXRhRmllbGRDb250ZXh0IENvbnRleHQgb2YgdGhlIERhdGFGaWVsZFxuXHQgKiBAcmV0dXJucyBPYmplY3QgcGF0aFxuXHQgKi9cblx0Z2V0RGF0YUZpZWxkRGVmYXVsdDogZnVuY3Rpb24gKG9EYXRhRmllbGRDb250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBvRGF0YUZpZWxkRGVmYXVsdCA9IG9EYXRhRmllbGRDb250ZXh0XG5cdFx0XHQuZ2V0TW9kZWwoKVxuXHRcdFx0LmdldE9iamVjdChgJHtvRGF0YUZpZWxkQ29udGV4dC5nZXRQYXRoKCl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZERlZmF1bHRgKTtcblx0XHRyZXR1cm4gb0RhdGFGaWVsZERlZmF1bHRcblx0XHRcdD8gYCR7b0RhdGFGaWVsZENvbnRleHQuZ2V0UGF0aCgpfUBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGREZWZhdWx0YFxuXHRcdFx0OiBvRGF0YUZpZWxkQ29udGV4dC5nZXRQYXRoKCk7XG5cdH0sXG5cdC8qXG5cdCAqIE1ldGhvZCB0byBnZXQgdmlzaWJsZSBleHByZXNzaW9uIGZvciBEYXRhRmllbGRBY3Rpb25CdXR0b25cblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzRGF0YUZpZWxkQWN0aW9uQnV0dG9uVmlzaWJsZVxuXHQgKiBAcGFyYW0ge29iamVjdH0gb1RoaXMgLSBDdXJyZW50IE9iamVjdFxuXHQgKiBAcGFyYW0ge29iamVjdH0gb0RhdGFGaWVsZCAtIERhdGFQb2ludCdzIFZhbHVlXG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gYklzQm91bmQgLSBEYXRhUG9pbnQgYWN0aW9uIGJvdW5kXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBvQWN0aW9uQ29udGV4dCAtIEFjdGlvbkNvbnRleHQgVmFsdWVcblx0ICogQHJldHVybiB7Ym9vbGVhbn0gLSByZXR1cm5zIGJvb2xlYW5cblx0ICovXG5cdGlzRGF0YUZpZWxkQWN0aW9uQnV0dG9uVmlzaWJsZTogZnVuY3Rpb24gKG9UaGlzOiBhbnksIG9EYXRhRmllbGQ6IGFueSwgYklzQm91bmQ6IGFueSwgb0FjdGlvbkNvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiBvRGF0YUZpZWxkW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXSAhPT0gdHJ1ZSAmJiAoYklzQm91bmQgIT09IHRydWUgfHwgb0FjdGlvbkNvbnRleHQgIT09IGZhbHNlKTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgcHJlc3MgZXZlbnQgZm9yIERhdGFGaWVsZEFjdGlvbkJ1dHRvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFByZXNzRXZlbnRGb3JEYXRhRmllbGRBY3Rpb25CdXR0b25cblx0ICogQHBhcmFtIG9UaGlzIEN1cnJlbnQgT2JqZWN0XG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkIERhdGFQb2ludCdzIFZhbHVlXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBEYXRhRmllbGRBY3Rpb25CdXR0b24gcHJlc3MgZXZlbnRcblx0ICovXG5cdGdldFByZXNzRXZlbnRGb3JEYXRhRmllbGRBY3Rpb25CdXR0b246IGZ1bmN0aW9uIChvVGhpczogYW55LCBvRGF0YUZpZWxkOiBhbnkpIHtcblx0XHRsZXQgc0ludm9jYXRpb25Hcm91cGluZyA9IFwiSXNvbGF0ZWRcIjtcblx0XHRpZiAoXG5cdFx0XHRvRGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZyAmJlxuXHRcdFx0b0RhdGFGaWVsZC5JbnZvY2F0aW9uR3JvdXBpbmcuJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuT3BlcmF0aW9uR3JvdXBpbmdUeXBlL0NoYW5nZVNldFwiXG5cdFx0KSB7XG5cdFx0XHRzSW52b2NhdGlvbkdyb3VwaW5nID0gXCJDaGFuZ2VTZXRcIjtcblx0XHR9XG5cdFx0bGV0IGJJc05hdmlnYWJsZSA9IG9UaGlzLm5hdmlnYXRlQWZ0ZXJBY3Rpb247XG5cdFx0YklzTmF2aWdhYmxlID0gYklzTmF2aWdhYmxlID09PSBcImZhbHNlXCIgPyBmYWxzZSA6IHRydWU7XG5cblx0XHRjb25zdCBlbnRpdGllczogQXJyYXk8c3RyaW5nPiA9IG9UaGlzPy5lbnRpdHlTZXQ/LmdldFBhdGgoKS5zcGxpdChcIi9cIik7XG5cdFx0Y29uc3QgZW50aXR5U2V0TmFtZTogc3RyaW5nID0gZW50aXRpZXNbZW50aXRpZXMubGVuZ3RoIC0gMV07XG5cblx0XHRjb25zdCBvUGFyYW1zID0ge1xuXHRcdFx0Y29udGV4dHM6IFwiJHskc291cmNlPi99LmdldEJpbmRpbmdDb250ZXh0KClcIixcblx0XHRcdGludm9jYXRpb25Hcm91cGluZzogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzSW52b2NhdGlvbkdyb3VwaW5nKSxcblx0XHRcdG1vZGVsOiBcIiR7JHNvdXJjZT4vfS5nZXRNb2RlbCgpXCIsXG5cdFx0XHRsYWJlbDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvRGF0YUZpZWxkLkxhYmVsLCB0cnVlKSxcblx0XHRcdGlzTmF2aWdhYmxlOiBiSXNOYXZpZ2FibGUsXG5cdFx0XHRlbnRpdHlTZXROYW1lOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKGVudGl0eVNldE5hbWUpXG5cdFx0fTtcblxuXHRcdHJldHVybiBDb21tb25IZWxwZXIuZ2VuZXJhdGVGdW5jdGlvbihcblx0XHRcdFwiLmVkaXRGbG93Lmludm9rZUFjdGlvblwiLFxuXHRcdFx0Q29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvRGF0YUZpZWxkLkFjdGlvbiksXG5cdFx0XHRDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob1BhcmFtcylcblx0XHQpO1xuXHR9LFxuXG5cdGlzTnVtZXJpY0RhdGFUeXBlOiBmdW5jdGlvbiAoc0RhdGFGaWVsZFR5cGU6IGFueSkge1xuXHRcdGNvbnN0IF9zRGF0YUZpZWxkVHlwZSA9IHNEYXRhRmllbGRUeXBlO1xuXHRcdGlmIChfc0RhdGFGaWVsZFR5cGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgYU51bWVyaWNEYXRhVHlwZXMgPSBbXG5cdFx0XHRcdFwiRWRtLkludDE2XCIsXG5cdFx0XHRcdFwiRWRtLkludDMyXCIsXG5cdFx0XHRcdFwiRWRtLkludDY0XCIsXG5cdFx0XHRcdFwiRWRtLkJ5dGVcIixcblx0XHRcdFx0XCJFZG0uU0J5dGVcIixcblx0XHRcdFx0XCJFZG0uU2luZ2xlXCIsXG5cdFx0XHRcdFwiRWRtLkRlY2ltYWxcIixcblx0XHRcdFx0XCJFZG0uRG91YmxlXCJcblx0XHRcdF07XG5cdFx0XHRyZXR1cm4gYU51bWVyaWNEYXRhVHlwZXMuaW5kZXhPZihfc0RhdGFGaWVsZFR5cGUpID09PSAtMSA/IGZhbHNlIDogdHJ1ZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblxuXHRpc0RhdGVPclRpbWVEYXRhVHlwZTogZnVuY3Rpb24gKHNQcm9wZXJ0eVR5cGU6IGFueSkge1xuXHRcdGlmIChzUHJvcGVydHlUeXBlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnN0IGFEYXRlVGltZURhdGFUeXBlcyA9IFtcIkVkbS5EYXRlVGltZU9mZnNldFwiLCBcIkVkbS5EYXRlVGltZVwiLCBcIkVkbS5EYXRlXCIsIFwiRWRtLlRpbWVPZkRheVwiLCBcIkVkbS5UaW1lXCJdO1xuXHRcdFx0cmV0dXJuIGFEYXRlVGltZURhdGFUeXBlcy5pbmRleE9mKHNQcm9wZXJ0eVR5cGUpID4gLTE7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdH0sXG5cdGlzRGF0ZVRpbWVEYXRhVHlwZTogZnVuY3Rpb24gKHNQcm9wZXJ0eVR5cGU6IGFueSkge1xuXHRcdGlmIChzUHJvcGVydHlUeXBlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnN0IGFEYXRlRGF0YVR5cGVzID0gW1wiRWRtLkRhdGVUaW1lT2Zmc2V0XCIsIFwiRWRtLkRhdGVUaW1lXCJdO1xuXHRcdFx0cmV0dXJuIGFEYXRlRGF0YVR5cGVzLmluZGV4T2Yoc1Byb3BlcnR5VHlwZSkgPiAtMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblx0aXNEYXRlRGF0YVR5cGU6IGZ1bmN0aW9uIChzUHJvcGVydHlUeXBlOiBhbnkpIHtcblx0XHRyZXR1cm4gc1Byb3BlcnR5VHlwZSA9PT0gXCJFZG0uRGF0ZVwiO1xuXHR9LFxuXHRpc1RpbWVEYXRhVHlwZTogZnVuY3Rpb24gKHNQcm9wZXJ0eVR5cGU6IGFueSkge1xuXHRcdGlmIChzUHJvcGVydHlUeXBlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdGNvbnN0IGFEYXRlRGF0YVR5cGVzID0gW1wiRWRtLlRpbWVPZkRheVwiLCBcIkVkbS5UaW1lXCJdO1xuXHRcdFx0cmV0dXJuIGFEYXRlRGF0YVR5cGVzLmluZGV4T2Yoc1Byb3BlcnR5VHlwZSkgPiAtMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHJldHVybiB0aGUgdW5kZXJseWluZyBwcm9wZXJ0eSBkYXRhIHR5cGUgaW4gY2FzZSBUZXh0QXJyYW5nZW1lbnQgYW5ub3RhdGlvbiBvZiBUZXh0IGFubm90YXRpb24gJ1RleHRPbmx5JyBleGlzdHMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQW5ub3RhdGlvbnMgQWxsIHRoZSBhbm5vdGF0aW9ucyBvZiBhIHByb3BlcnR5XG5cdCAqIEBwYXJhbSBvTW9kZWwgQW4gaW5zdGFuY2Ugb2YgT0RhdGEgdjQgbW9kZWxcblx0ICogQHBhcmFtIHNFbnRpdHlQYXRoIFRoZSBwYXRoIHRvIHJvb3QgRW50aXR5XG5cdCAqIEBwYXJhbSBzVHlwZSBUaGUgcHJvcGVydHkgZGF0YSB0eXBlXG5cdCAqIEByZXR1cm5zIFRoZSB1bmRlcmx5aW5nIHByb3BlcnR5IGRhdGEgdHlwZSBmb3IgVGV4dE9ubHkgYW5ub3RhdGVkIHByb3BlcnR5LCBvdGhlcndpc2UgdGhlIG9yaWdpbmFsIGRhdGEgdHlwZS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldFVuZGVybHlpbmdQcm9wZXJ0eURhdGFUeXBlOiBmdW5jdGlvbiAob0Fubm90YXRpb25zOiBhbnksIG9Nb2RlbDogT0RhdGFNZXRhTW9kZWwsIHNFbnRpdHlQYXRoOiBzdHJpbmcsIHNUeXBlOiBzdHJpbmcpIHtcblx0XHRjb25zdCBzVGV4dEFubm90YXRpb24gPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiLFxuXHRcdFx0c1RleHRBcnJhbmdlbWVudEFubm90YXRpb24gPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIjtcblx0XHRpZiAoXG5cdFx0XHQhIW9Bbm5vdGF0aW9ucyAmJlxuXHRcdFx0ISFvQW5ub3RhdGlvbnNbc1RleHRBcnJhbmdlbWVudEFubm90YXRpb25dICYmXG5cdFx0XHRvQW5ub3RhdGlvbnNbc1RleHRBcnJhbmdlbWVudEFubm90YXRpb25dLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGUvVGV4dE9ubHlcIiAmJlxuXHRcdFx0ISFvQW5ub3RhdGlvbnNbc1RleHRBbm5vdGF0aW9uXSAmJlxuXHRcdFx0ISFvQW5ub3RhdGlvbnNbc1RleHRBbm5vdGF0aW9uXS4kUGF0aFxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9LyR7b0Fubm90YXRpb25zW3NUZXh0QW5ub3RhdGlvbl0uJFBhdGh9LyRUeXBlYCk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNUeXBlO1xuXHR9LFxuXG5cdGdldENvbHVtbkFsaWdubWVudDogZnVuY3Rpb24gKG9EYXRhRmllbGQ6IGFueSwgb1RhYmxlOiBhbnkpIHtcblx0XHRjb25zdCBzRW50aXR5UGF0aCA9IG9UYWJsZS5jb2xsZWN0aW9uLnNQYXRoLFxuXHRcdFx0b01vZGVsID0gb1RhYmxlLmNvbGxlY3Rpb24ub01vZGVsO1xuXHRcdGlmIChcblx0XHRcdChvRGF0YUZpZWxkW1wiJFR5cGVcIl0gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCIgfHxcblx0XHRcdFx0b0RhdGFGaWVsZFtcIiRUeXBlXCJdID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiKSAmJlxuXHRcdFx0b0RhdGFGaWVsZC5JbmxpbmUgJiZcblx0XHRcdG9EYXRhRmllbGQuSWNvblVybFxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIFwiQ2VudGVyXCI7XG5cdFx0fVxuXHRcdC8vIENvbHVtbnMgY29udGFpbmluZyBhIFNlbWFudGljIEtleSBtdXN0IGJlIEJlZ2luIGFsaWduZWRcblx0XHRjb25zdCBhU2VtYW50aWNLZXlzID0gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY0tleWApO1xuXHRcdGlmIChvRGF0YUZpZWxkW1wiJFR5cGVcIl0gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCIpIHtcblx0XHRcdGNvbnN0IHNQcm9wZXJ0eVBhdGggPSBvRGF0YUZpZWxkLlZhbHVlLiRQYXRoO1xuXHRcdFx0Y29uc3QgYklzU2VtYW50aWNLZXkgPVxuXHRcdFx0XHRhU2VtYW50aWNLZXlzICYmXG5cdFx0XHRcdCFhU2VtYW50aWNLZXlzLmV2ZXJ5KGZ1bmN0aW9uIChvS2V5OiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gb0tleS4kUHJvcGVydHlQYXRoICE9PSBzUHJvcGVydHlQYXRoO1xuXHRcdFx0XHR9KTtcblx0XHRcdGlmIChiSXNTZW1hbnRpY0tleSkge1xuXHRcdFx0XHRyZXR1cm4gXCJCZWdpblwiO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gRmllbGRIZWxwZXIuZ2V0RGF0YUZpZWxkQWxpZ25tZW50KG9EYXRhRmllbGQsIG9Nb2RlbCwgc0VudGl0eVBhdGgpO1xuXHR9LFxuXHQvKipcblx0ICogR2V0IGFsaWdubWVudCBiYXNlZCBvbmx5IG9uIHRoZSBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIHNUeXBlIFRoZSBwcm9wZXJ0eSdzIHR5cGVcblx0ICogQHBhcmFtIG9Gb3JtYXRPcHRpb25zIFRoZSBmaWVsZCBmb3JtYXQgb3B0aW9uc1xuXHQgKiBAcGFyYW0gW29Db21wdXRlZEVkaXRNb2RlXSBUaGUgY29tcHV0ZWQgRWRpdCBtb2RlIG9mIHRoZSBwcm9wZXJ0eSBpcyBlbXB0eSB3aGVuIGRpcmVjdGx5IGNhbGxlZCBmcm9tIHRoZSBDb2x1bW5Qcm9wZXJ0eSBmcmFnbWVudFxuXHQgKiBAcmV0dXJucyBUaGUgcHJvcGVydHkgYWxpZ25tZW50XG5cdCAqL1xuXHRnZXRQcm9wZXJ0eUFsaWdubWVudDogZnVuY3Rpb24gKHNUeXBlOiBzdHJpbmcsIG9Gb3JtYXRPcHRpb25zOiBhbnksIG9Db21wdXRlZEVkaXRNb2RlPzogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz4pIHtcblx0XHRsZXQgc0RlZmF1bHRBbGlnbm1lbnQgPSBcIkJlZ2luXCIgYXMgYW55O1xuXHRcdGNvbnN0IHNUZXh0QWxpZ25tZW50ID0gb0Zvcm1hdE9wdGlvbnMgPyBvRm9ybWF0T3B0aW9ucy50ZXh0QWxpZ25Nb2RlIDogXCJcIjtcblx0XHRzd2l0Y2ggKHNUZXh0QWxpZ25tZW50KSB7XG5cdFx0XHRjYXNlIFwiRm9ybVwiOlxuXHRcdFx0XHRpZiAodGhpcy5pc051bWVyaWNEYXRhVHlwZShzVHlwZSkpIHtcblx0XHRcdFx0XHRzRGVmYXVsdEFsaWdubWVudCA9IFwiQmVnaW5cIjtcblx0XHRcdFx0XHRpZiAob0NvbXB1dGVkRWRpdE1vZGUpIHtcblx0XHRcdFx0XHRcdHNEZWZhdWx0QWxpZ25tZW50ID0gZ2V0QWxpZ25tZW50RXhwcmVzc2lvbihvQ29tcHV0ZWRFZGl0TW9kZSwgXCJCZWdpblwiLCBcIkVuZFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAodGhpcy5pc051bWVyaWNEYXRhVHlwZShzVHlwZSkgfHwgdGhpcy5pc0RhdGVPclRpbWVEYXRhVHlwZShzVHlwZSkpIHtcblx0XHRcdFx0XHRzRGVmYXVsdEFsaWdubWVudCA9IFwiUmlnaHRcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHR9XG5cdFx0cmV0dXJuIHNEZWZhdWx0QWxpZ25tZW50O1xuXHR9LFxuXG5cdGdldERhdGFGaWVsZEFsaWdubWVudDogZnVuY3Rpb24gKG9EYXRhRmllbGQ6IGFueSwgb01vZGVsOiBhbnksIHNFbnRpdHlQYXRoOiBhbnksIG9Gb3JtYXRPcHRpb25zPzogYW55LCBvQ29tcHV0ZWRFZGl0TW9kZT86IGFueSkge1xuXHRcdGxldCBzRGF0YUZpZWxkUGF0aCxcblx0XHRcdHNEZWZhdWx0QWxpZ25tZW50ID0gXCJCZWdpblwiLFxuXHRcdFx0c1R5cGUsXG5cdFx0XHRvQW5ub3RhdGlvbnM7XG5cblx0XHRpZiAob0RhdGFGaWVsZFtcIiRUeXBlXCJdID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIikge1xuXHRcdFx0c0RhdGFGaWVsZFBhdGggPSBvRGF0YUZpZWxkLlRhcmdldC4kQW5ub3RhdGlvblBhdGg7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0W1wiJEFubm90YXRpb25QYXRoXCJdICYmXG5cdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0W1wiJEFubm90YXRpb25QYXRoXCJdLmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GaWVsZEdyb3VwXCIpID49IDBcblx0XHRcdCkge1xuXHRcdFx0XHRjb25zdCBvRmllbGRHcm91cCA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9LyR7c0RhdGFGaWVsZFBhdGh9YCk7XG5cblx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvRmllbGRHcm91cC5EYXRhLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0c1R5cGUgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofS9EYXRhLyR7aS50b1N0cmluZygpfS9WYWx1ZS8kUGF0aC8kVHlwZWApO1xuXHRcdFx0XHRcdG9Bbm5vdGF0aW9ucyA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9LyR7c0RhdGFGaWVsZFBhdGh9L0RhdGEvJHtpLnRvU3RyaW5nKCl9L1ZhbHVlLyRQYXRoQGApO1xuXHRcdFx0XHRcdHNUeXBlID0gdGhpcy5nZXRVbmRlcmx5aW5nUHJvcGVydHlEYXRhVHlwZShvQW5ub3RhdGlvbnMsIG9Nb2RlbCwgc0VudGl0eVBhdGgsIHNUeXBlKTtcblx0XHRcdFx0XHRzRGVmYXVsdEFsaWdubWVudCA9IHRoaXMuZ2V0UHJvcGVydHlBbGlnbm1lbnQoc1R5cGUsIG9Gb3JtYXRPcHRpb25zLCBvQ29tcHV0ZWRFZGl0TW9kZSk7XG5cblx0XHRcdFx0XHRpZiAoc0RlZmF1bHRBbGlnbm1lbnQgPT09IFwiQmVnaW5cIikge1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBzRGVmYXVsdEFsaWdubWVudDtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0W1wiJEFubm90YXRpb25QYXRoXCJdICYmXG5cdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0W1wiJEFubm90YXRpb25QYXRoXCJdLmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIikgPj0gMCAmJlxuXHRcdFx0XHRvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofS9WaXN1YWxpemF0aW9uLyRFbnVtTWVtYmVyYCkgPT09XG5cdFx0XHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WaXN1YWxpemF0aW9uVHlwZS9SYXRpbmdcIlxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiBzRGVmYXVsdEFsaWdubWVudDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHNUeXBlID0gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vJHtzRGF0YUZpZWxkUGF0aH0vJFR5cGVgKTtcblx0XHRcdFx0aWYgKHNUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFR5cGVcIikge1xuXHRcdFx0XHRcdHNUeXBlID0gb01vZGVsLmdldE9iamVjdChgJHtzRW50aXR5UGF0aH0vJHtzRGF0YUZpZWxkUGF0aH0vVmFsdWUvJFBhdGgvJFR5cGVgKTtcblx0XHRcdFx0XHRvQW5ub3RhdGlvbnMgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofS9WYWx1ZS8kUGF0aEBgKTtcblx0XHRcdFx0XHRzVHlwZSA9IHRoaXMuZ2V0VW5kZXJseWluZ1Byb3BlcnR5RGF0YVR5cGUob0Fubm90YXRpb25zLCBvTW9kZWwsIHNFbnRpdHlQYXRoLCBzVHlwZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0c0RlZmF1bHRBbGlnbm1lbnQgPSB0aGlzLmdldFByb3BlcnR5QWxpZ25tZW50KHNUeXBlLCBvRm9ybWF0T3B0aW9ucywgb0NvbXB1dGVkRWRpdE1vZGUpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRzRGF0YUZpZWxkUGF0aCA9IG9EYXRhRmllbGQuVmFsdWUuJFBhdGg7XG5cdFx0XHRzVHlwZSA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9LyR7c0RhdGFGaWVsZFBhdGh9LyRUeXBlYCk7XG5cdFx0XHRvQW5ub3RhdGlvbnMgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NFbnRpdHlQYXRofS8ke3NEYXRhRmllbGRQYXRofUBgKTtcblx0XHRcdHNUeXBlID0gdGhpcy5nZXRVbmRlcmx5aW5nUHJvcGVydHlEYXRhVHlwZShvQW5ub3RhdGlvbnMsIG9Nb2RlbCwgc0VudGl0eVBhdGgsIHNUeXBlKTtcblx0XHRcdGlmICghKG9Nb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVBhdGh9L2ApW1wiJEtleVwiXS5pbmRleE9mKHNEYXRhRmllbGRQYXRoKSA9PT0gMCkpIHtcblx0XHRcdFx0c0RlZmF1bHRBbGlnbm1lbnQgPSB0aGlzLmdldFByb3BlcnR5QWxpZ25tZW50KHNUeXBlLCBvRm9ybWF0T3B0aW9ucywgb0NvbXB1dGVkRWRpdE1vZGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gc0RlZmF1bHRBbGlnbm1lbnQ7XG5cdH0sXG5cdGdldFR5cGVBbGlnbm1lbnQ6IGZ1bmN0aW9uIChcblx0XHRvQ29udGV4dDogYW55LFxuXHRcdG9EYXRhRmllbGQ6IGFueSxcblx0XHRvRm9ybWF0T3B0aW9uczogYW55LFxuXHRcdHNFbnRpdHlQYXRoOiBzdHJpbmcsXG5cdFx0b0NvbXB1dGVkRWRpdE1vZGU6IGFueSxcblx0XHRvUHJvcGVydHk6IGFueVxuXHQpIHtcblx0XHRjb25zdCBvSW50ZXJmYWNlID0gb0NvbnRleHQuZ2V0SW50ZXJmYWNlKDApO1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9JbnRlcmZhY2UuZ2V0TW9kZWwoKTtcblxuXHRcdGlmIChzRW50aXR5UGF0aCA9PT0gXCIvdW5kZWZpbmVkXCIgJiYgb1Byb3BlcnR5ICYmIG9Qcm9wZXJ0eS4kdGFyZ2V0KSB7XG5cdFx0XHRzRW50aXR5UGF0aCA9IGAvJHtvUHJvcGVydHkuJHRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUuc3BsaXQoXCIvXCIpWzBdfWA7XG5cdFx0fVxuXHRcdHJldHVybiBGaWVsZEhlbHBlci5nZXREYXRhRmllbGRBbGlnbm1lbnQob0RhdGFGaWVsZCwgb01vZGVsLCBzRW50aXR5UGF0aCwgb0Zvcm1hdE9wdGlvbnMsIG9Db21wdXRlZEVkaXRNb2RlKTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBlbmFibGVkIGV4cHJlc3Npb24gZm9yIERhdGFGaWVsZEFjdGlvbkJ1dHRvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzRGF0YUZpZWxkQWN0aW9uQnV0dG9uRW5hYmxlZFxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZCBEYXRhUG9pbnQncyBWYWx1ZVxuXHQgKiBAcGFyYW0gYklzQm91bmQgRGF0YVBvaW50IGFjdGlvbiBib3VuZFxuXHQgKiBAcGFyYW0gb0FjdGlvbkNvbnRleHQgQWN0aW9uQ29udGV4dCBWYWx1ZVxuXHQgKiBAcGFyYW0gc0FjdGlvbkNvbnRleHRGb3JtYXQgRm9ybWF0dGVkIHZhbHVlIG9mIEFjdGlvbkNvbnRleHRcblx0ICogQHJldHVybnMgQSBib29sZWFuIG9yIHN0cmluZyBleHByZXNzaW9uIGZvciBlbmFibGVkIHByb3BlcnR5XG5cdCAqL1xuXHRpc0RhdGFGaWVsZEFjdGlvbkJ1dHRvbkVuYWJsZWQ6IGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBhbnksIGJJc0JvdW5kOiBib29sZWFuLCBvQWN0aW9uQ29udGV4dDogYW55LCBzQWN0aW9uQ29udGV4dEZvcm1hdDogc3RyaW5nKSB7XG5cdFx0aWYgKGJJc0JvdW5kICE9PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gXCJ0cnVlXCI7XG5cdFx0fVxuXHRcdHJldHVybiAob0FjdGlvbkNvbnRleHQgPT09IG51bGwgPyBcIns9ICEkeyNcIiArIG9EYXRhRmllbGQuQWN0aW9uICsgXCJ9ID8gZmFsc2UgOiB0cnVlIH1cIiA6IG9BY3Rpb25Db250ZXh0KVxuXHRcdFx0PyBzQWN0aW9uQ29udGV4dEZvcm1hdFxuXHRcdFx0OiBcInRydWVcIjtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgbGFiZWxUZXh0IGZvciBEYXRhRmllbGQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRMYWJlbFRleHRGb3JEYXRhRmllbGRcblx0ICogQHBhcmFtIG9FbnRpdHlTZXRNb2RlbCBUaGUgRW50aXR5U2V0IG1vZGVsIE9iamVjdFxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5UGF0aCBUaGUgUHJvcGVydHkgcGF0aCdzIG9iamVjdFxuXHQgKiBAcGFyYW0gc1Byb3BlcnR5UGF0aEJ1aWxkRXhwcmVzc2lvbiBUaGUgZXZhbHVhdGVkIHZhbHVlIG9mIGV4cHJlc3Npb24gQEBGSUVMRC5idWlsZEV4cHJlc3Npb25Gb3JUZXh0VmFsdWVcblx0ICogQHBhcmFtIHNQcm9wZXJ0eVZhbHVlIFByb3BlcnR5IHZhbHVlIGZyb20gbW9kZWxcblx0ICogQHBhcmFtIHNVaU5hbWUgVGhlIHNhcHVpLm5hbWUgYW5ub3RhdGlvbiB2YWx1ZVxuXHQgKiBAcGFyYW0gc1NlbWFudGljS2V5U3R5bGVcblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgZGF0YWZpZWxkIGxhYmVsLlxuXHQgKi9cblx0Z2V0TGFiZWxUZXh0Rm9yRGF0YUZpZWxkOiBmdW5jdGlvbiAoXG5cdFx0b0VudGl0eVNldE1vZGVsOiBhbnksXG5cdFx0b1Byb3BlcnR5UGF0aDogYW55LFxuXHRcdHNQcm9wZXJ0eVBhdGhCdWlsZEV4cHJlc3Npb246IHN0cmluZyxcblx0XHRzUHJvcGVydHlWYWx1ZTogc3RyaW5nLFxuXHRcdHNVaU5hbWU6IHN0cmluZyxcblx0XHRzU2VtYW50aWNLZXlTdHlsZTogc3RyaW5nXG5cdCkge1xuXHRcdGNvbnN0IG9EcmFmdFJvb3QgPSBvRW50aXR5U2V0TW9kZWxbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdFwiXTtcblx0XHRyZXR1cm4gRmllbGRIZWxwZXIuZ2V0U2VtYW50aWNLZXlUaXRsZShcblx0XHRcdG9Qcm9wZXJ0eVBhdGhbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl0gJiYgc1Byb3BlcnR5UGF0aEJ1aWxkRXhwcmVzc2lvbixcblx0XHRcdHNQcm9wZXJ0eVZhbHVlLFxuXHRcdFx0c1VpTmFtZSxcblx0XHRcdG9Qcm9wZXJ0eVBhdGhbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCJdLFxuXHRcdFx0c1NlbWFudGljS2V5U3R5bGUsXG5cdFx0XHRvRHJhZnRSb290XG5cdFx0KTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHJldHJpZXZlIHRleHQgZnJvbSB2YWx1ZSBsaXN0IGZvciBEYXRhRmllbGQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSByZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0XG5cdCAqIEBwYXJhbSBvRW50aXR5U2V0TW9kZWwgVGhlIEVudGl0eVNldCBtb2RlbCBPYmplY3Rcblx0ICogQHBhcmFtIHNQcm9wZXJ0eVBhdGggVGhlIHByb3BlcnR5IHBhdGgncyBuYW1lXG5cdCAqIEBwYXJhbSBvRm9ybWF0T3B0aW9ucyBUaGUgZXZhbHVhdGVkIGluZm9ybWF0aW9ucyBmb3IgdGhlIGZvcm1hdCBvcHRpb25cblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgZGF0YWZpZWxkIHRleHQuXG5cdCAqL1xuXHRyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0OiBmdW5jdGlvbiAob0VudGl0eVNldE1vZGVsOiBhbnksIHNQcm9wZXJ0eVBhdGg6IHN0cmluZywgb0Zvcm1hdE9wdGlvbnM6IGFueSkge1xuXHRcdGNvbnN0IHNQcm9wZXJ0eUZ1bGxQYXRoID0gYCR7b0VudGl0eVNldE1vZGVsLnNQYXRofS8ke3NQcm9wZXJ0eVBhdGh9YDtcblx0XHRjb25zdCBzRGlzcGxheUZvcm1hdCA9IG9Gb3JtYXRPcHRpb25zLmRpc3BsYXlNb2RlO1xuXHRcdENvbW1vbkhlbHBlci5zZXRNZXRhTW9kZWwob0VudGl0eVNldE1vZGVsLmdldE1vZGVsKCkpO1xuXHRcdHJldHVybiBcIns9IEZpZWxkUnVudGltZS5yZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0KCV7XCIgKyBzUHJvcGVydHlQYXRoICsgXCJ9LCdcIiArIHNQcm9wZXJ0eUZ1bGxQYXRoICsgXCInLCdcIiArIHNEaXNwbGF5Rm9ybWF0ICsgXCInKX1cIjtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGNvbXB1dGUgdGhlIGxhYmVsIGZvciBhIERhdGFGaWVsZC5cblx0ICogSWYgdGhlIERhdGFGaWVsZCdzIGxhYmVsIGlzIGFuIGVtcHR5IHN0cmluZywgaXQncyBub3QgcmVuZGVyZWQgZXZlbiBpZiBhIGZhbGxiYWNrIGV4aXN0cy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGNvbXB1dGVMYWJlbFRleHRcblx0ICogQHBhcmFtIHtvYmplY3R9IG9EYXRhRmllbGQgVGhlIERhdGFGaWVsZCBiZWluZyBwcm9jZXNzZWRcblx0ICogQHBhcmFtIHtvYmplY3R9IG9JbnRlcmZhY2UgVGhlIGludGVyZmFjZSBmb3IgY29udGV4dCBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyB7c3RyaW5nfSBUaGUgY29tcHV0ZWQgdGV4dCBmb3IgdGhlIERhdGFGaWVsZCBsYWJlbC5cblx0ICovXG5cblx0Y29tcHV0ZUxhYmVsVGV4dDogZnVuY3Rpb24gKG9EYXRhRmllbGQ6IGFueSwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0ludGVyZmFjZS5jb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0bGV0IHNDb250ZXh0UGF0aCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCk7XG5cdFx0aWYgKHNDb250ZXh0UGF0aC5lbmRzV2l0aChcIi9cIikpIHtcblx0XHRcdHNDb250ZXh0UGF0aCA9IHNDb250ZXh0UGF0aC5zbGljZSgwLCBzQ29udGV4dFBhdGgubGFzdEluZGV4T2YoXCIvXCIpKTtcblx0XHR9XG5cdFx0Y29uc3Qgc0RhdGFGaWVsZExhYmVsID0gb01vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L0xhYmVsYCk7XG5cdFx0Ly9XZSBkbyBub3Qgc2hvdyBhbiBhZGRpdGlvbmFsIGxhYmVsIHRleHQgZm9yIGEgYnV0dG9uOlxuXHRcdGlmIChcblx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCIgfHxcblx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCJcblx0XHQpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdGlmIChzRGF0YUZpZWxkTGFiZWwpIHtcblx0XHRcdHJldHVybiBzRGF0YUZpZWxkTGFiZWw7XG5cdFx0fSBlbHNlIGlmIChzRGF0YUZpZWxkTGFiZWwgPT09IFwiXCIpIHtcblx0XHRcdHJldHVybiBcIlwiO1xuXHRcdH1cblx0XHRsZXQgc0RhdGFGaWVsZFRhcmdldFRpdGxlO1xuXHRcdGlmIChvRGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIikge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRvRGF0YUZpZWxkLlRhcmdldC4kQW5ub3RhdGlvblBhdGguaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRcIikgPiAtMSB8fFxuXHRcdFx0XHRvRGF0YUZpZWxkLlRhcmdldC4kQW5ub3RhdGlvblBhdGguaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFwiKSA+IC0xXG5cdFx0XHQpIHtcblx0XHRcdFx0c0RhdGFGaWVsZFRhcmdldFRpdGxlID0gb01vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L1RhcmdldC8kQW5ub3RhdGlvblBhdGhAL1RpdGxlYCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAob0RhdGFGaWVsZC5UYXJnZXQuJEFubm90YXRpb25QYXRoLmluZGV4T2YoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5Db250YWN0XCIpID4gLTEpIHtcblx0XHRcdFx0c0RhdGFGaWVsZFRhcmdldFRpdGxlID0gb01vZGVsLmdldE9iamVjdChcblx0XHRcdFx0XHRgJHtzQ29udGV4dFBhdGh9L1RhcmdldC8kQW5ub3RhdGlvblBhdGhAL2ZuLyRQYXRoQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbGBcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKHNEYXRhRmllbGRUYXJnZXRUaXRsZSkge1xuXHRcdFx0cmV0dXJuIHNEYXRhRmllbGRUYXJnZXRUaXRsZTtcblx0XHR9XG5cdFx0bGV0IHNEYXRhRmllbGRUYXJnZXRMYWJlbDtcblx0XHRpZiAob0RhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCIpIHtcblx0XHRcdHNEYXRhRmllbGRUYXJnZXRMYWJlbCA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c0NvbnRleHRQYXRofS9UYXJnZXQvJEFubm90YXRpb25QYXRoQC9MYWJlbGApO1xuXHRcdH1cblx0XHRpZiAoc0RhdGFGaWVsZFRhcmdldExhYmVsKSB7XG5cdFx0XHRyZXR1cm4gc0RhdGFGaWVsZFRhcmdldExhYmVsO1xuXHRcdH1cblxuXHRcdGNvbnN0IHNEYXRhRmllbGRWYWx1ZUxhYmVsID0gb01vZGVsLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9L1ZhbHVlLyRQYXRoQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbGApO1xuXHRcdGlmIChzRGF0YUZpZWxkVmFsdWVMYWJlbCkge1xuXHRcdFx0cmV0dXJuIHNEYXRhRmllbGRWYWx1ZUxhYmVsO1xuXHRcdH1cblxuXHRcdGxldCBzRGF0YUZpZWxkVGFyZ2V0VmFsdWVMYWJlbDtcblx0XHRpZiAob0RhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCIpIHtcblx0XHRcdHNEYXRhRmllbGRUYXJnZXRWYWx1ZUxhYmVsID0gb01vZGVsLmdldE9iamVjdChcblx0XHRcdFx0YCR7c0NvbnRleHRQYXRofS9UYXJnZXQvJEFubm90YXRpb25QYXRoL1ZhbHVlLyRQYXRoQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5MYWJlbGBcblx0XHRcdCk7XG5cdFx0fVxuXHRcdGlmIChzRGF0YUZpZWxkVGFyZ2V0VmFsdWVMYWJlbCkge1xuXHRcdFx0cmV0dXJuIHNEYXRhRmllbGRUYXJnZXRWYWx1ZUxhYmVsO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJcIjtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBhbGlnbiB0aGUgZGF0YSBmaWVsZHMgd2l0aCB0aGVpciBsYWJlbC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGJ1aWxkRXhwcmVzc2lvbkZvckFsaWduSXRlbXNcblx0ICogQHBhcmFtIHNWaXN1YWxpemF0aW9uXG5cdCAqIEByZXR1cm5zIEV4cHJlc3Npb24gYmluZGluZyBmb3IgYWxpZ25JdGVtcyBwcm9wZXJ0eVxuXHQgKi9cblx0YnVpbGRFeHByZXNzaW9uRm9yQWxpZ25JdGVtczogZnVuY3Rpb24gKHNWaXN1YWxpemF0aW9uOiBzdHJpbmcpIHtcblx0XHRjb25zdCBmaWVsZFZpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbiA9IGNvbnN0YW50KHNWaXN1YWxpemF0aW9uKTtcblx0XHRjb25zdCBwcm9ncmVzc1Zpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbiA9IGNvbnN0YW50KFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVmlzdWFsaXphdGlvblR5cGUvUHJvZ3Jlc3NcIik7XG5cdFx0Y29uc3QgcmF0aW5nVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uID0gY29uc3RhbnQoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WaXN1YWxpemF0aW9uVHlwZS9SYXRpbmdcIik7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0aWZFbHNlKFxuXHRcdFx0XHRvcihcblx0XHRcdFx0XHRlcXVhbChmaWVsZFZpc3VhbGl6YXRpb25CaW5kaW5nRXhwcmVzc2lvbiwgcHJvZ3Jlc3NWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24pLFxuXHRcdFx0XHRcdGVxdWFsKGZpZWxkVmlzdWFsaXphdGlvbkJpbmRpbmdFeHByZXNzaW9uLCByYXRpbmdWaXN1YWxpemF0aW9uQmluZGluZ0V4cHJlc3Npb24pXG5cdFx0XHRcdCksXG5cdFx0XHRcdGNvbnN0YW50KFwiQ2VudGVyXCIpLFxuXHRcdFx0XHRpZkVsc2UoVUkuSXNFZGl0YWJsZSwgY29uc3RhbnQoXCJDZW50ZXJcIiksIGNvbnN0YW50KFwiU3RyZXRjaFwiKSlcblx0XHRcdClcblx0XHQpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gY2hlY2sgVmFsdWVMaXN0UmVmZXJlbmNlcywgVmFsdWVMaXN0TWFwcGluZyBhbmQgVmFsdWVMaXN0IGluc2lkZSBBY3Rpb25QYXJhbWV0ZXJzIGZvciBGaWVsZEhlbHAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBoYXNWYWx1ZUhlbHBcblx0ICogQHBhcmFtIG9Qcm9wZXJ0eUFubm90YXRpb25zIEFjdGlvbiBwYXJhbWV0ZXIgb2JqZWN0XG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiB0aGVyZSBpcyBhIFZhbHVlTGlzdCogYW5ub3RhdGlvbiBkZWZpbmVkXG5cdCAqL1xuXHRoYXNWYWx1ZUhlbHBBbm5vdGF0aW9uOiBmdW5jdGlvbiAob1Byb3BlcnR5QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdGlmIChvUHJvcGVydHlBbm5vdGF0aW9ucykge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFJlZmVyZW5jZXNcIl0gfHxcblx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdE1hcHBpbmdcIl0gfHxcblx0XHRcdFx0b1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFwiXVxuXHRcdFx0KTtcblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IGRpc3BsYXkgcHJvcGVydHkgZm9yIEFjdGlvblBhcmFtZXRlciBkaWFsb2cuXG5cdCAqXG5cdCAqIFx0QGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEFQRGlhbG9nRGlzcGxheUZvcm1hdFxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSBhY3Rpb24gcGFyYW1ldGVyIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBvSW50ZXJmYWNlIFRoZSBpbnRlcmZhY2UgZm9yIHRoZSBjb250ZXh0IGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIFRoZSBkaXNwbGF5IGZvcm1hdCAgZm9yIGFuIGFjdGlvbiBwYXJhbWV0ZXIgRmllbGRcblx0ICovXG5cdGdldEFQRGlhbG9nRGlzcGxheUZvcm1hdDogZnVuY3Rpb24gKG9Qcm9wZXJ0eTogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHRsZXQgb0Fubm90YXRpb247XG5cdFx0Y29uc3Qgb01vZGVsID0gb0ludGVyZmFjZS5jb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKTtcblx0XHRjb25zdCBzUHJvcGVydHlOYW1lID0gb1Byb3BlcnR5LiROYW1lIHx8IG9JbnRlcmZhY2UuY29udGV4dC5nZXRQcm9wZXJ0eShgJHtzQ29udGV4dFBhdGh9QHNhcHVpLm5hbWVgKTtcblx0XHRjb25zdCBvQWN0aW9uUGFyYW1ldGVyQW5ub3RhdGlvbnMgPSBvTW9kZWwuZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH1AYCk7XG5cdFx0Y29uc3Qgb1ZhbHVlSGVscEFubm90YXRpb24gPVxuXHRcdFx0b0FjdGlvblBhcmFtZXRlckFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RcIl0gfHxcblx0XHRcdG9BY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0TWFwcGluZ1wiXSB8fFxuXHRcdFx0b0FjdGlvblBhcmFtZXRlckFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RSZWZlcmVuY2VzXCJdO1xuXHRcdGNvbnN0IGdldFZhbHVlTGlzdFByb3BlcnR5TmFtZSA9IGZ1bmN0aW9uIChvVmFsdWVMaXN0OiBhbnkpIHtcblx0XHRcdGNvbnN0IG9WYWx1ZUxpc3RQYXJhbWV0ZXIgPSBvVmFsdWVMaXN0LlBhcmFtZXRlcnMuZmluZChmdW5jdGlvbiAob1BhcmFtZXRlcjogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvUGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5ICYmIG9QYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHkuJFByb3BlcnR5UGF0aCA9PT0gc1Byb3BlcnR5TmFtZTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG9WYWx1ZUxpc3RQYXJhbWV0ZXIgJiYgb1ZhbHVlTGlzdFBhcmFtZXRlci5WYWx1ZUxpc3RQcm9wZXJ0eTtcblx0XHR9O1xuXHRcdGxldCBzVmFsdWVMaXN0UHJvcGVydHlOYW1lO1xuXHRcdGlmIChcblx0XHRcdG9BY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEFycmFuZ2VtZW50XCJdIHx8XG5cdFx0XHRvQWN0aW9uUGFyYW1ldGVyQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCJdXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gQ29tbW9uVXRpbHMuY29tcHV0ZURpc3BsYXlNb2RlKG9BY3Rpb25QYXJhbWV0ZXJBbm5vdGF0aW9ucywgdW5kZWZpbmVkKTtcblx0XHR9IGVsc2UgaWYgKG9WYWx1ZUhlbHBBbm5vdGF0aW9uKSB7XG5cdFx0XHRpZiAob1ZhbHVlSGVscEFubm90YXRpb24uQ29sbGVjdGlvblBhdGgpIHtcblx0XHRcdFx0Ly8gZ2V0IHRoZSBuYW1lIG9mIHRoZSBjb3JyZXNwb25kaW5nIHByb3BlcnR5IGluIHZhbHVlIGxpc3QgY29sbGVjdGlvblxuXHRcdFx0XHRzVmFsdWVMaXN0UHJvcGVydHlOYW1lID0gZ2V0VmFsdWVMaXN0UHJvcGVydHlOYW1lKG9WYWx1ZUhlbHBBbm5vdGF0aW9uKTtcblx0XHRcdFx0aWYgKCFzVmFsdWVMaXN0UHJvcGVydHlOYW1lKSB7XG5cdFx0XHRcdFx0cmV0dXJuIFwiVmFsdWVcIjtcblx0XHRcdFx0fVxuXHRcdFx0XHQvLyBnZXQgdGV4dCBmb3IgdGhpcyBwcm9wZXJ0eVxuXHRcdFx0XHRvQW5ub3RhdGlvbiA9IG9Nb2RlbC5nZXRPYmplY3QoYC8ke29WYWx1ZUhlbHBBbm5vdGF0aW9uLkNvbGxlY3Rpb25QYXRofS8ke3NWYWx1ZUxpc3RQcm9wZXJ0eU5hbWV9QGApO1xuXHRcdFx0XHRyZXR1cm4gb0Fubm90YXRpb24gJiYgb0Fubm90YXRpb25bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl1cblx0XHRcdFx0XHQ/IENvbW1vblV0aWxzLmNvbXB1dGVEaXNwbGF5TW9kZShvQW5ub3RhdGlvbiwgdW5kZWZpbmVkKVxuXHRcdFx0XHRcdDogXCJWYWx1ZVwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIG9Nb2RlbC5yZXF1ZXN0VmFsdWVMaXN0SW5mbyhzQ29udGV4dFBhdGgsIHRydWUpLnRoZW4oZnVuY3Rpb24gKG9WYWx1ZUxpc3RJbmZvOiBhbnkpIHtcblx0XHRcdFx0XHQvLyBnZXQgdGhlIG5hbWUgb2YgdGhlIGNvcnJlc3BvbmRpbmcgcHJvcGVydHkgaW4gdmFsdWUgbGlzdCBjb2xsZWN0aW9uXG5cdFx0XHRcdFx0c1ZhbHVlTGlzdFByb3BlcnR5TmFtZSA9IGdldFZhbHVlTGlzdFByb3BlcnR5TmFtZShvVmFsdWVMaXN0SW5mb1tcIlwiXSk7XG5cdFx0XHRcdFx0aWYgKCFzVmFsdWVMaXN0UHJvcGVydHlOYW1lKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gXCJWYWx1ZVwiO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQvLyBnZXQgdGV4dCBmb3IgdGhpcyBwcm9wZXJ0eVxuXHRcdFx0XHRcdG9Bbm5vdGF0aW9uID0gb1ZhbHVlTGlzdEluZm9bXCJcIl0uJG1vZGVsXG5cdFx0XHRcdFx0XHQuZ2V0TWV0YU1vZGVsKClcblx0XHRcdFx0XHRcdC5nZXRPYmplY3QoYC8ke29WYWx1ZUxpc3RJbmZvW1wiXCJdW1wiQ29sbGVjdGlvblBhdGhcIl19LyR7c1ZhbHVlTGlzdFByb3BlcnR5TmFtZX1AYCk7XG5cdFx0XHRcdFx0cmV0dXJuIG9Bbm5vdGF0aW9uICYmIG9Bbm5vdGF0aW9uW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCJdXG5cdFx0XHRcdFx0XHQ/IENvbW1vblV0aWxzLmNvbXB1dGVEaXNwbGF5TW9kZShvQW5ub3RhdGlvbiwgdW5kZWZpbmVkKVxuXHRcdFx0XHRcdFx0OiBcIlZhbHVlXCI7XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJWYWx1ZVwiO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgZGlzcGxheSBwcm9wZXJ0eSBmb3IgQWN0aW9uUGFyYW1ldGVyIGRpYWxvZyBGaWVsZEhlbHAuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRBY3Rpb25QYXJhbWV0ZXJEaWFsb2dGaWVsZEhlbHBcblx0ICogQHBhcmFtIG9BY3Rpb25QYXJhbWV0ZXIgQWN0aW9uIHBhcmFtZXRlciBvYmplY3Rcblx0ICogQHBhcmFtIHNTYXBVSU5hbWUgQWN0aW9uIHNhcHVpIG5hbWVcblx0ICogQHBhcmFtIHNQYXJhbU5hbWUgVGhlIHBhcmFtZXRlciBuYW1lXG5cdCAqIEByZXR1cm5zIFRoZSBJRCBvZiB0aGUgZmllbGRIZWxwIHVzZWQgYnkgdGhpcyBhY3Rpb24gcGFyYW1ldGVyXG5cdCAqL1xuXHRnZXRBY3Rpb25QYXJhbWV0ZXJEaWFsb2dGaWVsZEhlbHA6IGZ1bmN0aW9uIChvQWN0aW9uUGFyYW1ldGVyOiBvYmplY3QsIHNTYXBVSU5hbWU6IHN0cmluZywgc1BhcmFtTmFtZTogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRoaXMuaGFzVmFsdWVIZWxwQW5ub3RhdGlvbihvQWN0aW9uUGFyYW1ldGVyKSA/IGdlbmVyYXRlKFtzU2FwVUlOYW1lLCBzUGFyYW1OYW1lXSkgOiB1bmRlZmluZWQ7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IGRpc3BsYXkgcHJvcGVydHkgZm9yIEFjdGlvblBhcmFtZXRlciBkaWFsb2cgZGVsZWdhdGUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRGaWVsZFZhbHVlSGVscERlbGVnYXRlXG5cdCAqIEBwYXJhbSBiSXNCb3VuZCBBY3Rpb24gaXMgYm91bmRcblx0ICogQHBhcmFtIHNFVHlwZVBhdGggVGhlIEVudGl0eVR5cGUgUGF0aFxuXHQgKiBAcGFyYW0gc1NhcFVJTmFtZSBUaGUgbmFtZSBvZiB0aGUgQWN0aW9uXG5cdCAqIEBwYXJhbSBzUGFyYW1OYW1lIFRoZSBuYW1lIG9mIHRoZSBBY3Rpb25QYXJhbWV0ZXJcblx0ICogQHJldHVybnMgVGhlIGRlbGVnYXRlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGFzIGEgc3Rpcm5nXG5cdCAqL1xuXHRnZXRGaWVsZFZhbHVlSGVscERlbGVnYXRlOiBmdW5jdGlvbiAoYklzQm91bmQ6IGJvb2xlYW4sIHNFVHlwZVBhdGg6IHN0cmluZywgc1NhcFVJTmFtZTogc3RyaW5nLCBzUGFyYW1OYW1lOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKHtcblx0XHRcdG5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVmFsdWVIZWxwRGVsZWdhdGVcIiksXG5cdFx0XHRwYXlsb2FkOiB7XG5cdFx0XHRcdHByb3BlcnR5UGF0aDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3Rlcyhcblx0XHRcdFx0XHRWYWx1ZUxpc3RIZWxwZXIuZ2V0UHJvcGVydHlQYXRoKHtcblx0XHRcdFx0XHRcdFVuYm91bmRBY3Rpb246ICFiSXNCb3VuZCxcblx0XHRcdFx0XHRcdEVudGl0eVR5cGVQYXRoOiBzRVR5cGVQYXRoLFxuXHRcdFx0XHRcdFx0QWN0aW9uOiBzU2FwVUlOYW1lLFxuXHRcdFx0XHRcdFx0UHJvcGVydHk6IHNQYXJhbU5hbWVcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpXG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBkZWxlZ2F0ZSBjb25maWd1cmF0aW9uIGZvciBBY3Rpb25QYXJhbWV0ZXIgZGlhbG9nLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0VmFsdWVIZWxwRGVsZWdhdGVcblx0ICogQHBhcmFtIGlzQm91bmQgQWN0aW9uIGlzIGJvdW5kXG5cdCAqIEBwYXJhbSBlbnRpdHlUeXBlUGF0aCBUaGUgRW50aXR5VHlwZSBQYXRoXG5cdCAqIEBwYXJhbSBzYXBVSU5hbWUgVGhlIG5hbWUgb2YgdGhlIEFjdGlvblxuXHQgKiBAcGFyYW0gcGFyYW1OYW1lIFRoZSBuYW1lIG9mIHRoZSBBY3Rpb25QYXJhbWV0ZXJcblx0ICogQHJldHVybnMgVGhlIGRlbGVnYXRlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGFzIGEgc3RyaW5nXG5cdCAqL1xuXHRnZXRWYWx1ZUhlbHBEZWxlZ2F0ZTogZnVuY3Rpb24gKGlzQm91bmQ6IGJvb2xlYW4sIGVudGl0eVR5cGVQYXRoOiBzdHJpbmcsIHNhcFVJTmFtZTogc3RyaW5nLCBwYXJhbU5hbWU6IHN0cmluZykge1xuXHRcdGNvbnN0IGRlbGVnYXRlQ29uZmlndXJhdGlvbjogeyBuYW1lOiBzdHJpbmc7IHBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWQgfSA9IHtcblx0XHRcdG5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCJzYXAvZmUvbWFjcm9zL3ZhbHVlaGVscC9WYWx1ZUhlbHBEZWxlZ2F0ZVwiKSxcblx0XHRcdHBheWxvYWQ6IHtcblx0XHRcdFx0cHJvcGVydHlQYXRoOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFxuXHRcdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5nZXRQcm9wZXJ0eVBhdGgoe1xuXHRcdFx0XHRcdFx0VW5ib3VuZEFjdGlvbjogIWlzQm91bmQsXG5cdFx0XHRcdFx0XHRFbnRpdHlUeXBlUGF0aDogZW50aXR5VHlwZVBhdGgsXG5cdFx0XHRcdFx0XHRBY3Rpb246IHNhcFVJTmFtZSxcblx0XHRcdFx0XHRcdFByb3BlcnR5OiBwYXJhbU5hbWVcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpLFxuXHRcdFx0XHRxdWFsaWZpZXJzOiB7fSxcblx0XHRcdFx0dmFsdWVIZWxwUXVhbGlmaWVyOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiXCIpLFxuXHRcdFx0XHRpc0FjdGlvblBhcmFtZXRlckRpYWxvZzogdHJ1ZVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhkZWxlZ2F0ZUNvbmZpZ3VyYXRpb24pO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgZGVsZWdhdGUgY29uZmlndXJhdGlvbiBmb3IgTm9uQ29tcHV0ZWRWaXNpYmxlS2V5RmllbGQgZGlhbG9nLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0VmFsdWVIZWxwRGVsZWdhdGVGb3JOb25Db21wdXRlZFZpc2libGVLZXlGaWVsZFxuXHQgKiBAcGFyYW0gcHJvcGVydHlQYXRoIFRoZSBjdXJyZW50IHByb3BlcnR5IHBhdGhcblx0ICogQHJldHVybnMgVGhlIGRlbGVnYXRlIGNvbmZpZ3VyYXRpb24gb2JqZWN0IGFzIGEgc3RyaW5nXG5cdCAqL1xuXHRnZXRWYWx1ZUhlbHBEZWxlZ2F0ZUZvck5vbkNvbXB1dGVkVmlzaWJsZUtleUZpZWxkOiBmdW5jdGlvbiAocHJvcGVydHlQYXRoOiBzdHJpbmcpIHtcblx0XHRjb25zdCBkZWxlZ2F0ZUNvbmZpZ3VyYXRpb246IHsgbmFtZTogc3RyaW5nOyBwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkIH0gPSB7XG5cdFx0XHRuYW1lOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwic2FwL2ZlL21hY3Jvcy92YWx1ZWhlbHAvVmFsdWVIZWxwRGVsZWdhdGVcIiksXG5cdFx0XHRwYXlsb2FkOiB7XG5cdFx0XHRcdHByb3BlcnR5UGF0aDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3Rlcyhwcm9wZXJ0eVBhdGgpLFxuXHRcdFx0XHRxdWFsaWZpZXJzOiB7fSxcblx0XHRcdFx0dmFsdWVIZWxwUXVhbGlmaWVyOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiXCIpXG5cdFx0XHR9XG5cdFx0fTtcblx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKGRlbGVnYXRlQ29uZmlndXJhdGlvbik7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBmZXRjaCBlbnRpdHkgZnJvbSBhIHBhdGggY29udGFpbmluZyBtdWx0aXBsZSBhc3NvY2lhdGlvbnMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfZ2V0RW50aXR5U2V0RnJvbU11bHRpTGV2ZWxcblx0ICogQHBhcmFtIG9Db250ZXh0IFRoZSBjb250ZXh0IHdob3NlIHBhdGggaXMgdG8gYmUgY2hlY2tlZFxuXHQgKiBAcGFyYW0gc1BhdGggVGhlIHBhdGggZnJvbSB3aGljaCBlbnRpdHkgaGFzIHRvIGJlIGZldGNoZWRcblx0ICogQHBhcmFtIHNTb3VyY2VFbnRpdHkgVGhlIGVudGl0eSBwYXRoIGluIHdoaWNoIG5hdiBlbnRpdHkgZXhpc3RzXG5cdCAqIEBwYXJhbSBpU3RhcnQgVGhlIHN0YXJ0IGluZGV4IDogYmVnaW5uaW5nIHBhcnRzIG9mIHRoZSBwYXRoIHRvIGJlIGlnbm9yZWRcblx0ICogQHBhcmFtIGlEaWZmIFRoZSBkaWZmIGluZGV4IDogZW5kIHBhcnRzIG9mIHRoZSBwYXRoIHRvIGJlIGlnbm9yZWRcblx0ICogQHJldHVybnMgVGhlIHBhdGggb2YgdGhlIGVudGl0eSBzZXRcblx0ICovXG5cdF9nZXRFbnRpdHlTZXRGcm9tTXVsdGlMZXZlbDogZnVuY3Rpb24gKG9Db250ZXh0OiBDb250ZXh0LCBzUGF0aDogc3RyaW5nLCBzU291cmNlRW50aXR5OiBzdHJpbmcsIGlTdGFydDogYW55LCBpRGlmZjogYW55KSB7XG5cdFx0bGV0IGFOYXZQYXJ0cyA9IHNQYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoQm9vbGVhbik7XG5cdFx0YU5hdlBhcnRzID0gYU5hdlBhcnRzLmZpbHRlcihmdW5jdGlvbiAoc1BhcnQ6IHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHNQYXJ0ICE9PSBcIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCI7XG5cdFx0fSk7XG5cdFx0aWYgKGFOYXZQYXJ0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRmb3IgKGxldCBpID0gaVN0YXJ0OyBpIDwgYU5hdlBhcnRzLmxlbmd0aCAtIGlEaWZmOyBpKyspIHtcblx0XHRcdFx0c1NvdXJjZUVudGl0eSA9IGAvJHtvQ29udGV4dC5nZXRPYmplY3QoYCR7c1NvdXJjZUVudGl0eX0vJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvJHthTmF2UGFydHNbaV19YCl9YDtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHNTb3VyY2VFbnRpdHk7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZmluZCB0aGUgZW50aXR5IG9mIHRoZSBwcm9wZXJ0eS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFByb3BlcnR5Q29sbGVjdGlvblxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5IFRoZSBjb250ZXh0IGZyb20gd2hpY2ggZGF0YWZpZWxkJ3MgcGF0aCBuZWVkcyB0byBiZSBleHRyYWN0ZWQuXG5cdCAqIEBwYXJhbSBvQ29udGV4dE9iamVjdCBUaGUgTWV0YWRhdGEgQ29udGV4dChOb3QgcGFzc2VkIHdoZW4gY2FsbGVkIHdpdGggdGVtcGxhdGU6d2l0aClcblx0ICogQHJldHVybnMgVGhlIGVudGl0eSBzZXQgcGF0aCBvZiB0aGUgcHJvcGVydHlcblx0ICovXG5cdGdldFByb3BlcnR5Q29sbGVjdGlvbjogZnVuY3Rpb24gKG9Qcm9wZXJ0eTogb2JqZWN0LCBvQ29udGV4dE9iamVjdDogYW55KSB7XG5cdFx0Y29uc3Qgb0NvbnRleHQgPSAob0NvbnRleHRPYmplY3QgJiYgb0NvbnRleHRPYmplY3QuY29udGV4dCkgfHwgb1Byb3BlcnR5O1xuXHRcdGNvbnN0IHNQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdGNvbnN0IGFNYWluRW50aXR5UGFydHMgPSBzUGF0aC5zcGxpdChcIi9cIikuZmlsdGVyKEJvb2xlYW4pO1xuXHRcdGNvbnN0IHNNYWluRW50aXR5ID0gYU1haW5FbnRpdHlQYXJ0c1swXTtcblx0XHRjb25zdCBzUHJvcGVydHlQYXRoID0gb0NvbnRleHQuZ2V0T2JqZWN0KFwiJFBhdGhcIik7XG5cdFx0bGV0IHNGaWVsZFNvdXJjZUVudGl0eSA9IGAvJHtzTWFpbkVudGl0eX1gO1xuXHRcdC8vIGNoZWNraW5nIGFnYWluc3QgcHJlZml4IG9mIGFubm90YXRpb25zLCBpZS4gQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlxuXHRcdC8vIGFzIGFubm90YXRpb24gcGF0aCBjYW4gYmUgb2YgYSBsaW5lIGl0ZW0sIGZpZWxkIGdyb3VwIG9yIGZhY2V0XG5cdFx0aWYgKHNQYXRoLmluZGV4T2YoXCIvQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlwiKSA+IC0xKSB7XG5cdFx0XHRjb25zdCBpQW5ub0luZGV4ID0gc1BhdGguaW5kZXhPZihcIi9AY29tLnNhcC52b2NhYnVsYXJpZXMuXCIpO1xuXHRcdFx0Y29uc3Qgc0lubmVyUGF0aCA9IHNQYXRoLnN1YnN0cmluZygwLCBpQW5ub0luZGV4KTtcblx0XHRcdC8vIHRoZSBmYWNldCBvciBsaW5lIGl0ZW0ncyBlbnRpdHkgY291bGQgYmUgYSBuYXZpZ2F0aW9uIGVudGl0eVxuXHRcdFx0c0ZpZWxkU291cmNlRW50aXR5ID0gRmllbGRIZWxwZXIuX2dldEVudGl0eVNldEZyb21NdWx0aUxldmVsKG9Db250ZXh0LCBzSW5uZXJQYXRoLCBzRmllbGRTb3VyY2VFbnRpdHksIDEsIDApO1xuXHRcdH1cblx0XHRpZiAoc1Byb3BlcnR5UGF0aCAmJiBzUHJvcGVydHlQYXRoLmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdC8vIHRoZSBmaWVsZCB3aXRoaW4gZmFjZXQgb3IgbGluZSBpdGVtIGNvdWxkIGJlIGZyb20gYSBuYXZpZ2F0aW9uIGVudGl0eVxuXHRcdFx0c0ZpZWxkU291cmNlRW50aXR5ID0gRmllbGRIZWxwZXIuX2dldEVudGl0eVNldEZyb21NdWx0aUxldmVsKG9Db250ZXh0LCBzUHJvcGVydHlQYXRoLCBzRmllbGRTb3VyY2VFbnRpdHksIDAsIDEpO1xuXHRcdH1cblx0XHRyZXR1cm4gc0ZpZWxkU291cmNlRW50aXR5O1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHVzZWQgaW4gYSB0ZW1wbGF0ZSB3aXRoIHRvIHJldHJpZXZlIHRoZSBjdXJyZW5jeSBvciB0aGUgdW5pdCBwcm9wZXJ0eSBpbnNpZGUgYSB0ZW1wbGF0aW5nIHZhcmlhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1Byb3BlcnR5QW5ub3RhdGlvbnNcblx0ICogQHJldHVybnMgVGhlIGFubm90YXRpb25QYXRoIHRvIGJlIGRlYWx0IHdpdGggYnkgdGVtcGxhdGU6d2l0aFxuXHQgKi9cblx0Z2V0VW5pdE9yQ3VycmVuY3k6IGZ1bmN0aW9uIChvUHJvcGVydHlBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5QW5ub3RhdGlvbnNPYmplY3QgPSBvUHJvcGVydHlBbm5vdGF0aW9ucy5nZXRPYmplY3QoKTtcblx0XHRsZXQgc0Fubm90YXRpb25QYXRoID0gb1Byb3BlcnR5QW5ub3RhdGlvbnMuc1BhdGg7XG5cdFx0aWYgKG9Qcm9wZXJ0eUFubm90YXRpb25zT2JqZWN0W1wiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiXSkge1xuXHRcdFx0c0Fubm90YXRpb25QYXRoID0gYCR7c0Fubm90YXRpb25QYXRofU9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHNBbm5vdGF0aW9uUGF0aCA9IGAke3NBbm5vdGF0aW9uUGF0aH1PcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdGA7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHNBbm5vdGF0aW9uUGF0aDtcblx0fSxcblx0aGFzU3RhdGljVW5pdE9yQ3VycmVuY3k6IGZ1bmN0aW9uIChvUHJvcGVydHlBbm5vdGF0aW9uczogYW55KSB7XG5cdFx0cmV0dXJuIG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiXVxuXHRcdFx0PyAhb1Byb3BlcnR5QW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLk1lYXN1cmVzLlYxLklTT0N1cnJlbmN5XCJdLiRQYXRoXG5cdFx0XHQ6ICFvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdFwiXS4kUGF0aDtcblx0fSxcblx0Z2V0U3RhdGljVW5pdE9yQ3VycmVuY3k6IGZ1bmN0aW9uIChvUHJvcGVydHlBbm5vdGF0aW9uczogYW55LCBvRm9ybWF0T3B0aW9uczogYW55KSB7XG5cdFx0aWYgKG9Gb3JtYXRPcHRpb25zICYmIG9Gb3JtYXRPcHRpb25zLm1lYXN1cmVEaXNwbGF5TW9kZSAhPT0gXCJIaWRkZW5cIikge1xuXHRcdFx0Y29uc3QgdW5pdCA9IG9Qcm9wZXJ0eUFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5NZWFzdXJlcy5WMS5JU09DdXJyZW5jeVwiXSB8fCBvUHJvcGVydHlBbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuTWVhc3VyZXMuVjEuVW5pdFwiXTtcblxuXHRcdFx0Y29uc3QgZGF0ZUZvcm1hdCA9IERhdGVGb3JtYXQuZ2V0RGF0ZUluc3RhbmNlKCkgYXMgYW55O1xuXHRcdFx0Y29uc3QgbG9jYWxlRGF0YSA9IGRhdGVGb3JtYXQub0xvY2FsZURhdGEubURhdGE7XG5cblx0XHRcdGlmIChcblx0XHRcdFx0bG9jYWxlRGF0YSAmJlxuXHRcdFx0XHRsb2NhbGVEYXRhLnVuaXRzICYmXG5cdFx0XHRcdGxvY2FsZURhdGEudW5pdHMuc2hvcnQgJiZcblx0XHRcdFx0bG9jYWxlRGF0YS51bml0cy5zaG9ydFt1bml0XSAmJlxuXHRcdFx0XHRsb2NhbGVEYXRhLnVuaXRzLnNob3J0W3VuaXRdLmRpc3BsYXlOYW1lXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIGxvY2FsZURhdGEudW5pdHMuc2hvcnRbdW5pdF0uZGlzcGxheU5hbWU7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiB1bml0O1xuXHRcdH1cblx0fSxcblx0Z2V0RW1wdHlJbmRpY2F0b3JUcmlnZ2VyOiBmdW5jdGlvbiAoYkFjdGl2ZTogYW55LCBzQmluZGluZzogYW55LCBzRnVsbFRleHRCaW5kaW5nOiBhbnkpIHtcblx0XHRpZiAoc0Z1bGxUZXh0QmluZGluZykge1xuXHRcdFx0cmV0dXJuIGJBY3RpdmUgPyBzRnVsbFRleHRCaW5kaW5nIDogXCJpbmFjdGl2ZVwiO1xuXHRcdH1cblx0XHRyZXR1cm4gYkFjdGl2ZSA/IHNCaW5kaW5nIDogXCJpbmFjdGl2ZVwiO1xuXHR9LFxuXHQvKipcblx0ICogV2hlbiB0aGUgdmFsdWUgZGlzcGxheWVkIGlzIGluIHRleHQgYXJyYW5nZW1lbnQgVGV4dE9ubHkgd2UgYWxzbyB3YW50IHRvIHJldHJpZXZlIHRoZSBUZXh0IHZhbHVlIGZvciB0YWJsZXMgZXZlbiBpZiB3ZSBkb24ndCBzaG93IGl0LlxuXHQgKiBUaGlzIG1ldGhvZCB3aWxsIHJldHVybiB0aGUgdmFsdWUgb2YgdGhlIG9yaWdpbmFsIGRhdGEgZmllbGQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGhpcyBUaGUgY3VycmVudCBvYmplY3Rcblx0ICogQHBhcmFtIG9EYXRhRmllbGRUZXh0QXJyYW5nZW1lbnQgRGF0YUZpZWxkIHVzaW5nIHRleHQgYXJyYW5nZW1lbnQgYW5ub3RhdGlvblxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZCBEYXRhRmllbGQgY29udGFpbmluZyB0aGUgdmFsdWUgdXNpbmcgdGV4dCBhcnJhbmdlbWVudCBhbm5vdGF0aW9uXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIHRvIHRoZSB2YWx1ZVxuXHQgKi9cblx0Z2V0QmluZGluZ0luZm9Gb3JUZXh0QXJyYW5nZW1lbnQ6IGZ1bmN0aW9uIChvVGhpczogb2JqZWN0LCBvRGF0YUZpZWxkVGV4dEFycmFuZ2VtZW50OiBhbnksIG9EYXRhRmllbGQ6IGFueSkge1xuXHRcdGlmIChcblx0XHRcdG9EYXRhRmllbGRUZXh0QXJyYW5nZW1lbnQgJiZcblx0XHRcdG9EYXRhRmllbGRUZXh0QXJyYW5nZW1lbnQuJEVudW1NZW1iZXIgJiZcblx0XHRcdG9EYXRhRmllbGRUZXh0QXJyYW5nZW1lbnQuJEVudW1NZW1iZXIgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0T25seVwiICYmXG5cdFx0XHRvRGF0YUZpZWxkXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gYHske29EYXRhRmllbGQuVmFsdWUuJFBhdGh9fWA7XG5cdFx0fVxuXHR9LFxuXG5cdHNlbWFudGljS2V5Rm9ybWF0OiBmdW5jdGlvbiAodlJhdzogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHQvLyBUaGUgRW1wdHkgYXJndW1lbnQgZW5zdXJlcyB0aGF0IFwiZ3JvdXBpbmdFbmFibGVkXCIgaXMgYWRkZWQgdG8gXCJmb3JtYXRPcHRpb25zXCJcblx0XHRvSW50ZXJmYWNlLmFyZ3VtZW50cyA9IFt7fSwgeyBncm91cGluZ0VuYWJsZWQ6IGZhbHNlIH1dO1xuXHRcdHJldHVybiBBbm5vdGF0aW9uSGVscGVyLmZvcm1hdCh2UmF3LCBvSW50ZXJmYWNlKTtcblx0fSxcblx0Z2V0SXNNZWRpYUNvbnRlbnRUeXBlTnVsbEV4cHI6IGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBhbnksIHNPcGVyYXRvcjogYW55KSB7XG5cdFx0c09wZXJhdG9yID0gc09wZXJhdG9yIHx8IFwiPT09XCI7XG5cdFx0cmV0dXJuIFwiez0gJXtcIiArIHNQcm9wZXJ0eVBhdGggKyBcIkBvZGF0YS5tZWRpYUNvbnRlbnRUeXBlfSBcIiArIHNPcGVyYXRvciArIFwiIG51bGwgfVwiO1xuXHR9LFxuXHRnZXRQYXRoRm9ySWNvblNvdXJjZTogZnVuY3Rpb24gKHNQcm9wZXJ0eVBhdGg6IGFueSkge1xuXHRcdHJldHVybiBcIns9IEZJRUxEUlVOVElNRS5nZXRJY29uRm9yTWltZVR5cGUoJXtcIiArIHNQcm9wZXJ0eVBhdGggKyBcIkBvZGF0YS5tZWRpYUNvbnRlbnRUeXBlfSl9XCI7XG5cdH0sXG5cdGdldEZpbGVuYW1lRXhwcjogZnVuY3Rpb24gKHNGaWxlbmFtZTogYW55LCBzTm9GaWxlbmFtZVRleHQ6IGFueSkge1xuXHRcdGlmIChzRmlsZW5hbWUpIHtcblx0XHRcdGlmIChzRmlsZW5hbWUuaW5kZXhPZihcIntcIikgPT09IDApIHtcblx0XHRcdFx0Ly8gZmlsZW5hbWUgaXMgcmVmZXJlbmNlZCB2aWEgcGF0aCwgaS5lLiBAQ29yZS5Db250ZW50RGlzcG9zaXRpb24uRmlsZW5hbWUgOiBwYXRoXG5cdFx0XHRcdHJldHVybiBcIns9ICRcIiArIHNGaWxlbmFtZSArIFwiID8gJFwiICsgc0ZpbGVuYW1lICsgXCIgOiAkXCIgKyBzTm9GaWxlbmFtZVRleHQgKyBcIn1cIjtcblx0XHRcdH1cblx0XHRcdC8vIHN0YXRpYyBmaWxlbmFtZSwgaS5lLiBAQ29yZS5Db250ZW50RGlzcG9zaXRpb24uRmlsZW5hbWUgOiAnc29tZVN0YXRpY05hbWUnXG5cdFx0XHRyZXR1cm4gc0ZpbGVuYW1lO1xuXHRcdH1cblx0XHQvLyBubyBAQ29yZS5Db250ZW50RGlzcG9zaXRpb24uRmlsZW5hbWVcblx0XHRyZXR1cm4gc05vRmlsZW5hbWVUZXh0O1xuXHR9LFxuXG5cdGNhbGN1bGF0ZU1CZnJvbUJ5dGU6IGZ1bmN0aW9uIChpQnl0ZTogYW55KSB7XG5cdFx0cmV0dXJuIGlCeXRlID8gKGlCeXRlIC8gKDEwMjQgKiAxMDI0KSkudG9GaXhlZCg2KSA6IHVuZGVmaW5lZDtcblx0fSxcblx0Z2V0RG93bmxvYWRVcmw6IGZ1bmN0aW9uIChwcm9wZXJ0eVBhdGg6IHN0cmluZykge1xuXHRcdHJldHVybiBwcm9wZXJ0eVBhdGggKyBcIns9ICR7aW50ZXJuYWw+L3N0aWNreVNlc3Npb25Ub2tlbn0gPyAoJz9TQVAtQ29udGV4dElkPScgKyAke2ludGVybmFsPi9zdGlja3lTZXNzaW9uVG9rZW59KSA6ICcnIH1cIjtcblx0fSxcblx0Z2V0TWFyZ2luQ2xhc3M6IGZ1bmN0aW9uIChjb21wYWN0U2VtYW50aWNLZXk6IHN0cmluZyB8IGJvb2xlYW4pIHtcblx0XHRyZXR1cm4gY29tcGFjdFNlbWFudGljS2V5ID09PSBcInRydWVcIiB8fCBjb21wYWN0U2VtYW50aWNLZXkgPT09IHRydWUgPyBcInNhcE1UYWJsZUNvbnRlbnRNYXJnaW5cIiA6IHVuZGVmaW5lZDtcblx0fSxcblx0Z2V0UmVxdWlyZWQ6IGZ1bmN0aW9uIChpbW11dGFibGVLZXk6IGFueSwgdGFyZ2V0OiBhbnksIHJlcXVpcmVkUHJvcGVydGllczogYW55KSB7XG5cdFx0bGV0IHRhcmdldFJlcXVpcmVkRXhwcmVzc2lvbjogYW55ID0gY29uc3RhbnQoZmFsc2UpO1xuXHRcdGlmICh0YXJnZXQgIT09IG51bGwpIHtcblx0XHRcdHRhcmdldFJlcXVpcmVkRXhwcmVzc2lvbiA9IGlzUmVxdWlyZWRFeHByZXNzaW9uKHRhcmdldD8udGFyZ2V0T2JqZWN0KTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKG9yKHRhcmdldFJlcXVpcmVkRXhwcmVzc2lvbiwgcmVxdWlyZWRQcm9wZXJ0aWVzLmluZGV4T2YoaW1tdXRhYmxlS2V5KSA+IC0xKSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgY2hlY2tzIGlmIHRoZSBmaWVsZCBpcyBhbHJlYWR5IHBhcnQgb2YgYSBmb3JtLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkQ29sbGVjdGlvbiBUaGUgbGlzdCBvZiB0aGUgZmllbGRzIG9mIHRoZSBmb3JtXG5cdCAqIEBwYXJhbSBkYXRhRmllbGQgVGhlIGRhdGEgZmllbGQgd2hpY2ggbmVlZHMgdG8gYmUgY2hlY2tlZCBpbiB0aGUgZm9ybVxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGZpZWxkIGlzIGFscmVhZHkgcGFydCBvZiB0aGUgZm9ybSwgYGZhbHNlYCBvdGhlcndpc2Vcblx0ICovXG5cdGlzRmllbGRQYXJ0T2ZGb3JtOiBmdW5jdGlvbiAoZGF0YUZpZWxkQ29sbGVjdGlvbjogRm9ybUVsZW1lbnRbXSwgZGF0YUZpZWxkOiBEYXRhRmllbGRBYnN0cmFjdFR5cGVzKSB7XG5cdFx0Ly9nZW5lcmF0aW5nIGtleSBmb3IgdGhlIHJlY2VpdmVkIGRhdGEgZmllbGRcblx0XHRjb25zdCBjb25uZWN0ZWREYXRhRmllbGRLZXkgPSBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCk7XG5cdFx0Ly8gdHJ5aW5nIHRvIGZpbmQgdGhlIGdlbmVyYXRlZCBrZXkgaW4gYWxyZWFkeSBleGlzdGluZyBmb3JtIGVsZW1lbnRzXG5cdFx0Y29uc3QgaXNGaWVsZEZvdW5kID0gZGF0YUZpZWxkQ29sbGVjdGlvbi5maW5kKChmaWVsZCkgPT4ge1xuXHRcdFx0cmV0dXJuIGZpZWxkLmtleSA9PT0gY29ubmVjdGVkRGF0YUZpZWxkS2V5O1xuXHRcdH0pO1xuXHRcdHJldHVybiBpc0ZpZWxkRm91bmQgPyB0cnVlIDogZmFsc2U7XG5cdH1cbn07XG4oRmllbGRIZWxwZXIuYnVpbGRFeHByZXNzaW9uRm9yVGV4dFZhbHVlIGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4oRmllbGRIZWxwZXIuZ2V0RmllbGRHcm91cElkcyBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuKEZpZWxkSGVscGVyLmZpZWxkQ29udHJvbCBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuKEZpZWxkSGVscGVyLmdldFR5cGVBbGlnbm1lbnQgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihGaWVsZEhlbHBlci5nZXRQcm9wZXJ0eUNvbGxlY3Rpb24gYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihGaWVsZEhlbHBlci5nZXRBUERpYWxvZ0Rpc3BsYXlGb3JtYXQgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihGaWVsZEhlbHBlci5vcGVyYXRvcnMgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihGaWVsZEhlbHBlci5zZW1hbnRpY0tleUZvcm1hdCBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuKEZpZWxkSGVscGVyLmNvbXB1dGVMYWJlbFRleHQgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihGaWVsZEhlbHBlci5nZXRGaWVsZEhlbHBQcm9wZXJ0eUZvckZpbHRlckZpZWxkIGFzIGFueSkucmVxdWlyZXNJQ29udGV4dCA9IHRydWU7XG4oRmllbGRIZWxwZXIucmV0cmlldmVUZXh0RnJvbVZhbHVlTGlzdCBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuKEZpZWxkSGVscGVyLmdldEFjdGlvblBhcmFtZXRlclZpc2liaWxpdHkgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihGaWVsZEhlbHBlci5jb21wdXRlTGlua1BhcmFtZXRlcnMgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcblxuZXhwb3J0IGRlZmF1bHQgRmllbGRIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7RUE4QkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFaQSxJQWFlQSx1QkFBdUIsYUFBQ0MsVUFBZTtJQUFBLElBQUU7TUFDdkQsSUFBTUMsVUFBVSxHQUFHRCxVQUFVLENBQUNFLFFBQVEsRUFBRTtNQUN4QyxJQUFNQyxjQUFjLEdBQUdILFVBQVUsQ0FBQ0ksVUFBVSxDQUFDLDhCQUE4QixDQUFDO01BQzVFLElBQU1DLFlBQVksR0FBR0YsY0FBYyxDQUFDRyxXQUFXOztNQUUvQztNQUNBLElBQUlELFlBQVksRUFBRTtRQUNqQix1QkFBT0EsWUFBWTtNQUNwQjtNQUVBLHVCQUFPRSxpQkFBaUIsQ0FBQ0MsbUNBQW1DLENBQUNQLFVBQVUsQ0FBQztJQUN6RSxDQUFDO01BQUE7SUFBQTtFQUFBO0VBM0JELElBQU1RLFdBQVcsR0FBRyxvQ0FBb0M7SUFDdkRDLElBQUksR0FBRyw2QkFBNkI7RUE0QnJDLElBQU1DLFdBQVcsR0FBRztJQUNuQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FB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