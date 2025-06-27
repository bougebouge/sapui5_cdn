/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["../../helpers/StableIdHelper"],function(e){"use strict";var r={};var t=e.getStableIdPartFromDataField;var n=function(){function e(){}r.KeyHelper=e;e.generateKeyFromDataField=function e(r){return t(r)};e.validateKey=function e(r){var t=/[^A-Za-z0-9_\-:]/;if(t.exec(r)){throw new Error("Invalid key: ".concat(r," - only 'A-Za-z0-9_-:' are allowed"))}};e.getSelectionFieldKeyFromPath=function e(r){return r.replace(/(\*|\+)?\//g,"::")};e.getPathFromSelectionFieldKey=function e(r){return r.replace(/::/g,"/")};return e}();r.KeyHelper=n;return r},false);
//# sourceMappingURL=Key.js.map