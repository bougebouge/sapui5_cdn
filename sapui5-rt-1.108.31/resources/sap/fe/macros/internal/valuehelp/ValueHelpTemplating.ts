import type { EntitySet, Property } from "@sap-ux/vocabularies-types";
import type { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression } from "sap/fe/core/helpers/BindingToolkit";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { checkFilterExpressionRestrictions } from "sap/fe/core/templating/DataModelPathHelper";
import {
	hasDateType,
	hasValueHelp,
	hasValueHelpWithFixedValues,
	hasValueListForValidation,
	isCurrency,
	isUnit
} from "sap/fe/core/templating/PropertyHelper";
import { getDisplayMode } from "sap/fe/core/templating/UIFormatters";
import type { ValueHelpPayload } from "sap/fe/macros/internal/valuehelp/ValueListHelperNew";

/**
 * Retrieve the displayMode for the value help.
 * The main rule is that if a property is used in a VHTable then we don't want to display the text arrangement directly.
 *
 * @param propertyPath The current property
 * @param isValueHelpWithFixedValues The value help is a drop-down list
 * @returns The target displayMode
 */
export const getValueHelpTableDisplayMode = function (propertyPath: DataModelObjectPath, isValueHelpWithFixedValues: boolean): string {
	const sDisplayMode = getDisplayMode(propertyPath);
	const oTextAnnotation = propertyPath.targetObject.annotations?.Common?.Text;
	const oTextArrangementAnnotation = typeof oTextAnnotation !== "string" && oTextAnnotation?.annotations?.UI?.TextArrangement?.toString();
	if (isValueHelpWithFixedValues) {
		return oTextAnnotation && typeof oTextAnnotation !== "string" && oTextAnnotation.path ? sDisplayMode : "Value";
	} else {
		// Only explicit defined TextArrangements in a Value Help with Dialog are considered
		return oTextArrangementAnnotation ? sDisplayMode : "Value";
	}
};

/**
 * Method to return delegate property of Value Help.
 *
 * @function
 * @name getDelegateConfiguration
 * @memberof sap.fe.macros.internal.valuehelp.ValueHelpTemplating.js
 * @param propertyPath The current property path
 * @param conditionModelName Condition model of the Value Help
 * @returns The expression needed to configure the delegate
 */
export const getDelegateConfiguration = function (propertyPath: string, conditionModelName: string): CompiledBindingToolkitExpression {
	const delegateConfiguration = {
		name: "sap/fe/macros/field/FieldValueHelpDelegate",
		payload: {
			propertyPath: propertyPath,
			conditionModel: conditionModelName
		}
	};
	return compileExpression(delegateConfiguration);
};

/**
 * Method to return delegate property of Value Help.
 *
 * @function
 * @name getDelegateConfigurationNew
 * @memberof sap.fe.macros.internal.valuehelp.ValueHelpTemplating.js
 * @param propertyPath The current property path
 * @param conditionModelName Condition model of the Value Help
 * @param originalPropertyPath The original property path
 * @param requestGroupId The requestGroupId to use for requests
 * @param useMultiValueField If true the value help is for a multi value Field
 * @returns The expression needed to configure the delegate
 */
export const getDelegateConfigurationNew = function (
	propertyPath: string,
	conditionModelName: string,
	originalPropertyPath: string,
	requestGroupId?: string,
	useMultiValueField = false
): CompiledBindingToolkitExpression {
	const isUnitValueHelp = propertyPath !== originalPropertyPath;
	const delegateConfiguration: { name: string; payload: ValueHelpPayload } = {
		name: "sap/fe/macros/valuehelp/ValueHelpDelegate",
		payload: {
			propertyPath,
			isUnitValueHelp,
			conditionModel: conditionModelName,
			requestGroupId,
			useMultiValueField,
			qualifiers: {},
			valueHelpQualifier: ""
		}
	};
	return compileExpression(delegateConfiguration); // for some reason "qualifiers: {}" is ignored here
};

/**
 * Method to generate the ID for Value Help.
 *
 * @function
 * @name generateID
 * @memberof sap.fe.macros.internal.valuehelp.ValueHelpTemplating.js
 * @param sFlexId Flex ID of the current object
 * @param sIdPrefix Prefix for the ValueHelp ID
 * @param sOriginalPropertyName Name of the property
 * @param sPropertyName Name of the ValueHelp Property
 * @returns The Id generated for the ValueHelp
 */
export const generateID = function (sFlexId: string, sIdPrefix: string, sOriginalPropertyName: string, sPropertyName: string): string {
	if (sFlexId) {
		return sFlexId;
	}
	let sProperty = sPropertyName;
	if (sOriginalPropertyName !== sPropertyName) {
		sProperty = `${sOriginalPropertyName}::${sPropertyName}`;
	}
	return generate([sIdPrefix, sProperty]);
};

/**
 * Method to check if a property needs to be validated or not when used in the valuehelp.
 *
 * @function
 * @name requiresValidation
 * @memberof sap.fe.macros.internal.valuehelp.ValueHelpTemplating.js
 * @param  oProperty ValueHelp property type annotations
 * @returns `true` if the value help need to be validated
 */
export const requiresValidation = function (oProperty: Property): boolean {
	return (
		hasValueHelpWithFixedValues(oProperty) ||
		hasValueListForValidation(oProperty) ||
		(hasValueHelp(oProperty) && (isUnit(oProperty) || isCurrency(oProperty)))
	);
};

/**
 * Method to decide if case sensitive filter requests shall be used or not.
 *
 *  If the backend has FilterFunctions Capabilies for the service or the entity, we check it includes support for tolower.
 *
 * @function
 * @name useCaseSensitiveFilterRequests
 * @memberof sap.fe.macros.internal.valuehelp.ValueHelpTemplating.js
 * @param oDataModelPath Current data model path·
 * @param aEntityContainerFilterFunctions Filter functions of entity container
 * @returns `true` if the entity set or service supports case sensitive filter requests
 */
export const useCaseSensitiveFilterRequests = function (
	oDataModelPath: DataModelObjectPath,
	aEntityContainerFilterFunctions: string[]
): boolean {
	const filterFunctions =
		((oDataModelPath?.targetEntitySet as EntitySet)?.annotations?.Capabilities?.FilterFunctions as unknown as string[]) ||
		aEntityContainerFilterFunctions;
	return filterFunctions ? !(filterFunctions.indexOf("tolower") > -1) : true;
};

export const isSemanticDateRange = function (oDataModelPath: DataModelObjectPath) {
	const targetProperty = oDataModelPath.targetObject as Property;
	const targetRestrictions = checkFilterExpressionRestrictions(oDataModelPath, ["SingleRange"]);
	return hasDateType(targetProperty) && compileExpression(targetRestrictions);
};

export const shouldShowConditionPanel = function (oDataModelPath: DataModelObjectPath): boolean {
	return compileExpression(checkFilterExpressionRestrictions(oDataModelPath, ["SingleValue", "MultiValue"])) === "false";
};

export const getColumnDataProperty = function (sValueListProperty: string, propertyPath: DataModelObjectPath): string {
	if (
		propertyPath?.targetObject?.annotations?.Common?.Text &&
		propertyPath.targetObject.annotations.Common.Text?.annotations?.UI?.TextArrangement &&
		propertyPath.targetObject.annotations.Common.Text.annotations.UI.TextArrangement.valueOf() === "UI.TextArrangementType/TextOnly"
	) {
		return propertyPath.targetObject.annotations.Common.Text.path;
	}
	return sValueListProperty;
};
