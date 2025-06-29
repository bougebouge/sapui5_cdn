/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/extend",
	"sap/ui/core/format/NumberFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType"
], function (Log, extend, NumberFormat, FormatException, ParseException, ValidateException,
		ODataType) {
	"use strict";

	/**
	 * Returns the formatter. Creates it lazily.
	 * @param {sap.ui.model.odata.type.Int} oType
	 *   the type instance
	 * @returns {sap.ui.core.format.NumberFormat}
	 *   the formatter
	 */
	function getFormatter(oType) {
		var oFormatOptions;

		if (!oType.oFormat) {
			oFormatOptions = extend({groupingEnabled : true}, oType.oFormatOptions);
			oType.oFormat = NumberFormat.getIntegerInstance(oFormatOptions);
		}
		return oType.oFormat;
	}

	/**
	 * Fetches a text from the message bundle and formats it using the parameters.
	 *
	 * @param {string} sKey
	 *   the message key
	 * @param {any[]} aParams
	 *   the message parameters
	 * @returns {string}
	 *   the message
	 */
	function getText(sKey, aParams) {
		return sap.ui.getCore().getLibraryResourceBundle().getText(sKey, aParams);
	}

	/**
	 * Sets the constraints.
	 *
	 * @param {sap.ui.model.odata.type.Int} oType
	 *   the type instance
	 * @param {object} [oConstraints]
	 *   constraints, see {@link #constructor}
	 */
	function setConstraints(oType, oConstraints) {
		var vNullable;

		oType.oConstraints = undefined;
		if (oConstraints) {
			vNullable = oConstraints.nullable;
			if (vNullable === false || vNullable === "false") {
				oType.oConstraints = {nullable : false};
			} else if (vNullable !== undefined && vNullable !== true && vNullable !== "true") {
				Log.warning("Illegal nullable: " + vNullable, null, oType.getName());
			}
		}
		oType._handleLocalizationChange();
	}

	/**
	 * Constructor for a new <code>Int</code>.
	 *
	 * @class This is an abstract base class for integer-based
	 * <a href="http://www.odata.org/documentation/odata-version-2-0/overview#AbstractTypeSystem">
	 * OData primitive types</a> like <code>Edm.Int16</code> or <code>Edm.Int32</code>.
	 *
	 * @extends sap.ui.model.odata.type.ODataType
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @abstract
	 * @alias sap.ui.model.odata.type.Int
	 * @param {object} [oFormatOptions]
	 *   type-specific format options; see subtypes
	 * @param {object} [oConstraints]
	 *   constraints; {@link #validateValue validateValue} throws an error if any constraint is
	 *   violated
	 * @param {boolean|string} [oConstraints.nullable=true]
	 *   if <code>true</code>, the value <code>null</code> is accepted
	 * @public
	 * @since 1.27.0
	 */
	var Int = ODataType.extend("sap.ui.model.odata.type.Int", {
				constructor : function (oFormatOptions, oConstraints) {
					ODataType.apply(this, arguments);
					this.oFormatOptions = oFormatOptions;
					setConstraints(this, oConstraints);
				},
				metadata : {
					"abstract" : true
				}
			}
		);

	/**
	 * Called by the framework when any localization setting changed.
	 * @private
	 */
	Int.prototype._handleLocalizationChange = function () {
		this.oFormat = null;
	};

	/**
	 * Formats the given value to the given target type.
	 * When formatting to <code>string</code> the format options are used.
	 *
	 * @param {number} iValue
	 *   the value in model representation to be formatted
	 * @param {string} sTargetType
	 *   the target type; may be "any", "int", "float", "string", or a type with one of these types
	 *   as its {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {number|string}
	 *   the formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   are formatted to <code>null</code>
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sTargetType</code> is not supported or <code>iValue</code> is not a model value
	 *   for this type.
	 * @public
	 */
	Int.prototype.formatValue = function (iValue, sTargetType) {
		if (iValue === undefined || iValue === null) {
			return null;
		}
		if (typeof iValue !== "number" && sTargetType !== "any") {
			throw new FormatException("Illegal " + this.getName() + " value: " + iValue);
		}
		switch (this.getPrimitiveType(sTargetType)) {
			case "string":
				return getFormatter(this).format(iValue);
			case "int":
				return Math.floor(iValue);
			case "float":
			case "any":
				return iValue;
			default:
				throw new FormatException("Don't know how to format "
					+ this.getName() + " to " + sTargetType);
		}
	};

	/**
	 * Parses the given value, which is expected to be of the given source type, to an Int in
	 * number representation.
	 * @param {number|string} vValue
	 *   the value to be parsed. The empty string and <code>null</code> are parsed to
	 *   <code>null</code>.
	 * @param {string} sSourceType
	 *   the source type (the expected type of <code>vValue</code>); may be "float", "int",
	 *   "string", or a type with one of these types as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @throws {sap.ui.model.ParseException}
	 *   if <code>sSourceType</code> is unsupported or if the given string cannot be parsed to an
	 *   integer type
	 * @returns {number}
	 *   the parsed value
	 * @public
	 */
	Int.prototype.parseValue = function (vValue, sSourceType) {
		var iResult;

		if (vValue === null || vValue === "") {
			return null;
		}
		switch (this.getPrimitiveType(sSourceType)) {
			case "string":
				iResult = getFormatter(this).parse(vValue);
				if (isNaN(iResult)) {
					throw new ParseException(getText("EnterInt"));
				}
				return iResult;
			case "float":
				return Math.floor(vValue);
			case "int":
				return vValue;
			default:
				throw new ParseException("Don't know how to parse " + this.getName()
					+ " from " + sSourceType);
		}
	};

	/**
	 * Validates whether the given value in model representation is valid and meets the
	 * defined constraints.
	 * @param {number} iValue
	 *   the value to be validated
	 * @throws {sap.ui.model.ValidateException}
	 *   if the value is not in the allowed range of Int or if it is of invalid type.
	 * @public
	 */
	Int.prototype.validateValue = function (iValue) {
		var oRange = this.getRange();

		if (iValue === null) {
			if (this.oConstraints && this.oConstraints.nullable === false) {
				throw new ValidateException(getText("EnterInt"));
			}
			return;
		}
		if (typeof iValue !== "number") {
			// These are "technical" errors by calling validate w/o parse
			throw new ValidateException(iValue + " (of type " + typeof iValue + ") is not a valid "
				+ this.getName() + " value");
		}
		if (Math.floor(iValue) !== iValue) {
			throw new ValidateException(getText("EnterInt"));
		}
		if (iValue < oRange.minimum) {
			throw new ValidateException(
				getText("EnterNumberMin", [this.formatValue(oRange.minimum, "string")]));
		}
		if (iValue > oRange.maximum) {
			throw new ValidateException(
				getText("EnterNumberMax", [this.formatValue(oRange.maximum, "string")]));
		}
	};

	/**
	 * Returns the type's name.
	 *
	 * @alias sap.ui.model.odata.type.Int#getName
	 * @protected
	 * @abstract
	 */

	/**
	 * Returns the type's supported range as object with properties <code>minimum</code> and
	 * <code>maximum</code>.
	 *
	 * @alias sap.ui.model.odata.type.Int#getRange
	 * @protected
	 * @abstract
	 */

	return Int;
});