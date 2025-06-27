/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport","sap/ui/core/Core","sap/ui/model/odata/type/String","sap/ui/model/ValidateException"],function(t,e,r,o){"use strict";var a,p;var n=t.defineUI5Class;function i(t,e){t.prototype=Object.create(e.prototype);t.prototype.constructor=t;s(t,e)}function s(t,e){s=Object.setPrototypeOf?Object.setPrototypeOf.bind():function t(e,r){e.__proto__=r;return e};return s(t,e)}var u=/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/;var c=(a=n("sap.fe.core.type.Email"),a(p=function(t){i(r,t);function r(){return t.apply(this,arguments)||this}var a=r.prototype;a.validateValue=function r(a){if(!u.test(a)){throw new o(e.getLibraryResourceBundle("sap.fe.core").getText("T_EMAILTYPE_INVALID_VALUE"))}t.prototype.validateValue.call(this,a)};return r}(r))||p);return c},false);
//# sourceMappingURL=Email.js.map