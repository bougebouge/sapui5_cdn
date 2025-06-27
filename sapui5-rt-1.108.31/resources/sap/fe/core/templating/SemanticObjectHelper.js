/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";var n={};var t=function(n){var t=n===null||n===void 0?void 0:n.match(/{(.*?)}/);if(t!==null&&t!==void 0&&t.length&&t.length>1){return t[1]}return null};n.getDynamicPathFromSemanticObject=t;var r=function(n){var t;var r=(t=n.annotations)===null||t===void 0?void 0:t.Common;if(r){for(var a in r){var i;if(((i=r[a])===null||i===void 0?void 0:i.term)==="com.sap.vocabularies.Common.v1.SemanticObject"){return true}}}return false};n.hasSemanticObject=r;return n},false);
//# sourceMappingURL=SemanticObjectHelper.js.map