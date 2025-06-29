/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/base/Log","sap/ui/core/Core","sap/ui/core/CommandExecution"],function(t,o,e){"use strict";var n=function(t,o){this.oControl=t;this.oConfig=o};n.prototype._getShortcutText=function(){var t;if(this.oConfig.commandName){t=this._getShortcutHintFromCommandExecution(this.oControl,this.oConfig.commandName)}else if(this.oConfig.message){t=this.oConfig.message}else if(this.oConfig.messageBundleKey){t=this._getShortcutHintFromMessageBundle(this.oControl,this.oConfig.messageBundleKey)}return t};n.prototype._getShortcutHintFromCommandExecution=function(o,n){try{return e.find(o,n)._getCommandInfo().shortcut}catch(o){t.error("Error on retrieving command shortcut. Command "+n+" was not found!")}};n.prototype._getShortcutHintFromMessageBundle=function(t,e){var n=o.getLibraryResourceBundle(t.getMetadata().getLibraryName());return n.getText(e)};return n});
//# sourceMappingURL=ShortcutHint.js.map