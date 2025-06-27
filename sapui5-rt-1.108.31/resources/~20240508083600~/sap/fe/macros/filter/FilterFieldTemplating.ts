import { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { getPropertyObjectPath, hasValueHelp } from "sap/fe/core/templating/PropertyFormatters";
import type { ComputedAnnotationInterface, MetaModelContext } from "sap/fe/core/templating/UIFormatters";
import { getDisplayMode } from "sap/fe/core/templating/UIFormatters";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

export const getDisplayProperty = function (oContext: MetaModelContext, oInterface: ComputedAnnotationInterface): string {
	const propertyPath = getPropertyObjectPath(oContext, oInterface);

	return hasValueHelp(oContext, oInterface) ? getDisplayMode(propertyPath) : "Value";
};

export const getFilterFieldDisplayFormat = async function (
	oContext: MetaModelContext,
	oInterface: ComputedAnnotationInterface
): Promise<string> {
	const propertyObjectPath = getPropertyObjectPath(oContext, oInterface);
	const oTextAnnotation = propertyObjectPath.targetObject?.annotations?.Common?.Text;
	if (oTextAnnotation) {
		// The text annotation should be on the property defined
		return getDisplayProperty(oContext, oInterface);
	}
	const bHasValueHelp = hasValueHelp(oContext, oInterface);
	if (bHasValueHelp) {
		// Exceptional case for missing text annotation on the property (retrieve text from value list)
		// Consider TextArrangement at EntityType otherwise set default display format 'DescriptionValue'
		const oEntityTextArrangement = propertyObjectPath?.targetEntityType?.annotations?.UI?.TextArrangement;
		return oEntityTextArrangement ? getDisplayMode(propertyObjectPath) : _getDisplayModeFromValueHelp(oInterface, propertyObjectPath);
	}
	return "Value";
};

/**
 * Method to determine the display mode from the value help.
 *
 * @param Interface The current templating context
 * @param propertyObjectPath The global path to reach the entitySet
 * @returns A promise with the string 'DescriptionValue' or 'Value', depending on whether a text annotation exists for the property in the value help
 * Hint: A text arrangement is consciously ignored. If the text is retrieved from the value help, the text arrangement of the value help property isn´t considered. Instead, the default text arrangement #TextFirst
 * is used.
 */
export async function _getDisplayModeFromValueHelp(
	Interface: ComputedAnnotationInterface,
	propertyObjectPath: DataModelObjectPath
): Promise<string> {
	const context = Interface.context;
	const metaModel = Interface.context.getModel() as ODataMetaModel;

	return await metaModel.requestValueListInfo(context.getPath(), true, context).then(function (valueListInfo: any) {
		const firstKey = Object.keys(valueListInfo)[0];
		const firstValueListInfo = valueListInfo[firstKey];
		const valueListParameter = firstValueListInfo.Parameters?.find((element: any) => {
			return element.LocalDataProperty?.$PropertyPath === propertyObjectPath?.targetObject?.name;
		});
		const valueListProperty = valueListParameter?.ValueListProperty;

		const textAnnotation = metaModel.getObject(
			"/" + firstValueListInfo.CollectionPath + "/" + valueListProperty + "@com.sap.vocabularies.Common.v1.Text"
		);
		return textAnnotation ? "DescriptionValue" : "Value";
	});
}
