import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import ViewState from "sap/fe/core/controllerextensions/ViewState";
import { defineUI5Class, usingExtension } from "sap/fe/core/helpers/ClassSupport";
import KeepAliveHelper from "sap/fe/core/helpers/KeepAliveHelper";
import Link from "sap/m/Link";
import MessageBox, { Action, Icon } from "sap/m/MessageBox";
import MessagePage from "sap/m/MessagePage";
import type NavContainer from "sap/m/NavContainer";
import ComponentContainer from "sap/ui/core/ComponentContainer";
import XMLView from "sap/ui/core/mvc/XMLView";
import type JSONModel from "sap/ui/model/json/JSONModel";
import BaseController from "./RootViewBaseController";

/**
 * Base controller class for your own root view with a sap.m.NavContainer control.
 *
 * By using or extending this controller you can use your own root view with the sap.fe.core.AppComponent and
 * you can make use of SAP Fiori elements pages and SAP Fiori elements building blocks.
 *
 * @hideconstructor
 * @public
 * @since 1.108.0
 */
@defineUI5Class("sap.fe.core.rootView.NavContainer")
class NavContainerController extends BaseController {
	@usingExtension(
		ViewState.override({
			applyInitialStateOnly: function () {
				return false;
			},
			adaptBindingRefreshControls: function (this: ViewState, aControls: any) {
				const oView = this.getView(),
					oController = oView.getController() as NavContainerController;
				aControls.push(oController._getCurrentPage(oView));
			},
			adaptStateControls: function (this: ViewState, aStateControls: any) {
				const oView = this.getView(),
					oController = oView.getController() as NavContainerController;
				aStateControls.push(oController._getCurrentPage(oView));
			},
			onRestore: function (this: ViewState) {
				const oView = this.getView(),
					oController = oView.getController() as NavContainerController,
					oNavContainer = oController.getAppContentContainer(oView);
				const oInternalModel = oNavContainer.getModel("internal") as JSONModel;
				const oPages = oInternalModel.getProperty("/pages");

				for (const sComponentId in oPages) {
					oInternalModel.setProperty(`/pages/${sComponentId}/restoreStatus`, "pending");
				}
				oController.onContainerReady();
			},
			onSuspend: function (this: ViewState) {
				const oView = this.getView(),
					oNavController = oView.getController() as NavContainerController,
					oNavContainer = oNavController.getAppContentContainer(oView) as NavContainer;
				const aPages = oNavContainer.getPages();
				aPages.forEach(function (oPage: any) {
					const oTargetView = CommonUtils.getTargetView(oPage);

					const oController = oTargetView && oTargetView.getController();
					if (oController && oController.viewState && oController.viewState.onSuspend) {
						oController.viewState.onSuspend();
					}
				});
			}
		})
	)
	viewState!: ViewState;
	private oMessagePage?: MessagePage;

	onContainerReady() {
		// Restore views if neccessary.
		const oView = this.getView(),
			oPagePromise = this._getCurrentPage(oView);

		return oPagePromise.then(function (oCurrentPage: any) {
			const oTargetView = CommonUtils.getTargetView(oCurrentPage);
			return KeepAliveHelper.restoreView(oTargetView);
		});
	}

	_getCurrentPage(this: NavContainerController, oView: any) {
		const oNavContainer = this.getAppContentContainer(oView) as NavContainer;
		return new Promise(function (resolve: (value: any) => void) {
			const oCurrentPage = oNavContainer.getCurrentPage() as any;
			if (
				oCurrentPage &&
				oCurrentPage.getController &&
				oCurrentPage.getController().isPlaceholder &&
				oCurrentPage.getController().isPlaceholder()
			) {
				oCurrentPage.getController().attachEventOnce("targetPageInsertedInContainer", function (oEvent: any) {
					const oTargetPage = oEvent.getParameter("targetpage");
					const oTargetView = CommonUtils.getTargetView(oTargetPage);
					resolve(oTargetView !== oView && oTargetView);
				});
			} else {
				const oTargetView = CommonUtils.getTargetView(oCurrentPage);
				resolve(oTargetView !== oView && oTargetView);
			}
		});
	}

	/**
	 * @private
	 * @name sap.fe.core.rootView.NavContainer.getMetadata
	 * @function
	 */

	_getNavContainer() {
		return this.getView().getContent()[0];
	}

	/**
	 * Gets the instanced views in the navContainer component.
	 *
	 * @returns {Array} Return the views.
	 */
	getInstancedViews(): XMLView[] {
		return ((this._getNavContainer() as NavContainer).getPages() as ComponentContainer[]).map((oPage) =>
			(oPage as any).getComponentInstance().getRootControl()
		);
	}

	/**
	 * Check if the FCL component is enabled.
	 *
	 * @function
	 * @name sap.fe.core.rootView.NavContainer.controller#isFclEnabled
	 * @memberof sap.fe.core.rootView.NavContainer.controller
	 * @returns `false` since we are not in FCL scenario
	 * @ui5-restricted
	 * @final
	 */
	isFclEnabled() {
		return false;
	}

	_scrollTablesToLastNavigatedItems() {
		// Do nothing
	}

	displayMessagePage(sErrorMessage: any, mParameters: any): Promise<boolean> {
		return new Promise((resolve: any, reject: any) => {
			try {
				const oNavContainer = this._getNavContainer() as NavContainer;

				if (!this.oMessagePage) {
					this.oMessagePage = new MessagePage({
						showHeader: false,
						icon: "sap-icon://message-error"
					});

					oNavContainer.addPage(this.oMessagePage);
				}

				this.oMessagePage.setText(sErrorMessage);

				if (mParameters.technicalMessage) {
					this.oMessagePage.setCustomDescription(
						new Link({
							text: mParameters.description || mParameters.technicalMessage,
							press: function () {
								MessageBox.show(mParameters.technicalMessage, {
									icon: Icon.ERROR,
									title: mParameters.title,
									actions: [Action.OK],
									defaultAction: Action.OK,
									details: mParameters.technicalDetails || "",
									contentWidth: "60%"
								} as any);
							}
						})
					);
				} else {
					this.oMessagePage.setDescription(mParameters.description || "");
				}

				if (mParameters.handleShellBack) {
					const oErrorOriginPage = oNavContainer.getCurrentPage(),
						oAppComponent = CommonUtils.getAppComponent(oNavContainer.getCurrentPage());
					oAppComponent.getShellServices().setBackNavigation(function () {
						(oNavContainer as any).to(oErrorOriginPage.getId());
						oAppComponent.getShellServices().setBackNavigation();
					});
				}
				oNavContainer.attachAfterNavigate(function () {
					resolve(true);
				});
				(oNavContainer as any).to(this.oMessagePage.getId());
			} catch (e) {
				reject(false);
				Log.info(e as any);
			}
		});
	}
}

export default NavContainerController;
