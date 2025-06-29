/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/base/EventProvider","sap/base/util/uid"],function(e,s){"use strict";var t=e.extend("sap.ui.core.message.MessageProcessor",{constructor:function(){e.apply(this,arguments);this.mMessages=null;this.id=s();sap.ui.getCore().getMessageManager().registerMessageProcessor(this)},metadata:{abstract:true,publicMethods:["getId","setMessages","attachMessageChange","detachMessageChange"]}});t.M_EVENTS={messageChange:"messageChange"};t.prototype.attachMessageChange=function(e,s,t){this.attachEvent("messageChange",e,s,t);return this};t.prototype.detachMessageChange=function(e,s){this.detachEvent("messageChange",e,s);return this};t.prototype.fireMessageChange=function(e){this.fireEvent("messageChange",e);return this};t.prototype.getId=function(){return this.id};t.prototype.destroy=function(){sap.ui.getCore().getMessageManager().unregisterMessageProcessor(this);e.prototype.destroy.apply(this,arguments)};return t});
//# sourceMappingURL=MessageProcessor.js.map