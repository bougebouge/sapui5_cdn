/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	'sap/ui/core/Element'
], function(Element) {
	"use strict";

	/**
	 * Constructor for a new ContactDetailsEmailItem.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] initial settings for the new control
	 * @class Type for...
	 * @extends sap.ui.core.Element
	 * @version 1.108.28
	 * @constructor
	 * @private
	 * @since 1.56.0
	 * @alias sap.ui.mdc.link.ContactDetailsEmailItem
	 */
	var ContactDetailsEmailItem = Element.extend("sap.ui.mdc.link.ContactDetailsEmailItem", /** @lends sap.ui.mdc.link.ContactDetailsEmailItem.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Email address
				 */
				uri: {
					type: "string"
				},
				types: {
					type: "sap.ui.mdc.ContactDetailsEmailType[]",
					defaultValue: []
				}
			}
		}
	});

	return ContactDetailsEmailItem;

});
