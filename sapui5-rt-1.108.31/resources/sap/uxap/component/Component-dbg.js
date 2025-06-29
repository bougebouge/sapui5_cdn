/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/uxap/library",
	"sap/ui/core/UIComponent",
	"sap/ui/core/library",
	"sap/base/Log",
	"sap/ui/core/Component"
], function (library, UIComponent, coreLibrary, Log) {
	"use strict";

	// shortcut for sap.ui.core.mvc.ViewType
	var ViewType = coreLibrary.mvc.ViewType;

	// shortcut for sap.uxap.ObjectPageConfigurationMode
	var ObjectPageConfigurationMode = library.ObjectPageConfigurationMode;

	var Component = UIComponent.extend("sap.uxap.component.Component", {
		metadata: {
			/* nothing new compared to a standard UIComponent */
		},

		/**
		 * initialize the view containing the objectPageLayout
		 */
		init: function () {

			//step1: create model from configuration
			this._oModel = null;               //internal component model
			this._oViewConfig = {              //internal view configuration
				viewData: {
					component: this
				}
			};

			//step2: load model from the component configuration
			switch (this.oComponentData.mode) {
				case ObjectPageConfigurationMode.JsonURL:
					// jsonUrl bootstraps the ObjectPageLayout on a json config url jsonConfigurationURL
					// case 1: load from an XML view + json for the object page layout configuration
					this._oModel = new UIComponent(this.oComponentData.jsonConfigurationURL);
					this._oViewConfig.viewName = "sap.uxap.component.ObjectPageLayoutUXDrivenFactory";
					this._oViewConfig.type = ViewType.XML;
					break;
				case ObjectPageConfigurationMode.JsonModel:
					// JsonModel bootstraps the ObjectPageLayout from the external model objectPageLayoutMedatadata
					this._oViewConfig.viewName = "sap.uxap.component.ObjectPageLayoutUXDrivenFactory";
					this._oViewConfig.type = ViewType.XML;
					break;
				default:
					Log.error("UxAPComponent :: missing bootstrap information. Expecting one of the following: JsonURL, JsonModel and FacetsAnnotation");
			}
			//create the UIComponent
			UIComponent.prototype.init.call(this);
		},

		/**
		 * Create view corresponding to the chosen config
		 * @returns {sap.ui.view} Created view
		 */
		createContent: function () {
			var oController;

			//step3: create view
			this._oView = sap.ui.view(this._oViewConfig);

			//step4: bind the view with the model
			if (this._oModel) {
				oController = this._oView.getController();

				//some factory requires pre-processing once the view and model are created
				if (oController && oController.connectToComponent) {
					oController.connectToComponent(this._oModel);
				}

				//can now apply the model and rely on the underlying factory logic
				this._oView.setModel(this._oModel, "objectPageLayoutMetadata");
			}

			return this._oView;
		},

		/**
		 * traps propagated properties for postprocessing on useExternalModel cases
		 * @param {*} vName the name of the property
		 * @returns {*} result of the function
		 */
		propagateProperties: function (vName) {

			if (this.oComponentData.mode === ObjectPageConfigurationMode.JsonModel) {
				var oController = this._oView.getController();

				//some factory requires post-processing once the view and model are created
				if (oController && oController.connectToComponent) {
					oController.connectToComponent(this.getModel("objectPageLayoutMetadata"));
				}
			}
			return UIComponent.prototype.propagateProperties.apply(this, arguments);
		},

		/**
		 * destroy the view and model before exiting
		 */
		destroy: function () {
			if (this._oView) {
				this._oView.destroy();
				this._oView = null;
			}

			if (this._oModel) {
				this._oModel.destroy();
				this._oModel = null;
			}

			if (UIComponent.prototype.destroy) {
				UIComponent.prototype.destroy.call(this);
			}
		}
	});

	return Component;
});