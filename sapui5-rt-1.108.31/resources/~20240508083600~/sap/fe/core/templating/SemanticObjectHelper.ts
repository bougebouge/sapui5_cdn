import { NavigationProperty, Property } from "@sap-ux/vocabularies-types";
import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";

/**
 * Get the path of the semantic Object if it is a dynamic SemanticObject.
 *
 * @param semanticObject The value of the Common.SemanticObject annotation.
 * @returns  The path of the semantic Object if it is a dynamic SemanticObject null otherwise.
 */
export const getDynamicPathFromSemanticObject = (semanticObject: string | null): string | null => {
	const dynamicSemObjectRegex = semanticObject?.match(/{(.*?)}/);
	if (dynamicSemObjectRegex?.length && dynamicSemObjectRegex.length > 1) {
		return dynamicSemObjectRegex[1];
	}
	return null;
};

/**
 * Check whether a property or a NavigationProperty has a semantic object defined or not.
 *
 * @param property The target property
 * @returns `true` if it has a semantic object
 */
export const hasSemanticObject = function (property: Property | NavigationProperty): boolean {
	const _propertyCommonAnnotations = property.annotations?.Common as { [key: string]: any } | undefined;
	if (_propertyCommonAnnotations) {
		for (const key in _propertyCommonAnnotations) {
			if (_propertyCommonAnnotations[key]?.term === CommonAnnotationTerms.SemanticObject) {
				return true;
			}
		}
	}
	return false;
};
