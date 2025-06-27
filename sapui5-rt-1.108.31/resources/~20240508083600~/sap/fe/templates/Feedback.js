/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core"],function(a){"use strict";var e={};var r;(function(a){a["action"]="actions";a["standardAction"]="standardActions"})(r||(r={}));e.TriggerType=r;var i;(function(a){a["save"]="save"})(i||(i={}));e.StandardActions=i;var n="sap.feedback";var t="inapp.feature";function o(e,r,i){var o={areaId:e,triggerName:r,payload:i};a.getEventBus().publish(n,t,o)}e.triggerSurvey=o;function d(a,e,r){var i,n,t;var d=(i=a.getViewData())===null||i===void 0?void 0:(n=i.content)===null||n===void 0?void 0:n.feedback;var v=d===null||d===void 0?void 0:(t=d[r])===null||t===void 0?void 0:t[e];if(v){o(v.areaId,v.triggerName,v.payload)}}e.triggerConfiguredSurvey=d;return e},false);
//# sourceMappingURL=Feedback.js.map