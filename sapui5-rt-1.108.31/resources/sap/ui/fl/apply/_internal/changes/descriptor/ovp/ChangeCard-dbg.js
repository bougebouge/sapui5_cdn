/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/base/util/ObjectPath"
], function(
	ObjectPath
) {
	"use strict";

	/**
	 * Descriptor change merger for change type <code>appdescr_app_changeCard</code>.
	 * Sets key user card changes by changing the manifest value <code>sap.ovp/cards</code>.
	 *
	 * Available for both runtime and build {@link sap.ui.fl.apply._internal.changes.descriptor.Registration}.
	 *
	 * @namespace sap.ui.fl.apply._internal.changes.descriptor.ovp.ChangeCard
	 * @experimental
	 * @version 1.108.28
	 * @private
	 * @ui5-restricted sap.ui.fl.apply._internal
	 */
	var ChangeCard = {

		/**
		 * Method to apply the <code>appdescr_app_changeCard</code> change to the manifest.
		 * @param {object} oManifest Original manifest
		 * @param {object} oChange Change made by key user
		 * @param {string} oChange.content.cardId Id of card being changed
		 * @param {string} oChange.content.entityPropertyChange Change content
		 * @param {string} oChange.content.entityPropertyChange.propertyPath Path to the property which should be changed
		 * @param {string} oChange.content.entityPropertyChange.operation Operation that is performed on property defined under propertyPath. Possible value: <code>UPSERT</code>
		 * @param {object} oChange.content.entityPropertyChange.propertyValue New value of <code>dataSource</code> property defined under propertyPath
		 * @returns {object} Updated manifest
		 * @private
		 * @ui5-restricted sap.ui.fl.apply._internal
		 */
		applyChange: function(oManifest, oChange) {
			/* logic for changemerger */
			var oChangedCard = oChange.getContent();
			var bIsOperationValid = oChangedCard.entityPropertyChange.operation === "UPSERT";
			var oOldCards = oManifest["sap.ovp"].cards;
			var oPropertyChange = oChangedCard.entityPropertyChange;
			if (Array.isArray(oPropertyChange)) {
				throw Error("Expected value for oPropertyChange was an object");
			}
			if (!bIsOperationValid) {
				throw Error("This Operation is not supported");
			}
			if (oChangedCard.cardId in oOldCards && "propertyPath" in oPropertyChange) {
				ObjectPath.set([oChangedCard.cardId, oPropertyChange.propertyPath], oPropertyChange.propertyValue, oOldCards);
			} else {
				throw Error("Change card settings was not found");
			}
			return oManifest;
		}

	};

	return ChangeCard;
});
