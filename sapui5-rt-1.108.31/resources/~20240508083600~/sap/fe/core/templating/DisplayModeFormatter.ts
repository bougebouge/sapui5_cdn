/**
 * Separating these methods from the UIFormatters as they are used also in the converter.
 * These methods must NOT use any dependency from the SAP UI5 runtime.
 * When consumed outside of converters, you should call them via UIFormatters.
 */

import type { PathAnnotationExpression, Property } from "@sap-ux/vocabularies-types";
import type { DataModelObjectPath } from "sap/fe/core/templating/DataModelPathHelper";
import { isPathExpression, isPropertyPathExpression } from "sap/fe/core/templating/PropertyHelper";

export type PropertyOrPath<P> = string | P | PathAnnotationExpression<P>;

export const EDM_TYPE_MAPPING: Record<string, any> = {
	"Edm.Boolean": { type: "sap.ui.model.odata.type.Boolean" },
	"Edm.Byte": { type: "sap.ui.model.odata.type.Byte" },
	"Edm.Date": { type: "sap.ui.model.odata.type.Date" },
	"Edm.DateTimeOffset": {
		constraints: {
			"$Precision": "precision",
			"$V4": "V4"
		},
		type: "sap.ui.model.odata.type.DateTimeOffset"
	},
	"Edm.Decimal": {
		constraints: {
			"@Org.OData.Validation.V1.Minimum/$Decimal": "minimum",
			"@Org.OData.Validation.V1.Minimum@Org.OData.Validation.V1.Exclusive": "minimumExclusive",
			"@Org.OData.Validation.V1.Maximum/$Decimal": "maximum",
			"@Org.OData.Validation.V1.Maximum@Org.OData.Validation.V1.Exclusive": "maximumExclusive",
			"$Precision": "precision",
			"$Scale": "scale"
		},
		type: "sap.ui.model.odata.type.Decimal"
	},
	"Edm.Double": { type: "sap.ui.model.odata.type.Double" },
	"Edm.Guid": { type: "sap.ui.model.odata.type.Guid" },
	"Edm.Int16": { type: "sap.ui.model.odata.type.Int16" },
	"Edm.Int32": { type: "sap.ui.model.odata.type.Int32" },
	"Edm.Int64": { type: "sap.ui.model.odata.type.Int64" },
	"Edm.SByte": { type: "sap.ui.model.odata.type.SByte" },
	"Edm.Single": { type: "sap.ui.model.odata.type.Single" },
	"Edm.Stream": { type: "sap.ui.model.odata.type.Stream" },
	"Edm.Binary": { type: "sap.ui.model.odata.type.Stream" },
	"Edm.String": {
		constraints: {
			"@com.sap.vocabularies.Common.v1.IsDigitSequence": "isDigitSequence",
			"$MaxLength": "maxLength",
			"$Nullable": "nullable"
		},
		type: "sap.ui.model.odata.type.String"
	},
	"Edm.TimeOfDay": {
		constraints: {
			"$Precision": "precision"
		},
		type: "sap.ui.model.odata.type.TimeOfDay"
	}
};

export const ODATA_TYPE_MAPPING: Record<string, any> = {
	"sap.ui.model.odata.type.Boolean": "Edm.Boolean",
	"sap.ui.model.odata.type.Byte": "Edm.Byte",
	"sap.ui.model.odata.type.Date": "Edm.Date",
	"sap.ui.model.odata.type.DateTimeOffset": "Edm.DateTimeOffset",
	"sap.ui.model.odata.type.Decimal": "Edm.Decimal",
	"sap.ui.model.odata.type.Double": "Edm.Double",
	"sap.ui.model.odata.type.Guid": "Edm.Guid",
	"sap.ui.model.odata.type.Int16": "Edm.Int16",
	"sap.ui.model.odata.type.Int32": "Edm.Int32",
	"sap.ui.model.odata.type.Int64": "Edm.Int64",
	"sap.ui.model.odata.type.SByte": "Edm.SByte",
	"sap.ui.model.odata.type.Single": "Edm.Single",
	"sap.ui.model.odata.type.Stream": "Edm.Stream",
	"sap.ui.model.odata.type.TimeOfDay": "Edm.TimeOfDay",
	"sap.ui.model.odata.type.String": "Edm.String"
};

export type DisplayMode = "Value" | "Description" | "DescriptionValue" | "ValueDescription";
export const getDisplayMode = function (oPropertyPath: PropertyOrPath<Property>, oDataModelObjectPath?: DataModelObjectPath): DisplayMode {
	if (!oPropertyPath || typeof oPropertyPath === "string") {
		return "Value";
	}
	const oProperty =
		((isPathExpression(oPropertyPath) || isPropertyPathExpression(oPropertyPath)) && (oPropertyPath.$target as Property)) ||
		(oPropertyPath as Property);
	const oEntityType = oDataModelObjectPath && oDataModelObjectPath.targetEntityType;
	const oTextAnnotation = oProperty.annotations?.Common?.Text;
	const oTextArrangementAnnotation =
		(typeof oTextAnnotation !== "string" && oTextAnnotation?.annotations?.UI?.TextArrangement?.toString()) ||
		oEntityType?.annotations?.UI?.TextArrangement?.toString();

	let sDisplayValue = oTextAnnotation ? "DescriptionValue" : "Value";
	if ((oTextAnnotation && oTextArrangementAnnotation) || oEntityType?.annotations?.UI?.TextArrangement?.toString()) {
		if (oTextArrangementAnnotation === "UI.TextArrangementType/TextOnly") {
			sDisplayValue = "Description";
		} else if (oTextArrangementAnnotation === "UI.TextArrangementType/TextLast") {
			sDisplayValue = "ValueDescription";
		} else if (oTextArrangementAnnotation === "UI.TextArrangementType/TextSeparate") {
			sDisplayValue = "Value";
		} else {
			//Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
			sDisplayValue = "DescriptionValue";
		}
	}
	return sDisplayValue as DisplayMode;
};
