import { CommonAnnotationTerms } from "@sap-ux/vocabularies-types/vocabularies/Common";
import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import Log from "sap/base/Log";
import uniqueSort from "sap/base/util/array/uniqueSort";
import mergeObjects from "sap/base/util/merge";
import type AppComponent from "sap/fe/core/AppComponent";
import { IssueCategory, IssueCategoryType, IssueSeverity } from "sap/fe/core/converters/helpers/IssueManager";
import type { CompiledBindingToolkitExpression } from "sap/fe/core/helpers/BindingToolkit";
import { compileExpression, not, or, pathInModel } from "sap/fe/core/helpers/BindingToolkit";
import ModelHelper from "sap/fe/core/helpers/ModelHelper";
import SemanticDateOperators from "sap/fe/core/helpers/SemanticDateOperators";
import { generate } from "sap/fe/core/helpers/StableIdHelper";
import { IShellServices } from "sap/fe/core/services/ShellServicesFactory";
import TypeUtil from "sap/fe/core/type/TypeUtil";
import { semanticDateConfiguration } from "sap/fe/navigation/SelectionVariant";
import Component from "sap/ui/core/Component";
import type Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import Fragment from "sap/ui/core/Fragment";
import type View from "sap/ui/core/mvc/View";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
import XMLTemplateProcessor from "sap/ui/core/XMLTemplateProcessor";
import FilterOperatorUtil from "sap/ui/mdc/condition/FilterOperatorUtil";
import RangeOperator from "sap/ui/mdc/condition/RangeOperator";
import type Context from "sap/ui/model/Context";
import JSONModel from "sap/ui/model/json/JSONModel";
import type ODataV4Context from "sap/ui/model/odata/v4/Context";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import type ODataModel from "sap/ui/model/odata/v4/ODataModel";
import AnyElement from "./controls/AnyElement";
import { getConditions } from "./templating/FilterHelper";

const aValidTypes = [
	"Edm.Boolean",
	"Edm.Byte",
	"Edm.Date",
	"Edm.DateTime",
	"Edm.DateTimeOffset",
	"Edm.Decimal",
	"Edm.Double",
	"Edm.Float",
	"Edm.Guid",
	"Edm.Int16",
	"Edm.Int32",
	"Edm.Int64",
	"Edm.SByte",
	"Edm.Single",
	"Edm.String",
	"Edm.Time",
	"Edm.TimeOfDay"
];

type ConditionType = {
	operator: string;
	values: Array<any> | undefined;
	validated?: string;
};

function normalizeSearchTerm(sSearchTerm: string) {
	if (!sSearchTerm) {
		return undefined;
	}

	return sSearchTerm
		.replace(/"/g, " ")
		.replace(/\\/g, "\\\\") //escape backslash characters. Can be removed if odata/binding handles backend errors responds.
		.split(/\s+/)
		.reduce(function (sNormalized: string | undefined, sCurrentWord: string) {
			if (sCurrentWord !== "") {
				sNormalized = `${sNormalized ? `${sNormalized} ` : ""}"${sCurrentWord}"`;
			}
			return sNormalized;
		}, undefined);
}

function getPropertyDataType(oNavigationContext: any) {
	let sDataType = oNavigationContext.getProperty("$Type");
	// if $kind exists, it's not a DataField and we have the final type already
	if (!oNavigationContext.getProperty("$kind")) {
		switch (sDataType) {
			case "com.sap.vocabularies.UI.v1.DataFieldForAction":
			case "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation":
				sDataType = undefined;
				break;

			case "com.sap.vocabularies.UI.v1.DataField":
			case "com.sap.vocabularies.UI.v1.DataFieldWithNavigationPath":
			case "com.sap.vocabularies.UI.v1.DataFieldWithUrl":
			case "com.sap.vocabularies.UI.v1.DataFieldWithIntentBasedNavigation":
			case "com.sap.vocabularies.UI.v1.DataFieldWithAction":
				sDataType = oNavigationContext.getProperty("Value/$Path/$Type");
				break;

			case "com.sap.vocabularies.UI.v1.DataFieldForAnnotation":
			default:
				const sAnnotationPath = oNavigationContext.getProperty("Target/$AnnotationPath");
				if (sAnnotationPath) {
					if (sAnnotationPath.indexOf("com.sap.vocabularies.Communication.v1.Contact") > -1) {
						sDataType = oNavigationContext.getProperty("Target/$AnnotationPath/fn/$Path/$Type");
					} else if (sAnnotationPath.indexOf("com.sap.vocabularies.UI.v1.DataPoint") > -1) {
						sDataType = oNavigationContext.getProperty("Value/$Path/$Type");
					} else {
						// e.g. FieldGroup or Chart
						sDataType = undefined;
					}
				} else {
					sDataType = undefined;
				}
				break;
		}
	}

	return sDataType;
}

function fnHasTransientContexts(oListBinding: any) {
	let bHasTransientContexts = false;
	if (oListBinding) {
		oListBinding.getCurrentContexts().forEach(function (oContext: any) {
			if (oContext && oContext.isTransient()) {
				bHasTransientContexts = true;
			}
		});
	}
	return bHasTransientContexts;
}

function getSearchRestrictions(sFullPath: any, oMetaModel: any) {
	let oSearchRestrictions;
	let oNavigationSearchRestrictions;
	const navigationText = "$NavigationPropertyBinding";
	const searchRestrictionsTerm = "@Org.OData.Capabilities.V1.SearchRestrictions";
	const entityTypePathParts = sFullPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
	const entitySetPath = ModelHelper.getEntitySetPath(sFullPath, oMetaModel);
	const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
	const isContainment = oMetaModel.getObject(`/${entityTypePathParts.join("/")}/$ContainsTarget`);
	const containmentNavPath = isContainment && entityTypePathParts[entityTypePathParts.length - 1];

	//LEAST PRIORITY - Search restrictions directly at Entity Set
	//e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
	if (!isContainment) {
		oSearchRestrictions = oMetaModel.getObject(`${entitySetPath}${searchRestrictionsTerm}`);
	}
	if (entityTypePathParts.length > 1) {
		const navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
		// In case of containment we take entitySet provided as parent. And in case of normal we would remove the last navigation from entitySetPath.
		const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;

		//HIGHEST priority - Navigation restrictions
		//e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
		const oNavigationRestrictions = CommonUtils.getNavigationRestrictions(
			oMetaModel,
			parentEntitySetPath,
			navPath.replaceAll("%2F", "/")
		);
		oNavigationSearchRestrictions = oNavigationRestrictions && oNavigationRestrictions["SearchRestrictions"];
	}
	return oNavigationSearchRestrictions || oSearchRestrictions;
}

function getNavigationRestrictions(oModel: any, sEntitySetPath: any, sNavigationPath: any) {
	const oNavigationRestrictions = oModel.getObject(`${sEntitySetPath}@Org.OData.Capabilities.V1.NavigationRestrictions`);
	const aRestrictedProperties = oNavigationRestrictions && oNavigationRestrictions.RestrictedProperties;
	return (
		aRestrictedProperties &&
		aRestrictedProperties.find(function (oRestrictedProperty: any) {
			return (
				oRestrictedProperty &&
				oRestrictedProperty.NavigationProperty &&
				oRestrictedProperty.NavigationProperty.$NavigationPropertyPath === sNavigationPath
			);
		})
	);
}

function _isInNonFilterableProperties(oModel: any, sEntitySetPath: any, sContextPath: any) {
	let bIsNotFilterable = false;
	const oAnnotation = oModel.getObject(`${sEntitySetPath}@Org.OData.Capabilities.V1.FilterRestrictions`);
	if (oAnnotation && oAnnotation.NonFilterableProperties) {
		bIsNotFilterable = oAnnotation.NonFilterableProperties.some(function (property: any) {
			return property.$NavigationPropertyPath === sContextPath || property.$PropertyPath === sContextPath;
		});
	}
	return bIsNotFilterable;
}

// TODO rework this!
function _isContextPathFilterable(oModel: any, sEntitySetPath: any, sContexPath: any) {
	const sFullPath = `${sEntitySetPath}/${sContexPath}`,
		aESParts = sFullPath.split("/").splice(0, 2),
		aContext = sFullPath.split("/").splice(2);
	let bIsNotFilterable = false,
		sContext = "";

	sEntitySetPath = aESParts.join("/");

	bIsNotFilterable = aContext.some(function (item: string, index: number, array: string[]) {
		if (sContext.length > 0) {
			sContext += `/${item}`;
		} else {
			sContext = item;
		}
		if (index === array.length - 2) {
			// In case of "/Customer/Set/Property" this is to check navigation restrictions of "Customer" for non-filterable properties in "Set"
			const oNavigationRestrictions = getNavigationRestrictions(oModel, sEntitySetPath, item);
			const oFilterRestrictions = oNavigationRestrictions && oNavigationRestrictions.FilterRestrictions;
			const aNonFilterableProperties = oFilterRestrictions && oFilterRestrictions.NonFilterableProperties;
			const sTargetPropertyPath = array[array.length - 1];
			if (
				aNonFilterableProperties &&
				aNonFilterableProperties.find(function (oPropertyPath: any) {
					return oPropertyPath.$PropertyPath === sTargetPropertyPath;
				})
			) {
				return true;
			}
		}
		if (index === array.length - 1) {
			//last path segment
			bIsNotFilterable = _isInNonFilterableProperties(oModel, sEntitySetPath, sContext);
		} else if (oModel.getObject(`${sEntitySetPath}/$NavigationPropertyBinding/${item}`)) {
			//check existing context path and initialize it
			bIsNotFilterable = _isInNonFilterableProperties(oModel, sEntitySetPath, sContext);
			sContext = "";
			//set the new EntitySet
			sEntitySetPath = `/${oModel.getObject(`${sEntitySetPath}/$NavigationPropertyBinding/${item}`)}`;
		}
		return bIsNotFilterable === true;
	});
	return bIsNotFilterable;
}

// TODO check used places and rework this
function isPropertyFilterable(
	oModel: ODataMetaModel,
	sEntitySetPath: string,
	sProperty: string,
	bSkipHiddenFilter?: boolean
): boolean | CompiledBindingToolkitExpression {
	if (typeof sProperty !== "string") {
		throw new Error("sProperty parameter must be a string");
	}
	let bIsFilterable;

	// Parameters should be rendered as filterfields
	if (oModel.getObject(`${sEntitySetPath}/@com.sap.vocabularies.Common.v1.ResultContext`) === true) {
		return true;
	}

	const oNavigationContext = oModel.createBindingContext(`${sEntitySetPath}/${sProperty}`) as Context;

	if (!bSkipHiddenFilter) {
		if (
			oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.Hidden") === true ||
			oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.HiddenFilter") === true
		) {
			return false;
		}
		const sHiddenPath = oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.Hidden/$Path");
		const sHiddenFilterPath = oNavigationContext.getProperty("@com.sap.vocabularies.UI.v1.HiddenFilter/$Path");

		if (sHiddenPath && sHiddenFilterPath) {
			return compileExpression(not(or(pathInModel(sHiddenPath), pathInModel(sHiddenFilterPath))));
		} else if (sHiddenPath) {
			return compileExpression(not(pathInModel(sHiddenPath)));
		} else if (sHiddenFilterPath) {
			return compileExpression(not(pathInModel(sHiddenFilterPath)));
		}
	}

	if (sEntitySetPath.split("/").length === 2 && sProperty.indexOf("/") < 0) {
		// there is no navigation in entitySet path and property path
		bIsFilterable = !_isInNonFilterableProperties(oModel, sEntitySetPath, sProperty);
	} else {
		bIsFilterable = !_isContextPathFilterable(oModel, sEntitySetPath, sProperty);
	}
	// check if type can be used for filtering
	if (bIsFilterable && oNavigationContext) {
		const sPropertyDataType = getPropertyDataType(oNavigationContext);
		if (sPropertyDataType) {
			bIsFilterable = aValidTypes.indexOf(sPropertyDataType) !== -1;
		} else {
			bIsFilterable = false;
		}
	}

	return bIsFilterable;
}

function getShellServices(oControl: any): IShellServices {
	return getAppComponent(oControl).getShellServices();
}

function getHash(): string {
	const sHash = window.location.hash;
	return sHash.split("&")[0];
}

function _getSOIntents(oShellServiceHelper: any, oObjectPageLayout: any, oSemanticObject: any, oParam: any): Promise<any> {
	return oShellServiceHelper.getLinks({
		semanticObject: oSemanticObject,
		params: oParam
	});
}

// TO-DO add this as part of applySemanticObjectmappings logic in IntentBasednavigation controller extension
function _createMappings(oMapping: any) {
	const aSOMappings = [];
	const aMappingKeys = Object.keys(oMapping);
	let oSemanticMapping;
	for (let i = 0; i < aMappingKeys.length; i++) {
		oSemanticMapping = {
			"LocalProperty": {
				"$PropertyPath": aMappingKeys[i]
			},
			"SemanticObjectProperty": oMapping[aMappingKeys[i]]
		};
		aSOMappings.push(oSemanticMapping);
	}

	return aSOMappings;
}

/**
 * @param aLinks
 * @param aExcludedActions
 * @param oTargetParams
 * @param aItems
 * @param aAllowedActions
 */
function _getRelatedAppsMenuItems(aLinks: any, aExcludedActions: any, oTargetParams: any, aItems: any, aAllowedActions?: any) {
	for (let i = 0; i < aLinks.length; i++) {
		const oLink = aLinks[i];
		const sIntent = oLink.intent;
		const sAction = sIntent.split("-")[1].split("?")[0];
		if (aAllowedActions && aAllowedActions.includes(sAction)) {
			aItems.push({
				text: oLink.text,
				targetSemObject: sIntent.split("#")[1].split("-")[0],
				targetAction: sAction.split("~")[0],
				targetParams: oTargetParams
			});
		} else if (!aAllowedActions && aExcludedActions && aExcludedActions.indexOf(sAction) === -1) {
			aItems.push({
				text: oLink.text,
				targetSemObject: sIntent.split("#")[1].split("-")[0],
				targetAction: sAction.split("~")[0],
				targetParams: oTargetParams
			});
		}
	}
}

/**
 * @param oAdditionalSemanticObjects
 * @param oBindingContext
 * @param aManifestSOItems
 * @param aLinks
 */
function _getRelatedIntents(oAdditionalSemanticObjects: any, oBindingContext: any, aManifestSOItems: any, aLinks: any) {
	if (aLinks && aLinks.length > 0) {
		const aAllowedActions = oAdditionalSemanticObjects.allowedActions || undefined;
		const aExcludedActions = oAdditionalSemanticObjects.unavailableActions ? oAdditionalSemanticObjects.unavailableActions : [];
		const aSOMappings = oAdditionalSemanticObjects.mapping ? _createMappings(oAdditionalSemanticObjects.mapping) : [];
		const oTargetParams = { navigationContexts: oBindingContext, semanticObjectMapping: aSOMappings };
		_getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aManifestSOItems, aAllowedActions);
	}
}

async function updateRelateAppsModel(
	this: any,
	oBindingContext: any,
	oEntry: any,
	oObjectPageLayout: any,
	aSemKeys: any,
	oMetaModel: any,
	oMetaPath: any
) {
	const oShellServiceHelper: IShellServices = getShellServices(oObjectPageLayout);
	const oParam: any = {};
	let sCurrentSemObj = "",
		sCurrentAction = "";
	let oSemanticObjectAnnotations;
	let aRelatedAppsMenuItems: any[] = [];
	let aExcludedActions: any[] = [];
	let aManifestSOKeys: string[];

	function fnGetParseShellHashAndGetLinks() {
		const oParsedUrl = oShellServiceHelper.parseShellHash(document.location.hash);
		sCurrentSemObj = oParsedUrl.semanticObject; // Current Semantic Object
		sCurrentAction = oParsedUrl.action;
		return _getSOIntents(oShellServiceHelper, oObjectPageLayout, sCurrentSemObj, oParam);
	}

	try {
		if (oEntry) {
			if (aSemKeys && aSemKeys.length > 0) {
				for (let j = 0; j < aSemKeys.length; j++) {
					const sSemKey = aSemKeys[j].$PropertyPath;
					if (!oParam[sSemKey]) {
						oParam[sSemKey] = { value: oEntry[sSemKey] };
					}
				}
			} else {
				// fallback to Technical Keys if no Semantic Key is present
				const aTechnicalKeys = oMetaModel.getObject(`${oMetaPath}/$Type/$Key`);
				for (const key in aTechnicalKeys) {
					const sObjKey = aTechnicalKeys[key];
					if (!oParam[sObjKey]) {
						oParam[sObjKey] = { value: oEntry[sObjKey] };
					}
				}
			}
		}
		// Logic to read additional SO from manifest and updated relatedapps model

		const oManifestData = getTargetView(oObjectPageLayout).getViewData();
		const aManifestSOItems: any[] = [];
		let semanticObjectIntents;
		if (oManifestData.additionalSemanticObjects) {
			aManifestSOKeys = Object.keys(oManifestData.additionalSemanticObjects);
			for (let key = 0; key < aManifestSOKeys.length; key++) {
				semanticObjectIntents = await Promise.resolve(
					_getSOIntents(oShellServiceHelper, oObjectPageLayout, aManifestSOKeys[key], oParam)
				);
				_getRelatedIntents(
					oManifestData.additionalSemanticObjects[aManifestSOKeys[key]],
					oBindingContext,
					aManifestSOItems,
					semanticObjectIntents
				);
			}
		}

		const aLinks = await fnGetParseShellHashAndGetLinks();
		if (aLinks) {
			if (aLinks.length > 0) {
				let isSemanticObjectHasSameTargetInManifest = false;
				const oTargetParams: any = {};
				const aAnnotationsSOItems: any[] = [];
				const sEntitySetPath = `${oMetaPath}@`;
				const sEntityTypePath = `${oMetaPath}/@`;
				const oEntitySetAnnotations = oMetaModel.getObject(sEntitySetPath);
				oSemanticObjectAnnotations = CommonUtils.getSemanticObjectAnnotations(oEntitySetAnnotations, sCurrentSemObj);
				if (!oSemanticObjectAnnotations.bHasEntitySetSO) {
					const oEntityTypeAnnotations = oMetaModel.getObject(sEntityTypePath);
					oSemanticObjectAnnotations = CommonUtils.getSemanticObjectAnnotations(oEntityTypeAnnotations, sCurrentSemObj);
				}
				aExcludedActions = oSemanticObjectAnnotations.aUnavailableActions;
				//Skip same application from Related Apps
				aExcludedActions.push(sCurrentAction);
				oTargetParams.navigationContexts = oBindingContext;
				oTargetParams.semanticObjectMapping = oSemanticObjectAnnotations.aMappings;
				_getRelatedAppsMenuItems(aLinks, aExcludedActions, oTargetParams, aAnnotationsSOItems);

				aManifestSOItems.forEach(function ({ targetSemObject }) {
					if (aAnnotationsSOItems[0]?.targetSemObject === targetSemObject) {
						isSemanticObjectHasSameTargetInManifest = true;
					}
				});

				// remove all actions from current hash application if manifest contains empty allowedActions
				if (
					oManifestData.additionalSemanticObjects &&
					aAnnotationsSOItems[0] &&
					oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject] &&
					oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject].allowedActions &&
					oManifestData.additionalSemanticObjects[aAnnotationsSOItems[0].targetSemObject].allowedActions.length === 0
				) {
					isSemanticObjectHasSameTargetInManifest = true;
				}

				aRelatedAppsMenuItems = isSemanticObjectHasSameTargetInManifest
					? aManifestSOItems
					: aManifestSOItems.concat(aAnnotationsSOItems);
				// If no app in list, related apps button will be hidden
				oObjectPageLayout.getBindingContext("internal").setProperty("relatedApps/visibility", aRelatedAppsMenuItems.length > 0);
				oObjectPageLayout.getBindingContext("internal").setProperty("relatedApps/items", aRelatedAppsMenuItems);
			} else {
				oObjectPageLayout.getBindingContext("internal").setProperty("relatedApps/visibility", false);
			}
		} else {
			oObjectPageLayout.getBindingContext("internal").setProperty("relatedApps/visibility", false);
		}
	} catch (error: any) {
		Log.error("Cannot read links", error);
	}
	return aRelatedAppsMenuItems;
}

function _getSemanticObjectAnnotations(oEntityAnnotations: any, sCurrentSemObj: any) {
	const oSemanticObjectAnnotations = {
		bHasEntitySetSO: false,
		aAllowedActions: [],
		aUnavailableActions: [] as unknown[],
		aMappings: []
	};
	let sAnnotationMappingTerm, sAnnotationActionTerm;
	let sQualifier;
	for (const key in oEntityAnnotations) {
		if (key.indexOf(CommonAnnotationTerms.SemanticObject) > -1 && oEntityAnnotations[key] === sCurrentSemObj) {
			oSemanticObjectAnnotations.bHasEntitySetSO = true;
			sAnnotationMappingTerm = `@${CommonAnnotationTerms.SemanticObjectMapping}`;
			sAnnotationActionTerm = `@${CommonAnnotationTerms.SemanticObjectUnavailableActions}`;

			if (key.indexOf("#") > -1) {
				sQualifier = key.split("#")[1];
				sAnnotationMappingTerm = `${sAnnotationMappingTerm}#${sQualifier}`;
				sAnnotationActionTerm = `${sAnnotationActionTerm}#${sQualifier}`;
			}

			if (oEntityAnnotations[sAnnotationMappingTerm]) {
				oSemanticObjectAnnotations.aMappings = oSemanticObjectAnnotations.aMappings.concat(
					oEntityAnnotations[sAnnotationMappingTerm]
				);
			}

			if (oEntityAnnotations[sAnnotationActionTerm]) {
				oSemanticObjectAnnotations.aUnavailableActions = oSemanticObjectAnnotations.aUnavailableActions.concat(
					oEntityAnnotations[sAnnotationActionTerm]
				);
			}

			break;
		}
	}
	return oSemanticObjectAnnotations;
}

function fnUpdateRelatedAppsDetails(oObjectPageLayout: any) {
	const oMetaModel = oObjectPageLayout.getModel().getMetaModel();
	const oBindingContext = oObjectPageLayout.getBindingContext();
	const oPath = oBindingContext && oBindingContext.getPath();
	const oMetaPath = oMetaModel.getMetaPath(oPath);
	// Semantic Key Vocabulary
	const sSemanticKeyVocabulary = `${oMetaPath}/` + `@com.sap.vocabularies.Common.v1.SemanticKey`;
	//Semantic Keys
	const aSemKeys = oMetaModel.getObject(sSemanticKeyVocabulary);
	// Unavailable Actions
	const oEntry = oBindingContext.getObject();
	if (!oEntry) {
		oBindingContext
			.requestObject()
			.then(function (requestedObject: any) {
				return updateRelateAppsModel(oBindingContext, requestedObject, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath);
			})
			.catch(function (oError: any) {
				Log.error("Cannot update the related app details", oError);
			});
	} else {
		return updateRelateAppsModel(oBindingContext, oEntry, oObjectPageLayout, aSemKeys, oMetaModel, oMetaPath);
	}
}

/**
 * @param oButton
 */
function fnFireButtonPress(oButton: any) {
	const aAuthorizedTypes = ["sap.m.Button", "sap.m.OverflowToolbarButton"];
	if (oButton && aAuthorizedTypes.indexOf(oButton.getMetadata().getName()) !== -1 && oButton.getVisible() && oButton.getEnabled()) {
		oButton.firePress();
	}
}

function fnResolveStringtoBoolean(sValue: any) {
	if (sValue === "true" || sValue === true) {
		return true;
	} else {
		return false;
	}
}

function getAppComponent(oControl: any): AppComponent {
	if (oControl.isA("sap.fe.core.AppComponent")) {
		return oControl;
	}
	const oOwner = Component.getOwnerComponentFor(oControl);
	if (!oOwner) {
		return oControl;
	} else {
		return getAppComponent(oOwner);
	}
}

function getCurrentPageView(oAppComponent: AppComponent) {
	const rootViewController = oAppComponent.getRootViewController() as any;
	return rootViewController.isFclEnabled()
		? rootViewController.getRightmostView()
		: CommonUtils.getTargetView((oAppComponent.getRootContainer() as any).getCurrentPage());
}

function getTargetView(oControl: any) {
	if (oControl && oControl.isA("sap.ui.core.ComponentContainer")) {
		oControl = oControl.getComponentInstance();
		oControl = oControl && oControl.getRootControl();
	}
	while (oControl && !oControl.isA("sap.ui.core.mvc.View")) {
		oControl = oControl.getParent();
	}
	return oControl;
}

function isFieldControlPathInapplicable(sFieldControlPath: string, oAttribute: any) {
	let bInapplicable = false;
	const aParts = sFieldControlPath.split("/");
	// sensitive data is removed only if the path has already been resolved.
	if (aParts.length > 1) {
		bInapplicable = oAttribute[aParts[0]] && oAttribute[aParts[0]].hasOwnProperty(aParts[1]) && oAttribute[aParts[0]][aParts[1]] === 0;
	} else {
		bInapplicable = oAttribute[sFieldControlPath] === 0;
	}
	return bInapplicable;
}

function removeSensitiveData(aAttributes: any[], oMetaModel: ODataMetaModel) {
	const aOutAttributes = [];
	for (let i = 0; i < aAttributes.length; i++) {
		const sEntitySet = aAttributes[i].entitySet,
			oAttribute = aAttributes[i].contextData;

		delete oAttribute["@odata.context"];
		delete oAttribute["%40odata.context"];
		delete oAttribute["@odata.metadataEtag"];
		delete oAttribute["%40odata.metadataEtag"];
		delete oAttribute["SAP__Messages"];
		const aProperties = Object.keys(oAttribute);
		for (let j = 0; j < aProperties.length; j++) {
			const sProp = aProperties[j],
				aPropertyAnnotations = oMetaModel.getObject(`/${sEntitySet}/${sProp}@`);
			if (aPropertyAnnotations) {
				if (
					aPropertyAnnotations["@com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] ||
					aPropertyAnnotations["@com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] ||
					aPropertyAnnotations["@com.sap.vocabularies.Analytics.v1.Measure"]
				) {
					delete oAttribute[sProp];
				} else if (aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"]) {
					const oFieldControl = aPropertyAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"];
					if (oFieldControl["$EnumMember"] && oFieldControl["$EnumMember"].split("/")[1] === "Inapplicable") {
						delete oAttribute[sProp];
					} else if (oFieldControl["$Path"] && CommonUtils.isFieldControlPathInapplicable(oFieldControl["$Path"], oAttribute)) {
						delete oAttribute[sProp];
					}
				}
			}
		}
		aOutAttributes.push(oAttribute);
	}

	return aOutAttributes;
}

function _fnCheckIsMatch(oObject: any, oKeysToCheck: any) {
	for (const sKey in oKeysToCheck) {
		if (oKeysToCheck[sKey] !== oObject[sKey]) {
			return false;
		}
	}
	return true;
}

function fnGetContextPathProperties(oMetaModel: ODataMetaModel, sContextPath: string, oFilter?: object) {
	const oEntityType = oMetaModel.getObject(`${sContextPath}/`) || {},
		oProperties: any = {};

	for (const sKey in oEntityType) {
		if (
			oEntityType.hasOwnProperty(sKey) &&
			!/^\$/i.test(sKey) &&
			oEntityType[sKey].$kind &&
			_fnCheckIsMatch(oEntityType[sKey], oFilter || { $kind: "Property" })
		) {
			oProperties[sKey] = oEntityType[sKey];
		}
	}
	return oProperties;
}

function fnGetMandatoryFilterFields(oMetaModel: ODataMetaModel, sContextPath: string) {
	let aMandatoryFilterFields;
	if (oMetaModel && sContextPath) {
		aMandatoryFilterFields = oMetaModel.getObject(`${sContextPath}@Org.OData.Capabilities.V1.FilterRestrictions/RequiredProperties`);
	}
	return aMandatoryFilterFields;
}

function fnGetIBNActions(oControl: any, aIBNActions: any[]) {
	const aActions = oControl && oControl.getActions();
	if (aActions) {
		aActions.forEach(function (oAction: any) {
			if (oAction.isA("sap.ui.mdc.actiontoolbar.ActionToolbarAction")) {
				oAction = oAction.getAction();
			}
			if (oAction.isA("sap.m.MenuButton")) {
				const oMenu = oAction.getMenu();
				const aItems = oMenu.getItems();
				aItems.forEach((oItem: any) => {
					if (oItem.data("IBNData")) {
						aIBNActions.push(oItem);
					}
				});
			} else if (oAction.data("IBNData")) {
				aIBNActions.push(oAction);
			}
		});
	}
	return aIBNActions;
}

/**
 * @param aIBNActions
 * @param oView
 */
function fnUpdateDataFieldForIBNButtonsVisibility(aIBNActions: any[], oView: View) {
	const oParams: any = {};
	const fnGetLinks = function (oData?: any) {
		if (oData) {
			const aKeys = Object.keys(oData);
			aKeys.forEach(function (sKey: string) {
				if (sKey.indexOf("_") !== 0 && sKey.indexOf("odata.context") === -1) {
					oParams[sKey] = { value: oData[sKey] };
				}
			});
		}
		if (aIBNActions.length) {
			aIBNActions.forEach(function (oIBNAction: any) {
				const sSemanticObject = oIBNAction.data("IBNData").semanticObject;
				const sAction = oIBNAction.data("IBNData").action;
				CommonUtils.getShellServices(oView)
					.getLinks({
						semanticObject: sSemanticObject,
						action: sAction,
						params: oParams
					})
					.then(function (aLink: any) {
						oIBNAction.setVisible(oIBNAction.getVisible() && aLink && aLink.length === 1);
					})
					.catch(function (oError: any) {
						Log.error("Cannot retrieve the links from the shell service", oError);
					});
			});
		}
	};
	if (oView && oView.getBindingContext()) {
		(oView.getBindingContext() as any)
			?.requestObject()
			.then(function (oData: any) {
				return fnGetLinks(oData);
			})
			.catch(function (oError: any) {
				Log.error("Cannot retrieve the links from the shell service", oError);
			});
	} else {
		fnGetLinks();
	}
}

function getTranslatedText(sFrameworkKey: string, oResourceBundle: ResourceBundle, oParams?: any, sEntitySetName?: string) {
	let sResourceKey = sFrameworkKey;
	if (oResourceBundle) {
		if (sEntitySetName) {
			// There are console errors logged when making calls to getText for keys that are not defined in the resource bundle
			// for instance keys which are supposed to be provided by the application, e.g, <key>|<entitySet> to override instance specific text
			// hence check if text exists (using "hasText") in the resource bundle before calling "getText"

			// "hasText" only checks for the key in the immediate resource bundle and not it's custom bundles
			// hence we need to do this recurrsively to check if the key exists in any of the bundles the forms the FE resource bundle
			const bResourceKeyExists = checkIfResourceKeyExists(
				(oResourceBundle as any).aCustomBundles,
				`${sFrameworkKey}|${sEntitySetName}`
			);

			// if resource key with entity set name for instance specific text overriding is provided by the application
			// then use the same key otherwise use the Framework key
			sResourceKey = bResourceKeyExists ? `${sFrameworkKey}|${sEntitySetName}` : sFrameworkKey;
		}
		return oResourceBundle.getText(sResourceKey, oParams);
	}

	// do not allow override so get text from the internal bundle directly
	oResourceBundle = Core.getLibraryResourceBundle("sap.fe.core");
	return oResourceBundle.getText(sResourceKey, oParams);
}

function checkIfResourceKeyExists(aCustomBundles: any, sKey: any) {
	if (aCustomBundles.length) {
		for (let i = aCustomBundles.length - 1; i >= 0; i--) {
			const sValue = aCustomBundles[i].hasText(sKey);
			// text found return true
			if (sValue) {
				return true;
			}
			checkIfResourceKeyExists(aCustomBundles[i].aCustomBundles, sKey);
		}
	}
	return false;
}

function getActionPath(oAction: any, bReturnOnlyPath: boolean, sActionName?: string, bCheckStaticValue?: boolean) {
	sActionName = !sActionName ? oAction.getObject(oAction.getPath()) : sActionName;
	let sContextPath = oAction.getPath().split("/@")[0];
	const sEntityTypeName = oAction.getObject(sContextPath).$Type;
	const sEntityName = getEntitySetName(oAction.getModel(), sEntityTypeName);
	if (sEntityName) {
		sContextPath = `/${sEntityName}`;
	}
	if (bCheckStaticValue) {
		return oAction.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable`);
	}
	if (bReturnOnlyPath) {
		return `${sContextPath}/${sActionName}`;
	} else {
		return {
			sContextPath: sContextPath,
			sProperty: oAction.getObject(`${sContextPath}/${sActionName}@Org.OData.Core.V1.OperationAvailable/$Path`),
			sBindingParameter: oAction.getObject(`${sContextPath}/${sActionName}/@$ui5.overload/0/$Parameter/0/$Name`)
		};
	}
}

function getEntitySetName(oMetaModel: any, sEntityType: any) {
	const oEntityContainer = oMetaModel.getObject("/");
	for (const key in oEntityContainer) {
		if (typeof oEntityContainer[key] === "object" && oEntityContainer[key].$Type === sEntityType) {
			return key;
		}
	}
}

function computeDisplayMode(oPropertyAnnotations: any, oCollectionAnnotations?: any) {
	const oTextAnnotation = oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text"],
		oTextArrangementAnnotation =
			oTextAnnotation &&
			((oPropertyAnnotations &&
				oPropertyAnnotations["@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement"]) ||
				(oCollectionAnnotations && oCollectionAnnotations["@com.sap.vocabularies.UI.v1.TextArrangement"]));

	if (oTextArrangementAnnotation) {
		if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
			return "Description";
		} else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextLast") {
			return "ValueDescription";
		} else if (oTextArrangementAnnotation.$EnumMember === "com.sap.vocabularies.UI.v1.TextArrangementType/TextSeparate") {
			return "Value";
		}
		//Default should be TextFirst if there is a Text annotation and neither TextOnly nor TextLast are set
		return "DescriptionValue";
	}
	return oTextAnnotation ? "DescriptionValue" : "Value";
}

function _getEntityType(oContext: any) {
	const oMetaModel = oContext.getModel().getMetaModel();
	return oMetaModel.getObject(`${oMetaModel.getMetaPath(oContext.getPath())}/$Type`);
}

function _requestObject(sAction: any, oSelectedContext: any, sProperty: any) {
	let oContext = oSelectedContext;
	const nBracketIndex = sAction.indexOf("(");

	if (nBracketIndex > -1) {
		const sTargetType = sAction.slice(nBracketIndex + 1, -1);
		let sCurrentType = _getEntityType(oContext);

		while (sCurrentType !== sTargetType) {
			// Find parent binding context and retrieve entity type
			oContext = oContext.getBinding().getContext();
			if (oContext) {
				sCurrentType = _getEntityType(oContext);
			} else {
				Log.warning("Cannot determine target type to request property value for bound action invocation");
				return Promise.resolve(undefined);
			}
		}
	}

	return oContext.requestObject(sProperty);
}

function requestProperty(oSelectedContext: any, sAction: any, sProperty: any, sDynamicActionEnabledPath: any) {
	const oPromise =
		sProperty && sProperty.indexOf("/") === 0
			? requestSingletonProperty(sProperty, oSelectedContext.getModel())
			: _requestObject(sAction, oSelectedContext, sProperty);

	return oPromise.then(function (vPropertyValue: any) {
		return Promise.resolve({
			vPropertyValue: vPropertyValue,
			oSelectedContext: oSelectedContext,
			sAction: sAction,
			sDynamicActionEnabledPath: sDynamicActionEnabledPath
		});
	});
}

function setContextsBasedOnOperationAvailable(oInternalModelContext: any, aRequestPromises: any) {
	return Promise.all(aRequestPromises)
		.then(function (aResults: any[]) {
			if (aResults.length) {
				const aApplicableContexts: any[] = [],
					aNotApplicableContexts: any[] = [];
				aResults.forEach(function (aResult: any) {
					if (aResult) {
						if (aResult.vPropertyValue) {
							oInternalModelContext.getModel().setProperty(aResult.sDynamicActionEnabledPath, true);
							aApplicableContexts.push(aResult.oSelectedContext);
						} else {
							aNotApplicableContexts.push(aResult.oSelectedContext);
						}
					}
				});
				setDynamicActionContexts(oInternalModelContext, aResults[0].sAction, aApplicableContexts, aNotApplicableContexts);
			}
		})
		.catch(function (oError: any) {
			Log.trace("Cannot retrieve property value from path", oError);
		});
}

/**
 * @param oInternalModelContext
 * @param sAction
 * @param aApplicable
 * @param aNotApplicable
 */
function setDynamicActionContexts(oInternalModelContext: any, sAction: any, aApplicable: any, aNotApplicable: any) {
	const sDynamicActionPathPrefix = `${oInternalModelContext.getPath()}/dynamicActions/${sAction}`,
		oInternalModel = oInternalModelContext.getModel();
	oInternalModel.setProperty(`${sDynamicActionPathPrefix}/aApplicable`, aApplicable);
	oInternalModel.setProperty(`${sDynamicActionPathPrefix}/aNotApplicable`, aNotApplicable);
}

function _getDefaultOperators(sPropertyType?: string) {
	// mdc defines the full set of operations that are meaningful for each Edm Type
	// TODO Replace with model / internal way of retrieving the actual model type used for the property
	const oDataClass = TypeUtil.getDataTypeClassName(sPropertyType);
	// TODO need to pass proper formatOptions, constraints here
	const oBaseType = TypeUtil.getBaseType(oDataClass, {}, {});
	return FilterOperatorUtil.getOperatorsForType(oBaseType);
}

function _getRestrictions(aDefaultOps: any, aExpressionOps: any): string {
	// From the default set of Operators for the Base Type, select those that are defined in the Allowed Value.
	// In case that no operators are found, return undefined so that the default set is used.
	const aOperators = aDefaultOps.filter(function (sElement: any) {
		return aExpressionOps.indexOf(sElement) > -1;
	});
	return aOperators.toString() || undefined;
}

function getSpecificAllowedExpression(aExpressions: any) {
	const aAllowedExpressionsPriority = CommonUtils.AllowedExpressionsPrio;

	aExpressions.sort(function (a: any, b: any) {
		return aAllowedExpressionsPriority.indexOf(a) - aAllowedExpressionsPriority.indexOf(b);
	});

	return aExpressions[0];
}

/**
 * Method to fetch the correct operators based on the filter restrictions that can be annotated on an entity set or a navigation property.
 * We return the correct operators based on the specified restriction and also check for the operators defined in the manifest to include or exclude them.
 *
 * @param sProperty String name of the property
 * @param sEntitySetPath String path to the entity set
 * @param oContext Context used during templating
 * @param sType String data type od the property, for example edm.Date
 * @param bUseSemanticDateRange Boolean passed from the manifest for semantic date range
 * @param sSettings Stringified object of the property settings
 * @returns String containing comma-separated list of operators for filtering
 */
export function getOperatorsForProperty(
	sProperty: string,
	sEntitySetPath: string,
	oContext: Context,
	sType?: string,
	bUseSemanticDateRange?: boolean | string,
	sSettings?: string
): string | undefined {
	const oFilterRestrictions = CommonUtils.getFilterRestrictionsByPath(sEntitySetPath, oContext);
	const aEqualsOps = ["EQ"];
	const aSingleRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
	const aSingleRangeDTBasicOps = ["EQ", "BT"];
	const aSingleValueDateOps = [
		"TODAY",
		"TOMORROW",
		"YESTERDAY",
		"DATE",
		"FIRSTDAYWEEK",
		"LASTDAYWEEK",
		"FIRSTDAYMONTH",
		"LASTDAYMONTH",
		"FIRSTDAYQUARTER",
		"LASTDAYQUARTER",
		"FIRSTDAYYEAR",
		"LASTDAYYEAR"
	];
	const aBasicDateTimeOps = ["EQ", "BT"];
	const aMultiRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
	const aSearchExpressionOps = ["Contains", "NotContains", "StartsWith", "NotStartsWith", "EndsWith", "NotEndsWith"];
	const aSemanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
	const bSemanticDateRange = bUseSemanticDateRange === "true" || bUseSemanticDateRange === true;
	let aSemanticDateOps: any[] = [];
	const oSettings = typeof sSettings === "string" ? JSON.parse(sSettings).customData : sSettings;

	if ((oContext.getObject(`${sEntitySetPath}/@com.sap.vocabularies.Common.v1.ResultContext`) as any) === true) {
		return aEqualsOps.toString();
	}

	if (oSettings && oSettings.operatorConfiguration && oSettings.operatorConfiguration.length > 0) {
		aSemanticDateOps = SemanticDateOperators.getFilterOperations(oSettings.operatorConfiguration);
	} else {
		aSemanticDateOps = SemanticDateOperators.getSemanticDateOperations();
	}
	// Get the default Operators for this Property Type
	let aDefaultOperators = _getDefaultOperators(sType);
	if (bSemanticDateRange) {
		aDefaultOperators = aSemanticDateOpsExt.concat(aDefaultOperators);
	}
	let sRestrictions;

	// Is there a Filter Restriction defined for this property?
	if (oFilterRestrictions && oFilterRestrictions.FilterAllowedExpressions && oFilterRestrictions.FilterAllowedExpressions[sProperty]) {
		// Extending the default operators list with Semantic Date options DATERANGE, DATE, FROM and TO
		const sAllowedExpression = CommonUtils.getSpecificAllowedExpression(oFilterRestrictions.FilterAllowedExpressions[sProperty]);
		// In case more than one Allowed Expressions has been defined for a property
		// choose the most restrictive Allowed Expression

		// MultiValue has same Operator as SingleValue, but there can be more than one (maxConditions)
		switch (sAllowedExpression) {
			case "SingleValue":
				const aSingleValueOps = sType === "Edm.Date" && bSemanticDateRange ? aSingleValueDateOps : aEqualsOps;
				sRestrictions = _getRestrictions(aDefaultOperators, aSingleValueOps);
				break;
			case "MultiValue":
				sRestrictions = _getRestrictions(aDefaultOperators, aEqualsOps);
				break;
			case "SingleRange":
				let aExpressionOps;
				if (bSemanticDateRange) {
					if (sType === "Edm.Date") {
						aExpressionOps = aSemanticDateOps;
					} else if (sType === "Edm.DateTimeOffset") {
						aExpressionOps = aSemanticDateOps.concat(aBasicDateTimeOps);
					} else {
						aExpressionOps = aSingleRangeOps;
					}
				} else if (sType === "Edm.DateTimeOffset") {
					aExpressionOps = aSingleRangeDTBasicOps;
				} else {
					aExpressionOps = aSingleRangeOps;
				}
				const sOperators = _getRestrictions(aDefaultOperators, aExpressionOps);
				sRestrictions = sOperators ? sOperators : "";
				break;
			case "MultiRange":
				sRestrictions = _getRestrictions(aDefaultOperators, aMultiRangeOps);
				break;
			case "SearchExpression":
				sRestrictions = _getRestrictions(aDefaultOperators, aSearchExpressionOps);
				break;
			case "MultiRangeOrSearchExpression":
				sRestrictions = _getRestrictions(aDefaultOperators, aSearchExpressionOps.concat(aMultiRangeOps));
				break;
			default:
				break;
		}
		// In case AllowedExpressions is not recognised, undefined in return results in the default set of
		// operators for the type.
	}
	return sRestrictions;
}

/**
 * Method to return allowed operators for type Guid.
 *
 * @function
 * @name getOperatorsForGuidProperty
 * @returns Allowed operators for type Guid
 */
function getOperatorsForGuidProperty(): string {
	const allowedOperatorsForGuid = ["EQ", "NE"];
	return allowedOperatorsForGuid.toString();
}

function getOperatorsForDateProperty(propertyType: string): string {
	// In case AllowedExpressions is not provided for type Edm.Date then all the default
	// operators for the type should be returned excluding semantic operators from the list.
	const aDefaultOperators = _getDefaultOperators(propertyType);
	const aMultiRangeOps = ["EQ", "GE", "LE", "LT", "GT", "BT", "NE", "NOTBT", "NOTLE", "NOTLT", "NOTGE", "NOTGT"];
	return _getRestrictions(aDefaultOperators, aMultiRangeOps);
}

function getParameterInfo(oMetaModel: any, sContextPath: any) {
	const sParameterContextPath = sContextPath.substring(0, sContextPath.lastIndexOf("/"));
	const bResultContext = oMetaModel.getObject(`${sParameterContextPath}/@com.sap.vocabularies.Common.v1.ResultContext`);
	const oParameterInfo: any = {};
	if (bResultContext && sParameterContextPath !== sContextPath) {
		oParameterInfo.contextPath = sParameterContextPath;
		oParameterInfo.parameterProperties = CommonUtils.getContextPathProperties(oMetaModel, sParameterContextPath);
	}
	return oParameterInfo;
}

/**
 * Method to add the select Options to filter conditions.
 *
 * @function
 * @name addSelectOptionToConditions
 * @param oPropertyMetadata Property metadata information
 * @param aValidOperators Operators for all the data types
 * @param aSemanticDateOperators Operators for the Date type
 * @param aCumulativeConditions Filter conditions
 * @param oSelectOption Selectoption of selection variant
 * @returns The filter conditions
 */
function addSelectOptionToConditions(
	oPropertyMetadata: any,
	aValidOperators: any,
	aSemanticDateOperators: any,
	aCumulativeConditions: any,
	oSelectOption: any
) {
	const oCondition = getConditions(oSelectOption, oPropertyMetadata);
	if (
		oSelectOption?.SemanticDates &&
		aSemanticDateOperators &&
		aSemanticDateOperators.indexOf(oSelectOption?.SemanticDates?.operator) > -1
	) {
		const semanticDates = CommonUtils.addSemanticDatesToConditions(oSelectOption?.SemanticDates);
		if (semanticDates && Object.keys(semanticDates).length > 0) {
			aCumulativeConditions.push(semanticDates);
		}
	} else if (oCondition) {
		if (!aValidOperators || aValidOperators.indexOf(oCondition.operator) > -1) {
			aCumulativeConditions.push(oCondition);
		}
	}
	return aCumulativeConditions;
}

/**
 * Method to add the semantic dates to filter conditions
 *
 * @function
 * @name addSemanticDatesToConditions
 * @param oSemanticDates Semantic date infomation
 * @returns The filter conditions containing semantic dates
 */

function addSemanticDatesToConditions(oSemanticDates: semanticDateConfiguration): object {
	const values: any = [];
	if (oSemanticDates?.high) {
		values.push(oSemanticDates?.high);
	}
	if (oSemanticDates?.low) {
		values.push(oSemanticDates?.low);
	}
	return {
		values: values,
		operator: oSemanticDates?.operator,
		isEmpty: null
	};
}

/**
 * @param sContextPath
 * @param oSelectionVariant
 * @param sSelectOptionProp
 * @param oConditions
 * @param sConditionPath
 * @param sConditionProp
 * @param oValidProperties
 * @param oMetaModel
 * @param isParameter
 * @param bIsFLPValuePresent
 * @param bUseSemanticDateRange
 * @param oViewData
 */
function addSelectOptionsToConditions(
	sContextPath: any,
	oSelectionVariant: any,
	sSelectOptionProp: any,
	oConditions: any,
	sConditionPath: any,
	sConditionProp: any,
	oValidProperties: any,
	oMetaModel: any,
	isParameter: any,
	bIsFLPValuePresent?: boolean,
	bUseSemanticDateRange?: boolean | string,
	oViewData?: any
) {
	let aConditions: any[] = [],
		aSelectOptions,
		aValidOperators,
		aSemanticDateOperators;

	if (isParameter || CommonUtils.isPropertyFilterable(oMetaModel, sContextPath, sConditionProp, true)) {
		const oPropertyMetadata = oValidProperties[sConditionProp];
		aSelectOptions = oSelectionVariant.getSelectOption(sSelectOptionProp);
		const settings = getFilterConfigurationSetting(oViewData, sConditionProp);
		aValidOperators = isParameter ? ["EQ"] : CommonUtils.getOperatorsForProperty(sConditionProp, sContextPath, oMetaModel);
		if (bUseSemanticDateRange) {
			aSemanticDateOperators = isParameter
				? ["EQ"]
				: CommonUtils.getOperatorsForProperty(
						sConditionProp,
						sContextPath,
						oMetaModel,
						oPropertyMetadata?.$Type,
						bUseSemanticDateRange,
						settings
				  );
		}
		// Create conditions for all the selectOptions of the property
		aConditions = isParameter
			? CommonUtils.addSelectOptionToConditions(
					oPropertyMetadata,
					aValidOperators,
					aSemanticDateOperators,
					aConditions,
					aSelectOptions[0]
			  )
			: aSelectOptions.reduce(
					CommonUtils.addSelectOptionToConditions.bind(null, oPropertyMetadata, aValidOperators, aSemanticDateOperators),
					aConditions
			  );
		if (aConditions.length) {
			if (sConditionPath) {
				oConditions[sConditionPath + sConditionProp] = oConditions.hasOwnProperty(sConditionPath + sConditionProp)
					? oConditions[sConditionPath + sConditionProp].concat(aConditions)
					: aConditions;
			} else if (bIsFLPValuePresent) {
				// If FLP values are present replace it with FLP values
				aConditions.forEach((element: any) => {
					element["filtered"] = true;
				});
				if (oConditions.hasOwnProperty(sConditionProp)) {
					oConditions[sConditionProp].forEach((element: any) => {
						element["filtered"] = false;
					});
					oConditions[sConditionProp] = oConditions[sConditionProp].concat(aConditions);
				} else {
					oConditions[sConditionProp] = aConditions;
				}
			} else {
				oConditions[sConditionProp] = oConditions.hasOwnProperty(sConditionProp)
					? oConditions[sConditionProp].concat(aConditions)
					: aConditions;
			}
		}
	}
}

/**
 * Method to create the semantic dates from filter conditions
 *
 * @function
 * @name createSemanticDatesFromConditions
 * @param oCondition Filter field condition
 * @param sFilterName Filter Field Path
 * @returns The Semantic date conditions
 */

function createSemanticDatesFromConditions(oCondition: ConditionType) {
	return {
		high: oCondition?.values?.[0] || null,
		low: oCondition?.values?.[1] || null,
		operator: oCondition?.operator
	};
}

/**
 * Method to Return the filter configuration
 *
 * @function
 * @name getFilterConfigurationSetting
 * @param oViewData manifest Configuration
 * @param sProperty Filter Field Path
 * @returns The Filter Field Configuration
 */

function getFilterConfigurationSetting(oViewData: any, sProperty: string) {
	const oConfig = oViewData?.controlConfiguration;
	const filterConfig = oConfig && oConfig["@com.sap.vocabularies.UI.v1.SelectionFields"]?.filterFields;
	return filterConfig?.[sProperty] ? filterConfig[sProperty]?.settings : undefined;
}

function addSelectionVariantToConditions(
	oSelectionVariant: any,
	oConditions: object,
	oMetaModel: ODataMetaModel,
	sContextPath: string,
	bIsFLPValues?: boolean,
	bUseSemanticDateRange?: boolean | string,
	oViewData?: any
) {
	const aSelectOptionsPropertyNames = oSelectionVariant.getSelectOptionsPropertyNames(),
		oValidProperties = CommonUtils.getContextPathProperties(oMetaModel, sContextPath),
		aMetadatProperties = Object.keys(oValidProperties),
		oParameterInfo = CommonUtils.getParameterInfo(oMetaModel, sContextPath),
		sParameterContextPath = oParameterInfo.contextPath,
		oValidParameterProperties = oParameterInfo.parameterProperties,
		bHasParameters = !!oParameterInfo.contextPath && oValidParameterProperties && Object.keys(oValidParameterProperties).length > 0;

	if (bHasParameters) {
		const aMetadataParameters = Object.keys(oValidParameterProperties);
		aMetadataParameters.forEach(function (sMetadataParameter: string) {
			let sSelectOptionName;
			if (aSelectOptionsPropertyNames.includes(`$Parameter.${sMetadataParameter}`)) {
				sSelectOptionName = `$Parameter.${sMetadataParameter}`;
			} else if (aSelectOptionsPropertyNames.includes(sMetadataParameter)) {
				sSelectOptionName = sMetadataParameter;
			} else if (
				sMetadataParameter.startsWith("P_") &&
				aSelectOptionsPropertyNames.includes(`$Parameter.${sMetadataParameter.slice(2, sMetadataParameter.length)}`)
			) {
				sSelectOptionName = `$Parameter.${sMetadataParameter.slice(2, sMetadataParameter.length)}`;
			} else if (
				sMetadataParameter.startsWith("P_") &&
				aSelectOptionsPropertyNames.includes(sMetadataParameter.slice(2, sMetadataParameter.length))
			) {
				sSelectOptionName = sMetadataParameter.slice(2, sMetadataParameter.length);
			} else if (aSelectOptionsPropertyNames.includes(`$Parameter.P_${sMetadataParameter}`)) {
				sSelectOptionName = `$Parameter.P_${sMetadataParameter}`;
			} else if (aSelectOptionsPropertyNames.includes(`P_${sMetadataParameter}`)) {
				sSelectOptionName = `P_${sMetadataParameter}`;
			}

			if (sSelectOptionName) {
				addSelectOptionsToConditions(
					sParameterContextPath,
					oSelectionVariant,
					sSelectOptionName,
					oConditions,
					undefined,
					sMetadataParameter,
					oValidParameterProperties,
					oMetaModel,
					true,
					bIsFLPValues,
					bUseSemanticDateRange,
					oViewData
				);
			}
		});
	}
	aMetadatProperties.forEach(function (sMetadataProperty: string) {
		let sSelectOptionName;
		if (aSelectOptionsPropertyNames.includes(sMetadataProperty)) {
			sSelectOptionName = sMetadataProperty;
		} else if (
			sMetadataProperty.startsWith("P_") &&
			aSelectOptionsPropertyNames.includes(sMetadataProperty.slice(2, sMetadataProperty.length))
		) {
			sSelectOptionName = sMetadataProperty.slice(2, sMetadataProperty.length);
		} else if (aSelectOptionsPropertyNames.includes(`P_${sMetadataProperty}`)) {
			sSelectOptionName = `P_${sMetadataProperty}`;
		}
		if (sSelectOptionName) {
			addSelectOptionsToConditions(
				sContextPath,
				oSelectionVariant,
				sSelectOptionName,
				oConditions,
				undefined,
				sMetadataProperty,
				oValidProperties,
				oMetaModel,
				false,
				bIsFLPValues,
				bUseSemanticDateRange,
				oViewData
			);
		}
	});

	aSelectOptionsPropertyNames.forEach(function (sSelectOption: any) {
		if (sSelectOption.indexOf(".") > 0 && !sSelectOption.includes("$Parameter")) {
			const sReplacedOption = sSelectOption.replaceAll(".", "/");
			const sFullContextPath = `/${sReplacedOption}`.startsWith(sContextPath)
				? `/${sReplacedOption}`
				: `${sContextPath}/${sReplacedOption}`; // check if the full path, eg SalesOrderManage._Item.Material exists in the metamodel
			if (oMetaModel.getObject(sFullContextPath.replace("P_", ""))) {
				_createConditionsForNavProperties(
					sFullContextPath,
					sContextPath,
					oSelectionVariant,
					sSelectOption,
					oMetaModel,
					oConditions,
					bIsFLPValues,
					bUseSemanticDateRange,
					oViewData
				);
			}
		}
	});
	return oConditions;
}

/**
 * @param sFullContextPath
 * @param sMainEntitySetPath
 * @param oSelectionVariant
 * @param sSelectOption
 * @param oMetaModel
 * @param oConditions
 * @param bIsFLPValuePresent
 * @param bSemanticDateRange
 * @param oViewData
 */
function _createConditionsForNavProperties(
	sFullContextPath: any,
	sMainEntitySetPath: any,
	oSelectionVariant: any,
	sSelectOption: any,
	oMetaModel: any,
	oConditions: any,
	bIsFLPValuePresent?: boolean,
	bSemanticDateRange?: any,
	oViewData?: any
) {
	let aNavObjectNames = sSelectOption.split(".");
	// Eg: "SalesOrderManage._Item._Material.Material" or "_Item.Material"
	if (`/${sSelectOption.replaceAll(".", "/")}`.startsWith(sMainEntitySetPath)) {
		const sFullPath = (`/${sSelectOption}` as any).replaceAll(".", "/"),
			sNavPath = sFullPath.replace(`${sMainEntitySetPath}/`, "");
		aNavObjectNames = sNavPath.split("/");
	}
	let sConditionPath = "";
	const sPropertyName = aNavObjectNames[aNavObjectNames.length - 1]; // Material from SalesOrderManage._Item.Material
	for (let i = 0; i < aNavObjectNames.length - 1; i++) {
		if (oMetaModel.getObject(`${sMainEntitySetPath}/${aNavObjectNames[i].replace("P_", "")}`).$isCollection) {
			sConditionPath = `${sConditionPath + aNavObjectNames[i]}*/`; // _Item*/ in case of 1:n cardinality
		} else {
			sConditionPath = `${sConditionPath + aNavObjectNames[i]}/`; // _Item/ in case of 1:1 cardinality
		}
		sMainEntitySetPath = `${sMainEntitySetPath}/${aNavObjectNames[i]}`;
	}
	const sNavPropertyPath = sFullContextPath.slice(0, sFullContextPath.lastIndexOf("/")),
		oValidProperties = CommonUtils.getContextPathProperties(oMetaModel, sNavPropertyPath),
		aSelectOptionsPropertyNames = oSelectionVariant.getSelectOptionsPropertyNames();
	let sSelectOptionName = sPropertyName;
	if (oValidProperties[sPropertyName]) {
		sSelectOptionName = sPropertyName;
	} else if (sPropertyName.startsWith("P_") && oValidProperties[sPropertyName.replace("P_", "")]) {
		sSelectOptionName = sPropertyName.replace("P_", "");
	} else if (oValidProperties[`P_${sPropertyName}`] && aSelectOptionsPropertyNames.includes(`P_${sPropertyName}`)) {
		sSelectOptionName = `P_${sPropertyName}`;
	}
	if (sPropertyName.startsWith("P_") && oConditions[sConditionPath + sSelectOptionName]) {
		// if there is no SalesOrderManage._Item.Material yet in the oConditions
	} else if (!sPropertyName.startsWith("P_") && oConditions[sConditionPath + sSelectOptionName]) {
		delete oConditions[sConditionPath + sSelectOptionName];
		addSelectOptionsToConditions(
			sNavPropertyPath,
			oSelectionVariant,
			sSelectOption,
			oConditions,
			sConditionPath,
			sSelectOptionName,
			oValidProperties,
			oMetaModel,
			false,
			bIsFLPValuePresent,
			bSemanticDateRange,
			oViewData
		);
	} else {
		addSelectOptionsToConditions(
			sNavPropertyPath,
			oSelectionVariant,
			sSelectOption,
			oConditions,
			sConditionPath,
			sSelectOptionName,
			oValidProperties,
			oMetaModel,
			false,
			bIsFLPValuePresent,
			bSemanticDateRange,
			oViewData
		);
	}
}

function addPageContextToSelectionVariant(oSelectionVariant: any, mPageContext: any[], oView: any) {
	const oAppComponent = CommonUtils.getAppComponent(oView);
	const oNavigationService = oAppComponent.getNavigationService();
	return oNavigationService.mixAttributesAndSelectionVariant(mPageContext, oSelectionVariant.toJSONString());
}

function addExternalStateFiltersToSelectionVariant(oSelectionVariant: any, mFilters: any, oTargetInfo: any, oFilterBar?: any) {
	let sFilter: any;
	const fnGetSignAndOption = function (sOperator: any, sLowValue: any, sHighValue: any) {
		const oSelectOptionState = {
			option: "",
			sign: "I",
			low: sLowValue,
			high: sHighValue
		};
		switch (sOperator) {
			case "Contains":
				oSelectOptionState.option = "CP";
				break;
			case "StartsWith":
				oSelectOptionState.option = "CP";
				oSelectOptionState.low += "*";
				break;
			case "EndsWith":
				oSelectOptionState.option = "CP";
				oSelectOptionState.low = `*${oSelectOptionState.low}`;
				break;
			case "BT":
			case "LE":
			case "LT":
			case "GT":
			case "NE":
			case "EQ":
				oSelectOptionState.option = sOperator;
				break;
			case "DATE":
				oSelectOptionState.option = "EQ";
				break;
			case "DATERANGE":
				oSelectOptionState.option = "BT";
				break;
			case "FROM":
				oSelectOptionState.option = "GE";
				break;
			case "TO":
				oSelectOptionState.option = "LE";
				break;
			case "EEQ":
				oSelectOptionState.option = "EQ";
				break;
			case "Empty":
				oSelectOptionState.option = "EQ";
				oSelectOptionState.low = "";
				break;
			case "NotContains":
				oSelectOptionState.option = "CP";
				oSelectOptionState.sign = "E";
				break;
			case "NOTBT":
				oSelectOptionState.option = "BT";
				oSelectOptionState.sign = "E";
				break;
			case "NotStartsWith":
				oSelectOptionState.option = "CP";
				oSelectOptionState.low += "*";
				oSelectOptionState.sign = "E";
				break;
			case "NotEndsWith":
				oSelectOptionState.option = "CP";
				oSelectOptionState.low = `*${oSelectOptionState.low}`;
				oSelectOptionState.sign = "E";
				break;
			case "NotEmpty":
				oSelectOptionState.option = "NE";
				oSelectOptionState.low = "";
				break;
			case "NOTLE":
				oSelectOptionState.option = "LE";
				oSelectOptionState.sign = "E";
				break;
			case "NOTGE":
				oSelectOptionState.option = "GE";
				oSelectOptionState.sign = "E";
				break;
			case "NOTLT":
				oSelectOptionState.option = "LT";
				oSelectOptionState.sign = "E";
				break;
			case "NOTGT":
				oSelectOptionState.option = "GT";
				oSelectOptionState.sign = "E";
				break;
			default:
				Log.warning(`${sOperator} is not supported. ${sFilter} could not be added to the navigation context`);
		}
		return oSelectOptionState;
	};
	const oFilterConditions = mFilters.filterConditions;
	const oFiltersWithoutConflict = mFilters.filterConditionsWithoutConflict ? mFilters.filterConditionsWithoutConflict : {};
	const oTablePropertiesWithoutConflict = oTargetInfo.propertiesWithoutConflict ? oTargetInfo.propertiesWithoutConflict : {};
	const addFiltersToSelectionVariant = function (selectionVariant: any, sFilterName: any, sPath?: any) {
		const aConditions = oFilterConditions[sFilterName];
		const oPropertyInfo = oFilterBar && oFilterBar.getPropertyHelper().getProperty(sFilterName);
		const oTypeConfig = oPropertyInfo?.typeConfig;
		const oTypeUtil = oFilterBar && oFilterBar.getControlDelegate().getTypeUtil();

		for (const item in aConditions) {
			const oCondition = aConditions[item];

			let option: string | undefined = "",
				sign = "I",
				low = "",
				high = null,
				semanticDates;

			const oOperator: any = FilterOperatorUtil.getOperator(oCondition.operator);
			if (oOperator instanceof RangeOperator) {
				semanticDates = CommonUtils.createSemanticDatesFromConditions(oCondition);
				// handling of Date RangeOperators
				const oModelFilter = oOperator.getModelFilter(
					oCondition,
					sFilterName,
					oTypeConfig?.typeInstance,
					false,
					oTypeConfig?.baseType
				) as any;
				if (!oModelFilter?.aFilters && !oModelFilter?.aFilters?.length) {
					sign = (oOperator as any)?.exclude ? "E" : "I";
					low = oTypeUtil.externalizeValue(oModelFilter.getValue1(), oTypeConfig.typeInstance);
					high = oTypeUtil.externalizeValue(oModelFilter.getValue2(), oTypeConfig.typeInstance);
					option = oModelFilter.getOperator();
				}
			} else {
				const aSemanticDateOpsExt = SemanticDateOperators.getSupportedOperations();
				if (aSemanticDateOpsExt.includes(oCondition?.operator)) {
					semanticDates = CommonUtils.createSemanticDatesFromConditions(oCondition);
				}
				const value1 = (oCondition.values[0] && oCondition.values[0].toString()) || "";
				const value2 = (oCondition.values[1] && oCondition.values[1].toString()) || null;
				const oSelectOption = fnGetSignAndOption(oCondition.operator, value1, value2);
				sign = oOperator?.exclude ? "E" : "I";
				low = oSelectOption?.low;
				high = oSelectOption?.high;
				option = oSelectOption?.option;
			}

			if (option && semanticDates) {
				selectionVariant.addSelectOption(sPath ? sPath : sFilterName, sign, option, low, high, undefined, semanticDates);
			} else if (option) {
				selectionVariant.addSelectOption(sPath ? sPath : sFilterName, sign, option, low, high);
			}
		}
	};

	for (sFilter in oFilterConditions) {
		// only add the filter values if it is not already present in the SV already
		if (!oSelectionVariant.getSelectOption(sFilter)) {
			// TODO : custom filters should be ignored more generically
			if (sFilter === "$editState") {
				continue;
			}
			addFiltersToSelectionVariant(oSelectionVariant, sFilter);
		} else {
			if (oTablePropertiesWithoutConflict && sFilter in oTablePropertiesWithoutConflict) {
				addFiltersToSelectionVariant(oSelectionVariant, sFilter, oTablePropertiesWithoutConflict[sFilter]);
			}
			// if property was without conflict in page context then add path from page context to SV
			if (sFilter in oFiltersWithoutConflict) {
				addFiltersToSelectionVariant(oSelectionVariant, sFilter, oFiltersWithoutConflict[sFilter]);
			}
		}
	}
	return oSelectionVariant;
}

function isStickyEditMode(oControl: Control) {
	const bIsStickyMode = ModelHelper.isStickySessionSupported((oControl.getModel() as ODataModel).getMetaModel());
	const bUIEditable = oControl.getModel("ui").getProperty("/isEditable");
	return bIsStickyMode && bUIEditable;
}

/**
 * @param aMandatoryFilterFields
 * @param oSelectionVariant
 * @param oSelectionVariantDefaults
 */
function addDefaultDisplayCurrency(aMandatoryFilterFields: any[], oSelectionVariant: any, oSelectionVariantDefaults: any) {
	if (oSelectionVariant && aMandatoryFilterFields && aMandatoryFilterFields.length) {
		for (let i = 0; i < aMandatoryFilterFields.length; i++) {
			const aSVOption = oSelectionVariant.getSelectOption("DisplayCurrency"),
				aDefaultSVOption = oSelectionVariantDefaults && oSelectionVariantDefaults.getSelectOption("DisplayCurrency");
			if (
				aMandatoryFilterFields[i].$PropertyPath === "DisplayCurrency" &&
				(!aSVOption || !aSVOption.length) &&
				aDefaultSVOption &&
				aDefaultSVOption.length
			) {
				const displayCurrencySelectOption = aDefaultSVOption[0];
				const sSign = displayCurrencySelectOption["Sign"];
				const sOption = displayCurrencySelectOption["Option"];
				const sLow = displayCurrencySelectOption["Low"];
				const sHigh = displayCurrencySelectOption["High"];
				oSelectionVariant.addSelectOption("DisplayCurrency", sSign, sOption, sLow, sHigh);
			}
		}
	}
}

function getNonComputedVisibleFields(oMetaModel: ODataMetaModel, sPath: any, oView?: any) {
	const aTechnicalKeys = oMetaModel.getObject(`${sPath}/`).$Key;
	const aNonComputedVisibleFields: any = [];
	const aImmutableVisibleFields: any = [];
	const oEntityType = oMetaModel.getObject(`${sPath}/`);
	for (const item in oEntityType) {
		if (oEntityType[item].$kind && oEntityType[item].$kind === "Property") {
			const oAnnotations = oMetaModel.getObject(`${sPath}/${item}@`) || {},
				bIsKey = aTechnicalKeys.indexOf(item) > -1,
				bIsImmutable = oAnnotations["@Org.OData.Core.V1.Immutable"],
				bIsNonComputed = !oAnnotations["@Org.OData.Core.V1.Computed"],
				bIsVisible = !oAnnotations["@com.sap.vocabularies.UI.v1.Hidden"],
				bIsComputedDefaultValue = oAnnotations["@Org.OData.Core.V1.ComputedDefaultValue"],
				bIsKeyComputedDefaultValueWithText =
					bIsKey && oEntityType[item].$Type === "Edm.Guid"
						? bIsComputedDefaultValue && oAnnotations["@com.sap.vocabularies.Common.v1.Text"]
						: false;
			if (
				(bIsKeyComputedDefaultValueWithText || (bIsKey && oEntityType[item].$Type !== "Edm.Guid")) &&
				bIsNonComputed &&
				bIsVisible
			) {
				aNonComputedVisibleFields.push(item);
			} else if (bIsImmutable && bIsNonComputed && bIsVisible) {
				aImmutableVisibleFields.push(item);
			}

			if (!bIsNonComputed && bIsComputedDefaultValue && oView) {
				const oDiagnostics = getAppComponent(oView).getDiagnostics();
				const sMessage = "Core.ComputedDefaultValue is ignored as Core.Computed is already set to true";
				oDiagnostics.addIssue(
					IssueCategory.Annotation,
					IssueSeverity.Medium,
					sMessage,
					IssueCategoryType,
					IssueCategoryType?.Annotations?.IgnoredAnnotation
				);
			}
		}
	}
	const aRequiredProperties = CommonUtils.getRequiredPropertiesFromInsertRestrictions(sPath, oMetaModel);
	if (aRequiredProperties.length) {
		aRequiredProperties.forEach(function (sProperty: any) {
			const oAnnotations = oMetaModel.getObject(`${sPath}/${sProperty}@`),
				bIsVisible = !oAnnotations || !oAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
			if (bIsVisible && aNonComputedVisibleFields.indexOf(sProperty) === -1 && aImmutableVisibleFields.indexOf(sProperty) === -1) {
				aNonComputedVisibleFields.push(sProperty);
			}
		});
	}
	return aNonComputedVisibleFields.concat(aImmutableVisibleFields);
}

function getRequiredProperties(sPath: any, oMetaModel: any, bCheckUpdateRestrictions: boolean = false) {
	const aRequiredProperties: any = [];
	let aRequiredPropertiesWithPaths: any = [];
	const navigationText = "$NavigationPropertyBinding";
	let oEntitySetAnnotations;
	if (sPath.endsWith("$")) {
		// if sPath comes with a $ in the end, removing it as it is of no significance
		sPath = sPath.replace("/$", "");
	}
	const entityTypePathParts = sPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
	const entitySetPath = ModelHelper.getEntitySetPath(sPath, oMetaModel);
	const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
	const isContainment = oMetaModel.getObject(`/${entityTypePathParts.join("/")}/$ContainsTarget`);
	const containmentNavPath = isContainment && entityTypePathParts[entityTypePathParts.length - 1];

	//Restrictions directly at Entity Set
	//e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
	if (!isContainment) {
		oEntitySetAnnotations = oMetaModel.getObject(`${entitySetPath}@`);
	}
	if (entityTypePathParts.length > 1) {
		const navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
		const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;
		//Navigation restrictions
		//e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
		const oNavRest = CommonUtils.getNavigationRestrictions(oMetaModel, parentEntitySetPath, navPath.replaceAll("%2F", "/"));

		if (CommonUtils.hasRestrictedPropertiesInAnnotations(oNavRest, true, bCheckUpdateRestrictions)) {
			aRequiredPropertiesWithPaths = bCheckUpdateRestrictions
				? oNavRest["UpdateRestrictions"].RequiredProperties
				: oNavRest["InsertRestrictions"].RequiredProperties;
		}
		if (
			(!aRequiredPropertiesWithPaths || !aRequiredPropertiesWithPaths.length) &&
			CommonUtils.hasRestrictedPropertiesInAnnotations(oEntitySetAnnotations, false, bCheckUpdateRestrictions)
		) {
			aRequiredPropertiesWithPaths = CommonUtils.getRequiredPropertiesFromAnnotations(
				oEntitySetAnnotations,
				bCheckUpdateRestrictions
			);
		}
	} else if (CommonUtils.hasRestrictedPropertiesInAnnotations(oEntitySetAnnotations, false, bCheckUpdateRestrictions)) {
		aRequiredPropertiesWithPaths = CommonUtils.getRequiredPropertiesFromAnnotations(oEntitySetAnnotations, bCheckUpdateRestrictions);
	}
	aRequiredPropertiesWithPaths.forEach(function (oRequiredProperty: any) {
		const sProperty = oRequiredProperty["$PropertyPath"];
		aRequiredProperties.push(sProperty);
	});
	return aRequiredProperties;
}

function getRequiredPropertiesFromInsertRestrictions(sPath: any, oMetaModel: any) {
	return CommonUtils.getRequiredProperties(sPath, oMetaModel);
}

function getRequiredPropertiesFromUpdateRestrictions(sPath: any, oMetaModel: any) {
	return CommonUtils.getRequiredProperties(sPath, oMetaModel, true);
}

function getRequiredPropertiesFromAnnotations(oAnnotations: any, bCheckUpdateRestrictions: boolean = false) {
	if (bCheckUpdateRestrictions) {
		return oAnnotations["@Org.OData.Capabilities.V1.UpdateRestrictions"].RequiredProperties;
	}
	return oAnnotations["@Org.OData.Capabilities.V1.InsertRestrictions"].RequiredProperties;
}

function hasRestrictedPropertiesInAnnotations(
	oAnnotations: any,
	bIsNavigationRestrictions: boolean = false,
	bCheckUpdateRestrictions: boolean = false
) {
	if (bIsNavigationRestrictions) {
		if (bCheckUpdateRestrictions) {
			return oAnnotations && oAnnotations["UpdateRestrictions"] && oAnnotations["UpdateRestrictions"].RequiredProperties
				? true
				: false;
		}
		return oAnnotations && oAnnotations["InsertRestrictions"] && oAnnotations["InsertRestrictions"].RequiredProperties ? true : false;
	} else if (bCheckUpdateRestrictions) {
		return oAnnotations &&
			oAnnotations["@Org.OData.Capabilities.V1.UpdateRestrictions"] &&
			oAnnotations["@Org.OData.Capabilities.V1.UpdateRestrictions"].RequiredProperties
			? true
			: false;
	}
	return oAnnotations &&
		oAnnotations["@Org.OData.Capabilities.V1.InsertRestrictions"] &&
		oAnnotations["@Org.OData.Capabilities.V1.InsertRestrictions"].RequiredProperties
		? true
		: false;
}

function setUserDefaults(
	oAppComponent: AppComponent,
	aParameters: any[],
	oModel: JSONModel | ODataV4Context,
	bIsAction: boolean,
	bIsCreate?: boolean,
	oActionDefaultValues?: any
) {
	return new Promise(function (resolve: (value: any) => void) {
		const oComponentData = oAppComponent.getComponentData(),
			oStartupParameters = (oComponentData && oComponentData.startupParameters) || {},
			oShellServices = oAppComponent.getShellServices();
		if (!oShellServices.hasUShell()) {
			aParameters.forEach(function (oParameter: any) {
				const sPropertyName = bIsAction
					? `/${oParameter.$Name}`
					: (oParameter.getPath?.().slice(oParameter.getPath().lastIndexOf("/") + 1) as string);
				const sParameterName = bIsAction ? sPropertyName.slice(1) : sPropertyName;
				if (oActionDefaultValues && bIsCreate) {
					if (oActionDefaultValues[sParameterName]) {
						oModel.setProperty(sPropertyName, oActionDefaultValues[sParameterName]);
					}
				} else if (oStartupParameters[sParameterName]) {
					oModel.setProperty(sPropertyName, oStartupParameters[sParameterName][0]);
				}
			});
			return resolve(true);
		}
		return oShellServices.getStartupAppState(oAppComponent).then(function (oStartupAppState: any) {
			const oData = oStartupAppState.getData() || {},
				aExtendedParameters = (oData.selectionVariant && oData.selectionVariant.SelectOptions) || [];
			aParameters.forEach(function (oParameter: any) {
				const sPropertyName = bIsAction
					? `/${oParameter.$Name}`
					: (oParameter.getPath?.().slice(oParameter.getPath().lastIndexOf("/") + 1) as string);
				const sParameterName = bIsAction ? sPropertyName.slice(1) : sPropertyName;
				if (oActionDefaultValues && bIsCreate) {
					if (oActionDefaultValues[sParameterName]) {
						oModel.setProperty(sPropertyName, oActionDefaultValues[sParameterName]);
					}
				} else if (oStartupParameters[sParameterName]) {
					oModel.setProperty(sPropertyName, oStartupParameters[sParameterName][0]);
				} else if (aExtendedParameters.length > 0) {
					for (const i in aExtendedParameters) {
						const oExtendedParameter = aExtendedParameters[i];
						if (oExtendedParameter.PropertyName === sParameterName) {
							const oRange = oExtendedParameter.Ranges.length
								? oExtendedParameter.Ranges[oExtendedParameter.Ranges.length - 1]
								: undefined;
							if (oRange && oRange.Sign === "I" && oRange.Option === "EQ") {
								oModel.setProperty(sPropertyName, oRange.Low); // high is ignored when Option=EQ
							}
						}
					}
				}
			});
			return resolve(true);
		});
	});
}

function getAdditionalParamsForCreate(oStartupParameters: any, oInboundParameters: any) {
	const oInbounds = oInboundParameters,
		aCreateParameters = oInbounds
			? Object.keys(oInbounds).filter(function (sParameter: string) {
					return oInbounds[sParameter].useForCreate;
			  })
			: [];
	let oRet;
	for (let i = 0; i < aCreateParameters.length; i++) {
		const sCreateParameter = aCreateParameters[i];
		const aValues = oStartupParameters && oStartupParameters[sCreateParameter];
		if (aValues && aValues.length === 1) {
			oRet = oRet || Object.create(null);
			oRet[sCreateParameter] = aValues[0];
		}
	}
	return oRet;
}

function getSemanticObjectMapping(oOutbound: any) {
	const aSemanticObjectMapping: any[] = [];
	if (oOutbound.parameters) {
		const aParameters = Object.keys(oOutbound.parameters) || [];
		if (aParameters.length > 0) {
			aParameters.forEach(function (sParam: string) {
				const oMapping = oOutbound.parameters[sParam];
				if (oMapping.value && oMapping.value.value && oMapping.value.format === "binding") {
					// using the format of UI.Mapping
					const oSemanticMapping = {
						"LocalProperty": {
							"$PropertyPath": oMapping.value.value
						},
						"SemanticObjectProperty": sParam
					};

					if (aSemanticObjectMapping.length > 0) {
						// To check if the semanticObject Mapping is done for the same local property more that once then first one will be considered
						for (let i = 0; i < aSemanticObjectMapping.length; i++) {
							if (
								aSemanticObjectMapping[i]["LocalProperty"]["$PropertyPath"] !==
								oSemanticMapping["LocalProperty"]["$PropertyPath"]
							) {
								aSemanticObjectMapping.push(oSemanticMapping);
							}
						}
					} else {
						aSemanticObjectMapping.push(oSemanticMapping);
					}
				}
			});
		}
	}
	return aSemanticObjectMapping;
}

function getHeaderFacetItemConfigForExternalNavigation(oViewData: any, oCrossNav: any) {
	const oHeaderFacetItems: any = {};
	let sId;
	const oControlConfig = oViewData.controlConfiguration;
	for (const config in oControlConfig) {
		if (config.indexOf("@com.sap.vocabularies.UI.v1.DataPoint") > -1 || config.indexOf("@com.sap.vocabularies.UI.v1.Chart") > -1) {
			if (
				oControlConfig[config].navigation &&
				oControlConfig[config].navigation.targetOutbound &&
				oControlConfig[config].navigation.targetOutbound.outbound
			) {
				const sOutbound = oControlConfig[config].navigation.targetOutbound.outbound;
				const oOutbound = oCrossNav[sOutbound];
				if (oOutbound.semanticObject && oOutbound.action) {
					if (config.indexOf("Chart") > -1) {
						sId = generate(["fe", "MicroChartLink", config]);
					} else {
						sId = generate(["fe", "HeaderDPLink", config]);
					}
					const aSemanticObjectMapping = CommonUtils.getSemanticObjectMapping(oOutbound);
					oHeaderFacetItems[sId] = {
						semanticObject: oOutbound.semanticObject,
						action: oOutbound.action,
						semanticObjectMapping: aSemanticObjectMapping
					};
				} else {
					Log.error(`Cross navigation outbound is configured without semantic object and action for ${sOutbound}`);
				}
			}
		}
	}
	return oHeaderFacetItems;
}

function setSemanticObjectMappings(oSelectionVariant: any, vMappings: object) {
	const oMappings = typeof vMappings === "string" ? JSON.parse(vMappings) : vMappings;
	for (let i = 0; i < oMappings.length; i++) {
		const sLocalProperty =
			(oMappings[i]["LocalProperty"] && oMappings[i]["LocalProperty"]["$PropertyPath"]) ||
			(oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"] &&
				oMappings[i]["@com.sap.vocabularies.Common.v1.LocalProperty"]["$Path"]);
		const sSemanticObjectProperty =
			oMappings[i]["SemanticObjectProperty"] || oMappings[i]["@com.sap.vocabularies.Common.v1.SemanticObjectProperty"];
		if (oSelectionVariant.getSelectOption(sLocalProperty)) {
			const oSelectOption = oSelectionVariant.getSelectOption(sLocalProperty);

			//Create a new SelectOption with sSemanticObjectProperty as the property Name and remove the older one
			oSelectionVariant.removeSelectOption(sLocalProperty);
			oSelectionVariant.massAddSelectOption(sSemanticObjectProperty, oSelectOption);
		}
	}
	return oSelectionVariant;
}

function fnGetSemanticObjectsFromPath(oMetaModel: any, sPath: string, sQualifier: string) {
	return new Promise(function (resolve: (value: any) => void) {
		let sSemanticObject, aSemanticObjectUnavailableActions;
		if (sQualifier === "") {
			sSemanticObject = oMetaModel.getObject(`${sPath}@${CommonAnnotationTerms.SemanticObject}`);
			aSemanticObjectUnavailableActions = oMetaModel.getObject(`${sPath}@${CommonAnnotationTerms.SemanticObjectUnavailableActions}`);
		} else {
			sSemanticObject = oMetaModel.getObject(`${sPath}@${CommonAnnotationTerms.SemanticObject}#${sQualifier}`);
			aSemanticObjectUnavailableActions = oMetaModel.getObject(
				`${sPath}@${CommonAnnotationTerms.SemanticObjectUnavailableActions}#${sQualifier}`
			);
		}

		const aSemanticObjectForGetLinks = [{ semanticObject: sSemanticObject }];
		const oSemanticObject = {
			semanticObject: sSemanticObject
		};
		resolve({
			semanticObjectPath: sPath,
			semanticObjectForGetLinks: aSemanticObjectForGetLinks,
			semanticObject: oSemanticObject,
			unavailableActions: aSemanticObjectUnavailableActions
		});
	}).catch(function (oError: any) {
		Log.error("Error in fnGetSemanticObjectsFromPath", oError);
	});
}

function fnUpdateSemanticTargetsModel(aGetLinksPromises: any, aSemanticObjects: any, oInternalModelContext: any, sCurrentHash: any) {
	return Promise.all(aGetLinksPromises)
		.then(function (aValues: any[]) {
			let aLinks,
				_oLink,
				_sLinkIntentAction,
				aFinalLinks: any[] = [];
			let oFinalSemanticObjects: any = {};
			const bIntentHasActions = function (sIntent: any, aActions: any) {
				for (const intent in aActions) {
					if (intent === sIntent) {
						return true;
					} else {
						return false;
					}
				}
			};

			for (let k = 0; k < aValues.length; k++) {
				aLinks = aValues[k];
				if (aLinks && aLinks.length > 0 && aLinks[0] !== undefined) {
					const oSemanticObject: any = {};
					let oTmp = {};
					let sAlternatePath;
					for (let i = 0; i < aLinks.length; i++) {
						aFinalLinks.push([]);
						let hasTargetsNotFiltered = false;
						let hasTargets = false;
						for (let iLinkCount = 0; iLinkCount < aLinks[i][0].length; iLinkCount++) {
							_oLink = aLinks[i][0][iLinkCount];
							_sLinkIntentAction = _oLink && _oLink.intent.split("?")[0].split("-")[1];

							if (!(_oLink && _oLink.intent && _oLink.intent.indexOf(sCurrentHash) === 0)) {
								hasTargetsNotFiltered = true;
								if (!bIntentHasActions(_sLinkIntentAction, aSemanticObjects[k].unavailableActions)) {
									aFinalLinks[i].push(_oLink);
									hasTargets = true;
								}
							}
						}
						oTmp = {
							semanticObject: aSemanticObjects[k].semanticObject,
							path: aSemanticObjects[k].path,
							HasTargets: hasTargets,
							HasTargetsNotFiltered: hasTargetsNotFiltered
						};
						if (oSemanticObject[aSemanticObjects[k].semanticObject] === undefined) {
							oSemanticObject[aSemanticObjects[k].semanticObject] = {};
						}
						sAlternatePath = aSemanticObjects[k].path.replace(/\//g, "_");
						if (oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] === undefined) {
							oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] = {};
						}
						oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath] = Object.assign(
							oSemanticObject[aSemanticObjects[k].semanticObject][sAlternatePath],
							oTmp
						);
					}
					const sSemanticObjectName = Object.keys(oSemanticObject)[0];
					if (Object.keys(oFinalSemanticObjects).includes(sSemanticObjectName)) {
						oFinalSemanticObjects[sSemanticObjectName] = Object.assign(
							oFinalSemanticObjects[sSemanticObjectName],
							oSemanticObject[sSemanticObjectName]
						);
					} else {
						oFinalSemanticObjects = Object.assign(oFinalSemanticObjects, oSemanticObject);
					}
					aFinalLinks = [];
				}
			}
			if (Object.keys(oFinalSemanticObjects).length > 0) {
				oInternalModelContext.setProperty(
					"semanticsTargets",
					mergeObjects(oFinalSemanticObjects, oInternalModelContext.getProperty("semanticsTargets"))
				);
				return oFinalSemanticObjects;
			}
		})
		.catch(function (oError: any) {
			Log.error("fnUpdateSemanticTargetsModel: Cannot read links", oError);
		});
}

function fnGetSemanticObjectPromise(oAppComponent: any, oView: any, oMetaModel: any, sPath: string, sQualifier: string) {
	return CommonUtils.getSemanticObjectsFromPath(oMetaModel, sPath, sQualifier);
}

function fnPrepareSemanticObjectsPromises(
	_oAppComponent: any,
	_oView: any,
	_oMetaModel: any,
	_aSemanticObjectsFound: string[],
	_aSemanticObjectsPromises: Promise<any>[]
) {
	let _Keys: string[], sPath;
	let sQualifier: string, regexResult;
	for (let i = 0; i < _aSemanticObjectsFound.length; i++) {
		sPath = _aSemanticObjectsFound[i];
		_Keys = Object.keys(_oMetaModel.getObject(sPath + "@"));
		for (let index = 0; index < _Keys.length; index++) {
			if (
				_Keys[index].indexOf(`@${CommonAnnotationTerms.SemanticObject}`) === 0 &&
				_Keys[index].indexOf(`@${CommonAnnotationTerms.SemanticObjectMapping}`) === -1 &&
				_Keys[index].indexOf(`@${CommonAnnotationTerms.SemanticObjectUnavailableActions}`) === -1
			) {
				regexResult = /#(.*)/.exec(_Keys[index]);
				sQualifier = regexResult ? regexResult[1] : "";
				_aSemanticObjectsPromises.push(
					CommonUtils.getSemanticObjectPromise(_oAppComponent, _oView, _oMetaModel, sPath, sQualifier)
				);
			}
		}
	}
}

function fnGetSemanticTargetsFromPageModel(oController: any, sPageModel: string) {
	const _fnfindValuesHelper = function (obj: any, key: any, list: any) {
		if (!obj) {
			return list;
		}
		if (obj instanceof Array) {
			for (const i in obj) {
				list = list.concat(_fnfindValuesHelper(obj[i], key, []));
			}
			return list;
		}
		if (obj[key]) {
			list.push(obj[key]);
		}

		if (typeof obj == "object" && obj !== null) {
			const children = Object.keys(obj);
			if (children.length > 0) {
				for (let i = 0; i < children.length; i++) {
					list = list.concat(_fnfindValuesHelper(obj[children[i]], key, []));
				}
			}
		}
		return list;
	};
	const _fnfindValues = function (obj: any, key: any) {
		return _fnfindValuesHelper(obj, key, []);
	};
	const _fnDeleteDuplicateSemanticObjects = function (aSemanticObjectPath: any) {
		return aSemanticObjectPath.filter(function (value: any, index: any) {
			return aSemanticObjectPath.indexOf(value) === index;
		});
	};
	const oView = oController.getView();
	const oInternalModelContext = oView.getBindingContext("internal");

	if (oInternalModelContext) {
		const aSemanticObjectsPromises: Promise<any>[] = [];
		const oComponent = oController.getOwnerComponent();
		const oAppComponent = Component.getOwnerComponentFor(oComponent) as AppComponent;
		const oMetaModel = oAppComponent.getMetaModel();
		let oPageModel = oComponent.getModel(sPageModel).getData();
		if (JSON.stringify(oPageModel) === "{}") {
			oPageModel = oComponent.getModel(sPageModel)._getObject("/", undefined);
		}
		let aSemanticObjectsFound = _fnfindValues(oPageModel, "semanticObjectPath");
		aSemanticObjectsFound = _fnDeleteDuplicateSemanticObjects(aSemanticObjectsFound);
		const oShellServiceHelper = CommonUtils.getShellServices(oAppComponent);
		let sCurrentHash = CommonUtils.getHash();
		const aSemanticObjectsForGetLinks = [];
		const aSemanticObjects: any[] = [];
		let _oSemanticObject;

		if (sCurrentHash && sCurrentHash.indexOf("?") !== -1) {
			// sCurrentHash can contain query string, cut it off!
			sCurrentHash = sCurrentHash.split("?")[0];
		}

		fnPrepareSemanticObjectsPromises(oAppComponent, oView, oMetaModel, aSemanticObjectsFound, aSemanticObjectsPromises);

		if (aSemanticObjectsPromises.length === 0) {
			return Promise.resolve();
		} else {
			Promise.all(aSemanticObjectsPromises)
				.then(function (aValues: any[]) {
					const aGetLinksPromises = [];
					let sSemObjExpression;
					const aSemanticObjectsResolved = aValues.filter(function (element: any) {
						if (
							element.semanticObject !== undefined &&
							element.semanticObject.semanticObject &&
							typeof element.semanticObject.semanticObject === "object"
						) {
							sSemObjExpression = compileExpression(pathInModel(element.semanticObject.semanticObject.$Path));
							element.semanticObject.semanticObject = sSemObjExpression;
							element.semanticObjectForGetLinks[0].semanticObject = sSemObjExpression;
							return true;
						} else if (element) {
							return element.semanticObject !== undefined;
						} else {
							return false;
						}
					});
					for (let j = 0; j < aSemanticObjectsResolved.length; j++) {
						_oSemanticObject = aSemanticObjectsResolved[j];
						if (
							_oSemanticObject &&
							_oSemanticObject.semanticObject &&
							!(_oSemanticObject.semanticObject.semanticObject.indexOf("{") === 0)
						) {
							aSemanticObjectsForGetLinks.push(_oSemanticObject.semanticObjectForGetLinks);
							aSemanticObjects.push({
								semanticObject: _oSemanticObject.semanticObject.semanticObject,
								unavailableActions: _oSemanticObject.unavailableActions,
								path: aSemanticObjectsResolved[j].semanticObjectPath
							});
							aGetLinksPromises.push(oShellServiceHelper.getLinksWithCache([_oSemanticObject.semanticObjectForGetLinks]));
						}
					}
					return CommonUtils.updateSemanticTargets(aGetLinksPromises, aSemanticObjects, oInternalModelContext, sCurrentHash);
				})
				.catch(function (oError: any) {
					Log.error("fnGetSemanticTargetsFromTable: Cannot get Semantic Objects", oError);
				});
		}
	} else {
		return Promise.resolve();
	}
}

function getFilterRestrictions(oFilterRestrictionsAnnotation: any, sRestriction: any) {
	const FilterRestrictions = CommonUtils.FilterRestrictions;
	if (sRestriction === FilterRestrictions.REQUIRED_PROPERTIES || sRestriction === FilterRestrictions.NON_FILTERABLE_PROPERTIES) {
		let aProps = [];
		if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation[sRestriction]) {
			aProps = oFilterRestrictionsAnnotation[sRestriction].map(function (oProperty: any) {
				return oProperty.$PropertyPath;
			});
		}
		return aProps;
	} else if (sRestriction === FilterRestrictions.ALLOWED_EXPRESSIONS) {
		const mAllowedExpressions: any = {};
		if (oFilterRestrictionsAnnotation && oFilterRestrictionsAnnotation.FilterExpressionRestrictions) {
			oFilterRestrictionsAnnotation.FilterExpressionRestrictions.forEach(function (oProperty: any) {
				//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
				if (mAllowedExpressions[oProperty.Property.$PropertyPath]) {
					mAllowedExpressions[oProperty.Property.$PropertyPath].push(oProperty.AllowedExpressions);
				} else {
					mAllowedExpressions[oProperty.Property.$PropertyPath] = [oProperty.AllowedExpressions];
				}
			});
		}
		return mAllowedExpressions;
	}
	// Default return the FilterRestrictions Annotation
	return oFilterRestrictionsAnnotation;
}

function _fetchPropertiesForNavPath(paths: string[], navPath: string, props: string[]) {
	const navPathPrefix = navPath + "/";
	return paths.reduce((outPaths: any, pathToCheck: string) => {
		if (pathToCheck.startsWith(navPathPrefix)) {
			const outPath = pathToCheck.replace(navPathPrefix, "");
			if (outPaths.indexOf(outPath) === -1) {
				outPaths.push(outPath);
			}
		}
		return outPaths;
	}, props);
}

function getFilterRestrictionsByPath(entityPath: string, oMetaModel: any) {
	const oRet: any = {},
		FR = CommonUtils.FilterRestrictions;
	let oFilterRestrictions;
	const navigationText = "$NavigationPropertyBinding";
	const frTerm = "@Org.OData.Capabilities.V1.FilterRestrictions";
	const entityTypePathParts = entityPath.replaceAll("%2F", "/").split("/").filter(ModelHelper.filterOutNavPropBinding);
	const entityTypePath = `/${entityTypePathParts.join("/")}/`;
	const entitySetPath = ModelHelper.getEntitySetPath(entityPath, oMetaModel);
	const entitySetPathParts = entitySetPath.split("/").filter(ModelHelper.filterOutNavPropBinding);
	const isContainment = oMetaModel.getObject(`${entityTypePath}$ContainsTarget`);
	const containmentNavPath = isContainment && entityTypePathParts[entityTypePathParts.length - 1];

	//LEAST PRIORITY - Filter restrictions directly at Entity Set
	//e.g. FR in "NS.EntityContainer/SalesOrderManage" ContextPath: /SalesOrderManage
	if (!isContainment) {
		oFilterRestrictions = oMetaModel.getObject(`${entitySetPath}${frTerm}`);
		oRet[FR.REQUIRED_PROPERTIES] = getFilterRestrictions(oFilterRestrictions, FR.REQUIRED_PROPERTIES) || [];
		const resultContextCheck = oMetaModel.getObject(`${entityTypePath}@com.sap.vocabularies.Common.v1.ResultContext`);
		if (!resultContextCheck) {
			oRet[FR.NON_FILTERABLE_PROPERTIES] = getFilterRestrictions(oFilterRestrictions, FR.NON_FILTERABLE_PROPERTIES) || [];
		}
		//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
		oRet[FR.ALLOWED_EXPRESSIONS] = getFilterRestrictions(oFilterRestrictions, FR.ALLOWED_EXPRESSIONS) || {};
	}

	if (entityTypePathParts.length > 1) {
		const navPath = isContainment ? containmentNavPath : entitySetPathParts[entitySetPathParts.length - 1];
		// In case of containment we take entitySet provided as parent. And in case of normal we would remove the last navigation from entitySetPath.
		const parentEntitySetPath = isContainment ? entitySetPath : `/${entitySetPathParts.slice(0, -1).join(`/${navigationText}/`)}`;
		//THIRD HIGHEST PRIORITY - Reading property path restrictions - Annotation at main entity but directly on navigation property path
		//e.g. Parent Customer with PropertyPath="Set/CityName" ContextPath: Customer/Set
		const oParentRet: any = {};
		if (!navPath.includes("%2F")) {
			const oParentFR = oMetaModel.getObject(`${parentEntitySetPath}${frTerm}`);
			oRet[FR.REQUIRED_PROPERTIES] = _fetchPropertiesForNavPath(
				getFilterRestrictions(oParentFR, FR.REQUIRED_PROPERTIES) || [],
				navPath,
				oRet[FR.REQUIRED_PROPERTIES] || []
			);
			oRet[FR.NON_FILTERABLE_PROPERTIES] = _fetchPropertiesForNavPath(
				getFilterRestrictions(oParentFR, FR.NON_FILTERABLE_PROPERTIES) || [],
				navPath,
				oRet[FR.NON_FILTERABLE_PROPERTIES] || []
			);
			//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
			const completeAllowedExps = getFilterRestrictions(oParentFR, FR.ALLOWED_EXPRESSIONS) || {};
			oParentRet[FR.ALLOWED_EXPRESSIONS] = Object.keys(completeAllowedExps).reduce((outProp: any, propPath: any) => {
				if (propPath.startsWith(navPath + "/")) {
					const outPropPath = propPath.replace(navPath + "/", "");
					outProp[outPropPath] = completeAllowedExps[propPath];
				}
				return outProp;
			}, {} as any);
		}

		//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
		oRet[FR.ALLOWED_EXPRESSIONS] = mergeObjects({}, oRet[FR.ALLOWED_EXPRESSIONS], oParentRet[FR.ALLOWED_EXPRESSIONS] || {});

		//SECOND HIGHEST priority - Navigation restrictions
		//e.g. Parent "/Customer" with NavigationPropertyPath="Set" ContextPath: Customer/Set
		const oNavRestrictions = CommonUtils.getNavigationRestrictions(oMetaModel, parentEntitySetPath, navPath.replaceAll("%2F", "/"));
		const oNavFilterRest = oNavRestrictions && oNavRestrictions["FilterRestrictions"];
		const navResReqProps = getFilterRestrictions(oNavFilterRest, FR.REQUIRED_PROPERTIES) || [];
		oRet[FR.REQUIRED_PROPERTIES] = uniqueSort(oRet[FR.REQUIRED_PROPERTIES].concat(navResReqProps));
		const navNonFilterProps = getFilterRestrictions(oNavFilterRest, FR.NON_FILTERABLE_PROPERTIES) || [];
		oRet[FR.NON_FILTERABLE_PROPERTIES] = uniqueSort(oRet[FR.NON_FILTERABLE_PROPERTIES].concat(navNonFilterProps));
		//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
		oRet[FR.ALLOWED_EXPRESSIONS] = mergeObjects(
			{},
			oRet[FR.ALLOWED_EXPRESSIONS],
			getFilterRestrictions(oNavFilterRest, FR.ALLOWED_EXPRESSIONS) || {}
		);

		//HIGHEST priority - Restrictions having target with navigation association entity
		// e.g. FR in "CustomerParameters/Set" ContextPath: "Customer/Set"
		const navAssociationEntityRest = oMetaModel.getObject(`/${entityTypePathParts.join("/")}${frTerm}`);
		const navAssocReqProps = getFilterRestrictions(navAssociationEntityRest, FR.REQUIRED_PROPERTIES) || [];
		oRet[FR.REQUIRED_PROPERTIES] = uniqueSort(oRet[FR.REQUIRED_PROPERTIES].concat(navAssocReqProps));
		const navAssocNonFilterProps = getFilterRestrictions(navAssociationEntityRest, FR.NON_FILTERABLE_PROPERTIES) || [];
		oRet[FR.NON_FILTERABLE_PROPERTIES] = uniqueSort(oRet[FR.NON_FILTERABLE_PROPERTIES].concat(navAssocNonFilterProps));
		//SingleValue | MultiValue | SingleRange | MultiRange | SearchExpression | MultiRangeOrSearchExpression
		oRet[FR.ALLOWED_EXPRESSIONS] = mergeObjects(
			{},
			oRet[FR.ALLOWED_EXPRESSIONS],
			getFilterRestrictions(navAssociationEntityRest, FR.ALLOWED_EXPRESSIONS) || {}
		);
	}
	return oRet;
}

function templateControlFragment(sFragmentName: any, oPreprocessorSettings: any, oOptions: any, oModifier?: any) {
	oOptions = oOptions || {};
	if (oModifier) {
		return oModifier.templateControlFragment(sFragmentName, oPreprocessorSettings, oOptions.view).then(function (oFragment: any) {
			// This is required as Flex returns an HTMLCollection as templating result in XML time.
			return oModifier.targets === "xmlTree" && oFragment.length > 0 ? oFragment[0] : oFragment;
		});
	} else {
		return loadMacroLibrary()
			.then(function () {
				return XMLPreprocessor.process(
					XMLTemplateProcessor.loadTemplate(sFragmentName, "fragment"),
					{ name: sFragmentName },
					oPreprocessorSettings
				);
			})
			.then(function (oFragment: any) {
				const oControl = oFragment.firstElementChild;
				if (!!oOptions.isXML && oControl) {
					return oControl;
				}
				return Fragment.load({
					id: oOptions.id,
					definition: oFragment,
					controller: oOptions.controller
				});
			});
	}
}

function getSingletonPath(path: string, metaModel: ODataMetaModel): string | undefined {
	const parts = path.split("/").filter(Boolean),
		propertyName = parts.pop(),
		navigationPath = parts.join("/"),
		entitySet = navigationPath && metaModel.getObject(`/${navigationPath}`);
	if (entitySet?.$kind === "Singleton") {
		const singletonName = parts[parts.length - 1];
		return `/${singletonName}/${propertyName}`;
	}
	return undefined;
}

function requestSingletonProperty(path: string, model: ODataModel) {
	if (!path || !model) {
		return Promise.resolve(null);
	}
	const metaModel = model.getMetaModel();
	// Find the underlying entity set from the property path and check whether it is a singleton.
	const resolvedPath = getSingletonPath(path, metaModel);
	if (resolvedPath) {
		const propertyBinding = model.bindProperty(resolvedPath);
		return propertyBinding.requestValue();
	}

	return Promise.resolve(null);
}

function addEventToBindingInfo(oControl: Control, sEventName: string, fHandler: Function) {
	let oBindingInfo: any;
	const setBindingInfo = function () {
		if (oBindingInfo) {
			if (!oBindingInfo.events) {
				oBindingInfo.events = {};
			}
			if (!oBindingInfo.events[sEventName]) {
				oBindingInfo.events[sEventName] = fHandler;
			} else {
				const fOriginalHandler = oBindingInfo.events[sEventName];
				oBindingInfo.events[sEventName] = function (...args: any[]) {
					fHandler.apply(this, ...args);
					fOriginalHandler.apply(this, ...args);
				};
			}
		}
	};
	if (oControl.isA("sap.ui.mdc.Chart")) {
		(oControl as any)
			.innerChartBound()
			.then(function () {
				oBindingInfo = (oControl as any).getControlDelegate()._getChart(oControl).getBindingInfo("data");
				setBindingInfo();
			})
			.catch(function (sError: any) {
				Log.error(sError);
			});
	} else {
		oBindingInfo = oControl.data("rowsBindingInfo");
		setBindingInfo();
	}
}

function loadMacroLibrary() {
	return new Promise<void>(function (resolve) {
		sap.ui.require(["sap/fe/macros/macroLibrary"], function (/*macroLibrary*/) {
			resolve();
		});
	});
}

// Get the path for action parameters that is needed to read the annotations
function getParameterPath(sPath: any, sParameter: any) {
	let sContext;
	if (sPath.indexOf("@$ui5.overload") > -1) {
		sContext = sPath.split("@$ui5.overload")[0];
	} else {
		// For Unbound Actions in Action Parameter Dialogs
		const aAction = sPath.split("/0")[0].split(".");
		sContext = `/${aAction[aAction.length - 1]}/`;
	}
	return sContext + sParameter;
}

/**
 * Get resolved expression binding used for texts at runtime.
 *
 * @param expBinding
 * @param control
 * @function
 * @static
 * @memberof sap.fe.core.CommonUtils
 * @returns A string after resolution.
 * @ui5-restricted
 */
function _fntranslatedTextFromExpBindingString(expBinding: string, control: Control) {
	// The idea here is to create dummy element with the expresion binding.
	// Adding it as dependent to the view/control would propagate all the models to the dummy element and resolve the binding.
	// We remove the dummy element after that and destroy it.

	const anyResourceText = new AnyElement({ anyText: expBinding });
	control.addDependent(anyResourceText);
	const resultText = anyResourceText.getAnyText();
	control.removeDependent(anyResourceText);
	anyResourceText.destroy();

	return resultText;
}

const CommonUtils = {
	isPropertyFilterable: isPropertyFilterable,
	isFieldControlPathInapplicable: isFieldControlPathInapplicable,
	removeSensitiveData: removeSensitiveData,
	fireButtonPress: fnFireButtonPress,
	getTargetView: getTargetView,
	getCurrentPageView: getCurrentPageView,
	hasTransientContext: fnHasTransientContexts,
	updateRelatedAppsDetails: fnUpdateRelatedAppsDetails,
	resolveStringtoBoolean: fnResolveStringtoBoolean,
	getAppComponent: getAppComponent,
	getMandatoryFilterFields: fnGetMandatoryFilterFields,
	getContextPathProperties: fnGetContextPathProperties,
	getParameterInfo: getParameterInfo,
	updateDataFieldForIBNButtonsVisibility: fnUpdateDataFieldForIBNButtonsVisibility,
	getTranslatedText: getTranslatedText,
	getEntitySetName: getEntitySetName,
	getActionPath: getActionPath,
	computeDisplayMode: computeDisplayMode,
	isStickyEditMode: isStickyEditMode,
	getOperatorsForProperty: getOperatorsForProperty,
	getOperatorsForDateProperty: getOperatorsForDateProperty,
	getOperatorsForGuidProperty: getOperatorsForGuidProperty,
	addSelectionVariantToConditions: addSelectionVariantToConditions,
	addExternalStateFiltersToSelectionVariant: addExternalStateFiltersToSelectionVariant,
	addPageContextToSelectionVariant: addPageContextToSelectionVariant,
	addDefaultDisplayCurrency: addDefaultDisplayCurrency,
	getNonComputedVisibleFields: getNonComputedVisibleFields,
	setUserDefaults: setUserDefaults,
	getShellServices: getShellServices,
	getHash: getHash,
	getIBNActions: fnGetIBNActions,
	getHeaderFacetItemConfigForExternalNavigation: getHeaderFacetItemConfigForExternalNavigation,
	getSemanticObjectMapping: getSemanticObjectMapping,
	setSemanticObjectMappings: setSemanticObjectMappings,
	getSemanticObjectPromise: fnGetSemanticObjectPromise,
	getSemanticTargetsFromPageModel: fnGetSemanticTargetsFromPageModel,
	getSemanticObjectsFromPath: fnGetSemanticObjectsFromPath,
	updateSemanticTargets: fnUpdateSemanticTargetsModel,
	getPropertyDataType: getPropertyDataType,
	getNavigationRestrictions: getNavigationRestrictions,
	getSearchRestrictions: getSearchRestrictions,
	getFilterRestrictionsByPath: getFilterRestrictionsByPath,
	getSpecificAllowedExpression: getSpecificAllowedExpression,
	getAdditionalParamsForCreate: getAdditionalParamsForCreate,
	requestSingletonProperty: requestSingletonProperty,
	templateControlFragment: templateControlFragment,
	addEventToBindingInfo: addEventToBindingInfo,
	FilterRestrictions: {
		REQUIRED_PROPERTIES: "RequiredProperties",
		NON_FILTERABLE_PROPERTIES: "NonFilterableProperties",
		ALLOWED_EXPRESSIONS: "FilterAllowedExpressions"
	},
	AllowedExpressionsPrio: ["SingleValue", "MultiValue", "SingleRange", "MultiRange", "SearchExpression", "MultiRangeOrSearchExpression"],
	normalizeSearchTerm: normalizeSearchTerm,
	getSingletonPath: getSingletonPath,
	getRequiredPropertiesFromUpdateRestrictions: getRequiredPropertiesFromUpdateRestrictions,
	getRequiredPropertiesFromInsertRestrictions: getRequiredPropertiesFromInsertRestrictions,
	hasRestrictedPropertiesInAnnotations: hasRestrictedPropertiesInAnnotations,
	getRequiredPropertiesFromAnnotations: getRequiredPropertiesFromAnnotations,
	getRequiredProperties: getRequiredProperties,
	checkIfResourceKeyExists: checkIfResourceKeyExists,
	setContextsBasedOnOperationAvailable: setContextsBasedOnOperationAvailable,
	setDynamicActionContexts: setDynamicActionContexts,
	requestProperty: requestProperty,
	getParameterPath: getParameterPath,
	getRelatedAppsMenuItems: _getRelatedAppsMenuItems,
	getTranslatedTextFromExpBindingString: _fntranslatedTextFromExpBindingString,
	addSemanticDatesToConditions: addSemanticDatesToConditions,
	addSelectOptionToConditions: addSelectOptionToConditions,
	createSemanticDatesFromConditions: createSemanticDatesFromConditions,
	updateRelateAppsModel: updateRelateAppsModel,
	getSemanticObjectAnnotations: _getSemanticObjectAnnotations
};

export default CommonUtils;
