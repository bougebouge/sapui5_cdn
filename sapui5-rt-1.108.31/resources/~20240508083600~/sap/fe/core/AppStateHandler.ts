import Log from "sap/base/Log";
import deepEqual from "sap/base/util/deepEqual";
import { defineUI5Class } from "sap/fe/core/helpers/ClassSupport";
import toES6Promise from "sap/fe/core/helpers/ToES6Promise";
import library from "sap/fe/navigation/library";
import BaseObject from "sap/ui/base/Object";
import BusyLocker from "./controllerextensions/BusyLocker";
import ModelHelper from "./helpers/ModelHelper";

const NavType = library.NavType;

@defineUI5Class("sap.fe.core.AppStateHandler")
class AppStateHandler extends BaseObject {
	public sId: string;
	public oAppComponent: any; // AppComponent
	public bNoRouteChange: boolean;
	private _mCurrentAppState: Record<string, any> = {};
	constructor(oAppComponent: any) {
		super();
		this.oAppComponent = oAppComponent;
		this.sId = `${oAppComponent.getId()}/AppStateHandler`;

		this.bNoRouteChange = false;
		Log.info("APPSTATE : Appstate handler initialized");
	}
	getId() {
		return this.sId;
	}
	/**
	 * Creates/updates the appstate.
	 *
	 * @returns A promise resolving the stored data
	 * @ui5-restricted
	 */
	async createAppState(): Promise<void | any> {
		if (!this.oAppComponent.getEnvironmentCapabilities().getCapabilities().AppState || BusyLocker.isLocked(this)) {
			return;
		}

		const oNavigationService = this.oAppComponent.getNavigationService(),
			oRouterProxy = this.oAppComponent.getRouterProxy(),
			sHash = oRouterProxy.getHash(),
			oController = this.oAppComponent.getRootControl().getController(),
			bIsStickyMode = ModelHelper.isStickySessionSupported(this.oAppComponent.getMetaModel());

		if (!oController.viewState) {
			throw new Error(`viewState controller extension not available for controller: ${oController.getMetadata().getName()}`);
		}

		const mInnerAppState = await oController.viewState.retrieveViewState();
		const oStoreData = { appState: mInnerAppState };
		if (mInnerAppState && !deepEqual(this._mCurrentAppState, mInnerAppState)) {
			this._mCurrentAppState = mInnerAppState;
			try {
				const sAppStateKey = await oNavigationService.storeInnerAppStateAsync(oStoreData, true, true);
				Log.info("APPSTATE: Appstate stored");
				const sNewHash = oNavigationService.replaceInnerAppStateKey(sHash, sAppStateKey);
				if (sNewHash !== sHash) {
					oRouterProxy.navToHash(sNewHash, null, null, null, !bIsStickyMode);
					this.bNoRouteChange = true;
				}
				Log.info("APPSTATE: navToHash");
			} catch (oError: any) {
				Log.error(oError);
			}
		}

		return oStoreData;
	}

	_createNavigationParameters(oAppData: any, sNavType: any) {
		return Object.assign({}, oAppData, {
			selectionVariantDefaults: oAppData.oDefaultedSelectionVariant,
			selectionVariant: oAppData.oSelectionVariant,
			requiresStandardVariant: !oAppData.bNavSelVarHasDefaultsOnly,
			navigationType: sNavType
		});
	}

	/**
	 * Applies an appstate by fetching appdata and passing it to _applyAppstateToPage.
	 *
	 * @function
	 * @static
	 * @memberof sap.fe.core.AppStateHandler
	 * @returns A promise for async handling
	 * @private
	 * @ui5-restricted
	 */
	applyAppState() {
		if (!this.oAppComponent.getEnvironmentCapabilities().getCapabilities().AppState || BusyLocker.isLocked(this)) {
			return Promise.resolve();
		}
		BusyLocker.lock(this);
		// Done for busy indicator
		BusyLocker.lock(this.oAppComponent.getRootControl());

		const oNavigationService = this.oAppComponent.getNavigationService();
		// TODO oNavigationService.parseNavigation() should return ES6 promise instead jQuery.promise
		return toES6Promise(oNavigationService.parseNavigation())
			.catch(function (aErrorData: any) {
				if (!aErrorData) {
					aErrorData = [];
				}
				Log.warning("APPSTATE: Parse Navigation failed", aErrorData[0]);
				return [
					{
						/* app data */
					},
					aErrorData[1],
					aErrorData[2]
				];
			})
			.then((aResults: any) => {
				Log.info("APPSTATE: Parse Navigation done");

				// aResults[1] => oStartupParameters (not evaluated)
				const oAppData = aResults[0] || {},
					sNavType = aResults[2] || NavType.initial,
					oRootController = this.oAppComponent.getRootControl().getController();

				this._mCurrentAppState = sNavType === NavType.iAppState ? oAppData && oAppData.appState : undefined;

				if (!oRootController.viewState) {
					throw new Error(`viewState extension required for controller ${oRootController.getMetadata().getName()}`);
				}
				if (!oAppData && sNavType == NavType.iAppState) {
					return {};
				}
				return oRootController.viewState.applyViewState(
					this._mCurrentAppState,
					this._createNavigationParameters(oAppData, sNavType)
				);
			})
			.catch(function (oError: any) {
				Log.error("appState could not be applied", oError);
				throw oError;
			})
			.finally(() => {
				BusyLocker.unlock(this);
				BusyLocker.unlock(this.oAppComponent.getRootControl());
			});
	}
	/**
	 * To check is route is changed by change in the iAPPState.
	 *
	 * @returns `true` if the route has chnaged
	 */
	checkIfRouteChangedByIApp() {
		return this.bNoRouteChange;
	}
	/**
	 * Reset the route changed by iAPPState.
	 */
	resetRouteChangedByIApp() {
		if (this.bNoRouteChange) {
			this.bNoRouteChange = false;
		}
	}
	_isListBasedComponent(oComponent: any) {
		return oComponent.isA("sap.fe.templates.ListComponent");
	}
}

/**
 * @global
 */
export default AppStateHandler;
