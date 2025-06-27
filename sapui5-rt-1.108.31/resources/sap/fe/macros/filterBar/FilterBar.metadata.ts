/**
 *
 * @classdesc
 * Building block for creating a FilterBar based on the metadata provided by OData V4.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:FilterBar
 *   id="SomeID"
 *   showAdaptFiltersButton="true"
 *   p13nMode=["Item","Value"]
 *   listBindingNames = "sap.fe.tableBinding"
 *   liveMode="true"
 *   search=".handlers.onSearch"
 *   filterChanged=".handlers.onFiltersChanged"
 * /&gt;
 * </pre>
 *
 * Building block for creating a FilterBar based on the metadata provided by OData V4.
 * @class sap.fe.macros.FilterBar
 * @hideconstructor
 * @public
 * @since 1.94.0
 */
import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import { getSelectionVariant } from "sap/fe/core/converters/controls/Common/DataVisualization";
import { getSelectionFields } from "sap/fe/core/converters/controls/ListReport/FilterBar";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import TemplateModel from "sap/fe/core/TemplateModel";
import { getFilterConditions } from "sap/fe/core/templating/FilterHelper";
import MacroMetadata from "sap/fe/macros/MacroMetadata";
import ResourceModel from "sap/fe/macros/ResourceModel";

const FilterBarMetadata = MacroMetadata.extend("sap.fe.macros.FilterBar", {
	/**
	 * Name of the building block control.
	 */
	name: "FilterBar",
	/**
	 * Name of the building block control.
	 */
	namespace: "sap.fe.macros.internal",
	publicNamespace: "sap.fe.macros",
	/**
	 * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
	 */
	fragment: "sap.fe.macros.filterBar.FilterBar",

	/**
	 * The metadata describing the macro control.
	 */
	metadata: {
		/**
		 * Define macro stereotype for documentation
		 */
		stereotype: "xmlmacro",
		/**
		 * Location of the designtime info
		 */
		designtime: "sap/fe/macros/filterBar/FilterBar.designtime",
		/**
		 * Properties.
		 */
		properties: {
			/**
			 * selectionFields to be displayed
			 */
			selectionFields: {
				type: "sap.ui.model.Context"
			},
			metaPath: {
				type: "sap.ui.model.Context",
				isPublic: true
			},
			contextPath: {
				type: "sap.ui.model.Context",
				isPublic: true
			},
			/**
			 * ID of the FilterBar
			 */
			id: {
				type: "string",
				isPublic: true
			},
			visible: {
				type: "boolean",
				isPublic: true
			},
			/**
			 * Displays possible errors during the search in a message box
			 */
			showMessages: {
				type: "boolean",
				defaultValue: false,
				isPublic: true
			},
			/**
			 * If specificed as true the ID is applied to the inner content of the building block
			 * This is only a private property to be used by sap.fe (Fiori Elements)
			 */
			_applyIdToContent: {
				type: "boolean",
				defaultValue: false
			},
			/**
			 * ID of the assigned variant management
			 */
			variantBackreference: {
				type: "string"
			},
			/**
			 * Don't show the basic search field
			 */
			hideBasicSearch: {
				type: "boolean"
			},

			/**
			 * Enables the fallback to show all fields of the EntityType as filter fields if com.sap.vocabularies.UI.v1.SelectionFields are not present
			 */
			enableFallback: {
				type: "boolean",
				defaultValue: false
			},

			/**
			 * Handles visibility of the 'Adapt Filters' button on the FilterBar
			 */
			showAdaptFiltersButton: {
				type: "boolean",
				defaultValue: true
			},

			/**
			 * Specifies the personalization options for the filter bar.
			 */
			p13nMode: {
				type: "sap.ui.mdc.FilterBarP13nMode[]",
				defaultValue: "Item,Value"
			},
			propertyInfo: {
				type: "string"
			},
			/**
			 * Specifies the Sematic Date Range option for the filter bar.
			 */
			useSemanticDateRange: {
				type: "boolean",
				defaultValue: true
			},

			/**
			 * If set the search will be automatically triggered, when a filter value was changed.
			 */
			liveMode: {
				type: "boolean",
				defaultValue: false,
				isPublic: true
			},
			/**
			 * Temporary workaround only
			 * path to valuelist
			 */
			_valueList: {
				type: "sap.ui.model.Context",
				required: false
			},
			/**
			 * Temporary workaround only
			 * path to contextPath to be used by child filterfields
			 */
			_internalContextPath: {
				type: "sap.ui.model.Context",
				required: false
			},
			/**
			 * Filter conditions to be applied to the filter bar
			 */
			filterConditions: {
				type: "string",
				required: false
			},
			/**
			 * If set to <code>true</code>, all search requests are ignored. Once it has been set to <code>false</code>,
			 * a search is triggered immediately if one or more search requests have been triggered in the meantime
			 * but were ignored based on the setting.
			 */
			suspendSelection: {
				type: "boolean",
				defaultValue: false
			},
			showDraftEditState: {
				type: "boolean",
				defaultValue: false
			},
			isDraftCollaborative: {
				type: "boolean",
				defaultValue: false
			},
			/**
			 * Id of control that will allow for switching between normal and visual filter
			 */
			toggleControlId: {
				type: "string"
			},
			initialLayout: {
				type: "string",
				defaultValue: "compact"
			}
		},
		events: {
			/**
			 * Event handler to react to the search event of the FilterBar
			 */
			search: {
				type: "function",
				isPublic: true
			},
			/**
			 * Event handler to react to the filterChange event of the FilterBar
			 */
			filterChanged: {
				type: "function",
				isPublic: true
			},
			/**
			 * Event handler to react to the stateChange event of the FilterBar.
			 */
			stateChange: {
				type: "function"
			},
			/**
			 * Event handler to react to the filterChanged event of the FilterBar. Exposes parameters from the MDC filter bar
			 */
			internalFilterChanged: {
				type: "function"
			},
			/**
			 * Event handler to react to the search event of the FilterBar. Exposes parameteres from the MDC filter bar
			 */
			internalSearch: {
				type: "function"
			}
		},
		aggregations: {
			filterFields: {
				type: "sap.fe.macros.FilterField",
				isPublic: true
			}
		}
	},
	_processPropertyInfos: function (oProps: any): void {
		const aParameterFields: any[] = [];
		if (oProps.propertyInfo) {
			const sFetchedProperties = oProps.propertyInfo.replace(/\\{/g, "{").replace(/\\}/g, "}");
			const aFetchedProperties = JSON.parse(sFetchedProperties);
			aFetchedProperties.forEach(function (propInfo: any) {
				if (propInfo.isParameter) {
					aParameterFields.push(propInfo.name);
				}
				if (propInfo.path === "$editState") {
					propInfo.label = ResourceModel.getText("FILTERBAR_EDITING_STATUS");
				}
			});

			oProps.propertyInfo = JSON.stringify(aFetchedProperties).replace(/\{/g, "\\{").replace(/\}/g, "\\}");
		}
		oProps.parameters = JSON.stringify(aParameterFields);
	},
	create: function (oProps: any, oControlConfiguration: any, mSettings: any, oAggregations: any) {
		const oContext = oProps.contextPath;

		if (!oContext) {
			Log.error("Context Path not available for FilterBar Macro.");
			return;
		}

		const oMetaPathContext = oProps.metaPath;
		const sMetaPath = oMetaPathContext && oMetaPathContext.getPath();
		const metaPathParts = sMetaPath.split("/@com.sap.vocabularies.UI.v1.SelectionFields"); // [0]: entityTypePath, [1]: SF Qualifier.
		const entityTypePath: string = metaPathParts[0].endsWith("/") ? metaPathParts[0] : metaPathParts[0] + "/";
		const annotationPath: string = "@com.sap.vocabularies.UI.v1.SelectionFields" + (metaPathParts[1] || "");
		const sEntitySetPath = ModelHelper.getEntitySetPath(entityTypePath);
		const oMetaModel = oContext.getModel();
		const oExtraFilters = this.parseAggregation(oAggregations.filterFields, function (childFilterField: any) {
			const filterFieldKey = childFilterField.getAttribute("key");
			oAggregations[filterFieldKey] = childFilterField;
			return {
				key: filterFieldKey,
				label: childFilterField.getAttribute("label"),
				position: {
					placement: childFilterField.getAttribute("placement"),
					anchor: childFilterField.getAttribute("anchor")
				},
				required: childFilterField.getAttribute("required") === "true",
				type: "Slot"
			};
		});

		oProps._internalContextPath = oMetaModel.createBindingContext(entityTypePath);
		const oVisualizationObjectPath = getInvolvedDataModelObjects(oProps._internalContextPath);
		const sObjectPath = "@com.sap.vocabularies.UI.v1.SelectionFields";
		const oExtraParams: any = {};
		oExtraParams[sObjectPath] = {
			filterFields: oExtraFilters
		};
		const oConverterContext = this.getConverterContext(oVisualizationObjectPath, undefined, mSettings, oExtraParams);
		if (!oProps.propertyInfo) {
			oProps.propertyInfo = getSelectionFields(oConverterContext, [], annotationPath).sPropertyInfo;
		}

		this._processPropertyInfos(oProps);

		//Filter Fields and values to the field are filled based on the selectionFields and this would be empty in case of macro outside the FE template
		if (!oProps.selectionFields) {
			const oSelectionFields = getSelectionFields(oConverterContext, [], annotationPath).selectionFields;
			oProps.selectionFields = new TemplateModel(oSelectionFields, oMetaModel).createBindingContext("/");
			const oEntityType = oConverterContext.getEntityType(),
				oSelectionVariant = getSelectionVariant(oEntityType, oConverterContext),
				oEntitySetContext = oContext.getModel().getContext(sEntitySetPath),
				oFilterConditions = getFilterConditions(oEntitySetContext, { selectionVariant: oSelectionVariant });
			oProps.filterConditions = oFilterConditions;
		}

		// TODO: this could be also moved into a central place
		if (
			oMetaModel.getObject(sEntitySetPath + "@com.sap.vocabularies.Common.v1.DraftRoot") ||
			oMetaModel.getObject(sEntitySetPath + "@com.sap.vocabularies.Common.v1.DraftNode")
		) {
			oProps.showDraftEditState = true;

			if (ModelHelper.isCollaborationDraftSupported(oMetaModel)) {
				oProps.isDraftCollaborative = true;
			}
		}

		if (oProps._applyIdToContent) {
			oProps._apiId = oProps.id + "::FilterBar";
			oProps._contentId = oProps.id;
		} else {
			oProps._apiId = oProps.id;
			oProps._contentId = this.getContentId(oProps.id);
		}

		if (oProps.hideBasicSearch !== "true") {
			const oSearchRestrictionAnnotation = CommonUtils.getSearchRestrictions(sEntitySetPath, oMetaModel);
			oProps.hideBasicSearch = Boolean(oSearchRestrictionAnnotation && !oSearchRestrictionAnnotation.Searchable);
		}
		return oProps;
	}
});
export default FilterBarMetadata;
