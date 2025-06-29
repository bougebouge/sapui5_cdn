/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides default renderer for control sap.ui.commons.Button
sap.ui.define([
	'sap/ui/commons/library',
	'sap/ui/core/IconPool',
	'sap/base/security/encodeXML'
], function(library, IconPool, encodeXML) {
	"use strict";


	// shortcut for sap.ui.commons.ButtonStyle
	var ButtonStyle = library.ButtonStyle;


	/**
	 * @author SAP SE
	 * @version 1.108.28
	 * @namespace
	 */
	var ButtonRenderer = {
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer.
	 * @param {sap.ui.core.Control} oButton An object representation of the control that should be rendered.
	 */
	ButtonRenderer.render = function(rm, oButton) {
		rm.addClass("sapUiBtn");

		// button is rendered as a "<button>" element
		rm.write("<button type=\"button\""); // otherwise this turns into a submit button in IE8
		rm.writeControlData(oButton);
		if (oButton.getTooltip_AsString()) {
			rm.writeAttributeEscaped("title", oButton.getTooltip_AsString());
		}
		//styling
		if (oButton.getStyled()) {
			rm.addClass("sapUiBtnS");
		}

		if (oButton.getLite()) {
			rm.addClass("sapUiBtnLite");
		} else {
			rm.addClass("sapUiBtnNorm");
		}

		var sStyle = oButton.getStyle();

		if (sStyle != "" && sStyle != ButtonStyle.Default) {
			rm.addClass("sapUiBtn" + encodeXML(sStyle));
		}

		//ARIA
		rm.writeAccessibilityState(oButton, {
			role: 'button',
			disabled: !oButton.getEnabled()
		});

		if (!oButton.getEnabled()) {
			rm.write(" tabindex=\"-1\"");
			rm.addClass("sapUiBtnDsbl");
		} else {
			rm.write(" tabindex=\"0\"");
			rm.addClass("sapUiBtnStd");
		}

		var bImageOnly = false;
		if (!oButton.getText() && oButton.getIcon()) { // icon, but no text => reduce padding
			rm.addClass("sapUiBtnIconOnly");
			bImageOnly = true; // only the image is there, so it must have some meaning

			// add tooltip if available, if not - add the technical name of the icon
			var oIconInfo = IconPool.getIconInfo(oButton.getIcon()),
				sTooltip = oButton.getTooltip_AsString();

			if (sTooltip || (oIconInfo && oIconInfo.name)) {
				rm.writeAttributeEscaped("title", sTooltip || oIconInfo.name);
			}
		}

		if (oButton.getIcon() && oButton.getText()) {
			rm.addClass("sapUiBtnIconAndText");
		}

		if (oButton.getWidth() && oButton.getWidth() != '') {
			rm.addStyle("width", oButton.getWidth());
			rm.addClass("sapUiBtnFixedWidth");
		}
		if (oButton.getHeight() && oButton.getHeight() != '') {
			rm.addStyle("height", oButton.getHeight());
		}
		rm.writeStyles();

		if (this.renderButtonAttributes) {
			this.renderButtonAttributes(rm, oButton);
		}

		rm.writeClasses();

		rm.write(">");

		if (this.renderButtonContentBefore) {
			this.renderButtonContentBefore(rm, oButton);
		}

		var bUseIconFont = false;
		if (IconPool.isIconURI(oButton.getIcon())) {
			bUseIconFont = true;
		}

		if (oButton.getIconFirst()) {
			if (bUseIconFont) {
				this.writeIconHtml(rm, oButton);
			} else if (this._getIconForState(oButton, "base")) {
				this.writeImgHtml(rm, oButton, bImageOnly);
			}
		}

		// write the button label
		if (oButton.getText()) {
			if (!oButton.getIcon() && !this.renderButtonContentBefore && !this.renderButtonContentAfter) {
				rm.writeEscaped(oButton.getText());
			} else { // if there is an icon, an additional span is required
				rm.write("<span class=\"sapUiBtnTxt\">");
				rm.writeEscaped(oButton.getText());
				rm.write("</span>");
			}
		}

		if (!oButton.getIconFirst()) {
			if (bUseIconFont) {
				this.writeIconHtml(rm, oButton);
			} else if (this._getIconForState(oButton, "base")) {
				this.writeImgHtml(rm, oButton, bImageOnly);
			}
		}

		if (this.renderButtonContentAfter) {
			this.renderButtonContentAfter(rm, oButton);
		}

		// close button
		rm.write("</button>");
	};

	/**
	 * Function called by button control on mouse down event.
	 * @param {sap.ui.commons.Button} oButton The button to be rendered
	 */
	ButtonRenderer.onactive = function(oButton) {
		oButton.$().addClass("sapUiBtnAct").removeClass("sapUiBtnStd");
		oButton.$("img").attr("src", this._getIconForState(oButton, "active"));
	};

	/**
	 * Function called by button control on mouse up event.
	 * @param {sap.ui.commons.Button} oButton The button to be rendered
	 */
	ButtonRenderer.ondeactive = function(oButton) {
		oButton.$().addClass("sapUiBtnStd").removeClass("sapUiBtnAct");
		oButton.$("img").attr("src", this._getIconForState(oButton, "deactive"));
	};

	/**
	 * Function called by button control on blur.
	 * @param {sap.ui.commons.Button} oButton The button to be rendered
	 */
	ButtonRenderer.onblur = function(oButton) {
		oButton.$().removeClass("sapUiBtnFoc");
		oButton.$("img").attr("src", this._getIconForState(oButton, "blur"));
	};

	/**
	 * Function called by button control on focus.
	 * @param {sap.ui.commons.Button} oButton The button to be rendered
	 */
	ButtonRenderer.onfocus = function(oButton) {
		oButton.$().addClass("sapUiBtnFoc");
		oButton.$("img").attr("src", this._getIconForState(oButton, "focus"));
	};

	/**
	 * Function called when mouse leaves button.
	 * @param {sap.ui.commons.Button} oButton The button to be rendered
	 */
	ButtonRenderer.onmouseout = function(oButton) {
		oButton.$().removeClass("sapUiBtnAct");
		oButton.$().addClass("sapUiBtnStd");
		oButton.$("img").attr("src", this._getIconForState(oButton, "mouseout"));
	};

	/**
	 * Function called when mouse enters button.
	 * @param {sap.ui.commons.Button} oButton The button to be rendered
	 * @private
	 */
	ButtonRenderer.onmouseover = function(oButton) {
		oButton.$("img").attr("src", this._getIconForState(oButton, "mouseover"));
	};

	/**
	 * Returns the icon URI for the given button state.
	 * @param {sap.ui.commons.Button} oButton The button to be rendered
	 * @param {string} sState The state of the button
	 * @returns {Object} The icon of the button according to the state of the button
	 * @private
	 */
	ButtonRenderer._getIconForState = function(oButton, sState) {
		if (!oButton.getEnabled()) {
			sState = "disabled";
		}
		switch (sState) {
			case "focus":
			case "blur":
			case "base":
				if (oButton.$().hasClass("sapUiBtnAct")) {
					var sIcon = oButton.getIconSelected() || oButton.getIconHovered();
					return sIcon ? sIcon : oButton.getIcon();
				} else if (oButton.$().hasClass("sapUiBtnFoc")) {
					return oButton.getIcon();
				}
				return oButton.getIcon();
			case "mouseout":
				if (oButton.$().hasClass("sapUiBtnFoc")) {
					return oButton.getIcon();
				}
				return oButton.getIcon();
			case "active":
				var sIcon = oButton.getIconSelected() || oButton.getIconHovered();
				return sIcon ? sIcon : oButton.getIcon();
			case "mouseover":
			case "deactive":
				var sIcon = oButton.getIconHovered();
				return sIcon ? sIcon : oButton.getIcon();
		}
		return oButton.getIcon();
	};

	/**
	 * HTML for icon as image.
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.commons.Button} oButton The button to be rendered
	 * @param {boolean} bImageOnly Whether the button has only image or it has text too
	 */
	ButtonRenderer.writeImgHtml = function(rm, oButton, bImageOnly) {
		var iconUrl = this._getIconForState(oButton, "base");

		rm.write("<img");
		rm.writeAttribute("id", oButton.getId() + "-img");
		rm.writeAttributeEscaped("src", iconUrl);
		if (oButton.getTooltip_AsString() && !oButton.getText()) {
			rm.writeAttributeEscaped("alt", oButton.getTooltip_AsString());
		} else {
			rm.writeAttribute("alt", ""); // there must be an ALT attribute
		}

		if (!bImageOnly) {
			rm.writeAttribute("role", "presentation");
		}

		rm.addClass("sapUiBtnIco");
		if (oButton.getText()) { // only add a distance to the text if there is text
			rm.addClass(oButton.getIconFirst() ? "sapUiBtnIcoL" : "sapUiBtnIcoR");
		}
		rm.writeClasses();

		rm.write(">");
	};

	/**
	 * HTML for icon as icon font.
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the render output buffer
	 * @param {sap.ui.commons.Button} oButton The button to be rendered
	 */
	ButtonRenderer.writeIconHtml = function(rm, oButton) {

		var aClasses = [];
		var mAttributes = buildIconAttributes(oButton);
		aClasses.push("sapUiBtnIco");
		if (oButton.getText()) { // only add a distance to the text if there is text
			aClasses.push(oButton.getIconFirst() ? "sapUiBtnIcoL" : "sapUiBtnIcoR");
		}

		rm.writeIcon(oButton.getIcon(), aClasses, mAttributes);
	};

	ButtonRenderer.changeIcon = function(oButton) {

		if (IconPool.isIconURI(oButton.getIcon())) {
			var oIconInfo = IconPool.getIconInfo(oButton.getIcon());
			var oIcon = oButton.$("icon");
			oIcon.attr("data-sap-ui-icon-content", oIconInfo.content);
			if (!oIconInfo.skipMirroring) {
				oIcon.addClass("sapUiIconMirrorInRTL");
			} else {
				oIcon.removeClass("sapUiIconMirrorInRTL");
			}
		} else if (oButton.$().hasClass("sapUiBtnAct")) {
			oButton.$("img").attr("src", this._getIconForState(oButton, "active"));
		} else if (oButton.$().hasClass("sapUiBtnFoc")) {
			oButton.$("img").attr("src", this._getIconForState(oButton, "focus"));
		} else if (oButton.$().hasClass("sapUiBtnStd")) {
			oButton.$("img").attr("src", this._getIconForState(oButton, "base"));
		}

	};

	/**
	*
	* @private
	* @param {sap.ui.commons.Button} oButton The button to be rendered
	* @returns {Object} Icon attributes
	*/
	function buildIconAttributes(oButton) {
		var oAttributes = {},
			sTooltip = oButton.getTooltip_AsString();

		oAttributes["id"] = oButton.getId() + "-icon";
		if (sTooltip) { // prevents default icon tooltip

			oAttributes["title"] = null;
			oAttributes["aria-label"] = null;
			oAttributes["aria-hidden"] = true;
		}
		return oAttributes;
	}
	return ButtonRenderer;

}, /* bExport= */ true);
