import type { EntitySet, Property } from "@sap-ux/vocabularies-types";
import { SemanticObject } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { UIAnnotationTypes } from "@sap-ux/vocabularies-types/vocabularies/UI";
import CommonUtils from "sap/fe/core/CommonUtils";
import { Entity } from "sap/fe/core/converters/helpers/BindingHelper";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import * as CollaborationFormatters from "sap/fe/core/formatters/CollaborationFormatter";
import valueFormatters from "sap/fe/core/formatters/ValueFormatter";
import {
	and,
	BindingToolkitExpression,
	CompiledBindingToolkitExpression,
	compileExpression,
	constant,
	formatResult,
	getExpressionFromAnnotation,
	ifElse,
	not,
	pathInModel
} from "sap/fe/core/helpers/BindingToolkit";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import TemplateModel from "sap/fe/core/TemplateModel";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import {
	enhanceDataModelPath,
	getContextRelativeTargetObjectPath,
	getRelativePaths,
	getTargetObjectPath
} from "sap/fe/core/templating/DataModelPathHelper";
import { isSemanticKey } from "sap/fe/core/templating/PropertyHelper";
import type { DisplayMode } from "sap/fe/core/templating/UIFormatters";
import * as UIFormatters from "sap/fe/core/templating/UIFormatters";
import * as FieldTemplating from "sap/fe/macros/field/FieldTemplating";
import MacroMetadata from "sap/fe/macros/MacroMetadata";
import SituationsIndicator from "sap/fe/macros/situations/SituationsIndicator.fragment";

type DisplayStyle =
	| "Text"
	| "Avatar"
	| "File"
	| "DataPoint"
	| "Contact"
	| "Button"
	| "Link"
	| "ObjectStatus"
	| "AmountWithCurrency"
	| "SemanticKeyWithDraftIndicator"
	| "ObjectIdentifier"
	| "LabelSemanticKey"
	| "LinkWithQuickViewForm"
	| "LinkWrapper"
	| "ExpandableText";

type EditStyle =
	| "InputWithValueHelp"
	| "TextArea"
	| "File"
	| "DatePicker"
	| "TimePicker"
	| "DateTimePicker"
	| "CheckBox"
	| "InputWithUnit"
	| "Input"
	| "RatingIndicator";

type FieldFormatOptions = Partial<{
	containsErrorVisibility: string;
	displayMode: DisplayMode;
	fieldMode: string;
	hasDraftIndicator: boolean;
	isAnalytics: boolean;
	ignoreNavigationAvailable: boolean;
	isCurrencyAligned: boolean;
	measureDisplayMode: string;
	retrieveTextFromValueList: boolean;
	semantickeys: string[];
	semanticKeyStyle: string;
	showEmptyIndicator: boolean;
	showIconUrl: boolean;
	textAlignMode: string;
	textLinesEdit: string;
	textMaxLines: string;
	compactSemanticKey: string;
	fieldGroupDraftIndicatorPropertyPath: string;
	fieldGroupName: string;
}>;

export type FieldProperties = {
	dataField: any;
	editMode?: any;
	entitySet: any;
	entityType?: any;
	parentEntitySet?: any;
	formatOptions: FieldFormatOptions;
	idPrefix?: string;
	semanticObject?: string | SemanticObject;
	vhIdPrefix?: string;
	_apiId?: string;

	// computed properties
	hasSituationsIndicator: boolean;
	collaborationColorExpression?: string;
	collaborationEnabled?: boolean;
	collaborationHasActivityExpression?: string;
	collaborationInitialsExpression?: string;
	dataSourcePath?: string;
	descriptionBindingExpression?: string;
	displayStyle: DisplayStyle;
	displayVisible?: string;
	editableExpression?: string;
	editModeAsObject?: any;
	editStyle?: EditStyle | null;
	enabledExpression?: CompiledBindingToolkitExpression;
	emptyIndicatorMode?: "On";
	fieldWrapperId?: string;
	hasQuickViewFacets?: boolean;
	noWrapperId?: string;
	navigationAvailable?: boolean | string;
	requiredExpression?: CompiledBindingToolkitExpression;
	showTimezone?: boolean;
	semanticObjects?: string;
	text?: string | BindingToolkitExpression<string> | CompiledBindingToolkitExpression;
	identifierTitle?: string | BindingToolkitExpression<string> | CompiledBindingToolkitExpression;
	identifierText?: string | BindingToolkitExpression<string> | CompiledBindingToolkitExpression;
	textBindingExpression?: CompiledBindingToolkitExpression;
	unitBindingExpression?: string;
	unitEditable?: string;
	valueBindingExpression?: CompiledBindingToolkitExpression;
	valueAsStringBindingExpression?: CompiledBindingToolkitExpression;
	_flexId?: string;
	_vhFlexId?: string;
	visible?: string;
	hasSemanticObjectOnNavigation?: boolean;
	linkUrl: CompiledBindingToolkitExpression;
};

type FieldType = {
	oProps: FieldProperties;
	getContentId: (sID: string) => string;
	setUpDisplayStyle: (oProps: FieldProperties, oDataField: any, oDataModelPath: DataModelObjectPath) => void;
	setUpEditStyle: (oProps: FieldProperties, oDataField: any, oDataModelPath: DataModelObjectPath) => void;
	getOverrides: (mControlConfiguration: any, sID: string) => { [index: string]: any };
	setUpEditableProperties: (oProps: FieldProperties, oDataField: any, oDataModelPath: DataModelObjectPath, oMetaModel: any) => void;
	setUpFormatOptions: (oProps: FieldProperties, oDataModelPath: DataModelObjectPath, oControlConfiguration: any, mSettings: any) => void;
	setUpSemanticObjects: (oProps: FieldProperties, oDataModelPath: DataModelObjectPath) => void;
	setUpNavigationAvailable: (oProps: FieldProperties, oDataField: any) => void;
	setUpDataPointType: (oDataField: any) => void;
	_getTargetValueDataModelPath: (oDataField: any, oDataModelPath: DataModelObjectPath) => DataModelObjectPath;
	getTextWithWhiteSpace: (formatOptions: FieldFormatOptions, oDataModelPath: DataModelObjectPath) => string;
	getObjectIdentifierTitle: (
		fieldFormatOptions: FieldFormatOptions,
		oPropertyDataModelObjectPath: DataModelObjectPath
	) => BindingToolkitExpression<string> | CompiledBindingToolkitExpression;
	getObjectIdentifierText: (
		fieldFormatOptions: FieldFormatOptions,
		oPropertyDataModelObjectPath: DataModelObjectPath
	) => BindingToolkitExpression<string> | CompiledBindingToolkitExpression;
	setUpVisibleProperties(oProps: FieldProperties, oDataModelPath: DataModelObjectPath): void;
	setUpParentEntitySet(oProps: FieldProperties, oDataModelPath: DataModelObjectPath, mSettings: any): void;
	setUpObjectIdentifierTitleAndText(oProps: FieldProperties, oDataModelPath: DataModelObjectPath): void;
};

/**
 * @classdesc
 * Building block for creating a Field based on the metadata provided by OData V4.
 * <br>
 * Usually, a DataField annotation is expected
 *
 * Usage example:
 * <pre>
 * <internalMacro:Field
 *   idPrefix="SomePrefix"
 *   contextPath="{entitySet>}"
 *   metaPath="{dataField>}"
 * />
 * </pre>
 * @class sap.fe.macros.internal.Field
 * @hideconstructor
 * @private
 * @experimental
 * @since 1.94.0
 */
const Field = MacroMetadata.extend("sap.fe.macros.internal.Field", {
	/**
	 * Name of the macro control.
	 */
	name: "Field",
	/**
	 * Namespace of the macro control
	 */
	namespace: "sap.fe.macros.internal",
	/**
	 * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
	 */
	fragment: "sap.fe.macros.internal.Field",

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
		designtime: "sap/fe/macros/internal/Field.designtime",
		/**
		 * Properties.
		 */
		properties: {
			/**
			 * Prefix added to the generated ID of the field
			 */
			idPrefix: {
				type: "string"
			},
			_apiId: {
				type: "string"
			},
			noWrapperId: {
				type: "string"
			},
			/**
			 * Prefix added to the generated ID of the value help used for the field
			 */
			vhIdPrefix: {
				type: "string",
				defaultValue: "FieldValueHelp"
			},

			_vhFlexId: {
				type: "string",
				computed: true
			},
			/**
			 * Metadata path to the entity set
			 */
			entitySet: {
				type: "sap.ui.model.Context",
				required: true,
				$kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
			},

			/**
			 * Metadata path to the entity set
			 */
			entityType: {
				type: "sap.ui.model.Context",
				required: false,
				computed: true,
				$kind: ["EntityType"]
			},
			/**
			 * Parent entity set
			 */
			parentEntitySet: {
				type: "sap.ui.model.Context",
				required: false,
				$kind: ["EntitySet", "NavigationProperty", "EntityType", "Singleton"]
			},
			/**
			 * Flag indicating whether action will navigate after execution
			 */
			navigateAfterAction: {
				type: "boolean",
				defaultValue: true
			},
			/**
			 * Metadata path to the dataField.
			 * This property is usually a metadataContext pointing to a DataField having
			 * $Type of DataField, DataFieldWithUrl, DataFieldForAnnotation, DataFieldForAction, DataFieldForIntentBasedNavigation, DataFieldWithNavigationPath, or DataPointType.
			 * But it can also be a Property with $kind="Property"
			 */
			dataField: {
				type: "sap.ui.model.Context",
				required: true,
				$kind: ["Property"],
				$Type: [
					"com.sap.vocabularies.UI.v1.DataField",
					"com.sap.vocabularies.UI.v1.DataFieldWithUrl",
					"com.sap.vocabularies.UI.v1.DataFieldForAnnotation",
					"com.sap.vocabularies.UI.v1.DataFieldForAction",
					"com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation",
					"com.sap.vocabularies.UI.v1.DataFieldWithAction",
					"com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation",
					"com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath",
					"com.sap.vocabularies.UI.v1.DataPointType"
				]
			},
			/**
			 * Context pointing to an array of the property's semantic objects
			 */
			semanticObjects: {
				type: "sap.ui.model.Context",
				required: false,
				computed: true
			},
			/**
			 * Edit Mode of the field.
			 *
			 * If the editMode is undefined then we compute it based on the metadata
			 * Otherwise we use the value provided here.
			 */
			editMode: {
				type: "sap.ui.mdc.enum.EditMode"
			},
			/**
			 * Wrap field
			 */
			wrap: {
				type: "boolean"
			},
			/**
			 * CSS class for margin
			 */
			"class": {
				type: "string"
			},
			/**
			 * Property added to associate the label with the Field
			 */
			ariaLabelledBy: {
				type: "string"
			},

			textAlign: {
				type: "sap.ui.core.TextAlign"
			},
			editableExpression: {
				type: "string",
				computed: true
			},
			enabledExpression: {
				type: "string",
				computed: true
			},
			collaborationEnabled: {
				type: "boolean",
				computed: true
			},
			collaborationHasActivityExpression: {
				type: "string",
				computed: true
			},
			collaborationInitialsExpression: {
				type: "string",
				computed: true
			},
			collaborationColorExpression: {
				type: "string",
				computed: true
			},
			/**
			 * Option to add a semantic object to a field
			 */
			semanticObject: {
				type: "string",
				required: false
			},
			hasSemanticObjectOnNavigation: {
				type: "boolean",
				required: false
			},
			linkUrl: {
				type: "string",
				required: false
			},
			formatOptions: {
				type: "object",
				properties: {
					isCurrencyAligned: {
						type: "boolean",
						defaultValue: false
					},
					/**
					 * expression for ObjectStatus visible property
					 */
					containsErrorVisibility: {
						type: "string"
					},
					/**
					 * Describe how the alignment works between Table mode (Date and Numeric End alignment) and Form mode (numeric aligned End in edit and Begin in display)
					 */
					textAlignMode: {
						type: "string",
						defaultValue: "Table",
						allowedValues: ["Table", "Form"]
					},
					displayMode: {
						type: "string",
						allowedValues: ["Value", "Description", "ValueDescription", "DescriptionValue"]
					},
					fieldMode: {
						type: "string",
						allowedValues: ["nowrapper", ""]
					},
					measureDisplayMode: {
						type: "string",
						allowedValues: ["Hidden", "ReadOnly"]
					},
					/**
					 * Maximum number of lines for multiline texts in edit mode
					 */
					textLinesEdit: {
						type: "number",
						configurable: true
					},
					/**
					 * Maximum number of lines that multiline texts in edit mode can grow to
					 */
					textMaxLines: {
						type: "number",
						configurable: true
					},
					/**
					 * Maximum number of characters from the beginning of the text field that are shown initially.
					 */
					textMaxCharactersDisplay: {
						type: "number",
						configurable: true
					},
					/**
					 * Defines how the full text will be displayed - InPlace or Popover
					 */
					textExpandBehaviorDisplay: {
						type: "string",
						allowedValues: ["InPlace", "Popover"]
					},
					/**
					 * If set to 'true', SAP Fiori elements shows an empty indicator in display mode for the text and links
					 */
					showEmptyIndicator: {
						type: "boolean",
						defaultValue: false
					},
					/**
					 * Preferred control if a semanticKey is used (if the semanticKey is empty, no specific rules apply)
					 */
					semanticKeyStyle: {
						type: "string",
						defaultValue: "",
						allowedValues: ["ObjectIdentifier", "Label", ""]
					},
					hasDraftIndicator: {
						type: "boolean",
						defaultValue: false
					},
					/**
					 * If true then sets the given icon instead of text in Action/IBN Button
					 */
					showIconUrl: {
						type: "boolean",
						defaultValue: false
					},
					/**
					 * If true then navigationavailable property will not be used for enablement of IBN button
					 */
					ignoreNavigationAvailable: {
						type: "boolean",
						defaultValue: false
					},
					isAnalytics: {
						type: "boolean",
						defaultValue: false
					},

					/**
					 * Enables the fallback feature for usage the text annotation from the value lists
					 */
					retrieveTextFromValueList: {
						type: "boolean",
						defaultValue: false
					},
					compactSemanticKey: {
						type: "boolean",
						defaultValue: false
					},
					fieldGroupDraftIndicatorPropertyPath: {
						type: "string"
					},
					fieldGroupName: {
						type: "string"
					}
				}
			}
		},

		events: {
			/**
			 * Event handler for change event
			 */
			onChange: {
				type: "function"
			}
		}
	},
	getOverrides: function (mControlConfiguration: any, sID: string) {
		const oProps: { [index: string]: any } = {};
		if (mControlConfiguration) {
			const oControlConfig = mControlConfiguration[sID];
			if (oControlConfig) {
				Object.keys(oControlConfig).forEach(function (sConfigKey) {
					oProps[sConfigKey] = oControlConfig[sConfigKey];
				});
			}
		}
		return oProps;
	},
	setUpDataPointType: function (oDataField: any) {
		// data point annotations need not have $Type defined, so add it if missing
		if (oDataField?.term === "com.sap.vocabularies.UI.v1.DataPoint") {
			oDataField.$Type = oDataField.$Type || UIAnnotationTypes.DataPointType;
		}
	},
	setUpVisibleProperties: function (oFieldProps: FieldProperties, oPropertyDataModelObjectPath: DataModelObjectPath) {
		// we do this before enhancing the dataModelPath so that it still points at the DataField
		oFieldProps.visible = FieldTemplating.getVisibleExpression(oPropertyDataModelObjectPath, oFieldProps.formatOptions);
		oFieldProps.displayVisible = oFieldProps.formatOptions.fieldMode === "nowrapper" ? oFieldProps.visible : undefined;
	},
	setUpParentEntitySet: function (oFieldProps: FieldProperties, oPropertyDataModelObjectPath: DataModelObjectPath, mSettings: any) {
		if (oPropertyDataModelObjectPath?.contextLocation && mSettings?.models?.metaModel) {
			oFieldProps.parentEntitySet = mSettings.models.metaModel.createBindingContext(
				`/${
					oPropertyDataModelObjectPath.contextLocation.startingEntitySet
						? oPropertyDataModelObjectPath.contextLocation.startingEntitySet.name
						: oPropertyDataModelObjectPath.startingEntitySet.name
				}`
			);
		}
	},
	create: function (this: FieldType, oProps: FieldProperties, oControlConfiguration: any, mSettings: any) {
		const oDataFieldConverted = MetaModelConverter.convertMetaModelContext(oProps.dataField);
		let oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(oProps.dataField, oProps.entitySet);
		this.setUpDataPointType(oDataFieldConverted);
		this.setUpVisibleProperties(oProps, oDataModelPath);
		this.setUpParentEntitySet(oProps, oDataModelPath, mSettings);

		if (oProps._flexId) {
			oProps._apiId = oProps._flexId;
			oProps._flexId = this.getContentId(oProps._flexId);
			oProps._vhFlexId = `${oProps._flexId}_${oProps.vhIdPrefix}`;
		}

		oDataModelPath = this._getTargetValueDataModelPath(oDataFieldConverted, oDataModelPath);
		this.setUpSemanticObjects(oProps, oDataModelPath);
		oProps.dataSourcePath = getTargetObjectPath(oDataModelPath);
		const oMetaModel = mSettings.models.metaModel || mSettings.models.entitySet;
		oProps.entityType = oMetaModel.createBindingContext(`/${oDataModelPath.targetEntityType.fullyQualifiedName}`);

		this.setUpEditableProperties(oProps, oDataFieldConverted, oDataModelPath, oMetaModel);
		this.setUpFormatOptions(oProps, oDataModelPath, oControlConfiguration, mSettings);
		this.setUpDisplayStyle(oProps, oDataFieldConverted, oDataModelPath);
		this.setUpEditStyle(oProps, oDataFieldConverted, oDataModelPath);

		// ---------------------------------------- compute bindings----------------------------------------------------
		const aDisplayStylesWithoutPropText = ["Avatar", "AmountWithCurrency"];
		if (oProps.displayStyle && aDisplayStylesWithoutPropText.indexOf(oProps.displayStyle) === -1 && oDataModelPath.targetObject) {
			oProps.text = oProps.text || FieldTemplating.getTextBinding(oDataModelPath, oProps.formatOptions);
			this.setUpObjectIdentifierTitleAndText(oProps, oDataModelPath);
		} else {
			oProps.text = "";
		}

		//TODO this is fixed twice
		// data point annotations need not have $Type defined, so add it if missing
		if (oProps.dataField.getObject("@sapui.name")?.indexOf("com.sap.vocabularies.UI.v1.DataPoint") > -1) {
			const oDataPoint = oProps.dataField.getObject();
			oDataPoint.$Type = oDataPoint.$Type || UIAnnotationTypes.DataPointType;
			oProps.dataField = new TemplateModel(oDataPoint, oProps.dataField.getModel()).createBindingContext("/");
		}

		oProps.emptyIndicatorMode = oProps.formatOptions.showEmptyIndicator ? "On" : undefined;

		return oProps;
	},

	getObjectIdentifierTitle: function (
		fieldFormatOptions: FieldFormatOptions,
		oPropertyDataModelObjectPath: DataModelObjectPath
	): BindingToolkitExpression<string> | CompiledBindingToolkitExpression {
		let propertyBindingExpression: BindingToolkitExpression<any> = pathInModel(
			getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath)
		);
		let targetDisplayMode = fieldFormatOptions?.displayMode;
		const oPropertyDefinition =
			oPropertyDataModelObjectPath.targetObject.type === "PropertyPath"
				? (oPropertyDataModelObjectPath.targetObject.$target as Property)
				: (oPropertyDataModelObjectPath.targetObject as Property);
		propertyBindingExpression = UIFormatters.formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);

		const commonText = oPropertyDefinition.annotations?.Common?.Text;
		if (commonText === undefined) {
			// there is no property for description
			targetDisplayMode = "Value";
		}
		const relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);

		const parametersForFormatter = [];

		parametersForFormatter.push(pathInModel("T_NEW_OBJECT", "sap.fe.i18n"));
		parametersForFormatter.push(pathInModel("T_ANNOTATION_HELPER_DEFAULT_OBJECT_PAGE_HEADER_TITLE_NO_HEADER_INFO", "sap.fe.i18n"));

		if (
			!!(oPropertyDataModelObjectPath.targetEntitySet as EntitySet)?.annotations?.Common?.DraftRoot ||
			!!(oPropertyDataModelObjectPath.targetEntitySet as EntitySet)?.annotations?.Common?.DraftNode
		) {
			parametersForFormatter.push(Entity.HasDraft);
			parametersForFormatter.push(Entity.IsActive);
		} else {
			parametersForFormatter.push(constant(null));
			parametersForFormatter.push(constant(null));
		}

		switch (targetDisplayMode) {
			case "Value":
				parametersForFormatter.push(propertyBindingExpression);
				parametersForFormatter.push(constant(null));
				break;
			case "Description":
				parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>);
				parametersForFormatter.push(constant(null));
				break;
			case "ValueDescription":
				parametersForFormatter.push(propertyBindingExpression);
				parametersForFormatter.push(getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>);
				break;
			default:
				if (commonText?.annotations?.UI?.TextArrangement) {
					parametersForFormatter.push(
						getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>
					);
					parametersForFormatter.push(propertyBindingExpression);
				} else {
					// if DescriptionValue is set by default and not by TextArrangement
					// we show description in ObjectIdentifier Title and value in ObjectIdentifier Text
					parametersForFormatter.push(
						getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>
					);
					// if DescriptionValue is set by default and property has a semantic object
					// we show description and value in ObjectIdentifier Title
					if (oPropertyDataModelObjectPath.targetObject?.annotations?.Common?.SemanticObject) {
						parametersForFormatter.push(propertyBindingExpression);
					} else {
						parametersForFormatter.push(constant(null));
					}
				}
				break;
		}
		return compileExpression(formatResult(parametersForFormatter as any, valueFormatters.formatOPTitle));
	},

	getObjectIdentifierText: function (
		fieldFormatOptions: FieldFormatOptions,
		oPropertyDataModelObjectPath: DataModelObjectPath
	): BindingToolkitExpression<string> | CompiledBindingToolkitExpression {
		let propertyBindingExpression: BindingToolkitExpression<any> = pathInModel(
			getContextRelativeTargetObjectPath(oPropertyDataModelObjectPath)
		);
		const targetDisplayMode = fieldFormatOptions?.displayMode;
		const oPropertyDefinition =
			oPropertyDataModelObjectPath.targetObject.type === "PropertyPath"
				? (oPropertyDataModelObjectPath.targetObject.$target as Property)
				: (oPropertyDataModelObjectPath.targetObject as Property);

		const commonText = oPropertyDefinition.annotations?.Common?.Text;
		if (commonText === undefined || commonText?.annotations?.UI?.TextArrangement) {
			return undefined;
		}
		propertyBindingExpression = UIFormatters.formatWithTypeInformation(oPropertyDefinition, propertyBindingExpression);

		switch (targetDisplayMode) {
			case "ValueDescription":
				const relativeLocation = getRelativePaths(oPropertyDataModelObjectPath);
				return compileExpression(getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>);
			case "DescriptionValue":
				return compileExpression(propertyBindingExpression);
			default:
				return undefined;
		}
	},

	setUpObjectIdentifierTitleAndText(_oProps: FieldProperties, oPropertyDataModelObjectPath: DataModelObjectPath) {
		if (_oProps.formatOptions?.semanticKeyStyle === "ObjectIdentifier") {
			_oProps.identifierTitle = this.getObjectIdentifierTitle(_oProps.formatOptions, oPropertyDataModelObjectPath);
			if (!oPropertyDataModelObjectPath.targetObject?.annotations?.Common?.SemanticObject) {
				_oProps.identifierText = this.getObjectIdentifierText(_oProps.formatOptions, oPropertyDataModelObjectPath);
			} else {
				_oProps.identifierText = undefined;
			}
		} else {
			_oProps.identifierTitle = undefined;
			_oProps.identifierText = undefined;
		}
	},

	getTextWithWhiteSpace: function (formatOptions: FieldFormatOptions, oDataModelPath: DataModelObjectPath) {
		const text = FieldTemplating.getTextBinding(oDataModelPath, formatOptions, true);
		return (text as any)._type === "PathInModel" || typeof text === "string"
			? compileExpression(formatResult([text], "WSR"))
			: compileExpression(text);
	},

	_getTargetValueDataModelPath: function (oDataField: any, oDataModelPath: DataModelObjectPath): DataModelObjectPath {
		if (!oDataField?.$Type) {
			return oDataModelPath;
		}
		let sExtraPath = "";
		let targetValueDataModelPath = oDataModelPath;

		switch (oDataField.$Type) {
			case UIAnnotationTypes.DataField:
			case UIAnnotationTypes.DataPointType:
			case UIAnnotationTypes.DataFieldWithNavigationPath:
			case UIAnnotationTypes.DataFieldWithUrl:
			case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
			case UIAnnotationTypes.DataFieldWithAction:
				sExtraPath = oDataField.Value?.path;
				break;
			case UIAnnotationTypes.DataFieldForAnnotation:
				if (oDataField.Target.$target) {
					if (
						oDataField.Target.$target.$Type === UIAnnotationTypes.DataField ||
						oDataField.Target.$target.$Type === UIAnnotationTypes.DataPointType
					) {
						sExtraPath = oDataField.Target.$target.Value?.path;
					} else {
						sExtraPath = oDataField.Target?.path;
					}
				}
				break;
		}
		if (sExtraPath?.length > 0) {
			targetValueDataModelPath = enhanceDataModelPath(oDataModelPath, sExtraPath);
		}
		return targetValueDataModelPath;
	},
	// algorithm to determine the field fragment to use in display and setUp some properties
	setUpDisplayStyle: function (this: FieldType, oProps: FieldProperties, oDataField: any, oDataModelPath: DataModelObjectPath): void {
		const oProperty: Property = oDataModelPath.targetObject as Property;
		if (!oDataModelPath.targetObject) {
			oProps.displayStyle = "Text";
			return;
		}
		if (oProperty.type === "Edm.Stream") {
			oProps.displayStyle = "File";
			return;
		}
		if (oProperty.annotations?.UI?.IsImageURL) {
			oProps.displayStyle = "Avatar";
			return;
		}
		const hasQuickViewFacets = oProperty ? FieldTemplating.isUsedInNavigationWithQuickViewFacets(oDataModelPath, oProperty) : false;

		switch (oDataField.$Type) {
			case UIAnnotationTypes.DataPointType:
				oProps.displayStyle = "DataPoint";
				return;
			case UIAnnotationTypes.DataFieldForAnnotation:
				if (oDataField.Target?.$target?.$Type === UIAnnotationTypes.DataPointType) {
					oProps.displayStyle = "DataPoint";
					return;
				} else if (oDataField.Target?.$target?.$Type === "com.sap.vocabularies.Communication.v1.ContactType") {
					oProps.displayStyle = "Contact";
					return;
				}
				break;
			case UIAnnotationTypes.DataFieldForAction:
				oProps.displayStyle = "Button";
				return;
			case UIAnnotationTypes.DataFieldForIntentBasedNavigation:
				this.setUpNavigationAvailable(oProps, oDataField);
				oProps.displayStyle = "Button";
				return;
			case UIAnnotationTypes.DataFieldWithIntentBasedNavigation:
				oProps.text = this.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			// falls through
			case UIAnnotationTypes.DataFieldWithNavigationPath:
			case UIAnnotationTypes.DataFieldWithAction:
				oProps.displayStyle = "Link";
				return;
		}
		if (isSemanticKey(oProperty, oDataModelPath) && oProps.formatOptions.semanticKeyStyle) {
			oProps.hasQuickViewFacets = hasQuickViewFacets;
			oProps.hasSituationsIndicator =
				SituationsIndicator.getSituationsNavigationProperty(oDataModelPath.targetEntityType) !== undefined;
			this.setUpObjectIdentifierTitleAndText(oProps, oDataModelPath);
			if ((oDataModelPath.targetEntitySet as EntitySet)?.annotations?.Common?.DraftRoot) {
				oProps.displayStyle = "SemanticKeyWithDraftIndicator";
				return;
			}
			oProps.displayStyle = oProps.formatOptions.semanticKeyStyle === "ObjectIdentifier" ? "ObjectIdentifier" : "LabelSemanticKey";
			return;
		}

		if (oDataField.Criticality) {
			oProps.hasQuickViewFacets = hasQuickViewFacets;
			oProps.linkUrl = oDataField.Url ? compileExpression(getExpressionFromAnnotation(oDataField.Url)) : undefined;
			oProps.displayStyle = "ObjectStatus";
			return;
		}
		if (oProperty.annotations?.Measures?.ISOCurrency && String(oProps.formatOptions.isCurrencyAligned) === "true") {
			if (oProps.formatOptions.measureDisplayMode === "Hidden") {
				oProps.displayStyle = "Text";
				return;
			}
			oProps.valueAsStringBindingExpression = FieldTemplating.getValueBinding(
				oDataModelPath,
				oProps.formatOptions,
				true,
				true,
				undefined,
				true
			);
			oProps.unitBindingExpression = compileExpression(UIFormatters.getBindingForUnitOrCurrency(oDataModelPath));
			oProps.displayStyle = "AmountWithCurrency";
			return;
		}
		if (oProperty.annotations?.Communication?.IsEmailAddress || oProperty.annotations?.Communication?.IsPhoneNumber) {
			oProps.text = this.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			oProps.displayStyle = "Link";
			return;
		}
		if (oProperty.annotations?.UI?.MultiLineText) {
			oProps.displayStyle = "ExpandableText";
			return;
		}

		if (hasQuickViewFacets) {
			oProps.text = this.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			oProps.hasQuickViewFacets = true;
			oProps.displayStyle = "LinkWithQuickViewForm";
			return;
		}

		if (
			oProps.semanticObject &&
			!(oProperty?.annotations?.Communication?.IsEmailAddress || oProperty?.annotations?.Communication?.IsPhoneNumber)
		) {
			oProps.hasQuickViewFacets = hasQuickViewFacets;
			oProps.text = this.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			oProps.displayStyle = "LinkWithQuickViewForm";
			return;
		}

		const _oPropertyCommonAnnotations = oProperty.annotations?.Common;
		const _oPropertyNavigationPropertyAnnotations = oDataModelPath?.navigationProperties[0]?.annotations?.Common;
		for (const key in _oPropertyCommonAnnotations) {
			if (key.indexOf("SemanticObject") === 0) {
				oProps.hasQuickViewFacets = hasQuickViewFacets;
				oProps.displayStyle = "LinkWrapper";
				return;
			}
		}
		for (const key in _oPropertyNavigationPropertyAnnotations) {
			if (key.indexOf("SemanticObject") === 0) {
				oProps.hasQuickViewFacets = hasQuickViewFacets;
				oProps.displayStyle = "LinkWrapper";
				return;
			}
		}

		if (oDataField.$Type === UIAnnotationTypes.DataFieldWithUrl) {
			oProps.text = this.getTextWithWhiteSpace(oProps.formatOptions, oDataModelPath);
			oProps.displayStyle = "Link";
			return;
		}
		oProps.displayStyle = "Text";
	},
	// algorithm to determine the field fragment to use in edit and set up some properties
	setUpEditStyle: function (this: FieldType, oProps: FieldProperties, oDataField: any, oDataModelPath: DataModelObjectPath): void {
		FieldTemplating.setEditStyleProperties(oProps, oDataField, oDataModelPath);
	},
	setUpEditableProperties: function (
		oProps: FieldProperties,
		oDataField: any,
		oDataModelPath: DataModelObjectPath,
		oMetaModel: any
	): void {
		const oPropertyForFieldControl = oDataModelPath?.targetObject?.Value
			? oDataModelPath.targetObject.Value
			: oDataModelPath?.targetObject;
		if (oProps.editMode !== undefined && oProps.editMode !== null) {
			// Even if it provided as a string it's a valid part of a binding expression that can be later combined into something else.
			oProps.editModeAsObject = oProps.editMode;
		} else {
			const bMeasureReadOnly = oProps.formatOptions.measureDisplayMode
				? oProps.formatOptions.measureDisplayMode === "ReadOnly"
				: false;

			oProps.editModeAsObject = UIFormatters.getEditMode(
				oPropertyForFieldControl,
				oDataModelPath,
				bMeasureReadOnly,
				true,
				oDataField
			);
			oProps.editMode = compileExpression(oProps.editModeAsObject);
		}
		const editableExpression = UIFormatters.getEditableExpressionAsObject(oPropertyForFieldControl, oDataField, oDataModelPath);
		const aRequiredPropertiesFromInsertRestrictions = CommonUtils.getRequiredPropertiesFromInsertRestrictions(
			oProps.entitySet?.getPath().replaceAll("/$NavigationPropertyBinding/", "/"),
			oMetaModel
		);
		const aRequiredPropertiesFromUpdateRestrictions = CommonUtils.getRequiredPropertiesFromUpdateRestrictions(
			oProps.entitySet?.getPath().replaceAll("/$NavigationPropertyBinding/", "/"),
			oMetaModel
		);
		const oRequiredProperties = {
			requiredPropertiesFromInsertRestrictions: aRequiredPropertiesFromInsertRestrictions,
			requiredPropertiesFromUpdateRestrictions: aRequiredPropertiesFromUpdateRestrictions
		};
		if (ModelHelper.isCollaborationDraftSupported(oMetaModel)) {
			oProps.collaborationEnabled = true;
			// Expressions needed for Collaboration Visualization
			const collaborationExpression = UIFormatters.getCollaborationExpression(
				oDataModelPath,
				CollaborationFormatters.hasCollaborationActivity
			);
			oProps.collaborationHasActivityExpression = compileExpression(collaborationExpression);
			oProps.collaborationInitialsExpression = compileExpression(
				UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityInitials)
			);
			oProps.collaborationColorExpression = compileExpression(
				UIFormatters.getCollaborationExpression(oDataModelPath, CollaborationFormatters.getCollaborationActivityColor)
			);
			oProps.editableExpression = compileExpression(and(editableExpression, not(collaborationExpression)));

			oProps.editMode = compileExpression(ifElse(collaborationExpression, constant("ReadOnly"), oProps.editModeAsObject));
		} else {
			oProps.editableExpression = compileExpression(editableExpression);
		}
		oProps.enabledExpression = UIFormatters.getEnabledExpression(
			oPropertyForFieldControl,
			oDataField,
			false,
			oDataModelPath
		) as CompiledBindingToolkitExpression;
		oProps.requiredExpression = UIFormatters.getRequiredExpression(
			oPropertyForFieldControl,
			oDataField,
			false,
			false,
			oRequiredProperties,
			oDataModelPath
		) as CompiledBindingToolkitExpression;
	},
	setUpFormatOptions: function (
		this: FieldType,
		oProps: FieldProperties,
		oDataModelPath: DataModelObjectPath,
		oControlConfiguration: any,
		mSettings: any
	) {
		const oOverrideProps = this.getOverrides(oControlConfiguration, oProps.dataField.getPath());

		if (!oProps.formatOptions.displayMode) {
			oProps.formatOptions.displayMode = UIFormatters.getDisplayMode(oDataModelPath);
		}
		oProps.formatOptions.textLinesEdit =
			oOverrideProps.textLinesEdit ||
			(oOverrideProps.formatOptions && oOverrideProps.formatOptions.textLinesEdit) ||
			oProps.formatOptions.textLinesEdit ||
			4;
		oProps.formatOptions.textMaxLines =
			oOverrideProps.textMaxLines ||
			(oOverrideProps.formatOptions && oOverrideProps.formatOptions.textMaxLines) ||
			oProps.formatOptions.textMaxLines;

		// Retrieve text from value list as fallback feature for missing text annotation on the property
		if (mSettings.models.viewData?.getProperty("/retrieveTextFromValueList")) {
			oProps.formatOptions.retrieveTextFromValueList = FieldTemplating.isRetrieveTextFromValueListEnabled(
				oDataModelPath.targetObject,
				oProps.formatOptions
			);
			if (oProps.formatOptions.retrieveTextFromValueList) {
				// Consider TextArrangement at EntityType otherwise set default display format 'DescriptionValue'
				const hasEntityTextArrangement = !!oDataModelPath?.targetEntityType?.annotations?.UI?.TextArrangement;
				oProps.formatOptions.displayMode = hasEntityTextArrangement ? oProps.formatOptions.displayMode : "DescriptionValue";
			}
		}
		if (oProps.formatOptions.fieldMode === "nowrapper" && oProps.editMode === "Display") {
			if (oProps._flexId) {
				oProps.noWrapperId = oProps._flexId;
			} else {
				oProps.noWrapperId = oProps.idPrefix ? generate([oProps.idPrefix, "Field-content"]) : undefined;
			}
		}
	},
	setUpSemanticObjects: function (oProps: FieldProperties, oDataModelPath: DataModelObjectPath): void {
		let aSemObjExprToResolve = [];
		aSemObjExprToResolve = FieldTemplating.getSemanticObjectExpressionToResolve(oDataModelPath?.targetObject?.annotations?.Common);

		/**
		 * If the field building block has a binding expression in the custom semantic objects,
		 * it gets stored to the custom data of the Link in LinkWithQuickViewForm.fragment.xml
		 * This is needed to resolve the link at runtime. The QuickViewLinkDelegate.js then gets the resolved
		 * binding expression from the custom data.
		 * All other custom semantic objects are processed in FieldHelper.js:computeLinkParameters
		 */
		if (!!oProps.semanticObject && typeof oProps.semanticObject === "string" && oProps.semanticObject[0] === "{") {
			aSemObjExprToResolve.push({
				key: oProps.semanticObject.substr(1, oProps.semanticObject.length - 2),
				value: oProps.semanticObject
			});
		}
		oProps.semanticObjects = FieldTemplating.getSemanticObjects(aSemObjExprToResolve);
		// This sets up the semantic links found in the navigation property, if there is no semantic links define before.
		if (!oProps.semanticObject && oDataModelPath.navigationProperties.length > 0) {
			oDataModelPath.navigationProperties.forEach(function (navProperty) {
				if (navProperty?.annotations?.Common?.SemanticObject) {
					oProps.semanticObject = navProperty.annotations.Common.SemanticObject;
					oProps.hasSemanticObjectOnNavigation = true;
				}
			});
		}
	},
	setUpNavigationAvailable: function (oProps: FieldProperties, oDataField: any): void {
		oProps.navigationAvailable = true;
		if (
			oDataField?.$Type === UIAnnotationTypes.DataFieldForIntentBasedNavigation &&
			oDataField.NavigationAvailable !== undefined &&
			String(oProps.formatOptions.ignoreNavigationAvailable) !== "true"
		) {
			oProps.navigationAvailable = compileExpression(getExpressionFromAnnotation(oDataField.NavigationAvailable));
		}
	}
});

export default Field as FieldType;
