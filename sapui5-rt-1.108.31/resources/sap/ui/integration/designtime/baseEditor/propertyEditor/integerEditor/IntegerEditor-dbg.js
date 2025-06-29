/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/integration/designtime/baseEditor/propertyEditor/BasePropertyEditor",
	"sap/ui/integration/designtime/baseEditor/propertyEditor/numberEditor/NumberEditor",
	"sap/ui/core/format/NumberFormat"
], function (
	BasePropertyEditor,
	NumberEditor,
	NumberFormat
) {
	"use strict";

	/**
	 * @class
	 * Constructor for a new <code>IntegerEditor</code>.
	 * This allows you to set integer values or binding paths for a specified property of a JSON object.
	 * The editor is rendered as a {@link sap.m.Input}, which prevents non-integer user input unless it is a valid binding path.
	 *
	 * @extends sap.ui.integration.designtime.baseEditor.propertyEditor.numberEditor.NumberEditor
	 * @alias sap.ui.integration.designtime.baseEditor.propertyEditor.integerEditor.IntegerEditor
	 * @author SAP SE
	 * @since 1.76
	 * @version 1.108.28
	 *
	 * @private
	 * @experimental 1.76
	 * @ui5-restricted
	 */
	var IntegerEditor = NumberEditor.extend("sap.ui.integration.designtime.baseEditor.propertyEditor.integerEditor.IntegerEditor", {
		invalidInputError: "BASE_EDITOR.INTEGER.INVALID_BINDING_OR_INTEGER",
		metadata: {
			library: "sap.ui.integration"
		},
		renderer: BasePropertyEditor.getMetadata().getRenderer().render
	});

	IntegerEditor.prototype.getDefaultValidators = function () {
		return Object.assign(
			{},
			BasePropertyEditor.prototype.getDefaultValidators.call(this),
			{
				isInteger: {
					type: "isInteger"
				}
			}
		);
	};

	IntegerEditor.configMetadata = Object.assign(
		{},
		NumberEditor.configMetadata,
		{
			typeLabel: {
				defaultValue: "BASE_EDITOR.TYPES.INTEGER"
			}
		}
	);

	IntegerEditor.prototype.validateNumber = function (vValue) {
		return NumberEditor.prototype.validateNumber.call(this, vValue) && Number.isInteger(vValue);
	};

	IntegerEditor.prototype.getFormatterInstance = function () {
		return NumberFormat.getIntegerInstance();
	};

	return IntegerEditor;
});
