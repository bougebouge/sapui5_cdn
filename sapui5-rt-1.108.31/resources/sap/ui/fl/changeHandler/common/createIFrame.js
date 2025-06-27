/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/fl/util/IFrame"],function(){"use strict";return function(e,t,i){var a=t.modifier;var n=e.getContent();var r=t.view;var s=t.appComponent;var u={_settings:{}};["url","width","height"].forEach(function(e){var t=n[e];u[e]=t;u._settings[e]=t});u.useLegacyNavigation=!!n.useLegacyNavigation;u._settings.useLegacyNavigation=!!n.useLegacyNavigation;return Promise.resolve().then(function(){return a.createControl("sap.ui.fl.util.IFrame",s,r,i,u,false)})}});
//# sourceMappingURL=createIFrame.js.map