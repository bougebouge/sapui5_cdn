/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core"],function(e){"use strict";var t=e.getLibraryResourceBundle("sap.fe.templates");var n={actions:{remove:{changeType:"stashControl"},reveal:{changeType:"unstashControl"},rename:function(){return{changeType:"renameHeaderFacet",domRef:function(e){var t=e.getTitleControl();if(t){return t.getDomRef()}else{return null}}}}},name:{singular:function(){return t.getText("T_STASHABLE_HBOX_RTA_HEADERFACET_MENU_ADD")},plural:function(){return t.getText("T_STASHABLE_HBOX_RTA_HEADERFACET_MENU_ADD_PLURAL")}},palette:{group:"LAYOUT",icons:{svg:"sap/m/designtime/HBox.icon.svg"}},templates:{create:"sap/m/designtime/HBox.create.fragment.xml"}};return n},false);
//# sourceMappingURL=StashableHBox.designtime.js.map