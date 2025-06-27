import type { AnnotationTerm, EntityType, NavigationProperty, Property, PropertyPath } from "@sap-ux/vocabularies-types";
import { EntitySetAnnotations_Capabilities } from "@sap-ux/vocabularies-types/vocabularies/Capabilities_Edm";
import type {
	DataField,
	DataFieldAbstractTypes,
	DataFieldTypes,
	DataFieldWithNavigationPath,
	DataFieldWithUrl,
	FieldGroup,
	LineItem,
	ReferenceFacetTypes,
	SelectOptionType
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms, UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import type { ChartVisualization } from "sap/fe/core/converters/controls/Common/Chart";
import type { SelectionVariantConfiguration, TableVisualization } from "sap/fe/core/converters/controls/Common/Table";
import { getSelectionVariantConfiguration, getTypeConfig, isFilteringCaseSensitive } from "sap/fe/core/converters/controls/Common/Table";
import type { VisualFilters } from "sap/fe/core/converters/controls/ListReport/VisualFilters";
import { getVisualFilters } from "sap/fe/core/converters/controls/ListReport/VisualFilters";
import type ConverterContext from "sap/fe/core/converters/ConverterContext";
import type { ConfigurableObject, CustomElement } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { insertCustomElements, Placement } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { IssueCategory, IssueSeverity, IssueType } from "sap/fe/core/converters/helpers/IssueManager";
import { KeyHelper } from "sap/fe/core/converters/helpers/Key";
import { compileExpression, getExpressionFromAnnotation } from "sap/fe/core/helpers/BindingToolkit";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import type { FilterFieldManifestConfiguration, FilterManifestConfiguration, FilterSettings } from "../../ManifestSettings";
import { AvailabilityType } from "../../ManifestSettings";
import { getSelectionVariant } from "../Common/DataVisualization";
//import { hasValueHelp } from "sap/fe/core/templating/PropertyHelper";

export type FilterField = ConfigurableObject & {
	type?: string;
	conditionPath: string;
	availability: AvailabilityType;
	annotationPath: string;
	label?: string;
	template?: string;
	group?: string;
	groupLabel?: string;
	settings?: FilterSettings;
	isParameter?: boolean;
	visualFilter?: VisualFilters;
	caseSensitive?: boolean;
	required?: boolean;
};

type FilterGroup = {
	group?: string;
	groupLabel?: string;
};

enum filterFieldType {
	Default = "Default",
	Slot = "Slot"
}

const sEdmString = "Edm.String";
const sStringDataType = "sap.ui.model.odata.type.String";

export type CustomElementFilterField = CustomElement<FilterField>;

/**
 * Enter all DataFields of a given FieldGroup into the filterFacetMap.
 *
 * @param fieldGroup
 * @returns The map of facets for the given FieldGroup
 */
function getFieldGroupFilterGroups(fieldGroup: FieldGroup): Record<string, FilterGroup> {
	const filterFacetMap: Record<string, FilterGroup> = {};
	fieldGroup.Data.forEach((dataField: DataFieldAbstractTypes) => {
		if (dataField.$Type === "com.sap.vocabularies.UI.v1.DataField") {
			filterFacetMap[dataField.Value.path] = {
				group: fieldGroup.fullyQualifiedName,
				groupLabel:
					compileExpression(
						getExpressionFromAnnotation(fieldGroup.Label || fieldGroup.annotations?.Common?.Label || fieldGroup.qualifier)
					) || fieldGroup.qualifier
			};
		}
	});
	return filterFacetMap;
}

function getExcludedFilterProperties(selectionVariants: SelectionVariantConfiguration[]): Record<string, boolean> {
	return selectionVariants.reduce((previousValue: Record<string, boolean>, selectionVariant) => {
		selectionVariant.propertyNames.forEach((propertyName) => {
			previousValue[propertyName] = true;
		});
		return previousValue;
	}, {});
}

/**
 * Check that all the tables for a dedicated entity set are configured as analytical tables.
 *
 * @param listReportTables List report tables
 * @param contextPath
 * @returns Is FilterBar search field hidden or not
 */
function checkAllTableForEntitySetAreAnalytical(listReportTables: TableVisualization[], contextPath: string | undefined) {
	if (contextPath && listReportTables.length > 0) {
		return listReportTables.every((visualization) => {
			return visualization.enableAnalytics && contextPath === visualization.annotation.collection;
		});
	}
	return false;
}

function getSelectionVariants(
	lrTableVisualizations: TableVisualization[],
	converterContext: ConverterContext
): SelectionVariantConfiguration[] {
	const selectionVariantPaths: string[] = [];
	return lrTableVisualizations
		.map((visualization) => {
			const tableFilters = visualization.control.filters;
			const tableSVConfigs: SelectionVariantConfiguration[] = [];
			for (const key in tableFilters) {
				if (Array.isArray(tableFilters[key].paths)) {
					const paths = tableFilters[key].paths;
					paths.forEach((path) => {
						if (path && path.annotationPath && selectionVariantPaths.indexOf(path.annotationPath) === -1) {
							selectionVariantPaths.push(path.annotationPath);
							const selectionVariantConfig = getSelectionVariantConfiguration(path.annotationPath, converterContext);
							if (selectionVariantConfig) {
								tableSVConfigs.push(selectionVariantConfig);
							}
						}
					});
				}
			}
			return tableSVConfigs;
		})
		.reduce((svConfigs, selectionVariant) => svConfigs.concat(selectionVariant), []);
}

/**
 * Returns the condition path required for the condition model. It looks as follows:
 * <1:N-PropertyName>*\/<1:1-PropertyName>/<PropertyName>.
 *
 * @param entityType The root EntityType
 * @param propertyPath The full path to the target property
 * @returns The formatted condition path
 */
const _getConditionPath = function (entityType: EntityType, propertyPath: string): string {
	const parts = propertyPath.split("/");
	let partialPath;
	let key = "";
	while (parts.length) {
		let part = parts.shift() as string;
		partialPath = partialPath ? `${partialPath}/${part}` : part;
		const property: Property | NavigationProperty = entityType.resolvePath(partialPath);
		if (property._type === "NavigationProperty" && property.isCollection) {
			part += "*";
		}
		key = key ? `${key}/${part}` : part;
	}
	return key;
};

const _createFilterSelectionField = function (
	entityType: EntityType,
	property: Property,
	fullPropertyPath: string,
	includeHidden: boolean,
	converterContext: ConverterContext
): FilterField | undefined {
	// ignore complex property types and hidden annotated ones
	if (
		property !== undefined &&
		property.targetType === undefined &&
		(includeHidden || property.annotations?.UI?.Hidden?.valueOf() !== true)
	) {
		const targetEntityType = converterContext.getAnnotationEntityType(property);
		return {
			key: KeyHelper.getSelectionFieldKeyFromPath(fullPropertyPath),
			annotationPath: converterContext.getAbsoluteAnnotationPath(fullPropertyPath),
			conditionPath: _getConditionPath(entityType, fullPropertyPath),
			availability:
				property.annotations?.UI?.HiddenFilter?.valueOf() === true ? AvailabilityType.Hidden : AvailabilityType.Adaptation,
			label: compileExpression(getExpressionFromAnnotation(property.annotations.Common?.Label?.valueOf() || property.name)),
			group: targetEntityType.name,
			groupLabel: compileExpression(
				getExpressionFromAnnotation(targetEntityType?.annotations?.Common?.Label?.valueOf() || targetEntityType.name)
			)
		};
	}
	return undefined;
};

export function getModelType(sType: any) {
	type defaultModelType = {
		[key: string]: {
			[key: string]: string;
		};
	};
	const mDefaultTypeForEdmType: defaultModelType = {
		"Edm.Boolean": {
			modelType: "Bool"
		},
		"Edm.Byte": {
			modelType: "Int"
		},
		"Edm.Date": {
			modelType: "Date"
		},
		"Edm.DateTime": {
			modelType: "Date"
		},
		"Edm.DateTimeOffset": {
			modelType: "DateTimeOffset"
		},
		"Edm.Decimal": {
			modelType: "Decimal"
		},
		"Edm.Double": {
			modelType: "Float"
		},
		"Edm.Float": {
			modelType: "Float"
		},
		"Edm.Guid": {
			modelType: "Guid"
		},
		"Edm.Int16": {
			modelType: "Int"
		},
		"Edm.Int32": {
			modelType: "Int"
		},
		"Edm.Int64": {
			modelType: "Int"
		},
		"Edm.SByte": {
			modelType: "Int"
		},
		"Edm.Single": {
			modelType: "Float"
		},
		"Edm.String": {
			modelType: "String"
		},
		"Edm.Time": {
			modelType: "TimeOfDay"
		},
		"Edm.TimeOfDay": {
			modelType: "TimeOfDay"
		},
		"Edm.Stream": {
			//no corresponding modelType - ignore for filtering
		}
	};
	return sType && sType in mDefaultTypeForEdmType && mDefaultTypeForEdmType[sType].modelType;
}
const _getSelectionFields = function (
	entityType: EntityType,
	navigationPath: string,
	properties: Array<Property> | undefined,
	includeHidden: boolean,
	converterContext: ConverterContext
): Record<string, FilterField> {
	const selectionFieldMap: Record<string, FilterField> = {};
	if (properties) {
		properties.forEach((property: Property) => {
			const propertyPath: string = property.name;
			const fullPath: string = (navigationPath ? `${navigationPath}/` : "") + propertyPath;
			const selectionField = _createFilterSelectionField(entityType, property, fullPath, includeHidden, converterContext);
			if (selectionField) {
				selectionFieldMap[fullPath] = selectionField;
			}
		});
	}
	return selectionFieldMap;
};

const _getSelectionFieldsByPath = function (
	entityType: EntityType,
	propertyPaths: Array<string> | undefined,
	includeHidden: boolean,
	converterContext: ConverterContext
): Record<string, FilterField> {
	let selectionFields: Record<string, FilterField> = {};
	if (propertyPaths) {
		propertyPaths.forEach((propertyPath: string) => {
			let localSelectionFields: Record<string, FilterField>;

			const property: Property | NavigationProperty = entityType.resolvePath(propertyPath);
			if (property === undefined) {
				return;
			}
			if (property._type === "NavigationProperty") {
				// handle navigation properties
				localSelectionFields = _getSelectionFields(
					entityType,
					propertyPath,
					property.targetType.entityProperties,
					includeHidden,
					converterContext
				);
			} else if (property.targetType !== undefined && property.targetType._type === "ComplexType") {
				// handle ComplexType properties
				localSelectionFields = _getSelectionFields(
					entityType,
					propertyPath,
					property.targetType.properties,
					includeHidden,
					converterContext
				);
			} else {
				const navigationPath = propertyPath.includes("/") ? propertyPath.split("/").splice(0, 1).join("/") : "";
				localSelectionFields = _getSelectionFields(entityType, navigationPath, [property], includeHidden, converterContext);
			}

			selectionFields = {
				...selectionFields,
				...localSelectionFields
			};
		});
	}
	return selectionFields;
};

const _getFilterField = function (
	filterFields: Record<string, FilterField>,
	propertyPath: string,
	converterContext: ConverterContext,
	entityType: EntityType
): FilterField | undefined {
	let filterField: FilterField | undefined = filterFields[propertyPath];

	if (filterField) {
		delete filterFields[propertyPath];
	} else {
		filterField = _createFilterSelectionField(entityType, entityType.resolvePath(propertyPath), propertyPath, true, converterContext);
	}
	// defined SelectionFields are available by default
	if (filterField) {
		filterField.availability = filterField.availability === AvailabilityType.Hidden ? AvailabilityType.Hidden : AvailabilityType.Default;
		filterField.isParameter = !!entityType.annotations?.Common?.ResultContext;
	} else {
		converterContext.getDiagnostics()?.addIssue(IssueCategory.Annotation, IssueSeverity.High, IssueType.MISSING_SELECTIONFIELD);
	}
	return filterField;
};

const _getDefaultFilterFields = function (
	aSelectOptions: any[],
	entityType: EntityType,
	converterContext: ConverterContext,
	excludedFilterProperties: Record<string, boolean>,
	annotatedSelectionFields: PropertyPath[]
): FilterField[] {
	const selectionFields: FilterField[] = [];
	const UISelectionFields: any = {};
	const properties = entityType.entityProperties;
	// Using entityType instead of entitySet
	annotatedSelectionFields?.forEach((SelectionField) => {
		UISelectionFields[SelectionField.value] = true;
	});
	if (aSelectOptions && aSelectOptions.length > 0) {
		aSelectOptions?.forEach((selectOption: SelectOptionType) => {
			const propertyName: any = selectOption.PropertyName;
			const sPropertyPath: string = propertyName.value;
			const currentSelectionFields: any = {};
			annotatedSelectionFields?.forEach((SelectionField) => {
				currentSelectionFields[SelectionField.value] = true;
			});
			if (!(sPropertyPath in excludedFilterProperties)) {
				if (!(sPropertyPath in currentSelectionFields)) {
					const FilterField: FilterField | undefined = getFilterField(sPropertyPath, converterContext, entityType);
					if (FilterField) {
						selectionFields.push(FilterField);
					}
				}
			}
		});
	} else if (properties) {
		properties.forEach((property: Property) => {
			const defaultFilterValue = property.annotations?.Common?.FilterDefaultValue;
			const propertyPath = property.name;
			if (!(propertyPath in excludedFilterProperties)) {
				if (defaultFilterValue && !(propertyPath in UISelectionFields)) {
					const FilterField: FilterField | undefined = getFilterField(propertyPath, converterContext, entityType);
					if (FilterField) {
						selectionFields.push(FilterField);
					}
				}
			}
		});
	}
	return selectionFields;
};

/**
 * Get all parameter filter fields in case of a parameterized service.
 *
 * @param converterContext
 * @returns An array of parameter FilterFields
 */
function _getParameterFields(converterContext: ConverterContext): FilterField[] {
	const dataModelObjectPath = converterContext.getDataModelObjectPath();
	const parameterEntityType = dataModelObjectPath.startingEntitySet.entityType;
	const isParameterized = !!parameterEntityType.annotations?.Common?.ResultContext && !dataModelObjectPath.targetEntitySet;
	const parameterConverterContext =
		isParameterized && converterContext.getConverterContextFor(`/${dataModelObjectPath.startingEntitySet.name}`);

	return (
		parameterConverterContext
			? parameterEntityType.entityProperties.map(function (property) {
					return _getFilterField(
						{} as Record<string, FilterField>,
						property.name,
						parameterConverterContext,
						parameterEntityType
					);
			  })
			: []
	) as FilterField[];
}

/**
 * Determines if the FilterBar search field is hidden or not.
 *
 * @param listReportTables The list report tables
 * @param charts The ALP charts
 * @param converterContext The converter context
 * @returns The information if the FilterBar search field is hidden or not
 */
export const getFilterBarhideBasicSearch = function (
	listReportTables: TableVisualization[],
	charts: ChartVisualization[],
	converterContext: ConverterContext
): boolean {
	// Check if charts allow search
	const noSearchInCharts = charts.length === 0 || charts.every((chart) => !chart.applySupported.enableSearch);

	// Check if all tables are analytical and none of them allow for search
	const noSearchInTables =
		listReportTables.length === 0 || listReportTables.every((table) => table.enableAnalytics && !table.enableAnalyticsSearch);

	const contextPath = converterContext.getContextPath();
	if (contextPath && noSearchInCharts && noSearchInTables) {
		return true;
	} else {
		return false;
	}
};

/**
 * Retrieves filter fields from the manifest.
 *
 * @param entityType The current entityType
 * @param converterContext The converter context
 * @returns The filter fields defined in the manifest
 */
export const getManifestFilterFields = function (
	entityType: EntityType,
	converterContext: ConverterContext
): Record<string, CustomElementFilterField> {
	const fbConfig: FilterManifestConfiguration = converterContext.getManifestWrapper().getFilterConfiguration();
	const definedFilterFields: Record<string, FilterFieldManifestConfiguration> = fbConfig?.filterFields || {};
	const selectionFields: Record<string, FilterField> = _getSelectionFieldsByPath(
		entityType,
		Object.keys(definedFilterFields).map((key) => KeyHelper.getPathFromSelectionFieldKey(key)),
		true,
		converterContext
	);
	const filterFields: Record<string, CustomElementFilterField> = {};

	for (const sKey in definedFilterFields) {
		const filterField = definedFilterFields[sKey];
		const propertyName = KeyHelper.getPathFromSelectionFieldKey(sKey);
		const selectionField = selectionFields[propertyName];
		const type = filterField.type === "Slot" ? filterFieldType.Slot : filterFieldType.Default;
		const visualFilter =
			filterField && filterField?.visualFilter
				? getVisualFilters(entityType, converterContext, sKey, definedFilterFields)
				: undefined;
		filterFields[sKey] = {
			key: sKey,
			type: type,
			annotationPath: selectionField?.annotationPath,
			conditionPath: selectionField?.conditionPath || propertyName,
			template: filterField.template,
			label: filterField.label,
			position: filterField.position || { placement: Placement.After },
			availability: filterField.availability || AvailabilityType.Default,
			settings: filterField.settings,
			visualFilter: visualFilter,
			required: filterField.required
		};
	}
	return filterFields;
};

export const getFilterField = function (propertyPath: string, converterContext: ConverterContext, entityType: EntityType) {
	return _getFilterField({}, propertyPath, converterContext, entityType);
};

export const getFilterRestrictions = function (oFilterRestrictionsAnnotation: any, sRestriction: any) {
	if (sRestriction === "RequiredProperties" || sRestriction === "NonFilterableProperties") {
		let aProps = [];
		if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation[sRestriction]) {
			aProps = oFilterRestrictionsAnnotation[sRestriction].map(function (oProperty: any) {
				return oProperty.$PropertyPath || oProperty.value;
			});
		}
		return aProps;
	} else if (sRestriction === "FilterAllowedExpressions") {
		const mAllowedExpressions = {} as any;
		if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation.FilterExpressionRestrictions) {
			oFilterRestrictionsAnnotation.FilterExpressionRestrictions.forEach(function (oProperty: any) {
				//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
				if (mAllowedExpressions[oProperty.Property.value]) {
					mAllowedExpressions[oProperty.Property.value].push(oProperty.AllowedExpressions);
				} else {
					mAllowedExpressions[oProperty.Property.value] = [oProperty.AllowedExpressions];
				}
			});
		}
		return mAllowedExpressions;
	}
	return oFilterRestrictionsAnnotation;
};

const getSearchFilterPropertyInfo = function () {
	return {
		name: "$search",
		path: "$search",
		dataType: sStringDataType,
		maxConditions: 1
	};
};

const getEditStateFilterPropertyInfo = function () {
	return {
		name: "$editState",
		path: "$editState",
		groupLabel: "",
		group: "",
		dataType: sStringDataType,
		hiddenFilter: false
	};
};

const getSearchRestrictions = function (converterContext: ConverterContext) {
	let searchRestrictions;
	if (!ModelHelper.isSingleton(converterContext.getEntitySet())) {
		const capabilites = converterContext.getEntitySet()?.annotations?.Capabilities as EntitySetAnnotations_Capabilities;
		searchRestrictions = capabilites?.SearchRestrictions;
	}
	return searchRestrictions;
};

export const getNavigationRestrictions = function (converterContext: ConverterContext, sNavigationPath: string) {
	const oNavigationRestrictions: any = converterContext.getEntitySet()?.annotations?.Capabilities?.NavigationRestrictions;
	const aRestrictedProperties = oNavigationRestrictions && oNavigationRestrictions.RestrictedProperties;
	return (
		aRestrictedProperties &&
		aRestrictedProperties.find(function (oRestrictedProperty: any) {
			return (
				oRestrictedProperty &&
				oRestrictedProperty.NavigationProperty &&
				(oRestrictedProperty.NavigationProperty.$NavigationPropertyPath === sNavigationPath ||
					oRestrictedProperty.NavigationProperty.value === sNavigationPath)
			);
		})
	);
};

const _fetchBasicPropertyInfo = function (oFilterFieldInfo: any) {
	return {
		key: oFilterFieldInfo.key,
		annotationPath: oFilterFieldInfo.annotationPath,
		conditionPath: oFilterFieldInfo.conditionPath,
		name: oFilterFieldInfo.conditionPath,
		label: oFilterFieldInfo.label,
		hiddenFilter: oFilterFieldInfo.availability === "Hidden",
		display: "Value",
		isParameter: oFilterFieldInfo.isParameter,
		caseSensitive: oFilterFieldInfo.caseSensitive,
		availability: oFilterFieldInfo.availability,
		position: oFilterFieldInfo.position,
		type: oFilterFieldInfo.type,
		template: oFilterFieldInfo.template,
		menu: oFilterFieldInfo.menu,
		required: oFilterFieldInfo.required
	};
};

export const getSpecificAllowedExpression = function (aExpressions: any) {
	const aAllowedExpressionsPriority = [
		"SingleValue",
		"MultiValue",
		"SingleRange",
		"MultiRange",
		"SearchExpression",
		"MultiRangeOrSearchExpression"
	];

	aExpressions.sort(function (a: any, b: any) {
		return aAllowedExpressionsPriority.indexOf(a) - aAllowedExpressionsPriority.indexOf(b);
	});

	return aExpressions[0];
};

export const displayMode = function (oPropertyAnnotations: any, oCollectionAnnotations: any) {
	const oTextAnnotation = oPropertyAnnotations?.Common?.Text,
		oTextArrangmentAnnotation =
			oTextAnnotation &&
			((oPropertyAnnotations && oPropertyAnnotations?.Common?.Text?.annotations?.UI?.TextArrangement) ||
				(oCollectionAnnotations && oCollectionAnnotations?.UI?.TextArrangement));

	if (oTextArrangmentAnnotation) {
		if (oTextArrangmentAnnotation.valueOf() === "UI.TextArrangementType/TextOnly") {
			return "Description";
		} else if (oTextArrangmentAnnotation.valueOf() === "UI.TextArrangementType/TextLast") {
			return "ValueDescription";
		}
		return "DescriptionValue"; //TextFirst
	}
	return oTextAnnotation ? "DescriptionValue" : "Value";
};

export const fetchPropertyInfo = function (converterContext: ConverterContext, oFilterFieldInfo: any, oTypeConfig: any) {
	let oPropertyInfo = _fetchBasicPropertyInfo(oFilterFieldInfo);
	const sAnnotationPath = oFilterFieldInfo.annotationPath;

	if (!sAnnotationPath) {
		return oPropertyInfo;
	}
	const targetPropertyObject = converterContext.getConverterContextFor(sAnnotationPath).getDataModelObjectPath().targetObject;

	const oPropertyAnnotations = targetPropertyObject?.annotations;
	const oCollectionAnnotations = converterContext?.getDataModelObjectPath().targetObject?.annotations;

	const oFormatOptions = oTypeConfig.formatOptions;
	const oConstraints = oTypeConfig.constraints;
	oPropertyInfo = Object.assign(oPropertyInfo, {
		formatOptions: oFormatOptions,
		constraints: oConstraints,
		display: displayMode(oPropertyAnnotations, oCollectionAnnotations)
	});
	return oPropertyInfo;
};

export const isMultiValue = function (oProperty: any) {
	let bIsMultiValue = true;
	//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
	switch (oProperty.filterExpression) {
		case "SearchExpression":
		case "SingleRange":
		case "SingleValue":
			bIsMultiValue = false;
			break;
		default:
			break;
	}
	if (oProperty.type && oProperty.type.indexOf("Boolean") > 0) {
		bIsMultiValue = false;
	}
	return bIsMultiValue;
};

const _isFilterableNavigationProperty = function (
	entry: DataFieldAbstractTypes
): entry is AnnotationTerm<DataField | DataFieldWithUrl | DataFieldWithNavigationPath> {
	return (
		(entry.$Type === UIAnnotationTypes.DataField ||
			entry.$Type === UIAnnotationTypes.DataFieldWithUrl ||
			entry.$Type === UIAnnotationTypes.DataFieldWithNavigationPath) &&
		entry.Value.path.includes("/")
	);
};

const getAnnotatedSelectionFieldData = function (
	converterContext: ConverterContext,
	lrTables: TableVisualization[] = [],
	annotationPath: string = "",
	includeHidden: boolean = false,
	lineItemTerm?: string
) {
	// Fetch all selectionVariants defined in the different visualizations and different views (multi table mode)
	const selectionVariants: SelectionVariantConfiguration[] = getSelectionVariants(lrTables, converterContext);

	// create a map of properties to be used in selection variants
	const excludedFilterProperties: Record<string, boolean> = getExcludedFilterProperties(selectionVariants);
	const entityType = converterContext.getEntityType();
	//Filters which has to be added which is part of SV/Default annotations but not present in the SelectionFields
	const annotatedSelectionFields = ((annotationPath && converterContext.getEntityTypeAnnotation(annotationPath)?.annotation) ||
		entityType.annotations?.UI?.SelectionFields ||
		[]) as PropertyPath[];

	const navProperties: string[] = [];
	if (lrTables.length === 0 && !!lineItemTerm) {
		(converterContext.getEntityTypeAnnotation(lineItemTerm).annotation as LineItem)?.forEach((entry) => {
			if (_isFilterableNavigationProperty(entry)) {
				const entityPath = entry.Value.path.slice(0, entry.Value.path.lastIndexOf("/"));
				if (!navProperties.includes(entityPath)) {
					navProperties.push(entityPath);
				}
			}
		});
	}

	// create a map of all potential filter fields based on...
	const filterFields: Record<string, FilterField> = {
		// ...non hidden properties of the entity
		..._getSelectionFields(entityType, "", entityType.entityProperties, includeHidden, converterContext),
		// ... non hidden properties of navigation properties
		..._getSelectionFieldsByPath(entityType, navProperties, false, converterContext),
		// ...additional manifest defined navigation properties
		..._getSelectionFieldsByPath(
			entityType,
			converterContext.getManifestWrapper().getFilterConfiguration().navigationProperties,
			includeHidden,
			converterContext
		)
	};
	let aSelectOptions: any[] = [];
	const selectionVariant = getSelectionVariant(entityType, converterContext);
	if (selectionVariant) {
		aSelectOptions = selectionVariant.SelectOptions;
	}

	const propertyInfoFields: any =
		annotatedSelectionFields?.reduce((selectionFields: FilterField[], selectionField) => {
			const propertyPath = selectionField.value;
			if (!(propertyPath in excludedFilterProperties)) {
				let navigationPath: string;
				if (annotationPath.startsWith("@com.sap.vocabularies.UI.v1.SelectionFields")) {
					navigationPath = "";
				} else {
					navigationPath = annotationPath.split("/@com.sap.vocabularies.UI.v1.SelectionFields")[0];
				}

				const filterPropertyPath = navigationPath ? navigationPath + "/" + propertyPath : propertyPath;
				const filterField: FilterField | undefined = _getFilterField(
					filterFields,
					filterPropertyPath,
					converterContext,
					entityType
				);
				if (filterField) {
					filterField.group = "";
					filterField.groupLabel = "";
					selectionFields.push(filterField);
				}
			}
			return selectionFields;
		}, []) || [];

	const defaultFilterFields = _getDefaultFilterFields(
		aSelectOptions,
		entityType,
		converterContext,
		excludedFilterProperties,
		annotatedSelectionFields
	);

	return {
		excludedFilterProperties: excludedFilterProperties,
		entityType: entityType,
		annotatedSelectionFields: annotatedSelectionFields,
		filterFields: filterFields,
		propertyInfoFields: propertyInfoFields,
		defaultFilterFields: defaultFilterFields
	};
};

export const fetchTypeConfig = function (property: Property) {
	const oTypeConfig = getTypeConfig(property, property?.type);
	if (property?.type === sEdmString && (oTypeConfig.constraints.nullable === undefined || oTypeConfig.constraints.nullable === true)) {
		oTypeConfig.formatOptions.parseKeepsEmptyString = false;
	}
	return oTypeConfig;
};

export const assignDataTypeToPropertyInfo = function (
	propertyInfoField: any,
	converterContext: ConverterContext,
	aRequiredProps: any,
	aTypeConfig: any
) {
	let oPropertyInfo: any = fetchPropertyInfo(converterContext, propertyInfoField, aTypeConfig[propertyInfoField.key]),
		sPropertyPath: string = "";
	if (propertyInfoField.conditionPath) {
		sPropertyPath = propertyInfoField.conditionPath.replace(/\+|\*/g, "");
	}
	if (oPropertyInfo) {
		oPropertyInfo = Object.assign(oPropertyInfo, {
			maxConditions: !oPropertyInfo.isParameter && isMultiValue(oPropertyInfo) ? -1 : 1,
			required: propertyInfoField.required ?? (oPropertyInfo.isParameter || aRequiredProps.indexOf(sPropertyPath) >= 0),
			caseSensitive: isFilteringCaseSensitive(converterContext),
			dataType: aTypeConfig[propertyInfoField.key].type
		});
	}
	return oPropertyInfo;
};

export const processSelectionFields = function (
	propertyInfoFields: any,
	converterContext: ConverterContext,
	defaultValuePropertyFields?: any
) {
	//get TypeConfig function
	const selectionFieldTypes: any = [];
	const aTypeConfig: any = {};

	if (defaultValuePropertyFields) {
		propertyInfoFields = propertyInfoFields.concat(defaultValuePropertyFields);
	}
	//add typeConfig
	propertyInfoFields.forEach(function (parameterField: any) {
		if (parameterField.annotationPath) {
			const propertyConvertyContext = converterContext.getConverterContextFor(parameterField.annotationPath);
			const propertyTargetObject = propertyConvertyContext.getDataModelObjectPath().targetObject;
			selectionFieldTypes.push(propertyTargetObject?.type);
			const oTypeConfig = fetchTypeConfig(propertyTargetObject);
			aTypeConfig[parameterField.key] = oTypeConfig;
		} else {
			selectionFieldTypes.push(sEdmString);
			aTypeConfig[parameterField.key] = { type: sStringDataType };
		}
	});

	// filterRestrictions
	let _oFilterrestrictions;
	if (!ModelHelper.isSingleton(converterContext.getEntitySet())) {
		_oFilterrestrictions = (converterContext.getEntitySet()?.annotations?.Capabilities as EntitySetAnnotations_Capabilities)
			?.FilterRestrictions;
	}
	const oFilterRestrictions = _oFilterrestrictions;
	const oRet = {} as any;
	oRet["RequiredProperties"] = getFilterRestrictions(oFilterRestrictions, "RequiredProperties") || [];
	oRet["NonFilterableProperties"] = getFilterRestrictions(oFilterRestrictions, "NonFilterableProperties") || [];
	oRet["FilterAllowedExpressions"] = getFilterRestrictions(oFilterRestrictions, "FilterAllowedExpressions") || {};

	const sEntitySetPath = converterContext.getContextPath();
	const aPathParts = sEntitySetPath.split("/");
	if (aPathParts.length > 2) {
		const sNavigationPath = aPathParts[aPathParts.length - 1];
		aPathParts.splice(-1, 1);
		const oNavigationRestrictions = getNavigationRestrictions(converterContext, sNavigationPath);
		const oNavigationFilterRestrictions = oNavigationRestrictions && oNavigationRestrictions.FilterRestrictions;
		oRet.RequiredProperties.concat(getFilterRestrictions(oNavigationFilterRestrictions, "RequiredProperties") || []);
		oRet.NonFilterableProperties.concat(getFilterRestrictions(oNavigationFilterRestrictions, "NonFilterableProperties") || []);
		oRet.FilterAllowedExpressions = {
			...(getFilterRestrictions(oNavigationFilterRestrictions, "FilterAllowedExpressions") || {}),
			...oRet.FilterAllowedExpressions
		};
	}
	const aRequiredProps = oRet.RequiredProperties;
	const aNonFilterableProps = oRet.NonFilterableProperties;
	const aFetchedProperties: any = [];

	// process the fields to add necessary properties
	propertyInfoFields.forEach(function (propertyInfoField: any) {
		let sPropertyPath;
		if (aNonFilterableProps.indexOf(sPropertyPath) === -1) {
			const oPropertyInfo = assignDataTypeToPropertyInfo(propertyInfoField, converterContext, aRequiredProps, aTypeConfig);
			aFetchedProperties.push(oPropertyInfo);
		}
	});

	//add edit
	const dataModelObjectPath = converterContext.getDataModelObjectPath();
	if (ModelHelper.isObjectPathDraftSupported(dataModelObjectPath)) {
		aFetchedProperties.push(getEditStateFilterPropertyInfo());
	}
	// add search
	const searchRestrictions = getSearchRestrictions(converterContext);
	const hideBasicSearch = Boolean(searchRestrictions && !searchRestrictions.Searchable);
	if (sEntitySetPath && hideBasicSearch !== true) {
		if (!searchRestrictions || searchRestrictions?.Searchable) {
			aFetchedProperties.push(getSearchFilterPropertyInfo());
		}
	}

	return aFetchedProperties;
};

export const insertCustomManifestElements = function (
	filterFields: FilterField[],
	entityType: EntityType,
	converterContext: ConverterContext
) {
	return insertCustomElements(filterFields, getManifestFilterFields(entityType, converterContext), {
		"availability": "overwrite",
		label: "overwrite",
		type: "overwrite",
		position: "overwrite",
		template: "overwrite",
		settings: "overwrite",
		visualFilter: "overwrite",
		required: "overwrite"
	});
};

/**
 * Retrieve the configuration for the selection fields that will be used within the filter bar
 * This configuration takes into account the annotation and the selection variants.
 *
 * @param converterContext
 * @param lrTables
 * @param annotationPath
 * @param [includeHidden]
 * @param [lineItemTerm]
 * @returns An array of selection fields
 */
export const getSelectionFields = function (
	converterContext: ConverterContext,
	lrTables: TableVisualization[] = [],
	annotationPath: string = "",
	includeHidden?: boolean,
	lineItemTerm?: string
): any {
	const oAnnotatedSelectionFieldData = getAnnotatedSelectionFieldData(
		converterContext,
		lrTables,
		annotationPath,
		includeHidden,
		lineItemTerm
	);
	const parameterFields = _getParameterFields(converterContext);
	let propertyInfoFields: FilterField[] = JSON.parse(JSON.stringify(oAnnotatedSelectionFieldData.propertyInfoFields));
	const entityType = oAnnotatedSelectionFieldData.entityType;

	propertyInfoFields = parameterFields.concat(propertyInfoFields);

	propertyInfoFields = insertCustomManifestElements(propertyInfoFields, entityType, converterContext);

	const aFetchedProperties = processSelectionFields(
		propertyInfoFields,
		converterContext,
		oAnnotatedSelectionFieldData.defaultFilterFields
	);
	aFetchedProperties.sort(function (a: any, b: any) {
		if (a.groupLabel === undefined || a.groupLabel === null) {
			return -1;
		}
		if (b.groupLabel === undefined || b.groupLabel === null) {
			return 1;
		}
		return a.groupLabel.localeCompare(b.groupLabel);
	});

	let sFetchProperties = JSON.stringify(aFetchedProperties);
	sFetchProperties = sFetchProperties.replace(/\{/g, "\\{");
	sFetchProperties = sFetchProperties.replace(/\}/g, "\\}");
	const sPropertyInfo = sFetchProperties;
	// end of propertyFields processing

	// to populate selection fields
	let propSelectionFields: FilterField[] = JSON.parse(JSON.stringify(oAnnotatedSelectionFieldData.propertyInfoFields));
	propSelectionFields = parameterFields.concat(propSelectionFields);
	// create a map of properties to be used in selection variants
	const excludedFilterProperties: Record<string, boolean> = oAnnotatedSelectionFieldData.excludedFilterProperties;
	const filterFacets = entityType?.annotations?.UI?.FilterFacets;
	let filterFacetMap: Record<string, FilterGroup> = {};

	const aFieldGroups = converterContext.getAnnotationsByTerm("UI", UIAnnotationTerms.FieldGroup);

	if (filterFacets === undefined || filterFacets.length < 0) {
		for (const i in aFieldGroups) {
			filterFacetMap = {
				...filterFacetMap,
				...getFieldGroupFilterGroups(aFieldGroups[i])
			};
		}
	} else {
		filterFacetMap = filterFacets.reduce((previousValue: Record<string, FilterGroup>, filterFacet: ReferenceFacetTypes) => {
			for (let i = 0; i < (filterFacet?.Target?.$target as FieldGroup)?.Data?.length; i++) {
				previousValue[((filterFacet?.Target?.$target as FieldGroup)?.Data[i] as DataFieldTypes)?.Value?.path] = {
					group: filterFacet?.ID?.toString(),
					groupLabel: filterFacet?.Label?.toString()
				};
			}
			return previousValue;
		}, {});
	}

	// create a map of all potential filter fields based on...
	const filterFields: Record<string, FilterField> = oAnnotatedSelectionFieldData.filterFields;

	// finally create final list of filter fields by adding the SelectionFields first (order matters)...
	let allFilters = propSelectionFields

		// ...and adding remaining filter fields, that are not used in a SelectionVariant (order doesn't matter)
		.concat(
			Object.keys(filterFields)
				.filter((propertyPath) => !(propertyPath in excludedFilterProperties))
				.map((propertyPath) => {
					return Object.assign(filterFields[propertyPath], filterFacetMap[propertyPath]);
				})
		);
	const sContextPath = converterContext.getContextPath();

	//if all tables are analytical tables "aggregatable" properties must be excluded
	if (checkAllTableForEntitySetAreAnalytical(lrTables, sContextPath)) {
		// Currently all agregates are root entity properties (no properties coming from navigation) and all
		// tables with same entitySet gets same aggreagte configuration that's why we can use first table into
		// LR to get aggregates (without currency/unit properties since we expect to be able to filter them).
		const aggregates = lrTables[0].aggregates;
		if (aggregates) {
			const aggregatableProperties: string[] = Object.keys(aggregates).map((aggregateKey) => aggregates[aggregateKey].relativePath);
			allFilters = allFilters.filter((filterField) => {
				return aggregatableProperties.indexOf(filterField.key) === -1;
			});
		}
	}

	const selectionFields = insertCustomManifestElements(allFilters, entityType, converterContext);

	// Add caseSensitive property to all selection fields.
	const isCaseSensitive = isFilteringCaseSensitive(converterContext);
	selectionFields.forEach((filterField) => {
		filterField.caseSensitive = isCaseSensitive;
	});

	return { selectionFields, sPropertyInfo };
};

/**
 * Determines whether the filter bar inside a value help dialog should be expanded. This is true if one of the following conditions hold:
 * (1) a filter property is mandatory,
 * (2) no search field exists (entity isn't search enabled),
 * (3) when the data isn't loaded by default (annotation FetchValues = 2).
 *
 * @param converterContext The converter context
 * @param filterRestrictionsAnnotation The FilterRestriction annotation
 * @param valueListAnnotation The ValueList annotation
 * @returns The value for expandFilterFields
 */
export const getExpandFilterFields = function (
	converterContext: ConverterContext,
	filterRestrictionsAnnotation: any,
	valueListAnnotation: any
): boolean {
	const requiredProperties = getFilterRestrictions(filterRestrictionsAnnotation, "RequiredProperties");
	const searchRestrictions = getSearchRestrictions(converterContext);
	const hideBasicSearch = Boolean(searchRestrictions && !searchRestrictions.Searchable);
	const valueList = valueListAnnotation.getObject();
	if (requiredProperties.length > 0 || hideBasicSearch || valueList?.FetchValues === 2) {
		return true;
	}
	return false;
};
