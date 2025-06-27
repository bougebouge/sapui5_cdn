/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define(["sap/ui/core/Element"],function(e){"use strict";var t=e.extend("sap.gantt.config.SettingItem",{metadata:{library:"sap.gantt",properties:{checked:{type:"boolean",defaultValue:false},key:{type:"string",defaultValue:null},displayText:{type:"string",defaultValue:null},_isStandard:{type:"boolean",defaultValue:false}}}});t.prototype.setChecked=function(e){this.setProperty("checked",e,true);if(this.oParent!==null){this.oParent._oSettingsBox.getItems().forEach(function(t){if(t.getName()===this.getKey()){t.setSelected(e,true)}}.bind(this))}return this};return t},true);
//# sourceMappingURL=SettingItem.js.map