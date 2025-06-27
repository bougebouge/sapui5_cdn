import type { Action, EntitySet, EntityType, PropertyAnnotationValue } from "@sap-ux/vocabularies-types";
import type { DataFieldForActionTypes, DataFieldForIntentBasedNavigationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import type { AnnotationAction, BaseAction } from "sap/fe/core/converters/controls/Common/Action";
import { ButtonType, getEnabledForAnnotationAction, getSemanticObjectMapping } from "sap/fe/core/converters/controls/Common/Action";
import { Placement } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { KeyHelper } from "sap/fe/core/converters/helpers/Key";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { and, compileExpression, constant, equal, fn, getExpressionFromAnnotation, ifElse, not } from "sap/fe/core/helpers/BindingToolkit";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { isPathDeletable } from "sap/fe/core/templating/DataModelPathHelper";
import type ConverterContext from "../ConverterContext";
import { Draft, singletonPathVisitor, UI } from "../helpers/BindingHelper";
import { ActionType } from "../ManifestSettings";

/**
 * Retrieves all the data field for actions for the identification annotation
 * They must be
 * - Not statically hidden
 * - Either linked to an Unbound action or to an action which has an OperationAvailable that is not set to false statically.
 *
 * @param entityType The current entity type
 * @param bDetermining The flag which denotes whether or not the action is a determining action
 * @returns An array of DataField for action respecting the input parameter 'bDetermining'
 */
export function getIdentificationDataFieldForActions(entityType: EntityType, bDetermining: boolean): DataFieldForActionTypes[] {
	return (entityType.annotations?.UI?.Identification?.filter((identificationDataField) => {
		if (identificationDataField?.annotations?.UI?.Hidden?.valueOf() !== true) {
			if (
				identificationDataField?.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" &&
				!!identificationDataField.Determining === bDetermining &&
				(!identificationDataField?.ActionTarget?.isBound ||
					identificationDataField?.ActionTarget?.annotations?.Core?.OperationAvailable?.valueOf() !== false)
			) {
				return true;
			}
		}
		return false;
	}) || []) as DataFieldForActionTypes[];
}

/**
 * Retrieve all the IBN actions for the identification annotation.
 * They must be
 * - Not statically hidden.
 *
 * @param entityType The current entitytype
 * @param bDetermining Whether or not the action should be determining
 * @returns An array of data field for action respecting the bDetermining property.
 */
function getIdentificationDataFieldForIBNActions(entityType: EntityType, bDetermining: boolean): DataFieldForIntentBasedNavigationTypes[] {
	return (entityType.annotations?.UI?.Identification?.filter((identificationDataField) => {
		if (identificationDataField?.annotations?.UI?.Hidden?.valueOf() !== true) {
			if (
				identificationDataField?.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" &&
				!!identificationDataField.Determining === bDetermining
			) {
				return true;
			}
		}

		return false;
	}) || []) as DataFieldForIntentBasedNavigationTypes[];
}

const IMPORTANT_CRITICALITIES = [
	"UI.CriticalityType/VeryPositive",
	"UI.CriticalityType/Positive",
	"UI.CriticalityType/Negative",
	"UI.CriticalityType/VeryNegative"
];

/**
 * Method to determine the 'visible' property binding for the Delete button on an object page.
 *
 * @param converterContext Instance of the converter context.
 * @param deleteHidden The value of the UI.DeleteHidden annotation on the entity set / type.
 * @returns The binding expression for the 'visible' property of the Delete button.
 */
export function getDeleteButtonVisibility(
	converterContext: ConverterContext,
	deleteHidden: PropertyAnnotationValue<boolean> | undefined
): BindingToolkitExpression<boolean> {
	const dataModelObjectPath = converterContext.getDataModelObjectPath(),
		visitedNavigationPaths = dataModelObjectPath.navigationProperties.map((navProp) => navProp.name),
		// Set absolute binding path for Singleton references, otherwise the configured annotation path itself.
		// For e.g. /com.sap.namespace.EntityContainer/Singleton/Property to /Singleton/Property
		deleteHiddenExpression: BindingToolkitExpression<boolean | undefined> = getExpressionFromAnnotation(
			deleteHidden,
			visitedNavigationPaths,
			undefined,
			(path: string) => singletonPathVisitor(path, converterContext.getConvertedTypes(), [])
		),
		manifestWrapper = converterContext.getManifestWrapper(),
		viewLevel = manifestWrapper.getViewLevel(),
		// Delete button is visible
		// In OP 		-->  when not in edit mode
		// In sub-OP 	-->  when in edit mode
		editableExpression: BindingToolkitExpression<boolean> = viewLevel > 1 ? UI.IsEditable : not(UI.IsEditable);

	// If UI.DeleteHidden annotation on entity set or type is either not defined or explicitly set to false,
	// Delete button is visible based on editableExpression.
	// else,
	// Delete button is visible based on both annotation path and editableExpression.
	return ifElse(
		deleteHidden === undefined || deleteHidden.valueOf() === false,
		editableExpression,
		and(editableExpression, equal(deleteHiddenExpression, false))
	);
}

/**
 * Method to determine the 'enabled' property binding for the Delete button on an object page.
 *
 * @param isDeletable The delete restriction configured
 * @param isParentDeletable The delete restriction configured on the parent entity
 * @returns The binding expression for the 'enabled' property of the Delete button
 */
export function getDeleteButtonEnabled(
	isDeletable: PropertyAnnotationValue<Boolean> | undefined,
	isParentDeletable: BindingToolkitExpression<boolean>
): BindingToolkitExpression<boolean> {
	return ifElse(
		isParentDeletable !== undefined,
		isParentDeletable,
		ifElse(isDeletable !== undefined, equal(isDeletable, true), constant(true))
	);
}

/**
 * Method to determine the 'visible' property binding for the Edit button on an object page.
 *
 * @param converterContext Instance of the converter context.
 * @param updateHidden The value of the UI.UpdateHidden annotation on the entity set / type.
 * @returns The binding expression for the 'visible' property of the Edit button.
 */
export function getEditButtonVisibility(
	converterContext: ConverterContext,
	updateHidden: PropertyAnnotationValue<boolean> | undefined
): BindingToolkitExpression<boolean> {
	const entitySet = converterContext.getEntitySet(),
		bIsDraftRoot = ModelHelper.isDraftRoot(entitySet),
		dataModelObjectPath = converterContext.getDataModelObjectPath(),
		visitedNavigationPaths = dataModelObjectPath.navigationProperties.map((navProp) => navProp.name),
		// Set absolute binding path for Singleton references, otherwise the configured annotation path itself.
		// For e.g. /com.sap.namespace.EntityContainer/Singleton/Property to /Singleton/Property
		updateHiddenExpression: BindingToolkitExpression<boolean | undefined> = getExpressionFromAnnotation(
			updateHidden,
			visitedNavigationPaths,
			undefined,
			(path: string) => singletonPathVisitor(path, converterContext.getConvertedTypes(), visitedNavigationPaths)
		),
		notEditableExpression: BindingToolkitExpression<boolean> = not(UI.IsEditable);

	// If UI.UpdateHidden annotation on entity set or type is either not defined or explicitly set to false,
	// Edit button is visible in display mode.
	// else,
	// Edit button is visible based on both annotation path and in display mode.
	const resultantExpression: BindingToolkitExpression<boolean> = ifElse(
		updateHidden === undefined || updateHidden.valueOf() === false,
		notEditableExpression,
		and(notEditableExpression, equal(updateHiddenExpression, false))
	);
	return ifElse(bIsDraftRoot, and(resultantExpression, Draft.HasNoDraftForCurrentUser), resultantExpression);
}
/**
 * Method to determine the 'enabled' property binding for the Edit button on an object page.
 *
 * @param converterContext Instance of the converter context.
 * @returns The binding expression for the 'enabled' property of the Edit button.
 */
export function getEditButtonEnabled(converterContext: ConverterContext): CompiledBindingToolkitExpression {
	const entitySet = converterContext.getEntitySet(),
		isDraftRoot = ModelHelper.isDraftRoot(entitySet),
		isSticky = ModelHelper.isSticky(entitySet);

	let editActionName: string | undefined;
	if (isDraftRoot && !ModelHelper.isSingleton(entitySet)) {
		editActionName = (entitySet as EntitySet)?.annotations.Common?.DraftRoot?.EditAction as string;
	} else if (isSticky && !ModelHelper.isSingleton(entitySet)) {
		editActionName = (entitySet as EntitySet)?.annotations.Session?.StickySessionSupported?.EditAction as string;
	}
	if (editActionName) {
		const editActionAnnotationPath = converterContext.getAbsoluteAnnotationPath(editActionName);
		const editAction = converterContext.resolveAbsolutePath(editActionAnnotationPath).target as Action | null;
		if (editAction?.annotations?.Core?.OperationAvailable === null) {
			// We disabled action advertisement but kept it in the code for the time being
			//return "{= ${#" + editActionName + "} ? true : false }";
		} else {
			return getEnabledForAnnotationAction(converterContext, editAction ?? undefined);
		}
	}
	return "true";
}

export function getHeaderDefaultActions(converterContext: ConverterContext): BaseAction[] {
	const entitySet = converterContext.getEntitySet(),
		entityType = converterContext.getEntityType(),
		oStickySessionSupported = ModelHelper.getStickySession(entitySet), //for sticky app
		oDraftRoot = ModelHelper.getDraftRoot(entitySet), //entitySet && entitySet.annotations.Common?.DraftRoot,
		oDraftNode = ModelHelper.getDraftNode(entitySet),
		oEntityDeleteRestrictions = entitySet && entitySet.annotations?.Capabilities?.DeleteRestrictions,
		bUpdateHidden =
			entitySet && !ModelHelper.isSingleton(entitySet) && (entitySet as EntitySet).annotations.UI?.UpdateHidden?.valueOf(),
		dataModelObjectPath = converterContext.getDataModelObjectPath(),
		isParentDeletable = isPathDeletable(dataModelObjectPath, {
			pathVisitor: (path: string, navigationPaths: string[]) =>
				singletonPathVisitor(path, converterContext.getConvertedTypes(), navigationPaths)
		}),
		bParentEntitySetDeletable = isParentDeletable ? compileExpression(isParentDeletable) : isParentDeletable,
		headerDataFieldForActions = getIdentificationDataFieldForActions(converterContext.getEntityType(), false);

	// Initialize actions and start with draft actions if available since they should appear in the first
	// leftmost position in the actions area of the OP header
	// This is more like a placeholder than a single action, since this controls not only the templating of
	// the button for switching between draft and active document versions but also the controls for
	// the collaborative draft fragment.
	const headerActions: BaseAction[] = [];
	if (!ModelHelper.isSingleton(entitySet) && oDraftRoot?.EditAction && bUpdateHidden !== true) {
		headerActions.push({ type: ActionType.DraftActions, key: "DraftActions" });
	}

	if (oDraftRoot || oDraftNode) {
		headerActions.push({ type: ActionType.CollaborationAvatars, key: "CollaborationAvatars" });
	}
	// Then add the "Critical" DataFieldForActions
	headerDataFieldForActions
		.filter((dataField) => {
			return IMPORTANT_CRITICALITIES.indexOf(dataField?.Criticality as string) > -1;
		})
		.forEach((dataField) => {
			headerActions.push({
				type: ActionType.DataFieldForAction,
				annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
				key: KeyHelper.generateKeyFromDataField(dataField),
				visible: compileExpression(not(equal(getExpressionFromAnnotation(dataField.annotations?.UI?.Hidden), true))),
				enabled: getEnabledForAnnotationAction(converterContext, dataField.ActionTarget),
				isNavigable: true
			});
		});

	// Then the edit action if it exists
	if ((oDraftRoot?.EditAction || oStickySessionSupported?.EditAction) && bUpdateHidden !== true) {
		const updateHidden = ModelHelper.isUpdateHidden(entitySet, entityType);
		headerActions.push({
			type: ActionType.Primary,
			key: "EditAction",
			visible: compileExpression(getEditButtonVisibility(converterContext, updateHidden)),
			enabled: getEditButtonEnabled(converterContext)
		});
	}
	// Then the delete action if we're not statically not deletable
	if (
		(bParentEntitySetDeletable && bParentEntitySetDeletable !== "false") ||
		(oEntityDeleteRestrictions?.Deletable?.valueOf() !== false && bParentEntitySetDeletable !== "false")
	) {
		const deleteHidden = ModelHelper.getDeleteHidden(entitySet, entityType) as PropertyAnnotationValue<boolean>;
		headerActions.push({
			type: ActionType.Secondary,
			key: "DeleteAction",
			visible: compileExpression(getDeleteButtonVisibility(converterContext, deleteHidden)),
			enabled: compileExpression(getDeleteButtonEnabled(oEntityDeleteRestrictions?.Deletable, isParentDeletable)),
			parentEntityDeleteEnabled: bParentEntitySetDeletable
		});
	}

	const headerDataFieldForIBNActions = getIdentificationDataFieldForIBNActions(converterContext.getEntityType(), false);

	headerDataFieldForIBNActions
		.filter((dataField) => {
			return IMPORTANT_CRITICALITIES.indexOf(dataField?.Criticality as string) === -1;
		})
		.forEach((dataField) => {
			const oNavigationParams = {
				semanticObjectMapping: dataField.Mapping ? getSemanticObjectMapping(dataField.Mapping) : []
			};

			if (dataField.RequiresContext?.valueOf() === true) {
				throw new Error(`RequiresContext property should not be true for header IBN action : ${dataField.Label}`);
			} else if (dataField.Inline?.valueOf() === true) {
				throw new Error(`Inline property should not be true for header IBN action : ${dataField.Label}`);
			}
			headerActions.push({
				type: ActionType.DataFieldForIntentBasedNavigation,
				text: dataField.Label?.toString(),
				annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
				buttonType: ButtonType.Ghost,
				visible: compileExpression(not(equal(getExpressionFromAnnotation(dataField.annotations?.UI?.Hidden?.valueOf()), true))),
				enabled:
					dataField.NavigationAvailable !== undefined
						? compileExpression(equal(getExpressionFromAnnotation(dataField.NavigationAvailable?.valueOf()), true))
						: true,
				key: KeyHelper.generateKeyFromDataField(dataField),
				isNavigable: true,
				press: compileExpression(
					fn("._intentBasedNavigation.navigate", [
						getExpressionFromAnnotation(dataField.SemanticObject),
						getExpressionFromAnnotation(dataField.Action),
						oNavigationParams
					])
				),
				customData: compileExpression({
					semanticObject: getExpressionFromAnnotation(dataField.SemanticObject),
					action: getExpressionFromAnnotation(dataField.Action)
				})
			} as AnnotationAction);
		});
	// Finally the non critical DataFieldForActions
	headerDataFieldForActions
		.filter((dataField) => {
			return IMPORTANT_CRITICALITIES.indexOf(dataField?.Criticality as string) === -1;
		})
		.forEach((dataField) => {
			headerActions.push({
				type: ActionType.DataFieldForAction,
				annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
				key: KeyHelper.generateKeyFromDataField(dataField),
				visible: compileExpression(not(equal(getExpressionFromAnnotation(dataField.annotations?.UI?.Hidden), true))),
				enabled: getEnabledForAnnotationAction(converterContext, dataField.ActionTarget),
				isNavigable: true
			} as AnnotationAction);
		});

	return headerActions;
}

export function getHiddenHeaderActions(converterContext: ConverterContext): BaseAction[] {
	const entityType = converterContext.getEntityType();
	const hiddenActions = (entityType.annotations?.UI?.Identification?.filter((identificationDataField) => {
		return identificationDataField?.annotations?.UI?.Hidden?.valueOf() === true;
	}) || []) as DataFieldForActionTypes[];
	return hiddenActions.map((dataField) => {
		return {
			type: ActionType.Default,
			key: KeyHelper.generateKeyFromDataField(dataField)
		};
	});
}

export function getFooterDefaultActions(viewLevel: number, converterContext: ConverterContext): BaseAction[] {
	const entitySet = converterContext.getEntitySet();
	const entityType = converterContext.getEntityType();
	const oStickySessionSupported = ModelHelper.getStickySession(entitySet), //for sticky app
		sEntitySetDraftRoot =
			!ModelHelper.isSingleton(entitySet) &&
			entitySet &&
			((entitySet as EntitySet).annotations.Common?.DraftRoot?.term ||
				(entitySet as EntitySet).annotations?.Session?.StickySessionSupported?.term),
		bConditionSave =
			sEntitySetDraftRoot === "com.sap.vocabularies.Common.v1.DraftRoot" ||
			(oStickySessionSupported && oStickySessionSupported?.SaveAction),
		bConditionApply = viewLevel > 1,
		bConditionCancel =
			sEntitySetDraftRoot === "com.sap.vocabularies.Common.v1.DraftRoot" ||
			(oStickySessionSupported && oStickySessionSupported?.DiscardAction);

	// Retrieve all determining actions
	const footerDataFieldForActions = getIdentificationDataFieldForActions(converterContext.getEntityType(), true);

	// First add the "Critical" DataFieldForActions
	const footerActions: BaseAction[] = footerDataFieldForActions
		.filter((dataField) => {
			return IMPORTANT_CRITICALITIES.indexOf(dataField?.Criticality as string) > -1;
		})
		.map((dataField) => {
			return {
				type: ActionType.DataFieldForAction,
				annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
				key: KeyHelper.generateKeyFromDataField(dataField),
				visible: compileExpression(not(equal(getExpressionFromAnnotation(dataField.annotations?.UI?.Hidden), true))),
				enabled: getEnabledForAnnotationAction(converterContext, dataField.ActionTarget),
				isNavigable: true
			};
		});

	// Then the save action if it exists
	if (entitySet?.entityTypeName === entityType?.fullyQualifiedName && bConditionSave) {
		footerActions.push({ type: ActionType.Primary, key: "SaveAction" });
	}

	// Then the apply action if it exists
	if (bConditionApply) {
		footerActions.push({ type: ActionType.DefaultApply, key: "ApplyAction" });
	}

	// Then the non critical DataFieldForActions
	footerDataFieldForActions
		.filter((dataField) => {
			return IMPORTANT_CRITICALITIES.indexOf(dataField?.Criticality as string) === -1;
		})
		.forEach((dataField) => {
			footerActions.push({
				type: ActionType.DataFieldForAction,
				annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
				key: KeyHelper.generateKeyFromDataField(dataField),
				visible: compileExpression(not(equal(getExpressionFromAnnotation(dataField.annotations?.UI?.Hidden), true))),
				enabled: getEnabledForAnnotationAction(converterContext, dataField.ActionTarget),
				isNavigable: true
			} as AnnotationAction);
		});

	// Then the cancel action if it exists
	if (bConditionCancel) {
		footerActions.push({
			type: ActionType.Secondary,
			key: "CancelAction",
			position: { placement: Placement.End }
		});
	}
	return footerActions;
}
