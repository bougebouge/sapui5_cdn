import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Log from "sap/base/Log";
import UriParameters from "sap/base/util/UriParameters";
import type MessageFilter from "sap/fe/common/MessageFilter";
import MessagePopover from "sap/fe/common/MessagePopover";
import CommonUtils from "sap/fe/core/CommonUtils";
import { aggregation, defineUI5Class, event } from "sap/fe/core/helpers/ClassSupport";
import type PageController from "sap/fe/core/PageController";
import TableAPI from "sap/fe/macros/table/TableAPI";
import Button from "sap/m/Button";
import ColumnListItem from "sap/m/ColumnListItem";
import Dialog from "sap/m/Dialog";
import FormattedText from "sap/m/FormattedText";
import { ButtonType } from "sap/m/library";
import MessageItem from "sap/m/MessageItem";
import type CoreEvent from "sap/ui/base/Event";
import Core from "sap/ui/core/Core";
import type UI5Element from "sap/ui/core/Element";
import { MessageType } from "sap/ui/core/library";
import Message from "sap/ui/core/message/Message";
import View from "sap/ui/core/mvc/View";
import MdcTable from "sap/ui/mdc/Table";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import type JSONModel from "sap/ui/model/json/JSONModel";
import Context from "sap/ui/model/odata/v4/Context";
import Sorter from "sap/ui/model/Sorter";
import ObjectPageSection from "sap/uxap/ObjectPageSection";
import ObjectPageSubSection from "sap/uxap/ObjectPageSubSection";

@defineUI5Class("sap.fe.common.MessageButton")
class MessageButton extends Button {
	@aggregation({ type: "sap.fe.common.MessageFilter", multiple: true, singularName: "customFilter" })
	customFilters!: MessageFilter;

	@event()
	messageChange!: Function;

	private oMessagePopover: any;
	private oItemBinding: any;
	private oObjectPageLayout: any;
	private sLastActionText = "";
	private sGeneralGroupText = "";
	private _setMessageDataTimeout: any;
	private sViewId = "";

	init() {
		Button.prototype.init.apply(this);
		//press event handler attached to open the message popover
		this.attachPress(this.handleMessagePopoverPress, this);
		this.oMessagePopover = new MessagePopover();
		this.oItemBinding = this.oMessagePopover.getBinding("items");
		this.oItemBinding.attachChange(this._setMessageData, this);
		const messageButtonId = this.getId();
		if (messageButtonId) {
			this.oMessagePopover.addCustomData(new (sap as any).ui.core.CustomData({ key: "messageButtonId", value: messageButtonId })); // TODO check for custom data type
		}
		this.attachModelContextChange(this._applyFiltersAndSort.bind(this));
		this.oMessagePopover.attachActiveTitlePress(this._activeTitlePress.bind(this));
	}

	/**
	 * The method that is called when a user clicks on the MessageButton control.
	 *
	 * @param oEvent Event object
	 */
	handleMessagePopoverPress(oEvent: CoreEvent) {
		this.oMessagePopover.toggle(oEvent.getSource());
	}

	/**
	 * The method that groups the messages based on the section or subsection they belong to.
	 * This method force the loading of contexts for all tables before to apply the grouping.
	 *
	 * @param oView Current view.
	 * @returns Return promise.
	 * @private
	 */
	async _applyGroupingAsync(oView: View) {
		const aWaitForData: Promise<void>[] = [];
		const oViewBindingContext = oView.getBindingContext();
		const _findTablesRelatedToMessages = (view: View) => {
			const oRes: any[] = [];
			const aMessages = this.oItemBinding.getContexts().map(function (oContext: any) {
				return oContext.getObject();
			});
			const oViewContext = view.getBindingContext();
			if (oViewContext) {
				const oObjectPage = view.getContent()[0];
				this.getVisibleSectionsFromObjectPageLayout(oObjectPage).forEach(function (oSection: any) {
					oSection.getSubSections().forEach(function (oSubSection: any) {
						oSubSection.findElements(true).forEach(function (oElem: any) {
							if (oElem.isA("sap.ui.mdc.Table")) {
								for (let i = 0; i < aMessages.length; i++) {
									const oRowBinding = oElem.getRowBinding();
									if (oRowBinding) {
										const sElemeBindingPath = `${oViewContext.getPath()}/${oElem.getRowBinding().getPath()}`;
										if (aMessages[i].target.indexOf(sElemeBindingPath) === 0) {
											oRes.push({ table: oElem, subsection: oSubSection });
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
		const oTables = _findTablesRelatedToMessages.bind(this)(oView);
		oTables.forEach(function (_oTable) {
			const oMDCTable = _oTable.table,
				oSubsection = _oTable.subsection;
			if (!oMDCTable.getBindingContext() || oMDCTable.getBindingContext()?.getPath() !== oViewBindingContext?.getPath()) {
				oSubsection.setBindingContext(oViewBindingContext);
				if (!oMDCTable.getRowBinding().isLengthFinal()) {
					aWaitForData.push(
						new Promise(function (resolve: Function) {
							oMDCTable.getRowBinding().attachEventOnce("dataReceived", function () {
								resolve();
							});
						})
					);
				}
			}
		});
		const waitForGroupingApplied = new Promise((resolve: Function) => {
			setTimeout(async () => {
				this._applyGrouping();
				resolve();
			}, 0);
		});
		try {
			await Promise.all(aWaitForData);
			oView.getModel().checkMessages();
			await waitForGroupingApplied;
		} catch (err) {
			Log.error("Error while grouping the messages in the messagePopOver");
		}
	}

	/**
	 * The method retrieves the visible sections from an object page.
	 *
	 * @param oObjectPageLayout The objectPageLayout object for which we want to retrieve the visible sections.
	 * @returns Array of visible sections.
	 * @private
	 */
	getVisibleSectionsFromObjectPageLayout(oObjectPageLayout: any) {
		return oObjectPageLayout.getSections().filter(function (oSection: any) {
			return oSection.getVisible();
		});
	}

	/**
	 * The method that groups the messages based on the section or subsection they belong to.
	 *
	 * @private
	 */
	_applyGrouping() {
		this.oObjectPageLayout = this._getObjectPageLayout(this, this.oObjectPageLayout);
		if (!this.oObjectPageLayout) {
			return;
		}
		const aMessages = this.oMessagePopover.getItems();
		const aSections = this.getVisibleSectionsFromObjectPageLayout(this.oObjectPageLayout);
		const bEnableBinding = this._checkControlIdInSections(aMessages, false);
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
	 */
	_getTableRefErrorContext(oTable: any) {
		const oModel = oTable.getModel("internal");
		//initialize the refError property if it doesn't exist
		if (!oTable.getBindingContext("internal").getProperty("refError")) {
			oModel.setProperty("refError", {}, oTable.getBindingContext("internal"));
		}
		const sRefErrorContextPath =
			oTable.getBindingContext("internal").getPath() +
			"/refError/" +
			oTable.getBindingContext().getPath().replace("/", "$") +
			"$" +
			oTable.getRowBinding().getPath().replace("/", "$");
		const oContext = oModel.getContext(sRefErrorContextPath);
		if (!oContext.getProperty("")) {
			oModel.setProperty("", {}, oContext);
		}
		return oContext;
	}

	_updateInternalModel(
		oTableRowContext: any,
		iRowIndex: number,
		sTableTargetColProperty: string,
		oTable: any,
		oMessageObject: any,
		bIsCreationRow?: boolean
	) {
		let oTemp;
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
		const oModel = oTable.getModel("internal"),
			oContext = this._getTableRefErrorContext(oTable);
		//we first remove the entries with obsolete message ids from the internal model before inserting the new error info :
		const aValidMessageIds = sap.ui
			.getCore()
			.getMessageManager()
			.getMessageModel()
			.getData()
			.map(function (message: any) {
				return message.id;
			});
		let aObsoleteMessagelIds;
		if (oContext.getProperty()) {
			aObsoleteMessagelIds = Object.keys(oContext.getProperty()).filter(function (internalMessageId) {
				return aValidMessageIds.indexOf(internalMessageId) === -1;
			});
			aObsoleteMessagelIds.forEach(function (obsoleteId) {
				delete oContext.getProperty()[obsoleteId];
			});
		}
		oModel.setProperty(
			oMessageObject.getId(),
			Object.assign({}, oContext.getProperty(oMessageObject.getId()) ? oContext.getProperty(oMessageObject.getId()) : {}, oTemp),
			oContext
		);
	}

	_getControlFromMessageRelatingToSubSection(subSection: any, message: any) {
		const oMessageObject = message.getBindingContext("message").getObject();
		return subSection
			.findElements(true, (oElem: any) => {
				return this._fnFilterUponIds(oMessageObject.getControlIds(), oElem);
			})
			.sort(function (a: any, b: any) {
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
	 */

	_setGroupLabelForTransientMsg(message: any, sActionName: string) {
		this.sLastActionText = this.sLastActionText
			? this.sLastActionText
			: Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_LAST_ACTION");

		message.setGroupName(`${this.sLastActionText}: ${sActionName}`);
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
	 */

	_computeMessageGroupAndSubTitle(
		message: MessageItem,
		section: ObjectPageSection,
		subSection: ObjectPageSubSection,
		aElements: any[],
		bMultipleSubSections: boolean,
		sActionName: string
	) {
		this.oItemBinding.detachChange(this._setMessageData, this);
		const oMessageObject = message.getBindingContext("message")?.getObject() as Message;

		let oElement,
			oTable: any,
			oTargetTableInfo: any,
			l,
			iRowIndex,
			oTargetedControl,
			bIsCreationRow,
			sMessageSubtitle: string = "";
		const bIsBackendMessage = new RegExp("^/").test(oMessageObject?.getTargets()[0]),
			oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");

		if (bIsBackendMessage) {
			for (l = 0; l < aElements.length; l++) {
				oElement = aElements[l];
				oTargetedControl = oElement;
				if (oElement.isA("sap.m.Table") || oElement.isA("sap.ui.table.Table")) {
					oTargetTableInfo = {};
					oTable = oElement.getParent();
					oTargetTableInfo.tableHeader = oTable.getHeader();
					const oRowBinding = oTable.getRowBinding();
					if (oRowBinding && oRowBinding.isLengthFinal() && oTable.getBindingContext()) {
						oTargetTableInfo.sTableTargetColProperty = this._getTableColProperty(oTable, oMessageObject);
						const oTableColInfo = this._getTableColInfo(oTable, oTargetTableInfo.sTableTargetColProperty);
						oTargetTableInfo.oTableRowBindingContexts = oElement.isA("sap.ui.table.Table")
							? oRowBinding.getContexts()
							: oRowBinding.getCurrentContexts();
						oTargetTableInfo.sTableTargetColName = oTableColInfo.sTableTargetColName;
						oTargetTableInfo.sTableTargetProperty = oTargetTableInfo.sTableTargetColProperty;
						oTargetTableInfo.sTableTargetColProperty = oTableColInfo.sTableTargetColProperty;
						oTargetTableInfo.oTableRowContext = oTargetTableInfo.oTableRowBindingContexts.find(
							function (messageObject: any, rowContext: any) {
								return rowContext && messageObject.getTargets()[0].indexOf(rowContext.getPath()) === 0;
							}.bind(this, oMessageObject)
						);
						let sControlId;
						if (!oTargetTableInfo.oTableRowContext) {
							sControlId = oMessageObject.getControlIds().find(
								function (this: any, table: any, sId: string) {
									return this._IsControlInTable(table, sId);
								}.bind(this, oTable)
							);
						}
						if (sControlId) {
							const oControl = Core.byId(sControlId);
							bIsCreationRow = this._IsControlPartOfCreationRow(oControl);
						}
						sMessageSubtitle = this._getMessageSubtitle(
							message,
							oTargetTableInfo.oTableRowBindingContexts,
							oTargetTableInfo.oTableRowContext,
							oTargetTableInfo.sTableTargetColName,
							oResourceBundle,
							oTable,
							bIsCreationRow
						);
						//set the subtitle
						message.setSubtitle(sMessageSubtitle);
						message.setActiveTitle(!!oTargetTableInfo.oTableRowContext);

						if (oTargetTableInfo.oTableRowContext) {
							this._formatMessageDescription(
								message,
								oTargetTableInfo.oTableRowContext,
								oTargetTableInfo.sTableTargetColName,
								oResourceBundle,
								oTable
							);
						}
						iRowIndex = oTargetTableInfo.oTableRowContext && oTargetTableInfo.oTableRowContext.getIndex();
						this._updateInternalModel(
							oTargetTableInfo.oTableRowContext,
							iRowIndex,
							oTargetTableInfo.sTableTargetColProperty,
							oTable,
							oMessageObject
						);
					}
				} else {
					message.setActiveTitle(true);
					//check if the targeted control is a child of one of the other controls
					const bIsTargetedControlOrphan = this._bIsOrphanElement(oTargetedControl, aElements);
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
				const iTargetColumnIndex = this._getTableColumnIndex(oTargetedControl);
				oTargetTableInfo.sTableTargetColProperty =
					iTargetColumnIndex > -1 ? oTable.getColumns()[iTargetColumnIndex].getDataProperty() : undefined;
				oTargetTableInfo.sTableTargetProperty = oTargetTableInfo.sTableTargetColProperty;
				oTargetTableInfo.sTableTargetColName =
					oTargetTableInfo.sTableTargetColProperty && iTargetColumnIndex > -1
						? oTable.getColumns()[iTargetColumnIndex].getHeader()
						: undefined;
				bIsCreationRow = this._getTableRow(oTargetedControl).isA("sap.ui.table.CreationRow");
				if (!bIsCreationRow) {
					iRowIndex = this._getTableRowIndex(oTargetedControl);
					oTargetTableInfo.oTableRowBindingContexts = oTable.getRowBinding().getCurrentContexts();
					oTargetTableInfo.oTableRowContext = oTargetTableInfo.oTableRowBindingContexts[iRowIndex];
				}
				sMessageSubtitle = this._getMessageSubtitle(
					message,
					oTargetTableInfo.oTableRowBindingContexts,
					oTargetTableInfo.oTableRowContext,
					oTargetTableInfo.sTableTargetColName,
					oResourceBundle,
					oTable,
					bIsCreationRow,
					iTargetColumnIndex === 0 && oTargetedControl.getValueState() === "Error" ? oTargetedControl : undefined
				);
				//set the subtitle
				message.setSubtitle(sMessageSubtitle);
				message.setActiveTitle(true);

				this._updateInternalModel(
					oTargetTableInfo.oTableRowContext,
					iRowIndex,
					oTargetTableInfo.sTableTargetColProperty,
					oTable,
					oMessageObject,
					bIsCreationRow
				);
			}
		}
		if (oMessageObject.getPersistent() && sActionName) {
			this._setGroupLabelForTransientMsg(message, sActionName);
		} else {
			message.setGroupName(
				section.getTitle() +
					(subSection.getTitle() && bMultipleSubSections ? `, ${subSection.getTitle()}` : "") +
					(oTargetTableInfo
						? `, ${oResourceBundle.getText("T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR")}: ${oTargetTableInfo.tableHeader}`
						: "")
			);
			const sViewId = this._getViewId(this.getId());
			const oView = Core.byId(sViewId as string);
			const oMessageTargetProperty = oMessageObject.getTargets()[0] && oMessageObject.getTargets()[0].split("/").pop();
			const oUIModel = oView?.getModel("internal") as JSONModel;
			if (
				oUIModel &&
				oUIModel.getProperty("/messageTargetProperty") &&
				oMessageTargetProperty &&
				oMessageTargetProperty === oUIModel.getProperty("/messageTargetProperty")
			) {
				this.oMessagePopover.fireActiveTitlePress({ "item": message });
				oUIModel.setProperty("/messageTargetProperty", false);
			}
		}
		this.oItemBinding.attachChange(this._setMessageData, this);
		return oTargetedControl;
	}

	_checkControlIdInSections(aMessages: any[], bEnableBinding: boolean) {
		let section, aSubSections, message, i, j, k;

		this.sGeneralGroupText = this.sGeneralGroupText
			? this.sGeneralGroupText
			: Core.getLibraryResourceBundle("sap.fe.core").getText("T_MESSAGE_BUTTON_SAPFE_MESSAGE_GROUP_GENERAL");
		//Get all sections from the object page layout
		const aVisibleSections = this.getVisibleSectionsFromObjectPageLayout(this.oObjectPageLayout);
		if (aVisibleSections) {
			const viewId = this._getViewId(this.getId());
			const oView = Core.byId(viewId);
			const sActionName = oView?.getBindingContext("internal")?.getProperty("sActionName");
			if (sActionName) {
				(oView?.getBindingContext("internal") as any).setProperty("sActionName", null);
			}
			for (i = aMessages.length - 1; i >= 0; --i) {
				// Loop over all messages
				message = aMessages[i];
				let bIsGeneralGroupName = true;
				for (j = aVisibleSections.length - 1; j >= 0; --j) {
					// Loop over all visible sections
					section = aVisibleSections[j];
					aSubSections = section.getSubSections();
					for (k = aSubSections.length - 1; k >= 0; --k) {
						// Loop over all sub-sections
						const subSection = aSubSections[k];
						const aControls = this._getControlFromMessageRelatingToSubSection(subSection, message);
						if (aControls.length > 0) {
							const oTargetedControl = this._computeMessageGroupAndSubTitle(
								message,
								section,
								subSection,
								aControls,
								aSubSections.length > 1,
								sActionName
							);
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
					const oMessageObject = message.getBindingContext("message").getObject();
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
	}

	_findTargetForMessage(message: any) {
		const messageObject = message.getBindingContext("message") && message.getBindingContext("message").getObject();
		if (messageObject && messageObject.target) {
			const oMetaModel =
					this.oObjectPageLayout && this.oObjectPageLayout.getModel() && this.oObjectPageLayout.getModel().getMetaModel(),
				contextPath = oMetaModel && oMetaModel.getMetaPath(messageObject.target),
				oContextPathMetadata = oMetaModel && oMetaModel.getObject(contextPath);
			if (oContextPathMetadata && oContextPathMetadata.$kind === "Property") {
				return true;
			}
		}
	}

	_fnEnableBindings(aSections: any[]) {
		if (UriParameters.fromQuery(window.location.search).get("sap-fe-xx-lazyloadingtest")) {
			return;
		}
		for (let iSection = 0; iSection < aSections.length; iSection++) {
			const oSection = aSections[iSection];
			let nonTableChartcontrolFound = false;
			const aSubSections = oSection.getSubSections();
			for (let iSubSection = 0; iSubSection < aSubSections.length; iSubSection++) {
				const oSubSection = aSubSections[iSubSection];
				const oAllBlocks = oSubSection.getBlocks();
				if (oAllBlocks) {
					for (let block = 0; block < oSubSection.getBlocks().length; block++) {
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
	}

	_findMessageGroupAfterRebinding() {
		const aMessages = this.oMessagePopover.getItems();
		this._checkControlIdInSections(aMessages, true);
	}

	/**
	 * The method that retrieves the view ID (HTMLView/XMLView/JSONview/JSView/Templateview) of any control.
	 *
	 * @param sControlId ID of the control needed to retrieve the view ID
	 * @returns The view ID of the control
	 */
	_getViewId(sControlId: string) {
		let sViewId,
			oControl = Core.byId(sControlId) as any;
		while (oControl) {
			if (oControl instanceof View) {
				sViewId = oControl.getId();
				break;
			}
			oControl = oControl.getParent();
		}
		return sViewId;
	}

	_setLongtextUrlDescription(sMessageDescriptionContent: string, oDiagnosisTitle: any) {
		this.oMessagePopover.setAsyncDescriptionHandler(function (config: any) {
			// This stores the old description
			const sOldDescription = sMessageDescriptionContent;
			// Here we can fetch the data and concatenate it to the old one
			// By default, the longtextUrl fetching will overwrite the description (with the default behaviour)
			// Here as we have overwritten the default async handler, which fetches and replaces the description of the item
			// we can manually modify it to include whatever needed.
			const sLongTextUrl = config.item.getLongtextUrl();
			if (sLongTextUrl) {
				jQuery.ajax({
					type: "GET",
					url: sLongTextUrl,
					success: function (data) {
						const sDiagnosisText = oDiagnosisTitle.getHtmlText() + data;
						config.item.setDescription(`${sOldDescription}${sDiagnosisText}`);
						config.promise.resolve();
					},
					error: function () {
						config.item.setDescription(sMessageDescriptionContent);
						const sError = `A request has failed for long text data. URL: ${sLongTextUrl}`;
						Log.error(sError);
						config.promise.reject(sError);
					}
				});
			}
		});
	}

	_formatMessageDescription(
		message: any,
		oTableRowContext: any,
		sTableTargetColName: string,
		oResourceBundle: ResourceBundle,
		oTable: any
	) {
		const sTableFirstColProperty = oTable.getParent().getIdentifierColumn();
		let sColumnInfo = "";
		const oColFromTableSettings = this._fetchColumnInfo(message, oTable);
		if (sTableTargetColName) {
			// if column in present in table definition
			sColumnInfo = `${oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN")}: ${sTableTargetColName}`;
		} else if (oColFromTableSettings) {
			if (oColFromTableSettings.availability === "Hidden") {
				// if column in neither in table definition nor personalization
				if (message.getType() === "Error") {
					sColumnInfo = sTableFirstColProperty
						? `${oResourceBundle.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC_ERROR")} ${oTableRowContext.getValue(
								sTableFirstColProperty
						  )}` + "."
						: `${oResourceBundle.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC_ERROR")}` + ".";
				} else {
					sColumnInfo = sTableFirstColProperty
						? `${oResourceBundle.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC")} ${oTableRowContext.getValue(
								sTableFirstColProperty
						  )}` + "."
						: `${oResourceBundle.getText("T_COLUMN_AVAILABLE_DIAGNOSIS_MSGDESC")}` + ".";
				}
			} else {
				// if column is not in table definition but in personalization
				//if no navigation to sub op then remove link to error field BCP : 2280168899
				if (!this._navigationConfigured(oTable)) {
					message.setActiveTitle(false);
				}
				sColumnInfo = `${oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN")}: ${
					oColFromTableSettings.label
				} (${oResourceBundle.getText("T_COLUMN_INDICATOR_IN_TABLE_DEFINITION")})`;
			}
		}
		const oFieldsAffectedTitle = new FormattedText({
			htmlText: `<html><body><strong>${oResourceBundle.getText("T_FIELDS_AFFECTED_TITLE")}</strong></body></html><br>`
		});
		let sFieldAffectedText: String;
		if (sTableFirstColProperty) {
			sFieldAffectedText = `${oFieldsAffectedTitle.getHtmlText()}<br>${oResourceBundle.getText(
				"T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR"
			)}: ${oTable.getHeader()}<br>${oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW")}: ${oTableRowContext.getValue(
				sTableFirstColProperty
			)}<br>${sColumnInfo}<br>`;
		} else if (sColumnInfo == "" || !sColumnInfo) {
			sFieldAffectedText = "";
		} else {
			sFieldAffectedText = `${oFieldsAffectedTitle.getHtmlText()}<br>${oResourceBundle.getText(
				"T_MESSAGE_GROUP_TITLE_TABLE_DENOMINATOR"
			)}: ${oTable.getHeader()}<br>${sColumnInfo}<br>`;
		}

		const oDiagnosisTitle = new FormattedText({
			htmlText: `<html><body><strong>${oResourceBundle.getText("T_DIAGNOSIS_TITLE")}</strong></body></html><br>`
		});
		// get the UI messages from the message context to set it to Diagnosis section
		const sUIMessageDescription = message.getBindingContext("message").getObject().description;
		//set the description to null to reset it below
		message.setDescription(null);
		let sDiagnosisText = "";
		let sMessageDescriptionContent = "";
		if (message.getLongtextUrl()) {
			sMessageDescriptionContent = `${sFieldAffectedText}<br>`;
			this._setLongtextUrlDescription(sMessageDescriptionContent, oDiagnosisTitle);
		} else if (sUIMessageDescription) {
			sDiagnosisText = `${oDiagnosisTitle.getHtmlText()}<br>${sUIMessageDescription}`;
			sMessageDescriptionContent = `${sFieldAffectedText}<br>${sDiagnosisText}`;
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
	 */
	_setMessageData() {
		clearTimeout(this._setMessageDataTimeout);

		this._setMessageDataTimeout = setTimeout(async () => {
			const sIcon = "",
				oMessages = this.oMessagePopover.getItems(),
				oMessageCount: any = { Error: 0, Warning: 0, Success: 0, Information: 0 },
				oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core"),
				iMessageLength = oMessages.length;
			let sButtonType = ButtonType.Default,
				sMessageKey = "",
				sTooltipText = "",
				sMessageText = "";
			if (iMessageLength > 0) {
				for (let i = 0; i < iMessageLength; i++) {
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
					this.setText(oMessageCount.Error);
				} else {
					this.setText("");
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
					sTooltipText = oMessageCount.Error ? `${oMessageCount.Error} ${sMessageText}` : sMessageText;
					this.setTooltip(sTooltipText);
				}
				this.setIcon(sIcon);
				this.setType(sButtonType);
				this.setVisible(true);
				const oView = Core.byId(this.sViewId) as View;
				if (oView) {
					const oPageReady = (oView.getController() as PageController).pageReady;
					try {
						await oPageReady.waitPageReady();
						await this._applyGroupingAsync(oView);
					} catch (err) {
						Log.error("fail grouping messages");
					}
					(this as any).fireMessageChange({
						iMessageLength: iMessageLength
					});
				}
				if (iMessageLength > 1) {
					this.oMessagePopover.navigateBack();
				}
			} else {
				this.setVisible(false);
				(this as any).fireMessageChange({
					iMessageLength: iMessageLength
				});
			}
		}, 100);
	}

	_bIsOrphanElement(oElement: any, aElements: any[]) {
		return !aElements.some(
			function (oOrphanElement: any, oElem: any) {
				let oParentElement = oOrphanElement.getParent();
				while (oParentElement && oParentElement !== oElem) {
					oParentElement = oParentElement.getParent();
				}
				return oParentElement ? true : false;
			}.bind(this, oElement)
		);
	}

	/**
	 * The method that is called when a user clicks on the title of the message.
	 *
	 * @function
	 * @name _activeTitlePress
	 * @private
	 * @param oEvent Event object passed from the handler
	 */
	async _activeTitlePress(oEvent: CoreEvent) {
		const oInternalModelContext = this.getBindingContext("pageInternal");
		(oInternalModelContext as any).setProperty("errorNavigationSectionFlag", true);
		const oItem = oEvent.getParameter("item"),
			oMessage = oItem.getBindingContext("message").getObject(),
			bIsBackendMessage = new RegExp("^/").test(oMessage.getTarget()),
			oView = Core.byId(this.sViewId) as View;
		let oControl, sSectionTitle;
		const _defaultFocus = function (message: any, mdcTable: any) {
			const focusInfo = { preventScroll: true, targetInfo: message };
			mdcTable.focus(focusInfo);
		};

		//check if the pressed item is related to a table control
		if (oItem.getGroupName().indexOf("Table:") !== -1) {
			let oTargetMdcTable: any;
			if (bIsBackendMessage) {
				oTargetMdcTable = oMessage.controlIds
					.map(function (sControlId: string) {
						const control = Core.byId(sControlId);
						const oParentControl = control && (control.getParent() as any);
						return oParentControl &&
							oParentControl.isA("sap.ui.mdc.Table") &&
							oParentControl.getHeader() === oItem.getGroupName().split(", Table: ")[1]
							? oParentControl
							: null;
					})
					.reduce(function (acc: any, val: any) {
						return val ? val : acc;
					});
				if (oTargetMdcTable) {
					sSectionTitle = oItem.getGroupName().split(", ")[0];
					try {
						await this._navigateFromMessageToSectionTableInIconTabBarMode(
							oTargetMdcTable,
							this.oObjectPageLayout,
							sSectionTitle
						);
						const oRefErrorContext = this._getTableRefErrorContext(oTargetMdcTable);
						const oRefError = oRefErrorContext.getProperty(oItem.getBindingContext("message").getObject().getId());
						const _setFocusOnTargetField = async (targetMdcTable: any, iRowIndex: number): Promise<any> => {
							const aTargetMdcTableRow = this._getMdcTableRows(targetMdcTable),
								iFirstVisibleRow = this._getGridTable(targetMdcTable).getFirstVisibleRow();
							if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
								const oTargetRow = aTargetMdcTableRow[iRowIndex - iFirstVisibleRow],
									oTargetCell = this.getTargetCell(oTargetRow, oMessage);
								if (oTargetCell) {
									this.setFocusToControl(oTargetCell);
									return undefined;
								} else {
									// control not found on table
									const errorProperty = oMessage.getTarget().split("/").pop();
									if (errorProperty) {
										(oView.getModel("internal") as JSONModel).setProperty("/messageTargetProperty", errorProperty);
									}
									if (this._navigationConfigured(targetMdcTable)) {
										return (oView.getController() as PageController)._routing.navigateForwardToContext(
											oTargetRow.getBindingContext()
										);
									} else {
										return false;
									}
								}
							}
							return undefined;
						};
						if (oTargetMdcTable.data("tableType") === "GridTable" && oRefError.rowIndex !== "") {
							const iFirstVisibleRow = this._getGridTable(oTargetMdcTable).getFirstVisibleRow();
							try {
								await oTargetMdcTable.scrollToIndex(oRefError.rowIndex);
								const aTargetMdcTableRow = this._getMdcTableRows(oTargetMdcTable);
								let iNewFirstVisibleRow, bScrollNeeded;
								if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
									iNewFirstVisibleRow = aTargetMdcTableRow[0].getParent().getFirstVisibleRow();
									bScrollNeeded = iFirstVisibleRow - iNewFirstVisibleRow !== 0;
								}
								let oWaitControlIdAdded: Promise<void>;
								if (bScrollNeeded) {
									//The scrollToIndex function does not wait for the UI update. As a workaround, pending a fix from MDC (BCP: 2170251631) we use the event "UIUpdated".
									oWaitControlIdAdded = new Promise(function (resolve) {
										Core.attachEvent("UIUpdated", resolve);
									});
								} else {
									oWaitControlIdAdded = Promise.resolve();
								}
								await oWaitControlIdAdded;
								setTimeout(async function () {
									const focusOnTargetField = await _setFocusOnTargetField(oTargetMdcTable, oRefError.rowIndex);
									if (focusOnTargetField === false) {
										_defaultFocus(oMessage, oTargetMdcTable);
									}
								}, 0);
							} catch (err) {
								Log.error("Error while focusing on error");
							}
						} else if (oTargetMdcTable.data("tableType") === "ResponsiveTable" && oRefError) {
							const focusOnMessageTargetControl = await this.focusOnMessageTargetControl(
								oView,
								oMessage,
								oTargetMdcTable,
								oRefError.rowIndex
							);
							if (focusOnMessageTargetControl === false) {
								_defaultFocus(oMessage, oTargetMdcTable);
							}
						} else {
							this.focusOnMessageTargetControl(oView, oMessage);
						}
					} catch (err) {
						Log.error("Fail to navigate to Error control");
					}
				}
			} else {
				oControl = Core.byId(oMessage.controlIds[0]);
				//If the control underlying the frontEnd message is not within the current section, we first go into the target section:
				const oSelectedSection: any = Core.byId(this.oObjectPageLayout.getSelectedSection());
				if (oSelectedSection?.findElements(true).indexOf(oControl) === -1) {
					sSectionTitle = oItem.getGroupName().split(", ")[0];
					this._navigateFromMessageToSectionInIconTabBarMode(this.oObjectPageLayout, sSectionTitle);
				}
				this.setFocusToControl(oControl);
			}
		} else {
			// focus on control
			sSectionTitle = oItem.getGroupName().split(", ")[0];
			this._navigateFromMessageToSectionInIconTabBarMode(this.oObjectPageLayout, sSectionTitle);
			this.focusOnMessageTargetControl(oView, oMessage);
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
	getTargetCell(targetRow: ColumnListItem, message: Message): UI5Element | null | undefined {
		return message.getControlIds().length > 0
			? message
					.getControlIds()
					.map(function (controlId: string) {
						const isControlInTable = (targetRow as any).findElements(true, function (elem: any) {
							return elem.getId() === controlId;
						});
						return isControlInTable.length > 0 ? Core.byId(controlId) : null;
					})
					.reduce(function (acc: any, val: any) {
						return val ? val : acc;
					})
			: null;
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
	 */
	async focusOnMessageTargetControl(view: View, message: Message, targetMdcTable?: any, rowIndex?: number): Promise<any> {
		const aAllViewElements = view.findElements(true);
		const aErroneousControls = message
			.getControlIds()
			.filter(function (sControlId: string) {
				return aAllViewElements.some(function (oElem) {
					return oElem.getId() === sControlId && oElem.getDomRef();
				});
			})
			.map(function (sControlId: string) {
				return Core.byId(sControlId);
			});
		const aNotTableErroneousControls = aErroneousControls.filter(function (oElem: any) {
			return !oElem.isA("sap.m.Table") && !oElem.isA("sap.ui.table.Table");
		});
		//The focus is set on Not Table control in priority
		if (aNotTableErroneousControls.length > 0) {
			this.setFocusToControl(aNotTableErroneousControls[0]);
			return undefined;
		} else if (aErroneousControls.length > 0) {
			const aTargetMdcTableRow = targetMdcTable
				? targetMdcTable.findElements(true, function (oElem: any) {
						return oElem.isA(ColumnListItem.getMetadata().getName());
				  })
				: [];
			if (aTargetMdcTableRow.length > 0 && aTargetMdcTableRow[0]) {
				const oTargetRow = aTargetMdcTableRow[rowIndex as number];
				const oTargetCell = this.getTargetCell(oTargetRow, message) as any;
				if (oTargetCell) {
					const oTargetField = oTargetCell.isA("sap.fe.macros.field.FieldAPI")
						? oTargetCell.getContent().getContentEdit()[0]
						: oTargetCell.getItems()[0].getContent().getContentEdit()[0];
					this.setFocusToControl(oTargetField);
					return undefined;
				} else {
					const errorProperty = message.getTarget().split("/").pop();
					if (errorProperty) {
						(view.getModel("internal") as JSONModel).setProperty("/messageTargetProperty", errorProperty);
					}
					if (this._navigationConfigured(targetMdcTable)) {
						return (view.getController() as PageController)._routing.navigateForwardToContext(oTargetRow.getBindingContext());
					} else {
						return false;
					}
				}
			}
			return undefined;
		}
		return undefined;
	}

	_getTableColInfo(oTable: any, sTableTargetColProperty: string) {
		let sTableTargetColName;
		let oTableTargetCol = oTable.getColumns().find(
			function (tagetColumnProperty: any, column: any) {
				return column.getDataProperty() === tagetColumnProperty;
			}.bind(this, sTableTargetColProperty)
		);
		if (!oTableTargetCol) {
			/* If the target column is not found, we check for a custom column */
			const oCustomColumn = oTable
				.getControlDelegate()
				.getColumnsFor(oTable)
				.find(function (oColumn: any) {
					if (!!oColumn.template && oColumn.propertyInfos) {
						return (
							oColumn.propertyInfos[0] === sTableTargetColProperty ||
							oColumn.propertyInfos[0].replace("Property::", "") === sTableTargetColProperty
						);
					} else {
						return false;
					}
				});
			if (oCustomColumn) {
				oTableTargetCol = oCustomColumn;
				sTableTargetColProperty = oTableTargetCol.name;

				sTableTargetColName = oTable
					.getColumns()
					.find(function (oColumn: any) {
						return sTableTargetColProperty === oColumn.getDataProperty();
					})
					.getHeader();
			} else {
				/* If the target column is not found, we check for a field group */
				const aColumns = oTable.getControlDelegate().getColumnsFor(oTable);
				oTableTargetCol = aColumns.find(
					function (aTableColumns: any[], targetColumnProperty: string, oColumn: any) {
						if (oColumn.key.indexOf("::FieldGroup::") !== -1) {
							return oColumn.propertyInfos.find(function () {
								return aTableColumns.find(function (tableColumn) {
									return tableColumn.relativePath === targetColumnProperty;
								});
							});
						}
					}.bind(this, aColumns, sTableTargetColProperty)
				);
				/* check if the column with the field group is visible in the table: */
				let bIsTableTargetColVisible = false;
				if (oTableTargetCol && oTableTargetCol.label) {
					bIsTableTargetColVisible = oTable.getColumns().some(function (column: any) {
						return column.getHeader() === oTableTargetCol.label;
					});
				}
				sTableTargetColName = bIsTableTargetColVisible && oTableTargetCol.label;
				sTableTargetColProperty = bIsTableTargetColVisible && oTableTargetCol.key;
			}
		} else {
			sTableTargetColName = oTableTargetCol && oTableTargetCol.getHeader();
		}
		return { sTableTargetColName: sTableTargetColName, sTableTargetColProperty: sTableTargetColProperty };
	}

	/**
	 *
	 * @param obj The message object
	 * @param aSections The array of sections in the object page
	 * @returns The rank of the message
	 */
	_getMessageRank(obj: any, aSections: any[]) {
		if (aSections) {
			let section, aSubSections, subSection, j, k, aElements, aAllElements, sectionRank;
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
	 */
	_applyFiltersAndSort() {
		let oValidationFilters,
			oValidationAndContextFilter,
			oFilters,
			sPath,
			oSorter,
			oDialogFilter,
			objectPageLayoutSections: any = null;
		const aUserDefinedFilter: any[] = [];
		const filterOutMessagesInDialog = () => {
			const fnTest = (aControlIds: string[]) => {
				let index = Infinity,
					oControl = Core.byId(aControlIds[0]) as any;
				const errorFieldControl = Core.byId(aControlIds[0]);
				while (oControl) {
					const fieldRankinDialog =
						oControl instanceof Dialog
							? (errorFieldControl?.getParent() as any).findElements(true).indexOf(errorFieldControl)
							: Infinity;
					if (oControl instanceof Dialog) {
						if (index > fieldRankinDialog) {
							index = fieldRankinDialog;
							// Set the focus to the dialog's control
							this.setFocusToControl(errorFieldControl);
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
			const fnTest = function (aControlIds: string[]) {
				if (!aControlIds.length) {
					return false;
				}
				let oControl: any = Core.byId(aControlIds[0]);
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
			this.sViewId = this._getViewId(this.getId()) as string;
		}
		const sViewId = this.sViewId;
		//Add the filters provided by the user
		const aCustomFilters = this.getAggregation("customFilters") as any;
		if (aCustomFilters) {
			aCustomFilters.forEach(function (filter: any) {
				aUserDefinedFilter.push(
					new Filter({
						path: filter.getProperty("path"),
						operator: filter.getProperty("operator"),
						value1: filter.getProperty("value1"),
						value2: filter.getProperty("value2")
					})
				);
			});
		}
		const oBindingContext = this.getBindingContext();
		if (!oBindingContext) {
			this.setVisible(false);
			return;
		} else {
			sPath = oBindingContext.getPath();
			//Filter for filtering out only validation messages which are currently present in the view
			oValidationFilters = new Filter({
				filters: [
					new Filter({
						path: "validation",
						operator: FilterOperator.EQ,
						value1: true
					}),
					getCheckControlInViewFilter()
				],
				and: true
			});
			//Filter for filtering out the bound messages i.e target starts with the context path
			oValidationAndContextFilter = new Filter({
				filters: [
					oValidationFilters,
					new Filter({
						path: "target",
						operator: FilterOperator.StartsWith,
						value1: sPath
					})
				],
				and: false
			});
			oDialogFilter = new Filter({
				filters: [filterOutMessagesInDialog()]
			});
		}
		const oValidationContextDialogFilters = new Filter({
			filters: [oValidationAndContextFilter, oDialogFilter],
			and: true
		});
		// and finally - if there any - add custom filter (via OR)
		if (aUserDefinedFilter.length > 0) {
			oFilters = new (Filter as any)({
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
			oSorter = new (Sorter as any)("", null, null, (obj1: any, obj2: any) => {
				if (!objectPageLayoutSections) {
					objectPageLayoutSections = this.oObjectPageLayout && this.oObjectPageLayout.getSections();
				}
				const rankA = this._getMessageRank(obj1, objectPageLayoutSections);
				const rankB = this._getMessageRank(obj2, objectPageLayoutSections);
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
	 */
	_fnFilterUponId(sControlId: string, oItem: any) {
		return sControlId === oItem.getId();
	}

	/**
	 *
	 * @param aControlIds
	 * @param oItem
	 * @returns True if the item matches one of the controls
	 */
	_fnFilterUponIds(aControlIds: string[], oItem: any) {
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
	 */
	_getSectionBySectionTitle(oObjectPage: any, sSectionTitle: string) {
		if (sSectionTitle) {
			const aSections = oObjectPage.getSections();
			let oSection;
			for (let i = 0; i < aSections.length; i++) {
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
	 */
	_navigateFromMessageToSectionInIconTabBarMode(oObjectPage: any, sSectionTitle: string) {
		const bUseIconTabBar = oObjectPage.getUseIconTabBar();
		if (bUseIconTabBar) {
			const oSection = this._getSectionBySectionTitle(oObjectPage, sSectionTitle);
			const sSelectedSectionId = oObjectPage.getSelectedSection();
			if (oSection && sSelectedSectionId !== oSection.getId()) {
				oObjectPage.setSelectedSection(oSection.getId());
			}
		}
	}

	async _navigateFromMessageToSectionTableInIconTabBarMode(oTable: any, oObjectPage: any, sSectionTitle: string): Promise<void> {
		const oRowBinding = oTable.getRowBinding();
		const oTableContext = oTable.getBindingContext();
		const oOPContext = oObjectPage.getBindingContext();
		const bShouldWaitForTableRefresh = !(oTableContext === oOPContext);
		this._navigateFromMessageToSectionInIconTabBarMode(oObjectPage, sSectionTitle);
		return new Promise(function (resolve: Function) {
			if (bShouldWaitForTableRefresh) {
				oRowBinding.attachEventOnce("change", function () {
					resolve();
				});
			} else {
				resolve();
			}
		});
	}

	/**
	 * Retrieves the MdcTable if it is found among any of the parent elements.
	 *
	 * @param oElement Control
	 * @returns MDC table || undefined
	 * @private
	 */
	_getMdcTable(oElement: any) {
		//check if the element has a table within any of its parents
		let oParentElement = oElement.getParent();
		while (oParentElement && !oParentElement.isA("sap.ui.mdc.Table")) {
			oParentElement = oParentElement.getParent();
		}
		return oParentElement && oParentElement.isA("sap.ui.mdc.Table") ? oParentElement : undefined;
	}

	_getGridTable(oMdcTable: any) {
		return oMdcTable.findElements(true, function (oElem: any) {
			return (
				oElem.isA("sap.ui.table.Table") &&
				/** We check the element belongs to the MdcTable :*/
				oElem.getParent() === oMdcTable
			);
		})[0];
	}

	/**
	 * Retrieves the table row (if available) containing the element.
	 *
	 * @param oElement Control
	 * @returns Table row || undefined
	 * @private
	 */
	_getTableRow(oElement: any) {
		let oParentElement = oElement.getParent();
		while (
			oParentElement &&
			!oParentElement.isA("sap.ui.table.Row") &&
			!oParentElement.isA("sap.ui.table.CreationRow") &&
			!oParentElement.isA(ColumnListItem.getMetadata().getName())
		) {
			oParentElement = oParentElement.getParent();
		}
		return oParentElement &&
			(oParentElement.isA("sap.ui.table.Row") ||
				oParentElement.isA("sap.ui.table.CreationRow") ||
				oParentElement.isA(ColumnListItem.getMetadata().getName()))
			? oParentElement
			: undefined;
	}

	/**
	 * Retrieves the index of the table row containing the element.
	 *
	 * @param oElement Control
	 * @returns Row index || undefined
	 * @private
	 */
	_getTableRowIndex(oElement: any) {
		const oTableRow = this._getTableRow(oElement);
		let iRowIndex;
		if (oTableRow.isA("sap.ui.table.Row")) {
			iRowIndex = oTableRow.getIndex();
		} else {
			iRowIndex = oTableRow
				.getTable()
				.getItems()
				.findIndex(function (element: any) {
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
	 */
	_getTableColumnIndex(oElement: any) {
		const getTargetCellIndex = function (element: any, oTargetRow: any) {
			return oTargetRow.getCells().findIndex(function (oCell: any) {
				return oCell.getId() === element.getId();
			});
		};
		const getTargetColumnIndex = function (element: any, oTargetRow: any) {
			let oTargetElement = element.getParent(),
				iTargetCellIndex = getTargetCellIndex(oTargetElement, oTargetRow);
			while (oTargetElement && iTargetCellIndex < 0) {
				oTargetElement = oTargetElement.getParent();
				iTargetCellIndex = getTargetCellIndex(oTargetElement, oTargetRow);
			}
			return iTargetCellIndex;
		};
		const oTargetRow = this._getTableRow(oElement);
		let iTargetColumnIndex;
		iTargetColumnIndex = getTargetColumnIndex(oElement, oTargetRow);
		if (oTargetRow.isA("sap.ui.table.CreationRow")) {
			const sTargetCellId = oTargetRow.getCells()[iTargetColumnIndex].getId(),
				aTableColumns = oTargetRow.getTable().getColumns();
			iTargetColumnIndex = aTableColumns.findIndex(function (column: any) {
				if (column.getCreationTemplate()) {
					return sTargetCellId.search(column.getCreationTemplate().getId()) > -1 ? true : false;
				} else {
					return false;
				}
			});
		}
		return iTargetColumnIndex;
	}

	_getMdcTableRows(oMdcTable: any) {
		return oMdcTable.findElements(true, function (oElem: any) {
			return (
				oElem.isA("sap.ui.table.Row") &&
				/** We check the element belongs to the Mdc Table :*/
				oElem.getTable().getParent() === oMdcTable
			);
		});
	}

	_getTableColProperty(oTable: any, oMessageObject: Message) {
		//this function escapes a string to use it as a regex
		const fnRegExpescape = function (s: string) {
			return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
		};
		// based on the target path of the message we retrieve the property name.
		// to achieve it we remove the bindingContext path and the row binding path from the target
		return oMessageObject
			.getTargets()[0]
			.replace(
				new RegExp(`${fnRegExpescape(`${oTable.getBindingContext().getPath()}/${oTable.getRowBinding().getPath()}`)}\\(.*\\)/`),
				""
			);
	}

	_getObjectPageLayout(oElement: any, oObjectPageLayout: any) {
		if (oObjectPageLayout) {
			return oObjectPageLayout;
		}
		oObjectPageLayout = oElement;
		//Iterate over parent till you have not reached the object page layout
		while (oObjectPageLayout && !oObjectPageLayout.isA("sap.uxap.ObjectPageLayout")) {
			oObjectPageLayout = oObjectPageLayout.getParent();
		}
		return oObjectPageLayout;
	}

	_getCustomColumnInfo(oTable: any, iPosition: number) {
		const sTableColProperty = oTable.getColumns()[iPosition].getDataProperty();
		return oTable
			.getControlDelegate()
			.getColumnsFor(oTable)
			.find(function (oColumn: any) {
				return oColumn.name === sTableColProperty && !!oColumn.template;
			});
	}

	_getTableFirstColProperty(oTable: any) {
		const oCustomColumnInfo = this._getCustomColumnInfo(oTable, 0);
		let sTableFirstColProperty;
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
	}

	_getTableFirstColBindingContextForTextAnnotation(oTable: any, oTableRowContext: any, sTableFirstColProperty: string) {
		let oBindingContext;
		if (oTableRowContext && sTableFirstColProperty) {
			const oModel = oTable.getModel();
			const oMetaModel = oModel.getMetaModel();
			const sMetaPath = oMetaModel.getMetaPath(oTableRowContext.getPath());
			if (oMetaModel.getObject(`${sMetaPath}/${sTableFirstColProperty}@com.sap.vocabularies.Common.v1.Text/$Path`)) {
				oBindingContext = oMetaModel.createBindingContext(
					`${sMetaPath}/${sTableFirstColProperty}@com.sap.vocabularies.Common.v1.Text`
				);
			}
		}
		return oBindingContext;
	}

	_getTableFirstColValue(sTableFirstColProperty: string, oTableRowContext: any, sTextAnnotationPath: string, sTextArrangement: string) {
		const sCodeValue = oTableRowContext.getValue(sTableFirstColProperty);
		let sTextValue;
		let sComputedValue = sCodeValue;
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
					const sEnumNumber = sTextArrangement.slice(sTextArrangement.indexOf("/") + 1);
					switch (sEnumNumber) {
						case "TextOnly":
							sComputedValue = sTextValue;
							break;
						case "TextFirst":
							sComputedValue = `${sTextValue} (${sCodeValue})`;
							break;
						case "TextLast":
							sComputedValue = `${sCodeValue} (${sTextValue})`;
							break;
						case "TextSeparate":
							sComputedValue = sCodeValue;
							break;
						default:
					}
				} else {
					sComputedValue = `${sTextValue} (${sCodeValue})`;
				}
			}
		}
		return sComputedValue;
	}

	_IsControlInTable(oTable: any, sControlId: string) {
		const oControl = Core.byId(sControlId);
		if (oControl && !oControl.isA("sap.ui.table.Table") && !oControl.isA("sap.m.Table")) {
			return oTable.findElements(true, function (oElem: any) {
				return oElem.getId() === oControl;
			});
		}
		return false;
	}

	_IsControlPartOfCreationRow(oControl: any) {
		let oParentControl = oControl.getParent();
		while (
			oParentControl &&
			!oParentControl.isA("sap.ui.table.Row") &&
			!oParentControl.isA("sap.ui.table.CreationRow") &&
			!oParentControl.isA(ColumnListItem.getMetadata().getName())
		) {
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
	 */
	_fetchColumnInfo(oMessage: any, oTable: any) {
		const sColNameFromMessageObj = oMessage.getBindingContext("message").getObject().getTarget().split("/").pop();
		return oTable
			.getParent()
			.getTableDefinition()
			.columns.find(function (oColumn: any) {
				return oColumn.key.split("::").pop() === sColNameFromMessageObj;
			});
	}

	/**
	 * The method that is called to check if a navigation is configured from the table to a sub object page.
	 *
	 * @private
	 * @param table MdcTable
	 * @returns Either true or false
	 */
	_navigationConfigured(table: any): boolean {
		// TODO: this logic would be moved to check the same at the template time to avoid the same check happening multiple times.
		const component = sap.ui.require("sap/ui/core/Component"),
			navObject = table && component.getOwnerComponentFor(table) && component.getOwnerComponentFor(table).getNavigation();
		let subOPConfigured = false,
			navConfigured = false;
		if (navObject && Object.keys(navObject).indexOf(table.getRowBinding().sPath) !== -1) {
			subOPConfigured =
				navObject[table?.getRowBinding().sPath] &&
				navObject[table?.getRowBinding().sPath].detail &&
				navObject[table?.getRowBinding().sPath].detail.route
					? true
					: false;
		}
		navConfigured =
			subOPConfigured &&
			table?.getRowSettings().getRowActions() &&
			table?.getRowSettings().getRowActions()[0].mProperties.type.indexOf("Navigation") !== -1;
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
	 */
	_getMessageSubtitle(
		message: MessageItem,
		oTableRowBindingContexts: Context[],
		oTableRowContext: Context,
		sTableTargetColName: string,
		oResourceBundle: ResourceBundle,
		oTable: MdcTable,
		bIsCreationRow: boolean,
		oTargetedControl?: any
	) {
		let sMessageSubtitle;
		let sRowSubtitleValue;
		const sTableFirstColProperty = (oTable.getParent() as TableAPI).getIdentifierColumn();
		const oColFromTableSettings = this._fetchColumnInfo(message, oTable);
		if (bIsCreationRow) {
			sMessageSubtitle = CommonUtils.getTranslatedText("T_MESSAGE_ITEM_SUBTITLE", oResourceBundle, [
				oResourceBundle.getText("T_MESSAGE_ITEM_SUBTITLE_CREATION_ROW_INDICATOR"),
				sTableTargetColName ? sTableTargetColName : oColFromTableSettings.label
			]);
		} else {
			const oTableFirstColBindingContextTextAnnotation = this._getTableFirstColBindingContextForTextAnnotation(
				oTable,
				oTableRowContext,
				sTableFirstColProperty
			);
			const sTableFirstColTextAnnotationPath = oTableFirstColBindingContextTextAnnotation
				? oTableFirstColBindingContextTextAnnotation.getObject("$Path")
				: undefined;
			const sTableFirstColTextArrangement =
				sTableFirstColTextAnnotationPath && oTableFirstColBindingContextTextAnnotation
					? oTableFirstColBindingContextTextAnnotation.getObject("@com.sap.vocabularies.UI.v1.TextArrangement/$EnumMember")
					: undefined;
			if (oTableRowBindingContexts.length > 0) {
				// set Row subtitle text
				if (oTargetedControl) {
					// The UI error is on the first column, we then get the control input as the row indicator:
					sRowSubtitleValue = oTargetedControl.getValue();
				} else if (oTableRowContext && sTableFirstColProperty) {
					sRowSubtitleValue = this._getTableFirstColValue(
						sTableFirstColProperty,
						oTableRowContext,
						sTableFirstColTextAnnotationPath,
						sTableFirstColTextArrangement
					);
				} else {
					sRowSubtitleValue = undefined;
				}
				// set the message subtitle
				const oColumnInfo: any = this._determineColumnInfo(oColFromTableSettings, oResourceBundle);
				if (sRowSubtitleValue && sTableTargetColName) {
					sMessageSubtitle = CommonUtils.getTranslatedText("T_MESSAGE_ITEM_SUBTITLE", oResourceBundle, [
						sRowSubtitleValue,
						sTableTargetColName
					]);
				} else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Hidden") {
					sMessageSubtitle = `${oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW")}: ${sRowSubtitleValue}, ${
						oColumnInfo.sColumnValue
					}`;
				} else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "Unknown") {
					sMessageSubtitle = CommonUtils.getTranslatedText("T_MESSAGE_ITEM_SUBTITLE", oResourceBundle, [
						sRowSubtitleValue,
						oColumnInfo.sColumnValue
					]);
				} else if (sRowSubtitleValue && oColumnInfo.sColumnIndicator === "undefined") {
					sMessageSubtitle = `${oResourceBundle.getText("T_MESSAGE_GROUP_DESCRIPTION_TABLE_ROW")}: ${sRowSubtitleValue}`;
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
	}

	_determineColumnInfo(oColFromTableSettings: any, oResourceBundle: any) {
		const oColumnInfo: any = { sColumnIndicator: String, sColumnValue: String };
		if (oColFromTableSettings) {
			// if column is neither in table definition nor personalization, show only row subtitle text
			if (oColFromTableSettings.availability === "Hidden") {
				oColumnInfo.sColumnValue = undefined;
				oColumnInfo.sColumnIndicator = "undefined";
			} else {
				//if column is in table personalization but not in table definition, show Column (Hidden) : <colName>
				oColumnInfo.sColumnValue = `${oResourceBundle.getText(
					"T_MESSAGE_GROUP_DESCRIPTION_TABLE_COLUMN"
				)} (${oResourceBundle.getText("T_COLUMN_INDICATOR_IN_TABLE_DEFINITION")}): ${oColFromTableSettings.label}`;
				oColumnInfo.sColumnIndicator = "Hidden";
			}
		} else {
			oColumnInfo.sColumnValue = oResourceBundle.getText("T_MESSAGE_ITEM_SUBTITLE_INDICATOR_UNKNOWN");
			oColumnInfo.sColumnIndicator = "Unknown";
		}
		return oColumnInfo;
	}

	setFocusToControl(control?: UI5Element) {
		const messagePopover = this.oMessagePopover;
		if (messagePopover && control && control.focus) {
			const fnFocus = () => {
				control.focus();
			};
			if (!messagePopover.isOpen()) {
				// when navigating to parent page to child page (on click of message), the child page might have a focus logic that might use a timeout.
				// we use the below timeouts to override this focus so that we focus on the target control of the message in the child page.
				setTimeout(fnFocus, 0);
			} else {
				const fnOnClose = () => {
					setTimeout(fnFocus, 0);
					messagePopover.detachEvent("afterClose", fnOnClose);
				};
				messagePopover.attachEvent("afterClose", fnOnClose);
				messagePopover.close();
			}
		} else {
			Log.warning("FE V4 : MessageButton : element doesn't have focus method for focusing.");
		}
	}
}

export default MessageButton;
