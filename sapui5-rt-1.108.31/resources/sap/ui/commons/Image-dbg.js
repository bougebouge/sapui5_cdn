/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.commons.Image.
sap.ui.define(['./library', 'sap/ui/core/Control', './ImageRenderer'],
	function(library, Control, ImageRenderer) {
	"use strict";



	/**
	 * Constructor for a new Image.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * A wrapper around the IMG tag. The image can be loaded from a remote or local server.
	 * There are various size setting options available, and the images can be combined with actions.
	 * @extends sap.ui.core.Control
	 * @implements sap.ui.commons.ToolbarItem,sap.ui.commons.FormattedTextViewControl, sap.ui.core.IFormContent
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @public
	 * @deprecated as of version 1.38, replaced by {@link sap.m.Image}
	 * @alias sap.ui.commons.Image
	 */
	var Image = Control.extend("sap.ui.commons.Image", /** @lends sap.ui.commons.Image.prototype */ { metadata : {

		interfaces : [
			"sap.ui.commons.ToolbarItem",
			"sap.ui.commons.FormattedTextViewControl",
			"sap.ui.core.IFormContent"
		],
		library : "sap.ui.commons",
		deprecated: true,
		properties : {

			/**
			 * Relative or absolute path to URL where the image file is stored.
			 */
			src : {type : "sap.ui.core.URI", group : "Data", defaultValue : null},

			/**
			 * When the empty value is kept, the original size is not changed. It is also possible to make settings for width or height only, the overall size is maintained then, considering the aspect ratio.
			 */
			width : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

			/**
			 * When the empty value is kept, the original size is not changed. It is also possible to make settings for width or height only, the overall size is maintained then, considering the aspect ratio.
			 */
			height : {type : "sap.ui.core.CSSSize", group : "Appearance", defaultValue : null},

			/**
			 * A decorative image is included for design reasons. Accessibility tools will ignore decorative images.
			 * Note: If the Image has an image map (useMap is set), this property will be overridden (the image will not be rendered as decorative).
			 * A decorative image has no ALT attribute, so the Alt property is ignored if the image is decorative.
			 */
			decorative : {type : "boolean", group : "Accessibility", defaultValue : true},

			/**
			 * The alternative text that is displayed in case the Image is not available, or cannot be displayed.
			 * If the image is set to decorative this property is ignored.
			 */
			alt : {type : "string", group : "Accessibility", defaultValue : null},

			/**
			 * The name of the image map that defines the clickable areas
			 */
			useMap : {type : "string", group : "Misc", defaultValue : null}
		},
		events : {

			/**
			 * Event is fired when the user clicks on the control.
			 */
			press : {}
		}
	}});

	/**
	 * Function is called when image is clicked.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Image.prototype.onclick = function(oEvent) {
		this.firePress({/* no parameters */});
	};

	/**
	 * Function is called when "enter" keydown happens on image.
	 * @param {jQuery.Event} oEvent
	 * @private
	 */
	Image.prototype.onsapenter = Image.prototype.onclick;

	/*
	 * Image must not be stretched in Form because should have its original size.
	 */
	Image.prototype.getFormDoNotAdjustWidth = function() {
		return true;
	};

	return Image;

});
