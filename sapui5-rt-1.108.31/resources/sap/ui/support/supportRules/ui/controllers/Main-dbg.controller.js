/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"./BaseController",
	"../models/SharedModel",
	"../models/Documentation",
	"../models/SelectionUtils",
	"../models/PresetsUtils",
	"sap/ui/core/Fragment",
	"sap/ui/core/mvc/XMLView",
	"sap/ui/support/supportRules/CommunicationBus",
	"sap/ui/support/supportRules/WCBChannels",
	"sap/ui/support/supportRules/Constants",
	"sap/ui/support/supportRules/Storage",
	"sap/ui/support/supportRules/util/EvalUtils",
	"sap/ui/VersionInfo",
	"sap/m/library"
], function (
	BaseController,
	SharedModel,
	Documentation,
	SelectionUtils,
	PresetsUtils,
	Fragment,
	XMLView,
	CommunicationBus,
	channelNames,
	Constants,
	Storage,
	EvalUtils,
	VersionInfo,
	mobileLibrary
) {
	"use strict";

	var ButtonType = mobileLibrary.ButtonType;

	return BaseController.extend("sap.ui.support.supportRules.ui.controllers.Main", {
		onInit: function () {
			this.model = SharedModel;
			this.getView().setModel(this.model);
			this.resizeDown();
			this.setCommunicationSubscriptions();
			this.initSettingsPopoverModel();
			this.hidden = false;
			this.model.setProperty("/hasNoOpener", window.opener ? false : true);
			this.model.setProperty("/constants", Constants);
			this.updateShowButton();
			this._setContextSettings();
			this._zoomUI();

			this.bAdditionalViewLoaded = false;
			CommunicationBus.subscribe(channelNames.UPDATE_SUPPORT_RULES, function () {
				if (!this.bAdditionalViewLoaded) {
					this.bAdditionalViewLoaded = true;
					this.loadAdditionalUI();
				}
			}, this);
		},

		_zoomUI: function () {
			try {
				var sZoomUI = window.localStorage.getItem("support-assistant-zoom-ui");
				var sFontSize = "100%";

				switch (sZoomUI) {
					case "S":
						sFontSize = "90%";
						break;
					default:
						// noop
				}

				document.querySelector("html").style.fontSize = sFontSize;
			} catch (oError) {
				// Swallow "Access Denied" exceptions in cross-origin scenarios.
			}
		},

		loadAdditionalUI: function () {
			XMLView.create({
				id: this.getView().getId() + "--issues",
				viewName: "sap.ui.support.supportRules.ui.views.Issues"
			}).then(function (issuesPage) {
				this.byId("navCon").insertPage(issuesPage);
			}.bind(this));
		},

		onAfterRendering: function () {
			VersionInfo.load({ library: "sap.ui.core" }).then(function (oCoreLibInfo) {
				CommunicationBus.publish(channelNames.POST_UI_INFORMATION, {
					version: oCoreLibInfo,
					location: new URL(sap.ui.require.toUrl("sap/ui/support"), window.location.origin + window.location.pathname).toString()
				});
			});

			this._checkTempRules();
		},

		initSettingsPopoverModel: function () {
			var supportAssistantOrigin = new URL(sap.ui.require.toUrl("sap/ui/support"), window.location.origin + window.location.pathname).toString(),
				supportAssistantVersion = sap.ui.version;

			this.model.setProperty("/supportAssistantOrigin", supportAssistantOrigin);
			this.model.setProperty("/supportAssistantVersion", supportAssistantVersion);
		},

		copySupportAssistantOriginToClipboard: function (oEvent) {
			var supportAssistantOrigin = this.model.getProperty("/supportAssistantOrigin"),
				copyToClipboardEventHandler = function (oEvent) {
					if (oEvent.clipboardData) {
						oEvent.clipboardData.setData('text/plain', supportAssistantOrigin);
					} else {
						oEvent.originalEvent.clipboardData.setData('text/plain', supportAssistantOrigin);
					}
					oEvent.preventDefault();
				};

			if (window.clipboardData) {
				window.clipboardData.setData("text", supportAssistantOrigin);
			} else {
				document.addEventListener('copy', copyToClipboardEventHandler);
				document.execCommand('copy');
				document.removeEventListener('copy', copyToClipboardEventHandler);
			}
		},

		setCommunicationSubscriptions: function () {

			var iProgressTimeout;

			CommunicationBus.subscribe(channelNames.CURRENT_LOADING_PROGRESS, function (data) {
				var iCurrentProgress = data.value,
					oProgressIndicator = this.byId("progressIndicator");

				if (data.value < 100) {
					this.model.setProperty("/showProgressIndicator", true);

					// handling unknown errors
					// if the progress is not updated within 2500ms, remove progress indicator
					clearTimeout(iProgressTimeout);
					iProgressTimeout = setTimeout(function () {
						this.model.setProperty("/showProgressIndicator", false);
					}.bind(this), 2500);

				} else {
					// Hides ProgressIndicator after a timeout of 2 seconds
					setTimeout(function () {
						this.model.setProperty("/showProgressIndicator", false);
					}.bind(this), 2000);
				}

				oProgressIndicator.setDisplayValue(Constants.RULESET_LOADING + " " + iCurrentProgress + "%");

				this.model.setProperty("/progress", iCurrentProgress);
			}, this);

			CommunicationBus.subscribe(channelNames.ON_ANALYZE_FINISH, function (data) {
				this._clearProcessIndicator();
				this.ensureOpened();
				this.model.setProperty("/showProgressIndicator", false);
				this.model.setProperty("/coreStateChanged", false);
				this.model.setProperty("/lastAnalysisElapsedTime", data.elapsedTime);
				this.goToIssues();
				this.model.setProperty("/analyzedFinish", true);
			}, this);

			CommunicationBus.subscribe(channelNames.ON_PROGRESS_UPDATE, function (data) {
				var currentProgress = data.currentProgress,
					pi = this.byId("progressIndicator");

				pi.setDisplayValue(currentProgress + "/" + 100);
				this.model.setProperty("/progress", currentProgress);
			}, this);

			CommunicationBus.subscribe(channelNames.ON_CORE_STATE_CHANGE, function () {
				this.model.setProperty("/coreStateChanged", true);
			}, this);
		},

		resizeUp: function () {
			CommunicationBus.publish(channelNames.RESIZE_FRAME, { bigger: true });
		},

		ensureOpened: function () {
			CommunicationBus.publish(channelNames.ENSURE_FRAME_OPENED);
		},

		resizeDown: function () {
			CommunicationBus.publish(channelNames.RESIZE_FRAME, { bigger: false });
		},

		onSettings: function (oEvent) {
			CommunicationBus.publish(channelNames.ENSURE_FRAME_OPENED);
			this._openSettingsPopover(oEvent.getSource());
		},

		onPersistedSettingSelect: function() {
			if (this.model.getProperty("/persistingSettings")) {
				Storage.createPersistenceCookie(Constants.COOKIE_NAME, true);

				this.model.getProperty("/libraries").forEach(function (lib) {
					if (lib.title === Constants.TEMP_RULESETS_NAME) {
						Storage.setRules(lib.rules);
					}
				});

				this.persistExecutionScope();
				this.persistVisibleColumns();
				SelectionUtils.persistSelection();
				PresetsUtils.persistSelectionPresets();
				PresetsUtils.persistCustomPresets();
			} else {
				Storage.deletePersistenceCookie(Constants.COOKIE_NAME);
				this.deletePersistedData();
			}
		},

		onSettingsPopoverClose: function () {
			if (this.model.getProperty("/persistingSettings") && !this.model.getProperty("/tempRulesDisabledWarned")) {
				this.model.setProperty("/tempRulesDisabledWarned", true);
				Storage.markTempRulesDisabledWarned();
			}
		},

		goToAnalysis: function (oEvent) {
			this._setActiveView("analysis");
		},

		goToIssues: function (oEvent) {
			this._setActiveView("issues");
		},

		goToWiki: function () {
			Documentation.openTopic("57ccd7d7103640e3a187ed55e1d2c163");
		},

		updateShowButton: function () {
			// When hidden is true - the frame is minimized and we show the "show" button
			this.byId("sapSTShowButtonBar").setVisible(this.hidden);
		},

		toggleHide: function () {
			this.hidden = !this.hidden;
			this.updateShowButton();

			CommunicationBus.publish(channelNames.TOGGLE_FRAME_HIDDEN, this.hidden);
		},

		_clearProcessIndicator: function () {
			var pi = this.byId("progressIndicator");
			pi.setDisplayValue("None");
			this.model.setProperty("/progress", 0.1);
		},

		_setContextSettings: function () {
			var cookie = Storage.readPersistenceCookie(Constants.COOKIE_NAME);
			if (cookie) {
				this.model.setProperty("/persistingSettings", true);
				var contextSettings = Storage.getSelectedContext();

				if (contextSettings) {
					this.model.setProperty("/analyzeContext", contextSettings.analyzeContext);
					this.model.setProperty("/subtreeExecutionContextId", contextSettings.subtreeExecutionContextId);
				} else {
					this.model.setProperty("/analyzeContext", this.model.getProperty("/analyzeContext"));
					this.model.setProperty("/subtreeExecutionContextId", "");
				}
			}
		},

		_setActiveView: function(sId) {
			this.byId("issuesBtn").setType(ButtonType.Default);
			this.byId("analysisBtn").setType(ButtonType.Default);

			//The corresponding button must have id with the name of the view
			this.byId(sId + "Btn").setType(ButtonType.Emphasized);
			this.byId("navCon").to(this.byId(sId), "show");
			this.ensureOpened();
		},

		_checkTempRules: function () {
			if (!EvalUtils.isEvalAllowed() && !this.model.getProperty("/tempRulesDisabledWarned")) {
				this._openSettingsPopover();
			}
		},

		_openSettingsPopover: function () {
			if (!this._settingsPopover) {
				this._settingsPopover = Fragment.load({
					name: "sap.ui.support.supportRules.ui.views.StorageSettings",
					controller: this
				}).then(function (settingsPopover) {
					this.getView().addDependent(settingsPopover);
					return settingsPopover;
				}.bind(this));
			}

			this._settingsPopover.then(function (settingsPopover) {
				settingsPopover.openBy(this.byId("settingsIcon"));
			}.bind(this));
		},

		_isSettingsPopoverOpen: function () {
			return this._settingsPopover && this._settingsPopover.isOpen();
		}
	});
});
