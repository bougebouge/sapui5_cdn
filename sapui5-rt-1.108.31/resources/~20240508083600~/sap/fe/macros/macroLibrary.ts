import { registerBuildingBlock } from "sap/fe/core/buildingBlocks/BuildingBlockRuntime";
import FormBuildingBlock from "sap/fe/macros/form/FormBuildingBlock";
import FormContainerBuildingBlock from "sap/fe/macros/form/FormContainerBuildingBlock";
import SituationsIndicator from "sap/fe/macros/situations/SituationsIndicator.fragment";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import Chart from "./chart/Chart.metadata";
import Contact from "./contact/Contact.metadata";
import DraftIndicator from "./draftIndicator/DraftIndicator.metadata";
import FlexibleColumnLayoutActions from "./fcl/FlexibleColumnLayoutActions.metadata";
import Field from "./field/PublicField";
import FilterBar from "./filterBar/FilterBar.metadata";
import FormElement from "./form/FormElement.metadata";
import ActionCommand from "./internal/ActionCommand.metadata";
import CollectionField from "./internal/CollectionField.metadata";
import DataPoint from "./internal/DataPoint.metadata";
import InternalField from "./internal/Field.metadata";
import FilterField from "./internal/FilterField.metadata";
import KPITag from "./kpiTag/KPITag.metadata";
import MicroChart from "./microchart/MicroChart.metadata";
import Paginator from "./paginator/Paginator.metadata";
import QuickViewForm from "./quickView/QuickViewForm.metadata";
import Share from "./share/Share.block";
import Table from "./table/Table.metadata";
import ValueHelp from "./valuehelp/ValueHelp.metadata";
import ValueHelpFilterBar from "./valuehelp/ValueHelpFilterBar.metadata";
import VisualFilter from "./visualfilters/VisualFilter.metadata";

const sNamespace = "sap.fe.macros",
	aControls = [
		Table,
		FormBuildingBlock,
		FormContainerBuildingBlock,
		Field,
		InternalField,
		FilterBar,
		FilterField,
		Chart,
		ValueHelp,
		ValueHelpFilterBar,
		MicroChart,
		Contact,
		QuickViewForm,
		VisualFilter,
		DraftIndicator,
		DataPoint,
		FormElement,
		FlexibleColumnLayoutActions,
		KPITag,
		CollectionField,
		Paginator,
		ActionCommand,
		SituationsIndicator
	].map(function (vEntry) {
		if (typeof vEntry === "string") {
			return {
				name: vEntry,
				namespace: sNamespace,
				metadata: {
					metadataContexts: {},
					properties: {},
					events: {}
				}
			};
		}
		return vEntry;
	});

function registerAll() {
	// as a first version we expect that there's a fragment with exactly the namespace/name
	Share.register();
	aControls.forEach(function (oEntry) {
		registerBuildingBlock(oEntry);
	});
}

//This is needed in for templating test utils
function deregisterAll() {
	aControls.forEach(function (oEntry) {
		XMLPreprocessor.plugIn(null, oEntry.namespace, oEntry.name);
	});
}

//Always register when loaded for compatibility
registerAll();

export default {
	register: registerAll,
	deregister: deregisterAll
};
