/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.commons.Tab.
sap.ui.define(['./Panel', './library', 'sap/ui/core/library'],
	function(Panel, library, coreLibrary) {
	"use strict";



	// shortcut for sap.ui.core.Scrolling
	var Scrolling = coreLibrary.Scrolling;



	/**
	 * Constructor for a new Tab.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * Represents a single tab in a TabStrip control.
	 * @extends sap.ui.commons.Panel
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.m.TabContainer</code> control.
	 * @alias sap.ui.commons.Tab
	 */
	var Tab = Panel.extend("sap.ui.commons.Tab", /** @lends sap.ui.commons.Tab.prototype */ {
		metadata : {

			library : "sap.ui.commons",
			deprecated: true,
			properties : {

				/**
				 * Specifies the vertical scrolling.
				 */
				verticalScrolling : {type : "sap.ui.core.Scrolling", group : "Behavior", defaultValue : Scrolling.None},

				/**
				 * Specifies the horizontal scrolling.
				 */
				horizontalScrolling : {type : "sap.ui.core.Scrolling", group : "Behavior", defaultValue : Scrolling.None},

				/**
				 * Specifies whether the tab contains a close button.
				 */
				closable : {type : "boolean", group : "Misc", defaultValue : false},

				/**
				 * Defines whether the tab is the active one.
				 * @deprecated As of 0.17.0.
				 * This property is not used. To identify the selected tab in a TabStrip selectedIndex is used.
				 */
				selected : {type : "boolean", group : "Behavior", defaultValue : false, deprecated: true}
			}
		},
		renderer: null // this control has no own renderer, it is rendered by the TabStripRenderer
	});

	/*
	 * Initializes the Tab.
	 * @private
	 */
	Tab.prototype.init = function() {
		// Setting this to role Tabpanel instead of its container basically worked.
		// However, the role is set one level higher to get better output in screen reader.

		this.oScrollDomRef = null;      // Points to the content area
	};

	Tab.prototype.rerender = function() {

		// as Tab has no own renderer call renderer of TabStrip
		var oParent = this.getParent();
		if (oParent) {
			oParent.rerender();
		}

	};

	Tab.prototype.invalidate = function() {

		// as Tab has no own renderer call invalidate of TabStrip
		var oParent = this.getParent();
		if (oParent) {
			oParent.invalidate();
		}
	};

	/*
	 * Called after rendering from the TabStrip control.
	 */
	Tab.prototype.onAfterRendering = function () {
		this.oScrollDomRef = this.getDomRef("panel");

		// Restore scroll positions
		if (this.oScrollDomRef) {
			var scrollTop = this.getProperty("scrollTop") || 0;
			this.oScrollDomRef.scrollTop = scrollTop;

			var scrollLeft = this.getProperty("scrollLeft") || 0;
			this.oScrollDomRef.scrollLeft = scrollLeft;
		}

		// TODO: this must also be done for tabs where the contents are not rendered initially
	};

	/*
	 * Returns the scroll position of the Tab in pixel from the left, returns "0" if not
	 * rendered yet, and updates the control property internally.
	 *
	 * @return The scroll position
	 * @public
	 */
	Tab.prototype.getScrollLeft = function () {
		var scrollLeft = 0;
		if (this.oScrollDomRef) {
			scrollLeft = this.oScrollDomRef.scrollLeft;
			this.setProperty("scrollLeft", scrollLeft, true);
		}

		return scrollLeft;
	};

	/*
	 * Sets the scroll position of the Tab in pixel from the left.
	 * @param {int} iPosition The position to scroll to
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Tab.prototype.setScrollLeft = function (iPosition) {
		this.setProperty("scrollLeft", iPosition, true);
		if (this.oScrollDomRef) {                        // TODO: what if called before rendering?
			this.bIgnoreScrollEvent = true;
			this.oScrollDomRef.scrollLeft = iPosition;
		}
		return this;
	};

	/*
	 * Returns the scroll position of the Tab in pixel from the top,
	 * returns "0" if not rendered yet, and updates the control property internally.
	 *
	 * @return The scroll position
	 * @public
	 */
	Tab.prototype.getScrollTop = function () {
		var scrollTop = 0;
		if (this.oScrollDomRef) {
			scrollTop = this.oScrollDomRef.scrollTop;
			this.setProperty("scrollTop", scrollTop, true);
		}

		return scrollTop;
	};

	/*
	 * Sets the scroll position of the Tab in pixel from the top.
	 * @param {int} iPosition The position to scroll to
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Tab.prototype.setScrollTop = function (iPosition) {
		this.setProperty("scrollTop", iPosition, true);
		if (this.oScrollDomRef) {                       // TODO: what if called before rendering?
			this.bIgnoreScrollEvent = true;
			this.oScrollDomRef.scrollTop = iPosition;
		}
		return this;
	};

	/*
	 * Sets whether the Tab is enabled.
	 * Normally, only classes are exchanged and no re-rendering is needed.
	 * If the selected Tab should be disabled, re-rendering is needed as selected tabs can not be disabled.
	 * If no Tab is selected (because all tabs have been disabled before) also re-rendering is needed.
	 *
	 * @param {boolean} bEnabled Whether the Tab should be enabled or not
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Tab.prototype.setEnabled = function(bEnabled) {

		if (bEnabled == this.getEnabled()) {
			return this;
		}

		var oDomRef = this.getDomRef();
		var oParent = this.getParent();

		if (!oDomRef || (!bEnabled && this.$().hasClass("sapUiTabSel")) ||
			(bEnabled && oParent && oParent.getSelectedIndex && oParent.getSelectedIndex() < 0)) {
			this.setProperty("enabled", bEnabled, false); // rendering needed

			if (oParent && oParent._getActualSelectedIndex) {
				var iIndex = oParent._getActualSelectedIndex();
				oParent.setProperty('selectedIndex', iIndex, true);
			}
		} else {
			this.setProperty("enabled", bEnabled, true); // no re-rendering!
			// if already rendered, adapt rendered control without complete re-rendering
			this.$().toggleClass("sapUiTab", bEnabled).toggleClass("sapUiTabDsbl", !bEnabled).attr("aria-disabled",!bEnabled);
		}
		return this;

	};

	/*
	 * Sets the Tab width.
	 *
	 * @param {string} sWidth The width of the panel as CSS size
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Tab.prototype.setWidth = function (sWidth) {
		this.setProperty("width", sWidth, true); // don't rerender
		// do nothing
		return this;
	};

	/*
	 * Sets content padding.
	 *
	 * @param {boolean} bPadding Whether the Panel should have padding
	 * @returns {this} <code>this</code> to allow method chaining
	 * @public
	 */
	Tab.prototype.setApplyContentPadding = function(bPadding) {
		this.setProperty("applyContentPadding", bPadding, true); // no re-rendering!
		// do nothing
		return this;
	};

	Tab.prototype._handleTrigger = function(oEvent) {
		//see sap.ui.commons.Panel.prototype._handleTrigger -> Nothing to do here
	};

	return Tab;

});
