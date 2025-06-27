import type { EntityType } from "@sap-ux/vocabularies-types";
import type {
	LineItem,
	PresentationVariant,
	SelectionPresentationVariant,
	SelectionVariant
} from "@sap-ux/vocabularies-types/vocabularies/UI";
import { UIAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/UI";
import type { BaseAction } from "sap/fe/core/converters/controls/Common/Action";
import { getActionsFromManifest } from "sap/fe/core/converters/controls/Common/Action";
import type { ChartVisualization } from "sap/fe/core/converters/controls/Common/Chart";
import type { TableVisualization } from "sap/fe/core/converters/controls/Common/Table";
import type { CustomElementFilterField, FilterField } from "sap/fe/core/converters/controls/ListReport/FilterBar";
import {
	getFilterBarhideBasicSearch,
	getManifestFilterFields,
	getSelectionFields
} from "sap/fe/core/converters/controls/ListReport/FilterBar";
import type ConverterContext from "sap/fe/core/converters/ConverterContext";
import type { ConfigurableObject } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { insertCustomElements } from "sap/fe/core/converters/helpers/ConfigurableObject";
import { compileExpression, getExpressionFromAnnotation } from "sap/fe/core/helpers/BindingToolkit";
import type { DataVisualizationAnnotations, DataVisualizationDefinition } from "../controls/Common/DataVisualization";
import {
	getDataVisualizationConfiguration,
	getDefaultChart,
	getDefaultLineItem,
	getDefaultPresentationVariant,
	getSelectionPresentationVariant,
	getSelectionVariant,
	isPresentationCompliant,
	isSelectionPresentationCompliant
} from "../controls/Common/DataVisualization";
import type { KPIDefinition } from "../controls/Common/KPI";
import { getKPIDefinitions } from "../controls/Common/KPI";
import {
	getChartID,
	getCustomTabID,
	getDynamicListReportID,
	getFilterBarID,
	getFilterVariantManagementID,
	getIconTabBarID,
	getTableID
} from "../helpers/ID";
import type {
	CombinedViewPathConfiguration,
	CustomViewTemplateConfiguration,
	MultipleViewsConfiguration,
	SingleViewPathConfiguration,
	ViewPathConfiguration
} from "../ManifestSettings";
import { TemplateType, VariantManagementType, VisualizationType } from "../ManifestSettings";

type ViewAnnotations = SelectionPresentationVariant | SelectionVariant;
type VariantManagementDefinition = {
	id: string;
	targetControlIds: string;
};

type MultipleViewConfiguration = ViewPathConfiguration & {
	annotation?: DataVisualizationAnnotations;
};

type SingleViewConfiguration = {
	annotation?: DataVisualizationAnnotations;
};

type CustomViewConfiguration = CustomViewTemplateConfiguration & {
	type: string;
};

type ViewConfiguration = MultipleViewConfiguration | SingleViewConfiguration | CustomViewConfiguration;
type ViewAnnotationConfiguration = MultipleViewConfiguration | SingleViewConfiguration;

type ViewConverterSettings = ViewConfiguration & {
	converterContext?: ConverterContext;
};

type DefaultSemanticDate = ConfigurableObject & {
	operator: string;
};

type MultiViewsControlConfiguration = {
	id: string;
	showTabCounts?: boolean;
};

export type ListReportDefinition = {
	mainEntitySet: string;
	mainEntityType: string; // entityType> at the start of LR templating
	singleTableId?: string; // only with single Table mode
	singleChartId?: string; // only with single Table mode
	dynamicListReportId: string;
	stickySubheaderProvider?: string;
	multiViewsControl?: MultiViewsControlConfiguration; // only with multi Table mode
	headerActions: BaseAction[];
	showPinnableToggle?: boolean;
	filterBar: {
		propertyInfo: any;
		selectionFields: FilterField[];
		hideBasicSearch: boolean;
	};
	views: ListReportViewDefinition[];
	filterConditions: {
		selectionVariant: SelectionVariant | undefined;
		defaultSemanticDates: Record<string, DefaultSemanticDate> | {};
	};
	filterBarId: string;
	variantManagement: VariantManagementDefinition;
	hasMultiVisualizations: boolean;
	templateType: TemplateType;
	useSemanticDateRange?: boolean;
	filterInitialLayout?: string;
	filterLayout?: string;
	kpiDefinitions: KPIDefinition[];
	hideFilterBar: boolean;
};

export type ListReportViewDefinition = SingleViewDefinition | CustomViewDefinition | CombinedViewDefinition;

export type CombinedViewDefinition = {
	selectionVariantPath?: string; // only with on multi Table mode
	title?: string; // only with multi Table mode
	primaryVisualization: DataVisualizationDefinition;
	secondaryVisualization: DataVisualizationDefinition;
	tableControlId: string;
	chartControlId: string;
	defaultPath?: string;
	visible?: string;
};

export type CustomViewDefinition = {
	title?: string; // only with multi Table mode
	fragment: string;
	type: string;
	customTabId: string;
	visible?: string;
};
export type SingleViewDefinition = SingleTableViewDefinition | SingleChartViewDefinition;

export type BaseSingleViewDefinition = {
	selectionVariantPath?: string; // only with on multi Table mode
	title?: string; // only with multi Table mode
	presentation: DataVisualizationDefinition;
};

export type SingleTableViewDefinition = BaseSingleViewDefinition & {
	tableControlId?: string;
	visible?: string;
};

export type SingleChartViewDefinition = BaseSingleViewDefinition & {
	chartControlId?: string;
	visible?: string;
};

type ContentAreaID = {
	chartId: string;
	tableId: string;
};

/**
 * Retrieves all list report tables.
 *
 * @param views The list report views configured in the manifest
 * @returns The list report table
 */
function getTableVisualizations(views: ListReportViewDefinition[]): TableVisualization[] {
	const tables: TableVisualization[] = [];
	views.forEach(function (view) {
		if (!(view as CustomViewDefinition).type) {
			const visualizations = (view as CombinedViewDefinition).secondaryVisualization
				? (view as CombinedViewDefinition).secondaryVisualization.visualizations
				: (view as SingleViewDefinition).presentation.visualizations;

			visualizations.forEach(function (visualization) {
				if (visualization.type === VisualizationType.Table) {
					tables.push(visualization);
				}
			});
		}
	});
	return tables;
}

function getChartVisualizations(views: ListReportViewDefinition[]): ChartVisualization[] {
	const charts: ChartVisualization[] = [];
	views.forEach(function (view) {
		if (!(view as CustomViewDefinition).type) {
			const visualizations = (view as CombinedViewDefinition).primaryVisualization
				? (view as CombinedViewDefinition).primaryVisualization.visualizations
				: (view as SingleViewDefinition).presentation.visualizations;

			visualizations.forEach(function (visualization) {
				if (visualization.type === VisualizationType.Chart) {
					charts.push(visualization);
				}
			});
		}
	});
	return charts;
}

const getDefaultSemanticDates = function (filterFields: Record<string, CustomElementFilterField>): Record<string, DefaultSemanticDate> {
	const defaultSemanticDates: any = {};
	for (const filterField in filterFields) {
		if (filterFields[filterField]?.settings?.defaultValues?.length) {
			defaultSemanticDates[filterField] = filterFields[filterField]?.settings?.defaultValues;
		}
	}
	return defaultSemanticDates;
};

/**
 * Find a visualization annotation that can be used for rendering the list report.
 *
 * @param entityType The current EntityType
 * @param converterContext
 * @param bIsALP
 * @returns A compliant annotation for rendering the list report
 */
function getCompliantVisualizationAnnotation(
	entityType: EntityType,
	converterContext: ConverterContext,
	bIsALP: boolean
): LineItem | PresentationVariant | SelectionPresentationVariant | undefined {
	const annotationPath = converterContext.getManifestWrapper().getDefaultTemplateAnnotationPath();
	const selectionPresentationVariant = getSelectionPresentationVariant(entityType, annotationPath, converterContext);
	if (annotationPath && selectionPresentationVariant) {
		const presentationVariant = selectionPresentationVariant.PresentationVariant;
		if (!presentationVariant) {
			throw new Error("Presentation Variant is not configured in the SPV mentioned in the manifest");
		}
		const bPVComplaint = isPresentationCompliant(selectionPresentationVariant.PresentationVariant);
		if (!bPVComplaint) {
			return undefined;
		}
		if (isSelectionPresentationCompliant(selectionPresentationVariant, bIsALP)) {
			return selectionPresentationVariant;
		}
	}
	if (selectionPresentationVariant) {
		if (isSelectionPresentationCompliant(selectionPresentationVariant, bIsALP)) {
			return selectionPresentationVariant;
		}
	}
	const presentationVariant = getDefaultPresentationVariant(entityType);
	if (presentationVariant) {
		if (isPresentationCompliant(presentationVariant, bIsALP)) {
			return presentationVariant;
		}
	}
	if (!bIsALP) {
		const defaultLineItem = getDefaultLineItem(entityType);
		if (defaultLineItem) {
			return defaultLineItem;
		}
	}
	return undefined;
}

const getView = function (viewConverterConfiguration: ViewConverterSettings): ListReportViewDefinition {
	let config = viewConverterConfiguration;
	if (config.converterContext) {
		let converterContext = config.converterContext;
		config = config as ViewAnnotationConfiguration;
		let presentation: DataVisualizationDefinition = getDataVisualizationConfiguration(
			config.annotation
				? converterContext.getRelativeAnnotationPath(config.annotation.fullyQualifiedName, converterContext.getEntityType())
				: "",
			true,
			converterContext,
			config as ViewPathConfiguration
		);
		let tableControlId = "";
		let chartControlId = "";
		let title: string | undefined = "";
		let selectionVariantPath = "";
		const isMultipleViewConfiguration = function (currentConfig: ViewConfiguration): currentConfig is MultipleViewConfiguration {
			return (currentConfig as MultipleViewConfiguration).key !== undefined;
		};
		const createVisualization = function (currentPresentation: DataVisualizationDefinition, isPrimary?: boolean) {
			let defaultVisualization;
			for (const visualization of currentPresentation.visualizations) {
				if (isPrimary && visualization.type === VisualizationType.Chart) {
					defaultVisualization = visualization;
					break;
				}
				if (!isPrimary && visualization.type === VisualizationType.Table) {
					defaultVisualization = visualization;
					break;
				}
			}
			const presentationCreated = Object.assign({}, currentPresentation);
			if (defaultVisualization) {
				presentationCreated.visualizations = [defaultVisualization];
			}
			return presentationCreated;
		};
		const getPresentation = function (item: SingleViewPathConfiguration) {
			const resolvedTarget = converterContext.getEntityTypeAnnotation(item.annotationPath);
			const targetAnnotation = resolvedTarget.annotation as DataVisualizationAnnotations;
			converterContext = resolvedTarget.converterContext;
			const annotation = targetAnnotation;
			presentation = getDataVisualizationConfiguration(
				annotation
					? converterContext.getRelativeAnnotationPath(annotation.fullyQualifiedName, converterContext.getEntityType())
					: "",
				true,
				converterContext,
				config as ViewPathConfiguration
			);
			return presentation;
		};
		const createAlpView = function (
			presentations: DataVisualizationDefinition[],
			defaultPath: "both" | "primary" | "secondary" | undefined
		) {
			const primaryVisualization: DataVisualizationDefinition | undefined = createVisualization(presentations[0], true);
			chartControlId = (primaryVisualization?.visualizations[0] as ChartVisualization).id;
			const secondaryVisualization: DataVisualizationDefinition | undefined = createVisualization(
				presentations[1] ? presentations[1] : presentations[0]
			);
			tableControlId = (secondaryVisualization?.visualizations[0] as TableVisualization).annotation.id;
			if (primaryVisualization && secondaryVisualization) {
				config = config as ViewPathConfiguration;
				const visible = config.visible;
				const view: CombinedViewDefinition = {
					primaryVisualization,
					secondaryVisualization,
					tableControlId,
					chartControlId,
					defaultPath,
					visible
				};
				return view;
			}
		};
		if (presentation?.visualizations?.length === 2 && converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
			const view: CombinedViewDefinition | undefined = createAlpView([presentation], "both");
			if (view) {
				return view;
			}
		} else if (
			converterContext.getManifestWrapper().hasMultipleVisualizations(config as ViewPathConfiguration) ||
			converterContext.getTemplateType() === TemplateType.AnalyticalListPage
		) {
			const { primary, secondary } = config as CombinedViewPathConfiguration;
			if (primary && primary.length && secondary && secondary.length) {
				const view: CombinedViewDefinition | undefined = createAlpView(
					[getPresentation(primary[0]), getPresentation(secondary[0])],
					(config as CombinedViewPathConfiguration).defaultPath
				);
				if (view) {
					return view;
				}
			} else {
				throw new Error("SecondaryItems in the Views is not present");
			}
		} else if (isMultipleViewConfiguration(config)) {
			// key exists only on multi tables mode
			const resolvedTarget = converterContext.getEntityTypeAnnotation((config as SingleViewPathConfiguration).annotationPath);
			const viewAnnotation: ViewAnnotations = resolvedTarget.annotation;
			converterContext = resolvedTarget.converterContext;
			title = compileExpression(getExpressionFromAnnotation(viewAnnotation.Text));
			// Need to loop on table into views since multi table mode get specific configuration (hidden filters or Table Id)
			presentation.visualizations.forEach((visualizationDefinition, index) => {
				switch (visualizationDefinition.type) {
					case VisualizationType.Table:
						const tableVisualization = presentation.visualizations[index] as TableVisualization;
						const filters = tableVisualization.control.filters || {};
						filters.hiddenFilters = filters.hiddenFilters || { paths: [] };
						if (!(config as SingleViewPathConfiguration).keepPreviousPersonalization) {
							// Need to override Table Id to match with Tab Key (currently only table is managed in multiple view mode)
							tableVisualization.annotation.id = getTableID((config as SingleViewPathConfiguration).key || "", "LineItem");
						}
						config = config as ViewAnnotationConfiguration;
						if (config && config.annotation && config.annotation.term === UIAnnotationTerms.SelectionPresentationVariant) {
							selectionVariantPath = `@${config.annotation.SelectionVariant.fullyQualifiedName.split("@")[1]}`;
						} else {
							selectionVariantPath = (config as SingleViewPathConfiguration).annotationPath;
						}
						//Provide Selection Variant to hiddenFilters in order to set the SV filters to the table.
						//MDC Table overrides binding Filter and from SAP FE the only method where we are able to add
						//additional filter is 'rebindTable' into Table delegate.
						//To avoid implementing specific LR feature to SAP FE Macro Table, the filter(s) related to the Tab (multi table mode)
						//can be passed to macro table via parameter/context named filters and key hiddenFilters.
						filters.hiddenFilters.paths.push({ annotationPath: selectionVariantPath });
						tableVisualization.control.filters = filters;
						break;
					case VisualizationType.Chart:
						const chartVisualization = presentation.visualizations[index] as ChartVisualization;
						chartVisualization.id = getChartID((config as SingleViewPathConfiguration).key || "", "Chart");
						chartVisualization.multiViews = true;
						break;
					default:
						break;
				}
			});
		}
		presentation.visualizations.forEach((visualizationDefinition) => {
			if (visualizationDefinition.type === VisualizationType.Table) {
				tableControlId = visualizationDefinition.annotation.id;
			} else if (visualizationDefinition.type === VisualizationType.Chart) {
				chartControlId = visualizationDefinition.id;
			}
		});
		config = config as ViewPathConfiguration;
		const visible = config.visible;
		return {
			presentation,
			tableControlId,
			chartControlId,
			title,
			selectionVariantPath,
			visible
		};
	} else {
		config = config as CustomViewConfiguration;
		const title = config.label,
			fragment = config.template,
			type = config.type,
			customTabId = getCustomTabID(config.key || ""),
			visible = config.visible;
		return {
			title,
			fragment,
			type,
			customTabId,
			visible
		};
	}
};

const getViews = function (
	converterContext: ConverterContext,
	settingsViews: MultipleViewsConfiguration | undefined
): ListReportViewDefinition[] {
	let viewConverterConfigs: ViewConverterSettings[] = [];
	if (settingsViews) {
		settingsViews.paths.forEach((path: ViewPathConfiguration | CustomViewTemplateConfiguration) => {
			if (converterContext.getManifestWrapper().hasMultipleVisualizations(path as ViewPathConfiguration)) {
				if (settingsViews.paths.length > 1) {
					throw new Error("ALP flavor cannot have multiple views");
				} else {
					path = path as CombinedViewPathConfiguration;
					viewConverterConfigs.push({
						converterContext: converterContext,
						primary: path.primary,
						secondary: path.secondary,
						defaultPath: path.defaultPath
					});
				}
			} else if ((path as CustomViewConfiguration).template) {
				path = path as CustomViewConfiguration;
				viewConverterConfigs.push({
					key: path.key,
					label: path.label,
					template: path.template,
					type: "Custom",
					visible: path.visible
				});
			} else {
				path = path as SingleViewPathConfiguration;
				const viewConverterContext = converterContext.getConverterContextFor(
						path.contextPath || (path.entitySet && `/${path.entitySet}`) || converterContext.getContextPath()
					),
					entityType = viewConverterContext.getEntityType();

				if (entityType && viewConverterContext) {
					let annotation;
					const resolvedTarget = viewConverterContext.getEntityTypeAnnotation(path.annotationPath);
					const targetAnnotation = resolvedTarget.annotation as DataVisualizationAnnotations;
					if (targetAnnotation) {
						annotation =
							targetAnnotation.term === UIAnnotationTerms.SelectionVariant
								? getCompliantVisualizationAnnotation(entityType, viewConverterContext, false)
								: targetAnnotation;
						viewConverterConfigs.push({
							converterContext: viewConverterContext,
							annotation,
							annotationPath: path.annotationPath,
							keepPreviousPersonalization: path.keepPreviousPersonalization,
							key: path.key,
							visible: path.visible
						});
					}
				} else {
					// TODO Diagnostics message
				}
			}
		});
	} else {
		const entityType = converterContext.getEntityType();
		if (converterContext.getTemplateType() === TemplateType.AnalyticalListPage) {
			viewConverterConfigs = getAlpViewConfig(converterContext, viewConverterConfigs);
		} else {
			viewConverterConfigs.push({
				annotation: getCompliantVisualizationAnnotation(entityType, converterContext, false),
				converterContext: converterContext
			});
		}
	}
	return viewConverterConfigs.map((viewConverterConfig) => {
		return getView(viewConverterConfig);
	});
};

const getMultiViewsControl = function (
	converterContext: ConverterContext,
	views: ListReportViewDefinition[]
): MultiViewsControlConfiguration | undefined {
	const manifestWrapper = converterContext.getManifestWrapper();
	const viewsDefinition: MultipleViewsConfiguration | undefined = manifestWrapper.getViewConfiguration();
	if (views.length > 1 && !hasMultiVisualizations(converterContext)) {
		return {
			showTabCounts: viewsDefinition ? viewsDefinition?.showCounts || manifestWrapper.hasMultipleEntitySets() : undefined, // with multi EntitySets, tab counts are displayed by default
			id: getIconTabBarID()
		};
	}
	return undefined;
};

function getAlpViewConfig(converterContext: ConverterContext, viewConfigs: ViewConverterSettings[]): ViewConverterSettings[] {
	const entityType = converterContext.getEntityType();
	const annotation = getCompliantVisualizationAnnotation(entityType, converterContext, true);
	let chart, table;
	if (annotation) {
		viewConfigs.push({
			annotation: annotation,
			converterContext
		});
	} else {
		chart = getDefaultChart(entityType);
		table = getDefaultLineItem(entityType);
		if (chart && table) {
			const primary: SingleViewPathConfiguration[] = [{ annotationPath: chart.term }];
			const secondary: SingleViewPathConfiguration[] = [{ annotationPath: table.term }];
			viewConfigs.push({
				converterContext: converterContext,
				primary: primary,
				secondary: secondary,
				defaultPath: "both"
			});
		}
	}
	return viewConfigs;
}

function hasMultiVisualizations(converterContext: ConverterContext): boolean {
	return (
		converterContext.getManifestWrapper().hasMultipleVisualizations() ||
		converterContext.getTemplateType() === TemplateType.AnalyticalListPage
	);
}

export const getHeaderActions = function (converterContext: ConverterContext): BaseAction[] {
	const manifestWrapper = converterContext.getManifestWrapper();
	return insertCustomElements([], getActionsFromManifest(manifestWrapper.getHeaderActions(), converterContext).actions);
};

export const checkChartFilterBarId = function (views: ListReportViewDefinition[], filterBarId: string) {
	views.forEach((view) => {
		if (!(view as CustomViewDefinition).type) {
			const presentation: DataVisualizationDefinition = (view as SingleViewDefinition).presentation;
			presentation.visualizations.forEach((visualizationDefinition) => {
				if (visualizationDefinition.type === VisualizationType.Chart && visualizationDefinition.filterId !== filterBarId) {
					visualizationDefinition.filterId = filterBarId;
				}
			});
		}
	});
};

/**
 * Creates the ListReportDefinition for multiple entity sets (multiple table mode).
 *
 * @param converterContext The converter context
 * @returns The list report definition based on annotation + manifest
 */
export const convertPage = function (converterContext: ConverterContext): ListReportDefinition {
	const entityType = converterContext.getEntityType();
	const sContextPath = converterContext.getContextPath();

	if (!sContextPath) {
		// If we don't have an entitySet at this point we have an issue I'd say
		throw new Error(
			"An EntitySet is required to be able to display a ListReport, please adjust your `entitySet` property to point to one."
		);
	}
	const manifestWrapper = converterContext.getManifestWrapper();
	const viewsDefinition: MultipleViewsConfiguration | undefined = manifestWrapper.getViewConfiguration();
	const hasMultipleEntitySets = manifestWrapper.hasMultipleEntitySets();
	const views: ListReportViewDefinition[] = getViews(converterContext, viewsDefinition);
	const lrTableVisualizations = getTableVisualizations(views);
	const lrChartVisualizations = getChartVisualizations(views);
	const showPinnableToggle = lrTableVisualizations.some((table) => table.control.type === "ResponsiveTable");
	let singleTableId = "";
	let singleChartId = "";
	const dynamicListReportId = getDynamicListReportID();
	const filterBarId = getFilterBarID(sContextPath);
	const filterVariantManagementID = getFilterVariantManagementID(filterBarId);
	const fbConfig = manifestWrapper.getFilterConfiguration();
	const filterInitialLayout = fbConfig?.initialLayout !== undefined ? fbConfig?.initialLayout.toLowerCase() : "compact";
	const filterLayout = fbConfig?.layout !== undefined ? fbConfig?.layout.toLowerCase() : "compact";
	const useSemanticDateRange = fbConfig.useSemanticDateRange !== undefined ? fbConfig.useSemanticDateRange : true;

	const oConfig = getContentAreaId(converterContext, views);
	if (oConfig) {
		singleChartId = oConfig.chartId;
		singleTableId = oConfig.tableId;
	}

	// Chart has a dependency to filter bar (issue with loading data). Once resolved, the check for chart should be removed here.
	// Until then, hiding filter bar is now allowed if a chart is being used on LR.
	const hideFilterBar = manifestWrapper.isFilterBarHidden() && singleChartId === "";
	const lrFilterProperties = getSelectionFields(converterContext, lrTableVisualizations);
	const selectionFields = lrFilterProperties.selectionFields;
	const propertyInfoFields = lrFilterProperties.sPropertyInfo;
	const hideBasicSearch = getFilterBarhideBasicSearch(lrTableVisualizations, lrChartVisualizations, converterContext);
	const multiViewControl = getMultiViewsControl(converterContext, views);

	const selectionVariant = multiViewControl ? undefined : getSelectionVariant(entityType, converterContext);
	const defaultSemanticDates = useSemanticDateRange ? getDefaultSemanticDates(getManifestFilterFields(entityType, converterContext)) : {};

	// Sort header actions according to position attributes in manifest
	const headerActions = getHeaderActions(converterContext);
	if (hasMultipleEntitySets) {
		checkChartFilterBarId(views, filterBarId);
	}

	const visualizationIds = lrTableVisualizations
		.map((visualization) => {
			return visualization.annotation.id;
		})
		.concat(
			lrChartVisualizations.map((visualization) => {
				return visualization.id;
			})
		);
	const targetControlIds = [
		...(hideFilterBar ? [] : [filterBarId]),
		...(manifestWrapper.getVariantManagement() !== VariantManagementType.Control ? visualizationIds : []),
		...(multiViewControl ? [multiViewControl.id] : [])
	];

	const stickySubheaderProvider =
		multiViewControl && manifestWrapper.getStickyMultiTabHeaderConfiguration() ? multiViewControl.id : undefined;

	return {
		mainEntitySet: sContextPath,
		mainEntityType: `${sContextPath}/`,
		multiViewsControl: multiViewControl,
		stickySubheaderProvider,
		singleTableId,
		singleChartId,
		dynamicListReportId,
		headerActions,
		showPinnableToggle: showPinnableToggle,
		filterBar: {
			propertyInfo: propertyInfoFields,
			selectionFields,
			hideBasicSearch
		},
		views: views,
		filterBarId: hideFilterBar ? "" : filterBarId,
		filterConditions: {
			selectionVariant: selectionVariant,
			defaultSemanticDates: defaultSemanticDates
		},
		variantManagement: {
			id: filterVariantManagementID,
			targetControlIds: targetControlIds.join(",")
		},
		hasMultiVisualizations: hasMultiVisualizations(converterContext),
		templateType: manifestWrapper.getTemplateType(),
		useSemanticDateRange,
		filterInitialLayout,
		filterLayout,
		kpiDefinitions: getKPIDefinitions(converterContext),
		hideFilterBar
	};
};

function getContentAreaId(converterContext: ConverterContext, views: ListReportViewDefinition[]): ContentAreaID | undefined {
	let singleTableId = "",
		singleChartId = "";
	if (
		converterContext.getManifestWrapper().hasMultipleVisualizations() ||
		converterContext.getTemplateType() === TemplateType.AnalyticalListPage
	) {
		for (let view of views) {
			view = view as CombinedViewDefinition;
			if (view.chartControlId && view.tableControlId) {
				singleChartId = view.chartControlId;
				singleTableId = view.tableControlId;
				break;
			}
		}
	} else {
		for (let view of views) {
			view = view as SingleViewDefinition;
			if (!singleTableId && (view as SingleTableViewDefinition).tableControlId) {
				singleTableId = (view as SingleTableViewDefinition).tableControlId || "";
			}
			if (!singleChartId && (view as SingleChartViewDefinition).chartControlId) {
				singleChartId = (view as SingleChartViewDefinition).chartControlId || "";
			}
			if (singleChartId && singleTableId) {
				break;
			}
		}
	}
	if (singleTableId || singleChartId) {
		return {
			chartId: singleChartId,
			tableId: singleTableId
		};
	}
	return undefined;
}
