/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";var e={setCreationMode:function(e){var t=this.base.getView().getBindingContext("ui");t.getModel().setProperty("createMode",e,t,true);if(this.getProgrammingModel()==="Sticky"){t.getModel().setProperty("createModeSticky",this.getTransactionHelper()._bCreateMode,t,true)}}};return e},false);
//# sourceMappingURL=EditFlow.js.map