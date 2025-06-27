/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap*/
sap.ui.define(
[
"sap/sac/df/firefly/ff2210.ui.native","sap/sac/df/firefly/ff4330.olap.catalog.impl","sap/sac/df/firefly/ff4340.olap.reference","sap/sac/df/firefly/ff4410.olap.ip.providers","sap/sac/df/firefly/ff8090.poseidon"
],
function(oFF)
{
"use strict";

oFF.DragonflyModule = function() {};
oFF.DragonflyModule.prototype = new oFF.DfModule();
oFF.DragonflyModule.prototype._ff_c = "DragonflyModule";

oFF.DragonflyModule.s_module = null;
oFF.DragonflyModule.getInstance = function()
{
	if (oFF.isNull(oFF.DragonflyModule.s_module))
	{
		oFF.DfModule.checkInitialized(oFF.ProviderModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.OlapReferenceModule.getInstance());
		oFF.DfModule.checkInitialized(oFF.OlapCatalogImplModule.getInstance());
		oFF.DragonflyModule.s_module = oFF.DfModule.startExt(new oFF.DragonflyModule());
		oFF.DfModule.stopExt(oFF.DragonflyModule.s_module);
	}
	return oFF.DragonflyModule.s_module;
};
oFF.DragonflyModule.prototype.getName = function()
{
	return "ff8120.dragonfly";
};

oFF.DragonflyModule.getInstance();

return sap.firefly;
	} );