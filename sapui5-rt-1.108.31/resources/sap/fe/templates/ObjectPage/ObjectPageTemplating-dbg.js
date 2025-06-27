/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/converters/helpers/BindingHelper", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/CommonHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/internal/form/FormTemplating", "sap/m/library", "sap/ui/base/ManagedObject", "sap/ui/model/odata/v4/AnnotationHelper"], function (CommonUtils, BindingHelper, BindingToolkit, DataModelPathHelper, CommonHelper, FieldTemplating, FormTemplating, mLibrary, ManagedObject, ODataModelAnnotationHelper) {
  "use strict";

  var _exports = {};
  var getLabelForConnectedFields = FormTemplating.getLabelForConnectedFields;
  var formatValueRecursively = FieldTemplating.formatValueRecursively;
  var addTextArrangementToBindingExpression = FieldTemplating.addTextArrangementToBindingExpression;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var or = BindingToolkit.or;
  var isEmpty = BindingToolkit.isEmpty;
  var ifElse = BindingToolkit.ifElse;
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var constant = BindingToolkit.constant;
  var concat = BindingToolkit.concat;
  var compileExpression = BindingToolkit.compileExpression;
  var and = BindingToolkit.and;
  var UI = BindingHelper.UI;
  var Entity = BindingHelper.Entity;
  var Draft = BindingHelper.Draft;
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  var ButtonType = mLibrary.ButtonType;
  //```mermaid
  // graph TD
  // A[Object Page Title] -->|Get DataField Value| C{Evaluate Create Mode}
  // C -->|In Create Mode| D{Is DataField Value empty}
  // D -->|Yes| F{Is there a TypeName}
  // F -->|Yes| G[Is there an custom title]
  // G -->|Yes| G1[Show the custom title + 'TypeName']
  // G -->|No| G2[Display the default title 'New + TypeName']
  // F -->|No| H[Is there a custom title]
  // H -->|Yes| I[Show the custom title]
  // H -->|No| J[Show the default 'Unamned Object']
  // D -->|No| E
  // C -->|Not in create mode| E[Show DataField Value]
  // ```
  /**
   * Compute the title for the object page.
   *
   * @param oHeaderInfo The @UI.HeaderInfo annotation content
   * @param oViewData The view data object we're currently on
   * @param fullContextPath The full context path used to reach that object page
   * @param oDraftRoot
   * @returns The binding expression for the object page title
   */
  var getExpressionForTitle = function (oHeaderInfo, oViewData, fullContextPath, oDraftRoot) {
    var _oHeaderInfo$Title, _oHeaderInfo$Title2, _oHeaderInfo$Title5, _oHeaderInfo$Title6;
    var titleNoHeaderInfo = CommonUtils.getTranslatedText("T_NEW_OBJECT", oViewData.resourceBundle, undefined, oViewData.entitySet);
    var titleWithHeaderInfo = CommonUtils.getTranslatedText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE", oViewData.resourceBundle, undefined, oViewData.entitySet);
    var oEmptyHeaderInfoTitle = (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : oHeaderInfo.Title) === undefined || (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : oHeaderInfo.Title) === "" || (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title = oHeaderInfo.Title) === null || _oHeaderInfo$Title === void 0 ? void 0 : _oHeaderInfo$Title.Value) === "";
    var titleForActiveHeaderNoHeaderInfo = !oEmptyHeaderInfoTitle ? CommonUtils.getTranslatedText("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO", oViewData.resourceBundle) : "";
    var titleValueExpression,
      connectedFieldsPath,
      titleIsEmpty = constant(true),
      titleBooleanExpression;
    if ((oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title2 = oHeaderInfo.Title) === null || _oHeaderInfo$Title2 === void 0 ? void 0 : _oHeaderInfo$Title2.$Type) === "com.sap.vocabularies.UI.v1.DataField") {
      var _oHeaderInfo$Title3, _oHeaderInfo$Title4, _oHeaderInfo$Title4$V, _oHeaderInfo$Title4$V2, _oHeaderInfo$Title4$V3, _oHeaderInfo$Title4$V4, _oHeaderInfo$Title4$V5, _oHeaderInfo$Title4$V6, _oHeaderInfo$Title4$V7, _titleValueExpression, _titleValueExpression2;
      titleValueExpression = getExpressionFromAnnotation(oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title3 = oHeaderInfo.Title) === null || _oHeaderInfo$Title3 === void 0 ? void 0 : _oHeaderInfo$Title3.Value);
      if (oHeaderInfo !== null && oHeaderInfo !== void 0 && (_oHeaderInfo$Title4 = oHeaderInfo.Title) !== null && _oHeaderInfo$Title4 !== void 0 && (_oHeaderInfo$Title4$V = _oHeaderInfo$Title4.Value) !== null && _oHeaderInfo$Title4$V !== void 0 && (_oHeaderInfo$Title4$V2 = _oHeaderInfo$Title4$V.$target) !== null && _oHeaderInfo$Title4$V2 !== void 0 && (_oHeaderInfo$Title4$V3 = _oHeaderInfo$Title4$V2.annotations) !== null && _oHeaderInfo$Title4$V3 !== void 0 && (_oHeaderInfo$Title4$V4 = _oHeaderInfo$Title4$V3.Common) !== null && _oHeaderInfo$Title4$V4 !== void 0 && (_oHeaderInfo$Title4$V5 = _oHeaderInfo$Title4$V4.Text) !== null && _oHeaderInfo$Title4$V5 !== void 0 && (_oHeaderInfo$Title4$V6 = _oHeaderInfo$Title4$V5.annotations) !== null && _oHeaderInfo$Title4$V6 !== void 0 && (_oHeaderInfo$Title4$V7 = _oHeaderInfo$Title4$V6.UI) !== null && _oHeaderInfo$Title4$V7 !== void 0 && _oHeaderInfo$Title4$V7.TextArrangement) {
        // In case an explicit text arrangement was set we make use of it in the description as well
        titleValueExpression = addTextArrangementToBindingExpression(titleValueExpression, fullContextPath);
      }
      titleValueExpression = formatValueRecursively(titleValueExpression, fullContextPath);
      titleIsEmpty = ((_titleValueExpression = titleValueExpression) === null || _titleValueExpression === void 0 ? void 0 : _titleValueExpression._type) === "Constant" ? constant(!((_titleValueExpression2 = titleValueExpression) !== null && _titleValueExpression2 !== void 0 && _titleValueExpression2.value)) : isEmpty(titleValueExpression);
    } else if ((oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title5 = oHeaderInfo.Title) === null || _oHeaderInfo$Title5 === void 0 ? void 0 : _oHeaderInfo$Title5.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && (oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Title6 = oHeaderInfo.Title) === null || _oHeaderInfo$Title6 === void 0 ? void 0 : _oHeaderInfo$Title6.Target.$target.$Type) === "com.sap.vocabularies.UI.v1.ConnectedFieldsType") {
      var _titleValueExpression3, _titleValueExpression4;
      connectedFieldsPath = enhanceDataModelPath(fullContextPath, "$Type/@UI.HeaderInfo/Title/Target/$AnnotationPath");
      titleValueExpression = getLabelForConnectedFields(connectedFieldsPath, false);
      titleBooleanExpression = ((_titleValueExpression3 = titleValueExpression) === null || _titleValueExpression3 === void 0 ? void 0 : _titleValueExpression3._type) === "Constant" ? constant(!((_titleValueExpression4 = titleValueExpression) !== null && _titleValueExpression4 !== void 0 && _titleValueExpression4.value)) : isEmpty(titleValueExpression);
      titleIsEmpty = titleValueExpression ? titleBooleanExpression : constant(true);
    }

    // If there is a TypeName defined, show the default title 'New + TypeName', otherwise show the custom title or the default 'New object'
    var createModeTitle = oHeaderInfo !== null && oHeaderInfo !== void 0 && oHeaderInfo.TypeName ? concat(titleWithHeaderInfo, ": ", resolveBindingString(oHeaderInfo.TypeName.toString())) : titleNoHeaderInfo;
    var activeExpression = oDraftRoot ? Entity.IsActive : true;
    return compileExpression(ifElse(and(or(UI.IsCreateModeSticky, UI.IsCreateMode), titleIsEmpty), createModeTitle,
    // Otherwise show the default expression
    ifElse(and(activeExpression, titleIsEmpty), titleForActiveHeaderNoHeaderInfo, titleValueExpression)));
  };

  /**
   * Retrieves the expression for the description of an object page.
   *
   * @param oHeaderInfo The @UI.HeaderInfo annotation content
   * @param fullContextPath The full context path used to reach that object page
   * @returns The binding expression for the object page description
   */
  _exports.getExpressionForTitle = getExpressionForTitle;
  var getExpressionForDescription = function (oHeaderInfo, fullContextPath) {
    var _oHeaderInfo$Descript, _oHeaderInfo$Descript2, _oHeaderInfo$Descript3, _oHeaderInfo$Descript4, _oHeaderInfo$Descript5, _oHeaderInfo$Descript6, _oHeaderInfo$Descript7, _oHeaderInfo$Descript8, _oHeaderInfo$Descript9;
    var pathInModel = getExpressionFromAnnotation(oHeaderInfo === null || oHeaderInfo === void 0 ? void 0 : (_oHeaderInfo$Descript = oHeaderInfo.Description) === null || _oHeaderInfo$Descript === void 0 ? void 0 : _oHeaderInfo$Descript.Value);
    if (oHeaderInfo !== null && oHeaderInfo !== void 0 && (_oHeaderInfo$Descript2 = oHeaderInfo.Description) !== null && _oHeaderInfo$Descript2 !== void 0 && (_oHeaderInfo$Descript3 = _oHeaderInfo$Descript2.Value) !== null && _oHeaderInfo$Descript3 !== void 0 && (_oHeaderInfo$Descript4 = _oHeaderInfo$Descript3.$target) !== null && _oHeaderInfo$Descript4 !== void 0 && (_oHeaderInfo$Descript5 = _oHeaderInfo$Descript4.annotations) !== null && _oHeaderInfo$Descript5 !== void 0 && (_oHeaderInfo$Descript6 = _oHeaderInfo$Descript5.Common) !== null && _oHeaderInfo$Descript6 !== void 0 && (_oHeaderInfo$Descript7 = _oHeaderInfo$Descript6.Text) !== null && _oHeaderInfo$Descript7 !== void 0 && (_oHeaderInfo$Descript8 = _oHeaderInfo$Descript7.annotations) !== null && _oHeaderInfo$Descript8 !== void 0 && (_oHeaderInfo$Descript9 = _oHeaderInfo$Descript8.UI) !== null && _oHeaderInfo$Descript9 !== void 0 && _oHeaderInfo$Descript9.TextArrangement) {
      // In case an explicit text arrangement was set we make use of it in the description as well
      pathInModel = addTextArrangementToBindingExpression(pathInModel, fullContextPath);
    }
    return compileExpression(formatValueRecursively(pathInModel, fullContextPath));
  };

  /**
   * Return the expression for the save button.
   *
   * @param oViewData The current view data
   * @param fullContextPath The path used up until here
   * @returns The binding expression that shows the right save button text
   */
  _exports.getExpressionForDescription = getExpressionForDescription;
  var getExpressionForSaveButton = function (oViewData, fullContextPath) {
    var _annotations$Session;
    var saveButtonText = CommonUtils.getTranslatedText("T_OP_OBJECT_PAGE_SAVE", oViewData.resourceBundle);
    var createButtonText = CommonUtils.getTranslatedText("T_OP_OBJECT_PAGE_CREATE", oViewData.resourceBundle);
    var saveExpression;
    if ((_annotations$Session = fullContextPath.startingEntitySet.annotations.Session) !== null && _annotations$Session !== void 0 && _annotations$Session.StickySessionSupported) {
      // If we're in sticky mode AND the ui is in create mode, show Create, else show Save
      saveExpression = ifElse(UI.IsCreateModeSticky, createButtonText, saveButtonText);
    } else {
      // If we're in draft AND the draft is a new object (!IsActiveEntity && !HasActiveEntity), show create, else show save
      saveExpression = ifElse(Draft.IsNewObject, createButtonText, saveButtonText);
    }
    return compileExpression(saveExpression);
  };

  /**
   * Method returns whether footer is visible or not on object / subobject page.
   *
   * @function
   * @name getFooterVisible
   * @param footerActions The footer action object coming from the converter
   * @param dataFields Data field array for normal footer visibility processing
   * @returns `true` if any action is true, otherwise compiled Binding or `false`
   */
  _exports.getExpressionForSaveButton = getExpressionForSaveButton;
  var getFooterVisible = function (footerActions, dataFields) {
    var manifestActions = footerActions.filter(function (action) {
      return isManifestAction(action);
    });
    var customActionVisibility;
    if (manifestActions.length) {
      // If we have manifest actions
      var customActionIndividualVisibility = manifestActions.map(function (action) {
        return resolveBindingString(action.visible, "boolean");
      });
      // construct the footer's visibility-binding out of all actions' visibility-bindings, first the binding of all custom actions ...
      customActionVisibility = or.apply(void 0, _toConsumableArray(customActionIndividualVisibility));
      // and then the binding of all annotation actions inside the footer ...
      var annotationActionVisibility = getDataFieldBasedFooterVisibility(dataFields, true);
      // finally, return everything.
      return compileExpression(or(customActionVisibility, resolveBindingString(annotationActionVisibility, "boolean")));
    }
    return getDataFieldBasedFooterVisibility(dataFields, true);
  };

  /**
   * Checks if the footer is visible or not.
   *
   * @function
   * @static
   * @name sap.fe.templates.ObjectPage.ObjectPageTemplating.getDataFieldBasedFooterVisibility
   * @memberof sap.fe.templates.ObjectPage.ObjectPageTemplating
   * @param aDataFields Array of DataFields in the identification
   * @param bConsiderEditable Whether the edit mode binding is required or not
   * @returns An expression if all the actions are ui.hidden, true otherwise
   * @private
   * @ui5-restricted
   */
  _exports.getFooterVisible = getFooterVisible;
  var getDataFieldBasedFooterVisibility = function (aDataFields, bConsiderEditable) {
    var sHiddenExpression = "";
    var sSemiHiddenExpression;
    var aHiddenActionPath = [];
    for (var i in aDataFields) {
      var oDataField = aDataFields[i];
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && oDataField.Determining === true) {
        var hiddenExpression = oDataField["@".concat("com.sap.vocabularies.UI.v1.Hidden")];
        if (!hiddenExpression) {
          return true;
        } else if (hiddenExpression.$Path) {
          if (aHiddenActionPath.indexOf(hiddenExpression.$Path) === -1) {
            aHiddenActionPath.push(hiddenExpression.$Path);
          }
        }
      }
    }
    if (aHiddenActionPath.length) {
      for (var index = 0; index < aHiddenActionPath.length; index++) {
        if (aHiddenActionPath[index]) {
          sSemiHiddenExpression = "(%{" + aHiddenActionPath[index] + "} === true ? false : true )";
        }
        if (index == aHiddenActionPath.length - 1) {
          sHiddenExpression = sHiddenExpression + sSemiHiddenExpression;
        } else {
          sHiddenExpression = sHiddenExpression + sSemiHiddenExpression + "||";
        }
      }
      return "{= " + (bConsiderEditable ? "(" : "") + sHiddenExpression + (bConsiderEditable ? " || ${ui>/isEditable}) " : " ") + "&& ${internal>isCreateDialogOpen} !== true}";
    } else {
      return "{= " + (bConsiderEditable ? "${ui>/isEditable} && " : "") + "${internal>isCreateDialogOpen} !== true}";
    }
  };

  /**
   * Method returns Whether the action type is manifest or not.
   *
   * @function
   * @name isManifestActionVisible
   * @param oAction The action object
   * @returns `true` if action is coming from manifest, `false` otherwise
   */
  _exports.getDataFieldBasedFooterVisibility = getDataFieldBasedFooterVisibility;
  var isManifestAction = function (oAction) {
    var aActions = ["Primary", "DefaultApply", "Secondary", "ForAction", "ForNavigation", "SwitchToActiveObject", "SwitchToDraftObject", "DraftActions"];
    return aActions.indexOf(oAction.type) < 0;
  };

  /**
   * Returns an expression to determine Emphasized  button type based on Criticality across all actions
   * If critical action is rendered, its considered to be the primary action. Hence template's default primary action is set back to Default.
   *
   * @function
   * @static
   * @name sap.fe.templates.ObjectPage.ObjectPageTemplating.buildEmphasizedButtonExpression
   * @memberof sap.fe.templates.ObjectPage.ObjectPageTemplating
   * @param aIdentification Array of all the DataFields in Identification
   * @returns An expression to deduce if button type is Default or Emphasized
   * @private
   * @ui5-restricted
   */
  _exports.isManifestAction = isManifestAction;
  var buildEmphasizedButtonExpression = function (aIdentification) {
    if (!aIdentification) {
      return ButtonType.Emphasized;
    }
    var sFormatEmphasizedExpression;
    var bIsAlwaysDefault,
      sHiddenSimplePath,
      sHiddenExpression = "";
    aIdentification.forEach(function (oDataField) {
      var oCriticalityProperty = oDataField.Criticality;
      var oDataFieldHidden = oDataField["@com.sap.vocabularies.UI.v1.Hidden"];
      if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" && !bIsAlwaysDefault && oCriticalityProperty) {
        if (!sFormatEmphasizedExpression && oDataFieldHidden === true) {
          // if DataField is set to hidden, we can skip other checks and return Default button type
          sFormatEmphasizedExpression = ButtonType.Emphasized;
          return;
        }
        if (oDataFieldHidden && oDataFieldHidden.$Path) {
          // when visibility of critical button is based on path, collect all paths for expression
          sHiddenSimplePath = oDataFieldHidden.$Path;
          if (sHiddenExpression) {
            sHiddenExpression = sHiddenExpression + " && ";
          }
          sHiddenExpression = sHiddenExpression + "%{" + sHiddenSimplePath + "} === true";
          sFormatEmphasizedExpression = "{= (" + sHiddenExpression + ") ? 'Emphasized' : 'Default' }";
        }
        switch (oCriticalityProperty.$EnumMember) {
          // supported criticality are [Positive/3/'3'] and [Negative/1/'1']
          case "com.sap.vocabularies.UI.v1.CriticalityType/Negative":
          case "com.sap.vocabularies.UI.v1.CriticalityType/Positive":
          case "1":
          case 1:
          case "3":
          case 3:
            if (!oDataFieldHidden) {
              sFormatEmphasizedExpression = ButtonType.Default;
              bIsAlwaysDefault = true;
            }
            sFormatEmphasizedExpression = sFormatEmphasizedExpression || ButtonType.Default;
            break;
          default:
            sFormatEmphasizedExpression = ButtonType.Emphasized;
        }
        if (oCriticalityProperty.$Path) {
          // when Criticality is set using a path, use the path for deducing the Emphsized type for default Primary Action
          var sCombinedHiddenExpression = sHiddenExpression ? "!(" + sHiddenExpression + ") && " : "";
          sFormatEmphasizedExpression = "{= " + sCombinedHiddenExpression + "((${" + oCriticalityProperty.$Path + "} === 'com.sap.vocabularies.UI.v1.CriticalityType/Negative') || (${" + oCriticalityProperty.$Path + "} === '1') || (${" + oCriticalityProperty.$Path + "} === 1) " + "|| (${" + oCriticalityProperty.$Path + "} === 'com.sap.vocabularies.UI.v1.CriticalityType/Positive') || (${" + oCriticalityProperty.$Path + "} === '3') || (${" + oCriticalityProperty.$Path + "} === 3)) ? " + "'Default'" + " : " + "'Emphasized'" + " }";
        }
      }
    });
    return sFormatEmphasizedExpression || ButtonType.Emphasized;
  };
  _exports.buildEmphasizedButtonExpression = buildEmphasizedButtonExpression;
  var getElementBinding = function (sPath) {
    var sNavigationPath = ODataModelAnnotationHelper.getNavigationPath(sPath);
    if (sNavigationPath) {
      return "{path:'" + sNavigationPath + "'}";
    } else {
      //no navigation property needs empty object
      return "{path: ''}";
    }
  };

  /**
   * Function to check if draft pattern is supported.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns the Boolean value based on draft state
   */
  _exports.getElementBinding = getElementBinding;
  var checkDraftState = function (oAnnotations) {
    if (oAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"] && oAnnotations["@com.sap.vocabularies.Common.v1.DraftRoot"]["EditAction"]) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * Function to get the visibility for the SwitchToActive button in the object page or subobject page.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns expression binding or Boolean value based on the draft state
   */
  _exports.checkDraftState = checkDraftState;
  var getSwitchToActiveVisibility = function (oAnnotations) {
    if (checkDraftState(oAnnotations)) {
      return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( ${ui>/isEditable} && !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
    } else {
      return false;
    }
  };

  /**
   * Function to get the visibility for the SwitchToDraft button in the object page or subobject page.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns expression binding or Boolean value based on the draft state
   */
  _exports.getSwitchToActiveVisibility = getSwitchToActiveVisibility;
  var getSwitchToDraftVisibility = function (oAnnotations) {
    if (checkDraftState(oAnnotations)) {
      return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !(${ui>/isEditable}) && !${ui>createMode} && ${HasDraftEntity} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
    } else {
      return false;
    }
  };

  /**
   * Function to get the visibility for the SwitchDraftAndActive button in the object page or subobject page.
   *
   * @param oAnnotations Annotations of the current entity set.
   * @returns Returns expression binding or Boolean value based on the draft state
   */
  _exports.getSwitchToDraftVisibility = getSwitchToDraftVisibility;
  var getSwitchDraftAndActiveVisibility = function (oAnnotations) {
    if (checkDraftState(oAnnotations)) {
      return "{= (%{DraftAdministrativeData/DraftIsCreatedByMe}) ? ( !${ui>createMode} && %{DraftAdministrativeData/DraftIsCreatedByMe} ) : false }";
    } else {
      return false;
    }
  };

  /**
   * Function to find an action from the array of header actions in the converter context.
   *
   * @param aConverterContextHeaderActions Array of 'header' actions on the object page.
   * @param sActionType The action type
   * @returns The action with the matching action type
   * @private
   */
  _exports.getSwitchDraftAndActiveVisibility = getSwitchDraftAndActiveVisibility;
  var _findAction = function (aConverterContextHeaderActions, sActionType) {
    var oAction;
    if (aConverterContextHeaderActions && aConverterContextHeaderActions.length) {
      oAction = aConverterContextHeaderActions.find(function (oHeaderAction) {
        return oHeaderAction.type === sActionType;
      });
    }
    return oAction;
  };

  /**
   * Function to format the 'enabled' property for the Delete button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports._findAction = _findAction;
  var getDeleteCommandExecutionEnabled = function (aConverterContextHeaderActions) {
    var oDeleteAction = _findAction(aConverterContextHeaderActions, "Secondary");
    return oDeleteAction ? oDeleteAction.enabled : "true";
  };

  /**
   * Function to format the 'visible' property for the Delete button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getDeleteCommandExecutionEnabled = getDeleteCommandExecutionEnabled;
  var getDeleteCommandExecutionVisible = function (aConverterContextHeaderActions) {
    var oDeleteAction = _findAction(aConverterContextHeaderActions, "Secondary");
    return oDeleteAction ? oDeleteAction.visible : "true";
  };

  /**
   * Function to format the 'visible' property for the Edit button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getDeleteCommandExecutionVisible = getDeleteCommandExecutionVisible;
  var getEditCommandExecutionVisible = function (aConverterContextHeaderActions) {
    var oEditAction = _findAction(aConverterContextHeaderActions, "Primary");
    return oEditAction ? oEditAction.visible : "true";
  };

  /**
   * Function to format the 'enabled' property for the Edit button on the object page or subobject page in case of a Command Execution.
   *
   * @param aConverterContextHeaderActions Array of header actions on the object page
   * @returns Returns expression binding or Boolean value from the converter output
   */
  _exports.getEditCommandExecutionVisible = getEditCommandExecutionVisible;
  var getEditCommandExecutionEnabled = function (aConverterContextHeaderActions) {
    var oEditAction = _findAction(aConverterContextHeaderActions, "Primary");
    return oEditAction ? oEditAction.enabled : "true";
  };

  /**
   * Function to get the EditAction from the Entityset based on Draft or sticky based application.
   *
   * @param [oEntitySet] The value from the expression.
   * @returns Returns expression binding or boolean value based on vRawValue & oDraftNode
   */
  _exports.getEditCommandExecutionEnabled = getEditCommandExecutionEnabled;
  var getEditAction = function (oEntitySet) {
    var sPath = oEntitySet.getPath(),
      oAnnotations = oEntitySet.getObject("".concat(sPath, "@"));
    var bDraftRoot = oAnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.DraftRoot");
    var bStickySession = oAnnotations.hasOwnProperty("@com.sap.vocabularies.Session.v1.StickySessionSupported");
    var sActionName;
    if (bDraftRoot) {
      sActionName = oEntitySet.getObject("".concat(sPath, "@com.sap.vocabularies.Common.v1.DraftRoot/EditAction"));
    } else if (bStickySession) {
      sActionName = oEntitySet.getObject("".concat(sPath, "@com.sap.vocabularies.Session.v1.StickySessionSupported/EditAction"));
    }
    return !sActionName ? sActionName : "".concat(sPath, "/").concat(sActionName);
  };
  _exports.getEditAction = getEditAction;
  var isReadOnlyFromStaticAnnotations = function (oAnnotations, oFieldControl) {
    var bComputed, bImmutable, bReadOnly;
    if (oAnnotations && oAnnotations["@Org.OData.Core.V1.Computed"]) {
      bComputed = oAnnotations["@Org.OData.Core.V1.Computed"].Bool ? oAnnotations["@Org.OData.Core.V1.Computed"].Bool == "true" : true;
    }
    if (oAnnotations && oAnnotations["@Org.OData.Core.V1.Immutable"]) {
      bImmutable = oAnnotations["@Org.OData.Core.V1.Immutable"].Bool ? oAnnotations["@Org.OData.Core.V1.Immutable"].Bool == "true" : true;
    }
    bReadOnly = bComputed || bImmutable;
    if (oFieldControl) {
      bReadOnly = bReadOnly || oFieldControl == "com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly";
    }
    if (bReadOnly) {
      return true;
    } else {
      return false;
    }
  };
  _exports.isReadOnlyFromStaticAnnotations = isReadOnlyFromStaticAnnotations;
  var readOnlyExpressionFromDynamicAnnotations = function (oFieldControl) {
    var sIsFieldControlPathReadOnly;
    if (oFieldControl) {
      if (ManagedObject.bindingParser(oFieldControl)) {
        sIsFieldControlPathReadOnly = "%" + oFieldControl + " === 1 ";
      }
    }
    if (sIsFieldControlPathReadOnly) {
      return "{= " + sIsFieldControlPathReadOnly + "? false : true }";
    } else {
      return undefined;
    }
  };

  /*
   * Function to get the expression for chart Title Press
   *
   * @functionw
   * @param {oConfiguration} [oConfigurations] control configuration from manifest
   *  @param {oManifest} [oManifest] Outbounds from manifest
   * returns {String} [sCollectionName] Collection Name of the Micro Chart
   *
   * returns {String} [Expression] Handler Expression for the title press
   *
   */
  _exports.readOnlyExpressionFromDynamicAnnotations = readOnlyExpressionFromDynamicAnnotations;
  var getExpressionForMicroChartTitlePress = function (oConfiguration, oManifestOutbound, sCollectionName) {
    if (oConfiguration) {
      if (oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"] || oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"] && oConfiguration["targetSections"]) {
        return ".handlers.onDataPointTitlePressed($controller, ${$source>/},'" + JSON.stringify(oManifestOutbound) + "','" + oConfiguration["targetOutbound"]["outbound"] + "','" + sCollectionName + "' )";
      } else if (oConfiguration["targetSections"]) {
        return ".handlers.navigateToSubSection($controller, '" + JSON.stringify(oConfiguration["targetSections"]) + "')";
      } else {
        return undefined;
      }
    }
  };

  /*
   * Function to render Chart Title as Link
   *
   * @function
   * @param {oControlConfiguration} [oConfigurations] control configuration from manifest
   * returns {String} [sKey] For the TargetOutbound and TargetSection
   *
   */
  _exports.getExpressionForMicroChartTitlePress = getExpressionForMicroChartTitlePress;
  var getMicroChartTitleAsLink = function (oControlConfiguration) {
    if (oControlConfiguration && (oControlConfiguration["targetOutbound"] || oControlConfiguration["targetOutbound"] && oControlConfiguration["targetSections"])) {
      return "External";
    } else if (oControlConfiguration && oControlConfiguration["targetSections"]) {
      return "InPage";
    } else {
      return "None";
    }
  };

  /* Get groupId from control configuration
   *
   * @function
   * @param {Object} [oConfigurations] control configuration from manifest
   * @param {String} [sAnnotationPath] Annotation Path for the configuration
   * @description Used to get the groupId for DataPoints and MicroCharts in the Header.
   *
   */
  _exports.getMicroChartTitleAsLink = getMicroChartTitleAsLink;
  var getGroupIdFromConfig = function (oConfigurations, sAnnotationPath, sDefaultGroupId) {
    var oConfiguration = oConfigurations[sAnnotationPath],
      aAutoPatterns = ["Heroes", "Decoration", "Workers", "LongRunners"];
    var sGroupId = sDefaultGroupId;
    if (oConfiguration && oConfiguration.requestGroupId && aAutoPatterns.some(function (autoPattern) {
      return autoPattern === oConfiguration.requestGroupId;
    })) {
      sGroupId = "$auto." + oConfiguration.requestGroupId;
    }
    return sGroupId;
  };

  /*
   * Get Context Binding with groupId from control configuration
   *
   * @function
   * @param {Object} [oConfigurations] control configuration from manifest
   * @param {String} [sKey] Annotation Path for of the configuration
   * @description Used to get the binding for DataPoints in the Header.
   *
   */
  _exports.getGroupIdFromConfig = getGroupIdFromConfig;
  var getBindingWithGroupIdFromConfig = function (oConfigurations, sKey) {
    var sGroupId = getGroupIdFromConfig(oConfigurations, sKey);
    var sBinding;
    if (sGroupId) {
      sBinding = "{ path : '', parameters : { $$groupId : '" + sGroupId + "' } }";
    }
    return sBinding;
  };

  /**
   * Method to check whether a FieldGroup consists of only 1 DataField with MultiLine Text annotation.
   *
   * @param aFormElements A collection of form elements used in the current field group
   * @returns Returns true if only 1 data field with Multiline Text annotation exists.
   */
  _exports.getBindingWithGroupIdFromConfig = getBindingWithGroupIdFromConfig;
  var doesFieldGroupContainOnlyOneMultiLineDataField = function (aFormElements) {
    return aFormElements && aFormElements.length === 1 && !!aFormElements[0].isValueMultilineText;
  };

  /*
   * Get Visiblity of breadcrumbs.
   *
   * @function
   * @param {Object} [oViewData] ViewData model
   * returns {*} Expression or boolean
   */
  _exports.doesFieldGroupContainOnlyOneMultiLineDataField = doesFieldGroupContainOnlyOneMultiLineDataField;
  var getVisibleExpressionForBreadcrumbs = function (oViewData) {
    return oViewData.showBreadCrumbs && oViewData.fclEnabled !== undefined ? "{fclhelper>/breadCrumbIsVisible}" : oViewData.showBreadCrumbs;
  };
  _exports.getVisibleExpressionForBreadcrumbs = getVisibleExpressionForBreadcrumbs;
  var getShareButtonVisibility = function (viewData) {
    var sShareButtonVisibilityExp = "!${ui>createMode}";
    if (viewData.fclEnabled) {
      sShareButtonVisibilityExp = "${fclhelper>/showShareIcon} && " + sShareButtonVisibilityExp;
    }
    return "{= " + sShareButtonVisibilityExp + " }";
  };

  /*
   * Gets the visibility of the header info in edit mode
   *
   * If either the title or description field from the header annotations are editable, then the
   * editable header info is visible.
   *
   * @function
   * @param {object} [oAnnotations] Annotations object for given entity set
   * @param {object} [oFieldControl] field control
   * returns {*}  binding expression or boolean value resolved form funcitons isReadOnlyFromStaticAnnotations and isReadOnlyFromDynamicAnnotations
   */
  _exports.getShareButtonVisibility = getShareButtonVisibility;
  var getVisiblityOfHeaderInfo = function (oTitleAnnotations, oDescriptionAnnotations, oFieldTitleFieldControl, oFieldDescriptionFieldControl) {
    // Check Annotations for Title Field
    // Set to true and don't take into account, if there are no annotations, i.e. no title exists
    var bIsTitleReadOnly = oTitleAnnotations ? isReadOnlyFromStaticAnnotations(oTitleAnnotations, oFieldTitleFieldControl) : true;
    var titleExpression = readOnlyExpressionFromDynamicAnnotations(oFieldTitleFieldControl);
    // There is no expression and the title is not ready only, this is sufficient for an editable header
    if (!bIsTitleReadOnly && !titleExpression) {
      return true;
    }

    // Check Annotations for Description Field
    // Set to true and don't take into account, if there are no annotations, i.e. no description exists
    var bIsDescriptionReadOnly = oDescriptionAnnotations ? isReadOnlyFromStaticAnnotations(oDescriptionAnnotations, oFieldDescriptionFieldControl) : true;
    var descriptionExpression = readOnlyExpressionFromDynamicAnnotations(oFieldDescriptionFieldControl);
    // There is no expression and the description is not ready only, this is sufficient for an editable header
    if (!bIsDescriptionReadOnly && !descriptionExpression) {
      return true;
    }

    // Both title and description are not editable and there are no dynamic annotations
    if (bIsTitleReadOnly && bIsDescriptionReadOnly && !titleExpression && !descriptionExpression) {
      return false;
    }

    // Now combine expressions
    if (titleExpression && !descriptionExpression) {
      return titleExpression;
    } else if (!titleExpression && descriptionExpression) {
      return descriptionExpression;
    } else {
      return combineTitleAndDescriptionExpression(oFieldTitleFieldControl, oFieldDescriptionFieldControl);
    }
  };
  _exports.getVisiblityOfHeaderInfo = getVisiblityOfHeaderInfo;
  var combineTitleAndDescriptionExpression = function (oTitleFieldControl, oDescriptionFieldControl) {
    // If both header and title field are based on dynmaic field control, the editable header
    // is visible if at least one of these is not ready only
    return "{= %" + oTitleFieldControl + " === 1 ? ( %" + oDescriptionFieldControl + " === 1 ? false : true ) : true }";
  };

  /*
   * Get Expression of press event of delete button.
   *
   * @function
   * @param {string} [sEntitySetName] Entity set name
   * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
   */
  _exports.combineTitleAndDescriptionExpression = combineTitleAndDescriptionExpression;
  var getPressExpressionForDelete = function (sEntitySetName) {
    var sDeletableContexts = "${$view>/getBindingContext}",
      sTitle = "${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedHeading/getItems/1/getText}",
      sDescription = "${$view>/#fe::ObjectPage/getHeaderTitle/getExpandedContent/0/getItems/0/getText}";
    var oParams = {
      title: sTitle,
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      description: sDescription
    };
    return CommonHelper.generateFunction(".editFlow.deleteDocument", sDeletableContexts, CommonHelper.objectToString(oParams));
  };

  /*
   * Get Expression of press event of Edit button.
   *
   * @function
   * @param {object} [oDataField] Data field object
   * @param {string} [sEntitySetName] Entity set name
   * @param {object} [oHeaderAction] Header action object
   * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
   */
  _exports.getPressExpressionForDelete = getPressExpressionForDelete;
  var getPressExpressionForEdit = function (oDataField, sEntitySetName, oHeaderAction) {
    var sEditableContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
      sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
      sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    var oParams = {
      contexts: "${$view>/getBindingContext}",
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(oDataField && oDataField.Label, true),
      isNavigable: oHeaderAction && oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction && oHeaderAction.defaultValuesExtensionFunction ? "'".concat(oHeaderAction.defaultValuesExtensionFunction, "'") : undefined
    };
    return CommonHelper.generateFunction(".handlers.onCallAction", "${$view>/}", sEditableContexts, CommonHelper.objectToString(oParams));
  };

  /*
   * Method to get the expression for the 'press' event for footer annotation actions
   *
   * @function
   * @param {object} [oDataField] Data field object
   * @param {string} [sEntitySetName] Entity set name
   * @param {object} [oHeaderAction] Header action object
   * returns {string}  Binding expression or function string that is generated from the Commonhelper's function generateFunction
   */
  _exports.getPressExpressionForEdit = getPressExpressionForEdit;
  var getPressExpressionForFooterAnnotationAction = function (oDataField, sEntitySetName, oHeaderAction) {
    var sActionContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
      sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
      sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    var oParams = {
      contexts: "${$view>/#fe::ObjectPage/}.getBindingContext()",
      entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(oDataField && oDataField.Label, true),
      isNavigable: oHeaderAction && oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction && oHeaderAction.defaultValuesExtensionFunction ? "'".concat(oHeaderAction.defaultValuesExtensionFunction, "'") : undefined
    };
    return CommonHelper.generateFunction(".handlers.onCallAction", "${$view>/}", sActionContexts, CommonHelper.objectToString(oParams));
  };

  /*
   * Get Expression of execute event expression of primary action.
   *
   * @function
   * @param {object} [oDataField] Data field object
   * @param {string} [sEntitySetName] Entity set name
   * @param {object} [oHeaderAction] Header action object
   * @param {CompiledBindingToolkitExpression | string} The visibility of sematic positive action
   * @param {CompiledBindingToolkitExpression | string} The enablement of semantic positive action
   * @param {CompiledBindingToolkitExpression | string} The Edit button visibility
   * @param {CompiledBindingToolkitExpression | string} The enablement of Edit button
   * returns {string}  binding expression / function string generated from commanhelper's function generateFunction
   */
  _exports.getPressExpressionForFooterAnnotationAction = getPressExpressionForFooterAnnotationAction;
  var getPressExpressionForPrimaryAction = function (oDataField, sEntitySetName, oHeaderAction, positiveActionVisible, positiveActionEnabled, editActionVisible, editActionEnabled) {
    var sActionContexts = CommonHelper.addSingleQuotes(oDataField && oDataField.Action),
      sDataFieldEnumMember = oDataField && oDataField.InvocationGrouping && oDataField.InvocationGrouping["$EnumMember"],
      sInvocationGroup = sDataFieldEnumMember === "com.sap.vocabularies.UI.v1.OperationGroupingType/ChangeSet" ? "ChangeSet" : "Isolated";
    var oParams = {
      contexts: "${$view>/#fe::ObjectPage/}.getBindingContext()",
      entitySetName: sEntitySetName ? CommonHelper.addSingleQuotes(sEntitySetName) : "",
      invocationGrouping: CommonHelper.addSingleQuotes(sInvocationGroup),
      model: "${$source>/}.getModel()",
      label: CommonHelper.addSingleQuotes(oDataField === null || oDataField === void 0 ? void 0 : oDataField.Label, true),
      isNavigable: oHeaderAction === null || oHeaderAction === void 0 ? void 0 : oHeaderAction.isNavigable,
      defaultValuesExtensionFunction: oHeaderAction !== null && oHeaderAction !== void 0 && oHeaderAction.defaultValuesExtensionFunction ? "'".concat(oHeaderAction.defaultValuesExtensionFunction, "'") : undefined
    };
    var oConditions = {
      positiveActionVisible: positiveActionVisible,
      positiveActionEnabled: positiveActionEnabled,
      editActionVisible: editActionVisible,
      editActionEnabled: editActionEnabled
    };
    return CommonHelper.generateFunction(".handlers.onPrimaryAction", "$controller", "${$view>/}", "${$view>/getBindingContext}", sActionContexts, CommonHelper.objectToString(oParams), CommonHelper.objectToString(oConditions));
  };

  /*
   * Gets the binding of the container HBox for the header facet.
   *
   * @function
   * @param {object} [oControlConfiguration] The control configuration form of the viewData model
   * @param {object} [oHeaderFacet] The object of the header facet
   * returns {*}  The binding expression from function getBindingWithGroupIdFromConfig or undefined.
   */
  _exports.getPressExpressionForPrimaryAction = getPressExpressionForPrimaryAction;
  var getStashableHBoxBinding = function (oControlConfiguration, oHeaderFacet) {
    if (oHeaderFacet && oHeaderFacet.Facet && oHeaderFacet.Facet.targetAnnotationType === "DataPoint") {
      return getBindingWithGroupIdFromConfig(oControlConfiguration, oHeaderFacet.Facet.targetAnnotationValue);
    }
  };

  /*
   * Gets the 'Press' event expression for the external and internal data point link.
   *
   * @function
   * @param {object} [oConfiguration] Control configuration from manifest
   * @param {object} [oManifestOutbound] Outbounds from manifest
   * returns {string} The runtime binding of the 'Press' event
   */
  _exports.getStashableHBoxBinding = getStashableHBoxBinding;
  var getPressExpressionForLink = function (oConfiguration, oManifestOutbound) {
    if (oConfiguration) {
      if (oConfiguration["targetOutbound"] && oConfiguration["targetOutbound"]["outbound"]) {
        return ".handlers.onDataPointTitlePressed($controller, ${$source>}, " + JSON.stringify(oManifestOutbound) + "," + JSON.stringify(oConfiguration["targetOutbound"]["outbound"]) + ")";
      } else if (oConfiguration["targetSections"]) {
        return ".handlers.navigateToSubSection($controller, '" + JSON.stringify(oConfiguration["targetSections"]) + "')";
      } else {
        return undefined;
      }
    }
  };
  _exports.getPressExpressionForLink = getPressExpressionForLink;
  var getHeaderFormHboxRenderType = function (dataField) {
    var _dataField$targetObje;
    if ((dataField === null || dataField === void 0 ? void 0 : (_dataField$targetObje = dataField.targetObject) === null || _dataField$targetObje === void 0 ? void 0 : _dataField$targetObje.$Type) === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
      return undefined;
    }
    return "Bare";
  };
  _exports.getHeaderFormHboxRenderType = getHeaderFormHboxRenderType;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b25UeXBlIiwibUxpYnJhcnkiLCJnZXRFeHByZXNzaW9uRm9yVGl0bGUiLCJvSGVhZGVySW5mbyIsIm9WaWV3RGF0YSIsImZ1bGxDb250ZXh0UGF0aCIsIm9EcmFmdFJvb3QiLCJ0aXRsZU5vSGVhZGVySW5mbyIsIkNvbW1vblV0aWxzIiwiZ2V0VHJhbnNsYXRlZFRleHQiLCJyZXNvdXJjZUJ1bmRsZSIsInVuZGVmaW5lZCIsImVudGl0eVNldCIsInRpdGxlV2l0aEhlYWRlckluZm8iLCJvRW1wdHlIZWFkZXJJbmZvVGl0bGUiLCJUaXRsZSIsIlZhbHVlIiwidGl0bGVGb3JBY3RpdmVIZWFkZXJOb0hlYWRlckluZm8iLCJ0aXRsZVZhbHVlRXhwcmVzc2lvbiIsImNvbm5lY3RlZEZpZWxkc1BhdGgiLCJ0aXRsZUlzRW1wdHkiLCJjb25zdGFudCIsInRpdGxlQm9vbGVhbkV4cHJlc3Npb24iLCIkVHlwZSIsImdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiIsIiR0YXJnZXQiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlRleHQiLCJVSSIsIlRleHRBcnJhbmdlbWVudCIsImFkZFRleHRBcnJhbmdlbWVudFRvQmluZGluZ0V4cHJlc3Npb24iLCJmb3JtYXRWYWx1ZVJlY3Vyc2l2ZWx5IiwiX3R5cGUiLCJ2YWx1ZSIsImlzRW1wdHkiLCJUYXJnZXQiLCJlbmhhbmNlRGF0YU1vZGVsUGF0aCIsImdldExhYmVsRm9yQ29ubmVjdGVkRmllbGRzIiwiY3JlYXRlTW9kZVRpdGxlIiwiVHlwZU5hbWUiLCJjb25jYXQiLCJyZXNvbHZlQmluZGluZ1N0cmluZyIsInRvU3RyaW5nIiwiYWN0aXZlRXhwcmVzc2lvbiIsIkVudGl0eSIsIklzQWN0aXZlIiwiY29tcGlsZUV4cHJlc3Npb24iLCJpZkVsc2UiLCJhbmQiLCJvciIsIklzQ3JlYXRlTW9kZVN0aWNreSIsIklzQ3JlYXRlTW9kZSIsImdldEV4cHJlc3Npb25Gb3JEZXNjcmlwdGlvbiIsInBhdGhJbk1vZGVsIiwiRGVzY3JpcHRpb24iLCJnZXRFeHByZXNzaW9uRm9yU2F2ZUJ1dHRvbiIsInNhdmVCdXR0b25UZXh0IiwiY3JlYXRlQnV0dG9uVGV4dCIsInNhdmVFeHByZXNzaW9uIiwic3RhcnRpbmdFbnRpdHlTZXQiLCJTZXNzaW9uIiwiU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIkRyYWZ0IiwiSXNOZXdPYmplY3QiLCJnZXRGb290ZXJWaXNpYmxlIiwiZm9vdGVyQWN0aW9ucyIsImRhdGFGaWVsZHMiLCJtYW5pZmVzdEFjdGlvbnMiLCJmaWx0ZXIiLCJhY3Rpb24iLCJpc01hbmlmZXN0QWN0aW9uIiwiY3VzdG9tQWN0aW9uVmlzaWJpbGl0eSIsImxlbmd0aCIsImN1c3RvbUFjdGlvbkluZGl2aWR1YWxWaXNpYmlsaXR5IiwibWFwIiwidmlzaWJsZSIsImFubm90YXRpb25BY3Rpb25WaXNpYmlsaXR5IiwiZ2V0RGF0YUZpZWxkQmFzZWRGb290ZXJWaXNpYmlsaXR5IiwiYURhdGFGaWVsZHMiLCJiQ29uc2lkZXJFZGl0YWJsZSIsInNIaWRkZW5FeHByZXNzaW9uIiwic1NlbWlIaWRkZW5FeHByZXNzaW9uIiwiYUhpZGRlbkFjdGlvblBhdGgiLCJpIiwib0RhdGFGaWVsZCIsIkRldGVybWluaW5nIiwiaGlkZGVuRXhwcmVzc2lvbiIsIiRQYXRoIiwiaW5kZXhPZiIsInB1c2giLCJpbmRleCIsIm9BY3Rpb24iLCJhQWN0aW9ucyIsInR5cGUiLCJidWlsZEVtcGhhc2l6ZWRCdXR0b25FeHByZXNzaW9uIiwiYUlkZW50aWZpY2F0aW9uIiwiRW1waGFzaXplZCIsInNGb3JtYXRFbXBoYXNpemVkRXhwcmVzc2lvbiIsImJJc0Fsd2F5c0RlZmF1bHQiLCJzSGlkZGVuU2ltcGxlUGF0aCIsImZvckVhY2giLCJvQ3JpdGljYWxpdHlQcm9wZXJ0eSIsIkNyaXRpY2FsaXR5Iiwib0RhdGFGaWVsZEhpZGRlbiIsIiRFbnVtTWVtYmVyIiwiRGVmYXVsdCIsInNDb21iaW5lZEhpZGRlbkV4cHJlc3Npb24iLCJnZXRFbGVtZW50QmluZGluZyIsInNQYXRoIiwic05hdmlnYXRpb25QYXRoIiwiT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIiLCJnZXROYXZpZ2F0aW9uUGF0aCIsImNoZWNrRHJhZnRTdGF0ZSIsIm9Bbm5vdGF0aW9ucyIsImdldFN3aXRjaFRvQWN0aXZlVmlzaWJpbGl0eSIsImdldFN3aXRjaFRvRHJhZnRWaXNpYmlsaXR5IiwiZ2V0U3dpdGNoRHJhZnRBbmRBY3RpdmVWaXNpYmlsaXR5IiwiX2ZpbmRBY3Rpb24iLCJhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMiLCJzQWN0aW9uVHlwZSIsImZpbmQiLCJvSGVhZGVyQWN0aW9uIiwiZ2V0RGVsZXRlQ29tbWFuZEV4ZWN1dGlvbkVuYWJsZWQiLCJvRGVsZXRlQWN0aW9uIiwiZW5hYmxlZCIsImdldERlbGV0ZUNvbW1hbmRFeGVjdXRpb25WaXNpYmxlIiwiZ2V0RWRpdENvbW1hbmRFeGVjdXRpb25WaXNpYmxlIiwib0VkaXRBY3Rpb24iLCJnZXRFZGl0Q29tbWFuZEV4ZWN1dGlvbkVuYWJsZWQiLCJnZXRFZGl0QWN0aW9uIiwib0VudGl0eVNldCIsImdldFBhdGgiLCJnZXRPYmplY3QiLCJiRHJhZnRSb290IiwiaGFzT3duUHJvcGVydHkiLCJiU3RpY2t5U2Vzc2lvbiIsInNBY3Rpb25OYW1lIiwiaXNSZWFkT25seUZyb21TdGF0aWNBbm5vdGF0aW9ucyIsIm9GaWVsZENvbnRyb2wiLCJiQ29tcHV0ZWQiLCJiSW1tdXRhYmxlIiwiYlJlYWRPbmx5IiwiQm9vbCIsInJlYWRPbmx5RXhwcmVzc2lvbkZyb21EeW5hbWljQW5ub3RhdGlvbnMiLCJzSXNGaWVsZENvbnRyb2xQYXRoUmVhZE9ubHkiLCJNYW5hZ2VkT2JqZWN0IiwiYmluZGluZ1BhcnNlciIsImdldEV4cHJlc3Npb25Gb3JNaWNyb0NoYXJ0VGl0bGVQcmVzcyIsIm9Db25maWd1cmF0aW9uIiwib01hbmlmZXN0T3V0Ym91bmQiLCJzQ29sbGVjdGlvbk5hbWUiLCJKU09OIiwic3RyaW5naWZ5IiwiZ2V0TWljcm9DaGFydFRpdGxlQXNMaW5rIiwib0NvbnRyb2xDb25maWd1cmF0aW9uIiwiZ2V0R3JvdXBJZEZyb21Db25maWciLCJvQ29uZmlndXJhdGlvbnMiLCJzQW5ub3RhdGlvblBhdGgiLCJzRGVmYXVsdEdyb3VwSWQiLCJhQXV0b1BhdHRlcm5zIiwic0dyb3VwSWQiLCJyZXF1ZXN0R3JvdXBJZCIsInNvbWUiLCJhdXRvUGF0dGVybiIsImdldEJpbmRpbmdXaXRoR3JvdXBJZEZyb21Db25maWciLCJzS2V5Iiwic0JpbmRpbmciLCJkb2VzRmllbGRHcm91cENvbnRhaW5Pbmx5T25lTXVsdGlMaW5lRGF0YUZpZWxkIiwiYUZvcm1FbGVtZW50cyIsImlzVmFsdWVNdWx0aWxpbmVUZXh0IiwiZ2V0VmlzaWJsZUV4cHJlc3Npb25Gb3JCcmVhZGNydW1icyIsInNob3dCcmVhZENydW1icyIsImZjbEVuYWJsZWQiLCJnZXRTaGFyZUJ1dHRvblZpc2liaWxpdHkiLCJ2aWV3RGF0YSIsInNTaGFyZUJ1dHRvblZpc2liaWxpdHlFeHAiLCJnZXRWaXNpYmxpdHlPZkhlYWRlckluZm8iLCJvVGl0bGVBbm5vdGF0aW9ucyIsIm9EZXNjcmlwdGlvbkFubm90YXRpb25zIiwib0ZpZWxkVGl0bGVGaWVsZENvbnRyb2wiLCJvRmllbGREZXNjcmlwdGlvbkZpZWxkQ29udHJvbCIsImJJc1RpdGxlUmVhZE9ubHkiLCJ0aXRsZUV4cHJlc3Npb24iLCJiSXNEZXNjcmlwdGlvblJlYWRPbmx5IiwiZGVzY3JpcHRpb25FeHByZXNzaW9uIiwiY29tYmluZVRpdGxlQW5kRGVzY3JpcHRpb25FeHByZXNzaW9uIiwib1RpdGxlRmllbGRDb250cm9sIiwib0Rlc2NyaXB0aW9uRmllbGRDb250cm9sIiwiZ2V0UHJlc3NFeHByZXNzaW9uRm9yRGVsZXRlIiwic0VudGl0eVNldE5hbWUiLCJzRGVsZXRhYmxlQ29udGV4dHMiLCJzVGl0bGUiLCJzRGVzY3JpcHRpb24iLCJvUGFyYW1zIiwidGl0bGUiLCJlbnRpdHlTZXROYW1lIiwiQ29tbW9uSGVscGVyIiwiYWRkU2luZ2xlUXVvdGVzIiwiZGVzY3JpcHRpb24iLCJnZW5lcmF0ZUZ1bmN0aW9uIiwib2JqZWN0VG9TdHJpbmciLCJnZXRQcmVzc0V4cHJlc3Npb25Gb3JFZGl0Iiwic0VkaXRhYmxlQ29udGV4dHMiLCJBY3Rpb24iLCJzRGF0YUZpZWxkRW51bU1lbWJlciIsIkludm9jYXRpb25Hcm91cGluZyIsInNJbnZvY2F0aW9uR3JvdXAiLCJjb250ZXh0cyIsImludm9jYXRpb25Hcm91cGluZyIsIm1vZGVsIiwibGFiZWwiLCJMYWJlbCIsImlzTmF2aWdhYmxlIiwiZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uIiwiZ2V0UHJlc3NFeHByZXNzaW9uRm9yRm9vdGVyQW5ub3RhdGlvbkFjdGlvbiIsInNBY3Rpb25Db250ZXh0cyIsImdldFByZXNzRXhwcmVzc2lvbkZvclByaW1hcnlBY3Rpb24iLCJwb3NpdGl2ZUFjdGlvblZpc2libGUiLCJwb3NpdGl2ZUFjdGlvbkVuYWJsZWQiLCJlZGl0QWN0aW9uVmlzaWJsZSIsImVkaXRBY3Rpb25FbmFibGVkIiwib0NvbmRpdGlvbnMiLCJnZXRTdGFzaGFibGVIQm94QmluZGluZyIsIm9IZWFkZXJGYWNldCIsIkZhY2V0IiwidGFyZ2V0QW5ub3RhdGlvblR5cGUiLCJ0YXJnZXRBbm5vdGF0aW9uVmFsdWUiLCJnZXRQcmVzc0V4cHJlc3Npb25Gb3JMaW5rIiwiZ2V0SGVhZGVyRm9ybUhib3hSZW5kZXJUeXBlIiwiZGF0YUZpZWxkIiwidGFyZ2V0T2JqZWN0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJPYmplY3RQYWdlVGVtcGxhdGluZy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBGb3JtYXR0ZXJzIGZvciB0aGUgT2JqZWN0IFBhZ2VcbmltcG9ydCB7IEVudGl0eVNldCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHR5cGUgeyBEYXRhRmllbGQsIERhdGFGaWVsZFR5cGVzLCBIZWFkZXJJbmZvVHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB7IFVJQW5ub3RhdGlvblRlcm1zLCBVSUFubm90YXRpb25UeXBlcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvVUlcIjtcbmltcG9ydCB0eXBlIFJlc291cmNlQnVuZGxlIGZyb20gXCJzYXAvYmFzZS9pMThuL1Jlc291cmNlQnVuZGxlXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgdHlwZSB7IEJhc2VBY3Rpb24sIENvbnZlcnRlckFjdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9BY3Rpb25cIjtcbmltcG9ydCB7IERyYWZ0LCBFbnRpdHksIFVJIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvaGVscGVycy9CaW5kaW5nSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IE1hbmlmZXN0QWN0aW9uIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHtcblx0YW5kLFxuXHRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24sXG5cdENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRjb21waWxlRXhwcmVzc2lvbixcblx0Y29uY2F0LFxuXHRjb25zdGFudCxcblx0Z2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uLFxuXHRpZkVsc2UsXG5cdGlzRW1wdHksXG5cdG9yLFxuXHRyZXNvbHZlQmluZGluZ1N0cmluZ1xufSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgZW5oYW5jZURhdGFNb2RlbFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgQ29tbW9uSGVscGVyIGZyb20gXCJzYXAvZmUvbWFjcm9zL0NvbW1vbkhlbHBlclwiO1xuaW1wb3J0IHsgYWRkVGV4dEFycmFuZ2VtZW50VG9CaW5kaW5nRXhwcmVzc2lvbiwgZm9ybWF0VmFsdWVSZWN1cnNpdmVseSB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ZpZWxkL0ZpZWxkVGVtcGxhdGluZ1wiO1xuaW1wb3J0IHsgZ2V0TGFiZWxGb3JDb25uZWN0ZWRGaWVsZHMgfSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9pbnRlcm5hbC9mb3JtL0Zvcm1UZW1wbGF0aW5nXCI7XG5pbXBvcnQgbUxpYnJhcnkgZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcbmltcG9ydCBNYW5hZ2VkT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9NYW5hZ2VkT2JqZWN0XCI7XG5pbXBvcnQgT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Bbm5vdGF0aW9uSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuXG5jb25zdCBCdXR0b25UeXBlID0gbUxpYnJhcnkuQnV0dG9uVHlwZTtcblxudHlwZSBWaWV3RGF0YSA9IHtcblx0cmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlO1xuXHRlbnRpdHlTZXQ6IHN0cmluZztcbn07XG5cbi8vYGBgbWVybWFpZFxuLy8gZ3JhcGggVERcbi8vIEFbT2JqZWN0IFBhZ2UgVGl0bGVdIC0tPnxHZXQgRGF0YUZpZWxkIFZhbHVlfCBDe0V2YWx1YXRlIENyZWF0ZSBNb2RlfVxuLy8gQyAtLT58SW4gQ3JlYXRlIE1vZGV8IER7SXMgRGF0YUZpZWxkIFZhbHVlIGVtcHR5fVxuLy8gRCAtLT58WWVzfCBGe0lzIHRoZXJlIGEgVHlwZU5hbWV9XG4vLyBGIC0tPnxZZXN8IEdbSXMgdGhlcmUgYW4gY3VzdG9tIHRpdGxlXVxuLy8gRyAtLT58WWVzfCBHMVtTaG93IHRoZSBjdXN0b20gdGl0bGUgKyAnVHlwZU5hbWUnXVxuLy8gRyAtLT58Tm98IEcyW0Rpc3BsYXkgdGhlIGRlZmF1bHQgdGl0bGUgJ05ldyArIFR5cGVOYW1lJ11cbi8vIEYgLS0+fE5vfCBIW0lzIHRoZXJlIGEgY3VzdG9tIHRpdGxlXVxuLy8gSCAtLT58WWVzfCBJW1Nob3cgdGhlIGN1c3RvbSB0aXRsZV1cbi8vIEggLS0+fE5vfCBKW1Nob3cgdGhlIGRlZmF1bHQgJ1VuYW1uZWQgT2JqZWN0J11cbi8vIEQgLS0+fE5vfCBFXG4vLyBDIC0tPnxOb3QgaW4gY3JlYXRlIG1vZGV8IEVbU2hvdyBEYXRhRmllbGQgVmFsdWVdXG4vLyBgYGBcbi8qKlxuICogQ29tcHV0ZSB0aGUgdGl0bGUgZm9yIHRoZSBvYmplY3QgcGFnZS5cbiAqXG4gKiBAcGFyYW0gb0hlYWRlckluZm8gVGhlIEBVSS5IZWFkZXJJbmZvIGFubm90YXRpb24gY29udGVudFxuICogQHBhcmFtIG9WaWV3RGF0YSBUaGUgdmlldyBkYXRhIG9iamVjdCB3ZSdyZSBjdXJyZW50bHkgb25cbiAqIEBwYXJhbSBmdWxsQ29udGV4dFBhdGggVGhlIGZ1bGwgY29udGV4dCBwYXRoIHVzZWQgdG8gcmVhY2ggdGhhdCBvYmplY3QgcGFnZVxuICogQHBhcmFtIG9EcmFmdFJvb3RcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHRoZSBvYmplY3QgcGFnZSB0aXRsZVxuICovXG5leHBvcnQgY29uc3QgZ2V0RXhwcmVzc2lvbkZvclRpdGxlID0gZnVuY3Rpb24gKFxuXHRvSGVhZGVySW5mbzogSGVhZGVySW5mb1R5cGUgfCB1bmRlZmluZWQsXG5cdG9WaWV3RGF0YTogVmlld0RhdGEsXG5cdGZ1bGxDb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aCxcblx0b0RyYWZ0Um9vdDogT2JqZWN0IHwgdW5kZWZpbmVkXG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGNvbnN0IHRpdGxlTm9IZWFkZXJJbmZvID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJUX05FV19PQkpFQ1RcIiwgb1ZpZXdEYXRhLnJlc291cmNlQnVuZGxlLCB1bmRlZmluZWQsIG9WaWV3RGF0YS5lbnRpdHlTZXQpO1xuXG5cdGNvbnN0IHRpdGxlV2l0aEhlYWRlckluZm8gPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcblx0XHRcIlRfQU5OT1RBVElPTl9IRUxQRVJfREVGQVVMVF9PQkpFQ1RfUEFHRV9IRUFERVJfVElUTEVcIixcblx0XHRvVmlld0RhdGEucmVzb3VyY2VCdW5kbGUsXG5cdFx0dW5kZWZpbmVkLFxuXHRcdG9WaWV3RGF0YS5lbnRpdHlTZXRcblx0KTtcblxuXHRjb25zdCBvRW1wdHlIZWFkZXJJbmZvVGl0bGUgPVxuXHRcdG9IZWFkZXJJbmZvPy5UaXRsZSA9PT0gdW5kZWZpbmVkIHx8IChvSGVhZGVySW5mbz8uVGl0bGUgYXMgYW55KSA9PT0gXCJcIiB8fCAob0hlYWRlckluZm8/LlRpdGxlIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWUgPT09IFwiXCI7XG5cblx0Y29uc3QgdGl0bGVGb3JBY3RpdmVIZWFkZXJOb0hlYWRlckluZm8gPSAhb0VtcHR5SGVhZGVySW5mb1RpdGxlXG5cdFx0PyBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIlRfQU5OT1RBVElPTl9IRUxQRVJfREVGQVVMVF9PQkpFQ1RfUEFHRV9IRUFERVJfVElUTEVfTk9fSEVBREVSX0lORk9cIiwgb1ZpZXdEYXRhLnJlc291cmNlQnVuZGxlKVxuXHRcdDogXCJcIjtcblx0bGV0IHRpdGxlVmFsdWVFeHByZXNzaW9uLFxuXHRcdGNvbm5lY3RlZEZpZWxkc1BhdGgsXG5cdFx0dGl0bGVJc0VtcHR5OiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4gPSBjb25zdGFudCh0cnVlKSxcblx0XHR0aXRsZUJvb2xlYW5FeHByZXNzaW9uOiBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb248Ym9vbGVhbj4gfCBib29sZWFuO1xuXHRpZiAob0hlYWRlckluZm8/LlRpdGxlPy4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRcIikge1xuXHRcdHRpdGxlVmFsdWVFeHByZXNzaW9uID0gZ2V0RXhwcmVzc2lvbkZyb21Bbm5vdGF0aW9uKChvSGVhZGVySW5mbz8uVGl0bGUgYXMgRGF0YUZpZWxkVHlwZXMpPy5WYWx1ZSk7XG5cdFx0aWYgKChvSGVhZGVySW5mbz8uVGl0bGUgYXMgRGF0YUZpZWxkVHlwZXMpPy5WYWx1ZT8uJHRhcmdldD8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVGV4dD8uYW5ub3RhdGlvbnM/LlVJPy5UZXh0QXJyYW5nZW1lbnQpIHtcblx0XHRcdC8vIEluIGNhc2UgYW4gZXhwbGljaXQgdGV4dCBhcnJhbmdlbWVudCB3YXMgc2V0IHdlIG1ha2UgdXNlIG9mIGl0IGluIHRoZSBkZXNjcmlwdGlvbiBhcyB3ZWxsXG5cdFx0XHR0aXRsZVZhbHVlRXhwcmVzc2lvbiA9IGFkZFRleHRBcnJhbmdlbWVudFRvQmluZGluZ0V4cHJlc3Npb24odGl0bGVWYWx1ZUV4cHJlc3Npb24sIGZ1bGxDb250ZXh0UGF0aCk7XG5cdFx0fVxuXHRcdHRpdGxlVmFsdWVFeHByZXNzaW9uID0gZm9ybWF0VmFsdWVSZWN1cnNpdmVseSh0aXRsZVZhbHVlRXhwcmVzc2lvbiwgZnVsbENvbnRleHRQYXRoKTtcblx0XHR0aXRsZUlzRW1wdHkgPSB0aXRsZVZhbHVlRXhwcmVzc2lvbj8uX3R5cGUgPT09IFwiQ29uc3RhbnRcIiA/IGNvbnN0YW50KCF0aXRsZVZhbHVlRXhwcmVzc2lvbj8udmFsdWUpIDogaXNFbXB0eSh0aXRsZVZhbHVlRXhwcmVzc2lvbik7XG5cdH0gZWxzZSBpZiAoXG5cdFx0b0hlYWRlckluZm8/LlRpdGxlPy4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBbm5vdGF0aW9uXCIgJiZcblx0XHRvSGVhZGVySW5mbz8uVGl0bGU/LlRhcmdldC4kdGFyZ2V0LiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNvbm5lY3RlZEZpZWxkc1R5cGVcIlxuXHQpIHtcblx0XHRjb25uZWN0ZWRGaWVsZHNQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgoZnVsbENvbnRleHRQYXRoLCBcIiRUeXBlL0BVSS5IZWFkZXJJbmZvL1RpdGxlL1RhcmdldC8kQW5ub3RhdGlvblBhdGhcIik7XG5cdFx0dGl0bGVWYWx1ZUV4cHJlc3Npb24gPSBnZXRMYWJlbEZvckNvbm5lY3RlZEZpZWxkcyhjb25uZWN0ZWRGaWVsZHNQYXRoLCBmYWxzZSkgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPHN0cmluZz47XG5cdFx0dGl0bGVCb29sZWFuRXhwcmVzc2lvbiA9IHRpdGxlVmFsdWVFeHByZXNzaW9uPy5fdHlwZSA9PT0gXCJDb25zdGFudFwiID8gY29uc3RhbnQoIXRpdGxlVmFsdWVFeHByZXNzaW9uPy52YWx1ZSkgOiBpc0VtcHR5KHRpdGxlVmFsdWVFeHByZXNzaW9uKTtcblx0XHR0aXRsZUlzRW1wdHkgPSB0aXRsZVZhbHVlRXhwcmVzc2lvbiA/IHRpdGxlQm9vbGVhbkV4cHJlc3Npb24gOiBjb25zdGFudCh0cnVlKTtcblx0fVxuXG5cdC8vIElmIHRoZXJlIGlzIGEgVHlwZU5hbWUgZGVmaW5lZCwgc2hvdyB0aGUgZGVmYXVsdCB0aXRsZSAnTmV3ICsgVHlwZU5hbWUnLCBvdGhlcndpc2Ugc2hvdyB0aGUgY3VzdG9tIHRpdGxlIG9yIHRoZSBkZWZhdWx0ICdOZXcgb2JqZWN0J1xuXHRjb25zdCBjcmVhdGVNb2RlVGl0bGUgPSBvSGVhZGVySW5mbz8uVHlwZU5hbWVcblx0XHQ/IGNvbmNhdCh0aXRsZVdpdGhIZWFkZXJJbmZvLCBcIjogXCIsIHJlc29sdmVCaW5kaW5nU3RyaW5nKG9IZWFkZXJJbmZvLlR5cGVOYW1lLnRvU3RyaW5nKCkpKVxuXHRcdDogdGl0bGVOb0hlYWRlckluZm87XG5cdGNvbnN0IGFjdGl2ZUV4cHJlc3Npb24gPSBvRHJhZnRSb290ID8gRW50aXR5LklzQWN0aXZlIDogdHJ1ZTtcblx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKFxuXHRcdGlmRWxzZShcblx0XHRcdGFuZChvcihVSS5Jc0NyZWF0ZU1vZGVTdGlja3ksIFVJLklzQ3JlYXRlTW9kZSksIHRpdGxlSXNFbXB0eSksXG5cdFx0XHRjcmVhdGVNb2RlVGl0bGUsXG5cblx0XHRcdC8vIE90aGVyd2lzZSBzaG93IHRoZSBkZWZhdWx0IGV4cHJlc3Npb25cblx0XHRcdGlmRWxzZShhbmQoYWN0aXZlRXhwcmVzc2lvbiwgdGl0bGVJc0VtcHR5KSwgdGl0bGVGb3JBY3RpdmVIZWFkZXJOb0hlYWRlckluZm8sIHRpdGxlVmFsdWVFeHByZXNzaW9uKVxuXHRcdClcblx0KTtcbn07XG5cbi8qKlxuICogUmV0cmlldmVzIHRoZSBleHByZXNzaW9uIGZvciB0aGUgZGVzY3JpcHRpb24gb2YgYW4gb2JqZWN0IHBhZ2UuXG4gKlxuICogQHBhcmFtIG9IZWFkZXJJbmZvIFRoZSBAVUkuSGVhZGVySW5mbyBhbm5vdGF0aW9uIGNvbnRlbnRcbiAqIEBwYXJhbSBmdWxsQ29udGV4dFBhdGggVGhlIGZ1bGwgY29udGV4dCBwYXRoIHVzZWQgdG8gcmVhY2ggdGhhdCBvYmplY3QgcGFnZVxuICogQHJldHVybnMgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmb3IgdGhlIG9iamVjdCBwYWdlIGRlc2NyaXB0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRFeHByZXNzaW9uRm9yRGVzY3JpcHRpb24gPSBmdW5jdGlvbiAoXG5cdG9IZWFkZXJJbmZvOiBIZWFkZXJJbmZvVHlwZSB8IHVuZGVmaW5lZCxcblx0ZnVsbENvbnRleHRQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoXG4pOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGxldCBwYXRoSW5Nb2RlbCA9IGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbigob0hlYWRlckluZm8/LkRlc2NyaXB0aW9uIGFzIERhdGFGaWVsZFR5cGVzKT8uVmFsdWUpO1xuXHRpZiAoKG9IZWFkZXJJbmZvPy5EZXNjcmlwdGlvbiBhcyBEYXRhRmllbGRUeXBlcyk/LlZhbHVlPy4kdGFyZ2V0Py5hbm5vdGF0aW9ucz8uQ29tbW9uPy5UZXh0Py5hbm5vdGF0aW9ucz8uVUk/LlRleHRBcnJhbmdlbWVudCkge1xuXHRcdC8vIEluIGNhc2UgYW4gZXhwbGljaXQgdGV4dCBhcnJhbmdlbWVudCB3YXMgc2V0IHdlIG1ha2UgdXNlIG9mIGl0IGluIHRoZSBkZXNjcmlwdGlvbiBhcyB3ZWxsXG5cdFx0cGF0aEluTW9kZWwgPSBhZGRUZXh0QXJyYW5nZW1lbnRUb0JpbmRpbmdFeHByZXNzaW9uKHBhdGhJbk1vZGVsLCBmdWxsQ29udGV4dFBhdGgpO1xuXHR9XG5cblx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGZvcm1hdFZhbHVlUmVjdXJzaXZlbHkocGF0aEluTW9kZWwsIGZ1bGxDb250ZXh0UGF0aCkpO1xufTtcblxuLyoqXG4gKiBSZXR1cm4gdGhlIGV4cHJlc3Npb24gZm9yIHRoZSBzYXZlIGJ1dHRvbi5cbiAqXG4gKiBAcGFyYW0gb1ZpZXdEYXRhIFRoZSBjdXJyZW50IHZpZXcgZGF0YVxuICogQHBhcmFtIGZ1bGxDb250ZXh0UGF0aCBUaGUgcGF0aCB1c2VkIHVwIHVudGlsIGhlcmVcbiAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gdGhhdCBzaG93cyB0aGUgcmlnaHQgc2F2ZSBidXR0b24gdGV4dFxuICovXG5leHBvcnQgY29uc3QgZ2V0RXhwcmVzc2lvbkZvclNhdmVCdXR0b24gPSBmdW5jdGlvbiAoXG5cdG9WaWV3RGF0YTogVmlld0RhdGEsXG5cdGZ1bGxDb250ZXh0UGF0aDogRGF0YU1vZGVsT2JqZWN0UGF0aFxuKTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24ge1xuXHRjb25zdCBzYXZlQnV0dG9uVGV4dCA9IENvbW1vblV0aWxzLmdldFRyYW5zbGF0ZWRUZXh0KFwiVF9PUF9PQkpFQ1RfUEFHRV9TQVZFXCIsIG9WaWV3RGF0YS5yZXNvdXJjZUJ1bmRsZSk7XG5cdGNvbnN0IGNyZWF0ZUJ1dHRvblRleHQgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIlRfT1BfT0JKRUNUX1BBR0VfQ1JFQVRFXCIsIG9WaWV3RGF0YS5yZXNvdXJjZUJ1bmRsZSk7XG5cdGxldCBzYXZlRXhwcmVzc2lvbjtcblxuXHRpZiAoKGZ1bGxDb250ZXh0UGF0aC5zdGFydGluZ0VudGl0eVNldCBhcyBFbnRpdHlTZXQpLmFubm90YXRpb25zLlNlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQpIHtcblx0XHQvLyBJZiB3ZSdyZSBpbiBzdGlja3kgbW9kZSBBTkQgdGhlIHVpIGlzIGluIGNyZWF0ZSBtb2RlLCBzaG93IENyZWF0ZSwgZWxzZSBzaG93IFNhdmVcblx0XHRzYXZlRXhwcmVzc2lvbiA9IGlmRWxzZShVSS5Jc0NyZWF0ZU1vZGVTdGlja3ksIGNyZWF0ZUJ1dHRvblRleHQsIHNhdmVCdXR0b25UZXh0KTtcblx0fSBlbHNlIHtcblx0XHQvLyBJZiB3ZSdyZSBpbiBkcmFmdCBBTkQgdGhlIGRyYWZ0IGlzIGEgbmV3IG9iamVjdCAoIUlzQWN0aXZlRW50aXR5ICYmICFIYXNBY3RpdmVFbnRpdHkpLCBzaG93IGNyZWF0ZSwgZWxzZSBzaG93IHNhdmVcblx0XHRzYXZlRXhwcmVzc2lvbiA9IGlmRWxzZShEcmFmdC5Jc05ld09iamVjdCwgY3JlYXRlQnV0dG9uVGV4dCwgc2F2ZUJ1dHRvblRleHQpO1xuXHR9XG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihzYXZlRXhwcmVzc2lvbik7XG59O1xuXG4vKipcbiAqIE1ldGhvZCByZXR1cm5zIHdoZXRoZXIgZm9vdGVyIGlzIHZpc2libGUgb3Igbm90IG9uIG9iamVjdCAvIHN1Ym9iamVjdCBwYWdlLlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgZ2V0Rm9vdGVyVmlzaWJsZVxuICogQHBhcmFtIGZvb3RlckFjdGlvbnMgVGhlIGZvb3RlciBhY3Rpb24gb2JqZWN0IGNvbWluZyBmcm9tIHRoZSBjb252ZXJ0ZXJcbiAqIEBwYXJhbSBkYXRhRmllbGRzIERhdGEgZmllbGQgYXJyYXkgZm9yIG5vcm1hbCBmb290ZXIgdmlzaWJpbGl0eSBwcm9jZXNzaW5nXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYW55IGFjdGlvbiBpcyB0cnVlLCBvdGhlcndpc2UgY29tcGlsZWQgQmluZGluZyBvciBgZmFsc2VgXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRGb290ZXJWaXNpYmxlID0gZnVuY3Rpb24gKFxuXHRmb290ZXJBY3Rpb25zOiBDb252ZXJ0ZXJBY3Rpb25bXSxcblx0ZGF0YUZpZWxkczogRGF0YUZpZWxkW11cbik6IGJvb2xlYW4gfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB7XG5cdGNvbnN0IG1hbmlmZXN0QWN0aW9ucyA9IGZvb3RlckFjdGlvbnMuZmlsdGVyKChhY3Rpb24pID0+IGlzTWFuaWZlc3RBY3Rpb24oYWN0aW9uKSkgYXMgTWFuaWZlc3RBY3Rpb25bXTtcblx0bGV0IGN1c3RvbUFjdGlvblZpc2liaWxpdHk6IEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjxib29sZWFuPjtcblx0aWYgKG1hbmlmZXN0QWN0aW9ucy5sZW5ndGgpIHtcblx0XHQvLyBJZiB3ZSBoYXZlIG1hbmlmZXN0IGFjdGlvbnNcblx0XHRjb25zdCBjdXN0b21BY3Rpb25JbmRpdmlkdWFsVmlzaWJpbGl0eSA9IG1hbmlmZXN0QWN0aW9ucy5tYXAoKGFjdGlvbikgPT4ge1xuXHRcdFx0cmV0dXJuIHJlc29sdmVCaW5kaW5nU3RyaW5nPGJvb2xlYW4+KGFjdGlvbi52aXNpYmxlIGFzIHN0cmluZyB8IGJvb2xlYW4sIFwiYm9vbGVhblwiKTtcblx0XHR9KTtcblx0XHQvLyBjb25zdHJ1Y3QgdGhlIGZvb3RlcidzIHZpc2liaWxpdHktYmluZGluZyBvdXQgb2YgYWxsIGFjdGlvbnMnIHZpc2liaWxpdHktYmluZGluZ3MsIGZpcnN0IHRoZSBiaW5kaW5nIG9mIGFsbCBjdXN0b20gYWN0aW9ucyAuLi5cblx0XHRjdXN0b21BY3Rpb25WaXNpYmlsaXR5ID0gb3IoLi4uY3VzdG9tQWN0aW9uSW5kaXZpZHVhbFZpc2liaWxpdHkpO1xuXHRcdC8vIGFuZCB0aGVuIHRoZSBiaW5kaW5nIG9mIGFsbCBhbm5vdGF0aW9uIGFjdGlvbnMgaW5zaWRlIHRoZSBmb290ZXIgLi4uXG5cdFx0Y29uc3QgYW5ub3RhdGlvbkFjdGlvblZpc2liaWxpdHkgPSBnZXREYXRhRmllbGRCYXNlZEZvb3RlclZpc2liaWxpdHkoZGF0YUZpZWxkcywgdHJ1ZSk7XG5cdFx0Ly8gZmluYWxseSwgcmV0dXJuIGV2ZXJ5dGhpbmcuXG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKG9yKGN1c3RvbUFjdGlvblZpc2liaWxpdHksIHJlc29sdmVCaW5kaW5nU3RyaW5nPGJvb2xlYW4+KGFubm90YXRpb25BY3Rpb25WaXNpYmlsaXR5LCBcImJvb2xlYW5cIikpKTtcblx0fVxuXHRyZXR1cm4gZ2V0RGF0YUZpZWxkQmFzZWRGb290ZXJWaXNpYmlsaXR5KGRhdGFGaWVsZHMsIHRydWUpO1xufTtcblxuLyoqXG4gKiBDaGVja3MgaWYgdGhlIGZvb3RlciBpcyB2aXNpYmxlIG9yIG5vdC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBzdGF0aWNcbiAqIEBuYW1lIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5PYmplY3RQYWdlVGVtcGxhdGluZy5nZXREYXRhRmllbGRCYXNlZEZvb3RlclZpc2liaWxpdHlcbiAqIEBtZW1iZXJvZiBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuT2JqZWN0UGFnZVRlbXBsYXRpbmdcbiAqIEBwYXJhbSBhRGF0YUZpZWxkcyBBcnJheSBvZiBEYXRhRmllbGRzIGluIHRoZSBpZGVudGlmaWNhdGlvblxuICogQHBhcmFtIGJDb25zaWRlckVkaXRhYmxlIFdoZXRoZXIgdGhlIGVkaXQgbW9kZSBiaW5kaW5nIGlzIHJlcXVpcmVkIG9yIG5vdFxuICogQHJldHVybnMgQW4gZXhwcmVzc2lvbiBpZiBhbGwgdGhlIGFjdGlvbnMgYXJlIHVpLmhpZGRlbiwgdHJ1ZSBvdGhlcndpc2VcbiAqIEBwcml2YXRlXG4gKiBAdWk1LXJlc3RyaWN0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldERhdGFGaWVsZEJhc2VkRm9vdGVyVmlzaWJpbGl0eSA9IGZ1bmN0aW9uIChhRGF0YUZpZWxkczogYW55W10sIGJDb25zaWRlckVkaXRhYmxlOiBib29sZWFuKSB7XG5cdGxldCBzSGlkZGVuRXhwcmVzc2lvbiA9IFwiXCI7XG5cdGxldCBzU2VtaUhpZGRlbkV4cHJlc3Npb247XG5cdGNvbnN0IGFIaWRkZW5BY3Rpb25QYXRoID0gW107XG5cblx0Zm9yIChjb25zdCBpIGluIGFEYXRhRmllbGRzKSB7XG5cdFx0Y29uc3Qgb0RhdGFGaWVsZCA9IGFEYXRhRmllbGRzW2ldO1xuXHRcdGlmIChvRGF0YUZpZWxkLiRUeXBlID09PSBVSUFubm90YXRpb25UeXBlcy5EYXRhRmllbGRGb3JBY3Rpb24gJiYgb0RhdGFGaWVsZC5EZXRlcm1pbmluZyA9PT0gdHJ1ZSkge1xuXHRcdFx0Y29uc3QgaGlkZGVuRXhwcmVzc2lvbiA9IG9EYXRhRmllbGRbYEAke1VJQW5ub3RhdGlvblRlcm1zLkhpZGRlbn1gXTtcblx0XHRcdGlmICghaGlkZGVuRXhwcmVzc2lvbikge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH0gZWxzZSBpZiAoaGlkZGVuRXhwcmVzc2lvbi4kUGF0aCkge1xuXHRcdFx0XHRpZiAoYUhpZGRlbkFjdGlvblBhdGguaW5kZXhPZihoaWRkZW5FeHByZXNzaW9uLiRQYXRoKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRhSGlkZGVuQWN0aW9uUGF0aC5wdXNoKGhpZGRlbkV4cHJlc3Npb24uJFBhdGgpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0aWYgKGFIaWRkZW5BY3Rpb25QYXRoLmxlbmd0aCkge1xuXHRcdGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBhSGlkZGVuQWN0aW9uUGF0aC5sZW5ndGg7IGluZGV4KyspIHtcblx0XHRcdGlmIChhSGlkZGVuQWN0aW9uUGF0aFtpbmRleF0pIHtcblx0XHRcdFx0c1NlbWlIaWRkZW5FeHByZXNzaW9uID0gXCIoJXtcIiArIGFIaWRkZW5BY3Rpb25QYXRoW2luZGV4XSArIFwifSA9PT0gdHJ1ZSA/IGZhbHNlIDogdHJ1ZSApXCI7XG5cdFx0XHR9XG5cdFx0XHRpZiAoaW5kZXggPT0gYUhpZGRlbkFjdGlvblBhdGgubGVuZ3RoIC0gMSkge1xuXHRcdFx0XHRzSGlkZGVuRXhwcmVzc2lvbiA9IHNIaWRkZW5FeHByZXNzaW9uICsgc1NlbWlIaWRkZW5FeHByZXNzaW9uO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c0hpZGRlbkV4cHJlc3Npb24gPSBzSGlkZGVuRXhwcmVzc2lvbiArIHNTZW1pSGlkZGVuRXhwcmVzc2lvbiArIFwifHxcIjtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIChcblx0XHRcdFwiez0gXCIgK1xuXHRcdFx0KGJDb25zaWRlckVkaXRhYmxlID8gXCIoXCIgOiBcIlwiKSArXG5cdFx0XHRzSGlkZGVuRXhwcmVzc2lvbiArXG5cdFx0XHQoYkNvbnNpZGVyRWRpdGFibGUgPyBcIiB8fCAke3VpPi9pc0VkaXRhYmxlfSkgXCIgOiBcIiBcIikgK1xuXHRcdFx0XCImJiAke2ludGVybmFsPmlzQ3JlYXRlRGlhbG9nT3Blbn0gIT09IHRydWV9XCJcblx0XHQpO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBcIns9IFwiICsgKGJDb25zaWRlckVkaXRhYmxlID8gXCIke3VpPi9pc0VkaXRhYmxlfSAmJiBcIiA6IFwiXCIpICsgXCIke2ludGVybmFsPmlzQ3JlYXRlRGlhbG9nT3Blbn0gIT09IHRydWV9XCI7XG5cdH1cbn07XG5cbi8qKlxuICogTWV0aG9kIHJldHVybnMgV2hldGhlciB0aGUgYWN0aW9uIHR5cGUgaXMgbWFuaWZlc3Qgb3Igbm90LlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgaXNNYW5pZmVzdEFjdGlvblZpc2libGVcbiAqIEBwYXJhbSBvQWN0aW9uIFRoZSBhY3Rpb24gb2JqZWN0XG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYWN0aW9uIGlzIGNvbWluZyBmcm9tIG1hbmlmZXN0LCBgZmFsc2VgIG90aGVyd2lzZVxuICovXG5leHBvcnQgY29uc3QgaXNNYW5pZmVzdEFjdGlvbiA9IGZ1bmN0aW9uIChvQWN0aW9uOiBhbnkpIHtcblx0Y29uc3QgYUFjdGlvbnMgPSBbXG5cdFx0XCJQcmltYXJ5XCIsXG5cdFx0XCJEZWZhdWx0QXBwbHlcIixcblx0XHRcIlNlY29uZGFyeVwiLFxuXHRcdFwiRm9yQWN0aW9uXCIsXG5cdFx0XCJGb3JOYXZpZ2F0aW9uXCIsXG5cdFx0XCJTd2l0Y2hUb0FjdGl2ZU9iamVjdFwiLFxuXHRcdFwiU3dpdGNoVG9EcmFmdE9iamVjdFwiLFxuXHRcdFwiRHJhZnRBY3Rpb25zXCJcblx0XTtcblx0cmV0dXJuIGFBY3Rpb25zLmluZGV4T2Yob0FjdGlvbi50eXBlKSA8IDA7XG59O1xuXG4vKipcbiAqIFJldHVybnMgYW4gZXhwcmVzc2lvbiB0byBkZXRlcm1pbmUgRW1waGFzaXplZCAgYnV0dG9uIHR5cGUgYmFzZWQgb24gQ3JpdGljYWxpdHkgYWNyb3NzIGFsbCBhY3Rpb25zXG4gKiBJZiBjcml0aWNhbCBhY3Rpb24gaXMgcmVuZGVyZWQsIGl0cyBjb25zaWRlcmVkIHRvIGJlIHRoZSBwcmltYXJ5IGFjdGlvbi4gSGVuY2UgdGVtcGxhdGUncyBkZWZhdWx0IHByaW1hcnkgYWN0aW9uIGlzIHNldCBiYWNrIHRvIERlZmF1bHQuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAc3RhdGljXG4gKiBAbmFtZSBzYXAuZmUudGVtcGxhdGVzLk9iamVjdFBhZ2UuT2JqZWN0UGFnZVRlbXBsYXRpbmcuYnVpbGRFbXBoYXNpemVkQnV0dG9uRXhwcmVzc2lvblxuICogQG1lbWJlcm9mIHNhcC5mZS50ZW1wbGF0ZXMuT2JqZWN0UGFnZS5PYmplY3RQYWdlVGVtcGxhdGluZ1xuICogQHBhcmFtIGFJZGVudGlmaWNhdGlvbiBBcnJheSBvZiBhbGwgdGhlIERhdGFGaWVsZHMgaW4gSWRlbnRpZmljYXRpb25cbiAqIEByZXR1cm5zIEFuIGV4cHJlc3Npb24gdG8gZGVkdWNlIGlmIGJ1dHRvbiB0eXBlIGlzIERlZmF1bHQgb3IgRW1waGFzaXplZFxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICovXG5leHBvcnQgY29uc3QgYnVpbGRFbXBoYXNpemVkQnV0dG9uRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChhSWRlbnRpZmljYXRpb24/OiBhbnlbXSkge1xuXHRpZiAoIWFJZGVudGlmaWNhdGlvbikge1xuXHRcdHJldHVybiBCdXR0b25UeXBlLkVtcGhhc2l6ZWQ7XG5cdH1cblx0bGV0IHNGb3JtYXRFbXBoYXNpemVkRXhwcmVzc2lvbjogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXHRsZXQgYklzQWx3YXlzRGVmYXVsdDogYm9vbGVhbixcblx0XHRzSGlkZGVuU2ltcGxlUGF0aCxcblx0XHRzSGlkZGVuRXhwcmVzc2lvbiA9IFwiXCI7XG5cdGFJZGVudGlmaWNhdGlvbi5mb3JFYWNoKGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBhbnkpIHtcblx0XHRjb25zdCBvQ3JpdGljYWxpdHlQcm9wZXJ0eSA9IG9EYXRhRmllbGQuQ3JpdGljYWxpdHk7XG5cdFx0Y29uc3Qgb0RhdGFGaWVsZEhpZGRlbiA9IG9EYXRhRmllbGRbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdO1xuXHRcdGlmIChvRGF0YUZpZWxkLiRUeXBlID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEZvckFjdGlvblwiICYmICFiSXNBbHdheXNEZWZhdWx0ICYmIG9Dcml0aWNhbGl0eVByb3BlcnR5KSB7XG5cdFx0XHRpZiAoIXNGb3JtYXRFbXBoYXNpemVkRXhwcmVzc2lvbiAmJiBvRGF0YUZpZWxkSGlkZGVuID09PSB0cnVlKSB7XG5cdFx0XHRcdC8vIGlmIERhdGFGaWVsZCBpcyBzZXQgdG8gaGlkZGVuLCB3ZSBjYW4gc2tpcCBvdGhlciBjaGVja3MgYW5kIHJldHVybiBEZWZhdWx0IGJ1dHRvbiB0eXBlXG5cdFx0XHRcdHNGb3JtYXRFbXBoYXNpemVkRXhwcmVzc2lvbiA9IEJ1dHRvblR5cGUuRW1waGFzaXplZDtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0aWYgKG9EYXRhRmllbGRIaWRkZW4gJiYgb0RhdGFGaWVsZEhpZGRlbi4kUGF0aCkge1xuXHRcdFx0XHQvLyB3aGVuIHZpc2liaWxpdHkgb2YgY3JpdGljYWwgYnV0dG9uIGlzIGJhc2VkIG9uIHBhdGgsIGNvbGxlY3QgYWxsIHBhdGhzIGZvciBleHByZXNzaW9uXG5cdFx0XHRcdHNIaWRkZW5TaW1wbGVQYXRoID0gb0RhdGFGaWVsZEhpZGRlbi4kUGF0aDtcblx0XHRcdFx0aWYgKHNIaWRkZW5FeHByZXNzaW9uKSB7XG5cdFx0XHRcdFx0c0hpZGRlbkV4cHJlc3Npb24gPSBzSGlkZGVuRXhwcmVzc2lvbiArIFwiICYmIFwiO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHNIaWRkZW5FeHByZXNzaW9uID0gc0hpZGRlbkV4cHJlc3Npb24gKyBcIiV7XCIgKyBzSGlkZGVuU2ltcGxlUGF0aCArIFwifSA9PT0gdHJ1ZVwiO1xuXHRcdFx0XHRzRm9ybWF0RW1waGFzaXplZEV4cHJlc3Npb24gPSBcIns9IChcIiArIHNIaWRkZW5FeHByZXNzaW9uICsgXCIpID8gJ0VtcGhhc2l6ZWQnIDogJ0RlZmF1bHQnIH1cIjtcblx0XHRcdH1cblx0XHRcdHN3aXRjaCAob0NyaXRpY2FsaXR5UHJvcGVydHkuJEVudW1NZW1iZXIpIHtcblx0XHRcdFx0Ly8gc3VwcG9ydGVkIGNyaXRpY2FsaXR5IGFyZSBbUG9zaXRpdmUvMy8nMyddIGFuZCBbTmVnYXRpdmUvMS8nMSddXG5cdFx0XHRcdGNhc2UgXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvTmVnYXRpdmVcIjpcblx0XHRcdFx0Y2FzZSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5VHlwZS9Qb3NpdGl2ZVwiOlxuXHRcdFx0XHRjYXNlIFwiMVwiOlxuXHRcdFx0XHRjYXNlIDE6XG5cdFx0XHRcdGNhc2UgXCIzXCI6XG5cdFx0XHRcdGNhc2UgMzpcblx0XHRcdFx0XHRpZiAoIW9EYXRhRmllbGRIaWRkZW4pIHtcblx0XHRcdFx0XHRcdHNGb3JtYXRFbXBoYXNpemVkRXhwcmVzc2lvbiA9IEJ1dHRvblR5cGUuRGVmYXVsdDtcblx0XHRcdFx0XHRcdGJJc0Fsd2F5c0RlZmF1bHQgPSB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRzRm9ybWF0RW1waGFzaXplZEV4cHJlc3Npb24gPSBzRm9ybWF0RW1waGFzaXplZEV4cHJlc3Npb24gfHwgQnV0dG9uVHlwZS5EZWZhdWx0O1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdHNGb3JtYXRFbXBoYXNpemVkRXhwcmVzc2lvbiA9IEJ1dHRvblR5cGUuRW1waGFzaXplZDtcblx0XHRcdH1cblx0XHRcdGlmIChvQ3JpdGljYWxpdHlQcm9wZXJ0eS4kUGF0aCkge1xuXHRcdFx0XHQvLyB3aGVuIENyaXRpY2FsaXR5IGlzIHNldCB1c2luZyBhIHBhdGgsIHVzZSB0aGUgcGF0aCBmb3IgZGVkdWNpbmcgdGhlIEVtcGhzaXplZCB0eXBlIGZvciBkZWZhdWx0IFByaW1hcnkgQWN0aW9uXG5cdFx0XHRcdGNvbnN0IHNDb21iaW5lZEhpZGRlbkV4cHJlc3Npb24gPSBzSGlkZGVuRXhwcmVzc2lvbiA/IFwiIShcIiArIHNIaWRkZW5FeHByZXNzaW9uICsgXCIpICYmIFwiIDogXCJcIjtcblx0XHRcdFx0c0Zvcm1hdEVtcGhhc2l6ZWRFeHByZXNzaW9uID1cblx0XHRcdFx0XHRcIns9IFwiICtcblx0XHRcdFx0XHRzQ29tYmluZWRIaWRkZW5FeHByZXNzaW9uICtcblx0XHRcdFx0XHRcIigoJHtcIiArXG5cdFx0XHRcdFx0b0NyaXRpY2FsaXR5UHJvcGVydHkuJFBhdGggK1xuXHRcdFx0XHRcdFwifSA9PT0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5VHlwZS9OZWdhdGl2ZScpIHx8ICgke1wiICtcblx0XHRcdFx0XHRvQ3JpdGljYWxpdHlQcm9wZXJ0eS4kUGF0aCArXG5cdFx0XHRcdFx0XCJ9ID09PSAnMScpIHx8ICgke1wiICtcblx0XHRcdFx0XHRvQ3JpdGljYWxpdHlQcm9wZXJ0eS4kUGF0aCArXG5cdFx0XHRcdFx0XCJ9ID09PSAxKSBcIiArXG5cdFx0XHRcdFx0XCJ8fCAoJHtcIiArXG5cdFx0XHRcdFx0b0NyaXRpY2FsaXR5UHJvcGVydHkuJFBhdGggK1xuXHRcdFx0XHRcdFwifSA9PT0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5VHlwZS9Qb3NpdGl2ZScpIHx8ICgke1wiICtcblx0XHRcdFx0XHRvQ3JpdGljYWxpdHlQcm9wZXJ0eS4kUGF0aCArXG5cdFx0XHRcdFx0XCJ9ID09PSAnMycpIHx8ICgke1wiICtcblx0XHRcdFx0XHRvQ3JpdGljYWxpdHlQcm9wZXJ0eS4kUGF0aCArXG5cdFx0XHRcdFx0XCJ9ID09PSAzKSkgPyBcIiArXG5cdFx0XHRcdFx0XCInRGVmYXVsdCdcIiArXG5cdFx0XHRcdFx0XCIgOiBcIiArXG5cdFx0XHRcdFx0XCInRW1waGFzaXplZCdcIiArXG5cdFx0XHRcdFx0XCIgfVwiO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cdHJldHVybiBzRm9ybWF0RW1waGFzaXplZEV4cHJlc3Npb24gfHwgQnV0dG9uVHlwZS5FbXBoYXNpemVkO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldEVsZW1lbnRCaW5kaW5nID0gZnVuY3Rpb24gKHNQYXRoOiBhbnkpIHtcblx0Y29uc3Qgc05hdmlnYXRpb25QYXRoID0gT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIuZ2V0TmF2aWdhdGlvblBhdGgoc1BhdGgpO1xuXHRpZiAoc05hdmlnYXRpb25QYXRoKSB7XG5cdFx0cmV0dXJuIFwie3BhdGg6J1wiICsgc05hdmlnYXRpb25QYXRoICsgXCInfVwiO1xuXHR9IGVsc2Uge1xuXHRcdC8vbm8gbmF2aWdhdGlvbiBwcm9wZXJ0eSBuZWVkcyBlbXB0eSBvYmplY3Rcblx0XHRyZXR1cm4gXCJ7cGF0aDogJyd9XCI7XG5cdH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gY2hlY2sgaWYgZHJhZnQgcGF0dGVybiBpcyBzdXBwb3J0ZWQuXG4gKlxuICogQHBhcmFtIG9Bbm5vdGF0aW9ucyBBbm5vdGF0aW9ucyBvZiB0aGUgY3VycmVudCBlbnRpdHkgc2V0LlxuICogQHJldHVybnMgUmV0dXJucyB0aGUgQm9vbGVhbiB2YWx1ZSBiYXNlZCBvbiBkcmFmdCBzdGF0ZVxuICovXG5leHBvcnQgY29uc3QgY2hlY2tEcmFmdFN0YXRlID0gZnVuY3Rpb24gKG9Bbm5vdGF0aW9uczogYW55KSB7XG5cdGlmIChcblx0XHRvQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdFwiXSAmJlxuXHRcdG9Bbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290XCJdW1wiRWRpdEFjdGlvblwiXVxuXHQpIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSB2aXNpYmlsaXR5IGZvciB0aGUgU3dpdGNoVG9BY3RpdmUgYnV0dG9uIGluIHRoZSBvYmplY3QgcGFnZSBvciBzdWJvYmplY3QgcGFnZS5cbiAqXG4gKiBAcGFyYW0gb0Fubm90YXRpb25zIEFubm90YXRpb25zIG9mIHRoZSBjdXJyZW50IGVudGl0eSBzZXQuXG4gKiBAcmV0dXJucyBSZXR1cm5zIGV4cHJlc3Npb24gYmluZGluZyBvciBCb29sZWFuIHZhbHVlIGJhc2VkIG9uIHRoZSBkcmFmdCBzdGF0ZVxuICovXG5leHBvcnQgY29uc3QgZ2V0U3dpdGNoVG9BY3RpdmVWaXNpYmlsaXR5ID0gZnVuY3Rpb24gKG9Bbm5vdGF0aW9uczogYW55KTogYW55IHtcblx0aWYgKGNoZWNrRHJhZnRTdGF0ZShvQW5ub3RhdGlvbnMpKSB7XG5cdFx0cmV0dXJuIFwiez0gKCV7RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvRHJhZnRJc0NyZWF0ZWRCeU1lfSkgPyAoICR7dWk+L2lzRWRpdGFibGV9ICYmICEke3VpPmNyZWF0ZU1vZGV9ICYmICV7RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvRHJhZnRJc0NyZWF0ZWRCeU1lfSApIDogZmFsc2UgfVwiO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBnZXQgdGhlIHZpc2liaWxpdHkgZm9yIHRoZSBTd2l0Y2hUb0RyYWZ0IGJ1dHRvbiBpbiB0aGUgb2JqZWN0IHBhZ2Ugb3Igc3Vib2JqZWN0IHBhZ2UuXG4gKlxuICogQHBhcmFtIG9Bbm5vdGF0aW9ucyBBbm5vdGF0aW9ucyBvZiB0aGUgY3VycmVudCBlbnRpdHkgc2V0LlxuICogQHJldHVybnMgUmV0dXJucyBleHByZXNzaW9uIGJpbmRpbmcgb3IgQm9vbGVhbiB2YWx1ZSBiYXNlZCBvbiB0aGUgZHJhZnQgc3RhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFN3aXRjaFRvRHJhZnRWaXNpYmlsaXR5ID0gZnVuY3Rpb24gKG9Bbm5vdGF0aW9uczogYW55KTogYW55IHtcblx0aWYgKGNoZWNrRHJhZnRTdGF0ZShvQW5ub3RhdGlvbnMpKSB7XG5cdFx0cmV0dXJuIFwiez0gKCV7RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvRHJhZnRJc0NyZWF0ZWRCeU1lfSkgPyAoICEoJHt1aT4vaXNFZGl0YWJsZX0pICYmICEke3VpPmNyZWF0ZU1vZGV9ICYmICR7SGFzRHJhZnRFbnRpdHl9ICYmICV7RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvRHJhZnRJc0NyZWF0ZWRCeU1lfSApIDogZmFsc2UgfVwiO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuLyoqXG4gKiBGdW5jdGlvbiB0byBnZXQgdGhlIHZpc2liaWxpdHkgZm9yIHRoZSBTd2l0Y2hEcmFmdEFuZEFjdGl2ZSBidXR0b24gaW4gdGhlIG9iamVjdCBwYWdlIG9yIHN1Ym9iamVjdCBwYWdlLlxuICpcbiAqIEBwYXJhbSBvQW5ub3RhdGlvbnMgQW5ub3RhdGlvbnMgb2YgdGhlIGN1cnJlbnQgZW50aXR5IHNldC5cbiAqIEByZXR1cm5zIFJldHVybnMgZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW4gdmFsdWUgYmFzZWQgb24gdGhlIGRyYWZ0IHN0YXRlXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRTd2l0Y2hEcmFmdEFuZEFjdGl2ZVZpc2liaWxpdHkgPSBmdW5jdGlvbiAob0Fubm90YXRpb25zOiBhbnkpOiBhbnkge1xuXHRpZiAoY2hlY2tEcmFmdFN0YXRlKG9Bbm5vdGF0aW9ucykpIHtcblx0XHRyZXR1cm4gXCJ7PSAoJXtEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9EcmFmdElzQ3JlYXRlZEJ5TWV9KSA/ICggISR7dWk+Y3JlYXRlTW9kZX0gJiYgJXtEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9EcmFmdElzQ3JlYXRlZEJ5TWV9ICkgOiBmYWxzZSB9XCI7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG59O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRvIGZpbmQgYW4gYWN0aW9uIGZyb20gdGhlIGFycmF5IG9mIGhlYWRlciBhY3Rpb25zIGluIHRoZSBjb252ZXJ0ZXIgY29udGV4dC5cbiAqXG4gKiBAcGFyYW0gYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zIEFycmF5IG9mICdoZWFkZXInIGFjdGlvbnMgb24gdGhlIG9iamVjdCBwYWdlLlxuICogQHBhcmFtIHNBY3Rpb25UeXBlIFRoZSBhY3Rpb24gdHlwZVxuICogQHJldHVybnMgVGhlIGFjdGlvbiB3aXRoIHRoZSBtYXRjaGluZyBhY3Rpb24gdHlwZVxuICogQHByaXZhdGVcbiAqL1xuZXhwb3J0IGNvbnN0IF9maW5kQWN0aW9uID0gZnVuY3Rpb24gKGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9uczogYW55W10sIHNBY3Rpb25UeXBlOiBzdHJpbmcpIHtcblx0bGV0IG9BY3Rpb247XG5cdGlmIChhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMgJiYgYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zLmxlbmd0aCkge1xuXHRcdG9BY3Rpb24gPSBhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMuZmluZChmdW5jdGlvbiAob0hlYWRlckFjdGlvbjogYW55KSB7XG5cdFx0XHRyZXR1cm4gb0hlYWRlckFjdGlvbi50eXBlID09PSBzQWN0aW9uVHlwZTtcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4gb0FjdGlvbjtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZm9ybWF0IHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgZm9yIHRoZSBEZWxldGUgYnV0dG9uIG9uIHRoZSBvYmplY3QgcGFnZSBvciBzdWJvYmplY3QgcGFnZSBpbiBjYXNlIG9mIGEgQ29tbWFuZCBFeGVjdXRpb24uXG4gKlxuICogQHBhcmFtIGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucyBBcnJheSBvZiBoZWFkZXIgYWN0aW9ucyBvbiB0aGUgb2JqZWN0IHBhZ2VcbiAqIEByZXR1cm5zIFJldHVybnMgZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW4gdmFsdWUgZnJvbSB0aGUgY29udmVydGVyIG91dHB1dFxuICovXG5leHBvcnQgY29uc3QgZ2V0RGVsZXRlQ29tbWFuZEV4ZWN1dGlvbkVuYWJsZWQgPSBmdW5jdGlvbiAoYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zOiBhbnlbXSkge1xuXHRjb25zdCBvRGVsZXRlQWN0aW9uID0gX2ZpbmRBY3Rpb24oYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zLCBcIlNlY29uZGFyeVwiKTtcblx0cmV0dXJuIG9EZWxldGVBY3Rpb24gPyBvRGVsZXRlQWN0aW9uLmVuYWJsZWQgOiBcInRydWVcIjtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZm9ybWF0IHRoZSAndmlzaWJsZScgcHJvcGVydHkgZm9yIHRoZSBEZWxldGUgYnV0dG9uIG9uIHRoZSBvYmplY3QgcGFnZSBvciBzdWJvYmplY3QgcGFnZSBpbiBjYXNlIG9mIGEgQ29tbWFuZCBFeGVjdXRpb24uXG4gKlxuICogQHBhcmFtIGFDb252ZXJ0ZXJDb250ZXh0SGVhZGVyQWN0aW9ucyBBcnJheSBvZiBoZWFkZXIgYWN0aW9ucyBvbiB0aGUgb2JqZWN0IHBhZ2VcbiAqIEByZXR1cm5zIFJldHVybnMgZXhwcmVzc2lvbiBiaW5kaW5nIG9yIEJvb2xlYW4gdmFsdWUgZnJvbSB0aGUgY29udmVydGVyIG91dHB1dFxuICovXG5leHBvcnQgY29uc3QgZ2V0RGVsZXRlQ29tbWFuZEV4ZWN1dGlvblZpc2libGUgPSBmdW5jdGlvbiAoYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zOiBhbnlbXSkge1xuXHRjb25zdCBvRGVsZXRlQWN0aW9uID0gX2ZpbmRBY3Rpb24oYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zLCBcIlNlY29uZGFyeVwiKTtcblx0cmV0dXJuIG9EZWxldGVBY3Rpb24gPyBvRGVsZXRlQWN0aW9uLnZpc2libGUgOiBcInRydWVcIjtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZm9ybWF0IHRoZSAndmlzaWJsZScgcHJvcGVydHkgZm9yIHRoZSBFZGl0IGJ1dHRvbiBvbiB0aGUgb2JqZWN0IHBhZ2Ugb3Igc3Vib2JqZWN0IHBhZ2UgaW4gY2FzZSBvZiBhIENvbW1hbmQgRXhlY3V0aW9uLlxuICpcbiAqIEBwYXJhbSBhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMgQXJyYXkgb2YgaGVhZGVyIGFjdGlvbnMgb24gdGhlIG9iamVjdCBwYWdlXG4gKiBAcmV0dXJucyBSZXR1cm5zIGV4cHJlc3Npb24gYmluZGluZyBvciBCb29sZWFuIHZhbHVlIGZyb20gdGhlIGNvbnZlcnRlciBvdXRwdXRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEVkaXRDb21tYW5kRXhlY3V0aW9uVmlzaWJsZSA9IGZ1bmN0aW9uIChhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnM6IGFueVtdKSB7XG5cdGNvbnN0IG9FZGl0QWN0aW9uID0gX2ZpbmRBY3Rpb24oYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zLCBcIlByaW1hcnlcIik7XG5cdHJldHVybiBvRWRpdEFjdGlvbiA/IG9FZGl0QWN0aW9uLnZpc2libGUgOiBcInRydWVcIjtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZm9ybWF0IHRoZSAnZW5hYmxlZCcgcHJvcGVydHkgZm9yIHRoZSBFZGl0IGJ1dHRvbiBvbiB0aGUgb2JqZWN0IHBhZ2Ugb3Igc3Vib2JqZWN0IHBhZ2UgaW4gY2FzZSBvZiBhIENvbW1hbmQgRXhlY3V0aW9uLlxuICpcbiAqIEBwYXJhbSBhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnMgQXJyYXkgb2YgaGVhZGVyIGFjdGlvbnMgb24gdGhlIG9iamVjdCBwYWdlXG4gKiBAcmV0dXJucyBSZXR1cm5zIGV4cHJlc3Npb24gYmluZGluZyBvciBCb29sZWFuIHZhbHVlIGZyb20gdGhlIGNvbnZlcnRlciBvdXRwdXRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEVkaXRDb21tYW5kRXhlY3V0aW9uRW5hYmxlZCA9IGZ1bmN0aW9uIChhQ29udmVydGVyQ29udGV4dEhlYWRlckFjdGlvbnM6IGFueVtdKSB7XG5cdGNvbnN0IG9FZGl0QWN0aW9uID0gX2ZpbmRBY3Rpb24oYUNvbnZlcnRlckNvbnRleHRIZWFkZXJBY3Rpb25zLCBcIlByaW1hcnlcIik7XG5cdHJldHVybiBvRWRpdEFjdGlvbiA/IG9FZGl0QWN0aW9uLmVuYWJsZWQgOiBcInRydWVcIjtcbn07XG5cbi8qKlxuICogRnVuY3Rpb24gdG8gZ2V0IHRoZSBFZGl0QWN0aW9uIGZyb20gdGhlIEVudGl0eXNldCBiYXNlZCBvbiBEcmFmdCBvciBzdGlja3kgYmFzZWQgYXBwbGljYXRpb24uXG4gKlxuICogQHBhcmFtIFtvRW50aXR5U2V0XSBUaGUgdmFsdWUgZnJvbSB0aGUgZXhwcmVzc2lvbi5cbiAqIEByZXR1cm5zIFJldHVybnMgZXhwcmVzc2lvbiBiaW5kaW5nIG9yIGJvb2xlYW4gdmFsdWUgYmFzZWQgb24gdlJhd1ZhbHVlICYgb0RyYWZ0Tm9kZVxuICovXG5leHBvcnQgY29uc3QgZ2V0RWRpdEFjdGlvbiA9IGZ1bmN0aW9uIChvRW50aXR5U2V0OiBDb250ZXh0KSB7XG5cdGNvbnN0IHNQYXRoID0gb0VudGl0eVNldC5nZXRQYXRoKCksXG5cdFx0b0Fubm90YXRpb25zID0gb0VudGl0eVNldC5nZXRPYmplY3QoYCR7c1BhdGh9QGApO1xuXHRjb25zdCBiRHJhZnRSb290ID0gb0Fubm90YXRpb25zLmhhc093blByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3RcIik7XG5cdGNvbnN0IGJTdGlja3lTZXNzaW9uID0gb0Fubm90YXRpb25zLmhhc093blByb3BlcnR5KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZFwiKTtcblx0bGV0IHNBY3Rpb25OYW1lO1xuXHRpZiAoYkRyYWZ0Um9vdCkge1xuXHRcdHNBY3Rpb25OYW1lID0gb0VudGl0eVNldC5nZXRPYmplY3QoYCR7c1BhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdFJvb3QvRWRpdEFjdGlvbmApO1xuXHR9IGVsc2UgaWYgKGJTdGlja3lTZXNzaW9uKSB7XG5cdFx0c0FjdGlvbk5hbWUgPSBvRW50aXR5U2V0LmdldE9iamVjdChgJHtzUGF0aH1AY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkL0VkaXRBY3Rpb25gKTtcblx0fVxuXHRyZXR1cm4gIXNBY3Rpb25OYW1lID8gc0FjdGlvbk5hbWUgOiBgJHtzUGF0aH0vJHtzQWN0aW9uTmFtZX1gO1xufTtcblxuZXhwb3J0IGNvbnN0IGlzUmVhZE9ubHlGcm9tU3RhdGljQW5ub3RhdGlvbnMgPSBmdW5jdGlvbiAob0Fubm90YXRpb25zOiBhbnksIG9GaWVsZENvbnRyb2w6IGFueSkge1xuXHRsZXQgYkNvbXB1dGVkLCBiSW1tdXRhYmxlLCBiUmVhZE9ubHk7XG5cdGlmIChvQW5ub3RhdGlvbnMgJiYgb0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkNvbXB1dGVkXCJdKSB7XG5cdFx0YkNvbXB1dGVkID0gb0Fubm90YXRpb25zW1wiQE9yZy5PRGF0YS5Db3JlLlYxLkNvbXB1dGVkXCJdLkJvb2wgPyBvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWRcIl0uQm9vbCA9PSBcInRydWVcIiA6IHRydWU7XG5cdH1cblx0aWYgKG9Bbm5vdGF0aW9ucyAmJiBvQW5ub3RhdGlvbnNbXCJAT3JnLk9EYXRhLkNvcmUuVjEuSW1tdXRhYmxlXCJdKSB7XG5cdFx0YkltbXV0YWJsZSA9IG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5JbW11dGFibGVcIl0uQm9vbCA/IG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5JbW11dGFibGVcIl0uQm9vbCA9PSBcInRydWVcIiA6IHRydWU7XG5cdH1cblx0YlJlYWRPbmx5ID0gYkNvbXB1dGVkIHx8IGJJbW11dGFibGU7XG5cblx0aWYgKG9GaWVsZENvbnRyb2wpIHtcblx0XHRiUmVhZE9ubHkgPSBiUmVhZE9ubHkgfHwgb0ZpZWxkQ29udHJvbCA9PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xUeXBlL1JlYWRPbmx5XCI7XG5cdH1cblx0aWYgKGJSZWFkT25seSkge1xuXHRcdHJldHVybiB0cnVlO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IHJlYWRPbmx5RXhwcmVzc2lvbkZyb21EeW5hbWljQW5ub3RhdGlvbnMgPSBmdW5jdGlvbiAob0ZpZWxkQ29udHJvbDogYW55KSB7XG5cdGxldCBzSXNGaWVsZENvbnRyb2xQYXRoUmVhZE9ubHk7XG5cdGlmIChvRmllbGRDb250cm9sKSB7XG5cdFx0aWYgKChNYW5hZ2VkT2JqZWN0IGFzIGFueSkuYmluZGluZ1BhcnNlcihvRmllbGRDb250cm9sKSkge1xuXHRcdFx0c0lzRmllbGRDb250cm9sUGF0aFJlYWRPbmx5ID0gXCIlXCIgKyBvRmllbGRDb250cm9sICsgXCIgPT09IDEgXCI7XG5cdFx0fVxuXHR9XG5cdGlmIChzSXNGaWVsZENvbnRyb2xQYXRoUmVhZE9ubHkpIHtcblx0XHRyZXR1cm4gXCJ7PSBcIiArIHNJc0ZpZWxkQ29udHJvbFBhdGhSZWFkT25seSArIFwiPyBmYWxzZSA6IHRydWUgfVwiO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cbn07XG5cbi8qXG4gKiBGdW5jdGlvbiB0byBnZXQgdGhlIGV4cHJlc3Npb24gZm9yIGNoYXJ0IFRpdGxlIFByZXNzXG4gKlxuICogQGZ1bmN0aW9ud1xuICogQHBhcmFtIHtvQ29uZmlndXJhdGlvbn0gW29Db25maWd1cmF0aW9uc10gY29udHJvbCBjb25maWd1cmF0aW9uIGZyb20gbWFuaWZlc3RcbiAqICBAcGFyYW0ge29NYW5pZmVzdH0gW29NYW5pZmVzdF0gT3V0Ym91bmRzIGZyb20gbWFuaWZlc3RcbiAqIHJldHVybnMge1N0cmluZ30gW3NDb2xsZWN0aW9uTmFtZV0gQ29sbGVjdGlvbiBOYW1lIG9mIHRoZSBNaWNybyBDaGFydFxuICpcbiAqIHJldHVybnMge1N0cmluZ30gW0V4cHJlc3Npb25dIEhhbmRsZXIgRXhwcmVzc2lvbiBmb3IgdGhlIHRpdGxlIHByZXNzXG4gKlxuICovXG5leHBvcnQgY29uc3QgZ2V0RXhwcmVzc2lvbkZvck1pY3JvQ2hhcnRUaXRsZVByZXNzID0gZnVuY3Rpb24gKG9Db25maWd1cmF0aW9uOiBhbnksIG9NYW5pZmVzdE91dGJvdW5kOiBhbnksIHNDb2xsZWN0aW9uTmFtZTogYW55KSB7XG5cdGlmIChvQ29uZmlndXJhdGlvbikge1xuXHRcdGlmIChcblx0XHRcdChvQ29uZmlndXJhdGlvbltcInRhcmdldE91dGJvdW5kXCJdICYmIG9Db25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl1bXCJvdXRib3VuZFwiXSkgfHxcblx0XHRcdChvQ29uZmlndXJhdGlvbltcInRhcmdldE91dGJvdW5kXCJdICYmIG9Db25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl1bXCJvdXRib3VuZFwiXSAmJiBvQ29uZmlndXJhdGlvbltcInRhcmdldFNlY3Rpb25zXCJdKVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0XCIuaGFuZGxlcnMub25EYXRhUG9pbnRUaXRsZVByZXNzZWQoJGNvbnRyb2xsZXIsICR7JHNvdXJjZT4vfSwnXCIgK1xuXHRcdFx0XHRKU09OLnN0cmluZ2lmeShvTWFuaWZlc3RPdXRib3VuZCkgK1xuXHRcdFx0XHRcIicsJ1wiICtcblx0XHRcdFx0b0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXVtcIm91dGJvdW5kXCJdICtcblx0XHRcdFx0XCInLCdcIiArXG5cdFx0XHRcdHNDb2xsZWN0aW9uTmFtZSArXG5cdFx0XHRcdFwiJyApXCJcblx0XHRcdCk7XG5cdFx0fSBlbHNlIGlmIChvQ29uZmlndXJhdGlvbltcInRhcmdldFNlY3Rpb25zXCJdKSB7XG5cdFx0XHRyZXR1cm4gXCIuaGFuZGxlcnMubmF2aWdhdGVUb1N1YlNlY3Rpb24oJGNvbnRyb2xsZXIsICdcIiArIEpTT04uc3RyaW5naWZ5KG9Db25maWd1cmF0aW9uW1widGFyZ2V0U2VjdGlvbnNcIl0pICsgXCInKVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0fVxufTtcblxuLypcbiAqIEZ1bmN0aW9uIHRvIHJlbmRlciBDaGFydCBUaXRsZSBhcyBMaW5rXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29Db250cm9sQ29uZmlndXJhdGlvbn0gW29Db25maWd1cmF0aW9uc10gY29udHJvbCBjb25maWd1cmF0aW9uIGZyb20gbWFuaWZlc3RcbiAqIHJldHVybnMge1N0cmluZ30gW3NLZXldIEZvciB0aGUgVGFyZ2V0T3V0Ym91bmQgYW5kIFRhcmdldFNlY3Rpb25cbiAqXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRNaWNyb0NoYXJ0VGl0bGVBc0xpbmsgPSBmdW5jdGlvbiAob0NvbnRyb2xDb25maWd1cmF0aW9uOiBhbnkpIHtcblx0aWYgKFxuXHRcdG9Db250cm9sQ29uZmlndXJhdGlvbiAmJlxuXHRcdChvQ29udHJvbENvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXSB8fCAob0NvbnRyb2xDb25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl0gJiYgb0NvbnRyb2xDb25maWd1cmF0aW9uW1widGFyZ2V0U2VjdGlvbnNcIl0pKVxuXHQpIHtcblx0XHRyZXR1cm4gXCJFeHRlcm5hbFwiO1xuXHR9IGVsc2UgaWYgKG9Db250cm9sQ29uZmlndXJhdGlvbiAmJiBvQ29udHJvbENvbmZpZ3VyYXRpb25bXCJ0YXJnZXRTZWN0aW9uc1wiXSkge1xuXHRcdHJldHVybiBcIkluUGFnZVwiO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBcIk5vbmVcIjtcblx0fVxufTtcblxuLyogR2V0IGdyb3VwSWQgZnJvbSBjb250cm9sIGNvbmZpZ3VyYXRpb25cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7T2JqZWN0fSBbb0NvbmZpZ3VyYXRpb25zXSBjb250cm9sIGNvbmZpZ3VyYXRpb24gZnJvbSBtYW5pZmVzdFxuICogQHBhcmFtIHtTdHJpbmd9IFtzQW5ub3RhdGlvblBhdGhdIEFubm90YXRpb24gUGF0aCBmb3IgdGhlIGNvbmZpZ3VyYXRpb25cbiAqIEBkZXNjcmlwdGlvbiBVc2VkIHRvIGdldCB0aGUgZ3JvdXBJZCBmb3IgRGF0YVBvaW50cyBhbmQgTWljcm9DaGFydHMgaW4gdGhlIEhlYWRlci5cbiAqXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRHcm91cElkRnJvbUNvbmZpZyA9IGZ1bmN0aW9uIChvQ29uZmlndXJhdGlvbnM6IGFueSwgc0Fubm90YXRpb25QYXRoOiBhbnksIHNEZWZhdWx0R3JvdXBJZD86IGFueSkge1xuXHRjb25zdCBvQ29uZmlndXJhdGlvbiA9IG9Db25maWd1cmF0aW9uc1tzQW5ub3RhdGlvblBhdGhdLFxuXHRcdGFBdXRvUGF0dGVybnMgPSBbXCJIZXJvZXNcIiwgXCJEZWNvcmF0aW9uXCIsIFwiV29ya2Vyc1wiLCBcIkxvbmdSdW5uZXJzXCJdO1xuXHRsZXQgc0dyb3VwSWQgPSBzRGVmYXVsdEdyb3VwSWQ7XG5cdGlmIChcblx0XHRvQ29uZmlndXJhdGlvbiAmJlxuXHRcdG9Db25maWd1cmF0aW9uLnJlcXVlc3RHcm91cElkICYmXG5cdFx0YUF1dG9QYXR0ZXJucy5zb21lKGZ1bmN0aW9uIChhdXRvUGF0dGVybjogc3RyaW5nKSB7XG5cdFx0XHRyZXR1cm4gYXV0b1BhdHRlcm4gPT09IG9Db25maWd1cmF0aW9uLnJlcXVlc3RHcm91cElkO1xuXHRcdH0pXG5cdCkge1xuXHRcdHNHcm91cElkID0gXCIkYXV0by5cIiArIG9Db25maWd1cmF0aW9uLnJlcXVlc3RHcm91cElkO1xuXHR9XG5cdHJldHVybiBzR3JvdXBJZDtcbn07XG5cbi8qXG4gKiBHZXQgQ29udGV4dCBCaW5kaW5nIHdpdGggZ3JvdXBJZCBmcm9tIGNvbnRyb2wgY29uZmlndXJhdGlvblxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtPYmplY3R9IFtvQ29uZmlndXJhdGlvbnNdIGNvbnRyb2wgY29uZmlndXJhdGlvbiBmcm9tIG1hbmlmZXN0XG4gKiBAcGFyYW0ge1N0cmluZ30gW3NLZXldIEFubm90YXRpb24gUGF0aCBmb3Igb2YgdGhlIGNvbmZpZ3VyYXRpb25cbiAqIEBkZXNjcmlwdGlvbiBVc2VkIHRvIGdldCB0aGUgYmluZGluZyBmb3IgRGF0YVBvaW50cyBpbiB0aGUgSGVhZGVyLlxuICpcbiAqL1xuZXhwb3J0IGNvbnN0IGdldEJpbmRpbmdXaXRoR3JvdXBJZEZyb21Db25maWcgPSBmdW5jdGlvbiAob0NvbmZpZ3VyYXRpb25zOiBhbnksIHNLZXk6IGFueSkge1xuXHRjb25zdCBzR3JvdXBJZCA9IGdldEdyb3VwSWRGcm9tQ29uZmlnKG9Db25maWd1cmF0aW9ucywgc0tleSk7XG5cdGxldCBzQmluZGluZztcblx0aWYgKHNHcm91cElkKSB7XG5cdFx0c0JpbmRpbmcgPSBcInsgcGF0aCA6ICcnLCBwYXJhbWV0ZXJzIDogeyAkJGdyb3VwSWQgOiAnXCIgKyBzR3JvdXBJZCArIFwiJyB9IH1cIjtcblx0fVxuXHRyZXR1cm4gc0JpbmRpbmc7XG59O1xuXG4vKipcbiAqIE1ldGhvZCB0byBjaGVjayB3aGV0aGVyIGEgRmllbGRHcm91cCBjb25zaXN0cyBvZiBvbmx5IDEgRGF0YUZpZWxkIHdpdGggTXVsdGlMaW5lIFRleHQgYW5ub3RhdGlvbi5cbiAqXG4gKiBAcGFyYW0gYUZvcm1FbGVtZW50cyBBIGNvbGxlY3Rpb24gb2YgZm9ybSBlbGVtZW50cyB1c2VkIGluIHRoZSBjdXJyZW50IGZpZWxkIGdyb3VwXG4gKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgb25seSAxIGRhdGEgZmllbGQgd2l0aCBNdWx0aWxpbmUgVGV4dCBhbm5vdGF0aW9uIGV4aXN0cy5cbiAqL1xuZXhwb3J0IGNvbnN0IGRvZXNGaWVsZEdyb3VwQ29udGFpbk9ubHlPbmVNdWx0aUxpbmVEYXRhRmllbGQgPSBmdW5jdGlvbiAoYUZvcm1FbGVtZW50czogYW55W10pIHtcblx0cmV0dXJuIGFGb3JtRWxlbWVudHMgJiYgYUZvcm1FbGVtZW50cy5sZW5ndGggPT09IDEgJiYgISFhRm9ybUVsZW1lbnRzWzBdLmlzVmFsdWVNdWx0aWxpbmVUZXh0O1xufTtcblxuLypcbiAqIEdldCBWaXNpYmxpdHkgb2YgYnJlYWRjcnVtYnMuXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge09iamVjdH0gW29WaWV3RGF0YV0gVmlld0RhdGEgbW9kZWxcbiAqIHJldHVybnMgeyp9IEV4cHJlc3Npb24gb3IgYm9vbGVhblxuICovXG5leHBvcnQgY29uc3QgZ2V0VmlzaWJsZUV4cHJlc3Npb25Gb3JCcmVhZGNydW1icyA9IGZ1bmN0aW9uIChvVmlld0RhdGE6IGFueSkge1xuXHRyZXR1cm4gb1ZpZXdEYXRhLnNob3dCcmVhZENydW1icyAmJiBvVmlld0RhdGEuZmNsRW5hYmxlZCAhPT0gdW5kZWZpbmVkID8gXCJ7ZmNsaGVscGVyPi9icmVhZENydW1iSXNWaXNpYmxlfVwiIDogb1ZpZXdEYXRhLnNob3dCcmVhZENydW1icztcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRTaGFyZUJ1dHRvblZpc2liaWxpdHkgPSBmdW5jdGlvbiAodmlld0RhdGE6IGFueSkge1xuXHRsZXQgc1NoYXJlQnV0dG9uVmlzaWJpbGl0eUV4cCA9IFwiISR7dWk+Y3JlYXRlTW9kZX1cIjtcblx0aWYgKHZpZXdEYXRhLmZjbEVuYWJsZWQpIHtcblx0XHRzU2hhcmVCdXR0b25WaXNpYmlsaXR5RXhwID0gXCIke2ZjbGhlbHBlcj4vc2hvd1NoYXJlSWNvbn0gJiYgXCIgKyBzU2hhcmVCdXR0b25WaXNpYmlsaXR5RXhwO1xuXHR9XG5cdHJldHVybiBcIns9IFwiICsgc1NoYXJlQnV0dG9uVmlzaWJpbGl0eUV4cCArIFwiIH1cIjtcbn07XG5cbi8qXG4gKiBHZXRzIHRoZSB2aXNpYmlsaXR5IG9mIHRoZSBoZWFkZXIgaW5mbyBpbiBlZGl0IG1vZGVcbiAqXG4gKiBJZiBlaXRoZXIgdGhlIHRpdGxlIG9yIGRlc2NyaXB0aW9uIGZpZWxkIGZyb20gdGhlIGhlYWRlciBhbm5vdGF0aW9ucyBhcmUgZWRpdGFibGUsIHRoZW4gdGhlXG4gKiBlZGl0YWJsZSBoZWFkZXIgaW5mbyBpcyB2aXNpYmxlLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IFtvQW5ub3RhdGlvbnNdIEFubm90YXRpb25zIG9iamVjdCBmb3IgZ2l2ZW4gZW50aXR5IHNldFxuICogQHBhcmFtIHtvYmplY3R9IFtvRmllbGRDb250cm9sXSBmaWVsZCBjb250cm9sXG4gKiByZXR1cm5zIHsqfSAgYmluZGluZyBleHByZXNzaW9uIG9yIGJvb2xlYW4gdmFsdWUgcmVzb2x2ZWQgZm9ybSBmdW5jaXRvbnMgaXNSZWFkT25seUZyb21TdGF0aWNBbm5vdGF0aW9ucyBhbmQgaXNSZWFkT25seUZyb21EeW5hbWljQW5ub3RhdGlvbnNcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFZpc2libGl0eU9mSGVhZGVySW5mbyA9IGZ1bmN0aW9uIChcblx0b1RpdGxlQW5ub3RhdGlvbnM6IGFueSxcblx0b0Rlc2NyaXB0aW9uQW5ub3RhdGlvbnM6IGFueSxcblx0b0ZpZWxkVGl0bGVGaWVsZENvbnRyb2w6IGFueSxcblx0b0ZpZWxkRGVzY3JpcHRpb25GaWVsZENvbnRyb2w6IGFueVxuKSB7XG5cdC8vIENoZWNrIEFubm90YXRpb25zIGZvciBUaXRsZSBGaWVsZFxuXHQvLyBTZXQgdG8gdHJ1ZSBhbmQgZG9uJ3QgdGFrZSBpbnRvIGFjY291bnQsIGlmIHRoZXJlIGFyZSBubyBhbm5vdGF0aW9ucywgaS5lLiBubyB0aXRsZSBleGlzdHNcblx0Y29uc3QgYklzVGl0bGVSZWFkT25seSA9IG9UaXRsZUFubm90YXRpb25zID8gaXNSZWFkT25seUZyb21TdGF0aWNBbm5vdGF0aW9ucyhvVGl0bGVBbm5vdGF0aW9ucywgb0ZpZWxkVGl0bGVGaWVsZENvbnRyb2wpIDogdHJ1ZTtcblx0Y29uc3QgdGl0bGVFeHByZXNzaW9uID0gcmVhZE9ubHlFeHByZXNzaW9uRnJvbUR5bmFtaWNBbm5vdGF0aW9ucyhvRmllbGRUaXRsZUZpZWxkQ29udHJvbCk7XG5cdC8vIFRoZXJlIGlzIG5vIGV4cHJlc3Npb24gYW5kIHRoZSB0aXRsZSBpcyBub3QgcmVhZHkgb25seSwgdGhpcyBpcyBzdWZmaWNpZW50IGZvciBhbiBlZGl0YWJsZSBoZWFkZXJcblx0aWYgKCFiSXNUaXRsZVJlYWRPbmx5ICYmICF0aXRsZUV4cHJlc3Npb24pIHtcblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxuXG5cdC8vIENoZWNrIEFubm90YXRpb25zIGZvciBEZXNjcmlwdGlvbiBGaWVsZFxuXHQvLyBTZXQgdG8gdHJ1ZSBhbmQgZG9uJ3QgdGFrZSBpbnRvIGFjY291bnQsIGlmIHRoZXJlIGFyZSBubyBhbm5vdGF0aW9ucywgaS5lLiBubyBkZXNjcmlwdGlvbiBleGlzdHNcblx0Y29uc3QgYklzRGVzY3JpcHRpb25SZWFkT25seSA9IG9EZXNjcmlwdGlvbkFubm90YXRpb25zXG5cdFx0PyBpc1JlYWRPbmx5RnJvbVN0YXRpY0Fubm90YXRpb25zKG9EZXNjcmlwdGlvbkFubm90YXRpb25zLCBvRmllbGREZXNjcmlwdGlvbkZpZWxkQ29udHJvbClcblx0XHQ6IHRydWU7XG5cdGNvbnN0IGRlc2NyaXB0aW9uRXhwcmVzc2lvbiA9IHJlYWRPbmx5RXhwcmVzc2lvbkZyb21EeW5hbWljQW5ub3RhdGlvbnMob0ZpZWxkRGVzY3JpcHRpb25GaWVsZENvbnRyb2wpO1xuXHQvLyBUaGVyZSBpcyBubyBleHByZXNzaW9uIGFuZCB0aGUgZGVzY3JpcHRpb24gaXMgbm90IHJlYWR5IG9ubHksIHRoaXMgaXMgc3VmZmljaWVudCBmb3IgYW4gZWRpdGFibGUgaGVhZGVyXG5cdGlmICghYklzRGVzY3JpcHRpb25SZWFkT25seSAmJiAhZGVzY3JpcHRpb25FeHByZXNzaW9uKSB7XG5cdFx0cmV0dXJuIHRydWU7XG5cdH1cblxuXHQvLyBCb3RoIHRpdGxlIGFuZCBkZXNjcmlwdGlvbiBhcmUgbm90IGVkaXRhYmxlIGFuZCB0aGVyZSBhcmUgbm8gZHluYW1pYyBhbm5vdGF0aW9uc1xuXHRpZiAoYklzVGl0bGVSZWFkT25seSAmJiBiSXNEZXNjcmlwdGlvblJlYWRPbmx5ICYmICF0aXRsZUV4cHJlc3Npb24gJiYgIWRlc2NyaXB0aW9uRXhwcmVzc2lvbikge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIE5vdyBjb21iaW5lIGV4cHJlc3Npb25zXG5cdGlmICh0aXRsZUV4cHJlc3Npb24gJiYgIWRlc2NyaXB0aW9uRXhwcmVzc2lvbikge1xuXHRcdHJldHVybiB0aXRsZUV4cHJlc3Npb247XG5cdH0gZWxzZSBpZiAoIXRpdGxlRXhwcmVzc2lvbiAmJiBkZXNjcmlwdGlvbkV4cHJlc3Npb24pIHtcblx0XHRyZXR1cm4gZGVzY3JpcHRpb25FeHByZXNzaW9uO1xuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBjb21iaW5lVGl0bGVBbmREZXNjcmlwdGlvbkV4cHJlc3Npb24ob0ZpZWxkVGl0bGVGaWVsZENvbnRyb2wsIG9GaWVsZERlc2NyaXB0aW9uRmllbGRDb250cm9sKTtcblx0fVxufTtcblxuZXhwb3J0IGNvbnN0IGNvbWJpbmVUaXRsZUFuZERlc2NyaXB0aW9uRXhwcmVzc2lvbiA9IGZ1bmN0aW9uIChvVGl0bGVGaWVsZENvbnRyb2w6IGFueSwgb0Rlc2NyaXB0aW9uRmllbGRDb250cm9sOiBhbnkpIHtcblx0Ly8gSWYgYm90aCBoZWFkZXIgYW5kIHRpdGxlIGZpZWxkIGFyZSBiYXNlZCBvbiBkeW5tYWljIGZpZWxkIGNvbnRyb2wsIHRoZSBlZGl0YWJsZSBoZWFkZXJcblx0Ly8gaXMgdmlzaWJsZSBpZiBhdCBsZWFzdCBvbmUgb2YgdGhlc2UgaXMgbm90IHJlYWR5IG9ubHlcblx0cmV0dXJuIFwiez0gJVwiICsgb1RpdGxlRmllbGRDb250cm9sICsgXCIgPT09IDEgPyAoICVcIiArIG9EZXNjcmlwdGlvbkZpZWxkQ29udHJvbCArIFwiID09PSAxID8gZmFsc2UgOiB0cnVlICkgOiB0cnVlIH1cIjtcbn07XG5cbi8qXG4gKiBHZXQgRXhwcmVzc2lvbiBvZiBwcmVzcyBldmVudCBvZiBkZWxldGUgYnV0dG9uLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtzdHJpbmd9IFtzRW50aXR5U2V0TmFtZV0gRW50aXR5IHNldCBuYW1lXG4gKiByZXR1cm5zIHtzdHJpbmd9ICBiaW5kaW5nIGV4cHJlc3Npb24gLyBmdW5jdGlvbiBzdHJpbmcgZ2VuZXJhdGVkIGZyb20gY29tbWFuaGVscGVyJ3MgZnVuY3Rpb24gZ2VuZXJhdGVGdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZ2V0UHJlc3NFeHByZXNzaW9uRm9yRGVsZXRlID0gZnVuY3Rpb24gKHNFbnRpdHlTZXROYW1lOiBhbnkpIHtcblx0Y29uc3Qgc0RlbGV0YWJsZUNvbnRleHRzID0gXCIkeyR2aWV3Pi9nZXRCaW5kaW5nQ29udGV4dH1cIixcblx0XHRzVGl0bGUgPSBcIiR7JHZpZXc+LyNmZTo6T2JqZWN0UGFnZS9nZXRIZWFkZXJUaXRsZS9nZXRFeHBhbmRlZEhlYWRpbmcvZ2V0SXRlbXMvMS9nZXRUZXh0fVwiLFxuXHRcdHNEZXNjcmlwdGlvbiA9IFwiJHskdmlldz4vI2ZlOjpPYmplY3RQYWdlL2dldEhlYWRlclRpdGxlL2dldEV4cGFuZGVkQ29udGVudC8wL2dldEl0ZW1zLzAvZ2V0VGV4dH1cIjtcblx0Y29uc3Qgb1BhcmFtcyA9IHtcblx0XHR0aXRsZTogc1RpdGxlLFxuXHRcdGVudGl0eVNldE5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0VudGl0eVNldE5hbWUpLFxuXHRcdGRlc2NyaXB0aW9uOiBzRGVzY3JpcHRpb25cblx0fTtcblx0cmV0dXJuIENvbW1vbkhlbHBlci5nZW5lcmF0ZUZ1bmN0aW9uKFwiLmVkaXRGbG93LmRlbGV0ZURvY3VtZW50XCIsIHNEZWxldGFibGVDb250ZXh0cywgQ29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9QYXJhbXMpKTtcbn07XG5cbi8qXG4gKiBHZXQgRXhwcmVzc2lvbiBvZiBwcmVzcyBldmVudCBvZiBFZGl0IGJ1dHRvbi5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0RhdGFGaWVsZF0gRGF0YSBmaWVsZCBvYmplY3RcbiAqIEBwYXJhbSB7c3RyaW5nfSBbc0VudGl0eVNldE5hbWVdIEVudGl0eSBzZXQgbmFtZVxuICogQHBhcmFtIHtvYmplY3R9IFtvSGVhZGVyQWN0aW9uXSBIZWFkZXIgYWN0aW9uIG9iamVjdFxuICogcmV0dXJucyB7c3RyaW5nfSAgYmluZGluZyBleHByZXNzaW9uIC8gZnVuY3Rpb24gc3RyaW5nIGdlbmVyYXRlZCBmcm9tIGNvbW1hbmhlbHBlcidzIGZ1bmN0aW9uIGdlbmVyYXRlRnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGdldFByZXNzRXhwcmVzc2lvbkZvckVkaXQgPSBmdW5jdGlvbiAob0RhdGFGaWVsZDogYW55LCBzRW50aXR5U2V0TmFtZTogYW55LCBvSGVhZGVyQWN0aW9uOiBhbnkpIHtcblx0Y29uc3Qgc0VkaXRhYmxlQ29udGV4dHMgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQgJiYgb0RhdGFGaWVsZC5BY3Rpb24pLFxuXHRcdHNEYXRhRmllbGRFbnVtTWVtYmVyID0gb0RhdGFGaWVsZCAmJiBvRGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZyAmJiBvRGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZ1tcIiRFbnVtTWVtYmVyXCJdLFxuXHRcdHNJbnZvY2F0aW9uR3JvdXAgPSBzRGF0YUZpZWxkRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5PcGVyYXRpb25Hcm91cGluZ1R5cGUvQ2hhbmdlU2V0XCIgPyBcIkNoYW5nZVNldFwiIDogXCJJc29sYXRlZFwiO1xuXHRjb25zdCBvUGFyYW1zID0ge1xuXHRcdGNvbnRleHRzOiBcIiR7JHZpZXc+L2dldEJpbmRpbmdDb250ZXh0fVwiLFxuXHRcdGVudGl0eVNldE5hbWU6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0VudGl0eVNldE5hbWUpLFxuXHRcdGludm9jYXRpb25Hcm91cGluZzogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzSW52b2NhdGlvbkdyb3VwKSxcblx0XHRtb2RlbDogXCIkeyRzb3VyY2U+L30uZ2V0TW9kZWwoKVwiLFxuXHRcdGxhYmVsOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQgJiYgb0RhdGFGaWVsZC5MYWJlbCwgdHJ1ZSksXG5cdFx0aXNOYXZpZ2FibGU6IG9IZWFkZXJBY3Rpb24gJiYgb0hlYWRlckFjdGlvbi5pc05hdmlnYWJsZSxcblx0XHRkZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb246XG5cdFx0XHRvSGVhZGVyQWN0aW9uICYmIG9IZWFkZXJBY3Rpb24uZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uID8gYCcke29IZWFkZXJBY3Rpb24uZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9ufSdgIDogdW5kZWZpbmVkXG5cdH07XG5cdHJldHVybiBDb21tb25IZWxwZXIuZ2VuZXJhdGVGdW5jdGlvbihcIi5oYW5kbGVycy5vbkNhbGxBY3Rpb25cIiwgXCIkeyR2aWV3Pi99XCIsIHNFZGl0YWJsZUNvbnRleHRzLCBDb21tb25IZWxwZXIub2JqZWN0VG9TdHJpbmcob1BhcmFtcykpO1xufTtcblxuLypcbiAqIE1ldGhvZCB0byBnZXQgdGhlIGV4cHJlc3Npb24gZm9yIHRoZSAncHJlc3MnIGV2ZW50IGZvciBmb290ZXIgYW5ub3RhdGlvbiBhY3Rpb25zXG4gKlxuICogQGZ1bmN0aW9uXG4gKiBAcGFyYW0ge29iamVjdH0gW29EYXRhRmllbGRdIERhdGEgZmllbGQgb2JqZWN0XG4gKiBAcGFyYW0ge3N0cmluZ30gW3NFbnRpdHlTZXROYW1lXSBFbnRpdHkgc2V0IG5hbWVcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0hlYWRlckFjdGlvbl0gSGVhZGVyIGFjdGlvbiBvYmplY3RcbiAqIHJldHVybnMge3N0cmluZ30gIEJpbmRpbmcgZXhwcmVzc2lvbiBvciBmdW5jdGlvbiBzdHJpbmcgdGhhdCBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgQ29tbW9uaGVscGVyJ3MgZnVuY3Rpb24gZ2VuZXJhdGVGdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZ2V0UHJlc3NFeHByZXNzaW9uRm9yRm9vdGVyQW5ub3RhdGlvbkFjdGlvbiA9IGZ1bmN0aW9uIChvRGF0YUZpZWxkOiBhbnksIHNFbnRpdHlTZXROYW1lOiBhbnksIG9IZWFkZXJBY3Rpb246IGFueSkge1xuXHRjb25zdCBzQWN0aW9uQ29udGV4dHMgPSBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQgJiYgb0RhdGFGaWVsZC5BY3Rpb24pLFxuXHRcdHNEYXRhRmllbGRFbnVtTWVtYmVyID0gb0RhdGFGaWVsZCAmJiBvRGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZyAmJiBvRGF0YUZpZWxkLkludm9jYXRpb25Hcm91cGluZ1tcIiRFbnVtTWVtYmVyXCJdLFxuXHRcdHNJbnZvY2F0aW9uR3JvdXAgPSBzRGF0YUZpZWxkRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5PcGVyYXRpb25Hcm91cGluZ1R5cGUvQ2hhbmdlU2V0XCIgPyBcIkNoYW5nZVNldFwiIDogXCJJc29sYXRlZFwiO1xuXHRjb25zdCBvUGFyYW1zID0ge1xuXHRcdGNvbnRleHRzOiBcIiR7JHZpZXc+LyNmZTo6T2JqZWN0UGFnZS99LmdldEJpbmRpbmdDb250ZXh0KClcIixcblx0XHRlbnRpdHlTZXROYW1lOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKHNFbnRpdHlTZXROYW1lKSxcblx0XHRpbnZvY2F0aW9uR3JvdXBpbmc6IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMoc0ludm9jYXRpb25Hcm91cCksXG5cdFx0bW9kZWw6IFwiJHskc291cmNlPi99LmdldE1vZGVsKClcIixcblx0XHRsYWJlbDogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhvRGF0YUZpZWxkICYmIG9EYXRhRmllbGQuTGFiZWwsIHRydWUpLFxuXHRcdGlzTmF2aWdhYmxlOiBvSGVhZGVyQWN0aW9uICYmIG9IZWFkZXJBY3Rpb24uaXNOYXZpZ2FibGUsXG5cdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOlxuXHRcdFx0b0hlYWRlckFjdGlvbiAmJiBvSGVhZGVyQWN0aW9uLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbiA/IGAnJHtvSGVhZGVyQWN0aW9uLmRlZmF1bHRWYWx1ZXNFeHRlbnNpb25GdW5jdGlvbn0nYCA6IHVuZGVmaW5lZFxuXHR9O1xuXHRyZXR1cm4gQ29tbW9uSGVscGVyLmdlbmVyYXRlRnVuY3Rpb24oXCIuaGFuZGxlcnMub25DYWxsQWN0aW9uXCIsIFwiJHskdmlldz4vfVwiLCBzQWN0aW9uQ29udGV4dHMsIENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvUGFyYW1zKSk7XG59O1xuXG4vKlxuICogR2V0IEV4cHJlc3Npb24gb2YgZXhlY3V0ZSBldmVudCBleHByZXNzaW9uIG9mIHByaW1hcnkgYWN0aW9uLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IFtvRGF0YUZpZWxkXSBEYXRhIGZpZWxkIG9iamVjdFxuICogQHBhcmFtIHtzdHJpbmd9IFtzRW50aXR5U2V0TmFtZV0gRW50aXR5IHNldCBuYW1lXG4gKiBAcGFyYW0ge29iamVjdH0gW29IZWFkZXJBY3Rpb25dIEhlYWRlciBhY3Rpb24gb2JqZWN0XG4gKiBAcGFyYW0ge0NvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgc3RyaW5nfSBUaGUgdmlzaWJpbGl0eSBvZiBzZW1hdGljIHBvc2l0aXZlIGFjdGlvblxuICogQHBhcmFtIHtDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHN0cmluZ30gVGhlIGVuYWJsZW1lbnQgb2Ygc2VtYW50aWMgcG9zaXRpdmUgYWN0aW9uXG4gKiBAcGFyYW0ge0NvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgc3RyaW5nfSBUaGUgRWRpdCBidXR0b24gdmlzaWJpbGl0eVxuICogQHBhcmFtIHtDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHN0cmluZ30gVGhlIGVuYWJsZW1lbnQgb2YgRWRpdCBidXR0b25cbiAqIHJldHVybnMge3N0cmluZ30gIGJpbmRpbmcgZXhwcmVzc2lvbiAvIGZ1bmN0aW9uIHN0cmluZyBnZW5lcmF0ZWQgZnJvbSBjb21tYW5oZWxwZXIncyBmdW5jdGlvbiBnZW5lcmF0ZUZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBnZXRQcmVzc0V4cHJlc3Npb25Gb3JQcmltYXJ5QWN0aW9uID0gZnVuY3Rpb24gKFxuXHRvRGF0YUZpZWxkOiBhbnksXG5cdHNFbnRpdHlTZXROYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQsXG5cdG9IZWFkZXJBY3Rpb246IEJhc2VBY3Rpb24gfCBudWxsLFxuXHRwb3NpdGl2ZUFjdGlvblZpc2libGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgc3RyaW5nLFxuXHRwb3NpdGl2ZUFjdGlvbkVuYWJsZWQ6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgc3RyaW5nLFxuXHRlZGl0QWN0aW9uVmlzaWJsZTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCBzdHJpbmcsXG5cdGVkaXRBY3Rpb25FbmFibGVkOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB8IHN0cmluZ1xuKSB7XG5cdGNvbnN0IHNBY3Rpb25Db250ZXh0cyA9IENvbW1vbkhlbHBlci5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZCAmJiBvRGF0YUZpZWxkLkFjdGlvbiksXG5cdFx0c0RhdGFGaWVsZEVudW1NZW1iZXIgPSBvRGF0YUZpZWxkICYmIG9EYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nICYmIG9EYXRhRmllbGQuSW52b2NhdGlvbkdyb3VwaW5nW1wiJEVudW1NZW1iZXJcIl0sXG5cdFx0c0ludm9jYXRpb25Hcm91cCA9IHNEYXRhRmllbGRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLk9wZXJhdGlvbkdyb3VwaW5nVHlwZS9DaGFuZ2VTZXRcIiA/IFwiQ2hhbmdlU2V0XCIgOiBcIklzb2xhdGVkXCI7XG5cdGNvbnN0IG9QYXJhbXMgPSB7XG5cdFx0Y29udGV4dHM6IFwiJHskdmlldz4vI2ZlOjpPYmplY3RQYWdlL30uZ2V0QmluZGluZ0NvbnRleHQoKVwiLFxuXHRcdGVudGl0eVNldE5hbWU6IHNFbnRpdHlTZXROYW1lID8gQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzRW50aXR5U2V0TmFtZSkgOiBcIlwiLFxuXHRcdGludm9jYXRpb25Hcm91cGluZzogQ29tbW9uSGVscGVyLmFkZFNpbmdsZVF1b3RlcyhzSW52b2NhdGlvbkdyb3VwKSxcblx0XHRtb2RlbDogXCIkeyRzb3VyY2U+L30uZ2V0TW9kZWwoKVwiLFxuXHRcdGxhYmVsOiBDb21tb25IZWxwZXIuYWRkU2luZ2xlUXVvdGVzKG9EYXRhRmllbGQ/LkxhYmVsLCB0cnVlKSxcblx0XHRpc05hdmlnYWJsZTogb0hlYWRlckFjdGlvbj8uaXNOYXZpZ2FibGUsXG5cdFx0ZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9uOiBvSGVhZGVyQWN0aW9uPy5kZWZhdWx0VmFsdWVzRXh0ZW5zaW9uRnVuY3Rpb25cblx0XHRcdD8gYCcke29IZWFkZXJBY3Rpb24uZGVmYXVsdFZhbHVlc0V4dGVuc2lvbkZ1bmN0aW9ufSdgXG5cdFx0XHQ6IHVuZGVmaW5lZFxuXHR9O1xuXHRjb25zdCBvQ29uZGl0aW9ucyA9IHtcblx0XHRwb3NpdGl2ZUFjdGlvblZpc2libGUsXG5cdFx0cG9zaXRpdmVBY3Rpb25FbmFibGVkLFxuXHRcdGVkaXRBY3Rpb25WaXNpYmxlLFxuXHRcdGVkaXRBY3Rpb25FbmFibGVkXG5cdH07XG5cdHJldHVybiBDb21tb25IZWxwZXIuZ2VuZXJhdGVGdW5jdGlvbihcblx0XHRcIi5oYW5kbGVycy5vblByaW1hcnlBY3Rpb25cIixcblx0XHRcIiRjb250cm9sbGVyXCIsXG5cdFx0XCIkeyR2aWV3Pi99XCIsXG5cdFx0XCIkeyR2aWV3Pi9nZXRCaW5kaW5nQ29udGV4dH1cIixcblx0XHRzQWN0aW9uQ29udGV4dHMsXG5cdFx0Q29tbW9uSGVscGVyLm9iamVjdFRvU3RyaW5nKG9QYXJhbXMpLFxuXHRcdENvbW1vbkhlbHBlci5vYmplY3RUb1N0cmluZyhvQ29uZGl0aW9ucylcblx0KTtcbn07XG5cbi8qXG4gKiBHZXRzIHRoZSBiaW5kaW5nIG9mIHRoZSBjb250YWluZXIgSEJveCBmb3IgdGhlIGhlYWRlciBmYWNldC5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBwYXJhbSB7b2JqZWN0fSBbb0NvbnRyb2xDb25maWd1cmF0aW9uXSBUaGUgY29udHJvbCBjb25maWd1cmF0aW9uIGZvcm0gb2YgdGhlIHZpZXdEYXRhIG1vZGVsXG4gKiBAcGFyYW0ge29iamVjdH0gW29IZWFkZXJGYWNldF0gVGhlIG9iamVjdCBvZiB0aGUgaGVhZGVyIGZhY2V0XG4gKiByZXR1cm5zIHsqfSAgVGhlIGJpbmRpbmcgZXhwcmVzc2lvbiBmcm9tIGZ1bmN0aW9uIGdldEJpbmRpbmdXaXRoR3JvdXBJZEZyb21Db25maWcgb3IgdW5kZWZpbmVkLlxuICovXG5leHBvcnQgY29uc3QgZ2V0U3Rhc2hhYmxlSEJveEJpbmRpbmcgPSBmdW5jdGlvbiAob0NvbnRyb2xDb25maWd1cmF0aW9uOiBhbnksIG9IZWFkZXJGYWNldDogYW55KSB7XG5cdGlmIChvSGVhZGVyRmFjZXQgJiYgb0hlYWRlckZhY2V0LkZhY2V0ICYmIG9IZWFkZXJGYWNldC5GYWNldC50YXJnZXRBbm5vdGF0aW9uVHlwZSA9PT0gXCJEYXRhUG9pbnRcIikge1xuXHRcdHJldHVybiBnZXRCaW5kaW5nV2l0aEdyb3VwSWRGcm9tQ29uZmlnKG9Db250cm9sQ29uZmlndXJhdGlvbiwgb0hlYWRlckZhY2V0LkZhY2V0LnRhcmdldEFubm90YXRpb25WYWx1ZSk7XG5cdH1cbn07XG5cbi8qXG4gKiBHZXRzIHRoZSAnUHJlc3MnIGV2ZW50IGV4cHJlc3Npb24gZm9yIHRoZSBleHRlcm5hbCBhbmQgaW50ZXJuYWwgZGF0YSBwb2ludCBsaW5rLlxuICpcbiAqIEBmdW5jdGlvblxuICogQHBhcmFtIHtvYmplY3R9IFtvQ29uZmlndXJhdGlvbl0gQ29udHJvbCBjb25maWd1cmF0aW9uIGZyb20gbWFuaWZlc3RcbiAqIEBwYXJhbSB7b2JqZWN0fSBbb01hbmlmZXN0T3V0Ym91bmRdIE91dGJvdW5kcyBmcm9tIG1hbmlmZXN0XG4gKiByZXR1cm5zIHtzdHJpbmd9IFRoZSBydW50aW1lIGJpbmRpbmcgb2YgdGhlICdQcmVzcycgZXZlbnRcbiAqL1xuZXhwb3J0IGNvbnN0IGdldFByZXNzRXhwcmVzc2lvbkZvckxpbmsgPSBmdW5jdGlvbiAob0NvbmZpZ3VyYXRpb246IGFueSwgb01hbmlmZXN0T3V0Ym91bmQ6IGFueSkge1xuXHRpZiAob0NvbmZpZ3VyYXRpb24pIHtcblx0XHRpZiAob0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRPdXRib3VuZFwiXSAmJiBvQ29uZmlndXJhdGlvbltcInRhcmdldE91dGJvdW5kXCJdW1wib3V0Ym91bmRcIl0pIHtcblx0XHRcdHJldHVybiAoXG5cdFx0XHRcdFwiLmhhbmRsZXJzLm9uRGF0YVBvaW50VGl0bGVQcmVzc2VkKCRjb250cm9sbGVyLCAkeyRzb3VyY2U+fSwgXCIgK1xuXHRcdFx0XHRKU09OLnN0cmluZ2lmeShvTWFuaWZlc3RPdXRib3VuZCkgK1xuXHRcdFx0XHRcIixcIiArXG5cdFx0XHRcdEpTT04uc3RyaW5naWZ5KG9Db25maWd1cmF0aW9uW1widGFyZ2V0T3V0Ym91bmRcIl1bXCJvdXRib3VuZFwiXSkgK1xuXHRcdFx0XHRcIilcIlxuXHRcdFx0KTtcblx0XHR9IGVsc2UgaWYgKG9Db25maWd1cmF0aW9uW1widGFyZ2V0U2VjdGlvbnNcIl0pIHtcblx0XHRcdHJldHVybiBcIi5oYW5kbGVycy5uYXZpZ2F0ZVRvU3ViU2VjdGlvbigkY29udHJvbGxlciwgJ1wiICsgSlNPTi5zdHJpbmdpZnkob0NvbmZpZ3VyYXRpb25bXCJ0YXJnZXRTZWN0aW9uc1wiXSkgKyBcIicpXCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0SGVhZGVyRm9ybUhib3hSZW5kZXJUeXBlID0gZnVuY3Rpb24gKGRhdGFGaWVsZDogRGF0YU1vZGVsT2JqZWN0UGF0aCk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG5cdGlmIChkYXRhRmllbGQ/LnRhcmdldE9iamVjdD8uJFR5cGUgPT09IFVJQW5ub3RhdGlvblR5cGVzLkRhdGFGaWVsZEZvckFubm90YXRpb24pIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdHJldHVybiBcIkJhcmVcIjtcbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztFQWdDQSxJQUFNQSxVQUFVLEdBQUdDLFFBQVEsQ0FBQ0QsVUFBVTtFQU90QztFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7RUFDQTtFQUNBO0VBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sSUFBTUUscUJBQXFCLEdBQUcsVUFDcENDLFdBQXVDLEVBQ3ZDQyxTQUFtQixFQUNuQkMsZUFBb0MsRUFDcENDLFVBQThCLEVBQ0s7SUFBQTtJQUNuQyxJQUFNQyxpQkFBaUIsR0FBR0MsV0FBVyxDQUFDQyxpQkFBaUIsQ0FBQyxjQUFjLEVBQUVMLFNBQVMsQ0FBQ00sY0FBYyxFQUFFQyxTQUFTLEVBQUVQLFNBQVMsQ0FBQ1EsU0FBUyxDQUFDO0lBRWpJLElBQU1DLG1CQUFtQixHQUFHTCxXQUFXLENBQUNDLGlCQUFpQixDQUN4RCxzREFBc0QsRUFDdERMLFNBQVMsQ0FBQ00sY0FBYyxFQUN4QkMsU0FBUyxFQUNUUCxTQUFTLENBQUNRLFNBQVMsQ0FDbkI7SUFFRCxJQUFNRSxxQkFBcUIsR0FDMUIsQ0FBQVgsV0FBVyxhQUFYQSxXQUFXLHVCQUFYQSxXQUFXLENBQUVZLEtBQUssTUFB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