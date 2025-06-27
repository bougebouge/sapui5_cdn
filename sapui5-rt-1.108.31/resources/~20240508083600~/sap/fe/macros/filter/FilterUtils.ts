import { EntityType } from "@sap-ux/vocabularies-types";
import Log from "sap/base/Log";
import merge from "sap/base/util/merge";
import AppComponent from "sap/fe/core/AppComponent";
import CommonUtils from "sap/fe/core/CommonUtils";
import * as FilterBarConverter from "sap/fe/core/converters/controls/ListReport/FilterBar";
import ConverterContext from "sap/fe/core/converters/ConverterContext";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import SemanticDateOperators from "sap/fe/core/helpers/SemanticDateOperators";
import { ODATA_TYPE_MAPPING } from "sap/fe/core/templating/DisplayModeFormatter";
import CommonHelper from "sap/fe/macros/CommonHelper";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import MetaModelUtil from "sap/fe/macros/ODataMetaModelUtil";
import Core from "sap/ui/core/Core";
import Condition from "sap/ui/mdc/condition/Condition";
import ConditionConverter from "sap/ui/mdc/condition/ConditionConverter";
import ConditionValidated from "sap/ui/mdc/enum/ConditionValidated";
import FilterBar from "sap/ui/mdc/FilterBar";
import TypeUtil from "sap/ui/mdc/odata/v4/TypeUtil";
import StateUtil from "sap/ui/mdc/p13n/StateUtil";
import FilterUtil from "sap/ui/mdc/util/FilterUtil";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import MetaModel from "sap/ui/model/MetaModel";
import ODataUtils from "sap/ui/model/odata/v4/ODataUtils";

const oFilterUtils = {
	getFilter: function (vIFilter: any) {
		const aFilters = oFilterUtils.getFilterInfo(vIFilter).filters;
		return aFilters.length ? new Filter(oFilterUtils.getFilterInfo(vIFilter).filters, false) : undefined;
	},
	getFilterField: function (propertyPath: string, converterContext: ConverterContext, entityType: EntityType) {
		return FilterBarConverter.getFilterField(propertyPath, converterContext, entityType);
	},
	buildProperyInfo: function (propertyInfoField: any, converterContext: ConverterContext) {
		let oPropertyInfo;
		const aTypeConfig: any = {};
		const propertyConvertyContext = converterContext.getConverterContextFor(propertyInfoField.annotationPath);
		const propertyTargetObject = propertyConvertyContext.getDataModelObjectPath().targetObject;
		const oTypeConfig = FilterBarConverter.fetchTypeConfig(propertyTargetObject);
		oPropertyInfo = FilterBarConverter.fetchPropertyInfo(converterContext, propertyInfoField, oTypeConfig);
		aTypeConfig[propertyInfoField.key] = oTypeConfig;
		oPropertyInfo = FilterBarConverter.assignDataTypeToPropertyInfo(oPropertyInfo, converterContext, [], aTypeConfig);
		return oPropertyInfo;
	},
	createConverterContext: function (oFilterControl: any, sEntityTypePath: string, metaModel?: MetaModel, appComponent?: AppComponent) {
		const sFilterEntityTypePath = DelegateUtil.getCustomData(oFilterControl, "entityType"),
			contextPath = sEntityTypePath || sFilterEntityTypePath;

		const oView = oFilterControl.isA ? CommonUtils.getTargetView(oFilterControl) : null;
		const oMetaModel = metaModel || oFilterControl.getModel().getMetaModel();
		const oAppComponent = appComponent || (oView && CommonUtils.getAppComponent(oView));
		const oVisualizationObjectPath = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.createBindingContext(contextPath));
		let manifestSettings;
		if (oFilterControl.isA && !oFilterControl.isA("sap.ui.mdc.filterbar.vh.FilterBar")) {
			manifestSettings = (oView && oView.getViewData()) || undefined;
		}
		return ConverterContext.createConverterContextForMacro(
			oVisualizationObjectPath.startingEntitySet.name,
			oMetaModel,
			oAppComponent && oAppComponent.getDiagnostics(),
			merge,
			oVisualizationObjectPath.contextLocation,
			manifestSettings
		);
	},
	getConvertedFilterFields: function (
		oFilterControl: any,
		sEntityTypePath?: any,
		includeHidden?: boolean,
		metaModel?: MetaModel,
		appComponent?: AppComponent,
		oModifier?: any,
		lineItemTerm?: string
	) {
		const oMetaModel = this._getFilterMetaModel(oFilterControl, metaModel);
		const sFilterEntityTypePath = DelegateUtil.getCustomData(oFilterControl, "entityType"),
			contextPath = sEntityTypePath || sFilterEntityTypePath;

		const lrTables: any[] = this._getFieldsForTable(oFilterControl, sEntityTypePath);

		const oConverterContext = this.createConverterContext(oFilterControl, sEntityTypePath, metaModel, appComponent);

		//aSelectionFields = FilterBarConverter.getSelectionFields(oConverterContext);
		return this._getSelectionFields(
			oFilterControl,
			sEntityTypePath,
			sFilterEntityTypePath,
			contextPath,
			lrTables,
			oMetaModel,
			oConverterContext,
			includeHidden,
			oModifier,
			lineItemTerm
		);
	},

	getBindingPathForParameters: function (oIFilter: any, mConditions: any, aFilterPropertiesMetadata: any, aParameters: any) {
		const aParams: any[] = [];
		aFilterPropertiesMetadata = oFilterUtils.setTypeConfigToProperties(aFilterPropertiesMetadata);
		// Collecting all parameter values from conditions
		for (let i = 0; i < aParameters.length; i++) {
			const sFieldPath = aParameters[i];
			if (mConditions[sFieldPath] && mConditions[sFieldPath].length > 0) {
				// We would be using only the first condition for parameter value.
				const oConditionInternal = merge({}, mConditions[sFieldPath][0]) as any;
				const oProperty = FilterUtil.getPropertyByKey(aFilterPropertiesMetadata, sFieldPath) as any;
				const oTypeConfig =
					oProperty.typeConfig || TypeUtil.getTypeConfig(oProperty.dataType, oProperty.formatOptions, oProperty.constraints);
				const mInternalParameterCondition = ConditionConverter.toType(oConditionInternal, oTypeConfig, oIFilter.getTypeUtil());
				const sEdmType = ODATA_TYPE_MAPPING[oTypeConfig.className];
				aParams.push(
					`${sFieldPath}=${encodeURIComponent(ODataUtils.formatLiteral(mInternalParameterCondition.values[0], sEdmType))}`
				);
			}
		}

		// Binding path from EntityType
		const sEntityTypePath = oIFilter.data("entityType");
		const sEntitySetPath = sEntityTypePath.substring(0, sEntityTypePath.length - 1);
		const sParameterEntitySet = sEntitySetPath.slice(0, sEntitySetPath.lastIndexOf("/"));
		const sTargetNavigation = sEntitySetPath.substring(sEntitySetPath.lastIndexOf("/") + 1);
		// create parameter context
		return `${sParameterEntitySet}(${aParams.toString()})/${sTargetNavigation}`;
	},

	getEditStateIsHideDraft: function (mConditions: any) {
		let bIsHideDraft = false;
		if (mConditions && mConditions.$editState) {
			const oCondition = mConditions.$editState.find(function (condition: any) {
				return condition.operator === "DRAFT_EDIT_STATE";
			});
			if (oCondition && (oCondition.values.includes("ALL_HIDING_DRAFTS") || oCondition.values.includes("SAVED_ONLY"))) {
				bIsHideDraft = true;
			}
		}
		return bIsHideDraft;
	},
	/**
	 * Gets all filters that originate from the MDC FilterBar.
	 *
	 * @param vIFilter String or object instance related to
	 *  - MDC_FilterBar/Table/Chart
	 * @param mProperties Properties on filters that are to be retrieved. Available parameters:
	 * 	 - ignoredProperties: Array of property names which should be not considered for filtering
	 *	 - propertiesMetadata: Array with all the property metadata. If not provided, properties will be retrieved from vIFilter.
	 *	 - targetControl: MDC_table or chart. If provided, property names which are not relevant for the target control entitySet are not considered.
	 * @param mFilterConditions Map with externalized filter conditions.
	 * @returns FilterBar filters and basic search
	 * @private
	 * @ui5-restricted
	 */
	getFilterInfo: function (vIFilter: string | object, mProperties?: any, mFilterConditions?: any) {
		let aIgnoreProperties = (mProperties && mProperties.ignoredProperties) || [];
		const oTargetControl = mProperties && mProperties.targetControl,
			sTargetEntityPath = oTargetControl ? oTargetControl.data("entityType") : undefined;
		let oIFilter: any = vIFilter,
			sSearch,
			aFilters: any[] = [],
			sBindingPath,
			aPropertiesMetadata = mProperties && mProperties.propertiesMetadata;
		if (typeof vIFilter === "string") {
			oIFilter = Core.byId(vIFilter) as any;
		}
		if (oIFilter) {
			sSearch = this._getSearchField(oIFilter, aIgnoreProperties);
			const mConditions = this._getFilterConditions(mProperties, mFilterConditions, oIFilter);
			let aFilterPropertiesMetadata = oIFilter.getPropertyInfoSet ? oIFilter.getPropertyInfoSet() : null;
			aFilterPropertiesMetadata = this._getFilterPropertiesMetadata(aFilterPropertiesMetadata, oIFilter);
			if (mProperties && mProperties.targetControl && mProperties.targetControl.isA("sap.ui.mdc.Chart")) {
				Object.keys(mConditions).forEach(function (sKey: string) {
					if (sKey === "$editState") {
						delete mConditions["$editState"];
					}
				});
			}
			let aParameters = oIFilter.data("parameters") || [];
			aParameters = typeof aParameters === "string" ? JSON.parse(aParameters) : aParameters;
			if (aParameters && aParameters.length > 0) {
				// Binding path changes in case of parameters.
				sBindingPath = oFilterUtils.getBindingPathForParameters(oIFilter, mConditions, aFilterPropertiesMetadata, aParameters);
			}
			if (mConditions) {
				//Exclude Interface Filter properties that are not relevant for the Target control entitySet
				if (sTargetEntityPath && oIFilter.data("entityType") !== sTargetEntityPath) {
					const oMetaModel = oIFilter.getModel().getMetaModel();
					const aTargetPropertiesMetadata = oIFilter
						.getControlDelegate()
						.fetchPropertiesForEntity(sTargetEntityPath, oMetaModel, oIFilter);
					aPropertiesMetadata = aTargetPropertiesMetadata;

					const mEntityProperties: any = {};
					for (const i in aTargetPropertiesMetadata) {
						const oEntityProperty = aTargetPropertiesMetadata[i];
						mEntityProperties[oEntityProperty.name] = {
							"hasProperty": true,
							dataType: oEntityProperty.dataType
						};
					}
					const _aIgnoreProperties: any = this._getIgnoredProperties(aFilterPropertiesMetadata, mEntityProperties);
					if (_aIgnoreProperties.length > 0) {
						aIgnoreProperties = aIgnoreProperties.concat(_aIgnoreProperties);
					}
				} else if (!aPropertiesMetadata) {
					aPropertiesMetadata = aFilterPropertiesMetadata;
				}
				// var aParamKeys = [];
				// aParameters.forEach(function (oParam) {
				// 	aParamKeys.push(oParam.key);
				// });
				const oFilter = (
					FilterUtil.getFilterInfo(
						oIFilter,
						mConditions,
						oFilterUtils.setTypeConfigToProperties(aPropertiesMetadata),
						aIgnoreProperties.concat(aParameters)
					) as any
				).filters;
				aFilters = oFilter ? [oFilter] : [];
			}
		}
		return { filters: aFilters, search: sSearch || undefined, bindingPath: sBindingPath };
	},
	setTypeConfigToProperties: function (aProperties: any) {
		if (aProperties && aProperties.length) {
			aProperties.forEach(function (oIFilterProperty: any) {
				if (
					oIFilterProperty.typeConfig &&
					oIFilterProperty.typeConfig.typeInstance &&
					oIFilterProperty.typeConfig.typeInstance.getConstraints instanceof Function
				) {
					return;
				}
				if (oIFilterProperty.path === "$editState") {
					oIFilterProperty.typeConfig = TypeUtil.getTypeConfig("sap.ui.model.odata.type.String", {}, {});
				} else if (oIFilterProperty.path === "$search") {
					oIFilterProperty.typeConfig = TypeUtil.getTypeConfig("sap.ui.model.odata.type.String", {}, {});
				} else if (oIFilterProperty.dataType || (oIFilterProperty.typeConfig && oIFilterProperty.typeConfig.className)) {
					oIFilterProperty.typeConfig = TypeUtil.getTypeConfig(
						oIFilterProperty.dataType || oIFilterProperty.typeConfig.className,
						oIFilterProperty.formatOptions,
						oIFilterProperty.constraints
					);
				}
			});
		}
		return aProperties;
	},
	getNotApplicableFilters: function (oFilterBar: any, oControl: any) {
		const sTargetEntityTypePath = oControl.data("entityType"),
			oFilterBarEntityPath = oFilterBar.data("entityType"),
			oFilterBarEntitySetAnnotations = oFilterBar.getModel().getMetaModel().getObject(oFilterBarEntityPath),
			aNotApplicable = [],
			mConditions = oFilterBar.getConditions(),
			oMetaModel = oFilterBar.getModel().getMetaModel(),
			bIsFilterBarEntityType = sTargetEntityTypePath === oFilterBar.data("entityType"),
			bIsChart = oControl.isA("sap.ui.mdc.Chart"),
			bIsAnalyticalTable = !bIsChart && oControl.getParent().getTableDefinition().enableAnalytics,
			bEnableSearch = bIsChart
				? CommonHelper.parseCustomData(DelegateUtil.getCustomData(oControl, "applySupported")).enableSearch
				: !bIsAnalyticalTable || oControl.getParent().getTableDefinition().enableAnalyticsSearch;

		if (mConditions && (!bIsFilterBarEntityType || bIsAnalyticalTable || bIsChart)) {
			// We don't need to calculate the difference on property Level if entity sets are identical
			const aTargetProperties = bIsFilterBarEntityType
				? []
				: oFilterBar.getControlDelegate().fetchPropertiesForEntity(sTargetEntityTypePath, oMetaModel, oFilterBar),
				mTargetProperties = aTargetProperties.reduce(function (mProp: any, oProp: any) {
					mProp[oProp.name] = oProp;
					return mProp;
				}, {}),
				mTableAggregates = (!bIsChart && oControl.getParent().getTableDefinition().aggregates) || {},
				mAggregatedProperties: any = {};

			Object.keys(mTableAggregates).forEach(function (sAggregateName: string) {
				const oAggregate = mTableAggregates[sAggregateName];
				mAggregatedProperties[oAggregate.relativePath] = oAggregate;
			});
			const chartEntityTypeAnnotations = oControl
				.getModel()
				.getMetaModel()
				.getObject(oControl.data("targetCollectionPath") + "/");
			if (oControl.isA("sap.ui.mdc.Chart")) {
				const oEntitySetAnnotations = oControl
					.getModel()
					.getMetaModel()
					.getObject(`${oControl.data("targetCollectionPath")}@`),
					mChartCustomAggregates = MetaModelUtil.getAllCustomAggregates(oEntitySetAnnotations);
				Object.keys(mChartCustomAggregates).forEach(function (sAggregateName: string) {
					if (!mAggregatedProperties[sAggregateName]) {
						const oAggregate = mChartCustomAggregates[sAggregateName];
						mAggregatedProperties[sAggregateName] = oAggregate;
					}
				});
			}

			for (const sProperty in mConditions) {
				// Need to check the length of mConditions[sProperty] since previous filtered properties are kept into mConditions with empty array as definition
				const aConditionProperty = mConditions[sProperty];
				let typeCheck = true;
				if (chartEntityTypeAnnotations[sProperty] && oFilterBarEntitySetAnnotations[sProperty]) {
					typeCheck = chartEntityTypeAnnotations[sProperty]["$Type"] === oFilterBarEntitySetAnnotations[sProperty]["$Type"];
				}
				if (
					Array.isArray(aConditionProperty) &&
					aConditionProperty.length > 0 &&
					(((!mTargetProperties[sProperty] || (mTargetProperties[sProperty] && !typeCheck)) &&
						(!bIsFilterBarEntityType || (sProperty === "$editState" && bIsChart))) ||
						mAggregatedProperties[sProperty])
				) {
					aNotApplicable.push(sProperty.replace(/\+|\*/g, ""));
				}
			}
		}
		if (!bEnableSearch && oFilterBar.getSearch()) {
			aNotApplicable.push("$search");
		}
		return aNotApplicable;
	},

	/**
	 * Set the filter values for the given property in the filter bar.
	 * The filter values can be either a single value or an array of values.
	 * Each filter value must be represented as a primitive value.
	 *
	 * @param oFilterBar The filter bar that contains the filter field
	 * @param sConditionPath The path to the property as a condition path
	 * @param  {Object[]} args List of optional parameters
	 *  [sOperator] The operator to be used - if not set, the default operator (EQ) will be used
	 *  [vValues] The values to be applied - if sOperator is missing, vValues is used as 3rd parameter
	 * @private
	 */
	setFilterValues: async function (oFilterBar?: any, sConditionPath?: string, ...args: any) {
		let sOperator: string | undefined = args?.[0];
		let vValues: undefined | string | number | boolean | string[] | number[] | boolean[] = args?.[1];

		// Do nothing when the filter bar is hidden
		if (!oFilterBar) {
			return;
		}

		// common filter Operators need a value. Do nothing if this value is undefined
		// BCP: 2270135274
		if (
			args.length === 2 &&
			(vValues === undefined || vValues === null || vValues === "") &&
			sOperator &&
			Object.keys(FilterOperator).indexOf(sOperator) !== -1
		) {
			Log.warning(`An empty filter value cannot be applied with the ${sOperator} operator`);
			return;
		}

		// The 4th parameter is optional; if sOperator is missing, vValues is used as 3rd parameter
		// This does not apply for semantic dates, as these do not require vValues (exception: "LASTDAYS", 3)
		if (vValues === undefined && !SemanticDateOperators.getSemanticDateOperations().includes(sOperator || "")) {
			vValues = sOperator ?? [];
			sOperator = undefined;
		}

		// If sOperator is not set, use EQ as default
		if (!sOperator) {
			sOperator = FilterOperator.EQ;
		}

		// Supported array types:
		//  - Single Values:	"2" | ["2"]
		//  - Multiple Values:	["2", "3"]
		//  - Ranges:			["2","3"]
		// Unsupported array types:
		//  - Multiple Ranges:	[["2","3"]] | [["2","3"],["4","5"]]
		const supportedValueTypes = ["string", "number", "boolean"];
		if (
			vValues !== undefined &&
			((!Array.isArray(vValues) && !supportedValueTypes.includes(typeof vValues)) ||
				(Array.isArray(vValues) && vValues.length > 0 && !supportedValueTypes.includes(typeof vValues[0])))
		) {
			throw new Error(
				"FilterUtils.js#_setFilterValues: Filter value not supported; only primitive values or an array thereof can be used."
			);
		}
		let values: (string | number | boolean | null)[] | undefined;
		if (vValues !== undefined) {
			values = Array.isArray(vValues) ? vValues : [vValues];
		}

		let filter: { [key: string]: any } = {};
		if (sConditionPath) {
			if (values && values.length) {
				if (sOperator === FilterOperator.BT) {
					// The operator BT requires one condition with both thresholds
					filter[sConditionPath] = [Condition.createCondition(sOperator, values, null, null, ConditionValidated.NotValidated)];
				} else {
					// Regular single and multi value conditions, if there are no values, we do not want any conditions
					filter[sConditionPath] = values.map((value) =>
						Condition.createCondition(sOperator!, [value], null, null, ConditionValidated.NotValidated)
					);
				}
			} else if (!SemanticDateOperators.getSemanticDateOperations().includes(sOperator || "")) {
				const oState = await StateUtil.retrieveExternalState(oFilterBar);
				if (oState.filter[sConditionPath]) {
					oState.filter[sConditionPath].forEach((oCondition: any) => {
						oCondition.filtered = false;
					});
					filter = oState.filter;
				}
			} else {
				// vValues is undefined, so the operator is a semantic date that does not need values (see above)
				filter[sConditionPath] = [Condition.createCondition(sOperator, [], null, null, ConditionValidated.NotValidated)];
			}
		}
		await StateUtil.applyExternalState(oFilterBar, { filter });
	},
	conditionToModelPath: function (sConditionPath: string) {
		// make the path usable as model property, therefore slashes become backslashes
		return sConditionPath.replace(/\//g, "\\");
	},
	_getFilterMetaModel: function (oFilterControl: any, metaModel?: MetaModel) {
		return metaModel || oFilterControl.getModel().getMetaModel();
	},
	_getEntitySetPath: function (sEntityTypePath: any) {
		return sEntityTypePath && ModelHelper.getEntitySetPath(sEntityTypePath);
	},

	_getFieldsForTable: function (oFilterControl: any, sEntityTypePath?: any) {
		const lrTables: any[] = [];
		/**
		 * Gets fields from
		 * 	- direct entity properties,
		 * 	- navigateProperties key in the manifest if these properties are known by the entity
		 *  - annotation "SelectionFields"
		 */
		if (sEntityTypePath) {
			const oView = CommonUtils.getTargetView(oFilterControl);
			const tableControls = oView && oView.oController && oView.oController._getControls && oView.oController._getControls("table"); //[0].getParent().getTableDefinition();
			if (tableControls) {
				tableControls.forEach(function (oTable: any) {
					lrTables.push(oTable.getParent().getTableDefinition());
				});
			}
			return lrTables;
		}
		return [];
	},
	_getSelectionFields: function (
		oFilterControl: any,
		sEntityTypePath: string,
		sFilterEntityTypePath: string,
		contextPath: string,
		lrTables: any[],
		oMetaModel: any,
		oConverterContext: any,
		includeHidden?: boolean,
		oModifier?: any,
		lineItemTerm?: string
	) {
		let aSelectionFields = FilterBarConverter.getSelectionFields(
			oConverterContext,
			lrTables,
			undefined,
			includeHidden,
			lineItemTerm
		).selectionFields;
		if (
			(oModifier
				? oModifier.getControlType(oFilterControl) === "sap.ui.mdc.FilterBar"
				: oFilterControl.isA("sap.ui.mdc.FilterBar")) &&
			sEntityTypePath !== sFilterEntityTypePath
		) {
			/**
			 * We are on multi entity sets scenario so we add annotation "SelectionFields"
			 * from FilterBar entity if these properties are known by the entity
			 */
			const oVisualizationObjectPath = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.createBindingContext(contextPath));
			const oPageContext = oConverterContext.getConverterContextFor(sFilterEntityTypePath);
			const aFilterBarSelectionFieldsAnnotation: any =
				oPageContext.getEntityTypeAnnotation("@com.sap.vocabularies.UI.v1.SelectionFields").annotation || [];
			const mapSelectionFields: any = {};
			aSelectionFields.forEach(function (oSelectionField: any) {
				mapSelectionFields[oSelectionField.conditionPath] = true;
			});

			aFilterBarSelectionFieldsAnnotation.forEach(function (oFilterBarSelectionFieldAnnotation: any) {
				const sPath = oFilterBarSelectionFieldAnnotation.value;
				if (!mapSelectionFields[sPath]) {
					const oFilterField = FilterBarConverter.getFilterField(
						sPath,
						oConverterContext,
						oVisualizationObjectPath.startingEntitySet.entityType
					);
					if (oFilterField) {
						aSelectionFields.push(oFilterField);
					}
				}
			});
		}
		if (aSelectionFields) {
			const fieldNames: any[] = [];
			aSelectionFields.forEach(function (oField: any) {
				fieldNames.push(oField.key);
			});
			aSelectionFields = this._getSelectionFieldsFromPropertyInfos(oFilterControl, fieldNames, aSelectionFields);
		}
		return aSelectionFields;
	},
	_getSelectionFieldsFromPropertyInfos: function (oFilterControl: any, fieldNames: any, aSelectionFields: any) {
		const propertyInfoFields = (oFilterControl.getPropertyInfo && oFilterControl.getPropertyInfo()) || [];
		propertyInfoFields.forEach(function (oProp: any) {
			if (oProp.name === "$search" || oProp.name === "$editState") {
				return;
			}
			const selField = aSelectionFields[fieldNames.indexOf(oProp.key)];
			if (fieldNames.indexOf(oProp.key) !== -1 && selField.annotationPath) {
				oProp.group = selField.group;
				oProp.groupLabel = selField.groupLabel;
				oProp.settings = selField.settings;
				oProp.visualFilter = selField.visualFilter;
				oProp.label = selField.label;
				aSelectionFields[fieldNames.indexOf(oProp.key)] = oProp;
			}

			if (fieldNames.indexOf(oProp.key) === -1 && !oProp.annotationPath) {
				aSelectionFields.push(oProp);
			}
		});
		return aSelectionFields;
	},
	_getSearchField: function (oIFilter: any, aIgnoreProperties: any) {
		return oIFilter.getSearch && aIgnoreProperties.indexOf("search") === -1 ? oIFilter.getSearch() : null;
	},
	_getFilterConditions: function (mProperties: any, mFilterConditions: any, oIFilter: any) {
		const mConditions = mFilterConditions || oIFilter.getConditions();
		if (mProperties && mProperties.targetControl && mProperties.targetControl.isA("sap.ui.mdc.Chart")) {
			Object.keys(mConditions).forEach(function (sKey: string) {
				if (sKey === "$editState") {
					delete mConditions["$editState"];
				}
			});
		}
		return mConditions;
	},
	_getFilterPropertiesMetadata: function (aFilterPropertiesMetadata: any, oIFilter: any) {
		if (!(aFilterPropertiesMetadata && aFilterPropertiesMetadata.length)) {
			if (oIFilter.getPropertyInfo) {
				aFilterPropertiesMetadata = oIFilter.getPropertyInfo();
			} else {
				aFilterPropertiesMetadata = null;
			}
		}
		return aFilterPropertiesMetadata;
	},
	_getIgnoredProperties: function (aFilterPropertiesMetadata: any, mEntityProperties: any) {
		const aIgnoreProperties: any = [];
		aFilterPropertiesMetadata.forEach(function (oIFilterProperty: any) {
			const sIFilterPropertyName = oIFilterProperty.name;
			const mEntityPropertiesCurrent = mEntityProperties[sIFilterPropertyName];
			if (
				mEntityPropertiesCurrent &&
				(!mEntityPropertiesCurrent["hasProperty"] ||
					(mEntityPropertiesCurrent["hasProperty"] && oIFilterProperty.dataType !== mEntityPropertiesCurrent.dataType))
			) {
				aIgnoreProperties.push(sIFilterPropertyName);
			}
		});
		return aIgnoreProperties;
	},
	getFilters: function (filterBar: FilterBar) {
		const { filters, search } = this.getFilterInfo(filterBar);

		return { filters, search };
	},
};

export default oFilterUtils;
