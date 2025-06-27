import "sap/f/library";
import "sap/fe/common/library";
import "sap/fe/core/library";
import "sap/fe/macros/library";
import MultipleMode from "sap/fe/templates/ListReport/view/fragments/MultipleMode.fragment";
import DraftHandlerButton from "sap/fe/templates/ObjectPage/components/DraftHandlerButton";
import Core from "sap/ui/core/Core";
import "sap/ui/core/library";
/**
 * Library providing the official templates supported by SAP Fiori elements.
 *
 * @namespace
 * @name sap.fe.templates
 * @public
 */

/**
 * @namespace
 * @name sap.fe.templates.ListReport
 * @public
 */

/**
 * @namespace
 * @name sap.fe.templates.ObjectPage
 * @public
 */
const thisLib = Core.initLibrary({
	name: "sap.fe.templates",
	dependencies: ["sap.ui.core", "sap.fe.core", "sap.fe.macros", "sap.fe.common", "sap.f"],
	types: ["sap.fe.templates.ObjectPage.SectionLayout"],
	interfaces: [],
	controls: [],
	elements: [],
	// eslint-disable-next-line no-template-curly-in-string
	version: "${version}",
	noLibraryCSS: true
}) as any;

if (!thisLib.ObjectPage) {
	thisLib.ObjectPage = {};
}
thisLib.ObjectPage.SectionLayout = {
	/**
	 * All sections are shown in one page
	 *
	 * @public
	 */
	Page: "Page",

	/**
	 * All top-level sections are shown in an own tab
	 *
	 * @public
	 */
	Tabs: "Tabs"
};

MultipleMode.register();
DraftHandlerButton.register();

export default thisLib;
