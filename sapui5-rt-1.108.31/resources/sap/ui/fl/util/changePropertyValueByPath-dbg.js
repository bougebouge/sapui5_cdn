/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/base/util/ObjectPath"
], function(
	ObjectPath
) {
	"use strict";

	function setPropValueByPath(oEntityProp, oRoot) {
		var aPath = oEntityProp.propertyPath.split("/");
		var valueByPath = ObjectPath.get(aPath, oRoot);

		if (valueByPath && oEntityProp.operation === "INSERT") {
			throw new Error("Path has already a value. 'INSERT' operation is not appropriate.");
		}
		if (!valueByPath && oEntityProp.operation === "UPDATE") {
			throw new Error("Path does not contain a value. 'UPDATE' operation is not appropriate.");
		}

		ObjectPath.set(aPath, oEntityProp.propertyValue, oRoot);
	}

	/**
	 * Use to update property value for propertyPath which starts in provided root context
	 *
	 * @param {sap.ui.fl.Change[]|sap.ui.fl.Change} vChanges - Changes to be merged which includes propertyPath and propertyValue
	 * @param {string} oRootPath - root context where the propertyPath starts
	 * @ui5-restricted sap.ui.fl, sap.suite.ui.generic.template
	 */
	return function (vChanges, oRootPath) {
		if (Array.isArray(vChanges)) {
			vChanges.forEach(function (oEntityProp) {
				setPropValueByPath(oEntityProp, oRootPath);
			});
		} else {
			setPropValueByPath(vChanges, oRootPath);
		}
	};
});
