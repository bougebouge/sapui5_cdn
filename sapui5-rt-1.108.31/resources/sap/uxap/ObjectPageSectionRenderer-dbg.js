/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(["sap/ui/core/Configuration"], function (Configuration) {
	"use strict";

	/**
	 * Section renderer.
	 * @namespace
	 */
	var ObjectPageSectionRenderer = {
		apiVersion: 2
	};

	ObjectPageSectionRenderer.render = function (oRm, oControl) {
		var sTitle, bTitleVisible,
			bAccessibilityOn = Configuration.getAccessibility(),
			oLabelledBy = oControl.getAggregation("ariaLabelledBy"),
			oHeading = oControl.getHeading(),
			bWrapTitle = oControl.getWrapTitle();

		if (!oControl.getVisible() || !oControl._getInternalVisible()) {
			return;
		}

		sTitle = oControl._getTitle();
		bTitleVisible = oControl._isTitleVisible();

		oRm.openStart("section", oControl)
			.class("sapUxAPObjectPageSection");

		if (!bTitleVisible) {
			oRm.class("sapUxAPObjectPageSectionNoTitle");
		}

		if (bWrapTitle) {
			oRm.class("sapUxAPObjectPageSectionWrapTitle");
		}

		oRm.attr("role", "region");

		if (bAccessibilityOn && oLabelledBy) {
			oRm.attr("aria-labelledby", oLabelledBy.getId());
		}

		oRm.attr("data-sap-ui-customfastnavgroup", true);

		oRm.openEnd();

		if (oHeading) {
			oRm.openStart("div")
				.class("sapUxAPObjectPageSectionHeading")
				.openEnd();
				oRm.renderControl(oHeading);
			oRm.close("div");
		}

		oRm.openStart("div", oControl.getId() + "-header")
			.attr("role", "heading")
			.attr("aria-level", oControl._getARIALevel())
			.attr("aria-hidden", !bTitleVisible)
			.class("sapUxAPObjectPageSectionHeader")
			.class(bTitleVisible ? "" : "sapUxAPObjectPageSectionHeaderHidden")
			.openEnd();

		oRm.openStart("div", oControl.getId() + "-title")
			.class("sapUxAPObjectPageSectionTitle");

		if (oControl.getTitleUppercase()) {
			oRm.class("sapUxAPObjectPageSectionTitleUppercase");
		}

		oRm.openEnd();
		oRm.text(sTitle);
		oRm.close("div");

		if (bTitleVisible) {
			oRm.renderControl(oControl._getShowHideAllButton());
			oRm.renderControl(oControl._getShowHideButton());
		}
		oRm.close("div");


		oRm.openStart("div")
			.class("sapUxAPObjectPageSectionContainer");

		if (oControl._isHidden){
			oRm.style("display", "none");
		}

		oRm.openEnd();

		oRm.renderControl(oControl._getGrid());

		oRm.close("div");

		oRm.close("section");
	};

	return ObjectPageSectionRenderer;

}, /* bExport= */ true);
