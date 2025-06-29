/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(['sap/f/semantic/SemanticButton'], function(SemanticButton) {
	"use strict";

	/**
	* Constructor for a new <code>PositiveAction</code>.
	* @param {string} [sId] ID for the new control, generated automatically if no ID is given
	* @param {object} [mSettings] Optional initial settings for the new control:  a map/JSON-object with initial property values, event listeners etc. for the new object
	*
	* @class
	* A semantic-specific button, eligible for the <code>positiveAction</code> aggregation of the
	* {@link sap.f.semantic.SemanticPage} to be placed in its footer.
	*
	* @extends sap.f.semantic.SemanticButton
	*
	* @author SAP SE
	* @version 1.108.28
	*
	* @constructor
	* @public
	* @since 1.46.0
	* @alias sap.f.semantic.PositiveAction
	*/
	var PositiveAction = SemanticButton.extend("sap.f.semantic.PositiveAction", /** @lends sap.f.semantic.PositiveAction.prototype */ {
		metadata: {
			library: "sap.f",
			properties: {

				/**
				* Defines <code>PositiveAction</code> text.
				* <b>Note:</b> the default text is "Accept"
				*/
				text: {type: "string", group: "Misc", defaultValue: null}
			}
		}
	});

	return PositiveAction;
});
