/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	'sap/ui/core/Core'
], function(
	Core
) {
	"use strict";

	/**
	 * Process the needed predefined parameter.
	 *
	 * @since 1.72
	 * @private
	 */
	var ParameterMap = {};

	var mParameters = {
		"{{parameters.NOW_ISO}}": getTimeIso,
		"{{parameters.TODAY_ISO}}": getDateIso,
		"{{parameters.LOCALE}}": getLocale
	};

	/**
	 * Gets the Time.
	 *
	 * @returns {string} Time in ISO format.
	 */
	function getTimeIso() {

		return new Date().toISOString();
	}

	/**
	 * Gets the Date.
	 *
	 * @returns {string} Date in ISO format.
	 */
	function getDateIso () {

		return new Date().toISOString().slice(0, 10);
	}

	/**
	 * Gets the locale.
	 *
	 * @returns {string} Locale returned from UI5 configuration.
	 */
	function getLocale() {

		return Core.getConfiguration().getLocale().toString();
	}

	/**
	 * Called when manifest is parsed. Replaces the predefined parameters with the string values.
	 *
	 * @param {string} sPlaceholder The string with the non processed parameters.
	 * @returns {string} sPlaceholder The processed string with the replaced parameters as values.
	 */
	ParameterMap.processPredefinedParameter = function (sPlaceholder) {
		var regex;
		Object.keys(mParameters).forEach(function (element) {
			//find more than one match in the string
			regex = new RegExp(element, 'g');
			if (sPlaceholder.indexOf(element) > -1) {
				sPlaceholder = sPlaceholder.replace(regex, mParameters[element]());
			}

		});

		return sPlaceholder;
	};

	ParameterMap.getParamsForModel = function () {

		var oParameters = {};

		for (var parameter in mParameters) {

			var iIndexStart = parameter.indexOf("."),
			iIndexEnd = parameter.indexOf("}");
			oParameters[parameter.substring(iIndexStart + 1, iIndexEnd)] = mParameters[parameter]();
		}

		return oParameters;
	};

	return ParameterMap;

});
