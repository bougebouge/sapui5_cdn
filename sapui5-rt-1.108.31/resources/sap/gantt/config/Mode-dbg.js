/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	'sap/ui/core/Element'
], function (Element) {
	"use strict";

	/**
	 * Creates and initializes a new mode
	 *
	 * @param {string} [sId] ID of the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The Mode control specifies the mode which is used in GanttChart and Shape.
	 * Mode enables GanttChart to show the same objects in different views.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.108.10
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.64
	 * @alias sap.gantt.config.Mode
	 */
	var Mode = Element.extend("sap.gantt.config.Mode", /** @lends sap.gantt.config.Mode.prototype */ {
		metadata: {
			library: "sap.gantt",
			properties: {

				/**
				 * Unique key of the mode
				 */
				key: {type: "string", defaultValue: null},

				/**
				 * Description of the mode
				 */
				text: {type: "string", defaultValue: null},

				/**
				 * URL of the icon of the mode
				 */
				icon: {type: "sap.ui.core.URI", defaultValue: null},

				/**
				 * URL of the active icon of the mode
				 */
				activeIcon: {type: "sap.ui.core.URI"}
			}
		}
	});

	return Mode;
}, true);
