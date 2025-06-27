import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import BaseObject from "sap/ui/base/Object";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";

@defineUI5Class("sap.fe.core.TemplateModel")
class TemplateModel extends BaseObject {
	public oMetaModel: ODataMetaModel;
	public oConfigModel: any;
	public bConfigLoaded: boolean;
	public fnCreateMetaBindingContext: Function;
	public fnCreateConfigBindingContext: Function;
	public fnSetData: Function;

	constructor(pageConfig: any, oMetaModel: ODataMetaModel) {
		super();
		this.oMetaModel = oMetaModel;
		this.oConfigModel = new JSONModel();
		// don't limit aggregation bindings
		this.oConfigModel.setSizeLimit(Number.MAX_VALUE);
		this.bConfigLoaded = false;
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;

		if (typeof pageConfig === "function") {
			const fnGetObject = this.oConfigModel._getObject.bind(this.oConfigModel);
			this.oConfigModel._getObject = function (sPath: any, oContext: any) {
				if (!that.bConfigLoaded) {
					this.setData(pageConfig());
				}
				return fnGetObject(sPath, oContext);
			};
		} else {
			this.oConfigModel.setData(pageConfig);
		}

		this.fnCreateMetaBindingContext = this.oMetaModel.createBindingContext.bind(this.oMetaModel);
		this.fnCreateConfigBindingContext = this.oConfigModel.createBindingContext.bind(this.oConfigModel);
		this.fnSetData = this.oConfigModel.setData.bind(this.oConfigModel);

		this.oConfigModel.createBindingContext = this.createBindingContext.bind(this);
		this.oConfigModel.setData = this.setData.bind(this);
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		return this.oConfigModel;
	}

	/**
	 * Overwrite the standard setData to keep track whether the external configuration has been loaded or not.
	 *
	 * @param dataToSet The data to set to the json model containing the configuration
	 */
	setData(dataToSet: object) {
		this.fnSetData(dataToSet);
		this.bConfigLoaded = true;
	}

	createBindingContext(sPath: any, oContext?: any, mParameters?: any, fnCallBack?: any) {
		let oBindingContext;
		const bNoResolve = mParameters && mParameters.noResolve;

		oBindingContext = this.fnCreateConfigBindingContext(sPath, oContext, mParameters, fnCallBack);
		const sResolvedPath = !bNoResolve && oBindingContext?.getObject();
		if (sResolvedPath && typeof sResolvedPath === "string") {
			oBindingContext = this.fnCreateMetaBindingContext(sResolvedPath, oContext, mParameters, fnCallBack);
		}

		return oBindingContext;
	}

	destroy() {
		this.oConfigModel.destroy();
		JSONModel.prototype.destroy.apply(this);
	}
}

export default TemplateModel;
