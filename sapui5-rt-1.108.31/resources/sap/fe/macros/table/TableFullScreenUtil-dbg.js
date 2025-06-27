/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/m/Button", "sap/m/Dialog", "sap/m/library", "sap/ui/core/Component", "sap/ui/core/Core", "sap/ui/core/HTML", "sap/ui/thirdparty/jquery"], function (Button, Dialog, mLibrary, Component, Core, HTML, jQuery) {
  "use strict";

  var ButtonType = mLibrary.ButtonType;
  var TableFullScreenUtil = {
    onFullScreenToggle: function (oFullScreenButton) {
      var oTable = oFullScreenButton.getParent().getParent().getParent().getParent();
      var $oTableContent;
      oFullScreenButton._enteringFullScreen = !oFullScreenButton._enteringFullScreen;
      var fnOnFullScreenToggle = this.onFullScreenToggle.bind(this, oFullScreenButton);
      var oMessageBundle = Core.getLibraryResourceBundle("sap.fe.macros");
      if (oFullScreenButton._enteringFullScreen === true) {
        // change the button icon and text
        oFullScreenButton.setIcon("sap-icon://exit-full-screen");
        oFullScreenButton.setTooltip(oMessageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MINIMIZE"));
        // if the table is a responsive table, switch to load on scroll
        // get the dom reference of the control
        $oTableContent = oTable.$();
        // add 100% height to the FlexBox container for the Control to rendering in full screen
        $oTableContent.css("height", "100%");
        // Create an HTML element to add the controls DOM content in the FullScreen dialog
        if (!oTable._oHTML) {
          oTable._oHTML = new HTML({
            preferDOM: false,
            afterRendering: function () {
              if (oTable && oTable._oHTML) {
                var $oHTMLContent = oTable._oHTML.$();
                var oChildren;
                // Get the current HTML Dom content
                if ($oHTMLContent) {
                  // remove any old child content
                  oChildren = $oHTMLContent.children();
                  oChildren.remove();
                  // stretch the content to occupy the whole space
                  $oHTMLContent.css("height", "100%");
                  // append the control dom to HTML content
                  $oHTMLContent.append(oTable.getDomRef());
                }
              }
            }
          });
        }

        // Create and set a fullscreen Dialog (without headers) on the registered control instance
        if (!oTable._oFullScreenDialog) {
          var oComponent = Component.getOwnerComponentFor(oTable);
          oComponent.runAsOwner(function () {
            oTable._oFullScreenDialog = new Dialog({
              showHeader: false,
              stretch: true,
              beforeClose: function () {
                // In case fullscreen dialog was closed due to navigation to another page/view/app, "Esc" click, etc. The dialog close
                // would be triggered externally and we need to clean up and replace the DOM content back to the original location
                if (oTable && oTable._$placeHolder) {
                  fnOnFullScreenToggle();
                }
              },
              endButton: new Button({
                text: oMessageBundle.getText("M_COMMON_TABLE_FULLSCREEN_CLOSE"),
                type: ButtonType.Transparent,
                press: fnOnFullScreenToggle
              }),
              content: [oTable._oHTML]
            });
            oTable._oFullScreenDialog.data("FullScreenDialog", true);
            oComponent.getRootControl().addDependent(oTable._oFullScreenDialog);
          });

          // Set focus back on full-screen button of control
          if (oFullScreenButton) {
            oTable._oFullScreenDialog.attachAfterOpen(function () {
              oFullScreenButton.focus();
              // Hack to update scroll of sap.m.List/ResponsiveTable - 2/2
              if (oTable._oGrowingDelegate && oTable._oGrowingDelegate.onAfterRendering) {
                // Temporarily change the parent of control to Fullscreen Dialog
                oTable._oOldParent = oTable.oParent;
                oTable.oParent = oTable._oFullScreenDialog;
                // update delegate to enable scroll with new parent
                oTable._oGrowingDelegate.onAfterRendering();
                // restore parent
                oTable.oParent = oTable._oOldParent;
                // delete unnecessary props
                delete oTable._oOldParent;
              }
              // Add 100% height to scroll container
              oTable._oFullScreenDialog.$().find(".sapMDialogScroll").css("height", "100%");
            });
            oTable._oFullScreenDialog.attachAfterClose(function () {
              var oAppComponent = Component.getOwnerComponentFor(oComponent);
              oFullScreenButton.focus();
              // trigger the automatic scroll to the latest navigated row :
              oAppComponent.getRootViewController().getView().getController()._scrollTablesToLastNavigatedItems();
            });
          }
          // add the style class from control to the dialog
          oTable._oFullScreenDialog.addStyleClass($oTableContent.closest(".sapUiSizeCompact").length ? "sapUiSizeCompact" : "");
          // add style class to make the scroll container height as 100% (required to stretch UI to 100% e.g. for SmartChart)
          oTable._oFullScreenDialog.addStyleClass("sapUiCompSmartFullScreenDialog");
        }
        // create a dummy div node (place holder)
        oTable._$placeHolder = jQuery(document.createElement("div"));
        // Set the place holder before the current content
        $oTableContent.before(oTable._$placeHolder);
        // Add a dummy div as content of the HTML control
        oTable._oHTML.setContent("<div/>");
        // Hack to update scroll of sap.m.List/ResponsiveTable - 1/2
        if (!oTable._oGrowingDelegate) {
          oTable._oGrowingDelegate = oTable._oTable || oTable._oList;
          if (oTable._oGrowingDelegate && oTable._oGrowingDelegate.getGrowingScrollToLoad && oTable._oGrowingDelegate.getGrowingScrollToLoad()) {
            oTable._oGrowingDelegate = oTable._oGrowingDelegate._oGrowingDelegate;
          } else {
            oTable._oGrowingDelegate = null;
          }
        }
        // open the full screen Dialog
        oTable._oFullScreenDialog.open();
      } else {
        // change the button icon
        oFullScreenButton.setIcon("sap-icon://full-screen");
        oFullScreenButton.setTooltip(oMessageBundle.getText("M_COMMON_TABLE_FULLSCREEN_MAXIMIZE"));
        // Get reference to table
        oTable = oFullScreenButton.getParent().getParent().getParent().getParent();

        // get the HTML controls content --> as it should contain the control's current DOM ref
        $oTableContent = oTable._oHTML.$();
        // Replace the place holder with the Controls DOM ref (child of HTML)
        oTable._$placeHolder.replaceWith($oTableContent.children());
        oTable._$placeHolder = null;
        $oTableContent = null;

        // close the full screen Dialog
        if (oTable._oFullScreenDialog) {
          oTable._oFullScreenDialog.close();
        }
      }
    }
  };
  return TableFullScreenUtil;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdXR0b25UeXBlIiwibUxpYnJhcnkiLCJUYWJsZUZ1bGxTY3JlZW5VdGlsIiwib25GdWxsU2NyZWVuVG9nZ2xlIiwib0Z1bGxTY3JlZW5CdXR0b24iLCJvVGFibGUiLCJnZXRQYXJlbnQiLCIkb1RhYmxlQ29udGVudCIsIl9lbnRlcmluZ0Z1bGxTY3JlZW4iLCJmbk9uRnVsbFNjcmVlblRvZ2dsZSIsImJpbmQiLCJvTWVzc2FnZUJ1bmRsZSIsIkNvcmUiLCJnZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUiLCJzZXRJY29uIiwic2V0VG9vbHRpcCIsImdldFRleHQiLCIkIiwiY3NzIiwiX29IVE1MIiwiSFRNTCIsInByZWZlckRPTSIsImFmdGVyUmVuZGVyaW5nIiwiJG9IVE1MQ29udGVudCIsIm9DaGlsZHJlbiIsImNoaWxkcmVuIiwicmVtb3ZlIiwiYXBwZW5kIiwiZ2V0RG9tUmVmIiwiX29GdWxsU2NyZWVuRGlhbG9nIiwib0NvbXBvbmVudCIsIkNvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwicnVuQXNPd25lciIsIkRpYWxvZyIsInNob3dIZWFkZXIiLCJzdHJldGNoIiwiYmVmb3JlQ2xvc2UiLCJfJHBsYWNlSG9sZGVyIiwiZW5kQnV0dG9uIiwiQnV0dG9uIiwidGV4dCIsInR5cGUiLCJUcmFuc3BhcmVudCIsInByZXNzIiwiY29udGVudCIsImRhdGEiLCJnZXRSb290Q29udHJvbCIsImFkZERlcGVuZGVudCIsImF0dGFjaEFmdGVyT3BlbiIsImZvY3VzIiwiX29Hcm93aW5nRGVsZWdhdGUiLCJvbkFmdGVyUmVuZGVyaW5nIiwiX29PbGRQYXJlbnQiLCJvUGFyZW50IiwiZmluZCIsImF0dGFjaEFmdGVyQ2xvc2UiLCJvQXBwQ29tcG9uZW50IiwiZ2V0Um9vdFZpZXdDb250cm9sbGVyIiwiZ2V0VmlldyIsImdldENvbnRyb2xsZXIiLCJfc2Nyb2xsVGFibGVzVG9MYXN0TmF2aWdhdGVkSXRlbXMiLCJhZGRTdHlsZUNsYXNzIiwiY2xvc2VzdCIsImxlbmd0aCIsImpRdWVyeSIsImRvY3VtZW50IiwiY3JlYXRlRWxlbWVudCIsImJlZm9yZSIsInNldENvbnRlbnQiLCJfb1RhYmxlIiwiX29MaXN0IiwiZ2V0R3Jvd2luZ1Njcm9sbFRvTG9hZCIsIm9wZW4iLCJyZXBsYWNlV2l0aCIsImNsb3NlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJUYWJsZUZ1bGxTY3JlZW5VdGlsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQnV0dG9uIGZyb20gXCJzYXAvbS9CdXR0b25cIjtcbmltcG9ydCBEaWFsb2cgZnJvbSBcInNhcC9tL0RpYWxvZ1wiO1xuaW1wb3J0IG1MaWJyYXJ5IGZyb20gXCJzYXAvbS9saWJyYXJ5XCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgSFRNTCBmcm9tIFwic2FwL3VpL2NvcmUvSFRNTFwiO1xuaW1wb3J0IGpRdWVyeSBmcm9tIFwic2FwL3VpL3RoaXJkcGFydHkvanF1ZXJ5XCI7XG5cbmNvbnN0IEJ1dHRvblR5cGUgPSBtTGlicmFyeS5CdXR0b25UeXBlO1xuY29uc3QgVGFibGVGdWxsU2NyZWVuVXRpbCA9IHtcblx0b25GdWxsU2NyZWVuVG9nZ2xlOiBmdW5jdGlvbiAob0Z1bGxTY3JlZW5CdXR0b246IGFueSkge1xuXHRcdGxldCBvVGFibGUgPSBvRnVsbFNjcmVlbkJ1dHRvbi5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKTtcblx0XHRsZXQgJG9UYWJsZUNvbnRlbnQ7XG5cdFx0b0Z1bGxTY3JlZW5CdXR0b24uX2VudGVyaW5nRnVsbFNjcmVlbiA9ICFvRnVsbFNjcmVlbkJ1dHRvbi5fZW50ZXJpbmdGdWxsU2NyZWVuO1xuXHRcdGNvbnN0IGZuT25GdWxsU2NyZWVuVG9nZ2xlID0gdGhpcy5vbkZ1bGxTY3JlZW5Ub2dnbGUuYmluZCh0aGlzLCBvRnVsbFNjcmVlbkJ1dHRvbik7XG5cdFx0Y29uc3Qgb01lc3NhZ2VCdW5kbGUgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC5mZS5tYWNyb3NcIik7XG5cblx0XHRpZiAob0Z1bGxTY3JlZW5CdXR0b24uX2VudGVyaW5nRnVsbFNjcmVlbiA9PT0gdHJ1ZSkge1xuXHRcdFx0Ly8gY2hhbmdlIHRoZSBidXR0b24gaWNvbiBhbmQgdGV4dFxuXHRcdFx0b0Z1bGxTY3JlZW5CdXR0b24uc2V0SWNvbihcInNhcC1pY29uOi8vZXhpdC1mdWxsLXNjcmVlblwiKTtcblx0XHRcdG9GdWxsU2NyZWVuQnV0dG9uLnNldFRvb2x0aXAob01lc3NhZ2VCdW5kbGUuZ2V0VGV4dChcIk1fQ09NTU9OX1RBQkxFX0ZVTExTQ1JFRU5fTUlOSU1JWkVcIikpO1xuXHRcdFx0Ly8gaWYgdGhlIHRhYmxlIGlzIGEgcmVzcG9uc2l2ZSB0YWJsZSwgc3dpdGNoIHRvIGxvYWQgb24gc2Nyb2xsXG5cdFx0XHQvLyBnZXQgdGhlIGRvbSByZWZlcmVuY2Ugb2YgdGhlIGNvbnRyb2xcblx0XHRcdCRvVGFibGVDb250ZW50ID0gb1RhYmxlLiQoKTtcblx0XHRcdC8vIGFkZCAxMDAlIGhlaWdodCB0byB0aGUgRmxleEJveCBjb250YWluZXIgZm9yIHRoZSBDb250cm9sIHRvIHJlbmRlcmluZyBpbiBmdWxsIHNjcmVlblxuXHRcdFx0JG9UYWJsZUNvbnRlbnQuY3NzKFwiaGVpZ2h0XCIsIFwiMTAwJVwiKTtcblx0XHRcdC8vIENyZWF0ZSBhbiBIVE1MIGVsZW1lbnQgdG8gYWRkIHRoZSBjb250cm9scyBET00gY29udGVudCBpbiB0aGUgRnVsbFNjcmVlbiBkaWFsb2dcblx0XHRcdGlmICghb1RhYmxlLl9vSFRNTCkge1xuXHRcdFx0XHRvVGFibGUuX29IVE1MID0gbmV3IEhUTUwoe1xuXHRcdFx0XHRcdHByZWZlckRPTTogZmFsc2UsXG5cdFx0XHRcdFx0YWZ0ZXJSZW5kZXJpbmc6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdGlmIChvVGFibGUgJiYgb1RhYmxlLl9vSFRNTCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCAkb0hUTUxDb250ZW50ID0gb1RhYmxlLl9vSFRNTC4kKCk7XG5cdFx0XHRcdFx0XHRcdGxldCBvQ2hpbGRyZW47XG5cdFx0XHRcdFx0XHRcdC8vIEdldCB0aGUgY3VycmVudCBIVE1MIERvbSBjb250ZW50XG5cdFx0XHRcdFx0XHRcdGlmICgkb0hUTUxDb250ZW50KSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gcmVtb3ZlIGFueSBvbGQgY2hpbGQgY29udGVudFxuXHRcdFx0XHRcdFx0XHRcdG9DaGlsZHJlbiA9ICRvSFRNTENvbnRlbnQuY2hpbGRyZW4oKTtcblx0XHRcdFx0XHRcdFx0XHRvQ2hpbGRyZW4ucmVtb3ZlKCk7XG5cdFx0XHRcdFx0XHRcdFx0Ly8gc3RyZXRjaCB0aGUgY29udGVudCB0byBvY2N1cHkgdGhlIHdob2xlIHNwYWNlXG5cdFx0XHRcdFx0XHRcdFx0JG9IVE1MQ29udGVudC5jc3MoXCJoZWlnaHRcIiwgXCIxMDAlXCIpO1xuXHRcdFx0XHRcdFx0XHRcdC8vIGFwcGVuZCB0aGUgY29udHJvbCBkb20gdG8gSFRNTCBjb250ZW50XG5cdFx0XHRcdFx0XHRcdFx0JG9IVE1MQ29udGVudC5hcHBlbmQob1RhYmxlLmdldERvbVJlZigpKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdC8vIENyZWF0ZSBhbmQgc2V0IGEgZnVsbHNjcmVlbiBEaWFsb2cgKHdpdGhvdXQgaGVhZGVycykgb24gdGhlIHJlZ2lzdGVyZWQgY29udHJvbCBpbnN0YW5jZVxuXHRcdFx0aWYgKCFvVGFibGUuX29GdWxsU2NyZWVuRGlhbG9nKSB7XG5cdFx0XHRcdGNvbnN0IG9Db21wb25lbnQgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob1RhYmxlKTtcblx0XHRcdFx0b0NvbXBvbmVudC5ydW5Bc093bmVyKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRvVGFibGUuX29GdWxsU2NyZWVuRGlhbG9nID0gbmV3IERpYWxvZyh7XG5cdFx0XHRcdFx0XHRzaG93SGVhZGVyOiBmYWxzZSxcblx0XHRcdFx0XHRcdHN0cmV0Y2g6IHRydWUsXG5cdFx0XHRcdFx0XHRiZWZvcmVDbG9zZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdFx0XHQvLyBJbiBjYXNlIGZ1bGxzY3JlZW4gZGlhbG9nIHdhcyBjbG9zZWQgZHVlIHRvIG5hdmlnYXRpb24gdG8gYW5vdGhlciBwYWdlL3ZpZXcvYXBwLCBcIkVzY1wiIGNsaWNrLCBldGMuIFRoZSBkaWFsb2cgY2xvc2Vcblx0XHRcdFx0XHRcdFx0Ly8gd291bGQgYmUgdHJpZ2dlcmVkIGV4dGVybmFsbHkgYW5kIHdlIG5lZWQgdG8gY2xlYW4gdXAgYW5kIHJlcGxhY2UgdGhlIERPTSBjb250ZW50IGJhY2sgdG8gdGhlIG9yaWdpbmFsIGxvY2F0aW9uXG5cdFx0XHRcdFx0XHRcdGlmIChvVGFibGUgJiYgb1RhYmxlLl8kcGxhY2VIb2xkZXIpIHtcblx0XHRcdFx0XHRcdFx0XHRmbk9uRnVsbFNjcmVlblRvZ2dsZSgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdFx0ZW5kQnV0dG9uOiBuZXcgQnV0dG9uKHtcblx0XHRcdFx0XHRcdFx0dGV4dDogb01lc3NhZ2VCdW5kbGUuZ2V0VGV4dChcIk1fQ09NTU9OX1RBQkxFX0ZVTExTQ1JFRU5fQ0xPU0VcIiksXG5cdFx0XHRcdFx0XHRcdHR5cGU6IEJ1dHRvblR5cGUuVHJhbnNwYXJlbnQsXG5cdFx0XHRcdFx0XHRcdHByZXNzOiBmbk9uRnVsbFNjcmVlblRvZ2dsZVxuXHRcdFx0XHRcdFx0fSksXG5cdFx0XHRcdFx0XHRjb250ZW50OiBbb1RhYmxlLl9vSFRNTF1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRvVGFibGUuX29GdWxsU2NyZWVuRGlhbG9nLmRhdGEoXCJGdWxsU2NyZWVuRGlhbG9nXCIsIHRydWUpO1xuXHRcdFx0XHRcdChvQ29tcG9uZW50IGFzIEFwcENvbXBvbmVudCkuZ2V0Um9vdENvbnRyb2woKS5hZGREZXBlbmRlbnQob1RhYmxlLl9vRnVsbFNjcmVlbkRpYWxvZyk7XG5cdFx0XHRcdH0pO1xuXG5cdFx0XHRcdC8vIFNldCBmb2N1cyBiYWNrIG9uIGZ1bGwtc2NyZWVuIGJ1dHRvbiBvZiBjb250cm9sXG5cdFx0XHRcdGlmIChvRnVsbFNjcmVlbkJ1dHRvbikge1xuXHRcdFx0XHRcdG9UYWJsZS5fb0Z1bGxTY3JlZW5EaWFsb2cuYXR0YWNoQWZ0ZXJPcGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdG9GdWxsU2NyZWVuQnV0dG9uLmZvY3VzKCk7XG5cdFx0XHRcdFx0XHQvLyBIYWNrIHRvIHVwZGF0ZSBzY3JvbGwgb2Ygc2FwLm0uTGlzdC9SZXNwb25zaXZlVGFibGUgLSAyLzJcblx0XHRcdFx0XHRcdGlmIChvVGFibGUuX29Hcm93aW5nRGVsZWdhdGUgJiYgb1RhYmxlLl9vR3Jvd2luZ0RlbGVnYXRlLm9uQWZ0ZXJSZW5kZXJpbmcpIHtcblx0XHRcdFx0XHRcdFx0Ly8gVGVtcG9yYXJpbHkgY2hhbmdlIHRoZSBwYXJlbnQgb2YgY29udHJvbCB0byBGdWxsc2NyZWVuIERpYWxvZ1xuXHRcdFx0XHRcdFx0XHRvVGFibGUuX29PbGRQYXJlbnQgPSBvVGFibGUub1BhcmVudDtcblx0XHRcdFx0XHRcdFx0b1RhYmxlLm9QYXJlbnQgPSBvVGFibGUuX29GdWxsU2NyZWVuRGlhbG9nO1xuXHRcdFx0XHRcdFx0XHQvLyB1cGRhdGUgZGVsZWdhdGUgdG8gZW5hYmxlIHNjcm9sbCB3aXRoIG5ldyBwYXJlbnRcblx0XHRcdFx0XHRcdFx0b1RhYmxlLl9vR3Jvd2luZ0RlbGVnYXRlLm9uQWZ0ZXJSZW5kZXJpbmcoKTtcblx0XHRcdFx0XHRcdFx0Ly8gcmVzdG9yZSBwYXJlbnRcblx0XHRcdFx0XHRcdFx0b1RhYmxlLm9QYXJlbnQgPSBvVGFibGUuX29PbGRQYXJlbnQ7XG5cdFx0XHRcdFx0XHRcdC8vIGRlbGV0ZSB1bm5lY2Vzc2FyeSBwcm9wc1xuXHRcdFx0XHRcdFx0XHRkZWxldGUgb1RhYmxlLl9vT2xkUGFyZW50O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Ly8gQWRkIDEwMCUgaGVpZ2h0IHRvIHNjcm9sbCBjb250YWluZXJcblx0XHRcdFx0XHRcdG9UYWJsZS5fb0Z1bGxTY3JlZW5EaWFsb2cuJCgpLmZpbmQoXCIuc2FwTURpYWxvZ1Njcm9sbFwiKS5jc3MoXCJoZWlnaHRcIiwgXCIxMDAlXCIpO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdG9UYWJsZS5fb0Z1bGxTY3JlZW5EaWFsb2cuYXR0YWNoQWZ0ZXJDbG9zZShmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBvQXBwQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKG9Db21wb25lbnQpIGFzIEFwcENvbXBvbmVudDtcblx0XHRcdFx0XHRcdG9GdWxsU2NyZWVuQnV0dG9uLmZvY3VzKCk7XG5cdFx0XHRcdFx0XHQvLyB0cmlnZ2VyIHRoZSBhdXRvbWF0aWMgc2Nyb2xsIHRvIHRoZSBsYXRlc3QgbmF2aWdhdGVkIHJvdyA6XG5cdFx0XHRcdFx0XHQob0FwcENvbXBvbmVudC5nZXRSb290Vmlld0NvbnRyb2xsZXIoKS5nZXRWaWV3KCkuZ2V0Q29udHJvbGxlcigpIGFzIGFueSkuX3Njcm9sbFRhYmxlc1RvTGFzdE5hdmlnYXRlZEl0ZW1zKCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Ly8gYWRkIHRoZSBzdHlsZSBjbGFzcyBmcm9tIGNvbnRyb2wgdG8gdGhlIGRpYWxvZ1xuXHRcdFx0XHRvVGFibGUuX29GdWxsU2NyZWVuRGlhbG9nLmFkZFN0eWxlQ2xhc3MoJG9UYWJsZUNvbnRlbnQuY2xvc2VzdChcIi5zYXBVaVNpemVDb21wYWN0XCIpLmxlbmd0aCA/IFwic2FwVWlTaXplQ29tcGFjdFwiIDogXCJcIik7XG5cdFx0XHRcdC8vIGFkZCBzdHlsZSBjbGFzcyB0byBtYWtlIHRoZSBzY3JvbGwgY29udGFpbmVyIGhlaWdodCBhcyAxMDAlIChyZXF1aXJlZCB0byBzdHJldGNoIFVJIHRvIDEwMCUgZS5nLiBmb3IgU21hcnRDaGFydClcblx0XHRcdFx0b1RhYmxlLl9vRnVsbFNjcmVlbkRpYWxvZy5hZGRTdHlsZUNsYXNzKFwic2FwVWlDb21wU21hcnRGdWxsU2NyZWVuRGlhbG9nXCIpO1xuXHRcdFx0fVxuXHRcdFx0Ly8gY3JlYXRlIGEgZHVtbXkgZGl2IG5vZGUgKHBsYWNlIGhvbGRlcilcblx0XHRcdG9UYWJsZS5fJHBsYWNlSG9sZGVyID0galF1ZXJ5KGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpO1xuXHRcdFx0Ly8gU2V0IHRoZSBwbGFjZSBob2xkZXIgYmVmb3JlIHRoZSBjdXJyZW50IGNvbnRlbnRcblx0XHRcdCRvVGFibGVDb250ZW50LmJlZm9yZShvVGFibGUuXyRwbGFjZUhvbGRlcik7XG5cdFx0XHQvLyBBZGQgYSBkdW1teSBkaXYgYXMgY29udGVudCBvZiB0aGUgSFRNTCBjb250cm9sXG5cdFx0XHRvVGFibGUuX29IVE1MLnNldENvbnRlbnQoXCI8ZGl2Lz5cIik7XG5cdFx0XHQvLyBIYWNrIHRvIHVwZGF0ZSBzY3JvbGwgb2Ygc2FwLm0uTGlzdC9SZXNwb25zaXZlVGFibGUgLSAxLzJcblx0XHRcdGlmICghb1RhYmxlLl9vR3Jvd2luZ0RlbGVnYXRlKSB7XG5cdFx0XHRcdG9UYWJsZS5fb0dyb3dpbmdEZWxlZ2F0ZSA9IG9UYWJsZS5fb1RhYmxlIHx8IG9UYWJsZS5fb0xpc3Q7XG5cdFx0XHRcdGlmIChcblx0XHRcdFx0XHRvVGFibGUuX29Hcm93aW5nRGVsZWdhdGUgJiZcblx0XHRcdFx0XHRvVGFibGUuX29Hcm93aW5nRGVsZWdhdGUuZ2V0R3Jvd2luZ1Njcm9sbFRvTG9hZCAmJlxuXHRcdFx0XHRcdG9UYWJsZS5fb0dyb3dpbmdEZWxlZ2F0ZS5nZXRHcm93aW5nU2Nyb2xsVG9Mb2FkKClcblx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0b1RhYmxlLl9vR3Jvd2luZ0RlbGVnYXRlID0gb1RhYmxlLl9vR3Jvd2luZ0RlbGVnYXRlLl9vR3Jvd2luZ0RlbGVnYXRlO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdG9UYWJsZS5fb0dyb3dpbmdEZWxlZ2F0ZSA9IG51bGw7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHRcdC8vIG9wZW4gdGhlIGZ1bGwgc2NyZWVuIERpYWxvZ1xuXHRcdFx0b1RhYmxlLl9vRnVsbFNjcmVlbkRpYWxvZy5vcGVuKCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGNoYW5nZSB0aGUgYnV0dG9uIGljb25cblx0XHRcdG9GdWxsU2NyZWVuQnV0dG9uLnNldEljb24oXCJzYXAtaWNvbjovL2Z1bGwtc2NyZWVuXCIpO1xuXHRcdFx0b0Z1bGxTY3JlZW5CdXR0b24uc2V0VG9vbHRpcChvTWVzc2FnZUJ1bmRsZS5nZXRUZXh0KFwiTV9DT01NT05fVEFCTEVfRlVMTFNDUkVFTl9NQVhJTUlaRVwiKSk7XG5cdFx0XHQvLyBHZXQgcmVmZXJlbmNlIHRvIHRhYmxlXG5cdFx0XHRvVGFibGUgPSBvRnVsbFNjcmVlbkJ1dHRvbi5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKS5nZXRQYXJlbnQoKTtcblxuXHRcdFx0Ly8gZ2V0IHRoZSBIVE1MIGNvbnRyb2xzIGNvbnRlbnQgLS0+IGFzIGl0IHNob3VsZCBjb250YWluIHRoZSBjb250cm9sJ3MgY3VycmVudCBET00gcmVmXG5cdFx0XHQkb1RhYmxlQ29udGVudCA9IG9UYWJsZS5fb0hUTUwuJCgpO1xuXHRcdFx0Ly8gUmVwbGFjZSB0aGUgcGxhY2UgaG9sZGVyIHdpdGggdGhlIENvbnRyb2xzIERPTSByZWYgKGNoaWxkIG9mIEhUTUwpXG5cdFx0XHRvVGFibGUuXyRwbGFjZUhvbGRlci5yZXBsYWNlV2l0aCgkb1RhYmxlQ29udGVudC5jaGlsZHJlbigpKTtcblxuXHRcdFx0b1RhYmxlLl8kcGxhY2VIb2xkZXIgPSBudWxsO1xuXHRcdFx0JG9UYWJsZUNvbnRlbnQgPSBudWxsO1xuXG5cdFx0XHQvLyBjbG9zZSB0aGUgZnVsbCBzY3JlZW4gRGlhbG9nXG5cdFx0XHRpZiAob1RhYmxlLl9vRnVsbFNjcmVlbkRpYWxvZykge1xuXHRcdFx0XHRvVGFibGUuX29GdWxsU2NyZWVuRGlhbG9nLmNsb3NlKCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBUYWJsZUZ1bGxTY3JlZW5VdGlsO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBU0EsSUFBTUEsVUFBVSxHQUFHQyxRQUFRLENBQUNELFVBQVU7RUFDdEMsSUFBTUUsbUJBQW1CLEdBQUc7SUFDM0JDLGtCQUFrQixFQUFFLFVBQVVDLGlCQUFzQixFQUFFO01BQ3JELElBQUlDLE1BQU0sR0FBR0QsaUJBQWlCLENBQUNFLFNBQVMsRUFBRSxDQUFDQSxTQUFTLEVBQUUsQ0FBQ0EsU0FBUyxFQUFFLENBQUNBLFNBQVMsRUFBRTtNQUM5RSxJQUFJQyxjQUFjO01BQ2xCSCxpQkFBaUIsQ0FBQ0ksbUJBQW1CLEdBQUcsQ0FBQ0osaUJBQWlCLENBQUNJLG1CQUFtQjtNQUM5RSxJQUFNQyxvQkFBb0IsR0FBRyxJQUFJLENBQUNOLGtCQUFrQixDQUFDTyxJQUFJLENBQUMsSUFBSSxFQUFFTixpQkFBaUIsQ0FBQztNQUNsRixJQUFNTyxjQUFjLEdBQUdDLElBQUksQ0FBQ0Msd0JBQXdCLENBQUMsZUFBZSxDQUFDO01BRXJFLElBQUlULGlCQUFpQixDQUFDSSxtQkFBbUIsS0FBSyxJQUFJLEVBQUU7UUFDbkQ7UUFDQUosaUJBQWlCLENBQUNVLE9BQU8sQ0FBQyw2QkFBNkIsQ0FBQztRQUN4RFYsaUJBQWlCLENBQUNXLFVBQVUsQ0FBQ0osY0FBYyxDQUFDSyxPQUFPLENBQUMsb0NBQW9DLENBQUMsQ0FBQztRQUMxRjtRQUNBO1FBQ0FULGNBQWMsR0FBR0Ys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