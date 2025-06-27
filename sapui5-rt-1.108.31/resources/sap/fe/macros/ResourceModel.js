/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core","sap/ui/model/resource/ResourceModel"],function(e,r){"use strict";var t=new r({bundleName:"sap.fe.macros.messagebundle",async:true}),n=e.getLibraryResourceBundle("sap.fe.macros");var u;var a={getModel:function(){return t},getText:function(e,r,t){var a=e;var c;if(u){if(t){a="".concat(e,"|").concat(t)}c=u.getText(a,r,true);return c?c:n.getText(e,r)}return n.getText(e,r)},setApplicationI18nBundle:function(e){u=e}};return a},false);
//# sourceMappingURL=ResourceModel.js.map