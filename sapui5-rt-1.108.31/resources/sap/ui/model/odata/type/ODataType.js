/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/model/SimpleType"],function(t){"use strict";var e=t.extend("sap.ui.model.odata.type.ODataType",{constructor:function(t,e){},metadata:{abstract:true}});e.prototype.getPlaceholderText=function(){return this.getFormat&&this.getFormat().getPlaceholderText&&this.getFormat().getPlaceholderText()};e.prototype.setConstraints=function(t){};e.prototype.setFormatOptions=function(t){};return e});
//# sourceMappingURL=ODataType.js.map