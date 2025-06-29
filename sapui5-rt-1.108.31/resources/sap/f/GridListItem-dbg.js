/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/m/ListItemBase",
	"./GridListItemRenderer"
], function (ListItemBase, GridListItemRenderer) {
	"use strict";

	/**
	 * Constructor for a new GridListItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 *
	 * The <code>GridListItem</code> with a content aggregation can be used to display all kind of information. It is used in {@link sap.f.GridList sap.f.GridList}.
	 * <b>Note:</b> Even though the content aggregation can be used for any control, complex responsive layout controls, such as <code>Table, Form</code>, etc, should not be aggregated as content.
	 *
	 * @extends sap.m.ListItemBase
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @since 1.70
	 * @constructor
	 * @public
	 * @alias sap.f.GridListItem
	 */
	var GridListItem = ListItemBase.extend("sap.f.GridListItem", /** @lends sap.f.GridListItem.prototype */ {
		metadata : {

			library : "sap.f",
			defaultAggregation : "content",
			aggregations : {

				/**
				 * The content of this list item
				 */
				content : { type : "sap.ui.core.Control", multiple : true, singularName : "content", bindable : "bindable" }
			}
		},

		renderer: GridListItemRenderer
	});

	/**
	 * Returns the accessibility announcement for the content.
	 *
	 * @returns {string} The accessibility text of the content.
	 * @override
	 */
	GridListItem.prototype.getContentAnnouncement = function() {
		return this.getContent().map(function (oContent) {
			return ListItemBase.getAccessibilityText(oContent);
		}).join(" ").trim();
	};

	return GridListItem;
});
