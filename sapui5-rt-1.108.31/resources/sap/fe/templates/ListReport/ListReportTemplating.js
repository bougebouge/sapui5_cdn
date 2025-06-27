/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/StableIdHelper"],function(e){"use strict";var a={};var t=e.generate;var n=function(e,a){if(e&&e.variantManagement==="Page"){return"fe::PageVariantManagement"}if(e&&e.variantManagement==="Control"){return t([a.filterBarId,"VariantManagement"])}return undefined};a.getVariantBackReference=n;var r=function(e){for(var a=0;a<e.length;a++){if(e[a].defaultPath){return e[a].defaultPath}}};a.getDefaultPath=r;return a},false);
//# sourceMappingURL=ListReportTemplating.js.map