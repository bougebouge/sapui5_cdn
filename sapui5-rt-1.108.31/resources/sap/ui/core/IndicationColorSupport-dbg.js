/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides helper class IndicationColoreSupport
sap.ui.define(['./library'],
	function(library) {
	"use strict";

	// shortcut for enum(s)
	var IndicationColor = library.IndicationColor;

		/**
		 * Helper functionality for indication color support.
		 *
		 * @author SAP SE
		 * @version 1.108.28
		 * @public
		 * @namespace sap.ui.core.IndicationColorSupport
		 * @since 1.66
		 */
		var IndicationColorSupport = {};
		var mTexts = null;


		var ensureTexts = function() {
			if (!mTexts) { // initialize texts if required
				mTexts = {};
				var rb = sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");
				mTexts[IndicationColor.Indication01] = rb.getText("INDICATION_STATE_INDICATION01");
				mTexts[IndicationColor.Indication02] = rb.getText("INDICATION_STATE_INDICATION02");
				mTexts[IndicationColor.Indication03] = rb.getText("INDICATION_STATE_INDICATION03");
				mTexts[IndicationColor.Indication04] = rb.getText("INDICATION_STATE_INDICATION04");
				mTexts[IndicationColor.Indication05] = rb.getText("INDICATION_STATE_INDICATION05");
				mTexts[IndicationColor.Indication06] = rb.getText("INDICATION_STATE_INDICATION06");
				mTexts[IndicationColor.Indication07] = rb.getText("INDICATION_STATE_INDICATION07");
				mTexts[IndicationColor.Indication08] = rb.getText("INDICATION_STATE_INDICATION08");
			}
		};


		/**
		 * Returns a generic indication color message if the given Element
		 * has a property <code>IndicationColor</code> with one of the states or the given <code>indicationColor</code> string
		 * represents one of five states.
		 *
		 * @param {sap.ui.core.Element|sap.ui.core.IndicationColor} vValue the Element of which the indicationColor needs to be checked, or the IndicationColor explicitly
		 * @returns {string|null} the indication color text, if appropriate; otherwise <code>null</code>
		 *
		 * @public
		 * @name sap.ui.core.IndicationColorSupport.getAdditionalText
		 * @function
		 */
		IndicationColorSupport.getAdditionalText = function(vValue) {
			var sIndicationColor = null;

			if (vValue && vValue.getValueState) {
				sIndicationColor = vValue.getIndicationColor();
			} else if (IndicationColor[vValue]) {
				sIndicationColor = vValue;
			}

			if (sIndicationColor) {
				ensureTexts();
				return mTexts[sIndicationColor];
			}

			return null;
		};


	return IndicationColorSupport;

}, /* bExport= */ true);