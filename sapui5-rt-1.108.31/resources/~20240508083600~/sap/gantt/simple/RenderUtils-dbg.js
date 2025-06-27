/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

 // Provides helper sap.gantt.simple.GanttUtils
 sap.ui.define([
	"./AggregationUtils",
	"./GanttUtils",
	"sap/ui/core/Core",
	"../library",
	"sap/ui/Device",
	"../misc/Utility",
	"sap/ui/core/theming/Parameters",
	"../misc/Format"
], function (AggregationUtils, GanttUtils, Core, library, Device, Utility, Parameters, Format) {
	"use strict";
	var iDefaultFontSize  = 13;

	var horizontalTextAlignment = library.simple.horizontalTextAlignment;

	var RenderUtils = {
		apiVersion: 2,    // enable in-place DOM patching

		// Define the render buffer to improve the overall horizontal scrolling performance
		RENDER_EXTEND_FACTOR: 0.382,

		getGanttRenderWidth: function(oGantt) {
			var iVisibleWidth = jQuery(document.getElementById(oGantt.getId() + "-gantt")).width();
			return iVisibleWidth * (1 + 2 * RenderUtils.RENDER_EXTEND_FACTOR);
		},

		renderAttributes : function(oRm, oElement, aAttribute) {
			var aPropertiesa = aAttribute.map(function(prop){
				var sPropertyGetter = prop.split("-").reduce(function(prefix, name) {
					return prefix + name.charAt(0).toUpperCase() + name.slice(1);
				}, "get");
				return {
					name: prop,
					value: oElement[sPropertyGetter]()
				};
			});

			aPropertiesa.forEach(function(oAttr) {
				if (oAttr.value || oAttr.value === 0) {
					if (oAttr.name === "style") {
						var aStyles = oAttr.value.split(";");
						aStyles.forEach(function(sStyle){
							sStyle = sStyle.trim();
							if (sStyle != "") {
								var aStyle = sStyle.split(/:(.*)/);
								if (aStyle[0] === "fill" && (aStyle[1].indexOf(" ") != -1)) {
									aStyle[1] = encodeURI(aStyle[1]);
								}
								oRm.style(aStyle[0], aStyle[1]);
							}
						});
					} else {
						oRm.attr(oAttr.name, oAttr.value);
					}
				}
			});
		},

		renderTooltip: function(oRm, oElement) {
			if (oElement.getTooltip()) {
				oRm.openStart("title").openEnd();
				oRm.text(oElement.getTooltip());
				oRm.close("title");
			}
		},

		/**
		 * Shape selection model is the single truth on shape selection and since its selection change event
		 * won't rerender all shapes, here we need to to reset selected property values based on the selection model.
		 *
		 * @param {sap.gantt.simple.GanttChartWithTable} oGantt Gantt chart instance
		 * @param {array} aSelectedShapeUid array of selected shape UIDs
		 * @param {array} aDeselectedShapeUid array of deselected shape UIDs
		 *
		 * @private
		 */
		updateShapeSelections: function(oGantt, aSelectedShapeUid, aDeselectedShapeUid) {
			if (oGantt._getResizeExtension == null) {
				// Gantt Extensions only available after GanttChart fully rendered. If the extension is not there
				// means the control haven't been rendered yet, thus skip update the selection outline
				return;
			}
			var oResizeExtension = oGantt._getResizeExtension();
			var sGanttId = oGantt.getId();

			GanttUtils.getShapesWithUid(sGanttId, aDeselectedShapeUid).forEach(function(oElement) {
				if (oElement) {
					this._bShapeSelectionProperties = false;
					this._hasShapeSelectionProperties(oElement, oGantt);
					if (this._bShapeSelectionProperties) {
						this._updateShapeStyle(oElement, false, oGantt, 0);
					}
					if (oElement.isA("sap.gantt.simple.shapes.Shape")) {
						oElement.setSelected(false);
					} else if (oElement.getParent().isA("sap.gantt.simple.BaseConditionalShape")){
						oElement.getParent().setProperty("selected", false, true);
					} else {
						oElement.setProperty("selected", false, true);
					}
				}
			}.bind(this));

			oResizeExtension.clearAllOutline(sGanttId);

			GanttUtils.getShapesWithUid(sGanttId, aSelectedShapeUid).forEach(function(oElement) {
				if (oElement) {
					if (oElement.getProperty("selectable")) {
						this._bShapeSelectionProperties = false;
						this._hasShapeSelectionProperties(oElement, oGantt);
						if (this._bShapeSelectionProperties) {
							this._updateShapeStyle(oElement, true, oGantt, 0);
						}
						if (oElement.isA("sap.gantt.simple.shapes.Shape")) {
							oElement.setSelected(true);
						} else if (oElement.getParent().isA("sap.gantt.simple.BaseConditionalShape")){
							oElement.getParent().setProperty("selected", true, true);
							oResizeExtension.toggleOutline(oElement);
						} else {
							// it's possible that the shape element is scrolling outside of visible area
							oElement.setProperty("selected", true, true);
							oResizeExtension.toggleOutline(oElement);
						}
					}
					oGantt.getSelection().updateProperties(oElement.getShapeUid(), {
						draggable: oElement.getDraggable(),
						time: oElement.getTime(),
						endTime: oElement.getEndTime()
					});
				}
			}.bind(this));
		},

		/**
		 * Checks whether the shape has selectedFill or selectedTitleColor property set at any level
		 */
		_hasShapeSelectionProperties: function(oShape, oGantt) {
			if (!oShape || oShape.isA("sap.gantt.simple.Relationship")) {
				return;
			}
			if (oShape.isA("sap.gantt.simple.BaseConditionalShape")) {
				oShape = oShape._getActiveShapeElement();
			}
			if (oShape && (oShape.getSelectedFill() || oShape.getSelectedTitleColor())) {
				this._bShapeSelectionProperties = true;
			} else if (oShape instanceof sap.gantt.simple.BaseGroup) {
				if (oGantt.getSelectOnlyGraphicalShape()) {
					oShape._eachChildOfGroup(oShape, function (labelGroup, nonLabelGroup) {
						nonLabelGroup.forEach(function(oChild) {
							if (!this._bShapeSelectionProperties) {
								this._hasShapeSelectionProperties(oChild, oGantt);
							}
						}.bind(this));
					}.bind(this));
				} else {
					oShape._eachChildOfGroup(oShape, function (oChild) {
						if (!this._bShapeSelectionProperties) {
							this._hasShapeSelectionProperties(oChild, oGantt);
						}
					}.bind(this));
				}
			}
		},

		/**
		 * Helper function to update shape's fill and title color based on the shape type.
		 * @private
		 */
		_updateShapeStyle: function(oShape, bSelected, oGantt, iGroupShapeIndex, oShapeDomRef, mParentStyle) {
			if (!oShape || oShape.isA("sap.gantt.simple.Relationship") || !oShape.getVisible()) {
				return;
			}
			if (oShape.isA("sap.gantt.simple.BaseConditionalShape") && oShape._getActiveShapeElement()) {
				this._updateShapeStyle(oShape._getActiveShapeElement(), bSelected, oGantt, iGroupShapeIndex, oShapeDomRef, mParentStyle);
			} else if (oShape.isA("sap.gantt.simple.BaseGroup")) {
				if (oGantt.getSelectOnlyGraphicalShape()) {
					// update non label group shapes
					oShape._eachChildOfGroup(oShape, function (labelGroup, nonLabelGroup) {
						nonLabelGroup.forEach(function(oChild) {
							var iUpdatedIndex = this._updateGroupShapeStyle(oChild, bSelected, oGantt, iGroupShapeIndex, oShapeDomRef, mParentStyle);
							iGroupShapeIndex = iUpdatedIndex;
						}.bind(this));
					}.bind(this));
				} else {
					// update all shapes
					oShape._eachChildOfGroup(oShape, function (oChild) {
						var iUpdatedIndex = this._updateGroupShapeStyle(oChild, bSelected, oGantt, iGroupShapeIndex, oShapeDomRef, mParentStyle);
						iGroupShapeIndex = iUpdatedIndex;
					}.bind(this));
				}
			} else {
				this._updateShapeSelectionStyle(oShape, bSelected, oShapeDomRef, mParentStyle);
			}
		},

		/**
		 * Helper function to update individual shape's fill and title color incase of basegroup.
		 * @private
		 */
		_updateGroupShapeStyle: function (oShape, bSelected, oGantt, iGroupShapeIndex, oShapeDomRef, mParentStyle) {
			if (!oShape || oShape.isA("sap.gantt.simple.Relationship") || !oShape.getVisible()) {
				return iGroupShapeIndex;
			}
			mParentStyle = mParentStyle || {};
			var oParentShape = oShape.getParent();
			var sCurrentParentFill = oParentShape.getFill() || mParentStyle.fill;
			var sCurrentParentTitleColor = oParentShape.getTitleColor() || mParentStyle.titleColor;
			var sCurrentParentSelectedFill = oParentShape.getSelectedFill() || mParentStyle.selectedFill;
			var sCurrentParentSelectedTitleColor = oParentShape.getSelectedTitleColor() || mParentStyle.selectedTitleColor;
			var docElement = oParentShape.getDomRef("nonLabelGroup") ? oParentShape.getDomRef("nonLabelGroup") : oParentShape.getDomRef() || oShapeDomRef;
			if (docElement) {
				var aChildren = docElement.children || docElement.childNodes;
				while (iGroupShapeIndex < aChildren.length && aChildren[iGroupShapeIndex].tagName === "title") {
					iGroupShapeIndex += 1;
				}
				this._bUpdatedTitle = false;
				var bGroupShape = oShape.isA("sap.gantt.simple.BaseGroup") || (oShape.isA("sap.gantt.simple.BaseConditionalShape") && oShape._getActiveShapeElement() && oShape._getActiveShapeElement().isA("sap.gantt.simple.BaseGroup"));
				var iIndex = bGroupShape ? 0 : iGroupShapeIndex;
				var mParentShapeStyle = {
					fill: sCurrentParentFill,
					titleColor: sCurrentParentTitleColor,
					selectedFill: sCurrentParentSelectedFill,
					selectedTitleColor: sCurrentParentSelectedTitleColor
				};
				this._updateShapeStyle(oShape, bSelected, oGantt, iIndex, docElement.children[iGroupShapeIndex], mParentShapeStyle);
				var iIncrementIndex = (this._bUpdatedTitle && !bGroupShape) ? 2 : 1;
				iGroupShapeIndex += iIncrementIndex;
			}
			return iGroupShapeIndex;
		},

		/**
		 * Update shape's fill and title color based on shape selected/deselected.
		 * If shape is of type BaseText, selectedTitleColor is given precedence over selectedFill.
		 * If shape is a child of basegroup and the selection properties are not set, then the parent's selection properties are considered.
		 *
		 * @param {sap.gantt.simple.BaseShape} oShape shape's instance
		 * @param {boolean} bSelected true if the shape is selected, false otherwise
		 * @param {object} oShapeDomRef shape's dom reference
		 * @param {object} mParentStyle parent shape's style properties: fill color, title color, selectedFill, selectedTitleColor
		 *
		 * @private
		 */
		_updateShapeSelectionStyle: function (oShape, bSelected, oShapeDomRef, mParentStyle) {
			mParentStyle = mParentStyle || {};
			var sOriginalFill = oShape.getFill() || mParentStyle.fill;
			var sOriginalTitleColor = oShape.getTitleColor() || mParentStyle.titleColor;
			var sFill = bSelected ? (oShape.getSelectedFill() || mParentStyle.selectedFill || sOriginalFill) : sOriginalFill;
			var sThemeTextColor = Parameters.get("sapUiBaseText");
			var sColor = oShape.isA("sap.gantt.simple.BaseText") ? (sOriginalTitleColor || sOriginalFill || sThemeTextColor) : (sOriginalTitleColor || sThemeTextColor);
			var sTextFill =  oShape.isA("sap.gantt.simple.BaseText") ? (oShape.getSelectedFill() || mParentStyle.selectedFill) : null;
			var sTitleColor = bSelected ? (oShape.getSelectedTitleColor() || mParentStyle.selectedTitleColor || sTextFill || sColor) : sColor;
			var oShapeDom = oShapeDomRef ? oShapeDomRef : document.getElementById(oShape.getId());
			if (oShapeDom) {
				oShapeDom.style.fill =  oShape.isA("sap.gantt.simple.BaseText") ? sTitleColor : sFill;
				var oTitleDom = oShapeDom.nextSibling;

				if (oTitleDom && oTitleDom.tagName === "text" && oShape.getShowTitle() && oShape.getTitle()) {
					oTitleDom.style.fill = sTitleColor;
					this._bUpdatedTitle = true;
				}
			}
		},

		/**
		 *  Highlight property values based on the highlight model.
		 * @param {sap.gantt.simple.GanttChartWithTable} oGantt Gantt chart instance
		 * @param {array} aHighlightedShapeUid Highlighted shape UID
		 * @param {array} deEmphasizedShapeUid De-emphasized shape UID
		 * @since 1.100
		 * @private
		 */
		updateShapeHighlights: function(oGantt, aHighlightedShapeUid, deEmphasizedShapeUid) {
			if (oGantt._getResizeExtension == null) {
				// Gantt Extensions only available after GanttChart fully rendered. If the extension is not there
				// means the control haven't been rendered yet, thus skip updating the highlight outline
				return;
			}
			var oResizeExtension = oGantt._getResizeExtension();
			var sGanttId = oGantt.getId();

			GanttUtils.getShapesWithUid(sGanttId, deEmphasizedShapeUid).forEach(function(oElement) {
				if (oElement) {
					if (oElement.isA("sap.gantt.simple.shapes.Shape")) {
						oElement.setHighlighted(false);
					} else if (oElement.getParent().isA("sap.gantt.simple.BaseConditionalShape")){
						oElement.getParent().setProperty("highlighted", false, true);
					} else {
						oElement.setProperty("highlighted", false, true);
					}
				}
			});

			oResizeExtension.clearAllHighlight(sGanttId);

			GanttUtils.getShapesWithUid(sGanttId, aHighlightedShapeUid).forEach(function(oElement) {
				if (oElement) {
					if (oElement.getProperty("highlightable")) {
						if (oElement.isA("sap.gantt.simple.shapes.Shape")) {
							oElement.setHighlighted(true);
						} else if (oElement.getParent().isA("sap.gantt.simple.BaseConditionalShape")){
							oElement.getParent().setProperty("highlighted", true, true);
							oResizeExtension.toggleHighlight(oElement);
						} else {
							// it's possible that the shape element is scrolling outside of visible area
							oElement.setProperty("highlighted", true, true);
							oResizeExtension.toggleHighlight(oElement);
						}
					}
					oGantt.getHighlight().updateProperties(oElement.getShapeUid(), {
						time: oElement.getTime(),
						endTime: oElement.getEndTime()
					});
				}
			});
		},

		/**
		 * select/deselect shape based on selection model objectID.
		 * @param {sap.gantt.simple.GanttChartWithTable} oGantt Gantt chart instance
		 * @param {string[]} aSelectedShapeID array of selected shape ObjectId.
		 * @private
		 */
		updateShapeSelectionByShapeID: function (oGantt, deSelectAll) {
			if (oGantt._getResizeExtension == null) {
				// Gantt Extensions only available after GanttChart fully rendered. If the extension is not there
				// means the control haven't been rendered yet, thus skip update the selection outline
				return;
			}
			var aSelectedShapeID = oGantt.getSelection().getSelectedShapeIDS();
			var aDeselectedShapeId = oGantt.getSelection().getDeSelectedShapeIDS();
			var aSelectionRowID = oGantt.getSelection().getSelectedRowIDS();
			var aDeselectionRowID = oGantt.getSelection().getDeSelectedRowIDS();
			if (aSelectedShapeID && aSelectedShapeID.length > 0) {
				this._updateShapeSelection(oGantt, aSelectedShapeID, true);
			}
			if (aSelectionRowID && aSelectionRowID.length > 0) {
				this._updateRowSelection(oGantt, aSelectionRowID, true);
			}
			if (aDeselectedShapeId && aDeselectedShapeId.length > 0) {
				this._updateShapeSelection(oGantt, aDeselectedShapeId, false);
			}
			if (aDeselectionRowID && aDeselectionRowID.length > 0) {
				this._updateRowSelection(oGantt, aDeselectionRowID, false, deSelectAll);
			}
		},

		_updateShapeSelection: function(oGantt, aShapeID, select) {
			var sGanttId = oGantt.getId();
			if (!select) {
				aShapeID.forEach(function(oItem){
					oGantt.oSelection.mSelected.deSelectShapeId[oItem] = {
						selected: select
					};
                });
			}
			GanttUtils.getShapeByShapeId(sGanttId, aShapeID).forEach(function(oElement) {
				this._updateShapes(oElement, select, oGantt);
			}.bind(this));
		},

		_updateRowSelection: function(oGantt, aShapeID, select, deSelectAll) {
			var sGanttId = oGantt.getId();
			var searchText = oGantt.searchTxt;
			if (!select) {
				searchText = oGantt.deSelectTxt;
			}
			if (deSelectAll) {
				GanttUtils.getShapesInRowsById(sGanttId, aShapeID).forEach(function(oElement) {
					if (oElement && (!select || oElement.getProperty("selectable"))) {
						//updating shapeId to shapeSelection Model.
						if (oElement.mProperties.shapeId) {
							oGantt.getSelection().updateShapeId(oElement.getShapeId(), select);
						}
						this._updateShapes(oElement, select, oGantt);
					}
				}.bind(this));
			} else if (searchText !== null && searchText !== undefined) {
				GanttUtils.getShapesInRowsById(sGanttId, aShapeID).forEach(function(oElement) {
					if (oElement) {
						var isShapeSelectable = this._selectShapeBySearchText(oGantt, oElement, select);
						if (isShapeSelectable && (!select || oElement.getProperty("selectable"))) {
							//updating shapeId to shapeSelection Model.
							if (oElement.mProperties.shapeId) {
								oGantt.getSelection().updateShapeId(oElement.getShapeId(), select);
							}
							this._updateShapes(oElement, select, oGantt);
							if (!select) {
								oGantt.getSelection().clearSelectionByUid(oElement.getShapeUid());
							}
						}
					}
				}.bind(this));
			}
		},

		_updateShapes: function(oElement, select, oGantt) {
			oElement.setProperty("selected", select, true);
			if (select) {
				oGantt.getSelection().updateProperties(oElement.getShapeUid(), {
					draggable: oElement.getDraggable(),
					time: oElement.getTime(),
					endTime: oElement.getEndTime()
				}, true);
			} else {
				oGantt.getSelection().clearSelectionByUid(oElement.getShapeUid());
			}
		},

		/**
		 * highlight/de-emphasize shape based on highlight model objectID.
		 * @param {sap.gantt.simple.GanttChartWithTable} oGantt Gantt chart instance
		 * @param {string[]} deEmphasizeAll array of highlighted shape ObjectId.
		 * @private
		 */
		updateShapeHighlightByShapeID: function (oGantt, deEmphasizeAll) {
			if (oGantt._getResizeExtension == null) {
				// Gantt Extensions only available after GanttChart fully rendered. If the extension is not there
				// means the control haven't been rendered yet, thus skip update the highlight outline
				return;
			}
			var aHighlightedShapeID = oGantt.getHighlight().getHighlightedShapeID();
			var aDeEmphasizedShapeID = oGantt.getHighlight().getDeEmphasizedShapeID();

			if (aHighlightedShapeID && aHighlightedShapeID.length > 0) {
				this._updateShapeHighlight(oGantt, aHighlightedShapeID, true);
			}

			if (aDeEmphasizedShapeID && aDeEmphasizedShapeID.length > 0) {
				this._updateShapeHighlight(oGantt, aDeEmphasizedShapeID, false);
			}
		},

		_updateShapeHighlight: function(oGantt, aShapeID, highlight) {
			var sGanttId = oGantt.getId();
			GanttUtils.getShapeByShapeId(sGanttId, aShapeID).forEach(function(oElement) {
				this._updateShapeAttributes(oElement, highlight, oGantt);
			}.bind(this));
		},

		_updateShapeAttributes: function(oElement, highlight, oGantt) {
			oElement.setProperty("highlighted", highlight, true);
			if (highlight) {
				oGantt.getHighlight().updateProperties(oElement.getShapeUid(), {
					time: oElement.getTime(),
					endTime: oElement.getEndTime()
				}, true);
			} else {
				oGantt.getHighlight().clearHighlightByUid(oElement.getShapeUid());
			}
		},

		_selectShapeBySearchText: function(oGantt, oShape, select) {
			var propertyMatched = false;
			var sModelName = oGantt.getTable().getBindingInfo("rows").model;
			var propertyName = oGantt.searchProperty;
			if (!select) {
				propertyName = oGantt.deSelectProperty;
			}
			function isMatched (val) {
				if (select) {
					oGantt.searchTxt.forEach(function(searchValue){
						if (val !== undefined &&
							val !== null &&
							val.toString().toLowerCase().indexOf(searchValue.toString().toLowerCase()) !== -1){
								propertyMatched = true;
						}
					});
				} else {
					if (val !== undefined &&
						val !== null &&
						val.toString().toLowerCase().indexOf(oGantt.deSelectTxt.toString().toLowerCase()) !== -1){
							propertyMatched = true;
					}
				}
			}
			if (Array.isArray(propertyName) && propertyName.length > 0) {
				propertyName.forEach(function(propertyName) {
					if (propertyMatched) { return; }
					var value = oShape.getBindingContext(sModelName).getProperty(propertyName);
					isMatched(value);
				});
			} else if (typeof propertyName === "string") {
				var value = oShape.getBindingContext(sModelName).getProperty(propertyName);
				isMatched(value);
			} else {
				var odata = oShape.getBindingContext(sModelName).getObject();
				if (odata) {
					Object.keys(odata).forEach(function(propName) {
						if (propertyMatched) { return; }
						isMatched(odata[propName]);
					});
				}
			}
			return propertyMatched;
		},

		getShapeElementByTarget : function(target) {
			return jQuery(this.getDraggableDOMElement(target)).control(0, true);
		},
		getDraggableDOMElement : function(target) {
			return jQuery(target).closest("[" + GanttUtils.SHAPE_ID_DATASET_KEY + "]").get(0);
		},

		// Adds titleSpacing property to title's x coordinate
		addTitleSpacing: function(mTextSettings, bRTL) {
			if (mTextSettings.titleSpacing) {
				mTextSettings.x = bRTL ?  mTextSettings.x - mTextSettings.titleSpacing : mTextSettings.x + mTextSettings.titleSpacing;
			}
		},
		/**
		 * Render the <text> SVG element for shapes which has title and showTitle properties
		 *
		 * If the shape is a Chevron, then need to consider it's headWith and tailWidth
		 *
		 * @param {sap.ui.core.RenderManager} oRm Render Manager
		 * @param {sap.gantt.simple.BaseShape} oElement shape instance
		 * @param {Function} fTitleCreator reference to create BaseText instance
		 */
		renderElementTitle : function(oRm, oElement, fTitleCreator) {
			if (oElement.getShowTitle == null || !oElement.getShowTitle()) { return; }

			var sTitle = oElement.getTitle();

			if (sTitle) {
				/* eslint-disable no-unused-vars */
				var iHead = 0, iEllipseWidth = 0, iShapeWidth = 0;

				if (oElement.getWidth) {
					iEllipseWidth = oElement.getWidth();
					iShapeWidth = oElement.getWidth(); //Set the Width of the shape.
				}

				if (oElement.getHeadWidth) {
					iHead = oElement.getHeadWidth();
					iEllipseWidth -= iHead;
				}

				if (oElement.getTailWidth) {
					iEllipseWidth -= oElement.getTailWidth();
				}

				var iCornerPaddingPixel = 2 + iHead;
				var mTextSettings = {
					text: sTitle,
					fill: oElement.getTitleColor() || Parameters.get("sapUiBaseText"),
					showEllipsis: true,
					truncateWidth: iEllipseWidth - oElement.getTitleSpacing(),
					textAnchor: oElement.getHorizontalTextAlignment().toLowerCase(),
					verticalTextAlignment: oElement.getVerticalTextAlignment(),
					fontWeight: oElement.getFontWeight(),
					fontFamily: oElement.getFontFamily(),
					fontSize: oElement.getFontSize() || iDefaultFontSize
				};
				var bRTL = Core.getConfiguration().getRTL();

				if (oElement.getTitleSpacing()) {
					if (mTextSettings.textAnchor === horizontalTextAlignment.End.toLowerCase()) {
						mTextSettings.titleSpacing = -oElement.getTitleSpacing();
					} else {
						mTextSettings.titleSpacing = oElement.getTitleSpacing();
					}
				}

				if (mTextSettings.textAnchor === horizontalTextAlignment.Start.toLowerCase()) {
					mTextSettings.x = bRTL ? oElement.getX() + oElement.getWidth() - iCornerPaddingPixel : oElement.getX() + iCornerPaddingPixel;
					this.setVerticalAlignment(oElement, mTextSettings);
				} else if (mTextSettings.textAnchor === horizontalTextAlignment.End.toLowerCase()) {
					mTextSettings.x = bRTL ? oElement.getX() + iCornerPaddingPixel : oElement.getX() + oElement.getWidth() - iCornerPaddingPixel;
					this.setVerticalAlignment(oElement, mTextSettings);
				} else if (mTextSettings.textAnchor === horizontalTextAlignment.Middle.toLowerCase()) {
					mTextSettings.x = oElement.getX() + oElement.getWidth() / 2;
					this.setVerticalAlignment(oElement, mTextSettings);
				} else if (mTextSettings.textAnchor === horizontalTextAlignment.Dynamic.toLowerCase()) {
					this.renderDynamicText(oElement, mTextSettings, iCornerPaddingPixel);
					this.setVerticalAlignment(oElement, mTextSettings);
				}
				// add xBias and yBias to the x and y coordinates of the text
				var mBias = Utility.getShapeBias(oElement);
				mTextSettings.x = mTextSettings.x + mBias.x;
				mTextSettings.y = mTextSettings.y + mBias.y;

				this.addTitleSpacing(mTextSettings, bRTL);
				var oTitle = fTitleCreator(mTextSettings).addStyleClass("sapGanttTextNoPointerEvents");
				oTitle.setProperty("childElement", true, true);
				oTitle.renderElement(oRm, oTitle);
			}
		},

		renderCalenderTitle : function(oRm, oNode, ti, fTitleCreator) {
			var sTitle = oNode.title;
			var aBaseCalender = oNode.baseCalender;

			if (sTitle) {
				var iEllipseWidth = 0, iShapeWidth = 0;

				if (ti.width) {
					iEllipseWidth = ti.width;
					iShapeWidth = ti.width; //Set the Width of the shape.
				}

				var mTextSettings = {
					text: sTitle,
					fill: aBaseCalender.getTitleColor() || Parameters.get("sapUiBaseText"),
					showEllipsis: true,
					truncateWidth: iEllipseWidth - aBaseCalender.getTitleSpacing(),
					textAnchor: aBaseCalender.getHorizontalTextAlignment(),
					verticalTextAlignment: aBaseCalender.getVerticalTextAlignment(),
					fontWeight: aBaseCalender.getFontWeight(),
					fontSize: aBaseCalender.getFontSize() || iDefaultFontSize,
					fontFamily: aBaseCalender.getFontFamily()
				};
				var bRTL = Core.getConfiguration().getRTL();

				if (aBaseCalender.getTitleSpacing()) {
					if (mTextSettings.textAnchor.toLowerCase() === horizontalTextAlignment.End.toLowerCase()) {
						mTextSettings.titleSpacing = -aBaseCalender.getTitleSpacing();
					} else {
						mTextSettings.titleSpacing = aBaseCalender.getTitleSpacing();
					}
				}

				if (mTextSettings.textAnchor.toLowerCase() === horizontalTextAlignment.Start.toLowerCase()) {
					mTextSettings.x = bRTL ? ti.x + ti.width : ti.x;
				} else if (mTextSettings.textAnchor.toLowerCase() === horizontalTextAlignment.End.toLowerCase()) {
					mTextSettings.x = bRTL ? ti.x : ti.x + ti.width;
				} else if (mTextSettings.textAnchor.toLowerCase() === horizontalTextAlignment.Middle.toLowerCase()) {
					mTextSettings.x = ti.x + ti.width / 2;
				} else if (mTextSettings.textAnchor.toLowerCase() === horizontalTextAlignment.Dynamic.toLowerCase()) {
					this.renderDynamicText(aBaseCalender, mTextSettings, 0, ti);
				}

				if (mTextSettings.verticalTextAlignment === "Top") {
					mTextSettings.y = (ti.height / 2) - 1;
				} else if (mTextSettings.verticalTextAlignment === "Bottom") {
					mTextSettings.y = (ti.height / 2) + mTextSettings.fontSize - 1;
				} else {
					mTextSettings.y = (ti.height / 2) + (mTextSettings.fontSize / 2) - 1;
				}

				this.addTitleSpacing(mTextSettings, bRTL);
				var oTitle = fTitleCreator(mTextSettings).addStyleClass("sapGanttTextNoPointerEvents");
				oTitle.setProperty("childElement", true, true);
				oTitle.renderElement(oRm, oTitle);
			}
		},

		//Set y coordinate for the text to be displayed in LTR & RTL mode.
		setVerticalAlignment: function(oElement, mTextSettings) {
			//Alignment of title within the shape based on AlignShape
			if (mTextSettings.verticalTextAlignment === "Top") {
				mTextSettings.y = oElement.getY() + mTextSettings.fontSize - 1;
			} else if (mTextSettings.verticalTextAlignment === "Bottom") {
				mTextSettings.y = oElement.getY() + parseInt(oElement.getHeight(), 10) - 1;
			} else {
				mTextSettings.y = oElement.getY() + (parseInt(oElement.getHeight() / 2, 10)) + (mTextSettings.fontSize / 2.5);
			}
		},

		renderDynamicText: function (oElement, mTextSettings, iCornerPaddingPixel, calDefs) {
			var bRTL = Core.getConfiguration().getRTL();
			var oVisibleStartTime = Format.abapTimestampToDate(oElement.getAxisTime()._oZoomStrategy.getVisibleHorizon().getStartTime());
			var iX;
			if (calDefs) {
				mTextSettings.x = bRTL ? calDefs.x + calDefs.width - iCornerPaddingPixel : calDefs.x + iCornerPaddingPixel;
				iX = mTextSettings.x;
				if (calDefs.x < oElement.getAxisTime().timeToView(oVisibleStartTime) &&
					(calDefs.x + calDefs.width) > oElement.getAxisTime().timeToView(oVisibleStartTime)) {
					mTextSettings.x =  bRTL ? oElement.getAxisTime().timeToView(oVisibleStartTime) - iCornerPaddingPixel : oElement.getAxisTime().timeToView(oVisibleStartTime) + iCornerPaddingPixel;
					mTextSettings._shapeCropped = true;
					mTextSettings._xBiassed = mTextSettings.x - iX;
				}
			} else {
				mTextSettings.x = bRTL ? oElement.getX() + oElement.getWidth() - iCornerPaddingPixel : oElement.getX() + iCornerPaddingPixel;
				iX = mTextSettings.x;
				if ((oElement.getTime() < oVisibleStartTime) && oElement.getEndTime() > oVisibleStartTime){
					mTextSettings.x =  bRTL ? oElement.getAxisTime().timeToView(oVisibleStartTime) - iCornerPaddingPixel : oElement.getAxisTime().timeToView(oVisibleStartTime) + iCornerPaddingPixel;
					mTextSettings._shapeCropped = true;
					mTextSettings._xBiassed = mTextSettings.x - iX;
				}
			}
		},

		renderInlineShapes : function(oRm, oRowSetting, oGantt) {
			var sTopRowClassName = oRowSetting.getId() + "-top";
			var sRowClassName = oRowSetting.getId() + "-row";

			oRm.openStart("g", oRowSetting);
			oRm.class(sTopRowClassName);
			oRm.attr("data-sap-ui-related", oRowSetting.getParent().getId());
			oRm.openEnd();
				oRm.openStart("g");
				// set default rowId to empty string to prevent assertion failure
				oRm.attr(GanttUtils.ROW_ID_DATASET_KEY, oRowSetting.getRowId() || "");
				oRm.class(sRowClassName);
				oRm.openEnd();

				this.renderMainRowAllShapes(oRm, oRowSetting, oGantt);

				oRm.close("g");
			oRm.close("g");
		},

		renderMainRowAllShapes: function(oRm, oRowSetting, oGantt){
			var aRowStates = oGantt.getSyncedControl().getRowStates();
			var mPosition = this.calcRowDomPosition(oRowSetting, aRowStates),
				iMainRowYCenter = mPosition.rowYCenter,
				iRowHeight = mPosition.rowHeight;

			var mAggregations = AggregationUtils.getAllNonLazyAggregations(oRowSetting);
			var aShapesInRow = Object.keys(mAggregations).filter(function(sName){
				// skip calendars due to special rendering order
				return (sName.indexOf("calendars") === -1) && sName !== "relationships";
			}).map(function(sName){ // eslint-disable-line
				// get all binding aggregation instances and default to empty array
				return oRowSetting.getAggregation(sName) || [];
			}.bind(oRowSetting));

			var sRowUid = oRowSetting.getRowUid(),
				oSelectionModel = oGantt.oSelection,
				oHighlightModel = oGantt.oHighlight,
				oExpandModel    = oGantt._oExpandModel,
				oAxisTime       = oGantt.getAxisTime(),
				bHasExpandShape = oExpandModel.isRowExpanded(sRowUid);

			aShapesInRow.forEach(function(aShapes, iIndex){
				aShapes.forEach(function(oShape){

					if (oGantt.isShapeVisible(oShape)) {
						RenderUtils.renderMainRowShape(oRm, oShape, {
							expandModel: oExpandModel,
							selectionModel: oSelectionModel,
							highlightModel: oHighlightModel,
							axisTime: oAxisTime,
							rowSetting: oRowSetting,
							rowUid: sRowUid,
							rowExpanded: bHasExpandShape,
							mainRowYCenter: iMainRowYCenter,
							rowHeight: iRowHeight
						}, (oGantt.getShowParentRowOnExpand() && !oGantt.getUseParentShapeOnExpand()));
					}
				});
			});
		},

		renderMainRowShape : function(oRm, oShape, mOption, bShowParentRow) {
			// passing the mOption to save unnecessary calculation because of it's always the same for the row
			this.setSpecialProperties(oShape, mOption);

			// render main row shap in RenderManager
			// oShape.renderElement(oRm, oShape, null);
			if ((Object.keys(mOption.expandModel.mExpanded).indexOf(mOption.rowUid) == -1  && !mOption.rowExpanded) || bShowParentRow){
				oShape.renderElement(oRm, oShape, null);
			}

			if (mOption.rowExpanded) {
				// just in case the main row shapes had expanded shapes
				this.renderExpandShapesIfNecessary(oRm, oShape, mOption, bShowParentRow);
			}
		},

		setSpecialProperties: function(oShape, mOption) {
			var oExpandModel = mOption.expandModel,
				sRowUid = mOption.rowUid,
				sShapeUid = mOption.rowSetting.getShapeUid(oShape),
				oTable = oShape.getParentRowSettings().getParent().getParent(),
				oGantt = oTable.getParent();

			if (!oShape._iBaseRowHeight) {
				oShape._iBaseRowHeight = oExpandModel.getBaseRowHeight();
				var mAggregations = AggregationUtils.getNonLazyAggregations(oShape);
				Object.keys(mAggregations).filter(function(sName){
					var oAggregation = mAggregations[sName];
					if (oAggregation.appData !== null) {
						return oAggregation.appData.sapGanttOrder === 1;
					}
				}).map(function(sName) {
					if (sName === "utilizationBar" || sName === "utilizationLine") {
						oShape._iBaseRowHeight = oShape._iBaseRowHeight - 1;
					}
				});
			}
			oShape.mAxisTime = mOption.axisTime;
			oShape.setProperty("shapeUid", sShapeUid, true);
			if (oShape.getProperty("selectable")) {
				oShape.setProperty("selected", mOption.selectionModel.existed(sShapeUid), true);
			}
			if (oShape.getProperty("highlightable")) {
				oShape.setProperty("highlighted", mOption.highlightModel.existed(sShapeUid), true);
			}
			oShape.setProperty("rowYCenter", oExpandModel.getRowYCenterByUid(sRowUid, mOption.mainRowYCenter, oShape.getScheme(), 0, oGantt), true);
		},

		/**
		 * Check whether the given d is valid.
		 *
		 * @param {string} sD attribute of this path
		 * @return {boolean} whether the given d is valid
		 */
		isValidD: function(sD) {
			return !!sD && sD.indexOf("NaN") === -1 && sD.indexOf("undefined") === -1 && sD.indexOf("null") === -1;
		},

		renderExpandShapesIfNecessary : function(oRm, oMainShape, mOption, bShowParentRow) {
			var lastVisibleShapeIndex;
			var oTable = oMainShape.getParentRowSettings().getParent().getParent(),
			    oGantt = oTable.getParent();

			var fnRenderExpandShape = function(aShapes) {
				if (!aShapes || aShapes.length === 0) {
					return;
				}
				var aExpandedShapes = aShapes;
				if (jQuery.isArray(aShapes) === false) {
					aExpandedShapes = [aShapes];
				}

				// Calculates the level of each shape and stores it as part of the shape.
				GanttUtils.calculateLevelForShapes(aExpandedShapes, "time", "endTime");

				aExpandedShapes.forEach(function(oShape, iIndex){
					if (oShape._level) {
						iIndex = oShape._level - 1;
					}
					var iRowYCenter = bShowParentRow ?  mOption.expandModel.getRowYCenterByUid(mOption.rowUid, null, oShape.getScheme(), iIndex, oGantt) : mOption.expandModel.getRowYCenterByUid(mOption.rowUid, null, oShape.getScheme(), iIndex, oGantt) - mOption.expandModel.getBaseRowHeight();
					oShape.setProperty("rowYCenter", iRowYCenter, true);
					oShape._iBaseRowHeight = mOption.expandModel.getExpandShapeHeightByUid(mOption.rowUid, oShape.getScheme(), mOption.iRowHeight);
					oShape.setProperty("shapeUid", mOption.rowSetting.getShapeUid(oShape), true);

					// render expanded shapes
					oShape.renderElement(oRm, oShape);
				});
			};
			oMainShape._isSubTasks = oMainShape.mBindingInfos.hasOwnProperty("subTasks") || (typeof oMainShape.getSubTasks === "function" && oMainShape.getSubTasks());
			if (oGantt.getUseParentShapeOnExpand()) {
				//experimental code
				var aExpandableShapes = oMainShape.getParent().getAllExpandableShapes();
				var sShapeScheme = oMainShape.getScheme();
				var sStartDate;
				var sEndDate;
				aExpandableShapes.forEach(function(shape, index) {
					if (oGantt.isShapeVisible(shape)) {
						lastVisibleShapeIndex = index;
					}
				});
				var lastVisibleShape = aExpandableShapes[lastVisibleShapeIndex];
				// render subshapes only after all visible shapes are rendered
				if (oMainShape === lastVisibleShape) {
					var childArraay = [];
					aExpandableShapes.forEach(function(oMainshape){
						var aChild = AggregationUtils.getNonLazyElementsByScheme(oMainshape, sShapeScheme);
						aChild.forEach(function(oChild) {
							//For BaseConditionalShape
							if (oChild instanceof sap.gantt.simple.BaseConditionalShape) {
								var oActiveShape = oChild._getActiveShapeElement();

								if (oActiveShape instanceof sap.gantt.simple.BaseGroup) {
									sStartDate = null;
									sEndDate = null;
									oActiveShape.getShapes().forEach(function(oShape) {
										if (!sStartDate && !sEndDate) {
											sStartDate = oShape.getTime();
											sEndDate = oShape.getEndTime();
										} else {
											if (oShape.getTime() >= sStartDate) {
												sStartDate = sStartDate;
											} else {
												sStartDate = oShape.getTime();
											}
											if (oShape.getEndTime() >= sEndDate) {
												sEndDate = oShape.getEndTime();
											} else {
												sEndDate = sEndDate;
											}
										}
									});
									oActiveShape.setTime(sStartDate);
									oActiveShape.setEndTime(sEndDate);
									childArraay = childArraay.concat(oActiveShape);
								} else if (oActiveShape) {
									childArraay = childArraay.concat(oActiveShape);
									}
							} else if (oChild instanceof sap.gantt.simple.BaseGroup) {	//For BaseGroup
								sStartDate = null;
								sEndDate = null;
								oChild.getShapes().forEach(function(oShape) {
									if (!sStartDate && !sEndDate) {
										sStartDate = oShape.getTime();
										sEndDate = oShape.getEndTime();
									} else {
										if (oShape.getTime() >= sStartDate) {
											sStartDate = sStartDate;
										} else {
											sStartDate = oShape.getTime();
										}
										if (oShape.getEndTime() >= sEndDate) {
											sEndDate = oShape.getEndTime();
										} else {
											sEndDate = sEndDate;
										}
									}
								});
								oChild.setTime(sStartDate);
								oChild.setEndTime(sEndDate);
								childArraay = childArraay.concat(oChild);
							} else {
								childArraay = childArraay.concat(oChild);
							}
						});
					});
					if (childArraay.length !== 0) {
						// Change childElement property to false for all the tasks defined in Group on expand
						// All the tasks defined in Group should have their own sap-ui-id & vice-versa
						childArraay.forEach(function(oChild) {
							oChild.setProperty("childElement", false, true);
						});
					}
					fnRenderExpandShape(childArraay);
				}
			} else if (oMainShape._isSubTasks) {
				var aExpandableShapes = oMainShape.getParent().getAllExpandableShapes();
				var sStartDate;
				var sEndDate;
				aExpandableShapes.forEach(function(shape, index) {
					if (oGantt.isShapeVisible(shape)) {
						lastVisibleShapeIndex = index;
					}
				});
				var lastVisibleShape = aExpandableShapes[lastVisibleShapeIndex];
				// render subshapes only after all visible shapes are rendered
				if (oMainShape === lastVisibleShape) {
					var childArraay = [];
					aExpandableShapes.forEach(function(oMainshape){ // eslint-disable-line
						var aChild = AggregationUtils.getLazyElementsByScheme(oMainshape, oMainShape.getParent().getParentGantt().getShapeSchemes()[1].getKey());
						aChild.forEach(function(oChild) {
							//For BaseConditionalShape
							if (oChild instanceof sap.gantt.simple.BaseConditionalShape) {
								var oActiveShape = oChild._getActiveShapeElement();

								if (oActiveShape instanceof sap.gantt.simple.BaseGroup) {
									sStartDate = null;
									sEndDate = null;
									oActiveShape.getShapes().forEach(function(oShape) {
										if (!sStartDate && !sEndDate) {
											sStartDate = oShape.getTime();
											sEndDate = oShape.getEndTime();
										} else {
											if (oShape.getTime() >= sStartDate) {
												sStartDate = sStartDate;
											} else {
												sStartDate = oShape.getTime();
											}
											if (oShape.getEndTime() >= sEndDate) {
												sEndDate = oShape.getEndTime();
											} else {
												sEndDate = sEndDate;
											}
										}
									});
									oActiveShape.setTime(sStartDate);
									oActiveShape.setEndTime(sEndDate);
									childArraay = childArraay.concat(oActiveShape);
								} else if (oActiveShape) {
									childArraay = childArraay.concat(oActiveShape);
									}
							} else if (oChild instanceof sap.gantt.simple.BaseGroup) {	//For BaseGroup
								sStartDate = null;
								sEndDate = null;
								oChild.getShapes().forEach(function(oShape) {
									if (!sStartDate && !sEndDate) {
										sStartDate = oShape.getTime();
										sEndDate = oShape.getEndTime();
									} else {
										if (oShape.getTime() >= sStartDate) {
											sStartDate = sStartDate;
										} else {
											sStartDate = oShape.getTime();
										}
										if (oShape.getEndTime() >= sEndDate) {
											sEndDate = oShape.getEndTime();
										} else {
											sEndDate = sEndDate;
										}
									}
								});
								oChild.setTime(sStartDate);
								oChild.setEndTime(sEndDate);
								childArraay = childArraay.concat(oChild);
							} else {
								childArraay = childArraay.concat(oChild);
							}
						});
					});
					fnRenderExpandShape(childArraay);
				}
			} else if (!oMainShape._isSubTasks){
				var mAggregations = AggregationUtils.getLazyAggregations(oMainShape);
				Object.keys(mAggregations).forEach(function(sName){
					var aShapes = oMainShape.getAggregation(sName);
					fnRenderExpandShape(aShapes);
				});
			}
		},

		calcRowDomPosition : function(oRowSetting, aRowStates) {
			var oRow = oRowSetting._getRow(),
				oTable = oRow.getParent(),
				iRowIndex = oTable.indexOfRow(oRow);

			var iRowHeight = aRowStates[iRowIndex].height;
			var iRowYCenter = 0;
			for (var iIndex = 0; iIndex <= iRowIndex; iIndex++) {
				iRowYCenter += aRowStates[iIndex].height;
			}

			iRowYCenter -= iRowHeight / 2;

			return {
				rowYCenter: iRowYCenter,
				rowHeight: iRowHeight
			};
		},

		/**
		 * Either prepend given item at the front of the given array, or
		 * append given item at the end of the given array.
		 *
		 * @param {array} aArray An array
		 * @param {object} oItem An item that is going to be either prepended or appended to the given array.
		 * @param {boolean} bUnshift If set to true, given item is inserted at the beginning of the array.
		 * If set to false or undefined, the given item is pushed at the end of the given array.
		 * @private
		 */
		pushOrUnshift: function (aArray, oItem, bUnshift) {
			if (bUnshift === true) {
				aArray.splice(0, 0, oItem);
			} else {
				aArray.push(oItem);
			}
		},

		/**
		 * Creates ordered list of callback functions based on template.
		 *
		 * Items from the given template array are either one by one either added to the end or
		 * to the beginning of the new array. When the item has bUnshift set to true,
		 * then it is inserted at the beginning of the array.
		 * If it bUnshift is set to false, then it is pushed to the end of the array.
		 *
		 * @param {array} aTemplateForOrderedRenderFunctions array of objects
		 * @returns {array} Ordered list  of callback functions
		 */
		createOrderedListOfRenderFunctionsFromTemplate: function (aTemplateForOrderedRenderFunctions) {
			var aOrderedRenderFunctions = [];
			for (var i = 0; i < aTemplateForOrderedRenderFunctions.length; i++) {
				this.pushOrUnshift(
					aOrderedRenderFunctions,
					aTemplateForOrderedRenderFunctions[i].fnCallback,
					aTemplateForOrderedRenderFunctions[i].bUnshift);
			}
			return aOrderedRenderFunctions;
		},
		/**
		 * Render the <animate> tag for the shape
		 *
		 * @param {sap.ui.core.RenderManager} oRm Render Manager
		 * @param {sap.gantt.simple.BaseShape} oElement shape instance
		 */
		renderElementAnimation : function(oRm, oElement) {
			var mAnimationSettings = oElement.getAnimationProperties(oElement.getAnimationSettings());
			if (mAnimationSettings) {
				oRm.openStart("animate");
				oRm.attr("attributeName", "fill");
				oRm.attr("values", mAnimationSettings.values);
				oRm.attr("dur", mAnimationSettings.duration);
				oRm.attr("repeatCount", mAnimationSettings.repeatCount);
				oRm.openEnd().close("animate");
			}
		}
	};

	return RenderUtils;
}, /* bExport= */ true);
