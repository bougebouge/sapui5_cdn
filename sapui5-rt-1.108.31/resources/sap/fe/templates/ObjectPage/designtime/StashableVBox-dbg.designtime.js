/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core"], function (Core) {
  "use strict";

  var oResourceBundle = Core.getLibraryResourceBundle("sap.fe.templates");
  var StashableVBoxDesignTime = {
    actions: {
      remove: {
        changeType: "stashControl"
      },
      reveal: {
        changeType: "unstashControl"
      }
    },
    name: {
      singular: function () {
        return oResourceBundle.getText("T_STASHABLE_VBOX_RTA_HEADERCOLLECTIONFACET_MENU_ADD");
      },
      plural: function () {
        return oResourceBundle.getText("T_STASHABLE_VBOX_RTA_HEADERCOLLECTIONFACET_MENU_ADD_PLURAL");
      }
    },
    palette: {
      group: "LAYOUT",
      icons: {
        svg: "sap/m/designtime/VBox.icon.svg"
      }
    },
    templates: {
      create: "sap/m/designtime/VBox.create.fragment.xml"
    }
  };
  return StashableVBoxDesignTime;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvUmVzb3VyY2VCdW5kbGUiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiU3Rhc2hhYmxlVkJveERlc2lnblRpbWUiLCJhY3Rpb25zIiwicmVtb3ZlIiwiY2hhbmdlVHlwZSIsInJldmVhbCIsIm5hbWUiLCJzaW5ndWxhciIsImdldFRleHQiLCJwbHVyYWwiLCJwYWxldHRlIiwiZ3JvdXAiLCJpY29ucyIsInN2ZyIsInRlbXBsYXRlcyIsImNyZWF0ZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiU3Rhc2hhYmxlVkJveC5kZXNpZ250aW1lLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5cbmNvbnN0IG9SZXNvdXJjZUJ1bmRsZSA9IENvcmUuZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlKFwic2FwLmZlLnRlbXBsYXRlc1wiKTtcblxuY29uc3QgU3Rhc2hhYmxlVkJveERlc2lnblRpbWUgPSB7XG5cdGFjdGlvbnM6IHtcblx0XHRyZW1vdmU6IHtcblx0XHRcdGNoYW5nZVR5cGU6IFwic3Rhc2hDb250cm9sXCJcblx0XHR9LFxuXHRcdHJldmVhbDoge1xuXHRcdFx0Y2hhbmdlVHlwZTogXCJ1bnN0YXNoQ29udHJvbFwiXG5cdFx0fVxuXHR9LFxuXHRuYW1lOiB7XG5cdFx0c2luZ3VsYXI6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBvUmVzb3VyY2VCdW5kbGUuZ2V0VGV4dChcIlRfU1RBU0hBQkxFX1ZCT1hfUlRBX0hFQURFUkNPTExFQ1RJT05GQUNFVF9NRU5VX0FERFwiKTtcblx0XHR9LFxuXHRcdHBsdXJhbDogZnVuY3Rpb24gKCkge1xuXHRcdFx0cmV0dXJuIG9SZXNvdXJjZUJ1bmRsZS5nZXRUZXh0KFwiVF9TVEFTSEFCTEVfVkJPWF9SVEFfSEVBREVSQ09MTEVDVElPTkZBQ0VUX01FTlVfQUREX1BMVVJBTFwiKTtcblx0XHR9XG5cdH0sXG5cdHBhbGV0dGU6IHtcblx0XHRncm91cDogXCJMQVlPVVRcIixcblx0XHRpY29uczoge1xuXHRcdFx0c3ZnOiBcInNhcC9tL2Rlc2lnbnRpbWUvVkJveC5pY29uLnN2Z1wiXG5cdFx0fVxuXHR9LFxuXHR0ZW1wbGF0ZXM6IHtcblx0XHRjcmVhdGU6IFwic2FwL20vZGVzaWdudGltZS9WQm94LmNyZWF0ZS5mcmFnbWVudC54bWxcIlxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBTdGFzaGFibGVWQm94RGVzaWduVGltZTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7OztFQUVBLElBQU1BLGVBQWUsR0FBR0MsSUFBSSxDQUFDQyx3QkFBd0IsQ0FBQyxrQkFBa0IsQ0FBQztFQUV6RSxJQUFNQyx1QkFBdUIsR0FBRztJQUMvQkMsT0FBTyxFQUFFO01BQ1JDLE1BQU0sRUFBRTtRQUNQQyxVQUFVLEVBQUU7TUFDYixDQUFDO01BQ0RDLE1BQU0sRUFBRTtRQUNQRCxVQUFVLEVBQUU7TUFDYjtJQUNELENBQUM7SUFDREUsSUFBSSxFQUFFO01BQ0xDLFFBQVEsRUFBRSxZQUFZO1FBQ3JCLE9BQU9ULGVBQWUsQ0FBQ1UsT0FBTyxDQUFDLHFEQUFxRCxDQUFDO01BQ3RGLENBQUM7TUFDREMsTUFBTSxFQUFFLFlBQVk7UUFDbkIsT0FBT1gsZUFBZSxDQUFDVSxPQUFPLENBQUMsNERBQTRELENBQUM7TUFDN0Y7SUFDRCxDQUFDO0lBQ0RFLE9BQU8sRUFBRTtNQUNSQyxLQUFLLEVBQUUsUUFBUTtNQUNmQyxLQUFLLEVBQUU7UUFDTkMsR0FBRyxFQUFFO01BQ047SUFDRCxDQUFDO0lBQ0RDLFNBQVMsRUFBRTtNQUNWQyxNQUFNLEVBQUU7SUFDVDtFQUNELENBQUM7RUFBQyxPQUVhZCx1QkFBdUI7QUFBQSJ9