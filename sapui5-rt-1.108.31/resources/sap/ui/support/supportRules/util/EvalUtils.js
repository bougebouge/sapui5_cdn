/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var bIsEvalAllowed;try{eval("");bIsEvalAllowed=true}catch(l){bIsEvalAllowed=false}return{isEvalAllowed:function(){return bIsEvalAllowed},evalFunction:function(sFunction){var fn;eval("fn = "+sFunction);return fn}}});
//# sourceMappingURL=EvalUtils.js.map