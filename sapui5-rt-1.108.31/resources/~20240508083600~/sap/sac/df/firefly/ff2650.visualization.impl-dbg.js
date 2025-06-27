/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2610.visualization.internal"
],
function(oFF)
{
"use strict";

oFF.SacTableClipboardHelper = function() {};
oFF.SacTableClipboardHelper.prototype = new oFF.XObject();
oFF.SacTableClipboardHelper.prototype._ff_c = "SacTableClipboardHelper";

oFF.SacTableClipboardHelper.prototype.m_tableInstance = null;
oFF.SacTableClipboardHelper.prototype.setupWithTable = function(tableInstance)
{
	this.m_tableInstance = tableInstance;
};
oFF.SacTableClipboardHelper.prototype.getTable = function()
{
	return this.m_tableInstance;
};
oFF.SacTableClipboardHelper.prototype.copyCells = function(selection)
{
	var result = oFF.PrFactory.createStructure();
	result.putNewList(oFF.SacTable.SELECTION_LIST);
	result.putInteger(oFF.SacTable.SELECTION_COL_MIN, -1);
	result.putInteger(oFF.SacTable.SELECTION_ROW_MIN, -1);
	if (this.m_tableInstance.getHeaderRowList() !== null && this.m_tableInstance.getRowList() !== null)
	{
		if (oFF.notNull(selection))
		{
			if (selection.isStructure())
			{
				this.analyzeSelectionStructureInternal(selection.asStructure(), result);
			}
			else if (selection.isList())
			{
				var selectionList = selection.asList();
				if (oFF.XCollectionUtils.hasElements(selectionList))
				{
					for (var i = 0; i < selectionList.size(); i++)
					{
						this.analyzeSelectionStructureInternal(selectionList.getStructureAt(i), result);
					}
				}
			}
		}
	}
	return result;
};
oFF.SacTableClipboardHelper.prototype.analyzeSelectionStructureInternal = function(selectionStructure, result)
{
	var colMin = result.getIntegerByKey(oFF.SacTable.SELECTION_COL_MIN);
	var rowMin = result.getIntegerByKey(oFF.SacTable.SELECTION_ROW_MIN);
	var resultList = result.getListByKey(oFF.SacTable.SELECTION_LIST);
	var startCol = selectionStructure.getIntegerByKey(oFF.SacTableConstants.CCD_N_START_COL);
	var endCol = selectionStructure.getIntegerByKey(oFF.SacTableConstants.CCD_N_END_COL);
	var startRow = selectionStructure.getIntegerByKey(oFF.SacTableConstants.CCD_N_START_ROW);
	var endRow = selectionStructure.getIntegerByKey(oFF.SacTableConstants.CCD_N_END_ROW);
	if (colMin === -1)
	{
		result.putInteger(oFF.SacTable.SELECTION_COL_MIN, startCol);
	}
	else
	{
		result.putInteger(oFF.SacTable.SELECTION_COL_MIN, oFF.XMath.min(colMin, startCol));
	}
	if (rowMin === -1)
	{
		result.putInteger(oFF.SacTable.SELECTION_ROW_MIN, startRow);
	}
	else
	{
		result.putInteger(oFF.SacTable.SELECTION_ROW_MIN, oFF.XMath.min(rowMin, startRow));
	}
	var i;
	var j;
	var cells;
	var headerRowList = this.m_tableInstance.getHeaderRowList();
	var headerRowListSize = headerRowList.size();
	var dataRowList = this.m_tableInstance.getRowList();
	var structure;
	var row;
	var cell;
	for (i = startRow; i <= endRow && i < headerRowListSize; i++)
	{
		row = headerRowList.get(i);
		cells = row.getCells();
		for (j = startCol; j <= endCol && j < cells.size(); j++)
		{
			cell = cells.get(j);
			structure = this.fillStructureOfCell(cell, resultList, i, j);
			this.formatCell(cell, structure);
		}
	}
	for (i = oFF.XMath.max(0, startRow - headerRowListSize); i <= endRow - headerRowListSize && i < dataRowList.size(); i++)
	{
		row = dataRowList.get(i);
		if (oFF.notNull(row))
		{
			cells = row.getCells();
			for (j = startCol; j <= endCol && j < cells.size(); j++)
			{
				cell = cells.get(j);
				structure = this.fillStructureOfCell(cell, resultList, i + headerRowListSize, j);
				this.formatCell(cell, structure);
			}
		}
	}
};
oFF.SacTableClipboardHelper.prototype.getCellValueAt = function(rowIndex, columnIndex)
{
	var headerRowList = this.m_tableInstance.getHeaderRowList();
	var dataRowList = this.m_tableInstance.getRowList();
	var headerRowListSize = headerRowList.size();
	var dataRowListSize = dataRowList.size();
	var row;
	if (rowIndex < headerRowListSize)
	{
		row = headerRowList.get(rowIndex);
	}
	else if (rowIndex < headerRowListSize + dataRowListSize)
	{
		row = dataRowList.get(rowIndex - headerRowListSize);
	}
	else
	{
		row = null;
	}
	var cell = null;
	if (oFF.notNull(row))
	{
		var cells = row.getCells();
		if (oFF.notNull(cells) && columnIndex < cells.size())
		{
			cell = cells.get(columnIndex);
		}
	}
	return oFF.isNull(cell) ? null : cell.getPlain();
};
oFF.SacTableClipboardHelper.prototype.pasteCells = function(pasting, column, row)
{
	var colMin = pasting.getIntegerByKey(oFF.SacTable.SELECTION_COL_MIN);
	var rowMin = pasting.getIntegerByKey(oFF.SacTable.SELECTION_ROW_MIN);
	var cellList = pasting.getListByKey(oFF.SacTable.SELECTION_LIST);
	for (var i = 0; i < cellList.size(); i++)
	{
		var cell = cellList.getStructureAt(i);
		var colIndex = cell.getIntegerByKey(oFF.SacTableConstants.C_N_COLUMN) - colMin + column;
		var rowIndex = cell.getIntegerByKey(oFF.SacTableConstants.C_N_ROW) - rowMin + row;
		var cells;
		var newCell;
		var headerRowList = this.m_tableInstance.getHeaderRowList();
		var dataRowList = this.m_tableInstance.getRowList();
		var headerRowListSize = headerRowList.size();
		if (rowIndex < headerRowListSize)
		{
			cells = headerRowList.get(rowIndex).getCells();
			if (colIndex < cells.size())
			{
				newCell = cells.get(colIndex);
				newCell.setFormatted(cell.getStringByKey(oFF.SacTableConstants.C_S_FORMATTED));
				newCell.setPlain(oFF.XStringValue.create(cell.getStringByKey(oFF.SacTableConstants.C_SN_PLAIN)));
			}
		}
		else if (rowIndex - headerRowListSize < dataRowList.size())
		{
			cells = dataRowList.get(rowIndex - headerRowListSize).getCells();
			if (colIndex < cells.size())
			{
				newCell = cells.get(colIndex);
				newCell.setFormatted(cell.getStringByKey(oFF.SacTableConstants.C_S_FORMATTED));
				newCell.setPlain(oFF.XStringValue.create(cell.getStringByKey(oFF.SacTableConstants.C_SN_PLAIN)));
			}
		}
	}
};
oFF.SacTableClipboardHelper.prototype.fillStructureOfCell = function(tableCell, owningList, rowIndex, colIndex)
{
	var structure = owningList.addNewStructure();
	structure.putInteger(oFF.SacTableConstants.C_N_ROW, rowIndex);
	structure.putInteger(oFF.SacTableConstants.C_N_COLUMN, colIndex);
	var mergedColumns = tableCell.getMergedColumns();
	var mergedRows = tableCell.getMergedRows();
	if (mergedColumns !== 0 || mergedRows !== 0)
	{
		var mergerStructure = structure.putNewStructure(oFF.SacTableConstants.C_M_MERGED);
		if (mergedColumns >= 0 && mergedRows >= 0)
		{
			if (tableCell.getMergedColumns() > 0)
			{
				mergerStructure.putInteger(oFF.SacTableConstants.CM_N_COLUMNS, tableCell.getMergedColumns());
			}
			if (tableCell.getMergedRows() > 0)
			{
				mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ROWS, tableCell.getMergedRows());
			}
		}
		else
		{
			mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ORIGINAL_COLUMN, colIndex + tableCell.getMergedColumns());
			mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ORIGINAL_ROW, rowIndex + tableCell.getMergedRows());
		}
	}
	if (tableCell.getCommentDocumentId() !== null)
	{
		structure.putInteger(oFF.SacTableConstants.C_N_COMMENT_TYPE, oFF.SacTableConstants.CT_CHILD);
		structure.putString(oFF.SacTableConstants.CS_COMMENT_DOCUMENT_ID, tableCell.getCommentDocumentId());
	}
	var localId = tableCell.getId();
	if (oFF.isNull(localId))
	{
		localId = oFF.XStringUtils.concatenate2(oFF.XInteger.convertToHexString(rowIndex), oFF.XInteger.convertToHexString(colIndex));
	}
	structure.putString(oFF.SacTableConstants.C_S_ID, localId);
	if (!tableCell.isRepeatedHeader() || this.m_tableInstance.isRepetitiveHeaderNames())
	{
		structure.putString(oFF.SacTableConstants.C_S_FORMATTED, tableCell.getFormatted());
	}
	else
	{
		structure.putString(oFF.SacTableConstants.C_S_FORMATTED, "");
	}
	structure.putBoolean(oFF.SacTableConstants.C_B_REPEATED_MEMBER_NAME, tableCell.isRepeatedHeader());
	var plainValue = this.getCellValueAt(rowIndex, colIndex);
	if (oFF.notNull(plainValue))
	{
		var valueType = plainValue.getValueType();
		if (valueType === oFF.XValueType.BOOLEAN)
		{
			structure.putBoolean(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getBoolean(plainValue, false, true));
		}
		else if (valueType === oFF.XValueType.DOUBLE)
		{
			structure.putDouble(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getDouble(plainValue, false, true));
		}
		else if (valueType === oFF.XValueType.LONG)
		{
			structure.putLong(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getLong(plainValue, false, true));
		}
		else if (valueType === oFF.XValueType.INTEGER)
		{
			structure.putInteger(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getInteger(plainValue, false, true));
		}
		else
		{
			structure.putString(oFF.SacTableConstants.C_SN_PLAIN, plainValue.getStringRepresentation());
		}
	}
	structure.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, tableCell.getEffectiveCellType());
	return structure;
};
oFF.SacTableClipboardHelper.prototype.formatCell = function(cell, structureToFormat)
{
	var styles = cell.getPrioritizedStylesList();
	if (cell.isEffectiveTotalsContext())
	{
		structureToFormat.putBoolean(oFF.SacTableConstants.C_B_IS_INA_TOTALS_CONTEXT, true);
	}
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_IS_IN_HIERARCHY, cell.isInHierarchy());
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_ALLOW_DRAG_DROP, cell.isAllowDragDrop());
	structureToFormat.putInteger(oFF.SacTableConstants.C_N_LEVEL, cell.getHierarchyLevel());
	structureToFormat.putInteger(cell.getHierarchyPaddingType(), cell.getHierarchyPaddingValue() * (1 + cell.getHierarchyLevel()));
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_SHOW_DRILL_ICON, cell.isShowDrillIcon());
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_EXPANDED, cell.isExpanded());
	var color = cell.getEffectiveFillColor(styles);
	if (oFF.notNull(color))
	{
		var style = this.getStyle(structureToFormat);
		style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, color);
	}
	this.transferStyledLineToJson(cell.getEffectiveStyledLineTop(styles), oFF.SacTableConstants.LP_TOP, structureToFormat);
	this.transferStyledLineToJson(cell.getEffectiveStyleLineBottom(styles), oFF.SacTableConstants.LP_BOTTOM, structureToFormat);
	this.transferStyledLineToJson(cell.getEffectiveStyledLineLeft(styles), oFF.SacTableConstants.LP_LEFT, structureToFormat);
	this.transferStyledLineToJson(cell.getEffectiveStyledLineRight(styles), oFF.SacTableConstants.LP_RIGHT, structureToFormat);
	if (cell.isEffectiveFontItalic(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_ITALIC, true);
	}
	if (cell.isEffectiveFontBold(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_BOLD, true);
	}
	if (cell.isEffectiveFontUnderline(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_UNDERLINE, true);
	}
	if (cell.isEffectiveFontStrikeThrough(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_STRIKETHROUGH, true);
	}
	var effectiveFontSize = cell.getEffectiveFontSize(styles);
	if (effectiveFontSize > 0)
	{
		this.getFont(structureToFormat).putDouble(oFF.SacTableConstants.FS_N_SIZE, effectiveFontSize);
	}
	var effectiveFontFamily = cell.getEffectiveFontFamily(styles);
	if (oFF.notNull(effectiveFontFamily))
	{
		this.getFont(structureToFormat).putString(oFF.SacTableConstants.FS_S_FAMILY, effectiveFontFamily);
	}
	color = cell.getEffectiveFontColor(styles);
	if (oFF.notNull(color))
	{
		this.getFont(structureToFormat).putString(oFF.SacTableConstants.FS_S_COLOR, color);
	}
	var effectiveThresholdColor = cell.getEffectiveThresholdColor(styles);
	if (oFF.notNull(effectiveThresholdColor))
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_COLOR, effectiveThresholdColor);
	}
	var effectiveThresholdType = cell.getEffectiveThresholdType(styles);
	if (effectiveThresholdType === oFF.SacAlertSymbol.GOOD)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_GOOD);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.WARNING)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_WARNING);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.ALERT)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_ALERT);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.DIAMOND)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_DIAMOND);
	}
	return structureToFormat;
};
oFF.SacTableClipboardHelper.prototype.transferStyledLineToJson = function(effectiveLineStyle, lpKey, structureToFormat)
{
	if (!effectiveLineStyle.isEmpty())
	{
		var line = this.getLineInternal(lpKey, structureToFormat);
		line.putStringNotNullAndNotEmpty(oFF.SacTableConstants.SL_S_COLOR, effectiveLineStyle.getColor());
		if (effectiveLineStyle.getWidth() > -1)
		{
			line.putDouble(oFF.SacTableConstants.SL_N_SIZE, effectiveLineStyle.getWidth());
		}
		if (effectiveLineStyle.hasPadding())
		{
			var paddingStructure = line.putNewStructure(oFF.SacTableConstants.SL_M_PADDING);
			this.applyPadding(paddingStructure, effectiveLineStyle.getLeftPadding(), oFF.SacTableConstants.SLP_N_LEFT);
			this.applyPadding(paddingStructure, effectiveLineStyle.getRightPadding(), oFF.SacTableConstants.SLP_N_RIGHT);
			this.applyPadding(paddingStructure, effectiveLineStyle.getTopPadding(), oFF.SacTableConstants.SLP_N_TOP);
			this.applyPadding(paddingStructure, effectiveLineStyle.getBottomPadding(), oFF.SacTableConstants.SLP_N_BOTTOM);
		}
		var lineStyle = effectiveLineStyle.getLineStyle();
		if (lineStyle === oFF.SacTableLineStyle.DASHED)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_DASHED);
		}
		else if (lineStyle === oFF.SacTableLineStyle.DOTTED)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_DOTTED);
		}
		else if (lineStyle === oFF.SacTableLineStyle.SOLID)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_SOLID);
		}
		else if (lineStyle === oFF.SacTableLineStyle.NONE)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_NONE);
		}
		var linePatternType = effectiveLineStyle.getPatternType();
		if (oFF.notNull(linePatternType))
		{
			var patternStructure = line.putNewStructure(oFF.SacTableConstants.SL_M_PATTERN);
			if (linePatternType === oFF.SacLinePatternType.WHITE_FILL)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_WHITE_FILL);
			}
			else if (linePatternType === oFF.SacLinePatternType.NOFILL)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_NON_FILL);
			}
			else if (linePatternType === oFF.SacLinePatternType.SOLID)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_SOLID);
			}
			else if (linePatternType === oFF.SacLinePatternType.BACKGROUND_IMAGE)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_BACKGROUND, effectiveLineStyle.getPatternBackground());
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_1)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_1, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_2)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_2, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_3)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_3, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_4)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_4, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_5)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_5, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_6)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_6, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_7)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_7, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_8)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_8, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_WIDTH, effectiveLineStyle.getPatternWidth());
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_COLOR, effectiveLineStyle.getPatternColor());
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_BORDER_COLOR, effectiveLineStyle.getPatternBorderColor());
		}
	}
};
oFF.SacTableClipboardHelper.prototype.applyPadding = function(paddingStructure, padding, paddingKey)
{
	if (padding > -1)
	{
		paddingStructure.putDouble(paddingKey, padding);
	}
};
oFF.SacTableClipboardHelper.prototype.getLineInternal = function(position, structure)
{
	var style = this.getStyle(structure);
	if (!style.containsKey(oFF.SacTableConstants.ST_L_LINES))
	{
		style.putNewList(oFF.SacTableConstants.ST_L_LINES);
	}
	var lines = style.getListByKey(oFF.SacTableConstants.ST_L_LINES);
	var line = null;
	for (var i = 0; i < lines.size(); i++)
	{
		if (lines.getStructureAt(i).getIntegerByKey(oFF.SacTableConstants.SL_N_POSITION) === position)
		{
			line = lines.getStructureAt(i);
		}
	}
	if (oFF.isNull(line))
	{
		line = lines.addNewStructure();
		line.putInteger(oFF.SacTableConstants.SL_N_SIZE, 1);
		line.putInteger(oFF.SacTableConstants.SL_N_STYLE, 1);
		line.putInteger(oFF.SacTableConstants.SL_N_POSITION, position);
		var padding = line.putNewStructure(oFF.SacTableConstants.SL_M_PADDING);
		if (position === oFF.SacTableConstants.LP_BOTTOM || position === oFF.SacTableConstants.LP_TOP)
		{
			padding.putInteger(oFF.SacTableConstants.SLP_N_RIGHT, oFF.SacTableConstants.LP_RIGHT);
			padding.putInteger(oFF.SacTableConstants.SLP_N_LEFT, oFF.SacTableConstants.LP_RIGHT);
		}
		else
		{
			padding.putInteger(oFF.SacTableConstants.SLP_N_BOTTOM, oFF.SacTableConstants.LP_BOTTOM);
			padding.putInteger(oFF.SacTableConstants.SLP_N_TOP, oFF.SacTableConstants.LP_TOP);
		}
	}
	return line;
};
oFF.SacTableClipboardHelper.prototype.getFont = function(structure)
{
	var style = this.getStyle(structure);
	var font = style.getStructureByKey(oFF.SacTableConstants.ST_M_FONT);
	if (oFF.isNull(font))
	{
		font = style.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
	}
	return font;
};
oFF.SacTableClipboardHelper.prototype.getStyle = function(structure)
{
	if (!structure.containsKey(oFF.SacTableConstants.C_M_STYLE))
	{
		structure.putBoolean(oFF.SacTableConstants.C_B_STYLE_UPDATED_BY_USER, true);
		structure.putNewStructure(oFF.SacTableConstants.C_M_STYLE);
	}
	return structure.getStructureByKey(oFF.SacTableConstants.C_M_STYLE);
};

oFF.SacTableFactoryImpl = function() {};
oFF.SacTableFactoryImpl.prototype = new oFF.XObject();
oFF.SacTableFactoryImpl.prototype._ff_c = "SacTableFactoryImpl";

oFF.SacTableFactoryImpl.create = function()
{
	return new oFF.SacTableFactoryImpl();
};
oFF.SacTableFactoryImpl.prototype.newTableObject = function()
{
	return oFF.SacTable.create();
};
oFF.SacTableFactoryImpl.prototype.newGridRenderer = function(table)
{
	return oFF.GenericTableRenderer.create(table);
};

oFF.SacTableCsvRenderHelper = function() {};
oFF.SacTableCsvRenderHelper.prototype = new oFF.XObject();
oFF.SacTableCsvRenderHelper.prototype._ff_c = "SacTableCsvRenderHelper";

oFF.SacTableCsvRenderHelper.DEFAULT_ESCAPOR = "\"";
oFF.SacTableCsvRenderHelper.DEFAULT_CELL_SEPARATOR = ",";
oFF.SacTableCsvRenderHelper.DEFAULT_LINE_SEPARATOR = "\n";
oFF.SacTableCsvRenderHelper.createDefaultTableRenderHelper = function(tableObject)
{
	var instance = new oFF.SacTableCsvRenderHelper();
	instance.initializeRH(tableObject, oFF.SacTableCsvRenderHelper.DEFAULT_LINE_SEPARATOR, oFF.SacTableCsvRenderHelper.DEFAULT_CELL_SEPARATOR, oFF.SacTableCsvRenderHelper.DEFAULT_ESCAPOR);
	return instance;
};
oFF.SacTableCsvRenderHelper.createTableRenderHelper = function(tableObject, lineSeparator, separator, escapor)
{
	var instance = new oFF.SacTableCsvRenderHelper();
	instance.initializeRH(tableObject, lineSeparator, separator, escapor);
	return instance;
};
oFF.SacTableCsvRenderHelper.prototype.m_escapor = null;
oFF.SacTableCsvRenderHelper.prototype.m_cellSeparator = null;
oFF.SacTableCsvRenderHelper.prototype.m_lineSeparator = null;
oFF.SacTableCsvRenderHelper.prototype.m_tableObject = null;
oFF.SacTableCsvRenderHelper.prototype.m_escapedEscapor = null;
oFF.SacTableCsvRenderHelper.prototype.initializeRH = function(tableObject, lineSeparator, separator, escapor)
{
	this.m_tableObject = tableObject;
	this.m_lineSeparator = lineSeparator;
	this.m_cellSeparator = separator;
	this.m_escapor = escapor;
};
oFF.SacTableCsvRenderHelper.prototype.releaseObject = function()
{
	this.m_tableObject = null;
	this.m_lineSeparator = null;
	this.m_cellSeparator = null;
	this.m_escapor = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SacTableCsvRenderHelper.prototype.fillRowsFromList = function(rowList, stringBuffer)
{
	for (var i = 0; i < rowList.size(); i++)
	{
		var row = rowList.get(i);
		if (oFF.notNull(row))
		{
			this.fillCellsFromList(row.getCells(), stringBuffer);
		}
		stringBuffer.append(this.m_lineSeparator);
	}
};
oFF.SacTableCsvRenderHelper.prototype.fillCellsFromList = function(cells, stringBuffer)
{
	if (oFF.XCollectionUtils.hasElements(cells))
	{
		var cellsSize = cells.size();
		stringBuffer.append(this.resolveCell(cells.get(0)));
		for (var i = 1; i < cellsSize; i++)
		{
			stringBuffer.append(this.m_cellSeparator);
			stringBuffer.append(this.resolveCell(cells.get(i)));
		}
	}
};
oFF.SacTableCsvRenderHelper.prototype.resolveCell = function(tableCell)
{
	var cellBase = tableCell;
	var formattedString;
	if (!cellBase.isRepeatedHeader() || this.m_tableObject.isRepetitiveHeaderNames())
	{
		formattedString = cellBase.getFormatted();
	}
	else
	{
		formattedString = "";
	}
	var needsEscape = oFF.XString.containsString(formattedString, this.m_cellSeparator) || oFF.XString.containsString(formattedString, this.m_lineSeparator);
	if (oFF.XString.containsString(formattedString, this.m_escapor))
	{
		needsEscape = true;
		formattedString = oFF.XString.replace(formattedString, this.m_escapor, this.getEscapedEscapor());
	}
	if (needsEscape)
	{
		formattedString = oFF.XStringUtils.concatenate3(this.m_escapor, formattedString, this.m_escapor);
	}
	return formattedString;
};
oFF.SacTableCsvRenderHelper.prototype.getEscapedEscapor = function()
{
	if (oFF.isNull(this.m_escapedEscapor))
	{
		this.m_escapedEscapor = oFF.XStringUtils.concatenate2(this.m_escapor, this.m_escapor);
	}
	return this.m_escapedEscapor;
};

oFF.SacTableExportHelper = function() {};
oFF.SacTableExportHelper.prototype = new oFF.XObject();
oFF.SacTableExportHelper.prototype._ff_c = "SacTableExportHelper";

oFF.SacTableExportHelper.createTableExportHelper = function(table)
{
	var instance = new oFF.SacTableExportHelper();
	instance.initializeRH(table);
	return instance;
};
oFF.SacTableExportHelper.prototype.m_tableObject = null;
oFF.SacTableExportHelper.prototype.initializeRH = function(tableObject)
{
	this.m_tableObject = tableObject;
};
oFF.SacTableExportHelper.prototype.releaseObject = function()
{
	this.m_tableObject = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SacTableExportHelper.prototype.getTableObject = function()
{
	return this.m_tableObject;
};
oFF.SacTableExportHelper.prototype.getExportableStructure = function(startRow, endRow, startCol, endCol)
{
	var tableJson = oFF.PrFactory.createStructure();
	var index;
	var headerRowList = this.m_tableObject.getHeaderRowList();
	var rowList = this.m_tableObject.getRowList();
	var colList = this.m_tableObject.getColumnList();
	var prRowList = tableJson.putNewList(oFF.SacTableConstants.TD_L_ROWS);
	var headerRowSize = headerRowList.size();
	var colEndIndex = oFF.XMath.min(colList.size(), endCol + 1);
	var rowEndIndex = oFF.XMath.min(rowList.size(), endRow + 1);
	this.renderGenericSettings(tableJson, startCol, colEndIndex, startRow);
	var row;
	for (index = 0; index < headerRowSize; index++)
	{
		row = headerRowList.get(index);
		if (oFF.notNull(row))
		{
			this.renderRow(prRowList, row, index, startCol, colEndIndex);
		}
	}
	for (index = startRow; index < rowEndIndex; index++)
	{
		row = rowList.get(index);
		if (oFF.notNull(row))
		{
			this.renderRow(prRowList, row, index + headerRowSize - startRow, startCol, colEndIndex);
		}
	}
	return tableJson;
};
oFF.SacTableExportHelper.prototype.renderGenericSettings = function(tableJson, startCol, colEndIndex, startRow)
{
	var style = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_STYLE);
	var font = style.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
	font.putInteger(oFF.SacTableConstants.FS_N_SIZE, 42);
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_REVERSED_HIERARCHY, this.m_tableObject.isReversedHierarchy());
	var title = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_TITLE);
	var titleStyle = title.putNewStructure(oFF.SacTableConstants.TD_M_TITLE_STYLE);
	title.putNewStructure(oFF.SacTableConstants.TD_M_SUBTITLE_STYLE);
	var titleFont = titleStyle.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
	titleFont.putInteger(oFF.SacTableConstants.FS_N_SIZE, 17);
	var titleText = this.m_tableObject.getTitle();
	title.putStringNotNullAndNotEmpty(oFF.SacTableConstants.TD_S_TITLE_TEXT, titleText);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(titleText))
	{
		title.putNewList(oFF.SacTableConstants.TD_L_TITLE_CHUNKS).addString(titleText);
	}
	var titleTokens = title.putNewStructure(oFF.SacTableConstants.TD_M_TOKEN_DATA);
	var titelTokenStyles = titleTokens.putNewStructure(oFF.SacTableConstants.TE_O_STYLES);
	titelTokenStyles.putString("line-height", "");
	titelTokenStyles.putString("text-align", "left");
	titelTokenStyles.putString("font-size", "13px");
	titelTokenStyles.putString("align-items", "center");
	titelTokenStyles.putString("margin-top", "3px");
	titleTokens.putNewStructure(oFF.SacTableConstants.TE_O_ATTRIBUTES);
	titleTokens.putNewList(oFF.SacTableConstants.TE_L_CLASSES).addString("sapReportEngineTokenContainer");
	titleTokens.putString(oFF.SacTableConstants.TE_S_TAG, "div");
	var titleVisible = this.m_tableObject.isShowTableTitle();
	var subtitleVisible = this.m_tableObject.isShowSubTitle();
	var detailsVisible = this.m_tableObject.isShowTableDetails();
	title.putBoolean(oFF.SacTableConstants.TD_B_TITLE_VISIBLE, titleVisible);
	title.putBoolean(oFF.SacTableConstants.TD_B_SUBTITLE_VISIBLE, subtitleVisible);
	title.putBoolean(oFF.SacTableConstants.TD_B_DETAILS_VISIBLE, detailsVisible);
	title.putBoolean(oFF.SacTableConstants.TD_B_EDITABLE, false);
	var titleAreaHeight = 40;
	if (titleVisible && (detailsVisible || subtitleVisible))
	{
		titleAreaHeight = 52;
	}
	else if (!titleVisible && !detailsVisible && !subtitleVisible)
	{
		titleAreaHeight = 0;
	}
	titleStyle.putInteger(oFF.SacTableConstants.TS_N_HEIGHT, titleAreaHeight);
	var i;
	var tableHeight = this.m_tableObject.getHeight();
	var tableWidth = this.m_tableObject.getWidth();
	tableJson.putInteger(oFF.SacTableConstants.TD_N_WIDGET_HEIGHT, tableHeight);
	var showGrid = this.m_tableObject.isShowGrid();
	var freezingColumns = this.m_tableObject.isFreezeHeaderColumns() || this.m_tableObject.getFreezeUpToColumn() > -1;
	var freezing = this.m_tableObject.isFreezeHeaderRows() || this.m_tableObject.getFreezeUpToRow() > -1 || freezingColumns;
	var freezeUpToColumn = this.m_tableObject.getFreezeUpToColumn();
	if (freezeUpToColumn > -1 || !this.m_tableObject.isFreezeHeaderColumns())
	{
		tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_COL, freezeUpToColumn);
	}
	else
	{
		tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_COL, this.m_tableObject.getPreColumnsAmount() - 1);
	}
	var freezeUpToRow = this.m_tableObject.getFreezeUpToRow();
	if (freezeUpToRow > -1 || !this.m_tableObject.isFreezeHeaderRows())
	{
		tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_ROW, freezeUpToRow);
	}
	else
	{
		tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_ROW, this.m_tableObject.getHeaderRowList().size() - 1);
	}
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_FREEZE_LINES, freezing && this.m_tableObject.isShowFreezeLines());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_HAS_FIXED_ROWS_COLS, freezing);
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_GRID, showGrid);
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_COORDINATE_HEADER, this.m_tableObject.isShowCoordinateHeader());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_GRID, this.m_tableObject.isShowGrid());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SUBTITLE_VISIBLE, this.m_tableObject.isShowSubTitle());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_TITLE_VISIBLE, this.m_tableObject.isShowTableTitle());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_DETAILS_VISIBLE, this.m_tableObject.isShowTableDetails());
	var columnSettings = tableJson.putNewList(oFF.SacTableConstants.TD_L_COLUMN_SETTINGS);
	var availableWidth = tableWidth - 100;
	var columnWidths = this.m_tableObject.getColumnEmWidths();
	var overallSizeUnits = oFF.XStream.of(columnWidths).reduce(oFF.XIntegerValue.create(1),  function(a, b){
		return oFF.XIntegerValue.create(a.getInteger() + b.getInteger());
	}.bind(this)).getInteger();
	var factor = oFF.XMath.div(availableWidth, overallSizeUnits);
	if (factor > 15)
	{
		factor = 15;
	}
	if (factor < 10)
	{
		factor = 10;
	}
	var minPixelCellWidth = this.m_tableObject.getMinCellWidth();
	var maxPixelCellWidth = this.m_tableObject.getMaxCellWidth();
	var preciseWidth;
	var columnObject;
	var headerWidth = 0;
	var dataWidth = 0;
	for (i = 0; i < this.m_tableObject.getPreColumnsAmount(); i++)
	{
		preciseWidth = minPixelCellWidth;
		if (i < columnWidths.size())
		{
			preciseWidth = oFF.XMath.min(maxPixelCellWidth, oFF.XMath.max(columnWidths.get(i).getInteger() * factor, minPixelCellWidth));
		}
		columnObject = this.m_tableObject.getHeaderColumnList().get(i);
		columnObject.setDefaultWidth(preciseWidth);
		headerWidth = headerWidth + preciseWidth;
	}
	if (this.m_tableObject.getDataColumnsAmount() > 0)
	{
		for (i = this.m_tableObject.getPreColumnsAmount() + startCol; i < this.m_tableObject.getPreColumnsAmount() + colEndIndex; i++)
		{
			preciseWidth = minPixelCellWidth;
			if (i < columnWidths.size())
			{
				preciseWidth = oFF.XMath.min(maxPixelCellWidth, oFF.XMath.max(columnWidths.get(i).getInteger() * factor, minPixelCellWidth));
			}
			dataWidth = dataWidth + preciseWidth;
			columnObject = this.m_tableObject.getColumnList().get(i - this.m_tableObject.getPreColumnsAmount());
			columnObject.setDefaultWidth(preciseWidth);
		}
	}
	var totalWidth = 20;
	var columnStructure;
	for (i = 0; i < this.m_tableObject.getPreColumnsAmount(); i++)
	{
		columnObject = this.m_tableObject.getHeaderColumnList().get(i);
		preciseWidth = columnObject.getWidth();
		totalWidth = totalWidth + preciseWidth;
		columnStructure = columnSettings.addNewStructure();
		columnStructure.putInteger(oFF.SacTableConstants.CS_N_COLUMN, i);
		columnStructure.putInteger(oFF.SacTableConstants.CS_N_MIN_WIDTH, minPixelCellWidth);
		columnStructure.putInteger(oFF.SacTableConstants.CS_N_WIDTH, preciseWidth);
		columnStructure.putString(oFF.SacTableConstants.CS_S_ID, oFF.XInteger.convertToHexString(i));
		columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, false);
		columnStructure.putBoolean(oFF.SacTableConstants.CS_B_HAS_WRAP_CELL, false);
		columnStructure.putBoolean(oFF.SacTableConstants.CS_B_EMPTY_COLUMN, false);
		columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, this.m_tableObject.isFreezeHeaderColumns() && freezeUpToColumn < 0 || freezeUpToColumn >= i);
		this.renderColumn(this.m_tableObject.getHeaderColumnList().get(i), columnStructure);
	}
	if (this.m_tableObject.getDataColumnsAmount() > startCol)
	{
		for (i = this.m_tableObject.getPreColumnsAmount() + startCol; i < this.m_tableObject.getPreColumnsAmount() + colEndIndex; i++)
		{
			columnObject = this.m_tableObject.getColumnList().get(i - this.m_tableObject.getPreColumnsAmount());
			preciseWidth = columnObject.getWidth();
			totalWidth = totalWidth + preciseWidth;
			columnStructure = columnSettings.addNewStructure();
			columnStructure.putInteger(oFF.SacTableConstants.CS_N_COLUMN, i - startCol);
			columnStructure.putInteger(oFF.SacTableConstants.CS_N_MIN_WIDTH, minPixelCellWidth);
			columnStructure.putInteger(oFF.SacTableConstants.CS_N_WIDTH, preciseWidth);
			columnStructure.putString(oFF.SacTableConstants.CS_S_ID, oFF.XInteger.convertToHexString(i));
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, this.m_tableObject.getFreezeUpToColumn() >= i);
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_HAS_WRAP_CELL, false);
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_EMPTY_COLUMN, false);
			this.renderColumn(this.m_tableObject.getColumnList().get(i - this.m_tableObject.getPreColumnsAmount()), columnStructure);
		}
	}
	var dataRowAmount = this.m_tableObject.getDataRowAmount();
	var headerRowAmount = this.m_tableObject.getHeaderRowList().size();
	var totalHeight = 20 + this.m_tableObject.getOverallHeight();
	if (showGrid)
	{
		totalHeight = totalHeight + dataRowAmount + headerRowAmount;
	}
	var cellChartInfo = this.m_tableObject.getCellChartInfo();
	if (oFF.XCollectionUtils.hasElements(cellChartInfo))
	{
		var cellChartInfoStructure = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_CELL_CHART_DATA);
		var memberNames = cellChartInfo.getKeysAsIteratorOfString();
		while (memberNames.hasNext())
		{
			var memberName = memberNames.next();
			var cellChartMemberInfo = cellChartInfo.getByKey(memberName);
			var memberCellChartData = cellChartInfoStructure.putNewStructure(memberName);
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_START_COL, cellChartMemberInfo.getStartColumn() - startCol);
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_END_COL, cellChartMemberInfo.getEndColumn() - startCol);
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_START_ROW, cellChartMemberInfo.getStartRow() - startRow);
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_END_ROW, cellChartMemberInfo.getEndRow() - startRow);
			memberCellChartData.putDouble(oFF.SacTableConstants.CCD_N_MIN, cellChartMemberInfo.getMinValue());
			memberCellChartData.putDouble(oFF.SacTableConstants.CCD_N_MAX, cellChartMemberInfo.getMaxValue());
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_MAX_TEXT_HEIGHT, oFF.SacTableConstants.DF_R_N_HEIGHT);
			var columnsList = memberCellChartData.putNewList(oFF.SacTableConstants.CCD_L_COLUMNS);
			var columnsIterator = cellChartMemberInfo.getColumns().getIterator();
			var maxTextWidth = 0;
			while (columnsIterator.hasNext())
			{
				var columnIndex = columnsIterator.next().getInteger();
				columnsList.addInteger(columnIndex);
				maxTextWidth = oFF.XMath.max(oFF.XMath.div(columnSettings.getStructureAt(columnIndex).getIntegerByKey(oFF.SacTableConstants.CS_N_WIDTH), 2), maxTextWidth);
			}
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_MAX_TEXT_WIDTH, maxTextWidth);
		}
	}
	tableJson.putInteger(oFF.SacTableConstants.TD_N_TOTAL_WIDTH, totalWidth);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_TOTAL_HEIGHT, totalHeight);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_START_COL, 0);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_START_ROW, 0);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_CORNER_COL, this.m_tableObject.getPreColumnsAmount() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_CORNER_ROW, this.m_tableObject.getHeaderRowList().size() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_END_COL, this.m_tableObject.getPreColumnsAmount() + this.m_tableObject.getDataColumnsAmount() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_END_ROW, this.m_tableObject.getHeaderRowList().size() + this.m_tableObject.getDataRowAmount() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_LAST_ROW_INDEX, this.m_tableObject.getHeaderRowList().size() + this.m_tableObject.getDataRowAmount() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_WIDGET_WIDTH, totalWidth + 20);
	return titleTokens.putNewList(oFF.SacTableConstants.TE_L_CHILDREN);
};
oFF.SacTableExportHelper.prototype.renderColumn = function(sacTableColumn, columnStructure) {};
oFF.SacTableExportHelper.prototype.renderRow = function(rowList, row, rowIndex, startCol, colEndIndex)
{
	var structure = rowList.addNewStructure();
	structure.putInteger(oFF.SacTableConstants.R_N_HEIGHT, row.getHeight());
	var localId = row.getId();
	if (oFF.isNull(localId))
	{
		localId = oFF.XInteger.convertToHexString(rowIndex);
	}
	structure.putString(oFF.SacTableConstants.C_S_ID, localId);
	structure.putInteger(oFF.SacTableConstants.R_N_ROW, rowIndex);
	structure.putBoolean(oFF.SacTableConstants.R_B_FIXED, row.isFixed());
	structure.putBoolean(oFF.SacTableConstants.R_B_CHANGED_ON_THE_FLY_UNRESPONSIVE, row.isChangedOnTheFlyUnresponsive());
	var cellList = structure.putNewList(oFF.SacTableConstants.R_L_CELLS);
	var stripeColumns = row.getParentTable().isStripeDataColumns();
	var stripeRows = row.getParentTable().isStripeDataRows();
	var i;
	var cell;
	var cellStructure;
	for (i = 0; i < this.m_tableObject.getPreColumnsAmount(); i++)
	{
		cell = row.getCells().get(i);
		cellStructure = this.renderCell(cellList, cell, rowIndex, i);
		this.format(cell, cellStructure);
		this.applyStriping(stripeRows, stripeColumns, i, row, cellStructure, rowIndex);
	}
	for (i = startCol + this.m_tableObject.getPreColumnsAmount(); i < this.m_tableObject.getPreColumnsAmount() + colEndIndex; i++)
	{
		cell = row.getCells().get(i);
		cellStructure = this.renderCell(cellList, cell, rowIndex, i - startCol);
		this.format(cell, cellStructure);
		this.applyStriping(stripeRows, stripeColumns, i - startCol, row, cellStructure, rowIndex);
	}
	return structure;
};
oFF.SacTableExportHelper.prototype.applyStriping = function(stripeRows, stripeColumns, i, row, cellStructure, rowIndex)
{
	var stripeAny = stripeColumns || stripeRows;
	if (stripeAny && i >= row.getParentTable().getPreColumnsAmount() && row.getParentTable().getRowList().contains(row))
	{
		var style = this.getStyle(cellStructure);
		if (oFF.XStringUtils.isNullOrEmpty(style.getStringByKey(oFF.SacTableConstants.ST_S_FILL_COLOR)))
		{
			if (stripeRows && oFF.XMath.mod(rowIndex, 2) === 0)
			{
				style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, oFF.SacTableConstants.SV_ROW_STRIPE_COLOR);
			}
			else if (stripeColumns && oFF.XMath.mod(i, 2) === 0)
			{
				style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, oFF.SacTableConstants.SV_COLUMN_STRIPE_COLOR);
			}
		}
	}
};
oFF.SacTableExportHelper.prototype.getStyle = function(structure)
{
	if (!structure.containsKey(oFF.SacTableConstants.C_M_STYLE))
	{
		structure.putBoolean(oFF.SacTableConstants.C_B_STYLE_UPDATED_BY_USER, true);
		structure.putNewStructure(oFF.SacTableConstants.C_M_STYLE);
	}
	return structure.getStructureByKey(oFF.SacTableConstants.C_M_STYLE);
};
oFF.SacTableExportHelper.prototype.format = function(cellBase, structureToFormat)
{
	var styles = cellBase.getPrioritizedStylesList();
	if (cellBase.isEffectiveTotalsContext())
	{
		structureToFormat.putBoolean(oFF.SacTableConstants.C_B_IS_INA_TOTALS_CONTEXT, true);
	}
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_IS_IN_HIERARCHY, cellBase.isInHierarchy());
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_ALLOW_DRAG_DROP, cellBase.isAllowDragDrop());
	structureToFormat.putInteger(oFF.SacTableConstants.C_N_LEVEL, cellBase.getHierarchyLevel());
	structureToFormat.putInteger(cellBase.getHierarchyPaddingType(), cellBase.getHierarchyPaddingValue() * (1 + cellBase.getHierarchyLevel()));
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_SHOW_DRILL_ICON, cellBase.isShowDrillIcon());
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_EXPANDED, cellBase.isExpanded());
	var color = cellBase.getEffectiveFillColor(styles);
	if (oFF.notNull(color))
	{
		var style = this.getStyle(structureToFormat);
		style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, color);
	}
	this.transferStyledLineToJson(cellBase.getEffectiveStyledLineTop(styles), oFF.SacTableConstants.LP_TOP, structureToFormat);
	this.transferStyledLineToJson(cellBase.getEffectiveStyleLineBottom(styles), oFF.SacTableConstants.LP_BOTTOM, structureToFormat);
	this.transferStyledLineToJson(cellBase.getEffectiveStyledLineLeft(styles), oFF.SacTableConstants.LP_LEFT, structureToFormat);
	this.transferStyledLineToJson(cellBase.getEffectiveStyledLineRight(styles), oFF.SacTableConstants.LP_RIGHT, structureToFormat);
	if (cellBase.isEffectiveFontItalic(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_ITALIC, true);
	}
	if (cellBase.isEffectiveFontBold(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_BOLD, true);
	}
	if (cellBase.isEffectiveFontUnderline(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_UNDERLINE, true);
	}
	if (cellBase.isEffectiveFontStrikeThrough(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_STRIKETHROUGH, true);
	}
	var effectiveFontSize = cellBase.getEffectiveFontSize(styles);
	if (effectiveFontSize > 0)
	{
		this.getFont(structureToFormat).putDouble(oFF.SacTableConstants.FS_N_SIZE, effectiveFontSize);
	}
	var effectiveFontFamily = cellBase.getEffectiveFontFamily(styles);
	if (oFF.notNull(effectiveFontFamily))
	{
		this.getFont(structureToFormat).putString(oFF.SacTableConstants.FS_S_FAMILY, effectiveFontFamily);
	}
	color = cellBase.getEffectiveFontColor(styles);
	if (oFF.notNull(color))
	{
		this.getFont(structureToFormat).putString(oFF.SacTableConstants.FS_S_COLOR, color);
	}
	var effectiveThresholdColor = cellBase.getEffectiveThresholdColor(styles);
	if (oFF.notNull(effectiveThresholdColor))
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_COLOR, effectiveThresholdColor);
	}
	var effectiveThresholdType = cellBase.getEffectiveThresholdType(styles);
	if (effectiveThresholdType === oFF.SacAlertSymbol.GOOD)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_GOOD);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.WARNING)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_WARNING);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.ALERT)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_ALERT);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.DIAMOND)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_DIAMOND);
	}
	var hAlignment = cellBase.getEffectiveHorizontalAlignment(styles);
	var vAlignment = cellBase.getEffectiveVerticalAlignment(styles);
	if (oFF.notNull(hAlignment) || oFF.notNull(vAlignment))
	{
		var alignmentStructure = this.getStyle(structureToFormat).putNewStructure(oFF.SacTableConstants.ST_M_ALIGNMENT);
		if (hAlignment === oFF.SacTableCellHorizontalAlignment.LEFT)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_HORIZONTAL, oFF.SacTableConstants.HA_LEFT);
		}
		else if (hAlignment === oFF.SacTableCellHorizontalAlignment.CENTER)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_HORIZONTAL, oFF.SacTableConstants.HA_CENTER);
		}
		else if (hAlignment === oFF.SacTableCellHorizontalAlignment.RIGHT)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_HORIZONTAL, oFF.SacTableConstants.HA_RIGHT);
		}
		if (vAlignment === oFF.SacTableCellVerticalAlignment.TOP)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_VERTICAL, oFF.SacTableConstants.VA_TOP);
		}
		else if (vAlignment === oFF.SacTableCellVerticalAlignment.MIDDLE)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_VERTICAL, oFF.SacTableConstants.VA_MIDDLE);
		}
		else if (vAlignment === oFF.SacTableCellVerticalAlignment.BOTTOM)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_VERTICAL, oFF.SacTableConstants.VA_BOTTOM);
		}
	}
	return structureToFormat;
};
oFF.SacTableExportHelper.prototype.transferStyledLineToJson = function(effectiveLineStyle, lpKey, structureToFormat)
{
	if (!effectiveLineStyle.isEmpty())
	{
		var line = this.getLineInternal(lpKey, structureToFormat);
		line.putStringNotNullAndNotEmpty(oFF.SacTableConstants.SL_S_COLOR, effectiveLineStyle.getColor());
		if (effectiveLineStyle.getWidth() > -1)
		{
			line.putDouble(oFF.SacTableConstants.SL_N_SIZE, effectiveLineStyle.getWidth());
		}
		if (effectiveLineStyle.hasPadding())
		{
			var paddingStructure = line.putNewStructure(oFF.SacTableConstants.SL_M_PADDING);
			this.applyPadding(paddingStructure, effectiveLineStyle.getLeftPadding(), oFF.SacTableConstants.SLP_N_LEFT);
			this.applyPadding(paddingStructure, effectiveLineStyle.getRightPadding(), oFF.SacTableConstants.SLP_N_RIGHT);
			this.applyPadding(paddingStructure, effectiveLineStyle.getTopPadding(), oFF.SacTableConstants.SLP_N_TOP);
			this.applyPadding(paddingStructure, effectiveLineStyle.getBottomPadding(), oFF.SacTableConstants.SLP_N_BOTTOM);
		}
		var lineStyle = effectiveLineStyle.getLineStyle();
		if (lineStyle === oFF.SacTableLineStyle.DASHED)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_DASHED);
		}
		else if (lineStyle === oFF.SacTableLineStyle.DOTTED)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_DOTTED);
		}
		else if (lineStyle === oFF.SacTableLineStyle.SOLID)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_SOLID);
		}
		else if (lineStyle === oFF.SacTableLineStyle.NONE)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_NONE);
		}
		var linePatternType = effectiveLineStyle.getPatternType();
		if (oFF.notNull(linePatternType))
		{
			var patternStructure = line.putNewStructure(oFF.SacTableConstants.SL_M_PATTERN);
			if (linePatternType === oFF.SacLinePatternType.WHITE_FILL)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_WHITE_FILL);
			}
			else if (linePatternType === oFF.SacLinePatternType.NOFILL)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_NON_FILL);
			}
			else if (linePatternType === oFF.SacLinePatternType.SOLID)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_SOLID);
			}
			else if (linePatternType === oFF.SacLinePatternType.BACKGROUND_IMAGE)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_BACKGROUND, effectiveLineStyle.getPatternBackground());
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_1)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_1, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_2)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_2, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_3)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_3, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_4)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_4, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_5)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_5, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_6)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_6, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_7)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_7, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_8)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_8, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_WIDTH, effectiveLineStyle.getPatternWidth());
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_COLOR, effectiveLineStyle.getPatternColor());
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_BORDER_COLOR, effectiveLineStyle.getPatternBorderColor());
		}
	}
};
oFF.SacTableExportHelper.prototype.applyPadding = function(paddingStructure, padding, paddingKey)
{
	if (padding > -1)
	{
		paddingStructure.putDouble(paddingKey, padding);
	}
};
oFF.SacTableExportHelper.prototype.getLineInternal = function(position, structure)
{
	var style = this.getStyle(structure);
	if (!style.containsKey(oFF.SacTableConstants.ST_L_LINES))
	{
		style.putNewList(oFF.SacTableConstants.ST_L_LINES);
	}
	var lines = style.getListByKey(oFF.SacTableConstants.ST_L_LINES);
	var line = null;
	for (var i = 0; i < lines.size(); i++)
	{
		if (lines.getStructureAt(i).getIntegerByKey(oFF.SacTableConstants.SL_N_POSITION) === position)
		{
			line = lines.getStructureAt(i);
		}
	}
	if (oFF.isNull(line))
	{
		line = lines.addNewStructure();
		line.putInteger(oFF.SacTableConstants.SL_N_SIZE, 1);
		line.putInteger(oFF.SacTableConstants.SL_N_STYLE, 1);
		line.putInteger(oFF.SacTableConstants.SL_N_POSITION, position);
		var padding = line.putNewStructure(oFF.SacTableConstants.SL_M_PADDING);
		if (position === oFF.SacTableConstants.LP_BOTTOM || position === oFF.SacTableConstants.LP_TOP)
		{
			padding.putInteger(oFF.SacTableConstants.SLP_N_RIGHT, oFF.SacTableConstants.LP_RIGHT);
			padding.putInteger(oFF.SacTableConstants.SLP_N_LEFT, oFF.SacTableConstants.LP_RIGHT);
		}
		else
		{
			padding.putInteger(oFF.SacTableConstants.SLP_N_BOTTOM, oFF.SacTableConstants.LP_BOTTOM);
			padding.putInteger(oFF.SacTableConstants.SLP_N_TOP, oFF.SacTableConstants.LP_TOP);
		}
	}
	return line;
};
oFF.SacTableExportHelper.prototype.getFont = function(structure)
{
	var style = this.getStyle(structure);
	var font = style.getStructureByKey(oFF.SacTableConstants.ST_M_FONT);
	if (oFF.isNull(font))
	{
		font = style.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
	}
	return font;
};
oFF.SacTableExportHelper.prototype.renderCell = function(cellList, cellBase, rowIndex, colIndex)
{
	var structure = cellList.addNewStructure();
	structure.putInteger(oFF.SacTableConstants.C_N_ROW, rowIndex);
	structure.putInteger(oFF.SacTableConstants.C_N_COLUMN, colIndex);
	var mergedColumns = cellBase.getMergedColumns();
	var mergedRows = cellBase.getMergedRows();
	if (mergedColumns !== 0 || mergedRows !== 0)
	{
		var mergerStructure = structure.putNewStructure(oFF.SacTableConstants.C_M_MERGED);
		if (mergedColumns >= 0 && mergedRows >= 0)
		{
			if (cellBase.getMergedColumns() > 0)
			{
				mergerStructure.putInteger(oFF.SacTableConstants.CM_N_COLUMNS, cellBase.getMergedColumns());
			}
			if (cellBase.getMergedRows() > 0)
			{
				mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ROWS, cellBase.getMergedRows());
			}
		}
		else
		{
			mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ORIGINAL_COLUMN, colIndex + cellBase.getMergedColumns());
			mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ORIGINAL_ROW, rowIndex + cellBase.getMergedRows());
		}
	}
	if (cellBase.getCommentDocumentId() !== null)
	{
		structure.putInteger(oFF.SacTableConstants.C_N_COMMENT_TYPE, oFF.SacTableConstants.CT_CHILD);
		structure.putString(oFF.SacTableConstants.CS_COMMENT_DOCUMENT_ID, cellBase.getCommentDocumentId());
	}
	var localId = cellBase.getId();
	if (oFF.isNull(localId))
	{
		localId = oFF.XStringUtils.concatenate2(oFF.XInteger.convertToHexString(rowIndex), oFF.XInteger.convertToHexString(colIndex));
	}
	structure.putString(oFF.SacTableConstants.C_S_ID, localId);
	if (!cellBase.isRepeatedHeader() || this.m_tableObject.isRepetitiveHeaderNames())
	{
		structure.putString(oFF.SacTableConstants.C_S_FORMATTED, cellBase.getFormatted());
		structure.putString(oFF.SacTableConstants.C_S_FORMAT_STRING, cellBase.getFormattingPattern());
	}
	else
	{
		structure.putString(oFF.SacTableConstants.C_S_FORMATTED, "");
		structure.putString(oFF.SacTableConstants.C_S_FORMAT_STRING, "");
	}
	structure.putBoolean(oFF.SacTableConstants.C_B_REPEATED_MEMBER_NAME, cellBase.isRepeatedHeader());
	if (cellBase.getPlain() !== null)
	{
		var valueType = cellBase.getPlain().getValueType();
		if (valueType === oFF.XValueType.BOOLEAN)
		{
			structure.putBoolean(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getBoolean(cellBase.getPlain(), false, true));
		}
		else if (valueType === oFF.XValueType.DOUBLE)
		{
			structure.putDouble(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true));
		}
		else if (valueType === oFF.XValueType.LONG)
		{
			structure.putLong(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getLong(cellBase.getPlain(), false, true));
		}
		else if (valueType === oFF.XValueType.INTEGER)
		{
			structure.putInteger(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getInteger(cellBase.getPlain(), false, true));
		}
		else
		{
			structure.putString(oFF.SacTableConstants.C_SN_PLAIN, cellBase.getPlain().getStringRepresentation());
		}
	}
	var effectiveCellType = cellBase.getEffectiveCellType();
	structure.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, effectiveCellType);
	structure.putBoolean(oFF.SacTableConstants.C_B_DRAGGABLE, effectiveCellType === oFF.SacTableConstants.CT_ATTRIBUTE_COL_DIM_HEADER || effectiveCellType === oFF.SacTableConstants.CT_ATTRIBUTE_ROW_DIM_HEADER || effectiveCellType === oFF.SacTableConstants.CT_COL_DIM_HEADER || effectiveCellType === oFF.SacTableConstants.CT_ROW_DIM_HEADER);
	if (cellBase.isEffectiveShowCellChart())
	{
		this.preFormatCellChart(cellBase, structure, rowIndex, colIndex);
	}
	return structure;
};
oFF.SacTableExportHelper.prototype.preFormatCellChart = function(cellBase, structure, rowIndex, colIndex)
{
	var styles = cellBase.getPrioritizedStylesList();
	structure.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_CHART);
	var cellChart = structure.putNewStructure(oFF.SacTableConstants.C_M_CELL_CHART);
	cellChart.putString(oFF.SacTableConstants.CC_S_MEMBER_ID, cellBase.getEffectiveCellChartMemberName(styles));
	var cellChartType = cellBase.getEffectiveCellChartType();
	if (cellChartType === oFF.SacCellChartType.BAR)
	{
		cellChart.putString(oFF.SacTableConstants.CC_S_CHART_TYPE, oFF.SacTableConstants.CCT_BAR);
	}
	else if (cellChartType === oFF.SacCellChartType.VARIANCE_BAR)
	{
		cellChart.putString(oFF.SacTableConstants.CC_S_CHART_TYPE, oFF.SacTableConstants.CCT_VARIANCE_BAR);
	}
	else if (cellChartType === oFF.SacCellChartType.PIN)
	{
		cellChart.putString(oFF.SacTableConstants.CC_S_CHART_TYPE, oFF.SacTableConstants.CCT_VARIANCE_PIN);
	}
	cellChart.putString(oFF.SacTableConstants.CC_S_BAR_COLOR, cellBase.getEffectiveCellChartBarColor(styles));
	cellChart.putString(oFF.SacTableConstants.CC_SU_LINE_COLOR, cellBase.getEffectiveCellChartLineColor(styles));
	cellChart.putBoolean(oFF.SacTableConstants.CC_B_SHOW_VALUE, !cellBase.isEffectiveHideNumberForCellChart());
	cellChart.putString(oFF.SacTableConstants.CC_S_CELL_CHART_ORIENTATION, cellBase.getEffectiveCellChartOrientation() === oFF.SacCellChartOrientation.VERTICAL ? oFF.SacTableConstants.CCO_VERTICAL : oFF.SacTableConstants.CCO_HORIZONTAL);
	var cellChartInfo = this.m_tableObject.getCellChartInfo();
	if (!cellChartInfo.containsKey(cellBase.getEffectiveCellChartMemberName(styles)))
	{
		cellChartInfo.put(cellBase.getEffectiveCellChartMemberName(styles), oFF.CellChartInfo.create(cellBase.getEffectiveCellChartOrientation(), colIndex, rowIndex, oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true)));
	}
	else
	{
		var cellChartMeasureInfo = cellChartInfo.getByKey(cellBase.getEffectiveCellChartMemberName(styles));
		cellChartMeasureInfo.addColumn(colIndex);
		cellChartMeasureInfo.addRow(rowIndex);
		cellChartMeasureInfo.registerValue(oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true));
	}
	return cellChart;
};

oFF.SacTableWidgetRenderHelper = function() {};
oFF.SacTableWidgetRenderHelper.prototype = new oFF.XObject();
oFF.SacTableWidgetRenderHelper.prototype._ff_c = "SacTableWidgetRenderHelper";

oFF.SacTableWidgetRenderHelper.createTableRenderHelper = function(table)
{
	var instance = new oFF.SacTableWidgetRenderHelper();
	instance.initializeRH(table);
	return instance;
};
oFF.SacTableWidgetRenderHelper.prototype.m_tableObject = null;
oFF.SacTableWidgetRenderHelper.prototype.initializeRH = function(tableObject)
{
	this.m_tableObject = tableObject;
};
oFF.SacTableWidgetRenderHelper.prototype.releaseObject = function()
{
	this.m_tableObject = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SacTableWidgetRenderHelper.prototype.getTableObject = function()
{
	return this.m_tableObject;
};
oFF.SacTableWidgetRenderHelper.prototype.fillRowsFromList = function(rowList, prRowList, offset, freezeRows, freezeUpToRows)
{
	var index;
	var rowAmount = rowList.size();
	for (index = 0; index < rowAmount; index++)
	{
		var row = rowList.get(index);
		if (oFF.notNull(row))
		{
			var headerRowStructure = this.renderRow(prRowList, row, index + offset);
			if (freezeRows && freezeUpToRows < 0 || freezeUpToRows >= index + offset)
			{
				headerRowStructure.putBoolean(oFF.SacTableConstants.R_B_FIXED, true);
			}
		}
	}
};
oFF.SacTableWidgetRenderHelper.prototype.fillRowsFromListKeepGaps = function(rowList, prRowList, offset)
{
	var index;
	var rowAmount = rowList.size();
	for (index = 0; index < rowAmount; index++)
	{
		var row = rowList.get(index);
		if (oFF.notNull(row))
		{
			this.renderRow(prRowList, row, index + offset);
		}
		else
		{
			prRowList.addNull();
		}
	}
};
oFF.SacTableWidgetRenderHelper.prototype.renderGenericSettings = function(tableJson)
{
	var featureToggles = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_FEATURE_TOGGLES);
	featureToggles.putBoolean(oFF.SacTableConstants.TD_M_FEATURE_TOGGLES_DIM_HEADER_CELLS_WITH_ICONS, true);
	featureToggles.putBoolean(oFF.SacTableConstants.TD_M_FEATURE_TOGGLES_ACCESSIBILITY_KEYBOARD_SUPPORT, true);
	var style = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_STYLE);
	var font = style.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
	font.putInteger(oFF.SacTableConstants.FS_N_SIZE, 42);
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_REVERSED_HIERARCHY, this.m_tableObject.isReversedHierarchy());
	var title = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_TITLE);
	var titleStyle = title.putNewStructure(oFF.SacTableConstants.TD_M_TITLE_STYLE);
	title.putNewStructure(oFF.SacTableConstants.TD_M_SUBTITLE_STYLE);
	var titleFont = titleStyle.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
	titleFont.putInteger(oFF.SacTableConstants.FS_N_SIZE, 17);
	var titleText = this.m_tableObject.getTitle();
	title.putStringNotNullAndNotEmpty(oFF.SacTableConstants.TD_S_TITLE_TEXT, titleText);
	if (oFF.XStringUtils.isNotNullAndNotEmpty(titleText))
	{
		title.putNewList(oFF.SacTableConstants.TD_L_TITLE_CHUNKS).addString(titleText);
	}
	var titleTokens = title.putNewStructure(oFF.SacTableConstants.TD_M_TOKEN_DATA);
	var titelTokenStyles = titleTokens.putNewStructure(oFF.SacTableConstants.TE_O_STYLES);
	titelTokenStyles.putString("line-height", "");
	titelTokenStyles.putString("text-align", "left");
	titelTokenStyles.putString("font-size", "13px");
	titelTokenStyles.putString("align-items", "center");
	titelTokenStyles.putString("margin-top", "3px");
	titleTokens.putNewStructure(oFF.SacTableConstants.TE_O_ATTRIBUTES);
	titleTokens.putNewList(oFF.SacTableConstants.TE_L_CLASSES).addString("sapReportEngineTokenContainer");
	titleTokens.putString(oFF.SacTableConstants.TE_S_TAG, "div");
	var titleVisible = this.m_tableObject.isShowTableTitle();
	var subtitleVisible = this.m_tableObject.isShowSubTitle();
	var detailsVisible = this.m_tableObject.isShowTableDetails();
	title.putBoolean(oFF.SacTableConstants.TD_B_TITLE_VISIBLE, titleVisible);
	title.putBoolean(oFF.SacTableConstants.TD_B_SUBTITLE_VISIBLE, subtitleVisible);
	title.putBoolean(oFF.SacTableConstants.TD_B_DETAILS_VISIBLE, detailsVisible);
	title.putBoolean(oFF.SacTableConstants.TD_B_EDITABLE, false);
	var titleAreaHeight = 40;
	if (titleVisible && (detailsVisible || subtitleVisible))
	{
		titleAreaHeight = 52;
	}
	else if (!titleVisible && !detailsVisible && !subtitleVisible)
	{
		titleAreaHeight = 0;
	}
	titleStyle.putInteger(oFF.SacTableConstants.TS_N_HEIGHT, titleAreaHeight);
	var i;
	var tableHeight = this.m_tableObject.getHeight();
	var tableWidth = this.m_tableObject.getWidth();
	tableJson.putInteger(oFF.SacTableConstants.TD_N_WIDGET_HEIGHT, tableHeight);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_WIDGET_WIDTH, tableWidth);
	var showGrid = this.m_tableObject.isShowGrid();
	var freezingColumns = this.m_tableObject.isFreezeHeaderColumns() || this.m_tableObject.getFreezeUpToColumn() > -1;
	var freezing = this.m_tableObject.isFreezeHeaderRows() || this.m_tableObject.getFreezeUpToRow() > -1 || freezingColumns;
	var freezeUpToColumn = this.m_tableObject.getFreezeUpToColumn();
	if (freezeUpToColumn > -1 || !this.m_tableObject.isFreezeHeaderColumns())
	{
		tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_COL, freezeUpToColumn);
	}
	else
	{
		tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_COL, this.m_tableObject.getPreColumnsAmount() - 1);
	}
	var freezeUpToRow = this.m_tableObject.getFreezeUpToRow();
	if (freezeUpToRow > -1 || !this.m_tableObject.isFreezeHeaderRows())
	{
		tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_ROW, freezeUpToRow);
	}
	else
	{
		tableJson.putInteger(oFF.SacTableConstants.TD_N_FREEZE_END_ROW, this.m_tableObject.getHeaderRowList().size() - 1);
	}
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_FREEZE_LINES, freezing && this.m_tableObject.isShowFreezeLines());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_HAS_FIXED_ROWS_COLS, freezing);
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_GRID, showGrid);
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_COORDINATE_HEADER, this.m_tableObject.isShowCoordinateHeader());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SHOW_GRID, this.m_tableObject.isShowGrid());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_SUBTITLE_VISIBLE, this.m_tableObject.isShowSubTitle());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_TITLE_VISIBLE, this.m_tableObject.isShowTableTitle());
	tableJson.putBoolean(oFF.SacTableConstants.TD_B_DETAILS_VISIBLE, this.m_tableObject.isShowTableDetails());
	var columnSettings = tableJson.putNewList(oFF.SacTableConstants.TD_L_COLUMN_SETTINGS);
	var availableWidth = tableWidth - 100;
	var columnWidths = this.m_tableObject.getColumnEmWidths();
	var overallSizeUnits = oFF.XStream.of(columnWidths).reduce(oFF.XIntegerValue.create(1),  function(a, b){
		return oFF.XIntegerValue.create(a.getInteger() + b.getInteger());
	}.bind(this)).getInteger();
	var factor = oFF.XMath.div(availableWidth, overallSizeUnits);
	if (factor > 15)
	{
		factor = 15;
	}
	if (factor < 10)
	{
		factor = 10;
	}
	var minPixelCellWidth = this.m_tableObject.getMinCellWidth();
	var maxPixelCellWidth = this.m_tableObject.getMaxCellWidth();
	var preciseWidth;
	var columnObject;
	var headerWidth = 0;
	var dataWidth = 0;
	for (i = 0; i < this.m_tableObject.getPreColumnsAmount(); i++)
	{
		preciseWidth = minPixelCellWidth;
		if (i < columnWidths.size())
		{
			preciseWidth = oFF.XMath.min(maxPixelCellWidth, oFF.XMath.max(columnWidths.get(i).getInteger() * factor, minPixelCellWidth));
		}
		columnObject = this.m_tableObject.getHeaderColumnList().get(i);
		columnObject.setDefaultWidth(preciseWidth);
		headerWidth = headerWidth + preciseWidth;
	}
	var averageWidth = minPixelCellWidth;
	if (this.m_tableObject.getDataColumnsAmount() > 0)
	{
		var accumulator = 0;
		var divisor = oFF.XMath.min(columnWidths.size(), this.m_tableObject.getPreColumnsAmount() + this.m_tableObject.getColumnList().size());
		for (var j = 0; j < divisor; j++)
		{
			accumulator = accumulator + oFF.XMath.min(maxPixelCellWidth, oFF.XMath.max(columnWidths.get(j).getInteger() * factor, minPixelCellWidth));
		}
		averageWidth = oFF.XMath.div(accumulator, divisor);
		for (; i < this.m_tableObject.getPreColumnsAmount() + this.m_tableObject.getColumnList().size(); i++)
		{
			preciseWidth = averageWidth;
			if (i < columnWidths.size())
			{
				preciseWidth = oFF.XMath.min(maxPixelCellWidth, oFF.XMath.max(columnWidths.get(i).getInteger() * factor, minPixelCellWidth));
			}
			dataWidth = dataWidth + preciseWidth;
			columnObject = this.m_tableObject.getColumnList().get(i - this.m_tableObject.getPreColumnsAmount());
			if (oFF.notNull(columnObject))
			{
				columnObject.setDefaultWidth(preciseWidth);
			}
		}
	}
	if (freezingColumns && dataWidth + headerWidth > tableWidth && tableWidth < headerWidth * 2)
	{
		var availableHeaderWidth = oFF.XMath.max(tableWidth / 2, tableWidth - dataWidth);
		var headerCorrectionFactor = oFF.XMath.div(availableHeaderWidth * 1000, headerWidth);
		for (i = 0; i < this.m_tableObject.getPreColumnsAmount(); i++)
		{
			columnObject = this.m_tableObject.getHeaderColumnList().get(i);
			preciseWidth = columnObject.getWidth();
			columnObject.setDefaultWidth(oFF.XMath.div(headerCorrectionFactor * preciseWidth, 1000));
		}
	}
	var totalWidth = 20;
	var columnStructure;
	for (i = 0; i < this.m_tableObject.getPreColumnsAmount(); i++)
	{
		columnObject = this.m_tableObject.getHeaderColumnList().get(i);
		preciseWidth = columnObject.getWidth();
		totalWidth = totalWidth + preciseWidth;
		columnStructure = columnSettings.addNewStructure();
		columnStructure.putInteger(oFF.SacTableConstants.CS_N_COLUMN, i);
		columnStructure.putInteger(oFF.SacTableConstants.CS_N_MIN_WIDTH, minPixelCellWidth);
		columnStructure.putInteger(oFF.SacTableConstants.CS_N_WIDTH, preciseWidth);
		columnStructure.putString(oFF.SacTableConstants.CS_S_ID, oFF.XInteger.convertToHexString(i));
		columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, false);
		columnStructure.putBoolean(oFF.SacTableConstants.CS_B_HAS_WRAP_CELL, false);
		columnStructure.putBoolean(oFF.SacTableConstants.CS_B_EMPTY_COLUMN, false);
		columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, this.m_tableObject.isFreezeHeaderColumns() && freezeUpToColumn < 0 || freezeUpToColumn >= i);
		this.renderColumn(this.m_tableObject.getHeaderColumnList().get(i), columnStructure);
	}
	if (this.m_tableObject.getDataColumnsAmount() > 0)
	{
		for (; i < this.m_tableObject.getPreColumnsAmount() + this.m_tableObject.getColumnList().size(); i++)
		{
			columnObject = this.m_tableObject.getColumnList().get(i - this.m_tableObject.getPreColumnsAmount());
			preciseWidth = oFF.isNull(columnObject) ? averageWidth : columnObject.getWidth();
			totalWidth = totalWidth + preciseWidth;
			columnStructure = columnSettings.addNewStructure();
			columnStructure.putInteger(oFF.SacTableConstants.CS_N_COLUMN, i);
			columnStructure.putInteger(oFF.SacTableConstants.CS_N_MIN_WIDTH, minPixelCellWidth);
			columnStructure.putInteger(oFF.SacTableConstants.CS_N_WIDTH, preciseWidth);
			columnStructure.putString(oFF.SacTableConstants.CS_S_ID, oFF.XInteger.convertToHexString(i));
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, this.m_tableObject.getFreezeUpToColumn() >= i);
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_HAS_WRAP_CELL, false);
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_EMPTY_COLUMN, false);
			this.renderColumn(this.m_tableObject.getColumnList().get(i - this.m_tableObject.getPreColumnsAmount()), columnStructure);
		}
		for (; i < columnWidths.size(); i++)
		{
			columnStructure = columnSettings.addNewStructure();
			totalWidth = totalWidth + averageWidth;
			columnStructure.putInteger(oFF.SacTableConstants.CS_N_COLUMN, i);
			columnStructure.putInteger(oFF.SacTableConstants.CS_N_MIN_WIDTH, minPixelCellWidth);
			columnStructure.putInteger(oFF.SacTableConstants.CS_N_WIDTH, averageWidth);
			columnStructure.putString(oFF.SacTableConstants.CS_S_ID, oFF.XInteger.convertToHexString(i));
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_FIXED, this.m_tableObject.getFreezeUpToColumn() >= i);
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_HAS_WRAP_CELL, false);
			columnStructure.putBoolean(oFF.SacTableConstants.CS_B_EMPTY_COLUMN, false);
		}
	}
	var dataRowAmount = this.m_tableObject.getDataRowAmount();
	var headerRowAmount = this.m_tableObject.getHeaderRowList().size();
	var totalHeight = 20 + this.m_tableObject.getOverallHeight();
	if (showGrid)
	{
		totalHeight = totalHeight + dataRowAmount + headerRowAmount;
	}
	var cellChartInfo = this.m_tableObject.getCellChartInfo();
	if (oFF.XCollectionUtils.hasElements(cellChartInfo))
	{
		var cellChartInfoStructure = tableJson.putNewStructure(oFF.SacTableConstants.TD_M_CELL_CHART_DATA);
		var memberNames = cellChartInfo.getKeysAsIteratorOfString();
		while (memberNames.hasNext())
		{
			var memberName = memberNames.next();
			var cellChartMemberInfo = cellChartInfo.getByKey(memberName);
			var memberCellChartData = cellChartInfoStructure.putNewStructure(memberName);
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_START_COL, cellChartMemberInfo.getStartColumn());
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_END_COL, cellChartMemberInfo.getEndColumn());
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_START_ROW, cellChartMemberInfo.getStartRow());
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_END_ROW, cellChartMemberInfo.getEndRow());
			memberCellChartData.putDouble(oFF.SacTableConstants.CCD_N_MIN, cellChartMemberInfo.getMinValue());
			memberCellChartData.putDouble(oFF.SacTableConstants.CCD_N_MAX, cellChartMemberInfo.getMaxValue());
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_MAX_TEXT_HEIGHT, oFF.SacTableConstants.DF_R_N_HEIGHT);
			var columnsList = memberCellChartData.putNewList(oFF.SacTableConstants.CCD_L_COLUMNS);
			var columnsIterator = cellChartMemberInfo.getColumns().getIterator();
			var maxTextWidth = 0;
			while (columnsIterator.hasNext())
			{
				var columnIndex = columnsIterator.next().getInteger();
				columnsList.addInteger(columnIndex);
				maxTextWidth = oFF.XMath.max(oFF.XMath.div(columnSettings.getStructureAt(columnIndex).getIntegerByKey(oFF.SacTableConstants.CS_N_WIDTH), 2), maxTextWidth);
			}
			memberCellChartData.putInteger(oFF.SacTableConstants.CCD_N_MAX_TEXT_WIDTH, maxTextWidth);
		}
	}
	tableJson.putInteger(oFF.SacTableConstants.TD_N_TOTAL_WIDTH, totalWidth);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_TOTAL_HEIGHT, totalHeight);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_START_COL, 0);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_START_ROW, 0);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_CORNER_COL, this.m_tableObject.getPreColumnsAmount() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_CORNER_ROW, this.m_tableObject.getHeaderRowList().size() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_END_COL, this.m_tableObject.getPreColumnsAmount() + this.m_tableObject.getDataColumnsAmount() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_DATA_REGION_END_ROW, this.m_tableObject.getHeaderRowList().size() + this.m_tableObject.getDataRowAmount() - 1);
	tableJson.putInteger(oFF.SacTableConstants.TD_N_LAST_ROW_INDEX, this.m_tableObject.getHeaderRowList().size() + this.m_tableObject.getDataRowAmount() - 1);
	return titleTokens.putNewList(oFF.SacTableConstants.TE_L_CHILDREN);
};
oFF.SacTableWidgetRenderHelper.prototype.renderColumn = function(sacTableColumn, columnStructure) {};
oFF.SacTableWidgetRenderHelper.prototype.renderRow = function(rowList, row, rowIndex)
{
	var structure = rowList.addNewStructure();
	structure.putInteger(oFF.SacTableConstants.R_N_HEIGHT, row.getHeight());
	var localId = row.getId();
	if (oFF.isNull(localId))
	{
		localId = oFF.XInteger.convertToHexString(rowIndex);
	}
	structure.putString(oFF.SacTableConstants.C_S_ID, localId);
	structure.putInteger(oFF.SacTableConstants.R_N_ROW, rowIndex);
	structure.putBoolean(oFF.SacTableConstants.R_B_FIXED, row.isFixed());
	structure.putBoolean(oFF.SacTableConstants.R_B_CHANGED_ON_THE_FLY_UNRESPONSIVE, row.isChangedOnTheFlyUnresponsive());
	var cellList = structure.putNewList(oFF.SacTableConstants.R_L_CELLS);
	var stripeColumns = row.getParentTable().isStripeDataColumns();
	var stripeRows = row.getParentTable().isStripeDataRows();
	var stripeAny = stripeColumns || stripeRows;
	var cellsSize = row.getCells().size();
	for (var i = 0; i < cellsSize; i++)
	{
		var cell = row.getCells().get(i);
		var cellStructure = oFF.isNull(cell) ? this.renderEmptyCell(cellList, rowIndex, i) : this.renderCell(cellList, cell, rowIndex, i);
		if (oFF.notNull(cell))
		{
			this.format(cell, cellStructure);
		}
		if (oFF.notNull(cell) && stripeAny && i >= row.getParentTable().getPreColumnsAmount() && row.getParentTable().getRowList().contains(row))
		{
			var style = this.getStyle(cellStructure);
			if (oFF.XStringUtils.isNullOrEmpty(style.getStringByKey(oFF.SacTableConstants.ST_S_FILL_COLOR)))
			{
				if (stripeRows && oFF.XMath.mod(rowIndex, 2) === 0)
				{
					style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, oFF.SacTableConstants.SV_ROW_STRIPE_COLOR);
				}
				else if (stripeColumns && oFF.XMath.mod(i, 2) === 0)
				{
					style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, oFF.SacTableConstants.SV_COLUMN_STRIPE_COLOR);
				}
			}
		}
	}
	return structure;
};
oFF.SacTableWidgetRenderHelper.prototype.renderEmptyCell = function(cellList, rowIndex, colIndex)
{
	var structure = cellList.addNewStructure();
	structure.putInteger(oFF.SacTableConstants.C_N_ROW, rowIndex);
	structure.putInteger(oFF.SacTableConstants.C_N_COLUMN, colIndex);
	return structure;
};
oFF.SacTableWidgetRenderHelper.prototype.getStyle = function(structure)
{
	if (!structure.containsKey(oFF.SacTableConstants.C_M_STYLE))
	{
		structure.putBoolean(oFF.SacTableConstants.C_B_STYLE_UPDATED_BY_USER, true);
		structure.putNewStructure(oFF.SacTableConstants.C_M_STYLE);
	}
	return structure.getStructureByKey(oFF.SacTableConstants.C_M_STYLE);
};
oFF.SacTableWidgetRenderHelper.prototype.format = function(cellBase, structureToFormat)
{
	var styles = cellBase.getPrioritizedStylesList();
	if (cellBase.isEffectiveTotalsContext())
	{
		structureToFormat.putBoolean(oFF.SacTableConstants.C_B_IS_INA_TOTALS_CONTEXT, true);
	}
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_IS_IN_HIERARCHY, cellBase.isInHierarchy());
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_ALLOW_DRAG_DROP, cellBase.isAllowDragDrop());
	structureToFormat.putInteger(oFF.SacTableConstants.C_N_LEVEL, cellBase.getHierarchyLevel());
	structureToFormat.putInteger(cellBase.getHierarchyPaddingType(), cellBase.getHierarchyPaddingValue() * (1 + cellBase.getHierarchyLevel()));
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_SHOW_DRILL_ICON, cellBase.isShowDrillIcon());
	structureToFormat.putBoolean(oFF.SacTableConstants.C_B_EXPANDED, cellBase.isExpanded());
	var color = cellBase.getEffectiveFillColor(styles);
	if (oFF.notNull(color))
	{
		var style = this.getStyle(structureToFormat);
		style.putString(oFF.SacTableConstants.ST_S_FILL_COLOR, color);
	}
	if (cellBase.isWrap())
	{
		this.getStyle(structureToFormat).putBoolean(oFF.SacTableConstants.ST_B_WRAP, true);
	}
	this.transferStyledLineToJson(cellBase.getEffectiveStyledLineTop(styles), oFF.SacTableConstants.LP_TOP, structureToFormat);
	this.transferStyledLineToJson(cellBase.getEffectiveStyleLineBottom(styles), oFF.SacTableConstants.LP_BOTTOM, structureToFormat);
	this.transferStyledLineToJson(cellBase.getEffectiveStyledLineLeft(styles), oFF.SacTableConstants.LP_LEFT, structureToFormat);
	this.transferStyledLineToJson(cellBase.getEffectiveStyledLineRight(styles), oFF.SacTableConstants.LP_RIGHT, structureToFormat);
	if (cellBase.isEffectiveFontItalic(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_ITALIC, true);
	}
	if (cellBase.isEffectiveFontBold(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_BOLD, true);
	}
	if (cellBase.isEffectiveFontUnderline(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_UNDERLINE, true);
	}
	if (cellBase.isEffectiveFontStrikeThrough(styles))
	{
		this.getFont(structureToFormat).putBoolean(oFF.SacTableConstants.FS_B_STRIKETHROUGH, true);
	}
	var effectiveFontSize = cellBase.getEffectiveFontSize(styles);
	if (effectiveFontSize > 0)
	{
		this.getFont(structureToFormat).putDouble(oFF.SacTableConstants.FS_N_SIZE, effectiveFontSize);
	}
	var effectiveFontFamily = cellBase.getEffectiveFontFamily(styles);
	if (oFF.notNull(effectiveFontFamily))
	{
		this.getFont(structureToFormat).putString(oFF.SacTableConstants.FS_S_FAMILY, effectiveFontFamily);
	}
	color = cellBase.getEffectiveFontColor(styles);
	if (oFF.notNull(color))
	{
		this.getFont(structureToFormat).putString(oFF.SacTableConstants.FS_S_COLOR, color);
	}
	var effectiveThresholdColor = cellBase.getEffectiveThresholdColor(styles);
	if (oFF.notNull(effectiveThresholdColor))
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_COLOR, effectiveThresholdColor);
	}
	var effectiveThresholdType = cellBase.getEffectiveThresholdType(styles);
	if (effectiveThresholdType === oFF.SacAlertSymbol.GOOD)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_GOOD);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.WARNING)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_WARNING);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.ALERT)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_ALERT);
	}
	else if (effectiveThresholdType === oFF.SacAlertSymbol.DIAMOND)
	{
		this.getStyle(structureToFormat).putString(oFF.SacTableConstants.ST_S_THRESHOLD_ICON_TYPE, oFF.SacTableConstants.TIT_DIAMOND);
	}
	var hAlignment = cellBase.getEffectiveHorizontalAlignment(styles);
	var vAlignment = cellBase.getEffectiveVerticalAlignment(styles);
	if (oFF.notNull(hAlignment) || oFF.notNull(vAlignment))
	{
		var alignmentStructure = this.getStyle(structureToFormat).putNewStructure(oFF.SacTableConstants.ST_M_ALIGNMENT);
		if (hAlignment === oFF.SacTableCellHorizontalAlignment.LEFT)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_HORIZONTAL, oFF.SacTableConstants.HA_LEFT);
		}
		else if (hAlignment === oFF.SacTableCellHorizontalAlignment.CENTER)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_HORIZONTAL, oFF.SacTableConstants.HA_CENTER);
		}
		else if (hAlignment === oFF.SacTableCellHorizontalAlignment.RIGHT)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_HORIZONTAL, oFF.SacTableConstants.HA_RIGHT);
		}
		if (vAlignment === oFF.SacTableCellVerticalAlignment.TOP)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_VERTICAL, oFF.SacTableConstants.VA_TOP);
		}
		else if (vAlignment === oFF.SacTableCellVerticalAlignment.MIDDLE)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_VERTICAL, oFF.SacTableConstants.VA_MIDDLE);
		}
		else if (vAlignment === oFF.SacTableCellVerticalAlignment.BOTTOM)
		{
			alignmentStructure.putInteger(oFF.SacTableConstants.STAL_N_VERTICAL, oFF.SacTableConstants.VA_BOTTOM);
		}
	}
	return structureToFormat;
};
oFF.SacTableWidgetRenderHelper.prototype.transferStyledLineToJson = function(effectiveLineStyle, lpKey, structureToFormat)
{
	if (!effectiveLineStyle.isEmpty())
	{
		var line = this.getLineInternal(lpKey, structureToFormat);
		line.putStringNotNullAndNotEmpty(oFF.SacTableConstants.SL_S_COLOR, effectiveLineStyle.getColor());
		if (effectiveLineStyle.getWidth() > -1)
		{
			line.putDouble(oFF.SacTableConstants.SL_N_SIZE, effectiveLineStyle.getWidth());
		}
		if (effectiveLineStyle.hasPadding())
		{
			var paddingStructure = line.putNewStructure(oFF.SacTableConstants.SL_M_PADDING);
			this.applyPadding(paddingStructure, effectiveLineStyle.getLeftPadding(), oFF.SacTableConstants.SLP_N_LEFT);
			this.applyPadding(paddingStructure, effectiveLineStyle.getRightPadding(), oFF.SacTableConstants.SLP_N_RIGHT);
			this.applyPadding(paddingStructure, effectiveLineStyle.getTopPadding(), oFF.SacTableConstants.SLP_N_TOP);
			this.applyPadding(paddingStructure, effectiveLineStyle.getBottomPadding(), oFF.SacTableConstants.SLP_N_BOTTOM);
		}
		var lineStyle = effectiveLineStyle.getLineStyle();
		if (lineStyle === oFF.SacTableLineStyle.DASHED)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_DASHED);
		}
		else if (lineStyle === oFF.SacTableLineStyle.DOTTED)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_DOTTED);
		}
		else if (lineStyle === oFF.SacTableLineStyle.SOLID)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_SOLID);
		}
		else if (lineStyle === oFF.SacTableLineStyle.NONE)
		{
			line.putInteger(oFF.SacTableConstants.SL_N_STYLE, oFF.SacTableConstants.LS_NONE);
		}
		var linePatternType = effectiveLineStyle.getPatternType();
		if (oFF.notNull(linePatternType))
		{
			var patternStructure = line.putNewStructure(oFF.SacTableConstants.SL_M_PATTERN);
			if (linePatternType === oFF.SacLinePatternType.WHITE_FILL)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_WHITE_FILL);
			}
			else if (linePatternType === oFF.SacLinePatternType.NOFILL)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_NON_FILL);
			}
			else if (linePatternType === oFF.SacLinePatternType.SOLID)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_SOLID);
			}
			else if (linePatternType === oFF.SacLinePatternType.BACKGROUND_IMAGE)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_BACKGROUND, effectiveLineStyle.getPatternBackground());
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_1)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_1, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_2)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_2, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_3)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_3, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_4)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_4, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_5)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_5, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_6)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_6, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_7)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_7, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			else if (linePatternType === oFF.SacLinePatternType.HATCHIING_8)
			{
				patternStructure.putInteger(oFF.SacTableConstants.LP_N_STYLE, oFF.SacTableConstants.LPT_BACKGROUND_IMAGE);
				patternStructure.putString(oFF.SacTableConstants.LP_S_BACKGROUND, oFF.XStringUtils.concatenate3(oFF.SacTableConstants.IMG_B64_PREFIX, oFF.SacTableConstants.BASE64_SVG_HATCHING_8, oFF.SacTableConstants.IMG_B64_SUFFIX));
			}
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_WIDTH, effectiveLineStyle.getPatternWidth());
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_COLOR, effectiveLineStyle.getPatternColor());
			patternStructure.putStringNotNullAndNotEmpty(oFF.SacTableConstants.LP_S_BORDER_COLOR, effectiveLineStyle.getPatternBorderColor());
		}
	}
};
oFF.SacTableWidgetRenderHelper.prototype.applyPadding = function(paddingStructure, padding, paddingKey)
{
	if (padding > -1)
	{
		paddingStructure.putDouble(paddingKey, padding);
	}
};
oFF.SacTableWidgetRenderHelper.prototype.getLineInternal = function(position, structure)
{
	var style = this.getStyle(structure);
	if (!style.containsKey(oFF.SacTableConstants.ST_L_LINES))
	{
		style.putNewList(oFF.SacTableConstants.ST_L_LINES);
	}
	var lines = style.getListByKey(oFF.SacTableConstants.ST_L_LINES);
	var line = null;
	for (var i = 0; i < lines.size(); i++)
	{
		if (lines.getStructureAt(i).getIntegerByKey(oFF.SacTableConstants.SL_N_POSITION) === position)
		{
			line = lines.getStructureAt(i);
		}
	}
	if (oFF.isNull(line))
	{
		line = lines.addNewStructure();
		line.putInteger(oFF.SacTableConstants.SL_N_SIZE, 1);
		line.putInteger(oFF.SacTableConstants.SL_N_STYLE, 1);
		line.putInteger(oFF.SacTableConstants.SL_N_POSITION, position);
		var padding = line.putNewStructure(oFF.SacTableConstants.SL_M_PADDING);
		if (position === oFF.SacTableConstants.LP_BOTTOM || position === oFF.SacTableConstants.LP_TOP)
		{
			padding.putInteger(oFF.SacTableConstants.SLP_N_RIGHT, oFF.SacTableConstants.LP_RIGHT);
			padding.putInteger(oFF.SacTableConstants.SLP_N_LEFT, oFF.SacTableConstants.LP_RIGHT);
		}
		else
		{
			padding.putInteger(oFF.SacTableConstants.SLP_N_BOTTOM, oFF.SacTableConstants.LP_BOTTOM);
			padding.putInteger(oFF.SacTableConstants.SLP_N_TOP, oFF.SacTableConstants.LP_TOP);
		}
	}
	return line;
};
oFF.SacTableWidgetRenderHelper.prototype.getFont = function(structure)
{
	var style = this.getStyle(structure);
	var font = style.getStructureByKey(oFF.SacTableConstants.ST_M_FONT);
	if (oFF.isNull(font))
	{
		font = style.putNewStructure(oFF.SacTableConstants.ST_M_FONT);
	}
	return font;
};
oFF.SacTableWidgetRenderHelper.prototype.renderCell = function(cellList, cellBase, rowIndex, colIndex)
{
	var structure = cellList.addNewStructure();
	structure.putInteger(oFF.SacTableConstants.C_N_ROW, rowIndex);
	structure.putInteger(oFF.SacTableConstants.C_N_COLUMN, colIndex);
	var mergedColumns = cellBase.getMergedColumns();
	var mergedRows = cellBase.getMergedRows();
	if (mergedColumns !== 0 || mergedRows !== 0)
	{
		var mergerStructure = structure.putNewStructure(oFF.SacTableConstants.C_M_MERGED);
		if (mergedColumns >= 0 && mergedRows >= 0)
		{
			if (cellBase.getMergedColumns() > 0)
			{
				mergerStructure.putInteger(oFF.SacTableConstants.CM_N_COLUMNS, cellBase.getMergedColumns());
			}
			if (cellBase.getMergedRows() > 0)
			{
				mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ROWS, cellBase.getMergedRows());
			}
		}
		else
		{
			mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ORIGINAL_COLUMN, colIndex + cellBase.getMergedColumns());
			mergerStructure.putInteger(oFF.SacTableConstants.CM_N_ORIGINAL_ROW, rowIndex + cellBase.getMergedRows());
		}
	}
	if (cellBase.getCommentDocumentId() !== null)
	{
		structure.putInteger(oFF.SacTableConstants.C_N_COMMENT_TYPE, oFF.SacTableConstants.CT_CHILD);
		structure.putString(oFF.SacTableConstants.CS_COMMENT_DOCUMENT_ID, cellBase.getCommentDocumentId());
	}
	var localId = cellBase.getId();
	if (oFF.isNull(localId))
	{
		localId = oFF.XStringUtils.concatenate2(oFF.XInteger.convertToHexString(rowIndex), oFF.XInteger.convertToHexString(colIndex));
	}
	structure.putString(oFF.SacTableConstants.C_S_ID, localId);
	if (!cellBase.isRepeatedHeader() || this.m_tableObject.isRepetitiveHeaderNames())
	{
		structure.putString(oFF.SacTableConstants.C_S_FORMATTED, cellBase.getFormatted());
	}
	else
	{
		structure.putString(oFF.SacTableConstants.C_S_FORMATTED, "");
	}
	structure.putBoolean(oFF.SacTableConstants.C_B_REPEATED_MEMBER_NAME, cellBase.isRepeatedHeader());
	if (cellBase.getPlain() !== null)
	{
		var valueType = cellBase.getPlain().getValueType();
		if (valueType === oFF.XValueType.BOOLEAN)
		{
			structure.putBoolean(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getBoolean(cellBase.getPlain(), false, true));
		}
		else if (valueType === oFF.XValueType.DOUBLE)
		{
			structure.putDouble(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true));
		}
		else if (valueType === oFF.XValueType.LONG)
		{
			structure.putLong(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getLong(cellBase.getPlain(), false, true));
		}
		else if (valueType === oFF.XValueType.INTEGER)
		{
			structure.putInteger(oFF.SacTableConstants.C_SN_PLAIN, oFF.XValueUtil.getInteger(cellBase.getPlain(), false, true));
		}
		else
		{
			structure.putString(oFF.SacTableConstants.C_SN_PLAIN, cellBase.getPlain().getStringRepresentation());
		}
	}
	var effectiveCellType = cellBase.getEffectiveCellType();
	structure.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, effectiveCellType);
	structure.putBoolean(oFF.SacTableConstants.C_B_DRAGGABLE, effectiveCellType === oFF.SacTableConstants.CT_ATTRIBUTE_COL_DIM_HEADER || effectiveCellType === oFF.SacTableConstants.CT_ATTRIBUTE_ROW_DIM_HEADER || effectiveCellType === oFF.SacTableConstants.CT_COL_DIM_HEADER || effectiveCellType === oFF.SacTableConstants.CT_ROW_DIM_HEADER);
	if (cellBase.isEffectiveShowCellChart())
	{
		this.preFormatCellChart(cellBase, structure, rowIndex, colIndex);
	}
	return structure;
};
oFF.SacTableWidgetRenderHelper.prototype.preFormatCellChart = function(cellBase, structure, rowIndex, colIndex)
{
	var styles = cellBase.getPrioritizedStylesList();
	structure.putInteger(oFF.SacTableConstants.C_N_CELL_TYPE, oFF.SacTableConstants.CT_CHART);
	var cellChart = structure.putNewStructure(oFF.SacTableConstants.C_M_CELL_CHART);
	cellChart.putString(oFF.SacTableConstants.CC_S_MEMBER_ID, cellBase.getEffectiveCellChartMemberName(styles));
	var cellChartType = cellBase.getEffectiveCellChartType();
	if (cellChartType === oFF.SacCellChartType.BAR)
	{
		cellChart.putString(oFF.SacTableConstants.CC_S_CHART_TYPE, oFF.SacTableConstants.CCT_BAR);
	}
	else if (cellChartType === oFF.SacCellChartType.VARIANCE_BAR)
	{
		cellChart.putString(oFF.SacTableConstants.CC_S_CHART_TYPE, oFF.SacTableConstants.CCT_VARIANCE_BAR);
	}
	else if (cellChartType === oFF.SacCellChartType.PIN)
	{
		cellChart.putString(oFF.SacTableConstants.CC_S_CHART_TYPE, oFF.SacTableConstants.CCT_VARIANCE_PIN);
	}
	cellChart.putString(oFF.SacTableConstants.CC_S_BAR_COLOR, cellBase.getEffectiveCellChartBarColor(styles));
	cellChart.putString(oFF.SacTableConstants.CC_SU_LINE_COLOR, cellBase.getEffectiveCellChartLineColor(styles));
	cellChart.putBoolean(oFF.SacTableConstants.CC_B_SHOW_VALUE, !cellBase.isEffectiveHideNumberForCellChart());
	cellChart.putString(oFF.SacTableConstants.CC_S_CELL_CHART_ORIENTATION, cellBase.getEffectiveCellChartOrientation() === oFF.SacCellChartOrientation.VERTICAL ? oFF.SacTableConstants.CCO_VERTICAL : oFF.SacTableConstants.CCO_HORIZONTAL);
	var cellChartInfo = this.m_tableObject.getCellChartInfo();
	if (!cellChartInfo.containsKey(cellBase.getEffectiveCellChartMemberName(styles)))
	{
		cellChartInfo.put(cellBase.getEffectiveCellChartMemberName(styles), oFF.CellChartInfo.create(cellBase.getEffectiveCellChartOrientation(), colIndex, rowIndex, oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true)));
	}
	else
	{
		var cellChartMeasureInfo = cellChartInfo.getByKey(cellBase.getEffectiveCellChartMemberName(styles));
		cellChartMeasureInfo.addColumn(colIndex);
		cellChartMeasureInfo.addRow(rowIndex);
		cellChartMeasureInfo.registerValue(oFF.XValueUtil.getDouble(cellBase.getPlain(), false, true));
	}
	return cellChart;
};

oFF.SacTableXlsRenderHelper = function() {};
oFF.SacTableXlsRenderHelper.prototype = new oFF.XObject();
oFF.SacTableXlsRenderHelper.prototype._ff_c = "SacTableXlsRenderHelper";

oFF.SacTableXlsRenderHelper.createTableRenderHelper = function(tableObject)
{
	var instance = new oFF.SacTableXlsRenderHelper();
	instance.initializeRH(tableObject);
	return instance;
};
oFF.SacTableXlsRenderHelper.prototype.m_tableObject = null;
oFF.SacTableXlsRenderHelper.prototype.initializeRH = function(tableObject)
{
	this.m_tableObject = tableObject;
};
oFF.SacTableXlsRenderHelper.prototype.getTableObject = function()
{
	return this.m_tableObject;
};

oFF.SacDataPath = function() {};
oFF.SacDataPath.prototype = new oFF.XObject();
oFF.SacDataPath.prototype._ff_c = "SacDataPath";

oFF.SacDataPath.create = function()
{
	var instance = new oFF.SacDataPath();
	instance.setup();
	return instance;
};
oFF.SacDataPath.prototype.m_pathElements = null;
oFF.SacDataPath.prototype.setup = function()
{
	this.m_pathElements = oFF.XList.create();
};
oFF.SacDataPath.prototype.releaseObject = function()
{
	this.m_pathElements = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_pathElements);
};
oFF.SacDataPath.prototype.addNewPathElement = function()
{
	var element = oFF.SacDataSectionInfo.create();
	this.m_pathElements.add(element);
	return element;
};
oFF.SacDataPath.prototype.getPathElements = function()
{
	return this.m_pathElements;
};
oFF.SacDataPath.prototype.matchesSectionReference = function(tableAxisSectionReference)
{
	return oFF.XStream.of(tableAxisSectionReference.getDataPaths()).anyMatch( function(element){
		return this.matches(element);
	}.bind(this));
};
oFF.SacDataPath.prototype.matches = function(element)
{
	return oFF.XStream.of(element.getPathElements()).allMatch( function(pathElement){
		return oFF.XStream.of(this.getPathElements()).anyMatch( function(subElement){
			return subElement.matches(pathElement);
		}.bind(this));
	}.bind(this));
};

oFF.SacDataPointStyle = function() {};
oFF.SacDataPointStyle.prototype = new oFF.XObject();
oFF.SacDataPointStyle.prototype._ff_c = "SacDataPointStyle";

oFF.SacDataPointStyle.create = function()
{
	var instance = new oFF.SacDataPointStyle();
	instance.setup();
	return instance;
};
oFF.SacDataPointStyle.prototype.m_exceptionName = null;
oFF.SacDataPointStyle.prototype.m_alertLevelMin = null;
oFF.SacDataPointStyle.prototype.m_alertLevelMax = null;
oFF.SacDataPointStyle.prototype.m_tableStyle = null;
oFF.SacDataPointStyle.prototype.m_valueSign = null;
oFF.SacDataPointStyle.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_tableStyle = oFF.SacTableStyle.create();
};
oFF.SacDataPointStyle.prototype.releaseObject = function()
{
	this.m_exceptionName = null;
	this.m_alertLevelMin = null;
	this.m_alertLevelMax = null;
	this.m_tableStyle = oFF.XObjectExt.release(this.m_tableStyle);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SacDataPointStyle.prototype.getExceptionName = function()
{
	return this.m_exceptionName;
};
oFF.SacDataPointStyle.prototype.setExceptionName = function(exceptionName)
{
	this.m_exceptionName = exceptionName;
};
oFF.SacDataPointStyle.prototype.getAlertLevelMin = function()
{
	return this.m_alertLevelMin;
};
oFF.SacDataPointStyle.prototype.setAlertLevelMin = function(alertLevelMin)
{
	this.m_alertLevelMin = alertLevelMin;
};
oFF.SacDataPointStyle.prototype.getAlertLevelMax = function()
{
	return this.m_alertLevelMax;
};
oFF.SacDataPointStyle.prototype.setAlertLevelMax = function(alertLevelMax)
{
	this.m_alertLevelMax = alertLevelMax;
};
oFF.SacDataPointStyle.prototype.getValueSign = function()
{
	return this.m_valueSign;
};
oFF.SacDataPointStyle.prototype.setValueSign = function(valueSign)
{
	this.m_valueSign = valueSign;
};
oFF.SacDataPointStyle.prototype.getTableStyle = function()
{
	return this.m_tableStyle;
};
oFF.SacDataPointStyle.prototype.getPriority = function()
{
	return this.m_tableStyle.getPriority();
};
oFF.SacDataPointStyle.prototype.setPriority = function(priority)
{
	this.m_tableStyle.setPriority(priority);
};
oFF.SacDataPointStyle.prototype.matchesExceptionInfo = function(exceptionInfo)
{
	var matchesException = oFF.XStringUtils.isNullOrEmpty(this.m_exceptionName) || oFF.XString.isEqual(this.m_exceptionName, exceptionInfo.getExceptionName());
	var fitsLowerBound = oFF.isNull(this.m_alertLevelMin) || this.m_alertLevelMin.getLevel() <= exceptionInfo.getLevel().getLevel();
	var fitsUpperBound = oFF.isNull(this.m_alertLevelMax) || this.m_alertLevelMax.getLevel() >= exceptionInfo.getLevel().getLevel();
	var matchesValueSign = oFF.isNull(this.m_valueSign) || this.getValueSign() === exceptionInfo.getValueSign();
	return matchesException && fitsLowerBound && fitsUpperBound && matchesValueSign;
};

oFF.SacDataSectionInfo = function() {};
oFF.SacDataSectionInfo.prototype = new oFF.XObject();
oFF.SacDataSectionInfo.prototype._ff_c = "SacDataSectionInfo";

oFF.SacDataSectionInfo.create = function()
{
	var instance = new oFF.SacDataSectionInfo();
	instance.setup();
	return instance;
};
oFF.SacDataSectionInfo.prototype.m_groupName = null;
oFF.SacDataSectionInfo.prototype.m_groupLevel = 0;
oFF.SacDataSectionInfo.prototype.m_sectionNodeName = null;
oFF.SacDataSectionInfo.prototype.m_sectionLevelName = null;
oFF.SacDataSectionInfo.prototype.m_sectionLevel = 0;
oFF.SacDataSectionInfo.prototype.m_exactSectionLevel = false;
oFF.SacDataSectionInfo.prototype.m_includeHeaderBand = false;
oFF.SacDataSectionInfo.prototype.m_includeTotalsBand = false;
oFF.SacDataSectionInfo.prototype.m_includeInnerBands = false;
oFF.SacDataSectionInfo.prototype.m_includeAllBands = false;
oFF.SacDataSectionInfo.prototype.setup = function()
{
	this.m_groupLevel = -1;
	this.m_sectionLevel = -1;
};
oFF.SacDataSectionInfo.prototype.getGroupName = function()
{
	return this.m_groupName;
};
oFF.SacDataSectionInfo.prototype.setGroupName = function(groupName)
{
	this.m_groupName = groupName;
};
oFF.SacDataSectionInfo.prototype.getGroupLevel = function()
{
	return this.m_groupLevel;
};
oFF.SacDataSectionInfo.prototype.setGroupLevel = function(groupLevel)
{
	this.m_groupLevel = groupLevel;
};
oFF.SacDataSectionInfo.prototype.getSectionNodeName = function()
{
	return this.m_sectionNodeName;
};
oFF.SacDataSectionInfo.prototype.setSectionNodeName = function(sectionName)
{
	this.m_sectionNodeName = sectionName;
};
oFF.SacDataSectionInfo.prototype.getSectionLevelName = function()
{
	return this.m_sectionLevelName;
};
oFF.SacDataSectionInfo.prototype.setSectionLevelName = function(sectionLevelName)
{
	this.m_sectionLevelName = sectionLevelName;
};
oFF.SacDataSectionInfo.prototype.getSectionLevel = function()
{
	return this.m_sectionLevel;
};
oFF.SacDataSectionInfo.prototype.setSectionLevel = function(sectionLevel)
{
	this.m_sectionLevel = sectionLevel;
};
oFF.SacDataSectionInfo.prototype.isExactSectionLevel = function()
{
	return this.m_exactSectionLevel;
};
oFF.SacDataSectionInfo.prototype.setExactSectionLevel = function(exactSectionLevel)
{
	this.m_exactSectionLevel = exactSectionLevel;
};
oFF.SacDataSectionInfo.prototype.isIncludeHeaderBand = function()
{
	return this.m_includeHeaderBand;
};
oFF.SacDataSectionInfo.prototype.setIncludeHeaderBand = function(includeHeaderBand)
{
	this.m_includeAllBands = false;
	this.m_includeHeaderBand = includeHeaderBand;
};
oFF.SacDataSectionInfo.prototype.isIncludeTotalsBand = function()
{
	return this.m_includeTotalsBand;
};
oFF.SacDataSectionInfo.prototype.setIncludeTotalsBand = function(includeTotalsBand)
{
	this.m_includeAllBands = false;
	this.m_includeTotalsBand = includeTotalsBand;
};
oFF.SacDataSectionInfo.prototype.isIncludeInnerBands = function()
{
	return this.m_includeInnerBands;
};
oFF.SacDataSectionInfo.prototype.setIncludeInnerBands = function(includeInnerBands)
{
	this.m_includeAllBands = false;
	this.m_includeInnerBands = includeInnerBands;
};
oFF.SacDataSectionInfo.prototype.isIncludeAllBands = function()
{
	return this.m_includeAllBands;
};
oFF.SacDataSectionInfo.prototype.setIncludeAllBands = function(includeAllBands)
{
	if (includeAllBands)
	{
		this.m_includeHeaderBand = false;
		this.m_includeInnerBands = false;
		this.m_includeTotalsBand = false;
	}
	this.m_includeAllBands = includeAllBands;
};
oFF.SacDataSectionInfo.prototype.matches = function(element)
{
	return (element.isIncludeAllBands() || (this.isIncludeHeaderBand() === element.isIncludeHeaderBand() && this.isIncludeTotalsBand() === element.isIncludeTotalsBand() && this.isIncludeInnerBands() === element.isIncludeInnerBands())) && (!element.isExactSectionLevel() || this.isExactSectionLevel()) && (element.getGroupLevel() === -1 || this.getGroupLevel() === element.getGroupLevel()) && (element.getSectionLevel() === -1 || this.getSectionLevel() === element.getSectionLevel()) && (oFF.XStringUtils.isNullOrEmpty(element.getGroupName()) || oFF.XString.isEqual(element.getGroupName(), this.getGroupName())) && (oFF.XStringUtils.isNullOrEmpty(element.getSectionLevelName()) || oFF.XString.isEqual(element.getSectionLevelName(), this.getSectionLevelName())) && (oFF.XStringUtils.isNullOrEmpty(element.getSectionNodeName()) || oFF.XString.isEqual(element.getSectionNodeName(), this.getSectionNodeName()));
};

oFF.SacExceptionInfo = function() {};
oFF.SacExceptionInfo.prototype = new oFF.XObject();
oFF.SacExceptionInfo.prototype._ff_c = "SacExceptionInfo";

oFF.SacExceptionInfo.create = function()
{
	return new oFF.SacExceptionInfo();
};
oFF.SacExceptionInfo.prototype.m_exceptionName = null;
oFF.SacExceptionInfo.prototype.m_level = null;
oFF.SacExceptionInfo.prototype.m_valueSign = null;
oFF.SacExceptionInfo.prototype.getExceptionName = function()
{
	return this.m_exceptionName;
};
oFF.SacExceptionInfo.prototype.setExceptionName = function(exceptionName)
{
	this.m_exceptionName = exceptionName;
};
oFF.SacExceptionInfo.prototype.getLevel = function()
{
	return this.m_level;
};
oFF.SacExceptionInfo.prototype.setLevel = function(level)
{
	this.m_level = level;
};
oFF.SacExceptionInfo.prototype.getValueSign = function()
{
	return this.m_valueSign;
};
oFF.SacExceptionInfo.prototype.setValueSign = function(valueSign)
{
	this.m_valueSign = valueSign;
};

oFF.SacHeaderSectionInfo = function() {};
oFF.SacHeaderSectionInfo.prototype = new oFF.XObject();
oFF.SacHeaderSectionInfo.prototype._ff_c = "SacHeaderSectionInfo";

oFF.SacHeaderSectionInfo.create = function()
{
	var instance = new oFF.SacHeaderSectionInfo();
	instance.setup();
	return instance;
};
oFF.SacHeaderSectionInfo.prototype.m_headerName = null;
oFF.SacHeaderSectionInfo.prototype.m_headerLevel = 0;
oFF.SacHeaderSectionInfo.prototype.m_exactHeaderLevel = false;
oFF.SacHeaderSectionInfo.prototype.setup = function()
{
	this.m_headerLevel = -1;
};
oFF.SacHeaderSectionInfo.prototype.getHeaderName = function()
{
	return this.m_headerName;
};
oFF.SacHeaderSectionInfo.prototype.setHeaderName = function(headerName)
{
	this.m_headerName = headerName;
};
oFF.SacHeaderSectionInfo.prototype.getHeaderLevel = function()
{
	return this.m_headerLevel;
};
oFF.SacHeaderSectionInfo.prototype.setHeaderLevel = function(headerLevel)
{
	this.m_headerLevel = headerLevel;
};
oFF.SacHeaderSectionInfo.prototype.isExactHeaderLevel = function()
{
	return this.m_exactHeaderLevel;
};
oFF.SacHeaderSectionInfo.prototype.setExactHeaderLevel = function(exactLevel)
{
	this.m_exactHeaderLevel = exactLevel;
};
oFF.SacHeaderSectionInfo.prototype.matchesSectionReference = function(tableAxisSectionReference)
{
	return oFF.XStream.of(tableAxisSectionReference.getHeaderSectionInfos()).anyMatch( function(element){
		return this.matches(element);
	}.bind(this));
};
oFF.SacHeaderSectionInfo.prototype.matches = function(element)
{
	return (!element.isExactHeaderLevel() || this.isExactHeaderLevel()) && (element.getHeaderLevel() === -1 || this.getHeaderLevel() === element.getHeaderLevel()) && (oFF.XStringUtils.isNullOrEmpty(element.getHeaderName()) || oFF.XString.isEqual(element.getHeaderName(), this.getHeaderName()));
};

oFF.SacInsertedTuple = function() {};
oFF.SacInsertedTuple.prototype = new oFF.XObject();
oFF.SacInsertedTuple.prototype._ff_c = "SacInsertedTuple";

oFF.SacInsertedTuple.create = function()
{
	var instance = new oFF.SacInsertedTuple();
	instance.setup();
	return instance;
};
oFF.SacInsertedTuple.prototype.m_scopedStyles = null;
oFF.SacInsertedTuple.prototype.m_paletteBasedStyles = null;
oFF.SacInsertedTuple.prototype.m_merged = false;
oFF.SacInsertedTuple.prototype.m_formattedText = null;
oFF.SacInsertedTuple.prototype.m_cellHeight = 0;
oFF.SacInsertedTuple.prototype.m_cellWidth = 0;
oFF.SacInsertedTuple.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_scopedStyles = oFF.XList.create();
	this.m_paletteBasedStyles = oFF.XList.create();
};
oFF.SacInsertedTuple.prototype.releaseObject = function()
{
	this.m_merged = false;
	this.m_formattedText = null;
	this.m_cellHeight = 0;
	this.m_cellWidth = 0;
	this.m_scopedStyles = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_scopedStyles);
	this.m_paletteBasedStyles = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_paletteBasedStyles);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SacInsertedTuple.prototype.getScopedStyles = function()
{
	return this.m_scopedStyles;
};
oFF.SacInsertedTuple.prototype.addNewScopedStyle = function()
{
	var scopedStyle = oFF.SacScopedStyle.create();
	this.m_scopedStyles.add(scopedStyle);
	return scopedStyle;
};
oFF.SacInsertedTuple.prototype.getPaletteBasedStyles = function()
{
	return this.m_paletteBasedStyles;
};
oFF.SacInsertedTuple.prototype.addNewPaletteBasedStyle = function()
{
	var paletteBasedStyle = oFF.SacPaletteBasedStyle.create();
	this.m_paletteBasedStyles.add(paletteBasedStyle);
	return paletteBasedStyle;
};
oFF.SacInsertedTuple.prototype.isMerged = function()
{
	return this.m_merged;
};
oFF.SacInsertedTuple.prototype.setMerged = function(merged)
{
	this.m_merged = merged;
};
oFF.SacInsertedTuple.prototype.getFormattedText = function()
{
	return this.m_formattedText;
};
oFF.SacInsertedTuple.prototype.setFormattedText = function(formattedText)
{
	this.m_formattedText = formattedText;
};
oFF.SacInsertedTuple.prototype.getCellHeight = function()
{
	return this.m_cellHeight;
};
oFF.SacInsertedTuple.prototype.setCellHeight = function(cellHeight)
{
	this.m_cellHeight = cellHeight;
};
oFF.SacInsertedTuple.prototype.getCellWidth = function()
{
	return this.m_cellWidth;
};
oFF.SacInsertedTuple.prototype.setCellWidth = function(cellWidth)
{
	this.m_cellWidth = cellWidth;
};

oFF.SacPaletteBasedStyle = function() {};
oFF.SacPaletteBasedStyle.prototype = new oFF.XObject();
oFF.SacPaletteBasedStyle.prototype._ff_c = "SacPaletteBasedStyle";

oFF.SacPaletteBasedStyle.create = function()
{
	var instance = new oFF.SacPaletteBasedStyle();
	instance.setup();
	return instance;
};
oFF.SacPaletteBasedStyle.prototype.m_stylePalette = null;
oFF.SacPaletteBasedStyle.prototype.m_dataPath = null;
oFF.SacPaletteBasedStyle.prototype.m_axisType = null;
oFF.SacPaletteBasedStyle.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_stylePalette = oFF.SacStylePalette.create();
	this.m_dataPath = oFF.SacDataPath.create();
};
oFF.SacPaletteBasedStyle.prototype.releaseObject = function()
{
	this.m_stylePalette = oFF.XObjectExt.release(this.m_stylePalette);
	this.m_dataPath = oFF.XObjectExt.release(this.m_dataPath);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SacPaletteBasedStyle.prototype.getStylePalette = function()
{
	return this.m_stylePalette;
};
oFF.SacPaletteBasedStyle.prototype.getDataPath = function()
{
	return this.m_dataPath;
};
oFF.SacPaletteBasedStyle.prototype.getAxisType = function()
{
	return this.m_axisType;
};
oFF.SacPaletteBasedStyle.prototype.setAxisType = function(axisType)
{
	this.m_axisType = axisType;
};

oFF.SacScopedStyle = function() {};
oFF.SacScopedStyle.prototype = new oFF.XObject();
oFF.SacScopedStyle.prototype._ff_c = "SacScopedStyle";

oFF.SacScopedStyle.create = function()
{
	var instance = new oFF.SacScopedStyle();
	instance.setup();
	return instance;
};
oFF.SacScopedStyle.prototype.m_style = null;
oFF.SacScopedStyle.prototype.m_orthogonalRowsRestriction = null;
oFF.SacScopedStyle.prototype.m_orthogonalColumnsRestriction = null;
oFF.SacScopedStyle.prototype.setup = function()
{
	this.m_style = oFF.SacTableStyle.create();
	this.m_orthogonalColumnsRestriction = oFF.SacTableAxisSectionReference.create();
	this.m_orthogonalRowsRestriction = oFF.SacTableAxisSectionReference.create();
};
oFF.SacScopedStyle.prototype.releaseObject = function()
{
	this.m_style = oFF.XObjectExt.release(this.m_style);
	this.m_orthogonalRowsRestriction = oFF.XObjectExt.release(this.m_orthogonalRowsRestriction);
	this.m_orthogonalColumnsRestriction = oFF.XObjectExt.release(this.m_orthogonalColumnsRestriction);
};
oFF.SacScopedStyle.prototype.getStyle = function()
{
	return this.m_style;
};
oFF.SacScopedStyle.prototype.getOrthogonalRowsRestriction = function()
{
	return this.m_orthogonalRowsRestriction;
};
oFF.SacScopedStyle.prototype.getOrthogonalColumnsRestriction = function()
{
	return this.m_orthogonalColumnsRestriction;
};

oFF.SacStylePalette = function() {};
oFF.SacStylePalette.prototype = new oFF.XObject();
oFF.SacStylePalette.prototype._ff_c = "SacStylePalette";

oFF.SacStylePalette.create = function()
{
	var instance = new oFF.SacStylePalette();
	instance.setup();
	return instance;
};
oFF.SacStylePalette.prototype.m_styles = null;
oFF.SacStylePalette.prototype.setup = function()
{
	oFF.XObject.prototype.setup.call( this );
	this.m_styles = oFF.XList.create();
};
oFF.SacStylePalette.prototype.releaseObject = function()
{
	this.m_styles = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_styles);
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SacStylePalette.prototype.getStyles = function()
{
	return this.m_styles;
};
oFF.SacStylePalette.prototype.addNewStyle = function()
{
	var newStyle = oFF.SacTableStyle.create();
	this.m_styles.add(newStyle);
	return newStyle;
};
oFF.SacStylePalette.prototype.clear = function()
{
	this.m_styles.clear();
};

oFF.SacTableAxisSectionReference = function() {};
oFF.SacTableAxisSectionReference.prototype = new oFF.XObject();
oFF.SacTableAxisSectionReference.prototype._ff_c = "SacTableAxisSectionReference";

oFF.SacTableAxisSectionReference.create = function()
{
	var instance = new oFF.SacTableAxisSectionReference();
	instance.setup();
	return instance;
};
oFF.SacTableAxisSectionReference.prototype.m_minHeaderSectionInfo = null;
oFF.SacTableAxisSectionReference.prototype.m_maxHeaderSectionInfo = null;
oFF.SacTableAxisSectionReference.prototype.m_headerSectionInfos = null;
oFF.SacTableAxisSectionReference.prototype.m_matchHeaderSectionStart = false;
oFF.SacTableAxisSectionReference.prototype.m_matchHeaderSectionEnd = false;
oFF.SacTableAxisSectionReference.prototype.m_matchFullHeaderSection = false;
oFF.SacTableAxisSectionReference.prototype.m_dataPaths = null;
oFF.SacTableAxisSectionReference.prototype.m_matchDataSectionStart = false;
oFF.SacTableAxisSectionReference.prototype.m_matchDataSectionEnd = false;
oFF.SacTableAxisSectionReference.prototype.m_matchFullDataSection = false;
oFF.SacTableAxisSectionReference.prototype.m_matchModulo = 0;
oFF.SacTableAxisSectionReference.prototype.m_matchOrdinal = 0;
oFF.SacTableAxisSectionReference.prototype.setup = function()
{
	this.m_headerSectionInfos = oFF.XList.create();
	this.m_dataPaths = oFF.XList.create();
};
oFF.SacTableAxisSectionReference.prototype.releaseObject = function()
{
	this.m_minHeaderSectionInfo = oFF.XObjectExt.release(this.m_minHeaderSectionInfo);
	this.m_maxHeaderSectionInfo = oFF.XObjectExt.release(this.m_maxHeaderSectionInfo);
	this.m_headerSectionInfos = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_headerSectionInfos);
	this.m_dataPaths = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_dataPaths);
	this.m_matchHeaderSectionStart = false;
	this.m_matchHeaderSectionEnd = false;
	this.m_matchFullHeaderSection = false;
	this.m_matchDataSectionStart = false;
	this.m_matchDataSectionEnd = false;
	this.m_matchFullDataSection = false;
	this.m_matchModulo = 0;
	this.m_matchOrdinal = 0;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.SacTableAxisSectionReference.prototype.getMinHeaderSectionInfoOrCreate = function(createIfNotExists)
{
	if (oFF.isNull(this.m_minHeaderSectionInfo) && createIfNotExists)
	{
		this.m_minHeaderSectionInfo = oFF.SacHeaderSectionInfo.create();
	}
	return this.m_minHeaderSectionInfo;
};
oFF.SacTableAxisSectionReference.prototype.getMaxHeaderSectionInfoOrCreate = function(createIfNotExists)
{
	if (oFF.isNull(this.m_maxHeaderSectionInfo) && createIfNotExists)
	{
		this.m_maxHeaderSectionInfo = oFF.SacHeaderSectionInfo.create();
	}
	return this.m_maxHeaderSectionInfo;
};
oFF.SacTableAxisSectionReference.prototype.getHeaderSectionInfos = function()
{
	return this.m_headerSectionInfos;
};
oFF.SacTableAxisSectionReference.prototype.addNewHeaderSectionInfo = function()
{
	var info = oFF.SacHeaderSectionInfo.create();
	this.m_headerSectionInfos.add(info);
	return info;
};
oFF.SacTableAxisSectionReference.prototype.isMatchHeaderSectionStart = function()
{
	return this.m_matchHeaderSectionStart;
};
oFF.SacTableAxisSectionReference.prototype.setMatchHeaderSectionStart = function(matchHeaderSectionStart)
{
	this.m_matchHeaderSectionStart = matchHeaderSectionStart;
};
oFF.SacTableAxisSectionReference.prototype.isMatchHeaderSectionEnd = function()
{
	return this.m_matchHeaderSectionEnd;
};
oFF.SacTableAxisSectionReference.prototype.setMatchHeaderSectionEnd = function(matchHeaderSectionEnd)
{
	this.m_matchHeaderSectionEnd = matchHeaderSectionEnd;
};
oFF.SacTableAxisSectionReference.prototype.isMatchFullHeaderSection = function()
{
	return this.m_matchFullHeaderSection;
};
oFF.SacTableAxisSectionReference.prototype.setMatchFullHeaderSection = function(matchFullHeaderSection)
{
	this.m_matchFullHeaderSection = matchFullHeaderSection;
};
oFF.SacTableAxisSectionReference.prototype.getDataPaths = function()
{
	return this.m_dataPaths;
};
oFF.SacTableAxisSectionReference.prototype.addNewDataPath = function()
{
	var path = oFF.SacDataPath.create();
	this.m_dataPaths.add(path);
	return path;
};
oFF.SacTableAxisSectionReference.prototype.isMatchDataSectionStart = function()
{
	return this.m_matchDataSectionStart;
};
oFF.SacTableAxisSectionReference.prototype.setMatchDataSectionStart = function(matchDataSectionStart)
{
	this.m_matchDataSectionStart = matchDataSectionStart;
};
oFF.SacTableAxisSectionReference.prototype.isMatchDataSectionEnd = function()
{
	return this.m_matchDataSectionEnd;
};
oFF.SacTableAxisSectionReference.prototype.setMatchDataSectionEnd = function(matchDataSectionEnd)
{
	this.m_matchDataSectionEnd = matchDataSectionEnd;
};
oFF.SacTableAxisSectionReference.prototype.isMatchFullDataSection = function()
{
	return this.m_matchFullDataSection;
};
oFF.SacTableAxisSectionReference.prototype.setMatchFullDataSection = function(matchFullDataSection)
{
	this.m_matchFullDataSection = matchFullDataSection;
};
oFF.SacTableAxisSectionReference.prototype.getMatchModulo = function()
{
	return this.m_matchModulo;
};
oFF.SacTableAxisSectionReference.prototype.setMatchModulo = function(matchModulo)
{
	this.m_matchModulo = matchModulo;
};
oFF.SacTableAxisSectionReference.prototype.getMatchOrdinal = function()
{
	return this.m_matchOrdinal;
};
oFF.SacTableAxisSectionReference.prototype.setMatchOrdinal = function(matchOrdinal)
{
	this.m_matchOrdinal = matchOrdinal;
};
oFF.SacTableAxisSectionReference.prototype.matchesPosition = function(fullIndex, fullSize)
{
	if (this.m_matchModulo === -1)
	{
		return fullIndex === oFF.XMath.mod(fullSize + this.m_matchOrdinal, fullSize);
	}
	if (this.m_matchModulo < 2)
	{
		return true;
	}
	if (this.m_matchOrdinal < 0)
	{
		return 1 - this.m_matchOrdinal === oFF.XMath.mod(fullSize - fullIndex - 1, this.m_matchModulo);
	}
	return this.m_matchOrdinal === oFF.XMath.mod(fullIndex, this.m_matchModulo);
};
oFF.SacTableAxisSectionReference.prototype.clearHeaderSectionsInfos = function()
{
	this.m_headerSectionInfos.clear();
};
oFF.SacTableAxisSectionReference.prototype.clearDataPaths = function()
{
	this.m_dataPaths.clear();
};

oFF.SacTableMarkup = function() {};
oFF.SacTableMarkup.prototype = new oFF.XObject();
oFF.SacTableMarkup.prototype._ff_c = "SacTableMarkup";

oFF.SacTableMarkup.create = function()
{
	var instance = new oFF.SacTableMarkup();
	instance.setup();
	return instance;
};
oFF.SacTableMarkup.prototype.m_rowsScope = null;
oFF.SacTableMarkup.prototype.m_columnsScope = null;
oFF.SacTableMarkup.prototype.m_cellHeight = 0;
oFF.SacTableMarkup.prototype.m_cellWidth = 0;
oFF.SacTableMarkup.prototype.m_hide = false;
oFF.SacTableMarkup.prototype.m_tuplesBefore = null;
oFF.SacTableMarkup.prototype.m_tuplesAfter = null;
oFF.SacTableMarkup.prototype.m_tableMemberHeaderHandling = null;
oFF.SacTableMarkup.prototype.m_pageBreakHandlingInside = null;
oFF.SacTableMarkup.prototype.m_pageBreakHandlingBefore = null;
oFF.SacTableMarkup.prototype.m_pageBreakHandlingAfter = null;
oFF.SacTableMarkup.prototype.m_scopedStyles = null;
oFF.SacTableMarkup.prototype.m_paletteBasedStyles = null;
oFF.SacTableMarkup.prototype.m_priority = 0;
oFF.SacTableMarkup.prototype.setup = function()
{
	this.m_rowsScope = oFF.SacTableAxisSectionReference.create();
	this.m_columnsScope = oFF.SacTableAxisSectionReference.create();
	this.m_tuplesBefore = oFF.XList.create();
	this.m_tuplesAfter = oFF.XList.create();
	this.m_scopedStyles = oFF.XList.create();
	this.m_paletteBasedStyles = oFF.XList.create();
	this.m_priority = -1;
};
oFF.SacTableMarkup.prototype.releaseObject = function()
{
	this.m_rowsScope = oFF.XObjectExt.release(this.m_rowsScope);
	this.m_columnsScope = oFF.XObjectExt.release(this.m_columnsScope);
	this.m_cellHeight = 0;
	this.m_cellWidth = 0;
	this.m_hide = false;
	this.m_tuplesBefore = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_tuplesBefore);
	this.m_tuplesAfter = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_tuplesAfter);
	this.m_tableMemberHeaderHandling = null;
	this.m_pageBreakHandlingBefore = null;
	this.m_pageBreakHandlingInside = null;
	this.m_pageBreakHandlingAfter = null;
	this.m_scopedStyles = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_scopedStyles);
	this.m_paletteBasedStyles = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_paletteBasedStyles);
	this.m_priority = -1;
};
oFF.SacTableMarkup.prototype.getRowsScope = function()
{
	return this.m_rowsScope;
};
oFF.SacTableMarkup.prototype.getColumnsScope = function()
{
	return this.m_columnsScope;
};
oFF.SacTableMarkup.prototype.getCellHeight = function()
{
	return this.m_cellHeight;
};
oFF.SacTableMarkup.prototype.setCellHeight = function(cellHeight)
{
	this.m_cellHeight = cellHeight;
};
oFF.SacTableMarkup.prototype.getCellWidth = function()
{
	return this.m_cellWidth;
};
oFF.SacTableMarkup.prototype.setCellWidth = function(cellWidth)
{
	this.m_cellWidth = cellWidth;
};
oFF.SacTableMarkup.prototype.isHide = function()
{
	return this.m_hide;
};
oFF.SacTableMarkup.prototype.setHide = function(hide)
{
	this.m_hide = hide;
};
oFF.SacTableMarkup.prototype.getTuplesBefore = function()
{
	return this.m_tuplesBefore;
};
oFF.SacTableMarkup.prototype.addNewTupleBefore = function()
{
	var newTuple = oFF.SacInsertedTuple.create();
	this.m_tuplesBefore.add(newTuple);
	return newTuple;
};
oFF.SacTableMarkup.prototype.getTuplesAfter = function()
{
	return this.m_tuplesAfter;
};
oFF.SacTableMarkup.prototype.addNewTupleAfter = function()
{
	var newTuple = oFF.SacInsertedTuple.create();
	this.m_tuplesAfter.add(newTuple);
	return newTuple;
};
oFF.SacTableMarkup.prototype.getTableMemberHeaderHandling = function()
{
	return this.m_tableMemberHeaderHandling;
};
oFF.SacTableMarkup.prototype.setTableMemberHeaderHandling = function(tableMemberHeaderHandling)
{
	this.m_tableMemberHeaderHandling = tableMemberHeaderHandling;
};
oFF.SacTableMarkup.prototype.getPageBreakHandlingInside = function()
{
	return this.m_pageBreakHandlingInside;
};
oFF.SacTableMarkup.prototype.setPageBreakHandlingInside = function(pageBreakHandlingInside)
{
	this.m_pageBreakHandlingInside = pageBreakHandlingInside;
};
oFF.SacTableMarkup.prototype.getPageBreakHandlingBefore = function()
{
	return this.m_pageBreakHandlingBefore;
};
oFF.SacTableMarkup.prototype.setPageBreakHandlingBefore = function(pageBreakHandlingBefore)
{
	this.m_pageBreakHandlingBefore = pageBreakHandlingBefore;
};
oFF.SacTableMarkup.prototype.getPageBreakHandlingAfter = function()
{
	return this.m_pageBreakHandlingAfter;
};
oFF.SacTableMarkup.prototype.setPageBreakHandlingAfter = function(pageBreakHandlingAfter)
{
	this.m_pageBreakHandlingAfter = pageBreakHandlingAfter;
};
oFF.SacTableMarkup.prototype.getScopedStyles = function()
{
	return this.m_scopedStyles;
};
oFF.SacTableMarkup.prototype.addNewScopedStyle = function()
{
	var scopedStyle = oFF.SacScopedStyle.create();
	this.m_scopedStyles.add(scopedStyle);
	return scopedStyle;
};
oFF.SacTableMarkup.prototype.getPaletteBasedStyles = function()
{
	return this.m_paletteBasedStyles;
};
oFF.SacTableMarkup.prototype.addNewPaletteBasedStyle = function()
{
	var paletteBasedStyle = oFF.SacPaletteBasedStyle.create();
	this.m_paletteBasedStyles.add(paletteBasedStyle);
	return paletteBasedStyle;
};
oFF.SacTableMarkup.prototype.getPriority = function()
{
	return this.m_priority;
};
oFF.SacTableMarkup.prototype.setPriority = function(priority)
{
	this.m_priority = priority;
};

oFF.GenericTableRenderer = function() {};
oFF.GenericTableRenderer.prototype = new oFF.XObject();
oFF.GenericTableRenderer.prototype._ff_c = "GenericTableRenderer";

oFF.GenericTableRenderer.create = function(sacTable)
{
	var instance = new oFF.GenericTableRenderer();
	instance.m_table = sacTable;
	instance.m_tableWidgetRenderHelper = oFF.SacTableWidgetRenderHelper.createTableRenderHelper(sacTable);
	return instance;
};
oFF.GenericTableRenderer.prototype.m_table = null;
oFF.GenericTableRenderer.prototype.m_tableJson = null;
oFF.GenericTableRenderer.prototype.m_rowList = null;
oFF.GenericTableRenderer.prototype.m_tableWidgetRenderHelper = null;
oFF.GenericTableRenderer.prototype.setGridConfigration = function(gridConfig)
{
	if (oFF.notNull(gridConfig))
	{
		this.m_table.setStripeDataColumns(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_STRIPE_DATA_COLUMNS));
		this.m_table.setStripeDataRows(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_STRIPE_DATA_ROWS));
		this.m_table.setFreezeHeaderRows(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_FREEZE_ROWS));
		this.m_table.setFreezeHeaderColumns(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_FREEZE_COLUMNS));
		this.m_table.setShowFreezeLines(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_SHOW_FREEZE_LINES));
		this.m_table.setShowGrid(gridConfig.getBooleanByKeyExt(oFF.SacTableConstants.B_SHOW_GRID, true));
		this.m_table.setShowTableTitle(gridConfig.getBooleanByKeyExt(oFF.SacTableConstants.B_SHOW_TABLE_TITLE, true));
		this.m_table.setShowTableDetails(gridConfig.getBooleanByKeyExt(oFF.SacTableConstants.B_SHOW_TABLE_DETAILS, false));
		this.m_table.setShowSubTitle(gridConfig.getBooleanByKeyExt(oFF.SacTableConstants.B_SHOW_SUBTITLE, false));
		this.m_table.setShowCoordinateHeader(gridConfig.getBooleanByKeyExt(oFF.SacTableConstants.B_COORDINATE_HEADER, true));
		this.m_table.setHeaderColor(gridConfig.getStringByKey(oFF.SacTableConstants.S_HEADER_COLOR));
		this.m_table.setTitle(gridConfig.getStringByKey(oFF.SacTableConstants.S_TITLE));
		this.m_table.setWidth(gridConfig.getIntegerByKeyExt(oFF.SacTableConstants.I_WIDTH, 1257));
		this.m_table.setHeight(gridConfig.getIntegerByKeyExt(oFF.SacTableConstants.I_HEIGHT, 451));
		this.m_table.setMinCellWidth(gridConfig.getIntegerByKeyExt(oFF.SacTableConstants.I_MIN_CELL_WIDTH, 60));
		this.m_table.setMaxCellWidth(gridConfig.getIntegerByKeyExt(oFF.SacTableConstants.I_MAX_CELL_WIDTH, 300));
		this.m_table.setRepetitiveHeaderNames(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_REPETITIVE_MEMBER_NAMES));
		this.m_table.setMergeRepetitiveHeaderCells(gridConfig.getBooleanByKey(oFF.SacTableConstants.B_MERGE_REPETITIVE_HEADERS));
		this.m_table.setTotalLevel6Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_6_COLOR));
		this.m_table.setTotalLevel5Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_5_COLOR));
		this.m_table.setTotalLevel4Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_4_COLOR));
		this.m_table.setTotalLevel3Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_3_COLOR));
		this.m_table.setTotalLevel2Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_2_COLOR));
		this.m_table.setTotalLevel1Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_1_COLOR));
		this.m_table.setTotalLevel0Color(gridConfig.getStringByKey(oFF.SacTableConstants.S_TOTAL_LEVEL_0_COLOR));
		this.m_table.setHeaderEndRowLineColor(gridConfig.getStringByKeyExt(oFF.SacTableConstants.S_HEADER_END_ROW_LINE_COLOR, "rgb(63,81,97)"));
		this.m_table.setDataSectionBottomLineColor(gridConfig.getStringByKeyExt(oFF.SacTableConstants.S_DATA_SECTION_BOTTOM_LINE_COLOR, "rgba(204,204,240,1)"));
	}
};
oFF.GenericTableRenderer.prototype.render = function()
{
	this.prepareJsonStructure();
	this.m_table.formatHeaderColumnWidths();
	this.m_table.formatDataColumnWidths();
	this.fillRows();
	this.postRender();
	return this.m_tableJson;
};
oFF.GenericTableRenderer.prototype.prepareJsonStructure = function()
{
	this.m_tableJson = oFF.PrFactory.createStructure();
	this.m_rowList = this.m_tableJson.putNewList(oFF.SacTableConstants.TD_L_ROWS);
};
oFF.GenericTableRenderer.prototype.fillRows = function()
{
	this.m_tableWidgetRenderHelper.fillRowsFromList(this.m_table.getHeaderRowList(), this.m_rowList, 0, this.m_table.isFreezeHeaderRows(), this.m_table.getFreezeUpToRow());
	this.m_tableWidgetRenderHelper.fillRowsFromList(this.m_table.getRowList(), this.m_rowList, this.m_table.getHeaderRowList().size(), false, this.m_table.getFreezeUpToRow());
};
oFF.GenericTableRenderer.prototype.postRender = function()
{
	return this.m_tableWidgetRenderHelper.renderGenericSettings(this.m_tableJson);
};
oFF.GenericTableRenderer.prototype.releaseObject = function()
{
	this.m_table = null;
	oFF.XObject.prototype.releaseObject.call( this );
};
oFF.GenericTableRenderer.prototype.getTableJson = function()
{
	return this.m_tableJson;
};

oFF.SacBasicTableClipboardHelper = function() {};
oFF.SacBasicTableClipboardHelper.prototype = new oFF.SacTableClipboardHelper();
oFF.SacBasicTableClipboardHelper.prototype._ff_c = "SacBasicTableClipboardHelper";

oFF.SacBasicTableClipboardHelper.create = function(tableInstance)
{
	var instance = new oFF.SacBasicTableClipboardHelper();
	instance.setupWithTable(tableInstance);
	return instance;
};

oFF.SacStyledLine = function() {};
oFF.SacStyledLine.prototype = new oFF.XObjectExt();
oFF.SacStyledLine.prototype._ff_c = "SacStyledLine";

oFF.SacStyledLine.create = function()
{
	var instance = new oFF.SacStyledLine();
	instance.setup();
	return instance;
};
oFF.SacStyledLine.prototype.m_width = 0.0;
oFF.SacStyledLine.prototype.m_color = null;
oFF.SacStyledLine.prototype.m_patternBackground = null;
oFF.SacStyledLine.prototype.m_patternWidth = null;
oFF.SacStyledLine.prototype.m_patternColor = null;
oFF.SacStyledLine.prototype.m_patternBorderColor = null;
oFF.SacStyledLine.prototype.m_patternType = null;
oFF.SacStyledLine.prototype.m_lineStyle = null;
oFF.SacStyledLine.prototype.m_leftPadding = 0.0;
oFF.SacStyledLine.prototype.m_rightPadding = 0.0;
oFF.SacStyledLine.prototype.m_topPadding = 0.0;
oFF.SacStyledLine.prototype.m_bottomPadding = 0.0;
oFF.SacStyledLine.prototype.setup = function()
{
	this.m_width = -1;
	this.m_leftPadding = -1;
	this.m_rightPadding = -1;
	this.m_topPadding = -1;
	this.m_bottomPadding = -1;
};
oFF.SacStyledLine.prototype.releaseObject = function()
{
	this.m_width = -1;
	this.m_color = null;
	this.m_patternBackground = null;
	this.m_patternWidth = null;
	this.m_patternColor = null;
	this.m_patternBorderColor = null;
	this.m_patternType = null;
	this.m_lineStyle = null;
	this.m_leftPadding = -1;
	this.m_rightPadding = -1;
	this.m_topPadding = -1;
	this.m_bottomPadding = -1;
};
oFF.SacStyledLine.prototype.isEmpty = function()
{
	return this.m_width === -1 && oFF.isNull(this.m_color) && oFF.isNull(this.m_patternBackground) && oFF.isNull(this.m_patternBorderColor) && oFF.isNull(this.m_patternWidth) && oFF.isNull(this.m_patternColor) && !this.hasPadding() && (oFF.isNull(this.m_patternType) || this.m_patternType === oFF.SacLinePatternType.INHERIT) && (oFF.isNull(this.m_lineStyle) || this.m_lineStyle === oFF.SacTableLineStyle.INHERIT);
};
oFF.SacStyledLine.prototype.hasPadding = function()
{
	return this.m_leftPadding > -1 || this.m_rightPadding > -1 || this.m_topPadding > -1 || this.m_bottomPadding > -1;
};
oFF.SacStyledLine.prototype.mergeIntoMe = function(other)
{
	var mayBeIncomplete = false;
	if (oFF.isNull(other))
	{
		return true;
	}
	if (this.m_width === -1)
	{
		this.m_width = other.getWidth();
		mayBeIncomplete = true;
	}
	if (oFF.isNull(this.m_color))
	{
		this.m_color = other.getColor();
		mayBeIncomplete = true;
	}
	if (oFF.isNull(this.m_patternBackground))
	{
		this.m_patternBackground = other.getPatternBackground();
		mayBeIncomplete = true;
	}
	if (oFF.isNull(this.m_patternWidth))
	{
		this.m_patternWidth = other.getPatternWidth();
		mayBeIncomplete = true;
	}
	if (oFF.isNull(this.m_patternColor))
	{
		this.m_patternColor = other.getPatternColor();
		mayBeIncomplete = true;
	}
	if (oFF.isNull(this.m_patternBorderColor))
	{
		this.m_patternBorderColor = other.getPatternBorderColor();
		mayBeIncomplete = true;
	}
	if (oFF.isNull(this.m_patternType) || this.m_patternType === oFF.SacLinePatternType.INHERIT)
	{
		this.m_patternType = other.getPatternType();
		mayBeIncomplete = true;
	}
	if (oFF.isNull(this.m_lineStyle) || this.m_lineStyle === oFF.SacTableLineStyle.INHERIT)
	{
		this.m_lineStyle = other.getLineStyle();
		mayBeIncomplete = true;
	}
	if (this.m_topPadding === -1)
	{
		this.m_topPadding = other.getTopPadding();
		mayBeIncomplete = true;
	}
	if (this.m_bottomPadding === -1)
	{
		this.m_bottomPadding = other.getBottomPadding();
		mayBeIncomplete = true;
	}
	if (this.m_leftPadding === -1)
	{
		this.m_leftPadding = other.getLeftPadding();
		mayBeIncomplete = true;
	}
	if (this.m_rightPadding === -1)
	{
		this.m_rightPadding = other.getRightPadding();
		mayBeIncomplete = true;
	}
	return mayBeIncomplete;
};
oFF.SacStyledLine.prototype.getWidth = function()
{
	return this.m_width;
};
oFF.SacStyledLine.prototype.setWidth = function(width)
{
	this.m_width = width;
};
oFF.SacStyledLine.prototype.getColor = function()
{
	return this.m_color;
};
oFF.SacStyledLine.prototype.setColor = function(color)
{
	this.m_color = color;
};
oFF.SacStyledLine.prototype.getPatternBackground = function()
{
	return this.m_patternBackground;
};
oFF.SacStyledLine.prototype.setPatternBackground = function(patternBackground)
{
	this.m_patternBackground = patternBackground;
};
oFF.SacStyledLine.prototype.getPatternWidth = function()
{
	return this.m_patternWidth;
};
oFF.SacStyledLine.prototype.setPatternWidth = function(patternWidth)
{
	this.m_patternWidth = patternWidth;
};
oFF.SacStyledLine.prototype.getPatternColor = function()
{
	return this.m_patternColor;
};
oFF.SacStyledLine.prototype.setPatternColor = function(patternColor)
{
	this.m_patternColor = patternColor;
};
oFF.SacStyledLine.prototype.getPatternBorderColor = function()
{
	return this.m_patternBorderColor;
};
oFF.SacStyledLine.prototype.setPatternBorderColor = function(patternBorderColor)
{
	this.m_patternBorderColor = patternBorderColor;
};
oFF.SacStyledLine.prototype.getPatternType = function()
{
	return this.m_patternType;
};
oFF.SacStyledLine.prototype.setPatternType = function(patternType)
{
	this.m_patternType = patternType;
};
oFF.SacStyledLine.prototype.getLineStyle = function()
{
	return this.m_lineStyle;
};
oFF.SacStyledLine.prototype.setLineStyle = function(lineStyle)
{
	this.m_lineStyle = lineStyle;
};
oFF.SacStyledLine.prototype.getLeftPadding = function()
{
	return this.m_leftPadding;
};
oFF.SacStyledLine.prototype.setLeftPadding = function(leftPadding)
{
	this.m_leftPadding = leftPadding;
};
oFF.SacStyledLine.prototype.getRightPadding = function()
{
	return this.m_rightPadding;
};
oFF.SacStyledLine.prototype.setRightPadding = function(rightPadding)
{
	this.m_rightPadding = rightPadding;
};
oFF.SacStyledLine.prototype.getTopPadding = function()
{
	return this.m_topPadding;
};
oFF.SacStyledLine.prototype.setTopPadding = function(topPadding)
{
	this.m_topPadding = topPadding;
};
oFF.SacStyledLine.prototype.getBottomPadding = function()
{
	return this.m_bottomPadding;
};
oFF.SacStyledLine.prototype.setBottomPadding = function(bottomPadding)
{
	this.m_bottomPadding = bottomPadding;
};

oFF.SacTableFormattableElement = function() {};
oFF.SacTableFormattableElement.prototype = new oFF.XObjectExt();
oFF.SacTableFormattableElement.prototype._ff_c = "SacTableFormattableElement";

oFF.SacTableFormattableElement.prototype.m_tableStyle = null;
oFF.SacTableFormattableElement.prototype.m_tableStylesSecondary = null;
oFF.SacTableFormattableElement.prototype.m_totalLevel = 0;
oFF.SacTableFormattableElement.prototype.m_totalsContext = false;
oFF.SacTableFormattableElement.prototype.m_showCellChart = false;
oFF.SacTableFormattableElement.prototype.m_hideNumberForCellChart = false;
oFF.SacTableFormattableElement.prototype.m_cellChartMemberName = null;
oFF.SacTableFormattableElement.prototype.m_cellChartType = null;
oFF.SacTableFormattableElement.prototype.m_cellChartOrientation = null;
oFF.SacTableFormattableElement.prototype.setupTableStyleWithPriority = function(priority)
{
	this.m_tableStyle = oFF.SacTableStyle.create();
	this.m_tableStyle.setPriority(priority);
	this.m_tableStylesSecondary = oFF.XList.create();
};
oFF.SacTableFormattableElement.prototype.releaseObject = function()
{
	this.m_tableStyle = null;
	this.m_totalLevel = 0;
	this.m_totalsContext = false;
	this.m_showCellChart = false;
	this.m_hideNumberForCellChart = false;
	this.m_cellChartMemberName = null;
	this.m_cellChartType = null;
	this.m_cellChartOrientation = null;
	oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_tableStylesSecondary);
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.SacTableFormattableElement.prototype.getNewTableStyleWithPriority = function(priority)
{
	var newStyle = oFF.SacTableStyle.create();
	newStyle.setPriority(priority);
	this.m_tableStylesSecondary.add(newStyle);
	return newStyle;
};
oFF.SacTableFormattableElement.prototype.getSecondaryTableStyles = function()
{
	return this.m_tableStylesSecondary;
};
oFF.SacTableFormattableElement.prototype.getTableStyle = function()
{
	return this.m_tableStyle;
};
oFF.SacTableFormattableElement.prototype.setTableStyle = function(tableStyle)
{
	this.m_tableStyle = tableStyle;
};
oFF.SacTableFormattableElement.prototype.getTotalLevel = function()
{
	return this.m_totalLevel;
};
oFF.SacTableFormattableElement.prototype.setTotalLevel = function(totalLevel)
{
	this.m_totalLevel = totalLevel;
};
oFF.SacTableFormattableElement.prototype.isTotalsContext = function()
{
	return this.m_totalsContext;
};
oFF.SacTableFormattableElement.prototype.setTotalsContext = function(totalsContext)
{
	this.m_totalsContext = totalsContext;
};
oFF.SacTableFormattableElement.prototype.isShowCellChart = function()
{
	return this.m_showCellChart;
};
oFF.SacTableFormattableElement.prototype.setShowCellChart = function(showCellChart)
{
	this.m_showCellChart = showCellChart;
};
oFF.SacTableFormattableElement.prototype.isHideNumberForCellChart = function()
{
	return this.m_hideNumberForCellChart;
};
oFF.SacTableFormattableElement.prototype.setHideNumberForCellChart = function(hideNumberForCellChart)
{
	this.m_hideNumberForCellChart = hideNumberForCellChart;
};
oFF.SacTableFormattableElement.prototype.getCellChartType = function()
{
	return this.m_cellChartType;
};
oFF.SacTableFormattableElement.prototype.setCellChartType = function(cellChartType)
{
	this.m_cellChartType = cellChartType;
};
oFF.SacTableFormattableElement.prototype.getCellChartOrientation = function()
{
	return this.m_cellChartOrientation;
};
oFF.SacTableFormattableElement.prototype.setCellChartOrientation = function(cellChartOrientation)
{
	this.m_cellChartOrientation = cellChartOrientation;
};
oFF.SacTableFormattableElement.prototype.getCellChartMemberName = function()
{
	return this.m_cellChartMemberName;
};
oFF.SacTableFormattableElement.prototype.setCellChartMemberName = function(cellChartMemberName)
{
	this.m_cellChartMemberName = cellChartMemberName;
};

oFF.SacTableStyle = function() {};
oFF.SacTableStyle.prototype = new oFF.XObjectExt();
oFF.SacTableStyle.prototype._ff_c = "SacTableStyle";

oFF.SacTableStyle.create = function()
{
	var obj = new oFF.SacTableStyle();
	obj.setup();
	return obj;
};
oFF.SacTableStyle.prototype.m_restrictToHeaderCells = false;
oFF.SacTableStyle.prototype.m_restrictToDataCells = false;
oFF.SacTableStyle.prototype.m_restrictToFirstItem = false;
oFF.SacTableStyle.prototype.m_restrictToLastItem = false;
oFF.SacTableStyle.prototype.m_restrictToColumnStyle = false;
oFF.SacTableStyle.prototype.m_restrictToRowStyle = false;
oFF.SacTableStyle.prototype.m_priority = 0;
oFF.SacTableStyle.prototype.m_fillColor = null;
oFF.SacTableStyle.prototype.m_styledLineBottom = null;
oFF.SacTableStyle.prototype.m_styledLineTop = null;
oFF.SacTableStyle.prototype.m_styledLineLeft = null;
oFF.SacTableStyle.prototype.m_styledLineRight = null;
oFF.SacTableStyle.prototype.m_fontItalic = null;
oFF.SacTableStyle.prototype.m_fontBold = null;
oFF.SacTableStyle.prototype.m_fontUnderline = null;
oFF.SacTableStyle.prototype.m_fontStrikeThrough = null;
oFF.SacTableStyle.prototype.m_fontSize = 0.0;
oFF.SacTableStyle.prototype.m_fontFamily = null;
oFF.SacTableStyle.prototype.m_fontColor = null;
oFF.SacTableStyle.prototype.m_cellChartLineColor = null;
oFF.SacTableStyle.prototype.m_cellChartBarColor = null;
oFF.SacTableStyle.prototype.m_thresholdType = null;
oFF.SacTableStyle.prototype.m_thresholdColor = null;
oFF.SacTableStyle.prototype.m_verticalAlignment = null;
oFF.SacTableStyle.prototype.m_horizontalAlignment = null;
oFF.SacTableStyle.prototype.setup = function()
{
	oFF.XObjectExt.prototype.setup.call( this );
	this.m_styledLineTop = oFF.SacStyledLine.create();
	this.m_styledLineBottom = oFF.SacStyledLine.create();
	this.m_styledLineLeft = oFF.SacStyledLine.create();
	this.m_styledLineRight = oFF.SacStyledLine.create();
};
oFF.SacTableStyle.prototype.releaseObject = function()
{
	this.m_priority = -1;
	this.m_fillColor = null;
	this.m_styledLineBottom = oFF.XObjectExt.release(this.m_styledLineBottom);
	this.m_styledLineTop = oFF.XObjectExt.release(this.m_styledLineTop);
	this.m_styledLineLeft = oFF.XObjectExt.release(this.m_styledLineLeft);
	this.m_styledLineRight = oFF.XObjectExt.release(this.m_styledLineRight);
	this.m_fontItalic = null;
	this.m_fontBold = null;
	this.m_fontUnderline = null;
	this.m_fontStrikeThrough = null;
	this.m_fontSize = 0;
	this.m_fontFamily = null;
	this.m_fontColor = null;
	this.m_cellChartLineColor = null;
	this.m_cellChartBarColor = null;
	this.m_thresholdType = null;
	this.m_thresholdColor = null;
	this.m_verticalAlignment = null;
	this.m_horizontalAlignment = null;
	oFF.XObjectExt.prototype.releaseObject.call( this );
};
oFF.SacTableStyle.prototype.getFillColor = function()
{
	return this.m_fillColor;
};
oFF.SacTableStyle.prototype.setFillColor = function(color)
{
	this.m_fillColor = color;
};
oFF.SacTableStyle.prototype.getStyledLineBottom = function()
{
	return this.m_styledLineBottom;
};
oFF.SacTableStyle.prototype.setStyledLineBottom = function(style)
{
	this.m_styledLineBottom = style;
};
oFF.SacTableStyle.prototype.getStyledLineTop = function()
{
	return this.m_styledLineTop;
};
oFF.SacTableStyle.prototype.setStyledLineTop = function(style)
{
	this.m_styledLineTop = style;
};
oFF.SacTableStyle.prototype.getStyledLineLeft = function()
{
	return this.m_styledLineLeft;
};
oFF.SacTableStyle.prototype.setStyledLineLeft = function(style)
{
	this.m_styledLineLeft = style;
};
oFF.SacTableStyle.prototype.getStyledLineRight = function()
{
	return this.m_styledLineRight;
};
oFF.SacTableStyle.prototype.setStyledLineRight = function(style)
{
	this.m_styledLineRight = style;
};
oFF.SacTableStyle.prototype.isFontItalic = function()
{
	return this.m_fontItalic === oFF.TriStateBool._TRUE;
};
oFF.SacTableStyle.prototype.isFontItalicExt = function()
{
	return this.m_fontItalic;
};
oFF.SacTableStyle.prototype.setFontItalic = function(set)
{
	this.m_fontItalic = set ? oFF.TriStateBool._TRUE : oFF.TriStateBool._FALSE;
};
oFF.SacTableStyle.prototype.setFontItalicExt = function(set)
{
	this.m_fontItalic = set;
};
oFF.SacTableStyle.prototype.isFontBold = function()
{
	return this.m_fontBold === oFF.TriStateBool._TRUE;
};
oFF.SacTableStyle.prototype.isFontBoldExt = function()
{
	return this.m_fontBold;
};
oFF.SacTableStyle.prototype.setFontBold = function(set)
{
	this.m_fontBold = set ? oFF.TriStateBool._TRUE : oFF.TriStateBool._FALSE;
};
oFF.SacTableStyle.prototype.setFontBoldExt = function(set)
{
	this.m_fontBold = set;
};
oFF.SacTableStyle.prototype.isFontUnderline = function()
{
	return this.m_fontUnderline === oFF.TriStateBool._TRUE;
};
oFF.SacTableStyle.prototype.isFontUnderlineExt = function()
{
	return this.m_fontUnderline;
};
oFF.SacTableStyle.prototype.setFontUnderline = function(set)
{
	this.m_fontUnderline = set ? oFF.TriStateBool._TRUE : oFF.TriStateBool._FALSE;
};
oFF.SacTableStyle.prototype.setFontUnderlineExt = function(set)
{
	this.m_fontUnderline = set;
};
oFF.SacTableStyle.prototype.isFontStrikeThrough = function()
{
	return this.m_fontStrikeThrough === oFF.TriStateBool._TRUE;
};
oFF.SacTableStyle.prototype.isFontStrikeThroughExt = function()
{
	return this.m_fontStrikeThrough;
};
oFF.SacTableStyle.prototype.setFontStrikeThrough = function(set)
{
	this.m_fontStrikeThrough = set ? oFF.TriStateBool._TRUE : oFF.TriStateBool._FALSE;
};
oFF.SacTableStyle.prototype.setFontStrikeThroughExt = function(set)
{
	this.m_fontStrikeThrough = set;
};
oFF.SacTableStyle.prototype.getFontSize = function()
{
	return this.m_fontSize;
};
oFF.SacTableStyle.prototype.setFontSize = function(size)
{
	this.m_fontSize = size;
};
oFF.SacTableStyle.prototype.getFontFamily = function()
{
	return this.m_fontFamily;
};
oFF.SacTableStyle.prototype.setFontFamily = function(family)
{
	this.m_fontFamily = family;
};
oFF.SacTableStyle.prototype.getFontColor = function()
{
	return this.m_fontColor;
};
oFF.SacTableStyle.prototype.setFontColor = function(color)
{
	this.m_fontColor = color;
};
oFF.SacTableStyle.prototype.getCellChartLineColor = function()
{
	return this.m_cellChartLineColor;
};
oFF.SacTableStyle.prototype.setCellChartLineColor = function(cellChartLineColor)
{
	this.m_cellChartLineColor = cellChartLineColor;
};
oFF.SacTableStyle.prototype.getCellChartBarColor = function()
{
	return this.m_cellChartBarColor;
};
oFF.SacTableStyle.prototype.setCellChartBarColor = function(cellChartBarColor)
{
	this.m_cellChartBarColor = cellChartBarColor;
};
oFF.SacTableStyle.prototype.getThresholdType = function()
{
	return this.m_thresholdType;
};
oFF.SacTableStyle.prototype.setThresholdType = function(thresholdType)
{
	this.m_thresholdType = thresholdType;
};
oFF.SacTableStyle.prototype.getThresholdColor = function()
{
	return this.m_thresholdColor;
};
oFF.SacTableStyle.prototype.setThresholdColor = function(thresholdColor)
{
	this.m_thresholdColor = thresholdColor;
};
oFF.SacTableStyle.prototype.getPriority = function()
{
	return this.m_priority;
};
oFF.SacTableStyle.prototype.setPriority = function(priority)
{
	this.m_priority = priority;
};
oFF.SacTableStyle.prototype.setVerticalAlignment = function(verticalAlignment)
{
	this.m_verticalAlignment = verticalAlignment;
};
oFF.SacTableStyle.prototype.getVerticalAlignment = function()
{
	return this.m_verticalAlignment;
};
oFF.SacTableStyle.prototype.setHorizontalAlignment = function(horizontalAlignment)
{
	this.m_horizontalAlignment = horizontalAlignment;
};
oFF.SacTableStyle.prototype.getHorizontalAlignment = function()
{
	return this.m_horizontalAlignment;
};
oFF.SacTableStyle.prototype.isRestrictToHeaderCells = function()
{
	return this.m_restrictToHeaderCells;
};
oFF.SacTableStyle.prototype.setRestrictToHeaderCells = function(restrictToHeaderCells)
{
	this.m_restrictToHeaderCells = restrictToHeaderCells;
};
oFF.SacTableStyle.prototype.isRestrictToDataCells = function()
{
	return this.m_restrictToDataCells;
};
oFF.SacTableStyle.prototype.setRestrictToDataCells = function(restrictToDataCells)
{
	this.m_restrictToDataCells = restrictToDataCells;
};
oFF.SacTableStyle.prototype.isRestrictToFirstItem = function()
{
	return this.m_restrictToFirstItem;
};
oFF.SacTableStyle.prototype.setRestrictToFirstItem = function(restrictToFirstItem)
{
	this.m_restrictToFirstItem = restrictToFirstItem;
};
oFF.SacTableStyle.prototype.isRestrictToLastItem = function()
{
	return this.m_restrictToLastItem;
};
oFF.SacTableStyle.prototype.setRestrictToLastItem = function(restrictToLastItem)
{
	this.m_restrictToLastItem = restrictToLastItem;
};
oFF.SacTableStyle.prototype.isRestrictToColumnStyle = function()
{
	return this.m_restrictToColumnStyle;
};
oFF.SacTableStyle.prototype.setRestrictToColumnStyle = function(restrictToColumnStyle)
{
	this.m_restrictToColumnStyle = restrictToColumnStyle;
};
oFF.SacTableStyle.prototype.isRestrictToRowStyle = function()
{
	return this.m_restrictToRowStyle;
};
oFF.SacTableStyle.prototype.setRestrictToRowStyle = function(restrictToRowStyle)
{
	this.m_restrictToRowStyle = restrictToRowStyle;
};

oFF.SacTable = function() {};
oFF.SacTable.prototype = new oFF.SacTableFormattableElement();
oFF.SacTable.prototype._ff_c = "SacTable";

oFF.SacTable.SELECTION_COL_MIN = "colMin";
oFF.SacTable.SELECTION_ROW_MIN = "rowMin";
oFF.SacTable.SELECTION_LIST = "list";
oFF.SacTable.DEFAULT_CELL_WIDTH = 8;
oFF.SacTable.create = function()
{
	var instance = new oFF.SacTable();
	instance.internalSetup();
	return instance;
};
oFF.SacTable.prototype.m_rowList = null;
oFF.SacTable.prototype.m_headerRowList = null;
oFF.SacTable.prototype.m_columnList = null;
oFF.SacTable.prototype.m_headerColumnList = null;
oFF.SacTable.prototype.m_dataPointStyles = null;
oFF.SacTable.prototype.m_hiddenRows = null;
oFF.SacTable.prototype.m_hiddenColumns = null;
oFF.SacTable.prototype.m_rowHeights = null;
oFF.SacTable.prototype.m_columnWidths = null;
oFF.SacTable.prototype.m_preColumnsAmount = 0;
oFF.SacTable.prototype.m_dataColumnsAmount = 0;
oFF.SacTable.prototype.m_dataRowAmount = 0;
oFF.SacTable.prototype.m_overallHeight = 0;
oFF.SacTable.prototype.m_freezeHeaderRows = false;
oFF.SacTable.prototype.m_freezeHeaderColumns = false;
oFF.SacTable.prototype.m_freezeUpToRow = 0;
oFF.SacTable.prototype.m_freezeUpToColumn = 0;
oFF.SacTable.prototype.m_showGrid = false;
oFF.SacTable.prototype.m_showTableTitle = false;
oFF.SacTable.prototype.m_showFreezeLines = false;
oFF.SacTable.prototype.m_showSubTitle = false;
oFF.SacTable.prototype.m_showTableDetails = false;
oFF.SacTable.prototype.m_stripeDataRows = false;
oFF.SacTable.prototype.m_stripeDataColumns = false;
oFF.SacTable.prototype.m_repetitiveHeaderNames = false;
oFF.SacTable.prototype.m_mergeRepetitiveHeaderCells = false;
oFF.SacTable.prototype.m_reversedHierarchy = false;
oFF.SacTable.prototype.m_title = null;
oFF.SacTable.prototype.m_headerColor = null;
oFF.SacTable.prototype.m_headerEndRowLineColor = null;
oFF.SacTable.prototype.m_showCoordinateHeader = false;
oFF.SacTable.prototype.m_width = 0;
oFF.SacTable.prototype.m_height = 0;
oFF.SacTable.prototype.m_minCellWidth = 0;
oFF.SacTable.prototype.m_maxCellWidth = 0;
oFF.SacTable.prototype.m_maxColumns = 0;
oFF.SacTable.prototype.m_maxRows = 0;
oFF.SacTable.prototype.m_cellChartInfo = null;
oFF.SacTable.prototype.m_totalLevel6Color = null;
oFF.SacTable.prototype.m_totalLevel5Color = null;
oFF.SacTable.prototype.m_totalLevel4Color = null;
oFF.SacTable.prototype.m_totalLevel3Color = null;
oFF.SacTable.prototype.m_totalLevel2Color = null;
oFF.SacTable.prototype.m_totalLevel1Color = null;
oFF.SacTable.prototype.m_totalLevel0Color = null;
oFF.SacTable.prototype.m_dataSectionBottomLineColor = null;
oFF.SacTable.prototype.internalSetup = function()
{
	this.m_rowList = oFF.XList.create();
	this.m_headerRowList = oFF.XList.create();
	this.m_headerColumnList = oFF.XList.create();
	this.m_columnList = oFF.XList.create();
	this.m_dataPointStyles = oFF.XList.create();
	this.m_height = 451;
	this.m_width = 1257;
	this.m_showGrid = true;
	this.m_showCoordinateHeader = true;
	this.m_minCellWidth = 40;
	this.m_maxCellWidth = 300;
	this.m_headerEndRowLineColor = "rgb(63,81,97)";
	this.m_dataSectionBottomLineColor = "rgba(204,204,240,1)";
	this.m_cellChartInfo = oFF.XHashMapByString.create();
	this.m_freezeUpToRow = -1;
	this.m_freezeUpToColumn = -1;
	this.m_rowHeights = oFF.XSimpleMap.create();
	this.m_columnWidths = oFF.XSimpleMap.create();
	this.m_hiddenRows = oFF.XList.create();
	this.m_hiddenColumns = oFF.XList.create();
	this.setupTableStyleWithPriority(10);
};
oFF.SacTable.prototype.releaseObject = function()
{
	this.m_rowList = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_rowList);
	this.m_headerRowList = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_headerRowList);
	this.m_columnList = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_columnList);
	this.m_headerColumnList = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_headerColumnList);
	this.m_dataPointStyles = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_dataPointStyles);
	this.m_rowHeights = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_rowHeights);
	this.m_columnWidths = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_columnWidths);
	this.m_hiddenColumns = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_hiddenColumns);
	this.m_hiddenRows = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_hiddenRows);
	this.m_preColumnsAmount = -1;
	this.m_dataColumnsAmount = -1;
	this.m_dataRowAmount = -1;
	this.m_overallHeight = -1;
	this.m_freezeHeaderRows = false;
	this.m_freezeHeaderColumns = false;
	this.m_showGrid = false;
	this.m_showTableTitle = false;
	this.m_showFreezeLines = false;
	this.m_showSubTitle = false;
	this.m_showTableDetails = false;
	this.m_stripeDataRows = false;
	this.m_stripeDataColumns = false;
	this.m_repetitiveHeaderNames = false;
	this.m_mergeRepetitiveHeaderCells = false;
	this.m_reversedHierarchy = false;
	this.m_title = null;
	this.m_headerColor = null;
	this.m_headerEndRowLineColor = null;
	this.m_showCoordinateHeader = false;
	this.m_width = -1;
	this.m_height = -1;
	this.m_minCellWidth = -1;
	this.m_maxCellWidth = -1;
	this.m_cellChartInfo = oFF.XObjectExt.release(this.m_cellChartInfo);
	this.m_totalLevel6Color = null;
	this.m_totalLevel5Color = null;
	this.m_totalLevel4Color = null;
	this.m_totalLevel3Color = null;
	this.m_totalLevel2Color = null;
	this.m_totalLevel1Color = null;
	this.m_totalLevel0Color = null;
	this.m_dataSectionBottomLineColor = null;
	oFF.SacTableFormattableElement.prototype.releaseObject.call( this );
};
oFF.SacTable.prototype.addHeaderRow = function(tableRow)
{
	var rowIndex = this.m_headerRowList.size();
	tableRow.setHeader(true);
	this.m_headerRowList.add(tableRow);
	this.populateWithColumnCells(rowIndex, tableRow);
};
oFF.SacTable.prototype.addHeaderColumn = function(tableColumn)
{
	tableColumn.setHeader(true);
	var columnIndex = this.m_headerColumnList.size();
	this.m_headerColumnList.add(tableColumn);
	this.populateWithRowCells(columnIndex, tableColumn, false);
};
oFF.SacTable.prototype.addDataColumn = function(tableColumn)
{
	var columnIndex = this.m_headerColumnList.size() + this.m_columnList.size();
	this.m_columnList.add(tableColumn);
	if (this.m_columnList.size() > this.m_dataColumnsAmount)
	{
		this.m_dataColumnsAmount = this.m_columnList.size();
	}
	this.populateWithRowCells(columnIndex, tableColumn, false);
};
oFF.SacTable.prototype.addDataRow = function(rowIndex, tableRow)
{
	this.m_rowList.add(tableRow);
	if (this.m_rowList.size() > this.m_dataRowAmount)
	{
		this.m_dataRowAmount = this.m_rowList.size();
	}
	this.populateWithColumnCells(rowIndex, tableRow);
};
oFF.SacTable.prototype.addDataColumnAt = function(dataIndex, tableColumn, overwriteAtPosition)
{
	var i = this.m_columnList.size();
	for (; i < dataIndex; i++)
	{
		this.m_columnList.add(null);
	}
	if (overwriteAtPosition && i === dataIndex)
	{
		this.m_columnList.add(null);
	}
	if (overwriteAtPosition)
	{
		if (this.m_columnList.get(dataIndex) !== null)
		{
			oFF.XLogger.println(oFF.XStringUtils.concatenate2("WARNING: Overwriting existing column at position: ", oFF.XInteger.convertToString(dataIndex)));
		}
		this.m_columnList.set(dataIndex, tableColumn);
	}
	else
	{
		this.m_columnList.insert(dataIndex, tableColumn);
	}
	if (this.m_columnList.size() > this.m_dataColumnsAmount)
	{
		this.m_dataColumnsAmount = this.m_columnList.size();
	}
	this.populateWithRowCells(dataIndex + this.m_headerColumnList.size(), tableColumn, overwriteAtPosition);
};
oFF.SacTable.prototype.addDataRowAt = function(dataIndex, tableRow, overwriteAtPosition)
{
	var i = this.m_rowList.size();
	for (; i < dataIndex; i++)
	{
		this.m_rowList.add(null);
	}
	if (overwriteAtPosition && i === dataIndex)
	{
		this.m_rowList.add(null);
	}
	if (overwriteAtPosition)
	{
		if (this.m_rowList.get(dataIndex) !== null)
		{
			oFF.XLogger.println(oFF.XStringUtils.concatenate2("WARNING: Overwriting existing row at position: ", oFF.XInteger.convertToString(dataIndex)));
			this.m_rowList.get(dataIndex).setDefaultHeight(0);
		}
		this.m_rowList.set(dataIndex, tableRow);
	}
	else
	{
		this.m_rowList.insert(dataIndex, tableRow);
	}
	if (this.m_rowList.size() > this.m_dataRowAmount)
	{
		this.m_dataRowAmount = this.m_rowList.size();
	}
	this.populateWithColumnCells(dataIndex + this.m_headerRowList.size(), tableRow);
};
oFF.SacTable.prototype.newHeaderRow = function()
{
	var newRow = oFF.SacTableRow._create(this);
	this.addHeaderRow(newRow);
	return newRow;
};
oFF.SacTable.prototype.createNewHeaderColumn = function()
{
	var newColumn = oFF.SacTableColumn._create(this);
	this.addHeaderColumn(newColumn);
	return newColumn;
};
oFF.SacTable.prototype.createNewDataColumn = function()
{
	var newColumn = oFF.SacTableColumn._create(this);
	this.addDataColumn(newColumn);
	return newColumn;
};
oFF.SacTable.prototype.createNewDataColumnAt = function(index)
{
	var newColumn = oFF.SacTableColumn._create(this);
	this.addDataColumnAt(index, newColumn, false);
	return newColumn;
};
oFF.SacTable.prototype.populateWithRowCells = function(index, newColumn, overwriteAtPosition)
{
	var row;
	var i;
	for (i = 0; i < this.m_headerRowList.size(); i++)
	{
		row = this.m_headerRowList.get(i);
		row.insertNewCellAtWithColumn(index, newColumn, overwriteAtPosition);
	}
	for (i = 0; i < this.m_rowList.size(); i++)
	{
		row = this.m_rowList.get(i);
		if (oFF.notNull(row))
		{
			row.insertNewCellAtWithColumn(index, newColumn, overwriteAtPosition);
		}
	}
	if (index > 0)
	{
		this.adaptMergedColumns(index, this.m_headerRowList);
		this.adaptMergedColumns(index, this.m_rowList);
	}
};
oFF.SacTable.prototype.adaptMergedColumns = function(index, rowList)
{
	var cells;
	var cell;
	for (var i = 0; i < rowList.size(); i++)
	{
		var row = rowList.get(i);
		cells = oFF.isNull(row) ? null : row.getCells();
		if (oFF.notNull(row) && cells.size() > index + 1 && cells.get(index + 1) !== null && cells.get(index + 1).getMergedColumns() < 0)
		{
			for (var j = index - 1; j > 0; j--)
			{
				cell = cells.get(j);
				if (oFF.notNull(cell) && cell.getMergedColumns() > 0)
				{
					cell.setMergedColumns(cell.getMergedColumns() + 1);
					break;
				}
			}
		}
	}
};
oFF.SacTable.prototype.populateWithColumnCells = function(index, newRow)
{
	var headerSize = this.m_headerColumnList.size();
	for (var i = 0; i < headerSize; i++)
	{
		newRow.insertNewCellAtWithColumn(i, this.m_headerColumnList.get(i), false);
	}
	for (var j = 0; j < this.m_columnList.size(); j++)
	{
		var column = this.m_columnList.get(j);
		if (oFF.notNull(column))
		{
			newRow.insertNewCellAtWithColumn(j + headerSize, column, false);
		}
	}
	if (index >= this.m_headerRowList.size())
	{
		this.adaptMergedRows(index - this.m_headerRowList.size(), this.m_rowList);
	}
	else
	{
		this.adaptMergedRows(index, this.m_headerRowList);
	}
};
oFF.SacTable.prototype.adaptMergedRows = function(index, rowList)
{
	if (index > 0 && index + 1 < rowList.size() && rowList.get(index + 1) !== null)
	{
		var successorRow = rowList.get(index + 1);
		var srcList = successorRow.getCells();
		for (var i = 0; i < srcList.size(); i++)
		{
			var src = srcList.get(i);
			if (oFF.notNull(src) && src.getMergedRows() < 0)
			{
				for (var j = index - 1; j >= 0; j--)
				{
					var cell = rowList.get(j).getCells().get(i);
					if (cell.getMergedRows() > 0)
					{
						cell.setMergedRows(cell.getMergedRows() + 1);
						break;
					}
				}
			}
		}
	}
};
oFF.SacTable.prototype.newDataRow = function()
{
	var newRow = oFF.SacTableRow._create(this);
	var index = this.m_headerRowList.size() + this.m_rowList.size();
	this.addDataRow(index, newRow);
	return newRow;
};
oFF.SacTable.prototype.newDataRowAt = function(dataIndex, overwriteAtPosition)
{
	var newRow = oFF.SacTableRow._create(this);
	this.addDataRowAt(dataIndex, newRow, overwriteAtPosition);
	return newRow;
};
oFF.SacTable.prototype.getColumnWidth = function(index)
{
	var hcs = this.m_headerColumnList.size();
	if (index < hcs)
	{
		return this.m_headerColumnList.get(index).getWidth();
	}
	else if (index < hcs + this.m_columnList.size())
	{
		return this.m_columnList.get(index - hcs).getWidth();
	}
	else
	{
		return oFF.SacTable.DEFAULT_CELL_WIDTH;
	}
};
oFF.SacTable.prototype.getPreColumnsAmount = function()
{
	return this.m_preColumnsAmount;
};
oFF.SacTable.prototype.setPreColumnsAmount = function(preColumnsAmount)
{
	this.m_preColumnsAmount = preColumnsAmount;
};
oFF.SacTable.prototype.getRowList = function()
{
	return this.m_rowList;
};
oFF.SacTable.prototype.getHeaderRowList = function()
{
	return this.m_headerRowList;
};
oFF.SacTable.prototype.getColumnEmWidths = function()
{
	var columnWidths = oFF.XList.create();
	var i;
	var size = this.m_headerColumnList.size();
	for (i = 0; i < size; i++)
	{
		columnWidths.add(oFF.XIntegerValue.create(this.m_headerColumnList.get(i).getDefaultEmWidth()));
	}
	size = this.m_columnList.size();
	for (i = 0; i < size; i++)
	{
		columnWidths.add(oFF.XIntegerValue.create(this.m_columnList.get(i).getDefaultEmWidth()));
	}
	return columnWidths;
};
oFF.SacTable.prototype.getDataColumnsAmount = function()
{
	return this.m_dataColumnsAmount;
};
oFF.SacTable.prototype.setDataColumnsAmount = function(dataColumnsAmount)
{
	this.m_dataColumnsAmount = dataColumnsAmount;
};
oFF.SacTable.prototype.getDataRowAmount = function()
{
	return this.m_dataRowAmount;
};
oFF.SacTable.prototype.setDataRowAmount = function(dataRowAmount)
{
	this.m_dataRowAmount = dataRowAmount;
};
oFF.SacTable.prototype.formatWidthList = function(list)
{
	var iterator = list.getIterator();
	while (iterator.hasNext())
	{
		this.formatWidths(iterator.next());
	}
};
oFF.SacTable.prototype.formatHeaderColumnWidths = function()
{
	this.formatWidthList(this.m_headerRowList);
};
oFF.SacTable.prototype.formatDataColumnWidths = function()
{
	this.formatWidthList(this.m_rowList);
};
oFF.SacTable.prototype.formatWidths = function(row)
{
	if (oFF.notNull(row))
	{
		var cells = row.getCells();
		if (row.isShowCellChart() && row.getCellChartOrientation() === oFF.SacCellChartOrientation.VERTICAL)
		{
			row.setDefaultHeight(oFF.SacTableConstants.DF_R_N_HEIGHT_VERTICAL_CHARTS);
		}
		else
		{
			row.setDefaultHeight(oFF.SacTableConstants.DF_R_N_HEIGHT);
		}
		for (var i = 0; i < cells.size(); i++)
		{
			var cell = cells.get(i);
			if (oFF.notNull(cell))
			{
				if (row.isHeader() && cell.isInHierarchy())
				{
					var newHeight = oFF.SacTableConstants.DF_C_N_HIERARCHY_PADDING_TOP + oFF.SacTableConstants.DF_R_N_HEIGHT + oFF.XMath.div(oFF.SacTableConstants.DF_R_N_HEIGHT * 2 * cell.getHierarchyLevel(), 3) + cell.getHierarchyLevel() * 3;
					row.setDefaultHeight(oFF.XMath.max(row.getHeight(), newHeight));
				}
				if (!cell.isHeaderCell() || !cell.isRepeatedHeader() || row.getParentTable().isRepetitiveHeaderNames())
				{
					var formatted = cell.getFormatted();
					var tokenized = oFF.isNull(formatted) || cell.isUnbooked() ? oFF.XListOfString.create() : oFF.XStringTokenizer.splitString(formatted, "\r\n");
					var length = oFF.XStream.ofString(tokenized).map( function(str){
						return oFF.XIntegerValue.create(oFF.XString.size(str.getString()));
					}.bind(this)).reduce(oFF.XIntegerValue.create(0),  function(a, b){
						return oFF.XIntegerValue.create(oFF.XMath.max(a.getInteger(), b.getInteger()));
					}.bind(this)).getInteger();
					var factor = cell.isEffectiveShowCellChart() && cell.getEffectiveCellChartOrientation() === oFF.SacCellChartOrientation.HORIZONTAL ? 2 : 1;
					var column = cell.getParentColumn();
					if (tokenized.size() > 1)
					{
						row.setDefaultHeight(oFF.XMath.max(row.getHeight(), tokenized.size() * oFF.SacTableConstants.DF_R_N_HEIGHT_REDUCED));
						cell.setWrap(true);
					}
					if (cell.isDimensionHeader() || cell.isTotalsContext())
					{
						length = oFF.XMath.div(length * 11, 10) + 1;
					}
					column.setDefaultEmWidth(oFF.XMath.max((length + cell.getLengthAddition()) * factor, column.getDefaultEmWidth()));
				}
			}
		}
	}
};
oFF.SacTable.prototype.notifyHeightOffset = function(heightOffset)
{
	this.m_overallHeight = this.m_overallHeight + heightOffset;
};
oFF.SacTable.prototype.getOverallHeight = function()
{
	return this.m_overallHeight + (this.m_dataRowAmount - (oFF.XCollectionUtils.hasElements(this.getRowList()) ? oFF.XStream.of(this.getRowList()).filter( function(val){
		return oFF.notNull(val);
	}.bind(this)).countItems() : 0)) * oFF.SacTableConstants.DF_R_N_HEIGHT;
};
oFF.SacTable.prototype.isFreezeHeaderRows = function()
{
	return this.m_freezeHeaderRows;
};
oFF.SacTable.prototype.setFreezeHeaderRows = function(freezeRows)
{
	this.m_freezeHeaderRows = freezeRows;
};
oFF.SacTable.prototype.isFreezeHeaderColumns = function()
{
	return this.m_freezeHeaderColumns;
};
oFF.SacTable.prototype.setFreezeHeaderColumns = function(freezeColumns)
{
	this.m_freezeHeaderColumns = freezeColumns;
};
oFF.SacTable.prototype.isShowGrid = function()
{
	return this.m_showGrid;
};
oFF.SacTable.prototype.setShowGrid = function(showGrid)
{
	this.m_showGrid = showGrid;
};
oFF.SacTable.prototype.isShowTableTitle = function()
{
	return this.m_showTableTitle;
};
oFF.SacTable.prototype.setShowTableTitle = function(showTableTitle)
{
	this.m_showTableTitle = showTableTitle;
};
oFF.SacTable.prototype.isShowFreezeLines = function()
{
	return this.m_showFreezeLines;
};
oFF.SacTable.prototype.setShowFreezeLines = function(showFreezeLines)
{
	this.m_showFreezeLines = showFreezeLines;
};
oFF.SacTable.prototype.getTitle = function()
{
	return this.m_title;
};
oFF.SacTable.prototype.setTitle = function(title)
{
	this.m_title = title;
};
oFF.SacTable.prototype.getHeaderColor = function()
{
	return this.m_headerColor;
};
oFF.SacTable.prototype.setHeaderColor = function(headerColor)
{
	this.m_headerColor = headerColor;
};
oFF.SacTable.prototype.isShowCoordinateHeader = function()
{
	return this.m_showCoordinateHeader;
};
oFF.SacTable.prototype.setShowCoordinateHeader = function(showCoordinateHeader)
{
	this.m_showCoordinateHeader = showCoordinateHeader;
};
oFF.SacTable.prototype.isShowSubTitle = function()
{
	return this.m_showSubTitle;
};
oFF.SacTable.prototype.setShowSubTitle = function(showSubTitle)
{
	this.m_showSubTitle = showSubTitle;
};
oFF.SacTable.prototype.isShowTableDetails = function()
{
	return this.m_showTableDetails;
};
oFF.SacTable.prototype.setShowTableDetails = function(showTableDetails)
{
	this.m_showTableDetails = showTableDetails;
};
oFF.SacTable.prototype.getWidth = function()
{
	return this.m_width;
};
oFF.SacTable.prototype.setWidth = function(width)
{
	this.m_width = width;
};
oFF.SacTable.prototype.getHeight = function()
{
	return this.m_height;
};
oFF.SacTable.prototype.setHeight = function(height)
{
	this.m_height = height;
};
oFF.SacTable.prototype.getMinCellWidth = function()
{
	return this.m_minCellWidth;
};
oFF.SacTable.prototype.setMinCellWidth = function(minCellWidth)
{
	this.m_minCellWidth = minCellWidth;
};
oFF.SacTable.prototype.getMaxCellWidth = function()
{
	return this.m_maxCellWidth;
};
oFF.SacTable.prototype.setMaxCellWidth = function(maxCellWidth)
{
	this.m_maxCellWidth = maxCellWidth;
};
oFF.SacTable.prototype.isColorateHeaderCells = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_headerColor);
};
oFF.SacTable.prototype.setColorateHeaderCells = function(colorateHeaderCells)
{
	this.m_headerColor = colorateHeaderCells ? "rgba(173, 212, 216, 1)" : null;
};
oFF.SacTable.prototype.isStripeDataRows = function()
{
	return this.m_stripeDataRows;
};
oFF.SacTable.prototype.setStripeDataRows = function(stripeDataRows)
{
	this.m_stripeDataRows = stripeDataRows;
};
oFF.SacTable.prototype.isStripeDataColumns = function()
{
	return this.m_stripeDataColumns;
};
oFF.SacTable.prototype.setStripeDataColumns = function(stripeDataColumns)
{
	this.m_stripeDataColumns = stripeDataColumns;
};
oFF.SacTable.prototype.isRepetitiveHeaderNames = function()
{
	return this.m_repetitiveHeaderNames;
};
oFF.SacTable.prototype.setRepetitiveHeaderNames = function(repetitiveHeaderNames)
{
	this.m_repetitiveHeaderNames = repetitiveHeaderNames;
	this.formatHeaderColumnWidths();
	this.formatDataColumnWidths();
};
oFF.SacTable.prototype.isMergeRepetitiveHeaderCells = function()
{
	return this.m_mergeRepetitiveHeaderCells;
};
oFF.SacTable.prototype.setMergeRepetitiveHeaderCells = function(mergeRepetitiveHeaderCells)
{
	this.m_mergeRepetitiveHeaderCells = mergeRepetitiveHeaderCells;
};
oFF.SacTable.prototype.getCellChartInfo = function()
{
	return this.m_cellChartInfo;
};
oFF.SacTable.prototype.clear = function()
{
	this.m_rowList.clear();
	this.m_headerRowList.clear();
	this.m_columnList.clear();
	this.m_headerColumnList.clear();
};
oFF.SacTable.prototype.getHeaderEndRowLineColor = function()
{
	return this.m_headerEndRowLineColor;
};
oFF.SacTable.prototype.getDataSectionBottomLineColor = function()
{
	return this.m_dataSectionBottomLineColor;
};
oFF.SacTable.prototype.setDataSectionBottomLineColor = function(dataSectionBottomLineColor)
{
	this.m_dataSectionBottomLineColor = dataSectionBottomLineColor;
};
oFF.SacTable.prototype.setHeaderEndRowLineColor = function(headerEndRowLineColor)
{
	this.m_headerEndRowLineColor = headerEndRowLineColor;
};
oFF.SacTable.prototype.isReversedHierarchy = function()
{
	return this.m_reversedHierarchy;
};
oFF.SacTable.prototype.setReversedHierarchy = function(reversedHierarchy)
{
	this.m_reversedHierarchy = reversedHierarchy;
};
oFF.SacTable.prototype.clearHeaderRowList = function()
{
	for (var i = 0; i < this.m_headerRowList.size(); i++)
	{
		this.notifyHeightOffset(-this.m_headerRowList.get(i).getHeight());
	}
	this.m_headerRowList.clear();
};
oFF.SacTable.prototype.clearHeaderColumnList = function()
{
	var columnsToRemove = this.m_headerColumnList.size();
	var h;
	var rowObject;
	var i;
	for (h = 0; h < this.m_headerRowList.size(); h++)
	{
		rowObject = this.m_headerRowList.get(h);
		for (i = 0; i < columnsToRemove; i++)
		{
			rowObject.removeCellAt(0);
		}
	}
	for (h = 0; h < this.m_rowList.size(); h++)
	{
		rowObject = this.m_rowList.get(h);
		if (oFF.notNull(rowObject))
		{
			for (i = 0; i < columnsToRemove; i++)
			{
				rowObject.removeCellAt(0);
			}
		}
	}
	this.m_headerColumnList.clear();
};
oFF.SacTable.prototype.isColorateTotals = function()
{
	return oFF.XStringUtils.isNotNullAndNotEmpty(this.m_totalLevel0Color) && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_totalLevel1Color) && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_totalLevel2Color) && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_totalLevel3Color) && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_totalLevel4Color) && oFF.XStringUtils.isNotNullAndNotEmpty(this.m_totalLevel5Color);
};
oFF.SacTable.prototype.setColorateTotals = function(colorateTotals)
{
	this.m_totalLevel5Color = colorateTotals ? "rgba(220,220,150,0.3)" : null;
	this.m_totalLevel4Color = colorateTotals ? "rgba(230,230,150,0.4)" : null;
	this.m_totalLevel3Color = colorateTotals ? "rgba(220,220,135,0.4)" : null;
	this.m_totalLevel2Color = colorateTotals ? "rgba(220,220,135,0.5)" : null;
	this.m_totalLevel1Color = colorateTotals ? "rgba(220,220,220,1)" : null;
	this.m_totalLevel0Color = colorateTotals ? "rgba(204,204,204,1)" : null;
};
oFF.SacTable.prototype.getTotalLevel6Color = function()
{
	return this.m_totalLevel6Color;
};
oFF.SacTable.prototype.setTotalLevel6Color = function(totalLevel6Color)
{
	this.m_totalLevel6Color = totalLevel6Color;
};
oFF.SacTable.prototype.getTotalLevel5Color = function()
{
	return this.m_totalLevel5Color;
};
oFF.SacTable.prototype.setTotalLevel5Color = function(totalLevel5Color)
{
	this.m_totalLevel5Color = totalLevel5Color;
};
oFF.SacTable.prototype.getTotalLevel4Color = function()
{
	return this.m_totalLevel4Color;
};
oFF.SacTable.prototype.setTotalLevel4Color = function(totalLevel4Color)
{
	this.m_totalLevel4Color = totalLevel4Color;
};
oFF.SacTable.prototype.getTotalLevel3Color = function()
{
	return this.m_totalLevel3Color;
};
oFF.SacTable.prototype.setTotalLevel3Color = function(totalLevel3Color)
{
	this.m_totalLevel3Color = totalLevel3Color;
};
oFF.SacTable.prototype.getTotalLevel2Color = function()
{
	return this.m_totalLevel2Color;
};
oFF.SacTable.prototype.setTotalLevel2Color = function(totalLevel2Color)
{
	this.m_totalLevel2Color = totalLevel2Color;
};
oFF.SacTable.prototype.getTotalLevel1Color = function()
{
	return this.m_totalLevel1Color;
};
oFF.SacTable.prototype.setTotalLevel1Color = function(totalLevel1Color)
{
	this.m_totalLevel1Color = totalLevel1Color;
};
oFF.SacTable.prototype.getTotalLevel0Color = function()
{
	return this.m_totalLevel0Color;
};
oFF.SacTable.prototype.setTotalLevel0Color = function(totalLevel0Color)
{
	this.m_totalLevel0Color = totalLevel0Color;
};
oFF.SacTable.prototype.adaptMergedCells = function(mergedCell)
{
	var mergedColumns = mergedCell.getMergedColumns();
	var mergedRows = mergedCell.getMergedRows();
	var parentRow = mergedCell.getParentRow();
	var cells = parentRow.getCells();
	var columnIndex = cells.getIndex(mergedCell);
	var headerRowIndex = this.m_headerRowList.getIndex(parentRow);
	var dataRowIndex = this.m_rowList.getIndex(parentRow);
	this.adaptCells(columnIndex, mergedColumns, cells, 0);
	this.resetCellMerger(columnIndex + mergedColumns + 1, cells);
	if (headerRowIndex > -1)
	{
		this.adaptRows(this.m_headerRowList, headerRowIndex, mergedRows, columnIndex, mergedColumns);
	}
	if (dataRowIndex > -1)
	{
		this.adaptRows(this.m_rowList, dataRowIndex, mergedRows, columnIndex, mergedColumns);
	}
};
oFF.SacTable.prototype.adaptRows = function(rowList, rowIndex, mergedRows, columnIndex, mergedColumns)
{
	var cell;
	var subCells;
	var rowObj;
	var row;
	for (row = rowIndex + 1; row < rowList.size() && row < rowIndex + mergedRows + 1; row++)
	{
		rowObj = rowList.get(row);
		subCells = rowObj.getCells();
		cell = subCells.get(columnIndex);
		cell.setMergedRowsInternal(rowIndex - row);
		cell.setMergedColumnsInternal(0);
		this.adaptCells(columnIndex, mergedColumns, subCells, row - rowIndex);
		this.resetCellMerger(columnIndex + mergedColumns + 1, subCells);
	}
	for (; row < rowList.size(); row++)
	{
		rowObj = rowList.get(row);
		subCells = rowObj.getCells();
		cell = subCells.get(columnIndex);
		if (cell.getMergedRows() < 0)
		{
			cell.setMergedRowsInternal(0);
			cell.setMergedColumnsInternal(0);
			this.resetCellMerger(columnIndex + 1, subCells);
		}
		else
		{
			break;
		}
	}
};
oFF.SacTable.prototype.adaptCells = function(columnIndex, mergedColums, cells, rowsOffset)
{
	var cell;
	var columnOffset;
	for (columnOffset = 0; columnOffset < mergedColums && columnIndex + columnOffset + 1 < cells.size(); columnOffset++)
	{
		cell = cells.get(columnIndex + columnOffset + 1);
		cell.setMergedColumnsInternal(-columnOffset - 1);
		cell.setMergedRowsInternal(-rowsOffset);
	}
};
oFF.SacTable.prototype.resetCellMerger = function(columnIndex, cells)
{
	for (var nci = columnIndex; nci < cells.size(); nci++)
	{
		var cell = cells.get(nci);
		if (cell.getMergedColumns() < 0)
		{
			cell.setMergedColumnsInternal(0);
			cell.setMergedRowsInternal(0);
		}
		else
		{
			break;
		}
	}
};
oFF.SacTable.prototype.getColumnList = function()
{
	return this.m_columnList;
};
oFF.SacTable.prototype.getHeaderColumnList = function()
{
	return this.m_headerColumnList;
};
oFF.SacTable.prototype.getFreezeUpToRow = function()
{
	return this.m_freezeUpToRow;
};
oFF.SacTable.prototype.setFreezeUpToRow = function(freezeUpToRows)
{
	this.m_freezeUpToRow = freezeUpToRows;
};
oFF.SacTable.prototype.getFreezeUpToColumn = function()
{
	return this.m_freezeUpToColumn;
};
oFF.SacTable.prototype.setFreezeUpToColumn = function(freezeUpToColumns)
{
	this.m_freezeUpToColumn = freezeUpToColumns;
};
oFF.SacTable.prototype.addNewDataPointStyle = function()
{
	var newStyle = oFF.SacDataPointStyle.create();
	this.m_dataPointStyles.add(newStyle);
	return newStyle;
};
oFF.SacTable.prototype.getDataPointStyles = function()
{
	return this.m_dataPointStyles;
};
oFF.SacTable.prototype.getDataPointStylesMatchingExceptionInformation = function(exceptionInfo)
{
	return oFF.XStream.of(this.m_dataPointStyles).filter( function(dps){
		return oFF.XStream.of(exceptionInfo).anyMatch( function(ei){
			return dps.matchesExceptionInfo(ei);
		}.bind(this));
	}.bind(this)).collect(oFF.XStreamCollector.toList());
};
oFF.SacTable.prototype.clearDataPointStyles = function()
{
	this.m_dataPointStyles.clear();
};
oFF.SacTable.prototype.addNewHiddenRowRule = function()
{
	var rule = oFF.SacTableAxisSectionReference.create();
	this.m_hiddenRows.add(rule);
	return rule;
};
oFF.SacTable.prototype.addNewHiddenColumnRule = function()
{
	var rule = oFF.SacTableAxisSectionReference.create();
	this.m_hiddenColumns.add(rule);
	return rule;
};
oFF.SacTable.prototype.addNewColumnWidthRule = function(width)
{
	var rule = oFF.SacTableAxisSectionReference.create();
	this.m_columnWidths.put(rule, oFF.XIntegerValue.create(width));
	return rule;
};
oFF.SacTable.prototype.addNewRowHeightRule = function(height)
{
	var rule = oFF.SacTableAxisSectionReference.create();
	this.m_rowHeights.put(rule, oFF.XIntegerValue.create(height));
	return rule;
};
oFF.SacTable.prototype.getHiddenRows = function()
{
	return this.m_hiddenRows;
};
oFF.SacTable.prototype.getHiddenColumns = function()
{
	return this.m_hiddenColumns;
};
oFF.SacTable.prototype.getRowHeights = function()
{
	return this.m_rowHeights;
};
oFF.SacTable.prototype.getColumnWidths = function()
{
	return this.m_columnWidths;
};
oFF.SacTable.prototype.getMaxColumns = function()
{
	return this.m_maxColumns;
};
oFF.SacTable.prototype.setMaxColumns = function(maxColumns)
{
	this.m_maxColumns = maxColumns;
};
oFF.SacTable.prototype.getMaxRows = function()
{
	return this.m_maxRows;
};
oFF.SacTable.prototype.setMaxRows = function(maxRows)
{
	this.m_maxRows = maxRows;
};

oFF.SacTableAxis = function() {};
oFF.SacTableAxis.prototype = new oFF.SacTableFormattableElement();
oFF.SacTableAxis.prototype._ff_c = "SacTableAxis";

oFF.SacTableAxis.prototype.m_table = null;
oFF.SacTableAxis.prototype.m_header = false;
oFF.SacTableAxis.prototype.m_id = null;
oFF.SacTableAxis.prototype.m_startOfHeaderSection = null;
oFF.SacTableAxis.prototype.m_partOfHeaderSection = null;
oFF.SacTableAxis.prototype.m_endOfHeaderSection = null;
oFF.SacTableAxis.prototype.m_startOfDataPath = null;
oFF.SacTableAxis.prototype.m_partOfDataPath = null;
oFF.SacTableAxis.prototype.m_endOfDataPath = null;
oFF.SacTableAxis.prototype.setupInternal = function(sacTable)
{
	this.m_table = oFF.XWeakReferenceUtil.getWeakRef(sacTable);
	this.m_startOfHeaderSection = oFF.XList.create();
	this.m_partOfHeaderSection = oFF.XList.create();
	this.m_endOfHeaderSection = oFF.XList.create();
	this.m_startOfDataPath = oFF.XList.create();
	this.m_partOfDataPath = oFF.XList.create();
	this.m_endOfDataPath = oFF.XList.create();
};
oFF.SacTableAxis.prototype.releaseObject = function()
{
	this.m_table = null;
	this.m_id = null;
	this.m_header = false;
	this.m_startOfHeaderSection = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_startOfHeaderSection);
	this.m_partOfHeaderSection = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_partOfHeaderSection);
	this.m_endOfHeaderSection = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_endOfHeaderSection);
	this.m_startOfDataPath = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_startOfDataPath);
	this.m_partOfDataPath = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_partOfDataPath);
	this.m_endOfDataPath = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_endOfDataPath);
	oFF.SacTableFormattableElement.prototype.releaseObject.call( this );
};
oFF.SacTableAxis.prototype.getParentTable = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_table);
};
oFF.SacTableAxis.prototype.setId = function(id)
{
	if (!oFF.XString.isEqual(id, this.m_id))
	{
		this.m_id = id;
	}
};
oFF.SacTableAxis.prototype.getId = function()
{
	return this.m_id;
};
oFF.SacTableAxis.prototype.isHeader = function()
{
	return this.m_header;
};
oFF.SacTableAxis.prototype.setHeader = function(header)
{
	this.m_header = header;
};
oFF.SacTableAxis.prototype.addStartOfHeaderSectionInfo = function()
{
	var sectionInfo = oFF.SacHeaderSectionInfo.create();
	this.m_startOfHeaderSection.add(sectionInfo);
	return sectionInfo;
};
oFF.SacTableAxis.prototype.addPartOfHeaderSectionInfo = function()
{
	var sectionInfo = oFF.SacHeaderSectionInfo.create();
	this.m_partOfHeaderSection.add(sectionInfo);
	return sectionInfo;
};
oFF.SacTableAxis.prototype.addEndOfHeaderSectionInfo = function()
{
	var sectionInfo = oFF.SacHeaderSectionInfo.create();
	this.m_endOfHeaderSection.add(sectionInfo);
	return sectionInfo;
};
oFF.SacTableAxis.prototype.addStartOfDataPath = function()
{
	var sectionInfo = oFF.SacDataPath.create();
	this.m_startOfDataPath.add(sectionInfo);
	return sectionInfo;
};
oFF.SacTableAxis.prototype.addPartOfDataPath = function()
{
	var sectionInfo = oFF.SacDataPath.create();
	this.m_partOfDataPath.add(sectionInfo);
	return sectionInfo;
};
oFF.SacTableAxis.prototype.addEndOfDataPath = function()
{
	var sectionInfo = oFF.SacDataPath.create();
	this.m_endOfDataPath.add(sectionInfo);
	return sectionInfo;
};
oFF.SacTableAxis.prototype.getFullIndex = function()
{
	var headerIndex = this.getHeaderIndex();
	return headerIndex === -1 ? this.getHeadersSize() + this.getDataIndex() : headerIndex;
};
oFF.SacTableAxis.prototype.getFullSize = function()
{
	return this.getHeadersSize() + this.getDataSize();
};
oFF.SacTableAxis.prototype.getStartOfHeaderSectionInfos = function()
{
	return this.m_startOfHeaderSection;
};
oFF.SacTableAxis.prototype.getPartOfHeaderSectionInfos = function()
{
	return this.m_partOfHeaderSection;
};
oFF.SacTableAxis.prototype.getEndOfHeaderSectionInfos = function()
{
	return this.m_endOfHeaderSection;
};
oFF.SacTableAxis.prototype.getStartOfDataPaths = function()
{
	return this.m_startOfDataPath;
};
oFF.SacTableAxis.prototype.getPartOfDataPaths = function()
{
	return this.m_partOfDataPath;
};
oFF.SacTableAxis.prototype.getEndOfDataPaths = function()
{
	return this.m_endOfDataPath;
};
oFF.SacTableAxis.prototype.matchesSacTableSectionInfo = function(tableAxisSectionReference)
{
	var headerIndex = this.getHeaderIndex();
	var dataIndex = this.getDataIndex();
	var headerSize = this.getHeadersSize();
	var dataSize = this.getDataSize();
	var matching = false;
	if (tableAxisSectionReference.isMatchFullHeaderSection() && tableAxisSectionReference.isMatchFullDataSection())
	{
		matching = tableAxisSectionReference.matchesPosition(this.getFullIndex(), this.getFullSize());
	}
	if (!matching && tableAxisSectionReference.isMatchFullHeaderSection() && oFF.XCollectionUtils.hasElements(this.m_partOfHeaderSection))
	{
		matching = tableAxisSectionReference.matchesPosition(this.getHeaderIndex(), this.getHeadersSize());
	}
	if (!matching && tableAxisSectionReference.isMatchFullDataSection() && oFF.XCollectionUtils.hasElements(this.m_partOfDataPath))
	{
		matching = tableAxisSectionReference.matchesPosition(this.getDataIndex(), this.getDataSize());
	}
	if (!matching && tableAxisSectionReference.isMatchHeaderSectionStart() && headerIndex === 0)
	{
		matching = true;
	}
	if (!matching && tableAxisSectionReference.isMatchHeaderSectionEnd() && headerIndex === headerSize - 1)
	{
		matching = true;
	}
	if (!matching && tableAxisSectionReference.isMatchDataSectionStart() && dataIndex === 0)
	{
		matching = true;
	}
	if (!matching && tableAxisSectionReference.isMatchDataSectionEnd() && dataIndex === dataSize - 1)
	{
		matching = true;
	}
	if (!matching && oFF.XCollectionUtils.hasElements(this.m_partOfHeaderSection))
	{
		matching = oFF.XStream.of(this.m_partOfHeaderSection).filter( function(poh){
			return poh.matchesSectionReference(tableAxisSectionReference);
		}.bind(this)).anyMatch( function(ppoohh){
			var startHeader1 = this.searchBackHeaderReference(ppoohh, headerIndex);
			var endHeader1 = this.searchForwardHeaderReference(ppoohh, headerIndex, headerSize);
			return tableAxisSectionReference.matchesPosition(headerIndex - startHeader1, endHeader1 - startHeader1);
		}.bind(this));
	}
	if (!matching && oFF.XCollectionUtils.hasElements(this.m_partOfDataPath))
	{
		matching = oFF.XStream.of(this.m_partOfDataPath).filter( function(pod){
			return pod.matchesSectionReference(tableAxisSectionReference);
		}.bind(this)).anyMatch( function(ppoodd){
			var startHeader2 = this.searchBackDataReference(ppoodd, dataIndex);
			var endHeader2 = this.searchForwardDataReference(ppoodd, dataIndex, dataSize);
			return tableAxisSectionReference.matchesPosition(headerIndex - startHeader2, endHeader2 - startHeader2);
		}.bind(this));
	}
	return matching;
};
oFF.SacTableAxis.prototype.searchForwardDataReference = function(info, index, size)
{
	if (this.m_endOfDataPath.contains(info) || index === size - 1)
	{
		return index;
	}
	var sibling = this.getDataSiblingAt(index + 1);
	if (oFF.isNull(sibling))
	{
		return index + 1;
	}
	return sibling.searchForwardDataReference(info, index + 1, size);
};
oFF.SacTableAxis.prototype.searchBackDataReference = function(info, index)
{
	if (this.m_startOfDataPath.contains(info) || index === 0)
	{
		return index;
	}
	var sibling = this.getDataSiblingAt(index - 1);
	if (oFF.isNull(sibling))
	{
		return index - 1;
	}
	return sibling.searchBackDataReference(info, index - 1);
};
oFF.SacTableAxis.prototype.searchForwardHeaderReference = function(info, index, size)
{
	if (this.m_endOfHeaderSection.contains(info) || index === size - 1)
	{
		return index;
	}
	var sibling = this.getHeaderSiblingAt(index + 1);
	if (oFF.isNull(sibling))
	{
		return index + 1;
	}
	return sibling.searchForwardHeaderReference(info, index + 1, size);
};
oFF.SacTableAxis.prototype.searchBackHeaderReference = function(info, index)
{
	if (this.m_startOfHeaderSection.contains(info) || index === 0)
	{
		return index;
	}
	var sibling = this.getHeaderSiblingAt(index - 1);
	if (oFF.isNull(sibling))
	{
		return index - 1;
	}
	return sibling.searchBackHeaderReference(info, index - 1);
};

oFF.SacTableCell = function() {};
oFF.SacTableCell.prototype = new oFF.SacTableFormattableElement();
oFF.SacTableCell.prototype._ff_c = "SacTableCell";

oFF.SacTableCell._create = function(row, column)
{
	var instance = new oFF.SacTableCell();
	instance.setupInternal(row, column);
	return instance;
};
oFF.SacTableCell.prototype.m_parentRow = null;
oFF.SacTableCell.prototype.m_parentColumn = null;
oFF.SacTableCell.prototype.m_lengthAddition = 0;
oFF.SacTableCell.prototype.m_id = null;
oFF.SacTableCell.prototype.m_type = 0;
oFF.SacTableCell.prototype.m_formatted = null;
oFF.SacTableCell.prototype.m_formattingPattern = null;
oFF.SacTableCell.prototype.m_plain = null;
oFF.SacTableCell.prototype.m_allowDragDrop = false;
oFF.SacTableCell.prototype.m_repeatedHeader = false;
oFF.SacTableCell.prototype.m_wrap = false;
oFF.SacTableCell.prototype.m_inHierarchy = false;
oFF.SacTableCell.prototype.m_hierarchyLevel = 0;
oFF.SacTableCell.prototype.m_showDrillIcon = false;
oFF.SacTableCell.prototype.m_hierarchyPaddingType = null;
oFF.SacTableCell.prototype.m_hierarchyPaddingValue = 0;
oFF.SacTableCell.prototype.m_expanded = false;
oFF.SacTableCell.prototype.m_commentDocumentId = null;
oFF.SacTableCell.prototype.m_mergedColumns = 0;
oFF.SacTableCell.prototype.m_mergedRows = 0;
oFF.SacTableCell.prototype.m_exceptionInformations = null;
oFF.SacTableCell.prototype.setupInternal = function(row, column)
{
	this.m_parentRow = oFF.XWeakReferenceUtil.getWeakRef(row);
	this.m_parentColumn = oFF.XWeakReferenceUtil.getWeakRef(column);
	this.m_exceptionInformations = oFF.XList.create();
	this.m_type = -1;
	this.setupTableStyleWithPriority(1);
};
oFF.SacTableCell.prototype.releaseObject = function()
{
	this.m_parentRow = null;
	this.m_parentColumn = null;
	this.m_lengthAddition = 0;
	this.m_id = null;
	this.m_type = -1;
	this.m_formatted = null;
	this.m_plain = null;
	this.m_allowDragDrop = false;
	this.m_repeatedHeader = false;
	this.m_inHierarchy = false;
	this.m_hierarchyLevel = 0;
	this.m_showDrillIcon = false;
	this.m_hierarchyPaddingType = null;
	this.m_hierarchyPaddingValue = 0;
	this.m_expanded = false;
	this.m_commentDocumentId = null;
	this.m_mergedColumns = 0;
	this.m_mergedRows = 0;
	this.m_exceptionInformations = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_exceptionInformations);
	oFF.SacTableFormattableElement.prototype.releaseObject.call( this );
};
oFF.SacTableCell.prototype.getParentRow = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_parentRow);
};
oFF.SacTableCell.prototype.getParentColumn = function()
{
	return oFF.XWeakReferenceUtil.getHardRef(this.m_parentColumn);
};
oFF.SacTableCell.prototype.setId = function(id)
{
	this.m_id = id;
};
oFF.SacTableCell.prototype.getId = function()
{
	return this.m_id;
};
oFF.SacTableCell.prototype.setType = function(type)
{
	this.m_type = type;
};
oFF.SacTableCell.prototype.getType = function()
{
	return this.m_type;
};
oFF.SacTableCell.prototype.setFormatted = function(formatted)
{
	this.m_formatted = formatted;
};
oFF.SacTableCell.prototype.getFormatted = function()
{
	return this.m_formatted;
};
oFF.SacTableCell.prototype.setPlain = function(plain)
{
	this.m_plain = plain;
};
oFF.SacTableCell.prototype.setPlainString = function(plainString)
{
	this.m_plain = oFF.XStringValue.create(plainString);
};
oFF.SacTableCell.prototype.getFormattingPattern = function()
{
	return this.m_formattingPattern;
};
oFF.SacTableCell.prototype.setFormattingPattern = function(formattingPattern)
{
	this.m_formattingPattern = formattingPattern;
};
oFF.SacTableCell.prototype.getPlain = function()
{
	return this.m_plain;
};
oFF.SacTableCell.prototype.getLengthAddition = function()
{
	return this.m_lengthAddition;
};
oFF.SacTableCell.prototype.setLengthAddition = function(lengthAddition)
{
	this.m_lengthAddition = lengthAddition;
};
oFF.SacTableCell.prototype.getCommentDocumentId = function()
{
	return this.m_commentDocumentId;
};
oFF.SacTableCell.prototype.setCommentDocumentId = function(commentDocumentId)
{
	this.m_commentDocumentId = commentDocumentId;
};
oFF.SacTableCell.prototype.getEffectiveCellType = function()
{
	var cellType = this.m_type;
	if (this.getMergedColumns() < 0 || this.getMergedRows() < 0)
	{
		cellType = oFF.SacTableConstants.CT_MERGED_DUMMY_CELL;
	}
	else if (this.m_type === -1 && this.getParentRow().isHeader())
	{
		cellType = oFF.SacTableConstants.CT_HEADER;
	}
	return cellType;
};
oFF.SacTableCell.prototype.isAllowDragDrop = function()
{
	return this.m_allowDragDrop;
};
oFF.SacTableCell.prototype.setAllowDragDrop = function(allowDragDrop)
{
	this.m_allowDragDrop = allowDragDrop;
};
oFF.SacTableCell.prototype.isRepeatedHeader = function()
{
	return this.m_repeatedHeader;
};
oFF.SacTableCell.prototype.setRepeatedHeader = function(repeatedHeader)
{
	this.m_repeatedHeader = repeatedHeader;
};
oFF.SacTableCell.prototype.isHeaderCell = function()
{
	return this.getParentColumn().isHeader() || this.getParentRow().isHeader();
};
oFF.SacTableCell.prototype.isDimensionHeader = function()
{
	return this.getType() === oFF.SacTableConstants.CT_COL_DIM_HEADER || this.getType() === oFF.SacTableConstants.CT_ROW_DIM_HEADER;
};
oFF.SacTableCell.prototype.isUnbooked = function()
{
	return this.m_type === oFF.SacTableConstants.CT_UNBOOKED;
};
oFF.SacTableCell.prototype.isLastHeaderRow = function()
{
	var parentRow = this.getParentRow();
	var headerRowList = parentRow.getParentTable().getHeaderRowList();
	var headerRowsSize = headerRowList.size();
	return headerRowsSize > 0 && this.getParentRow() === headerRowList.get(headerRowsSize - 1);
};
oFF.SacTableCell.prototype.isInHierarchy = function()
{
	return this.m_inHierarchy;
};
oFF.SacTableCell.prototype.setInHierarchy = function(inHierarchy)
{
	this.m_inHierarchy = inHierarchy;
};
oFF.SacTableCell.prototype.getHierarchyLevel = function()
{
	return this.m_hierarchyLevel;
};
oFF.SacTableCell.prototype.setHierarchyLevel = function(hierarchyLevel)
{
	this.m_hierarchyLevel = hierarchyLevel;
};
oFF.SacTableCell.prototype.isShowDrillIcon = function()
{
	return this.m_showDrillIcon;
};
oFF.SacTableCell.prototype.setShowDrillIcon = function(showDrillIcon)
{
	this.m_showDrillIcon = showDrillIcon;
};
oFF.SacTableCell.prototype.getHierarchyPaddingType = function()
{
	return this.m_hierarchyPaddingType;
};
oFF.SacTableCell.prototype.setHierarchyPaddingType = function(hierarchyPaddingType)
{
	this.m_hierarchyPaddingType = hierarchyPaddingType;
};
oFF.SacTableCell.prototype.getHierarchyPaddingValue = function()
{
	return this.m_hierarchyPaddingValue;
};
oFF.SacTableCell.prototype.setHierarchyPaddingValue = function(hierarchyPaddingValue)
{
	this.m_hierarchyPaddingValue = hierarchyPaddingValue;
};
oFF.SacTableCell.prototype.isExpanded = function()
{
	return this.m_expanded;
};
oFF.SacTableCell.prototype.setExpanded = function(expanded)
{
	this.m_expanded = expanded;
};
oFF.SacTableCell.prototype.getPrioritizedStylesList = function()
{
	var stylesList = oFF.XList.create();
	stylesList.add(this.getTableStyle());
	var parentColumn = this.getParentColumn();
	var parentRow = this.getParentRow();
	var parentTable = parentColumn.getParentTable();
	oFF.XStream.of(parentTable.getDataPointStylesMatchingExceptionInformation(this.getExceptionInformations())).forEach( function(dps){
		stylesList.add(dps.getTableStyle());
	}.bind(this));
	var headerRowList = parentTable.getHeaderRowList();
	var lastHeaderRowIndex = headerRowList.size() - 1;
	var dataRowList = parentTable.getRowList();
	var lastDataRowIndex = parentTable.getDataRowAmount() - 1;
	var headerColumnList = parentTable.getHeaderColumnList();
	var lastHeaderColumnIndex = headerColumnList.size() - 1;
	var dataColumnList = parentTable.getColumnList();
	var lastDataColumnIndex = parentTable.getDataColumnsAmount() - 1;
	stylesList.addAll(this.getSecondaryTableStyles());
	stylesList.addAll(oFF.XStream.of(parentColumn.getSecondaryTableStyles()).filter( function(csc){
		return this.appliesForColumn(csc, parentRow, headerRowList, dataRowList, lastHeaderRowIndex, lastDataRowIndex);
	}.bind(this)).collect(oFF.XStreamCollector.toList()));
	stylesList.addAll(oFF.XStream.of(parentRow.getSecondaryTableStyles()).filter( function(csr){
		return this.appliesForRow(csr, parentColumn, headerColumnList, dataColumnList, lastHeaderColumnIndex, lastDataColumnIndex);
	}.bind(this)).collect(oFF.XStreamCollector.toList()));
	stylesList.addAll(oFF.XStream.of(parentTable.getSecondaryTableStyles()).filter( function(cst){
		return this.appliesForColumn(cst, parentRow, headerRowList, dataRowList, lastHeaderRowIndex, lastDataRowIndex) || this.appliesForRow(cst, parentColumn, headerColumnList, dataColumnList, lastHeaderColumnIndex, lastDataColumnIndex);
	}.bind(this)).collect(oFF.XStreamCollector.toList()));
	stylesList.add(parentRow.getTableStyle());
	stylesList.add(parentColumn.getTableStyle());
	stylesList.add(parentTable.getTableStyle());
	var compareFunction =  function(a, b){
		return oFF.XIntegerValue.create(a.getPriority() - b.getPriority());
	}.bind(this);
	stylesList.sortByComparator(oFF.XComparatorLambda.create(compareFunction));
	return stylesList;
};
oFF.SacTableCell.prototype.appliesForColumn = function(cs, parentRow, headerRowList, dataRowList, lastHeaderRowIndex, lastDataRowIndex)
{
	return !cs.isRestrictToRowStyle() && (parentRow.isHeader() || !cs.isRestrictToHeaderCells()) && (!parentRow.isHeader() || !cs.isRestrictToDataCells()) && (!cs.isRestrictToFirstItem() || parentRow.isHeader() && headerRowList.getIndex(parentRow) === 0 || !parentRow.isHeader() && dataRowList.getIndex(parentRow) === 0) && (!cs.isRestrictToLastItem() || parentRow.isHeader() && headerRowList.getIndex(parentRow) === lastHeaderRowIndex || !parentRow.isHeader() && dataRowList.getIndex(parentRow) === lastDataRowIndex);
};
oFF.SacTableCell.prototype.appliesForRow = function(cs, parentColumn, headerColumnList, dataColumnList, lastHeaderColumnIndex, lastDataColumnIndex)
{
	return !cs.isRestrictToColumnStyle() && (parentColumn.isHeader() || !cs.isRestrictToHeaderCells()) && (!parentColumn.isHeader() || !cs.isRestrictToDataCells()) && (!cs.isRestrictToFirstItem() || parentColumn.isHeader() && headerColumnList.getIndex(parentColumn) === 0 || !parentColumn.isHeader() && dataColumnList.getIndex(parentColumn) === 0) && (!cs.isRestrictToLastItem() || parentColumn.isHeader() && headerColumnList.getIndex(parentColumn) === lastHeaderColumnIndex || !parentColumn.isHeader() && dataColumnList.getIndex(parentColumn) === lastDataColumnIndex);
};
oFF.SacTableCell.prototype.getEffectiveStyledLineTop = function(styles)
{
	var lineStyle = oFF.SacStyledLine.create();
	var mayBeIncomplete = true;
	for (var i = 1; mayBeIncomplete && i < styles.size(); i++)
	{
		mayBeIncomplete = lineStyle.mergeIntoMe(styles.get(i).getStyledLineTop());
	}
	return lineStyle;
};
oFF.SacTableCell.prototype.getEffectiveStyleLineBottom = function(styles)
{
	var lineStyle = oFF.SacStyledLine.create();
	var mayBeIncomplete = true;
	for (var i = 1; mayBeIncomplete && i < styles.size(); i++)
	{
		mayBeIncomplete = lineStyle.mergeIntoMe(styles.get(i).getStyledLineBottom());
	}
	if (lineStyle.getColor() === null && this.isLastHeaderRow())
	{
		lineStyle.setColor(this.getParentRow().getParentTable().getHeaderEndRowLineColor());
	}
	if (lineStyle.getColor() === null && !this.getParentRow().isHeader())
	{
		lineStyle.setColor(this.getParentRow().getParentTable().getDataSectionBottomLineColor());
	}
	return lineStyle;
};
oFF.SacTableCell.prototype.getEffectiveStyledLineLeft = function(styles)
{
	var lineStyle = oFF.SacStyledLine.create();
	var mayBeIncomplete = true;
	for (var i = 1; mayBeIncomplete && i < styles.size(); i++)
	{
		mayBeIncomplete = lineStyle.mergeIntoMe(styles.get(i).getStyledLineLeft());
	}
	return lineStyle;
};
oFF.SacTableCell.prototype.getEffectiveStyledLineRight = function(styles)
{
	var lineStyle = oFF.SacStyledLine.create();
	var mayBeIncomplete = true;
	for (var i = 1; mayBeIncomplete && i < styles.size(); i++)
	{
		mayBeIncomplete = lineStyle.mergeIntoMe(styles.get(i).getStyledLineRight());
	}
	return lineStyle;
};
oFF.SacTableCell.prototype.getEffectiveFillColor = function(styles)
{
	var color = styles.get(0).getFillColor();
	for (var i = 1; i < styles.size() && oFF.isNull(color); i++)
	{
		color = styles.get(i).getFillColor();
	}
	if (oFF.isNull(color) && this.isHeaderCell())
	{
		color = this.getParentRow().getParentTable().getHeaderColor();
	}
	if (oFF.isNull(color) && !this.isHeaderCell() && this.isEffectiveTotalsContext() && this.getEffectiveTotalLevel() > -1)
	{
		var parentTable = this.getParentRow().getParentTable();
		switch (this.getEffectiveTotalLevel())
		{
			case 0:
				color = parentTable.getTotalLevel0Color();
				break;

			case 1:
				color = parentTable.getTotalLevel1Color();
				break;

			case 2:
				color = parentTable.getTotalLevel2Color();
				break;

			case 3:
				color = parentTable.getTotalLevel3Color();
				break;

			case 4:
				color = parentTable.getTotalLevel4Color();
				break;

			case 5:
				color = parentTable.getTotalLevel5Color();
				break;

			case 6:
				color = parentTable.getTotalLevel6Color();
				break;
		}
	}
	return color;
};
oFF.SacTableCell.prototype.isEffectiveFontItalic = function(styles)
{
	var face = styles.get(0).isFontItalicExt();
	for (var i = 1; i < styles.size() && (oFF.isNull(face) || face === oFF.TriStateBool._DEFAULT); i++)
	{
		face = styles.get(i).isFontItalicExt();
	}
	return face === oFF.TriStateBool._TRUE;
};
oFF.SacTableCell.prototype.isEffectiveFontBold = function(styles)
{
	var face = styles.get(0).isFontBoldExt();
	for (var i = 1; i < styles.size() && (oFF.isNull(face) || face === oFF.TriStateBool._DEFAULT); i++)
	{
		face = styles.get(i).isFontBoldExt();
	}
	if ((oFF.isNull(face) || face === oFF.TriStateBool._DEFAULT) && this.isEffectiveTotalsContext())
	{
		face = oFF.TriStateBool._TRUE;
	}
	return face === oFF.TriStateBool._TRUE;
};
oFF.SacTableCell.prototype.isEffectiveFontUnderline = function(styles)
{
	var face = styles.get(0).isFontUnderlineExt();
	for (var i = 1; i < styles.size() && (oFF.isNull(face) || face === oFF.TriStateBool._DEFAULT); i++)
	{
		face = styles.get(i).isFontUnderlineExt();
	}
	return face === oFF.TriStateBool._TRUE;
};
oFF.SacTableCell.prototype.isEffectiveFontStrikeThrough = function(styles)
{
	var face = styles.get(0).isFontStrikeThroughExt();
	for (var i = 1; i < styles.size() && (oFF.isNull(face) || face === oFF.TriStateBool._DEFAULT); i++)
	{
		face = styles.get(i).isFontStrikeThroughExt();
	}
	return face === oFF.TriStateBool._TRUE;
};
oFF.SacTableCell.prototype.getEffectiveFontSize = function(styles)
{
	var size = styles.get(0).getFontSize();
	for (var i = 1; i < styles.size() && size === 0; i++)
	{
		size = styles.get(i).getFontSize();
	}
	return size;
};
oFF.SacTableCell.prototype.getEffectiveHorizontalAlignment = function(styles)
{
	var alignment = styles.get(0).getHorizontalAlignment();
	for (var i = 1; i < styles.size() && oFF.isNull(alignment) || alignment === oFF.SacTableCellHorizontalAlignment.INHERIT; i++)
	{
		alignment = styles.get(i).getHorizontalAlignment();
	}
	return alignment;
};
oFF.SacTableCell.prototype.getEffectiveVerticalAlignment = function(styles)
{
	var alignment = styles.get(0).getVerticalAlignment();
	for (var i = 1; i < styles.size() && oFF.isNull(alignment) || alignment === oFF.SacTableCellVerticalAlignment.INHERIT; i++)
	{
		alignment = styles.get(i).getVerticalAlignment();
	}
	return alignment;
};
oFF.SacTableCell.prototype.getEffectiveFontFamily = function(styles)
{
	var family = styles.get(0).getFontFamily();
	for (var i = 1; i < styles.size() && oFF.isNull(family); i++)
	{
		family = styles.get(i).getFontFamily();
	}
	return family;
};
oFF.SacTableCell.prototype.getEffectiveFontColor = function(styles)
{
	var color = styles.get(0).getFontColor();
	for (var i = 1; i < styles.size() && oFF.isNull(color); i++)
	{
		color = styles.get(i).getFontColor();
	}
	return color;
};
oFF.SacTableCell.prototype.isEffectiveTotalsContext = function()
{
	return this.isTotalsContext() || !this.isHeaderCell() && (this.getParentRow().isTotalsContext() || this.getParentColumn().isTotalsContext());
};
oFF.SacTableCell.prototype.isEffectiveShowCellChart = function()
{
	return !this.isHeaderCell() && (this.isShowCellChart() || this.getParentRow().isShowCellChart() || this.getParentColumn().isShowCellChart());
};
oFF.SacTableCell.prototype.isEffectiveHideNumberForCellChart = function()
{
	return this.isHideNumberForCellChart() || this.getParentRow().isHideNumberForCellChart() || this.getParentColumn().isHideNumberForCellChart();
};
oFF.SacTableCell.prototype.getEffectiveCellChartType = function()
{
	var type = this.getCellChartType();
	if (oFF.isNull(type))
	{
		type = this.getParentRow().getCellChartType();
	}
	if (oFF.isNull(type))
	{
		type = this.getParentColumn().getCellChartType();
	}
	return type;
};
oFF.SacTableCell.prototype.getEffectiveCellChartLineColor = function(styles)
{
	var color = styles.get(0).getCellChartLineColor();
	for (var i = 1; i < styles.size() && oFF.isNull(color); i++)
	{
		color = styles.get(i).getCellChartLineColor();
	}
	return color;
};
oFF.SacTableCell.prototype.getEffectiveCellChartBarColor = function(styles)
{
	var color = styles.get(0).getCellChartBarColor();
	for (var i = 1; i < styles.size() && oFF.isNull(color); i++)
	{
		color = styles.get(i).getCellChartBarColor();
	}
	return color;
};
oFF.SacTableCell.prototype.getEffectiveThresholdColor = function(styles)
{
	var color = styles.get(0).getThresholdColor();
	for (var i = 1; i < styles.size() && oFF.isNull(color); i++)
	{
		color = styles.get(i).getThresholdColor();
	}
	return color;
};
oFF.SacTableCell.prototype.getEffectiveThresholdType = function(styles)
{
	var thresholdType = styles.get(0).getThresholdType();
	for (var i = 1; i < styles.size() && oFF.isNull(thresholdType); i++)
	{
		thresholdType = styles.get(i).getThresholdType();
	}
	return thresholdType;
};
oFF.SacTableCell.prototype.getEffectiveCellChartOrientation = function()
{
	var orientation = this.getCellChartOrientation();
	if (oFF.isNull(orientation))
	{
		orientation = this.getParentRow().getCellChartOrientation();
	}
	if (oFF.isNull(orientation))
	{
		orientation = this.getParentColumn().getCellChartOrientation();
	}
	return orientation;
};
oFF.SacTableCell.prototype.getEffectiveCellChartMemberName = function(styles)
{
	var name = this.getCellChartMemberName();
	if (oFF.isNull(name))
	{
		name = this.getParentRow().getCellChartMemberName();
	}
	if (oFF.isNull(name))
	{
		name = this.getParentColumn().getCellChartMemberName();
	}
	return name;
};
oFF.SacTableCell.prototype.getEffectiveTotalLevel = function()
{
	var totalLevel = -1;
	if (this.getParentRow().isTotalsContext())
	{
		totalLevel = this.getParentRow().getTotalLevel();
	}
	if (this.getParentColumn().isTotalsContext())
	{
		totalLevel = oFF.XMath.min(this.getParentColumn().getTotalLevel(), totalLevel);
	}
	return totalLevel;
};
oFF.SacTableCell.prototype.getMergedColumns = function()
{
	return this.m_mergedColumns;
};
oFF.SacTableCell.prototype.getMergedRows = function()
{
	return this.m_mergedRows;
};
oFF.SacTableCell.prototype.setMergedColumns = function(mergedColumns)
{
	this.m_mergedColumns = mergedColumns;
	this.getParentRow().getParentTable().adaptMergedCells(this);
};
oFF.SacTableCell.prototype.setMergedRows = function(mergedRows)
{
	this.m_mergedRows = mergedRows;
	this.getParentRow().getParentTable().adaptMergedCells(this);
};
oFF.SacTableCell.prototype.setMergedColumnsInternal = function(mergedColumns)
{
	this.m_mergedColumns = mergedColumns;
};
oFF.SacTableCell.prototype.setMergedRowsInternal = function(mergedRows)
{
	this.m_mergedRows = mergedRows;
};
oFF.SacTableCell.prototype.addNewExceptionInformation = function()
{
	var exceptionInfo = oFF.SacExceptionInfo.create();
	this.m_exceptionInformations.add(exceptionInfo);
	return exceptionInfo;
};
oFF.SacTableCell.prototype.getExceptionInformations = function()
{
	return this.m_exceptionInformations;
};
oFF.SacTableCell.prototype.clearExceptionInformations = function()
{
	this.m_exceptionInformations.clear();
};
oFF.SacTableCell.prototype.isWrap = function()
{
	return this.m_wrap;
};
oFF.SacTableCell.prototype.setWrap = function(wrap)
{
	this.m_wrap = wrap;
};

oFF.SacTableColumn = function() {};
oFF.SacTableColumn.prototype = new oFF.SacTableAxis();
oFF.SacTableColumn.prototype._ff_c = "SacTableColumn";

oFF.SacTableColumn._create = function(sacTable)
{
	var instance = new oFF.SacTableColumn();
	instance.setupInternal(sacTable);
	return instance;
};
oFF.SacTableColumn.prototype.m_width = 0;
oFF.SacTableColumn.prototype.m_defaultWidth = 0;
oFF.SacTableColumn.prototype.m_defaultEmWith = 0;
oFF.SacTableColumn.prototype.setupInternal = function(sacTable)
{
	oFF.SacTableAxis.prototype.setupInternal.call( this , sacTable);
	this.setupTableStyleWithPriority(7);
};
oFF.SacTableColumn.prototype.releaseObject = function()
{
	this.m_width = 0;
	this.m_defaultWidth = 0;
	oFF.SacTableAxis.prototype.releaseObject.call( this );
};
oFF.SacTableColumn.prototype.setWidth = function(width)
{
	this.m_width = width;
};
oFF.SacTableColumn.prototype.getWidth = function()
{
	return this.m_width > 0 ? this.m_width : this.m_defaultWidth;
};
oFF.SacTableColumn.prototype.setDefaultWidth = function(width)
{
	this.m_defaultWidth = width;
};
oFF.SacTableColumn.prototype.setDefaultEmWidth = function(width)
{
	this.m_defaultEmWith = width;
};
oFF.SacTableColumn.prototype.isWidthOverwritten = function()
{
	return this.m_width > 0;
};
oFF.SacTableColumn.prototype.getDefaultEmWidth = function()
{
	return this.m_defaultEmWith;
};
oFF.SacTableColumn.prototype.getHeaderIndex = function()
{
	return this.getParentTable().getHeaderColumnList().getIndex(this);
};
oFF.SacTableColumn.prototype.getHeadersSize = function()
{
	return this.getParentTable().getHeaderColumnList().size();
};
oFF.SacTableColumn.prototype.getDataIndex = function()
{
	return this.getParentTable().getColumnList().getIndex(this);
};
oFF.SacTableColumn.prototype.getDataSize = function()
{
	return this.getParentTable().getDataColumnsAmount();
};
oFF.SacTableColumn.prototype.isEffectivelyHidden = function()
{
	return oFF.XStream.of(this.getParentTable().getHiddenColumns()).anyMatch( function(hr){
		return this.matchesSacTableSectionInfo(hr);
	}.bind(this));
};
oFF.SacTableColumn.prototype.getHeaderSiblingAt = function(index)
{
	return this.getParentTable().getHeaderColumnList().get(index);
};
oFF.SacTableColumn.prototype.getDataSiblingAt = function(index)
{
	return this.getParentTable().getColumnList().get(index);
};

oFF.SacTableRow = function() {};
oFF.SacTableRow.prototype = new oFF.SacTableAxis();
oFF.SacTableRow.prototype._ff_c = "SacTableRow";

oFF.SacTableRow._create = function(sacTable)
{
	var instance = new oFF.SacTableRow();
	instance.setupInternal(sacTable);
	return instance;
};
oFF.SacTableRow.prototype.m_cells = null;
oFF.SacTableRow.prototype.m_fixed = false;
oFF.SacTableRow.prototype.m_height = 0;
oFF.SacTableRow.prototype.m_defaultHeight = 0;
oFF.SacTableRow.prototype.m_changedOnTheFlyUnresponsive = false;
oFF.SacTableRow.prototype.setupInternal = function(sacTable)
{
	oFF.SacTableAxis.prototype.setupInternal.call( this , sacTable);
	this.m_cells = oFF.XList.create();
	this.setDefaultHeight(oFF.SacTableConstants.DF_R_N_HEIGHT);
	this.setupTableStyleWithPriority(4);
};
oFF.SacTableRow.prototype.releaseObject = function()
{
	this.m_cells = oFF.XCollectionUtils.releaseEntriesAndCollectionIfNotNull(this.m_cells);
	this.m_height = 0;
	this.m_fixed = false;
	this.m_changedOnTheFlyUnresponsive = false;
	oFF.SacTableAxis.prototype.releaseObject.call( this );
};
oFF.SacTableRow.prototype.setHeight = function(height)
{
	var oldHeight = this.getHeight();
	if (oldHeight !== height)
	{
		this.getParentTable().notifyHeightOffset(height - oldHeight);
		this.m_height = height;
	}
};
oFF.SacTableRow.prototype.getHeight = function()
{
	return this.m_height > 0 ? this.m_height : this.m_defaultHeight;
};
oFF.SacTableRow.prototype.setFixed = function(fixed)
{
	if (fixed !== this.m_fixed)
	{
		this.m_fixed = fixed;
	}
};
oFF.SacTableRow.prototype.isFixed = function()
{
	return this.m_fixed;
};
oFF.SacTableRow.prototype.setChangedOnTheFlyUnresponsive = function(changedOnTheFlyUnresponsive)
{
	if (changedOnTheFlyUnresponsive !== this.m_changedOnTheFlyUnresponsive)
	{
		this.m_changedOnTheFlyUnresponsive = changedOnTheFlyUnresponsive;
	}
};
oFF.SacTableRow.prototype.isChangedOnTheFlyUnresponsive = function()
{
	return this.m_changedOnTheFlyUnresponsive;
};
oFF.SacTableRow.prototype.getCells = function()
{
	return this.m_cells;
};
oFF.SacTableRow.prototype.addNewCell = function()
{
	var newCell = oFF.SacTableCell._create(this, this.getReferenceColumn(this.m_cells.size()));
	this.addCell(newCell);
	return newCell;
};
oFF.SacTableRow.prototype.insertNewCellAtWithColumn = function(index, column, overwriteAtPosition)
{
	var newCell = oFF.SacTableCell._create(this, column);
	this.insertCellAt(index, newCell);
	return newCell;
};
oFF.SacTableRow.prototype.removeCellAt = function(index)
{
	this.m_cells.removeAt(index);
};
oFF.SacTableRow.prototype.setDefaultHeight = function(defaultHeight)
{
	var oldHeight = this.getHeight();
	if (this.m_height <= 0 && oldHeight !== defaultHeight)
	{
		this.getParentTable().notifyHeightOffset(defaultHeight - oldHeight);
		this.m_defaultHeight = defaultHeight;
	}
};
oFF.SacTableRow.prototype.addCell = function(newCell)
{
	this.m_cells.add(newCell);
};
oFF.SacTableRow.prototype.setCellAt = function(index, newCell)
{
	this.m_cells.set(index, newCell);
};
oFF.SacTableRow.prototype.insertCellAt = function(index, newCell)
{
	this.m_cells.insert(index, newCell);
};
oFF.SacTableRow.prototype.getReferenceColumn = function(newIndex)
{
	var parentTable = this.getParentTable();
	var hcl = parentTable.getHeaderColumnList();
	var dcl = parentTable.getColumnList();
	var headerSize = hcl.size();
	var dataSize = dcl.size();
	var referenceColumn;
	if (newIndex < headerSize)
	{
		referenceColumn = hcl.get(newIndex);
	}
	else if (newIndex < headerSize + dataSize)
	{
		referenceColumn = dcl.get(newIndex - headerSize);
	}
	else
	{
		referenceColumn = parentTable.createNewDataColumn();
	}
	return referenceColumn;
};
oFF.SacTableRow.prototype.isEffectivelyHidden = function()
{
	return oFF.XStream.of(this.getParentTable().getHiddenRows()).anyMatch( function(hr){
		return this.matchesSacTableSectionInfo(hr);
	}.bind(this));
};
oFF.SacTableRow.prototype.getHeaderIndex = function()
{
	return this.getParentTable().getHeaderRowList().getIndex(this);
};
oFF.SacTableRow.prototype.getHeadersSize = function()
{
	return this.getParentTable().getHeaderRowList().size();
};
oFF.SacTableRow.prototype.getDataIndex = function()
{
	return this.getParentTable().getRowList().getIndex(this);
};
oFF.SacTableRow.prototype.getDataSize = function()
{
	return this.getParentTable().getDataRowAmount();
};
oFF.SacTableRow.prototype.getHeaderSiblingAt = function(index)
{
	return this.getParentTable().getHeaderRowList().get(index);
};
oFF.SacTableRow.prototype.getDataSiblingAt = function(index)
{
	return this.getParentTable().getRowList().get(index);
};

oFF.VisualizationImplModule = function() {};
oFF.VisualizationImplModule.prototype = new oFF.DfModule();
oFF.VisualizationImplModule.prototype._ff_c = "VisualizationImplModule";

oFF.VisualizationImplModule.s_module = null;
oFF.VisualizationImplModule.getInstance = function()
{
	if (oFF.isNull(oFF.VisualizationImplModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.VisualizationInternalModule.getInstance());
		oFF.VisualizationImplModule.s_module = oFF.DfModule.startExt(new oFF.VisualizationImplModule());
		oFF.SacTableFactory.setInstance(oFF.SacTableFactoryImpl.create());
		oFF.DfModule.stopExt(oFF.VisualizationImplModule.s_module);
	}
	return oFF.VisualizationImplModule.s_module;
};
oFF.VisualizationImplModule.prototype.getName = function()
{
	return "ff2650.visualization.impl";
};

oFF.VisualizationImplModule.getInstance();

return sap.firefly;
	} );