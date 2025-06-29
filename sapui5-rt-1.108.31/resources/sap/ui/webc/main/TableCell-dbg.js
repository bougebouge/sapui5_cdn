/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.webc.main.TableCell.
sap.ui.define([
	"sap/ui/webc/common/WebComponent",
	"./library",
	"./thirdparty/TableCell"
], function(WebComponent, library) {
	"use strict";

	/**
	 * Constructor for a new <code>TableCell</code>.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @extends sap.ui.webc.common.WebComponent
	 * @class
	 *
	 * <h3>Overview</h3>
	 *
	 * The <code>sap.ui.webc.main.TableCell</code> component defines the structure of the data in a single <code>sap.ui.webc.main.Table</code> cell.
	 *
	 * <h3>CSS Shadow Parts</h3>
	 *
	 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/::part CSS Shadow Parts} allow developers to style elements inside the Shadow DOM. <br>
	 * The <code>sap.ui.webc.main.TableCell</code> exposes the following CSS Shadow Parts:
	 * <ul>
	 *     <li>cell - Used to style the native <code>td</code> element</li>
	 * </ul>
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @public
	 * @since 1.92.0
	 * @experimental Since 1.92.0 This control is experimental and its API might change significantly.
	 * @alias sap.ui.webc.main.TableCell
	 * @implements sap.ui.webc.main.ITableCell
	 */
	var TableCell = WebComponent.extend("sap.ui.webc.main.TableCell", {
		metadata: {
			library: "sap.ui.webc.main",
			tag: "ui5-table-cell-ui5",
			interfaces: [
				"sap.ui.webc.main.ITableCell"
			],
			defaultAggregation: "content",
			aggregations: {

				/**
				 * Specifies the content of the component.
				 */
				content: {
					type: "sap.ui.core.Control",
					multiple: true
				}
			}
		}
	});

	/* CUSTOM CODE START */
	/* CUSTOM CODE END */

	return TableCell;
});