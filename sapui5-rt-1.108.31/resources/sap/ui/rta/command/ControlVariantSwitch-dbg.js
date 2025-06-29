/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/rta/command/BaseCommand",
	"sap/ui/core/util/reflection/JsControlTreeModifier",
	"sap/ui/fl/Utils"
], function(
	BaseCommand,
	JsControlTreeModifier,
	flUtils
) {
	"use strict";

	/**
	 * Switch control variants
	 *
	 * @class
	 * @extends sap.ui.rta.command.BaseCommand
	 * @author SAP SE
	 * @version 1.108.28
	 * @constructor
	 * @private
	 * @since 1.50
	 * @alias sap.ui.rta.command.ControlVariantSwitch
	 */
	var ControlVariantSwitch = BaseCommand.extend("sap.ui.rta.command.ControlVariantSwitch", {
		metadata: {
			library: "sap.ui.rta",
			properties: {
				targetVariantReference: {
					type: "string"
				},
				sourceVariantReference: {
					type: "string"
				}
			},
			associations: {},
			events: {}
		}
	});

	ControlVariantSwitch.prototype._getAppComponent = function () {
		var oElement = this.getElement();
		return oElement ? flUtils.getAppComponentForControl(oElement) : this.getSelector().appComponent;
	};


	/**
	 * Template Method to implement execute logic, with ensure precondition Element is available.
	 * @public
	 * @returns {Promise} Returns resolve after execution
	 */
	ControlVariantSwitch.prototype.execute = function() {
		var oElement = this.getElement();
		var oAppComponent = this._getAppComponent();
		var sNewVariantReference = this.getTargetVariantReference();

		this.oModel = oAppComponent.getModel(flUtils.VARIANT_MODEL_NAME);
		this.sVariantManagementReference = JsControlTreeModifier.getSelector(oElement, oAppComponent).id;
		return this._updateModelVariant(sNewVariantReference, oAppComponent);
	};

	/**
	 * Template Method to implement undo logic.
	 * @public
	 * @returns {Promise} Returns resolve after undo
	 */
	ControlVariantSwitch.prototype.undo = function() {
		var sOldVariantReference = this.getSourceVariantReference();
		var oAppComponent = this._getAppComponent();
		return this._updateModelVariant(sOldVariantReference, oAppComponent);
	};

	ControlVariantSwitch.prototype._updateModelVariant = function (sVariantReference, oAppComponent) {
		if (this.getTargetVariantReference() !== this.getSourceVariantReference()) {
			return this.oModel.updateCurrentVariant({
				variantManagementReference: this.sVariantManagementReference,
				newVariantReference: sVariantReference,
				appComponent: oAppComponent
			});
		}
		return Promise.resolve();
	};

	return ControlVariantSwitch;
});
