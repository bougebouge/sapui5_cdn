/*
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"../library",
	"./RowMode",
	"../utils/TableUtils",
	"sap/base/Log",
	"sap/ui/thirdparty/jquery"
], function(
	library,
	RowMode,
	TableUtils,
	Log,
	jQuery
) {
	"use strict";

	/**
	 * Constructor for a new interactive row mode.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * TODO: Class description
	 * @extends sap.ui.table.rowmodes.RowMode
	 * @constructor
	 * @alias sap.ui.table.rowmodes.InteractiveRowMode
	 * @private
	 * @ui5-restricted sap.ui.mdc
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 */
	var InteractiveRowMode = RowMode.extend("sap.ui.table.rowmodes.InteractiveRowMode", /** @lends sap.ui.table.rowmodes.InteractiveRowMode.prototype */ {
		metadata: {
			library: "sap.ui.table",
			"final": true,
			properties: {
				rowCount: {type: "int", defaultValue: 10, group: "Appearance"},
				minRowCount: {type: "int", defaultValue: 5, group: "Appearance"},
				fixedTopRowCount: {type: "int", defaultValue: 0, group: "Appearance"},
				fixedBottomRowCount: {type: "int", defaultValue: 0, group: "Appearance"},
				rowContentHeight: {type: "int", defaultValue: 0, group: "Appearance"}
			}
		},
		constructor: function(sId) {
			Object.defineProperty(this, "bLegacy", {
				value: typeof sId === "boolean" ? sId : false
			});

			RowMode.apply(this, arguments);
		}
	});

	var TableDelegate = {};

	/*
	 * Provides drag&drop resize capabilities.
	 */
	var ResizeHelper = {};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.attachEvents = function() {
		RowMode.prototype.attachEvents.apply(this, arguments);
		TableUtils.addDelegate(this.getTable(), TableDelegate, this);
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.detachEvents = function() {
		RowMode.prototype.detachEvents.apply(this, arguments);
		TableUtils.removeDelegate(this.getTable(), TableDelegate);
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.registerHooks = function() {
		RowMode.prototype.registerHooks.apply(this, arguments);
		TableUtils.Hook.register(this.getTable(), TableUtils.Hook.Keys.Table.RefreshRows, this._onTableRefreshRows, this);
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.deregisterHooks = function() {
		RowMode.prototype.deregisterHooks.apply(this, arguments);
		TableUtils.Hook.deregister(this.getTable(), TableUtils.Hook.Keys.Table.RefreshRows, this._onTableRefreshRows, this);
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	InteractiveRowMode.prototype.getRowCount = function() {
		if (this.bLegacy) {
			var oTable = this.getTable();
			return oTable ? oTable.getVisibleRowCount() : 0;
		}

		return this.getProperty("rowCount");
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	InteractiveRowMode.prototype.getFixedTopRowCount = function() {
		if (this.bLegacy) {
			var oTable = this.getTable();
			return oTable ? oTable.getFixedRowCount() : 0;
		}

		return this.getProperty("fixedTopRowCount");
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	InteractiveRowMode.prototype.getFixedBottomRowCount = function() {
		if (this.bLegacy) {
			var oTable = this.getTable();
			return oTable ? oTable.getFixedBottomRowCount() : 0;
		}

		return this.getProperty("fixedBottomRowCount");
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	InteractiveRowMode.prototype.getMinRowCount = function() {
		if (this.bLegacy) {
			var oTable = this.getTable();
			return oTable ? oTable.getMinAutoRowCount() : 0;
		}

		return this.getProperty("minRowCount");
	};

	/*
	 * @see JSDoc generated by SAPUI5 control API generator
	 */
	InteractiveRowMode.prototype.getRowContentHeight = function() {
		if (this.bLegacy) {
			var oTable = this.getTable();
			return oTable ? oTable.getRowHeight() : 0;
		}

		return this.getProperty("rowContentHeight");
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.getMinRequestLength = function() {
		return this.getConfiguredRowCount();
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.getComputedRowCounts = function() {
		var iRowCount = this.getConfiguredRowCount();
		var iFixedTopRowCount = this.getFixedTopRowCount();
		var iFixedBottomRowCount = this.getFixedBottomRowCount();

		return this.computeStandardizedRowCounts(iRowCount, iFixedTopRowCount, iFixedBottomRowCount);
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.getTableStyles = function() {
		return {
			height: "auto"
		};
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.getTableBottomPlaceholderStyles = function() {
		return undefined;
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.getRowContainerStyles = function() {
		var sHeight = this.getComputedRowCounts().count * this.getBaseRowHeightOfTable() + "px";

		if (this.bLegacy && !TableUtils.isVariableRowHeightEnabled(this.getTable())) {
			return {minHeight: sHeight};
		} else {
			return {height: sHeight};
		}
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.renderRowStyles = function(oRM) {
		var iRowContentHeight = this.getRowContentHeight();

		if (iRowContentHeight > 0) {
			oRM.style("height", this.getBaseRowHeightOfTable() + "px");
		}
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.renderCellContentStyles = function(oRM) {
		var iRowContentHeight = this.getRowContentHeight();

		if (this.bLegacy) {
			return;
		}

		if (iRowContentHeight <= 0) {
			iRowContentHeight = this.getDefaultRowContentHeightOfTable();
		}

		if (iRowContentHeight > 0) {
			oRM.style("max-height", iRowContentHeight + "px");
		}
	};

	/**
	 * @inheritDoc
	 */
	InteractiveRowMode.prototype.getBaseRowContentHeight = function() {
		return Math.max(0, this.getRowContentHeight());
	};

	/**
	 * This hook is called when the rows aggregation of the table is refreshed.
	 *
	 * @private
	 */
	InteractiveRowMode.prototype._onTableRefreshRows = function() {
		var iRowCount = this.getConfiguredRowCount();

		if (iRowCount > 0) {
			this.initTableRowsAfterDataRequested(iRowCount);
			this.getRowContexts(iRowCount);  // Trigger data request.
		}
	};

	/**
	 * Gets the row count as configured with the <code>rowCount</code> and <code>minRowCount</code> properties.
	 *
	 * @returns {int} The configured row count.
	 * @private
	 */
	InteractiveRowMode.prototype.getConfiguredRowCount = function() {
		return Math.max(0, this.getMinRowCount(), this.getRowCount());
	};

	/**
	 * @this sap.ui.table.rowmodes.InteractiveRowMode
	 */
	TableDelegate.onBeforeRendering = function(oEvent) {
		if (this.bLegacy) {
			this.getTable().setVisibleRowCount(this.getComputedRowCounts().count);
		}
	};

	/**
	 * @this sap.ui.table.rowmodes.InteractiveRowMode
	 */
	TableDelegate.onAfterRendering = function(oEvent) {
		var oTable = this.getTable();
		var bRenderedRows = oEvent && oEvent.isMarked("renderRows");

		if (!bRenderedRows && oTable.getRows().length > 0) {
			this.fireRowsUpdated(TableUtils.RowsUpdateReason.Render);
		}
	};

	/**
	 * @this sap.ui.table.rowmodes.InteractiveRowMode
	 */
	TableDelegate.onmousedown = function(oEvent) {
		var oTable = this.getTable();

		if (oEvent.button === 0 && oEvent.target === oTable.getDomRef("sb")) {
			ResizeHelper.initInteractiveResizing(oTable, this, oEvent);
		}
	};

	/**
	 * Initializes the drag&drop for resizing.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {sap.ui.table.rowmodes.InteractiveRowMode} oMode The interactive row mode.
	 * @param {jQuery.Event} oEvent The event object.
	 */
	ResizeHelper.initInteractiveResizing = function(oTable, oMode, oEvent) {
		var $Body = jQuery(document.body);
		var $Splitter = oTable.$("sb");
		var $Document = jQuery(document);
		var offset = $Splitter.offset();
		var height = $Splitter.height();
		var width = $Splitter.width();
		var bTouch = oTable._isTouchEvent(oEvent);

		var oGhostDiv = document.createElement("div");
		oGhostDiv.style.width = width + "px";
		oGhostDiv.style.height = height + "px";
		oGhostDiv.style.left = offset.left + "px";
		oGhostDiv.style.top = offset.top + "px";
		oGhostDiv.className = "sapUiTableInteractiveResizerGhost";
		oGhostDiv.id = oTable.getId() + "-ghost";
		$Body.append(oGhostDiv);

		var oOverlayDiv = document.createElement("div");
		oOverlayDiv.style.top = "0px";
		oOverlayDiv.style.bottom = "0px";
		oOverlayDiv.style.left = "0px";
		oOverlayDiv.style.right = "0px";
		oOverlayDiv.style.position = "absolute";
		oOverlayDiv.id = oTable.getId() + "-rzoverlay";
		$Splitter.append(oOverlayDiv);

		$Document.on((bTouch ? "touchend" : "mouseup") + ".sapUiTableInteractiveResize",
			ResizeHelper.exitInteractiveResizing.bind(oTable, oMode));
		$Document.on((bTouch ? "touchmove" : "mousemove") + ".sapUiTableInteractiveResize",
			ResizeHelper.onMouseMoveWhileInteractiveResizing.bind(oTable)
		);

		oTable._disableTextSelection();
	};

	/**
	 * Drops the previous dragged horizontal splitter bar and recalculates the amount of rows to be displayed.
	 *
	 * @param {sap.ui.table.rowmodes.InteractiveRowMode} oMode The interactive row mode.
	 * @param {jQuery.Event} oEvent The event object.
	 */
	ResizeHelper.exitInteractiveResizing = function(oMode, oEvent) {
		var $Document = jQuery(document);
		var $Table = this.$();
		var $Ghost = this.$("ghost");
		var iLocationY = ResizeHelper.getEventPosition(this, oEvent).y;
		var iNewHeight = iLocationY - $Table.find(".sapUiTableCCnt").offset().top - $Ghost.height() - $Table.find(".sapUiTableFtr").height();
		var iUserDefinedRowCount = Math.floor(iNewHeight / oMode.getBaseRowHeightOfTable());
		var iNewRowCount = Math.max(1, iUserDefinedRowCount, oMode.getMinRowCount());

		if (oMode.bLegacy) {
			iNewRowCount = Math.max(iNewRowCount, oMode.getFixedTopRowCount() + oMode.getFixedBottomRowCount() + 1);
			this.setVisibleRowCount(iNewRowCount);
		}

		oMode.setRowCount(iNewRowCount);

		$Ghost.remove();
		this.$("rzoverlay").remove();

		$Document.off("touchend.sapUiTableInteractiveResize");
		$Document.off("touchmove.sapUiTableInteractiveResize");
		$Document.off("mouseup.sapUiTableInteractiveResize");
		$Document.off("mousemove.sapUiTableInteractiveResize");

		this._enableTextSelection();
	};

	/**
	 * Handler for the move events while dragging the horizontal resize bar.
	 *
	 * @param {jQuery.Event} oEvent The event object.
	 */
	ResizeHelper.onMouseMoveWhileInteractiveResizing = function(oEvent) {
		var iLocationY = ResizeHelper.getEventPosition(this, oEvent).y;
		var iMin = this.$().offset().top;

		if (iLocationY > iMin) {
			this.$("ghost").css("top", iLocationY + "px");
		}
	};

	// TODO: Copied from pointer extension. Maybe move this to utils.
	/**
	 * Gets the position of an event.
	 *
	 * @param {sap.ui.table.Table} oTable Instance of the table.
	 * @param {jQuery.Event} oEvent The event object.
	 * @returns {{x: int, y: int}} The event position.
	 */
	ResizeHelper.getEventPosition = function(oTable, oEvent) {
		var oPosition;

		function getTouchObject(oTouchEvent) {
			if (!oTable._isTouchEvent(oTouchEvent)) {
				return null;
			}

			var aTouchEventObjectNames = ["touches", "targetTouches", "changedTouches"];

			for (var i = 0; i < aTouchEventObjectNames.length; i++) {
				var sTouchEventObjectName = aTouchEventObjectNames[i];

				if (oEvent[sTouchEventObjectName] && oEvent[sTouchEventObjectName][0]) {
					return oEvent[sTouchEventObjectName][0];
				}
				if (oEvent.originalEvent[sTouchEventObjectName] && oEvent.originalEvent[sTouchEventObjectName][0]) {
					return oEvent.originalEvent[sTouchEventObjectName][0];
				}
			}

			return null;
		}

		oPosition = getTouchObject(oEvent) || oEvent;

		return {x: oPosition.pageX, y: oPosition.pageY};
	};

	return InteractiveRowMode;
});