/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.commons.ColorPicker.
sap.ui.define(['./library', 'sap/ui/unified/ColorPicker', "sap/base/Log"],
	function(library, UnifiedColorPicker, Log) {
	"use strict";



	/**
	 * Constructor for a new ColorPicker.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This control gives the user the opportunity to choose a color. The color can be defined using HEX-, RGB- or HSV-values or a CSS colorname.
	 * @extends sap.ui.unified.ColorPicker
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @public
	 * @deprecated as of version 1.38, replaced by {@link sap.ui.unified.ColorPicker}
	 * @alias sap.ui.commons.ColorPicker
	 */
	var ColorPicker = UnifiedColorPicker.extend("sap.ui.commons.ColorPicker", /** @lends sap.ui.commons.ColorPicker.prototype */ {
		metadata : {
			deprecated : true,
			library : "sap.ui.commons"
		},
		renderer : "sap.ui.unified.ColorPickerRenderer"
	});

	try {
		sap.ui.getCore().loadLibrary("sap.ui.unified");
	} catch (e) {
		Log.error("The control 'sap.ui.commons.ColorPicker' needs library 'sap.ui.unified'.");
		throw (e);
	}

	return ColorPicker;

});
