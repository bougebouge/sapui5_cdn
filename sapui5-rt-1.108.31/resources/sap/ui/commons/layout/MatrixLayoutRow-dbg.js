/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.commons.layout.MatrixLayoutRow.
sap.ui.define(['sap/ui/commons/library', 'sap/ui/core/CustomStyleClassSupport', 'sap/ui/core/Element'],
	function(library, CustomStyleClassSupport, Element) {
	"use strict";



	/**
	 * Constructor for a new layout/MatrixLayoutRow.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * Non-control element used as part of a matrix layout's inner structure.
	 * @extends sap.ui.core.Element
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.ui.layout.Grid</code> control.
	 * @alias sap.ui.commons.layout.MatrixLayoutRow
	 */
	var MatrixLayoutRow = Element.extend("sap.ui.commons.layout.MatrixLayoutRow", /** @lends sap.ui.commons.layout.MatrixLayoutRow.prototype */ { metadata : {

		deprecated: true,
		library : "sap.ui.commons",
		aggregatingType : "MatrixLayout",
		properties : {

			/**
			 * Height of the row.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null}
		},
		defaultAggregation : "cells",
		aggregations : {

			/**
			 *
			 * The matrix layout row's individual cells.
			 */
			cells : {type : "sap.ui.commons.layout.MatrixLayoutCell", multiple : true, singularName : "cell"}
		}
	}});


	/**
	 * The string given as "sStyleClass" will be added to the "class" attribute of this element's root HTML element.
	 *
	 * This method is intended to be used to mark controls as being of a special type for which
	 * special styling can be provided using CSS selectors that reference this style class name.
	 *
	 * <pre>
	 * Example:
	 * myButton.addStyleClass("myRedTextButton"); // add a CSS class to one button instance
	 *
	 * ...and in CSS:
	 * .myRedTextButton {
	 * color: red;
	 * }
	 * </pre>
	 *
	 * This will add the CSS class "myRedTextButton" to the Button HTML and the CSS code above will then
	 * make the text in this particular button red.
	 *
	 * Only characters allowed inside HTML attributes are allowed.
	 * Quotes are not allowed and this method will ignore any strings containing quotes.
	 * Strings containing spaces are interpreted as ONE custom style class (even though CSS selectors interpret them
	 * as different classes) and can only removed later by calling removeStyleClass() with exactly the
	 * same (space-containing) string as parameter.
	 * Multiple calls with the same sStyleClass will have no different effect than calling once.
	 * If sStyleClass is null, the call is ignored.
	 *
	 * Returns <code>this</code> to allow method chaining
	 *
	 * @name sap.ui.commons.layout.MatrixLayoutRow#addStyleClass
	 * @function
	 * @param {string} sStyleClass
	 *         the CSS class name to be added
	 * @type this
	 * @public
	 */


	/**
	 * Removes the given string from the list of custom style classes that have been set previously.
	 * Regular style classes like "sapUiBtn" cannot be removed.
	 *
	 * Returns <code>this</code> to allow method chaining
	 *
	 * @name sap.ui.commons.layout.MatrixLayoutRow#removeStyleClass
	 * @function
	 * @param {string} sStyleClass
	 *         the style to be removed
	 * @type this
	 * @public
	 */


	/**
	 * Returns true if the given style class string is valid and if this Element has this style class set via a previous call to addStyleClass().
	 *
	 * @name sap.ui.commons.layout.MatrixLayoutRow#hasStyleClass
	 * @function
	 * @param {string} sStyleClass
	 *         the style to check for
	 * @type boolean
	 * @public
	 */

	CustomStyleClassSupport.apply(MatrixLayoutRow.prototype);


	return MatrixLayoutRow;

});
