/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/mdc/field/content/DefaultContent"
], function(DefaultContent) {
	"use strict";

	/**
	 * Object-based definition of the Boolean content type that is used in the {@link sap.ui.mdc.field.content.ContentFactory}.
	 * This defines which controls to load and create for a given {@link sap.ui.mdc.enum.ContentMode}.
	 * @author SAP SE
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 * @experimental As of version 1.87
	 * @since 1.87
	 * @alias sap.ui.mdc.field.content.BooleanContent
	 * @extends sap.ui.mdc.field.content.DefaultContent
	 * @MDC_PUBLIC_CANDIDATE
	 */
	var BooleanContent = Object.assign({}, DefaultContent, {
		getDisplayMultiValue: function() {
			return [null];
		},
		getDisplayMultiLine: function() {
			return [null];
		},
		getEditMultiValue: function() {
			return [null];
		},
		getEditMultiLine: function() {
			return [null];
		},
		getUseDefaultFieldHelp: function() {
			return { name: "bool", oneOperatorSingle: true, oneOperatorMulti: true, single: true, multi: true };
		},
		createEditMultiValue: function() {
			throw new Error("sap.ui.mdc.field.content.BooleanContent - createEditMultiValue not defined!");
		},
		createEditMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.BooleanContent - createEditMultiLine not defined!");
		},
		createDisplayMultiValue: function() {
			throw new Error("sap.ui.mdc.field.content.BooleanContent - createDisplayMultiValue not defined!");
		},
		createDisplayMultiLine: function() {
			throw new Error("sap.ui.mdc.field.content.BooleanContent - createDisplayMultiLine not defined!");
		}
	});

	return BooleanContent;
});