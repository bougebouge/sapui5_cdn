/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/fl/Utils",
	"sap/base/Log",
	"sap/ui/fl/changeHandler/AddIFrame",
	"sap/ui/fl/changeHandler/common/getTargetAggregationIndex",
	"sap/ui/fl/changeHandler/common/createIFrame"
], function (
	Utils,
	Log,
	BaseAddIFrame,
	getTargetAggregationIndex,
	createIFrame
) {
	"use strict";

	/**
	 * AddIFrameObjectPageLayout change handler for AddIFrame (in particular to handle sections)
	 *
	 * @constructor
	 * @alias sap.uxap.changeHandler.AddIFrameObjectPageLayout
	 * @author SAP SE
	 * @version 1.108.28
	 * @since 1.75
	 * @experimental Since 1.75
	 */
	 var AddIFrameObjectPageLayout = Object.assign({}, BaseAddIFrame);

	 /**
	 * Adds the IFrame control to the target control within the target aggregation.
	 *
	 * @param {sap.ui.fl.Change} oChange - Change object with instructions to be applied on the control map
	 * @param {sap.ui.core.Control} oControl - Control that matches the change selector for applying the change
	 * @param {object} mPropertyBag - Map of properties
	 * @param {object} mPropertyBag.modifier - Modifier for the controls
	 * @returns {Promise} Promise resolving when the change is successfully applied
	 * @ui5-restricted sap.uxap
	 */
	AddIFrameObjectPageLayout.applyChange = function(oChange, oControl, mPropertyBag) {
		var oModifier = mPropertyBag.modifier;
		var oContent = oChange.getContent();
		var sAggregationName = oContent.targetAggregation;
		if (sAggregationName !== "sections") {
			return Promise.resolve()
				.then(BaseAddIFrame.applyChange.bind(BaseAddIFrame, oChange, oControl, mPropertyBag));
		}
		// Create a section, sub section and insert the IFrame
		var oView = mPropertyBag.view;
		var oComponent = mPropertyBag.appComponent;
		var oBaseSelector = oContent.selector;
		var sDefaultTitle = sap.ui.getCore().getLibraryResourceBundle("sap.uxap").getText("SECTION_TITLE_FOR_IFRAME");

		var oOPSection;
		var oOPSubSection;
		return Promise.resolve()
			.then(oModifier.createControl.bind(oModifier, "sap.uxap.ObjectPageSection", oComponent, oView, oBaseSelector, {
					title: sDefaultTitle
				}, false)
			)
			.then(function(oOPSectionLocal) {
				oOPSection = oOPSectionLocal;
				var oOPSubSectionSelector = Object.create(oBaseSelector);
				oOPSubSectionSelector.id += "-subSection";
				return oModifier.createControl("sap.uxap.ObjectPageSubSection", oComponent, oView, oOPSubSectionSelector, {
					title: sDefaultTitle
				}, false);
			})
			.then(function(oOPSubSectionLocal) {
				oOPSubSection = oOPSubSectionLocal;
				return oModifier.insertAggregation(oOPSection, "subSections", oOPSubSection, 0, oView);
			})
			.then(function () {
				var oIFrameSelector = Object.create(oBaseSelector);
				oIFrameSelector.id += "-iframe";
				return createIFrame(oChange, mPropertyBag, oIFrameSelector);
			})
			.then(function(oIFrame) {
				return oModifier.insertAggregation(oOPSubSection, "blocks", oIFrame, 0, oView);
			})
			.then(getTargetAggregationIndex.bind(null, oChange, oControl, mPropertyBag))
			.then(function(iIndex) {
				return oModifier.insertAggregation(oControl, "sections", oOPSection, iIndex, oView);
			})
			.then(function () {
				oChange.setRevertData([oModifier.getId(oOPSection)]);
			});
	};

	AddIFrameObjectPageLayout.getCondenserInfo = function(oChange) {
		var oCondenserInfo = Object.assign({}, BaseAddIFrame.getCondenserInfo(oChange));
		var oChangeContent = oChange.getContent();
		var sAggregationName = oChangeContent.targetAggregation;
		// The update of iFrames is done on the iFrame itself - which has a different selector
		// that needs to be passed to the condenser so it can collect all changes under the same group
		if (sAggregationName === "sections") {
			oCondenserInfo.updateControl = Object.assign({}, oCondenserInfo.affectedControl);
			oCondenserInfo.updateControl.id = oCondenserInfo.affectedControl.id + '-iframe';
		}
		return oCondenserInfo;
	};

	return AddIFrameObjectPageLayout;
}, /* bExport= */true);
