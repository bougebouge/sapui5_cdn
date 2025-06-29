/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/*
 * IMPORTANT: This is a private module, it must not be listed as a direct module dependency,
 *            nor must it be required by code outside this package.
 */

(function() {
	"use strict";

	/*
	 * Mark the runTest.js script tag with the "sap-ui-boostrap" ID so that ui5loader-config.js
	 * will use it to determine the root URL
	 */
	var oScriptTag = document.querySelector("[src$='runTest.js']");
	if (oScriptTag && !oScriptTag.id && document.getElementById("sap-ui-bootstrap") == null ) {
		oScriptTag.id = "sap-ui-bootstrap";
	}

	/*
	 * Activate async loading by default.
	 *
	 * When URL parameter 'coverage' is used to enable client side coverage (as introduced by qunit-coverage),
	 * then sync loading is used.
	 */
	var bCoverage = /(?:^|\?|&)coverage(?:&|=|$)/.test(window.location.search);
	sap.ui.loader.config({
		async: !bCoverage
	});

}());