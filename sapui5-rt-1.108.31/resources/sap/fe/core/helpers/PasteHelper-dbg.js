/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/m/MessageBox", "sap/ui/core/Core", "sap/ui/core/util/PasteHelper"], function (Log, MessageBox, Core, CorePasteHelper) {
  "use strict";

  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  var getInfoForEntityProperty = function (propertyPath, rowBindingPath, metaContext, metaModel) {
    var property = metaContext.getProperty(propertyPath),
      formatOptions = {
        parseKeepsEmptyString: true
      },
      type = metaModel.getUI5Type("".concat(rowBindingPath, "/").concat(propertyPath), formatOptions),
      isIgnored = !property || metaContext.getProperty("".concat(propertyPath, "@Org.OData.Core.V1.Computed"));
    return {
      property: propertyPath,
      ignore: isIgnored,
      type: type
    };
  };
  var displayErrorMessages = function (errorMessages) {
    var messageDetails = _toConsumableArray(errorMessages);
    var resourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
      errorCorrectionMessage = resourceBundle.getText("C_PASTE_HELPER_SAPFE_PASTE_ERROR_CORRECTION_MESSAGE"),
      noteMessage = resourceBundle.getText("C_PASTE_HELPER_SAPFE_PASTE_ERROR_CORRECTION_NOTE");
    var pasteErrorMessage;
    if (messageDetails.length > 1) {
      pasteErrorMessage = resourceBundle.getText("C_PASTE_HELPER_SAPFE_PASTE_ERROR_MESSAGE_PLURAL", [messageDetails.length]);
    } else {
      pasteErrorMessage = resourceBundle.getText("C_PASTE_HELPER_SAPFE_PASTE_ERROR_MESSAGE_SINGULAR");
    }
    messageDetails.unshift(""); // To show space between the short text and the list of errors
    messageDetails.unshift(noteMessage);
    messageDetails.unshift(errorCorrectionMessage);
    MessageBox.error(pasteErrorMessage, {
      title: resourceBundle.getText("C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_TITLE_ERROR"),
      details: messageDetails.join("<br>")
    });
  };
  var PasteHelper = {
    displayErrorMessages: displayErrorMessages,
    formatCustomMessage: function (validationMessages, iRowNumber) {
      var errorMessage = "";
      var numberMessages = validationMessages.length;
      var resourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
        i18nRow = resourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW");
      if (numberMessages > 0) {
        errorMessage += "".concat(i18nRow, " ").concat(iRowNumber, ": ");
        validationMessages.forEach(function (message, indexMessage) {
          if (message.messageText) {
            errorMessage += message.messageText + (indexMessage + 1 !== numberMessages ? " " : "");
          }
        });
      }
      return errorMessage;
    },
    getColumnInfo: function (table) {
      var _this = this;
      var model = table.getRowBinding().getModel(),
        metaModel = model.getMetaModel(),
        rowBindingPath = model.resolve(table.getRowBinding().getPath(), table.getRowBinding().getContext()),
        metaContext = metaModel.getMetaContext(rowBindingPath);
      return table.getControlDelegate().fetchProperties(table).then(function (propertyInfo) {
        var PropertyInfoDict = Object.assign.apply(Object, [{}].concat(_toConsumableArray(propertyInfo.map(function (property) {
          return _defineProperty({}, property.name, property);
        }))));
        var columnInfos = [];
        table.getColumns().forEach(function (column) {
          var infoProperty = PropertyInfoDict[column.getDataProperty()];
          // Check if it's a complex property (property associated to multiple simple properties)
          if (infoProperty.propertyInfos) {
            // Get data from simple property
            infoProperty.propertyInfos.forEach(function (property) {
              var dataProperty = PropertyInfoDict[property];
              // Non exported columns should be part of the columnInfos
              if (dataProperty.exportSettings !== null) {
                // Check if there is a simple property associated to a Rating or Progress ComplexProperty --> ignore
                // Or check a navigation property within the current Complex property --> ignore
                // A fake property was created into the propertyInfos to include the Target Value
                // from the DataPoint (path includes the @com.sap.vocabularies.UI.v1.DataPoint annotation)
                if (dataProperty && dataProperty.path.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 || property.indexOf("/") > -1) {
                  columnInfos.push({
                    property: dataProperty.path,
                    ignore: true
                  });
                } else {
                  columnInfos.push(_this.getInfoForEntityProperty(dataProperty.path, rowBindingPath, metaContext, metaModel));
                }
              }
            });
          } else if (infoProperty.exportSettings !== null) {
            if (infoProperty.path) {
              columnInfos.push(_this.getInfoForEntityProperty(infoProperty.path, rowBindingPath, metaContext, metaModel));
            } else {
              // Empty column --> ignore
              columnInfos.push({
                property: "unused",
                type: null,
                ignore: true
              });
            }
          }
        });
        return columnInfos;
      });
    },
    getInfoForEntityProperty: getInfoForEntityProperty,
    parsePastedData: function (rawData, table) {
      var _this2 = this;
      return this.getColumnInfo(table).then(function (pasteInfos) {
        // Check if we have data for at least the first editable column
        var pastedColumnCount = rawData.length ? rawData[0].length : 0;
        var firstEditableColumnIndex = -1;
        for (var I = 0; I < pasteInfos.length && firstEditableColumnIndex < 0; I++) {
          if (!pasteInfos[I].ignore) {
            firstEditableColumnIndex = I;
          }
        }
        return firstEditableColumnIndex < 0 || firstEditableColumnIndex > pastedColumnCount - 1 ? Promise.resolve({}) // We don't have data for an editable column --> return empty parsed data
        : CorePasteHelper.parse(rawData, pasteInfos);
      }).then(function (parseResult) {
        if (parseResult.errors) {
          var errorMessages = parseResult.errors.map(function (oElement) {
            return oElement.message;
          });
          _this2.displayErrorMessages(errorMessages);
          return []; // Errors --> return nothing
        } else {
          return parseResult.parsedData ? parseResult.parsedData : [];
        }
      });
    },
    pasteData: function (rawData, table, controller) {
      var _this3 = this;
      var oInternalEditFlow = controller._editFlow;
      var tableDefinition = table.getParent().getTableDefinition();
      var aData = [];
      return this.parsePastedData(rawData, table).then(function (aParsedData) {
        aData = aParsedData || [];
        return Promise.all(aData.map(function (mData) {
          var _tableDefinition$cont;
          return oInternalEditFlow.getTransactionHelper().validateDocument(table.getBindingContext(), {
            data: mData,
            customValidationFunction: tableDefinition === null || tableDefinition === void 0 ? void 0 : (_tableDefinition$cont = tableDefinition.control) === null || _tableDefinition$cont === void 0 ? void 0 : _tableDefinition$cont.customValidationFunction
          }, controller.getView());
        }));
      }).then(function (aValidationMessages) {
        var aErrorMessages = aValidationMessages.reduce(function (aMessages, aCustomMessages, index) {
          if (aCustomMessages.length > 0) {
            aMessages.push({
              messages: aCustomMessages,
              row: index + 1
            });
          }
          return aMessages;
        }, []);
        if (aErrorMessages.length > 0) {
          var aRowMessages = aErrorMessages.map(function (mError) {
            return _this3.formatCustomMessage(mError.messages, mError.row);
          });
          _this3.displayErrorMessages(aRowMessages);
          return [];
        }
        return aData;
      }).then(function (aValidatedData) {
        var _tableDefinition$cont2;
        return aValidatedData.length > 0 ? oInternalEditFlow.createMultipleDocuments(table.getRowBinding(), aValidatedData, tableDefinition === null || tableDefinition === void 0 ? void 0 : (_tableDefinition$cont2 = tableDefinition.control) === null || _tableDefinition$cont2 === void 0 ? void 0 : _tableDefinition$cont2.createAtEnd, true, controller.editFlow.onBeforeCreate) : undefined;
      }).catch(function (oError) {
        Log.error("Error while pasting data", oError);
      });
    }
  };
  return PasteHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRJbmZvRm9yRW50aXR5UHJvcGVydHkiLCJwcm9wZXJ0eVBhdGgiLCJyb3dCaW5kaW5nUGF0aCIsIm1ldGFDb250ZXh0IiwibWV0YU1vZGVsIiwicHJvcGVydHkiLCJnZXRQcm9wZXJ0eSIsImZvcm1hdE9wdGlvbnMiLCJwYXJzZUtlZXBzRW1wdHlTdHJpbmciLCJ0eXBlIiwiZ2V0VUk1VHlwZSIsImlzSWdub3JlZCIsImlnbm9yZSIsImRpc3BsYXlFcnJvck1lc3NhZ2VzIiwiZXJyb3JNZXNzYWdlcyIsIm1lc3NhZ2VEZXRhaWxzIiwicmVzb3VyY2VCdW5kbGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiZXJyb3JDb3JyZWN0aW9uTWVzc2FnZSIsImdldFRleHQiLCJub3RlTWVzc2FnZSIsInBhc3RlRXJyb3JNZXNzYWdlIiwibGVuZ3RoIiwidW5zaGlmdCIsIk1lc3NhZ2VCb3giLCJlcnJvciIsInRpdGxlIiwiZGV0YWlscyIsImpvaW4iLCJQYXN0ZUhlbHBlciIsImZvcm1hdEN1c3RvbU1lc3NhZ2UiLCJ2YWxpZGF0aW9uTWVzc2FnZXMiLCJpUm93TnVtYmVyIiwiZXJyb3JNZXNzYWdlIiwibnVtYmVyTWVzc2FnZXMiLCJpMThuUm93IiwiZm9yRWFjaCIsIm1lc3NhZ2UiLCJpbmRleE1lc3NhZ2UiLCJtZXNzYWdlVGV4dCIsImdldENvbHVtbkluZm8iLCJ0YWJsZSIsIm1vZGVsIiwiZ2V0Um93QmluZGluZyIsImdldE1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwicmVzb2x2ZSIsImdldFBhdGgiLCJnZXRDb250ZXh0IiwiZ2V0TWV0YUNvbnRleHQiLCJnZXRDb250cm9sRGVsZWdhdGUiLCJmZXRjaFByb3BlcnRpZXMiLCJ0aGVuIiwicHJvcGVydHlJbmZvIiwiUHJvcGVydHlJbmZvRGljdCIsIk9iamVjdCIsImFzc2lnbiIsIm1hcCIsIm5hbWUiLCJjb2x1bW5JbmZvcyIsImdldENvbHVtbnMiLCJjb2x1bW4iLCJpbmZvUHJvcGVydHkiLCJnZXREYXRhUHJvcGVydHkiLCJwcm9wZXJ0eUluZm9zIiwiZGF0YVByb3BlcnR5IiwiZXhwb3J0U2V0dGluZ3MiLCJwYXRoIiwiaW5kZXhPZiIsInB1c2giLCJwYXJzZVBhc3RlZERhdGEiLCJyYXdEYXRhIiwicGFzdGVJbmZvcyIsInBhc3RlZENvbHVtbkNvdW50IiwiZmlyc3RFZGl0YWJsZUNvbHVtbkluZGV4IiwiSSIsIlByb21pc2UiLCJDb3JlUGFzdGVIZWxwZXIiLCJwYXJzZSIsInBhcnNlUmVzdWx0IiwiZXJyb3JzIiwib0VsZW1lbnQiLCJwYXJzZWREYXRhIiwicGFzdGVEYXRhIiwiY29udHJvbGxlciIsIm9JbnRlcm5hbEVkaXRGbG93IiwiX2VkaXRGbG93IiwidGFibGVEZWZpbml0aW9uIiwiZ2V0UGFyZW50IiwiZ2V0VGFibGVEZWZpbml0aW9uIiwiYURhdGEiLCJhUGFyc2VkRGF0YSIsImFsbCIsIm1EYXRhIiwiZ2V0VHJhbnNhY3Rpb25IZWxwZXIiLCJ2YWxpZGF0ZURvY3VtZW50IiwiZ2V0QmluZGluZ0NvbnRleHQiLCJkYXRhIiwiY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uIiwiY29udHJvbCIsImdldFZpZXciLCJhVmFsaWRhdGlvbk1lc3NhZ2VzIiwiYUVycm9yTWVzc2FnZXMiLCJyZWR1Y2UiLCJhTWVzc2FnZXMiLCJhQ3VzdG9tTWVzc2FnZXMiLCJpbmRleCIsIm1lc3NhZ2VzIiwicm93IiwiYVJvd01lc3NhZ2VzIiwibUVycm9yIiwiYVZhbGlkYXRlZERhdGEiLCJjcmVhdGVNdWx0aXBsZURvY3VtZW50cyIsImNyZWF0ZUF0RW5kIiwiZWRpdEZsb3ciLCJvbkJlZm9yZUNyZWF0ZSIsInVuZGVmaW5lZCIsImNhdGNoIiwib0Vycm9yIiwiTG9nIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJQYXN0ZUhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB0eXBlIFBhZ2VDb250cm9sbGVyIGZyb20gXCJzYXAvZmUvY29yZS9QYWdlQ29udHJvbGxlclwiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgKiBhcyBDb3JlUGFzdGVIZWxwZXIgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvUGFzdGVIZWxwZXJcIjtcblxuZXhwb3J0IHR5cGUgY3VzdG9tVmFsaWRhdGlvbk1lc3NhZ2UgPSB7XG5cdG1lc3NhZ2VUZXh0Pzogc3RyaW5nO1xuXHRtZXNzYWdlVGFyZ2V0Pzogc3RyaW5nO1xufTtcblxuY29uc3QgZ2V0SW5mb0ZvckVudGl0eVByb3BlcnR5ID0gZnVuY3Rpb24gKHByb3BlcnR5UGF0aDogYW55LCByb3dCaW5kaW5nUGF0aDogYW55LCBtZXRhQ29udGV4dDogYW55LCBtZXRhTW9kZWw6IGFueSk6IGFueSB7XG5cdGNvbnN0IHByb3BlcnR5ID0gbWV0YUNvbnRleHQuZ2V0UHJvcGVydHkocHJvcGVydHlQYXRoKSxcblx0XHRmb3JtYXRPcHRpb25zID0geyBwYXJzZUtlZXBzRW1wdHlTdHJpbmc6IHRydWUgfSxcblx0XHR0eXBlID0gbWV0YU1vZGVsLmdldFVJNVR5cGUoYCR7cm93QmluZGluZ1BhdGh9LyR7cHJvcGVydHlQYXRofWAsIGZvcm1hdE9wdGlvbnMpLFxuXHRcdGlzSWdub3JlZCA9ICFwcm9wZXJ0eSB8fCBtZXRhQ29udGV4dC5nZXRQcm9wZXJ0eShgJHtwcm9wZXJ0eVBhdGh9QE9yZy5PRGF0YS5Db3JlLlYxLkNvbXB1dGVkYCk7XG5cdHJldHVybiB7XG5cdFx0cHJvcGVydHk6IHByb3BlcnR5UGF0aCxcblx0XHRpZ25vcmU6IGlzSWdub3JlZCxcblx0XHR0eXBlOiB0eXBlXG5cdH07XG59O1xuXG5jb25zdCBkaXNwbGF5RXJyb3JNZXNzYWdlcyA9IGZ1bmN0aW9uIChlcnJvck1lc3NhZ2VzOiBzdHJpbmdbXSk6IHZvaWQge1xuXHRjb25zdCBtZXNzYWdlRGV0YWlscyA9IFsuLi5lcnJvck1lc3NhZ2VzXTtcblx0Y29uc3QgcmVzb3VyY2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLFxuXHRcdGVycm9yQ29ycmVjdGlvbk1lc3NhZ2UgPSByZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19QQVNURV9IRUxQRVJfU0FQRkVfUEFTVEVfRVJST1JfQ09SUkVDVElPTl9NRVNTQUdFXCIpLFxuXHRcdG5vdGVNZXNzYWdlID0gcmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfUEFTVEVfSEVMUEVSX1NBUEZFX1BBU1RFX0VSUk9SX0NPUlJFQ1RJT05fTk9URVwiKTtcblx0bGV0IHBhc3RlRXJyb3JNZXNzYWdlO1xuXG5cdGlmIChtZXNzYWdlRGV0YWlscy5sZW5ndGggPiAxKSB7XG5cdFx0cGFzdGVFcnJvck1lc3NhZ2UgPSByZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiQ19QQVNURV9IRUxQRVJfU0FQRkVfUEFTVEVfRVJST1JfTUVTU0FHRV9QTFVSQUxcIiwgW21lc3NhZ2VEZXRhaWxzLmxlbmd0aF0pO1xuXHR9IGVsc2Uge1xuXHRcdHBhc3RlRXJyb3JNZXNzYWdlID0gcmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfUEFTVEVfSEVMUEVSX1NBUEZFX1BBU1RFX0VSUk9SX01FU1NBR0VfU0lOR1VMQVJcIik7XG5cdH1cblx0bWVzc2FnZURldGFpbHMudW5zaGlmdChcIlwiKTsgLy8gVG8gc2hvdyBzcGFjZSBiZXR3ZWVuIHRoZSBzaG9ydCB0ZXh0IGFuZCB0aGUgbGlzdCBvZiBlcnJvcnNcblx0bWVzc2FnZURldGFpbHMudW5zaGlmdChub3RlTWVzc2FnZSk7XG5cdG1lc3NhZ2VEZXRhaWxzLnVuc2hpZnQoZXJyb3JDb3JyZWN0aW9uTWVzc2FnZSk7XG5cdE1lc3NhZ2VCb3guZXJyb3IocGFzdGVFcnJvck1lc3NhZ2UsIHtcblx0XHR0aXRsZTogcmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfVElUTEVfRVJST1JcIiksXG5cdFx0ZGV0YWlsczogbWVzc2FnZURldGFpbHMuam9pbihcIjxicj5cIilcblx0fSk7XG59O1xuXG5jb25zdCBQYXN0ZUhlbHBlciA9IHtcblx0ZGlzcGxheUVycm9yTWVzc2FnZXM6IGRpc3BsYXlFcnJvck1lc3NhZ2VzLFxuXHRmb3JtYXRDdXN0b21NZXNzYWdlOiBmdW5jdGlvbiAodmFsaWRhdGlvbk1lc3NhZ2VzOiBjdXN0b21WYWxpZGF0aW9uTWVzc2FnZVtdLCBpUm93TnVtYmVyOiBudW1iZXIpOiBzdHJpbmcge1xuXHRcdGxldCBlcnJvck1lc3NhZ2UgPSBcIlwiO1xuXHRcdGNvbnN0IG51bWJlck1lc3NhZ2VzID0gdmFsaWRhdGlvbk1lc3NhZ2VzLmxlbmd0aDtcblx0XHRjb25zdCByZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIiksXG5cdFx0XHRpMThuUm93ID0gcmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9ST1dcIik7XG5cdFx0aWYgKG51bWJlck1lc3NhZ2VzID4gMCkge1xuXHRcdFx0ZXJyb3JNZXNzYWdlICs9IGAke2kxOG5Sb3d9ICR7aVJvd051bWJlcn06IGA7XG5cdFx0XHR2YWxpZGF0aW9uTWVzc2FnZXMuZm9yRWFjaCgobWVzc2FnZSwgaW5kZXhNZXNzYWdlKSA9PiB7XG5cdFx0XHRcdGlmIChtZXNzYWdlLm1lc3NhZ2VUZXh0KSB7XG5cdFx0XHRcdFx0ZXJyb3JNZXNzYWdlICs9IG1lc3NhZ2UubWVzc2FnZVRleHQgKyAoaW5kZXhNZXNzYWdlICsgMSAhPT0gbnVtYmVyTWVzc2FnZXMgPyBcIiBcIiA6IFwiXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGVycm9yTWVzc2FnZTtcblx0fSxcblx0Z2V0Q29sdW1uSW5mbzogZnVuY3Rpb24gKHRhYmxlOiBhbnkpOiBQcm9taXNlPGFueVtdPiB7XG5cdFx0Y29uc3QgbW9kZWwgPSB0YWJsZS5nZXRSb3dCaW5kaW5nKCkuZ2V0TW9kZWwoKSxcblx0XHRcdG1ldGFNb2RlbCA9IG1vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0cm93QmluZGluZ1BhdGggPSBtb2RlbC5yZXNvbHZlKHRhYmxlLmdldFJvd0JpbmRpbmcoKS5nZXRQYXRoKCksIHRhYmxlLmdldFJvd0JpbmRpbmcoKS5nZXRDb250ZXh0KCkpLFxuXHRcdFx0bWV0YUNvbnRleHQgPSBtZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQocm93QmluZGluZ1BhdGgpO1xuXHRcdHJldHVybiB0YWJsZVxuXHRcdFx0LmdldENvbnRyb2xEZWxlZ2F0ZSgpXG5cdFx0XHQuZmV0Y2hQcm9wZXJ0aWVzKHRhYmxlKVxuXHRcdFx0LnRoZW4oKHByb3BlcnR5SW5mbzogYW55KSA9PiB7XG5cdFx0XHRcdGNvbnN0IFByb3BlcnR5SW5mb0RpY3QgPSBPYmplY3QuYXNzaWduKHt9LCAuLi5wcm9wZXJ0eUluZm8ubWFwKChwcm9wZXJ0eTogYW55KSA9PiAoeyBbcHJvcGVydHkubmFtZV06IHByb3BlcnR5IH0pKSk7XG5cdFx0XHRcdGNvbnN0IGNvbHVtbkluZm9zOiBhbnlbXSA9IFtdO1xuXHRcdFx0XHR0YWJsZS5nZXRDb2x1bW5zKCkuZm9yRWFjaCgoY29sdW1uOiBhbnkpID0+IHtcblx0XHRcdFx0XHRjb25zdCBpbmZvUHJvcGVydHkgPSBQcm9wZXJ0eUluZm9EaWN0W2NvbHVtbi5nZXREYXRhUHJvcGVydHkoKV07XG5cdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgaXQncyBhIGNvbXBsZXggcHJvcGVydHkgKHByb3BlcnR5IGFzc29jaWF0ZWQgdG8gbXVsdGlwbGUgc2ltcGxlIHByb3BlcnRpZXMpXG5cdFx0XHRcdFx0aWYgKGluZm9Qcm9wZXJ0eS5wcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHRcdFx0XHQvLyBHZXQgZGF0YSBmcm9tIHNpbXBsZSBwcm9wZXJ0eVxuXHRcdFx0XHRcdFx0aW5mb1Byb3BlcnR5LnByb3BlcnR5SW5mb3MuZm9yRWFjaCgocHJvcGVydHk6IGFueSkgPT4ge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBkYXRhUHJvcGVydHkgPSBQcm9wZXJ0eUluZm9EaWN0W3Byb3BlcnR5XTtcblx0XHRcdFx0XHRcdFx0Ly8gTm9uIGV4cG9ydGVkIGNvbHVtbnMgc2hvdWxkIGJlIHBhcnQgb2YgdGhlIGNvbHVtbkluZm9zXG5cdFx0XHRcdFx0XHRcdGlmIChkYXRhUHJvcGVydHkuZXhwb3J0U2V0dGluZ3MgIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0XHQvLyBDaGVjayBpZiB0aGVyZSBpcyBhIHNpbXBsZSBwcm9wZXJ0eSBhc3NvY2lhdGVkIHRvIGEgUmF0aW5nIG9yIFByb2dyZXNzIENvbXBsZXhQcm9wZXJ0eSAtLT4gaWdub3JlXG5cdFx0XHRcdFx0XHRcdFx0Ly8gT3IgY2hlY2sgYSBuYXZpZ2F0aW9uIHByb3BlcnR5IHdpdGhpbiB0aGUgY3VycmVudCBDb21wbGV4IHByb3BlcnR5IC0tPiBpZ25vcmVcblx0XHRcdFx0XHRcdFx0XHQvLyBBIGZha2UgcHJvcGVydHkgd2FzIGNyZWF0ZWQgaW50byB0aGUgcHJvcGVydHlJbmZvcyB0byBpbmNsdWRlIHRoZSBUYXJnZXQgVmFsdWVcblx0XHRcdFx0XHRcdFx0XHQvLyBmcm9tIHRoZSBEYXRhUG9pbnQgKHBhdGggaW5jbHVkZXMgdGhlIEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnQgYW5ub3RhdGlvbilcblx0XHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0XHQoZGF0YVByb3BlcnR5ICYmIGRhdGFQcm9wZXJ0eS5wYXRoLmluZGV4T2YoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50XCIpID4gLTEpIHx8XG5cdFx0XHRcdFx0XHRcdFx0XHRwcm9wZXJ0eS5pbmRleE9mKFwiL1wiKSA+IC0xXG5cdFx0XHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb2x1bW5JbmZvcy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cHJvcGVydHk6IGRhdGFQcm9wZXJ0eS5wYXRoLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZ25vcmU6IHRydWVcblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb2x1bW5JbmZvcy5wdXNoKFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR0aGlzLmdldEluZm9Gb3JFbnRpdHlQcm9wZXJ0eShkYXRhUHJvcGVydHkucGF0aCwgcm93QmluZGluZ1BhdGgsIG1ldGFDb250ZXh0LCBtZXRhTW9kZWwpXG5cdFx0XHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChpbmZvUHJvcGVydHkuZXhwb3J0U2V0dGluZ3MgIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdGlmIChpbmZvUHJvcGVydHkucGF0aCkge1xuXHRcdFx0XHRcdFx0XHRjb2x1bW5JbmZvcy5wdXNoKHRoaXMuZ2V0SW5mb0ZvckVudGl0eVByb3BlcnR5KGluZm9Qcm9wZXJ0eS5wYXRoLCByb3dCaW5kaW5nUGF0aCwgbWV0YUNvbnRleHQsIG1ldGFNb2RlbCkpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Ly8gRW1wdHkgY29sdW1uIC0tPiBpZ25vcmVcblx0XHRcdFx0XHRcdFx0Y29sdW1uSW5mb3MucHVzaCh7XG5cdFx0XHRcdFx0XHRcdFx0cHJvcGVydHk6IFwidW51c2VkXCIsXG5cdFx0XHRcdFx0XHRcdFx0dHlwZTogbnVsbCxcblx0XHRcdFx0XHRcdFx0XHRpZ25vcmU6IHRydWVcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHRcdFx0cmV0dXJuIGNvbHVtbkluZm9zO1xuXHRcdFx0fSk7XG5cdH0sXG5cdGdldEluZm9Gb3JFbnRpdHlQcm9wZXJ0eTogZ2V0SW5mb0ZvckVudGl0eVByb3BlcnR5LFxuXG5cdHBhcnNlUGFzdGVkRGF0YTogZnVuY3Rpb24gKHJhd0RhdGE6IGFueSwgdGFibGU6IGFueSk6IFByb21pc2U8YW55W10+IHtcblx0XHRyZXR1cm4gdGhpcy5nZXRDb2x1bW5JbmZvKHRhYmxlKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHBhc3RlSW5mb3M6IGFueVtdKSB7XG5cdFx0XHRcdC8vIENoZWNrIGlmIHdlIGhhdmUgZGF0YSBmb3IgYXQgbGVhc3QgdGhlIGZpcnN0IGVkaXRhYmxlIGNvbHVtblxuXHRcdFx0XHRjb25zdCBwYXN0ZWRDb2x1bW5Db3VudCA9IHJhd0RhdGEubGVuZ3RoID8gcmF3RGF0YVswXS5sZW5ndGggOiAwO1xuXHRcdFx0XHRsZXQgZmlyc3RFZGl0YWJsZUNvbHVtbkluZGV4ID0gLTE7XG5cdFx0XHRcdGZvciAobGV0IEkgPSAwOyBJIDwgcGFzdGVJbmZvcy5sZW5ndGggJiYgZmlyc3RFZGl0YWJsZUNvbHVtbkluZGV4IDwgMDsgSSsrKSB7XG5cdFx0XHRcdFx0aWYgKCFwYXN0ZUluZm9zW0ldLmlnbm9yZSkge1xuXHRcdFx0XHRcdFx0Zmlyc3RFZGl0YWJsZUNvbHVtbkluZGV4ID0gSTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGZpcnN0RWRpdGFibGVDb2x1bW5JbmRleCA8IDAgfHwgZmlyc3RFZGl0YWJsZUNvbHVtbkluZGV4ID4gcGFzdGVkQ29sdW1uQ291bnQgLSAxXG5cdFx0XHRcdFx0PyBQcm9taXNlLnJlc29sdmUoe30pIC8vIFdlIGRvbid0IGhhdmUgZGF0YSBmb3IgYW4gZWRpdGFibGUgY29sdW1uIC0tPiByZXR1cm4gZW1wdHkgcGFyc2VkIGRhdGFcblx0XHRcdFx0XHQ6IChDb3JlUGFzdGVIZWxwZXIgYXMgYW55KS5wYXJzZShyYXdEYXRhLCBwYXN0ZUluZm9zKTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbigocGFyc2VSZXN1bHQ6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAocGFyc2VSZXN1bHQuZXJyb3JzKSB7XG5cdFx0XHRcdFx0Y29uc3QgZXJyb3JNZXNzYWdlcyA9IHBhcnNlUmVzdWx0LmVycm9ycy5tYXAoZnVuY3Rpb24gKG9FbGVtZW50OiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvRWxlbWVudC5tZXNzYWdlO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdHRoaXMuZGlzcGxheUVycm9yTWVzc2FnZXMoZXJyb3JNZXNzYWdlcyk7XG5cdFx0XHRcdFx0cmV0dXJuIFtdOyAvLyBFcnJvcnMgLS0+IHJldHVybiBub3RoaW5nXG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIHBhcnNlUmVzdWx0LnBhcnNlZERhdGEgPyBwYXJzZVJlc3VsdC5wYXJzZWREYXRhIDogW107XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHR9LFxuXHRwYXN0ZURhdGE6IGZ1bmN0aW9uIChyYXdEYXRhOiBhbnksIHRhYmxlOiBhbnksIGNvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyKTogUHJvbWlzZTxhbnk+IHtcblx0XHRjb25zdCBvSW50ZXJuYWxFZGl0RmxvdyA9IChjb250cm9sbGVyIGFzIGFueSkuX2VkaXRGbG93O1xuXHRcdGNvbnN0IHRhYmxlRGVmaW5pdGlvbiA9IHRhYmxlLmdldFBhcmVudCgpLmdldFRhYmxlRGVmaW5pdGlvbigpO1xuXHRcdGxldCBhRGF0YTogYW55W10gPSBbXTtcblx0XHRyZXR1cm4gdGhpcy5wYXJzZVBhc3RlZERhdGEocmF3RGF0YSwgdGFibGUpXG5cdFx0XHQudGhlbigoYVBhcnNlZERhdGEpID0+IHtcblx0XHRcdFx0YURhdGEgPSBhUGFyc2VkRGF0YSB8fCBbXTtcblx0XHRcdFx0cmV0dXJuIFByb21pc2UuYWxsKFxuXHRcdFx0XHRcdGFEYXRhLm1hcCgobURhdGEpID0+XG5cdFx0XHRcdFx0XHRvSW50ZXJuYWxFZGl0Rmxvdy5nZXRUcmFuc2FjdGlvbkhlbHBlcigpLnZhbGlkYXRlRG9jdW1lbnQoXG5cdFx0XHRcdFx0XHRcdHRhYmxlLmdldEJpbmRpbmdDb250ZXh0KCksXG5cdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRkYXRhOiBtRGF0YSxcblx0XHRcdFx0XHRcdFx0XHRjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb246IHRhYmxlRGVmaW5pdGlvbj8uY29udHJvbD8uY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uXG5cdFx0XHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0XHRcdGNvbnRyb2xsZXIuZ2V0VmlldygpXG5cdFx0XHRcdFx0XHQpXG5cdFx0XHRcdFx0KVxuXHRcdFx0XHQpO1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKChhVmFsaWRhdGlvbk1lc3NhZ2VzKSA9PiB7XG5cdFx0XHRcdGNvbnN0IGFFcnJvck1lc3NhZ2VzID0gYVZhbGlkYXRpb25NZXNzYWdlcy5yZWR1Y2UoZnVuY3Rpb24gKGFNZXNzYWdlcywgYUN1c3RvbU1lc3NhZ2VzLCBpbmRleCkge1xuXHRcdFx0XHRcdGlmIChhQ3VzdG9tTWVzc2FnZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0YU1lc3NhZ2VzLnB1c2goeyBtZXNzYWdlczogYUN1c3RvbU1lc3NhZ2VzLCByb3c6IGluZGV4ICsgMSB9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIGFNZXNzYWdlcztcblx0XHRcdFx0fSwgW10pO1xuXHRcdFx0XHRpZiAoYUVycm9yTWVzc2FnZXMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdGNvbnN0IGFSb3dNZXNzYWdlcyA9IGFFcnJvck1lc3NhZ2VzLm1hcCgobUVycm9yOiBhbnkpID0+IHRoaXMuZm9ybWF0Q3VzdG9tTWVzc2FnZShtRXJyb3IubWVzc2FnZXMsIG1FcnJvci5yb3cpKTtcblx0XHRcdFx0XHR0aGlzLmRpc3BsYXlFcnJvck1lc3NhZ2VzKGFSb3dNZXNzYWdlcyk7XG5cdFx0XHRcdFx0cmV0dXJuIFtdO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBhRGF0YTtcblx0XHRcdH0pXG5cdFx0XHQudGhlbigoYVZhbGlkYXRlZERhdGEpID0+IHtcblx0XHRcdFx0cmV0dXJuIGFWYWxpZGF0ZWREYXRhLmxlbmd0aCA+IDBcblx0XHRcdFx0XHQ/IG9JbnRlcm5hbEVkaXRGbG93LmNyZWF0ZU11bHRpcGxlRG9jdW1lbnRzKFxuXHRcdFx0XHRcdFx0XHR0YWJsZS5nZXRSb3dCaW5kaW5nKCksXG5cdFx0XHRcdFx0XHRcdGFWYWxpZGF0ZWREYXRhLFxuXHRcdFx0XHRcdFx0XHR0YWJsZURlZmluaXRpb24/LmNvbnRyb2w/LmNyZWF0ZUF0RW5kLFxuXHRcdFx0XHRcdFx0XHR0cnVlLFxuXHRcdFx0XHRcdFx0XHQoY29udHJvbGxlciBhcyBhbnkpLmVkaXRGbG93Lm9uQmVmb3JlQ3JlYXRlXG5cdFx0XHRcdFx0ICApXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHR9KVxuXHRcdFx0LmNhdGNoKChvRXJyb3IpID0+IHtcblx0XHRcdFx0TG9nLmVycm9yKFwiRXJyb3Igd2hpbGUgcGFzdGluZyBkYXRhXCIsIG9FcnJvcik7XG5cdFx0XHR9KTtcblx0fVxufTtcblxuZXhwb3J0IGRlZmF1bHQgUGFzdGVIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7RUFXQSxJQUFNQSx3QkFBd0IsR0FBRyxVQUFVQyxZQUFpQixFQUFFQyxjQUFtQixFQUFFQyxXQUFnQixFQUFFQyxTQUFjLEVBQU87SUFDekgsSUFBTUMsUUFBUSxHQUFHRixXQUFXLENBQUNHLFdBQVcsQ0FBQ0wsWUFBWSxDQUFDO01BQ3JETSxhQUFhLEdBQUc7UUFBRUMscUJBQXFCLEVBQUU7TUFBSyxDQUFDO01BQy9DQyxJQUFJLEdBQUdMLFNBQVMsQ0FBQ00sVUFBVSxXQUFJUixjQUFjLGNBQUlELFlBQVksR0FBSU0sYUFBYSxDQUFDO01BQy9FSSxTQUFTLEdBQUcsQ0FBQ04sUUFBUSxJQUFJRixXQUFXLENBQUNHLFdBQVcsV0FBSUwsWUFBWSxpQ0FBOEI7SUFD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