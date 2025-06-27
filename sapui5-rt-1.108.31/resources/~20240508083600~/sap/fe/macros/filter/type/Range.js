/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport","sap/fe/macros/filter/type/Value"],function(t,r){"use strict";var e,o;var n={};var a=t.defineUI5Class;function u(t,r){t.prototype=Object.create(r.prototype);t.prototype.constructor=t;i(t,r)}function i(t,r){i=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(r,e){r.__proto__=e;return r};return i(t,r)}var p=(e=a("sap.fe.macros.filter.type.Range"),e(o=function(t){u(r,t);function r(){return t.apply(this,arguments)||this}n=r;var e=r.prototype;e.getDefaultOperatorName=function t(){return"BT"};e.formatConditionValues=function t(r){return r};e.formatValue=function r(e,o){var n=t.prototype.formatValue.call(this,e,o);if(!n){var a=this.oFormatOptions.min||Number.MIN_SAFE_INTEGER,u=this.oFormatOptions.max||Number.MAX_SAFE_INTEGER;n=[a,u]}return n};return r}(r))||o);n=p;return n},false);
//# sourceMappingURL=Range.js.map