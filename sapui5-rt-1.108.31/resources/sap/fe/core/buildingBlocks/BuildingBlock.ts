import deepClone from "sap/base/util/deepClone";
import merge from "sap/base/util/merge";
import ObjectPath from "sap/base/util/ObjectPath";
import AppComponent from "sap/fe/core/AppComponent";
import { escapeXMLAttributeValue, registerBuildingBlock, xml } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import CommonUtils from "sap/fe/core/CommonUtils";
import { resolveBindingString } from "sap/fe/core/helpers/BindingToolkit";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import TemplateComponent from "sap/fe/core/TemplateComponent";
import ManagedObject from "sap/ui/base/ManagedObject";
import Component from "sap/ui/core/Component";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import Control from "sap/ui/mdc/Control";
import type { ManagedObjectEx } from "types/extension_types";
import ConverterContext from "../converters/ConverterContext";

// Type for the accessor decorator that we end up with in babel.
type AccessorDescriptor<T> = TypedPropertyDescriptor<T> & { initializer?: () => T };
export type BuildingBlockExtraSettings = {
	isPublic: boolean;
	isRuntimeInstantiation?: boolean;
	appComponent: AppComponent;
};

/**
 * Base class for Building Block
 */
export class BuildingBlockBase {
	protected isPublic = false;
	protected id!: string;
	constructor(oProps: Record<string, unknown>, _oControlConfig?: any, _oSettings?: BuildingBlockExtraSettings) {
		Object.keys(oProps).forEach((propName) => {
			// This needs to be casted as any since we are assigning the properties to the instance without knowing their type
			this[propName as keyof this] = oProps[propName] as any;
		});
	}

	/**
	 * Convert the given local element ID to a globally unique ID by prefixing with the Building Block ID.
	 *
	 * @param stringParts
	 * @returns Either the global ID or undefined if the Building Block doesn't have an ID
	 */
	public createId(...stringParts: string[]) {
		// If the child instance has an ID property use it otherwise return undefined
		if (this.id) {
			return generate([(this as any).id, ...stringParts]);
		}
		return undefined;
	}
	// This block is commented out because I am not using them for now / need to change this but still want to keep them around
	protected getConverterContext = function (oVisualizationObjectPath: any, contextPath: any, mSettings: any, mExtraParams?: any) {
		const oAppComponent = mSettings.appComponent;
		const originalViewData = mSettings.models.viewData && mSettings.models.viewData.getData();
		let viewData = Object.assign({}, originalViewData);
		delete viewData.resourceBundle;
		viewData = deepClone(viewData);
		viewData.controlConfiguration = merge(viewData.controlConfiguration, mExtraParams);
		return ConverterContext.createConverterContextForMacro(
			oVisualizationObjectPath.startingEntitySet.name,
			mSettings.models.metaModel,
			oAppComponent && oAppComponent.getDiagnostics(),
			merge,
			oVisualizationObjectPath.contextLocation,
			viewData
		);
	};
	public getProperties() {
		const allProperties: Record<string, any> = {};
		for (const oInstanceKey in this) {
			if (this.hasOwnProperty(oInstanceKey)) {
				allProperties[oInstanceKey] = this[oInstanceKey];
			}
		}
		return allProperties;
	}
	static register() {
		// To be overriden
	}
	static unregister() {
		// To be overriden
	}
	public addConditionally(condition = false, partToAdd?: any) {
		if (condition) {
			return partToAdd;
		} else {
			return "";
		}
	}
	protected attr(attributeName: string, value: any): () => string {
		if (value !== undefined) {
			return () => `${attributeName}="${escapeXMLAttributeValue(value)}"`;
		} else {
			return () => "";
		}
	}
}

/**
 * Base class for runtime building blocks
 */
export interface RuntimeBuildingBlock extends BuildingBlockBase {
	render(containingView: View, appComponent: AppComponent): Control;
}

export type BuildingBlockPropertyDefinition = {
	type: string;
	isPublic?: boolean;
	defaultValue?: any;
	computed?: boolean;
	required?: boolean;
	bindable?: boolean; // only considered for runtime building blocks
	$kind?: string[];
};
export type BuildingBlockMetadataContextDefinition = {
	type: string;
	isPublic?: boolean;
	required?: boolean;
	computed?: boolean;
	$Type?: string[];
	$kind?: string[];
};
export type BuildingBlockEvent = {};
export type BuildingBlockAggregationDefinition = {
	isPublic?: boolean;
	type: string;
	slot?: string;
	isDefault?: boolean;
};
type CommonBuildingBlockDefinition = {
	namespace: string;
	name: string;
	xmlTag?: string;
	fragment?: string;
	publicNamespace?: string;

	isRuntime?: boolean;
	isOpen?: boolean;
};
export type BuildingBlockDefinitionV2 = CommonBuildingBlockDefinition &
	typeof BuildingBlockBase & {
		apiVersion: 2;
		metadata: BuildingBlockMetadata;
	};

export type BuildingBlockDefinitionV1 = CommonBuildingBlockDefinition & {
	name: string;
	apiVersion?: 1;
	create?: Function;
	getTemplate?: Function;
	metadata: BuildingBlockMetadata;
};
export type BuildingBlockDefinition = BuildingBlockDefinitionV2 | BuildingBlockDefinitionV1;
export type BuildingBlockMetadata = {
	events: Record<string, BuildingBlockEvent>;
	properties: Record<string, BuildingBlockPropertyDefinition>;
	aggregations: Record<string, BuildingBlockAggregationDefinition>;
};

const ensureMetadata = function (target: Partial<BuildingBlockDefinitionV2>): BuildingBlockMetadata {
	if (!target.hasOwnProperty("metadata")) {
		target.metadata = deepClone(
			target.metadata || {
				properties: {},
				aggregations: {},
				events: {}
			}
		);
	}
	return target.metadata as BuildingBlockMetadata;
};

/**
 * Indicates that the property shall be declared as an xml attribute that can be used from the outside of the building block.
 *
 * If defining a runtime Building Block, please make sure to use the correct typings: Depending on its metadata,
 * a property can either be a {@link sap.ui.model.Context} (<code>type: 'sap.ui.model.Context'</code>),
 * a constant (<code>bindable: false</code>), or a {@link BindingToolkitExpression} (<code>bindable: true</code>).
 *
 * @param attributeDefinition
 * @returns The decorated property
 */
export function xmlAttribute(attributeDefinition: BuildingBlockPropertyDefinition): PropertyDecorator {
	return function (target: BuildingBlockBase, propertyKey: string | Symbol, propertyDescriptor: AccessorDescriptor<any>) {
		const metadata = ensureMetadata(target.constructor);
		if (attributeDefinition.defaultValue === undefined) {
			// If there is no defaultValue we can take the value from the initializer (natural way of defining defaults)
			attributeDefinition.defaultValue = propertyDescriptor.initializer?.();
		}
		delete propertyDescriptor.initializer;
		if (metadata.properties[propertyKey.toString()] === undefined) {
			metadata.properties[propertyKey.toString()] = attributeDefinition;
		}

		return propertyDescriptor;
	} as any; // Needed to make TS happy with those decorators;
}
export function blockAttribute(attributeDefinition: BuildingBlockPropertyDefinition): PropertyDecorator {
	return xmlAttribute(attributeDefinition);
}

export function xmlEvent(): PropertyDecorator {
	return function (target: BuildingBlockBase, propertyKey: string | Symbol, propertyDescriptor: AccessorDescriptor<any>) {
		const metadata = ensureMetadata(target.constructor);
		delete propertyDescriptor.initializer;
		if (metadata.events[propertyKey.toString()] === undefined) {
			metadata.events[propertyKey.toString()] = { type: "Function" };
		}

		return propertyDescriptor;
	} as any; // Needed to make TS happy with those decorators;
}
export function blockEvent(): PropertyDecorator {
	return xmlEvent();
}
/**
 * Indicates that the property shall be declared as an xml aggregation that can be used from the outside of the building block.
 *
 * @param aggregationDefinition
 * @returns The decorated property
 */
export function xmlAggregation(aggregationDefinition: BuildingBlockAggregationDefinition): PropertyDecorator {
	return function (target: BuildingBlockBase, propertyKey: string, propertyDescriptor: TypedPropertyDescriptor<any>) {
		const metadata = ensureMetadata(target.constructor);
		delete (propertyDescriptor as any).initializer;
		if (metadata.aggregations[propertyKey] === undefined) {
			metadata.aggregations[propertyKey] = aggregationDefinition;
		}

		return propertyDescriptor;
	} as any;
}
export function blockAggregation(aggregationDefinition: BuildingBlockAggregationDefinition): PropertyDecorator {
	return xmlAggregation(aggregationDefinition);
}
const RUNTIME_BLOCKS: Record<string, RuntimeBuildingBlock & BuildingBlockDefinitionV2> = {};
export function defineBuildingBlock(oBuildingBlockDefinition: CommonBuildingBlockDefinition): ClassDecorator {
	return function (classDefinition: any) {
		ensureMetadata(classDefinition);
		classDefinition.xmlTag = oBuildingBlockDefinition.name;
		classDefinition.namespace = oBuildingBlockDefinition.namespace;
		classDefinition.publicNamespace = oBuildingBlockDefinition.publicNamespace;
		classDefinition.fragment = oBuildingBlockDefinition.fragment;
		classDefinition.isOpen = oBuildingBlockDefinition.isOpen;
		classDefinition.isRuntime = oBuildingBlockDefinition.isRuntime;
		classDefinition.apiVersion = 2;
		if (classDefinition.isRuntime === true) {
			classDefinition.prototype.getTemplate = function () {
				const className = `${oBuildingBlockDefinition.namespace}.${oBuildingBlockDefinition.name}`;
				const extraProps = [];
				for (const propertiesKey in classDefinition.metadata.properties) {
					let propertyValue = this[propertiesKey];
					if (propertyValue !== undefined && propertyValue !== null) {
						if (propertyValue?.isA?.("sap.ui.model.Context") === true) {
							propertyValue = propertyValue.getPath();
						}
						extraProps.push(xml`feBB:${propertiesKey}="${propertyValue}"`);
					}
				}
				for (const eventsKey in classDefinition.metadata.events) {
					const eventsValue = this[eventsKey];
					if (eventsValue !== undefined) {
						extraProps.push(xml`feBB:${eventsKey}="${eventsValue}"`);
					}
				}
				return xml`<core:Fragment
					xmlns:core="sap.ui.core"
					xmlns:feBB="sap.fe.core.buildingBlocks"
					fragmentName="${className}"
					id="{this>id}"
					type="FE_COMPONENTS"
					${extraProps}
				>
				</core:Fragment>`;
			};
		}

		classDefinition.register = function () {
			registerBuildingBlock(classDefinition);
			if (classDefinition.isRuntime === true) {
				RUNTIME_BLOCKS[`${oBuildingBlockDefinition.namespace}.${oBuildingBlockDefinition.name}`] = classDefinition;
			}
		};
		classDefinition.unregister = function () {
			XMLPreprocessor.plugIn(null, classDefinition.namespace, classDefinition.name);
			XMLPreprocessor.plugIn(null, classDefinition.publicNamespace, classDefinition.name);
		};
	};
}

Fragment.registerType("FE_COMPONENTS", {
	load: async function (mSettings: Record<string, any>) {
		return RUNTIME_BLOCKS[mSettings.fragmentName];
	},
	init: async function (mSettings: Record<string, any>) {
		let MyClass: RuntimeBuildingBlock & BuildingBlockDefinitionV2 = mSettings.fragmentContent;
		if (!MyClass) {
			// In some case we might have been called here synchronously (unstash case for instance), which means we didn't go through the load function
			MyClass = RUNTIME_BLOCKS[mSettings.fragmentName];
		}
		const classSettings: any = {};
		const feCustomData: Record<string, any> = mSettings?.customData?.[0]?.mProperties?.value?.["sap.fe.core.buildingBlocks"] || {};
		delete mSettings.customData;
		const pageComponent = Component.getOwnerComponentFor(mSettings.containingView) as TemplateComponent;
		const appComponent = CommonUtils.getAppComponent(mSettings.containingView);
		const metaModel = appComponent.getMetaModel();
		const pageModel = pageComponent.getModel("_pageModel");
		for (const propertyName in MyClass.metadata.properties) {
			const propertyMetadata = MyClass.metadata.properties[propertyName];
			const pageModelContext = pageModel.createBindingContext(feCustomData[propertyName]);

			if (pageModelContext === null) {
				// value cannot be resolved, so it is either a runtime binding or a constant
				let vValue = feCustomData[propertyName];

				if (typeof vValue === "string") {
					if (propertyMetadata.bindable !== true) {
						// runtime bindings are not allowed, so convert strings into actual primitive types
						switch (propertyMetadata.type) {
							case "boolean":
								vValue = vValue === "true";
								break;
							case "number":
								vValue = Number(vValue);
								break;
						}
					} else {
						// runtime bindings are allowed, so resolve the values as BindingToolkit expressions
						vValue = resolveBindingString(vValue, propertyMetadata.type);
					}
				}

				classSettings[propertyName] = vValue;
			} else if (pageModelContext.getObject() !== undefined) {
				// get value from page model
				classSettings[propertyName] = pageModelContext.getObject();
			} else {
				// bind to metamodel
				classSettings[propertyName] = metaModel.createBindingContext(feCustomData[propertyName]);
			}
		}
		for (const eventName in MyClass.metadata.events) {
			if (feCustomData[eventName] !== undefined && (feCustomData[eventName] as string).startsWith(".")) {
				classSettings[eventName] = ObjectPath.get(feCustomData[eventName].substring(1), mSettings.containingView.getController());
			} else {
				classSettings[eventName] = ""; // For now, might need to resolve more stuff
			}
		}
		return (ManagedObject as unknown as ManagedObjectEx).runWithPreprocessors(
			() => {
				const renderedControl = (
					new MyClass(
						classSettings,
						{},
						{ isRuntimeInstantiation: true, isPublic: false, appComponent: appComponent }
					) as RuntimeBuildingBlock
				).render(mSettings.containingView, appComponent);
				if (!(this as any)._bAsync) {
					(this as any)._aContent = renderedControl;
				}
				return renderedControl;
			},
			{
				id: function (sId: string) {
					return mSettings.containingView.createId(sId);
				},
				settings: function (controlSettings: any) {
					const allAssociations = this.getMetadata().getAssociations();
					for (const associationDetailName of Object.keys(allAssociations)) {
						if (controlSettings.hasOwnProperty(associationDetailName)) {
							controlSettings[associationDetailName] = mSettings.containingView.createId(
								controlSettings[associationDetailName]
							);
						}
					}
					return controlSettings;
				}
			}
		);
	}
});
