/*!
 * SAPUI5
 * (c) Copyright 2009-2022 SAP SE. All rights reserved.
 */

/**
 * Initialization Code and shared classes of library sap.me.
 */
sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/library'],
	function(Core) {
	"use strict";

	/**
	 * SAPUI5 library with controls specialized for mobile devices (extension).
	 *
	 * @namespace
	 * @alias sap.me
	 * @public
	 * @deprecated as of version 1.34
	 */
	var thisLib = sap.ui.getCore().initLibrary({
		name : "sap.me",
		version: "1.108.28",
		dependencies : ["sap.ui.core"],
		types: [
			"sap.me.CalendarDesign",
			"sap.me.CalendarEventType",
			"sap.me.CalendarSelectionMode"
		],
		interfaces: [],
		controls: [
			"sap.me.Calendar",
			"sap.me.CalendarLegend",
			"sap.me.OverlapCalendar",
			"sap.me.ProgressIndicator",
			"sap.me.TabContainer"
		],
		elements: [
			"sap.me.OverlapCalendarEvent"
		]
	});

	/**
	 * Type of Design for the Calendar
	 *
	 * @enum {string}
	 * @public
	 * @experimental Since version 1.12.
	 * API is not yet finished and might change completely
	 * @deprecated as of version 1.34
	 */
	thisLib.CalendarDesign = {

		/**
		 * Colors match calendar design for Action
		 * @public
		 */
		Action : "Action",

		/**
		 * Colors match calendar design for Approval
		 * @public
		 */
		Approval : "Approval"

	};

	/**
	 * Type code for a calendar event
	 *
	 * @enum {string}
	 * @public
	 * @experimental Since version 1.12.
	 * API is not yet finished and might change completely
	 * @deprecated as of version 1.34
	 */
	thisLib.CalendarEventType = {

		/**
		 * Type 00 (non-working day (e.g. weekend))
		 * @public
		 */
		Type00 : "Type00",

		/**
		 * Type 01 (nonattendance / submitted day)
		 * @public
		 */
		Type01 : "Type01",

		/**
		 * Type 04 (open request / manager action needed)
		 * @public
		 */
		Type04 : "Type04",

		/**
		 * Type 06 (public holiday)
		 * @public
		 */
		Type06 : "Type06",

		/**
		 * Type 07 (deletion requested / your action needed)
		 * @public
		 */
		Type07 : "Type07",

		/**
		 * Type 10 (workday)
		 * @public
		 */
		Type10 : "Type10"

	};

	/**
	 * Selection Mode for the Calendar
	 *
	 * @enum {string}
	 * @public
	 * @experimental Since version 1.12.
	 * API is not yet finished and might change completely
	 * @deprecated as of version 1.34
	 */
	thisLib.CalendarSelectionMode = {

		/**
		 * Can only select one date
		 * @public
		 */
		SINGLE : "SINGLE",

		/**
		 * Can select multiple dates and ranges
		 * @public
		 */
		MULTIPLE : "MULTIPLE",

		/**
		 * Can select a range of dates
		 * @public
		 */
		RANGE : "RANGE"

	};

	return thisLib;

}, /* bExport= */ true);
