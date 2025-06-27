//@ui5-bundle sap/ovp/designtime/library-preload.designtime.js
sap.ui.predefine("sap/ovp/ui/DashboardLayout.designtime", ["sap/ovp/ui/ComponentContainerDesigntimeMetadata","sap/ovp/app/resources"],function(a,e){"use strict";return{actions:{},aggregations:{content:{domRef:".sapUiComponentContainer",actions:{},propagateMetadata:function(e){var t=e.getMetadata().getName();if(t==="sap.ui.core.ComponentContainer"){return a}else{return{actions:"not-adaptable"}}},propagateRelevantContainer:false}},name:{singular:e&&e.getText("Card"),plural:e&&e.getText("Cards")}}},false);
/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ovp/ui/EasyScanLayout.designtime", ["sap/ovp/ui/ComponentContainerDesigntimeMetadata","sap/ovp/app/resources"],function(a,e){"use strict";return{actions:{},aggregations:{content:{domRef:".sapUiComponentContainer",actions:{},propagateMetadata:function(e){var t=e.getMetadata().getName();if(t==="sap.ui.core.ComponentContainer"){return a}else{return{actions:"not-adaptable"}}},propagateRelevantContainer:false}},name:{singular:e&&e.getText("Card"),plural:e&&e.getText("Cards")}}},false);
/*!
 * UI development toolkit for HTML5 (OpenUI5)
 * (c) Copyright 2009-2017 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ovp/ui/OVPWrapper.designtime", ["sap/ovp/app/resources","sap/ovp/cards/CommonUtils","sap/ovp/app/OVPUtils"],function(a,e,t){"use strict";return{default:{controllerExtensionTemplate:"sap/ovp/ui/OVPControllerExtensionTemplate",actions:{},tool:{start:function(){var a=e.getApp();a.bRTAActive=true},stop:function(){var a=e.getApp();a.bRTAActive=false}},aggregations:{DynamicPage:{propagateMetadata:function(a){var r=function(a){var e=a.hasStyleClass("sapUiSizeCompact")&&a.hasStyleClass("dropDrownCompact"),t=a.hasStyleClass("sapUiSizeCozy")&&a.hasStyleClass("sapOvpDropDownPadding")&&a.hasStyleClass("dropDrownCozy");return e||t};var s=a.getMetadata().getName();var o=e._getLayer();var n=s==="sap.m.FlexBox"&&a&&a.getId()&&a.getId().indexOf("kpiHBoxNumeric"),p=s==="sap.m.VBox"&&a&&a.getId()&&a.getId().indexOf("kpiHeader"),i=s==="sap.m.Toolbar"&&a&&a.getId()&&a.getId().indexOf("toolbar")&&r(a);if(n||p||i){return{actions:"not-adaptable"}}else if(s!=="sap.ovp.ui.EasyScanLayout"&&s!=="sap.ui.core.ComponentContainer"&&!(o&&(o===t.Layers.vendor||o===t.Layers.customer_base)&&s==="sap.ui.comp.smartfilterbar.SmartFilterBar")){return{actions:{remove:null,reveal:null}}}},propagateRelevantContainer:false}}},strict:{actions:{},name:{singular:a&&a.getText("Card"),plural:a&&a.getText("Cards")}}}},false);
//# sourceMappingURL=library-preload.designtime.js.map
