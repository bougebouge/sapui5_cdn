/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";var t={onBeforeContextUpdate:function(t,e){var n=this.getView(),i=n&&n.getBindingContext(),o=t&&t.getCurrentContexts(),r=o[e];if(r&&i&&r.getPath()!==i.getPath()){return true}},onContextUpdate:function(t){this.base._routing.navigateToContext(t,{callExtension:true})}};return t},false);
//# sourceMappingURL=Paginator.js.map