/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var e={apiVersion:2};e.render=function(e,i){var n=i.getAggregation("_mainIndicator"),a=i.getSideIndicators();e.openStart("div",i).class("sapFCardNumericIndicators").class("sapFCardNumericIndicatorsSideAlign"+i.getSideIndicatorsAlignment());if(i.getNumberSize()==="S"){e.class("sapMTileSmallPhone")}e.openEnd();if(n){e.openStart("div").class("sapFCardNumericIndicatorsMain").openEnd().renderControl(n).close("div");e.openStart("div").class("sapFCardNumericIndicatorsGap").openEnd().close("div")}if(a.length!==0){e.openStart("div").class("sapFCardNumericIndicatorsSide").openEnd();a.forEach(function(i){e.renderControl(i)});e.close("div")}e.close("div")};return e});
//# sourceMappingURL=NumericIndicatorsRenderer.js.map