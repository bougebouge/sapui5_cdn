/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides class sap.ui.dt.plugin.MouseSelection.
sap.ui.define([
	"sap/ui/dt/Plugin"
],
function(Plugin) {
	"use strict";

	/**
	 * Constructor for a new MouseSelection.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The MouseSelection allows to select the Overlays with a mouse click
	 * @extends sap.ui.dt.Plugin
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @private
	 * @since 1.30
	 * @alias sap.ui.dt.plugin.MouseSelection
	 * @experimental Since 1.30. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var MouseSelection = Plugin.extend("sap.ui.dt.plugin.MouseSelection", /** @lends sap.ui.dt.plugin.MouseSelection.prototype */ {
		metadata: {
			library: "sap.ui.dt",
			properties: {
			},
			associations: {
			},
			events: {
			}
		}
	});

	/*
	 * @private
	 */
	MouseSelection.prototype.init = function() {
		// TODO: check if somebody is inherited from this plugin, if not then we can remove this init() function
		Plugin.prototype.init.apply(this, arguments);
	};

	/*
	 * @override
	 */
	MouseSelection.prototype.registerElementOverlay = function(oOverlay) {
		oOverlay.setSelectable(true);
		oOverlay.attachBrowserEvent('click', this._onClick, oOverlay);
	};

	// * @override
	MouseSelection.prototype.deregisterElementOverlay = function(oOverlay) {
		oOverlay.detachBrowserEvent('click', this._onClick, oOverlay);
	};

	/*
	 * @private
	 */
	MouseSelection.prototype._onClick = function(oEvent) {
		this.setSelected(!this.getSelected());

		oEvent.preventDefault();
		oEvent.stopPropagation();
	};

	return MouseSelection;
});