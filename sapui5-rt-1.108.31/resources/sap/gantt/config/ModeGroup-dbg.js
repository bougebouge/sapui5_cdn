/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'./ToolbarGroup'
], function (ToolbarGroup) {
	"use strict";

	/**
	 * Creates and initializes a new mode group
	 *
	 * @param {string} [sId] ID of the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The ModeGroup control specifies the mode-related buttons in the Gantt chart toolbar
	 *
	 * @extends sap.gantt.config.ToolbarGroup
	 *
	 * @author SAP SE
	 * @version 1.108.10
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.64
	 * @alias sap.gantt.config.ModeGroup
	 */
	var ModeGroup = ToolbarGroup.extend("sap.gantt.config.ModeGroup", /** @lends sap.gantt.config.ModeGroup.prototype */ {
		metadata: {
			library: "sap.gantt",
			properties: {

				/**
				 * Array of key of {@link sap.gantt.config.Mode}
				 */
				modeKeys: {type: "string[]", defaultValue: []}
			}
		}
	});

	return ModeGroup;
}, true);
