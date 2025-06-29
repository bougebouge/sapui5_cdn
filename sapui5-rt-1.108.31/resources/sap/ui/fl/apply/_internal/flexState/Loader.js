/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/apply/_internal/flexState/ManifestUtils","sap/ui/fl/initial/_internal/Storage","sap/ui/fl/Utils"],function(e,n,t){"use strict";function a(e){if(typeof e==="string"){e={id:e}}e.idIsLocal=true;return e}function r(e,n){if(e){[n.changes,n.variantChanges,n.variantDependentControlChanges,n.variantManagementChanges].forEach(function(e){e.forEach(function(e){if(!e.selector.idIsLocal){e.selector=a(e.selector);if(e.dependentSelector){Object.keys(e.dependentSelector).forEach(function(n){if(Array.isArray(e.dependentSelector[n])){e.dependentSelector[n]=e.dependentSelector[n].map(a)}else{e.dependentSelector[n]=a(e.dependentSelector[n])}})}}})})}return n}function i(n){return n&&!!e.getOvpEntry(n)}function o(e){return{changes:e,cacheKey:e.cacheKey}}return{loadFlexData:function(a){var c=e.getBaseComponentNameFromManifest(a.manifest);if(a.partialFlexData){return n.completeFlexData({reference:a.reference,componentName:c,partialFlexData:a.partialFlexData}).then(o)}var s=a.reInitialize?undefined:e.getCacheKeyFromAsyncHints(a.reference,a.asyncHints);return n.loadFlexData({preview:e.getPreviewSectionFromAsyncHints(a.asyncHints),reference:a.reference,componentName:c,cacheKey:s,siteId:t.getSiteIdByComponentData(a.componentData),appDescriptor:a.manifest.getRawJson?a.manifest.getRawJson():a.manifest,version:a.version,allContexts:a.allContexts}).then(r.bind(undefined,i(a.manifest))).then(o)}}});
//# sourceMappingURL=Loader.js.map