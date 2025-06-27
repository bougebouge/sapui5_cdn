import DelegateUtil from "sap/fe/macros/DelegateUtil";
import TableDelegate from "sap/fe/macros/table/delegates/TableDelegate";

/**
 * Helper class for sap.ui.mdc.Table.
 * <h3><b>Note:</b></h3>
 * This class is experimental and not intended for productive usage, since the API/behavior has not been finalized.
 *
 * @author SAP SE
 * @private
 * @experimental
 * @since 1.69
 * @alias sap.fe.macros.TableDelegate
 */
const AnalyticalTableDelegate = Object.assign({}, TableDelegate);

/**
 * Fetches the property extensions.
 * TODO: document structure of the extension.
 *
 * @param oTable Instance of the sap.ui.mdc.Table
 * @returns Key-value map, where the key is the name of the property, and the value is the extension
 * @protected
 */
AnalyticalTableDelegate.fetchPropertyExtensions = function (oTable: any) {
	const mCustomAggregates: any = this._getAggregatedPropertyMap(oTable);

	return Promise.resolve(mCustomAggregates || {});
};

AnalyticalTableDelegate.fetchPropertiesForBinding = function (this: typeof AnalyticalTableDelegate, oTable: any) {
	return DelegateUtil.fetchModel(oTable).then((oModel: any) => {
		if (!oModel) {
			return [];
		}
		return this._getCachedOrFetchPropertiesForEntity(
			oTable,
			DelegateUtil.getCustomData(oTable, "entityType"),
			oModel.getMetaModel(),
			undefined,
			true
		);
	});
};

export default AnalyticalTableDelegate;
