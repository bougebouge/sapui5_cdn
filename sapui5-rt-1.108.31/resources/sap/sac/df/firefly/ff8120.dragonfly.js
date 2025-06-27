/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
sap.ui.define(["sap/sac/df/firefly/ff2210.ui.native","sap/sac/df/firefly/ff4330.olap.catalog.impl","sap/sac/df/firefly/ff4340.olap.reference","sap/sac/df/firefly/ff4410.olap.ip.providers","sap/sac/df/firefly/ff8090.poseidon"],function(e){"use strict";e.DragonflyModule=function(){};e.DragonflyModule.prototype=new e.DfModule;e.DragonflyModule.prototype._ff_c="DragonflyModule";e.DragonflyModule.s_module=null;e.DragonflyModule.getInstance=function(){if(e.isNull(e.DragonflyModule.s_module)){e.DfModule.checkInitialized(e.ProviderModule.getInstance());e.DfModule.checkInitialized(e.OlapReferenceModule.getInstance());e.DfModule.checkInitialized(e.OlapCatalogImplModule.getInstance());e.DragonflyModule.s_module=e.DfModule.startExt(new e.DragonflyModule);e.DfModule.stopExt(e.DragonflyModule.s_module)}return e.DragonflyModule.s_module};e.DragonflyModule.prototype.getName=function(){return"ff8120.dragonfly"};e.DragonflyModule.getInstance();return sap.firefly});
//# sourceMappingURL=ff8120.dragonfly.js.map