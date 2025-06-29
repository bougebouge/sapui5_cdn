/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides the Design Time Metadata for the sap.uxap.ObjectPageHeader control
sap.ui.define([],
	function() {
		"use strict";

		return {
			palette: {
				group: "DISPLAY",
				icons: {
					svg: "sap/uxap/designtime/ObjectPageHeader.icon.svg"
				}
			},
			aggregations: {
				actions: {
					domRef : ":sap-domref .sapUxAPObjectPageHeaderIdentifierActions",
					actions : {
						move: {
							changeType: "moveControls"
						}
					},
					name: {
						singular: "OBJECT_PAGE_HEADER_NAME",
						plural: "OBJECT_PAGE_HEADER_NAME_PLURAL"
					}
				}
			}
		};

	});