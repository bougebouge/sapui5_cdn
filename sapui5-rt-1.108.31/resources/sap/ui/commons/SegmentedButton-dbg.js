/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.commons.SegmentedButton.
sap.ui.define([
    'sap/ui/thirdparty/jquery',
    'sap/ui/core/Control',
    'sap/ui/core/delegate/ItemNavigation',
    './SegmentedButtonRenderer'
],
	function(jQuery, Control, ItemNavigation, SegmentedButtonRenderer) {
	"use strict";



	/**
	 * Constructor for a new SegmentedButton.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The SegmentedButton provides a group of multiple buttons. Only one button can be active. The behaviour is more ore less like a radio button group.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.commons.ToolbarItem, sap.ui.core.IFormContent
	 * @version 1.108.28
	 *
	 * @constructor
	 * @public
	 * @deprecated as of version 1.38, replaced by {@link sap.m.SegmentedButton}
	 * @alias sap.ui.commons.SegmentedButton
	 */
	var SegmentedButton = Control.extend("sap.ui.commons.SegmentedButton", /** @lends sap.ui.commons.SegmentedButton.prototype */ { metadata : {

		interfaces : [
			"sap.ui.commons.ToolbarItem",
			"sap.ui.core.IFormContent"
		],
		library : "sap.ui.commons",
		deprecated: true,
		properties : {

			/**
			 * enabled
			 */
			enabled : {type : "boolean", group : "Misc", defaultValue : true}
		},
		aggregations : {

			/**
			 * Buttons
			 */
			buttons : {type : "sap.ui.commons.Button", multiple : true, singularName : "button"}
		},
		associations : {

			/**
			 * Selected Button
			 */
			selectedButton : {type : "sap.ui.commons.Button", multiple : false}
		},
		events : {

			/**
			 * Event fired when button selected
			 */
			select : {
				parameters : {

					/**
					 * Id of selected ToggleButton
					 */
					selectedButtonId : {type : "string"}
				}
			}
		}
	}});


	/**
	 * Initialization hook for the SegmentedButton.
	 *
	 * @private
	 */
	SegmentedButton.prototype.init = function() {
		if (!this._oItemNavigation) {
			this._oItemNavigation = new ItemNavigation();
			this._oItemNavigation.setCycling(true);
			this.addDelegate(this._oItemNavigation);
		}
		this._oButtonDelegate = {oSegmentedButton: this, onAfterRendering: this._buttonOnAfterRendering};
	};

	SegmentedButton.prototype.exit = function() {

		if (this._oItemNavigation) {
			this.removeDelegate(this._oItemNavigation);
			this._oItemNavigation.destroy();
			delete this._oItemNavigation;
		}

	};

	/**
	 * AfterRendering hook for the SegmentedButton. Create ItemNavigation here.
	 *
	 * @private
	 */
	SegmentedButton.prototype.onAfterRendering = function() {
		this._setItemNavigation(true);

	};
	/**
	 * @private
	 * @param {jQuery.Event} oEvent The fired event
	 */
	SegmentedButton.prototype._buttonSelected = function(oEvent) {
		var oOldButtonSelection = sap.ui.getCore().byId(this.getSelectedButton()),
			oNewButtonSelection = oEvent.getSource();

		if (oNewButtonSelection !== oOldButtonSelection) {
			this.setSelectedButton(oNewButtonSelection);
			this.fireSelect({selectedButtonId: oNewButtonSelection.getId()});
		}
	};
	/**
	 * @private
	 * @param {boolean} bAddDelegate Whether a delegate is attached
	 */
	SegmentedButton.prototype._setItemNavigation = function(bAddDelegate) {
		var oButton,
			aButtons,
			aItemDomRefs = [];
		if (!this.getEnabled()) {
			return;
		}
		if (this.getDomRef()) {
			this._oItemNavigation.setRootDomRef(this.getDomRef("radiogroup"));
			aButtons = this.getButtons();
			for ( var i = 0; i < aButtons.length; i++) {
				oButton = aButtons[i];
				aItemDomRefs.push(oButton.getDomRef());
				this._setAriaInfo(oButton, i + 1);
				if (bAddDelegate) {
					// remove delgate if it already exists
					oButton.removeDelegate(this._oButtonDelegate);
					oButton.addDelegate(this._oButtonDelegate);
				}
			}
			this._oItemNavigation.setItemDomRefs(aItemDomRefs);
		}
	};
	/**
	 * @private
	 */
	SegmentedButton.prototype._setAriaInfo = function(oButton, i) {
		var $button = jQuery(oButton.getDomRef()),
			length = this.getButtons().length;

		$button.attr("aria-posinset", i);
		$button.attr("aria-setsize", length);
		$button.attr("role", "radio");
		if (oButton.getId() === this.getSelectedButton()) {
			$button.attr("aria-checked", "true");
			$button.removeAttr("aria-describedby");
		} else {
			$button.removeAttr("aria-checked");
			$button.attr("aria-describedby", this.getId() + "-label");
		}
	};

	/**
	 * OnAfterRendering of Button
	 *
	 * @private
	*/
	SegmentedButton.prototype._buttonOnAfterRendering = function() {

		this.oSegmentedButton._setItemNavigation();

	};

	/**
	 * Rerendering of the Buttons
	 *
	 * @protected
	*/
	SegmentedButton.prototype._rerenderButtons = function() {
		var $content = this.$();
		if ($content.length > 0) {
			var rm = sap.ui.getCore().createRenderManager();
			SegmentedButtonRenderer.renderButtons(rm, this);
			rm.flush($content[0]);
			rm.destroy();
		}
	};

	/* Override API methods */
	SegmentedButton.prototype.addButton = function(oButton) {
		this.addAggregation("buttons",oButton, true);
		oButton.attachPress(this._buttonSelected, this);
		this._rerenderButtons();
		return this;
	};
	SegmentedButton.prototype.insertButton = function(oButton, iIndex) {
		this.insertAggregation("buttons", oButton, iIndex, true);
		oButton.attachPress(this._buttonSelected, this);
		this._rerenderButtons();
		return this;
	};
	SegmentedButton.prototype.removeButton = function(oButton) {
		var result = this.removeAggregation("buttons", oButton, true);
		if (result) {
			result.detachPress(this._buttonSelected, this);
			result.removeDelegate(this._oButtonDelegate);
			this._rerenderButtons();
		}
		return result;
	};
	SegmentedButton.prototype.removeAllButtons = function() {
		var result = this.removeAllAggregation("buttons", true);
		jQuery.each(result, function(i, oButton) {
			oButton.detachPress(this._buttonSelected, this);
			oButton.removeDelegate(this._oButtonDelegate);
		});
		this._rerenderButtons();
		return result;
	};
	SegmentedButton.prototype.setSelectedButton = function(vButton) {
		var oButton, oButtonOld = sap.ui.getCore().byId(this.getSelectedButton());
		this.setAssociation("selectedButton", vButton, true);
		oButton = sap.ui.getCore().byId(this.getSelectedButton());

		// Make sure Aria info is correct after changing button state
		this._setItemNavigation();

		var aButtons = this.getButtons();
		for (var i = 0; i < aButtons.length; i++) {
			if (aButtons[i] === oButton) {
				this._oItemNavigation.setFocusedIndex(i);
				break;
			}
		}
		if (oButtonOld) {
			oButtonOld.removeStyleClass("sapUiSegButtonSelected");
			oButtonOld.$().trigger("blur");
		}
		if (oButtonOld && oButtonOld._icon) {
			oButtonOld.setIcon(oButtonOld._icon);
			oButtonOld._icon = null;
		}
		if (oButton) {
			if (oButton.getIconHovered()) {
				oButton._icon = oButton.getIcon();
				oButton.setIcon(oButton.getIconHovered());
			}
			oButton.addStyleClass("sapUiSegButtonSelected");
		}

		return this;
	};

	SegmentedButton.prototype.setEnabled = function(bEnabled) {
		jQuery.each(this.getButtons(), function(i, oButton) {
			oButton.setEnabled(bEnabled);
		});
		// remove itemNavigation if buttons are disabled
		if (this._oItemNavigation && !bEnabled) {
			this.removeDelegate(this._oItemNavigation);
		} else {
			this.addDelegate(this._oItemNavigation);
		}
		this.setProperty("enabled", bEnabled);
		return this;
	};

	/*
	 * before cloning buttons deregister events and register it after cloning again.
	 */
	SegmentedButton.prototype.clone = function(sIdSuffix) {

		var aButtons = this.getButtons(),
			oButton,
			i = 0;
		for (; i < aButtons.length; i++) {
			oButton = aButtons[i];
			oButton.detachPress(this._buttonSelected, this);
		}

		var oClone = Control.prototype.clone.apply(this, arguments);

		for (i = 0; i < aButtons.length; i++) {
			oButton = aButtons[i];
			oButton.attachPress(this._buttonSelected, this);
		}

		return oClone;
	};

	SegmentedButton.prototype.getFocusDomRef = function() {

		return this.getDomRef("radiogroup") || null;

	};

	return SegmentedButton;

});
