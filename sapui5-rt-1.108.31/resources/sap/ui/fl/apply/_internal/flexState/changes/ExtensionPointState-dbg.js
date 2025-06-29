/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/base/util/restricted/_omit",
	"sap/base/util/merge",
	"sap/base/Log",
	"sap/ui/fl/apply/_internal/changes/Utils",
	"sap/ui/fl/write/api/ChangesWriteAPI",
	"sap/ui/fl/ChangePersistenceFactory"
], function(
	_omit,
	merge,
	Log,
	ChangesUtils,
	ChangesWriteAPI,
	ChangePersistenceFactory
) {
	"use strict";

	/**
	 * Handler class to manipulate extension point changes.
	 * Extension point changes are extended by the extension point information that is required when the flex change is applied.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexState.changes.ExtensionPointState
	 * @experimental Since 1.79
	 * @since 1.79
	 * @version 1.108.28
	 * @private
	 * @ui5-restricted
	 */
	var ExtensionPointState = {};

	function isChangeValidForExtensionPoint(mPropertyBag, oChange) {
		if (oChange.getSelector().name !== mPropertyBag.extensionPointName) {
			return false;
		}
		return ChangesUtils.filterChangeByView(mPropertyBag, oChange);
	}

	function isValidForRuntimeOnlyChanges(oChange, mExtensionPointInfo) {
		if (mExtensionPointInfo.fragmentId) {
			var oExtensionPointFromChange = oChange.getExtensionPointInfo && oChange.getExtensionPointInfo();
			if (oExtensionPointFromChange) {
				return mExtensionPointInfo.fragmentId !== oExtensionPointFromChange.fragmentId;
			}
			return true;
		}
		return false;
	}

	function replaceChangeSelector(oChange, oExtensionPoint, bOriginalSelectorNeedsToBeAdjusted) {
		var mSelector = oChange.getSelector();
		if (oExtensionPoint.closestAggregationBindingCarrier && oExtensionPoint.closestAggregationBinding) {
			// processing for extension points positioned into an aggregation template
			mSelector = merge(mSelector, {
				id: oExtensionPoint.closestAggregationBindingCarrier,
				idIsLocal: false
			});
			var mOriginalSelector = {
				id: oExtensionPoint.targetControl.getId(),
				idIsLocal: false
			};
			if (bOriginalSelectorNeedsToBeAdjusted) {
				oChange.originalSelectorToBeAdjusted = mOriginalSelector;
			} else {
				oChange.setDependentSelector({originalSelector: mOriginalSelector});
			}
			oChange.setContent({boundAggregation: oExtensionPoint.closestAggregationBinding});
		} else {
			mSelector = merge(mSelector, {
				id: oExtensionPoint.targetControl.getId(),
				idIsLocal: false
			});
		}
		oChange.setSelector(mSelector);
	}

	/**
	 * Gets the changes for the given extension point.
	 *
	 * @param {object} oChangePersistence - Change persistence to get changes from
	 * @param {object} mPropertyBag - Additional data that are needed to read the changes
	 * @param {string} mPropertyBag.viewId - ID of the view
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component for the extension point
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Responsible modifier
	 * @param {string} mPropertyBag.extensionPointName - Name of the extension point
	 * @returns {Promise} Promise that resolves with an array of changes
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal.extensionPoint.Processor
	 */
	ExtensionPointState.getChangesForExtensionPoint = function(oChangePersistence, mPropertyBag) {
		if (!mPropertyBag.extensionPointName) {
			Log.error("Missing name from extension point info!");
			return Promise.resolve([]);
		}
		return oChangePersistence.getChangesForComponent()
			.then(function(aChanges) {
				return aChanges.filter(isChangeValidForExtensionPoint.bind(undefined, mPropertyBag));
			});
	};

	/**
	 * Enhances the extension point changes by extension point information and selector.
	 *
	 * @param {object} mPropertyBag - Object with parameters as properties
	 * @param {sap.ui.core.Component} mPropertyBag.appComponent - Application component
	 * @param {sap.ui.core.util.reflection.BaseTreeModifier} mPropertyBag.modifier - Manifest that belongs to current component
	 * @param {string} mPropertyBag.viewId - View ID
	 * @param {object} mPropertyBag.targetControl - Target control instance
	 * @param {object} mExtensionPointInfo - Map of extension point information
	 * @returns {Promise} Promise that resolves with enhanced extension point changes if available, or is rejected if an error occurs
	 *
	 * @private
	 * @ui5-restricted
	 */
	ExtensionPointState.enhanceExtensionPointChanges = function (mPropertyBag, mExtensionPointInfo) {
		mPropertyBag.extensionPointName = mExtensionPointInfo.name;
		var oChangePersistence = ChangePersistenceFactory.getChangePersistenceForControl(mExtensionPointInfo.targetControl);

		return ExtensionPointState.getChangesForExtensionPoint(oChangePersistence, mPropertyBag)
			.then(function (aChanges) {
				var aPromises = [];
				aChanges.forEach(function (oChange) {
					//Only continue process if the change has not been applied, such as in case of XMLPreprocessing of an async view
					if (oChange.isInInitialState() && !(oChange.getExtensionPointInfo && oChange.getExtensionPointInfo())) {
						oChange.setExtensionPointInfo(mExtensionPointInfo);

						//Set correct selector from extension point targetControl's ID
						replaceChangeSelector(oChange, mExtensionPointInfo, false);

						//If the component creation is async, the changesMap already created without changes on EP --> it need to be updated
						//Otherwise, update the selector of changes is enough, change map will be created later correctly
						if (oChangePersistence.isChangeMapCreated()) {
							oChangePersistence.addChangeAndUpdateDependencies(mPropertyBag.appComponent, oChange);
						}
					} else if (isValidForRuntimeOnlyChanges(oChange, mExtensionPointInfo)) {
						//Change is applied but we need to create additional runtime only changes
						//in case of duplicate extension points with different fragment id (fragment as template)
						var oChangeFileContent = oChange.convertToFileContent();
						var oChangeContent = oChange.getContent();
						var mChangeSpecificData = _omit(oChangeFileContent, ["dependentSelector", "fileName", "selector", "content"]);
						Object.keys(oChangeContent).forEach(function (sKey) {
							mChangeSpecificData[sKey] = oChangeContent[sKey];
						});
						mChangeSpecificData.support.sourceChangeFileName = oChange.getId() || "";
						aPromises.push(ChangesWriteAPI.create({
							changeSpecificData: mChangeSpecificData,
							selector: {
								view: mExtensionPointInfo.view,
								name: mExtensionPointInfo.name
							}
						})
							.then(function (oRuntimeOnlyChange) {
								//Set correct selector from extension point targetControl's ID
								replaceChangeSelector(oRuntimeOnlyChange, mExtensionPointInfo, true);
								oRuntimeOnlyChange.setExtensionPointInfo(mExtensionPointInfo);
								oRuntimeOnlyChange.setModuleName(oChange.getModuleName());
								oRuntimeOnlyChange.setCreation(oChange.getCreation());
								oChangePersistence.addChangeAndUpdateDependencies(mPropertyBag.appComponent, oRuntimeOnlyChange, oChange);
							})
						);
					}
				});
				return Promise.all(aPromises)
					.then(function () {
						return aChanges;
					});
			});
	};

	return ExtensionPointState;
});