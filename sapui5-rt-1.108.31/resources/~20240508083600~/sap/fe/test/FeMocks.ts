import type { MockedInstance, UI5InstanceType, WithMock } from "@sap-ux/jest-mock-ui5/dist/generic";
import { mock } from "@sap-ux/jest-mock-ui5/dist/generic";
import InternalEditFlow from "sap/fe/core/controllerextensions/InternalEditFlow";
import PageController from "sap/fe/core/PageController";
import type Controller from "sap/ui/core/mvc/Controller";
import FilterBar from "sap/ui/mdc/FilterBar";

interface CommonControllerType {
	getExtensionAPI: any;
	_editFlow: WithMock<InternalEditFlow>;
}

export interface ListReportControllerType {
	_getFilterBarControl: any;
	_getControls: any;
	_isFilterBarHidden: any;
	_isMultiMode: any;
	_getMultiModeControl: any;
	_getFilterBarVariantControl: any;
	_hasMultiVisualizations: any;
	_shouldAutoTriggerSearch: any;
	_getTable: any;
}

export interface ObjectPageControllerType {
	getStickyEditMode: any;
}

export function mockListReportController(): WithMock<Controller & PageController & ListReportControllerType & CommonControllerType> {
	// manually add ListReportController.controller functions since I am unable to import the prototype
	const listReport: MockedInstance<ListReportControllerType & CommonControllerType> = {
		_getFilterBarControl: jest.fn(),
		_getControls: jest.fn(),
		_isFilterBarHidden: jest.fn(),
		_isMultiMode: jest.fn(),
		_getMultiModeControl: jest.fn(),
		_getFilterBarVariantControl: jest.fn(),
		_hasMultiVisualizations: jest.fn(),
		_shouldAutoTriggerSearch: jest.fn(),
		_getTable: jest.fn(),
		getExtensionAPI: jest.fn(),
		_editFlow: mock(InternalEditFlow) as any
	};
	return Object.assign(mock(PageController) as any, listReport) as WithMock<
		Controller & PageController & ListReportControllerType & CommonControllerType
	>;
}

export function mockObjectPageController(): WithMock<Controller & PageController & ObjectPageControllerType & CommonControllerType> {
	// manually add ListReportController.controller functions since I am unable to import the prototype
	const objectPage: MockedInstance<ObjectPageControllerType & CommonControllerType> = {
		getStickyEditMode: jest.fn(),
		getExtensionAPI: jest.fn(),
		_editFlow: mock(InternalEditFlow) as any
	};
	return Object.assign(mock(PageController) as any, objectPage) as WithMock<
		Controller & PageController & ObjectPageControllerType & CommonControllerType
	>;
}

export function mockContextForExtension<EXT extends object, BASE extends object>(
	extension: EXT,
	controller: WithMock<Controller>,
	base?: BASE
): WithMock<EXT & UI5InstanceType<BASE>> {
	const view = controller.getView();
	(extension as any).getView = () => view;
	const mockedBase = mock(base || {});
	return Object.assign(mockedBase, extension) as WithMock<EXT & UI5InstanceType<BASE>>;
}

export function mockFilterBar(): WithMock<
	FilterBar & { waitForInitialization: Function; _bSearchTriggered: Boolean; _getConditionModel: Function }
> {
	const filterBar = mock(FilterBar) as WithMock<
		FilterBar & { waitForInitialization: Function; _bSearchTriggered: Boolean; _getConditionModel: Function }
	>;
	filterBar.mock.waitForInitialization = jest.fn();
	return filterBar;
}
