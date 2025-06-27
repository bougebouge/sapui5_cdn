import Core from "sap/ui/core/Core";
import "sap/ui/core/library";

/**
 * Common library for all cross-application features/controls.
 *
 * @namespace
 * @name sap.fe.common
 * @private
 * @since 1.83.0
 */

/**
 * Initialization Code and shared classes of library sap.fe.common
 */

// library dependencies
const thisLib = Core.initLibrary({
	name: "sap.fe.common",
	// eslint-disable-next-line no-template-curly-in-string
	version: "${version}",
	dependencies: ["sap.ui.core"],
	types: [],
	interfaces: [],
	controls: [],
	elements: [],
	noLibraryCSS: true
});
export default thisLib;
