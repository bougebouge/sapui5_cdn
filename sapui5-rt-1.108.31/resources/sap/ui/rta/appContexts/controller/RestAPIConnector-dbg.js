/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([

], function (

) {
	"use strict";

	var RestAPIConnector = {
		getAppContextData: function () {
			//TODO: logic to retrieve backend data is missing here
			return { appContext: [] };
		}

	};

	return RestAPIConnector;
});