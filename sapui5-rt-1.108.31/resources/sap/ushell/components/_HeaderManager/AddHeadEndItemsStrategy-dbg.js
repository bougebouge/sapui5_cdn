// Copyright (c) 2009-2022 SAP SE, All Rights Reserved

sap.ui.define([
    "sap/base/Log",
    "sap/ui/core/Core"
], function (Log, Core) {
    "use strict";

    /* global Set */

    function fnValidateAddingHeadEndItems (aExistingIds, aIdsToAdd) {
        if (!aExistingIds || !aIdsToAdd) {
            return false;
        }

        // Check that the controls with the given ids exist
        var bFoundAllControls = aIdsToAdd.every(function (sId) {
            var bFoundControl = !!Core.byId(sId);
            if (!bFoundControl) {
                Log.warning("Failed to find control with id '{id}'".replace("{id}", sId));
            }
            return bFoundControl;
        });
        if (!bFoundAllControls) {
            return false;
        }

        // We always allow to create the overflow button
        if (aIdsToAdd.length === 1 && aIdsToAdd[0] === "endItemsOverflowBtn") {
            return true;
        }

        // we only consider new ids
        var aItemsCombined = Array.from(new Set(aExistingIds.concat(aIdsToAdd)));

        var iMaxLength = aItemsCombined.includes("endItemsOverflowBtn") ? 11 : 10;
        if (aItemsCombined.length > iMaxLength) {
            Log.warning("maximum of six items has reached, cannot add more items.");
            return false;
        }

        return true;
    }

    function fnAddHeadEndItems (aCurrentlyExistingItems, aIdsToAdd) {
        var aNewItems = Array.from(new Set(aCurrentlyExistingItems.concat(aIdsToAdd)));

        /*
            HeaderEndItems has the following order:
            - search
            - copilot
            - custom items
            - notification
            - overflow button (before me area)
            - MeArea
            - product switch
        */

        //negative number - left from the custom items
        //positive number - right from custom items
        //the custom items has index 0 and sort based on the id
        var oScale = {
            "sf": -3,
            "copilotBtn": -1,
            //0 custom items
            "NotificationsCountButton": 1,
            "endItemsOverflowBtn": 2,
            "meAreaHeaderButton": 3,
            "productSwitchBtn": 4
        };

        aNewItems.sort(function (a, b) {
            var iAScale = oScale[a] || 0,
                iBScale = oScale[b] || 0;
            if (iAScale === iBScale) {
                return a.localeCompare(b);
            }
            return iAScale - iBScale;
        });

        return aNewItems;
    }

    function execute (aCurrentValue, aValueToAdjust) {
        var aResult = aCurrentValue;

        if (fnValidateAddingHeadEndItems(aCurrentValue, aValueToAdjust)) {
            aResult = fnAddHeadEndItems(aCurrentValue, aValueToAdjust);
        }

        return aResult;
    }

    return {
        execute: execute
    };

});
