/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/core/Element", "sap/ui/mdc/mixin/DelegateMixin", "sap/ui/mdc/mixin/PropertyHelperMixin", "sap/ui/mdc/mixin/AdaptationMixin"
], function(CoreElement, DelegateMixin, PropertyHelperMixin, AdaptationMixin) {
	"use strict";

	/**
 	 * Creates and initializes a new MDC element with the given <code>sId</code> and settings.
	 *
	 * @param {string} [sId] Optional ID for the new element; generated automatically if no non-empty ID is given
	 *      Note: this can be omitted, no matter whether <code>mSettings</code> will be given or not!
	 * @param {object} [mSettings] Object with initial settings for the new control
	 *
	 * @class The base class for MDC composite elements providing delegate-related functionality (see {@link sap.ui.mdc.mixin.DelegateMixin}).
	 *
	 * @extends sap.ui.core.Element
	 * @abstract
	 * @author SAP SE
	 * @version 1.108.28
	 * @alias sap.ui.mdc.Element
	 *
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.awaitControlDelegate as awaitControlDelegate
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.getControlDelegate as getControlDelegate
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.getPayload as getPayload
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.getTypeUtil as getTypeUtil
	 * @borrows sap.ui.mdc.mixin.DelegateMixin.initControlDelegate as initControlDelegate
	 *
	 * @borrows sap.ui.mdc.mixin.PropertyHelperMixin.initPropertyHelper as initPropertyHelper
	 * @borrows sap.ui.mdc.mixin.PropertyHelperMixin.awaitPropertyHelper as awaitPropertyHelper
	 * @borrows sap.ui.mdc.mixin.PropertyHelperMixin.getPropertyHelper as getPropertyHelper
	 * @borrows sap.ui.mdc.mixin.PropertyHelperMixin.finalizePropertyHelper as finalizePropertyHelper
	 * @borrows sap.ui.mdc.mixin.PropertyHelperMixin.isPropertyHelperFinal as isPropertyHelperFinal
     *
	 * @borrows sap.ui.mdc.mixin.AdaptationMixin.getEngine as getInstance
	 * @borrows sap.ui.mdc.mixin.AdaptationMixin.retrieveInbuiltFilter as retrieveInbuiltFilter
 	 * @borrows sap.ui.mdc.mixin.AdaptationMixin.getInbuiltFilter as getInbuiltFilter
	 *
	 * @private
	 * @since 1.74
	 * @experimental As of version 1.74
	 * @ui5-restricted sap.ui.mdc
	 */
	var Element = CoreElement.extend("sap.ui.mdc.Element", /** @lends sap.ui.mdc.Element.prototype */ {
		metadata: {
			library: "sap.ui.mdc",
			properties: {
				/**
				 * Path to the <code>Delegate</code> module that provides the required APIs to execute model-specific logic.<br>
				 * <b>Note:</b> Ensure that the related file can be requested (any required library has to be loaded before that).<br>
				 * Do not bind or modify the module. This property can only be configured during control initialization.
				 *
				 * @experimental
				 */
				delegate: {
					type: "object",
					group: "Data"
				}
			}
		},
		renderer: CoreElement.renderer
	});

	DelegateMixin.call(Element.prototype);
	AdaptationMixin.call(Element.prototype);
	PropertyHelperMixin.call(Element.prototype);

	return Element;
});
