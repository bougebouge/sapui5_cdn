//@ui5-bundle sap/ui/fl/designtime/library-preload.designtime.js
/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/fl/designtime/library.designtime", [],function(){"use strict";return{}});
/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/fl/designtime/util/IFrame.designtime", ["sap/ui/rta/plugin/iframe/AddIFrameDialog","sap/m/library"],function(e){"use strict";function t(t){var i=new e;var r=t.get_settings();var a;return e.buildUrlBuilderParametersFor(t).then(function(e){a={parameters:e,frameUrl:r.url,frameWidth:r.width,frameHeight:r.height,useLegacyNavigation:r.useLegacyNavigation,updateMode:true};return i.open(a)}).then(function(e){if(!e){return[]}var i=[];var a=false;var n={url:r.url,height:r.height,width:r.width};if(e.frameHeight+e.frameHeightUnit!==r.height){a=true;n.height=e.frameHeight+e.frameHeightUnit}if(e.frameWidth+e.frameWidthUnit!==r.width){a=true;n.width=e.frameWidth+e.frameWidthUnit}if(e.frameUrl!==r.url){a=true;n.url=e.frameUrl}if(e.useLegacyNavigation!==!!r.useLegacyNavigation){a=true;n.useLegacyNavigation=e.useLegacyNavigation}if(a){i.push({selectorControl:t,changeSpecificData:{changeType:"updateIFrame",content:n}})}return i})}return{actions:{settings:function(){return{icon:"sap-icon://write-new",name:"CTX_EDIT_IFRAME",isEnabled:true,handler:t}},remove:{changeType:"hideControl"},reveal:{changeType:"unhideControl"}}}});
/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.predefine("sap/ui/fl/designtime/variants/VariantManagement.designtime", ["sap/ui/fl/Utils"],function(e){"use strict";var t=function(t,r){var n=e.getAppComponentForControl(t);var o=t.getId();var a=n.getModel(e.VARIANT_MODEL_NAME);var i=n.getLocalId(o)||o;if(!a){return}if(r){a.waitForVMControlInit(i).then(function(){a.setModelPropertiesForControl(i,r,t);a.checkUpdate(true)})}else{a.setModelPropertiesForControl(i,r,t);a.checkUpdate(true)}};return{annotations:{},properties:{showSetAsDefault:{ignore:false},manualVariantKey:{ignore:true},inErrorState:{ignore:false},editable:{ignore:false},modelName:{ignore:false},updateVariantInURL:{ignore:true},resetOnContextChange:{ignore:true},executeOnSelectionForStandardDefault:{ignore:false},displayTextForExecuteOnSelectionForStandardVariant:{ignore:false},headerLevel:{ignore:false}},variantRenameDomRef:function(e){return e.getTitle().getDomRef("inner")},customData:{},tool:{start:function(e){var r=true;t(e,r)},stop:function(e){var r=false;t(e,r)}},actions:{controlVariant:function(t){var r=e.getAppComponentForControl(t);var n=t.getId();var o=r.getModel(e.VARIANT_MODEL_NAME);var a=r.getLocalId(n)||n;return{validators:["noEmptyText",{validatorFunction:function(e){var t=o._getVariantTitleCount(e,a)||0;return t===0},errorMessage:sap.ui.getCore().getLibraryResourceBundle("sap.ui.fl").getText("VARIANT_MANAGEMENT_ERROR_DUPLICATE")}]}}}}});
//# sourceMappingURL=library-preload.designtime.js.map
