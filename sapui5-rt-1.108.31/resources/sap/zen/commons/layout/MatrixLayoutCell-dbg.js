/*
 * SAPUI5
    (c) Copyright 2009-2020 SAP SE. All rights reserved
  
 */
/*global sap*/
// Provides control sap.zen.commons.layout.MatrixLayoutCell.
sap.ui.define(
  [
    "jquery.sap.global",
    "sap/zen/commons/library",
    "sap/ui/core/CustomStyleClassSupport",
    "sap/ui/core/Element"
  ],
  function(jQuery, library, CustomStyleClassSupport, Element) {
    "use strict";
    /**
     * Constructor for a new layout/MatrixLayoutCell.
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
     * @version  1.108.15
     *
     * @constructor
     * @public
     * @deprecated Since version 1.38. Instead, use the <code>sap.ui.layout.Grid</code> control.
     * @alias sap.zen.commons.layout.MatrixLayoutCell
     */
    var MatrixLayoutCell = Element.extend("sap.zen.commons.MatrixLayoutCell", /** @lends sap.zen.commons.layout.MatrixLayoutCell.prototype */ { metadata : {
      library : "sap.zen.commons",
      aggregatingType : "MatrixLayoutRow",
      properties : {
        /**
         *
         * Determines the matrix layout cell's background design.
         */
        backgroundDesign : {type : "sap.zen.commons.BackgroundDesign", defaultValue : 'Transparent'},
        /**
         *
         * Determines how many columns of the underlying grid structure are occupied
         * by this matrix layout cell.
         */
        colSpan : {type : "int", defaultValue : 1},
        /**
         *
         * Determines the horizontal alignment of the matrix layout cell's content
         * with the cell's borders.
         */
        hAlign : {type : "sap.zen.commons.HAlign", defaultValue : 'Begin'},
        /**
         *
         * Determines the padding of the matrix layout cell's content within the
         * cell's borders. The default value is appropriate for all cells in a
         * form-like layout. Consider to remove the padding on the outer layout in
         * case of nesting.
         */
        padding : {type : "sap.zen.commons.Padding", defaultValue : 'End'},
        /**
         * Determines how many rows of the underlying grid structure are occupied by this matrix layout cell.
         * In case a row-height is used, all rows affected by the RowSpan must have the same unit.
         */
        rowSpan : {type : "int", defaultValue : 1},
        /**
         *
         * Determines how a matrix layout cell is separated from its predecessor,
         * via a vertical gutter of variable width, with or without a vertical line.
         */
        separation : {type : "sap.zen.commons.Separation", defaultValue : 'None'},
        /**
         *
         * Determines the vertical alignment of the matrix layout cell's content
         * with the cell's borders.
         */
        vAlign : {type : "sap.zen.commons.VAlign", defaultValue : 'Middle'}
      },
      defaultAggregation : "content",
      aggregations : {
        /**
         * The matrix layout cell's content (arbitrary controls).
         *
         * If the matrix row has a defined height and the matrix has layoutFixed = true, the controls inside of a cell should all use the same unit for its height property.
         */
        content : {type : "sap.ui.core.Control", multiple : true, singularName : "content"}
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
     * @name sap.zen.commons.layout.MatrixLayoutCell#addStyleClass
     * @function
     * @param {string} sStyleClass
     *         the CSS class name to be added
     * @type sap.zen.commons.layout.MatrixLayoutCell
     * @public
     */
    /**
     * Removes the given string from the list of custom style classes that have been set previously.
     * Regular style classes like "sapUiBtn" cannot be removed.
     *
     * Returns <code>this</code> to allow method chaining
     *
     * @name sap.zen.commons.layout.MatrixLayoutCell#removeStyleClass
     * @function
     * @param {string} sStyleClass
     *         the style to be removed
     * @type sap.zen.commons.layout.MatrixLayoutCell
     * @public
     */
    /**
     * Returns true if the given style class string is valid and if this Element has this style class set via a previous call to addStyleClass().
     *
     * @name sap.zen.commons.layout.MatrixLayoutCell#hasStyleClass
     * @function
     * @param {string} sStyleClass
     *         the style to check for
     * @type boolean
     * @public
     */
    CustomStyleClassSupport.apply(MatrixLayoutCell.prototype);
    return MatrixLayoutCell;
  }, /* bExport= */ true);
