/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/Object","sap/ui/test/_OpaLogger","sap/ui/test/_ParameterValidator","sap/ui/thirdparty/jquery"],function(t,e,i,n){"use strict";var a=t.extend("sap.ui.test.autowaiter.WaiterBase",{constructor:function(){this._mConfig=this._getDefaultConfig();this._sName=this.getMetadata().getName();this._oLogger=e.getLogger(this._sName);this._oHasPendingLogger=e.getLogger(this._sName+"#hasPending");this._oConfigValidator=new i({errorPrefix:this._sName+"#extendConfig"})},hasPending:function(){return false},isEnabled:function(){return this._mConfig.enabled},extendConfig:function(t){if(!n.isEmptyObject(t)){this._oConfigValidator.validate({inputToValidate:t,validationInfo:this._getValidationInfo()});n.extend(this._mConfig,t)}},_getDefaultConfig:function(){return{enabled:true}},_getValidationInfo:function(){return{enabled:"bool"}}});return a});
//# sourceMappingURL=WaiterBase.js.map