/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.m.MessageListItem.
sap.ui.define([
	"sap/ui/core/library",
	"sap/ui/core/InvisibleText",
	"./library",
	'./StandardListItem',
	'./Link',
	"./MessageListItemRenderer"
],
	function (coreLibrary, InvisibleText, library, StandardListItem, Link, MessageListItemRenderer) {
		"use strict";

		// shortcut for sap.ui.core.MessageType
		var MessageType = coreLibrary.MessageType;

		// shortcut for sap.m.ListType
		var ListType = library.ListType;

		/**
		 * Constructor for a new MessageListItem.
		 *
		 * @param {string} [sId] Id for the new control, generated automatically if no id is given
		 * @param {object} [mSettings] Initial settings for the new control
		 *
		 * @class
		 * <code>sap.m.MessageListItem</code> is an extension of the <code>sap.m.StandardListItem</code> with an interactive title.
		 * @extends sap.m.StandardListItem
		 *
		 * @author SAP SE
		 * @version 1.108.28
		 *
		 * @constructor
		 * @private
		 * @alias sap.m.MessageListItem
		 */
		var MessageListItem = StandardListItem.extend("sap.m.MessageListItem", /** @lends sap.m.MessageListItem.prototype */ {
			metadata: {
				library: "sap.m",
				properties: {
					activeTitle: { type: "boolean", group: "Misc", defaultValue: false},
					messageType: { type: "sap.ui.core.MessageType", group: "Appearance", defaultValue: MessageType.Error }
				},
				aggregations: {
					link: { type: "sap.m.Link", group: "Misc", multiple: false },
					linkAriaDescribedBy: {type: "sap.ui.core.Control", group: "Misc", multiple: false}
				},
				events: {
					activeTitlePress: {}
				}
			},

			renderer: MessageListItemRenderer
		});

		MessageListItem.prototype.onBeforeRendering = function () {
			StandardListItem.prototype.onBeforeRendering.apply(this, arguments);
			var oLink = this.getLink(), oDescribedByText;

			if (!oLink && this.getActiveTitle()) {
				oLink = new Link({
					press: [this.fireActiveTitlePress, this]

				});
				this.setLink(oLink);
			}

			//prevent unneeded creation of sap.ui.core.InvisibleText
			if (oLink && !oLink.getAriaDescribedBy().length) {
				oDescribedByText = this._getLinkAriaDescribedBy();

				oLink.setProperty("text", this.getTitle(), true);
				oLink.addAssociation('ariaDescribedBy', oDescribedByText.getId(), true);

				this.setAggregation("linkAriaDescribedBy", oDescribedByText, true);
			}
		};

		MessageListItem.prototype._getLinkAriaDescribedBy = function () {
			var sAccessibilityText = sap.ui.getCore().getLibraryResourceBundle("sap.m").getText("MESSAGE_VIEW_LINK_FOCUS_TEXT_" + this.getMessageType().toUpperCase());

			return new InvisibleText(this.getId() + "-link", {
				text: sAccessibilityText
			});
		};

		/**
		 * Handles the ALT + Enter event
	 	 * @param {jQuery.Event} oEvent - the keyboard event.
		 * @private
		 */
		MessageListItem.prototype.onkeydown = function(oEvent) {
			if (this.getActiveTitle() && oEvent.altKey && oEvent.key === 'Enter') {
				this.fireActiveTitlePress(this);
			}
		};

		MessageListItem.prototype.getContentAnnouncement = function(oBundle) {
			var sAnnouncement = StandardListItem.prototype.getContentAnnouncement.apply(this, arguments),
				sAdditionalTextLocation, sAdditionalTextDescription, sMessageType;

			if (this.getActiveTitle()) {
				sMessageType = this.getMessageType().toUpperCase();
				sAdditionalTextLocation = oBundle.getText("MESSAGE_LIST_ITEM_FOCUS_TEXT_LOCATION_" + sMessageType);
				sAdditionalTextDescription = this.getType() === ListType.Navigation ? oBundle.getText("MESSAGE_LIST_ITEM_FOCUS_TEXT_DESCRIPTION") : "";

				sAnnouncement += ". ".concat(sAdditionalTextLocation, ". ", sAdditionalTextDescription);
			}
			return sAnnouncement;
		};

		return MessageListItem;

	});
