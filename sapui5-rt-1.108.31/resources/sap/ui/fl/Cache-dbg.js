/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/fl/apply/_internal/flexState/FlexState",
	"sap/ui/fl/Utils",
	"sap/base/Log"
],
function(
	FlexState,
	Utils,
	Log
) {
	"use strict";

	/**
	 * Helper object to access a change from the back end.
	 * Access helper object for each change (and variant) fetched from the back end
	 *
	 * @namespace
	 * @alias sap.ui.fl.Cache
	 * @experimental Since 1.25.0
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var Cache = function() {};

	function _getArray(sComponentName, oChange) {
		var mStorageResponse = FlexState.getFlexObjectsFromStorageResponse(sComponentName);

		if (oChange.fileType === "variant") {
			return mStorageResponse.comp.variants;
		}
		if (oChange.selector && oChange.selector.persistencyKey) {
			return mStorageResponse.comp.changes;
		}
		return mStorageResponse.changes;
	}

	function _concatControlVariantIdWithCacheKey(sCacheKey, sControlVariantIds) {
		if (!sControlVariantIds) {
			return sCacheKey;
		}
		return sCacheKey === Cache.NOTAG ?
			sCacheKey.replace(/>$/, ''.concat('-', sControlVariantIds, '>')) :
			sCacheKey.concat('-', sControlVariantIds);
	}

	function _trimEtag(sCacheKey) {
		return sCacheKey.replace(/(^W\/|")/g, '');
	}

	Cache.NOTAG = "<NoTag>";

	/**
	 * Clears whole entries stored in the cache.
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	Cache.clearEntries = function() {
		// TODO remove.. (used in tests)
		FlexState.clearState();
	};

	/**
	 * Gets the data from the FlexState for a given reference.
	 * If bInvalidateCache is set the FlexState is cleared and the data is fetched again.
	 *
	 * @param {map} mComponent - Contains component data needed for reading changes
	 * @param {string} mComponent.name - Name of the component
	 * @param {object} [mPropertyBag] - Contains additional data needed for reading changes
	 * @param {string} [mPropertyBag.componentId] - ID of the current component, needed if bInvalidataCache is set
	 * @param {boolean} bInvalidateCache - should the cache be invalidated
	 * @returns {Promise} resolves with the change file for the given component, either from cache or back end
	 */
	Cache.getChangesFillingCache = function(mComponent, mPropertyBag, bInvalidateCache) {
		var oPromise = Promise.resolve();
		if (bInvalidateCache) {
			oPromise = FlexState.clearAndInitialize(mPropertyBag);
		}

		return oPromise.then(function() {
			return FlexState.getStorageResponse(mComponent.name);
		})
		.catch(function() {
			return {};
		});
	};

	/**
	 * Function to retrieve the cache key of the SAPUI5 flexibility request of a given application
	 *
	 * @param {map} mComponent - component map
	 * @param {string} mComponent.name - Name of the application component
	 * @param {object} oAppComponent - Application component
	 * @return {Promise} Returns the promise resolved with the determined cache key
	 *
	 * @private
	 * @ui5-restricted sap.ui.fl
	 *
	 */
	Cache.getCacheKey = function(mComponent, oAppComponent) {
		if (!mComponent || !mComponent.name || !oAppComponent) {
			Log.warning("Not all parameters were passed to determine a flexibility cache key.");
			return Promise.resolve(Cache.NOTAG);
		}
		return this.getChangesFillingCache(mComponent)
			.then(function(oWrappedChangeFileContent) {
				if (oWrappedChangeFileContent && oWrappedChangeFileContent.cacheKey) {
					return _trimEtag(oWrappedChangeFileContent.cacheKey);
				}

				return Cache.NOTAG;
			})
			.then(function(sCacheKey) {
				// concat current control variant ids to cachekey if available
				var oVariantModel = oAppComponent.getModel(Utils.VARIANT_MODEL_NAME);
				var aCurrentControlVariantIds = oVariantModel ? oVariantModel.getCurrentControlVariantIds() : [];
				return _concatControlVariantIdWithCacheKey(sCacheKey, aCurrentControlVariantIds.join("-"));
			});
	};

	/**
	 * Add a change for the given component to the cached changes.
	 *
	 * @param {object} oComponent - Contains component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {object} oChange - The change in JSON format
	 */
	Cache.addChange = function(oComponent, oChange) {
		var aChanges = _getArray(oComponent.name, oChange);

		if (!aChanges) {
			return;
		}
		aChanges.push(oChange);
	};

	/**
	 * Updates a change for the given component in the cached changes.
	 *
	 * @param {object} oComponent - Contains component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {object} oChange - The change in JSON format
	 */
	Cache.updateChange = function(oComponent, oChange) {
		var aChanges = _getArray(oComponent.name, oChange);

		if (!aChanges) {
			return;
		}

		for (var i = 0; i < aChanges.length; i++) {
			if (aChanges[i].fileName === oChange.fileName) {
				aChanges.splice(i, 1, oChange);
				break;
			}
		}
	};

	/**
	 * Delete a change for the given component from the cached changes.
	 *
	 * @param {object} oComponent - Contains component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {object} oChange - The change in JSON format
	 */
	Cache.deleteChange = function(oComponent, oChange) {
		var aChanges = _getArray(oComponent.name, oChange);

		if (!aChanges) {
			return;
		}

		for (var i = 0; i < aChanges.length; i++) {
			if (aChanges[i].fileName === oChange.fileName) {
				aChanges.splice(i, 1);
				break;
			}
		}
	};

	/**
	 * Remove changes for the given component from the cached changes.
	 *
	 * @param {object} oComponent - Component data needed for adding change
	 * @param {string} oComponent.name - Name of the component
	 * @param {string[]} aChangeNames - Array of names of the changes to be deleted
	 */
	Cache.removeChanges = function(oComponent, aChangeNames) {
		var oEntry = FlexState.getFlexObjectsFromStorageResponse(oComponent.name);

		if (!oEntry) {
			return;
		}

		oEntry.changes = oEntry.changes.filter(function(oChange) {
			return aChangeNames.indexOf(oChange.fileName) === -1;
		});

		var oVariantsState = FlexState.getVariantsState(oComponent.name);
		Object.keys(oVariantsState).forEach(function(sId) {
			oVariantsState[sId].variants.forEach(function(oVariant) {
				oVariant.controlChanges = oVariant.controlChanges.filter(function(oChange) {
					return aChangeNames.indexOf(oChange.getId()) === -1;
				});
			});
		});
	};

	return Cache;
}, /* bExport= */true);