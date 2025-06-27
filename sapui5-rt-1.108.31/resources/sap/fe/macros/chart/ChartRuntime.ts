import ActionRuntime from "sap/fe/core/ActionRuntime";
import ChartUtils from "sap/fe/macros/chart/ChartUtils";
import DelegateUtil from "sap/fe/macros/DelegateUtil";
import type Event from "sap/ui/base/Event";
/**
 * Static class used by MDC Chart during runtime
 *
 * @private
 * @experimental This module is only for internal/experimental use!
 */
const ChartRuntime = {
	/**
	 * Updates the chart after selection or deselection of data points.
	 *
	 * @function
	 * @static
	 * @name sap.fe.macros.chart.ChartRuntime.fnUpdateChart
	 * @memberof sap.fe.macros.chart.ChartRuntime
	 * @param oEvent Event triggered after selection or deselection of data points on chart
	 * @ui5-restricted
	 */
	fnUpdateChart: function (oEvent: Event) {
		const oMdcChart = (oEvent.getSource() as any).getContent(),
			oInnerChart = oMdcChart.getControlDelegate()._getChart(oMdcChart);
		let sActionsMultiselectDisabled,
			oActionOperationAvailableMap = {},
			aActionsMultiselectDisabled: any[] = [];
		// changing drill stack changes order of custom data, looping through all
		oMdcChart.getCustomData().forEach(function (oCustomData: any) {
			if (oCustomData.getKey() === "operationAvailableMap") {
				oActionOperationAvailableMap = JSON.parse(
					DelegateUtil.getCustomData(oMdcChart, "operationAvailableMap") &&
						DelegateUtil.getCustomData(oMdcChart, "operationAvailableMap").customData
				);
			} else if (oCustomData.getKey() === "multiSelectDisabledActions") {
				sActionsMultiselectDisabled = oCustomData.getValue();
				aActionsMultiselectDisabled = sActionsMultiselectDisabled ? sActionsMultiselectDisabled.split(",") : [];
			}
		});
		const oInternalModelContext = oMdcChart.getBindingContext("internal");

		const aSelectedContexts = [];
		let oModelObject;
		const aSelectedDataPoints = ChartUtils.getChartSelectedData(oInnerChart);
		for (let i = 0; i < aSelectedDataPoints.length; i++) {
			aSelectedContexts.push(aSelectedDataPoints[i].context);
		}
		oInternalModelContext.setProperty("selectedContexts", aSelectedContexts);
		oInternalModelContext
			.getModel()
			.setProperty(`${oInternalModelContext.getPath()}/numberOfSelectedContexts`, oInnerChart.getSelectedDataPoints().count);
		for (let j = 0; j < aSelectedContexts.length; j++) {
			const oSelectedContext = aSelectedContexts[j];
			const oContextData = oSelectedContext.getObject();
			for (const key in oContextData) {
				if (key.indexOf("#") === 0) {
					let sActionPath = key;
					sActionPath = sActionPath.substring(1, sActionPath.length);
					oModelObject = oInternalModelContext.getObject();
					oModelObject[sActionPath] = true;
					oInternalModelContext.setProperty("", oModelObject);
				}
			}
			oModelObject = oInternalModelContext.getObject();
		}

		ActionRuntime.setActionEnablement(oInternalModelContext, oActionOperationAvailableMap, aSelectedContexts, "chart");

		if (aSelectedContexts.length > 1) {
			aActionsMultiselectDisabled.forEach(function (sAction: any) {
				oInternalModelContext.setProperty(sAction, false);
			});
		}
	}
};

export default ChartRuntime;
