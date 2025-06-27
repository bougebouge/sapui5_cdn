import type { NavigationProperty, PathAnnotationExpression, Property } from "@sap-ux/vocabularies-types";
import type { DataModelObjectPath } from "./DataModelPathHelper";

/**
 * Identify if the given property passed is a "Property" (has a _type).
 *
 * @param property A target property to evaluate
 * @returns Validate that property is a Property
 */
export function isProperty(property: any): property is Property {
	return property && (property as Property).hasOwnProperty("_type") && (property as Property)._type === "Property";
}

/**
 * Check whether the property has the Core.Computed annotation or not.
 *
 * @param oProperty The target property
 * @returns `true` if the property is computed
 */
export const isComputed = function (oProperty: Property): boolean {
	return !!oProperty.annotations?.Core?.Computed?.valueOf();
};

/**
 * Identify if the given property passed is a "NavigationProperty".
 *
 * @param property A target property to evaluate
 * @returns Validate that property is a NavigationProperty
 */
export function isNavigationProperty(property: any): property is NavigationProperty {
	return (
		property &&
		(property as NavigationProperty).hasOwnProperty("_type") &&
		(property as NavigationProperty)._type === "NavigationProperty"
	);
}

/**
 * Check whether the property has the Core.Immutable annotation or not.
 *
 * @param oProperty The target property
 * @returns `true` if it's immutable
 */
export const isImmutable = function (oProperty: Property): boolean {
	return !!oProperty.annotations?.Core?.Immutable?.valueOf();
};

/**
 * Check whether the property is a key or not.
 *
 * @param oProperty The target property
 * @returns `true` if it's a key
 */
export const isKey = function (oProperty: Property): boolean {
	return !!oProperty.isKey;
};

/**
 * Check whether the property is a semanticKey for the context entity.
 *
 * @param property
 * @param contextDataModelObject The DataModelObject that holds the context
 * @returns `true`if it's a semantic key
 */
export const isSemanticKey = function (property: Property, contextDataModelObject: DataModelObjectPath) {
	const semanticKeys = contextDataModelObject.contextLocation?.targetEntityType?.annotations?.Common?.SemanticKey;
	return (
		semanticKeys?.some(function (key) {
			return key?.$target?.fullyQualifiedName === property.fullyQualifiedName;
		}) ?? false
	);
};

/**
 * Checks whether the property has a date time or not.
 *
 * @param oProperty
 * @returns `true` if it is of type date / datetime / datetimeoffset
 */
export const hasDateType = function (oProperty: Property): boolean {
	return ["Edm.Date", "Edm.DateTime", "Edm.DateTimeOffset"].indexOf(oProperty.type) !== -1;
};

/**
 * Retrieve the label annotation.
 *
 * @param oProperty The target property
 * @returns The label string
 */
export const getLabel = function (oProperty: Property): string {
	return oProperty.annotations?.Common?.Label?.toString() || "";
};

/**
 * Check whether the property has a semantic object defined or not.
 *
 * @param oProperty The target property
 * @returns `true` if it has a semantic object
 */
export const hasSemanticObject = function (oProperty: Property): boolean {
	return !!oProperty.annotations?.Common?.SemanticObject;
};

export const isPathExpression = function <T>(expression: any): expression is PathAnnotationExpression<T> {
	return !!expression && expression.type !== undefined && expression.type === "Path";
};
export const isPropertyPathExpression = function <T>(expression: any): expression is PathAnnotationExpression<T> {
	return !!expression && expression.type !== undefined && expression.type === "PropertyPath";
};
export const isAnnotationPathExpression = function <T>(expression: any): expression is PathAnnotationExpression<T> {
	return !!expression && expression.type !== undefined && expression.type === "AnnotationPath";
};

/**
 * Retrieves the timezone property associated to the property, if applicable.
 *
 * @param oProperty The target property
 * @returns The timezone property, if it exists
 */
export const getAssociatedTimezoneProperty = function (oProperty: Property): Property | undefined {
	return isPathExpression(oProperty?.annotations?.Common?.Timezone)
		? (oProperty.annotations?.Common?.Timezone.$target as unknown as Property)
		: undefined;
};

/**
 * Retrieves the timezone property path associated to the property, if applicable.
 *
 * @param oProperty The target property
 * @returns The timezone property path, if it exists
 */
export const getAssociatedTimezonePropertyPath = function (oProperty: Property): string | undefined {
	return isPathExpression(oProperty?.annotations?.Common?.Timezone) ? oProperty?.annotations?.Common?.Timezone?.path : undefined;
};

/**
 * Retrieves the associated text property for that property, if it exists.
 *
 * @param oProperty The target property
 * @returns The text property, if it exists
 */
export const getAssociatedTextProperty = function (oProperty: Property): Property | undefined {
	return isPathExpression(oProperty?.annotations?.Common?.Text)
		? (oProperty.annotations?.Common?.Text.$target as unknown as Property)
		: undefined;
};

/**
 * Retrieves the unit property associated to the property, if applicable.
 *
 * @param oProperty The target property
 * @returns The unit property, if it exists
 */
export const getAssociatedUnitProperty = function (oProperty: Property): Property | undefined {
	return isPathExpression(oProperty?.annotations?.Measures?.Unit)
		? (oProperty.annotations?.Measures?.Unit.$target as unknown as Property)
		: undefined;
};

export const getAssociatedUnitPropertyPath = function (oProperty: Property): string | undefined {
	return isPathExpression(oProperty?.annotations?.Measures?.Unit) ? oProperty.annotations?.Measures?.Unit.path : undefined;
};

/**
 * Retrieves the associated currency property for that property if it exists.
 *
 * @param oProperty The target property
 * @returns The unit property, if it exists
 */
export const getAssociatedCurrencyProperty = function (oProperty: Property): Property | undefined {
	return isPathExpression(oProperty?.annotations?.Measures?.ISOCurrency)
		? (oProperty.annotations?.Measures?.ISOCurrency.$target as unknown as Property)
		: undefined;
};

export const getAssociatedCurrencyPropertyPath = function (oProperty: Property): string | undefined {
	return isPathExpression(oProperty?.annotations?.Measures?.ISOCurrency) ? oProperty.annotations?.Measures?.ISOCurrency.path : undefined;
};

/**
 * Retrieves the Common.Text property path if it exists.
 *
 * @param oProperty The target property
 * @returns The Common.Text property path or undefined if it does not exist
 */
export const getAssociatedTextPropertyPath = function (oProperty: Property): string | undefined {
	return isPathExpression(oProperty.annotations?.Common?.Text) ? oProperty.annotations?.Common?.Text.path : undefined;
};

/**
 * Retrieves the TargetValue from the DataPoint.
 *
 * @param {Property} oProperty the target property or DataPoint
 * @returns {string | undefined} The TargetValue
 */

export const getTargetValueOnDataPoint = function (oProperty: any): string | undefined {
	const sTargetValue =
		oProperty.annotations?.UI?.DataFieldDefault?.Target?.$target?.TargetValue?.toString() || oProperty.TargetValue?.toString();
	return sTargetValue ? sTargetValue : undefined;
};
/**
 * Check whether the property has a value help annotation defined or not.
 *
 * @param oProperty The target property
 * @returns `true` if it has a value help
 */
export const hasValueHelp = function (oProperty: Property): boolean {
	return (
		!!oProperty.annotations?.Common?.ValueList ||
		!!oProperty.annotations?.Common?.ValueListReferences ||
		!!oProperty.annotations?.Common?.ValueListWithFixedValues ||
		!!oProperty.annotations?.Common?.ValueListMapping
	);
};

/**
 * Check whether the property has a value help with fixed value annotation defined or not.
 *
 * @param oProperty The target property
 * @returns `true` if it has a value help
 */
export const hasValueHelpWithFixedValues = function (oProperty: Property): boolean {
	return !!oProperty?.annotations?.Common?.ValueListWithFixedValues?.valueOf();
};

/**
 * Check whether the property has a value help for validation annotation defined or not.
 *
 * @param oProperty The target property
 * @returns `true` if it has a value help
 */
export const hasValueListForValidation = function (oProperty: Property): boolean {
	return oProperty.annotations?.Common?.ValueListForValidation !== undefined;
};

export const hasTimezone = function (oProperty: Property): boolean {
	return oProperty.annotations?.Common?.Timezone !== undefined;
};
/**
 * Checks whether the property is a unit property.
 *
 * @param oProperty The property to check
 * @returns `true` if it is a unit
 */
export const isUnit = function (oProperty: Property): boolean {
	return !!oProperty.annotations?.Common?.IsUnit?.valueOf();
};

/**
 * Checks whether the property has a unit property.
 *
 * @param oProperty The property to check
 * @returns `true` if it has a unit
 */

export const hasUnit = function (oProperty: Property): boolean {
	return oProperty.annotations?.Measures?.Unit !== undefined;
};

/**
 * Checks whether the property is a currency property.
 *
 * @param oProperty The property to check
 * @returns `true` if it is a currency
 */
export const isCurrency = function (oProperty: Property): boolean {
	return !!oProperty.annotations?.Common?.IsCurrency?.valueOf();
};

/**
 * Checks whether the property has a currency property.
 *
 * @param oProperty The property to check
 * @returns `true` if it has a currency
 */
export const hasCurrency = function (oProperty: Property): boolean {
	return oProperty.annotations?.Measures?.ISOCurrency !== undefined;
};

export const hasStaticPercentUnit = function (oProperty: Property): boolean {
	return oProperty?.annotations?.Measures?.Unit?.toString() === "%";
};
