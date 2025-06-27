/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/library", "sap/fe/core/TemplateModel", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/core/templating/PropertyHelper", "sap/fe/macros/field/FieldHelper", "sap/fe/macros/field/FieldTemplating", "sap/fe/macros/table/TableHelper", "sap/m/Button", "sap/m/Dialog", "sap/m/MessageToast", "sap/ui/core/Core", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/mdc/enum/EditMode", "sap/ui/model/json/JSONModel", "../controllerextensions/messageHandler/messageHandling", "../controls/Any", "../converters/MetaModelConverter", "../templating/FieldControlHelper", "../templating/UIFormatters", "./SideEffectsHelper"], function (Log, CommonUtils, BindingToolkit, FELibrary, TemplateModel, DataModelPathHelper, PropertyHelper, FieldHelper, FieldTemplating, TableHelper, Button, Dialog, MessageToast, Core, Fragment, XMLPreprocessor, XMLTemplateProcessor, EditMode, JSONModel, messageHandling, Any, MetaModelConverter, FieldControlHelper, UIFormatters, SideEffectsHelper) {
  "use strict";

  var isCollectionField = UIFormatters.isCollectionField;
  var getRequiredExpression = UIFormatters.getRequiredExpression;
  var getEditMode = UIFormatters.getEditMode;
  var isReadOnlyExpression = FieldControlHelper.isReadOnlyExpression;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var convertMetaModelContext = MetaModelConverter.convertMetaModelContext;
  var setEditStyleProperties = FieldTemplating.setEditStyleProperties;
  var getTextBinding = FieldTemplating.getTextBinding;
  var hasValueHelpWithFixedValues = PropertyHelper.hasValueHelpWithFixedValues;
  var hasValueHelp = PropertyHelper.hasValueHelp;
  var hasUnit = PropertyHelper.hasUnit;
  var hasCurrency = PropertyHelper.hasCurrency;
  var getAssociatedUnitPropertyPath = PropertyHelper.getAssociatedUnitPropertyPath;
  var getAssociatedUnitProperty = PropertyHelper.getAssociatedUnitProperty;
  var getRelativePaths = DataModelPathHelper.getRelativePaths;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var pathInModel = BindingToolkit.pathInModel;
  var or = BindingToolkit.or;
  var not = BindingToolkit.not;
  var ifElse = BindingToolkit.ifElse;
  var constant = BindingToolkit.constant;
  var compileExpression = BindingToolkit.compileExpression;
  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  var MassEditHelper = {
    /**
     * Initializes the value at final or deepest level path with a blank array.
     * Return an empty array pointing to the final or deepest level path.
     *
     * @param sPath Property path
     * @param aValues Array instance where the default data needs to be added
     * @returns The final path
     */
    initLastLevelOfPropertyPath: function (sPath, aValues) {
      var aFinalPath;
      var index = 0;
      var aPaths = sPath.split("/");
      var sFullPath = "";
      aPaths.forEach(function (sPropertyPath) {
        if (!aValues[sPropertyPath] && index === 0) {
          aValues[sPropertyPath] = {};
          aFinalPath = aValues[sPropertyPath];
          sFullPath = sFullPath + sPropertyPath;
          index++;
        } else if (!aFinalPath[sPropertyPath]) {
          sFullPath = "".concat(sFullPath, "/").concat(sPropertyPath);
          if (sFullPath !== sPath) {
            aFinalPath[sPropertyPath] = {};
            aFinalPath = aFinalPath[sPropertyPath];
          } else {
            aFinalPath[sPropertyPath] = [];
          }
        }
      });
      return aFinalPath;
    },
    /**
     * Method to get unique values for given array values.
     *
     * @param sValue Property value
     * @param index Index of the property value
     * @param self Instance of the array
     * @returns The unique value
     */
    getUniqueValues: function (sValue, index, self) {
      if (sValue != undefined && sValue != null) {
        return self.indexOf(sValue) === index;
      }
    },
    /**
     * Gets the property value for a multi-level path (for example: _Materials/Material_Details gets the value of Material_Details under _Materials Object).
     * Returns the propertyValue, which can be of any type (string, number, etc..).
     *
     * @param sDataPropertyPath Property path
     * @param oValues Object of property values
     * @returns The property value
     */
    getValueForMultiLevelPath: function (sDataPropertyPath, oValues) {
      if (sDataPropertyPath && sDataPropertyPath.indexOf("/") > 0) {
        var aPropertyPaths = sDataPropertyPath.split("/");
        var Result;
        aPropertyPaths.forEach(function (sPath) {
          Result = oValues && oValues[sPath] ? oValues[sPath] : Result && Result[sPath];
        });
        return Result;
      }
    },
    /**
     * Gets the key path for the key of a combo box that must be selected initially when the dialog opens:
     * => If propertyValue for all selected contexts is different, then < Keep Existing Values > is preselected.
     * => If propertyValue for all selected contexts is the same, then the propertyValue is preselected.
     * => If propertyValue for all selected contexts is empty, then < Leave Blank > is preselected.
     *
     *
     * @param aContexts Contexts for mass edit
     * @param sDataPropertyPath Data property path
     * @returns The key path
     */
    getDefaultSelectionPathComboBox: function (aContexts, sDataPropertyPath) {
      if (sDataPropertyPath && aContexts.length > 0) {
        var oSelectedContext = aContexts,
          aPropertyValues = [];
        oSelectedContext.forEach(function (oContext) {
          var oDataObject = oContext.getObject();
          var sMultiLevelPathCondition = sDataPropertyPath.indexOf("/") > -1 && oDataObject.hasOwnProperty(sDataPropertyPath.split("/")[0]);
          if (oContext && (oDataObject.hasOwnProperty(sDataPropertyPath) || sMultiLevelPathCondition)) {
            aPropertyValues.push(oContext.getObject(sDataPropertyPath));
          }
        });
        var aUniquePropertyValues = aPropertyValues.filter(MassEditHelper.getUniqueValues);
        if (aUniquePropertyValues.length > 1) {
          return "Default/".concat(sDataPropertyPath);
        } else if (aUniquePropertyValues.length === 0) {
          return "Empty/".concat(sDataPropertyPath);
        } else if (aUniquePropertyValues.length === 1) {
          return "".concat(sDataPropertyPath, "/").concat(aUniquePropertyValues[0]);
        }
      }
    },
    /**
     * Checks hidden annotation value [both static and path based] for table's selected context.
     *
     * @param hiddenValue Hidden annotation value / path for field
     * @param aContexts Contexts for mass edit
     * @returns The hidden annotation value
     */
    getHiddenValueForContexts: function (hiddenValue, aContexts) {
      if (hiddenValue && hiddenValue.$Path) {
        return !aContexts.some(function (oSelectedContext) {
          return oSelectedContext.getObject(hiddenValue.$Path) === false;
        });
      }
      return hiddenValue;
    },
    getInputType: function (propertyInfo, dataFieldConverted, oDataModelPath) {
      var editStyleProperties = {};
      var inputType;
      if (propertyInfo) {
        setEditStyleProperties(editStyleProperties, dataFieldConverted, oDataModelPath, true);
        inputType = (editStyleProperties === null || editStyleProperties === void 0 ? void 0 : editStyleProperties.editStyle) || "";
      }
      var isValidForMassEdit = inputType && ["DatePicker", "TimePicker", "DateTimePicker", "RatingIndicator"].indexOf(inputType) === -1 && !isCollectionField(oDataModelPath) && !hasValueHelpWithFixedValues(propertyInfo);
      return (isValidForMassEdit || "") && inputType;
    },
    getIsFieldGrp: function (dataFieldConverted) {
      return dataFieldConverted && dataFieldConverted.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" && dataFieldConverted.Target && dataFieldConverted.Target.value && dataFieldConverted.Target.value.indexOf("FieldGroup") > -1;
    },
    /**
     * Get text path for the mass edit field.
     *
     * @param property Property path
     * @param textBinding Text Binding Info
     * @param displayMode Display mode
     * @returns Text Property Path if it exists
     */
    getTextPath: function (property, textBinding, displayMode) {
      var descriptionPath;
      if (textBinding && (textBinding.path || textBinding.parameters && textBinding.parameters.length) && property) {
        if (textBinding.path && displayMode === "Description") {
          descriptionPath = textBinding.path;
        } else if (textBinding.parameters) {
          textBinding.parameters.forEach(function (props) {
            if (props.path && props.path !== property) {
              descriptionPath = props.path;
            }
          });
        }
      }
      return descriptionPath;
    },
    /**
     * Initializes a JSON Model for properties of dialog fields [label, visiblity, dataproperty, etc.].
     *
     * @param oTable Instance of Table
     * @param aContexts Contexts for mass edit
     * @param aDataArray Array containing data related to the dialog used by both the static and the runtime model
     * @returns The model
     */
    prepareDataForDialog: function (oTable, aContexts, aDataArray) {
      var oMetaModel = oTable && oTable.getModel().getMetaModel(),
        sCurrentEntitySetName = oTable.data("metaPath"),
        aTableFields = MassEditHelper.getTableFields(oTable),
        oEntityTypeContext = oMetaModel.getContext("".concat(sCurrentEntitySetName, "/@")),
        oEntitySetContext = oMetaModel.getContext(sCurrentEntitySetName),
        oDataModelObjectPath = getInvolvedDataModelObjects(oEntityTypeContext);
      var oDataFieldModel = new JSONModel();
      var oResult;
      var sLabelText;
      var bValueHelpEnabled;
      var sUnitPropertyPath;
      var bValueHelpEnabledForUnit;
      var oTextBinding;
      aTableFields.forEach(function (oColumnInfo) {
        var sDataPropertyPath = oColumnInfo.dataProperty;
        if (sDataPropertyPath) {
          var _oDataFieldConverted$, _oDataFieldConverted$2, _oPropertyInfo, _oPropertyInfo$annota, _oPropertyInfo$annota2, _unitPropertyInfo$ann, _unitPropertyInfo$ann2;
          var oPropertyInfo = sDataPropertyPath && oMetaModel.getObject("".concat(sCurrentEntitySetName, "/").concat(sDataPropertyPath, "@"));
          sLabelText = oColumnInfo.label || oPropertyInfo && oPropertyInfo["@com.sap.vocabularies.Common.v1.Label"] || sDataPropertyPath;
          if (oDataModelObjectPath) {
            oDataModelObjectPath.targetObject = oDataModelObjectPath.targetEntityType.entityProperties.filter(function (oProperty) {
              return oProperty.name === sDataPropertyPath;
            });
          }
          oDataModelObjectPath.targetObject = oDataModelObjectPath.targetObject[0] || {};
          oTextBinding = getTextBinding(oDataModelObjectPath, {}, true) || {};
          var oFieldContext = oMetaModel.getContext(oColumnInfo.annotationPath),
            oDataFieldConverted = convertMetaModelContext(oFieldContext),
            oPropertyContext = oMetaModel.getContext("".concat(sCurrentEntitySetName, "/").concat(sDataPropertyPath, "@")),
            oInterface = oPropertyContext && oPropertyContext.getInterface();
          var oDataModelPath = getInvolvedDataModelObjects(oFieldContext, oEntitySetContext);
          if ((oDataFieldConverted === null || oDataFieldConverted === void 0 ? void 0 : (_oDataFieldConverted$ = oDataFieldConverted.Value) === null || _oDataFieldConverted$ === void 0 ? void 0 : (_oDataFieldConverted$2 = _oDataFieldConverted$.path) === null || _oDataFieldConverted$2 === void 0 ? void 0 : _oDataFieldConverted$2.length) > 0) {
            oDataModelPath = enhanceDataModelPath(oDataModelPath, sDataPropertyPath);
          }
          var bHiddenField = MassEditHelper.getHiddenValueForContexts(oFieldContext && oFieldContext.getObject()["@com.sap.vocabularies.UI.v1.Hidden"], aContexts) || false;
          var isImage = oPropertyInfo && oPropertyInfo["@com.sap.vocabularies.UI.v1.IsImageURL"];
          oInterface.context = {
            getModel: function () {
              return oInterface.getModel();
            },
            getPath: function () {
              return "".concat(sCurrentEntitySetName, "/").concat(sDataPropertyPath);
            }
          };
          oPropertyInfo = oDataFieldConverted._type === "Property" ? oDataFieldConverted : oDataFieldConverted && oDataFieldConverted.Value && oDataFieldConverted.Value.$target || oDataFieldConverted && oDataFieldConverted.Target && oDataFieldConverted.Target.$target;
          // Datafield is not included in the FieldControl calculation, needs to be implemented

          var chartProperty = oPropertyInfo && oPropertyInfo.term && oPropertyInfo.term === "com.sap.vocabularies.UI.v1.Chart";
          var isAction = !!oDataFieldConverted.Action;
          var isFieldGrp = MassEditHelper.getIsFieldGrp(oDataFieldConverted);
          if (isImage || bHiddenField || chartProperty || isAction || isFieldGrp) {
            return;
          }

          // ValueHelp properties
          sUnitPropertyPath = (hasCurrency(oPropertyInfo) || hasUnit(oPropertyInfo)) && getAssociatedUnitPropertyPath(oPropertyInfo) || "";
          var unitPropertyInfo = sUnitPropertyPath && getAssociatedUnitProperty(oPropertyInfo);
          bValueHelpEnabled = hasValueHelp(oPropertyInfo);
          bValueHelpEnabledForUnit = unitPropertyInfo && hasValueHelp(unitPropertyInfo);
          var hasContextDependentVH = (bValueHelpEnabled || bValueHelpEnabledForUnit) && (((_oPropertyInfo = oPropertyInfo) === null || _oPropertyInfo === void 0 ? void 0 : (_oPropertyInfo$annota = _oPropertyInfo.annotations) === null || _oPropertyInfo$annota === void 0 ? void 0 : (_oPropertyInfo$annota2 = _oPropertyInfo$annota.Common) === null || _oPropertyInfo$annota2 === void 0 ? void 0 : _oPropertyInfo$annota2.ValueListRelevantQualifiers) || unitPropertyInfo && (unitPropertyInfo === null || unitPropertyInfo === void 0 ? void 0 : (_unitPropertyInfo$ann = unitPropertyInfo.annotations) === null || _unitPropertyInfo$ann === void 0 ? void 0 : (_unitPropertyInfo$ann2 = _unitPropertyInfo$ann.Common) === null || _unitPropertyInfo$ann2 === void 0 ? void 0 : _unitPropertyInfo$ann2.ValueListRelevantQualifiers));
          if (hasContextDependentVH) {
            // context dependent VH is not supported for Mass Edit.
            return;
          }

          // EditMode and InputType
          var propertyForFieldControl = oPropertyInfo && oPropertyInfo.Value ? oPropertyInfo.Value : oPropertyInfo;
          var expBinding = getEditMode(propertyForFieldControl, oDataModelPath, false, false, oDataFieldConverted, constant(true));
          var editModeValues = Object.keys(EditMode);
          var editModeIsStatic = !!expBinding && editModeValues.includes(expBinding);
          var editable = !!expBinding && (editModeIsStatic && expBinding === EditMode.Editable || !editModeIsStatic);
          var navPropertyWithValueHelp = sDataPropertyPath.includes("/") && bValueHelpEnabled;
          if (!editable || navPropertyWithValueHelp) {
            return;
          }
          var inputType = MassEditHelper.getInputType(oPropertyInfo, oDataFieldConverted, oDataModelPath);
          if (inputType) {
            var relativePath = getRelativePaths(oDataModelPath);
            var isReadOnly = isReadOnlyExpression(oPropertyInfo, relativePath);
            var displayMode = CommonUtils.computeDisplayMode(oPropertyContext.getObject());
            var isValueHelpEnabled = bValueHelpEnabled ? bValueHelpEnabled : false;
            var isValueHelpEnabledForUnit = bValueHelpEnabledForUnit && !sUnitPropertyPath.includes("/") ? bValueHelpEnabledForUnit : false;
            var unitProperty = sUnitPropertyPath && !sDataPropertyPath.includes("/") ? sUnitPropertyPath : false;
            oResult = {
              "label": sLabelText,
              "dataProperty": sDataPropertyPath,
              "isValueHelpEnabled": bValueHelpEnabled ? bValueHelpEnabled : false,
              unitProperty: unitProperty,
              "isFieldRequired": getRequiredExpression(oPropertyInfo, oDataFieldConverted, true, false, {}, oDataModelPath),
              "defaultSelectionPath": sDataPropertyPath ? MassEditHelper.getDefaultSelectionPathComboBox(aContexts, sDataPropertyPath) : false,
              "defaultSelectionUnitPath": sUnitPropertyPath ? MassEditHelper.getDefaultSelectionPathComboBox(aContexts, sUnitPropertyPath) : false,
              "entitySet": sCurrentEntitySetName,
              "display": displayMode,
              "descriptionPath": MassEditHelper.getTextPath(sDataPropertyPath, oTextBinding, displayMode),
              "nullable": oPropertyInfo.nullable !== undefined ? oPropertyInfo.nullable : true,
              "isPropertyReadOnly": isReadOnly !== undefined ? isReadOnly : false,
              "inputType": inputType,
              "editMode": editable ? expBinding : undefined,
              "propertyInfo": {
                "hasVH": isValueHelpEnabled,
                "runtimePath": "fieldsInfo>/values/",
                "relativePath": sDataPropertyPath,
                "propertyPathForValueHelp": "".concat(sCurrentEntitySetName, "/").concat(sDataPropertyPath)
              },
              "unitInfo": unitProperty && {
                "hasVH": isValueHelpEnabledForUnit,
                "runtimePath": "fieldsInfo>/unitData/",
                "relativePath": unitProperty,
                "propertyPathForValueHelp": "".concat(sCurrentEntitySetName, "/").concat(unitProperty)
              }
            };
            aDataArray.push(oResult);
          }
        }
      });
      oDataFieldModel.setData(aDataArray);
      return oDataFieldModel;
    },
    getTableFields: function (oTable) {
      var aColumns = oTable && oTable.getColumns() || [];
      var columnsData = oTable && oTable.getParent().getTableDefinition().columns;
      return aColumns.map(function (oColumn) {
        var sDataProperty = oColumn && oColumn.getDataProperty(),
          aRealtedColumnInfo = columnsData && columnsData.filter(function (oColumnInfo) {
            return oColumnInfo.name === sDataProperty && oColumnInfo.type === "Annotation";
          });
        return {
          "dataProperty": sDataProperty,
          "label": oColumn.getHeader(),
          "annotationPath": aRealtedColumnInfo && aRealtedColumnInfo[0] && aRealtedColumnInfo[0].annotationPath
        };
      });
    },
    getDefaultTextsForDialog: function (oResourceBundle, iSelectedContexts, oTable) {
      // The confirm button text is "Save" for table in Display mode and "Apply" for table in edit mode. This can be later exposed if needed.
      var bDisplayMode = oTable.data("displayModePropertyBinding") === "true";
      return {
        "keepExistingPrefix": "< Keep",
        "leaveBlankValue": "< Leave Blank >",
        "clearFieldValue": "< Clear Values >",
        "massEditTitle": oResourceBundle.getText("C_MASS_EDIT_DIALOG_TITLE", iSelectedContexts.toString()),
        "applyButtonText": bDisplayMode ? oResourceBundle.getText("C_MASS_EDIT_SAVE_BUTTON_TEXT") : oResourceBundle.getText("C_MASS_EDIT_APPLY_BUTTON_TEXT"),
        "useValueHelpValue": "< Use Value Help >",
        "cancelButtonText": oResourceBundle.getText("C_COMMON_OBJECT_PAGE_CANCEL"),
        "noFields": oResourceBundle.getText("C_MASS_EDIT_NO_EDITABLE_FIELDS"),
        "okButtonText": oResourceBundle.getText("C_COMMON_DIALOG_OK")
      };
    },
    /**
     * Adds a suffix to the 'keep existing' property of the comboBox.
     *
     * @param sInputType InputType of the field
     * @returns The modified string
     */
    // getSuffixForKeepExisiting: function (sInputType: string) {
    // 	let sResult = "Values";

    // 	switch (sInputType) {
    // 		//TODO - Add for other control types as well (Radio Button, Email, Input, MDC Fields, Image etc.)
    // 		case "DatePicker":
    // 			sResult = "Dates";
    // 			break;
    // 		case "CheckBox":
    // 			sResult = "Settings";
    // 			break;
    // 		default:
    // 			sResult = "Values";
    // 	}
    // 	return sResult;
    // },

    /**
     * Adds default values to the model [Keep Existing Values, Leave Blank].
     *
     * @param aValues Array instance where the default data needs to be added
     * @param oDefaultValues Default values from Application Manifest
     * @param oPropertyInfo Property information
     * @param bUOMField
     */
    setDefaultValuesToDialog: function (aValues, oDefaultValues, oPropertyInfo, bUOMField) {
      var sPropertyPath = bUOMField ? oPropertyInfo.unitProperty : oPropertyInfo.dataProperty,
        sInputType = oPropertyInfo.inputType,
        bPropertyRequired = oPropertyInfo.isFieldRequired;
      // const sSuffixForKeepExisting = MassEditHelper.getSuffixForKeepExisiting(sInputType);
      var sSuffixForKeepExisting = "Values";
      aValues.defaultOptions = aValues.defaultOptions || [];
      var selectOptionsExist = aValues.selectOptions && aValues.selectOptions.length > 0;
      var keepEntry = {
        text: "".concat(oDefaultValues.keepExistingPrefix, " ").concat(sSuffixForKeepExisting, " >"),
        key: "Default/".concat(sPropertyPath)
      };
      if (sInputType === "CheckBox") {
        var falseEntry = {
          text: "No",
          key: "".concat(sPropertyPath, "/false"),
          textInfo: {
            value: false
          }
        };
        var truthyEntry = {
          text: "Yes",
          key: "".concat(sPropertyPath, "/true"),
          textInfo: {
            value: true
          }
        };
        aValues.unshift(falseEntry);
        aValues.defaultOptions.unshift(falseEntry);
        aValues.unshift(truthyEntry);
        aValues.defaultOptions.unshift(truthyEntry);
        aValues.unshift(keepEntry);
        aValues.defaultOptions.unshift(keepEntry);
      } else {
        var _oPropertyInfo$proper, _oPropertyInfo$unitIn;
        if (oPropertyInfo !== null && oPropertyInfo !== void 0 && (_oPropertyInfo$proper = oPropertyInfo.propertyInfo) !== null && _oPropertyInfo$proper !== void 0 && _oPropertyInfo$proper.hasVH || oPropertyInfo !== null && oPropertyInfo !== void 0 && (_oPropertyInfo$unitIn = oPropertyInfo.unitInfo) !== null && _oPropertyInfo$unitIn !== void 0 && _oPropertyInfo$unitIn.hasVH && bUOMField) {
          var vhdEntry = {
            text: oDefaultValues.useValueHelpValue,
            key: "UseValueHelpValue/".concat(sPropertyPath)
          };
          aValues.unshift(vhdEntry);
          aValues.defaultOptions.unshift(vhdEntry);
        }
        if (selectOptionsExist) {
          if (bPropertyRequired !== "true" && !bUOMField) {
            var clearEntry = {
              text: oDefaultValues.clearFieldValue,
              key: "ClearFieldValue/".concat(sPropertyPath)
            };
            aValues.unshift(clearEntry);
            aValues.defaultOptions.unshift(clearEntry);
          }
          aValues.unshift(keepEntry);
          aValues.defaultOptions.unshift(keepEntry);
        } else {
          var emptyEntry = {
            text: oDefaultValues.leaveBlankValue,
            key: "Default/".concat(sPropertyPath)
          };
          aValues.unshift(emptyEntry);
          aValues.defaultOptions.unshift(emptyEntry);
        }
      }
    },
    /**
     * Get text arrangement info for a context property.
     *
     * @param property Property Path
     * @param descriptionPath Path to text association of the property
     * @param displayMode Display mode of the property and text association
     * @param selectedContext Context to find the full text
     * @returns The text arrangement
     */
    getTextArrangementInfo: function (property, descriptionPath, displayMode, selectedContext) {
      var value = selectedContext.getObject(property),
        descriptionValue,
        fullText;
      if (descriptionPath && property) {
        switch (displayMode) {
          case "Description":
            descriptionValue = selectedContext.getObject(descriptionPath) || "";
            fullText = descriptionValue;
            break;
          case "Value":
            value = selectedContext.getObject(property) || "";
            fullText = value;
            break;
          case "ValueDescription":
            value = selectedContext.getObject(property) || "";
            descriptionValue = selectedContext.getObject(descriptionPath) || "";
            fullText = descriptionValue ? "".concat(value, " (").concat(descriptionValue, ")") : value;
            break;
          case "DescriptionValue":
            value = selectedContext.getObject(property) || "";
            descriptionValue = selectedContext.getObject(descriptionPath) || "";
            fullText = descriptionValue ? "".concat(descriptionValue, " (").concat(value, ")") : value;
            break;
          default:
            Log.info("Display Property not applicable: ".concat(property));
            break;
        }
      }
      return {
        "textArrangement": displayMode,
        "valuePath": property,
        "descriptionPath": descriptionPath,
        "value": value,
        "description": descriptionValue,
        "fullText": fullText
      };
    },
    /**
     * Return the visibility valuue for the ManagedObject Any.
     *
     * @param any The ManagedObject Any to be used to calculate the visible value of the binding.
     * @returns Returns true if the mass edit field is editable.
     */
    isEditable: function (any) {
      var binding = any.getBinding("any");
      var value = binding.getExternalValue();
      return value === EditMode.Editable;
    },
    /**
     * Calculate and update the visibility of mass edit field on change of the ManagedObject Any binding.
     *
     * @param oDialogDataModel Model to be used runtime.
     * @param dataProperty Field name.
     */
    onContextEditableChange: function (oDialogDataModel, dataProperty) {
      var objectsForVisibility = oDialogDataModel.getProperty("/values/".concat(dataProperty, "/objectsForVisibility")) || [];
      var editable = objectsForVisibility.some(MassEditHelper.isEditable);
      if (editable) {
        oDialogDataModel.setProperty("/values/".concat(dataProperty, "/visible"), editable);
      }
    },
    /**
     * Update Managed Object Any for visibility of the mass edit fields.
     *
     * @param mOToUse The ManagedObject Any to be used to calculate the visible value of the binding.
     * @param oDialogDataModel Model to be used runtime.
     * @param dataProperty Field name.
     * @param values Values of the field.
     */
    updateOnContextChange: function (mOToUse, oDialogDataModel, dataProperty, values) {
      var binding = mOToUse.getBinding("any");
      values.objectsForVisibility = values.objectsForVisibility || [];
      values.objectsForVisibility.push(mOToUse);
      binding.attachChange(MassEditHelper.onContextEditableChange.bind(null, oDialogDataModel, dataProperty));
    },
    /**
     * Get bound object to calculate the visibility of contexts.
     *
     * @param expBinding Binding String object.
     * @param context Context the binding value.
     * @returns The ManagedObject Any to be used to calculate the visible value of the binding.
     */
    getBoundObject: function (expBinding, context) {
      var mOToUse = new Any({
        any: expBinding
      });
      var model = context.getModel();
      mOToUse.setModel(model);
      mOToUse.setBindingContext(context);
      return mOToUse;
    },
    /**
     * Get the visibility of the field.
     *
     * @param expBinding Binding String object.
     * @param oDialogDataModel Model to be used runtime.
     * @param dataProperty Field name.
     * @param values Values of the field.
     * @param context Context the binding value.
     * @returns Returns true if the mass edit field is editable.
     */
    getFieldVisiblity: function (expBinding, oDialogDataModel, dataProperty, values, context) {
      var mOToUse = MassEditHelper.getBoundObject(expBinding, context);
      var isContextEditable = MassEditHelper.isEditable(mOToUse);
      if (!isContextEditable) {
        MassEditHelper.updateOnContextChange(mOToUse, oDialogDataModel, dataProperty, values);
      }
      return isContextEditable;
    },
    /**
     * Initializes a runtime model:
     * => The model consists of values shown in the comboBox of the dialog (Leave Blank, Keep Existing Values, or any property value for the selected context, etc.)
     * => The model will capture runtime changes in the results property (the value entered in the comboBox).
     *
     * @param aContexts Contexts for mass edit
     * @param aDataArray Array containing data related to the dialog used by both the static and the runtime model
     * @param oDefaultValues Default values from i18n
     * @param dialogContext Transient context for mass edit dialog.
     * @returns The runtime model
     */
    setRuntimeModelOnDialog: function (aContexts, aDataArray, oDefaultValues, dialogContext) {
      var aValues = [];
      var aUnitData = [];
      var aResults = [];
      var textPaths = [];
      var aReadOnlyFieldInfo = [];
      var oData = {
        "values": aValues,
        "unitData": aUnitData,
        "results": aResults,
        "readablePropertyData": aReadOnlyFieldInfo,
        "selectedKey": undefined,
        "textPaths": textPaths,
        "noFields": oDefaultValues.noFields
      };
      var oDialogDataModel = new JSONModel(oData);
      aDataArray.forEach(function (oInData) {
        var oTextInfo;
        var sPropertyKey;
        var sUnitPropertyName;
        var oDistinctValueMap = {};
        var oDistinctUnitMap = {};
        if (oInData.dataProperty && oInData.dataProperty.indexOf("/") > -1) {
          var aFinalPath = MassEditHelper.initLastLevelOfPropertyPath(oInData.dataProperty, aValues /*, dialogContext */);
          var aPropertyPaths = oInData.dataProperty.split("/");
          var _iterator = _createForOfIteratorHelper(aContexts),
            _step;
          try {
            for (_iterator.s(); !(_step = _iterator.n()).done;) {
              var context = _step.value;
              var sMultiLevelPathValue = context.getObject(oInData.dataProperty);
              sPropertyKey = "".concat(oInData.dataProperty, "/").concat(sMultiLevelPathValue);
              if (!oDistinctValueMap[sPropertyKey] && aFinalPath[aPropertyPaths[aPropertyPaths.length - 1]]) {
                oTextInfo = MassEditHelper.getTextArrangementInfo(oInData.dataProperty, oInData.descriptionPath, oInData.display, context);
                aFinalPath[aPropertyPaths[aPropertyPaths.length - 1]].push({
                  "text": oTextInfo && oTextInfo.fullText || sMultiLevelPathValue,
                  "key": sPropertyKey,
                  "textInfo": oTextInfo
                });
                oDistinctValueMap[sPropertyKey] = sMultiLevelPathValue;
              }
            }
            // if (Object.keys(oDistinctValueMap).length === 1) {
            // 	dialogContext.setProperty(oData.dataProperty, sPropertyKey && oDistinctValueMap[sPropertyKey]);
            // }
          } catch (err) {
            _iterator.e(err);
          } finally {
            _iterator.f();
          }
          aFinalPath[aPropertyPaths[aPropertyPaths.length - 1]].textInfo = {
            descriptionPath: oInData.descriptionPath,
            valuePath: oInData.dataProperty,
            displayMode: oInData.display
          };
        } else {
          aValues[oInData.dataProperty] = aValues[oInData.dataProperty] || [];
          aValues[oInData.dataProperty]["selectOptions"] = aValues[oInData.dataProperty]["selectOptions"] || [];
          if (oInData.unitProperty) {
            aUnitData[oInData.unitProperty] = aUnitData[oInData.unitProperty] || [];
            aUnitData[oInData.unitProperty]["selectOptions"] = aUnitData[oInData.unitProperty]["selectOptions"] || [];
          }
          var _iterator2 = _createForOfIteratorHelper(aContexts),
            _step2;
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var _context = _step2.value;
              var oDataObject = _context.getObject();
              sPropertyKey = "".concat(oInData.dataProperty, "/").concat(oDataObject[oInData.dataProperty]);
              if (oInData.dataProperty && oDataObject[oInData.dataProperty] && !oDistinctValueMap[sPropertyKey]) {
                if (oInData.inputType != "CheckBox") {
                  oTextInfo = MassEditHelper.getTextArrangementInfo(oInData.dataProperty, oInData.descriptionPath, oInData.display, _context);
                  var entry = {
                    "text": oTextInfo && oTextInfo.fullText || oDataObject[oInData.dataProperty],
                    "key": sPropertyKey,
                    "textInfo": oTextInfo
                  };
                  aValues[oInData.dataProperty].push(entry);
                  aValues[oInData.dataProperty]["selectOptions"].push(entry);
                }
                oDistinctValueMap[sPropertyKey] = oDataObject[oInData.dataProperty];
              }
              if (oInData.unitProperty && oDataObject[oInData.unitProperty]) {
                sUnitPropertyName = "".concat(oInData.unitProperty, "/").concat(oDataObject[oInData.unitProperty]);
                if (!oDistinctUnitMap[sUnitPropertyName]) {
                  if (oInData.inputType != "CheckBox") {
                    oTextInfo = MassEditHelper.getTextArrangementInfo(oInData.unitProperty, oInData.descriptionPath, oInData.display, _context);
                    var unitEntry = {
                      "text": oTextInfo && oTextInfo.fullText || oDataObject[oInData.unitProperty],
                      "key": sUnitPropertyName,
                      "textInfo": oTextInfo
                    };
                    aUnitData[oInData.unitProperty].push(unitEntry);
                    aUnitData[oInData.unitProperty]["selectOptions"].push(unitEntry);
                  }
                  oDistinctUnitMap[sUnitPropertyName] = oDataObject[oInData.unitProperty];
                }
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          aValues[oInData.dataProperty].textInfo = {
            descriptionPath: oInData.descriptionPath,
            valuePath: oInData.dataProperty,
            displayMode: oInData.display
          };
          if (Object.keys(oDistinctValueMap).length === 1) {
            dialogContext.setProperty(oInData.dataProperty, sPropertyKey && oDistinctValueMap[sPropertyKey]);
          }
          if (Object.keys(oDistinctUnitMap).length === 1) {
            dialogContext.setProperty(oInData.unitProperty, sUnitPropertyName && oDistinctUnitMap[sUnitPropertyName]);
          }
        }
        textPaths[oInData.dataProperty] = oInData.descriptionPath ? [oInData.descriptionPath] : [];
      });
      aDataArray.forEach(function (oInData) {
        var values = {};
        if (oInData.dataProperty.indexOf("/") > -1) {
          var sMultiLevelPropPathValue = MassEditHelper.getValueForMultiLevelPath(oInData.dataProperty, aValues);
          if (!sMultiLevelPropPathValue) {
            sMultiLevelPropPathValue.push({
              text: oDefaultValues.leaveBlankValue,
              key: "Empty/".concat(oInData.dataProperty)
            });
          } else {
            MassEditHelper.setDefaultValuesToDialog(sMultiLevelPropPathValue, oDefaultValues, oInData);
          }
          values = sMultiLevelPropPathValue;
        } else if (aValues[oInData.dataProperty]) {
          aValues[oInData.dataProperty] = aValues[oInData.dataProperty] || [];
          MassEditHelper.setDefaultValuesToDialog(aValues[oInData.dataProperty], oDefaultValues, oInData);
          values = aValues[oInData.dataProperty];
        }
        if (aUnitData[oInData.unitProperty] && aUnitData[oInData.unitProperty].length) {
          MassEditHelper.setDefaultValuesToDialog(aUnitData[oInData.unitProperty], oDefaultValues, oInData, true);
          aUnitData[oInData.unitProperty].textInfo = {};
          aUnitData[oInData.unitProperty].selectedKey = MassEditHelper.getDefaultSelectionPathComboBox(aContexts, oInData.unitProperty);
          aUnitData[oInData.unitProperty].inputType = oInData.inputType;
        } else if (oInData.dataProperty && aValues[oInData.dataProperty] && !aValues[oInData.dataProperty].length || oInData.unitProperty && aUnitData[oInData.unitProperty] && !aUnitData[oInData.unitProperty].length) {
          var bClearFieldOrBlankValueExists = aValues[oInData.dataProperty] && aValues[oInData.dataProperty].some(function (obj) {
            return obj.text === "< Clear Values >" || obj.text === "< Leave Blank >";
          });
          if (oInData.dataProperty && !bClearFieldOrBlankValueExists) {
            aValues[oInData.dataProperty].push({
              text: oDefaultValues.leaveBlankValue,
              key: "Empty/".concat(oInData.dataProperty)
            });
          }
          var bClearFieldOrBlankUnitValueExists = aUnitData[oInData.unitProperty] && aUnitData[oInData.unitProperty].some(function (obj) {
            return obj.text === "< Clear Values >" || obj.text === "< Leave Blank >";
          });
          if (oInData.unitProperty) {
            if (!bClearFieldOrBlankUnitValueExists) {
              aUnitData[oInData.unitProperty].push({
                text: oDefaultValues.leaveBlankValue,
                key: "Empty/".concat(oInData.unitProperty)
              });
            }
            aUnitData[oInData.unitProperty].textInfo = {};
            aUnitData[oInData.unitProperty].selectedKey = MassEditHelper.getDefaultSelectionPathComboBox(aContexts, oInData.unitProperty);
            aUnitData[oInData.unitProperty].inputType = oInData.inputType;
          }
        }
        if (oInData.isPropertyReadOnly && typeof oInData.isPropertyReadOnly === "boolean") {
          aReadOnlyFieldInfo.push({
            "property": oInData.dataProperty,
            value: oInData.isPropertyReadOnly,
            type: "Default"
          });
        } else if (oInData.isPropertyReadOnly && oInData.isPropertyReadOnly.operands && oInData.isPropertyReadOnly.operands[0] && oInData.isPropertyReadOnly.operands[0].operand1 && oInData.isPropertyReadOnly.operands[0].operand2) {
          // This needs to be refactored in accordance with the ReadOnlyExpression change
          aReadOnlyFieldInfo.push({
            "property": oInData.dataProperty,
            propertyPath: oInData.isPropertyReadOnly.operands[0].operand1.path,
            propertyValue: oInData.isPropertyReadOnly.operands[0].operand2.value,
            type: "Path"
          });
        }

        // Setting visbility of the mass edit field.
        if (oInData.editMode) {
          values.visible = oInData.editMode === EditMode.Editable || aContexts.some(MassEditHelper.getFieldVisiblity.bind(MassEditHelper, oInData.editMode, oDialogDataModel, oInData.dataProperty, values));
        } else {
          values.visible = true;
        }
        values.selectedKey = MassEditHelper.getDefaultSelectionPathComboBox(aContexts, oInData.dataProperty);
        values.inputType = oInData.inputType;
        values.unitProperty = oInData.unitProperty;
      });
      return oDialogDataModel;
    },
    /**
     * Gets transient context for dialog.
     *
     * @param table Instance of Table.
     * @param dialog Mass Edit Dialog.
     * @returns Promise returning instance of dialog.
     */
    getDialogContext: function (table, dialog) {
      var transCtx = dialog && dialog.getBindingContext();
      if (!transCtx) {
        var model = table.getModel();
        var listBinding = table.getRowBinding();
        var transientListBinding = model.bindList(listBinding.getPath(), listBinding.getContext(), [], [], {
          $$updateGroupId: "submitLater"
        });
        transientListBinding.refreshInternal = function () {
          /* */
        };
        transCtx = transientListBinding.create({}, true);
      }
      return transCtx;
    },
    onDialogOpen: function (event) {
      var source = event.getSource();
      var fieldsInfoModel = source.getModel("fieldsInfo");
      fieldsInfoModel.setProperty("/isOpen", true);
    },
    closeDialog: function (oDialog) {
      oDialog.close();
      oDialog.destroy();
    },
    messageHandlingForMassEdit: function (oTable, aContexts, oController, oInDialog, aResults, errorContexts) {
      try {
        var _oController$getView, _oController$getView$, _oController$getView4, _oController$getView5;
        var DraftStatus = FELibrary.DraftStatus;
        var oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
        (_oController$getView = oController.getView()) === null || _oController$getView === void 0 ? void 0 : (_oController$getView$ = _oController$getView.getBindingContext("internal")) === null || _oController$getView$ === void 0 ? void 0 : _oController$getView$.setProperty("getBoundMessagesForMassEdit", true);
        oController._editFlow.getMessageHandler().showMessages({
          onBeforeShowMessage: function (messages, showMessageParameters) {
            //messages.concatenate(messageHandling.getMessages(true, true));
            showMessageParameters.fnGetMessageSubtitle = messageHandling.setMessageSubtitle.bind({}, oTable, aContexts);
            var unboundErrors = [];
            messages.forEach(function (message) {
              if (!message.getTarget()) {
                unboundErrors.push(message);
              }
            });
            if (aResults.length > 0 && errorContexts.length === 0) {
              oController._editFlow.setDraftStatus(DraftStatus.Saved);
              var successToast = oResourceBundle.getText("C_MASS_EDIT_SUCCESS_TOAST");
              MessageToast.show(successToast);
            } else if (errorContexts.length < oTable.getSelectedContexts().length) {
              oController._editFlow.setDraftStatus(DraftStatus.Saved);
            } else if (errorContexts.length === oTable.getSelectedContexts().length) {
              oController._editFlow.setDraftStatus(DraftStatus.Clear);
            }
            if (oController.getModel("ui").getProperty("/isEditable") && unboundErrors.length === 0) {
              showMessageParameters.showMessageBox = false;
              showMessageParameters.showMessageDialog = false;
            }
            return showMessageParameters;
          }
        });
        if (oInDialog.isOpen()) {
          var _oController$getView2, _oController$getView3;
          MassEditHelper.closeDialog(oInDialog);
          (_oController$getView2 = oController.getView()) === null || _oController$getView2 === void 0 ? void 0 : (_oController$getView3 = _oController$getView2.getBindingContext("internal")) === null || _oController$getView3 === void 0 ? void 0 : _oController$getView3.setProperty("skipPatchHandlers", false);
        }
        (_oController$getView4 = oController.getView()) === null || _oController$getView4 === void 0 ? void 0 : (_oController$getView5 = _oController$getView4.getBindingContext("internal")) === null || _oController$getView5 === void 0 ? void 0 : _oController$getView5.setProperty("getBoundMessagesForMassEdit", false);
        return Promise.resolve();
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * This function generates side effects map from side effects ids(which is a combination of entity type and qualifier).
     *
     * @param oEntitySetContext
     * @param aSideEffects
     * @param oController
     * @param aResults
     * @returns Side effect map with data.
     */
    getSideEffectDataForKey: function (oEntitySetContext, aSideEffects, oController, aResults) {
      var sOwnerEntityType = oEntitySetContext.getProperty("$Type");
      var baseSideEffectsMapArray = {};
      aResults.forEach(function (result) {
        var sPath = result.keyValue;
        var sideEffectsArray = FieldHelper.getSideEffectsOnEntityAndProperty(sPath, sOwnerEntityType, aSideEffects);
        baseSideEffectsMapArray[sPath] = oController._sideEffects.generateSideEffectsMapFromSideEffectId(sideEffectsArray);
      });
      return baseSideEffectsMapArray;
    },
    /**
     * Give the entity type for a given spath for e.g.RequestedQuantity.
     *
     * @param sPath
     * @param sEntityType
     * @param oMetaModel
     * @returns Object having entity, spath and navigation path.
     */
    fnGetPathForSourceProperty: function (sPath, sEntityType, oMetaModel) {
      // if the property path has a navigation, get the target entity type of the navigation
      var sNavigationPath = sPath.indexOf("/") > 0 ? "/" + sEntityType + "/" + sPath.substr(0, sPath.lastIndexOf("/") + 1) + "@sapui.name" : false,
        pOwnerEntity = !sNavigationPath ? Promise.resolve(sEntityType) : oMetaModel.requestObject(sNavigationPath);
      sPath = sNavigationPath ? sPath.substr(sPath.lastIndexOf("/") + 1) : sPath;
      return {
        sPath: sPath,
        pOwnerEntity: pOwnerEntity,
        sNavigationPath: sNavigationPath
      };
    },
    fnGetEntityTypeOfOwner: function (oMetaModel, baseNavPath, oEntitySetContext, targetEntity, aTargets) {
      var ownerEntityType = oEntitySetContext.getProperty("$Type");
      var _oMetaModel$getObject = oMetaModel.getObject("".concat(oEntitySetContext, "/").concat(baseNavPath)),
        pOwner = _oMetaModel$getObject["$Type"],
        ownerNavPath = _oMetaModel$getObject["$Partner"]; // nav path
      if (ownerNavPath) {
        var entityObjOfOwnerPartner = oMetaModel.getObject("/".concat(pOwner, "/").concat(ownerNavPath));
        if (entityObjOfOwnerPartner) {
          var entityTypeOfOwnerPartner = entityObjOfOwnerPartner["$Type"];
          // if the entity types defer, then base nav path is not from owner
          if (entityTypeOfOwnerPartner !== ownerEntityType) {
            // if target Prop is not from owner, we add it as immediate
            aTargets.push(targetEntity);
          }
        }
      } else {
        // if there is no $Partner attribute, it may not be from owner
        aTargets.push(targetEntity);
      }
      return aTargets;
    },
    /**
     * Give targets that are immediate or deferred based on the entity type of that target.
     *
     *
     * @param sideEffectsData
     * @param oEntitySetContext
     * @param sEntityType
     * @param oMetaModel
     * @returns Targets to request side effects.
     */
    fnGetTargetsForMassEdit: function (sideEffectsData, oEntitySetContext, sEntityType, oMetaModel) {
      var aTargetProperties = sideEffectsData.TargetProperties,
        aTargetEntities = sideEffectsData.TargetEntities;
      var aPromises = [];
      var aTargets = [];
      var ownerEntityType = oEntitySetContext.getProperty("$Type");
      if (sEntityType === ownerEntityType) {
        // if SalesOrdr Item
        aTargetEntities === null || aTargetEntities === void 0 ? void 0 : aTargetEntities.forEach(function (targetEntity) {
          targetEntity = targetEntity["$NavigationPropertyPath"];
          var baseNavPath;
          if (targetEntity.includes("/")) {
            baseNavPath = targetEntity.split("/")[0];
          } else {
            baseNavPath = targetEntity;
          }
          aTargets = MassEditHelper.fnGetEntityTypeOfOwner(oMetaModel, baseNavPath, oEntitySetContext, targetEntity, aTargets);
        });
      }
      if (aTargetProperties.length) {
        aTargetProperties.forEach(function (targetProp) {
          var _MassEditHelper$fnGet = MassEditHelper.fnGetPathForSourceProperty(targetProp, sEntityType, oMetaModel),
            pOwnerEntity = _MassEditHelper$fnGet.pOwnerEntity;
          aPromises.push(pOwnerEntity.then(function (resultEntity) {
            // if entity is SalesOrderItem, Target Property is from Items table
            if (resultEntity === ownerEntityType) {
              aTargets.push(targetProp); // get immediate targets
            } else if (targetProp.includes("/")) {
              var baseNavPath = targetProp.split("/")[0];
              aTargets = MassEditHelper.fnGetEntityTypeOfOwner(oMetaModel, baseNavPath, oEntitySetContext, targetProp, aTargets);
            }
            return Promise.resolve(aTargets);
          }));
        });
      } else {
        aPromises.push(Promise.resolve(aTargets));
      }
      return Promise.all(aPromises);
    },
    /**
     * Upon updating the field, array of immediate and deferred side effects for that field are created.
     * If there are any failed side effects for that context, they will also be used to generate the map.
     * If the field has text associated with it, then add it to request side effects.
     *
     * @param mParams
     * @param mParams.oController Controller
     * @param mParams.oFieldPromise Promise to update field
     * @param mParams.sideEffectMap SideEffectsMap for the field
     * @param mParams.textPaths TextPaths of the field if any
     * @param mParams.groupId Group Id to used to group requests
     * @param mParams.key KeyValue of the field
     * @param mParams.oEntitySetContext EntitySetcontext
     * @param mParams.oMetaModel Metamodel data
     * @param mParams.selectedContext Selected row context
     * @param mParams.deferredTargetsForAQualifiedName Deferred targets data
     * @returns Promise for all immediately requested side effects.
     */
    handleMassEditFieldUpdateAndRequestSideEffects: function (mParams) {
      try {
        var _ret = function () {
          var oController = mParams.oController,
            oFieldPromise = mParams.oFieldPromise,
            sideEffectsMap = mParams.sideEffectsMap,
            textPaths = mParams.textPaths,
            groupId = mParams.groupId,
            key = mParams.key,
            oEntitySetContext = mParams.oEntitySetContext,
            oMetaModel = mParams.oMetaModel,
            oSelectedContext = mParams.oSelectedContext,
            deferredTargetsForAQualifiedName = mParams.deferredTargetsForAQualifiedName;
          var immediateSideEffectsPromises = [oFieldPromise];
          var ownerEntityType = oEntitySetContext.getProperty("$Type");
          var oAppComponent = CommonUtils.getAppComponent(oController.getView());
          var oSideEffectsService = oAppComponent.getSideEffectsService();
          if (sideEffectsMap) {
            var allEntityTypesWithQualifier = Object.keys(sideEffectsMap);
            var sideEffectsDataForField = Object.values(sideEffectsMap);
            var mVisitedSideEffects = {};
            deferredTargetsForAQualifiedName[key] = {};
            var _iterator3 = _createForOfIteratorHelper(sideEffectsDataForField.entries()),
              _step3;
            try {
              var _loop = function () {
                var _step3$value = _slicedToArray(_step3.value, 2),
                  index = _step3$value[0],
                  data = _step3$value[1];
                var entityTypeWithQualifier = allEntityTypesWithQualifier[index];
                var sEntityType = entityTypeWithQualifier.split("#")[0];
                var oContext = oController._sideEffects.getContextForSideEffects(oSelectedContext, sEntityType);
                data.context = oContext;
                var allFailedSideEffects = oController._sideEffects.getRegisteredFailedRequests();
                var aFailedSideEffects = allFailedSideEffects[oContext.getPath()];
                oController._sideEffects.deleteFailedRequestsForAContext(oContext);
                var sideEffectsForCurrentContext = [data.sideEffects];
                sideEffectsForCurrentContext = aFailedSideEffects && aFailedSideEffects.length ? sideEffectsForCurrentContext.concat(aFailedSideEffects) : sideEffectsForCurrentContext;
                mVisitedSideEffects[oContext] = {};
                var _iterator4 = _createForOfIteratorHelper(sideEffectsForCurrentContext),
                  _step4;
                try {
                  for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                    var aSideEffect = _step4.value;
                    if (!mVisitedSideEffects[oContext].hasOwnProperty(aSideEffect.fullyQualifiedName)) {
                      (function () {
                        mVisitedSideEffects[oContext][aSideEffect.fullyQualifiedName] = true;
                        var aImmediateTargets = [],
                          allTargets = [],
                          triggerActionName = void 0;
                        var fnGetImmediateTargetsAndActions = function (mSideEffect) {
                          try {
                            var aTargetProperties = mSideEffect.TargetProperties,
                              aTargetEntities = mSideEffect.TargetEntities;
                            var sideEffectEntityType = mSideEffect.fullyQualifiedName.split("@")[0];
                            return Promise.resolve(MassEditHelper.fnGetTargetsForMassEdit(mSideEffect, oEntitySetContext, sideEffectEntityType, oMetaModel)).then(function (targetsArrayForAllProperties) {
                              aImmediateTargets = targetsArrayForAllProperties[0];
                              allTargets = (aTargetProperties || []).concat(aTargetEntities || []);
                              var actionName = mSideEffect.TriggerAction;
                              var aDeferredTargets = allTargets.filter(function (target) {
                                return !aImmediateTargets.includes(target);
                              });
                              deferredTargetsForAQualifiedName[key][mSideEffect.fullyQualifiedName] = {
                                aTargets: aDeferredTargets,
                                oContext: oContext,
                                mSideEffect: mSideEffect
                              };

                              // if entity is other than items table then action is defered
                              if (actionName && sideEffectEntityType === ownerEntityType) {
                                // static action is on collection, so we defer it, else add to immediate requests array
                                var isStaticAction = TableHelper._isStaticAction(oMetaModel.getObject("/".concat(actionName)), actionName);
                                if (!isStaticAction) {
                                  triggerActionName = actionName;
                                } else {
                                  deferredTargetsForAQualifiedName[key][mSideEffect.fullyQualifiedName]["TriggerAction"] = actionName;
                                }
                              } else {
                                deferredTargetsForAQualifiedName[key][mSideEffect.fullyQualifiedName]["TriggerAction"] = actionName;
                              }
                              return {
                                aTargets: aImmediateTargets,
                                TriggerAction: triggerActionName
                              };
                            });
                          } catch (e) {
                            return Promise.reject(e);
                          }
                        };
                        immediateSideEffectsPromises.push(oController._sideEffects.requestSideEffects(aSideEffect, oContext, groupId, fnGetImmediateTargetsAndActions));
                      })();
                    }
                  }
                } catch (err) {
                  _iterator4.e(err);
                } finally {
                  _iterator4.f();
                }
              };
              for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
                _loop();
              }
            } catch (err) {
              _iterator3.e(err);
            } finally {
              _iterator3.f();
            }
          }
          if (textPaths !== null && textPaths !== void 0 && textPaths[key] && textPaths[key].length) {
            immediateSideEffectsPromises.push(oSideEffectsService.requestSideEffects(textPaths[key], oSelectedContext, groupId));
          }
          return {
            v: Promise.resolve(Promise.allSettled(immediateSideEffectsPromises))
          };
        }();
        if (typeof _ret === "object") return _ret.v;
      } catch (e) {
        return Promise.reject(e);
      }
    },
    /**
     * Create the mass edit dialog.
     *
     * @param oTable Instance of Table
     * @param aContexts Contexts for mass edit
     * @param oController Controller for the view
     * @returns Promise returning instance of dialog.
     */
    createDialog: function (oTable, aContexts, oController) {
      try {
        var sFragmentName = "sap/fe/core/controls/massEdit/MassEditDialog",
          aDataArray = [],
          oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
          oDefaultValues = MassEditHelper.getDefaultTextsForDialog(oResourceBundle, aContexts.length, oTable),
          oDataFieldModel = MassEditHelper.prepareDataForDialog(oTable, aContexts, aDataArray),
          dialogContext = MassEditHelper.getDialogContext(oTable),
          oDialogDataModel = MassEditHelper.setRuntimeModelOnDialog(aContexts, aDataArray, oDefaultValues, dialogContext),
          model = oTable.getModel(),
          metaModel = model.getMetaModel(),
          itemsModel = new TemplateModel(oDataFieldModel.getData(), metaModel);
        var oFragment = XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment");
        return Promise.resolve(Promise.resolve(XMLPreprocessor.process(oFragment, {
          name: sFragmentName
        }, {
          bindingContexts: {
            dataFieldModel: itemsModel.createBindingContext("/"),
            metaModel: metaModel.createBindingContext("/")
          },
          models: {
            dataFieldModel: itemsModel,
            metaModel: metaModel
          }
        }))).then(function (oCreatedFragment) {
          return Promise.resolve(Fragment.load({
            definition: oCreatedFragment
          })).then(function (oDialogContent) {
            var oDialog = new Dialog({
              resizable: true,
              title: oDefaultValues.massEditTitle,
              content: [oDialogContent],
              afterOpen: MassEditHelper.onDialogOpen,
              beginButton: new Button({
                text: MassEditHelper.helpers.getExpBindingForApplyButtonTxt(oDefaultValues, oDataFieldModel.getObject("/")),
                type: "Emphasized",
                press: function (oEvent) {
                  try {
                    var _oController$getView6, _oController$getView7;
                    messageHandling.removeBoundTransitionMessages();
                    messageHandling.removeUnboundTransitionMessages();
                    (_oController$getView6 = oController.getView()) === null || _oController$getView6 === void 0 ? void 0 : (_oController$getView7 = _oController$getView6.getBindingContext("internal")) === null || _oController$getView7 === void 0 ? void 0 : _oController$getView7.setProperty("skipPatchHandlers", true);
                    var oInDialog = oEvent.getSource().getParent();
                    var oModel = oInDialog.getModel("fieldsInfo");
                    var aResults = oModel.getProperty("/results");
                    var oMetaModel = oTable && oTable.getModel().getMetaModel(),
                      sCurrentEntitySetName = oTable.data("metaPath"),
                      oEntitySetContext = oMetaModel.getContext(sCurrentEntitySetName);
                    return Promise.resolve(SideEffectsHelper.generateSideEffectsMapFromMetaModel(oMetaModel)).then(function (aSideEffects) {
                      var errorContexts = [];
                      var textPaths = oModel.getProperty("/textPaths");
                      var aPropertyReadableInfo = oModel.getProperty("/readablePropertyData");
                      var groupId;
                      var allSideEffects;
                      var massEditPromises = [];
                      var failedFieldsData = {};
                      var selectedRowsLength = aContexts.length;
                      var deferredTargetsForAQualifiedName = {};
                      var baseSideEffectsMapArray = MassEditHelper.getSideEffectDataForKey(oEntitySetContext, aSideEffects, oController, aResults);
                      //const changePromise: any[] = [];
                      //let bReadOnlyField = false;
                      //const errorContexts: object[] = [];

                      aContexts.forEach(function (oSelectedContext, idx) {
                        allSideEffects = [];
                        aResults.forEach(function (oResult) {
                          try {
                            if (!failedFieldsData.hasOwnProperty(oResult.keyValue)) {
                              failedFieldsData[oResult.keyValue] = 0;
                            }
                            //TODO - Add save implementation for Value Help.
                            if (baseSideEffectsMapArray[oResult.keyValue]) {
                              allSideEffects[oResult.keyValue] = baseSideEffectsMapArray[oResult.keyValue];
                            }
                            if (aPropertyReadableInfo) {
                              aPropertyReadableInfo.some(function (oPropertyInfo) {
                                if (oResult.keyValue === oPropertyInfo.property) {
                                  if (oPropertyInfo.type === "Default") {
                                    return oPropertyInfo.value === true;
                                  } else if (oPropertyInfo.type === "Path" && oPropertyInfo.propertyValue && oPropertyInfo.propertyPath) {
                                    return oSelectedContext.getObject(oPropertyInfo.propertyPath) === oPropertyInfo.propertyValue;
                                  }
                                }
                              });
                            }
                            groupId = "$auto.".concat(idx);
                            var oFieldPromise = oSelectedContext.setProperty(oResult.keyValue, oResult.value, groupId).catch(function (oError) {
                              errorContexts.push(oSelectedContext.getObject());
                              Log.error("Mass Edit: Something went wrong in updating entries.", oError);
                              failedFieldsData[oResult.keyValue] = failedFieldsData[oResult.keyValue] + 1;
                              return Promise.reject({
                                isFieldUpdateFailed: true
                              });
                            });
                            var dataToUpdateFieldAndSideEffects = {
                              oController: oController,
                              oFieldPromise: oFieldPromise,
                              sideEffectsMap: baseSideEffectsMapArray[oResult.keyValue],
                              textPaths: textPaths,
                              groupId: groupId,
                              key: oResult.keyValue,
                              oEntitySetContext: oEntitySetContext,
                              oMetaModel: oMetaModel,
                              oSelectedContext: oSelectedContext,
                              deferredTargetsForAQualifiedName: deferredTargetsForAQualifiedName
                            };
                            massEditPromises.push(MassEditHelper.handleMassEditFieldUpdateAndRequestSideEffects(dataToUpdateFieldAndSideEffects));
                            return Promise.resolve();
                          } catch (e) {
                            return Promise.reject(e);
                          }
                        });
                      });
                      return Promise.resolve(Promise.allSettled(massEditPromises).then(function () {
                        try {
                          groupId = "$auto.massEditDeferred";
                          var deferredRequests = [];
                          var sideEffectsDataForAllKeys = Object.values(deferredTargetsForAQualifiedName);
                          var keysWithSideEffects = Object.keys(deferredTargetsForAQualifiedName);
                          sideEffectsDataForAllKeys.forEach(function (aSideEffect, index) {
                            var currentKey = keysWithSideEffects[index];
                            if (failedFieldsData[currentKey] !== selectedRowsLength) {
                              var deferredSideEffectsData = Object.values(aSideEffect);
                              deferredSideEffectsData.forEach(function (req) {
                                var aTargets = req.aTargets,
                                  oContext = req.oContext,
                                  TriggerAction = req.TriggerAction,
                                  mSideEffect = req.mSideEffect;
                                var fnGetDeferredTargets = function () {
                                  return aTargets;
                                };
                                var fnGetDeferredTargetsAndActions = function () {
                                  return {
                                    aTargets: fnGetDeferredTargets(),
                                    TriggerAction: TriggerAction
                                  };
                                };
                                deferredRequests.push(
                                // if some deferred is rejected, it will be add to failed queue
                                oController._sideEffects.requestSideEffects(mSideEffect, oContext, groupId, fnGetDeferredTargetsAndActions));
                              });
                            }
                          });
                          return Promise.resolve();
                        } catch (e) {
                          return Promise.reject(e);
                        }
                      }).then(function () {
                        MassEditHelper.messageHandlingForMassEdit(oTable, aContexts, oController, oInDialog, aResults, errorContexts);
                      }).catch(function (e) {
                        MassEditHelper.closeDialog(oDialog);
                        return Promise.reject(e);
                      })).then(function () {});
                    });
                  } catch (e) {
                    return Promise.reject(e);
                  }
                }
              }),
              endButton: new Button({
                text: oDefaultValues.cancelButtonText,
                visible: MassEditHelper.helpers.hasEditableFieldsBinding(oDataFieldModel.getObject("/"), true),
                press: function (oEvent) {
                  var oInDialog = oEvent.getSource().getParent();
                  MassEditHelper.closeDialog(oInDialog);
                }
              })
            });
            oDialog.setModel(oDialogDataModel, "fieldsInfo");
            oDialog.setModel(model);
            oDialog.setBindingContext(dialogContext);
            return oDialog;
          });
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    helpers: {
      getBindingExpForHasEditableFields: function (fields, editable) {
        var totalExp = fields.reduce(function (expression, field) {
          return or(expression, pathInModel("/values/" + field.dataProperty + "/visible", "fieldsInfo"));
        }, constant(false));
        return editable ? totalExp : not(totalExp);
      },
      getExpBindingForApplyButtonTxt: function (defaultValues, fields) {
        var editableExp = MassEditHelper.helpers.getBindingExpForHasEditableFields(fields, true);
        var totalExp = ifElse(editableExp, constant(defaultValues.applyButtonText), constant(defaultValues.okButtonText));
        return compileExpression(totalExp);
      },
      hasEditableFieldsBinding: function (fields, editable) {
        return compileExpression(MassEditHelper.helpers.getBindingExpForHasEditableFields(fields, editable));
      }
    }
  };
  return MassEditHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXNzRWRpdEhlbHBlciIsImluaXRMYXN0TGV2ZWxPZlByb3BlcnR5UGF0aCIsInNQYXRoIiwiYVZhbHVlcyIsImFGaW5hbFBhdGgiLCJpbmRleCIsImFQYXRocyIsInNwbGl0Iiwic0Z1bGxQYXRoIiwiZm9yRWFjaCIsInNQcm9wZXJ0eVBhdGgiLCJnZXRVbmlxdWVWYWx1ZXMiLCJzVmFsdWUiLCJzZWxmIiwidW5kZWZpbmVkIiwiaW5kZXhPZiIsImdldFZhbHVlRm9yTXVsdGlMZXZlbFBhdGgiLCJzRGF0YVByb3BlcnR5UGF0aCIsIm9WYWx1ZXMiLCJhUHJvcGVydHlQYXRocyIsIlJlc3VsdCIsImdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3giLCJhQ29udGV4dHMiLCJsZW5ndGgiLCJvU2VsZWN0ZWRDb250ZXh0IiwiYVByb3BlcnR5VmFsdWVzIiwib0NvbnRleHQiLCJvRGF0YU9iamVjdCIsImdldE9iamVjdCIsInNNdWx0aUxldmVsUGF0aENvbmRpdGlvbiIsImhhc093blByb3BlcnR5IiwicHVzaCIsImFVbmlxdWVQcm9wZXJ0eVZhbHVlcyIsImZpbHRlciIsImdldEhpZGRlblZhbHVlRm9yQ29udGV4dHMiLCJoaWRkZW5WYWx1ZSIsIiRQYXRoIiwic29tZSIsImdldElucHV0VHlwZSIsInByb3BlcnR5SW5mbyIsImRhdGFGaWVsZENvbnZlcnRlZCIsIm9EYXRhTW9kZWxQYXRoIiwiZWRpdFN0eWxlUHJvcGVydGllcyIsImlucHV0VHlwZSIsInNldEVkaXRTdHlsZVByb3BlcnRpZXMiLCJlZGl0U3R5bGUiLCJpc1ZhbGlkRm9yTWFzc0VkaXQiLCJpc0NvbGxlY3Rpb25GaWVsZCIsImhhc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcyIsImdldElzRmllbGRHcnAiLCIkVHlwZSIsIlRhcmdldCIsInZhbHVlIiwiZ2V0VGV4dFBhdGgiLCJwcm9wZXJ0eSIsInRleHRCaW5kaW5nIiwiZGlzcGxheU1vZGUiLCJkZXNjcmlwdGlvblBhdGgiLCJwYXRoIiwicGFyYW1ldGVycyIsInByb3BzIiwicHJlcGFyZURhdGFGb3JEaWFsb2ciLCJvVGFibGUiLCJhRGF0YUFycmF5Iiwib01ldGFNb2RlbCIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic0N1cnJlbnRFbnRpdHlTZXROYW1lIiwiZGF0YSIsImFUYWJsZUZpZWxkcyIsImdldFRhYmxlRmllbGRzIiwib0VudGl0eVR5cGVDb250ZXh0IiwiZ2V0Q29udGV4dCIsIm9FbnRpdHlTZXRDb250ZXh0Iiwib0RhdGFNb2RlbE9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJvRGF0YUZpZWxkTW9kZWwiLCJKU09OTW9kZWwiLCJvUmVzdWx0Iiwic0xhYmVsVGV4dCIsImJWYWx1ZUhlbHBFbmFibGVkIiwic1VuaXRQcm9wZXJ0eVBhdGgiLCJiVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQiLCJvVGV4dEJpbmRpbmciLCJvQ29sdW1uSW5mbyIsImRhdGFQcm9wZXJ0eSIsIm9Qcm9wZXJ0eUluZm8iLCJsYWJlbCIsInRhcmdldE9iamVjdCIsInRhcmdldEVudGl0eVR5cGUiLCJlbnRpdHlQcm9wZXJ0aWVzIiwib1Byb3BlcnR5IiwibmFtZSIsImdldFRleHRCaW5kaW5nIiwib0ZpZWxkQ29udGV4dCIsImFubm90YXRpb25QYXRoIiwib0RhdGFGaWVsZENvbnZlcnRlZCIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0Iiwib1Byb3BlcnR5Q29udGV4dCIsIm9JbnRlcmZhY2UiLCJnZXRJbnRlcmZhY2UiLCJWYWx1ZSIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwiYkhpZGRlbkZpZWxkIiwiaXNJbWFnZSIsImNvbnRleHQiLCJnZXRQYXRoIiwiX3R5cGUiLCIkdGFyZ2V0IiwiY2hhcnRQcm9wZXJ0eSIsInRlcm0iLCJpc0FjdGlvbiIsIkFjdGlvbiIsImlzRmllbGRHcnAiLCJoYXNDdXJyZW5jeSIsImhhc1VuaXQiLCJnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5UGF0aCIsInVuaXRQcm9wZXJ0eUluZm8iLCJnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5IiwiaGFzVmFsdWVIZWxwIiwiaGFzQ29udGV4dERlcGVuZGVudFZIIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJWYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnMiLCJwcm9wZXJ0eUZvckZpZWxkQ29udHJvbCIsImV4cEJpbmRpbmciLCJnZXRFZGl0TW9kZSIsImNvbnN0YW50IiwiZWRpdE1vZGVWYWx1ZXMiLCJPYmplY3QiLCJrZXlzIiwiRWRpdE1vZGUiLCJlZGl0TW9kZUlzU3RhdGljIiwiaW5jbHVkZXMiLCJlZGl0YWJsZSIsIkVkaXRhYmxlIiwibmF2UHJvcGVydHlXaXRoVmFsdWVIZWxwIiwicmVsYXRpdmVQYXRoIiwiZ2V0UmVsYXRpdmVQYXRocyIsImlzUmVhZE9ubHkiLCJpc1JlYWRPbmx5RXhwcmVzc2lvbiIsIkNvbW1vblV0aWxzIiwiY29tcHV0ZURpc3BsYXlNb2RlIiwiaXNWYWx1ZUhlbHBFbmFibGVkIiwiaXNWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdCIsInVuaXRQcm9wZXJ0eSIsImdldFJlcXVpcmVkRXhwcmVzc2lvbiIsIm51bGxhYmxlIiwic2V0RGF0YSIsImFDb2x1bW5zIiwiZ2V0Q29sdW1ucyIsImNvbHVtbnNEYXRhIiwiZ2V0UGFyZW50IiwiZ2V0VGFibGVEZWZpbml0aW9uIiwiY29sdW1ucyIsIm1hcCIsIm9Db2x1bW4iLCJzRGF0YVByb3BlcnR5IiwiZ2V0RGF0YVByb3BlcnR5IiwiYVJlYWx0ZWRDb2x1bW5JbmZvIiwidHlwZSIsImdldEhlYWRlciIsImdldERlZmF1bHRUZXh0c0ZvckRpYWxvZyIsIm9SZXNvdXJjZUJ1bmRsZSIsImlTZWxlY3RlZENvbnRleHRzIiwiYkRpc3BsYXlNb2RlIiwiZ2V0VGV4dCIsInRvU3RyaW5nIiwic2V0RGVmYXVsdFZhbHVlc1RvRGlhbG9nIiwib0RlZmF1bHRWYWx1ZXMiLCJiVU9NRmllbGQiLCJzSW5wdXRUeXBlIiwiYlByb3BlcnR5UmVxdWlyZWQiLCJpc0ZpZWxkUmVxdWlyZWQiLCJzU3VmZml4Rm9yS2VlcEV4aXN0aW5nIiwiZGVmYXVsdE9wdGlvbnMiLCJzZWxlY3RPcHRpb25zRXhpc3QiLCJzZWxlY3RPcHRpb25zIiwia2VlcEVudHJ5IiwidGV4dCIsImtlZXBFeGlzdGluZ1ByZWZpeCIsImtleSIsImZhbHNlRW50cnkiLCJ0ZXh0SW5mbyIsInRydXRoeUVudHJ5IiwidW5zaGlmdCIsImhhc1ZIIiwidW5pdEluZm8iLCJ2aGRFbnRyeSIsInVzZVZhbHVlSGVscFZhbHVlIiwiY2xlYXJFbnRyeSIsImNsZWFyRmllbGRWYWx1ZSIsImVtcHR5RW50cnkiLCJsZWF2ZUJsYW5rVmFsdWUiLCJnZXRUZXh0QXJyYW5nZW1lbnRJbmZvIiwic2VsZWN0ZWRDb250ZXh0IiwiZGVzY3JpcHRpb25WYWx1ZSIsImZ1bGxUZXh0IiwiTG9nIiwiaW5mbyIsImlzRWRpdGFibGUiLCJhbnkiLCJiaW5kaW5nIiwiZ2V0QmluZGluZyIsImdldEV4dGVybmFsVmFsdWUiLCJvbkNvbnRleHRFZGl0YWJsZUNoYW5nZSIsIm9EaWFsb2dEYXRhTW9kZWwiLCJvYmplY3RzRm9yVmlzaWJpbGl0eSIsImdldFByb3BlcnR5Iiwic2V0UHJvcGVydHkiLCJ1cGRhdGVPbkNvbnRleHRDaGFuZ2UiLCJtT1RvVXNlIiwidmFsdWVzIiwiYXR0YWNoQ2hhbmdlIiwiYmluZCIsImdldEJvdW5kT2JqZWN0IiwiQW55IiwibW9kZWwiLCJzZXRNb2RlbCIsInNldEJpbmRpbmdDb250ZXh0IiwiZ2V0RmllbGRWaXNpYmxpdHkiLCJpc0NvbnRleHRFZGl0YWJsZSIsInNldFJ1bnRpbWVNb2RlbE9uRGlhbG9nIiwiZGlhbG9nQ29udGV4dCIsImFVbml0RGF0YSIsImFSZXN1bHRzIiwidGV4dFBhdGhzIiwiYVJlYWRPbmx5RmllbGRJbmZvIiwib0RhdGEiLCJub0ZpZWxkcyIsIm9JbkRhdGEiLCJvVGV4dEluZm8iLCJzUHJvcGVydHlLZXkiLCJzVW5pdFByb3BlcnR5TmFtZSIsIm9EaXN0aW5jdFZhbHVlTWFwIiwib0Rpc3RpbmN0VW5pdE1hcCIsInNNdWx0aUxldmVsUGF0aFZhbHVlIiwiZGlzcGxheSIsInZhbHVlUGF0aCIsImVudHJ5IiwidW5pdEVudHJ5Iiwic011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlIiwic2VsZWN0ZWRLZXkiLCJiQ2xlYXJGaWVsZE9yQmxhbmtWYWx1ZUV4aXN0cyIsIm9iaiIsImJDbGVhckZpZWxkT3JCbGFua1VuaXRWYWx1ZUV4aXN0cyIsImlzUHJvcGVydHlSZWFkT25seSIsIm9wZXJhbmRzIiwib3BlcmFuZDEiLCJvcGVyYW5kMiIsInByb3BlcnR5UGF0aCIsInByb3BlcnR5VmFsdWUiLCJlZGl0TW9kZSIsInZpc2libGUiLCJnZXREaWFsb2dDb250ZXh0IiwidGFibGUiLCJkaWFsb2ciLCJ0cmFuc0N0eCIsImdldEJpbmRpbmdDb250ZXh0IiwibGlzdEJpbmRpbmciLCJnZXRSb3dCaW5kaW5nIiwidHJhbnNpZW50TGlzdEJpbmRpbmciLCJiaW5kTGlzdCIsIiQkdXBkYXRlR3JvdXBJZCIsInJlZnJlc2hJbnRlcm5hbCIsImNyZWF0ZSIsIm9uRGlhbG9nT3BlbiIsImV2ZW50Iiwic291cmNlIiwiZ2V0U291cmNlIiwiZmllbGRzSW5mb01vZGVsIiwiY2xvc2VEaWFsb2ciLCJvRGlhbG9nIiwiY2xvc2UiLCJkZXN0cm95IiwibWVzc2FnZUhhbmRsaW5nRm9yTWFzc0VkaXQiLCJvQ29udHJvbGxlciIsIm9JbkRpYWxvZyIsImVycm9yQ29udGV4dHMiLCJEcmFmdFN0YXR1cyIsIkZFTGlicmFyeSIsIkNvcmUiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJnZXRWaWV3IiwiX2VkaXRGbG93IiwiZ2V0TWVzc2FnZUhhbmRsZXIiLCJzaG93TWVzc2FnZXMiLCJvbkJlZm9yZVNob3dNZXNzYWdlIiwibWVzc2FnZXMiLCJzaG93TWVzc2FnZVBhcmFtZXRlcnMiLCJmbkdldE1lc3NhZ2VTdWJ0aXRsZSIsIm1lc3NhZ2VIYW5kbGluZyIsInNldE1lc3NhZ2VTdWJ0aXRsZSIsInVuYm91bmRFcnJvcnMiLCJtZXNzYWdlIiwiZ2V0VGFyZ2V0Iiwic2V0RHJhZnRTdGF0dXMiLCJTYXZlZCIsInN1Y2Nlc3NUb2FzdCIsIk1lc3NhZ2VUb2FzdCIsInNob3ciLCJnZXRTZWxlY3RlZENvbnRleHRzIiwiQ2xlYXIiLCJzaG93TWVzc2FnZUJveCIsInNob3dNZXNzYWdlRGlhbG9nIiwiaXNPcGVuIiwiZ2V0U2lkZUVmZmVjdERhdGFGb3JLZXkiLCJhU2lkZUVmZmVjdHMiLCJzT3duZXJFbnRpdHlUeXBlIiwiYmFzZVNpZGVFZmZlY3RzTWFwQXJyYXkiLCJyZXN1bHQiLCJrZXlWYWx1ZSIsInNpZGVFZmZlY3RzQXJyYXkiLCJGaWVsZEhlbHBlciIsImdldFNpZGVFZmZlY3RzT25FbnRpdHlBbmRQcm9wZXJ0eSIsIl9zaWRlRWZmZWN0cyIsImdlbmVyYXRlU2lkZUVmZmVjdHNNYXBGcm9tU2lkZUVmZmVjdElkIiwiZm5HZXRQYXRoRm9yU291cmNlUHJvcGVydHkiLCJzRW50aXR5VHlwZSIsInNOYXZpZ2F0aW9uUGF0aCIsInN1YnN0ciIsImxhc3RJbmRleE9mIiwicE93bmVyRW50aXR5IiwiUHJvbWlzZSIsInJlc29sdmUiLCJyZXF1ZXN0T2JqZWN0IiwiZm5HZXRFbnRpdHlUeXBlT2ZPd25lciIsImJhc2VOYXZQYXRoIiwidGFyZ2V0RW50aXR5IiwiYVRhcmdldHMiLCJvd25lckVudGl0eVR5cGUiLCJwT3duZXIiLCJvd25lck5hdlBhdGgiLCJlbnRpdHlPYmpPZk93bmVyUGFydG5lciIsImVudGl0eVR5cGVPZk93bmVyUGFydG5lciIsImZuR2V0VGFyZ2V0c0Zvck1hc3NFZGl0Iiwic2lkZUVmZmVjdHNEYXRhIiwiYVRhcmdldFByb3BlcnRpZXMiLCJUYXJnZXRQcm9wZXJ0aWVzIiwiYVRhcmdldEVudGl0aWVzIiwiVGFyZ2V0RW50aXRpZXMiLCJhUHJvbWlzZXMiLCJ0YXJnZXRQcm9wIiwidGhlbiIsInJlc3VsdEVudGl0eSIsImFsbCIsImhhbmRsZU1hc3NFZGl0RmllbGRVcGRhdGVBbmRSZXF1ZXN0U2lkZUVmZmVjdHMiLCJtUGFyYW1zIiwib0ZpZWxkUHJvbWlzZSIsInNpZGVFZmZlY3RzTWFwIiwiZ3JvdXBJZCIsImRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lIiwiaW1tZWRpYXRlU2lkZUVmZmVjdHNQcm9taXNlcyIsIm9BcHBDb21wb25lbnQiLCJnZXRBcHBDb21wb25lbnQiLCJvU2lkZUVmZmVjdHNTZXJ2aWNlIiwiZ2V0U2lkZUVmZmVjdHNTZXJ2aWNlIiwiYWxsRW50aXR5VHlwZXNXaXRoUXVhbGlmaWVyIiwic2lkZUVmZmVjdHNEYXRhRm9yRmllbGQiLCJtVmlzaXRlZFNpZGVFZmZlY3RzIiwiZW50cmllcyIsImVudGl0eVR5cGVXaXRoUXVhbGlmaWVyIiwiZ2V0Q29udGV4dEZvclNpZGVFZmZlY3RzIiwiYWxsRmFpbGVkU2lkZUVmZmVjdHMiLCJnZXRSZWdpc3RlcmVkRmFpbGVkUmVxdWVzdHMiLCJhRmFpbGVkU2lkZUVmZmVjdHMiLCJkZWxldGVGYWlsZWRSZXF1ZXN0c0ZvckFDb250ZXh0Iiwic2lkZUVmZmVjdHNGb3JDdXJyZW50Q29udGV4dCIsInNpZGVFZmZlY3RzIiwiY29uY2F0IiwiYVNpZGVFZmZlY3QiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJhSW1tZWRpYXRlVGFyZ2V0cyIsImFsbFRhcmdldHMiLCJ0cmlnZ2VyQWN0aW9uTmFtZSIsImZuR2V0SW1tZWRpYXRlVGFyZ2V0c0FuZEFjdGlvbnMiLCJtU2lkZUVmZmVjdCIsInNpZGVFZmZlY3RFbnRpdHlUeXBlIiwidGFyZ2V0c0FycmF5Rm9yQWxsUHJvcGVydGllcyIsImFjdGlvbk5hbWUiLCJUcmlnZ2VyQWN0aW9uIiwiYURlZmVycmVkVGFyZ2V0cyIsInRhcmdldCIsImlzU3RhdGljQWN0aW9uIiwiVGFibGVIZWxwZXIiLCJfaXNTdGF0aWNBY3Rpb24iLCJyZXF1ZXN0U2lkZUVmZmVjdHMiLCJhbGxTZXR0bGVkIiwiY3JlYXRlRGlhbG9nIiwic0ZyYWdtZW50TmFtZSIsIm1ldGFNb2RlbCIsIml0ZW1zTW9kZWwiLCJUZW1wbGF0ZU1vZGVsIiwiZ2V0RGF0YSIsIm9GcmFnbWVudCIsIlhNTFRlbXBsYXRlUHJvY2Vzc29yIiwibG9hZFRlbXBsYXRlIiwiWE1MUHJlcHJvY2Vzc29yIiwicHJvY2VzcyIsImJpbmRpbmdDb250ZXh0cyIsImRhdGFGaWVsZE1vZGVsIiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJtb2RlbHMiLCJvQ3JlYXRlZEZyYWdtZW50IiwiRnJhZ21lbnQiLCJsb2FkIiwiZGVmaW5pdGlvbiIsIm9EaWFsb2dDb250ZW50IiwiRGlhbG9nIiwicmVzaXphYmxlIiwidGl0bGUiLCJtYXNzRWRpdFRpdGxlIiwiY29udGVudCIsImFmdGVyT3BlbiIsImJlZ2luQnV0dG9uIiwiQnV0dG9uIiwiaGVscGVycyIsImdldEV4cEJpbmRpbmdGb3JBcHBseUJ1dHRvblR4dCIsInByZXNzIiwib0V2ZW50IiwicmVtb3ZlQm91bmRUcmFuc2l0aW9uTWVzc2FnZXMiLCJyZW1vdmVVbmJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzIiwib01vZGVsIiwiU2lkZUVmZmVjdHNIZWxwZXIiLCJnZW5lcmF0ZVNpZGVFZmZlY3RzTWFwRnJvbU1ldGFNb2RlbCIsImFQcm9wZXJ0eVJlYWRhYmxlSW5mbyIsImFsbFNpZGVFZmZlY3RzIiwibWFzc0VkaXRQcm9taXNlcyIsImZhaWxlZEZpZWxkc0RhdGEiLCJzZWxlY3RlZFJvd3NMZW5ndGgiLCJpZHgiLCJjYXRjaCIsIm9FcnJvciIsImVycm9yIiwicmVqZWN0IiwiaXNGaWVsZFVwZGF0ZUZhaWxlZCIsImRhdGFUb1VwZGF0ZUZpZWxkQW5kU2lkZUVmZmVjdHMiLCJkZWZlcnJlZFJlcXVlc3RzIiwic2lkZUVmZmVjdHNEYXRhRm9yQWxsS2V5cyIsImtleXNXaXRoU2lkZUVmZmVjdHMiLCJjdXJyZW50S2V5IiwiZGVmZXJyZWRTaWRlRWZmZWN0c0RhdGEiLCJyZXEiLCJmbkdldERlZmVycmVkVGFyZ2V0cyIsImZuR2V0RGVmZXJyZWRUYXJnZXRzQW5kQWN0aW9ucyIsImUiLCJlbmRCdXR0b24iLCJjYW5jZWxCdXR0b25UZXh0IiwiaGFzRWRpdGFibGVGaWVsZHNCaW5kaW5nIiwiZ2V0QmluZGluZ0V4cEZvckhhc0VkaXRhYmxlRmllbGRzIiwiZmllbGRzIiwidG90YWxFeHAiLCJyZWR1Y2UiLCJleHByZXNzaW9uIiwiZmllbGQiLCJvciIsInBhdGhJbk1vZGVsIiwibm90IiwiZGVmYXVsdFZhbHVlcyIsImVkaXRhYmxlRXhwIiwiaWZFbHNlIiwiYXBwbHlCdXR0b25UZXh0Iiwib2tCdXR0b25UZXh0IiwiY29tcGlsZUV4cHJlc3Npb24iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk1hc3NFZGl0SGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHsgRmllbGRTaWRlRWZmZWN0UHJvcGVydHlUeXBlLCBNYXNzRWRpdEZpZWxkU2lkZUVmZmVjdFByb3BlcnR5VHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9TaWRlRWZmZWN0c1wiO1xuaW1wb3J0IHtcblx0QmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLFxuXHRDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbixcblx0Y29tcGlsZUV4cHJlc3Npb24sXG5cdGNvbnN0YW50LFxuXHRpZkVsc2UsXG5cdG5vdCxcblx0b3IsXG5cdHBhdGhJbk1vZGVsXG59IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgRkVMaWJyYXJ5IGZyb20gXCJzYXAvZmUvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCB0eXBlIHsgT0RhdGFTaWRlRWZmZWN0c1R5cGUsIFNpZGVFZmZlY3RzVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9zZXJ2aWNlcy9TaWRlRWZmZWN0c1NlcnZpY2VGYWN0b3J5XCI7XG5pbXBvcnQgVGVtcGxhdGVNb2RlbCBmcm9tIFwic2FwL2ZlL2NvcmUvVGVtcGxhdGVNb2RlbFwiO1xuaW1wb3J0IHR5cGUgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgZW5oYW5jZURhdGFNb2RlbFBhdGgsIGdldFJlbGF0aXZlUGF0aHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQge1xuXHRnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5LFxuXHRnZXRBc3NvY2lhdGVkVW5pdFByb3BlcnR5UGF0aCxcblx0aGFzQ3VycmVuY3ksXG5cdGhhc1VuaXQsXG5cdGhhc1ZhbHVlSGVscCxcblx0aGFzVmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzXG59IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL1Byb3BlcnR5SGVscGVyXCI7XG5pbXBvcnQgRmllbGRIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRIZWxwZXJcIjtcbmltcG9ydCB7IGdldFRleHRCaW5kaW5nLCBzZXRFZGl0U3R5bGVQcm9wZXJ0aWVzIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvZmllbGQvRmllbGRUZW1wbGF0aW5nXCI7XG5pbXBvcnQgdHlwZSB7IEZpZWxkUHJvcGVydGllcyB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL0ZpZWxkLm1ldGFkYXRhXCI7XG5pbXBvcnQgVGFibGVIZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVGFibGVIZWxwZXJcIjtcbmltcG9ydCBCdXR0b24gZnJvbSBcInNhcC9tL0J1dHRvblwiO1xuaW1wb3J0IERpYWxvZyBmcm9tIFwic2FwL20vRGlhbG9nXCI7XG5pbXBvcnQgTWVzc2FnZVRvYXN0IGZyb20gXCJzYXAvbS9NZXNzYWdlVG9hc3RcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgWE1MUHJlcHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS91dGlsL1hNTFByZXByb2Nlc3NvclwiO1xuaW1wb3J0IFhNTFRlbXBsYXRlUHJvY2Vzc29yIGZyb20gXCJzYXAvdWkvY29yZS9YTUxUZW1wbGF0ZVByb2Nlc3NvclwiO1xuaW1wb3J0IEVkaXRNb2RlIGZyb20gXCJzYXAvdWkvbWRjL2VudW0vRWRpdE1vZGVcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcbmltcG9ydCBtZXNzYWdlSGFuZGxpbmcgZnJvbSBcIi4uL2NvbnRyb2xsZXJleHRlbnNpb25zL21lc3NhZ2VIYW5kbGVyL21lc3NhZ2VIYW5kbGluZ1wiO1xuaW1wb3J0IHR5cGUgeyBBbnlUeXBlIH0gZnJvbSBcIi4uL2NvbnRyb2xzL0FueVwiO1xuaW1wb3J0IEFueSBmcm9tIFwiLi4vY29udHJvbHMvQW55XCI7XG5pbXBvcnQgeyBjb252ZXJ0TWV0YU1vZGVsQ29udGV4dCwgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcIi4uL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBpc1JlYWRPbmx5RXhwcmVzc2lvbiB9IGZyb20gXCIuLi90ZW1wbGF0aW5nL0ZpZWxkQ29udHJvbEhlbHBlclwiO1xuaW1wb3J0IHsgZ2V0RWRpdE1vZGUsIGdldFJlcXVpcmVkRXhwcmVzc2lvbiwgaXNDb2xsZWN0aW9uRmllbGQgfSBmcm9tIFwiLi4vdGVtcGxhdGluZy9VSUZvcm1hdHRlcnNcIjtcbmltcG9ydCB0eXBlIHsgSW50ZXJuYWxNb2RlbENvbnRleHQgfSBmcm9tIFwiLi9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFNpZGVFZmZlY3RzSGVscGVyIGZyb20gXCIuL1NpZGVFZmZlY3RzSGVscGVyXCI7XG5cbi8qIFRoaXMgY2xhc3MgY29udGFpbnMgaGVscGVycyB0byBiZSB1c2VkIGZvciBtYXNzIGVkaXQgZnVuY3Rpb25hbGl0eSAqL1xudHlwZSBUZXh0QXJyYW5nZW1lbnRJbmZvID0ge1xuXHR0ZXh0QXJyYW5nZW1lbnQ6IHN0cmluZztcblx0dmFsdWVQYXRoOiBzdHJpbmc7XG5cdGRlc2NyaXB0aW9uUGF0aD86IHN0cmluZztcblx0dmFsdWU6IHN0cmluZztcblx0ZGVzY3JpcHRpb246IHN0cmluZztcblx0ZnVsbFRleHQ6IHN0cmluZztcbn07XG5cbnR5cGUgQmluZGluZ0luZm8gPSB7XG5cdHBhdGg/OiBzdHJpbmc7XG5cdG1vZGVsPzogc3RyaW5nIHwgb2JqZWN0O1xuXHRwYXJhbWV0ZXJzPzogQXJyYXk8QmluZGluZ0luZm8+O1xufTtcblxudHlwZSBEYXRhVG9VcGRhdGVGaWVsZEFuZFNpZGVFZmZlY3RzVHlwZSA9IHtcblx0b0NvbnRyb2xsZXI6IGFueTtcblx0b0ZpZWxkUHJvbWlzZTogUHJvbWlzZTxhbnk+O1xuXHRzaWRlRWZmZWN0c01hcDogTWFzc0VkaXRGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGUgfCBGaWVsZFNpZGVFZmZlY3RQcm9wZXJ0eVR5cGU7XG5cdHRleHRQYXRoczogYW55O1xuXHRncm91cElkOiBzdHJpbmc7XG5cdGtleTogc3RyaW5nO1xuXHRvRW50aXR5U2V0Q29udGV4dDogYW55O1xuXHRvTWV0YU1vZGVsOiBhbnk7XG5cdG9TZWxlY3RlZENvbnRleHQ6IGFueTtcblx0ZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWU6IGFueTtcbn07XG5cbmNvbnN0IE1hc3NFZGl0SGVscGVyID0ge1xuXHQvKipcblx0ICogSW5pdGlhbGl6ZXMgdGhlIHZhbHVlIGF0IGZpbmFsIG9yIGRlZXBlc3QgbGV2ZWwgcGF0aCB3aXRoIGEgYmxhbmsgYXJyYXkuXG5cdCAqIFJldHVybiBhbiBlbXB0eSBhcnJheSBwb2ludGluZyB0byB0aGUgZmluYWwgb3IgZGVlcGVzdCBsZXZlbCBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGggUHJvcGVydHkgcGF0aFxuXHQgKiBAcGFyYW0gYVZhbHVlcyBBcnJheSBpbnN0YW5jZSB3aGVyZSB0aGUgZGVmYXVsdCBkYXRhIG5lZWRzIHRvIGJlIGFkZGVkXG5cdCAqIEByZXR1cm5zIFRoZSBmaW5hbCBwYXRoXG5cdCAqL1xuXHRpbml0TGFzdExldmVsT2ZQcm9wZXJ0eVBhdGg6IGZ1bmN0aW9uIChzUGF0aDogc3RyaW5nLCBhVmFsdWVzOiBhbnkgLyosIHRyYW5zQ3R4OiBDb250ZXh0ICovKSB7XG5cdFx0bGV0IGFGaW5hbFBhdGg6IGFueTtcblx0XHRsZXQgaW5kZXggPSAwO1xuXHRcdGNvbnN0IGFQYXRocyA9IHNQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRsZXQgc0Z1bGxQYXRoID0gXCJcIjtcblx0XHRhUGF0aHMuZm9yRWFjaChmdW5jdGlvbiAoc1Byb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0XHRpZiAoIWFWYWx1ZXNbc1Byb3BlcnR5UGF0aF0gJiYgaW5kZXggPT09IDApIHtcblx0XHRcdFx0YVZhbHVlc1tzUHJvcGVydHlQYXRoXSA9IHt9O1xuXHRcdFx0XHRhRmluYWxQYXRoID0gYVZhbHVlc1tzUHJvcGVydHlQYXRoXTtcblx0XHRcdFx0c0Z1bGxQYXRoID0gc0Z1bGxQYXRoICsgc1Byb3BlcnR5UGF0aDtcblx0XHRcdFx0aW5kZXgrKztcblx0XHRcdH0gZWxzZSBpZiAoIWFGaW5hbFBhdGhbc1Byb3BlcnR5UGF0aF0pIHtcblx0XHRcdFx0c0Z1bGxQYXRoID0gYCR7c0Z1bGxQYXRofS8ke3NQcm9wZXJ0eVBhdGh9YDtcblx0XHRcdFx0aWYgKHNGdWxsUGF0aCAhPT0gc1BhdGgpIHtcblx0XHRcdFx0XHRhRmluYWxQYXRoW3NQcm9wZXJ0eVBhdGhdID0ge307XG5cdFx0XHRcdFx0YUZpbmFsUGF0aCA9IGFGaW5hbFBhdGhbc1Byb3BlcnR5UGF0aF07XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0YUZpbmFsUGF0aFtzUHJvcGVydHlQYXRoXSA9IFtdO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGFGaW5hbFBhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdW5pcXVlIHZhbHVlcyBmb3IgZ2l2ZW4gYXJyYXkgdmFsdWVzLlxuXHQgKlxuXHQgKiBAcGFyYW0gc1ZhbHVlIFByb3BlcnR5IHZhbHVlXG5cdCAqIEBwYXJhbSBpbmRleCBJbmRleCBvZiB0aGUgcHJvcGVydHkgdmFsdWVcblx0ICogQHBhcmFtIHNlbGYgSW5zdGFuY2Ugb2YgdGhlIGFycmF5XG5cdCAqIEByZXR1cm5zIFRoZSB1bmlxdWUgdmFsdWVcblx0ICovXG5cdGdldFVuaXF1ZVZhbHVlczogZnVuY3Rpb24gKHNWYWx1ZTogc3RyaW5nLCBpbmRleDogbnVtYmVyLCBzZWxmOiBhbnlbXSkge1xuXHRcdGlmIChzVmFsdWUgIT0gdW5kZWZpbmVkICYmIHNWYWx1ZSAhPSBudWxsKSB7XG5cdFx0XHRyZXR1cm4gc2VsZi5pbmRleE9mKHNWYWx1ZSkgPT09IGluZGV4O1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogR2V0cyB0aGUgcHJvcGVydHkgdmFsdWUgZm9yIGEgbXVsdGktbGV2ZWwgcGF0aCAoZm9yIGV4YW1wbGU6IF9NYXRlcmlhbHMvTWF0ZXJpYWxfRGV0YWlscyBnZXRzIHRoZSB2YWx1ZSBvZiBNYXRlcmlhbF9EZXRhaWxzIHVuZGVyIF9NYXRlcmlhbHMgT2JqZWN0KS5cblx0ICogUmV0dXJucyB0aGUgcHJvcGVydHlWYWx1ZSwgd2hpY2ggY2FuIGJlIG9mIGFueSB0eXBlIChzdHJpbmcsIG51bWJlciwgZXRjLi4pLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0RhdGFQcm9wZXJ0eVBhdGggUHJvcGVydHkgcGF0aFxuXHQgKiBAcGFyYW0gb1ZhbHVlcyBPYmplY3Qgb2YgcHJvcGVydHkgdmFsdWVzXG5cdCAqIEByZXR1cm5zIFRoZSBwcm9wZXJ0eSB2YWx1ZVxuXHQgKi9cblx0Z2V0VmFsdWVGb3JNdWx0aUxldmVsUGF0aDogZnVuY3Rpb24gKHNEYXRhUHJvcGVydHlQYXRoOiBzdHJpbmcsIG9WYWx1ZXM6IGFueSkge1xuXHRcdGlmIChzRGF0YVByb3BlcnR5UGF0aCAmJiBzRGF0YVByb3BlcnR5UGF0aC5pbmRleE9mKFwiL1wiKSA+IDApIHtcblx0XHRcdGNvbnN0IGFQcm9wZXJ0eVBhdGhzID0gc0RhdGFQcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0bGV0IFJlc3VsdDogYW55O1xuXHRcdFx0YVByb3BlcnR5UGF0aHMuZm9yRWFjaChmdW5jdGlvbiAoc1BhdGg6IHN0cmluZykge1xuXHRcdFx0XHRSZXN1bHQgPSBvVmFsdWVzICYmIG9WYWx1ZXNbc1BhdGhdID8gb1ZhbHVlc1tzUGF0aF0gOiBSZXN1bHQgJiYgUmVzdWx0W3NQYXRoXTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIFJlc3VsdDtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGtleSBwYXRoIGZvciB0aGUga2V5IG9mIGEgY29tYm8gYm94IHRoYXQgbXVzdCBiZSBzZWxlY3RlZCBpbml0aWFsbHkgd2hlbiB0aGUgZGlhbG9nIG9wZW5zOlxuXHQgKiA9PiBJZiBwcm9wZXJ0eVZhbHVlIGZvciBhbGwgc2VsZWN0ZWQgY29udGV4dHMgaXMgZGlmZmVyZW50LCB0aGVuIDwgS2VlcCBFeGlzdGluZyBWYWx1ZXMgPiBpcyBwcmVzZWxlY3RlZC5cblx0ICogPT4gSWYgcHJvcGVydHlWYWx1ZSBmb3IgYWxsIHNlbGVjdGVkIGNvbnRleHRzIGlzIHRoZSBzYW1lLCB0aGVuIHRoZSBwcm9wZXJ0eVZhbHVlIGlzIHByZXNlbGVjdGVkLlxuXHQgKiA9PiBJZiBwcm9wZXJ0eVZhbHVlIGZvciBhbGwgc2VsZWN0ZWQgY29udGV4dHMgaXMgZW1wdHksIHRoZW4gPCBMZWF2ZSBCbGFuayA+IGlzIHByZXNlbGVjdGVkLlxuXHQgKlxuXHQgKlxuXHQgKiBAcGFyYW0gYUNvbnRleHRzIENvbnRleHRzIGZvciBtYXNzIGVkaXRcblx0ICogQHBhcmFtIHNEYXRhUHJvcGVydHlQYXRoIERhdGEgcHJvcGVydHkgcGF0aFxuXHQgKiBAcmV0dXJucyBUaGUga2V5IHBhdGhcblx0ICovXG5cdGdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3g6IGZ1bmN0aW9uIChhQ29udGV4dHM6IGFueVtdLCBzRGF0YVByb3BlcnR5UGF0aDogc3RyaW5nKSB7XG5cdFx0aWYgKHNEYXRhUHJvcGVydHlQYXRoICYmIGFDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBvU2VsZWN0ZWRDb250ZXh0ID0gYUNvbnRleHRzLFxuXHRcdFx0XHRhUHJvcGVydHlWYWx1ZXM6IGFueVtdID0gW107XG5cdFx0XHRvU2VsZWN0ZWRDb250ZXh0LmZvckVhY2goZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRcdFx0Y29uc3Qgb0RhdGFPYmplY3QgPSBvQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdFx0Y29uc3Qgc011bHRpTGV2ZWxQYXRoQ29uZGl0aW9uID1cblx0XHRcdFx0XHRzRGF0YVByb3BlcnR5UGF0aC5pbmRleE9mKFwiL1wiKSA+IC0xICYmIG9EYXRhT2JqZWN0Lmhhc093blByb3BlcnR5KHNEYXRhUHJvcGVydHlQYXRoLnNwbGl0KFwiL1wiKVswXSk7XG5cdFx0XHRcdGlmIChvQ29udGV4dCAmJiAob0RhdGFPYmplY3QuaGFzT3duUHJvcGVydHkoc0RhdGFQcm9wZXJ0eVBhdGgpIHx8IHNNdWx0aUxldmVsUGF0aENvbmRpdGlvbikpIHtcblx0XHRcdFx0XHRhUHJvcGVydHlWYWx1ZXMucHVzaChvQ29udGV4dC5nZXRPYmplY3Qoc0RhdGFQcm9wZXJ0eVBhdGgpKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRjb25zdCBhVW5pcXVlUHJvcGVydHlWYWx1ZXMgPSBhUHJvcGVydHlWYWx1ZXMuZmlsdGVyKE1hc3NFZGl0SGVscGVyLmdldFVuaXF1ZVZhbHVlcyk7XG5cdFx0XHRpZiAoYVVuaXF1ZVByb3BlcnR5VmFsdWVzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0cmV0dXJuIGBEZWZhdWx0LyR7c0RhdGFQcm9wZXJ0eVBhdGh9YDtcblx0XHRcdH0gZWxzZSBpZiAoYVVuaXF1ZVByb3BlcnR5VmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRyZXR1cm4gYEVtcHR5LyR7c0RhdGFQcm9wZXJ0eVBhdGh9YDtcblx0XHRcdH0gZWxzZSBpZiAoYVVuaXF1ZVByb3BlcnR5VmFsdWVzLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRyZXR1cm4gYCR7c0RhdGFQcm9wZXJ0eVBhdGh9LyR7YVVuaXF1ZVByb3BlcnR5VmFsdWVzWzBdfWA7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaGlkZGVuIGFubm90YXRpb24gdmFsdWUgW2JvdGggc3RhdGljIGFuZCBwYXRoIGJhc2VkXSBmb3IgdGFibGUncyBzZWxlY3RlZCBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gaGlkZGVuVmFsdWUgSGlkZGVuIGFubm90YXRpb24gdmFsdWUgLyBwYXRoIGZvciBmaWVsZFxuXHQgKiBAcGFyYW0gYUNvbnRleHRzIENvbnRleHRzIGZvciBtYXNzIGVkaXRcblx0ICogQHJldHVybnMgVGhlIGhpZGRlbiBhbm5vdGF0aW9uIHZhbHVlXG5cdCAqL1xuXHRnZXRIaWRkZW5WYWx1ZUZvckNvbnRleHRzOiBmdW5jdGlvbiAoaGlkZGVuVmFsdWU6IGFueSwgYUNvbnRleHRzOiBhbnlbXSkge1xuXHRcdGlmIChoaWRkZW5WYWx1ZSAmJiBoaWRkZW5WYWx1ZS4kUGF0aCkge1xuXHRcdFx0cmV0dXJuICFhQ29udGV4dHMuc29tZShmdW5jdGlvbiAob1NlbGVjdGVkQ29udGV4dDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvU2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChoaWRkZW5WYWx1ZS4kUGF0aCkgPT09IGZhbHNlO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBoaWRkZW5WYWx1ZTtcblx0fSxcblxuXHRnZXRJbnB1dFR5cGU6IGZ1bmN0aW9uIChwcm9wZXJ0eUluZm86IGFueSwgZGF0YUZpZWxkQ29udmVydGVkOiBhbnksIG9EYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoKTogc3RyaW5nIHtcblx0XHRjb25zdCBlZGl0U3R5bGVQcm9wZXJ0aWVzID0ge30gYXMgRmllbGRQcm9wZXJ0aWVzO1xuXHRcdGxldCBpbnB1dFR5cGUhOiBzdHJpbmc7XG5cdFx0aWYgKHByb3BlcnR5SW5mbykge1xuXHRcdFx0c2V0RWRpdFN0eWxlUHJvcGVydGllcyhlZGl0U3R5bGVQcm9wZXJ0aWVzLCBkYXRhRmllbGRDb252ZXJ0ZWQsIG9EYXRhTW9kZWxQYXRoLCB0cnVlKTtcblx0XHRcdGlucHV0VHlwZSA9IGVkaXRTdHlsZVByb3BlcnRpZXM/LmVkaXRTdHlsZSB8fCBcIlwiO1xuXHRcdH1cblx0XHRjb25zdCBpc1ZhbGlkRm9yTWFzc0VkaXQgPVxuXHRcdFx0aW5wdXRUeXBlICYmXG5cdFx0XHRbXCJEYXRlUGlja2VyXCIsIFwiVGltZVBpY2tlclwiLCBcIkRhdGVUaW1lUGlja2VyXCIsIFwiUmF0aW5nSW5kaWNhdG9yXCJdLmluZGV4T2YoaW5wdXRUeXBlKSA9PT0gLTEgJiZcblx0XHRcdCFpc0NvbGxlY3Rpb25GaWVsZChvRGF0YU1vZGVsUGF0aCkgJiZcblx0XHRcdCFoYXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMocHJvcGVydHlJbmZvKTtcblxuXHRcdHJldHVybiAoaXNWYWxpZEZvck1hc3NFZGl0IHx8IFwiXCIpICYmIGlucHV0VHlwZTtcblx0fSxcblxuXHRnZXRJc0ZpZWxkR3JwOiBmdW5jdGlvbiAoZGF0YUZpZWxkQ29udmVydGVkOiBhbnkpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0ZGF0YUZpZWxkQ29udmVydGVkICYmXG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQW5ub3RhdGlvblwiICYmXG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQuVGFyZ2V0ICYmXG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQuVGFyZ2V0LnZhbHVlICYmXG5cdFx0XHRkYXRhRmllbGRDb252ZXJ0ZWQuVGFyZ2V0LnZhbHVlLmluZGV4T2YoXCJGaWVsZEdyb3VwXCIpID4gLTFcblx0XHQpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgdGV4dCBwYXRoIGZvciB0aGUgbWFzcyBlZGl0IGZpZWxkLlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHkgUHJvcGVydHkgcGF0aFxuXHQgKiBAcGFyYW0gdGV4dEJpbmRpbmcgVGV4dCBCaW5kaW5nIEluZm9cblx0ICogQHBhcmFtIGRpc3BsYXlNb2RlIERpc3BsYXkgbW9kZVxuXHQgKiBAcmV0dXJucyBUZXh0IFByb3BlcnR5IFBhdGggaWYgaXQgZXhpc3RzXG5cdCAqL1xuXHRnZXRUZXh0UGF0aDogZnVuY3Rpb24gKHByb3BlcnR5OiBzdHJpbmcsIHRleHRCaW5kaW5nOiBhbnksIGRpc3BsYXlNb2RlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdGxldCBkZXNjcmlwdGlvblBhdGg7XG5cdFx0aWYgKHRleHRCaW5kaW5nICYmICh0ZXh0QmluZGluZy5wYXRoIHx8ICh0ZXh0QmluZGluZy5wYXJhbWV0ZXJzICYmIHRleHRCaW5kaW5nLnBhcmFtZXRlcnMubGVuZ3RoKSkgJiYgcHJvcGVydHkpIHtcblx0XHRcdGlmICh0ZXh0QmluZGluZy5wYXRoICYmIGRpc3BsYXlNb2RlID09PSBcIkRlc2NyaXB0aW9uXCIpIHtcblx0XHRcdFx0ZGVzY3JpcHRpb25QYXRoID0gdGV4dEJpbmRpbmcucGF0aDtcblx0XHRcdH0gZWxzZSBpZiAodGV4dEJpbmRpbmcucGFyYW1ldGVycykge1xuXHRcdFx0XHR0ZXh0QmluZGluZy5wYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHByb3BzOiBCaW5kaW5nSW5mbykge1xuXHRcdFx0XHRcdGlmIChwcm9wcy5wYXRoICYmIHByb3BzLnBhdGggIT09IHByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRkZXNjcmlwdGlvblBhdGggPSBwcm9wcy5wYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBkZXNjcmlwdGlvblBhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEluaXRpYWxpemVzIGEgSlNPTiBNb2RlbCBmb3IgcHJvcGVydGllcyBvZiBkaWFsb2cgZmllbGRzIFtsYWJlbCwgdmlzaWJsaXR5LCBkYXRhcHJvcGVydHksIGV0Yy5dLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1RhYmxlIEluc3RhbmNlIG9mIFRhYmxlXG5cdCAqIEBwYXJhbSBhQ29udGV4dHMgQ29udGV4dHMgZm9yIG1hc3MgZWRpdFxuXHQgKiBAcGFyYW0gYURhdGFBcnJheSBBcnJheSBjb250YWluaW5nIGRhdGEgcmVsYXRlZCB0byB0aGUgZGlhbG9nIHVzZWQgYnkgYm90aCB0aGUgc3RhdGljIGFuZCB0aGUgcnVudGltZSBtb2RlbFxuXHQgKiBAcmV0dXJucyBUaGUgbW9kZWxcblx0ICovXG5cdHByZXBhcmVEYXRhRm9yRGlhbG9nOiBmdW5jdGlvbiAob1RhYmxlOiBUYWJsZSwgYUNvbnRleHRzOiBhbnlbXSwgYURhdGFBcnJheTogYW55W10pIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb1RhYmxlICYmIChvVGFibGUuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBhbnkpLFxuXHRcdFx0c0N1cnJlbnRFbnRpdHlTZXROYW1lID0gb1RhYmxlLmRhdGEoXCJtZXRhUGF0aFwiKSxcblx0XHRcdGFUYWJsZUZpZWxkcyA9IE1hc3NFZGl0SGVscGVyLmdldFRhYmxlRmllbGRzKG9UYWJsZSksXG5cdFx0XHRvRW50aXR5VHlwZUNvbnRleHQgPSBvTWV0YU1vZGVsLmdldENvbnRleHQoYCR7c0N1cnJlbnRFbnRpdHlTZXROYW1lfS9AYCksXG5cdFx0XHRvRW50aXR5U2V0Q29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0Q29udGV4dChzQ3VycmVudEVudGl0eVNldE5hbWUpLFxuXHRcdFx0b0RhdGFNb2RlbE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob0VudGl0eVR5cGVDb250ZXh0KTtcblxuXHRcdGNvbnN0IG9EYXRhRmllbGRNb2RlbCA9IG5ldyBKU09OTW9kZWwoKTtcblx0XHRsZXQgb1Jlc3VsdDtcblx0XHRsZXQgc0xhYmVsVGV4dDtcblx0XHRsZXQgYlZhbHVlSGVscEVuYWJsZWQ7XG5cdFx0bGV0IHNVbml0UHJvcGVydHlQYXRoO1xuXHRcdGxldCBiVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQ7XG5cdFx0bGV0IG9UZXh0QmluZGluZztcblxuXHRcdGFUYWJsZUZpZWxkcy5mb3JFYWNoKGZ1bmN0aW9uIChvQ29sdW1uSW5mbzogYW55KSB7XG5cdFx0XHRjb25zdCBzRGF0YVByb3BlcnR5UGF0aCA9IG9Db2x1bW5JbmZvLmRhdGFQcm9wZXJ0eTtcblx0XHRcdGlmIChzRGF0YVByb3BlcnR5UGF0aCkge1xuXHRcdFx0XHRsZXQgb1Byb3BlcnR5SW5mbyA9IHNEYXRhUHJvcGVydHlQYXRoICYmIG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDdXJyZW50RW50aXR5U2V0TmFtZX0vJHtzRGF0YVByb3BlcnR5UGF0aH1AYCk7XG5cdFx0XHRcdHNMYWJlbFRleHQgPVxuXHRcdFx0XHRcdG9Db2x1bW5JbmZvLmxhYmVsIHx8IChvUHJvcGVydHlJbmZvICYmIG9Qcm9wZXJ0eUluZm9bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkxhYmVsXCJdKSB8fCBzRGF0YVByb3BlcnR5UGF0aDtcblxuXHRcdFx0XHRpZiAob0RhdGFNb2RlbE9iamVjdFBhdGgpIHtcblx0XHRcdFx0XHRvRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3QgPSBvRGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZmlsdGVyKGZ1bmN0aW9uIChcblx0XHRcdFx0XHRcdG9Qcm9wZXJ0eTogYW55XG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb1Byb3BlcnR5Lm5hbWUgPT09IHNEYXRhUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9EYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdCA9IG9EYXRhTW9kZWxPYmplY3RQYXRoLnRhcmdldE9iamVjdFswXSB8fCB7fTtcblx0XHRcdFx0b1RleHRCaW5kaW5nID0gZ2V0VGV4dEJpbmRpbmcob0RhdGFNb2RlbE9iamVjdFBhdGgsIHt9LCB0cnVlKSB8fCB7fTtcblx0XHRcdFx0Y29uc3Qgb0ZpZWxkQ29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0Q29udGV4dChvQ29sdW1uSW5mby5hbm5vdGF0aW9uUGF0aCksXG5cdFx0XHRcdFx0b0RhdGFGaWVsZENvbnZlcnRlZCA9IGNvbnZlcnRNZXRhTW9kZWxDb250ZXh0KG9GaWVsZENvbnRleHQpLFxuXHRcdFx0XHRcdG9Qcm9wZXJ0eUNvbnRleHQgPSBvTWV0YU1vZGVsLmdldENvbnRleHQoYCR7c0N1cnJlbnRFbnRpdHlTZXROYW1lfS8ke3NEYXRhUHJvcGVydHlQYXRofUBgKSxcblx0XHRcdFx0XHRvSW50ZXJmYWNlID0gb1Byb3BlcnR5Q29udGV4dCAmJiBvUHJvcGVydHlDb250ZXh0LmdldEludGVyZmFjZSgpO1xuXG5cdFx0XHRcdGxldCBvRGF0YU1vZGVsUGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvRmllbGRDb250ZXh0LCBvRW50aXR5U2V0Q29udGV4dCk7XG5cdFx0XHRcdGlmIChvRGF0YUZpZWxkQ29udmVydGVkPy5WYWx1ZT8ucGF0aD8ubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdG9EYXRhTW9kZWxQYXRoID0gZW5oYW5jZURhdGFNb2RlbFBhdGgob0RhdGFNb2RlbFBhdGgsIHNEYXRhUHJvcGVydHlQYXRoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBiSGlkZGVuRmllbGQgPVxuXHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLmdldEhpZGRlblZhbHVlRm9yQ29udGV4dHMoXG5cdFx0XHRcdFx0XHRvRmllbGRDb250ZXh0ICYmIG9GaWVsZENvbnRleHQuZ2V0T2JqZWN0KClbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCJdLFxuXHRcdFx0XHRcdFx0YUNvbnRleHRzXG5cdFx0XHRcdFx0KSB8fCBmYWxzZTtcblx0XHRcdFx0Y29uc3QgaXNJbWFnZSA9IG9Qcm9wZXJ0eUluZm8gJiYgb1Byb3BlcnR5SW5mb1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc0ltYWdlVVJMXCJdO1xuXG5cdFx0XHRcdG9JbnRlcmZhY2UuY29udGV4dCA9IHtcblx0XHRcdFx0XHRnZXRNb2RlbDogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9JbnRlcmZhY2UuZ2V0TW9kZWwoKTtcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGdldFBhdGg6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdHJldHVybiBgJHtzQ3VycmVudEVudGl0eVNldE5hbWV9LyR7c0RhdGFQcm9wZXJ0eVBhdGh9YDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHRcdG9Qcm9wZXJ0eUluZm8gPVxuXHRcdFx0XHRcdG9EYXRhRmllbGRDb252ZXJ0ZWQuX3R5cGUgPT09IFwiUHJvcGVydHlcIlxuXHRcdFx0XHRcdFx0PyBvRGF0YUZpZWxkQ29udmVydGVkXG5cdFx0XHRcdFx0XHQ6IChvRGF0YUZpZWxkQ29udmVydGVkICYmIG9EYXRhRmllbGRDb252ZXJ0ZWQuVmFsdWUgJiYgb0RhdGFGaWVsZENvbnZlcnRlZC5WYWx1ZS4kdGFyZ2V0KSB8fFxuXHRcdFx0XHRcdFx0ICAob0RhdGFGaWVsZENvbnZlcnRlZCAmJiBvRGF0YUZpZWxkQ29udmVydGVkLlRhcmdldCAmJiBvRGF0YUZpZWxkQ29udmVydGVkLlRhcmdldC4kdGFyZ2V0KTtcblx0XHRcdFx0Ly8gRGF0YWZpZWxkIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgRmllbGRDb250cm9sIGNhbGN1bGF0aW9uLCBuZWVkcyB0byBiZSBpbXBsZW1lbnRlZFxuXG5cdFx0XHRcdGNvbnN0IGNoYXJ0UHJvcGVydHkgPSBvUHJvcGVydHlJbmZvICYmIG9Qcm9wZXJ0eUluZm8udGVybSAmJiBvUHJvcGVydHlJbmZvLnRlcm0gPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIjtcblx0XHRcdFx0Y29uc3QgaXNBY3Rpb24gPSAhIW9EYXRhRmllbGRDb252ZXJ0ZWQuQWN0aW9uO1xuXHRcdFx0XHRjb25zdCBpc0ZpZWxkR3JwID0gTWFzc0VkaXRIZWxwZXIuZ2V0SXNGaWVsZEdycChvRGF0YUZpZWxkQ29udmVydGVkKTtcblx0XHRcdFx0aWYgKGlzSW1hZ2UgfHwgYkhpZGRlbkZpZWxkIHx8IGNoYXJ0UHJvcGVydHkgfHwgaXNBY3Rpb24gfHwgaXNGaWVsZEdycCkge1xuXHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFZhbHVlSGVscCBwcm9wZXJ0aWVzXG5cdFx0XHRcdHNVbml0UHJvcGVydHlQYXRoID1cblx0XHRcdFx0XHQoKGhhc0N1cnJlbmN5KG9Qcm9wZXJ0eUluZm8pIHx8IGhhc1VuaXQob1Byb3BlcnR5SW5mbykpICYmIGdldEFzc29jaWF0ZWRVbml0UHJvcGVydHlQYXRoKG9Qcm9wZXJ0eUluZm8pKSB8fCBcIlwiO1xuXHRcdFx0XHRjb25zdCB1bml0UHJvcGVydHlJbmZvID0gc1VuaXRQcm9wZXJ0eVBhdGggJiYgZ2V0QXNzb2NpYXRlZFVuaXRQcm9wZXJ0eShvUHJvcGVydHlJbmZvKTtcblx0XHRcdFx0YlZhbHVlSGVscEVuYWJsZWQgPSBoYXNWYWx1ZUhlbHAob1Byb3BlcnR5SW5mbyk7XG5cdFx0XHRcdGJWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdCA9IHVuaXRQcm9wZXJ0eUluZm8gJiYgaGFzVmFsdWVIZWxwKHVuaXRQcm9wZXJ0eUluZm8pO1xuXG5cdFx0XHRcdGNvbnN0IGhhc0NvbnRleHREZXBlbmRlbnRWSCA9XG5cdFx0XHRcdFx0KGJWYWx1ZUhlbHBFbmFibGVkIHx8IGJWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdCkgJiZcblx0XHRcdFx0XHQob1Byb3BlcnR5SW5mbz8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uVmFsdWVMaXN0UmVsZXZhbnRRdWFsaWZpZXJzIHx8XG5cdFx0XHRcdFx0XHQodW5pdFByb3BlcnR5SW5mbyAmJiB1bml0UHJvcGVydHlJbmZvPy5hbm5vdGF0aW9ucz8uQ29tbW9uPy5WYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnMpKTtcblx0XHRcdFx0aWYgKGhhc0NvbnRleHREZXBlbmRlbnRWSCkge1xuXHRcdFx0XHRcdC8vIGNvbnRleHQgZGVwZW5kZW50IFZIIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIE1hc3MgRWRpdC5cblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBFZGl0TW9kZSBhbmQgSW5wdXRUeXBlXG5cdFx0XHRcdGNvbnN0IHByb3BlcnR5Rm9yRmllbGRDb250cm9sID0gb1Byb3BlcnR5SW5mbyAmJiBvUHJvcGVydHlJbmZvLlZhbHVlID8gb1Byb3BlcnR5SW5mby5WYWx1ZSA6IG9Qcm9wZXJ0eUluZm87XG5cdFx0XHRcdGNvbnN0IGV4cEJpbmRpbmcgPSBnZXRFZGl0TW9kZShwcm9wZXJ0eUZvckZpZWxkQ29udHJvbCwgb0RhdGFNb2RlbFBhdGgsIGZhbHNlLCBmYWxzZSwgb0RhdGFGaWVsZENvbnZlcnRlZCwgY29uc3RhbnQodHJ1ZSkpO1xuXHRcdFx0XHRjb25zdCBlZGl0TW9kZVZhbHVlcyA9IE9iamVjdC5rZXlzKEVkaXRNb2RlKTtcblx0XHRcdFx0Y29uc3QgZWRpdE1vZGVJc1N0YXRpYyA9ICEhZXhwQmluZGluZyAmJiBlZGl0TW9kZVZhbHVlcy5pbmNsdWRlcyhleHBCaW5kaW5nIGFzIEVkaXRNb2RlKTtcblx0XHRcdFx0Y29uc3QgZWRpdGFibGUgPSAhIWV4cEJpbmRpbmcgJiYgKChlZGl0TW9kZUlzU3RhdGljICYmIGV4cEJpbmRpbmcgPT09IEVkaXRNb2RlLkVkaXRhYmxlKSB8fCAhZWRpdE1vZGVJc1N0YXRpYyk7XG5cdFx0XHRcdGNvbnN0IG5hdlByb3BlcnR5V2l0aFZhbHVlSGVscCA9IHNEYXRhUHJvcGVydHlQYXRoLmluY2x1ZGVzKFwiL1wiKSAmJiBiVmFsdWVIZWxwRW5hYmxlZDtcblx0XHRcdFx0aWYgKCFlZGl0YWJsZSB8fCBuYXZQcm9wZXJ0eVdpdGhWYWx1ZUhlbHApIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCBpbnB1dFR5cGUgPSBNYXNzRWRpdEhlbHBlci5nZXRJbnB1dFR5cGUob1Byb3BlcnR5SW5mbywgb0RhdGFGaWVsZENvbnZlcnRlZCwgb0RhdGFNb2RlbFBhdGgpO1xuXG5cdFx0XHRcdGlmIChpbnB1dFR5cGUpIHtcblx0XHRcdFx0XHRjb25zdCByZWxhdGl2ZVBhdGggPSBnZXRSZWxhdGl2ZVBhdGhzKG9EYXRhTW9kZWxQYXRoKTtcblx0XHRcdFx0XHRjb25zdCBpc1JlYWRPbmx5ID0gaXNSZWFkT25seUV4cHJlc3Npb24ob1Byb3BlcnR5SW5mbywgcmVsYXRpdmVQYXRoKTtcblx0XHRcdFx0XHRjb25zdCBkaXNwbGF5TW9kZSA9IENvbW1vblV0aWxzLmNvbXB1dGVEaXNwbGF5TW9kZShvUHJvcGVydHlDb250ZXh0LmdldE9iamVjdCgpKTtcblx0XHRcdFx0XHRjb25zdCBpc1ZhbHVlSGVscEVuYWJsZWQgPSBiVmFsdWVIZWxwRW5hYmxlZCA/IGJWYWx1ZUhlbHBFbmFibGVkIDogZmFsc2U7XG5cdFx0XHRcdFx0Y29uc3QgaXNWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdCA9XG5cdFx0XHRcdFx0XHRiVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQgJiYgIXNVbml0UHJvcGVydHlQYXRoLmluY2x1ZGVzKFwiL1wiKSA/IGJWYWx1ZUhlbHBFbmFibGVkRm9yVW5pdCA6IGZhbHNlO1xuXHRcdFx0XHRcdGNvbnN0IHVuaXRQcm9wZXJ0eSA9IHNVbml0UHJvcGVydHlQYXRoICYmICFzRGF0YVByb3BlcnR5UGF0aC5pbmNsdWRlcyhcIi9cIikgPyBzVW5pdFByb3BlcnR5UGF0aCA6IGZhbHNlO1xuXG5cdFx0XHRcdFx0b1Jlc3VsdCA9IHtcblx0XHRcdFx0XHRcdFwibGFiZWxcIjogc0xhYmVsVGV4dCxcblx0XHRcdFx0XHRcdFwiZGF0YVByb3BlcnR5XCI6IHNEYXRhUHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdFx0XCJpc1ZhbHVlSGVscEVuYWJsZWRcIjogYlZhbHVlSGVscEVuYWJsZWQgPyBiVmFsdWVIZWxwRW5hYmxlZCA6IGZhbHNlLFxuXHRcdFx0XHRcdFx0dW5pdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XCJpc0ZpZWxkUmVxdWlyZWRcIjogZ2V0UmVxdWlyZWRFeHByZXNzaW9uKG9Qcm9wZXJ0eUluZm8sIG9EYXRhRmllbGRDb252ZXJ0ZWQsIHRydWUsIGZhbHNlLCB7fSwgb0RhdGFNb2RlbFBhdGgpLFxuXHRcdFx0XHRcdFx0XCJkZWZhdWx0U2VsZWN0aW9uUGF0aFwiOiBzRGF0YVByb3BlcnR5UGF0aFxuXHRcdFx0XHRcdFx0XHQ/IE1hc3NFZGl0SGVscGVyLmdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3goYUNvbnRleHRzLCBzRGF0YVByb3BlcnR5UGF0aClcblx0XHRcdFx0XHRcdFx0OiBmYWxzZSxcblx0XHRcdFx0XHRcdFwiZGVmYXVsdFNlbGVjdGlvblVuaXRQYXRoXCI6IHNVbml0UHJvcGVydHlQYXRoXG5cdFx0XHRcdFx0XHRcdD8gTWFzc0VkaXRIZWxwZXIuZ2V0RGVmYXVsdFNlbGVjdGlvblBhdGhDb21ib0JveChhQ29udGV4dHMsIHNVbml0UHJvcGVydHlQYXRoKVxuXHRcdFx0XHRcdFx0XHQ6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XCJlbnRpdHlTZXRcIjogc0N1cnJlbnRFbnRpdHlTZXROYW1lLFxuXHRcdFx0XHRcdFx0XCJkaXNwbGF5XCI6IGRpc3BsYXlNb2RlLFxuXHRcdFx0XHRcdFx0XCJkZXNjcmlwdGlvblBhdGhcIjogTWFzc0VkaXRIZWxwZXIuZ2V0VGV4dFBhdGgoc0RhdGFQcm9wZXJ0eVBhdGgsIG9UZXh0QmluZGluZywgZGlzcGxheU1vZGUpLFxuXHRcdFx0XHRcdFx0XCJudWxsYWJsZVwiOiBvUHJvcGVydHlJbmZvLm51bGxhYmxlICE9PSB1bmRlZmluZWQgPyBvUHJvcGVydHlJbmZvLm51bGxhYmxlIDogdHJ1ZSxcblx0XHRcdFx0XHRcdFwiaXNQcm9wZXJ0eVJlYWRPbmx5XCI6IGlzUmVhZE9ubHkgIT09IHVuZGVmaW5lZCA/IGlzUmVhZE9ubHkgOiBmYWxzZSxcblx0XHRcdFx0XHRcdFwiaW5wdXRUeXBlXCI6IGlucHV0VHlwZSxcblx0XHRcdFx0XHRcdFwiZWRpdE1vZGVcIjogZWRpdGFibGUgPyBleHBCaW5kaW5nIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRcdFx0XCJwcm9wZXJ0eUluZm9cIjoge1xuXHRcdFx0XHRcdFx0XHRcImhhc1ZIXCI6IGlzVmFsdWVIZWxwRW5hYmxlZCxcblx0XHRcdFx0XHRcdFx0XCJydW50aW1lUGF0aFwiOiBcImZpZWxkc0luZm8+L3ZhbHVlcy9cIixcblx0XHRcdFx0XHRcdFx0XCJyZWxhdGl2ZVBhdGhcIjogc0RhdGFQcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdFx0XHRcdFwicHJvcGVydHlQYXRoRm9yVmFsdWVIZWxwXCI6IGAke3NDdXJyZW50RW50aXR5U2V0TmFtZX0vJHtzRGF0YVByb3BlcnR5UGF0aH1gXG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0XCJ1bml0SW5mb1wiOiB1bml0UHJvcGVydHkgJiYge1xuXHRcdFx0XHRcdFx0XHRcImhhc1ZIXCI6IGlzVmFsdWVIZWxwRW5hYmxlZEZvclVuaXQsXG5cdFx0XHRcdFx0XHRcdFwicnVudGltZVBhdGhcIjogXCJmaWVsZHNJbmZvPi91bml0RGF0YS9cIixcblx0XHRcdFx0XHRcdFx0XCJyZWxhdGl2ZVBhdGhcIjogdW5pdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRcInByb3BlcnR5UGF0aEZvclZhbHVlSGVscFwiOiBgJHtzQ3VycmVudEVudGl0eVNldE5hbWV9LyR7dW5pdFByb3BlcnR5fWBcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdGFEYXRhQXJyYXkucHVzaChvUmVzdWx0KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdG9EYXRhRmllbGRNb2RlbC5zZXREYXRhKGFEYXRhQXJyYXkpO1xuXHRcdHJldHVybiBvRGF0YUZpZWxkTW9kZWw7XG5cdH0sXG5cblx0Z2V0VGFibGVGaWVsZHM6IGZ1bmN0aW9uIChvVGFibGU6IGFueSkge1xuXHRcdGNvbnN0IGFDb2x1bW5zID0gKG9UYWJsZSAmJiBvVGFibGUuZ2V0Q29sdW1ucygpKSB8fCBbXTtcblx0XHRjb25zdCBjb2x1bW5zRGF0YSA9IG9UYWJsZSAmJiBvVGFibGUuZ2V0UGFyZW50KCkuZ2V0VGFibGVEZWZpbml0aW9uKCkuY29sdW1ucztcblx0XHRyZXR1cm4gYUNvbHVtbnMubWFwKGZ1bmN0aW9uIChvQ29sdW1uOiBhbnkpIHtcblx0XHRcdGNvbnN0IHNEYXRhUHJvcGVydHkgPSBvQ29sdW1uICYmIG9Db2x1bW4uZ2V0RGF0YVByb3BlcnR5KCksXG5cdFx0XHRcdGFSZWFsdGVkQ29sdW1uSW5mbyA9XG5cdFx0XHRcdFx0Y29sdW1uc0RhdGEgJiZcblx0XHRcdFx0XHRjb2x1bW5zRGF0YS5maWx0ZXIoZnVuY3Rpb24gKG9Db2x1bW5JbmZvOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvQ29sdW1uSW5mby5uYW1lID09PSBzRGF0YVByb3BlcnR5ICYmIG9Db2x1bW5JbmZvLnR5cGUgPT09IFwiQW5ub3RhdGlvblwiO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XCJkYXRhUHJvcGVydHlcIjogc0RhdGFQcm9wZXJ0eSxcblx0XHRcdFx0XCJsYWJlbFwiOiBvQ29sdW1uLmdldEhlYWRlcigpLFxuXHRcdFx0XHRcImFubm90YXRpb25QYXRoXCI6IGFSZWFsdGVkQ29sdW1uSW5mbyAmJiBhUmVhbHRlZENvbHVtbkluZm9bMF0gJiYgYVJlYWx0ZWRDb2x1bW5JbmZvWzBdLmFubm90YXRpb25QYXRoXG5cdFx0XHR9O1xuXHRcdH0pO1xuXHR9LFxuXG5cdGdldERlZmF1bHRUZXh0c0ZvckRpYWxvZzogZnVuY3Rpb24gKG9SZXNvdXJjZUJ1bmRsZTogYW55LCBpU2VsZWN0ZWRDb250ZXh0czogYW55LCBvVGFibGU6IGFueSkge1xuXHRcdC8vIFRoZSBjb25maXJtIGJ1dHRvbiB0ZXh0IGlzIFwiU2F2ZVwiIGZvciB0YWJsZSBpbiBEaXNwbGF5IG1vZGUgYW5kIFwiQXBwbHlcIiBmb3IgdGFibGUgaW4gZWRpdCBtb2RlLiBUaGlzIGNhbiBiZSBsYXRlciBleHBvc2VkIGlmIG5lZWRlZC5cblx0XHRjb25zdCBiRGlzcGxheU1vZGUgPSBvVGFibGUuZGF0YShcImRpc3BsYXlNb2RlUHJvcGVydHlCaW5kaW5nXCIpID09PSBcInRydWVcIjtcblxuXHRcdHJldHVybiB7XG5cdFx0XHRcImtlZXBFeGlzdGluZ1ByZWZpeFwiOiBcIjwgS2VlcFwiLFxuXHRcdFx0XCJsZWF2ZUJsYW5rVmFsdWVcIjogXCI8IExlYXZlIEJsYW5rID5cIixcblx0XHRcdFwiY2xlYXJGaWVsZFZhbHVlXCI6IFwiPCBDbGVhciBWYWx1ZXMgPlwiLFxuXHRcdFx0XCJtYXNzRWRpdFRpdGxlXCI6IG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19NQVNTX0VESVRfRElBTE9HX1RJVExFXCIsIGlTZWxlY3RlZENvbnRleHRzLnRvU3RyaW5nKCkpLFxuXHRcdFx0XCJhcHBseUJ1dHRvblRleHRcIjogYkRpc3BsYXlNb2RlXG5cdFx0XHRcdD8gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01BU1NfRURJVF9TQVZFX0JVVFRPTl9URVhUXCIpXG5cdFx0XHRcdDogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01BU1NfRURJVF9BUFBMWV9CVVRUT05fVEVYVFwiKSxcblx0XHRcdFwidXNlVmFsdWVIZWxwVmFsdWVcIjogXCI8IFVzZSBWYWx1ZSBIZWxwID5cIixcblx0XHRcdFwiY2FuY2VsQnV0dG9uVGV4dFwiOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX09CSkVDVF9QQUdFX0NBTkNFTFwiKSxcblx0XHRcdFwibm9GaWVsZHNcIjogb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJDX01BU1NfRURJVF9OT19FRElUQUJMRV9GSUVMRFNcIiksXG5cdFx0XHRcIm9rQnV0dG9uVGV4dFwiOiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX0RJQUxPR19PS1wiKVxuXHRcdH07XG5cdH0sXG5cblx0LyoqXG5cdCAqIEFkZHMgYSBzdWZmaXggdG8gdGhlICdrZWVwIGV4aXN0aW5nJyBwcm9wZXJ0eSBvZiB0aGUgY29tYm9Cb3guXG5cdCAqXG5cdCAqIEBwYXJhbSBzSW5wdXRUeXBlIElucHV0VHlwZSBvZiB0aGUgZmllbGRcblx0ICogQHJldHVybnMgVGhlIG1vZGlmaWVkIHN0cmluZ1xuXHQgKi9cblx0Ly8gZ2V0U3VmZml4Rm9yS2VlcEV4aXNpdGluZzogZnVuY3Rpb24gKHNJbnB1dFR5cGU6IHN0cmluZykge1xuXHQvLyBcdGxldCBzUmVzdWx0ID0gXCJWYWx1ZXNcIjtcblxuXHQvLyBcdHN3aXRjaCAoc0lucHV0VHlwZSkge1xuXHQvLyBcdFx0Ly9UT0RPIC0gQWRkIGZvciBvdGhlciBjb250cm9sIHR5cGVzIGFzIHdlbGwgKFJhZGlvIEJ1dHRvbiwgRW1haWwsIElucHV0LCBNREMgRmllbGRzLCBJbWFnZSBldGMuKVxuXHQvLyBcdFx0Y2FzZSBcIkRhdGVQaWNrZXJcIjpcblx0Ly8gXHRcdFx0c1Jlc3VsdCA9IFwiRGF0ZXNcIjtcblx0Ly8gXHRcdFx0YnJlYWs7XG5cdC8vIFx0XHRjYXNlIFwiQ2hlY2tCb3hcIjpcblx0Ly8gXHRcdFx0c1Jlc3VsdCA9IFwiU2V0dGluZ3NcIjtcblx0Ly8gXHRcdFx0YnJlYWs7XG5cdC8vIFx0XHRkZWZhdWx0OlxuXHQvLyBcdFx0XHRzUmVzdWx0ID0gXCJWYWx1ZXNcIjtcblx0Ly8gXHR9XG5cdC8vIFx0cmV0dXJuIHNSZXN1bHQ7XG5cdC8vIH0sXG5cblx0LyoqXG5cdCAqIEFkZHMgZGVmYXVsdCB2YWx1ZXMgdG8gdGhlIG1vZGVsIFtLZWVwIEV4aXN0aW5nIFZhbHVlcywgTGVhdmUgQmxhbmtdLlxuXHQgKlxuXHQgKiBAcGFyYW0gYVZhbHVlcyBBcnJheSBpbnN0YW5jZSB3aGVyZSB0aGUgZGVmYXVsdCBkYXRhIG5lZWRzIHRvIGJlIGFkZGVkXG5cdCAqIEBwYXJhbSBvRGVmYXVsdFZhbHVlcyBEZWZhdWx0IHZhbHVlcyBmcm9tIEFwcGxpY2F0aW9uIE1hbmlmZXN0XG5cdCAqIEBwYXJhbSBvUHJvcGVydHlJbmZvIFByb3BlcnR5IGluZm9ybWF0aW9uXG5cdCAqIEBwYXJhbSBiVU9NRmllbGRcblx0ICovXG5cdHNldERlZmF1bHRWYWx1ZXNUb0RpYWxvZzogZnVuY3Rpb24gKGFWYWx1ZXM6IGFueSwgb0RlZmF1bHRWYWx1ZXM6IGFueSwgb1Byb3BlcnR5SW5mbzogYW55LCBiVU9NRmllbGQ/OiBib29sZWFuKSB7XG5cdFx0Y29uc3Qgc1Byb3BlcnR5UGF0aCA9IGJVT01GaWVsZCA/IG9Qcm9wZXJ0eUluZm8udW5pdFByb3BlcnR5IDogb1Byb3BlcnR5SW5mby5kYXRhUHJvcGVydHksXG5cdFx0XHRzSW5wdXRUeXBlID0gb1Byb3BlcnR5SW5mby5pbnB1dFR5cGUsXG5cdFx0XHRiUHJvcGVydHlSZXF1aXJlZCA9IG9Qcm9wZXJ0eUluZm8uaXNGaWVsZFJlcXVpcmVkO1xuXHRcdC8vIGNvbnN0IHNTdWZmaXhGb3JLZWVwRXhpc3RpbmcgPSBNYXNzRWRpdEhlbHBlci5nZXRTdWZmaXhGb3JLZWVwRXhpc2l0aW5nKHNJbnB1dFR5cGUpO1xuXHRcdGNvbnN0IHNTdWZmaXhGb3JLZWVwRXhpc3RpbmcgPSBcIlZhbHVlc1wiO1xuXHRcdGFWYWx1ZXMuZGVmYXVsdE9wdGlvbnMgPSBhVmFsdWVzLmRlZmF1bHRPcHRpb25zIHx8IFtdO1xuXHRcdGNvbnN0IHNlbGVjdE9wdGlvbnNFeGlzdCA9IGFWYWx1ZXMuc2VsZWN0T3B0aW9ucyAmJiBhVmFsdWVzLnNlbGVjdE9wdGlvbnMubGVuZ3RoID4gMDtcblx0XHRjb25zdCBrZWVwRW50cnkgPSB7XG5cdFx0XHR0ZXh0OiBgJHtvRGVmYXVsdFZhbHVlcy5rZWVwRXhpc3RpbmdQcmVmaXh9ICR7c1N1ZmZpeEZvcktlZXBFeGlzdGluZ30gPmAsXG5cdFx0XHRrZXk6IGBEZWZhdWx0LyR7c1Byb3BlcnR5UGF0aH1gXG5cdFx0fTtcblxuXHRcdGlmIChzSW5wdXRUeXBlID09PSBcIkNoZWNrQm94XCIpIHtcblx0XHRcdGNvbnN0IGZhbHNlRW50cnkgPSB7IHRleHQ6IFwiTm9cIiwga2V5OiBgJHtzUHJvcGVydHlQYXRofS9mYWxzZWAsIHRleHRJbmZvOiB7IHZhbHVlOiBmYWxzZSB9IH07XG5cdFx0XHRjb25zdCB0cnV0aHlFbnRyeSA9IHsgdGV4dDogXCJZZXNcIiwga2V5OiBgJHtzUHJvcGVydHlQYXRofS90cnVlYCwgdGV4dEluZm86IHsgdmFsdWU6IHRydWUgfSB9O1xuXHRcdFx0YVZhbHVlcy51bnNoaWZ0KGZhbHNlRW50cnkpO1xuXHRcdFx0YVZhbHVlcy5kZWZhdWx0T3B0aW9ucy51bnNoaWZ0KGZhbHNlRW50cnkpO1xuXHRcdFx0YVZhbHVlcy51bnNoaWZ0KHRydXRoeUVudHJ5KTtcblx0XHRcdGFWYWx1ZXMuZGVmYXVsdE9wdGlvbnMudW5zaGlmdCh0cnV0aHlFbnRyeSk7XG5cdFx0XHRhVmFsdWVzLnVuc2hpZnQoa2VlcEVudHJ5KTtcblx0XHRcdGFWYWx1ZXMuZGVmYXVsdE9wdGlvbnMudW5zaGlmdChrZWVwRW50cnkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRpZiAob1Byb3BlcnR5SW5mbz8ucHJvcGVydHlJbmZvPy5oYXNWSCB8fCAob1Byb3BlcnR5SW5mbz8udW5pdEluZm8/Lmhhc1ZIICYmIGJVT01GaWVsZCkpIHtcblx0XHRcdFx0Y29uc3QgdmhkRW50cnkgPSB7IHRleHQ6IG9EZWZhdWx0VmFsdWVzLnVzZVZhbHVlSGVscFZhbHVlLCBrZXk6IGBVc2VWYWx1ZUhlbHBWYWx1ZS8ke3NQcm9wZXJ0eVBhdGh9YCB9O1xuXHRcdFx0XHRhVmFsdWVzLnVuc2hpZnQodmhkRW50cnkpO1xuXHRcdFx0XHRhVmFsdWVzLmRlZmF1bHRPcHRpb25zLnVuc2hpZnQodmhkRW50cnkpO1xuXHRcdFx0fVxuXHRcdFx0aWYgKHNlbGVjdE9wdGlvbnNFeGlzdCkge1xuXHRcdFx0XHRpZiAoYlByb3BlcnR5UmVxdWlyZWQgIT09IFwidHJ1ZVwiICYmICFiVU9NRmllbGQpIHtcblx0XHRcdFx0XHRjb25zdCBjbGVhckVudHJ5ID0geyB0ZXh0OiBvRGVmYXVsdFZhbHVlcy5jbGVhckZpZWxkVmFsdWUsIGtleTogYENsZWFyRmllbGRWYWx1ZS8ke3NQcm9wZXJ0eVBhdGh9YCB9O1xuXHRcdFx0XHRcdGFWYWx1ZXMudW5zaGlmdChjbGVhckVudHJ5KTtcblx0XHRcdFx0XHRhVmFsdWVzLmRlZmF1bHRPcHRpb25zLnVuc2hpZnQoY2xlYXJFbnRyeSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0YVZhbHVlcy51bnNoaWZ0KGtlZXBFbnRyeSk7XG5cdFx0XHRcdGFWYWx1ZXMuZGVmYXVsdE9wdGlvbnMudW5zaGlmdChrZWVwRW50cnkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgZW1wdHlFbnRyeSA9IHsgdGV4dDogb0RlZmF1bHRWYWx1ZXMubGVhdmVCbGFua1ZhbHVlLCBrZXk6IGBEZWZhdWx0LyR7c1Byb3BlcnR5UGF0aH1gIH07XG5cdFx0XHRcdGFWYWx1ZXMudW5zaGlmdChlbXB0eUVudHJ5KTtcblx0XHRcdFx0YVZhbHVlcy5kZWZhdWx0T3B0aW9ucy51bnNoaWZ0KGVtcHR5RW50cnkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogR2V0IHRleHQgYXJyYW5nZW1lbnQgaW5mbyBmb3IgYSBjb250ZXh0IHByb3BlcnR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gcHJvcGVydHkgUHJvcGVydHkgUGF0aFxuXHQgKiBAcGFyYW0gZGVzY3JpcHRpb25QYXRoIFBhdGggdG8gdGV4dCBhc3NvY2lhdGlvbiBvZiB0aGUgcHJvcGVydHlcblx0ICogQHBhcmFtIGRpc3BsYXlNb2RlIERpc3BsYXkgbW9kZSBvZiB0aGUgcHJvcGVydHkgYW5kIHRleHQgYXNzb2NpYXRpb25cblx0ICogQHBhcmFtIHNlbGVjdGVkQ29udGV4dCBDb250ZXh0IHRvIGZpbmQgdGhlIGZ1bGwgdGV4dFxuXHQgKiBAcmV0dXJucyBUaGUgdGV4dCBhcnJhbmdlbWVudFxuXHQgKi9cblx0Z2V0VGV4dEFycmFuZ2VtZW50SW5mbzogZnVuY3Rpb24gKFxuXHRcdHByb3BlcnR5OiBzdHJpbmcsXG5cdFx0ZGVzY3JpcHRpb25QYXRoOiBzdHJpbmcsXG5cdFx0ZGlzcGxheU1vZGU6IHN0cmluZyxcblx0XHRzZWxlY3RlZENvbnRleHQ6IENvbnRleHRcblx0KTogVGV4dEFycmFuZ2VtZW50SW5mbyB7XG5cdFx0bGV0IHZhbHVlID0gc2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChwcm9wZXJ0eSksXG5cdFx0XHRkZXNjcmlwdGlvblZhbHVlLFxuXHRcdFx0ZnVsbFRleHQ7XG5cdFx0aWYgKGRlc2NyaXB0aW9uUGF0aCAmJiBwcm9wZXJ0eSkge1xuXHRcdFx0c3dpdGNoIChkaXNwbGF5TW9kZSkge1xuXHRcdFx0XHRjYXNlIFwiRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0XHRkZXNjcmlwdGlvblZhbHVlID0gc2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChkZXNjcmlwdGlvblBhdGgpIHx8IFwiXCI7XG5cdFx0XHRcdFx0ZnVsbFRleHQgPSBkZXNjcmlwdGlvblZhbHVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRjYXNlIFwiVmFsdWVcIjpcblx0XHRcdFx0XHR2YWx1ZSA9IHNlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QocHJvcGVydHkpIHx8IFwiXCI7XG5cdFx0XHRcdFx0ZnVsbFRleHQgPSB2YWx1ZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIlZhbHVlRGVzY3JpcHRpb25cIjpcblx0XHRcdFx0XHR2YWx1ZSA9IHNlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QocHJvcGVydHkpIHx8IFwiXCI7XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25WYWx1ZSA9IHNlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QoZGVzY3JpcHRpb25QYXRoKSB8fCBcIlwiO1xuXHRcdFx0XHRcdGZ1bGxUZXh0ID0gZGVzY3JpcHRpb25WYWx1ZSA/IGAke3ZhbHVlfSAoJHtkZXNjcmlwdGlvblZhbHVlfSlgIDogdmFsdWU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJEZXNjcmlwdGlvblZhbHVlXCI6XG5cdFx0XHRcdFx0dmFsdWUgPSBzZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KHByb3BlcnR5KSB8fCBcIlwiO1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uVmFsdWUgPSBzZWxlY3RlZENvbnRleHQuZ2V0T2JqZWN0KGRlc2NyaXB0aW9uUGF0aCkgfHwgXCJcIjtcblx0XHRcdFx0XHRmdWxsVGV4dCA9IGRlc2NyaXB0aW9uVmFsdWUgPyBgJHtkZXNjcmlwdGlvblZhbHVlfSAoJHt2YWx1ZX0pYCA6IHZhbHVlO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdExvZy5pbmZvKGBEaXNwbGF5IFByb3BlcnR5IG5vdCBhcHBsaWNhYmxlOiAke3Byb3BlcnR5fWApO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiB7XG5cdFx0XHRcInRleHRBcnJhbmdlbWVudFwiOiBkaXNwbGF5TW9kZSxcblx0XHRcdFwidmFsdWVQYXRoXCI6IHByb3BlcnR5LFxuXHRcdFx0XCJkZXNjcmlwdGlvblBhdGhcIjogZGVzY3JpcHRpb25QYXRoLFxuXHRcdFx0XCJ2YWx1ZVwiOiB2YWx1ZSxcblx0XHRcdFwiZGVzY3JpcHRpb25cIjogZGVzY3JpcHRpb25WYWx1ZSxcblx0XHRcdFwiZnVsbFRleHRcIjogZnVsbFRleHRcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm4gdGhlIHZpc2liaWxpdHkgdmFsdXVlIGZvciB0aGUgTWFuYWdlZE9iamVjdCBBbnkuXG5cdCAqXG5cdCAqIEBwYXJhbSBhbnkgVGhlIE1hbmFnZWRPYmplY3QgQW55IHRvIGJlIHVzZWQgdG8gY2FsY3VsYXRlIHRoZSB2aXNpYmxlIHZhbHVlIG9mIHRoZSBiaW5kaW5nLlxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgdGhlIG1hc3MgZWRpdCBmaWVsZCBpcyBlZGl0YWJsZS5cblx0ICovXG5cdGlzRWRpdGFibGU6IGZ1bmN0aW9uIChhbnk6IEFueVR5cGUpOiBib29sZWFuIHtcblx0XHRjb25zdCBiaW5kaW5nID0gYW55LmdldEJpbmRpbmcoXCJhbnlcIik7XG5cdFx0Y29uc3QgdmFsdWUgPSAoYmluZGluZyBhcyBhbnkpLmdldEV4dGVybmFsVmFsdWUoKTtcblx0XHRyZXR1cm4gdmFsdWUgPT09IEVkaXRNb2RlLkVkaXRhYmxlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxjdWxhdGUgYW5kIHVwZGF0ZSB0aGUgdmlzaWJpbGl0eSBvZiBtYXNzIGVkaXQgZmllbGQgb24gY2hhbmdlIG9mIHRoZSBNYW5hZ2VkT2JqZWN0IEFueSBiaW5kaW5nLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0RpYWxvZ0RhdGFNb2RlbCBNb2RlbCB0byBiZSB1c2VkIHJ1bnRpbWUuXG5cdCAqIEBwYXJhbSBkYXRhUHJvcGVydHkgRmllbGQgbmFtZS5cblx0ICovXG5cdG9uQ29udGV4dEVkaXRhYmxlQ2hhbmdlOiBmdW5jdGlvbiAob0RpYWxvZ0RhdGFNb2RlbDogSlNPTk1vZGVsLCBkYXRhUHJvcGVydHk6IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnN0IG9iamVjdHNGb3JWaXNpYmlsaXR5ID0gb0RpYWxvZ0RhdGFNb2RlbC5nZXRQcm9wZXJ0eShgL3ZhbHVlcy8ke2RhdGFQcm9wZXJ0eX0vb2JqZWN0c0ZvclZpc2liaWxpdHlgKSB8fCBbXTtcblx0XHRjb25zdCBlZGl0YWJsZSA9IG9iamVjdHNGb3JWaXNpYmlsaXR5LnNvbWUoTWFzc0VkaXRIZWxwZXIuaXNFZGl0YWJsZSk7XG5cblx0XHRpZiAoZWRpdGFibGUpIHtcblx0XHRcdG9EaWFsb2dEYXRhTW9kZWwuc2V0UHJvcGVydHkoYC92YWx1ZXMvJHtkYXRhUHJvcGVydHl9L3Zpc2libGVgLCBlZGl0YWJsZSk7XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgTWFuYWdlZCBPYmplY3QgQW55IGZvciB2aXNpYmlsaXR5IG9mIHRoZSBtYXNzIGVkaXQgZmllbGRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gbU9Ub1VzZSBUaGUgTWFuYWdlZE9iamVjdCBBbnkgdG8gYmUgdXNlZCB0byBjYWxjdWxhdGUgdGhlIHZpc2libGUgdmFsdWUgb2YgdGhlIGJpbmRpbmcuXG5cdCAqIEBwYXJhbSBvRGlhbG9nRGF0YU1vZGVsIE1vZGVsIHRvIGJlIHVzZWQgcnVudGltZS5cblx0ICogQHBhcmFtIGRhdGFQcm9wZXJ0eSBGaWVsZCBuYW1lLlxuXHQgKiBAcGFyYW0gdmFsdWVzIFZhbHVlcyBvZiB0aGUgZmllbGQuXG5cdCAqL1xuXHR1cGRhdGVPbkNvbnRleHRDaGFuZ2U6IGZ1bmN0aW9uIChtT1RvVXNlOiBBbnlUeXBlLCBvRGlhbG9nRGF0YU1vZGVsOiBKU09OTW9kZWwsIGRhdGFQcm9wZXJ0eTogc3RyaW5nLCB2YWx1ZXM6IGFueSkge1xuXHRcdGNvbnN0IGJpbmRpbmcgPSBtT1RvVXNlLmdldEJpbmRpbmcoXCJhbnlcIik7XG5cblx0XHR2YWx1ZXMub2JqZWN0c0ZvclZpc2liaWxpdHkgPSB2YWx1ZXMub2JqZWN0c0ZvclZpc2liaWxpdHkgfHwgW107XG5cdFx0dmFsdWVzLm9iamVjdHNGb3JWaXNpYmlsaXR5LnB1c2gobU9Ub1VzZSk7XG5cblx0XHRiaW5kaW5nLmF0dGFjaENoYW5nZShNYXNzRWRpdEhlbHBlci5vbkNvbnRleHRFZGl0YWJsZUNoYW5nZS5iaW5kKG51bGwsIG9EaWFsb2dEYXRhTW9kZWwsIGRhdGFQcm9wZXJ0eSkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgYm91bmQgb2JqZWN0IHRvIGNhbGN1bGF0ZSB0aGUgdmlzaWJpbGl0eSBvZiBjb250ZXh0cy5cblx0ICpcblx0ICogQHBhcmFtIGV4cEJpbmRpbmcgQmluZGluZyBTdHJpbmcgb2JqZWN0LlxuXHQgKiBAcGFyYW0gY29udGV4dCBDb250ZXh0IHRoZSBiaW5kaW5nIHZhbHVlLlxuXHQgKiBAcmV0dXJucyBUaGUgTWFuYWdlZE9iamVjdCBBbnkgdG8gYmUgdXNlZCB0byBjYWxjdWxhdGUgdGhlIHZpc2libGUgdmFsdWUgb2YgdGhlIGJpbmRpbmcuXG5cdCAqL1xuXHRnZXRCb3VuZE9iamVjdDogZnVuY3Rpb24gKGV4cEJpbmRpbmc6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uLCBjb250ZXh0OiBDb250ZXh0KTogQW55VHlwZSB7XG5cdFx0Y29uc3QgbU9Ub1VzZSA9IG5ldyBBbnkoeyBhbnk6IGV4cEJpbmRpbmcgfSk7XG5cdFx0Y29uc3QgbW9kZWwgPSBjb250ZXh0LmdldE1vZGVsKCk7XG5cdFx0bU9Ub1VzZS5zZXRNb2RlbChtb2RlbCk7XG5cdFx0bU9Ub1VzZS5zZXRCaW5kaW5nQ29udGV4dChjb250ZXh0KTtcblxuXHRcdHJldHVybiBtT1RvVXNlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXQgdGhlIHZpc2liaWxpdHkgb2YgdGhlIGZpZWxkLlxuXHQgKlxuXHQgKiBAcGFyYW0gZXhwQmluZGluZyBCaW5kaW5nIFN0cmluZyBvYmplY3QuXG5cdCAqIEBwYXJhbSBvRGlhbG9nRGF0YU1vZGVsIE1vZGVsIHRvIGJlIHVzZWQgcnVudGltZS5cblx0ICogQHBhcmFtIGRhdGFQcm9wZXJ0eSBGaWVsZCBuYW1lLlxuXHQgKiBAcGFyYW0gdmFsdWVzIFZhbHVlcyBvZiB0aGUgZmllbGQuXG5cdCAqIEBwYXJhbSBjb250ZXh0IENvbnRleHQgdGhlIGJpbmRpbmcgdmFsdWUuXG5cdCAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZSBpZiB0aGUgbWFzcyBlZGl0IGZpZWxkIGlzIGVkaXRhYmxlLlxuXHQgKi9cblx0Z2V0RmllbGRWaXNpYmxpdHk6IGZ1bmN0aW9uIChcblx0XHRleHBCaW5kaW5nOiBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbixcblx0XHRvRGlhbG9nRGF0YU1vZGVsOiBKU09OTW9kZWwsXG5cdFx0ZGF0YVByb3BlcnR5OiBzdHJpbmcsXG5cdFx0dmFsdWVzOiBhbnksXG5cdFx0Y29udGV4dDogQ29udGV4dFxuXHQpOiBib29sZWFuIHtcblx0XHRjb25zdCBtT1RvVXNlID0gTWFzc0VkaXRIZWxwZXIuZ2V0Qm91bmRPYmplY3QoZXhwQmluZGluZywgY29udGV4dCk7XG5cdFx0Y29uc3QgaXNDb250ZXh0RWRpdGFibGUgPSBNYXNzRWRpdEhlbHBlci5pc0VkaXRhYmxlKG1PVG9Vc2UpO1xuXG5cdFx0aWYgKCFpc0NvbnRleHRFZGl0YWJsZSkge1xuXHRcdFx0TWFzc0VkaXRIZWxwZXIudXBkYXRlT25Db250ZXh0Q2hhbmdlKG1PVG9Vc2UsIG9EaWFsb2dEYXRhTW9kZWwsIGRhdGFQcm9wZXJ0eSwgdmFsdWVzKTtcblx0XHR9XG5cdFx0cmV0dXJuIGlzQ29udGV4dEVkaXRhYmxlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBJbml0aWFsaXplcyBhIHJ1bnRpbWUgbW9kZWw6XG5cdCAqID0+IFRoZSBtb2RlbCBjb25zaXN0cyBvZiB2YWx1ZXMgc2hvd24gaW4gdGhlIGNvbWJvQm94IG9mIHRoZSBkaWFsb2cgKExlYXZlIEJsYW5rLCBLZWVwIEV4aXN0aW5nIFZhbHVlcywgb3IgYW55IHByb3BlcnR5IHZhbHVlIGZvciB0aGUgc2VsZWN0ZWQgY29udGV4dCwgZXRjLilcblx0ICogPT4gVGhlIG1vZGVsIHdpbGwgY2FwdHVyZSBydW50aW1lIGNoYW5nZXMgaW4gdGhlIHJlc3VsdHMgcHJvcGVydHkgKHRoZSB2YWx1ZSBlbnRlcmVkIGluIHRoZSBjb21ib0JveCkuXG5cdCAqXG5cdCAqIEBwYXJhbSBhQ29udGV4dHMgQ29udGV4dHMgZm9yIG1hc3MgZWRpdFxuXHQgKiBAcGFyYW0gYURhdGFBcnJheSBBcnJheSBjb250YWluaW5nIGRhdGEgcmVsYXRlZCB0byB0aGUgZGlhbG9nIHVzZWQgYnkgYm90aCB0aGUgc3RhdGljIGFuZCB0aGUgcnVudGltZSBtb2RlbFxuXHQgKiBAcGFyYW0gb0RlZmF1bHRWYWx1ZXMgRGVmYXVsdCB2YWx1ZXMgZnJvbSBpMThuXG5cdCAqIEBwYXJhbSBkaWFsb2dDb250ZXh0IFRyYW5zaWVudCBjb250ZXh0IGZvciBtYXNzIGVkaXQgZGlhbG9nLlxuXHQgKiBAcmV0dXJucyBUaGUgcnVudGltZSBtb2RlbFxuXHQgKi9cblx0c2V0UnVudGltZU1vZGVsT25EaWFsb2c6IGZ1bmN0aW9uIChhQ29udGV4dHM6IGFueVtdLCBhRGF0YUFycmF5OiBhbnlbXSwgb0RlZmF1bHRWYWx1ZXM6IGFueSwgZGlhbG9nQ29udGV4dDogQ29udGV4dCkge1xuXHRcdGNvbnN0IGFWYWx1ZXM6IGFueVtdID0gW107XG5cdFx0Y29uc3QgYVVuaXREYXRhOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IGFSZXN1bHRzOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IHRleHRQYXRoczogYW55W10gPSBbXTtcblx0XHRjb25zdCBhUmVhZE9ubHlGaWVsZEluZm86IGFueVtdID0gW107XG5cblx0XHRjb25zdCBvRGF0YSA9IHtcblx0XHRcdFwidmFsdWVzXCI6IGFWYWx1ZXMsXG5cdFx0XHRcInVuaXREYXRhXCI6IGFVbml0RGF0YSxcblx0XHRcdFwicmVzdWx0c1wiOiBhUmVzdWx0cyxcblx0XHRcdFwicmVhZGFibGVQcm9wZXJ0eURhdGFcIjogYVJlYWRPbmx5RmllbGRJbmZvLFxuXHRcdFx0XCJzZWxlY3RlZEtleVwiOiB1bmRlZmluZWQsXG5cdFx0XHRcInRleHRQYXRoc1wiOiB0ZXh0UGF0aHMsXG5cdFx0XHRcIm5vRmllbGRzXCI6IG9EZWZhdWx0VmFsdWVzLm5vRmllbGRzXG5cdFx0fTtcblx0XHRjb25zdCBvRGlhbG9nRGF0YU1vZGVsID0gbmV3IEpTT05Nb2RlbChvRGF0YSk7XG5cdFx0YURhdGFBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChvSW5EYXRhOiBhbnkpIHtcblx0XHRcdGxldCBvVGV4dEluZm87XG5cdFx0XHRsZXQgc1Byb3BlcnR5S2V5O1xuXHRcdFx0bGV0IHNVbml0UHJvcGVydHlOYW1lO1xuXHRcdFx0Y29uc3Qgb0Rpc3RpbmN0VmFsdWVNYXA6IGFueSA9IHt9O1xuXHRcdFx0Y29uc3Qgb0Rpc3RpbmN0VW5pdE1hcDogYW55ID0ge307XG5cdFx0XHRpZiAob0luRGF0YS5kYXRhUHJvcGVydHkgJiYgb0luRGF0YS5kYXRhUHJvcGVydHkuaW5kZXhPZihcIi9cIikgPiAtMSkge1xuXHRcdFx0XHRjb25zdCBhRmluYWxQYXRoID0gTWFzc0VkaXRIZWxwZXIuaW5pdExhc3RMZXZlbE9mUHJvcGVydHlQYXRoKG9JbkRhdGEuZGF0YVByb3BlcnR5LCBhVmFsdWVzIC8qLCBkaWFsb2dDb250ZXh0ICovKTtcblx0XHRcdFx0Y29uc3QgYVByb3BlcnR5UGF0aHMgPSBvSW5EYXRhLmRhdGFQcm9wZXJ0eS5zcGxpdChcIi9cIik7XG5cblx0XHRcdFx0Zm9yIChjb25zdCBjb250ZXh0IG9mIGFDb250ZXh0cykge1xuXHRcdFx0XHRcdGNvbnN0IHNNdWx0aUxldmVsUGF0aFZhbHVlID0gY29udGV4dC5nZXRPYmplY3Qob0luRGF0YS5kYXRhUHJvcGVydHkpO1xuXHRcdFx0XHRcdHNQcm9wZXJ0eUtleSA9IGAke29JbkRhdGEuZGF0YVByb3BlcnR5fS8ke3NNdWx0aUxldmVsUGF0aFZhbHVlfWA7XG5cdFx0XHRcdFx0aWYgKCFvRGlzdGluY3RWYWx1ZU1hcFtzUHJvcGVydHlLZXldICYmIGFGaW5hbFBhdGhbYVByb3BlcnR5UGF0aHNbYVByb3BlcnR5UGF0aHMubGVuZ3RoIC0gMV1dKSB7XG5cdFx0XHRcdFx0XHRvVGV4dEluZm8gPSBNYXNzRWRpdEhlbHBlci5nZXRUZXh0QXJyYW5nZW1lbnRJbmZvKFxuXHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRhdGFQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdFx0b0luRGF0YS5kZXNjcmlwdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRcdG9JbkRhdGEuZGlzcGxheSxcblx0XHRcdFx0XHRcdFx0Y29udGV4dFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdGFGaW5hbFBhdGhbYVByb3BlcnR5UGF0aHNbYVByb3BlcnR5UGF0aHMubGVuZ3RoIC0gMV1dLnB1c2goe1xuXHRcdFx0XHRcdFx0XHRcInRleHRcIjogKG9UZXh0SW5mbyAmJiBvVGV4dEluZm8uZnVsbFRleHQpIHx8IHNNdWx0aUxldmVsUGF0aFZhbHVlLFxuXHRcdFx0XHRcdFx0XHRcImtleVwiOiBzUHJvcGVydHlLZXksXG5cdFx0XHRcdFx0XHRcdFwidGV4dEluZm9cIjogb1RleHRJbmZvXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdG9EaXN0aW5jdFZhbHVlTWFwW3NQcm9wZXJ0eUtleV0gPSBzTXVsdGlMZXZlbFBhdGhWYWx1ZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gaWYgKE9iamVjdC5rZXlzKG9EaXN0aW5jdFZhbHVlTWFwKS5sZW5ndGggPT09IDEpIHtcblx0XHRcdFx0Ly8gXHRkaWFsb2dDb250ZXh0LnNldFByb3BlcnR5KG9EYXRhLmRhdGFQcm9wZXJ0eSwgc1Byb3BlcnR5S2V5ICYmIG9EaXN0aW5jdFZhbHVlTWFwW3NQcm9wZXJ0eUtleV0pO1xuXHRcdFx0XHQvLyB9XG5cblx0XHRcdFx0YUZpbmFsUGF0aFthUHJvcGVydHlQYXRoc1thUHJvcGVydHlQYXRocy5sZW5ndGggLSAxXV0udGV4dEluZm8gPSB7XG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25QYXRoOiBvSW5EYXRhLmRlc2NyaXB0aW9uUGF0aCxcblx0XHRcdFx0XHR2YWx1ZVBhdGg6IG9JbkRhdGEuZGF0YVByb3BlcnR5LFxuXHRcdFx0XHRcdGRpc3BsYXlNb2RlOiBvSW5EYXRhLmRpc3BsYXlcblx0XHRcdFx0fTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldID0gYVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0gfHwgW107XG5cdFx0XHRcdGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldW1wic2VsZWN0T3B0aW9uc1wiXSA9IGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldW1wic2VsZWN0T3B0aW9uc1wiXSB8fCBbXTtcblx0XHRcdFx0aWYgKG9JbkRhdGEudW5pdFByb3BlcnR5KSB7XG5cdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XSA9IGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0gfHwgW107XG5cdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XVtcInNlbGVjdE9wdGlvbnNcIl0gPSBhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldW1wic2VsZWN0T3B0aW9uc1wiXSB8fCBbXTtcblx0XHRcdFx0fVxuXHRcdFx0XHRmb3IgKGNvbnN0IGNvbnRleHQgb2YgYUNvbnRleHRzKSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0RhdGFPYmplY3QgPSBjb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdHNQcm9wZXJ0eUtleSA9IGAke29JbkRhdGEuZGF0YVByb3BlcnR5fS8ke29EYXRhT2JqZWN0W29JbkRhdGEuZGF0YVByb3BlcnR5XX1gO1xuXHRcdFx0XHRcdGlmIChvSW5EYXRhLmRhdGFQcm9wZXJ0eSAmJiBvRGF0YU9iamVjdFtvSW5EYXRhLmRhdGFQcm9wZXJ0eV0gJiYgIW9EaXN0aW5jdFZhbHVlTWFwW3NQcm9wZXJ0eUtleV0pIHtcblx0XHRcdFx0XHRcdGlmIChvSW5EYXRhLmlucHV0VHlwZSAhPSBcIkNoZWNrQm94XCIpIHtcblx0XHRcdFx0XHRcdFx0b1RleHRJbmZvID0gTWFzc0VkaXRIZWxwZXIuZ2V0VGV4dEFycmFuZ2VtZW50SW5mbyhcblx0XHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRhdGFQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRlc2NyaXB0aW9uUGF0aCxcblx0XHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRpc3BsYXksXG5cdFx0XHRcdFx0XHRcdFx0Y29udGV4dFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBlbnRyeSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcInRleHRcIjogKG9UZXh0SW5mbyAmJiBvVGV4dEluZm8uZnVsbFRleHQpIHx8IG9EYXRhT2JqZWN0W29JbkRhdGEuZGF0YVByb3BlcnR5XSxcblx0XHRcdFx0XHRcdFx0XHRcImtleVwiOiBzUHJvcGVydHlLZXksXG5cdFx0XHRcdFx0XHRcdFx0XCJ0ZXh0SW5mb1wiOiBvVGV4dEluZm9cblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0YVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0ucHVzaChlbnRyeSk7XG5cdFx0XHRcdFx0XHRcdGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldW1wic2VsZWN0T3B0aW9uc1wiXS5wdXNoKGVudHJ5KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdG9EaXN0aW5jdFZhbHVlTWFwW3NQcm9wZXJ0eUtleV0gPSBvRGF0YU9iamVjdFtvSW5EYXRhLmRhdGFQcm9wZXJ0eV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChvSW5EYXRhLnVuaXRQcm9wZXJ0eSAmJiBvRGF0YU9iamVjdFtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0pIHtcblx0XHRcdFx0XHRcdHNVbml0UHJvcGVydHlOYW1lID0gYCR7b0luRGF0YS51bml0UHJvcGVydHl9LyR7b0RhdGFPYmplY3Rbb0luRGF0YS51bml0UHJvcGVydHldfWA7XG5cdFx0XHRcdFx0XHRpZiAoIW9EaXN0aW5jdFVuaXRNYXBbc1VuaXRQcm9wZXJ0eU5hbWVdKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChvSW5EYXRhLmlucHV0VHlwZSAhPSBcIkNoZWNrQm94XCIpIHtcblx0XHRcdFx0XHRcdFx0XHRvVGV4dEluZm8gPSBNYXNzRWRpdEhlbHBlci5nZXRUZXh0QXJyYW5nZW1lbnRJbmZvKFxuXHRcdFx0XHRcdFx0XHRcdFx0b0luRGF0YS51bml0UHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdFx0XHRvSW5EYXRhLmRlc2NyaXB0aW9uUGF0aCxcblx0XHRcdFx0XHRcdFx0XHRcdG9JbkRhdGEuZGlzcGxheSxcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHRcblx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IHVuaXRFbnRyeSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdFwidGV4dFwiOiAob1RleHRJbmZvICYmIG9UZXh0SW5mby5mdWxsVGV4dCkgfHwgb0RhdGFPYmplY3Rbb0luRGF0YS51bml0UHJvcGVydHldLFxuXHRcdFx0XHRcdFx0XHRcdFx0XCJrZXlcIjogc1VuaXRQcm9wZXJ0eU5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcInRleHRJbmZvXCI6IG9UZXh0SW5mb1xuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XS5wdXNoKHVuaXRFbnRyeSk7XG5cdFx0XHRcdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XVtcInNlbGVjdE9wdGlvbnNcIl0ucHVzaCh1bml0RW50cnkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdG9EaXN0aW5jdFVuaXRNYXBbc1VuaXRQcm9wZXJ0eU5hbWVdID0gb0RhdGFPYmplY3Rbb0luRGF0YS51bml0UHJvcGVydHldO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XS50ZXh0SW5mbyA9IHtcblx0XHRcdFx0XHRkZXNjcmlwdGlvblBhdGg6IG9JbkRhdGEuZGVzY3JpcHRpb25QYXRoLFxuXHRcdFx0XHRcdHZhbHVlUGF0aDogb0luRGF0YS5kYXRhUHJvcGVydHksXG5cdFx0XHRcdFx0ZGlzcGxheU1vZGU6IG9JbkRhdGEuZGlzcGxheVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRpZiAoT2JqZWN0LmtleXMob0Rpc3RpbmN0VmFsdWVNYXApLmxlbmd0aCA9PT0gMSkge1xuXHRcdFx0XHRcdGRpYWxvZ0NvbnRleHQuc2V0UHJvcGVydHkob0luRGF0YS5kYXRhUHJvcGVydHksIHNQcm9wZXJ0eUtleSAmJiBvRGlzdGluY3RWYWx1ZU1hcFtzUHJvcGVydHlLZXldKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoT2JqZWN0LmtleXMob0Rpc3RpbmN0VW5pdE1hcCkubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdFx0ZGlhbG9nQ29udGV4dC5zZXRQcm9wZXJ0eShvSW5EYXRhLnVuaXRQcm9wZXJ0eSwgc1VuaXRQcm9wZXJ0eU5hbWUgJiYgb0Rpc3RpbmN0VW5pdE1hcFtzVW5pdFByb3BlcnR5TmFtZV0pO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHR0ZXh0UGF0aHNbb0luRGF0YS5kYXRhUHJvcGVydHldID0gb0luRGF0YS5kZXNjcmlwdGlvblBhdGggPyBbb0luRGF0YS5kZXNjcmlwdGlvblBhdGhdIDogW107XG5cdFx0fSk7XG5cdFx0YURhdGFBcnJheS5mb3JFYWNoKGZ1bmN0aW9uIChvSW5EYXRhOiBhbnkpIHtcblx0XHRcdGxldCB2YWx1ZXM6IGFueSA9IHt9O1xuXHRcdFx0aWYgKG9JbkRhdGEuZGF0YVByb3BlcnR5LmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdFx0Y29uc3Qgc011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlID0gTWFzc0VkaXRIZWxwZXIuZ2V0VmFsdWVGb3JNdWx0aUxldmVsUGF0aChvSW5EYXRhLmRhdGFQcm9wZXJ0eSwgYVZhbHVlcyk7XG5cdFx0XHRcdGlmICghc011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlKSB7XG5cdFx0XHRcdFx0c011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlLnB1c2goeyB0ZXh0OiBvRGVmYXVsdFZhbHVlcy5sZWF2ZUJsYW5rVmFsdWUsIGtleTogYEVtcHR5LyR7b0luRGF0YS5kYXRhUHJvcGVydHl9YCB9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRNYXNzRWRpdEhlbHBlci5zZXREZWZhdWx0VmFsdWVzVG9EaWFsb2coc011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlLCBvRGVmYXVsdFZhbHVlcywgb0luRGF0YSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0dmFsdWVzID0gc011bHRpTGV2ZWxQcm9wUGF0aFZhbHVlO1xuXHRcdFx0fSBlbHNlIGlmIChhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XSkge1xuXHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XSA9IGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldIHx8IFtdO1xuXHRcdFx0XHRNYXNzRWRpdEhlbHBlci5zZXREZWZhdWx0VmFsdWVzVG9EaWFsb2coYVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0sIG9EZWZhdWx0VmFsdWVzLCBvSW5EYXRhKTtcblx0XHRcdFx0dmFsdWVzID0gYVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV07XG5cdFx0XHR9XG5cblx0XHRcdGlmIChhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldICYmIGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0ubGVuZ3RoKSB7XG5cdFx0XHRcdE1hc3NFZGl0SGVscGVyLnNldERlZmF1bHRWYWx1ZXNUb0RpYWxvZyhhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLCBvRGVmYXVsdFZhbHVlcywgb0luRGF0YSwgdHJ1ZSk7XG5cdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0udGV4dEluZm8gPSB7fTtcblx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XS5zZWxlY3RlZEtleSA9IE1hc3NFZGl0SGVscGVyLmdldERlZmF1bHRTZWxlY3Rpb25QYXRoQ29tYm9Cb3goXG5cdFx0XHRcdFx0YUNvbnRleHRzLFxuXHRcdFx0XHRcdG9JbkRhdGEudW5pdFByb3BlcnR5XG5cdFx0XHRcdCk7XG5cdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0uaW5wdXRUeXBlID0gb0luRGF0YS5pbnB1dFR5cGU7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHQob0luRGF0YS5kYXRhUHJvcGVydHkgJiYgYVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0gJiYgIWFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldLmxlbmd0aCkgfHxcblx0XHRcdFx0KG9JbkRhdGEudW5pdFByb3BlcnR5ICYmIGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0gJiYgIWFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0ubGVuZ3RoKVxuXHRcdFx0KSB7XG5cdFx0XHRcdGNvbnN0IGJDbGVhckZpZWxkT3JCbGFua1ZhbHVlRXhpc3RzID1cblx0XHRcdFx0XHRhVmFsdWVzW29JbkRhdGEuZGF0YVByb3BlcnR5XSAmJlxuXHRcdFx0XHRcdGFWYWx1ZXNbb0luRGF0YS5kYXRhUHJvcGVydHldLnNvbWUoZnVuY3Rpb24gKG9iajogYW55KSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb2JqLnRleHQgPT09IFwiPCBDbGVhciBWYWx1ZXMgPlwiIHx8IG9iai50ZXh0ID09PSBcIjwgTGVhdmUgQmxhbmsgPlwiO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRpZiAob0luRGF0YS5kYXRhUHJvcGVydHkgJiYgIWJDbGVhckZpZWxkT3JCbGFua1ZhbHVlRXhpc3RzKSB7XG5cdFx0XHRcdFx0YVZhbHVlc1tvSW5EYXRhLmRhdGFQcm9wZXJ0eV0ucHVzaCh7IHRleHQ6IG9EZWZhdWx0VmFsdWVzLmxlYXZlQmxhbmtWYWx1ZSwga2V5OiBgRW1wdHkvJHtvSW5EYXRhLmRhdGFQcm9wZXJ0eX1gIH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IGJDbGVhckZpZWxkT3JCbGFua1VuaXRWYWx1ZUV4aXN0cyA9XG5cdFx0XHRcdFx0YVVuaXREYXRhW29JbkRhdGEudW5pdFByb3BlcnR5XSAmJlxuXHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0uc29tZShmdW5jdGlvbiAob2JqOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvYmoudGV4dCA9PT0gXCI8IENsZWFyIFZhbHVlcyA+XCIgfHwgb2JqLnRleHQgPT09IFwiPCBMZWF2ZSBCbGFuayA+XCI7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChvSW5EYXRhLnVuaXRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdGlmICghYkNsZWFyRmllbGRPckJsYW5rVW5pdFZhbHVlRXhpc3RzKSB7XG5cdFx0XHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLnB1c2goe1xuXHRcdFx0XHRcdFx0XHR0ZXh0OiBvRGVmYXVsdFZhbHVlcy5sZWF2ZUJsYW5rVmFsdWUsXG5cdFx0XHRcdFx0XHRcdGtleTogYEVtcHR5LyR7b0luRGF0YS51bml0UHJvcGVydHl9YFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGFVbml0RGF0YVtvSW5EYXRhLnVuaXRQcm9wZXJ0eV0udGV4dEluZm8gPSB7fTtcblx0XHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLnNlbGVjdGVkS2V5ID0gTWFzc0VkaXRIZWxwZXIuZ2V0RGVmYXVsdFNlbGVjdGlvblBhdGhDb21ib0JveChcblx0XHRcdFx0XHRcdGFDb250ZXh0cyxcblx0XHRcdFx0XHRcdG9JbkRhdGEudW5pdFByb3BlcnR5XG5cdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRhVW5pdERhdGFbb0luRGF0YS51bml0UHJvcGVydHldLmlucHV0VHlwZSA9IG9JbkRhdGEuaW5wdXRUeXBlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAob0luRGF0YS5pc1Byb3BlcnR5UmVhZE9ubHkgJiYgdHlwZW9mIG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5ID09PSBcImJvb2xlYW5cIikge1xuXHRcdFx0XHRhUmVhZE9ubHlGaWVsZEluZm8ucHVzaCh7IFwicHJvcGVydHlcIjogb0luRGF0YS5kYXRhUHJvcGVydHksIHZhbHVlOiBvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seSwgdHlwZTogXCJEZWZhdWx0XCIgfSk7XG5cdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seSAmJlxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kcyAmJlxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kc1swXSAmJlxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kc1swXS5vcGVyYW5kMSAmJlxuXHRcdFx0XHRvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kc1swXS5vcGVyYW5kMlxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIFRoaXMgbmVlZHMgdG8gYmUgcmVmYWN0b3JlZCBpbiBhY2NvcmRhbmNlIHdpdGggdGhlIFJlYWRPbmx5RXhwcmVzc2lvbiBjaGFuZ2Vcblx0XHRcdFx0YVJlYWRPbmx5RmllbGRJbmZvLnB1c2goe1xuXHRcdFx0XHRcdFwicHJvcGVydHlcIjogb0luRGF0YS5kYXRhUHJvcGVydHksXG5cdFx0XHRcdFx0cHJvcGVydHlQYXRoOiBvSW5EYXRhLmlzUHJvcGVydHlSZWFkT25seS5vcGVyYW5kc1swXS5vcGVyYW5kMS5wYXRoLFxuXHRcdFx0XHRcdHByb3BlcnR5VmFsdWU6IG9JbkRhdGEuaXNQcm9wZXJ0eVJlYWRPbmx5Lm9wZXJhbmRzWzBdLm9wZXJhbmQyLnZhbHVlLFxuXHRcdFx0XHRcdHR5cGU6IFwiUGF0aFwiXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHQvLyBTZXR0aW5nIHZpc2JpbGl0eSBvZiB0aGUgbWFzcyBlZGl0IGZpZWxkLlxuXHRcdFx0aWYgKG9JbkRhdGEuZWRpdE1vZGUpIHtcblx0XHRcdFx0dmFsdWVzLnZpc2libGUgPVxuXHRcdFx0XHRcdG9JbkRhdGEuZWRpdE1vZGUgPT09IEVkaXRNb2RlLkVkaXRhYmxlIHx8XG5cdFx0XHRcdFx0YUNvbnRleHRzLnNvbWUoXG5cdFx0XHRcdFx0XHRNYXNzRWRpdEhlbHBlci5nZXRGaWVsZFZpc2libGl0eS5iaW5kKFxuXHRcdFx0XHRcdFx0XHRNYXNzRWRpdEhlbHBlcixcblx0XHRcdFx0XHRcdFx0b0luRGF0YS5lZGl0TW9kZSxcblx0XHRcdFx0XHRcdFx0b0RpYWxvZ0RhdGFNb2RlbCxcblx0XHRcdFx0XHRcdFx0b0luRGF0YS5kYXRhUHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdHZhbHVlc1xuXHRcdFx0XHRcdFx0KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR2YWx1ZXMudmlzaWJsZSA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHR2YWx1ZXMuc2VsZWN0ZWRLZXkgPSBNYXNzRWRpdEhlbHBlci5nZXREZWZhdWx0U2VsZWN0aW9uUGF0aENvbWJvQm94KGFDb250ZXh0cywgb0luRGF0YS5kYXRhUHJvcGVydHkpO1xuXHRcdFx0dmFsdWVzLmlucHV0VHlwZSA9IG9JbkRhdGEuaW5wdXRUeXBlO1xuXHRcdFx0dmFsdWVzLnVuaXRQcm9wZXJ0eSA9IG9JbkRhdGEudW5pdFByb3BlcnR5O1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIG9EaWFsb2dEYXRhTW9kZWw7XG5cdH0sXG5cdC8qKlxuXHQgKiBHZXRzIHRyYW5zaWVudCBjb250ZXh0IGZvciBkaWFsb2cuXG5cdCAqXG5cdCAqIEBwYXJhbSB0YWJsZSBJbnN0YW5jZSBvZiBUYWJsZS5cblx0ICogQHBhcmFtIGRpYWxvZyBNYXNzIEVkaXQgRGlhbG9nLlxuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJldHVybmluZyBpbnN0YW5jZSBvZiBkaWFsb2cuXG5cdCAqL1xuXHRnZXREaWFsb2dDb250ZXh0OiBmdW5jdGlvbiAodGFibGU6IFRhYmxlLCBkaWFsb2c/OiBEaWFsb2cpOiBDb250ZXh0IHtcblx0XHRsZXQgdHJhbnNDdHg6IENvbnRleHQgPSAoZGlhbG9nICYmIGRpYWxvZy5nZXRCaW5kaW5nQ29udGV4dCgpKSBhcyBDb250ZXh0O1xuXG5cdFx0aWYgKCF0cmFuc0N0eCkge1xuXHRcdFx0Y29uc3QgbW9kZWwgPSB0YWJsZS5nZXRNb2RlbCgpO1xuXHRcdFx0Y29uc3QgbGlzdEJpbmRpbmcgPSB0YWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0XHRjb25zdCB0cmFuc2llbnRMaXN0QmluZGluZyA9IG1vZGVsLmJpbmRMaXN0KGxpc3RCaW5kaW5nLmdldFBhdGgoKSwgbGlzdEJpbmRpbmcuZ2V0Q29udGV4dCgpLCBbXSwgW10sIHtcblx0XHRcdFx0JCR1cGRhdGVHcm91cElkOiBcInN1Ym1pdExhdGVyXCJcblx0XHRcdH0pIGFzIE9EYXRhTGlzdEJpbmRpbmc7XG5cdFx0XHQodHJhbnNpZW50TGlzdEJpbmRpbmcgYXMgYW55KS5yZWZyZXNoSW50ZXJuYWwgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdC8qICovXG5cdFx0XHR9O1xuXHRcdFx0dHJhbnNDdHggPSB0cmFuc2llbnRMaXN0QmluZGluZy5jcmVhdGUoe30sIHRydWUpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0cmFuc0N0eDtcblx0fSxcblxuXHRvbkRpYWxvZ09wZW46IGZ1bmN0aW9uIChldmVudDogYW55KTogdm9pZCB7XG5cdFx0Y29uc3Qgc291cmNlID0gZXZlbnQuZ2V0U291cmNlKCk7XG5cdFx0Y29uc3QgZmllbGRzSW5mb01vZGVsID0gc291cmNlLmdldE1vZGVsKFwiZmllbGRzSW5mb1wiKTtcblx0XHRmaWVsZHNJbmZvTW9kZWwuc2V0UHJvcGVydHkoXCIvaXNPcGVuXCIsIHRydWUpO1xuXHR9LFxuXG5cdGNsb3NlRGlhbG9nOiBmdW5jdGlvbiAob0RpYWxvZzogYW55KSB7XG5cdFx0b0RpYWxvZy5jbG9zZSgpO1xuXHRcdG9EaWFsb2cuZGVzdHJveSgpO1xuXHR9LFxuXG5cdG1lc3NhZ2VIYW5kbGluZ0Zvck1hc3NFZGl0OiBhc3luYyBmdW5jdGlvbiAoXG5cdFx0b1RhYmxlOiBUYWJsZSxcblx0XHRhQ29udGV4dHM6IGFueSxcblx0XHRvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsXG5cdFx0b0luRGlhbG9nOiBhbnksXG5cdFx0YVJlc3VsdHM6IGFueSxcblx0XHRlcnJvckNvbnRleHRzOiBhbnlcblx0KSB7XG5cdFx0Y29uc3QgRHJhZnRTdGF0dXMgPSBGRUxpYnJhcnkuRHJhZnRTdGF0dXM7XG5cdFx0Y29uc3Qgb1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0XHQob0NvbnRyb2xsZXIuZ2V0VmlldygpPy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0KT8uc2V0UHJvcGVydHkoXCJnZXRCb3VuZE1lc3NhZ2VzRm9yTWFzc0VkaXRcIiwgdHJ1ZSk7XG5cdFx0b0NvbnRyb2xsZXIuX2VkaXRGbG93LmdldE1lc3NhZ2VIYW5kbGVyKCkuc2hvd01lc3NhZ2VzKHtcblx0XHRcdG9uQmVmb3JlU2hvd01lc3NhZ2U6IGZ1bmN0aW9uIChtZXNzYWdlczogYW55LCBzaG93TWVzc2FnZVBhcmFtZXRlcnM6IGFueSkge1xuXHRcdFx0XHQvL21lc3NhZ2VzLmNvbmNhdGVuYXRlKG1lc3NhZ2VIYW5kbGluZy5nZXRNZXNzYWdlcyh0cnVlLCB0cnVlKSk7XG5cdFx0XHRcdHNob3dNZXNzYWdlUGFyYW1ldGVycy5mbkdldE1lc3NhZ2VTdWJ0aXRsZSA9IG1lc3NhZ2VIYW5kbGluZy5zZXRNZXNzYWdlU3VidGl0bGUuYmluZCh7fSwgb1RhYmxlLCBhQ29udGV4dHMpO1xuXHRcdFx0XHRjb25zdCB1bmJvdW5kRXJyb3JzOiBhbnlbXSA9IFtdO1xuXHRcdFx0XHRtZXNzYWdlcy5mb3JFYWNoKGZ1bmN0aW9uIChtZXNzYWdlOiBhbnkpIHtcblx0XHRcdFx0XHRpZiAoIW1lc3NhZ2UuZ2V0VGFyZ2V0KCkpIHtcblx0XHRcdFx0XHRcdHVuYm91bmRFcnJvcnMucHVzaChtZXNzYWdlKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdGlmIChhUmVzdWx0cy5sZW5ndGggPiAwICYmIGVycm9yQ29udGV4dHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRcdFx0b0NvbnRyb2xsZXIuX2VkaXRGbG93LnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLlNhdmVkKTtcblx0XHRcdFx0XHRjb25zdCBzdWNjZXNzVG9hc3QgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfTUFTU19FRElUX1NVQ0NFU1NfVE9BU1RcIik7XG5cdFx0XHRcdFx0TWVzc2FnZVRvYXN0LnNob3coc3VjY2Vzc1RvYXN0KTtcblx0XHRcdFx0fSBlbHNlIGlmIChlcnJvckNvbnRleHRzLmxlbmd0aCA8IChvVGFibGUgYXMgYW55KS5nZXRTZWxlY3RlZENvbnRleHRzKCkubGVuZ3RoKSB7XG5cdFx0XHRcdFx0b0NvbnRyb2xsZXIuX2VkaXRGbG93LnNldERyYWZ0U3RhdHVzKERyYWZ0U3RhdHVzLlNhdmVkKTtcblx0XHRcdFx0fSBlbHNlIGlmIChlcnJvckNvbnRleHRzLmxlbmd0aCA9PT0gKG9UYWJsZSBhcyBhbnkpLmdldFNlbGVjdGVkQ29udGV4dHMoKS5sZW5ndGgpIHtcblx0XHRcdFx0XHRvQ29udHJvbGxlci5fZWRpdEZsb3cuc2V0RHJhZnRTdGF0dXMoRHJhZnRTdGF0dXMuQ2xlYXIpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0aWYgKG9Db250cm9sbGVyLmdldE1vZGVsKFwidWlcIikuZ2V0UHJvcGVydHkoXCIvaXNFZGl0YWJsZVwiKSAmJiB1bmJvdW5kRXJyb3JzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0XHRcdHNob3dNZXNzYWdlUGFyYW1ldGVycy5zaG93TWVzc2FnZUJveCA9IGZhbHNlO1xuXHRcdFx0XHRcdHNob3dNZXNzYWdlUGFyYW1ldGVycy5zaG93TWVzc2FnZURpYWxvZyA9IGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBzaG93TWVzc2FnZVBhcmFtZXRlcnM7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0aWYgKG9JbkRpYWxvZy5pc09wZW4oKSkge1xuXHRcdFx0TWFzc0VkaXRIZWxwZXIuY2xvc2VEaWFsb2cob0luRGlhbG9nKTtcblx0XHRcdChvQ29udHJvbGxlci5nZXRWaWV3KCk/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikgYXMgSW50ZXJuYWxNb2RlbENvbnRleHQpPy5zZXRQcm9wZXJ0eShcInNraXBQYXRjaEhhbmRsZXJzXCIsIGZhbHNlKTtcblx0XHR9XG5cdFx0KG9Db250cm9sbGVyLmdldFZpZXcoKT8uZ2V0QmluZGluZ0NvbnRleHQoXCJpbnRlcm5hbFwiKSBhcyBJbnRlcm5hbE1vZGVsQ29udGV4dCk/LnNldFByb3BlcnR5KFwiZ2V0Qm91bmRNZXNzYWdlc0Zvck1hc3NFZGl0XCIsIGZhbHNlKTtcblx0fSxcblxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiBnZW5lcmF0ZXMgc2lkZSBlZmZlY3RzIG1hcCBmcm9tIHNpZGUgZWZmZWN0cyBpZHMod2hpY2ggaXMgYSBjb21iaW5hdGlvbiBvZiBlbnRpdHkgdHlwZSBhbmQgcXVhbGlmaWVyKS5cblx0ICpcblx0ICogQHBhcmFtIG9FbnRpdHlTZXRDb250ZXh0XG5cdCAqIEBwYXJhbSBhU2lkZUVmZmVjdHNcblx0ICogQHBhcmFtIG9Db250cm9sbGVyXG5cdCAqIEBwYXJhbSBhUmVzdWx0c1xuXHQgKiBAcmV0dXJucyBTaWRlIGVmZmVjdCBtYXAgd2l0aCBkYXRhLlxuXHQgKi9cblx0Z2V0U2lkZUVmZmVjdERhdGFGb3JLZXk6IGZ1bmN0aW9uIChvRW50aXR5U2V0Q29udGV4dDogYW55LCBhU2lkZUVmZmVjdHM6IGFueSwgb0NvbnRyb2xsZXI6IGFueSwgYVJlc3VsdHM6IGFueSkge1xuXHRcdGNvbnN0IHNPd25lckVudGl0eVR5cGUgPSBvRW50aXR5U2V0Q29udGV4dC5nZXRQcm9wZXJ0eShcIiRUeXBlXCIpO1xuXHRcdGNvbnN0IGJhc2VTaWRlRWZmZWN0c01hcEFycmF5OiBhbnkgPSB7fTtcblxuXHRcdGFSZXN1bHRzLmZvckVhY2goKHJlc3VsdDogYW55KSA9PiB7XG5cdFx0XHRjb25zdCBzUGF0aCA9IHJlc3VsdC5rZXlWYWx1ZTtcblx0XHRcdGNvbnN0IHNpZGVFZmZlY3RzQXJyYXkgPSBGaWVsZEhlbHBlci5nZXRTaWRlRWZmZWN0c09uRW50aXR5QW5kUHJvcGVydHkoc1BhdGgsIHNPd25lckVudGl0eVR5cGUsIGFTaWRlRWZmZWN0cyk7XG5cdFx0XHRiYXNlU2lkZUVmZmVjdHNNYXBBcnJheVtzUGF0aF0gPSBvQ29udHJvbGxlci5fc2lkZUVmZmVjdHMuZ2VuZXJhdGVTaWRlRWZmZWN0c01hcEZyb21TaWRlRWZmZWN0SWQoc2lkZUVmZmVjdHNBcnJheSk7XG5cdFx0fSk7XG5cdFx0cmV0dXJuIGJhc2VTaWRlRWZmZWN0c01hcEFycmF5O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHaXZlIHRoZSBlbnRpdHkgdHlwZSBmb3IgYSBnaXZlbiBzcGF0aCBmb3IgZS5nLlJlcXVlc3RlZFF1YW50aXR5LlxuXHQgKlxuXHQgKiBAcGFyYW0gc1BhdGhcblx0ICogQHBhcmFtIHNFbnRpdHlUeXBlXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsXG5cdCAqIEByZXR1cm5zIE9iamVjdCBoYXZpbmcgZW50aXR5LCBzcGF0aCBhbmQgbmF2aWdhdGlvbiBwYXRoLlxuXHQgKi9cblx0Zm5HZXRQYXRoRm9yU291cmNlUHJvcGVydHk6IGZ1bmN0aW9uIChzUGF0aDogYW55LCBzRW50aXR5VHlwZTogYW55LCBvTWV0YU1vZGVsOiBhbnkpIHtcblx0XHQvLyBpZiB0aGUgcHJvcGVydHkgcGF0aCBoYXMgYSBuYXZpZ2F0aW9uLCBnZXQgdGhlIHRhcmdldCBlbnRpdHkgdHlwZSBvZiB0aGUgbmF2aWdhdGlvblxuXHRcdGNvbnN0IHNOYXZpZ2F0aW9uUGF0aCA9XG5cdFx0XHRcdHNQYXRoLmluZGV4T2YoXCIvXCIpID4gMCA/IFwiL1wiICsgc0VudGl0eVR5cGUgKyBcIi9cIiArIHNQYXRoLnN1YnN0cigwLCBzUGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKSArIFwiQHNhcHVpLm5hbWVcIiA6IGZhbHNlLFxuXHRcdFx0cE93bmVyRW50aXR5ID0gIXNOYXZpZ2F0aW9uUGF0aCA/IFByb21pc2UucmVzb2x2ZShzRW50aXR5VHlwZSkgOiBvTWV0YU1vZGVsLnJlcXVlc3RPYmplY3Qoc05hdmlnYXRpb25QYXRoKTtcblx0XHRzUGF0aCA9IHNOYXZpZ2F0aW9uUGF0aCA/IHNQYXRoLnN1YnN0cihzUGF0aC5sYXN0SW5kZXhPZihcIi9cIikgKyAxKSA6IHNQYXRoO1xuXHRcdHJldHVybiB7IHNQYXRoLCBwT3duZXJFbnRpdHksIHNOYXZpZ2F0aW9uUGF0aCB9O1xuXHR9LFxuXG5cdGZuR2V0RW50aXR5VHlwZU9mT3duZXI6IGZ1bmN0aW9uIChvTWV0YU1vZGVsOiBhbnksIGJhc2VOYXZQYXRoOiBzdHJpbmcsIG9FbnRpdHlTZXRDb250ZXh0OiBhbnksIHRhcmdldEVudGl0eTogc3RyaW5nLCBhVGFyZ2V0czogYW55KSB7XG5cdFx0Y29uc3Qgb3duZXJFbnRpdHlUeXBlID0gb0VudGl0eVNldENvbnRleHQuZ2V0UHJvcGVydHkoXCIkVHlwZVwiKTtcblx0XHRjb25zdCB7IFwiJFR5cGVcIjogcE93bmVyLCBcIiRQYXJ0bmVyXCI6IG93bmVyTmF2UGF0aCB9ID0gb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7b0VudGl0eVNldENvbnRleHR9LyR7YmFzZU5hdlBhdGh9YCk7IC8vIG5hdiBwYXRoXG5cdFx0aWYgKG93bmVyTmF2UGF0aCkge1xuXHRcdFx0Y29uc3QgZW50aXR5T2JqT2ZPd25lclBhcnRuZXIgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7cE93bmVyfS8ke293bmVyTmF2UGF0aH1gKTtcblx0XHRcdGlmIChlbnRpdHlPYmpPZk93bmVyUGFydG5lcikge1xuXHRcdFx0XHRjb25zdCBlbnRpdHlUeXBlT2ZPd25lclBhcnRuZXIgPSBlbnRpdHlPYmpPZk93bmVyUGFydG5lcltcIiRUeXBlXCJdO1xuXHRcdFx0XHQvLyBpZiB0aGUgZW50aXR5IHR5cGVzIGRlZmVyLCB0aGVuIGJhc2UgbmF2IHBhdGggaXMgbm90IGZyb20gb3duZXJcblx0XHRcdFx0aWYgKGVudGl0eVR5cGVPZk93bmVyUGFydG5lciAhPT0gb3duZXJFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdFx0Ly8gaWYgdGFyZ2V0IFByb3AgaXMgbm90IGZyb20gb3duZXIsIHdlIGFkZCBpdCBhcyBpbW1lZGlhdGVcblx0XHRcdFx0XHRhVGFyZ2V0cy5wdXNoKHRhcmdldEVudGl0eSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gaWYgdGhlcmUgaXMgbm8gJFBhcnRuZXIgYXR0cmlidXRlLCBpdCBtYXkgbm90IGJlIGZyb20gb3duZXJcblx0XHRcdGFUYXJnZXRzLnB1c2godGFyZ2V0RW50aXR5KTtcblx0XHR9XG5cdFx0cmV0dXJuIGFUYXJnZXRzO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHaXZlIHRhcmdldHMgdGhhdCBhcmUgaW1tZWRpYXRlIG9yIGRlZmVycmVkIGJhc2VkIG9uIHRoZSBlbnRpdHkgdHlwZSBvZiB0aGF0IHRhcmdldC5cblx0ICpcblx0ICpcblx0ICogQHBhcmFtIHNpZGVFZmZlY3RzRGF0YVxuXHQgKiBAcGFyYW0gb0VudGl0eVNldENvbnRleHRcblx0ICogQHBhcmFtIHNFbnRpdHlUeXBlXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsXG5cdCAqIEByZXR1cm5zIFRhcmdldHMgdG8gcmVxdWVzdCBzaWRlIGVmZmVjdHMuXG5cdCAqL1xuXHRmbkdldFRhcmdldHNGb3JNYXNzRWRpdDogZnVuY3Rpb24gKHNpZGVFZmZlY3RzRGF0YTogYW55LCBvRW50aXR5U2V0Q29udGV4dDogYW55LCBzRW50aXR5VHlwZTogYW55LCBvTWV0YU1vZGVsOiBhbnkpIHtcblx0XHRjb25zdCB7IFRhcmdldFByb3BlcnRpZXM6IGFUYXJnZXRQcm9wZXJ0aWVzLCBUYXJnZXRFbnRpdGllczogYVRhcmdldEVudGl0aWVzIH0gPSBzaWRlRWZmZWN0c0RhdGE7XG5cdFx0Y29uc3QgYVByb21pc2VzOiBhbnkgPSBbXTtcblx0XHRsZXQgYVRhcmdldHM6IGFueSA9IFtdO1xuXHRcdGNvbnN0IG93bmVyRW50aXR5VHlwZSA9IG9FbnRpdHlTZXRDb250ZXh0LmdldFByb3BlcnR5KFwiJFR5cGVcIik7XG5cblx0XHRpZiAoc0VudGl0eVR5cGUgPT09IG93bmVyRW50aXR5VHlwZSkge1xuXHRcdFx0Ly8gaWYgU2FsZXNPcmRyIEl0ZW1cblx0XHRcdGFUYXJnZXRFbnRpdGllcz8uZm9yRWFjaCgodGFyZ2V0RW50aXR5OiBhbnkpID0+IHtcblx0XHRcdFx0dGFyZ2V0RW50aXR5ID0gdGFyZ2V0RW50aXR5W1wiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIl07XG5cdFx0XHRcdGxldCBiYXNlTmF2UGF0aDogc3RyaW5nO1xuXHRcdFx0XHRpZiAodGFyZ2V0RW50aXR5LmluY2x1ZGVzKFwiL1wiKSkge1xuXHRcdFx0XHRcdGJhc2VOYXZQYXRoID0gdGFyZ2V0RW50aXR5LnNwbGl0KFwiL1wiKVswXTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRiYXNlTmF2UGF0aCA9IHRhcmdldEVudGl0eTtcblx0XHRcdFx0fVxuXHRcdFx0XHRhVGFyZ2V0cyA9IE1hc3NFZGl0SGVscGVyLmZuR2V0RW50aXR5VHlwZU9mT3duZXIob01ldGFNb2RlbCwgYmFzZU5hdlBhdGgsIG9FbnRpdHlTZXRDb250ZXh0LCB0YXJnZXRFbnRpdHksIGFUYXJnZXRzKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdGlmIChhVGFyZ2V0UHJvcGVydGllcy5sZW5ndGgpIHtcblx0XHRcdGFUYXJnZXRQcm9wZXJ0aWVzLmZvckVhY2goKHRhcmdldFByb3A6IGFueSkgPT4ge1xuXHRcdFx0XHRjb25zdCB7IHBPd25lckVudGl0eSB9ID0gTWFzc0VkaXRIZWxwZXIuZm5HZXRQYXRoRm9yU291cmNlUHJvcGVydHkodGFyZ2V0UHJvcCwgc0VudGl0eVR5cGUsIG9NZXRhTW9kZWwpO1xuXHRcdFx0XHRhUHJvbWlzZXMucHVzaChcblx0XHRcdFx0XHRwT3duZXJFbnRpdHkudGhlbigocmVzdWx0RW50aXR5OiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdC8vIGlmIGVudGl0eSBpcyBTYWxlc09yZGVySXRlbSwgVGFyZ2V0IFByb3BlcnR5IGlzIGZyb20gSXRlbXMgdGFibGVcblx0XHRcdFx0XHRcdGlmIChyZXN1bHRFbnRpdHkgPT09IG93bmVyRW50aXR5VHlwZSkge1xuXHRcdFx0XHRcdFx0XHRhVGFyZ2V0cy5wdXNoKHRhcmdldFByb3ApOyAvLyBnZXQgaW1tZWRpYXRlIHRhcmdldHNcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAodGFyZ2V0UHJvcC5pbmNsdWRlcyhcIi9cIikpIHtcblx0XHRcdFx0XHRcdFx0Y29uc3QgYmFzZU5hdlBhdGggPSB0YXJnZXRQcm9wLnNwbGl0KFwiL1wiKVswXTtcblx0XHRcdFx0XHRcdFx0YVRhcmdldHMgPSBNYXNzRWRpdEhlbHBlci5mbkdldEVudGl0eVR5cGVPZk93bmVyKFxuXHRcdFx0XHRcdFx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHRcdFx0YmFzZU5hdlBhdGgsXG5cdFx0XHRcdFx0XHRcdFx0b0VudGl0eVNldENvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFx0dGFyZ2V0UHJvcCxcblx0XHRcdFx0XHRcdFx0XHRhVGFyZ2V0c1xuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShhVGFyZ2V0cyk7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0KTtcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRhUHJvbWlzZXMucHVzaChQcm9taXNlLnJlc29sdmUoYVRhcmdldHMpKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoYVByb21pc2VzKTtcblx0fSxcblxuXHQvKipcblx0ICogVXBvbiB1cGRhdGluZyB0aGUgZmllbGQsIGFycmF5IG9mIGltbWVkaWF0ZSBhbmQgZGVmZXJyZWQgc2lkZSBlZmZlY3RzIGZvciB0aGF0IGZpZWxkIGFyZSBjcmVhdGVkLlxuXHQgKiBJZiB0aGVyZSBhcmUgYW55IGZhaWxlZCBzaWRlIGVmZmVjdHMgZm9yIHRoYXQgY29udGV4dCwgdGhleSB3aWxsIGFsc28gYmUgdXNlZCB0byBnZW5lcmF0ZSB0aGUgbWFwLlxuXHQgKiBJZiB0aGUgZmllbGQgaGFzIHRleHQgYXNzb2NpYXRlZCB3aXRoIGl0LCB0aGVuIGFkZCBpdCB0byByZXF1ZXN0IHNpZGUgZWZmZWN0cy5cblx0ICpcblx0ICogQHBhcmFtIG1QYXJhbXNcblx0ICogQHBhcmFtIG1QYXJhbXMub0NvbnRyb2xsZXIgQ29udHJvbGxlclxuXHQgKiBAcGFyYW0gbVBhcmFtcy5vRmllbGRQcm9taXNlIFByb21pc2UgdG8gdXBkYXRlIGZpZWxkXG5cdCAqIEBwYXJhbSBtUGFyYW1zLnNpZGVFZmZlY3RNYXAgU2lkZUVmZmVjdHNNYXAgZm9yIHRoZSBmaWVsZFxuXHQgKiBAcGFyYW0gbVBhcmFtcy50ZXh0UGF0aHMgVGV4dFBhdGhzIG9mIHRoZSBmaWVsZCBpZiBhbnlcblx0ICogQHBhcmFtIG1QYXJhbXMuZ3JvdXBJZCBHcm91cCBJZCB0byB1c2VkIHRvIGdyb3VwIHJlcXVlc3RzXG5cdCAqIEBwYXJhbSBtUGFyYW1zLmtleSBLZXlWYWx1ZSBvZiB0aGUgZmllbGRcblx0ICogQHBhcmFtIG1QYXJhbXMub0VudGl0eVNldENvbnRleHQgRW50aXR5U2V0Y29udGV4dFxuXHQgKiBAcGFyYW0gbVBhcmFtcy5vTWV0YU1vZGVsIE1ldGFtb2RlbCBkYXRhXG5cdCAqIEBwYXJhbSBtUGFyYW1zLnNlbGVjdGVkQ29udGV4dCBTZWxlY3RlZCByb3cgY29udGV4dFxuXHQgKiBAcGFyYW0gbVBhcmFtcy5kZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZSBEZWZlcnJlZCB0YXJnZXRzIGRhdGFcblx0ICogQHJldHVybnMgUHJvbWlzZSBmb3IgYWxsIGltbWVkaWF0ZWx5IHJlcXVlc3RlZCBzaWRlIGVmZmVjdHMuXG5cdCAqL1xuXHRoYW5kbGVNYXNzRWRpdEZpZWxkVXBkYXRlQW5kUmVxdWVzdFNpZGVFZmZlY3RzOiBhc3luYyBmdW5jdGlvbiAobVBhcmFtczogRGF0YVRvVXBkYXRlRmllbGRBbmRTaWRlRWZmZWN0c1R5cGUpIHtcblx0XHRjb25zdCB7XG5cdFx0XHRvQ29udHJvbGxlcixcblx0XHRcdG9GaWVsZFByb21pc2UsXG5cdFx0XHRzaWRlRWZmZWN0c01hcCxcblx0XHRcdHRleHRQYXRocyxcblx0XHRcdGdyb3VwSWQsXG5cdFx0XHRrZXksXG5cdFx0XHRvRW50aXR5U2V0Q29udGV4dCxcblx0XHRcdG9NZXRhTW9kZWwsXG5cdFx0XHRvU2VsZWN0ZWRDb250ZXh0LFxuXHRcdFx0ZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWVcblx0XHR9ID0gbVBhcmFtcztcblx0XHRjb25zdCBpbW1lZGlhdGVTaWRlRWZmZWN0c1Byb21pc2VzID0gW29GaWVsZFByb21pc2VdO1xuXHRcdGNvbnN0IG93bmVyRW50aXR5VHlwZSA9IG9FbnRpdHlTZXRDb250ZXh0LmdldFByb3BlcnR5KFwiJFR5cGVcIik7XG5cdFx0Y29uc3Qgb0FwcENvbXBvbmVudCA9IENvbW1vblV0aWxzLmdldEFwcENvbXBvbmVudChvQ29udHJvbGxlci5nZXRWaWV3KCkpO1xuXHRcdGNvbnN0IG9TaWRlRWZmZWN0c1NlcnZpY2UgPSBvQXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpO1xuXG5cdFx0aWYgKHNpZGVFZmZlY3RzTWFwKSB7XG5cdFx0XHRjb25zdCBhbGxFbnRpdHlUeXBlc1dpdGhRdWFsaWZpZXIgPSBPYmplY3Qua2V5cyhzaWRlRWZmZWN0c01hcCk7XG5cdFx0XHRjb25zdCBzaWRlRWZmZWN0c0RhdGFGb3JGaWVsZDogYW55ID0gT2JqZWN0LnZhbHVlcyhzaWRlRWZmZWN0c01hcCk7XG5cblx0XHRcdGNvbnN0IG1WaXNpdGVkU2lkZUVmZmVjdHM6IGFueSA9IHt9O1xuXHRcdFx0ZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWVba2V5XSA9IHt9O1xuXHRcdFx0Zm9yIChjb25zdCBbaW5kZXgsIGRhdGFdIG9mIHNpZGVFZmZlY3RzRGF0YUZvckZpZWxkLmVudHJpZXMoKSkge1xuXHRcdFx0XHRjb25zdCBlbnRpdHlUeXBlV2l0aFF1YWxpZmllciA9IGFsbEVudGl0eVR5cGVzV2l0aFF1YWxpZmllcltpbmRleF07XG5cdFx0XHRcdGNvbnN0IHNFbnRpdHlUeXBlID0gZW50aXR5VHlwZVdpdGhRdWFsaWZpZXIuc3BsaXQoXCIjXCIpWzBdO1xuXHRcdFx0XHRjb25zdCBvQ29udGV4dDogYW55ID0gb0NvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLmdldENvbnRleHRGb3JTaWRlRWZmZWN0cyhvU2VsZWN0ZWRDb250ZXh0LCBzRW50aXR5VHlwZSk7XG5cdFx0XHRcdGRhdGEuY29udGV4dCA9IG9Db250ZXh0O1xuXG5cdFx0XHRcdGNvbnN0IGFsbEZhaWxlZFNpZGVFZmZlY3RzID0gb0NvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLmdldFJlZ2lzdGVyZWRGYWlsZWRSZXF1ZXN0cygpO1xuXHRcdFx0XHRjb25zdCBhRmFpbGVkU2lkZUVmZmVjdHMgPSBhbGxGYWlsZWRTaWRlRWZmZWN0c1tvQ29udGV4dC5nZXRQYXRoKCldO1xuXHRcdFx0XHRvQ29udHJvbGxlci5fc2lkZUVmZmVjdHMuZGVsZXRlRmFpbGVkUmVxdWVzdHNGb3JBQ29udGV4dChvQ29udGV4dCk7XG5cdFx0XHRcdGxldCBzaWRlRWZmZWN0c0ZvckN1cnJlbnRDb250ZXh0ID0gW2RhdGEuc2lkZUVmZmVjdHNdO1xuXHRcdFx0XHRzaWRlRWZmZWN0c0ZvckN1cnJlbnRDb250ZXh0ID1cblx0XHRcdFx0XHRhRmFpbGVkU2lkZUVmZmVjdHMgJiYgYUZhaWxlZFNpZGVFZmZlY3RzLmxlbmd0aFxuXHRcdFx0XHRcdFx0PyBzaWRlRWZmZWN0c0ZvckN1cnJlbnRDb250ZXh0LmNvbmNhdChhRmFpbGVkU2lkZUVmZmVjdHMpXG5cdFx0XHRcdFx0XHQ6IHNpZGVFZmZlY3RzRm9yQ3VycmVudENvbnRleHQ7XG5cdFx0XHRcdG1WaXNpdGVkU2lkZUVmZmVjdHNbb0NvbnRleHRdID0ge307XG5cdFx0XHRcdGZvciAoY29uc3QgYVNpZGVFZmZlY3Qgb2Ygc2lkZUVmZmVjdHNGb3JDdXJyZW50Q29udGV4dCkge1xuXHRcdFx0XHRcdGlmICghbVZpc2l0ZWRTaWRlRWZmZWN0c1tvQ29udGV4dF0uaGFzT3duUHJvcGVydHkoYVNpZGVFZmZlY3QuZnVsbHlRdWFsaWZpZWROYW1lKSkge1xuXHRcdFx0XHRcdFx0bVZpc2l0ZWRTaWRlRWZmZWN0c1tvQ29udGV4dF1bYVNpZGVFZmZlY3QuZnVsbHlRdWFsaWZpZWROYW1lXSA9IHRydWU7XG5cdFx0XHRcdFx0XHRsZXQgYUltbWVkaWF0ZVRhcmdldHM6IGFueVtdID0gW10sXG5cdFx0XHRcdFx0XHRcdGFsbFRhcmdldHM6IGFueVtdID0gW10sXG5cdFx0XHRcdFx0XHRcdHRyaWdnZXJBY3Rpb25OYW1lOiBTdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0XHRcdFx0XHRcdGNvbnN0IGZuR2V0SW1tZWRpYXRlVGFyZ2V0c0FuZEFjdGlvbnMgPSBhc3luYyBmdW5jdGlvbiAobVNpZGVFZmZlY3Q6IFNpZGVFZmZlY3RzVHlwZSkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCB7IFRhcmdldFByb3BlcnRpZXM6IGFUYXJnZXRQcm9wZXJ0aWVzLCBUYXJnZXRFbnRpdGllczogYVRhcmdldEVudGl0aWVzIH0gPSBtU2lkZUVmZmVjdDtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgc2lkZUVmZmVjdEVudGl0eVR5cGUgPSBtU2lkZUVmZmVjdC5mdWxseVF1YWxpZmllZE5hbWUuc3BsaXQoXCJAXCIpWzBdO1xuXHRcdFx0XHRcdFx0XHRjb25zdCB0YXJnZXRzQXJyYXlGb3JBbGxQcm9wZXJ0aWVzID0gYXdhaXQgTWFzc0VkaXRIZWxwZXIuZm5HZXRUYXJnZXRzRm9yTWFzc0VkaXQoXG5cdFx0XHRcdFx0XHRcdFx0bVNpZGVFZmZlY3QsXG5cdFx0XHRcdFx0XHRcdFx0b0VudGl0eVNldENvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFx0c2lkZUVmZmVjdEVudGl0eVR5cGUsXG5cdFx0XHRcdFx0XHRcdFx0b01ldGFNb2RlbFxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRhSW1tZWRpYXRlVGFyZ2V0cyA9IHRhcmdldHNBcnJheUZvckFsbFByb3BlcnRpZXNbMF07XG5cdFx0XHRcdFx0XHRcdGFsbFRhcmdldHMgPSAoYVRhcmdldFByb3BlcnRpZXMgfHwgW10pLmNvbmNhdCgoYVRhcmdldEVudGl0aWVzIGFzIGFueVtdKSB8fCBbXSk7XG5cblx0XHRcdFx0XHRcdFx0Y29uc3QgYWN0aW9uTmFtZTogU3RyaW5nIHwgdW5kZWZpbmVkID0gKG1TaWRlRWZmZWN0IGFzIE9EYXRhU2lkZUVmZmVjdHNUeXBlKS5UcmlnZ2VyQWN0aW9uO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBhRGVmZXJyZWRUYXJnZXRzID0gYWxsVGFyZ2V0cy5maWx0ZXIoKHRhcmdldDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuICFhSW1tZWRpYXRlVGFyZ2V0cy5pbmNsdWRlcyh0YXJnZXQpO1xuXHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZVtrZXldW21TaWRlRWZmZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0YVRhcmdldHM6IGFEZWZlcnJlZFRhcmdldHMsXG5cdFx0XHRcdFx0XHRcdFx0b0NvbnRleHQ6IG9Db250ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdG1TaWRlRWZmZWN0XG5cdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0Ly8gaWYgZW50aXR5IGlzIG90aGVyIHRoYW4gaXRlbXMgdGFibGUgdGhlbiBhY3Rpb24gaXMgZGVmZXJlZFxuXHRcdFx0XHRcdFx0XHRpZiAoYWN0aW9uTmFtZSAmJiBzaWRlRWZmZWN0RW50aXR5VHlwZSA9PT0gb3duZXJFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gc3RhdGljIGFjdGlvbiBpcyBvbiBjb2xsZWN0aW9uLCBzbyB3ZSBkZWZlciBpdCwgZWxzZSBhZGQgdG8gaW1tZWRpYXRlIHJlcXVlc3RzIGFycmF5XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgaXNTdGF0aWNBY3Rpb24gPSBUYWJsZUhlbHBlci5faXNTdGF0aWNBY3Rpb24ob01ldGFNb2RlbC5nZXRPYmplY3QoYC8ke2FjdGlvbk5hbWV9YCksIGFjdGlvbk5hbWUpO1xuXHRcdFx0XHRcdFx0XHRcdGlmICghaXNTdGF0aWNBY3Rpb24pIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRyaWdnZXJBY3Rpb25OYW1lID0gYWN0aW9uTmFtZTtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWVba2V5XVttU2lkZUVmZmVjdC5mdWxseVF1YWxpZmllZE5hbWVdW1wiVHJpZ2dlckFjdGlvblwiXSA9IGFjdGlvbk5hbWU7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lW2tleV1bbVNpZGVFZmZlY3QuZnVsbHlRdWFsaWZpZWROYW1lXVtcIlRyaWdnZXJBY3Rpb25cIl0gPSBhY3Rpb25OYW1lO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRhVGFyZ2V0czogYUltbWVkaWF0ZVRhcmdldHMsXG5cdFx0XHRcdFx0XHRcdFx0VHJpZ2dlckFjdGlvbjogdHJpZ2dlckFjdGlvbk5hbWVcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdGltbWVkaWF0ZVNpZGVFZmZlY3RzUHJvbWlzZXMucHVzaChcblx0XHRcdFx0XHRcdFx0b0NvbnRyb2xsZXIuX3NpZGVFZmZlY3RzLnJlcXVlc3RTaWRlRWZmZWN0cyhhU2lkZUVmZmVjdCwgb0NvbnRleHQsIGdyb3VwSWQsIGZuR2V0SW1tZWRpYXRlVGFyZ2V0c0FuZEFjdGlvbnMpXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAodGV4dFBhdGhzPy5ba2V5XSAmJiB0ZXh0UGF0aHNba2V5XS5sZW5ndGgpIHtcblx0XHRcdGltbWVkaWF0ZVNpZGVFZmZlY3RzUHJvbWlzZXMucHVzaChvU2lkZUVmZmVjdHNTZXJ2aWNlLnJlcXVlc3RTaWRlRWZmZWN0cyh0ZXh0UGF0aHNba2V5XSwgb1NlbGVjdGVkQ29udGV4dCwgZ3JvdXBJZCkpO1xuXHRcdH1cblx0XHRyZXR1cm4gKFByb21pc2UgYXMgYW55KS5hbGxTZXR0bGVkKGltbWVkaWF0ZVNpZGVFZmZlY3RzUHJvbWlzZXMpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIG1hc3MgZWRpdCBkaWFsb2cuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGFibGUgSW5zdGFuY2Ugb2YgVGFibGVcblx0ICogQHBhcmFtIGFDb250ZXh0cyBDb250ZXh0cyBmb3IgbWFzcyBlZGl0XG5cdCAqIEBwYXJhbSBvQ29udHJvbGxlciBDb250cm9sbGVyIGZvciB0aGUgdmlld1xuXHQgKiBAcmV0dXJucyBQcm9taXNlIHJldHVybmluZyBpbnN0YW5jZSBvZiBkaWFsb2cuXG5cdCAqL1xuXHRjcmVhdGVEaWFsb2c6IGFzeW5jIGZ1bmN0aW9uIChvVGFibGU6IFRhYmxlLCBhQ29udGV4dHM6IGFueVtdLCBvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIpOiBQcm9taXNlPGFueT4ge1xuXHRcdGNvbnN0IHNGcmFnbWVudE5hbWUgPSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL21hc3NFZGl0L01hc3NFZGl0RGlhbG9nXCIsXG5cdFx0XHRhRGF0YUFycmF5OiBhbnlbXSA9IFtdLFxuXHRcdFx0b1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKSxcblx0XHRcdG9EZWZhdWx0VmFsdWVzID0gTWFzc0VkaXRIZWxwZXIuZ2V0RGVmYXVsdFRleHRzRm9yRGlhbG9nKG9SZXNvdXJjZUJ1bmRsZSwgYUNvbnRleHRzLmxlbmd0aCwgb1RhYmxlKSxcblx0XHRcdG9EYXRhRmllbGRNb2RlbCA9IE1hc3NFZGl0SGVscGVyLnByZXBhcmVEYXRhRm9yRGlhbG9nKG9UYWJsZSwgYUNvbnRleHRzLCBhRGF0YUFycmF5KSxcblx0XHRcdGRpYWxvZ0NvbnRleHQgPSBNYXNzRWRpdEhlbHBlci5nZXREaWFsb2dDb250ZXh0KG9UYWJsZSksXG5cdFx0XHRvRGlhbG9nRGF0YU1vZGVsID0gTWFzc0VkaXRIZWxwZXIuc2V0UnVudGltZU1vZGVsT25EaWFsb2coYUNvbnRleHRzLCBhRGF0YUFycmF5LCBvRGVmYXVsdFZhbHVlcywgZGlhbG9nQ29udGV4dCksXG5cdFx0XHRtb2RlbCA9IG9UYWJsZS5nZXRNb2RlbCgpLFxuXHRcdFx0bWV0YU1vZGVsID0gbW9kZWwuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRpdGVtc01vZGVsID0gbmV3IFRlbXBsYXRlTW9kZWwob0RhdGFGaWVsZE1vZGVsLmdldERhdGEoKSwgbWV0YU1vZGVsKTtcblxuXHRcdGNvbnN0IG9GcmFnbWVudCA9IFhNTFRlbXBsYXRlUHJvY2Vzc29yLmxvYWRUZW1wbGF0ZShzRnJhZ21lbnROYW1lLCBcImZyYWdtZW50XCIpO1xuXG5cdFx0Y29uc3Qgb0NyZWF0ZWRGcmFnbWVudCA9IGF3YWl0IFByb21pc2UucmVzb2x2ZShcblx0XHRcdFhNTFByZXByb2Nlc3Nvci5wcm9jZXNzKFxuXHRcdFx0XHRvRnJhZ21lbnQsXG5cdFx0XHRcdHsgbmFtZTogc0ZyYWdtZW50TmFtZSB9LFxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0YmluZGluZ0NvbnRleHRzOiB7XG5cdFx0XHRcdFx0XHRkYXRhRmllbGRNb2RlbDogaXRlbXNNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIiksXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IG1ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcIi9cIilcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdG1vZGVsczoge1xuXHRcdFx0XHRcdFx0ZGF0YUZpZWxkTW9kZWw6IGl0ZW1zTW9kZWwsXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IG1ldGFNb2RlbFxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0KVxuXHRcdCk7XG5cdFx0Y29uc3Qgb0RpYWxvZ0NvbnRlbnQgPSBhd2FpdCBGcmFnbWVudC5sb2FkKHsgZGVmaW5pdGlvbjogb0NyZWF0ZWRGcmFnbWVudCB9KTtcblx0XHRjb25zdCBvRGlhbG9nID0gbmV3IERpYWxvZyh7XG5cdFx0XHRyZXNpemFibGU6IHRydWUsXG5cdFx0XHR0aXRsZTogb0RlZmF1bHRWYWx1ZXMubWFzc0VkaXRUaXRsZSxcblx0XHRcdGNvbnRlbnQ6IFtvRGlhbG9nQ29udGVudCBhcyBhbnldLFxuXHRcdFx0YWZ0ZXJPcGVuOiBNYXNzRWRpdEhlbHBlci5vbkRpYWxvZ09wZW4sXG5cdFx0XHRiZWdpbkJ1dHRvbjogbmV3IEJ1dHRvbih7XG5cdFx0XHRcdHRleHQ6IE1hc3NFZGl0SGVscGVyLmhlbHBlcnMuZ2V0RXhwQmluZGluZ0ZvckFwcGx5QnV0dG9uVHh0KG9EZWZhdWx0VmFsdWVzLCBvRGF0YUZpZWxkTW9kZWwuZ2V0T2JqZWN0KFwiL1wiKSksXG5cdFx0XHRcdHR5cGU6IFwiRW1waGFzaXplZFwiLFxuXHRcdFx0XHRwcmVzczogYXN5bmMgZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdFx0bWVzc2FnZUhhbmRsaW5nLnJlbW92ZUJvdW5kVHJhbnNpdGlvbk1lc3NhZ2VzKCk7XG5cdFx0XHRcdFx0bWVzc2FnZUhhbmRsaW5nLnJlbW92ZVVuYm91bmRUcmFuc2l0aW9uTWVzc2FnZXMoKTtcblx0XHRcdFx0XHQob0NvbnRyb2xsZXIuZ2V0VmlldygpPy5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIEludGVybmFsTW9kZWxDb250ZXh0KT8uc2V0UHJvcGVydHkoXCJza2lwUGF0Y2hIYW5kbGVyc1wiLCB0cnVlKTtcblx0XHRcdFx0XHRjb25zdCBvSW5EaWFsb2cgPSBvRXZlbnQuZ2V0U291cmNlKCkuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdFx0Y29uc3Qgb01vZGVsID0gb0luRGlhbG9nLmdldE1vZGVsKFwiZmllbGRzSW5mb1wiKTtcblx0XHRcdFx0XHRjb25zdCBhUmVzdWx0cyA9IG9Nb2RlbC5nZXRQcm9wZXJ0eShcIi9yZXN1bHRzXCIpO1xuXG5cdFx0XHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9UYWJsZSAmJiAob1RhYmxlLmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgYW55KSxcblx0XHRcdFx0XHRcdHNDdXJyZW50RW50aXR5U2V0TmFtZSA9IG9UYWJsZS5kYXRhKFwibWV0YVBhdGhcIiksXG5cdFx0XHRcdFx0XHRvRW50aXR5U2V0Q29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0Q29udGV4dChzQ3VycmVudEVudGl0eVNldE5hbWUpO1xuXHRcdFx0XHRcdGNvbnN0IGFTaWRlRWZmZWN0cyA9IGF3YWl0IFNpZGVFZmZlY3RzSGVscGVyLmdlbmVyYXRlU2lkZUVmZmVjdHNNYXBGcm9tTWV0YU1vZGVsKG9NZXRhTW9kZWwpO1xuXHRcdFx0XHRcdGNvbnN0IGVycm9yQ29udGV4dHM6IGFueVtdID0gW107XG5cdFx0XHRcdFx0Y29uc3QgdGV4dFBhdGhzID0gb01vZGVsLmdldFByb3BlcnR5KFwiL3RleHRQYXRoc1wiKTtcblx0XHRcdFx0XHRjb25zdCBhUHJvcGVydHlSZWFkYWJsZUluZm8gPSBvTW9kZWwuZ2V0UHJvcGVydHkoXCIvcmVhZGFibGVQcm9wZXJ0eURhdGFcIik7XG5cdFx0XHRcdFx0bGV0IGdyb3VwSWQ6IHN0cmluZztcblx0XHRcdFx0XHRsZXQgYWxsU2lkZUVmZmVjdHM6IGFueVtdO1xuXHRcdFx0XHRcdGNvbnN0IG1hc3NFZGl0UHJvbWlzZXM6IGFueSA9IFtdO1xuXHRcdFx0XHRcdGNvbnN0IGZhaWxlZEZpZWxkc0RhdGE6IGFueSA9IHt9O1xuXHRcdFx0XHRcdGNvbnN0IHNlbGVjdGVkUm93c0xlbmd0aCA9IGFDb250ZXh0cy5sZW5ndGg7XG5cdFx0XHRcdFx0Y29uc3QgZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWU6IGFueSA9IHt9O1xuXHRcdFx0XHRcdGNvbnN0IGJhc2VTaWRlRWZmZWN0c01hcEFycmF5ID0gTWFzc0VkaXRIZWxwZXIuZ2V0U2lkZUVmZmVjdERhdGFGb3JLZXkoXG5cdFx0XHRcdFx0XHRvRW50aXR5U2V0Q29udGV4dCxcblx0XHRcdFx0XHRcdGFTaWRlRWZmZWN0cyxcblx0XHRcdFx0XHRcdG9Db250cm9sbGVyLFxuXHRcdFx0XHRcdFx0YVJlc3VsdHNcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdC8vY29uc3QgY2hhbmdlUHJvbWlzZTogYW55W10gPSBbXTtcblx0XHRcdFx0XHQvL2xldCBiUmVhZE9ubHlGaWVsZCA9IGZhbHNlO1xuXHRcdFx0XHRcdC8vY29uc3QgZXJyb3JDb250ZXh0czogb2JqZWN0W10gPSBbXTtcblxuXHRcdFx0XHRcdGFDb250ZXh0cy5mb3JFYWNoKGZ1bmN0aW9uIChvU2VsZWN0ZWRDb250ZXh0OiBhbnksIGlkeDogbnVtYmVyKSB7XG5cdFx0XHRcdFx0XHRhbGxTaWRlRWZmZWN0cyA9IFtdO1xuXHRcdFx0XHRcdFx0YVJlc3VsdHMuZm9yRWFjaChhc3luYyBmdW5jdGlvbiAob1Jlc3VsdDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdGlmICghZmFpbGVkRmllbGRzRGF0YS5oYXNPd25Qcm9wZXJ0eShvUmVzdWx0LmtleVZhbHVlKSkge1xuXHRcdFx0XHRcdFx0XHRcdGZhaWxlZEZpZWxkc0RhdGFbb1Jlc3VsdC5rZXlWYWx1ZV0gPSAwO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdC8vVE9ETyAtIEFkZCBzYXZlIGltcGxlbWVudGF0aW9uIGZvciBWYWx1ZSBIZWxwLlxuXHRcdFx0XHRcdFx0XHRpZiAoYmFzZVNpZGVFZmZlY3RzTWFwQXJyYXlbb1Jlc3VsdC5rZXlWYWx1ZV0pIHtcblx0XHRcdFx0XHRcdFx0XHRhbGxTaWRlRWZmZWN0c1tvUmVzdWx0LmtleVZhbHVlXSA9IGJhc2VTaWRlRWZmZWN0c01hcEFycmF5W29SZXN1bHQua2V5VmFsdWVdO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0aWYgKGFQcm9wZXJ0eVJlYWRhYmxlSW5mbykge1xuXHRcdFx0XHRcdFx0XHRcdGFQcm9wZXJ0eVJlYWRhYmxlSW5mby5zb21lKGZ1bmN0aW9uIChvUHJvcGVydHlJbmZvOiBhbnkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChvUmVzdWx0LmtleVZhbHVlID09PSBvUHJvcGVydHlJbmZvLnByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGlmIChvUHJvcGVydHlJbmZvLnR5cGUgPT09IFwiRGVmYXVsdFwiKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9Qcm9wZXJ0eUluZm8udmFsdWUgPT09IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b1Byb3BlcnR5SW5mby50eXBlID09PSBcIlBhdGhcIiAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9Qcm9wZXJ0eUluZm8ucHJvcGVydHlWYWx1ZSAmJlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9Qcm9wZXJ0eUluZm8ucHJvcGVydHlQYXRoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvU2VsZWN0ZWRDb250ZXh0LmdldE9iamVjdChvUHJvcGVydHlJbmZvLnByb3BlcnR5UGF0aCkgPT09IG9Qcm9wZXJ0eUluZm8ucHJvcGVydHlWYWx1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGdyb3VwSWQgPSBgJGF1dG8uJHtpZHh9YDtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb0ZpZWxkUHJvbWlzZSA9IG9TZWxlY3RlZENvbnRleHRcblx0XHRcdFx0XHRcdFx0XHQuc2V0UHJvcGVydHkob1Jlc3VsdC5rZXlWYWx1ZSwgb1Jlc3VsdC52YWx1ZSwgZ3JvdXBJZClcblx0XHRcdFx0XHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKG9FcnJvcjogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRlcnJvckNvbnRleHRzLnB1c2gob1NlbGVjdGVkQ29udGV4dC5nZXRPYmplY3QoKSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJNYXNzIEVkaXQ6IFNvbWV0aGluZyB3ZW50IHdyb25nIGluIHVwZGF0aW5nIGVudHJpZXMuXCIsIG9FcnJvcik7XG5cdFx0XHRcdFx0XHRcdFx0XHRmYWlsZWRGaWVsZHNEYXRhW29SZXN1bHQua2V5VmFsdWVdID0gZmFpbGVkRmllbGRzRGF0YVtvUmVzdWx0LmtleVZhbHVlXSArIDE7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoeyBpc0ZpZWxkVXBkYXRlRmFpbGVkOiB0cnVlIH0pO1xuXHRcdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdGNvbnN0IGRhdGFUb1VwZGF0ZUZpZWxkQW5kU2lkZUVmZmVjdHM6IERhdGFUb1VwZGF0ZUZpZWxkQW5kU2lkZUVmZmVjdHNUeXBlID0ge1xuXHRcdFx0XHRcdFx0XHRcdG9Db250cm9sbGVyLFxuXHRcdFx0XHRcdFx0XHRcdG9GaWVsZFByb21pc2UsXG5cdFx0XHRcdFx0XHRcdFx0c2lkZUVmZmVjdHNNYXA6IGJhc2VTaWRlRWZmZWN0c01hcEFycmF5W29SZXN1bHQua2V5VmFsdWVdLFxuXHRcdFx0XHRcdFx0XHRcdHRleHRQYXRocyxcblx0XHRcdFx0XHRcdFx0XHRncm91cElkLFxuXHRcdFx0XHRcdFx0XHRcdGtleTogb1Jlc3VsdC5rZXlWYWx1ZSxcblx0XHRcdFx0XHRcdFx0XHRvRW50aXR5U2V0Q29udGV4dCxcblx0XHRcdFx0XHRcdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0XHRcdFx0XHRcdG9TZWxlY3RlZENvbnRleHQsXG5cdFx0XHRcdFx0XHRcdFx0ZGVmZXJyZWRUYXJnZXRzRm9yQVF1YWxpZmllZE5hbWVcblx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0bWFzc0VkaXRQcm9taXNlcy5wdXNoKFxuXHRcdFx0XHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLmhhbmRsZU1hc3NFZGl0RmllbGRVcGRhdGVBbmRSZXF1ZXN0U2lkZUVmZmVjdHMoZGF0YVRvVXBkYXRlRmllbGRBbmRTaWRlRWZmZWN0cylcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0YXdhaXQgKFByb21pc2UgYXMgYW55KVxuXHRcdFx0XHRcdFx0LmFsbFNldHRsZWQobWFzc0VkaXRQcm9taXNlcylcblx0XHRcdFx0XHRcdC50aGVuKGFzeW5jIGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0Z3JvdXBJZCA9IGAkYXV0by5tYXNzRWRpdERlZmVycmVkYDtcblx0XHRcdFx0XHRcdFx0Y29uc3QgZGVmZXJyZWRSZXF1ZXN0cyA9IFtdO1xuXHRcdFx0XHRcdFx0XHRjb25zdCBzaWRlRWZmZWN0c0RhdGFGb3JBbGxLZXlzOiBhbnkgPSBPYmplY3QudmFsdWVzKGRlZmVycmVkVGFyZ2V0c0ZvckFRdWFsaWZpZWROYW1lKTtcblx0XHRcdFx0XHRcdFx0Y29uc3Qga2V5c1dpdGhTaWRlRWZmZWN0czogYW55W10gPSBPYmplY3Qua2V5cyhkZWZlcnJlZFRhcmdldHNGb3JBUXVhbGlmaWVkTmFtZSk7XG5cblx0XHRcdFx0XHRcdFx0c2lkZUVmZmVjdHNEYXRhRm9yQWxsS2V5cy5mb3JFYWNoKChhU2lkZUVmZmVjdDogYW55LCBpbmRleDogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgY3VycmVudEtleSA9IGtleXNXaXRoU2lkZUVmZmVjdHNbaW5kZXhdO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChmYWlsZWRGaWVsZHNEYXRhW2N1cnJlbnRLZXldICE9PSBzZWxlY3RlZFJvd3NMZW5ndGgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGRlZmVycmVkU2lkZUVmZmVjdHNEYXRhID0gT2JqZWN0LnZhbHVlcyhhU2lkZUVmZmVjdCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRkZWZlcnJlZFNpZGVFZmZlY3RzRGF0YS5mb3JFYWNoKChyZXE6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCB7IGFUYXJnZXRzLCBvQ29udGV4dCwgVHJpZ2dlckFjdGlvbiwgbVNpZGVFZmZlY3QgfSA9IHJlcTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Y29uc3QgZm5HZXREZWZlcnJlZFRhcmdldHMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGFUYXJnZXRzO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBmbkdldERlZmVycmVkVGFyZ2V0c0FuZEFjdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGFUYXJnZXRzOiBmbkdldERlZmVycmVkVGFyZ2V0cygpLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0VHJpZ2dlckFjdGlvbjogVHJpZ2dlckFjdGlvblxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH07XG5cblx0XHRcdFx0XHRcdFx0XHRcdFx0ZGVmZXJyZWRSZXF1ZXN0cy5wdXNoKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdC8vIGlmIHNvbWUgZGVmZXJyZWQgaXMgcmVqZWN0ZWQsIGl0IHdpbGwgYmUgYWRkIHRvIGZhaWxlZCBxdWV1ZVxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9Db250cm9sbGVyLl9zaWRlRWZmZWN0cy5yZXF1ZXN0U2lkZUVmZmVjdHMoXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRtU2lkZUVmZmVjdCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9Db250ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0Z3JvdXBJZCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdGZuR2V0RGVmZXJyZWRUYXJnZXRzQW5kQWN0aW9uc1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRNYXNzRWRpdEhlbHBlci5tZXNzYWdlSGFuZGxpbmdGb3JNYXNzRWRpdChvVGFibGUsIGFDb250ZXh0cywgb0NvbnRyb2xsZXIsIG9JbkRpYWxvZywgYVJlc3VsdHMsIGVycm9yQ29udGV4dHMpO1xuXHRcdFx0XHRcdFx0fSlcblx0XHRcdFx0XHRcdC5jYXRjaCgoZTogYW55KSA9PiB7XG5cdFx0XHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLmNsb3NlRGlhbG9nKG9EaWFsb2cpO1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gUHJvbWlzZS5yZWplY3QoZSk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0fSksXG5cdFx0XHRlbmRCdXR0b246IG5ldyBCdXR0b24oe1xuXHRcdFx0XHR0ZXh0OiBvRGVmYXVsdFZhbHVlcy5jYW5jZWxCdXR0b25UZXh0LFxuXHRcdFx0XHR2aXNpYmxlOiBNYXNzRWRpdEhlbHBlci5oZWxwZXJzLmhhc0VkaXRhYmxlRmllbGRzQmluZGluZyhvRGF0YUZpZWxkTW9kZWwuZ2V0T2JqZWN0KFwiL1wiKSwgdHJ1ZSkgYXMgYW55LFxuXHRcdFx0XHRwcmVzczogZnVuY3Rpb24gKG9FdmVudDogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3Qgb0luRGlhbG9nID0gb0V2ZW50LmdldFNvdXJjZSgpLmdldFBhcmVudCgpO1xuXHRcdFx0XHRcdE1hc3NFZGl0SGVscGVyLmNsb3NlRGlhbG9nKG9JbkRpYWxvZyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fSk7XG5cdFx0b0RpYWxvZy5zZXRNb2RlbChvRGlhbG9nRGF0YU1vZGVsLCBcImZpZWxkc0luZm9cIik7XG5cdFx0b0RpYWxvZy5zZXRNb2RlbChtb2RlbCk7XG5cdFx0b0RpYWxvZy5zZXRCaW5kaW5nQ29udGV4dChkaWFsb2dDb250ZXh0KTtcblx0XHRyZXR1cm4gb0RpYWxvZztcblx0fSxcblxuXHRoZWxwZXJzOiB7XG5cdFx0Z2V0QmluZGluZ0V4cEZvckhhc0VkaXRhYmxlRmllbGRzOiAoZmllbGRzOiBhbnksIGVkaXRhYmxlOiBib29sZWFuKSA9PiB7XG5cdFx0XHRjb25zdCB0b3RhbEV4cCA9IGZpZWxkcy5yZWR1Y2UoXG5cdFx0XHRcdChleHByZXNzaW9uOiBhbnksIGZpZWxkOiBhbnkpID0+XG5cdFx0XHRcdFx0b3IoXG5cdFx0XHRcdFx0XHRleHByZXNzaW9uLFxuXHRcdFx0XHRcdFx0cGF0aEluTW9kZWwoXCIvdmFsdWVzL1wiICsgZmllbGQuZGF0YVByb3BlcnR5ICsgXCIvdmlzaWJsZVwiLCBcImZpZWxkc0luZm9cIikgYXMgQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uPGJvb2xlYW4+XG5cdFx0XHRcdFx0KSxcblx0XHRcdFx0Y29uc3RhbnQoZmFsc2UpXG5cdFx0XHQpO1xuXHRcdFx0cmV0dXJuIGVkaXRhYmxlID8gdG90YWxFeHAgOiBub3QodG90YWxFeHApO1xuXHRcdH0sXG5cblx0XHRnZXRFeHBCaW5kaW5nRm9yQXBwbHlCdXR0b25UeHQ6IChkZWZhdWx0VmFsdWVzOiBhbnksIGZpZWxkczogYm9vbGVhbikgPT4ge1xuXHRcdFx0Y29uc3QgZWRpdGFibGVFeHAgPSBNYXNzRWRpdEhlbHBlci5oZWxwZXJzLmdldEJpbmRpbmdFeHBGb3JIYXNFZGl0YWJsZUZpZWxkcyhmaWVsZHMsIHRydWUpO1xuXHRcdFx0Y29uc3QgdG90YWxFeHAgPSBpZkVsc2UoZWRpdGFibGVFeHAsIGNvbnN0YW50KGRlZmF1bHRWYWx1ZXMuYXBwbHlCdXR0b25UZXh0KSwgY29uc3RhbnQoZGVmYXVsdFZhbHVlcy5va0J1dHRvblRleHQpKTtcblx0XHRcdHJldHVybiBjb21waWxlRXhwcmVzc2lvbih0b3RhbEV4cCk7XG5cdFx0fSxcblxuXHRcdGhhc0VkaXRhYmxlRmllbGRzQmluZGluZzogKGZpZWxkczogYW55LCBlZGl0YWJsZTogYm9vbGVhbikgPT4ge1xuXHRcdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKE1hc3NFZGl0SGVscGVyLmhlbHBlcnMuZ2V0QmluZGluZ0V4cEZvckhhc0VkaXRhYmxlRmllbGRzKGZpZWxkcywgZWRpdGFibGUpKTtc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