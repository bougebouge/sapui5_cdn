/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides control sap.ui.dt.test.report.Statistic.
sap.ui.define([
	"sap/ui/core/Control",
	"sap/ui/model/json/JSONModel",
	"sap/ui/layout/form/SimpleForm",
	"sap/m/Label",
	"sap/m/Text",
	"./StatisticRenderer"
], function (
	Control,
	JSONModel,
	SimpleForm,
	Label,
	Text,
	StatisticRenderer
) {
	"use strict";

	/**
	 * Constructor for a new Statistic report.
	 *
	 * @param {string} [sId] id for the new control, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new control
	 *
	 * @class
	 * The Statistic report can be used to visualize the design time tests.
	 * @extends sap.ui.core.Control
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.dt.enablement.report.Statistic
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var oStatistic = Control.extend("sap.ui.dt.enablement.report.Statistic", /** @lends sap.ui.dt.enablement.report.Statistic.prototype */ {
		metadata: {
			library: "sap.ui.dt",
			properties: {
				data: {
					type: "object"
				}
			},
			aggregations: {
				_form: {
					type: "sap.ui.layout.form.SimpleForm",
					hidden: true,
					multiple: false
				}
			}
		},


		init: function() {
			this._oModel = null;
			this.setAggregation("_form", this._createForm());
		},

		/**
		 * Called when the Statistic is destroyed
		 * @protected
		 */
		exit: function() {
			this.setData(null);
		},

		setData: function(oData) {
			if (this._oModel) {
				this._oModel.destroy();
				delete this._oModel;
			}
			if (oData) {
				this._oModel = new JSONModel(oData);
				this._getForm().setModel(this._oModel);
			} else {
				this._getForm().setModel(null);
			}
			this.setProperty("data", oData);
		},


		_createForm: function() {
			var oForm = new SimpleForm(this.getId() + "--form", {
				editable: false,
				title: "Statistics",
				content: [
					new Label(this.getId() + "--form-supported-label", {text: "Supported"}),
					new Text(this.getId() + "--form-supported-value", {text: "{/statistic/SUPPORTED}"}),
					new Label(this.getId() + "--form-partial-supported-label", {text: "Partial Supported"}),
					new Text(this.getId() + "--form-partial-supported-value", {text: "{/statistic/PARTIAL_SUPPORTED}"}),
					new Label(this.getId() + "--form-not-supported-label", {text: "Not Supported"}),
					new Text(this.getId() + "--form-not-supported-value", {text: "{/statistic/NOT_SUPPORTED}"}),
					new Label(this.getId() + "--form-unknown-label", {text: "Unknown"}),
					new Text(this.getId() + "--form-unknown-value", {text: "{/statistic/UNKNOWN}"}),
					new Label(this.getId() + "--form-error-label", {text: "Error"}),
					new Text(this.getId() + "--form-error-value", {text: "{/statistic/ERROR}"})
				]
			});
			return oForm;
		},

		_getForm: function() {
			return this.getAggregation("_form");
		},

		renderer: StatisticRenderer
	});

	return oStatistic;
});