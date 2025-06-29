/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/core/Element"
], function (Element) {
	"use strict";

	/**
	 * Creates and initializes a new setting item.
	 *
	 * @param {string} [sId] ID of the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * The SettingItem control allows you to create a setting item in the toolbar, which is presented as a checkbox with a label.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.108.10
	 *
	 * @constructor
	 * @public
	 * @alias sap.gantt.config.SettingItem
	 */
	var SettingItem = Element.extend("sap.gantt.config.SettingItem", /** @lends sap.gantt.config.SettingItem.prototype */ {
		metadata: {
			library: "sap.gantt",
			properties: {

				/**
				 * Indicates whether the checkbox is selected or not
				 */
				checked: {type: "boolean", defaultValue: false},

				/**
				 * Identifier of an event when the checkbox is toggled
				 */
				key: {type: "string", defaultValue: null},

				/**
				 * Aria label of the checkbox
				 */
				displayText: {type: "string", defaultValue: null},

				/**
				 * Set this to true for all standard settings
				 * @private
				 * @deprecated since 1.108.22. This is a private property and it is being removed from UI5 version 1.117. We recommend not using this property. In case you want to use it, contact us using CA-UI5-CTR-GNT.
				 **/

				_isStandard: { type: "boolean", defaultValue: false}
			}
		}
	});

	SettingItem.prototype.setChecked = function(bChecked) {
		this.setProperty("checked", bChecked, true);
		if (this.oParent !== null) {
			this.oParent._oSettingsBox.getItems().forEach(function(oItem) {
				if (oItem.getName() === this.getKey()) {
					oItem.setSelected(bChecked, true);
				}
			}.bind(this));
		}
		return this;
	};

	return SettingItem;

}, /* bExport= */ true);
