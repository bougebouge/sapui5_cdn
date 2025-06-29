/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define(function () {
	"use strict";

	/**
	 * Provides functionality to get and set selection on controls.
	 *
	 * @namespace
	 * @name sap.ui.rta.service.Selection
	 * @author SAP SE
	 * @experimental Since 1.58
	 * @since 1.58
	 * @version 1.108.28
	 * @private
	 * @ui5-restricted
	*/

	return function (oRta, fnPublish) {
		var oSelectionManager = oRta._oDesignTime.getSelectionManager();

		function getControlIds(aElementOverlays) {
			return aElementOverlays.map(function (oElementOverlay) {
				return oElementOverlay.getElement().getId();
			});
		}

		oSelectionManager.attachEvent("change", function (oEvent) {
			fnPublish("change", getControlIds(oEvent.getParameter("selection")));
		});

		return {
			/**
			 * @desc Attached listeners are notified of any modifications to existing selection.
			 * @event sap.ui.rta.service.Selection.change
			 * @public
			 */
			events: ["change"],
			exports: {
				/**
				 * Gets list of currently selected controls.
				 *
				 * @method sap.ui.rta.service.Selection.get
				 * @return {string[]} Selected control IDs
				 * @public
				 */
				get: function () {
					return getControlIds(oSelectionManager.get());
				},

				/**
				 * Deselects the current selection and selects the specified list of controls.
				 *
				 * @method sap.ui.rta.service.Selection.set
				 * @param {string|string[]} vControlIds - Control IDs to be selected
				 * @return {boolean} <code>true</code> if the selection has changed
				 * @public
				 */
				set: oSelectionManager.set.bind(oSelectionManager),

				/**
				 * Adds the specified controls to the current selection.
				 *
				 * @method sap.ui.rta.service.Selection.add
				 * @param {string|string[]} vControlIds - Control IDs to be selected
				 * @return {boolean} <code>true</code> if the selection has changed
				 * @public
				 */
				add: oSelectionManager.add.bind(oSelectionManager),

				/**
				 * Removes the selection from the specified controls.
				 *
				 * @method sap.ui.rta.service.Selection.remove
				 * @param {string|string[]} vControlIds - Control IDs from which to remove the selection
				 * @return {boolean} <code>true</code> if the selection has changed
				 * @public
				 */
				remove: oSelectionManager.remove.bind(oSelectionManager),

				/**
				 * Resets the current selection.
				 *
				 * @method sap.ui.rta.service.Selection.reset
				 * @returns {boolean} <code>true</code> if completed successfully (<code>false</code> if there is nothing to reset)
				 * @public
				 */
				reset: oSelectionManager.reset.bind(oSelectionManager)
			}
		};
	};
});