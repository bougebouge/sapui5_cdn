/*
 * ! SAP UI development toolkit for HTML5 (SAPUI5)
        (c) Copyright 2009-2021 SAP SE. All rights reserved
    
 */
sap.ui.define(["sap/ui/test/Opa5","sap/ui/test/OpaBuilder","sap/fe/test/builder/FEBuilder","sap/fe/test/Utils"],function(e,t,i,r){"use strict";return e.extend("sap.fe.test.BaseActions",{iClosePopover:function(){return i.createClosePopoverBuilder(this).description("Closing open popover").execute()},iPressEscape:function(){return i.create(this).has(i.Matchers.FOCUSED_ELEMENT).do(i.Actions.keyboardShortcut("Escape")).description("Pressing escape button").execute()},iWait:function(e){var t=false,s=true;return i.create(this).check(function(){if(s){s=false;setTimeout(function(){t=true},e)}return t}).description(r.formatMessage("Waiting for '{0}' milliseconds ",e)).execute()},iNavigateBack:function(){return t.create(this).viewId(null).do(function(){e.getWindow().history.back()}).description("Navigating back via browser back").execute()},iNavigateForward:function(){return t.create(this).viewId(null).do(function(){e.getWindow().history.forward()}).description("Navigating back via browser forward").execute()}})});
//# sourceMappingURL=BaseActions.js.map