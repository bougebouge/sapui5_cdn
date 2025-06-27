/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/CollaborationFormatter", "sap/fe/core/formatters/ValueFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/TemplateModel", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/MacroMetadata", "sap/fe/macros/situations/SituationsIndicator.fragment"], function (CommonUtils, BindingHelper, MetaModelConverter, CollaborationFormatters, valueFormatters, BindingToolkit, ModelHelper, StableIdHelper, TemplateModel, DataModelPathHelper, PropertyHelper, UIFormatters, FieldTemplating, MacroMetadata, SituationsIndicator) {
  "use strict";

  var isSemanticKey = PropertyHelper.isSemanticKey;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var generate = StableIdHelper.generate;
  var pathInModel = BindingToolkit.pathInModel;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var formatResult = BindingToolkit.formatResult;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var Entity = BindingHelper.Entity;
  /**
   * @classdesc
   * Building block for creating a Field based on the metadata provided by OData V4.
   * <br>
   * Usually, a DataField annotation is expected
   *
   * Usage example:
   * <pre>
   * <internalMacro:Field
   *   idPrefix="SomePrefix"
   *   contextPath="{entitySet>}"
   *   metaPath="{dataField>}"
   * />
   * </pre>
   * @class sap.fe.macros.internal.Field
   * @hideconstructor
   * @private
   * @experimental
   * @since 1.94.0
   */
  var Field = MacroMetadata.extend("sap.fe.macros.internal.Field", {
    /**
     * Name of the macro control.
     */
    name: "Field",
    /**
     * Namespace of the macro control
     */
    namespace: "sap.fe.macros.internal",
    /**
     * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
     */
    fragment: "sap.fe.macros.internal.Field",
    /**
     * The metadata describing the macro control.
     */
    metadata: {
      /**
       * Define macro stereotype for documentation
       */
      stereotype: "xmlmacro",
      /**
       * Location of the designtime info
       */
      designtime: "sap/fe/macros/internal/Field.designtime",
      /**
       * Properties.
       */
      properties: {
        /**
         * Prefix added to the generated ID of the field
         */
        idPrefix: {
          type: "string"
        },
        _apiId: {
          type: "string"
        },
        noWrapperId: {
          type: "string"
        },
        /**
         * Prefix added to the generated ID of the value help used for the field
         */
        vhIdPrefix: {
          type: "string",
          defaultValue: "FieldValueHelp"
        },
        _vhFlexId: {
          type: "string",
          computed: true
        },
        /**
         * Metadata path to the entity set
         */
        entitySet: {
          type: "sap.ui.model.Context",
          required: true,
          $kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
        },
        /**
         * Metadata path to the entity set
         */
        entityType: {
          type: "sap.ui.model.Context",
          required: false,
          computed: true,
          $kind: ["EntityType"]
        },
        /**
         * Parent entity set
         */
        parentEntitySet: {
          type: "sap.ui.model.Context",
          required: false,
          $kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
        },
        /**
         * Flag indicating whether action will navigate after execution
         */
        navigateAfterAction: {
          type: "boolean",
          defaultValue: true
        },
        /**
         * Metadata path to the dataField.
         * This property is usually a metadataContext pointing to a DataField having
         * $Type of DataField, DataFieldWithUrl, DataFieldForAnnotation, DataFieldForAction, DataFieldForIntentBasedNavigation, DataFieldWithNavigationPath, or DataPointType.
         * But it can also be a Property with $kind="Property"
         */
        dataField: {
          type: "sap.ui.model.Context",
          required: true,
          $kind: ["Property"],
          $Type: ["com.sap.vocabularies.UI.v1.DataField", "com.sap.vocabularies.UI.v1.DataFieldWithUrl", "com.sap.vocabularies.UI.v1.DataFieldForAnnotation", "com.sap.vocabularies.UI.v1.DataFieldForAction", "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldWithAction", "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation", "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath", "com.sap.vocabularies.UI.v1.DataPointType"]
        },
        /**
         * Context pointing to an array of the property's semantic objects
         */
        semanticObjects: {
          type: "sap.ui.model.Context",
          required: false,
          computed: true
        },
        /**
         * Edit Mode of the field.
         *
         * If the editMode is undefined then we compute it based on the metadata
         * Otherwise we use the value provided here.
         */
        editMode: {
          type: "sap.ui.mdc.enum.EditMode"
        },
        /**
         * Wrap field
         */
        wrap: {
          type: "boolean"
        },
        /**
         * CSS class for margin
         */
        "class": {
          type: "string"
        },
        /**
         * Property added to associate the label with the Field
         */
        ariaLabelledBy: {
          type: "string"
        },
        textAlign: {
          type: "sap.ui.core.TextAlign"
        },
        editableExpression: {
          type: "string",
          computed: true
        },
        enabledExpression: {
          type: "string",
          computed: true
        },
        collaborationEnabled: {
          type: "boolean",
          computed: true
        },
        collaborationHasActivityExpression: {
          type: "string",
          computed: true
        },
        collaborationInitialsExpression: {
          type: "string",
          computed: true
        },
        collaborationColorExpression: {
          type: "string",
          computed: true
        },
        /**
         * Option to add a semantic object to a field
         */
        semanticObject: {
          type: "string",
          required: false
        },
        hasSemanticObjectOnNavigation: {
          type: "boolean",
          required: false
        },
        linkUrl: {
          type: "string",
          required: false
        },
        formatOptions: {
          type: "object",
          properties: {
            isCurrencyAligned: {
              type: "boolean",
              defaultValue: false
            },
            /**
             * expression for ObjectStatus visible property
             */
            containsErrorVisibility: {
              type: "string"
            },
            /**
             * Describe how the alignment works between Table mode (Date and Numeric End alignment) and Form mode (numeric aligned End in edit and Begin in display)
             */
            textAlignMode: {
              type: "string",
              defaultValue: "Table",
              allowedValues: ["Table", "Form"]
            },
            displayMode: {
              type: "string",
              allowedValues: ["Value", "Description", "ValueDescription", "DescriptionValue"]
            },
            fieldMode: {
              type: "string",
              allowedValues: ["nowrapper", ""]
            },
            measureDisplayMode: {
              type: "string",
              allowedValues: ["Hidden", "ReadOnly"]
            },
            /**
             * Maximum number of lines for multiline texts in edit mode
             */
            textLinesEdit: {
              type: "number",
              configurable: true
            },
            /**
             * Maximum number of lines that multiline texts in edit mode can grow to
             */
            textMaxLines: {
              type: "number",
              configurable: true
            },
            /**
             * Maximum number of characters from the beginning of the text field that are shown initially.
             */
            textMaxCharactersDisplay: {
              type: "number",
              configurable: true
            },
            /**
             * Defines how the full text will be displayed - InPlace or Popover
             */
            textExpandBehaviorDisplay: {
              type: "string",
              allowedValues: ["InPlace", "Popover"]
            },
            /**
             * If set to 'true', SAP Fiori elements shows an empty indicator in display mode for the text and links
             */
            showEmptyIndicator: {
              type: "boolean",
              defaultValue: false
            },
            /**
             * Preferred control if a semanticKey is used (if the semanticKey is empty, no specific rules apply)
             */
            semanticKeyStyle: {
              type: "string",
              defaultValue: "",
              allowedValues: ["ObjectIdentifier", "Label", ""]
            },
            hasDraftIndicator: {
              type: "boolean",
              defaultValue: false
            },
            /**
             * If true then sets the given icon instead of text in Action/IBN Button
             */
            showIconUrl: {
              type: "boolean",
              defaultValue: false
            },
            /**
             * If true then navigationavailable property will not be used for enablement of IBN button
             */
            ignoreNavigationAvailable: {
              type: "boolean",
              defaultValue: false
            },
            isAnalytics: {
              type: "boolean",
              defaultValue: false
            },
            /**
             * Enables the fallback feature for usage the text annotation from the value lists
             */
            retrieveTextFromValueList: {
              type: "boolean",
              defaultValue: false
            },
            compactSemanticKey: {
              type: "boolean",
              defaultValue: false
            },
            fieldGroupDraftIndicatorPropertyPath: {
              type: "string"
            },
            fieldGroupName: {
              type: "string"
            }
          }
        }
      },
      events: {
        /**
         * Event handler for change event
         */
        onChange: {
          type: "function"
        }
      }
    },
    getOverrides: function (mControlConfiguration, sID) {
      var oProps = {};
      if (mControlConfiguration) {
        var oControlConfig = mControlConfiguration[sID];
        if (oControlConfig) {
          Object.keys(oControlConfig).forEach(function (sConfigKey) {
            oProps[sConfigKey] = oControlConfig[sConfigKey];
          });
        }
      }
      return oProps;
    },
    setUpDataPointType: function (oDataField) {
      // data point annotations need not have $Type defined, so add it if missing
      if ((oDataField === null || oDataField === void 0 ? void 0 : oDataField.term) === "com.sap.vocabularies.UI.v1.DataPoint") {
        oDataField.$Type = oDataField.$Type || "com.sap.vocabularies.UI.v1.DataPointType";
      }
    },
    setUpVisibleProperties: function (oFieldProps, oPropertyDataModelObjectPath) {
      // we do this before enhancing the dataModelPath so that it still points at the DataField
      oFieldProps.visible = FieldTemplating.getVisibleExpression(oPropertyDataModelObjectPath, oFieldProps.formatOptions);
      oFieldProps.displayVisible = oFieldProps.formatOptions.fieldMode === "nowrapper" ? oFieldProps.visible : undefined;
    },
    setUpParentEntitySet: function (oFieldProps, oPropertyDataModelObjectPath, mSettings) {
      var _mSettings$models;
      if (oPropertyDataModelObjectPath !== null && oPropertyDataModelObjectPath !== void 0 && oPropertyDataModelObjectPath.contextLocation && mSettings !== null && mSettings !== void 0 && (_mSettings$models = mSettings.models) !== null && _mSettings$models !== void 0 && _mSettings$models.metaModel) {
        oFieldProps.parentEntitySet = mSettings.models.metaModel.createBindingContext("/".concat(oPropertyDataModelObjectPath.contextLocation.startingEntitySet ? oPropertyDataModelObjectPath.contextLocation.startingEntitySet.name : oPropertyDataModelObjectPath.startingEntitySet.name));
      }
    },
    create: function (oProps, oControlConfiguration, mSettings) {
      var _oProps$dataField$get;
      var oDataFieldConverted = MetaModelConverter.convertMetaModelContext(oProps.dataField);
      var oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(oProps.dataField, oProps.entitySet);
      this.setUpDataPointType(oDataFieldConverted);
      this.setUpVisibleProperties(oProps, oDataModelPath);
      this.setUpParentEntitySet(oProps, oDataModelPath, mSettings);
      if (oProps._flexId) {
        oProps._apiId = oProps._flexId;
        oProps._flexId = this.getContentId(oProps._flexId);
        oProps._vhFlexId = "".concat(oProps._flexId, "_").concat(oProps.vhIdPrefix);
      }
      oDataModelPath = this._getTargetValueDataModelPath(oDataFieldConverted, oDataModelPath);
      this.setUpSemanticObjects(oProps, oDataModelPath);
      oProps.dataSourcePath = getTargetObjectPath(oDataModelPath);
      var oMetaModel = mSettings.models.metaModel || mSettings.models.entitySet;
      oProps.entityType = oMetaModel.createBindingContext("/".concat(oDataModelPath.targetEntityType.fullyQualifiedName));
      this.setUpEditableProperties(oProps, oDataFieldConverted, oDataModelPath, oMetaModel);
      this.setUpFormatOptions(oProps, oDataModelPath, oControlConfiguration, mSettings);
      this.setUpDisplayStyle(oProps, oDataFieldConverted, oDataModelPath);
      this.setUpEditStyle(oProps, oDataFieldConverted, oDataModelPath);

      // ---------------------------------------- compute bindings----------------------------------------------------
      var aDisplayStylesWithoutPropText = ["Avatar", "AmountWithCurrency"];
      if (oProps.displayStyle && aDisplayStylesWithoutPropText.indexOf(oProps.displayStyle) === -1 && oDataModelPath.targetObject) {
        oProps.text = oProps.text || FieldTemplating.getTextBinding(oDataModelPath, oProps.formatOptions);
        this.setUpObjectIdentifierTitleAndText(oProps, oDataModelPath);
      } else {
        oProps.text = "";
      }

      //TODO this is fixed twice
      // data point annotations need not have $Type defined, so add it if missing
      if (((_oProps$dataField$get = oProps.dataField.getObject("@sapui.name")) === null || _oProps$dataField$get === void 0 ? void 0 : _oProps$dataField$get.indexOf("com.sap.vocabularies.UI.v1.DataPoint")) > -1) {
        var oDataPoint = oProps.dataField.getObject();
        oDataPoint.$Type = oDataPoint.$Type || "com.sap.vocabularies.UI.v1.DataPointType";
        oProps.dataField = new TemplateModel(oDataPoint, oProps.dataField.getModel()).createBindingContext("/");
      }
      oProps.emptyIndicatorMode = oProps.formatOptions.showEmptyIndicator ? "On" : undefined;
      return oProps;
    },
    getObjectIdentifierTitle: function (fieldFormatOptions, oPropertyDataModelObjectPath) {
      var _oPropertyDefinition$, _oPropertyDefinition$2, _oPropertyDataModelOb, _oPropertyDataModelOb2, _oPropertyDataModelOb3, _oPropertyDataModelOb4, _oPropertyDataModelOb5, _oPropertyDataModelOb6, _commonText$annotatio, _commonText$annotatio2;
      var propertyBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
      var targetDisplayMode = fieldFormatOptions === null || fieldFormatOptions === void 0 ? void 0 : fieldFormatOptions.displayMode;
      var oPropertyDefinition = oPropertyDataModelObjectPath.targetObject.type === "PropertyPath" ? oPropertyDataModelObjectPath.targetObject.$target : oPropertyDataModelObjectPath.targetObject;
      propertyBindingExpression = UIFormatters.formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);
      var commonText = (_oPropertyDefinition$ = oPropertyDefinition.annotations) === null || _oPropertyDefinition$ === void 0 ? void 0 : (_oPropertyDefinition$2 = _oPropertyDefinition$.Common) === null || _oPropertyDefinition$2 === void 0 ? void 0 : _oPropertyDefinition$2.Text;
      if (commonText === undefined) {
        // there is no property for description
        targetDisplayMode = "Value";
      }
      var relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);
      var parametersForFormatter = [];
      parametersForFormatter.push(pathInModel("T_NEW_OBJECT", "sap.fe.i18n"));
      parametersForFormatter.push(pathInModel("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO", "sap.fe.i18n"));
      if (!!((_oPropertyDataModelOb = oPropertyDataModelObjectPath.targetEntitySet) !== null && _oPropertyDataModelOb !== void 0 && (_oPropertyDataModelOb2 = _oPropertyDataModelOb.annotations) !== null && _oPropertyDataModelOb2 !== void 0 && (_oPropertyDataModelOb3 = _oPropertyDataModelOb2.Common) !== null && _oPropertyDataModelOb3 !== void 0 && _oPropertyDataModelOb3.DraftRoot) || !!((_oPropertyDataModelOb4 = oPropertyDataModelObjectPath.targetEntitySet) !== null && _oPropertyDataModelOb4 !== void 0 && (_oPropertyDataModelOb5 = _oPropertyDataModelOb4.annotations) !== null && _oPropertyDataModelOb5 !== void 0 && (_oPropertyDataModelOb6 = _oPropertyDataModelOb5.Common) !== null && _oPropertyDataModelOb6 !== void 0 && _oPropertyDataModelOb6.DraftNode)) {
        parametersForFormatter.push(Entity.HasDraft);
        parametersForFormatter.push(Entity.IsActive);
      } else {
        parametersForFormatter.push(constant(null));
        parametersForFormatter.push(constant(null));
      }
      switch (targetDisplayMode) {
        case "Value":
          parametersForFormatter.push(propertyBindingExpression);
          parametersForFormatter.push(constant(null));
          break;
        case "Description":
          parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation));
          parametersForFormatter.push(constant(null));
          break;
        case "ValueDescription":
          parametersForFormatter.push(propertyBindingExpression);
          parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation));
          break;
        default:
          if (commonText !== null && commonText !== void 0 && (_commonText$annotatio = commonText.annotations) !== null && _commonText$annotatio !== void 0 && (_commonText$annotatio2 = _commonText$annotatio.UI) !== null && _commonText$annotatio2 !== void 0 && _commonText$annotatio2.TextArrangement) {
            parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation));
            parametersForFormatter.push(propertyBindingExpression);
          } else {
            var _oPropertyDataModelOb7, _oPropertyDataModelOb8, _oPropertyDataModelOb9;
            // if DescriptionValue is set by default and not by TextArrangement
            // we show description in ObjectIdentifier Title and value in ObjectIdentifier Text
            parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation));
            // if DescriptionValue is set by default and property has a semantic object
            // we show description and value in ObjectIdentifier Title
            if ((_oPropertyDataModelOb7 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb7 !== void 0 && (_oPropertyDataModelOb8 = _oPropertyDataModelOb7.annotations) !== null && _oPropertyDataModelOb8 !== void 0 && (_oPropertyDataModelOb9 = _oPropertyDataModelOb8.Common) !== null && _oPropertyDataModelOb9 !== void 0 && _oPropertyDataModelOb9.SemanticObject) {
              parametersForFormatter.push(propertyBindingExpression);
            } else {
              parametersForFormatter.push(constant(null));
            }
          }
          break;
      }
      return compileExpression(formatResult(parametersForFormatter, valueFormatters.formatOPTitle));
    },
    getObjectIdentifierText: function (fieldFormatOptions, oPropertyDataModelObjectPath) {
      var _oPropertyDefinition$3, _oPropertyDefinition$4, _commonText$annotatio3, _commonText$annotatio4;
      var propertyBindingExpression = pathInModel(getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath));
      var targetDisplayMode = fieldFormatOptions === null || fieldFormatOptions === void 0 ? void 0 : fieldFormatOptions.displayMode;
      var oPropertyDefinition = oPropertyDataModelObjectPath.targetObject.type === "PropertyPath" ? oPropertyDataModelObjectPath.targetObject.$target : oPropertyDataModelObjectPath.targetObject;
      var commonText = (_oPropertyDefinition$3 = oPropertyDefinition.annotations) === null || _oPropertyDefinition$3 === void 0 ? void 0 : (_oPropertyDefinition$4 = _oPropertyDefinition$3.Common) === null || _oPropertyDefinition$4 === void 0 ? void 0 : _oPropertyDefinition$4.Text;
      if (commonText === undefined || commonText !== null && commonText !== void 0 && (_commonText$annotatio3 = commonText.annotations) !== null && _commonText$annotatio3 !== void 0 && (_commonText$annotatio4 = _commonText$annotatio3.UI) !== null && _commonText$annotatio4 !== void 0 && _commonText$annotatio4.TextArrangement) {
        return undefined;
      }
      propertyBindingExpression = UIFormatters.formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);
      switch (targetDisplayMode) {
        case "ValueDescription":
          var relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);
          return compileExpression(getExpressionFromAnnotation(commonText, relativeLocation));
        case "DescriptionValue":
          return compileExpression(propertyBindingExpression);
        default:
          return undefined;
      }
    },
    setUpObjectIdentifierTitleAndText: function (_oProps, oPropertyDataModelObjectPath) {
      var _oProps$formatOptions;
      if (((_oProps$formatOptions = _oProps.formatOptions) === null || _oProps$formatOptions === void 0 ? void 0 : _oProps$formatOptions.semanticKeyStyle) === "ObjectIdentifier") {
        var _oPropertyDataModelOb10, _oPropertyDataModelOb11, _oPropertyDataModelOb12;
        _oProps.identifierTitle = this.getObjectIdentifierTitle(_oProps.formatOptions, oPropertyDataModelObjectPath);
        if (!((_oPropertyDataModelOb10 = oPropertyDataModelObjectPath.targetObject) !== null && _oPropertyDataModelOb10 !== void 0 && (_oPropertyDataModelOb11 = _oPropertyDataModelOb10.annotations) !== null && _oPropertyDataModelOb11 !== void 0 && (_oPropertyDataModelOb12 = _oPropertyDataModelOb11.Common) !== null && _oPropertyDataModelOb12 !== void 0 && _oPropertyDataModelOb12.SemanticObject)) {
          _oProps.identifierText = this.getObjectIdentifierText(_oProps.formatOptions, oPropertyDataModelObjectPath);
        } else {
          _oProps.identifierText = undefined;
        }
      } else {
        _oProps.identifierTitle = undefined;
        _oProps.identifierText = undefined;
      }
    },
    getTextWithWhiteSpace: function (formatOptions, oDataModelPath) {
      var text = FieldTemplating.getTextBinding(oDataModelPath, formatOptions, true);
      return text._type === "PathInModel" || typeof text === "string" ? compileExpression(formatResult([text], "WSR")) : compileExpression(text);
    },
    _getTargetValueDataModelPath: function (oDataField, oDataModelPath) {
      var _oDataField$Value, _sExtraPath;
      if (!(oDataField !== null && oDataField !== void 0 && oDataField.$Type)) {
        return oDataModelPath;
      }
      var sExtraPath = "";
      var targetValueDataModelPath = oDataModelPath;
      switch (oDataField.$Type) {
        case "com.sap.vocabularies.UI.v1.DataField":
        case "com.sap.vocabularies.UI.v1.DataPointType":
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
          sExtraPath = (_oDataField$Value = oDataField.Value) === null || _oDataField$Value === void 0 ? void 0 : _oDataField$Value.path;
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          if (oDataField.Target.$target) {
            if (oDataField.Target.$target.$Type === "com.sap.vocabularies.UI.v1.DataField" || oDataField.Target.$target.$Type === "com.sap.vocabularies.UI.v1.DataPointType") {
              var _oDataField$Target$$t;
              sExtraPath = (_oDataField$Target$$t = oDataField.Target.$target.Value) === null || _oDataField$Target$$t === void 0 ? void 0 : _oDataField$Target$$t.path;
            } else {
              var _oDataField$Target;
              sExtraPath = (_oDataField$Target = oDataField.Target) === null || _oDataField$Target === void 0 ? void 0 : _oDataField$Target.path;
            }
          }
          break;
      }
      if (((_sExtraPath = sExtraPath) === null || _sExtraPath === void 0 ? void 0 : _sExtraPath.length) > 0) {
        targetValueDataModelPath = enhanceDataModelPath(oDataModelPath, sExtraPath);
      }
      return targetValueDataModelPath;
    },
    // algorithm to determine the field fragment to use in display and setUp some properties
    setUpDisplayStyle: function (oProps, oDataField, oDataModelPath) {
      var _oProperty$annotation, _oProperty$annotation2, _oDataField$Target2, _oDataField$Target2$$, _oDataField$Target3, _oDataField$Target3$$, _oProperty$annotation3, _oProperty$annotation4, _oProperty$annotation5, _oProperty$annotation6, _oProperty$annotation7, _oProperty$annotation8, _oProperty$annotation9, _oProperty$annotation10, _oProperty$annotation11, _oProperty$annotation12, _oProperty$annotation13, _oProperty$annotation14, _oProperty$annotation15, _oDataModelPath$navig, _oDataModelPath$navig2;
      var oProperty = oDataModelPath.targetObject;
      if (!oDataModelPath.targetObject) {
        oProps.displayStyle = "Text";
        return;
      }
      if (oProperty.type === "Edm.Stream") {
        oProps.displayStyle = "File";
        return;
      }
      if ((_oProperty$annotation = oProperty.annotations) !== null && _oProperty$annotation !== void 0 && (_oProperty$annotation2 = _oProperty$annotation.UI) !== null && _oProperty$annotation2 !== void 0 && _oProperty$annotation2.IsImageURL) {
        oProps.displayStyle = "Avatar";
        return;
      }
      var hasQuickViewFacets = oProperty ? FieldTemplating.isUsedInNavigationWithQuickViewFacets(oDataModelPath, oProperty) : false;
      switch (oDataField.$Type) {
        case "com.sap.vocabularies.UI.v1.DataPointType":
          oProps.displayStyle = "DataPoint";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
          if (((_oDataField$Target2 = oDataField.Target) === null || _oDataField$Target2 === void 0 ? void 0 : (_oDataField$Target2$$ = _oDataField$Target2.$target) === null || _oDataField$Target2$$ === void 0 ? void 0 : _oDataField$Target2$$.$Type) === "com.sap.vocabularies.UI.v1.DataPointType") {
            oProps.displayStyle = "DataPoint";
            return;
          } else if (((_oDataField$Target3 = oDataField.Target) === null || _oDataField$Target3 === void 0 ? void 0 : (_oDataField$Target3$$ = _oDataField$Target3.$target) === null || _oDataField$Target3$$ === void 0 ? void 0 : _oDataField$Target3$$.$Type) === "com.sap.vocabularies.Communication.v1.ContactType") {
            oProps.displayStyle = "Contact";
            return;
          }
          break;
        case "com.sap.vocabularies.UI.v1.DataFieldForAction":
          oProps.displayStyle = "Button";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
          this.setUpNavigationAvailable(oProps, oDataField);
          oProps.displayStyle = "Button";
          return;
        case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
          oProps.text = this.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        // falls through
        case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
        case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
          oProps.displayStyle = "Link";
          return;
      }
      if (isSemanticKey(oProperty, oDataModelPath) && oProps.formatOptions.semanticKeyStyle) {
        var _oDataModelPath$targe, _oDataModelPath$targe2, _oDataModelPath$targe3;
        oProps.hasQuickViewFacets = hasQuickViewFacets;
        oProps.hasSituationsIndicator = SituationsIndicator.getSituationsNavigationProperty(oDataModelPath.targetEntityType) !== undefined;
        this.setUpObjectIdentifierTitleAndText(oProps, oDataModelPath);
        if ((_oDataModelPath$targe = oDataModelPath.targetEntitySet) !== null && _oDataModelPath$targe !== void 0 && (_oDataModelPath$targe2 = _oDataModelPath$targe.annotations) !== null && _oDataModelPath$targe2 !== void 0 && (_oDataModelPath$targe3 = _oDataModelPath$targe2.Common) !== null && _oDataModelPath$targe3 !== void 0 && _oDataModelPath$targe3.DraftRoot) {
          oProps.displayStyle = "SemanticKeyWithDraftIndicator";
          return;
        }
        oProps.displayStyle = oProps.formatOptions.semanticKeyStyle === "ObjectIdentifier" ? "ObjectIdentifier" : "LabelSemanticKey";
        return;
      }
      if (oDataField.Criticality) {
        oProps.hasQuickViewFacets = hasQuickViewFacets;
        oProps.linkUrl = oDataField.Url ? compileExpression(getExpressionFromAnnotation(oDataField.Url)) : undefined;
        oProps.displayStyle = "ObjectStatus";
        return;
      }
      if ((_oProperty$annotation3 = oProperty.annotations) !== null && _oProperty$annotation3 !== void 0 && (_oProperty$annotation4 = _oProperty$annotation3.Measures) !== null && _oProperty$annotation4 !== void 0 && _oProperty$annotation4.ISOCurrency && String(oProps.formatOptions.isCurrencyAligned) === "true") {
        if (oProps.formatOptions.measureDisplayMode === "Hidden") {
          oProps.displayStyle = "Text";
          return;
        }
        oProps.valueAsStringBindingExpression = FieldTemplating.getValueBinding(oDataModelPath, oProps.formatOptions, true, true, undefined, true);
        oProps.unitBindingExpression = compileExpression(UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
        oProps.displayStyle = "AmountWithCurrency";
        return;
      }
      if ((_oProperty$annotation5 = oProperty.annotations) !== null && _oProperty$annotation5 !== void 0 && (_oProperty$annotation6 = _oProperty$annotation5.Communication) !== null && _oProperty$annotation6 !== void 0 && _oProperty$annotation6.IsEmailAddress || (_oProperty$annotation7 = oProperty.annotations) !== null && _oProperty$annotation7 !== void 0 && (_oProperty$annotation8 = _oProperty$annotation7.Communication) !== null && _oProperty$annotation8 !== void 0 && _oProperty$annotation8.IsPhoneNumber) {
        oProps.text = this.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.displayStyle = "Link";
        return;
      }
      if ((_oProperty$annotation9 = oProperty.annotations) !== null && _oProperty$annotation9 !== void 0 && (_oProperty$annotation10 = _oProperty$annotation9.UI) !== null && _oProperty$annotation10 !== void 0 && _oProperty$annotation10.MultiLineText) {
        oProps.displayStyle = "ExpandableText";
        return;
      }
      if (hasQuickViewFacets) {
        oProps.text = this.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.hasQuickViewFacets = true;
        oProps.displayStyle = "LinkWithQuickViewForm";
        return;
      }
      if (oProps.semanticObject && !(oProperty !== null && oProperty !== void 0 && (_oProperty$annotation11 = oProperty.annotations) !== null && _oProperty$annotation11 !== void 0 && (_oProperty$annotation12 = _oProperty$annotation11.Communication) !== null && _oProperty$annotation12 !== void 0 && _oProperty$annotation12.IsEmailAddress || oProperty !== null && oProperty !== void 0 && (_oProperty$annotation13 = oProperty.annotations) !== null && _oProperty$annotation13 !== void 0 && (_oProperty$annotation14 = _oProperty$annotation13.Communication) !== null && _oProperty$annotation14 !== void 0 && _oProperty$annotation14.IsPhoneNumber)) {
        oProps.hasQuickViewFacets = hasQuickViewFacets;
        oProps.text = this.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.displayStyle = "LinkWithQuickViewForm";
        return;
      }
      var _oPropertyCommonAnnotations = (_oProperty$annotation15 = oProperty.annotations) === null || _oProperty$annotation15 === void 0 ? void 0 : _oProperty$annotation15.Common;
      var _oPropertyNavigationPropertyAnnotations = oDataModelPath === null || oDataModelPath === void 0 ? void 0 : (_oDataModelPath$navig = oDataModelPath.navigationProperties[0]) === null || _oDataModelPath$navig === void 0 ? void 0 : (_oDataModelPath$navig2 = _oDataModelPath$navig.annotations) === null || _oDataModelPath$navig2 === void 0 ? void 0 : _oDataModelPath$navig2.Common;
      for (var key in _oPropertyCommonAnnotations) {
        if (key.indexOf("SemanticObject") === 0) {
          oProps.hasQuickViewFacets = hasQuickViewFacets;
          oProps.displayStyle = "LinkWrapper";
          return;
        }
      }
      for (var _key in _oPropertyNavigationPropertyAnnotations) {
        if (_key.indexOf("SemanticObject") === 0) {
          oProps.hasQuickViewFacets = hasQuickViewFacets;
          oProps.displayStyle = "LinkWrapper";
          return;
        }
      }
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
        oProps.text = this.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
        oProps.displayStyle = "Link";
        return;
      }
      oProps.displayStyle = "Text";
    },
    // algorithm to determine the field fragment to use in edit and set up some properties
    setUpEditStyle: function (oProps, oDataField, oDataModelPath) {
      FieldTemplating.setEditStyleProperties(oProps, oDataField, oDataModelPath);
    },
    setUpEditableProperties: function (oProps, oDataField, oDataModelPath, oMetaModel) {
      var _oDataModelPath$targe4, _oProps$entitySet, _oProps$entitySet2;
      var oPropertyForFieldControl = oDataModelPath !== null && oDataModelPath !== void 0 && (_oDataModelPath$targe4 = oDataModelPath.targetObject) !== null && _oDataModelPath$targe4 !== void 0 && _oDataModelPath$targe4.Value ? oDataModelPath.targetObject.Value : oDataModelPath === null || oDataModelPath === void 0 ? void 0 : oDataModelPath.targetObject;
      if (oProps.editMode !== undefined && oProps.editMode !== null) {
        // Even if it provided as a string it's a valid part of a binding expression that can be later combined into something else.
        oProps.editModeAsObject = oProps.editMode;
      } else {
        var bMeasureReadOnly = oProps.formatOptions.measureDisplayMode ? oProps.formatOptions.measureDisplayMode === "ReadOnly" : false;
        oProps.editModeAsObject = UIFormatters.getEditMode(oPropertyForFieldControl, oDataModelPath, bMeasureReadOnly, true, oDataField);
        oProps.editMode = compileExpression(oProps.editModeAsObject);
      }
      var editableExpression = UIFormatters.getEditableExpressionAsObject(oPropertyForFieldControl, oDataField, oDataModelPath);
      var aRequiredPropertiesFromInsertRestrictions = CommonUtils.getRequiredPropertiesFromInsertRestrictions((_oProps$entitySet = oProps.entitySet) === null || _oProps$entitySet === void 0 ? void 0 : _oProps$entitySet.getPath().replaceAll("/$NavigationPropertyBinding/", "/"), oMetaModel);
      var aRequiredPropertiesFromUpdateRestrictions = CommonUtils.getRequiredPropertiesFromUpdateRestrictions((_oProps$entitySet2 = oProps.entitySet) === null || _oProps$entitySet2 === void 0 ? void 0 : _oProps$entitySet2.getPath().replaceAll("/$NavigationPropertyBinding/", "/"), oMetaModel);
      var oRequiredProperties = {
        requiredPropertiesFromInsertRestrictions: aRequiredPropertiesFromInsertRestrictions,
        requiredPropertiesFromUpdateRestrictions: aRequiredPropertiesFromUpdateRestrictions
      };
      if (ModelHelper.isCollaborationDraftSupported(oMetaModel)) {
        oProps.collaborationEnabled = true;
        // Expressions needed for Collaboration Visualization
        var collaborationExpression = UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.hasCollaborationActivity);
        oProps.collaborationHasActivityExpression = compileExpression(collaborationExpression);
        oProps.collaborationInitialsExpression = compileExpression(UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityInitials));
        oProps.collaborationColorExpression = compileExpression(UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityColor));
        oProps.editableExpression = compileExpression(and(editableExpression, not(collaborationExpression)));
        oProps.editMode = compileExpression(ifElse(collaborationExpression, constant("ReadOnly"), oProps.editModeAsObject));
      } else {
        oProps.editableExpression = compileExpression(editableExpression);
      }
      oProps.enabledExpression = UIFormatters.getEnabledExpression(oPropertyForFieldControl, oDataField, false, oDataModelPath);
      oProps.requiredExpression = UIFormatters.getRequiredExpression(oPropertyForFieldControl, oDataField, false, false, oRequiredProperties, oDataModelPath);
    },
    setUpFormatOptions: function (oProps, oDataModelPath, oControlConfiguration, mSettings) {
      var _mSettings$models$vie;
      var oOverrideProps = this.getOverrides(oControlConfiguration, oProps.dataField.getPath());
      if (!oProps.formatOptions.displayMode) {
        oProps.formatOptions.displayMode = UIFormatters.getDisplayMode(oDataModelPath);
      }
      oProps.formatOptions.textLinesEdit = oOverrideProps.textLinesEdit || oOverrideProps.formatOptions && oOverrideProps.formatOptions.textLinesEdit || oProps.formatOptions.textLinesEdit || 4;
      oProps.formatOptions.textMaxLines = oOverrideProps.textMaxLines || oOverrideProps.formatOptions && oOverrideProps.formatOptions.textMaxLines || oProps.formatOptions.textMaxLines;

      // Retrieve text from value list as fallback feature for missing text annotation on the property
      if ((_mSettings$models$vie = mSettings.models.viewData) !== null && _mSettings$models$vie !== void 0 && _mSettings$models$vie.getProperty("/retrieveTextFromValueList")) {
        oProps.formatOptions.retrieveTextFromValueList = FieldTemplating.isRetrieveTextFromValueListEnabled(oDataModelPath.targetObject, oProps.formatOptions);
        if (oProps.formatOptions.retrieveTextFromValueList) {
          var _oDataModelPath$targe5, _oDataModelPath$targe6, _oDataModelPath$targe7;
          // Consider TextArrangement at EntityType otherwise set default display format 'DescriptionValue'
          var hasEntityTextArrangement = !!(oDataModelPath !== null && oDataModelPath !== void 0 && (_oDataModelPath$targe5 = oDataModelPath.targetEntityType) !== null && _oDataModelPath$targe5 !== void 0 && (_oDataModelPath$targe6 = _oDataModelPath$targe5.annotations) !== null && _oDataModelPath$targe6 !== void 0 && (_oDataModelPath$targe7 = _oDataModelPath$targe6.UI) !== null && _oDataModelPath$targe7 !== void 0 && _oDataModelPath$targe7.TextArrangement);
          oProps.formatOptions.displayMode = hasEntityTextArrangement ? oProps.formatOptions.displayMode : "DescriptionValue";
        }
      }
      if (oProps.formatOptions.fieldMode === "nowrapper" && oProps.editMode === "Display") {
        if (oProps._flexId) {
          oProps.noWrapperId = oProps._flexId;
        } else {
          oProps.noWrapperId = oProps.idPrefix ? generate([oProps.idPrefix, "Field-content"]) : undefined;
        }
      }
    },
    setUpSemanticObjects: function (oProps, oDataModelPath) {
      var _oDataModelPath$targe8, _oDataModelPath$targe9;
      var aSemObjExprToResolve = [];
      aSemObjExprToResolve = FieldTemplating.getSemanticObjectExpressionToResolve(oDataModelPath === null || oDataModelPath === void 0 ? void 0 : (_oDataModelPath$targe8 = oDataModelPath.targetObject) === null || _oDataModelPath$targe8 === void 0 ? void 0 : (_oDataModelPath$targe9 = _oDataModelPath$targe8.annotations) === null || _oDataModelPath$targe9 === void 0 ? void 0 : _oDataModelPath$targe9.Common);

      /**
       * If the field building block has a binding expression in the custom semantic objects,
       * it gets stored to the custom data of the Link in LinkWithQuickViewForm.fragment.xml
       * This is needed to resolve the link at runtime. The QuickViewLinkDelegate.js then gets the resolved
       * binding expression from the custom data.
       * All other custom semantic objects are processed in FieldHelper.js:computeLinkParameters
       */
      if (!!oProps.semanticObject && typeof oProps.semanticObject === "string" && oProps.semanticObject[0] === "{") {
        aSemObjExprToResolve.push({
          key: oProps.semanticObject.substr(1, oProps.semanticObject.length - 2),
          value: oProps.semanticObject
        });
      }
      oProps.semanticObjects = FieldTemplating.getSemanticObjects(aSemObjExprToResolve);
      // This sets up the semantic links found in the navigation property, if there is no semantic links define before.
      if (!oProps.semanticObject && oDataModelPath.navigationProperties.length > 0) {
        oDataModelPath.navigationProperties.forEach(function (navProperty) {
          var _navProperty$annotati, _navProperty$annotati2;
          if (navProperty !== null && navProperty !== void 0 && (_navProperty$annotati = navProperty.annotations) !== null && _navProperty$annotati !== void 0 && (_navProperty$annotati2 = _navProperty$annotati.Common) !== null && _navProperty$annotati2 !== void 0 && _navProperty$annotati2.SemanticObject) {
            oProps.semanticObject = navProperty.annotations.Common.SemanticObject;
            oProps.hasSemanticObjectOnNavigation = true;
          }
        });
      }
    },
    setUpNavigationAvailable: function (oProps, oDataField) {
      oProps.navigationAvailable = true;
      if ((oDataField === null || oDataField === void 0 ? void 0 : oDataField.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && oDataField.NavigationAvailable !== undefined && String(oProps.formatOptions.ignoreNavigationAvailable) !== "true") {
        oProps.navigationAvailable = compileExpression(getExpressionFromAnnotation(oDataField.NavigationAvailable));
      }
    }
  });
  return Field;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWVsZCIsIk1hY3JvTWV0YWRhdGEiLCJleHRlbmQiLCJuYW1lIiwibmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJtZXRhZGF0YSIsInN0ZXJlb3R5cGUiLCJkZXNpZ250aW1lIiwicHJvcGVydGllcyIsImlkUHJlZml4IiwidHlwZSIsIl9hcGlJZCIsIm5vV3JhcHBlcklkIiwidmhJZFByZWZpeCIsImRlZmF1bHRWYWx1ZSIsIl92aEZsZXhJZCIsImNvbXB1dGVkIiwiZW50aXR5U2V0IiwicmVxdWlyZWQiLCIka2luZCIsImVudGl0eVR5cGUiLCJwYXJlbnRFbnRpdHlTZXQiLCJuYXZpZ2F0ZUFmdGVyQWN0aW9uIiwiZGF0YUZpZWxkIiwiJFR5cGUiLCJzZW1hbnRpY09iamVjdHMiLCJlZGl0TW9kZSIsIndyYXAiLCJhcmlhTGFiZWxsZWRCeSIsInRleHRBbGlnbiIsImVkaXRhYmxlRXhwcmVzc2lvbiIsImVuYWJsZWRFeHByZXNzaW9uIiwiY29sbGFib3JhdGlvbkVuYWJsZWQiLCJjb2xsYWJvcmF0aW9uSGFzQWN0aXZpdHlFeHByZXNzaW9uIiwiY29sbGFib3JhdGlvbkluaXRpYWxzRXhwcmVzc2lvbiIsImNvbGxhYm9yYXRpb25Db2xvckV4cHJlc3Npb24iLCJzZW1hbnRpY09iamVjdCIsImhhc1NlbWFudGljT2JqZWN0T25OYXZpZ2F0aW9uIiwibGlua1VybCIsImZvcm1hdE9wdGlvbnMiLCJpc0N1cnJlbmN5QWxpZ25lZCIsImNvbnRhaW5zRXJyb3JWaXNpYmlsaXR5IiwidGV4dEFsaWduTW9kZSIsImFsbG93ZWRWYWx1ZXMiLCJkaXNwbGF5TW9kZSIsImZpZWxkTW9kZSIsIm1lYXN1cmVEaXNwbGF5TW9kZSIsInRleHRMaW5lc0VkaXQiLCJjb25maWd1cmFibGUiLCJ0ZXh0TWF4TGluZXMiLCJ0ZXh0TWF4Q2hhcmFjdGVyc0Rpc3BsYXkiLCJ0ZXh0RXhwYW5kQmVoYXZpb3JEaXNwbGF5Iiwic2hvd0VtcHR5SW5kaWNhdG9yIiwic2VtYW50aWNLZXlTdHlsZSIsImhhc0RyYWZ0SW5kaWNhdG9yIiwic2hvd0ljb25VcmwiLCJpZ25vcmVOYXZpZ2F0aW9uQXZhaWxhYmxlIiwiaXNBbmFseXRpY3MiLCJyZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0IiwiY29tcGFjdFNlbWFudGljS2V5IiwiZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoIiwiZmllbGRHcm91cE5hbWUiLCJldmVudHMiLCJvbkNoYW5nZSIsImdldE92ZXJyaWRlcyIsIm1Db250cm9sQ29uZmlndXJhdGlvbiIsInNJRCIsIm9Qcm9wcyIsIm9Db250cm9sQ29uZmlnIiwiT2JqZWN0Iiwia2V5cyIsImZvckVhY2giLCJzQ29uZmlnS2V5Iiwic2V0VXBEYXRhUG9pbnRUeXBlIiwib0RhdGFGaWVsZCIsInRlcm0iLCJzZXRVcFZpc2libGVQcm9wZXJ0aWVzIiwib0ZpZWxkUHJvcHMiLCJvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoIiwidmlzaWJsZSIsIkZpZWxkVGVtcGxhdGluZyIsImdldFZpc2libGVFeHByZXNzaW9uIiwiZGlzcGxheVZpc2libGUiLCJ1bmRlZmluZWQiLCJzZXRVcFBhcmVudEVudGl0eVNldCIsIm1TZXR0aW5ncyIsImNvbnRleHRMb2NhdGlvbiIsIm1vZGVscyIsIm1ldGFNb2RlbCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0Iiwic3RhcnRpbmdFbnRpdHlTZXQiLCJjcmVhdGUiLCJvQ29udHJvbENvbmZpZ3VyYXRpb24iLCJvRGF0YUZpZWxkQ29udmVydGVkIiwiTWV0YU1vZGVsQ29udmVydGVyIiwiY29udmVydE1ldGFNb2RlbENvbnRleHQiLCJvRGF0YU1vZGVsUGF0aCIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsIl9mbGV4SWQiLCJnZXRDb250ZW50SWQiLCJfZ2V0VGFyZ2V0VmFsdWVEYXRhTW9kZWxQYXRoIiwic2V0VXBTZW1hbnRpY09iamVjdHMiLCJkYXRhU291cmNlUGF0aCIsImdldFRhcmdldE9iamVjdFBhdGgiLCJvTWV0YU1vZGVsIiwidGFyZ2V0RW50aXR5VHlwZSIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsInNldFVwRWRpdGFibGVQcm9wZXJ0aWVzIiwic2V0VXBGb3JtYXRPcHRpb25zIiwic2V0VXBEaXNwbGF5U3R5bGUiLCJzZXRVcEVkaXRTdHlsZSIsImFEaXNwbGF5U3R5bGVzV2l0aG91dFByb3BUZXh0IiwiZGlzcGxheVN0eWxlIiwiaW5kZXhPZiIsInRhcmdldE9iamVjdCIsInRleHQiLCJnZXRUZXh0QmluZGluZyIsInNldFVwT2JqZWN0SWRlbnRpZmllclRpdGxlQW5kVGV4dCIsImdldE9iamVjdCIsIm9EYXRhUG9pbnQiLCJUZW1wbGF0ZU1vZGVsIiwiZ2V0TW9kZWwiLCJlbXB0eUluZGljYXRvck1vZGUiLCJnZXRPYmplY3RJZGVudGlmaWVyVGl0bGUiLCJmaWVsZEZvcm1hdE9wdGlvbnMiLCJwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uIiwicGF0aEluTW9kZWwiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwidGFyZ2V0RGlzcGxheU1vZGUiLCJvUHJvcGVydHlEZWZpbml0aW9uIiwiJHRhcmdldCIsIlVJRm9ybWF0dGVycyIsImZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24iLCJjb21tb25UZXh0IiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJUZXh0IiwicmVsYXRpdmVMb2NhdGlvbiIsImdldFJlbGF0aXZlUGF0aHMiLCJwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyIiwicHVzaCIsInRhcmdldEVudGl0eVNldCIsIkRyYWZ0Um9vdCIsIkRyYWZ0Tm9kZSIsIkVudGl0eSIsIkhhc0RyYWZ0IiwiSXNBY3RpdmUiLCJjb25zdGFudCIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsIlVJIiwiVGV4dEFycmFuZ2VtZW50IiwiU2VtYW50aWNPYmplY3QiLCJjb21waWxlRXhwcmVzc2lvbiIsImZvcm1hdFJlc3VsdCIsInZhbHVlRm9ybWF0dGVycyIsImZvcm1hdE9QVGl0bGUiLCJnZXRPYmplY3RJZGVudGlmaWVyVGV4dCIsIl9vUHJvcHMiLCJpZGVudGlmaWVyVGl0bGUiLCJpZGVudGlmaWVyVGV4dCIsImdldFRleHRXaXRoV2hpdGVTcGFjZSIsIl90eXBlIiwic0V4dHJhUGF0aCIsInRhcmdldFZhbHVlRGF0YU1vZGVsUGF0aCIsIlZhbHVlIiwicGF0aCIsIlRhcmdldCIsImxlbmd0aCIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwib1Byb3BlcnR5IiwiSXNJbWFnZVVSTCIsImhhc1F1aWNrVmlld0ZhY2V0cyIsImlzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMiLCJzZXRVcE5hdmlnYXRpb25BdmFpbGFibGUiLCJpc1NlbWFudGljS2V5IiwiaGFzU2l0dWF0aW9uc0luZGljYXRvciIsIlNpdHVhdGlvbnNJbmRpY2F0b3IiLCJnZXRTaXR1YXRpb25zTmF2aWdhdGlvblByb3BlcnR5IiwiQ3JpdGljYWxpdHkiLCJVcmwiLCJNZWFzdXJlcyIsIklTT0N1cnJlbmN5IiwiU3RyaW5nIiwidmFsdWVBc1N0cmluZ0JpbmRpbmdFeHByZXNzaW9uIiwiZ2V0VmFsdWVCaW5kaW5nIiwidW5pdEJpbmRpbmdFeHByZXNzaW9uIiwiZ2V0QmluZGluZ0ZvclVuaXRPckN1cnJlbmN5IiwiQ29tbXVuaWNhdGlvbiIsIklzRW1haWxBZGRyZXNzIiwiSXNQaG9uZU51bWJlciIsIk11bHRpTGluZVRleHQiLCJfb1Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnMiLCJfb1Byb3BlcnR5TmF2aWdhdGlvblByb3BlcnR5QW5ub3RhdGlvbnMiLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsImtleSIsInNldEVkaXRTdHlsZVByb3BlcnRpZXMiLCJvUHJvcGVydHlGb3JGaWVsZENvbnRyb2wiLCJlZGl0TW9kZUFzT2JqZWN0IiwiYk1lYXN1cmVSZWFkT25seSIsImdldEVkaXRNb2RlIiwiZ2V0RWRpdGFibGVFeHByZXNzaW9uQXNPYmplY3QiLCJhUmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyIsIkNvbW1vblV0aWxzIiwiZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9ucyIsImdldFBhdGgiLCJyZXBsYWNlQWxsIiwiYVJlcXVpcmVkUHJvcGVydGllc0Zyb21VcGRhdGVSZXN0cmljdGlvbnMiLCJnZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zIiwib1JlcXVpcmVkUHJvcGVydGllcyIsInJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMiLCJyZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zIiwiTW9kZWxIZWxwZXIiLCJpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZCIsImNvbGxhYm9yYXRpb25FeHByZXNzaW9uIiwiZ2V0Q29sbGFib3JhdGlvbkV4cHJlc3Npb24iLCJDb2xsYWJvcmF0aW9uRm9ybWF0dGVycyIsImhhc0NvbGxhYm9yYXRpb25BY3Rpdml0eSIsImdldENvbGxhYm9yYXRpb25BY3Rpdml0eUluaXRpYWxzIiwiZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5Q29sb3IiLCJhbmQiLCJub3QiLCJpZkVsc2UiLCJnZXRFbmFibGVkRXhwcmVzc2lvbiIsInJlcXVpcmVkRXhwcmVzc2lvbiIsImdldFJlcXVpcmVkRXhwcmVzc2lvbiIsIm9PdmVycmlkZVByb3BzIiwiZ2V0RGlzcGxheU1vZGUiLCJ2aWV3RGF0YSIsImdldFByb3BlcnR5IiwiaXNSZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0RW5hYmxlZCIsImhhc0VudGl0eVRleHRBcnJhbmdlbWVudCIsImdlbmVyYXRlIiwiYVNlbU9iakV4cHJUb1Jlc29sdmUiLCJnZXRTZW1hbnRpY09iamVjdEV4cHJlc3Npb25Ub1Jlc29sdmUiLCJzdWJzdHIiLCJ2YWx1ZSIsImdldFNlbWFudGljT2JqZWN0cyIsIm5hdlByb3BlcnR5IiwibmF2aWdhdGlvbkF2YWlsYWJsZSIsIk5hdmlnYXRpb25BdmFpbGFibGUiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkZpZWxkLm1ldGFkYXRhLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgRW50aXR5U2V0LCBQcm9wZXJ0eSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHsgU2VtYW50aWNPYmplY3QgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHsgVUlBbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBFbnRpdHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCAqIGFzIE1ldGFNb2RlbENvbnZlcnRlciBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCAqIGFzIENvbGxhYm9yYXRpb25Gb3JtYXR0ZXJzIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL0NvbGxhYm9yYXRpb25Gb3JtYXR0ZXJcIjtcbmltcG9ydCB2YWx1ZUZvcm1hdHRlcnMgZnJvbSBcInNhcC9mZS9jb3JlL2Zvcm1hdHRlcnMvVmFsdWVGb3JtYXR0ZXJcIjtcbmltcG9ydCB7XG5cdGFuZCxcblx0QmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbixcblx0Y29tcGlsZUV4cHJlc3Npb24sXG5cdGNvbnN0YW50LFxuXHRmb3JtYXRSZXN1bHQsXG5cdGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbixcblx0aWZFbHNlLFxuXHRub3QsXG5cdHBhdGhJbk1vZGVsXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB7IGdlbmVyYXRlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvU3RhYmxlSWRIZWxwZXJcIjtcbmltcG9ydCBUZW1wbGF0ZU1vZGVsIGZyb20gXCJzYXAvZmUvY29yZS9UZW1wbGF0ZU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQge1xuXHRlbmhhbmNlRGF0YU1vZGVsUGF0aCxcblx0Z2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCxcblx0Z2V0UmVsYXRpdmVQYXRocyxcblx0Z2V0VGFyZ2V0T2JqZWN0UGF0aFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBpc1NlbWFudGljS2V5IH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvUHJvcGVydHlIZWxwZXJcIjtcbmltcG9ydCB0eXBlIHsgRGlzcGxheU1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCAqIGFzIFVJRm9ybWF0dGVycyBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCAqIGFzIEZpZWxkVGVtcGxhdGluZyBmcm9tIFwic2FwL2ZlL21hY3Jvcy9maWVsZC9GaWVsZFRlbXBsYXRpbmdcIjtcbmltcG9ydCBNYWNyb01ldGFkYXRhIGZyb20gXCJzYXAvZmUvbWFjcm9zL01hY3JvTWV0YWRhdGFcIjtcbmltcG9ydCBTaXR1YXRpb25zSW5kaWNhdG9yIGZyb20gXCJzYXAvZmUvbWFjcm9zL3NpdHVhdGlvbnMvU2l0dWF0aW9uc0luZGljYXRvci5mcmFnbWVudFwiO1xuXG50eXBlIERpc3BsYXlTdHlsZSA9XG5cdHwgXCJUZXh0XCJcblx0fCBcIkF2YXRhclwiXG5cdHwgXCJGaWxlXCJcblx0fCBcIkRhdGFQb2ludFwiXG5cdHwgXCJDb250YWN0XCJcblx0fCBcIkJ1dHRvblwiXG5cdHwgXCJMaW5rXCJcblx0fCBcIk9iamVjdFN0YXR1c1wiXG5cdHwgXCJBbW91bnRXaXRoQ3VycmVuY3lcIlxuXHR8IFwiU2VtYW50aWNLZXlXaXRoRHJhZnRJbmRpY2F0b3JcIlxuXHR8IFwiT2JqZWN0SWRlbnRpZmllclwiXG5cdHwgXCJMYWJlbFNlbWFudGljS2V5XCJcblx0fCBcIkxpbmtXaXRoUXVpY2tWaWV3Rm9ybVwiXG5cdHwgXCJMaW5rV3JhcHBlclwiXG5cdHwgXCJFeHBhbmRhYmxlVGV4dFwiO1xuXG50eXBlIEVkaXRTdHlsZSA9XG5cdHwgXCJJbnB1dFdpdGhWYWx1ZUhlbHBcIlxuXHR8IFwiVGV4dEFyZWFcIlxuXHR8IFwiRmlsZVwiXG5cdHwgXCJEYXRlUGlja2VyXCJcblx0fCBcIlRpbWVQaWNrZXJcIlxuXHR8IFwiRGF0ZVRpbWVQaWNrZXJcIlxuXHR8IFwiQ2hlY2tCb3hcIlxuXHR8IFwiSW5wdXRXaXRoVW5pdFwiXG5cdHwgXCJJbnB1dFwiXG5cdHwgXCJSYXRpbmdJbmRpY2F0b3JcIjtcblxudHlwZSBGaWVsZEZvcm1hdE9wdGlvbnMgPSBQYXJ0aWFsPHtcblx0Y29udGFpbnNFcnJvclZpc2liaWxpdHk6IHN0cmluZztcblx0ZGlzcGxheU1vZGU6IERpc3BsYXlNb2RlO1xuXHRmaWVsZE1vZGU6IHN0cmluZztcblx0aGFzRHJhZnRJbmRpY2F0b3I6IGJvb2xlYW47XG5cdGlzQW5hbHl0aWNzOiBib29sZWFuO1xuXHRpZ25vcmVOYXZpZ2F0aW9uQXZhaWxhYmxlOiBib29sZWFuO1xuXHRpc0N1cnJlbmN5QWxpZ25lZDogYm9vbGVhbjtcblx0bWVhc3VyZURpc3BsYXlNb2RlOiBzdHJpbmc7XG5cdHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Q6IGJvb2xlYW47XG5cdHNlbWFudGlja2V5czogc3RyaW5nW107XG5cdHNlbWFudGljS2V5U3R5bGU6IHN0cmluZztcblx0c2hvd0VtcHR5SW5kaWNhdG9yOiBib29sZWFuO1xuXHRzaG93SWNvblVybDogYm9vbGVhbjtcblx0dGV4dEFsaWduTW9kZTogc3RyaW5nO1xuXHR0ZXh0TGluZXNFZGl0OiBzdHJpbmc7XG5cdHRleHRNYXhMaW5lczogc3RyaW5nO1xuXHRjb21wYWN0U2VtYW50aWNLZXk6IHN0cmluZztcblx0ZmllbGRHcm91cERyYWZ0SW5kaWNhdG9yUHJvcGVydHlQYXRoOiBzdHJpbmc7XG5cdGZpZWxkR3JvdXBOYW1lOiBzdHJpbmc7XG59PjtcblxuZXhwb3J0IHR5cGUgRmllbGRQcm9wZXJ0aWVzID0ge1xuXHRkYXRhRmllbGQ6IGFueTtcblx0ZWRpdE1vZGU/OiBhbnk7XG5cdGVudGl0eVNldDogYW55O1xuXHRlbnRpdHlUeXBlPzogYW55O1xuXHRwYXJlbnRFbnRpdHlTZXQ/OiBhbnk7XG5cdGZvcm1hdE9wdGlvbnM6IEZpZWxkRm9ybWF0T3B0aW9ucztcblx0aWRQcmVmaXg/OiBzdHJpbmc7XG5cdHNlbWFudGljT2JqZWN0Pzogc3RyaW5nIHwgU2VtYW50aWNPYmplY3Q7XG5cdHZoSWRQcmVmaXg/OiBzdHJpbmc7XG5cdF9hcGlJZD86IHN0cmluZztcblxuXHQvLyBjb21wdXRlZCBwcm9wZXJ0aWVzXG5cdGhhc1NpdHVhdGlvbnNJbmRpY2F0b3I6IGJvb2xlYW47XG5cdGNvbGxhYm9yYXRpb25Db2xvckV4cHJlc3Npb24/OiBzdHJpbmc7XG5cdGNvbGxhYm9yYXRpb25FbmFibGVkPzogYm9vbGVhbjtcblx0Y29sbGFib3JhdGlvbkhhc0FjdGl2aXR5RXhwcmVzc2lvbj86IHN0cmluZztcblx0Y29sbGFib3JhdGlvbkluaXRpYWxzRXhwcmVzc2lvbj86IHN0cmluZztcblx0ZGF0YVNvdXJjZVBhdGg/OiBzdHJpbmc7XG5cdGRlc2NyaXB0aW9uQmluZGluZ0V4cHJlc3Npb24/OiBzdHJpbmc7XG5cdGRpc3BsYXlTdHlsZTogRGlzcGxheVN0eWxlO1xuXHRkaXNwbGF5VmlzaWJsZT86IHN0cmluZztcblx0ZWRpdGFibGVFeHByZXNzaW9uPzogc3RyaW5nO1xuXHRlZGl0TW9kZUFzT2JqZWN0PzogYW55O1xuXHRlZGl0U3R5bGU/OiBFZGl0U3R5bGUgfCBudWxsO1xuXHRlbmFibGVkRXhwcmVzc2lvbj86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRlbXB0eUluZGljYXRvck1vZGU/OiBcIk9uXCI7XG5cdGZpZWxkV3JhcHBlcklkPzogc3RyaW5nO1xuXHRoYXNRdWlja1ZpZXdGYWNldHM/OiBib29sZWFuO1xuXHRub1dyYXBwZXJJZD86IHN0cmluZztcblx0bmF2aWdhdGlvbkF2YWlsYWJsZT86IGJvb2xlYW4gfCBzdHJpbmc7XG5cdHJlcXVpcmVkRXhwcmVzc2lvbj86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRzaG93VGltZXpvbmU/OiBib29sZWFuO1xuXHRzZW1hbnRpY09iamVjdHM/OiBzdHJpbmc7XG5cdHRleHQ/OiBzdHJpbmcgfCBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRpZGVudGlmaWVyVGl0bGU/OiBzdHJpbmcgfCBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRpZGVudGlmaWVyVGV4dD86IHN0cmluZyB8IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdHRleHRCaW5kaW5nRXhwcmVzc2lvbj86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHR1bml0QmluZGluZ0V4cHJlc3Npb24/OiBzdHJpbmc7XG5cdHVuaXRFZGl0YWJsZT86IHN0cmluZztcblx0dmFsdWVCaW5kaW5nRXhwcmVzc2lvbj86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHR2YWx1ZUFzU3RyaW5nQmluZGluZ0V4cHJlc3Npb24/OiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0X2ZsZXhJZD86IHN0cmluZztcblx0X3ZoRmxleElkPzogc3RyaW5nO1xuXHR2aXNpYmxlPzogc3RyaW5nO1xuXHRoYXNTZW1hbnRpY09iamVjdE9uTmF2aWdhdGlvbj86IGJvb2xlYW47XG5cdGxpbmtVcmw6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xufTtcblxudHlwZSBGaWVsZFR5cGUgPSB7XG5cdG9Qcm9wczogRmllbGRQcm9wZXJ0aWVzO1xuXHRnZXRDb250ZW50SWQ6IChzSUQ6IHN0cmluZykgPT4gc3RyaW5nO1xuXHRzZXRVcERpc3BsYXlTdHlsZTogKG9Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvRGF0YUZpZWxkOiBhbnksIG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSA9PiB2b2lkO1xuXHRzZXRVcEVkaXRTdHlsZTogKG9Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvRGF0YUZpZWxkOiBhbnksIG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSA9PiB2b2lkO1xuXHRnZXRPdmVycmlkZXM6IChtQ29udHJvbENvbmZpZ3VyYXRpb246IGFueSwgc0lEOiBzdHJpbmcpID0+IHsgW2luZGV4OiBzdHJpbmddOiBhbnkgfTtcblx0c2V0VXBFZGl0YWJsZVByb3BlcnRpZXM6IChvUHJvcHM6IEZpZWxkUHJvcGVydGllcywgb0RhdGFGaWVsZDogYW55LCBvRGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCwgb01ldGFNb2RlbDogYW55KSA9PiB2b2lkO1xuXHRzZXRVcEZvcm1hdE9wdGlvbnM6IChvUHJvcHM6IEZpZWxkUHJvcGVydGllcywgb0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsIG9Db250cm9sQ29uZmlndXJhdGlvbjogYW55LCBtU2V0dGluZ3M6IGFueSkgPT4gdm9pZDtcblx0c2V0VXBTZW1hbnRpY09iamVjdHM6IChvUHJvcHM6IEZpZWxkUHJvcGVydGllcywgb0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpID0+IHZvaWQ7XG5cdHNldFVwTmF2aWdhdGlvbkF2YWlsYWJsZTogKG9Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvRGF0YUZpZWxkOiBhbnkpID0+IHZvaWQ7XG5cdHNldFVwRGF0YVBvaW50VHlwZTogKG9EYXRhRmllbGQ6IGFueSkgPT4gdm9pZDtcblx0X2dldFRhcmdldFZhbHVlRGF0YU1vZGVsUGF0aDogKG9EYXRhRmllbGQ6IGFueSwgb0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpID0+IERhdGFNb2RlbE9iamVjdFBhdGg7XG5cdGdldFRleHRXaXRoV2hpdGVTcGFjZTogKGZvcm1hdE9wdGlvbnM6IEZpZWxkRm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpID0+IHN0cmluZztcblx0Z2V0T2JqZWN0SWRlbnRpZmllclRpdGxlOiAoXG5cdFx0ZmllbGRGb3JtYXRPcHRpb25zOiBGaWVsZEZvcm1hdE9wdGlvbnMsXG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuXHQpID0+IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGdldE9iamVjdElkZW50aWZpZXJUZXh0OiAoXG5cdFx0ZmllbGRGb3JtYXRPcHRpb25zOiBGaWVsZEZvcm1hdE9wdGlvbnMsXG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuXHQpID0+IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+IHwgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdHNldFVwVmlzaWJsZVByb3BlcnRpZXMob1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsIG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogdm9pZDtcblx0c2V0VXBQYXJlbnRFbnRpdHlTZXQob1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsIG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLCBtU2V0dGluZ3M6IGFueSk6IHZvaWQ7XG5cdHNldFVwT2JqZWN0SWRlbnRpZmllclRpdGxlQW5kVGV4dChvUHJvcHM6IEZpZWxkUHJvcGVydGllcywgb0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiB2b2lkO1xufTtcblxuLyoqXG4gKiBAY2xhc3NkZXNjXG4gKiBCdWlsZGluZyBibG9jayBmb3IgY3JlYXRpbmcgYSBGaWVsZCBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKiA8YnI+XG4gKiBVc3VhbGx5LCBhIERhdGFGaWVsZCBhbm5vdGF0aW9uIGlzIGV4cGVjdGVkXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiA8aW50ZXJuYWxNYWNybzpGaWVsZFxuICogICBpZFByZWZpeD1cIlNvbWVQcmVmaXhcIlxuICogICBjb250ZXh0UGF0aD1cIntlbnRpdHlTZXQ+fVwiXG4gKiAgIG1ldGFQYXRoPVwie2RhdGFGaWVsZD59XCJcbiAqIC8+XG4gKiA8L3ByZT5cbiAqIEBjbGFzcyBzYXAuZmUubWFjcm9zLmludGVybmFsLkZpZWxkXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICogQHNpbmNlIDEuOTQuMFxuICovXG5jb25zdCBGaWVsZCA9IE1hY3JvTWV0YWRhdGEuZXh0ZW5kKFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC5GaWVsZFwiLCB7XG5cdC8qKlxuXHQgKiBOYW1lIG9mIHRoZSBtYWNybyBjb250cm9sLlxuXHQgKi9cblx0bmFtZTogXCJGaWVsZFwiLFxuXHQvKipcblx0ICogTmFtZXNwYWNlIG9mIHRoZSBtYWNybyBjb250cm9sXG5cdCAqL1xuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHQvKipcblx0ICogRnJhZ21lbnQgc291cmNlIG9mIHRoZSBtYWNybyAob3B0aW9uYWwpIC0gaWYgbm90IHNldCwgZnJhZ21lbnQgaXMgZ2VuZXJhdGVkIGZyb20gbmFtZXNwYWNlIGFuZCBuYW1lXG5cdCAqL1xuXHRmcmFnbWVudDogXCJzYXAuZmUubWFjcm9zLmludGVybmFsLkZpZWxkXCIsXG5cblx0LyoqXG5cdCAqIFRoZSBtZXRhZGF0YSBkZXNjcmliaW5nIHRoZSBtYWNybyBjb250cm9sLlxuXHQgKi9cblx0bWV0YWRhdGE6IHtcblx0XHQvKipcblx0XHQgKiBEZWZpbmUgbWFjcm8gc3RlcmVvdHlwZSBmb3IgZG9jdW1lbnRhdGlvblxuXHRcdCAqL1xuXHRcdHN0ZXJlb3R5cGU6IFwieG1sbWFjcm9cIixcblx0XHQvKipcblx0XHQgKiBMb2NhdGlvbiBvZiB0aGUgZGVzaWdudGltZSBpbmZvXG5cdFx0ICovXG5cdFx0ZGVzaWdudGltZTogXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL0ZpZWxkLmRlc2lnbnRpbWVcIixcblx0XHQvKipcblx0XHQgKiBQcm9wZXJ0aWVzLlxuXHRcdCAqL1xuXHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdC8qKlxuXHRcdFx0ICogUHJlZml4IGFkZGVkIHRvIHRoZSBnZW5lcmF0ZWQgSUQgb2YgdGhlIGZpZWxkXG5cdFx0XHQgKi9cblx0XHRcdGlkUHJlZml4OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHRfYXBpSWQ6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdG5vV3JhcHBlcklkOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFByZWZpeCBhZGRlZCB0byB0aGUgZ2VuZXJhdGVkIElEIG9mIHRoZSB2YWx1ZSBoZWxwIHVzZWQgZm9yIHRoZSBmaWVsZFxuXHRcdFx0ICovXG5cdFx0XHR2aElkUHJlZml4OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogXCJGaWVsZFZhbHVlSGVscFwiXG5cdFx0XHR9LFxuXG5cdFx0XHRfdmhGbGV4SWQ6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0Y29tcHV0ZWQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIGVudGl0eSBzZXRcblx0XHRcdCAqL1xuXHRcdFx0ZW50aXR5U2V0OiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRcdFx0cmVxdWlyZWQ6IHRydWUsXG5cdFx0XHRcdCRraW5kOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCJdXG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIE1ldGFkYXRhIHBhdGggdG8gdGhlIGVudGl0eSBzZXRcblx0XHRcdCAqL1xuXHRcdFx0ZW50aXR5VHlwZToge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdHJlcXVpcmVkOiBmYWxzZSxcblx0XHRcdFx0Y29tcHV0ZWQ6IHRydWUsXG5cdFx0XHRcdCRraW5kOiBbXCJFbnRpdHlUeXBlXCJdXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBQYXJlbnQgZW50aXR5IHNldFxuXHRcdFx0ICovXG5cdFx0XHRwYXJlbnRFbnRpdHlTZXQ6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdFx0XHRyZXF1aXJlZDogZmFsc2UsXG5cdFx0XHRcdCRraW5kOiBbXCJFbnRpdHlTZXRcIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCJdXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBGbGFnIGluZGljYXRpbmcgd2hldGhlciBhY3Rpb24gd2lsbCBuYXZpZ2F0ZSBhZnRlciBleGVjdXRpb25cblx0XHRcdCAqL1xuXHRcdFx0bmF2aWdhdGVBZnRlckFjdGlvbjoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBNZXRhZGF0YSBwYXRoIHRvIHRoZSBkYXRhRmllbGQuXG5cdFx0XHQgKiBUaGlzIHByb3BlcnR5IGlzIHVzdWFsbHkgYSBtZXRhZGF0YUNvbnRleHQgcG9pbnRpbmcgdG8gYSBEYXRhRmllbGQgaGF2aW5nXG5cdFx0XHQgKiAkVHlwZSBvZiBEYXRhRmllbGQsIERhdGFGaWVsZFdpdGhVcmwsIERhdGFGaWVsZEZvckFubm90YXRpb24sIERhdGFGaWVsZEZvckFjdGlvbiwgRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uLCBEYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGgsIG9yIERhdGFQb2ludFR5cGUuXG5cdFx0XHQgKiBCdXQgaXQgY2FuIGFsc28gYmUgYSBQcm9wZXJ0eSB3aXRoICRraW5kPVwiUHJvcGVydHlcIlxuXHRcdFx0ICovXG5cdFx0XHRkYXRhRmllbGQ6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRcdFx0JGtpbmQ6IFtcIlByb3BlcnR5XCJdLFxuXHRcdFx0XHQkVHlwZTogW1xuXHRcdFx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCIsXG5cdFx0XHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRXaXRoVXJsXCIsXG5cdFx0XHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCIsXG5cdFx0XHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIixcblx0XHRcdFx0XHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiLFxuXHRcdFx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEFjdGlvblwiLFxuXHRcdFx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvblwiLFxuXHRcdFx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkV2l0aE5hdmlnYXRpb25QYXRoXCIsXG5cdFx0XHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRUeXBlXCJcblx0XHRcdFx0XVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogQ29udGV4dCBwb2ludGluZyB0byBhbiBhcnJheSBvZiB0aGUgcHJvcGVydHkncyBzZW1hbnRpYyBvYmplY3RzXG5cdFx0XHQgKi9cblx0XHRcdHNlbWFudGljT2JqZWN0czoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tb2RlbC5Db250ZXh0XCIsXG5cdFx0XHRcdHJlcXVpcmVkOiBmYWxzZSxcblx0XHRcdFx0Y29tcHV0ZWQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEVkaXQgTW9kZSBvZiB0aGUgZmllbGQuXG5cdFx0XHQgKlxuXHRcdFx0ICogSWYgdGhlIGVkaXRNb2RlIGlzIHVuZGVmaW5lZCB0aGVuIHdlIGNvbXB1dGUgaXQgYmFzZWQgb24gdGhlIG1ldGFkYXRhXG5cdFx0XHQgKiBPdGhlcndpc2Ugd2UgdXNlIHRoZSB2YWx1ZSBwcm92aWRlZCBoZXJlLlxuXHRcdFx0ICovXG5cdFx0XHRlZGl0TW9kZToge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5tZGMuZW51bS5FZGl0TW9kZVwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBXcmFwIGZpZWxkXG5cdFx0XHQgKi9cblx0XHRcdHdyYXA6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIENTUyBjbGFzcyBmb3IgbWFyZ2luXG5cdFx0XHQgKi9cblx0XHRcdFwiY2xhc3NcIjoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBQcm9wZXJ0eSBhZGRlZCB0byBhc3NvY2lhdGUgdGhlIGxhYmVsIHdpdGggdGhlIEZpZWxkXG5cdFx0XHQgKi9cblx0XHRcdGFyaWFMYWJlbGxlZEJ5OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cblx0XHRcdHRleHRBbGlnbjoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC51aS5jb3JlLlRleHRBbGlnblwiXG5cdFx0XHR9LFxuXHRcdFx0ZWRpdGFibGVFeHByZXNzaW9uOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGNvbXB1dGVkOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0ZW5hYmxlZEV4cHJlc3Npb246IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0Y29tcHV0ZWQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRjb2xsYWJvcmF0aW9uRW5hYmxlZDoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0Y29tcHV0ZWQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHRjb2xsYWJvcmF0aW9uSGFzQWN0aXZpdHlFeHByZXNzaW9uOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGNvbXB1dGVkOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0Y29sbGFib3JhdGlvbkluaXRpYWxzRXhwcmVzc2lvbjoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRjb21wdXRlZDogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdGNvbGxhYm9yYXRpb25Db2xvckV4cHJlc3Npb246IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0Y29tcHV0ZWQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIE9wdGlvbiB0byBhZGQgYSBzZW1hbnRpYyBvYmplY3QgdG8gYSBmaWVsZFxuXHRcdFx0ICovXG5cdFx0XHRzZW1hbnRpY09iamVjdDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRyZXF1aXJlZDogZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHRoYXNTZW1hbnRpY09iamVjdE9uTmF2aWdhdGlvbjoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0cmVxdWlyZWQ6IGZhbHNlXG5cdFx0XHR9LFxuXHRcdFx0bGlua1VybDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRyZXF1aXJlZDogZmFsc2Vcblx0XHRcdH0sXG5cdFx0XHRmb3JtYXRPcHRpb25zOiB7XG5cdFx0XHRcdHR5cGU6IFwib2JqZWN0XCIsXG5cdFx0XHRcdHByb3BlcnRpZXM6IHtcblx0XHRcdFx0XHRpc0N1cnJlbmN5QWxpZ25lZDoge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiBleHByZXNzaW9uIGZvciBPYmplY3RTdGF0dXMgdmlzaWJsZSBwcm9wZXJ0eVxuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdGNvbnRhaW5zRXJyb3JWaXNpYmlsaXR5OiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiBEZXNjcmliZSBob3cgdGhlIGFsaWdubWVudCB3b3JrcyBiZXR3ZWVuIFRhYmxlIG1vZGUgKERhdGUgYW5kIE51bWVyaWMgRW5kIGFsaWdubWVudCkgYW5kIEZvcm0gbW9kZSAobnVtZXJpYyBhbGlnbmVkIEVuZCBpbiBlZGl0IGFuZCBCZWdpbiBpbiBkaXNwbGF5KVxuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdHRleHRBbGlnbk1vZGU6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IFwiVGFibGVcIixcblx0XHRcdFx0XHRcdGFsbG93ZWRWYWx1ZXM6IFtcIlRhYmxlXCIsIFwiRm9ybVwiXVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZGlzcGxheU1vZGU6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdFx0XHRhbGxvd2VkVmFsdWVzOiBbXCJWYWx1ZVwiLCBcIkRlc2NyaXB0aW9uXCIsIFwiVmFsdWVEZXNjcmlwdGlvblwiLCBcIkRlc2NyaXB0aW9uVmFsdWVcIl1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGZpZWxkTW9kZToge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0XHRcdGFsbG93ZWRWYWx1ZXM6IFtcIm5vd3JhcHBlclwiLCBcIlwiXVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0bWVhc3VyZURpc3BsYXlNb2RlOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRcdFx0YWxsb3dlZFZhbHVlczogW1wiSGlkZGVuXCIsIFwiUmVhZE9ubHlcIl1cblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIE1heGltdW0gbnVtYmVyIG9mIGxpbmVzIGZvciBtdWx0aWxpbmUgdGV4dHMgaW4gZWRpdCBtb2RlXG5cdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0dGV4dExpbmVzRWRpdDoge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJudW1iZXJcIixcblx0XHRcdFx0XHRcdGNvbmZpZ3VyYWJsZTogdHJ1ZVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0ICogTWF4aW11bSBudW1iZXIgb2YgbGluZXMgdGhhdCBtdWx0aWxpbmUgdGV4dHMgaW4gZWRpdCBtb2RlIGNhbiBncm93IHRvXG5cdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0dGV4dE1heExpbmVzOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcIm51bWJlclwiLFxuXHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiBNYXhpbXVtIG51bWJlciBvZiBjaGFyYWN0ZXJzIGZyb20gdGhlIGJlZ2lubmluZyBvZiB0aGUgdGV4dCBmaWVsZCB0aGF0IGFyZSBzaG93biBpbml0aWFsbHkuXG5cdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0dGV4dE1heENoYXJhY3RlcnNEaXNwbGF5OiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcIm51bWJlclwiLFxuXHRcdFx0XHRcdFx0Y29uZmlndXJhYmxlOiB0cnVlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiBEZWZpbmVzIGhvdyB0aGUgZnVsbCB0ZXh0IHdpbGwgYmUgZGlzcGxheWVkIC0gSW5QbGFjZSBvciBQb3BvdmVyXG5cdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0dGV4dEV4cGFuZEJlaGF2aW9yRGlzcGxheToge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0XHRcdGFsbG93ZWRWYWx1ZXM6IFtcIkluUGxhY2VcIiwgXCJQb3BvdmVyXCJdXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiBJZiBzZXQgdG8gJ3RydWUnLCBTQVAgRmlvcmkgZWxlbWVudHMgc2hvd3MgYW4gZW1wdHkgaW5kaWNhdG9yIGluIGRpc3BsYXkgbW9kZSBmb3IgdGhlIHRleHQgYW5kIGxpbmtzXG5cdFx0XHRcdFx0ICovXG5cdFx0XHRcdFx0c2hvd0VtcHR5SW5kaWNhdG9yOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdC8qKlxuXHRcdFx0XHRcdCAqIFByZWZlcnJlZCBjb250cm9sIGlmIGEgc2VtYW50aWNLZXkgaXMgdXNlZCAoaWYgdGhlIHNlbWFudGljS2V5IGlzIGVtcHR5LCBubyBzcGVjaWZpYyBydWxlcyBhcHBseSlcblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRzZW1hbnRpY0tleVN0eWxlOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBcIlwiLFxuXHRcdFx0XHRcdFx0YWxsb3dlZFZhbHVlczogW1wiT2JqZWN0SWRlbnRpZmllclwiLCBcIkxhYmVsXCIsIFwiXCJdXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRoYXNEcmFmdEluZGljYXRvcjoge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiBJZiB0cnVlIHRoZW4gc2V0cyB0aGUgZ2l2ZW4gaWNvbiBpbnN0ZWFkIG9mIHRleHQgaW4gQWN0aW9uL0lCTiBCdXR0b25cblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRzaG93SWNvblVybDoge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdFx0XHRkZWZhdWx0VmFsdWU6IGZhbHNlXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHQgKiBJZiB0cnVlIHRoZW4gbmF2aWdhdGlvbmF2YWlsYWJsZSBwcm9wZXJ0eSB3aWxsIG5vdCBiZSB1c2VkIGZvciBlbmFibGVtZW50IG9mIElCTiBidXR0b25cblx0XHRcdFx0XHQgKi9cblx0XHRcdFx0XHRpZ25vcmVOYXZpZ2F0aW9uQXZhaWxhYmxlOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGlzQW5hbHl0aWNzOiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0XHRcdFx0XHR9LFxuXG5cdFx0XHRcdFx0LyoqXG5cdFx0XHRcdFx0ICogRW5hYmxlcyB0aGUgZmFsbGJhY2sgZmVhdHVyZSBmb3IgdXNhZ2UgdGhlIHRleHQgYW5ub3RhdGlvbiBmcm9tIHRoZSB2YWx1ZSBsaXN0c1xuXHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdHJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3Q6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBmYWxzZVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0Y29tcGFjdFNlbWFudGljS2V5OiB7XG5cdFx0XHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0XHRcdGRlZmF1bHRWYWx1ZTogZmFsc2Vcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGZpZWxkR3JvdXBEcmFmdEluZGljYXRvclByb3BlcnR5UGF0aDoge1xuXHRcdFx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0ZmllbGRHcm91cE5hbWU6IHtcblx0XHRcdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9LFxuXG5cdFx0ZXZlbnRzOiB7XG5cdFx0XHQvKipcblx0XHRcdCAqIEV2ZW50IGhhbmRsZXIgZm9yIGNoYW5nZSBldmVudFxuXHRcdFx0ICovXG5cdFx0XHRvbkNoYW5nZToge1xuXHRcdFx0XHR0eXBlOiBcImZ1bmN0aW9uXCJcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdGdldE92ZXJyaWRlczogZnVuY3Rpb24gKG1Db250cm9sQ29uZmlndXJhdGlvbjogYW55LCBzSUQ6IHN0cmluZykge1xuXHRcdGNvbnN0IG9Qcm9wczogeyBbaW5kZXg6IHN0cmluZ106IGFueSB9ID0ge307XG5cdFx0aWYgKG1Db250cm9sQ29uZmlndXJhdGlvbikge1xuXHRcdFx0Y29uc3Qgb0NvbnRyb2xDb25maWcgPSBtQ29udHJvbENvbmZpZ3VyYXRpb25bc0lEXTtcblx0XHRcdGlmIChvQ29udHJvbENvbmZpZykge1xuXHRcdFx0XHRPYmplY3Qua2V5cyhvQ29udHJvbENvbmZpZykuZm9yRWFjaChmdW5jdGlvbiAoc0NvbmZpZ0tleSkge1xuXHRcdFx0XHRcdG9Qcm9wc1tzQ29uZmlnS2V5XSA9IG9Db250cm9sQ29uZmlnW3NDb25maWdLZXldO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9Qcm9wcztcblx0fSxcblx0c2V0VXBEYXRhUG9pbnRUeXBlOiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55KSB7XG5cdFx0Ly8gZGF0YSBwb2ludCBhbm5vdGF0aW9ucyBuZWVkIG5vdCBoYXZlICRUeXBlIGRlZmluZWQsIHNvIGFkZCBpdCBpZiBtaXNzaW5nXG5cdFx0aWYgKG9EYXRhRmllbGQ/LnRlcm0gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50XCIpIHtcblx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPSBvRGF0YUZpZWxkLiRUeXBlIHx8IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGU7XG5cdFx0fVxuXHR9LFxuXHRzZXRVcFZpc2libGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAob0ZpZWxkUHJvcHM6IEZpZWxkUHJvcGVydGllcywgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCkge1xuXHRcdC8vIHdlIGRvIHRoaXMgYmVmb3JlIGVuaGFuY2luZyB0aGUgZGF0YU1vZGVsUGF0aCBzbyB0aGF0IGl0IHN0aWxsIHBvaW50cyBhdCB0aGUgRGF0YUZpZWxkXG5cdFx0b0ZpZWxkUHJvcHMudmlzaWJsZSA9IEZpZWxkVGVtcGxhdGluZy5nZXRWaXNpYmxlRXhwcmVzc2lvbihvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLCBvRmllbGRQcm9wcy5mb3JtYXRPcHRpb25zKTtcblx0XHRvRmllbGRQcm9wcy5kaXNwbGF5VmlzaWJsZSA9IG9GaWVsZFByb3BzLmZvcm1hdE9wdGlvbnMuZmllbGRNb2RlID09PSBcIm5vd3JhcHBlclwiID8gb0ZpZWxkUHJvcHMudmlzaWJsZSA6IHVuZGVmaW5lZDtcblx0fSxcblx0c2V0VXBQYXJlbnRFbnRpdHlTZXQ6IGZ1bmN0aW9uIChvRmllbGRQcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdGlmIChvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoPy5jb250ZXh0TG9jYXRpb24gJiYgbVNldHRpbmdzPy5tb2RlbHM/Lm1ldGFNb2RlbCkge1xuXHRcdFx0b0ZpZWxkUHJvcHMucGFyZW50RW50aXR5U2V0ID0gbVNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXG5cdFx0XHRcdGAvJHtcblx0XHRcdFx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbi5zdGFydGluZ0VudGl0eVNldFxuXHRcdFx0XHRcdFx0PyBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLmNvbnRleHRMb2NhdGlvbi5zdGFydGluZ0VudGl0eVNldC5uYW1lXG5cdFx0XHRcdFx0XHQ6IG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQubmFtZVxuXHRcdFx0XHR9YFxuXHRcdFx0KTtcblx0XHR9XG5cdH0sXG5cdGNyZWF0ZTogZnVuY3Rpb24gKHRoaXM6IEZpZWxkVHlwZSwgb1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsIG9Db250cm9sQ29uZmlndXJhdGlvbjogYW55LCBtU2V0dGluZ3M6IGFueSkge1xuXHRcdGNvbnN0IG9EYXRhRmllbGRDb252ZXJ0ZWQgPSBNZXRhTW9kZWxDb252ZXJ0ZXIuY29udmVydE1ldGFNb2RlbENvbnRleHQob1Byb3BzLmRhdGFGaWVsZCk7XG5cdFx0bGV0IG9EYXRhTW9kZWxQYXRoID0gTWV0YU1vZGVsQ29udmVydGVyLmdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvUHJvcHMuZGF0YUZpZWxkLCBvUHJvcHMuZW50aXR5U2V0KTtcblx0XHR0aGlzLnNldFVwRGF0YVBvaW50VHlwZShvRGF0YUZpZWxkQ29udmVydGVkKTtcblx0XHR0aGlzLnNldFVwVmlzaWJsZVByb3BlcnRpZXMob1Byb3BzLCBvRGF0YU1vZGVsUGF0aCk7XG5cdFx0dGhpcy5zZXRVcFBhcmVudEVudGl0eVNldChvUHJvcHMsIG9EYXRhTW9kZWxQYXRoLCBtU2V0dGluZ3MpO1xuXG5cdFx0aWYgKG9Qcm9wcy5fZmxleElkKSB7XG5cdFx0XHRvUHJvcHMuX2FwaUlkID0gb1Byb3BzLl9mbGV4SWQ7XG5cdFx0XHRvUHJvcHMuX2ZsZXhJZCA9IHRoaXMuZ2V0Q29udGVudElkKG9Qcm9wcy5fZmxleElkKTtcblx0XHRcdG9Qcm9wcy5fdmhGbGV4SWQgPSBgJHtvUHJvcHMuX2ZsZXhJZH1fJHtvUHJvcHMudmhJZFByZWZpeH1gO1xuXHRcdH1cblxuXHRcdG9EYXRhTW9kZWxQYXRoID0gdGhpcy5fZ2V0VGFyZ2V0VmFsdWVEYXRhTW9kZWxQYXRoKG9EYXRhRmllbGRDb252ZXJ0ZWQsIG9EYXRhTW9kZWxQYXRoKTtcblx0XHR0aGlzLnNldFVwU2VtYW50aWNPYmplY3RzKG9Qcm9wcywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdG9Qcm9wcy5kYXRhU291cmNlUGF0aCA9IGdldFRhcmdldE9iamVjdFBhdGgob0RhdGFNb2RlbFBhdGgpO1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBtU2V0dGluZ3MubW9kZWxzLm1ldGFNb2RlbCB8fCBtU2V0dGluZ3MubW9kZWxzLmVudGl0eVNldDtcblx0XHRvUHJvcHMuZW50aXR5VHlwZSA9IG9NZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYC8ke29EYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lfWApO1xuXG5cdFx0dGhpcy5zZXRVcEVkaXRhYmxlUHJvcGVydGllcyhvUHJvcHMsIG9EYXRhRmllbGRDb252ZXJ0ZWQsIG9EYXRhTW9kZWxQYXRoLCBvTWV0YU1vZGVsKTtcblx0XHR0aGlzLnNldFVwRm9ybWF0T3B0aW9ucyhvUHJvcHMsIG9EYXRhTW9kZWxQYXRoLCBvQ29udHJvbENvbmZpZ3VyYXRpb24sIG1TZXR0aW5ncyk7XG5cdFx0dGhpcy5zZXRVcERpc3BsYXlTdHlsZShvUHJvcHMsIG9EYXRhRmllbGRDb252ZXJ0ZWQsIG9EYXRhTW9kZWxQYXRoKTtcblx0XHR0aGlzLnNldFVwRWRpdFN0eWxlKG9Qcm9wcywgb0RhdGFGaWVsZENvbnZlcnRlZCwgb0RhdGFNb2RlbFBhdGgpO1xuXG5cdFx0Ly8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBjb21wdXRlIGJpbmRpbmdzLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuXHRcdGNvbnN0IGFEaXNwbGF5U3R5bGVzV2l0aG91dFByb3BUZXh0ID0gW1wiQXZhdGFyXCIsIFwiQW1vdW50V2l0aEN1cnJlbmN5XCJdO1xuXHRcdGlmIChvUHJvcHMuZGlzcGxheVN0eWxlICYmIGFEaXNwbGF5U3R5bGVzV2l0aG91dFByb3BUZXh0LmluZGV4T2Yob1Byb3BzLmRpc3BsYXlTdHlsZSkgPT09IC0xICYmIG9EYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCkge1xuXHRcdFx0b1Byb3BzLnRleHQgPSBvUHJvcHMudGV4dCB8fCBGaWVsZFRlbXBsYXRpbmcuZ2V0VGV4dEJpbmRpbmcob0RhdGFNb2RlbFBhdGgsIG9Qcm9wcy5mb3JtYXRPcHRpb25zKTtcblx0XHRcdHRoaXMuc2V0VXBPYmplY3RJZGVudGlmaWVyVGl0bGVBbmRUZXh0KG9Qcm9wcywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUHJvcHMudGV4dCA9IFwiXCI7XG5cdFx0fVxuXG5cdFx0Ly9UT0RPIHRoaXMgaXMgZml4ZWQgdHdpY2Vcblx0XHQvLyBkYXRhIHBvaW50IGFubm90YXRpb25zIG5lZWQgbm90IGhhdmUgJFR5cGUgZGVmaW5lZCwgc28gYWRkIGl0IGlmIG1pc3Npbmdcblx0XHRpZiAob1Byb3BzLmRhdGFGaWVsZC5nZXRPYmplY3QoXCJAc2FwdWkubmFtZVwiKT8uaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFwiKSA+IC0xKSB7XG5cdFx0XHRjb25zdCBvRGF0YVBvaW50ID0gb1Byb3BzLmRhdGFGaWVsZC5nZXRPYmplY3QoKTtcblx0XHRcdG9EYXRhUG9pbnQuJFR5cGUgPSBvRGF0YVBvaW50LiRUeXBlIHx8IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGU7XG5cdFx0XHRvUHJvcHMuZGF0YUZpZWxkID0gbmV3IFRlbXBsYXRlTW9kZWwob0RhdGFQb2ludCwgb1Byb3BzLmRhdGFGaWVsZC5nZXRNb2RlbCgpKS5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIik7XG5cdFx0fVxuXG5cdFx0b1Byb3BzLmVtcHR5SW5kaWNhdG9yTW9kZSA9IG9Qcm9wcy5mb3JtYXRPcHRpb25zLnNob3dFbXB0eUluZGljYXRvciA/IFwiT25cIiA6IHVuZGVmaW5lZDtcblxuXHRcdHJldHVybiBvUHJvcHM7XG5cdH0sXG5cblx0Z2V0T2JqZWN0SWRlbnRpZmllclRpdGxlOiBmdW5jdGlvbiAoXG5cdFx0ZmllbGRGb3JtYXRPcHRpb25zOiBGaWVsZEZvcm1hdE9wdGlvbnMsXG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuXHQpOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0XHRsZXQgcHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4gPSBwYXRoSW5Nb2RlbChcblx0XHRcdGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aClcblx0XHQpO1xuXHRcdGxldCB0YXJnZXREaXNwbGF5TW9kZSA9IGZpZWxkRm9ybWF0T3B0aW9ucz8uZGlzcGxheU1vZGU7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5RGVmaW5pdGlvbiA9XG5cdFx0XHRvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC50eXBlID09PSBcIlByb3BlcnR5UGF0aFwiXG5cdFx0XHRcdD8gKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LiR0YXJnZXQgYXMgUHJvcGVydHkpXG5cdFx0XHRcdDogKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0IGFzIFByb3BlcnR5KTtcblx0XHRwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24ob1Byb3BlcnR5RGVmaW5pdGlvbiwgcHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbik7XG5cblx0XHRjb25zdCBjb21tb25UZXh0ID0gb1Byb3BlcnR5RGVmaW5pdGlvbi5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0O1xuXHRcdGlmIChjb21tb25UZXh0ID09PSB1bmRlZmluZWQpIHtcblx0XHRcdC8vIHRoZXJlIGlzIG5vIHByb3BlcnR5IGZvciBkZXNjcmlwdGlvblxuXHRcdFx0dGFyZ2V0RGlzcGxheU1vZGUgPSBcIlZhbHVlXCI7XG5cdFx0fVxuXHRcdGNvbnN0IHJlbGF0aXZlTG9jYXRpb24gPSBnZXRSZWxhdGl2ZVBhdGhzKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgpO1xuXG5cdFx0Y29uc3QgcGFyYW1ldGVyc0ZvckZvcm1hdHRlciA9IFtdO1xuXG5cdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKHBhdGhJbk1vZGVsKFwiVF9ORVdfT0JKRUNUXCIsIFwic2FwLmZlLmkxOG5cIikpO1xuXHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChwYXRoSW5Nb2RlbChcIlRfQU5OT1RBVElPTl9IRUxQRVJfREVGQVVMVF9PQkpFQ1RfUEFHRV9IRUFERVJfVElUTEVfTk9fSEVBREVSX0lORk9cIiwgXCJzYXAuZmUuaTE4blwiKSk7XG5cblx0XHRpZiAoXG5cdFx0XHQhIShvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldEVudGl0eVNldCBhcyBFbnRpdHlTZXQpPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5EcmFmdFJvb3QgfHxcblx0XHRcdCEhKG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5Db21tb24/LkRyYWZ0Tm9kZVxuXHRcdCkge1xuXHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKEVudGl0eS5IYXNEcmFmdCk7XG5cdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goRW50aXR5LklzQWN0aXZlKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKGNvbnN0YW50KG51bGwpKTtcblx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChjb25zdGFudChudWxsKSk7XG5cdFx0fVxuXG5cdFx0c3dpdGNoICh0YXJnZXREaXNwbGF5TW9kZSkge1xuXHRcdFx0Y2FzZSBcIlZhbHVlXCI6XG5cdFx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uKTtcblx0XHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKGNvbnN0YW50KG51bGwpKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihjb21tb25UZXh0LCByZWxhdGl2ZUxvY2F0aW9uKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPik7XG5cdFx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChjb25zdGFudChudWxsKSk7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIlZhbHVlRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0cGFyYW1ldGVyc0ZvckZvcm1hdHRlci5wdXNoKHByb3BlcnR5QmluZGluZ0V4cHJlc3Npb24pO1xuXHRcdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGNvbW1vblRleHQsIHJlbGF0aXZlTG9jYXRpb24pIGFzIEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxzdHJpbmc+KTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRpZiAoY29tbW9uVGV4dD8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQpIHtcblx0XHRcdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goXG5cdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oY29tbW9uVGV4dCwgcmVsYXRpdmVMb2NhdGlvbikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz5cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBpZiBEZXNjcmlwdGlvblZhbHVlIGlzIHNldCBieSBkZWZhdWx0IGFuZCBub3QgYnkgVGV4dEFycmFuZ2VtZW50XG5cdFx0XHRcdFx0Ly8gd2Ugc2hvdyBkZXNjcmlwdGlvbiBpbiBPYmplY3RJZGVudGlmaWVyIFRpdGxlIGFuZCB2YWx1ZSBpbiBPYmplY3RJZGVudGlmaWVyIFRleHRcblx0XHRcdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2goXG5cdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oY29tbW9uVGV4dCwgcmVsYXRpdmVMb2NhdGlvbikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz5cblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdC8vIGlmIERlc2NyaXB0aW9uVmFsdWUgaXMgc2V0IGJ5IGRlZmF1bHQgYW5kIHByb3BlcnR5IGhhcyBhIHNlbWFudGljIG9iamVjdFxuXHRcdFx0XHRcdC8vIHdlIHNob3cgZGVzY3JpcHRpb24gYW5kIHZhbHVlIGluIE9iamVjdElkZW50aWZpZXIgVGl0bGVcblx0XHRcdFx0XHRpZiAob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LmFubm90YXRpb25zPy5Db21tb24/LlNlbWFudGljT2JqZWN0KSB7XG5cdFx0XHRcdFx0XHRwYXJhbWV0ZXJzRm9yRm9ybWF0dGVyLnB1c2gocHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbik7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIucHVzaChjb25zdGFudChudWxsKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdH1cblx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24oZm9ybWF0UmVzdWx0KHBhcmFtZXRlcnNGb3JGb3JtYXR0ZXIgYXMgYW55LCB2YWx1ZUZvcm1hdHRlcnMuZm9ybWF0T1BUaXRsZSkpO1xuXHR9LFxuXG5cdGdldE9iamVjdElkZW50aWZpZXJUZXh0OiBmdW5jdGlvbiAoXG5cdFx0ZmllbGRGb3JtYXRPcHRpb25zOiBGaWVsZEZvcm1hdE9wdGlvbnMsXG5cdFx0b1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuXHQpOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPiB8IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0XHRsZXQgcHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGFueT4gPSBwYXRoSW5Nb2RlbChcblx0XHRcdGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aClcblx0XHQpO1xuXHRcdGNvbnN0IHRhcmdldERpc3BsYXlNb2RlID0gZmllbGRGb3JtYXRPcHRpb25zPy5kaXNwbGF5TW9kZTtcblx0XHRjb25zdCBvUHJvcGVydHlEZWZpbml0aW9uID1cblx0XHRcdG9Qcm9wZXJ0eURhdGFNb2RlbE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnR5cGUgPT09IFwiUHJvcGVydHlQYXRoXCJcblx0XHRcdFx0PyAob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QuJHRhcmdldCBhcyBQcm9wZXJ0eSlcblx0XHRcdFx0OiAob1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgYXMgUHJvcGVydHkpO1xuXG5cdFx0Y29uc3QgY29tbW9uVGV4dCA9IG9Qcm9wZXJ0eURlZmluaXRpb24uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dDtcblx0XHRpZiAoY29tbW9uVGV4dCA9PT0gdW5kZWZpbmVkIHx8IGNvbW1vblRleHQ/LmFubm90YXRpb25zPy5VST8uVGV4dEFycmFuZ2VtZW50KSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRwcm9wZXJ0eUJpbmRpbmdFeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmZvcm1hdFdpdGhUeXBlSW5mb3JtYXRpb24ob1Byb3BlcnR5RGVmaW5pdGlvbiwgcHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbik7XG5cblx0XHRzd2l0Y2ggKHRhcmdldERpc3BsYXlNb2RlKSB7XG5cdFx0XHRjYXNlIFwiVmFsdWVEZXNjcmlwdGlvblwiOlxuXHRcdFx0XHRjb25zdCByZWxhdGl2ZUxvY2F0aW9uID0gZ2V0UmVsYXRpdmVQYXRocyhvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0XHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihjb21tb25UZXh0LCByZWxhdGl2ZUxvY2F0aW9uKSBhcyBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248c3RyaW5nPik7XG5cdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25WYWx1ZVwiOlxuXHRcdFx0XHRyZXR1cm4gY29tcGlsZUV4cHJlc3Npb24ocHJvcGVydHlCaW5kaW5nRXhwcmVzc2lvbik7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fSxcblxuXHRzZXRVcE9iamVjdElkZW50aWZpZXJUaXRsZUFuZFRleHQoX29Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKSB7XG5cdFx0aWYgKF9vUHJvcHMuZm9ybWF0T3B0aW9ucz8uc2VtYW50aWNLZXlTdHlsZSA9PT0gXCJPYmplY3RJZGVudGlmaWVyXCIpIHtcblx0XHRcdF9vUHJvcHMuaWRlbnRpZmllclRpdGxlID0gdGhpcy5nZXRPYmplY3RJZGVudGlmaWVyVGl0bGUoX29Qcm9wcy5mb3JtYXRPcHRpb25zLCBvUHJvcGVydHlEYXRhTW9kZWxPYmplY3RQYXRoKTtcblx0XHRcdGlmICghb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LmFubm90YXRpb25zPy5Db21tb24/LlNlbWFudGljT2JqZWN0KSB7XG5cdFx0XHRcdF9vUHJvcHMuaWRlbnRpZmllclRleHQgPSB0aGlzLmdldE9iamVjdElkZW50aWZpZXJUZXh0KF9vUHJvcHMuZm9ybWF0T3B0aW9ucywgb1Byb3BlcnR5RGF0YU1vZGVsT2JqZWN0UGF0aCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRfb1Byb3BzLmlkZW50aWZpZXJUZXh0ID0gdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRfb1Byb3BzLmlkZW50aWZpZXJUaXRsZSA9IHVuZGVmaW5lZDtcblx0XHRcdF9vUHJvcHMuaWRlbnRpZmllclRleHQgPSB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9LFxuXG5cdGdldFRleHRXaXRoV2hpdGVTcGFjZTogZnVuY3Rpb24gKGZvcm1hdE9wdGlvbnM6IEZpZWxkRm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRjb25zdCB0ZXh0ID0gRmllbGRUZW1wbGF0aW5nLmdldFRleHRCaW5kaW5nKG9EYXRhTW9kZWxQYXRoLCBmb3JtYXRPcHRpb25zLCB0cnVlKTtcblx0XHRyZXR1cm4gKHRleHQgYXMgYW55KS5fdHlwZSA9PT0gXCJQYXRoSW5Nb2RlbFwiIHx8IHR5cGVvZiB0ZXh0ID09PSBcInN0cmluZ1wiXG5cdFx0XHQ/IGNvbXBpbGVFeHByZXNzaW9uKGZvcm1hdFJlc3VsdChbdGV4dF0sIFwiV1NSXCIpKVxuXHRcdFx0OiBjb21waWxlRXhwcmVzc2lvbih0ZXh0KTtcblx0fSxcblxuXHRfZ2V0VGFyZ2V0VmFsdWVEYXRhTW9kZWxQYXRoOiBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBvRGF0YU1vZGVsUGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IERhdGFNb2RlbE9iamVjdFBhdGgge1xuXHRcdGlmICghb0RhdGFGaWVsZD8uJFR5cGUpIHtcblx0XHRcdHJldHVybiBvRGF0YU1vZGVsUGF0aDtcblx0XHR9XG5cdFx0bGV0IHNFeHRyYVBhdGggPSBcIlwiO1xuXHRcdGxldCB0YXJnZXRWYWx1ZURhdGFNb2RlbFBhdGggPSBvRGF0YU1vZGVsUGF0aDtcblxuXHRcdHN3aXRjaCAob0RhdGFGaWVsZC4kVHlwZSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGQ6XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFQb2ludFR5cGU6XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhOYXZpZ2F0aW9uUGF0aDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aFVybDpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEFjdGlvbjpcblx0XHRcdFx0c0V4dHJhUGF0aCA9IG9EYXRhRmllbGQuVmFsdWU/LnBhdGg7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0XHRpZiAob0RhdGFGaWVsZC5UYXJnZXQuJHRhcmdldCkge1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0LiR0YXJnZXQuJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZCB8fFxuXHRcdFx0XHRcdFx0b0RhdGFGaWVsZC5UYXJnZXQuJHRhcmdldC4kVHlwZSA9PT0gVUlBbm5vdGF0aW9uVHlwZXMuRGF0YVBvaW50VHlwZVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0c0V4dHJhUGF0aCA9IG9EYXRhRmllbGQuVGFyZ2V0LiR0YXJnZXQuVmFsdWU/LnBhdGg7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHNFeHRyYVBhdGggPSBvRGF0YUZpZWxkLlRhcmdldD8ucGF0aDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXHRcdGlmIChzRXh0cmFQYXRoPy5sZW5ndGggPiAwKSB7XG5cdFx0XHR0YXJnZXRWYWx1ZURhdGFNb2RlbFBhdGggPSBlbmhhbmNlRGF0YU1vZGVsUGF0aChvRGF0YU1vZGVsUGF0aCwgc0V4dHJhUGF0aCk7XG5cdFx0fVxuXHRcdHJldHVybiB0YXJnZXRWYWx1ZURhdGFNb2RlbFBhdGg7XG5cdH0sXG5cdC8vIGFsZ29yaXRobSB0byBkZXRlcm1pbmUgdGhlIGZpZWxkIGZyYWdtZW50IHRvIHVzZSBpbiBkaXNwbGF5IGFuZCBzZXRVcCBzb21lIHByb3BlcnRpZXNcblx0c2V0VXBEaXNwbGF5U3R5bGU6IGZ1bmN0aW9uICh0aGlzOiBGaWVsZFR5cGUsIG9Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvRGF0YUZpZWxkOiBhbnksIG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogdm9pZCB7XG5cdFx0Y29uc3Qgb1Byb3BlcnR5OiBQcm9wZXJ0eSA9IG9EYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCBhcyBQcm9wZXJ0eTtcblx0XHRpZiAoIW9EYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCkge1xuXHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiVGV4dFwiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAob1Byb3BlcnR5LnR5cGUgPT09IFwiRWRtLlN0cmVhbVwiKSB7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJGaWxlXCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGlmIChvUHJvcGVydHkuYW5ub3RhdGlvbnM/LlVJPy5Jc0ltYWdlVVJMKSB7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJBdmF0YXJcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgaGFzUXVpY2tWaWV3RmFjZXRzID0gb1Byb3BlcnR5ID8gRmllbGRUZW1wbGF0aW5nLmlzVXNlZEluTmF2aWdhdGlvbldpdGhRdWlja1ZpZXdGYWNldHMob0RhdGFNb2RlbFBhdGgsIG9Qcm9wZXJ0eSkgOiBmYWxzZTtcblxuXHRcdHN3aXRjaCAob0RhdGFGaWVsZC4kVHlwZSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlOlxuXHRcdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJEYXRhUG9pbnRcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBbm5vdGF0aW9uOlxuXHRcdFx0XHRpZiAob0RhdGFGaWVsZC5UYXJnZXQ/LiR0YXJnZXQ/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhUG9pbnRUeXBlKSB7XG5cdFx0XHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiRGF0YVBvaW50XCI7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9EYXRhRmllbGQuVGFyZ2V0Py4kdGFyZ2V0Py4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkNvbnRhY3RUeXBlXCIpIHtcblx0XHRcdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJDb250YWN0XCI7XG5cdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb246XG5cdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkJ1dHRvblwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdFx0dGhpcy5zZXRVcE5hdmlnYXRpb25BdmFpbGFibGUob1Byb3BzLCBvRGF0YUZpZWxkKTtcblx0XHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiQnV0dG9uXCI7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVHlwZXMuRGF0YUZpZWxkV2l0aEludGVudEJhc2VkTmF2aWdhdGlvbjpcblx0XHRcdFx0b1Byb3BzLnRleHQgPSB0aGlzLmdldFRleHRXaXRoV2hpdGVTcGFjZShvUHJvcHMuZm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0Ly8gZmFsbHMgdGhyb3VnaFxuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoTmF2aWdhdGlvblBhdGg6XG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZFdpdGhBY3Rpb246XG5cdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkxpbmtcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAoaXNTZW1hbnRpY0tleShvUHJvcGVydHksIG9EYXRhTW9kZWxQYXRoKSAmJiBvUHJvcHMuZm9ybWF0T3B0aW9ucy5zZW1hbnRpY0tleVN0eWxlKSB7XG5cdFx0XHRvUHJvcHMuaGFzUXVpY2tWaWV3RmFjZXRzID0gaGFzUXVpY2tWaWV3RmFjZXRzO1xuXHRcdFx0b1Byb3BzLmhhc1NpdHVhdGlvbnNJbmRpY2F0b3IgPVxuXHRcdFx0XHRTaXR1YXRpb25zSW5kaWNhdG9yLmdldFNpdHVhdGlvbnNOYXZpZ2F0aW9uUHJvcGVydHkob0RhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5VHlwZSkgIT09IHVuZGVmaW5lZDtcblx0XHRcdHRoaXMuc2V0VXBPYmplY3RJZGVudGlmaWVyVGl0bGVBbmRUZXh0KG9Qcm9wcywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0aWYgKChvRGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uRHJhZnRSb290KSB7XG5cdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIlNlbWFudGljS2V5V2l0aERyYWZ0SW5kaWNhdG9yXCI7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBvUHJvcHMuZm9ybWF0T3B0aW9ucy5zZW1hbnRpY0tleVN0eWxlID09PSBcIk9iamVjdElkZW50aWZpZXJcIiA/IFwiT2JqZWN0SWRlbnRpZmllclwiIDogXCJMYWJlbFNlbWFudGljS2V5XCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKG9EYXRhRmllbGQuQ3JpdGljYWxpdHkpIHtcblx0XHRcdG9Qcm9wcy5oYXNRdWlja1ZpZXdGYWNldHMgPSBoYXNRdWlja1ZpZXdGYWNldHM7XG5cdFx0XHRvUHJvcHMubGlua1VybCA9IG9EYXRhRmllbGQuVXJsID8gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9EYXRhRmllbGQuVXJsKSkgOiB1bmRlZmluZWQ7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJPYmplY3RTdGF0dXNcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uTWVhc3VyZXM/LklTT0N1cnJlbmN5ICYmIFN0cmluZyhvUHJvcHMuZm9ybWF0T3B0aW9ucy5pc0N1cnJlbmN5QWxpZ25lZCkgPT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRpZiAob1Byb3BzLmZvcm1hdE9wdGlvbnMubWVhc3VyZURpc3BsYXlNb2RlID09PSBcIkhpZGRlblwiKSB7XG5cdFx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIlRleHRcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0b1Byb3BzLnZhbHVlQXNTdHJpbmdCaW5kaW5nRXhwcmVzc2lvbiA9IEZpZWxkVGVtcGxhdGluZy5nZXRWYWx1ZUJpbmRpbmcoXG5cdFx0XHRcdG9EYXRhTW9kZWxQYXRoLFxuXHRcdFx0XHRvUHJvcHMuZm9ybWF0T3B0aW9ucyxcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0dHJ1ZSxcblx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHR0cnVlXG5cdFx0XHQpO1xuXHRcdFx0b1Byb3BzLnVuaXRCaW5kaW5nRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKFVJRm9ybWF0dGVycy5nZXRCaW5kaW5nRm9yVW5pdE9yQ3VycmVuY3kob0RhdGFNb2RlbFBhdGgpKTtcblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkFtb3VudFdpdGhDdXJyZW5jeVwiO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRpZiAob1Byb3BlcnR5LmFubm90YXRpb25zPy5Db21tdW5pY2F0aW9uPy5Jc0VtYWlsQWRkcmVzcyB8fCBvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW11bmljYXRpb24/LklzUGhvbmVOdW1iZXIpIHtcblx0XHRcdG9Qcm9wcy50ZXh0ID0gdGhpcy5nZXRUZXh0V2l0aFdoaXRlU3BhY2Uob1Byb3BzLmZvcm1hdE9wdGlvbnMsIG9EYXRhTW9kZWxQYXRoKTtcblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkxpbmtcIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKG9Qcm9wZXJ0eS5hbm5vdGF0aW9ucz8uVUk/Lk11bHRpTGluZVRleHQpIHtcblx0XHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIkV4cGFuZGFibGVUZXh0XCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKGhhc1F1aWNrVmlld0ZhY2V0cykge1xuXHRcdFx0b1Byb3BzLnRleHQgPSB0aGlzLmdldFRleHRXaXRoV2hpdGVTcGFjZShvUHJvcHMuZm9ybWF0T3B0aW9ucywgb0RhdGFNb2RlbFBhdGgpO1xuXHRcdFx0b1Byb3BzLmhhc1F1aWNrVmlld0ZhY2V0cyA9IHRydWU7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJMaW5rV2l0aFF1aWNrVmlld0Zvcm1cIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRpZiAoXG5cdFx0XHRvUHJvcHMuc2VtYW50aWNPYmplY3QgJiZcblx0XHRcdCEob1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbXVuaWNhdGlvbj8uSXNFbWFpbEFkZHJlc3MgfHwgb1Byb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbXVuaWNhdGlvbj8uSXNQaG9uZU51bWJlcilcblx0XHQpIHtcblx0XHRcdG9Qcm9wcy5oYXNRdWlja1ZpZXdGYWNldHMgPSBoYXNRdWlja1ZpZXdGYWNldHM7XG5cdFx0XHRvUHJvcHMudGV4dCA9IHRoaXMuZ2V0VGV4dFdpdGhXaGl0ZVNwYWNlKG9Qcm9wcy5mb3JtYXRPcHRpb25zLCBvRGF0YU1vZGVsUGF0aCk7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJMaW5rV2l0aFF1aWNrVmlld0Zvcm1cIjtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBfb1Byb3BlcnR5Q29tbW9uQW5ub3RhdGlvbnMgPSBvUHJvcGVydHkuYW5ub3RhdGlvbnM/LkNvbW1vbjtcblx0XHRjb25zdCBfb1Byb3BlcnR5TmF2aWdhdGlvblByb3BlcnR5QW5ub3RhdGlvbnMgPSBvRGF0YU1vZGVsUGF0aD8ubmF2aWdhdGlvblByb3BlcnRpZXNbMF0/LmFubm90YXRpb25zPy5Db21tb247XG5cdFx0Zm9yIChjb25zdCBrZXkgaW4gX29Qcm9wZXJ0eUNvbW1vbkFubm90YXRpb25zKSB7XG5cdFx0XHRpZiAoa2V5LmluZGV4T2YoXCJTZW1hbnRpY09iamVjdFwiKSA9PT0gMCkge1xuXHRcdFx0XHRvUHJvcHMuaGFzUXVpY2tWaWV3RmFjZXRzID0gaGFzUXVpY2tWaWV3RmFjZXRzO1xuXHRcdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJMaW5rV3JhcHBlclwiO1xuXHRcdFx0XHRyZXR1cm47XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGZvciAoY29uc3Qga2V5IGluIF9vUHJvcGVydHlOYXZpZ2F0aW9uUHJvcGVydHlBbm5vdGF0aW9ucykge1xuXHRcdFx0aWYgKGtleS5pbmRleE9mKFwiU2VtYW50aWNPYmplY3RcIikgPT09IDApIHtcblx0XHRcdFx0b1Byb3BzLmhhc1F1aWNrVmlld0ZhY2V0cyA9IGhhc1F1aWNrVmlld0ZhY2V0cztcblx0XHRcdFx0b1Byb3BzLmRpc3BsYXlTdHlsZSA9IFwiTGlua1dyYXBwZXJcIjtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChvRGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRXaXRoVXJsKSB7XG5cdFx0XHRvUHJvcHMudGV4dCA9IHRoaXMuZ2V0VGV4dFdpdGhXaGl0ZVNwYWNlKG9Qcm9wcy5mb3JtYXRPcHRpb25zLCBvRGF0YU1vZGVsUGF0aCk7XG5cdFx0XHRvUHJvcHMuZGlzcGxheVN0eWxlID0gXCJMaW5rXCI7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdG9Qcm9wcy5kaXNwbGF5U3R5bGUgPSBcIlRleHRcIjtcblx0fSxcblx0Ly8gYWxnb3JpdGhtIHRvIGRldGVybWluZSB0aGUgZmllbGQgZnJhZ21lbnQgdG8gdXNlIGluIGVkaXQgYW5kIHNldCB1cCBzb21lIHByb3BlcnRpZXNcblx0c2V0VXBFZGl0U3R5bGU6IGZ1bmN0aW9uICh0aGlzOiBGaWVsZFR5cGUsIG9Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvRGF0YUZpZWxkOiBhbnksIG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogdm9pZCB7XG5cdFx0RmllbGRUZW1wbGF0aW5nLnNldEVkaXRTdHlsZVByb3BlcnRpZXMob1Byb3BzLCBvRGF0YUZpZWxkLCBvRGF0YU1vZGVsUGF0aCk7XG5cdH0sXG5cdHNldFVwRWRpdGFibGVQcm9wZXJ0aWVzOiBmdW5jdGlvbiAoXG5cdFx0b1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsXG5cdFx0b0RhdGFGaWVsZDogYW55LFxuXHRcdG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoLFxuXHRcdG9NZXRhTW9kZWw6IGFueVxuXHQpOiB2b2lkIHtcblx0XHRjb25zdCBvUHJvcGVydHlGb3JGaWVsZENvbnRyb2wgPSBvRGF0YU1vZGVsUGF0aD8udGFyZ2V0T2JqZWN0Py5WYWx1ZVxuXHRcdFx0PyBvRGF0YU1vZGVsUGF0aC50YXJnZXRPYmplY3QuVmFsdWVcblx0XHRcdDogb0RhdGFNb2RlbFBhdGg/LnRhcmdldE9iamVjdDtcblx0XHRpZiAob1Byb3BzLmVkaXRNb2RlICE9PSB1bmRlZmluZWQgJiYgb1Byb3BzLmVkaXRNb2RlICE9PSBudWxsKSB7XG5cdFx0XHQvLyBFdmVuIGlmIGl0IHByb3ZpZGVkIGFzIGEgc3RyaW5nIGl0J3MgYSB2YWxpZCBwYXJ0IG9mIGEgYmluZGluZyBleHByZXNzaW9uIHRoYXQgY2FuIGJlIGxhdGVyIGNvbWJpbmVkIGludG8gc29tZXRoaW5nIGVsc2UuXG5cdFx0XHRvUHJvcHMuZWRpdE1vZGVBc09iamVjdCA9IG9Qcm9wcy5lZGl0TW9kZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3QgYk1lYXN1cmVSZWFkT25seSA9IG9Qcm9wcy5mb3JtYXRPcHRpb25zLm1lYXN1cmVEaXNwbGF5TW9kZVxuXHRcdFx0XHQ/IG9Qcm9wcy5mb3JtYXRPcHRpb25zLm1lYXN1cmVEaXNwbGF5TW9kZSA9PT0gXCJSZWFkT25seVwiXG5cdFx0XHRcdDogZmFsc2U7XG5cblx0XHRcdG9Qcm9wcy5lZGl0TW9kZUFzT2JqZWN0ID0gVUlGb3JtYXR0ZXJzLmdldEVkaXRNb2RlKFxuXHRcdFx0XHRvUHJvcGVydHlGb3JGaWVsZENvbnRyb2wsXG5cdFx0XHRcdG9EYXRhTW9kZWxQYXRoLFxuXHRcdFx0XHRiTWVhc3VyZVJlYWRPbmx5LFxuXHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRvRGF0YUZpZWxkXG5cdFx0XHQpO1xuXHRcdFx0b1Byb3BzLmVkaXRNb2RlID0gY29tcGlsZUV4cHJlc3Npb24ob1Byb3BzLmVkaXRNb2RlQXNPYmplY3QpO1xuXHRcdH1cblx0XHRjb25zdCBlZGl0YWJsZUV4cHJlc3Npb24gPSBVSUZvcm1hdHRlcnMuZ2V0RWRpdGFibGVFeHByZXNzaW9uQXNPYmplY3Qob1Byb3BlcnR5Rm9yRmllbGRDb250cm9sLCBvRGF0YUZpZWxkLCBvRGF0YU1vZGVsUGF0aCk7XG5cdFx0Y29uc3QgYVJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMgPSBDb21tb25VdGlscy5nZXRSZXF1aXJlZFByb3BlcnRpZXNGcm9tSW5zZXJ0UmVzdHJpY3Rpb25zKFxuXHRcdFx0b1Byb3BzLmVudGl0eVNldD8uZ2V0UGF0aCgpLnJlcGxhY2VBbGwoXCIvJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvXCIsIFwiL1wiKSxcblx0XHRcdG9NZXRhTW9kZWxcblx0XHQpO1xuXHRcdGNvbnN0IGFSZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zID0gQ29tbW9uVXRpbHMuZ2V0UmVxdWlyZWRQcm9wZXJ0aWVzRnJvbVVwZGF0ZVJlc3RyaWN0aW9ucyhcblx0XHRcdG9Qcm9wcy5lbnRpdHlTZXQ/LmdldFBhdGgoKS5yZXBsYWNlQWxsKFwiLyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nL1wiLCBcIi9cIiksXG5cdFx0XHRvTWV0YU1vZGVsXG5cdFx0KTtcblx0XHRjb25zdCBvUmVxdWlyZWRQcm9wZXJ0aWVzID0ge1xuXHRcdFx0cmVxdWlyZWRQcm9wZXJ0aWVzRnJvbUluc2VydFJlc3RyaWN0aW9uczogYVJlcXVpcmVkUHJvcGVydGllc0Zyb21JbnNlcnRSZXN0cmljdGlvbnMsXG5cdFx0XHRyZXF1aXJlZFByb3BlcnRpZXNGcm9tVXBkYXRlUmVzdHJpY3Rpb25zOiBhUmVxdWlyZWRQcm9wZXJ0aWVzRnJvbVVwZGF0ZVJlc3RyaWN0aW9uc1xuXHRcdH07XG5cdFx0aWYgKE1vZGVsSGVscGVyLmlzQ29sbGFib3JhdGlvbkRyYWZ0U3VwcG9ydGVkKG9NZXRhTW9kZWwpKSB7XG5cdFx0XHRvUHJvcHMuY29sbGFib3JhdGlvbkVuYWJsZWQgPSB0cnVlO1xuXHRcdFx0Ly8gRXhwcmVzc2lvbnMgbmVlZGVkIGZvciBDb2xsYWJvcmF0aW9uIFZpc3VhbGl6YXRpb25cblx0XHRcdGNvbnN0IGNvbGxhYm9yYXRpb25FeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmdldENvbGxhYm9yYXRpb25FeHByZXNzaW9uKFxuXHRcdFx0XHRvRGF0YU1vZGVsUGF0aCxcblx0XHRcdFx0Q29sbGFib3JhdGlvbkZvcm1hdHRlcnMuaGFzQ29sbGFib3JhdGlvbkFjdGl2aXR5XG5cdFx0XHQpO1xuXHRcdFx0b1Byb3BzLmNvbGxhYm9yYXRpb25IYXNBY3Rpdml0eUV4cHJlc3Npb24gPSBjb21waWxlRXhwcmVzc2lvbihjb2xsYWJvcmF0aW9uRXhwcmVzc2lvbik7XG5cdFx0XHRvUHJvcHMuY29sbGFib3JhdGlvbkluaXRpYWxzRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRVSUZvcm1hdHRlcnMuZ2V0Q29sbGFib3JhdGlvbkV4cHJlc3Npb24ob0RhdGFNb2RlbFBhdGgsIENvbGxhYm9yYXRpb25Gb3JtYXR0ZXJzLmdldENvbGxhYm9yYXRpb25BY3Rpdml0eUluaXRpYWxzKVxuXHRcdFx0KTtcblx0XHRcdG9Qcm9wcy5jb2xsYWJvcmF0aW9uQ29sb3JFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oXG5cdFx0XHRcdFVJRm9ybWF0dGVycy5nZXRDb2xsYWJvcmF0aW9uRXhwcmVzc2lvbihvRGF0YU1vZGVsUGF0aCwgQ29sbGFib3JhdGlvbkZvcm1hdHRlcnMuZ2V0Q29sbGFib3JhdGlvbkFjdGl2aXR5Q29sb3IpXG5cdFx0XHQpO1xuXHRcdFx0b1Byb3BzLmVkaXRhYmxlRXhwcmVzc2lvbiA9IGNvbXBpbGVFeHByZXNzaW9uKGFuZChlZGl0YWJsZUV4cHJlc3Npb24sIG5vdChjb2xsYWJvcmF0aW9uRXhwcmVzc2lvbikpKTtcblxuXHRcdFx0b1Byb3BzLmVkaXRNb2RlID0gY29tcGlsZUV4cHJlc3Npb24oaWZFbHNlKGNvbGxhYm9yYXRpb25FeHByZXNzaW9uLCBjb25zdGFudChcIlJlYWRPbmx5XCIpLCBvUHJvcHMuZWRpdE1vZGVBc09iamVjdCkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUHJvcHMuZWRpdGFibGVFeHByZXNzaW9uID0gY29tcGlsZUV4cHJlc3Npb24oZWRpdGFibGVFeHByZXNzaW9uKTtcblx0XHR9XG5cdFx0b1Byb3BzLmVuYWJsZWRFeHByZXNzaW9uID0gVUlGb3JtYXR0ZXJzLmdldEVuYWJsZWRFeHByZXNzaW9uKFxuXHRcdFx0b1Byb3BlcnR5Rm9yRmllbGRDb250cm9sLFxuXHRcdFx0b0RhdGFGaWVsZCxcblx0XHRcdGZhbHNlLFxuXHRcdFx0b0RhdGFNb2RlbFBhdGhcblx0XHQpIGFzIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRcdG9Qcm9wcy5yZXF1aXJlZEV4cHJlc3Npb24gPSBVSUZvcm1hdHRlcnMuZ2V0UmVxdWlyZWRFeHByZXNzaW9uKFxuXHRcdFx0b1Byb3BlcnR5Rm9yRmllbGRDb250cm9sLFxuXHRcdFx0b0RhdGFGaWVsZCxcblx0XHRcdGZhbHNlLFxuXHRcdFx0ZmFsc2UsXG5cdFx0XHRvUmVxdWlyZWRQcm9wZXJ0aWVzLFxuXHRcdFx0b0RhdGFNb2RlbFBhdGhcblx0XHQpIGFzIENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHR9LFxuXHRzZXRVcEZvcm1hdE9wdGlvbnM6IGZ1bmN0aW9uIChcblx0XHR0aGlzOiBGaWVsZFR5cGUsXG5cdFx0b1Byb3BzOiBGaWVsZFByb3BlcnRpZXMsXG5cdFx0b0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdFx0b0NvbnRyb2xDb25maWd1cmF0aW9uOiBhbnksXG5cdFx0bVNldHRpbmdzOiBhbnlcblx0KSB7XG5cdFx0Y29uc3Qgb092ZXJyaWRlUHJvcHMgPSB0aGlzLmdldE92ZXJyaWRlcyhvQ29udHJvbENvbmZpZ3VyYXRpb24sIG9Qcm9wcy5kYXRhRmllbGQuZ2V0UGF0aCgpKTtcblxuXHRcdGlmICghb1Byb3BzLmZvcm1hdE9wdGlvbnMuZGlzcGxheU1vZGUpIHtcblx0XHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zLmRpc3BsYXlNb2RlID0gVUlGb3JtYXR0ZXJzLmdldERpc3BsYXlNb2RlKG9EYXRhTW9kZWxQYXRoKTtcblx0XHR9XG5cdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMudGV4dExpbmVzRWRpdCA9XG5cdFx0XHRvT3ZlcnJpZGVQcm9wcy50ZXh0TGluZXNFZGl0IHx8XG5cdFx0XHQob092ZXJyaWRlUHJvcHMuZm9ybWF0T3B0aW9ucyAmJiBvT3ZlcnJpZGVQcm9wcy5mb3JtYXRPcHRpb25zLnRleHRMaW5lc0VkaXQpIHx8XG5cdFx0XHRvUHJvcHMuZm9ybWF0T3B0aW9ucy50ZXh0TGluZXNFZGl0IHx8XG5cdFx0XHQ0O1xuXHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zLnRleHRNYXhMaW5lcyA9XG5cdFx0XHRvT3ZlcnJpZGVQcm9wcy50ZXh0TWF4TGluZXMgfHxcblx0XHRcdChvT3ZlcnJpZGVQcm9wcy5mb3JtYXRPcHRpb25zICYmIG9PdmVycmlkZVByb3BzLmZvcm1hdE9wdGlvbnMudGV4dE1heExpbmVzKSB8fFxuXHRcdFx0b1Byb3BzLmZvcm1hdE9wdGlvbnMudGV4dE1heExpbmVzO1xuXG5cdFx0Ly8gUmV0cmlldmUgdGV4dCBmcm9tIHZhbHVlIGxpc3QgYXMgZmFsbGJhY2sgZmVhdHVyZSBmb3IgbWlzc2luZyB0ZXh0IGFubm90YXRpb24gb24gdGhlIHByb3BlcnR5XG5cdFx0aWYgKG1TZXR0aW5ncy5tb2RlbHMudmlld0RhdGE/LmdldFByb3BlcnR5KFwiL3JldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3RcIikpIHtcblx0XHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zLnJldHJpZXZlVGV4dEZyb21WYWx1ZUxpc3QgPSBGaWVsZFRlbXBsYXRpbmcuaXNSZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0RW5hYmxlZChcblx0XHRcdFx0b0RhdGFNb2RlbFBhdGgudGFyZ2V0T2JqZWN0LFxuXHRcdFx0XHRvUHJvcHMuZm9ybWF0T3B0aW9uc1xuXHRcdFx0KTtcblx0XHRcdGlmIChvUHJvcHMuZm9ybWF0T3B0aW9ucy5yZXRyaWV2ZVRleHRGcm9tVmFsdWVMaXN0KSB7XG5cdFx0XHRcdC8vIENvbnNpZGVyIFRleHRBcnJhbmdlbWVudCBhdCBFbnRpdHlUeXBlIG90aGVyd2lzZSBzZXQgZGVmYXVsdCBkaXNwbGF5IGZvcm1hdCAnRGVzY3JpcHRpb25WYWx1ZSdcblx0XHRcdFx0Y29uc3QgaGFzRW50aXR5VGV4dEFycmFuZ2VtZW50ID0gISFvRGF0YU1vZGVsUGF0aD8udGFyZ2V0RW50aXR5VHlwZT8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQ7XG5cdFx0XHRcdG9Qcm9wcy5mb3JtYXRPcHRpb25zLmRpc3BsYXlNb2RlID0gaGFzRW50aXR5VGV4dEFycmFuZ2VtZW50ID8gb1Byb3BzLmZvcm1hdE9wdGlvbnMuZGlzcGxheU1vZGUgOiBcIkRlc2NyaXB0aW9uVmFsdWVcIjtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG9Qcm9wcy5mb3JtYXRPcHRpb25zLmZpZWxkTW9kZSA9PT0gXCJub3dyYXBwZXJcIiAmJiBvUHJvcHMuZWRpdE1vZGUgPT09IFwiRGlzcGxheVwiKSB7XG5cdFx0XHRpZiAob1Byb3BzLl9mbGV4SWQpIHtcblx0XHRcdFx0b1Byb3BzLm5vV3JhcHBlcklkID0gb1Byb3BzLl9mbGV4SWQ7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRvUHJvcHMubm9XcmFwcGVySWQgPSBvUHJvcHMuaWRQcmVmaXggPyBnZW5lcmF0ZShbb1Byb3BzLmlkUHJlZml4LCBcIkZpZWxkLWNvbnRlbnRcIl0pIDogdW5kZWZpbmVkO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0c2V0VXBTZW1hbnRpY09iamVjdHM6IGZ1bmN0aW9uIChvUHJvcHM6IEZpZWxkUHJvcGVydGllcywgb0RhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiB2b2lkIHtcblx0XHRsZXQgYVNlbU9iakV4cHJUb1Jlc29sdmUgPSBbXTtcblx0XHRhU2VtT2JqRXhwclRvUmVzb2x2ZSA9IEZpZWxkVGVtcGxhdGluZy5nZXRTZW1hbnRpY09iamVjdEV4cHJlc3Npb25Ub1Jlc29sdmUob0RhdGFNb2RlbFBhdGg/LnRhcmdldE9iamVjdD8uYW5ub3RhdGlvbnM/LkNvbW1vbik7XG5cblx0XHQvKipcblx0XHQgKiBJZiB0aGUgZmllbGQgYnVpbGRpbmcgYmxvY2sgaGFzIGEgYmluZGluZyBleHByZXNzaW9uIGluIHRoZSBjdXN0b20gc2VtYW50aWMgb2JqZWN0cyxcblx0XHQgKiBpdCBnZXRzIHN0b3JlZCB0byB0aGUgY3VzdG9tIGRhdGEgb2YgdGhlIExpbmsgaW4gTGlua1dpdGhRdWlja1ZpZXdGb3JtLmZyYWdtZW50LnhtbFxuXHRcdCAqIFRoaXMgaXMgbmVlZGVkIHRvIHJlc29sdmUgdGhlIGxpbmsgYXQgcnVudGltZS4gVGhlIFF1aWNrVmlld0xpbmtEZWxlZ2F0ZS5qcyB0aGVuIGdldHMgdGhlIHJlc29sdmVkXG5cdFx0ICogYmluZGluZyBleHByZXNzaW9uIGZyb20gdGhlIGN1c3RvbSBkYXRhLlxuXHRcdCAqIEFsbCBvdGhlciBjdXN0b20gc2VtYW50aWMgb2JqZWN0cyBhcmUgcHJvY2Vzc2VkIGluIEZpZWxkSGVscGVyLmpzOmNvbXB1dGVMaW5rUGFyYW1ldGVyc1xuXHRcdCAqL1xuXHRcdGlmICghIW9Qcm9wcy5zZW1hbnRpY09iamVjdCAmJiB0eXBlb2Ygb1Byb3BzLnNlbWFudGljT2JqZWN0ID09PSBcInN0cmluZ1wiICYmIG9Qcm9wcy5zZW1hbnRpY09iamVjdFswXSA9PT0gXCJ7XCIpIHtcblx0XHRcdGFTZW1PYmpFeHByVG9SZXNvbHZlLnB1c2goe1xuXHRcdFx0XHRrZXk6IG9Qcm9wcy5zZW1hbnRpY09iamVjdC5zdWJzdHIoMSwgb1Byb3BzLnNlbWFudGljT2JqZWN0Lmxlbmd0aCAtIDIpLFxuXHRcdFx0XHR2YWx1ZTogb1Byb3BzLnNlbWFudGljT2JqZWN0XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0b1Byb3BzLnNlbWFudGljT2JqZWN0cyA9IEZpZWxkVGVtcGxhdGluZy5nZXRTZW1hbnRpY09iamVjdHMoYVNlbU9iakV4cHJUb1Jlc29sdmUpO1xuXHRcdC8vIFRoaXMgc2V0cyB1cCB0aGUgc2VtYW50aWMgbGlua3MgZm91bmQgaW4gdGhlIG5hdmlnYXRpb24gcHJvcGVydHksIGlmIHRoZXJlIGlzIG5vIHNlbWFudGljIGxpbmtzIGRlZmluZSBiZWZvcmUuXG5cdFx0aWYgKCFvUHJvcHMuc2VtYW50aWNPYmplY3QgJiYgb0RhdGFNb2RlbFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0b0RhdGFNb2RlbFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMuZm9yRWFjaChmdW5jdGlvbiAobmF2UHJvcGVydHkpIHtcblx0XHRcdFx0aWYgKG5hdlByb3BlcnR5Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5TZW1hbnRpY09iamVjdCkge1xuXHRcdFx0XHRcdG9Qcm9wcy5zZW1hbnRpY09iamVjdCA9IG5hdlByb3BlcnR5LmFubm90YXRpb25zLkNvbW1vbi5TZW1hbnRpY09iamVjdDtcblx0XHRcdFx0XHRvUHJvcHMuaGFzU2VtYW50aWNPYmplY3RPbk5hdmlnYXRpb24gPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cdHNldFVwTmF2aWdhdGlvbkF2YWlsYWJsZTogZnVuY3Rpb24gKG9Qcm9wczogRmllbGRQcm9wZXJ0aWVzLCBvRGF0YUZpZWxkOiBhbnkpOiB2b2lkIHtcblx0XHRvUHJvcHMubmF2aWdhdGlvbkF2YWlsYWJsZSA9IHRydWU7XG5cdFx0aWYgKFxuXHRcdFx0b0RhdGFGaWVsZD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbiAmJlxuXHRcdFx0b0RhdGFGaWVsZC5OYXZpZ2F0aW9uQXZhaWxhYmxlICE9PSB1bmRlZmluZWQgJiZcblx0XHRcdFN0cmluZyhvUHJvcHMuZm9ybWF0T3B0aW9ucy5pZ25vcmVOYXZpZ2F0aW9uQXZhaWxhYmxlKSAhPT0gXCJ0cnVlXCJcblx0XHQpIHtcblx0XHRcdG9Qcm9wcy5uYXZpZ2F0aW9uQXZhaWxhYmxlID0gY29tcGlsZUV4cHJlc3Npb24oZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9EYXRhRmllbGQuTmF2aWdhdGlvbkF2YWlsYWJsZSkpO1xuXHRcdH1cblx0fVxufSk7XG5cbmV4cG9ydCBkZWZhdWx0IEZpZWxkIGFzIEZpZWxkVHlwZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQW1LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsSUFBTUEsS0FBSyxHQUFHQyxhQUFhLENBQUNDLE1BQU0sQ0FBQyw4QkFBOEIsRUFBRTtJQUNsRTtBQUNEO0FBQ0E7SUFDQ0MsSUFBSSxFQUFFLE9BQU87SUFDYjtBQUNEO0FBQ0E7SUFDQ0MsU0FBUyxFQUFFLHdCQUF3QjtJQUNuQztBQUNEO0FBQ0E7SUFDQ0MsUUFBUSxFQUFFLDhCQUE4QjtJQUV4QztBQUNEO0FBQ0E7SUFDQ0MsUUFBUSxFQUFFO01BQ1Q7QUFDRjtBQUNBO01BQ0VDLFVBQVUsRUFBRSxVQUFVO01BQ3RCO0FBQ0Y7QUFDQTtNQUNFQyxVQUFVLEVBQUUseUNBQXlDO01BQ3JEO0FBQ0Y7QUFDQTtNQUNFQyxVQUFVLEVBQUU7UUFDWDtBQUNIO0FBQ0E7UUFDR0MsUUFBUSxFQUFFO1VBQ1RDLElBQUksRUFBRTtRQUNQLENBQUM7UUFDREMsTUFBTSxFQUFFO1VBQ1BELElBQUksRUFBRTtRQUNQLENBQUM7UUFDREUsV0FBVyxFQUFFO1VBQ1pGLElBQUksRUFBRTtRQUNQLENBQUM7UUFDRDtBQUNIO0FBQ0E7UUFDR0csVUFBVSxFQUFFO1VBQ1hILElB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