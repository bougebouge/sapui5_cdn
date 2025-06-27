/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/controls/Common/Action", "sap/fe/core/converters/helpers/ConfigurableObject", "sap/fe/core/converters/helpers/Key", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/fe/core/templating/DataModelPathHelper", "../helpers/BindingHelper", "../ManifestSettings"], function (Action, ConfigurableObject, Key, BindingToolkit, ModelHelper, DataModelPathHelper, BindingHelper, ManifestSettings) {
  "use strict";

  var _exports = {};
  var ActionType = ManifestSettings.ActionType;
  var UI = BindingHelper.UI;
  var singletonPathVisitor = BindingHelper.singletonPathVisitor;
  var Draft = BindingHelper.Draft;
  var isPathDeletable = DataModelPathHelper.isPathDeletable;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var fn = BindingToolkit.fn;
  var equal = BindingToolkit.equal;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var KeyHelper = Key.KeyHelper;
  var Placement = ConfigurableObject.Placement;
  var getSemanticObjectMapping = Action.getSemanticObjectMapping;
  var getEnabledForAnnotationAction = Action.getEnabledForAnnotationAction;
  var ButtonType = Action.ButtonType;
  /**
   * Retrieves all the data field for actions for the identification annotation
   * They must be
   * - Not statically hidden
   * - Either linked to an Unbound action or to an action which has an OperationAvailable that is not set to false statically.
   *
   * @param entityType The current entity type
   * @param bDetermining The flag which denotes whether or not the action is a determining action
   * @returns An array of DataField for action respecting the input parameter 'bDetermining'
   */
  function getIdentificationDataFieldForActions(entityType, bDetermining) {
    var _entityType$annotatio, _entityType$annotatio2, _entityType$annotatio3;
    return ((_entityType$annotatio = entityType.annotations) === null || _entityType$annotatio === void 0 ? void 0 : (_entityType$annotatio2 = _entityType$annotatio.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : (_entityType$annotatio3 = _entityType$annotatio2.Identification) === null || _entityType$annotatio3 === void 0 ? void 0 : _entityType$annotatio3.filter(function (identificationDataField) {
      var _identificationDataFi, _identificationDataFi2, _identificationDataFi3;
      if ((identificationDataField === null || identificationDataField === void 0 ? void 0 : (_identificationDataFi = identificationDataField.annotations) === null || _identificationDataFi === void 0 ? void 0 : (_identificationDataFi2 = _identificationDataFi.UI) === null || _identificationDataFi2 === void 0 ? void 0 : (_identificationDataFi3 = _identificationDataFi2.Hidden) === null || _identificationDataFi3 === void 0 ? void 0 : _identificationDataFi3.valueOf()) !== true) {
        var _identificationDataFi4, _identificationDataFi5, _identificationDataFi6, _identificationDataFi7, _identificationDataFi8;
        if ((identificationDataField === null || identificationDataField === void 0 ? void 0 : identificationDataField.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAction" && !!identificationDataField.Determining === bDetermining && (!(identificationDataField !== null && identificationDataField !== void 0 && (_identificationDataFi4 = identificationDataField.ActionTarget) !== null && _identificationDataFi4 !== void 0 && _identificationDataFi4.isBound) || (identificationDataField === null || identificationDataField === void 0 ? void 0 : (_identificationDataFi5 = identificationDataField.ActionTarget) === null || _identificationDataFi5 === void 0 ? void 0 : (_identificationDataFi6 = _identificationDataFi5.annotations) === null || _identificationDataFi6 === void 0 ? void 0 : (_identificationDataFi7 = _identificationDataFi6.Core) === null || _identificationDataFi7 === void 0 ? void 0 : (_identificationDataFi8 = _identificationDataFi7.OperationAvailable) === null || _identificationDataFi8 === void 0 ? void 0 : _identificationDataFi8.valueOf()) !== false)) {
          return true;
        }
      }
      return false;
    })) || [];
  }

  /**
   * Retrieve all the IBN actions for the identification annotation.
   * They must be
   * - Not statically hidden.
   *
   * @param entityType The current entitytype
   * @param bDetermining Whether or not the action should be determining
   * @returns An array of data field for action respecting the bDetermining property.
   */
  _exports.getIdentificationDataFieldForActions = getIdentificationDataFieldForActions;
  function getIdentificationDataFieldForIBNActions(entityType, bDetermining) {
    var _entityType$annotatio4, _entityType$annotatio5, _entityType$annotatio6;
    return ((_entityType$annotatio4 = entityType.annotations) === null || _entityType$annotatio4 === void 0 ? void 0 : (_entityType$annotatio5 = _entityType$annotatio4.UI) === null || _entityType$annotatio5 === void 0 ? void 0 : (_entityType$annotatio6 = _entityType$annotatio5.Identification) === null || _entityType$annotatio6 === void 0 ? void 0 : _entityType$annotatio6.filter(function (identificationDataField) {
      var _identificationDataFi9, _identificationDataFi10, _identificationDataFi11;
      if ((identificationDataField === null || identificationDataField === void 0 ? void 0 : (_identificationDataFi9 = identificationDataField.annotations) === null || _identificationDataFi9 === void 0 ? void 0 : (_identificationDataFi10 = _identificationDataFi9.UI) === null || _identificationDataFi10 === void 0 ? void 0 : (_identificationDataFi11 = _identificationDataFi10.Hidden) === null || _identificationDataFi11 === void 0 ? void 0 : _identificationDataFi11.valueOf()) !== true) {
        if ((identificationDataField === null || identificationDataField === void 0 ? void 0 : identificationDataField.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" && !!identificationDataField.Determining === bDetermining) {
          return true;
        }
      }
      return false;
    })) || [];
  }
  var IMPORTANT_CRITICALITIES = ["UI.CriticalityType/VeryPositive", "UI.CriticalityType/Positive", "UI.CriticalityType/Negative", "UI.CriticalityType/VeryNegative"];

  /**
   * Method to determine the 'visible' property binding for the Delete button on an object page.
   *
   * @param converterContext Instance of the converter context.
   * @param deleteHidden The value of the UI.DeleteHidden annotation on the entity set / type.
   * @returns The binding expression for the 'visible' property of the Delete button.
   */
  function getDeleteButtonVisibility(converterContext, deleteHidden) {
    var dataModelObjectPath = converterContext.getDataModelObjectPath(),
      visitedNavigationPaths = dataModelObjectPath.navigationProperties.map(function (navProp) {
        return navProp.name;
      }),
      // Set absolute binding path for Singleton references, otherwise the configured annotation path itself.
      // For e.g. /com.sap.namespace.EntityContainer/Singleton/Property to /Singleton/Property
      deleteHiddenExpression = getExpressionFromAnnotation(deleteHidden, visitedNavigationPaths, undefined, function (path) {
        return singletonPathVisitor(path, converterContext.getConvertedTypes(), []);
      }),
      manifestWrapper = converterContext.getManifestWrapper(),
      viewLevel = manifestWrapper.getViewLevel(),
      // Delete button is visible
      // In OP 		-->  when not in edit mode
      // In sub-OP 	-->  when in edit mode
      editableExpression = viewLevel > 1 ? UI.IsEditable : not(UI.IsEditable);

    // If UI.DeleteHidden annotation on entity set or type is either not defined or explicitly set to false,
    // Delete button is visible based on editableExpression.
    // else,
    // Delete button is visible based on both annotation path and editableExpression.
    return ifElse(deleteHidden === undefined || deleteHidden.valueOf() === false, editableExpression, and(editableExpression, equal(deleteHiddenExpression, false)));
  }

  /**
   * Method to determine the 'enabled' property binding for the Delete button on an object page.
   *
   * @param isDeletable The delete restriction configured
   * @param isParentDeletable The delete restriction configured on the parent entity
   * @returns The binding expression for the 'enabled' property of the Delete button
   */
  _exports.getDeleteButtonVisibility = getDeleteButtonVisibility;
  function getDeleteButtonEnabled(isDeletable, isParentDeletable) {
    return ifElse(isParentDeletable !== undefined, isParentDeletable, ifElse(isDeletable !== undefined, equal(isDeletable, true), constant(true)));
  }

  /**
   * Method to determine the 'visible' property binding for the Edit button on an object page.
   *
   * @param converterContext Instance of the converter context.
   * @param updateHidden The value of the UI.UpdateHidden annotation on the entity set / type.
   * @returns The binding expression for the 'visible' property of the Edit button.
   */
  _exports.getDeleteButtonEnabled = getDeleteButtonEnabled;
  function getEditButtonVisibility(converterContext, updateHidden) {
    var entitySet = converterContext.getEntitySet(),
      bIsDraftRoot = ModelHelper.isDraftRoot(entitySet),
      dataModelObjectPath = converterContext.getDataModelObjectPath(),
      visitedNavigationPaths = dataModelObjectPath.navigationProperties.map(function (navProp) {
        return navProp.name;
      }),
      // Set absolute binding path for Singleton references, otherwise the configured annotation path itself.
      // For e.g. /com.sap.namespace.EntityContainer/Singleton/Property to /Singleton/Property
      updateHiddenExpression = getExpressionFromAnnotation(updateHidden, visitedNavigationPaths, undefined, function (path) {
        return singletonPathVisitor(path, converterContext.getConvertedTypes(), visitedNavigationPaths);
      }),
      notEditableExpression = not(UI.IsEditable);

    // If UI.UpdateHidden annotation on entity set or type is either not defined or explicitly set to false,
    // Edit button is visible in display mode.
    // else,
    // Edit button is visible based on both annotation path and in display mode.
    var resultantExpression = ifElse(updateHidden === undefined || updateHidden.valueOf() === false, notEditableExpression, and(notEditableExpression, equal(updateHiddenExpression, false)));
    return ifElse(bIsDraftRoot, and(resultantExpression, Draft.HasNoDraftForCurrentUser), resultantExpression);
  }
  /**
   * Method to determine the 'enabled' property binding for the Edit button on an object page.
   *
   * @param converterContext Instance of the converter context.
   * @returns The binding expression for the 'enabled' property of the Edit button.
   */
  _exports.getEditButtonVisibility = getEditButtonVisibility;
  function getEditButtonEnabled(converterContext) {
    var entitySet = converterContext.getEntitySet(),
      isDraftRoot = ModelHelper.isDraftRoot(entitySet),
      isSticky = ModelHelper.isSticky(entitySet);
    var editActionName;
    if (isDraftRoot && !ModelHelper.isSingleton(entitySet)) {
      var _annotations$Common, _annotations$Common$D;
      editActionName = entitySet === null || entitySet === void 0 ? void 0 : (_annotations$Common = entitySet.annotations.Common) === null || _annotations$Common === void 0 ? void 0 : (_annotations$Common$D = _annotations$Common.DraftRoot) === null || _annotations$Common$D === void 0 ? void 0 : _annotations$Common$D.EditAction;
    } else if (isSticky && !ModelHelper.isSingleton(entitySet)) {
      var _annotations$Session, _annotations$Session$;
      editActionName = entitySet === null || entitySet === void 0 ? void 0 : (_annotations$Session = entitySet.annotations.Session) === null || _annotations$Session === void 0 ? void 0 : (_annotations$Session$ = _annotations$Session.StickySessionSupported) === null || _annotations$Session$ === void 0 ? void 0 : _annotations$Session$.EditAction;
    }
    if (editActionName) {
      var _editAction$annotatio, _editAction$annotatio2;
      var editActionAnnotationPath = converterContext.getAbsoluteAnnotationPath(editActionName);
      var editAction = converterContext.resolveAbsolutePath(editActionAnnotationPath).target;
      if ((editAction === null || editAction === void 0 ? void 0 : (_editAction$annotatio = editAction.annotations) === null || _editAction$annotatio === void 0 ? void 0 : (_editAction$annotatio2 = _editAction$annotatio.Core) === null || _editAction$annotatio2 === void 0 ? void 0 : _editAction$annotatio2.OperationAvailable) === null) {
        // We disabled action advertisement but kept it in the code for the time being
        //return "{= ${#" + editActionName + "} ? true : false }";
      } else {
        return getEnabledForAnnotationAction(converterContext, editAction !== null && editAction !== void 0 ? editAction : undefined);
      }
    }
    return "true";
  }
  _exports.getEditButtonEnabled = getEditButtonEnabled;
  function getHeaderDefaultActions(converterContext) {
    var _entitySet$annotation, _entitySet$annotation2, _annotations$UI, _annotations$UI$Updat, _oEntityDeleteRestric;
    var entitySet = converterContext.getEntitySet(),
      entityType = converterContext.getEntityType(),
      oStickySessionSupported = ModelHelper.getStickySession(entitySet),
      //for sticky app
      oDraftRoot = ModelHelper.getDraftRoot(entitySet),
      //entitySet && entitySet.annotations.Common?.DraftRoot,
      oDraftNode = ModelHelper.getDraftNode(entitySet),
      oEntityDeleteRestrictions = entitySet && ((_entitySet$annotation = entitySet.annotations) === null || _entitySet$annotation === void 0 ? void 0 : (_entitySet$annotation2 = _entitySet$annotation.Capabilities) === null || _entitySet$annotation2 === void 0 ? void 0 : _entitySet$annotation2.DeleteRestrictions),
      bUpdateHidden = entitySet && !ModelHelper.isSingleton(entitySet) && ((_annotations$UI = entitySet.annotations.UI) === null || _annotations$UI === void 0 ? void 0 : (_annotations$UI$Updat = _annotations$UI.UpdateHidden) === null || _annotations$UI$Updat === void 0 ? void 0 : _annotations$UI$Updat.valueOf()),
      dataModelObjectPath = converterContext.getDataModelObjectPath(),
      isParentDeletable = isPathDeletable(dataModelObjectPath, {
        pathVisitor: function (path, navigationPaths) {
          return singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths);
        }
      }),
      bParentEntitySetDeletable = isParentDeletable ? compileExpression(isParentDeletable) : isParentDeletable,
      headerDataFieldForActions = getIdentificationDataFieldForActions(converterContext.getEntityType(), false);

    // Initialize actions and start with draft actions if available since they should appear in the first
    // leftmost position in the actions area of the OP header
    // This is more like a placeholder than a single action, since this controls not only the templating of
    // the button for switching between draft and active document versions but also the controls for
    // the collaborative draft fragment.
    var headerActions = [];
    if (!ModelHelper.isSingleton(entitySet) && oDraftRoot !== null && oDraftRoot !== void 0 && oDraftRoot.EditAction && bUpdateHidden !== true) {
      headerActions.push({
        type: ActionType.DraftActions,
        key: "DraftActions"
      });
    }
    if (oDraftRoot || oDraftNode) {
      headerActions.push({
        type: ActionType.CollaborationAvatars,
        key: "CollaborationAvatars"
      });
    }
    // Then add the "Critical" DataFieldForActions
    headerDataFieldForActions.filter(function (dataField) {
      return IMPORTANT_CRITICALITIES.indexOf(dataField === null || dataField === void 0 ? void 0 : dataField.Criticality) > -1;
    }).forEach(function (dataField) {
      var _dataField$annotation, _dataField$annotation2;
      headerActions.push({
        type: ActionType.DataFieldForAction,
        annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
        key: KeyHelper.generateKeyFromDataField(dataField),
        visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation = dataField.annotations) === null || _dataField$annotation === void 0 ? void 0 : (_dataField$annotation2 = _dataField$annotation.UI) === null || _dataField$annotation2 === void 0 ? void 0 : _dataField$annotation2.Hidden), true))),
        enabled: getEnabledForAnnotationAction(converterContext, dataField.ActionTarget),
        isNavigable: true
      });
    });

    // Then the edit action if it exists
    if ((oDraftRoot !== null && oDraftRoot !== void 0 && oDraftRoot.EditAction || oStickySessionSupported !== null && oStickySessionSupported !== void 0 && oStickySessionSupported.EditAction) && bUpdateHidden !== true) {
      var updateHidden = ModelHelper.isUpdateHidden(entitySet, entityType);
      headerActions.push({
        type: ActionType.Primary,
        key: "EditAction",
        visible: compileExpression(getEditButtonVisibility(converterContext, updateHidden)),
        enabled: getEditButtonEnabled(converterContext)
      });
    }
    // Then the delete action if we're not statically not deletable
    if (bParentEntitySetDeletable && bParentEntitySetDeletable !== "false" || (oEntityDeleteRestrictions === null || oEntityDeleteRestrictions === void 0 ? void 0 : (_oEntityDeleteRestric = oEntityDeleteRestrictions.Deletable) === null || _oEntityDeleteRestric === void 0 ? void 0 : _oEntityDeleteRestric.valueOf()) !== false && bParentEntitySetDeletable !== "false") {
      var deleteHidden = ModelHelper.getDeleteHidden(entitySet, entityType);
      headerActions.push({
        type: ActionType.Secondary,
        key: "DeleteAction",
        visible: compileExpression(getDeleteButtonVisibility(converterContext, deleteHidden)),
        enabled: compileExpression(getDeleteButtonEnabled(oEntityDeleteRestrictions === null || oEntityDeleteRestrictions === void 0 ? void 0 : oEntityDeleteRestrictions.Deletable, isParentDeletable)),
        parentEntityDeleteEnabled: bParentEntitySetDeletable
      });
    }
    var headerDataFieldForIBNActions = getIdentificationDataFieldForIBNActions(converterContext.getEntityType(), false);
    headerDataFieldForIBNActions.filter(function (dataField) {
      return IMPORTANT_CRITICALITIES.indexOf(dataField === null || dataField === void 0 ? void 0 : dataField.Criticality) === -1;
    }).forEach(function (dataField) {
      var _dataField$RequiresCo, _dataField$Inline, _dataField$Label, _dataField$annotation3, _dataField$annotation4, _dataField$annotation5, _dataField$Navigation;
      var oNavigationParams = {
        semanticObjectMapping: dataField.Mapping ? getSemanticObjectMapping(dataField.Mapping) : []
      };
      if (((_dataField$RequiresCo = dataField.RequiresContext) === null || _dataField$RequiresCo === void 0 ? void 0 : _dataField$RequiresCo.valueOf()) === true) {
        throw new Error("RequiresContext property should not be true for header IBN action : ".concat(dataField.Label));
      } else if (((_dataField$Inline = dataField.Inline) === null || _dataField$Inline === void 0 ? void 0 : _dataField$Inline.valueOf()) === true) {
        throw new Error("Inline property should not be true for header IBN action : ".concat(dataField.Label));
      }
      headerActions.push({
        type: ActionType.DataFieldForIntentBasedNavigation,
        text: (_dataField$Label = dataField.Label) === null || _dataField$Label === void 0 ? void 0 : _dataField$Label.toString(),
        annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
        buttonType: ButtonType.Ghost,
        visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation3 = dataField.annotations) === null || _dataField$annotation3 === void 0 ? void 0 : (_dataField$annotation4 = _dataField$annotation3.UI) === null || _dataField$annotation4 === void 0 ? void 0 : (_dataField$annotation5 = _dataField$annotation4.Hidden) === null || _dataField$annotation5 === void 0 ? void 0 : _dataField$annotation5.valueOf()), true))),
        enabled: dataField.NavigationAvailable !== undefined ? compileExpression(equal(getExpressionFromAnnotation((_dataField$Navigation = dataField.NavigationAvailable) === null || _dataField$Navigation === void 0 ? void 0 : _dataField$Navigation.valueOf()), true)) : true,
        key: KeyHelper.generateKeyFromDataField(dataField),
        isNavigable: true,
        press: compileExpression(fn("._intentBasedNavigation.navigate", [getExpressionFromAnnotation(dataField.SemanticObject), getExpressionFromAnnotation(dataField.Action), oNavigationParams])),
        customData: compileExpression({
          semanticObject: getExpressionFromAnnotation(dataField.SemanticObject),
          action: getExpressionFromAnnotation(dataField.Action)
        })
      });
    });
    // Finally the non critical DataFieldForActions
    headerDataFieldForActions.filter(function (dataField) {
      return IMPORTANT_CRITICALITIES.indexOf(dataField === null || dataField === void 0 ? void 0 : dataField.Criticality) === -1;
    }).forEach(function (dataField) {
      var _dataField$annotation6, _dataField$annotation7;
      headerActions.push({
        type: ActionType.DataFieldForAction,
        annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
        key: KeyHelper.generateKeyFromDataField(dataField),
        visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation6 = dataField.annotations) === null || _dataField$annotation6 === void 0 ? void 0 : (_dataField$annotation7 = _dataField$annotation6.UI) === null || _dataField$annotation7 === void 0 ? void 0 : _dataField$annotation7.Hidden), true))),
        enabled: getEnabledForAnnotationAction(converterContext, dataField.ActionTarget),
        isNavigable: true
      });
    });
    return headerActions;
  }
  _exports.getHeaderDefaultActions = getHeaderDefaultActions;
  function getHiddenHeaderActions(converterContext) {
    var _entityType$annotatio7, _entityType$annotatio8, _entityType$annotatio9;
    var entityType = converterContext.getEntityType();
    var hiddenActions = ((_entityType$annotatio7 = entityType.annotations) === null || _entityType$annotatio7 === void 0 ? void 0 : (_entityType$annotatio8 = _entityType$annotatio7.UI) === null || _entityType$annotatio8 === void 0 ? void 0 : (_entityType$annotatio9 = _entityType$annotatio8.Identification) === null || _entityType$annotatio9 === void 0 ? void 0 : _entityType$annotatio9.filter(function (identificationDataField) {
      var _identificationDataFi12, _identificationDataFi13, _identificationDataFi14;
      return (identificationDataField === null || identificationDataField === void 0 ? void 0 : (_identificationDataFi12 = identificationDataField.annotations) === null || _identificationDataFi12 === void 0 ? void 0 : (_identificationDataFi13 = _identificationDataFi12.UI) === null || _identificationDataFi13 === void 0 ? void 0 : (_identificationDataFi14 = _identificationDataFi13.Hidden) === null || _identificationDataFi14 === void 0 ? void 0 : _identificationDataFi14.valueOf()) === true;
    })) || [];
    return hiddenActions.map(function (dataField) {
      return {
        type: ActionType.Default,
        key: KeyHelper.generateKeyFromDataField(dataField)
      };
    });
  }
  _exports.getHiddenHeaderActions = getHiddenHeaderActions;
  function getFooterDefaultActions(viewLevel, converterContext) {
    var _annotations$Common2, _annotations$Common2$, _annotations, _annotations$Session2, _annotations$Session3;
    var entitySet = converterContext.getEntitySet();
    var entityType = converterContext.getEntityType();
    var oStickySessionSupported = ModelHelper.getStickySession(entitySet),
      //for sticky app
      sEntitySetDraftRoot = !ModelHelper.isSingleton(entitySet) && entitySet && (((_annotations$Common2 = entitySet.annotations.Common) === null || _annotations$Common2 === void 0 ? void 0 : (_annotations$Common2$ = _annotations$Common2.DraftRoot) === null || _annotations$Common2$ === void 0 ? void 0 : _annotations$Common2$.term) || ((_annotations = entitySet.annotations) === null || _annotations === void 0 ? void 0 : (_annotations$Session2 = _annotations.Session) === null || _annotations$Session2 === void 0 ? void 0 : (_annotations$Session3 = _annotations$Session2.StickySessionSupported) === null || _annotations$Session3 === void 0 ? void 0 : _annotations$Session3.term)),
      bConditionSave = sEntitySetDraftRoot === "com.sap.vocabularies.Common.v1.DraftRoot" || oStickySessionSupported && (oStickySessionSupported === null || oStickySessionSupported === void 0 ? void 0 : oStickySessionSupported.SaveAction),
      bConditionApply = viewLevel > 1,
      bConditionCancel = sEntitySetDraftRoot === "com.sap.vocabularies.Common.v1.DraftRoot" || oStickySessionSupported && (oStickySessionSupported === null || oStickySessionSupported === void 0 ? void 0 : oStickySessionSupported.DiscardAction);

    // Retrieve all determining actions
    var footerDataFieldForActions = getIdentificationDataFieldForActions(converterContext.getEntityType(), true);

    // First add the "Critical" DataFieldForActions
    var footerActions = footerDataFieldForActions.filter(function (dataField) {
      return IMPORTANT_CRITICALITIES.indexOf(dataField === null || dataField === void 0 ? void 0 : dataField.Criticality) > -1;
    }).map(function (dataField) {
      var _dataField$annotation8, _dataField$annotation9;
      return {
        type: ActionType.DataFieldForAction,
        annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
        key: KeyHelper.generateKeyFromDataField(dataField),
        visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation8 = dataField.annotations) === null || _dataField$annotation8 === void 0 ? void 0 : (_dataField$annotation9 = _dataField$annotation8.UI) === null || _dataField$annotation9 === void 0 ? void 0 : _dataField$annotation9.Hidden), true))),
        enabled: getEnabledForAnnotationAction(converterContext, dataField.ActionTarget),
        isNavigable: true
      };
    });

    // Then the save action if it exists
    if ((entitySet === null || entitySet === void 0 ? void 0 : entitySet.entityTypeName) === (entityType === null || entityType === void 0 ? void 0 : entityType.fullyQualifiedName) && bConditionSave) {
      footerActions.push({
        type: ActionType.Primary,
        key: "SaveAction"
      });
    }

    // Then the apply action if it exists
    if (bConditionApply) {
      footerActions.push({
        type: ActionType.DefaultApply,
        key: "ApplyAction"
      });
    }

    // Then the non critical DataFieldForActions
    footerDataFieldForActions.filter(function (dataField) {
      return IMPORTANT_CRITICALITIES.indexOf(dataField === null || dataField === void 0 ? void 0 : dataField.Criticality) === -1;
    }).forEach(function (dataField) {
      var _dataField$annotation10, _dataField$annotation11;
      footerActions.push({
        type: ActionType.DataFieldForAction,
        annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
        key: KeyHelper.generateKeyFromDataField(dataField),
        visible: compileExpression(not(equal(getExpressionFromAnnotation((_dataField$annotation10 = dataField.annotations) === null || _dataField$annotation10 === void 0 ? void 0 : (_dataField$annotation11 = _dataField$annotation10.UI) === null || _dataField$annotation11 === void 0 ? void 0 : _dataField$annotation11.Hidden), true))),
        enabled: getEnabledForAnnotationAction(converterContext, dataField.ActionTarget),
        isNavigable: true
      });
    });

    // Then the cancel action if it exists
    if (bConditionCancel) {
      footerActions.push({
        type: ActionType.Secondary,
        key: "CancelAction",
        position: {
          placement: Placement.End
        }
      });
    }
    return footerActions;
  }
  _exports.getFooterDefaultActions = getFooterDefaultActions;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRJZGVudGlmaWNhdGlvbkRhdGFGaWVsZEZvckFjdGlvbnMiLCJlbnRpdHlUeXBlIiwiYkRldGVybWluaW5nIiwiYW5ub3RhdGlvbnMiLCJVSSIsIklkZW50aWZpY2F0aW9uIiwiZmlsdGVyIiwiaWRlbnRpZmljYXRpb25EYXRhRmllbGQiLCJIaWRkZW4iLCJ2YWx1ZU9mIiwiJFR5cGUiLCJEZXRlcm1pbmluZyIsIkFjdGlvblRhcmdldCIsImlzQm91bmQiLCJDb3JlIiwiT3BlcmF0aW9uQXZhaWxhYmxlIiwiZ2V0SWRlbnRpZmljYXRpb25EYXRhRmllbGRGb3JJQk5BY3Rpb25zIiwiSU1QT1JUQU5UX0NSSVRJQ0FMSVRJRVMiLCJnZXREZWxldGVCdXR0b25WaXNpYmlsaXR5IiwiY29udmVydGVyQ29udGV4dCIsImRlbGV0ZUhpZGRlbiIsImRhdGFNb2RlbE9iamVjdFBhdGgiLCJnZXREYXRhTW9kZWxPYmplY3RQYXRoIiwidmlzaXRlZE5hdmlnYXRpb25QYXRocyIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwibWFwIiwibmF2UHJvcCIsIm5hbWUiLCJkZWxldGVIaWRkZW5FeHByZXNzaW9uIiwiZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uIiwidW5kZWZpbmVkIiwicGF0aCIsInNpbmdsZXRvblBhdGhWaXNpdG9yIiwiZ2V0Q29udmVydGVkVHlwZXMiLCJtYW5pZmVzdFdyYXBwZXIiLCJnZXRNYW5pZmVzdFdyYXBwZXIiLCJ2aWV3TGV2ZWwiLCJnZXRWaWV3TGV2ZWwiLCJlZGl0YWJsZUV4cHJlc3Npb24iLCJJc0VkaXRhYmxlIiwibm90IiwiaWZFbHNlIiwiYW5kIiwiZXF1YWwiLCJnZXREZWxldGVCdXR0b25FbmFibGVkIiwiaXNEZWxldGFibGUiLCJpc1BhcmVudERlbGV0YWJsZSIsImNvbnN0YW50IiwiZ2V0RWRpdEJ1dHRvblZpc2liaWxpdHkiLCJ1cGRhdGVIaWRkZW4iLCJlbnRpdHlTZXQiLCJnZXRFbnRpdHlTZXQiLCJiSXNEcmFmdFJvb3QiLCJNb2RlbEhlbHBlciIsImlzRHJhZnRSb290IiwidXBkYXRlSGlkZGVuRXhwcmVzc2lvbiIsIm5vdEVkaXRhYmxlRXhwcmVzc2lvbiIsInJlc3VsdGFudEV4cHJlc3Npb24iLCJEcmFmdCIsIkhhc05vRHJhZnRGb3JDdXJyZW50VXNlciIsImdldEVkaXRCdXR0b25FbmFibGVkIiwiaXNTdGlja3kiLCJlZGl0QWN0aW9uTmFtZSIsImlzU2luZ2xldG9uIiwiQ29tbW9uIiwiRHJhZnRSb290IiwiRWRpdEFjdGlvbiIsIlNlc3Npb24iLCJTdGlja3lTZXNzaW9uU3VwcG9ydGVkIiwiZWRpdEFjdGlvbkFubm90YXRpb25QYXRoIiwiZ2V0QWJzb2x1dGVBbm5vdGF0aW9uUGF0aCIsImVkaXRBY3Rpb24iLCJyZXNvbHZlQWJzb2x1dGVQYXRoIiwidGFyZ2V0IiwiZ2V0RW5hYmxlZEZvckFubm90YXRpb25BY3Rpb24iLCJnZXRIZWFkZXJEZWZhdWx0QWN0aW9ucyIsImdldEVudGl0eVR5cGUiLCJvU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsImdldFN0aWNreVNlc3Npb24iLCJvRHJhZnRSb290IiwiZ2V0RHJhZnRSb290Iiwib0RyYWZ0Tm9kZSIsImdldERyYWZ0Tm9kZSIsIm9FbnRpdHlEZWxldGVSZXN0cmljdGlvbnMiLCJDYXBhYmlsaXRpZXMiLCJEZWxldGVSZXN0cmljdGlvbnMiLCJiVXBkYXRlSGlkZGVuIiwiVXBkYXRlSGlkZGVuIiwiaXNQYXRoRGVsZXRhYmxlIiwicGF0aFZpc2l0b3IiLCJuYXZpZ2F0aW9uUGF0aHMiLCJiUGFyZW50RW50aXR5U2V0RGVsZXRhYmxlIiwiY29tcGlsZUV4cHJlc3Npb24iLCJoZWFkZXJEYXRhRmllbGRGb3JBY3Rpb25zIiwiaGVhZGVyQWN0aW9ucyIsInB1c2giLCJ0eXBlIiwiQWN0aW9uVHlwZSIsIkRyYWZ0QWN0aW9ucyIsImtleSIsIkNvbGxhYm9yYXRpb25BdmF0YXJzIiwiZGF0YUZpZWxkIiwiaW5kZXhPZiIsIkNyaXRpY2FsaXR5IiwiZm9yRWFjaCIsIkRhdGFGaWVsZEZvckFjdGlvbiIsImFubm90YXRpb25QYXRoIiwiZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aCIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsIktleUhlbHBlciIsImdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZCIsInZpc2libGUiLCJlbmFibGVkIiwiaXNOYXZpZ2FibGUiLCJpc1VwZGF0ZUhpZGRlbiIsIlByaW1hcnkiLCJEZWxldGFibGUiLCJnZXREZWxldGVIaWRkZW4iLCJTZWNvbmRhcnkiLCJwYXJlbnRFbnRpdHlEZWxldGVFbmFibGVkIiwiaGVhZGVyRGF0YUZpZWxkRm9ySUJOQWN0aW9ucyIsIm9OYXZpZ2F0aW9uUGFyYW1zIiwic2VtYW50aWNPYmplY3RNYXBwaW5nIiwiTWFwcGluZyIsImdldFNlbWFudGljT2JqZWN0TWFwcGluZyIsIlJlcXVpcmVzQ29udGV4dCIsIkVycm9yIiwiTGFiZWwiLCJJbmxpbmUiLCJEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb24iLCJ0ZXh0IiwidG9TdHJpbmciLCJidXR0b25UeXBlIiwiQnV0dG9uVHlwZSIsIkdob3N0IiwiTmF2aWdhdGlvbkF2YWlsYWJsZSIsInByZXNzIiwiZm4iLCJTZW1hbnRpY09iamVjdCIsIkFjdGlvbiIsImN1c3RvbURhdGEiLCJzZW1hbnRpY09iamVjdCIsImFjdGlvbiIsImdldEhpZGRlbkhlYWRlckFjdGlvbnMiLCJoaWRkZW5BY3Rpb25zIiwiRGVmYXVsdCIsImdldEZvb3RlckRlZmF1bHRBY3Rpb25zIiwic0VudGl0eVNldERyYWZ0Um9vdCIsInRlcm0iLCJiQ29uZGl0aW9uU2F2ZSIsIlNhdmVBY3Rpb24iLCJiQ29uZGl0aW9uQXBwbHkiLCJiQ29uZGl0aW9uQ2FuY2VsIiwiRGlzY2FyZEFjdGlvbiIsImZvb3RlckRhdGFGaWVsZEZvckFjdGlvbnMiLCJmb290ZXJBY3Rpb25zIiwiZW50aXR5VHlwZU5hbWUiLCJEZWZhdWx0QXBwbHkiLCJwb3NpdGlvbiIsInBsYWNlbWVudCIsIlBsYWNlbWVudCIsIkVuZCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiSGVhZGVyQW5kRm9vdGVyQWN0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQWN0aW9uLCBFbnRpdHlTZXQsIEVudGl0eVR5cGUsIFByb3BlcnR5QW5ub3RhdGlvblZhbHVlIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFGaWVsZEZvckFjdGlvblR5cGVzLCBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB0eXBlIHsgQW5ub3RhdGlvbkFjdGlvbiwgQmFzZUFjdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7IEJ1dHRvblR5cGUsIGdldEVuYWJsZWRGb3JBbm5vdGF0aW9uQWN0aW9uLCBnZXRTZW1hbnRpY09iamVjdE1hcHBpbmcgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vQWN0aW9uXCI7XG5pbXBvcnQgeyBQbGFjZW1lbnQgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9oZWxwZXJzL0NvbmZpZ3VyYWJsZU9iamVjdFwiO1xuaW1wb3J0IHsgS2V5SGVscGVyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9LZXlcIjtcbmltcG9ydCB0eXBlIHsgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBhbmQsIGNvbXBpbGVFeHByZXNzaW9uLCBjb25zdGFudCwgZXF1YWwsIGZuLCBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24sIGlmRWxzZSwgbm90IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IHsgaXNQYXRoRGVsZXRhYmxlIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgQ29udmVydGVyQ29udGV4dCBmcm9tIFwiLi4vQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgRHJhZnQsIHNpbmdsZXRvblBhdGhWaXNpdG9yLCBVSSB9IGZyb20gXCIuLi9oZWxwZXJzL0JpbmRpbmdIZWxwZXJcIjtcbmltcG9ydCB7IEFjdGlvblR5cGUgfSBmcm9tIFwiLi4vTWFuaWZlc3RTZXR0aW5nc1wiO1xuXG4vKipcbiAqIFJldHJpZXZlcyBhbGwgdGhlIGRhdGEgZmllbGQgZm9yIGFjdGlvbnMgZm9yIHRoZSBpZGVudGlmaWNhdGlvbiBhbm5vdGF0aW9uXG4gKiBUaGV5IG11c3QgYmVcbiAqIC0gTm90IHN0YXRpY2FsbHkgaGlkZGVuXG4gKiAtIEVpdGhlciBsaW5rZWQgdG8gYW4gVW5ib3VuZCBhY3Rpb24gb3IgdG8gYW4gYWN0aW9uIHdoaWNoIGhhcyBhbiBPcGVyYXRpb25BdmFpbGFibGUgdGhhdCBpcyBub3Qgc2V0IHRvIGZhbHNlIHN0YXRpY2FsbHkuXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIGN1cnJlbnQgZW50aXR5IHR5cGVcbiAqIEBwYXJhbSBiRGV0ZXJtaW5pbmcgVGhlIGZsYWcgd2hpY2ggZGVub3RlcyB3aGV0aGVyIG9yIG5vdCB0aGUgYWN0aW9uIGlzIGEgZGV0ZXJtaW5pbmcgYWN0aW9uXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBEYXRhRmllbGQgZm9yIGFjdGlvbiByZXNwZWN0aW5nIHRoZSBpbnB1dCBwYXJhbWV0ZXIgJ2JEZXRlcm1pbmluZydcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldElkZW50aWZpY2F0aW9uRGF0YUZpZWxkRm9yQWN0aW9ucyhlbnRpdHlUeXBlOiBFbnRpdHlUeXBlLCBiRGV0ZXJtaW5pbmc6IGJvb2xlYW4pOiBEYXRhRmllbGRGb3JBY3Rpb25UeXBlc1tdIHtcblx0cmV0dXJuIChlbnRpdHlUeXBlLmFubm90YXRpb25zPy5VST8uSWRlbnRpZmljYXRpb24/LmZpbHRlcigoaWRlbnRpZmljYXRpb25EYXRhRmllbGQpID0+IHtcblx0XHRpZiAoaWRlbnRpZmljYXRpb25EYXRhRmllbGQ/LmFubm90YXRpb25zPy5VST8uSGlkZGVuPy52YWx1ZU9mKCkgIT09IHRydWUpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0aWRlbnRpZmljYXRpb25EYXRhRmllbGQ/LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiICYmXG5cdFx0XHRcdCEhaWRlbnRpZmljYXRpb25EYXRhRmllbGQuRGV0ZXJtaW5pbmcgPT09IGJEZXRlcm1pbmluZyAmJlxuXHRcdFx0XHQoIWlkZW50aWZpY2F0aW9uRGF0YUZpZWxkPy5BY3Rpb25UYXJnZXQ/LmlzQm91bmQgfHxcblx0XHRcdFx0XHRpZGVudGlmaWNhdGlvbkRhdGFGaWVsZD8uQWN0aW9uVGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29yZT8uT3BlcmF0aW9uQXZhaWxhYmxlPy52YWx1ZU9mKCkgIT09IGZhbHNlKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pIHx8IFtdKSBhcyBEYXRhRmllbGRGb3JBY3Rpb25UeXBlc1tdO1xufVxuXG4vKipcbiAqIFJldHJpZXZlIGFsbCB0aGUgSUJOIGFjdGlvbnMgZm9yIHRoZSBpZGVudGlmaWNhdGlvbiBhbm5vdGF0aW9uLlxuICogVGhleSBtdXN0IGJlXG4gKiAtIE5vdCBzdGF0aWNhbGx5IGhpZGRlbi5cbiAqXG4gKiBAcGFyYW0gZW50aXR5VHlwZSBUaGUgY3VycmVudCBlbnRpdHl0eXBlXG4gKiBAcGFyYW0gYkRldGVybWluaW5nIFdoZXRoZXIgb3Igbm90IHRoZSBhY3Rpb24gc2hvdWxkIGJlIGRldGVybWluaW5nXG4gKiBAcmV0dXJucyBBbiBhcnJheSBvZiBkYXRhIGZpZWxkIGZvciBhY3Rpb24gcmVzcGVjdGluZyB0aGUgYkRldGVybWluaW5nIHByb3BlcnR5LlxuICovXG5mdW5jdGlvbiBnZXRJZGVudGlmaWNhdGlvbkRhdGFGaWVsZEZvcklCTkFjdGlvbnMoZW50aXR5VHlwZTogRW50aXR5VHlwZSwgYkRldGVybWluaW5nOiBib29sZWFuKTogRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uVHlwZXNbXSB7XG5cdHJldHVybiAoZW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uVUk/LklkZW50aWZpY2F0aW9uPy5maWx0ZXIoKGlkZW50aWZpY2F0aW9uRGF0YUZpZWxkKSA9PiB7XG5cdFx0aWYgKGlkZW50aWZpY2F0aW9uRGF0YUZpZWxkPy5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpICE9PSB0cnVlKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGlkZW50aWZpY2F0aW9uRGF0YUZpZWxkPy4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cIiAmJlxuXHRcdFx0XHQhIWlkZW50aWZpY2F0aW9uRGF0YUZpZWxkLkRldGVybWluaW5nID09PSBiRGV0ZXJtaW5pbmdcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0pIHx8IFtdKSBhcyBEYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25UeXBlc1tdO1xufVxuXG5jb25zdCBJTVBPUlRBTlRfQ1JJVElDQUxJVElFUyA9IFtcblx0XCJVSS5Dcml0aWNhbGl0eVR5cGUvVmVyeVBvc2l0aXZlXCIsXG5cdFwiVUkuQ3JpdGljYWxpdHlUeXBlL1Bvc2l0aXZlXCIsXG5cdFwiVUkuQ3JpdGljYWxpdHlUeXBlL05lZ2F0aXZlXCIsXG5cdFwiVUkuQ3JpdGljYWxpdHlUeXBlL1ZlcnlOZWdhdGl2ZVwiXG5dO1xuXG4vKipcbiAqIE1ldGhvZCB0byBkZXRlcm1pbmUgdGhlICd2aXNpYmxlJyBwcm9wZXJ0eSBiaW5kaW5nIGZvciB0aGUgRGVsZXRlIGJ1dHRvbiBvbiBhbiBvYmplY3QgcGFnZS5cbiAqXG4gKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBJbnN0YW5jZSBvZiB0aGUgY29udmVydGVyIGNvbnRleHQuXG4gKiBAcGFyYW0gZGVsZXRlSGlkZGVuIFRoZSB2YWx1ZSBvZiB0aGUgVUkuRGVsZXRlSGlkZGVuIGFubm90YXRpb24gb24gdGhlIGVudGl0eSBzZXQgLyB0eXBlLlxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlICd2aXNpYmxlJyBwcm9wZXJ0eSBvZiB0aGUgRGVsZXRlIGJ1dHRvbi5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlbGV0ZUJ1dHRvblZpc2liaWxpdHkoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdGRlbGV0ZUhpZGRlbjogUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8Ym9vbGVhbj4gfCB1bmRlZmluZWRcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGRhdGFNb2RlbE9iamVjdFBhdGggPSBjb252ZXJ0ZXJDb250ZXh0LmdldERhdGFNb2RlbE9iamVjdFBhdGgoKSxcblx0XHR2aXNpdGVkTmF2aWdhdGlvblBhdGhzID0gZGF0YU1vZGVsT2JqZWN0UGF0aC5uYXZpZ2F0aW9uUHJvcGVydGllcy5tYXAoKG5hdlByb3ApID0+IG5hdlByb3AubmFtZSksXG5cdFx0Ly8gU2V0IGFic29sdXRlIGJpbmRpbmcgcGF0aCBmb3IgU2luZ2xldG9uIHJlZmVyZW5jZXMsIG90aGVyd2lzZSB0aGUgY29uZmlndXJlZCBhbm5vdGF0aW9uIHBhdGggaXRzZWxmLlxuXHRcdC8vIEZvciBlLmcuIC9jb20uc2FwLm5hbWVzcGFjZS5FbnRpdHlDb250YWluZXIvU2luZ2xldG9uL1Byb3BlcnR5IHRvIC9TaW5nbGV0b24vUHJvcGVydHlcblx0XHRkZWxldGVIaWRkZW5FeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbiB8IHVuZGVmaW5lZD4gPSBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oXG5cdFx0XHRkZWxldGVIaWRkZW4sXG5cdFx0XHR2aXNpdGVkTmF2aWdhdGlvblBhdGhzLFxuXHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0KHBhdGg6IHN0cmluZykgPT4gc2luZ2xldG9uUGF0aFZpc2l0b3IocGF0aCwgY29udmVydGVyQ29udGV4dC5nZXRDb252ZXJ0ZWRUeXBlcygpLCBbXSlcblx0XHQpLFxuXHRcdG1hbmlmZXN0V3JhcHBlciA9IGNvbnZlcnRlckNvbnRleHQuZ2V0TWFuaWZlc3RXcmFwcGVyKCksXG5cdFx0dmlld0xldmVsID0gbWFuaWZlc3RXcmFwcGVyLmdldFZpZXdMZXZlbCgpLFxuXHRcdC8vIERlbGV0ZSBidXR0b24gaXMgdmlzaWJsZVxuXHRcdC8vIEluIE9QIFx0XHQtLT4gIHdoZW4gbm90IGluIGVkaXQgbW9kZVxuXHRcdC8vIEluIHN1Yi1PUCBcdC0tPiAgd2hlbiBpbiBlZGl0IG1vZGVcblx0XHRlZGl0YWJsZUV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiA9IHZpZXdMZXZlbCA+IDEgPyBVSS5Jc0VkaXRhYmxlIDogbm90KFVJLklzRWRpdGFibGUpO1xuXG5cdC8vIElmIFVJLkRlbGV0ZUhpZGRlbiBhbm5vdGF0aW9uIG9uIGVudGl0eSBzZXQgb3IgdHlwZSBpcyBlaXRoZXIgbm90IGRlZmluZWQgb3IgZXhwbGljaXRseSBzZXQgdG8gZmFsc2UsXG5cdC8vIERlbGV0ZSBidXR0b24gaXMgdmlzaWJsZSBiYXNlZCBvbiBlZGl0YWJsZUV4cHJlc3Npb24uXG5cdC8vIGVsc2UsXG5cdC8vIERlbGV0ZSBidXR0b24gaXMgdmlzaWJsZSBiYXNlZCBvbiBib3RoIGFubm90YXRpb24gcGF0aCBhbmQgZWRpdGFibGVFeHByZXNzaW9uLlxuXHRyZXR1cm4gaWZFbHNlKFxuXHRcdGRlbGV0ZUhpZGRlbiA9PT0gdW5kZWZpbmVkIHx8IGRlbGV0ZUhpZGRlbi52YWx1ZU9mKCkgPT09IGZhbHNlLFxuXHRcdGVkaXRhYmxlRXhwcmVzc2lvbixcblx0XHRhbmQoZWRpdGFibGVFeHByZXNzaW9uLCBlcXVhbChkZWxldGVIaWRkZW5FeHByZXNzaW9uLCBmYWxzZSkpXG5cdCk7XG59XG5cbi8qKlxuICogTWV0aG9kIHRvIGRldGVybWluZSB0aGUgJ2VuYWJsZWQnIHByb3BlcnR5IGJpbmRpbmcgZm9yIHRoZSBEZWxldGUgYnV0dG9uIG9uIGFuIG9iamVjdCBwYWdlLlxuICpcbiAqIEBwYXJhbSBpc0RlbGV0YWJsZSBUaGUgZGVsZXRlIHJlc3RyaWN0aW9uIGNvbmZpZ3VyZWRcbiAqIEBwYXJhbSBpc1BhcmVudERlbGV0YWJsZSBUaGUgZGVsZXRlIHJlc3RyaWN0aW9uIGNvbmZpZ3VyZWQgb24gdGhlIHBhcmVudCBlbnRpdHlcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgdGhlIERlbGV0ZSBidXR0b25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldERlbGV0ZUJ1dHRvbkVuYWJsZWQoXG5cdGlzRGVsZXRhYmxlOiBQcm9wZXJ0eUFubm90YXRpb25WYWx1ZTxCb29sZWFuPiB8IHVuZGVmaW5lZCxcblx0aXNQYXJlbnREZWxldGFibGU6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPlxuKTogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+IHtcblx0cmV0dXJuIGlmRWxzZShcblx0XHRpc1BhcmVudERlbGV0YWJsZSAhPT0gdW5kZWZpbmVkLFxuXHRcdGlzUGFyZW50RGVsZXRhYmxlLFxuXHRcdGlmRWxzZShpc0RlbGV0YWJsZSAhPT0gdW5kZWZpbmVkLCBlcXVhbChpc0RlbGV0YWJsZSwgdHJ1ZSksIGNvbnN0YW50KHRydWUpKVxuXHQpO1xufVxuXG4vKipcbiAqIE1ldGhvZCB0byBkZXRlcm1pbmUgdGhlICd2aXNpYmxlJyBwcm9wZXJ0eSBiaW5kaW5nIGZvciB0aGUgRWRpdCBidXR0b24gb24gYW4gb2JqZWN0IHBhZ2UuXG4gKlxuICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgSW5zdGFuY2Ugb2YgdGhlIGNvbnZlcnRlciBjb250ZXh0LlxuICogQHBhcmFtIHVwZGF0ZUhpZGRlbiBUaGUgdmFsdWUgb2YgdGhlIFVJLlVwZGF0ZUhpZGRlbiBhbm5vdGF0aW9uIG9uIHRoZSBlbnRpdHkgc2V0IC8gdHlwZS5cbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAndmlzaWJsZScgcHJvcGVydHkgb2YgdGhlIEVkaXQgYnV0dG9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWRpdEJ1dHRvblZpc2liaWxpdHkoXG5cdGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQsXG5cdHVwZGF0ZUhpZGRlbjogUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8Ym9vbGVhbj4gfCB1bmRlZmluZWRcbik6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiB7XG5cdGNvbnN0IGVudGl0eVNldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCksXG5cdFx0YklzRHJhZnRSb290ID0gTW9kZWxIZWxwZXIuaXNEcmFmdFJvb3QoZW50aXR5U2V0KSxcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCksXG5cdFx0dmlzaXRlZE5hdmlnYXRpb25QYXRocyA9IGRhdGFNb2RlbE9iamVjdFBhdGgubmF2aWdhdGlvblByb3BlcnRpZXMubWFwKChuYXZQcm9wKSA9PiBuYXZQcm9wLm5hbWUpLFxuXHRcdC8vIFNldCBhYnNvbHV0ZSBiaW5kaW5nIHBhdGggZm9yIFNpbmdsZXRvbiByZWZlcmVuY2VzLCBvdGhlcndpc2UgdGhlIGNvbmZpZ3VyZWQgYW5ub3RhdGlvbiBwYXRoIGl0c2VsZi5cblx0XHQvLyBGb3IgZS5nLiAvY29tLnNhcC5uYW1lc3BhY2UuRW50aXR5Q29udGFpbmVyL1NpbmdsZXRvbi9Qcm9wZXJ0eSB0byAvU2luZ2xldG9uL1Byb3BlcnR5XG5cdFx0dXBkYXRlSGlkZGVuRXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4gfCB1bmRlZmluZWQ+ID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKFxuXHRcdFx0dXBkYXRlSGlkZGVuLFxuXHRcdFx0dmlzaXRlZE5hdmlnYXRpb25QYXRocyxcblx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdChwYXRoOiBzdHJpbmcpID0+IHNpbmdsZXRvblBhdGhWaXNpdG9yKHBhdGgsIGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVkVHlwZXMoKSwgdmlzaXRlZE5hdmlnYXRpb25QYXRocylcblx0XHQpLFxuXHRcdG5vdEVkaXRhYmxlRXhwcmVzc2lvbjogQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+ID0gbm90KFVJLklzRWRpdGFibGUpO1xuXG5cdC8vIElmIFVJLlVwZGF0ZUhpZGRlbiBhbm5vdGF0aW9uIG9uIGVudGl0eSBzZXQgb3IgdHlwZSBpcyBlaXRoZXIgbm90IGRlZmluZWQgb3IgZXhwbGljaXRseSBzZXQgdG8gZmFsc2UsXG5cdC8vIEVkaXQgYnV0dG9uIGlzIHZpc2libGUgaW4gZGlzcGxheSBtb2RlLlxuXHQvLyBlbHNlLFxuXHQvLyBFZGl0IGJ1dHRvbiBpcyB2aXNpYmxlIGJhc2VkIG9uIGJvdGggYW5ub3RhdGlvbiBwYXRoIGFuZCBpbiBkaXNwbGF5IG1vZGUuXG5cdGNvbnN0IHJlc3VsdGFudEV4cHJlc3Npb246IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPiA9IGlmRWxzZShcblx0XHR1cGRhdGVIaWRkZW4gPT09IHVuZGVmaW5lZCB8fCB1cGRhdGVIaWRkZW4udmFsdWVPZigpID09PSBmYWxzZSxcblx0XHRub3RFZGl0YWJsZUV4cHJlc3Npb24sXG5cdFx0YW5kKG5vdEVkaXRhYmxlRXhwcmVzc2lvbiwgZXF1YWwodXBkYXRlSGlkZGVuRXhwcmVzc2lvbiwgZmFsc2UpKVxuXHQpO1xuXHRyZXR1cm4gaWZFbHNlKGJJc0RyYWZ0Um9vdCwgYW5kKHJlc3VsdGFudEV4cHJlc3Npb24sIERyYWZ0Lkhhc05vRHJhZnRGb3JDdXJyZW50VXNlciksIHJlc3VsdGFudEV4cHJlc3Npb24pO1xufVxuLyoqXG4gKiBNZXRob2QgdG8gZGV0ZXJtaW5lIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgYmluZGluZyBmb3IgdGhlIEVkaXQgYnV0dG9uIG9uIGFuIG9iamVjdCBwYWdlLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZXJDb250ZXh0IEluc3RhbmNlIG9mIHRoZSBjb252ZXJ0ZXIgY29udGV4dC5cbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgb2YgdGhlIEVkaXQgYnV0dG9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RWRpdEJ1dHRvbkVuYWJsZWQoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHtcblx0Y29uc3QgZW50aXR5U2V0ID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKSxcblx0XHRpc0RyYWZ0Um9vdCA9IE1vZGVsSGVscGVyLmlzRHJhZnRSb290KGVudGl0eVNldCksXG5cdFx0aXNTdGlja3kgPSBNb2RlbEhlbHBlci5pc1N0aWNreShlbnRpdHlTZXQpO1xuXG5cdGxldCBlZGl0QWN0aW9uTmFtZTogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRpZiAoaXNEcmFmdFJvb3QgJiYgIU1vZGVsSGVscGVyLmlzU2luZ2xldG9uKGVudGl0eVNldCkpIHtcblx0XHRlZGl0QWN0aW9uTmFtZSA9IChlbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdFJvb3Q/LkVkaXRBY3Rpb24gYXMgc3RyaW5nO1xuXHR9IGVsc2UgaWYgKGlzU3RpY2t5ICYmICFNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihlbnRpdHlTZXQpKSB7XG5cdFx0ZWRpdEFjdGlvbk5hbWUgPSAoZW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zLlNlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQ/LkVkaXRBY3Rpb24gYXMgc3RyaW5nO1xuXHR9XG5cdGlmIChlZGl0QWN0aW9uTmFtZSkge1xuXHRcdGNvbnN0IGVkaXRBY3Rpb25Bbm5vdGF0aW9uUGF0aCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0QWJzb2x1dGVBbm5vdGF0aW9uUGF0aChlZGl0QWN0aW9uTmFtZSk7XG5cdFx0Y29uc3QgZWRpdEFjdGlvbiA9IGNvbnZlcnRlckNvbnRleHQucmVzb2x2ZUFic29sdXRlUGF0aChlZGl0QWN0aW9uQW5ub3RhdGlvblBhdGgpLnRhcmdldCBhcyBBY3Rpb24gfCBudWxsO1xuXHRcdGlmIChlZGl0QWN0aW9uPy5hbm5vdGF0aW9ucz8uQ29yZT8uT3BlcmF0aW9uQXZhaWxhYmxlID09PSBudWxsKSB7XG5cdFx0XHQvLyBXZSBkaXNhYmxlZCBhY3Rpb24gYWR2ZXJ0aXNlbWVudCBidXQga2VwdCBpdCBpbiB0aGUgY29kZSBmb3IgdGhlIHRpbWUgYmVpbmdcblx0XHRcdC8vcmV0dXJuIFwiez0gJHsjXCIgKyBlZGl0QWN0aW9uTmFtZSArIFwifSA/IHRydWUgOiBmYWxzZSB9XCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBnZXRFbmFibGVkRm9yQW5ub3RhdGlvbkFjdGlvbihjb252ZXJ0ZXJDb250ZXh0LCBlZGl0QWN0aW9uID8/IHVuZGVmaW5lZCk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBcInRydWVcIjtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEhlYWRlckRlZmF1bHRBY3Rpb25zKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBCYXNlQWN0aW9uW10ge1xuXHRjb25zdCBlbnRpdHlTZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldCgpLFxuXHRcdGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSxcblx0XHRvU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCA9IE1vZGVsSGVscGVyLmdldFN0aWNreVNlc3Npb24oZW50aXR5U2V0KSwgLy9mb3Igc3RpY2t5IGFwcFxuXHRcdG9EcmFmdFJvb3QgPSBNb2RlbEhlbHBlci5nZXREcmFmdFJvb3QoZW50aXR5U2V0KSwgLy9lbnRpdHlTZXQgJiYgZW50aXR5U2V0LmFubm90YXRpb25zLkNvbW1vbj8uRHJhZnRSb290LFxuXHRcdG9EcmFmdE5vZGUgPSBNb2RlbEhlbHBlci5nZXREcmFmdE5vZGUoZW50aXR5U2V0KSxcblx0XHRvRW50aXR5RGVsZXRlUmVzdHJpY3Rpb25zID0gZW50aXR5U2V0ICYmIGVudGl0eVNldC5hbm5vdGF0aW9ucz8uQ2FwYWJpbGl0aWVzPy5EZWxldGVSZXN0cmljdGlvbnMsXG5cdFx0YlVwZGF0ZUhpZGRlbiA9XG5cdFx0XHRlbnRpdHlTZXQgJiYgIU1vZGVsSGVscGVyLmlzU2luZ2xldG9uKGVudGl0eVNldCkgJiYgKGVudGl0eVNldCBhcyBFbnRpdHlTZXQpLmFubm90YXRpb25zLlVJPy5VcGRhdGVIaWRkZW4/LnZhbHVlT2YoKSxcblx0XHRkYXRhTW9kZWxPYmplY3RQYXRoID0gY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCksXG5cdFx0aXNQYXJlbnREZWxldGFibGUgPSBpc1BhdGhEZWxldGFibGUoZGF0YU1vZGVsT2JqZWN0UGF0aCwge1xuXHRcdFx0cGF0aFZpc2l0b3I6IChwYXRoOiBzdHJpbmcsIG5hdmlnYXRpb25QYXRoczogc3RyaW5nW10pID0+XG5cdFx0XHRcdHNpbmdsZXRvblBhdGhWaXNpdG9yKHBhdGgsIGNvbnZlcnRlckNvbnRleHQuZ2V0Q29udmVydGVkVHlwZXMoKSwgbmF2aWdhdGlvblBhdGhzKVxuXHRcdH0pLFxuXHRcdGJQYXJlbnRFbnRpdHlTZXREZWxldGFibGUgPSBpc1BhcmVudERlbGV0YWJsZSA/IGNvbXBpbGVFeHByZXNzaW9uKGlzUGFyZW50RGVsZXRhYmxlKSA6IGlzUGFyZW50RGVsZXRhYmxlLFxuXHRcdGhlYWRlckRhdGFGaWVsZEZvckFjdGlvbnMgPSBnZXRJZGVudGlmaWNhdGlvbkRhdGFGaWVsZEZvckFjdGlvbnMoY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCksIGZhbHNlKTtcblxuXHQvLyBJbml0aWFsaXplIGFjdGlvbnMgYW5kIHN0YXJ0IHdpdGggZHJhZnQgYWN0aW9ucyBpZiBhdmFpbGFibGUgc2luY2UgdGhleSBzaG91bGQgYXBwZWFyIGluIHRoZSBmaXJzdFxuXHQvLyBsZWZ0bW9zdCBwb3NpdGlvbiBpbiB0aGUgYWN0aW9ucyBhcmVhIG9mIHRoZSBPUCBoZWFkZXJcblx0Ly8gVGhpcyBpcyBtb3JlIGxpa2UgYSBwbGFjZWhvbGRlciB0aGFuIGEgc2luZ2xlIGFjdGlvbiwgc2luY2UgdGhpcyBjb250cm9scyBub3Qgb25seSB0aGUgdGVtcGxhdGluZyBvZlxuXHQvLyB0aGUgYnV0dG9uIGZvciBzd2l0Y2hpbmcgYmV0d2VlbiBkcmFmdCBhbmQgYWN0aXZlIGRvY3VtZW50IHZlcnNpb25zIGJ1dCBhbHNvIHRoZSBjb250cm9scyBmb3Jcblx0Ly8gdGhlIGNvbGxhYm9yYXRpdmUgZHJhZnQgZnJhZ21lbnQuXG5cdGNvbnN0IGhlYWRlckFjdGlvbnM6IEJhc2VBY3Rpb25bXSA9IFtdO1xuXHRpZiAoIU1vZGVsSGVscGVyLmlzU2luZ2xldG9uKGVudGl0eVNldCkgJiYgb0RyYWZ0Um9vdD8uRWRpdEFjdGlvbiAmJiBiVXBkYXRlSGlkZGVuICE9PSB0cnVlKSB7XG5cdFx0aGVhZGVyQWN0aW9ucy5wdXNoKHsgdHlwZTogQWN0aW9uVHlwZS5EcmFmdEFjdGlvbnMsIGtleTogXCJEcmFmdEFjdGlvbnNcIiB9KTtcblx0fVxuXG5cdGlmIChvRHJhZnRSb290IHx8IG9EcmFmdE5vZGUpIHtcblx0XHRoZWFkZXJBY3Rpb25zLnB1c2goeyB0eXBlOiBBY3Rpb25UeXBlLkNvbGxhYm9yYXRpb25BdmF0YXJzLCBrZXk6IFwiQ29sbGFib3JhdGlvbkF2YXRhcnNcIiB9KTtcblx0fVxuXHQvLyBUaGVuIGFkZCB0aGUgXCJDcml0aWNhbFwiIERhdGFGaWVsZEZvckFjdGlvbnNcblx0aGVhZGVyRGF0YUZpZWxkRm9yQWN0aW9uc1xuXHRcdC5maWx0ZXIoKGRhdGFGaWVsZCkgPT4ge1xuXHRcdFx0cmV0dXJuIElNUE9SVEFOVF9DUklUSUNBTElUSUVTLmluZGV4T2YoZGF0YUZpZWxkPy5Dcml0aWNhbGl0eSBhcyBzdHJpbmcpID4gLTE7XG5cdFx0fSlcblx0XHQuZm9yRWFjaCgoZGF0YUZpZWxkKSA9PiB7XG5cdFx0XHRoZWFkZXJBY3Rpb25zLnB1c2goe1xuXHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckFjdGlvbixcblx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChkYXRhRmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCksXG5cdFx0XHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuKSwgdHJ1ZSkpKSxcblx0XHRcdFx0ZW5hYmxlZDogZ2V0RW5hYmxlZEZvckFubm90YXRpb25BY3Rpb24oY29udmVydGVyQ29udGV4dCwgZGF0YUZpZWxkLkFjdGlvblRhcmdldCksXG5cdFx0XHRcdGlzTmF2aWdhYmxlOiB0cnVlXG5cdFx0XHR9KTtcblx0XHR9KTtcblxuXHQvLyBUaGVuIHRoZSBlZGl0IGFjdGlvbiBpZiBpdCBleGlzdHNcblx0aWYgKChvRHJhZnRSb290Py5FZGl0QWN0aW9uIHx8IG9TdGlja3lTZXNzaW9uU3VwcG9ydGVkPy5FZGl0QWN0aW9uKSAmJiBiVXBkYXRlSGlkZGVuICE9PSB0cnVlKSB7XG5cdFx0Y29uc3QgdXBkYXRlSGlkZGVuID0gTW9kZWxIZWxwZXIuaXNVcGRhdGVIaWRkZW4oZW50aXR5U2V0LCBlbnRpdHlUeXBlKTtcblx0XHRoZWFkZXJBY3Rpb25zLnB1c2goe1xuXHRcdFx0dHlwZTogQWN0aW9uVHlwZS5QcmltYXJ5LFxuXHRcdFx0a2V5OiBcIkVkaXRBY3Rpb25cIixcblx0XHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKGdldEVkaXRCdXR0b25WaXNpYmlsaXR5KGNvbnZlcnRlckNvbnRleHQsIHVwZGF0ZUhpZGRlbikpLFxuXHRcdFx0ZW5hYmxlZDogZ2V0RWRpdEJ1dHRvbkVuYWJsZWQoY29udmVydGVyQ29udGV4dClcblx0XHR9KTtcblx0fVxuXHQvLyBUaGVuIHRoZSBkZWxldGUgYWN0aW9uIGlmIHdlJ3JlIG5vdCBzdGF0aWNhbGx5IG5vdCBkZWxldGFibGVcblx0aWYgKFxuXHRcdChiUGFyZW50RW50aXR5U2V0RGVsZXRhYmxlICYmIGJQYXJlbnRFbnRpdHlTZXREZWxldGFibGUgIT09IFwiZmFsc2VcIikgfHxcblx0XHQob0VudGl0eURlbGV0ZVJlc3RyaWN0aW9ucz8uRGVsZXRhYmxlPy52YWx1ZU9mKCkgIT09IGZhbHNlICYmIGJQYXJlbnRFbnRpdHlTZXREZWxldGFibGUgIT09IFwiZmFsc2VcIilcblx0KSB7XG5cdFx0Y29uc3QgZGVsZXRlSGlkZGVuID0gTW9kZWxIZWxwZXIuZ2V0RGVsZXRlSGlkZGVuKGVudGl0eVNldCwgZW50aXR5VHlwZSkgYXMgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8Ym9vbGVhbj47XG5cdFx0aGVhZGVyQWN0aW9ucy5wdXNoKHtcblx0XHRcdHR5cGU6IEFjdGlvblR5cGUuU2Vjb25kYXJ5LFxuXHRcdFx0a2V5OiBcIkRlbGV0ZUFjdGlvblwiLFxuXHRcdFx0dmlzaWJsZTogY29tcGlsZUV4cHJlc3Npb24oZ2V0RGVsZXRlQnV0dG9uVmlzaWJpbGl0eShjb252ZXJ0ZXJDb250ZXh0LCBkZWxldGVIaWRkZW4pKSxcblx0XHRcdGVuYWJsZWQ6IGNvbXBpbGVFeHByZXNzaW9uKGdldERlbGV0ZUJ1dHRvbkVuYWJsZWQob0VudGl0eURlbGV0ZVJlc3RyaWN0aW9ucz8uRGVsZXRhYmxlLCBpc1BhcmVudERlbGV0YWJsZSkpLFxuXHRcdFx0cGFyZW50RW50aXR5RGVsZXRlRW5hYmxlZDogYlBhcmVudEVudGl0eVNldERlbGV0YWJsZVxuXHRcdH0pO1xuXHR9XG5cblx0Y29uc3QgaGVhZGVyRGF0YUZpZWxkRm9ySUJOQWN0aW9ucyA9IGdldElkZW50aWZpY2F0aW9uRGF0YUZpZWxkRm9ySUJOQWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgZmFsc2UpO1xuXG5cdGhlYWRlckRhdGFGaWVsZEZvcklCTkFjdGlvbnNcblx0XHQuZmlsdGVyKChkYXRhRmllbGQpID0+IHtcblx0XHRcdHJldHVybiBJTVBPUlRBTlRfQ1JJVElDQUxJVElFUy5pbmRleE9mKGRhdGFGaWVsZD8uQ3JpdGljYWxpdHkgYXMgc3RyaW5nKSA9PT0gLTE7XG5cdFx0fSlcblx0XHQuZm9yRWFjaCgoZGF0YUZpZWxkKSA9PiB7XG5cdFx0XHRjb25zdCBvTmF2aWdhdGlvblBhcmFtcyA9IHtcblx0XHRcdFx0c2VtYW50aWNPYmplY3RNYXBwaW5nOiBkYXRhRmllbGQuTWFwcGluZyA/IGdldFNlbWFudGljT2JqZWN0TWFwcGluZyhkYXRhRmllbGQuTWFwcGluZykgOiBbXVxuXHRcdFx0fTtcblxuXHRcdFx0aWYgKGRhdGFGaWVsZC5SZXF1aXJlc0NvbnRleHQ/LnZhbHVlT2YoKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYFJlcXVpcmVzQ29udGV4dCBwcm9wZXJ0eSBzaG91bGQgbm90IGJlIHRydWUgZm9yIGhlYWRlciBJQk4gYWN0aW9uIDogJHtkYXRhRmllbGQuTGFiZWx9YCk7XG5cdFx0XHR9IGVsc2UgaWYgKGRhdGFGaWVsZC5JbmxpbmU/LnZhbHVlT2YoKSA9PT0gdHJ1ZSkge1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoYElubGluZSBwcm9wZXJ0eSBzaG91bGQgbm90IGJlIHRydWUgZm9yIGhlYWRlciBJQk4gYWN0aW9uIDogJHtkYXRhRmllbGQuTGFiZWx9YCk7XG5cdFx0XHR9XG5cdFx0XHRoZWFkZXJBY3Rpb25zLnB1c2goe1xuXHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckludGVudEJhc2VkTmF2aWdhdGlvbixcblx0XHRcdFx0dGV4dDogZGF0YUZpZWxkLkxhYmVsPy50b1N0cmluZygpLFxuXHRcdFx0XHRhbm5vdGF0aW9uUGF0aDogY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXRCYXNlZEFubm90YXRpb25QYXRoKGRhdGFGaWVsZC5mdWxseVF1YWxpZmllZE5hbWUpLFxuXHRcdFx0XHRidXR0b25UeXBlOiBCdXR0b25UeXBlLkdob3N0LFxuXHRcdFx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbj8udmFsdWVPZigpKSwgdHJ1ZSkpKSxcblx0XHRcdFx0ZW5hYmxlZDpcblx0XHRcdFx0XHRkYXRhRmllbGQuTmF2aWdhdGlvbkF2YWlsYWJsZSAhPT0gdW5kZWZpbmVkXG5cdFx0XHRcdFx0XHQ/IGNvbXBpbGVFeHByZXNzaW9uKGVxdWFsKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihkYXRhRmllbGQuTmF2aWdhdGlvbkF2YWlsYWJsZT8udmFsdWVPZigpKSwgdHJ1ZSkpXG5cdFx0XHRcdFx0XHQ6IHRydWUsXG5cdFx0XHRcdGtleTogS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpLFxuXHRcdFx0XHRpc05hdmlnYWJsZTogdHJ1ZSxcblx0XHRcdFx0cHJlc3M6IGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdFx0XHRcdGZuKFwiLl9pbnRlbnRCYXNlZE5hdmlnYXRpb24ubmF2aWdhdGVcIiwgW1xuXHRcdFx0XHRcdFx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFGaWVsZC5TZW1hbnRpY09iamVjdCksXG5cdFx0XHRcdFx0XHRnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLkFjdGlvbiksXG5cdFx0XHRcdFx0XHRvTmF2aWdhdGlvblBhcmFtc1xuXHRcdFx0XHRcdF0pXG5cdFx0XHRcdCksXG5cdFx0XHRcdGN1c3RvbURhdGE6IGNvbXBpbGVFeHByZXNzaW9uKHtcblx0XHRcdFx0XHRzZW1hbnRpY09iamVjdDogZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFGaWVsZC5TZW1hbnRpY09iamVjdCksXG5cdFx0XHRcdFx0YWN0aW9uOiBnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLkFjdGlvbilcblx0XHRcdFx0fSlcblx0XHRcdH0gYXMgQW5ub3RhdGlvbkFjdGlvbik7XG5cdFx0fSk7XG5cdC8vIEZpbmFsbHkgdGhlIG5vbiBjcml0aWNhbCBEYXRhRmllbGRGb3JBY3Rpb25zXG5cdGhlYWRlckRhdGFGaWVsZEZvckFjdGlvbnNcblx0XHQuZmlsdGVyKChkYXRhRmllbGQpID0+IHtcblx0XHRcdHJldHVybiBJTVBPUlRBTlRfQ1JJVElDQUxJVElFUy5pbmRleE9mKGRhdGFGaWVsZD8uQ3JpdGljYWxpdHkgYXMgc3RyaW5nKSA9PT0gLTE7XG5cdFx0fSlcblx0XHQuZm9yRWFjaCgoZGF0YUZpZWxkKSA9PiB7XG5cdFx0XHRoZWFkZXJBY3Rpb25zLnB1c2goe1xuXHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckFjdGlvbixcblx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChkYXRhRmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCksXG5cdFx0XHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuKSwgdHJ1ZSkpKSxcblx0XHRcdFx0ZW5hYmxlZDogZ2V0RW5hYmxlZEZvckFubm90YXRpb25BY3Rpb24oY29udmVydGVyQ29udGV4dCwgZGF0YUZpZWxkLkFjdGlvblRhcmdldCksXG5cdFx0XHRcdGlzTmF2aWdhYmxlOiB0cnVlXG5cdFx0XHR9IGFzIEFubm90YXRpb25BY3Rpb24pO1xuXHRcdH0pO1xuXG5cdHJldHVybiBoZWFkZXJBY3Rpb25zO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0SGlkZGVuSGVhZGVyQWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQmFzZUFjdGlvbltdIHtcblx0Y29uc3QgZW50aXR5VHlwZSA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpO1xuXHRjb25zdCBoaWRkZW5BY3Rpb25zID0gKGVudGl0eVR5cGUuYW5ub3RhdGlvbnM/LlVJPy5JZGVudGlmaWNhdGlvbj8uZmlsdGVyKChpZGVudGlmaWNhdGlvbkRhdGFGaWVsZCkgPT4ge1xuXHRcdHJldHVybiBpZGVudGlmaWNhdGlvbkRhdGFGaWVsZD8uYW5ub3RhdGlvbnM/LlVJPy5IaWRkZW4/LnZhbHVlT2YoKSA9PT0gdHJ1ZTtcblx0fSkgfHwgW10pIGFzIERhdGFGaWVsZEZvckFjdGlvblR5cGVzW107XG5cdHJldHVybiBoaWRkZW5BY3Rpb25zLm1hcCgoZGF0YUZpZWxkKSA9PiB7XG5cdFx0cmV0dXJuIHtcblx0XHRcdHR5cGU6IEFjdGlvblR5cGUuRGVmYXVsdCxcblx0XHRcdGtleTogS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpXG5cdFx0fTtcblx0fSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRGb290ZXJEZWZhdWx0QWN0aW9ucyh2aWV3TGV2ZWw6IG51bWJlciwgY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IEJhc2VBY3Rpb25bXSB7XG5cdGNvbnN0IGVudGl0eVNldCA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0KCk7XG5cdGNvbnN0IGVudGl0eVR5cGUgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0Y29uc3Qgb1N0aWNreVNlc3Npb25TdXBwb3J0ZWQgPSBNb2RlbEhlbHBlci5nZXRTdGlja3lTZXNzaW9uKGVudGl0eVNldCksIC8vZm9yIHN0aWNreSBhcHBcblx0XHRzRW50aXR5U2V0RHJhZnRSb290ID1cblx0XHRcdCFNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihlbnRpdHlTZXQpICYmXG5cdFx0XHRlbnRpdHlTZXQgJiZcblx0XHRcdCgoZW50aXR5U2V0IGFzIEVudGl0eVNldCkuYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdFJvb3Q/LnRlcm0gfHxcblx0XHRcdFx0KGVudGl0eVNldCBhcyBFbnRpdHlTZXQpLmFubm90YXRpb25zPy5TZXNzaW9uPy5TdGlja3lTZXNzaW9uU3VwcG9ydGVkPy50ZXJtKSxcblx0XHRiQ29uZGl0aW9uU2F2ZSA9XG5cdFx0XHRzRW50aXR5U2V0RHJhZnRSb290ID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3RcIiB8fFxuXHRcdFx0KG9TdGlja3lTZXNzaW9uU3VwcG9ydGVkICYmIG9TdGlja3lTZXNzaW9uU3VwcG9ydGVkPy5TYXZlQWN0aW9uKSxcblx0XHRiQ29uZGl0aW9uQXBwbHkgPSB2aWV3TGV2ZWwgPiAxLFxuXHRcdGJDb25kaXRpb25DYW5jZWwgPVxuXHRcdFx0c0VudGl0eVNldERyYWZ0Um9vdCA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCIgfHxcblx0XHRcdChvU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCAmJiBvU3RpY2t5U2Vzc2lvblN1cHBvcnRlZD8uRGlzY2FyZEFjdGlvbik7XG5cblx0Ly8gUmV0cmlldmUgYWxsIGRldGVybWluaW5nIGFjdGlvbnNcblx0Y29uc3QgZm9vdGVyRGF0YUZpZWxkRm9yQWN0aW9ucyA9IGdldElkZW50aWZpY2F0aW9uRGF0YUZpZWxkRm9yQWN0aW9ucyhjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKSwgdHJ1ZSk7XG5cblx0Ly8gRmlyc3QgYWRkIHRoZSBcIkNyaXRpY2FsXCIgRGF0YUZpZWxkRm9yQWN0aW9uc1xuXHRjb25zdCBmb290ZXJBY3Rpb25zOiBCYXNlQWN0aW9uW10gPSBmb290ZXJEYXRhRmllbGRGb3JBY3Rpb25zXG5cdFx0LmZpbHRlcigoZGF0YUZpZWxkKSA9PiB7XG5cdFx0XHRyZXR1cm4gSU1QT1JUQU5UX0NSSVRJQ0FMSVRJRVMuaW5kZXhPZihkYXRhRmllbGQ/LkNyaXRpY2FsaXR5IGFzIHN0cmluZykgPiAtMTtcblx0XHR9KVxuXHRcdC5tYXAoKGRhdGFGaWVsZCkgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dHlwZTogQWN0aW9uVHlwZS5EYXRhRmllbGRGb3JBY3Rpb24sXG5cdFx0XHRcdGFubm90YXRpb25QYXRoOiBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoZGF0YUZpZWxkLmZ1bGx5UXVhbGlmaWVkTmFtZSksXG5cdFx0XHRcdGtleTogS2V5SGVscGVyLmdlbmVyYXRlS2V5RnJvbURhdGFGaWVsZChkYXRhRmllbGQpLFxuXHRcdFx0XHR2aXNpYmxlOiBjb21waWxlRXhwcmVzc2lvbihub3QoZXF1YWwoZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKGRhdGFGaWVsZC5hbm5vdGF0aW9ucz8uVUk/LkhpZGRlbiksIHRydWUpKSksXG5cdFx0XHRcdGVuYWJsZWQ6IGdldEVuYWJsZWRGb3JBbm5vdGF0aW9uQWN0aW9uKGNvbnZlcnRlckNvbnRleHQsIGRhdGFGaWVsZC5BY3Rpb25UYXJnZXQpLFxuXHRcdFx0XHRpc05hdmlnYWJsZTogdHJ1ZVxuXHRcdFx0fTtcblx0XHR9KTtcblxuXHQvLyBUaGVuIHRoZSBzYXZlIGFjdGlvbiBpZiBpdCBleGlzdHNcblx0aWYgKGVudGl0eVNldD8uZW50aXR5VHlwZU5hbWUgPT09IGVudGl0eVR5cGU/LmZ1bGx5UXVhbGlmaWVkTmFtZSAmJiBiQ29uZGl0aW9uU2F2ZSkge1xuXHRcdGZvb3RlckFjdGlvbnMucHVzaCh7IHR5cGU6IEFjdGlvblR5cGUuUHJpbWFyeSwga2V5OiBcIlNhdmVBY3Rpb25cIiB9KTtcblx0fVxuXG5cdC8vIFRoZW4gdGhlIGFwcGx5IGFjdGlvbiBpZiBpdCBleGlzdHNcblx0aWYgKGJDb25kaXRpb25BcHBseSkge1xuXHRcdGZvb3RlckFjdGlvbnMucHVzaCh7IHR5cGU6IEFjdGlvblR5cGUuRGVmYXVsdEFwcGx5LCBrZXk6IFwiQXBwbHlBY3Rpb25cIiB9KTtcblx0fVxuXG5cdC8vIFRoZW4gdGhlIG5vbiBjcml0aWNhbCBEYXRhRmllbGRGb3JBY3Rpb25zXG5cdGZvb3RlckRhdGFGaWVsZEZvckFjdGlvbnNcblx0XHQuZmlsdGVyKChkYXRhRmllbGQpID0+IHtcblx0XHRcdHJldHVybiBJTVBPUlRBTlRfQ1JJVElDQUxJVElFUy5pbmRleE9mKGRhdGFGaWVsZD8uQ3JpdGljYWxpdHkgYXMgc3RyaW5nKSA9PT0gLTE7XG5cdFx0fSlcblx0XHQuZm9yRWFjaCgoZGF0YUZpZWxkKSA9PiB7XG5cdFx0XHRmb290ZXJBY3Rpb25zLnB1c2goe1xuXHRcdFx0XHR0eXBlOiBBY3Rpb25UeXBlLkRhdGFGaWVsZEZvckFjdGlvbixcblx0XHRcdFx0YW5ub3RhdGlvblBhdGg6IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5U2V0QmFzZWRBbm5vdGF0aW9uUGF0aChkYXRhRmllbGQuZnVsbHlRdWFsaWZpZWROYW1lKSxcblx0XHRcdFx0a2V5OiBLZXlIZWxwZXIuZ2VuZXJhdGVLZXlGcm9tRGF0YUZpZWxkKGRhdGFGaWVsZCksXG5cdFx0XHRcdHZpc2libGU6IGNvbXBpbGVFeHByZXNzaW9uKG5vdChlcXVhbChnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24oZGF0YUZpZWxkLmFubm90YXRpb25zPy5VST8uSGlkZGVuKSwgdHJ1ZSkpKSxcblx0XHRcdFx0ZW5hYmxlZDogZ2V0RW5hYmxlZEZvckFubm90YXRpb25BY3Rpb24oY29udmVydGVyQ29udGV4dCwgZGF0YUZpZWxkLkFjdGlvblRhcmdldCksXG5cdFx0XHRcdGlzTmF2aWdhYmxlOiB0cnVlXG5cdFx0XHR9IGFzIEFubm90YXRpb25BY3Rpb24pO1xuXHRcdH0pO1xuXG5cdC8vIFRoZW4gdGhlIGNhbmNlbCBhY3Rpb24gaWYgaXQgZXhpc3RzXG5cdGlmIChiQ29uZGl0aW9uQ2FuY2VsKSB7XG5cdFx0Zm9vdGVyQWN0aW9ucy5wdXNoKHtcblx0XHRcdHR5cGU6IEFjdGlvblR5cGUuU2Vjb25kYXJ5LFxuXHRcdFx0a2V5OiBcIkNhbmNlbEFjdGlvblwiLFxuXHRcdFx0cG9zaXRpb246IHsgcGxhY2VtZW50OiBQbGFjZW1lbnQuRW5kIH1cblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gZm9vdGVyQWN0aW9ucztcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7RUFjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNPLFNBQVNBLG9DQUFvQyxDQUFDQyxVQUFzQixFQUFFQyxZQUFxQixFQUE2QjtJQUFB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