/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","sap/ui/test/matchers/matchers"],function(e,n){"use strict";var t={errorMessage:"string",timeout:"numeric",debugTimeout:"numeric",pollingInterval:"numeric",_stackDropCount:"numeric",asyncPolling:"bool"};var r=e.extend({error:"func",check:"func",success:"func"},t);var a=e.extend({visible:"bool",enabled:"bool",editable:"bool",viewNamespace:"string",viewName:"string",viewId:"string",fragmentId:"string",autoWait:"any"},t);var i=e.extend({_stack:"string",matchers:"any",actions:"any",id:"any",controlType:"any",searchOpenDialogs:"bool"},a,r);var s=e.extend({},i,c());var o=e.extend({sOriginalControlType:"string",interaction:"any"},i);function c(){return Object.keys(sap.ui.test.matchers).reduce(function(e,n){n=n.charAt(0).toLowerCase()+n.substr(1);e[n]="any";return e},{})}return{OPA_WAITFOR_CONFIG:t,OPA_WAITFOR:r,OPA5_WAITFOR_CONFIG:a,OPA5_WAITFOR:s,OPA5_WAITFOR_DECORATED:o}});
//# sourceMappingURL=_ValidationParameters.js.map