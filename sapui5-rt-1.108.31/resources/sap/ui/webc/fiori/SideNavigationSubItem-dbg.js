/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.webc.fiori.SideNavigationSubItem.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/SideNavigationSubItem"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>SideNavigationSubItem</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.fiori.SideNavigationSubItem</code> is intended to be used inside a <code>sap.ui.webc.fiori.SideNavigationItem</code> only.
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.fiori.SideNavigationSubItem
	 * @implements sap.ui.webc.fiori.ISideNavigationSubItem
	 */
	var SideNavigationSubItem = WebComponent.extend("sap.ui.webc.fiori.SideNavigationSubItem", {
		metadata: {
			library: "sap.ui.webc.fiori",
			tag: "ui5-side-navigation-sub-item-ui5",
			interfaces: [
				"sap.ui.webc.fiori.ISideNavigationSubItem"
			],
			properties: {

				/**
				 * Defines the icon of the item. <br>
				 * <br>
				 *
				 *
				 * The SAP-icons font provides numerous options. <br>
				 * See all the available icons in the {@link demo:sap/m/demokit/iconExplorer/webapp/index.html Icon Explorer}.
				 */
				icon: {
					type: "string",
					defaultValue: ""
				},

				/**
				 * Defines whether the subitem is selected.
				 */
				selected: {
					type: "boolean",
					defaultValue: false
				},

				/**
				 * Defines the text of the item.
				 */
				text: {
					type: "string",
					defaultValue: ""
				}
			},
			designtime: "sap/ui/webc/fiori/designtime/SideNavigationSubItem.designtime"
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return SideNavigationSubItem;
});