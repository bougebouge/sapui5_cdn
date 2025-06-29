/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([],function(){"use strict";var t="sap-ui-test-recorder-frame";var e=1001;var E=e+1;var I=E+1;var T="3px";var i={BOTTOM:"50%",SIDE:"100%"};var r={BOTTOM:"100%",SIDE:"40%"};var h={LEFT_SIDE:"40%",RIGHT_SIDE:"60%"};return{HIGHLIGHTER_ID:"ui5-test-recorder-highlighter",CONTEXTMENU_ID:"ui5-test-recorder-contextmenu",IFRAME_ID:t,RESIZE_OVERLAY_ID:t+"resize-overlay",DOCK:{BOTTOM:"BOTTOM",RIGHT:"RIGHT",LEFT:"LEFT"},RESIZE_HANDLE:{BOTTOM:{id:t+"resizehandle-bottom",width:r.BOTTOM,height:T,left:"0",top:i.BOTTOM},RIGHT:{id:t+"resizehandle-right",width:T,height:i.SIDE,left:h.RIGHT_SIDE,top:"0"},LEFT:{id:t+"resizehandle-left",width:T,height:i.SIDE,left:h.LEFT_SIDE,top:"0"}},FRAME:{BOTTOM:{width:r.BOTTOM,height:i.BOTTOM,left:"0",top:"unset",bottom:"0"},RIGHT:{width:r.SIDE,height:i.SIDE,left:h.RIGHT_SIDE,top:"0"},LEFT:{width:r.SIDE,height:i.SIDE,left:"0",top:"0"},MINIMIZED:{width:"180px",height:"32px"}},IFRAME_ZINDEX:e,RESIZE_OVERLAY_ZINDEX:E,RESIZE_HANDLE_ZINDEX:I}},true);
//# sourceMappingURL=Constants.js.map