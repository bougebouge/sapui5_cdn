sap.ui.define([
    "sap/m/Dialog",
    "sap/m/Button",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/mvc/ViewType",
    "sap/ui/model/resource/ResourceModel",
    "sap/ovp/app/resources",
    "sap/base/util/merge",
    "sap/ui/core/mvc/XMLView",
    "sap/ui/core/Core"
], function (
    Dialog, 
    Button, 
    JSONModel, 
    ViewType, 
    ResourceModel, 
    OvpResources, 
    merge,
    XMLView,
    Core
) {
    "use strict";

    var oAppSettingsUtils = {
        dialogBox: undefined,
        oSaveButton: undefined,
        oResetButton: undefined,
        oOvpResourceBundle: Core.getLibraryResourceBundle("sap.ovp"),
        getDialogBox: function (oComponentContainer) {
            return new Promise(function (resolve, reject) {
                var oOriginalAppLevelSettings, oAppLevelSettings, oAppSettingsView,
                    oAppLevelSettingsModel;
                if (!this.dialogBox) {
                    // settings dialog save button
                    // Attached this button to 'this' scope to get it in setting controller and attach save
                    // function to it.
                    this.oSaveButton = new Button({
                        text: OvpResources && OvpResources.getText("save"),
                        type: "Emphasized"
                    });
                    // settings dialog close button
                    var oCancelButton = new Button({
                        text: OvpResources && OvpResources.getText("cancelBtn")
                    });
                    this.oResetButton = new Button({
                        text: OvpResources && OvpResources.getText("resetButton")
                    });
                    // settings dialog
                    this.dialogBox = new Dialog({
                        title: OvpResources && OvpResources.getText("settingsDialogTitle"),
                        buttons: [this.oSaveButton, oCancelButton, this.oResetButton],
                        // destroy the view on close of dialog (?)
                        // TODO: confirm if we can just destroy the card component, rest of the things can be updated via model data binding
                        afterClose: function (oEvent) {
                            this.dialogBox.destroyContent();
                        }.bind(this)
                    });
                    this.dialogBox.addStyleClass("sapOvpSettingsDialogBox");
                    this.dialogBox.setBusyIndicatorDelay(0);
                    oCancelButton.attachPress(function (oEvent) {
                        this.dialogBox.close();
                    }.bind(this));
                }
                if (oComponentContainer.getParent()) {
                    oOriginalAppLevelSettings = oComponentContainer.getParent().getModel("ui").getData();
                    oAppLevelSettings = merge({}, oOriginalAppLevelSettings);
                    var oModel = oComponentContainer.getModel(oAppLevelSettings.globalFilterModel),
                        oMetaModel = oModel.getMetaModel(),
                        aEntitySet = oMetaModel.getODataEntityContainer().entitySet;
                    oAppLevelSettings["allEntityTypes"] = [];
                    for (var i = 0; aEntitySet && i < aEntitySet.length; i++) {
                        var sEntityTypeName = aEntitySet[i].entityType;
                        oAppLevelSettings["allEntityTypes"].push({ 
                            name: oMetaModel.getODataEntityType(sEntityTypeName).name 
                        });
                    }
                    if (oAppLevelSettings.globalFilterEntityType) {
                        oAppLevelSettings.showGlobalFilters = true;
                    } else {
                        oAppLevelSettings.showGlobalFilters = false;
                    }
                    if (!oAppLevelSettings.containerLayout) {
                        oAppLevelSettings.containerLayout = "fixed";
                    }
                    oAppLevelSettingsModel = new JSONModel(oAppLevelSettings);
                    oAppSettingsView = new XMLView("appSettingsView", {
                        viewName: "sap.ovp.cards.rta.AppSettingsDialog",
                        type: ViewType.XML
                    });
                    oAppSettingsView.setModel(oAppLevelSettingsModel);

                    var oOvpResourceModel = this.oOvpResourceBundle ? OvpResources.oResourceModel : null;
                    oAppSettingsView.setModel(oOvpResourceModel, "ovpResourceModel");

                    this.dialogBox.addContent(oAppSettingsView);
                    oAppSettingsView.loaded().then(function (oView) {
                        resolve(this.dialogBox);
                    }.bind(this));
                }
            }.bind(this));
        }
    };

    return oAppSettingsUtils;
}, /* bExport= */true);
