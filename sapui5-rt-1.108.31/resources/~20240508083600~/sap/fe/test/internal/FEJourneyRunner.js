/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/fe/test/JourneyRunner","sap/fe/test/Utils","./FEArrangements","sap/base/Log"],function(e,n,a){"use strict";var r=e.extend("sap.fe.test.internal.FEJourneyRunner",{constructor:function(n){var a={launchUrl:"test-resources/sap/fe/templates/internal/demokit/flpSandbox.html",launchParameters:{"sap-ui-xx-filterQueryPanel":true,"sap-ui-xx-csp-policy":"sap-target-level-3:ro"}};n=Object.assign(a,n);try{if(window.__karma__.config.ui5.config.usetenants){var r=window.__karma__.config.ui5.shardIndex;if(r!==undefined&&r!==null){n.launchParameters["sap-client"]=r}}}catch(e){delete n.launchParameters["sap-client"]}e.apply(this,[n])},getBaseArrangements:function(e){return new a(e)}});var t=new r({opaConfig:{frameWidth:1300,frameHeight:1024}});var i=new r({opaConfig:{frameWidth:1700,frameHeight:1024}});var s=new r({opaConfig:{frameWidth:1900,frameHeight:1440}});r.run=t.run.bind(t);r.runWide=i.run.bind(i);r.runFCL=s.run.bind(s);return r});
//# sourceMappingURL=FEJourneyRunner.js.map