// Copyright (c) 2009-2022 SAP SE, All Rights Reserved
sap.ui.define([
    "sap/base/util/UriParameters",
    "sap/base/Log",
    "./boottask",
    "sap/ushell_abap/pbServices/ui2/contracts/bag",
    "sap/ushell_abap/pbServices/ui2/contracts/configuration",
    "sap/ushell_abap/pbServices/ui2/contracts/configurationUi",
    "sap/ushell_abap/pbServices/ui2/contracts/fullscreen",
    "sap/ushell_abap/pbServices/ui2/contracts/preview",
    "sap/ushell_abap/pbServices/ui2/contracts/visible",
    "sap/ushell_abap/pbServices/ui2/contracts/refresh",
    "sap/ushell_abap/pbServices/ui2/contracts/search",
    "sap/ushell_abap/pbServices/ui2/contracts/url",
    "sap/ushell_abap/pbServices/ui2/contracts/actions",
    "sap/ushell_abap/pbServices/ui2/contracts/types"
], function (
    UriParameters,
    Log,
    Boottask
    /*
    ui2ContractsBag,
    ui2Configuration,
    ui2ConfigurationUi,
    ui2Fullscreen,
    ui2Preview,
    ui2Visible,
    ui2Refresh,
    ui2Search,
    ui2Url,
    ui2Actions,
    ui2Types
    */
) {
    "use strict";

    return function () {
        // check if framing control of ui5 should be active (meta tag set)
        var oFramingControl = window["sap-ushell-framing-control"],
            oUI5Configuration,
            sUi5FrameOptions;

        if (oFramingControl && oFramingControl.verifyUi5ProtectionActive) {
            oUI5Configuration = sap.ui.getCore().getConfiguration();
            sUi5FrameOptions = (typeof oUI5Configuration.getFrameOptions === "function") && oUI5Configuration.getFrameOptions();
            if (sUi5FrameOptions === "trusted" || sUi5FrameOptions === "deny") {
                // ui5 protection active, so we can unlock
                oFramingControl.unlock();
                Log.debug("UI5 framing protection active, unlocking FLP protection");
            } else {
                // ui5 protection not active although meta tag set; this is an illegal state that can only
                // happen if UI2 version is newer than UI5, but UI5 ABAP code is already active
                throw new Error("UI5 framing protection is NOT active, although sap.allowlistService meta tag set."
                    + " Ensure consistent deployment of UI5 and UI2 resources.");
            }
        }

        // check if this is a DSM terminate session (which comes from EP)
        var oUriParameters = UriParameters.fromQuery(window.location.search),
            terminationKey = oUriParameters.get("SAPSessionCmd") || oUriParameters.get("sap-sessioncmd");

        if (terminationKey === "USR_LOGOFF") {
            // DSM notification for user log off - call the Container logoff API
            sap.ushell.Container.logout();
            return;
        } else if (terminationKey === "USR_ABORT") {
            // DSM notification for user aborted
            return;
        }

        sap.ui.require(["sap/ushell/iconfonts"], function (IconFonts) {
            window.sap.ushell.Container.createRenderer("fiori2", true).then(
                function (oContent) {
                    oContent.placeAt("canvas", "only");
                }
            );
            IconFonts.registerFiori2IconFont();
        });

        Boottask.afterBootstrap();
    };
});
