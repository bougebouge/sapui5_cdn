sap.ui.define([
    "sap/fe/navigation/SelectionVariant",
    "sap/fe/navigation/PresentationVariant",
    "sap/ovp/cards/AnnotationHelper",
    "sap/ovp/cards/CommonUtils",
    "sap/ui/model/FilterOperator",
    "sap/ovp/cards/Integration/Helpers/Filters",
    "sap/base/util/merge",
    "sap/ui/thirdparty/jquery",
    "sap/fe/navigation/library"
], function (
    SelectionVariant,
    PresentationVariant,
    CardAnnotationHelper,
    CommonUtils,
    FilterOperator,
    Filterhelper,
    merge,
    jQuery,
    FENavigationLibrary
) {
    "use strict";
    var SuppressionBehavior = FENavigationLibrary.SuppressionBehavior;
    
    function getNavigationIntentFromAuthString(sAuthString) {
        if (sAuthString.startsWith("#")) {
            sAuthString = sAuthString.slice(1);
        }

        var aAuth = sAuthString.split("-");
        var sSemanticObject = aAuth[0] || "";
        var sAction = aAuth[1] ? aAuth[1].split("?")[0] : "";
        var oQueryMap = {};

        var sQueryParameters = aAuth[1] ? aAuth[1].split("?")[1] : undefined;
        if (sQueryParameters) {
            var aQueryParameters = sQueryParameters.split("&");
            for (var i = 0; i < aQueryParameters.length; i++) {
                var sQuery = aQueryParameters[i];
                var sParam = sQuery.split("=")[0];
                var sValue = sQuery.split("=")[1];
                oQueryMap[sParam] = sValue;
            }
        }
        return {
            semanticObject: sSemanticObject,
            action: sAction,
            parameters: oQueryMap
        };
    }

    function bCheckNavigationForCard(oController) {
        if (!oController) {
            return false;
        }

        var oEntityType = oController.getEntityType();
        var oCardPropertiesModel = oController.getCardPropertiesModel();

        if (oEntityType && oCardPropertiesModel) {
            var sIdentificationAnnotationPath = oCardPropertiesModel.getProperty("/identificationAnnotationPath");
            var aRecords = oEntityType[sIdentificationAnnotationPath];

            if (oController.isNavigationInAnnotation(aRecords)) {
                return true;
            }
        }

        var oCardPropertiesModel = oController.getCardPropertiesModel();
        var sCardType = oCardPropertiesModel && oCardPropertiesModel.getProperty("/template");
        var aLineItemSupportedCardTemplates = ["sap.ovp.cards.table", "sap.ovp.cards.list", "sap.ovp.cards.v4.table","sap.ovp.cards.v4.list"];
        if (aLineItemSupportedCardTemplates.indexOf(sCardType) > -1 && oController.checkLineItemNavigation()) {
            return true;
        }

        return false;
    }

    function getNavigationParameters(oController, oCardDefinition) {
        var aNavigationFields = oController.getEntityNavigationEntries() || [];
        var oNavigationField = aNavigationFields.length > 0 ? aNavigationFields[0] : {};

        if (oCardDefinition.cardComponentName === "List" || oCardDefinition.cardComponentName === "Table") {
            var oCardItemsBinding = oController.getCardItemsBinding(),
                oLineItemContexts = oCardItemsBinding && oCardItemsBinding.getAllCurrentContexts(),
                oCurrentContext = oLineItemContexts && oLineItemContexts[0],
                sLineItemAnnotationPath = oController.getCardPropertiesModel().getProperty("/annotationPath"),
                aLineItemNavigationFields = oController.getEntityNavigationEntries(oCurrentContext, sLineItemAnnotationPath),
                oLineItemNavigationField = aLineItemNavigationFields.length > 0 ? aLineItemNavigationFields[0] : {};

            var oNavigationContextLineItem = {};
            var oNavigationContext = {};

            if (oNavigationField && oNavigationField.type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
                oNavigationContext = _getNavigationWithUrlParamters(oController, oNavigationField);
            } else if (oNavigationField && oNavigationField.type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
                oNavigationContext = _getNavigationWithIntent(oController, oNavigationField);
            }

            if (oLineItemNavigationField && oLineItemNavigationField.type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
                oNavigationContextLineItem = _getNavigationWithUrlParamters(oController, oLineItemNavigationField);
            } else if (oLineItemNavigationField && oLineItemNavigationField.type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
                oNavigationContextLineItem = _getNavigationWithIntent(oController, oLineItemNavigationField);
            }

            if (oNavigationContextLineItem && oNavigationContextLineItem.semanticObject && oNavigationContextLineItem.action) {
                oNavigationContext["lineItemSemanticObject"] = oNavigationContextLineItem.semanticObject;
                oNavigationContext["lineItemAction"] = oNavigationContextLineItem.action;
            }
 
            return oNavigationContext;
        }

        if (oNavigationField && oNavigationField.type === "com.sap.vocabularies.UI.v1.DataFieldWithUrl") {
            return _getNavigationWithUrlParamters(oController, oNavigationField);
        }

        if (oNavigationField && oNavigationField.type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") {
            return _getNavigationWithIntent(oController, oNavigationField);
        }

        // TODO: KPI detail type
    }

    function _getNavigationWithUrlParamters(oController, oNavigationField) {
        if (!sap.ushell.Container) {
            return;
        }

        var oParsingSerivce = sap.ushell.Container.getService("URLParsing");
        if (!oParsingSerivce.isIntentUrl(oNavigationField.url)) {
            return {
                type: "url",
                url: oNavigationField.url
            };
        } else {
            var oNav = _getNavigationWithIntent(oController, oNavigationField);
            if (oNav.semanticObject) {
                return oNav;
            } else {
                var oParsedShellHash = oParsingSerivce.parseShellHash(oNavigationField.url);
                //Url can also contain an intent based navigation with route, route can be static or dynamic with paramters
                //Url navigation without app specific route will trigger storing of appstate
               // var bWithRoute = oParsedShellHash.appSpecificRoute ? true : false;
               return _getNavigationWithIntent(oController, oParsedShellHash);
            }
        }
    }

    function getStaticParams(oController) {
        var oCardPropertiesModel = oController.getCardPropertiesModel(),
            sCustomParams = oCardPropertiesModel.getProperty("/customParams"),
            oContext = oController.getView().getBindingContext(),
            oEntity = oContext ? oContext.getObject() : null,
            oCustomParameters;
        if (oContext && typeof oContext.getAllData === "function" && sCustomParams) {
            //This is for custom navigation of analytical card to pass data apart from bound dimensions
            oCustomParameters = oContext.getAllData();
        }
        var oAllData = _getEntityNavigationParameters(oEntity, oCustomParameters, oContext, oController);
        var oNavSelectionVariant = oAllData && oAllData["navSelectionVariant"];
        if (oNavSelectionVariant && !CommonUtils.isJSONData(oNavSelectionVariant)) {
            oAllData["navSelectionVariant"] = Filterhelper.removeExtraInfoVariant(oNavSelectionVariant);
        }
        var oPresentationVariant = oAllData && oAllData["sNavPresentationVariant"];
        if (oPresentationVariant && !CommonUtils.isJSONData(oPresentationVariant)) {
            oAllData["sNavPresentationVariant"] = Filterhelper.removeExtraInfoVariant(oPresentationVariant);
        }
        return oAllData;
    }

    function _getSensitivePropertiesEntityType (oEntityType) {
        var aSensitiveProps = [];
        for (var i = 0; i < oEntityType.property.length; i++) {
            if (oEntityType.property[i]["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] &&
                oEntityType.property[i]["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"].Bool) {
                aSensitiveProps.push(oEntityType.property[i].name);
            }
        }
        return aSensitiveProps;
    }

    function _buildSelectionVariant(oCardSelections, oController) {
        var sSelectionVariant = "{}";
        var oSelectionVariant = new SelectionVariant(sSelectionVariant);
        var oFilter, sValue1, sValue2, oParameter;

        var mFilterPreference = oController._getFilterPreference();

        var aCardFilters = oCardSelections.filters;
        var aCardParameters = oCardSelections.parameters;

        // Add card filters to selection variant
        for (var i = 0; i < aCardFilters.length; i++) {
            oFilter = aCardFilters[i];
            //value1 might be typeof number, hence we check not typeof undefined
            if (oFilter.path && oFilter.operator && typeof oFilter.value1 !== "undefined") {
                //value2 is optional, hence we check it separately
                sValue1 = oFilter.value1.toString();
                sValue2 =
                    typeof oFilter.value2 !== "undefined"
                        ? oFilter.value2.toString()
                        : undefined;
                if (oController._checkIfCardFiltersAreValid(mFilterPreference, oFilter.path)) {
                    oSelectionVariant.addSelectOption(
                        oFilter.path,
                        oFilter.sign,
                        oFilter.operator,
                        sValue1,
                        sValue2
                    );
                }
            }
        }
        // Add card parameters to selection variant
        var sName, sNameWithPrefix, sNameWithoutPrefix;
        for (var j = 0; j < aCardParameters.length; j++) {
            oParameter = aCardParameters[j];
            //If parameter name or value is missing, then ignore
            if (!oParameter.path || !oParameter.value) {
                continue;
            }
            sName = oParameter.path.split("/").pop();
            sName = sName.split(".").pop();
            //P_ParameterName and ParameterName should be treated as same
            if (sName.indexOf("P_") === 0) {
                sNameWithPrefix = sName;
                sNameWithoutPrefix = sName.substr(2); // remove P_ prefix
            } else {
                sNameWithPrefix = "P_" + sName;
                sNameWithoutPrefix = sName;
            }
            //If parameter already part of selection variant, this means same parameter came from global
            //filter and we should not send card parameter again, because parameter will always contain
            //single value, multiple parameter values will confuse target application
            if (oSelectionVariant.getParameter(sNameWithPrefix)) {
                continue;
            }
            if (oSelectionVariant.getParameter(sNameWithoutPrefix)) {
                continue;
            }
            oSelectionVariant.addParameter(sName, oParameter.value);
        }
        return oSelectionVariant;
    }

    function getStaticValuesAndNavSelectionVariant(oNavSelectionVariant, aSensitiveProps) {
        var oResult = {
            selectionVariant : "",
            staticPropertyMap : {}
        };
        
        var oFinalVariant = merge({}, oNavSelectionVariant);
        var oPropertyMap = {};
        if (oNavSelectionVariant && 
            oNavSelectionVariant.SelectOptions && 
            oNavSelectionVariant.SelectOptions.length) {
            
            oFinalVariant.SelectOptions = [];
            oNavSelectionVariant.SelectOptions.forEach(function(oSelOption) {
                var aRanges = oSelOption && oSelOption.Ranges;
                var sPropertyName = oSelOption && oSelOption.PropertyName;
                var bSingleRange = aRanges && aRanges.length === 1;
                var oRange = aRanges && aRanges[0];

                if (bSingleRange && oRange["Option"] === 'EQ' && !oRange["High"] && oRange["Low"] && !aSensitiveProps.includes(sPropertyName) && oRange["Sign"] === "I") {
                    oPropertyMap[sPropertyName] = oRange["Low"];
                } else if (!aSensitiveProps.includes(sPropertyName)) {
                    oFinalVariant.SelectOptions.push(oSelOption);
                }
            });
        }

        oResult.selectionVariant = oFinalVariant || "";
        oResult.staticPropertyMap = oPropertyMap;
        return oResult;
    }

    function _getEntityNavigationParameters(oEntity, oCustomParameters, oContext, oController) {
        // Returns both static and custom params in selection variant format
        var oCardPropertiesModel = oController.getCardPropertiesModel(),
            oStaticLinkList = oCardPropertiesModel && oCardPropertiesModel.getProperty("/staticContent"),
            oContextParameters = {};
        var oSelectionVariant, oStaticParameters, oPresentationVariant;

        if (!oStaticLinkList) {
            var oCardSelections = CardAnnotationHelper.getCardSelections(
                oController.getCardPropertiesModel()
                ),
                aCardFilters = oCardSelections.filters,
                aCardParameters = oCardSelections.parameters,
                oEntityType = oController.getEntityType();

            //When filters are passed as navigation params, '/' should be replaced with '.'
            //Eg. to_abc/xyz should be to_abc.xyz
            aCardFilters && aCardFilters.forEach(function (oCardFilter) {
                oCardFilter.path = oCardFilter.path.replace("/", ".");

                // NE operator is not supported by selction variant
                // so we are changing it to exclude with EQ operator.
                // Contains operator is not supported by selection variant
                // so we are changing it to CP operator
                switch (oCardFilter.operator) {
                    case FilterOperator.NE:
                        oCardFilter.operator = FilterOperator.EQ;
                        oCardFilter.sign = "E";
                        break;
                    case FilterOperator.Contains:
                        oCardFilter.operator = "CP";
                        var sValue = oCardFilter.value1;
                        oCardFilter.value1 = "*" + sValue + "*";
                        break;
                    case FilterOperator.EndsWith:
                        oCardFilter.operator = "CP";
                        var sValue = oCardFilter.value1;
                        oCardFilter.value1 = "*" + sValue;
                        break;
                    case FilterOperator.StartsWith:
                        oCardFilter.operator = "CP";
                        var sValue = oCardFilter.value1;
                        oCardFilter.value1 = sValue + "*";
                }

            });
            oCardSelections.filters = aCardFilters;

            //on click of other section in donut card pass the dimensions which are shown as selection variant with exclude value
            if (oContext && oEntity && oEntity.hasOwnProperty("$isOthers")) {
                var oDimensions = oContext.getOtherNavigationDimensions();
                for (var key in oDimensions) {
                    var aDimensionValues = oDimensions[key];
                    for (var i = 0; i < aDimensionValues.length; i++) {
                        oCardSelections.filters.push({
                            path: key,
                            operator: "EQ",
                            value1: aDimensionValues[i],
                            sign: "E"
                        });
                    }
                }
            }

            aCardParameters && aCardParameters.forEach(function (oCardParameter) {
                oCardParameter.path = oCardParameter.path.replace("/", ".");
            });
            oCardSelections.parameters = aCardParameters;
            var oCardSorters = CardAnnotationHelper.getCardSorters(
                oController.getCardPropertiesModel()
            );

            // Build result object of card parameters
            if (oEntity) {
                var key;
                for (var i = 0; oEntityType.property && i < oEntityType.property.length; i++) {
                    key = oEntityType.property[i].name;
                    var vAttributeValue = oEntity[key];

                    if (oEntity.hasOwnProperty(key)) {
                        if (Array.isArray(oEntity[key]) && oEntity[key].length === 1) {
                            oContextParameters[key] = oEntity[key][0];
                        } else if (jQuery.type(vAttributeValue) !== "object") {
                            oContextParameters[key] = vAttributeValue;
                        }
                    }
                }
            }
            // add the KPI ID to the navigation parameters if it's present
            var sKpiAnnotationPath = oCardPropertiesModel && oCardPropertiesModel.getProperty("/kpiAnnotationPath");
            var sCardType = oCardPropertiesModel && oCardPropertiesModel.getProperty("/template");

            if (sKpiAnnotationPath && sCardType === "sap.ovp.cards.charts.analytical") {
                var oRecord = oEntityType[sKpiAnnotationPath];
                var oDetail = oRecord && oRecord.Detail;
                if (oDetail && oDetail.RecordType === "com.sap.vocabularies.UI.v1.KPIDetailType") {
                    oContextParameters["kpiID"] = oRecord.ID.String;
                }
            }

            //Build selection variant object from global filter, card filter and card parameters
            oPresentationVariant = oCardSorters && new PresentationVariant(oCardSorters);
            oSelectionVariant = _buildSelectionVariant(oCardSelections, oController);
            oStaticParameters = oCardPropertiesModel && oCardPropertiesModel.getProperty("/staticParameters");
        }

        //Process Custom parameters
        var bIgnoreEmptyString;
        if (oCustomParameters && !oCustomParameters.bStaticLinkListIndex) {
            //Only in case of custom navigation in analytical cards
            bIgnoreEmptyString = oController._processCustomParameters(oCustomParameters, oSelectionVariant, oContextParameters);
        } else if (oCustomParameters && oCustomParameters.bStaticLinkListIndex) {
            bIgnoreEmptyString = oController._processCustomParameters(oCustomParameters, oSelectionVariant);
        } else {
            bIgnoreEmptyString = oController._processCustomParameters(oContextParameters, oSelectionVariant);
        }
        var iSuppressionBehavior = bIgnoreEmptyString ? SuppressionBehavior.ignoreEmptyString : null;

        //If there is a clash of static parameters with context or selection parameters, then static
        //parameters get lowest priority
        //If any value for oContextParameters[key] is already set, static parameter should not overwrite it
        if (oStaticParameters) {
            for (var key in oStaticParameters) {
                if (!oContextParameters.hasOwnProperty(key)) {
                    oContextParameters[key] = oStaticParameters[key];
                }
            }
        }
        var oNavigationHandler = CommonUtils.getNavigationHandler(),
            oNavSelectionVariant = oNavigationHandler &&
                oNavigationHandler.mixAttributesAndSelectionVariant(oContextParameters, oSelectionVariant.toJSONString(), iSuppressionBehavior),
            aSensitiveProps = _getSensitivePropertiesEntityType(oEntityType);
        oNavSelectionVariant = oNavSelectionVariant && oNavSelectionVariant.toJSONObject();
        var oFinalvalues = getStaticValuesAndNavSelectionVariant(oNavSelectionVariant, aSensitiveProps);

        return {
            sensitiveProperties: aSensitiveProps,
            navSelectionVariant: oFinalvalues && oFinalvalues.selectionVariant && oFinalvalues.selectionVariant.SelectOptions.length ? oFinalvalues.selectionVariant : null,
            staticPropertyMap: oFinalvalues && oFinalvalues.staticPropertyMap,
            sNavPresentationVariant: oPresentationVariant ? oPresentationVariant.toJSONObject() : null
        };
    }

    function _getNavigationWithIntent(oController, oNavigationField) {
        return {
            type: "intent",
            semanticObject: oNavigationField.semanticObject,
            action: oNavigationField.action,
            staticParams: getStaticParams(oController)
        };
    }

    return {
        getNavigationIntentFromAuthString: getNavigationIntentFromAuthString,
        bCheckNavigationForCard: bCheckNavigationForCard,
        getNavigationParameters: getNavigationParameters
    };
},/* bExport= */true);