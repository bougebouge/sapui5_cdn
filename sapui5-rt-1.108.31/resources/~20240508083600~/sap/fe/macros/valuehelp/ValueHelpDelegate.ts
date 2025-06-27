import Log from "sap/base/Log";
import CommonUtils from "sap/fe/core/CommonUtils";
import type { InternalModelContext } from "sap/fe/core/helpers/ModelHelper";
import type { InOutParameter, ValueHelpPayload } from "sap/fe/macros/internal/valuehelp/ValueListHelperNew";
import ValueListHelperNew from "sap/fe/macros/internal/valuehelp/ValueListHelperNew";
import highlightDOMElements from "sap/m/inputUtils/highlightDOMElements";
import type Control from "sap/ui/core/Control";
import type { ConditionObject } from "sap/ui/mdc/condition/Condition";
import Condition from "sap/ui/mdc/condition/Condition";
import ConditionValidated from "sap/ui/mdc/enum/ConditionValidated";
import type FieldBase from "sap/ui/mdc/field/FieldBase";
import type FilterBarBase from "sap/ui/mdc/filterbar/FilterBarBase";
import ValueHelpDelegate from "sap/ui/mdc/odata/v4/ValueHelpDelegate";
import StateUtil from "sap/ui/mdc/p13n/StateUtil";
import type ValueHelp from "sap/ui/mdc/ValueHelp";
import type Container from "sap/ui/mdc/valuehelp/base/Container";
import type Content from "sap/ui/mdc/valuehelp/base/Content";
import type MTable from "sap/ui/mdc/valuehelp/content/MTable";
import type Context from "sap/ui/model/odata/v4/Context";

const FeCoreControlsFilterBar = "sap.fe.core.controls.FilterBar";
const MdcFilterbarFilterBarBase = "sap.ui.mdc.filterbar.FilterBarBase";
const oAfterRenderDelegate = {
	onAfterRendering: function (...args: any[]) {
		const oTable = args[0].srcControl;
		const aTableCellsDomRef = oTable.$().find("tbody .sapMText");
		highlightDOMElements(aTableCellsDomRef, oTable.getParent().getFilterValue(), true);
	}
};

type ConditionObjectMap = Record<string, ConditionObject[]>;

type ExternalStateType = {
	items: { name: string }[];
	filter: ConditionObjectMap;
};

type ConditionPayloadType = { [name in string]: string };

type ConditionPayloadMap = { [path in string]: ConditionPayloadType[] };

export default Object.assign({}, ValueHelpDelegate, {
	/**
	 * Requests the content of the value help.
	 *
	 * This function is called when the value help is opened or a key or description is requested.
	 *
	 * So, depending on the value help content used, all content controls and data need to be assigned.
	 * Once they are assigned and the data is set, the returned <code>Promise</code> needs to be resolved.
	 * Only then does the value help continue opening or reading data.
	 *
	 * @param payload Payload for delegate
	 * @param container Container instance
	 * @param contentId Id of the content shown after this call to retrieveContent
	 * @returns Promise that is resolved if all content is available
	 */
	retrieveContent: function (payload: ValueHelpPayload, container: Container, contentId: string) {
		return ValueListHelperNew.showValueList(payload, container, contentId);
	},

	/**
	 * Callback invoked every time a {@link sap.ui.mdc.ValueHelp ValueHelp} fires a select event or the value of the corresponding field changes
	 * This callback may be used to update external fields.
	 *
	 * @param payload Payload for delegate
	 * @param valueHelp ValueHelp control instance receiving the <code>controlChange</code>
	 * @param reason Reason why the method was invoked
	 * @param config Current configuration provided by the calling control
	 * @since 1.101.0
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	onConditionPropagation: function (payload: ValueHelpPayload, valueHelp: ValueHelp, reason: string, config: any) {
		if (reason !== "ControlChange") {
			/* handle only ControlChange reason */
			return;
		}
		const qualifier = payload.qualifiers[payload.valueHelpQualifier];
		const outParameters = (qualifier?.vhParameters && ValueListHelperNew.getOutParameters(qualifier.vhParameters)) || [],
			field = valueHelp.getControl() as FieldBase,
			filterBar = field.getParent() as FilterBarBase,
			filterBarVH = valueHelp.getParent() as FilterBarBase;
		const filterItemsVH = (filterBarVH.isA(FeCoreControlsFilterBar) as Boolean) && filterBarVH.getFilterItems();
		let aconditions = field.getConditions() as ConditionObject[];
		aconditions = aconditions.filter(function (condition) {
			const conditionPayloadMap = (condition.payload && (condition.payload as ConditionPayloadMap)) || {};
			return conditionPayloadMap[payload.valueHelpQualifier];
		});

		if (filterBar.isA(MdcFilterbarFilterBarBase)) {
			StateUtil.retrieveExternalState(filterBar)
				.then(function (state: ExternalStateType) {
					aconditions.forEach(function (condition) {
						const conditionPayloadMap = condition.payload as ConditionPayloadMap,
							aKeys = conditionPayloadMap && Object.keys(conditionPayloadMap),
							aConditionPayload = outParameters.length && !!aKeys ? conditionPayloadMap[aKeys[0]] : [];
						if (!aConditionPayload) {
							return;
						}
						for (const outParameter of outParameters) {
							const filterTarget = outParameter.source.split("/").pop() || "";
							/* Propagate Out-Parameter only if filter field visible in the LR-Filterbar */
							if (
								/* LR FilterBar or /* LR AdaptFilter */
								filterItemsVH &&
								filterItemsVH.find((item) => item.getId().split("::").pop() === filterTarget)
							) {
								aConditionPayload.forEach(function (conditionPayload) {
									const newCondition = Condition.createCondition(
										"EQ",
										[conditionPayload[outParameter.helpPath]],
										null,
										null,
										ConditionValidated.Validated
									);
									state.filter[filterTarget] = (state.filter && state.filter[filterTarget]) || [];
									state.filter[filterTarget].push(newCondition);
								});
							}
							/* LR SettingsDialog or OP SettingsDialog shall not propagate value to the dialog-filterfields */
							/* OP Settings Dialog shall not propagate value to context */
						}
					});
					StateUtil.applyExternalState(filterBar, state);
				})
				.catch(function (err: Error) {
					Log.error(`ValueHelpDelegate: ${err.message}`);
				});
		} else {
			aconditions.forEach(function (condition) {
				const conditionPayloadMap = condition.payload as ConditionPayloadMap,
					aKeys = conditionPayloadMap && Object.keys(conditionPayloadMap),
					aConditionPayload = outParameters.length && !!aKeys ? conditionPayloadMap[aKeys[0]] : [];
				if (!aConditionPayload) {
					return;
				}
				const context = valueHelp.getBindingContext();
				if (context) {
					outParameters.forEach(function (outParameter) {
						const target = outParameter.source;
						if (aConditionPayload?.length === 1) {
							const outValues = aConditionPayload[0];
							(context as InternalModelContext).setProperty(target, outValues[outParameter.helpPath]);
						} else if (aConditionPayload?.length && aConditionPayload?.length > 1) {
							Log.warning("ValueHelpDelegate: ParamterOut in multi-value-field not supported");
						}
					});
				}
			});
		}
	},

	_createInitialFilterCondition: function (value: any, initialValueFilterEmpty: boolean) {
		let condition: ConditionObject | undefined;

		if (value === undefined || value === null) {
			Log.error("ValueHelpDelegate: value of the property could not be requested");
		} else if (value === "") {
			if (initialValueFilterEmpty) {
				condition = Condition.createCondition("Empty", [], null, null, ConditionValidated.Validated);
			}
		} else {
			condition = Condition.createCondition("EQ", [value], null, null, ConditionValidated.Validated);
		}
		return condition;
	},

	_getInitialFilterConditionsFromBinding: async function (
		inConditions: ConditionObjectMap,
		control: Control,
		inParameters: InOutParameter[]
	) {
		const propertiesToRequest = inParameters.map((inParameter) => inParameter.source);
		const bindingContext = control.getBindingContext() as Context;

		if (!bindingContext) {
			Log.error("ValueHelpDelegate: No BindingContext");
			return inConditions;
		}

		// According to odata v4 api documentation for requestProperty: Property values that are not cached yet are requested from the back end
		const values = await bindingContext.requestProperty(propertiesToRequest);

		for (let i = 0; i < inParameters.length; i++) {
			const inParameter = inParameters[i];
			const condition = this._createInitialFilterCondition(values[i], inParameter.initialValueFilterEmpty);

			if (condition) {
				inConditions[inParameter.helpPath] = [condition];
			}
		}
		return inConditions;
	},

	_getInitialFilterConditionsFromFilterBar: async function (
		inConditions: ConditionObjectMap,
		control: Control,
		inParameters: InOutParameter[]
	) {
		const filterBar = control.getParent() as FilterBarBase;
		const state: ExternalStateType = await StateUtil.retrieveExternalState(filterBar);

		for (const inParameter of inParameters) {
			const sourceField = inParameter.source.split("/").pop() as string;
			const conditions = state.filter[sourceField];

			if (conditions) {
				inConditions[inParameter.helpPath] = conditions;
			}
		}
		return inConditions;
	},

	_partitionInParameters: function (inParameters: InOutParameter[]) {
		const inParameterMap: Record<string, InOutParameter[]> = {
			constant: [],
			binding: [],
			filter: []
		};

		for (const inParameter of inParameters) {
			if (inParameter.constantValue !== undefined) {
				inParameterMap.constant.push(inParameter);
			} else if (inParameter.source.indexOf("$filter") === 0) {
				inParameterMap.filter.push(inParameter);
			} else {
				inParameterMap.binding.push(inParameter);
			}
		}
		return inParameterMap;
	},

	/**
	 * Provides an initial condition configuration everytime a value help content is shown.
	 *
	 * @param payload Payload for delegate
	 * @param content ValueHelp content requesting conditions configuration
	 * @param control Instance of the calling control
	 * @returns Returns a map of conditions suitable for a sap.ui.mdc.FilterBar control
	 * @since 1.101.0
	 */
	getInitialFilterConditions: async function (payload: ValueHelpPayload, content: Content, control: Control | undefined) {
		// highlight text in ValueHelp popover
		if (content?.isA("sap.ui.mdc.valuehelp.content.MTable")) {
			const oPopoverTable = (content as MTable).getTable();
			oPopoverTable?.removeEventDelegate(oAfterRenderDelegate);
			oPopoverTable?.addEventDelegate(oAfterRenderDelegate, this);
		}

		const inConditions: ConditionObjectMap = {};

		if (!control) {
			Log.error("ValueHelpDelegate: Control undefined");
			return inConditions;
		}

		const qualifier = payload.qualifiers[payload.valueHelpQualifier];
		const inParameters = (qualifier.vhParameters && ValueListHelperNew.getInParameters(qualifier.vhParameters)) || [];
		const inParameterMap = this._partitionInParameters(inParameters);
		const isObjectPage = control.getBindingContext();

		for (const inParameter of inParameterMap.constant) {
			const condition = this._createInitialFilterCondition(
				inParameter.constantValue,
				isObjectPage ? inParameter.initialValueFilterEmpty : false // no filter with "empty" on ListReport
			);
			if (condition) {
				inConditions[inParameter.helpPath] = [condition];
			}
		}

		if (inParameterMap.binding.length) {
			await this._getInitialFilterConditionsFromBinding(inConditions, control, inParameterMap.binding);
		}

		if (inParameterMap.filter.length) {
			await this._getInitialFilterConditionsFromFilterBar(inConditions, control, inParameterMap.filter);
		}
		return inConditions;
	},

	/**
	 * Provides the possibility to convey custom data in conditions.
	 * This enables an application to enhance conditions with data relevant for combined key or outparameter scenarios.
	 *
	 * @param payload Payload for delegate
	 * @param content ValueHelp content instance
	 * @param values Description pair for the condition which is to be created
	 * @param context Optional additional context
	 * @returns Optionally returns a serializable object to be stored in the condition payload field
	 * @since 1.101.0
	 */
	createConditionPayload: function (
		payload: ValueHelpPayload,
		content: Content,
		values: any[],
		context: Context
	): ConditionPayloadMap | undefined {
		const qualifier = payload.qualifiers[payload.valueHelpQualifier],
			entry: ConditionPayloadType = {},
			conditionPayload: ConditionPayloadMap = {};
		const control = content.getControl();
		const isMultiValueField = control?.isA("sap.ui.mdc.MultiValueField");
		if (!qualifier.vhKeys || qualifier.vhKeys.length === 1 || isMultiValueField) {
			return undefined;
		}
		qualifier.vhKeys.forEach(function (vhKey) {
			const value = context.getObject(vhKey);
			if (value != null) {
				entry[vhKey] = value?.length === 0 ? "" : value;
			}
		});
		if (Object.keys(entry).length) {
			/* vh qualifier as key for relevant condition */
			conditionPayload[payload.valueHelpQualifier] = [entry];
		}
		return conditionPayload;
	},

	/**
	 * Changes the search string.
	 *
	 * If <code>$search</code> is used, depending on which back-end service is used, the search string might need to be escaped.
	 *
	 * @param payload Payload for delegate
	 * @param typeahead `true` if the search is called for a type-ahead
	 * @param search Search string
	 * @returns Search string to use
	 */
	adjustSearch: function (payload: ValueHelpPayload, typeahead: boolean, search: string) {
		return CommonUtils.normalizeSearchTerm(search);
	},

	/**
	 * Provides the possibility to customize selections in 'Select from list' scenarios.
	 * By default, only condition keys are considered. This may be extended with payload dependent filters.
	 *
	 * @param payload Payload for delegate
	 * @param content ValueHelp content instance
	 * @param item Entry of a given list
	 * @param conditions Current conditions
	 * @returns True, if item is selected
	 * @since 1.101.0
	 */
	isFilterableListItemSelected: function (payload: ValueHelpPayload, content: Content, item: Control, conditions: ConditionObject[]) {
		//In value help dialogs of single value fields the row for the key shouldn´t be selected/highlight anymore BCP: 2270175246
		if (!payload.isValueListWithFixedValues && content.getConfig()?.maxConditions === 1) {
			return false;
		}

		const context = item.getBindingContext();
		const selectedCondition = conditions.find(function (condition) {
			const conditionPayloadMap = condition.payload as ConditionPayloadMap,
				valueHelpQualifier = payload.valueHelpQualifier || "";
			if (!conditionPayloadMap && Object.keys(payload.qualifiers)[0] === valueHelpQualifier) {
				const keyPath = content.getKeyPath();
				return context?.getObject(keyPath) === condition?.values[0];
			}
			const conditionSelectedRow = conditionPayloadMap?.[valueHelpQualifier]?.[0] || {},
				selectedKeys = Object.keys(conditionSelectedRow);
			if (selectedKeys.length) {
				return selectedKeys.every(function (key) {
					return (conditionSelectedRow[key] as any) === context?.getObject(key);
				});
			}
			return false;
		});

		return selectedCondition ? true : false;
	}
});
