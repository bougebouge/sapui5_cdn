/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/base/BindingParser"],function(r){"use strict";var s={};function e(r,s){if(!r){return null}var t=s.split("/");if(t.length===1){return r[s]}else{return e(r[t[0]],t.splice(1).join("/"))}}function t(s,a){if(s.indexOf("[")!==-1){var i=s.indexOf("[");var n=s.substr(0,i);var u=s.substr(i+1);var f=u.indexOf("]");var l=a.getObject(n);var p=r.parseExpression(u.substr(0,f));if(Array.isArray(l)&&p&&p.result&&p.result.parts&&p.result.parts[0]&&p.result.parts[0].path){var v;var o=false;for(v=0;v<l.length&&!o;v++){var c=e(l[v],p.result.parts[0].path);var b=p.result.formatter(c);if(b){o=true}}if(o){s=t(n+(v-1)+u.substr(f+1),a)}}}return s}s.resolveDynamicExpression=t;return s},false);
//# sourceMappingURL=DynamicAnnotationPathHelper.js.map