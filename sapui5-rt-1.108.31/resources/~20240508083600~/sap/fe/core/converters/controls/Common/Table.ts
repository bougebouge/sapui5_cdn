import type {
	EntityType,
	EnumValue,
	NavigationProperty,
	PathAnnotationExpression,
	Property,
	PropertyAnnotationValue,
	PropertyPath,
	TypeDefinition
} from "@sap-ux/vocabularies-types";
import type { FilterFunctions } from "@sap-ux/vocabularies-types/vocabularies/Capabilities";
import { EntitySetAnnotations_Capabilities } from "@sap-ux/vocabularies-types/vocabularies/Capabilities_Edm";
import type { SemanticKey } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { EntitySetAnnotations_Common } from "@sap-ux/vocabularies-types/vocabularies/Common_Edm";
import { EntitySetAnnotations_Session } from "@sap-ux/vocabularies-types/vocabularies/Session_Edm";
import type {
	CriticalityType,
	DataField,
	DataFieldAbstractTypes,
	DataFieldForAction,
	DataFieldForAnnotation,
	DataFieldForIntentBasedNavigation,
	DataFieldTypes,
	DataPoint,
	DataPointTypeTypes,
	FieldGroupType,
	LineItem,
	PresentationVariantType,
	SelectionVariantType,
	SelectOptionType
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import type { ComplexPropertyInfo } from "sap/fe/core/converters/annotations/DataField";
import {
	collectRelatedProperties,
	collectRelatedPropertiesRecursively,
	getDataFieldDataType,
	getSemanticObjectPath,
	isDataFieldAlwaysHidden,
	isDataFieldForActionAbstract,
	isDataFieldTypes
} from "sap/fe/core/converters/annotations/DataField";
import type { AnnotationAction, BaseAction, CombinedAction, CustomAction } from "sap/fe/core/converters/controls/Common/Action";
import { getActionsFromManifest, isActionNavigable, removeDuplicateActions } from "sap/fe/core/converters/controls/Common/Action";
import { Entity, UI } from "sap/fe/core/converters/helpers/BindingHelper";
import type { ConfigurableObject, CustomElement } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { insertCustomElements, Placement } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { IssueCategory, IssueCategoryType, IssueSeverity, IssueType } from "sap/fe/core/converters/helpers/IssueManager";
import { KeyHelper } from "sap/fe/core/converters/helpers/Key";
import tableFormatters from "sap/fe/core/formatters/TableFormatter";
import { MessageType } from "sap/fe/core/formatters/TableFormatterTypes";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import {
	and,
	compileExpression,
	constant,
	equal,
	formatResult,
	getExpressionFromAnnotation,
	ifElse,
	isConstant,
	not,
	or,
	pathInModel,
	resolveBindingString
} from "sap/fe/core/helpers/BindingToolkit";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { replaceSpecialChars } from "sap/fe/core/helpers/StableIdHelper";
import {
	DataModelObjectPath,
	enhanceDataModelPath,
	getTargetObjectPath,
	isPathDeletable,
	isPathSearchable,
	isPathUpdatable
} from "sap/fe/core/templating/DataModelPathHelper";
import type { DisplayMode } from "sap/fe/core/templating/DisplayModeFormatter";
import { EDM_TYPE_MAPPING, getDisplayMode } from "sap/fe/core/templating/DisplayModeFormatter";
import { getNonSortablePropertiesRestrictions } from "sap/fe/core/templating/EntitySetHelper";
import {
	getAssociatedCurrencyProperty,
	getAssociatedTimezoneProperty,
	getAssociatedUnitProperty,
	getTargetValueOnDataPoint,
	isNavigationProperty,
	isPathExpression,
	isProperty
} from "sap/fe/core/templating/PropertyHelper";
import ActionHelper from "sap/fe/macros/internal/helpers/ActionHelper";
import type ConverterContext from "../../ConverterContext";
import { AggregationHelper } from "../../helpers/Aggregation";
import { isReferencePropertyStaticallyHidden } from "../../helpers/DataFieldHelper";
import { getTableID } from "../../helpers/ID";
import type {
	CustomDefinedTableColumn,
	CustomDefinedTableColumnForOverride,
	FormatOptionsType,
	NavigationSettingsConfiguration,
	NavigationTargetConfiguration,
	TableColumnSettings,
	TableManifestConfiguration,
	TableManifestSettingsConfiguration,
	ViewPathConfiguration
} from "../../ManifestSettings";
import {
	ActionType,
	AvailabilityType,
	CreationMode,
	HorizontalAlign,
	Importance,
	SelectionMode,
	TemplateType,
	VariantManagementType,
	VisualizationType
} from "../../ManifestSettings";
import type ManifestWrapper from "../../ManifestWrapper";
import { getMessageTypeFromCriticalityType } from "./Criticality";
import type { StandardActionConfigType } from "./table/StandardActions";
import {
	generateStandardActionsContext,
	getCreateVisibility,
	getCreationRow,
	getDeleteVisibility,
	getInsertUpdateActionsTemplating,
	getMassEditVisibility,
	getRestrictions,
	getStandardActionCreate,
	getStandardActionDelete,
	getStandardActionMassEdit,
	getStandardActionPaste,
	isDraftOrStickySupported,
	isInDisplayMode
} from "./table/StandardActions";

export type TableAnnotationConfiguration = {
	autoBindOnInit: boolean;
	collection: string;
	variantManagement: VariantManagementType;
	filterId?: string;
	id: string;
	navigationPath: string;
	p13nMode?: string;
	row?: {
		action?: string;
		press?: string;
		rowHighlighting: CompiledBindingToolkitExpression;
		rowNavigated: CompiledBindingToolkitExpression;
		visible?: CompiledBindingToolkitExpression;
	};
	selectionMode: string | undefined;
	standardActions: {
		actions: Record<string, StandardActionConfigType>;
		isInsertUpdateTemplated: boolean;
		updatablePropertyPath: string;
	};
	displayMode?: boolean;
	threshold: number;
	entityName: string;
	sortConditions?: string;
	groupConditions?: string;
	aggregateConditions?: string;

	/** Create new entries */
	create: CreateBehavior | CreateBehaviorExternal;
	title: string;
	searchable: boolean;
};

/**
 * New entries are created within the app (default case)
 */
type CreateBehavior = {
	mode: CreationMode;
	append: boolean;
	newAction?: string;
	navigateToTarget?: string;
};

/**
 * New entries are created by navigating to some target
 */
type CreateBehaviorExternal = {
	mode: "External";
	outbound: string;
	outboundDetail: NavigationTargetConfiguration["outboundDetail"];
	navigationSettings: NavigationSettingsConfiguration;
};

export type TableCapabilityRestriction = {
	isDeletable: boolean;
	isUpdatable: boolean;
};

export type TableFiltersConfiguration = {
	enabled?: string | boolean;
	paths: [
		{
			annotationPath: string;
		}
	];
	showCounts?: boolean;
};

export type SelectionVariantConfiguration = {
	propertyNames: string[];
	text?: string;
};

export type TableControlConfiguration = {
	createAtEnd: boolean;
	creationMode: CreationMode;
	disableAddRowButtonForEmptyData: boolean;
	customValidationFunction: string | undefined;
	useCondensedTableLayout: boolean;
	enableExport: boolean;
	headerVisible: boolean;
	filters?: Record<string, TableFiltersConfiguration>;
	type: TableType;
	rowCountMode: GridTableRowCountMode;
	rowCount: number;
	selectAll?: boolean;
	selectionLimit: number;
	multiSelectMode: string | undefined;
	enablePaste: boolean;
	enableFullScreen: boolean;
	showRowCount: boolean;
	inlineCreationRowCount?: number;
	enableMassEdit: boolean | undefined;
	enableAutoColumnWidth: boolean;
	dataStateIndicatorFilter: string | undefined;
	isCompactType?: boolean;
};

export type TableType = "GridTable" | "ResponsiveTable" | "AnalyticalTable";
export type GridTableRowCountMode = "Auto" | "Fixed";

enum ColumnType {
	Default = "Default", // Default Type (Custom Column)
	Annotation = "Annotation",
	Slot = "Slot"
}

// Custom Column from Manifest
export type ManifestDefinedCustomColumn = CustomDefinedTableColumn & {
	type?: ColumnType.Default;
};

// Slot Column from Building Block
export type FragmentDefinedSlotColumn = CustomDefinedTableColumn & {
	type: ColumnType.Slot;
};

// Properties all ColumnTypes have:
export type BaseTableColumn = ConfigurableObject & {
	type: ColumnType; //Origin of the source where we are getting the templated information from
	width?: string;
	importance?: Importance;
	horizontalAlign?: HorizontalAlign;
	availability?: AvailabilityType;
	isNavigable?: boolean;
	caseSensitive: boolean;
};

// Properties on Custom Columns and Slot Columns
export type CustomBasedTableColumn = BaseTableColumn & {
	id: string;
	name: string;
	header?: string;
	template: string;
	propertyInfos?: string[];
	exportSettings?: {
		template: string | undefined;
		wrap: boolean;
	} | null;
	formatOptions: { textLinesEdit: number };
	isGroupable: boolean;
	isNavigable: boolean;
	sortable: boolean;
	visualSettings: { widthCalculation: null };
};

// Properties derived from Manifest to override Annotation configurations
export type AnnotationTableColumnForOverride = BaseTableColumn & {
	settings?: TableColumnSettings;
	formatOptions?: FormatOptionsType;
};

// Properties for Annotation Columns
export type AnnotationTableColumn = AnnotationTableColumnForOverride & {
	name: string;
	propertyInfos?: string[];
	annotationPath: string;
	relativePath: string;
	label?: string;
	tooltip?: string;
	groupLabel?: string;
	group?: string;
	FieldGroupHiddenExpressions?: CompiledBindingToolkitExpression;
	showDataFieldsLabel?: boolean;
	isKey?: boolean;
	isGroupable: boolean;
	unit?: string;
	unitText?: string;
	timezoneText?: string;
	timezone?: string;
	semanticObjectPath?: string;
	sortable: boolean;
	exportSettings?: ColumnExportSettings | null;
	isDataPointFakeTargetProperty?: boolean;
	textArrangement?: {
		textProperty: string;
		mode: DisplayMode;
	};
	additionalPropertyInfos?: string[];
	visualSettings?: VisualSettings;
	typeConfig?: object;
	isPartOfLineItem?: boolean; // temporary indicator to only allow filtering on navigation properties when they're part of a line item
	additionalLabels?: string[];
};

export type ColumnExportSettings = Partial<{
	template: string;
	label: string;
	wrap: boolean;
	type: string;
	inputFormat: string;
	format: string;
	scale: number;
	delimiter: boolean;
	unit: string;
	unitProperty: string;
	timezone: string;
	timezoneProperty: string;
	utc: boolean;
}>;

export type VisualSettings = {
	widthCalculation?: WidthCalculation;
};

export type WidthCalculation = null | {
	minWidth?: number;
	maxWidth?: number;
	defaultWidth?: number;
	includeLabel?: boolean;
	gap?: number;
	// only relevant for complex types
	excludeProperties?: string[];
	verticalArrangement?: boolean;
};

export type TableColumn = CustomBasedTableColumn | AnnotationTableColumn;
export type ManifestColumn = CustomElement<CustomBasedTableColumn | AnnotationTableColumnForOverride>;

export type AggregateData = {
	defaultAggregate: {
		contextDefiningProperties?: string[];
	};
	relativePath: string;
};

export type TableVisualization = {
	type: VisualizationType.Table;
	annotation: TableAnnotationConfiguration;
	control: TableControlConfiguration;
	columns: TableColumn[];
	actions: BaseAction[];
	commandActions?: Record<string, CustomAction>;
	aggregates?: Record<string, AggregateData>;
	enableAnalytics?: boolean;
	enableAnalyticsSearch?: boolean;
	operationAvailableMap: string;
	operationAvailableProperties: string;
	headerInfoTitle: string;
	semanticKeys: string[];
	headerInfoTypeName: PropertyAnnotationValue<String> | undefined;
};

type SorterType = {
	name: string;
	descending: boolean;
};

/**
 * Returns an array of all annotation-based and manifest-based table actions.
 *
 * @param lineItemAnnotation
 * @param visualizationPath
 * @param converterContext
 * @param navigationSettings
 * @returns The complete table actions
 */
export function getTableActions(
	lineItemAnnotation: LineItem,
	visualizationPath: string,
	converterContext: ConverterContext,
	navigationSettings?: NavigationSettingsConfiguration
): CombinedAction {
	const aTableActions = getTableAnnotationActions(lineItemAnnotation, visualizationPath, converterContext);
	const aAnnotationActions = aTableActions.tableActions;
	const aHiddenActions = aTableActions.hiddenTableActions;
	const manifestActions = getActionsFromManifest(
		converterContext.getManifestControlConfiguration(visualizationPath).actions,
		converterContext,
		aAnnotationActions,
		navigationSettings,
		true,
		aHiddenActions
	);
	const actions = insertCustomElements(aAnnotationActions, manifestActions.actions, {
		isNavigable: "overwrite",
		enableOnSelect: "overwrite",
		enableAutoScroll: "overwrite",
		enabled: "overwrite",
		visible: "overwrite",
		defaultValuesExtensionFunction: "overwrite",
		command: "overwrite"
	});

	return {
		"actions": actions,
		"commandActions": manifestActions.commandActions
	};
}

/**
 * Returns an array of all columns, annotation-based as well as manifest based.
 * They are sorted and some properties can be overwritten via the manifest (check out the keys that can be overwritten).
 *
 * @param lineItemAnnotation Collection of data fields for representation in a table or list
 * @param visualizationPath
 * @param converterContext
 * @param navigationSettings
 * @returns Returns all table columns that should be available, regardless of templating or personalization or their origin
 */
export function getTableColumns(
	lineItemAnnotation: LineItem,
	visualizationPath: string,
	converterContext: ConverterContext,
	navigationSettings?: NavigationSettingsConfiguration
): TableColumn[] {
	const annotationColumns = getColumnsFromAnnotations(lineItemAnnotation, visualizationPath, converterContext);
	const manifestColumns = getColumnsFromManifest(
		converterContext.getManifestControlConfiguration(visualizationPath).columns,
		annotationColumns,
		converterContext,
		converterContext.getAnnotationEntityType(lineItemAnnotation),
		navigationSettings
	);

	return insertCustomElements(annotationColumns as TableColumn[], manifestColumns as Record<string, CustomElement<TableColumn>>, {
		width: "overwrite",
		importance: "overwrite",
		horizontalAlign: "overwrite",
		availability: "overwrite",
		isNavigable: "overwrite",
		settings: "overwrite",
		formatOptions: "overwrite"
	});
}

/**
 * Retrieve the custom aggregation definitions from the entityType.
 *
 * @param entityType The target entity type.
 * @param tableColumns The array of columns for the entity type.
 * @param converterContext The converter context.
 * @returns The aggregate definitions from the entityType, or undefined if the entity doesn't support analytical queries.
 */
export const getAggregateDefinitionsFromEntityType = function (
	entityType: EntityType,
	tableColumns: TableColumn[],
	converterContext: ConverterContext
): Record<string, AggregateData> | undefined {
	const aggregationHelper = new AggregationHelper(entityType, converterContext);

	function findColumnFromPath(path: string): TableColumn | undefined {
		return tableColumns.find((column) => {
			const annotationColumn = column as AnnotationTableColumn;
			return annotationColumn.propertyInfos === undefined && annotationColumn.relativePath === path;
		});
	}

	if (!aggregationHelper.isAnalyticsSupported()) {
		return undefined;
	}

	// Keep a set of all currency/unit properties, as we don't want to consider them as aggregates
	// They are aggregates for technical reasons (to manage multi-units situations) but it doesn't make sense from a user standpoint
	const mCurrencyOrUnitProperties = new Set();
	tableColumns.forEach((oColumn) => {
		const oTableColumn = oColumn as AnnotationTableColumn;
		if (oTableColumn.unit) {
			mCurrencyOrUnitProperties.add(oTableColumn.unit);
		}
	});

	const aCustomAggregateAnnotations = aggregationHelper.getCustomAggregateDefinitions();
	const mRawDefinitions: Record<string, string[]> = {};

	aCustomAggregateAnnotations.forEach((annotation) => {
		const oAggregatedProperty = aggregationHelper._entityType.entityProperties.find((oProperty) => {
			return oProperty.name === annotation.qualifier;
		});

		if (oAggregatedProperty) {
			const aContextDefiningProperties = annotation.annotations?.Aggregation?.ContextDefiningProperties;
			mRawDefinitions[oAggregatedProperty.name] = aContextDefiningProperties
				? aContextDefiningProperties.map((oCtxDefProperty) => {
						return oCtxDefProperty.value;
				  })
				: [];
		}
	});
	const mResult: Record<string, AggregateData> = {};

	tableColumns.forEach((oColumn) => {
		const oTableColumn = oColumn as AnnotationTableColumn;
		if (oTableColumn.propertyInfos === undefined && oTableColumn.relativePath) {
			const aRawContextDefiningProperties = mRawDefinitions[oTableColumn.relativePath];

			// Ignore aggregates corresponding to currencies or units of measure and dummy created property for datapoint target Value
			if (
				aRawContextDefiningProperties &&
				!mCurrencyOrUnitProperties.has(oTableColumn.name) &&
				!oTableColumn.isDataPointFakeTargetProperty
			) {
				mResult[oTableColumn.name] = {
					defaultAggregate: {},
					relativePath: oTableColumn.relativePath
				};
				const aContextDefiningProperties: string[] = [];
				aRawContextDefiningProperties.forEach((contextDefiningPropertyName) => {
					const foundColumn = findColumnFromPath(contextDefiningPropertyName);
					if (foundColumn) {
						aContextDefiningProperties.push(foundColumn.name);
					}
				});

				if (aContextDefiningProperties.length) {
					mResult[oTableColumn.name].defaultAggregate.contextDefiningProperties = aContextDefiningProperties;
				}
			}
		}
	});

	return mResult;
};

/**
 * Updates a table visualization for analytical use cases.
 *
 * @param tableVisualization The visualization to be updated
 * @param entityType The entity type displayed in the table
 * @param converterContext The converter context
 * @param presentationVariantAnnotation The presentationVariant annotation (if any)
 */
function updateTableVisualizationForAnalytics(
	tableVisualization: TableVisualization,
	entityType: EntityType,
	converterContext: ConverterContext,
	presentationVariantAnnotation?: PresentationVariantType
) {
	if (tableVisualization.control.type === "AnalyticalTable") {
		const aggregatesDefinitions = getAggregateDefinitionsFromEntityType(entityType, tableVisualization.columns, converterContext),
			aggregationHelper = new AggregationHelper(entityType, converterContext);

		if (aggregatesDefinitions) {
			tableVisualization.enableAnalytics = true;
			tableVisualization.aggregates = aggregatesDefinitions;

			const allowedTransformations = aggregationHelper.getAllowedTransformations();
			tableVisualization.enableAnalyticsSearch = allowedTransformations ? allowedTransformations.indexOf("search") >= 0 : true;

			// Add group and sort conditions from the presentation variant
			tableVisualization.annotation.groupConditions = getGroupConditions(
				presentationVariantAnnotation,
				tableVisualization.columns,
				tableVisualization.control.type
			);
			tableVisualization.annotation.aggregateConditions = getAggregateConditions(
				presentationVariantAnnotation,
				tableVisualization.columns
			);
		}

		tableVisualization.control.type = "GridTable"; // AnalyticalTable isn't a real type for the MDC:Table, so we always switch back to Grid
	} else if (tableVisualization.control.type === "ResponsiveTable") {
		tableVisualization.annotation.groupConditions = getGroupConditions(
			presentationVariantAnnotation,
			tableVisualization.columns,
			tableVisualization.control.type
		);
	}
}

/**
 * Get the navigation target path from manifest settings.
 *
 * @param converterContext The converter context
 * @param navigationPropertyPath The navigation path to check in the manifest settings
 * @returns Navigation path from manifest settings
 */
function getNavigationTargetPath(converterContext: ConverterContext, navigationPropertyPath: string) {
	const manifestWrapper = converterContext.getManifestWrapper();
	if (navigationPropertyPath && manifestWrapper.getNavigationConfiguration(navigationPropertyPath)) {
		const navConfig = manifestWrapper.getNavigationConfiguration(navigationPropertyPath);
		if (Object.keys(navConfig).length > 0) {
			return navigationPropertyPath;
		}
	}

	const dataModelPath = converterContext.getDataModelObjectPath();
	const contextPath = converterContext.getContextPath();
	const navConfigForContextPath = manifestWrapper.getNavigationConfiguration(contextPath);
	if (navConfigForContextPath && Object.keys(navConfigForContextPath).length > 0) {
		return contextPath;
	}

	return dataModelPath.targetEntitySet ? dataModelPath.targetEntitySet.name : dataModelPath.startingEntitySet.name;
}

/**
 * Sets the 'unit' and 'textArrangement' properties in columns when necessary.
 *
 * @param entityType The entity type displayed in the table
 * @param tableColumns The columns to be updated
 */
export function updateLinkedProperties(entityType: EntityType, tableColumns: TableColumn[]) {
	function findColumnByPath(path: string): TableColumn | undefined {
		return tableColumns.find((column) => {
			const annotationColumn = column as AnnotationTableColumn;
			return annotationColumn.propertyInfos === undefined && annotationColumn.relativePath === path;
		});
	}

	tableColumns.forEach((oColumn) => {
		const oTableColumn = oColumn as AnnotationTableColumn;
		if (oTableColumn.propertyInfos === undefined && oTableColumn.relativePath) {
			const oProperty = entityType.entityProperties.find((oProp: Property) => oProp.name === oTableColumn.relativePath);
			if (oProperty) {
				const oUnit = getAssociatedCurrencyProperty(oProperty) || getAssociatedUnitProperty(oProperty);
				const oTimezone = getAssociatedTimezoneProperty(oProperty);
				const sTimezone = oProperty?.annotations?.Common?.Timezone;
				if (oUnit) {
					const oUnitColumn = findColumnByPath(oUnit.name);
					oTableColumn.unit = oUnitColumn?.name;
				} else {
					const sUnit = oProperty?.annotations?.Measures?.ISOCurrency || oProperty?.annotations?.Measures?.Unit;
					if (sUnit) {
						oTableColumn.unitText = `${sUnit}`;
					}
				}
				if (oTimezone) {
					const oTimezoneColumn = findColumnByPath(oTimezone.name);
					oTableColumn.timezone = oTimezoneColumn?.name;
				} else if (sTimezone) {
					oTableColumn.timezoneText = sTimezone.toString();
				}

				const displayMode = getDisplayMode(oProperty),
					textAnnotation = oProperty.annotations.Common?.Text;
				if (isPathExpression(textAnnotation) && displayMode !== "Value") {
					const oTextColumn = findColumnByPath(textAnnotation.path);
					if (oTextColumn && oTextColumn.name !== oTableColumn.name) {
						oTableColumn.textArrangement = {
							textProperty: oTextColumn.name,
							mode: displayMode
						};
					}
				}
			}
		}
	});
}

function getSemanticKeysAndTitleInfo(converterContext: ConverterContext) {
	const headerInfoTitlePath = (converterContext.getAnnotationEntityType()?.annotations?.UI?.HeaderInfo?.Title as DataFieldTypes)?.Value
		?.path;
	const semanticKeyAnnotations: any[] | undefined = converterContext.getAnnotationEntityType()?.annotations?.Common?.SemanticKey;
	const headerInfoTypeName = converterContext?.getAnnotationEntityType()?.annotations?.UI?.HeaderInfo?.TypeName;
	const semanticKeyColumns: string[] = [];
	if (semanticKeyAnnotations) {
		semanticKeyAnnotations.forEach(function (oColumn: any) {
			semanticKeyColumns.push(oColumn.value);
		});
	}

	return { headerInfoTitlePath, semanticKeyColumns, headerInfoTypeName };
}

export function createTableVisualization(
	lineItemAnnotation: LineItem,
	visualizationPath: string,
	converterContext: ConverterContext,
	presentationVariantAnnotation?: PresentationVariantType,
	isCondensedTableLayoutCompliant?: boolean,
	viewConfiguration?: ViewPathConfiguration
): TableVisualization {
	const tableManifestConfig = getTableManifestConfiguration(
		lineItemAnnotation,
		visualizationPath,
		converterContext,
		isCondensedTableLayoutCompliant
	);
	const { navigationPropertyPath } = splitPath(visualizationPath);
	const navigationTargetPath = getNavigationTargetPath(converterContext, navigationPropertyPath);
	const navigationSettings = converterContext.getManifestWrapper().getNavigationConfiguration(navigationTargetPath);
	const columns = getTableColumns(lineItemAnnotation, visualizationPath, converterContext, navigationSettings);
	const operationAvailableMap = getOperationAvailableMap(lineItemAnnotation, converterContext);
	const semanticKeysAndHeaderInfoTitle = getSemanticKeysAndTitleInfo(converterContext);
	const tableActions = getTableActions(lineItemAnnotation, visualizationPath, converterContext, navigationSettings);
	const oVisualization: TableVisualization = {
		type: VisualizationType.Table,
		annotation: getTableAnnotationConfiguration(
			lineItemAnnotation,
			visualizationPath,
			converterContext,
			tableManifestConfig,
			columns,
			presentationVariantAnnotation,
			viewConfiguration
		),
		control: tableManifestConfig,
		actions: removeDuplicateActions(tableActions.actions),
		commandActions: tableActions.commandActions,
		columns: columns,
		operationAvailableMap: JSON.stringify(operationAvailableMap),
		operationAvailableProperties: getOperationAvailableProperties(operationAvailableMap, converterContext),
		headerInfoTitle: semanticKeysAndHeaderInfoTitle.headerInfoTitlePath,
		semanticKeys: semanticKeysAndHeaderInfoTitle.semanticKeyColumns,
		headerInfoTypeName: semanticKeysAndHeaderInfoTitle.headerInfoTypeName
	};

	updateLinkedProperties(converterContext.getAnnotationEntityType(lineItemAnnotation), columns);
	updateTableVisualizationForAnalytics(
		oVisualization,
		converterContext.getAnnotationEntityType(lineItemAnnotation),
		converterContext,
		presentationVariantAnnotation
	);

	return oVisualization;
}

export function createDefaultTableVisualization(converterContext: ConverterContext): TableVisualization {
	const tableManifestConfig = getTableManifestConfiguration(undefined, "", converterContext, false);
	const columns = getColumnsFromEntityType({}, converterContext.getEntityType(), [], [], converterContext, tableManifestConfig.type, []);
	const operationAvailableMap = getOperationAvailableMap(undefined, converterContext);
	const semanticKeysAndHeaderInfoTitle = getSemanticKeysAndTitleInfo(converterContext);
	const oVisualization: TableVisualization = {
		type: VisualizationType.Table,
		annotation: getTableAnnotationConfiguration(undefined, "", converterContext, tableManifestConfig, columns),
		control: tableManifestConfig,
		actions: [],
		columns: columns,
		operationAvailableMap: JSON.stringify(operationAvailableMap),
		operationAvailableProperties: getOperationAvailableProperties(operationAvailableMap, converterContext),
		headerInfoTitle: semanticKeysAndHeaderInfoTitle.headerInfoTitlePath,
		semanticKeys: semanticKeysAndHeaderInfoTitle.semanticKeyColumns,
		headerInfoTypeName: semanticKeysAndHeaderInfoTitle.headerInfoTypeName
	};

	updateLinkedProperties(converterContext.getEntityType(), columns);
	updateTableVisualizationForAnalytics(oVisualization, converterContext.getEntityType(), converterContext);

	return oVisualization;
}

/**
 * Gets the map of Core.OperationAvailable property paths for all DataFieldForActions.
 *
 * @param lineItemAnnotation The instance of the line item
 * @param converterContext The instance of the converter context
 * @returns The record containing all action names and their corresponding Core.OperationAvailable property paths
 */
function getOperationAvailableMap(lineItemAnnotation: LineItem | undefined, converterContext: ConverterContext): Record<string, any> {
	return ActionHelper.getOperationAvailableMap(lineItemAnnotation, "table", converterContext);
}

/**
 * Gets updatable propertyPath for the current entityset if valid.
 *
 * @param converterContext The instance of the converter context
 * @returns The updatable property for the rows
 */
function getCurrentEntitySetUpdatablePath(converterContext: ConverterContext): string {
	const restrictions = getRestrictions(converterContext);
	const entitySet = converterContext.getEntitySet();
	const updatable = restrictions.isUpdatable;
	const isOnlyDynamicOnCurrentEntity: any = !isConstant(updatable.expression) && updatable.navigationExpression._type === "Unresolvable";
	const updatablePropertyPath = (entitySet?.annotations.Capabilities?.UpdateRestrictions?.Updatable as any)?.path;

	return isOnlyDynamicOnCurrentEntity ? (updatablePropertyPath as string) : "";
}

/**
 * Method to retrieve all property paths assigned to the Core.OperationAvailable annotation.
 *
 * @param operationAvailableMap The record consisting of actions and their Core.OperationAvailable property paths
 * @param converterContext The instance of the converter context
 * @returns The CSV string of all property paths associated with the Core.OperationAvailable annotation
 */
function getOperationAvailableProperties(operationAvailableMap: Record<string, any>, converterContext: ConverterContext): string {
	const properties = new Set();

	for (const actionName in operationAvailableMap) {
		const propertyName = operationAvailableMap[actionName];
		if (propertyName === null) {
			// Annotation configured with explicit 'null' (action advertisement relevant)
			properties.add(actionName);
		} else if (typeof propertyName === "string") {
			// Add property paths and not Constant values.
			properties.add(propertyName);
		}
	}

	if (properties.size) {
		// Some actions have an operation available based on property --> we need to load the HeaderInfo.Title property
		// so that the dialog on partial actions is displayed properly (BCP 2180271425)
		const entityType = converterContext.getEntityType();
		const titleProperty = (entityType.annotations?.UI?.HeaderInfo?.Title as DataFieldTypes)?.Value?.path;
		if (titleProperty) {
			properties.add(titleProperty);
		}
	}

	return Array.from(properties).join(",");
}

/**
 * Iterates over the DataFieldForAction and DataFieldForIntentBasedNavigation of a line item and
 * returns all the UI.Hidden annotation expressions.
 *
 * @param lineItemAnnotation Collection of data fields used for representation in a table or list
 * @param currentEntityType Current entity type
 * @param contextDataModelObjectPath Object path of the data model
 * @param isEntitySet
 * @returns All the `UI.Hidden` path expressions found in the relevant actions
 */
function getUIHiddenExpForActionsRequiringContext(
	lineItemAnnotation: LineItem,
	currentEntityType: EntityType,
	contextDataModelObjectPath: DataModelObjectPath,
	isEntitySet: boolean
): BindingToolkitExpression<boolean>[] {
	const aUiHiddenPathExpressions: BindingToolkitExpression<boolean>[] = [];
	lineItemAnnotation.forEach((dataField) => {
		// Check if the lineItem context is the same as that of the action:
		if (
			(dataField.$Type === UIAnnotationTypes.DataFieldForAction &&
				dataField?.ActionTarget?.isBound &&
				currentEntityType === dataField?.ActionTarget.sourceEntityType) ||
			(dataField.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation &&
				dataField.RequiresContext &&
				dataField?.Inline?.valueOf() !== true)
		) {
			if (typeof dataField.annotations?.UI?.Hidden?.valueOf() === "object") {
				aUiHiddenPathExpressions.push(equal(getBindingExpFromContext(dataField, contextDataModelObjectPath, isEntitySet), false));
			}
		}
	});
	return aUiHiddenPathExpressions;
}

/**
 * This method is used to change the context currently referenced by this binding by removing the last navigation property.
 *
 * It is used (specifically in this case), to transform a binding made for a NavProp context /MainObject/NavProp1/NavProp2,
 * into a binding on the previous context /MainObject/NavProp1.
 *
 * @param source DataFieldForAction | DataFieldForIntentBasedNavigation | CustomAction
 * @param contextDataModelObjectPath DataModelObjectPath
 * @param isEntitySet
 * @returns The binding expression
 */
function getBindingExpFromContext(
	source: DataFieldForAction | DataFieldForIntentBasedNavigation | CustomAction,
	contextDataModelObjectPath: DataModelObjectPath,
	isEntitySet: boolean
): BindingToolkitExpression<any> {
	let sExpression: any | undefined;
	if (
		(source as DataFieldForAction)?.$Type === UIAnnotationTypes.DataFieldForAction ||
		(source as DataFieldForIntentBasedNavigation)?.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation
	) {
		sExpression = (source as DataFieldForAction | DataFieldForIntentBasedNavigation)?.annotations?.UI?.Hidden;
	} else {
		sExpression = (source as CustomAction)?.visible;
	}
	let sPath: string;
	if (sExpression?.path) {
		sPath = sExpression.path;
	} else {
		sPath = sExpression;
	}
	if (sPath) {
		if ((source as CustomAction)?.visible) {
			sPath = sPath.substring(1, sPath.length - 1);
		}
		if (sPath.indexOf("/") > 0) {
			//check if the navigation property is correct:
			const aSplitPath = sPath.split("/");
			const sNavigationPath = aSplitPath[0];
			if (
				contextDataModelObjectPath?.targetObject?._type === "NavigationProperty" &&
				contextDataModelObjectPath.targetObject.partner === sNavigationPath
			) {
				return pathInModel(aSplitPath.slice(1).join("/"));
			} else {
				return constant(true);
			}
			// In case there is no navigation property, if it's an entitySet, the expression binding has to be returned:
		} else if (isEntitySet) {
			return pathInModel(sPath);
			// otherwise the expression binding cannot be taken into account for the selection mode evaluation:
		} else {
			return constant(true);
		}
	}
	return constant(true);
}

/**
 * Loop through the DataFieldForAction and DataFieldForIntentBasedNavigation of a line item and check
 * if at least one of them is always visible in the table toolbar (and requires a context).
 *
 * @param lineItemAnnotation Collection of data fields for representation in a table or list
 * @param currentEntityType Current Entity Type
 * @returns `true` if there is at least 1 action that meets the criteria
 */
function hasBoundActionsAlwaysVisibleInToolBar(lineItemAnnotation: LineItem, currentEntityType: EntityType): boolean {
	return lineItemAnnotation.some((dataField) => {
		if (
			(dataField.$Type === UIAnnotationTypes.DataFieldForAction ||
				dataField.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation) &&
			dataField?.Inline?.valueOf() !== true &&
			(dataField.annotations?.UI?.Hidden?.valueOf() === false || dataField.annotations?.UI?.Hidden?.valueOf() === undefined)
		) {
			if (dataField.$Type === UIAnnotationTypes.DataFieldForAction) {
				// Check if the lineItem context is the same as that of the action:
				return dataField?.ActionTarget?.isBound && currentEntityType === dataField?.ActionTarget.sourceEntityType;
			} else if (dataField.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation) {
				return dataField.RequiresContext;
			}
		}
		return false;
	});
}

function hasCustomActionsAlwaysVisibleInToolBar(manifestActions: Record<string, CustomAction>): boolean {
	return Object.keys(manifestActions).some((actionKey) => {
		const action = manifestActions[actionKey];
		if (action.requiresSelection && action.visible?.toString() === "true") {
			return true;
		}
		return false;
	});
}

/**
 * Iterates over the custom actions (with key requiresSelection) declared in the manifest for the current line item and returns all the
 * visible key values as an expression.
 *
 * @param manifestActions The actions defined in the manifest
 * @returns Array<Expression<boolean>> All the visible path expressions of the actions that meet the criteria
 */
function getVisibleExpForCustomActionsRequiringContext(manifestActions: Record<string, CustomAction>): BindingToolkitExpression<boolean>[] {
	const aVisiblePathExpressions: BindingToolkitExpression<boolean>[] = [];
	if (manifestActions) {
		Object.keys(manifestActions).forEach((actionKey) => {
			const action = manifestActions[actionKey];
			if (action.requiresSelection === true && action.visible !== undefined) {
				if (typeof action.visible === "string") {
					/*The final aim would be to check if the path expression depends on the parent context
					and considers only those expressions for the expression evaluation,
					but currently not possible from the manifest as the visible key is bound on the parent entity.
					Tricky to differentiate the path as it's done for the Hidden annotation.
					For the time being we consider all the paths of the manifest*/

					aVisiblePathExpressions.push(resolveBindingString(action?.visible?.valueOf()));
				}
			}
		});
	}
	return aVisiblePathExpressions;
}

/**
 * Evaluate if the path is statically deletable or updatable.
 *
 * @param converterContext
 * @returns The table capabilities
 */
export function getCapabilityRestriction(converterContext: ConverterContext): TableCapabilityRestriction {
	const isDeletable = isPathDeletable(converterContext.getDataModelObjectPath());
	const isUpdatable = isPathUpdatable(converterContext.getDataModelObjectPath());
	return {
		isDeletable: !(isConstant(isDeletable) && isDeletable.value === false),
		isUpdatable: !(isConstant(isUpdatable) && isUpdatable.value === false)
	};
}

export function getSelectionMode(
	lineItemAnnotation: LineItem | undefined,
	visualizationPath: string,
	converterContext: ConverterContext,
	isEntitySet: boolean,
	targetCapabilities: TableCapabilityRestriction,
	deleteButtonVisibilityExpression?: BindingToolkitExpression<boolean>,
	massEditVisibilityExpression: BindingToolkitExpression<boolean> = constant(false)
): string | undefined {
	if (!lineItemAnnotation) {
		return SelectionMode.None;
	}
	const tableManifestSettings = converterContext.getManifestControlConfiguration(visualizationPath);
	let selectionMode = tableManifestSettings.tableSettings?.selectionMode;
	let aHiddenBindingExpressions: BindingToolkitExpression<boolean>[] = [],
		aVisibleBindingExpressions: BindingToolkitExpression<boolean>[] = [];
	const manifestActions = getActionsFromManifest(
		converterContext.getManifestControlConfiguration(visualizationPath).actions,
		converterContext,
		[],
		undefined,
		false
	);
	let isParentDeletable, parentEntitySetDeletable;
	if (converterContext.getTemplateType() === TemplateType.ObjectPage) {
		isParentDeletable = isPathDeletable(converterContext.getDataModelObjectPath());
		parentEntitySetDeletable = isParentDeletable ? compileExpression(isParentDeletable, true) : isParentDeletable;
	}

	const bMassEditEnabled: boolean = !isConstant(massEditVisibilityExpression) || massEditVisibilityExpression.value !== false;
	if (selectionMode && selectionMode === SelectionMode.None && deleteButtonVisibilityExpression) {
		if (converterContext.getTemplateType() === TemplateType.ObjectPage && bMassEditEnabled) {
			// Mass Edit in OP is enabled only in edit mode.
			return compileExpression(
				ifElse(
					and(UI.IsEditable, massEditVisibilityExpression),
					constant("Multi"),
					ifElse(deleteButtonVisibilityExpression, constant("Multi"), constant("None"))
				)
			);
		} else if (bMassEditEnabled) {
			return SelectionMode.Multi;
		}

		return compileExpression(ifElse(deleteButtonVisibilityExpression, constant("Multi"), constant("None")));
	}
	if (!selectionMode || selectionMode === SelectionMode.Auto) {
		selectionMode = SelectionMode.Multi;
	}
	if (bMassEditEnabled) {
		// Override default selection mode when mass edit is visible
		selectionMode = selectionMode === SelectionMode.Single ? SelectionMode.Single : SelectionMode.Multi;
	}

	if (
		hasBoundActionsAlwaysVisibleInToolBar(lineItemAnnotation, converterContext.getEntityType()) ||
		hasCustomActionsAlwaysVisibleInToolBar(manifestActions.actions)
	) {
		return selectionMode;
	}
	aHiddenBindingExpressions = getUIHiddenExpForActionsRequiringContext(
		lineItemAnnotation,
		converterContext.getEntityType(),
		converterContext.getDataModelObjectPath(),
		isEntitySet
	);
	aVisibleBindingExpressions = getVisibleExpForCustomActionsRequiringContext(manifestActions.actions);

	// No action requiring a context:
	if (
		aHiddenBindingExpressions.length === 0 &&
		aVisibleBindingExpressions.length === 0 &&
		(deleteButtonVisibilityExpression || bMassEditEnabled)
	) {
		if (!isEntitySet) {
			// Example: OP case
			if (targetCapabilities.isDeletable || parentEntitySetDeletable !== "false" || bMassEditEnabled) {
				// Building expression for delete and mass edit
				const buttonVisibilityExpression = or(
					deleteButtonVisibilityExpression || true, // default delete visibility as true
					massEditVisibilityExpression
				);
				return compileExpression(
					ifElse(and(UI.IsEditable, buttonVisibilityExpression), constant(selectionMode), constant(SelectionMode.None))
				);
			} else {
				return SelectionMode.None;
			}
			// EntitySet deletable:
		} else if (bMassEditEnabled) {
			// example: LR scenario
			return selectionMode;
		} else if (targetCapabilities.isDeletable && deleteButtonVisibilityExpression) {
			return compileExpression(ifElse(deleteButtonVisibilityExpression, constant(selectionMode), constant("None")));
			// EntitySet not deletable:
		} else {
			return SelectionMode.None;
		}
		// There are actions requiring a context:
	} else if (!isEntitySet) {
		// Example: OP case
		if (targetCapabilities.isDeletable || parentEntitySetDeletable !== "false" || bMassEditEnabled) {
			// Use selectionMode in edit mode if delete is enabled or mass edit is visible
			const editModebuttonVisibilityExpression = ifElse(
				bMassEditEnabled && !targetCapabilities.isDeletable,
				massEditVisibilityExpression,
				constant(true)
			);
			return compileExpression(
				ifElse(
					and(UI.IsEditable, editModebuttonVisibilityExpression),
					constant(selectionMode),
					ifElse(
						or(...aHiddenBindingExpressions.concat(aVisibleBindingExpressions)),
						constant(selectionMode),
						constant(SelectionMode.None)
					)
				)
			);
		} else {
			return compileExpression(
				ifElse(
					or(...aHiddenBindingExpressions.concat(aVisibleBindingExpressions)),
					constant(selectionMode),
					constant(SelectionMode.None)
				)
			);
		}
		//EntitySet deletable:
	} else if (targetCapabilities.isDeletable || bMassEditEnabled) {
		// Example: LR scenario
		return selectionMode;
		//EntitySet not deletable:
	} else {
		return compileExpression(
			ifElse(
				or(...aHiddenBindingExpressions.concat(aVisibleBindingExpressions), massEditVisibilityExpression),
				constant(selectionMode),
				constant(SelectionMode.None)
			)
		);
	}
}

/**
 * Method to retrieve all table actions from annotations.
 *
 * @param lineItemAnnotation
 * @param visualizationPath
 * @param converterContext
 * @returns The table annotation actions
 */
function getTableAnnotationActions(lineItemAnnotation: LineItem, visualizationPath: string, converterContext: ConverterContext) {
	const tableActions: BaseAction[] = [];
	const hiddenTableActions: BaseAction[] = [];
	if (lineItemAnnotation) {
		lineItemAnnotation.forEach((dataField: DataFieldAbstractTypes) => {
			let tableAction: AnnotationAction | undefined;
			if (
				isDataFieldForActionAbstract(dataField) &&
				!(dataField.annotations?.UI?.Hidden?.valueOf() === true) &&
				!dataField.Inline &&
				!dataField.Determining
			) {
				const key = KeyHelper.generateKeyFromDataField(dataField);
				switch (dataField.$Type) {
					case "com.sap.vocabularies.UI.v1.DataFieldForAction":
						tableAction = {
							type: ActionType.DataFieldForAction,
							annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
							key: key,
							visible: compileExpression(
								not(
									equal(
										getExpressionFromAnnotation(
											dataField.annotations?.UI?.Hidden,
											[],
											undefined,
											converterContext.getRelativeModelPathFunction()
										),
										true
									)
								)
							),
							isNavigable: true
						};
						break;

					case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
						tableAction = {
							type: ActionType.DataFieldForIntentBasedNavigation,
							annotationPath: converterContext.getEntitySetBasedAnnotationPath(dataField.fullyQualifiedName),
							key: key,
							visible: compileExpression(
								not(
									equal(
										getExpressionFromAnnotation(
											dataField.annotations?.UI?.Hidden,
											[],
											undefined,
											converterContext.getRelativeModelPathFunction()
										),
										true
									)
								)
							)
						};
						break;
					default:
						break;
				}
			} else if (dataField.annotations?.UI?.Hidden?.valueOf() === true) {
				hiddenTableActions.push({
					type: ActionType.Default,
					key: KeyHelper.generateKeyFromDataField(dataField)
				});
			}
			if (tableAction) {
				tableActions.push(tableAction);
			}
		});
	}
	return {
		tableActions: tableActions,
		hiddenTableActions: hiddenTableActions
	};
}

function getHighlightRowBinding(
	criticalityAnnotation: PathAnnotationExpression<CriticalityType> | EnumValue<CriticalityType> | undefined,
	isDraftRoot: boolean,
	targetEntityType?: EntityType
): BindingToolkitExpression<MessageType> {
	let defaultHighlightRowDefinition: MessageType | BindingToolkitExpression<MessageType> = MessageType.None;
	if (criticalityAnnotation) {
		if (typeof criticalityAnnotation === "object") {
			defaultHighlightRowDefinition = getExpressionFromAnnotation(criticalityAnnotation) as BindingToolkitExpression<MessageType>;
		} else {
			// Enum Value so we get the corresponding static part
			defaultHighlightRowDefinition = getMessageTypeFromCriticalityType(criticalityAnnotation);
		}
	}

	const aMissingKeys: any[] = [];
	targetEntityType?.keys.forEach((key: any) => {
		if (key.name !== "IsActiveEntity") {
			aMissingKeys.push(pathInModel(key.name, undefined));
		}
	});

	return formatResult(
		[
			defaultHighlightRowDefinition,
			pathInModel(`filteredMessages`, "internal"),
			isDraftRoot && Entity.HasActive,
			isDraftRoot && Entity.IsActive,
			`${isDraftRoot}`,
			...aMissingKeys
		],
		tableFormatters.rowHighlighting,
		targetEntityType
	);
}

function _getCreationBehaviour(
	lineItemAnnotation: LineItem | undefined,
	tableManifestConfiguration: TableControlConfiguration,
	converterContext: ConverterContext,
	navigationSettings: NavigationSettingsConfiguration,
	visualizationPath: string
): TableAnnotationConfiguration["create"] {
	const navigation = navigationSettings?.create || navigationSettings?.detail;
	const tableManifestSettings: TableManifestConfiguration = converterContext.getManifestControlConfiguration(visualizationPath);
	const originalTableSettings = (tableManifestSettings && tableManifestSettings.tableSettings) || {};
	// cross-app
	if (navigation?.outbound && navigation.outboundDetail && navigationSettings?.create) {
		return {
			mode: "External",
			outbound: navigation.outbound,
			outboundDetail: navigation.outboundDetail,
			navigationSettings: navigationSettings
		};
	}

	let newAction;
	if (lineItemAnnotation) {
		// in-app
		const targetAnnotations = converterContext.getEntitySet()?.annotations;
		const targetAnnotationsCommon = targetAnnotations?.Common as EntitySetAnnotations_Common,
			targetAnnotationsSession = targetAnnotations?.Session as EntitySetAnnotations_Session;
		newAction = targetAnnotationsCommon?.DraftRoot?.NewAction || targetAnnotationsSession?.StickySessionSupported?.NewAction;

		if (tableManifestConfiguration.creationMode === CreationMode.CreationRow && newAction) {
			// A combination of 'CreationRow' and 'NewAction' does not make sense
			throw Error(`Creation mode '${CreationMode.CreationRow}' can not be used with a custom 'new' action (${newAction})`);
		}
		if (navigation?.route) {
			// route specified
			return {
				mode: tableManifestConfiguration.creationMode,
				append: tableManifestConfiguration.createAtEnd,
				newAction: newAction?.toString(),
				navigateToTarget: tableManifestConfiguration.creationMode === CreationMode.NewPage ? navigation.route : undefined // navigate only in NewPage mode
			};
		}
	}

	// no navigation or no route specified - fallback to inline create if original creation mode was 'NewPage'
	if (tableManifestConfiguration.creationMode === CreationMode.NewPage) {
		tableManifestConfiguration.creationMode = CreationMode.Inline;
		// In case there was no specific configuration for the createAtEnd we force it to false
		if (originalTableSettings.creationMode?.createAtEnd === undefined) {
			tableManifestConfiguration.createAtEnd = false;
		}
	}

	return {
		mode: tableManifestConfiguration.creationMode,
		append: tableManifestConfiguration.createAtEnd,
		newAction: newAction?.toString()
	};
}

const _getRowConfigurationProperty = function (
	lineItemAnnotation: LineItem | undefined,
	visualizationPath: string,
	converterContext: ConverterContext,
	navigationSettings: NavigationSettingsConfiguration,
	targetPath: string
) {
	let pressProperty, navigationTarget;
	let criticalityProperty: BindingToolkitExpression<MessageType> = constant(MessageType.None);
	const targetEntityType = converterContext.getEntityType();
	if (navigationSettings && lineItemAnnotation) {
		navigationTarget = navigationSettings.display?.target || navigationSettings.detail?.outbound;
		const targetEntitySet = converterContext.getEntitySet();
		criticalityProperty = getHighlightRowBinding(
			lineItemAnnotation.annotations?.UI?.Criticality,
			!!ModelHelper.getDraftRoot(targetEntitySet) || !!ModelHelper.getDraftNode(targetEntitySet),
			targetEntityType
		);
		if (navigationTarget) {
			pressProperty =
				".handlers.onChevronPressNavigateOutBound( $controller ,'" + navigationTarget + "', ${$parameters>bindingContext})";
		} else if (targetEntityType) {
			navigationTarget = navigationSettings.detail?.route;
			if (navigationTarget && !ModelHelper.isSingleton(targetEntitySet)) {
				criticalityProperty = getHighlightRowBinding(
					lineItemAnnotation.annotations?.UI?.Criticality,
					!!ModelHelper.getDraftRoot(targetEntitySet) || !!ModelHelper.getDraftNode(targetEntitySet),
					targetEntityType
				);
				pressProperty =
					"API.onTableRowPress($event, $controller, ${$parameters>bindingContext}, { callExtension: true, targetPath: '" +
					targetPath +
					"', editable : " +
					(ModelHelper.getDraftRoot(targetEntitySet) || ModelHelper.getDraftNode(targetEntitySet)
						? "!${$parameters>bindingContext}.getProperty('IsActiveEntity')"
						: "undefined") +
					"})"; //Need to access to DraftRoot and DraftNode !!!!!!!
			} else {
				criticalityProperty = getHighlightRowBinding(lineItemAnnotation.annotations?.UI?.Criticality, false, targetEntityType);
			}
		}
	}
	const rowNavigatedExpression: BindingToolkitExpression<boolean> = formatResult(
		[pathInModel("/deepestPath", "internal")],
		tableFormatters.navigatedRow,
		targetEntityType
	);
	return {
		press: pressProperty,
		action: pressProperty ? "Navigation" : undefined,
		rowHighlighting: compileExpression(criticalityProperty),
		rowNavigated: compileExpression(rowNavigatedExpression),
		visible: compileExpression(not(UI.IsInactive))
	};
};

/**
 * Retrieve the columns from the entityType.
 *
 * @param columnsToBeCreated The columns to be created.
 * @param entityType The target entity type.
 * @param annotationColumns The array of columns created based on LineItem annotations.
 * @param nonSortableColumns The array of all non sortable column names.
 * @param converterContext The converter context.
 * @param tableType The table type.
 * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
 * @returns The column from the entityType
 */
export const getColumnsFromEntityType = function (
	columnsToBeCreated: Record<string, Property>,
	entityType: EntityType,
	annotationColumns: AnnotationTableColumn[] = [],
	nonSortableColumns: string[],
	converterContext: ConverterContext,
	tableType: TableType,
	textOnlyColumnsFromTextAnnotation: string[]
): AnnotationTableColumn[] {
	const tableColumns: AnnotationTableColumn[] = annotationColumns;
	// Catch already existing columns - which were added before by LineItem Annotations
	const aggregationHelper = new AggregationHelper(entityType, converterContext);

	entityType.entityProperties.forEach((property: Property) => {
		// Catch already existing columns - which were added before by LineItem Annotations
		const exists = annotationColumns.some((column) => {
			return column.name === property.name;
		});

		// if target type exists, it is a complex property and should be ignored
		if (!property.targetType && !exists) {
			const relatedPropertiesInfo: ComplexPropertyInfo = collectRelatedProperties(
				property.name,
				property,
				converterContext,
				true,
				tableType
			);
			const relatedPropertyNames: string[] = Object.keys(relatedPropertiesInfo.properties);
			const additionalPropertyNames: string[] = Object.keys(relatedPropertiesInfo.additionalProperties);
			if (relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation.length > 0) {
				// Include text properties found during analysis on getColumnsFromAnnotations
				textOnlyColumnsFromTextAnnotation.push(...relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation);
			}
			const columnInfo = getColumnDefinitionFromProperty(
				property,
				converterContext.getEntitySetBasedAnnotationPath(property.fullyQualifiedName),
				property.name,
				true,
				true,
				nonSortableColumns,
				aggregationHelper,
				converterContext,
				textOnlyColumnsFromTextAnnotation
			);

			const semanticKeys = converterContext.getAnnotationsByTerm("Common", CommonAnnotationTerms.SemanticKey, [
				converterContext.getEntityType()
			])[0];
			const oColumnDraftIndicator = getDefaultDraftIndicatorForColumn(columnInfo.name, semanticKeys, false, null);
			if (Object.keys(oColumnDraftIndicator).length > 0) {
				columnInfo.formatOptions = {
					...oColumnDraftIndicator
				};
			}
			if (relatedPropertyNames.length > 0) {
				columnInfo.propertyInfos = relatedPropertyNames;
				columnInfo.exportSettings = {
					...columnInfo.exportSettings,
					template: relatedPropertiesInfo.exportSettingsTemplate,
					wrap: relatedPropertiesInfo.exportSettingsWrapping
				};
				columnInfo.exportSettings.type = _getExportDataType(property.type, relatedPropertyNames.length > 1);

				if (relatedPropertiesInfo.exportUnitName) {
					columnInfo.exportSettings.unitProperty = relatedPropertiesInfo.exportUnitName;
					columnInfo.exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
				} else if (relatedPropertiesInfo.exportUnitString) {
					columnInfo.exportSettings.unit = relatedPropertiesInfo.exportUnitString;
				}
				if (relatedPropertiesInfo.exportTimezoneName) {
					columnInfo.exportSettings.timezoneProperty = relatedPropertiesInfo.exportTimezoneName;
					columnInfo.exportSettings.utc = false;
				} else if (relatedPropertiesInfo.exportTimezoneString) {
					columnInfo.exportSettings.timezone = relatedPropertiesInfo.exportTimezoneString;
				}

				// Collect information of related columns to be created.
				relatedPropertyNames.forEach((name) => {
					columnsToBeCreated[name] = relatedPropertiesInfo.properties[name];
				});
			}

			if (additionalPropertyNames.length > 0) {
				columnInfo.additionalPropertyInfos = additionalPropertyNames;
				// Create columns for additional properties identified for ALP use case.
				additionalPropertyNames.forEach((name) => {
					// Intentional overwrite as we require only one new PropertyInfo for a related Property.
					columnsToBeCreated[name] = relatedPropertiesInfo.additionalProperties[name];
				});
			}
			tableColumns.push(columnInfo);
		}
		// In case a property has defined a #TextOnly text arrangement don't only create the complex property with the text property as a child property,
		// but also the property itself as it can be used as within the sortConditions or on custom columns.
		// This step must be valide also from the columns added via LineItems or from a column available on the p13n.
		if (getDisplayMode(property) === "Description") {
			nonSortableColumns = nonSortableColumns.concat(property.name);
			tableColumns.push(
				getColumnDefinitionFromProperty(
					property,
					converterContext.getEntitySetBasedAnnotationPath(property.fullyQualifiedName),
					property.name,
					false,
					false,
					nonSortableColumns,
					aggregationHelper,
					converterContext,
					[]
				)
			);
		}
	});

	// Create a propertyInfo for each related property.
	const relatedColumns = _createRelatedColumns(
		columnsToBeCreated,
		tableColumns,
		nonSortableColumns,
		converterContext,
		entityType,
		textOnlyColumnsFromTextAnnotation
	);

	return tableColumns.concat(relatedColumns);
};

/**
 * Create a column definition from a property.
 *
 * @param property Entity type property for which the column is created
 * @param fullPropertyPath The full path to the target property
 * @param relativePath The relative path to the target property based on the context
 * @param useDataFieldPrefix Should be prefixed with "DataField::", else it will be prefixed with "Property::"
 * @param availableForAdaptation Decides whether the column should be available for adaptation
 * @param nonSortableColumns The array of all non-sortable column names
 * @param aggregationHelper The aggregationHelper for the entity
 * @param converterContext The converter context
 * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
 * @returns The annotation column definition
 */
const getColumnDefinitionFromProperty = function (
	property: Property,
	fullPropertyPath: string,
	relativePath: string,
	useDataFieldPrefix: boolean,
	availableForAdaptation: boolean,
	nonSortableColumns: string[],
	aggregationHelper: AggregationHelper,
	converterContext: ConverterContext,
	textOnlyColumnsFromTextAnnotation: string[]
): AnnotationTableColumn {
	const name = useDataFieldPrefix ? relativePath : `Property::${relativePath}`;
	const key = (useDataFieldPrefix ? "DataField::" : "Property::") + replaceSpecialChars(relativePath);
	const semanticObjectAnnotationPath = getSemanticObjectPath(converterContext, property);
	const isHidden = property.annotations?.UI?.Hidden?.valueOf() === true;
	const groupPath: string | undefined = property.name ? _sliceAtSlash(property.name, true, false) : undefined;
	const isGroup: boolean = groupPath != property.name;
	const isDataPointFakeProperty: boolean = name.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1;
	const exportType: string = _getExportDataType(property.type);
	const sDateInputFormat: string | undefined = property.type === "Edm.Date" ? "YYYY-MM-DD" : undefined;
	const dataType: string | undefined = getDataFieldDataType(property);
	const propertyTypeConfig = !isDataPointFakeProperty ? getTypeConfig(property, dataType) : undefined;
	const semanticKeys: SemanticKey = converterContext.getAnnotationsByTerm("Common", CommonAnnotationTerms.SemanticKey, [
		converterContext.getEntityType()
	])[0];
	const isAPropertyFromTextOnlyAnnotation =
		textOnlyColumnsFromTextAnnotation && textOnlyColumnsFromTextAnnotation.indexOf(relativePath) >= 0;
	const sortable =
		(!isHidden || isAPropertyFromTextOnlyAnnotation) && nonSortableColumns.indexOf(relativePath) === -1 && !isDataPointFakeProperty;
	const oTypeConfig = !isDataPointFakeProperty
		? {
				className: property.type || dataType,
				oFormatOptions: propertyTypeConfig.formatOptions,
				oConstraints: propertyTypeConfig.constraints
		  }
		: undefined;
	let exportSettings: ColumnExportSettings | null = isDataPointFakeProperty
		? {
				template: getTargetValueOnDataPoint(property)
		  }
		: null;

	if (!isDataPointFakeProperty && _isExportableColumn(property)) {
		const oUnitProperty = getAssociatedCurrencyProperty(property) || getAssociatedUnitProperty(property);
		const oTimezoneProperty = getAssociatedTimezoneProperty(property);
		const sUnitText = property?.annotations?.Measures?.ISOCurrency || property?.annotations?.Measures?.Unit;
		const sTimezoneText = property?.annotations?.Common?.Timezone;
		exportSettings = {
			type: exportType,
			inputFormat: sDateInputFormat,
			scale: property.scale,
			delimiter: property.type === "Edm.Int64"
		};
		if (oUnitProperty) {
			exportSettings.unitProperty = oUnitProperty.name;
			exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
		} else if (sUnitText) {
			exportSettings.unit = `${sUnitText}`;
		}
		if (oTimezoneProperty) {
			exportSettings.timezoneProperty = oTimezoneProperty.name;
			exportSettings.utc = false;
		} else if (sTimezoneText) {
			exportSettings.timezone = sTimezoneText.toString();
		}
	}
	const collectedNavigationPropertyLabels: string[] | undefined = _getCollectedNavigationPropertyLabels(relativePath, converterContext);

	const oColumn: any = {
		key: key,
		type: ColumnType.Annotation,
		label: getLabel(property, isGroup),
		groupLabel: isGroup ? getLabel(property) : null,
		group: isGroup ? groupPath : null,
		annotationPath: fullPropertyPath,
		semanticObjectPath: semanticObjectAnnotationPath,
		// A fake property was created for the TargetValue used on DataPoints, this property should be hidden and non sortable
		availability:
			!availableForAdaptation || isHidden || isDataPointFakeProperty ? AvailabilityType.Hidden : AvailabilityType.Adaptation,
		name: name,
		relativePath: isDataPointFakeProperty
			? (property as any).annotations?.UI?.DataFieldDefault?.Target?.$target?.Value?.path || (property as any).Value.path
			: relativePath,
		sortable: sortable,
		isGroupable: aggregationHelper.isAnalyticsSupported() ? aggregationHelper.isPropertyGroupable(property) : sortable,
		isKey: property.isKey,
		isDataPointFakeTargetProperty: isDataPointFakeProperty,
		exportSettings: exportSettings,
		caseSensitive: isFilteringCaseSensitive(converterContext),
		typeConfig: oTypeConfig,
		visualSettings: isDataPointFakeProperty ? { widthCalculation: null } : undefined,
		importance: getImportance((property as any).annotations?.UI?.DataFieldDefault, semanticKeys),
		additionalLabels: collectedNavigationPropertyLabels
	};
	const sTooltip = _getTooltip(property);
	if (sTooltip) {
		oColumn.tooltip = sTooltip;
	}

	return oColumn as AnnotationTableColumn;
};

/**
 * Returns Boolean true for exportable columns, false for non exportable columns.
 *
 * @param source The dataField or property to be evaluated
 * @returns True for exportable column, false for non exportable column
 * @private
 */

function _isExportableColumn(source: DataFieldAbstractTypes | Property): boolean {
	let propertyType, property;
	const dataFieldDefaultPropertyType = (source as Property).annotations?.UI?.DataFieldDefault?.$Type;
	if (isProperty(source && dataFieldDefaultPropertyType)) {
		propertyType = dataFieldDefaultPropertyType;
	} else {
		property = source as DataFieldAbstractTypes;
		propertyType = property.$Type;
		if (propertyType === UIAnnotationTypes.DataFieldForAnnotation && (property as DataFieldForAnnotation).Target.$target?.$Type) {
			//For Chart
			propertyType = (property as DataFieldForAnnotation).Target.$target.$Type;
			return UIAnnotationTypes.ChartDefinitionType.indexOf(propertyType) === -1;
		} else if (
			(property as DataField).Value?.$target?.annotations?.Core?.MediaType?.term === "Org.OData.Core.V1.MediaType" &&
			(property as DataField).Value?.$target?.annotations?.Core?.isURL !== true
		) {
			//For Stream
			return false;
		}
	}
	return propertyType
		? [
				UIAnnotationTypes.DataFieldForAction,
				UIAnnotationTypes.DataFieldForIntentBasedNavigation,
				UIAnnotationTypes.DataFieldForActionGroup
		  ].indexOf(propertyType) === -1
		: true;
}

/**
 * Returns Boolean true for valid columns, false for invalid columns.
 *
 * @param dataField Different DataField types defined in the annotations
 * @returns True for valid columns, false for invalid columns
 * @private
 */
const _isValidColumn = function (dataField: DataFieldAbstractTypes) {
	switch (dataField.$Type) {
		case UIAnnotationTypes.DataFieldForAction:
		case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
			return !!dataField.Inline;
		case UIAnnotationTypes.DataFieldWithAction:
		case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
		case UIAnnotationTypes.DataField:
		case UIAnnotationTypes.DataFieldWithUrl:
		case UIAnnotationTypes.DataFieldForAnnotation:
		case UIAnnotationTypes.DataFieldWithNavigationPath:
			return true;
		default:
		// Todo: Replace with proper Log statement once available
		//  throw new Error("Unhandled DataField Abstract type: " + dataField.$Type);
	}
};
/**
 * Returns the binding expression to evaluate the visibility of a DataField or DataPoint annotation.
 *
 * SAP Fiori elements will evaluate either the UI.Hidden annotation defined on the annotation itself or on the target property.
 *
 * @param dataFieldModelPath The metapath referring to the annotation that is evaluated by SAP Fiori elements.
 * @param [formatOptions] FormatOptions optional.
 * @param formatOptions.isAnalytics This flag is used to check if the analytic table has GroupHeader expanded.
 * @returns An expression that you can bind to the UI.
 */
export const _getVisibleExpression = function (
	dataFieldModelPath: DataModelObjectPath,
	formatOptions?: any
): BindingToolkitExpression<any> {
	const targetObject: DataFieldAbstractTypes | DataPointTypeTypes = dataFieldModelPath.targetObject;
	let propertyValue;
	if (targetObject) {
		switch (targetObject.$Type) {
			case UIAnnotationTypes.DataField:
			case UIAnnotationTypes.DataFieldWithUrl:
			case UIAnnotationTypes.DataFieldWithNavigationPath:
			case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
			case UIAnnotationTypes.DataFieldWithAction:
			case UIAnnotationTypes.DataPointType:
				propertyValue = targetObject.Value.$target;
				break;
			case UIAnnotationTypes.DataFieldForAnnotation:
				// if it is a DataFieldForAnnotation pointing to a DataPoint we look at the dataPoint's value
				if (targetObject?.Target?.$target?.$Type === UIAnnotationTypes.DataPointType) {
					propertyValue = targetObject.Target.$target?.Value.$target;
				}
				break;
			case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
			case UIAnnotationTypes.DataFieldForAction:
			default:
				propertyValue = undefined;
		}
	}
	const isAnalyticalGroupHeaderExpanded = formatOptions?.isAnalytics ? UI.IsExpanded : constant(false);
	const isAnalyticalLeaf = formatOptions?.isAnalytics ? equal(UI.NodeLevel, 0) : constant(false);

	// A data field is visible if:
	// - the UI.Hidden expression in the original annotation does not evaluate to 'true'
	// - the UI.Hidden expression in the target property does not evaluate to 'true'
	// - in case of Analytics it's not visible for an expanded GroupHeader
	return and(
		...[
			not(equal(getExpressionFromAnnotation(targetObject?.annotations?.UI?.Hidden), true)),
			ifElse(
				!!propertyValue,
				propertyValue && not(equal(getExpressionFromAnnotation(propertyValue.annotations?.UI?.Hidden), true)),
				true
			),
			or(not(isAnalyticalGroupHeaderExpanded), isAnalyticalLeaf)
		]
	);
};

/**
 * Returns hidden binding expressions for a field group.
 *
 * @param dataFieldGroup DataField defined in the annotations
 * @param fieldFormatOptions FormatOptions optional.
 * @param fieldFormatOptions.isAnalytics This flag is used to check if the analytic table has GroupHeader expanded.
 * @returns Compile binding of field group expressions.
 * @private
 */
const _getFieldGroupHiddenExpressions = function (
	dataFieldGroup: DataFieldAbstractTypes,
	fieldFormatOptions: any
): CompiledBindingToolkitExpression | undefined {
	const aFieldGroupHiddenExpressions: BindingToolkitExpression<any>[] = [];
	if (
		dataFieldGroup.$Type === UIAnnotationTypes.DataFieldForAnnotation &&
		dataFieldGroup.Target?.$target?.$Type === UIAnnotationTypes.FieldGroupType
	) {
		dataFieldGroup.Target.$target.Data?.forEach((innerDataField: DataFieldAbstractTypes | DataPointTypeTypes) => {
			aFieldGroupHiddenExpressions.push(
				_getVisibleExpression({ targetObject: innerDataField } as DataModelObjectPath, fieldFormatOptions)
			);
		});
		return compileExpression(ifElse(or(...aFieldGroupHiddenExpressions), constant(true), constant(false)));
	} else {
		return undefined;
	}
};

/**
 * Returns the label for the property and dataField.
 *
 * @param [property] Property, DataField or Navigation Property defined in the annotations
 * @param isGroup
 * @returns Label of the property or DataField
 * @private
 */
const getLabel = function (property: DataFieldAbstractTypes | Property | NavigationProperty, isGroup = false): string | undefined {
	if (!property) {
		return undefined;
	}
	if (isProperty(property) || isNavigationProperty(property)) {
		const dataFieldDefault = (property as Property).annotations?.UI?.DataFieldDefault;
		if (dataFieldDefault && !dataFieldDefault.qualifier && dataFieldDefault.Label?.valueOf()) {
			return compileExpression(getExpressionFromAnnotation(dataFieldDefault.Label?.valueOf()));
		}
		return compileExpression(getExpressionFromAnnotation(property.annotations.Common?.Label?.valueOf() || property.name));
	} else if (isDataFieldTypes(property)) {
		if (!!isGroup && property.$Type === UIAnnotationTypes.DataFieldWithIntentBasedNavigation) {
			return compileExpression(getExpressionFromAnnotation(property.Label?.valueOf()));
		}
		return compileExpression(
			getExpressionFromAnnotation(
				property.Label?.valueOf() || property.Value?.$target?.annotations?.Common?.Label?.valueOf() || property.Value?.$target?.name
			)
		);
	} else if (property.$Type === UIAnnotationTypes.DataFieldForAnnotation) {
		return compileExpression(
			getExpressionFromAnnotation(
				property.Label?.valueOf() || (property.Target?.$target as DataPoint)?.Value?.$target?.annotations?.Common?.Label?.valueOf()
			)
		);
	} else {
		return compileExpression(getExpressionFromAnnotation(property.Label?.valueOf()));
	}
};

const _getTooltip = function (source: DataFieldAbstractTypes | Property): string | undefined {
	if (!source) {
		return undefined;
	}

	if (isProperty(source) || source.annotations?.Common?.QuickInfo) {
		return source.annotations?.Common?.QuickInfo
			? compileExpression(getExpressionFromAnnotation(source.annotations.Common.QuickInfo.valueOf()))
			: undefined;
	} else if (isDataFieldTypes(source)) {
		return source.Value?.$target?.annotations?.Common?.QuickInfo
			? compileExpression(getExpressionFromAnnotation(source.Value.$target.annotations.Common.QuickInfo.valueOf()))
			: undefined;
	} else if (source.$Type === UIAnnotationTypes.DataFieldForAnnotation) {
		const datapointTarget = source.Target?.$target as DataPoint;
		return datapointTarget?.Value?.$target?.annotations?.Common?.QuickInfo
			? compileExpression(getExpressionFromAnnotation(datapointTarget.Value.$target.annotations.Common.QuickInfo.valueOf()))
			: undefined;
	} else {
		return undefined;
	}
};

export function getRowStatusVisibility(colName: string, isSemanticKeyInFieldGroup?: Boolean): BindingToolkitExpression<boolean> {
	return formatResult(
		[
			pathInModel(`semanticKeyHasDraftIndicator`, "internal"),
			pathInModel(`filteredMessages`, "internal"),
			colName,
			isSemanticKeyInFieldGroup
		],
		tableFormatters.getErrorStatusTextVisibilityFormatter
	);
}

/**
 * Creates a PropertyInfo for each identified property consumed by a LineItem.
 *
 * @param columnsToBeCreated Identified properties.
 * @param existingColumns The list of columns created for LineItems and Properties of entityType.
 * @param nonSortableColumns The array of column names which cannot be sorted.
 * @param converterContext The converter context.
 * @param entityType The entity type for the LineItem
 * @param textOnlyColumnsFromTextAnnotation The array of columns from a property using a text annotation with textOnly as text arrangement.
 * @returns The array of columns created.
 */
const _createRelatedColumns = function (
	columnsToBeCreated: Record<string, Property>,
	existingColumns: AnnotationTableColumn[],
	nonSortableColumns: string[],
	converterContext: ConverterContext,
	entityType: EntityType,
	textOnlyColumnsFromTextAnnotation: string[]
): AnnotationTableColumn[] {
	const relatedColumns: AnnotationTableColumn[] = [];
	const relatedPropertyNameMap: Record<string, string> = {};
	const aggregationHelper = new AggregationHelper(entityType, converterContext);

	Object.keys(columnsToBeCreated).forEach((name) => {
		const property = columnsToBeCreated[name],
			annotationPath = converterContext.getAbsoluteAnnotationPath(name),
			// Check whether the related column already exists.
			relatedColumn = existingColumns.find((column) => column.name === name);
		if (relatedColumn === undefined) {
			// Case 1: Key contains DataField prefix to ensure all property columns have the same key format.
			// New created property column is set to hidden.
			relatedColumns.push(
				getColumnDefinitionFromProperty(
					property,
					annotationPath,
					name,
					true,
					false,
					nonSortableColumns,
					aggregationHelper,
					converterContext,
					textOnlyColumnsFromTextAnnotation
				)
			);
		} else if (relatedColumn.annotationPath !== annotationPath || relatedColumn.propertyInfos) {
			// Case 2: The existing column points to a LineItem (or)
			// Case 3: This is a self reference from an existing column

			const newName = `Property::${name}`;

			// Checking whether the related property column has already been created in a previous iteration.
			if (!existingColumns.some((column) => column.name === newName)) {
				// Create a new property column with 'Property::' prefix,
				// Set it to hidden as it is only consumed by Complex property infos.
				const column = getColumnDefinitionFromProperty(
					property,
					annotationPath,
					name,
					false,
					false,
					nonSortableColumns,
					aggregationHelper,
					converterContext,
					textOnlyColumnsFromTextAnnotation
				);
				column.isPartOfLineItem = relatedColumn.isPartOfLineItem;
				relatedColumns.push(column);
				relatedPropertyNameMap[name] = newName;
			} else if (
				existingColumns.some((column) => column.name === newName) &&
				existingColumns.some((column) => column.propertyInfos?.includes(name))
			) {
				relatedPropertyNameMap[name] = newName;
			}
		}
	});

	// The property 'name' has been prefixed with 'Property::' for uniqueness.
	// Update the same in other propertyInfos[] references which point to this property.
	existingColumns.forEach((column) => {
		column.propertyInfos = column.propertyInfos?.map((propertyInfo) => relatedPropertyNameMap[propertyInfo] ?? propertyInfo);
		column.additionalPropertyInfos = column.additionalPropertyInfos?.map(
			(propertyInfo) => relatedPropertyNameMap[propertyInfo] ?? propertyInfo
		);
	});

	return relatedColumns;
};

/**
 * Getting the Column Name
 * If it points to a DataField with one property or DataPoint with one property, it will use the property name
 * here to be consistent with the existing flex changes.
 *
 * @param dataField Different DataField types defined in the annotations
 * @returns The name of annotation columns
 * @private
 */
const _getAnnotationColumnName = function (dataField: DataFieldAbstractTypes) {
	// This is needed as we have flexibility changes already that we have to check against
	if (isDataFieldTypes(dataField)) {
		return dataField.Value?.path;
	} else if (dataField.$Type === UIAnnotationTypes.DataFieldForAnnotation && (dataField.Target?.$target as DataPoint)?.Value?.path) {
		// This is for removing duplicate properties. For example, 'Progress' Property is removed if it is already defined as a DataPoint
		return (dataField.Target?.$target as DataPoint)?.Value.path;
	} else {
		return KeyHelper.generateKeyFromDataField(dataField);
	}
};

/**
 * Determines if the data field labels have to be displayed in the table.
 *
 * @param fieldGroupName The `DataField` name being processed.
 * @param visualizationPath
 * @param converterContext
 * @returns `showDataFieldsLabel` value from the manifest
 * @private
 */
const _getShowDataFieldsLabel = function (fieldGroupName: string, visualizationPath: string, converterContext: ConverterContext): boolean {
	const oColumns = converterContext.getManifestControlConfiguration(visualizationPath)?.columns;
	const aColumnKeys = oColumns && Object.keys(oColumns);
	return (
		aColumnKeys &&
		!!aColumnKeys.find(function (key: string) {
			return key === fieldGroupName && oColumns[key].showDataFieldsLabel;
		})
	);
};

/**
 * Determines the relative path of the property with respect to the root entity.
 *
 * @param dataField The `DataField` being processed.
 * @returns The relative path
 */
const _getRelativePath = function (dataField: DataFieldAbstractTypes): string {
	let relativePath: string = "";

	switch (dataField.$Type) {
		case UIAnnotationTypes.DataField:
		case UIAnnotationTypes.DataFieldWithNavigationPath:
		case UIAnnotationTypes.DataFieldWithUrl:
		case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
		case UIAnnotationTypes.DataFieldWithAction:
			relativePath = (dataField as DataField)?.Value?.path;
			break;

		case UIAnnotationTypes.DataFieldForAnnotation:
			relativePath = dataField?.Target?.value;
			break;

		case UIAnnotationTypes.DataFieldForAction:
		case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
		case UIAnnotationTypes.DataFieldForActionGroup:
		case UIAnnotationTypes.DataFieldWithActionGroup:
			relativePath = KeyHelper.generateKeyFromDataField(dataField);
			break;
	}

	return relativePath;
};

const _sliceAtSlash = function (path: string, isLastSlash: boolean, isLastPart: boolean) {
	const iSlashIndex = isLastSlash ? path.lastIndexOf("/") : path.indexOf("/");

	if (iSlashIndex === -1) {
		return path;
	}
	return isLastPart ? path.substring(iSlashIndex + 1, path.length) : path.substring(0, iSlashIndex);
};

/**
 * Determine whether a column is sortable.
 *
 * @param dataField The data field being processed
 * @param propertyPath The property path
 * @param nonSortableColumns Collection of non-sortable column names as per annotation
 * @returns True if the column is sortable
 */
const _isColumnSortable = function (dataField: DataFieldAbstractTypes, propertyPath: string, nonSortableColumns: string[]): boolean {
	return (
		nonSortableColumns.indexOf(propertyPath) === -1 && // Column is not marked as non-sortable via annotation
		(dataField.$Type === UIAnnotationTypes.DataField ||
			dataField.$Type === UIAnnotationTypes.DataFieldWithUrl ||
			dataField.$Type === UIAnnotationTypes.DataFieldWithIntentBasedNavigation ||
			dataField.$Type === UIAnnotationTypes.DataFieldWithAction)
	);
};

/**
 * Returns whether filtering on the table is case sensitive.
 *
 * @param converterContext The instance of the converter context
 * @returns Returns 'false' if FilterFunctions annotation supports 'tolower', else 'true'
 */
export const isFilteringCaseSensitive = function (converterContext: ConverterContext): boolean {
	const filterFunctions: FilterFunctions | undefined = _getFilterFunctions(converterContext);
	return Array.isArray(filterFunctions) ? (filterFunctions as String[]).indexOf("tolower") === -1 : true;
};

function _getFilterFunctions(ConverterContext: ConverterContext): FilterFunctions | undefined {
	if (ModelHelper.isSingleton(ConverterContext.getEntitySet())) {
		return undefined;
	}
	const capabilities = ConverterContext.getEntitySet()?.annotations?.Capabilities as EntitySetAnnotations_Capabilities;
	return capabilities?.FilterFunctions || ConverterContext.getEntityContainer()?.annotations?.Capabilities?.FilterFunctions;
}

/**
 * Returns default format options for text fields in a table.
 *
 * @param formatOptions
 * @returns Collection of format options with default values
 */
function _getDefaultFormatOptionsForTable(formatOptions: FormatOptionsType | undefined): FormatOptionsType | undefined {
	return formatOptions === undefined
		? undefined
		: {
				textLinesEdit: 4,
				...formatOptions
		  };
}

function _findSemanticKeyValues(semanticKeys: any[], name: string): any {
	const aSemanticKeyValues: string[] = [];
	let bSemanticKeyFound = false;
	for (let i = 0; i < semanticKeys.length; i++) {
		aSemanticKeyValues.push(semanticKeys[i].value);
		if (semanticKeys[i].value === name) {
			bSemanticKeyFound = true;
		}
	}
	return {
		values: aSemanticKeyValues,
		semanticKeyFound: bSemanticKeyFound
	};
}

function _findProperties(semanticKeyValues: any[], fieldGroupProperties: any[]) {
	let semanticKeyHasPropertyInFieldGroup = false;
	let sPropertyPath;
	if (semanticKeyValues && semanticKeyValues.length >= 1 && fieldGroupProperties && fieldGroupProperties.length >= 1) {
		for (let i = 0; i < semanticKeyValues.length; i++) {
			if ([semanticKeyValues[i]].some((tmp) => fieldGroupProperties.indexOf(tmp) >= 0)) {
				semanticKeyHasPropertyInFieldGroup = true;
				sPropertyPath = semanticKeyValues[i];
				break;
			}
		}
	}
	return {
		semanticKeyHasPropertyInFieldGroup: semanticKeyHasPropertyInFieldGroup,
		fieldGroupPropertyPath: sPropertyPath
	};
}

function _findSemanticKeyValuesInFieldGroup(dataFieldGroup: DataFieldAbstractTypes | null, semanticKeyValues: []): any {
	const aProperties: any[] = [];
	let _propertiesFound: { semanticKeyHasPropertyInFieldGroup: boolean; fieldGroupPropertyPath: any } = {
		semanticKeyHasPropertyInFieldGroup: false,
		fieldGroupPropertyPath: undefined
	};
	if (
		dataFieldGroup &&
		dataFieldGroup.$Type === UIAnnotationTypes.DataFieldForAnnotation &&
		dataFieldGroup.Target?.$target?.$Type === UIAnnotationTypes.FieldGroupType
	) {
		dataFieldGroup.Target.$target.Data?.forEach((innerDataField: DataFieldAbstractTypes) => {
			if (
				(innerDataField.$Type === UIAnnotationTypes.DataField || innerDataField.$Type === UIAnnotationTypes.DataFieldWithUrl) &&
				innerDataField.Value
			) {
				aProperties.push(innerDataField.Value.path);
			}
			_propertiesFound = _findProperties(semanticKeyValues, aProperties);
		});
	}
	return {
		semanticKeyHasPropertyInFieldGroup: _propertiesFound.semanticKeyHasPropertyInFieldGroup,
		propertyPath: _propertiesFound.fieldGroupPropertyPath
	};
}

/**
 * Returns default format options with draftIndicator for a column.
 *
 * @param name
 * @param semanticKeys
 * @param isFieldGroupColumn
 * @param dataFieldGroup
 * @returns Collection of format options with default values
 */
function getDefaultDraftIndicatorForColumn(
	name: string,
	semanticKeys: any[],
	isFieldGroupColumn: boolean,
	dataFieldGroup: DataFieldAbstractTypes | null
) {
	if (!semanticKeys) {
		return {};
	}
	const semanticKey = _findSemanticKeyValues(semanticKeys, name);
	const semanticKeyInFieldGroup = _findSemanticKeyValuesInFieldGroup(dataFieldGroup, semanticKey.values);
	if (semanticKey.semanticKeyFound) {
		const formatOptionsObj: any = {
			hasDraftIndicator: true,
			semantickeys: semanticKey.values,
			objectStatusTextVisibility: compileExpression(getRowStatusVisibility(name, false))
		};
		if (isFieldGroupColumn && semanticKeyInFieldGroup.semanticKeyHasPropertyInFieldGroup) {
			formatOptionsObj["objectStatusTextVisibility"] = compileExpression(getRowStatusVisibility(name, true));
			formatOptionsObj["fieldGroupDraftIndicatorPropertyPath"] = semanticKeyInFieldGroup.propertyPath;
		}
		return formatOptionsObj;
	} else if (!semanticKeyInFieldGroup.semanticKeyHasPropertyInFieldGroup) {
		return {};
	} else {
		// Semantic Key has a property in a FieldGroup
		return {
			fieldGroupDraftIndicatorPropertyPath: semanticKeyInFieldGroup.propertyPath,
			fieldGroupName: name,
			objectStatusTextVisibility: compileExpression(getRowStatusVisibility(name, true))
		};
	}
}

function _getImpNumber(dataField: DataFieldTypes): number {
	const importance = dataField?.annotations?.UI?.Importance as string;

	if (importance && importance.includes("UI.ImportanceType/High")) {
		return 3;
	}
	if (importance && importance.includes("UI.ImportanceType/Medium")) {
		return 2;
	}
	if (importance && importance.includes("UI.ImportanceType/Low")) {
		return 1;
	}
	return 0;
}

function _getDataFieldImportance(dataField: DataFieldTypes): Importance {
	const importance = dataField?.annotations?.UI?.Importance as string;
	return importance ? (importance.split("/")[1] as Importance) : Importance.None;
}

function _getMaxImportance(fields: DataFieldTypes[]): Importance {
	if (fields && fields.length > 0) {
		let maxImpNumber = -1;
		let impNumber = -1;
		let DataFieldWithMaxImportance;
		for (const field of fields) {
			impNumber = _getImpNumber(field);
			if (impNumber > maxImpNumber) {
				maxImpNumber = impNumber;
				DataFieldWithMaxImportance = field;
			}
		}
		return _getDataFieldImportance(DataFieldWithMaxImportance as DataFieldTypes);
	}
	return Importance.None;
}

/**
 * Returns the importance value for a column.
 *
 * @param dataField
 * @param semanticKeys
 * @returns The importance value
 */
export function getImportance(dataField: DataFieldAbstractTypes, semanticKeys: SemanticKey): Importance | undefined {
	//Evaluate default Importance is not set explicitly
	let fieldsWithImportance, mapSemanticKeys: any;
	//Check if semanticKeys are defined at the EntitySet level
	if (semanticKeys && semanticKeys.length > 0) {
		mapSemanticKeys = semanticKeys.map(function (key) {
			return key.value;
		});
	}
	if (!dataField) {
		return undefined;
	}
	if (dataField.$Type === UIAnnotationTypes.DataFieldForAnnotation) {
		const fieldGroupData = (dataField as any).Target["$target"]["Data"] as FieldGroupType,
			fieldGroupHasSemanticKey =
				fieldGroupData &&
				(fieldGroupData as any).some(function (fieldGroupDataField: DataFieldAbstractTypes) {
					return (
						(fieldGroupDataField as unknown as DataFieldTypes)?.Value?.path &&
						fieldGroupDataField.$Type !== UIAnnotationTypes.DataFieldForAnnotation &&
						mapSemanticKeys &&
						mapSemanticKeys.includes((fieldGroupDataField as unknown as DataFieldTypes)?.Value?.path)
					);
				});
		//If a FieldGroup contains a semanticKey, importance set to High
		if (fieldGroupHasSemanticKey) {
			return Importance.High;
		} else {
			//If the DataFieldForAnnotation has an Importance we take it
			if (dataField?.annotations?.UI?.Importance) {
				return _getDataFieldImportance(dataField as unknown as DataFieldTypes);
			}
			// else the highest importance (if any) is returned
			fieldsWithImportance =
				fieldGroupData &&
				(fieldGroupData as any).filter(function (item: DataFieldTypes) {
					return item?.annotations?.UI?.Importance;
				});
			return _getMaxImportance(fieldsWithImportance as DataFieldTypes[]);
		}
		//If the current field is a semanticKey, importance set to High
	}
	return (dataField as DataFieldTypes).Value &&
		(dataField as DataFieldTypes)?.Value?.path &&
		mapSemanticKeys &&
		mapSemanticKeys.includes((dataField as DataFieldTypes).Value.path)
		? Importance.High
		: _getDataFieldImportance(dataField as unknown as DataFieldTypes);
}

/**
 * Returns line items from metadata annotations.
 *
 * @param lineItemAnnotation Collection of data fields with their annotations
 * @param visualizationPath The visualization path
 * @param converterContext The converter context
 * @returns The columns from the annotations
 */
const getColumnsFromAnnotations = function (
	lineItemAnnotation: LineItem,
	visualizationPath: string,
	converterContext: ConverterContext
): AnnotationTableColumn[] {
	const entityType = converterContext.getAnnotationEntityType(lineItemAnnotation),
		annotationColumns: AnnotationTableColumn[] = [],
		columnsToBeCreated: Record<string, Property> = {},
		nonSortableColumns: string[] = getNonSortablePropertiesRestrictions(converterContext.getEntitySet()),
		tableManifestSettings: TableManifestConfiguration = converterContext.getManifestControlConfiguration(visualizationPath),
		tableType: TableType = tableManifestSettings?.tableSettings?.type || "ResponsiveTable";
	const textOnlyColumnsFromTextAnnotation: string[] = [];
	const semanticKeys: SemanticKey = converterContext.getAnnotationsByTerm("Common", CommonAnnotationTerms.SemanticKey, [
		converterContext.getEntityType()
	])[0];
	if (lineItemAnnotation) {
		lineItemAnnotation.forEach((lineItem) => {
			if (!_isValidColumn(lineItem)) {
				return;
			}
			let exportSettings: ColumnExportSettings | null = null;
			const semanticObjectAnnotationPath =
				isDataFieldTypes(lineItem) && lineItem.Value?.$target?.fullyQualifiedName
					? getSemanticObjectPath(converterContext, lineItem)
					: undefined;
			const relativePath = _getRelativePath(lineItem);
			let relatedPropertyNames: string[];
			// Determine properties which are consumed by this LineItem.
			const relatedPropertiesInfo: ComplexPropertyInfo = collectRelatedPropertiesRecursively(lineItem, converterContext, tableType);
			const relatedProperties: any = relatedPropertiesInfo.properties;
			if (
				lineItem.$Type === UIAnnotationTypes.DataFieldForAnnotation &&
				lineItem.Target?.$target?.$Type === UIAnnotationTypes.FieldGroupType
			) {
				relatedPropertyNames = Object.keys(relatedPropertiesInfo.properties).filter((key) => {
					let isStaticallyHidden;
					if (relatedProperties[key].annotations?.UI) {
						isStaticallyHidden = isReferencePropertyStaticallyHidden(relatedProperties[key].annotations?.UI?.DataFieldDefault);
					} else {
						isStaticallyHidden = isReferencePropertyStaticallyHidden(relatedProperties[key]);
					}
					return !isStaticallyHidden;
				});
			} else {
				relatedPropertyNames = Object.keys(relatedPropertiesInfo.properties);
			}
			const additionalPropertyNames: string[] = Object.keys(relatedPropertiesInfo.additionalProperties);
			const groupPath: string = _sliceAtSlash(relativePath, true, false);
			const isGroup: boolean = groupPath != relativePath;
			const sLabel: string | undefined = getLabel(lineItem, isGroup);
			const name = _getAnnotationColumnName(lineItem);
			const isFieldGroupColumn: boolean = groupPath.indexOf("@com.sap.vocabularies.UI.v1.FieldGroup") > -1;
			const showDataFieldsLabel: boolean = isFieldGroupColumn
				? _getShowDataFieldsLabel(name, visualizationPath, converterContext)
				: false;
			const dataType: string | undefined = getDataFieldDataType(lineItem);
			const sDateInputFormat: string | undefined = dataType === "Edm.Date" ? "YYYY-MM-DD" : undefined;
			const formatOptions = _getDefaultFormatOptionsForTable(
				getDefaultDraftIndicatorForColumn(name, semanticKeys, isFieldGroupColumn, lineItem)
			);
			let fieldGroupHiddenExpressions: CompiledBindingToolkitExpression;
			if (
				lineItem.$Type === UIAnnotationTypes.DataFieldForAnnotation &&
				lineItem.Target?.$target?.$Type === UIAnnotationTypes.FieldGroupType
			) {
				fieldGroupHiddenExpressions = _getFieldGroupHiddenExpressions(lineItem, formatOptions);
			}
			if (_isExportableColumn(lineItem)) {
				//exclude the types listed above for the Export (generates error on Export as PDF)
				exportSettings = {
					template: relatedPropertiesInfo.exportSettingsTemplate,
					wrap: relatedPropertiesInfo.exportSettingsWrapping,
					type: dataType ? _getExportDataType(dataType, relatedPropertyNames.length > 1) : undefined,
					inputFormat: sDateInputFormat,
					delimiter: dataType === "Edm.Int64"
				};

				if (relatedPropertiesInfo.exportUnitName) {
					exportSettings.unitProperty = relatedPropertiesInfo.exportUnitName;
					exportSettings.type = "Currency"; // Force to a currency because there's a unitProperty (otherwise the value isn't properly formatted when exported)
				} else if (relatedPropertiesInfo.exportUnitString) {
					exportSettings.unit = relatedPropertiesInfo.exportUnitString;
				}
				if (relatedPropertiesInfo.exportTimezoneName) {
					exportSettings.timezoneProperty = relatedPropertiesInfo.exportTimezoneName;
				} else if (relatedPropertiesInfo.exportTimezoneString) {
					exportSettings.timezone = relatedPropertiesInfo.exportTimezoneString;
				}
			}

			const propertyTypeConfig = dataType && getTypeConfig(lineItem, dataType);
			const oTypeConfig = propertyTypeConfig
				? {
						className: dataType,
						oFormatOptions: {
							...formatOptions,
							...propertyTypeConfig.formatOptions
						},
						oConstraints: propertyTypeConfig.constraints
				  }
				: undefined;
			const visualSettings: VisualSettings = {};
			if (!dataType || !oTypeConfig) {
				// for charts
				visualSettings.widthCalculation = null;
			}

			const oColumn: any = {
				key: KeyHelper.generateKeyFromDataField(lineItem),
				type: ColumnType.Annotation,
				label: sLabel,
				groupLabel: isGroup ? getLabel(lineItem) : null,
				group: isGroup ? groupPath : null,
				FieldGroupHiddenExpressions: fieldGroupHiddenExpressions,
				annotationPath: converterContext.getEntitySetBasedAnnotationPath(lineItem.fullyQualifiedName),
				semanticObjectPath: semanticObjectAnnotationPath,
				availability: isDataFieldAlwaysHidden(lineItem) ? AvailabilityType.Hidden : AvailabilityType.Default,
				name: name,
				showDataFieldsLabel: showDataFieldsLabel,
				relativePath: relativePath,
				sortable: _isColumnSortable(lineItem, relativePath, nonSortableColumns),
				propertyInfos: relatedPropertyNames.length ? relatedPropertyNames : undefined,
				additionalPropertyInfos: additionalPropertyNames.length > 0 ? additionalPropertyNames : undefined,
				exportSettings: exportSettings,
				width: lineItem.annotations?.HTML5?.CssDefaults?.width || undefined,
				importance: getImportance(lineItem as DataFieldTypes, semanticKeys),
				isNavigable: true,
				formatOptions: formatOptions,
				caseSensitive: isFilteringCaseSensitive(converterContext),
				typeConfig: oTypeConfig,
				visualSettings: visualSettings,
				timezoneText: exportSettings?.timezone,
				isPartOfLineItem: true
			};
			const sTooltip = _getTooltip(lineItem);
			if (sTooltip) {
				oColumn.tooltip = sTooltip;
			}
			if (relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation.length > 0) {
				textOnlyColumnsFromTextAnnotation.push(...relatedPropertiesInfo.textOnlyPropertiesFromTextAnnotation);
			}

			annotationColumns.push(oColumn);

			// Collect information of related columns to be created.
			relatedPropertyNames.forEach((relatedPropertyName) => {
				columnsToBeCreated[relatedPropertyName] = relatedPropertiesInfo.properties[relatedPropertyName];
			});

			// Create columns for additional properties identified for ALP use case.
			additionalPropertyNames.forEach((additionalPropertyName) => {
				// Intentional overwrite as we require only one new PropertyInfo for a related Property.
				columnsToBeCreated[additionalPropertyName] = relatedPropertiesInfo.additionalProperties[additionalPropertyName];
			});
		});
	}

	// Get columns from the Properties of EntityType
	return getColumnsFromEntityType(
		columnsToBeCreated,
		entityType,
		annotationColumns,
		nonSortableColumns,
		converterContext,
		tableType,
		textOnlyColumnsFromTextAnnotation
	);
};

/**
 * Gets the property names from the manifest and checks against existing properties already added by annotations.
 * If a not yet stored property is found it adds it for sorting and filtering only to the annotationColumns.
 *
 * @param properties
 * @param annotationColumns
 * @param converterContext
 * @param entityType
 * @returns The columns from the annotations
 */
const _getPropertyNames = function (
	properties: string[] | undefined,
	annotationColumns: AnnotationTableColumn[],
	converterContext: ConverterContext,
	entityType: EntityType
): string[] | undefined {
	let matchedProperties: string[] | undefined;
	if (properties) {
		matchedProperties = properties.map(function (propertyPath) {
			const annotationColumn = annotationColumns.find(function (annotationColumn) {
				return annotationColumn.relativePath === propertyPath && annotationColumn.propertyInfos === undefined;
			});
			if (annotationColumn) {
				return annotationColumn.name;
			} else {
				const relatedColumns = _createRelatedColumns(
					{ [propertyPath]: entityType.resolvePath(propertyPath) },
					annotationColumns,
					[],
					converterContext,
					entityType,
					[]
				);
				annotationColumns.push(relatedColumns[0]);
				return relatedColumns[0].name;
			}
		});
	}

	return matchedProperties;
};

const _appendCustomTemplate = function (properties: string[]): string {
	return properties
		.map((property) => {
			return `{${properties.indexOf(property)}}`;
		})
		.join(`${"\n"}`);
};

/**
 * Returns table column definitions from manifest.
 *
 * These may be custom columns defined in the manifest, slot columns coming through
 * a building block, or annotation columns to overwrite annotation-based columns.
 *
 * @param columns
 * @param annotationColumns
 * @param converterContext
 * @param entityType
 * @param navigationSettings
 * @returns The columns from the manifest
 */
const getColumnsFromManifest = function (
	columns: Record<string, CustomDefinedTableColumn | CustomDefinedTableColumnForOverride>,
	annotationColumns: AnnotationTableColumn[],
	converterContext: ConverterContext,
	entityType: EntityType,
	navigationSettings?: NavigationSettingsConfiguration
): Record<string, ManifestColumn> {
	const internalColumns: Record<string, ManifestColumn> = {};

	function isAnnotationColumn(
		column: CustomDefinedTableColumn | CustomDefinedTableColumnForOverride,
		key: string
	): column is CustomDefinedTableColumnForOverride {
		return annotationColumns.some((annotationColumn) => annotationColumn.key === key);
	}

	function isSlotColumn(manifestColumn: any): manifestColumn is FragmentDefinedSlotColumn {
		return manifestColumn.type === ColumnType.Slot;
	}

	function isCustomColumn(manifestColumn: any): manifestColumn is ManifestDefinedCustomColumn {
		return manifestColumn.type === undefined && !!manifestColumn.template;
	}

	function _updateLinkedPropertiesOnCustomColumns(propertyInfos: string[], annotationTableColumns: AnnotationTableColumn[]) {
		const nonSortableColumns: string[] = getNonSortablePropertiesRestrictions(converterContext.getEntitySet());
		propertyInfos.forEach((property) => {
			annotationTableColumns.forEach((prop) => {
				if (prop.name === property) {
					prop.sortable = nonSortableColumns.indexOf(property.replace("Property::", "")) === -1;
					prop.isGroupable = prop.sortable;
				}
			});
		});
	}

	for (const key in columns) {
		const manifestColumn = columns[key];
		KeyHelper.validateKey(key);

		// BaseTableColumn
		const baseTableColumn = {
			key: key,
			width: manifestColumn.width || undefined,
			position: {
				anchor: manifestColumn.position?.anchor,
				placement: manifestColumn.position === undefined ? Placement.After : manifestColumn.position.placement
			},
			caseSensitive: isFilteringCaseSensitive(converterContext)
		};

		if (isAnnotationColumn(manifestColumn, key)) {
			const propertiesToOverwriteAnnotationColumn: CustomElement<AnnotationTableColumnForOverride> = {
				...baseTableColumn,
				importance: manifestColumn?.importance,
				horizontalAlign: manifestColumn?.horizontalAlign,
				availability: manifestColumn?.availability,
				type: ColumnType.Annotation,
				isNavigable: isAnnotationColumn(manifestColumn, key)
					? undefined
					: isActionNavigable(manifestColumn, navigationSettings, true),
				settings: manifestColumn.settings,
				formatOptions: _getDefaultFormatOptionsForTable(manifestColumn.formatOptions)
			};
			internalColumns[key] = propertiesToOverwriteAnnotationColumn;
		} else {
			const propertyInfos: string[] | undefined = _getPropertyNames(
				manifestColumn.properties,
				annotationColumns,
				converterContext,
				entityType
			);
			const baseManifestColumn = {
				...baseTableColumn,
				header: manifestColumn.header,
				importance: manifestColumn?.importance || Importance.None,
				horizontalAlign: manifestColumn?.horizontalAlign || HorizontalAlign.Begin,
				availability: manifestColumn?.availability || AvailabilityType.Default,
				template: manifestColumn.template,
				propertyInfos: propertyInfos,
				exportSettings: propertyInfos
					? {
							template: _appendCustomTemplate(propertyInfos),
							wrap: !!(propertyInfos.length > 1)
					  }
					: null,
				id: `CustomColumn::${key}`,
				name: `CustomColumn::${key}`,
				//Needed for MDC:
				formatOptions: { textLinesEdit: 4 },
				isGroupable: false,
				isNavigable: false,
				sortable: false,
				visualSettings: { widthCalculation: null }
			};
			if (propertyInfos) {
				_updateLinkedPropertiesOnCustomColumns(propertyInfos, annotationColumns);
			}

			if (isSlotColumn(manifestColumn)) {
				const customTableColumn: CustomElement<CustomBasedTableColumn> = {
					...baseManifestColumn,
					type: ColumnType.Slot
				};
				internalColumns[key] = customTableColumn;
			} else if (isCustomColumn(manifestColumn)) {
				const customTableColumn: CustomElement<CustomBasedTableColumn> = {
					...baseManifestColumn,
					type: ColumnType.Default
				};
				internalColumns[key] = customTableColumn;
			} else {
				const message = `The annotation column '${key}' referenced in the manifest is not found`;
				converterContext
					.getDiagnostics()
					.addIssue(
						IssueCategory.Manifest,
						IssueSeverity.Low,
						message,
						IssueCategoryType,
						IssueCategoryType?.AnnotationColumns?.InvalidKey
					);
			}
		}
	}
	return internalColumns;
};

export function getP13nMode(
	visualizationPath: string,
	converterContext: ConverterContext,
	tableManifestConfiguration: TableControlConfiguration
): string | undefined {
	const manifestWrapper: ManifestWrapper = converterContext.getManifestWrapper();
	const tableManifestSettings: TableManifestConfiguration = converterContext.getManifestControlConfiguration(visualizationPath);
	const variantManagement: VariantManagementType = manifestWrapper.getVariantManagement();
	const aPersonalization: string[] = [];
	const isAnalyticalTable = tableManifestConfiguration.type === "AnalyticalTable";
	const isResponsiveTable = tableManifestConfiguration.type === "ResponsiveTable";
	if (tableManifestSettings?.tableSettings?.personalization !== undefined) {
		// Personalization configured in manifest.
		const personalization: any = tableManifestSettings.tableSettings.personalization;
		if (personalization === true) {
			// Table personalization fully enabled.
			switch (tableManifestConfiguration.type) {
				case "AnalyticalTable":
					return "Sort,Column,Filter,Group,Aggregate";
				case "ResponsiveTable":
					return "Sort,Column,Filter,Group";
				default:
					return "Sort,Column,Filter";
			}
		} else if (typeof personalization === "object") {
			// Specific personalization options enabled in manifest. Use them as is.
			if (personalization.sort) {
				aPersonalization.push("Sort");
			}
			if (personalization.column) {
				aPersonalization.push("Column");
			}
			if (personalization.filter) {
				aPersonalization.push("Filter");
			}
			if (personalization.group && (isAnalyticalTable || isResponsiveTable)) {
				aPersonalization.push("Group");
			}
			if (personalization.aggregate && isAnalyticalTable) {
				aPersonalization.push("Aggregate");
			}
			return aPersonalization.length > 0 ? aPersonalization.join(",") : undefined;
		}
	} else {
		// No personalization configured in manifest.
		aPersonalization.push("Sort");
		aPersonalization.push("Column");
		if (converterContext.getTemplateType() === TemplateType.ListReport) {
			if (variantManagement === VariantManagementType.Control || _isFilterBarHidden(manifestWrapper, converterContext)) {
				// Feature parity with V2.
				// Enable table filtering by default only in case of Control level variant management.
				// Or when the LR filter bar is hidden via manifest setting
				aPersonalization.push("Filter");
			}
		} else {
			aPersonalization.push("Filter");
		}

		if (isAnalyticalTable) {
			aPersonalization.push("Group");
			aPersonalization.push("Aggregate");
		}
		if (isResponsiveTable) {
			aPersonalization.push("Group");
		}
		return aPersonalization.join(",");
	}
	return undefined;
}

/**
 * Returns a Boolean value suggesting if a filter bar is being used on the page.
 *
 * Chart has a dependency to filter bar (issue with loading data). Once resolved, the check for chart should be removed here.
 * Until then, hiding filter bar is now allowed if a chart is being used on LR.
 *
 * @param manifestWrapper Manifest settings getter for the page
 * @param converterContext The instance of the converter context
 * @returns Boolean suggesting if a filter bar is being used on the page.
 */
function _isFilterBarHidden(manifestWrapper: ManifestWrapper, converterContext: ConverterContext): boolean {
	return (
		manifestWrapper.isFilterBarHidden() &&
		!converterContext.getManifestWrapper().hasMultipleVisualizations() &&
		converterContext.getTemplateType() !== TemplateType.AnalyticalListPage
	);
}

/**
 * Returns a JSON string containing the sort conditions for the presentation variant.
 *
 * @param converterContext The instance of the converter context
 * @param presentationVariantAnnotation Presentation variant annotation
 * @param columns Table columns processed by the converter
 * @returns Sort conditions for a presentation variant.
 */
function getSortConditions(
	converterContext: ConverterContext,
	presentationVariantAnnotation: PresentationVariantType | undefined,
	columns: TableColumn[]
): string | undefined {
	// Currently navigation property is not supported as sorter
	const nonSortableProperties = getNonSortablePropertiesRestrictions(converterContext.getEntitySet());
	let sortConditions: string | undefined;
	if (presentationVariantAnnotation?.SortOrder) {
		const sorters: SorterType[] = [];
		const conditions = {
			sorters: sorters
		};
		presentationVariantAnnotation.SortOrder.forEach((condition) => {
			const conditionProperty = condition.Property;
			if (conditionProperty && nonSortableProperties.indexOf(conditionProperty.$target?.name) === -1) {
				const infoName = convertPropertyPathsToInfoNames([conditionProperty], columns)[0];
				if (infoName) {
					conditions.sorters.push({
						name: infoName,
						descending: !!condition.Descending
					});
				}
			}
		});
		sortConditions = conditions.sorters.length ? JSON.stringify(conditions) : undefined;
	}
	return sortConditions;
}

/**
 * Converts an array of propertyPath to an array of propertyInfo names.
 *
 * @param paths the array to be converted
 * @param columns the array of propertyInfos
 * @returns an array of propertyInfo names
 */

function convertPropertyPathsToInfoNames(paths: PropertyPath[], columns: TableColumn[]): string[] {
	const infoNames: string[] = [];
	let propertyInfo: TableColumn | undefined, annotationColumn: AnnotationTableColumn;
	paths.forEach((currentPath) => {
		if (currentPath?.value) {
			propertyInfo = columns.find((column) => {
				annotationColumn = column as AnnotationTableColumn;
				return !annotationColumn.propertyInfos && annotationColumn.relativePath === currentPath?.value;
			});
			if (propertyInfo) {
				infoNames.push(propertyInfo.name);
			}
		}
	});

	return infoNames;
}

/**
 * Returns a JSON string containing Presentation Variant group conditions.
 *
 * @param presentationVariantAnnotation Presentation variant annotation
 * @param columns Converter processed table columns
 * @param tableType The table type.
 * @returns Group conditions for a Presentation variant.
 */
function getGroupConditions(
	presentationVariantAnnotation: PresentationVariantType | undefined,
	columns: TableColumn[],
	tableType: string
): string | undefined {
	let groupConditions: string | undefined;
	if (presentationVariantAnnotation?.GroupBy) {
		let aGroupBy = presentationVariantAnnotation.GroupBy;
		if (tableType === "ResponsiveTable") {
			aGroupBy = aGroupBy.slice(0, 1);
		}
		const aGroupLevels = convertPropertyPathsToInfoNames(aGroupBy, columns).map((infoName) => {
			return { name: infoName };
		});

		groupConditions = aGroupLevels.length ? JSON.stringify({ groupLevels: aGroupLevels }) : undefined;
	}
	return groupConditions;
}

/**
 * Returns a JSON string containing Presentation Variant aggregate conditions.
 *
 * @param presentationVariantAnnotation Presentation variant annotation
 * @param columns Converter processed table columns
 * @returns Group conditions for a Presentation variant.
 */
function getAggregateConditions(
	presentationVariantAnnotation: PresentationVariantType | undefined,
	columns: TableColumn[]
): string | undefined {
	let aggregateConditions: string | undefined;
	if (presentationVariantAnnotation?.Total) {
		const aTotals = presentationVariantAnnotation.Total;
		const aggregates: Record<string, object> = {};
		convertPropertyPathsToInfoNames(aTotals, columns).forEach((infoName) => {
			aggregates[infoName] = {};
		});

		aggregateConditions = JSON.stringify(aggregates);
	}

	return aggregateConditions;
}

export function getTableAnnotationConfiguration(
	lineItemAnnotation: LineItem | undefined,
	visualizationPath: string,
	converterContext: ConverterContext,
	tableManifestConfiguration: TableControlConfiguration,
	columns: TableColumn[],
	presentationVariantAnnotation?: PresentationVariantType,
	viewConfiguration?: ViewPathConfiguration
): TableAnnotationConfiguration {
	// Need to get the target
	const { navigationPropertyPath } = splitPath(visualizationPath);
	const title: any = converterContext.getDataModelObjectPath().targetEntityType.annotations?.UI?.HeaderInfo?.TypeNamePlural;
	const entitySet = converterContext.getDataModelObjectPath().targetEntitySet;
	const pageManifestSettings: ManifestWrapper = converterContext.getManifestWrapper();
	const hasAbsolutePath = navigationPropertyPath.length === 0,
		p13nMode: string | undefined = getP13nMode(visualizationPath, converterContext, tableManifestConfiguration),
		id = navigationPropertyPath ? getTableID(visualizationPath) : getTableID(converterContext.getContextPath(), "LineItem");
	const targetCapabilities = getCapabilityRestriction(converterContext);
	const navigationTargetPath = getNavigationTargetPath(converterContext, navigationPropertyPath);
	const navigationSettings = pageManifestSettings.getNavigationConfiguration(navigationTargetPath);
	const creationBehaviour = _getCreationBehaviour(
		lineItemAnnotation,
		tableManifestConfiguration,
		converterContext,
		navigationSettings,
		visualizationPath
	);
	const standardActionsContext = generateStandardActionsContext(
		converterContext,
		creationBehaviour.mode as CreationMode,
		tableManifestConfiguration,
		viewConfiguration
	);

	const deleteButtonVisibilityExpression = getDeleteVisibility(converterContext, standardActionsContext);
	const createButtonVisibilityExpression = getCreateVisibility(converterContext, standardActionsContext);
	const massEditButtonVisibilityExpression = getMassEditVisibility(converterContext, standardActionsContext);
	const isInsertUpdateTemplated = getInsertUpdateActionsTemplating(
		standardActionsContext,
		isDraftOrStickySupported(converterContext),
		compileExpression(createButtonVisibilityExpression) === "false"
	);

	const selectionMode = getSelectionMode(
		lineItemAnnotation,
		visualizationPath,
		converterContext,
		hasAbsolutePath,
		targetCapabilities,
		deleteButtonVisibilityExpression,
		massEditButtonVisibilityExpression
	);
	let threshold = navigationPropertyPath ? 10 : 30;
	if (presentationVariantAnnotation?.MaxItems) {
		threshold = presentationVariantAnnotation.MaxItems.valueOf() as number;
	}

	const variantManagement: VariantManagementType = pageManifestSettings.getVariantManagement();
	const isSearchable = isPathSearchable(converterContext.getDataModelObjectPath());
	const standardActions = {
		create: getStandardActionCreate(converterContext, standardActionsContext),
		"delete": getStandardActionDelete(converterContext, standardActionsContext),
		paste: getStandardActionPaste(converterContext, standardActionsContext, isInsertUpdateTemplated),
		massEdit: getStandardActionMassEdit(converterContext, standardActionsContext),
		creationRow: getCreationRow(converterContext, standardActionsContext)
	};

	return {
		id: id,
		entityName: entitySet ? entitySet.name : "",
		collection: getTargetObjectPath(converterContext.getDataModelObjectPath()),
		navigationPath: navigationPropertyPath,
		row: _getRowConfigurationProperty(
			lineItemAnnotation,
			visualizationPath,
			converterContext,
			navigationSettings,
			navigationTargetPath
		),
		p13nMode: p13nMode,
		standardActions: {
			actions: standardActions,
			isInsertUpdateTemplated: isInsertUpdateTemplated,
			updatablePropertyPath: getCurrentEntitySetUpdatablePath(converterContext)
		},
		displayMode: isInDisplayMode(converterContext, viewConfiguration),
		create: creationBehaviour,
		selectionMode: selectionMode,
		autoBindOnInit:
			_isFilterBarHidden(pageManifestSettings, converterContext) ||
			(converterContext.getTemplateType() !== TemplateType.ListReport &&
				converterContext.getTemplateType() !== TemplateType.AnalyticalListPage &&
				!(viewConfiguration && pageManifestSettings.hasMultipleVisualizations(viewConfiguration))),
		variantManagement: variantManagement === "Control" && !p13nMode ? VariantManagementType.None : variantManagement,
		threshold: threshold,
		sortConditions: getSortConditions(converterContext, presentationVariantAnnotation, columns),
		title: title,
		searchable: tableManifestConfiguration.type !== "AnalyticalTable" && !(isConstant(isSearchable) && isSearchable.value === false)
	};
}

function _getExportDataType(dataType: string, isComplexProperty: boolean = false): string {
	let exportDataType: string = "String";
	if (isComplexProperty) {
		if (dataType === "Edm.DateTimeOffset") {
			exportDataType = "DateTime";
		}
		return exportDataType;
	} else {
		switch (dataType) {
			case "Edm.Decimal":
			case "Edm.Int32":
			case "Edm.Int64":
			case "Edm.Double":
			case "Edm.Byte":
				exportDataType = "Number";
				break;
			case "Edm.DateOfTime":
			case "Edm.Date":
				exportDataType = "Date";
				break;
			case "Edm.DateTimeOffset":
				exportDataType = "DateTime";
				break;
			case "Edm.TimeOfDay":
				exportDataType = "Time";
				break;
			case "Edm.Boolean":
				exportDataType = "Boolean";
				break;
			default:
				exportDataType = "String";
		}
	}
	return exportDataType;
}

/**
 * Split the visualization path into the navigation property path and annotation.
 *
 * @param visualizationPath
 * @returns The split path
 */
export function splitPath(visualizationPath: string) {
	let [navigationPropertyPath, annotationPath] = visualizationPath.split("@");

	if (navigationPropertyPath.lastIndexOf("/") === navigationPropertyPath.length - 1) {
		// Drop trailing slash
		navigationPropertyPath = navigationPropertyPath.substr(0, navigationPropertyPath.length - 1);
	}
	return { navigationPropertyPath, annotationPath };
}

export function getSelectionVariantConfiguration(
	selectionVariantPath: string,
	converterContext: ConverterContext
): SelectionVariantConfiguration | undefined {
	const resolvedTarget = converterContext.getEntityTypeAnnotation(selectionVariantPath);
	const selection: SelectionVariantType = resolvedTarget.annotation as SelectionVariantType;

	if (selection) {
		const propertyNames: string[] = [];
		selection.SelectOptions?.forEach((selectOption: SelectOptionType) => {
			const propertyName: any = selectOption.PropertyName;
			const propertyPath: string = propertyName.value;
			if (propertyNames.indexOf(propertyPath) === -1) {
				propertyNames.push(propertyPath);
			}
		});
		return {
			text: selection?.Text?.toString(),
			propertyNames: propertyNames
		};
	}
	return undefined;
}

function _getFullScreenBasedOnDevice(
	tableSettings: TableManifestSettingsConfiguration,
	converterContext: ConverterContext,
	isIphone: boolean
): boolean {
	// If enableFullScreen is not set, use as default true on phone and false otherwise
	let enableFullScreen = tableSettings.enableFullScreen ?? isIphone;
	// Make sure that enableFullScreen is not set on ListReport for desktop or tablet
	if (!isIphone && enableFullScreen && converterContext.getTemplateType() === TemplateType.ListReport) {
		enableFullScreen = false;
		converterContext.getDiagnostics().addIssue(IssueCategory.Manifest, IssueSeverity.Low, IssueType.FULLSCREENMODE_NOT_ON_LISTREPORT);
	}
	return enableFullScreen;
}

function _getMultiSelectMode(
	tableSettings: TableManifestSettingsConfiguration,
	tableType: TableType,
	converterContext: ConverterContext
): string | undefined {
	let multiSelectMode: string | undefined;
	if (tableType !== "ResponsiveTable") {
		return undefined;
	}
	switch (converterContext.getTemplateType()) {
		case TemplateType.ListReport:
		case TemplateType.AnalyticalListPage:
			multiSelectMode = !tableSettings.selectAll ? "ClearAll" : "Default";
			break;
		case TemplateType.ObjectPage:
			multiSelectMode = tableSettings.selectAll === false ? "ClearAll" : "Default";
			if (converterContext.getManifestWrapper().useIconTabBar()) {
				multiSelectMode = !tableSettings.selectAll ? "ClearAll" : "Default";
			}
			break;
		default:
	}

	return multiSelectMode;
}

function _getTableType(
	tableSettings: TableManifestSettingsConfiguration,
	aggregationHelper: AggregationHelper,
	converterContext: ConverterContext
): TableType {
	let tableType = tableSettings?.type || "ResponsiveTable";
	/*  Now, we keep the configuration in the manifest, even if it leads to errors.
		We only change if we're not on desktop from Analytical to Responsive.
	 */
	if (tableType === "AnalyticalTable" && !converterContext.getManifestWrapper().isDesktop()) {
		tableType = "ResponsiveTable";
	}
	return tableType;
}

function _getGridTableMode(tableType: TableType, tableSettings: TableManifestSettingsConfiguration, isTemplateListReport: boolean): any {
	if (tableType === "GridTable") {
		if (isTemplateListReport) {
			return {
				rowCountMode: "Auto",
				rowCount: "3"
			};
		} else {
			return {
				rowCountMode: tableSettings.rowCountMode ? tableSettings.rowCountMode : "Fixed",
				rowCount: tableSettings.rowCount ? tableSettings.rowCount : 5
			};
		}
	} else {
		return {};
	}
}

function _getCondensedTableLayout(_tableType: TableType, _tableSettings: TableManifestSettingsConfiguration): boolean {
	return _tableSettings.condensedTableLayout !== undefined && _tableType !== "ResponsiveTable"
		? _tableSettings.condensedTableLayout
		: false;
}

function _getTableSelectionLimit(_tableSettings: TableManifestSettingsConfiguration): number {
	return _tableSettings.selectAll === true || _tableSettings.selectionLimit === 0 ? 0 : _tableSettings.selectionLimit || 200;
}

function _getTableInlineCreationRowCount(_tableSettings: TableManifestSettingsConfiguration): number {
	return _tableSettings.creationMode?.inlineCreationRowCount ? _tableSettings.creationMode?.inlineCreationRowCount : 2;
}

function _getFilters(
	tableSettings: TableManifestSettingsConfiguration,
	quickFilterPaths: { annotationPath: string }[],
	quickSelectionVariant: any,
	path: { annotationPath: string },
	converterContext: ConverterContext
): any {
	if (quickSelectionVariant) {
		quickFilterPaths.push({ annotationPath: path.annotationPath });
	}
	return {
		quickFilters: {
			enabled: converterContext.getTemplateType() !== TemplateType.ListReport,
			showCounts: tableSettings?.quickVariantSelection?.showCounts,
			paths: quickFilterPaths
		}
	};
}

function _getEnableExport(
	tableSettings: TableManifestSettingsConfiguration,
	converterContext: ConverterContext,
	enablePaste: boolean
): boolean {
	return tableSettings.enableExport !== undefined
		? tableSettings.enableExport
		: converterContext.getTemplateType() !== "ObjectPage" || enablePaste;
}

function _getFilterConfiguration(
	tableSettings: TableManifestSettingsConfiguration,
	lineItemAnnotation: LineItem | undefined,
	converterContext: ConverterContext
): any {
	if (!lineItemAnnotation) {
		return {};
	}
	const quickFilterPaths: { annotationPath: string }[] = [];
	const targetEntityType = converterContext.getAnnotationEntityType(lineItemAnnotation);
	let quickSelectionVariant: any;
	let filters;
	tableSettings?.quickVariantSelection?.paths?.forEach((path: { annotationPath: string }) => {
		quickSelectionVariant = targetEntityType.resolvePath(path.annotationPath);
		filters = _getFilters(tableSettings, quickFilterPaths, quickSelectionVariant, path, converterContext);
	});

	let hideTableTitle = false;
	hideTableTitle = !!tableSettings.quickVariantSelection?.hideTableTitle;
	return {
		filters: filters,
		headerVisible: !(quickSelectionVariant && hideTableTitle)
	};
}

function _getCollectedNavigationPropertyLabels(relativePath: string, converterContext: ConverterContext) {
	const navigationProperties = enhanceDataModelPath(converterContext.getDataModelObjectPath(), relativePath).navigationProperties;
	if (navigationProperties?.length > 0) {
		const collectedNavigationPropertyLabels: string[] = [];
		navigationProperties.forEach((navProperty: any) => {
			collectedNavigationPropertyLabels.push(getLabel(navProperty) || navProperty.name);
		});
		return collectedNavigationPropertyLabels;
	}
}

export function getTableManifestConfiguration(
	lineItemAnnotation: LineItem | undefined,
	visualizationPath: string,
	converterContext: ConverterContext,
	checkCondensedLayout = false
): TableControlConfiguration {
	const _manifestWrapper = converterContext.getManifestWrapper();
	const tableManifestSettings: TableManifestConfiguration = converterContext.getManifestControlConfiguration(visualizationPath);
	const tableSettings = (tableManifestSettings && tableManifestSettings.tableSettings) || {};
	const creationMode = tableSettings.creationMode?.name || CreationMode.NewPage;
	const enableAutoColumnWidth = !_manifestWrapper.isPhone();
	const enablePaste =
		tableSettings.enablePaste !== undefined ? tableSettings.enablePaste : converterContext.getTemplateType() === "ObjectPage"; // Paste is disabled by default excepted for OP
	const templateType = converterContext.getTemplateType();
	const dataStateIndicatorFilter = templateType === TemplateType.ListReport ? "API.dataStateIndicatorFilter" : undefined;
	const isCondensedTableLayoutCompliant = checkCondensedLayout && _manifestWrapper.isCondensedLayoutCompliant();
	const oFilterConfiguration = _getFilterConfiguration(tableSettings, lineItemAnnotation, converterContext);
	const customValidationFunction = tableSettings.creationMode?.customValidationFunction;
	const entityType = converterContext.getEntityType();
	const aggregationHelper = new AggregationHelper(entityType, converterContext);
	const tableType: TableType = _getTableType(tableSettings, aggregationHelper, converterContext);
	const gridTableRowMode = _getGridTableMode(tableType, tableSettings, templateType === TemplateType.ListReport);
	const condensedTableLayout = _getCondensedTableLayout(tableType, tableSettings);
	const oConfiguration = {
		// If no createAtEnd is specified it will be false for Inline create and true otherwise
		createAtEnd:
			tableSettings.creationMode?.createAtEnd !== undefined
				? tableSettings.creationMode?.createAtEnd
				: creationMode !== CreationMode.Inline,
		creationMode: creationMode,
		customValidationFunction: customValidationFunction,
		dataStateIndicatorFilter: dataStateIndicatorFilter,
		// if a custom validation function is provided, disableAddRowButtonForEmptyData should not be considered, i.e. set to false
		disableAddRowButtonForEmptyData: !customValidationFunction ? !!tableSettings.creationMode?.disableAddRowButtonForEmptyData : false,
		enableAutoColumnWidth: enableAutoColumnWidth,
		enableExport: _getEnableExport(tableSettings, converterContext, enablePaste),
		enableFullScreen: _getFullScreenBasedOnDevice(tableSettings, converterContext, _manifestWrapper.isPhone()),
		enableMassEdit: tableSettings?.enableMassEdit,
		enablePaste: enablePaste,
		headerVisible: true,
		multiSelectMode: _getMultiSelectMode(tableSettings, tableType, converterContext),
		selectionLimit: _getTableSelectionLimit(tableSettings),
		inlineCreationRowCount: _getTableInlineCreationRowCount(tableSettings),
		showRowCount: !tableSettings?.quickVariantSelection?.showCounts && !_manifestWrapper.getViewConfiguration()?.showCounts,
		type: tableType,
		useCondensedTableLayout: condensedTableLayout && isCondensedTableLayoutCompliant,
		isCompactType: _manifestWrapper.isCompactType()
	};
	return { ...oConfiguration, ...gridTableRowMode, ...oFilterConfiguration };
}

export type configTypeConstraints = {
	scale?: number;
	precision?: number;
	maxLength?: number;
	nullable?: boolean;
	minimum?: string;
	maximum?: string;
	isDigitSequence?: boolean;
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

export function getTypeConfig(oProperty: Property | DataFieldAbstractTypes, dataType: string | undefined): any {
	let oTargetMapping = EDM_TYPE_MAPPING[(oProperty as Property)?.type] || (dataType ? EDM_TYPE_MAPPING[dataType] : undefined);
	if (!oTargetMapping && (oProperty as Property)?.targetType && (oProperty as Property).targetType?._type === "TypeDefinition") {
		oTargetMapping = EDM_TYPE_MAPPING[((oProperty as Property).targetType as TypeDefinition).underlyingType];
	}
	const propertyTypeConfig: configType = {
		type: oTargetMapping?.type,
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
					: undefined
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
}

export default {
	getTableActions,
	getTableColumns,
	getColumnsFromEntityType,
	updateLinkedProperties,
	createTableVisualization,
	createDefaultTableVisualization,
	getCapabilityRestriction,
	getSelectionMode,
	getRowStatusVisibility,
	getImportance,
	getP13nMode,
	getTableAnnotationConfiguration,
	isFilteringCaseSensitive,
	splitPath,
	getSelectionVariantConfiguration,
	getTableManifestConfiguration,
	getTypeConfig
};
