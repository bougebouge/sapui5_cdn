/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils","sap/fe/macros/internal/valuehelp/ValueListHelper","sap/ui/mdc/odata/v4/FieldValueHelpDelegate"],function(e,t,r){"use strict";var n=Object.assign({},r);n.determineSearchSupported=function(e,r){return t.setValueListFilterFields(e.propertyPath,r,true,e.conditionModel)};n.contentRequest=function(e,r,n,a){return t.showValueListInfo(e.propertyPath,r,n,e.conditionModel,a)};n.adjustSearch=function(t,r,n){return e.normalizeSearchTerm(n)};return n},false);
//# sourceMappingURL=FieldValueHelpDelegate.js.map