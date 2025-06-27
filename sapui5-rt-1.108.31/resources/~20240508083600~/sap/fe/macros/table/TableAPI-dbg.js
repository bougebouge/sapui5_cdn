/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/converters/ManifestSettings", "sap/fe/core/helpers/ClassSupport", "sap/fe/core/helpers/PasteHelper", "sap/fe/macros/DelegateUtil", "sap/fe/macros/filter/FilterUtils", "sap/fe/macros/table/Utils", "sap/m/MessageBox", "sap/ui/core/message/Message", "../MacroAPI"], function (Log, CommonUtils, ManifestSettings, ClassSupport, PasteHelper, DelegateUtil, FilterUtils, TableUtils, MessageBox, Message, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _dec13, _dec14, _dec15, _dec16, _dec17, _dec18, _dec19, _dec20, _dec21, _dec22, _dec23, _dec24, _dec25, _dec26, _dec27, _dec28, _dec29, _dec30, _dec31, _dec32, _dec33, _dec34, _dec35, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10, _descriptor11, _descriptor12, _descriptor13, _descriptor14, _descriptor15, _descriptor16, _descriptor17, _descriptor18, _descriptor19, _descriptor20, _descriptor21, _descriptor22, _descriptor23, _descriptor24, _descriptor25, _descriptor26;
  var xmlEventHandler = ClassSupport.xmlEventHandler;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var CreationMode = ManifestSettings.CreationMode;
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
  function _finallyRethrows(body, finalizer) {
    try {
      var result = body();
    } catch (e) {
      return finalizer(true, e);
    }
    if (result && result.then) {
      return result.then(finalizer.bind(null, false), finalizer.bind(null, true));
    }
    return finalizer(false, result);
  }
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Building block used to create a table based on the metadata provided by OData V4.
   * <br>
   * Usually, a LineItem or PresentationVariant annotation is expected, but the Table building block can also be used to display an EntitySet.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Table id="MyTable" metaPath="@com.sap.vocabularies.UI.v1.LineItem" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Table
   * @public
   */
  var TableAPI = (_dec = defineUI5Class("sap.fe.macros.table.TableAPI"), _dec2 = property({
    type: "string",
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
    expectedAnnotations: ["com.sap.vocabularies.UI.v1.LineItem", "com.sap.vocabularies.UI.v1.PresentationVariant", "com.sap.vocabularies.UI.v1.SelectionPresentationVariant"]
  }), _dec3 = property({
    type: "sap.ui.model.Context"
  }), _dec4 = property({
    type: "boolean"
  }), _dec5 = property({
    type: "string"
  }), _dec6 = property({
    type: "boolean",
    defaultValue: false
  }), _dec7 = property({
    type: "string",
    defaultValue: "ResponsiveTable"
  }), _dec8 = property({
    type: "boolean",
    defaultValue: true
  }), _dec9 = property({
    type: "boolean",
    defaultValue: false
  }), _dec10 = property({
    type: "boolean",
    defaultValue: false
  }), _dec11 = property({
    type: "string"
  }), _dec12 = property({
    type: "string"
  }), _dec13 = property({
    type: "string"
  }), _dec14 = property({
    type: "boolean",
    defaultValue: false
  }), _dec15 = property({
    type: "boolean",
    defaultValue: true
  }), _dec16 = property({
    type: "boolean",
    defaultValue: false
  }), _dec17 = property({
    type: "boolean",
    defaultValue: false
  }), _dec18 = property({
    type: "boolean",
    defaultValue: false
  }), _dec19 = property({
    type: "boolean",
    defaultValue: false
  }), _dec20 = event(), _dec21 = event(), _dec22 = event(), _dec23 = property({
    type: "boolean|string",
    defaultValue: true
  }), _dec24 = property({
    type: "string"
  }), _dec25 = property({
    type: "string"
  }), _dec26 = property({
    type: "boolean",
    defaultValue: true
  }), _dec27 = event(), _dec28 = xmlEventHandler(), _dec29 = xmlEventHandler(), _dec30 = xmlEventHandler(), _dec31 = xmlEventHandler(), _dec32 = xmlEventHandler(), _dec33 = xmlEventHandler(), _dec34 = xmlEventHandler(), _dec35 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(TableAPI, _MacroAPI);
    function TableAPI(mSettings) {
      var _this;
      for (var _len = arguments.length, others = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        others[_key - 1] = arguments[_key];
      }
      _this = _MacroAPI.call.apply(_MacroAPI, [this, mSettings].concat(others)) || this;
      _initializerDefineProperty(_this, "metaPath", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "tableDefinition", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "busy", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "type", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableExport", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enablePaste", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableFullScreen", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "filterBar", _descriptor10, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionMode", _descriptor11, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "header", _descriptor12, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "enableAutoColumnWidth", _descriptor13, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "headerVisible", _descriptor14, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "dataInitialized", _descriptor15, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "bindingSuspended", _descriptor16, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "outDatedBinding", _descriptor17, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "pendingRequest", _descriptor18, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "rowPress", _descriptor19, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "stateChange", _descriptor20, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "internalDataRequested", _descriptor21, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "personalization", _descriptor22, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "variantManagement", _descriptor23, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "menu", _descriptor24, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "isSearchable", _descriptor25, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "selectionChange", _descriptor26, _assertThisInitialized(_this));
      _this.updateFilterBar();
      if (_this.content) {
        _this.content.attachEvent("selectionChange", {}, _this.onTableSelectionChange, _assertThisInitialized(_this));
      }
      return _this;
    }

    /**
     * Defines the relative path of the property in the metamodel, based on the current contextPath.
     *
     * @public
     */
    var _proto = TableAPI.prototype;
    /**
     * Gets contexts from the table that have been selected by the user.
     *
     * @returns Contexts of the rows selected by the user
     * @public
     */
    _proto.getSelectedContexts = function getSelectedContexts() {
      return this.content.getSelectedContexts();
    }

    /**
     * Adds a message to the table.
     *
     * The message applies to the whole table and not to an individual table row.
     *
     * @param [parameters] The parameters to create the message
     * @param parameters.type Message type
     * @param parameters.message Message text
     * @param parameters.description Message description
     * @param parameters.persistent True if the message is persistent
     * @returns The ID of the message
     * @public
     */;
    _proto.addMessage = function addMessage(parameters) {
      var msgManager = this._getMessageManager();
      var oTable = this.content;
      var oMessage = new Message({
        target: oTable.getRowBinding().getResolvedPath(),
        type: parameters.type,
        message: parameters.message,
        processor: oTable.getModel(),
        description: parameters.description,
        persistent: parameters.persistent
      });
      msgManager.addMessages(oMessage);
      return oMessage.getId();
    }

    /**
     * Removes a message from the table.
     *
     * @param id The id of the message
     * @public
     */;
    _proto.removeMessage = function removeMessage(id) {
      var msgManager = this._getMessageManager();
      var messages = msgManager.getMessageModel().getData();
      var result = messages.find(function (e) {
        return e.id === id;
      });
      if (result) {
        msgManager.removeMessages(result);
      }
    };
    _proto._getMessageManager = function _getMessageManager() {
      return sap.ui.getCore().getMessageManager();
    }

    /**
     * An event triggered when the selection in the table changes.
     *
     * @public
     */;
    _proto._getRowBinding = function _getRowBinding() {
      var oTable = this.getContent();
      return oTable.getRowBinding();
    };
    _proto.getCounts = function getCounts() {
      var oTable = this.getContent();
      return TableUtils.getListBindingForCount(oTable, oTable.getBindingContext(), {
        batchGroupId: !this.getProperty("bindingSuspended") ? oTable.data("batchGroupId") : "$auto",
        additionalFilters: TableUtils.getHiddenFilters(oTable)
      }).then(function (iValue) {
        return TableUtils.getCountFormatted(iValue);
      }).catch(function () {
        return "0";
      });
    };
    _proto.onTableRowPress = function onTableRowPress(oEvent, oController, oContext, mParameters) {
      // prevent navigation to an empty row
      if (oContext && oContext.isInactive() && oContext.isTransient()) {
        return false;
      }
      // In the case of an analytical table, if we're trying to navigate to a context corresponding to a visual group or grand total
      // --> Cancel navigation
      if (oContext && oContext.isA("sap.ui.model.odata.v4.Context") && typeof oContext.getProperty("@$ui5.node.isExpanded") === "boolean") {
        return false;
      } else {
        oController._routing.navigateForwardToContext(oContext, mParameters);
      }
    };
    _proto.onInternalDataReceived = function onInternalDataReceived(oEvent) {
      if (oEvent.getParameter("error")) {
        this.getController().messageHandler.showMessageDialog();
      }
    };
    _proto.onInternalDataRequested = function onInternalDataRequested(oEvent) {
      this.setProperty("dataInitialized", true);
      this.fireEvent("internalDataRequested", oEvent.getParameters());
    };
    _proto.onPaste = function onPaste(oEvent, oController) {
      // If paste is disable or if we're not in edit mode, we can't paste anything
      if (!this.tableDefinition.control.enablePaste || !this.getModel("ui").getProperty("/isEditable")) {
        return;
      }
      var aRawPastedData = oEvent.getParameter("data"),
        oTable = oEvent.getSource();
      if (oTable.getEnablePaste() === true) {
        PasteHelper.pasteData(aRawPastedData, oTable, oController);
      } else {
        var oResourceModel = sap.ui.getCore().getLibraryResourceBundle("sap.fe.core");
        MessageBox.error(oResourceModel.getText("T_OP_CONTROLLER_SAPFE_PASTE_DISABLED_MESSAGE"), {
          title: oResourceModel.getText("C_COMMON_SAPFE_ERROR")
        });
      }
    }

    // This event will allow us to intercept the export before is triggered to cover specific cases
    // that couldn't be addressed on the propertyInfos for each column.
    // e.g. Fixed Target Value for the datapoints
    ;
    _proto.onBeforeExport = function onBeforeExport(oEvent) {
      var isSplitMode = oEvent.getParameters().userExportSettings.splitCells,
        oTableController = oEvent.getSource(),
        oExportSettings = oEvent.getParameters().exportSettings,
        oTableColumns = this.tableDefinition.columns;
      TableAPI.updateExportSettings(oExportSettings, oTableColumns, oTableController, isSplitMode);
    }

    /**
     * Handles the MDC DataStateIndicator plugin to display messageStrip on a table.
     *
     * @param oMessage
     * @param oTable
     * @name dataStateFilter
     * @returns Whether to render visible the messageStrip
     */;
    TableAPI.dataStateIndicatorFilter = function dataStateIndicatorFilter(oMessage, oTable) {
      var _oTable$getBindingCon;
      var sTableContextBindingPath = (_oTable$getBindingCon = oTable.getBindingContext()) === null || _oTable$getBindingCon === void 0 ? void 0 : _oTable$getBindingCon.getPath();
      var sTableRowBinding = (sTableContextBindingPath ? "".concat(sTableContextBindingPath, "/") : "") + oTable.getRowBinding().getPath();
      return sTableRowBinding === oMessage.getTarget() ? true : false;
    }

    /**
     * This event handles the DataState of the DataStateIndicator plugin from MDC on a table.
     * It's fired when new error messages are sent from the backend to update row highlighting.
     *
     * @name onDataStateChange
     * @param oEvent Event object
     */;
    _proto.onDataStateChange = function onDataStateChange(oEvent) {
      var oDataStateIndicator = oEvent.getSource();
      var aFilteredMessages = oEvent.getParameter("filteredMessages");
      if (aFilteredMessages) {
        var oInternalModel = oDataStateIndicator.getModel("internal");
        oInternalModel.setProperty("filteredMessages", aFilteredMessages, oDataStateIndicator.getBindingContext("internal"));
      }
    };
    TableAPI.updateExportSettings = function updateExportSettings(exportSettings, columns, tableController, isSplitMode) {
      var _exportSettings$workb;
      var refColumn = null;
      var additionalPropertyIndex;

      //Set static sizeLimit during export
      exportSettings.dataSource.sizeLimit = 1000;
      var exportColumns = (_exportSettings$workb = exportSettings.workbook) === null || _exportSettings$workb === void 0 ? void 0 : _exportSettings$workb.columns;
      exportColumns.forEach(function (columnExport) {
        columnExport.label = DelegateUtil.getLocalizedText(columnExport.label, tableController);
        columns === null || columns === void 0 ? void 0 : columns.forEach(function (col) {
          var column = col;
          if (isSplitMode) {
            var _refColumn;
            //Add TargetValue on dummy created property when exporting on split mode
            if (column.isDataPointFakeTargetProperty && column.relativePath === columnExport.property) {
              columnExport.property = [columnExport.property];
            }
            // Modify duplicate labels from splitted columns
            var regex = /(.*)-additionalProperty(\d+)/.exec(columnExport.columnId);
            if (regex === null) {
              additionalPropertyIndex = 1;
              refColumn = columnExport;
            } else if (regex[1] === ((_refColumn = refColumn) === null || _refColumn === void 0 ? void 0 : _refColumn.columnId)) {
              columnExport.label = columnExport.label === refColumn.label ? "".concat(refColumn.label, " (").concat(++additionalPropertyIndex, ")") : columnExport.label;
            }
          }
          TableAPI.updateExportTypeOnTextOnlyProperties(column, columnExport, columns);
        });
        //translate boolean values
        if (columnExport.type === "Boolean") {
          var resourceModel = sap.ui.getCore().getLibraryResourceBundle("sap.fe.macros");
          columnExport.falseValue = resourceModel.getText("no");
          columnExport.trueValue = resourceModel.getText("yes");
        }
      });
      return exportSettings;
    }

    /**
     * Update the export type of the column in case there is only one child property to use the export type of the child property.
     *
     * @param column Column from table converter
     * @param columnExport Column to be exported
     * @param annotationColumns Column list from the table converter
     * @private
     */;
    TableAPI.updateExportTypeOnTextOnlyProperties = function updateExportTypeOnTextOnlyProperties(column, columnExport, annotationColumns) {
      var _column$propertyInfos;
      // This applies to the text only annotation, use the export type of the text property instead of the value.
      // There are 3 columns to be considered to update the export type on the child property
      if (((_column$propertyInfos = column.propertyInfos) === null || _column$propertyInfos === void 0 ? void 0 : _column$propertyInfos.length) === 1 && columnExport.property.length === 1 && column.propertyInfos[0] === columnExport.property[0]) {
        var _exportSettings;
        // First column considered as complex and pointing to a single child property
        var columnFromAnnotationColumns = annotationColumns.find(
        // Second column referenced as a child property from the found complex column
        function (col) {
          return col.relativePath === columnExport.property[0];
        });
        // Assign to the column to be exported (third column), the property type of the child property
        columnExport.type = columnFromAnnotationColumns === null || columnFromAnnotationColumns === void 0 ? void 0 : (_exportSettings = columnFromAnnotationColumns.exportSettings) === null || _exportSettings === void 0 ? void 0 : _exportSettings.type;
      }
    };
    _proto.resumeBinding = function resumeBinding(bRequestIfNotInitialized) {
      this.setProperty("bindingSuspended", false);
      if (bRequestIfNotInitialized && !this.getDataInitialized() || this.getProperty("outDatedBinding")) {
        var _getContent;
        this.setProperty("outDatedBinding", false);
        (_getContent = this.getContent()) === null || _getContent === void 0 ? void 0 : _getContent.rebind();
      }
    };
    _proto.refreshNotApplicableFields = function refreshNotApplicableFields(oFilterControl) {
      var oTable = this.getContent();
      return FilterUtils.getNotApplicableFilters(oFilterControl, oTable);
    };
    _proto.suspendBinding = function suspendBinding() {
      this.setProperty("bindingSuspended", true);
    };
    _proto.invalidateContent = function invalidateContent() {
      this.setProperty("dataInitialized", false);
      this.setProperty("outDatedBinding", false);
    };
    _proto.onMassEditButtonPressed = function onMassEditButtonPressed(oEvent, pageController) {
      var oTable = this.content;
      if (pageController && pageController.massEdit) {
        pageController.massEdit.openMassEditDialog(oTable);
      } else {
        Log.warning("The Controller is not enhanced with Mass Edit functionality");
      }
    };
    _proto.onTableSelectionChange = function onTableSelectionChange(oEvent) {
      this.fireEvent("selectionChange", oEvent.getParameters());
    }

    /**
     * Expose the internal table definition for external usage in delegate.
     *
     * @returns The tableDefinition
     */;
    _proto.getTableDefinition = function getTableDefinition() {
      return this.tableDefinition;
    }

    /**
     * connect the filter to the tableAPI if required
     *
     * @private
     * @alias sap.fe.macros.TableAPI
     */;
    _proto.updateFilterBar = function updateFilterBar() {
      var table = this.getContent();
      var filterBarRefId = this.getFilterBar();
      if (table && filterBarRefId && table.getFilter() !== filterBarRefId) {
        this._setFilterBar(filterBarRefId);
      }
    }

    /**
     * Sets the filter depending on the type of filterBar.
     *
     * @param filterBarRefId Id of the filter bar
     * @private
     * @alias sap.fe.macros.TableAPI
     */;
    _proto._setFilterBar = function _setFilterBar(filterBarRefId) {
      var _CommonUtils$getTarge;
      var table = this.getContent();
      var core = sap.ui.getCore();

      // 'filterBar' property of macro:Table(passed as customData) might be
      // 1. A localId wrt View(FPM explorer example).
      // 2. Absolute Id(this was not supported in older versions).
      // 3. A localId wrt FragmentId(when an XMLComposite or Fragment is independently processed) instead of ViewId.
      //    'filterBar' was supported earlier as an 'association' to the 'mdc:Table' control inside 'macro:Table' in prior versions.
      //    In newer versions 'filterBar' is used like an association to 'macro:TableAPI'.
      //    This means that the Id is relative to 'macro:TableAPI'.
      //    This scenario happens in case of FilterBar and Table in a custom sections in OP of FEV4.

      var tableAPIId = this === null || this === void 0 ? void 0 : this.getId();
      var tableAPILocalId = this.data("tableAPILocalId");
      var potentialfilterBarId = tableAPILocalId && filterBarRefId && tableAPIId && tableAPIId.replace(new RegExp(tableAPILocalId + "$"), filterBarRefId); // 3

      var filterBar = ((_CommonUtils$getTarge = CommonUtils.getTargetView(this)) === null || _CommonUtils$getTarge === void 0 ? void 0 : _CommonUtils$getTarge.byId(filterBarRefId)) || core.byId(filterBarRefId) || core.byId(potentialfilterBarId);
      if (filterBar) {
        if (filterBar.isA("sap.fe.macros.filterBar.FilterBarAPI")) {
          table.setFilter("".concat(filterBar.getId(), "-content"));
        } else if (filterBar.isA("sap.ui.mdc.FilterBar")) {
          table.setFilter(filterBar.getId());
        }
      }
    };
    _proto.checkIfColumnExists = function checkIfColumnExists(aFilteredColummns, columnName) {
      return aFilteredColummns.some(function (oColumn) {
        if ((oColumn === null || oColumn === void 0 ? void 0 : oColumn.columnName) === columnName && oColumn !== null && oColumn !== void 0 && oColumn.sColumnNameVisible || (oColumn === null || oColumn === void 0 ? void 0 : oColumn.sTextArrangement) !== undefined && (oColumn === null || oColumn === void 0 ? void 0 : oColumn.sTextArrangement) === columnName) {
          return columnName;
        }
      });
    };
    _proto.getIdentifierColumn = function getIdentifierColumn() {
      var oTable = this.getContent();
      var headerInfoTitlePath = this.getTableDefinition().headerInfoTitle;
      var oMetaModel = oTable && oTable.getModel().getMetaModel(),
        sCurrentEntitySetName = oTable.data("metaPath");
      var aTechnicalKeys = oMetaModel.getObject("".concat(sCurrentEntitySetName, "/$Type/$Key"));
      var aFilteredTechnicalKeys = [];
      if (aTechnicalKeys && aTechnicalKeys.length > 0) {
        aTechnicalKeys.forEach(function (technicalKey) {
          if (technicalKey !== "IsActiveEntity") {
            aFilteredTechnicalKeys.push(technicalKey);
          }
        });
      }
      var semanticKeyColumns = this.getTableDefinition().semanticKeys;
      var aVisibleColumns = [];
      var aFilteredColummns = [];
      var aTableColumns = oTable.getColumns();
      aTableColumns.forEach(function (oColumn) {
        var column = oColumn === null || oColumn === void 0 ? void 0 : oColumn.getDataProperty();
        aVisibleColumns.push(column);
      });
      aVisibleColumns.forEach(function (oColumn) {
        var _oTextArrangement$Co, _oTextArrangement$Co2;
        var oTextArrangement = oMetaModel.getObject("".concat(sCurrentEntitySetName, "/$Type/").concat(oColumn, "@"));
        var sTextArrangement = oTextArrangement && ((_oTextArrangement$Co = oTextArrangement["@com.sap.vocabularies.Common.v1.Text"]) === null || _oTextArrangement$Co === void 0 ? void 0 : _oTextArrangement$Co.$Path);
        var sTextPlacement = oTextArrangement && ((_oTextArrangement$Co2 = oTextArrangement["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]) === null || _oTextArrangement$Co2 === void 0 ? void 0 : _oTextArrangement$Co2.$EnumMember);
        aFilteredColummns.push({
          columnName: oColumn,
          sTextArrangement: sTextArrangement,
          sColumnNameVisible: !(sTextPlacement === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly")
        });
      });
      var column;
      if (headerInfoTitlePath !== undefined && this.checkIfColumnExists(aFilteredColummns, headerInfoTitlePath)) {
        column = headerInfoTitlePath;
      } else if (semanticKeyColumns !== undefined && semanticKeyColumns.length === 1 && this.checkIfColumnExists(aFilteredColummns, semanticKeyColumns[0])) {
        column = semanticKeyColumns[0];
      } else if (aFilteredTechnicalKeys !== undefined && aFilteredTechnicalKeys.length === 1 && this.checkIfColumnExists(aFilteredColummns, aFilteredTechnicalKeys[0])) {
        column = aFilteredTechnicalKeys[0];
      }
      return column;
    };
    _proto.setUpEmptyRows = function setUpEmptyRows(oTable) {
      try {
        var _this3$tableDefinitio;
        var _this3 = this;
        if (((_this3$tableDefinitio = _this3.tableDefinition.control) === null || _this3$tableDefinitio === void 0 ? void 0 : _this3$tableDefinitio.creationMode) !== CreationMode.InlineCreationRows) {
          return Promise.resolve();
        }
        var pWaitTableRendered = new Promise(function (resolve) {
          if (oTable.getDomRef()) {
            resolve();
          } else {
            var delegate = {
              onAfterRendering: function () {
                oTable.removeEventDelegate(delegate);
                resolve();
              }
            };
            oTable.addEventDelegate(delegate, _this3);
          }
        });
        return Promise.resolve(pWaitTableRendered).then(function () {
          var bIsInEditMode = oTable.getModel("ui").getProperty("/isEditable");
          if (!bIsInEditMode) {
            return;
          }
          var oBinding = oTable.getRowBinding();
          var _temp2 = function () {
            if (oBinding.isResolved() && oBinding.isLengthFinal()) {
              var sContextPath = oBinding.getContext().getPath();
              var oInactiveContext = oBinding.getAllCurrentContexts().find(function (oContext) {
                return oContext.isInactive() && oContext.getPath().startsWith(sContextPath);
              });
              var _temp3 = function () {
                if (!oInactiveContext) {
                  return Promise.resolve(_this3._createEmptyRow(oBinding, oTable)).then(function () {});
                }
              }();
              if (_temp3 && _temp3.then) return _temp3.then(function () {});
            }
          }();
          if (_temp2 && _temp2.then) return _temp2.then(function () {});
        });
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._createEmptyRow = function _createEmptyRow(oBinding, oTable) {
      try {
        var _this5$tableDefinitio;
        var _this5 = this;
        var iInlineCreationRowCount = ((_this5$tableDefinitio = _this5.tableDefinition.control) === null || _this5$tableDefinitio === void 0 ? void 0 : _this5$tableDefinitio.inlineCreationRowCount) || 2;
        var aData = [];
        for (var i = 0; i < iInlineCreationRowCount; i += 1) {
          aData.push({});
        }
        var bAtEnd = oTable.data("tableType") !== "ResponsiveTable";
        var bInactive = true;
        var oView = CommonUtils.getTargetView(oTable);
        var oController = oView.getController();
        var oInternalEditFlow = oController._editFlow;
        var _temp6 = function () {
          if (!_this5.creatingEmptyRows) {
            _this5.creatingEmptyRows = true;
            var _temp7 = _finallyRethrows(function () {
              return _catch(function () {
                return Promise.resolve(oInternalEditFlow.createMultipleDocuments(oBinding, aData, bAtEnd, false, oController.editFlow.onBeforeCreate, bInactive)).then(function (aContexts) {
                  aContexts === null || aContexts === void 0 ? void 0 : aContexts.forEach(function (oContext) {
                    oContext.created().catch(function (oError) {
                      if (!oError.canceled) {
                        throw oError;
                      }
                    });
                  });
                });
              }, function (e) {
                Log.error(e);
              });
            }, function (_wasThrown, _result) {
              _this5.creatingEmptyRows = false;
              if (_wasThrown) throw _result;
              return _result;
            });
            if (_temp7 && _temp7.then) return _temp7.then(function () {});
          }
        }();
        return Promise.resolve(_temp6 && _temp6.then ? _temp6.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    return TableAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "tableDefinition", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "busy", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "type", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "enableExport", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "enablePaste", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "enableFullScreen", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "filterBar", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor11 = _applyDecoratedDescriptor(_class2.prototype, "selectionMode", [_dec12], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor12 = _applyDecoratedDescriptor(_class2.prototype, "header", [_dec13], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor13 = _applyDecoratedDescriptor(_class2.prototype, "enableAutoColumnWidth", [_dec14], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor14 = _applyDecoratedDescriptor(_class2.prototype, "headerVisible", [_dec15], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor15 = _applyDecoratedDescriptor(_class2.prototype, "dataInitialized", [_dec16], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor16 = _applyDecoratedDescriptor(_class2.prototype, "bindingSuspended", [_dec17], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor17 = _applyDecoratedDescriptor(_class2.prototype, "outDatedBinding", [_dec18], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor18 = _applyDecoratedDescriptor(_class2.prototype, "pendingRequest", [_dec19], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor19 = _applyDecoratedDescriptor(_class2.prototype, "rowPress", [_dec20], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor20 = _applyDecoratedDescriptor(_class2.prototype, "stateChange", [_dec21], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor21 = _applyDecoratedDescriptor(_class2.prototype, "internalDataRequested", [_dec22], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor22 = _applyDecoratedDescriptor(_class2.prototype, "personalization", [_dec23], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor23 = _applyDecoratedDescriptor(_class2.prototype, "variantManagement", [_dec24], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor24 = _applyDecoratedDescriptor(_class2.prototype, "menu", [_dec25], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor25 = _applyDecoratedDescriptor(_class2.prototype, "isSearchable", [_dec26], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor26 = _applyDecoratedDescriptor(_class2.prototype, "selectionChange", [_dec27], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "onTableRowPress", [_dec28], Object.getOwnPropertyDescriptor(_class2.prototype, "onTableRowPress"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInternalDataReceived", [_dec29], Object.getOwnPropertyDescriptor(_class2.prototype, "onInternalDataReceived"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onInternalDataRequested", [_dec30], Object.getOwnPropertyDescriptor(_class2.prototype, "onInternalDataRequested"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onPaste", [_dec31], Object.getOwnPropertyDescriptor(_class2.prototype, "onPaste"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onBeforeExport", [_dec32], Object.getOwnPropertyDescriptor(_class2.prototype, "onBeforeExport"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onDataStateChange", [_dec33], Object.getOwnPropertyDescriptor(_class2.prototype, "onDataStateChange"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onMassEditButtonPressed", [_dec34], Object.getOwnPropertyDescriptor(_class2.prototype, "onMassEditButtonPressed"), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, "onTableSelectionChange", [_dec35], Object.getOwnPropertyDescriptor(_class2.prototype, "onTableSelectionChange"), _class2.prototype)), _class2)) || _class);
  return TableAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiZmluYWxpemVyIiwiYmluZCIsIlRhYmxlQVBJIiwiZGVmaW5lVUk1Q2xhc3MiLCJwcm9wZXJ0eSIsInR5cGUiLCJleHBlY3RlZFR5cGVzIiwiZXhwZWN0ZWRBbm5vdGF0aW9ucyIsImRlZmF1bHRWYWx1ZSIsImV2ZW50IiwieG1sRXZlbnRIYW5kbGVyIiwibVNldHRpbmdzIiwib3RoZXJzIiwidXBkYXRlRmlsdGVyQmFyIiwiY29udGVudCIsImF0dGFjaEV2ZW50Iiwib25UYWJsZVNlbGVjdGlvbkNoYW5nZSIsImdldFNlbGVjdGVkQ29udGV4dHMiLCJhZGRNZXNzYWdlIiwicGFyYW1ldGVycyIsIm1zZ01hbmFnZXIiLCJfZ2V0TWVzc2FnZU1hbmFnZXIiLCJvVGFibGUiLCJvTWVzc2FnZSIsIk1lc3NhZ2UiLCJ0YXJnZXQiLCJnZXRSb3dCaW5kaW5nIiwiZ2V0UmVzb2x2ZWRQYXRoIiwibWVzc2FnZSIsInByb2Nlc3NvciIsImdldE1vZGVsIiwiZGVzY3JpcHRpb24iLCJwZXJzaXN0ZW50IiwiYWRkTWVzc2FnZXMiLCJnZXRJZCIsInJlbW92ZU1lc3NhZ2UiLCJpZCIsIm1lc3NhZ2VzIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsImZpbmQiLCJyZW1vdmVNZXNzYWdlcyIsInNhcCIsInVpIiwiZ2V0Q29yZSIsImdldE1lc3NhZ2VNYW5hZ2VyIiwiX2dldFJvd0JpbmRpbmciLCJnZXRDb250ZW50IiwiZ2V0Q291bnRzIiwiVGFibGVVdGlscyIsImdldExpc3RCaW5kaW5nRm9yQ291bnQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImJhdGNoR3JvdXBJZCIsImdldFByb3BlcnR5IiwiZGF0YSIsImFkZGl0aW9uYWxGaWx0ZXJzIiwiZ2V0SGlkZGVuRmlsdGVycyIsImlWYWx1ZSIsImdldENvdW50Rm9ybWF0dGVkIiwiY2F0Y2giLCJvblRhYmxlUm93UHJlc3MiLCJvRXZlbnQiLCJvQ29udHJvbGxlciIsIm9Db250ZXh0IiwibVBhcmFtZXRlcnMiLCJpc0luYWN0aXZlIiwiaXNUcmFuc2llbnQiLCJpc0EiLCJfcm91dGluZyIsIm5hdmlnYXRlRm9yd2FyZFRvQ29udGV4dCIsIm9uSW50ZXJuYWxEYXRhUmVjZWl2ZWQiLCJnZXRQYXJhbWV0ZXIiLCJnZXRDb250cm9sbGVyIiwibWVzc2FnZUhhbmRsZXIiLCJzaG93TWVzc2FnZURpYWxvZyIsIm9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkIiwic2V0UHJvcGVydHkiLCJmaXJlRXZlbnQiLCJnZXRQYXJhbWV0ZXJzIiwib25QYXN0ZSIsInRhYmxlRGVmaW5pdGlvbiIsImNvbnRyb2wiLCJlbmFibGVQYXN0ZSIsImFSYXdQYXN0ZWREYXRhIiwiZ2V0U291cmNlIiwiZ2V0RW5hYmxlUGFzdGUiLCJQYXN0ZUhlbHBlciIsInBhc3RlRGF0YSIsIm9SZXNvdXJjZU1vZGVsIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiTWVzc2FnZUJveCIsImVycm9yIiwiZ2V0VGV4dCIsInRpdGxlIiwib25CZWZvcmVFeHBvcnQiLCJpc1NwbGl0TW9kZSIsInVzZXJFeHBvcnRTZXR0aW5ncyIsInNwbGl0Q2VsbHMiLCJvVGFibGVDb250cm9sbGVyIiwib0V4cG9ydFNldHRpbmdzIiwiZXhwb3J0U2V0dGluZ3MiLCJvVGFibGVDb2x1bW5zIiwiY29sdW1ucyIsInVwZGF0ZUV4cG9ydFNldHRpbmdzIiwiZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyIiwic1RhYmxlQ29udGV4dEJpbmRpbmdQYXRoIiwiZ2V0UGF0aCIsInNUYWJsZVJvd0JpbmRpbmciLCJnZXRUYXJnZXQiLCJvbkRhdGFTdGF0ZUNoYW5nZSIsIm9EYXRhU3RhdGVJbmRpY2F0b3IiLCJhRmlsdGVyZWRNZXNzYWdlcyIsIm9JbnRlcm5hbE1vZGVsIiwidGFibGVDb250cm9sbGVyIiwicmVmQ29sdW1uIiwiYWRkaXRpb25hbFByb3BlcnR5SW5kZXgiLCJkYXRhU291cmNlIiwic2l6ZUxpbWl0IiwiZXhwb3J0Q29sdW1ucyIsIndvcmtib29rIiwiZm9yRWFjaCIsImNvbHVtbkV4cG9ydCIsImxhYmVsIiwiRGVsZWdhdGVVdGlsIiwiZ2V0TG9jYWxpemVkVGV4dCIsImNvbCIsImNvbHVtbiIsImlzRGF0YVBvaW50RmFrZVRhcmdldFByb3BlcnR5IiwicmVsYXRpdmVQYXRoIiwicmVnZXgiLCJleGVjIiwiY29sdW1uSWQiLCJ1cGRhdGVFeHBvcnRUeXBlT25UZXh0T25seVByb3BlcnRpZXMiLCJyZXNvdXJjZU1vZGVsIiwiZmFsc2VWYWx1ZSIsInRydWVWYWx1ZSIsImFubm90YXRpb25Db2x1bW5zIiwicHJvcGVydHlJbmZvcyIsImxlbmd0aCIsImNvbHVtbkZyb21Bbm5vdGF0aW9uQ29sdW1ucyIsInJlc3VtZUJpbmRpbmciLCJiUmVxdWVzdElmTm90SW5pdGlhbGl6ZWQiLCJnZXREYXRhSW5pdGlhbGl6ZWQiLCJyZWJpbmQiLCJyZWZyZXNoTm90QXBwbGljYWJsZUZpZWxkcyIsIm9GaWx0ZXJDb250cm9sIiwiRmlsdGVyVXRpbHMiLCJnZXROb3RBcHBsaWNhYmxlRmlsdGVycyIsInN1c3BlbmRCaW5kaW5nIiwiaW52YWxpZGF0ZUNvbnRlbnQiLCJvbk1hc3NFZGl0QnV0dG9uUHJlc3NlZCIsInBhZ2VDb250cm9sbGVyIiwibWFzc0VkaXQiLCJvcGVuTWFzc0VkaXREaWFsb2ciLCJMb2ciLCJ3YXJuaW5nIiwiZ2V0VGFibGVEZWZpbml0aW9uIiwidGFibGUiLCJmaWx0ZXJCYXJSZWZJZCIsImdldEZpbHRlckJhciIsImdldEZpbHRlciIsIl9zZXRGaWx0ZXJCYXIiLCJjb3JlIiwidGFibGVBUElJZCIsInRhYmxlQVBJTG9jYWxJZCIsInBvdGVudGlhbGZpbHRlckJhcklkIiwicmVwbGFjZSIsIlJlZ0V4cCIsImZpbHRlckJhciIsIkNvbW1vblV0aWxzIiwiZ2V0VGFyZ2V0VmlldyIsImJ5SWQiLCJzZXRGaWx0ZXIiLCJjaGVja0lmQ29sdW1uRXhpc3RzIiwiYUZpbHRlcmVkQ29sdW1tbnMiLCJjb2x1bW5OYW1lIiwic29tZSIsIm9Db2x1bW4iLCJzQ29sdW1uTmFtZVZpc2libGUiLCJzVGV4dEFycmFuZ2VtZW50IiwidW5kZWZpbmVkIiwiZ2V0SWRlbnRpZmllckNvbHVtbiIsImhlYWRlckluZm9UaXRsZVBhdGgiLCJoZWFkZXJJbmZvVGl0bGUiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwic0N1cnJlbnRFbnRpdHlTZXROYW1lIiwiYVRlY2huaWNhbEtleXMiLCJnZXRPYmplY3QiLCJhRmlsdGVyZWRUZWNobmljYWxLZXlzIiwidGVjaG5pY2FsS2V5IiwicHVzaCIsInNlbWFudGljS2V5Q29sdW1ucyIsInNlbWFudGljS2V5cyIsImFWaXNpYmxlQ29sdW1ucyIsImFUYWJsZUNvbHVtbnMiLCJnZXRDb2x1bW5zIiwiZ2V0RGF0YVByb3BlcnR5Iiwib1RleHRBcnJhbmdlbWVudCIsIiRQYXRoIiwic1RleHRQbGFjZW1lbnQiLCIkRW51bU1lbWJlciIsInNldFVwRW1wdHlSb3dzIiwiY3JlYXRpb25Nb2RlIiwiQ3JlYXRpb25Nb2RlIiwiSW5saW5lQ3JlYXRpb25Sb3dzIiwicFdhaXRUYWJsZVJlbmRlcmVkIiwiUHJvbWlzZSIsInJlc29sdmUiLCJnZXREb21SZWYiLCJkZWxlZ2F0ZSIsIm9uQWZ0ZXJSZW5kZXJpbmciLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiYWRkRXZlbnREZWxlZ2F0ZSIsImJJc0luRWRpdE1vZGUiLCJvQmluZGluZyIsImlzUmVzb2x2ZWQiLCJpc0xlbmd0aEZpbmFsIiwic0NvbnRleHRQYXRoIiwiZ2V0Q29udGV4dCIsIm9JbmFjdGl2ZUNvbnRleHQiLCJnZXRBbGxDdXJyZW50Q29udGV4dHMiLCJzdGFydHNXaXRoIiwiX2NyZWF0ZUVtcHR5Um93IiwiaUlubGluZUNyZWF0aW9uUm93Q291bnQiLCJpbmxpbmVDcmVhdGlvblJvd0NvdW50IiwiYURhdGEiLCJpIiwiYkF0RW5kIiwiYkluYWN0aXZlIiwib1ZpZXciLCJvSW50ZXJuYWxFZGl0RmxvdyIsIl9lZGl0RmxvdyIsImNyZWF0aW5nRW1wdHlSb3dzIiwiY3JlYXRlTXVsdGlwbGVEb2N1bWVudHMiLCJlZGl0RmxvdyIsIm9uQmVmb3JlQ3JlYXRlIiwiYUNvbnRleHRzIiwiY3JlYXRlZCIsIm9FcnJvciIsImNhbmNlbGVkIiwiTWFjcm9BUEkiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRhYmxlQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHR5cGUge1xuXHRBbm5vdGF0aW9uVGFibGVDb2x1bW4sXG5cdENvbHVtbkV4cG9ydFNldHRpbmdzLFxuXHRUYWJsZUNvbHVtbixcblx0VGFibGVWaXN1YWxpemF0aW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9UYWJsZVwiO1xuaW1wb3J0IHsgQ3JlYXRpb25Nb2RlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RTZXR0aW5nc1wiO1xuaW1wb3J0IHR5cGUgeyBQcm9wZXJ0aWVzT2YgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCB7IGRlZmluZVVJNUNsYXNzLCBldmVudCwgcHJvcGVydHksIHhtbEV2ZW50SGFuZGxlciB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IFBhc3RlSGVscGVyIGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1Bhc3RlSGVscGVyXCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBEZWxlZ2F0ZVV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvRGVsZWdhdGVVdGlsXCI7XG5pbXBvcnQgRmlsdGVyVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvZmlsdGVyL0ZpbHRlclV0aWxzXCI7XG5pbXBvcnQgVGFibGVVdGlscyBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9VdGlsc1wiO1xuaW1wb3J0IE1lc3NhZ2VCb3ggZnJvbSBcInNhcC9tL01lc3NhZ2VCb3hcIjtcbmltcG9ydCBEYXRhU3RhdGVJbmRpY2F0b3IgZnJvbSBcInNhcC9tL3BsdWdpbnMvRGF0YVN0YXRlSW5kaWNhdG9yXCI7XG5pbXBvcnQgVUk1RXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHsgTWVzc2FnZVR5cGUgfSBmcm9tIFwic2FwL3VpL2NvcmUvbGlicmFyeVwiO1xuaW1wb3J0IE1lc3NhZ2UgZnJvbSBcInNhcC91aS9jb3JlL21lc3NhZ2UvTWVzc2FnZVwiO1xuaW1wb3J0IFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhTGlzdEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUxpc3RCaW5kaW5nXCI7XG5pbXBvcnQgTWFjcm9BUEkgZnJvbSBcIi4uL01hY3JvQVBJXCI7XG5cbi8qKlxuICogRGVmaW5pdGlvbiBvZiBhIGN1c3RvbSBhY3Rpb24gdG8gYmUgdXNlZCBpbnNpZGUgdGhlIHRhYmxlIHRvb2xiYXJcbiAqXG4gKiBAYWxpYXMgc2FwLmZlLm1hY3Jvcy50YWJsZS5BY3Rpb25cbiAqIEBwdWJsaWNcbiAqL1xuZXhwb3J0IHR5cGUgQWN0aW9uID0ge1xuXHQvKipcblx0ICogVW5pcXVlIGlkZW50aWZpZXIgb2YgdGhlIGFjdGlvblxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRrZXk6IHN0cmluZztcblx0LyoqXG5cdCAqIFRoZSB0ZXh0IHRoYXQgd2lsbCBiZSBkaXNwbGF5ZWQgZm9yIHRoaXMgYWN0aW9uXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHRleHQ6IHN0cmluZztcblx0LyoqXG5cdCAqIFJlZmVyZW5jZSB0byB0aGUga2V5IG9mIGFub3RoZXIgYWN0aW9uIGFscmVhZHkgZGlzcGxheWVkIGluIHRoZSB0b29sYmFyIHRvIHByb3Blcmx5IHBsYWNlIHRoaXMgb25lXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFuY2hvcj86IHN0cmluZztcblx0LyoqXG5cdCAqIERlZmluZXMgd2hlcmUgdGhpcyBhY3Rpb24gc2hvdWxkIGJlIHBsYWNlZCByZWxhdGl2ZSB0byB0aGUgZGVmaW5lZCBhbmNob3Jcblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIGBCZWZvcmVgIGFuZCBgQWZ0ZXJgXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHBsYWNlbWVudD86IHN0cmluZztcblxuXHQvKipcblx0ICogRXZlbnQgaGFuZGxlciB0byBiZSBjYWxsZWQgd2hlbiB0aGUgdXNlciBjaG9vc2VzIHRoZSBhY3Rpb25cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cHJlc3M6IHN0cmluZztcblxuXHQvKipcblx0ICogRGVmaW5lcyBpZiB0aGUgYWN0aW9uIHJlcXVpcmVzIGEgc2VsZWN0aW9uLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRyZXF1aXJlc1NlbGVjdGlvbj86IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIEVuYWJsZXMgb3IgZGlzYWJsZXMgdGhlIGFjdGlvblxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRlbmFibGVkPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEFjdGlvbkdyb3VwID0ge1xuXHQvKipcblx0ICogRGVmaW5lcyBuZXN0ZWQgYWN0aW9uc1xuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhY3Rpb25zOiBBY3Rpb25bXTtcblxuXHQvKipcblx0ICogVGhlIHRleHQgdGhhdCB3aWxsIGJlIGRpc3BsYXllZCBmb3IgdGhpcyBhY3Rpb24gZ3JvdXBcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0dGV4dDogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXJlIHRoaXMgYWN0aW9uIGdyb3VwIHNob3VsZCBiZSBwbGFjZWQgcmVsYXRpdmUgdG8gdGhlIGRlZmluZWQgYW5jaG9yXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBgQmVmb3JlYCBhbmQgYEFmdGVyYFxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRwbGFjZW1lbnQ/OiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFJlZmVyZW5jZSB0byB0aGUga2V5IG9mIGFub3RoZXIgYWN0aW9uIG9yIGFjdGlvbiBncm91cCBhbHJlYWR5IGRpc3BsYXllZCBpbiB0aGUgdG9vbGJhciB0byBwcm9wZXJseSBwbGFjZSB0aGlzIG9uZVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhbmNob3I/OiBzdHJpbmc7XG59O1xuXG4vKipcbiAqIERlZmluaXRpb24gb2YgYSBjdXN0b20gY29sdW1uIHRvIGJlIHVzZWQgaW5zaWRlIHRoZSB0YWJsZS5cbiAqXG4gKiBUaGUgdGVtcGxhdGUgZm9yIHRoZSBjb2x1bW4gaGFzIHRvIGJlIHByb3ZpZGVkIGFzIHRoZSBkZWZhdWx0IGFnZ3JlZ2F0aW9uXG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MudGFibGUuQ29sdW1uXG4gKiBAcHVibGljXG4gKiBAZXhwZXJpbWVudGFsXG4gKi9cbmV4cG9ydCB0eXBlIENvbHVtbiA9IHtcblx0LyoqXG5cdCAqIFVuaXF1ZSBpZGVudGlmaWVyIG9mIHRoZSBjb2x1bW5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0a2V5OiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBUaGUgdGV4dCB0aGF0IHdpbGwgYmUgZGlzcGxheWVkIGZvciB0aGlzIGNvbHVtbiBoZWFkZXJcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0aGVhZGVyOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBSZWZlcmVuY2UgdG8gdGhlIGtleSBvZiBhbm90aGVyIGNvbHVtbiBhbHJlYWR5IGRpc3BsYXllZCBpbiB0aGUgdGFibGUgdG8gcHJvcGVybHkgcGxhY2UgdGhpcyBvbmVcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0YW5jaG9yPzogc3RyaW5nO1xuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgY29sdW1uIGltcG9ydGFuY2Vcblx0ICpcblx0ICogWW91IGNhbiBkZWZpbmUgd2hpY2ggY29sdW1ucyBzaG91bGQgYmUgYXV0b21hdGljYWxseSBtb3ZlZCB0byB0aGUgcG9wLWluIGFyZWEgYmFzZWQgb24gdGhlaXIgaW1wb3J0YW5jZVxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRpbXBvcnRhbmNlPzogc3RyaW5nO1xuXHQvKipcblx0ICogRGVmaW5lcyB3aGVyZSB0aGlzIGNvbHVtbiBzaG91bGQgYmUgcGxhY2VkIHJlbGF0aXZlIHRvIHRoZSBkZWZpbmVkIGFuY2hvclxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgYEJlZm9yZWAgYW5kIGBBZnRlcmBcblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cGxhY2VtZW50Pzogc3RyaW5nO1xufTtcblxudHlwZSBFeHBvcnRDb2x1bW4gPSBDb2x1bW5FeHBvcnRTZXR0aW5ncyAmIHtcblx0cHJvcGVydHk6IHN0cmluZyB8IEFycmF5PHN0cmluZz47XG5cdGxhYmVsOiBzdHJpbmc7XG5cdGNvbHVtbklkOiBzdHJpbmc7XG5cdHdpZHRoPzogbnVtYmVyO1xuXHR0ZXh0QWxpZ24/OiBzdHJpbmc7XG5cdGRpc3BsYXlVbml0PzogYm9vbGVhbjtcblx0dHJ1ZVZhbHVlPzogc3RyaW5nO1xuXHRmYWxzZVZhbHVlPzogc3RyaW5nO1xuXHR2YWx1ZU1hcD86IHN0cmluZztcblx0dHlwZT86IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIEV4cG9ydFNldHRpbmdzID0ge1xuXHRkYXRhU291cmNlOiB7XG5cdFx0c2l6ZUxpbWl0PzogbnVtYmVyO1xuXHR9O1xuXHR3b3JrYm9vazoge1xuXHRcdGNvbHVtbnM6IEV4cG9ydENvbHVtbltdO1xuXHR9O1xufTtcblxuLyoqXG4gKiBCdWlsZGluZyBibG9jayB1c2VkIHRvIGNyZWF0ZSBhIHRhYmxlIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIFVzdWFsbHksIGEgTGluZUl0ZW0gb3IgUHJlc2VudGF0aW9uVmFyaWFudCBhbm5vdGF0aW9uIGlzIGV4cGVjdGVkLCBidXQgdGhlIFRhYmxlIGJ1aWxkaW5nIGJsb2NrIGNhbiBhbHNvIGJlIHVzZWQgdG8gZGlzcGxheSBhbiBFbnRpdHlTZXQuXG4gKlxuICpcbiAqIFVzYWdlIGV4YW1wbGU6XG4gKiA8cHJlPlxuICogJmx0O21hY3JvOlRhYmxlIGlkPVwiTXlUYWJsZVwiIG1ldGFQYXRoPVwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkxpbmVJdGVtXCIgLyZndDtcbiAqIDwvcHJlPlxuICpcbiAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLlRhYmxlXG4gKiBAcHVibGljXG4gKi9cbkBkZWZpbmVVSTVDbGFzcyhcInNhcC5mZS5tYWNyb3MudGFibGUuVGFibGVBUElcIilcbmNsYXNzIFRhYmxlQVBJIGV4dGVuZHMgTWFjcm9BUEkge1xuXHRjcmVhdGluZ0VtcHR5Um93cz86IGJvb2xlYW47XG5cdGNvbnN0cnVjdG9yKG1TZXR0aW5ncz86IFByb3BlcnRpZXNPZjxUYWJsZUFQST4sIC4uLm90aGVyczogYW55W10pIHtcblx0XHRzdXBlcihtU2V0dGluZ3MgYXMgYW55LCAuLi5vdGhlcnMpO1xuXG5cdFx0dGhpcy51cGRhdGVGaWx0ZXJCYXIoKTtcblxuXHRcdGlmICh0aGlzLmNvbnRlbnQpIHtcblx0XHRcdHRoaXMuY29udGVudC5hdHRhY2hFdmVudChcInNlbGVjdGlvbkNoYW5nZVwiLCB7fSwgdGhpcy5vblRhYmxlU2VsZWN0aW9uQ2hhbmdlLCB0aGlzKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgcmVsYXRpdmUgcGF0aCBvZiB0aGUgcHJvcGVydHkgaW4gdGhlIG1ldGFtb2RlbCwgYmFzZWQgb24gdGhlIGN1cnJlbnQgY29udGV4dFBhdGguXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7XG5cdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRleHBlY3RlZFR5cGVzOiBbXCJFbnRpdHlTZXRcIiwgXCJFbnRpdHlUeXBlXCIsIFwiU2luZ2xldG9uXCIsIFwiTmF2aWdhdGlvblByb3BlcnR5XCJdLFxuXHRcdGV4cGVjdGVkQW5ub3RhdGlvbnM6IFtcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTGluZUl0ZW1cIixcblx0XHRcdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUHJlc2VudGF0aW9uVmFyaWFudFwiLFxuXHRcdFx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25QcmVzZW50YXRpb25WYXJpYW50XCJcblx0XHRdXG5cdH0pXG5cdG1ldGFQYXRoITogc3RyaW5nO1xuXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIiB9KVxuXHR0YWJsZURlZmluaXRpb24hOiBUYWJsZVZpc3VhbGl6YXRpb247XG5cblx0LyoqXG5cdCAqIEFuIGV4cHJlc3Npb24gdGhhdCBhbGxvd3MgeW91IHRvIGNvbnRyb2wgdGhlICdyZWFkLW9ubHknIHN0YXRlIG9mIHRoZSB0YWJsZS5cblx0ICpcblx0ICogSWYgeW91IGRvIG5vdCBzZXQgYW55IGV4cHJlc3Npb24sIFNBUCBGaW9yaSBlbGVtZW50cyBob29rcyBpbnRvIHRoZSBzdGFuZGFyZCBsaWZlY3ljbGUgdG8gZGV0ZXJtaW5lIHRoZSBjdXJyZW50IHN0YXRlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRyZWFkT25seSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBpZGVudGlmaWVyIG9mIHRoZSB0YWJsZSBjb250cm9sLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBBbiBleHByZXNzaW9uIHRoYXQgYWxsb3dzIHlvdSB0byBjb250cm9sIHRoZSAnYnVzeScgc3RhdGUgb2YgdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiBmYWxzZSB9KVxuXHRidXN5ITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogRGVmaW5lcyB0aGUgdHlwZSBvZiB0YWJsZSB0aGF0IHdpbGwgYmUgdXNlZCBieSB0aGUgYnVpbGRpbmcgYmxvY2sgdG8gcmVuZGVyIHRoZSBkYXRhLlxuXHQgKlxuXHQgKiBBbGxvd2VkIHZhbHVlcyBhcmUgYEdyaWRUYWJsZWAgYW5kIGBSZXNwb25zaXZlVGFibGVgXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIsIGRlZmF1bHRWYWx1ZTogXCJSZXNwb25zaXZlVGFibGVcIiB9KVxuXHR0eXBlITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBDb250cm9scyBpZiB0aGUgZXhwb3J0IGZ1bmN0aW9uYWxpdHkgb2YgdGhlIHRhYmxlIGlzIGVuYWJsZWQgb3Igbm90LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdGVuYWJsZUV4cG9ydCE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIGlmIHRoZSBwYXN0ZSBmdW5jdGlvbmFsaXR5IG9mIHRoZSB0YWJsZSBpcyBlbmFibGVkIG9yIG5vdC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0ZW5hYmxlUGFzdGUhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBDb250cm9scyB3aGV0aGVyIHRoZSB0YWJsZSBjYW4gYmUgb3BlbmVkIGluIGZ1bGxzY3JlZW4gbW9kZSBvciBub3QuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGVuYWJsZUZ1bGxTY3JlZW4hOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBJRCBvZiB0aGUgRmlsdGVyQmFyIGJ1aWxkaW5nIGJsb2NrIGFzc29jaWF0ZWQgd2l0aCB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0ZmlsdGVyQmFyITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSBzZWxlY3Rpb24gbW9kZSB0byBiZSB1c2VkIGJ5IHRoZSB0YWJsZS5cblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIGBOb25lYCwgYFNpbmdsZWAsIGBNdWx0aWAgb3IgYEF1dG9gXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0c2VsZWN0aW9uTW9kZSE6IHN0cmluZztcblxuXHQvKipcblx0ICogU3BlY2lmaWVzIHRoZSBoZWFkZXIgdGV4dCB0aGF0IGlzIHNob3duIGluIHRoZSB0YWJsZS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRoZWFkZXIhOiBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIFNwZWNpZmllcyB0aGUgaGVhZGVyIHRleHQgdGhhdCBpcyBzaG93biBpbiB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGVuYWJsZUF1dG9Db2x1bW5XaWR0aCE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIGlmIHRoZSBoZWFkZXIgdGV4dCBzaG91bGQgYmUgc2hvd24gb3Igbm90LlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdGhlYWRlclZpc2libGUhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0ZGF0YUluaXRpYWxpemVkITogYm9vbGVhbjtcblxuXHQvKipcblx0ICpcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdGJpbmRpbmdTdXNwZW5kZWQhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogZmFsc2UgfSlcblx0b3V0RGF0ZWRCaW5kaW5nITogYm9vbGVhbjtcblxuXHQvKipcblx0ICpcblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiLCBkZWZhdWx0VmFsdWU6IGZhbHNlIH0pXG5cdHBlbmRpbmdSZXF1ZXN0ITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gdGhlIHVzZXIgY2hvb3NlcyBhIHJvdzsgdGhlIGV2ZW50IGNvbnRhaW5zIGluZm9ybWF0aW9uIGFib3V0IHdoaWNoIHJvdyB3YXMgY2hvc2VuLlxuXHQgKlxuXHQgKiBZb3UgY2FuIHNldCB0aGlzIGluIG9yZGVyIHRvIGhhbmRsZSB0aGUgbmF2aWdhdGlvbiBtYW51YWxseS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGV2ZW50KClcblx0cm93UHJlc3MhOiBGdW5jdGlvbjtcblxuXHQvKipcblx0ICogQW4gZXZlbnQgdHJpZ2dlcmVkIHdoZW4gdGhlIFRhYmxlIFN0YXRlIGNoYW5nZXMuXG5cdCAqXG5cdCAqIFlvdSBjYW4gc2V0IHRoaXMgaW4gb3JkZXIgdG8gc3RvcmUgdGhlIHRhYmxlIHN0YXRlIGluIHRoZSBhcHBzdGF0ZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdEBldmVudCgpXG5cdHN0YXRlQ2hhbmdlITogRnVuY3Rpb247XG5cblx0QGV2ZW50KClcblx0aW50ZXJuYWxEYXRhUmVxdWVzdGVkITogRnVuY3Rpb247XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIHdoaWNoIG9wdGlvbnMgc2hvdWxkIGJlIGVuYWJsZWQgZm9yIHRoZSB0YWJsZSBwZXJzb25hbGl6YXRpb24gZGlhbG9nLlxuXHQgKlxuXHQgKiBJZiBpdCBpcyBzZXQgdG8gYHRydWVgLCBhbGwgcG9zc2libGUgb3B0aW9ucyBmb3IgdGhpcyBraW5kIG9mIHRhYmxlIGFyZSBlbmFibGVkLjxici8+XG5cdCAqIElmIGl0IGlzIHNldCB0byBgZmFsc2VgLCBwZXJzb25hbGl6YXRpb24gaXMgZGlzYWJsZWQuPGJyLz5cblx0ICo8YnIvPlxuXHQgKiBZb3UgY2FuIGFsc28gcHJvdmlkZSBhIG1vcmUgZ3JhbnVsYXIgY29udHJvbCBmb3IgdGhlIHBlcnNvbmFsaXphdGlvbiBieSBwcm92aWRpbmcgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCB3aXRoIHRoZSBvcHRpb25zIHlvdSB3YW50IHRvIGJlIGF2YWlsYWJsZS48YnIvPlxuXHQgKiBBdmFpbGFibGUgb3B0aW9ucyBhcmU6PGJyLz5cblx0ICogIC0gU29ydDxici8+XG5cdCAqICAtIENvbHVtbjxici8+XG5cdCAqICAtIEZpbHRlcjxici8+XG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhbnxzdHJpbmdcIiwgZGVmYXVsdFZhbHVlOiB0cnVlIH0pXG5cdHBlcnNvbmFsaXphdGlvbiE6IGJvb2xlYW4gfCBzdHJpbmc7XG5cblx0LyoqXG5cdCAqIENvbnRyb2xzIHRoZSBraW5kIG9mIHZhcmlhbnQgbWFuYWdlbWVudCB0aGF0IHNob3VsZCBiZSBlbmFibGVkIGZvciB0aGUgdGFibGUuXG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWUgaXMgYENvbnRyb2xgLjxici8+XG5cdCAqIElmIHNldCB3aXRoIHZhbHVlIGBDb250cm9sYCwgYSB2YXJpYW50IG1hbmFnZW1lbnQgY29udHJvbCBpcyBzZWVuIHdpdGhpbiB0aGUgdGFibGUgYW5kIHRoZSB0YWJsZSBpcyBsaW5rZWQgdG8gdGhpcy48YnIvPlxuXHQgKiBJZiBub3Qgc2V0IHdpdGggYW55IHZhbHVlLCBjb250cm9sIGxldmVsIHZhcmlhbnQgbWFuYWdlbWVudCBpcyBub3QgYXZhaWxhYmxlIGZvciB0aGlzIHRhYmxlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdHZhcmlhbnRNYW5hZ2VtZW50ITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBHcm91cHMgbWVudSBhY3Rpb25zIGJ5IGtleS5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJzdHJpbmdcIiB9KVxuXHRtZW51Pzogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHdoZXRoZXIgdG8gZGlzcGxheSB0aGUgc2VhcmNoIGFjdGlvbi5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIsIGRlZmF1bHRWYWx1ZTogdHJ1ZSB9KVxuXHRpc1NlYXJjaGFibGU/OiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBHZXRzIGNvbnRleHRzIGZyb20gdGhlIHRhYmxlIHRoYXQgaGF2ZSBiZWVuIHNlbGVjdGVkIGJ5IHRoZSB1c2VyLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBDb250ZXh0cyBvZiB0aGUgcm93cyBzZWxlY3RlZCBieSB0aGUgdXNlclxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRnZXRTZWxlY3RlZENvbnRleHRzKCk6IENvbnRleHRbXSB7XG5cdFx0cmV0dXJuICh0aGlzLmNvbnRlbnQgYXMgYW55KS5nZXRTZWxlY3RlZENvbnRleHRzKCk7XG5cdH1cblxuXHQvKipcblx0ICogQWRkcyBhIG1lc3NhZ2UgdG8gdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBUaGUgbWVzc2FnZSBhcHBsaWVzIHRvIHRoZSB3aG9sZSB0YWJsZSBhbmQgbm90IHRvIGFuIGluZGl2aWR1YWwgdGFibGUgcm93LlxuXHQgKlxuXHQgKiBAcGFyYW0gW3BhcmFtZXRlcnNdIFRoZSBwYXJhbWV0ZXJzIHRvIGNyZWF0ZSB0aGUgbWVzc2FnZVxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycy50eXBlIE1lc3NhZ2UgdHlwZVxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycy5tZXNzYWdlIE1lc3NhZ2UgdGV4dFxuXHQgKiBAcGFyYW0gcGFyYW1ldGVycy5kZXNjcmlwdGlvbiBNZXNzYWdlIGRlc2NyaXB0aW9uXG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzLnBlcnNpc3RlbnQgVHJ1ZSBpZiB0aGUgbWVzc2FnZSBpcyBwZXJzaXN0ZW50XG5cdCAqIEByZXR1cm5zIFRoZSBJRCBvZiB0aGUgbWVzc2FnZVxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRhZGRNZXNzYWdlKHBhcmFtZXRlcnM6IHsgdHlwZT86IE1lc3NhZ2VUeXBlOyBtZXNzYWdlPzogc3RyaW5nOyBkZXNjcmlwdGlvbj86IHN0cmluZzsgcGVyc2lzdGVudD86IGJvb2xlYW4gfSk6IHN0cmluZyB7XG5cdFx0Y29uc3QgbXNnTWFuYWdlciA9IHRoaXMuX2dldE1lc3NhZ2VNYW5hZ2VyKCk7XG5cblx0XHRjb25zdCBvVGFibGUgPSB0aGlzLmNvbnRlbnQgYXMgYW55IGFzIFRhYmxlO1xuXG5cdFx0Y29uc3Qgb01lc3NhZ2UgPSBuZXcgTWVzc2FnZSh7XG5cdFx0XHR0YXJnZXQ6IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkuZ2V0UmVzb2x2ZWRQYXRoKCksXG5cdFx0XHR0eXBlOiBwYXJhbWV0ZXJzLnR5cGUsXG5cdFx0XHRtZXNzYWdlOiBwYXJhbWV0ZXJzLm1lc3NhZ2UsXG5cdFx0XHRwcm9jZXNzb3I6IG9UYWJsZS5nZXRNb2RlbCgpLFxuXHRcdFx0ZGVzY3JpcHRpb246IHBhcmFtZXRlcnMuZGVzY3JpcHRpb24sXG5cdFx0XHRwZXJzaXN0ZW50OiBwYXJhbWV0ZXJzLnBlcnNpc3RlbnRcblx0XHR9KTtcblxuXHRcdG1zZ01hbmFnZXIuYWRkTWVzc2FnZXMob01lc3NhZ2UpO1xuXHRcdHJldHVybiBvTWVzc2FnZS5nZXRJZCgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJlbW92ZXMgYSBtZXNzYWdlIGZyb20gdGhlIHRhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gaWQgVGhlIGlkIG9mIHRoZSBtZXNzYWdlXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdHJlbW92ZU1lc3NhZ2UoaWQ6IHN0cmluZykge1xuXHRcdGNvbnN0IG1zZ01hbmFnZXIgPSB0aGlzLl9nZXRNZXNzYWdlTWFuYWdlcigpO1xuXHRcdGNvbnN0IG1lc3NhZ2VzID0gbXNnTWFuYWdlci5nZXRNZXNzYWdlTW9kZWwoKS5nZXREYXRhKCk7XG5cdFx0Y29uc3QgcmVzdWx0ID0gbWVzc2FnZXMuZmluZCgoZTogYW55KSA9PiBlLmlkID09PSBpZCk7XG5cdFx0aWYgKHJlc3VsdCkge1xuXHRcdFx0bXNnTWFuYWdlci5yZW1vdmVNZXNzYWdlcyhyZXN1bHQpO1xuXHRcdH1cblx0fVxuXG5cdF9nZXRNZXNzYWdlTWFuYWdlcigpIHtcblx0XHRyZXR1cm4gc2FwLnVpLmdldENvcmUoKS5nZXRNZXNzYWdlTWFuYWdlcigpO1xuXHR9XG5cblx0LyoqXG5cdCAqIEFuIGV2ZW50IHRyaWdnZXJlZCB3aGVuIHRoZSBzZWxlY3Rpb24gaW4gdGhlIHRhYmxlIGNoYW5nZXMuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBldmVudCgpXG5cdHNlbGVjdGlvbkNoYW5nZSE6IEZ1bmN0aW9uO1xuXG5cdF9nZXRSb3dCaW5kaW5nKCkge1xuXHRcdGNvbnN0IG9UYWJsZSA9ICh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpO1xuXHRcdHJldHVybiBvVGFibGUuZ2V0Um93QmluZGluZygpO1xuXHR9XG5cblx0Z2V0Q291bnRzKCk6IFByb21pc2U8c3RyaW5nPiB7XG5cdFx0Y29uc3Qgb1RhYmxlID0gKHRoaXMgYXMgYW55KS5nZXRDb250ZW50KCk7XG5cdFx0cmV0dXJuIFRhYmxlVXRpbHMuZ2V0TGlzdEJpbmRpbmdGb3JDb3VudChvVGFibGUsIG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpLCB7XG5cdFx0XHRiYXRjaEdyb3VwSWQ6ICF0aGlzLmdldFByb3BlcnR5KFwiYmluZGluZ1N1c3BlbmRlZFwiKSA/IG9UYWJsZS5kYXRhKFwiYmF0Y2hHcm91cElkXCIpIDogXCIkYXV0b1wiLFxuXHRcdFx0YWRkaXRpb25hbEZpbHRlcnM6IFRhYmxlVXRpbHMuZ2V0SGlkZGVuRmlsdGVycyhvVGFibGUpXG5cdFx0fSlcblx0XHRcdC50aGVuKChpVmFsdWU6IGFueSkgPT4ge1xuXHRcdFx0XHRyZXR1cm4gVGFibGVVdGlscy5nZXRDb3VudEZvcm1hdHRlZChpVmFsdWUpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCgoKSA9PiB7XG5cdFx0XHRcdHJldHVybiBcIjBcIjtcblx0XHRcdH0pO1xuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uVGFibGVSb3dQcmVzcyhvRXZlbnQ6IFVJNUV2ZW50LCBvQ29udHJvbGxlcjogUGFnZUNvbnRyb2xsZXIsIG9Db250ZXh0OiBDb250ZXh0LCBtUGFyYW1ldGVyczogYW55KSB7XG5cdFx0Ly8gcHJldmVudCBuYXZpZ2F0aW9uIHRvIGFuIGVtcHR5IHJvd1xuXHRcdGlmIChvQ29udGV4dCAmJiBvQ29udGV4dC5pc0luYWN0aXZlKCkgJiYgb0NvbnRleHQuaXNUcmFuc2llbnQoKSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHQvLyBJbiB0aGUgY2FzZSBvZiBhbiBhbmFseXRpY2FsIHRhYmxlLCBpZiB3ZSdyZSB0cnlpbmcgdG8gbmF2aWdhdGUgdG8gYSBjb250ZXh0IGNvcnJlc3BvbmRpbmcgdG8gYSB2aXN1YWwgZ3JvdXAgb3IgZ3JhbmQgdG90YWxcblx0XHQvLyAtLT4gQ2FuY2VsIG5hdmlnYXRpb25cblx0XHRpZiAoXG5cdFx0XHRvQ29udGV4dCAmJlxuXHRcdFx0b0NvbnRleHQuaXNBKFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0LkNvbnRleHRcIikgJiZcblx0XHRcdHR5cGVvZiBvQ29udGV4dC5nZXRQcm9wZXJ0eShcIkAkdWk1Lm5vZGUuaXNFeHBhbmRlZFwiKSA9PT0gXCJib29sZWFuXCJcblx0XHQpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0KG9Db250cm9sbGVyIGFzIGFueSkuX3JvdXRpbmcubmF2aWdhdGVGb3J3YXJkVG9Db250ZXh0KG9Db250ZXh0LCBtUGFyYW1ldGVycyk7XG5cdFx0fVxuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uSW50ZXJuYWxEYXRhUmVjZWl2ZWQob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdGlmIChvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiZXJyb3JcIikpIHtcblx0XHRcdHRoaXMuZ2V0Q29udHJvbGxlcigpLm1lc3NhZ2VIYW5kbGVyLnNob3dNZXNzYWdlRGlhbG9nKCk7XG5cdFx0fVxuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uSW50ZXJuYWxEYXRhUmVxdWVzdGVkKG9FdmVudDogVUk1RXZlbnQpIHtcblx0XHR0aGlzLnNldFByb3BlcnR5KFwiZGF0YUluaXRpYWxpemVkXCIsIHRydWUpO1xuXHRcdCh0aGlzIGFzIGFueSkuZmlyZUV2ZW50KFwiaW50ZXJuYWxEYXRhUmVxdWVzdGVkXCIsIG9FdmVudC5nZXRQYXJhbWV0ZXJzKCkpO1xuXHR9XG5cblx0QHhtbEV2ZW50SGFuZGxlcigpXG5cdG9uUGFzdGUob0V2ZW50OiBVSTVFdmVudCwgb0NvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyKSB7XG5cdFx0Ly8gSWYgcGFzdGUgaXMgZGlzYWJsZSBvciBpZiB3ZSdyZSBub3QgaW4gZWRpdCBtb2RlLCB3ZSBjYW4ndCBwYXN0ZSBhbnl0aGluZ1xuXHRcdGlmICghdGhpcy50YWJsZURlZmluaXRpb24uY29udHJvbC5lbmFibGVQYXN0ZSB8fCAhdGhpcy5nZXRNb2RlbChcInVpXCIpLmdldFByb3BlcnR5KFwiL2lzRWRpdGFibGVcIikpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBhUmF3UGFzdGVkRGF0YSA9IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJkYXRhXCIpLFxuXHRcdFx0b1RhYmxlID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIFRhYmxlO1xuXG5cdFx0aWYgKG9UYWJsZS5nZXRFbmFibGVQYXN0ZSgpID09PSB0cnVlKSB7XG5cdFx0XHRQYXN0ZUhlbHBlci5wYXN0ZURhdGEoYVJhd1Bhc3RlZERhdGEsIG9UYWJsZSwgb0NvbnRyb2xsZXIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCBvUmVzb3VyY2VNb2RlbCA9IHNhcC51aS5nZXRDb3JlKCkuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLmNvcmVcIik7XG5cdFx0XHRNZXNzYWdlQm94LmVycm9yKG9SZXNvdXJjZU1vZGVsLmdldFRleHQoXCJUX09QX0NPTlRST0xMRVJfU0FQRkVfUEFTVEVfRElTQUJMRURfTUVTU0FHRVwiKSwge1xuXHRcdFx0XHR0aXRsZTogb1Jlc291cmNlTW9kZWwuZ2V0VGV4dChcIkNfQ09NTU9OX1NBUEZFX0VSUk9SXCIpXG5cdFx0XHR9KTtcblx0XHR9XG5cdH1cblxuXHQvLyBUaGlzIGV2ZW50IHdpbGwgYWxsb3cgdXMgdG8gaW50ZXJjZXB0IHRoZSBleHBvcnQgYmVmb3JlIGlzIHRyaWdnZXJlZCB0byBjb3ZlciBzcGVjaWZpYyBjYXNlc1xuXHQvLyB0aGF0IGNvdWxkbid0IGJlIGFkZHJlc3NlZCBvbiB0aGUgcHJvcGVydHlJbmZvcyBmb3IgZWFjaCBjb2x1bW4uXG5cdC8vIGUuZy4gRml4ZWQgVGFyZ2V0IFZhbHVlIGZvciB0aGUgZGF0YXBvaW50c1xuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0b25CZWZvcmVFeHBvcnQob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdGNvbnN0IGlzU3BsaXRNb2RlID0gKG9FdmVudC5nZXRQYXJhbWV0ZXJzKCkgYXMgYW55KS51c2VyRXhwb3J0U2V0dGluZ3Muc3BsaXRDZWxscyxcblx0XHRcdG9UYWJsZUNvbnRyb2xsZXIgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgUGFnZUNvbnRyb2xsZXIsXG5cdFx0XHRvRXhwb3J0U2V0dGluZ3MgPSAob0V2ZW50LmdldFBhcmFtZXRlcnMoKSBhcyBhbnkpLmV4cG9ydFNldHRpbmdzLFxuXHRcdFx0b1RhYmxlQ29sdW1ucyA9IHRoaXMudGFibGVEZWZpbml0aW9uLmNvbHVtbnM7XG5cblx0XHRUYWJsZUFQSS51cGRhdGVFeHBvcnRTZXR0aW5ncyhvRXhwb3J0U2V0dGluZ3MsIG9UYWJsZUNvbHVtbnMsIG9UYWJsZUNvbnRyb2xsZXIsIGlzU3BsaXRNb2RlKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHRoZSBNREMgRGF0YVN0YXRlSW5kaWNhdG9yIHBsdWdpbiB0byBkaXNwbGF5IG1lc3NhZ2VTdHJpcCBvbiBhIHRhYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb01lc3NhZ2Vcblx0ICogQHBhcmFtIG9UYWJsZVxuXHQgKiBAbmFtZSBkYXRhU3RhdGVGaWx0ZXJcblx0ICogQHJldHVybnMgV2hldGhlciB0byByZW5kZXIgdmlzaWJsZSB0aGUgbWVzc2FnZVN0cmlwXG5cdCAqL1xuXHRzdGF0aWMgZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyKG9NZXNzYWdlOiBhbnksIG9UYWJsZTogYW55KTogYm9vbGVhbiB7XG5cdFx0Y29uc3Qgc1RhYmxlQ29udGV4dEJpbmRpbmdQYXRoID0gb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCk/LmdldFBhdGgoKTtcblx0XHRjb25zdCBzVGFibGVSb3dCaW5kaW5nID0gKHNUYWJsZUNvbnRleHRCaW5kaW5nUGF0aCA/IGAke3NUYWJsZUNvbnRleHRCaW5kaW5nUGF0aH0vYCA6IFwiXCIpICsgb1RhYmxlLmdldFJvd0JpbmRpbmcoKS5nZXRQYXRoKCk7XG5cdFx0cmV0dXJuIHNUYWJsZVJvd0JpbmRpbmcgPT09IG9NZXNzYWdlLmdldFRhcmdldCgpID8gdHJ1ZSA6IGZhbHNlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoaXMgZXZlbnQgaGFuZGxlcyB0aGUgRGF0YVN0YXRlIG9mIHRoZSBEYXRhU3RhdGVJbmRpY2F0b3IgcGx1Z2luIGZyb20gTURDIG9uIGEgdGFibGUuXG5cdCAqIEl0J3MgZmlyZWQgd2hlbiBuZXcgZXJyb3IgbWVzc2FnZXMgYXJlIHNlbnQgZnJvbSB0aGUgYmFja2VuZCB0byB1cGRhdGUgcm93IGhpZ2hsaWdodGluZy5cblx0ICpcblx0ICogQG5hbWUgb25EYXRhU3RhdGVDaGFuZ2Vcblx0ICogQHBhcmFtIG9FdmVudCBFdmVudCBvYmplY3Rcblx0ICovXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRvbkRhdGFTdGF0ZUNoYW5nZShvRXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0Y29uc3Qgb0RhdGFTdGF0ZUluZGljYXRvciA9IG9FdmVudC5nZXRTb3VyY2UoKSBhcyBEYXRhU3RhdGVJbmRpY2F0b3I7XG5cdFx0Y29uc3QgYUZpbHRlcmVkTWVzc2FnZXMgPSBvRXZlbnQuZ2V0UGFyYW1ldGVyKFwiZmlsdGVyZWRNZXNzYWdlc1wiKTtcblx0XHRpZiAoYUZpbHRlcmVkTWVzc2FnZXMpIHtcblx0XHRcdGNvbnN0IG9JbnRlcm5hbE1vZGVsID0gb0RhdGFTdGF0ZUluZGljYXRvci5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdG9JbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KFwiZmlsdGVyZWRNZXNzYWdlc1wiLCBhRmlsdGVyZWRNZXNzYWdlcywgb0RhdGFTdGF0ZUluZGljYXRvci5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIENvbnRleHQpO1xuXHRcdH1cblx0fVxuXG5cdHN0YXRpYyB1cGRhdGVFeHBvcnRTZXR0aW5ncyhcblx0XHRleHBvcnRTZXR0aW5nczogRXhwb3J0U2V0dGluZ3MsXG5cdFx0Y29sdW1uczogVGFibGVDb2x1bW5bXSxcblx0XHR0YWJsZUNvbnRyb2xsZXI6IFBhZ2VDb250cm9sbGVyLFxuXHRcdGlzU3BsaXRNb2RlOiBib29sZWFuXG5cdCk6IEV4cG9ydFNldHRpbmdzIHtcblx0XHRsZXQgcmVmQ29sdW1uOiBhbnkgPSBudWxsO1xuXHRcdGxldCBhZGRpdGlvbmFsUHJvcGVydHlJbmRleDogbnVtYmVyO1xuXG5cdFx0Ly9TZXQgc3RhdGljIHNpemVMaW1pdCBkdXJpbmcgZXhwb3J0XG5cdFx0ZXhwb3J0U2V0dGluZ3MuZGF0YVNvdXJjZS5zaXplTGltaXQgPSAxMDAwO1xuXG5cdFx0Y29uc3QgZXhwb3J0Q29sdW1ucyA9IGV4cG9ydFNldHRpbmdzLndvcmtib29rPy5jb2x1bW5zO1xuXHRcdGV4cG9ydENvbHVtbnMuZm9yRWFjaChmdW5jdGlvbiAoY29sdW1uRXhwb3J0OiBFeHBvcnRDb2x1bW4pIHtcblx0XHRcdGNvbHVtbkV4cG9ydC5sYWJlbCA9IERlbGVnYXRlVXRpbC5nZXRMb2NhbGl6ZWRUZXh0KGNvbHVtbkV4cG9ydC5sYWJlbCwgdGFibGVDb250cm9sbGVyKTtcblx0XHRcdGNvbHVtbnM/LmZvckVhY2goKGNvbCkgPT4ge1xuXHRcdFx0XHRjb25zdCBjb2x1bW4gPSBjb2wgYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uO1xuXHRcdFx0XHRpZiAoaXNTcGxpdE1vZGUpIHtcblx0XHRcdFx0XHQvL0FkZCBUYXJnZXRWYWx1ZSBvbiBkdW1teSBjcmVhdGVkIHByb3BlcnR5IHdoZW4gZXhwb3J0aW5nIG9uIHNwbGl0IG1vZGVcblx0XHRcdFx0XHRpZiAoY29sdW1uLmlzRGF0YVBvaW50RmFrZVRhcmdldFByb3BlcnR5ICYmIGNvbHVtbi5yZWxhdGl2ZVBhdGggPT09IGNvbHVtbkV4cG9ydC5wcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0Y29sdW1uRXhwb3J0LnByb3BlcnR5ID0gW2NvbHVtbkV4cG9ydC5wcm9wZXJ0eV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIE1vZGlmeSBkdXBsaWNhdGUgbGFiZWxzIGZyb20gc3BsaXR0ZWQgY29sdW1uc1xuXHRcdFx0XHRcdGNvbnN0IHJlZ2V4ID0gLyguKiktYWRkaXRpb25hbFByb3BlcnR5KFxcZCspLy5leGVjKGNvbHVtbkV4cG9ydC5jb2x1bW5JZCk7XG5cdFx0XHRcdFx0aWYgKHJlZ2V4ID09PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRhZGRpdGlvbmFsUHJvcGVydHlJbmRleCA9IDE7XG5cdFx0XHRcdFx0XHRyZWZDb2x1bW4gPSBjb2x1bW5FeHBvcnQ7XG5cdFx0XHRcdFx0fSBlbHNlIGlmIChyZWdleFsxXSA9PT0gcmVmQ29sdW1uPy5jb2x1bW5JZCkge1xuXHRcdFx0XHRcdFx0Y29sdW1uRXhwb3J0LmxhYmVsID1cblx0XHRcdFx0XHRcdFx0Y29sdW1uRXhwb3J0LmxhYmVsID09PSByZWZDb2x1bW4ubGFiZWxcblx0XHRcdFx0XHRcdFx0XHQ/IGAke3JlZkNvbHVtbi5sYWJlbH0gKCR7KythZGRpdGlvbmFsUHJvcGVydHlJbmRleH0pYFxuXHRcdFx0XHRcdFx0XHRcdDogY29sdW1uRXhwb3J0LmxhYmVsO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRUYWJsZUFQSS51cGRhdGVFeHBvcnRUeXBlT25UZXh0T25seVByb3BlcnRpZXMoY29sdW1uLCBjb2x1bW5FeHBvcnQsIGNvbHVtbnMpO1xuXHRcdFx0fSk7XG5cdFx0XHQvL3RyYW5zbGF0ZSBib29sZWFuIHZhbHVlc1xuXHRcdFx0aWYgKGNvbHVtbkV4cG9ydC50eXBlID09PSBcIkJvb2xlYW5cIikge1xuXHRcdFx0XHRjb25zdCByZXNvdXJjZU1vZGVsID0gc2FwLnVpLmdldENvcmUoKS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUubWFjcm9zXCIpO1xuXHRcdFx0XHRjb2x1bW5FeHBvcnQuZmFsc2VWYWx1ZSA9IHJlc291cmNlTW9kZWwuZ2V0VGV4dChcIm5vXCIpO1xuXHRcdFx0XHRjb2x1bW5FeHBvcnQudHJ1ZVZhbHVlID0gcmVzb3VyY2VNb2RlbC5nZXRUZXh0KFwieWVzXCIpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBleHBvcnRTZXR0aW5ncztcblx0fVxuXG5cdC8qKlxuXHQgKiBVcGRhdGUgdGhlIGV4cG9ydCB0eXBlIG9mIHRoZSBjb2x1bW4gaW4gY2FzZSB0aGVyZSBpcyBvbmx5IG9uZSBjaGlsZCBwcm9wZXJ0eSB0byB1c2UgdGhlIGV4cG9ydCB0eXBlIG9mIHRoZSBjaGlsZCBwcm9wZXJ0eS5cblx0ICpcblx0ICogQHBhcmFtIGNvbHVtbiBDb2x1bW4gZnJvbSB0YWJsZSBjb252ZXJ0ZXJcblx0ICogQHBhcmFtIGNvbHVtbkV4cG9ydCBDb2x1bW4gdG8gYmUgZXhwb3J0ZWRcblx0ICogQHBhcmFtIGFubm90YXRpb25Db2x1bW5zIENvbHVtbiBsaXN0IGZyb20gdGhlIHRhYmxlIGNvbnZlcnRlclxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0c3RhdGljIHVwZGF0ZUV4cG9ydFR5cGVPblRleHRPbmx5UHJvcGVydGllcyhjb2x1bW46IFRhYmxlQ29sdW1uLCBjb2x1bW5FeHBvcnQ6IEV4cG9ydENvbHVtbiwgYW5ub3RhdGlvbkNvbHVtbnM6IFRhYmxlQ29sdW1uW10pOiB2b2lkIHtcblx0XHQvLyBUaGlzIGFwcGxpZXMgdG8gdGhlIHRleHQgb25seSBhbm5vdGF0aW9uLCB1c2UgdGhlIGV4cG9ydCB0eXBlIG9mIHRoZSB0ZXh0IHByb3BlcnR5IGluc3RlYWQgb2YgdGhlIHZhbHVlLlxuXHRcdC8vIFRoZXJlIGFyZSAzIGNvbHVtbnMgdG8gYmUgY29uc2lkZXJlZCB0byB1cGRhdGUgdGhlIGV4cG9ydCB0eXBlIG9uIHRoZSBjaGlsZCBwcm9wZXJ0eVxuXHRcdGlmIChcblx0XHRcdGNvbHVtbi5wcm9wZXJ0eUluZm9zPy5sZW5ndGggPT09IDEgJiZcblx0XHRcdGNvbHVtbkV4cG9ydC5wcm9wZXJ0eS5sZW5ndGggPT09IDEgJiZcblx0XHRcdGNvbHVtbi5wcm9wZXJ0eUluZm9zWzBdID09PSBjb2x1bW5FeHBvcnQucHJvcGVydHlbMF1cblx0XHQpIHtcblx0XHRcdC8vIEZpcnN0IGNvbHVtbiBjb25zaWRlcmVkIGFzIGNvbXBsZXggYW5kIHBvaW50aW5nIHRvIGEgc2luZ2xlIGNoaWxkIHByb3BlcnR5XG5cdFx0XHRjb25zdCBjb2x1bW5Gcm9tQW5ub3RhdGlvbkNvbHVtbnMgPSBhbm5vdGF0aW9uQ29sdW1ucy5maW5kKFxuXHRcdFx0XHQvLyBTZWNvbmQgY29sdW1uIHJlZmVyZW5jZWQgYXMgYSBjaGlsZCBwcm9wZXJ0eSBmcm9tIHRoZSBmb3VuZCBjb21wbGV4IGNvbHVtblxuXHRcdFx0XHQoY29sKSA9PiAoY29sIGFzIEFubm90YXRpb25UYWJsZUNvbHVtbikucmVsYXRpdmVQYXRoID09PSBjb2x1bW5FeHBvcnQucHJvcGVydHlbMF1cblx0XHRcdCk7XG5cdFx0XHQvLyBBc3NpZ24gdG8gdGhlIGNvbHVtbiB0byBiZSBleHBvcnRlZCAodGhpcmQgY29sdW1uKSwgdGhlIHByb3BlcnR5IHR5cGUgb2YgdGhlIGNoaWxkIHByb3BlcnR5XG5cdFx0XHRjb2x1bW5FeHBvcnQudHlwZSA9IChjb2x1bW5Gcm9tQW5ub3RhdGlvbkNvbHVtbnMgYXMgQW5ub3RhdGlvblRhYmxlQ29sdW1uKT8uZXhwb3J0U2V0dGluZ3M/LnR5cGU7XG5cdFx0fVxuXHR9XG5cblx0cmVzdW1lQmluZGluZyhiUmVxdWVzdElmTm90SW5pdGlhbGl6ZWQ6IGJvb2xlYW4pIHtcblx0XHR0aGlzLnNldFByb3BlcnR5KFwiYmluZGluZ1N1c3BlbmRlZFwiLCBmYWxzZSk7XG5cdFx0aWYgKChiUmVxdWVzdElmTm90SW5pdGlhbGl6ZWQgJiYgISh0aGlzIGFzIGFueSkuZ2V0RGF0YUluaXRpYWxpemVkKCkpIHx8IHRoaXMuZ2V0UHJvcGVydHkoXCJvdXREYXRlZEJpbmRpbmdcIikpIHtcblx0XHRcdHRoaXMuc2V0UHJvcGVydHkoXCJvdXREYXRlZEJpbmRpbmdcIiwgZmFsc2UpO1xuXHRcdFx0KHRoaXMgYXMgYW55KS5nZXRDb250ZW50KCk/LnJlYmluZCgpO1xuXHRcdH1cblx0fVxuXG5cdHJlZnJlc2hOb3RBcHBsaWNhYmxlRmllbGRzKG9GaWx0ZXJDb250cm9sOiBDb250cm9sKTogYW55W10ge1xuXHRcdGNvbnN0IG9UYWJsZSA9ICh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpO1xuXHRcdHJldHVybiBGaWx0ZXJVdGlscy5nZXROb3RBcHBsaWNhYmxlRmlsdGVycyhvRmlsdGVyQ29udHJvbCwgb1RhYmxlKTtcblx0fVxuXG5cdHN1c3BlbmRCaW5kaW5nKCkge1xuXHRcdHRoaXMuc2V0UHJvcGVydHkoXCJiaW5kaW5nU3VzcGVuZGVkXCIsIHRydWUpO1xuXHR9XG5cblx0aW52YWxpZGF0ZUNvbnRlbnQoKSB7XG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcImRhdGFJbml0aWFsaXplZFwiLCBmYWxzZSk7XG5cdFx0dGhpcy5zZXRQcm9wZXJ0eShcIm91dERhdGVkQmluZGluZ1wiLCBmYWxzZSk7XG5cdH1cblxuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0b25NYXNzRWRpdEJ1dHRvblByZXNzZWQob0V2ZW50OiBVSTVFdmVudCwgcGFnZUNvbnRyb2xsZXI6IGFueSkge1xuXHRcdGNvbnN0IG9UYWJsZSA9IHRoaXMuY29udGVudDtcblx0XHRpZiAocGFnZUNvbnRyb2xsZXIgJiYgcGFnZUNvbnRyb2xsZXIubWFzc0VkaXQpIHtcblx0XHRcdHBhZ2VDb250cm9sbGVyLm1hc3NFZGl0Lm9wZW5NYXNzRWRpdERpYWxvZyhvVGFibGUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRMb2cud2FybmluZyhcIlRoZSBDb250cm9sbGVyIGlzIG5vdCBlbmhhbmNlZCB3aXRoIE1hc3MgRWRpdCBmdW5jdGlvbmFsaXR5XCIpO1xuXHRcdH1cblx0fVxuXHRAeG1sRXZlbnRIYW5kbGVyKClcblx0b25UYWJsZVNlbGVjdGlvbkNoYW5nZShvRXZlbnQ6IFVJNUV2ZW50KSB7XG5cdFx0dGhpcy5maXJlRXZlbnQoXCJzZWxlY3Rpb25DaGFuZ2VcIiwgb0V2ZW50LmdldFBhcmFtZXRlcnMoKSk7XG5cdH1cblxuXHQvKipcblx0ICogRXhwb3NlIHRoZSBpbnRlcm5hbCB0YWJsZSBkZWZpbml0aW9uIGZvciBleHRlcm5hbCB1c2FnZSBpbiBkZWxlZ2F0ZS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIHRhYmxlRGVmaW5pdGlvblxuXHQgKi9cblx0Z2V0VGFibGVEZWZpbml0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLnRhYmxlRGVmaW5pdGlvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBjb25uZWN0IHRoZSBmaWx0ZXIgdG8gdGhlIHRhYmxlQVBJIGlmIHJlcXVpcmVkXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLlRhYmxlQVBJXG5cdCAqL1xuXG5cdHVwZGF0ZUZpbHRlckJhcigpIHtcblx0XHRjb25zdCB0YWJsZSA9ICh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpO1xuXHRcdGNvbnN0IGZpbHRlckJhclJlZklkID0gKHRoaXMgYXMgYW55KS5nZXRGaWx0ZXJCYXIoKTtcblx0XHRpZiAodGFibGUgJiYgZmlsdGVyQmFyUmVmSWQgJiYgdGFibGUuZ2V0RmlsdGVyKCkgIT09IGZpbHRlckJhclJlZklkKSB7XG5cdFx0XHR0aGlzLl9zZXRGaWx0ZXJCYXIoZmlsdGVyQmFyUmVmSWQpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBTZXRzIHRoZSBmaWx0ZXIgZGVwZW5kaW5nIG9uIHRoZSB0eXBlIG9mIGZpbHRlckJhci5cblx0ICpcblx0ICogQHBhcmFtIGZpbHRlckJhclJlZklkIElkIG9mIHRoZSBmaWx0ZXIgYmFyXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBhbGlhcyBzYXAuZmUubWFjcm9zLlRhYmxlQVBJXG5cdCAqL1xuXHRfc2V0RmlsdGVyQmFyKGZpbHRlckJhclJlZklkOiBzdHJpbmcpOiB2b2lkIHtcblx0XHRjb25zdCB0YWJsZSA9ICh0aGlzIGFzIGFueSkuZ2V0Q29udGVudCgpO1xuXHRcdGNvbnN0IGNvcmUgPSBzYXAudWkuZ2V0Q29yZSgpO1xuXG5cdFx0Ly8gJ2ZpbHRlckJhcicgcHJvcGVydHkgb2YgbWFjcm86VGFibGUocGFzc2VkIGFzIGN1c3RvbURhdGEpIG1pZ2h0IGJlXG5cdFx0Ly8gMS4gQSBsb2NhbElkIHdydCBWaWV3KEZQTSBleHBsb3JlciBleGFtcGxlKS5cblx0XHQvLyAyLiBBYnNvbHV0ZSBJZCh0aGlzIHdhcyBub3Qgc3VwcG9ydGVkIGluIG9sZGVyIHZlcnNpb25zKS5cblx0XHQvLyAzLiBBIGxvY2FsSWQgd3J0IEZyYWdtZW50SWQod2hlbiBhbiBYTUxDb21wb3NpdGUgb3IgRnJhZ21lbnQgaXMgaW5kZXBlbmRlbnRseSBwcm9jZXNzZWQpIGluc3RlYWQgb2YgVmlld0lkLlxuXHRcdC8vICAgICdmaWx0ZXJCYXInIHdhcyBzdXBwb3J0ZWQgZWFybGllciBhcyBhbiAnYXNzb2NpYXRpb24nIHRvIHRoZSAnbWRjOlRhYmxlJyBjb250cm9sIGluc2lkZSAnbWFjcm86VGFibGUnIGluIHByaW9yIHZlcnNpb25zLlxuXHRcdC8vICAgIEluIG5ld2VyIHZlcnNpb25zICdmaWx0ZXJCYXInIGlzIHVzZWQgbGlrZSBhbiBhc3NvY2lhdGlvbiB0byAnbWFjcm86VGFibGVBUEknLlxuXHRcdC8vICAgIFRoaXMgbWVhbnMgdGhhdCB0aGUgSWQgaXMgcmVsYXRpdmUgdG8gJ21hY3JvOlRhYmxlQVBJJy5cblx0XHQvLyAgICBUaGlzIHNjZW5hcmlvIGhhcHBlbnMgaW4gY2FzZSBvZiBGaWx0ZXJCYXIgYW5kIFRhYmxlIGluIGEgY3VzdG9tIHNlY3Rpb25zIGluIE9QIG9mIEZFVjQuXG5cblx0XHRjb25zdCB0YWJsZUFQSUlkID0gdGhpcz8uZ2V0SWQoKTtcblx0XHRjb25zdCB0YWJsZUFQSUxvY2FsSWQgPSB0aGlzLmRhdGEoXCJ0YWJsZUFQSUxvY2FsSWRcIik7XG5cdFx0Y29uc3QgcG90ZW50aWFsZmlsdGVyQmFySWQgPVxuXHRcdFx0dGFibGVBUElMb2NhbElkICYmIGZpbHRlckJhclJlZklkICYmIHRhYmxlQVBJSWQgJiYgdGFibGVBUElJZC5yZXBsYWNlKG5ldyBSZWdFeHAodGFibGVBUElMb2NhbElkICsgXCIkXCIpLCBmaWx0ZXJCYXJSZWZJZCk7IC8vIDNcblxuXHRcdGNvbnN0IGZpbHRlckJhciA9XG5cdFx0XHRDb21tb25VdGlscy5nZXRUYXJnZXRWaWV3KHRoaXMpPy5ieUlkKGZpbHRlckJhclJlZklkKSB8fCBjb3JlLmJ5SWQoZmlsdGVyQmFyUmVmSWQpIHx8IGNvcmUuYnlJZChwb3RlbnRpYWxmaWx0ZXJCYXJJZCk7XG5cblx0XHRpZiAoZmlsdGVyQmFyKSB7XG5cdFx0XHRpZiAoZmlsdGVyQmFyLmlzQShcInNhcC5mZS5tYWNyb3MuZmlsdGVyQmFyLkZpbHRlckJhckFQSVwiKSkge1xuXHRcdFx0XHR0YWJsZS5zZXRGaWx0ZXIoYCR7ZmlsdGVyQmFyLmdldElkKCl9LWNvbnRlbnRgKTtcblx0XHRcdH0gZWxzZSBpZiAoZmlsdGVyQmFyLmlzQShcInNhcC51aS5tZGMuRmlsdGVyQmFyXCIpKSB7XG5cdFx0XHRcdHRhYmxlLnNldEZpbHRlcihmaWx0ZXJCYXIuZ2V0SWQoKSk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Y2hlY2tJZkNvbHVtbkV4aXN0cyhhRmlsdGVyZWRDb2x1bW1uczogYW55LCBjb2x1bW5OYW1lOiBhbnkpIHtcblx0XHRyZXR1cm4gYUZpbHRlcmVkQ29sdW1tbnMuc29tZShmdW5jdGlvbiAob0NvbHVtbjogYW55KSB7XG5cdFx0XHRpZiAoXG5cdFx0XHRcdChvQ29sdW1uPy5jb2x1bW5OYW1lID09PSBjb2x1bW5OYW1lICYmIG9Db2x1bW4/LnNDb2x1bW5OYW1lVmlzaWJsZSkgfHxcblx0XHRcdFx0KG9Db2x1bW4/LnNUZXh0QXJyYW5nZW1lbnQgIT09IHVuZGVmaW5lZCAmJiBvQ29sdW1uPy5zVGV4dEFycmFuZ2VtZW50ID09PSBjb2x1bW5OYW1lKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHJldHVybiBjb2x1bW5OYW1lO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cdGdldElkZW50aWZpZXJDb2x1bW4oKTogYW55IHtcblx0XHRjb25zdCBvVGFibGUgPSAodGhpcyBhcyBhbnkpLmdldENvbnRlbnQoKTtcblx0XHRjb25zdCBoZWFkZXJJbmZvVGl0bGVQYXRoID0gdGhpcy5nZXRUYWJsZURlZmluaXRpb24oKS5oZWFkZXJJbmZvVGl0bGU7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9UYWJsZSAmJiBvVGFibGUuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSxcblx0XHRcdHNDdXJyZW50RW50aXR5U2V0TmFtZSA9IG9UYWJsZS5kYXRhKFwibWV0YVBhdGhcIik7XG5cdFx0Y29uc3QgYVRlY2huaWNhbEtleXMgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzQ3VycmVudEVudGl0eVNldE5hbWV9LyRUeXBlLyRLZXlgKTtcblx0XHRjb25zdCBhRmlsdGVyZWRUZWNobmljYWxLZXlzOiBzdHJpbmdbXSA9IFtdO1xuXG5cdFx0aWYgKGFUZWNobmljYWxLZXlzICYmIGFUZWNobmljYWxLZXlzLmxlbmd0aCA+IDApIHtcblx0XHRcdGFUZWNobmljYWxLZXlzLmZvckVhY2goZnVuY3Rpb24gKHRlY2huaWNhbEtleTogc3RyaW5nKSB7XG5cdFx0XHRcdGlmICh0ZWNobmljYWxLZXkgIT09IFwiSXNBY3RpdmVFbnRpdHlcIikge1xuXHRcdFx0XHRcdGFGaWx0ZXJlZFRlY2huaWNhbEtleXMucHVzaCh0ZWNobmljYWxLZXkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0Y29uc3Qgc2VtYW50aWNLZXlDb2x1bW5zID0gdGhpcy5nZXRUYWJsZURlZmluaXRpb24oKS5zZW1hbnRpY0tleXM7XG5cblx0XHRjb25zdCBhVmlzaWJsZUNvbHVtbnM6IGFueSA9IFtdO1xuXHRcdGNvbnN0IGFGaWx0ZXJlZENvbHVtbW5zOiBhbnkgPSBbXTtcblx0XHRjb25zdCBhVGFibGVDb2x1bW5zID0gb1RhYmxlLmdldENvbHVtbnMoKTtcblx0XHRhVGFibGVDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24gKG9Db2x1bW46IGFueSkge1xuXHRcdFx0Y29uc3QgY29sdW1uID0gb0NvbHVtbj8uZ2V0RGF0YVByb3BlcnR5KCk7XG5cdFx0XHRhVmlzaWJsZUNvbHVtbnMucHVzaChjb2x1bW4pO1xuXHRcdH0pO1xuXG5cdFx0YVZpc2libGVDb2x1bW5zLmZvckVhY2goZnVuY3Rpb24gKG9Db2x1bW46IGFueSkge1xuXHRcdFx0Y29uc3Qgb1RleHRBcnJhbmdlbWVudCA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KGAke3NDdXJyZW50RW50aXR5U2V0TmFtZX0vJFR5cGUvJHtvQ29sdW1ufUBgKTtcblx0XHRcdGNvbnN0IHNUZXh0QXJyYW5nZW1lbnQgPSBvVGV4dEFycmFuZ2VtZW50ICYmIG9UZXh0QXJyYW5nZW1lbnRbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRcIl0/LiRQYXRoO1xuXHRcdFx0Y29uc3Qgc1RleHRQbGFjZW1lbnQgPVxuXHRcdFx0XHRvVGV4dEFycmFuZ2VtZW50ICYmXG5cdFx0XHRcdG9UZXh0QXJyYW5nZW1lbnRbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCJdPy4kRW51bU1lbWJlcjtcblx0XHRcdGFGaWx0ZXJlZENvbHVtbW5zLnB1c2goe1xuXHRcdFx0XHRjb2x1bW5OYW1lOiBvQ29sdW1uLFxuXHRcdFx0XHRzVGV4dEFycmFuZ2VtZW50OiBzVGV4dEFycmFuZ2VtZW50LFxuXHRcdFx0XHRzQ29sdW1uTmFtZVZpc2libGU6ICEoc1RleHRQbGFjZW1lbnQgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50VHlwZS9UZXh0T25seVwiKVxuXHRcdFx0fSk7XG5cdFx0fSk7XG5cdFx0bGV0IGNvbHVtbjogYW55O1xuXG5cdFx0aWYgKGhlYWRlckluZm9UaXRsZVBhdGggIT09IHVuZGVmaW5lZCAmJiB0aGlzLmNoZWNrSWZDb2x1bW5FeGlzdHMoYUZpbHRlcmVkQ29sdW1tbnMsIGhlYWRlckluZm9UaXRsZVBhdGgpKSB7XG5cdFx0XHRjb2x1bW4gPSBoZWFkZXJJbmZvVGl0bGVQYXRoO1xuXHRcdH0gZWxzZSBpZiAoXG5cdFx0XHRzZW1hbnRpY0tleUNvbHVtbnMgIT09IHVuZGVmaW5lZCAmJlxuXHRcdFx0c2VtYW50aWNLZXlDb2x1bW5zLmxlbmd0aCA9PT0gMSAmJlxuXHRcdFx0dGhpcy5jaGVja0lmQ29sdW1uRXhpc3RzKGFGaWx0ZXJlZENvbHVtbW5zLCBzZW1hbnRpY0tleUNvbHVtbnNbMF0pXG5cdFx0KSB7XG5cdFx0XHRjb2x1bW4gPSBzZW1hbnRpY0tleUNvbHVtbnNbMF07XG5cdFx0fSBlbHNlIGlmIChcblx0XHRcdGFGaWx0ZXJlZFRlY2huaWNhbEtleXMgIT09IHVuZGVmaW5lZCAmJlxuXHRcdFx0YUZpbHRlcmVkVGVjaG5pY2FsS2V5cy5sZW5ndGggPT09IDEgJiZcblx0XHRcdHRoaXMuY2hlY2tJZkNvbHVtbkV4aXN0cyhhRmlsdGVyZWRDb2x1bW1ucywgYUZpbHRlcmVkVGVjaG5pY2FsS2V5c1swXSlcblx0XHQpIHtcblx0XHRcdGNvbHVtbiA9IGFGaWx0ZXJlZFRlY2huaWNhbEtleXNbMF07XG5cdFx0fVxuXHRcdHJldHVybiBjb2x1bW47XG5cdH1cblxuXHRhc3luYyBzZXRVcEVtcHR5Um93cyhvVGFibGU6IFRhYmxlKSB7XG5cdFx0aWYgKHRoaXMudGFibGVEZWZpbml0aW9uLmNvbnRyb2w/LmNyZWF0aW9uTW9kZSAhPT0gQ3JlYXRpb25Nb2RlLklubGluZUNyZWF0aW9uUm93cykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBwV2FpdFRhYmxlUmVuZGVyZWQgPSBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSkgPT4ge1xuXHRcdFx0aWYgKG9UYWJsZS5nZXREb21SZWYoKSkge1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBkZWxlZ2F0ZSA9IHtcblx0XHRcdFx0XHRvbkFmdGVyUmVuZGVyaW5nOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRvVGFibGUucmVtb3ZlRXZlbnREZWxlZ2F0ZShkZWxlZ2F0ZSk7XG5cdFx0XHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRvVGFibGUuYWRkRXZlbnREZWxlZ2F0ZShkZWxlZ2F0ZSwgdGhpcyk7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdFx0YXdhaXQgcFdhaXRUYWJsZVJlbmRlcmVkO1xuXHRcdGNvbnN0IGJJc0luRWRpdE1vZGUgPSBvVGFibGUuZ2V0TW9kZWwoXCJ1aVwiKS5nZXRQcm9wZXJ0eShcIi9pc0VkaXRhYmxlXCIpO1xuXHRcdGlmICghYklzSW5FZGl0TW9kZSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHRjb25zdCBvQmluZGluZyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCkgYXMgT0RhdGFMaXN0QmluZGluZztcblx0XHRpZiAob0JpbmRpbmcuaXNSZXNvbHZlZCgpICYmIG9CaW5kaW5nLmlzTGVuZ3RoRmluYWwoKSkge1xuXHRcdFx0Y29uc3Qgc0NvbnRleHRQYXRoID0gb0JpbmRpbmcuZ2V0Q29udGV4dCgpLmdldFBhdGgoKTtcblx0XHRcdGNvbnN0IG9JbmFjdGl2ZUNvbnRleHQgPSBvQmluZGluZy5nZXRBbGxDdXJyZW50Q29udGV4dHMoKS5maW5kKGZ1bmN0aW9uIChvQ29udGV4dCkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbnRleHQuaXNJbmFjdGl2ZSgpICYmIG9Db250ZXh0LmdldFBhdGgoKS5zdGFydHNXaXRoKHNDb250ZXh0UGF0aCk7XG5cdFx0XHR9KTtcblx0XHRcdGlmICghb0luYWN0aXZlQ29udGV4dCkge1xuXHRcdFx0XHRhd2FpdCB0aGlzLl9jcmVhdGVFbXB0eVJvdyhvQmluZGluZywgb1RhYmxlKTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblx0YXN5bmMgX2NyZWF0ZUVtcHR5Um93KG9CaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nLCBvVGFibGU6IFRhYmxlKSB7XG5cdFx0Y29uc3QgaUlubGluZUNyZWF0aW9uUm93Q291bnQgPSB0aGlzLnRhYmxlRGVmaW5pdGlvbi5jb250cm9sPy5pbmxpbmVDcmVhdGlvblJvd0NvdW50IHx8IDI7XG5cdFx0Y29uc3QgYURhdGEgPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGlJbmxpbmVDcmVhdGlvblJvd0NvdW50OyBpICs9IDEpIHtcblx0XHRcdGFEYXRhLnB1c2goe30pO1xuXHRcdH1cblx0XHRjb25zdCBiQXRFbmQgPSBvVGFibGUuZGF0YShcInRhYmxlVHlwZVwiKSAhPT0gXCJSZXNwb25zaXZlVGFibGVcIjtcblx0XHRjb25zdCBiSW5hY3RpdmUgPSB0cnVlO1xuXHRcdGNvbnN0IG9WaWV3ID0gQ29tbW9uVXRpbHMuZ2V0VGFyZ2V0VmlldyhvVGFibGUpO1xuXHRcdGNvbnN0IG9Db250cm9sbGVyID0gb1ZpZXcuZ2V0Q29udHJvbGxlcigpO1xuXHRcdGNvbnN0IG9JbnRlcm5hbEVkaXRGbG93ID0gb0NvbnRyb2xsZXIuX2VkaXRGbG93O1xuXHRcdGlmICghdGhpcy5jcmVhdGluZ0VtcHR5Um93cykge1xuXHRcdFx0dGhpcy5jcmVhdGluZ0VtcHR5Um93cyA9IHRydWU7XG5cdFx0XHR0cnkge1xuXHRcdFx0XHRjb25zdCBhQ29udGV4dHMgPSBhd2FpdCBvSW50ZXJuYWxFZGl0Rmxvdy5jcmVhdGVNdWx0aXBsZURvY3VtZW50cyhcblx0XHRcdFx0XHRvQmluZGluZyxcblx0XHRcdFx0XHRhRGF0YSxcblx0XHRcdFx0XHRiQXRFbmQsXG5cdFx0XHRcdFx0ZmFsc2UsXG5cdFx0XHRcdFx0b0NvbnRyb2xsZXIuZWRpdEZsb3cub25CZWZvcmVDcmVhdGUsXG5cdFx0XHRcdFx0YkluYWN0aXZlXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGFDb250ZXh0cz8uZm9yRWFjaChmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdFx0XHRcdG9Db250ZXh0LmNyZWF0ZWQoKS5jYXRjaChmdW5jdGlvbiAob0Vycm9yOiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmICghb0Vycm9yLmNhbmNlbGVkKSB7XG5cdFx0XHRcdFx0XHRcdHRocm93IG9FcnJvcjtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSk7XG5cdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdExvZy5lcnJvcihlIGFzIGFueSk7XG5cdFx0XHR9IGZpbmFsbHkge1xuXHRcdFx0XHR0aGlzLmNyZWF0aW5nRW1wdHlSb3dzID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRhYmxlQVBJO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O0VBa2pCTyxnQkFBZ0JBLElBQUksRUFBRUMsT0FBTyxFQUFFO0lBQ3JDLElBQUk7TUFDSCxJQUFJQyxNQUFNLEdBQUdGLElBQUksRUFBRTtJQUNwQixDQUFDLENBQUMsT0FBTUcsQ0FBQyxFQUFFO01BQ1YsT0FBT0YsT0FBTyxDQUFDRSxDQUFDLENBQUM7SUFDbEI7SUFDQSxJQUFJRCxNQUFNLElBQUlBLE1BQU0sQ0FBQ0UsSUFBSSxFQUFFO01BQzFCLE9BQU9GLE1BQU0sQ0FBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFSCxPQUFPLENBQUM7SUFDcEM7SUFDQSxPQUFPQyxNQUFNO0VBQ2Q7RUFHTywwQkFBMEJGLElBQUksRUFBRUssU0FBUyxFQUFFO0lBQ2pELElBQUk7TUFDSCxJQUFJSCxNQUFNLEdBQUdGLElBQUksRUFBRTtJQUNwQixDQUFDLENBQUMsT0FBT0csQ0FBQyxFQUFFO01BQ1gsT0FBT0UsU0FBUyxDQUFDLElBQUksRUFBRUYsQ0FBQyxDQUFDO0lBQzFCO0lBQ0EsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLElBQUksRUFBRTtNQUMxQixPQUFPRixNQUFNLENBQUNFLElBQUksQ0FBQ0MsU0FBUyxDQUFDQyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFRCxTQUFTLENBQUNDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7SUFDNUU7SUFDQSxPQUFPRCxTQUFTLENBQUMsS0FBSyxFQUFFSCxNQUFNLENBQUM7RUFDaEM7RUFBQztFQUFBO0VBQUE7RUFBQTtFQUFBO0VBQUE7RUFqWkQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQWJBLElBZU1LLFFBQVEsV0FEYkMsY0FBYyxDQUFDLDhCQUE4QixDQUFDLFVBa0I3Q0MsUUFBUSxDQUFDO0lBQ1RDLElBQUksRUFBRSxRQUFRO0lBQ2RDLGFBQWEsRUFBRSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFFLG9CQUFvQixDQUFDO0lBQzdFQyxtQkFBbUIsRUFBRSxDQUNwQixxQ0FBcUMsRUFDckMsZ0RBQWdELEVBQ2hELHlEQUF5RDtFQUUzRCxDQUFDLENBQUMsVUFHREgsUUFBUSxDQUFDO0lBQUVDLElBQUksRUFBRTtFQUF1QixDQUFDLENBQUMsVUFVMUNELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBVSxDQUFDLENBQUMsVUFRN0JELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUU7RUFBUyxDQUFDLENBQUMsVUFRNUJELFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsU0FBUztJQUFFRyxZQUFZLEVBQUU7RUFBTSxDQUFDLENBQUMsVUFVbERKLFFBQVEsQ0FBQztJQUFFQyxJQUFJLEVBQUUsUUFBUTtJQUFFRyxZQUFZLEVBQUU7RUFBa0IsQ0FBQyxDQUFDLFVBUTdESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFVBUWpESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFdBUWxESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFdBUWxESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFdBVTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFdBUTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFO0VBQVMsQ0FBQyxDQUFDLFdBUTVCRCxRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFdBUWxESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQUssQ0FBQyxDQUFDLFdBUWpESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFdBUWxESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFFO0VBQU0sQ0FBQyxDQUFDLFdBUWxESixRQUFRLENBQUM7SUFBRUMsSUFBSSxFQUFFLFNBQVM7SUFBRUcsWUFBWSxFQUFF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QTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtJQUFBO0lBQUE7SUFBQTtJQUFBO0VBQUE7SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0VBQUEsT0FtdEJoQi9PLFFBQVE7QUFBQSJ9