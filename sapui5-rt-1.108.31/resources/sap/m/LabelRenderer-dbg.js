/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the default renderer for control sap.m.Label
sap.ui.define(['sap/ui/core/Core', 'sap/ui/core/Renderer', 'sap/ui/core/AccessKeysEnablement', 'sap/m/library', 'sap/ui/core/library', 'sap/m/HyphenationSupport', "sap/ui/core/LabelEnablement"],
	function(Core, Renderer, AccessKeysEnablement, library, coreLibrary, HyphenationSupport, LabelEnablement) {
	"use strict";

	// shortcut for sap.ui.core.TextDirection
	var TextDirection = coreLibrary.TextDirection;

	// shortcut for sap.ui.core.VerticalAlign
	var VerticalAlign = coreLibrary.VerticalAlign;

	// shortcut for sap.m.LabelDesign
	var LabelDesign = library.LabelDesign;

	/**
	 * Label renderer.
	 *
	 * @author SAP SE
	 * @namespace
	 */
	var LabelRenderer = {
		apiVersion: 2
	};

	/**
	 * Renders the HTML for the given control, using the provided {@link sap.ui.core.RenderManager}.
	 *
	 * @param {sap.ui.core.RenderManager} rm The RenderManager that can be used for writing to the renderer output buffer
	 * @param {sap.m.Label} oLabel An object representation of the control that should be rendered
	 */
	LabelRenderer.render = function(rm, oLabel){
		// convenience variable
		var r = LabelRenderer,
			sTextDir = oLabel.getTextDirection(),
			sTextAlign = oLabel.getTextAlign(),
			sWidth = oLabel.getWidth(),
			sLabelText = oLabel.getText(),
			sTooltip = oLabel.getTooltip_AsString(),
			sLabelForRendering = oLabel.getLabelForRendering(),
			sHtmlTagToRender = sLabelForRendering ? "label" : "span",
			bDisplayOnly = oLabel.isDisplayOnly(),
			sVerticalAlign = oLabel.getVAlign();
		// write the HTML into the render manager
		// for accessibility reasons when a label doesn't have a "for" attribute, pointing at a HTML element it is rendered as span
		rm.openStart(sHtmlTagToRender, oLabel);

		// styles
		rm.class("sapMLabel");
		rm.class("sapUiSelectable");

		// label wrapping
		if (oLabel.isWrapping()) {
			rm.class("sapMLabelWrapped");
		}
		// set design to bold
		if (oLabel.getDesign() == LabelDesign.Bold) {
			rm.style("font-weight", "bold");
		}

		if (oLabel.isRequired()) {
			rm.class("sapMLabelRequired");
		}

		if (oLabel.getShowColon()) {
			rm.class("sapMLabelShowColon");
		}

		if (sLabelForRendering) {
			LabelEnablement.writeLabelForAttribute(rm, oLabel);
		} else if (oLabel.getParent() && oLabel.getParent().isA("sap.m.Toolbar")) {
			rm.class("sapMLabelTBHeader");
		}

		// text direction
		if (sTextDir !== TextDirection.Inherit){
			rm.attr("dir", sTextDir.toLowerCase());
		}

		// style for width
		if (sWidth) {
			rm.style("width", sWidth);
		} else {
			rm.class("sapMLabelMaxWidth");
		}

		// style for text alignment
		if (sTextAlign) {
			sTextAlign = r.getTextAlign(sTextAlign, sTextDir);
			if (sTextAlign) {
				rm.style("text-align", sTextAlign);
			}
		}

		if (sLabelText == "") {
			rm.class("sapMLabelNoText");
		}

		if (bDisplayOnly) {
			rm.class("sapMLabelDisplayOnly");
		}

		if (sVerticalAlign != VerticalAlign.Inherit) {
			rm.style("vertical-align", sVerticalAlign.toLowerCase());
		}

		HyphenationSupport.writeHyphenationClass(rm, oLabel);

		if (sTooltip) {
			rm.attr("title", sTooltip);
		}

		rm.openEnd();

		// wrap the label text
		rm.openStart("span", oLabel.getId() + "-text");
		rm.class("sapMLabelTextWrapper");

		if (oLabel.getProperty("highlightAccKeysRef")) {
			rm.class(AccessKeysEnablement.CSS_CLASS);
		}

		rm.openEnd();

		// write the label text
		rm.openStart("bdi", oLabel.getId() + "-bdi");

		// text direction
		if (sTextDir !== TextDirection.Inherit){
			rm.attr("dir", sTextDir.toLowerCase());
		}

		rm.openEnd();

		if (sLabelText) {
			sLabelText = HyphenationSupport.getTextForRender(oLabel, "main");
			rm.text(sLabelText);
		}
		rm.close("bdi");
		rm.close("span");

		// shows the colon and the required asterisk
		rm.openStart("span");
		rm.class("sapMLabelColonAndRequired");
		rm.attr("data-colon", Core.getLibraryResourceBundle("sap.m").getText("LABEL_COLON"));
		if (sLabelForRendering || oLabel._isInColumnHeaderContext) {
			rm.accessibilityState({
				hidden: "true"
			});
		}
		rm.openEnd();
		rm.close("span");

		rm.close(sHtmlTagToRender);
	};

	/**
	 * Dummy inheritance of static methods/functions.
	 * @see sap.ui.core.Renderer.getTextAlign
	 * @private
	 */
	LabelRenderer.getTextAlign = Renderer.getTextAlign;

	return LabelRenderer;

}, /* bExport= */ true);
