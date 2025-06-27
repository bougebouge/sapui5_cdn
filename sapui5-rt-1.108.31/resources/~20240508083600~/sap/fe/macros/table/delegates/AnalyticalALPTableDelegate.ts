import ALPTableDelegateBaseMixin from "sap/fe/macros/table/delegates/ALPTableDelegateBaseMixin";
import AnalyticalTableDelegate from "sap/fe/macros/table/delegates/AnalyticalTableDelegate";
/**
 * Helper class for sap.ui.mdc.Table.
 * <h3><b>Note:</b></h3>
 * The class is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
 *
 * @author SAP SE
 * @private
 * @experimental
 * @since 1.69
 * @alias sap.fe.macros.AnalyticalALPTableDelegate
 */
const AnalyticalALPTableDelegate = Object.assign({}, AnalyticalTableDelegate, ALPTableDelegateBaseMixin, {
	_getDelegateParentClass: function () {
		return AnalyticalTableDelegate;
	}
});

export default AnalyticalALPTableDelegate;
