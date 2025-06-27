/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/format/DateFormat"],function(e){"use strict";var t={getExcelDatefromJSDate:function(){var t=e.getDateInstance().oFormatOptions.pattern.toLowerCase();if(t){var a=/^[^y]*y[^y]*$/m;if(a.exec(t)){t=t.replace("y","yyyy")}}return t},getExcelDateTimefromJSDateTime:function(){var t=e.getDateTimeInstance().oFormatOptions.pattern.toLowerCase();if(t){var a=/^[^y]*y[^y]*$/m;if(a.exec(t)){t=t.replace("y","yyyy")}if(t.includes("a")){t=t.replace("a","AM/PM")}}return t},getExcelTimefromJSTime:function(){var t=e.getTimeInstance().oFormatOptions.pattern;if(t&&t.includes("a")){t=t.replace("a","AM/PM")}return t}};return t},false);
//# sourceMappingURL=ExcelFormatHelper.js.map