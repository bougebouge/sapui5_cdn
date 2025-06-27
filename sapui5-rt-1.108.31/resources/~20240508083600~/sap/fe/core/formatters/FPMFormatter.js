/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";var r=function(r,e,t){var n=this;var o=r.getController().getExtensionAPI();var i=e.split(".");var a=i.pop();var u=i.join("/");return new Promise(function(r){sap.ui.require([u],function(e){r(e[a].bind(o)(n.getBindingContext(),t||[]))})})};r.__functionName="sap.fe.core.formatters.FPMFormatter#customBooleanPropertyCheck";var e=function(r){if(e.hasOwnProperty(r)){for(var t=arguments.length,n=new Array(t>1?t-1:0),o=1;o<t;o++){n[o-1]=arguments[o]}return e[r].apply(this,n)}else{return""}};e.customBooleanPropertyCheck=r;return e},true);
//# sourceMappingURL=FPMFormatter.js.map