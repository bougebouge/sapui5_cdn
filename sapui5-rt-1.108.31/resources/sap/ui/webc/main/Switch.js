/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/webc/common/WebComponent","./library","sap/ui/core/EnabledPropagator","./thirdparty/Switch"],function(e,t,a){"use strict";var i=t.SwitchDesign;var r=e.extend("sap.ui.webc.main.Switch",{metadata:{library:"sap.ui.webc.main",tag:"ui5-switch-ui5",interfaces:["sap.ui.core.IFormContent"],properties:{accessibleName:{type:"string"},checked:{type:"boolean",defaultValue:false},design:{type:"sap.ui.webc.main.SwitchDesign",defaultValue:i.Textual},enabled:{type:"boolean",defaultValue:true,mapping:{type:"attribute",to:"disabled",formatter:"_mapEnabled"}},textOff:{type:"string",defaultValue:""},textOn:{type:"string",defaultValue:""},width:{type:"sap.ui.core.CSSSize",mapping:"style"}},associations:{ariaLabelledBy:{type:"sap.ui.core.Control",multiple:true,mapping:{type:"property",to:"accessibleNameRef",formatter:"_getAriaLabelledByForRendering"}}},events:{change:{parameters:{}}}}});a.call(r.prototype);return r});
//# sourceMappingURL=Switch.js.map