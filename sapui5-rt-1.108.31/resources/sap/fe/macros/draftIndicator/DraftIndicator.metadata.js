/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/MacroMetadata"],function(e){"use strict";var t=e.extend("sap.fe.macros.DraftIndicator",{name:"DraftIndicator",namespace:"sap.fe.macros",fragment:"sap.fe.macros.draftIndicator.DraftIndicator",metadata:{stereotype:"xmlmacro",properties:{id:{type:"string"},ariaLabelledBy:{type:"string"},DraftIndicatorType:{type:"sap.ui.mdc.DraftIndicatorType",required:true,defaultValue:"IconAndText"},entitySet:{type:"sap.ui.model.Context",required:true,$kind:["EntitySet","NavigationProperty"]},isDraftIndicatorVisible:{type:"boolean",required:true,defaultValue:false},indicatorType:{type:"string"},class:{type:"string"}}}});return t},false);
//# sourceMappingURL=DraftIndicator.metadata.js.map