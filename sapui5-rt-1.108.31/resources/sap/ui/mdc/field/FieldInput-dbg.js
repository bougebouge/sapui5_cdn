/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	'sap/m/Input',
	'sap/ui/mdc/field/FieldInputRenderer'
	], function(
		Input,
		FieldInputRenderer
	) {
	"use strict";

	/**
	 * Constructor for a new <code>FieldInput</code>.
	 *
	 * The <code>FieldInput</code> control enhances the {@link sap.m.Input Input} control to add ARIA attributes
	 * and other {@link sap.ui.mdc.field.FieldBase FieldBase}-specific logic.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 * @class The <code>FieldInput</code> control is used to render an input field inside a control based on {@link sap.ui.mdc.field.FieldBase FieldBase}.
	 * @extends sap.m.Input
	 * @version 1.108.28
	 * @constructor
	 * @abstract
	 * @private
	 * @ui5-restricted sap.ui.mdc.field.FieldBase
	 * @since 1.81.0
	 * @alias sap.ui.mdc.field.FieldInput
	 */
	var FieldInput = Input.extend("sap.ui.mdc.field.FieldInput", /** @lends sap.ui.mdc.field.FieldInput.prototype */
	{
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Sets the ARIA attributes added to the <code>Input</code> control.
				 *
				 * The object contains ARIA attributes in an <code>aria</code> node.
				 * Additional attributes, such as <code>role</code>, <code>autocomplete</code> or <code>valueHelpEnabled</code>, are added on root level.
				 */
				ariaAttributes: {
					type: "object",
					defaultValue: {},
					byValue: true
				}
			}
		},
		renderer: FieldInputRenderer
	});

	return FieldInput;

});
