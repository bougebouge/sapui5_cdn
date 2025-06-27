/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/formatters/TableFormatterTypes"],function(e){"use strict";var i={};var a=e.MessageType;function t(e){var i;switch(e){case"UI.CriticalityType/Negative":case"UI.CriticalityType/VeryNegative":i=a.Error;break;case"UI.CriticalityType/Critical":i=a.Warning;break;case"UI.CriticalityType/Positive":case"UI.CriticalityType/VeryPositive":i=a.Success;break;case"UI.CriticalityType/Information":i=a.Information;break;case"UI.CriticalityType/Neutral":default:i=a.None}return i}i.getMessageTypeFromCriticalityType=t;return i},false);
//# sourceMappingURL=Criticality.js.map