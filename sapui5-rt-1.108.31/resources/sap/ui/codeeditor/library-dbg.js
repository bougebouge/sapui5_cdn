/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/**
 * Initialization Code and shared classes of library sap.ui.codeeditor.
 */
sap.ui.define([
	"sap/ui/core/Core", // provides sap.ui.getCore()
	"sap/ui/core/library" // library dependency
], function () {
	"use strict";

	/**
	 * UI5 library: sap.ui.codeeditor.
	 *
	 * @namespace
	 * @alias sap.ui.codeeditor
	 * @author SAP SE
	 * @version 1.108.28
	 * @since 1.48
	 * @public
	 */
	var thisLib = sap.ui.getCore().initLibrary({
		name : "sap.ui.codeeditor",
		dependencies : ["sap.ui.core"],
		types: [],
		interfaces: [],
		controls: [
			"sap.ui.codeeditor.CodeEditor"
		],
		elements: [],
		noLibraryCSS: false,
		version: "1.108.28"
	});

	return thisLib;
});