/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides class sap.ui.rta.RuntimeAuthoring.
sap.ui.define([
	"sap/base/strings/capitalize",
	"sap/base/util/isPlainObject",
	"sap/base/util/UriParameters",
	"sap/base/Log",
	"sap/m/MessageBox",
	"sap/m/MessageToast",
	"sap/ui/thirdparty/jquery",
	"sap/ui/base/ManagedObject",
	"sap/ui/core/BusyIndicator",
	"sap/ui/dt/DesignTime",
	"sap/ui/dt/DOMUtil",
	"sap/ui/dt/ElementUtil",
	"sap/ui/dt/Overlay",
	"sap/ui/dt/OverlayRegistry",
	"sap/ui/dt/Util",
	"sap/ui/events/KeyCodes",
	"sap/ui/fl/write/api/Version",
	"sap/ui/fl/apply/api/SmartVariantManagementApplyAPI",
	"sap/ui/fl/write/api/ContextBasedAdaptationsAPI",
	"sap/ui/fl/write/api/ControlPersonalizationWriteAPI",
	"sap/ui/fl/write/api/FeaturesAPI",
	"sap/ui/fl/write/api/PersistenceWriteAPI",
	"sap/ui/fl/write/api/ReloadInfoAPI",
	"sap/ui/fl/write/api/VersionsAPI",
	"sap/ui/fl/write/api/TranslationAPI",
	"sap/ui/fl/Layer",
	"sap/ui/fl/registry/Settings",
	"sap/ui/fl/Utils",
	"sap/ui/model/json/JSONModel",
	"sap/ui/performance/Measurement",
	"sap/ui/rta/appVariant/Feature",
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/rta/command/LREPSerializer",
	"sap/ui/rta/command/Stack",
	"sap/ui/rta/service/index",
	"sap/ui/rta/toolbar/Fiori",
	"sap/ui/rta/toolbar/FioriLike",
	"sap/ui/rta/toolbar/Personalization",
	"sap/ui/rta/toolbar/Standalone",
	"sap/ui/rta/util/changeVisualization/ChangeVisualization",
	"sap/ui/rta/util/PluginManager",
	"sap/ui/rta/util/PopupManager",
	"sap/ui/rta/util/ReloadManager",
	"sap/ui/rta/util/ServiceEventBus",
	"sap/ui/rta/util/validateFlexEnabled",
	"sap/ui/rta/Utils",
	"sap/ui/Device"
], function(
	capitalize,
	isPlainObject,
	UriParameters,
	Log,
	MessageBox,
	MessageToast,
	jQuery,
	ManagedObject,
	BusyIndicator,
	DesignTime,
	DOMUtil,
	ElementUtil,
	Overlay,
	OverlayRegistry,
	DtUtil,
	KeyCodes,
	Version,
	SmartVariantManagementApplyAPI,
	ContextBasedAdaptationsAPI,
	ControlPersonalizationWriteAPI,
	FeaturesAPI,
	PersistenceWriteAPI,
	ReloadInfoAPI,
	VersionsAPI,
	TranslationAPI,
	Layer,
	Settings,
	FlexUtils,
	JSONModel,
	Measurement,
	RtaAppVariantFeature,
	BaseCommand,
	LREPSerializer,
	CommandStack,
	ServicesIndex,
	FioriToolbar,
	FioriLikeToolbar,
	PersonalizationToolbar,
	StandaloneToolbar,
	ChangeVisualization,
	PluginManager,
	PopupManager,
	ReloadManager,
	ServiceEventBus,
	validateFlexEnabled,
	Utils,
	Device
) {
	"use strict";

	var STARTING = "STARTING";
	var STARTED = "STARTED";
	var STOPPED = "STOPPED";
	var FAILED = "FAILED";
	var SERVICE_STARTING = "SERVICE_STARTING";
	var SERVICE_STARTED = "SERVICE_STARTED";
	var SERVICE_FAILED = "SERVICE_FAILED";

	/**
	 * Constructor for a new sap.ui.rta.RuntimeAuthoring class.
	 *
	 * @class The runtime authoring allows to adapt the fields of a running application.
	 * @extends sap.ui.base.ManagedObject
	 * @author SAP SE
	 * @version 1.108.28
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.rta.RuntimeAuthoring
	 * @experimental This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var RuntimeAuthoring = ManagedObject.extend("sap.ui.rta.RuntimeAuthoring", {
		metadata: {
			// ---- control specific ----
			library: "sap.ui.rta",
			associations: {
				/** The root control which the runtime authoring should handle. Can only be sap.ui.core.Control or sap.ui.core.UIComponent */
				rootControl: {
					type: "sap.ui.base.ManagedObject"
				}
			},
			properties: {
				/** Whether the create custom field button should be shown */
				showToolbars: {
					type: "boolean",
					defaultValue: true
				},

				/** Whether rta is triggered from a dialog button */
				triggeredFromDialog: {
					type: "boolean",
					defaultValue: false
				},

				/** Whether the window unload dialog should be shown */
				showWindowUnloadDialog: {
					type: "boolean",
					defaultValue: true
				},

				/** sap.ui.rta.command.Stack */
				commandStack: {
					type: "any"
				},

				/**
				 * Map with flex-related settings
				 * @experimental
				 */
				flexSettings: {
					type: "object",
					defaultValue: {
						layer: Layer.CUSTOMER,
						developerMode: true
					}
				},

				/** Defines view state of key user adaptation. Possible values: adaptation, navigation, visualization */
				mode: {
					type: "string",
					defaultValue: "adaptation"
				},

				/**
				 * Defines designtime metadata scope
				 */
				metadataScope: {
					type: "string",
					defaultValue: "default"
				}
			},
			events: {
				/** Fired when the runtime authoring is started */
				start: {
					parameters: {
						editablePluginsCount: {
							type: "int"
						}
					}
				},

				/** Fired when the runtime authoring is stopped */
				stop: {},

				/** Fired when the runtime authoring failed to start */
				failed: {
					parameters: {
						error: {
							type: "any"
						}
					}
				},

				/**
				 * Event fired when a DesignTime selection is changed
				 */
				selectionChange: {
					parameters: {
						selection: {
							type: "sap.ui.dt.Overlay[]"
						}
					}
				},
				/**Event fired when the runtime authoring mode is changed */
				modeChanged: {},

				/**
				 * Fired when the undo/redo stack has changed, undo/redo buttons can be updated
				 */
				undoRedoStackModified: {}
			}
		},
		_sAppTitle: null,
		_dependents: null,
		_sStatus: STOPPED,
		_bNavigationModeWarningShown: false,
		constructor: function() {
			// call parent constructor
			ManagedObject.apply(this, arguments);

			this._dependents = {};
			this._mServices = {};
			this._mUShellServices = {};
			this._pElementModified = Promise.resolve();

			this.addDependent(new PluginManager(), "pluginManager");
			this.addDependent(new PopupManager(), "popupManager");

			if (this.getShowToolbars()) {
				this.getPopupManager().attachOpen(onPopupOpen, this);
				this.getPopupManager().attachClose(onPopupClose, this);

				// Change visualization can only be triggered from the toolbar
				this.addDependent(new ChangeVisualization(), "changeVisualization");
			}

			if (window.parent !== window) {
				this.startService("receiver");
			}
			this.startService("supportTools");

			this._loadUShellServicesPromise = FlexUtils.getUShellServices(["URLParsing", "AppLifeCycle", "CrossApplicationNavigation"])
				.then(function(mUShellServices) {
					this._mUShellServices = mUShellServices;
					ReloadManager.setUShellServices(mUShellServices);
				}.bind(this));
		}
	});

	/**
	 * The RTA FLP plugin checks whether RTA needs to be restarted and restarts it if needed.
	 *
	 * @public
	 * @static
	 * @param {sap.ui.fl.Layer} sLayer - Active layer
	 * @returns {boolean} Returns true if restart is needed
	 */
	RuntimeAuthoring.needsRestart = function(sLayer) {
		return ReloadManager.needsAutomaticStart(sLayer);
	};

	/**
	 * Enable restart of RTA
	 * the RTA FLP plugin handles the restart
	 *
	 * @public
	 * @static
	 * @param {sap.ui.fl.Layer} sLayer - Active layer
	 * @param {sap.ui.core.Control} oRootControl - Root control for which RTA was started
	 */
	RuntimeAuthoring.enableRestart = function(sLayer, oRootControl) {
		ReloadManager.enableAutomaticStart(sLayer, oRootControl);
	};

	/**
	 * Disable restart of RTA
	 *
	 * @public
	 * @static
	 * @param {sap.ui.fl.Layer} sLayer - Active layer
	 */
	RuntimeAuthoring.disableRestart = function(sLayer) {
		ReloadManager.disableAutomaticStart(sLayer);
	};

	RuntimeAuthoring.prototype.addDependent = function(oObject, sName, bCreateGetter) {
		bCreateGetter = typeof bCreateGetter === "undefined" ? true : !!bCreateGetter;
		if (!(sName in this._dependents)) {
			if (sName && bCreateGetter) {
				this["get" + capitalize(sName, 0)] = this.getDependent.bind(this, sName);
			}
			this._dependents[sName || oObject.getId()] = oObject;
		} else {
			throw DtUtil.createError(
				"RuntimeAuthoring#addDependent",
				DtUtil.printf("Can't add dependency with same key '{0}'", sName),
				"sap.ui.rta"
			);
		}
	};

	RuntimeAuthoring.prototype.getDependent = function(sName) {
		return this._dependents[sName];
	};

	RuntimeAuthoring.prototype.getDependents = function() {
		return this._dependents;
	};

	RuntimeAuthoring.prototype.removeDependent = function(sName) {
		delete this._dependents[sName];
	};

	/**
	 * Setter method for plugins. Plugins can't be set when runtime authoring is started.
	 *
	 * @param {object} mPlugins - Map of plugins
	 */
	RuntimeAuthoring.prototype.setPlugins = function(mPlugins) {
		if (this._sStatus !== STOPPED) {
			throw new Error("Cannot replace plugins: runtime authoring already started");
		}
		this.getPluginManager().setPlugins(mPlugins);
	};

	/**
	 * Getter method for plugins.
	 *
	 * @returns {Object<string, sap.ui.rta.plugin.Plugin>} Map with plugins
	 */
	RuntimeAuthoring.prototype.getPlugins = function() {
		return this.getPluginManager
			&& this.getPluginManager()
			&& this.getPluginManager().getPlugins();
	};

	/**
	 * Returns (and creates) the default plugins of RuntimeAuthoring
	 *
	 * These are AdditionalElements, ContextMenu, CreateContainer, CutPaste,
	 * DragDrop, Remove, Rename, Selection, Settings, TabHandling
	 *
	 * Method uses a local cache to hold the default plugins: Then on multiple access
	 * always the same instances get returned.
	 *
	 * @public
	 * @returns {Object<string,sap.ui.rta.plugin.Plugin>} Map with plugins
	 */
	RuntimeAuthoring.prototype.getDefaultPlugins = function() {
		return this.getPluginManager().getDefaultPlugins(this.getFlexSettings());
	};

	/**
	 * Setter for flexSettings. Checks the Uri for parameters that override the layer.
	 * builds the rootNamespace and namespace parameters from the other parameters
	 *
	 * @param {object} [mFlexSettings] property bag
	 * @param {string} [mFlexSettings.layer] The Layer in which RTA should be started. Default: "CUSTOMER"
	 * @param {boolean} [mFlexSettings.developerMode] Whether RTA is started in DeveloperMode Mode. Whether RTA is started in DeveloperMode Mode
	 * @param {string} [mFlexSettings.baseId] base ID of the app
	 * @param {string} [mFlexSettings.projectId] project ID
	 * @param {string} [mFlexSettings.scenario] Key representing the current scenario
	 */
	RuntimeAuthoring.prototype.setFlexSettings = function(mFlexSettings) {
		// Check URI-parameters for sap-ui-layer
		var oUriParams = UriParameters.fromQuery(window.location.search);
		var sUriLayer = oUriParams.get("sap-ui-layer");

		mFlexSettings = jQuery.extend({}, this.getFlexSettings(), mFlexSettings);
		if (sUriLayer) {
			mFlexSettings.layer = sUriLayer.toUpperCase();
		}

		// TODO: this will lead to incorrect information if this function is first called with scenario or baseId and then called again without.
		if (mFlexSettings.scenario || mFlexSettings.baseId) {
			var sLRepRootNamespace = FlexUtils.buildLrepRootNamespace(mFlexSettings.baseId, mFlexSettings.scenario, mFlexSettings.projectId);
			mFlexSettings.rootNamespace = sLRepRootNamespace;
			mFlexSettings.namespace = sLRepRootNamespace + "changes/";
		}

		Utils.setRtaStyleClassName(mFlexSettings.layer);
		this.setProperty("flexSettings", mFlexSettings);
	};

	/**
	 * Checks the uri parameters for "sap-ui-layer" and returns either the current layer or the layer from the uri parameter, if there is one
	 *
	 * @returns {string} The layer after checking the uri parameters
	 * @private
	 */
	RuntimeAuthoring.prototype.getLayer = function() {
		return this.getFlexSettings().layer;
	};

	RuntimeAuthoring.prototype.getRootControlInstance = function() {
		if (!this._oRootControl) {
			this._oRootControl = ElementUtil.getElementInstance(this.getRootControl());
		}
		return this._oRootControl;
	};

	RuntimeAuthoring.prototype._getTextResources = function() {
		return sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
	};

	/**
	 * Start UI adaptation at runtime (RTA).
	 *
	 * @returns {Promise} Returns a Promise with the initialization of RTA
	 * @public
	 */
	RuntimeAuthoring.prototype.start = function() {
		var oDesignTimePromise;
		var vError;
		// Create DesignTime
		if (this._sStatus === STOPPED) {
			this._sStatus = STARTING;
			var oRootControl = this.getRootControlInstance();
			if (!oRootControl) {
				vError = new Error("Root control not found");
				Log.error(vError);
				return Promise.reject(vError);
			}

			return this._loadUShellServicesPromise
			.then(initVersioning.bind(this))
			/*
			 Check if the application has personalized changes and reload without them;
			 Also Check if the application has an available draft and if yes, reload with those changes.
			 */
			.then(function() {
				return ReloadManager.handleReloadOnStart({
					layer: this.getLayer(),
					selector: this.getRootControlInstance(),
					versioningEnabled: this._oVersionsModel.getProperty("/versioningEnabled"),
					developerMode: this.getFlexSettings().developerMode
				});
			}.bind(this))
			.then(function(bReloadTriggered) {
				if (bReloadTriggered) {
					// FLP Plugin reacts on this error string and doesn't pass the error on the UI
					return Promise.reject("Reload triggered");
				}
				var oFlexInfoSession = PersistenceWriteAPI.getResetAndPublishInfoFromSession(this.getRootControlInstance());
				this.bInitialResetEnabled = !!oFlexInfoSession.isResetEnabled;
				this.bInitialPublishEnabled = !!oFlexInfoSession.isPublishEnabled;

				this._oSerializer = new LREPSerializer({commandStack: this.getCommandStack(), rootControl: this.getRootControl()});

				this.getPluginManager().preparePlugins(
					this.getFlexSettings(),
					handleElementModified.bind(this),
					this.getCommandStack()
				);

				var aPlugins = this.getPluginManager().getPluginList();

				oDesignTimePromise = new Promise(function(fnResolve, fnReject) {
					Measurement.start("rta.dt.startup", "Measurement of RTA: DesignTime start up");
					this._oDesignTime = new DesignTime({
						scope: this.getMetadataScope(),
						plugins: aPlugins
					});

					addOrRemoveStyleClass(this.getRootControlInstance(), true);

					//add root control is triggering overlay creation, so we need to wait for the scope to be set.
					this._oDesignTime.addRootElement(this._oRootControl);

					jQuery(Overlay.getOverlayContainer()).addClass("sapUiRta");
					if (this.getLayer() === Layer.USER) {
						jQuery(Overlay.getOverlayContainer()).addClass("sapUiRtaPersonalize");
					} else {
						// RTA Visual Improvements
						jQuery("body").addClass("sapUiRtaMode");
					}
					this._oDesignTime.getSelectionManager().attachChange(function(oEvent) {
						this.fireSelectionChange({selection: oEvent.getParameter("selection")});
					}, this);

					this._oDesignTime.attachEventOnce("synced", function() {
						fnResolve();
						Measurement.end("rta.dt.startup", "Measurement of RTA: DesignTime start up");
					}, this);

					this._oDesignTime.attachEventOnce("syncFailed", function(oEvent) {
						fnReject(oEvent.getParameter("error"));
					});
				}.bind(this));

				// Register function for checking unsaved before leaving RTA
				this._oldUnloadHandler = window.onbeforeunload;
				window.onbeforeunload = this._onUnload.bind(this);
				return undefined;
			}.bind(this))
			.then(function() {
				if (this.getShowToolbars()) {
					// Create ToolsMenu
					return getToolbarButtonsVisibility(this.getRootControlInstance(), this.getLayer(), this._oSerializer)
						.then(createToolsMenu.bind(this));
				}
				return undefined;
			}.bind(this))
			// this is needed to initially check if undo is available, e.g. when the stack gets initialized with changes
			.then(onStackModified.bind(this))
			.then(function() {
				//Resolve the CSS variable set in themes/base/OverlayWithScrollbar.css
				Overlay.getOverlayContainer().get(0).style.setProperty("--sap-ui-rta-scrollbar-scrollWidth", DOMUtil.getScrollbarWidth() + "px");
				Overlay.getOverlayContainer().get(0).style.setProperty("--sap-ui-rta-scrollbar-scrollWidthPlusTwo", DOMUtil.getScrollbarWidth() + 2 + "px");
				return oDesignTimePromise;
			})
			.then(function() {
				// PopupManager sets the toolbar to already open popups' autoCloseAreas
				// Since at this point the toolbar is not available, it waits for RTA to start,
				// before adding it to the autoCloseAreas of the open popups
				this.getPopupManager().setRta(this);
				if (this.getShowToolbars()) {
					// the show() method of the toolbar relies on this RTA instance being set on the PopupManager
					return this.getToolbar().show();
				}
				return undefined;
			}.bind(this))
			.then(function() {
				if (Device.browser.name === "ff") {
					// in FF shift+f10 also opens a browser context menu.
					// It seems that the only way to get rid of it is to completely turn off context menu in ff..
					jQuery(document).on("contextmenu", ffContextMenuHandler);
				}
			})
			.then(function() {
				this.fnKeyDown = onKeyDown.bind(this);
				jQuery(document).on("keydown", this.fnKeyDown);
				this.fnOnPersonalizationChangeCreation = onPersonalizationChangeCreation.bind(this);
				ControlPersonalizationWriteAPI.attachChangeCreation(
					this.getRootControlInstance(),
					this.fnOnPersonalizationChangeCreation
				);
			}.bind(this))
			.then(shouldValidateFlexEnabled)
			.then(function(bShouldValidateFlexEnabled) {
				if (bShouldValidateFlexEnabled) {
					validateFlexEnabled(this);
				}
				this._sStatus = STARTED;
				this.fireStart({
					editablePluginsCount: this.getPluginManager().getEditableOverlaysCount()
				});
			}.bind(this))
			.catch(function(vError) {
				if (vError === "Reload triggered") {
					// destroy rta when reload is triggered - otherwise the consumer needs to take care of this
					this.destroy();
				} else {
					this._sStatus = FAILED;
					this.fireFailed({error: vError});
				}
				return Promise.reject(vError);
			}.bind(this));
		}
		return Promise.reject("RuntimeAuthoring is already started");
	};

	/**
	 * Stops Runtime Authoring
	 *
	 * @public
	 * @param {boolean} bSkipSave - Stop RTA with or w/o saving changes
	 * @param {boolean} bSkipRestart - Stop RTA with or w/o checking if a reload is needed to apply e.g. personalization/app descriptor changes
	 * @returns {Promise} Resolves with undefined
	 */
	RuntimeAuthoring.prototype.stop = function(bSkipSave, bSkipRestart) {
		checkToolbarAndExecuteFunction.call(this, "setBusy", true);
		var oReloadInfo;
		return waitForPendingActions.call(this)
			.then(function() {
				if (bSkipRestart) {
					return {};
				}
				return ReloadManager.checkReloadOnExit({
					layer: this.getLayer(),
					selector: this.getRootControlInstance(),
					isDraftAvailable: this._oVersionsModel.getProperty("/draftAvailable"),
					versioningEnabled: this._oVersionsModel.getProperty("/versioningEnabled"),
					activeVersion: this._oVersionsModel.getProperty("/activeVersion"),
					changesNeedReloadPromise: this._bSavedChangesNeedReload ? Promise.resolve(true) : this._oSerializer.needsReload()
				});
			}.bind(this))
			.then(function(oReturn) {
				oReloadInfo = oReturn;
				return bSkipSave ? Promise.resolve() : this._serializeToLrep();
			}.bind(this))
			.then(checkToolbarAndExecuteFunction.bind(this, "hide", bSkipSave))
			.then(function() {
				this.fireStop();
				if (!bSkipRestart) {
					ReloadManager.handleUrlParametersOnExit(oReloadInfo);
				}
			}.bind(this))
			.catch(showTechnicalError)
			.then(function() {
				checkToolbarAndExecuteFunction.call(this, "setBusy", false);
				this._sStatus = STOPPED;
				jQuery("body").removeClass("sapUiRtaMode");
			}.bind(this));
	};

	/**
	 * @override
	 */
	RuntimeAuthoring.prototype.setCommandStack = function(oCommandStack) {
		var oOldCommandStack = this.getProperty("commandStack");
		if (oOldCommandStack) {
			oOldCommandStack.detachModified(onStackModified, this);
		}

		if (this._oInternalCommandStack) {
			this._oInternalCommandStack.destroy();
			delete this._oInternalCommandStack;
		}

		var oResult = this.setProperty("commandStack", oCommandStack);

		if (oCommandStack) {
			oCommandStack.attachModified(onStackModified, this);
		}

		if (this.getPluginManager && this.getPluginManager()) {
			this.getPluginManager().provideCommandStack("settings", oCommandStack);
		}

		return oResult;
	};

	/**
	 * @override
	 */
	RuntimeAuthoring.prototype.getCommandStack = function() {
		var oCommandStack = this.getProperty("commandStack");
		if (!oCommandStack) {
			oCommandStack = new CommandStack();
			this._oInternalCommandStack = oCommandStack;
			this.setCommandStack(oCommandStack);
		}

		return oCommandStack;
	};

	/**
	 * @override
	 */
	RuntimeAuthoring.prototype.setMode = function(sNewMode) {
		var sCurrentMode = this.getMode();
		if (sCurrentMode !== sNewMode) {
			var oTabHandlingPlugin = this.getPluginManager().getPlugin("tabHandling");
			var oSelectionPlugin = this.getPluginManager().getPlugin("selection");

			// Switch between another mode and navigation -> toggle overlay & App-TabIndex enablement
			if (sCurrentMode === "navigation" || sNewMode === "navigation") {
				this._oDesignTime.setEnabled(sNewMode !== "navigation");
				oTabHandlingPlugin[(sNewMode === "navigation") ? "restoreTabIndex" : "removeTabIndex"]();
			}

			var oChangeVisualization = this.getChangeVisualization && this.getChangeVisualization();
			if (sNewMode === "visualization" || sCurrentMode === "visualization") {
				DtUtil.waitForSynced(this._oDesignTime)()
					.then(function() {
						return oChangeVisualization.triggerModeChange(this.getRootControl(), this.getToolbar());
					}.bind(this));
			}

			if (sCurrentMode === "adaptation") {
				this.getPluginManager().handleStopCutPaste();
			}

			oTabHandlingPlugin[(sNewMode === "adaptation") ? "restoreOverlayTabIndex" : "removeOverlayTabIndex"]();
			oSelectionPlugin.setIsActive(!(sNewMode === "visualization"));

			Overlay.getOverlayContainer().toggleClass("sapUiRtaVisualizationMode", (sNewMode === "visualization"));
			if (sNewMode === "visualization") {
				jQuery(".sapUiDtOverlayMovable").css("cursor", "default");
			} else {
				jQuery(".sapUiDtOverlayMovable").css("cursor", "move");
			}

			this._oToolbarControlsModel.setProperty("/modeSwitcher", sNewMode);
			this.setProperty("mode", sNewMode);
			this.fireModeChanged({mode: sNewMode});
		}
	};

	/**
	 * @override
	 */
	RuntimeAuthoring.prototype.setMetadataScope = function(sScope) {
		// We do not support scope change after creation of DesignTime instance
		// as this requires re-initialization of all overlays
		if (this._sStatus !== STOPPED) {
			Log.error("sap.ui.rta: Failed to set metadata scope on RTA instance after RTA is started");
			return;
		}

		this.setProperty("metadataScope", sScope);
	};

	/**
	 * Exit Runtime Authoring - destroy all controls and plugins
	 *
	 * @protected
	 */
	RuntimeAuthoring.prototype.destroy = function() {
		jQuery.map(this._dependents, function(oDependent, sName) {
			this.removeDependent(sName);
			// Destroy should be called with suppress invalidate = true here to prevent static UI Area invalidation
			oDependent.destroy(true);
		}.bind(this));

		Object.keys(this._mServices).forEach(function(sServiceName) {
			this.stopService(sServiceName);
		}, this);

		if (this._oDesignTime) {
			this._oDesignTime.destroy();
			this._oDesignTime = null;

			// detach browser events
			jQuery(document).off("keydown", this.fnKeyDown);

			if (this.fnOnPersonalizationChangeCreation) {
				ControlPersonalizationWriteAPI.detachChangeCreation(
					this.getRootControlInstance(),
					this.fnOnPersonalizationChangeCreation
				);
			}
		}

		if (this.getRootControlInstance()) {
			addOrRemoveStyleClass(this.getRootControlInstance(), false);
		}

		this.setCommandStack(null);

		if (this._oServiceEventBus) {
			this._oServiceEventBus.destroy();
		}

		if (Device.browser.name === "ff") {
			jQuery(document).off("contextmenu", ffContextMenuHandler);
		}

		window.onbeforeunload = this._oldUnloadHandler;

		ManagedObject.prototype.destroy.apply(this, arguments);
	};

	// ---- API ----

	/**
	 * Returns the selected overlays from the DesignTime. Used by VisualEditor
	 * @returns {sap.ui.dt.Overlay[]} Selected overlays
	 * @public
	 */
	 RuntimeAuthoring.prototype.getSelection = function() {
		if (this._oDesignTime) {
			return this._oDesignTime.getSelectionManager().get();
		}
		return [];
	};

	/**
	 * Discard all LREP changes and restores the default app state,
	 * opens a MessageBox where the user can confirm
	 * the restoring to the default app state
	 *
	 * @returns {Promise} Resolves when Message Box is closed.
	 */
	RuntimeAuthoring.prototype.restore = function() {
		var sLayer = this.getLayer();
		var sMessageKey = sLayer === Layer.USER
			? "FORM_PERS_RESET_MESSAGE_PERSONALIZATION"
			: "FORM_PERS_RESET_MESSAGE";
		var sTitleKey = sLayer === Layer.USER
			? "BTN_RESTORE"
			: "FORM_PERS_RESET_TITLE";

		this.getPluginManager().handleStopCutPaste();

		return Utils.showMessageBox("warning", sMessageKey, {
			titleKey: sTitleKey,
			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			emphasizedAction: MessageBox.Action.OK
		}).then(function(sAction) {
			if (sAction === MessageBox.Action.OK) {
				RuntimeAuthoring.enableRestart(sLayer, this.getRootControlInstance());
				return deleteChanges.call(this);
			}
			return undefined;
		}.bind(this));
	};

	/**
	 * Function to handle ABAP transport of the changes
	 *
	 * @returns {Promise} Returns a Promise processing the transport of changes
	 */
	RuntimeAuthoring.prototype.transport = function() {
		this.getPluginManager().handleStopCutPaste();

		BusyIndicator.show(500);
		return this._serializeToLrep().then(function() {
			BusyIndicator.hide();
			var bVariantByStartupParameter = FlexUtils.isVariantByStartupParameter(this._oRootControl);
			var bAppVariantRunning = SmartVariantManagementApplyAPI.isApplicationVariant({control: this._oRootControl}) && !bVariantByStartupParameter;
			return (bAppVariantRunning ? RtaAppVariantFeature.getAppVariantDescriptor(this._oRootControl) : Promise.resolve())
				.then(function(oAppVariantDescriptor) {
					var aAppVariantDescriptor = [];
					if (oAppVariantDescriptor) {
						aAppVariantDescriptor.push(oAppVariantDescriptor);
					}
					return PersistenceWriteAPI.publish({
						selector: this.getRootControlInstance(),
						styleClass: Utils.getRtaStyleClassName(),
						layer: this.getLayer(),
						appVariantDescriptors: aAppVariantDescriptor
					})
					.then(function(sMessage) {
						if (sMessage !== "Error" && sMessage !== "Cancel") {
							MessageToast.show(sMessage);
							if (this.getShowToolbars()) {
								PersistenceWriteAPI.getResetAndPublishInfo({
									selector: this.getRootControlInstance(),
									layer: this.getLayer()
								})
								.then(function(oPublishAndResetInfo) {
									this._oToolbarControlsModel.setProperty("/publishEnabled", oPublishAndResetInfo.isPublishEnabled);
									this._oToolbarControlsModel.setProperty("/restoreEnabled", oPublishAndResetInfo.isResetEnabled);
								}.bind(this));
							}
						}
					}.bind(this));
				}.bind(this));
		}.bind(this))
		.catch(showTechnicalError);
	};

	RuntimeAuthoring.prototype.undo = function() {
		this.getPluginManager().handleStopCutPaste();
		return this.getCommandStack().undo();
	};

	RuntimeAuthoring.prototype.redo = function() {
		this.getPluginManager().handleStopCutPaste();
		return this.getCommandStack().redo();
	};

	RuntimeAuthoring.prototype.canUndo = function() {
		return this.getCommandStack().canUndo();
	};

	RuntimeAuthoring.prototype.canRedo = function() {
		return this.getCommandStack().canRedo();
	};

	RuntimeAuthoring.prototype.save = function() {
		return waitForPendingActions.call(this)
			.then(this._serializeToLrep.bind(this));
	};

	// ---- API ----

	// this function is used to save in the Visual Editor
	RuntimeAuthoring.prototype._serializeToLrep = function(bCondenseAnyLayer) {
		// when saving a change that requires a reload, the information has to be cached
		// to do the reload when exiting UI Adaptation as then the change will not be available anymore
		if (!this._bSavedChangesNeedReload) {
			return this._oSerializer.needsReload().then(function(bReloadNeeded) {
				this._bSavedChangesNeedReload = bReloadNeeded;
				return serializeAndSave.call(this, undefined, bCondenseAnyLayer);
			}.bind(this));
		}
		return serializeAndSave.call(this, undefined, bCondenseAnyLayer);
	};

	/**
	 * Check for unsaved changes before leaving UI adaptation at runtime
	 *
	 * @returns {string} Returns the message to be displayed in the unsaved changes dialog
	 * @private
	 */
	RuntimeAuthoring.prototype._onUnload = function() {
		// this function is still in the prototype scope for easier testing
		var oCommandStack = this.getCommandStack();
		var bUnsaved = oCommandStack.canUndo();
		if (bUnsaved && this.getShowWindowUnloadDialog()) {
			return this._getTextResources().getText("MSG_UNSAVED_CHANGES");
		}
		window.onbeforeunload = this._oldUnloadHandler;
		return undefined;
	};

	function shouldValidateFlexEnabled() {
		var sUriParam = UriParameters.fromQuery(window.location.search).get("sap-ui-rta-skip-flex-validation");
		return Settings.getInstance()
			.then(function(oSettings) {
				return !oSettings.isCustomerSystem() && sUriParam !== "true";
			});
	}

	function onPopupOpen(oEvent) {
		var oOpenedPopup = oEvent.getParameters().getSource();
		if (
			oOpenedPopup.isA("sap.m.Dialog")
			&& this.getToolbar().type === "fiori"
		) {
			this.getToolbar().setColor("contrast");
		}
		this.getToolbar().bringToFront();
	}

	function onPopupClose(oEvent) {
		if (oEvent.getParameters().isA("sap.m.Dialog")) {
			this.getToolbar().setColor();
		}
	}

	function onPersonalizationChangeCreation() {
		if (this.getMode() === "navigation" && !this._bNavigationModeWarningShown) {
			showMessageToast.call(this, "MSG_NAVIGATION_MODE_CHANGES_WARNING", {
				duration: 5000
			});
			this._bNavigationModeWarningShown = true;
		}
	}

	function showMessageToast(sMessageKey, mOptions) {
		var sMessage = this._getTextResources().getText(sMessageKey);

		MessageToast.show(sMessage, mOptions || {});
	}

	function addOrRemoveStyleClass(oRootControl, bAdd) {
		if (oRootControl.isA("sap.ui.core.UIComponent")) {
			oRootControl = oRootControl.getRootControl();
		}
		if (oRootControl) {
			oRootControl[bAdd ? "addStyleClass" : "removeStyleClass"]("sapUiRtaRoot");
		}
	}

	function ffContextMenuHandler() {
		return false;
	}

	/**
	 * Checks the publish button, draft buttons(activate and delete) and app variant support (i.e. Save As and Overview of App Variants) availability
	 * The publish button shall not be available if the system is productive and if a merge error occurred during merging changes into the view on startup
	 * The app variant support shall not be available if the system is productive and if the platform is not enabled (See Feature.js) to show the app variant tooling
	 * The app variant support shall also not be available if the current app is a home page
	 * isProductiveSystem should only return true if it is a test or development system with the provision of custom catalog extensions
	 *
	 * @param {object} oRootControl - Root control instance
	 * @param {sap.ui.fl.Layer} sLayer - Active layer
	 * @param {sap.ui.rta.command.LREPSerializer} oSerializer - LREP Serializer
	 * @returns {Promise<map>} with publishAvailable, publishAppVariantSupported and draftAvailable values
	 */
	function getToolbarButtonsVisibility(oRootControl, sLayer, oSerializer) {
		return Promise.all([
			FeaturesAPI.isPublishAvailable(),
			RtaAppVariantFeature.isSaveAsAvailable(oRootControl, sLayer, oSerializer),
			FeaturesAPI.isContextBasedAdaptationAvailable(sLayer),
			FlexUtils.getUShellService("AppLifeCycle").then(function(oAppLifeCycle) {
				if (oAppLifeCycle) {
					var mRunningApp = oAppLifeCycle.getCurrentApplication();
					return mRunningApp ? mRunningApp.homePage : false;
				}
				return false;
			})
		]).then(function(aRtaFeaturesAvailability) {
			var bIsPublishAvailable = aRtaFeaturesAvailability[0];
			var bIsSaveAsAvailable = aRtaFeaturesAvailability[1];
			var bIsContextBasedAdaptationAvailable = aRtaFeaturesAvailability[2];
			var bIsHomePage = aRtaFeaturesAvailability[3];
			return {
				publishAvailable: bIsPublishAvailable,
				saveAsAvailable: !bIsHomePage && bIsPublishAvailable && bIsSaveAsAvailable,
				contextBasedAdaptationAvailable: !bIsHomePage && bIsContextBasedAdaptationAvailable
			};
		});
	}

	function showTechnicalError(vError) {
		BusyIndicator.hide();
		var sErrorMessage = vError.userMessage || vError.stack || vError.message || vError.status || vError;
		var oTextResources = sap.ui.getCore().getLibraryResourceBundle("sap.ui.rta");
		Log.error("Failed to transfer changes", sErrorMessage);
		var sMsg = oTextResources.getText("MSG_LREP_TRANSFER_ERROR") + "\n"
				+ oTextResources.getText("MSG_ERROR_REASON", sErrorMessage);
		MessageBox.error(sMsg, {
			styleClass: Utils.getRtaStyleClassName()
		});
	}

	/**
	 * Adapt the enablement of undo/redo/reset/transport button
	 *
	 * @returns {Promise} Resolves as soon as the MessageBox is closed
	 */
	function onStackModified() {
		var bBackEndDraftExists = this._oVersionsModel.getProperty("/backendDraft");
		var bDraftDisplayed = this._oVersionsModel.getProperty("/displayedVersion") === Version.Number.Draft;
		var oCommandStack = this.getCommandStack();
		var bCanUndo = oCommandStack.canUndo();

		if (
			!this.getShowToolbars() ||
			!bCanUndo ||
			this._bUserDiscardedDraft ||
			bDraftDisplayed ||
			!bBackEndDraftExists
		) {
			return modifyStack.call(this);
		}

		// warn the user: the existing draft would be discarded in case the user saves
		return Utils.showMessageBox("warning", "MSG_DRAFT_DISCARD_AND_CREATE_NEW_DIALOG", {
			titleKey: "TIT_DRAFT_DISCARD_DIALOG",
			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			emphasizedAction: MessageBox.Action.OK
		})
		.then(function(sAction) {
			if (sAction === MessageBox.Action.OK) {
				discardDraftConfirmed.call(this);
			} else {
				this.undo();
			}
		}.bind(this));
	}

	function modifyStack() {
		if (this.getShowToolbars()) {
			var oCommandStack = this.getCommandStack();
			var bCanUndo = oCommandStack.canUndo();
			var bCanRedo = oCommandStack.canRedo();
			var bTranslationRelevantDirtyChange = this._oToolbarControlsModel.getProperty("/translationVisible") &&
				TranslationAPI.hasTranslationRelevantDirtyChanges({layer: Layer.CUSTOMER, selector: this.getRootControlInstance()});

			// TODO: move to the setter to the ChangesState
			this._oVersionsModel.setDirtyChanges(PersistenceWriteAPI.hasDirtyChanges({selector: this.getRootControlInstance()}));
			this._oToolbarControlsModel.setProperty("/undoEnabled", bCanUndo);
			this._oToolbarControlsModel.setProperty("/redoEnabled", bCanRedo);
			this._oToolbarControlsModel.setProperty("/publishEnabled", this.bInitialPublishEnabled || bCanUndo);
			this._oToolbarControlsModel.setProperty("/restoreEnabled", this.bInitialResetEnabled || bCanUndo);
			this._oToolbarControlsModel.setProperty("/translationEnabled", this.bPersistedDataTranslatable || bTranslationRelevantDirtyChange);
		}
		this.fireUndoRedoStackModified();
	}

	function checkToolbarAndExecuteFunction(sName, vValue) {
		if (this.getShowToolbars() && this.getToolbar && this.getToolbar()) {
			return this.getToolbar()[sName](vValue);
		}
		return undefined;
	}

	function waitForPendingActions() {
		return Promise.resolve(this._oDesignTime && this._oDesignTime.waitForBusyPlugins())
			.then(function() {
				return this._pElementModified;
			}.bind(this));
	}

	function onKeyDown(oEvent) {
		// if for example the addField Dialog/transport/reset Popup is open, we don't want the user to be able to undo/redo
		var bMacintosh = Device.os.macintosh;
		var bFocusInsideOverlayContainer = Overlay.getOverlayContainer().get(0).contains(document.activeElement);
		var bFocusInsideRtaToolbar = this.getShowToolbars() && this.getToolbar().getDomRef().contains(document.activeElement);
		var bFocusOnContextMenu = false;
		// there might be two divs with that style-class (compact and expanded context menu)
		jQuery(".sapUiDtContextMenu").each(function(iIndex, oDomRef) {
			if (oDomRef.contains(document.activeElement)) {
				bFocusOnContextMenu = true;
			}
		});
		var bFocusOnBody = document.body === document.activeElement;
		var bFocusInsideRenameField = jQuery(document.activeElement).parents(".sapUiRtaEditableField").length > 0;

		if ((bFocusInsideOverlayContainer || bFocusInsideRtaToolbar || bFocusOnContextMenu || bFocusOnBody) && !bFocusInsideRenameField) {
			// OSX: replace CTRL with CMD
			var bCtrlKey = bMacintosh ? oEvent.metaKey : oEvent.ctrlKey;
			if (
				oEvent.keyCode === KeyCodes.Z
				&& oEvent.shiftKey === false
				&& oEvent.altKey === false
				&& bCtrlKey === true
			) {
				this.undo().then(oEvent.stopPropagation.bind(oEvent));
			} else if (
				((// OSX: CMD+SHIFT+Z
					bMacintosh
					&& oEvent.keyCode === KeyCodes.Z
					&& oEvent.shiftKey === true
				) || (// Others: CTRL+Y
					!bMacintosh
					&& oEvent.keyCode === KeyCodes.Y
					&& oEvent.shiftKey === false
				))
				&& oEvent.altKey === false
				&& bCtrlKey === true
			) {
				this.redo().then(oEvent.stopPropagation.bind(oEvent));
			}
		}
	}

	function onSaveAsContextBasedAdaptation(oEvent) {
		var mPropertyBag = {
			parameters: oEvent.mParameters,
			control: this.getRootControlInstance(),
			layer: this.getLayer()
		};
		return ContextBasedAdaptationsAPI.create(mPropertyBag);
	}

	function saveOnly(oEvent) {
		var fnCallback = oEvent.getParameter("callback") || function() {};
		return this.save()
			.then(fnCallback);
	}

	function serializeAndSave(bActivateVersion, bCondenseAnyLayer) {
		if (this.getShowToolbars()) {
			this.bPersistedDataTranslatable = this._oToolbarControlsModel.getProperty("/translationEnabled");
		}
		var mPropertyBag = {
			// Save changes on the current layer and discard dirty changes on other layers
			saveAsDraft: this._oVersionsModel.getProperty("/versioningEnabled") && this.getLayer() === Layer.CUSTOMER,
			layer: this.getLayer(),
			removeOtherLayerChanges: true,
			version: bActivateVersion ? this._oVersionsModel.getProperty("/displayedVersion") : undefined,
			condenseAnyLayer: bCondenseAnyLayer
		};

		return this._oSerializer.saveCommands(mPropertyBag);
	}

	function onActivate(oEvent) {
		var sVersionTitle = oEvent.getParameter("versionTitle");
		if (isOldVersionDisplayed.call(this) && isDraftAvailable.call(this)) {
			return Utils.showMessageBox("warning", "MSG_DRAFT_DISCARD_ON_REACTIVATE_DIALOG", {
				titleKey: "TIT_DRAFT_DISCARD_ON_REACTIVATE_DIALOG",
				actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.OK
			})
			.then(function(sAction) {
				if (sAction === MessageBox.Action.OK) {
					return activate.call(this, sVersionTitle);
				}
			}.bind(this));
		}
		return activate.call(this, sVersionTitle);
	}

	function activate(sVersionTitle) {
		var sLayer = this.getLayer();
		var oSelector = this.getRootControlInstance();
		var sDisplayedVersion = this._oVersionsModel.getProperty("/displayedVersion");
		return serializeAndSave.call(this, true)
		.then(function() {
			return VersionsAPI.activate({
				layer: sLayer,
				control: oSelector,
				title: sVersionTitle,
				displayedVersion: sDisplayedVersion
			});
		}).then(function() {
			showMessageToast.call(this, "MSG_DRAFT_ACTIVATION_SUCCESS");
			this.bInitialResetEnabled = true;
			this._oToolbarControlsModel.setProperty("/restoreEnabled", true);
			this.getCommandStack().removeAllCommands();
		}.bind(this))
		.catch(function(oError) {
			Utils.showMessageBox("error", "MSG_DRAFT_ACTIVATION_FAILED", {error: oError});
		});
	}

	function onDiscardDraft() {
		return Utils.showMessageBox("warning", "MSG_DRAFT_DISCARD_DIALOG", {
			actions: [MessageBox.Action.OK, MessageBox.Action.CANCEL],
			emphasizedAction: MessageBox.Action.OK
		})
		.then(function(sAction) {
			if (sAction === MessageBox.Action.OK) {
				return VersionsAPI.discardDraft({
					layer: this.getLayer(),
					control: this.getRootControlInstance(),
					updateState: true
				})
				.then(handleDiscard.bind(this));
			}
			return undefined;
		}.bind(this));
	}

	function handleDiscard() {
		var sLayer = this.getLayer();
		var oReloadInfo = {
			layer: sLayer,
			removeDraft: true
		};
		RuntimeAuthoring.enableRestart(sLayer, this.getRootControlInstance());
		this.getCommandStack().removeAllCommands();
		ReloadManager.triggerReload(oReloadInfo);
		return this.stop(true, true);
	}

	function onSwitchVersion(oEvent) {
		var sVersion = oEvent.getParameter("version");
		var sDisplayedVersion = this._oVersionsModel.getProperty("/displayedVersion");

		if (sVersion === sDisplayedVersion) {
			// already displayed version needs no switch
			return;
		}

		if (this.canUndo()) {
			this._sSwitchToVersion = sVersion;
			Utils.showMessageBox("warning", "MSG_SWITCH_VERSION_DIALOG", {
				titleKey: "TIT_SWITCH_VERSION_DIALOG",
				actions: [MessageBox.Action.YES, MessageBox.Action.NO, MessageBox.Action.CANCEL],
				emphasizedAction: MessageBox.Action.YES
			}).then(function(sAction) {
				if (sAction === MessageBox.Action.YES) {
					this._serializeToLrep()
						.then(switchVersion.bind(this, this._sSwitchToVersion));
				} else if (sAction === MessageBox.Action.NO) {
					// avoids the data loss popup; a reload is triggered later and will destroy RTA & the command stack
					this.getCommandStack().removeAllCommands(true);
					switchVersion.call(this, this._sSwitchToVersion);
				}
				return undefined;
			}.bind(this));
			return;
		}
		switchVersion.call(this, sVersion);
	}

	function switchVersion(sVersion) {
		RuntimeAuthoring.enableRestart(this.getLayer(), this.getRootControlInstance());

		VersionsAPI.loadVersionForApplication({
			control: this.getRootControlInstance(),
			layer: this.getLayer(),
			version: sVersion
		});
		var oReloadInfo = {
			versionSwitch: true,
			version: sVersion
		};
		ReloadManager.triggerReload(oReloadInfo);
	}

	function onPublishVersion() {
		this.getPluginManager().handleStopCutPaste();

		return VersionsAPI.publish({
			selector: this.getRootControlInstance(),
			styleClass: Utils.getRtaStyleClassName(),
			layer: this.getLayer(),
			version: this._oVersionsModel.getProperty("/displayedVersion")
		})
		.then(function(sMessage) {
			if (sMessage !== "Error" && sMessage !== "Cancel") {
				MessageToast.show(sMessage);
			}
		});
	}

	function discardDraftConfirmed() {
		this._bUserDiscardedDraft = true;
		modifyStack.call(this);
	}

	function isOldVersionDisplayed() {
		return VersionsAPI.isOldVersionDisplayed({
			control: this.getRootControlInstance(),
			layer: this.getLayer()
		});
	}

	function isDraftAvailable() {
		return VersionsAPI.isDraftAvailable({
			control: this.getRootControlInstance(),
			layer: this.getLayer()
		});
	}

	function initVersioning() {
		return VersionsAPI.initialize({
			control: this.getRootControlInstance(),
			layer: this.getLayer()
		}).then(function(oModel) {
			this._oVersionsModel = oModel;
		}.bind(this));
	}

	function createToolsMenu(aButtonsVisibility) {
		if (!this.getDependent("toolbar")) {
			var bUserLayer = this.getLayer() === Layer.USER;
			var oProperties = {
				rtaInformation: {
					flexSettings: this.getFlexSettings(),
					rootControl: this.getRootControlInstance(),
					commandStack: this.getCommandStack()
				},
				textResources: this._getTextResources(),
				restore: this.restore.bind(this),
				exit: this.stop.bind(this, false, bUserLayer)
			};

			if (!bUserLayer) {
				oProperties.transport = this.transport.bind(this);
				oProperties.publishVersion = onPublishVersion.bind(this);
				oProperties.undo = this.undo.bind(this);
				oProperties.redo = this.redo.bind(this);
				oProperties.modeChange = onModeChange.bind(this);
				oProperties.activate = onActivate.bind(this);
				oProperties.discardDraft = onDiscardDraft.bind(this);
				oProperties.switchVersion = onSwitchVersion.bind(this);
				oProperties.saveAsContextBasedAdaptation = onSaveAsContextBasedAdaptation.bind(this);
				oProperties.openChangeCategorySelectionPopover = this.getChangeVisualization
					? this.getChangeVisualization().openChangeCategorySelectionPopover.bind(this.getChangeVisualization())
					: function() {};
				oProperties.save = saveOnly.bind(this);
			}

			var oToolbar;
			if (bUserLayer) {
				oToolbar = new PersonalizationToolbar(oProperties);
			} else if (Utils.isOriginalFioriToolbarAccessible()) {
				oToolbar = new FioriToolbar(oProperties);
			} else if (Utils.getFiori2Renderer()) {
				oToolbar = new FioriLikeToolbar(oProperties);
			} else {
				oToolbar = new StandaloneToolbar(oProperties);
			}
			this.addDependent(oToolbar, "toolbar");

			return Promise.all([oToolbar.onFragmentLoaded(), FeaturesAPI.isKeyUserTranslationEnabled(this.getLayer())])
				.then(function(aArguments) {
					var bTranslationAvailable = aArguments[1];
					var bSaveAsAvailable = aButtonsVisibility.saveAsAvailable;
					var bExtendedOverview = bSaveAsAvailable && RtaAppVariantFeature.isOverviewExtended();
					var oUriParameters = UriParameters.fromURL(window.location.href);
					// the "Visualization" tab should not be visible if the "fiori-tools-rta-mode" URL-parameter is set to any value but "false"
					var bVisualizationButtonVisible;
					bVisualizationButtonVisible = !oUriParameters.has("fiori-tools-rta-mode") || oUriParameters.get("fiori-tools-rta-mode") === "false";
					this.bPersistedDataTranslatable = false;

					this._oToolbarControlsModel = new JSONModel({
						undoEnabled: false,
						redoEnabled: false,
						translationVisible: bTranslationAvailable,
						translationEnabled: this.bPersistedDataTranslatable,
						publishVisible: aButtonsVisibility.publishAvailable,
						publishEnabled: this.bInitialPublishEnabled,
						restoreEnabled: this.bInitialResetEnabled,
						appVariantsOverviewVisible: bSaveAsAvailable && bExtendedOverview,
						appVariantsOverviewEnabled: bSaveAsAvailable && bExtendedOverview,
						saveAsVisible: bSaveAsAvailable,
						contextBasedAdaptationVisible: aButtonsVisibility.contextBasedAdaptationAvailable,
						saveAsEnabled: false,
						manageAppsVisible: bSaveAsAvailable && !bExtendedOverview,
						manageAppsEnabled: bSaveAsAvailable && !bExtendedOverview,
						modeSwitcher: this.getMode(),
						visualizationButtonVisible: bVisualizationButtonVisible
					});

					var oTranslationPromise = new Promise(function(resolve) {
						if (!bTranslationAvailable) {
							resolve();
							return;
						}

						TranslationAPI.getSourceLanguages({selector: this.getRootControlInstance(), layer: this.getLayer()})
							.then(function(aSourceLanguages) {
								this.bPersistedDataTranslatable = aSourceLanguages.length > 0;
								this._oToolbarControlsModel.setProperty("/translationEnabled", this.bPersistedDataTranslatable);
							}.bind(this)).finally(resolve);
					}.bind(this));

					var oSaveAsPromise = new Promise(function(resolve) {
						if (!bSaveAsAvailable) {
							resolve();
							return;
						}

						RtaAppVariantFeature.isManifestSupported().then(function(bResult) {
							this._oToolbarControlsModel.setProperty("/saveAsEnabled", bResult);
							this._oToolbarControlsModel.setProperty("/appVariantsOverviewEnabled", bResult);
							this._oToolbarControlsModel.setProperty("/manageAppsEnabled", bResult);
						}.bind(this)).finally(resolve);
					}.bind(this));

					this.getToolbar().setModel(this._oVersionsModel, "versions");
					this.getToolbar().setModel(this._oToolbarControlsModel, "controls");

					return Promise.all([oTranslationPromise, oSaveAsPromise]);
				}.bind(this));
		}
		return Promise.resolve();
	}

	/**
	 * Delete all changes for current layer and root control's component.
	 * In case of Base Applications (no App Variants) the App Descriptor Changes and UI Changes are saved in different Flex Persistence instances,
	 * the changes for both places will be deleted. For App Variants all the changes are saved in one place.
	 *
	 * @returns {Promise} Resolves when change persistence is reset
	 */
	function deleteChanges() {
		var sLayer = this.getLayer();
		var oSelector = FlexUtils.getAppComponentForControl(this.getRootControlInstance());
		return PersistenceWriteAPI.reset({
			selector: oSelector,
			layer: sLayer
		}).then(function() {
			// avoids the data loss popup; a reload is triggered later and will destroy RTA & the command stack
			this.getCommandStack().removeAllCommands(true);
			ReloadInfoAPI.removeInfoSessionStorage(oSelector);
			var oReloadInfo = {
				layer: sLayer,
				ignoreMaxLayerParameter: true,
				triggerHardReload: true
			};
			return ReloadManager.triggerReload(oReloadInfo);
		}.bind(this))
		.catch(function(oError) {
			if (oError !== "cancel") {
				Utils.showMessageBox("error", "MSG_RESTORE_FAILED", {error: oError});
			}
		});
	}

	/**
	 * Triggers a callback when a control gets created with its associated overlay.
	 *
	 * @param {string} sNewControlID - ID of the newly created control
	 * @param {Function} fnCallback - Callback to execute when the conditions are met, the overlay is the only parameter
	 */
	function scheduleOnCreated(sNewControlID, fnCallback) {
		function onElementOverlayCreated (oEvent) {
			var oNewOverlay = oEvent.getParameter("elementOverlay");
			if (oNewOverlay.getElement().getId() === sNewControlID) {
				this._oDesignTime.detachEvent("elementOverlayCreated", onElementOverlayCreated, this);
				fnCallback(oNewOverlay);
			}
		}

		this._oDesignTime.attachEvent("elementOverlayCreated", onElementOverlayCreated, this);
	}

	/**
	 * Triggers a callback when a control gets created and its associated overlay is visible.
	 *
	 * @param {string} sNewControlID - ID of the newly created control
	 * @param {Function} fnCallback - Callback to execute when the conditions are met, the overlay is the only parameter
	 */
	function scheduleOnCreatedAndVisible(sNewControlID, fnCallback) {
		function onGeometryChanged (oEvent) {
			var oElementOverlay = oEvent.getSource();
			if (oElementOverlay.getGeometry() && oElementOverlay.getGeometry().visible) {
				oElementOverlay.detachEvent("geometryChanged", onGeometryChanged);
				fnCallback(oElementOverlay);
			}
		}

		function onGeometryCheck (oElementOverlay) {
			// the control can be set to visible, but still have no size when we do the check
			// that's why we also attach to 'geometryChanged' and check if the overlay has a size
			if (!oElementOverlay.getGeometry() || !oElementOverlay.getGeometry().visible) {
				oElementOverlay.attachEvent("geometryChanged", onGeometryChanged);
			} else {
				fnCallback(oElementOverlay);
			}
		}

		scheduleOnCreated.call(this, sNewControlID, function(oNewOverlay) {
			// the overlay needs to be rendered
			if (oNewOverlay.isRendered()) {
				onGeometryCheck(oNewOverlay);
			} else {
				oNewOverlay.attachEventOnce("afterRendering", function(oEvent) {
					onGeometryCheck(oEvent.getSource());
				});
			}
		});
	}

	/**
	 * Function to automatically start the rename plugin on a container when it gets created
	 *
	 * @param {object} vAction - The create action from designtime metadata
	 * @param {string} sNewControlID - The id of the newly created container
	 */
	function scheduleRenameOnCreatedContainer(vAction, sNewControlID) {
		var fnStartEdit = function(oElementOverlay) {
			oElementOverlay.setSelected(true);
			this.getPluginManager().getPlugin("rename").startEdit(oElementOverlay);
		}.bind(this);

		scheduleOnCreatedAndVisible.call(this, sNewControlID, function(oElementOverlay) {
			// get container of the new control for rename
			var sNewContainerID = this.getPluginManager().getPlugin("createContainer").getCreatedContainerId(vAction, oElementOverlay.getElement().getId());
			var oContainerElementOverlay = OverlayRegistry.getOverlay(sNewContainerID);
			if (oContainerElementOverlay) {
				fnStartEdit(oContainerElementOverlay);
			} else {
				scheduleOnCreatedAndVisible.call(this, sNewContainerID, fnStartEdit);
			}
		}.bind(this));
	}

	/**
	 * Function to handle modification of an element
	 *
	 * @param {sap.ui.base.Event} oEvent Event object
	 * @returns {Promise} Returns promise that resolves after command was executed successfully
	 */
	function handleElementModified(oEvent) {
		// events are synchronously reset after the handlers are called
		var oCommand = oEvent.getParameter("command");
		var sNewControlID = oEvent.getParameter("newControlId");
		var vAction = oEvent.getParameter("action");

		this._pElementModified = this._pElementModified.then(function() {
			this.getPluginManager().handleStopCutPaste();

			if (oCommand instanceof BaseCommand) {
				if (sNewControlID) {
					scheduleOnCreated.call(this, sNewControlID, function(oElementOverlay) {
						var oDesignTimeMetadata = oElementOverlay.getDesignTimeMetadata();
						var fnSelect = oDesignTimeMetadata.getData().select;
						if (typeof fnSelect === "function") {
							fnSelect(oElementOverlay.getElement());
						}
					});
					if (vAction) {
						scheduleRenameOnCreatedContainer.call(this, vAction, sNewControlID);
					}
				}
				return this.getCommandStack().pushAndExecute(oCommand)
					// Error handling when a command fails is done in the Stack
					.catch(function(oError) {
						if (oError && oError.message && oError.message.indexOf("The following Change cannot be applied because of a dependency") > -1) {
							Utils.showMessageBox("error", "MSG_DEPENDENCY_ERROR", {error: oError});
						}
						Log.error("sap.ui.rta: " + oError.message);
					});
			}
		}.bind(this));
		return this._pElementModified;
	}

	function onModeChange(oEvent) {
		this.setMode(oEvent.getParameter("item").getKey());
	}

	function resolveServiceLocation(sName) {
		if (ServicesIndex.hasOwnProperty(sName)) {
			return ServicesIndex[sName].replace(/\./g, "/");
		}
		return undefined;
	}

	/**
	 * Starts a service
	 * @param {string} sName - Registered service name
	 * @returns {Promise} - Promise is resolved with service api or rejected in case of any error.
	 */
	RuntimeAuthoring.prototype.startService = function(sName) {
		if (this._sStatus !== STARTED) {
			return new Promise(function(fnResolve, fnReject) {
				this.attachEventOnce("start", fnResolve);
				this.attachEventOnce("failed", fnReject);
			}.bind(this))
			.then(
				function() {
					return this.startService(sName);
				}.bind(this),
				function() {
					return Promise.reject(
						DtUtil.createError(
							"RuntimeAuthoring#startService",
							DtUtil.printf("Can't start the service '{0}' while RTA has been failed during a startup", sName),
							"sap.ui.rta"
						)
					);
				}
			);
		}

		var sServiceLocation = resolveServiceLocation(sName);
		var mService;

		if (!sServiceLocation) {
			return Promise.reject(
				DtUtil.createError(
					"RuntimeAuthoring#startService",
					DtUtil.printf("Unknown service. Can't find any registered service by name '{0}'", sName),
					"sap.ui.rta"
				)
			);
		}

		mService = this._mServices[sName];
		if (mService) {
			switch (mService.status) {
				case SERVICE_STARTED: {
					return Promise.resolve(mService.exports);
				}
				case SERVICE_STARTING: {
					return mService.initPromise;
				}
				case SERVICE_FAILED: {
					return mService.initPromise;
				}
				default: {
					return Promise.reject(
						DtUtil.createError(
							"RuntimeAuthoring#startService",
							DtUtil.printf("Unknown service status. Service name = '{0}'", sName),
							"sap.ui.rta"
						)
					);
				}
			}
		} else {
			this._mServices[sName] = mService = {
				status: SERVICE_STARTING,
				location: sServiceLocation,
				initPromise: new Promise(function(fnResolve, fnReject) {
					sap.ui.require(
						[sServiceLocation],
						function(fnServiceFactory) {
							mService.factory = fnServiceFactory;

							if (!this._oServiceEventBus) {
								this._oServiceEventBus = new ServiceEventBus();
							}

							DtUtil.wrapIntoPromise(fnServiceFactory)(
								this,
								this._oServiceEventBus.publish.bind(this._oServiceEventBus, sName)
							)
								.then(function(oService) {
									if (this.bIsDestroyed) {
										throw DtUtil.createError(
											"RuntimeAuthoring#startService",
											DtUtil.printf("RuntimeAuthoring instance is destroyed while initializing the service '{0}'", sName),
											"sap.ui.rta"
										);
									}
									if (!isPlainObject(oService)) {
										throw DtUtil.createError(
											"RuntimeAuthoring#startService",
											DtUtil.printf("Invalid service format. Service should return simple javascript object after initialization. Service name = '{0}'", sName),
											"sap.ui.rta"
										);
									}

									mService.service = oService;
									mService.exports = {};

									// Expose events API if there is at least one event
									if (Array.isArray(oService.events) && oService.events.length > 0) {
										jQuery.extend(mService.exports, {
											attachEvent: this._oServiceEventBus.subscribe.bind(this._oServiceEventBus, sName),
											detachEvent: this._oServiceEventBus.unsubscribe.bind(this._oServiceEventBus, sName),
											attachEventOnce: this._oServiceEventBus.subscribeOnce.bind(this._oServiceEventBus, sName)
										});
									}

									// Expose methods/properties from exports object if any
									var mExports = oService.exports || {};
									jQuery.extend(
										mService.exports,
										Object.keys(mExports).reduce(function(mResult, sKey) {
											var vValue = mExports[sKey];
											mResult[sKey] = typeof vValue === "function"
												? DtUtil.waitForSynced(this._oDesignTime, vValue)
												: vValue;
											return mResult;
										}.bind(this), {})
									);

									mService.status = SERVICE_STARTED;
									fnResolve(Object.freeze(mService.exports));
								}.bind(this))
								.catch(fnReject);
						}.bind(this),
						function(vError) {
							mService.status = SERVICE_FAILED;
							fnReject(
								DtUtil.propagateError(
									vError,
									"RuntimeAuthoring#startService",
									DtUtil.printf("Can't load service '{0}' by its name: {1}", sName, sServiceLocation),
									"sap.ui.rta"
								)
							);
						}
					);
				}.bind(this))
					.catch(function(vError) {
						mService.status = SERVICE_FAILED;
						return Promise.reject(
							DtUtil.propagateError(
								vError,
								"RuntimeAuthoring#startService",
								DtUtil.printf("Error during service '{0}' initialization.", sName),
								"sap.ui.rta"
							)
						);
					})
			};

			return mService.initPromise;
		}
	};

	/**
	 * Stops a service
	 * @param {string} sName - Started service name
	 */
	RuntimeAuthoring.prototype.stopService = function(sName) {
		var oService = this._mServices[sName];

		if (oService) {
			if (oService.status === SERVICE_STARTED) {
				if (typeof oService.service.destroy === "function") {
					oService.service.destroy();
				}
			}
			delete this._mServices[sName];
		} else {
			throw DtUtil.createError(
				"RuntimeAuthoring#stopService",
				DtUtil.printf("Can't destroy service: unable to find service with name '{0}'", sName),
				"sap.ui.rta"
			);
		}
	};

	/**
	 * Gets a service by name (and starts it if it's not running)
	 * @param {string} sName - Registered service name
	 * @returns {Promise} - Promise is resolved with service api or rejected in case of any error.
	 */
	RuntimeAuthoring.prototype.getService = function(sName) {
		return this.startService(sName);
	};

	return RuntimeAuthoring;
});
