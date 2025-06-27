/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/mdc/field/MultiValueFieldDelegate"],function(t){"use strict";var e=Object.assign({},t,{_transformConditions:function(t,e,a){var i=[];for(var n=0;n<t.length;n++){var r={};var s=t[n];r[e]=s.values[0];if(a){r[a]=s.values[1]}i.push(r)}return i},updateItems:function(t,e,a){var i=a.getBinding("items");var n=a.getBindingInfo("items");var r=n.path;var s=n.template;var o=s.getBindingInfo("key");var v=o&&o.parts[0].path;var u=s.getBindingInfo("description");var d=u&&u.parts[0].path;var f=i.getModel();f.setProperty(r,this._transformConditions(e,v,d))}});return e},false);
//# sourceMappingURL=MultiValueParameterDelegate.js.map