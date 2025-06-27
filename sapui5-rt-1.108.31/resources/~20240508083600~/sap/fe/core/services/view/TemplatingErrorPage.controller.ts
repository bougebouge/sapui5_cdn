import Controller from "sap/ui/core/mvc/Controller";
import InternalRouting from "sap/fe/core/controllerextensions/InternalRouting";
import { defineUI5Class, usingExtension } from "sap/fe/core/helpers/ClassSupport";

@defineUI5Class("sap.fe.core.services.view.TemplatingErrorPage")
class TemplatingErrorPage extends Controller {
	@usingExtension(InternalRouting)
	_routing!: InternalRouting;
}

export default TemplatingErrorPage;
