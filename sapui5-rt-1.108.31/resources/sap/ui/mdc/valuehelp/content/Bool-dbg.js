/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/mdc/valuehelp/content/FixedList",
	"sap/ui/mdc/util/loadModules",
	"sap/ui/model/ParseException"
], function(
	FixedList,
	loadModules,
	ParseException
) {
	"use strict";

	/**
	 * Constructor for a new <code>Bool</code> content.
	 *
	 * @param {string} [sId] ID for the new element, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new element
	 * @class Content for the {@link sap.ui.mdc.valuehelp.base.Container Container} element to provide a value help for boolean fields.
	 * @extends sap.ui.mdc.valuehelp.content.FixedList
	 * @version 1.108.28
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @since 1.95.0
	 * @experimental As of version 1.95
	 * @alias sap.ui.mdc.valuehelp.content.Bool
	 */
	var Bool = FixedList.extend("sap.ui.mdc.valuehelp.content.Bool", /** @lends sap.ui.mdc.valuehelp.content.Bool.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			interfaces: [
				"sap.ui.mdc.valuehelp.ITypeaheadContent"
			]
		}
	});

	Bool.prototype.init = function() {

		FixedList.prototype.init.apply(this, arguments);

		this.setUseFirstMatch(true); // as only 2 items
		this.setUseAsValueHelp(true); // should be used as value help
		this.setFilterList(false); // as only 2 items
		this.setCaseSensitive(false); // as only 2 items

		this._oObserver.observe(this, {
			properties: ["config"]
		});

	};

	Bool.prototype.exit = function() {

		if (this._oModel) {
			this._oModel.destroy();
			this._oModel = undefined;
		}

		FixedList.prototype.exit.apply(this, arguments);
	};

	Bool.prototype.getContent = function () {
		return this._retrievePromise("boolContent", function () {
			return loadModules([
				"sap/ui/mdc/field/ListFieldHelpItem",
				"sap/ui/model/json/JSONModel"
			]).then(function (aModules) {
				var ListFieldHelpItem = aModules[0];
				var JSONModel = aModules[1];
				this._oModel = new JSONModel({
					"type": "",
					"items": [
						{
							"key": true,
							"text": "true"
						},
						{
							"key": false,
							"text": "false"
						}
					]
				});
				_updateModel.call(this, this.getConfig());

				var oItem = new ListFieldHelpItem(this.getId() + "-Item", {
					key: {path: "$Bool>key"},
					text: {path: "$Bool>text"}
				});

				this.bindAggregation("items", {path: "$Bool>/items", template: oItem});
				this.setModel(this._oModel, "$Bool");

				return FixedList.prototype.getContent.apply(this, arguments);
				}.bind(this));
		}.bind(this));

	};

	Bool.prototype.getItemForValue = function (oConfig) {

		return Promise.resolve().then(function () {
			// don't need to create items for this, just use the type to check
			var oGlobalConfig = this.getConfig();
			var oType = oConfig.dataType || (oGlobalConfig && oGlobalConfig.dataType);

			if (oType) {
				if (oConfig.checkKey) {
					if (oConfig.parsedValue === true || oConfig.parsedValue === false) {
						return { key: oConfig.parsedValue, description: oType.formatValue(oConfig.parsedValue, "string") };
					} else {
						// as in bool case the description is comming from the type, search for description (first match) if parsing fails
						oConfig.checkDescription = true;
					}
				}
				if (oConfig.checkDescription && oConfig.value) {
					var sTrue = oType.formatValue(true, "string");
					if (sTrue.toLowerCase().startsWith(oConfig.value.toLowerCase())) {
						return { key: true, description: sTrue };
					}
					var sFalse = oType.formatValue(false, "string");
					if (sFalse.toLowerCase().startsWith(oConfig.value.toLowerCase())) {
						return { key: false, description: sFalse };
					}
				}
				var sError = this._oResourceBundle.getText("valuehelp.VALUE_NOT_EXIST", [oConfig.value]);
				var Exception = oConfig.exception || ParseException;
				throw new Exception(sError);
			} else {
				throw new Error("Type missing");
			}
		}.bind(this));

	};

	Bool.prototype.shouldOpenOnClick = function() {

		return false;

	};

	Bool.prototype._observeChanges = function(oChanges) {

		if (oChanges.type === "property" && oChanges.name === "config") {
			_updateModel.call(this, oChanges.current);
		}

		FixedList.prototype._observeChanges.apply(this, arguments);
	};

	function _updateModel(oConfig) {
		if (this._oModel && oConfig) {
			// use texts of used type
			var oType = oConfig.dataType;
			var oData = this._oModel.getData();
			if (oType && oData["type"] !== oType.getMetadata().getName()) {
				oData["type"] = oType.getMetadata().getName();
				var aItems = oData["items"];
				for (var i = 0; i < aItems.length; i++) {
					var oItem = aItems[i];
					oItem["text"] = oType.formatValue(oItem["key"], "string");
				}
				this._oModel.checkUpdate(true);
			}
		}
	}

	/**
	 * Adds some item to the aggregation <code>items</code>.
	 *
	 * <b>Note:</b> Do not add items to the <code>Bool</code> content. The items will be filled by itself
	 *
	 * @param {sap.ui.mdc.field.ListFieldHelpItem} oItem The item to add; if empty, nothing is inserted
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the items are automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#addItem
	 * @function
	 */

	/**
	 * Inserts a item to the aggregation <code>items</code>.
	 *
	 * <b>Note:</b> Do not add items to the <code>Bool</code> content. The items will be filled by itself
	 *
	 * @param {sap.ui.mdc.field.ListFieldHelpItem} oItem The item to add; if empty, nothing is inserted
	 * @param {int} iIndex The 0-based index the item should be inserted at; for a negative value of iIndex, the item is inserted at position 0; for a value greater than the current size of the aggregation, the item is inserted at the last position
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the items are automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#insertItem
	 * @function
	 */

	/**
	 * Destroys all the items in the aggregation <code>items</code>.
	 *
	 * <b>Note:</b> Do not change items to the <code>Bool</code> content. The items will be filled by itself
	 *
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the items are automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#destroyItems
	 * @function
	 */

	/**
	 * Removes all the controls from the aggregation <code>items</code>.
	 *
	 * <b>Note:</b> Do not change items to the <code>Bool</code> content. The items will be filled by itself
	 *
	 * @returns {sap.ui.mdc.field.ListFieldHelpItem[]} An array of the removed elements (might be empty)
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the items are automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#removeAllItems
	 * @function
	 */

	/**
	 * Removes a item from the aggregation <code>items</code>.
	 *
	 * <b>Note:</b> Do not change items to the <code>Bool</code> content. The items will be filled by itself
	 *
	 * @param {int|string|sap.ui.mdc.field.ListFieldHelpItem} vItem The item to remove or its index or ID
	 * @returns {sap.ui.mdc.field.ListFieldHelpItem|null} The removed item or <code>null</code>
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the items are automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#removeItem
	 * @function
	 */

	/**
	 * Sets a new value for property <code>useFirstMatch</code>.
	 *
	 * <b>Note:</b> Do not set this property for the <code>Bool</code> content. It will be set by itself
	 *
	 * @param {boolean} [bUseFirstMatch=true] New value for property <code>useFirstMatch</code>
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the property is automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#setUseFirstMatch
	 * @function
	 */

	/**
	 * Sets a new value for property <code>useAsValueHelp</code>.
	 *
	 * <b>Note:</b> Do not set this property for the <code>Bool</code> content. It will be set by itself
	 *
	 * @param {boolean} [bUseAsValueHelp=true] New value for property <code>useAsValueHelp</code>
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the property is automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#setUseAsValueHelp
	 * @function
	 */

	/**
	 * Sets a new value for property <code>filterList</code>.
	 *
	 * <b>Note:</b> Do not set this property for the <code>Bool</code> content. It will be set by itself
	 *
	 * @param {boolean} [bFilterList=false] New value for property <code>filterList</code>
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the property is automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#setFilterList
	 * @function
	 */

	/**
	 * Sets a new value for property <code>caseSensitive</code>.
	 *
	 * <b>Note:</b> Do not set this property for the <code>Bool</code> content. It will be set by itself
	 *
	 * @param {boolean} [bCaseSensitive=false] New value for property <code>caseSensitive</code>
	 * @returns {this} Reference to <code>this</code> to allow method chaining
	 * @private
	 * @ui5-restricted sap.fe
	 * @MDC_PUBLIC_CANDIDATE
	 * @deprecated Not supported, the property is automatically set.
	 * @ui5-not-supported
	 * @name sap.ui.mdc.valuehelp.content.Bool#setCaseSensitive
	 * @function
	 */

	 return Bool;
});
