/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/webc/common/WebComponent","./library","./thirdparty/Panel"],function(e,a){"use strict";var t=a.PanelAccessibleRole;var l=a.TitleLevel;var i=e.extend("sap.ui.webc.main.Panel",{metadata:{library:"sap.ui.webc.main",tag:"ui5-panel-ui5",properties:{accessibleName:{type:"string",defaultValue:""},accessibleRole:{type:"sap.ui.webc.main.PanelAccessibleRole",defaultValue:t.Form},collapsed:{type:"boolean",defaultValue:false},fixed:{type:"boolean",defaultValue:false},headerLevel:{type:"sap.ui.webc.main.TitleLevel",defaultValue:l.H2},headerText:{type:"string",defaultValue:""},height:{type:"sap.ui.core.CSSSize",mapping:"style"},noAnimation:{type:"boolean",defaultValue:false},width:{type:"sap.ui.core.CSSSize",mapping:"style"}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true},header:{type:"sap.ui.core.Control",multiple:true,slot:"header"}},events:{toggle:{parameters:{}}},designtime:"sap/ui/webc/main/designtime/Panel.designtime"}});return i});
//# sourceMappingURL=Panel.js.map