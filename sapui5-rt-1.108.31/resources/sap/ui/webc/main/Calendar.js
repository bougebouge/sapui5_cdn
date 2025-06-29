/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/webc/common/WebComponent","./library","sap/ui/core/library","./thirdparty/Calendar"],function(e,a,t){"use strict";var r=t.CalendarType;var n=a.CalendarSelectionMode;var l=e.extend("sap.ui.webc.main.Calendar",{metadata:{library:"sap.ui.webc.main",tag:"ui5-calendar-ui5",properties:{formatPattern:{type:"string",defaultValue:""},hideWeekNumbers:{type:"boolean",defaultValue:false},maxDate:{type:"string",defaultValue:""},minDate:{type:"string",defaultValue:""},primaryCalendarType:{type:"sap.ui.core.CalendarType"},secondaryCalendarType:{type:"sap.ui.core.CalendarType",defaultValue:r.undefined},selectionMode:{type:"sap.ui.webc.main.CalendarSelectionMode",defaultValue:n.Single}},defaultAggregation:"dates",aggregations:{dates:{type:"sap.ui.webc.main.ICalendarDate",multiple:true}},events:{selectedDatesChange:{allowPreventDefault:true,parameters:{values:{type:"Array"},dates:{type:"Array"}}}}}});return l});
//# sourceMappingURL=Calendar.js.map