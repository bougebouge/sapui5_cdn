/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/support/supportRules/ui/external/Highlighter",
	"sap/ui/test/_ControlFinder",
	"sap/ui/testrecorder/Constants",
	"sap/ui/testrecorder/CommunicationBus",
	"sap/ui/testrecorder/CommunicationChannels",
	"sap/ui/testrecorder/interaction/Commands"
], function (Highlighter, _ControlFinder, constants, CommunicationBus, CommunicationChannels, Commands) {
	"use strict";

	var oHighlighter = new Highlighter(constants.HIGHLIGHTER_ID);

	return {
		execute: function (sDomElementId) {
			var sRootDomElementId = _ControlFinder._getIdentifiedDOMElementId("#" + sDomElementId);
			oHighlighter.highlight(sRootDomElementId);
			CommunicationBus.publish(CommunicationChannels.SELECT_CONTROL_IN_TREE, {
				rootElementId: sRootDomElementId,
				interactionElementId: sDomElementId,
				action: Commands.PRESS
			});
		}
	};
});
