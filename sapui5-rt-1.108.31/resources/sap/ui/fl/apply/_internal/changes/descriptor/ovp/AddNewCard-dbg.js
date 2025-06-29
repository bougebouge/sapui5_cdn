/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([

], function(

) {
	"use strict";

	/**
	 * Descriptor change merger for change type <code>appdescr_ovp_addNewCard</code>.
	 * Adds a new card by changing the manifest value <code>sap.ovp/cards</code>.
	 *
	 * Available for both runtime and build {@link sap.ui.fl.apply._internal.changes.descriptor.Registration}.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.ovp.AddNewCard
	 * @experimental
	 * @version 1.108.28
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var AddNewCard = {

		/**
		 * Method to apply the <code>appdescr_ovp_addNewCard</code> change to the manifest.
		 * @param {object} oManifest Original manifest
		 * @param {object} oChange Change made by key user
		 * @param {object} oChange.content.card New card created by Key user
		 * @returns {object} Updated manifest
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest, oChange) {
			/* logic for changemerger */
			var oNewCard = oChange.getContent();
			var oOldCards = oManifest["sap.ovp"].cards;
			if ("card" in oNewCard && Object.keys(oNewCard.card).length > 0 && !(Object.keys(oNewCard.card) in oOldCards)) {
				Object.assign(oOldCards, oNewCard.card);
			} else {
				throw Error("No new card found");
			}
			return oManifest;
		}

	};

	return AddNewCard;
});
