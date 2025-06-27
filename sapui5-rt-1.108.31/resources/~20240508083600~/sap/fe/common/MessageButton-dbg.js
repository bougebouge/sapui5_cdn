/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/UriParameters", "sap/fe/common/MessagePopover", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/ClassSupport", "sap/m/Button", "sap/m/ColumnListItem", "sap/m/Dialog", "sap/m/FormattedText", "sap/m/library", "sap/ui/core/Core", "sap/ui/core/library", "sap/ui/core/mvc/View", "sap/ui/model/Filter", "sap/ui/model/FilterOperator", "sap/ui/model/Sorter"], function (Log, UriParameters, MessagePopover, CommonUtils, ClassSupport, Button, ColumnListItem, Dialog, FormattedText, library, Core, coreLibrary, View, Filter, FilterOperator, Sorter) {
  "use strict";

  var _dec, _dec2, _dec3, _class, _class2, _descriptor, _descriptor2;
  var MessageType = coreLibrary.MessageType;
  var ButtonType = library.ButtonType;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var aggregation = ClassSupport.aggregation;
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
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  var MessageButton = (_dec = defineUI5Class("sap.fe.common.MessageButton"), _dec2 = aggregation({
    type: "sap.fe.common.MessageFilter",
    multiple: true,
    singularName: "customFilter"
  }), _dec3 = event(), _dec(_class = (_class2 = /*#__PURE__*/function (_Button) {
    _inheritsLoose(MessageButton, _Button);
    function MessageButton() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _Button.call.apply(_Button, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "customFilters", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "messageChange", _descriptor2, _assertThisInitialized(_this));
      _this.sLastActionText = "";
      _this.sGeneralGroupText = "";
      _this.sViewId = "";
      return _this;
    }
    var _proto = MessageButton.prototype;
    _proto.init = function init() {
      Button.prototype.init.apply(this);
      //press event handler attached to open the message popover
      this.attachPress(this.handleMessagePopoverPress, this);
      this.oMessagePopover = new MessagePopover();
      this.oItemBinding = this.oMessagePopover.getBinding("items");
      this.oItemBinding.attachChange(this._setMessageData, this);
      var messageButtonId = this.getId();
      if (messageButtonId) {
        this.oMessagePopover.addCustomData(new sap.ui.core.CustomData({
          key: "messageButtonId",
          value: messageButtonId
        })); // TODO check for custom data type
      }

      this.attachModelContextChange(this._applyFiltersAndSort.bind(this));
      this.oMessagePopover.attachActiveTitlePress(this._activeTitlePress.bind(this));
    }

    /**
     * The method that is called when a user clicks on the MessageButton control.
     *
     * @param oEvent Event object
     */;
    _proto.handleMessagePopoverPress = function handleMessagePopoverPress(oEvent) {
      this.oMessagePopover.toggle(oEvent.getSource());
    }

    /**
     * The method that groups the messages based on the section or subsection they belong to.
     * This method force the loading of contexts for all tables before to apply the grouping.
     *
     * @param oView Current view.
     * @returns Return promise.
     * @private
     */;
    _proto._applyGroupingAsync = function _applyGroupingAsync(oView) {
      try {
        var _this3 = this;
        var aWaitForData = [];
        var oViewBindingContext = oView.getBindingContext();
        var _findTablesRelatedToMessages = function (view) {
          var oRes = [];
          var aMessages = _this3.oItemBinding.getContexts().map(function (oContext) {
            return oContext.getObject();
          });
          var oViewContext = view.getBindingContext();
          if (oViewContext) {
            var oObjectPage = view.getContent()[0];
            _this3.getVisibleSectionsFromObjectPageLayout(oObjectPage).forEach(function (oSection) {
              oSection.getSubSections().forEach(function (oSubSection) {
                oSubSection.findElements(true).forEach(function (oElem) {
                  if (oElem.isA("sap.ui.mdc.Table")) {
                    for (var i = 0; i < aMessages.length; i++) {
                      var oRowBinding = oElem.getRowBinding();
                      if (oRowBinding) {
                        var sElemeBindingPath = "".concat(oViewContext.getPath(), "/").concat(oElem.getRowBinding().getPath());
                        if (aMessages[i].target.indexOf(sElemeBindingPath) === 0) {
                          oRes.push({
                            table: oElem,
                            subsection: oSubSection
                          });
                          break;
                        }
                      }
                    }
                  }
                });
              });
            });
          }
          return oRes;
        };
        // Search for table related to Messages and initialize the binding context of the parent subsection to retrieve the data
        var oTables = _findTablesRelatedToMessages.bind(_this3)(oView);
        oTables.forEach(function (_oTable) {
          var _oMDCTable$getBinding;
          var oMDCTable = _oTable.table,
            oSubsection = _oTable.subsection;
          if (!oMDCTable.getBindingContext() || ((_oMDCTable$getBinding = oMDCTable.getBindingContext()) === null || _oMDCTable$getBinding === void 0 ? void 0 : _oMDCTable$getBinding.getPath()) !== (oViewBindingContext === null || oViewBindingContext === void 0 ? void 0 : oViewBindingContext.getPath())) {
            oSubsection.setBindingContext(oViewBindingContext);
            if (!oMDCTable.getRowBinding().isLengthFinal()) {
              aWaitForData.push(new Promise(function (resolve) {
                oMDCTable.getRowBinding().attachEventOnce("dataReceived", function () {
                  resolve();
                });
              }));
            }
          }
        });
        var waitForGroupingApplied = new Promise(function (resolve) {
          setTimeout(function () {
            try {
              _this3._applyGrouping();
              resolve();
              return Promise.resolve();
            } catch (e) {
              return Promise.reject(e);
            }
          }, 0);
        });
        var _temp2 = _catch(function () {
          return Promise.resolve(Promise.all(aWaitForData)).then(function () {
            oView.getModel().checkMessages();
            return Promise.resolve(waitForGroupingApplied).then(function () {});
          });
        }, function () {
          Log.error("Error while grouping the messages in the messagePopOver");
        });
        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * The method retrieves the visible sections from an object page.
     *
     * @param oObjectPageLayout The objectPageLayout object for which we want to retrieve the visible sections.
     * @returns Array of visible sections.
     * @private
     */
    ;
    _proto.getVisibleSectionsFromObjectPageLayout = function getVisibleSectionsFromObjectPageLayout(oObjectPageLayout) {
      return oObjectPageLayout.getSections().filter(function (oSection) {
        return oSection.getVisible();
      });
    }

    /**
     * The method that groups the messages based on the section or subsection they belong to.
     *
     * @private
     */;
    _proto._applyGrouping = function _applyGrouping() {
      this.oObjectPageLayout = this._getObjectPageLayout(this, this.oObjectPageLayout);
      if (!this.oObjectPageLayout) {
        return;
      }
      var aMessages = this.oMessagePopover.getItems();
      var aSections = this.getVisibleSectionsFromObjectPageLayout(this.oObjectPageLayout);
      var bEnableBinding = this._checkControlIdInSections(aMessages, false);
      if (bEnableBinding) {
        this._fnEnableBindings(aSections);
      }
    }

    /**
     * The method retrieves the binding context for the refError object.
     * The refError contains a map to store the indexes of the rows with errors.
     *
     * @param oTable The table for which we want to get the refError Object.
     * @returns Context of the refError.
     * @private
     */;
    _proto._getTableRefErrorContext = function _getTableRefErrorContext(oTable) {
      var oModel = oTable.getModel("internal");
      //initialize the refError property if it doesn't exist
      if (!oTable.getBindingContext("internal").getProperty("refError")) {
        oModel.setProperty("refError", {}, oTable.getBindingContext("internal"));
      }
      var sRefErrorContextPath = oTable.getBindingContext("internal").getPath() + "/refError/" + oTable.getBindingContext().getPath().replace("/", "$") + "$" + oTable.getRowBinding().getPath().replace("/", "$");
      var oContext = oModel.getContext(sRefErrorContextPath);
      if (!oContext.getProperty("")) {
        oModel.setProperty("", {}, oContext);
      }
      return oContext;
    };
    _proto._updateInternalModel = function _updateInternalModel(oTableRowContext, iRowIndex, sTableTargetColProperty, oTable, oMessageObject, bIsCreationRow) {
      var oTemp;
      if (bIsCreationRow) {
        oTemp = {
          rowIndex: "CreationRow",
          targetColProperty: sTableTargetColProperty ? sTableTargetColProperty : ""
        };
      } else {
        oTemp = {
          rowIndex: oTableRowContext ? iRowIndex : "",
          targetColProperty: sTableTargetColProperty ? sTableTargetColProperty : ""
        };
      }
      var oModel = oTable.getModel("internal"),
        oContext = this._getTableRefErrorContext(oTable);
      //we first remove the entries with obsolete message ids from the internal model before inserting the new error info :
      var aValidMessageIds = sap.ui.getCore().getMessageManager().getMessageModel().getData().map(function (message) {
        return message.id;
      });
      var aObsoleteMessagelIds;
      if (oContext.getProperty()) {
        aObsoleteMessagelIds = Object.keys(oContext.getProperty()).filter(function (internalMessageId) {
          return aValidMessageIds.indexOf(internalMessageId) === -1;
        });
        aObsoleteMessagelIds.forEach(function (obsoleteId) {
          delete oContext.getProperty()[obsoleteId];
        });
      }
      oModel.setProperty(oMessageObject.getId(), Object.assign({}, oContext.getProperty(oMessageObject.getId()) ? oContext.getProperty(oMessageObject.getId()) : {}, oTemp), oContext);
    };
    _proto._getControlFromMessageRelatingToSubSection = function _getControlFromMessageRelatingToSubSection(subSection, message) {
      var _this4 = this;
      var oMessageObject = message.getBindingContext("message").getObject();
      return subSection.findElements(true, function (oElem) {
        return _this4._fnFilterUponIds(oMessageObject.getControlIds(), oElem);
      }).sort(function (a, b) {
        // controls are sorted in order to have the table on top of the array
        // it will help to compute the subtitle of the message based on the type of related controls
        if (a.isA("sap.ui.mdc.Table") && !b.isA("sap.ui.mdc.Table")) {
          return -1;
        }
        return 1;
      });
    }

    /**
     * The method that sets groups for transient messages.
     *
     * @param {object} message The transient message for which we want to compute and set group.
     * @param {string} sActionName The action name.
     * @private
     */;
    _proto._setGroupLabelForTransientMsg = function _setGroupLabelForTransientMsg(message, sActionName) {
      this.sLastActionText = this.sLastActionText ? this.sLastActionText : Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_LAST_ACTION");
      message.setGroupName("".concat(this.sLastActionText, ": ").concat(sActionName));
    }

    /**
     * The method that group messages and add the subtitle.
     *
     * @param {object} message The message we want to compute group and subtitle.
     * @param {object} section The section containing the controls.
     * @param {object} subSection The subsection containing the controls.
     * @param {object} aElements List of controls from a subsection related to a message.
     * @param {boolean} bMultipleSubSections True if there is more than 1 subsection in the section.
     * @param {string} sActionName The action name.
     * @returns {object} Return the control targeted by the message.
     * @private
     */;
    _proto._computeMessageGroupAndSubTitle = function _computeMessageGroupAndSubTitle(message, section, subSection, aElements, bMultipleSubSections, sActionName) {
      var _message$getBindingCo;
      this.oItemBinding.detachChange(this._setMessageData, this);
      var oMessageObject = (_message$getBindingCo = message.getBindingContext("message")) === null || _message$getBindingCo === void 0 ? void 0 : _message$getBindingCo.getObject();
      var oElement,
        oTable,
        oTargetTableInfo,
        l,
        iRowIndex,
        oTargetedControl,
        bIsCreationRow,
        sMessageSubtitle = "";
      var bIsBackendMessage = new RegExp("^/").test(oMessageObject === null || oMessageObject === void 0 ? void 0 : oMessageObject.getTargets()[0]),
        oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
      if (bIsBackendMessage) {
        for (l = 0; l < aElements.length; l++) {
          oElement = aElements[l];
          oTargetedControl = oElement;
          if (oElement.isA("sap.m.Table") || oElement.isA("sap.ui.table.Table")) {
            oTargetTableInfo = {};
            oTable = oElement.getParent();
            oTargetTableInfo.tableHeader = oTable.getHeader();
            var oRowBinding = oTable.getRowBinding();
            if (oRowBinding && oRowBinding.isLengthFinal() && oTable.getBindingContext()) {
              oTargetTableInfo.sTableTargetColProperty = this._getTableColProperty(oTable, oMessageObject);
              var oTableColInfo = this._getTableColInfo(oTable, oTargetTableInfo.sTableTargetColProperty);
              oTargetTableInfo.oTableRowBindingContexts = oElement.isA("sap.ui.table.Table") ? oRowBinding.getContexts() : oRowBinding.getCurrentContexts();
              oTargetTableInfo.sTableTargetColName = oTableColInfo.sTableTargetColName;
              oTargetTableInfo.sTableTargetProperty = oTargetTableInfo.sTableTargetColProperty;
              oTargetTableInfo.sTableTargetColProperty = oTableColInfo.sTableTargetColProperty;
              oTargetTableInfo.oTableRowContext = oTargetTableInfo.oTableRowBindingContexts.find(function (messageObject, rowContext) {
                return rowContext && messageObject.getTargets()[0].indexOf(rowContext.getPath()) === 0;
              }.bind(this, oMessageObject));
              var sControlId = void 0;
              if (!oTargetTableInfo.oTableRowContext) {
                sControlId = oMessageObject.getControlIds().find(function (table, sId) {
                  return this._IsControlInTable(table, sId);
                }.bind(this, oTable));
              }
              if (sControlId) {
                var oControl = Core.byId(sControlId);
                bIsCreationRow = this._IsControlPartOfCreationRow(oControl);
              }
              sMessageSubtitle = this._getMessageSubtitle(message, oTargetTableInfo.oTableRowBindingContexts, oTargetTableInfo.oTableRowContext, oTargetTableInfo.sTableTargetColName, oResourceBundle, oTable, bIsCreationRow);
              //set the subtitle
              message.setSubtitle(sMessageSubtitle);
              message.setActiveTitle(!!oTargetTableInfo.oTableRowContext);
              if (oTargetTableInfo.oTableRowContext) {
                this._formatMessageDescription(message, oTargetTableInfo.oTableRowContext, oTargetTableInfo.sTableTargetColName, oResourceBundle, oTable);
              }
              iRowIndex = oTargetTableInfo.oTableRowContext && oTargetTableInfo.oTableRowContext.getIndex();
              this._updateInternalModel(oTargetTableInfo.oTableRowContext, iRowIndex, oTargetTableInfo.sTableTargetColProperty, oTable, oMessageObject);
            }
          } else {
            message.setActiveTitle(true);
            //check if the targeted control is a child of one of the other controls
            var bIsTargetedControlOrphan = this._bIsOrphanElement(oTargetedControl, aElements);
            if (bIsTargetedControlOrphan) {
              //set the subtitle
              message.setSubtitle(sMessageSubtitle);
              break;
            }
          }
        }
      } else {
        //There is only one elt as this is a frontEnd message
        oTargetedControl = aElements[0];
        oTable = this._getMdcTable(oTargetedControl);
        if (oTable) {
          oTargetTableInfo = {};
          oTargetTableInfo.tableHeader = oTable.getHeader();
          var iTargetColumnIndex = this._getTableColumnIndex(oTargetedControl);
          oTargetTableInfo.sTableTargetColProperty = iTargetColumnIndex > -1 ? oTable.getColumns()[iTargetColumnIndex].getDataProperty() : undefined;
          oTargetTableInfo.sTableTargetProperty = oTargetTableInfo.sTableTargetColProperty;
          oTargetTableInfo.sTableTargetColName = oTargetTableInfo.sTableTargetColProperty && iTargetColumnIndex > -1 ? oTable.getColumns()[iTargetColumnIndex].getHeader() : undefined;
          bIsCreationRow = this._getTableRow(oTargetedControl).isA("sap.ui.table.CreationRow");
          if (!bIsCreationRow) {
            iRowIndex = this._getTableRowIndex(oTargetedControl);
            oTargetTableInfo.oTableRowBindingContexts = oTable.getRowBinding().getCurrentContexts();
            oTargetTableInfo.oTableRowContext = oTargetTableInfo.oTableRowBindingContexts[iRowIndex];
          }
          sMessageSubtitle = this._getMessageSubtitle(message, oTargetTableInfo.oTableRowBindingContexts, oTargetTableInfo.oTableRowContext, oTargetTableInfo.sTableTargetColName, oResourceBundle, oTable, bIsCreationRow, iTargetColumnIndex === 0 && oTargetedControl.getValueState() === "Error" ? oTargetedControl : undefined);
          //set the subtitle
          message.setSubtitle(sMessageSubtitle);
          message.setActiveTitle(true);
          this._updateInternalModel(oTargetTableInfo.oTableRowContext, iRowIndex, oTargetTableInfo.sTableTargetColProperty, oTable, oMessageObject, bIsCreationRow);
        }
      }
      if (oMessageObject.getPersistent() && sActionName) {
        this._setGroupLabelForTransientMsg(message, sActionName);
      } else {
        message.setGroupName(section.getTitle() + (subSection.getTitle() && bMultipleSubSections ? ", ".concat(subSection.getTitle()) : "") + (oTargetTableInfo ? ", ".concat(oResourceBundle.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR"), ": ").concat(oTargetTableInfo.tableHeader) : ""));
        var sViewId = this._getViewId(this.getId());
        var oView = Core.byId(sViewId);
        var oMessageTargetProperty = oMessageObject.getTargets()[0] && oMessageObject.getTargets()[0].split("/").pop();
        var oUIModel = oView === null || oView === void 0 ? void 0 : oView.getModel("internal");
        if (oUIModel && oUIModel.getProperty("/messageTargetProperty") && oMessageTargetProperty && oMessageTargetProperty === oUIModel.getProperty("/messageTargetProperty")) {
          this.oMessagePopover.fireActiveTitlePress({
            "item": message
          });
          oUIModel.setProperty("/messageTargetProperty", false);
        }
      }
      this.oItemBinding.attachChange(this._setMessageData, this);
      return oTargetedControl;
    };
    _proto._checkControlIdInSections = function _checkControlIdInSections(aMessages, bEnableBinding) {
      var section, aSubSections, message, i, j, k;
      this.sGeneralGroupText = this.sGeneralGroupText ? this.sGeneralGroupText : Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_GENERAL");
      //Get all sections from the object page layout
      var aVisibleSections = this.getVisibleSectionsFromObjectPageLayout(this.oObjectPageLayout);
      if (aVisibleSections) {
        var _oView$getBindingCont;
        var viewId = this._getViewId(this.getId());
        var oView = Core.byId(viewId);
        var sActionName = oView === null || oView === void 0 ? void 0 : (_oView$getBindingCont = oView.getBindingContext("internal")) === null || _oView$getBindingCont === void 0 ? void 0 : _oView$getBindingCont.getProperty("sActionName");
        if (sActionName) {
          (oView === null || oView === void 0 ? void 0 : oView.getBindingContext("internal")).setProperty("sActionName", null);
        }
        for (i = aMessages.length - 1; i >= 0; --i) {
          // Loop over all messages
          message = aMessages[i];
          var bIsGeneralGroupName = true;
          for (j = aVisibleSections.length - 1; j >= 0; --j) {
            // Loop over all visible sections
            section = aVisibleSections[j];
            aSubSections = section.getSubSections();
            for (k = aSubSections.length - 1; k >= 0; --k) {
              // Loop over all sub-sections
              var subSection = aSubSections[k];
              var aControls = this._getControlFromMessageRelatingToSubSection(subSection, message);
              if (aControls.length > 0) {
                var oTargetedControl = this._computeMessageGroupAndSubTitle(message, section, subSection, aControls, aSubSections.length > 1, sActionName);
                // if we found table that matches with the message, we don't stop the loop
                // in case we find an additional control (eg mdc field) that also match with the message
                if (oTargetedControl && !oTargetedControl.isA("sap.m.Table") && !oTargetedControl.isA("sap.ui.table.Table")) {
                  j = k = -1;
                }
                bIsGeneralGroupName = false;
              }
            }
          }
          if (bIsGeneralGroupName) {
            var oMessageObject = message.getBindingContext("message").getObject();
            message.setActiveTitle(false);
            if (oMessageObject.persistent && sActionName) {
              this._setGroupLabelForTransientMsg(message, sActionName);
            } else {
              message.setGroupName(this.sGeneralGroupText);
            }
          }
          if (!bEnableBinding && message.getGroupName() === this.sGeneralGroupText && this._findTargetForMessage(message)) {
            return true;
          }
        }
      }
    };
    _proto._findTargetForMessage = function _findTargetForMessage(message) {
      var messageObject = message.getBindingContext("message") && message.getBindingContext("message").getObject();
      if (messageObject && messageObject.target) {
        var oMetaModel = this.oObjectPageLayout && this.oObjectPageLayout.getModel() && this.oObjectPageLayout.getModel().getMetaModel(),
          contextPath = oMetaModel && oMetaModel.getMetaPath(messageObject.target),
          oContextPathMetadata = oMetaModel && oMetaModel.getObject(contextPath);
        if (oContextPathMetadata && oContextPathMetadata.$kind === "Property") {
          return true;
        }
      }
    };
    _proto._fnEnableBindings = function _fnEnableBindings(aSections) {
      if (UriParameters.fromQuery(window.location.search).get("sap-fe-xx-lazyloadingtest")) {
        return;
      }
      for (var iSection = 0; iSection < aSections.length; iSection++) {
        var oSection = aSections[iSection];
        var nonTableChartcontrolFound = false;
        var aSubSections = oSection.getSubSections();
        for (var iSubSection = 0; iSubSection < aSubSections.length; iSubSection++) {
          var oSubSection = aSubSections[iSubSection];
          var oAllBlocks = oSubSection.getBlocks();
          if (oAllBlocks) {
            for (var block = 0; block < oSubSection.getBlocks().length; block++) {
              if (oAllBlocks[block].getContent && !oAllBlocks[block].getContent().isA("sap.fe.macros.table.TableAPI")) {
                nonTableChartcontrolFound = true;
                break;
              }
            }
            if (nonTableChartcontrolFound) {
              oSubSection.setBindingContext(undefined);
            }
          }
          if (oSubSection.getBindingContext()) {
            this._findMessageGroupAfterRebinding();
            oSubSection.getBindingContext().getBinding().attachDataReceived(this._findMessageGroupAfterRebinding);
          }
        }
      }
    };
    _proto._findMessageGroupAfterRebinding = function _findMessageGroupAfterRebinding() {
      var aMessages = this.oMessagePopover.getItems();
      this._checkControlIdInSections(aMessages, true);
    }

    /**
     * The method that retrieves the view ID (HTMLView/XMLView/JSONview/JSView/Templateview) of any control.
     *
     * @param sControlId ID of the control needed to retrieve the view ID
     * @returns The view ID of the control
     */;
    _proto._getViewId = function _getViewId(sControlId) {
      var sViewId,
        oControl = Core.byId(sControlId);
      while (oControl) {
        if (oControl instanceof View) {
          sViewId = oControl.getId();
          break;
        }
        oControl = oControl.getParent();
      }
      return sViewId;
    };
    _proto._setLongtextUrlDescription = function _setLongtextUrlDescription(sMessageDescriptionContent, oDiagnosisTitle) {
      this.oMessagePopover.setAsyncDescriptionHandler(function (config) {
        // This stores the old description
        var sOldDescription = sMessageDescriptionContent;
        // Here we can fetch the data and concatenate it to the old one
        // By default, the longtextUrl fetching will overwrite the description (with the default behaviour)
        // Here as we have overwritten the default async handler, which fetches and replaces the description of the item
        // we can manually modify it to include whatever needed.
        var sLongTextUrl = config.item.getLongtextUrl();
        if (sLongTextUrl) {
          jQuery.ajax({
            type: "GET",
            url: sLongTextUrl,
            success: function (data) {
              var sDiagnosisText = oDiagnosisTitle.getHtmlText() + data;
              config.item.setDescription("".concat(sOldDescription).concat(sDiagnosisText));
              config.promise.resolve();
            },
            error: function () {
              config.item.setDescription(sMessageDescriptionContent);
              var sError = "A request has failed for long text data. URL: ".concat(sLongTextUrl);
              Log.error(sError);
              config.promise.reject(sError);
            }
          });
        }
      });
    };
    _proto._formatMessageDescription = function _formatMessageDescription(message, oTableRowContext, sTableTargetColName, oResourceBundle, oTable) {
      var sTableFirstColProperty = oTable.getParent().getIdentifierColumn();
      var sColumnInfo = "";
      var oColFromTableSettings = this._fetchColumnInfo(message, oTable);
      if (sTableTargetColName) {
        // if column in present in table definition
        sColumnInfo = "".concat(oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN"), ": ").concat(sTableTargetColName);
      } else if (oColFromTableSettings) {
        if (oColFromTableSettings.availability === "Hidden") {
          // if column in neither in table definition nor personalization
          if (message.getType() === "Error") {
            sColumnInfo = sTableFirstColProperty ? "".concat(oResourceBundle.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC_ERROR"), " ").concat(oTableRowContext.getValue(sTableFirstColProperty)) + "." : "".concat(oResourceBundle.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC_ERROR")) + ".";
          } else {
            sColumnInfo = sTableFirstColProperty ? "".concat(oResourceBundle.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC"), " ").concat(oTableRowContext.getValue(sTableFirstColProperty)) + "." : "".concat(oResourceBundle.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC")) + ".";
          }
        } else {
          // if column is not in table definition but in personalization
          //if no navigation to sub op then remove link to error field BCP : 2280168899
          if (!this._navigationConfigured(oTable)) {
            message.setActiveTitle(false);
          }
          sColumnInfo = "".concat(oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN"), ": ").concat(oColFromTableSettings.label, " (").concat(oResourceBundle.getText("T_COLUMN_INDICATOR_IN_TABLE_DEFINITION"), ")");
        }
      }
      var oFieldsAffectedTitle = new FormattedText({
        htmlText: "<html><body><strong>".concat(oResourceBundle.getText("T_FIELDS_AFFECTED_TITLE"), "</strong></body></html><br>")
      });
      var sFieldAffectedText;
      if (sTableFirstColProperty) {
        sFieldAffectedText = "".concat(oFieldsAffectedTitle.getHtmlText(), "<br>").concat(oResourceBundle.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR"), ": ").concat(oTable.getHeader(), "<br>").concat(oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW"), ": ").concat(oTableRowContext.getValue(sTableFirstColProperty), "<br>").concat(sColumnInfo, "<br>");
      } else if (sColumnInfo == "" || !sColumnInfo) {
        sFieldAffectedText = "";
      } else {
        sFieldAffectedText = "".concat(oFieldsAffectedTitle.getHtmlText(), "<br>").concat(oResourceBundle.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR"), ": ").concat(oTable.getHeader(), "<br>").concat(sColumnInfo, "<br>");
      }
      var oDiagnosisTitle = new FormattedText({
        htmlText: "<html><body><strong>".concat(oResourceBundle.getText("T_DIAGNOSIS_TITLE"), "</strong></body></html><br>")
      });
      // get the UI messages from the message context to set it to Diagnosis section
      var sUIMessageDescription = message.getBindingContext("message").getObject().description;
      //set the description to null to reset it below
      message.setDescription(null);
      var sDiagnosisText = "";
      var sMessageDescriptionContent = "";
      if (message.getLongtextUrl()) {
        sMessageDescriptionContent = "".concat(sFieldAffectedText, "<br>");
        this._setLongtextUrlDescription(sMessageDescriptionContent, oDiagnosisTitle);
      } else if (sUIMessageDescription) {
        sDiagnosisText = "".concat(oDiagnosisTitle.getHtmlText(), "<br>").concat(sUIMessageDescription);
        sMessageDescriptionContent = "".concat(sFieldAffectedText, "<br>").concat(sDiagnosisText);
        message.setDescription(sMessageDescriptionContent);
      } else {
        message.setDescription(sFieldAffectedText);
      }
    }

    /**
     * Method to set the button text, count and icon property based upon the message items
     * ButtonType:  Possible settings for warning and error messages are 'critical' and 'negative'.
     *
     *
     * @private
     */;
    _proto._setMessageData = function _setMessageData() {
      var _this5 = this;
      clearTimeout(this._setMessageDataTimeout);
      this._setMessageDataTimeout = setTimeout(function () {
        try {
          var sIcon = "",
            oMessages = _this5.oMessagePopover.getItems(),
            oMessageCount = {
              Error: 0,
              Warning: 0,
              Success: 0,
              Information: 0
            },
            oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
            iMessageLength = oMessages.length;
          var sButtonType = ButtonType.Default,
            sMessageKey = "",
            sTooltipText = "",
            sMessageText = "";
          var _temp8 = function () {
            if (iMessageLength > 0) {
              function _temp9() {
                if (iMessageLength > 1) {
                  _this5.oMessagePopover.navigateBack();
                }
              }
              for (var i = 0; i < iMessageLength; i++) {
                if (!oMessages[i].getType() || oMessages[i].getType() === "") {
                  ++oMessageCount["Information"];
                } else {
                  ++oMessageCount[oMessages[i].getType()];
                }
              }
              if (oMessageCount[MessageType.Error] > 0) {
                sButtonType = ButtonType.Negative;
              } else if (oMessageCount[MessageType.Warning] > 0) {
                sButtonType = ButtonType.Critical;
              } else if (oMessageCount[MessageType.Success] > 0) {
                sButtonType = ButtonType.Success;
              } else if (oMessageCount[MessageType.Information] > 0) {
                sButtonType = ButtonType.Neutral;
              }
              if (oMessageCount.Error > 0) {
                _this5.setText(oMessageCount.Error);
              } else {
                _this5.setText("");
              }
              if (oMessageCount.Error === 1) {
                sMessageKey = "C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_TITLE_ERROR";
              } else if (oMessageCount.Error > 1) {
                sMessageKey = "C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_MULTIPLE_ERROR_TOOLTIP";
              } else if (!oMessageCount.Error && oMessageCount.Warning) {
                sMessageKey = "C_COMMON_SAPFE_ERROR_MESSAGES_PAGE_WARNING_TOOLTIP";
              } else if (!oMessageCount.Error && !oMessageCount.Warning && oMessageCount.Information) {
                sMessageKey = "C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_INFO";
              } else if (!oMessageCount.Error && !oMessageCount.Warning && !oMessageCount.Information && oMessageCount.Success) {
                sMessageKey = "C_MESSAGE_HANDLING_SAPFE_ERROR_MESSAGES_PAGE_TITLE_SUCCESS";
              }
              if (sMessageKey) {
                sMessageText = oResourceBundle.getText(sMessageKey);
                sTooltipText = oMessageCount.Error ? "".concat(oMessageCount.Error, " ").concat(sMessageText) : sMessageText;
                _this5.setTooltip(sTooltipText);
              }
              _this5.setIcon(sIcon);
              _this5.setType(sButtonType);
              _this5.setVisible(true);
              var oView = Core.byId(_this5.sViewId);
              var _temp10 = function () {
                if (oView) {
                  function _temp11() {
                    _this5.fireMessageChange({
                      iMessageLength: iMessageLength
                    });
                  }
                  var oPageReady = oView.getController().pageReady;
                  var _temp12 = _catch(function () {
                    return Promise.resolve(oPageReady.waitPageReady()).then(function () {
                      return Promise.resolve(_this5._applyGroupingAsync(oView)).then(function () {});
                    });
                  }, function () {
                    Log.error("fail grouping messages");
                  });
                  return _temp12 && _temp12.then ? _temp12.then(_temp11) : _temp11(_temp12);
                }
              }();
              return _temp10 && _temp10.then ? _temp10.then(_temp9) : _temp9(_temp10);
            } else {
              _this5.setVisible(false);
              _this5.fireMessageChange({
                iMessageLength: iMessageLength
              });
            }
          }();
          return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(function () {}) : void 0);
        } catch (e) {
          return Promise.reject(e);
        }
      }, 100);
    };
    _proto._bIsOrphanElement = function _bIsOrphanElement(oElement, aElements) {
      return !aElements.some(function (oOrphanElement, oElem) {
        var oParentElement = oOrphanElement.getParent();
        while (oParentElement && oParentElement !== oElem) {
          oParentElement = oParentElement.getParent();
        }
        return oParentElement ? true : false;
      }.bind(this, oElement));
    }

    /**
     * The method that is called when a user clicks on the title of the message.
     *
     * @function
     * @name _activeTitlePress
     * @private
     * @param oEvent Event object passed from the handler
     */;
    _proto._activeTitlePress = function _activeTitlePress(oEvent) {
      try {
        var _this7 = this;
        var oInternalModelContext = _this7.getBindingContext("pageInternal");
        oInternalModelContext.setProperty("errorNavigationSectionFlag", true);
        var oItem = oEvent.getParameter("item"),
          oMessage = oItem.getBindingContext("message").getObject(),
          bIsBackendMessage = new RegExp("^/").test(oMessage.getTarget()),
          oView = Core.byId(_this7.sViewId);
        var oControl, sSectionTitle;
        var _defaultFocus = function (message, mdcTable) {
          var focusInfo = {
            preventScroll: true,
            targetInfo: message
          };
          mdcTable.focus(focusInfo);
        };

        //check if the pressed item is related to a table control
        var _temp20 = function () {
          if (oItem.getGroupName().indexOf("Table:") !== -1) {
            var oTargetMdcTable;
            var _temp21 = function () {
              if (bIsBackendMessage) {
                oTargetMdcTable = oMessage.controlIds.map(function (sControlId) {
                  var control = Core.byId(sControlId);
                  var oParentControl = control && control.getParent();
                  return oParentControl && oParentControl.isA("sap.ui.mdc.Table") && oParentControl.getHeader() === oItem.getGroupName().split(", Table: ")[1] ? oParentControl : null;
                }).reduce(function (acc, val) {
                  return val ? val : acc;
                });
                var _temp22 = function () {
                  if (oTargetMdcTable) {
                    sSectionTitle = oItem.getGroupName().split(", ")[0];
                    var _temp23 = _catch(function () {
                      return Promise.resolve(_this7._navigateFromMessageToSectionTableInIconTabBarMode(oTargetMdcTable, _this7.oObjectPageLayout, sSectionTitle)).then(function () {
                        var oRefErrorContext = _this7._getTableRefErrorContext(oTargetMdcTable);
                        var oRefError = oRefErrorContext.getProperty(oItem.getBindingContext("message").getObject().getId());
                        var _setFocusOnTargetField = function (targetMdcTable, iRowIndex) {
                          try {
                            var aTargetMdcTableRow = _this7._getMdcTableRows(targetMdcTable),
                              iFirstVisibleRow = _this7._getGridTable(targetMdcTable).getFirstVisibleRow();
                            if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
                              var oTargetRow = aTargetMdcTableRow[iRowIndex - iFirstVisibleRow],
                                oTargetCell = _this7.getTargetCell(oTargetRow, oMessage);
                              if (oTargetCell) {
                                _this7.setFocusToControl(oTargetCell);
                                return Promise.resolve(undefined);
                              } else {
                                // control not found on table
                                var errorProperty = oMessage.getTarget().split("/").pop();
                                if (errorProperty) {
                                  oView.getModel("internal").setProperty("/messageTargetProperty", errorProperty);
                                }
                                if (_this7._navigationConfigured(targetMdcTable)) {
                                  return Promise.resolve(oView.getController()._routing.navigateForwardToContext(oTargetRow.getBindingContext()));
                                } else {
                                  return Promise.resolve(false);
                                }
                              }
                            }
                            return Promise.resolve(undefined);
                          } catch (e) {
                            return Promise.reject(e);
                          }
                        };
                        var _temp15 = function () {
                          if (oTargetMdcTable.data("tableType") === "GridTable" && oRefError.rowIndex !== "") {
                            var iFirstVisibleRow = _this7._getGridTable(oTargetMdcTable).getFirstVisibleRow();
                            var _temp24 = _catch(function () {
                              return Promise.resolve(oTargetMdcTable.scrollToIndex(oRefError.rowIndex)).then(function () {
                                var aTargetMdcTableRow = _this7._getMdcTableRows(oTargetMdcTable);
                                var iNewFirstVisibleRow, bScrollNeeded;
                                if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
                                  iNewFirstVisibleRow = aTargetMdcTableRow[0].getParent().getFirstVisibleRow();
                                  bScrollNeeded = iFirstVisibleRow - iNewFirstVisibleRow !== 0;
                                }
                                var oWaitControlIdAdded;
                                if (bScrollNeeded) {
                                  //The scrollToIndex function does not wait for the UI update. As a workaround, pending a fix from MDC (BCP: 2170251631) we use the event "UIUpdated".
                                  oWaitControlIdAdded = new Promise(function (resolve) {
                                    Core.attachEvent("UIUpdated", resolve);
                                  });
                                } else {
                                  oWaitControlIdAdded = Promise.resolve();
                                }
                                return Promise.resolve(oWaitControlIdAdded).then(function () {
                                  setTimeout(function () {
                                    try {
                                      return Promise.resolve(_setFocusOnTargetField(oTargetMdcTable, oRefError.rowIndex)).then(function (focusOnTargetField) {
                                        if (focusOnTargetField === false) {
                                          _defaultFocus(oMessage, oTargetMdcTable);
                                        }
                                      });
                                    } catch (e) {
                                      return Promise.reject(e);
                                    }
                                  }, 0);
                                });
                              });
                            }, function () {
                              Log.error("Error while focusing on error");
                            });
                            if (_temp24 && _temp24.then) return _temp24.then(function () {});
                          } else {
                            var _temp25 = function () {
                              if (oTargetMdcTable.data("tableType") === "ResponsiveTable" && oRefError) {
                                return Promise.resolve(_this7.focusOnMessageTargetControl(oView, oMessage, oTargetMdcTable, oRefError.rowIndex)).then(function (focusOnMessageTargetControl) {
                                  if (focusOnMessageTargetControl === false) {
                                    _defaultFocus(oMessage, oTargetMdcTable);
                                  }
                                });
                              } else {
                                _this7.focusOnMessageTargetControl(oView, oMessage);
                              }
                            }();
                            if (_temp25 && _temp25.then) return _temp25.then(function () {});
                          }
                        }();
                        if (_temp15 && _temp15.then) return _temp15.then(function () {});
                      });
                    }, function () {
                      Log.error("Fail to navigate to Error control");
                    });
                    if (_temp23 && _temp23.then) return _temp23.then(function () {});
                  }
                }();
                if (_temp22 && _temp22.then) return _temp22.then(function () {});
              } else {
                oControl = Core.byId(oMessage.controlIds[0]);
                //If the control underlying the frontEnd message is not within the current section, we first go into the target section:
                var oSelectedSection = Core.byId(_this7.oObjectPageLayout.getSelectedSection());
                if ((oSelectedSection === null || oSelectedSection === void 0 ? void 0 : oSelectedSection.findElements(true).indexOf(oControl)) === -1) {
                  sSectionTitle = oItem.getGroupName().split(", ")[0];
                  _this7._navigateFromMessageToSectionInIconTabBarMode(_this7.oObjectPageLayout, sSectionTitle);
                }
                _this7.setFocusToControl(oControl);
              }
            }();
            if (_temp21 && _temp21.then) return _temp21.then(function () {});
          } else {
            // focus on control
            sSectionTitle = oItem.getGroupName().split(", ")[0];
            _this7._navigateFromMessageToSectionInIconTabBarMode(_this7.oObjectPageLayout, sSectionTitle);
            _this7.focusOnMessageTargetControl(oView, oMessage);
          }
        }();
        return Promise.resolve(_temp20 && _temp20.then ? _temp20.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Retrieves a table cell targeted by a message.
     *
     * @param {Object} targetRow A table row
     * @param {Object} message Message targeting a cell
     * @returns {Object} Returns the cell
     * @private
     */
    ;
    _proto.getTargetCell = function getTargetCell(targetRow, message) {
      return message.getControlIds().length > 0 ? message.getControlIds().map(function (controlId) {
        var isControlInTable = targetRow.findElements(true, function (elem) {
          return elem.getId() === controlId;
        });
        return isControlInTable.length > 0 ? Core.byId(controlId) : null;
      }).reduce(function (acc, val) {
        return val ? val : acc;
      }) : null;
    }

    /**
     * Focus on the control targeted by a message.
     *
     * @param {Object} view The current view
     * @param {Object} message The message targeting the control on which we want to set the focus
     * @param {Object} targetMdcTable The table targeted by the message (optional)
     * @param {number} rowIndex The row index of the table targeted by the message (optional)
     * @returns {Promise} Promise
     * @private
     */;
    _proto.focusOnMessageTargetControl = function focusOnMessageTargetControl(view, message, targetMdcTable, rowIndex) {
      try {
        var _this9 = this;
        var aAllViewElements = view.findElements(true);
        var aErroneousControls = message.getControlIds().filter(function (sControlId) {
          return aAllViewElements.some(function (oElem) {
            return oElem.getId() === sControlId && oElem.getDomRef();
          });
        }).map(function (sControlId) {
          return Core.byId(sControlId);
        });
        var aNotTableErroneousControls = aErroneousControls.filter(function (oElem) {
          return !oElem.isA("sap.m.Table") && !oElem.isA("sap.ui.table.Table");
        });
        //The focus is set on Not Table control in priority
        if (aNotTableErroneousControls.length > 0) {
          _this9.setFocusToControl(aNotTableErroneousControls[0]);
          return Promise.resolve(undefined);
        } else if (aErroneousControls.length > 0) {
          var aTargetMdcTableRow = targetMdcTable ? targetMdcTable.findElements(true, function (oElem) {
            return oElem.isA(ColumnListItem.getMetadata().getName());
          }) : [];
          if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
            var oTargetRow = aTargetMdcTableRow[rowIndex];
            var oTargetCell = _this9.getTargetCell(oTargetRow, message);
            if (oTargetCell) {
              var oTargetField = oTargetCell.isA("sap.fe.macros.field.FieldAPI") ? oTargetCell.getContent().getContentEdit()[0] : oTargetCell.getItems()[0].getContent().getContentEdit()[0];
              _this9.setFocusToControl(oTargetField);
              return Promise.resolve(undefined);
            } else {
              var errorProperty = message.getTarget().split("/").pop();
              if (errorProperty) {
                view.getModel("internal").setProperty("/messageTargetProperty", errorProperty);
              }
              if (_this9._navigationConfigured(targetMdcTable)) {
                return Promise.resolve(view.getController()._routing.navigateForwardToContext(oTargetRow.getBindingContext()));
              } else {
                return Promise.resolve(false);
              }
            }
          }
          return Promise.resolve(undefined);
        }
        return Promise.resolve(undefined);
      } catch (e) {
        return Promise.reject(e);
      }
    };
    _proto._getTableColInfo = function _getTableColInfo(oTable, sTableTargetColProperty) {
      var sTableTargetColName;
      var oTableTargetCol = oTable.getColumns().find(function (tagetColumnProperty, column) {
        return column.getDataProperty() === tagetColumnProperty;
      }.bind(this, sTableTargetColProperty));
      if (!oTableTargetCol) {
        /* If the target column is not found, we check for a custom column */
        var oCustomColumn = oTable.getControlDelegate().getColumnsFor(oTable).find(function (oColumn) {
          if (!!oColumn.template && oColumn.propertyInfos) {
            return oColumn.propertyInfos[0] === sTableTargetColProperty || oColumn.propertyInfos[0].replace("Property::", "") === sTableTargetColProperty;
          } else {
            return false;
          }
        });
        if (oCustomColumn) {
          oTableTargetCol = oCustomColumn;
          sTableTargetColProperty = oTableTargetCol.name;
          sTableTargetColName = oTable.getColumns().find(function (oColumn) {
            return sTableTargetColProperty === oColumn.getDataProperty();
          }).getHeader();
        } else {
          /* If the target column is not found, we check for a field group */
          var aColumns = oTable.getControlDelegate().getColumnsFor(oTable);
          oTableTargetCol = aColumns.find(function (aTableColumns, targetColumnProperty, oColumn) {
            if (oColumn.key.indexOf("::FieldGroup::") !== -1) {
              return oColumn.propertyInfos.find(function () {
                return aTableColumns.find(function (tableColumn) {
                  return tableColumn.relativePath === targetColumnProperty;
                });
              });
            }
          }.bind(this, aColumns, sTableTargetColProperty));
          /* check if the column with the field group is visible in the table: */
          var bIsTableTargetColVisible = false;
          if (oTableTargetCol && oTableTargetCol.label) {
            bIsTableTargetColVisible = oTable.getColumns().some(function (column) {
              return column.getHeader() === oTableTargetCol.label;
            });
          }
          sTableTargetColName = bIsTableTargetColVisible && oTableTargetCol.label;
          sTableTargetColProperty = bIsTableTargetColVisible && oTableTargetCol.key;
        }
      } else {
        sTableTargetColName = oTableTargetCol && oTableTargetCol.getHeader();
      }
      return {
        sTableTargetColName: sTableTargetColName,
        sTableTargetColProperty: sTableTargetColProperty
      };
    }

    /**
     *
     * @param obj The message object
     * @param aSections The array of sections in the object page
     * @returns The rank of the message
     */;
    _proto._getMessageRank = function _getMessageRank(obj, aSections) {
      if (aSections) {
        var section, aSubSections, subSection, j, k, aElements, aAllElements, sectionRank;
        for (j = aSections.length - 1; j >= 0; --j) {
          // Loop over all sections
          section = aSections[j];
          aSubSections = section.getSubSections();
          for (k = aSubSections.length - 1; k >= 0; --k) {
            // Loop over all sub-sections
            subSection = aSubSections[k];
            aAllElements = subSection.findElements(true); // Get all elements inside a sub-section
            //Try to find the control 1 inside the sub section
            aElements = aAllElements.filter(this._fnFilterUponId.bind(this, obj.getControlId()));
            sectionRank = j + 1;
            if (aElements.length > 0) {
              obj.sectionName = section.getTitle();
              obj.subSectionName = subSection.getTitle();
              return sectionRank * 10 + (k + 1);
            }
          }
        }
        //if sub section title is Other messages, we return a high number(rank), which ensures
        //that messages belonging to this sub section always come later in messagePopover
        if (!obj.sectionName && !obj.subSectionName && obj.persistent) {
          return 1;
        }
        return 999;
      }
      return 999;
    }

    /**
     * Method to set the filters based upon the message items
     * The desired filter operation is:
     * ( filters provided by user && ( validation = true && Control should be present in view ) || messages for the current matching context ).
     *
     * @private
     */;
    _proto._applyFiltersAndSort = function _applyFiltersAndSort() {
      var _this10 = this;
      var oValidationFilters,
        oValidationAndContextFilter,
        oFilters,
        sPath,
        oSorter,
        oDialogFilter,
        objectPageLayoutSections = null;
      var aUserDefinedFilter = [];
      var filterOutMessagesInDialog = function () {
        var fnTest = function (aControlIds) {
          var index = Infinity,
            oControl = Core.byId(aControlIds[0]);
          var errorFieldControl = Core.byId(aControlIds[0]);
          while (oControl) {
            var fieldRankinDialog = oControl instanceof Dialog ? (errorFieldControl === null || errorFieldControl === void 0 ? void 0 : errorFieldControl.getParent()).findElements(true).indexOf(errorFieldControl) : Infinity;
            if (oControl instanceof Dialog) {
              if (index > fieldRankinDialog) {
                index = fieldRankinDialog;
                // Set the focus to the dialog's control
                _this10.setFocusToControl(errorFieldControl);
              }
              // messages for sap.m.Dialog should not appear in the message button
              return false;
            }
            oControl = oControl.getParent();
          }
          return true;
        };
        return new Filter({
          path: "controlIds",
          test: fnTest,
          caseSensitive: true
        });
      };
      //Filter function to verify if the control is part of the current view or not
      function getCheckControlInViewFilter() {
        var fnTest = function (aControlIds) {
          if (!aControlIds.length) {
            return false;
          }
          var oControl = Core.byId(aControlIds[0]);
          while (oControl) {
            if (oControl.getId() === sViewId) {
              return true;
            }
            if (oControl instanceof Dialog) {
              // messages for sap.m.Dialog should not appear in the message button
              return false;
            }
            oControl = oControl.getParent();
          }
          return false;
        };
        return new Filter({
          path: "controlIds",
          test: fnTest,
          caseSensitive: true
        });
      }
      if (!this.sViewId) {
        this.sViewId = this._getViewId(this.getId());
      }
      var sViewId = this.sViewId;
      //Add the filters provided by the user
      var aCustomFilters = this.getAggregation("customFilters");
      if (aCustomFilters) {
        aCustomFilters.forEach(function (filter) {
          aUserDefinedFilter.push(new Filter({
            path: filter.getProperty("path"),
            operator: filter.getProperty("operator"),
            value1: filter.getProperty("value1"),
            value2: filter.getProperty("value2")
          }));
        });
      }
      var oBindingContext = this.getBindingContext();
      if (!oBindingContext) {
        this.setVisible(false);
        return;
      } else {
        sPath = oBindingContext.getPath();
        //Filter for filtering out only validation messages which are currently present in the view
        oValidationFilters = new Filter({
          filters: [new Filter({
            path: "validation",
            operator: FilterOperator.EQ,
            value1: true
          }), getCheckControlInViewFilter()],
          and: true
        });
        //Filter for filtering out the bound messages i.e target starts with the context path
        oValidationAndContextFilter = new Filter({
          filters: [oValidationFilters, new Filter({
            path: "target",
            operator: FilterOperator.StartsWith,
            value1: sPath
          })],
          and: false
        });
        oDialogFilter = new Filter({
          filters: [filterOutMessagesInDialog()]
        });
      }
      var oValidationContextDialogFilters = new Filter({
        filters: [oValidationAndContextFilter, oDialogFilter],
        and: true
      });
      // and finally - if there any - add custom filter (via OR)
      if (aUserDefinedFilter.length > 0) {
        oFilters = new Filter({
          filters: [aUserDefinedFilter, oValidationContextDialogFilters],
          and: false
        });
      } else {
        oFilters = oValidationContextDialogFilters;
      }
      this.oItemBinding.filter(oFilters);
      this.oObjectPageLayout = this._getObjectPageLayout(this, this.oObjectPageLayout);
      // We support sorting only for ObjectPageLayout use-case.
      if (this.oObjectPageLayout) {
        oSorter = new Sorter("", null, null, function (obj1, obj2) {
          if (!objectPageLayoutSections) {
            objectPageLayoutSections = _this10.oObjectPageLayout && _this10.oObjectPageLayout.getSections();
          }
          var rankA = _this10._getMessageRank(obj1, objectPageLayoutSections);
          var rankB = _this10._getMessageRank(obj2, objectPageLayoutSections);
          if (rankA < rankB) {
            return -1;
          }
          if (rankA > rankB) {
            return 1;
          }
          return 0;
        });
        this.oItemBinding.sort(oSorter);
      }
    }

    /**
     *
     * @param sControlId
     * @param oItem
     * @returns True if the control ID matches the item ID
     */;
    _proto._fnFilterUponId = function _fnFilterUponId(sControlId, oItem) {
      return sControlId === oItem.getId();
    }

    /**
     *
     * @param aControlIds
     * @param oItem
     * @returns True if the item matches one of the controls
     */;
    _proto._fnFilterUponIds = function _fnFilterUponIds(aControlIds, oItem) {
      return aControlIds.some(function (sControlId) {
        if (sControlId === oItem.getId()) {
          return true;
        }
        return false;
      });
    }

    /**
     * Retrieves the section based on section title and visibility.
     *
     * @param oObjectPage Object page.
     * @param sSectionTitle Section title.
     * @returns The section
     * @private
     */;
    _proto._getSectionBySectionTitle = function _getSectionBySectionTitle(oObjectPage, sSectionTitle) {
      if (sSectionTitle) {
        var aSections = oObjectPage.getSections();
        var oSection;
        for (var i = 0; i < aSections.length; i++) {
          if (aSections[i].getVisible() && aSections[i].getTitle() === sSectionTitle) {
            oSection = aSections[i];
            break;
          }
        }
        return oSection;
      }
    }

    /**
     * Navigates to the section if the object page uses an IconTabBar and if the current section is not the target of the navigation.
     *
     * @param oObjectPage Object page.
     * @param sSectionTitle Section title.
     * @private
     */;
    _proto._navigateFromMessageToSectionInIconTabBarMode = function _navigateFromMessageToSectionInIconTabBarMode(oObjectPage, sSectionTitle) {
      var bUseIconTabBar = oObjectPage.getUseIconTabBar();
      if (bUseIconTabBar) {
        var oSection = this._getSectionBySectionTitle(oObjectPage, sSectionTitle);
        var sSelectedSectionId = oObjectPage.getSelectedSection();
        if (oSection && sSelectedSectionId !== oSection.getId()) {
          oObjectPage.setSelectedSection(oSection.getId());
        }
      }
    };
    _proto._navigateFromMessageToSectionTableInIconTabBarMode = function _navigateFromMessageToSectionTableInIconTabBarMode(oTable, oObjectPage, sSectionTitle) {
      try {
        var _this12 = this;
        var oRowBinding = oTable.getRowBinding();
        var oTableContext = oTable.getBindingContext();
        var oOPContext = oObjectPage.getBindingContext();
        var bShouldWaitForTableRefresh = !(oTableContext === oOPContext);
        _this12._navigateFromMessageToSectionInIconTabBarMode(oObjectPage, sSectionTitle);
        return Promise.resolve(new Promise(function (resolve) {
          if (bShouldWaitForTableRefresh) {
            oRowBinding.attachEventOnce("change", function () {
              resolve();
            });
          } else {
            resolve();
          }
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Retrieves the MdcTable if it is found among any of the parent elements.
     *
     * @param oElement Control
     * @returns MDC table || undefined
     * @private
     */
    ;
    _proto._getMdcTable = function _getMdcTable(oElement) {
      //check if the element has a table within any of its parents
      var oParentElement = oElement.getParent();
      while (oParentElement && !oParentElement.isA("sap.ui.mdc.Table")) {
        oParentElement = oParentElement.getParent();
      }
      return oParentElement && oParentElement.isA("sap.ui.mdc.Table") ? oParentElement : undefined;
    };
    _proto._getGridTable = function _getGridTable(oMdcTable) {
      return oMdcTable.findElements(true, function (oElem) {
        return oElem.isA("sap.ui.table.Table") && /** We check the element belongs to the MdcTable :*/
        oElem.getParent() === oMdcTable;
      })[0];
    }

    /**
     * Retrieves the table row (if available) containing the element.
     *
     * @param oElement Control
     * @returns Table row || undefined
     * @private
     */;
    _proto._getTableRow = function _getTableRow(oElement) {
      var oParentElement = oElement.getParent();
      while (oParentElement && !oParentElement.isA("sap.ui.table.Row") && !oParentElement.isA("sap.ui.table.CreationRow") && !oParentElement.isA(ColumnListItem.getMetadata().getName())) {
        oParentElement = oParentElement.getParent();
      }
      return oParentElement && (oParentElement.isA("sap.ui.table.Row") || oParentElement.isA("sap.ui.table.CreationRow") || oParentElement.isA(ColumnListItem.getMetadata().getName())) ? oParentElement : undefined;
    }

    /**
     * Retrieves the index of the table row containing the element.
     *
     * @param oElement Control
     * @returns Row index || undefined
     * @private
     */;
    _proto._getTableRowIndex = function _getTableRowIndex(oElement) {
      var oTableRow = this._getTableRow(oElement);
      var iRowIndex;
      if (oTableRow.isA("sap.ui.table.Row")) {
        iRowIndex = oTableRow.getIndex();
      } else {
        iRowIndex = oTableRow.getTable().getItems().findIndex(function (element) {
          return element.getId() === oTableRow.getId();
        });
      }
      return iRowIndex;
    }

    /**
     * Retrieves the index of the table column containing the element.
     *
     * @param oElement Control
     * @returns Column index || undefined
     * @private
     */;
    _proto._getTableColumnIndex = function _getTableColumnIndex(oElement) {
      var getTargetCellIndex = function (element, oTargetRow) {
        return oTargetRow.getCells().findIndex(function (oCell) {
          return oCell.getId() === element.getId();
        });
      };
      var getTargetColumnIndex = function (element, oTargetRow) {
        var oTargetElement = element.getParent(),
          iTargetCellIndex = getTargetCellIndex(oTargetElement, oTargetRow);
        while (oTargetElement && iTargetCellIndex < 0) {
          oTargetElement = oTargetElement.getParent();
          iTargetCellIndex = getTargetCellIndex(oTargetElement, oTargetRow);
        }
        return iTargetCellIndex;
      };
      var oTargetRow = this._getTableRow(oElement);
      var iTargetColumnIndex;
      iTargetColumnIndex = getTargetColumnIndex(oElement, oTargetRow);
      if (oTargetRow.isA("sap.ui.table.CreationRow")) {
        var sTargetCellId = oTargetRow.getCells()[iTargetColumnIndex].getId(),
          aTableColumns = oTargetRow.getTable().getColumns();
        iTargetColumnIndex = aTableColumns.findIndex(function (column) {
          if (column.getCreationTemplate()) {
            return sTargetCellId.search(column.getCreationTemplate().getId()) > -1 ? true : false;
          } else {
            return false;
          }
        });
      }
      return iTargetColumnIndex;
    };
    _proto._getMdcTableRows = function _getMdcTableRows(oMdcTable) {
      return oMdcTable.findElements(true, function (oElem) {
        return oElem.isA("sap.ui.table.Row") && /** We check the element belongs to the Mdc Table :*/
        oElem.getTable().getParent() === oMdcTable;
      });
    };
    _proto._getTableColProperty = function _getTableColProperty(oTable, oMessageObject) {
      //this function escapes a string to use it as a regex
      var fnRegExpescape = function (s) {
        return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
      };
      // based on the target path of the message we retrieve the property name.
      // to achieve it we remove the bindingContext path and the row binding path from the target
      return oMessageObject.getTargets()[0].replace(new RegExp("".concat(fnRegExpescape("".concat(oTable.getBindingContext().getPath(), "/").concat(oTable.getRowBinding().getPath())), "\\(.*\\)/")), "");
    };
    _proto._getObjectPageLayout = function _getObjectPageLayout(oElement, oObjectPageLayout) {
      if (oObjectPageLayout) {
        return oObjectPageLayout;
      }
      oObjectPageLayout = oElement;
      //Iterate over parent till you have not reached the object page layout
      while (oObjectPageLayout && !oObjectPageLayout.isA("sap.uxap.ObjectPageLayout")) {
        oObjectPageLayout = oObjectPageLayout.getParent();
      }
      return oObjectPageLayout;
    };
    _proto._getCustomColumnInfo = function _getCustomColumnInfo(oTable, iPosition) {
      var sTableColProperty = oTable.getColumns()[iPosition].getDataProperty();
      return oTable.getControlDelegate().getColumnsFor(oTable).find(function (oColumn) {
        return oColumn.name === sTableColProperty && !!oColumn.template;
      });
    };
    _proto._getTableFirstColProperty = function _getTableFirstColProperty(oTable) {
      var oCustomColumnInfo = this._getCustomColumnInfo(oTable, 0);
      var sTableFirstColProperty;
      if (oCustomColumnInfo) {
        if (oCustomColumnInfo.propertyInfos) {
          sTableFirstColProperty = oCustomColumnInfo.propertyInfos[0].replace("Property::", "");
        } else {
          sTableFirstColProperty = undefined;
        }
      } else {
        sTableFirstColProperty = oTable.getColumns()[0].getDataProperty();
      }
      return sTableFirstColProperty;
    };
    _proto._getTableFirstColBindingContextForTextAnnotation = function _getTableFirstColBindingContextForTextAnnotation(oTable, oTableRowContext, sTableFirstColProperty) {
      var oBindingContext;
      if (oTableRowContext && sTableFirstColProperty) {
        var oModel = oTable.getModel();
        var oMetaModel = oModel.getMetaModel();
        var sMetaPath = oMetaModel.getMetaPath(oTableRowContext.getPath());
        if (oMetaModel.getObject("".concat(sMetaPath, "/").concat(sTableFirstColProperty, "@com.sap.vocabularies.Common.v1.Text/$Path"))) {
          oBindingContext = oMetaModel.createBindingContext("".concat(sMetaPath, "/").concat(sTableFirstColProperty, "@com.sap.vocabularies.Common.v1.Text"));
        }
      }
      return oBindingContext;
    };
    _proto._getTableFirstColValue = function _getTableFirstColValue(sTableFirstColProperty, oTableRowContext, sTextAnnotationPath, sTextArrangement) {
      var sCodeValue = oTableRowContext.getValue(sTableFirstColProperty);
      var sTextValue;
      var sComputedValue = sCodeValue;
      if (sTextAnnotationPath) {
        if (sTableFirstColProperty.lastIndexOf("/") > 0) {
          // the target property is replaced with the text annotation path
          sTableFirstColProperty = sTableFirstColProperty.slice(0, sTableFirstColProperty.lastIndexOf("/") + 1);
          sTableFirstColProperty = sTableFirstColProperty.concat(sTextAnnotationPath);
        } else {
          sTableFirstColProperty = sTextAnnotationPath;
        }
        sTextValue = oTableRowContext.getValue(sTableFirstColProperty);
        if (sTextValue) {
          if (sTextArrangement) {
            var sEnumNumber = sTextArrangement.slice(sTextArrangement.indexOf("/") + 1);
            switch (sEnumNumber) {
              case "TextOnly":
                sComputedValue = sTextValue;
                break;
              case "TextFirst":
                sComputedValue = "".concat(sTextValue, " (").concat(sCodeValue, ")");
                break;
              case "TextLast":
                sComputedValue = "".concat(sCodeValue, " (").concat(sTextValue, ")");
                break;
              case "TextSeparate":
                sComputedValue = sCodeValue;
                break;
              default:
            }
          } else {
            sComputedValue = "".concat(sTextValue, " (").concat(sCodeValue, ")");
          }
        }
      }
      return sComputedValue;
    };
    _proto._IsControlInTable = function _IsControlInTable(oTable, sControlId) {
      var oControl = Core.byId(sControlId);
      if (oControl && !oControl.isA("sap.ui.table.Table") && !oControl.isA("sap.m.Table")) {
        return oTable.findElements(true, function (oElem) {
          return oElem.getId() === oControl;
        });
      }
      return false;
    };
    _proto._IsControlPartOfCreationRow = function _IsControlPartOfCreationRow(oControl) {
      var oParentControl = oControl.getParent();
      while (oParentControl && !oParentControl.isA("sap.ui.table.Row") && !oParentControl.isA("sap.ui.table.CreationRow") && !oParentControl.isA(ColumnListItem.getMetadata().getName())) {
        oParentControl = oParentControl.getParent();
      }
      return !!oParentControl && oParentControl.isA("sap.ui.table.CreationRow");
    }

    /**
     * The method that is called to retrieve the column info from the associated message of the message popover.
     *
     * @private
     * @param oMessage Message object
     * @param oTable MdcTable
     * @returns Returns the column info.
     */;
    _proto._fetchColumnInfo = function _fetchColumnInfo(oMessage, oTable) {
      var sColNameFromMessageObj = oMessage.getBindingContext("message").getObject().getTarget().split("/").pop();
      return oTable.getParent().getTableDefinition().columns.find(function (oColumn) {
        return oColumn.key.split("::").pop() === sColNameFromMessageObj;
      });
    }

    /**
     * The method that is called to check if a navigation is configured from the table to a sub object page.
     *
     * @private
     * @param table MdcTable
     * @returns Either true or false
     */;
    _proto._navigationConfigured = function _navigationConfigured(table) {
      // TODO: this logic would be moved to check the same at the template time to avoid the same check happening multiple times.
      var component = sap.ui.require("sap/ui/core/Component"),
        navObject = table && component.getOwnerComponentFor(table) && component.getOwnerComponentFor(table).getNavigation();
      var subOPConfigured = false,
        navConfigured = false;
      if (navObject && Object.keys(navObject).indexOf(table.getRowBinding().sPath) !== -1) {
        subOPConfigured = navObject[table === null || table === void 0 ? void 0 : table.getRowBinding().sPath] && navObject[table === null || table === void 0 ? void 0 : table.getRowBinding().sPath].detail && navObject[table === null || table === void 0 ? void 0 : table.getRowBinding().sPath].detail.route ? true : false;
      }
      navConfigured = subOPConfigured && (table === null || table === void 0 ? void 0 : table.getRowSettings().getRowActions()) && (table === null || table === void 0 ? void 0 : table.getRowSettings().getRowActions()[0].mProperties.type.indexOf("Navigation")) !== -1;
      return navConfigured;
    }

    /**
     * Determine the message subtitle based on the control holding the error (column/row indicator).
     *
     * @private
     * @param message The message Item
     * @param oTableRowBindingContexts The table row contexts
     * @param oTableRowContext The context of the table row holding the error
     * @param sTableTargetColName The column name where the error is located
     * @param oResourceBundle ResourceBundle
     * @param oTable MdcTable
     * @param bIsCreationRow Is the error on a control that is part of the CreationRow
     * @param oTargetedControl The control targeted by the message
     * @returns The computed message subTitle
     */;
    _proto._getMessageSubtitle = function _getMessageSubtitle(message, oTableRowBindingContexts, oTableRowContext, sTableTargetColName, oResourceBundle, oTable, bIsCreationRow, oTargetedControl) {
      var sMessageSubtitle;
      var sRowSubtitleValue;
      var sTableFirstColProperty = oTable.getParent().getIdentifierColumn();
      var oColFromTableSettings = this._fetchColumnInfo(message, oTable);
      if (bIsCreationRow) {
        sMessageSubtitle = CommonUtils.getTranslatedText("T_MESSAGE_ITEM_SUBTITLE", oResourceBundle, [oResourceBundle.getText("T_MESSAGE_ITEM_SUBTITLE_CREATION_ROW_INDICATOR"), sTableTargetColName ? sTableTargetColName : oColFromTableSettings.label]);
      } else {
        var oTableFirstColBindingContextTextAnnotation = this._getTableFirstColBindingContextForTextAnnotation(oTable, oTableRowContext, sTableFirstColProperty);
        var sTableFirstColTextAnnotationPath = oTableFirstColBindingContextTextAnnotation ? oTableFirstColBindingContextTextAnnotation.getObject("$Path") : undefined;
        var sTableFirstColTextArrangement = sTableFirstColTextAnnotationPath && oTableFirstColBindingContextTextAnnotation ? oTableFirstColBindingContextTextAnnotation.getObject("@com.sap.vocabularies.UI.v1.TextArrangement/$EnumMember") : undefined;
        if (oTableRowBindingContexts.length > 0) {
          // set Row subtitle text
          if (oTargetedControl) {
            // The UI error is on the first column, we then get the control input as the row indicator:
            sRowSubtitleValue = oTargetedControl.getValue();
          } else if (oTableRowContext && sTableFirstColProperty) {
            sRowSubtitleValue = this._getTableFirstColValue(sTableFirstColProperty, oTableRowContext, sTableFirstColTextAnnotationPath, sTableFirstColTextArrangement);
          } else {
            sRowSubtitleValue = undefined;
          }
          // set the message subtitle
          var oColumnInfo = this._determineColumnInfo(oColFromTableSettings, oResourceBundle);
          if (sRowSubtitleValue && sTableTargetColName) {
            sMessageSubtitle = CommonUtils.getTranslatedText("T_MESSAGE_ITEM_SUBTITLE", oResourceBundle, [sRowSubtitleValue, sTableTargetColName]);
          } else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Hidden") {
            sMessageSubtitle = "".concat(oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW"), ": ").concat(sRowSubtitleValue, ", ").concat(oColumnInfo.sColumnValue);
          } else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Unknown") {
            sMessageSubtitle = CommonUtils.getTranslatedText("T_MESSAGE_ITEM_SUBTITLE", oResourceBundle, [sRowSubtitleValue, oColumnInfo.sColumnValue]);
          } else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "undefined") {
            sMessageSubtitle = "".concat(oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW"), ": ").concat(sRowSubtitleValue);
          } else if (!sRowSubtitleValue && sTableTargetColName) {
            sMessageSubtitle = oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN") + ": " + sTableTargetColName;
          } else if (!sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Hidden") {
            sMessageSubtitle = oColumnInfo.sColumnValue;
          } else {
            sMessageSubtitle = null;
          }
        } else {
          sMessageSubtitle = null;
        }
      }
      return sMessageSubtitle;
    };
    _proto._determineColumnInfo = function _determineColumnInfo(oColFromTableSettings, oResourceBundle) {
      var oColumnInfo = {
        sColumnIndicator: String,
        sColumnValue: String
      };
      if (oColFromTableSettings) {
        // if column is neither in table definition nor personalization, show only row subtitle text
        if (oColFromTableSettings.availability === "Hidden") {
          oColumnInfo.sColumnValue = undefined;
          oColumnInfo.sColumnIndicator = "undefined";
        } else {
          //if column is in table personalization but not in table definition, show Column (Hidden) : <colName>
          oColumnInfo.sColumnValue = "".concat(oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN"), " (").concat(oResourceBundle.getText("T_COLUMN_INDICATOR_IN_TABLE_DEFINITION"), "): ").concat(oColFromTableSettings.label);
          oColumnInfo.sColumnIndicator = "Hidden";
        }
      } else {
        oColumnInfo.sColumnValue = oResourceBundle.getText("T_MESSAGE_ITEM_SUBTITLE_INDICATOR_UNKNOWN");
        oColumnInfo.sColumnIndicator = "Unknown";
      }
      return oColumnInfo;
    };
    _proto.setFocusToControl = function setFocusToControl(control) {
      var messagePopover = this.oMessagePopover;
      if (messagePopover && control && control.focus) {
        var fnFocus = function () {
          control.focus();
        };
        if (!messagePopover.isOpen()) {
          // when navigating to parent page to child page (on click of message), the child page might have a focus logic that might use a timeout.
          // we use the below timeouts to override this focus so that we focus on the target control of the message in the child page.
          setTimeout(fnFocus, 0);
        } else {
          var fnOnClose = function () {
            setTimeout(fnFocus, 0);
            messagePopover.detachEvent("afterClose", fnOnClose);
          };
          messagePopover.attachEvent("afterClose", fnOnClose);
          messagePopover.close();
        }
      } else {
        Log.warning("FE V4 : MessageButton : element doesn't have focus method for focusing.");
      }
    };
    return MessageButton;
  }(Button), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "customFilters", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "messageChange", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  })), _class2)) || _class);
  return MessageButton;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiTWVzc2FnZUJ1dHRvbiIsImRlZmluZVVJNUNsYXNzIiwiYWdncmVnYXRpb24iLCJ0eXBlIiwibXVsdGlwbGUiLCJzaW5ndWxhck5hbWUiLCJldmVudCIsInNMYXN0QWN0aW9uVGV4dCIsInNHZW5lcmFsR3JvdXBUZXh0Iiwic1ZpZXdJZCIsImluaXQiLCJCdXR0b24iLCJwcm90b3R5cGUiLCJhcHBseSIsImF0dGFjaFByZXNzIiwiaGFuZGxlTWVzc2FnZVBvcG92ZXJQcmVzcyIsIm9NZXNzYWdlUG9wb3ZlciIsIk1lc3NhZ2VQb3BvdmVyIiwib0l0ZW1CaW5kaW5nIiwiZ2V0QmluZGluZyIsImF0dGFjaENoYW5nZSIsIl9zZXRNZXNzYWdlRGF0YSIsIm1lc3NhZ2VCdXR0b25JZCIsImdldElkIiwiYWRkQ3VzdG9tRGF0YSIsInNhcCIsInVpIiwiY29yZSIsIkN1c3RvbURhdGEiLCJrZXkiLCJ2YWx1ZSIsImF0dGFjaE1vZGVsQ29udGV4dENoYW5nZSIsIl9hcHBseUZpbHRlcnNBbmRTb3J0IiwiYmluZCIsImF0dGFjaEFjdGl2ZVRpdGxlUHJlc3MiLCJfYWN0aXZlVGl0bGVQcmVzcyIsIm9FdmVudCIsInRvZ2dsZSIsImdldFNvdXJjZSIsIl9hcHBseUdyb3VwaW5nQXN5bmMiLCJvVmlldyIsImFXYWl0Rm9yRGF0YSIsIm9WaWV3QmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsIl9maW5kVGFibGVzUmVsYXRlZFRvTWVzc2FnZXMiLCJ2aWV3Iiwib1JlcyIsImFNZXNzYWdlcyIsImdldENvbnRleHRzIiwibWFwIiwib0NvbnRleHQiLCJnZXRPYmplY3QiLCJvVmlld0NvbnRleHQiLCJvT2JqZWN0UGFnZSIsImdldENvbnRlbnQiLCJnZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dCIsImZvckVhY2giLCJvU2VjdGlvbiIsImdldFN1YlNlY3Rpb25zIiwib1N1YlNlY3Rpb24iLCJmaW5kRWxlbWVudHMiLCJvRWxlbSIsImlzQSIsImkiLCJsZW5ndGgiLCJvUm93QmluZGluZyIsImdldFJvd0JpbmRpbmciLCJzRWxlbWVCaW5kaW5nUGF0aCIsImdldFBhdGgiLCJ0YXJnZXQiLCJpbmRleE9mIiwicHVzaCIsInRhYmxlIiwic3Vic2VjdGlvbiIsIm9UYWJsZXMiLCJfb1RhYmxlIiwib01EQ1RhYmxlIiwib1N1YnNlY3Rpb24iLCJzZXRCaW5kaW5nQ29udGV4dCIsImlzTGVuZ3RoRmluYWwiLCJQcm9taXNlIiwicmVzb2x2ZSIsImF0dGFjaEV2ZW50T25jZSIsIndhaXRGb3JHcm91cGluZ0FwcGxpZWQiLCJzZXRUaW1lb3V0IiwiX2FwcGx5R3JvdXBpbmciLCJhbGwiLCJnZXRNb2RlbCIsImNoZWNrTWVzc2FnZXMiLCJMb2ciLCJlcnJvciIsIm9PYmplY3RQYWdlTGF5b3V0IiwiZ2V0U2VjdGlvbnMiLCJmaWx0ZXIiLCJnZXRWaXNpYmxlIiwiX2dldE9iamVjdFBhZ2VMYXlvdXQiLCJnZXRJdGVtcyIsImFTZWN0aW9ucyIsImJFbmFibGVCaW5kaW5nIiwiX2NoZWNrQ29udHJvbElkSW5TZWN0aW9ucyIsIl9mbkVuYWJsZUJpbmRpbmdzIiwiX2dldFRhYmxlUmVmRXJyb3JDb250ZXh0Iiwib1RhYmxlIiwib01vZGVsIiwiZ2V0UHJvcGVydHkiLCJzZXRQcm9wZXJ0eSIsInNSZWZFcnJvckNvbnRleHRQYXRoIiwicmVwbGFjZSIsImdldENvbnRleHQiLCJfdXBkYXRlSW50ZXJuYWxNb2RlbCIsIm9UYWJsZVJvd0NvbnRleHQiLCJpUm93SW5kZXgiLCJzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSIsIm9NZXNzYWdlT2JqZWN0IiwiYklzQ3JlYXRpb25Sb3ciLCJvVGVtcCIsInJvd0luZGV4IiwidGFyZ2V0Q29sUHJvcGVydHkiLCJhVmFsaWRNZXNzYWdlSWRzIiwiZ2V0Q29yZSIsImdldE1lc3NhZ2VNYW5hZ2VyIiwiZ2V0TWVzc2FnZU1vZGVsIiwiZ2V0RGF0YSIsIm1lc3NhZ2UiLCJpZCIsImFPYnNvbGV0ZU1lc3NhZ2VsSWRzIiwiT2JqZWN0Iiwia2V5cyIsImludGVybmFsTWVzc2FnZUlkIiwib2Jzb2xldGVJZCIsImFzc2lnbiIsIl9nZXRDb250cm9sRnJvbU1lc3NhZ2VSZWxhdGluZ1RvU3ViU2VjdGlvbiIsInN1YlNlY3Rpb24iLCJfZm5GaWx0ZXJVcG9uSWRzIiwiZ2V0Q29udHJvbElkcyIsInNvcnQiLCJhIiwiYiIsIl9zZXRHcm91cExhYmVsRm9yVHJhbnNpZW50TXNnIiwic0FjdGlvbk5hbWUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiZ2V0VGV4dCIsInNldEdyb3VwTmFtZSIsIl9jb21wdXRlTWVzc2FnZUdyb3VwQW5kU3ViVGl0bGUiLCJzZWN0aW9uIiwiYUVsZW1lbnRzIiwiYk11bHRpcGxlU3ViU2VjdGlvbnMiLCJkZXRhY2hDaGFuZ2UiLCJvRWxlbWVudCIsIm9UYXJnZXRUYWJsZUluZm8iLCJsIiwib1RhcmdldGVkQ29udHJvbCIsInNNZXNzYWdlU3VidGl0bGUiLCJiSXNCYWNrZW5kTWVzc2FnZSIsIlJlZ0V4cCIsInRlc3QiLCJnZXRUYXJnZXRzIiwib1Jlc291cmNlQnVuZGxlIiwiZ2V0UGFyZW50IiwidGFibGVIZWFkZXIiLCJnZXRIZWFkZXIiLCJfZ2V0VGFibGVDb2xQcm9wZXJ0eSIsIm9UYWJsZUNvbEluZm8iLCJfZ2V0VGFibGVDb2xJbmZvIiwib1RhYmxlUm93QmluZGluZ0NvbnRleHRzIiwiZ2V0Q3VycmVudENvbnRleHRzIiwic1RhYmxlVGFyZ2V0Q29sTmFtZSIsInNUYWJsZVRhcmdldFByb3BlcnR5IiwiZmluZCIsIm1lc3NhZ2VPYmplY3QiLCJyb3dDb250ZXh0Iiwic0NvbnRyb2xJZCIsInNJZCIsIl9Jc0NvbnRyb2xJblRhYmxlIiwib0NvbnRyb2wiLCJieUlkIiwiX0lzQ29udHJvbFBhcnRPZkNyZWF0aW9uUm93IiwiX2dldE1lc3NhZ2VTdWJ0aXRsZSIsInNldFN1YnRpdGxlIiwic2V0QWN0aXZlVGl0bGUiLCJfZm9ybWF0TWVzc2FnZURlc2NyaXB0aW9uIiwiZ2V0SW5kZXgiLCJiSXNUYXJnZXRlZENvbnRyb2xPcnBoYW4iLCJfYklzT3JwaGFuRWxlbWVudCIsIl9nZXRNZGNUYWJsZSIsImlUYXJnZXRDb2x1bW5JbmRleCIsIl9nZXRUYWJsZUNvbHVtbkluZGV4IiwiZ2V0Q29sdW1ucyIsImdldERhdGFQcm9wZXJ0eSIsInVuZGVmaW5lZCIsIl9nZXRUYWJsZVJvdyIsIl9nZXRUYWJsZVJvd0luZGV4IiwiZ2V0VmFsdWVTdGF0ZSIsImdldFBlcnNpc3RlbnQiLCJnZXRUaXRsZSIsIl9nZXRWaWV3SWQiLCJvTWVzc2FnZVRhcmdldFByb3BlcnR5Iiwic3BsaXQiLCJwb3AiLCJvVUlNb2RlbCIsImZpcmVBY3RpdmVUaXRsZVByZXNzIiwiYVN1YlNlY3Rpb25zIiwiaiIsImsiLCJhVmlzaWJsZVNlY3Rpb25zIiwidmlld0lkIiwiYklzR2VuZXJhbEdyb3VwTmFtZSIsImFDb250cm9scyIsInBlcnNpc3RlbnQiLCJnZXRHcm91cE5hbWUiLCJfZmluZFRhcmdldEZvck1lc3NhZ2UiLCJvTWV0YU1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiY29udGV4dFBhdGgiLCJnZXRNZXRhUGF0aCIsIm9Db250ZXh0UGF0aE1ldGFkYXRhIiwiJGtpbmQiLCJVcmlQYXJhbWV0ZXJzIiwiZnJvbVF1ZXJ5Iiwid2luZG93IiwibG9jYXRpb24iLCJzZWFyY2giLCJnZXQiLCJpU2VjdGlvbiIsIm5vblRhYmxlQ2hhcnRjb250cm9sRm91bmQiLCJpU3ViU2VjdGlvbiIsIm9BbGxCbG9ja3MiLCJnZXRCbG9ja3MiLCJibG9jayIsIl9maW5kTWVzc2FnZUdyb3VwQWZ0ZXJSZWJpbmRpbmciLCJhdHRhY2hEYXRhUmVjZWl2ZWQiLCJWaWV3IiwiX3NldExvbmd0ZXh0VXJsRGVzY3JpcHRpb24iLCJzTWVzc2FnZURlc2NyaXB0aW9uQ29udGVudCIsIm9EaWFnbm9zaXNUaXRsZSIsInNldEFzeW5jRGVzY3JpcHRpb25IYW5kbGVyIiwiY29uZmlnIiwic09sZERlc2NyaXB0aW9uIiwic0xvbmdUZXh0VXJsIiwiaXRlbSIsImdldExvbmd0ZXh0VXJsIiwialF1ZXJ5IiwiYWpheCIsInVybCIsInN1Y2Nlc3MiLCJkYXRhIiwic0RpYWdub3Npc1RleHQiLCJnZXRIdG1sVGV4dCIsInNldERlc2NyaXB0aW9uIiwicHJvbWlzZSIsInNFcnJvciIsInJlamVjdCIsInNUYWJsZUZpcnN0Q29sUHJvcGVydHkiLCJnZXRJZGVudGlmaWVyQ29sdW1uIiwic0NvbHVtbkluZm8iLCJvQ29sRnJvbVRhYmxlU2V0dGluZ3MiLCJfZmV0Y2hDb2x1bW5JbmZvIiwiYXZhaWxhYmlsaXR5IiwiZ2V0VHlwZSIsImdldFZhbHVlIiwiX25hdmlnYXRpb25Db25maWd1cmVkIiwibGFiZWwiLCJvRmllbGRzQWZmZWN0ZWRUaXRsZSIsIkZvcm1hdHRlZFRleHQiLCJodG1sVGV4dCIsInNGaWVsZEFmZmVjdGVkVGV4dCIsInNVSU1lc3NhZ2VEZXNjcmlwdGlvbiIsImRlc2NyaXB0aW9uIiwiY2xlYXJUaW1lb3V0IiwiX3NldE1lc3NhZ2VEYXRhVGltZW91dCIsInNJY29uIiwib01lc3NhZ2VzIiwib01lc3NhZ2VDb3VudCIsIkVycm9yIiwiV2FybmluZyIsIlN1Y2Nlc3MiLCJJbmZvcm1hdGlvbiIsImlNZXNzYWdlTGVuZ3RoIiwic0J1dHRvblR5cGUiLCJCdXR0b25UeXBlIiwiRGVmYXVsdCIsInNNZXNzYWdlS2V5Iiwic1Rvb2x0aXBUZXh0Iiwic01lc3NhZ2VUZXh0IiwibmF2aWdhdGVCYWNrIiwiTWVzc2FnZVR5cGUiLCJOZWdhdGl2ZSIsIkNyaXRpY2FsIiwiTmV1dHJhbCIsInNldFRleHQiLCJzZXRUb29sdGlwIiwic2V0SWNvbiIsInNldFR5cGUiLCJzZXRWaXNpYmxlIiwiZmlyZU1lc3NhZ2VDaGFuZ2UiLCJvUGFnZVJlYWR5IiwiZ2V0Q29udHJvbGxlciIsInBhZ2VSZWFkeSIsIndhaXRQYWdlUmVhZHkiLCJzb21lIiwib09ycGhhbkVsZW1lbnQiLCJvUGFyZW50RWxlbWVudCIsIm9JbnRlcm5hbE1vZGVsQ29udGV4dCIsIm9JdGVtIiwiZ2V0UGFyYW1ldGVyIiwib01lc3NhZ2UiLCJnZXRUYXJnZXQiLCJzU2VjdGlvblRpdGxlIiwiX2RlZmF1bHRGb2N1cyIsIm1kY1RhYmxlIiwiZm9jdXNJbmZvIiwicHJldmVudFNjcm9sbCIsInRhcmdldEluZm8iLCJmb2N1cyIsIm9UYXJnZXRNZGNUYWJsZSIsImNvbnRyb2xJZHMiLCJjb250cm9sIiwib1BhcmVudENvbnRyb2wiLCJyZWR1Y2UiLCJhY2MiLCJ2YWwiLCJfbmF2aWdhdGVGcm9tTWVzc2FnZVRvU2VjdGlvblRhYmxlSW5JY29uVGFiQmFyTW9kZSIsIm9SZWZFcnJvckNvbnRleHQiLCJvUmVmRXJyb3IiLCJfc2V0Rm9jdXNPblRhcmdldEZpZWxkIiwidGFyZ2V0TWRjVGFibGUiLCJhVGFyZ2V0TWRjVGFibGVSb3ciLCJfZ2V0TWRjVGFibGVSb3dzIiwiaUZpcnN0VmlzaWJsZVJvdyIsIl9nZXRHcmlkVGFibGUiLCJnZXRGaXJzdFZpc2libGVSb3ciLCJvVGFyZ2V0Um93Iiwib1RhcmdldENlbGwiLCJnZXRUYXJnZXRDZWxsIiwic2V0Rm9jdXNUb0NvbnRyb2wiLCJlcnJvclByb3BlcnR5IiwiX3JvdXRpbmciLCJuYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQiLCJzY3JvbGxUb0luZGV4IiwiaU5ld0ZpcnN0VmlzaWJsZVJvdyIsImJTY3JvbGxOZWVkZWQiLCJvV2FpdENvbnRyb2xJZEFkZGVkIiwiYXR0YWNoRXZlbnQiLCJmb2N1c09uVGFyZ2V0RmllbGQiLCJmb2N1c09uTWVzc2FnZVRhcmdldENvbnRyb2wiLCJvU2VsZWN0ZWRTZWN0aW9uIiwiZ2V0U2VsZWN0ZWRTZWN0aW9uIiwiX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25Jbkljb25UYWJCYXJNb2RlIiwidGFyZ2V0Um93IiwiY29udHJvbElkIiwiaXNDb250cm9sSW5UYWJsZSIsImVsZW0iLCJhQWxsVmlld0VsZW1lbnRzIiwiYUVycm9uZW91c0NvbnRyb2xzIiwiZ2V0RG9tUmVmIiwiYU5vdFRhYmxlRXJyb25lb3VzQ29udHJvbHMiLCJDb2x1bW5MaXN0SXRlbSIsImdldE1ldGFkYXRhIiwiZ2V0TmFtZSIsIm9UYXJnZXRGaWVsZCIsImdldENvbnRlbnRFZGl0Iiwib1RhYmxlVGFyZ2V0Q29sIiwidGFnZXRDb2x1bW5Qcm9wZXJ0eSIsImNvbHVtbiIsIm9DdXN0b21Db2x1bW4iLCJnZXRDb250cm9sRGVsZWdhdGUiLCJnZXRDb2x1bW5zRm9yIiwib0NvbHVtbiIsInRlbXBsYXRlIiwicHJvcGVydHlJbmZvcyIsIm5hbWUiLCJhQ29sdW1ucyIsImFUYWJsZUNvbHVtbnMiLCJ0YXJnZXRDb2x1bW5Qcm9wZXJ0eSIsInRhYmxlQ29sdW1uIiwicmVsYXRpdmVQYXRoIiwiYklzVGFibGVUYXJnZXRDb2xWaXNpYmxlIiwiX2dldE1lc3NhZ2VSYW5rIiwib2JqIiwiYUFsbEVsZW1lbnRzIiwic2VjdGlvblJhbmsiLCJfZm5GaWx0ZXJVcG9uSWQiLCJnZXRDb250cm9sSWQiLCJzZWN0aW9uTmFtZSIsInN1YlNlY3Rpb25OYW1lIiwib1ZhbGlkYXRpb25GaWx0ZXJzIiwib1ZhbGlkYXRpb25BbmRDb250ZXh0RmlsdGVyIiwib0ZpbHRlcnMiLCJzUGF0aCIsIm9Tb3J0ZXIiLCJvRGlhbG9nRmlsdGVyIiwib2JqZWN0UGFnZUxheW91dFNlY3Rpb25zIiwiYVVzZXJEZWZpbmVkRmlsdGVyIiwiZmlsdGVyT3V0TWVzc2FnZXNJbkRpYWxvZyIsImZuVGVzdCIsImFDb250cm9sSWRzIiwiaW5kZXgiLCJJbmZpbml0eSIsImVycm9yRmllbGRDb250cm9sIiwiZmllbGRSYW5raW5EaWFsb2ciLCJEaWFsb2ciLCJGaWx0ZXIiLCJwYXRoIiwiY2FzZVNlbnNpdGl2ZSIsImdldENoZWNrQ29udHJvbEluVmlld0ZpbHRlciIsImFDdXN0b21GaWx0ZXJzIiwiZ2V0QWdncmVnYXRpb24iLCJvcGVyYXRvciIsInZhbHVlMSIsInZhbHVlMiIsIm9CaW5kaW5nQ29udGV4dCIsImZpbHRlcnMiLCJGaWx0ZXJPcGVyYXRvciIsIkVRIiwiYW5kIiwiU3RhcnRzV2l0aCIsIm9WYWxpZGF0aW9uQ29udGV4dERpYWxvZ0ZpbHRlcnMiLCJTb3J0ZXIiLCJvYmoxIiwib2JqMiIsInJhbmtBIiwicmFua0IiLCJfZ2V0U2VjdGlvbkJ5U2VjdGlvblRpdGxlIiwiYlVzZUljb25UYWJCYXIiLCJnZXRVc2VJY29uVGFiQmFyIiwic1NlbGVjdGVkU2VjdGlvbklkIiwic2V0U2VsZWN0ZWRTZWN0aW9uIiwib1RhYmxlQ29udGV4dCIsIm9PUENvbnRleHQiLCJiU2hvdWxkV2FpdEZvclRhYmxlUmVmcmVzaCIsIm9NZGNUYWJsZSIsIm9UYWJsZVJvdyIsImdldFRhYmxlIiwiZmluZEluZGV4IiwiZWxlbWVudCIsImdldFRhcmdldENlbGxJbmRleCIsImdldENlbGxzIiwib0NlbGwiLCJnZXRUYXJnZXRDb2x1bW5JbmRleCIsIm9UYXJnZXRFbGVtZW50IiwiaVRhcmdldENlbGxJbmRleCIsInNUYXJnZXRDZWxsSWQiLCJnZXRDcmVhdGlvblRlbXBsYXRlIiwiZm5SZWdFeHBlc2NhcGUiLCJzIiwiX2dldEN1c3RvbUNvbHVtbkluZm8iLCJpUG9zaXRpb24iLCJzVGFibGVDb2xQcm9wZXJ0eSIsIl9nZXRUYWJsZUZpcnN0Q29sUHJvcGVydHkiLCJvQ3VzdG9tQ29sdW1uSW5mbyIsIl9nZXRUYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRGb3JUZXh0QW5ub3RhdGlvbiIsInNNZXRhUGF0aCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiX2dldFRhYmxlRmlyc3RDb2xWYWx1ZSIsInNUZXh0QW5ub3RhdGlvblBhdGgiLCJzVGV4dEFycmFuZ2VtZW50Iiwic0NvZGVWYWx1ZSIsInNUZXh0VmFsdWUiLCJzQ29tcHV0ZWRWYWx1ZSIsImxhc3RJbmRleE9mIiwic2xpY2UiLCJjb25jYXQiLCJzRW51bU51bWJlciIsInNDb2xOYW1lRnJvbU1lc3NhZ2VPYmoiLCJnZXRUYWJsZURlZmluaXRpb24iLCJjb2x1bW5zIiwiY29tcG9uZW50IiwicmVxdWlyZSIsIm5hdk9iamVjdCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwiZ2V0TmF2aWdhdGlvbiIsInN1Yk9QQ29uZmlndXJlZCIsIm5hdkNvbmZpZ3VyZWQiLCJkZXRhaWwiLCJyb3V0ZSIsImdldFJvd1NldHRpbmdzIiwiZ2V0Um93QWN0aW9ucyIsIm1Qcm9wZXJ0aWVzIiwic1Jvd1N1YnRpdGxlVmFsdWUiLCJDb21tb25VdGlscyIsImdldFRyYW5zbGF0ZWRUZXh0Iiwib1RhYmxlRmlyc3RDb2xCaW5kaW5nQ29udGV4dFRleHRBbm5vdGF0aW9uIiwic1RhYmxlRmlyc3RDb2xUZXh0QW5ub3RhdGlvblBhdGgiLCJzVGFibGVGaXJzdENvbFRleHRBcnJhbmdlbWVudCIsIm9Db2x1bW5JbmZvIiwiX2RldGVybWluZUNvbHVtbkluZm8iLCJzQ29sdW1uSW5kaWNhdG9yIiwic0NvbHVtblZhbHVlIiwiU3RyaW5nIiwibWVzc2FnZVBvcG92ZXIiLCJmbkZvY3VzIiwiaXNPcGVuIiwiZm5PbkNsb3NlIiwiZGV0YWNoRXZlbnQiLCJjbG9zZSIsIndhcm5pbmciXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk1lc3NhZ2VCdXR0b24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlc291cmNlQnVuZGxlIGZyb20gXCJzYXAvYmFzZS9pMThuL1Jlc291cmNlQnVuZGxlXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBVcmlQYXJhbWV0ZXJzIGZyb20gXCJzYXAvYmFzZS91dGlsL1VyaVBhcmFtZXRlcnNcIjtcbmltcG9ydCB0eXBlIE1lc3NhZ2VGaWx0ZXIgZnJvbSBcInNhcC9mZS9jb21tb24vTWVzc2FnZUZpbHRlclwiO1xuaW1wb3J0IE1lc3NhZ2VQb3BvdmVyIGZyb20gXCJzYXAvZmUvY29tbW9uL01lc3NhZ2VQb3BvdmVyXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyBhZ2dyZWdhdGlvbiwgZGVmaW5lVUk1Q2xhc3MsIGV2ZW50IH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQ2xhc3NTdXBwb3J0XCI7XG5pbXBvcnQgdHlwZSBQYWdlQ29udHJvbGxlciBmcm9tIFwic2FwL2ZlL2NvcmUvUGFnZUNvbnRyb2xsZXJcIjtcbmltcG9ydCBUYWJsZUFQSSBmcm9tIFwic2FwL2ZlL21hY3Jvcy90YWJsZS9UYWJsZUFQSVwiO1xuaW1wb3J0IEJ1dHRvbiBmcm9tIFwic2FwL20vQnV0dG9uXCI7XG5pbXBvcnQgQ29sdW1uTGlzdEl0ZW0gZnJvbSBcInNhcC9tL0NvbHVtbkxpc3RJdGVtXCI7XG5pbXBvcnQgRGlhbG9nIGZyb20gXCJzYXAvbS9EaWFsb2dcIjtcbmltcG9ydCBGb3JtYXR0ZWRUZXh0IGZyb20gXCJzYXAvbS9Gb3JtYXR0ZWRUZXh0XCI7XG5pbXBvcnQgeyBCdXR0b25UeXBlIH0gZnJvbSBcInNhcC9tL2xpYnJhcnlcIjtcbmltcG9ydCBNZXNzYWdlSXRlbSBmcm9tIFwic2FwL20vTWVzc2FnZUl0ZW1cIjtcbmltcG9ydCB0eXBlIENvcmVFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgdHlwZSBVSTVFbGVtZW50IGZyb20gXCJzYXAvdWkvY29yZS9FbGVtZW50XCI7XG5pbXBvcnQgeyBNZXNzYWdlVHlwZSB9IGZyb20gXCJzYXAvdWkvY29yZS9saWJyYXJ5XCI7XG5pbXBvcnQgTWVzc2FnZSBmcm9tIFwic2FwL3VpL2NvcmUvbWVzc2FnZS9NZXNzYWdlXCI7XG5pbXBvcnQgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBNZGNUYWJsZSBmcm9tIFwic2FwL3VpL21kYy9UYWJsZVwiO1xuaW1wb3J0IEZpbHRlciBmcm9tIFwic2FwL3VpL21vZGVsL0ZpbHRlclwiO1xuaW1wb3J0IEZpbHRlck9wZXJhdG9yIGZyb20gXCJzYXAvdWkvbW9kZWwvRmlsdGVyT3BlcmF0b3JcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCBTb3J0ZXIgZnJvbSBcInNhcC91aS9tb2RlbC9Tb3J0ZXJcIjtcbmltcG9ydCBPYmplY3RQYWdlU2VjdGlvbiBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZVNlY3Rpb25cIjtcbmltcG9ydCBPYmplY3RQYWdlU3ViU2VjdGlvbiBmcm9tIFwic2FwL3V4YXAvT2JqZWN0UGFnZVN1YlNlY3Rpb25cIjtcblxuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLmNvbW1vbi5NZXNzYWdlQnV0dG9uXCIpXG5jbGFzcyBNZXNzYWdlQnV0dG9uIGV4dGVuZHMgQnV0dG9uIHtcblx0QGFnZ3JlZ2F0aW9uKHsgdHlwZTogXCJzYXAuZmUuY29tbW9uLk1lc3NhZ2VGaWx0ZXJcIiwgbXVsdGlwbGU6IHRydWUsIHNpbmd1bGFyTmFtZTogXCJjdXN0b21GaWx0ZXJcIiB9KVxuXHRjdXN0b21GaWx0ZXJzITogTWVzc2FnZUZpbHRlcjtcblxuXHRAZXZlbnQoKVxuXHRtZXNzYWdlQ2hhbmdlITogRnVuY3Rpb247XG5cblx0cHJpdmF0ZSBvTWVzc2FnZVBvcG92ZXI6IGFueTtcblx0cHJpdmF0ZSBvSXRlbUJpbmRpbmc6IGFueTtcblx0cHJpdmF0ZSBvT2JqZWN0UGFnZUxheW91dDogYW55O1xuXHRwcml2YXRlIHNMYXN0QWN0aW9uVGV4dCA9IFwiXCI7XG5cdHByaXZhdGUgc0dlbmVyYWxHcm91cFRleHQgPSBcIlwiO1xuXHRwcml2YXRlIF9zZXRNZXNzYWdlRGF0YVRpbWVvdXQ6IGFueTtcblx0cHJpdmF0ZSBzVmlld0lkID0gXCJcIjtcblxuXHRpbml0KCkge1xuXHRcdEJ1dHRvbi5wcm90b3R5cGUuaW5pdC5hcHBseSh0aGlzKTtcblx0XHQvL3ByZXNzIGV2ZW50IGhhbmRsZXIgYXR0YWNoZWQgdG8gb3BlbiB0aGUgbWVzc2FnZSBwb3BvdmVyXG5cdFx0dGhpcy5hdHRhY2hQcmVzcyh0aGlzLmhhbmRsZU1lc3NhZ2VQb3BvdmVyUHJlc3MsIHRoaXMpO1xuXHRcdHRoaXMub01lc3NhZ2VQb3BvdmVyID0gbmV3IE1lc3NhZ2VQb3BvdmVyKCk7XG5cdFx0dGhpcy5vSXRlbUJpbmRpbmcgPSB0aGlzLm9NZXNzYWdlUG9wb3Zlci5nZXRCaW5kaW5nKFwiaXRlbXNcIik7XG5cdFx0dGhpcy5vSXRlbUJpbmRpbmcuYXR0YWNoQ2hhbmdlKHRoaXMuX3NldE1lc3NhZ2VEYXRhLCB0aGlzKTtcblx0XHRjb25zdCBtZXNzYWdlQnV0dG9uSWQgPSB0aGlzLmdldElkKCk7XG5cdFx0aWYgKG1lc3NhZ2VCdXR0b25JZCkge1xuXHRcdFx0dGhpcy5vTWVzc2FnZVBvcG92ZXIuYWRkQ3VzdG9tRGF0YShuZXcgKHNhcCBhcyBhbnkpLnVpLmNvcmUuQ3VzdG9tRGF0YSh7IGtleTogXCJtZXNzYWdlQnV0dG9uSWRcIiwgdmFsdWU6IG1lc3NhZ2VCdXR0b25JZCB9KSk7IC8vIFRPRE8gY2hlY2sgZm9yIGN1c3RvbSBkYXRhIHR5cGVcblx0XHR9XG5cdFx0dGhpcy5hdHRhY2hNb2RlbENvbnRleHRDaGFuZ2UodGhpcy5fYXBwbHlGaWx0ZXJzQW5kU29ydC5iaW5kKHRoaXMpKTtcblx0XHR0aGlzLm9NZXNzYWdlUG9wb3Zlci5hdHRhY2hBY3RpdmVUaXRsZVByZXNzKHRoaXMuX2FjdGl2ZVRpdGxlUHJlc3MuYmluZCh0aGlzKSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGlzIGNhbGxlZCB3aGVuIGEgdXNlciBjbGlja3Mgb24gdGhlIE1lc3NhZ2VCdXR0b24gY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIG9FdmVudCBFdmVudCBvYmplY3Rcblx0ICovXG5cdGhhbmRsZU1lc3NhZ2VQb3BvdmVyUHJlc3Mob0V2ZW50OiBDb3JlRXZlbnQpIHtcblx0XHR0aGlzLm9NZXNzYWdlUG9wb3Zlci50b2dnbGUob0V2ZW50LmdldFNvdXJjZSgpKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRoYXQgZ3JvdXBzIHRoZSBtZXNzYWdlcyBiYXNlZCBvbiB0aGUgc2VjdGlvbiBvciBzdWJzZWN0aW9uIHRoZXkgYmVsb25nIHRvLlxuXHQgKiBUaGlzIG1ldGhvZCBmb3JjZSB0aGUgbG9hZGluZyBvZiBjb250ZXh0cyBmb3IgYWxsIHRhYmxlcyBiZWZvcmUgdG8gYXBwbHkgdGhlIGdyb3VwaW5nLlxuXHQgKlxuXHQgKiBAcGFyYW0gb1ZpZXcgQ3VycmVudCB2aWV3LlxuXHQgKiBAcmV0dXJucyBSZXR1cm4gcHJvbWlzZS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGFzeW5jIF9hcHBseUdyb3VwaW5nQXN5bmMob1ZpZXc6IFZpZXcpIHtcblx0XHRjb25zdCBhV2FpdEZvckRhdGE6IFByb21pc2U8dm9pZD5bXSA9IFtdO1xuXHRcdGNvbnN0IG9WaWV3QmluZGluZ0NvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGNvbnN0IF9maW5kVGFibGVzUmVsYXRlZFRvTWVzc2FnZXMgPSAodmlldzogVmlldykgPT4ge1xuXHRcdFx0Y29uc3Qgb1JlczogYW55W10gPSBbXTtcblx0XHRcdGNvbnN0IGFNZXNzYWdlcyA9IHRoaXMub0l0ZW1CaW5kaW5nLmdldENvbnRleHRzKCkubWFwKGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvQ29udGV4dC5nZXRPYmplY3QoKTtcblx0XHRcdH0pO1xuXHRcdFx0Y29uc3Qgb1ZpZXdDb250ZXh0ID0gdmlldy5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0aWYgKG9WaWV3Q29udGV4dCkge1xuXHRcdFx0XHRjb25zdCBvT2JqZWN0UGFnZSA9IHZpZXcuZ2V0Q29udGVudCgpWzBdO1xuXHRcdFx0XHR0aGlzLmdldFZpc2libGVTZWN0aW9uc0Zyb21PYmplY3RQYWdlTGF5b3V0KG9PYmplY3RQYWdlKS5mb3JFYWNoKGZ1bmN0aW9uIChvU2VjdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0b1NlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKS5mb3JFYWNoKGZ1bmN0aW9uIChvU3ViU2VjdGlvbjogYW55KSB7XG5cdFx0XHRcdFx0XHRvU3ViU2VjdGlvbi5maW5kRWxlbWVudHModHJ1ZSkuZm9yRWFjaChmdW5jdGlvbiAob0VsZW06IGFueSkge1xuXHRcdFx0XHRcdFx0XHRpZiAob0VsZW0uaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0XHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYU1lc3NhZ2VzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBvUm93QmluZGluZyA9IG9FbGVtLmdldFJvd0JpbmRpbmcoKTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChvUm93QmluZGluZykge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBzRWxlbWVCaW5kaW5nUGF0aCA9IGAke29WaWV3Q29udGV4dC5nZXRQYXRoKCl9LyR7b0VsZW0uZ2V0Um93QmluZGluZygpLmdldFBhdGgoKX1gO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRpZiAoYU1lc3NhZ2VzW2ldLnRhcmdldC5pbmRleE9mKHNFbGVtZUJpbmRpbmdQYXRoKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9SZXMucHVzaCh7IHRhYmxlOiBvRWxlbSwgc3Vic2VjdGlvbjogb1N1YlNlY3Rpb24gfSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBvUmVzO1xuXHRcdH07XG5cdFx0Ly8gU2VhcmNoIGZvciB0YWJsZSByZWxhdGVkIHRvIE1lc3NhZ2VzIGFuZCBpbml0aWFsaXplIHRoZSBiaW5kaW5nIGNvbnRleHQgb2YgdGhlIHBhcmVudCBzdWJzZWN0aW9uIHRvIHJldHJpZXZlIHRoZSBkYXRhXG5cdFx0Y29uc3Qgb1RhYmxlcyA9IF9maW5kVGFibGVzUmVsYXRlZFRvTWVzc2FnZXMuYmluZCh0aGlzKShvVmlldyk7XG5cdFx0b1RhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uIChfb1RhYmxlKSB7XG5cdFx0XHRjb25zdCBvTURDVGFibGUgPSBfb1RhYmxlLnRhYmxlLFxuXHRcdFx0XHRvU3Vic2VjdGlvbiA9IF9vVGFibGUuc3Vic2VjdGlvbjtcblx0XHRcdGlmICghb01EQ1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCkgfHwgb01EQ1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCk/LmdldFBhdGgoKSAhPT0gb1ZpZXdCaW5kaW5nQ29udGV4dD8uZ2V0UGF0aCgpKSB7XG5cdFx0XHRcdG9TdWJzZWN0aW9uLnNldEJpbmRpbmdDb250ZXh0KG9WaWV3QmluZGluZ0NvbnRleHQpO1xuXHRcdFx0XHRpZiAoIW9NRENUYWJsZS5nZXRSb3dCaW5kaW5nKCkuaXNMZW5ndGhGaW5hbCgpKSB7XG5cdFx0XHRcdFx0YVdhaXRGb3JEYXRhLnB1c2goXG5cdFx0XHRcdFx0XHRuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZTogRnVuY3Rpb24pIHtcblx0XHRcdFx0XHRcdFx0b01EQ1RhYmxlLmdldFJvd0JpbmRpbmcoKS5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRjb25zdCB3YWl0Rm9yR3JvdXBpbmdBcHBsaWVkID0gbmV3IFByb21pc2UoKHJlc29sdmU6IEZ1bmN0aW9uKSA9PiB7XG5cdFx0XHRzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcblx0XHRcdFx0dGhpcy5fYXBwbHlHcm91cGluZygpO1xuXHRcdFx0XHRyZXNvbHZlKCk7XG5cdFx0XHR9LCAwKTtcblx0XHR9KTtcblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgUHJvbWlzZS5hbGwoYVdhaXRGb3JEYXRhKTtcblx0XHRcdG9WaWV3LmdldE1vZGVsKCkuY2hlY2tNZXNzYWdlcygpO1xuXHRcdFx0YXdhaXQgd2FpdEZvckdyb3VwaW5nQXBwbGllZDtcblx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGdyb3VwaW5nIHRoZSBtZXNzYWdlcyBpbiB0aGUgbWVzc2FnZVBvcE92ZXJcIik7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgcmV0cmlldmVzIHRoZSB2aXNpYmxlIHNlY3Rpb25zIGZyb20gYW4gb2JqZWN0IHBhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBvT2JqZWN0UGFnZUxheW91dCBUaGUgb2JqZWN0UGFnZUxheW91dCBvYmplY3QgZm9yIHdoaWNoIHdlIHdhbnQgdG8gcmV0cmlldmUgdGhlIHZpc2libGUgc2VjdGlvbnMuXG5cdCAqIEByZXR1cm5zIEFycmF5IG9mIHZpc2libGUgc2VjdGlvbnMuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRnZXRWaXNpYmxlU2VjdGlvbnNGcm9tT2JqZWN0UGFnZUxheW91dChvT2JqZWN0UGFnZUxheW91dDogYW55KSB7XG5cdFx0cmV0dXJuIG9PYmplY3RQYWdlTGF5b3V0LmdldFNlY3Rpb25zKCkuZmlsdGVyKGZ1bmN0aW9uIChvU2VjdGlvbjogYW55KSB7XG5cdFx0XHRyZXR1cm4gb1NlY3Rpb24uZ2V0VmlzaWJsZSgpO1xuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRoZSBtZXRob2QgdGhhdCBncm91cHMgdGhlIG1lc3NhZ2VzIGJhc2VkIG9uIHRoZSBzZWN0aW9uIG9yIHN1YnNlY3Rpb24gdGhleSBiZWxvbmcgdG8uXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfYXBwbHlHcm91cGluZygpIHtcblx0XHR0aGlzLm9PYmplY3RQYWdlTGF5b3V0ID0gdGhpcy5fZ2V0T2JqZWN0UGFnZUxheW91dCh0aGlzLCB0aGlzLm9PYmplY3RQYWdlTGF5b3V0KTtcblx0XHRpZiAoIXRoaXMub09iamVjdFBhZ2VMYXlvdXQpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Y29uc3QgYU1lc3NhZ2VzID0gdGhpcy5vTWVzc2FnZVBvcG92ZXIuZ2V0SXRlbXMoKTtcblx0XHRjb25zdCBhU2VjdGlvbnMgPSB0aGlzLmdldFZpc2libGVTZWN0aW9uc0Zyb21PYmplY3RQYWdlTGF5b3V0KHRoaXMub09iamVjdFBhZ2VMYXlvdXQpO1xuXHRcdGNvbnN0IGJFbmFibGVCaW5kaW5nID0gdGhpcy5fY2hlY2tDb250cm9sSWRJblNlY3Rpb25zKGFNZXNzYWdlcywgZmFsc2UpO1xuXHRcdGlmIChiRW5hYmxlQmluZGluZykge1xuXHRcdFx0dGhpcy5fZm5FbmFibGVCaW5kaW5ncyhhU2VjdGlvbnMpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHJldHJpZXZlcyB0aGUgYmluZGluZyBjb250ZXh0IGZvciB0aGUgcmVmRXJyb3Igb2JqZWN0LlxuXHQgKiBUaGUgcmVmRXJyb3IgY29udGFpbnMgYSBtYXAgdG8gc3RvcmUgdGhlIGluZGV4ZXMgb2YgdGhlIHJvd3Mgd2l0aCBlcnJvcnMuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVGFibGUgVGhlIHRhYmxlIGZvciB3aGljaCB3ZSB3YW50IHRvIGdldCB0aGUgcmVmRXJyb3IgT2JqZWN0LlxuXHQgKiBAcmV0dXJucyBDb250ZXh0IG9mIHRoZSByZWZFcnJvci5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRUYWJsZVJlZkVycm9yQ29udGV4dChvVGFibGU6IGFueSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9UYWJsZS5nZXRNb2RlbChcImludGVybmFsXCIpO1xuXHRcdC8vaW5pdGlhbGl6ZSB0aGUgcmVmRXJyb3IgcHJvcGVydHkgaWYgaXQgZG9lc24ndCBleGlzdFxuXHRcdGlmICghb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikuZ2V0UHJvcGVydHkoXCJyZWZFcnJvclwiKSkge1xuXHRcdFx0b01vZGVsLnNldFByb3BlcnR5KFwicmVmRXJyb3JcIiwge30sIG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpKTtcblx0XHR9XG5cdFx0Y29uc3Qgc1JlZkVycm9yQ29udGV4dFBhdGggPVxuXHRcdFx0b1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIikuZ2V0UGF0aCgpICtcblx0XHRcdFwiL3JlZkVycm9yL1wiICtcblx0XHRcdG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpLmdldFBhdGgoKS5yZXBsYWNlKFwiL1wiLCBcIiRcIikgK1xuXHRcdFx0XCIkXCIgK1xuXHRcdFx0b1RhYmxlLmdldFJvd0JpbmRpbmcoKS5nZXRQYXRoKCkucmVwbGFjZShcIi9cIiwgXCIkXCIpO1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gb01vZGVsLmdldENvbnRleHQoc1JlZkVycm9yQ29udGV4dFBhdGgpO1xuXHRcdGlmICghb0NvbnRleHQuZ2V0UHJvcGVydHkoXCJcIikpIHtcblx0XHRcdG9Nb2RlbC5zZXRQcm9wZXJ0eShcIlwiLCB7fSwgb0NvbnRleHQpO1xuXHRcdH1cblx0XHRyZXR1cm4gb0NvbnRleHQ7XG5cdH1cblxuXHRfdXBkYXRlSW50ZXJuYWxNb2RlbChcblx0XHRvVGFibGVSb3dDb250ZXh0OiBhbnksXG5cdFx0aVJvd0luZGV4OiBudW1iZXIsXG5cdFx0c1RhYmxlVGFyZ2V0Q29sUHJvcGVydHk6IHN0cmluZyxcblx0XHRvVGFibGU6IGFueSxcblx0XHRvTWVzc2FnZU9iamVjdDogYW55LFxuXHRcdGJJc0NyZWF0aW9uUm93PzogYm9vbGVhblxuXHQpIHtcblx0XHRsZXQgb1RlbXA7XG5cdFx0aWYgKGJJc0NyZWF0aW9uUm93KSB7XG5cdFx0XHRvVGVtcCA9IHtcblx0XHRcdFx0cm93SW5kZXg6IFwiQ3JlYXRpb25Sb3dcIixcblx0XHRcdFx0dGFyZ2V0Q29sUHJvcGVydHk6IHNUYWJsZVRhcmdldENvbFByb3BlcnR5ID8gc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgOiBcIlwiXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvVGVtcCA9IHtcblx0XHRcdFx0cm93SW5kZXg6IG9UYWJsZVJvd0NvbnRleHQgPyBpUm93SW5kZXggOiBcIlwiLFxuXHRcdFx0XHR0YXJnZXRDb2xQcm9wZXJ0eTogc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPyBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSA6IFwiXCJcblx0XHRcdH07XG5cdFx0fVxuXHRcdGNvbnN0IG9Nb2RlbCA9IG9UYWJsZS5nZXRNb2RlbChcImludGVybmFsXCIpLFxuXHRcdFx0b0NvbnRleHQgPSB0aGlzLl9nZXRUYWJsZVJlZkVycm9yQ29udGV4dChvVGFibGUpO1xuXHRcdC8vd2UgZmlyc3QgcmVtb3ZlIHRoZSBlbnRyaWVzIHdpdGggb2Jzb2xldGUgbWVzc2FnZSBpZHMgZnJvbSB0aGUgaW50ZXJuYWwgbW9kZWwgYmVmb3JlIGluc2VydGluZyB0aGUgbmV3IGVycm9yIGluZm8gOlxuXHRcdGNvbnN0IGFWYWxpZE1lc3NhZ2VJZHMgPSBzYXAudWlcblx0XHRcdC5nZXRDb3JlKClcblx0XHRcdC5nZXRNZXNzYWdlTWFuYWdlcigpXG5cdFx0XHQuZ2V0TWVzc2FnZU1vZGVsKClcblx0XHRcdC5nZXREYXRhKClcblx0XHRcdC5tYXAoZnVuY3Rpb24gKG1lc3NhZ2U6IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gbWVzc2FnZS5pZDtcblx0XHRcdH0pO1xuXHRcdGxldCBhT2Jzb2xldGVNZXNzYWdlbElkcztcblx0XHRpZiAob0NvbnRleHQuZ2V0UHJvcGVydHkoKSkge1xuXHRcdFx0YU9ic29sZXRlTWVzc2FnZWxJZHMgPSBPYmplY3Qua2V5cyhvQ29udGV4dC5nZXRQcm9wZXJ0eSgpKS5maWx0ZXIoZnVuY3Rpb24gKGludGVybmFsTWVzc2FnZUlkKSB7XG5cdFx0XHRcdHJldHVybiBhVmFsaWRNZXNzYWdlSWRzLmluZGV4T2YoaW50ZXJuYWxNZXNzYWdlSWQpID09PSAtMTtcblx0XHRcdH0pO1xuXHRcdFx0YU9ic29sZXRlTWVzc2FnZWxJZHMuZm9yRWFjaChmdW5jdGlvbiAob2Jzb2xldGVJZCkge1xuXHRcdFx0XHRkZWxldGUgb0NvbnRleHQuZ2V0UHJvcGVydHkoKVtvYnNvbGV0ZUlkXTtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRvTW9kZWwuc2V0UHJvcGVydHkoXG5cdFx0XHRvTWVzc2FnZU9iamVjdC5nZXRJZCgpLFxuXHRcdFx0T2JqZWN0LmFzc2lnbih7fSwgb0NvbnRleHQuZ2V0UHJvcGVydHkob01lc3NhZ2VPYmplY3QuZ2V0SWQoKSkgPyBvQ29udGV4dC5nZXRQcm9wZXJ0eShvTWVzc2FnZU9iamVjdC5nZXRJZCgpKSA6IHt9LCBvVGVtcCksXG5cdFx0XHRvQ29udGV4dFxuXHRcdCk7XG5cdH1cblxuXHRfZ2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb24oc3ViU2VjdGlvbjogYW55LCBtZXNzYWdlOiBhbnkpIHtcblx0XHRjb25zdCBvTWVzc2FnZU9iamVjdCA9IG1lc3NhZ2UuZ2V0QmluZGluZ0NvbnRleHQoXCJtZXNzYWdlXCIpLmdldE9iamVjdCgpO1xuXHRcdHJldHVybiBzdWJTZWN0aW9uXG5cdFx0XHQuZmluZEVsZW1lbnRzKHRydWUsIChvRWxlbTogYW55KSA9PiB7XG5cdFx0XHRcdHJldHVybiB0aGlzLl9mbkZpbHRlclVwb25JZHMob01lc3NhZ2VPYmplY3QuZ2V0Q29udHJvbElkcygpLCBvRWxlbSk7XG5cdFx0XHR9KVxuXHRcdFx0LnNvcnQoZnVuY3Rpb24gKGE6IGFueSwgYjogYW55KSB7XG5cdFx0XHRcdC8vIGNvbnRyb2xzIGFyZSBzb3J0ZWQgaW4gb3JkZXIgdG8gaGF2ZSB0aGUgdGFibGUgb24gdG9wIG9mIHRoZSBhcnJheVxuXHRcdFx0XHQvLyBpdCB3aWxsIGhlbHAgdG8gY29tcHV0ZSB0aGUgc3VidGl0bGUgb2YgdGhlIG1lc3NhZ2UgYmFzZWQgb24gdGhlIHR5cGUgb2YgcmVsYXRlZCBjb250cm9sc1xuXHRcdFx0XHRpZiAoYS5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpICYmICFiLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikpIHtcblx0XHRcdFx0XHRyZXR1cm4gLTE7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIDE7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRoYXQgc2V0cyBncm91cHMgZm9yIHRyYW5zaWVudCBtZXNzYWdlcy5cblx0ICpcblx0ICogQHBhcmFtIHtvYmplY3R9IG1lc3NhZ2UgVGhlIHRyYW5zaWVudCBtZXNzYWdlIGZvciB3aGljaCB3ZSB3YW50IHRvIGNvbXB1dGUgYW5kIHNldCBncm91cC5cblx0ICogQHBhcmFtIHtzdHJpbmd9IHNBY3Rpb25OYW1lIFRoZSBhY3Rpb24gbmFtZS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cblx0X3NldEdyb3VwTGFiZWxGb3JUcmFuc2llbnRNc2cobWVzc2FnZTogYW55LCBzQWN0aW9uTmFtZTogc3RyaW5nKSB7XG5cdFx0dGhpcy5zTGFzdEFjdGlvblRleHQgPSB0aGlzLnNMYXN0QWN0aW9uVGV4dFxuXHRcdFx0PyB0aGlzLnNMYXN0QWN0aW9uVGV4dFxuXHRcdFx0OiBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJUX01FU1NBR0VfQlVUVE9OX1NBUEZFX01FU1NBR0VfR1JPVVBfTEFTVF9BQ1RJT05cIik7XG5cblx0XHRtZXNzYWdlLnNldEdyb3VwTmFtZShgJHt0aGlzLnNMYXN0QWN0aW9uVGV4dH06ICR7c0FjdGlvbk5hbWV9YCk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGdyb3VwIG1lc3NhZ2VzIGFuZCBhZGQgdGhlIHN1YnRpdGxlLlxuXHQgKlxuXHQgKiBAcGFyYW0ge29iamVjdH0gbWVzc2FnZSBUaGUgbWVzc2FnZSB3ZSB3YW50IHRvIGNvbXB1dGUgZ3JvdXAgYW5kIHN1YnRpdGxlLlxuXHQgKiBAcGFyYW0ge29iamVjdH0gc2VjdGlvbiBUaGUgc2VjdGlvbiBjb250YWluaW5nIHRoZSBjb250cm9scy5cblx0ICogQHBhcmFtIHtvYmplY3R9IHN1YlNlY3Rpb24gVGhlIHN1YnNlY3Rpb24gY29udGFpbmluZyB0aGUgY29udHJvbHMuXG5cdCAqIEBwYXJhbSB7b2JqZWN0fSBhRWxlbWVudHMgTGlzdCBvZiBjb250cm9scyBmcm9tIGEgc3Vic2VjdGlvbiByZWxhdGVkIHRvIGEgbWVzc2FnZS5cblx0ICogQHBhcmFtIHtib29sZWFufSBiTXVsdGlwbGVTdWJTZWN0aW9ucyBUcnVlIGlmIHRoZXJlIGlzIG1vcmUgdGhhbiAxIHN1YnNlY3Rpb24gaW4gdGhlIHNlY3Rpb24uXG5cdCAqIEBwYXJhbSB7c3RyaW5nfSBzQWN0aW9uTmFtZSBUaGUgYWN0aW9uIG5hbWUuXG5cdCAqIEByZXR1cm5zIHtvYmplY3R9IFJldHVybiB0aGUgY29udHJvbCB0YXJnZXRlZCBieSB0aGUgbWVzc2FnZS5cblx0ICogQHByaXZhdGVcblx0ICovXG5cblx0X2NvbXB1dGVNZXNzYWdlR3JvdXBBbmRTdWJUaXRsZShcblx0XHRtZXNzYWdlOiBNZXNzYWdlSXRlbSxcblx0XHRzZWN0aW9uOiBPYmplY3RQYWdlU2VjdGlvbixcblx0XHRzdWJTZWN0aW9uOiBPYmplY3RQYWdlU3ViU2VjdGlvbixcblx0XHRhRWxlbWVudHM6IGFueVtdLFxuXHRcdGJNdWx0aXBsZVN1YlNlY3Rpb25zOiBib29sZWFuLFxuXHRcdHNBY3Rpb25OYW1lOiBzdHJpbmdcblx0KSB7XG5cdFx0dGhpcy5vSXRlbUJpbmRpbmcuZGV0YWNoQ2hhbmdlKHRoaXMuX3NldE1lc3NhZ2VEYXRhLCB0aGlzKTtcblx0XHRjb25zdCBvTWVzc2FnZU9iamVjdCA9IG1lc3NhZ2UuZ2V0QmluZGluZ0NvbnRleHQoXCJtZXNzYWdlXCIpPy5nZXRPYmplY3QoKSBhcyBNZXNzYWdlO1xuXG5cdFx0bGV0IG9FbGVtZW50LFxuXHRcdFx0b1RhYmxlOiBhbnksXG5cdFx0XHRvVGFyZ2V0VGFibGVJbmZvOiBhbnksXG5cdFx0XHRsLFxuXHRcdFx0aVJvd0luZGV4LFxuXHRcdFx0b1RhcmdldGVkQ29udHJvbCxcblx0XHRcdGJJc0NyZWF0aW9uUm93LFxuXHRcdFx0c01lc3NhZ2VTdWJ0aXRsZTogc3RyaW5nID0gXCJcIjtcblx0XHRjb25zdCBiSXNCYWNrZW5kTWVzc2FnZSA9IG5ldyBSZWdFeHAoXCJeL1wiKS50ZXN0KG9NZXNzYWdlT2JqZWN0Py5nZXRUYXJnZXRzKClbMF0pLFxuXHRcdFx0b1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblxuXHRcdGlmIChiSXNCYWNrZW5kTWVzc2FnZSkge1xuXHRcdFx0Zm9yIChsID0gMDsgbCA8IGFFbGVtZW50cy5sZW5ndGg7IGwrKykge1xuXHRcdFx0XHRvRWxlbWVudCA9IGFFbGVtZW50c1tsXTtcblx0XHRcdFx0b1RhcmdldGVkQ29udHJvbCA9IG9FbGVtZW50O1xuXHRcdFx0XHRpZiAob0VsZW1lbnQuaXNBKFwic2FwLm0uVGFibGVcIikgfHwgb0VsZW1lbnQuaXNBKFwic2FwLnVpLnRhYmxlLlRhYmxlXCIpKSB7XG5cdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mbyA9IHt9O1xuXHRcdFx0XHRcdG9UYWJsZSA9IG9FbGVtZW50LmdldFBhcmVudCgpO1xuXHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8udGFibGVIZWFkZXIgPSBvVGFibGUuZ2V0SGVhZGVyKCk7XG5cdFx0XHRcdFx0Y29uc3Qgb1Jvd0JpbmRpbmcgPSBvVGFibGUuZ2V0Um93QmluZGluZygpO1xuXHRcdFx0XHRcdGlmIChvUm93QmluZGluZyAmJiBvUm93QmluZGluZy5pc0xlbmd0aEZpbmFsKCkgJiYgb1RhYmxlLmdldEJpbmRpbmdDb250ZXh0KCkpIHtcblx0XHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPSB0aGlzLl9nZXRUYWJsZUNvbFByb3BlcnR5KG9UYWJsZSwgb01lc3NhZ2VPYmplY3QpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1RhYmxlQ29sSW5mbyA9IHRoaXMuX2dldFRhYmxlQ29sSW5mbyhvVGFibGUsIG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkpO1xuXHRcdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dCaW5kaW5nQ29udGV4dHMgPSBvRWxlbWVudC5pc0EoXCJzYXAudWkudGFibGUuVGFibGVcIilcblx0XHRcdFx0XHRcdFx0PyBvUm93QmluZGluZy5nZXRDb250ZXh0cygpXG5cdFx0XHRcdFx0XHRcdDogb1Jvd0JpbmRpbmcuZ2V0Q3VycmVudENvbnRleHRzKCk7XG5cdFx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbE5hbWUgPSBvVGFibGVDb2xJbmZvLnNUYWJsZVRhcmdldENvbE5hbWU7XG5cdFx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldFByb3BlcnR5ID0gb1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xQcm9wZXJ0eTtcblx0XHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPSBvVGFibGVDb2xJbmZvLnNUYWJsZVRhcmdldENvbFByb3BlcnR5O1xuXHRcdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0ID0gb1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dCaW5kaW5nQ29udGV4dHMuZmluZChcblx0XHRcdFx0XHRcdFx0ZnVuY3Rpb24gKG1lc3NhZ2VPYmplY3Q6IGFueSwgcm93Q29udGV4dDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHJvd0NvbnRleHQgJiYgbWVzc2FnZU9iamVjdC5nZXRUYXJnZXRzKClbMF0uaW5kZXhPZihyb3dDb250ZXh0LmdldFBhdGgoKSkgPT09IDA7XG5cdFx0XHRcdFx0XHRcdH0uYmluZCh0aGlzLCBvTWVzc2FnZU9iamVjdClcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRsZXQgc0NvbnRyb2xJZDtcblx0XHRcdFx0XHRcdGlmICghb1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0KSB7XG5cdFx0XHRcdFx0XHRcdHNDb250cm9sSWQgPSBvTWVzc2FnZU9iamVjdC5nZXRDb250cm9sSWRzKCkuZmluZChcblx0XHRcdFx0XHRcdFx0XHRmdW5jdGlvbiAodGhpczogYW55LCB0YWJsZTogYW55LCBzSWQ6IHN0cmluZykge1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRoaXMuX0lzQ29udHJvbEluVGFibGUodGFibGUsIHNJZCk7XG5cdFx0XHRcdFx0XHRcdFx0fS5iaW5kKHRoaXMsIG9UYWJsZSlcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGlmIChzQ29udHJvbElkKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IG9Db250cm9sID0gQ29yZS5ieUlkKHNDb250cm9sSWQpO1xuXHRcdFx0XHRcdFx0XHRiSXNDcmVhdGlvblJvdyA9IHRoaXMuX0lzQ29udHJvbFBhcnRPZkNyZWF0aW9uUm93KG9Db250cm9sKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHNNZXNzYWdlU3VidGl0bGUgPSB0aGlzLl9nZXRNZXNzYWdlU3VidGl0bGUoXG5cdFx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93QmluZGluZ0NvbnRleHRzLFxuXHRcdFx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQsXG5cdFx0XHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sTmFtZSxcblx0XHRcdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdFx0XHRvVGFibGUsXG5cdFx0XHRcdFx0XHRcdGJJc0NyZWF0aW9uUm93XG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0Ly9zZXQgdGhlIHN1YnRpdGxlXG5cdFx0XHRcdFx0XHRtZXNzYWdlLnNldFN1YnRpdGxlKHNNZXNzYWdlU3VidGl0bGUpO1xuXHRcdFx0XHRcdFx0bWVzc2FnZS5zZXRBY3RpdmVUaXRsZSghIW9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCk7XG5cblx0XHRcdFx0XHRcdGlmIChvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5fZm9ybWF0TWVzc2FnZURlc2NyaXB0aW9uKFxuXHRcdFx0XHRcdFx0XHRcdG1lc3NhZ2UsXG5cdFx0XHRcdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0LFxuXHRcdFx0XHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sTmFtZSxcblx0XHRcdFx0XHRcdFx0XHRvUmVzb3VyY2VCdW5kbGUsXG5cdFx0XHRcdFx0XHRcdFx0b1RhYmxlXG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRpUm93SW5kZXggPSBvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQgJiYgb1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dDb250ZXh0LmdldEluZGV4KCk7XG5cdFx0XHRcdFx0XHR0aGlzLl91cGRhdGVJbnRlcm5hbE1vZGVsKFxuXHRcdFx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQsXG5cdFx0XHRcdFx0XHRcdGlSb3dJbmRleCxcblx0XHRcdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdFx0b1RhYmxlLFxuXHRcdFx0XHRcdFx0XHRvTWVzc2FnZU9iamVjdFxuXHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bWVzc2FnZS5zZXRBY3RpdmVUaXRsZSh0cnVlKTtcblx0XHRcdFx0XHQvL2NoZWNrIGlmIHRoZSB0YXJnZXRlZCBjb250cm9sIGlzIGEgY2hpbGQgb2Ygb25lIG9mIHRoZSBvdGhlciBjb250cm9sc1xuXHRcdFx0XHRcdGNvbnN0IGJJc1RhcmdldGVkQ29udHJvbE9ycGhhbiA9IHRoaXMuX2JJc09ycGhhbkVsZW1lbnQob1RhcmdldGVkQ29udHJvbCwgYUVsZW1lbnRzKTtcblx0XHRcdFx0XHRpZiAoYklzVGFyZ2V0ZWRDb250cm9sT3JwaGFuKSB7XG5cdFx0XHRcdFx0XHQvL3NldCB0aGUgc3VidGl0bGVcblx0XHRcdFx0XHRcdG1lc3NhZ2Uuc2V0U3VidGl0bGUoc01lc3NhZ2VTdWJ0aXRsZSk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly9UaGVyZSBpcyBvbmx5IG9uZSBlbHQgYXMgdGhpcyBpcyBhIGZyb250RW5kIG1lc3NhZ2Vcblx0XHRcdG9UYXJnZXRlZENvbnRyb2wgPSBhRWxlbWVudHNbMF07XG5cdFx0XHRvVGFibGUgPSB0aGlzLl9nZXRNZGNUYWJsZShvVGFyZ2V0ZWRDb250cm9sKTtcblx0XHRcdGlmIChvVGFibGUpIHtcblx0XHRcdFx0b1RhcmdldFRhYmxlSW5mbyA9IHt9O1xuXHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnRhYmxlSGVhZGVyID0gb1RhYmxlLmdldEhlYWRlcigpO1xuXHRcdFx0XHRjb25zdCBpVGFyZ2V0Q29sdW1uSW5kZXggPSB0aGlzLl9nZXRUYWJsZUNvbHVtbkluZGV4KG9UYXJnZXRlZENvbnRyb2wpO1xuXHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbFByb3BlcnR5ID1cblx0XHRcdFx0XHRpVGFyZ2V0Q29sdW1uSW5kZXggPiAtMSA/IG9UYWJsZS5nZXRDb2x1bW5zKClbaVRhcmdldENvbHVtbkluZGV4XS5nZXREYXRhUHJvcGVydHkoKSA6IHVuZGVmaW5lZDtcblx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRQcm9wZXJ0eSA9IG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHk7XG5cdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sTmFtZSA9XG5cdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5zVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSAmJiBpVGFyZ2V0Q29sdW1uSW5kZXggPiAtMVxuXHRcdFx0XHRcdFx0PyBvVGFibGUuZ2V0Q29sdW1ucygpW2lUYXJnZXRDb2x1bW5JbmRleF0uZ2V0SGVhZGVyKClcblx0XHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0XHRiSXNDcmVhdGlvblJvdyA9IHRoaXMuX2dldFRhYmxlUm93KG9UYXJnZXRlZENvbnRyb2wpLmlzQShcInNhcC51aS50YWJsZS5DcmVhdGlvblJvd1wiKTtcblx0XHRcdFx0aWYgKCFiSXNDcmVhdGlvblJvdykge1xuXHRcdFx0XHRcdGlSb3dJbmRleCA9IHRoaXMuX2dldFRhYmxlUm93SW5kZXgob1RhcmdldGVkQ29udHJvbCk7XG5cdFx0XHRcdFx0b1RhcmdldFRhYmxlSW5mby5vVGFibGVSb3dCaW5kaW5nQ29udGV4dHMgPSBvVGFibGUuZ2V0Um93QmluZGluZygpLmdldEN1cnJlbnRDb250ZXh0cygpO1xuXHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCA9IG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93QmluZGluZ0NvbnRleHRzW2lSb3dJbmRleF07XG5cdFx0XHRcdH1cblx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IHRoaXMuX2dldE1lc3NhZ2VTdWJ0aXRsZShcblx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93QmluZGluZ0NvbnRleHRzLFxuXHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8ub1RhYmxlUm93Q29udGV4dCxcblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLnNUYWJsZVRhcmdldENvbE5hbWUsXG5cdFx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLFxuXHRcdFx0XHRcdG9UYWJsZSxcblx0XHRcdFx0XHRiSXNDcmVhdGlvblJvdyxcblx0XHRcdFx0XHRpVGFyZ2V0Q29sdW1uSW5kZXggPT09IDAgJiYgb1RhcmdldGVkQ29udHJvbC5nZXRWYWx1ZVN0YXRlKCkgPT09IFwiRXJyb3JcIiA/IG9UYXJnZXRlZENvbnRyb2wgOiB1bmRlZmluZWRcblx0XHRcdFx0KTtcblx0XHRcdFx0Ly9zZXQgdGhlIHN1YnRpdGxlXG5cdFx0XHRcdG1lc3NhZ2Uuc2V0U3VidGl0bGUoc01lc3NhZ2VTdWJ0aXRsZSk7XG5cdFx0XHRcdG1lc3NhZ2Uuc2V0QWN0aXZlVGl0bGUodHJ1ZSk7XG5cblx0XHRcdFx0dGhpcy5fdXBkYXRlSW50ZXJuYWxNb2RlbChcblx0XHRcdFx0XHRvVGFyZ2V0VGFibGVJbmZvLm9UYWJsZVJvd0NvbnRleHQsXG5cdFx0XHRcdFx0aVJvd0luZGV4LFxuXHRcdFx0XHRcdG9UYXJnZXRUYWJsZUluZm8uc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHksXG5cdFx0XHRcdFx0b1RhYmxlLFxuXHRcdFx0XHRcdG9NZXNzYWdlT2JqZWN0LFxuXHRcdFx0XHRcdGJJc0NyZWF0aW9uUm93XG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChvTWVzc2FnZU9iamVjdC5nZXRQZXJzaXN0ZW50KCkgJiYgc0FjdGlvbk5hbWUpIHtcblx0XHRcdHRoaXMuX3NldEdyb3VwTGFiZWxGb3JUcmFuc2llbnRNc2cobWVzc2FnZSwgc0FjdGlvbk5hbWUpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtZXNzYWdlLnNldEdyb3VwTmFtZShcblx0XHRcdFx0c2VjdGlvbi5nZXRUaXRsZSgpICtcblx0XHRcdFx0XHQoc3ViU2VjdGlvbi5nZXRUaXRsZSgpICYmIGJNdWx0aXBsZVN1YlNlY3Rpb25zID8gYCwgJHtzdWJTZWN0aW9uLmdldFRpdGxlKCl9YCA6IFwiXCIpICtcblx0XHRcdFx0XHQob1RhcmdldFRhYmxlSW5mb1xuXHRcdFx0XHRcdFx0PyBgLCAke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiVF9NRVNTQUdFX0dST1VQX1RJVExFX1RBQkxFX0RFTk9NSU5BVE9SXCIpfTogJHtvVGFyZ2V0VGFibGVJbmZvLnRhYmxlSGVhZGVyfWBcblx0XHRcdFx0XHRcdDogXCJcIilcblx0XHRcdCk7XG5cdFx0XHRjb25zdCBzVmlld0lkID0gdGhpcy5fZ2V0Vmlld0lkKHRoaXMuZ2V0SWQoKSk7XG5cdFx0XHRjb25zdCBvVmlldyA9IENvcmUuYnlJZChzVmlld0lkIGFzIHN0cmluZyk7XG5cdFx0XHRjb25zdCBvTWVzc2FnZVRhcmdldFByb3BlcnR5ID0gb01lc3NhZ2VPYmplY3QuZ2V0VGFyZ2V0cygpWzBdICYmIG9NZXNzYWdlT2JqZWN0LmdldFRhcmdldHMoKVswXS5zcGxpdChcIi9cIikucG9wKCk7XG5cdFx0XHRjb25zdCBvVUlNb2RlbCA9IG9WaWV3Py5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0XHRcdGlmIChcblx0XHRcdFx0b1VJTW9kZWwgJiZcblx0XHRcdFx0b1VJTW9kZWwuZ2V0UHJvcGVydHkoXCIvbWVzc2FnZVRhcmdldFByb3BlcnR5XCIpICYmXG5cdFx0XHRcdG9NZXNzYWdlVGFyZ2V0UHJvcGVydHkgJiZcblx0XHRcdFx0b01lc3NhZ2VUYXJnZXRQcm9wZXJ0eSA9PT0gb1VJTW9kZWwuZ2V0UHJvcGVydHkoXCIvbWVzc2FnZVRhcmdldFByb3BlcnR5XCIpXG5cdFx0XHQpIHtcblx0XHRcdFx0dGhpcy5vTWVzc2FnZVBvcG92ZXIuZmlyZUFjdGl2ZVRpdGxlUHJlc3MoeyBcIml0ZW1cIjogbWVzc2FnZSB9KTtcblx0XHRcdFx0b1VJTW9kZWwuc2V0UHJvcGVydHkoXCIvbWVzc2FnZVRhcmdldFByb3BlcnR5XCIsIGZhbHNlKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0dGhpcy5vSXRlbUJpbmRpbmcuYXR0YWNoQ2hhbmdlKHRoaXMuX3NldE1lc3NhZ2VEYXRhLCB0aGlzKTtcblx0XHRyZXR1cm4gb1RhcmdldGVkQ29udHJvbDtcblx0fVxuXG5cdF9jaGVja0NvbnRyb2xJZEluU2VjdGlvbnMoYU1lc3NhZ2VzOiBhbnlbXSwgYkVuYWJsZUJpbmRpbmc6IGJvb2xlYW4pIHtcblx0XHRsZXQgc2VjdGlvbiwgYVN1YlNlY3Rpb25zLCBtZXNzYWdlLCBpLCBqLCBrO1xuXG5cdFx0dGhpcy5zR2VuZXJhbEdyb3VwVGV4dCA9IHRoaXMuc0dlbmVyYWxHcm91cFRleHRcblx0XHRcdD8gdGhpcy5zR2VuZXJhbEdyb3VwVGV4dFxuXHRcdFx0OiBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5jb3JlXCIpLmdldFRleHQoXCJUX01FU1NBR0VfQlVUVE9OX1NBUEZFX01FU1NBR0VfR1JPVVBfR0VORVJBTFwiKTtcblx0XHQvL0dldCBhbGwgc2VjdGlvbnMgZnJvbSB0aGUgb2JqZWN0IHBhZ2UgbGF5b3V0XG5cdFx0Y29uc3QgYVZpc2libGVTZWN0aW9ucyA9IHRoaXMuZ2V0VmlzaWJsZVNlY3Rpb25zRnJvbU9iamVjdFBhZ2VMYXlvdXQodGhpcy5vT2JqZWN0UGFnZUxheW91dCk7XG5cdFx0aWYgKGFWaXNpYmxlU2VjdGlvbnMpIHtcblx0XHRcdGNvbnN0IHZpZXdJZCA9IHRoaXMuX2dldFZpZXdJZCh0aGlzLmdldElkKCkpO1xuXHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb3JlLmJ5SWQodmlld0lkKTtcblx0XHRcdGNvbnN0IHNBY3Rpb25OYW1lID0gb1ZpZXc/LmdldEJpbmRpbmdDb250ZXh0KFwiaW50ZXJuYWxcIik/LmdldFByb3BlcnR5KFwic0FjdGlvbk5hbWVcIik7XG5cdFx0XHRpZiAoc0FjdGlvbk5hbWUpIHtcblx0XHRcdFx0KG9WaWV3Py5nZXRCaW5kaW5nQ29udGV4dChcImludGVybmFsXCIpIGFzIGFueSkuc2V0UHJvcGVydHkoXCJzQWN0aW9uTmFtZVwiLCBudWxsKTtcblx0XHRcdH1cblx0XHRcdGZvciAoaSA9IGFNZXNzYWdlcy5sZW5ndGggLSAxOyBpID49IDA7IC0taSkge1xuXHRcdFx0XHQvLyBMb29wIG92ZXIgYWxsIG1lc3NhZ2VzXG5cdFx0XHRcdG1lc3NhZ2UgPSBhTWVzc2FnZXNbaV07XG5cdFx0XHRcdGxldCBiSXNHZW5lcmFsR3JvdXBOYW1lID0gdHJ1ZTtcblx0XHRcdFx0Zm9yIChqID0gYVZpc2libGVTZWN0aW9ucy5sZW5ndGggLSAxOyBqID49IDA7IC0taikge1xuXHRcdFx0XHRcdC8vIExvb3Agb3ZlciBhbGwgdmlzaWJsZSBzZWN0aW9uc1xuXHRcdFx0XHRcdHNlY3Rpb24gPSBhVmlzaWJsZVNlY3Rpb25zW2pdO1xuXHRcdFx0XHRcdGFTdWJTZWN0aW9ucyA9IHNlY3Rpb24uZ2V0U3ViU2VjdGlvbnMoKTtcblx0XHRcdFx0XHRmb3IgKGsgPSBhU3ViU2VjdGlvbnMubGVuZ3RoIC0gMTsgayA+PSAwOyAtLWspIHtcblx0XHRcdFx0XHRcdC8vIExvb3Agb3ZlciBhbGwgc3ViLXNlY3Rpb25zXG5cdFx0XHRcdFx0XHRjb25zdCBzdWJTZWN0aW9uID0gYVN1YlNlY3Rpb25zW2tdO1xuXHRcdFx0XHRcdFx0Y29uc3QgYUNvbnRyb2xzID0gdGhpcy5fZ2V0Q29udHJvbEZyb21NZXNzYWdlUmVsYXRpbmdUb1N1YlNlY3Rpb24oc3ViU2VjdGlvbiwgbWVzc2FnZSk7XG5cdFx0XHRcdFx0XHRpZiAoYUNvbnRyb2xzLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRcdFx0Y29uc3Qgb1RhcmdldGVkQ29udHJvbCA9IHRoaXMuX2NvbXB1dGVNZXNzYWdlR3JvdXBBbmRTdWJUaXRsZShcblx0XHRcdFx0XHRcdFx0XHRtZXNzYWdlLFxuXHRcdFx0XHRcdFx0XHRcdHNlY3Rpb24sXG5cdFx0XHRcdFx0XHRcdFx0c3ViU2VjdGlvbixcblx0XHRcdFx0XHRcdFx0XHRhQ29udHJvbHMsXG5cdFx0XHRcdFx0XHRcdFx0YVN1YlNlY3Rpb25zLmxlbmd0aCA+IDEsXG5cdFx0XHRcdFx0XHRcdFx0c0FjdGlvbk5hbWVcblx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0Ly8gaWYgd2UgZm91bmQgdGFibGUgdGhhdCBtYXRjaGVzIHdpdGggdGhlIG1lc3NhZ2UsIHdlIGRvbid0IHN0b3AgdGhlIGxvb3Bcblx0XHRcdFx0XHRcdFx0Ly8gaW4gY2FzZSB3ZSBmaW5kIGFuIGFkZGl0aW9uYWwgY29udHJvbCAoZWcgbWRjIGZpZWxkKSB0aGF0IGFsc28gbWF0Y2ggd2l0aCB0aGUgbWVzc2FnZVxuXHRcdFx0XHRcdFx0XHRpZiAob1RhcmdldGVkQ29udHJvbCAmJiAhb1RhcmdldGVkQ29udHJvbC5pc0EoXCJzYXAubS5UYWJsZVwiKSAmJiAhb1RhcmdldGVkQ29udHJvbC5pc0EoXCJzYXAudWkudGFibGUuVGFibGVcIikpIHtcblx0XHRcdFx0XHRcdFx0XHRqID0gayA9IC0xO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGJJc0dlbmVyYWxHcm91cE5hbWUgPSBmYWxzZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKGJJc0dlbmVyYWxHcm91cE5hbWUpIHtcblx0XHRcdFx0XHRjb25zdCBvTWVzc2FnZU9iamVjdCA9IG1lc3NhZ2UuZ2V0QmluZGluZ0NvbnRleHQoXCJtZXNzYWdlXCIpLmdldE9iamVjdCgpO1xuXHRcdFx0XHRcdG1lc3NhZ2Uuc2V0QWN0aXZlVGl0bGUoZmFsc2UpO1xuXHRcdFx0XHRcdGlmIChvTWVzc2FnZU9iamVjdC5wZXJzaXN0ZW50ICYmIHNBY3Rpb25OYW1lKSB7XG5cdFx0XHRcdFx0XHR0aGlzLl9zZXRHcm91cExhYmVsRm9yVHJhbnNpZW50TXNnKG1lc3NhZ2UsIHNBY3Rpb25OYW1lKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0bWVzc2FnZS5zZXRHcm91cE5hbWUodGhpcy5zR2VuZXJhbEdyb3VwVGV4dCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICghYkVuYWJsZUJpbmRpbmcgJiYgbWVzc2FnZS5nZXRHcm91cE5hbWUoKSA9PT0gdGhpcy5zR2VuZXJhbEdyb3VwVGV4dCAmJiB0aGlzLl9maW5kVGFyZ2V0Rm9yTWVzc2FnZShtZXNzYWdlKSkge1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0X2ZpbmRUYXJnZXRGb3JNZXNzYWdlKG1lc3NhZ2U6IGFueSkge1xuXHRcdGNvbnN0IG1lc3NhZ2VPYmplY3QgPSBtZXNzYWdlLmdldEJpbmRpbmdDb250ZXh0KFwibWVzc2FnZVwiKSAmJiBtZXNzYWdlLmdldEJpbmRpbmdDb250ZXh0KFwibWVzc2FnZVwiKS5nZXRPYmplY3QoKTtcblx0XHRpZiAobWVzc2FnZU9iamVjdCAmJiBtZXNzYWdlT2JqZWN0LnRhcmdldCkge1xuXHRcdFx0Y29uc3Qgb01ldGFNb2RlbCA9XG5cdFx0XHRcdFx0dGhpcy5vT2JqZWN0UGFnZUxheW91dCAmJiB0aGlzLm9PYmplY3RQYWdlTGF5b3V0LmdldE1vZGVsKCkgJiYgdGhpcy5vT2JqZWN0UGFnZUxheW91dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0XHRjb250ZXh0UGF0aCA9IG9NZXRhTW9kZWwgJiYgb01ldGFNb2RlbC5nZXRNZXRhUGF0aChtZXNzYWdlT2JqZWN0LnRhcmdldCksXG5cdFx0XHRcdG9Db250ZXh0UGF0aE1ldGFkYXRhID0gb01ldGFNb2RlbCAmJiBvTWV0YU1vZGVsLmdldE9iamVjdChjb250ZXh0UGF0aCk7XG5cdFx0XHRpZiAob0NvbnRleHRQYXRoTWV0YWRhdGEgJiYgb0NvbnRleHRQYXRoTWV0YWRhdGEuJGtpbmQgPT09IFwiUHJvcGVydHlcIikge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRfZm5FbmFibGVCaW5kaW5ncyhhU2VjdGlvbnM6IGFueVtdKSB7XG5cdFx0aWYgKFVyaVBhcmFtZXRlcnMuZnJvbVF1ZXJ5KHdpbmRvdy5sb2NhdGlvbi5zZWFyY2gpLmdldChcInNhcC1mZS14eC1sYXp5bG9hZGluZ3Rlc3RcIikpIHtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0Zm9yIChsZXQgaVNlY3Rpb24gPSAwOyBpU2VjdGlvbiA8IGFTZWN0aW9ucy5sZW5ndGg7IGlTZWN0aW9uKyspIHtcblx0XHRcdGNvbnN0IG9TZWN0aW9uID0gYVNlY3Rpb25zW2lTZWN0aW9uXTtcblx0XHRcdGxldCBub25UYWJsZUNoYXJ0Y29udHJvbEZvdW5kID0gZmFsc2U7XG5cdFx0XHRjb25zdCBhU3ViU2VjdGlvbnMgPSBvU2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpO1xuXHRcdFx0Zm9yIChsZXQgaVN1YlNlY3Rpb24gPSAwOyBpU3ViU2VjdGlvbiA8IGFTdWJTZWN0aW9ucy5sZW5ndGg7IGlTdWJTZWN0aW9uKyspIHtcblx0XHRcdFx0Y29uc3Qgb1N1YlNlY3Rpb24gPSBhU3ViU2VjdGlvbnNbaVN1YlNlY3Rpb25dO1xuXHRcdFx0XHRjb25zdCBvQWxsQmxvY2tzID0gb1N1YlNlY3Rpb24uZ2V0QmxvY2tzKCk7XG5cdFx0XHRcdGlmIChvQWxsQmxvY2tzKSB7XG5cdFx0XHRcdFx0Zm9yIChsZXQgYmxvY2sgPSAwOyBibG9jayA8IG9TdWJTZWN0aW9uLmdldEJsb2NrcygpLmxlbmd0aDsgYmxvY2srKykge1xuXHRcdFx0XHRcdFx0aWYgKG9BbGxCbG9ja3NbYmxvY2tdLmdldENvbnRlbnQgJiYgIW9BbGxCbG9ja3NbYmxvY2tdLmdldENvbnRlbnQoKS5pc0EoXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlQVBJXCIpKSB7XG5cdFx0XHRcdFx0XHRcdG5vblRhYmxlQ2hhcnRjb250cm9sRm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0aWYgKG5vblRhYmxlQ2hhcnRjb250cm9sRm91bmQpIHtcblx0XHRcdFx0XHRcdG9TdWJTZWN0aW9uLnNldEJpbmRpbmdDb250ZXh0KHVuZGVmaW5lZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChvU3ViU2VjdGlvbi5nZXRCaW5kaW5nQ29udGV4dCgpKSB7XG5cdFx0XHRcdFx0dGhpcy5fZmluZE1lc3NhZ2VHcm91cEFmdGVyUmViaW5kaW5nKCk7XG5cdFx0XHRcdFx0b1N1YlNlY3Rpb24uZ2V0QmluZGluZ0NvbnRleHQoKS5nZXRCaW5kaW5nKCkuYXR0YWNoRGF0YVJlY2VpdmVkKHRoaXMuX2ZpbmRNZXNzYWdlR3JvdXBBZnRlclJlYmluZGluZyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRfZmluZE1lc3NhZ2VHcm91cEFmdGVyUmViaW5kaW5nKCkge1xuXHRcdGNvbnN0IGFNZXNzYWdlcyA9IHRoaXMub01lc3NhZ2VQb3BvdmVyLmdldEl0ZW1zKCk7XG5cdFx0dGhpcy5fY2hlY2tDb250cm9sSWRJblNlY3Rpb25zKGFNZXNzYWdlcywgdHJ1ZSk7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IHJldHJpZXZlcyB0aGUgdmlldyBJRCAoSFRNTFZpZXcvWE1MVmlldy9KU09Odmlldy9KU1ZpZXcvVGVtcGxhdGV2aWV3KSBvZiBhbnkgY29udHJvbC5cblx0ICpcblx0ICogQHBhcmFtIHNDb250cm9sSWQgSUQgb2YgdGhlIGNvbnRyb2wgbmVlZGVkIHRvIHJldHJpZXZlIHRoZSB2aWV3IElEXG5cdCAqIEByZXR1cm5zIFRoZSB2aWV3IElEIG9mIHRoZSBjb250cm9sXG5cdCAqL1xuXHRfZ2V0Vmlld0lkKHNDb250cm9sSWQ6IHN0cmluZykge1xuXHRcdGxldCBzVmlld0lkLFxuXHRcdFx0b0NvbnRyb2wgPSBDb3JlLmJ5SWQoc0NvbnRyb2xJZCkgYXMgYW55O1xuXHRcdHdoaWxlIChvQ29udHJvbCkge1xuXHRcdFx0aWYgKG9Db250cm9sIGluc3RhbmNlb2YgVmlldykge1xuXHRcdFx0XHRzVmlld0lkID0gb0NvbnRyb2wuZ2V0SWQoKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0XHRvQ29udHJvbCA9IG9Db250cm9sLmdldFBhcmVudCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gc1ZpZXdJZDtcblx0fVxuXG5cdF9zZXRMb25ndGV4dFVybERlc2NyaXB0aW9uKHNNZXNzYWdlRGVzY3JpcHRpb25Db250ZW50OiBzdHJpbmcsIG9EaWFnbm9zaXNUaXRsZTogYW55KSB7XG5cdFx0dGhpcy5vTWVzc2FnZVBvcG92ZXIuc2V0QXN5bmNEZXNjcmlwdGlvbkhhbmRsZXIoZnVuY3Rpb24gKGNvbmZpZzogYW55KSB7XG5cdFx0XHQvLyBUaGlzIHN0b3JlcyB0aGUgb2xkIGRlc2NyaXB0aW9uXG5cdFx0XHRjb25zdCBzT2xkRGVzY3JpcHRpb24gPSBzTWVzc2FnZURlc2NyaXB0aW9uQ29udGVudDtcblx0XHRcdC8vIEhlcmUgd2UgY2FuIGZldGNoIHRoZSBkYXRhIGFuZCBjb25jYXRlbmF0ZSBpdCB0byB0aGUgb2xkIG9uZVxuXHRcdFx0Ly8gQnkgZGVmYXVsdCwgdGhlIGxvbmd0ZXh0VXJsIGZldGNoaW5nIHdpbGwgb3ZlcndyaXRlIHRoZSBkZXNjcmlwdGlvbiAod2l0aCB0aGUgZGVmYXVsdCBiZWhhdmlvdXIpXG5cdFx0XHQvLyBIZXJlIGFzIHdlIGhhdmUgb3ZlcndyaXR0ZW4gdGhlIGRlZmF1bHQgYXN5bmMgaGFuZGxlciwgd2hpY2ggZmV0Y2hlcyBhbmQgcmVwbGFjZXMgdGhlIGRlc2NyaXB0aW9uIG9mIHRoZSBpdGVtXG5cdFx0XHQvLyB3ZSBjYW4gbWFudWFsbHkgbW9kaWZ5IGl0IHRvIGluY2x1ZGUgd2hhdGV2ZXIgbmVlZGVkLlxuXHRcdFx0Y29uc3Qgc0xvbmdUZXh0VXJsID0gY29uZmlnLml0ZW0uZ2V0TG9uZ3RleHRVcmwoKTtcblx0XHRcdGlmIChzTG9uZ1RleHRVcmwpIHtcblx0XHRcdFx0alF1ZXJ5LmFqYXgoe1xuXHRcdFx0XHRcdHR5cGU6IFwiR0VUXCIsXG5cdFx0XHRcdFx0dXJsOiBzTG9uZ1RleHRVcmwsXG5cdFx0XHRcdFx0c3VjY2VzczogZnVuY3Rpb24gKGRhdGEpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHNEaWFnbm9zaXNUZXh0ID0gb0RpYWdub3Npc1RpdGxlLmdldEh0bWxUZXh0KCkgKyBkYXRhO1xuXHRcdFx0XHRcdFx0Y29uZmlnLml0ZW0uc2V0RGVzY3JpcHRpb24oYCR7c09sZERlc2NyaXB0aW9ufSR7c0RpYWdub3Npc1RleHR9YCk7XG5cdFx0XHRcdFx0XHRjb25maWcucHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRlcnJvcjogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0Y29uZmlnLml0ZW0uc2V0RGVzY3JpcHRpb24oc01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgc0Vycm9yID0gYEEgcmVxdWVzdCBoYXMgZmFpbGVkIGZvciBsb25nIHRleHQgZGF0YS4gVVJMOiAke3NMb25nVGV4dFVybH1gO1xuXHRcdFx0XHRcdFx0TG9nLmVycm9yKHNFcnJvcik7XG5cdFx0XHRcdFx0XHRjb25maWcucHJvbWlzZS5yZWplY3Qoc0Vycm9yKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0X2Zvcm1hdE1lc3NhZ2VEZXNjcmlwdGlvbihcblx0XHRtZXNzYWdlOiBhbnksXG5cdFx0b1RhYmxlUm93Q29udGV4dDogYW55LFxuXHRcdHNUYWJsZVRhcmdldENvbE5hbWU6IHN0cmluZyxcblx0XHRvUmVzb3VyY2VCdW5kbGU6IFJlc291cmNlQnVuZGxlLFxuXHRcdG9UYWJsZTogYW55XG5cdCkge1xuXHRcdGNvbnN0IHNUYWJsZUZpcnN0Q29sUHJvcGVydHkgPSBvVGFibGUuZ2V0UGFyZW50KCkuZ2V0SWRlbnRpZmllckNvbHVtbigpO1xuXHRcdGxldCBzQ29sdW1uSW5mbyA9IFwiXCI7XG5cdFx0Y29uc3Qgb0NvbEZyb21UYWJsZVNldHRpbmdzID0gdGhpcy5fZmV0Y2hDb2x1bW5JbmZvKG1lc3NhZ2UsIG9UYWJsZSk7XG5cdFx0aWYgKHNUYWJsZVRhcmdldENvbE5hbWUpIHtcblx0XHRcdC8vIGlmIGNvbHVtbiBpbiBwcmVzZW50IGluIHRhYmxlIGRlZmluaXRpb25cblx0XHRcdHNDb2x1bW5JbmZvID0gYCR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJUX01FU1NBR0VfR1JPVVBfREVTQ1JJUFRJT05fVEFCTEVfQ09MVU1OXCIpfTogJHtzVGFibGVUYXJnZXRDb2xOYW1lfWA7XG5cdFx0fSBlbHNlIGlmIChvQ29sRnJvbVRhYmxlU2V0dGluZ3MpIHtcblx0XHRcdGlmIChvQ29sRnJvbVRhYmxlU2V0dGluZ3MuYXZhaWxhYmlsaXR5ID09PSBcIkhpZGRlblwiKSB7XG5cdFx0XHRcdC8vIGlmIGNvbHVtbiBpbiBuZWl0aGVyIGluIHRhYmxlIGRlZmluaXRpb24gbm9yIHBlcnNvbmFsaXphdGlvblxuXHRcdFx0XHRpZiAobWVzc2FnZS5nZXRUeXBlKCkgPT09IFwiRXJyb3JcIikge1xuXHRcdFx0XHRcdHNDb2x1bW5JbmZvID0gc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eVxuXHRcdFx0XHRcdFx0PyBgJHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfQ09MVU1OX0FWQUlMQUJMRV9ESUFHTk9TSVNfTVNHREVTQ19FUlJPUlwiKX0gJHtvVGFibGVSb3dDb250ZXh0LmdldFZhbHVlKFxuXHRcdFx0XHRcdFx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcblx0XHRcdFx0XHRcdCAgKX1gICsgXCIuXCJcblx0XHRcdFx0XHRcdDogYCR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJUX0NPTFVNTl9BVkFJTEFCTEVfRElBR05PU0lTX01TR0RFU0NfRVJST1JcIil9YCArIFwiLlwiO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHNDb2x1bW5JbmZvID0gc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eVxuXHRcdFx0XHRcdFx0PyBgJHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfQ09MVU1OX0FWQUlMQUJMRV9ESUFHTk9TSVNfTVNHREVTQ1wiKX0gJHtvVGFibGVSb3dDb250ZXh0LmdldFZhbHVlKFxuXHRcdFx0XHRcdFx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcblx0XHRcdFx0XHRcdCAgKX1gICsgXCIuXCJcblx0XHRcdFx0XHRcdDogYCR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJUX0NPTFVNTl9BVkFJTEFCTEVfRElBR05PU0lTX01TR0RFU0NcIil9YCArIFwiLlwiO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyBpZiBjb2x1bW4gaXMgbm90IGluIHRhYmxlIGRlZmluaXRpb24gYnV0IGluIHBlcnNvbmFsaXphdGlvblxuXHRcdFx0XHQvL2lmIG5vIG5hdmlnYXRpb24gdG8gc3ViIG9wIHRoZW4gcmVtb3ZlIGxpbmsgdG8gZXJyb3IgZmllbGQgQkNQIDogMjI4MDE2ODg5OVxuXHRcdFx0XHRpZiAoIXRoaXMuX25hdmlnYXRpb25Db25maWd1cmVkKG9UYWJsZSkpIHtcblx0XHRcdFx0XHRtZXNzYWdlLnNldEFjdGl2ZVRpdGxlKGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzQ29sdW1uSW5mbyA9IGAke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiVF9NRVNTQUdFX0dST1VQX0RFU0NSSVBUSU9OX1RBQkxFX0NPTFVNTlwiKX06ICR7XG5cdFx0XHRcdFx0b0NvbEZyb21UYWJsZVNldHRpbmdzLmxhYmVsXG5cdFx0XHRcdH0gKCR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJUX0NPTFVNTl9JTkRJQ0FUT1JfSU5fVEFCTEVfREVGSU5JVElPTlwiKX0pYDtcblx0XHRcdH1cblx0XHR9XG5cdFx0Y29uc3Qgb0ZpZWxkc0FmZmVjdGVkVGl0bGUgPSBuZXcgRm9ybWF0dGVkVGV4dCh7XG5cdFx0XHRodG1sVGV4dDogYDxodG1sPjxib2R5PjxzdHJvbmc+JHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfRklFTERTX0FGRkVDVEVEX1RJVExFXCIpfTwvc3Ryb25nPjwvYm9keT48L2h0bWw+PGJyPmBcblx0XHR9KTtcblx0XHRsZXQgc0ZpZWxkQWZmZWN0ZWRUZXh0OiBTdHJpbmc7XG5cdFx0aWYgKHNUYWJsZUZpcnN0Q29sUHJvcGVydHkpIHtcblx0XHRcdHNGaWVsZEFmZmVjdGVkVGV4dCA9IGAke29GaWVsZHNBZmZlY3RlZFRpdGxlLmdldEh0bWxUZXh0KCl9PGJyPiR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXG5cdFx0XHRcdFwiVF9NRVNTQUdFX0dST1VQX1RJVExFX1RBQkxFX0RFTk9NSU5BVE9SXCJcblx0XHRcdCl9OiAke29UYWJsZS5nZXRIZWFkZXIoKX08YnI+JHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9ST1dcIil9OiAke29UYWJsZVJvd0NvbnRleHQuZ2V0VmFsdWUoXG5cdFx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcblx0XHRcdCl9PGJyPiR7c0NvbHVtbkluZm99PGJyPmA7XG5cdFx0fSBlbHNlIGlmIChzQ29sdW1uSW5mbyA9PSBcIlwiIHx8ICFzQ29sdW1uSW5mbykge1xuXHRcdFx0c0ZpZWxkQWZmZWN0ZWRUZXh0ID0gXCJcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c0ZpZWxkQWZmZWN0ZWRUZXh0ID0gYCR7b0ZpZWxkc0FmZmVjdGVkVGl0bGUuZ2V0SHRtbFRleHQoKX08YnI+JHtvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcblx0XHRcdFx0XCJUX01FU1NBR0VfR1JPVVBfVElUTEVfVEFCTEVfREVOT01JTkFUT1JcIlxuXHRcdFx0KX06ICR7b1RhYmxlLmdldEhlYWRlcigpfTxicj4ke3NDb2x1bW5JbmZvfTxicj5gO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9EaWFnbm9zaXNUaXRsZSA9IG5ldyBGb3JtYXR0ZWRUZXh0KHtcblx0XHRcdGh0bWxUZXh0OiBgPGh0bWw+PGJvZHk+PHN0cm9uZz4ke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiVF9ESUFHTk9TSVNfVElUTEVcIil9PC9zdHJvbmc+PC9ib2R5PjwvaHRtbD48YnI+YFxuXHRcdH0pO1xuXHRcdC8vIGdldCB0aGUgVUkgbWVzc2FnZXMgZnJvbSB0aGUgbWVzc2FnZSBjb250ZXh0IHRvIHNldCBpdCB0byBEaWFnbm9zaXMgc2VjdGlvblxuXHRcdGNvbnN0IHNVSU1lc3NhZ2VEZXNjcmlwdGlvbiA9IG1lc3NhZ2UuZ2V0QmluZGluZ0NvbnRleHQoXCJtZXNzYWdlXCIpLmdldE9iamVjdCgpLmRlc2NyaXB0aW9uO1xuXHRcdC8vc2V0IHRoZSBkZXNjcmlwdGlvbiB0byBudWxsIHRvIHJlc2V0IGl0IGJlbG93XG5cdFx0bWVzc2FnZS5zZXREZXNjcmlwdGlvbihudWxsKTtcblx0XHRsZXQgc0RpYWdub3Npc1RleHQgPSBcIlwiO1xuXHRcdGxldCBzTWVzc2FnZURlc2NyaXB0aW9uQ29udGVudCA9IFwiXCI7XG5cdFx0aWYgKG1lc3NhZ2UuZ2V0TG9uZ3RleHRVcmwoKSkge1xuXHRcdFx0c01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQgPSBgJHtzRmllbGRBZmZlY3RlZFRleHR9PGJyPmA7XG5cdFx0XHR0aGlzLl9zZXRMb25ndGV4dFVybERlc2NyaXB0aW9uKHNNZXNzYWdlRGVzY3JpcHRpb25Db250ZW50LCBvRGlhZ25vc2lzVGl0bGUpO1xuXHRcdH0gZWxzZSBpZiAoc1VJTWVzc2FnZURlc2NyaXB0aW9uKSB7XG5cdFx0XHRzRGlhZ25vc2lzVGV4dCA9IGAke29EaWFnbm9zaXNUaXRsZS5nZXRIdG1sVGV4dCgpfTxicj4ke3NVSU1lc3NhZ2VEZXNjcmlwdGlvbn1gO1xuXHRcdFx0c01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQgPSBgJHtzRmllbGRBZmZlY3RlZFRleHR9PGJyPiR7c0RpYWdub3Npc1RleHR9YDtcblx0XHRcdG1lc3NhZ2Uuc2V0RGVzY3JpcHRpb24oc01lc3NhZ2VEZXNjcmlwdGlvbkNvbnRlbnQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRtZXNzYWdlLnNldERlc2NyaXB0aW9uKHNGaWVsZEFmZmVjdGVkVGV4dCk7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBzZXQgdGhlIGJ1dHRvbiB0ZXh0LCBjb3VudCBhbmQgaWNvbiBwcm9wZXJ0eSBiYXNlZCB1cG9uIHRoZSBtZXNzYWdlIGl0ZW1zXG5cdCAqIEJ1dHRvblR5cGU6ICBQb3NzaWJsZSBzZXR0aW5ncyBmb3Igd2FybmluZyBhbmQgZXJyb3IgbWVzc2FnZXMgYXJlICdjcml0aWNhbCcgYW5kICduZWdhdGl2ZScuXG5cdCAqXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfc2V0TWVzc2FnZURhdGEoKSB7XG5cdFx0Y2xlYXJUaW1lb3V0KHRoaXMuX3NldE1lc3NhZ2VEYXRhVGltZW91dCk7XG5cblx0XHR0aGlzLl9zZXRNZXNzYWdlRGF0YVRpbWVvdXQgPSBzZXRUaW1lb3V0KGFzeW5jICgpID0+IHtcblx0XHRcdGNvbnN0IHNJY29uID0gXCJcIixcblx0XHRcdFx0b01lc3NhZ2VzID0gdGhpcy5vTWVzc2FnZVBvcG92ZXIuZ2V0SXRlbXMoKSxcblx0XHRcdFx0b01lc3NhZ2VDb3VudDogYW55ID0geyBFcnJvcjogMCwgV2FybmluZzogMCwgU3VjY2VzczogMCwgSW5mb3JtYXRpb246IDAgfSxcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKSxcblx0XHRcdFx0aU1lc3NhZ2VMZW5ndGggPSBvTWVzc2FnZXMubGVuZ3RoO1xuXHRcdFx0bGV0IHNCdXR0b25UeXBlID0gQnV0dG9uVHlwZS5EZWZhdWx0LFxuXHRcdFx0XHRzTWVzc2FnZUtleSA9IFwiXCIsXG5cdFx0XHRcdHNUb29sdGlwVGV4dCA9IFwiXCIsXG5cdFx0XHRcdHNNZXNzYWdlVGV4dCA9IFwiXCI7XG5cdFx0XHRpZiAoaU1lc3NhZ2VMZW5ndGggPiAwKSB7XG5cdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgaU1lc3NhZ2VMZW5ndGg7IGkrKykge1xuXHRcdFx0XHRcdGlmICghb01lc3NhZ2VzW2ldLmdldFR5cGUoKSB8fCBvTWVzc2FnZXNbaV0uZ2V0VHlwZSgpID09PSBcIlwiKSB7XG5cdFx0XHRcdFx0XHQrK29NZXNzYWdlQ291bnRbXCJJbmZvcm1hdGlvblwiXTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0KytvTWVzc2FnZUNvdW50W29NZXNzYWdlc1tpXS5nZXRUeXBlKCldO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5FcnJvcl0gPiAwKSB7XG5cdFx0XHRcdFx0c0J1dHRvblR5cGUgPSBCdXR0b25UeXBlLk5lZ2F0aXZlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuV2FybmluZ10gPiAwKSB7XG5cdFx0XHRcdFx0c0J1dHRvblR5cGUgPSBCdXR0b25UeXBlLkNyaXRpY2FsO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9NZXNzYWdlQ291bnRbTWVzc2FnZVR5cGUuU3VjY2Vzc10gPiAwKSB7XG5cdFx0XHRcdFx0c0J1dHRvblR5cGUgPSBCdXR0b25UeXBlLlN1Y2Nlc3M7XG5cdFx0XHRcdH0gZWxzZSBpZiAob01lc3NhZ2VDb3VudFtNZXNzYWdlVHlwZS5JbmZvcm1hdGlvbl0gPiAwKSB7XG5cdFx0XHRcdFx0c0J1dHRvblR5cGUgPSBCdXR0b25UeXBlLk5ldXRyYWw7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9NZXNzYWdlQ291bnQuRXJyb3IgPiAwKSB7XG5cdFx0XHRcdFx0dGhpcy5zZXRUZXh0KG9NZXNzYWdlQ291bnQuRXJyb3IpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRoaXMuc2V0VGV4dChcIlwiKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob01lc3NhZ2VDb3VudC5FcnJvciA9PT0gMSkge1xuXHRcdFx0XHRcdHNNZXNzYWdlS2V5ID0gXCJDX0NPTU1PTl9TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX0VSUk9SXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAob01lc3NhZ2VDb3VudC5FcnJvciA+IDEpIHtcblx0XHRcdFx0XHRzTWVzc2FnZUtleSA9IFwiQ19DT01NT05fU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9NVUxUSVBMRV9FUlJPUl9UT09MVElQXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIW9NZXNzYWdlQ291bnQuRXJyb3IgJiYgb01lc3NhZ2VDb3VudC5XYXJuaW5nKSB7XG5cdFx0XHRcdFx0c01lc3NhZ2VLZXkgPSBcIkNfQ09NTU9OX1NBUEZFX0VSUk9SX01FU1NBR0VTX1BBR0VfV0FSTklOR19UT09MVElQXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIW9NZXNzYWdlQ291bnQuRXJyb3IgJiYgIW9NZXNzYWdlQ291bnQuV2FybmluZyAmJiBvTWVzc2FnZUNvdW50LkluZm9ybWF0aW9uKSB7XG5cdFx0XHRcdFx0c01lc3NhZ2VLZXkgPSBcIkNfTUVTU0FHRV9IQU5ETElOR19TQVBGRV9FUlJPUl9NRVNTQUdFU19QQUdFX1RJVExFX0lORk9cIjtcblx0XHRcdFx0fSBlbHNlIGlmICghb01lc3NhZ2VDb3VudC5FcnJvciAmJiAhb01lc3NhZ2VDb3VudC5XYXJuaW5nICYmICFvTWVzc2FnZUNvdW50LkluZm9ybWF0aW9uICYmIG9NZXNzYWdlQ291bnQuU3VjY2Vzcykge1xuXHRcdFx0XHRcdHNNZXNzYWdlS2V5ID0gXCJDX01FU1NBR0VfSEFORExJTkdfU0FQRkVfRVJST1JfTUVTU0FHRVNfUEFHRV9USVRMRV9TVUNDRVNTXCI7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKHNNZXNzYWdlS2V5KSB7XG5cdFx0XHRcdFx0c01lc3NhZ2VUZXh0ID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoc01lc3NhZ2VLZXkpO1xuXHRcdFx0XHRcdHNUb29sdGlwVGV4dCA9IG9NZXNzYWdlQ291bnQuRXJyb3IgPyBgJHtvTWVzc2FnZUNvdW50LkVycm9yfSAke3NNZXNzYWdlVGV4dH1gIDogc01lc3NhZ2VUZXh0O1xuXHRcdFx0XHRcdHRoaXMuc2V0VG9vbHRpcChzVG9vbHRpcFRleHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuc2V0SWNvbihzSWNvbik7XG5cdFx0XHRcdHRoaXMuc2V0VHlwZShzQnV0dG9uVHlwZSk7XG5cdFx0XHRcdHRoaXMuc2V0VmlzaWJsZSh0cnVlKTtcblx0XHRcdFx0Y29uc3Qgb1ZpZXcgPSBDb3JlLmJ5SWQodGhpcy5zVmlld0lkKSBhcyBWaWV3O1xuXHRcdFx0XHRpZiAob1ZpZXcpIHtcblx0XHRcdFx0XHRjb25zdCBvUGFnZVJlYWR5ID0gKG9WaWV3LmdldENvbnRyb2xsZXIoKSBhcyBQYWdlQ29udHJvbGxlcikucGFnZVJlYWR5O1xuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRhd2FpdCBvUGFnZVJlYWR5LndhaXRQYWdlUmVhZHkoKTtcblx0XHRcdFx0XHRcdGF3YWl0IHRoaXMuX2FwcGx5R3JvdXBpbmdBc3luYyhvVmlldyk7XG5cdFx0XHRcdFx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0XHRcdFx0XHRMb2cuZXJyb3IoXCJmYWlsIGdyb3VwaW5nIG1lc3NhZ2VzXCIpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHQodGhpcyBhcyBhbnkpLmZpcmVNZXNzYWdlQ2hhbmdlKHtcblx0XHRcdFx0XHRcdGlNZXNzYWdlTGVuZ3RoOiBpTWVzc2FnZUxlbmd0aFxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmIChpTWVzc2FnZUxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHR0aGlzLm9NZXNzYWdlUG9wb3Zlci5uYXZpZ2F0ZUJhY2soKTtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dGhpcy5zZXRWaXNpYmxlKGZhbHNlKTtcblx0XHRcdFx0KHRoaXMgYXMgYW55KS5maXJlTWVzc2FnZUNoYW5nZSh7XG5cdFx0XHRcdFx0aU1lc3NhZ2VMZW5ndGg6IGlNZXNzYWdlTGVuZ3RoXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdH0sIDEwMCk7XG5cdH1cblxuXHRfYklzT3JwaGFuRWxlbWVudChvRWxlbWVudDogYW55LCBhRWxlbWVudHM6IGFueVtdKSB7XG5cdFx0cmV0dXJuICFhRWxlbWVudHMuc29tZShcblx0XHRcdGZ1bmN0aW9uIChvT3JwaGFuRWxlbWVudDogYW55LCBvRWxlbTogYW55KSB7XG5cdFx0XHRcdGxldCBvUGFyZW50RWxlbWVudCA9IG9PcnBoYW5FbGVtZW50LmdldFBhcmVudCgpO1xuXHRcdFx0XHR3aGlsZSAob1BhcmVudEVsZW1lbnQgJiYgb1BhcmVudEVsZW1lbnQgIT09IG9FbGVtKSB7XG5cdFx0XHRcdFx0b1BhcmVudEVsZW1lbnQgPSBvUGFyZW50RWxlbWVudC5nZXRQYXJlbnQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gb1BhcmVudEVsZW1lbnQgPyB0cnVlIDogZmFsc2U7XG5cdFx0XHR9LmJpbmQodGhpcywgb0VsZW1lbnQpXG5cdFx0KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRoYXQgaXMgY2FsbGVkIHdoZW4gYSB1c2VyIGNsaWNrcyBvbiB0aGUgdGl0bGUgb2YgdGhlIG1lc3NhZ2UuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfYWN0aXZlVGl0bGVQcmVzc1xuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0gb0V2ZW50IEV2ZW50IG9iamVjdCBwYXNzZWQgZnJvbSB0aGUgaGFuZGxlclxuXHQgKi9cblx0YXN5bmMgX2FjdGl2ZVRpdGxlUHJlc3Mob0V2ZW50OiBDb3JlRXZlbnQpIHtcblx0XHRjb25zdCBvSW50ZXJuYWxNb2RlbENvbnRleHQgPSB0aGlzLmdldEJpbmRpbmdDb250ZXh0KFwicGFnZUludGVybmFsXCIpO1xuXHRcdChvSW50ZXJuYWxNb2RlbENvbnRleHQgYXMgYW55KS5zZXRQcm9wZXJ0eShcImVycm9yTmF2aWdhdGlvblNlY3Rpb25GbGFnXCIsIHRydWUpO1xuXHRcdGNvbnN0IG9JdGVtID0gb0V2ZW50LmdldFBhcmFtZXRlcihcIml0ZW1cIiksXG5cdFx0XHRvTWVzc2FnZSA9IG9JdGVtLmdldEJpbmRpbmdDb250ZXh0KFwibWVzc2FnZVwiKS5nZXRPYmplY3QoKSxcblx0XHRcdGJJc0JhY2tlbmRNZXNzYWdlID0gbmV3IFJlZ0V4cChcIl4vXCIpLnRlc3Qob01lc3NhZ2UuZ2V0VGFyZ2V0KCkpLFxuXHRcdFx0b1ZpZXcgPSBDb3JlLmJ5SWQodGhpcy5zVmlld0lkKSBhcyBWaWV3O1xuXHRcdGxldCBvQ29udHJvbCwgc1NlY3Rpb25UaXRsZTtcblx0XHRjb25zdCBfZGVmYXVsdEZvY3VzID0gZnVuY3Rpb24gKG1lc3NhZ2U6IGFueSwgbWRjVGFibGU6IGFueSkge1xuXHRcdFx0Y29uc3QgZm9jdXNJbmZvID0geyBwcmV2ZW50U2Nyb2xsOiB0cnVlLCB0YXJnZXRJbmZvOiBtZXNzYWdlIH07XG5cdFx0XHRtZGNUYWJsZS5mb2N1cyhmb2N1c0luZm8pO1xuXHRcdH07XG5cblx0XHQvL2NoZWNrIGlmIHRoZSBwcmVzc2VkIGl0ZW0gaXMgcmVsYXRlZCB0byBhIHRhYmxlIGNvbnRyb2xcblx0XHRpZiAob0l0ZW0uZ2V0R3JvdXBOYW1lKCkuaW5kZXhPZihcIlRhYmxlOlwiKSAhPT0gLTEpIHtcblx0XHRcdGxldCBvVGFyZ2V0TWRjVGFibGU6IGFueTtcblx0XHRcdGlmIChiSXNCYWNrZW5kTWVzc2FnZSkge1xuXHRcdFx0XHRvVGFyZ2V0TWRjVGFibGUgPSBvTWVzc2FnZS5jb250cm9sSWRzXG5cdFx0XHRcdFx0Lm1hcChmdW5jdGlvbiAoc0NvbnRyb2xJZDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBjb250cm9sID0gQ29yZS5ieUlkKHNDb250cm9sSWQpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1BhcmVudENvbnRyb2wgPSBjb250cm9sICYmIChjb250cm9sLmdldFBhcmVudCgpIGFzIGFueSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb1BhcmVudENvbnRyb2wgJiZcblx0XHRcdFx0XHRcdFx0b1BhcmVudENvbnRyb2wuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSAmJlxuXHRcdFx0XHRcdFx0XHRvUGFyZW50Q29udHJvbC5nZXRIZWFkZXIoKSA9PT0gb0l0ZW0uZ2V0R3JvdXBOYW1lKCkuc3BsaXQoXCIsIFRhYmxlOiBcIilbMV1cblx0XHRcdFx0XHRcdFx0PyBvUGFyZW50Q29udHJvbFxuXHRcdFx0XHRcdFx0XHQ6IG51bGw7XG5cdFx0XHRcdFx0fSlcblx0XHRcdFx0XHQucmVkdWNlKGZ1bmN0aW9uIChhY2M6IGFueSwgdmFsOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiB2YWwgPyB2YWwgOiBhY2M7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdGlmIChvVGFyZ2V0TWRjVGFibGUpIHtcblx0XHRcdFx0XHRzU2VjdGlvblRpdGxlID0gb0l0ZW0uZ2V0R3JvdXBOYW1lKCkuc3BsaXQoXCIsIFwiKVswXTtcblx0XHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdFx0YXdhaXQgdGhpcy5fbmF2aWdhdGVGcm9tTWVzc2FnZVRvU2VjdGlvblRhYmxlSW5JY29uVGFiQmFyTW9kZShcblx0XHRcdFx0XHRcdFx0b1RhcmdldE1kY1RhYmxlLFxuXHRcdFx0XHRcdFx0XHR0aGlzLm9PYmplY3RQYWdlTGF5b3V0LFxuXHRcdFx0XHRcdFx0XHRzU2VjdGlvblRpdGxlXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0Y29uc3Qgb1JlZkVycm9yQ29udGV4dCA9IHRoaXMuX2dldFRhYmxlUmVmRXJyb3JDb250ZXh0KG9UYXJnZXRNZGNUYWJsZSk7XG5cdFx0XHRcdFx0XHRjb25zdCBvUmVmRXJyb3IgPSBvUmVmRXJyb3JDb250ZXh0LmdldFByb3BlcnR5KG9JdGVtLmdldEJpbmRpbmdDb250ZXh0KFwibWVzc2FnZVwiKS5nZXRPYmplY3QoKS5nZXRJZCgpKTtcblx0XHRcdFx0XHRcdGNvbnN0IF9zZXRGb2N1c09uVGFyZ2V0RmllbGQgPSBhc3luYyAodGFyZ2V0TWRjVGFibGU6IGFueSwgaVJvd0luZGV4OiBudW1iZXIpOiBQcm9taXNlPGFueT4gPT4ge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBhVGFyZ2V0TWRjVGFibGVSb3cgPSB0aGlzLl9nZXRNZGNUYWJsZVJvd3ModGFyZ2V0TWRjVGFibGUpLFxuXHRcdFx0XHRcdFx0XHRcdGlGaXJzdFZpc2libGVSb3cgPSB0aGlzLl9nZXRHcmlkVGFibGUodGFyZ2V0TWRjVGFibGUpLmdldEZpcnN0VmlzaWJsZVJvdygpO1xuXHRcdFx0XHRcdFx0XHRpZiAoYVRhcmdldE1kY1RhYmxlUm93Lmxlbmd0aCA+IDAgJiYgYVRhcmdldE1kY1RhYmxlUm93WzBdKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uc3Qgb1RhcmdldFJvdyA9IGFUYXJnZXRNZGNUYWJsZVJvd1tpUm93SW5kZXggLSBpRmlyc3RWaXNpYmxlUm93XSxcblx0XHRcdFx0XHRcdFx0XHRcdG9UYXJnZXRDZWxsID0gdGhpcy5nZXRUYXJnZXRDZWxsKG9UYXJnZXRSb3csIG9NZXNzYWdlKTtcblx0XHRcdFx0XHRcdFx0XHRpZiAob1RhcmdldENlbGwpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuc2V0Rm9jdXNUb0NvbnRyb2wob1RhcmdldENlbGwpO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0Ly8gY29udHJvbCBub3QgZm91bmQgb24gdGFibGVcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGVycm9yUHJvcGVydHkgPSBvTWVzc2FnZS5nZXRUYXJnZXQoKS5zcGxpdChcIi9cIikucG9wKCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZXJyb3JQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQob1ZpZXcuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWwpLnNldFByb3BlcnR5KFwiL21lc3NhZ2VUYXJnZXRQcm9wZXJ0eVwiLCBlcnJvclByb3BlcnR5KTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLl9uYXZpZ2F0aW9uQ29uZmlndXJlZCh0YXJnZXRNZGNUYWJsZSkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIChvVmlldy5nZXRDb250cm9sbGVyKCkgYXMgUGFnZUNvbnRyb2xsZXIpLl9yb3V0aW5nLm5hdmlnYXRlRm9yd2FyZFRvQ29udGV4dChcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRvVGFyZ2V0Um93LmdldEJpbmRpbmdDb250ZXh0KClcblx0XHRcdFx0XHRcdFx0XHRcdFx0KTtcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRpZiAob1RhcmdldE1kY1RhYmxlLmRhdGEoXCJ0YWJsZVR5cGVcIikgPT09IFwiR3JpZFRhYmxlXCIgJiYgb1JlZkVycm9yLnJvd0luZGV4ICE9PSBcIlwiKSB7XG5cdFx0XHRcdFx0XHRcdGNvbnN0IGlGaXJzdFZpc2libGVSb3cgPSB0aGlzLl9nZXRHcmlkVGFibGUob1RhcmdldE1kY1RhYmxlKS5nZXRGaXJzdFZpc2libGVSb3coKTtcblx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRhd2FpdCBvVGFyZ2V0TWRjVGFibGUuc2Nyb2xsVG9JbmRleChvUmVmRXJyb3Iucm93SW5kZXgpO1xuXHRcdFx0XHRcdFx0XHRcdGNvbnN0IGFUYXJnZXRNZGNUYWJsZVJvdyA9IHRoaXMuX2dldE1kY1RhYmxlUm93cyhvVGFyZ2V0TWRjVGFibGUpO1xuXHRcdFx0XHRcdFx0XHRcdGxldCBpTmV3Rmlyc3RWaXNpYmxlUm93LCBiU2Nyb2xsTmVlZGVkO1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhVGFyZ2V0TWRjVGFibGVSb3cubGVuZ3RoID4gMCAmJiBhVGFyZ2V0TWRjVGFibGVSb3dbMF0pIHtcblx0XHRcdFx0XHRcdFx0XHRcdGlOZXdGaXJzdFZpc2libGVSb3cgPSBhVGFyZ2V0TWRjVGFibGVSb3dbMF0uZ2V0UGFyZW50KCkuZ2V0Rmlyc3RWaXNpYmxlUm93KCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRiU2Nyb2xsTmVlZGVkID0gaUZpcnN0VmlzaWJsZVJvdyAtIGlOZXdGaXJzdFZpc2libGVSb3cgIT09IDA7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGxldCBvV2FpdENvbnRyb2xJZEFkZGVkOiBQcm9taXNlPHZvaWQ+O1xuXHRcdFx0XHRcdFx0XHRcdGlmIChiU2Nyb2xsTmVlZGVkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHQvL1RoZSBzY3JvbGxUb0luZGV4IGZ1bmN0aW9uIGRvZXMgbm90IHdhaXQgZm9yIHRoZSBVSSB1cGRhdGUuIEFzIGEgd29ya2Fyb3VuZCwgcGVuZGluZyBhIGZpeCBmcm9tIE1EQyAoQkNQOiAyMTcwMjUxNjMxKSB3ZSB1c2UgdGhlIGV2ZW50IFwiVUlVcGRhdGVkXCIuXG5cdFx0XHRcdFx0XHRcdFx0XHRvV2FpdENvbnRyb2xJZEFkZGVkID0gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Q29yZS5hdHRhY2hFdmVudChcIlVJVXBkYXRlZFwiLCByZXNvbHZlKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRvV2FpdENvbnRyb2xJZEFkZGVkID0gUHJvbWlzZS5yZXNvbHZlKCk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdGF3YWl0IG9XYWl0Q29udHJvbElkQWRkZWQ7XG5cdFx0XHRcdFx0XHRcdFx0c2V0VGltZW91dChhc3luYyBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBmb2N1c09uVGFyZ2V0RmllbGQgPSBhd2FpdCBfc2V0Rm9jdXNPblRhcmdldEZpZWxkKG9UYXJnZXRNZGNUYWJsZSwgb1JlZkVycm9yLnJvd0luZGV4KTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChmb2N1c09uVGFyZ2V0RmllbGQgPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdF9kZWZhdWx0Rm9jdXMob01lc3NhZ2UsIG9UYXJnZXRNZGNUYWJsZSk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSwgMCk7XG5cdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKGVycikge1xuXHRcdFx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkVycm9yIHdoaWxlIGZvY3VzaW5nIG9uIGVycm9yXCIpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKG9UYXJnZXRNZGNUYWJsZS5kYXRhKFwidGFibGVUeXBlXCIpID09PSBcIlJlc3BvbnNpdmVUYWJsZVwiICYmIG9SZWZFcnJvcikge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBmb2N1c09uTWVzc2FnZVRhcmdldENvbnRyb2wgPSBhd2FpdCB0aGlzLmZvY3VzT25NZXNzYWdlVGFyZ2V0Q29udHJvbChcblx0XHRcdFx0XHRcdFx0XHRvVmlldyxcblx0XHRcdFx0XHRcdFx0XHRvTWVzc2FnZSxcblx0XHRcdFx0XHRcdFx0XHRvVGFyZ2V0TWRjVGFibGUsXG5cdFx0XHRcdFx0XHRcdFx0b1JlZkVycm9yLnJvd0luZGV4XG5cdFx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0XHRcdGlmIChmb2N1c09uTWVzc2FnZVRhcmdldENvbnRyb2wgPT09IGZhbHNlKSB7XG5cdFx0XHRcdFx0XHRcdFx0X2RlZmF1bHRGb2N1cyhvTWVzc2FnZSwgb1RhcmdldE1kY1RhYmxlKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5mb2N1c09uTWVzc2FnZVRhcmdldENvbnRyb2wob1ZpZXcsIG9NZXNzYWdlKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGNhdGNoIChlcnIpIHtcblx0XHRcdFx0XHRcdExvZy5lcnJvcihcIkZhaWwgdG8gbmF2aWdhdGUgdG8gRXJyb3IgY29udHJvbFwiKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9Db250cm9sID0gQ29yZS5ieUlkKG9NZXNzYWdlLmNvbnRyb2xJZHNbMF0pO1xuXHRcdFx0XHQvL0lmIHRoZSBjb250cm9sIHVuZGVybHlpbmcgdGhlIGZyb250RW5kIG1lc3NhZ2UgaXMgbm90IHdpdGhpbiB0aGUgY3VycmVudCBzZWN0aW9uLCB3ZSBmaXJzdCBnbyBpbnRvIHRoZSB0YXJnZXQgc2VjdGlvbjpcblx0XHRcdFx0Y29uc3Qgb1NlbGVjdGVkU2VjdGlvbjogYW55ID0gQ29yZS5ieUlkKHRoaXMub09iamVjdFBhZ2VMYXlvdXQuZ2V0U2VsZWN0ZWRTZWN0aW9uKCkpO1xuXHRcdFx0XHRpZiAob1NlbGVjdGVkU2VjdGlvbj8uZmluZEVsZW1lbnRzKHRydWUpLmluZGV4T2Yob0NvbnRyb2wpID09PSAtMSkge1xuXHRcdFx0XHRcdHNTZWN0aW9uVGl0bGUgPSBvSXRlbS5nZXRHcm91cE5hbWUoKS5zcGxpdChcIiwgXCIpWzBdO1xuXHRcdFx0XHRcdHRoaXMuX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25Jbkljb25UYWJCYXJNb2RlKHRoaXMub09iamVjdFBhZ2VMYXlvdXQsIHNTZWN0aW9uVGl0bGUpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHRoaXMuc2V0Rm9jdXNUb0NvbnRyb2wob0NvbnRyb2wpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBmb2N1cyBvbiBjb250cm9sXG5cdFx0XHRzU2VjdGlvblRpdGxlID0gb0l0ZW0uZ2V0R3JvdXBOYW1lKCkuc3BsaXQoXCIsIFwiKVswXTtcblx0XHRcdHRoaXMuX25hdmlnYXRlRnJvbU1lc3NhZ2VUb1NlY3Rpb25Jbkljb25UYWJCYXJNb2RlKHRoaXMub09iamVjdFBhZ2VMYXlvdXQsIHNTZWN0aW9uVGl0bGUpO1xuXHRcdFx0dGhpcy5mb2N1c09uTWVzc2FnZVRhcmdldENvbnRyb2wob1ZpZXcsIG9NZXNzYWdlKTtcblx0XHR9XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIGEgdGFibGUgY2VsbCB0YXJnZXRlZCBieSBhIG1lc3NhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXRSb3cgQSB0YWJsZSByb3dcblx0ICogQHBhcmFtIHtPYmplY3R9IG1lc3NhZ2UgTWVzc2FnZSB0YXJnZXRpbmcgYSBjZWxsXG5cdCAqIEByZXR1cm5zIHtPYmplY3R9IFJldHVybnMgdGhlIGNlbGxcblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldFRhcmdldENlbGwodGFyZ2V0Um93OiBDb2x1bW5MaXN0SXRlbSwgbWVzc2FnZTogTWVzc2FnZSk6IFVJNUVsZW1lbnQgfCBudWxsIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gbWVzc2FnZS5nZXRDb250cm9sSWRzKCkubGVuZ3RoID4gMFxuXHRcdFx0PyBtZXNzYWdlXG5cdFx0XHRcdFx0LmdldENvbnRyb2xJZHMoKVxuXHRcdFx0XHRcdC5tYXAoZnVuY3Rpb24gKGNvbnRyb2xJZDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBpc0NvbnRyb2xJblRhYmxlID0gKHRhcmdldFJvdyBhcyBhbnkpLmZpbmRFbGVtZW50cyh0cnVlLCBmdW5jdGlvbiAoZWxlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBlbGVtLmdldElkKCkgPT09IGNvbnRyb2xJZDtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0cmV0dXJuIGlzQ29udHJvbEluVGFibGUubGVuZ3RoID4gMCA/IENvcmUuYnlJZChjb250cm9sSWQpIDogbnVsbDtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5yZWR1Y2UoZnVuY3Rpb24gKGFjYzogYW55LCB2YWw6IGFueSkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIHZhbCA/IHZhbCA6IGFjYztcblx0XHRcdFx0XHR9KVxuXHRcdFx0OiBudWxsO1xuXHR9XG5cblx0LyoqXG5cdCAqIEZvY3VzIG9uIHRoZSBjb250cm9sIHRhcmdldGVkIGJ5IGEgbWVzc2FnZS5cblx0ICpcblx0ICogQHBhcmFtIHtPYmplY3R9IHZpZXcgVGhlIGN1cnJlbnQgdmlld1xuXHQgKiBAcGFyYW0ge09iamVjdH0gbWVzc2FnZSBUaGUgbWVzc2FnZSB0YXJnZXRpbmcgdGhlIGNvbnRyb2wgb24gd2hpY2ggd2Ugd2FudCB0byBzZXQgdGhlIGZvY3VzXG5cdCAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXRNZGNUYWJsZSBUaGUgdGFibGUgdGFyZ2V0ZWQgYnkgdGhlIG1lc3NhZ2UgKG9wdGlvbmFsKVxuXHQgKiBAcGFyYW0ge251bWJlcn0gcm93SW5kZXggVGhlIHJvdyBpbmRleCBvZiB0aGUgdGFibGUgdGFyZ2V0ZWQgYnkgdGhlIG1lc3NhZ2UgKG9wdGlvbmFsKVxuXHQgKiBAcmV0dXJucyB7UHJvbWlzZX0gUHJvbWlzZVxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0YXN5bmMgZm9jdXNPbk1lc3NhZ2VUYXJnZXRDb250cm9sKHZpZXc6IFZpZXcsIG1lc3NhZ2U6IE1lc3NhZ2UsIHRhcmdldE1kY1RhYmxlPzogYW55LCByb3dJbmRleD86IG51bWJlcik6IFByb21pc2U8YW55PiB7XG5cdFx0Y29uc3QgYUFsbFZpZXdFbGVtZW50cyA9IHZpZXcuZmluZEVsZW1lbnRzKHRydWUpO1xuXHRcdGNvbnN0IGFFcnJvbmVvdXNDb250cm9scyA9IG1lc3NhZ2Vcblx0XHRcdC5nZXRDb250cm9sSWRzKClcblx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKHNDb250cm9sSWQ6IHN0cmluZykge1xuXHRcdFx0XHRyZXR1cm4gYUFsbFZpZXdFbGVtZW50cy5zb21lKGZ1bmN0aW9uIChvRWxlbSkge1xuXHRcdFx0XHRcdHJldHVybiBvRWxlbS5nZXRJZCgpID09PSBzQ29udHJvbElkICYmIG9FbGVtLmdldERvbVJlZigpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0pXG5cdFx0XHQubWFwKGZ1bmN0aW9uIChzQ29udHJvbElkOiBzdHJpbmcpIHtcblx0XHRcdFx0cmV0dXJuIENvcmUuYnlJZChzQ29udHJvbElkKTtcblx0XHRcdH0pO1xuXHRcdGNvbnN0IGFOb3RUYWJsZUVycm9uZW91c0NvbnRyb2xzID0gYUVycm9uZW91c0NvbnRyb2xzLmZpbHRlcihmdW5jdGlvbiAob0VsZW06IGFueSkge1xuXHRcdFx0cmV0dXJuICFvRWxlbS5pc0EoXCJzYXAubS5UYWJsZVwiKSAmJiAhb0VsZW0uaXNBKFwic2FwLnVpLnRhYmxlLlRhYmxlXCIpO1xuXHRcdH0pO1xuXHRcdC8vVGhlIGZvY3VzIGlzIHNldCBvbiBOb3QgVGFibGUgY29udHJvbCBpbiBwcmlvcml0eVxuXHRcdGlmIChhTm90VGFibGVFcnJvbmVvdXNDb250cm9scy5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aGlzLnNldEZvY3VzVG9Db250cm9sKGFOb3RUYWJsZUVycm9uZW91c0NvbnRyb2xzWzBdKTtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fSBlbHNlIGlmIChhRXJyb25lb3VzQ29udHJvbHMubGVuZ3RoID4gMCkge1xuXHRcdFx0Y29uc3QgYVRhcmdldE1kY1RhYmxlUm93ID0gdGFyZ2V0TWRjVGFibGVcblx0XHRcdFx0PyB0YXJnZXRNZGNUYWJsZS5maW5kRWxlbWVudHModHJ1ZSwgZnVuY3Rpb24gKG9FbGVtOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvRWxlbS5pc0EoQ29sdW1uTGlzdEl0ZW0uZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCkpO1xuXHRcdFx0XHQgIH0pXG5cdFx0XHRcdDogW107XG5cdFx0XHRpZiAoYVRhcmdldE1kY1RhYmxlUm93Lmxlbmd0aCA+IDAgJiYgYVRhcmdldE1kY1RhYmxlUm93WzBdKSB7XG5cdFx0XHRcdGNvbnN0IG9UYXJnZXRSb3cgPSBhVGFyZ2V0TWRjVGFibGVSb3dbcm93SW5kZXggYXMgbnVtYmVyXTtcblx0XHRcdFx0Y29uc3Qgb1RhcmdldENlbGwgPSB0aGlzLmdldFRhcmdldENlbGwob1RhcmdldFJvdywgbWVzc2FnZSkgYXMgYW55O1xuXHRcdFx0XHRpZiAob1RhcmdldENlbGwpIHtcblx0XHRcdFx0XHRjb25zdCBvVGFyZ2V0RmllbGQgPSBvVGFyZ2V0Q2VsbC5pc0EoXCJzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkQVBJXCIpXG5cdFx0XHRcdFx0XHQ/IG9UYXJnZXRDZWxsLmdldENvbnRlbnQoKS5nZXRDb250ZW50RWRpdCgpWzBdXG5cdFx0XHRcdFx0XHQ6IG9UYXJnZXRDZWxsLmdldEl0ZW1zKClbMF0uZ2V0Q29udGVudCgpLmdldENvbnRlbnRFZGl0KClbMF07XG5cdFx0XHRcdFx0dGhpcy5zZXRGb2N1c1RvQ29udHJvbChvVGFyZ2V0RmllbGQpO1xuXHRcdFx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0Y29uc3QgZXJyb3JQcm9wZXJ0eSA9IG1lc3NhZ2UuZ2V0VGFyZ2V0KCkuc3BsaXQoXCIvXCIpLnBvcCgpO1xuXHRcdFx0XHRcdGlmIChlcnJvclByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHQodmlldy5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbCkuc2V0UHJvcGVydHkoXCIvbWVzc2FnZVRhcmdldFByb3BlcnR5XCIsIGVycm9yUHJvcGVydHkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAodGhpcy5fbmF2aWdhdGlvbkNvbmZpZ3VyZWQodGFyZ2V0TWRjVGFibGUpKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gKHZpZXcuZ2V0Q29udHJvbGxlcigpIGFzIFBhZ2VDb250cm9sbGVyKS5fcm91dGluZy5uYXZpZ2F0ZUZvcndhcmRUb0NvbnRleHQob1RhcmdldFJvdy5nZXRCaW5kaW5nQ29udGV4dCgpKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdF9nZXRUYWJsZUNvbEluZm8ob1RhYmxlOiBhbnksIHNUYWJsZVRhcmdldENvbFByb3BlcnR5OiBzdHJpbmcpIHtcblx0XHRsZXQgc1RhYmxlVGFyZ2V0Q29sTmFtZTtcblx0XHRsZXQgb1RhYmxlVGFyZ2V0Q29sID0gb1RhYmxlLmdldENvbHVtbnMoKS5maW5kKFxuXHRcdFx0ZnVuY3Rpb24gKHRhZ2V0Q29sdW1uUHJvcGVydHk6IGFueSwgY29sdW1uOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIGNvbHVtbi5nZXREYXRhUHJvcGVydHkoKSA9PT0gdGFnZXRDb2x1bW5Qcm9wZXJ0eTtcblx0XHRcdH0uYmluZCh0aGlzLCBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSlcblx0XHQpO1xuXHRcdGlmICghb1RhYmxlVGFyZ2V0Q29sKSB7XG5cdFx0XHQvKiBJZiB0aGUgdGFyZ2V0IGNvbHVtbiBpcyBub3QgZm91bmQsIHdlIGNoZWNrIGZvciBhIGN1c3RvbSBjb2x1bW4gKi9cblx0XHRcdGNvbnN0IG9DdXN0b21Db2x1bW4gPSBvVGFibGVcblx0XHRcdFx0LmdldENvbnRyb2xEZWxlZ2F0ZSgpXG5cdFx0XHRcdC5nZXRDb2x1bW5zRm9yKG9UYWJsZSlcblx0XHRcdFx0LmZpbmQoZnVuY3Rpb24gKG9Db2x1bW46IGFueSkge1xuXHRcdFx0XHRcdGlmICghIW9Db2x1bW4udGVtcGxhdGUgJiYgb0NvbHVtbi5wcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHRcdFx0XHRvQ29sdW1uLnByb3BlcnR5SW5mb3NbMF0gPT09IHNUYWJsZVRhcmdldENvbFByb3BlcnR5IHx8XG5cdFx0XHRcdFx0XHRcdG9Db2x1bW4ucHJvcGVydHlJbmZvc1swXS5yZXBsYWNlKFwiUHJvcGVydHk6OlwiLCBcIlwiKSA9PT0gc1RhYmxlVGFyZ2V0Q29sUHJvcGVydHlcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0aWYgKG9DdXN0b21Db2x1bW4pIHtcblx0XHRcdFx0b1RhYmxlVGFyZ2V0Q29sID0gb0N1c3RvbUNvbHVtbjtcblx0XHRcdFx0c1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPSBvVGFibGVUYXJnZXRDb2wubmFtZTtcblxuXHRcdFx0XHRzVGFibGVUYXJnZXRDb2xOYW1lID0gb1RhYmxlXG5cdFx0XHRcdFx0LmdldENvbHVtbnMoKVxuXHRcdFx0XHRcdC5maW5kKGZ1bmN0aW9uIChvQ29sdW1uOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSA9PT0gb0NvbHVtbi5nZXREYXRhUHJvcGVydHkoKTtcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHRcdC5nZXRIZWFkZXIoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdC8qIElmIHRoZSB0YXJnZXQgY29sdW1uIGlzIG5vdCBmb3VuZCwgd2UgY2hlY2sgZm9yIGEgZmllbGQgZ3JvdXAgKi9cblx0XHRcdFx0Y29uc3QgYUNvbHVtbnMgPSBvVGFibGUuZ2V0Q29udHJvbERlbGVnYXRlKCkuZ2V0Q29sdW1uc0ZvcihvVGFibGUpO1xuXHRcdFx0XHRvVGFibGVUYXJnZXRDb2wgPSBhQ29sdW1ucy5maW5kKFxuXHRcdFx0XHRcdGZ1bmN0aW9uIChhVGFibGVDb2x1bW5zOiBhbnlbXSwgdGFyZ2V0Q29sdW1uUHJvcGVydHk6IHN0cmluZywgb0NvbHVtbjogYW55KSB7XG5cdFx0XHRcdFx0XHRpZiAob0NvbHVtbi5rZXkuaW5kZXhPZihcIjo6RmllbGRHcm91cDo6XCIpICE9PSAtMSkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gb0NvbHVtbi5wcm9wZXJ0eUluZm9zLmZpbmQoZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBhVGFibGVDb2x1bW5zLmZpbmQoZnVuY3Rpb24gKHRhYmxlQ29sdW1uKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdGFibGVDb2x1bW4ucmVsYXRpdmVQYXRoID09PSB0YXJnZXRDb2x1bW5Qcm9wZXJ0eTtcblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fS5iaW5kKHRoaXMsIGFDb2x1bW5zLCBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSlcblx0XHRcdFx0KTtcblx0XHRcdFx0LyogY2hlY2sgaWYgdGhlIGNvbHVtbiB3aXRoIHRoZSBmaWVsZCBncm91cCBpcyB2aXNpYmxlIGluIHRoZSB0YWJsZTogKi9cblx0XHRcdFx0bGV0IGJJc1RhYmxlVGFyZ2V0Q29sVmlzaWJsZSA9IGZhbHNlO1xuXHRcdFx0XHRpZiAob1RhYmxlVGFyZ2V0Q29sICYmIG9UYWJsZVRhcmdldENvbC5sYWJlbCkge1xuXHRcdFx0XHRcdGJJc1RhYmxlVGFyZ2V0Q29sVmlzaWJsZSA9IG9UYWJsZS5nZXRDb2x1bW5zKCkuc29tZShmdW5jdGlvbiAoY29sdW1uOiBhbnkpIHtcblx0XHRcdFx0XHRcdHJldHVybiBjb2x1bW4uZ2V0SGVhZGVyKCkgPT09IG9UYWJsZVRhcmdldENvbC5sYWJlbDtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRzVGFibGVUYXJnZXRDb2xOYW1lID0gYklzVGFibGVUYXJnZXRDb2xWaXNpYmxlICYmIG9UYWJsZVRhcmdldENvbC5sYWJlbDtcblx0XHRcdFx0c1RhYmxlVGFyZ2V0Q29sUHJvcGVydHkgPSBiSXNUYWJsZVRhcmdldENvbFZpc2libGUgJiYgb1RhYmxlVGFyZ2V0Q29sLmtleTtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0c1RhYmxlVGFyZ2V0Q29sTmFtZSA9IG9UYWJsZVRhcmdldENvbCAmJiBvVGFibGVUYXJnZXRDb2wuZ2V0SGVhZGVyKCk7XG5cdFx0fVxuXHRcdHJldHVybiB7IHNUYWJsZVRhcmdldENvbE5hbWU6IHNUYWJsZVRhcmdldENvbE5hbWUsIHNUYWJsZVRhcmdldENvbFByb3BlcnR5OiBzVGFibGVUYXJnZXRDb2xQcm9wZXJ0eSB9O1xuXHR9XG5cblx0LyoqXG5cdCAqXG5cdCAqIEBwYXJhbSBvYmogVGhlIG1lc3NhZ2Ugb2JqZWN0XG5cdCAqIEBwYXJhbSBhU2VjdGlvbnMgVGhlIGFycmF5IG9mIHNlY3Rpb25zIGluIHRoZSBvYmplY3QgcGFnZVxuXHQgKiBAcmV0dXJucyBUaGUgcmFuayBvZiB0aGUgbWVzc2FnZVxuXHQgKi9cblx0X2dldE1lc3NhZ2VSYW5rKG9iajogYW55LCBhU2VjdGlvbnM6IGFueVtdKSB7XG5cdFx0aWYgKGFTZWN0aW9ucykge1xuXHRcdFx0bGV0IHNlY3Rpb24sIGFTdWJTZWN0aW9ucywgc3ViU2VjdGlvbiwgaiwgaywgYUVsZW1lbnRzLCBhQWxsRWxlbWVudHMsIHNlY3Rpb25SYW5rO1xuXHRcdFx0Zm9yIChqID0gYVNlY3Rpb25zLmxlbmd0aCAtIDE7IGogPj0gMDsgLS1qKSB7XG5cdFx0XHRcdC8vIExvb3Agb3ZlciBhbGwgc2VjdGlvbnNcblx0XHRcdFx0c2VjdGlvbiA9IGFTZWN0aW9uc1tqXTtcblx0XHRcdFx0YVN1YlNlY3Rpb25zID0gc2VjdGlvbi5nZXRTdWJTZWN0aW9ucygpO1xuXHRcdFx0XHRmb3IgKGsgPSBhU3ViU2VjdGlvbnMubGVuZ3RoIC0gMTsgayA+PSAwOyAtLWspIHtcblx0XHRcdFx0XHQvLyBMb29wIG92ZXIgYWxsIHN1Yi1zZWN0aW9uc1xuXHRcdFx0XHRcdHN1YlNlY3Rpb24gPSBhU3ViU2VjdGlvbnNba107XG5cdFx0XHRcdFx0YUFsbEVsZW1lbnRzID0gc3ViU2VjdGlvbi5maW5kRWxlbWVudHModHJ1ZSk7IC8vIEdldCBhbGwgZWxlbWVudHMgaW5zaWRlIGEgc3ViLXNlY3Rpb25cblx0XHRcdFx0XHQvL1RyeSB0byBmaW5kIHRoZSBjb250cm9sIDEgaW5zaWRlIHRoZSBzdWIgc2VjdGlvblxuXHRcdFx0XHRcdGFFbGVtZW50cyA9IGFBbGxFbGVtZW50cy5maWx0ZXIodGhpcy5fZm5GaWx0ZXJVcG9uSWQuYmluZCh0aGlzLCBvYmouZ2V0Q29udHJvbElkKCkpKTtcblx0XHRcdFx0XHRzZWN0aW9uUmFuayA9IGogKyAxO1xuXHRcdFx0XHRcdGlmIChhRWxlbWVudHMubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0b2JqLnNlY3Rpb25OYW1lID0gc2VjdGlvbi5nZXRUaXRsZSgpO1xuXHRcdFx0XHRcdFx0b2JqLnN1YlNlY3Rpb25OYW1lID0gc3ViU2VjdGlvbi5nZXRUaXRsZSgpO1xuXHRcdFx0XHRcdFx0cmV0dXJuIHNlY3Rpb25SYW5rICogMTAgKyAoayArIDEpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly9pZiBzdWIgc2VjdGlvbiB0aXRsZSBpcyBPdGhlciBtZXNzYWdlcywgd2UgcmV0dXJuIGEgaGlnaCBudW1iZXIocmFuayksIHdoaWNoIGVuc3VyZXNcblx0XHRcdC8vdGhhdCBtZXNzYWdlcyBiZWxvbmdpbmcgdG8gdGhpcyBzdWIgc2VjdGlvbiBhbHdheXMgY29tZSBsYXRlciBpbiBtZXNzYWdlUG9wb3ZlclxuXHRcdFx0aWYgKCFvYmouc2VjdGlvbk5hbWUgJiYgIW9iai5zdWJTZWN0aW9uTmFtZSAmJiBvYmoucGVyc2lzdGVudCkge1xuXHRcdFx0XHRyZXR1cm4gMTtcblx0XHRcdH1cblx0XHRcdHJldHVybiA5OTk7XG5cdFx0fVxuXHRcdHJldHVybiA5OTk7XG5cdH1cblxuXHQvKipcblx0ICogTWV0aG9kIHRvIHNldCB0aGUgZmlsdGVycyBiYXNlZCB1cG9uIHRoZSBtZXNzYWdlIGl0ZW1zXG5cdCAqIFRoZSBkZXNpcmVkIGZpbHRlciBvcGVyYXRpb24gaXM6XG5cdCAqICggZmlsdGVycyBwcm92aWRlZCBieSB1c2VyICYmICggdmFsaWRhdGlvbiA9IHRydWUgJiYgQ29udHJvbCBzaG91bGQgYmUgcHJlc2VudCBpbiB2aWV3ICkgfHwgbWVzc2FnZXMgZm9yIHRoZSBjdXJyZW50IG1hdGNoaW5nIGNvbnRleHQgKS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9hcHBseUZpbHRlcnNBbmRTb3J0KCkge1xuXHRcdGxldCBvVmFsaWRhdGlvbkZpbHRlcnMsXG5cdFx0XHRvVmFsaWRhdGlvbkFuZENvbnRleHRGaWx0ZXIsXG5cdFx0XHRvRmlsdGVycyxcblx0XHRcdHNQYXRoLFxuXHRcdFx0b1NvcnRlcixcblx0XHRcdG9EaWFsb2dGaWx0ZXIsXG5cdFx0XHRvYmplY3RQYWdlTGF5b3V0U2VjdGlvbnM6IGFueSA9IG51bGw7XG5cdFx0Y29uc3QgYVVzZXJEZWZpbmVkRmlsdGVyOiBhbnlbXSA9IFtdO1xuXHRcdGNvbnN0IGZpbHRlck91dE1lc3NhZ2VzSW5EaWFsb2cgPSAoKSA9PiB7XG5cdFx0XHRjb25zdCBmblRlc3QgPSAoYUNvbnRyb2xJZHM6IHN0cmluZ1tdKSA9PiB7XG5cdFx0XHRcdGxldCBpbmRleCA9IEluZmluaXR5LFxuXHRcdFx0XHRcdG9Db250cm9sID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKSBhcyBhbnk7XG5cdFx0XHRcdGNvbnN0IGVycm9yRmllbGRDb250cm9sID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKTtcblx0XHRcdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0Y29uc3QgZmllbGRSYW5raW5EaWFsb2cgPVxuXHRcdFx0XHRcdFx0b0NvbnRyb2wgaW5zdGFuY2VvZiBEaWFsb2dcblx0XHRcdFx0XHRcdFx0PyAoZXJyb3JGaWVsZENvbnRyb2w/LmdldFBhcmVudCgpIGFzIGFueSkuZmluZEVsZW1lbnRzKHRydWUpLmluZGV4T2YoZXJyb3JGaWVsZENvbnRyb2wpXG5cdFx0XHRcdFx0XHRcdDogSW5maW5pdHk7XG5cdFx0XHRcdFx0aWYgKG9Db250cm9sIGluc3RhbmNlb2YgRGlhbG9nKSB7XG5cdFx0XHRcdFx0XHRpZiAoaW5kZXggPiBmaWVsZFJhbmtpbkRpYWxvZykge1xuXHRcdFx0XHRcdFx0XHRpbmRleCA9IGZpZWxkUmFua2luRGlhbG9nO1xuXHRcdFx0XHRcdFx0XHQvLyBTZXQgdGhlIGZvY3VzIHRvIHRoZSBkaWFsb2cncyBjb250cm9sXG5cdFx0XHRcdFx0XHRcdHRoaXMuc2V0Rm9jdXNUb0NvbnRyb2woZXJyb3JGaWVsZENvbnRyb2wpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8gbWVzc2FnZXMgZm9yIHNhcC5tLkRpYWxvZyBzaG91bGQgbm90IGFwcGVhciBpbiB0aGUgbWVzc2FnZSBidXR0b25cblx0XHRcdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0b0NvbnRyb2wgPSBvQ29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH07XG5cdFx0XHRyZXR1cm4gbmV3IEZpbHRlcih7XG5cdFx0XHRcdHBhdGg6IFwiY29udHJvbElkc1wiLFxuXHRcdFx0XHR0ZXN0OiBmblRlc3QsXG5cdFx0XHRcdGNhc2VTZW5zaXRpdmU6IHRydWVcblx0XHRcdH0pO1xuXHRcdH07XG5cdFx0Ly9GaWx0ZXIgZnVuY3Rpb24gdG8gdmVyaWZ5IGlmIHRoZSBjb250cm9sIGlzIHBhcnQgb2YgdGhlIGN1cnJlbnQgdmlldyBvciBub3Rcblx0XHRmdW5jdGlvbiBnZXRDaGVja0NvbnRyb2xJblZpZXdGaWx0ZXIoKSB7XG5cdFx0XHRjb25zdCBmblRlc3QgPSBmdW5jdGlvbiAoYUNvbnRyb2xJZHM6IHN0cmluZ1tdKSB7XG5cdFx0XHRcdGlmICghYUNvbnRyb2xJZHMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGxldCBvQ29udHJvbDogYW55ID0gQ29yZS5ieUlkKGFDb250cm9sSWRzWzBdKTtcblx0XHRcdFx0d2hpbGUgKG9Db250cm9sKSB7XG5cdFx0XHRcdFx0aWYgKG9Db250cm9sLmdldElkKCkgPT09IHNWaWV3SWQpIHtcblx0XHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRpZiAob0NvbnRyb2wgaW5zdGFuY2VvZiBEaWFsb2cpIHtcblx0XHRcdFx0XHRcdC8vIG1lc3NhZ2VzIGZvciBzYXAubS5EaWFsb2cgc2hvdWxkIG5vdCBhcHBlYXIgaW4gdGhlIG1lc3NhZ2UgYnV0dG9uXG5cdFx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG9Db250cm9sID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiBuZXcgRmlsdGVyKHtcblx0XHRcdFx0cGF0aDogXCJjb250cm9sSWRzXCIsXG5cdFx0XHRcdHRlc3Q6IGZuVGVzdCxcblx0XHRcdFx0Y2FzZVNlbnNpdGl2ZTogdHJ1ZVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGlmICghdGhpcy5zVmlld0lkKSB7XG5cdFx0XHR0aGlzLnNWaWV3SWQgPSB0aGlzLl9nZXRWaWV3SWQodGhpcy5nZXRJZCgpKSBhcyBzdHJpbmc7XG5cdFx0fVxuXHRcdGNvbnN0IHNWaWV3SWQgPSB0aGlzLnNWaWV3SWQ7XG5cdFx0Ly9BZGQgdGhlIGZpbHRlcnMgcHJvdmlkZWQgYnkgdGhlIHVzZXJcblx0XHRjb25zdCBhQ3VzdG9tRmlsdGVycyA9IHRoaXMuZ2V0QWdncmVnYXRpb24oXCJjdXN0b21GaWx0ZXJzXCIpIGFzIGFueTtcblx0XHRpZiAoYUN1c3RvbUZpbHRlcnMpIHtcblx0XHRcdGFDdXN0b21GaWx0ZXJzLmZvckVhY2goZnVuY3Rpb24gKGZpbHRlcjogYW55KSB7XG5cdFx0XHRcdGFVc2VyRGVmaW5lZEZpbHRlci5wdXNoKFxuXHRcdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0cGF0aDogZmlsdGVyLmdldFByb3BlcnR5KFwicGF0aFwiKSxcblx0XHRcdFx0XHRcdG9wZXJhdG9yOiBmaWx0ZXIuZ2V0UHJvcGVydHkoXCJvcGVyYXRvclwiKSxcblx0XHRcdFx0XHRcdHZhbHVlMTogZmlsdGVyLmdldFByb3BlcnR5KFwidmFsdWUxXCIpLFxuXHRcdFx0XHRcdFx0dmFsdWUyOiBmaWx0ZXIuZ2V0UHJvcGVydHkoXCJ2YWx1ZTJcIilcblx0XHRcdFx0XHR9KVxuXHRcdFx0XHQpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9CaW5kaW5nQ29udGV4dCA9IHRoaXMuZ2V0QmluZGluZ0NvbnRleHQoKTtcblx0XHRpZiAoIW9CaW5kaW5nQ29udGV4dCkge1xuXHRcdFx0dGhpcy5zZXRWaXNpYmxlKGZhbHNlKTtcblx0XHRcdHJldHVybjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0c1BhdGggPSBvQmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpO1xuXHRcdFx0Ly9GaWx0ZXIgZm9yIGZpbHRlcmluZyBvdXQgb25seSB2YWxpZGF0aW9uIG1lc3NhZ2VzIHdoaWNoIGFyZSBjdXJyZW50bHkgcHJlc2VudCBpbiB0aGUgdmlld1xuXHRcdFx0b1ZhbGlkYXRpb25GaWx0ZXJzID0gbmV3IEZpbHRlcih7XG5cdFx0XHRcdGZpbHRlcnM6IFtcblx0XHRcdFx0XHRuZXcgRmlsdGVyKHtcblx0XHRcdFx0XHRcdHBhdGg6IFwidmFsaWRhdGlvblwiLFxuXHRcdFx0XHRcdFx0b3BlcmF0b3I6IEZpbHRlck9wZXJhdG9yLkVRLFxuXHRcdFx0XHRcdFx0dmFsdWUxOiB0cnVlXG5cdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0Z2V0Q2hlY2tDb250cm9sSW5WaWV3RmlsdGVyKClcblx0XHRcdFx0XSxcblx0XHRcdFx0YW5kOiB0cnVlXG5cdFx0XHR9KTtcblx0XHRcdC8vRmlsdGVyIGZvciBmaWx0ZXJpbmcgb3V0IHRoZSBib3VuZCBtZXNzYWdlcyBpLmUgdGFyZ2V0IHN0YXJ0cyB3aXRoIHRoZSBjb250ZXh0IHBhdGhcblx0XHRcdG9WYWxpZGF0aW9uQW5kQ29udGV4dEZpbHRlciA9IG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRmaWx0ZXJzOiBbXG5cdFx0XHRcdFx0b1ZhbGlkYXRpb25GaWx0ZXJzLFxuXHRcdFx0XHRcdG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRcdFx0cGF0aDogXCJ0YXJnZXRcIixcblx0XHRcdFx0XHRcdG9wZXJhdG9yOiBGaWx0ZXJPcGVyYXRvci5TdGFydHNXaXRoLFxuXHRcdFx0XHRcdFx0dmFsdWUxOiBzUGF0aFxuXHRcdFx0XHRcdH0pXG5cdFx0XHRcdF0sXG5cdFx0XHRcdGFuZDogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdFx0b0RpYWxvZ0ZpbHRlciA9IG5ldyBGaWx0ZXIoe1xuXHRcdFx0XHRmaWx0ZXJzOiBbZmlsdGVyT3V0TWVzc2FnZXNJbkRpYWxvZygpXVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9WYWxpZGF0aW9uQ29udGV4dERpYWxvZ0ZpbHRlcnMgPSBuZXcgRmlsdGVyKHtcblx0XHRcdGZpbHRlcnM6IFtvVmFsaWRhdGlvbkFuZENvbnRleHRGaWx0ZXIsIG9EaWFsb2dGaWx0ZXJdLFxuXHRcdFx0YW5kOiB0cnVlXG5cdFx0fSk7XG5cdFx0Ly8gYW5kIGZpbmFsbHkgLSBpZiB0aGVyZSBhbnkgLSBhZGQgY3VzdG9tIGZpbHRlciAodmlhIE9SKVxuXHRcdGlmIChhVXNlckRlZmluZWRGaWx0ZXIubGVuZ3RoID4gMCkge1xuXHRcdFx0b0ZpbHRlcnMgPSBuZXcgKEZpbHRlciBhcyBhbnkpKHtcblx0XHRcdFx0ZmlsdGVyczogW2FVc2VyRGVmaW5lZEZpbHRlciwgb1ZhbGlkYXRpb25Db250ZXh0RGlhbG9nRmlsdGVyc10sXG5cdFx0XHRcdGFuZDogZmFsc2Vcblx0XHRcdH0pO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvRmlsdGVycyA9IG9WYWxpZGF0aW9uQ29udGV4dERpYWxvZ0ZpbHRlcnM7XG5cdFx0fVxuXHRcdHRoaXMub0l0ZW1CaW5kaW5nLmZpbHRlcihvRmlsdGVycyk7XG5cdFx0dGhpcy5vT2JqZWN0UGFnZUxheW91dCA9IHRoaXMuX2dldE9iamVjdFBhZ2VMYXlvdXQodGhpcywgdGhpcy5vT2JqZWN0UGFnZUxheW91dCk7XG5cdFx0Ly8gV2Ugc3VwcG9ydCBzb3J0aW5nIG9ubHkgZm9yIE9iamVjdFBhZ2VMYXlvdXQgdXNlLWNhc2UuXG5cdFx0aWYgKHRoaXMub09iamVjdFBhZ2VMYXlvdXQpIHtcblx0XHRcdG9Tb3J0ZXIgPSBuZXcgKFNvcnRlciBhcyBhbnkpKFwiXCIsIG51bGwsIG51bGwsIChvYmoxOiBhbnksIG9iajI6IGFueSkgPT4ge1xuXHRcdFx0XHRpZiAoIW9iamVjdFBhZ2VMYXlvdXRTZWN0aW9ucykge1xuXHRcdFx0XHRcdG9iamVjdFBhZ2VMYXlvdXRTZWN0aW9ucyA9IHRoaXMub09iamVjdFBhZ2VMYXlvdXQgJiYgdGhpcy5vT2JqZWN0UGFnZUxheW91dC5nZXRTZWN0aW9ucygpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnN0IHJhbmtBID0gdGhpcy5fZ2V0TWVzc2FnZVJhbmsob2JqMSwgb2JqZWN0UGFnZUxheW91dFNlY3Rpb25zKTtcblx0XHRcdFx0Y29uc3QgcmFua0IgPSB0aGlzLl9nZXRNZXNzYWdlUmFuayhvYmoyLCBvYmplY3RQYWdlTGF5b3V0U2VjdGlvbnMpO1xuXHRcdFx0XHRpZiAocmFua0EgPCByYW5rQikge1xuXHRcdFx0XHRcdHJldHVybiAtMTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAocmFua0EgPiByYW5rQikge1xuXHRcdFx0XHRcdHJldHVybiAxO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiAwO1xuXHRcdFx0fSk7XG5cdFx0XHR0aGlzLm9JdGVtQmluZGluZy5zb3J0KG9Tb3J0ZXIpO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKlxuXHQgKiBAcGFyYW0gc0NvbnRyb2xJZFxuXHQgKiBAcGFyYW0gb0l0ZW1cblx0ICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgY29udHJvbCBJRCBtYXRjaGVzIHRoZSBpdGVtIElEXG5cdCAqL1xuXHRfZm5GaWx0ZXJVcG9uSWQoc0NvbnRyb2xJZDogc3RyaW5nLCBvSXRlbTogYW55KSB7XG5cdFx0cmV0dXJuIHNDb250cm9sSWQgPT09IG9JdGVtLmdldElkKCk7XG5cdH1cblxuXHQvKipcblx0ICpcblx0ICogQHBhcmFtIGFDb250cm9sSWRzXG5cdCAqIEBwYXJhbSBvSXRlbVxuXHQgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBpdGVtIG1hdGNoZXMgb25lIG9mIHRoZSBjb250cm9sc1xuXHQgKi9cblx0X2ZuRmlsdGVyVXBvbklkcyhhQ29udHJvbElkczogc3RyaW5nW10sIG9JdGVtOiBhbnkpIHtcblx0XHRyZXR1cm4gYUNvbnRyb2xJZHMuc29tZShmdW5jdGlvbiAoc0NvbnRyb2xJZCkge1xuXHRcdFx0aWYgKHNDb250cm9sSWQgPT09IG9JdGVtLmdldElkKCkpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fSk7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBzZWN0aW9uIGJhc2VkIG9uIHNlY3Rpb24gdGl0bGUgYW5kIHZpc2liaWxpdHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBvT2JqZWN0UGFnZSBPYmplY3QgcGFnZS5cblx0ICogQHBhcmFtIHNTZWN0aW9uVGl0bGUgU2VjdGlvbiB0aXRsZS5cblx0ICogQHJldHVybnMgVGhlIHNlY3Rpb25cblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRTZWN0aW9uQnlTZWN0aW9uVGl0bGUob09iamVjdFBhZ2U6IGFueSwgc1NlY3Rpb25UaXRsZTogc3RyaW5nKSB7XG5cdFx0aWYgKHNTZWN0aW9uVGl0bGUpIHtcblx0XHRcdGNvbnN0IGFTZWN0aW9ucyA9IG9PYmplY3RQYWdlLmdldFNlY3Rpb25zKCk7XG5cdFx0XHRsZXQgb1NlY3Rpb247XG5cdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFTZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuXHRcdFx0XHRpZiAoYVNlY3Rpb25zW2ldLmdldFZpc2libGUoKSAmJiBhU2VjdGlvbnNbaV0uZ2V0VGl0bGUoKSA9PT0gc1NlY3Rpb25UaXRsZSkge1xuXHRcdFx0XHRcdG9TZWN0aW9uID0gYVNlY3Rpb25zW2ldO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gb1NlY3Rpb247XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIE5hdmlnYXRlcyB0byB0aGUgc2VjdGlvbiBpZiB0aGUgb2JqZWN0IHBhZ2UgdXNlcyBhbiBJY29uVGFiQmFyIGFuZCBpZiB0aGUgY3VycmVudCBzZWN0aW9uIGlzIG5vdCB0aGUgdGFyZ2V0IG9mIHRoZSBuYXZpZ2F0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gb09iamVjdFBhZ2UgT2JqZWN0IHBhZ2UuXG5cdCAqIEBwYXJhbSBzU2VjdGlvblRpdGxlIFNlY3Rpb24gdGl0bGUuXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfbmF2aWdhdGVGcm9tTWVzc2FnZVRvU2VjdGlvbkluSWNvblRhYkJhck1vZGUob09iamVjdFBhZ2U6IGFueSwgc1NlY3Rpb25UaXRsZTogc3RyaW5nKSB7XG5cdFx0Y29uc3QgYlVzZUljb25UYWJCYXIgPSBvT2JqZWN0UGFnZS5nZXRVc2VJY29uVGFiQmFyKCk7XG5cdFx0aWYgKGJVc2VJY29uVGFiQmFyKSB7XG5cdFx0XHRjb25zdCBvU2VjdGlvbiA9IHRoaXMuX2dldFNlY3Rpb25CeVNlY3Rpb25UaXRsZShvT2JqZWN0UGFnZSwgc1NlY3Rpb25UaXRsZSk7XG5cdFx0XHRjb25zdCBzU2VsZWN0ZWRTZWN0aW9uSWQgPSBvT2JqZWN0UGFnZS5nZXRTZWxlY3RlZFNlY3Rpb24oKTtcblx0XHRcdGlmIChvU2VjdGlvbiAmJiBzU2VsZWN0ZWRTZWN0aW9uSWQgIT09IG9TZWN0aW9uLmdldElkKCkpIHtcblx0XHRcdFx0b09iamVjdFBhZ2Uuc2V0U2VsZWN0ZWRTZWN0aW9uKG9TZWN0aW9uLmdldElkKCkpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGFzeW5jIF9uYXZpZ2F0ZUZyb21NZXNzYWdlVG9TZWN0aW9uVGFibGVJbkljb25UYWJCYXJNb2RlKG9UYWJsZTogYW55LCBvT2JqZWN0UGFnZTogYW55LCBzU2VjdGlvblRpdGxlOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+IHtcblx0XHRjb25zdCBvUm93QmluZGluZyA9IG9UYWJsZS5nZXRSb3dCaW5kaW5nKCk7XG5cdFx0Y29uc3Qgb1RhYmxlQ29udGV4dCA9IG9UYWJsZS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGNvbnN0IG9PUENvbnRleHQgPSBvT2JqZWN0UGFnZS5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdGNvbnN0IGJTaG91bGRXYWl0Rm9yVGFibGVSZWZyZXNoID0gIShvVGFibGVDb250ZXh0ID09PSBvT1BDb250ZXh0KTtcblx0XHR0aGlzLl9uYXZpZ2F0ZUZyb21NZXNzYWdlVG9TZWN0aW9uSW5JY29uVGFiQmFyTW9kZShvT2JqZWN0UGFnZSwgc1NlY3Rpb25UaXRsZSk7XG5cdFx0cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlOiBGdW5jdGlvbikge1xuXHRcdFx0aWYgKGJTaG91bGRXYWl0Rm9yVGFibGVSZWZyZXNoKSB7XG5cdFx0XHRcdG9Sb3dCaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImNoYW5nZVwiLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0cmVzb2x2ZSgpO1xuXHRcdFx0XHR9KTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJlc29sdmUoKTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIE1kY1RhYmxlIGlmIGl0IGlzIGZvdW5kIGFtb25nIGFueSBvZiB0aGUgcGFyZW50IGVsZW1lbnRzLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0VsZW1lbnQgQ29udHJvbFxuXHQgKiBAcmV0dXJucyBNREMgdGFibGUgfHwgdW5kZWZpbmVkXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0TWRjVGFibGUob0VsZW1lbnQ6IGFueSkge1xuXHRcdC8vY2hlY2sgaWYgdGhlIGVsZW1lbnQgaGFzIGEgdGFibGUgd2l0aGluIGFueSBvZiBpdHMgcGFyZW50c1xuXHRcdGxldCBvUGFyZW50RWxlbWVudCA9IG9FbGVtZW50LmdldFBhcmVudCgpO1xuXHRcdHdoaWxlIChvUGFyZW50RWxlbWVudCAmJiAhb1BhcmVudEVsZW1lbnQuaXNBKFwic2FwLnVpLm1kYy5UYWJsZVwiKSkge1xuXHRcdFx0b1BhcmVudEVsZW1lbnQgPSBvUGFyZW50RWxlbWVudC5nZXRQYXJlbnQoKTtcblx0XHR9XG5cdFx0cmV0dXJuIG9QYXJlbnRFbGVtZW50ICYmIG9QYXJlbnRFbGVtZW50LmlzQShcInNhcC51aS5tZGMuVGFibGVcIikgPyBvUGFyZW50RWxlbWVudCA6IHVuZGVmaW5lZDtcblx0fVxuXG5cdF9nZXRHcmlkVGFibGUob01kY1RhYmxlOiBhbnkpIHtcblx0XHRyZXR1cm4gb01kY1RhYmxlLmZpbmRFbGVtZW50cyh0cnVlLCBmdW5jdGlvbiAob0VsZW06IGFueSkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0b0VsZW0uaXNBKFwic2FwLnVpLnRhYmxlLlRhYmxlXCIpICYmXG5cdFx0XHRcdC8qKiBXZSBjaGVjayB0aGUgZWxlbWVudCBiZWxvbmdzIHRvIHRoZSBNZGNUYWJsZSA6Ki9cblx0XHRcdFx0b0VsZW0uZ2V0UGFyZW50KCkgPT09IG9NZGNUYWJsZVxuXHRcdFx0KTtcblx0XHR9KVswXTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIHRhYmxlIHJvdyAoaWYgYXZhaWxhYmxlKSBjb250YWluaW5nIHRoZSBlbGVtZW50LlxuXHQgKlxuXHQgKiBAcGFyYW0gb0VsZW1lbnQgQ29udHJvbFxuXHQgKiBAcmV0dXJucyBUYWJsZSByb3cgfHwgdW5kZWZpbmVkXG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0VGFibGVSb3cob0VsZW1lbnQ6IGFueSkge1xuXHRcdGxldCBvUGFyZW50RWxlbWVudCA9IG9FbGVtZW50LmdldFBhcmVudCgpO1xuXHRcdHdoaWxlIChcblx0XHRcdG9QYXJlbnRFbGVtZW50ICYmXG5cdFx0XHQhb1BhcmVudEVsZW1lbnQuaXNBKFwic2FwLnVpLnRhYmxlLlJvd1wiKSAmJlxuXHRcdFx0IW9QYXJlbnRFbGVtZW50LmlzQShcInNhcC51aS50YWJsZS5DcmVhdGlvblJvd1wiKSAmJlxuXHRcdFx0IW9QYXJlbnRFbGVtZW50LmlzQShDb2x1bW5MaXN0SXRlbS5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSlcblx0XHQpIHtcblx0XHRcdG9QYXJlbnRFbGVtZW50ID0gb1BhcmVudEVsZW1lbnQuZ2V0UGFyZW50KCk7XG5cdFx0fVxuXHRcdHJldHVybiBvUGFyZW50RWxlbWVudCAmJlxuXHRcdFx0KG9QYXJlbnRFbGVtZW50LmlzQShcInNhcC51aS50YWJsZS5Sb3dcIikgfHxcblx0XHRcdFx0b1BhcmVudEVsZW1lbnQuaXNBKFwic2FwLnVpLnRhYmxlLkNyZWF0aW9uUm93XCIpIHx8XG5cdFx0XHRcdG9QYXJlbnRFbGVtZW50LmlzQShDb2x1bW5MaXN0SXRlbS5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSkpXG5cdFx0XHQ/IG9QYXJlbnRFbGVtZW50XG5cdFx0XHQ6IHVuZGVmaW5lZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZXMgdGhlIGluZGV4IG9mIHRoZSB0YWJsZSByb3cgY29udGFpbmluZyB0aGUgZWxlbWVudC5cblx0ICpcblx0ICogQHBhcmFtIG9FbGVtZW50IENvbnRyb2xcblx0ICogQHJldHVybnMgUm93IGluZGV4IHx8IHVuZGVmaW5lZFxuXHQgKiBAcHJpdmF0ZVxuXHQgKi9cblx0X2dldFRhYmxlUm93SW5kZXgob0VsZW1lbnQ6IGFueSkge1xuXHRcdGNvbnN0IG9UYWJsZVJvdyA9IHRoaXMuX2dldFRhYmxlUm93KG9FbGVtZW50KTtcblx0XHRsZXQgaVJvd0luZGV4O1xuXHRcdGlmIChvVGFibGVSb3cuaXNBKFwic2FwLnVpLnRhYmxlLlJvd1wiKSkge1xuXHRcdFx0aVJvd0luZGV4ID0gb1RhYmxlUm93LmdldEluZGV4KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlSb3dJbmRleCA9IG9UYWJsZVJvd1xuXHRcdFx0XHQuZ2V0VGFibGUoKVxuXHRcdFx0XHQuZ2V0SXRlbXMoKVxuXHRcdFx0XHQuZmluZEluZGV4KGZ1bmN0aW9uIChlbGVtZW50OiBhbnkpIHtcblx0XHRcdFx0XHRyZXR1cm4gZWxlbWVudC5nZXRJZCgpID09PSBvVGFibGVSb3cuZ2V0SWQoKTtcblx0XHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBpUm93SW5kZXg7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSBpbmRleCBvZiB0aGUgdGFibGUgY29sdW1uIGNvbnRhaW5pbmcgdGhlIGVsZW1lbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvRWxlbWVudCBDb250cm9sXG5cdCAqIEByZXR1cm5zIENvbHVtbiBpbmRleCB8fCB1bmRlZmluZWRcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRUYWJsZUNvbHVtbkluZGV4KG9FbGVtZW50OiBhbnkpIHtcblx0XHRjb25zdCBnZXRUYXJnZXRDZWxsSW5kZXggPSBmdW5jdGlvbiAoZWxlbWVudDogYW55LCBvVGFyZ2V0Um93OiBhbnkpIHtcblx0XHRcdHJldHVybiBvVGFyZ2V0Um93LmdldENlbGxzKCkuZmluZEluZGV4KGZ1bmN0aW9uIChvQ2VsbDogYW55KSB7XG5cdFx0XHRcdHJldHVybiBvQ2VsbC5nZXRJZCgpID09PSBlbGVtZW50LmdldElkKCk7XG5cdFx0XHR9KTtcblx0XHR9O1xuXHRcdGNvbnN0IGdldFRhcmdldENvbHVtbkluZGV4ID0gZnVuY3Rpb24gKGVsZW1lbnQ6IGFueSwgb1RhcmdldFJvdzogYW55KSB7XG5cdFx0XHRsZXQgb1RhcmdldEVsZW1lbnQgPSBlbGVtZW50LmdldFBhcmVudCgpLFxuXHRcdFx0XHRpVGFyZ2V0Q2VsbEluZGV4ID0gZ2V0VGFyZ2V0Q2VsbEluZGV4KG9UYXJnZXRFbGVtZW50LCBvVGFyZ2V0Um93KTtcblx0XHRcdHdoaWxlIChvVGFyZ2V0RWxlbWVudCAmJiBpVGFyZ2V0Q2VsbEluZGV4IDwgMCkge1xuXHRcdFx0XHRvVGFyZ2V0RWxlbWVudCA9IG9UYXJnZXRFbGVtZW50LmdldFBhcmVudCgpO1xuXHRcdFx0XHRpVGFyZ2V0Q2VsbEluZGV4ID0gZ2V0VGFyZ2V0Q2VsbEluZGV4KG9UYXJnZXRFbGVtZW50LCBvVGFyZ2V0Um93KTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBpVGFyZ2V0Q2VsbEluZGV4O1xuXHRcdH07XG5cdFx0Y29uc3Qgb1RhcmdldFJvdyA9IHRoaXMuX2dldFRhYmxlUm93KG9FbGVtZW50KTtcblx0XHRsZXQgaVRhcmdldENvbHVtbkluZGV4O1xuXHRcdGlUYXJnZXRDb2x1bW5JbmRleCA9IGdldFRhcmdldENvbHVtbkluZGV4KG9FbGVtZW50LCBvVGFyZ2V0Um93KTtcblx0XHRpZiAob1RhcmdldFJvdy5pc0EoXCJzYXAudWkudGFibGUuQ3JlYXRpb25Sb3dcIikpIHtcblx0XHRcdGNvbnN0IHNUYXJnZXRDZWxsSWQgPSBvVGFyZ2V0Um93LmdldENlbGxzKClbaVRhcmdldENvbHVtbkluZGV4XS5nZXRJZCgpLFxuXHRcdFx0XHRhVGFibGVDb2x1bW5zID0gb1RhcmdldFJvdy5nZXRUYWJsZSgpLmdldENvbHVtbnMoKTtcblx0XHRcdGlUYXJnZXRDb2x1bW5JbmRleCA9IGFUYWJsZUNvbHVtbnMuZmluZEluZGV4KGZ1bmN0aW9uIChjb2x1bW46IGFueSkge1xuXHRcdFx0XHRpZiAoY29sdW1uLmdldENyZWF0aW9uVGVtcGxhdGUoKSkge1xuXHRcdFx0XHRcdHJldHVybiBzVGFyZ2V0Q2VsbElkLnNlYXJjaChjb2x1bW4uZ2V0Q3JlYXRpb25UZW1wbGF0ZSgpLmdldElkKCkpID4gLTEgPyB0cnVlIDogZmFsc2U7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cdFx0cmV0dXJuIGlUYXJnZXRDb2x1bW5JbmRleDtcblx0fVxuXG5cdF9nZXRNZGNUYWJsZVJvd3Mob01kY1RhYmxlOiBhbnkpIHtcblx0XHRyZXR1cm4gb01kY1RhYmxlLmZpbmRFbGVtZW50cyh0cnVlLCBmdW5jdGlvbiAob0VsZW06IGFueSkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0b0VsZW0uaXNBKFwic2FwLnVpLnRhYmxlLlJvd1wiKSAmJlxuXHRcdFx0XHQvKiogV2UgY2hlY2sgdGhlIGVsZW1lbnQgYmVsb25ncyB0byB0aGUgTWRjIFRhYmxlIDoqL1xuXHRcdFx0XHRvRWxlbS5nZXRUYWJsZSgpLmdldFBhcmVudCgpID09PSBvTWRjVGFibGVcblx0XHRcdCk7XG5cdFx0fSk7XG5cdH1cblxuXHRfZ2V0VGFibGVDb2xQcm9wZXJ0eShvVGFibGU6IGFueSwgb01lc3NhZ2VPYmplY3Q6IE1lc3NhZ2UpIHtcblx0XHQvL3RoaXMgZnVuY3Rpb24gZXNjYXBlcyBhIHN0cmluZyB0byB1c2UgaXQgYXMgYSByZWdleFxuXHRcdGNvbnN0IGZuUmVnRXhwZXNjYXBlID0gZnVuY3Rpb24gKHM6IHN0cmluZykge1xuXHRcdFx0cmV0dXJuIHMucmVwbGFjZSgvWy1cXC9cXFxcXiQqKz8uKCl8W1xcXXt9XS9nLCBcIlxcXFwkJlwiKTtcblx0XHR9O1xuXHRcdC8vIGJhc2VkIG9uIHRoZSB0YXJnZXQgcGF0aCBvZiB0aGUgbWVzc2FnZSB3ZSByZXRyaWV2ZSB0aGUgcHJvcGVydHkgbmFtZS5cblx0XHQvLyB0byBhY2hpZXZlIGl0IHdlIHJlbW92ZSB0aGUgYmluZGluZ0NvbnRleHQgcGF0aCBhbmQgdGhlIHJvdyBiaW5kaW5nIHBhdGggZnJvbSB0aGUgdGFyZ2V0XG5cdFx0cmV0dXJuIG9NZXNzYWdlT2JqZWN0XG5cdFx0XHQuZ2V0VGFyZ2V0cygpWzBdXG5cdFx0XHQucmVwbGFjZShcblx0XHRcdFx0bmV3IFJlZ0V4cChgJHtmblJlZ0V4cGVzY2FwZShgJHtvVGFibGUuZ2V0QmluZGluZ0NvbnRleHQoKS5nZXRQYXRoKCl9LyR7b1RhYmxlLmdldFJvd0JpbmRpbmcoKS5nZXRQYXRoKCl9YCl9XFxcXCguKlxcXFwpL2ApLFxuXHRcdFx0XHRcIlwiXG5cdFx0XHQpO1xuXHR9XG5cblx0X2dldE9iamVjdFBhZ2VMYXlvdXQob0VsZW1lbnQ6IGFueSwgb09iamVjdFBhZ2VMYXlvdXQ6IGFueSkge1xuXHRcdGlmIChvT2JqZWN0UGFnZUxheW91dCkge1xuXHRcdFx0cmV0dXJuIG9PYmplY3RQYWdlTGF5b3V0O1xuXHRcdH1cblx0XHRvT2JqZWN0UGFnZUxheW91dCA9IG9FbGVtZW50O1xuXHRcdC8vSXRlcmF0ZSBvdmVyIHBhcmVudCB0aWxsIHlvdSBoYXZlIG5vdCByZWFjaGVkIHRoZSBvYmplY3QgcGFnZSBsYXlvdXRcblx0XHR3aGlsZSAob09iamVjdFBhZ2VMYXlvdXQgJiYgIW9PYmplY3RQYWdlTGF5b3V0LmlzQShcInNhcC51eGFwLk9iamVjdFBhZ2VMYXlvdXRcIikpIHtcblx0XHRcdG9PYmplY3RQYWdlTGF5b3V0ID0gb09iamVjdFBhZ2VMYXlvdXQuZ2V0UGFyZW50KCk7XG5cdFx0fVxuXHRcdHJldHVybiBvT2JqZWN0UGFnZUxheW91dDtcblx0fVxuXG5cdF9nZXRDdXN0b21Db2x1bW5JbmZvKG9UYWJsZTogYW55LCBpUG9zaXRpb246IG51bWJlcikge1xuXHRcdGNvbnN0IHNUYWJsZUNvbFByb3BlcnR5ID0gb1RhYmxlLmdldENvbHVtbnMoKVtpUG9zaXRpb25dLmdldERhdGFQcm9wZXJ0eSgpO1xuXHRcdHJldHVybiBvVGFibGVcblx0XHRcdC5nZXRDb250cm9sRGVsZWdhdGUoKVxuXHRcdFx0LmdldENvbHVtbnNGb3Iob1RhYmxlKVxuXHRcdFx0LmZpbmQoZnVuY3Rpb24gKG9Db2x1bW46IGFueSkge1xuXHRcdFx0XHRyZXR1cm4gb0NvbHVtbi5uYW1lID09PSBzVGFibGVDb2xQcm9wZXJ0eSAmJiAhIW9Db2x1bW4udGVtcGxhdGU7XG5cdFx0XHR9KTtcblx0fVxuXG5cdF9nZXRUYWJsZUZpcnN0Q29sUHJvcGVydHkob1RhYmxlOiBhbnkpIHtcblx0XHRjb25zdCBvQ3VzdG9tQ29sdW1uSW5mbyA9IHRoaXMuX2dldEN1c3RvbUNvbHVtbkluZm8ob1RhYmxlLCAwKTtcblx0XHRsZXQgc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eTtcblx0XHRpZiAob0N1c3RvbUNvbHVtbkluZm8pIHtcblx0XHRcdGlmIChvQ3VzdG9tQ29sdW1uSW5mby5wcm9wZXJ0eUluZm9zKSB7XG5cdFx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHkgPSBvQ3VzdG9tQ29sdW1uSW5mby5wcm9wZXJ0eUluZm9zWzBdLnJlcGxhY2UoXCJQcm9wZXJ0eTo6XCIsIFwiXCIpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSA9IHVuZGVmaW5lZDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSA9IG9UYWJsZS5nZXRDb2x1bW5zKClbMF0uZ2V0RGF0YVByb3BlcnR5KCk7XG5cdFx0fVxuXHRcdHJldHVybiBzVGFibGVGaXJzdENvbFByb3BlcnR5O1xuXHR9XG5cblx0X2dldFRhYmxlRmlyc3RDb2xCaW5kaW5nQ29udGV4dEZvclRleHRBbm5vdGF0aW9uKG9UYWJsZTogYW55LCBvVGFibGVSb3dDb250ZXh0OiBhbnksIHNUYWJsZUZpcnN0Q29sUHJvcGVydHk6IHN0cmluZykge1xuXHRcdGxldCBvQmluZGluZ0NvbnRleHQ7XG5cdFx0aWYgKG9UYWJsZVJvd0NvbnRleHQgJiYgc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eSkge1xuXHRcdFx0Y29uc3Qgb01vZGVsID0gb1RhYmxlLmdldE1vZGVsKCk7XG5cdFx0XHRjb25zdCBvTWV0YU1vZGVsID0gb01vZGVsLmdldE1ldGFNb2RlbCgpO1xuXHRcdFx0Y29uc3Qgc01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChvVGFibGVSb3dDb250ZXh0LmdldFBhdGgoKSk7XG5cdFx0XHRpZiAob01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c01ldGFQYXRofS8ke3NUYWJsZUZpcnN0Q29sUHJvcGVydHl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0LyRQYXRoYCkpIHtcblx0XHRcdFx0b0JpbmRpbmdDb250ZXh0ID0gb01ldGFNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChcblx0XHRcdFx0XHRgJHtzTWV0YVBhdGh9LyR7c1RhYmxlRmlyc3RDb2xQcm9wZXJ0eX1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRgXG5cdFx0XHRcdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBvQmluZGluZ0NvbnRleHQ7XG5cdH1cblxuXHRfZ2V0VGFibGVGaXJzdENvbFZhbHVlKHNUYWJsZUZpcnN0Q29sUHJvcGVydHk6IHN0cmluZywgb1RhYmxlUm93Q29udGV4dDogYW55LCBzVGV4dEFubm90YXRpb25QYXRoOiBzdHJpbmcsIHNUZXh0QXJyYW5nZW1lbnQ6IHN0cmluZykge1xuXHRcdGNvbnN0IHNDb2RlVmFsdWUgPSBvVGFibGVSb3dDb250ZXh0LmdldFZhbHVlKHNUYWJsZUZpcnN0Q29sUHJvcGVydHkpO1xuXHRcdGxldCBzVGV4dFZhbHVlO1xuXHRcdGxldCBzQ29tcHV0ZWRWYWx1ZSA9IHNDb2RlVmFsdWU7XG5cdFx0aWYgKHNUZXh0QW5ub3RhdGlvblBhdGgpIHtcblx0XHRcdGlmIChzVGFibGVGaXJzdENvbFByb3BlcnR5Lmxhc3RJbmRleE9mKFwiL1wiKSA+IDApIHtcblx0XHRcdFx0Ly8gdGhlIHRhcmdldCBwcm9wZXJ0eSBpcyByZXBsYWNlZCB3aXRoIHRoZSB0ZXh0IGFubm90YXRpb24gcGF0aFxuXHRcdFx0XHRzVGFibGVGaXJzdENvbFByb3BlcnR5ID0gc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eS5zbGljZSgwLCBzVGFibGVGaXJzdENvbFByb3BlcnR5Lmxhc3RJbmRleE9mKFwiL1wiKSArIDEpO1xuXHRcdFx0XHRzVGFibGVGaXJzdENvbFByb3BlcnR5ID0gc1RhYmxlRmlyc3RDb2xQcm9wZXJ0eS5jb25jYXQoc1RleHRBbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRzVGFibGVGaXJzdENvbFByb3BlcnR5ID0gc1RleHRBbm5vdGF0aW9uUGF0aDtcblx0XHRcdH1cblx0XHRcdHNUZXh0VmFsdWUgPSBvVGFibGVSb3dDb250ZXh0LmdldFZhbHVlKHNUYWJsZUZpcnN0Q29sUHJvcGVydHkpO1xuXHRcdFx0aWYgKHNUZXh0VmFsdWUpIHtcblx0XHRcdFx0aWYgKHNUZXh0QXJyYW5nZW1lbnQpIHtcblx0XHRcdFx0XHRjb25zdCBzRW51bU51bWJlciA9IHNUZXh0QXJyYW5nZW1lbnQuc2xpY2Uoc1RleHRBcnJhbmdlbWVudC5pbmRleE9mKFwiL1wiKSArIDEpO1xuXHRcdFx0XHRcdHN3aXRjaCAoc0VudW1OdW1iZXIpIHtcblx0XHRcdFx0XHRcdGNhc2UgXCJUZXh0T25seVwiOlxuXHRcdFx0XHRcdFx0XHRzQ29tcHV0ZWRWYWx1ZSA9IHNUZXh0VmFsdWU7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcIlRleHRGaXJzdFwiOlxuXHRcdFx0XHRcdFx0XHRzQ29tcHV0ZWRWYWx1ZSA9IGAke3NUZXh0VmFsdWV9ICgke3NDb2RlVmFsdWV9KWA7XG5cdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0Y2FzZSBcIlRleHRMYXN0XCI6XG5cdFx0XHRcdFx0XHRcdHNDb21wdXRlZFZhbHVlID0gYCR7c0NvZGVWYWx1ZX0gKCR7c1RleHRWYWx1ZX0pYDtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRjYXNlIFwiVGV4dFNlcGFyYXRlXCI6XG5cdFx0XHRcdFx0XHRcdHNDb21wdXRlZFZhbHVlID0gc0NvZGVWYWx1ZTtcblx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzQ29tcHV0ZWRWYWx1ZSA9IGAke3NUZXh0VmFsdWV9ICgke3NDb2RlVmFsdWV9KWA7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHNDb21wdXRlZFZhbHVlO1xuXHR9XG5cblx0X0lzQ29udHJvbEluVGFibGUob1RhYmxlOiBhbnksIHNDb250cm9sSWQ6IHN0cmluZykge1xuXHRcdGNvbnN0IG9Db250cm9sID0gQ29yZS5ieUlkKHNDb250cm9sSWQpO1xuXHRcdGlmIChvQ29udHJvbCAmJiAhb0NvbnRyb2wuaXNBKFwic2FwLnVpLnRhYmxlLlRhYmxlXCIpICYmICFvQ29udHJvbC5pc0EoXCJzYXAubS5UYWJsZVwiKSkge1xuXHRcdFx0cmV0dXJuIG9UYWJsZS5maW5kRWxlbWVudHModHJ1ZSwgZnVuY3Rpb24gKG9FbGVtOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9FbGVtLmdldElkKCkgPT09IG9Db250cm9sO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdF9Jc0NvbnRyb2xQYXJ0T2ZDcmVhdGlvblJvdyhvQ29udHJvbDogYW55KSB7XG5cdFx0bGV0IG9QYXJlbnRDb250cm9sID0gb0NvbnRyb2wuZ2V0UGFyZW50KCk7XG5cdFx0d2hpbGUgKFxuXHRcdFx0b1BhcmVudENvbnRyb2wgJiZcblx0XHRcdCFvUGFyZW50Q29udHJvbC5pc0EoXCJzYXAudWkudGFibGUuUm93XCIpICYmXG5cdFx0XHQhb1BhcmVudENvbnRyb2wuaXNBKFwic2FwLnVpLnRhYmxlLkNyZWF0aW9uUm93XCIpICYmXG5cdFx0XHQhb1BhcmVudENvbnRyb2wuaXNBKENvbHVtbkxpc3RJdGVtLmdldE1ldGFkYXRhKCkuZ2V0TmFtZSgpKVxuXHRcdCkge1xuXHRcdFx0b1BhcmVudENvbnRyb2wgPSBvUGFyZW50Q29udHJvbC5nZXRQYXJlbnQoKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gISFvUGFyZW50Q29udHJvbCAmJiBvUGFyZW50Q29udHJvbC5pc0EoXCJzYXAudWkudGFibGUuQ3JlYXRpb25Sb3dcIik7XG5cdH1cblxuXHQvKipcblx0ICogVGhlIG1ldGhvZCB0aGF0IGlzIGNhbGxlZCB0byByZXRyaWV2ZSB0aGUgY29sdW1uIGluZm8gZnJvbSB0aGUgYXNzb2NpYXRlZCBtZXNzYWdlIG9mIHRoZSBtZXNzYWdlIHBvcG92ZXIuXG5cdCAqXG5cdCAqIEBwcml2YXRlXG5cdCAqIEBwYXJhbSBvTWVzc2FnZSBNZXNzYWdlIG9iamVjdFxuXHQgKiBAcGFyYW0gb1RhYmxlIE1kY1RhYmxlXG5cdCAqIEByZXR1cm5zIFJldHVybnMgdGhlIGNvbHVtbiBpbmZvLlxuXHQgKi9cblx0X2ZldGNoQ29sdW1uSW5mbyhvTWVzc2FnZTogYW55LCBvVGFibGU6IGFueSkge1xuXHRcdGNvbnN0IHNDb2xOYW1lRnJvbU1lc3NhZ2VPYmogPSBvTWVzc2FnZS5nZXRCaW5kaW5nQ29udGV4dChcIm1lc3NhZ2VcIikuZ2V0T2JqZWN0KCkuZ2V0VGFyZ2V0KCkuc3BsaXQoXCIvXCIpLnBvcCgpO1xuXHRcdHJldHVybiBvVGFibGVcblx0XHRcdC5nZXRQYXJlbnQoKVxuXHRcdFx0LmdldFRhYmxlRGVmaW5pdGlvbigpXG5cdFx0XHQuY29sdW1ucy5maW5kKGZ1bmN0aW9uIChvQ29sdW1uOiBhbnkpIHtcblx0XHRcdFx0cmV0dXJuIG9Db2x1bW4ua2V5LnNwbGl0KFwiOjpcIikucG9wKCkgPT09IHNDb2xOYW1lRnJvbU1lc3NhZ2VPYmo7XG5cdFx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBUaGUgbWV0aG9kIHRoYXQgaXMgY2FsbGVkIHRvIGNoZWNrIGlmIGEgbmF2aWdhdGlvbiBpcyBjb25maWd1cmVkIGZyb20gdGhlIHRhYmxlIHRvIGEgc3ViIG9iamVjdCBwYWdlLlxuXHQgKlxuXHQgKiBAcHJpdmF0ZVxuXHQgKiBAcGFyYW0gdGFibGUgTWRjVGFibGVcblx0ICogQHJldHVybnMgRWl0aGVyIHRydWUgb3IgZmFsc2Vcblx0ICovXG5cdF9uYXZpZ2F0aW9uQ29uZmlndXJlZCh0YWJsZTogYW55KTogYm9vbGVhbiB7XG5cdFx0Ly8gVE9ETzogdGhpcyBsb2dpYyB3b3VsZCBiZSBtb3ZlZCB0byBjaGVjayB0aGUgc2FtZSBhdCB0aGUgdGVtcGxhdGUgdGltZSB0byBhdm9pZCB0aGUgc2FtZSBjaGVjayBoYXBwZW5pbmcgbXVsdGlwbGUgdGltZXMuXG5cdFx0Y29uc3QgY29tcG9uZW50ID0gc2FwLnVpLnJlcXVpcmUoXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIiksXG5cdFx0XHRuYXZPYmplY3QgPSB0YWJsZSAmJiBjb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3IodGFibGUpICYmIGNvbXBvbmVudC5nZXRPd25lckNvbXBvbmVudEZvcih0YWJsZSkuZ2V0TmF2aWdhdGlvbigpO1xuXHRcdGxldCBzdWJPUENvbmZpZ3VyZWQgPSBmYWxzZSxcblx0XHRcdG5hdkNvbmZpZ3VyZWQgPSBmYWxzZTtcblx0XHRpZiAobmF2T2JqZWN0ICYmIE9iamVjdC5rZXlzKG5hdk9iamVjdCkuaW5kZXhPZih0YWJsZS5nZXRSb3dCaW5kaW5nKCkuc1BhdGgpICE9PSAtMSkge1xuXHRcdFx0c3ViT1BDb25maWd1cmVkID1cblx0XHRcdFx0bmF2T2JqZWN0W3RhYmxlPy5nZXRSb3dCaW5kaW5nKCkuc1BhdGhdICYmXG5cdFx0XHRcdG5hdk9iamVjdFt0YWJsZT8uZ2V0Um93QmluZGluZygpLnNQYXRoXS5kZXRhaWwgJiZcblx0XHRcdFx0bmF2T2JqZWN0W3RhYmxlPy5nZXRSb3dCaW5kaW5nKCkuc1BhdGhdLmRldGFpbC5yb3V0ZVxuXHRcdFx0XHRcdD8gdHJ1ZVxuXHRcdFx0XHRcdDogZmFsc2U7XG5cdFx0fVxuXHRcdG5hdkNvbmZpZ3VyZWQgPVxuXHRcdFx0c3ViT1BDb25maWd1cmVkICYmXG5cdFx0XHR0YWJsZT8uZ2V0Um93U2V0dGluZ3MoKS5nZXRSb3dBY3Rpb25zKCkgJiZcblx0XHRcdHRhYmxlPy5nZXRSb3dTZXR0aW5ncygpLmdldFJvd0FjdGlvbnMoKVswXS5tUHJvcGVydGllcy50eXBlLmluZGV4T2YoXCJOYXZpZ2F0aW9uXCIpICE9PSAtMTtcblx0XHRyZXR1cm4gbmF2Q29uZmlndXJlZDtcblx0fVxuXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgdGhlIG1lc3NhZ2Ugc3VidGl0bGUgYmFzZWQgb24gdGhlIGNvbnRyb2wgaG9sZGluZyB0aGUgZXJyb3IgKGNvbHVtbi9yb3cgaW5kaWNhdG9yKS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQHBhcmFtIG1lc3NhZ2UgVGhlIG1lc3NhZ2UgSXRlbVxuXHQgKiBAcGFyYW0gb1RhYmxlUm93QmluZGluZ0NvbnRleHRzIFRoZSB0YWJsZSByb3cgY29udGV4dHNcblx0ICogQHBhcmFtIG9UYWJsZVJvd0NvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIHRhYmxlIHJvdyBob2xkaW5nIHRoZSBlcnJvclxuXHQgKiBAcGFyYW0gc1RhYmxlVGFyZ2V0Q29sTmFtZSBUaGUgY29sdW1uIG5hbWUgd2hlcmUgdGhlIGVycm9yIGlzIGxvY2F0ZWRcblx0ICogQHBhcmFtIG9SZXNvdXJjZUJ1bmRsZSBSZXNvdXJjZUJ1bmRsZVxuXHQgKiBAcGFyYW0gb1RhYmxlIE1kY1RhYmxlXG5cdCAqIEBwYXJhbSBiSXNDcmVhdGlvblJvdyBJcyB0aGUgZXJyb3Igb24gYSBjb250cm9sIHRoYXQgaXMgcGFydCBvZiB0aGUgQ3JlYXRpb25Sb3dcblx0ICogQHBhcmFtIG9UYXJnZXRlZENvbnRyb2wgVGhlIGNvbnRyb2wgdGFyZ2V0ZWQgYnkgdGhlIG1lc3NhZ2Vcblx0ICogQHJldHVybnMgVGhlIGNvbXB1dGVkIG1lc3NhZ2Ugc3ViVGl0bGVcblx0ICovXG5cdF9nZXRNZXNzYWdlU3VidGl0bGUoXG5cdFx0bWVzc2FnZTogTWVzc2FnZUl0ZW0sXG5cdFx0b1RhYmxlUm93QmluZGluZ0NvbnRleHRzOiBDb250ZXh0W10sXG5cdFx0b1RhYmxlUm93Q29udGV4dDogQ29udGV4dCxcblx0XHRzVGFibGVUYXJnZXRDb2xOYW1lOiBzdHJpbmcsXG5cdFx0b1Jlc291cmNlQnVuZGxlOiBSZXNvdXJjZUJ1bmRsZSxcblx0XHRvVGFibGU6IE1kY1RhYmxlLFxuXHRcdGJJc0NyZWF0aW9uUm93OiBib29sZWFuLFxuXHRcdG9UYXJnZXRlZENvbnRyb2w/OiBhbnlcblx0KSB7XG5cdFx0bGV0IHNNZXNzYWdlU3VidGl0bGU7XG5cdFx0bGV0IHNSb3dTdWJ0aXRsZVZhbHVlO1xuXHRcdGNvbnN0IHNUYWJsZUZpcnN0Q29sUHJvcGVydHkgPSAob1RhYmxlLmdldFBhcmVudCgpIGFzIFRhYmxlQVBJKS5nZXRJZGVudGlmaWVyQ29sdW1uKCk7XG5cdFx0Y29uc3Qgb0NvbEZyb21UYWJsZVNldHRpbmdzID0gdGhpcy5fZmV0Y2hDb2x1bW5JbmZvKG1lc3NhZ2UsIG9UYWJsZSk7XG5cdFx0aWYgKGJJc0NyZWF0aW9uUm93KSB7XG5cdFx0XHRzTWVzc2FnZVN1YnRpdGxlID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJUX01FU1NBR0VfSVRFTV9TVUJUSVRMRVwiLCBvUmVzb3VyY2VCdW5kbGUsIFtcblx0XHRcdFx0b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJUX01FU1NBR0VfSVRFTV9TVUJUSVRMRV9DUkVBVElPTl9ST1dfSU5ESUNBVE9SXCIpLFxuXHRcdFx0XHRzVGFibGVUYXJnZXRDb2xOYW1lID8gc1RhYmxlVGFyZ2V0Q29sTmFtZSA6IG9Db2xGcm9tVGFibGVTZXR0aW5ncy5sYWJlbFxuXHRcdFx0XSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNvbnN0IG9UYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRUZXh0QW5ub3RhdGlvbiA9IHRoaXMuX2dldFRhYmxlRmlyc3RDb2xCaW5kaW5nQ29udGV4dEZvclRleHRBbm5vdGF0aW9uKFxuXHRcdFx0XHRvVGFibGUsXG5cdFx0XHRcdG9UYWJsZVJvd0NvbnRleHQsXG5cdFx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHlcblx0XHRcdCk7XG5cdFx0XHRjb25zdCBzVGFibGVGaXJzdENvbFRleHRBbm5vdGF0aW9uUGF0aCA9IG9UYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRUZXh0QW5ub3RhdGlvblxuXHRcdFx0XHQ/IG9UYWJsZUZpcnN0Q29sQmluZGluZ0NvbnRleHRUZXh0QW5ub3RhdGlvbi5nZXRPYmplY3QoXCIkUGF0aFwiKVxuXHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRcdGNvbnN0IHNUYWJsZUZpcnN0Q29sVGV4dEFycmFuZ2VtZW50ID1cblx0XHRcdFx0c1RhYmxlRmlyc3RDb2xUZXh0QW5ub3RhdGlvblBhdGggJiYgb1RhYmxlRmlyc3RDb2xCaW5kaW5nQ29udGV4dFRleHRBbm5vdGF0aW9uXG5cdFx0XHRcdFx0PyBvVGFibGVGaXJzdENvbEJpbmRpbmdDb250ZXh0VGV4dEFubm90YXRpb24uZ2V0T2JqZWN0KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudC8kRW51bU1lbWJlclwiKVxuXHRcdFx0XHRcdDogdW5kZWZpbmVkO1xuXHRcdFx0aWYgKG9UYWJsZVJvd0JpbmRpbmdDb250ZXh0cy5sZW5ndGggPiAwKSB7XG5cdFx0XHRcdC8vIHNldCBSb3cgc3VidGl0bGUgdGV4dFxuXHRcdFx0XHRpZiAob1RhcmdldGVkQ29udHJvbCkge1xuXHRcdFx0XHRcdC8vIFRoZSBVSSBlcnJvciBpcyBvbiB0aGUgZmlyc3QgY29sdW1uLCB3ZSB0aGVuIGdldCB0aGUgY29udHJvbCBpbnB1dCBhcyB0aGUgcm93IGluZGljYXRvcjpcblx0XHRcdFx0XHRzUm93U3VidGl0bGVWYWx1ZSA9IG9UYXJnZXRlZENvbnRyb2wuZ2V0VmFsdWUoKTtcblx0XHRcdFx0fSBlbHNlIGlmIChvVGFibGVSb3dDb250ZXh0ICYmIHNUYWJsZUZpcnN0Q29sUHJvcGVydHkpIHtcblx0XHRcdFx0XHRzUm93U3VidGl0bGVWYWx1ZSA9IHRoaXMuX2dldFRhYmxlRmlyc3RDb2xWYWx1ZShcblx0XHRcdFx0XHRcdHNUYWJsZUZpcnN0Q29sUHJvcGVydHksXG5cdFx0XHRcdFx0XHRvVGFibGVSb3dDb250ZXh0LFxuXHRcdFx0XHRcdFx0c1RhYmxlRmlyc3RDb2xUZXh0QW5ub3RhdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRzVGFibGVGaXJzdENvbFRleHRBcnJhbmdlbWVudFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0c1Jvd1N1YnRpdGxlVmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gc2V0IHRoZSBtZXNzYWdlIHN1YnRpdGxlXG5cdFx0XHRcdGNvbnN0IG9Db2x1bW5JbmZvOiBhbnkgPSB0aGlzLl9kZXRlcm1pbmVDb2x1bW5JbmZvKG9Db2xGcm9tVGFibGVTZXR0aW5ncywgb1Jlc291cmNlQnVuZGxlKTtcblx0XHRcdFx0aWYgKHNSb3dTdWJ0aXRsZVZhbHVlICYmIHNUYWJsZVRhcmdldENvbE5hbWUpIHtcblx0XHRcdFx0XHRzTWVzc2FnZVN1YnRpdGxlID0gQ29tbW9uVXRpbHMuZ2V0VHJhbnNsYXRlZFRleHQoXCJUX01FU1NBR0VfSVRFTV9TVUJUSVRMRVwiLCBvUmVzb3VyY2VCdW5kbGUsIFtcblx0XHRcdFx0XHRcdHNSb3dTdWJ0aXRsZVZhbHVlLFxuXHRcdFx0XHRcdFx0c1RhYmxlVGFyZ2V0Q29sTmFtZVxuXHRcdFx0XHRcdF0pO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHNSb3dTdWJ0aXRsZVZhbHVlICYmIG9Db2x1bW5JbmZvLnNDb2x1bW5JbmRpY2F0b3IgPT09IFwiSGlkZGVuXCIpIHtcblx0XHRcdFx0XHRzTWVzc2FnZVN1YnRpdGxlID0gYCR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJUX01FU1NBR0VfR1JPVVBfREVTQ1JJUFRJT05fVEFCTEVfUk9XXCIpfTogJHtzUm93U3VidGl0bGVWYWx1ZX0sICR7XG5cdFx0XHRcdFx0XHRvQ29sdW1uSW5mby5zQ29sdW1uVmFsdWVcblx0XHRcdFx0XHR9YDtcblx0XHRcdFx0fSBlbHNlIGlmIChzUm93U3VidGl0bGVWYWx1ZSAmJiBvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID09PSBcIlVua25vd25cIikge1xuXHRcdFx0XHRcdHNNZXNzYWdlU3VidGl0bGUgPSBDb21tb25VdGlscy5nZXRUcmFuc2xhdGVkVGV4dChcIlRfTUVTU0FHRV9JVEVNX1NVQlRJVExFXCIsIG9SZXNvdXJjZUJ1bmRsZSwgW1xuXHRcdFx0XHRcdFx0c1Jvd1N1YnRpdGxlVmFsdWUsXG5cdFx0XHRcdFx0XHRvQ29sdW1uSW5mby5zQ29sdW1uVmFsdWVcblx0XHRcdFx0XHRdKTtcblx0XHRcdFx0fSBlbHNlIGlmIChzUm93U3VidGl0bGVWYWx1ZSAmJiBvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID09PSBcInVuZGVmaW5lZFwiKSB7XG5cdFx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IGAke29SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiVF9NRVNTQUdFX0dST1VQX0RFU0NSSVBUSU9OX1RBQkxFX1JPV1wiKX06ICR7c1Jvd1N1YnRpdGxlVmFsdWV9YDtcblx0XHRcdFx0fSBlbHNlIGlmICghc1Jvd1N1YnRpdGxlVmFsdWUgJiYgc1RhYmxlVGFyZ2V0Q29sTmFtZSkge1xuXHRcdFx0XHRcdHNNZXNzYWdlU3VidGl0bGUgPSBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfTUVTU0FHRV9HUk9VUF9ERVNDUklQVElPTl9UQUJMRV9DT0xVTU5cIikgKyBcIjogXCIgKyBzVGFibGVUYXJnZXRDb2xOYW1lO1xuXHRcdFx0XHR9IGVsc2UgaWYgKCFzUm93U3VidGl0bGVWYWx1ZSAmJiBvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID09PSBcIkhpZGRlblwiKSB7XG5cdFx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IG9Db2x1bW5JbmZvLnNDb2x1bW5WYWx1ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRzTWVzc2FnZVN1YnRpdGxlID0gbnVsbDtcblx0XHRcdFx0fVxuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0c01lc3NhZ2VTdWJ0aXRsZSA9IG51bGw7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzTWVzc2FnZVN1YnRpdGxlO1xuXHR9XG5cblx0X2RldGVybWluZUNvbHVtbkluZm8ob0NvbEZyb21UYWJsZVNldHRpbmdzOiBhbnksIG9SZXNvdXJjZUJ1bmRsZTogYW55KSB7XG5cdFx0Y29uc3Qgb0NvbHVtbkluZm86IGFueSA9IHsgc0NvbHVtbkluZGljYXRvcjogU3RyaW5nLCBzQ29sdW1uVmFsdWU6IFN0cmluZyB9O1xuXHRcdGlmIChvQ29sRnJvbVRhYmxlU2V0dGluZ3MpIHtcblx0XHRcdC8vIGlmIGNvbHVtbiBpcyBuZWl0aGVyIGluIHRhYmxlIGRlZmluaXRpb24gbm9yIHBlcnNvbmFsaXphdGlvbiwgc2hvdyBvbmx5IHJvdyBzdWJ0aXRsZSB0ZXh0XG5cdFx0XHRpZiAob0NvbEZyb21UYWJsZVNldHRpbmdzLmF2YWlsYWJpbGl0eSA9PT0gXCJIaWRkZW5cIikge1xuXHRcdFx0XHRvQ29sdW1uSW5mby5zQ29sdW1uVmFsdWUgPSB1bmRlZmluZWQ7XG5cdFx0XHRcdG9Db2x1bW5JbmZvLnNDb2x1bW5JbmRpY2F0b3IgPSBcInVuZGVmaW5lZFwiO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9pZiBjb2x1bW4gaXMgaW4gdGFibGUgcGVyc29uYWxpemF0aW9uIGJ1dCBub3QgaW4gdGFibGUgZGVmaW5pdGlvbiwgc2hvdyBDb2x1bW4gKEhpZGRlbikgOiA8Y29sTmFtZT5cblx0XHRcdFx0b0NvbHVtbkluZm8uc0NvbHVtblZhbHVlID0gYCR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXG5cdFx0XHRcdFx0XCJUX01FU1NBR0VfR1JPVVBfREVTQ1JJUFRJT05fVEFCTEVfQ09MVU1OXCJcblx0XHRcdFx0KX0gKCR7b1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJUX0NPTFVNTl9JTkRJQ0FUT1JfSU5fVEFCTEVfREVGSU5JVElPTlwiKX0pOiAke29Db2xGcm9tVGFibGVTZXR0aW5ncy5sYWJlbH1gO1xuXHRcdFx0XHRvQ29sdW1uSW5mby5zQ29sdW1uSW5kaWNhdG9yID0gXCJIaWRkZW5cIjtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0b0NvbHVtbkluZm8uc0NvbHVtblZhbHVlID0gb1Jlc291cmNlQnVuZGxlLmdldFRleHQoXCJUX01FU1NBR0VfSVRFTV9TVUJUSVRMRV9JTkRJQ0FUT1JfVU5LTk9XTlwiKTtcblx0XHRcdG9Db2x1bW5JbmZvLnNDb2x1bW5JbmRpY2F0b3IgPSBcIlVua25vd25cIjtcblx0XHR9XG5cdFx0cmV0dXJuIG9Db2x1bW5JbmZvO1xuXHR9XG5cblx0c2V0Rm9jdXNUb0NvbnRyb2woY29udHJvbD86IFVJNUVsZW1lbnQpIHtcblx0XHRjb25zdCBtZXNzYWdlUG9wb3ZlciA9IHRoaXMub01lc3NhZ2VQb3BvdmVyO1xuXHRcdGlmIChtZXNzYWdlUG9wb3ZlciAmJiBjb250cm9sICYmIGNvbnRyb2wuZm9jdXMpIHtcblx0XHRcdGNvbnN0IGZuRm9jdXMgPSAoKSA9PiB7XG5cdFx0XHRcdGNvbnRyb2wuZm9jdXMoKTtcblx0XHRcdH07XG5cdFx0XHRpZiAoIW1lc3NhZ2VQb3BvdmVyLmlzT3BlbigpKSB7XG5cdFx0XHRcdC8vIHdoZW4gbmF2aWdhdGluZyB0byBwYXJlbnQgcGFnZSB0byBjaGlsZCBwYWdlIChvbiBjbGljayBvZiBtZXNzYWdlKSwgdGhlIGNoaWxkIHBhZ2UgbWlnaHQgaGF2ZSBhIGZvY3VzIGxvZ2ljIHRoYXQgbWlnaHQgdXNlIGEgdGltZW91dC5cblx0XHRcdFx0Ly8gd2UgdXNlIHRoZSBiZWxvdyB0aW1lb3V0cyB0byBvdmVycmlkZSB0aGlzIGZvY3VzIHNvIHRoYXQgd2UgZm9jdXMgb24gdGhlIHRhcmdldCBjb250cm9sIG9mIHRoZSBtZXNzYWdlIGluIHRoZSBjaGlsZCBwYWdlLlxuXHRcdFx0XHRzZXRUaW1lb3V0KGZuRm9jdXMsIDApO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Y29uc3QgZm5PbkNsb3NlID0gKCkgPT4ge1xuXHRcdFx0XHRcdHNldFRpbWVvdXQoZm5Gb2N1cywgMCk7XG5cdFx0XHRcdFx0bWVzc2FnZVBvcG92ZXIuZGV0YWNoRXZlbnQoXCJhZnRlckNsb3NlXCIsIGZuT25DbG9zZSk7XG5cdFx0XHRcdH07XG5cdFx0XHRcdG1lc3NhZ2VQb3BvdmVyLmF0dGFjaEV2ZW50KFwiYWZ0ZXJDbG9zZVwiLCBmbk9uQ2xvc2UpO1xuXHRcdFx0XHRtZXNzYWdlUG9wb3Zlci5jbG9zZSgpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRMb2cud2FybmluZyhcIkZFIFY0IDogTWVzc2FnZUJ1dHRvbiA6IGVsZW1lbnQgZG9lc24ndCBoYXZlIGZvY3VzIG1ldGhvZCBmb3IgZm9jdXNpbmcuXCIpO1xuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBNZXNzYWdlQnV0dG9uO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7O0VBa2pCTyxnQkFBZ0JBLElBQUksRUFBRUMsT0FBTyxFQUFFO0lBQ3JDLElBQUk7TUFDSCxJQUFJQyxNQUFNLEdBQUdGLElBQUksRUFBRTtJQUNwQixDQUFDLENBQUMsT0FBTUcsQ0FBQyxFQUFFO01BQ1YsT0FBT0YsT0FBTyxDQUFDRSxDQUFDLENBQUM7SUFDbEI7SUFDQSxJQUFJRCxNQUFNLElBQUlBLE1BQU0sQ0FBQ0UsSUFBSSxFQUFFO01BQzFCLE9BQU9GLE1BQU0sQ0FBQ0UsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFSCxPQUFPLENBQUM7SUFDcEM7SUFDQSxPQUFPQyxNQUFNO0VBQ2Q7RUFBQztFQUFBO0VBQUE7RUFBQTtFQUFBO0VBQUE7RUFBQSxJQTdoQktHLGFBQWEsV0FEbEJDLGNBQWMsQ0FBQyw2QkFBNkIsQ0FBQyxVQUU1Q0MsV0FBVyxDQUFDO0lBQUVDLElBQUksRUFBRSw2QkFBNkI7SUFBRUMsUUFBUSxFQUFFLElBQUk7SUFBRUMsWUFBWSxFQUFFO0VBQWUsQ0FBQyxDQUFDLFVBR2xHQyxLQUFLLEVBQUU7SUFBQTtJQUFBO01BQUE7TUFBQTtRQUFBO01BQUE7TUFBQTtNQUFBO01BQUE7TUFBQSxNQU1BQyxlQUFlLEdBQUcsRUFBRTtNQUFBLE1BQ3BCQyxpQkFBaUIsR0FBRyxFQUFFO01BQUEsTUFFdEJDLE9BQU8sR0FBRyxFQUFFO01BQUE7SUFBQTtJQUFBO0lBQUEsT0FFcEJDLElBQUksR0FBSixnQkFBTztNQUNOQyxNQUFNLENBQUNDLFNBQVMsQ0FBQ0YsSUFBSSxDQUFDRyxLQUFLLENBQUMsSUFBSSxDQUFDO01BQ2pDO01BQ0EsSUFBSSxDQUFDQyxXQUFXLENBQUMsSUFBSSxDQUFDQyx5QkFBeUIsRUFBRSxJQUFJLENBQUM7TUFDdEQsSUFBSSxDQUFDQyxlQUFlLEdBQUcsSUFBSUMsY0FBYyxFQUFFO01BQzNDLElBQUksQ0FBQ0MsWUFBWSxHQUFHLElBQUksQ0FBQ0YsZUFBZSxDQUFDRyxVQUFVLENBQUMsT0FBTyxDQUFDO01BQzVELElBQUksQ0FBQ0QsWUFBWSxDQUFDRSxZQUFZLENBQUMsSUFBSSxDQUFDQyxlQUFlLEVBQUUsSUFBSSxDQUFDO01BQzFELElBQU1DLGVBQWUsR0FBRyxJQUFJLENBQUNDLEtBQUssRUFBRTtNQUNwQyxJQUFJRCxlQUFlLEVBQUU7UUFDcEIsSUFBSSxDQUFDTixlQUFlLENBQUNRLGFBQWEsQ0FBQyxJQUFLQyxHQUFHLENBQVNDLEVBQUUsQ0FBQ0MsSUFBSSxDQUFDQyxVQUFVLENBQUM7VUFBRUMsR0FBRyxFQUFFLGlCQUFpQjtVQUFFQyxLQUFLLEVBQUVSO1FBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztNQUM5SDs7TUFDQSxJQUFJLENBQUNTLHdCQUF3QixDQUFDLElBQUksQ0FBQ0Msb0JBQW9CLENBQUNDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztNQUNuRSxJQUFJLENBQUNqQixlQUFlLENBQUNrQixzQkFBc0IsQ0FBQyxJQUFJLENBQUNDLGlCQUFpQixDQUFDRixJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDL0U7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQSxPQUpDO0lBQUEsT0FLQWxCLHlCQUF5QixHQUF6QixtQ0FBMEJxQixNQUFpQixFQUFFO01BQzVDLElBQUksQ0FBQ3BCLGVBQWUsQ0FBQ3FCLE1BQU0sQ0FBQ0QsTUFBTSxDQUFDRSxTQUFTLEVBQUUsQ0FBQztJQUNoRDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BUEM7SUFBQSxPQVFNQyxtQkFBbUIsZ0NBQUNDLEtBQVc7TUFBQSxJQUFFO1FBQUEsYUFLbkIsSUFBSTtRQUp2QixJQUFNQyxZQUE2QixHQUFHLEVBQUU7UUFDeEMsSUFBTUMsbUJBQW1CLEdBQUdGLEtBQUssQ0FBQ0csaUJBQWlCLEVBQUU7UUFDckQsSUFBTUMsNEJBQTRCLEdBQUcsVUFBQ0MsSUFBVSxFQUFLO1VBQ3BELElBQU1DLElBQVcsR0FBRyxFQUFFO1VBQ3RCLElBQU1DLFNBQVMsR0FBRyxPQUFLN0IsWUFBWSxDQUFDOEIsV0FBVyxFQUFFLENBQUNDLEdBQUcsQ0FBQyxVQUFVQyxRQUFhLEVBQUU7WUFDOUUsT0FBT0EsUUFBUSxDQUFDQyxTQUFTLEVBQUU7VUFDNUIsQ0FBQyxDQUFDO1VBQ0YsSUFBTUMsWUFBWSxHQUFHUCxJQUFJLENBQUNGLGlCQUFpQixFQUFFO1VBQzdDLElBQUlTLFlBQVksRUFBRTtZQUNqQixJQUFNQyxXQUFXLEdBQUdSLElBQUksQ0FBQ1MsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3hDLE9BQUtDLHNDQUFzQyxDQUFDRixXQUFXLENBQUMsQ0FBQ0csT0FBTyxDQUFDLFVBQVVDLFFBQWEsRUFBRTtjQUN6RkEsUUFBUSxDQUFDQyxjQUFjLEVBQUUsQ0FBQ0YsT0FBTyxDQUFDLFVBQVVHLFdBQWdCLEVBQUU7Z0JBQzdEQSxXQUFXLENBQUNDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQ0osT0FBTyxDQUFDLFVBQVVLLEtBQVUsRUFBRTtrQkFDNUQsSUFBSUEsS0FBSyxDQUFDQyxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRTtvQkFDbEMsS0FBSyxJQUFJQyxDQUFDLEdBQUcsQ0FBQyxFQUFFQSxDQUFDLEdBQUdoQixTQUFTLENBQUNpQixNQUFNLEVBQUVELENBQUMsRUFBRSxFQUFFO3NCQUMxQyxJQUFNRSxXQUFXLEdBQUdKLEtBQUssQ0FBQ0ssYUFBYSxFQUFFO3NCQUN6QyxJQUFJRCxXQUFXLEVBQUU7d0JBQ2hCLElBQU1FLGlCQUFpQixhQUFNZixZQUFZLENBQUNnQixPQUFPLEVBQUUsY0FBSVAsS0FBSyxDQUFDSyxhQUFhLEVBQUUsQ0FBQ0UsT0FBTyxFQUFFLENBQUU7d0JBQ3hGLElBQUlyQixTQUFTLENBQUNnQixDQUFDLENBQUMsQ0FBQ00sTUFBTSxDQUFDQyxPQUFPLENBQUNILGlCQUFpQixDQUFDLEtBQUssQ0FBQyxFQUFFOzBCQUN6RHJCLElBQUksQ0FBQ3lCLElBQUksQ0FBQzs0QkFBRUMsS0FBSyxFQUFFWCxLQUFLOzRCQUFFWSxVQUFVLEVBQUVkOzBCQUFZLENBQUMsQ0FBQzswQkFDcEQ7d0JBQ0Q7c0JBQ0Q7b0JBQ0Q7a0JBQ0Q7Z0JBQ0QsQ0FBQyxDQUFDO2NBQ0gsQ0FBQyxDQUFDO1lBQ0gsQ0FBQyxDQUFDO1VBQ0g7VUFDQSxPQUFPYixJQUFJO1FBQ1osQ0FBQztRQUNEO1FBQ0EsSUFBTTRCLE9BQU8sR0FBRzlCLDRCQUE0QixDQUFDWCxJQUFJLFFBQU0sQ0FBQ08sS0FBSyxDQUFDO1FBQzlEa0MsT0FBTyxDQUFDbEIsT0FBTyxDQUFDLFVBQVVtQixPQUFPLEVBQUU7VUFBQTtVQUNsQyxJQUFNQyxTQUFTLEdBQUdELE9BQU8sQ0FBQ0gsS0FBSztZQUM5QkssV0FBVyxHQUFHRixPQUFPLENBQUNGLFVBQVU7VUFDakMsSUFBSSxDQUFDRyxTQUFTLENBQUNqQyxpQkFBaUIsRUFBRSxJQUFJLDBCQUFBaUMsU0FBUyxDQUFDakMsaUJBQWlCLEVBQUUsMERBQTdCLHNCQUErQnlCLE9BQU8sRUFBRSxPQUFLMUIsbUJBQW1CLGFBQW5CQSxtQkFBbUIsdUJBQW5CQSxtQkFBbUIsQ0FBRTBCLE9BQU8sRUFBRSxHQUFFO1lBQ2xIUyxXQUFXLENBQUNDLGlCQUFpQixDQUFDcEMsbUJBQW1CLENBQUM7WUFDbEQsSUFBSSxDQUFDa0MsU0FBUyxDQUFDVixhQUFhLEVBQUUsQ0FBQ2EsYUFBYSxFQUFFLEVBQUU7Y0FDL0N0QyxZQUFZLENBQUM4QixJQUFJLENBQ2hCLElBQUlTLE9BQU8sQ0FBQyxVQUFVQyxPQUFpQixFQUFFO2dCQUN4Q0wsU0FBUyxDQUFDVixhQUFhLEVBQUUsQ0FBQ2dCLGVBQWUsQ0FBQyxjQUFjLEVBQUUsWUFBWTtrQkFDckVELE9BQU8sRUFBRTtnQkFDVixDQUFDLENBQUM7Y0FDSCxDQUFDLENBQUMsQ0FDRjtZQUNGO1VBQ0Q7UUFDRCxDQUFDLENBQUM7UUFDRixJQUFNRSxzQkFBc0IsR0FBRyxJQUFJSCxPQUFPLENBQUMsVUFBQ0MsT0FBaUIsRUFBSztVQUNqRUcsVUFBVTtZQUFBLElBQWE7Y0FDdEIsT0FBS0MsY0FBYyxFQUFFO2NBQ3JCSixPQUFPLEVBQUU7Y0FBQztZQUNYLENBQUM7Y0FBQTtZQUFBO1VBQUEsR0FBRSxDQUFDLENBQUM7UUFDTixDQUFDLENBQUM7UUFBQyxnQ0FDQztVQUFBLHVCQUNHRCxPQUFPLENBQUNNLEdBQUcsQ0FBQzdDLFlBQVksQ0FBQztZQUMvQkQsS0FBSyxDQUFDK0MsUUFBUSxFQUFFLENBQUNDLGFBQWEsRUFBRTtZQUFDLHVCQUMzQkwsc0JBQXNCO1VBQUE7UUFDN0IsQ0FBQyxjQUFhO1VBQ2JNLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLHlEQUF5RCxDQUFDO1FBQ3JFLENBQUM7UUFBQTtNQUNGLENBQUM7UUFBQTtNQUFBO0lBQUE7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQU5DO0lBQUEsT0FPQW5DLHNDQUFzQyxHQUF0QyxnREFBdUNvQyxpQkFBc0IsRUFBRTtNQUM5RCxPQUFPQSxpQkFBaUIsQ0FBQ0MsV0FBVyxFQUFFLENBQUNDLE1BQU0sQ0FBQyxVQUFVcEMsUUFBYSxFQUFFO1FBQ3RFLE9BQU9BLFFBQVEsQ0FBQ3FDLFVBQVUsRUFBRTtNQUM3QixDQUFDLENBQUM7SUFDSDs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBLE9BSkM7SUFBQSxPQUtBVCxjQUFjLEdBQWQsMEJBQWlCO01BQ2hCLElBQUksQ0FBQ00saUJBQWlCLEdBQUcsSUFBSSxDQUFDSSxvQkFBb0IsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDSixpQkFBaUIsQ0FBQztNQUNoRixJQUFJLENBQUMsSUFBSSxDQUFDQSxpQkFBaUIsRUFBRTtRQUM1QjtNQUNEO01BQ0EsSUFBTTVDLFNBQVMsR0FBRyxJQUFJLENBQUMvQixlQUFlLENBQUNnRixRQUFRLEVBQUU7TUFDakQsSUFBTUMsU0FBUyxHQUFHLElBQUksQ0FBQzFDLHNDQUFzQyxDQUFDLElBQUksQ0FBQ29DLGlCQUFpQixDQUFDO01BQ3JGLElBQU1PLGNBQWMsR0FBRyxJQUFJLENBQUNDLHlCQUF5QixDQUFDcEQsU0FBUyxFQUFFLEtBQUssQ0FBQztNQUN2RSxJQUFJbUQsY0FBYyxFQUFFO1FBQ25CLElBQUksQ0FBQ0UsaUJBQWlCLENBQUNILFNBQVMsQ0FBQztNQUNsQztJQUNEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FQQztJQUFBLE9BUUFJLHdCQUF3QixHQUF4QixrQ0FBeUJDLE1BQVcsRUFBRTtNQUNyQyxJQUFNQyxNQUFNLEdBQUdELE1BQU0sQ0FBQ2YsUUFBUSxDQUFDLFVBQVUsQ0FBQztNQUMxQztNQUNBLElBQUksQ0FBQ2UsTUFBTSxDQUFDM0QsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM2RCxXQUFXLENBQUMsVUFBVSxDQUFDLEVBQUU7UUFDbEVELE1BQU0sQ0FBQ0UsV0FBVyxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUMsRUFBRUgsTUFBTSxDQUFDM0QsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUM7TUFDekU7TUFDQSxJQUFNK0Qsb0JBQW9CLEdBQ3pCSixNQUFNLENBQUMzRCxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsQ0FBQ3lCLE9BQU8sRUFBRSxHQUM5QyxZQUFZLEdBQ1prQyxNQUFNLENBQUMzRCxpQkFBaUIsRUFBRSxDQUFDeUIsT0FBTyxFQUFFLENBQUN1QyxPQUFPLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxHQUN0RCxHQUFHLEdBQ0hMLE1BQU0sQ0FBQ3BDLGFBQWEsRUFBRSxDQUFDRSxPQUFPLEVBQUUsQ0FBQ3VDLE9BQU8sQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDO01BQ25ELElBQU16RCxRQUFRLEdBQUdxRCxNQUFNLENBQUNLLFVBQVUsQ0FBQ0Ysb0JBQW9CLENBQUM7TUFDeEQsSUFBSSxDQUFDeEQsUUFBUSxDQUFDc0QsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQzlCRCxNQUFNLENBQUNFLFdBQVcsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUV2RCxRQUFRLENBQUM7TUFDckM7TUFDQSxPQUFPQSxRQUFRO0lBQ2hCLENBQUM7SUFBQSxPQUVEMkQsb0JBQW9CLEdBQXBCLDhCQUNDQyxnQkFBcUIsRUFDckJDLFNBQWlCLEVBQ2pCQyx1QkFBK0IsRUFDL0JWLE1BQVcsRUFDWFcsY0FBbUIsRUFDbkJDLGNBQXdCLEVBQ3ZCO01BQ0QsSUFBSUMsS0FBSztNQUNULElBQUlELGNBQWMsRUFBRTtRQUNuQkMsS0FBSyxHQUFHO1VBQ1BDLFFBQVEsRUFBRSxhQUFhO1VBQ3ZCQyxpQkFBaUIsRUFBRUwsdUJBQXVCLEdBQUdBLHVCQUF1QixHQUFHO1FBQ3hFLENBQUM7TUFDRixDQUFDLE1BQU07UUFDTkcsS0FBSyxHQUFHO1VBQ1BDLFFBQVEsRUFBRU4sZ0JBQWdCLEdBQUdDLFNBQVMsR0FBRyxFQUFFO1VBQzNDTSxpQkFBaUIsRUFBRUwsdUJBQXVCLEdBQUdBLHVCQUF1QixHQUFHO1FBQ3hFLENBQUM7TUFDRjtNQUNBLElBQU1ULE1BQU0sR0FBR0QsTUFBTSxDQUFDZixRQUFRLENBQUMsVUFBVSxDQUFDO1FBQ3pDckMsUUFBUSxHQUFHLElBQUksQ0FBQ21ELHdCQUF3QixDQUFDQyxNQUFNLENBQUM7TUFDakQ7TUFDQSxJQUFNZ0IsZ0JBQWdCLEdBQUc3RixHQUFHLENBQUNDLEVBQUUsQ0FDN0I2RixPQUFPLEVBQUUsQ0FDVEMsaUJBQWlCLEVBQUUsQ0FDbkJDLGVBQWUsRUFBRSxDQUNqQkMsT0FBTyxFQUFFLENBQ1R6RSxHQUFHLENBQUMsVUFBVTBFLE9BQVksRUFBRTtRQUM1QixPQUFPQSxPQUFPLENBQUNDLEVBQUU7TUFDbEIsQ0FBQyxDQUFDO01BQ0gsSUFBSUMsb0JBQW9CO01BQ3hCLElBQUkzRSxRQUFRLENBQUNzRCxXQUFXLEVBQUUsRUFBRTtRQUMzQnFCLG9CQUFvQixHQUFHQyxNQUFNLENBQUNDLElBQUksQ0FBQzdFLFFBQVEsQ0FBQ3NELFdBQVcsRUFBRSxDQUFDLENBQUNYLE1BQU0sQ0FBQyxVQUFVbUMsaUJBQWlCLEVBQUU7VUFDOUYsT0FBT1YsZ0JBQWdCLENBQUNoRCxPQUFPLENBQUMwRCxpQkFBaUIsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUMxRCxDQUFDLENBQUM7UUFDRkgsb0JBQW9CLENBQUNyRSxPQUFPLENBQUMsVUFBVXlFLFVBQVUsRUFBRTtVQUNsRCxPQUFPL0UsUUFBUSxDQUFDc0QsV0FBVyxFQUFFLENBQUN5QixVQUFVLENBQUM7UUFDMUMsQ0FBQyxDQUFDO01BQ0g7TUFDQTFCLE1BQU0sQ0FBQ0UsV0FBVyxDQUNqQlEsY0FBYyxDQUFDMUYsS0FBSyxFQUFFLEVBQ3RCdUcsTUFBTSxDQUFDSSxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVoRixRQUFRLENBQUNzRCxXQUFXLENBQUNTLGNBQWMsQ0FBQzFGLEtBQUssRUFBRSxDQUFDLEdBQUcyQixRQUFRLENBQUNzRCxXQUFXLENBQUNTLGNBQWMsQ0FBQzFGLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU0RixLQUFLLENBQUMsRUFDMUhqRSxRQUFRLENBQ1I7SUFDRixDQUFDO0lBQUEsT0FFRGlGLDBDQUEwQyxHQUExQyxvREFBMkNDLFVBQWUsRUFBRVQsT0FBWSxFQUFFO01BQUE7TUFDekUsSUFBTVYsY0FBYyxHQUFHVSxPQUFPLENBQUNoRixpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQ1EsU0FBUyxFQUFFO01BQ3ZFLE9BQU9pRixVQUFVLENBQ2Z4RSxZQUFZLENBQUMsSUFBSSxFQUFFLFVBQUNDLEtBQVUsRUFBSztRQUNuQyxPQUFPLE1BQUksQ0FBQ3dFLGdCQUFnQixDQUFDcEIsY0FBYyxDQUFDcUIsYUFBYSxFQUFFLEVBQUV6RSxLQUFLLENBQUM7TUFDcEUsQ0FBQyxDQUFDLENBQ0QwRSxJQUFJLENBQUMsVUFBVUMsQ0FBTSxFQUFFQyxDQUFNLEVBQUU7UUFDL0I7UUFDQTtRQUNBLElBQUlELENBQUMsQ0FBQzFFLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMyRSxDQUFDLENBQUMzRSxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRTtVQUM1RCxPQUFPLENBQUMsQ0FBQztRQUNWO1FBQ0EsT0FBTyxDQUFDO01BQ1QsQ0FBQyxDQUFDO0lBQ0o7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BUUE0RSw2QkFBNkIsR0FBN0IsdUNBQThCZixPQUFZLEVBQUVnQixXQUFtQixFQUFFO01BQ2hFLElBQUksQ0FBQ3BJLGVBQWUsR0FBRyxJQUFJLENBQUNBLGVBQWUsR0FDeEMsSUFBSSxDQUFDQSxlQUFlLEdBQ3BCcUksSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxhQUFhLENBQUMsQ0FBQ0MsT0FBTyxDQUFDLGtEQUFrRCxDQUFDO01BRTNHbkIsT0FBTyxDQUFDb0IsWUFBWSxXQUFJLElBQUksQ0FBQ3hJLGVBQWUsZUFBS29JLFdBQVcsRUFBRztJQUNoRTs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FYQztJQUFBLE9BYUFLLCtCQUErQixHQUEvQix5Q0FDQ3JCLE9BQW9CLEVBQ3BCc0IsT0FBMEIsRUFDMUJiLFVBQWdDLEVBQ2hDYyxTQUFnQixFQUNoQkMsb0JBQTZCLEVBQzdCUixXQUFtQixFQUNsQjtNQUFBO01BQ0QsSUFBSSxDQUFDekgsWUFBWSxDQUFDa0ksWUFBWSxDQUFDLElBQUksQ0FBQy9ILGVBQWUsRUFBRSxJQUFJLENBQUM7TUFDMUQsSUFBTTRGLGNBQWMsNEJBQUdVLE9BQU8sQ0FBQ2hGLGlCQUFpQixDQUFDLFNBQVMsQ0FBQywwREFBcEMsc0JBQXNDUSxTQUFTLEVBQWE7TUFFbkYsSUFBSWtHLFFBQVE7UUFDWC9DLE1BQVc7UUFDWGdELGdCQUFxQjtRQUNyQkMsQ0FBQztRQUNEeEMsU0FBUztRQUNUeUMsZ0JBQWdCO1FBQ2hCdEMsY0FBYztRQUNkdUMsZ0JBQXdCLEdBQUcsRUFBRTtNQUM5QixJQUFNQyxpQkFBaUIsR0FBRyxJQUFJQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUNDLElBQUksQ0FBQzNDLGNBQWMsYUFBZEEsY0FBYyx1QkFBZEEsY0FBYyxDQUFFNEMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDL0VDLGVBQWUsR0FBR2xCLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsYUFBYSxDQUFDO01BRS9ELElBQUlhLGlCQUFpQixFQUFFO1FBQ3RCLEtBQUtILENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR0wsU0FBUyxDQUFDbEYsTUFBTSxFQUFFdUYsQ0FBQyxFQUFFLEVBQUU7VUFDdENGLFFBQVEsR0FBR0gsU0FBUyxDQUFDSyxDQUFDLENBQUM7VUFDdkJDLGdCQUFnQixHQUFHSCxRQUFRO1VBQzNCLElBQUlBLFFBQVEsQ0FBQ3ZGLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSXVGLFFBQVEsQ0FBQ3ZGLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxFQUFFO1lBQ3RFd0YsZ0JBQWdCLEdBQUcsQ0FBQyxDQUFDO1lBQ3JCaEQsTUFBTSxHQUFHK0MsUUFBUSxDQUFDVSxTQUFTLEVBQUU7WUFDN0JULGdCQUFnQixDQUFDVSxXQUFXLEdBQUcxRCxNQUFNLENBQUMyRCxTQUFTLEVBQUU7WUFDakQsSUFBTWhHLFdBQVcsR0FBR3FDLE1BQU0sQ0FBQ3BDLGFBQWEsRUFBRTtZQUMxQyxJQUFJRCxXQUFXLElBQUlBLFdBQVcsQ0FBQ2MsYUFBYSxFQUFFLElBQUl1QixNQUFNLENBQUMzRCxpQkFBaUIsRUFBRSxFQUFFO2NBQzdFMkcsZ0JBQWdCLENBQUN0Qyx1QkFBdUIsR0FBRyxJQUFJLENBQUNrRCxvQkFBb0IsQ0FBQzVELE1BQU0sRUFBRVcsY0FBYyxDQUFDO2NBQzVGLElBQU1rRCxhQUFhLEdBQUcsSUFBSSxDQUFDQyxnQkFBZ0IsQ0FBQzlELE1BQU0sRUFBRWdELGdCQUFnQixDQUFDdEMsdUJBQXVCLENBQUM7Y0FDN0ZzQyxnQkFBZ0IsQ0FBQ2Usd0JBQXdCLEdBQUdoQixRQUFRLENBQUN2RixHQUFHLENBQUMsb0JBQW9CLENBQUMsR0FDM0VHLFdBQVcsQ0FBQ2pCLFdBQVcsRUFBRSxHQUN6QmlCLFdBQVcsQ0FBQ3FHLGtCQUFrQixFQUFFO2NBQ25DaEIsZ0JBQWdCLENBQUNpQixtQkFBbUIsR0FBR0osYUFBYSxDQUFDSSxtQkFBbUI7Y0FDeEVqQixnQkFBZ0IsQ0FBQ2tCLG9CQUFvQixHQUFHbEIsZ0JBQWdCLENBQUN0Qyx1QkFBdUI7Y0FDaEZzQyxnQkFBZ0IsQ0FBQ3RDLHVCQUF1QixHQUFHbUQsYUFBYSxDQUFDbkQsdUJBQXVCO2NBQ2hGc0MsZ0JBQWdCLENBQUN4QyxnQkFBZ0IsR0FBR3dDLGdCQUFnQixDQUFDZSx3QkFBd0IsQ0FBQ0ksSUFBSSxDQUNqRixVQUFVQyxhQUFrQixFQUFFQyxVQUFlLEVBQUU7Z0JBQzlDLE9BQU9BLFVBQVUsSUFBSUQsYUFBYSxDQUFDYixVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQ3ZGLE9BQU8sQ0FBQ3FHLFVBQVUsQ0FBQ3ZHLE9BQU8sRUFBRSxDQUFDLEtBQUssQ0FBQztjQUN2RixDQUFDLENBQUNuQyxJQUFJLENBQUMsSUFBSSxFQUFFZ0YsY0FBYyxDQUFDLENBQzVCO2NBQ0QsSUFBSTJELFVBQVU7Y0FDZCxJQUFJLENBQUN0QixnQkFBZ0IsQ0FBQ3hDLGdCQUFnQixFQUFFO2dCQUN2QzhELFVBQVUsR0FBRzNELGNBQWMsQ0FBQ3FCLGFBQWEsRUFBRSxDQUFDbUMsSUFBSSxDQUMvQyxVQUFxQmpHLEtBQVUsRUFBRXFHLEdBQVcsRUFBRTtrQkFDN0MsT0FBTyxJQUFJLENBQUNDLGlCQUFpQixDQUFDdEcsS0FBSyxFQUFFcUcsR0FBRyxDQUFDO2dCQUMxQyxDQUFDLENBQUM1SSxJQUFJLENBQUMsSUFBSSxFQUFFcUUsTUFBTSxDQUFDLENBQ3BCO2NBQ0Y7Y0FDQSxJQUFJc0UsVUFBVSxFQUFFO2dCQUNmLElBQU1HLFFBQVEsR0FBR25DLElBQUksQ0FBQ29DLElBQUksQ0FBQ0osVUFBVSxDQUFDO2dCQUN0QzFELGNBQWMsR0FBRyxJQUFJLENBQUMrRCwyQkFBMkIsQ0FBQ0YsUUFBUSxDQUFDO2NBQzVEO2NBQ0F0QixnQkFBZ0IsR0FBRyxJQUFJLENBQUN5QixtQkFBbUIsQ0FDMUN2RCxPQUFPLEVBQ1AyQixnQkFBZ0IsQ0FBQ2Usd0JBQXdCLEVBQ3pDZixnQkFBZ0IsQ0FBQ3hDLGdCQUFnQixFQUNqQ3dDLGdCQUFnQixDQUFDaUIsbUJBQW1CLEVBQ3BDVCxlQUFlLEVBQ2Z4RCxNQUFNLEVBQ05ZLGNBQWMsQ0FDZDtjQUNEO2NBQ0FTLE9BQU8sQ0FBQ3dELFdBQVcsQ0FBQzFCLGdCQUFnQixDQUFDO2NBQ3JDOUIsT0FBTyxDQUFDeUQsY0FBYyxDQUFDLENBQUMsQ0FBQzlCLGdCQUFnQixDQUFDeEMsZ0JBQWdCLENBQUM7Y0FFM0QsSUFBSXdDLGdCQUFnQixDQUFDeEMsZ0JBQWdCLEVBQUU7Z0JBQ3RDLElBQUksQ0FBQ3VFLHlCQUF5QixDQUM3QjFELE9BQU8sRUFDUDJCLGdCQUFnQixDQUFDeEMsZ0JBQWdCLEVBQ2pDd0MsZ0JBQWdCLENBQUNpQixtQkFBbUIsRUFDcENULGVBQWUsRUFDZnhELE1BQU0sQ0FDTjtjQUNGO2NBQ0FTLFNBQVMsR0FBR3VDLGdCQUFnQixDQUFDeEMsZ0JBQWdCLElBQUl3QyxnQkFBZ0IsQ0FBQ3hDLGdCQUFnQixDQUFDd0UsUUFBUSxFQUFFO2NBQzdGLElBQUksQ0FBQ3pFLG9CQUFvQixDQUN4QnlDLGdCQUFnQixDQUFDeEMsZ0JBQWdCLEVBQ2pDQyxTQUFTLEVBQ1R1QyxnQkFBZ0IsQ0FBQ3RDLHVCQUF1QixFQUN4Q1YsTUFBTSxFQUNOVyxjQUFjLENBQ2Q7WUFDRjtVQUNELENBQUMsTUFBTTtZQUNOVSxPQUFPLENBQUN5RCxjQUFjLENBQUMsSUFBSSxDQUFDO1lBQzVCO1lBQ0EsSUFBTUcsd0JBQXdCLEdBQUcsSUFBSSxDQUFDQyxpQkFBaUIsQ0FBQ2hDLGdCQUFnQixFQUFFTixTQUFTLENBQUM7WUFDcEYsSUFBSXFDLHdCQUF3QixFQUFFO2NBQzdCO2NBQ0E1RCxPQUFPLENBQUN3RCxXQUFXLENBQUMxQixnQkFBZ0IsQ0FBQztjQUNyQztZQUNEO1VBQ0Q7UUFDRDtNQUNELENBQUMsTUFBTTtRQUNOO1FBQ0FELGdCQUFnQixHQUFHTixTQUFTLENBQUMsQ0FBQyxDQUFDO1FBQy9CNUMsTUFBTSxHQUFHLElBQUksQ0FBQ21GLFlBQVksQ0FBQ2pDLGdCQUFnQixDQUFDO1FBQzVDLElBQUlsRCxNQUFNLEVBQUU7VUFDWGdELGdCQUFnQixHQUFHLENBQUMsQ0FBQztVQUNyQkEsZ0JBQWdCLENBQUNVLFdBQVcsR0FBRzFELE1BQU0sQ0FBQzJELFNBQVMsRUFBRTtVQUNqRCxJQUFNeUIsa0JBQWtCLEdBQUcsSUFBSSxDQUFDQyxvQkFBb0IsQ0FBQ25DLGdCQUFnQixDQUFDO1VBQ3RFRixnQkFBZ0IsQ0FBQ3RDLHVCQUF1QixHQUN2QzBFLGtCQUFrQixHQUFHLENBQUMsQ0FBQyxHQUFHcEYsTUFBTSxDQUFDc0YsVUFBVSxFQUFFLENBQUNGLGtCQUFrQixDQUFDLENBQUNHLGVBQWUsRUFBRSxHQUFHQyxTQUFTO1VBQ2hHeEMsZ0JBQWdCLENBQUNrQixvQkFBb0IsR0FBR2xCLGdCQUFnQixDQUFDdEMsdUJBQXVCO1VBQ2hGc0MsZ0JBQWdCLENBQUNpQixtQkFBbUIsR0FDbkNqQixnQkFBZ0IsQ0FBQ3RDLHVCQUF1QixJQUFJMEUsa0JBQWtCLEdBQUcsQ0FBQyxDQUFDLEdBQ2hFcEYsTUFBTSxDQUFDc0YsVUFBVSxFQUFFLENBQUNGLGtCQUFrQixDQUFDLENBQUN6QixTQUFTLEVBQUUsR0FDbkQ2QixTQUFTO1VBQ2I1RSxjQUFjLEdBQUcsSUFBSSxDQUFDNkUsWUFBWSxDQUFDdkMsZ0JBQWdCLENBQUMsQ0FBQzFGLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQztVQUNwRixJQUFJLENBQUNvRCxjQUFjLEVBQUU7WUFDcEJILFNBQVMsR0FBRyxJQUFJLENBQUNpRixpQkFBaUIsQ0FBQ3hDLGdCQUFnQixDQUFDO1lBQ3BERixnQkFBZ0IsQ0FBQ2Usd0JBQXdCLEdBQUcvRCxNQUFNLENBQUNwQyxhQUFhLEVBQUUsQ0FBQ29HLGtCQUFrQixFQUFFO1lBQ3ZGaEIsZ0JBQWdCLENBQUN4QyxnQkFBZ0IsR0FBR3dDLGdCQUFnQixDQUFDZSx3QkFBd0IsQ0FBQ3RELFNBQVMsQ0FBQztVQUN6RjtVQUNBMEMsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDeUIsbUJBQW1CLENBQzFDdkQsT0FBTyxFQUNQMkIsZ0JBQWdCLENBQUNlLHdCQUF3QixFQUN6Q2YsZ0JBQWdCLENBQUN4QyxnQkFBZ0IsRUFDakN3QyxnQkFBZ0IsQ0FBQ2lCLG1CQUFtQixFQUNwQ1QsZUFBZSxFQUNmeEQsTUFBTSxFQUNOWSxjQUFjLEVBQ2R3RSxrQkFBa0IsS0FBSyxDQUFDLElBQUlsQyxnQkFBZ0IsQ0FBQ3lDLGFBQWEsRUFBRSxLQUFLLE9BQU8sR0FBR3pDLGdCQUFnQixHQUFHc0MsU0FBUyxDQUN2RztVQUNEO1VBQ0FuRSxPQUFPLENBQUN3RCxXQUFXLENBQUMxQixnQkFBZ0IsQ0FBQztVQUNyQzlCLE9BQU8sQ0FBQ3lELGNBQWMsQ0FBQyxJQUFJLENBQUM7VUFFNUIsSUFBSSxDQUFDdkUsb0JBQW9CLENBQ3hCeUMsZ0JBQWdCLENBQUN4QyxnQkFBZ0IsRUFDakNDLFNBQVMsRUFDVHVDLGdCQUFnQixDQUFDdEMsdUJBQXVCLEVBQ3hDVixNQUFNLEVBQ05XLGNBQWMsRUFDZEMsY0FBYyxDQUNkO1FBQ0Y7TUFDRDtNQUNBLElBQUlELGNBQWMsQ0FBQ2lGLGFBQWEsRUFBRSxJQUFJdkQsV0FBVyxFQUFFO1FBQ2xELElBQUksQ0FBQ0QsNkJBQTZCLENBQUNmLE9BQU8sRUFBRWdCLFdBQVcsQ0FBQztNQUN6RCxDQUFDLE1BQU07UUFDTmhCLE9BQU8sQ0FBQ29CLFlBQVksQ0FDbkJFLE9BQU8sQ0FBQ2tELFFBQVEsRUFBRSxJQUNoQi9ELFVBQVUsQ0FBQytELFFBQVEsRUFBRSxJQUFJaEQsb0JBQW9CLGVBQVFmLFVBQVUsQ0FBQytELFFBQVEsRUFBRSxJQUFLLEVBQUUsQ0FBQyxJQUNsRjdDLGdCQUFnQixlQUNUUSxlQUFlLENBQUNoQixPQUFPLENBQUMseUNBQXlDLENBQUMsZUFBS1EsZ0JBQWdCLENBQUNVLFdBQVcsSUFDeEcsRUFBRSxDQUFDLENBQ1A7UUFDRCxJQUFNdkosT0FBTyxHQUFHLElBQUksQ0FBQzJMLFVBQVUsQ0FBQyxJQUFJLENBQUM3SyxLQUFLLEVBQUUsQ0FBQztRQUM3QyxJQUFNaUIsS0FBSyxHQUFHb0csSUFBSSxDQUFDb0MsSUFBSSxDQUFDdkssT0FBTyxDQUFXO1FBQzFDLElBQU00TCxzQkFBc0IsR0FBR3BGLGNBQWMsQ0FBQzRDLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJNUMsY0FBYyxDQUFDNEMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUN5QyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUNDLEdBQUcsRUFBRTtRQUNoSCxJQUFNQyxRQUFRLEdBQUdoSyxLQUFLLGFBQUxBLEtBQUssdUJBQUxBLEtBQUssQ0FBRStDLFFBQVEsQ0FBQyxVQUFVLENBQWM7UUFDekQsSUFDQ2lILFFBQVEsSUFDUkEsUUFBUSxDQUFDaEcsV0FBVyxDQUFDLHdCQUF3QixDQUFDLElBQzlDNkYsc0JBQXNCLElBQ3RCQSxzQkFBc0IsS0FBS0csUUFBUSxDQUFDaEcsV0FBVyxDQUFDLHdCQUF3QixDQUFDLEVBQ3hFO1VBQ0QsSUFBSSxDQUFDeEYsZUFBZSxDQUFDeUwsb0JBQW9CLENBQUM7WUFBRSxNQUFNLEVBQUU5RTtVQUFRLENBQUMsQ0FBQztVQUM5RDZFLFFBQVEsQ0FBQy9GLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRSxLQUFLLENBQUM7UUFDdEQ7TUFDRDtNQUNBLElBQUksQ0FBQ3ZGLFlBQVksQ0FBQ0UsWUFBWSxDQUFDLElBQUksQ0FBQ0MsZUFBZSxFQUFFLElBQUksQ0FBQztNQUMxRCxPQUFPbUksZ0JBQWdCO0lBQ3hCLENBQUM7SUFBQSxPQUVEckQseUJBQXlCLEdBQXpCLG1DQUEwQnBELFNBQWdCLEVBQUVtRCxjQUF1QixFQUFFO01BQ3BFLElBQUkrQyxPQUFPLEVBQUV5RCxZQUFZLEVBQUUvRSxPQUFPLEVBQUU1RCxDQUFDLEVBQUU0SSxDQUFDLEVBQUVDLENBQUM7TUFFM0MsSUFBSSxDQUFDcE0saUJBQWlCLEdBQUcsSUFBSSxDQUFDQSxpQkFBaUIsR0FDNUMsSUFBSSxDQUFDQSxpQkFBaUIsR0FDdEJvSSxJQUFJLENBQUNDLHdCQUF3QixDQUFDLGFBQWEsQ0FBQyxDQUFDQyxPQUFPLENBQUMsOENBQThDLENBQUM7TUFDdkc7TUFDQSxJQUFNK0QsZ0JBQWdCLEdBQUcsSUFBSSxDQUFDdEosc0NBQXNDLENBQUMsSUFBSSxDQUFDb0MsaUJBQWlCLENBQUM7TUFDNUYsSUFBSWtILGdCQUFnQixFQUFFO1FBQUE7UUFDckIsSUFBTUMsTUFBTSxHQUFHLElBQUksQ0FBQ1YsVUFBVSxDQUFDLElBQUksQ0FBQzdLLEtBQUssRUFBRSxDQUFDO1FBQzVDLElBQU1pQixLQUFLLEdBQUdvRyxJQUFJLENBQUNvQyxJQUFJLENBQUM4QixNQUFNLENBQUM7UUFDL0IsSUFBTW5FLFdBQVcsR0FBR25HLEtBQUssYUFBTEEsS0FBSyxnREFBTEEsS0FBSyxDQUFFRyxpQkFBaUIsQ0FBQyxVQUFVLENBQUMsMERBQXBDLHNCQUFzQzZELFdBQVcsQ0FBQyxhQUFhLENBQUM7UUFDcEYsSUFBSW1DLFdBQVcsRUFBRTtVQUNoQixDQUFDbkcsS0FBSyxhQUFMQSxLQUFLLHVCQUFMQSxLQUFLLENBQUVHLGlCQUFpQixDQUFDLFVBQVUsQ0FBQyxFQUFTOEQsV0FBVyxDQUFDLGFBQWEsRUFBRSxJQUFJLENBQUM7UUFDL0U7UUFDQSxLQUFLMUMsQ0FBQyxHQUFHaEIsU0FBUyxDQUFDaUIsTUFBTSxHQUFHLENBQUMsRUFBRUQsQ0FBQyxJQUFJLENBQUMsRUFBRSxFQUFFQSxDQUFDLEVBQUU7VUFDM0M7VUFDQTRELE9BQU8sR0FBRzVFLFNBQVMsQ0FBQ2dCLENBQUMsQ0FBQztVQUN0QixJQUFJZ0osbUJBQW1CLEdBQUcsSUFBSTtVQUM5QixLQUFLSixDQUFDLEdBQUdFLGdCQUFnQixDQUFDN0ksTUFBTSxHQUFHLENBQUMsRUFBRTJJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRUEsQ0FBQyxFQUFFO1lBQ2xEO1lBQ0ExRCxPQUFPLEdBQUc0RCxnQkFBZ0IsQ0FBQ0YsQ0FBQyxDQUFDO1lBQzdCRCxZQUFZLEdBQUd6RCxPQUFPLENBQUN2RixjQUFjLEVBQUU7WUFDdkMsS0FBS2tKLENBQUMsR0FBR0YsWUFBWSxDQUFDMUksTUFBTSxHQUFHLENBQUMsRUFBRTRJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRUEsQ0FBQyxFQUFFO2NBQzlDO2NBQ0EsSUFBTXhFLFVBQVUsR0FBR3NFLFlBQVksQ0FBQ0UsQ0FBQyxDQUFDO2NBQ2xDLElBQU1JLFNBQVMsR0FBRyxJQUFJLENBQUM3RSwwQ0FBMEMsQ0FBQ0MsVUFBVSxFQUFFVCxPQUFPLENBQUM7Y0FDdEYsSUFBSXFGLFNBQVMsQ0FBQ2hKLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ3pCLElBQU13RixnQkFBZ0IsR0FBRyxJQUFJLENBQUNSLCtCQUErQixDQUM1RHJCLE9BQU8sRUFDUHNCLE9BQU8sRUFDUGIsVUFBVSxFQUNWNEUsU0FBUyxFQUNUTixZQUFZLENBQUMxSSxNQUFNLEdBQUcsQ0FBQyxFQUN2QjJFLFdBQVcsQ0FDWDtnQkFDRDtnQkFDQTtnQkFDQSxJQUFJYSxnQkFBZ0IsSUFBSSxDQUFDQSxnQkFBZ0IsQ0FBQzFGLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDMEYsZ0JBQWdCLENBQUMxRixHQUFHLENBQUMsb0JBQW9CLENBQUMsRUFBRTtrQkFDNUc2SSxDQUFDLEdBQUdDLENBQUMsR0FBRyxDQUFDLENBQUM7Z0JBQ1g7Z0JBQ0FHLG1CQUFtQixHQUFHLEtBQUs7Y0FDNUI7WUFDRDtVQUNEO1VBQ0EsSUFBSUEsbUJBQW1CLEVBQUU7WUFDeEIsSUFBTTlGLGNBQWMsR0FBR1UsT0FBTyxDQUFDaEYsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUNRLFNBQVMsRUFBRTtZQUN2RXdFLE9BQU8sQ0FBQ3lELGNBQWMsQ0FBQyxLQUFLLENBQUM7WUFDN0IsSUFBSW5FLGNBQWMsQ0FBQ2dHLFVBQVUsSUFBSXRFLFdBQVcsRUFBRTtjQUM3QyxJQUFJLENBQUNELDZCQUE2QixDQUFDZixPQUFPLEVBQUVnQixXQUFXLENBQUM7WUFDekQsQ0FBQyxNQUFNO2NBQ05oQixPQUFPLENBQUNvQixZQUFZLENBQUMsSUFBSSxDQUFDdkksaUJBQWlCLENBQUM7WUFDN0M7VUFDRDtVQUNBLElBQUksQ0FBQzBGLGNBQWMsSUFBSXlCLE9BQU8sQ0FBQ3VGLFlBQVksRUFBRSxLQUFLLElBQUksQ0FBQzFNLGlCQUFpQixJQUFJLElBQUksQ0FBQzJNLHFCQUFxQixDQUFDeEYsT0FBTyxDQUFDLEVBQUU7WUFDaEgsT0FBTyxJQUFJO1VBQ1o7UUFDRDtNQUNEO0lBQ0QsQ0FBQztJQUFBLE9BRUR3RixxQkFBcUIsR0FBckIsK0JBQXNCeEYsT0FBWSxFQUFFO01BQ25DLElBQU0rQyxhQUFhLEdBQUcvQyxPQUFPLENBQUNoRixpQkFBaUIsQ0FBQyxTQUFTLENBQUMsSUFBSWdGLE9BQU8sQ0FBQ2hGLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDUSxTQUFTLEVBQUU7TUFDOUcsSUFBSXVILGFBQWEsSUFBSUEsYUFBYSxDQUFDckcsTUFBTSxFQUFFO1FBQzFDLElBQU0rSSxVQUFVLEdBQ2QsSUFBSSxDQUFDekgsaUJBQWlCLElBQUksSUFBSSxDQUFDQSxpQkFBaUIsQ0FBQ0osUUFBUSxFQUFFLElBQUksSUFBSSxDQUFDSSxpQkFBaUIsQ0FBQ0osUUFBUSxFQUFFLENBQUM4SCxZQUFZLEVBQUU7VUFDaEhDLFdBQVcsR0FBR0YsVUFBVSxJQUFJQSxVQUFVLENBQUNHLFdBQVcsQ0FBQzdDLGFBQWEsQ0FBQ3JHLE1BQU0sQ0FBQztVQUN4RW1KLG9CQUFvQixHQUFHSixVQUFVLElBQUlBLFVBQVUsQ0FBQ2pLLFNBQVMsQ0FBQ21LLFdBQVcsQ0FBQztRQUN2RSxJQUFJRSxvQkFBb0IsSUFBSUEsb0JBQW9CLENBQUNDLEtBQUssS0FBSyxVQUFVLEVBQUU7VUFDdEUsT0FBTyxJQUFJO1FBQ1o7TUFDRDtJQUNELENBQUM7SUFBQSxPQUVEckgsaUJBQWlCLEdBQWpCLDJCQUFrQkgsU0FBZ0IsRUFBRTtNQUNuQyxJQUFJeUgsYUFBYSxDQUFDQyxTQUFTLENBQUNDLE1BQU0sQ0FBQ0MsUUFBUSxDQUFDQyxNQUFNLENBQUMsQ0FBQ0MsR0FBRyxDQUFDLDJCQUEyQixDQUFDLEVBQUU7UUFDckY7TUFDRDtNQUNBLEtBQUssSUFBSUMsUUFBUSxHQUFHLENBQUMsRUFBRUEsUUFBUSxHQUFHL0gsU0FBUyxDQUFDakMsTUFBTSxFQUFFZ0ssUUFBUSxFQUFFLEVBQUU7UUFDL0QsSUFBTXZLLFFBQVEsR0FBR3dDLFNBQVMsQ0FBQytILFFBQVEsQ0FBQztRQUNwQyxJQUFJQyx5QkFBeUIsR0FBRyxLQUFLO1FBQ3JDLElBQU12QixZQUFZLEdBQUdqSixRQUFRLENBQUNDLGNBQWMsRUFBRTtRQUM5QyxLQUFLLElBQUl3SyxXQUFXLEdBQUcsQ0FBQyxFQUFFQSxXQUFXLEdBQUd4QixZQUFZLENBQUMxSSxNQUFNLEVBQUVrSyxXQUFXLEVBQUUsRUFBRTtVQUMzRSxJQUFNdkssV0FBVyxHQUFHK0ksWUFBWSxDQUFDd0IsV0FBVyxDQUFDO1VBQzdDLElBQU1DLFVBQVUsR0FBR3hLLFdBQVcsQ0FBQ3lLLFNBQVMsRUFBRTtVQUMxQyxJQUFJRCxVQUFVLEVBQUU7WUFDZixLQUFLLElBQUlFLEtBQUssR0FBRyxDQUFDLEVBQUVBLEtBQUssR0FBRzFLLFdBQVcsQ0FBQ3lLLFNBQVMsRUFBRSxDQUFDcEssTUFBTSxFQUFFcUssS0FBSyxFQUFFLEVBQUU7Y0FDcEUsSUFBSUYsVUFBVSxDQUFDRSxLQUFLLENBQUMsQ0FBQy9LLFVBQVUsSUFBSSxDQUFDNkssVUFBVSxDQUFDRSxLQUFLLENBQUMsQ0FBQy9LLFVBQVUsRUFBRSxDQUFDUSxHQUFHLENBQUMsOEJBQThCLENBQUMsRUFBRTtnQkFDeEdtSyx5QkFBeUIsR0FBRyxJQUFJO2dCQUNoQztjQUNEO1lBQ0Q7WUFDQSxJQUFJQSx5QkFBeUIsRUFBRTtjQUM5QnRLLFdBQVcsQ0FBQ21CLGlCQUFpQixDQUFDZ0gsU0FBUyxDQUFDO1lBQ3pDO1VBQ0Q7VUFDQSxJQUFJbkksV0FBVyxDQUFDaEIsaUJBQWlCLEVBQUUsRUFBRTtZQUNwQyxJQUFJLENBQUMyTCwrQkFBK0IsRUFBRTtZQUN0QzNLLFdBQVcsQ0FBQ2hCLGlCQUFpQixFQUFFLENBQUN4QixVQUFVLEVBQUUsQ0FBQ29OLGtCQUFrQixDQUFDLElBQUksQ0FBQ0QsK0JBQStCLENBQUM7VUFDdEc7UUFDRDtNQUNEO0lBQ0QsQ0FBQztJQUFBLE9BRURBLCtCQUErQixHQUEvQiwyQ0FBa0M7TUFDakMsSUFBTXZMLFNBQVMsR0FBRyxJQUFJLENBQUMvQixlQUFlLENBQUNnRixRQUFRLEVBQUU7TUFDakQsSUFBSSxDQUFDRyx5QkFBeUIsQ0FBQ3BELFNBQVMsRUFBRSxJQUFJLENBQUM7SUFDaEQ7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BcUosVUFBVSxHQUFWLG9CQUFXeEIsVUFBa0IsRUFBRTtNQUM5QixJQUFJbkssT0FBTztRQUNWc0ssUUFBUSxHQUFHbkMsSUFBSSxDQUFDb0MsSUFBSSxDQUFDSixVQUFVLENBQVE7TUFDeEMsT0FBT0csUUFBUSxFQUFFO1FBQ2hCLElBQUlBLFFBQVEsWUFBWXlELElBQUksRUFBRTtVQUM3Qi9OLE9BQU8sR0FBR3NLLFFBQVEsQ0FBQ3hKLEtBQUssRUFBRTtVQUMxQjtRQUNEO1FBQ0F3SixRQUFRLEdBQUdBLFFBQVEsQ0FBQ2hCLFNBQVMsRUFBRTtNQUNoQztNQUNBLE9BQU90SixPQUFPO0lBQ2YsQ0FBQztJQUFBLE9BRURnTywwQkFBMEIsR0FBMUIsb0NBQTJCQywwQkFBa0MsRUFBRUMsZUFBb0IsRUFBRTtNQUNwRixJQUFJLENBQUMzTixlQUFlLENBQUM0TiwwQkFBMEIsQ0FBQyxVQUFVQyxNQUFXLEVBQUU7UUFDdEU7UUFDQSxJQUFNQyxlQUFlLEdBQUdKLDBCQUEwQjtRQUNsRDtRQUNBO1FBQ0E7UUFDQTtRQUNBLElBQU1LLFlBQVksR0FBR0YsTUFBTSxDQUFDRyxJQUFJLENBQUNDLGNBQWMsRUFBRTtRQUNqRCxJQUFJRixZQUFZLEVBQUU7VUFDakJHLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDO1lBQ1hoUCxJQUFJLEVBQUUsS0FBSztZQUNYaVAsR0FBRyxFQUFFTCxZQUFZO1lBQ2pCTSxPQUFPLEVBQUUsVUFBVUMsSUFBSSxFQUFFO2NBQ3hCLElBQU1DLGNBQWMsR0FBR1osZUFBZSxDQUFDYSxXQUFXLEVBQUUsR0FBR0YsSUFBSTtjQUMzRFQsTUFBTSxDQUFDRyxJQUFJLENBQUNTLGNBQWMsV0FBSVgsZUFBZSxTQUFHUyxjQUFjLEVBQUc7Y0FDakVWLE1BQU0sQ0FBQ2EsT0FBTyxDQUFDekssT0FBTyxFQUFFO1lBQ3pCLENBQUM7WUFDRFMsS0FBSyxFQUFFLFlBQVk7Y0FDbEJtSixNQUFNLENBQUNHLElBQUksQ0FBQ1MsY0FBYyxDQUFDZiwwQkFBMEIsQ0FBQztjQUN0RCxJQUFNaUIsTUFBTSwyREFBb0RaLFlBQVksQ0FBRTtjQUM5RXRKLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDaUssTUFBTSxDQUFDO2NBQ2pCZCxNQUFNLENBQUNhLE9BQU8sQ0FBQ0UsTUFBTSxDQUFDRCxNQUFNLENBQUM7WUFDOUI7VUFDRCxDQUFDLENBQUM7UUFDSDtNQUNELENBQUMsQ0FBQztJQUNILENBQUM7SUFBQSxPQUVEdEUseUJBQXlCLEdBQXpCLG1DQUNDMUQsT0FBWSxFQUNaYixnQkFBcUIsRUFDckJ5RCxtQkFBMkIsRUFDM0JULGVBQStCLEVBQy9CeEQsTUFBVyxFQUNWO01BQ0QsSUFBTXVKLHNCQUFzQixHQUFHdkosTUFBTSxDQUFDeUQsU0FBUyxFQUFFLENBQUMrRixtQkFBbUIsRUFBRTtNQUN2RSxJQUFJQyxXQUFXLEdBQUcsRUFBRTtNQUNwQixJQUFNQyxxQkFBcUIsR0FBRyxJQUFJLENBQUNDLGdCQUFnQixDQUFDdEksT0FBTyxFQUFFckIsTUFBTSxDQUFDO01BQ3BFLElBQUlpRSxtQkFBbUIsRUFBRTtRQUN4QjtRQUNBd0YsV0FBVyxhQUFNakcsZUFBZSxDQUFDaEIsT0FBTyxDQUFDLDBDQUEwQyxDQUFDLGVBQUt5QixtQkFBbUIsQ0FBRTtNQUMvRyxDQUFDLE1BQU0sSUFBSXlGLHFCQUFxQixFQUFFO1FBQ2pDLElBQUlBLHFCQUFxQixDQUFDRSxZQUFZLEtBQUssUUFBUSxFQUFFO1VBQ3BEO1VBQ0EsSUFBSXZJLE9BQU8sQ0FBQ3dJLE9BQU8sRUFBRSxLQUFLLE9BQU8sRUFBRTtZQUNsQ0osV0FBVyxHQUFHRixzQkFBc0IsR0FDakMsVUFBRy9GLGVBQWUsQ0FBQ2hCLE9BQU8sQ0FBQyw0Q0FBNEMsQ0FBQyxjQUFJaEMsZ0JBQWdCLENBQUNzSixRQUFRLENBQ3JHUCxzQkFBc0IsQ0FDckIsSUFBSyxHQUFHLEdBQ1QsVUFBRy9GLGVBQWUsQ0FBQ2hCLE9BQU8sQ0FBQyw0Q0FBNEMsQ0FBQyxJQUFLLEdBQUc7VUFDcEYsQ0FBQyxNQUFNO1lBQ05pSCxXQUFXLEdBQUdGLHNCQUFzQixHQUNqQyxVQUFHL0YsZUFBZSxDQUFDaEIsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLGNBQUloQyxnQkFBZ0IsQ0FBQ3NKLFFBQVEsQ0FDL0ZQLHNCQUFzQixDQUNyQixJQUFLLEdBQUcsR0FDVCxVQUFHL0YsZUFBZSxDQUFDaEIsT0FBTyxDQUFDLHNDQUFzQyxDQUFDLElBQUssR0FBRztVQUM5RTtRQUNELENBQUMsTUFBTTtVQUNOO1VBQ0E7VUFDQSxJQUFJLENBQUMsSUFBSSxDQUFDdUgscUJBQXFCLENBQUMvSixNQUFNLENBQUMsRUFBRTtZQUN4Q3FCLE9BQU8sQ0FBQ3lELGNBQWMsQ0FBQyxLQUFLLENBQUM7VUFDOUI7VUFDQTJFLFdBQVcsYUFBTWpHLGVBQWUsQ0FBQ2hCLE9BQU8sQ0FBQywwQ0FBMEMsQ0FBQyxlQUNuRmtILHFCQUFxQixDQUFDTSxLQUFLLGVBQ3ZCeEcsZUFBZSxDQUFDaEIsT0FBTyxDQUFDLHdDQUF3QyxDQUFDLE1BQUc7UUFDMUU7TUFDRDtNQUNBLElBQU15SCxvQkFBb0IsR0FBRyxJQUFJQyxhQUFhLENBQUM7UUFDOUNDLFFBQVEsZ0NBQXlCM0csZUFBZSxDQUFDaEIsT0FBTyxDQUFDLHlCQUF5QixDQUFDO01BQ3BGLENBQUMsQ0FBQztNQUNGLElBQUk0SCxrQkFBMEI7TUFDOUIsSUFBSWIsc0JBQXNCLEVBQUU7UUFDM0JhLGtCQUFrQixhQUFNSCxvQkFBb0IsQ0FBQ2YsV0FBVyxFQUFFLGlCQUFPMUYsZUFBZSxDQUFDaEIsT0FBTyxDQUN2Rix5Q0FBeUMsQ0FDekMsZUFBS3hDLE1BQU0sQ0FBQzJELFNBQVMsRUFBRSxpQkFBT0gsZUFBZSxDQUFDaEIsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLGVBQUtoQyxnQkFBZ0IsQ0FBQ3NKLFFBQVEsQ0FDNUhQLHNCQUFzQixDQUN0QixpQkFBT0UsV0FBVyxTQUFNO01BQzFCLENBQUMsTUFBTSxJQUFJQSxXQUFXLElBQUksRUFBRSxJQUFJLENBQUNBLFdBQVcsRUFBRTtRQUM3Q1csa0JBQWtCLEdBQUcsRUFBRTtNQUN4QixDQUFDLE1BQU07UUFDTkEsa0JBQWtCLGFBQU1ILG9CQUFvQixDQUFDZixXQUFXLEVBQUUsaUJBQU8xRixlQUFlLENBQUNoQixPQUFPLENBQ3ZGLHlDQUF5QyxDQUN6QyxlQUFLeEMsTUFBTSxDQUFDMkQsU0FBUyxFQUFFLGlCQUFPOEYsV0FBVyxTQUFNO01BQ2pEO01BRUEsSUFBTXBCLGVBQWUsR0FBRyxJQUFJNkIsYUFBYSxDQUFDO1FBQ3pDQyxRQUFRLGdDQUF5QjNHLGVBQWUsQ0FBQ2hCLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQztNQUM5RSxDQUFDLENBQUM7TUFDRjtNQUNBLElBQU02SCxxQkFBcUIsR0FBR2hKLE9BQU8sQ0FBQ2hGLGlCQUFpQixDQUFDLFNBQVMsQ0FBQyxDQUFDUSxTQUFTLEVBQUUsQ0FBQ3lOLFdBQVc7TUFDMUY7TUFDQWpKLE9BQU8sQ0FBQzhILGNBQWMsQ0FBQyxJQUFJLENBQUM7TUFDNUIsSUFBSUYsY0FBYyxHQUFHLEVBQUU7TUFDdkIsSUFBSWIsMEJBQTBCLEdBQUcsRUFBRTtNQUNuQyxJQUFJL0csT0FBTyxDQUFDc0gsY0FBYyxFQUFFLEVBQUU7UUFDN0JQLDBCQUEwQixhQUFNZ0Msa0JBQWtCLFNBQU07UUFDeEQsSUFBSSxDQUFDakMsMEJBQTBCLENBQUNDLDBCQUEwQixFQUFFQyxlQUFlLENBQUM7TUFDN0UsQ0FBQyxNQUFNLElBQUlnQyxxQkFBcUIsRUFBRTtRQUNqQ3BCLGNBQWMsYUFBTVosZUFBZSxDQUFDYSxXQUFXLEVBQUUsaUJBQU9tQixxQkFBcUIsQ0FBRTtRQUMvRWpDLDBCQUEwQixhQUFNZ0Msa0JBQWtCLGlCQUFPbkIsY0FBYyxDQUFFO1FBQ3pFNUgsT0FBTyxDQUFDOEgsY0FBYyxDQUFDZiwwQkFBMEIsQ0FBQztNQUNuRCxDQUFDLE1BQU07UUFDTi9HLE9BQU8sQ0FBQzhILGNBQWMsQ0FBQ2lCLGtCQUFrQixDQUFDO01BQzNDO0lBQ0Q7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BT0FyUCxlQUFlLEdBQWYsMkJBQWtCO01BQUEsYUFLSCxJQUFJO01BSmxCd1AsWUFBWSxDQUFDLElBQUksQ0FBQ0Msc0JBQXNCLENBQUM7TUFFekMsSUFBSSxDQUFDQSxzQkFBc0IsR0FBRzFMLFVBQVU7UUFBQSxJQUFhO1VBQ3BELElBQU0yTCxLQUFLLEdBQUcsRUFBRTtZQUNmQyxTQUFTLEdBQUcsT0FBS2hRLGVBQWUsQ0FBQ2dGLFFBQVEsRUFBRTtZQUMzQ2lMLGFBQWtCLEdBQUc7Y0FBRUMsS0FBSyxFQUFFLENBQUM7Y0FBRUMsT0FBTyxFQUFFLENBQUM7Y0FBRUMsT0FBTyxFQUFFLENBQUM7Y0FBRUMsV0FBVyxFQUFFO1lBQUUsQ0FBQztZQUN6RXZILGVBQWUsR0FBR2xCLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsYUFBYSxDQUFDO1lBQzlEeUksY0FBYyxHQUFHTixTQUFTLENBQUNoTixNQUFNO1VBQ2xDLElBQUl1TixXQUFXLEdBQUdDLFVBQVUsQ0FBQ0MsT0FBTztZQUNuQ0MsV0FBVyxHQUFHLEVBQUU7WUFDaEJDLFlBQVksR0FBRyxFQUFFO1lBQ2pCQyxZQUFZLEdBQUcsRUFBRTtVQUFDO1lBQUEsSUFDZk4sY0FBYyxHQUFHLENBQUM7Y0FBQTtnQkFBQSxJQXNEakJBLGNBQWMsR0FBRyxDQUFDO2tCQUNyQixPQUFLdFEsZUFBZSxDQUFDNlEsWUFBWSxFQUFFO2dCQUFDO2NBQUE7Y0F0RHJDLEtBQUssSUFBSTlOLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR3VOLGNBQWMsRUFBRXZOLENBQUMsRUFBRSxFQUFFO2dCQUN4QyxJQUFJLENBQUNpTixTQUFTLENBQUNqTixDQUFDLENBQUMsQ0FBQ29NLE9BQU8sRUFBRSxJQUFJYSxTQUFTLENBQUNqTixDQUFDLENBQUMsQ0FBQ29NLE9BQU8sRUFBRSxLQUFLLEVBQUUsRUFBRTtrQkFDN0QsRUFBRWMsYUFBYSxDQUFDLGFBQWEsQ0FBQztnQkFDL0IsQ0FBQyxNQUFNO2tCQUNOLEVBQUVBLGFBQWEsQ0FBQ0QsU0FBUyxDQUFDak4sQ0FBQyxDQUFDLENBQUNvTSxPQUFPLEVBQUUsQ0FBQztnQkFDeEM7Y0FDRDtjQUNBLElBQUljLGFBQWEsQ0FBQ2EsV0FBVyxDQUFDWixLQUFLLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3pDSyxXQUFXLEdBQUdDLFVBQVUsQ0FBQ08sUUFBUTtjQUNsQyxDQUFDLE1BQU0sSUFBSWQsYUFBYSxDQUFDYSxXQUFXLENBQUNYLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDbERJLFdBQVcsR0FBR0MsVUFBVSxDQUFDUSxRQUFRO2NBQ2xDLENBQUMsTUFBTSxJQUFJZixhQUFhLENBQUNhLFdBQVcsQ0FBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFO2dCQUNsREcsV0FBVyxHQUFHQyxVQUFVLENBQUNKLE9BQU87Y0FDakMsQ0FBQyxNQUFNLElBQUlILGFBQWEsQ0FBQ2EsV0FBVyxDQUFDVCxXQUFXLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQ3RERSxXQUFXLEdBQUdDLFVBQVUsQ0FBQ1MsT0FBTztjQUNqQztjQUNBLElBQUloQixhQUFhLENBQUNDLEtBQUssR0FBRyxDQUFDLEVBQUU7Z0JBQzVCLE9BQUtnQixPQUFPLENBQUNqQixhQUFhLENBQUNDLEtBQUssQ0FBQztjQUNsQyxDQUFDLE1BQU07Z0JBQ04sT0FBS2dCLE9BQU8sQ0FBQyxFQUFFLENBQUM7Y0FDakI7Y0FDQSxJQUFJakIsYUFBYSxDQUFDQyxLQUFLLEtBQUssQ0FBQyxFQUFFO2dCQUM5QlEsV0FBVyxHQUFHLGdEQUFnRDtjQUMvRCxDQUFDLE1BQU0sSUFBSVQsYUFBYSxDQUFDQyxLQUFLLEdBQUcsQ0FBQyxFQUFFO2dCQUNuQ1EsV0FBVyxHQUFHLDJEQUEyRDtjQUMxRSxDQUFDLE1BQU0sSUFBSSxDQUFDVCxhQUFhLENBQUNDLEtBQUssSUFBSUQsYUFBYSxDQUFDRSxPQUFPLEVBQUU7Z0JBQ3pETyxXQUFXLEdBQUcsb0RBQW9EO2NBQ25FLENBQUMsTUFBTSxJQUFJLENBQUNULGFBQWEsQ0FBQ0MsS0FBSyxJQUFJLENBQUNELGFBQWEsQ0FBQ0UsT0FBTyxJQUFJRixhQUFhLENBQUNJLFdBQVcsRUFBRTtnQkFDdkZLLFdBQVcsR0FBRyx5REFBeUQ7Y0FDeEUsQ0FBQyxNQUFNLElBQUksQ0FBQ1QsYUFBYSxDQUFDQyxLQUFLLElBQUksQ0FBQ0QsYUFBYSxDQUFDRSxPQUFPLElBQUksQ0FBQ0YsYUFBYSxDQUFDSSxXQUFXLElBQUlKLGFBQWEsQ0FBQ0csT0FBTyxFQUFFO2dCQUNqSE0sV0FBVyxHQUFHLDREQUE0RDtjQUMzRTtjQUNBLElBQUlBLFdBQVcsRUFBRTtnQkFDaEJFLFlBQVksR0FBRzlILGVBQWUsQ0FBQ2hCLE9BQU8sQ0FBQzRJLFdBQVcsQ0FBQztnQkFDbkRDLFlBQVksR0FBR1YsYUFBYSxDQUFDQyxLQUFLLGFBQU1ELGFBQWEsQ0FBQ0MsS0FBSyxjQUFJVSxZQUFZLElBQUtBLFlBQVk7Z0JBQzVGLE9BQUtPLFVBQVUsQ0FBQ1IsWUFBWSxDQUFDO2NBQzlCO2NBQ0EsT0FBS1MsT0FBTyxDQUFDckIsS0FBSyxDQUFDO2NBQ25CLE9BQUtzQixPQUFPLENBQUNkLFdBQVcsQ0FBQztjQUN6QixPQUFLZSxVQUFVLENBQUMsSUFBSSxDQUFDO2NBQ3JCLElBQU05UCxLQUFLLEdBQUdvRyxJQUFJLENBQUNvQyxJQUFJLENBQUMsT0FBS3ZLLE9BQU8sQ0FBUztjQUFDO2dCQUFBLElBQzFDK0IsS0FBSztrQkFBQTtvQkFRUixPQUFjK1AsaUJBQWlCLENBQUM7c0JBQy9CakIsY0FBYyxFQUFFQTtvQkFDakIsQ0FBQyxDQUFDO2tCQUFDO2tCQVRILElBQU1rQixVQUFVLEdBQUloUSxLQUFLLENBQUNpUSxhQUFhLEVBQUUsQ0FBb0JDLFNBQVM7a0JBQUMsaUNBQ25FO29CQUFBLHVCQUNHRixVQUFVLENBQUNHLGFBQWEsRUFBRTtzQkFBQSx1QkFDMUIsT0FBS3BRLG1CQUFtQixDQUFDQyxLQUFLLENBQUM7b0JBQUE7a0JBQ3RDLENBQUMsY0FBYTtvQkFDYmlELEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLHdCQUF3QixDQUFDO2tCQUNwQyxDQUFDO2tCQUFBO2dCQUFBO2NBQUE7Y0FBQTtZQUFBO2NBU0YsT0FBSzRNLFVBQVUsQ0FBQyxLQUFLLENBQUM7Y0FDdEIsT0FBY0MsaUJBQWlCLENBQUM7Z0JBQy9CakIsY0FBYyxFQUFFQTtjQUNqQixDQUFDLENBQUM7WUFBQztVQUFBO1VBQUE7UUFFTCxDQUFDO1VBQUE7UUFBQTtNQUFBLEdBQUUsR0FBRyxDQUFDO0lBQ1IsQ0FBQztJQUFBLE9BRUQ5RixpQkFBaUIsR0FBakIsMkJBQWtCbkMsUUFBYSxFQUFFSCxTQUFnQixFQUFFO01BQ2xELE9BQU8sQ0FBQ0EsU0FBUyxDQUFDMEosSUFBSSxDQUNyQixVQUFVQyxjQUFtQixFQUFFaFAsS0FBVSxFQUFFO1FBQzFDLElBQUlpUCxjQUFjLEdBQUdELGNBQWMsQ0FBQzlJLFNBQVMsRUFBRTtRQUMvQyxPQUFPK0ksY0FBYyxJQUFJQSxjQUFjLEtBQUtqUCxLQUFLLEVBQUU7VUFDbERpUCxjQUFjLEdBQUdBLGNBQWMsQ0FBQy9JLFNBQVMsRUFBRTtRQUM1QztRQUNBLE9BQU8rSSxjQUFjLEdBQUcsSUFBSSxHQUFHLEtBQUs7TUFDckMsQ0FBQyxDQUFDN1EsSUFBSSxDQUFDLElBQUksRUFBRW9ILFFBQVEsQ0FBQyxDQUN0QjtJQUNGOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FQQztJQUFBLE9BUU1sSCxpQkFBaUIsOEJBQUNDLE1BQWlCO01BQUEsSUFBRTtRQUFBLGFBQ1osSUFBSTtRQUFsQyxJQUFNMlEscUJBQXFCLEdBQUcsT0FBS3BRLGlCQUFpQixDQUFDLGNBQWMsQ0FBQztRQUNuRW9RLHFCQUFxQixDQUFTdE0sV0FBVyxDQUFDLDRCQUE0QixFQUFFLElBQUksQ0FBQztRQUM5RSxJQUFNdU0sS0FBSyxHQUFHNVEsTUFBTSxDQUFDNlEsWUFBWSxDQUFDLE1BQU0sQ0FBQztVQUN4Q0MsUUFBUSxHQUFHRixLQUFLLENBQUNyUSxpQkFBaUIsQ0FBQyxTQUFTLENBQUMsQ0FBQ1EsU0FBUyxFQUFFO1VBQ3pEdUcsaUJBQWlCLEdBQUcsSUFBSUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDQyxJQUFJLENBQUNzSixRQUFRLENBQUNDLFNBQVMsRUFBRSxDQUFDO1VBQy9EM1EsS0FBSyxHQUFHb0csSUFBSSxDQUFDb0MsSUFBSSxDQUFDLE9BQUt2SyxPQUFPLENBQVM7UUFDeEMsSUFBSXNLLFFBQVEsRUFBRXFJLGFBQWE7UUFDM0IsSUFBTUMsYUFBYSxHQUFHLFVBQVUxTCxPQUFZLEVBQUUyTCxRQUFhLEVBQUU7VUFDNUQsSUFBTUMsU0FBUyxHQUFHO1lBQUVDLGFBQWEsRUFBRSxJQUFJO1lBQUVDLFVBQVUsRUFBRTlMO1VBQVEsQ0FBQztVQUM5RDJMLFFBQVEsQ0FBQ0ksS0FBSyxDQUFDSCxTQUFTLENBQUM7UUFDMUIsQ0FBQzs7UUFFRDtRQUFBO1VBQUEsSUFDSVAsS0FBSyxDQUFDOUYsWUFBWSxFQUFFLENBQUM1SSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQ2hELElBQUlxUCxlQUFvQjtZQUFDO2NBQUEsSUFDckJqSyxpQkFBaUI7Z0JBQ3BCaUssZUFBZSxHQUFHVCxRQUFRLENBQUNVLFVBQVUsQ0FDbkMzUSxHQUFHLENBQUMsVUFBVTJILFVBQWtCLEVBQUU7a0JBQ2xDLElBQU1pSixPQUFPLEdBQUdqTCxJQUFJLENBQUNvQyxJQUFJLENBQUNKLFVBQVUsQ0FBQztrQkFDckMsSUFBTWtKLGNBQWMsR0FBR0QsT0FBTyxJQUFLQSxPQUFPLENBQUM5SixTQUFTLEVBQVU7a0JBQzlELE9BQU8rSixjQUFjLElBQ3BCQSxjQUFjLENBQUNoUSxHQUFHLENBQUMsa0JBQWtCLENBQUMsSUFDdENnUSxjQUFjLENBQUM3SixTQUFTLEVBQUUsS0FBSytJLEtBQUssQ0FBQzlGLFlBQVksRUFBRSxDQUFDWixLQUFLLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQ3ZFd0gsY0FBYyxHQUNkLElBQUk7Z0JBQ1IsQ0FBQyxDQUFDLENBQ0RDLE1BQU0sQ0FBQyxVQUFVQyxHQUFRLEVBQUVDLEdBQVEsRUFBRTtrQkFDckMsT0FBT0EsR0FBRyxHQUFHQSxHQUFHLEdBQUdELEdBQUc7Z0JBQ3ZCLENBQUMsQ0FBQztnQkFBQztrQkFBQSxJQUNBTCxlQUFlO29CQUNsQlAsYUFBYSxHQUFHSixLQUFLLENBQUM5RixZQUFZLEVBQUUsQ0FBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFBQyxpQ0FDaEQ7c0JBQUEsdUJBQ0csT0FBSzRILGtEQUFrRCxDQUM1RFAsZUFBZSxFQUNmLE9BQUtoTyxpQkFBaUIsRUFDdEJ5TixhQUFhLENBQ2I7d0JBQ0QsSUFBTWUsZ0JBQWdCLEdBQUcsT0FBSzlOLHdCQUF3QixDQUFDc04sZUFBZSxDQUFDO3dCQUN2RSxJQUFNUyxTQUFTLEdBQUdELGdCQUFnQixDQUFDM04sV0FBVyxDQUFDd00sS0FBSyxDQUFDclEsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUNRLFNBQVMsRUFBRSxDQUFDNUIsS0FBSyxFQUFFLENBQUM7d0JBQ3RHLElBQU04UyxzQkFBc0IsYUFBVUMsY0FBbUIsRUFBRXZOLFNBQWlCOzBCQUFBLElBQW1COzRCQUM5RixJQUFNd04sa0JBQWtCLEdBQUcsT0FBS0MsZ0JBQWdCLENBQUNGLGNBQWMsQ0FBQzs4QkFDL0RHLGdCQUFnQixHQUFHLE9BQUtDLGFBQWEsQ0FBQ0osY0FBYyxDQUFDLENBQUNLLGtCQUFrQixFQUFFOzRCQUMzRSxJQUFJSixrQkFBa0IsQ0FBQ3ZRLE1BQU0sR0FBRyxDQUFDLElBQUl1USxrQkFBa0IsQ0FBQyxDQUFDLENBQUMsRUFBRTs4QkFDM0QsSUFBTUssVUFBVSxHQUFHTCxrQkFBa0IsQ0FBQ3hOLFNBQVMsR0FBRzBOLGdCQUFnQixDQUFDO2dDQUNsRUksV0FBVyxHQUFHLE9BQUtDLGFBQWEsQ0FBQ0YsVUFBVSxFQUFFMUIsUUFBUSxDQUFDOzhCQUN2RCxJQUFJMkIsV0FBVyxFQUFFO2dDQUNoQixPQUFLRSxpQkFBaUIsQ0FBQ0YsV0FBVyxDQUFDO2dDQUNuQyx1QkFBTy9JLFNBQVM7OEJBQ2pCLENBQUMsTUFBTTtnQ0FDTjtnQ0FDQSxJQUFNa0osYUFBYSxHQUFHOUIsUUFBUSxDQUFDQyxTQUFTLEVBQUUsQ0FBQzdHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQ0MsR0FBRyxFQUFFO2dDQUMzRCxJQUFJeUksYUFBYSxFQUFFO2tDQUNqQnhTLEtBQUssQ0FBQytDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBZWtCLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRXVPLGFBQWEsQ0FBQztnQ0FDL0Y7Z0NBQ0EsSUFBSSxPQUFLM0UscUJBQXFCLENBQUNpRSxjQUFjLENBQUMsRUFBRTtrQ0FDL0MsdUJBQVE5UixLQUFLLENBQUNpUSxhQUFhLEVBQUUsQ0FBb0J3QyxRQUFRLENBQUNDLHdCQUF3QixDQUNqRk4sVUFBVSxDQUFDalMsaUJBQWlCLEVBQUUsQ0FDOUI7Z0NBQ0YsQ0FBQyxNQUFNO2tDQUNOLHVCQUFPLEtBQUs7Z0NBQ2I7OEJBQ0Q7NEJBQ0Q7NEJBQ0EsdUJBQU9tSixTQUFTOzBCQUNqQixDQUFDOzRCQUFBOzBCQUFBO3dCQUFBO3dCQUFDOzBCQUFBLElBQ0U2SCxlQUFlLENBQUNyRSxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssV0FBVyxJQUFJOEUsU0FBUyxDQUFDaE4sUUFBUSxLQUFLLEVBQUU7NEJBQ2pGLElBQU1xTixnQkFBZ0IsR0FBRyxPQUFLQyxhQUFhLENBQUNmLGVBQWUsQ0FBQyxDQUFDZ0Isa0JBQWtCLEVBQUU7NEJBQUMsaUNBQzlFOzhCQUFBLHVCQUNHaEIsZUFBZSxDQUFDd0IsYUFBYSxDQUFDZixTQUFTLENBQUNoTixRQUFRLENBQUM7Z0NBQ3ZELElBQU1tTixrQkFBa0IsR0FBRyxPQUFLQyxnQkFBZ0IsQ0FBQ2IsZUFBZSxDQUFDO2dDQUNqRSxJQUFJeUIsbUJBQW1CLEVBQUVDLGFBQWE7Z0NBQ3RDLElBQUlkLGtCQUFrQixDQUFDdlEsTUFBTSxHQUFHLENBQUMsSUFBSXVRLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFO2tDQUMzRGEsbUJBQW1CLEdBQUdiLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxDQUFDeEssU0FBUyxFQUFFLENBQUM0SyxrQkFBa0IsRUFBRTtrQ0FDNUVVLGFBQWEsR0FBR1osZ0JBQWdCLEdBQUdXLG1CQUFtQixLQUFLLENBQUM7Z0NBQzdEO2dDQUNBLElBQUlFLG1CQUFrQztnQ0FDdEMsSUFBSUQsYUFBYSxFQUFFO2tDQUNsQjtrQ0FDQUMsbUJBQW1CLEdBQUcsSUFBSXRRLE9BQU8sQ0FBQyxVQUFVQyxPQUFPLEVBQUU7b0NBQ3BEMkQsSUFBSSxDQUFDMk0sV0FBVyxDQUFDLFdBQVcsRUFBRXRRLE9BQU8sQ0FBQztrQ0FDdkMsQ0FBQyxDQUFDO2dDQUNILENBQUMsTUFBTTtrQ0FDTnFRLG1CQUFtQixHQUFHdFEsT0FBTyxDQUFDQyxPQUFPLEVBQUU7Z0NBQ3hDO2dDQUFDLHVCQUNLcVEsbUJBQW1CO2tDQUN6QmxRLFVBQVU7b0NBQUEsSUFBbUI7c0NBQUEsdUJBQ0tpUCxzQkFBc0IsQ0FBQ1YsZUFBZSxFQUFFUyxTQUFTLENBQUNoTixRQUFRLENBQUMsaUJBQXRGb08sa0JBQWtCO3dDQUFBLElBQ3BCQSxrQkFBa0IsS0FBSyxLQUFLOzBDQUMvQm5DLGFBQWEsQ0FBQ0gsUUFBUSxFQUFFUyxlQUFlLENBQUM7d0NBQUM7c0NBQUE7b0NBRTNDLENBQUM7c0NBQUE7b0NBQUE7a0NBQUEsR0FBRSxDQUFDLENBQUM7Z0NBQUM7OEJBQUE7NEJBQ1AsQ0FBQyxjQUFhOzhCQUNibE8sR0FBRyxDQUFDQyxLQUFLLENBQUMsK0JBQStCLENBQUM7NEJBQzNDLENBQUM7NEJBQUE7MEJBQUE7NEJBQUE7OEJBQUEsSUFDU2lPLGVBQWUsQ0FBQ3JFLElBQUksQ0FBQyxXQUFXLENBQUMsS0FBSyxpQkFBaUIsSUFBSThFLFNBQVM7Z0NBQUEsdUJBQ3BDLE9BQUtxQiwyQkFBMkIsQ0FDekVqVCxLQUFLLEVBQ0wwUSxRQUFRLEVBQ1JTLGVBQWUsRUFDZlMsU0FBUyxDQUFDaE4sUUFBUSxDQUNsQixpQkFMS3FPLDJCQUEyQjtrQ0FBQSxJQU03QkEsMkJBQTJCLEtBQUssS0FBSztvQ0FDeENwQyxhQUFhLENBQUNILFFBQVEsRUFBRVMsZUFBZSxDQUFDO2tDQUFDO2dDQUFBOzhCQUFBO2dDQUcxQyxPQUFLOEIsMkJBQTJCLENBQUNqVCxLQUFLLEVBQUUwUSxRQUFRLENBQUM7OEJBQUM7NEJBQUE7NEJBQUE7MEJBQUE7d0JBQUE7d0JBQUE7c0JBQUE7b0JBRXBELENBQUMsY0FBYTtzQkFDYnpOLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDLG1DQUFtQyxDQUFDO29CQUMvQyxDQUFDO29CQUFBO2tCQUFBO2dCQUFBO2dCQUFBO2NBQUE7Z0JBR0ZxRixRQUFRLEdBQUduQyxJQUFJLENBQUNvQyxJQUFJLENBQUNrSSxRQUFRLENBQUNVLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQztnQkFDNUM7Z0JBQ0EsSUFBTThCLGdCQUFxQixHQUFHOU0sSUFBSSxDQUFDb0MsSUFBSSxDQUFDLE9BQUtyRixpQkFBaUIsQ0FBQ2dRLGtCQUFrQixFQUFFLENBQUM7Z0JBQ3BGLElBQUksQ0FBQUQsZ0JBQWdCLGFBQWhCQSxnQkFBZ0IsdUJBQWhCQSxnQkFBZ0IsQ0FBRTlSLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQ1UsT0FBTyxDQUFDeUcsUUFBUSxDQUFDLE1BQUssQ0FBQyxDQUFDLEVBQUU7a0JBQ2xFcUksYUFBYSxHQUFHSixLQUFLLENBQUM5RixZQUFZLEVBQUUsQ0FBQ1osS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztrQkFDbkQsT0FBS3NKLDZDQUE2QyxDQUFDLE9BQUtqUSxpQkFBaUIsRUFBRXlOLGFBQWEsQ0FBQztnQkFDMUY7Z0JBQ0EsT0FBSzJCLGlCQUFpQixDQUFDaEssUUFBUSxDQUFDO2NBQUM7WUFBQTtZQUFBO1VBQUE7WUFHbEM7WUFDQXFJLGFBQWEsR0FBR0osS0FBSyxDQUFDOUYsWUFBWSxFQUFFLENBQUNaLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDbkQsT0FBS3NKLDZDQUE2QyxDQUFDLE9BQUtqUSxpQkFBaUIsRUFBRXlOLGFBQWEsQ0FBQztZQUN6RixPQUFLcUMsMkJBQTJCLENBQUNqVCxLQUFLLEVBQUUwUSxRQUFRLENBQUM7VUFBQztRQUFBO1FBQUE7TUFFcEQsQ0FBQztRQUFBO01BQUE7SUFBQTtJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFQQztJQUFBLE9BUUE0QixhQUFhLEdBQWIsdUJBQWNlLFNBQXlCLEVBQUVsTyxPQUFnQixFQUFpQztNQUN6RixPQUFPQSxPQUFPLENBQUNXLGFBQWEsRUFBRSxDQUFDdEUsTUFBTSxHQUFHLENBQUMsR0FDdEMyRCxPQUFPLENBQ05XLGFBQWEsRUFBRSxDQUNmckYsR0FBRyxDQUFDLFVBQVU2UyxTQUFpQixFQUFFO1FBQ2pDLElBQU1DLGdCQUFnQixHQUFJRixTQUFTLENBQVNqUyxZQUFZLENBQUMsSUFBSSxFQUFFLFVBQVVvUyxJQUFTLEVBQUU7VUFDbkYsT0FBT0EsSUFBSSxDQUFDelUsS0FBSyxFQUFFLEtBQUt1VSxTQUFTO1FBQ2xDLENBQUMsQ0FBQztRQUNGLE9BQU9DLGdCQUFnQixDQUFDL1IsTUFBTSxHQUFHLENBQUMsR0FBRzRFLElBQUksQ0FBQ29DLElBQUksQ0FBQzhLLFNBQVMsQ0FBQyxHQUFHLElBQUk7TUFDakUsQ0FBQyxDQUFDLENBQ0QvQixNQUFNLENBQUMsVUFBVUMsR0FBUSxFQUFFQyxHQUFRLEVBQUU7UUFDckMsT0FBT0EsR0FBRyxHQUFHQSxHQUFHLEdBQUdELEdBQUc7TUFDdkIsQ0FBQyxDQUFDLEdBQ0YsSUFBSTtJQUNSOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BVEM7SUFBQSxPQVVNeUIsMkJBQTJCLHdDQUFDNVMsSUFBVSxFQUFFOEUsT0FBZ0IsRUFBRTJNLGNBQW9CLEVBQUVsTixRQUFpQjtNQUFBLElBQWdCO1FBQUEsYUFpQnJILElBQUk7UUFoQkwsSUFBTTZPLGdCQUFnQixHQUFHcFQsSUFBSSxDQUFDZSxZQUFZLENBQUMsSUFBSSxDQUFDO1FBQ2hELElBQU1zUyxrQkFBa0IsR0FBR3ZPLE9BQU8sQ0FDaENXLGFBQWEsRUFBRSxDQUNmekMsTUFBTSxDQUFDLFVBQVUrRSxVQUFrQixFQUFFO1VBQ3JDLE9BQU9xTCxnQkFBZ0IsQ0FBQ3JELElBQUksQ0FBQyxVQUFVL08sS0FBSyxFQUFFO1lBQzdDLE9BQU9BLEtBQUssQ0FBQ3RDLEtBQUssRUFBRSxLQUFLcUosVUFBVSxJQUFJL0csS0FBSyxDQUFDc1MsU0FBUyxFQUFFO1VBQ3pELENBQUMsQ0FBQztRQUNILENBQUMsQ0FBQyxDQUNEbFQsR0FBRyxDQUFDLFVBQVUySCxVQUFrQixFQUFFO1VBQ2xDLE9BQU9oQyxJQUFJLENBQUNvQyxJQUFJLENBQUNKLFVBQVUsQ0FBQztRQUM3QixDQUFDLENBQUM7UUFDSCxJQUFNd0wsMEJBQTBCLEdBQUdGLGtCQUFrQixDQUFDclEsTUFBTSxDQUFDLFVBQVVoQyxLQUFVLEVBQUU7VUFDbEYsT0FBTyxDQUFDQSxLQUFLLENBQUNDLEdBQUcsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDRCxLQUFLLENBQUNDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQztRQUNyRSxDQUFDLENBQUM7UUFDRjtRQUNBLElBQUlzUywwQkFBMEIsQ0FBQ3BTLE1BQU0sR0FBRyxDQUFDLEVBQUU7VUFDMUMsT0FBSytRLGlCQUFpQixDQUFDcUIsMEJBQTBCLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDckQsdUJBQU90SyxTQUFTO1FBQ2pCLENBQUMsTUFBTSxJQUFJb0ssa0JBQWtCLENBQUNsUyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQ3pDLElBQU11USxrQkFBa0IsR0FBR0QsY0FBYyxHQUN0Q0EsY0FBYyxDQUFDMVEsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFVQyxLQUFVLEVBQUU7WUFDeEQsT0FBT0EsS0FBSyxDQUFDQyxHQUFHLENBQUN1UyxjQUFjLENBQUNDLFdBQVcsRUFBRSxDQUFDQyxPQUFPLEVBQUUsQ0FBQztVQUN4RCxDQUFDLENBQUMsR0FDRixFQUFFO1VBQ0wsSUFBSWhDLGtCQUFrQixDQUFDdlEsTUFBTSxHQUFHLENBQUMsSUFBSXVRLGtCQUFrQixDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQzNELElBQU1LLFVBQVUsR0FBR0wsa0JBQWtCLENBQUNuTixRQUFRLENBQVc7WUFDekQsSUFBTXlOLFdBQVcsR0FBRyxPQUFLQyxhQUFhLENBQUNGLFVBQVUsRUFBRWpOLE9BQU8sQ0FBUTtZQUNsRSxJQUFJa04sV0FBVyxFQUFFO2NBQ2hCLElBQU0yQixZQUFZLEdBQUczQixXQUFXLENBQUMvUSxHQUFHLENBQUMsOEJBQThCLENBQUMsR0FDakUrUSxXQUFXLENBQUN2UixVQUFVLEVBQUUsQ0FBQ21ULGNBQWMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUM1QzVCLFdBQVcsQ0FBQzdPLFFBQVEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDMUMsVUFBVSxFQUFFLENBQUNtVCxjQUFjLEVBQUUsQ0FBQyxDQUFDLENBQUM7Y0FDN0QsT0FBSzFCLGlCQUFpQixDQUFDeUIsWUFBWSxDQUFDO2NBQ3BDLHVCQUFPMUssU0FBUztZQUNqQixDQUFDLE1BQU07Y0FDTixJQUFNa0osYUFBYSxHQUFHck4sT0FBTyxDQUFDd0wsU0FBUyxFQUFFLENBQUM3RyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUNDLEdBQUcsRUFBRTtjQUMxRCxJQUFJeUksYUFBYSxFQUFFO2dCQUNqQm5TLElBQUksQ0FBQzBDLFFBQVEsQ0FBQyxVQUFVLENBQUMsQ0FBZWtCLFdBQVcsQ0FBQyx3QkFBd0IsRUFBRXVPLGFBQWEsQ0FBQztjQUM5RjtjQUNBLElBQUksT0FBSzNFLHFCQUFxQixDQUFDaUUsY0FBYyxDQUFDLEVBQUU7Z0JBQy9DLHVCQUFRelIsSUFBSSxDQUFDNFAsYUFBYSxFQUFFLENBQW9Cd0MsUUFBUSxDQUFDQyx3QkFBd0IsQ0FBQ04sVUFBVSxDQUFDalMsaUJBQWlCLEVBQUUsQ0FBQztjQUNsSCxDQUFDLE1BQU07Z0JBQ04sdUJBQU8sS0FBSztjQUNiO1lBQ0Q7VUFDRDtVQUNBLHVCQUFPbUosU0FBUztRQUNqQjtRQUNBLHVCQUFPQSxTQUFTO01BQ2pCLENBQUM7UUFBQTtNQUFBO0lBQUE7SUFBQSxPQUVEMUIsZ0JBQWdCLEdBQWhCLDBCQUFpQjlELE1BQVcsRUFBRVUsdUJBQStCLEVBQUU7TUFDOUQsSUFBSXVELG1CQUFtQjtNQUN2QixJQUFJbU0sZUFBZSxHQUFHcFEsTUFBTSxDQUFDc0YsVUFBVSxFQUFFLENBQUNuQixJQUFJLENBQzdDLFVBQVVrTSxtQkFBd0IsRUFBRUMsTUFBVyxFQUFFO1FBQ2hELE9BQU9BLE1BQU0sQ0FBQy9LLGVBQWUsRUFBRSxLQUFLOEssbUJBQW1CO01BQ3hELENBQUMsQ0FBQzFVLElBQUksQ0FBQyxJQUFJLEVBQUUrRSx1QkFBdUIsQ0FBQyxDQUNyQztNQUNELElBQUksQ0FBQzBQLGVBQWUsRUFBRTtRQUNyQjtRQUNBLElBQU1HLGFBQWEsR0FBR3ZRLE1BQU0sQ0FDMUJ3USxrQkFBa0IsRUFBRSxDQUNwQkMsYUFBYSxDQUFDelEsTUFBTSxDQUFDLENBQ3JCbUUsSUFBSSxDQUFDLFVBQVV1TSxPQUFZLEVBQUU7VUFDN0IsSUFBSSxDQUFDLENBQUNBLE9BQU8sQ0FBQ0MsUUFBUSxJQUFJRCxPQUFPLENBQUNFLGFBQWEsRUFBRTtZQUNoRCxPQUNDRixPQUFPLENBQUNFLGFBQWEsQ0FBQyxDQUFDLENBQUMsS0FBS2xRLHVCQUF1QixJQUNwRGdRLE9BQU8sQ0FBQ0UsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDdlEsT0FBTyxDQUFDLFlBQVksRUFBRSxFQUFFLENBQUMsS0FBS0ssdUJBQXVCO1VBRWhGLENBQUMsTUFBTTtZQUNOLE9BQU8sS0FBSztVQUNiO1FBQ0QsQ0FBQyxDQUFDO1FBQ0gsSUFBSTZQLGFBQWEsRUFBRTtVQUNsQkgsZUFBZSxHQUFHRyxhQUFhO1VBQy9CN1AsdUJBQXVCLEdBQUcwUCxlQUFlLENBQUNTLElBQUk7VUFFOUM1TSxtQkFBbUIsR0FBR2pFLE1BQU0sQ0FDMUJzRixVQUFVLEVBQUUsQ0FDWm5CLElBQUksQ0FBQyxVQUFVdU0sT0FBWSxFQUFFO1lBQzdCLE9BQU9oUSx1QkFBdUIsS0FBS2dRLE9BQU8sQ0FBQ25MLGVBQWUsRUFBRTtVQUM3RCxDQUFDLENBQUMsQ0FDRDVCLFNBQVMsRUFBRTtRQUNkLENBQUMsTUFBTTtVQUNOO1VBQ0EsSUFBTW1OLFFBQVEsR0FBRzlRLE1BQU0sQ0FBQ3dRLGtCQUFrQixFQUFFLENBQUNDLGFBQWEsQ0FBQ3pRLE1BQU0sQ0FBQztVQUNsRW9RLGVBQWUsR0FBR1UsUUFBUSxDQUFDM00sSUFBSSxDQUM5QixVQUFVNE0sYUFBb0IsRUFBRUMsb0JBQTRCLEVBQUVOLE9BQVksRUFBRTtZQUMzRSxJQUFJQSxPQUFPLENBQUNuVixHQUFHLENBQUN5QyxPQUFPLENBQUMsZ0JBQWdCLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRTtjQUNqRCxPQUFPMFMsT0FBTyxDQUFDRSxhQUFhLENBQUN6TSxJQUFJLENBQUMsWUFBWTtnQkFDN0MsT0FBTzRNLGFBQWEsQ0FBQzVNLElBQUksQ0FBQyxVQUFVOE0sV0FBVyxFQUFFO2tCQUNoRCxPQUFPQSxXQUFXLENBQUNDLFlBQVksS0FBS0Ysb0JBQW9CO2dCQUN6RCxDQUFDLENBQUM7Y0FDSCxDQUFDLENBQUM7WUFDSDtVQUNELENBQUMsQ0FBQ3JWLElBQUksQ0FBQyxJQUFJLEVBQUVtVixRQUFRLEVBQUVwUSx1QkFBdUIsQ0FBQyxDQUMvQztVQUNEO1VBQ0EsSUFBSXlRLHdCQUF3QixHQUFHLEtBQUs7VUFDcEMsSUFBSWYsZUFBZSxJQUFJQSxlQUFlLENBQUNwRyxLQUFLLEVBQUU7WUFDN0NtSCx3QkFBd0IsR0FBR25SLE1BQU0sQ0FBQ3NGLFVBQVUsRUFBRSxDQUFDZ0gsSUFBSSxDQUFDLFVBQVVnRSxNQUFXLEVBQUU7Y0FDMUUsT0FBT0EsTUFBTSxDQUFDM00sU0FBUyxFQUFFLEtBQUt5TSxlQUFlLENBQUNwRyxLQUFLO1lBQ3BELENBQUMsQ0FBQztVQUNIO1VBQ0EvRixtQkFBbUIsR0FBR2tOLHdCQUF3QixJQUFJZixlQUFlLENBQUNwRyxLQUFLO1VBQ3ZFdEosdUJBQXVCLEdBQUd5USx3QkFBd0IsSUFBSWYsZUFBZSxDQUFDN1UsR0FBRztRQUMxRTtNQUNELENBQUMsTUFBTTtRQUNOMEksbUJBQW1CLEdBQUdtTSxlQUFlLElBQUlBLGVBQWUsQ0FBQ3pNLFNBQVMsRUFBRTtNQUNyRTtNQUNBLE9BQU87UUFBRU0sbUJBQW1CLEVBQUVBLG1CQUFtQjtRQUFFdkQsdUJBQXVCLEVBQUVBO01BQXdCLENBQUM7SUFDdEc7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BMFEsZUFBZSxHQUFmLHlCQUFnQkMsR0FBUSxFQUFFMVIsU0FBZ0IsRUFBRTtNQUMzQyxJQUFJQSxTQUFTLEVBQUU7UUFDZCxJQUFJZ0QsT0FBTyxFQUFFeUQsWUFBWSxFQUFFdEUsVUFBVSxFQUFFdUUsQ0FBQyxFQUFFQyxDQUFDLEVBQUUxRCxTQUFTLEVBQUUwTyxZQUFZLEVBQUVDLFdBQVc7UUFDakYsS0FBS2xMLENBQUMsR0FBRzFHLFNBQVMsQ0FBQ2pDLE1BQU0sR0FBRyxDQUFDLEVBQUUySSxDQUFDLElBQUksQ0FBQyxFQUFFLEVBQUVBLENBQUMsRUFBRTtVQUMzQztVQUNBMUQsT0FBTyxHQUFHaEQsU0FBUyxDQUFDMEcsQ0FBQyxDQUFDO1VBQ3RCRCxZQUFZLEdBQUd6RCxPQUFPLENBQUN2RixjQUFjLEVBQUU7VUFDdkMsS0FBS2tKLENBQUMsR0FBR0YsWUFBWSxDQUFDMUksTUFBTSxHQUFHLENBQUMsRUFBRTRJLENBQUMsSUFBSSxDQUFDLEVBQUUsRUFBRUEsQ0FBQyxFQUFFO1lBQzlDO1lBQ0F4RSxVQUFVLEdBQUdzRSxZQUFZLENBQUNFLENBQUMsQ0FBQztZQUM1QmdMLFlBQVksR0FBR3hQLFVBQVUsQ0FBQ3hFLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO1lBQzlDO1lBQ0FzRixTQUFTLEdBQUcwTyxZQUFZLENBQUMvUixNQUFNLENBQUMsSUFBSSxDQUFDaVMsZUFBZSxDQUFDN1YsSUFBSSxDQUFDLElBQUksRUFBRTBWLEdBQUcsQ0FBQ0ksWUFBWSxFQUFFLENBQUMsQ0FBQztZQUNwRkYsV0FBVyxHQUFHbEwsQ0FBQyxHQUFHLENBQUM7WUFDbkIsSUFBSXpELFNBQVMsQ0FBQ2xGLE1BQU0sR0FBRyxDQUFDLEVBQUU7Y0FDekIyVCxHQUFHLENBQUNLLFdBQVcsR0FBRy9PLE9BQU8sQ0FBQ2tELFFBQVEsRUFBRTtjQUNwQ3dMLEdBQUcsQ0FBQ00sY0FBYyxHQUFHN1AsVUFBVSxDQUFDK0QsUUFBUSxFQUFFO2NBQzFDLE9BQU8wTCxXQUFXLEdBQUcsRUFBRSxJQUFJakwsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNsQztVQUNEO1FBQ0Q7UUFDQTtRQUNBO1FBQ0EsSUFBSSxDQUFDK0ssR0FBRyxDQUFDSyxXQUFXLElBQUksQ0FBQ0wsR0FBRyxDQUFDTSxjQUFjLElBQUlOLEdBQUcsQ0FBQzFLLFVBQVUsRUFBRTtVQUM5RCxPQUFPLENBQUM7UUFDVDtRQUNBLE9BQU8sR0FBRztNQUNYO01BQ0EsT0FBTyxHQUFHO0lBQ1g7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BT0FqTCxvQkFBb0IsR0FBcEIsZ0NBQXVCO01BQUE7TUFDdEIsSUFBSWtXLGtCQUFrQjtRQUNyQkMsMkJBQTJCO1FBQzNCQyxRQUFRO1FBQ1JDLEtBQUs7UUFDTEMsT0FBTztRQUNQQyxhQUFhO1FBQ2JDLHdCQUE2QixHQUFHLElBQUk7TUFDckMsSUFBTUMsa0JBQXlCLEdBQUcsRUFBRTtNQUNwQyxJQUFNQyx5QkFBeUIsR0FBRyxZQUFNO1FBQ3ZDLElBQU1DLE1BQU0sR0FBRyxVQUFDQyxXQUFxQixFQUFLO1VBQ3pDLElBQUlDLEtBQUssR0FBR0MsUUFBUTtZQUNuQi9OLFFBQVEsR0FBR25DLElBQUksQ0FBQ29DLElBQUksQ0FBQzROLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBUTtVQUM1QyxJQUFNRyxpQkFBaUIsR0FBR25RLElBQUksQ0FBQ29DLElBQUksQ0FBQzROLFdBQVcsQ0FBQyxDQUFDLENBQUMsQ0FBQztVQUNuRCxPQUFPN04sUUFBUSxFQUFFO1lBQ2hCLElBQU1pTyxpQkFBaUIsR0FDdEJqTyxRQUFRLFlBQVlrTyxNQUFNLEdBQ3ZCLENBQUNGLGlCQUFpQixhQUFqQkEsaUJBQWlCLHVCQUFqQkEsaUJBQWlCLENBQUVoUCxTQUFTLEVBQUUsRUFBU25HLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQ1UsT0FBTyxDQUFDeVUsaUJBQWlCLENBQUMsR0FDckZELFFBQVE7WUFDWixJQUFJL04sUUFBUSxZQUFZa08sTUFBTSxFQUFFO2NBQy9CLElBQUlKLEtBQUssR0FBR0csaUJBQWlCLEVBQUU7Z0JBQzlCSCxLQUFLLEdBQUdHLGlCQUFpQjtnQkFDekI7Z0JBQ0EsT0FBSSxDQUFDakUsaUJBQWlCLENBQUNnRSxpQkFBaUIsQ0FBQztjQUMxQztjQUNBO2NBQ0EsT0FBTyxLQUFLO1lBQ2I7WUFDQWhPLFFBQVEsR0FBR0EsUUFBUSxDQUFDaEIsU0FBUyxFQUFFO1VBQ2hDO1VBQ0EsT0FBTyxJQUFJO1FBQ1osQ0FBQztRQUNELE9BQU8sSUFBSW1QLE1BQU0sQ0FBQztVQUNqQkMsSUFBSSxFQUFFLFlBQVk7VUFDbEJ2UCxJQUFJLEVBQUUrTyxNQUFNO1VBQ1pTLGFBQWEsRUFBRTtRQUNoQixDQUFDLENBQUM7TUFDSCxDQUFDO01BQ0Q7TUFDQSxTQUFTQywyQkFBMkIsR0FBRztRQUN0QyxJQUFNVixNQUFNLEdBQUcsVUFBVUMsV0FBcUIsRUFBRTtVQUMvQyxJQUFJLENBQUNBLFdBQVcsQ0FBQzVVLE1BQU0sRUFBRTtZQUN4QixPQUFPLEtBQUs7VUFDYjtVQUNBLElBQUkrRyxRQUFhLEdBQUduQyxJQUFJLENBQUNvQyxJQUFJLENBQUM0TixXQUFXLENBQUMsQ0FBQyxDQUFDLENBQUM7VUFDN0MsT0FBTzdOLFFBQVEsRUFBRTtZQUNoQixJQUFJQSxRQUFRLENBQUN4SixLQUFLLEVBQUUsS0FBS2QsT0FBTyxFQUFFO2NBQ2pDLE9BQU8sSUFBSTtZQUNaO1lBQ0EsSUFBSXNLLFFBQVEsWUFBWWtPLE1BQU0sRUFBRTtjQUMvQjtjQUNBLE9BQU8sS0FBSztZQUNiO1lBQ0FsTyxRQUFRLEdBQUdBLFFBQVEsQ0FBQ2hCLFNBQVMsRUFBRTtVQUNoQztVQUNBLE9BQU8sS0FBSztRQUNiLENBQUM7UUFDRCxPQUFPLElBQUltUCxNQUFNLENBQUM7VUFDakJDLElBQUksRUFBRSxZQUFZO1VBQ2xCdlAsSUFBSSxFQUFFK08sTUFBTTtVQUNaUyxhQUFhLEVBQUU7UUFDaEIsQ0FBQyxDQUFDO01BQ0g7TUFDQSxJQUFJLENBQUMsSUFBSSxDQUFDM1ksT0FBTyxFQUFFO1FBQ2xCLElBQUksQ0FBQ0EsT0FBTyxHQUFHLElBQUksQ0FBQzJMLFVBQVUsQ0FBQyxJQUFJLENBQUM3SyxLQUFLLEVBQUUsQ0FBVztNQUN2RDtNQUNBLElBQU1kLE9BQU8sR0FBRyxJQUFJLENBQUNBLE9BQU87TUFDNUI7TUFDQSxJQUFNNlksY0FBYyxHQUFHLElBQUksQ0FBQ0MsY0FBYyxDQUFDLGVBQWUsQ0FBUTtNQUNsRSxJQUFJRCxjQUFjLEVBQUU7UUFDbkJBLGNBQWMsQ0FBQzlWLE9BQU8sQ0FBQyxVQUFVcUMsTUFBVyxFQUFFO1VBQzdDNFMsa0JBQWtCLENBQUNsVSxJQUFJLENBQ3RCLElBQUkyVSxNQUFNLENBQUM7WUFDVkMsSUFBSSxFQUFFdFQsTUFBTSxDQUFDVyxXQUFXLENBQUMsTUFBTSxDQUFDO1lBQ2hDZ1QsUUFBUSxFQUFFM1QsTUFBTSxDQUFDVyxXQUFXLENBQUMsVUFBVSxDQUFDO1lBQ3hDaVQsTUFBTSxFQUFFNVQsTUFBTSxDQUFDVyxXQUFXLENBQUMsUUFBUSxDQUFDO1lBQ3BDa1QsTUFBTSxFQUFFN1QsTUFBTSxDQUFDVyxXQUFXLENBQUMsUUFBUTtVQUNwQyxDQUFDLENBQUMsQ0FDRjtRQUNGLENBQUMsQ0FBQztNQUNIO01BQ0EsSUFBTW1ULGVBQWUsR0FBRyxJQUFJLENBQUNoWCxpQkFBaUIsRUFBRTtNQUNoRCxJQUFJLENBQUNnWCxlQUFlLEVBQUU7UUFDckIsSUFBSSxDQUFDckgsVUFBVSxDQUFDLEtBQUssQ0FBQztRQUN0QjtNQUNELENBQUMsTUFBTTtRQUNOK0YsS0FBSyxHQUFHc0IsZUFBZSxDQUFDdlYsT0FBTyxFQUFFO1FBQ2pDO1FBQ0E4VCxrQkFBa0IsR0FBRyxJQUFJZ0IsTUFBTSxDQUFDO1VBQy9CVSxPQUFPLEVBQUUsQ0FDUixJQUFJVixNQUFNLENBQUM7WUFDVkMsSUFBSSxFQUFFLFlBQVk7WUFDbEJLLFFBQVEsRUFBRUssY0FBYyxDQUFDQyxFQUFFO1lBQzNCTCxNQUFNLEVBQUU7VUFDVCxDQUFDLENBQUMsRUFDRkosMkJBQTJCLEVBQUUsQ0FDN0I7VUFDRFUsR0FBRyxFQUFFO1FBQ04sQ0FBQyxDQUFDO1FBQ0Y7UUFDQTVCLDJCQUEyQixHQUFHLElBQUllLE1BQU0sQ0FBQztVQUN4Q1UsT0FBTyxFQUFFLENBQ1IxQixrQkFBa0IsRUFDbEIsSUFBSWdCLE1BQU0sQ0FBQztZQUNWQyxJQUFJLEVBQUUsUUFBUTtZQUNkSyxRQUFRLEVBQUVLLGNBQWMsQ0FBQ0csVUFBVTtZQUNuQ1AsTUFBTSxFQUFFcEI7VUFDVCxDQUFDLENBQUMsQ0FDRjtVQUNEMEIsR0FBRyxFQUFFO1FBQ04sQ0FBQyxDQUFDO1FBQ0Z4QixhQUFhLEdBQUcsSUFBSVcsTUFBTSxDQUFDO1VBQzFCVSxPQUFPLEVBQUUsQ0FBQ2xCLHlCQUF5QixFQUFFO1FBQ3RDLENBQUMsQ0FBQztNQUNIO01BQ0EsSUFBTXVCLCtCQUErQixHQUFHLElBQUlmLE1BQU0sQ0FBQztRQUNsRFUsT0FBTyxFQUFFLENBQUN6QiwyQkFBMkIsRUFBRUksYUFBYSxDQUFDO1FBQ3JEd0IsR0FBRyxFQUFFO01BQ04sQ0FBQyxDQUFDO01BQ0Y7TUFDQSxJQUFJdEIsa0JBQWtCLENBQUN6VSxNQUFNLEdBQUcsQ0FBQyxFQUFFO1FBQ2xDb1UsUUFBUSxHQUFHLElBQUtjLE1BQU0sQ0FBUztVQUM5QlUsT0FBTyxFQUFFLENBQUNuQixrQkFBa0IsRUFBRXdCLCtCQUErQixDQUFDO1VBQzlERixHQUFHLEVBQUU7UUFDTixDQUFDLENBQUM7TUFDSCxDQUFDLE1BQU07UUFDTjNCLFFBQVEsR0FBRzZCLCtCQUErQjtNQUMzQztNQUNBLElBQUksQ0FBQy9ZLFlBQVksQ0FBQzJFLE1BQU0sQ0FBQ3VTLFFBQVEsQ0FBQztNQUNsQyxJQUFJLENBQUN6UyxpQkFBaUIsR0FBRyxJQUFJLENBQUNJLG9CQUFvQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUNKLGlCQUFpQixDQUFDO01BQ2hGO01BQ0EsSUFBSSxJQUFJLENBQUNBLGlCQUFpQixFQUFFO1FBQzNCMlMsT0FBTyxHQUFHLElBQUs0QixNQUFNLENBQVMsRUFBRSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsVUFBQ0MsSUFBUyxFQUFFQyxJQUFTLEVBQUs7VUFDdkUsSUFBSSxDQUFDNUIsd0JBQXdCLEVBQUU7WUFDOUJBLHdCQUF3QixHQUFHLE9BQUksQ0FBQzdTLGlCQUFpQixJQUFJLE9BQUksQ0FBQ0EsaUJBQWlCLENBQUNDLFdBQVcsRUFBRTtVQUMxRjtVQUNBLElBQU15VSxLQUFLLEdBQUcsT0FBSSxDQUFDM0MsZUFBZSxDQUFDeUMsSUFBSSxFQUFFM0Isd0JBQXdCLENBQUM7VUFDbEUsSUFBTThCLEtBQUssR0FBRyxPQUFJLENBQUM1QyxlQUFlLENBQUMwQyxJQUFJLEVBQUU1Qix3QkFBd0IsQ0FBQztVQUNsRSxJQUFJNkIsS0FBSyxHQUFHQyxLQUFLLEVBQUU7WUFDbEIsT0FBTyxDQUFDLENBQUM7VUFDVjtVQUNBLElBQUlELEtBQUssR0FBR0MsS0FBSyxFQUFFO1lBQ2xCLE9BQU8sQ0FBQztVQUNUO1VBQ0EsT0FBTyxDQUFDO1FBQ1QsQ0FBQyxDQUFDO1FBQ0YsSUFBSSxDQUFDcFosWUFBWSxDQUFDcUgsSUFBSSxDQUFDK1AsT0FBTyxDQUFDO01BQ2hDO0lBQ0Q7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTEM7SUFBQSxPQU1BUixlQUFlLEdBQWYseUJBQWdCbE4sVUFBa0IsRUFBRW9JLEtBQVUsRUFBRTtNQUMvQyxPQUFPcEksVUFBVSxLQUFLb0ksS0FBSyxDQUFDelIsS0FBSyxFQUFFO0lBQ3BDOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUxDO0lBQUEsT0FNQThHLGdCQUFnQixHQUFoQiwwQkFBaUJ1USxXQUFxQixFQUFFNUYsS0FBVSxFQUFFO01BQ25ELE9BQU80RixXQUFXLENBQUNoRyxJQUFJLENBQUMsVUFBVWhJLFVBQVUsRUFBRTtRQUM3QyxJQUFJQSxVQUFVLEtBQUtvSSxLQUFLLENBQUN6UixLQUFLLEVBQUUsRUFBRTtVQUNqQyxPQUFPLElBQUk7UUFDWjtRQUNBLE9BQU8sS0FBSztNQUNiLENBQUMsQ0FBQztJQUNIOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FQQztJQUFBLE9BUUFnWix5QkFBeUIsR0FBekIsbUNBQTBCbFgsV0FBZ0IsRUFBRStQLGFBQXFCLEVBQUU7TUFDbEUsSUFBSUEsYUFBYSxFQUFFO1FBQ2xCLElBQU1uTixTQUFTLEdBQUc1QyxXQUFXLENBQUN1QyxXQUFXLEVBQUU7UUFDM0MsSUFBSW5DLFFBQVE7UUFDWixLQUFLLElBQUlNLENBQUMsR0FBRyxDQUFDLEVBQUVBLENBQUMsR0FBR2tDLFNBQVMsQ0FBQ2pDLE1BQU0sRUFBRUQsQ0FBQyxFQUFFLEVBQUU7VUFDMUMsSUFBSWtDLFNBQVMsQ0FBQ2xDLENBQUMsQ0FBQyxDQUFDK0IsVUFBVSxFQUFFLElBQUlHLFNBQVMsQ0FBQ2xDLENBQUMsQ0FBQyxDQUFDb0ksUUFBUSxFQUFFLEtBQUtpSCxhQUFhLEVBQUU7WUFDM0UzUCxRQUFRLEdBQUd3QyxTQUFTLENBQUNsQyxDQUFDLENBQUM7WUFDdkI7VUFDRDtRQUNEO1FBQ0EsT0FBT04sUUFBUTtNQUNoQjtJQUNEOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxPQU9BbVMsNkNBQTZDLEdBQTdDLHVEQUE4Q3ZTLFdBQWdCLEVBQUUrUCxhQUFxQixFQUFFO01BQ3RGLElBQU1vSCxjQUFjLEdBQUduWCxXQUFXLENBQUNvWCxnQkFBZ0IsRUFBRTtNQUNyRCxJQUFJRCxjQUFjLEVBQUU7UUFDbkIsSUFBTS9XLFFBQVEsR0FBRyxJQUFJLENBQUM4Vyx5QkFBeUIsQ0FBQ2xYLFdBQVcsRUFBRStQLGFBQWEsQ0FBQztRQUMzRSxJQUFNc0gsa0JBQWtCLEdBQUdyWCxXQUFXLENBQUNzUyxrQkFBa0IsRUFBRTtRQUMzRCxJQUFJbFMsUUFBUSxJQUFJaVgsa0JBQWtCLEtBQUtqWCxRQUFRLENBQUNsQyxLQUFLLEVBQUUsRUFBRTtVQUN4RDhCLFdBQVcsQ0FBQ3NYLGtCQUFrQixDQUFDbFgsUUFBUSxDQUFDbEMsS0FBSyxFQUFFLENBQUM7UUFDakQ7TUFDRDtJQUNELENBQUM7SUFBQSxPQUVLMlMsa0RBQWtELCtEQUFDNU4sTUFBVyxFQUFFakQsV0FBZ0IsRUFBRStQLGFBQXFCO01BQUEsSUFBaUI7UUFBQSxjQUs3SCxJQUFJO1FBSkosSUFBTW5QLFdBQVcsR0FBR3FDLE1BQU0sQ0FBQ3BDLGFBQWEsRUFBRTtRQUMxQyxJQUFNMFcsYUFBYSxHQUFHdFUsTUFBTSxDQUFDM0QsaUJBQWlCLEVBQUU7UUFDaEQsSUFBTWtZLFVBQVUsR0FBR3hYLFdBQVcsQ0FBQ1YsaUJBQWlCLEVBQUU7UUFDbEQsSUFBTW1ZLDBCQUEwQixHQUFHLEVBQUVGLGFBQWEsS0FBS0MsVUFBVSxDQUFDO1FBQ2xFLFFBQUtqRiw2Q0FBNkMsQ0FBQ3ZTLFdBQVcsRUFBRStQLGFBQWEsQ0FBQztRQUM5RSx1QkFBTyxJQUFJcE8sT0FBTyxDQUFDLFVBQVVDLE9BQWlCLEVBQUU7VUFDL0MsSUFBSTZWLDBCQUEwQixFQUFFO1lBQy9CN1csV0FBVyxDQUFDaUIsZUFBZSxDQUFDLFFBQVEsRUFBRSxZQUFZO2NBQ2pERCxPQUFPLEVBQUU7WUFDVixDQUFDLENBQUM7VUFDSCxDQUFDLE1BQU07WUFDTkEsT0FBTyxFQUFFO1VBQ1Y7UUFDRCxDQUFDLENBQUM7TUFDSCxDQUFDO1FBQUE7TUFBQTtJQUFBO0lBRUQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFOQztJQUFBLE9BT0F3RyxZQUFZLEdBQVosc0JBQWFwQyxRQUFhLEVBQUU7TUFDM0I7TUFDQSxJQUFJeUosY0FBYyxHQUFHekosUUFBUSxDQUFDVSxTQUFTLEVBQUU7TUFDekMsT0FBTytJLGNBQWMsSUFBSSxDQUFDQSxjQUFjLENBQUNoUCxHQUFHLENBQUMsa0JBQWtCLENBQUMsRUFBRTtRQUNqRWdQLGNBQWMsR0FBR0EsY0FBYyxDQUFDL0ksU0FBUyxFQUFFO01BQzVDO01BQ0EsT0FBTytJLGNBQWMsSUFBSUEsY0FBYyxDQUFDaFAsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEdBQUdnUCxjQUFjLEdBQUdoSCxTQUFTO0lBQzdGLENBQUM7SUFBQSxPQUVENEksYUFBYSxHQUFiLHVCQUFjcUcsU0FBYyxFQUFFO01BQzdCLE9BQU9BLFNBQVMsQ0FBQ25YLFlBQVksQ0FBQyxJQUFJLEVBQUUsVUFBVUMsS0FBVSxFQUFFO1FBQ3pELE9BQ0NBLEtBQUssQ0FBQ0MsR0FBRyxDQUFDLG9CQUFvQixDQUFDLElBQy9CO1FBQ0FELEtBQUssQ0FBQ2tHLFNBQVMsRUFBRSxLQUFLZ1IsU0FBUztNQUVqQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDTjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsT0FPQWhQLFlBQVksR0FBWixzQkFBYTFDLFFBQWEsRUFBRTtNQUMzQixJQUFJeUosY0FBYyxHQUFHekosUUFBUSxDQUFDVSxTQUFTLEVBQUU7TUFDekMsT0FDQytJLGNBQWMsSUFDZCxDQUFDQSxjQUFjLENBQUNoUCxHQUFHLENBQUMsa0JBQWtCLENBQUMsSUFDdkMsQ0FBQ2dQLGNBQWMsQ0FBQ2hQLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxJQUMvQyxDQUFDZ1AsY0FBYyxDQUFDaFAsR0FBRyxDQUFDdVMsY0FBYyxDQUFDQyxXQUFXLEVBQUUsQ0FBQ0MsT0FBTyxFQUFFLENBQUMsRUFDMUQ7UUFDRHpELGNBQWMsR0FBR0EsY0FBYyxDQUFDL0ksU0FBUyxFQUFFO01BQzVDO01BQ0EsT0FBTytJLGNBQWMsS0FDbkJBLGNBQWMsQ0FBQ2hQLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUN0Q2dQLGNBQWMsQ0FBQ2hQLEdBQUcsQ0FBQywwQkFBMEIsQ0FBQyxJQUM5Q2dQLGNBQWMsQ0FBQ2hQLEdBQUcsQ0FBQ3VTLGNBQWMsQ0FBQ0MsV0FBVyxFQUFFLENBQUNDLE9BQU8sRUFBRSxDQUFDLENBQUMsR0FDMUR6RCxjQUFjLEdBQ2RoSCxTQUFTO0lBQ2I7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FOQztJQUFBLE9BT0FFLGlCQUFpQixHQUFqQiwyQkFBa0IzQyxRQUFhLEVBQUU7TUFDaEMsSUFBTTJSLFNBQVMsR0FBRyxJQUFJLENBQUNqUCxZQUFZLENBQUMxQyxRQUFRLENBQUM7TUFDN0MsSUFBSXRDLFNBQVM7TUFDYixJQUFJaVUsU0FBUyxDQUFDbFgsR0FBRyxDQUFDLGtCQUFrQixDQUFDLEVBQUU7UUFDdENpRCxTQUFTLEdBQUdpVSxTQUFTLENBQUMxUCxRQUFRLEVBQUU7TUFDakMsQ0FBQyxNQUFNO1FBQ052RSxTQUFTLEdBQUdpVSxTQUFTLENBQ25CQyxRQUFRLEVBQUUsQ0FDVmpWLFFBQVEsRUFBRSxDQUNWa1YsU0FBUyxDQUFDLFVBQVVDLE9BQVksRUFBRTtVQUNsQyxPQUFPQSxPQUFPLENBQUM1WixLQUFLLEVBQUUsS0FBS3laLFNBQVMsQ0FBQ3paLEtBQUssRUFBRTtRQUM3QyxDQUFDLENBQUM7TUFDSjtNQUNBLE9BQU93RixTQUFTO0lBQ2pCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BTkM7SUFBQSxPQU9BNEUsb0JBQW9CLEdBQXBCLDhCQUFxQnRDLFFBQWEsRUFBRTtNQUNuQyxJQUFNK1Isa0JBQWtCLEdBQUcsVUFBVUQsT0FBWSxFQUFFdkcsVUFBZSxFQUFFO1FBQ25FLE9BQU9BLFVBQVUsQ0FBQ3lHLFFBQVEsRUFBRSxDQUFDSCxTQUFTLENBQUMsVUFBVUksS0FBVSxFQUFFO1VBQzVELE9BQU9BLEtBQUssQ0FBQy9aLEtBQUssRUFBRSxLQUFLNFosT0FBTyxDQUFDNVosS0FBSyxFQUFFO1FBQ3pDLENBQUMsQ0FBQztNQUNILENBQUM7TUFDRCxJQUFNZ2Esb0JBQW9CLEdBQUcsVUFBVUosT0FBWSxFQUFFdkcsVUFBZSxFQUFFO1FBQ3JFLElBQUk0RyxjQUFjLEdBQUdMLE9BQU8sQ0FBQ3BSLFNBQVMsRUFBRTtVQUN2QzBSLGdCQUFnQixHQUFHTCxrQkFBa0IsQ0FBQ0ksY0FBYyxFQUFFNUcsVUFBVSxDQUFDO1FBQ2xFLE9BQU80RyxjQUFjLElBQUlDLGdCQUFnQixHQUFHLENBQUMsRUFBRTtVQUM5Q0QsY0FBYyxHQUFHQSxjQUFjLENBQUN6UixTQUFTLEVBQUU7VUFDM0MwUixnQkFBZ0IsR0FBR0wsa0JBQWtCLENBQUNJLGNBQWMsRUFBRTVHLFVBQVUsQ0FBQztRQUNsRTtRQUNBLE9BQU82RyxnQkFBZ0I7TUFDeEIsQ0FBQztNQUNELElBQU03RyxVQUFVLEdBQUcsSUFBSSxDQUFDN0ksWUFBWSxDQUFDMUMsUUFBUSxDQUFDO01BQzlDLElBQUlxQyxrQkFBa0I7TUFDdEJBLGtCQUFrQixHQUFHNlAsb0JBQW9CLENBQUNsUyxRQUFRLEVBQUV1TCxVQUFVLENBQUM7TUFDL0QsSUFBSUEsVUFBVSxDQUFDOVEsR0FBRyxDQUFDLDBCQUEwQixDQUFDLEVBQUU7UUFDL0MsSUFBTTRYLGFBQWEsR0FBRzlHLFVBQVUsQ0FBQ3lHLFFBQVEsRUFBRSxDQUFDM1Asa0JBQWtCLENBQUMsQ0FBQ25LLEtBQUssRUFBRTtVQUN0RThWLGFBQWEsR0FBR3pDLFVBQVUsQ0FBQ3FHLFFBQVEsRUFBRSxDQUFDclAsVUFBVSxFQUFFO1FBQ25ERixrQkFBa0IsR0FBRzJMLGFBQWEsQ0FBQzZELFNBQVMsQ0FBQyxVQUFVdEUsTUFBVyxFQUFFO1VBQ25FLElBQUlBLE1BQU0sQ0FBQytFLG1CQUFtQixFQUFFLEVBQUU7WUFDakMsT0FBT0QsYUFBYSxDQUFDNU4sTUFBTSxDQUFDOEksTUFBTSxDQUFDK0UsbUJBQW1CLEVBQUUsQ0FBQ3BhLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLEtBQUs7VUFDdEYsQ0FBQyxNQUFNO1lBQ04sT0FBTyxLQUFLO1VBQ2I7UUFDRCxDQUFDLENBQUM7TUFDSDtNQUNBLE9BQU9tSyxrQkFBa0I7SUFDMUIsQ0FBQztJQUFBLE9BRUQ4SSxnQkFBZ0IsR0FBaEIsMEJBQWlCdUcsU0FBYyxFQUFFO01BQ2hDLE9BQU9BLFNBQVMsQ0FBQ25YLFlBQVksQ0FBQyxJQUFJLEVBQUUsVUFBVUMsS0FBVSxFQUFFO1FBQ3pELE9BQ0NBLEtBQUssQ0FBQ0MsR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQzdCO1FBQ0FELEtBQUssQ0FBQ29YLFFBQVEsRUFBRSxDQUFDbFIsU0FBUyxFQUFFLEtBQUtnUixTQUFTO01BRTVDLENBQUMsQ0FBQztJQUNILENBQUM7SUFBQSxPQUVEN1Esb0JBQW9CLEdBQXBCLDhCQUFxQjVELE1BQVcsRUFBRVcsY0FBdUIsRUFBRTtNQUMxRDtNQUNBLElBQU0yVSxjQUFjLEdBQUcsVUFBVUMsQ0FBUyxFQUFFO1FBQzNDLE9BQU9BLENBQUMsQ0FBQ2xWLE9BQU8sQ0FBQyx3QkFBd0IsRUFBRSxNQUFNLENBQUM7TUFDbkQsQ0FBQztNQUNEO01BQ0E7TUFDQSxPQUFPTSxjQUFjLENBQ25CNEMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQ2ZsRCxPQUFPLENBQ1AsSUFBSWdELE1BQU0sV0FBSWlTLGNBQWMsV0FBSXRWLE1BQU0sQ0FBQzNELGlCQUFpQixFQUFFLENBQUN5QixPQUFPLEVBQUUsY0FBSWtDLE1BQU0sQ0FBQ3BDLGFBQWEsRUFBRSxDQUFDRSxPQUFPLEVBQUUsRUFBRyxlQUFZLEVBQ3ZILEVBQUUsQ0FDRjtJQUNILENBQUM7SUFBQSxPQUVEMkIsb0JBQW9CLEdBQXBCLDhCQUFxQnNELFFBQWEsRUFBRTFELGlCQUFzQixFQUFFO01BQzNELElBQUlBLGlCQUFpQixFQUFFO1FBQ3RCLE9BQU9BLGlCQUFpQjtNQUN6QjtNQUNBQSxpQkFBaUIsR0FBRzBELFFBQVE7TUFDNUI7TUFDQSxPQUFPMUQsaUJBQWlCLElBQUksQ0FBQ0EsaUJBQWlCLENBQUM3QixHQUFHLENBQUMsMkJBQTJCLENBQUMsRUFBRTtRQUNoRjZCLGlCQUFpQixHQUFHQSxpQkFBaUIsQ0FBQ29FLFNBQVMsRUFBRTtNQUNsRDtNQUNBLE9BQU9wRSxpQkFBaUI7SUFDekIsQ0FBQztJQUFBLE9BRURtVyxvQkFBb0IsR0FBcEIsOEJBQXFCeFYsTUFBVyxFQUFFeVYsU0FBaUIsRUFBRTtNQUNwRCxJQUFNQyxpQkFBaUIsR0FBRzFWLE1BQU0sQ0FBQ3NGLFVBQVUsRUFBRSxDQUFDbVEsU0FBUyxDQUFDLENBQUNsUSxlQUFlLEVBQUU7TUFDMUUsT0FBT3ZGLE1BQU0sQ0FDWHdRLGtCQUFrQixFQUFFLENBQ3BCQyxhQUFhLENBQUN6USxNQUFNLENBQUMsQ0FDckJtRSxJQUFJLENBQUMsVUFBVXVNLE9BQVksRUFBRTtRQUM3QixPQUFPQSxPQUFPLENBQUNHLElBQUksS0FBSzZFLGlCQUFpQixJQUFJLENBQUMsQ0FBQ2hGLE9BQU8sQ0FBQ0MsUUFBUTtNQUNoRSxDQUFDLENBQUM7SUFDSixDQUFDO0lBQUEsT0FFRGdGLHlCQUF5QixHQUF6QixtQ0FBMEIzVixNQUFXLEVBQUU7TUFDdEMsSUFBTTRWLGlCQUFpQixHQUFHLElBQUksQ0FBQ0osb0JBQW9CLENBQUN4VixNQUFNLEVBQUUsQ0FBQyxDQUFDO01BQzlELElBQUl1SixzQkFBc0I7TUFDMUIsSUFBSXFNLGlCQUFpQixFQUFFO1FBQ3RCLElBQUlBLGlCQUFpQixDQUFDaEYsYUFBYSxFQUFFO1VBQ3BDckgsc0JBQXNCLEdBQUdxTSxpQkFBaUIsQ0FBQ2hGLGFBQWEsQ0FBQyxDQUFDLENBQUMsQ0FBQ3ZRLE9BQU8sQ0FBQyxZQUFZLEVBQUUsRUFBRSxDQUFDO1FBQ3RGLENBQUMsTUFBTTtVQUNOa0osc0JBQXNCLEdBQUcvRCxTQUFTO1FBQ25DO01BQ0QsQ0FBQyxNQUFNO1FBQ04rRCxzQkFBc0IsR0FBR3ZKLE1BQU0sQ0FBQ3NGLFVBQVUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDQyxlQUFlLEVBQUU7TUFDbEU7TUFDQSxPQUFPZ0Usc0JBQXNCO0lBQzlCLENBQUM7SUFBQSxPQUVEc00sZ0RBQWdELEdBQWhELDBEQUFpRDdWLE1BQVcsRUFBRVEsZ0JBQXFCLEVBQUUrSSxzQkFBOEIsRUFBRTtNQUNwSCxJQUFJOEosZUFBZTtNQUNuQixJQUFJN1MsZ0JBQWdCLElBQUkrSSxzQkFBc0IsRUFBRTtRQUMvQyxJQUFNdEosTUFBTSxHQUFHRCxNQUFNLENBQUNmLFFBQVEsRUFBRTtRQUNoQyxJQUFNNkgsVUFBVSxHQUFHN0csTUFBTSxDQUFDOEcsWUFBWSxFQUFFO1FBQ3hDLElBQU0rTyxTQUFTLEdBQUdoUCxVQUFVLENBQUNHLFdBQVcsQ0FBQ3pHLGdCQUFnQixDQUFDMUMsT0FBTyxFQUFFLENBQUM7UUFDcEUsSUFBSWdKLFVBQVUsQ0FBQ2pLLFNBQVMsV0FBSWlaLFNBQVMsY0FBSXZNLHNCQUFzQixnREFBNkMsRUFBRTtVQUM3RzhKLGVBQWUsR0FBR3ZNLFVBQVUsQ0FBQ2lQLG9CQUFvQixXQUM3Q0QsU0FBUyxjQUFJdk0sc0JBQXNCLDBDQUN0QztRQUNGO01BQ0Q7TUFDQSxPQUFPOEosZUFBZTtJQUN2QixDQUFDO0lBQUEsT0FFRDJDLHNCQUFzQixHQUF0QixnQ0FBdUJ6TSxzQkFBOEIsRUFBRS9JLGdCQUFxQixFQUFFeVYsbUJBQTJCLEVBQUVDLGdCQUF3QixFQUFFO01BQ3BJLElBQU1DLFVBQVUsR0FBRzNWLGdCQUFnQixDQUFDc0osUUFBUSxDQUFDUCxzQkFBc0IsQ0FBQztNQUNwRSxJQUFJNk0sVUFBVTtNQUNkLElBQUlDLGNBQWMsR0FBR0YsVUFBVTtNQUMvQixJQUFJRixtQkFBbUIsRUFBRTtRQUN4QixJQUFJMU0sc0JBQXNCLENBQUMrTSxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1VBQ2hEO1VBQ0EvTSxzQkFBc0IsR0FBR0Esc0JBQXNCLENBQUNnTixLQUFLLENBQUMsQ0FBQyxFQUFFaE4sc0JBQXNCLENBQUMrTSxXQUFXLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1VBQ3JHL00sc0JBQXNCLEdBQUdBLHNCQUFzQixDQUFDaU4sTUFBTSxDQUFDUCxtQkFBbUIsQ0FBQztRQUM1RSxDQUFDLE1BQU07VUFDTjFNLHNCQUFzQixHQUFHME0sbUJBQW1CO1FBQzdDO1FBQ0FHLFVBQVUsR0FBRzVWLGdCQUFnQixDQUFDc0osUUFBUSxDQUFDUCxzQkFBc0IsQ0FBQztRQUM5RCxJQUFJNk0sVUFBVSxFQUFFO1VBQ2YsSUFBSUYsZ0JBQWdCLEVBQUU7WUFDckIsSUFBTU8sV0FBVyxHQUFHUCxnQkFBZ0IsQ0FBQ0ssS0FBSyxDQUFDTCxnQkFBZ0IsQ0FBQ2xZLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDN0UsUUFBUXlZLFdBQVc7Y0FDbEIsS0FBSyxVQUFVO2dCQUNkSixjQUFjLEdBQUdELFVBQVU7Z0JBQzNCO2NBQ0QsS0FBSyxXQUFXO2dCQUNmQyxjQUFjLGFBQU1ELFVBQVUsZUFBS0QsVUFBVSxNQUFHO2dCQUNoRDtjQUNELEtBQUssVUFBVTtnQkFDZEUsY0FBYyxhQUFNRixVQUFVLGVBQUtDLFVBQVUsTUFBRztnQkFDaEQ7Y0FDRCxLQUFLLGNBQWM7Z0JBQ2xCQyxjQUFjLEdBQUdGLFVBQVU7Z0JBQzNCO2NBQ0Q7WUFBUTtVQUVWLENBQUMsTUFBTTtZQUNORSxjQUFjLGFBQU1ELFVBQVUsZUFBS0QsVUFBVSxNQUFHO1VBQ2pEO1FBQ0Q7TUFDRDtNQUNBLE9BQU9FLGNBQWM7SUFDdEIsQ0FBQztJQUFBLE9BRUQ3UixpQkFBaUIsR0FBakIsMkJBQWtCeEUsTUFBVyxFQUFFc0UsVUFBa0IsRUFBRTtNQUNsRCxJQUFNRyxRQUFRLEdBQUduQyxJQUFJLENBQUNvQyxJQUFJLENBQUNKLFVBQVUsQ0FBQztNQUN0QyxJQUFJRyxRQUFRLElBQUksQ0FBQ0EsUUFBUSxDQUFDakgsR0FBRyxDQUFDLG9CQUFvQixDQUFDLElBQUksQ0FBQ2lILFFBQVEsQ0FBQ2pILEdBQUcsQ0FBQyxhQUFhLENBQUMsRUFBRTtRQUNwRixPQUFPd0MsTUFBTSxDQUFDMUMsWUFBWSxDQUFDLElBQUksRUFBRSxVQUFVQyxLQUFVLEVBQUU7VUFDdEQsT0FBT0EsS0FBSyxDQUFDdEMsS0FBSyxFQUFFLEtBQUt3SixRQUFRO1FBQ2xDLENBQUMsQ0FBQztNQUNIO01BQ0EsT0FBTyxLQUFLO0lBQ2IsQ0FBQztJQUFBLE9BRURFLDJCQUEyQixHQUEzQixxQ0FBNEJGLFFBQWEsRUFBRTtNQUMxQyxJQUFJK0ksY0FBYyxHQUFHL0ksUUFBUSxDQUFDaEIsU0FBUyxFQUFFO01BQ3pDLE9BQ0MrSixjQUFjLElBQ2QsQ0FBQ0EsY0FBYyxDQUFDaFEsR0FBRyxDQUFDLGtCQUFrQixDQUFDLElBQ3ZDLENBQUNnUSxjQUFjLENBQUNoUSxHQUFHLENBQUMsMEJBQTBCLENBQUMsSUFDL0MsQ0FBQ2dRLGNBQWMsQ0FBQ2hRLEdBQUcsQ0FBQ3VTLGNBQWMsQ0FBQ0MsV0FBVyxFQUFFLENBQUNDLE9BQU8sRUFBRSxDQUFDLEVBQzFEO1FBQ0R6QyxjQUFjLEdBQUdBLGNBQWMsQ0FBQy9KLFNBQVMsRUFBRTtNQUM1QztNQUVBLE9BQU8sQ0FBQyxDQUFDK0osY0FBYyxJQUFJQSxjQUFjLENBQUNoUSxHQUFHLENBQUMsMEJBQTBCLENBQUM7SUFDMUU7O0lBRUE7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQVBDO0lBQUEsT0FRQW1NLGdCQUFnQixHQUFoQiwwQkFBaUJpRCxRQUFhLEVBQUU1TSxNQUFXLEVBQUU7TUFDNUMsSUFBTTBXLHNCQUFzQixHQUFHOUosUUFBUSxDQUFDdlEsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUNRLFNBQVMsRUFBRSxDQUFDZ1EsU0FBUyxFQUFFLENBQUM3RyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUNDLEdBQUcsRUFBRTtNQUM3RyxPQUFPakcsTUFBTSxDQUNYeUQsU0FBUyxFQUFFLENBQ1hrVCxrQkFBa0IsRUFBRSxDQUNwQkMsT0FBTyxDQUFDelMsSUFBSSxDQUFDLFVBQVV1TSxPQUFZLEVBQUU7UUFDckMsT0FBT0EsT0FBTyxDQUFDblYsR0FBRyxDQUFDeUssS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDQyxHQUFHLEVBQUUsS0FBS3lRLHNCQUFzQjtNQUNoRSxDQUFDLENBQUM7SUFDSjs7SUFFQTtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQU5DO0lBQUEsT0FPQTNNLHFCQUFxQixHQUFyQiwrQkFBc0I3TCxLQUFVLEVBQVc7TUFDMUM7TUFDQSxJQUFNMlksU0FBUyxHQUFHMWIsR0FBRyxDQUFDQyxFQUFFLENBQUMwYixPQUFPLENBQUMsdUJBQXVCLENBQUM7UUFDeERDLFNBQVMsR0FBRzdZLEtBQUssSUFBSTJZLFNBQVMsQ0FBQ0csb0JBQW9CLENBQUM5WSxLQUFLLENBQUMsSUFBSTJZLFNBQVMsQ0FBQ0csb0JBQW9CLENBQUM5WSxLQUFLLENBQUMsQ0FBQytZLGFBQWEsRUFBRTtNQUNwSCxJQUFJQyxlQUFlLEdBQUcsS0FBSztRQUMxQkMsYUFBYSxHQUFHLEtBQUs7TUFDdEIsSUFBSUosU0FBUyxJQUFJdlYsTUFBTSxDQUFDQyxJQUFJLENBQUNzVixTQUFTLENBQUMsQ0FBQy9ZLE9BQU8sQ0FBQ0UsS0FBSyxDQUFDTixhQUFhLEVBQUUsQ0FBQ21VLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFO1FBQ3BGbUYsZUFBZSxHQUNkSCxTQUFTLENBQUM3WSxLQUFLLGFBQUxBLEtBQUssdUJBQUxBLEtBQUssQ0FBRU4sYUFBYSxFQUFFLENBQUNtVSxLQUFLLENBQUMsSUFDdkNnRixTQUFTLENBQUM3WSxLQUFLLGFBQUxBLEtBQUssdUJBQUxBLEtBQUssQ0FBRU4sYUFBYSxFQUFFLENBQUNtVSxLQUFLLENBQUMsQ0FBQ3FGLE1BQU0sSUFDOUNMLFNBQVMsQ0FBQzdZLEtBQUssYUFBTEEsS0FBSyx1QkFBTEEsS0FBSyxDQUFFTixhQUFhLEVBQUUsQ0FBQ21VLEtBQUssQ0FBQyxDQUFDcUYsTUFBTSxDQUFDQyxLQUFLLEdBQ2pELElBQUksR0FDSixLQUFLO01BQ1Y7TUFDQUYsYUFBYSxHQUNaRCxlQUFlLEtBQ2ZoWixLQUFLLGFBQUxBLEtBQUssdUJBQUxBLEtBQUssQ0FBRW9aLGNBQWMsRUFBRSxDQUFDQyxhQUFhLEVBQUUsS0FDdkMsQ0FBQXJaLEtBQUssYUFBTEEsS0FBSyx1QkFBTEEsS0FBSyxDQUFFb1osY0FBYyxFQUFFLENBQUNDLGFBQWEsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDQyxXQUFXLENBQUMzZCxJQUFJLENBQUNtRSxPQUFPLENBQUMsWUFBWSxDQUFDLE1BQUssQ0FBQyxDQUFDO01BQ3pGLE9BQU9tWixhQUFhO0lBQ3JCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FiQztJQUFBLE9BY0F2UyxtQkFBbUIsR0FBbkIsNkJBQ0N2RCxPQUFvQixFQUNwQjBDLHdCQUFtQyxFQUNuQ3ZELGdCQUF5QixFQUN6QnlELG1CQUEyQixFQUMzQlQsZUFBK0IsRUFDL0J4RCxNQUFnQixFQUNoQlksY0FBdUIsRUFDdkJzQyxnQkFBc0IsRUFDckI7TUFDRCxJQUFJQyxnQkFBZ0I7TUFDcEIsSUFBSXNVLGlCQUFpQjtNQUNyQixJQUFNbE8sc0JBQXNCLEdBQUl2SixNQUFNLENBQUN5RCxTQUFTLEVBQUUsQ0FBYytGLG1CQUFtQixFQUFFO01BQ3JGLElBQU1FLHFCQUFxQixHQUFHLElBQUksQ0FBQ0MsZ0JBQWdCLENBQUN0SSxPQUFPLEVBQUVyQixNQUFNLENBQUM7TUFDcEUsSUFBSVksY0FBYyxFQUFFO1FBQ25CdUMsZ0JBQWdCLEdBQUd1VSxXQUFXLENBQUNDLGlCQUFpQixDQUFDLHlCQUF5QixFQUFFblUsZUFBZSxFQUFFLENBQzVGQSxlQUFlLENBQUNoQixPQUFPLENBQUMsZ0RBQWdELENBQUMsRUFDekV5QixtQkFBbUIsR0FBR0EsbUJBQW1CLEdBQUd5RixxQkFBcUIsQ0FBQ00sS0FBSyxDQUN2RSxDQUFDO01BQ0gsQ0FBQyxNQUFNO1FBQ04sSUFBTTROLDBDQUEwQyxHQUFHLElBQUksQ0FBQy9CLGdEQUFnRCxDQUN2RzdWLE1BQU0sRUFDTlEsZ0JBQWdCLEVBQ2hCK0ksc0JBQXNCLENBQ3RCO1FBQ0QsSUFBTXNPLGdDQUFnQyxHQUFHRCwwQ0FBMEMsR0FDaEZBLDBDQUEwQyxDQUFDL2EsU0FBUyxDQUFDLE9BQU8sQ0FBQyxHQUM3RDJJLFNBQVM7UUFDWixJQUFNc1MsNkJBQTZCLEdBQ2xDRCxnQ0FBZ0MsSUFBSUQsMENBQTBDLEdBQzNFQSwwQ0FBMEMsQ0FBQy9hLFNBQVMsQ0FBQyx5REFBeUQsQ0FBQyxHQUMvRzJJLFNBQVM7UUFDYixJQUFJekIsd0JBQXdCLENBQUNyRyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1VBQ3hDO1VBQ0EsSUFBSXdGLGdCQUFnQixFQUFFO1lBQ3JCO1lBQ0F1VSxpQkFBaUIsR0FBR3ZVLGdCQUFnQixDQUFDNEcsUUFBUSxFQUFFO1VBQ2hELENBQUMsTUFBTSxJQUFJdEosZ0JBQWdCLElBQUkrSSxzQkFBc0IsRUFBRTtZQUN0RGtPLGlCQUFpQixHQUFHLElBQUksQ0FBQ3pCLHNCQUFzQixDQUM5Q3pNLHNCQUFzQixFQUN0Qi9JLGdCQUFnQixFQUNoQnFYLGdDQUFnQyxFQUNoQ0MsNkJBQTZCLENBQzdCO1VBQ0YsQ0FBQyxNQUFNO1lBQ05MLGlCQUFpQixHQUFHalMsU0FBUztVQUM5QjtVQUNBO1VBQ0EsSUFBTXVTLFdBQWdCLEdBQUcsSUFBSSxDQUFDQyxvQkFBb0IsQ0FBQ3RPLHFCQUFxQixFQUFFbEcsZUFBZSxDQUFDO1VBQzFGLElBQUlpVSxpQkFBaUIsSUFBSXhULG1CQUFtQixFQUFFO1lBQzdDZCxnQkFBZ0IsR0FBR3VVLFdBQVcsQ0FBQ0MsaUJBQWlCLENBQUMseUJBQXlCLEVBQUVuVSxlQUFlLEVBQUUsQ0FDNUZpVSxpQkFBaUIsRUFDakJ4VCxtQkFBbUIsQ0FDbkIsQ0FBQztVQUNILENBQUMsTUFBTSxJQUFJd1QsaUJBQWlCLElBQUlNLFdBQVcsQ0FBQ0UsZ0JBQWdCLEtBQUssUUFBUSxFQUFFO1lBQzFFOVUsZ0JBQWdCLGFBQU1LLGVBQWUsQ0FBQ2hCLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQyxlQUFLaVYsaUJBQWlCLGVBQzNHTSxXQUFXLENBQUNHLFlBQVksQ0FDdkI7VUFDSCxDQUFDLE1BQU0sSUFBSVQsaUJBQWlCLElBQUlNLFdBQVcsQ0FBQ0UsZ0JBQWdCLEtBQUssU0FBUyxFQUFFO1lBQzNFOVUsZ0JBQWdCLEdBQUd1VSxXQUFXLENBQUNDLGlCQUFpQixDQUFDLHlCQUF5QixFQUFFblUsZUFBZSxFQUFFLENBQzVGaVUsaUJBQWlCLEVBQ2pCTSxXQUFXLENBQUNHLFlBQVksQ0FDeEIsQ0FBQztVQUNILENBQUMsTUFBTSxJQUFJVCxpQkFBaUIsSUFBSU0sV0FBVyxDQUFDRSxnQkFBZ0IsS0FBSyxXQUFXLEVBQUU7WUFDN0U5VSxnQkFBZ0IsYUFBTUssZUFBZSxDQUFDaEIsT0FBTyxDQUFDLHVDQUF1QyxDQUFDLGVBQUtpVixpQkFBaUIsQ0FBRTtVQUMvRyxDQUFDLE1BQU0sSUFBSSxDQUFDQSxpQkFBaUIsSUFBSXhULG1CQUFtQixFQUFFO1lBQ3JEZCxnQkFBZ0IsR0FBR0ssZUFBZSxDQUFDaEIsT0FBTyxDQUFDLDBDQUEwQyxDQUFDLEdBQUcsSUFBSSxHQUFHeUIsbUJBQW1CO1VBQ3BILENBQUMsTUFBTSxJQUFJLENBQUN3VCxpQkFBaUIsSUFBSU0sV0FBVyxDQUFDRSxnQkFBZ0IsS0FBSyxRQUFRLEVBQUU7WUFDM0U5VSxnQkFBZ0IsR0FBRzRVLFdBQVcsQ0FBQ0csWUFBWTtVQUM1QyxDQUFDLE1BQU07WUFDTi9VLGdCQUFnQixHQUFHLElBQUk7VUFDeEI7UUFDRCxDQUFDLE1BQU07VUFDTkEsZ0JBQWdCLEdBQUcsSUFBSTtRQUN4QjtNQUNEO01BQ0EsT0FBT0EsZ0JBQWdCO0lBQ3hCLENBQUM7SUFBQSxPQUVENlUsb0JBQW9CLEdBQXBCLDhCQUFxQnRPLHFCQUEwQixFQUFFbEcsZUFBb0IsRUFBRTtNQUN0RSxJQUFNdVUsV0FBZ0IsR0FBRztRQUFFRSxnQkFBZ0IsRUFBRUUsTUFBTTtRQUFFRCxZQUFZLEVBQUVDO01BQU8sQ0FBQztNQUMzRSxJQUFJek8scUJBQXFCLEVBQUU7UUFDMUI7UUFDQSxJQUFJQSxxQkFBcUIsQ0FBQ0UsWUFBWSxLQUFLLFFBQVEsRUFBRTtVQUNwRG1PLFdBQVcsQ0FBQ0csWUFBWSxHQUFHMVMsU0FBUztVQUNwQ3VTLFdBQVcsQ0FBQ0UsZ0JBQWdCLEdBQUcsV0FBVztRQUMzQyxDQUFDLE1BQU07VUFDTjtVQUNBRixXQUFXLENBQUNHLFlBQVksYUFBTTFVLGVBQWUsQ0FBQ2hCLE9BQU8sQ0FDcEQsMENBQTBDLENBQzFDLGVBQUtnQixlQUFlLENBQUNoQixPQUFPLENBQUMsd0NBQXdDLENBQUMsZ0JBQU1rSCxxQkFBcUIsQ0FBQ00sS0FBSyxDQUFFO1VBQzFHK04sV0FBVyxDQUFDRSxnQkFBZ0IsR0FBRyxRQUFRO1FBQ3hDO01BQ0QsQ0FBQyxNQUFNO1FBQ05GLFdBQVcsQ0FBQ0csWUFBWSxHQUFHMVUsZUFBZSxDQUFDaEIsT0FBTyxDQUFDLDJDQUEyQyxDQUFDO1FBQy9GdVYsV0FBVyxDQUFDRSxnQkFBZ0IsR0FBRyxTQUFTO01BQ3pDO01BQ0EsT0FBT0YsV0FBVztJQUNuQixDQUFDO0lBQUEsT0FFRHRKLGlCQUFpQixHQUFqQiwyQkFBa0JsQixPQUFvQixFQUFFO01BQ3ZDLElBQU02SyxjQUFjLEdBQUcsSUFBSSxDQUFDMWQsZUFBZTtNQUMzQyxJQUFJMGQsY0FBYyxJQUFJN0ssT0FBTyxJQUFJQSxPQUFPLENBQUNILEtBQUssRUFBRTtRQUMvQyxJQUFNaUwsT0FBTyxHQUFHLFlBQU07VUFDckI5SyxPQUFPLENBQUNILEtBQUssRUFBRTtRQUNoQixDQUFDO1FBQ0QsSUFBSSxDQUFDZ0wsY0FBYyxDQUFDRSxNQUFNLEVBQUUsRUFBRTtVQUM3QjtVQUNBO1VBQ0F4WixVQUFVLENBQUN1WixPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3ZCLENBQUMsTUFBTTtVQUNOLElBQU1FLFNBQVMsR0FBRyxZQUFNO1lBQ3ZCelosVUFBVSxDQUFDdVosT0FBTyxFQUFFLENBQUMsQ0FBQztZQUN0QkQsY0FBYyxDQUFDSSxXQUFXLENBQUMsWUFBWSxFQUFFRCxTQUFTLENBQUM7VUFDcEQsQ0FBQztVQUNESCxjQUFjLENBQUNuSixXQUFXLENBQUMsWUFBWSxFQUFFc0osU0FBUyxDQUFDO1VBQ25ESCxjQUFjLENBQUNLLEtBQUssRUFBRTtRQUN2QjtNQUNELENBQUMsTUFBTTtRQUNOdFosR0FBRyxDQUFDdVosT0FBTyxDQUFDLHlFQUF5RSxDQUFDO01BQ3ZGO0lBQ0QsQ0FBQztJQUFBO0VBQUEsRUFudUQwQnJlLE1BQU07SUFBQTtJQUFBO0lBQUE7SUFBQTtFQUFBO0lBQUE7SUFBQTtJQUFBO0lBQUE7RUFBQTtFQUFBLE9Bc3VEbkJYLGFBQWE7QUFBQSJ9