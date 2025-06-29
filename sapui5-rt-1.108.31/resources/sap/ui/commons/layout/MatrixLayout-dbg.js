/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.commons.layout.MatrixLayout.
sap.ui.define([
    'sap/ui/thirdparty/jquery',
    './MatrixLayoutCell',
    './MatrixLayoutRow',
    'sap/ui/commons/library',
    'sap/ui/core/Control',
    'sap/ui/core/EnabledPropagator',
    './MatrixLayoutRenderer',
    'sap/ui/commons/TextView'
],
	function(
	    jQuery,
		MatrixLayoutCell,
		MatrixLayoutRow,
		library,
		Control,
		EnabledPropagator,
		MatrixLayoutRenderer,
		TextView
	) {
	"use strict";

	/**
	 * Constructor for a new layout/MatrixLayout.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 *
	 * <p>
	 * A matrix layout arranges controls in a grid structure, using rows which
	 * need not have the same number of cells.
	 * </p>
	 *
	 * <p>
	 * It uses predefined cell classes that guarantee appropriate distances
	 * between cells in the grid. The cell's <code>vGutter</code> property lets
	 * you specify additional horizontal distances easily. You can set these
	 * additional distances (known as gutters) with or without separators.
	 * The distance for each cell is specified by assigning a specific
	 * enumeration value of the class <code>LayoutCellSeparator</code> of the
	 * matrix data object.
	 * </p>
	 *
	 * <p>
	 * You should <b>avoid nesting</b> matrix layouts. You should only use a
	 * matrix layout if you need to align controls horizontally across rows.
	 * </p>
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @public
	 * @deprecated Since version 1.38. Instead, use the <code>sap.ui.layout.Grid</code> control.
	 * @alias sap.ui.commons.layout.MatrixLayout
	 */
	var MatrixLayout = Control.extend("sap.ui.commons.layout.MatrixLayout", /** @lends sap.ui.commons.layout.MatrixLayout.prototype */ { metadata : {

		deprecated: true,
		library : "sap.ui.commons",
		properties : {
			/**
			 * CSS width of the matrix layout.
			 * If the LayoutFixed = true an adequate width should be provided.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 *
			 * CSS height of the matrix layout.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Dimension", defaultValue : null},

			/**
			 * Sets the table layout. If fixed the width parameter of a column has priority, if not the width of the content of the colums has priority.
			 * The default is "fixed".
			 * If the fixed layout is used an adequate width of the MatrixLayout should be provided. Otherwise the column width displayed could be different than the given ones because of browser dependend optimazations.
			 */
			layoutFixed : {type : "boolean", group : "Appearance", defaultValue : true},

			/**
			 * Number of columns. If not specified, the number of columns will be determined from the given cells.
			 */
			columns : {type : "int", group : "Appearance", defaultValue : null},

			/**
			 * Widths of the columns. Use an array to define the widths of the columns.
			 * If a column shall have an automatical sizing enter "auto" for this column width.
			 */
			widths : {type : "sap.ui.core.CSSSize[]", group : "Appearance", defaultValue : null}
		},
		defaultAggregation : "rows",
		aggregations : {

			/**
			 *
			 * The matrix layout's individual rows.
			 */
			rows : {type : "sap.ui.commons.layout.MatrixLayoutRow", multiple : true, singularName : "row"}
		}
	}});


	EnabledPropagator.call(MatrixLayout.prototype, true, /* legacy mode */ true);

	/**
	 * Creates a new matrix layout row and appends it to this matrix layout.
	 *
	 * Each argument must be either a matrix layout cell, which is added to the row
	 * "as is", or an arbitrary content control, which is wrapped with a new
	 * (default) matrix layout cell first and then added to the row.
	 *
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	MatrixLayout.prototype.createRow = function() {

		var oRow = new MatrixLayoutRow();
		this.addRow(oRow);
		for (var i = 0; i < arguments.length; i++) {
			var oContent = arguments[i];
			var oCell;
			if (oContent instanceof MatrixLayoutCell) {
				// matrix layout cell given, use as is
				oCell = oContent;
			} else if (oContent instanceof Control) {
				// any control given, wrap with matrix layout cell first
				oCell = new MatrixLayoutCell({content : oContent});
			} else if (oContent instanceof Object && oContent.height) {
				oRow.setHeight(oContent.height);
			} else {
				// any string(?) given, display it
				var sText = oContent ? oContent.toString() : "";
				oCell = new MatrixLayoutCell({
					content : new TextView({text : sText})});
			}
			oRow.addCell(oCell);
		}
		return this;

	};

	/*
	 * Overwrites Setter for property <code>widths</code>.
	 * Sets the widths of the columns. The values must be stored in an array to be used in renderer.
	 * to be compatible with previous version also allow list of values.
	 * @param {sap.ui.core.CSSSize[]} aWidths new value for property <code>widths</code>
	 * @return {this} <code>this</code> to allow method chaining
	 * @public
	 */
	MatrixLayout.prototype.setWidths = function( aWidths ) {

		var aSetWidths;

		if (!Array.isArray(aWidths)) {
			// a list of values is used instead of an array -> use this as array
			aSetWidths = jQuery.makeArray(arguments);
		} else {
			aSetWidths = aWidths;
		}

		// set "auto" for empty values
		for ( var i = 0; i < aSetWidths.length; i++) {
			if (aSetWidths[i] == "" || !aSetWidths[i]) {
				aSetWidths[i] = "auto";
			}
		}

		this.setProperty("widths", aSetWidths);

		return this;

	};

	return MatrixLayout;

});
