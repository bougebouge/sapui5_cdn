/* !
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define([
	"sap/base/util/restricted/_pick",
	"sap/base/util/ObjectPath",
	"sap/ui/core/Core",
	"sap/ui/fl/apply/_internal/flexObjects/AppDescriptorChange",
	"sap/ui/fl/apply/_internal/flexObjects/CompVariant",
	"sap/ui/fl/apply/_internal/flexObjects/ControllerExtensionChange",
	"sap/ui/fl/apply/_internal/flexObjects/FlexObject",
	"sap/ui/fl/apply/_internal/flexObjects/FlVariant",
	"sap/ui/fl/Layer",
	"sap/ui/fl/Utils"
], function(
	_pick,
	ObjectPath,
	Core,
	AppDescriptorChange,
	CompVariant,
	ControllerExtensionChange,
	FlexObject,
	FlVariant,
	Layer,
	Utils
) {
	"use strict";

	/**
	 * @enum {string}
	 * Valid flex object types.
	 *
	 * @alias sap.ui.fl.apply._internal.flexObjects.FlexObjectFactory.FLEX_OBJECT_TYPES
	 * @private
	 */
	var FLEX_OBJECT_TYPES = {
		BASE_FLEX_OBJECT: FlexObject,
		COMP_VARIANT_OBJECT: CompVariant,
		FL_VARIANT_OBJECT: FlVariant,
		CONTROLLER_EXTENSION: ControllerExtensionChange,
		APP_DESCRIPTOR_CHANGE: AppDescriptorChange
	};

	function getFlexObjectClass(oNewFileContent) {
		if (oNewFileContent.fileType === "variant") {
			return FLEX_OBJECT_TYPES.COMP_VARIANT_OBJECT;
		} else if (oNewFileContent.fileType === "ctrl_variant") {
			return FLEX_OBJECT_TYPES.FL_VARIANT_OBJECT;
		} else if (oNewFileContent.changeType === "codeExt") {
			return FLEX_OBJECT_TYPES.CONTROLLER_EXTENSION;
		} else if (oNewFileContent.appDescriptorChange) {
			return FLEX_OBJECT_TYPES.APP_DESCRIPTOR_CHANGE;
		}
		return FLEX_OBJECT_TYPES.BASE_FLEX_OBJECT;
	}

	function createBasePropertyBag(mProperties) {
		var sChangeType = mProperties.type || mProperties.changeType;
		var sFileName = mProperties.fileName || mProperties.id || Utils.createDefaultFileName(sChangeType);
		return {
			id: sFileName,
			layer: mProperties.layer,
			content: mProperties.content,
			texts: mProperties.texts,
			supportInformation: {
				service: mProperties.ODataService,
				command: mProperties.command,
				compositeCommand: mProperties.compositeCommand,
				generator: mProperties.generator,
				sapui5Version: Core.getConfiguration().getVersion().toString(),
				sourceSystem: mProperties.sourceSystem,
				sourceClient: mProperties.sourceClient,
				originalLanguage: mProperties.originalLanguage,
				user: mProperties.user
			},
			flexObjectMetadata: {
				changeType: sChangeType,
				reference: mProperties.reference,
				packageName: mProperties.packageName
			}
		};
	}

	/**
	 * Helper class to create any flex object.
	 *
	 * @namespace sap.ui.fl.apply._internal.flexObjects.FlexObjectFactory
	 * @since 1.100
	 * @version 1.108.28
	 * @private
	 * @ui5-restricted sap.ui.fl
	 */
	var FlexObjectFactory = {};

	/**
	 * Creates a new flex object.
	 *
	 * @param {object} oFileContent - File content
	 * @param {class} [ObjectClass] - Object class to be instantiated
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlexObject} Created flex object
	 */
	FlexObjectFactory.createFromFileContent = function (oFileContent, ObjectClass) {
		var oNewFileContent = Object.assign({}, oFileContent);
		var FlexObjectClass = ObjectClass || getFlexObjectClass(oNewFileContent);
		if (!FlexObjectClass) {
			throw new Error("Unknown file type");
		}
		oNewFileContent.support = Object.assign(
			{
				generator: "FlexObjectFactory.createFromFileContent",
				sapui5Version: Core.getConfiguration().getVersion().toString()
			},
			oNewFileContent.support || {}
		);
		var oMappingInfo = FlexObjectClass.getMappingInfo();
		var mCreationInfo = FlexObject.mapFileContent(oNewFileContent, oMappingInfo);
		var mProperties = Object.entries(mCreationInfo).reduce(function (mPropertyMap, aProperty) {
			ObjectPath.set(aProperty[0].split('.'), aProperty[1], mPropertyMap);
			return mPropertyMap;
		}, {});
		var oFlexObject = new FlexObjectClass(mProperties);
		return oFlexObject;
	};

	FlexObjectFactory.createAppDescriptorChange = function(mPropertyBag) {
		mPropertyBag.compositeCommand = mPropertyBag.compositeCommand || mPropertyBag.support && mPropertyBag.support.compositeCommand;
		var mProperties = createBasePropertyBag(mPropertyBag);
		return new AppDescriptorChange(mProperties);
	};

	/**
	 * Creates a new ControllerExtensionChange.
	 *
	 * @param {object} mPropertyBag - File content
	 * @param {string} mPropertyBag.codeRef - Name of the extension file
	 * @param {string} mPropertyBag.controllerName - Name of the Controller
	 * @param {string} mPropertyBag.namespace - See {@link sap.ui.fl.apply._internal.flexObjects.FlexObject.FlexObjectMetadata}
	 * @param {string} mPropertyBag.reference - See {@link sap.ui.fl.apply._internal.flexObjects.FlexObject.FlexObjectMetadata}
	 * @param {string} mPropertyBag.moduleName - Location of the extension file
	 * @param {string} mPropertyBag.generator - See {@link sap.ui.fl.apply._internal.flexObjects.FlexObject.SupportInformation}
	 * @returns {sap.ui.fl.apply._internal.flexObjects.ControllerExtensionChange} Created ControllerExtensionChange instance
	 */
	FlexObjectFactory.createControllerExtensionChange = function(mPropertyBag) {
		mPropertyBag.generator = mPropertyBag.generator || "FlexObjectFactory.createControllerExtensionChange";
		mPropertyBag.changeType = "codeExt";
		mPropertyBag.content = {
			codeRef: mPropertyBag.codeRef
		};

		var mProperties = createBasePropertyBag(mPropertyBag);
		mProperties.flexObjectMetadata.moduleName = mPropertyBag.moduleName;
		mProperties.controllerName = mPropertyBag.controllerName;
		return new ControllerExtensionChange(mProperties);
	};

	/**
	 * Creates a new <code>sap.ui.fl.apply._internal.flexObjects.FlVariant</code>.
	 *
	 * @param {object} mPropertyBag - Properties for the variant
	 * @param {string} mPropertyBag.id - ID of the new variant
	 * @param {string} mPropertyBag.variantName - Name of the new variant
	 * @param {string} mPropertyBag.variantManagementReference - Reference to the variant management control
	 * @param {string} [mPropertyBag.variantReference] - Reference to another variant that is the basis for the new variant
	 * @param {string} [mPropertyBag.user] - Author of the variant
	 * @param {object} [mPropertyBag.contexts] - See {@link sap.ui.fl.apply._internal.flexObjects.Variant}
	 * @param {object} [mPropertyBag.layer] - See {@link sap.ui.fl.apply._internal.flexObjects.FlexObject}
	 * @param {string} [mPropertyBag.reference] - See {@link sap.ui.fl.apply._internal.flexObjects.FlexObject.FlexObjectMetadata}
	 * @param {string} [mPropertyBag.generator] - See {@link sap.ui.fl.apply._internal.flexObjects.FlexObject.SupportInformation}
	 * @returns {sap.ui.fl.apply._internal.flexObjects.FlVariant} Variant instance
	 */
	FlexObjectFactory.createFlVariant = function(mPropertyBag) {
		mPropertyBag.generator = mPropertyBag.generator || "FlexObjectFactory.createFlVariant";
		var mProperties = createBasePropertyBag(mPropertyBag);
		mProperties.variantManagementReference = mPropertyBag.variantManagementReference;
		mProperties.variantReference = mPropertyBag.variantReference;
		mProperties.contexts = mPropertyBag.contexts;
		mProperties.texts = {
			variantName: {
				value: mPropertyBag.variantName,
				type: "XFLD"
			}
		};
		return new FlVariant(mProperties);
	};

	/**
	 * Creates a new flex object of type <code>CompVariant</code>.
	 *
	 * @param {object} oFileContent - File content
	 * @param {string} oFileContent.type - Defines the flex object type - should be variant for CompVariants
	 * @param {string} [oFileContent.fileName] - Acts as the unique identifier on the storage
	 * @param {string} [oFileContent.id] - Unique identifier at runtime
	 *
	 * For the properties below, refer to <code>sap.ui.fl.apply._internal.flexObjects.FlexObject</code>
	 * @param {object} [oFileContent.content] - see above
	 * @param {object} [oFileContent.layer] - see above
	 * @param {object} [oFileContent.texts] - see above
	 * @param {string} [oFileContent.reference] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.FlexObjectMetadata</code>
	 * @param {string} [oFileContent.packageName] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.FlexObjectMetadata</code>
	 * @param {string} [oFileContent.creation] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.FlexObjectMetadata</code>
	 * @param {string} [oFileContent.originalLanguage] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.SupportInformation</code>
	 * @param {string} [oFileContent.sourceSystem] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.SupportInformation</code>
	 * @param {string} [oFileContent.sourceClient] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.SupportInformation</code>
	 * @param {string} [oFileContent.command] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.SupportInformation</code>
	 * @param {string} [oFileContent.generator] - see <code>sap.ui.fl.apply._internal.flexObjects.FlexObject.SupportInformation</code>
	 *
	 * For the properties below, refer to <code>sap.ui.fl.apply._internal.flexObjects.Variant</code>
	 * @param {string} [oFileContent.variantId] - see above
	 * @param {object} [oFileContent.favorite] - see above
	 * @param {object} [oFileContent.contexts] - see above
	 * @param {object} [oFileContent.executeOnSelection] - see above
	 *
	 * @param {string} [oFileContent.persistencyKey] - see <code>sap.ui.fl.apply._internal.flexObjects.CompVariant</code>
	 *
	 * @returns {sap.ui.fl.apply._internal.flexObjects.CompVariant} Created comp variant object
	 */
	FlexObjectFactory.createCompVariant = function (oFileContent) {
		oFileContent.generator = oFileContent.generator || "FlexObjectFactory.createCompVariant";
		oFileContent.user = ObjectPath.get("support.user", oFileContent);
		var mCompVariantContent = createBasePropertyBag(oFileContent);

		mCompVariantContent.variantId = oFileContent.variantId || mCompVariantContent.id;
		mCompVariantContent.contexts = oFileContent.contexts;
		mCompVariantContent.favorite = oFileContent.favorite;
		mCompVariantContent.persisted = oFileContent.persisted;
		mCompVariantContent.persistencyKey = oFileContent.persistencyKey || ObjectPath.get("selector.persistencyKey", oFileContent);

		if (oFileContent.layer === Layer.VENDOR || oFileContent.layer === Layer.CUSTOMER_BASE) {
			mCompVariantContent.favorite = true;
		}
		if (oFileContent.executeOnSelection !== undefined) {
			mCompVariantContent.executeOnSelection = oFileContent.executeOnSelection;
		} else {
			// Legacy changes contains 'executeOnSelect' information inside content structure
			mCompVariantContent.executeOnSelection = mCompVariantContent.content && (
				mCompVariantContent.content.executeOnSelect ||
				mCompVariantContent.content.executeOnSelection
			);
		}

		return new CompVariant(mCompVariantContent);
	};

	return FlexObjectFactory;
});