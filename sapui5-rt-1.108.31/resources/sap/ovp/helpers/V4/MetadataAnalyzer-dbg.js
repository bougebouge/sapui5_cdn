sap.ui.define([], function() {
    "use strict";

    /**
     * Evaluates OData metamodel and returns entity set name for given entity type
     * @param {sap.ui.model.odata.v4.ODataMetaModel} oMetaModel OData metadata model
     * @param {object} sEntityType 
     * @returns {string} Entity set name
     */
    function getEntitySetName(oMetaModel, sEntityType) {
        var oEntityContainer = oMetaModel.getObject("/");
        for (var key in oEntityContainer) {
            if (typeof oEntityContainer[key] === "object" && oEntityContainer[key].$Type === sEntityType) {
                return key;
            }
        }
    }

    return {
        getEntitySetName: getEntitySetName
    };
}, /** bExport */ true);