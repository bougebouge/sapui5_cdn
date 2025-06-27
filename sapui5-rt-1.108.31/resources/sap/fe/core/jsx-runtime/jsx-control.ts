import { BindingToolkitExpression, compileConstant, compileExpression, isConstant } from "sap/fe/core/helpers/BindingToolkit";
import type { ControlProperties, NonControlProperties, Ref } from "sap/fe/core/jsx-runtime/jsx";
import Text from "sap/m/Text";
import type ManagedObjectMetadata from "sap/ui/base/ManagedObjectMetadata";
import type Control from "sap/ui/core/Control";
import type { $ControlSettings } from "sap/ui/core/Control";
import type Element from "sap/ui/core/Element";
const addChildAggregation = function (aggregationChildren: any, aggregationName: string, child: any) {
	if (child === undefined || typeof child === "string") {
		return;
	}
	if (!aggregationChildren[aggregationName]) {
		aggregationChildren[aggregationName] = [];
	}
	if (isChildAnElement(child)) {
		aggregationChildren[aggregationName].push(child);
	} else if (Array.isArray(child)) {
		child.forEach((subChild) => {
			addChildAggregation(aggregationChildren, aggregationName, subChild);
		});
	} else {
		Object.keys(child).forEach((childKey) => {
			addChildAggregation(aggregationChildren, childKey, child[childKey]);
		});
	}
};
const isChildAnElement = function <T>(children?: Element | ControlProperties<T>): children is Element {
	return (children as Element)?.isA?.("sap.ui.core.Element");
};
const isAControl = function (children?: typeof Control | Function): children is typeof Control {
	return !!(children as typeof Control)?.getMetadata;
};

function processAggregations(metadata: ManagedObjectMetadata, mSettings: Record<string, any>) {
	const metadataAggregations = metadata.getAllAggregations() as any;
	const defaultAggregationName = metadata.getDefaultAggregationName();
	const aggregationChildren: Record<string, string[]> = {};
	addChildAggregation(aggregationChildren, defaultAggregationName, mSettings.children);
	delete mSettings.children;
	// find out which aggregation are bound (both in children and directly under it)
	Object.keys(metadataAggregations).forEach((aggregationName) => {
		if (aggregationChildren[aggregationName] !== undefined) {
			if (mSettings.hasOwnProperty(aggregationName)) {
				// always use the first item as template according to UI5 logic
				(mSettings as any)[aggregationName].template = aggregationChildren[aggregationName][0];
			} else {
				(mSettings as any)[aggregationName] = aggregationChildren[aggregationName];
			}
		}
	});
}

const jsxControl = function <T extends Element>(
	ControlType: typeof Control | Function,
	mSettings: NonControlProperties<T> & { key: string; children?: Element | ControlProperties<T>; ref?: Ref<T>; class?: string },
	key: string
): Control | Control[] {
	if ((ControlType as any).isFragment) {
		return mSettings.children as any;
	}
	let targetControl;
	if (isAControl(ControlType)) {
		const metadata = ControlType.getMetadata();
		if (key !== undefined) {
			mSettings["key"] = key;
		}
		processAggregations(metadata, mSettings);
		const classDef = mSettings.class;
		const refDef = mSettings.ref;
		delete mSettings.ref;
		delete mSettings.class;
		let settingsKey: keyof typeof mSettings;
		for (settingsKey in mSettings) {
			if ((mSettings[settingsKey] as any)?._type) {
				const bindingToolkitExpression: BindingToolkitExpression<any> = mSettings[settingsKey] as any;
				if (isConstant(bindingToolkitExpression)) {
					mSettings[settingsKey] = compileConstant(mSettings[settingsKey] as any, false, true, true);
				} else {
					mSettings[settingsKey] = compileExpression(bindingToolkitExpression) as any;
				}
			}
		}
		targetControl = new ControlType(mSettings as $ControlSettings);
		if (classDef) {
			targetControl.addStyleClass(classDef);
		}
		if (refDef) {
			refDef.setCurrent(targetControl as any);
		}
	} else if (typeof ControlType === "function") {
		const controlTypeFn = ControlType;
		targetControl = controlTypeFn(mSettings as $ControlSettings);
	} else {
		targetControl = new Text({ text: "Missing component " + (ControlType as any) });
	}

	return targetControl;
};

export default jsxControl;
