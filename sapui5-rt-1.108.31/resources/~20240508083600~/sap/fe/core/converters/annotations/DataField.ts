import type { PrimitiveType, Property } from "@sap-ux/vocabularies-types";
import type { Contact } from "@sap-ux/vocabularies-types/vocabularies/Communication";
import { CommunicationAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/Communication";
import type {
	DataField,
	DataFieldAbstractTypes,
	DataFieldForActionAbstractTypes,
	DataFieldForAnnotation,
	DataFieldTypes,
	DataPoint
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import type { TableType } from "sap/fe/core/converters/controls/Common/Table";
import { getDisplayMode } from "sap/fe/core/templating/DisplayModeFormatter";
import {
	getAssociatedCurrencyProperty,
	getAssociatedTimezoneProperty,
	getAssociatedUnitProperty,
	isProperty
} from "sap/fe/core/templating/PropertyHelper";
import type ConverterContext from "../ConverterContext";

export type ComplexPropertyInfo = {
	properties: Record<string, Property>;
	additionalProperties: Record<string, Property>;
	exportSettingsTemplate?: string;
	exportSettingsWrapping?: boolean;
	exportUnitName?: string;
	exportUnitString?: string;
	exportTimezoneName?: string;
	exportTimezoneString?: string;
	textOnlyPropertiesFromTextAnnotation: string[];
};

/**
 * Identifies if the given dataFieldAbstract that is passed is a "DataFieldForActionAbstract".
 * DataFieldForActionAbstract has an inline action defined.
 *
 * @param dataField DataField to be evaluated
 * @returns Validates that dataField is a DataFieldForActionAbstractType
 */
export function isDataFieldForActionAbstract(dataField: DataFieldAbstractTypes): dataField is DataFieldForActionAbstractTypes {
	return (dataField as DataFieldForActionAbstractTypes).hasOwnProperty("Action");
}

/**
 * Identifies if the given dataFieldAbstract that is passed is a "DataField".
 * DataField has a value defined.
 *
 * @param dataField DataField to be evaluated
 * @returns Validate that dataField is a DataFieldTypes
 */
export function isDataFieldTypes(dataField: DataFieldAbstractTypes): dataField is DataFieldTypes {
	return (dataField as DataFieldTypes).hasOwnProperty("Value");
}

/**
 * Returns whether given DataField has a static hidden annotation.
 *
 * @param dataField The DataField to check
 * @returns `true` if DataField or referenced property has a static Hidden annotation, false else
 * @private
 */
export function isDataFieldAlwaysHidden(dataField: DataFieldAbstractTypes): boolean {
	return (
		dataField.annotations?.UI?.Hidden?.valueOf() === true ||
		(isDataFieldTypes(dataField) && dataField.Value?.$target?.annotations?.UI?.Hidden === true)
	);
}

export function getSemanticObjectPath(converterContext: ConverterContext, object: any): string | undefined {
	if (typeof object === "object") {
		if (isDataFieldTypes(object) && object.Value?.$target) {
			const property = object.Value?.$target;
			if (property?.annotations?.Common?.SemanticObject !== undefined) {
				return converterContext.getEntitySetBasedAnnotationPath(property?.fullyQualifiedName);
			}
		} else if (isProperty(object)) {
			if (object?.annotations?.Common?.SemanticObject !== undefined) {
				return converterContext.getEntitySetBasedAnnotationPath(object?.fullyQualifiedName);
			}
		}
	}
	return undefined;
}

/**
 * Returns the navigation path prefix for a property path.
 *
 * @param path The property path For e.g. /EntityType/Navigation/Property
 * @returns The navigation path prefix For e.g. /EntityType/Navigation/
 */
function _getNavigationPathPrefix(path: string): string {
	return path.indexOf("/") > -1 ? path.substring(0, path.lastIndexOf("/") + 1) : "";
}

/**
 * Collect additional properties for the ALP table use-case.
 *
 * For e.g. If UI.Hidden points to a property, include this property in the additionalProperties of ComplexPropertyInfo object.
 *
 * @param target Property or DataField being processed
 * @param navigationPathPrefix Navigation path prefix, applicable in case of navigation properties.
 * @param tableType Table type.
 * @param relatedProperties The related properties identified so far.
 * @returns The related properties identified.
 */
function _collectAdditionalPropertiesForAnalyticalTable(
	target: PrimitiveType,
	navigationPathPrefix: string,
	tableType: TableType,
	relatedProperties: ComplexPropertyInfo
): ComplexPropertyInfo {
	if (tableType === "AnalyticalTable") {
		const hiddenAnnotation = target.annotations?.UI?.Hidden;
		if (hiddenAnnotation?.path && hiddenAnnotation.$target?._type === "Property") {
			const hiddenAnnotationPropertyPath = navigationPathPrefix + hiddenAnnotation.path;
			// This property should be added to additionalProperties map for the ALP table use-case.
			relatedProperties.additionalProperties[hiddenAnnotationPropertyPath] = hiddenAnnotation.$target;
		}
	}
	return relatedProperties;
}

/**
 * Collect related properties from a property's annotations.
 *
 * @param path The property path
 * @param property The property to be considered
 * @param converterContext The converter context
 * @param ignoreSelf Whether to exclude the same property from related properties.
 * @param tableType The table type.
 * @param relatedProperties The related properties identified so far.
 * @param addUnitInTemplate True if the unit/currency property needs to be added in the export template
 * @returns The related properties identified.
 */
export function collectRelatedProperties(
	path: string,
	property: PrimitiveType,
	converterContext: ConverterContext,
	ignoreSelf: boolean,
	tableType: TableType,
	relatedProperties: ComplexPropertyInfo = { properties: {}, additionalProperties: {}, textOnlyPropertiesFromTextAnnotation: [] },
	addUnitInTemplate: boolean = false
): ComplexPropertyInfo {
	/**
	 * Helper to push unique related properties.
	 *
	 * @param key The property path
	 * @param value The properties object containing value property, description property...
	 * @returns Index at which the property is available
	 */
	function _pushUnique(key: string, value: Property): number {
		if (!relatedProperties.properties.hasOwnProperty(key)) {
			relatedProperties.properties[key] = value;
		}
		return Object.keys(relatedProperties.properties).indexOf(key);
	}

	/**
	 * Helper to append the export settings template with a formatted text.
	 *
	 * @param value Formatted text
	 */
	function _appendTemplate(value: string) {
		relatedProperties.exportSettingsTemplate = relatedProperties.exportSettingsTemplate
			? `${relatedProperties.exportSettingsTemplate}${value}`
			: `${value}`;
	}

	if (path && property) {
		const navigationPathPrefix = _getNavigationPathPrefix(path);

		// Check for Text annotation.
		const textAnnotation = property.annotations?.Common?.Text;
		let valueIndex: number;
		let targetValue: string;
		let currencyOrUoMIndex: number;
		let timezoneOrUoMIndex: number;

		if (relatedProperties.exportSettingsTemplate) {
			// FieldGroup use-case. Need to add each Field in new line.
			_appendTemplate("\n");
			relatedProperties.exportSettingsWrapping = true;
		}

		if (textAnnotation?.path && textAnnotation?.$target) {
			// Check for Text Arrangement.
			const dataModelObjectPath = converterContext.getDataModelObjectPath();
			const textAnnotationPropertyPath = navigationPathPrefix + textAnnotation.path;
			const displayMode = getDisplayMode(property, dataModelObjectPath);
			let descriptionIndex: number;
			switch (displayMode) {
				case "Value":
					valueIndex = _pushUnique(path, property);
					_appendTemplate(`{${valueIndex}}`);
					break;

				case "Description":
					descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
					_appendTemplate(`{${descriptionIndex}}`);
					relatedProperties.textOnlyPropertiesFromTextAnnotation.push(textAnnotation.path);
					break;

				case "ValueDescription":
					valueIndex = _pushUnique(path, property);
					descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
					_appendTemplate(`{${valueIndex}} ({${descriptionIndex}})`);
					break;

				case "DescriptionValue":
					valueIndex = _pushUnique(path, property);
					descriptionIndex = _pushUnique(textAnnotationPropertyPath, textAnnotation.$target);
					_appendTemplate(`{${descriptionIndex}} ({${valueIndex}})`);
					break;
				// no default
			}
		} else {
			// Check for field containing Currency Or Unit Properties or Timezone
			const currencyOrUoMProperty = getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property);
			const currencyOrUnitAnnotation = property?.annotations?.Measures?.ISOCurrency || property?.annotations?.Measures?.Unit;
			const timezoneProperty = getAssociatedTimezoneProperty(property);
			const timezoneAnnotation = property?.annotations?.Common?.Timezone;

			if (currencyOrUoMProperty && currencyOrUnitAnnotation?.$target) {
				valueIndex = _pushUnique(path, property);
				currencyOrUoMIndex = _pushUnique(navigationPathPrefix + currencyOrUnitAnnotation.path, currencyOrUnitAnnotation.$target);
				if (addUnitInTemplate) {
					_appendTemplate(`{${valueIndex}}  {${currencyOrUoMIndex}}`);
				} else {
					relatedProperties.exportUnitName = navigationPathPrefix + currencyOrUnitAnnotation.path;
				}
			} else if (timezoneProperty && timezoneAnnotation?.$target) {
				valueIndex = _pushUnique(path, property);
				timezoneOrUoMIndex = _pushUnique(navigationPathPrefix + timezoneAnnotation.path, timezoneAnnotation.$target);
				if (addUnitInTemplate) {
					_appendTemplate(`{${valueIndex}}  {${timezoneOrUoMIndex}}`);
				} else {
					relatedProperties.exportTimezoneName = navigationPathPrefix + timezoneAnnotation.path;
				}
			} else if (property.Target?.$target?.Visualization) {
				const dataPointProperty: PrimitiveType = property.Target.$target.Value.$target;
				valueIndex = _pushUnique(path, dataPointProperty);
				// New fake property created for the Rating/Progress Target Value. It'll be used for the export on split mode.
				_pushUnique(property.Target.value, property.Target.$target);
				targetValue = (property.Target.$target.TargetValue || property.Target.$target.MaximumValue).toString();
				_appendTemplate(`{${valueIndex}}/${targetValue}`);
			} else if (property.annotations?.UI?.DataFieldDefault?.Target?.$target?.$Type === UIAnnotationTypes.DataPointType) {
				// DataPoint use-case using DataFieldDefault.
				const dataPointDefaultProperty: PrimitiveType = property.annotations.UI.DataFieldDefault;
				valueIndex = _pushUnique(path, property);
				// New fake property created for the Rating/Progress Target Value. It'll be used for the export on split mode.
				_pushUnique(dataPointDefaultProperty.Target.value, property);
				targetValue = (
					dataPointDefaultProperty.Target.$target.TargetValue || dataPointDefaultProperty.Target.$target.TargetValue.MaximumValue
				).toString();
				_appendTemplate(`{${valueIndex}}/${targetValue}`);
			} else if (property.$Type === CommunicationAnnotationTypes.ContactType) {
				const contactProperty = property.fn?.$target;
				const contactPropertyPath = property.fn?.path;
				valueIndex = _pushUnique(
					navigationPathPrefix ? navigationPathPrefix + contactPropertyPath : contactPropertyPath,
					contactProperty
				);
				_appendTemplate(`{${valueIndex}}`);
			} else if (!ignoreSelf) {
				// Collect underlying property
				valueIndex = _pushUnique(path, property);
				_appendTemplate(`{${valueIndex}}`);
				if (currencyOrUnitAnnotation) {
					relatedProperties.exportUnitString = `${currencyOrUnitAnnotation}`; // Hard-coded currency/unit
				} else if (timezoneAnnotation) {
					relatedProperties.exportTimezoneString = `${timezoneAnnotation}`; // Hard-coded timezone
				}
			}
		}

		relatedProperties = _collectAdditionalPropertiesForAnalyticalTable(property, navigationPathPrefix, tableType, relatedProperties);
		if (Object.keys(relatedProperties.additionalProperties).length > 0 && Object.keys(relatedProperties.properties).length === 0) {
			// Collect underlying property if not collected already.
			// This is to ensure that additionalProperties are made available only to complex property infos.
			valueIndex = _pushUnique(path, property);
			_appendTemplate(`{${valueIndex}}`);
		}
	}

	return relatedProperties;
}

/**
 * Collect properties consumed by a DataField.
 * This is for populating the ComplexPropertyInfos of the table delegate.
 *
 * @param dataField The DataField for which the properties need to be identified.
 * @param converterContext The converter context.
 * @param tableType The table type.
 * @param relatedProperties The properties identified so far.
 * @param isEmbedded True if the DataField is embedded in another annotation (e.g. FieldGroup).
 * @returns The properties related to the DataField.
 */
export function collectRelatedPropertiesRecursively(
	dataField: DataFieldAbstractTypes,
	converterContext: ConverterContext,
	tableType: TableType,
	relatedProperties: ComplexPropertyInfo = { properties: {}, additionalProperties: {}, textOnlyPropertiesFromTextAnnotation: [] },
	isEmbedded: boolean = false
): ComplexPropertyInfo {
	switch (dataField?.$Type) {
		case UIAnnotationTypes.DataField:
		case UIAnnotationTypes.DataFieldWithUrl:
		case UIAnnotationTypes.DataFieldWithNavigationPath:
		case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
		case UIAnnotationTypes.DataFieldWithAction:
			if (dataField.Value) {
				const property = dataField.Value;
				relatedProperties = collectRelatedProperties(
					property.path,
					property.$target,
					converterContext,
					false,
					tableType,
					relatedProperties,
					isEmbedded
				);
				const navigationPathPrefix = _getNavigationPathPrefix(property.path);
				relatedProperties = _collectAdditionalPropertiesForAnalyticalTable(
					dataField,
					navigationPathPrefix,
					tableType,
					relatedProperties
				);
			}
			break;

		case UIAnnotationTypes.DataFieldForAction:
		case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
			break;

		case UIAnnotationTypes.DataFieldForAnnotation:
			switch (dataField.Target?.$target?.$Type) {
				case UIAnnotationTypes.FieldGroupType:
					dataField.Target.$target.Data?.forEach((innerDataField: DataFieldAbstractTypes) => {
						relatedProperties = collectRelatedPropertiesRecursively(
							innerDataField,
							converterContext,
							tableType,
							relatedProperties,
							true
						);
					});
					break;

				case UIAnnotationTypes.DataPointType:
					relatedProperties = collectRelatedProperties(
						dataField.Target.$target.Value.path,
						dataField,
						converterContext,
						false,
						tableType,
						relatedProperties,
						isEmbedded
					);
					break;

				case CommunicationAnnotationTypes.ContactType:
					const dataFieldContact = dataField.Target.$target as Contact;
					relatedProperties = collectRelatedProperties(
						dataField.Target.value,
						dataFieldContact,
						converterContext,
						false,
						tableType,
						relatedProperties,
						isEmbedded
					);
					break;
				default:
					break;
			}
			break;

		default:
			break;
	}

	return relatedProperties;
}

export const getDataFieldDataType = function (oDataField: DataFieldAbstractTypes | Property): string | undefined {
	let sDataType: string | undefined = (oDataField as DataFieldAbstractTypes).$Type;
	switch (sDataType) {
		case UIAnnotationTypes.DataFieldForAction:
		case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
			sDataType = undefined;
			break;

		case UIAnnotationTypes.DataField:
		case UIAnnotationTypes.DataFieldWithNavigationPath:
		case UIAnnotationTypes.DataFieldWithUrl:
		case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
		case UIAnnotationTypes.DataFieldWithAction:
			sDataType = (oDataField as DataField)?.Value?.$target?.type;
			break;

		case UIAnnotationTypes.DataFieldForAnnotation:
		default:
			const sDataTypeForDataFieldForAnnotation = (oDataField as DataFieldForAnnotation).Target?.$target.$Type;
			if (sDataTypeForDataFieldForAnnotation) {
				if ((oDataField as DataFieldForAnnotation).Target?.$target.$Type === CommunicationAnnotationTypes.ContactType) {
					sDataType = (((oDataField as DataFieldForAnnotation).Target?.$target as Contact)?.fn as any).$target?.type;
				} else if ((oDataField as DataFieldForAnnotation).Target?.$target.$Type === UIAnnotationTypes.DataPointType) {
					sDataType =
						((oDataField as DataFieldForAnnotation).Target?.$target as DataPoint)?.Value?.$Path?.$Type ||
						((oDataField as DataFieldForAnnotation).Target?.$target as DataPoint)?.Value?.$target.type;
				} else {
					// e.g. FieldGroup or Chart
					// FieldGroup Properties have no type, so we define it as a boolean type to prevent exceptions during the calculation of the width
					sDataType =
						(oDataField as DataFieldForAnnotation).Target?.$target.$Type === "com.sap.vocabularies.UI.v1.ChartDefinitionType"
							? undefined
							: "Edm.Boolean";
				}
			} else {
				sDataType = undefined;
			}
			break;
	}

	return sDataType;
};
