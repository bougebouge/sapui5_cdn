import CommonUtils from "sap/fe/core/CommonUtils";
import ValueListHelper from "sap/fe/macros/internal/valuehelp/ValueListHelper";
import FieldValueHelpDelegate from "sap/ui/mdc/odata/v4/FieldValueHelpDelegate";

const ODataFieldValueHelpDelegate = Object.assign({}, FieldValueHelpDelegate) as any;
/**
 * Requests to set the <code>filterFields</code> property of the <code>FieldValueHelp</code> element.
 *
 * This function is called when the field help is opened for suggestion.
 * If no search is supported, content controls are not needed right now as the field help is not opened in this case.
 *
 * @param oPayload Payload for delegate
 * @param oFieldHelp Field help instance
 * @returns Promise that is resolved if the <code>FilterFields</code> property is set
 */
ODataFieldValueHelpDelegate.determineSearchSupported = function (oPayload: any, oFieldHelp: any) {
	return ValueListHelper.setValueListFilterFields(oPayload.propertyPath, oFieldHelp, true, oPayload.conditionModel);
};
/**
 * Requests the content of the field help.
 *
 * This function is called when the field help is opened or a key or description is requested.
 *
 * So, depending on the field help control used, all content controls and data need to be assigned.
 * Once they are assigned and the data is set, the returned <code>Promise</code> needs to be resolved.
 * Only then does the field help continue opening or reading data.
 *
 * @param oPayload Payload for the delegate
 * @param oFieldHelp Field help instance
 * @param bSuggestion Field help is called for suggestion
 * @param oProperties Properties contains the key (collectiveSearchKey) of the selected FieldValueHelp in case of multiple FieldValueHelp
 * @returns Promise that is resolved if all content is available
 */
ODataFieldValueHelpDelegate.contentRequest = function (oPayload: any, oFieldHelp: any, bSuggestion: boolean, oProperties: object) {
	return ValueListHelper.showValueListInfo(oPayload.propertyPath, oFieldHelp, bSuggestion, oPayload.conditionModel, oProperties);
};
/**
 * Changes the search string
 *
 * If <code>$search</code> is used, depending on the back end, the search string might need to be adapted.
 *
 * @param oPayload Payload for the delegate
 * @param bTypeahead True if the search is called for a type-ahead
 * @param sSearch Search string
 * @returns Search string to be used
 */
ODataFieldValueHelpDelegate.adjustSearch = function (oPayload: object, bTypeahead: boolean, sSearch: string) {
	return CommonUtils.normalizeSearchTerm(sSearch);
};

export default ODataFieldValueHelpDelegate;
