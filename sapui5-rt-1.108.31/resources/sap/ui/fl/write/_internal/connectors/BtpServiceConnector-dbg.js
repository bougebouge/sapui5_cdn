/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/base/util/merge",
	"sap/ui/fl/Layer",
	"sap/ui/fl/write/_internal/connectors/KeyUserConnector",
	"sap/ui/fl/initial/_internal/connectors/BtpServiceConnector"
], function(
	merge,
	Layer,
	KeyUserConnector,
	InitialConnector
) {
	"use strict";

	/**
	 * Connector for saving and deleting data from SAPUI5 Flexibility KeyUser service - including personalization.
	 *
	 * @namespace sap.ui.fl.write._internal.connectors.BtpServiceConnector
	 * @version 1.108.28
	 * @private
	 * @ui5-restricted sap.ui.fl.write._internal.Storage
	 */
	var BtpServiceConnector = merge({}, KeyUserConnector, /** @lends sap.ui.fl.write._internal.connectors.BtpServiceConnector */ {
		layers: [
			Layer.CUSTOMER,
			Layer.PUBLIC,
			Layer.USER
		],
		ROUTES: {
			CHANGES: InitialConnector.ROOT + "/changes",
			SETTINGS: InitialConnector.ROOT + "/settings",
			TOKEN: InitialConnector.ROOT + "/settings",
			VERSIONS: {
				GET: InitialConnector.ROOT + "/versions",
				ACTIVATE: InitialConnector.ROOT + "/versions/activate",
				DISCARD: InitialConnector.ROOT + "/versions/draft",
				PUBLISH: InitialConnector.ROOT + "/versions/publish"
			},
			TRANSLATION: {
				UPLOAD: InitialConnector.ROOT + "/translation/texts",
				DOWNLOAD: InitialConnector.ROOT + "/translation/texts",
				GET_SOURCELANGUAGE: InitialConnector.ROOT + "/translation/sourcelanguages"
			},
			CONTEXTS: InitialConnector.ROOT + "/contexts"
		}
	});

	BtpServiceConnector.initialConnector = InitialConnector;
	return BtpServiceConnector;
});
