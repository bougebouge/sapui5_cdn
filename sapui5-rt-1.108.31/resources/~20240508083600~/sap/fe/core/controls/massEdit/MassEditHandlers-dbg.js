/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/helpers/ModelHelper", "sap/fe/macros/internal/valuehelp/ValueListHelperNew", "sap/ui/core/Core"], function (Log, ModelHelper, ValueListHelper, Core) {
  "use strict";

  var MassEditHandlers = {
    /**
     * Called for property change in the transient context.
     *
     * @function
     * @param newValue New value of the property.
     * @param dataProperty Final context returned after the paginator action
     * @param mdcFieldId Final context returned after the paginator action
     */
    contextPropertyChange: function (newValue, dataProperty, mdcFieldId) {
      // Called for
      // 1. Out Parameters.
      // 2. Transient context property change.

      var source = Core.byId(mdcFieldId);
      var transCtx = source && source.getBindingContext();
      var fieldInfoModel = source && source.getModel("fieldsInfo");
      var values = fieldInfoModel.getProperty("/values/".concat(dataProperty)) || fieldInfoModel.getProperty("/unitData/".concat(dataProperty)) || [];
      if (transCtx && (values.inputType === "InputWithValueHelp" || values.inputType === "InputWithUnit") && !values.valueListInfo) {
        MassEditHandlers._setValueListInfo(transCtx, source, fieldInfoModel, dataProperty);
      }
      var isDialogOpen = fieldInfoModel && fieldInfoModel.getProperty("/isOpen");
      if (!isDialogOpen || !source.getVisible()) {
        return;
      }
      MassEditHandlers._updateSelectKey(source, dataProperty, newValue);
    },
    /**
     * Called for change in the MDC field.
     * This is called on selection done through VHD.
     * This is not called on change of the dropdown as we are using a custom MassEditSelect control and not general Select.
     *
     * @function
     * @param event Event object for change.
     * @param propertyName Property path.
     */
    handleMDCFieldChange: function (event, propertyName) {
      // Called for
      // 1. VHD property change.

      var source = event && event.getSource();
      var changePromise = event && event.getParameter("promise");
      var comboBox = source.getContent();
      if (!comboBox || !propertyName) {
        return;
      }
      changePromise.then(MassEditHandlers._updateSelectKeyForMDCFieldChange.bind(MassEditHandlers, source, propertyName)).catch(function (err) {
        Log.warning("VHD selection couldn't be populated in the mass edit field.".concat(err));
      });
    },
    /**
     * Called for selection change through the drop down.
     *
     * @function
     * @param event Event object for change.
     */
    handleSelectionChange: function (event) {
      // Called for Manual selection from dropdown(comboBox or select)
      // 1. VHD select.
      // 2. Any value change in the control.

      var source = event && event.getSource();
      var key = source.getSelectedKey();
      var params = source && key && key.split("/");
      var propertyName;
      if (params[0] === "UseValueHelpValue") {
        var prevItem = event.getParameter("previousSelectedItem");
        var selectKey = prevItem.getKey();
        propertyName = params.slice(1).join("/");
        MassEditHandlers._onVHSelect(source, propertyName, selectKey);
        return;
      }
      var fieldInfoModel = source && source.getModel("fieldsInfo");
      propertyName = MassEditHandlers._getPropertyNameFromKey(key);
      MassEditHandlers._updateSuggestionForFieldsWithInParameters(fieldInfoModel, propertyName, key.startsWith("Default/") || key.startsWith("ClearFieldValue/"), true);
      MassEditHandlers._updateSuggestionForFieldsWithOutParameters(fieldInfoModel, propertyName, key.startsWith("Default/") || key.startsWith("ClearFieldValue/"), false);
      MassEditHandlers._updateResults(source, params, true);
    },
    /**
     * Update selections to results and the suggests in drop downs.
     *
     * @function
     * @param source MDC field that was changed.
     * @param propertyName Property path.
     * @param value New value.
     */
    _updateSelectKeyForMDCFieldChange: function (source, propertyName, value) {
      var transCtx = source && source.getBindingContext();
      var fieldInfoModel = source && source.getModel("fieldsInfo");
      var values = fieldInfoModel.getProperty("/values/".concat(propertyName)) || fieldInfoModel.getProperty("/unitData/".concat(propertyName)) || [];
      if (transCtx && (values.inputType === "InputWithValueHelp" || values.inputType === "InputWithUnit") && !values.valueListInfo) {
        MassEditHandlers._setValueListInfo(transCtx, source, fieldInfoModel, propertyName);
      }
      MassEditHandlers._updateSuggestionForFieldsWithOutParameters(fieldInfoModel, propertyName, false, true);
      MassEditHandlers._updateSuggestionForFieldsWithInParameters(fieldInfoModel, propertyName, false, true);
      var formattedValue = source.getFormFormattedValue();
      MassEditHandlers._updateSelectKey(source, propertyName, value, formattedValue);
    },
    /**
     * Update suggests for all drop downs with InParameter as the propertyName.
     *
     * @function
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param propertyName Property path.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     */
    _updateSuggestionForFieldsWithInParameters: function (fieldInfoModel, propertyName, resetValues, keepExistingSelection) {
      var values = fieldInfoModel.getProperty("/values");
      var unitData = fieldInfoModel.getProperty("/unitData");
      var fieldPaths = Object.keys(values);
      var unitFieldPaths = Object.keys(unitData);
      fieldPaths.forEach(MassEditHandlers._updateInParameterSuggetions.bind(MassEditHandlers, fieldInfoModel, "/values/", propertyName, resetValues, keepExistingSelection));
      unitFieldPaths.forEach(MassEditHandlers._updateInParameterSuggetions.bind(MassEditHandlers, fieldInfoModel, "/unitData/", propertyName, resetValues, keepExistingSelection));
    },
    /**
     * Update suggests for a drop down with InParameter as the srcPropertyName.
     *
     * @function
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param pathPrefix Path in the runtime model.
     * @param srcPropertyName The InParameter Property path.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     * @param propertyName Property path that needs update of suggestions.
     */
    _updateInParameterSuggetions: function (fieldInfoModel, pathPrefix, srcPropertyName, resetValues, keepExistingSelection, propertyName) {
      var valueListInfo = fieldInfoModel.getProperty("".concat(pathPrefix + propertyName, "/valueListInfo"));
      if (valueListInfo && srcPropertyName != propertyName) {
        var inParameters = valueListInfo.inParameters;
        if (inParameters && inParameters.length > 0 && inParameters.includes(srcPropertyName)) {
          MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, pathPrefix + propertyName, resetValues, keepExistingSelection);
        }
      }
    },
    /**
     * Update suggests for all OutParameter's drop downs of the propertyName.
     *
     * @function
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param propertyName Property path.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     */
    _updateSuggestionForFieldsWithOutParameters: function (fieldInfoModel, propertyName, resetValues, keepExistingSelection) {
      var valueListInfo = fieldInfoModel.getProperty("/values/".concat(propertyName, "/valueListInfo")) || fieldInfoModel.getProperty("/unitData/".concat(propertyName, "/valueListInfo"));
      if (valueListInfo && valueListInfo.outParameters) {
        var outParameters = valueListInfo.outParameters;
        if (outParameters.length && outParameters.length > 0) {
          MassEditHandlers._updateOutParameterSuggetions(outParameters, fieldInfoModel, resetValues, keepExistingSelection);
          var pathPrefix = fieldInfoModel.getProperty("/values/".concat(propertyName)) && "/values/".concat(propertyName) || fieldInfoModel.getProperty("/unitData/".concat(propertyName)) && "/unitData/".concat(propertyName);
          if (pathPrefix) {
            MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, pathPrefix, false, true);
          }
        }
      }
    },
    /**
     * Update suggests for a drop down with InParameter as the srcPropertyName.
     *
     * @function
     * @param outParameters String arrary of OutParameter property paths.
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     */
    _updateOutParameterSuggetions: function (outParameters, fieldInfoModel, resetValues, keepExistingSelection) {
      var values = fieldInfoModel.getProperty("/values");
      var unitData = fieldInfoModel.getProperty("/unitData");
      var fieldPaths = Object.keys(values);
      var unitFieldPaths = Object.keys(unitData);
      outParameters.forEach(function (outParameter) {
        if (fieldPaths.includes(outParameter)) {
          MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, "/values/".concat(outParameter), resetValues, keepExistingSelection);
        } else if (unitFieldPaths.includes(outParameter)) {
          MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, "/unitData/".concat(outParameter), resetValues, keepExistingSelection);
        }
      });
    },
    /**
     * Update suggests for a drop down of a field.
     *
     * @function
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param fieldPathAbsolute Complete runtime property path.
     * @param resetValues Should the values be reset to original state.
     * @param keepExistingSelection Should the existing selection before update remain.
     */
    _updateFieldPathSuggestions: function (fieldInfoModel, fieldPathAbsolute, resetValues, keepExistingSelection) {
      var options = fieldInfoModel.getProperty(fieldPathAbsolute);
      var defaultOptions = options.defaultOptions;
      var selectedKey = fieldInfoModel.getProperty("".concat(fieldPathAbsolute, "/selectedKey"));
      var existingSelection = keepExistingSelection && options.find(function (option) {
        return option.key === selectedKey;
      });
      if (resetValues) {
        var selectOptions = options.selectOptions;
        options.length = 0;
        defaultOptions.forEach(function (defaultOption) {
          return options.push(defaultOption);
        });
        selectOptions.forEach(function (selectOption) {
          return options.push(selectOption);
        });
      } else {
        options.length = 0;
        defaultOptions.forEach(function (defaultOption) {
          return options.push(defaultOption);
        });
      }
      fieldInfoModel.setProperty(fieldPathAbsolute, options);
      if (existingSelection && !options.includes(existingSelection)) {
        options.push(existingSelection);
        fieldInfoModel.setProperty("".concat(fieldPathAbsolute, "/selectedKey"), selectedKey);
      }
    },
    /**
     * Update In and Out Parameters in the MED.
     *
     * @function
     * @param transCtx The transient context of the MED.
     * @param source MDC field.
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param propertyName Property path.
     */
    _setValueListInfo: function (transCtx, source, fieldInfoModel, propertyName) {
      var propPath = fieldInfoModel.getProperty("/values/".concat(propertyName)) && "/values/" || fieldInfoModel.getProperty("/unitData/".concat(propertyName)) && "/unitData/";
      if (fieldInfoModel.getProperty("".concat(propPath).concat(propertyName, "/valueListInfo"))) {
        return;
      }
      var valueListInfo = fieldInfoModel.getProperty("".concat(propPath).concat(propertyName, "/valueListInfo"));
      if (!valueListInfo) {
        MassEditHandlers._requestValueList(transCtx, source, fieldInfoModel, propertyName);
      }
    },
    /**
     * Request and update In and Out Parameters in the MED.
     *
     * @function
     * @param transCtx The transient context of the MED.
     * @param source MDC field.
     * @param fieldInfoModel Runtime model with parameters store information.
     * @param propertyName Property path.
     */
    _requestValueList: function (transCtx, source, fieldInfoModel, propertyName) {
      var _fieldValueHelp$getDe;
      var metaPath = ModelHelper.getMetaPathForContext(transCtx);
      var propertyPath = metaPath && "".concat(metaPath, "/").concat(propertyName);
      var dependents = source === null || source === void 0 ? void 0 : source.getDependents();
      var fieldHelp = source === null || source === void 0 ? void 0 : source.getFieldHelp();
      var fieldValueHelp = dependents === null || dependents === void 0 ? void 0 : dependents.find(function (dependent) {
        return dependent.getId() === fieldHelp;
      });
      var payload = (_fieldValueHelp$getDe = fieldValueHelp.getDelegate()) === null || _fieldValueHelp$getDe === void 0 ? void 0 : _fieldValueHelp$getDe.payload;
      if (!(fieldValueHelp !== null && fieldValueHelp !== void 0 && fieldValueHelp.getBindingContext())) {
        fieldValueHelp === null || fieldValueHelp === void 0 ? void 0 : fieldValueHelp.setBindingContext(transCtx);
      }
      var metaModel = transCtx.getModel().getMetaModel();
      ValueListHelper.createVHUIModel(fieldValueHelp, propertyPath, metaModel);
      var valueListInfo = ValueListHelper.getValueListInfo(fieldValueHelp, propertyPath, payload);
      valueListInfo.then(function (vLinfos) {
        var vLinfo = vLinfos[0];
        var propPath = fieldInfoModel.getProperty("/values/".concat(propertyName)) && "/values/" || fieldInfoModel.getProperty("/unitData/".concat(propertyName)) && "/unitData/";
        var info = {
          inParameters: vLinfo.vhParameters && ValueListHelper.getInParameters(vLinfo.vhParameters).map(function (inParam) {
            return inParam.helpPath;
          }),
          outParameters: vLinfo.vhParameters && ValueListHelper.getOutParameters(vLinfo.vhParameters).map(function (outParam) {
            return outParam.helpPath;
          })
        };
        fieldInfoModel.setProperty("".concat(propPath).concat(propertyName, "/valueListInfo"), info);
        if (info.outParameters.length > 0) {
          MassEditHandlers._updateFieldPathSuggestions(fieldInfoModel, "/values/".concat(propertyName), false, true);
        }
      }).catch(function () {
        Log.warning("Mass Edit: Couldn't load valueList info for ".concat(propertyPath));
      });
    },
    /**
     * Get field help control from MDC field.
     *
     * @function
     * @param transCtx The transient context of the MED.
     * @param source MDC field.
     * @returns Field Help control.
     */
    _getValueHelp: function (transCtx, source) {
      var dependents = source === null || source === void 0 ? void 0 : source.getDependents();
      var fieldHelp = source === null || source === void 0 ? void 0 : source.getFieldHelp();
      return dependents === null || dependents === void 0 ? void 0 : dependents.find(function (dependent) {
        return dependent.getId() === fieldHelp;
      });
    },
    /**
     * Colled on drop down selection of VHD option.
     *
     * @function
     * @param source Custom Mass Edit Select control.
     * @param propertyName Property path.
     * @param selectKey Previous key before the VHD was selected.
     */
    _onVHSelect: function (source, propertyName, selectKey) {
      // Called for
      // 1. VHD selected.

      var fieldInfoModel = source && source.getModel("fieldsInfo");
      var propPath = fieldInfoModel.getProperty("/values/".concat(propertyName)) && "/values/" || fieldInfoModel.getProperty("/unitData/".concat(propertyName)) && "/unitData/";
      var transCtx = source.getBindingContext();
      var fieldValueHelp = MassEditHandlers._getValueHelp(transCtx, source.getParent());
      if (!(fieldValueHelp !== null && fieldValueHelp !== void 0 && fieldValueHelp.getBindingContext())) {
        fieldValueHelp === null || fieldValueHelp === void 0 ? void 0 : fieldValueHelp.setBindingContext(transCtx);
      }
      source.fireValueHelpRequest();
      fieldInfoModel.setProperty("".concat(propPath + propertyName, "/selectedKey"), selectKey);
    },
    /**
     * Gets Property name from selection key.
     *
     * @function
     * @param key Selection key.
     * @returns Property name.
     */
    _getPropertyNameFromKey: function (key) {
      var propertyName = "";
      if (key.startsWith("Default/") || key.startsWith("ClearFieldValue/") || key.startsWith("UseValueHelpValue/")) {
        propertyName = key.substring(key.indexOf("/") + 1);
      } else {
        propertyName = key.substring(0, key.lastIndexOf("/"));
      }
      return propertyName;
    },
    /**
     * Update selection to Custom Mass Edit Select from MDC field.
     *
     * @function
     * @param source MDC field.
     * @param propertyName Property path.
     * @param value Value to update.
     * @param fullText Full text to use.
     */
    _updateSelectKey: function (source, propertyName, value, fullText) {
      // Called for
      // 1. VHD property change
      // 2. Out Parameters.
      // 3. Transient context property change.

      var comboBox = source.getContent();
      if (!comboBox || !propertyName) {
        return;
      }
      var key = comboBox.getSelectedKey();
      if ((key.startsWith("Default/") || key.startsWith("ClearFieldValue/")) && !value) {
        return;
      }
      var formattedText = MassEditHandlers._valueExists(fullText) ? fullText : value;
      var fieldInfoModel = source && source.getModel("fieldsInfo");
      var values = fieldInfoModel.getProperty("/values/".concat(propertyName)) || fieldInfoModel.getProperty("/unitData/".concat(propertyName)) || [];
      var propPath = fieldInfoModel.getProperty("/values/".concat(propertyName)) && "/values/" || fieldInfoModel.getProperty("/unitData/".concat(propertyName)) && "/unitData/";
      var relatedField = values.find(function (fieldData) {
        var _fieldData$textInfo;
        return (fieldData === null || fieldData === void 0 ? void 0 : (_fieldData$textInfo = fieldData.textInfo) === null || _fieldData$textInfo === void 0 ? void 0 : _fieldData$textInfo.value) === value || fieldData.text === value;
      });
      if (relatedField) {
        if (fullText && relatedField.textInfo && relatedField.textInfo.descriptionPath && (relatedField.text != formattedText || relatedField.textInfo.fullText != formattedText)) {
          // Update the full text only when provided.
          relatedField.text = formattedText;
          relatedField.textInfo.fullText = formattedText;
          relatedField.textInfo.description = source.getAdditionalValue();
        }
        if (relatedField.key === key) {
          fieldInfoModel.setProperty("".concat(propPath + propertyName, "/selectedKey"), key);
          return;
        }
        key = relatedField.key;
      } else if ([undefined, null, ""].indexOf(value) === -1) {
        key = "".concat(propertyName, "/").concat(value);
        var selectionInfo = {
          text: formattedText,
          key: key,
          textInfo: {
            description: source.getAdditionalValue(),
            descriptionPath: values && values.textInfo && values.textInfo.descriptionPath,
            fullText: formattedText,
            textArrangement: source.getDisplay(),
            value: source.getValue(),
            valuePath: propertyName
          }
        };
        values.push(selectionInfo);
        values.selectOptions = values.selectOptions || [];
        values.selectOptions.push(selectionInfo);
        fieldInfoModel.setProperty(propPath + propertyName, values);
      } else {
        key = "Default/".concat(propertyName);
      }
      fieldInfoModel.setProperty("".concat(propPath + propertyName, "/selectedKey"), key);
      MassEditHandlers._updateResults(comboBox);
    },
    /**
     * Get Value from Drop down.
     *
     * @function
     * @param source Drop down control.
     * @returns Value of selection.
     */
    _getValue: function (source) {
      var _getSelectedItem;
      return source.getMetadata().getName() === "sap.fe.core.controls.MassEditSelect" ? (_getSelectedItem = source.getSelectedItem()) === null || _getSelectedItem === void 0 ? void 0 : _getSelectedItem.getText() : source.getValue();
    },
    _getValueOnEmpty: function (oSource, fieldsInfoModel, value, sPropertyName) {
      if (!value) {
        var values = fieldsInfoModel.getProperty("/values/".concat(sPropertyName)) || fieldsInfoModel.getProperty("/unitData/".concat(sPropertyName)) || [];
        if (values.unitProperty) {
          value = 0;
          oSource.setValue(value);
        } else if (values.inputType === "CheckBox") {
          value = false;
        }
      }
      return value;
    },
    _valueExists: function (value) {
      return value != undefined && value != null;
    },
    /**
     * Updates selections to runtime model.
     *
     * @function
     * @param oSource Drop down control.
     * @param aParams Parts of key in runtime model.
     * @param updateTransCtx Should transient context be updated with the value.
     */
    _updateResults: function (oSource) {
      var aParams = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
      var updateTransCtx = arguments.length > 2 ? arguments[2] : undefined;
      // Called for
      // 1. VHD property change.
      // 2. Out parameter.
      // 3. transient context property change.
      var fieldsInfoModel = oSource && oSource.getModel("fieldsInfo");
      var oFieldsInfoData = fieldsInfoModel && fieldsInfoModel.getData();
      var value = MassEditHandlers._getValue(oSource);
      aParams = aParams.length > 0 ? aParams : oSource && oSource.getSelectedKey() && oSource.getSelectedKey().split("/");
      var oDataObject;
      var sPropertyName = oSource.data("fieldPath");
      if (aParams[0] === "Default") {
        oDataObject = {
          keyValue: aParams[1],
          value: aParams[0]
        };
      } else if (aParams[0] === "ClearFieldValue") {
        value = "";
        value = MassEditHandlers._getValueOnEmpty(oSource, fieldsInfoModel, value, sPropertyName);
        oDataObject = {
          keyValue: aParams[1],
          value: value
        };
      } else if (!aParams) {
        value = MassEditHandlers._getValueOnEmpty(oSource, fieldsInfoModel, value, sPropertyName);
        oDataObject = {
          keyValue: sPropertyName,
          value: value
        };
      } else {
        var propertyName = aParams.slice(0, -1).join("/");
        var propertyValues = fieldsInfoModel.getProperty("/values/".concat(propertyName)) || fieldsInfoModel.getProperty("/unitData/".concat(propertyName)) || [];
        var relatedField = (propertyValues || []).find(function (oFieldData) {
          var _oFieldData$textInfo;
          return (oFieldData === null || oFieldData === void 0 ? void 0 : (_oFieldData$textInfo = oFieldData.textInfo) === null || _oFieldData$textInfo === void 0 ? void 0 : _oFieldData$textInfo.value) === value || oFieldData.text === value;
        });
        oDataObject = {
          keyValue: propertyName,
          value: relatedField.textInfo && MassEditHandlers._valueExists(relatedField.textInfo.value) ? relatedField.textInfo.value : relatedField.text
        };
      }
      var bExistingElementindex = -1;
      for (var i = 0; i < oFieldsInfoData.results.length; i++) {
        if (oFieldsInfoData.results[i].keyValue === oDataObject.keyValue) {
          bExistingElementindex = i;
        }
      }
      if (bExistingElementindex !== -1) {
        oFieldsInfoData.results[bExistingElementindex] = oDataObject;
      } else {
        oFieldsInfoData.results.push(oDataObject);
      }
      if (updateTransCtx && !oDataObject.keyValue.includes("/")) {
        var transCtx = oSource.getBindingContext();
        if (aParams[0] === "Default" || aParams[0] === "ClearFieldValue") {
          transCtx.setProperty(oDataObject.keyValue, null);
        } else if (oDataObject) {
          transCtx.setProperty(oDataObject.keyValue, oDataObject.value);
        }
      }
    }
  };
  return MassEditHandlers;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNYXNzRWRpdEhhbmRsZXJzIiwiY29udGV4dFByb3BlcnR5Q2hhbmdlIiwibmV3VmFsdWUiLCJkYXRhUHJvcGVydHkiLCJtZGNGaWVsZElkIiwic291cmNlIiwiQ29yZSIsImJ5SWQiLCJ0cmFuc0N0eCIsImdldEJpbmRpbmdDb250ZXh0IiwiZmllbGRJbmZvTW9kZWwiLCJnZXRNb2RlbCIsInZhbHVlcyIsImdldFByb3BlcnR5IiwiaW5wdXRUeXBlIiwidmFsdWVMaXN0SW5mbyIsIl9zZXRWYWx1ZUxpc3RJbmZvIiwiaXNEaWFsb2dPcGVuIiwiZ2V0VmlzaWJsZSIsIl91cGRhdGVTZWxlY3RLZXkiLCJoYW5kbGVNRENGaWVsZENoYW5nZSIsImV2ZW50IiwicHJvcGVydHlOYW1lIiwiZ2V0U291cmNlIiwiY2hhbmdlUHJvbWlzZSIsImdldFBhcmFtZXRlciIsImNvbWJvQm94IiwiZ2V0Q29udGVudCIsInRoZW4iLCJfdXBkYXRlU2VsZWN0S2V5Rm9yTURDRmllbGRDaGFuZ2UiLCJiaW5kIiwiY2F0Y2giLCJlcnIiLCJMb2ciLCJ3YXJuaW5nIiwiaGFuZGxlU2VsZWN0aW9uQ2hhbmdlIiwia2V5IiwiZ2V0U2VsZWN0ZWRLZXkiLCJwYXJhbXMiLCJzcGxpdCIsInByZXZJdGVtIiwic2VsZWN0S2V5IiwiZ2V0S2V5Iiwic2xpY2UiLCJqb2luIiwiX29uVkhTZWxlY3QiLCJfZ2V0UHJvcGVydHlOYW1lRnJvbUtleSIsIl91cGRhdGVTdWdnZXN0aW9uRm9yRmllbGRzV2l0aEluUGFyYW1ldGVycyIsInN0YXJ0c1dpdGgiLCJfdXBkYXRlU3VnZ2VzdGlvbkZvckZpZWxkc1dpdGhPdXRQYXJhbWV0ZXJzIiwiX3VwZGF0ZVJlc3VsdHMiLCJ2YWx1ZSIsImZvcm1hdHRlZFZhbHVlIiwiZ2V0Rm9ybUZvcm1hdHRlZFZhbHVlIiwicmVzZXRWYWx1ZXMiLCJrZWVwRXhpc3RpbmdTZWxlY3Rpb24iLCJ1bml0RGF0YSIsImZpZWxkUGF0aHMiLCJPYmplY3QiLCJrZXlzIiwidW5pdEZpZWxkUGF0aHMiLCJmb3JFYWNoIiwiX3VwZGF0ZUluUGFyYW1ldGVyU3VnZ2V0aW9ucyIsInBhdGhQcmVmaXgiLCJzcmNQcm9wZXJ0eU5hbWUiLCJpblBhcmFtZXRlcnMiLCJsZW5ndGgiLCJpbmNsdWRlcyIsIl91cGRhdGVGaWVsZFBhdGhTdWdnZXN0aW9ucyIsIm91dFBhcmFtZXRlcnMiLCJfdXBkYXRlT3V0UGFyYW1ldGVyU3VnZ2V0aW9ucyIsIm91dFBhcmFtZXRlciIsImZpZWxkUGF0aEFic29sdXRlIiwib3B0aW9ucyIsImRlZmF1bHRPcHRpb25zIiwic2VsZWN0ZWRLZXkiLCJleGlzdGluZ1NlbGVjdGlvbiIsImZpbmQiLCJvcHRpb24iLCJzZWxlY3RPcHRpb25zIiwiZGVmYXVsdE9wdGlvbiIsInB1c2giLCJzZWxlY3RPcHRpb24iLCJzZXRQcm9wZXJ0eSIsInByb3BQYXRoIiwiX3JlcXVlc3RWYWx1ZUxpc3QiLCJtZXRhUGF0aCIsIk1vZGVsSGVscGVyIiwiZ2V0TWV0YVBhdGhGb3JDb250ZXh0IiwicHJvcGVydHlQYXRoIiwiZGVwZW5kZW50cyIsImdldERlcGVuZGVudHMiLCJmaWVsZEhlbHAiLCJnZXRGaWVsZEhlbHAiLCJmaWVsZFZhbHVlSGVscCIsImRlcGVuZGVudCIsImdldElkIiwicGF5bG9hZCIsImdldERlbGVnYXRlIiwic2V0QmluZGluZ0NvbnRleHQiLCJtZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJWYWx1ZUxpc3RIZWxwZXIiLCJjcmVhdGVWSFVJTW9kZWwiLCJnZXRWYWx1ZUxpc3RJbmZvIiwidkxpbmZvcyIsInZMaW5mbyIsImluZm8iLCJ2aFBhcmFtZXRlcnMiLCJnZXRJblBhcmFtZXRlcnMiLCJtYXAiLCJpblBhcmFtIiwiaGVscFBhdGgiLCJnZXRPdXRQYXJhbWV0ZXJzIiwib3V0UGFyYW0iLCJfZ2V0VmFsdWVIZWxwIiwiZ2V0UGFyZW50IiwiZmlyZVZhbHVlSGVscFJlcXVlc3QiLCJzdWJzdHJpbmciLCJpbmRleE9mIiwibGFzdEluZGV4T2YiLCJmdWxsVGV4dCIsImZvcm1hdHRlZFRleHQiLCJfdmFsdWVFeGlzdHMiLCJyZWxhdGVkRmllbGQiLCJmaWVsZERhdGEiLCJ0ZXh0SW5mbyIsInRleHQiLCJkZXNjcmlwdGlvblBhdGgiLCJkZXNjcmlwdGlvbiIsImdldEFkZGl0aW9uYWxWYWx1ZSIsInVuZGVmaW5lZCIsInNlbGVjdGlvbkluZm8iLCJ0ZXh0QXJyYW5nZW1lbnQiLCJnZXREaXNwbGF5IiwiZ2V0VmFsdWUiLCJ2YWx1ZVBhdGgiLCJfZ2V0VmFsdWUiLCJnZXRNZXRhZGF0YSIsImdldE5hbWUiLCJnZXRTZWxlY3RlZEl0ZW0iLCJnZXRUZXh0IiwiX2dldFZhbHVlT25FbXB0eSIsIm9Tb3VyY2UiLCJmaWVsZHNJbmZvTW9kZWwiLCJzUHJvcGVydHlOYW1lIiwidW5pdFByb3BlcnR5Iiwic2V0VmFsdWUiLCJhUGFyYW1zIiwidXBkYXRlVHJhbnNDdHgiLCJvRmllbGRzSW5mb0RhdGEiLCJnZXREYXRhIiwib0RhdGFPYmplY3QiLCJkYXRhIiwia2V5VmFsdWUiLCJwcm9wZXJ0eVZhbHVlcyIsIm9GaWVsZERhdGEiLCJiRXhpc3RpbmdFbGVtZW50aW5kZXgiLCJpIiwicmVzdWx0cyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiTWFzc0VkaXRIYW5kbGVycy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIENvbnN0cnVjdG9yIGZvciBhIG5ldyBWaXN1YWwgRmlsdGVyIENvbnRhaW5lci5cbiAqIFVzZWQgZm9yIHZpc3VhbCBmaWx0ZXJzXG4gKlxuICogQHBhcmFtIHtzdHJpbmd9IFtzSWRdIElEIGZvciB0aGUgbmV3IGNvbnRyb2wsIGdlbmVyYXRlZCBhdXRvbWF0aWNhbGx5IGlmIG5vIElEIGlzIGdpdmVuXG4gKiBAZXh0ZW5kcyBzYXAudWkubWRjLmZpbHRlcmJhci5JRmlsdGVyQ29udGFpbmVyXG4gKiBAY2xhc3NcbiAqIEBwcml2YXRlXG4gKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbHMuZmlsdGVyYmFyLlZpc3VhbEZpbHRlckNvbnRhaW5lclxuICovXG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IFZhbHVlTGlzdEhlbHBlciwgeyBWYWx1ZUhlbHBQYXlsb2FkLCBWYWx1ZUxpc3RJbmZvIH0gZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvdmFsdWVoZWxwL1ZhbHVlTGlzdEhlbHBlck5ld1wiO1xuaW1wb3J0IHR5cGUgQ29tYm9Cb3ggZnJvbSBcInNhcC9tL0NvbWJvQm94XCI7XG5pbXBvcnQgdHlwZSBTZWxlY3QgZnJvbSBcInNhcC9tL1NlbGVjdFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IENvcmUgZnJvbSBcInNhcC91aS9jb3JlL0NvcmVcIjtcbmltcG9ydCB0eXBlIEZpZWxkIGZyb20gXCJzYXAvdWkvbWRjL0ZpZWxkXCI7XG5pbXBvcnQgVmFsdWVIZWxwIGZyb20gXCJzYXAvdWkvbWRjL1ZhbHVlSGVscFwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuXG5jb25zdCBNYXNzRWRpdEhhbmRsZXJzOiBhbnkgPSB7XG5cdC8qKlxuXHQgKiBDYWxsZWQgZm9yIHByb3BlcnR5IGNoYW5nZSBpbiB0aGUgdHJhbnNpZW50IGNvbnRleHQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gbmV3VmFsdWUgTmV3IHZhbHVlIG9mIHRoZSBwcm9wZXJ0eS5cblx0ICogQHBhcmFtIGRhdGFQcm9wZXJ0eSBGaW5hbCBjb250ZXh0IHJldHVybmVkIGFmdGVyIHRoZSBwYWdpbmF0b3IgYWN0aW9uXG5cdCAqIEBwYXJhbSBtZGNGaWVsZElkIEZpbmFsIGNvbnRleHQgcmV0dXJuZWQgYWZ0ZXIgdGhlIHBhZ2luYXRvciBhY3Rpb25cblx0ICovXG5cdGNvbnRleHRQcm9wZXJ0eUNoYW5nZTogZnVuY3Rpb24gKG5ld1ZhbHVlOiBhbnksIGRhdGFQcm9wZXJ0eTogc3RyaW5nLCBtZGNGaWVsZElkOiBzdHJpbmcpIHtcblx0XHQvLyBDYWxsZWQgZm9yXG5cdFx0Ly8gMS4gT3V0IFBhcmFtZXRlcnMuXG5cdFx0Ly8gMi4gVHJhbnNpZW50IGNvbnRleHQgcHJvcGVydHkgY2hhbmdlLlxuXG5cdFx0Y29uc3Qgc291cmNlID0gQ29yZS5ieUlkKG1kY0ZpZWxkSWQpIGFzIEZpZWxkO1xuXHRcdGNvbnN0IHRyYW5zQ3R4ID0gc291cmNlICYmIChzb3VyY2UuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBDb250ZXh0KTtcblx0XHRjb25zdCBmaWVsZEluZm9Nb2RlbCA9IHNvdXJjZSAmJiAoc291cmNlLmdldE1vZGVsKFwiZmllbGRzSW5mb1wiKSBhcyBKU09OTW9kZWwpO1xuXHRcdGNvbnN0IHZhbHVlcyA9XG5cdFx0XHRmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3ZhbHVlcy8ke2RhdGFQcm9wZXJ0eX1gKSB8fCBmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3VuaXREYXRhLyR7ZGF0YVByb3BlcnR5fWApIHx8IFtdO1xuXG5cdFx0aWYgKHRyYW5zQ3R4ICYmICh2YWx1ZXMuaW5wdXRUeXBlID09PSBcIklucHV0V2l0aFZhbHVlSGVscFwiIHx8IHZhbHVlcy5pbnB1dFR5cGUgPT09IFwiSW5wdXRXaXRoVW5pdFwiKSAmJiAhdmFsdWVzLnZhbHVlTGlzdEluZm8pIHtcblx0XHRcdE1hc3NFZGl0SGFuZGxlcnMuX3NldFZhbHVlTGlzdEluZm8odHJhbnNDdHgsIHNvdXJjZSwgZmllbGRJbmZvTW9kZWwsIGRhdGFQcm9wZXJ0eSk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgaXNEaWFsb2dPcGVuID0gZmllbGRJbmZvTW9kZWwgJiYgZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoXCIvaXNPcGVuXCIpO1xuXHRcdGlmICghaXNEaWFsb2dPcGVuIHx8ICFzb3VyY2UuZ2V0VmlzaWJsZSgpKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0TWFzc0VkaXRIYW5kbGVycy5fdXBkYXRlU2VsZWN0S2V5KHNvdXJjZSwgZGF0YVByb3BlcnR5LCBuZXdWYWx1ZSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxlZCBmb3IgY2hhbmdlIGluIHRoZSBNREMgZmllbGQuXG5cdCAqIFRoaXMgaXMgY2FsbGVkIG9uIHNlbGVjdGlvbiBkb25lIHRocm91Z2ggVkhELlxuXHQgKiBUaGlzIGlzIG5vdCBjYWxsZWQgb24gY2hhbmdlIG9mIHRoZSBkcm9wZG93biBhcyB3ZSBhcmUgdXNpbmcgYSBjdXN0b20gTWFzc0VkaXRTZWxlY3QgY29udHJvbCBhbmQgbm90IGdlbmVyYWwgU2VsZWN0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIGV2ZW50IEV2ZW50IG9iamVjdCBmb3IgY2hhbmdlLlxuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIFByb3BlcnR5IHBhdGguXG5cdCAqL1xuXHRoYW5kbGVNRENGaWVsZENoYW5nZTogZnVuY3Rpb24gKGV2ZW50OiBhbnksIHByb3BlcnR5TmFtZTogc3RyaW5nKSB7XG5cdFx0Ly8gQ2FsbGVkIGZvclxuXHRcdC8vIDEuIFZIRCBwcm9wZXJ0eSBjaGFuZ2UuXG5cblx0XHRjb25zdCBzb3VyY2UgPSBldmVudCAmJiBldmVudC5nZXRTb3VyY2UoKTtcblx0XHRjb25zdCBjaGFuZ2VQcm9taXNlID0gZXZlbnQgJiYgZXZlbnQuZ2V0UGFyYW1ldGVyKFwicHJvbWlzZVwiKTtcblx0XHRjb25zdCBjb21ib0JveCA9IHNvdXJjZS5nZXRDb250ZW50KCk7XG5cdFx0aWYgKCFjb21ib0JveCB8fCAhcHJvcGVydHlOYW1lKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Y2hhbmdlUHJvbWlzZVxuXHRcdFx0LnRoZW4oTWFzc0VkaXRIYW5kbGVycy5fdXBkYXRlU2VsZWN0S2V5Rm9yTURDRmllbGRDaGFuZ2UuYmluZChNYXNzRWRpdEhhbmRsZXJzLCBzb3VyY2UsIHByb3BlcnR5TmFtZSkpXG5cdFx0XHQuY2F0Y2goKGVycjogYW55KSA9PiB7XG5cdFx0XHRcdExvZy53YXJuaW5nKGBWSEQgc2VsZWN0aW9uIGNvdWxkbid0IGJlIHBvcHVsYXRlZCBpbiB0aGUgbWFzcyBlZGl0IGZpZWxkLiR7ZXJyfWApO1xuXHRcdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENhbGxlZCBmb3Igc2VsZWN0aW9uIGNoYW5nZSB0aHJvdWdoIHRoZSBkcm9wIGRvd24uXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gZXZlbnQgRXZlbnQgb2JqZWN0IGZvciBjaGFuZ2UuXG5cdCAqL1xuXHRoYW5kbGVTZWxlY3Rpb25DaGFuZ2U6IGZ1bmN0aW9uIChldmVudDogYW55KSB7XG5cdFx0Ly8gQ2FsbGVkIGZvciBNYW51YWwgc2VsZWN0aW9uIGZyb20gZHJvcGRvd24oY29tYm9Cb3ggb3Igc2VsZWN0KVxuXHRcdC8vIDEuIFZIRCBzZWxlY3QuXG5cdFx0Ly8gMi4gQW55IHZhbHVlIGNoYW5nZSBpbiB0aGUgY29udHJvbC5cblxuXHRcdGNvbnN0IHNvdXJjZSA9IGV2ZW50ICYmIGV2ZW50LmdldFNvdXJjZSgpO1xuXHRcdGNvbnN0IGtleSA9IHNvdXJjZS5nZXRTZWxlY3RlZEtleSgpIGFzIHN0cmluZztcblx0XHRjb25zdCBwYXJhbXMgPSBzb3VyY2UgJiYga2V5ICYmIGtleS5zcGxpdChcIi9cIik7XG5cdFx0bGV0IHByb3BlcnR5TmFtZTtcblxuXHRcdGlmIChwYXJhbXNbMF0gPT09IFwiVXNlVmFsdWVIZWxwVmFsdWVcIikge1xuXHRcdFx0Y29uc3QgcHJldkl0ZW0gPSBldmVudC5nZXRQYXJhbWV0ZXIoXCJwcmV2aW91c1NlbGVjdGVkSXRlbVwiKTtcblx0XHRcdGNvbnN0IHNlbGVjdEtleSA9IHByZXZJdGVtLmdldEtleSgpO1xuXHRcdFx0cHJvcGVydHlOYW1lID0gcGFyYW1zLnNsaWNlKDEpLmpvaW4oXCIvXCIpO1xuXHRcdFx0TWFzc0VkaXRIYW5kbGVycy5fb25WSFNlbGVjdChzb3VyY2UsIHByb3BlcnR5TmFtZSwgc2VsZWN0S2V5KTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBmaWVsZEluZm9Nb2RlbCA9IHNvdXJjZSAmJiAoc291cmNlLmdldE1vZGVsKFwiZmllbGRzSW5mb1wiKSBhcyBKU09OTW9kZWwpO1xuXHRcdHByb3BlcnR5TmFtZSA9IE1hc3NFZGl0SGFuZGxlcnMuX2dldFByb3BlcnR5TmFtZUZyb21LZXkoa2V5KTtcblx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVTdWdnZXN0aW9uRm9yRmllbGRzV2l0aEluUGFyYW1ldGVycyhcblx0XHRcdGZpZWxkSW5mb01vZGVsLFxuXHRcdFx0cHJvcGVydHlOYW1lLFxuXHRcdFx0a2V5LnN0YXJ0c1dpdGgoXCJEZWZhdWx0L1wiKSB8fCBrZXkuc3RhcnRzV2l0aChcIkNsZWFyRmllbGRWYWx1ZS9cIiksXG5cdFx0XHR0cnVlXG5cdFx0KTtcblx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVTdWdnZXN0aW9uRm9yRmllbGRzV2l0aE91dFBhcmFtZXRlcnMoXG5cdFx0XHRmaWVsZEluZm9Nb2RlbCxcblx0XHRcdHByb3BlcnR5TmFtZSxcblx0XHRcdGtleS5zdGFydHNXaXRoKFwiRGVmYXVsdC9cIikgfHwga2V5LnN0YXJ0c1dpdGgoXCJDbGVhckZpZWxkVmFsdWUvXCIpLFxuXHRcdFx0ZmFsc2Vcblx0XHQpO1xuXHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZVJlc3VsdHMoc291cmNlLCBwYXJhbXMsIHRydWUpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc2VsZWN0aW9ucyB0byByZXN1bHRzIGFuZCB0aGUgc3VnZ2VzdHMgaW4gZHJvcCBkb3ducy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBzb3VyY2UgTURDIGZpZWxkIHRoYXQgd2FzIGNoYW5nZWQuXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgUHJvcGVydHkgcGF0aC5cblx0ICogQHBhcmFtIHZhbHVlIE5ldyB2YWx1ZS5cblx0ICovXG5cdF91cGRhdGVTZWxlY3RLZXlGb3JNRENGaWVsZENoYW5nZTogZnVuY3Rpb24gKHNvdXJjZTogYW55LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgdmFsdWU6IGFueSk6IHZvaWQge1xuXHRcdGNvbnN0IHRyYW5zQ3R4ID0gc291cmNlICYmIHNvdXJjZS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGNvbnN0IGZpZWxkSW5mb01vZGVsID0gc291cmNlICYmIChzb3VyY2UuZ2V0TW9kZWwoXCJmaWVsZHNJbmZvXCIpIGFzIEpTT05Nb2RlbCk7XG5cdFx0Y29uc3QgdmFsdWVzID1cblx0XHRcdGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApIHx8IGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdW5pdERhdGEvJHtwcm9wZXJ0eU5hbWV9YCkgfHwgW107XG5cblx0XHRpZiAodHJhbnNDdHggJiYgKHZhbHVlcy5pbnB1dFR5cGUgPT09IFwiSW5wdXRXaXRoVmFsdWVIZWxwXCIgfHwgdmFsdWVzLmlucHV0VHlwZSA9PT0gXCJJbnB1dFdpdGhVbml0XCIpICYmICF2YWx1ZXMudmFsdWVMaXN0SW5mbykge1xuXHRcdFx0TWFzc0VkaXRIYW5kbGVycy5fc2V0VmFsdWVMaXN0SW5mbyh0cmFuc0N0eCwgc291cmNlLCBmaWVsZEluZm9Nb2RlbCwgcHJvcGVydHlOYW1lKTtcblx0XHR9XG5cblx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVTdWdnZXN0aW9uRm9yRmllbGRzV2l0aE91dFBhcmFtZXRlcnMoZmllbGRJbmZvTW9kZWwsIHByb3BlcnR5TmFtZSwgZmFsc2UsIHRydWUpO1xuXHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZVN1Z2dlc3Rpb25Gb3JGaWVsZHNXaXRoSW5QYXJhbWV0ZXJzKGZpZWxkSW5mb01vZGVsLCBwcm9wZXJ0eU5hbWUsIGZhbHNlLCB0cnVlKTtcblxuXHRcdGNvbnN0IGZvcm1hdHRlZFZhbHVlID0gc291cmNlLmdldEZvcm1Gb3JtYXR0ZWRWYWx1ZSgpO1xuXHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZVNlbGVjdEtleShzb3VyY2UsIHByb3BlcnR5TmFtZSwgdmFsdWUsIGZvcm1hdHRlZFZhbHVlKTtcblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIHN1Z2dlc3RzIGZvciBhbGwgZHJvcCBkb3ducyB3aXRoIEluUGFyYW1ldGVyIGFzIHRoZSBwcm9wZXJ0eU5hbWUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gZmllbGRJbmZvTW9kZWwgUnVudGltZSBtb2RlbCB3aXRoIHBhcmFtZXRlcnMgc3RvcmUgaW5mb3JtYXRpb24uXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgUHJvcGVydHkgcGF0aC5cblx0ICogQHBhcmFtIHJlc2V0VmFsdWVzIFNob3VsZCB0aGUgdmFsdWVzIGJlIHJlc2V0IHRvIG9yaWdpbmFsIHN0YXRlLlxuXHQgKiBAcGFyYW0ga2VlcEV4aXN0aW5nU2VsZWN0aW9uIFNob3VsZCB0aGUgZXhpc3Rpbmcgc2VsZWN0aW9uIGJlZm9yZSB1cGRhdGUgcmVtYWluLlxuXHQgKi9cblx0X3VwZGF0ZVN1Z2dlc3Rpb25Gb3JGaWVsZHNXaXRoSW5QYXJhbWV0ZXJzOiBmdW5jdGlvbiAoXG5cdFx0ZmllbGRJbmZvTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRwcm9wZXJ0eU5hbWU6IHN0cmluZyxcblx0XHRyZXNldFZhbHVlczogYm9vbGVhbixcblx0XHRrZWVwRXhpc3RpbmdTZWxlY3Rpb246IGJvb2xlYW5cblx0KTogdm9pZCB7XG5cdFx0Y29uc3QgdmFsdWVzID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoXCIvdmFsdWVzXCIpO1xuXHRcdGNvbnN0IHVuaXREYXRhID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoXCIvdW5pdERhdGFcIik7XG5cdFx0Y29uc3QgZmllbGRQYXRocyA9IE9iamVjdC5rZXlzKHZhbHVlcyk7XG5cdFx0Y29uc3QgdW5pdEZpZWxkUGF0aHMgPSBPYmplY3Qua2V5cyh1bml0RGF0YSk7XG5cblx0XHRmaWVsZFBhdGhzLmZvckVhY2goXG5cdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVJblBhcmFtZXRlclN1Z2dldGlvbnMuYmluZChcblx0XHRcdFx0TWFzc0VkaXRIYW5kbGVycyxcblx0XHRcdFx0ZmllbGRJbmZvTW9kZWwsXG5cdFx0XHRcdFwiL3ZhbHVlcy9cIixcblx0XHRcdFx0cHJvcGVydHlOYW1lLFxuXHRcdFx0XHRyZXNldFZhbHVlcyxcblx0XHRcdFx0a2VlcEV4aXN0aW5nU2VsZWN0aW9uXG5cdFx0XHQpXG5cdFx0KTtcblx0XHR1bml0RmllbGRQYXRocy5mb3JFYWNoKFxuXHRcdFx0TWFzc0VkaXRIYW5kbGVycy5fdXBkYXRlSW5QYXJhbWV0ZXJTdWdnZXRpb25zLmJpbmQoXG5cdFx0XHRcdE1hc3NFZGl0SGFuZGxlcnMsXG5cdFx0XHRcdGZpZWxkSW5mb01vZGVsLFxuXHRcdFx0XHRcIi91bml0RGF0YS9cIixcblx0XHRcdFx0cHJvcGVydHlOYW1lLFxuXHRcdFx0XHRyZXNldFZhbHVlcyxcblx0XHRcdFx0a2VlcEV4aXN0aW5nU2VsZWN0aW9uXG5cdFx0XHQpXG5cdFx0KTtcblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIHN1Z2dlc3RzIGZvciBhIGRyb3AgZG93biB3aXRoIEluUGFyYW1ldGVyIGFzIHRoZSBzcmNQcm9wZXJ0eU5hbWUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gZmllbGRJbmZvTW9kZWwgUnVudGltZSBtb2RlbCB3aXRoIHBhcmFtZXRlcnMgc3RvcmUgaW5mb3JtYXRpb24uXG5cdCAqIEBwYXJhbSBwYXRoUHJlZml4IFBhdGggaW4gdGhlIHJ1bnRpbWUgbW9kZWwuXG5cdCAqIEBwYXJhbSBzcmNQcm9wZXJ0eU5hbWUgVGhlIEluUGFyYW1ldGVyIFByb3BlcnR5IHBhdGguXG5cdCAqIEBwYXJhbSByZXNldFZhbHVlcyBTaG91bGQgdGhlIHZhbHVlcyBiZSByZXNldCB0byBvcmlnaW5hbCBzdGF0ZS5cblx0ICogQHBhcmFtIGtlZXBFeGlzdGluZ1NlbGVjdGlvbiBTaG91bGQgdGhlIGV4aXN0aW5nIHNlbGVjdGlvbiBiZWZvcmUgdXBkYXRlIHJlbWFpbi5cblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBQcm9wZXJ0eSBwYXRoIHRoYXQgbmVlZHMgdXBkYXRlIG9mIHN1Z2dlc3Rpb25zLlxuXHQgKi9cblx0X3VwZGF0ZUluUGFyYW1ldGVyU3VnZ2V0aW9uczogZnVuY3Rpb24gKFxuXHRcdGZpZWxkSW5mb01vZGVsOiBKU09OTW9kZWwsXG5cdFx0cGF0aFByZWZpeDogc3RyaW5nLFxuXHRcdHNyY1Byb3BlcnR5TmFtZTogc3RyaW5nLFxuXHRcdHJlc2V0VmFsdWVzOiBib29sZWFuLFxuXHRcdGtlZXBFeGlzdGluZ1NlbGVjdGlvbjogYm9vbGVhbixcblx0XHRwcm9wZXJ0eU5hbWU6IHN0cmluZ1xuXHQpIHtcblx0XHRjb25zdCB2YWx1ZUxpc3RJbmZvID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYCR7cGF0aFByZWZpeCArIHByb3BlcnR5TmFtZX0vdmFsdWVMaXN0SW5mb2ApO1xuXHRcdGlmICh2YWx1ZUxpc3RJbmZvICYmIHNyY1Byb3BlcnR5TmFtZSAhPSBwcm9wZXJ0eU5hbWUpIHtcblx0XHRcdGNvbnN0IGluUGFyYW1ldGVycyA9IHZhbHVlTGlzdEluZm8uaW5QYXJhbWV0ZXJzO1xuXHRcdFx0aWYgKGluUGFyYW1ldGVycyAmJiBpblBhcmFtZXRlcnMubGVuZ3RoID4gMCAmJiBpblBhcmFtZXRlcnMuaW5jbHVkZXMoc3JjUHJvcGVydHlOYW1lKSkge1xuXHRcdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVGaWVsZFBhdGhTdWdnZXN0aW9ucyhmaWVsZEluZm9Nb2RlbCwgcGF0aFByZWZpeCArIHByb3BlcnR5TmFtZSwgcmVzZXRWYWx1ZXMsIGtlZXBFeGlzdGluZ1NlbGVjdGlvbik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc3VnZ2VzdHMgZm9yIGFsbCBPdXRQYXJhbWV0ZXIncyBkcm9wIGRvd25zIG9mIHRoZSBwcm9wZXJ0eU5hbWUuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gZmllbGRJbmZvTW9kZWwgUnVudGltZSBtb2RlbCB3aXRoIHBhcmFtZXRlcnMgc3RvcmUgaW5mb3JtYXRpb24uXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eU5hbWUgUHJvcGVydHkgcGF0aC5cblx0ICogQHBhcmFtIHJlc2V0VmFsdWVzIFNob3VsZCB0aGUgdmFsdWVzIGJlIHJlc2V0IHRvIG9yaWdpbmFsIHN0YXRlLlxuXHQgKiBAcGFyYW0ga2VlcEV4aXN0aW5nU2VsZWN0aW9uIFNob3VsZCB0aGUgZXhpc3Rpbmcgc2VsZWN0aW9uIGJlZm9yZSB1cGRhdGUgcmVtYWluLlxuXHQgKi9cblx0X3VwZGF0ZVN1Z2dlc3Rpb25Gb3JGaWVsZHNXaXRoT3V0UGFyYW1ldGVyczogZnVuY3Rpb24gKFxuXHRcdGZpZWxkSW5mb01vZGVsOiBKU09OTW9kZWwsXG5cdFx0cHJvcGVydHlOYW1lOiBzdHJpbmcsXG5cdFx0cmVzZXRWYWx1ZXM6IGJvb2xlYW4sXG5cdFx0a2VlcEV4aXN0aW5nU2VsZWN0aW9uOiBib29sZWFuXG5cdCk6IHZvaWQge1xuXHRcdGNvbnN0IHZhbHVlTGlzdEluZm8gPVxuXHRcdFx0ZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtwcm9wZXJ0eU5hbWV9L3ZhbHVlTGlzdEluZm9gKSB8fFxuXHRcdFx0ZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC91bml0RGF0YS8ke3Byb3BlcnR5TmFtZX0vdmFsdWVMaXN0SW5mb2ApO1xuXG5cdFx0aWYgKHZhbHVlTGlzdEluZm8gJiYgdmFsdWVMaXN0SW5mby5vdXRQYXJhbWV0ZXJzKSB7XG5cdFx0XHRjb25zdCBvdXRQYXJhbWV0ZXJzID0gdmFsdWVMaXN0SW5mby5vdXRQYXJhbWV0ZXJzO1xuXHRcdFx0aWYgKG91dFBhcmFtZXRlcnMubGVuZ3RoICYmIG91dFBhcmFtZXRlcnMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVPdXRQYXJhbWV0ZXJTdWdnZXRpb25zKG91dFBhcmFtZXRlcnMsIGZpZWxkSW5mb01vZGVsLCByZXNldFZhbHVlcywga2VlcEV4aXN0aW5nU2VsZWN0aW9uKTtcblx0XHRcdFx0Y29uc3QgcGF0aFByZWZpeCA9XG5cdFx0XHRcdFx0KGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApICYmIGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApIHx8XG5cdFx0XHRcdFx0KGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdW5pdERhdGEvJHtwcm9wZXJ0eU5hbWV9YCkgJiYgYC91bml0RGF0YS8ke3Byb3BlcnR5TmFtZX1gKTtcblx0XHRcdFx0aWYgKHBhdGhQcmVmaXgpIHtcblx0XHRcdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVGaWVsZFBhdGhTdWdnZXN0aW9ucyhmaWVsZEluZm9Nb2RlbCwgcGF0aFByZWZpeCwgZmFsc2UsIHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgc3VnZ2VzdHMgZm9yIGEgZHJvcCBkb3duIHdpdGggSW5QYXJhbWV0ZXIgYXMgdGhlIHNyY1Byb3BlcnR5TmFtZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBvdXRQYXJhbWV0ZXJzIFN0cmluZyBhcnJhcnkgb2YgT3V0UGFyYW1ldGVyIHByb3BlcnR5IHBhdGhzLlxuXHQgKiBAcGFyYW0gZmllbGRJbmZvTW9kZWwgUnVudGltZSBtb2RlbCB3aXRoIHBhcmFtZXRlcnMgc3RvcmUgaW5mb3JtYXRpb24uXG5cdCAqIEBwYXJhbSByZXNldFZhbHVlcyBTaG91bGQgdGhlIHZhbHVlcyBiZSByZXNldCB0byBvcmlnaW5hbCBzdGF0ZS5cblx0ICogQHBhcmFtIGtlZXBFeGlzdGluZ1NlbGVjdGlvbiBTaG91bGQgdGhlIGV4aXN0aW5nIHNlbGVjdGlvbiBiZWZvcmUgdXBkYXRlIHJlbWFpbi5cblx0ICovXG5cdF91cGRhdGVPdXRQYXJhbWV0ZXJTdWdnZXRpb25zOiBmdW5jdGlvbiAoXG5cdFx0b3V0UGFyYW1ldGVyczogc3RyaW5nW10sXG5cdFx0ZmllbGRJbmZvTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRyZXNldFZhbHVlczogYm9vbGVhbixcblx0XHRrZWVwRXhpc3RpbmdTZWxlY3Rpb246IGJvb2xlYW5cblx0KSB7XG5cdFx0Y29uc3QgdmFsdWVzID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoXCIvdmFsdWVzXCIpO1xuXHRcdGNvbnN0IHVuaXREYXRhID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoXCIvdW5pdERhdGFcIik7XG5cdFx0Y29uc3QgZmllbGRQYXRocyA9IE9iamVjdC5rZXlzKHZhbHVlcyk7XG5cdFx0Y29uc3QgdW5pdEZpZWxkUGF0aHMgPSBPYmplY3Qua2V5cyh1bml0RGF0YSk7XG5cblx0XHRvdXRQYXJhbWV0ZXJzLmZvckVhY2goKG91dFBhcmFtZXRlcjogc3RyaW5nKSA9PiB7XG5cdFx0XHRpZiAoZmllbGRQYXRocy5pbmNsdWRlcyhvdXRQYXJhbWV0ZXIpKSB7XG5cdFx0XHRcdE1hc3NFZGl0SGFuZGxlcnMuX3VwZGF0ZUZpZWxkUGF0aFN1Z2dlc3Rpb25zKGZpZWxkSW5mb01vZGVsLCBgL3ZhbHVlcy8ke291dFBhcmFtZXRlcn1gLCByZXNldFZhbHVlcywga2VlcEV4aXN0aW5nU2VsZWN0aW9uKTtcblx0XHRcdH0gZWxzZSBpZiAodW5pdEZpZWxkUGF0aHMuaW5jbHVkZXMob3V0UGFyYW1ldGVyKSkge1xuXHRcdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVGaWVsZFBhdGhTdWdnZXN0aW9ucyhcblx0XHRcdFx0XHRmaWVsZEluZm9Nb2RlbCxcblx0XHRcdFx0XHRgL3VuaXREYXRhLyR7b3V0UGFyYW1ldGVyfWAsXG5cdFx0XHRcdFx0cmVzZXRWYWx1ZXMsXG5cdFx0XHRcdFx0a2VlcEV4aXN0aW5nU2VsZWN0aW9uXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFVwZGF0ZSBzdWdnZXN0cyBmb3IgYSBkcm9wIGRvd24gb2YgYSBmaWVsZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBmaWVsZEluZm9Nb2RlbCBSdW50aW1lIG1vZGVsIHdpdGggcGFyYW1ldGVycyBzdG9yZSBpbmZvcm1hdGlvbi5cblx0ICogQHBhcmFtIGZpZWxkUGF0aEFic29sdXRlIENvbXBsZXRlIHJ1bnRpbWUgcHJvcGVydHkgcGF0aC5cblx0ICogQHBhcmFtIHJlc2V0VmFsdWVzIFNob3VsZCB0aGUgdmFsdWVzIGJlIHJlc2V0IHRvIG9yaWdpbmFsIHN0YXRlLlxuXHQgKiBAcGFyYW0ga2VlcEV4aXN0aW5nU2VsZWN0aW9uIFNob3VsZCB0aGUgZXhpc3Rpbmcgc2VsZWN0aW9uIGJlZm9yZSB1cGRhdGUgcmVtYWluLlxuXHQgKi9cblx0X3VwZGF0ZUZpZWxkUGF0aFN1Z2dlc3Rpb25zOiBmdW5jdGlvbiAoXG5cdFx0ZmllbGRJbmZvTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRmaWVsZFBhdGhBYnNvbHV0ZTogc3RyaW5nLFxuXHRcdHJlc2V0VmFsdWVzOiBib29sZWFuLFxuXHRcdGtlZXBFeGlzdGluZ1NlbGVjdGlvbjogYm9vbGVhblxuXHQpIHtcblx0XHRjb25zdCBvcHRpb25zID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoZmllbGRQYXRoQWJzb2x1dGUpO1xuXHRcdGNvbnN0IGRlZmF1bHRPcHRpb25zID0gb3B0aW9ucy5kZWZhdWx0T3B0aW9ucztcblx0XHRjb25zdCBzZWxlY3RlZEtleSA9IGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAke2ZpZWxkUGF0aEFic29sdXRlfS9zZWxlY3RlZEtleWApO1xuXHRcdGNvbnN0IGV4aXN0aW5nU2VsZWN0aW9uID0ga2VlcEV4aXN0aW5nU2VsZWN0aW9uICYmIG9wdGlvbnMuZmluZCgob3B0aW9uOiBhbnkpID0+IG9wdGlvbi5rZXkgPT09IHNlbGVjdGVkS2V5KTtcblx0XHRpZiAocmVzZXRWYWx1ZXMpIHtcblx0XHRcdGNvbnN0IHNlbGVjdE9wdGlvbnMgPSBvcHRpb25zLnNlbGVjdE9wdGlvbnM7XG5cdFx0XHRvcHRpb25zLmxlbmd0aCA9IDA7XG5cdFx0XHRkZWZhdWx0T3B0aW9ucy5mb3JFYWNoKChkZWZhdWx0T3B0aW9uOiBhbnkpID0+IG9wdGlvbnMucHVzaChkZWZhdWx0T3B0aW9uKSk7XG5cdFx0XHRzZWxlY3RPcHRpb25zLmZvckVhY2goKHNlbGVjdE9wdGlvbjogYW55KSA9PiBvcHRpb25zLnB1c2goc2VsZWN0T3B0aW9uKSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9wdGlvbnMubGVuZ3RoID0gMDtcblx0XHRcdGRlZmF1bHRPcHRpb25zLmZvckVhY2goKGRlZmF1bHRPcHRpb246IGFueSkgPT4gb3B0aW9ucy5wdXNoKGRlZmF1bHRPcHRpb24pKTtcblx0XHR9XG5cblx0XHRmaWVsZEluZm9Nb2RlbC5zZXRQcm9wZXJ0eShmaWVsZFBhdGhBYnNvbHV0ZSwgb3B0aW9ucyk7XG5cblx0XHRpZiAoZXhpc3RpbmdTZWxlY3Rpb24gJiYgIW9wdGlvbnMuaW5jbHVkZXMoZXhpc3RpbmdTZWxlY3Rpb24pKSB7XG5cdFx0XHRvcHRpb25zLnB1c2goZXhpc3RpbmdTZWxlY3Rpb24pO1xuXHRcdFx0ZmllbGRJbmZvTW9kZWwuc2V0UHJvcGVydHkoYCR7ZmllbGRQYXRoQWJzb2x1dGV9L3NlbGVjdGVkS2V5YCwgc2VsZWN0ZWRLZXkpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIEluIGFuZCBPdXQgUGFyYW1ldGVycyBpbiB0aGUgTUVELlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIHRyYW5zQ3R4IFRoZSB0cmFuc2llbnQgY29udGV4dCBvZiB0aGUgTUVELlxuXHQgKiBAcGFyYW0gc291cmNlIE1EQyBmaWVsZC5cblx0ICogQHBhcmFtIGZpZWxkSW5mb01vZGVsIFJ1bnRpbWUgbW9kZWwgd2l0aCBwYXJhbWV0ZXJzIHN0b3JlIGluZm9ybWF0aW9uLlxuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIFByb3BlcnR5IHBhdGguXG5cdCAqL1xuXHRfc2V0VmFsdWVMaXN0SW5mbzogZnVuY3Rpb24gKHRyYW5zQ3R4OiBDb250ZXh0LCBzb3VyY2U6IEZpZWxkLCBmaWVsZEluZm9Nb2RlbDogSlNPTk1vZGVsLCBwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IHZvaWQge1xuXHRcdGNvbnN0IHByb3BQYXRoID1cblx0XHRcdChmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3ZhbHVlcy8ke3Byb3BlcnR5TmFtZX1gKSAmJiBcIi92YWx1ZXMvXCIpIHx8XG5cdFx0XHQoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC91bml0RGF0YS8ke3Byb3BlcnR5TmFtZX1gKSAmJiBcIi91bml0RGF0YS9cIik7XG5cblx0XHRpZiAoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYCR7cHJvcFBhdGh9JHtwcm9wZXJ0eU5hbWV9L3ZhbHVlTGlzdEluZm9gKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCB2YWx1ZUxpc3RJbmZvID0gZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYCR7cHJvcFBhdGh9JHtwcm9wZXJ0eU5hbWV9L3ZhbHVlTGlzdEluZm9gKTtcblxuXHRcdGlmICghdmFsdWVMaXN0SW5mbykge1xuXHRcdFx0TWFzc0VkaXRIYW5kbGVycy5fcmVxdWVzdFZhbHVlTGlzdCh0cmFuc0N0eCwgc291cmNlLCBmaWVsZEluZm9Nb2RlbCwgcHJvcGVydHlOYW1lKTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJlcXVlc3QgYW5kIHVwZGF0ZSBJbiBhbmQgT3V0IFBhcmFtZXRlcnMgaW4gdGhlIE1FRC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSB0cmFuc0N0eCBUaGUgdHJhbnNpZW50IGNvbnRleHQgb2YgdGhlIE1FRC5cblx0ICogQHBhcmFtIHNvdXJjZSBNREMgZmllbGQuXG5cdCAqIEBwYXJhbSBmaWVsZEluZm9Nb2RlbCBSdW50aW1lIG1vZGVsIHdpdGggcGFyYW1ldGVycyBzdG9yZSBpbmZvcm1hdGlvbi5cblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBQcm9wZXJ0eSBwYXRoLlxuXHQgKi9cblx0X3JlcXVlc3RWYWx1ZUxpc3Q6IGZ1bmN0aW9uICh0cmFuc0N0eDogQ29udGV4dCwgc291cmNlOiBGaWVsZCwgZmllbGRJbmZvTW9kZWw6IEpTT05Nb2RlbCwgcHJvcGVydHlOYW1lOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRjb25zdCBtZXRhUGF0aCA9IE1vZGVsSGVscGVyLmdldE1ldGFQYXRoRm9yQ29udGV4dCh0cmFuc0N0eCk7XG5cdFx0Y29uc3QgcHJvcGVydHlQYXRoID0gKG1ldGFQYXRoICYmIGAke21ldGFQYXRofS8ke3Byb3BlcnR5TmFtZX1gKSBhcyBzdHJpbmc7XG5cdFx0Y29uc3QgZGVwZW5kZW50cyA9IHNvdXJjZT8uZ2V0RGVwZW5kZW50cygpO1xuXHRcdGNvbnN0IGZpZWxkSGVscCA9IHNvdXJjZT8uZ2V0RmllbGRIZWxwKCk7XG5cdFx0Y29uc3QgZmllbGRWYWx1ZUhlbHAgPSBkZXBlbmRlbnRzPy5maW5kKChkZXBlbmRlbnQ6IGFueSkgPT4gZGVwZW5kZW50LmdldElkKCkgPT09IGZpZWxkSGVscCkgYXMgVmFsdWVIZWxwO1xuXHRcdGNvbnN0IHBheWxvYWQgPSAoZmllbGRWYWx1ZUhlbHAuZ2V0RGVsZWdhdGUoKSBhcyBhbnkpPy5wYXlsb2FkIGFzIFZhbHVlSGVscFBheWxvYWQ7XG5cdFx0aWYgKCFmaWVsZFZhbHVlSGVscD8uZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0ZmllbGRWYWx1ZUhlbHA/LnNldEJpbmRpbmdDb250ZXh0KHRyYW5zQ3R4KTtcblx0XHR9XG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gdHJhbnNDdHguZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0XHRWYWx1ZUxpc3RIZWxwZXIuY3JlYXRlVkhVSU1vZGVsKGZpZWxkVmFsdWVIZWxwLCBwcm9wZXJ0eVBhdGgsIG1ldGFNb2RlbCk7XG5cdFx0Y29uc3QgdmFsdWVMaXN0SW5mbyA9IFZhbHVlTGlzdEhlbHBlci5nZXRWYWx1ZUxpc3RJbmZvKGZpZWxkVmFsdWVIZWxwLCBwcm9wZXJ0eVBhdGgsIHBheWxvYWQpO1xuXG5cdFx0dmFsdWVMaXN0SW5mb1xuXHRcdFx0LnRoZW4oKHZMaW5mb3M6IFZhbHVlTGlzdEluZm9bXSkgPT4ge1xuXHRcdFx0XHRjb25zdCB2TGluZm8gPSB2TGluZm9zWzBdO1xuXHRcdFx0XHRjb25zdCBwcm9wUGF0aCA9XG5cdFx0XHRcdFx0KGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApICYmIFwiL3ZhbHVlcy9cIikgfHxcblx0XHRcdFx0XHQoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC91bml0RGF0YS8ke3Byb3BlcnR5TmFtZX1gKSAmJiBcIi91bml0RGF0YS9cIik7XG5cdFx0XHRcdGNvbnN0IGluZm86IGFueSA9IHtcblx0XHRcdFx0XHRpblBhcmFtZXRlcnM6XG5cdFx0XHRcdFx0XHR2TGluZm8udmhQYXJhbWV0ZXJzICYmIFZhbHVlTGlzdEhlbHBlci5nZXRJblBhcmFtZXRlcnModkxpbmZvLnZoUGFyYW1ldGVycykubWFwKChpblBhcmFtOiBhbnkpID0+IGluUGFyYW0uaGVscFBhdGgpLFxuXHRcdFx0XHRcdG91dFBhcmFtZXRlcnM6XG5cdFx0XHRcdFx0XHR2TGluZm8udmhQYXJhbWV0ZXJzICYmXG5cdFx0XHRcdFx0XHRWYWx1ZUxpc3RIZWxwZXIuZ2V0T3V0UGFyYW1ldGVycyh2TGluZm8udmhQYXJhbWV0ZXJzKS5tYXAoKG91dFBhcmFtOiBhbnkpID0+IG91dFBhcmFtLmhlbHBQYXRoKVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRmaWVsZEluZm9Nb2RlbC5zZXRQcm9wZXJ0eShgJHtwcm9wUGF0aH0ke3Byb3BlcnR5TmFtZX0vdmFsdWVMaXN0SW5mb2AsIGluZm8pO1xuXHRcdFx0XHRpZiAoaW5mby5vdXRQYXJhbWV0ZXJzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRNYXNzRWRpdEhhbmRsZXJzLl91cGRhdGVGaWVsZFBhdGhTdWdnZXN0aW9ucyhmaWVsZEluZm9Nb2RlbCwgYC92YWx1ZXMvJHtwcm9wZXJ0eU5hbWV9YCwgZmFsc2UsIHRydWUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKCgpID0+IHtcblx0XHRcdFx0TG9nLndhcm5pbmcoYE1hc3MgRWRpdDogQ291bGRuJ3QgbG9hZCB2YWx1ZUxpc3QgaW5mbyBmb3IgJHtwcm9wZXJ0eVBhdGh9YCk7XG5cdFx0XHR9KTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IGZpZWxkIGhlbHAgY29udHJvbCBmcm9tIE1EQyBmaWVsZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSB0cmFuc0N0eCBUaGUgdHJhbnNpZW50IGNvbnRleHQgb2YgdGhlIE1FRC5cblx0ICogQHBhcmFtIHNvdXJjZSBNREMgZmllbGQuXG5cdCAqIEByZXR1cm5zIEZpZWxkIEhlbHAgY29udHJvbC5cblx0ICovXG5cdF9nZXRWYWx1ZUhlbHA6IGZ1bmN0aW9uICh0cmFuc0N0eDogQ29udGV4dCwgc291cmNlOiBGaWVsZCk6IGFueSB7XG5cdFx0Y29uc3QgZGVwZW5kZW50cyA9IHNvdXJjZT8uZ2V0RGVwZW5kZW50cygpO1xuXHRcdGNvbnN0IGZpZWxkSGVscCA9IHNvdXJjZT8uZ2V0RmllbGRIZWxwKCk7XG5cdFx0cmV0dXJuIGRlcGVuZGVudHM/LmZpbmQoKGRlcGVuZGVudDogYW55KSA9PiBkZXBlbmRlbnQuZ2V0SWQoKSA9PT0gZmllbGRIZWxwKTtcblx0fSxcblxuXHQvKipcblx0ICogQ29sbGVkIG9uIGRyb3AgZG93biBzZWxlY3Rpb24gb2YgVkhEIG9wdGlvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBzb3VyY2UgQ3VzdG9tIE1hc3MgRWRpdCBTZWxlY3QgY29udHJvbC5cblx0ICogQHBhcmFtIHByb3BlcnR5TmFtZSBQcm9wZXJ0eSBwYXRoLlxuXHQgKiBAcGFyYW0gc2VsZWN0S2V5IFByZXZpb3VzIGtleSBiZWZvcmUgdGhlIFZIRCB3YXMgc2VsZWN0ZWQuXG5cdCAqL1xuXHRfb25WSFNlbGVjdDogZnVuY3Rpb24gKHNvdXJjZTogYW55LCBwcm9wZXJ0eU5hbWU6IHN0cmluZywgc2VsZWN0S2V5OiBzdHJpbmcpOiB2b2lkIHtcblx0XHQvLyBDYWxsZWQgZm9yXG5cdFx0Ly8gMS4gVkhEIHNlbGVjdGVkLlxuXG5cdFx0Y29uc3QgZmllbGRJbmZvTW9kZWwgPSBzb3VyY2UgJiYgc291cmNlLmdldE1vZGVsKFwiZmllbGRzSW5mb1wiKTtcblx0XHRjb25zdCBwcm9wUGF0aCA9XG5cdFx0XHQoZmllbGRJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtwcm9wZXJ0eU5hbWV9YCkgJiYgXCIvdmFsdWVzL1wiKSB8fFxuXHRcdFx0KGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdW5pdERhdGEvJHtwcm9wZXJ0eU5hbWV9YCkgJiYgXCIvdW5pdERhdGEvXCIpO1xuXHRcdGNvbnN0IHRyYW5zQ3R4ID0gc291cmNlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdFx0Y29uc3QgZmllbGRWYWx1ZUhlbHAgPSBNYXNzRWRpdEhhbmRsZXJzLl9nZXRWYWx1ZUhlbHAodHJhbnNDdHgsIHNvdXJjZS5nZXRQYXJlbnQoKSk7XG5cdFx0aWYgKCFmaWVsZFZhbHVlSGVscD8uZ2V0QmluZGluZ0NvbnRleHQoKSkge1xuXHRcdFx0ZmllbGRWYWx1ZUhlbHA/LnNldEJpbmRpbmdDb250ZXh0KHRyYW5zQ3R4KTtcblx0XHR9XG5cdFx0c291cmNlLmZpcmVWYWx1ZUhlbHBSZXF1ZXN0KCk7XG5cblx0XHRmaWVsZEluZm9Nb2RlbC5zZXRQcm9wZXJ0eShgJHtwcm9wUGF0aCArIHByb3BlcnR5TmFtZX0vc2VsZWN0ZWRLZXlgLCBzZWxlY3RLZXkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBHZXRzIFByb3BlcnR5IG5hbWUgZnJvbSBzZWxlY3Rpb24ga2V5LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQHBhcmFtIGtleSBTZWxlY3Rpb24ga2V5LlxuXHQgKiBAcmV0dXJucyBQcm9wZXJ0eSBuYW1lLlxuXHQgKi9cblx0X2dldFByb3BlcnR5TmFtZUZyb21LZXk6IGZ1bmN0aW9uIChrZXk6IHN0cmluZykge1xuXHRcdGxldCBwcm9wZXJ0eU5hbWUgPSBcIlwiO1xuXHRcdGlmIChrZXkuc3RhcnRzV2l0aChcIkRlZmF1bHQvXCIpIHx8IGtleS5zdGFydHNXaXRoKFwiQ2xlYXJGaWVsZFZhbHVlL1wiKSB8fCBrZXkuc3RhcnRzV2l0aChcIlVzZVZhbHVlSGVscFZhbHVlL1wiKSkge1xuXHRcdFx0cHJvcGVydHlOYW1lID0ga2V5LnN1YnN0cmluZyhrZXkuaW5kZXhPZihcIi9cIikgKyAxKTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cHJvcGVydHlOYW1lID0ga2V5LnN1YnN0cmluZygwLCBrZXkubGFzdEluZGV4T2YoXCIvXCIpKTtcblx0XHR9XG5cdFx0cmV0dXJuIHByb3BlcnR5TmFtZTtcblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlIHNlbGVjdGlvbiB0byBDdXN0b20gTWFzcyBFZGl0IFNlbGVjdCBmcm9tIE1EQyBmaWVsZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBzb3VyY2UgTURDIGZpZWxkLlxuXHQgKiBAcGFyYW0gcHJvcGVydHlOYW1lIFByb3BlcnR5IHBhdGguXG5cdCAqIEBwYXJhbSB2YWx1ZSBWYWx1ZSB0byB1cGRhdGUuXG5cdCAqIEBwYXJhbSBmdWxsVGV4dCBGdWxsIHRleHQgdG8gdXNlLlxuXHQgKi9cblx0X3VwZGF0ZVNlbGVjdEtleTogZnVuY3Rpb24gKHNvdXJjZTogRmllbGQsIHByb3BlcnR5TmFtZTogc3RyaW5nLCB2YWx1ZTogYW55LCBmdWxsVGV4dD86IGFueSk6IHZvaWQge1xuXHRcdC8vIENhbGxlZCBmb3Jcblx0XHQvLyAxLiBWSEQgcHJvcGVydHkgY2hhbmdlXG5cdFx0Ly8gMi4gT3V0IFBhcmFtZXRlcnMuXG5cdFx0Ly8gMy4gVHJhbnNpZW50IGNvbnRleHQgcHJvcGVydHkgY2hhbmdlLlxuXG5cdFx0Y29uc3QgY29tYm9Cb3ggPSBzb3VyY2UuZ2V0Q29udGVudCgpIGFzIENvbWJvQm94O1xuXHRcdGlmICghY29tYm9Cb3ggfHwgIXByb3BlcnR5TmFtZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRsZXQga2V5OiBzdHJpbmcgPSBjb21ib0JveC5nZXRTZWxlY3RlZEtleSgpO1xuXHRcdGlmICgoa2V5LnN0YXJ0c1dpdGgoXCJEZWZhdWx0L1wiKSB8fCBrZXkuc3RhcnRzV2l0aChcIkNsZWFyRmllbGRWYWx1ZS9cIikpICYmICF2YWx1ZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblxuXHRcdGNvbnN0IGZvcm1hdHRlZFRleHQgPSBNYXNzRWRpdEhhbmRsZXJzLl92YWx1ZUV4aXN0cyhmdWxsVGV4dCkgPyBmdWxsVGV4dCA6IHZhbHVlO1xuXHRcdGNvbnN0IGZpZWxkSW5mb01vZGVsID0gc291cmNlICYmIChzb3VyY2UuZ2V0TW9kZWwoXCJmaWVsZHNJbmZvXCIpIGFzIEpTT05Nb2RlbCk7XG5cdFx0Y29uc3QgdmFsdWVzID1cblx0XHRcdGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApIHx8IGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdW5pdERhdGEvJHtwcm9wZXJ0eU5hbWV9YCkgfHwgW107XG5cdFx0Y29uc3QgcHJvcFBhdGggPVxuXHRcdFx0KGZpZWxkSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApICYmIFwiL3ZhbHVlcy9cIikgfHxcblx0XHRcdChmaWVsZEluZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3VuaXREYXRhLyR7cHJvcGVydHlOYW1lfWApICYmIFwiL3VuaXREYXRhL1wiKTtcblxuXHRcdGNvbnN0IHJlbGF0ZWRGaWVsZCA9IHZhbHVlcy5maW5kKChmaWVsZERhdGE6IGFueSkgPT4gZmllbGREYXRhPy50ZXh0SW5mbz8udmFsdWUgPT09IHZhbHVlIHx8IGZpZWxkRGF0YS50ZXh0ID09PSB2YWx1ZSk7XG5cblx0XHRpZiAocmVsYXRlZEZpZWxkKSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdGZ1bGxUZXh0ICYmXG5cdFx0XHRcdHJlbGF0ZWRGaWVsZC50ZXh0SW5mbyAmJlxuXHRcdFx0XHRyZWxhdGVkRmllbGQudGV4dEluZm8uZGVzY3JpcHRpb25QYXRoICYmXG5cdFx0XHRcdChyZWxhdGVkRmllbGQudGV4dCAhPSBmb3JtYXR0ZWRUZXh0IHx8IHJlbGF0ZWRGaWVsZC50ZXh0SW5mby5mdWxsVGV4dCAhPSBmb3JtYXR0ZWRUZXh0KVxuXHRcdFx0KSB7XG5cdFx0XHRcdC8vIFVwZGF0ZSB0aGUgZnVsbCB0ZXh0IG9ubHkgd2hlbiBwcm92aWRlZC5cblx0XHRcdFx0cmVsYXRlZEZpZWxkLnRleHQgPSBmb3JtYXR0ZWRUZXh0O1xuXHRcdFx0XHRyZWxhdGVkRmllbGQudGV4dEluZm8uZnVsbFRleHQgPSBmb3JtYXR0ZWRUZXh0O1xuXHRcdFx0XHRyZWxhdGVkRmllbGQudGV4dEluZm8uZGVzY3JpcHRpb24gPSBzb3VyY2UuZ2V0QWRkaXRpb25hbFZhbHVlKCk7XG5cdFx0XHR9XG5cdFx0XHRpZiAocmVsYXRlZEZpZWxkLmtleSA9PT0ga2V5KSB7XG5cdFx0XHRcdGZpZWxkSW5mb01vZGVsLnNldFByb3BlcnR5KGAke3Byb3BQYXRoICsgcHJvcGVydHlOYW1lfS9zZWxlY3RlZEtleWAsIGtleSk7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdGtleSA9IHJlbGF0ZWRGaWVsZC5rZXk7XG5cdFx0fSBlbHNlIGlmIChbdW5kZWZpbmVkLCBudWxsLCBcIlwiXS5pbmRleE9mKHZhbHVlKSA9PT0gLTEpIHtcblx0XHRcdGtleSA9IGAke3Byb3BlcnR5TmFtZX0vJHt2YWx1ZX1gO1xuXHRcdFx0Y29uc3Qgc2VsZWN0aW9uSW5mbyA9IHtcblx0XHRcdFx0dGV4dDogZm9ybWF0dGVkVGV4dCxcblx0XHRcdFx0a2V5LFxuXHRcdFx0XHR0ZXh0SW5mbzoge1xuXHRcdFx0XHRcdGRlc2NyaXB0aW9uOiBzb3VyY2UuZ2V0QWRkaXRpb25hbFZhbHVlKCksXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25QYXRoOiB2YWx1ZXMgJiYgdmFsdWVzLnRleHRJbmZvICYmIHZhbHVlcy50ZXh0SW5mby5kZXNjcmlwdGlvblBhdGgsXG5cdFx0XHRcdFx0ZnVsbFRleHQ6IGZvcm1hdHRlZFRleHQsXG5cdFx0XHRcdFx0dGV4dEFycmFuZ2VtZW50OiBzb3VyY2UuZ2V0RGlzcGxheSgpLFxuXHRcdFx0XHRcdHZhbHVlOiBzb3VyY2UuZ2V0VmFsdWUoKSxcblx0XHRcdFx0XHR2YWx1ZVBhdGg6IHByb3BlcnR5TmFtZVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0dmFsdWVzLnB1c2goc2VsZWN0aW9uSW5mbyk7XG5cdFx0XHR2YWx1ZXMuc2VsZWN0T3B0aW9ucyA9IHZhbHVlcy5zZWxlY3RPcHRpb25zIHx8IFtdO1xuXHRcdFx0dmFsdWVzLnNlbGVjdE9wdGlvbnMucHVzaChzZWxlY3Rpb25JbmZvKTtcblx0XHRcdGZpZWxkSW5mb01vZGVsLnNldFByb3BlcnR5KHByb3BQYXRoICsgcHJvcGVydHlOYW1lLCB2YWx1ZXMpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRrZXkgPSBgRGVmYXVsdC8ke3Byb3BlcnR5TmFtZX1gO1xuXHRcdH1cblxuXHRcdGZpZWxkSW5mb01vZGVsLnNldFByb3BlcnR5KGAke3Byb3BQYXRoICsgcHJvcGVydHlOYW1lfS9zZWxlY3RlZEtleWAsIGtleSk7XG5cdFx0TWFzc0VkaXRIYW5kbGVycy5fdXBkYXRlUmVzdWx0cyhjb21ib0JveCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldCBWYWx1ZSBmcm9tIERyb3AgZG93bi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBwYXJhbSBzb3VyY2UgRHJvcCBkb3duIGNvbnRyb2wuXG5cdCAqIEByZXR1cm5zIFZhbHVlIG9mIHNlbGVjdGlvbi5cblx0ICovXG5cdF9nZXRWYWx1ZTogZnVuY3Rpb24gKHNvdXJjZTogQ29udHJvbCkge1xuXHRcdHJldHVybiBzb3VyY2UuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCkgPT09IFwic2FwLmZlLmNvcmUuY29udHJvbHMuTWFzc0VkaXRTZWxlY3RcIlxuXHRcdFx0PyAoc291cmNlIGFzIFNlbGVjdCkuZ2V0U2VsZWN0ZWRJdGVtKCk/LmdldFRleHQoKVxuXHRcdFx0OiAoc291cmNlIGFzIENvbWJvQm94KS5nZXRWYWx1ZSgpO1xuXHR9LFxuXG5cdF9nZXRWYWx1ZU9uRW1wdHk6IGZ1bmN0aW9uIChvU291cmNlOiBhbnksIGZpZWxkc0luZm9Nb2RlbDogSlNPTk1vZGVsLCB2YWx1ZTogYW55LCBzUHJvcGVydHlOYW1lOiBzdHJpbmcpIHtcblx0XHRpZiAoIXZhbHVlKSB7XG5cdFx0XHRjb25zdCB2YWx1ZXMgPVxuXHRcdFx0XHRmaWVsZHNJbmZvTW9kZWwuZ2V0UHJvcGVydHkoYC92YWx1ZXMvJHtzUHJvcGVydHlOYW1lfWApIHx8IGZpZWxkc0luZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3VuaXREYXRhLyR7c1Byb3BlcnR5TmFtZX1gKSB8fCBbXTtcblx0XHRcdGlmICh2YWx1ZXMudW5pdFByb3BlcnR5KSB7XG5cdFx0XHRcdHZhbHVlID0gMDtcblx0XHRcdFx0b1NvdXJjZS5zZXRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHR9IGVsc2UgaWYgKHZhbHVlcy5pbnB1dFR5cGUgPT09IFwiQ2hlY2tCb3hcIikge1xuXHRcdFx0XHR2YWx1ZSA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gdmFsdWU7XG5cdH0sXG5cblx0X3ZhbHVlRXhpc3RzOiBmdW5jdGlvbiAodmFsdWU6IGFueSkge1xuXHRcdHJldHVybiB2YWx1ZSAhPSB1bmRlZmluZWQgJiYgdmFsdWUgIT0gbnVsbDtcblx0fSxcblxuXHQvKipcblx0ICogVXBkYXRlcyBzZWxlY3Rpb25zIHRvIHJ1bnRpbWUgbW9kZWwuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0gb1NvdXJjZSBEcm9wIGRvd24gY29udHJvbC5cblx0ICogQHBhcmFtIGFQYXJhbXMgUGFydHMgb2Yga2V5IGluIHJ1bnRpbWUgbW9kZWwuXG5cdCAqIEBwYXJhbSB1cGRhdGVUcmFuc0N0eCBTaG91bGQgdHJhbnNpZW50IGNvbnRleHQgYmUgdXBkYXRlZCB3aXRoIHRoZSB2YWx1ZS5cblx0ICovXG5cdF91cGRhdGVSZXN1bHRzOiBmdW5jdGlvbiAob1NvdXJjZTogYW55LCBhUGFyYW1zOiBBcnJheTxzdHJpbmc+ID0gW10sIHVwZGF0ZVRyYW5zQ3R4OiBib29sZWFuKSB7XG5cdFx0Ly8gQ2FsbGVkIGZvclxuXHRcdC8vIDEuIFZIRCBwcm9wZXJ0eSBjaGFuZ2UuXG5cdFx0Ly8gMi4gT3V0IHBhcmFtZXRlci5cblx0XHQvLyAzLiB0cmFuc2llbnQgY29udGV4dCBwcm9wZXJ0eSBjaGFuZ2UuXG5cdFx0Y29uc3QgZmllbGRzSW5mb01vZGVsID0gb1NvdXJjZSAmJiBvU291cmNlLmdldE1vZGVsKFwiZmllbGRzSW5mb1wiKTtcblx0XHRjb25zdCBvRmllbGRzSW5mb0RhdGEgPSBmaWVsZHNJbmZvTW9kZWwgJiYgZmllbGRzSW5mb01vZGVsLmdldERhdGEoKTtcblx0XHRsZXQgdmFsdWUgPSBNYXNzRWRpdEhhbmRsZXJzLl9nZXRWYWx1ZShvU291cmNlIGFzIENvbnRyb2wpO1xuXHRcdGFQYXJhbXMgPSBhUGFyYW1zLmxlbmd0aCA+IDAgPyBhUGFyYW1zIDogb1NvdXJjZSAmJiBvU291cmNlLmdldFNlbGVjdGVkS2V5KCkgJiYgb1NvdXJjZS5nZXRTZWxlY3RlZEtleSgpLnNwbGl0KFwiL1wiKTtcblxuXHRcdGxldCBvRGF0YU9iamVjdDtcblx0XHRjb25zdCBzUHJvcGVydHlOYW1lID0gb1NvdXJjZS5kYXRhKFwiZmllbGRQYXRoXCIpO1xuXG5cdFx0aWYgKGFQYXJhbXNbMF0gPT09IFwiRGVmYXVsdFwiKSB7XG5cdFx0XHRvRGF0YU9iamVjdCA9IHtcblx0XHRcdFx0a2V5VmFsdWU6IGFQYXJhbXNbMV0sXG5cdFx0XHRcdHZhbHVlOiBhUGFyYW1zWzBdXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoYVBhcmFtc1swXSA9PT0gXCJDbGVhckZpZWxkVmFsdWVcIikge1xuXHRcdFx0dmFsdWUgPSBcIlwiO1xuXHRcdFx0dmFsdWUgPSBNYXNzRWRpdEhhbmRsZXJzLl9nZXRWYWx1ZU9uRW1wdHkob1NvdXJjZSwgZmllbGRzSW5mb01vZGVsLCB2YWx1ZSwgc1Byb3BlcnR5TmFtZSk7XG5cdFx0XHRvRGF0YU9iamVjdCA9IHtcblx0XHRcdFx0a2V5VmFsdWU6IGFQYXJhbXNbMV0sXG5cdFx0XHRcdHZhbHVlOiB2YWx1ZVxuXHRcdFx0fTtcblx0XHR9IGVsc2UgaWYgKCFhUGFyYW1zKSB7XG5cdFx0XHR2YWx1ZSA9IE1hc3NFZGl0SGFuZGxlcnMuX2dldFZhbHVlT25FbXB0eShvU291cmNlLCBmaWVsZHNJbmZvTW9kZWwsIHZhbHVlLCBzUHJvcGVydHlOYW1lKTtcblx0XHRcdG9EYXRhT2JqZWN0ID0ge1xuXHRcdFx0XHRrZXlWYWx1ZTogc1Byb3BlcnR5TmFtZSxcblx0XHRcdFx0dmFsdWU6IHZhbHVlXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eU5hbWUgPSBhUGFyYW1zLnNsaWNlKDAsIC0xKS5qb2luKFwiL1wiKTtcblx0XHRcdGNvbnN0IHByb3BlcnR5VmFsdWVzID1cblx0XHRcdFx0ZmllbGRzSW5mb01vZGVsLmdldFByb3BlcnR5KGAvdmFsdWVzLyR7cHJvcGVydHlOYW1lfWApIHx8IGZpZWxkc0luZm9Nb2RlbC5nZXRQcm9wZXJ0eShgL3VuaXREYXRhLyR7cHJvcGVydHlOYW1lfWApIHx8IFtdO1xuXG5cdFx0XHRjb25zdCByZWxhdGVkRmllbGQgPSAocHJvcGVydHlWYWx1ZXMgfHwgW10pLmZpbmQoZnVuY3Rpb24gKG9GaWVsZERhdGE6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0ZpZWxkRGF0YT8udGV4dEluZm8/LnZhbHVlID09PSB2YWx1ZSB8fCBvRmllbGREYXRhLnRleHQgPT09IHZhbHVlO1xuXHRcdFx0fSk7XG5cdFx0XHRvRGF0YU9iamVjdCA9IHtcblx0XHRcdFx0a2V5VmFsdWU6IHByb3BlcnR5TmFtZSxcblx0XHRcdFx0dmFsdWU6XG5cdFx0XHRcdFx0cmVsYXRlZEZpZWxkLnRleHRJbmZvICYmIE1hc3NFZGl0SGFuZGxlcnMuX3ZhbHVlRXhpc3RzKHJlbGF0ZWRGaWVsZC50ZXh0SW5mby52YWx1ZSlcblx0XHRcdFx0XHRcdD8gcmVsYXRlZEZpZWxkLnRleHRJbmZvLnZhbHVlXG5cdFx0XHRcdFx0XHQ6IHJlbGF0ZWRGaWVsZC50ZXh0XG5cdFx0XHR9O1xuXHRcdH1cblx0XHRsZXQgYkV4aXN0aW5nRWxlbWVudGluZGV4ID0gLTE7XG5cdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBvRmllbGRzSW5mb0RhdGEucmVzdWx0cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0aWYgKG9GaWVsZHNJbmZvRGF0YS5yZXN1bHRzW2ldLmtleVZhbHVlID09PSBvRGF0YU9iamVjdC5rZXlWYWx1ZSkge1xuXHRcdFx0XHRiRXhpc3RpbmdFbGVtZW50aW5kZXggPSBpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRpZiAoYkV4aXN0aW5nRWxlbWVudGluZGV4ICE9PSAtMSkge1xuXHRcdFx0b0ZpZWxkc0luZm9EYXRhLnJlc3VsdHNbYkV4aXN0aW5nRWxlbWVudGluZGV4XSA9IG9EYXRhT2JqZWN0O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvRmllbGRzSW5mb0RhdGEucmVzdWx0cy5wdXNoKG9EYXRhT2JqZWN0KTtcblx0XHR9XG5cdFx0aWYgKHVwZGF0ZVRyYW5zQ3R4ICYmICFvRGF0YU9iamVjdC5rZXlWYWx1ZS5pbmNsdWRlcyhcIi9cIikpIHtcblx0XHRcdGNvbnN0IHRyYW5zQ3R4ID0gb1NvdXJjZS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0aWYgKGFQYXJhbXNbMF0gPT09IFwiRGVmYXVsdFwiIHx8IGFQYXJhbXNbMF0gPT09IFwiQ2xlYXJGaWVsZFZhbHVlXCIpIHtcblx0XHRcdFx0dHJhbnNDdHguc2V0UHJvcGVydHkob0RhdGFPYmplY3Qua2V5VmFsdWUsIG51bGwpO1xuXHRcdFx0fSBlbHNlIGlmIChvRGF0YU9iamVjdCkge1xuXHRcdFx0XHR0cmFuc0N0eC5zZXRQcm9wZXJ0eShvRGF0YU9iamVjdC5rZXlWYWx1ZSwgb0RhdGFPYmplY3QudmFsdWUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgTWFzc0VkaXRIYW5kbGVycztcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQXVCQSxJQUFNQSxnQkFBcUIsR0FBRztJQUM3QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NDLHFCQUFxQixFQUFFLFVBQVVDLFFBQWEsRUFBRUMsWUFBb0IsRUFBRUMsVUFBa0IsRUFBRTtNQUN6RjtNQUNBO01BQ0E7O01BRUEsSUFBTUMsTUFBTSxHQUFHQyxJQUFJLENBQUNDLElBQUksQ0FBQ0gsVUFBVSxDQUFVO01BQzdDLElBQU1JLFFBQVEsR0FBR0gsTUFBTSxJQUFLQSxNQUFNLENBQUNJLGlCQUFpQixFQUFjO01BQ2xFLElBQU1DLGNBQWMsR0FBR0wsTUFBTSxJQUFLQSxNQUFNLENBQUNNLFFBQVEsQ0FBQyxZQUFZLENBQWU7TUFDN0UsSUFBTUMsTUFBTSxH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