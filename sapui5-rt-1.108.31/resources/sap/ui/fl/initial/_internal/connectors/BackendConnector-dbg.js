/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/fl/initial/_internal/connectors/Utils",
	"sap/base/util/restricted/_pick"
], function(
	InitialUtils,
	_pick
) {
	"use strict";

	/**
	 * Base connector for requesting flexibility data from a back end.
	 *
	 * @namespace sap.ui.fl.initial._internal.connectors.BackendConnector
	 * @implements {sap.ui.fl.interfaces.BaseLoadConnector}
	 * @since 1.72
	 * @private
	 * @ui5-restricted sap.ui.fl.initial._internal.connectors, sap.ui.fl.write._internal.connectors
	 */
	return {
		xsrfToken: undefined,
		settings: undefined,
		/**
		 * Sends request to a back end.
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} [mPropertyBag.version] Version of the adaptation to be loaded
		 * @returns {Promise<object>} Promise resolving with the raw JSON parsed server response of the flex data request
		 */
		sendRequest: function(mPropertyBag) {
			var mParameters = _pick(mPropertyBag, ["version", "allContexts"]);

			if (this.isLanguageInfoRequired) {
				InitialUtils.addLanguageInfo(mParameters);
			}
			var sDataUrl = InitialUtils.getUrl(this.ROUTES.DATA, mPropertyBag, mParameters);
			return InitialUtils.sendRequest(sDataUrl, "GET", {
				initialConnector: this,
				xsrfToken: this.xsrfToken}
			).then(function (oResult) {
				var oResponse = oResult.response;
				if (oResult.etag) {
					oResponse.cacheKey = oResult.etag;
				}
				if (oResponse.settings) {
					this.settings = oResponse.settings;
				}
				return oResponse;
			}.bind(this));
		},
		/**
		 * Loads flexibility data from a back end.
		 *
		 * @param {object} mPropertyBag Further properties
		 * @param {string} mPropertyBag.url Configured url for the connector
		 * @param {string} mPropertyBag.reference Flexibility reference
		 * @param {string} [mPropertyBag.version] Version of the adaptation to be loaded
		 * @returns {Promise<object>} Promise resolving with the JSON parsed server response of the flex data request
		 */
		loadFlexData: function(mPropertyBag) {
			return this.sendRequest(mPropertyBag).then(function (oResponse) {
				oResponse.changes = oResponse.changes.concat(oResponse.compVariants || []);
				return oResponse;
			});
		}
	};
});