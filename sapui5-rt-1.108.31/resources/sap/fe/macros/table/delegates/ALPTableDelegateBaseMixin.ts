import deepClone from "sap/base/util/deepClone";
import CommonUtils from "sap/fe/core/CommonUtils";
import ChartUtils from "sap/fe/macros/chart/ChartUtils";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import TableUtils from "sap/fe/macros/table/Utils";
import Filter from "sap/ui/model/Filter";

/**
 * Helper class for sap.ui.mdc.Table.
 * <h3><b>Note:</b></h3>
 * The class is experimental and the API/behavior is not finalized; this class is currently not meant for productive usage.
 *
 * @author SAP SE
 * @private
 * @experimental
 * @since 1.69
 * @alias sap.fe.macros.table.ALPTableDelegateBaseMixin
 */

const ALPTableDelegateBaseMixin = {
	_internalUpdateBindingInfo: function (oTable: any, oBindingInfo: any) {
		let oFilterInfo;
		let oChartFilterInfo: any = {},
			oTableFilterInfo: any = {};
		let aChartFilters;

		// We need to deepClone the info we get from the custom data, otherwise some of its subobjects (e.g. parameters) will
		// be shared with oBindingInfo and modified later (Object.assign only does a shallow clone)
		Object.assign(oBindingInfo, deepClone(DelegateUtil.getCustomData(oTable, "rowsBindingInfo")));
		if (oTable.getRowBinding()) {
			oBindingInfo.suspended = false;
		}
		const oView = CommonUtils.getTargetView(oTable);
		const oMdcChart = oView.getController().getChartControl?.();
		const bChartSelectionsExist = ChartUtils.getChartSelectionsExist(oMdcChart, oTable);
		oTableFilterInfo = TableUtils.getAllFilterInfo(oTable);
		const aTableFilters = oTableFilterInfo && oTableFilterInfo.filters;
		oFilterInfo = oTableFilterInfo;
		if (bChartSelectionsExist) {
			oChartFilterInfo = ChartUtils.getAllFilterInfo(oMdcChart);
			aChartFilters = oChartFilterInfo && oChartFilterInfo.filters;
			oFilterInfo = oChartFilterInfo;
		}
		const aFinalFilters = (aTableFilters && aChartFilters ? aTableFilters.concat(aChartFilters) : aChartFilters || aTableFilters) || [];
		const oFilter =
			aFinalFilters.length > 0 &&
			new Filter({
				filters: aFinalFilters,
				and: true
			});

		if (oFilterInfo.bindingPath) {
			// In case of parameters
			oBindingInfo.path = oFilterInfo.bindingPath;
		}

		// Prepare binding info with filter/search parameters
		TableUtils.updateBindingInfo(oBindingInfo, oFilterInfo, oFilter);
	},
	_getDelegateParentClass: function (): any {
		return undefined;
	},
	rebind: function (oTable: any, oBindingInfo: any) {
		const oInternalModelContext = oTable.getBindingContext("pageInternal");
		const sTemplateContentView = oInternalModelContext.getProperty(`${oInternalModelContext.getPath()}/alpContentView`);
		if (sTemplateContentView !== "Chart") {
			this._getDelegateParentClass()?.rebind(oTable, oBindingInfo);
		}
	}
};

export default ALPTableDelegateBaseMixin;
