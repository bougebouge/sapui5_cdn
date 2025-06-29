/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/base/util/includes"
], function (
	includes
) {
	"use strict";

	/**
	 * Validates if the provided key is unique in a list of given keys.
	 *
	 * @namespace sap.ui.integration.designtime.baseEditor.validator.IsUniqueKey
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @static
	 * @since 1.81
	 * @public
	 * @experimental 1.81
	 */
	return {
		async: false,
		errorMessage: "BASE_EDITOR.VALIDATOR.DUPLICATE_KEY",
		/**
		 * Validator function
		 *
		 * @param {string} sValue - New key value to validate
		 * @param {object} oConfig - Validator config
		 * @param {string[]} oConfig.keys - Existing keys
		 * @param {string} oConfig.currentKey - Previous key value
		 * @returns {boolean} Validation result
		 *
		 * @public
		 * @function
		 * @name sap.ui.integration.designtime.baseEditor.validator.IsUniqueKey.validate
		 */
		validate: function (sValue, oConfig) {
			return (
				// Avoid duplicate key errors for the initial value
				oConfig.currentKey === undefined
				|| !includes(oConfig.keys, sValue)
				|| sValue === undefined
				|| sValue === oConfig.currentKey
			);
		}
	};
});
