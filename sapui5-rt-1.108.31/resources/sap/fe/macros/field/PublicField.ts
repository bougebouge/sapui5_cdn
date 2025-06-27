import { BuildingBlockBase, defineBuildingBlock, xmlAttribute, xmlEvent } from "sap/fe/core/buildingBlocks/BuildingBlock";
import { xml } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import { compileExpression, equal, ifElse, resolveBindingString } from "sap/fe/core/helpers/BindingToolkit";
import type { PropertiesOf } from "sap/fe/core/helpers/ClassSupport";
import FieldHelper from "sap/fe/macros/field/FieldHelper";
import type { V4Context } from "types/extension_types";

@defineBuildingBlock({
	name: "Field",
	namespace: "sap.fe.macros"
})
/**
 * Public external field representation
 */
export default class Field extends BuildingBlockBase {
	constructor(oProps: PropertiesOf<Field>) {
		if (oProps.readOnly !== undefined) {
			oProps.editModeExpression = compileExpression(
				ifElse(equal(resolveBindingString(oProps.readOnly, "boolean"), true), "Display", "Editable")
			);
		} else {
			oProps.editModeExpression = undefined;
		}
		super(oProps);
	}

	/**
	 * The 'id' property
	 */
	@xmlAttribute({ type: "string", isPublic: true, required: true })
	public id!: string;

	/**
	 * The meta path provided for the field
	 */
	@xmlAttribute({
		type: "sap.ui.model.Context",
		required: true
	})
	public metaPath!: V4Context;

	/**
	 * The context path provided for the field
	 */
	@xmlAttribute({
		type: "sap.ui.model.Context",
		required: true
	})
	public contextPath!: V4Context;

	/**
	 * The readOnly flag
	 */
	@xmlAttribute({ type: "boolean", required: false })
	public readOnly!: boolean;

	/**
	 * The semantic object associated to the field
	 */
	@xmlAttribute({
		type: "string",
		required: false
	})
	public semanticObject!: string;

	/**
	 * The edit mode expression for the field
	 */
	@xmlAttribute({
		type: "string",
		required: false
	})
	public editModeExpression!: string;

	/**
	 * The object with the formatting options
	 */
	@xmlAttribute({
		type: "object"
	})
	public formatOptions: any = {
		properties: {
			displayMode: {
				type: "string",
				allowedValues: ["Value", "Description", "ValueDescription", "DescriptionValue"]
			},
			measureDisplayMode: {
				type: "string",
				allowedValues: ["Hidden", "ReadOnly"]
			},
			textLinesEdit: {
				type: "number",
				configurable: true
			},
			textMaxLines: {
				type: "number",
				configurable: true
			},
			textMaxCharactersDisplay: {
				type: "number",
				configurable: true
			},
			textExpandBehaviorDisplay: {
				type: "string",
				allowedValues: ["InPlace", "Popover"]
			}
		}
	};

	/**
	 * The generic change event
	 */
	@xmlEvent()
	change: string = "";

	/**
	 * Sets the internal formatOptions for the building block.
	 *
	 * @returns A string with the internal formatOptions for the building block
	 */
	getFormatOptions(): string {
		return xml`
		<internalMacro:formatOptions
			textAlignMode="Form"
			showEmptyIndicator="true"
			displayMode="${this.formatOptions.displayMode}"
			measureDisplayMode="${this.formatOptions.measureDisplayMode}"
			textLinesEdit="${this.formatOptions.textLinesEdit}"
			textMaxLines="${this.formatOptions.textMaxLines}"
			textMaxCharactersDisplay="${this.formatOptions.textMaxCharactersDisplay}"
			textExpandBehaviorDisplay="${this.formatOptions.textExpandBehaviorDisplay}"
		/>`;
	}

	/**
	 * The function calculates the corresponding ValueHelp field in case it´s
	 * defined for the specific control.
	 *
	 * @returns An XML-based string with a possible ValueHelp control.
	 */
	getPossibleValueHelpTemplate(): string {
		const vhp = FieldHelper.valueHelpProperty(this.metaPath);
		const vhpCtx = this.metaPath.getModel().createBindingContext(vhp, this.metaPath);
		const hasValueHelpAnnotations = FieldHelper.hasValueHelpAnnotation(vhpCtx.getObject("@"));
		if (hasValueHelpAnnotations) {
			//depending whether this one has a value help annotation included, add the dependent
			return xml`
			<internalMacro:dependents>
				<macros:ValueHelp _flexId="${this.id}-content_FieldValueHelp" property="${vhpCtx}" />
			</internalMacro:dependents>`;
		}
		return "";
	}

	/**
	 * The building block template function.
	 *
	 * @returns An XML-based string with the definition of the field control
	 */
	getTemplate() {
		const contextPathPath = this.contextPath.getPath();
		const metaPathPath = this.metaPath.getPath();
		return xml`	
		<internalMacro:Field
			xmlns:internalMacro="sap.fe.macros.internal"
			entitySet="${contextPathPath}"
			dataField="${metaPathPath}"
			editMode="${this.editModeExpression}"
			onChange="${this.change}"
			_flexId="${this.id}"
			semanticObject="${this.semanticObject}"
		>
			${this.getFormatOptions()}
			${this.getPossibleValueHelpTemplate()}
		</internalMacro:Field>`;
	}
}
