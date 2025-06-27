/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/macros/DelegateUtil","sap/fe/macros/table/delegates/TableDelegate"],function(e,t){"use strict";var r=Object.assign({},t);r.fetchPropertyExtensions=function(e){var t=this._getAggregatedPropertyMap(e);return Promise.resolve(t||{})};r.fetchPropertiesForBinding=function(t){var r=this;return e.fetchModel(t).then(function(n){if(!n){return[]}return r._getCachedOrFetchPropertiesForEntity(t,e.getCustomData(t,"entityType"),n.getMetaModel(),undefined,true)})};return r},false);
//# sourceMappingURL=AnalyticalTableDelegate.js.map