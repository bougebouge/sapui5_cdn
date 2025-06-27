import ALPTableDelegateBaseMixin from "sap/fe/macros/table/delegates/ALPTableDelegateBaseMixin";
import TableDelegate from "sap/fe/macros/table/delegates/TableDelegate";
/**
 * Helper class for sap.ui.mdc.Table.
 * <h3><b>Note:</b></h3>
 * The class is experimental and the API/behaviour is not finalised and hence this should not be used for productive usage.
 *
 * @author SAP SE
 * @private
 * @experimental
 * @since 1.69
 * @alias sap.fe.macros.ALPTableDelegate
 */
const ALPTableDelegate = Object.assign({}, TableDelegate, ALPTableDelegateBaseMixin, {
	_getDelegateParentClass: function () {
		return TableDelegate;
	}
});

export default ALPTableDelegate;
