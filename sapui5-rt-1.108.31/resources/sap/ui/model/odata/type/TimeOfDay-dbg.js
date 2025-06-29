/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/base/Log",
	"sap/base/util/extend",
	"sap/ui/core/CalendarType",
	"sap/ui/core/format/DateFormat",
	"sap/ui/model/FormatException",
	"sap/ui/model/ParseException",
	"sap/ui/model/ValidateException",
	"sap/ui/model/odata/type/ODataType"
], function (Log, extend, CalendarType, DateFormat, FormatException, ParseException,
		ValidateException, ODataType) {
	"use strict";

	/*
	 * Returns the locale-dependent error message.
	 *
	 * @param {sap.ui.model.odata.type.TimeOfDay} oType
	 *   The type
	 * @returns {string}
	 *   The locale-dependent error message
	 */
	function getErrorMessage(oType) {
		return sap.ui.getCore().getLibraryResourceBundle().getText("EnterTime",
			[oType.formatValue("23:59:58", "string")]);
	}

	/*
	 * Returns the DateFormat instance for values displayed on the UI. Creates it lazily.
	 *
	 * @param {sap.ui.model.odata.type.TimeOfDay} oType
	 *   The type
	 * @returns {sap.ui.core.format.DateFormat}
	 *   The DateFormat
	 */
	function getUiFormat(oType) {
		var oFormatOptions;

		if (!oType.oUiFormat) {
			oFormatOptions = extend({strictParsing : true}, oType.oFormatOptions);
			oFormatOptions.UTC = true; // value is always UTC; no overwrite via format options
			oType.oUiFormat = DateFormat.getTimeInstance(oFormatOptions);
		}
		return oType.oUiFormat;
	}

	/*
	 * Sets the constraints. Logs a warning and uses the constraint's default value, if an invalid
	 * value is given.
	 *
	 * @param {sap.ui.model.odata.type.TimeOfDay} oType
	 *   The type
	 * @param {object} [oConstraints]
	 *   The constraints
	 * @param {boolean} [oConstraints.nullable=true]
	 *   If <code>true</code>, the value <code>null</code> is valid for this type
	 * @param {number} [oConstraints.precision=0]
	 *   The number of decimal places allowed in the seconds portion of a valid value; only
	 *   integer values between 0 and 12 are valid.
	 */
	function setConstraints(oType, oConstraints) {
		var vNullable,
			vPrecision;

		oType.oConstraints = undefined;
		if (oConstraints) {
			vNullable = oConstraints.nullable;
			vPrecision = oConstraints.precision;
			// "true" and "false" not allowed here, because in V4 they are never sent as string
			if (vNullable === false) {
				oType.oConstraints = {nullable : false};
			} else if (vNullable !== undefined && vNullable !== true) {
				Log.warning("Illegal nullable: " + vNullable, null, oType.getName());
			}
			if (vPrecision === Math.floor(vPrecision) && vPrecision > 0 && vPrecision <= 12) {
				oType.oConstraints = oType.oConstraints || {};
				oType.oConstraints.precision = vPrecision;
			} else if (vPrecision !== undefined && vPrecision !== 0) {
				Log.warning("Illegal precision: " + vPrecision, null, oType.getName());
			}
		}
	}

	/**
	 * Constructor for an OData primitive type <code>Edm.TimeOfDay</code>.
	 *
	 * @param {object} [oFormatOptions]
	 *   Format options as defined in {@link sap.ui.core.format.DateFormat}
	 * @param {object} [oConstraints]
	 *   Constraints; {@link #validateValue validateValue} throws an error if any constraint is
	 *   violated
	 * @param {boolean} [oConstraints.nullable=true]
	 *   If <code>true</code>, the value <code>null</code> is accepted
	 * @param {number} [oConstraints.precision=0]
	 *   The number of decimal places allowed in the seconds portion of a valid value; must be an
	 *   integer between 0 and 12, otherwise the default value 0 is used.
	 *
	 * @alias sap.ui.model.odata.type.TimeOfDay
	 * @author SAP SE
	 * @class This class represents the OData V4 primitive type {@link
	 *   http://docs.oasis-open.org/odata/odata/v4.0/errata02/os/complete/part3-csdl/odata-v4.0-errata02-os-part3-csdl-complete.html#_The_edm:Documentation_Element
	 *   <code>Edm.TimeOfDay</code>}.
	 *   In {@link sap.ui.model.odata.v4.ODataModel} this type is represented as a
	 *   <code>string</code>.
	 * @extends sap.ui.model.odata.type.ODataType
	 * @public
	 * @since 1.37.0
	 * @version 1.108.28
	 */
	var TimeOfDay = ODataType.extend("sap.ui.model.odata.type.TimeOfDay", {
			constructor : function (oFormatOptions, oConstraints) {
				ODataType.apply(this, arguments);
				this.oModelFormat = undefined;
				this.rTimeOfDay = undefined;
				this.oUiFormat = undefined;
				setConstraints(this, oConstraints);
				this.oFormatOptions = oFormatOptions;
			}
		});

	/**
	 * Called by the framework when any localization setting is changed.
	 *
	 * @private
	 * @since 1.37.0
	 */
	TimeOfDay.prototype._handleLocalizationChange = function () {
		this.oUiFormat = null;
	};

	/**
	 * Resets the model formatter instance which is recreated on demand, for example via
	 * {@link #getModelFormat}, and cached.
	 *
	 * @private
	 */
	TimeOfDay.prototype._resetModelFormatter = function () {
		this.oModelFormat = undefined;
	};

	/**
	 * Formats the given value to the given target type.
	 *
	 * @param {string} sValue
	 *   The value to be formatted, which is represented as a string in the model
	 * @param {string} sTargetType
	 *   The target type, may be "any", "object" (since 1.69.0), "string", or a type with one of
	 *   these types as its {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information
	 * @returns {Date|string}
	 *   The formatted output value in the target type; <code>undefined</code> or <code>null</code>
	 *   are formatted to <code>null</code>
	 * @throws {sap.ui.model.FormatException}
	 *   If <code>sValue</code> is not a valid OData V4 Edm.TimeOfDay value or if
	 *   <code>sTargetType</code> is not supported
	 *
	 * @public
	 * @since 1.37.0
	 */
	TimeOfDay.prototype.formatValue = function (sValue, sTargetType) {
		var oDate,
			iIndex,
			sPrimitiveType;

		if (sValue === undefined || sValue === null) {
			return null;
		}

		sPrimitiveType = this.getPrimitiveType(sTargetType);
		switch (sPrimitiveType) {
			case "any":
				return sValue;
			case "object":
			case "string":
				iIndex = sValue.indexOf(".");
				if (iIndex >= 0) {
					sValue = sValue.slice(0, iIndex + 4); // cut off after milliseconds
				}
				oDate = this.getModelFormat().parse(sValue);
				if (oDate) {
					if (sPrimitiveType === "object") {
						return new Date(1970, 0, 1, oDate.getUTCHours(), oDate.getUTCMinutes(),
							oDate.getUTCSeconds());
					}
					return getUiFormat(this).format(oDate);
				}
				throw new FormatException("Illegal " + this.getName() + " value: " + sValue);
			default:
				throw new FormatException("Don't know how to format " + this.getName() + " to "
					+ sTargetType);
		}
	};

	/**
	 * @override
	 */
	TimeOfDay.prototype.getFormat = function () {
		return getUiFormat(this);
	};

	/**
	 * Returns a formatter that converts between the model format and a Javascript Date. It has two
	 * methods: <code>format</code> takes a Date and returns a date as a String in the format
	 * expected by the model, <code>parse</code> converts from the String to a Date.
	 *
	 * @returns {sap.ui.core.format.DateFormat}
	 *   The formatter
	 *
	 * @override
	 * @protected
	 */
	TimeOfDay.prototype.getModelFormat = function () {
		var sPattern = "HH:mm:ss",
			iPrecision;

		if (!this.oModelFormat) {
			iPrecision = this.oConstraints && this.oConstraints.precision;
			if (iPrecision) {
				sPattern += "." + "".padEnd(iPrecision, "S");
			}
			this.oModelFormat = DateFormat.getTimeInstance({
				calendarType : CalendarType.Gregorian,
				pattern : sPattern,
				strictParsing : true,
				UTC : true
			});
		}
		return this.oModelFormat;
	};

	/**
	 * Returns the type's name.
	 *
	 * @returns {string}
	 *   The type's name
	 *
	 * @public
	 * @since 1.37.0
	 */
	TimeOfDay.prototype.getName = function () {
		return "sap.ui.model.odata.type.TimeOfDay";
	};

	/**
	 * Parses the given value, which is expected to be of the given type, to a string with an
	 * OData V4 Edm.TimeOfDay value.
	 *
	 * @param {Date|string} vValue
	 *   The value to be parsed, maps <code>""</code> to <code>null</code>; <code>Date</code>
	 *   objects are expected to represent local time and are supported if and only if source type
	 *   is "object".
	 * @param {string} sSourceType
	 *   The source type (the expected type of <code>sValue</code>), must be "string",
	 *   "object" (since 1.69.0) or a type with one of these types as its
	 *   {@link sap.ui.base.DataType#getPrimitiveType primitive type}.
	 *   See {@link sap.ui.model.odata.type} for more information.
	 * @returns {string}
	 *   The parsed value
	 * @throws {sap.ui.model.ParseException}
	 *   If <code>sSourceType</code> is not supported or if the value is invalid and cannot be
	 *   parsed
	 *
	 * @public
	 * @since 1.37.0
	 */
	TimeOfDay.prototype.parseValue = function (vValue, sSourceType) {
		var oDate;

		if (vValue === "" || vValue === null) {
			return null;
		}

		switch (this.getPrimitiveType(sSourceType)) {
			case "object":
				return this.getModelFormat().format(vValue, false);
			case "string":
				oDate = getUiFormat(this).parse(vValue);
				if (!oDate) {
					throw new ParseException(getErrorMessage(this));
				}
				return this.getModelFormat().format(oDate);
			default:
				throw new ParseException("Don't know how to parse " + this.getName() + " from "
					+ sSourceType);
		}
	};

	/**
	 * Validates the given value in model representation and meets the type's constraints.
	 *
	 * @param {string} sValue
	 *   The value to be validated
	 * @throws {sap.ui.model.ValidateException}
	 *   If the value is not valid
	 *
	 * @public
	 * @since 1.37.0
	 */
	TimeOfDay.prototype.validateValue = function (sValue) {
		var iPrecision;

		if (sValue === null) {
			if (this.oConstraints && this.oConstraints.nullable === false) {
				throw new ValidateException(getErrorMessage(this));
			}
			return;
		}

		if (!this.rTimeOfDay) {
			iPrecision = this.oConstraints && this.oConstraints.precision;
			// @see sap.ui.model.odata._AnnotationHelperExpression
			this.rTimeOfDay = new RegExp("^(?:[01]\\d|2[0-3]):[0-5]\\d(?::[0-5]\\d"
				+ (iPrecision ? "(\\.\\d{1," + iPrecision + "})?" : "")
				+ ")?$");
		}
		if (!this.rTimeOfDay.test(sValue)) {
			throw new ValidateException("Illegal sap.ui.model.odata.type.TimeOfDay value: "
				+ sValue);
		}
	};

	return TimeOfDay;
});