/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([],function(){"use strict";var e={scrollTableToRow:function(e,t){var n=e.getRowBinding();var r=function(){if(e.data().tableType==="GridTable"){return n.getContexts(0)}else{return n.getCurrentContexts()}};var i=function(){var n=r().find(function(e){return e&&e.getPath()===t});if(n){e.scrollToIndex(n.getIndex())}};if(n){var a=r();if(a.length===0&&n.getLength()>0||a.some(function(e){return e===undefined})){n.attachEventOnce("dataReceived",i)}else{i()}}}};return e},false);
//# sourceMappingURL=TableScroller.js.map