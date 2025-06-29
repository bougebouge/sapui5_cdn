/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/base/util/UriParameters",
	"sap/ui/thirdparty/hasher",
	"sap/ui/fl/Layer"
], function(
	UriParameters,
	hasher,
	Layer
) {
	"use strict";

	//Stack of layers in the layered repository
	var aLayers = [
		Layer.BASE,
		Layer.VENDOR,
		Layer.PARTNER,
		Layer.CUSTOMER_BASE,
		Layer.CUSTOMER,
		Layer.PUBLIC,
		Layer.USER
	];

	//Precalculates index of layers
	var mLayersIndex = {};
	aLayers.forEach(function(sLayer, iIndex) {
		mLayersIndex[sLayer] = iIndex;
	});

	function getUrlParameter(sParameter) {
		return UriParameters.fromQuery(window.location.search).get(sParameter);
	}

	/**
	 * Provides utility functions for the SAPUI5 flexibility library
	 *
	 * @namespace sap.ui.fl.LayerUtils
	 * @author SAP SE
	 * @version 1.108.28
	 */
	var LayerUtils = {
		_mLayersIndex: mLayersIndex,
		_sTopLayer: aLayers[aLayers.length - 1],
		FL_MAX_LAYER_PARAM: "sap-ui-fl-max-layer",

		/**
		 * Indicates if the passed layer is valid.
		 *
		 * @param {string} sLayer layer name
		 * @returns {boolean} <code>true</code> if the layer is valid
		 * @public
		 */
		isValidLayer: function (sLayer) {
			return Object.keys(Layer).some(function (sExistingLayer) {
				return sExistingLayer === sLayer;
			});
		},

		/**
		 * Indicates if the VENDOR is selected.
		 *
		 * @returns {boolean} true if it's an application variant
		 * @public
		 */
		isVendorLayer: function () {
			return this.getCurrentLayer() === Layer.VENDOR;
		},

		/**
		 * Returns whether provided layer is a customer dependent layer.
		 *
		 * @param {string} sLayerName layer name
		 * @returns {boolean} true if provided layer is customer dependent layer else false
		 * @public
		 */
		isCustomerDependentLayer: function(sLayerName) {
			return ([Layer.PUBLIC, Layer.CUSTOMER, Layer.CUSTOMER_BASE].indexOf(sLayerName) > -1);
		},

		/**
		 * Returns whether provided layer is a developer layer.
		 *
		 * @param {string} sLayer layer name
		 * @returns {boolean} true if provided layer is customer dependent layer else false
		 * @public
		 */
		isDeveloperLayer: function(sLayer) {
			return LayerUtils.compareAgainstCurrentLayer(sLayer, Layer.CUSTOMER) === -1;
		},

		/**
		 * Checks if a shared newly created variant requires an ABAP package; this is relevant for the VENDOR, PARTNER and CUSTOMER_BASE layers,
		 * whereas variants in the CUSTOMER layer are client-dependent content and can either be transported or stored as local objects ($TMP);
		 * A variant in the CUSTOMER layer that will be transported must not be assigned to a package.
		 *
		 * @returns {boolean} Indicates whether a new variant needs an ABAP package
		 * @public
		 */
		doesCurrentLayerRequirePackage: function () {
			var sCurrentLayer = this.getCurrentLayer();
			return (sCurrentLayer === Layer.VENDOR) || (sCurrentLayer === Layer.PARTNER) || (sCurrentLayer === Layer.CUSTOMER_BASE);
		},

		/**
		 * Determine the <code>maxLayer</code> based on the url parameter <code>sap-ui-fl-max-layer</code> or if is not set by <code>topLayer</code>.
		 *
		 * @ui5-restricted sap.ui.fl.apply._internal.Connector
		 * @param {sap.ui.core.service.Service} oURLParsingService Unified Shell URL Parsing Service
		 * @return {string} maxLayer
		 */
		getMaxLayer: function (oURLParsingService) {
			var sParseMaxLayer = LayerUtils.getMaxLayerTechnicalParameter(hasher.getHash(), oURLParsingService);
			return sParseMaxLayer || getUrlParameter(this.FL_MAX_LAYER_PARAM) || LayerUtils._sTopLayer;
		},

		/**
		 * Converts layer name into index.
		 *
		 * @param {string} sLayer layer name
		 * @returns {int} index of the layer
		 */
		getLayerIndex: function(sLayer) {
			return this._mLayersIndex[sLayer];
		},

		/**
		 * Determines whether a layer is higher than the max layer.
		 *
		 * @param {string} sLayer Layer name to be evaluated
		 * @param {sap.ui.core.service.Service} oURLParsingService Unified Shell URL Parsing Service
		 * @returns {boolean} <code>true</code> if input layer is higher than max layer, otherwise <code>false</code>
		 * @public
		 */
		isOverMaxLayer: function(sLayer, oURLParsingService) {
			return this.isOverLayer(sLayer, this.getMaxLayer(oURLParsingService));
		},

		/**
		 * Determines if the first passed layer passed is higher than the second passed layer.
		 *
		 * @param {string} sObjectsLayer Layer name to be evaluated
		 * @param {string} sComparedLayer Layer name to be compared against the first one
		 * @returns {boolean} <code>true</code> if the first input layer is higher than the second input layer, otherwise <code>false</code>
		 * @public
		 */
		isOverLayer: function (sObjectsLayer, sComparedLayer) {
			return this.getLayerIndex(sObjectsLayer) > this.getLayerIndex(sComparedLayer);
		},

		/**
		 * Compares current layer with a provided layer
		 * -1: Lower layer, 0: Same layer, 1: Layer above.
		 *
		 * @param {string} sLayer Layer name to be evaluated
		 * @param {string} [sCurrentLayer] Current layer name to be evaluated, if not provided the layer is taken from URL parameter
		 * @returns {int} -1: Lower layer, 0: Same layer, 1: Layer above
		 * @public
		 */
		compareAgainstCurrentLayer: function(sLayer, sCurrentLayer) {
			var sCurrent = sCurrentLayer || LayerUtils.getCurrentLayer();
			// If sLayer is undefined, it is assumed it be on the lowest layer
			if ((this.getLayerIndex(sCurrent) > this.getLayerIndex(sLayer)) || !sLayer) {
				return -1;
			} else if (this.getLayerIndex(sCurrent) === this.getLayerIndex(sLayer)) {
				return 0;
			}
			return 1;
		},

		/**
		 * Determines if filtering of changes based on layer is required.
		 *
		 * @returns {boolean} <code>true</code> if the top layer is also the max layer, otherwise <code>false</code>
		 * @param {sap.ui.core.service.Service} oURLParsingService Unified Shell URL Parsing Service
		 * @public
		 */
		isLayerFilteringRequired: function(oURLParsingService) {
			return this._sTopLayer !== this.getMaxLayer(oURLParsingService);
		},

		/**
		 * Determines if the sap-ui-layer parameter is set. This is required to avoid a circling
		 *
		 * @returns {boolean} <code>true</code> if the top layer is also the max layer, otherwise <code>false</code>
		 * @public
		 */
		isSapUiLayerParameterProvided: function () {
			return !!getUrlParameter("sap-ui-layer");
		},

		/**
		 * Returns the current layer as defined by the url parameter; if the end user flag is set, it always returns "USER".
		 *
		 * @returns {string} the current layer
		 * @public
		 */
		getCurrentLayer: function () {
			var sLayer = getUrlParameter("sap-ui-layer") || "";
			return sLayer.toUpperCase() || Layer.CUSTOMER;
		},

		/**
		 * The function loops over the array and filters the object if the layer property is higher than the current max layer.
		 *
		 * @param {object[]} aChangeDefinitions - Array of change definitions
		 * @param {sap.ui.core.service.Service} oURLParsingService Unified Shell URL Parsing Service
		 * @returns {object[]} Array of filtered change definitions
		 */
		filterChangeDefinitionsByMaxLayer: function(aChangeDefinitions, oURLParsingService) {
			return aChangeDefinitions.filter(function(oChangeDefinition) {
				return !oChangeDefinition.layer || !LayerUtils.isOverMaxLayer(oChangeDefinition.layer, oURLParsingService);
			});
		},

		/**
		 * Filters the passed Changes or change definitions and returns only the ones in the current layer
		 *
		 * @param {sap.ui.fl.Change|object[]} aChanges Array of Changes or ChangeDefinitions
		 * @param {string} sCurrentLayer Current Layer
		 * @returns {sap.ui.fl.Change|object[]} Array of filtered Changes
		 */
		filterChangeOrChangeDefinitionsByCurrentLayer: function(aChanges, sCurrentLayer) {
			if (!sCurrentLayer) {
				return aChanges;
			}

			return aChanges.filter(function(oChangeOrChangeContent) {
				var sChangeLayer = oChangeOrChangeContent.getLayer && oChangeOrChangeContent.getLayer() || oChangeOrChangeContent.layer;
				return sCurrentLayer === sChangeLayer;
			});
		},

		/**
		 * Returns max layer technical parameter from the passed hash if ushell is available
		 *
		 * @param {string} sHash Hash value
		 * @param {sap.ui.core.service.Service} oURLParsingService Unified Shell URL Parsing Service
		 * @returns {string|undefined} Max layer parameter value, if available
		 */
		getMaxLayerTechnicalParameter: function(sHash, oURLParsingService) {
			if (oURLParsingService) {
				var oParsedHash = oURLParsingService.parseShellHash(sHash) || {};
				if (oParsedHash.params && oParsedHash.params.hasOwnProperty(this.FL_MAX_LAYER_PARAM)) {
					return oParsedHash.params[this.FL_MAX_LAYER_PARAM][0];
				}
			}
			return undefined;
		}
	};
	return LayerUtils;
});
