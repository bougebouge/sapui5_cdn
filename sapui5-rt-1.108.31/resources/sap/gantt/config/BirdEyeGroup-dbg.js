/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

sap.ui.define([
	'./ToolbarGroup'
], function (ToolbarGroup) {
	"use strict";

	/**
	 * Creates and initializes a new toolbar group for bird eye button
	 *
	 * @param {string} [sId] ID of the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * You can define bird eye toolbar items in the Gantt chart toolbar.
	 * @extends sap.gantt.config.ToolbarGroup
	 *
	 * @author SAP SE
	 * @version 1.108.10
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.64
	 * @alias sap.gantt.config.BirdEyeGroup
	 */
	var BirdEyeGroup = ToolbarGroup.extend("sap.gantt.config.BirdEyeGroup", {
		metadata: {
			library: "sap.gantt",
			properties: {

				/**
				 * Specify the data range that bird eye use to calculte the suitable visible horizon
				 * By default the bird eye is a menu button: one menu item for <code> sap.gantt.config.BirdEyeRange.VisibleRows</code>
				 * and the other for  <code>sap.gantt.config.BirdEyeRange.AllRows</code>
				 */
				birdEyeRange: {type: "string", defaultValue: null}
			}
		}
	});
	return BirdEyeGroup;
}, true);
