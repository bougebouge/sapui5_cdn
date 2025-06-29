

/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// sap.ui.mdc.BaseDelegate
sap.ui.define(['sap/ui/mdc/util/TypeUtil'], function (TypeUtil) {
	"use strict";

	var BaseDelegate = {
		 /**
		 * Returns the typeutil attached to this delegate.
		 *
		 * <b>Note:</b> Can be overwritten by sub-modules.
		 *
		 * @param {object} oPayload Delegate payload object
		 * @return {sap.ui.mdc.util.TypeUtil} Any instance of TypeUtil
		 * @since 1.79.0
		 *
		 */
		getTypeUtil: function (oPayload) {
			return TypeUtil;
		}
	};

	return BaseDelegate;
});
