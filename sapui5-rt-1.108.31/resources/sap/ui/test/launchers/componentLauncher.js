/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/core/ComponentContainer","sap/base/util/uid","sap/ui/thirdparty/jquery","sap/ui/core/Component"],function(e,t,n,a){"use strict";var o=false,r=null,s=null;return{start:function(i){if(o){throw new Error("sap.ui.test.launchers.componentLauncher: Start was called twice without teardown. Only one component can be started at a time.")}var u=a.create(i);o=true;return u.then(function(a){var o=t();s=n('<div id="'+o+'" class="sapUiOpaComponent"></div>');n("body").append(s).addClass("sapUiOpaBodyComponent");r=new e({component:a,height:"100%",width:"100%"});r.placeAt(o)})},hasLaunched:function(){return o},teardown:function(){if(!o){throw new Error("sap.ui.test.launchers.componentLauncher: Teardown was called before start. No component was started.")}r.destroy();s.remove();o=false;n("body").removeClass("sapUiOpaBodyComponent")}}},true);
//# sourceMappingURL=componentLauncher.js.map