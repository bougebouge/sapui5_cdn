/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.commons.layout.ResponsiveFlowLayoutData.
sap.ui.define(['sap/ui/commons/library', 'sap/ui/layout/ResponsiveFlowLayoutData'],
	function(library, LayoutResponsiveFlowLayoutData) {
	"use strict";



	/**
	 * Constructor for a new layout/ResponsiveFlowLayoutData.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * This is a LayoutData Element that can be added to a control if this control is used within a ResponsiveFlowLayout
	 * @extends sap.ui.layout.ResponsiveFlowLayoutData
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @public
	 * @since 1.9.1
	 * @deprecated Since version 1.16.0.
	 * moved to sap.ui.layout library. Please use this one.
	 * @alias sap.ui.commons.layout.ResponsiveFlowLayoutData
	 */
	var ResponsiveFlowLayoutData = LayoutResponsiveFlowLayoutData.extend("sap.ui.commons.layout.ResponsiveFlowLayoutData", /** @lends sap.ui.commons.layout.ResponsiveFlowLayoutData.prototype */ { metadata : {

		deprecated : true,
		library : "sap.ui.commons"
	}});


	/* Overwrite to have right "since" in there */

	/**
	* Getter for property <code>margin</code>.
	* This property prevents any margin of the element if set to false
	*
	* Default value is <code>true</code>
	*
	* @return {boolean} the value of property <code>margin</code>
	* @public
	* @since 1.11.0
	* @name sap.ui.commons.layout.ResponsiveFlowLayoutData#getMargin
	* @function
	*/
	/**
	* Setter for property <code>margin</code>.
	*
	* Default value is <code>true</code>
	*
	* @param {boolean} bMargin new value for property <code>margin</code>
	* @return {this} <code>this</code> to allow method chaining
	* @public
	* @since 1.11.0
	* @name sap.ui.commons.layout.ResponsiveFlowLayoutData#setMargin
	* @function
	*/

	return ResponsiveFlowLayoutData;

});
