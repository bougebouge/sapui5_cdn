/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/fl/FlexControllerFactory",
	"sap/ui/fl/Utils"
], function(
	OldFlexControllerFactory,
	FlexUtils
) {
	"use strict";

	var ChangesController = {
		/**
		 * Returns the FlexController of the app component where the UI changes are saved
		 *
		 * @param {sap.ui.fl.Selector|string} vSelectorOrName - Selector object, managed object or component name to find the associated flex persistence
		 * @returns {sap.ui.fl.FlexController} Returns FlexController Instance of Component for changes
		 */
		getFlexControllerInstance: function(vSelectorOrName) {
			if (typeof vSelectorOrName === "string") {
				return OldFlexControllerFactory.create(vSelectorOrName);
			}
			var oManagedObject = vSelectorOrName.appComponent || vSelectorOrName;
			return OldFlexControllerFactory.createForControl(oManagedObject);
		},

		/**
		 * Returns the FlexController of the app component where the App Descriptor changes are saved
		 *
		 * @param {sap.ui.fl.Selector} vSelector - Selector object or app component for which the descriptor controller should be instantiated
		 * @returns {sap.ui.fl.FlexController} Returns FlexController Instance of Component for app descriptor changes
		 */
		getDescriptorFlexControllerInstance: function(vSelector) {
			if (typeof vSelector.appId === "string") {
				return OldFlexControllerFactory.create(vSelector.appId);
			}
			var oAppComponent = vSelector.appComponent || vSelector;
			var oAppDescriptorComponent = FlexUtils.getAppDescriptorComponentObjectForControl(oAppComponent);
			return OldFlexControllerFactory.create(oAppDescriptorComponent.name);
		},

		/**
		 * Returns the app component from the passed selector.
		 *
		 * @param {sap.ui.fl.Selector} vSelector - Selector object
		 * @returns {sap.ui.fl.FlexController} Returns the app component for the passed selector
		 */
		getAppComponentForSelector: function(vSelector) {
			if (typeof vSelector.appId === "string") {
				return vSelector;
			}
			return vSelector.appComponent || FlexUtils.getAppComponentForControl(vSelector);
		}

	};
	return ChangesController;
});