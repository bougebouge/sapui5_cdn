import type { EntitySet, NavigationProperty, Property } from "@sap-ux/vocabularies-types";
import { UI } from "sap/fe/core/converters/helpers/BindingHelper";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import type { BindingToolkitExpression, CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import {
	and,
	compileExpression,
	constant,
	getExpressionFromAnnotation,
	ifElse,
	isConstant,
	not,
	or
} from "sap/fe/core/helpers/BindingToolkit";
import * as DataModelPathHelper from "sap/fe/core/templating/DataModelPathHelper";
import { getDisplayMode } from "sap/fe/core/templating/UIFormatters";
import { getValueBinding, getVisibleExpression } from "sap/fe/macros/field/FieldTemplating";
import MacroMetadata from "sap/fe/macros/MacroMetadata";

type MultiInputSettings = {
	text: BindingToolkitExpression<string> | CompiledBindingToolkitExpression;
	collectionBindingDisplay: CompiledBindingToolkitExpression;
	collectionBindingEdit: CompiledBindingToolkitExpression;
	key: BindingToolkitExpression<string> | CompiledBindingToolkitExpression;
};
/**
 * @classdesc
 * Building block for creating a CollectionField based on the metadata provided by OData V4.
 * <br>
 * Usually, a DataField annotation is expected
 *
 * Usage example:
 * <pre>
 * <internalMacro:CollectionField
 *   idPrefix="SomePrefix"
 *   contextPath="{entitySet>}"
 *   metaPath="{dataField>}"
 * />
 * </pre>
 * @class sap.fe.macros.internal.CollectionField
 * @hideconstructor
 * @private
 * @experimental
 * @since 1.94.0
 */
const CollectionField = MacroMetadata.extend("sap.fe.macros.internal.CollectionField", {
	/**
	 * Define building block stereotype for documentation
	 */
	name: "CollectionField",
	/**
	 * Namespace of the building block
	 */
	namespace: "sap.fe.macros.internal",
	/**
	 * Fragment source of the building block (optional)
	 */
	fragment: "sap.fe.macros.internal.CollectionField",

	/**
	 * The metadata describing the building block
	 */
	metadata: {
		/**
		 * Define building block stereotype for documentation purpose
		 */
		stereotype: "xmlmacro",
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
			 * Metadata path to the CollectionField.
			 * This property is usually a metadataContext pointing to a DataField having a Value that uses a 1:n navigation
			 */
			metaPath: {
				type: "sap.ui.model.Context",
				required: true,
				$kind: ["Property"]
			},
			/**
			 * Property added to associate the label with the CollectionField
			 */
			ariaLabelledBy: {
				type: "string"
			},
			formatOptions: {
				type: "object",
				properties: {
					/**
					 * If set to 'true', SAP Fiori elements shows an empty indicator in display mode for the text and links
					 */
					showEmptyIndicator: {
						type: "boolean",
						defaultValue: false
					},
					displayOnly: {
						type: "boolean",
						defaultValue: false
					}
				}
			},
			/**
			 * Mandatory context to the CollectionField
			 */
			contextPath: {
				type: "sap.ui.model.Context",
				required: true,
				$kind: ["EntitySet", "NavigationProperty"]
			}
		}
	},
	create: function (oProps: any) {
		let oDataModelPath = MetaModelConverter.getInvolvedDataModelObjects(oProps.metaPath, oProps.contextPath);
		const oDataFieldConverted = MetaModelConverter.convertMetaModelContext(oProps.metaPath);
		const sExtraPath = oDataFieldConverted.Value.path;

		oProps.visible = getVisibleExpression(oDataModelPath, oProps.formatOptions);
		if (sExtraPath && sExtraPath.length > 0) {
			oDataModelPath = DataModelPathHelper.enhanceDataModelPath(oDataModelPath, sExtraPath);
		}
		const bInsertable = DataModelPathHelper.isPathInsertable(oDataModelPath);
		const bDeleteNavigationRestriction = DataModelPathHelper.isPathDeletable(oDataModelPath, {
			ignoreTargetCollection: true,
			authorizeUnresolvable: true
		});
		const bDeletePath = DataModelPathHelper.isPathDeletable(oDataModelPath);
		// deletable:
		//		if restrictions come from Navigation we apply it
		//		otherwise we apply restrictions defined on target collection only if it's a constant
		//      otherwise it's true!
		const bDeletable = ifElse(
			bDeleteNavigationRestriction._type === "Unresolvable",
			or(not(isConstant(bDeletePath)), bDeletePath),
			bDeletePath
		);
		oProps.editMode =
			oProps.formatOptions.displayOnly === "true"
				? "Display"
				: compileExpression(ifElse(and(bInsertable, bDeletable, UI.IsEditable), constant("Editable"), constant("Display")));
		oProps.displayMode = getDisplayMode(oDataModelPath);

		const multiInputSettings = CollectionField._getMultiInputSettings(oDataModelPath, oProps.formatOptions);
		oProps.text = multiInputSettings.text;
		oProps.collection =
			oProps.editMode === "Display" ? multiInputSettings.collectionBindingDisplay : multiInputSettings.collectionBindingEdit;
		oProps.key = multiInputSettings.key;
		return oProps;
	},
	_getMultiInputSettings: function (
		oPropertyDataModelObjectPath: DataModelPathHelper.DataModelObjectPath,
		formatOptions: { measureDisplayMode?: string }
	): MultiInputSettings {
		const { collectionPath, itemDataModelObjectPath } = CollectionField._getPathStructure(oPropertyDataModelObjectPath);
		const collectionBindingDisplay = `{path:'${collectionPath}', templateShareable: false}`;
		const collectionBindingEdit = `{path:'${collectionPath}', parameters: {$$ownRequest : true}, templateShareable: false}`;

		const oPropertyDefinition =
			oPropertyDataModelObjectPath.targetObject.type === "PropertyPath"
				? (oPropertyDataModelObjectPath.targetObject.$target as Property)
				: (oPropertyDataModelObjectPath.targetObject as Property);
		const commonText = oPropertyDefinition.annotations?.Common?.Text;
		const relativeLocation = DataModelPathHelper.getRelativePaths(oPropertyDataModelObjectPath);

		const textExpression = commonText
			? compileExpression(getExpressionFromAnnotation(commonText, relativeLocation) as BindingToolkitExpression<string>)
			: getValueBinding(itemDataModelObjectPath, formatOptions, true);
		return {
			text: textExpression,
			collectionBindingDisplay: collectionBindingDisplay,
			collectionBindingEdit: collectionBindingEdit,
			key: getValueBinding(itemDataModelObjectPath, formatOptions, true)
		};
	},
	// Process the dataModelPath to find the collection and the relative DataModelPath for the item.
	_getPathStructure: function (dataModelObjectPath: DataModelPathHelper.DataModelObjectPath): object {
		let firstCollectionPath = "";

		let currentEntitySet = dataModelObjectPath.contextLocation?.targetEntitySet
			? dataModelObjectPath.contextLocation.targetEntitySet
			: dataModelObjectPath.startingEntitySet;
		const navigatedPaths: string[] = [];
		const contextNavsForItem: NavigationProperty[] = dataModelObjectPath.contextLocation?.navigationProperties || [];
		for (const navProp of dataModelObjectPath.navigationProperties) {
			if (
				!dataModelObjectPath.contextLocation ||
				!dataModelObjectPath.contextLocation?.navigationProperties.some(
					(contextNavProp) => contextNavProp.fullyQualifiedName === navProp.fullyQualifiedName
				)
			) {
				// in case of relative entitySetPath we don't consider navigationPath that are already in the context
				navigatedPaths.push(navProp.name);
				contextNavsForItem.push(navProp);
			}
			if (currentEntitySet && currentEntitySet.navigationPropertyBinding.hasOwnProperty(navProp.name)) {
				currentEntitySet = currentEntitySet.navigationPropertyBinding[navProp.name] as EntitySet;
				if (navProp.isCollection) {
					break;
				}
			}
		}
		firstCollectionPath = `${navigatedPaths.join("/")}`;
		const itemDataModelObjectPath = Object.assign({}, dataModelObjectPath);
		if (itemDataModelObjectPath.contextLocation) {
			itemDataModelObjectPath.contextLocation.navigationProperties = contextNavsForItem;
		}

		return { collectionPath: firstCollectionPath, itemDataModelObjectPath: itemDataModelObjectPath };
	}
});

export default CollectionField;
