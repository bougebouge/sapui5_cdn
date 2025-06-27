import type { ConvertedMetadata, EntityType, PropertyPath } from "@sap-ux/vocabularies-types";
import Log from "sap/base/Log";
import type AppComponent from "sap/fe/core/AppComponent";
import type {
	ControlSideEffectsEntityDictionary,
	ControlSideEffectsType,
	ODataSideEffectsType,
	SideEffectsType
} from "sap/fe/core/services/SideEffectsServiceFactory";
import FieldRuntime from "sap/fe/macros/field/FieldRuntime";
import type Event from "sap/ui/base/Event";
import type Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import ControllerExtension from "sap/ui/core/mvc/ControllerExtension";
import type Binding from "sap/ui/model/Binding";
import type Context from "sap/ui/model/Context";
import CommonUtils from "../CommonUtils";
import { defineUI5Class, finalExtension, methodOverride, privateExtension, publicExtension } from "../helpers/ClassSupport";

type FieldControl = Control & {
	getFieldHelp(): string;
	getFieldGroupIds(): string[];
};

type FieldEventPropertyType = {
	promise: Promise<any>;
	field: FieldControl;
	sideEffectsMap: FieldSideEffectDictionary;
};

type BaseSideEffectPropertyType = {
	name: string;
	immediate?: boolean;
	sideEffects: SideEffectsType;
	previouslyFailed?: boolean;
};

export type MassEditFieldSideEffectPropertyType = BaseSideEffectPropertyType;

export type FieldSideEffectPropertyType = BaseSideEffectPropertyType & {
	context: Context;
};

type FieldSideEffectDictionary = Record<string, FieldSideEffectPropertyType>;

type MassEditFieldSideEffectDictionary = Record<string, MassEditFieldSideEffectPropertyType>;

type FailedSideEffectDictionary = Record<string, SideEffectsType[]>;

type FieldGroupSideEffectType = {
	promises: Promise<any>[];
	sideEffectProperty: FieldSideEffectPropertyType;
	processStarted?: boolean;
};

type FieldGroupQueueMapType = {
	[sideEffectName: string]: {
		[contextPath: string]: FieldGroupSideEffectType;
	};
};

@defineUI5Class("sap.fe.core.controllerextensions.SideEffects")
class SideEffectsControllerExtension extends ControllerExtension {
	private _oView: any;
	private _oAppComponent!: AppComponent;
	private _mFieldGroupQueue!: FieldGroupQueueMapType;
	private _aSourcePropertiesFailure!: Set<string>;
	private _oSideEffectsService!: any;
	private _mFailedSideEffects!: FailedSideEffectDictionary;

	@methodOverride()
	public onInit() {
		this._oView = (this as any).base.getView();
		this._oAppComponent = CommonUtils.getAppComponent(this._oView);
		this._oSideEffectsService = (this._oAppComponent as any).getSideEffectsService();
		this._mFieldGroupQueue = {};
		this._aSourcePropertiesFailure = new Set();
		this._mFailedSideEffects = {};
	}

	/**
	 * Clear recorded validation status for all properties.
	 *
	 * @function
	 * @name clearPropertiesStatus
	 */
	@publicExtension()
	@finalExtension()
	public clearPropertiesStatus(): void {
		this._aSourcePropertiesFailure.clear();
	}

	/**
	 * Gets failed SideEffects.
	 *
	 * @function
	 * @name getRegisteredFailedRequests
	 * @returns Registered SideEffects requests that have failed
	 */
	@publicExtension()
	@finalExtension()
	public getRegisteredFailedRequests(): FailedSideEffectDictionary {
		return this._mFailedSideEffects;
	}

	@publicExtension()
	@finalExtension()
	public deleteFailedRequestsForAContext(contextPath: string) {
		delete this._mFailedSideEffects[contextPath];
	}

	/**
	 * Manages the workflow for SideEffects with related changes to a field
	 * The following scenarios are managed:
	 *  - Execute: triggers immediate SideEffects requests if the promise for the field event is fulfilled
	 *  - Register: caches deferred SideEffects that will be executed when the FieldGroup is unfocused.
	 *
	 * @function
	 * @name handleFieldChange
	 * @param oEvent SAPUI5 event that comes from a field change
	 * @param oFieldGroupPreRequisite Promise to be fulfilled before executing deferred SideEffects
	 * @returns  Promise on SideEffects request(s)
	 */
	@publicExtension()
	@finalExtension()
	public handleFieldChange(oEvent: Event, oFieldGroupPreRequisite?: Promise<any>): Promise<any> {
		const mEventFieldProperties = this._getFieldProperties(oEvent),
			aImmediateSideEffectsProperties: FieldSideEffectPropertyType[] = this._initializeFieldSideEffects(
				mEventFieldProperties,
				oFieldGroupPreRequisite
			);

		let bIsImmediateTriggered = false;

		return this._generateImmediatePromise(mEventFieldProperties)
			.then(() => {
				bIsImmediateTriggered = true;
				return Promise.all(
					aImmediateSideEffectsProperties.map((mSideEffectsProperty) => {
						return this.requestSideEffects(mSideEffectsProperty.sideEffects, mSideEffectsProperty.context);
					}) || []
				);
			})
			.catch((oError) => {
				if (bIsImmediateTriggered) {
					Log.debug("Error while processing Field SideEffects", oError);
				} else {
					/**
					 * SideEffects have not been triggered since preRequisite validation fails so we need
					 * to keep previously failed request as Failed request (to be retrigger on next change)
					 */

					aImmediateSideEffectsProperties
						.filter((mImmediateSideEffects) => mImmediateSideEffects.previouslyFailed === true)
						.forEach((mImmediateSideEffects) => {
							this._addFailedSideEffects(mImmediateSideEffects.sideEffects, mImmediateSideEffects.context);
						});
				}
			});
	}

	/**
	 * Manages SideEffects with a related 'focus out' to a field group.
	 *
	 * @function
	 * @name handleFieldGroupChange
	 * @param oEvent SAPUI5 Event
	 * @returns Promise on SideEffects request(s)
	 */
	@publicExtension()
	@finalExtension()
	public handleFieldGroupChange(oEvent: Event): Promise<any> {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this,
			aDeferredSideEffects: FieldGroupSideEffectType[] = [],
			aFieldGroupIds: string[] = oEvent.getParameter("fieldGroupIds");

		const getFieldGroupRequestPromise = function (oDeferredSideEffect: FieldGroupSideEffectType) {
			let bIsRequestsTriggered = false;
			const oSideEffectProperty = oDeferredSideEffect.sideEffectProperty;
			const oContext = oSideEffectProperty.context;
			const sContextPath = oContext.getPath();
			const sEntityType = that._oSideEffectsService.getEntityTypeFromContext(oContext);
			const mEntityType = that._getEntityTypeFromFQN(sEntityType);

			return Promise.all(oDeferredSideEffect.promises)
				.then(function () {
					bIsRequestsTriggered = true;

					//Deferred SideEffects are executed only if all sourceProperties have no registered failure.
					if (
						mEntityType &&
						(oSideEffectProperty.sideEffects.SourceProperties as PropertyPath[]).every((sourceProperty) => {
							if (sourceProperty.type === "PropertyPath") {
								const sId = that._generateStatusIndex(mEntityType, sourceProperty.value, oContext);
								if (sId) {
									return !that._aSourcePropertiesFailure.has(sId);
								}
							}
							return true;
						})
					) {
						return that.requestSideEffects(oSideEffectProperty.sideEffects, oSideEffectProperty.context);
					}
					return null;
				})
				.catch((oError) => {
					if (bIsRequestsTriggered) {
						Log.debug(`Error while processing FieldGroup SideEffects on context ${sContextPath}`, oError);
					}
				})
				.finally(() => {
					delete that._mFieldGroupQueue[oSideEffectProperty.name][sContextPath];
				});
		};

		aFieldGroupIds.forEach((sFieldGroupId) => {
			/**
			 * string "$$ImmediateRequest" is added to the SideEffects name during templating to know
			 * if this SideEffects must be immediately executed requested (on field change) or must
			 * be deferred (on field group focus out)
			 *
			 */
			const sSideEffectName: string = sFieldGroupId.replace("$$ImmediateRequest", "");
			const mContextDeferredSideEffects = that._mFieldGroupQueue?.[sSideEffectName];
			if (mContextDeferredSideEffects) {
				Object.keys(mContextDeferredSideEffects).forEach((sContextPath) => {
					const oDeferredSideEffect = mContextDeferredSideEffects[sContextPath];
					if (!oDeferredSideEffect.processStarted) {
						oDeferredSideEffect.processStarted = true;
						aDeferredSideEffects.push(oDeferredSideEffect);
					}
				});
			}
		});

		return Promise.all(
			aDeferredSideEffects.map((oDeferredSideEffect) => {
				return getFieldGroupRequestPromise(oDeferredSideEffect);
			})
		);
	}

	/**
	 * Adds a SideEffects control.
	 *
	 * @function
	 * @name addControlSideEffects
	 * @param sEntityType Name of the entity where the SideEffects control will be registered
	 * @param oSideEffects SideEffects to register. Ensure the sourceControlId matches the associated SAPUI5 control ID.
	 */
	@publicExtension()
	@finalExtension()
	public addControlSideEffects(sEntityType: string, oSideEffects: Omit<ControlSideEffectsType, "fullyQualifiedName">): void {
		this._oSideEffectsService.addControlSideEffects(sEntityType, oSideEffects);
	}

	/**
	 * Removes the queue containing the failed SideEffects.
	 *
	 * @function
	 * @name removeFailedSideEffects
	 */
	@publicExtension()
	@finalExtension()
	public removeFailedSideEffects(): void {
		this._mFailedSideEffects = {};
	}

	/**
	 * Request SideEffects on a specific context.
	 *
	 * @function
	 * @name requestSideEffects
	 * @param oSideEffects SideEffects to be executed
	 * @param oContext Context where SideEffects need to be executed
	 * @param groupId
	 * @param fnGetTargets The callback function which will give us the targets and actions if it was coming through some specific handling.
	 * @returns SideEffects request on SAPUI5 context
	 */
	@publicExtension()
	@finalExtension()
	public async requestSideEffects(
		oSideEffects: SideEffectsType,
		oContext: Context,
		groupId?: string,
		fnGetTargets?: Function
	): Promise<any> {
		let aTargets: any[], sTriggerAction;
		if (fnGetTargets) {
			const targetsAndActionData = await fnGetTargets(oSideEffects);
			aTargets = targetsAndActionData["aTargets"];
			sTriggerAction = targetsAndActionData["TriggerAction"];
		} else {
			aTargets = ((oSideEffects.TargetEntities as any[]) || []).concat((oSideEffects.TargetProperties as any[]) || []);
			sTriggerAction = (oSideEffects as ODataSideEffectsType).TriggerAction;
		}
		if (sTriggerAction) {
			this._oSideEffectsService.executeAction(sTriggerAction, oContext, groupId);
		}

		if (aTargets.length) {
			return this._oSideEffectsService.requestSideEffects(aTargets, oContext, groupId).catch((oError: any) => {
				this._addFailedSideEffects(oSideEffects, oContext);
				return Promise.reject(oError);
			});
		}
		return Promise.resolve();
	}

	/**
	 * Removes SideEffects created by a control.
	 *
	 * @function
	 * @name removeControlSideEffects
	 * @param oControl SAPUI5 Control
	 */
	@publicExtension()
	@finalExtension()
	public removeControlSideEffects(oControl: Control): void {
		const sControlId = oControl && oControl.isA && oControl.isA("sap.ui.base.ManagedObject") && oControl.getId();

		if (sControlId) {
			this._oSideEffectsService.removeControlSideEffects(sControlId);
		}
	}

	/**
	 * Adds SideEffects to the queue of the failed SideEffects
	 * The SideEffects will be retriggered on the next change on the same context.
	 *
	 * @function
	 * @name _addFailedSideEffects
	 * @param oSideEffects SideEffects that need to be retriggered
	 * @param oContext Context where SideEffects have failed
	 */
	@privateExtension()
	@finalExtension()
	private _addFailedSideEffects(oSideEffects: SideEffectsType, oContext: Context): void {
		const sContextPath: string = oContext.getPath();

		this._mFailedSideEffects[sContextPath] = this._mFailedSideEffects[sContextPath] || [];
		const bIsNotAlreadyListed = this._mFailedSideEffects[sContextPath].every(
			(mFailedSideEffects) => oSideEffects.fullyQualifiedName !== mFailedSideEffects.fullyQualifiedName
		);
		if (bIsNotAlreadyListed) {
			this._mFailedSideEffects[sContextPath].push(oSideEffects);
		}
	}

	/**
	 * Generates the promise for the field group that is required before requesting SideEffects.
	 * If the promise is rejected and only the field requires the SideEffects on this context, the SideEffects are removed from the
	 * SideEffects queue.
	 *
	 * @function
	 * @name _generateFieldGroupPromise
	 * @param mEventFieldProperties Field properties
	 * @returns Promise to be used for the validation of the field
	 */
	private _generateFieldGroupPromise(mEventFieldProperties: FieldEventPropertyType): Promise<any> {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const that = this;

		let bPromiseSuccess = true;
		return mEventFieldProperties.promise
			.then(function () {
				return bPromiseSuccess;
			})
			.catch(function () {
				bPromiseSuccess = false;
				return bPromiseSuccess;
			})
			.finally(() => {
				/**
				 * Need to store the status of properties related to this field for deferred SideEffects
				 * since all SourceProperties for this kind of SideEffects must be valid
				 */
				that._saveFieldPropertiesStatus(mEventFieldProperties.field, bPromiseSuccess);
			});
	}

	/**
	 * Generates the promise for the field that is required before requesting immediate SideEffects.
	 *
	 * @function
	 * @name _generateImmediatePromise
	 * @param mEventFieldProperties Field properties
	 * @returns Promise to be used for the validation of the field
	 */
	private _generateImmediatePromise(mEventFieldProperties: FieldEventPropertyType): Promise<any> {
		const oPromise = mEventFieldProperties.promise;
		return oPromise.then(function () {
			/**
			 * If the field gets a FieldHelper, we need to wait until all fields changed by this FieldHelper have been set.
			 * To achieve this, we ensure that all related bindings have been resolved.
			 *
			 * This resolution process is not managed by the Field Event Promise, so for fast user actions (like automation) it can lock the model
			 * and no request can be executed.
			 */
			const oField = mEventFieldProperties.field;
			const sFieldHelperId = oField.getFieldHelp && oField.getFieldHelp();
			if (sFieldHelperId) {
				const oFilterHelp: any = Core.byId(sFieldHelperId);
				if (oFilterHelp && oFilterHelp.getOutParameters) {
					return Promise.all(
						(oFilterHelp.getOutParameters() as any[]).map((oOutParameter) => {
							const oBinding = oOutParameter.getBinding("value");
							return oBinding ? oBinding.requestValue() : Promise.resolve();
						})
					);
				}
			}
			return Promise.all([]);
		});
	}

	/**
	 * Generates a status index.
	 *
	 * @function
	 * @name _generateStatusIndex
	 * @param mEntityType The entity type
	 * @param sPropertyPath The property path
	 * @param oContext SAPUI5 Context
	 * @returns Index
	 */
	private _generateStatusIndex(mEntityType: EntityType, sPropertyPath: string, oContext?: Context | null): string | undefined {
		const sContextPath = oContext?.getPath();
		const mProperty = mEntityType.resolvePath(sPropertyPath);
		if (mProperty) {
			if (mProperty && mProperty._type === "Property") {
				return [mProperty.fullyQualifiedName, sContextPath].join("__");
			}
		}
		return undefined;
	}

	/**
	 * Gets the appropriate context on which SideEffects can be requested.
	 *  The correct one must have the binding parameter $$patchWithoutSideEffects.
	 *
	 * @param oBindingContext
	 * @param sSideEffectEntityType
	 * @returns SAPUI5 Context or undefined
	 */
	@publicExtension()
	@finalExtension()
	public getContextForSideEffects(oBindingContext: any, sSideEffectEntityType: string): Context | undefined {
		let oContextForSideEffects = oBindingContext,
			sEntityType = this._oSideEffectsService.getEntityTypeFromContext(oBindingContext);

		if (sSideEffectEntityType !== sEntityType) {
			oContextForSideEffects = oBindingContext.getBinding().getContext();
			if (oContextForSideEffects) {
				sEntityType = this._oSideEffectsService.getEntityTypeFromContext(oContextForSideEffects);
				if (sSideEffectEntityType !== sEntityType) {
					oContextForSideEffects = oContextForSideEffects.getBinding().getContext();
					if (oContextForSideEffects) {
						sEntityType = this._oSideEffectsService.getEntityTypeFromContext(oContextForSideEffects);
						if (sSideEffectEntityType !== sEntityType) {
							return undefined;
						}
					}
				}
			}
		}

		return oContextForSideEffects || undefined;
	}

	/**
	 * Retrieves the EntityType based on its fully-qualified name.
	 *
	 * @param sFullyQualifiedName The fully-qualified name
	 * @returns The entity type
	 */
	private _getEntityTypeFromFQN(sFullyQualifiedName: string): EntityType | undefined {
		return (this._oSideEffectsService.getConvertedMetaModel() as ConvertedMetadata).entityTypes.find((oEntityType) => {
			return oEntityType.fullyQualifiedName === sFullyQualifiedName;
		});
	}

	/**
	 * Gets the promise of the field validation that is required for the SideEffects process.
	 *
	 * @function
	 * @name _getFieldPromise
	 * @param oEvent Field change event
	 * @returns Field promise
	 */
	private _getFieldPromise(oEvent: Event): Promise<any> {
		const promise = oEvent.getParameter("promise") || Promise.resolve();
		const validity = FieldRuntime.getFieldStateOnChange(oEvent).state.validity;
		return promise.then(() => {
			return new Promise(function (resolve, reject) {
				if (!validity) {
					reject();
				} else {
					resolve(true);
				}
			});
		});
	}

	/**
	 * Gets the properties of the field that are required for the SideEffects process.
	 *
	 * @function
	 * @name _getFieldProperties
	 * @param oEvent Field change event
	 * @returns Field properties (event change promise, field, SideEffects related to this field)
	 */
	private _getFieldProperties(oEvent: Event): FieldEventPropertyType {
		const oField: FieldControl = oEvent.getSource() as FieldControl;

		return {
			promise: this._getFieldPromise(oEvent),
			field: oField,
			sideEffectsMap: this._getFieldSideEffectsMap(oField)
		};
	}

	/**
	 * Gets the SideEffects map
	 * These SideEffects are
	 * - listed into FieldGroupIds (coming from an OData Service)
	 * - generated by a control or controls and that configure this field as SourceProperties.
	 *
	 * @function
	 * @name _getFieldSideEffectsMap
	 * @param oField Field
	 * @returns SideEffects map
	 */
	private _getFieldSideEffectsMap(oField: FieldControl): FieldSideEffectDictionary {
		let mSideEffectsMap: FieldSideEffectDictionary = {};
		const aFieldGroupIds: string[] = oField.getFieldGroupIds(),
			sViewEntitySetSetName = this._oView.getViewData().entitySet,
			oViewEntitySet = (this._oSideEffectsService.getConvertedMetaModel() as ConvertedMetadata).entitySets.find((oEntitySet) => {
				return oEntitySet.name === sViewEntitySetSetName;
			});

		// SideEffects coming from an OData Service
		mSideEffectsMap = this.generateSideEffectsMapFromSideEffectId(aFieldGroupIds, oField) as FieldSideEffectDictionary;

		//SideEffects coming from control(s)
		if (sViewEntitySetSetName && oViewEntitySet) {
			const sViewEntityType = oViewEntitySet.entityType.fullyQualifiedName,
				mFieldPath: any = (oField.getAggregation("customData") as any[]).find((oCustomData) => {
					return oCustomData.getKey() === "sourcePath";
				}),
				oContext: Context | undefined = this.getContextForSideEffects(oField.getBindingContext(), sViewEntityType);

			if (mFieldPath && oContext) {
				const sFieldPath = mFieldPath.getValue().replace(`/${sViewEntitySetSetName}/`, ""),
					mControlEntityType = this._oSideEffectsService.getControlEntitySideEffects(
						sViewEntityType
					) as ControlSideEffectsEntityDictionary;
				Object.keys(mControlEntityType).forEach((sControlName) => {
					const oControlSideEffects: SideEffectsType = mControlEntityType[sControlName];
					if (oControlSideEffects.SourceProperties.includes(sFieldPath)) {
						const sName = `${sControlName}::${sViewEntityType}`;
						mSideEffectsMap[sName] = {
							name: sName,
							immediate: true,
							sideEffects: oControlSideEffects,
							context: oContext
						};
					}
				});
			}
		}
		return mSideEffectsMap;
	}

	/**
	 * Get side effect Name, sideeffect obj and entity type from a given fieldGroupId.
	 *
	 * @param sFieldGroupId
	 * @returns Data about sideeffect name, entitytype, side effect object and if it is immediate.
	 */
	private _getDataToGenerateSideEffectsMapFromSideEffectId(sFieldGroupId: any) {
		const bIsImmediate: boolean = sFieldGroupId.indexOf("$$ImmediateRequest") !== -1,
			sName: string = sFieldGroupId.replace("$$ImmediateRequest", ""),
			aSideEffectParts: string[] = sName.split("#"),
			sSideEffectEntityType: string = aSideEffectParts[0],
			sSideEffectPath: string = `${sSideEffectEntityType}@com.sap.vocabularies.Common.v1.SideEffects${
				aSideEffectParts.length === 2 ? `#${aSideEffectParts[1]}` : ""
			}`,
			oSideEffect: SideEffectsType | undefined =
				this._oSideEffectsService.getODataEntitySideEffects(sSideEffectEntityType)?.[sSideEffectPath];
		return { sName, bIsImmediate, oSideEffect, sSideEffectEntityType };
	}

	/**
	 * Generate the side effects map from id which is the entity and qualifier
	 * for the given entity.
	 *
	 * @function
	 * @param aFieldGroupIds
	 * @param oField
	 * @returns Side effect map with data
	 */

	@publicExtension()
	@finalExtension()
	public generateSideEffectsMapFromSideEffectId(
		aFieldGroupIds: string[],
		oField?: FieldControl
	): MassEditFieldSideEffectDictionary | FieldSideEffectDictionary {
		const mSideEffectsMap: MassEditFieldSideEffectDictionary | FieldSideEffectDictionary = {};
		aFieldGroupIds.forEach((sFieldGroupId: any) => {
			const { sName, bIsImmediate, oSideEffect, sSideEffectEntityType } =
				this._getDataToGenerateSideEffectsMapFromSideEffectId(sFieldGroupId);
			const oContext: Context | undefined = oField
				? this.getContextForSideEffects(oField.getBindingContext(), sSideEffectEntityType)
				: undefined;
			if (oSideEffect && (!oField || (oField && oContext))) {
				mSideEffectsMap[sName] = {
					name: sName,
					immediate: bIsImmediate,
					sideEffects: oSideEffect
				};
				if (oField) {
					(mSideEffectsMap[sName] as FieldSideEffectPropertyType).context = oContext!;
				}
			}
		});
		return mSideEffectsMap;
	}

	/**
	 * Manages the SideEffects with related changes to a field
	 * List: gets immediate SideEffects requests
	 * Register: caches deferred SideEffects that will be executed when the FieldGroup is unfocused.
	 *
	 * @function
	 * @name _initializeFieldSideEffects
	 * @param mEventFieldProperties Field event properties
	 * @param oFieldGroupPreRequisite Promise to be fulfilled before executing deferred SideEffects
	 * @returns  Array of immediate SideEffects
	 */
	private _initializeFieldSideEffects(
		mEventFieldProperties: FieldEventPropertyType,
		oFieldGroupPreRequisite?: Promise<any>
	): FieldSideEffectPropertyType[] {
		const mFieldSideEffectsMap = mEventFieldProperties.sideEffectsMap,
			oFieldPromiseForFieldGroup = this._generateFieldGroupPromise(mEventFieldProperties), // Promise managing FieldGroup requests if Field promise fails
			mFailedSideEffectsName: any = {},
			aImmediateSideEffectsProperties: FieldSideEffectPropertyType[] = [];

		oFieldGroupPreRequisite = oFieldGroupPreRequisite || Promise.resolve();

		Object.keys(mFieldSideEffectsMap).forEach((sSideEffectName) => {
			const oSideEffectProperty: FieldSideEffectPropertyType = mFieldSideEffectsMap[sSideEffectName],
				sSideEffectContextPath = oSideEffectProperty.context?.getPath();
			if (sSideEffectContextPath) {
				const aFailedSideEffects = this._mFailedSideEffects[sSideEffectContextPath];

				if (aFailedSideEffects) {
					delete this._mFailedSideEffects[sSideEffectContextPath];
					mFailedSideEffectsName[sSideEffectContextPath] = {};
					aFailedSideEffects.forEach((mFailedSideEffects: any) => {
						mFailedSideEffectsName[sSideEffectContextPath][mFailedSideEffects.fullyQualifiedName] = true;
						aImmediateSideEffectsProperties.push({
							name: sSideEffectName,
							previouslyFailed: true,
							sideEffects: mFailedSideEffects,
							context: oSideEffectProperty.context
						});
					});
				}

				if (oSideEffectProperty.immediate) {
					// SideEffects will be executed immediately after event promise validation
					if (!mFailedSideEffectsName[sSideEffectContextPath]?.[oSideEffectProperty.sideEffects.fullyQualifiedName]) {
						aImmediateSideEffectsProperties.push({
							name: sSideEffectName,
							sideEffects: oSideEffectProperty.sideEffects,
							context: oSideEffectProperty.context
						});
					}
				} else {
					// Add deferred SideEffects to the related dictionary
					this._mFieldGroupQueue[sSideEffectName] = this._mFieldGroupQueue[sSideEffectName] || {};
					const mSideEffectContextPath = this._mFieldGroupQueue[sSideEffectName][sSideEffectContextPath] || {
						promises: [],
						sideEffectProperty: oSideEffectProperty,
						processStarted: false
					};
					mSideEffectContextPath.promises = mSideEffectContextPath.promises.concat([
						oFieldPromiseForFieldGroup,
						oFieldGroupPreRequisite as Promise<any>
					]);
					this._mFieldGroupQueue[sSideEffectName][sSideEffectContextPath] = mSideEffectContextPath;
				}
			}
		});
		return aImmediateSideEffectsProperties;
	}

	/**
	 * Saves the validation status of properties related to a field control.
	 *
	 * @param oField Field
	 * @param bSuccess Status of the field validation
	 */
	private _saveFieldPropertiesStatus(oField: FieldControl, bSuccess: boolean): void {
		const oBindingContext = oField.getBindingContext();
		const sEntityType = this._oSideEffectsService.getEntityTypeFromContext(oBindingContext);
		const mEntityType = this._getEntityTypeFromFQN(sEntityType);
		if (mEntityType) {
			// Retrieves all properties used by the field
			const oFieldBinding: any = this._getBindingForField(oField);
			const aFieldPaths = oFieldBinding.isA("sap.ui.model.CompositeBinding")
				? (oFieldBinding.getBindings() || []).map((oBinding: any) => oBinding.sPath)
				: [oFieldBinding.getPath()];

			// Stores status for all properties
			aFieldPaths.forEach((sFieldPath: string) => {
				const sId = this._generateStatusIndex(mEntityType, sFieldPath, oBindingContext);
				if (sId) {
					this._aSourcePropertiesFailure[bSuccess ? "delete" : "add"](sId);
				}
			});
		}
	}

	/**
	 * Retrieves the property binding to the value of the field.
	 *
	 * @param oField Field
	 * @returns  Binding to the value
	 */
	private _getBindingForField(oField: FieldControl): Binding {
		let sBindingName = "value";
		if (oField.isA("sap.m.CheckBox")) {
			sBindingName = "selected";
		} else if (oField.isA("sap.fe.core.controls.FileWrapper")) {
			sBindingName = "uploadUrl";
		}
		return oField.getBinding(sBindingName);
	}
}

export default SideEffectsControllerExtension;
