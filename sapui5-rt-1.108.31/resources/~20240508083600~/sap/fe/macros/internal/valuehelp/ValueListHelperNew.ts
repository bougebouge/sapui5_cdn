import Log, { Level } from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import type { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import ValueListHelperCommon from "sap/fe/macros/internal/valuehelp/ValueListHelper";
import type Table from "sap/m/Table";
import type Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import { system } from "sap/ui/Device";
import Rem from "sap/ui/dom/units/Rem";
import type FieldBase from "sap/ui/mdc/field/FieldBase";
import type ValueHelp from "sap/ui/mdc/ValueHelp";
import type Container from "sap/ui/mdc/valuehelp/base/Container";
import type Content from "sap/ui/mdc/valuehelp/base/Content";
import Conditions from "sap/ui/mdc/valuehelp/content/Conditions";
import MDCTable from "sap/ui/mdc/valuehelp/content/MDCTable";
import MTable from "sap/ui/mdc/valuehelp/content/MTable";
import JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";

//was in helpers.d.ts:
//declare module "sap/ui/dom/units/Rem" {
//	function fromPx(vPx: string | float): float;
//}

const AnnotationLabel = "@com.sap.vocabularies.Common.v1.Label",
	AnnotationText = "@com.sap.vocabularies.Common.v1.Text",
	AnnotationTextUITextArrangement = "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement",
	AnnotationValueListParameterIn = "com.sap.vocabularies.Common.v1.ValueListParameterIn",
	AnnotationValueListParameterConstant = "com.sap.vocabularies.Common.v1.ValueListParameterConstant",
	AnnotationValueListParameterOut = "com.sap.vocabularies.Common.v1.ValueListParameterOut",
	AnnotationValueListParameterInOut = "com.sap.vocabularies.Common.v1.ValueListParameterInOut",
	AnnotationValueListWithFixedValues = "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues";

type AnnotationsForCollection = {
	"@Org.OData.Capabilities.V1.SearchRestrictions"?: {
		Searchable?: boolean;
	};
};

type AnnotationsForProperty = {
	"@com.sap.vocabularies.Common.v1.ValueList"?: {
		SearchSupported?: boolean;
	};
	"@com.sap.vocabularies.Common.v1.Label"?: string; // AnnotationLabel
	"@com.sap.vocabularies.Common.v1.Text"?: {
		// AnnotationText
		$Path: string;
	};
	"@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"?: {
		// AnnotationTextUITextArrangement
		$EnumMember?: string;
	};
	"@com.sap.vocabularies.UI.v1.HiddenFilter"?: boolean;
	"@com.sap.vocabularies.Common.v1.ValueListWithFixedValues"?: boolean; // AnnotationValueListWithFixedValues
	"@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"?: string[];
	"@com.sap.vocabularies.UI.v1.Hidden"?: string;
};

type AnnotationSelectionField = {
	$PropertyPath: string;
};

type AnnotationsForEntityType = {
	"@com.sap.vocabularies.UI.v1.SelectionFields"?: AnnotationSelectionField[];
};

export type AnnotationValueListParameter = {
	$Type: string;
	ValueListProperty: string;
	LocalDataProperty: {
		$PropertyPath: string;
	};
	Constant: string;
	InitialValueIsSignificant: boolean;
};

// com.sap.vocabularies.Common.v1.ValueListType
type AnnotationValueListType = {
	Label: string;
	CollectionPath: string;
	CollectionRoot: string;
	DistinctValuesSupported: boolean;
	SearchSupported: boolean;
	FetchValues: number;
	PresentationVariantQualifier: string;
	SelectionVariantQualifier: string;
	Parameters: [AnnotationValueListParameter];
	$model: ODataModel;
};

type AnnotationValueListTypeByQualifier = { [qualifier in string]: AnnotationValueListType };

type Property = {
	$Type: string;
	$kind: string;
	$isCollection: boolean;
};

export type InOutParameter = {
	parmeterType: string;
	source: string;
	helpPath: string;
	initialValueFilterEmpty: boolean;
	constantValue?: string | boolean;
};

type ValueHelpPayloadInfo = {
	vhKeys?: string[];
	vhParameters?: InOutParameter[];
};

type ValueHelpQualifierMap = Record<string, ValueHelpPayloadInfo>;

export type ValueHelpPayload = {
	propertyPath: string;
	qualifiers: ValueHelpQualifierMap;
	valueHelpQualifier: string;
	conditionModel?: any;
	isActionParameterDialog?: boolean;
	isUnitValueHelp?: boolean;
	requestGroupId?: string;
	useMultiValueField?: boolean;
	isValueListWithFixedValues?: boolean;
};

type ColumnDef = {
	path: string;
	label: string;
	sortable: boolean;
	filterable: boolean | CompiledBindingToolkitExpression;
	$Type: string;
};

export type ValueListInfo = {
	keyValue: string;
	descriptionValue: string;
	fieldPropertyPath: string;
	vhKeys: string[];
	vhParameters: InOutParameter[];
	valueListInfo: AnnotationValueListType;
	columnDefs: ColumnDef[];
	valueHelpQualifier: string;
};

type DisplayFormat = "Description" | "ValueDescription" | "Value" | "DescriptionValue";

type AdditionalViewData = {
	enableAutoColumnWidth?: boolean;
};

const ValueListHelper = {
	entityIsSearchable: function (propertyAnnotations: AnnotationsForProperty, collectionAnnotations: AnnotationsForCollection): boolean {
		const searchSupported = propertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"]?.SearchSupported,
			searchable = collectionAnnotations["@Org.OData.Capabilities.V1.SearchRestrictions"]?.Searchable;

		if (
			(searchable === undefined && searchSupported === false) ||
			(searchable === true && searchSupported === false) ||
			searchable === false
		) {
			return false;
		}
		return true;
	},

	/**
	 * Returns the condition path required for the condition model.
	 * For e.g. <1:N-PropertyName>*\/<1:1-PropertyName>/<PropertyName>.
	 *
	 * @param metaModel The metamodel instance
	 * @param entitySet The entity set path
	 * @param propertyPath The property path
	 * @returns The formatted condition path
	 * @private
	 */
	_getConditionPath: function (metaModel: ODataMetaModel, entitySet: string, propertyPath: string): string {
		// (see also: sap/fe/core/converters/controls/ListReport/FilterBar.ts)
		const parts = propertyPath.split("/");
		let conditionPath = "",
			partialPath: string | undefined;

		while (parts.length) {
			let part = parts.shift() as string;
			partialPath = partialPath ? `${partialPath}/${part}` : part;
			const property = metaModel.getObject(`${entitySet}/${partialPath}`) as Property;
			if (property && property.$kind === "NavigationProperty" && property.$isCollection) {
				part += "*";
			}
			conditionPath = conditionPath ? `${conditionPath}/${part}` : part;
		}
		return conditionPath;
	},

	/**
	 * Returns array of column definitions corresponding to properties defined as Selection Fields on the CollectionPath entity set in a ValueHelp.
	 *
	 * @param metaModel The metamodel instance
	 * @param entitySet The entity set path
	 * @returns Array of column definitions
	 * @private
	 */
	_getColumnDefinitionFromSelectionFields: function (metaModel: ODataMetaModel, entitySet: string): ColumnDef[] {
		const columnDefs: ColumnDef[] = [],
			//selectionFields = metaModel.getObject(entitySet + "/@com.sap.vocabularies.UI.v1.SelectionFields") as SelectionField[] | undefined;
			entityTypeAnnotations = metaModel.getObject(`${entitySet}/@`) as AnnotationsForEntityType,
			selectionFields = entityTypeAnnotations["@com.sap.vocabularies.UI.v1.SelectionFields"];

		if (selectionFields) {
			selectionFields.forEach(function (selectionField) {
				const selectionFieldPath = `${entitySet}/${selectionField.$PropertyPath}`,
					conditionPath = ValueListHelper._getConditionPath(metaModel, entitySet, selectionField.$PropertyPath),
					propertyAnnotations = metaModel.getObject(`${selectionFieldPath}@`) as AnnotationsForProperty,
					columnDef = {
						path: conditionPath,
						label: propertyAnnotations[AnnotationLabel] || selectionFieldPath,
						sortable: true,
						filterable: CommonUtils.isPropertyFilterable(metaModel, entitySet, selectionField.$PropertyPath, false),
						$Type: metaModel.getObject(selectionFieldPath).$Type
					};
				columnDefs.push(columnDef);
			});
		}

		return columnDefs;
	},

	_mergeColumnDefinitionsFromProperties: function (
		columnDefs: ColumnDef[],
		valueListInfo: AnnotationValueListType,
		valueListProperty: string,
		property: Property,
		propertyAnnotations: AnnotationsForProperty
	): void {
		let columnPath = valueListProperty,
			columnPropertyType = property.$Type;
		const label = propertyAnnotations[AnnotationLabel] || columnPath,
			textAnnotation = propertyAnnotations[AnnotationText];

		if (
			textAnnotation &&
			propertyAnnotations[AnnotationTextUITextArrangement]?.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly"
		) {
			// the column property is the one coming from the text annotation
			columnPath = textAnnotation.$Path;
			const textPropertyPath = `/${valueListInfo.CollectionPath}/${columnPath}`;
			columnPropertyType = valueListInfo.$model.getMetaModel().getObject(textPropertyPath).$Type as string;
		}

		const columnNotAlreadyDefined =
			columnDefs.findIndex(function (col) {
				return col.path === columnPath;
			}) === -1;

		if (columnNotAlreadyDefined) {
			const columnDef: ColumnDef = {
				path: columnPath,
				label: label,
				sortable: true,
				filterable: !propertyAnnotations["@com.sap.vocabularies.UI.v1.HiddenFilter"],
				$Type: columnPropertyType
			};
			columnDefs.push(columnDef);
		}
	},

	filterInOutParameters: function (vhParameters: InOutParameter[], typeFilter: string[]) {
		return vhParameters.filter(function (parameter) {
			return typeFilter.indexOf(parameter.parmeterType) > -1;
		});
	},

	getInParameters: function (vhParameters: InOutParameter[]) {
		return ValueListHelper.filterInOutParameters(vhParameters, [
			AnnotationValueListParameterIn,
			AnnotationValueListParameterConstant,
			AnnotationValueListParameterInOut
		]);
	},

	getOutParameters: function (vhParameters: InOutParameter[]) {
		return ValueListHelper.filterInOutParameters(vhParameters, [AnnotationValueListParameterOut, AnnotationValueListParameterInOut]);
	},

	createVHUIModel: function (valueHelp: ValueHelp, propertyPath: string, metaModel: ODataMetaModel): JSONModel {
		// setting the _VHUI model evaluated in the ValueListTable fragment
		const vhUIModel = new JSONModel({}),
			propertyAnnotations = metaModel.getObject(`${propertyPath}@`) as AnnotationsForProperty;

		valueHelp.setModel(vhUIModel, "_VHUI");
		// Identifies the "ContextDependent-Scenario"
		vhUIModel.setProperty(
			"/hasValueListRelevantQualifiers",
			!!propertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"]
		);
		return vhUIModel;
	},

	destroyVHContent: function (valueHelp: ValueHelp): void {
		if (valueHelp.getDialog()) {
			valueHelp.getDialog().destroyContent();
		}
		if (valueHelp.getTypeahead()) {
			valueHelp.getTypeahead().destroyContent();
		}
	},

	putDefaultQualifierFirst: function (qualifiers: string[]) {
		const indexDefaultVH = qualifiers.indexOf("");

		// default ValueHelp without qualifier should be the first
		if (indexDefaultVH > 0) {
			qualifiers.unshift(qualifiers[indexDefaultVH]);
			qualifiers.splice(indexDefaultVH + 1, 1);
		}
		return qualifiers;
	},

	getValueListInfo: async function (valueHelp: ValueHelp, propertyPath: string, payload: ValueHelpPayload): Promise<ValueListInfo[]> {
		const bindingContext = valueHelp.getBindingContext() as Context,
			conditionModel = payload.conditionModel,
			vhMetaModel = valueHelp.getModel().getMetaModel() as ODataMetaModel,
			valueListInfos: ValueListInfo[] = [];

		try {
			const valueListByQualifier = (await vhMetaModel.requestValueListInfo(
				propertyPath,
				true,
				bindingContext
			)) as AnnotationValueListTypeByQualifier;
			const valueHelpQualifiers = this.putDefaultQualifierFirst(Object.keys(valueListByQualifier)),
				propertyName = propertyPath.split("/").pop();

			let contextPrefix = "";

			if (payload.useMultiValueField && bindingContext && bindingContext.getPath()) {
				const aBindigContextParts = bindingContext.getPath().split("/");
				const aPropertyBindingParts = propertyPath.split("/");
				if (aPropertyBindingParts.length - aBindigContextParts.length > 1) {
					const aContextPrefixParts = [];
					for (let i = aBindigContextParts.length; i < aPropertyBindingParts.length - 1; i++) {
						aContextPrefixParts.push(aPropertyBindingParts[i]);
					}
					contextPrefix = `${aContextPrefixParts.join("/")}/`;
				}
			}

			valueHelpQualifiers.forEach(function (valueHelpQualifier) {
				// Add column definitions for properties defined as Selection fields on the CollectionPath entity set.
				const annotationValueListType = valueListByQualifier[valueHelpQualifier],
					metaModel = annotationValueListType.$model.getMetaModel(),
					entitySetPath = `/${annotationValueListType.CollectionPath}`,
					columnDefs = ValueListHelper._getColumnDefinitionFromSelectionFields(metaModel, entitySetPath),
					vhParameters: InOutParameter[] = [],
					vhKeys: string[] = metaModel.getObject(entitySetPath + `/`)?.$Key
						? [...metaModel.getObject(entitySetPath + `/`).$Key]
						: [];
				let fieldPropertyPath = "",
					descriptionPath = "",
					key = "";

				annotationValueListType.Parameters.forEach(function (parameter) {
					//All String fields are allowed for filter
					const propertyPath2 = `/${annotationValueListType.CollectionPath}/${parameter.ValueListProperty}`,
						property = metaModel.getObject(propertyPath2),
						propertyAnnotations = (metaModel.getObject(`${propertyPath2}@`) || {}) as AnnotationsForProperty;

					// If property is undefined, then the property coming for the entry isn't defined in
					// the metamodel, therefore we don't need to add it in the in/out parameters
					if (property) {
						// Search for the *out Parameter mapped to the local property
						if (
							!key &&
							(parameter.$Type === AnnotationValueListParameterOut ||
								parameter.$Type === AnnotationValueListParameterInOut) &&
							parameter.LocalDataProperty.$PropertyPath === propertyName
						) {
							fieldPropertyPath = propertyPath2;
							key = parameter.ValueListProperty;

							//Only the text annotation of the key can specify the description
							descriptionPath = propertyAnnotations[AnnotationText]?.$Path || "";
						}

						const valueListProperty = parameter.ValueListProperty;
						ValueListHelper._mergeColumnDefinitionsFromProperties(
							columnDefs,
							annotationValueListType,
							valueListProperty,
							property,
							propertyAnnotations
						);
					}

					//In and InOut
					if (
						(parameter.$Type === AnnotationValueListParameterIn ||
							parameter.$Type === AnnotationValueListParameterInOut ||
							parameter.$Type === AnnotationValueListParameterOut) &&
						parameter.LocalDataProperty.$PropertyPath !== propertyName
					) {
						let valuePath = "";
						if (conditionModel && conditionModel.length > 0) {
							if (
								valueHelp.getParent().isA("sap.ui.mdc.Table") &&
								valueHelp.getBindingContext() &&
								(parameter.$Type === AnnotationValueListParameterIn ||
									parameter.$Type === AnnotationValueListParameterInOut)
							) {
								// Special handling for value help used in filter dialog
								const parts = parameter.LocalDataProperty.$PropertyPath.split("/");
								if (parts.length > 1) {
									const firstNavigationProperty = parts[0];
									const oBoundEntity = vhMetaModel.getMetaContext(bindingContext.getPath());
									const sPathOfTable = (valueHelp.getParent() as any).getRowBinding().getPath(); //TODO
									if ((oBoundEntity.getObject(`${sPathOfTable}/$Partner`) as any) === firstNavigationProperty) {
										// Using the condition model doesn't make any sense in case an in-parameter uses a navigation property
										// referring to the partner. Therefore reducing the path and using the FVH context instead of the condition model
										valuePath = parameter.LocalDataProperty.$PropertyPath.replace(firstNavigationProperty + "/", "");
									}
								}
							}
							if (!valuePath) {
								valuePath = conditionModel + ">/conditions/" + parameter.LocalDataProperty.$PropertyPath;
							}
						} else {
							valuePath = contextPrefix + parameter.LocalDataProperty.$PropertyPath;
						}
						vhParameters.push({
							parmeterType: parameter.$Type,
							source: valuePath,
							helpPath: parameter.ValueListProperty,
							constantValue: parameter.Constant,
							initialValueFilterEmpty: parameter.InitialValueIsSignificant
						});
					}

					//Constant as InParamter for filtering
					if (parameter.$Type === AnnotationValueListParameterConstant) {
						vhParameters.push({
							parmeterType: parameter.$Type,
							source: parameter.ValueListProperty,
							helpPath: parameter.ValueListProperty,
							constantValue: parameter.Constant,
							initialValueFilterEmpty: parameter.InitialValueIsSignificant
						});
					}
					// Enrich keys with out-parameters
					if (
						(parameter.$Type === AnnotationValueListParameterInOut || parameter.$Type === AnnotationValueListParameterOut) &&
						!vhKeys.includes(parameter.ValueListProperty)
					) {
						vhKeys.push(parameter.ValueListProperty);
					}
				});
				/* Ensure that vhKeys are part of the columnDefs, otherwise it is not considered in $select (BCP 2270141154) */
				for (const vhKey of vhKeys) {
					if (
						columnDefs.findIndex(function (column) {
							return column.path === vhKey;
						}) === -1
					) {
						const columnDef: ColumnDef = {
							path: vhKey,
							$Type: metaModel.getObject(`/${annotationValueListType.CollectionPath}/${key}`).$Type,
							label: "",
							sortable: false,
							filterable: undefined
						};
						columnDefs.push(columnDef);
					}
				}

				const valueListInfo: ValueListInfo = {
					keyValue: key,
					descriptionValue: descriptionPath,
					fieldPropertyPath: fieldPropertyPath,
					vhKeys: vhKeys,
					vhParameters: vhParameters,
					valueListInfo: annotationValueListType,
					columnDefs: columnDefs,
					valueHelpQualifier: valueHelpQualifier
				};
				valueListInfos.push(valueListInfo);
			});
		} catch (err: any) {
			const errStatus = err.status,
				msg =
					errStatus && errStatus === 404
						? `Metadata not found (${errStatus}) for value help of property ${propertyPath}`
						: err.message;
			Log.error(msg);
			ValueListHelper.destroyVHContent(valueHelp);
		}
		return valueListInfos;
	},

	ALLFRAGMENTS: undefined as any,
	logFragment: undefined as any,

	_logTemplatedFragments: function (propertyPath: string, fragmentName: string, fragmentDefinition: any): void {
		const logInfo = {
			path: propertyPath,
			fragmentName: fragmentName,
			fragment: fragmentDefinition
		};
		if (Log.getLevel() === Level.DEBUG) {
			//In debug mode we log all generated fragments
			ValueListHelper.ALLFRAGMENTS = ValueListHelper.ALLFRAGMENTS || [];
			ValueListHelper.ALLFRAGMENTS.push(logInfo);
		}
		if (ValueListHelper.logFragment) {
			//One Tool Subscriber allowed
			setTimeout(function () {
				ValueListHelper.logFragment(logInfo);
			}, 0);
		}
	},

	_templateFragment: async function (
		fragmentName: string,
		valueListInfo: ValueListInfo,
		sourceModel: JSONModel,
		propertyPath: string,
		additionalViewData?: AdditionalViewData
	): Promise<object> {
		const mValueListInfo = valueListInfo.valueListInfo,
			valueListModel = new JSONModel(mValueListInfo),
			valueListServiceMetaModel = mValueListInfo.$model.getMetaModel(),
			viewData = new JSONModel(
				Object.assign(
					{
						converterType: "ListReport",
						columns: valueListInfo.columnDefs || null
					},
					additionalViewData
				)
			);

		const fragmentDefinition = await Promise.resolve(
			XMLPreprocessor.process(
				XMLTemplateProcessor.loadTemplate(fragmentName, "fragment"),
				{ name: fragmentName },
				{
					bindingContexts: {
						valueList: valueListModel.createBindingContext("/"),
						contextPath: valueListServiceMetaModel.createBindingContext(`/${mValueListInfo.CollectionPath}/`),
						source: sourceModel.createBindingContext("/")
					},
					models: {
						valueList: valueListModel,
						contextPath: valueListServiceMetaModel,
						source: sourceModel,
						metaModel: valueListServiceMetaModel,
						viewData: viewData
					}
				}
			)
		);
		ValueListHelper._logTemplatedFragments(propertyPath, fragmentName, fragmentDefinition);
		return await Fragment.load({ definition: fragmentDefinition });
	},

	_getContentId: function (valueHelpId: string, valueHelpQualifier: string, isTypeahead: boolean): string {
		const contentType = isTypeahead ? "Popover" : "Dialog";

		return `${valueHelpId}::${contentType}::qualifier::${valueHelpQualifier}`;
	},

	_addInOutParametersToPayload: function (payload: ValueHelpPayload, valueListInfo: ValueListInfo): void {
		const valueHelpQualifier = valueListInfo.valueHelpQualifier;

		if (!payload.qualifiers) {
			payload.qualifiers = {};
		}

		if (!payload.qualifiers[valueHelpQualifier]) {
			payload.qualifiers[valueHelpQualifier] = {
				vhKeys: valueListInfo.vhKeys,
				vhParameters: valueListInfo.vhParameters
			};
		}
	},

	_getValueHelpColumnDisplayFormat: function (
		propertyAnnotations: AnnotationsForProperty,
		isValueHelpWithFixedValues: boolean
	): DisplayFormat {
		const displayMode = CommonUtils.computeDisplayMode(propertyAnnotations, undefined),
			textAnnotation = propertyAnnotations && propertyAnnotations[AnnotationText],
			textArrangementAnnotation = textAnnotation && propertyAnnotations[AnnotationTextUITextArrangement];

		if (isValueHelpWithFixedValues) {
			return textAnnotation && typeof textAnnotation !== "string" && textAnnotation.$Path ? displayMode : "Value";
		} else {
			// Only explicit defined TextArrangements in a Value Help with Dialog are considered
			return textArrangementAnnotation ? displayMode : "Value";
		}
	},

	_getWidthInRem: function (control: Control, isUnitValueHelp: boolean): number {
		let width = control.$().width(); // JQuery
		if (isUnitValueHelp && width) {
			width = 0.3 * width;
		}
		const floatWidth = width ? parseFloat(String(Rem.fromPx(width))) : 0;

		return isNaN(floatWidth) ? 0 : floatWidth;
	},

	getTableWidth: function (table: Table, minWidth: number): string {
		let width: string;
		const columns = table.getColumns(),
			visibleColumns =
				(columns &&
					columns.filter(function (column) {
						return column && column.getVisible && column.getVisible();
					})) ||
				[],
			sumWidth = visibleColumns.reduce(function (sum, column) {
				width = column.getWidth();
				if (width && width.endsWith("px")) {
					width = String(Rem.fromPx(width));
				}
				const floatWidth = parseFloat(width);

				return sum + (isNaN(floatWidth) ? 9 : floatWidth);
			}, visibleColumns.length);
		return `${Math.max(sumWidth, minWidth)}em`;
	},

	createValueHelpTypeahead: function (
		propertyPath: string,
		valueHelp: ValueHelp,
		content: MTable,
		valueListInfo: ValueListInfo,
		payload: ValueHelpPayload
	): Promise<any> {
		const contentId = content.getId(),
			propertyAnnotations = valueHelp.getModel().getMetaModel().getObject(`${propertyPath}@`) as AnnotationsForProperty,
			valueHelpWithFixedValues = propertyAnnotations[AnnotationValueListWithFixedValues] || false,
			isDialogTable = false,
			columnInfo = ValueListHelperCommon.getColumnVisibilityInfo(
				valueListInfo.valueListInfo,
				propertyPath,
				valueHelpWithFixedValues,
				isDialogTable
			),
			sourceModel = new JSONModel({
				id: contentId,
				groupId: payload.requestGroupId || undefined,
				bSuggestion: true,
				propertyPath: propertyPath,
				columnInfo: columnInfo,
				valueHelpWithFixedValues: valueHelpWithFixedValues
			});

		content.setKeyPath(valueListInfo.keyValue);
		content.setDescriptionPath(valueListInfo.descriptionValue);
		payload.isValueListWithFixedValues = valueHelpWithFixedValues;

		const collectionAnnotations = (valueListInfo.valueListInfo.$model
			.getMetaModel()
			.getObject(`/${valueListInfo.valueListInfo.CollectionPath}@`) || {}) as AnnotationsForCollection;

		content.setFilterFields(ValueListHelper.entityIsSearchable(propertyAnnotations, collectionAnnotations) ? "$search" : "");

		const tableOrPromise =
			content.getTable() ||
			ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListTable", valueListInfo, sourceModel, propertyPath);

		return Promise.all([tableOrPromise]).then(function (controls) {
			const table = controls[0];

			table.setModel(valueListInfo.valueListInfo.$model);

			Log.info(`Value List- suggest Table XML content created [${propertyPath}]`, table.getMetadata().getName(), "MDC Templating");

			content.setTable(table);

			const field = valueHelp.getControl();
			if (
				field &&
				(field.isA("sap.ui.mdc.FilterField") || field.isA("sap.ui.mdc.Field") || field.isA("sap.ui.mdc.MultiValueField"))
			) {
				//Can the filterfield be something else that we need the .isA() check?
				const reduceWidthForUnitValueHelp = Boolean(payload.isUnitValueHelp);
				const tableWidth = ValueListHelper.getTableWidth(table, ValueListHelper._getWidthInRem(field, reduceWidthForUnitValueHelp));
				table.setWidth(tableWidth);

				if (valueHelpWithFixedValues) {
					table.setMode((field as FieldBase).getMaxConditions() === 1 ? "SingleSelectMaster" : "MultiSelect");
				} else {
					table.setMode("SingleSelectMaster");
				}
			}
		});
	},

	createValueHelpDialog: function (
		propertyPath: string,
		valueHelp: ValueHelp,
		content: MDCTable,
		valueListInfo: ValueListInfo,
		payload: ValueHelpPayload
	): Promise<void> {
		const propertyAnnotations = valueHelp.getModel().getMetaModel().getObject(`${propertyPath}@`) as AnnotationsForProperty,
			isDropDownListe = false,
			isDialogTable = true,
			columnInfo = ValueListHelperCommon.getColumnVisibilityInfo(
				valueListInfo.valueListInfo,
				propertyPath,
				isDropDownListe,
				isDialogTable
			),
			sourceModel = new JSONModel({
				id: content.getId(),
				groupId: payload.requestGroupId || undefined,
				bSuggestion: false,
				columnInfo: columnInfo,
				valueHelpWithFixedValues: isDropDownListe
			});

		content.setKeyPath(valueListInfo.keyValue);
		content.setDescriptionPath(valueListInfo.descriptionValue);

		const collectionAnnotations = (valueListInfo.valueListInfo.$model
			.getMetaModel()
			.getObject(`/${valueListInfo.valueListInfo.CollectionPath}@`) || {}) as AnnotationsForCollection;

		content.setFilterFields(ValueListHelper.entityIsSearchable(propertyAnnotations, collectionAnnotations) ? "$search" : "");

		const tableOrPromise =
			content.getTable() ||
			ValueListHelper._templateFragment(
				"sap.fe.macros.internal.valuehelp.ValueListDialogTable",
				valueListInfo,
				sourceModel,
				propertyPath,
				{
					enableAutoColumnWidth: !system.phone
				}
			);

		const filterBarOrPromise =
			content.getFilterBar() ||
			ValueListHelper._templateFragment(
				"sap.fe.macros.internal.valuehelp.ValueListFilterBar",
				valueListInfo,
				sourceModel,
				propertyPath
			);

		return Promise.all([tableOrPromise, filterBarOrPromise]).then(function (controls) {
			const table = controls[0],
				filterBar = controls[1];

			table.setModel(valueListInfo.valueListInfo.$model);
			filterBar.setModel(valueListInfo.valueListInfo.$model);

			content.setFilterBar(filterBar);
			content.setTable(table);

			table.setFilter(filterBar.getId());
			table.initialized();

			const field = valueHelp.getControl();
			if (field) {
				table.setSelectionMode((field as FieldBase).getMaxConditions() === 1 ? "Single" : "Multi");
			}
			table.setWidth("100%");

			//This is a temporary workarround - provided by MDC (see FIORITECHP1-24002)
			const mdcTable = table as any;
			mdcTable._setShowP13nButton(false);
		});
	},

	_getContentById: function (contentList: Content[], contentId: string): Content | undefined {
		return contentList.find(function (item) {
			return item.getId() === contentId;
		});
	},

	_createPopoverContent: function (contentId: string, caseSensitive: boolean) {
		return new MTable({
			id: contentId,
			group: "group1",
			caseSensitive: caseSensitive
		} as any); //as $MTableSettings
	},

	_createDialogContent: function (contentId: string, caseSensitive: boolean, forceBind: boolean) {
		return new MDCTable({
			id: contentId,
			group: "group1",
			caseSensitive: caseSensitive,
			forceBind: forceBind
		} as any); //as $MDCTableSettings
	},

	showValueList: function (payload: ValueHelpPayload, container: Container, selectedContentId: string): Promise<void> {
		const valueHelp = container.getParent() as ValueHelp,
			isTypeahead = container.isTypeahead(),
			propertyPath = payload.propertyPath,
			metaModel = valueHelp.getModel().getMetaModel() as ODataMetaModel,
			vhUIModel = (valueHelp.getModel("_VHUI") as JSONModel) || ValueListHelper.createVHUIModel(valueHelp, propertyPath, metaModel),
			showConditionPanel = valueHelp.data("showConditionPanel") && valueHelp.data("showConditionPanel") !== "false";

		if (!payload.qualifiers) {
			payload.qualifiers = {};
		}

		vhUIModel.setProperty("/isSuggestion", isTypeahead);
		vhUIModel.setProperty("/minScreenWidth", !isTypeahead ? "418px" : undefined);

		return ValueListHelper.getValueListInfo(valueHelp, propertyPath, payload)
			.then(function (valueListInfos) {
				const caseSensitive = valueHelp.getTypeahead().getContent()[0].getCaseSensitive(); // take caseSensitive from first Typeahead content
				let contentList = container.getContent();

				if (isTypeahead) {
					let qualifierForTypeahead = valueHelp.data("valuelistForValidation") || ""; // can also be null
					if (qualifierForTypeahead === " ") {
						qualifierForTypeahead = "";
					}
					const valueListInfo = qualifierForTypeahead
						? valueListInfos.filter(function (subValueListInfo) {
								return subValueListInfo.valueHelpQualifier === qualifierForTypeahead;
						  })[0]
						: valueListInfos[0];

					ValueListHelper._addInOutParametersToPayload(payload, valueListInfo);

					const contentId = ValueListHelper._getContentId(valueHelp.getId(), valueListInfo.valueHelpQualifier, isTypeahead);
					let content = ValueListHelper._getContentById(contentList, contentId);

					if (!content) {
						content = ValueListHelper._createPopoverContent(contentId, caseSensitive);

						container.insertContent(content, 0); // insert content as first content
						contentList = container.getContent();
					} else if (contentId !== contentList[0].getId()) {
						// content already available but not as first content?
						container.removeContent(content);
						container.insertContent(content, 0); // move content to first position
						contentList = container.getContent();
					}

					payload.valueHelpQualifier = valueListInfo.valueHelpQualifier;

					content.setTitle(valueListInfo.valueListInfo.Label);

					return ValueListHelper.createValueHelpTypeahead(propertyPath, valueHelp, content as MTable, valueListInfo, payload);
				} else {
					// Dialog

					// set all contents to invisible
					for (let i = 0; i < contentList.length; i += 1) {
						contentList[i].setVisible(false);
					}
					if (showConditionPanel) {
						let conditionsContent =
							contentList.length &&
							contentList[contentList.length - 1].getMetadata().getName() === "sap.ui.mdc.valuehelp.content.Conditions"
								? contentList[contentList.length - 1]
								: undefined;

						if (conditionsContent) {
							conditionsContent.setVisible(true);
						} else {
							conditionsContent = new Conditions();
							container.addContent(conditionsContent);
							contentList = container.getContent();
						}
					}

					let selectedInfo: ValueListInfo | undefined, selectedContent: Content | undefined;

					// Create or reuse contents for the current context
					for (let i = 0; i < valueListInfos.length; i += 1) {
						const valueListInfo = valueListInfos[i],
							valueHelpQualifier = valueListInfo.valueHelpQualifier;

						ValueListHelper._addInOutParametersToPayload(payload, valueListInfo);

						const contentId = ValueListHelper._getContentId(valueHelp.getId(), valueHelpQualifier, isTypeahead);
						let content = ValueListHelper._getContentById(contentList, contentId);

						if (!content) {
							const forceBind = valueListInfo.valueListInfo.FetchValues == 2 ? false : true;

							content = ValueListHelper._createDialogContent(contentId, caseSensitive, forceBind);

							if (!showConditionPanel) {
								container.addContent(content);
							} else {
								container.insertContent(content, contentList.length - 1); // insert content before conditions content
							}
							contentList = container.getContent();
						} else {
							content.setVisible(true);
						}
						content.setTitle(valueListInfo.valueListInfo.Label);

						if (!selectedContent || (selectedContentId && selectedContentId === contentId)) {
							selectedContent = content;
							selectedInfo = valueListInfo;
						}
					}

					if (!selectedInfo || !selectedContent) {
						throw new Error("selectedInfo or selectedContent undefined");
					}

					payload.valueHelpQualifier = selectedInfo.valueHelpQualifier;
					container.setTitle(selectedInfo.valueListInfo.Label);

					return ValueListHelper.createValueHelpDialog(
						propertyPath,
						valueHelp,
						selectedContent as MDCTable,
						selectedInfo,
						payload
					);
				}
			})
			.catch(function (err: Error) {
				const errStatus = (err as any).status,
					msg =
						errStatus && errStatus === 404
							? `Metadata not found (${errStatus}) for value help of property ${propertyPath}`
							: err.message;
				Log.error(msg);
				ValueListHelper.destroyVHContent(valueHelp);
			});
	}
};

export default ValueListHelper;
