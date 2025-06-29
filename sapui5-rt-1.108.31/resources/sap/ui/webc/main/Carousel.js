/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/webc/common/WebComponent","./library","./thirdparty/Carousel"],function(e,a){"use strict";var t=a.CarouselArrowsPlacement;var i=e.extend("sap.ui.webc.main.Carousel",{metadata:{library:"sap.ui.webc.main",tag:"ui5-carousel-ui5",properties:{arrowsPlacement:{type:"sap.ui.webc.main.CarouselArrowsPlacement",defaultValue:t.Content},cyclic:{type:"boolean",defaultValue:false},hideNavigationArrows:{type:"boolean",defaultValue:false},hidePageIndicator:{type:"boolean",defaultValue:false},itemsPerPageL:{type:"int",defaultValue:1},itemsPerPageM:{type:"int",defaultValue:1},itemsPerPageS:{type:"int",defaultValue:1}},defaultAggregation:"content",aggregations:{content:{type:"sap.ui.core.Control",multiple:true}},events:{navigate:{parameters:{selectedIndex:{type:"int"}}}},methods:["navigateTo"],designtime:"sap/ui/webc/main/designtime/Carousel.designtime"}});return i});
//# sourceMappingURL=Carousel.js.map