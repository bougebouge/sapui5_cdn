/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
	"sap/ui/core/Core",
	"./BaseShape",
	"./GanttUtils",
	"sap/ui/Device",
	"sap/ui/core/theming/Parameters",
	"../library",
	"./RenderUtils"
], function (
	Core,
	BaseShape,
	GanttUtils,
	Device,
	Parameters,
	library,
	RenderUtils) {
	"use strict";
	var ShapeAlignment = library.simple.shapes.ShapeAlignment;
	/**
	 * Creates and initializes a new BaseText class.
	 *
	 * @param {string} [sId] ID for the new control, generated automatically if no ID is given
	 * @param {object} [mSettings] Initial settings for the new control
	 *
	 * @class
	 * BaseText defines a graphics element consisting of text.
	 *
	 * @extends sap.gantt.simple.BaseShape
	 *
	 * @author SAP SE
	 * @version 1.108.10
	 *
	 * @constructor
	 * @public
	 * @alias sap.gantt.simple.BaseText
	 */
	var BaseText = BaseShape.extend("sap.gantt.simple.BaseText", /** @lends sap.gantt.simple.BaseText.prototype */ {
		metadata: {
			library: "sap.gantt",
			properties: {

				/**
				 * Text content
				 */
				text: {type: "string"},

				/**
				 * x-axis coordinate
				 */
				x: {type: "float"},

				/**
				 * y-axis coordinate
				 */
				y: {type: "float"},

				/**
				 * The fontSize property refers to the size of the font
				 */
				fontSize: {type: "int", defaultValue: 13},

				/**
				 * This property is used to align (start-, middle- or end-alignment) a string of text relative to a given point
				 */
				textAnchor: {type: "string", defaultValue: "start"},

				/**
				 * This property indicates which font family will be used to render the text, specified as a prioritized list of font family names and/or generic family names
				 */
				fontFamily: {type: "string", defaultValue: "Arial"},

				/**
				 * The width to start truncate the text. If the value is omit, the text is truncated base on it's parent width
				 */
				truncateWidth: {type: "float"},

				/**
				 * Flag to show the ellipsis symbol.
				 */
				showEllipsis: {type: "boolean", defaultValue: true},
				/**
				 * Flag to consider a baseText as not a part of graphical shape.
				 * Label exclusion is only applicable to outermost basegroup.
				 * @since 1.93
				 */
				isLabel : {type: "boolean", defaultValue: false},
				/**
				 * property to check if shape is cropped by the visible horizon
				 * @deprecated since 1.108.22. This is a private property and it is being removed from UI5 version 1.117. We recommend not using this property. In case you want to use it, contact us using CA-UI5-CTR-GNT.
				 * @private
				 * @since 1.96
				 */
				_shapeCropped: {type: "boolean",  defaultValue: false},
				/**
				 * xBaised value to be added to cropped shape when horizontalTextAligment is set to "Dynamic"
				 * @deprecated since 1.108.22. This is a private property and it is being removed from UI5 version 1.117. We recommend not using this property. In case you want to use it, contact us using CA-UI5-CTR-GNT.
				 * @private
				 * @since 1.96
				 */
				_xBiassed: {type: "float"}

			}
		},
		renderer: {
			apiVersion: 2    // enable in-place DOM patching
		}
	});

	var mAttributes = ["x", "y", "text-anchor", "style", "filter", "transform", "opacity"];

	/**
	 * Gets current value of property <code>x</code>.
	 * <p>
	 * x coordinate of the bottom-left corner of the text.
	 *
	 * Usually applications do not set this value. This getter carries out the calculation using property <code>time</code> from itself or it's parent that has method <code>getTime</code>.
	 * If you override the default value calculated by the getter, the alignment of the center is not guaranteed.
	 * </p>
	 *
	 * @return {number} Value of property <code>x</code>.
	 * @public
	 */
	BaseText.prototype.getX = function () {
		var iX = GanttUtils.getValueX(this);
		if (isNaN(iX) && this.getParent() && this.getParent().getTime) {
			iX = GanttUtils.getValueX(this.getParent());
		}
		return iX;
	};

	/**
	 * Gets current value of property <code>y</code>.
	 *
	 * <p>
	 * y coordinate of the bottom-left corner of the text.
	 *
	 * Usually applications do not set this value. This getter carries out the calculation using parameter <code>RowYCenter</code>
	 * and property <code>fontSize</code> to align the center of the row rectangle along the y axis.
	 * If you override the default value calculated by the getter, the alignment of the center is not guaranteed.
	 * </p>
	 * @return {number} Value of property <code>y</code>.
	 * @public
	 */
	BaseText.prototype.getY = function () {
		var vValue = this.getProperty("y"),
			iRowStrokeDensity = 1;
		if (vValue !== null && vValue !== undefined) {
			return vValue;
		}
		//Alignment of Shape on the Y Axis based on AlignShape
		var iFontSize = this.getFontSize();
		var y = this.getRowYCenter() + iFontSize / 2;
		if (this._iBaseRowHeight != undefined) {
			if (this.getAlignShape() == ShapeAlignment.Top) {
				y = this.getRowYCenter() - (this._iBaseRowHeight / 2) + iFontSize;
			}else if ( this.getAlignShape() == ShapeAlignment.Bottom) {
				y = this.getRowYCenter() + (this._iBaseRowHeight / 2) - iRowStrokeDensity;
			}
			y = parseInt(y,10);
		}
		return y;
	};

	/**
	 * Get the BaseText style string
	 *
	 * @return {string} BaseText styles
	 * @protected
	 */
	BaseText.prototype.getStyle = function() {
		var sInheritedStyle = BaseShape.prototype.getStyle.apply(this, arguments);
		var sFill = this.getTitleColor() ? this.getTitleColor() : this.getFill() || Parameters.get("sapUiBaseText");
		var oStyles = {
			"font-size": this.getFontSize() + "px",
			"fill": this.determineValueColor(sFill),
			"font-family": this.getFontFamily(),
			"font-weight": this.getFontWeight()
		};
		return sInheritedStyle + this.getInlineStyle(oStyles);
	};

	/**
	 * Renders the text with RenderManager
	 *
	 * @param {sap.ui.core.RenderManager} oRm A shared RenderManager for GanttChart control
	 * @param {sap.gantt.simple.BaseText} oElement BaseText to be rendered
	 * @public
	 */
	BaseText.prototype.renderElement = function(oRm, oElement) {
		this.writeElementData(oRm, "text", true);
		if (this.aCustomStyleClasses) {
			this.aCustomStyleClasses.forEach(function(sClass){
				oRm.class(sClass);
			});
		}

		RenderUtils.renderAttributes(oRm, oElement, mAttributes);

		var oGantt = oElement.getGanttChartBase();
		if (oGantt && oGantt.getSelectOnlyGraphicalShape() &&  oElement.getIsLabel()){
			oRm.class("sapGanttTextNoPointerEvents");
		}
		oRm.openEnd();

		RenderUtils.renderTooltip(oRm, oElement);
		if (this.getShowAnimation()) {
			RenderUtils.renderElementAnimation(oRm, oElement);
		}
		this.writeTruncatedText(oRm, oElement);
		// oRm.write(oElement.getText());
		oRm.close("text");
	};

	/**
	 * Render truncated text with RenderManager
	 *
	 * @param {sap.ui.core.RenderManager} oRm A shared RenderManager for GanttChart control
	 * @param {sap.gantt.simple.BaseText} oElement BaseText to be rendered
	 * @private
	 */
	BaseText.prototype.writeTruncatedText = function(oRm, oElement) {
		var sText = oElement.getText(),
			bTruncatedWidthDefined = this.getTruncateWidth() != null;
		if (bTruncatedWidthDefined) {
			// user had defined truncated width, try to truncate text based on the width
			var oResult = this._truncateText(sText);
			this.renderEllipsisIfNecessary(oRm, oResult);
		} else {
			oRm.text(sText);
		}
	};

	/**
	 * Gets the value of property <code>truncateWidth</code>.
	 *
	 * <p>
	 * Truncating width. Default value -1 indicates truncating function is not activated. To enable truncating, specifies a truncate width. If text length
	 * exceeds truncate width, text is truncated automatically. This method will return the minimum between property <code>truncateWidth</code> and it's parent's width
	 * caculated by time range.
	 * </p>
	 * @return {number} Value of property <code>truncateWidth</code>.
	 * @public
	 */
	BaseText.prototype.getTruncateWidth = function() {
		var iOriginalWidth = this.getProperty("truncateWidth");

		var oParent = this.getParent();
		if (oParent && oParent.isA("sap.gantt.simple.BaseShape")) {
			var iParentWidth = 0;
			if (oParent.getWidth) {
				iParentWidth = oParent.getWidth();
			} else if (oParent.getEndTime() && oParent.getTime()) {
					iParentWidth = Math.abs(this.getXByTime(oParent.getEndTime()) - this.getXByTime(oParent.getTime()));
			} else {
				iParentWidth = iOriginalWidth;
			}

			if (iParentWidth < iOriginalWidth) {
				return iParentWidth;
			}
		}
		if (this.getTextAnchor().toLowerCase() === library.simple.horizontalTextAlignment.Dynamic.toLowerCase() && this.getProperty("_shapeCropped")) {
			iOriginalWidth = Core.getConfiguration().getRTL() ? iOriginalWidth + this.getProperty("_xBiassed") : iOriginalWidth - this.getProperty("_xBiassed");
		}
		return iOriginalWidth;
	};

	/**
	 * Render text with ellipsis if necessary
	 *
	 * @private
	 * @param {sap.ui.core.RenderManager} oRm A shared RenderManager for GanttChart control
	 * @param {object} oResult Result to be rendered.
	 */
	BaseText.prototype.renderEllipsisIfNecessary = function(oRm, oResult) {
		if (oResult.ellipsis) {
			oRm.text(oResult.truncatedText + "...");
		} else {
			oRm.text(oResult.truncatedText);
		}
	};

	/**
	 * Truncate text if necessary
	 *
	 * @param {string} sSourceText Text to display
	 * @private
	 * @return {object} truncate result for rendering
	 */
	BaseText.prototype._truncateText = function(sSourceText) {
		var oResult = this._processTextForTruncation(sSourceText);

		oResult = oResult || {
			ellipsis: false,
			truncatedText: sSourceText
		};

		return oResult;
	};

	/**
	 * Process text for truncating
	 *
	 * @param {string} sSourceText Text to display
	 * @return {object} Truncate result for rendering
	 */
	BaseText.prototype._processTextForTruncation = function(sSourceText) {
		var iTruncateWidth = this.getTruncateWidth(),
			iEllipsisWidth = this.measureTextWidth("..."),
			iTextTotalLength = this.measureTextWidth(sSourceText);

		if (iTextTotalLength > iTruncateWidth) { // truncate needed
			var iTargetWidth,
				bShowEllipsis;

			if (this.getShowEllipsis() && iEllipsisWidth < iTruncateWidth) { // ellipsis enabled
				bShowEllipsis = true;
				iTargetWidth = iTruncateWidth - iEllipsisWidth;
			} else { // ellipsis disabled
				bShowEllipsis = false;
				iTargetWidth = iTruncateWidth;
			}

			// truncate
			var sTruncatedText;
			var iNumberOfChar = this._geNumberOfTruncatedCharacters(iTextTotalLength, iTargetWidth, sSourceText);
			if (Core.getConfiguration().getRTL()) {
				var truncatePointRTL = sSourceText.length - iNumberOfChar;
				sTruncatedText = sSourceText.slice(truncatePointRTL, sSourceText.length).trim();
			} else {
				sTruncatedText = sSourceText.slice(0, iNumberOfChar).trim();
			}
			return {
				ellipsis: bShowEllipsis,
				truncatedText: sTruncatedText
			};
		}
		return null;
	};

	/**
	 * Gets the value of property <code>textAnchor</code>.
	 *
	 * @return {string} Value of property <code>textAnchor</code>.
	 * @public
	 */
	BaseText.prototype.getTextAnchor = function() {
		var sOriginalTextAnchor = this.getProperty("textAnchor");
		return sOriginalTextAnchor;
	};

	/**
	 * Calculate the number of text letters that can fit in the target length.
	 *
	 * First do a estimation based on the pixels each letter takes in screen and the target length,
	 * And compare three potential values (example: estimatedCount -1, estimatedCount, estimatedCount + 1) with the target length,
	 * IF one of the estimated values fit, then return
	 * ELSE do a binary search to find the most suitable number of text letters that can fit in the target length
	 *
	 * @param {number} iTextTotalLength Total length of the text
	 * @param {number} iTargetLength Truncated width of the text
	 * @param {string} sText Text to display
	 * @return {number} Number of characters that should be kept
	 * @private
	 */
	BaseText.prototype._geNumberOfTruncatedCharacters = function (iTextTotalLength, iTargetLength, sText) {
		var nCount = 0;
		if (iTextTotalLength > iTargetLength) {
			if (iTargetLength > 0 && sText.length > 0) {
				nCount = Math.round(iTargetLength / Math.ceil(iTextTotalLength / sText.length));
				while (true) { // eslint-disable-line no-constant-condition
					if (nCount < 0) { break; }
					var nLen1 = this.measureTextWidth(sText.slice(0, nCount));
					var nLen2 = this.measureTextWidth(sText.slice(0, nCount + 1));

					if (nLen1 > iTargetLength) { nCount--; continue; }
					if (nLen2 < iTargetLength) { nCount++; continue; }

					break;
				}
			}
		} else {
			return sText ? sText.length : 0;
		}
		return (nCount >= 0 && nCount <= sText.length) ? nCount : 0;
	};

	/**
	 * Measure the text length even text haven't been rendered.
	 *
	 * @private
	 *
	 * @param {string} txt Text to display
	 * @returns {Number} display width of the text
	 */
	BaseText.prototype.measureTextWidth = function(txt) {
		return GanttUtils.getShapeTextWidth(txt, this.getFontSize(), this.getFontFamily(), this.getFontWeight());
	};

	return BaseText;
}, true);
