/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/BindingToolkit"],function(r){"use strict";var e={};var i=r.resolveBindingString;var a=r.not;var n=r.equal;var o=r.constant;var v=r.compileExpression;var l=r.and;var s=function(r){var e=i(r===null||r===void 0?void 0:r.header);var s=i(r===null||r===void 0?void 0:r.tabTitle);var t=o(r.headerVisible);return v(l(t,a(n(e,s))))};e.buildExpressionForHeaderVisible=s;return e},false);
//# sourceMappingURL=TableTemplating.js.map