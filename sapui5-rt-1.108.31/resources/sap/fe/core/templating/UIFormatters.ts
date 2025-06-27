import type { NavigationProperty, PathAnnotationExpression, Property } from "@sap-ux/vocabularies-types";
import type { DataFieldAbstractTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import { singletonPathVisitor, UI } from "sap/fe/core/converters/helpers/BindingHelper";
import { convertMetaModelContext, getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import valueFormatters from "sap/fe/core/formatters/ValueFormatter";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression, PathInModelExpression } from "sap/fe/core/helpers/BindingToolkit";
import {
	addTypeInformation,
	and,
	compileExpression,
	constant,
	equal,
	formatResult,
	getExpressionFromAnnotation,
	ifElse,
	isConstant,
	isTruthy,
	not,
	notEqual,
	or,
	pathInModel
} from "sap/fe/core/helpers/BindingToolkit";
import {
	DataModelObjectPath,
	getContextRelativeTargetObjectPath,
	getRelativePaths,
	getTargetObjectPath,
	isPathUpdatable
} from "sap/fe/core/templating/DataModelPathHelper";
import * as DisplayModeFormatter from "sap/fe/core/templating/DisplayModeFormatter";
import {
	isDisabledExpression,
	isNonEditableExpression,
	isReadOnlyExpression,
	isRequiredExpression
} from "sap/fe/core/templating/FieldControlHelper";
import {
	getAssociatedCurrencyProperty,
	getAssociatedUnitProperty,
	hasValueHelp,
	isComputed,
	isImmutable,
	isKey,
	isPathExpression,
	isProperty
} from "sap/fe/core/templating/PropertyHelper";
import type Context from "sap/ui/model/odata/v4/Context";

// Import-export method used by the converter to use them in the templating through the UIFormatters.
export type DisplayMode = DisplayModeFormatter.DisplayMode;

export const EDM_TYPE_MAPPING = DisplayModeFormatter.EDM_TYPE_MAPPING;

export type PropertyOrPath<P> = string | P | PathAnnotationExpression<P>;
export type MetaModelContext = {
	$kind: string;
};
export type ComputedAnnotationInterface = {
	context: Context;
	arguments?: any[];
	$$valueAsPromise?: boolean;
};

export type configTypeConstraints = {
	scale?: number;
	precision?: number;
	maxLength?: number;
	nullable?: boolean;
	minimum?: string;
	maximum?: string;
	isDigitSequence?: boolean;
	V4?: boolean;
};

export type configTypeformatOptions = {
	parseAsString?: boolean;
	emptyString?: string;
	parseKeepsEmptyString?: boolean;
};

export type configType = {
	type: string;
	constraints: configTypeConstraints;
	formatOptions: configTypeformatOptions;
};

export const getDisplayMode = function (oDataModelObjectPath: DataModelObjectPath): DisplayMode {
	return DisplayModeFormatter.getDisplayMode(oDataModelObjectPath.targetObject, oDataModelObjectPath);
};
export const getEditableExpressionAsObject = function (
	oPropertyPath: PropertyOrPath<Property>,
	oDataFieldConverted: any = null,
	oDataModelObjectPath: DataModelObjectPath,
	isEditable: BindingToolkitExpression<boolean> = UI.IsEditable
): BindingToolkitExpression<boolean> {
	return getEditableExpression(
		oPropertyPath,
		oDataFieldConverted,
		oDataModelObjectPath,
		true,
		isEditable
	) as BindingToolkitExpression<boolean>;
};
/**
 * Create the expression to generate an "editable" boolean value.
 *
 * @param oPropertyPath The input property
 * @param oDataFieldConverted The DataFieldConverted object to read the fieldControl annotation
 * @param oDataModelObjectPath The path to this property object
 * @param bAsObject Whether or not this should be returned as an object or a binding string
 * @param isEditable Whether or not UI.IsEditable be considered.
 * @returns The binding expression used to determine if a property is editable or not
 */
export const getEditableExpression = function (
	oPropertyPath: PropertyOrPath<Property>,
	oDataFieldConverted: any = null,
	oDataModelObjectPath: DataModelObjectPath,
	bAsObject: boolean = false,
	isEditable: BindingToolkitExpression<boolean> = UI.IsEditable
): CompiledBindingToolkitExpression | BindingToolkitExpression<boolean> {
	if (!oPropertyPath || typeof oPropertyPath === "string") {
		return compileExpression(false);
	}
	let dataFieldEditableExpression: BindingToolkitExpression<boolean> = constant(true);
	if (oDataFieldConverted !== null) {
		dataFieldEditableExpression = ifElse(isNonEditableExpression(oDataFieldConverted), false, isEditable);
	}

	const oProperty: Property = (isPathExpression(oPropertyPath) && oPropertyPath.$target) || (oPropertyPath as Property);
	const relativePath = getRelativePaths(oDataModelObjectPath);
	// Editability depends on the field control expression
	// If the Field control is statically in ReadOnly or Inapplicable (disabled) -> not editable
	// If the property is a key -> not editable except in creation if not computed
	// If the property is computed -> not editable
	// If the property is not updatable -> not editable
	// If the property is immutable -> not editable except in creation
	// If the Field control is a path resolving to ReadOnly or Inapplicable (disabled) (<= 1) -> not editable
	// Else, to be editable you need
	// immutable and key while in the creation row
	// ui/isEditable
	const isPathUpdatableExpression = isPathUpdatable(oDataModelObjectPath, {
		propertyPath: oPropertyPath,
		pathVisitor: (path: string, navigationPaths: string[]) =>
			singletonPathVisitor(path, oDataModelObjectPath.convertedTypes, navigationPaths)
	});
	const editableExpression = ifElse(
		or(
			not(isPathUpdatableExpression),
			isComputed(oProperty),
			isKey(oProperty),
			isImmutable(oProperty),
			isNonEditableExpression(oProperty, relativePath)
		),
		ifElse(or(isComputed(oProperty), isNonEditableExpression(oProperty, relativePath)), false, UI.IsTransientBinding),
		isEditable
	);
	if (bAsObject) {
		return and(editableExpression, dataFieldEditableExpression);
	}
	return compileExpression(and(editableExpression, dataFieldEditableExpression));
};

export const getCollaborationExpression = function (
	dataModelObjectPath: DataModelObjectPath,
	formatter: any
): BindingToolkitExpression<any> {
	const objectPath = getTargetObjectPath(dataModelObjectPath);
	const activityExpression = pathInModel(`/collaboration/activities${objectPath}`, "internal");
	const keys = dataModelObjectPath?.targetEntityType?.keys;
	const keysExpressions: BindingToolkitExpression<any>[] = [];
	keys?.forEach(function (key) {
		const keyExpression = pathInModel(key.name);
		keysExpressions.push(keyExpression);
	});
	return formatResult([activityExpression, ...keysExpressions], formatter);
};
export const getEnabledExpressionAsObject = function (
	oPropertyPath: PropertyOrPath<Property>,
	oDataFieldConverted?: any,
	oDataModelObjectPath?: DataModelObjectPath
): BindingToolkitExpression<boolean> {
	return getEnabledExpression(oPropertyPath, oDataFieldConverted, true, oDataModelObjectPath) as BindingToolkitExpression<boolean>;
};
/**
 * Create the expression to generate an "enabled" Boolean value.
 *
 * @param oPropertyPath The input property
 * @param oDataFieldConverted The DataFieldConverted Object to read the fieldControl annotation
 * @param bAsObject Whether or not this should be returned as an object or a binding string
 * @param oDataModelObjectPath
 * @returns The binding expression to determine if a property is enabled or not
 */
export const getEnabledExpression = function (
	oPropertyPath: PropertyOrPath<Property>,
	oDataFieldConverted?: any,
	bAsObject: boolean = false,
	oDataModelObjectPath?: DataModelObjectPath
): CompiledBindingToolkitExpression | BindingToolkitExpression<boolean> {
	if (!oPropertyPath || typeof oPropertyPath === "string") {
		return compileExpression(true);
	}
	let relativePath;
	if (oDataModelObjectPath) {
		relativePath = getRelativePaths(oDataModelObjectPath);
	}
	let dataFieldEnabledExpression: BindingToolkitExpression<boolean> = constant(true);
	if (oDataFieldConverted !== null) {
		dataFieldEnabledExpression = ifElse(isDisabledExpression(oDataFieldConverted), false, true);
	}

	const oProperty: Property = (isPathExpression(oPropertyPath) && oPropertyPath.$target) || (oPropertyPath as Property);
	// Enablement depends on the field control expression
	// If the Field control is statically in Inapplicable (disabled) -> not enabled
	const enabledExpression = ifElse(isDisabledExpression(oProperty, relativePath), false, true);
	if (bAsObject) {
		return and(enabledExpression, dataFieldEnabledExpression);
	}
	return compileExpression(and(enabledExpression, dataFieldEnabledExpression));
};

/**
 * Create the expression to generate an "editMode" enum value.
 *
 * @param oPropertyPath The input property
 * @param oDataModelObjectPath The list of data model objects that are involved to reach that property
 * @param bMeasureReadOnly Whether we should set UoM / currency field mode to read only
 * @param bAsObject Whether we should return this as an expression or as a string
 * @param oDataFieldConverted The dataField object
 * @param isEditable Whether or not UI.IsEditable be considered.
 * @returns The binding expression representing the current property edit mode, compliant with the MDC Field definition of editMode.
 */
export const getEditMode = function (
	oPropertyPath: PropertyOrPath<Property>,
	oDataModelObjectPath: DataModelObjectPath,
	bMeasureReadOnly: boolean = false,
	bAsObject: boolean = false,
	oDataFieldConverted: any = null,
	isEditable: BindingToolkitExpression<boolean> = UI.IsEditable
): CompiledBindingToolkitExpression | BindingToolkitExpression<string> {
	if (!oPropertyPath || typeof oPropertyPath === "string") {
		return "Display";
	}
	const oProperty: Property = (isPathExpression(oPropertyPath) && oPropertyPath.$target) || (oPropertyPath as Property);
	const relativePath = getRelativePaths(oDataModelObjectPath);
	// if the property is not enabled => Disabled
	// if the property is enabled && not editable => ReadOnly
	// if the property is enabled && editable => Editable
	// If there is an associated unit, and it has a field control also use consider the following
	// if the unit field control is readonly -> EditableReadOnly
	// otherwise -> Editable
	const editableExpression = getEditableExpressionAsObject(oPropertyPath, oDataFieldConverted, oDataModelObjectPath, isEditable);

	const enabledExpression = getEnabledExpressionAsObject(oPropertyPath, oDataFieldConverted, oDataModelObjectPath);
	const associatedCurrencyProperty = getAssociatedCurrencyProperty(oProperty);
	const unitProperty = associatedCurrencyProperty || getAssociatedUnitProperty(oProperty);
	let resultExpression: BindingToolkitExpression<string> = constant("Editable");
	if (unitProperty) {
		const isUnitReadOnly = isReadOnlyExpression(unitProperty, relativePath);
		resultExpression = ifElse(
			or(isUnitReadOnly, isComputed(unitProperty), bMeasureReadOnly),
			ifElse(!isConstant(isUnitReadOnly) && isUnitReadOnly, "EditableReadOnly", "EditableDisplay"),
			"Editable"
		);
	}
	const readOnlyExpression = or(isReadOnlyExpression(oProperty, relativePath), isReadOnlyExpression(oDataFieldConverted));

	// if the property is from a non-updatable entity => Read only mode, previously calculated edit Mode is ignored
	// if the property is from an updatable entity => previously calculated edit Mode expression
	const editModeExpression = ifElse(
		enabledExpression,
		ifElse(
			editableExpression,
			resultExpression,
			ifElse(and(!isConstant(readOnlyExpression) && readOnlyExpression, isEditable), "ReadOnly", "Display")
		),
		ifElse(isEditable, "Disabled", "Display")
	);
	if (bAsObject) {
		return editModeExpression;
	}
	return compileExpression(editModeExpression);
};

export const hasValidAnalyticalCurrencyOrUnit = function (
	oPropertyDataModelObjectPath: DataModelObjectPath
): CompiledBindingToolkitExpression {
	const oPropertyDefinition = oPropertyDataModelObjectPath.targetObject as Property;
	const currency = oPropertyDefinition.annotations?.Measures?.ISOCurrency;
	const measure = currency ? currency : oPropertyDefinition.annotations?.Measures?.Unit;
	if (measure) {
		return compileExpression(or(isTruthy(getExpressionFromAnnotation(measure) as BindingToolkitExpression<string>), not(UI.IsTotal)));
	} else {
		return compileExpression(constant(true));
	}
};

export const ifUnitEditable = function (
	oPropertyPath: PropertyOrPath<Property>,
	sEditableValue: BindingToolkitExpression<string> | string,
	sNonEditableValue: BindingToolkitExpression<string> | string
): CompiledBindingToolkitExpression {
	const oProperty = (isPathExpression(oPropertyPath) && oPropertyPath.$target) || (oPropertyPath as Property);
	const unitProperty = getAssociatedCurrencyProperty(oProperty) || getAssociatedUnitProperty(oProperty);
	if (!unitProperty) {
		return compileExpression(sNonEditableValue);
	}
	const isUnitReadOnly = isReadOnlyExpression(unitProperty);
	const editableExpression = and(or(!isConstant(isUnitReadOnly), not(isUnitReadOnly)), not(isComputed(unitProperty)));
	return compileExpression(ifElse(editableExpression, sEditableValue, sNonEditableValue));
};

export const getFieldDisplay = function (
	oPropertyPath: PropertyOrPath<Property>,
	sTargetDisplayMode: string,
	oComputedEditMode: BindingToolkitExpression<string>
): CompiledBindingToolkitExpression {
	const oProperty = (isPathExpression(oPropertyPath) && oPropertyPath.$target) || (oPropertyPath as Property);

	return hasValueHelp(oProperty)
		? compileExpression(sTargetDisplayMode)
		: compileExpression(ifElse(equal(oComputedEditMode, "Editable"), "Value", sTargetDisplayMode));
};

export const formatWithTypeInformation = function (
	oProperty: Property,
	propertyBindingExpression: BindingToolkitExpression<string>,
	ignoreConstraints = false
): BindingToolkitExpression<string> {
	const outExpression: PathInModelExpression<any> = propertyBindingExpression as PathInModelExpression<any>;
	if (oProperty._type === "Property") {
		const oTargetMapping = EDM_TYPE_MAPPING[oProperty.type];
		if (oTargetMapping) {
			outExpression.type = oTargetMapping.type;
			if (oTargetMapping.constraints && !ignoreConstraints) {
				outExpression.constraints = {};
				if (oTargetMapping.constraints.$Scale && oProperty.scale !== undefined) {
					outExpression.constraints.scale = oProperty.scale;
				}
				if (oTargetMapping.constraints.$Precision && oProperty.precision !== undefined) {
					outExpression.constraints.precision = oProperty.precision;
				}
				if (oTargetMapping.constraints.$MaxLength && oProperty.maxLength !== undefined) {
					outExpression.constraints.maxLength = oProperty.maxLength;
				}
				if (oProperty.nullable === false) {
					outExpression.constraints.nullable = oProperty.nullable;
				}
				if (
					oTargetMapping.constraints["@Org.OData.Validation.V1.Minimum/$Decimal"] &&
					oProperty.annotations?.Validation?.Minimum !== undefined &&
					!isNaN(oProperty.annotations.Validation.Minimum)
				) {
					outExpression.constraints.minimum = `${oProperty.annotations.Validation.Minimum}`;
				}
				if (
					oTargetMapping.constraints["@Org.OData.Validation.V1.Maximum/$Decimal"] &&
					oProperty.annotations?.Validation?.Maximum !== undefined &&
					!isNaN(oProperty.annotations.Validation.Maximum)
				) {
					outExpression.constraints.maximum = `${oProperty.annotations.Validation.Maximum}`;
				}
			} else if (oProperty.nullable === false) {
				outExpression.constraints = {};
				outExpression.constraints.nullable = oProperty.nullable;
			}
			if (outExpression?.type?.indexOf("sap.ui.model.odata.type.Int") === 0) {
				if (!outExpression.formatOptions) {
					outExpression.formatOptions = {};
				}
				outExpression.formatOptions = Object.assign(outExpression.formatOptions, {
					parseAsString: false,
					emptyString: ""
				});
			}
			if (outExpression.type === "sap.ui.model.odata.type.String") {
				if (!outExpression.formatOptions) {
					outExpression.formatOptions = {};
				}
				outExpression.formatOptions.parseKeepsEmptyString = true;

				if (
					oTargetMapping.constraints?.["@com.sap.vocabularies.Common.v1.IsDigitSequence"] &&
					oProperty.annotations?.Common?.IsDigitSequence
				) {
					outExpression.constraints.isDigitSequence = true;
				}
			}
			if (outExpression?.type?.indexOf("sap.ui.model.odata.type.Double") === 0) {
				if (!outExpression.formatOptions) {
					outExpression.formatOptions = {};
				}
				outExpression.formatOptions = Object.assign(outExpression.formatOptions, {
					parseAsString: false,
					emptyString: ""
				});
			}
			if (outExpression?.type?.indexOf("sap.ui.model.odata.type.DateTimeOffset") === 0) {
				outExpression.constraints.V4 = true;
			}
		}
	}
	return outExpression;
};

export const getTypeConfig = function (oProperty: Property | DataFieldAbstractTypes, dataType: string | undefined): any {
	const oTargetMapping = EDM_TYPE_MAPPING[(oProperty as Property)?.type] || (dataType ? EDM_TYPE_MAPPING[dataType] : undefined);
	const propertyTypeConfig: configType = {
		type: oTargetMapping.type,
		constraints: {},
		formatOptions: {}
	};
	if (isProperty(oProperty)) {
		propertyTypeConfig.constraints = {
			scale: oTargetMapping.constraints?.$Scale ? oProperty.scale : undefined,
			precision: oTargetMapping.constraints?.$Precision ? oProperty.precision : undefined,
			maxLength: oTargetMapping.constraints?.$MaxLength ? oProperty.maxLength : undefined,
			nullable: oTargetMapping.constraints?.$Nullable ? oProperty.nullable : undefined,
			minimum:
				oTargetMapping.constraints?.["@Org.OData.Validation.V1.Minimum/$Decimal"] &&
				!isNaN(oProperty.annotations?.Validation?.Minimum)
					? `${oProperty.annotations?.Validation?.Minimum}`
					: undefined,
			maximum:
				oTargetMapping.constraints?.["@Org.OData.Validation.V1.Maximum/$Decimal"] &&
				!isNaN(oProperty.annotations?.Validation?.Maximum)
					? `${oProperty.annotations?.Validation?.Maximum}`
					: undefined,
			isDigitSequence:
				propertyTypeConfig.type === "sap.ui.model.odata.type.String" &&
				oTargetMapping.constraints?.["@com.sap.vocabularies.Common.v1.IsDigitSequence"] &&
				oProperty.annotations?.Common?.IsDigitSequence
					? true
					: undefined,
			V4: oTargetMapping.constraints?.$V4 ? true : undefined
		};
	}
	propertyTypeConfig.formatOptions = {
		parseAsString:
			propertyTypeConfig?.type?.indexOf("sap.ui.model.odata.type.Int") === 0 ||
			propertyTypeConfig?.type?.indexOf("sap.ui.model.odata.type.Double") === 0
				? false
				: undefined,
		emptyString:
			propertyTypeConfig?.type?.indexOf("sap.ui.model.odata.type.Int") === 0 ||
			propertyTypeConfig?.type?.indexOf("sap.ui.model.odata.type.Double") === 0
				? ""
				: undefined,
		parseKeepsEmptyString: propertyTypeConfig.type === "sap.ui.model.odata.type.String" ? true : undefined
	};
	return propertyTypeConfig;
};

export const getBindingWithUnitOrCurrency = function (
	oPropertyDataModelPath: DataModelObjectPath,
	propertyBindingExpression: BindingToolkitExpression<string>,
	ignoreUnitConstraint?: boolean,
	formatOptions?: any
): BindingToolkitExpression<string> {
	const oPropertyDefinition = oPropertyDataModelPath.targetObject as Property;
	let unit = oPropertyDefinition.annotations?.Measures?.Unit;
	const relativeLocation = getRelativePaths(oPropertyDataModelPath);
	propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);
	if (unit?.toString() === "%") {
		if (formatOptions?.showMeasure === false) {
			return propertyBindingExpression;
		}
		return formatResult([propertyBindingExpression], valueFormatters.formatWithPercentage);
	}
	const complexType = unit ? "sap.ui.model.odata.type.Unit" : "sap.ui.model.odata.type.Currency";
	unit = unit ? unit : (oPropertyDefinition.annotations?.Measures?.ISOCurrency as any);
	const unitBindingExpression = (unit as any).$target
		? formatWithTypeInformation(
				(unit as any).$target,
				getExpressionFromAnnotation(unit, relativeLocation) as BindingToolkitExpression<string>,
				ignoreUnitConstraint
		  )
		: (getExpressionFromAnnotation(unit, relativeLocation) as BindingToolkitExpression<string>);

	return addTypeInformation([propertyBindingExpression, unitBindingExpression], complexType, undefined, formatOptions);
};

export const getBindingForUnitOrCurrency = function (
	oPropertyDataModelPath: DataModelObjectPath
): BindingToolkitExpression<string> | string {
	const oPropertyDefinition = oPropertyDataModelPath.targetObject as Property;

	let unit = oPropertyDefinition.annotations?.Measures?.Unit;
	if (unit?.toString() === "%") {
		return constant("%");
	}
	const relativeLocation = getRelativePaths(oPropertyDataModelPath);

	const complexType = unit ? "sap.ui.model.odata.type.Unit" : "sap.ui.model.odata.type.Currency";
	unit = unit ? unit : (oPropertyDefinition.annotations?.Measures?.ISOCurrency as any);
	const unitBindingExpression = (unit as any).$target
		? formatWithTypeInformation(
				(unit as any).$target,
				getExpressionFromAnnotation(unit, relativeLocation) as BindingToolkitExpression<string>
		  )
		: (getExpressionFromAnnotation(unit, relativeLocation) as BindingToolkitExpression<string>);

	let propertyBindingExpression = pathInModel(
		getContextRelativeTargetObjectPath(oPropertyDataModelPath)
	) as BindingToolkitExpression<string>;
	propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression, true);
	return addTypeInformation([propertyBindingExpression, unitBindingExpression], complexType, undefined, {
		parseKeepsEmptyString: true,
		emptyString: "",
		showNumber: false
	});
};
export const getBindingWithTimezone = function (
	oPropertyDataModelPath: DataModelObjectPath,
	propertyBindingExpression: BindingToolkitExpression<string>,
	ignoreUnitConstraint = false,
	hideTimezoneForEmptyValues = false
): BindingToolkitExpression<string> {
	const oPropertyDefinition = oPropertyDataModelPath.targetObject as Property;
	const timezone = oPropertyDefinition.annotations?.Common?.Timezone;
	const relativeLocation = getRelativePaths(oPropertyDataModelPath);
	propertyBindingExpression = formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);

	const complexType = "sap.fe.core.type.DateTimeWithTimezone";
	const unitBindingExpression = (timezone as any).$target
		? formatWithTypeInformation(
				(timezone as any).$target,
				getExpressionFromAnnotation(timezone, relativeLocation) as BindingToolkitExpression<string>,
				ignoreUnitConstraint
		  )
		: (getExpressionFromAnnotation(timezone, relativeLocation) as BindingToolkitExpression<string>);
	let formatOptions;
	if (hideTimezoneForEmptyValues) {
		formatOptions = {
			showTimezoneForEmptyValues: false
		};
	}
	return addTypeInformation([propertyBindingExpression, unitBindingExpression], complexType, undefined, formatOptions);
};

export const getAlignmentExpression = function (
	oComputedEditMode: BindingToolkitExpression<string>,
	sAlignDisplay: string = "Begin",
	sAlignEdit: string = "Begin"
): CompiledBindingToolkitExpression | BindingToolkitExpression<string> {
	return compileExpression(ifElse(equal(oComputedEditMode, "Display"), sAlignDisplay, sAlignEdit));
};

/**
 * Formatter helper to retrieve the converterContext from the metamodel context.
 *
 * @param oContext The original metamodel context
 * @param oInterface The current templating context
 * @returns The ConverterContext representing that object
 */
export const getConverterContext = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): object | null {
	if (oInterface && oInterface.context) {
		return convertMetaModelContext(oInterface.context);
	}
	return null;
};
getConverterContext.requiresIContext = true;

/**
 * Formatter helper to retrieve the data model objects that are involved from the metamodel context.
 *
 * @param oContext The original ODataMetaModel context
 * @param oInterface The current templating context
 * @returns An array of entitysets and navproperties that are involved to get to a specific object in the metamodel
 */
export const getDataModelObjectPath = function (
	oContext: MetaModelContext,
	oInterface: ComputedAnnotationInterface
): DataModelObjectPath | null {
	if (oInterface && oInterface.context) {
		return getInvolvedDataModelObjects(oInterface.context);
	}
	return null;
};
getDataModelObjectPath.requiresIContext = true;

export const isCollectionField = function (oDataModelPath: DataModelObjectPath): boolean {
	if (oDataModelPath.navigationProperties?.length) {
		const hasOneToManyNavigation =
			oDataModelPath?.navigationProperties.findIndex((oNav: NavigationProperty) => {
				if (oNav.isCollection) {
					if (oDataModelPath.contextLocation?.navigationProperties?.length) {
						//we check the one to many nav is not already part of the context
						return (
							oDataModelPath.contextLocation?.navigationProperties.findIndex(
								(oContextNav: NavigationProperty) => oContextNav.name === oNav.name
							) === -1
						);
					}
					return true;
				}
				return false;
			}) > -1;
		if (hasOneToManyNavigation) {
			return true;
		}
	}
	return false;
};
export const getRequiredExpressionAsObject = function (
	oPropertyPath: PropertyOrPath<Property>,
	oDataFieldConverted?: any,
	forceEditMode: boolean = false
): BindingToolkitExpression<boolean> {
	return getRequiredExpression(oPropertyPath, oDataFieldConverted, forceEditMode, true) as BindingToolkitExpression<boolean>;
};
export const getRequiredExpression = function (
	oPropertyPath: PropertyOrPath<Property>,
	oDataFieldConverted?: any,
	forceEditMode: boolean = false,
	bAsObject: boolean = false,
	oRequiredProperties: any = {},
	dataModelObjectPath?: DataModelObjectPath
): CompiledBindingToolkitExpression | BindingToolkitExpression<boolean> {
	let returnExpression: BindingToolkitExpression<boolean>;
	const aRequiredPropertiesFromInsertRestrictions = oRequiredProperties.requiredPropertiesFromInsertRestrictions || [];
	const aRequiredPropertiesFromUpdateRestrictions = oRequiredProperties.requiredPropertiesFromUpdateRestrictions || [];
	if (!oPropertyPath || typeof oPropertyPath === "string") {
		returnExpression = constant(false);
	} else {
		let relativePath;
		if (dataModelObjectPath) {
			relativePath = getRelativePaths(dataModelObjectPath);
		}
		let dataFieldRequiredExpression: BindingToolkitExpression<boolean> = constant(true);
		if (oDataFieldConverted !== null) {
			dataFieldRequiredExpression = isRequiredExpression(oDataFieldConverted);
		}
		let requiredPropertyFromInsertRestrictionsExpression: BindingToolkitExpression<boolean> = constant(false);
		let requiredPropertyFromUpdateRestrictionsExpression: BindingToolkitExpression<boolean> = constant(false);

		const oProperty: Property = (isPathExpression(oPropertyPath) && oPropertyPath.$target) || (oPropertyPath as Property);
		// Enablement depends on the field control expression
		// If the Field control is statically in Inapplicable (disabled) -> not enabled
		const requiredExpression = isRequiredExpression(oProperty, relativePath);
		const editMode = forceEditMode || UI.IsEditable;
		if (
			aRequiredPropertiesFromInsertRestrictions.length &&
			aRequiredPropertiesFromInsertRestrictions.includes((oPropertyPath as any).name)
		) {
			requiredPropertyFromInsertRestrictionsExpression = and(constant(true), UI.IsCreateMode);
		}
		if (
			aRequiredPropertiesFromUpdateRestrictions.length &&
			aRequiredPropertiesFromUpdateRestrictions.includes((oPropertyPath as any).name)
		) {
			requiredPropertyFromUpdateRestrictionsExpression = and(constant(true), notEqual(UI.IsCreateMode, true));
		}
		returnExpression = or(
			and(or(requiredExpression, dataFieldRequiredExpression), editMode),
			requiredPropertyFromInsertRestrictionsExpression,
			requiredPropertyFromUpdateRestrictionsExpression
		);
	}

	if (bAsObject) {
		return returnExpression;
	}
	return compileExpression(returnExpression);
};

export const getRequiredExpressionForConnectedDataField = function (
	dataFieldObjectPath: DataModelObjectPath
): CompiledBindingToolkitExpression {
	const data = dataFieldObjectPath?.targetObject?.$target?.Data;
	const keys: Array<string> = Object.keys(data);
	const dataFields = [];
	let propertyPath;
	const isRequiredExpressions: (CompiledBindingToolkitExpression | BindingToolkitExpression<boolean>)[] | undefined = [];
	for (const key of keys) {
		if (data[key]["$Type"] && data[key]["$Type"].indexOf("DataField") > -1) {
			dataFields.push(data[key]);
		}
	}
	for (const dataField of dataFields) {
		switch (dataField.$Type) {
			case UIAnnotationTypes.DataField:
			case UIAnnotationTypes.DataFieldWithNavigationPath:
			case UIAnnotationTypes.DataFieldWithUrl:
			case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
			case UIAnnotationTypes.DataFieldWithAction:
				if (typeof dataField.Value === "object") {
					propertyPath = dataField.Value.$target;
				}
				break;
			case UIAnnotationTypes.DataFieldForAnnotation:
				if (dataField.Target.$target) {
					if (
						dataField.Target.$target.$Type === UIAnnotationTypes.DataField ||
						dataField.Target.$target.$Type === UIAnnotationTypes.DataPointType
					) {
						if (typeof dataField.Target.$target.Value === "object") {
							propertyPath = dataField.Target.$target.Value.$target;
						}
					} else {
						if (typeof dataField.Target === "object") {
							propertyPath = dataField.Target.$target;
						}
						break;
					}
				}
				break;
			// no default
		}
		isRequiredExpressions.push(getRequiredExpressionAsObject(propertyPath, dataField, false));
	}
	return compileExpression(or(...(isRequiredExpressions as BindingToolkitExpression<boolean>[])));
};
