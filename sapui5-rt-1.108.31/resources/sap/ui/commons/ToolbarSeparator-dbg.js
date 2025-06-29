/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.commons.ToolbarSeparator.
sap.ui.define(['./library', 'sap/ui/core/Element'],
	function(library, Element) {
	"use strict";



	/**
	 * Constructor for a new ToolbarSeparator.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A small vertical line that is generally added to the tool bar between the items to visually separate them.
	 * @extends sap.ui.core.Element
	 * @implements sap.ui.commons.ToolbarItem
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.m.Toolbar</code> control.
	 * @alias sap.ui.commons.ToolbarSeparator
	 */
	var ToolbarSeparator = Element.extend("sap.ui.commons.ToolbarSeparator", /** @lends sap.ui.commons.ToolbarSeparator.prototype */ { metadata : {

		interfaces : [
			"sap.ui.commons.ToolbarItem"
		],
		library : "sap.ui.commons",
		deprecated: true,
		properties : {

			/**
			 * When set to false, there is no visual indication of separation by a vertical line but by a wider space.
			 */
			displayVisualSeparator : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Design of the Separator.
			 */
			design : {type : "sap.ui.commons.ToolbarSeparatorDesign", group : "Misc", defaultValue : null}
		}
	}});

	ToolbarSeparator.prototype.getFocusDomRef = function() {
		return undefined;
	};

	return ToolbarSeparator;

});
