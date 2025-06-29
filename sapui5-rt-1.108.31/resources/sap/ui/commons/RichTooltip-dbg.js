/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.commons.RichTooltip.
sap.ui.define([
    'sap/ui/thirdparty/jquery',
    './library',
    'sap/ui/core/TooltipBase',
    './RichTooltipRenderer',
    './FormattedTextView',
    'sap/ui/dom/jquery/control' // jQuery.fn.control
],
	function(jQuery, library, TooltipBase, RichTooltipRenderer, FormattedTextView) {
	"use strict";



	/**
	 * Constructor for a new RichTooltip.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * Is used to provide tool tips that can have long text, image and title. This tool tip extends the TooltipBase.
	 * @extends sap.ui.core.TooltipBase
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Tf you want to achieve a similar behavior, use a <code>sap.m.Popover</code> control and open it next to your control.
	 * @alias sap.ui.commons.RichTooltip
	 */
	var RichTooltip = TooltipBase.extend("sap.ui.commons.RichTooltip", /** @lends sap.ui.commons.RichTooltip.prototype */ { metadata : {

		library : "sap.ui.commons",
		deprecated: true,
		properties : {

			/**
			 * Tool tip title to be displayed in the header.
			 */
			title : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * If RichTooltip contains an image, this property is used to define the source path.
			 */
			imageSrc : {type : "sap.ui.core.URI", group : "Misc", defaultValue : null},

			/**
			 * This property is an individual text that will be used instead of the default ValueState text
			 * @since 1.11.1
			 */
			valueStateText : {type : "string", group : "Misc", defaultValue : null},

			/**
			 * This is the alt text for the image
			 * @since 1.11.1
			 */
			imageAltText : {type : "string", group : "Misc", defaultValue : null}
		},
		aggregations : {

			/**
			 * FormattedTextView control used in the content area to enable HTML-text within the content
			 */
			formattedText : {type : "sap.ui.commons.FormattedTextView", multiple : false, visibility : "hidden"},

			/**
			 * Value State Text that can be specified individually.
			 */
			individualStateText : {type : "sap.ui.commons.FormattedTextView", multiple : false, visibility : "hidden"}
		}
	}});

	/**
	 * Calculates the height of the RichTooltip to set a proper min-height.
	 * Additionally the ARIA attributes are set to the corresponding elements.
	 *
	 * @protected
	 */
	RichTooltip.prototype.onAfterRendering = function() {
		var oText = this.getAggregation("formattedText");
		if (oText && oText.getDomRef()) {
			// set a corresponding ARIA role if there is a text
			oText.$().attr("role", "tooltip");

			if (this.getImageSrc() !== "") {
				// if text and image are set a bigger min-width is needed
				this.$().addClass("sapUiRttContentWide");
			}
		}
	};

	/**
	 * This sets an individual text for the ValueState of the parent element of the RichTooltip.
	 *
	 * @param {string} sText the text that should be shown as individual ValueState text
	 * @returns {this} Returns <code>this</code> to facilitate method chaining.
	 * @public
	 */
	RichTooltip.prototype.setValueStateText = function(sText) {
		var oValueStateText = this.getAggregation("individualStateText");
		if (sText) {
			if (oValueStateText) {
				oValueStateText.setHtmlText(sText);
			} else {
				oValueStateText = new FormattedTextView(this.getId() + "-valueStateText", {
					htmlText : sText
				}).addStyleClass("sapUiRttValueStateText").addStyleClass("individual");

				this.setAggregation("individualStateText", oValueStateText);
				this.setProperty("valueStateText", sText, true);
			}
		} else {
			if (oValueStateText) {
				this.setAggregation("individualStateText", oValueStateText);
			}
		}
		return this;
	};

	/**
	 * This returns the previously set text. Since a FormattedTextView is used for
	 * rendering and stuff the corresponding property of the FormattedTextView is
	 * being read and returned. If no text was set an empty string is being
	 * returned.
	 *
	 * @returns {string} the ValueState text that was previously set.
	 * @public
	 */
	RichTooltip.prototype.getValueStateText = function() {
		var oValueStateText = this.getAggregation("individualStateText");
		if (oValueStateText) {
			return oValueStateText.getHtmlText();
		}
		return "";
	};

	/**
	 * This overrides the function of TooltipBase to create a FormattedTextView that
	 * should be used for rendering
	 *
	 * @override
	 * @param {string} sText the text that should be shown
	 */
	RichTooltip.prototype.setText = function(sText) {
		if (sText) {
			//replace carriage returns etc. with br tag
			sText = sText.replace(/(\r\n|\n|\r)/g,"<br>");
		}

		var oText = this.getAggregation("formattedText");
		if (oText) {
			oText.setHtmlText(sText);
		} else {
			oText = new FormattedTextView(this.getId() + "-txt");
			oText.setHtmlText(sText);
			oText.addStyleClass("sapUiRttText");
			this.setAggregation("formattedText", oText);
			this.setProperty("text", sText, true);
		}
		return this;
	};

	/**
	 * This returns the previously set text. Since a FormattedTextView is used for
	 * rendering and stuff the corresponding property of the FormattedTextView is
	 * being read and returned. If no text was set an empty string is being
	 * returned.
	 *
	 * @returns {string} the text that was previously set.
	 * @override
	 */
	RichTooltip.prototype.getText = function() {
		var oText = this.getAggregation("formattedText");
		if (oText) {
			return oText.getHtmlText();
		}
		return "";
	};

	RichTooltip.prototype.onfocusin = function(oEvent) {
		TooltipBase.prototype.onfocusin.apply(this, arguments);

		var oSC = jQuery(oEvent.target).control(0);
		if (oSC != null) {
			var sId = this.getId();
			var sIds = "";

			if (this.getTitle() !== "") {
				sIds += sId + "-title ";
			}

			var $valueStateText = this.$("valueStateText");
			if ($valueStateText.length > 0) {
				sIds += sId + "-valueStateText ";
			}

			// alt image
			if (this.getImageSrc() !== "") {
				sIds += sId + "-image ";
			}

			//
			if (this.getText() !== "") {
				sIds += sId + "-txt";
			}

			var oDomRef = oSC.getFocusDomRef();
			oDomRef.setAttribute("aria-describedby", sIds);
		}
	};


	return RichTooltip;

});
