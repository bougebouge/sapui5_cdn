/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/ui/base/ManagedObject",
	"sap/base/Log",
	"sap/ui/model/Model",
	"sap/ui/integration/util/BindingHelper",
	"sap/base/util/extend",
	"sap/base/util/isPlainObject"
], function (ManagedObject, Log, Model, BindingHelper, extend, isPlainObject) {
		"use strict";

		/**
		 * Simple class used to resolved bindings.
		 */
		var SimpleControl = ManagedObject.extend("sap.ui.integration.util.SimpleControl", {
			metadata: {
				library: "sap.ui.integration",
				properties: {
					resolved: {
						type: "any"
					}
				}
			}
		});

		var oSimpleControl = new SimpleControl();

		/**
		 * Resolves a binding syntax based on a provided model and path.
		 *
		 * @author SAP SE
		 * @version 1.108.28
		 *
		 * @private
		 * @alias sap.ui.integration.util.BindingResolver
		 */
		var BindingResolver = {};

		/**
		 * Resolves all binding syntaxes and binding infos recursively.
		 * The function is pure and won't modify 'vValue' if it is object or array. It will return new one instead.
		 *
		 * @param {*} vValue The value to resolve.
		 * @param {*} vModelOrObject The model.
		 * @param {string} [sPath] The path to take.
		 * @param {number} iCurrentLevel The current level of recursion.
		 * @param {number} iMaxLevel The maximum level of recursion.
		 * @private
		 * @returns {*} The resolved value.
		 */
		function process(vValue, vModelOrObject, sPath, iCurrentLevel, iMaxLevel) {

			if (iCurrentLevel === iMaxLevel) {
				Log.warning("BindingResolver maximum level processing reached. Please check for circular dependencies.");
				return vValue;
			}

			// iterates arrays
			if (Array.isArray(vValue)) {
				return vValue.map(function(vItem) {
					return process(vItem, vModelOrObject, sPath, iCurrentLevel + 1, iMaxLevel);
				});
			}

			// iterates objects
			if (vValue && isPlainObject(vValue) && !BindingResolver.isBindingInfo(vValue)) {
				var oNewObj = {};
				for (var sProp in vValue) {
					oNewObj[sProp] = process(vValue[sProp], vModelOrObject, sPath, iCurrentLevel + 1, iMaxLevel);
				}
				return oNewObj;
			}

			// resolves strings that might contain binding syntax or objects that are binding infos
			if (typeof vValue === "string" || (typeof vValue === "object" && BindingResolver.isBindingInfo(vValue))) {
				return resolveBinding(vValue, vModelOrObject, sPath);
			}

			return vValue;
		}

		/**
		 * Resolves a single string that has binding syntax or object that represents a binding info.
		 * Pure function.
		 *
		 * @param {string|object} vBinding The value to resolve. If the value is an object, it will be copied and the real one won't be modified.
		 * @param {*} vModelOrObject The model.
		 * @param {string} [sPath] The path to the referenced entity which is going to be used as a binding context.
		 * @private
		 * @returns {*} The resolved value.
		 */
		function resolveBinding(vBinding, vModelOrObject, sPath) {
			if (!vBinding) {
				return vBinding;
			}

			var oBindingInfo = typeof vBinding ===  "string" ? ManagedObject.bindingParser(vBinding) : extend({}, vBinding);

			if (!oBindingInfo) {
				return vBinding;
			}

			if (!sPath) {
				sPath = "/";
			}

			// clean the object
			oSimpleControl.unbindProperty("resolved");
			oSimpleControl.unbindObject();
			oSimpleControl.setModel(null);

			if (vModelOrObject instanceof Model) {
				oSimpleControl.setModel(vModelOrObject);
			} else {
				BindingHelper.propagateModels(vModelOrObject, oSimpleControl);
			}

			oSimpleControl.bindObject(sPath);
			oSimpleControl.bindProperty("resolved", oBindingInfo);

			var vValue = oSimpleControl.getResolved();

			return vValue;
		}

		/**
		 * Resolves a binding syntax.
		 * NOTE: This will only work with one unnamed model.
		 *
		 * @param {*} vValue The value to resolve.
		 * @param {*} vModelOrObject The model.
		 * @param {string} [sPath] The path to the referenced entity which is going to be used as a binding context.
		 * @private
		 * @returns {*} The resolved value.
		 */
		BindingResolver.resolveValue = function (vValue, vModelOrObject, sPath) {
			var iCurrentLevel = 0,
				iMaxLevel = 30;

			if (vModelOrObject) {
				return process(vValue, vModelOrObject, sPath, iCurrentLevel, iMaxLevel);
			} else {
				return vValue;
			}
		};

		/**
		 * Checks if object is a binding info.
		 *
		 * @param {object} oObj The object to check.
		 * @returns {boolean} Whether the object represents a binding info.
		 */
		BindingResolver.isBindingInfo = function (oObj) {

			if (!oObj) {
				return false;
			}

			return oObj.hasOwnProperty("path") || (oObj.hasOwnProperty("parts") && (oObj.hasOwnProperty("formatter") || oObj.hasOwnProperty("binding")));
		};

		return BindingResolver;
	});
