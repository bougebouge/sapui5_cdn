/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/formatters/TableFormatter", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/library", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/UIFormatters", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/helpers/ActionHelper", "sap/fe/macros/table/TableSizeHelper"], function (Log, DataVisualization, ManifestSettings, MetaModelConverter, TableFormatter, BindingToolkit, StableIdHelper, FELibrary, DataModelPathHelper, UIFormatters, CommonHelper, FieldTemplating, ActionHelper, TableSizeHelper) {
  "use strict";

  var formatValueRecursively = FieldTemplating.formatValueRecursively;
  var getEditMode = UIFormatters.getEditMode;
  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var generate = StableIdHelper.generate;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var TemplateType = ManifestSettings.TemplateType;
  var getUiControl = DataVisualization.getUiControl;
  var CreationMode = FELibrary.CreationMode;
  /**
   * Helper class used by the control library for OData-specific handling (OData V4)
   *
   * @private
   * @experimental This module is only for internal/experimental use!
   */
  var TableHelper = {
    /**
     * Check if a given action is static.
     *
     * @param oActionContext The instance of the action
     * @param sActionName The name of the action
     * @returns Returns 'true' if action is static, else 'false'
     * @private
     * @ui5-restricted
     */
    _isStaticAction: function (oActionContext, sActionName) {
      var oAction;
      if (oActionContext) {
        if (Array.isArray(oActionContext)) {
          var sEntityType = this._getActionOverloadEntityType(sActionName);
          if (sEntityType) {
            oAction = oActionContext.find(function (action) {
              return action.$IsBound && action.$Parameter[0].$Type === sEntityType;
            });
          } else {
            // if this is just one - OK we take it. If it's more it's actually a wrong usage by the app
            // as we used the first one all the time we keep it as it is
            oAction = oActionContext[0];
          }
        } else {
          oAction = oActionContext;
        }
      }
      return !!oAction && oAction.$IsBound && oAction.$Parameter[0].$isCollection;
    },
    /**
     * Get the entity type of an action overload.
     *
     * @param sActionName The name of the action.
     * @returns The entity type used in the action overload.
     * @private
     */
    _getActionOverloadEntityType: function (sActionName) {
      if (sActionName && sActionName.indexOf("(") > -1) {
        var aParts = sActionName.split("(");
        return aParts[aParts.length - 1].replaceAll(")", "");
      }
      return undefined;
    },
    /**
     * Checks whether the action is overloaded on a different entity type.
     *
     * @param sActionName The name of the action.
     * @param sAnnotationTargetEntityType The entity type of the annotation target.
     * @returns Returns 'true' if the action is overloaded with a different entity type, else 'false'.
     * @private
     */
    _isActionOverloadOnDifferentType: function (sActionName, sAnnotationTargetEntityType) {
      var sEntityType = this._getActionOverloadEntityType(sActionName);
      return !!sEntityType && sAnnotationTargetEntityType !== sEntityType;
    },
    getMessageForDraftValidation: function (oThis) {
      var _oCollectionAnnotatio, _oThis$tableDefinitio;
      var oCollectionAnnotations = oThis.collection.getObject("./@");
      var sMessagePath = (_oCollectionAnnotatio = oCollectionAnnotations["@com.sap.vocabularies.Common.v1.Messages"]) === null || _oCollectionAnnotatio === void 0 ? void 0 : _oCollectionAnnotatio.$Path;
      if (sMessagePath && ((_oThis$tableDefinitio = oThis.tableDefinition) === null || _oThis$tableDefinitio === void 0 ? void 0 : _oThis$tableDefinitio.getProperty("/template")) === TemplateType.ObjectPage && !!Object.keys(oCollectionAnnotations).find(function (sKey) {
        var _oAnnotation$TargetPr;
        var oAnnotation = oCollectionAnnotations[sKey];
        return oAnnotation && oAnnotation.$Type === "com.sap.vocabularies.Common.v1.SideEffectsType" && !oAnnotation.SourceProperties && !oAnnotation.SourceEntities && ((_oAnnotation$TargetPr = oAnnotation.TargetProperties) === null || _oAnnotation$TargetPr === void 0 ? void 0 : _oAnnotation$TargetPr.indexOf(sMessagePath)) > -1;
      })) {
        return sMessagePath;
      }
      return "";
    },
    /**
     * Returns an array of the fields listed by the property RequestAtLeast in the PresentationVariant .
     *
     * @param oPresentationVariant The annotation related to com.sap.vocabularies.UI.v1.PresentationVariant.
     * @returns The fields.
     * @private
     * @ui5-restricted
     */
    getFieldsRequestedByPresentationVariant: function (oPresentationVariant) {
      var _oPresentationVariant;
      return ((_oPresentationVariant = oPresentationVariant.RequestAtLeast) === null || _oPresentationVariant === void 0 ? void 0 : _oPresentationVariant.map(function (oRequested) {
        return oRequested.value;
      })) || [];
    },
    getNavigationAvailableFieldsFromLineItem: function (aLineItemContext) {
      var aSelectedFieldsArray = [];
      (aLineItemContext.getObject() || []).forEach(function (oRecord) {
        var _oRecord$NavigationAv;
        if (oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && !oRecord.Inline && !oRecord.Determining && (_oRecord$NavigationAv = oRecord.NavigationAvailable) !== null && _oRecord$NavigationAv !== void 0 && _oRecord$NavigationAv.$Path) {
          aSelectedFieldsArray.push(oRecord.NavigationAvailable.$Path);
        }
      });
      return aSelectedFieldsArray;
    },
    getNavigationAvailableMap: function (aLineItemCollection) {
      var oIBNNavigationAvailableMap = {};
      aLineItemCollection.forEach(function (oRecord) {
        var sKey = "".concat(oRecord.SemanticObject, "-").concat(oRecord.Action);
        if (oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && !oRecord.Inline && oRecord.RequiresContext) {
          if (oRecord.NavigationAvailable !== undefined) {
            oIBNNavigationAvailableMap[sKey] = oRecord.NavigationAvailable.$Path ? oRecord.NavigationAvailable.$Path : oRecord.NavigationAvailable;
          }
        }
      });
      return JSON.stringify(oIBNNavigationAvailableMap);
    },
    /**
     * Return the context of the UI Line Item.
     *
     * @param oPresentationContext The context of the presentation (Presentation variant or UI.LineItem)
     * @returns The context of the UI Line Item
     */
    getUiLineItem: function (oPresentationContext) {
      return getUiControl(oPresentationContext, "@com.sap.vocabularies.UI.v1.LineItem");
    },
    /**
     * Creates and returns a select query with the selected fields from the parameters that were passed.
     *
     * @param oThis The instance of the inner model of the table building block
     * @returns The 'select' query that has the selected fields from the parameters that were passed
     */
    create$Select: function (oThis) {
      var oCollectionContext = oThis.collection;
      var aSelectedFields = [];
      var oLineItemContext = TableHelper.getUiLineItem(oThis.metaPath);
      var sTargetCollectionPath = CommonHelper.getTargetCollection(oCollectionContext);
      function pushField(sField) {
        if (sField && !aSelectedFields.includes(sField) && sField.indexOf("/") !== 0) {
          // Do not add singleton property (with absolute path) to $select
          aSelectedFields.push(sField);
        }
      }
      function pushFieldList(aFields) {
        if (aFields && aFields.length) {
          aFields.forEach(pushField);
        }
      }
      if (!oThis.tableDefinition.getObject("enableAnalytics") && oLineItemContext.getPath().indexOf("@com.sap.vocabularies.UI.v1.LineItem") > -1) {
        var _oCollectionContext$g, _oCollectionContext$g2, _oCollectionContext$g3, _oCollectionContext$g4;
        // $select isn't supported by the model in case of an analytical query
        // Don't process EntityType without LineItem (second condition of the if)
        var oPresentationAnnotation = getInvolvedDataModelObjects(oThis.metaPath).targetObject;
        var aOperationAvailableProperties = (oThis.tableDefinition.getObject("operationAvailableProperties") || "").split(",");
        var aApplicableProperties = TableHelper._filterNonApplicableProperties(aOperationAvailableProperties, oCollectionContext);
        var aSemanticKeys = (oCollectionContext.getObject("".concat(sTargetCollectionPath, "/@com.sap.vocabularies.Common.v1.SemanticKey")) || []).map(function (oSemanticKey) {
          return oSemanticKey.$PropertyPath;
        });
        if ((oPresentationAnnotation === null || oPresentationAnnotation === void 0 ? void 0 : oPresentationAnnotation.$Type) === "com.sap.vocabularies.UI.v1.PresentationVariantType") {
          pushFieldList(TableHelper.getFieldsRequestedByPresentationVariant(oPresentationAnnotation));
        }
        pushFieldList(TableHelper.getNavigationAvailableFieldsFromLineItem(oLineItemContext));
        pushFieldList(aApplicableProperties);
        pushFieldList(aSemanticKeys);
        pushField(TableHelper.getMessageForDraftValidation(oThis));
        pushField((_oCollectionContext$g = oCollectionContext.getObject("".concat(sTargetCollectionPath, "@Org.OData.Capabilities.V1.DeleteRestrictions"))) === null || _oCollectionContext$g === void 0 ? void 0 : (_oCollectionContext$g2 = _oCollectionContext$g.Deletable) === null || _oCollectionContext$g2 === void 0 ? void 0 : _oCollectionContext$g2.$Path);
        pushField((_oCollectionContext$g3 = oCollectionContext.getObject("".concat(sTargetCollectionPath, "@Org.OData.Capabilities.V1.UpdateRestrictions"))) === null || _oCollectionContext$g3 === void 0 ? void 0 : (_oCollectionContext$g4 = _oCollectionContext$g3.Updatable) === null || _oCollectionContext$g4 === void 0 ? void 0 : _oCollectionContext$g4.$Path);
      }
      return aSelectedFields.join(",");
    },
    /**
     * Method to get column's width if defined from manifest/customisation by annotations.
     *
     * There are issues when the cell in the column is a measure and has a UoM or currency associated to it
     * In edit mode this results in two fields and that doesn't work very well for the cell and the fields get cut.
     * So we are currently hardcoding width in several cases in edit mode where there are problems.
     *
     *
     * @function
     * @name getColumnWidth
     * @param oThis The instance of the inner model of the table building block
     * @param oColumn Defined width of the column, which is taken with priority if not null, undefined or empty
     * @param oAnnotations Annotations of the field
     * @param sDataFieldType Type of the field
     * @param sFieldControl Field control value
     * @param sDataType Datatype of the field
     * @param nTargetValueVisualization Number for DataFieldForAnnotation Target Value (stars)
     * @param oDataField Data Field
     * @param sDataFieldActionText DataField's text from button
     * @param oDataModelObjectPath The data model object path
     * @param oMicroChartTitle The object containing title and description of the MicroChart
     * @returns - Column width if defined, otherwise width is set to auto
     */
    getColumnWidth: function (oThis, oColumn, oAnnotations, sDataFieldType, sFieldControl, sDataType, nTargetValueVisualization, oDataField, sDataFieldActionText, oDataModelObjectPath, oMicroChartTitle) {
      var sWidth,
        bHasTextAnnotation = false;
      if (oColumn.width) {
        return oColumn.width;
      } else if (oDataModelObjectPath.targetObject.Value && getEditMode(oDataModelObjectPath.targetObject.Value.$target, oDataModelObjectPath, false, false, oDataModelObjectPath.targetObject) === "Display") {
        bHasTextAnnotation = oAnnotations && oAnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.Text");
        if (sDataType === "Edm.Stream" && !bHasTextAnnotation && oAnnotations.hasOwnProperty("@Org.OData.Core.V1.MediaType") && oAnnotations["@Org.OData.Core.V1.MediaType"].includes("image/")) {
          sWidth = "7em";
        }
      } else if (oAnnotations && (oAnnotations.hasOwnProperty("@com.sap.vocabularies.UI.v1.IsImageURL") && oAnnotations.hasOwnProperty("@com.sap.vocabularies.UI.v1.IsImageURL") === true || oAnnotations.hasOwnProperty("@Org.OData.Core.V1.MediaType") && oAnnotations["@Org.OData.Core.V1.MediaType"].includes("image/"))) {
        sWidth = "7em";
      } else if (sDataFieldType === "com.sap.vocabularies.UI.v1.DataFieldForAction" || sDataFieldType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" || sDataFieldType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.FieldGroup") === -1) {
        var _oDataField$Target;
        var nTmpTextWidth, nTmpVisualizationWidth;
        // For FieldGroup having action buttons or visualization data points (as rating) on column.
        if (sDataFieldActionText && sDataFieldActionText.length >= oDataField.Label.length) {
          nTmpTextWidth = TableSizeHelper.getButtonWidth(sDataFieldActionText);
        } else if (oDataField) {
          nTmpTextWidth = TableSizeHelper.getButtonWidth(oDataField.Label);
        } else {
          nTmpTextWidth = TableSizeHelper.getButtonWidth(oAnnotations.Label);
        }
        if (nTargetValueVisualization) {
          //Each rating star has a width of 2em
          nTmpVisualizationWidth = nTargetValueVisualization * 2;
        }
        if (nTmpVisualizationWidth && !isNaN(nTmpVisualizationWidth) && nTmpVisualizationWidth > nTmpTextWidth) {
          sWidth = "".concat(nTmpVisualizationWidth, "em");
        } else if (sDataFieldActionText || oAnnotations && (oAnnotations.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" || oAnnotations.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction")) {
          // Add additional 2 em to avoid showing ellipsis in some cases.
          nTmpTextWidth += 2;
          sWidth = "".concat(nTmpTextWidth, "em");
        }
        if (oDataField !== null && oDataField !== void 0 && (_oDataField$Target = oDataField.Target) !== null && _oDataField$Target !== void 0 && _oDataField$Target.$AnnotationPath && oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") !== -1) {
          var chartSize;
          switch (this.getChartSize(oThis, oColumn)) {
            case "XS":
              chartSize = 5;
              break;
            case "S":
              chartSize = 5.2;
              break;
            case "M":
              chartSize = 6.3;
              break;
            case "L":
              chartSize = 7.9;
              break;
            default:
              chartSize = 6;
          }
          nTmpTextWidth += 2;
          if (!this.getShowOnlyChart(oThis, oColumn) && oMicroChartTitle && (oMicroChartTitle.Title.length || oMicroChartTitle.Description.length)) {
            var tmpText = oMicroChartTitle.Title.length > oMicroChartTitle.Description.length ? oMicroChartTitle.Title : oMicroChartTitle.Description;
            var titleSize = TableSizeHelper.getButtonWidth(tmpText) + 7;
            var tmpWidth = titleSize > nTmpTextWidth ? titleSize : nTmpTextWidth;
            sWidth = "".concat(tmpWidth, "em");
          } else if (nTmpTextWidth > chartSize) {
            sWidth = "".concat(nTmpTextWidth, "em");
          } else {
            sWidth = "".concat(chartSize, "em");
          }
        }
      }
      if (sWidth) {
        return sWidth;
      }
    },
    /**
     * Method to add a margin class at the control.
     *
     * @function
     * @name getMarginClass
     * @param oCollection Title of the DataPoint
     * @param oDataField Value of the DataPoint
     * @param sVisualization
     * @param sFieldGroupHiddenExpressions Hidden expression contained in FieldGroup
     * @returns Adjusting the margin
     */
    getMarginClass: function (oCollection, oDataField, sVisualization, sFieldGroupHiddenExpressions) {
      var sBindingExpression,
        sClass = "";
      if (JSON.stringify(oCollection[oCollection.length - 1]) == JSON.stringify(oDataField)) {
        //If rating indicator is last element in fieldgroup, then the 0.5rem margin added by sapMRI class of interactive rating indicator on top and bottom must be nullified.
        if (sVisualization == "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
          sClass = "sapUiNoMarginBottom sapUiNoMarginTop";
        }
      } else if (sVisualization === "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
        //If rating indicator is NOT the last element in fieldgroup, then to maintain the 0.5rem spacing between cogetMarginClassntrols (as per UX spec),
        //only the top margin added by sapMRI class of interactive rating indicator must be nullified.

        sClass = "sapUiNoMarginTop";
      } else {
        sClass = "sapUiTinyMarginBottom";
      }
      if (sFieldGroupHiddenExpressions && sFieldGroupHiddenExpressions !== "true" && sFieldGroupHiddenExpressions !== "false") {
        var sHiddenExpressionResult = sFieldGroupHiddenExpressions.substring(sFieldGroupHiddenExpressions.indexOf("{=") + 2, sFieldGroupHiddenExpressions.lastIndexOf("}"));
        sBindingExpression = "{= " + sHiddenExpressionResult + " ? '" + sClass + "' : " + "''" + " }";
        return sBindingExpression;
      } else {
        return sClass;
      }
    },
    getVBoxVisibility: function (oCollection, fieldGroupHiddenExpressions) {
      var bAllStatic = true;
      var bDynamicExpressionsInFields = false;
      var aHiddenPaths = [];
      for (var i = 0; i < oCollection.length; i++) {
        var hiddenAnnotationValue = oCollection[i]["@com.sap.vocabularies.UI.v1.Hidden"];
        if (hiddenAnnotationValue !== undefined && hiddenAnnotationValue !== false) {
          if (hiddenAnnotationValue !== true) {
            if (hiddenAnnotationValue.$Path) {
              aHiddenPaths.push(hiddenAnnotationValue.$Path);
              bAllStatic = false;
            } else if (typeof hiddenAnnotationValue === "object") {
              // Dynamic expression found in a field
              bDynamicExpressionsInFields = true;
              break;
            }
          } else {
            aHiddenPaths.push(hiddenAnnotationValue);
          }
        } else {
          aHiddenPaths.push(false);
        }
      }
      if (!bDynamicExpressionsInFields && aHiddenPaths.length > 0 && bAllStatic !== true) {
        var params = aHiddenPaths.map(function (hiddenPath) {
          if (typeof hiddenPath === "boolean") {
            return hiddenPath;
          } else {
            return BindingToolkit.pathInModel(hiddenPath);
          }
        });
        return BindingToolkit.compileExpression(BindingToolkit.formatResult(params, TableFormatter.getVBoxVisibility));
      } else if (bDynamicExpressionsInFields) {
        return fieldGroupHiddenExpressions;
      } else if (aHiddenPaths.length > 0 && aHiddenPaths.indexOf(false) === -1 && bAllStatic) {
        return false;
      } else {
        return true;
      }
    },
    /**
     * Method to provide hidden filters to the table.
     *
     * @function
     * @name formatHiddenFilters
     * @param oHiddenFilter The hiddenFilters via context named filters (and key hiddenFilters) passed to Macro Table
     * @returns The string representation of the hidden filters
     */
    formatHiddenFilters: function (oHiddenFilter) {
      if (oHiddenFilter) {
        try {
          return JSON.stringify(oHiddenFilter);
        } catch (ex) {
          return undefined;
        }
      }
      return undefined;
    },
    /**
     * Method to get the stable ID of the column.
     *
     * @function
     * @name getColumnStableId
     * @param sId Current object ID
     * @param oDataField Value of the DataPoint
     * @returns The stable ID for a given column
     */
    getColumnStableId: function (sId, oDataField) {
      return sId ? generate([sId, "C", oDataField.Target && oDataField.Target.$AnnotationPath || oDataField.Value && oDataField.Value.$Path || (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" ? oDataField : "")]) : undefined;
    },
    getFieldGroupLabelStableId: function (sId, oDataField) {
      return sId ? generate([sId, "FGLabel", oDataField.Target && oDataField.Target.$AnnotationPath || oDataField.Value && oDataField.Value.$Path || (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" ? oDataField : "")]) : undefined;
    },
    /**
     * Method filters out properties which do not belong to the collection.
     *
     * @param aPropertyPaths The array of properties to be checked.
     * @param oCollectionContext The collection context to be used.
     * @returns The array of applicable properties.
     * @private
     */
    _filterNonApplicableProperties: function (aPropertyPaths, oCollectionContext) {
      return aPropertyPaths && aPropertyPaths.filter(function (sPropertyPath) {
        return oCollectionContext.getObject("./".concat(sPropertyPath));
      });
    },
    /**
     * Method to generate the binding information for a table row.
     *
     * @param oThis The instance of the inner model of the table building block
     * @returns - Returns the binding information of a table row
     */
    getRowsBindingInfo: function (oThis) {
      var dataModelPath = getInvolvedDataModelObjects(oThis.collection, oThis.contextPath);
      var path = getContextRelativeTargetObjectPath(dataModelPath) || getTargetObjectPath(dataModelPath);
      var oRowBinding = {
        ui5object: true,
        suspended: false,
        path: CommonHelper.addSingleQuotes(path),
        parameters: {
          $count: true
        },
        events: {}
      };
      if (!oThis.tableDefinition.getObject("enableAnalytics")) {
        // Don't add $select parameter in case of an analytical query, this isn't supported by the model
        var sSelect = TableHelper.create$Select(oThis);
        if (sSelect) {
          oRowBinding.parameters.$select = "'".concat(sSelect, "'");
        }

        // we later ensure in the delegate only one list binding for a given targetCollectionPath has the flag $$getKeepAliveContext
        oRowBinding.parameters.$$getKeepAliveContext = true;
      }
      oRowBinding.parameters.$$groupId = CommonHelper.addSingleQuotes("$auto.Workers");
      oRowBinding.parameters.$$updateGroupId = CommonHelper.addSingleQuotes("$auto");
      oRowBinding.parameters.$$ownRequest = true;
      oRowBinding.parameters.$$patchWithoutSideEffects = true;
      oRowBinding.events.patchSent = CommonHelper.addSingleQuotes(".editFlow.handlePatchSent");
      oRowBinding.events.dataReceived = CommonHelper.addSingleQuotes("API.onInternalDataReceived");
      oRowBinding.events.dataRequested = CommonHelper.addSingleQuotes("API.onInternalDataRequested");
      // recreate an empty row when one is activated
      oRowBinding.events.createActivate = CommonHelper.addSingleQuotes(".editFlow.handleCreateActivate");
      if (oThis.onContextChange !== undefined && oThis.onContextChange !== null) {
        oRowBinding.events.change = CommonHelper.addSingleQuotes(oThis.onContextChange);
      }
      return CommonHelper.objectToString(oRowBinding);
    },
    /**
     * Method to check the validity of the fields in the creation row.
     *
     * @function
     * @name validateCreationRowFields
     * @param oFieldValidityObject Current Object holding the fields
     * @returns `true` if all the fields in the creation row are valid, `false` otherwise
     */
    validateCreationRowFields: function (oFieldValidityObject) {
      if (!oFieldValidityObject) {
        return false;
      }
      return Object.keys(oFieldValidityObject).length > 0 && Object.keys(oFieldValidityObject).every(function (key) {
        return oFieldValidityObject[key]["validity"];
      });
    },
    /**
     * Method to get the expression for the 'press' event for the DataFieldForActionButton.
     *
     * @function
     * @name pressEventDataFieldForActionButton
     * @param oThis Current object
     * @param oDataField Value of the DataPoint
     * @param sEntitySetName Name of the EntitySet
     * @param sOperationAvailableMap OperationAvailableMap as stringified JSON object
     * @param oActionContext Action object
     * @param bIsNavigable Action either triggers navigation or not
     * @param bEnableAutoScroll Action either triggers scrolling to the newly created items in the related table or not
     * @param sDefaultValuesExtensionFunction Function name to prefill dialog parameters
     * @returns The binding expression
     */
    pressEventDataFieldForActionButton: function (oThis, oDataField, sEntitySetName, sOperationAvailableMap, oActionContext, bIsNavigable, bEnableAutoScroll, sDefaultValuesExtensionFunction) {
      var sActionName = oDataField.Action,
        sAnnotationTargetEntityType = oThis && oThis.collection.getObject("$Type"),
        bStaticAction = this._isStaticAction(oActionContext, sActionName) || this._isActionOverloadOnDifferentType(sActionName, sAnnotationTargetEntityType),
        oParams = {
          contexts: !bStaticAction ? "${internal>selectedContexts}" : null,
          bStaticAction: bStaticAction ? bStaticAction : undefined,
          entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
          applicableContext: !bStaticAction ? "${internal>dynamicActions/" + oDataField.Action + "/aApplicable/}" : null,
          notApplicableContext: !bStaticAction ? "${internal>dynamicActions/" + oDataField.Action + "/aNotApplicable/}" : null,
          isNavigable: bIsNavigable,
          enableAutoScroll: bEnableAutoScroll,
          defaultValuesExtensionFunction: sDefaultValuesExtensionFunction ? "'" + sDefaultValuesExtensionFunction + "'" : undefined
        };
      return ActionHelper.getPressEventDataFieldForActionButton(oThis.id, oDataField, oParams, sOperationAvailableMap);
    },
    /**
     * Method to determine the binding expression for 'enabled' property of DataFieldForAction and DataFieldForIBN actions.
     *
     * @function
     * @name isDataFieldForActionEnabled
     * @param oThis The instance of the table control
     * @param oDataField The value of the data field
     * @param oRequiresContext RequiresContext for IBN
     * @param bIsDataFieldForIBN Flag for IBN
     * @param oActionContext The instance of the action
     * @param vActionEnabled Status of action (single or multiselect)
     * @returns A binding expression to define the 'enabled' property of the action
     */
    isDataFieldForActionEnabled: function (oThis, oDataField, oRequiresContext, bIsDataFieldForIBN, oActionContext, vActionEnabled) {
      var sActionName = oDataField.Action,
        sAnnotationTargetEntityType = oThis && oThis.collection.getObject("$Type"),
        oTableDefinition = oThis && oThis.tableDefinition && oThis.tableDefinition.getObject(),
        bStaticAction = this._isStaticAction(oActionContext, sActionName),
        isAnalyticalTable = oTableDefinition && oTableDefinition.enableAnalytics;

      // Check for action overload on a different Entity type.
      // If yes, table row selection is not required to enable this action.
      if (!bIsDataFieldForIBN && this._isActionOverloadOnDifferentType(sActionName, sAnnotationTargetEntityType)) {
        // Action overload defined on different entity type
        var oOperationAvailableMap = oTableDefinition && JSON.parse(oTableDefinition.operationAvailableMap);
        if (oOperationAvailableMap && oOperationAvailableMap.hasOwnProperty(sActionName)) {
          // Core.OperationAvailable annotation defined for the action.
          // Need to refer to internal model for enabled property of the dynamic action.
          // return compileBinding(bindingExpression("dynamicActions/" + sActionName + "/bEnabled", "internal"), true);
          return "{= ${internal>dynamicActions/" + sActionName + "/bEnabled} }";
        }
        // Consider the action just like any other static DataFieldForAction.
        return true;
      }
      if (!oRequiresContext || bStaticAction) {
        if (bIsDataFieldForIBN) {
          var sEntitySet = oThis.collection.getPath();
          var oMetaModel = oThis.collection.getModel();
          if (vActionEnabled === "false" && !isAnalyticalTable) {
            Log.warning("NavigationAvailable as false is incorrect usage");
            return false;
          } else if (!isAnalyticalTable && oDataField && oDataField.NavigationAvailable && oDataField.NavigationAvailable.$Path && oMetaModel.getObject(sEntitySet + "/$Partner") === oDataField.NavigationAvailable.$Path.split("/")[0]) {
            return "{= ${" + vActionEnabled.substr(vActionEnabled.indexOf("/") + 1, vActionEnabled.length) + "}";
          } else {
            return true;
          }
        }
        return true;
      }
      var sDataFieldForActionEnabledExpression = "",
        sNumberOfSelectedContexts,
        sAction;
      if (bIsDataFieldForIBN) {
        if (vActionEnabled === "true" || isAnalyticalTable) {
          sDataFieldForActionEnabledExpression = "%{internal>numberOfSelectedContexts} >= 1";
        } else if (vActionEnabled === "false") {
          Log.warning("NavigationAvailable as false is incorrect usage");
          return false;
        } else {
          sNumberOfSelectedContexts = "%{internal>numberOfSelectedContexts} >= 1";
          sAction = "${internal>ibn/" + oDataField.SemanticObject + "-" + oDataField.Action + "/bEnabled" + "}";
          sDataFieldForActionEnabledExpression = sNumberOfSelectedContexts + " && " + sAction;
        }
      } else {
        sNumberOfSelectedContexts = ActionHelper.getNumberOfContextsExpression(vActionEnabled);
        sAction = "${internal>dynamicActions/" + oDataField.Action + "/bEnabled" + "}";
        sDataFieldForActionEnabledExpression = sNumberOfSelectedContexts + " && " + sAction;
      }
      return "{= " + sDataFieldForActionEnabledExpression + "}";
    },
    /**
     * Method to get press event expression for CreateButton.
     *
     * @function
     * @name pressEventForCreateButton
     * @param oThis Current Object
     * @param bCmdExecutionFlag Flag to indicate that the function is called from CMD Execution
     * @returns The binding expression for the press event of the create button
     */
    pressEventForCreateButton: function (oThis, bCmdExecutionFlag) {
      var sCreationMode = oThis.creationMode;
      var oParams;
      var sMdcTable = bCmdExecutionFlag ? "${$source>}.getParent()" : "${$source>}.getParent().getParent().getParent()";
      var sRowBinding = sMdcTable + ".getRowBinding() || " + sMdcTable + ".data('rowsBindingInfo').path";
      switch (sCreationMode) {
        case CreationMode.External:
          // navigate to external target for creating new entries
          // TODO: Add required parameters
          oParams = {
            creationMode: CommonHelper.addSingleQuotes(CreationMode.External),
            outbound: CommonHelper.addSingleQuotes(oThis.createOutbound)
          };
          break;
        case CreationMode.CreationRow:
          oParams = {
            creationMode: CommonHelper.addSingleQuotes(CreationMode.CreationRow),
            creationRow: "${$source>}",
            createAtEnd: oThis.createAtEnd !== undefined ? oThis.createAtEnd : false
          };
          sRowBinding = "${$source>}.getParent()._getRowBinding()";
          break;
        case CreationMode.NewPage:
        case CreationMode.Inline:
          oParams = {
            creationMode: CommonHelper.addSingleQuotes(sCreationMode),
            createAtEnd: oThis.createAtEnd !== undefined ? oThis.createAtEnd : false,
            tableId: CommonHelper.addSingleQuotes(oThis.id)
          };
          if (oThis.createNewAction) {
            oParams.newAction = CommonHelper.addSingleQuotes(oThis.createNewAction);
          }
          break;
        case CreationMode.InlineCreationRows:
          return CommonHelper.generateFunction("._editFlow.scrollAndFocusOnInactiveRow", sMdcTable);
        default:
          // unsupported
          return undefined;
      }
      return CommonHelper.generateFunction(".editFlow.createDocument", sRowBinding, CommonHelper.objectToString(oParams));
    },
    getIBNData: function (oThis) {
      var outboundDetail = oThis.createOutboundDetail;
      if (outboundDetail) {
        var oIBNData = {
          semanticObject: CommonHelper.addSingleQuotes(outboundDetail.semanticObject),
          action: CommonHelper.addSingleQuotes(outboundDetail.action)
        };
        return CommonHelper.objectToString(oIBNData);
      }
    },
    /**
     * Method to get press event expression for 'Delete' button.
     *
     * @function
     * @name pressEventForDeleteButton
     * @param oThis Current Object
     * @param sEntitySetName EntitySet name
     * @param oHeaderInfo Header Info
     * @param fullcontextPath Context Path
     * @returns The binding expression for the press event of the 'Delete' button
     */
    pressEventForDeleteButton: function (oThis, sEntitySetName, oHeaderInfo, fullcontextPath) {
      var sDeletableContexts = "${internal>deletableContexts}";
      var sTitle, titleValueExpression, sTitleExpression, sDescription, descriptionExpression, sDescriptionExpression;
      if (oHeaderInfo !== null && oHeaderInfo !== void 0 && oHeaderInfo.Title) {
        if (typeof oHeaderInfo.Title.Value === "string") {
          sTitleExpression = CommonHelper.addSingleQuotes(oHeaderInfo.Title.Value);
        } else {
          var _oHeaderInfo$Title;
          sTitle = BindingToolkit.getExpressionFromAnnotation(oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title = oHeaderInfo.Title) === null || _oHeaderInfo$Title === void 0 ? void 0 : _oHeaderInfo$Title.Value);
          if (BindingToolkit.isConstant(sTitle) || BindingToolkit.isPathInModelExpression(sTitle)) {
            titleValueExpression = formatValueRecursively(sTitle, fullcontextPath);
            sTitleExpression = BindingToolkit.compileExpression(titleValueExpression);
          }
        }
      }
      if (oHeaderInfo !== null && oHeaderInfo !== void 0 && oHeaderInfo.Description) {
        if (typeof oHeaderInfo.Description.Value === "string") {
          sDescriptionExpression = CommonHelper.addSingleQuotes(oHeaderInfo.Description.Value);
        } else {
          var _oHeaderInfo$Descript;
          sDescription = BindingToolkit.getExpressionFromAnnotation(oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Descript = oHeaderInfo.Description) === null || _oHeaderInfo$Descript === void 0 ? void 0 : _oHeaderInfo$Descript.Value);
          if (BindingToolkit.isConstant(sDescription) || BindingToolkit.isPathInModelExpression(sDescription)) {
            descriptionExpression = formatValueRecursively(sDescription, fullcontextPath);
            sDescriptionExpression = BindingToolkit.compileExpression(descriptionExpression);
          }
        }
      }
      var oParams = {
        id: CommonHelper.addSingleQuotes(oThis.id),
        entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
        numberOfSelectedContexts: "${internal>selectedContexts}.length",
        unSavedContexts: "${internal>unSavedContexts}",
        lockedContexts: "${internal>lockedContexts}",
        controlId: "${internal>controlId}",
        title: sTitleExpression,
        description: sDescriptionExpression
      };
      return CommonHelper.generateFunction(".editFlow.deleteMultipleDocuments", sDeletableContexts, CommonHelper.objectToString(oParams));
    },
    /**
     * Method to handle the 'enable' and 'disable' state of the table's 'Delete' button if this information is requested in the side effects.
     *
     * @function
     * @name handleTableDeleteEnablementForSideEffects
     * @param oTable Table instance
     * @param oInternalModelContext The internal model context
     */
    handleTableDeleteEnablementForSideEffects: function (oTable, oInternalModelContext) {
      if (oTable && oInternalModelContext) {
        var sDeletablePath = TableHelper.getDeletablePathForTable(oTable),
          aSelectedContexts = oTable.getSelectedContexts(),
          aDeletableContexts = [];
        oInternalModelContext.setProperty("deleteEnabled", false);
        for (var i = 0; i < aSelectedContexts.length; i++) {
          if (typeof sDeletablePath === "string" && sDeletablePath !== undefined) {
            var oSelectedContext = aSelectedContexts[i];
            if (oSelectedContext && oSelectedContext.getProperty(sDeletablePath)) {
              oInternalModelContext.setProperty("deleteEnabled", true);
              aDeletableContexts.push(oSelectedContext);
            }
          }
        }
        oInternalModelContext.setProperty("deletableContexts", aDeletableContexts);
      }
    },
    /**
     * Method to get the delete restricitions Path associated.
     *
     * @function
     * @name getDeletablePathForTable
     * @param table Table instance
     * @returns Path associated with delete's enable and disable
     */
    getDeletablePathForTable: function (table) {
      var deletablePath;
      var rowBinding = table.getRowBinding();
      if (rowBinding) {
        var _rowBinding$getContex, _metaModel$getObject2;
        var metaModel = table.getModel().getMetaModel();
        var path = rowBinding.getPath();
        var contextPath = (_rowBinding$getContex = rowBinding.getContext()) === null || _rowBinding$getContex === void 0 ? void 0 : _rowBinding$getContex.getPath();
        if (contextPath) {
          var _metaModel$getObject, _metaModel$getObject$;
          var metaPath = metaModel.getMetaPath(contextPath);
          var navigationPropertyPath = (_metaModel$getObject = metaModel.getObject(metaPath)) === null || _metaModel$getObject === void 0 ? void 0 : (_metaModel$getObject$ = _metaModel$getObject["$NavigationPropertyBinding"]) === null || _metaModel$getObject$ === void 0 ? void 0 : _metaModel$getObject$[path];
          if (navigationPropertyPath !== undefined) {
            path = "/".concat(navigationPropertyPath);
          }
        }
        deletablePath = (_metaModel$getObject2 = metaModel.getObject("".concat(path, "@Org.OData.Capabilities.V1.DeleteRestrictions/Deletable"))) === null || _metaModel$getObject2 === void 0 ? void 0 : _metaModel$getObject2.$Path;
      }
      return deletablePath;
    },
    /**
     * Method to set visibility of column header label.
     *
     * @function
     * @name setHeaderLabelVisibility
     * @param datafield DataField
     * @param dataFieldCollection List of items inside a fieldgroup (if any)
     * @returns `true` if the header label needs to be visible else false.
     */
    setHeaderLabelVisibility: function (datafield, dataFieldCollection) {
      // If Inline button/navigation action, return false, else true;
      if (!dataFieldCollection) {
        if (datafield.$Type.indexOf("DataFieldForAction") > -1 && datafield.Inline) {
          return false;
        }
        if (datafield.$Type.indexOf("DataFieldForIntentBasedNavigation") > -1 && datafield.Inline) {
          return false;
        }
        return true;
      }

      // In Fieldgroup, If NOT all datafield/datafieldForAnnotation exists with hidden, return true;
      return dataFieldCollection.some(function (oDC) {
        if ((oDC.$Type === "com.sap.vocabularies.UI.v1.DataField" || oDC.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") && oDC["@com.sap.vocabularies.UI.v1.Hidden"] !== true) {
          return true;
        }
      });
    },
    /**
     * Method to get Target Value (# of stars) from Visualization Rating.
     *
     * @function
     * @name getValueOnRatingField
     * @param oDataField DataPoint's Value
     * @param oContext Context object of the LineItem
     * @returns The number for DataFieldForAnnotation Target Value
     */
    getValueOnRatingField: function (oDataField, oContext) {
      // for FieldGroup containing visualizationTypeRating
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
        // For a data field having Rating as visualization type
        if (oContext.context.getObject("Target/$AnnotationPath").indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 && oContext.context.getObject("Target/$AnnotationPath/$Type") == "com.sap.vocabularies.UI.v1.DataPointType" && oContext.context.getObject("Target/$AnnotationPath/Visualization/$EnumMember") == "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
          return oContext.context.getObject("Target/$AnnotationPath/TargetValue");
        }
        // for FieldGroup having Rating as visualization type in any of the data fields
        if (oContext.context.getObject("Target/$AnnotationPath").indexOf("@com.sap.vocabularies.UI.v1.FieldGroup") > -1) {
          var sPathDataFields = "Target/$AnnotationPath/Data/";
          for (var i in oContext.context.getObject(sPathDataFields)) {
            if (oContext.context.getObject("".concat(sPathDataFields + i, "/$Type")) === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && oContext.context.getObject("".concat(sPathDataFields + i, "/Target/$AnnotationPath")).indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 && oContext.context.getObject("".concat(sPathDataFields + i, "/Target/$AnnotationPath/$Type")) == "com.sap.vocabularies.UI.v1.DataPointType" && oContext.context.getObject("".concat(sPathDataFields + i, "/Target/$AnnotationPath/Visualization/$EnumMember")) == "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
              return oContext.context.getObject("".concat(sPathDataFields + i, "/Target/$AnnotationPath/TargetValue"));
            }
          }
        }
      }
    },
    /**
     * Method to get Text from DataFieldForAnnotation into Column.
     *
     * @function
     * @name getTextOnActionField
     * @param oDataField DataPoint's Value
     * @param oContext Context object of the LineItem
     * @returns String from label referring to action text
     */
    getTextOnActionField: function (oDataField, oContext) {
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
        return oDataField.Label;
      }
      // for FieldGroup containing DataFieldForAnnotation
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && oContext.context.getObject("Target/$AnnotationPath").indexOf("@com.sap.vocabularies.UI.v1.FieldGroup") > -1) {
        var sPathDataFields = "Target/$AnnotationPath/Data/";
        var aMultipleLabels = [];
        for (var i in oContext.context.getObject(sPathDataFields)) {
          if (oContext.context.getObject("".concat(sPathDataFields + i, "/$Type")) === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oContext.context.getObject("".concat(sPathDataFields + i, "/$Type")) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
            aMultipleLabels.push(oContext.context.getObject("".concat(sPathDataFields + i, "/Label")));
          }
        }
        // In case there are multiple actions inside a Field Group select the largest Action Label
        if (aMultipleLabels.length > 1) {
          return aMultipleLabels.reduce(function (a, b) {
            return a.length > b.length ? a : b;
          });
        } else {
          return aMultipleLabels.length === 0 ? undefined : aMultipleLabels.toString();
        }
      }
    },
    _getResponsiveTableColumnSettings: function (oThis, oColumn) {
      if (oThis.tableType === "ResponsiveTable") {
        return oColumn.settings;
      }
      return null;
    },
    getChartSize: function (oThis, oColumn) {
      var settings = this._getResponsiveTableColumnSettings(oThis, oColumn);
      if (settings && settings.microChartSize) {
        return settings.microChartSize;
      }
      return "XS";
    },
    getShowOnlyChart: function (oThis, oColumn) {
      var settings = this._getResponsiveTableColumnSettings(oThis, oColumn);
      if (settings && settings.showMicroChartLabel) {
        return !settings.showMicroChartLabel;
      }
      return true;
    },
    getDelegate: function (bEnableAnalytics, bHasMultiVisualizations, sEntityName) {
      var oDelegate;
      if (bHasMultiVisualizations === "true") {
        oDelegate = {
          name: bEnableAnalytics ? "sap/fe/macros/table/delegates/AnalyticalALPTableDelegate" : "sap/fe/macros/table/delegates/ALPTableDelegate",
          payload: {
            collectionName: sEntityName
          }
        };
      } else {
        oDelegate = {
          name: bEnableAnalytics ? "sap/fe/macros/table/delegates/AnalyticalTableDelegate" : "sap/fe/macros/table/delegates/TableDelegate"
        };
      }
      return JSON.stringify(oDelegate);
    },
    setIBNEnablement: function (oInternalModelContext, oNavigationAvailableMap, aSelectedContexts) {
      for (var sKey in oNavigationAvailableMap) {
        oInternalModelContext.setProperty("ibn/".concat(sKey), {
          bEnabled: false,
          aApplicable: [],
          aNotApplicable: []
        });
        var aApplicable = [],
          aNotApplicable = [];
        var sProperty = oNavigationAvailableMap[sKey];
        for (var i = 0; i < aSelectedContexts.length; i++) {
          var oSelectedContext = aSelectedContexts[i];
          if (oSelectedContext.getObject(sProperty)) {
            oInternalModelContext.getModel().setProperty("".concat(oInternalModelContext.getPath(), "/ibn/").concat(sKey, "/bEnabled"), true);
            aApplicable.push(oSelectedContext);
          } else {
            aNotApplicable.push(oSelectedContext);
          }
        }
        oInternalModelContext.getModel().setProperty("".concat(oInternalModelContext.getPath(), "/ibn/").concat(sKey, "/aApplicable"), aApplicable);
        oInternalModelContext.getModel().setProperty("".concat(oInternalModelContext.getPath(), "/ibn/").concat(sKey, "/aNotApplicable"), aNotApplicable);
      }
    }
  };
  TableHelper.getNavigationAvailableMap.requiresIContext = true;
  TableHelper.getValueOnRatingField.requiresIContext = true;
  TableHelper.getTextOnActionField.requiresIContext = true;
  return TableHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDcmVhdGlvbk1vZGUiLCJGRUxpYnJhcnkiLCJUYWJsZUhlbHBlciIsIl9pc1N0YXRpY0FjdGlvbiIsIm9BY3Rpb25Db250ZXh0Iiwic0FjdGlvbk5hbWUiLCJvQWN0aW9uIiwiQXJyYXkiLCJpc0FycmF5Iiwic0VudGl0eVR5cGUiLCJfZ2V0QWN0aW9uT3ZlcmxvYWRFbnRpdHlUeXBlIiwiZmluZCIsImFjdGlvbiIsIiRJc0JvdW5kIiwiJFBhcmFtZXRlciIsIiRUeXBlIiwiJGlzQ29sbGVjdGlvbiIsImluZGV4T2YiLCJhUGFydHMiLCJzcGxpdCIsImxlbmd0aCIsInJlcGxhY2VBbGwiLCJ1bmRlZmluZWQiLCJfaXNBY3Rpb25PdmVybG9hZE9uRGlmZmVyZW50VHlwZSIsInNBbm5vdGF0aW9uVGFyZ2V0RW50aXR5VHlwZSIsImdldE1lc3NhZ2VGb3JEcmFmdFZhbGlkYXRpb24iLCJvVGhpcyIsIm9Db2xsZWN0aW9uQW5ub3RhdGlvbnMiLCJjb2xsZWN0aW9uIiwiZ2V0T2JqZWN0Iiwic01lc3NhZ2VQYXRoIiwiJFBhdGgiLCJ0YWJsZURlZmluaXRpb24iLCJnZXRQcm9wZXJ0eSIsIlRlbXBsYXRlVHlwZSIsIk9iamVjdFBhZ2UiLCJPYmplY3QiLCJrZXlzIiwic0tleSIsIm9Bbm5vdGF0aW9uIiwiU291cmNlUHJvcGVydGllcyIsIlNvdXJjZUVudGl0aWVzIiwiVGFyZ2V0UHJvcGVydGllcyIsImdldEZpZWxkc1JlcXVlc3RlZEJ5UHJlc2VudGF0aW9uVmFyaWFudCIsIm9QcmVzZW50YXRpb25WYXJpYW50IiwiUmVxdWVzdEF0TGVhc3QiLCJtYXAiLCJvUmVxdWVzdGVkIiwidmFsdWUiLCJnZXROYXZpZ2F0aW9uQXZhaWxhYmxlRmllbGRzRnJvbUxpbmVJdGVtIiwiYUxpbmVJdGVtQ29udGV4dCIsImFTZWxlY3RlZEZpZWxkc0FycmF5IiwiZm9yRWFjaCIsIm9SZWNvcmQiLCJJbmxpbmUiLCJEZXRlcm1pbmluZyIsIk5hdmlnYXRpb25BdmFpbGFibGUiLCJwdXNoIiwiZ2V0TmF2aWdhdGlvbkF2YWlsYWJsZU1hcCIsImFMaW5lSXRlbUNvbGxlY3Rpb24iLCJvSUJOTmF2aWdhdGlvbkF2YWlsYWJsZU1hcCIsIlNlbWFudGljT2JqZWN0IiwiQWN0aW9uIiwiUmVxdWlyZXNDb250ZXh0IiwiSlNPTiIsInN0cmluZ2lmeSIsImdldFVpTGluZUl0ZW0iLCJvUHJlc2VudGF0aW9uQ29udGV4dCIsImdldFVpQ29udHJvbCIsImNyZWF0ZSRTZWxlY3QiLCJvQ29sbGVjdGlvbkNvbnRleHQiLCJhU2VsZWN0ZWRGaWVsZHMiLCJvTGluZUl0ZW1Db250ZXh0IiwibWV0YVBhdGgiLCJzVGFyZ2V0Q29sbGVjdGlvblBhdGgiLCJDb21tb25IZWxwZXIiLCJnZXRUYXJnZXRDb2xsZWN0aW9uIiwicHVzaEZpZWxkIiwic0ZpZWxkIiwiaW5jbHVkZXMiLCJwdXNoRmllbGRMaXN0IiwiYUZpZWxkcyIsImdldFBhdGgiLCJvUHJlc2VudGF0aW9uQW5ub3RhdGlvbiIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyIsInRhcmdldE9iamVjdCIsImFPcGVyYXRpb25BdmFpbGFibGVQcm9wZXJ0aWVzIiwiYUFwcGxpY2FibGVQcm9wZXJ0aWVzIiwiX2ZpbHRlck5vbkFwcGxpY2FibGVQcm9wZXJ0aWVzIiwiYVNlbWFudGljS2V5cyIsIm9TZW1hbnRpY0tleSIsIiRQcm9wZXJ0eVBhdGgiLCJEZWxldGFibGUiLCJVcGRhdGFibGUiLCJqb2luIiwiZ2V0Q29sdW1uV2lkdGgiLCJvQ29sdW1uIiwib0Fubm90YXRpb25zIiwic0RhdGFGaWVsZFR5cGUiLCJzRmllbGRDb250cm9sIiwic0RhdGFUeXBlIiwiblRhcmdldFZhbHVlVmlzdWFsaXphdGlvbiIsIm9EYXRhRmllbGQiLCJzRGF0YUZpZWxkQWN0aW9uVGV4dCIsIm9EYXRhTW9kZWxPYmplY3RQYXRoIiwib01pY3JvQ2hhcnRUaXRsZSIsInNXaWR0aCIsImJIYXNUZXh0QW5ub3RhdGlvbiIsIndpZHRoIiwiVmFsdWUiLCJnZXRFZGl0TW9kZSIsIiR0YXJnZXQiLCJoYXNPd25Qcm9wZXJ0eSIsIlRhcmdldCIsIiRBbm5vdGF0aW9uUGF0aCIsIm5UbXBUZXh0V2lkdGgiLCJuVG1wVmlzdWFsaXphdGlvbldpZHRoIiwiTGFiZWwiLCJUYWJsZVNpemVIZWxwZXIiLCJnZXRCdXR0b25XaWR0aCIsImlzTmFOIiwiY2hhcnRTaXplIiwiZ2V0Q2hhcnRTaXplIiwiZ2V0U2hvd09ubHlDaGFydCIsIlRpdGxlIiwiRGVzY3JpcHRpb24iLCJ0bXBUZXh0IiwidGl0bGVTaXplIiwidG1wV2lkdGgiLCJnZXRNYXJnaW5DbGFzcyIsIm9Db2xsZWN0aW9uIiwic1Zpc3VhbGl6YXRpb24iLCJzRmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zIiwic0JpbmRpbmdFeHByZXNzaW9uIiwic0NsYXNzIiwic0hpZGRlbkV4cHJlc3Npb25SZXN1bHQiLCJzdWJzdHJpbmciLCJsYXN0SW5kZXhPZiIsImdldFZCb3hWaXNpYmlsaXR5IiwiZmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zIiwiYkFsbFN0YXRpYyIsImJEeW5hbWljRXhwcmVzc2lvbnNJbkZpZWxkcyIsImFIaWRkZW5QYXRocyIsImkiLCJoaWRkZW5Bbm5vdGF0aW9uVmFsdWUiLCJwYXJhbXMiLCJoaWRkZW5QYXRoIiwiQmluZGluZ1Rvb2xraXQiLCJwYXRoSW5Nb2RlbCIsImNvbXBpbGVFeHByZXNzaW9uIiwiZm9ybWF0UmVzdWx0IiwiVGFibGVGb3JtYXR0ZXIiLCJmb3JtYXRIaWRkZW5GaWx0ZXJzIiwib0hpZGRlbkZpbHRlciIsImV4IiwiZ2V0Q29sdW1uU3RhYmxlSWQiLCJzSWQiLCJnZW5lcmF0ZSIsImdldEZpZWxkR3JvdXBMYWJlbFN0YWJsZUlkIiwiYVByb3BlcnR5UGF0aHMiLCJmaWx0ZXIiLCJzUHJvcGVydHlQYXRoIiwiZ2V0Um93c0JpbmRpbmdJbmZvIiwiZGF0YU1vZGVsUGF0aCIsImNvbnRleHRQYXRoIiwicGF0aCIsImdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgiLCJnZXRUYXJnZXRPYmplY3RQYXRoIiwib1Jvd0JpbmRpbmciLCJ1aTVvYmplY3QiLCJzdXNwZW5kZWQiLCJhZGRTaW5nbGVRdW90ZXMiLCJwYXJhbWV0ZXJzIiwiJGNvdW50IiwiZXZlbnRzIiwic1NlbGVjdCIsIiRzZWxlY3QiLCIkJGdldEtlZXBBbGl2ZUNvbnRleHQiLCIkJGdyb3VwSWQiLCIkJHVwZGF0ZUdyb3VwSWQiLCIkJG93blJlcXVlc3QiLCIkJHBhdGNoV2l0aG91dFNpZGVFZmZlY3RzIiwicGF0Y2hTZW50IiwiZGF0YVJlY2VpdmVkIiwiZGF0YVJlcXVlc3RlZCIsImNyZWF0ZUFjdGl2YXRlIiwib25Db250ZXh0Q2hhbmdlIiwiY2hhbmdlIiwib2JqZWN0VG9TdHJpbmciLCJ2YWxpZGF0ZUNyZWF0aW9uUm93RmllbGRzIiwib0ZpZWxkVmFsaWRpdHlPYmplY3QiLCJldmVyeSIsImtleSIsInByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24iLCJzRW50aXR5U2V0TmFtZSIsInNPcGVyYXRpb25BdmFpbGFibGVNYXAiLCJiSXNOYXZpZ2FibGUiLCJiRW5hYmxlQXV0b1Njcm9sbCIsInNEZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24iLCJiU3RhdGljQWN0aW9uIiwib1BhcmFtcyIsImNvbnRleHRzIiwiZW50aXR5U2V0TmFtZSIsImFwcGxpY2FibGVDb250ZXh0Iiwibm90QXBwbGljYWJsZUNvbnRleHQiLCJpc05hdmlnYWJsZSIsImVuYWJsZUF1dG9TY3JvbGwiLCJkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb24iLCJBY3Rpb25IZWxwZXIiLCJnZXRQcmVzc0V2ZW50RGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uIiwiaWQiLCJpc0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWQiLCJvUmVxdWlyZXNDb250ZXh0IiwiYklzRGF0YUZpZWxkRm9ySUJOIiwidkFjdGlvbkVuYWJsZWQiLCJvVGFibGVEZWZpbml0aW9uIiwiaXNBbmFseXRpY2FsVGFibGUiLCJlbmFibGVBbmFseXRpY3MiLCJvT3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwicGFyc2UiLCJvcGVyYXRpb25BdmFpbGFibGVNYXAiLCJzRW50aXR5U2V0Iiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiTG9nIiwid2FybmluZyIsInN1YnN0ciIsInNEYXRhRmllbGRGb3JBY3Rpb25FbmFibGVkRXhwcmVzc2lvbiIsInNOdW1iZXJPZlNlbGVjdGVkQ29udGV4dHMiLCJzQWN0aW9uIiwiZ2V0TnVtYmVyT2ZDb250ZXh0c0V4cHJlc3Npb24iLCJwcmVzc0V2ZW50Rm9yQ3JlYXRlQnV0dG9uIiwiYkNtZEV4ZWN1dGlvbkZsYWciLCJzQ3JlYXRpb25Nb2RlIiwiY3JlYXRpb25Nb2RlIiwic01kY1RhYmxlIiwic1Jvd0JpbmRpbmciLCJFeHRlcm5hbCIsIm91dGJvdW5kIiwiY3JlYXRlT3V0Ym91bmQiLCJDcmVhdGlvblJvdyIsImNyZWF0aW9uUm93IiwiY3JlYXRlQXRFbmQiLCJOZXdQYWdlIiwidGFibGVJZCIsImNyZWF0ZU5ld0FjdGlvbiIsIm5ld0FjdGlvbiIsIklubGluZUNyZWF0aW9uUm93cyIsImdlbmVyYXRlRnVuY3Rpb24iLCJnZXRJQk5EYXRhIiwib3V0Ym91bmREZXRhaWwiLCJjcmVhdGVPdXRib3VuZERldGFpbCIsIm9JQk5EYXRhIiwic2VtYW50aWNPYmplY3QiLCJwcmVzc0V2ZW50Rm9yRGVsZXRlQnV0dG9uIiwib0hlYWRlckluZm8iLCJmdWxsY29udGV4dFBhdGgiLCJzRGVsZXRhYmxlQ29udGV4dHMiLCJzVGl0bGUiLCJ0aXRsZVZhbHVlRXhwcmVzc2lvbiIsInNUaXRsZUV4cHJlc3Npb24iLCJzRGVzY3JpcHRpb24iLCJkZXNjcmlwdGlvbkV4cHJlc3Npb24iLCJzRGVzY3JpcHRpb25FeHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwiaXNDb25zdGFudCIsImlzUGF0aEluTW9kZWxFeHByZXNzaW9uIiwiZm9ybWF0VmFsdWVSZWN1cnNpdmVseSIsIm51bWJlck9mU2VsZWN0ZWRDb250ZXh0cyIsInVuU2F2ZWRDb250ZXh0cyIsImxvY2tlZENvbnRleHRzIiwiY29udHJvbElkIiwidGl0bGUiLCJkZXNjcmlwdGlvbiIsImhhbmRsZVRhYmxlRGVsZXRlRW5hYmxlbWVudEZvclNpZGVFZmZlY3RzIiwib1RhYmxlIiwib0ludGVybmFsTW9kZWxDb250ZXh0Iiwic0RlbGV0YWJsZVBhdGgiLCJnZXREZWxldGFibGVQYXRoRm9yVGFibGUiLCJhU2VsZWN0ZWRDb250ZXh0cyIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJhRGVsZXRhYmxlQ29udGV4dHMiLCJzZXRQcm9wZXJ0eSIsIm9TZWxlY3RlZENvbnRleHQiLCJ0YWJsZSIsImRlbGV0YWJsZVBhdGgiLCJyb3dCaW5kaW5nIiwiZ2V0Um93QmluZGluZyIsIm1ldGFNb2RlbCIsImdldE1ldGFNb2RlbCIsImdldENvbnRleHQiLCJnZXRNZXRhUGF0aCIsIm5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJzZXRIZWFkZXJMYWJlbFZpc2liaWxpdHkiLCJkYXRhZmllbGQiLCJkYXRhRmllbGRDb2xsZWN0aW9uIiwic29tZSIsIm9EQyIsImdldFZhbHVlT25SYXRpbmdGaWVsZCIsIm9Db250ZXh0IiwiY29udGV4dCIsInNQYXRoRGF0YUZpZWxkcyIsImdldFRleHRPbkFjdGlvbkZpZWxkIiwiYU11bHRpcGxlTGFiZWxzIiwicmVkdWNlIiwiYSIsImIiLCJ0b1N0cmluZyIsIl9nZXRSZXNwb25zaXZlVGFibGVDb2x1bW5TZXR0aW5ncyIsInRhYmxlVHlwZSIsInNldHRpbmdzIiwibWljcm9DaGFydFNpemUiLCJzaG93TWljcm9DaGFydExhYmVsIiwiZ2V0RGVsZWdhdGUiLCJiRW5hYmxlQW5hbHl0aWNzIiwiYkhhc011bHRpVmlzdWFsaXphdGlvbnMiLCJzRW50aXR5TmFtZSIsIm9EZWxlZ2F0ZSIsIm5hbWUiLCJwYXlsb2FkIiwiY29sbGVjdGlvbk5hbWUiLCJzZXRJQk5FbmFibGVtZW50Iiwib05hdmlnYXRpb25BdmFpbGFibGVNYXAiLCJiRW5hYmxlZCIsImFBcHBsaWNhYmxlIiwiYU5vdEFwcGxpY2FibGUiLCJzUHJvcGVydHkiLCJyZXF1aXJlc0lDb250ZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUYWJsZUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb21tb25Bbm5vdGF0aW9uVHlwZXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHsgUHJlc2VudGF0aW9uVmFyaWFudFR5cGUsIFVJQW5ub3RhdGlvblR5cGVzIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgeyBnZXRVaUNvbnRyb2wgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB7IFRlbXBsYXRlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCB7IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IFRhYmxlRm9ybWF0dGVyIGZyb20gXCJzYXAvZmUvY29yZS9mb3JtYXR0ZXJzL1RhYmxlRm9ybWF0dGVyXCI7XG5pbXBvcnQgKiBhcyBCaW5kaW5nVG9vbGtpdCBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBJbnRlcm5hbE1vZGVsQ29udGV4dCB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL01vZGVsSGVscGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgRkVMaWJyYXJ5IGZyb20gXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgeyBEYXRhTW9kZWxPYmplY3RQYXRoLCBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoLCBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0RWRpdE1vZGUgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCBDb21tb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvQ29tbW9uSGVscGVyXCI7XG5pbXBvcnQgeyBmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5IH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgQWN0aW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL2hlbHBlcnMvQWN0aW9uSGVscGVyXCI7XG5pbXBvcnQgVGFibGVTaXplSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL3RhYmxlL1RhYmxlU2l6ZUhlbHBlclwiO1xuaW1wb3J0IHR5cGUgVGFibGUgZnJvbSBcInNhcC91aS9tZGMvVGFibGVcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5cbmNvbnN0IENyZWF0aW9uTW9kZSA9IEZFTGlicmFyeS5DcmVhdGlvbk1vZGU7XG4vKipcbiAqIEhlbHBlciBjbGFzcyB1c2VkIGJ5IHRoZSBjb250cm9sIGxpYnJhcnkgZm9yIE9EYXRhLXNwZWNpZmljIGhhbmRsaW5nIChPRGF0YSBWNClcbiAqXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbCBUaGlzIG1vZHVsZSBpcyBvbmx5IGZvciBpbnRlcm5hbC9leHBlcmltZW50YWwgdXNlIVxuICovXG5jb25zdCBUYWJsZUhlbHBlciA9IHtcblx0LyoqXG5cdCAqIENoZWNrIGlmIGEgZ2l2ZW4gYWN0aW9uIGlzIHN0YXRpYy5cblx0ICpcblx0ICogQHBhcmFtIG9BY3Rpb25Db250ZXh0IFRoZSBpbnN0YW5jZSBvZiB0aGUgYWN0aW9uXG5cdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uXG5cdCAqIEByZXR1cm5zIFJldHVybnMgJ3RydWUnIGlmIGFjdGlvbiBpcyBzdGF0aWMsIGVsc2UgJ2ZhbHNlJ1xuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAdWk1LXJlc3RyaWN0ZWRcblx0ICovXG5cdF9pc1N0YXRpY0FjdGlvbjogZnVuY3Rpb24gKG9BY3Rpb25Db250ZXh0OiBvYmplY3QsIHNBY3Rpb25OYW1lOiBzdHJpbmcgfCBTdHJpbmcpIHtcblx0XHRsZXQgb0FjdGlvbjtcblx0XHRpZiAob0FjdGlvbkNvbnRleHQpIHtcblx0XHRcdGlmIChBcnJheS5pc0FycmF5KG9BY3Rpb25Db250ZXh0KSkge1xuXHRcdFx0XHRjb25zdCBzRW50aXR5VHlwZSA9IHRoaXMuX2dldEFjdGlvbk92ZXJsb2FkRW50aXR5VHlwZShzQWN0aW9uTmFtZSk7XG5cdFx0XHRcdGlmIChzRW50aXR5VHlwZSkge1xuXHRcdFx0XHRcdG9BY3Rpb24gPSBvQWN0aW9uQ29udGV4dC5maW5kKGZ1bmN0aW9uIChhY3Rpb246IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGFjdGlvbi4kSXNCb3VuZCAmJiBhY3Rpb24uJFBhcmFtZXRlclswXS4kVHlwZSA9PT0gc0VudGl0eVR5cGU7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Ly8gaWYgdGhpcyBpcyBqdXN0IG9uZSAtIE9LIHdlIHRha2UgaXQuIElmIGl0J3MgbW9yZSBpdCdzIGFjdHVhbGx5IGEgd3JvbmcgdXNhZ2UgYnkgdGhlIGFwcFxuXHRcdFx0XHRcdC8vIGFzIHdlIHVzZWQgdGhlIGZpcnN0IG9uZSBhbGwgdGhlIHRpbWUgd2Uga2VlcCBpdCBhcyBpdCBpc1xuXHRcdFx0XHRcdG9BY3Rpb24gPSBvQWN0aW9uQ29udGV4dFswXTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0b0FjdGlvbiA9IG9BY3Rpb25Db250ZXh0O1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiAhIW9BY3Rpb24gJiYgb0FjdGlvbi4kSXNCb3VuZCAmJiBvQWN0aW9uLiRQYXJhbWV0ZXJbMF0uJGlzQ29sbGVjdGlvbjtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IHRoZSBlbnRpdHkgdHlwZSBvZiBhbiBhY3Rpb24gb3ZlcmxvYWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBzQWN0aW9uTmFtZSBUaGUgbmFtZSBvZiB0aGUgYWN0aW9uLlxuXHQgKiBAcmV0dXJucyBUaGUgZW50aXR5IHR5cGUgdXNlZCBpbiB0aGUgYWN0aW9uIG92ZXJsb2FkLlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldEFjdGlvbk92ZXJsb2FkRW50aXR5VHlwZTogZnVuY3Rpb24gKHNBY3Rpb25OYW1lOiBhbnkpIHtcblx0XHRpZiAoc0FjdGlvbk5hbWUgJiYgc0FjdGlvbk5hbWUuaW5kZXhPZihcIihcIikgPiAtMSkge1xuXHRcdFx0Y29uc3QgYVBhcnRzID0gc0FjdGlvbk5hbWUuc3BsaXQoXCIoXCIpO1xuXHRcdFx0cmV0dXJuIGFQYXJ0c1thUGFydHMubGVuZ3RoIC0gMV0ucmVwbGFjZUFsbChcIilcIiwgXCJcIik7XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrcyB3aGV0aGVyIHRoZSBhY3Rpb24gaXMgb3ZlcmxvYWRlZCBvbiBhIGRpZmZlcmVudCBlbnRpdHkgdHlwZS5cblx0ICpcblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBhY3Rpb24uXG5cdCAqIEBwYXJhbSBzQW5ub3RhdGlvblRhcmdldEVudGl0eVR5cGUgVGhlIGVudGl0eSB0eXBlIG9mIHRoZSBhbm5vdGF0aW9uIHRhcmdldC5cblx0ICogQHJldHVybnMgUmV0dXJucyAndHJ1ZScgaWYgdGhlIGFjdGlvbiBpcyBvdmVybG9hZGVkIHdpdGggYSBkaWZmZXJlbnQgZW50aXR5IHR5cGUsIGVsc2UgJ2ZhbHNlJy5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9pc0FjdGlvbk92ZXJsb2FkT25EaWZmZXJlbnRUeXBlOiBmdW5jdGlvbiAoc0FjdGlvbk5hbWU6IGFueSwgc0Fubm90YXRpb25UYXJnZXRFbnRpdHlUeXBlOiBhbnkpIHtcblx0XHRjb25zdCBzRW50aXR5VHlwZSA9IHRoaXMuX2dldEFjdGlvbk92ZXJsb2FkRW50aXR5VHlwZShzQWN0aW9uTmFtZSk7XG5cdFx0cmV0dXJuICEhc0VudGl0eVR5cGUgJiYgc0Fubm90YXRpb25UYXJnZXRFbnRpdHlUeXBlICE9PSBzRW50aXR5VHlwZTtcblx0fSxcblxuXHRnZXRNZXNzYWdlRm9yRHJhZnRWYWxpZGF0aW9uOiBmdW5jdGlvbiAob1RoaXM6IGFueSk6IHN0cmluZyB7XG5cdFx0Y29uc3Qgb0NvbGxlY3Rpb25Bbm5vdGF0aW9ucyA9IG9UaGlzLmNvbGxlY3Rpb24uZ2V0T2JqZWN0KFwiLi9AXCIpO1xuXHRcdGNvbnN0IHNNZXNzYWdlUGF0aCA9IG9Db2xsZWN0aW9uQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1lc3NhZ2VzXCJdPy4kUGF0aDtcblx0XHRpZiAoXG5cdFx0XHRzTWVzc2FnZVBhdGggJiZcblx0XHRcdG9UaGlzLnRhYmxlRGVmaW5pdGlvbj8uZ2V0UHJvcGVydHkoXCIvdGVtcGxhdGVcIikgPT09IFRlbXBsYXRlVHlwZS5PYmplY3RQYWdlICYmXG5cdFx0XHQhIU9iamVjdC5rZXlzKG9Db2xsZWN0aW9uQW5ub3RhdGlvbnMpLmZpbmQoKHNLZXkpID0+IHtcblx0XHRcdFx0Y29uc3Qgb0Fubm90YXRpb24gPSBvQ29sbGVjdGlvbkFubm90YXRpb25zW3NLZXldO1xuXHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdG9Bbm5vdGF0aW9uICYmXG5cdFx0XHRcdFx0b0Fubm90YXRpb24uJFR5cGUgPT09IENvbW1vbkFubm90YXRpb25UeXBlcy5TaWRlRWZmZWN0c1R5cGUgJiZcblx0XHRcdFx0XHQhb0Fubm90YXRpb24uU291cmNlUHJvcGVydGllcyAmJlxuXHRcdFx0XHRcdCFvQW5ub3RhdGlvbi5Tb3VyY2VFbnRpdGllcyAmJlxuXHRcdFx0XHRcdG9Bbm5vdGF0aW9uLlRhcmdldFByb3BlcnRpZXM/LmluZGV4T2Yoc01lc3NhZ2VQYXRoKSA+IC0xXG5cdFx0XHRcdCk7XG5cdFx0XHR9KVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHNNZXNzYWdlUGF0aDtcblx0XHR9XG5cdFx0cmV0dXJuIFwiXCI7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgYW4gYXJyYXkgb2YgdGhlIGZpZWxkcyBsaXN0ZWQgYnkgdGhlIHByb3BlcnR5IFJlcXVlc3RBdExlYXN0IGluIHRoZSBQcmVzZW50YXRpb25WYXJpYW50IC5cblx0ICpcblx0ICogQHBhcmFtIG9QcmVzZW50YXRpb25WYXJpYW50IFRoZSBhbm5vdGF0aW9uIHJlbGF0ZWQgdG8gY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUHJlc2VudGF0aW9uVmFyaWFudC5cblx0ICogQHJldHVybnMgVGhlIGZpZWxkcy5cblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRnZXRGaWVsZHNSZXF1ZXN0ZWRCeVByZXNlbnRhdGlvblZhcmlhbnQ6IGZ1bmN0aW9uIChvUHJlc2VudGF0aW9uVmFyaWFudDogUHJlc2VudGF0aW9uVmFyaWFudFR5cGUpOiBzdHJpbmdbXSB7XG5cdFx0cmV0dXJuIG9QcmVzZW50YXRpb25WYXJpYW50LlJlcXVlc3RBdExlYXN0Py5tYXAoKG9SZXF1ZXN0ZWQpID0+IG9SZXF1ZXN0ZWQudmFsdWUpIHx8IFtdO1xuXHR9LFxuXHRnZXROYXZpZ2F0aW9uQXZhaWxhYmxlRmllbGRzRnJvbUxpbmVJdGVtOiBmdW5jdGlvbiAoYUxpbmVJdGVtQ29udGV4dDogQ29udGV4dCk6IHN0cmluZ1tdIHtcblx0XHRjb25zdCBhU2VsZWN0ZWRGaWVsZHNBcnJheTogc3RyaW5nW10gPSBbXTtcblx0XHQoKGFMaW5lSXRlbUNvbnRleHQuZ2V0T2JqZWN0KCkgYXMgQXJyYXk8YW55PikgfHwgW10pLmZvckVhY2goZnVuY3Rpb24gKG9SZWNvcmQ6IGFueSkge1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRvUmVjb3JkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiICYmXG5cdFx0XHRcdCFvUmVjb3JkLklubGluZSAmJlxuXHRcdFx0XHQhb1JlY29yZC5EZXRlcm1pbmluZyAmJlxuXHRcdFx0XHRvUmVjb3JkLk5hdmlnYXRpb25BdmFpbGFibGU/LiRQYXRoXG5cdFx0XHQpIHtcblx0XHRcdFx0YVNlbGVjdGVkRmllbGRzQXJyYXkucHVzaChvUmVjb3JkLk5hdmlnYXRpb25BdmFpbGFibGUuJFBhdGgpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBhU2VsZWN0ZWRGaWVsZHNBcnJheTtcblx0fSxcblxuXHRnZXROYXZpZ2F0aW9uQXZhaWxhYmxlTWFwOiBmdW5jdGlvbiAoYUxpbmVJdGVtQ29sbGVjdGlvbjogYW55KSB7XG5cdFx0Y29uc3Qgb0lCTk5hdmlnYXRpb25BdmFpbGFibGVNYXA6IGFueSA9IHt9O1xuXHRcdGFMaW5lSXRlbUNvbGxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbiAob1JlY29yZDogYW55KSB7XG5cdFx0XHRjb25zdCBzS2V5ID0gYCR7b1JlY29yZC5TZW1hbnRpY09iamVjdH0tJHtvUmVjb3JkLkFjdGlvbn1gO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRvUmVjb3JkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiICYmXG5cdFx0XHRcdCFvUmVjb3JkLklubGluZSAmJlxuXHRcdFx0XHRvUmVjb3JkLlJlcXVpcmVzQ29udGV4dFxuXHRcdFx0KSB7XG5cdFx0XHRcdGlmIChvUmVjb3JkLk5hdmlnYXRpb25BdmFpbGFibGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdG9JQk5OYXZpZ2F0aW9uQXZhaWxhYmxlTWFwW3NLZXldID0gb1JlY29yZC5OYXZpZ2F0aW9uQXZhaWxhYmxlLiRQYXRoXG5cdFx0XHRcdFx0XHQ/IG9SZWNvcmQuTmF2aWdhdGlvbkF2YWlsYWJsZS4kUGF0aFxuXHRcdFx0XHRcdFx0OiBvUmVjb3JkLk5hdmlnYXRpb25BdmFpbGFibGU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob0lCTk5hdmlnYXRpb25BdmFpbGFibGVNYXApO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIGNvbnRleHQgb2YgdGhlIFVJIExpbmUgSXRlbS5cblx0ICpcblx0ICogQHBhcmFtIG9QcmVzZW50YXRpb25Db250ZXh0IFRoZSBjb250ZXh0IG9mIHRoZSBwcmVzZW50YXRpb24gKFByZXNlbnRhdGlvbiB2YXJpYW50IG9yIFVJLkxpbmVJdGVtKVxuXHQgKiBAcmV0dXJucyBUaGUgY29udGV4dCBvZiB0aGUgVUkgTGluZSBJdGVtXG5cdCAqL1xuXHRnZXRVaUxpbmVJdGVtOiBmdW5jdGlvbiAob1ByZXNlbnRhdGlvbkNvbnRleHQ6IENvbnRleHQpIHtcblx0XHRyZXR1cm4gZ2V0VWlDb250cm9sKG9QcmVzZW50YXRpb25Db250ZXh0LCBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5MaW5lSXRlbVwiKTtcblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhbmQgcmV0dXJucyBhIHNlbGVjdCBxdWVyeSB3aXRoIHRoZSBzZWxlY3RlZCBmaWVsZHMgZnJvbSB0aGUgcGFyYW1ldGVycyB0aGF0IHdlcmUgcGFzc2VkLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RoaXMgVGhlIGluc3RhbmNlIG9mIHRoZSBpbm5lciBtb2RlbCBvZiB0aGUgdGFibGUgYnVpbGRpbmcgYmxvY2tcblx0ICogQHJldHVybnMgVGhlICdzZWxlY3QnIHF1ZXJ5IHRoYXQgaGFzIHRoZSBzZWxlY3RlZCBmaWVsZHMgZnJvbSB0aGUgcGFyYW1ldGVycyB0aGF0IHdlcmUgcGFzc2VkXG5cdCAqL1xuXHRjcmVhdGUkU2VsZWN0OiBmdW5jdGlvbiAob1RoaXM6IGFueSkge1xuXHRcdGNvbnN0IG9Db2xsZWN0aW9uQ29udGV4dCA9IG9UaGlzLmNvbGxlY3Rpb247XG5cdFx0Y29uc3QgYVNlbGVjdGVkRmllbGRzOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IG9MaW5lSXRlbUNvbnRleHQgPSBUYWJsZUhlbHBlci5nZXRVaUxpbmVJdGVtKG9UaGlzLm1ldGFQYXRoKTtcblx0XHRjb25zdCBzVGFyZ2V0Q29sbGVjdGlvblBhdGggPSBDb21tb25IZWxwZXIuZ2V0VGFyZ2V0Q29sbGVjdGlvbihvQ29sbGVjdGlvbkNvbnRleHQpO1xuXG5cdFx0ZnVuY3Rpb24gcHVzaEZpZWxkKHNGaWVsZDogc3RyaW5nKSB7XG5cdFx0XHRpZiAoc0ZpZWxkICYmICFhU2VsZWN0ZWRGaWVsZHMuaW5jbHVkZXMoc0ZpZWxkKSAmJiBzRmllbGQuaW5kZXhPZihcIi9cIikgIT09IDApIHtcblx0XHRcdFx0Ly8gRG8gbm90IGFkZCBzaW5nbGV0b24gcHJvcGVydHkgKHdpdGggYWJzb2x1dGUgcGF0aCkgdG8gJHNlbGVjdFxuXHRcdFx0XHRhU2VsZWN0ZWRGaWVsZHMucHVzaChzRmllbGQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHB1c2hGaWVsZExpc3QoYUZpZWxkczogc3RyaW5nW10pIHtcblx0XHRcdGlmIChhRmllbGRzICYmIGFGaWVsZHMubGVuZ3RoKSB7XG5cdFx0XHRcdGFGaWVsZHMuZm9yRWFjaChwdXNoRmllbGQpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChcblx0XHRcdCFvVGhpcy50YWJsZURlZmluaXRpb24uZ2V0T2JqZWN0KFwiZW5hYmxlQW5hbHl0aWNzXCIpICYmXG5cdFx0XHRvTGluZUl0ZW1Db250ZXh0LmdldFBhdGgoKS5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkxpbmVJdGVtXCIpID4gLTFcblx0XHQpIHtcblx0XHRcdC8vICRzZWxlY3QgaXNuJ3Qgc3VwcG9ydGVkIGJ5IHRoZSBtb2RlbCBpbiBjYXNlIG9mIGFuIGFuYWx5dGljYWwgcXVlcnlcblx0XHRcdC8vIERvbid0IHByb2Nlc3MgRW50aXR5VHlwZSB3aXRob3V0IExpbmVJdGVtIChzZWNvbmQgY29uZGl0aW9uIG9mIHRoZSBpZilcblx0XHRcdGNvbnN0IG9QcmVzZW50YXRpb25Bbm5vdGF0aW9uID0gZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzKG9UaGlzLm1ldGFQYXRoKS50YXJnZXRPYmplY3Q7XG5cdFx0XHRjb25zdCBhT3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllcyA9IChvVGhpcy50YWJsZURlZmluaXRpb24uZ2V0T2JqZWN0KFwib3BlcmF0aW9uQXZhaWxhYmxlUHJvcGVydGllc1wiKSB8fCBcIlwiKS5zcGxpdChcIixcIik7XG5cdFx0XHRjb25zdCBhQXBwbGljYWJsZVByb3BlcnRpZXMgPSBUYWJsZUhlbHBlci5fZmlsdGVyTm9uQXBwbGljYWJsZVByb3BlcnRpZXMoYU9wZXJhdGlvbkF2YWlsYWJsZVByb3BlcnRpZXMsIG9Db2xsZWN0aW9uQ29udGV4dCk7XG5cdFx0XHRjb25zdCBhU2VtYW50aWNLZXlzOiBzdHJpbmdbXSA9IChcblx0XHRcdFx0b0NvbGxlY3Rpb25Db250ZXh0LmdldE9iamVjdChgJHtzVGFyZ2V0Q29sbGVjdGlvblBhdGh9L0Bjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VtYW50aWNLZXlgKSB8fCBbXVxuXHRcdFx0KS5tYXAoKG9TZW1hbnRpY0tleTogYW55KSA9PiBvU2VtYW50aWNLZXkuJFByb3BlcnR5UGF0aCBhcyBzdHJpbmcpO1xuXG5cdFx0XHRpZiAob1ByZXNlbnRhdGlvbkFubm90YXRpb24/LiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5QcmVzZW50YXRpb25WYXJpYW50VHlwZSkge1xuXHRcdFx0XHRwdXNoRmllbGRMaXN0KFRhYmxlSGVscGVyLmdldEZpZWxkc1JlcXVlc3RlZEJ5UHJlc2VudGF0aW9uVmFyaWFudChvUHJlc2VudGF0aW9uQW5ub3RhdGlvbikpO1xuXHRcdFx0fVxuXG5cdFx0XHRwdXNoRmllbGRMaXN0KFRhYmxlSGVscGVyLmdldE5hdmlnYXRpb25BdmFpbGFibGVGaWVsZHNGcm9tTGluZUl0ZW0ob0xpbmVJdGVtQ29udGV4dCkpO1xuXHRcdFx0cHVzaEZpZWxkTGlzdChhQXBwbGljYWJsZVByb3BlcnRpZXMpO1xuXHRcdFx0cHVzaEZpZWxkTGlzdChhU2VtYW50aWNLZXlzKTtcblx0XHRcdHB1c2hGaWVsZChUYWJsZUhlbHBlci5nZXRNZXNzYWdlRm9yRHJhZnRWYWxpZGF0aW9uKG9UaGlzKSk7XG5cdFx0XHRwdXNoRmllbGQoXG5cdFx0XHRcdG9Db2xsZWN0aW9uQ29udGV4dC5nZXRPYmplY3QoYCR7c1RhcmdldENvbGxlY3Rpb25QYXRofUBPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkRlbGV0ZVJlc3RyaWN0aW9uc2ApPy5EZWxldGFibGU/LiRQYXRoXG5cdFx0XHQpO1xuXHRcdFx0cHVzaEZpZWxkKFxuXHRcdFx0XHRvQ29sbGVjdGlvbkNvbnRleHQuZ2V0T2JqZWN0KGAke3NUYXJnZXRDb2xsZWN0aW9uUGF0aH1AT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5VcGRhdGVSZXN0cmljdGlvbnNgKT8uVXBkYXRhYmxlPy4kUGF0aFxuXHRcdFx0KTtcblx0XHR9XG5cdFx0cmV0dXJuIGFTZWxlY3RlZEZpZWxkcy5qb2luKFwiLFwiKTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgY29sdW1uJ3Mgd2lkdGggaWYgZGVmaW5lZCBmcm9tIG1hbmlmZXN0L2N1c3RvbWlzYXRpb24gYnkgYW5ub3RhdGlvbnMuXG5cdCAqXG5cdCAqIFRoZXJlIGFyZSBpc3N1ZXMgd2hlbiB0aGUgY2VsbCBpbiB0aGUgY29sdW1uIGlzIGEgbWVhc3VyZSBhbmQgaGFzIGEgVW9NIG9yIGN1cnJlbmN5IGFzc29jaWF0ZWQgdG8gaXRcblx0ICogSW4gZWRpdCBtb2RlIHRoaXMgcmVzdWx0cyBpbiB0d28gZmllbGRzIGFuZCB0aGF0IGRvZXNuJ3Qgd29yayB2ZXJ5IHdlbGwgZm9yIHRoZSBjZWxsIGFuZCB0aGUgZmllbGRzIGdldCBjdXQuXG5cdCAqIFNvIHdlIGFyZSBjdXJyZW50bHkgaGFyZGNvZGluZyB3aWR0aCBpbiBzZXZlcmFsIGNhc2VzIGluIGVkaXQgbW9kZSB3aGVyZSB0aGVyZSBhcmUgcHJvYmxlbXMuXG5cdCAqXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRDb2x1bW5XaWR0aFxuXHQgKiBAcGFyYW0gb1RoaXMgVGhlIGluc3RhbmNlIG9mIHRoZSBpbm5lciBtb2RlbCBvZiB0aGUgdGFibGUgYnVpbGRpbmcgYmxvY2tcblx0ICogQHBhcmFtIG9Db2x1bW4gRGVmaW5lZCB3aWR0aCBvZiB0aGUgY29sdW1uLCB3aGljaCBpcyB0YWtlbiB3aXRoIHByaW9yaXR5IGlmIG5vdCBudWxsLCB1bmRlZmluZWQgb3IgZW1wdHlcblx0ICogQHBhcmFtIG9Bbm5vdGF0aW9ucyBBbm5vdGF0aW9ucyBvZiB0aGUgZmllbGRcblx0ICogQHBhcmFtIHNEYXRhRmllbGRUeXBlIFR5cGUgb2YgdGhlIGZpZWxkXG5cdCAqIEBwYXJhbSBzRmllbGRDb250cm9sIEZpZWxkIGNvbnRyb2wgdmFsdWVcblx0ICogQHBhcmFtIHNEYXRhVHlwZSBEYXRhdHlwZSBvZiB0aGUgZmllbGRcblx0ICogQHBhcmFtIG5UYXJnZXRWYWx1ZVZpc3VhbGl6YXRpb24gTnVtYmVyIGZvciBEYXRhRmllbGRGb3JBbm5vdGF0aW9uIFRhcmdldCBWYWx1ZSAoc3RhcnMpXG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkIERhdGEgRmllbGRcblx0ICogQHBhcmFtIHNEYXRhRmllbGRBY3Rpb25UZXh0IERhdGFGaWVsZCdzIHRleHQgZnJvbSBidXR0b25cblx0ICogQHBhcmFtIG9EYXRhTW9kZWxPYmplY3RQYXRoIFRoZSBkYXRhIG1vZGVsIG9iamVjdCBwYXRoXG5cdCAqIEBwYXJhbSBvTWljcm9DaGFydFRpdGxlIFRoZSBvYmplY3QgY29udGFpbmluZyB0aXRsZSBhbmQgZGVzY3JpcHRpb24gb2YgdGhlIE1pY3JvQ2hhcnRcblx0ICogQHJldHVybnMgLSBDb2x1bW4gd2lkdGggaWYgZGVmaW5lZCwgb3RoZXJ3aXNlIHdpZHRoIGlzIHNldCB0byBhdXRvXG5cdCAqL1xuXHRnZXRDb2x1bW5XaWR0aDogZnVuY3Rpb24gKFxuXHRcdG9UaGlzOiBhbnksXG5cdFx0b0NvbHVtbjogYW55LFxuXHRcdG9Bbm5vdGF0aW9uczogYW55LFxuXHRcdHNEYXRhRmllbGRUeXBlOiBzdHJpbmcsXG5cdFx0c0ZpZWxkQ29udHJvbDogc3RyaW5nLFxuXHRcdHNEYXRhVHlwZTogc3RyaW5nLFxuXHRcdG5UYXJnZXRWYWx1ZVZpc3VhbGl6YXRpb246IG51bWJlcixcblx0XHRvRGF0YUZpZWxkOiBhbnksXG5cdFx0c0RhdGFGaWVsZEFjdGlvblRleHQ6IHN0cmluZyxcblx0XHRvRGF0YU1vZGVsT2JqZWN0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRvTWljcm9DaGFydFRpdGxlPzogYW55XG5cdCkge1xuXHRcdGxldCBzV2lkdGgsXG5cdFx0XHRiSGFzVGV4dEFubm90YXRpb24gPSBmYWxzZTtcblx0XHRpZiAob0NvbHVtbi53aWR0aCkge1xuXHRcdFx0cmV0dXJuIG9Db2x1bW4ud2lkdGg7XG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdG9EYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5WYWx1ZSAmJlxuXHRcdFx0Z2V0RWRpdE1vZGUoXG5cdFx0XHRcdG9EYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdC5WYWx1ZS4kdGFyZ2V0LFxuXHRcdFx0XHRvRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdGZhbHNlLFxuXHRcdFx0XHRvRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Rcblx0XHRcdCkgPT09IFwiRGlzcGxheVwiXG5cdFx0KSB7XG5cdFx0XHRiSGFzVGV4dEFubm90YXRpb24gPSBvQW5ub3RhdGlvbnMgJiYgb0Fubm90YXRpb25zLmhhc093blByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCIpO1xuXHRcdFx0aWYgKFxuXHRcdFx0XHRzRGF0YVR5cGUgPT09IFwiRWRtLlN0cmVhbVwiICYmXG5cdFx0XHRcdCFiSGFzVGV4dEFubm90YXRpb24gJiZcblx0XHRcdFx0b0Fubm90YXRpb25zLmhhc093blByb3BlcnR5KFwiQE9yZy5PRGF0YS5Db3JlLlYxLk1lZGlhVHlwZVwiKSAmJlxuXHRcdFx0XHRvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuTWVkaWFUeXBlXCJdLmluY2x1ZGVzKFwiaW1hZ2UvXCIpXG5cdFx0XHQpIHtcblx0XHRcdFx0c1dpZHRoID0gXCI3ZW1cIjtcblx0XHRcdH1cblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0b0Fubm90YXRpb25zICYmXG5cdFx0XHQoKG9Bbm5vdGF0aW9ucy5oYXNPd25Qcm9wZXJ0eShcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc0ltYWdlVVJMXCIpICYmXG5cdFx0XHRcdG9Bbm5vdGF0aW9ucy5oYXNPd25Qcm9wZXJ0eShcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc0ltYWdlVVJMXCIpID09PSB0cnVlKSB8fFxuXHRcdFx0XHQob0Fubm90YXRpb25zLmhhc093blByb3BlcnR5KFwiQE9yZy5PRGF0YS5Db3JlLlYxLk1lZGlhVHlwZVwiKSAmJlxuXHRcdFx0XHRcdG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5NZWRpYVR5cGVcIl0uaW5jbHVkZXMoXCJpbWFnZS9cIikpKVxuXHRcdCkge1xuXHRcdFx0c1dpZHRoID0gXCI3ZW1cIjtcblx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0c0RhdGFGaWVsZFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCIgfHxcblx0XHRcdHNEYXRhRmllbGRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiIHx8XG5cdFx0XHQoc0RhdGFGaWVsZFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiICYmXG5cdFx0XHRcdG9EYXRhRmllbGQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXBcIikgPT09IC0xKVxuXHRcdCkge1xuXHRcdFx0bGV0IG5UbXBUZXh0V2lkdGgsIG5UbXBWaXN1YWxpemF0aW9uV2lkdGg7XG5cdFx0XHQvLyBGb3IgRmllbGRHcm91cCBoYXZpbmcgYWN0aW9uIGJ1dHRvbnMgb3IgdmlzdWFsaXphdGlvbiBkYXRhIHBvaW50cyAoYXMgcmF0aW5nKSBvbiBjb2x1bW4uXG5cdFx0XHRpZiAoc0RhdGFGaWVsZEFjdGlvblRleHQgJiYgc0RhdGFGaWVsZEFjdGlvblRleHQubGVuZ3RoID49IG9EYXRhRmllbGQuTGFiZWwubGVuZ3RoKSB7XG5cdFx0XHRcdG5UbXBUZXh0V2lkdGggPSBUYWJsZVNpemVIZWxwZXIuZ2V0QnV0dG9uV2lkdGgoc0RhdGFGaWVsZEFjdGlvblRleHQpO1xuXHRcdFx0fSBlbHNlIGlmIChvRGF0YUZpZWxkKSB7XG5cdFx0XHRcdG5UbXBUZXh0V2lkdGggPSBUYWJsZVNpemVIZWxwZXIuZ2V0QnV0dG9uV2lkdGgob0RhdGFGaWVsZC5MYWJlbCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRuVG1wVGV4dFdpZHRoID0gVGFibGVTaXplSGVscGVyLmdldEJ1dHRvbldpZHRoKG9Bbm5vdGF0aW9ucy5MYWJlbCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAoblRhcmdldFZhbHVlVmlzdWFsaXphdGlvbikge1xuXHRcdFx0XHQvL0VhY2ggcmF0aW5nIHN0YXIgaGFzIGEgd2lkdGggb2YgMmVtXG5cdFx0XHRcdG5UbXBWaXN1YWxpemF0aW9uV2lkdGggPSBuVGFyZ2V0VmFsdWVWaXN1YWxpemF0aW9uICogMjtcblx0XHRcdH1cblx0XHRcdGlmIChuVG1wVmlzdWFsaXphdGlvbldpZHRoICYmICFpc05hTihuVG1wVmlzdWFsaXphdGlvbldpZHRoKSAmJiBuVG1wVmlzdWFsaXphdGlvbldpZHRoID4gblRtcFRleHRXaWR0aCkge1xuXHRcdFx0XHRzV2lkdGggPSBgJHtuVG1wVmlzdWFsaXphdGlvbldpZHRofWVtYDtcblx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdHNEYXRhRmllbGRBY3Rpb25UZXh0IHx8XG5cdFx0XHRcdChvQW5ub3RhdGlvbnMgJiZcblx0XHRcdFx0XHQob0Fubm90YXRpb25zLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiIHx8XG5cdFx0XHRcdFx0XHRvQW5ub3RhdGlvbnMuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCIpKVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIEFkZCBhZGRpdGlvbmFsIDIgZW0gdG8gYXZvaWQgc2hvd2luZyBlbGxpcHNpcyBpbiBzb21lIGNhc2VzLlxuXHRcdFx0XHRuVG1wVGV4dFdpZHRoICs9IDI7XG5cdFx0XHRcdHNXaWR0aCA9IGAke25UbXBUZXh0V2lkdGh9ZW1gO1xuXHRcdFx0fVxuXHRcdFx0aWYgKFxuXHRcdFx0XHRvRGF0YUZpZWxkPy5UYXJnZXQ/LiRBbm5vdGF0aW9uUGF0aCAmJlxuXHRcdFx0XHRvRGF0YUZpZWxkLlRhcmdldC4kQW5ub3RhdGlvblBhdGguaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFwiKSAhPT0gLTFcblx0XHRcdCkge1xuXHRcdFx0XHRsZXQgY2hhcnRTaXplO1xuXHRcdFx0XHRzd2l0Y2ggKHRoaXMuZ2V0Q2hhcnRTaXplKG9UaGlzLCBvQ29sdW1uKSkge1xuXHRcdFx0XHRcdGNhc2UgXCJYU1wiOlxuXHRcdFx0XHRcdFx0Y2hhcnRTaXplID0gNTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGNhc2UgXCJTXCI6XG5cdFx0XHRcdFx0XHRjaGFydFNpemUgPSA1LjI7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRjYXNlIFwiTVwiOlxuXHRcdFx0XHRcdFx0Y2hhcnRTaXplID0gNi4zO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0Y2FzZSBcIkxcIjpcblx0XHRcdFx0XHRcdGNoYXJ0U2l6ZSA9IDcuOTtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdFx0XHRjaGFydFNpemUgPSA2O1xuXHRcdFx0XHR9XG5cdFx0XHRcdG5UbXBUZXh0V2lkdGggKz0gMjtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdCF0aGlzLmdldFNob3dPbmx5Q2hhcnQob1RoaXMsIG9Db2x1bW4pICYmXG5cdFx0XHRcdFx0b01pY3JvQ2hhcnRUaXRsZSAmJlxuXHRcdFx0XHRcdChvTWljcm9DaGFydFRpdGxlLlRpdGxlLmxlbmd0aCB8fCBvTWljcm9DaGFydFRpdGxlLkRlc2NyaXB0aW9uLmxlbmd0aClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0Y29uc3QgdG1wVGV4dCA9XG5cdFx0XHRcdFx0XHRvTWljcm9DaGFydFRpdGxlLlRpdGxlLmxlbmd0aCA+IG9NaWNyb0NoYXJ0VGl0bGUuRGVzY3JpcHRpb24ubGVuZ3RoXG5cdFx0XHRcdFx0XHRcdD8gb01pY3JvQ2hhcnRUaXRsZS5UaXRsZVxuXHRcdFx0XHRcdFx0XHQ6IG9NaWNyb0NoYXJ0VGl0bGUuRGVzY3JpcHRpb247XG5cdFx0XHRcdFx0Y29uc3QgdGl0bGVTaXplID0gVGFibGVTaXplSGVscGVyLmdldEJ1dHRvbldpZHRoKHRtcFRleHQpICsgNztcblx0XHRcdFx0XHRjb25zdCB0bXBXaWR0aCA9IHRpdGxlU2l6ZSA+IG5UbXBUZXh0V2lkdGggPyB0aXRsZVNpemUgOiBuVG1wVGV4dFdpZHRoO1xuXHRcdFx0XHRcdHNXaWR0aCA9IGAke3RtcFdpZHRofWVtYDtcblx0XHRcdFx0fSBlbHNlIGlmIChuVG1wVGV4dFdpZHRoID4gY2hhcnRTaXplKSB7XG5cdFx0XHRcdFx0c1dpZHRoID0gYCR7blRtcFRleHRXaWR0aH1lbWA7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c1dpZHRoID0gYCR7Y2hhcnRTaXplfWVtYDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoc1dpZHRoKSB7XG5cdFx0XHRyZXR1cm4gc1dpZHRoO1xuXHRcdH1cblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBhZGQgYSBtYXJnaW4gY2xhc3MgYXQgdGhlIGNvbnRyb2wuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRNYXJnaW5DbGFzc1xuXHQgKiBAcGFyYW0gb0NvbGxlY3Rpb24gVGl0bGUgb2YgdGhlIERhdGFQb2ludFxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZCBWYWx1ZSBvZiB0aGUgRGF0YVBvaW50XG5cdCAqIEBwYXJhbSBzVmlzdWFsaXphdGlvblxuXHQgKiBAcGFyYW0gc0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyBIaWRkZW4gZXhwcmVzc2lvbiBjb250YWluZWQgaW4gRmllbGRHcm91cFxuXHQgKiBAcmV0dXJucyBBZGp1c3RpbmcgdGhlIG1hcmdpblxuXHQgKi9cblx0Z2V0TWFyZ2luQ2xhc3M6IGZ1bmN0aW9uIChvQ29sbGVjdGlvbjogYW55LCBvRGF0YUZpZWxkOiBhbnksIHNWaXN1YWxpemF0aW9uOiBhbnksIHNGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnM6IGFueSkge1xuXHRcdGxldCBzQmluZGluZ0V4cHJlc3Npb24sXG5cdFx0XHRzQ2xhc3MgPSBcIlwiO1xuXHRcdGlmIChKU09OLnN0cmluZ2lmeShvQ29sbGVjdGlvbltvQ29sbGVjdGlvbi5sZW5ndGggLSAxXSkgPT0gSlNPTi5zdHJpbmdpZnkob0RhdGFGaWVsZCkpIHtcblx0XHRcdC8vSWYgcmF0aW5nIGluZGljYXRvciBpcyBsYXN0IGVsZW1lbnQgaW4gZmllbGRncm91cCwgdGhlbiB0aGUgMC41cmVtIG1hcmdpbiBhZGRlZCBieSBzYXBNUkkgY2xhc3Mgb2YgaW50ZXJhY3RpdmUgcmF0aW5nIGluZGljYXRvciBvbiB0b3AgYW5kIGJvdHRvbSBtdXN0IGJlIG51bGxpZmllZC5cblx0XHRcdGlmIChzVmlzdWFsaXphdGlvbiA9PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlZpc3VhbGl6YXRpb25UeXBlL1JhdGluZ1wiKSB7XG5cdFx0XHRcdHNDbGFzcyA9IFwic2FwVWlOb01hcmdpbkJvdHRvbSBzYXBVaU5vTWFyZ2luVG9wXCI7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIGlmIChzVmlzdWFsaXphdGlvbiA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WaXN1YWxpemF0aW9uVHlwZS9SYXRpbmdcIikge1xuXHRcdFx0Ly9JZiByYXRpbmcgaW5kaWNhdG9yIGlzIE5PVCB0aGUgbGFzdCBlbGVtZW50IGluIGZpZWxkZ3JvdXAsIHRoZW4gdG8gbWFpbnRhaW4gdGhlIDAuNXJlbSBzcGFjaW5nIGJldHdlZW4gY29nZXRNYXJnaW5DbGFzc250cm9scyAoYXMgcGVyIFVYIHNwZWMpLFxuXHRcdFx0Ly9vbmx5IHRoZSB0b3AgbWFyZ2luIGFkZGVkIGJ5IHNhcE1SSSBjbGFzcyBvZiBpbnRlcmFjdGl2ZSByYXRpbmcgaW5kaWNhdG9yIG11c3QgYmUgbnVsbGlmaWVkLlxuXG5cdFx0XHRzQ2xhc3MgPSBcInNhcFVpTm9NYXJnaW5Ub3BcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c0NsYXNzID0gXCJzYXBVaVRpbnlNYXJnaW5Cb3R0b21cIjtcblx0XHR9XG5cblx0XHRpZiAoc0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucyAmJiBzRmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zICE9PSBcInRydWVcIiAmJiBzRmllbGRHcm91cEhpZGRlbkV4cHJlc3Npb25zICE9PSBcImZhbHNlXCIpIHtcblx0XHRcdGNvbnN0IHNIaWRkZW5FeHByZXNzaW9uUmVzdWx0ID0gc0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucy5zdWJzdHJpbmcoXG5cdFx0XHRcdHNGaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnMuaW5kZXhPZihcIns9XCIpICsgMixcblx0XHRcdFx0c0ZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9ucy5sYXN0SW5kZXhPZihcIn1cIilcblx0XHRcdCk7XG5cdFx0XHRzQmluZGluZ0V4cHJlc3Npb24gPSBcIns9IFwiICsgc0hpZGRlbkV4cHJlc3Npb25SZXN1bHQgKyBcIiA/ICdcIiArIHNDbGFzcyArIFwiJyA6IFwiICsgXCInJ1wiICsgXCIgfVwiO1xuXHRcdFx0cmV0dXJuIHNCaW5kaW5nRXhwcmVzc2lvbjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHNDbGFzcztcblx0XHR9XG5cdH0sXG5cblx0Z2V0VkJveFZpc2liaWxpdHk6IGZ1bmN0aW9uIChvQ29sbGVjdGlvbjogYW55W10sIGZpZWxkR3JvdXBIaWRkZW5FeHByZXNzaW9uczogYW55KSB7XG5cdFx0bGV0IGJBbGxTdGF0aWMgPSB0cnVlO1xuXHRcdGxldCBiRHluYW1pY0V4cHJlc3Npb25zSW5GaWVsZHMgPSBmYWxzZTtcblx0XHRjb25zdCBhSGlkZGVuUGF0aHMgPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IG9Db2xsZWN0aW9uLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBoaWRkZW5Bbm5vdGF0aW9uVmFsdWUgPSBvQ29sbGVjdGlvbltpXVtcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl07XG5cdFx0XHRpZiAoaGlkZGVuQW5ub3RhdGlvblZhbHVlICE9PSB1bmRlZmluZWQgJiYgaGlkZGVuQW5ub3RhdGlvblZhbHVlICE9PSBmYWxzZSkge1xuXHRcdFx0XHRpZiAoaGlkZGVuQW5ub3RhdGlvblZhbHVlICE9PSB0cnVlKSB7XG5cdFx0XHRcdFx0aWYgKGhpZGRlbkFubm90YXRpb25WYWx1ZS4kUGF0aCkge1xuXHRcdFx0XHRcdFx0YUhpZGRlblBhdGhzLnB1c2goaGlkZGVuQW5ub3RhdGlvblZhbHVlLiRQYXRoKTtcblx0XHRcdFx0XHRcdGJBbGxTdGF0aWMgPSBmYWxzZTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBoaWRkZW5Bbm5vdGF0aW9uVmFsdWUgPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0XHRcdC8vIER5bmFtaWMgZXhwcmVzc2lvbiBmb3VuZCBpbiBhIGZpZWxkXG5cdFx0XHRcdFx0XHRiRHluYW1pY0V4cHJlc3Npb25zSW5GaWVsZHMgPSB0cnVlO1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFIaWRkZW5QYXRocy5wdXNoKGhpZGRlbkFubm90YXRpb25WYWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFIaWRkZW5QYXRocy5wdXNoKGZhbHNlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKCFiRHluYW1pY0V4cHJlc3Npb25zSW5GaWVsZHMgJiYgYUhpZGRlblBhdGhzLmxlbmd0aCA+IDAgJiYgYkFsbFN0YXRpYyAhPT0gdHJ1ZSkge1xuXHRcdFx0Y29uc3QgcGFyYW1zID0gYUhpZGRlblBhdGhzLm1hcCgoaGlkZGVuUGF0aCkgPT4ge1xuXHRcdFx0XHRpZiAodHlwZW9mIGhpZGRlblBhdGggPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGhpZGRlblBhdGg7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIEJpbmRpbmdUb29sa2l0LnBhdGhJbk1vZGVsKGhpZGRlblBhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblxuXHRcdFx0cmV0dXJuIEJpbmRpbmdUb29sa2l0LmNvbXBpbGVFeHByZXNzaW9uKEJpbmRpbmdUb29sa2l0LmZvcm1hdFJlc3VsdChwYXJhbXMsIFRhYmxlRm9ybWF0dGVyLmdldFZCb3hWaXNpYmlsaXR5KSk7XG5cdFx0fSBlbHNlIGlmIChiRHluYW1pY0V4cHJlc3Npb25zSW5GaWVsZHMpIHtcblx0XHRcdHJldHVybiBmaWVsZEdyb3VwSGlkZGVuRXhwcmVzc2lvbnM7XG5cdFx0fSBlbHNlIGlmIChhSGlkZGVuUGF0aHMubGVuZ3RoID4gMCAmJiBhSGlkZGVuUGF0aHMuaW5kZXhPZihmYWxzZSkgPT09IC0xICYmIGJBbGxTdGF0aWMpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gcHJvdmlkZSBoaWRkZW4gZmlsdGVycyB0byB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBmb3JtYXRIaWRkZW5GaWx0ZXJzXG5cdCAqIEBwYXJhbSBvSGlkZGVuRmlsdGVyIFRoZSBoaWRkZW5GaWx0ZXJzIHZpYSBjb250ZXh0IG5hbWVkIGZpbHRlcnMgKGFuZCBrZXkgaGlkZGVuRmlsdGVycykgcGFzc2VkIHRvIE1hY3JvIFRhYmxlXG5cdCAqIEByZXR1cm5zIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGhpZGRlbiBmaWx0ZXJzXG5cdCAqL1xuXHRmb3JtYXRIaWRkZW5GaWx0ZXJzOiBmdW5jdGlvbiAob0hpZGRlbkZpbHRlcjogc3RyaW5nKSB7XG5cdFx0aWYgKG9IaWRkZW5GaWx0ZXIpIHtcblx0XHRcdHRyeSB7XG5cdFx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvSGlkZGVuRmlsdGVyKTtcblx0XHRcdH0gY2F0Y2ggKGV4KSB7XG5cdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIHN0YWJsZSBJRCBvZiB0aGUgY29sdW1uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0Q29sdW1uU3RhYmxlSWRcblx0ICogQHBhcmFtIHNJZCBDdXJyZW50IG9iamVjdCBJRFxuXHQgKiBAcGFyYW0gb0RhdGFGaWVsZCBWYWx1ZSBvZiB0aGUgRGF0YVBvaW50XG5cdCAqIEByZXR1cm5zIFRoZSBzdGFibGUgSUQgZm9yIGEgZ2l2ZW4gY29sdW1uXG5cdCAqL1xuXHRnZXRDb2x1bW5TdGFibGVJZDogZnVuY3Rpb24gKHNJZDogc3RyaW5nLCBvRGF0YUZpZWxkOiBhbnkpIHtcblx0XHRyZXR1cm4gc0lkXG5cdFx0XHQ/IGdlbmVyYXRlKFtcblx0XHRcdFx0XHRzSWQsXG5cdFx0XHRcdFx0XCJDXCIsXG5cdFx0XHRcdFx0KG9EYXRhRmllbGQuVGFyZ2V0ICYmIG9EYXRhRmllbGQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aCkgfHxcblx0XHRcdFx0XHRcdChvRGF0YUZpZWxkLlZhbHVlICYmIG9EYXRhRmllbGQuVmFsdWUuJFBhdGgpIHx8XG5cdFx0XHRcdFx0XHQob0RhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cIiB8fFxuXHRcdFx0XHRcdFx0b0RhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIlxuXHRcdFx0XHRcdFx0XHQ/IG9EYXRhRmllbGRcblx0XHRcdFx0XHRcdFx0OiBcIlwiKVxuXHRcdFx0ICBdKVxuXHRcdFx0OiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0Z2V0RmllbGRHcm91cExhYmVsU3RhYmxlSWQ6IGZ1bmN0aW9uIChzSWQ6IHN0cmluZywgb0RhdGFGaWVsZDogYW55KSB7XG5cdFx0cmV0dXJuIHNJZFxuXHRcdFx0PyBnZW5lcmF0ZShbXG5cdFx0XHRcdFx0c0lkLFxuXHRcdFx0XHRcdFwiRkdMYWJlbFwiLFxuXHRcdFx0XHRcdChvRGF0YUZpZWxkLlRhcmdldCAmJiBvRGF0YUZpZWxkLlRhcmdldC4kQW5ub3RhdGlvblBhdGgpIHx8XG5cdFx0XHRcdFx0XHQob0RhdGFGaWVsZC5WYWx1ZSAmJiBvRGF0YUZpZWxkLlZhbHVlLiRQYXRoKSB8fFxuXHRcdFx0XHRcdFx0KG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCIgfHxcblx0XHRcdFx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCJcblx0XHRcdFx0XHRcdFx0PyBvRGF0YUZpZWxkXG5cdFx0XHRcdFx0XHRcdDogXCJcIilcblx0XHRcdCAgXSlcblx0XHRcdDogdW5kZWZpbmVkO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgZmlsdGVycyBvdXQgcHJvcGVydGllcyB3aGljaCBkbyBub3QgYmVsb25nIHRvIHRoZSBjb2xsZWN0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gYVByb3BlcnR5UGF0aHMgVGhlIGFycmF5IG9mIHByb3BlcnRpZXMgdG8gYmUgY2hlY2tlZC5cblx0ICogQHBhcmFtIG9Db2xsZWN0aW9uQ29udGV4dCBUaGUgY29sbGVjdGlvbiBjb250ZXh0IHRvIGJlIHVzZWQuXG5cdCAqIEByZXR1cm5zIFRoZSBhcnJheSBvZiBhcHBsaWNhYmxlIHByb3BlcnRpZXMuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZmlsdGVyTm9uQXBwbGljYWJsZVByb3BlcnRpZXM6IGZ1bmN0aW9uIChhUHJvcGVydHlQYXRoczogYW55W10sIG9Db2xsZWN0aW9uQ29udGV4dDogQ29udGV4dCkge1xuXHRcdHJldHVybiAoXG5cdFx0XHRhUHJvcGVydHlQYXRocyAmJlxuXHRcdFx0YVByb3BlcnR5UGF0aHMuZmlsdGVyKGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9Db2xsZWN0aW9uQ29udGV4dC5nZXRPYmplY3QoYC4vJHtzUHJvcGVydHlQYXRofWApO1xuXHRcdFx0fSlcblx0XHQpO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdlbmVyYXRlIHRoZSBiaW5kaW5nIGluZm9ybWF0aW9uIGZvciBhIHRhYmxlIHJvdy5cblx0ICpcblx0ICogQHBhcmFtIG9UaGlzIFRoZSBpbnN0YW5jZSBvZiB0aGUgaW5uZXIgbW9kZWwgb2YgdGhlIHRhYmxlIGJ1aWxkaW5nIGJsb2NrXG5cdCAqIEByZXR1cm5zIC0gUmV0dXJucyB0aGUgYmluZGluZyBpbmZvcm1hdGlvbiBvZiBhIHRhYmxlIHJvd1xuXHQgKi9cblx0Z2V0Um93c0JpbmRpbmdJbmZvOiBmdW5jdGlvbiAob1RoaXM6IGFueSkge1xuXHRcdGNvbnN0IGRhdGFNb2RlbFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob1RoaXMuY29sbGVjdGlvbiwgb1RoaXMuY29udGV4dFBhdGgpO1xuXHRcdGNvbnN0IHBhdGggPSBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKGRhdGFNb2RlbFBhdGgpIHx8IGdldFRhcmdldE9iamVjdFBhdGgoZGF0YU1vZGVsUGF0aCk7XG5cdFx0Y29uc3Qgb1Jvd0JpbmRpbmcgPSB7XG5cdFx0XHR1aTVvYmplY3Q6IHRydWUsXG5cdFx0XHRzdXNwZW5kZWQ6IGZhbHNlLFxuXHRcdFx0cGF0aDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhwYXRoKSxcblx0XHRcdHBhcmFtZXRlcnM6IHtcblx0XHRcdFx0JGNvdW50OiB0cnVlXG5cdFx0XHR9IGFzIGFueSxcblx0XHRcdGV2ZW50czoge30gYXMgYW55XG5cdFx0fTtcblxuXHRcdGlmICghb1RoaXMudGFibGVEZWZpbml0aW9uLmdldE9iamVjdChcImVuYWJsZUFuYWx5dGljc1wiKSkge1xuXHRcdFx0Ly8gRG9uJ3QgYWRkICRzZWxlY3QgcGFyYW1ldGVyIGluIGNhc2Ugb2YgYW4gYW5hbHl0aWNhbCBxdWVyeSwgdGhpcyBpc24ndCBzdXBwb3J0ZWQgYnkgdGhlIG1vZGVsXG5cdFx0XHRjb25zdCBzU2VsZWN0ID0gVGFibGVIZWxwZXIuY3JlYXRlJFNlbGVjdChvVGhpcyk7XG5cdFx0XHRpZiAoc1NlbGVjdCkge1xuXHRcdFx0XHRvUm93QmluZGluZy5wYXJhbWV0ZXJzLiRzZWxlY3QgPSBgJyR7c1NlbGVjdH0nYDtcblx0XHRcdH1cblxuXHRcdFx0Ly8gd2UgbGF0ZXIgZW5zdXJlIGluIHRoZSBkZWxlZ2F0ZSBvbmx5IG9uZSBsaXN0IGJpbmRpbmcgZm9yIGEgZ2l2ZW4gdGFyZ2V0Q29sbGVjdGlvblBhdGggaGFzIHRoZSBmbGFnICQkZ2V0S2VlcEFsaXZlQ29udGV4dFxuXHRcdFx0b1Jvd0JpbmRpbmcucGFyYW1ldGVycy4kJGdldEtlZXBBbGl2ZUNvbnRleHQgPSB0cnVlO1xuXHRcdH1cblxuXHRcdG9Sb3dCaW5kaW5nLnBhcmFtZXRlcnMuJCRncm91cElkID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhcIiRhdXRvLldvcmtlcnNcIik7XG5cdFx0b1Jvd0JpbmRpbmcucGFyYW1ldGVycy4kJHVwZGF0ZUdyb3VwSWQgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKFwiJGF1dG9cIik7XG5cdFx0b1Jvd0JpbmRpbmcucGFyYW1ldGVycy4kJG93blJlcXVlc3QgPSB0cnVlO1xuXHRcdG9Sb3dCaW5kaW5nLnBhcmFtZXRlcnMuJCRwYXRjaFdpdGhvdXRTaWRlRWZmZWN0cyA9IHRydWU7XG5cblx0XHRvUm93QmluZGluZy5ldmVudHMucGF0Y2hTZW50ID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhcIi5lZGl0Rmxvdy5oYW5kbGVQYXRjaFNlbnRcIik7XG5cdFx0b1Jvd0JpbmRpbmcuZXZlbnRzLmRhdGFSZWNlaXZlZCA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCJBUEkub25JbnRlcm5hbERhdGFSZWNlaXZlZFwiKTtcblx0XHRvUm93QmluZGluZy5ldmVudHMuZGF0YVJlcXVlc3RlZCA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCJBUEkub25JbnRlcm5hbERhdGFSZXF1ZXN0ZWRcIik7XG5cdFx0Ly8gcmVjcmVhdGUgYW4gZW1wdHkgcm93IHdoZW4gb25lIGlzIGFjdGl2YXRlZFxuXHRcdG9Sb3dCaW5kaW5nLmV2ZW50cy5jcmVhdGVBY3RpdmF0ZSA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoXCIuZWRpdEZsb3cuaGFuZGxlQ3JlYXRlQWN0aXZhdGVcIik7XG5cblx0XHRpZiAob1RoaXMub25Db250ZXh0Q2hhbmdlICE9PSB1bmRlZmluZWQgJiYgb1RoaXMub25Db250ZXh0Q2hhbmdlICE9PSBudWxsKSB7XG5cdFx0XHRvUm93QmluZGluZy5ldmVudHMuY2hhbmdlID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvVGhpcy5vbkNvbnRleHRDaGFuZ2UpO1xuXHRcdH1cblx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9Sb3dCaW5kaW5nKTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBjaGVjayB0aGUgdmFsaWRpdHkgb2YgdGhlIGZpZWxkcyBpbiB0aGUgY3JlYXRpb24gcm93LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgdmFsaWRhdGVDcmVhdGlvblJvd0ZpZWxkc1xuXHQgKiBAcGFyYW0gb0ZpZWxkVmFsaWRpdHlPYmplY3QgQ3VycmVudCBPYmplY3QgaG9sZGluZyB0aGUgZmllbGRzXG5cdCAqIEByZXR1cm5zIGB0cnVlYCBpZiBhbGwgdGhlIGZpZWxkcyBpbiB0aGUgY3JlYXRpb24gcm93IGFyZSB2YWxpZCwgYGZhbHNlYCBvdGhlcndpc2Vcblx0ICovXG5cdHZhbGlkYXRlQ3JlYXRpb25Sb3dGaWVsZHM6IGZ1bmN0aW9uIChvRmllbGRWYWxpZGl0eU9iamVjdDogYW55KSB7XG5cdFx0aWYgKCFvRmllbGRWYWxpZGl0eU9iamVjdCkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gKFxuXHRcdFx0T2JqZWN0LmtleXMob0ZpZWxkVmFsaWRpdHlPYmplY3QpLmxlbmd0aCA+IDAgJiZcblx0XHRcdE9iamVjdC5rZXlzKG9GaWVsZFZhbGlkaXR5T2JqZWN0KS5ldmVyeShmdW5jdGlvbiAoa2V5OiBzdHJpbmcpIHtcblx0XHRcdFx0cmV0dXJuIG9GaWVsZFZhbGlkaXR5T2JqZWN0W2tleV1bXCJ2YWxpZGl0eVwiXTtcblx0XHRcdH0pXG5cdFx0KTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIGV4cHJlc3Npb24gZm9yIHRoZSAncHJlc3MnIGV2ZW50IGZvciB0aGUgRGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgcHJlc3NFdmVudERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvblxuXHQgKiBAcGFyYW0gb1RoaXMgQ3VycmVudCBvYmplY3Rcblx0ICogQHBhcmFtIG9EYXRhRmllbGQgVmFsdWUgb2YgdGhlIERhdGFQb2ludFxuXHQgKiBAcGFyYW0gc0VudGl0eVNldE5hbWUgTmFtZSBvZiB0aGUgRW50aXR5U2V0XG5cdCAqIEBwYXJhbSBzT3BlcmF0aW9uQXZhaWxhYmxlTWFwIE9wZXJhdGlvbkF2YWlsYWJsZU1hcCBhcyBzdHJpbmdpZmllZCBKU09OIG9iamVjdFxuXHQgKiBAcGFyYW0gb0FjdGlvbkNvbnRleHQgQWN0aW9uIG9iamVjdFxuXHQgKiBAcGFyYW0gYklzTmF2aWdhYmxlIEFjdGlvbiBlaXRoZXIgdHJpZ2dlcnMgbmF2aWdhdGlvbiBvciBub3Rcblx0ICogQHBhcmFtIGJFbmFibGVBdXRvU2Nyb2xsIEFjdGlvbiBlaXRoZXIgdHJpZ2dlcnMgc2Nyb2xsaW5nIHRvIHRoZSBuZXdseSBjcmVhdGVkIGl0ZW1zIGluIHRoZSByZWxhdGVkIHRhYmxlIG9yIG5vdFxuXHQgKiBAcGFyYW0gc0RlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiBGdW5jdGlvbiBuYW1lIHRvIHByZWZpbGwgZGlhbG9nIHBhcmFtZXRlcnNcblx0ICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvblxuXHQgKi9cblx0cHJlc3NFdmVudERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbjogZnVuY3Rpb24gKFxuXHRcdG9UaGlzOiBhbnksXG5cdFx0b0RhdGFGaWVsZDogYW55LFxuXHRcdHNFbnRpdHlTZXROYW1lOiBzdHJpbmcsXG5cdFx0c09wZXJhdGlvbkF2YWlsYWJsZU1hcDogc3RyaW5nLFxuXHRcdG9BY3Rpb25Db250ZXh0OiBvYmplY3QsXG5cdFx0YklzTmF2aWdhYmxlOiBhbnksXG5cdFx0YkVuYWJsZUF1dG9TY3JvbGw6IGFueSxcblx0XHRzRGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBzdHJpbmdcblx0KSB7XG5cdFx0Y29uc3Qgc0FjdGlvbk5hbWUgPSBvRGF0YUZpZWxkLkFjdGlvbixcblx0XHRcdHNBbm5vdGF0aW9uVGFyZ2V0RW50aXR5VHlwZSA9IG9UaGlzICYmIG9UaGlzLmNvbGxlY3Rpb24uZ2V0T2JqZWN0KFwiJFR5cGVcIiksXG5cdFx0XHRiU3RhdGljQWN0aW9uID1cblx0XHRcdFx0dGhpcy5faXNTdGF0aWNBY3Rpb24ob0FjdGlvbkNvbnRleHQsIHNBY3Rpb25OYW1lKSB8fFxuXHRcdFx0XHR0aGlzLl9pc0FjdGlvbk92ZXJsb2FkT25EaWZmZXJlbnRUeXBlKHNBY3Rpb25OYW1lLCBzQW5ub3RhdGlvblRhcmdldEVudGl0eVR5cGUpLFxuXHRcdFx0b1BhcmFtcyA9IHtcblx0XHRcdFx0Y29udGV4dHM6ICFiU3RhdGljQWN0aW9uID8gXCIke2ludGVybmFsPnNlbGVjdGVkQ29udGV4dHN9XCIgOiBudWxsLFxuXHRcdFx0XHRiU3RhdGljQWN0aW9uOiBiU3RhdGljQWN0aW9uID8gYlN0YXRpY0FjdGlvbiA6IHVuZGVmaW5lZCxcblx0XHRcdFx0ZW50aXR5U2V0TmFtZTogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzRW50aXR5U2V0TmFtZSksXG5cdFx0XHRcdGFwcGxpY2FibGVDb250ZXh0OiAhYlN0YXRpY0FjdGlvbiA/IFwiJHtpbnRlcm5hbD5keW5hbWljQWN0aW9ucy9cIiArIG9EYXRhRmllbGQuQWN0aW9uICsgXCIvYUFwcGxpY2FibGUvfVwiIDogbnVsbCxcblx0XHRcdFx0bm90QXBwbGljYWJsZUNvbnRleHQ6ICFiU3RhdGljQWN0aW9uID8gXCIke2ludGVybmFsPmR5bmFtaWNBY3Rpb25zL1wiICsgb0RhdGFGaWVsZC5BY3Rpb24gKyBcIi9hTm90QXBwbGljYWJsZS99XCIgOiBudWxsLFxuXHRcdFx0XHRpc05hdmlnYWJsZTogYklzTmF2aWdhYmxlLFxuXHRcdFx0XHRlbmFibGVBdXRvU2Nyb2xsOiBiRW5hYmxlQXV0b1Njcm9sbCxcblx0XHRcdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBzRGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uID8gXCInXCIgKyBzRGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uICsgXCInXCIgOiB1bmRlZmluZWRcblx0XHRcdH07XG5cblx0XHRyZXR1cm4gQWN0aW9uSGVscGVyLmdldFByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24ob1RoaXMuaWQsIG9EYXRhRmllbGQsIG9QYXJhbXMsIHNPcGVyYXRpb25BdmFpbGFibGVNYXApO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGRldGVybWluZSB0aGUgYmluZGluZyBleHByZXNzaW9uIGZvciAnZW5hYmxlZCcgcHJvcGVydHkgb2YgRGF0YUZpZWxkRm9yQWN0aW9uIGFuZCBEYXRhRmllbGRGb3JJQk4gYWN0aW9ucy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzRGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZFxuXHQgKiBAcGFyYW0gb1RoaXMgVGhlIGluc3RhbmNlIG9mIHRoZSB0YWJsZSBjb250cm9sXG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkIFRoZSB2YWx1ZSBvZiB0aGUgZGF0YSBmaWVsZFxuXHQgKiBAcGFyYW0gb1JlcXVpcmVzQ29udGV4dCBSZXF1aXJlc0NvbnRleHQgZm9yIElCTlxuXHQgKiBAcGFyYW0gYklzRGF0YUZpZWxkRm9ySUJOIEZsYWcgZm9yIElCTlxuXHQgKiBAcGFyYW0gb0FjdGlvbkNvbnRleHQgVGhlIGluc3RhbmNlIG9mIHRoZSBhY3Rpb25cblx0ICogQHBhcmFtIHZBY3Rpb25FbmFibGVkIFN0YXR1cyBvZiBhY3Rpb24gKHNpbmdsZSBvciBtdWx0aXNlbGVjdClcblx0ICogQHJldHVybnMgQSBiaW5kaW5nIGV4cHJlc3Npb24gdG8gZGVmaW5lIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgdGhlIGFjdGlvblxuXHQgKi9cblx0aXNEYXRhRmllbGRGb3JBY3Rpb25FbmFibGVkOiBmdW5jdGlvbiAoXG5cdFx0b1RoaXM6IGFueSxcblx0XHRvRGF0YUZpZWxkOiBhbnksXG5cdFx0b1JlcXVpcmVzQ29udGV4dDogb2JqZWN0LFxuXHRcdGJJc0RhdGFGaWVsZEZvcklCTjogYm9vbGVhbixcblx0XHRvQWN0aW9uQ29udGV4dDogb2JqZWN0LFxuXHRcdHZBY3Rpb25FbmFibGVkOiBzdHJpbmdcblx0KSB7XG5cdFx0Y29uc3Qgc0FjdGlvbk5hbWUgPSBvRGF0YUZpZWxkLkFjdGlvbixcblx0XHRcdHNBbm5vdGF0aW9uVGFyZ2V0RW50aXR5VHlwZSA9IG9UaGlzICYmIG9UaGlzLmNvbGxlY3Rpb24uZ2V0T2JqZWN0KFwiJFR5cGVcIiksXG5cdFx0XHRvVGFibGVEZWZpbml0aW9uID0gb1RoaXMgJiYgb1RoaXMudGFibGVEZWZpbml0aW9uICYmIG9UaGlzLnRhYmxlRGVmaW5pdGlvbi5nZXRPYmplY3QoKSxcblx0XHRcdGJTdGF0aWNBY3Rpb24gPSB0aGlzLl9pc1N0YXRpY0FjdGlvbihvQWN0aW9uQ29udGV4dCwgc0FjdGlvbk5hbWUpLFxuXHRcdFx0aXNBbmFseXRpY2FsVGFibGUgPSBvVGFibGVEZWZpbml0aW9uICYmIG9UYWJsZURlZmluaXRpb24uZW5hYmxlQW5hbHl0aWNzO1xuXG5cdFx0Ly8gQ2hlY2sgZm9yIGFjdGlvbiBvdmVybG9hZCBvbiBhIGRpZmZlcmVudCBFbnRpdHkgdHlwZS5cblx0XHQvLyBJZiB5ZXMsIHRhYmxlIHJvdyBzZWxlY3Rpb24gaXMgbm90IHJlcXVpcmVkIHRvIGVuYWJsZSB0aGlzIGFjdGlvbi5cblx0XHRpZiAoIWJJc0RhdGFGaWVsZEZvcklCTiAmJiB0aGlzLl9pc0FjdGlvbk92ZXJsb2FkT25EaWZmZXJlbnRUeXBlKHNBY3Rpb25OYW1lLCBzQW5ub3RhdGlvblRhcmdldEVudGl0eVR5cGUpKSB7XG5cdFx0XHQvLyBBY3Rpb24gb3ZlcmxvYWQgZGVmaW5lZCBvbiBkaWZmZXJlbnQgZW50aXR5IHR5cGVcblx0XHRcdGNvbnN0IG9PcGVyYXRpb25BdmFpbGFibGVNYXAgPSBvVGFibGVEZWZpbml0aW9uICYmIEpTT04ucGFyc2Uob1RhYmxlRGVmaW5pdGlvbi5vcGVyYXRpb25BdmFpbGFibGVNYXApO1xuXHRcdFx0aWYgKG9PcGVyYXRpb25BdmFpbGFibGVNYXAgJiYgb09wZXJhdGlvbkF2YWlsYWJsZU1hcC5oYXNPd25Qcm9wZXJ0eShzQWN0aW9uTmFtZSkpIHtcblx0XHRcdFx0Ly8gQ29yZS5PcGVyYXRpb25BdmFpbGFibGUgYW5ub3RhdGlvbiBkZWZpbmVkIGZvciB0aGUgYWN0aW9uLlxuXHRcdFx0XHQvLyBOZWVkIHRvIHJlZmVyIHRvIGludGVybmFsIG1vZGVsIGZvciBlbmFibGVkIHByb3BlcnR5IG9mIHRoZSBkeW5hbWljIGFjdGlvbi5cblx0XHRcdFx0Ly8gcmV0dXJuIGNvbXBpbGVCaW5kaW5nKGJpbmRpbmdFeHByZXNzaW9uKFwiZHluYW1pY0FjdGlvbnMvXCIgKyBzQWN0aW9uTmFtZSArIFwiL2JFbmFibGVkXCIsIFwiaW50ZXJuYWxcIiksIHRydWUpO1xuXHRcdFx0XHRyZXR1cm4gXCJ7PSAke2ludGVybmFsPmR5bmFtaWNBY3Rpb25zL1wiICsgc0FjdGlvbk5hbWUgKyBcIi9iRW5hYmxlZH0gfVwiO1xuXHRcdFx0fVxuXHRcdFx0Ly8gQ29uc2lkZXIgdGhlIGFjdGlvbiBqdXN0IGxpa2UgYW55IG90aGVyIHN0YXRpYyBEYXRhRmllbGRGb3JBY3Rpb24uXG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0aWYgKCFvUmVxdWlyZXNDb250ZXh0IHx8IGJTdGF0aWNBY3Rpb24pIHtcblx0XHRcdGlmIChiSXNEYXRhRmllbGRGb3JJQk4pIHtcblx0XHRcdFx0Y29uc3Qgc0VudGl0eVNldCA9IG9UaGlzLmNvbGxlY3Rpb24uZ2V0UGF0aCgpO1xuXHRcdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1RoaXMuY29sbGVjdGlvbi5nZXRNb2RlbCgpO1xuXHRcdFx0XHRpZiAodkFjdGlvbkVuYWJsZWQgPT09IFwiZmFsc2VcIiAmJiAhaXNBbmFseXRpY2FsVGFibGUpIHtcblx0XHRcdFx0XHRMb2cud2FybmluZyhcIk5hdmlnYXRpb25BdmFpbGFibGUgYXMgZmFsc2UgaXMgaW5jb3JyZWN0IHVzYWdlXCIpO1xuXHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0fSBlbHNlIGlmIChcblx0XHRcdFx0XHQhaXNBbmFseXRpY2FsVGFibGUgJiZcblx0XHRcdFx0XHRvRGF0YUZpZWxkICYmXG5cdFx0XHRcdFx0b0RhdGFGaWVsZC5OYXZpZ2F0aW9uQXZhaWxhYmxlICYmXG5cdFx0XHRcdFx0b0RhdGFGaWVsZC5OYXZpZ2F0aW9uQXZhaWxhYmxlLiRQYXRoICYmXG5cdFx0XHRcdFx0b01ldGFNb2RlbC5nZXRPYmplY3Qoc0VudGl0eVNldCArIFwiLyRQYXJ0bmVyXCIpID09PSBvRGF0YUZpZWxkLk5hdmlnYXRpb25BdmFpbGFibGUuJFBhdGguc3BsaXQoXCIvXCIpWzBdXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHJldHVybiBcIns9ICR7XCIgKyB2QWN0aW9uRW5hYmxlZC5zdWJzdHIodkFjdGlvbkVuYWJsZWQuaW5kZXhPZihcIi9cIikgKyAxLCB2QWN0aW9uRW5hYmxlZC5sZW5ndGgpICsgXCJ9XCI7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblxuXHRcdGxldCBzRGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZEV4cHJlc3Npb24gPSBcIlwiLFxuXHRcdFx0c051bWJlck9mU2VsZWN0ZWRDb250ZXh0cyxcblx0XHRcdHNBY3Rpb247XG5cdFx0aWYgKGJJc0RhdGFGaWVsZEZvcklCTikge1xuXHRcdFx0aWYgKHZBY3Rpb25FbmFibGVkID09PSBcInRydWVcIiB8fCBpc0FuYWx5dGljYWxUYWJsZSkge1xuXHRcdFx0XHRzRGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZEV4cHJlc3Npb24gPSBcIiV7aW50ZXJuYWw+bnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzfSA+PSAxXCI7XG5cdFx0XHR9IGVsc2UgaWYgKHZBY3Rpb25FbmFibGVkID09PSBcImZhbHNlXCIpIHtcblx0XHRcdFx0TG9nLndhcm5pbmcoXCJOYXZpZ2F0aW9uQXZhaWxhYmxlIGFzIGZhbHNlIGlzIGluY29ycmVjdCB1c2FnZVwiKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c051bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9IFwiJXtpbnRlcm5hbD5udW1iZXJPZlNlbGVjdGVkQ29udGV4dHN9ID49IDFcIjtcblx0XHRcdFx0c0FjdGlvbiA9IFwiJHtpbnRlcm5hbD5pYm4vXCIgKyBvRGF0YUZpZWxkLlNlbWFudGljT2JqZWN0ICsgXCItXCIgKyBvRGF0YUZpZWxkLkFjdGlvbiArIFwiL2JFbmFibGVkXCIgKyBcIn1cIjtcblx0XHRcdFx0c0RhdGFGaWVsZEZvckFjdGlvbkVuYWJsZWRFeHByZXNzaW9uID0gc051bWJlck9mU2VsZWN0ZWRDb250ZXh0cyArIFwiICYmIFwiICsgc0FjdGlvbjtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0c051bWJlck9mU2VsZWN0ZWRDb250ZXh0cyA9IEFjdGlvbkhlbHBlci5nZXROdW1iZXJPZkNvbnRleHRzRXhwcmVzc2lvbih2QWN0aW9uRW5hYmxlZCk7XG5cdFx0XHRzQWN0aW9uID0gXCIke2ludGVybmFsPmR5bmFtaWNBY3Rpb25zL1wiICsgb0RhdGFGaWVsZC5BY3Rpb24gKyBcIi9iRW5hYmxlZFwiICsgXCJ9XCI7XG5cdFx0XHRzRGF0YUZpZWxkRm9yQWN0aW9uRW5hYmxlZEV4cHJlc3Npb24gPSBzTnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzICsgXCIgJiYgXCIgKyBzQWN0aW9uO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJ7PSBcIiArIHNEYXRhRmllbGRGb3JBY3Rpb25FbmFibGVkRXhwcmVzc2lvbiArIFwifVwiO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBwcmVzcyBldmVudCBleHByZXNzaW9uIGZvciBDcmVhdGVCdXR0b24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBwcmVzc0V2ZW50Rm9yQ3JlYXRlQnV0dG9uXG5cdCAqIEBwYXJhbSBvVGhpcyBDdXJyZW50IE9iamVjdFxuXHQgKiBAcGFyYW0gYkNtZEV4ZWN1dGlvbkZsYWcgRmxhZyB0byBpbmRpY2F0ZSB0aGF0IHRoZSBmdW5jdGlvbiBpcyBjYWxsZWQgZnJvbSBDTUQgRXhlY3V0aW9uXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBwcmVzcyBldmVudCBvZiB0aGUgY3JlYXRlIGJ1dHRvblxuXHQgKi9cblx0cHJlc3NFdmVudEZvckNyZWF0ZUJ1dHRvbjogZnVuY3Rpb24gKG9UaGlzOiBhbnksIGJDbWRFeGVjdXRpb25GbGFnOiBib29sZWFuKSB7XG5cdFx0Y29uc3Qgc0NyZWF0aW9uTW9kZSA9IG9UaGlzLmNyZWF0aW9uTW9kZTtcblx0XHRsZXQgb1BhcmFtczogYW55O1xuXHRcdGNvbnN0IHNNZGNUYWJsZSA9IGJDbWRFeGVjdXRpb25GbGFnID8gXCIkeyRzb3VyY2U+fS5nZXRQYXJlbnQoKVwiIDogXCIkeyRzb3VyY2U+fS5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKVwiO1xuXHRcdGxldCBzUm93QmluZGluZyA9IHNNZGNUYWJsZSArIFwiLmdldFJvd0JpbmRpbmcoKSB8fCBcIiArIHNNZGNUYWJsZSArIFwiLmRhdGEoJ3Jvd3NCaW5kaW5nSW5mbycpLnBhdGhcIjtcblxuXHRcdHN3aXRjaCAoc0NyZWF0aW9uTW9kZSkge1xuXHRcdFx0Y2FzZSBDcmVhdGlvbk1vZGUuRXh0ZXJuYWw6XG5cdFx0XHRcdC8vIG5hdmlnYXRlIHRvIGV4dGVybmFsIHRhcmdldCBmb3IgY3JlYXRpbmcgbmV3IGVudHJpZXNcblx0XHRcdFx0Ly8gVE9ETzogQWRkIHJlcXVpcmVkIHBhcmFtZXRlcnNcblx0XHRcdFx0b1BhcmFtcyA9IHtcblx0XHRcdFx0XHRjcmVhdGlvbk1vZGU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoQ3JlYXRpb25Nb2RlLkV4dGVybmFsKSxcblx0XHRcdFx0XHRvdXRib3VuZDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvVGhpcy5jcmVhdGVPdXRib3VuZClcblx0XHRcdFx0fTtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLkNyZWF0aW9uUm93OlxuXHRcdFx0XHRvUGFyYW1zID0ge1xuXHRcdFx0XHRcdGNyZWF0aW9uTW9kZTogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhDcmVhdGlvbk1vZGUuQ3JlYXRpb25Sb3cpLFxuXHRcdFx0XHRcdGNyZWF0aW9uUm93OiBcIiR7JHNvdXJjZT59XCIsXG5cdFx0XHRcdFx0Y3JlYXRlQXRFbmQ6IG9UaGlzLmNyZWF0ZUF0RW5kICE9PSB1bmRlZmluZWQgPyBvVGhpcy5jcmVhdGVBdEVuZCA6IGZhbHNlXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0c1Jvd0JpbmRpbmcgPSBcIiR7JHNvdXJjZT59LmdldFBhcmVudCgpLl9nZXRSb3dCaW5kaW5nKClcIjtcblx0XHRcdFx0YnJlYWs7XG5cblx0XHRcdGNhc2UgQ3JlYXRpb25Nb2RlLk5ld1BhZ2U6XG5cdFx0XHRjYXNlIENyZWF0aW9uTW9kZS5JbmxpbmU6XG5cdFx0XHRcdG9QYXJhbXMgPSB7XG5cdFx0XHRcdFx0Y3JlYXRpb25Nb2RlOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNDcmVhdGlvbk1vZGUpLFxuXHRcdFx0XHRcdGNyZWF0ZUF0RW5kOiBvVGhpcy5jcmVhdGVBdEVuZCAhPT0gdW5kZWZpbmVkID8gb1RoaXMuY3JlYXRlQXRFbmQgOiBmYWxzZSxcblx0XHRcdFx0XHR0YWJsZUlkOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9UaGlzLmlkKVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmIChvVGhpcy5jcmVhdGVOZXdBY3Rpb24pIHtcblx0XHRcdFx0XHRvUGFyYW1zLm5ld0FjdGlvbiA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob1RoaXMuY3JlYXRlTmV3QWN0aW9uKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0Y2FzZSBDcmVhdGlvbk1vZGUuSW5saW5lQ3JlYXRpb25Sb3dzOlxuXHRcdFx0XHRyZXR1cm4gQ29tbW9uSGVscGVyLmdlbmVyYXRlRnVuY3Rpb24oXCIuX2VkaXRGbG93LnNjcm9sbEFuZEZvY3VzT25JbmFjdGl2ZVJvd1wiLCBzTWRjVGFibGUpO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0Ly8gdW5zdXBwb3J0ZWRcblx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFwiLmVkaXRGbG93LmNyZWF0ZURvY3VtZW50XCIsIHNSb3dCaW5kaW5nLCBDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob1BhcmFtcykpO1xuXHR9LFxuXG5cdGdldElCTkRhdGE6IGZ1bmN0aW9uIChvVGhpczogYW55KSB7XG5cdFx0Y29uc3Qgb3V0Ym91bmREZXRhaWwgPSBvVGhpcy5jcmVhdGVPdXRib3VuZERldGFpbDtcblx0XHRpZiAob3V0Ym91bmREZXRhaWwpIHtcblx0XHRcdGNvbnN0IG9JQk5EYXRhID0ge1xuXHRcdFx0XHRzZW1hbnRpY09iamVjdDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvdXRib3VuZERldGFpbC5zZW1hbnRpY09iamVjdCksXG5cdFx0XHRcdGFjdGlvbjogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvdXRib3VuZERldGFpbC5hY3Rpb24pXG5cdFx0XHR9O1xuXHRcdFx0cmV0dXJuIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvSUJORGF0YSk7XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBwcmVzcyBldmVudCBleHByZXNzaW9uIGZvciAnRGVsZXRlJyBidXR0b24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBwcmVzc0V2ZW50Rm9yRGVsZXRlQnV0dG9uXG5cdCAqIEBwYXJhbSBvVGhpcyBDdXJyZW50IE9iamVjdFxuXHQgKiBAcGFyYW0gc0VudGl0eVNldE5hbWUgRW50aXR5U2V0IG5hbWVcblx0ICogQHBhcmFtIG9IZWFkZXJJbmZvIEhlYWRlciBJbmZvXG5cdCAqIEBwYXJhbSBmdWxsY29udGV4dFBhdGggQ29udGV4dCBQYXRoXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBwcmVzcyBldmVudCBvZiB0aGUgJ0RlbGV0ZScgYnV0dG9uXG5cdCAqL1xuXHRwcmVzc0V2ZW50Rm9yRGVsZXRlQnV0dG9uOiBmdW5jdGlvbiAob1RoaXM6IGFueSwgc0VudGl0eVNldE5hbWU6IHN0cmluZywgb0hlYWRlckluZm86IGFueSwgZnVsbGNvbnRleHRQYXRoOiBhbnkpIHtcblx0XHRjb25zdCBzRGVsZXRhYmxlQ29udGV4dHMgPSBcIiR7aW50ZXJuYWw+ZGVsZXRhYmxlQ29udGV4dHN9XCI7XG5cdFx0bGV0IHNUaXRsZSwgdGl0bGVWYWx1ZUV4cHJlc3Npb24sIHNUaXRsZUV4cHJlc3Npb24sIHNEZXNjcmlwdGlvbiwgZGVzY3JpcHRpb25FeHByZXNzaW9uLCBzRGVzY3JpcHRpb25FeHByZXNzaW9uO1xuXHRcdGlmIChvSGVhZGVySW5mbz8uVGl0bGUpIHtcblx0XHRcdGlmICh0eXBlb2Ygb0hlYWRlckluZm8uVGl0bGUuVmFsdWUgPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdFx0c1RpdGxlRXhwcmVzc2lvbiA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0hlYWRlckluZm8uVGl0bGUuVmFsdWUpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c1RpdGxlID0gQmluZGluZ1Rvb2xraXQuZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKG9IZWFkZXJJbmZvPy5UaXRsZT8uVmFsdWUpO1xuXHRcdFx0XHRpZiAoQmluZGluZ1Rvb2xraXQuaXNDb25zdGFudChzVGl0bGUpIHx8IEJpbmRpbmdUb29sa2l0LmlzUGF0aEluTW9kZWxFeHByZXNzaW9uKHNUaXRsZSkpIHtcblx0XHRcdFx0XHR0aXRsZVZhbHVlRXhwcmVzc2lvbiA9IGZvcm1hdFZhbHVlUmVjdXJzaXZlbHkoc1RpdGxlLCBmdWxsY29udGV4dFBhdGgpO1xuXHRcdFx0XHRcdHNUaXRsZUV4cHJlc3Npb24gPSBCaW5kaW5nVG9vbGtpdC5jb21waWxlRXhwcmVzc2lvbih0aXRsZVZhbHVlRXhwcmVzc2lvbik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKG9IZWFkZXJJbmZvPy5EZXNjcmlwdGlvbikge1xuXHRcdFx0aWYgKHR5cGVvZiBvSGVhZGVySW5mby5EZXNjcmlwdGlvbi5WYWx1ZSA9PT0gXCJzdHJpbmdcIikge1xuXHRcdFx0XHRzRGVzY3JpcHRpb25FeHByZXNzaW9uID0gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvSGVhZGVySW5mby5EZXNjcmlwdGlvbi5WYWx1ZSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzRGVzY3JpcHRpb24gPSBCaW5kaW5nVG9vbGtpdC5nZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24ob0hlYWRlckluZm8/LkRlc2NyaXB0aW9uPy5WYWx1ZSk7XG5cdFx0XHRcdGlmIChCaW5kaW5nVG9vbGtpdC5pc0NvbnN0YW50KHNEZXNjcmlwdGlvbikgfHwgQmluZGluZ1Rvb2xraXQuaXNQYXRoSW5Nb2RlbEV4cHJlc3Npb24oc0Rlc2NyaXB0aW9uKSkge1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uRXhwcmVzc2lvbiA9IGZvcm1hdFZhbHVlUmVjdXJzaXZlbHkoc0Rlc2NyaXB0aW9uLCBmdWxsY29udGV4dFBhdGgpO1xuXHRcdFx0XHRcdHNEZXNjcmlwdGlvbkV4cHJlc3Npb24gPSBCaW5kaW5nVG9vbGtpdC5jb21waWxlRXhwcmVzc2lvbihkZXNjcmlwdGlvbkV4cHJlc3Npb24pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGNvbnN0IG9QYXJhbXMgPSB7XG5cdFx0XHRpZDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvVGhpcy5pZCksXG5cdFx0XHRlbnRpdHlTZXROYW1lOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNFbnRpdHlTZXROYW1lKSxcblx0XHRcdG51bWJlck9mU2VsZWN0ZWRDb250ZXh0czogXCIke2ludGVybmFsPnNlbGVjdGVkQ29udGV4dHN9Lmxlbmd0aFwiLFxuXHRcdFx0dW5TYXZlZENvbnRleHRzOiBcIiR7aW50ZXJuYWw+dW5TYXZlZENvbnRleHRzfVwiLFxuXHRcdFx0bG9ja2VkQ29udGV4dHM6IFwiJHtpbnRlcm5hbD5sb2NrZWRDb250ZXh0c31cIixcblx0XHRcdGNvbnRyb2xJZDogXCIke2ludGVybmFsPmNvbnRyb2xJZH1cIixcblx0XHRcdHRpdGxlOiBzVGl0bGVFeHByZXNzaW9uLFxuXHRcdFx0ZGVzY3JpcHRpb246IHNEZXNjcmlwdGlvbkV4cHJlc3Npb25cblx0XHR9O1xuXG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFwiLmVkaXRGbG93LmRlbGV0ZU11bHRpcGxlRG9jdW1lbnRzXCIsIHNEZWxldGFibGVDb250ZXh0cywgQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9QYXJhbXMpKTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBoYW5kbGUgdGhlICdlbmFibGUnIGFuZCAnZGlzYWJsZScgc3RhdGUgb2YgdGhlIHRhYmxlJ3MgJ0RlbGV0ZScgYnV0dG9uIGlmIHRoaXMgaW5mb3JtYXRpb24gaXMgcmVxdWVzdGVkIGluIHRoZSBzaWRlIGVmZmVjdHMuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBoYW5kbGVUYWJsZURlbGV0ZUVuYWJsZW1lbnRGb3JTaWRlRWZmZWN0c1xuXHQgKiBAcGFyYW0gb1RhYmxlIFRhYmxlIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBvSW50ZXJuYWxNb2RlbENvbnRleHQgVGhlIGludGVybmFsIG1vZGVsIGNvbnRleHRcblx0ICovXG5cdGhhbmRsZVRhYmxlRGVsZXRlRW5hYmxlbWVudEZvclNpZGVFZmZlY3RzOiBmdW5jdGlvbiAob1RhYmxlOiBUYWJsZSwgb0ludGVybmFsTW9kZWxDb250ZXh0OiBJbnRlcm5hbE1vZGVsQ29udGV4dCkge1xuXHRcdGlmIChvVGFibGUgJiYgb0ludGVybmFsTW9kZWxDb250ZXh0KSB7XG5cdFx0XHRjb25zdCBzRGVsZXRhYmxlUGF0aCA9IFRhYmxlSGVscGVyLmdldERlbGV0YWJsZVBhdGhGb3JUYWJsZShvVGFibGUpLFxuXHRcdFx0XHRhU2VsZWN0ZWRDb250ZXh0cyA9IChvVGFibGUgYXMgYW55KS5nZXRTZWxlY3RlZENvbnRleHRzKCksXG5cdFx0XHRcdGFEZWxldGFibGVDb250ZXh0cyA9IFtdO1xuXG5cdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJkZWxldGVFbmFibGVkXCIsIGZhbHNlKTtcblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYVNlbGVjdGVkQ29udGV4dHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdFx0aWYgKHR5cGVvZiBzRGVsZXRhYmxlUGF0aCA9PT0gXCJzdHJpbmdcIiAmJiBzRGVsZXRhYmxlUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb1NlbGVjdGVkQ29udGV4dCA9IGFTZWxlY3RlZENvbnRleHRzW2ldO1xuXHRcdFx0XHRcdGlmIChvU2VsZWN0ZWRDb250ZXh0ICYmIG9TZWxlY3RlZENvbnRleHQuZ2V0UHJvcGVydHkoc0RlbGV0YWJsZVBhdGgpKSB7XG5cdFx0XHRcdFx0XHRvSW50ZXJuYWxNb2RlbENvbnRleHQuc2V0UHJvcGVydHkoXCJkZWxldGVFbmFibGVkXCIsIHRydWUpO1xuXHRcdFx0XHRcdFx0YURlbGV0YWJsZUNvbnRleHRzLnB1c2gob1NlbGVjdGVkQ29udGV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShcImRlbGV0YWJsZUNvbnRleHRzXCIsIGFEZWxldGFibGVDb250ZXh0cyk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IHRoZSBkZWxldGUgcmVzdHJpY2l0aW9ucyBQYXRoIGFzc29jaWF0ZWQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXREZWxldGFibGVQYXRoRm9yVGFibGVcblx0ICogQHBhcmFtIHRhYmxlIFRhYmxlIGluc3RhbmNlXG5cdCAqIEByZXR1cm5zIFBhdGggYXNzb2NpYXRlZCB3aXRoIGRlbGV0ZSdzIGVuYWJsZSBhbmQgZGlzYWJsZVxuXHQgKi9cblx0Z2V0RGVsZXRhYmxlUGF0aEZvclRhYmxlOiBmdW5jdGlvbiAodGFibGU6IFRhYmxlKTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRsZXQgZGVsZXRhYmxlUGF0aDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRcdGNvbnN0IHJvd0JpbmRpbmcgPSB0YWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cblx0XHRpZiAocm93QmluZGluZykge1xuXHRcdFx0Y29uc3QgbWV0YU1vZGVsID0gdGFibGUuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRcdGxldCBwYXRoID0gcm93QmluZGluZy5nZXRQYXRoKCk7XG5cdFx0XHRjb25zdCBjb250ZXh0UGF0aCA9IHJvd0JpbmRpbmcuZ2V0Q29udGV4dCgpPy5nZXRQYXRoKCk7XG5cdFx0XHRpZiAoY29udGV4dFBhdGgpIHtcblx0XHRcdFx0Y29uc3QgbWV0YVBhdGggPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgoY29udGV4dFBhdGgpO1xuXHRcdFx0XHRjb25zdCBuYXZpZ2F0aW9uUHJvcGVydHlQYXRoID0gbWV0YU1vZGVsLmdldE9iamVjdChtZXRhUGF0aCk/LltcIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCJdPy5bcGF0aF07XG5cdFx0XHRcdGlmIChuYXZpZ2F0aW9uUHJvcGVydHlQYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRwYXRoID0gYC8ke25hdmlnYXRpb25Qcm9wZXJ0eVBhdGh9YDtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0ZGVsZXRhYmxlUGF0aCA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7cGF0aH1AT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWxldGVSZXN0cmljdGlvbnMvRGVsZXRhYmxlYCk/LiRQYXRoO1xuXHRcdH1cblxuXHRcdHJldHVybiBkZWxldGFibGVQYXRoO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gc2V0IHZpc2liaWxpdHkgb2YgY29sdW1uIGhlYWRlciBsYWJlbC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIHNldEhlYWRlckxhYmVsVmlzaWJpbGl0eVxuXHQgKiBAcGFyYW0gZGF0YWZpZWxkIERhdGFGaWVsZFxuXHQgKiBAcGFyYW0gZGF0YUZpZWxkQ29sbGVjdGlvbiBMaXN0IG9mIGl0ZW1zIGluc2lkZSBhIGZpZWxkZ3JvdXAgKGlmIGFueSlcblx0ICogQHJldHVybnMgYHRydWVgIGlmIHRoZSBoZWFkZXIgbGFiZWwgbmVlZHMgdG8gYmUgdmlzaWJsZSBlbHNlIGZhbHNlLlxuXHQgKi9cblx0c2V0SGVhZGVyTGFiZWxWaXNpYmlsaXR5OiBmdW5jdGlvbiAoZGF0YWZpZWxkOiBhbnksIGRhdGFGaWVsZENvbGxlY3Rpb246IGFueVtdKSB7XG5cdFx0Ly8gSWYgSW5saW5lIGJ1dHRvbi9uYXZpZ2F0aW9uIGFjdGlvbiwgcmV0dXJuIGZhbHNlLCBlbHNlIHRydWU7XG5cdFx0aWYgKCFkYXRhRmllbGRDb2xsZWN0aW9uKSB7XG5cdFx0XHRpZiAoZGF0YWZpZWxkLiRUeXBlLmluZGV4T2YoXCJEYXRhRmllbGRGb3JBY3Rpb25cIikgPiAtMSAmJiBkYXRhZmllbGQuSW5saW5lKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHRcdGlmIChkYXRhZmllbGQuJFR5cGUuaW5kZXhPZihcIkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvblwiKSA+IC0xICYmIGRhdGFmaWVsZC5JbmxpbmUpIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXG5cdFx0Ly8gSW4gRmllbGRncm91cCwgSWYgTk9UIGFsbCBkYXRhZmllbGQvZGF0YWZpZWxkRm9yQW5ub3RhdGlvbiBleGlzdHMgd2l0aCBoaWRkZW4sIHJldHVybiB0cnVlO1xuXHRcdHJldHVybiBkYXRhRmllbGRDb2xsZWN0aW9uLnNvbWUoZnVuY3Rpb24gKG9EQzogYW55KSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChvREMuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkXCIgfHxcblx0XHRcdFx0XHRvREMuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiKSAmJlxuXHRcdFx0XHRvRENbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdICE9PSB0cnVlXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgVGFyZ2V0IFZhbHVlICgjIG9mIHN0YXJzKSBmcm9tIFZpc3VhbGl6YXRpb24gUmF0aW5nLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0VmFsdWVPblJhdGluZ0ZpZWxkXG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkIERhdGFQb2ludCdzIFZhbHVlXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9iamVjdCBvZiB0aGUgTGluZUl0ZW1cblx0ICogQHJldHVybnMgVGhlIG51bWJlciBmb3IgRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiBUYXJnZXQgVmFsdWVcblx0ICovXG5cdGdldFZhbHVlT25SYXRpbmdGaWVsZDogZnVuY3Rpb24gKG9EYXRhRmllbGQ6IGFueSwgb0NvbnRleHQ6IGFueSkge1xuXHRcdC8vIGZvciBGaWVsZEdyb3VwIGNvbnRhaW5pbmcgdmlzdWFsaXphdGlvblR5cGVSYXRpbmdcblx0XHRpZiAob0RhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCIpIHtcblx0XHRcdC8vIEZvciBhIGRhdGEgZmllbGQgaGF2aW5nIFJhdGluZyBhcyB2aXN1YWxpemF0aW9uIHR5cGVcblx0XHRcdGlmIChcblx0XHRcdFx0b0NvbnRleHQuY29udGV4dC5nZXRPYmplY3QoXCJUYXJnZXQvJEFubm90YXRpb25QYXRoXCIpLmluZGV4T2YoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50XCIpID4gLTEgJiZcblx0XHRcdFx0b0NvbnRleHQuY29udGV4dC5nZXRPYmplY3QoXCJUYXJnZXQvJEFubm90YXRpb25QYXRoLyRUeXBlXCIpID09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50VHlwZVwiICYmXG5cdFx0XHRcdG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KFwiVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aC9WaXN1YWxpemF0aW9uLyRFbnVtTWVtYmVyXCIpID09XG5cdFx0XHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WaXN1YWxpemF0aW9uVHlwZS9SYXRpbmdcIlxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiBvQ29udGV4dC5jb250ZXh0LmdldE9iamVjdChcIlRhcmdldC8kQW5ub3RhdGlvblBhdGgvVGFyZ2V0VmFsdWVcIik7XG5cdFx0XHR9XG5cdFx0XHQvLyBmb3IgRmllbGRHcm91cCBoYXZpbmcgUmF0aW5nIGFzIHZpc3VhbGl6YXRpb24gdHlwZSBpbiBhbnkgb2YgdGhlIGRhdGEgZmllbGRzXG5cdFx0XHRpZiAob0NvbnRleHQuY29udGV4dC5nZXRPYmplY3QoXCJUYXJnZXQvJEFubm90YXRpb25QYXRoXCIpLmluZGV4T2YoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmllbGRHcm91cFwiKSA+IC0xKSB7XG5cdFx0XHRcdGNvbnN0IHNQYXRoRGF0YUZpZWxkcyA9IFwiVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aC9EYXRhL1wiO1xuXHRcdFx0XHRmb3IgKGNvbnN0IGkgaW4gb0NvbnRleHQuY29udGV4dC5nZXRPYmplY3Qoc1BhdGhEYXRhRmllbGRzKSkge1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KGAke3NQYXRoRGF0YUZpZWxkcyArIGl9LyRUeXBlYCkgPT09XG5cdFx0XHRcdFx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiICYmXG5cdFx0XHRcdFx0XHRvQ29udGV4dC5jb250ZXh0XG5cdFx0XHRcdFx0XHRcdC5nZXRPYmplY3QoYCR7c1BhdGhEYXRhRmllbGRzICsgaX0vVGFyZ2V0LyRBbm5vdGF0aW9uUGF0aGApXG5cdFx0XHRcdFx0XHRcdC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFQb2ludFwiKSA+IC0xICYmXG5cdFx0XHRcdFx0XHRvQ29udGV4dC5jb250ZXh0LmdldE9iamVjdChgJHtzUGF0aERhdGFGaWVsZHMgKyBpfS9UYXJnZXQvJEFubm90YXRpb25QYXRoLyRUeXBlYCkgPT1cblx0XHRcdFx0XHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRUeXBlXCIgJiZcblx0XHRcdFx0XHRcdG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KGAke3NQYXRoRGF0YUZpZWxkcyArIGl9L1RhcmdldC8kQW5ub3RhdGlvblBhdGgvVmlzdWFsaXphdGlvbi8kRW51bU1lbWJlcmApID09XG5cdFx0XHRcdFx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVmlzdWFsaXphdGlvblR5cGUvUmF0aW5nXCJcblx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvQ29udGV4dC5jb250ZXh0LmdldE9iamVjdChgJHtzUGF0aERhdGFGaWVsZHMgKyBpfS9UYXJnZXQvJEFubm90YXRpb25QYXRoL1RhcmdldFZhbHVlYCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBUZXh0IGZyb20gRGF0YUZpZWxkRm9yQW5ub3RhdGlvbiBpbnRvIENvbHVtbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFRleHRPbkFjdGlvbkZpZWxkXG5cdCAqIEBwYXJhbSBvRGF0YUZpZWxkIERhdGFQb2ludCdzIFZhbHVlXG5cdCAqIEBwYXJhbSBvQ29udGV4dCBDb250ZXh0IG9iamVjdCBvZiB0aGUgTGluZUl0ZW1cblx0ICogQHJldHVybnMgU3RyaW5nIGZyb20gbGFiZWwgcmVmZXJyaW5nIHRvIGFjdGlvbiB0ZXh0XG5cdCAqL1xuXHRnZXRUZXh0T25BY3Rpb25GaWVsZDogZnVuY3Rpb24gKG9EYXRhRmllbGQ6IGFueSwgb0NvbnRleHQ6IGFueSkge1xuXHRcdGlmIChcblx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCIgfHxcblx0XHRcdG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCJcblx0XHQpIHtcblx0XHRcdHJldHVybiBvRGF0YUZpZWxkLkxhYmVsO1xuXHRcdH1cblx0XHQvLyBmb3IgRmllbGRHcm91cCBjb250YWluaW5nIERhdGFGaWVsZEZvckFubm90YXRpb25cblx0XHRpZiAoXG5cdFx0XHRvRGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFubm90YXRpb25cIiAmJlxuXHRcdFx0b0NvbnRleHQuY29udGV4dC5nZXRPYmplY3QoXCJUYXJnZXQvJEFubm90YXRpb25QYXRoXCIpLmluZGV4T2YoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmllbGRHcm91cFwiKSA+IC0xXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBzUGF0aERhdGFGaWVsZHMgPSBcIlRhcmdldC8kQW5ub3RhdGlvblBhdGgvRGF0YS9cIjtcblx0XHRcdGNvbnN0IGFNdWx0aXBsZUxhYmVscyA9IFtdO1xuXHRcdFx0Zm9yIChjb25zdCBpIGluIG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KHNQYXRoRGF0YUZpZWxkcykpIHtcblx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdG9Db250ZXh0LmNvbnRleHQuZ2V0T2JqZWN0KGAke3NQYXRoRGF0YUZpZWxkcyArIGl9LyRUeXBlYCkgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCIgfHxcblx0XHRcdFx0XHRvQ29udGV4dC5jb250ZXh0LmdldE9iamVjdChgJHtzUGF0aERhdGFGaWVsZHMgKyBpfS8kVHlwZWApID09PVxuXHRcdFx0XHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cIlxuXHRcdFx0XHQpIHtcblx0XHRcdFx0XHRhTXVsdGlwbGVMYWJlbHMucHVzaChvQ29udGV4dC5jb250ZXh0LmdldE9iamVjdChgJHtzUGF0aERhdGFGaWVsZHMgKyBpfS9MYWJlbGApKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gSW4gY2FzZSB0aGVyZSBhcmUgbXVsdGlwbGUgYWN0aW9ucyBpbnNpZGUgYSBGaWVsZCBHcm91cCBzZWxlY3QgdGhlIGxhcmdlc3QgQWN0aW9uIExhYmVsXG5cdFx0XHRpZiAoYU11bHRpcGxlTGFiZWxzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0cmV0dXJuIGFNdWx0aXBsZUxhYmVscy5yZWR1Y2UoZnVuY3Rpb24gKGE6IGFueSwgYjogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIGEubGVuZ3RoID4gYi5sZW5ndGggPyBhIDogYjtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRyZXR1cm4gYU11bHRpcGxlTGFiZWxzLmxlbmd0aCA9PT0gMCA/IHVuZGVmaW5lZCA6IGFNdWx0aXBsZUxhYmVscy50b1N0cmluZygpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0X2dldFJlc3BvbnNpdmVUYWJsZUNvbHVtblNldHRpbmdzOiBmdW5jdGlvbiAob1RoaXM6IGFueSwgb0NvbHVtbjogYW55KSB7XG5cdFx0aWYgKG9UaGlzLnRhYmxlVHlwZSA9PT0gXCJSZXNwb25zaXZlVGFibGVcIikge1xuXHRcdFx0cmV0dXJuIG9Db2x1bW4uc2V0dGluZ3M7XG5cdFx0fVxuXHRcdHJldHVybiBudWxsO1xuXHR9LFxuXG5cdGdldENoYXJ0U2l6ZTogZnVuY3Rpb24gKG9UaGlzOiBhbnksIG9Db2x1bW46IGFueSkge1xuXHRcdGNvbnN0IHNldHRpbmdzID0gdGhpcy5fZ2V0UmVzcG9uc2l2ZVRhYmxlQ29sdW1uU2V0dGluZ3Mob1RoaXMsIG9Db2x1bW4pO1xuXHRcdGlmIChzZXR0aW5ncyAmJiBzZXR0aW5ncy5taWNyb0NoYXJ0U2l6ZSkge1xuXHRcdFx0cmV0dXJuIHNldHRpbmdzLm1pY3JvQ2hhcnRTaXplO1xuXHRcdH1cblx0XHRyZXR1cm4gXCJYU1wiO1xuXHR9LFxuXHRnZXRTaG93T25seUNoYXJ0OiBmdW5jdGlvbiAob1RoaXM6IGFueSwgb0NvbHVtbjogYW55KSB7XG5cdFx0Y29uc3Qgc2V0dGluZ3MgPSB0aGlzLl9nZXRSZXNwb25zaXZlVGFibGVDb2x1bW5TZXR0aW5ncyhvVGhpcywgb0NvbHVtbik7XG5cdFx0aWYgKHNldHRpbmdzICYmIHNldHRpbmdzLnNob3dNaWNyb0NoYXJ0TGFiZWwpIHtcblx0XHRcdHJldHVybiAhc2V0dGluZ3Muc2hvd01pY3JvQ2hhcnRMYWJlbDtcblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH0sXG5cdGdldERlbGVnYXRlOiBmdW5jdGlvbiAoYkVuYWJsZUFuYWx5dGljczogYW55LCBiSGFzTXVsdGlWaXN1YWxpemF0aW9uczogYW55LCBzRW50aXR5TmFtZTogYW55KSB7XG5cdFx0bGV0IG9EZWxlZ2F0ZTtcblx0XHRpZiAoYkhhc011bHRpVmlzdWFsaXphdGlvbnMgPT09IFwidHJ1ZVwiKSB7XG5cdFx0XHRvRGVsZWdhdGUgPSB7XG5cdFx0XHRcdG5hbWU6IGJFbmFibGVBbmFseXRpY3Ncblx0XHRcdFx0XHQ/IFwic2FwL2ZlL21hY3Jvcy90YWJsZS9kZWxlZ2F0ZXMvQW5hbHl0aWNhbEFMUFRhYmxlRGVsZWdhdGVcIlxuXHRcdFx0XHRcdDogXCJzYXAvZmUvbWFjcm9zL3RhYmxlL2RlbGVnYXRlcy9BTFBUYWJsZURlbGVnYXRlXCIsXG5cdFx0XHRcdHBheWxvYWQ6IHtcblx0XHRcdFx0XHRjb2xsZWN0aW9uTmFtZTogc0VudGl0eU5hbWVcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0b0RlbGVnYXRlID0ge1xuXHRcdFx0XHRuYW1lOiBiRW5hYmxlQW5hbHl0aWNzXG5cdFx0XHRcdFx0PyBcInNhcC9mZS9tYWNyb3MvdGFibGUvZGVsZWdhdGVzL0FuYWx5dGljYWxUYWJsZURlbGVnYXRlXCJcblx0XHRcdFx0XHQ6IFwic2FwL2ZlL21hY3Jvcy90YWJsZS9kZWxlZ2F0ZXMvVGFibGVEZWxlZ2F0ZVwiXG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvRGVsZWdhdGUpO1xuXHR9LFxuXHRzZXRJQk5FbmFibGVtZW50OiBmdW5jdGlvbiAob0ludGVybmFsTW9kZWxDb250ZXh0OiBhbnksIG9OYXZpZ2F0aW9uQXZhaWxhYmxlTWFwOiBhbnksIGFTZWxlY3RlZENvbnRleHRzOiBhbnkpIHtcblx0XHRmb3IgKGNvbnN0IHNLZXkgaW4gb05hdmlnYXRpb25BdmFpbGFibGVNYXApIHtcblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5zZXRQcm9wZXJ0eShgaWJuLyR7c0tleX1gLCB7XG5cdFx0XHRcdGJFbmFibGVkOiBmYWxzZSxcblx0XHRcdFx0YUFwcGxpY2FibGU6IFtdLFxuXHRcdFx0XHRhTm90QXBwbGljYWJsZTogW11cblx0XHRcdH0pO1xuXHRcdFx0Y29uc3QgYUFwcGxpY2FibGUgPSBbXSxcblx0XHRcdFx0YU5vdEFwcGxpY2FibGUgPSBbXTtcblx0XHRcdGNvbnN0IHNQcm9wZXJ0eSA9IG9OYXZpZ2F0aW9uQXZhaWxhYmxlTWFwW3NLZXldO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBhU2VsZWN0ZWRDb250ZXh0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRjb25zdCBvU2VsZWN0ZWRDb250ZXh0ID0gYVNlbGVjdGVkQ29udGV4dHNbaV07XG5cdFx0XHRcdGlmIChvU2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChzUHJvcGVydHkpKSB7XG5cdFx0XHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LmdldE1vZGVsKCkuc2V0UHJvcGVydHkoYCR7b0ludGVybmFsTW9kZWxDb250ZXh0LmdldFBhdGgoKX0vaWJuLyR7c0tleX0vYkVuYWJsZWRgLCB0cnVlKTtcblx0XHRcdFx0XHRhQXBwbGljYWJsZS5wdXNoKG9TZWxlY3RlZENvbnRleHQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGFOb3RBcHBsaWNhYmxlLnB1c2gob1NlbGVjdGVkQ29udGV4dCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdG9JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRNb2RlbCgpLnNldFByb3BlcnR5KGAke29JbnRlcm5hbE1vZGVsQ29udGV4dC5nZXRQYXRoKCl9L2libi8ke3NLZXl9L2FBcHBsaWNhYmxlYCwgYUFwcGxpY2FibGUpO1xuXHRcdFx0b0ludGVybmFsTW9kZWxDb250ZXh0LmdldE1vZGVsKCkuc2V0UHJvcGVydHkoYCR7b0ludGVybmFsTW9kZWxDb250ZXh0LmdldFBhdGgoKX0vaWJuLyR7c0tleX0vYU5vdEFwcGxpY2FibGVgLCBhTm90QXBwbGljYWJsZSk7XG5cdFx0fVxuXHR9XG59O1xuKFRhYmxlSGVscGVyLmdldE5hdmlnYXRpb25BdmFpbGFibGVNYXAgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihUYWJsZUhlbHBlci5nZXRWYWx1ZU9uUmF0aW5nRmllbGQgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihUYWJsZUhlbHBlci5nZXRUZXh0T25BY3Rpb25GaWVsZCBhcyBhbnkpLnJlcXVpcmVzSUNvbnRleHQgPSB0cnVlO1xuXG5leHBvcnQgZGVmYXVsdCBUYWJsZUhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7O0VBcUJBLElBQU1BLFlBQVksR0FBR0MsU0FBUyxDQUFDRCxZQUFZO0VBQzNDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLElBQU1FLFdBQVcsR0FBRztJQUNuQjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0MsZUFBZSxFQUFFLFVBQVVDLGNBQXNCLEVBQUVDLFdBQTRCLEVBQUU7TUFDaEYsSUFBSUMsT0FBTztNQUNYLElBQUlGLGNBQWMsRUFBRTtRQUNuQixJQUFJRyxLQUFLLENBQUNDLE9BQU8sQ0FBQ0osY0FBYyxDQUFDLEVBQUU7VUFDbEMsSUFBTUssV0FBVyxHQUFHLElBQUksQ0FBQ0MsNEJBQTRCLENBQUNMLFdBQVcsQ0FBQztVQUNsRSxJQUFJSSxXQUFXLEVBQUU7WUFDaEJILE9BQU8sR0FBR0YsY0FBYyxDQUFDTyxJQUFJLENBQUMsVUFBVUMsTUFBVyxFQUFFO2NBQ3BELE9BQU9BLE1BQU0sQ0FBQ0MsUUFBUSxJQUFJRCxNQUFNLENBQUNFLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQ0MsS0FBSyxLQUFLTixXQUFXO1lBQ3JFLENBQUMsQ0FBQztVQUNILENBQUMsTUFBTTtZQUNOO1lBQ0E7WUFDQUgsT0FBTyxHQUFHRixjQUFjLENBQUMsQ0FBQyxDQUFDO1VBQzVCO1FBQ0QsQ0FBQyxNQUFNO1VBQ05FLE9BQU8sR0FBR0YsY0FBYztRQUN6QjtNQUNEO01BRUEsT0FBTyxDQUFDLENBQUNFLE9BQU8sSUFBSUEsT0FBTyxDQUFDTyxRQUFRLElBQUlQLE9BQU8sQ0FBQ1EsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDRSxhQUFhO0lBQzVFLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDTiw0QkFBNEIsRUFBRSxVQUFV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