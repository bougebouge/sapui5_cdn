/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/MacroMetadata"],function(e){"use strict";var t=e.extend("sap.fe.macros.fpm.CustomSection",{name:"CustomSection",namespace:"sap.fe.macros.fpm",fragment:"sap.fe.macros.fpm.CustomSection",metadata:{properties:{contextPath:{type:"sap.ui.model.Context",required:true},id:{type:"string",required:true},fragmentName:{type:"string",required:true},fragmentType:{type:"string",required:true}},events:{}},create:function(e){e.fragmentInstanceName=e.fragmentName+"-JS".replace(/\//g,".");return e}});return t},false);
//# sourceMappingURL=CustomSection.metadata.js.map