/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./Element","./library","sap/base/assert"],function(e,t,r){"use strict";var n=t.ValueState;var a={};var u=null;var i=function(){if(!u){u={};var e=sap.ui.getCore().getLibraryResourceBundle("sap.ui.core");u[n.Error]=e.getText("VALUE_STATE_ERROR");u[n.Warning]=e.getText("VALUE_STATE_WARNING");u[n.Success]=e.getText("VALUE_STATE_SUCCESS");u[n.Information]=e.getText("VALUE_STATE_INFORMATION")}};a.enrichTooltip=function(t,n){r(t instanceof e,"oElement must be an Element");if(!n&&t.getTooltip()){return undefined}var u=a.getAdditionalText(t);if(u){return(n?n+" - ":"")+u}return n};a.getAdditionalText=function(e){var t=null;if(e&&e.getValueState){t=e.getValueState()}else if(n[e]){t=e}if(t&&t!=n.None){i();return u[t]}return null};a.formatValueState=function(e){switch(e){case 1:return n.Warning;case 2:return n.Success;case 3:return n.Error;case 4:return n.Information;default:return n.None}};return a},true);
//# sourceMappingURL=ValueStateSupport.js.map