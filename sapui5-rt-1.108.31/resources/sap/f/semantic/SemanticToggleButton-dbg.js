/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/m/semantic/SemanticToggleButton",
	"sap/f/semantic/SemanticConfiguration"
], function(MSemanticToggleButton, SemanticConfiguration) {
	"use strict";

	/**
	* Constructor for a new <code>SemanticToggleButton</code>.
	*
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Initial settings for the new control
	*
	* @class
	* A base class for the {@link sap.f.semantic.FavoriteAction} and {@link sap.f.semantic.FlagAction}.
	*
	* @extends sap.m.semantic.SemanticToggleButton
	* @abstract
	*
	* @author SAP SE
	* @version 1.108.28
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.SemanticToggleButton
	*/
	var SemanticToggleButton = MSemanticToggleButton.extend("sap.f.semantic.SemanticToggleButton", {
		metadata: {
			library : "sap.f",
			"abstract" : true
		}
	});

	/**
	 * @override
	 */
	SemanticToggleButton.prototype._getConfiguration = function () {
		return SemanticConfiguration.getConfiguration(this.getMetadata().getName());
	};

	return SemanticToggleButton;
});