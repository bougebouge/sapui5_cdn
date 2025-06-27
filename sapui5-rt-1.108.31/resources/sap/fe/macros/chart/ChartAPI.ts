import merge from "sap/base/util/merge";
import { defineUI5Class, event, property, xmlEventHandler } from "sap/fe/core/helpers/ClassSupport";
import FilterUtils from "sap/fe/macros/filter/FilterUtils";
import UI5Event from "sap/ui/base/Event";
import Control from "sap/ui/core/Control";
import MacroAPI from "../MacroAPI";

/**
 * Building block used to create a chart based on the metadata provided by OData V4.
 * <br>
 * Usually, a contextPath and metaPath is expected.
 *
 *
 * Usage example:
 * <pre>
 * &lt;macro:Chart id="Mychart" contextPath="/RootEntity" metaPath="@com.sap.vocabularies.UI.v1.Chart" /&gt;
 * </pre>
 *
 * @alias sap.fe.macros.Chart
 * @public
 */
@defineUI5Class("sap.fe.macros.chart.ChartAPI")
class ChartAPI extends MacroAPI {
	/**
	 *
	 * ID of the chart
	 *
	 * @public
	 */
	@property({ type: "string" })
	id!: string;

	/**
	 * Metadata path to the presentation (UI.Chart w or w/o qualifier)
	 *
	 * @public
	 */
	@property({
		type: "string",
		required: true,
		expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
		expectedAnnotations: ["com.sap.vocabularies.UI.v1.Chart"]
	})
	metaPath!: string;

	/**
	 * Metadata path to the entitySet or navigationProperty
	 *
	 * @public
	 */
	@property({
		type: "string",
		required: true,
		expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty"],
		expectedAnnotations: []
	})
	contextPath!: string;

	/**
	 * Specifies the selection mode
	 *
	 * @public
	 */
	@property({ type: "string", defaultValue: "MULTIPLE" })
	selectionMode!: string;

	/**
	 * Id of the FilterBar building block associated with the chart.
	 *
	 * @public
	 */
	@property({ type: "string" })
	filterBar!: string;

	/**
	 * Parameter which sets the personalization of the MDC chart
	 *
	 * @public
	 */
	@property({ type: "boolean|string" })
	personalization!: boolean | string;

	/**
	 * An event triggered when chart selections are changed. The event contains information about the data selected/deselected and the Boolean flag that indicates whether data is selected or deselected.
	 *
	 * @public
	 */
	@event()
	selectionChange!: Function;

	/**
	 * An event triggered when the chart state changes.
	 *
	 * You can set this in order to store the chart state in the iAppstate.
	 *
	 * @private
	 */
	@event()
	stateChange!: Function;

	/**
	 * An event triggered when the chart requests data.
	 *
	 * @private
	 */
	@event()
	internalDataRequested!: Function;

	onAfterRendering() {
		const view = this.getController().getView();
		const internalModelContext: any = view.getBindingContext("internal");
		const chart = (this as any).getContent();
		const showMessageStrip: any = {};
		const sChartEntityPath = chart.data("entitySet"),
			sCacheKey = `${sChartEntityPath}Chart`,
			oBindingContext = view.getBindingContext();
		showMessageStrip[sCacheKey] =
			chart.data("draftSupported") === "true" && !!oBindingContext && !oBindingContext.getObject("IsActiveEntity");
		internalModelContext.setProperty("controls/showMessageStrip", showMessageStrip);
	}

	refreshNotApplicableFields(oFilterControl: Control): any[] {
		const oChart = (this as any).getContent();
		return FilterUtils.getNotApplicableFilters(oFilterControl, oChart);
	}

	@xmlEventHandler()
	handleSelectionChange(oEvent: UI5Event) {
		const aData = oEvent.getParameter("data");
		const bSelected = oEvent.getParameter("name") === "selectData";
		(this as any).fireSelectionChange(merge({}, { data: aData, selected: bSelected }));
	}

	@xmlEventHandler()
	onInternalDataRequested() {
		(this as any).fireEvent("internalDataRequested");
	}
}

export default ChartAPI;
