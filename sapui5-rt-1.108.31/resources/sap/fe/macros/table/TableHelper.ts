import { CommonAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { PresentationVariantType, UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import Log from "sap/base/Log";
import { getUiControl } from "sap/fe/core/converters/controls/Common/DataVisualization";
import { TemplateType } from "sap/fe/core/converters/ManifestSettings";
import { getInvolvedDataModelObjects } from "sap/fe/core/converters/MetaModelConverter";
import TableFormatter from "sap/fe/core/formatters/TableFormatter";
import * as BindingToolkit from "sap/fe/core/helpers/BindingToolkit";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import FELibrary from "sap/fe/core/library";
import { DataModelObjectPath, getContextRelativeTargetObjectPath, getTargetObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { getEditMode } from "sap/fe/core/templating/UIFormatters";
import CommonHelper from "sap/fe/macros/CommonHelper";
import { formatValueRecursively } from "sap/fe/macros/field/FieldTemplating";
import ActionHelper from "sap/fe/macros/internal/helpers/ActionHelper";
import TableSizeHelper from "sap/fe/macros/table/TableSizeHelper";
import type Table from "sap/ui/mdc/Table";
import type Context from "sap/ui/model/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

const CreationMode = FELibrary.CreationMode;
/**
 * Helper class used by the control library for OData-specific handling (OData V4)
 *
 * @private
 * @experimental This module is only for internal/experimental use!
 */
const TableHelper = {
	/**
	 * Check if a given action is static.
	 *
	 * @param oActionContext The instance of the action
	 * @param sActionName The name of the action
	 * @returns Returns 'true' if action is static, else 'false'
	 * @private
	 * @ui5-restricted
	 */
	_isStaticAction: function (oActionContext: object, sActionName: string | String) {
		let oAction;
		if (oActionContext) {
			if (Array.isArray(oActionContext)) {
				const sEntityType = this._getActionOverloadEntityType(sActionName);
				if (sEntityType) {
					oAction = oActionContext.find(function (action: any) {
						return action.$IsBound && action.$Parameter[0].$Type === sEntityType;
					});
				} else {
					// if this is just one - OK we take it. If it's more it's actually a wrong usage by the app
					// as we used the first one all the time we keep it as it is
					oAction = oActionContext[0];
				}
			} else {
				oAction = oActionContext;
			}
		}

		return !!oAction && oAction.$IsBound && oAction.$Parameter[0].$isCollection;
	},

	/**
	 * Get the entity type of an action overload.
	 *
	 * @param sActionName The name of the action.
	 * @returns The entity type used in the action overload.
	 * @private
	 */
	_getActionOverloadEntityType: function (sActionName: any) {
		if (sActionName && sActionName.indexOf("(") > -1) {
			const aParts = sActionName.split("(");
			return aParts[aParts.length - 1].replaceAll(")", "");
		}
		return undefined;
	},

	/**
	 * Checks whether the action is overloaded on a different entity type.
	 *
	 * @param sActionName The name of the action.
	 * @param sAnnotationTargetEntityType The entity type of the annotation target.
	 * @returns Returns 'true' if the action is overloaded with a different entity type, else 'false'.
	 * @private
	 */
	_isActionOverloadOnDifferentType: function (sActionName: any, sAnnotationTargetEntityType: any) {
		const sEntityType = this._getActionOverloadEntityType(sActionName);
		return !!sEntityType && sAnnotationTargetEntityType !== sEntityType;
	},

	getMessageForDraftValidation: function (oThis: any): string {
		const oCollectionAnnotations = oThis.collection.getObject("./@");
		const sMessagePath = oCollectionAnnotations["@com.sap.vocabularies.Common.v1.Messages"]?.$Path;
		if (
			sMessagePath &&
			oThis.tableDefinition?.getProperty("/template") === TemplateType.ObjectPage &&
			!!Object.keys(oCollectionAnnotations).find((sKey) => {
				const oAnnotation = oCollectionAnnotations[sKey];
				return (
					oAnnotation &&
					oAnnotation.$Type === CommonAnnotationTypes.SideEffectsType &&
					!oAnnotation.SourceProperties &&
					!oAnnotation.SourceEntities &&
					oAnnotation.TargetProperties?.indexOf(sMessagePath) > -1
				);
			})
		) {
			return sMessagePath;
		}
		return "";
	},

	/**
	 * Returns an array of the fields listed by the property RequestAtLeast in the PresentationVariant .
	 *
	 * @param oPresentationVariant The annotation related to com.sap.vocabularies.UI.v1.PresentationVariant.
	 * @returns The fields.
	 * @private
	 * @ui5-restricted
	 */
	getFieldsRequestedByPresentationVariant: function (oPresentationVariant: PresentationVariantType): string[] {
		return oPresentationVariant.RequestAtLeast?.map((oRequested) => oRequested.value) || [];
	},
	getNavigationAvailableFieldsFromLineItem: function (aLineItemContext: Context): string[] {
		const aSelectedFieldsArray: string[] = [];
		((aLineItemContext.getObject() as Array<any>) || []).forEach(function (oRecord: any) {
			if (
				oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" &&
				!oRecord.Inline &&
				!oRecord.Determining &&
				oRecord.NavigationAvailable?.$Path
			) {
				aSelectedFieldsArray.push(oRecord.NavigationAvailable.$Path);
			}
		});
		return aSelectedFieldsArray;
	},

	getNavigationAvailableMap: function (aLineItemCollection: any) {
		const oIBNNavigationAvailableMap: any = {};
		aLineItemCollection.forEach(function (oRecord: any) {
			const sKey = `${oRecord.SemanticObject}-${oRecord.Action}`;
			if (
				oRecord.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" &&
				!oRecord.Inline &&
				oRecord.RequiresContext
			) {
				if (oRecord.NavigationAvailable !== undefined) {
					oIBNNavigationAvailableMap[sKey] = oRecord.NavigationAvailable.$Path
						? oRecord.NavigationAvailable.$Path
						: oRecord.NavigationAvailable;
				}
			}
		});
		return JSON.stringify(oIBNNavigationAvailableMap);
	},

	/**
	 * Return the context of the UI Line Item.
	 *
	 * @param oPresentationContext The context of the presentation (Presentation variant or UI.LineItem)
	 * @returns The context of the UI Line Item
	 */
	getUiLineItem: function (oPresentationContext: Context) {
		return getUiControl(oPresentationContext, "@com.sap.vocabularies.UI.v1.LineItem");
	},

	/**
	 * Creates and returns a select query with the selected fields from the parameters that were passed.
	 *
	 * @param oThis The instance of the inner model of the table building block
	 * @returns The 'select' query that has the selected fields from the parameters that were passed
	 */
	create$Select: function (oThis: any) {
		const oCollectionContext = oThis.collection;
		const aSelectedFields: any[] = [];
		const oLineItemContext = TableHelper.getUiLineItem(oThis.metaPath);
		const sTargetCollectionPath = CommonHelper.getTargetCollection(oCollectionContext);

		function pushField(sField: string) {
			if (sField && !aSelectedFields.includes(sField) && sField.indexOf("/") !== 0) {
				// Do not add singleton property (with absolute path) to $select
				aSelectedFields.push(sField);
			}
		}

		function pushFieldList(aFields: string[]) {
			if (aFields && aFields.length) {
				aFields.forEach(pushField);
			}
		}

		if (
			!oThis.tableDefinition.getObject("enableAnalytics") &&
			oLineItemContext.getPath().indexOf("@com.sap.vocabularies.UI.v1.LineItem") > -1
		) {
			// $select isn't supported by the model in case of an analytical query
			// Don't process EntityType without LineItem (second condition of the if)
			const oPresentationAnnotation = getInvolvedDataModelObjects(oThis.metaPath).targetObject;
			const aOperationAvailableProperties = (oThis.tableDefinition.getObject("operationAvailableProperties") || "").split(",");
			const aApplicableProperties = TableHelper._filterNonApplicableProperties(aOperationAvailableProperties, oCollectionContext);
			const aSemanticKeys: string[] = (
				oCollectionContext.getObject(`${sTargetCollectionPath}/@com.sap.vocabularies.Common.v1.SemanticKey`) || []
			).map((oSemanticKey: any) => oSemanticKey.$PropertyPath as string);

			if (oPresentationAnnotation?.$Type === UIAnnotationTypes.PresentationVariantType) {
				pushFieldList(TableHelper.getFieldsRequestedByPresentationVariant(oPresentationAnnotation));
			}

			pushFieldList(TableHelper.getNavigationAvailableFieldsFromLineItem(oLineItemContext));
			pushFieldList(aApplicableProperties);
			pushFieldList(aSemanticKeys);
			pushField(TableHelper.getMessageForDraftValidation(oThis));
			pushField(
				oCollectionContext.getObject(`${sTargetCollectionPath}@Org.OData.Capabilities.V1.DeleteRestrictions`)?.Deletable?.$Path
			);
			pushField(
				oCollectionContext.getObject(`${sTargetCollectionPath}@Org.OData.Capabilities.V1.UpdateRestrictions`)?.Updatable?.$Path
			);
		}
		return aSelectedFields.join(",");
	},
	/**
	 * Method to get column's width if defined from manifest/customisation by annotations.
	 *
	 * There are issues when the cell in the column is a measure and has a UoM or currency associated to it
	 * In edit mode this results in two fields and that doesn't work very well for the cell and the fields get cut.
	 * So we are currently hardcoding width in several cases in edit mode where there are problems.
	 *
	 *
	 * @function
	 * @name getColumnWidth
	 * @param oThis The instance of the inner model of the table building block
	 * @param oColumn Defined width of the column, which is taken with priority if not null, undefined or empty
	 * @param oAnnotations Annotations of the field
	 * @param sDataFieldType Type of the field
	 * @param sFieldControl Field control value
	 * @param sDataType Datatype of the field
	 * @param nTargetValueVisualization Number for DataFieldForAnnotation Target Value (stars)
	 * @param oDataField Data Field
	 * @param sDataFieldActionText DataField's text from button
	 * @param oDataModelObjectPath The data model object path
	 * @param oMicroChartTitle The object containing title and description of the MicroChart
	 * @returns - Column width if defined, otherwise width is set to auto
	 */
	getColumnWidth: function (
		oThis: any,
		oColumn: any,
		oAnnotations: any,
		sDataFieldType: string,
		sFieldControl: string,
		sDataType: string,
		nTargetValueVisualization: number,
		oDataField: any,
		sDataFieldActionText: string,
		oDataModelObjectPath: DataModelObjectPath,
		oMicroChartTitle?: any
	) {
		let sWidth,
			bHasTextAnnotation = false;
		if (oColumn.width) {
			return oColumn.width;
		} else if (
			oDataModelObjectPath.targetObject.Value &&
			getEditMode(
				oDataModelObjectPath.targetObject.Value.$target,
				oDataModelObjectPath,
				false,
				false,
				oDataModelObjectPath.targetObject
			) === "Display"
		) {
			bHasTextAnnotation = oAnnotations && oAnnotations.hasOwnProperty("@com.sap.vocabularies.Common.v1.Text");
			if (
				sDataType === "Edm.Stream" &&
				!bHasTextAnnotation &&
				oAnnotations.hasOwnProperty("@Org.OData.Core.V1.MediaType") &&
				oAnnotations["@Org.OData.Core.V1.MediaType"].includes("image/")
			) {
				sWidth = "7em";
			}
		} else if (
			oAnnotations &&
			((oAnnotations.hasOwnProperty("@com.sap.vocabularies.UI.v1.IsImageURL") &&
				oAnnotations.hasOwnProperty("@com.sap.vocabularies.UI.v1.IsImageURL") === true) ||
				(oAnnotations.hasOwnProperty("@Org.OData.Core.V1.MediaType") &&
					oAnnotations["@Org.OData.Core.V1.MediaType"].includes("image/")))
		) {
			sWidth = "7em";
		} else if (
			sDataFieldType === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
			sDataFieldType === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" ||
			(sDataFieldType === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" &&
				oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.FieldGroup") === -1)
		) {
			let nTmpTextWidth, nTmpVisualizationWidth;
			// For FieldGroup having action buttons or visualization data points (as rating) on column.
			if (sDataFieldActionText && sDataFieldActionText.length >= oDataField.Label.length) {
				nTmpTextWidth = TableSizeHelper.getButtonWidth(sDataFieldActionText);
			} else if (oDataField) {
				nTmpTextWidth = TableSizeHelper.getButtonWidth(oDataField.Label);
			} else {
				nTmpTextWidth = TableSizeHelper.getButtonWidth(oAnnotations.Label);
			}
			if (nTargetValueVisualization) {
				//Each rating star has a width of 2em
				nTmpVisualizationWidth = nTargetValueVisualization * 2;
			}
			if (nTmpVisualizationWidth && !isNaN(nTmpVisualizationWidth) && nTmpVisualizationWidth > nTmpTextWidth) {
				sWidth = `${nTmpVisualizationWidth}em`;
			} else if (
				sDataFieldActionText ||
				(oAnnotations &&
					(oAnnotations.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" ||
						oAnnotations.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction"))
			) {
				// Add additional 2 em to avoid showing ellipsis in some cases.
				nTmpTextWidth += 2;
				sWidth = `${nTmpTextWidth}em`;
			}
			if (
				oDataField?.Target?.$AnnotationPath &&
				oDataField.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") !== -1
			) {
				let chartSize;
				switch (this.getChartSize(oThis, oColumn)) {
					case "XS":
						chartSize = 5;
						break;
					case "S":
						chartSize = 5.2;
						break;
					case "M":
						chartSize = 6.3;
						break;
					case "L":
						chartSize = 7.9;
						break;
					default:
						chartSize = 6;
				}
				nTmpTextWidth += 2;
				if (
					!this.getShowOnlyChart(oThis, oColumn) &&
					oMicroChartTitle &&
					(oMicroChartTitle.Title.length || oMicroChartTitle.Description.length)
				) {
					const tmpText =
						oMicroChartTitle.Title.length > oMicroChartTitle.Description.length
							? oMicroChartTitle.Title
							: oMicroChartTitle.Description;
					const titleSize = TableSizeHelper.getButtonWidth(tmpText) + 7;
					const tmpWidth = titleSize > nTmpTextWidth ? titleSize : nTmpTextWidth;
					sWidth = `${tmpWidth}em`;
				} else if (nTmpTextWidth > chartSize) {
					sWidth = `${nTmpTextWidth}em`;
				} else {
					sWidth = `${chartSize}em`;
				}
			}
		}
		if (sWidth) {
			return sWidth;
		}
	},
	/**
	 * Method to add a margin class at the control.
	 *
	 * @function
	 * @name getMarginClass
	 * @param oCollection Title of the DataPoint
	 * @param oDataField Value of the DataPoint
	 * @param sVisualization
	 * @param sFieldGroupHiddenExpressions Hidden expression contained in FieldGroup
	 * @returns Adjusting the margin
	 */
	getMarginClass: function (oCollection: any, oDataField: any, sVisualization: any, sFieldGroupHiddenExpressions: any) {
		let sBindingExpression,
			sClass = "";
		if (JSON.stringify(oCollection[oCollection.length - 1]) == JSON.stringify(oDataField)) {
			//If rating indicator is last element in fieldgroup, then the 0.5rem margin added by sapMRI class of interactive rating indicator on top and bottom must be nullified.
			if (sVisualization == "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
				sClass = "sapUiNoMarginBottom sapUiNoMarginTop";
			}
		} else if (sVisualization === "com.sap.vocabularies.UI.v1.VisualizationType/Rating") {
			//If rating indicator is NOT the last element in fieldgroup, then to maintain the 0.5rem spacing between cogetMarginClassntrols (as per UX spec),
			//only the top margin added by sapMRI class of interactive rating indicator must be nullified.

			sClass = "sapUiNoMarginTop";
		} else {
			sClass = "sapUiTinyMarginBottom";
		}

		if (sFieldGroupHiddenExpressions && sFieldGroupHiddenExpressions !== "true" && sFieldGroupHiddenExpressions !== "false") {
			const sHiddenExpressionResult = sFieldGroupHiddenExpressions.substring(
				sFieldGroupHiddenExpressions.indexOf("{=") + 2,
				sFieldGroupHiddenExpressions.lastIndexOf("}")
			);
			sBindingExpression = "{= " + sHiddenExpressionResult + " ? '" + sClass + "' : " + "''" + " }";
			return sBindingExpression;
		} else {
			return sClass;
		}
	},

	getVBoxVisibility: function (oCollection: any[], fieldGroupHiddenExpressions: any) {
		let bAllStatic = true;
		let bDynamicExpressionsInFields = false;
		const aHiddenPaths = [];
		for (let i = 0; i < oCollection.length; i++) {
			const hiddenAnnotationValue = oCollection[i]["@com.sap.vocabularies.UI.v1.Hidden"];
			if (hiddenAnnotationValue !== undefined && hiddenAnnotationValue !== false) {
				if (hiddenAnnotationValue !== true) {
					if (hiddenAnnotationValue.$Path) {
						aHiddenPaths.push(hiddenAnnotationValue.$Path);
						bAllStatic = false;
					} else if (typeof hiddenAnnotationValue === "object") {
						// Dynamic expression found in a field
						bDynamicExpressionsInFields = true;
						break;
					}
				} else {
					aHiddenPaths.push(hiddenAnnotationValue);
				}
			} else {
				aHiddenPaths.push(false);
			}
		}
		if (!bDynamicExpressionsInFields && aHiddenPaths.length > 0 && bAllStatic !== true) {
			const params = aHiddenPaths.map((hiddenPath) => {
				if (typeof hiddenPath === "boolean") {
					return hiddenPath;
				} else {
					return BindingToolkit.pathInModel(hiddenPath);
				}
			});

			return BindingToolkit.compileExpression(BindingToolkit.formatResult(params, TableFormatter.getVBoxVisibility));
		} else if (bDynamicExpressionsInFields) {
			return fieldGroupHiddenExpressions;
		} else if (aHiddenPaths.length > 0 && aHiddenPaths.indexOf(false) === -1 && bAllStatic) {
			return false;
		} else {
			return true;
		}
	},

	/**
	 * Method to provide hidden filters to the table.
	 *
	 * @function
	 * @name formatHiddenFilters
	 * @param oHiddenFilter The hiddenFilters via context named filters (and key hiddenFilters) passed to Macro Table
	 * @returns The string representation of the hidden filters
	 */
	formatHiddenFilters: function (oHiddenFilter: string) {
		if (oHiddenFilter) {
			try {
				return JSON.stringify(oHiddenFilter);
			} catch (ex) {
				return undefined;
			}
		}
		return undefined;
	},

	/**
	 * Method to get the stable ID of the column.
	 *
	 * @function
	 * @name getColumnStableId
	 * @param sId Current object ID
	 * @param oDataField Value of the DataPoint
	 * @returns The stable ID for a given column
	 */
	getColumnStableId: function (sId: string, oDataField: any) {
		return sId
			? generate([
					sId,
					"C",
					(oDataField.Target && oDataField.Target.$AnnotationPath) ||
						(oDataField.Value && oDataField.Value.$Path) ||
						(oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" ||
						oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction"
							? oDataField
							: "")
			  ])
			: undefined;
	},

	getFieldGroupLabelStableId: function (sId: string, oDataField: any) {
		return sId
			? generate([
					sId,
					"FGLabel",
					(oDataField.Target && oDataField.Target.$AnnotationPath) ||
						(oDataField.Value && oDataField.Value.$Path) ||
						(oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation" ||
						oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction"
							? oDataField
							: "")
			  ])
			: undefined;
	},

	/**
	 * Method filters out properties which do not belong to the collection.
	 *
	 * @param aPropertyPaths The array of properties to be checked.
	 * @param oCollectionContext The collection context to be used.
	 * @returns The array of applicable properties.
	 * @private
	 */
	_filterNonApplicableProperties: function (aPropertyPaths: any[], oCollectionContext: Context) {
		return (
			aPropertyPaths &&
			aPropertyPaths.filter(function (sPropertyPath: any) {
				return oCollectionContext.getObject(`./${sPropertyPath}`);
			})
		);
	},
	/**
	 * Method to generate the binding information for a table row.
	 *
	 * @param oThis The instance of the inner model of the table building block
	 * @returns - Returns the binding information of a table row
	 */
	getRowsBindingInfo: function (oThis: any) {
		const dataModelPath = getInvolvedDataModelObjects(oThis.collection, oThis.contextPath);
		const path = getContextRelativeTargetObjectPath(dataModelPath) || getTargetObjectPath(dataModelPath);
		const oRowBinding = {
			ui5object: true,
			suspended: false,
			path: CommonHelper.addSingleQuotes(path),
			parameters: {
				$count: true
			} as any,
			events: {} as any
		};

		if (!oThis.tableDefinition.getObject("enableAnalytics")) {
			// Don't add $select parameter in case of an analytical query, this isn't supported by the model
			const sSelect = TableHelper.create$Select(oThis);
			if (sSelect) {
				oRowBinding.parameters.$select = `'${sSelect}'`;
			}

			// we later ensure in the delegate only one list binding for a given targetCollectionPath has the flag $$getKeepAliveContext
			oRowBinding.parameters.$$getKeepAliveContext = true;
		}

		oRowBinding.parameters.$$groupId = CommonHelper.addSingleQuotes("$auto.Workers");
		oRowBinding.parameters.$$updateGroupId = CommonHelper.addSingleQuotes("$auto");
		oRowBinding.parameters.$$ownRequest = true;
		oRowBinding.parameters.$$patchWithoutSideEffects = true;

		oRowBinding.events.patchSent = CommonHelper.addSingleQuotes(".editFlow.handlePatchSent");
		oRowBinding.events.dataReceived = CommonHelper.addSingleQuotes("API.onInternalDataReceived");
		oRowBinding.events.dataRequested = CommonHelper.addSingleQuotes("API.onInternalDataRequested");
		// recreate an empty row when one is activated
		oRowBinding.events.createActivate = CommonHelper.addSingleQuotes(".editFlow.handleCreateActivate");

		if (oThis.onContextChange !== undefined && oThis.onContextChange !== null) {
			oRowBinding.events.change = CommonHelper.addSingleQuotes(oThis.onContextChange);
		}
		return CommonHelper.objectToString(oRowBinding);
	},
	/**
	 * Method to check the validity of the fields in the creation row.
	 *
	 * @function
	 * @name validateCreationRowFields
	 * @param oFieldValidityObject Current Object holding the fields
	 * @returns `true` if all the fields in the creation row are valid, `false` otherwise
	 */
	validateCreationRowFields: function (oFieldValidityObject: any) {
		if (!oFieldValidityObject) {
			return false;
		}
		return (
			Object.keys(oFieldValidityObject).length > 0 &&
			Object.keys(oFieldValidityObject).every(function (key: string) {
				return oFieldValidityObject[key]["validity"];
			})
		);
	},
	/**
	 * Method to get the expression for the 'press' event for the DataFieldForActionButton.
	 *
	 * @function
	 * @name pressEventDataFieldForActionButton
	 * @param oThis Current object
	 * @param oDataField Value of the DataPoint
	 * @param sEntitySetName Name of the EntitySet
	 * @param sOperationAvailableMap OperationAvailableMap as stringified JSON object
	 * @param oActionContext Action object
	 * @param bIsNavigable Action either triggers navigation or not
	 * @param bEnableAutoScroll Action either triggers scrolling to the newly created items in the related table or not
	 * @param sDefaultValuesExtensionFunction Function name to prefill dialog parameters
	 * @returns The binding expression
	 */
	pressEventDataFieldForActionButton: function (
		oThis: any,
		oDataField: any,
		sEntitySetName: string,
		sOperationAvailableMap: string,
		oActionContext: object,
		bIsNavigable: any,
		bEnableAutoScroll: any,
		sDefaultValuesExtensionFunction: string
	) {
		const sActionName = oDataField.Action,
			sAnnotationTargetEntityType = oThis && oThis.collection.getObject("$Type"),
			bStaticAction =
				this._isStaticAction(oActionContext, sActionName) ||
				this._isActionOverloadOnDifferentType(sActionName, sAnnotationTargetEntityType),
			oParams = {
				contexts: !bStaticAction ? "${internal>selectedContexts}" : null,
				bStaticAction: bStaticAction ? bStaticAction : undefined,
				entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
				applicableContext: !bStaticAction ? "${internal>dynamicActions/" + oDataField.Action + "/aApplicable/}" : null,
				notApplicableContext: !bStaticAction ? "${internal>dynamicActions/" + oDataField.Action + "/aNotApplicable/}" : null,
				isNavigable: bIsNavigable,
				enableAutoScroll: bEnableAutoScroll,
				defaultValuesExtensionFunction: sDefaultValuesExtensionFunction ? "'" + sDefaultValuesExtensionFunction + "'" : undefined
			};

		return ActionHelper.getPressEventDataFieldForActionButton(oThis.id, oDataField, oParams, sOperationAvailableMap);
	},
	/**
	 * Method to determine the binding expression for 'enabled' property of DataFieldForAction and DataFieldForIBN actions.
	 *
	 * @function
	 * @name isDataFieldForActionEnabled
	 * @param oThis The instance of the table control
	 * @param oDataField The value of the data field
	 * @param oRequiresContext RequiresContext for IBN
	 * @param bIsDataFieldForIBN Flag for IBN
	 * @param oActionContext The instance of the action
	 * @param vActionEnabled Status of action (single or multiselect)
	 * @returns A binding expression to define the 'enabled' property of the action
	 */
	isDataFieldForActionEnabled: function (
		oThis: any,
		oDataField: any,
		oRequiresContext: object,
		bIsDataFieldForIBN: boolean,
		oActionContext: object,
		vActionEnabled: string
	) {
		const sActionName = oDataField.Action,
			sAnnotationTargetEntityType = oThis && oThis.collection.getObject("$Type"),
			oTableDefinition = oThis && oThis.tableDefinition && oThis.tableDefinition.getObject(),
			bStaticAction = this._isStaticAction(oActionContext, sActionName),
			isAnalyticalTable = oTableDefinition && oTableDefinition.enableAnalytics;

		// Check for action overload on a different Entity type.
		// If yes, table row selection is not required to enable this action.
		if (!bIsDataFieldForIBN && this._isActionOverloadOnDifferentType(sActionName, sAnnotationTargetEntityType)) {
			// Action overload defined on different entity type
			const oOperationAvailableMap = oTableDefinition && JSON.parse(oTableDefinition.operationAvailableMap);
			if (oOperationAvailableMap && oOperationAvailableMap.hasOwnProperty(sActionName)) {
				// Core.OperationAvailable annotation defined for the action.
				// Need to refer to internal model for enabled property of the dynamic action.
				// return compileBinding(bindingExpression("dynamicActions/" + sActionName + "/bEnabled", "internal"), true);
				return "{= ${internal>dynamicActions/" + sActionName + "/bEnabled} }";
			}
			// Consider the action just like any other static DataFieldForAction.
			return true;
		}
		if (!oRequiresContext || bStaticAction) {
			if (bIsDataFieldForIBN) {
				const sEntitySet = oThis.collection.getPath();
				const oMetaModel = oThis.collection.getModel();
				if (vActionEnabled === "false" && !isAnalyticalTable) {
					Log.warning("NavigationAvailable as false is incorrect usage");
					return false;
				} else if (
					!isAnalyticalTable &&
					oDataField &&
					oDataField.NavigationAvailable &&
					oDataField.NavigationAvailable.$Path &&
					oMetaModel.getObject(sEntitySet + "/$Partner") === oDataField.NavigationAvailable.$Path.split("/")[0]
				) {
					return "{= ${" + vActionEnabled.substr(vActionEnabled.indexOf("/") + 1, vActionEnabled.length) + "}";
				} else {
					return true;
				}
			}
			return true;
		}

		let sDataFieldForActionEnabledExpression = "",
			sNumberOfSelectedContexts,
			sAction;
		if (bIsDataFieldForIBN) {
			if (vActionEnabled === "true" || isAnalyticalTable) {
				sDataFieldForActionEnabledExpression = "%{internal>numberOfSelectedContexts} >= 1";
			} else if (vActionEnabled === "false") {
				Log.warning("NavigationAvailable as false is incorrect usage");
				return false;
			} else {
				sNumberOfSelectedContexts = "%{internal>numberOfSelectedContexts} >= 1";
				sAction = "${internal>ibn/" + oDataField.SemanticObject + "-" + oDataField.Action + "/bEnabled" + "}";
				sDataFieldForActionEnabledExpression = sNumberOfSelectedContexts + " && " + sAction;
			}
		} else {
			sNumberOfSelectedContexts = ActionHelper.getNumberOfContextsExpression(vActionEnabled);
			sAction = "${internal>dynamicActions/" + oDataField.Action + "/bEnabled" + "}";
			sDataFieldForActionEnabledExpression = sNumberOfSelectedContexts + " && " + sAction;
		}
		return "{= " + sDataFieldForActionEnabledExpression + "}";
	},
	/**
	 * Method to get press event expression for CreateButton.
	 *
	 * @function
	 * @name pressEventForCreateButton
	 * @param oThis Current Object
	 * @param bCmdExecutionFlag Flag to indicate that the function is called from CMD Execution
	 * @returns The binding expression for the press event of the create button
	 */
	pressEventForCreateButton: function (oThis: any, bCmdExecutionFlag: boolean) {
		const sCreationMode = oThis.creationMode;
		let oParams: any;
		const sMdcTable = bCmdExecutionFlag ? "${$source>}.getParent()" : "${$source>}.getParent().getParent().getParent()";
		let sRowBinding = sMdcTable + ".getRowBinding() || " + sMdcTable + ".data('rowsBindingInfo').path";

		switch (sCreationMode) {
			case CreationMode.External:
				// navigate to external target for creating new entries
				// TODO: Add required parameters
				oParams = {
					creationMode: CommonHelper.addSingleQuotes(CreationMode.External),
					outbound: CommonHelper.addSingleQuotes(oThis.createOutbound)
				};
				break;

			case CreationMode.CreationRow:
				oParams = {
					creationMode: CommonHelper.addSingleQuotes(CreationMode.CreationRow),
					creationRow: "${$source>}",
					createAtEnd: oThis.createAtEnd !== undefined ? oThis.createAtEnd : false
				};

				sRowBinding = "${$source>}.getParent()._getRowBinding()";
				break;

			case CreationMode.NewPage:
			case CreationMode.Inline:
				oParams = {
					creationMode: CommonHelper.addSingleQuotes(sCreationMode),
					createAtEnd: oThis.createAtEnd !== undefined ? oThis.createAtEnd : false,
					tableId: CommonHelper.addSingleQuotes(oThis.id)
				};

				if (oThis.createNewAction) {
					oParams.newAction = CommonHelper.addSingleQuotes(oThis.createNewAction);
				}
				break;

			case CreationMode.InlineCreationRows:
				return CommonHelper.generateFunction("._editFlow.scrollAndFocusOnInactiveRow", sMdcTable);
			default:
				// unsupported
				return undefined;
		}
		return CommonHelper.generateFunction(".editFlow.createDocument", sRowBinding, CommonHelper.objectToString(oParams));
	},

	getIBNData: function (oThis: any) {
		const outboundDetail = oThis.createOutboundDetail;
		if (outboundDetail) {
			const oIBNData = {
				semanticObject: CommonHelper.addSingleQuotes(outboundDetail.semanticObject),
				action: CommonHelper.addSingleQuotes(outboundDetail.action)
			};
			return CommonHelper.objectToString(oIBNData);
		}
	},
	/**
	 * Method to get press event expression for 'Delete' button.
	 *
	 * @function
	 * @name pressEventForDeleteButton
	 * @param oThis Current Object
	 * @param sEntitySetName EntitySet name
	 * @param oHeaderInfo Header Info
	 * @param fullcontextPath Context Path
	 * @returns The binding expression for the press event of the 'Delete' button
	 */
	pressEventForDeleteButton: function (oThis: any, sEntitySetName: string, oHeaderInfo: any, fullcontextPath: any) {
		const sDeletableContexts = "${internal>deletableContexts}";
		let sTitle, titleValueExpression, sTitleExpression, sDescription, descriptionExpression, sDescriptionExpression;
		if (oHeaderInfo?.Title) {
			if (typeof oHeaderInfo.Title.Value === "string") {
				sTitleExpression = CommonHelper.addSingleQuotes(oHeaderInfo.Title.Value);
			} else {
				sTitle = BindingToolkit.getExpressionFromAnnotation(oHeaderInfo?.Title?.Value);
				if (BindingToolkit.isConstant(sTitle) || BindingToolkit.isPathInModelExpression(sTitle)) {
					titleValueExpression = formatValueRecursively(sTitle, fullcontextPath);
					sTitleExpression = BindingToolkit.compileExpression(titleValueExpression);
				}
			}
		}
		if (oHeaderInfo?.Description) {
			if (typeof oHeaderInfo.Description.Value === "string") {
				sDescriptionExpression = CommonHelper.addSingleQuotes(oHeaderInfo.Description.Value);
			} else {
				sDescription = BindingToolkit.getExpressionFromAnnotation(oHeaderInfo?.Description?.Value);
				if (BindingToolkit.isConstant(sDescription) || BindingToolkit.isPathInModelExpression(sDescription)) {
					descriptionExpression = formatValueRecursively(sDescription, fullcontextPath);
					sDescriptionExpression = BindingToolkit.compileExpression(descriptionExpression);
				}
			}
		}
		const oParams = {
			id: CommonHelper.addSingleQuotes(oThis.id),
			entitySetName: CommonHelper.addSingleQuotes(sEntitySetName),
			numberOfSelectedContexts: "${internal>selectedContexts}.length",
			unSavedContexts: "${internal>unSavedContexts}",
			lockedContexts: "${internal>lockedContexts}",
			controlId: "${internal>controlId}",
			title: sTitleExpression,
			description: sDescriptionExpression
		};

		return CommonHelper.generateFunction(".editFlow.deleteMultipleDocuments", sDeletableContexts, CommonHelper.objectToString(oParams));
	},
	/**
	 * Method to handle the 'enable' and 'disable' state of the table's 'Delete' button if this information is requested in the side effects.
	 *
	 * @function
	 * @name handleTableDeleteEnablementForSideEffects
	 * @param oTable Table instance
	 * @param oInternalModelContext The internal model context
	 */
	handleTableDeleteEnablementForSideEffects: function (oTable: Table, oInternalModelContext: InternalModelContext) {
		if (oTable && oInternalModelContext) {
			const sDeletablePath = TableHelper.getDeletablePathForTable(oTable),
				aSelectedContexts = (oTable as any).getSelectedContexts(),
				aDeletableContexts = [];

			oInternalModelContext.setProperty("deleteEnabled", false);
			for (let i = 0; i < aSelectedContexts.length; i++) {
				if (typeof sDeletablePath === "string" && sDeletablePath !== undefined) {
					const oSelectedContext = aSelectedContexts[i];
					if (oSelectedContext && oSelectedContext.getProperty(sDeletablePath)) {
						oInternalModelContext.setProperty("deleteEnabled", true);
						aDeletableContexts.push(oSelectedContext);
					}
				}
			}

			oInternalModelContext.setProperty("deletableContexts", aDeletableContexts);
		}
	},

	/**
	 * Method to get the delete restricitions Path associated.
	 *
	 * @function
	 * @name getDeletablePathForTable
	 * @param table Table instance
	 * @returns Path associated with delete's enable and disable
	 */
	getDeletablePathForTable: function (table: Table): string | undefined {
		let deletablePath: string | undefined;
		const rowBinding = table.getRowBinding();

		if (rowBinding) {
			const metaModel = table.getModel().getMetaModel() as ODataMetaModel;
			let path = rowBinding.getPath();
			const contextPath = rowBinding.getContext()?.getPath();
			if (contextPath) {
				const metaPath = metaModel.getMetaPath(contextPath);
				const navigationPropertyPath = metaModel.getObject(metaPath)?.["$NavigationPropertyBinding"]?.[path];
				if (navigationPropertyPath !== undefined) {
					path = `/${navigationPropertyPath}`;
				}
			}
			deletablePath = metaModel.getObject(`${path}@Org.OData.Capabilities.V1.DeleteRestrictions/Deletable`)?.$Path;
		}

		return deletablePath;
	},

	/**
	 * Method to set visibility of column header label.
	 *
	 * @function
	 * @name setHeaderLabelVisibility
	 * @param datafield DataField
	 * @param dataFieldCollection List of items inside a fieldgroup (if any)
	 * @returns `true` if the header label needs to be visible else false.
	 */
	setHeaderLabelVisibility: function (datafield: any, dataFieldCollection: any[]) {
		// If Inline button/navigation action, return false, else true;
		if (!dataFieldCollection) {
			if (datafield.$Type.indexOf("DataFieldForAction") > -1 && datafield.Inline) {
				return false;
			}
			if (datafield.$Type.indexOf("DataFieldForIntentBasedNavigation") > -1 && datafield.Inline) {
				return false;
			}
			return true;
		}

		// In Fieldgroup, If NOT all datafield/datafieldForAnnotation exists with hidden, return true;
		return dataFieldCollection.some(function (oDC: any) {
			if (
				(oDC.$Type === "com.sap.vocabularies.UI.v1.DataField" ||
					oDC.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") &&
				oDC["@com.sap.vocabularies.UI.v1.Hidden"] !== true
			) {
				return true;
			}
		});
	},

	/**
	 * Method to get Target Value (# of stars) from Visualization Rating.
	 *
	 * @function
	 * @name getValueOnRatingField
	 * @param oDataField DataPoint's Value
	 * @param oContext Context object of the LineItem
	 * @returns The number for DataFieldForAnnotation Target Value
	 */
	getValueOnRatingField: function (oDataField: any, oContext: any) {
		// for FieldGroup containing visualizationTypeRating
		if (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation") {
			// For a data field having Rating as visualization type
			if (
				oContext.context.getObject("Target/$AnnotationPath").indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 &&
				oContext.context.getObject("Target/$AnnotationPath/$Type") == "com.sap.vocabularies.UI.v1.DataPointType" &&
				oContext.context.getObject("Target/$AnnotationPath/Visualization/$EnumMember") ==
					"com.sap.vocabularies.UI.v1.VisualizationType/Rating"
			) {
				return oContext.context.getObject("Target/$AnnotationPath/TargetValue");
			}
			// for FieldGroup having Rating as visualization type in any of the data fields
			if (oContext.context.getObject("Target/$AnnotationPath").indexOf("@com.sap.vocabularies.UI.v1.FieldGroup") > -1) {
				const sPathDataFields = "Target/$AnnotationPath/Data/";
				for (const i in oContext.context.getObject(sPathDataFields)) {
					if (
						oContext.context.getObject(`${sPathDataFields + i}/$Type`) ===
							"com.sap.vocabularies.UI.v1.DataFieldForAnnotation" &&
						oContext.context
							.getObject(`${sPathDataFields + i}/Target/$AnnotationPath`)
							.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 &&
						oContext.context.getObject(`${sPathDataFields + i}/Target/$AnnotationPath/$Type`) ==
							"com.sap.vocabularies.UI.v1.DataPointType" &&
						oContext.context.getObject(`${sPathDataFields + i}/Target/$AnnotationPath/Visualization/$EnumMember`) ==
							"com.sap.vocabularies.UI.v1.VisualizationType/Rating"
					) {
						return oContext.context.getObject(`${sPathDataFields + i}/Target/$AnnotationPath/TargetValue`);
					}
				}
			}
		}
	},
	/**
	 * Method to get Text from DataFieldForAnnotation into Column.
	 *
	 * @function
	 * @name getTextOnActionField
	 * @param oDataField DataPoint's Value
	 * @param oContext Context object of the LineItem
	 * @returns String from label referring to action text
	 */
	getTextOnActionField: function (oDataField: any, oContext: any) {
		if (
			oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
			oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"
		) {
			return oDataField.Label;
		}
		// for FieldGroup containing DataFieldForAnnotation
		if (
			oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAnnotation" &&
			oContext.context.getObject("Target/$AnnotationPath").indexOf("@com.sap.vocabularies.UI.v1.FieldGroup") > -1
		) {
			const sPathDataFields = "Target/$AnnotationPath/Data/";
			const aMultipleLabels = [];
			for (const i in oContext.context.getObject(sPathDataFields)) {
				if (
					oContext.context.getObject(`${sPathDataFields + i}/$Type`) === "com.sap.vocabularies.UI.v1.DataFieldForAction" ||
					oContext.context.getObject(`${sPathDataFields + i}/$Type`) ===
						"com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation"
				) {
					aMultipleLabels.push(oContext.context.getObject(`${sPathDataFields + i}/Label`));
				}
			}
			// In case there are multiple actions inside a Field Group select the largest Action Label
			if (aMultipleLabels.length > 1) {
				return aMultipleLabels.reduce(function (a: any, b: any) {
					return a.length > b.length ? a : b;
				});
			} else {
				return aMultipleLabels.length === 0 ? undefined : aMultipleLabels.toString();
			}
		}
	},
	_getResponsiveTableColumnSettings: function (oThis: any, oColumn: any) {
		if (oThis.tableType === "ResponsiveTable") {
			return oColumn.settings;
		}
		return null;
	},

	getChartSize: function (oThis: any, oColumn: any) {
		const settings = this._getResponsiveTableColumnSettings(oThis, oColumn);
		if (settings && settings.microChartSize) {
			return settings.microChartSize;
		}
		return "XS";
	},
	getShowOnlyChart: function (oThis: any, oColumn: any) {
		const settings = this._getResponsiveTableColumnSettings(oThis, oColumn);
		if (settings && settings.showMicroChartLabel) {
			return !settings.showMicroChartLabel;
		}
		return true;
	},
	getDelegate: function (bEnableAnalytics: any, bHasMultiVisualizations: any, sEntityName: any) {
		let oDelegate;
		if (bHasMultiVisualizations === "true") {
			oDelegate = {
				name: bEnableAnalytics
					? "sap/fe/macros/table/delegates/AnalyticalALPTableDelegate"
					: "sap/fe/macros/table/delegates/ALPTableDelegate",
				payload: {
					collectionName: sEntityName
				}
			};
		} else {
			oDelegate = {
				name: bEnableAnalytics
					? "sap/fe/macros/table/delegates/AnalyticalTableDelegate"
					: "sap/fe/macros/table/delegates/TableDelegate"
			};
		}

		return JSON.stringify(oDelegate);
	},
	setIBNEnablement: function (oInternalModelContext: any, oNavigationAvailableMap: any, aSelectedContexts: any) {
		for (const sKey in oNavigationAvailableMap) {
			oInternalModelContext.setProperty(`ibn/${sKey}`, {
				bEnabled: false,
				aApplicable: [],
				aNotApplicable: []
			});
			const aApplicable = [],
				aNotApplicable = [];
			const sProperty = oNavigationAvailableMap[sKey];
			for (let i = 0; i < aSelectedContexts.length; i++) {
				const oSelectedContext = aSelectedContexts[i];
				if (oSelectedContext.getObject(sProperty)) {
					oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/bEnabled`, true);
					aApplicable.push(oSelectedContext);
				} else {
					aNotApplicable.push(oSelectedContext);
				}
			}
			oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/aApplicable`, aApplicable);
			oInternalModelContext.getModel().setProperty(`${oInternalModelContext.getPath()}/ibn/${sKey}/aNotApplicable`, aNotApplicable);
		}
	}
};
(TableHelper.getNavigationAvailableMap as any).requiresIContext = true;
(TableHelper.getValueOnRatingField as any).requiresIContext = true;
(TableHelper.getTextOnActionField as any).requiresIContext = true;

export default TableHelper;
