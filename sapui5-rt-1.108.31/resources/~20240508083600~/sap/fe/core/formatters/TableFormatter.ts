import { MessageType } from "sap/fe/core/formatters/TableFormatterTypes";
import type Table from "sap/m/Table";
import type ManagedObject from "sap/ui/base/ManagedObject";

const getMessagetypeOrder = function (messageType: string): number {
	switch (messageType) {
		case "Error":
			return 4;
		case "Warning":
			return 3;
		case "Information":
			return 2;
		case "None":
			return 1;
		default:
			return -1;
	}
};

/**
 * Gets the validity of creation row fields.
 *
 * @function
 * @name validateCreationRowFields
 * @param fieldValidityObject Object holding the fields
 * @returns `true` if all the fields in the creation row are valid, `false` otherwise
 */
const validateCreationRowFields = function (fieldValidityObject?: any) {
	if (!fieldValidityObject) {
		return false;
	}
	const fieldKeys = Object.keys(fieldValidityObject);
	return (
		fieldKeys.length > 0 &&
		fieldKeys.every(function (key) {
			return fieldValidityObject[key]["validity"];
		})
	);
};
validateCreationRowFields.__functionName = "sap.fe.core.formatters.TableFormatter#validateCreationRowFields";

/**
 * @param this The object status control.
 * @param semanticKeyHasDraftIndicator The property name of the draft indicator.
 * @param aFilteredMessages Array of messages.
 * @param columnName
 * @param isSemanticKeyInFieldGroup Flag which says if semantic key is a part of field group.
 * @returns The value for the visibility property of the object status
 */
const getErrorStatusTextVisibilityFormatter = function (
	this: ManagedObject | any,
	semanticKeyHasDraftIndicator: string,
	aFilteredMessages: any,
	columnName: string,
	isSemanticKeyInFieldGroup?: Boolean
) {
	let bStatusVisibility = false;
	if (aFilteredMessages && aFilteredMessages.length > 0 && (isSemanticKeyInFieldGroup || columnName === semanticKeyHasDraftIndicator)) {
		const sCurrentContextPath = this.getBindingContext() ? this.getBindingContext().getPath() : undefined;
		aFilteredMessages.forEach((oMessage: any) => {
			if (oMessage.type === "Error" && oMessage.aTargets[0].indexOf(sCurrentContextPath) === 0) {
				bStatusVisibility = true;
				return bStatusVisibility;
			}
		});
	}
	return bStatusVisibility;
};
getErrorStatusTextVisibilityFormatter.__functionName = "sap.fe.core.formatters.TableFormatter#getErrorStatusTextVisibilityFormatter";

/**
 * rowHighlighting
 *
 * @param {object} this The context
 * @param {string|number} CriticalityValue The criticality value
 * @param {number} messageLastUpdate Timestamp of the last message that was created. It's defined as an input value, but not used in the body of the function
 * It is used to refresh the formatting of the table each time a new message is updated
 * @returns {object} The value from the inner function
 */

const rowHighlighting = function (
	this: ManagedObject,
	criticalityValue: string | number,
	aFilteredMessages: any[],
	hasActiveEntity: boolean,
	isActiveEntity: boolean,
	isDraftRoot: string,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	...args: any[]
): MessageType {
	const isNewObject = !hasActiveEntity && !isActiveEntity;
	let iHighestCriticalityValue: number = -1;
	if (aFilteredMessages && aFilteredMessages.length > 0) {
		const sCurrentContextPath = this.getBindingContext()?.getPath();
		aFilteredMessages.forEach((oMessage: any) => {
			if (oMessage.aTargets[0].indexOf(sCurrentContextPath) === 0 && iHighestCriticalityValue < getMessagetypeOrder(oMessage.type)) {
				iHighestCriticalityValue = getMessagetypeOrder(oMessage.type);
				criticalityValue = oMessage.type;
			}
		});
	}
	if (typeof criticalityValue !== "string") {
		switch (criticalityValue) {
			case 1:
				criticalityValue = MessageType.Error;
				break;
			case 2:
				criticalityValue = MessageType.Warning;
				break;
			case 3:
				criticalityValue = MessageType.Success;
				break;
			case 5:
				criticalityValue = MessageType.Information;
				break;
			default:
				criticalityValue = MessageType.None;
		}
	}

	if (criticalityValue === MessageType.None) {
		if (isDraftRoot === "true" && isNewObject) {
			return MessageType.Information;
		} else {
			return MessageType.None;
		}
	} else {
		return criticalityValue as MessageType;
	}
};
rowHighlighting.__functionName = "sap.fe.core.formatters.TableFormatter#rowHighlighting";

const navigatedRow = function (this: ManagedObject, sDeepestPath: string) {
	const sPath = this.getBindingContext()?.getPath();
	if (sPath && sDeepestPath) {
		return sDeepestPath.indexOf(sPath) === 0;
	} else {
		return false;
	}
};
navigatedRow.__functionName = "sap.fe.core.formatters.TableFormatter#navigatedRow";

function isRatingIndicator(oControl: any): boolean {
	if (oControl.isA("sap.fe.core.controls.FieldWrapper")) {
		const vContentDisplay = Array.isArray(oControl.getContentDisplay())
			? oControl.getContentDisplay()[0]
			: oControl.getContentDisplay();
		if (vContentDisplay && vContentDisplay.isA("sap.m.RatingIndicator")) {
			return true;
		}
	}
	return false;
}
function _updateStyleClassForRatingIndicator(oFieldWrapper: any, bLast: boolean) {
	const vContentDisplay = Array.isArray(oFieldWrapper.getContentDisplay())
		? oFieldWrapper.getContentDisplay()[0]
		: oFieldWrapper.getContentDisplay();
	const vContentEdit = Array.isArray(oFieldWrapper.getContentEdit()) ? oFieldWrapper.getContentEdit()[0] : oFieldWrapper.getContentEdit();

	if (bLast) {
		vContentDisplay.addStyleClass("sapUiNoMarginBottom");
		vContentDisplay.addStyleClass("sapUiNoMarginTop");
		vContentEdit.removeStyleClass("sapUiTinyMarginBottom");
	} else {
		vContentDisplay.addStyleClass("sapUiNoMarginBottom");
		vContentDisplay.removeStyleClass("sapUiNoMarginTop");
		vContentEdit.addStyleClass("sapUiTinyMarginBottom");
	}
}
function getVBoxVisibility(this: Table, ...args: any[]) {
	const aItems = this.getItems();
	let bLastElementFound = false;
	for (let index = aItems.length - 1; index >= 0; index--) {
		if (!bLastElementFound) {
			if (args[index] !== true) {
				bLastElementFound = true;
				if (isRatingIndicator(aItems[index])) {
					_updateStyleClassForRatingIndicator(aItems[index], true);
				} else {
					aItems[index].removeStyleClass("sapUiTinyMarginBottom");
				}
			}
		} else if (isRatingIndicator(aItems[index])) {
			_updateStyleClassForRatingIndicator(aItems[index], false);
		} else {
			aItems[index].addStyleClass("sapUiTinyMarginBottom");
		}
	}
	return true;
}
getVBoxVisibility.__functionName = "sap.fe.core.formatters.TableFormatter#getVBoxVisibility";

// See https://www.typescriptlang.org/docs/handbook/functions.html#this-parameters for more detail on this weird syntax
/**
 * Collection of table formatters.
 *
 * @param this The context
 * @param sName The inner function name
 * @param oArgs The inner function parameters
 * @returns The value from the inner function
 */
const tableFormatter = function (this: object, sName: string, ...oArgs: any[]): any {
	if (tableFormatter.hasOwnProperty(sName)) {
		return (tableFormatter as any)[sName].apply(this, oArgs);
	} else {
		return "";
	}
};

tableFormatter.validateCreationRowFields = validateCreationRowFields;
tableFormatter.rowHighlighting = rowHighlighting;
tableFormatter.navigatedRow = navigatedRow;
tableFormatter.getErrorStatusTextVisibilityFormatter = getErrorStatusTextVisibilityFormatter;
tableFormatter.getVBoxVisibility = getVBoxVisibility;
tableFormatter.isRatingIndicator = isRatingIndicator; // for unit tests

/**
 * @global
 */
export default tableFormatter;
