import Log from "sap/base/Log";
import ObjectPath from "sap/base/util/ObjectPath";
import { EDM_TYPE_MAPPING } from "sap/fe/core/templating/DisplayModeFormatter";
import Button from "sap/m/Button";
import Util from "sap/m/table/Util";
import Rem from "sap/ui/dom/units/Rem";
import type Context from "sap/ui/model/Context";

const TableSizeHelper = {
	nbCalls: 0,
	oBtn: undefined as any,
	propertyHelper: undefined as any,
	init: function () {
		// Create a new button in static area sap.ui.getCore().getStaticAreaRef()
		this.nbCalls = this.nbCalls ? this.nbCalls : 0;
		this.nbCalls++;
		this.oBtn = this.oBtn ? this.oBtn : new Button().placeAt(sap.ui.getCore().getStaticAreaRef());
		// Hide button from accessibility tree
		this.oBtn.setVisible(false);
	},
	/**
	 * Method to calculate button's width from a temp created button placed in static area.
	 *
	 * @param sText The text to masure inside the Button.
	 * @returns The value of the Button width.
	 */
	getButtonWidth: function (sText: string) {
		if (this.oBtn.getVisible() === false) {
			this.oBtn.setVisible(true);
		}
		this.oBtn.setText(sText);
		//adding missing styles from buttons inside a table
		// for sync rendering
		this.oBtn.rerender();
		const nButtonWidth = Rem.fromPx(this.oBtn.getDomRef().scrollWidth);
		this.oBtn.setVisible(false);
		return Math.round(nButtonWidth * 100) / 100;
	},

	/**
	 * Method to calculate MDC Column's width.
	 *
	 * @param oProperty The Property or PropertyInfo Object for which the width will be calculated.
	 * @private
	 * @alias sap.fe.macros.TableSizeHelper
	 * @returns The value of the Column width.
	 */
	getMDCColumnWidth: function (oProperty: any): number {
		const propertyODataType = EDM_TYPE_MAPPING[oProperty.typeConfig ? oProperty.typeConfig.className : oProperty.$Type]?.type;
		const PropertyODataConstructor = propertyODataType ? ObjectPath.get(propertyODataType) : null;
		const instance = PropertyODataConstructor ? new PropertyODataConstructor() : null;
		const sSize = instance ? Util.calcColumnWidth(instance) : null;
		if (!sSize) {
			Log.error(`Cannot compute the column width for property: ${oProperty.name}`);
		}
		return sSize ? parseFloat(sSize.replace("Rem", "")) : 0;
	},

	_getPropertyHelperCache: function (sTableId: any) {
		return this.propertyHelper && this.propertyHelper[sTableId];
	},
	_setPropertyHelperCache: function (sTableId: any, oPropertyHelper: any) {
		this.propertyHelper = Object.assign({}, this.propertyHelper);
		this.propertyHelper[sTableId] = oPropertyHelper;
	},

	/**
	 * Method to calculate  width of a DataFieldAnnotation object contained in a fieldgroup.
	 *
	 * @param oData DataFieldAnnotation object.
	 * @param bShowDataFieldsLabel Label is displayed inside the field
	 * @param aProperties Array containing all PropertyInfo objects.
	 * @param oContext Context Object of the parent property.
	 * @private
	 * @alias sap.fe.macros.TableSizeHelper
	 * @returns Object containing the width of the label and the width of the property.
	 */
	getWidthForDataFieldForAnnotation: function (oData: any, bShowDataFieldsLabel: boolean, aProperties: any[], oContext: Context) {
		const oObject = oContext.getObject(oData.Target.$AnnotationPath) as any,
			oValue = oObject.Value;
		let oTargetedProperty,
			nPropertyWidth = 0,
			fLabelWidth = 0;
		if (oValue) {
			oTargetedProperty = this._getPropertiesByPath(
				aProperties,
				(oContext.getObject(oData.Target.$AnnotationPath) as any).Value.$Path
			);
			const oVisualization = (oContext.getObject(oData.Target.$AnnotationPath) as any).Visualization;
			switch (oVisualization && oVisualization.$EnumMember) {
				case "com.sap.vocabularies.UI.v1.VisualizationType/Rating":
					const iTargetedValue = (oContext.getObject(oData.Target.$AnnotationPath) as any).TargetValue;
					nPropertyWidth = parseInt(iTargetedValue, 10) * 1.375;
					break;
				case "com.sap.vocabularies.UI.v1.VisualizationType/Progress":
				default:
					nPropertyWidth = 5;
			}
			const sLabel = oTargetedProperty ? oTargetedProperty.label : oData.Label || "";
			fLabelWidth = bShowDataFieldsLabel && sLabel ? TableSizeHelper.getButtonWidth(sLabel) : 0;
		} else if (oObject.$Type === "com.sap.vocabularies.Communication.v1.ContactType") {
			const propertyPath = oData.Target.$AnnotationPath.replace(/\/@.*/, "");
			const fullNameProperty = oContext.getObject(propertyPath + "/" + oObject.fn.$Path);
			nPropertyWidth = this.getMDCColumnWidth(fullNameProperty);
		} else {
			Log.error(`Cannot compute width for type object: ${oObject.$Type}`);
		}

		return { labelWidth: fLabelWidth, propertyWidth: nPropertyWidth };
	},

	/**
	 * Method to calculate  width of a DataField object.
	 *
	 * @param {object} oData DataFieldAnnotation object.
	 * @param {boolean} bShowDataFieldsLabel Label is displayed inside the field.
	 * @param {Array} aProperties Array containing all PropertyInfo objects.
	 * @param {object} oContext Context Object of the parent property.
	 * @param {object} oTable The Table reference.
	 * @private
	 * @alias sap.fe.macros.TableSizeHelper
	 * @returns {object} Object containing the width of the label and the width of the property.
	 */

	getWidthForDataField: function (oData: any, bShowDataFieldsLabel: boolean, aProperties: any[], oContext: Context /*oTable: Control*/) {
		const oTargetedProperty = this._getPropertiesByPath(aProperties, oData.Value.$Path),
			oTextArrangementTarget = oContext.getObject(`${oData.Value.$Path}@com.sap.vocabularies.Common.v1.Text`) as any,
			oTextArrangementType = oContext.getObject(
				`${oData.Value.$Path}@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement`
			) as any;
		let nPropertyWidth = 0,
			fLabelWidth = 0;
		if (oTargetedProperty) {
			let TextArrangmentTargetWidth = 0;
			if (oTextArrangementTarget && oTextArrangementType) {
				const oTextArrangementTargetProperty = this._getPropertiesByPath(aProperties, oTextArrangementTarget.$Path);
				TextArrangmentTargetWidth = oTextArrangementTargetProperty && this.getMDCColumnWidth(oTextArrangementTargetProperty) - 1;
			}
			switch (oTextArrangementType && oTextArrangementType.$EnumMember) {
				case "com.sap.vocabularies.UI.v1.TextArrangementType/TextFirst":
				case "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast":
					nPropertyWidth = this.getMDCColumnWidth(oTargetedProperty) - 1 + TextArrangmentTargetWidth;
					break;
				case "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly":
					nPropertyWidth = TextArrangmentTargetWidth;
					break;
				case "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate":
				default:
					nPropertyWidth = this.getMDCColumnWidth(oTargetedProperty) - 1;
			}
			const sLabel = oData.Label ? oData.Label : oTargetedProperty.label;
			fLabelWidth = bShowDataFieldsLabel && sLabel ? TableSizeHelper.getButtonWidth(sLabel) : 0;
		} else {
			Log.error(`Cannot compute width for type object: ${oData.$Type}`);
		}
		return { labelWidth: fLabelWidth, propertyWidth: nPropertyWidth };
	},

	_getPropertiesByPath: function (aProperties: any, sPath: any) {
		return aProperties.find(function (oProperty: any) {
			return oProperty.path === sPath;
		});
	},

	exit: function () {
		this.nbCalls--;
		if (this.nbCalls === 0) {
			this.oBtn.destroy();
			this.oBtn = null;
		}
	}
};

export default TableSizeHelper;
