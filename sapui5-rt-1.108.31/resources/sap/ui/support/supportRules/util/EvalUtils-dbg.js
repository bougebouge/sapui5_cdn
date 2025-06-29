/* eslint-disable no-eval */

/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([], function () {
	"use strict";

	var bIsEvalAllowed;

	// Checks if eval can be used in the current platform (based on CSP restrictions)
	try {
		eval("");
		bIsEvalAllowed = true;
	} catch (e) {
		bIsEvalAllowed = false;
	}

	return {
		/**
		 * @returns {boolean} Whether eval can be used in the current environment
		 */
		isEvalAllowed: function () {
			return bIsEvalAllowed;
		},

		/**
		 * Evaluates a function string
		 * @param {string} sFunction Function as string
		 * @returns {function} Evaluated function
		 * @throws Error why eval failed, for example invalid syntax
		 */
		evalFunction: function (sFunction) {
			var fn;

			eval("fn = " + sFunction);

			return fn;
		}
	};
});