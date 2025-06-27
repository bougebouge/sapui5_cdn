/* This class contains helpers to be used at runtime to retrieve further information on the model */
import { EntitySet, EntityType, PropertyAnnotationValue, Singleton } from "@sap-ux/vocabularies-types";
import { DraftNode, DraftRoot } from "@sap-ux/vocabularies-types/vocabularies/Common";
import { StickySessionSupported } from "@sap-ux/vocabularies-types/vocabularies/Session";
import { DeleteHidden } from "@sap-ux/vocabularies-types/vocabularies/UI";
import * as MetaModelConverter from "sap/fe/core/converters/MetaModelConverter";
import type View from "sap/ui/core/mvc/View";
import type BaseContext from "sap/ui/model/Context";
import type JSONModel from "sap/ui/model/json/JSONModel";
import type Context from "sap/ui/model/odata/v4/Context";
import type ODataListBinding from "sap/ui/model/odata/v4/ODataListBinding";
import type ODataMetaModel from "sap/ui/model/odata/v4/ODataMetaModel";
import { ODataModelEx, V4Context } from "types/extension_types";
import { DataModelObjectPath } from "../templating/DataModelPathHelper";

export const enum TypeOfEntity {
	TypeSingleton = "Singleton",
	TypeEntity = "EntitySet"
}
const ModelHelper = {
	/**
	 * Method to determine if the programming model is sticky.
	 *
	 * @function
	 * @name isStickySessionSupported
	 * @param oMetaModel ODataModelMetaModel to check for sticky enabled entity
	 * @returns Returns true if sticky, else false
	 */
	isStickySessionSupported: function (oMetaModel: ODataMetaModel) {
		const oEntityContainer = oMetaModel.getObject("/");
		for (const sEntitySet in oEntityContainer) {
			if (
				oEntityContainer[sEntitySet].$kind === "EntitySet" &&
				oMetaModel.getObject(`/${sEntitySet}@com.sap.vocabularies.Session.v1.StickySessionSupported`)
			) {
				return true;
			}
		}
		return false;
	},

	/**
	 * Method to determine if the programming model is draft.
	 *
	 * @function
	 * @name isDraftSupported
	 * @param oMetaModel ODataModelMetaModel of the context for which draft support shall be checked
	 * @param sPath Path for which draft support shall be checked
	 * @returns Returns true if draft, else false
	 */
	isDraftSupported: function (oMetaModel: any, sPath: string) {
		const oMetaContext = oMetaModel.getMetaContext(sPath);
		let sTargetEntitySet = this.getTargetEntitySet(oMetaContext),
			oParentEntitySetContext,
			aParts;

		if (oMetaContext.getProperty && oMetaContext.getProperty() && oMetaContext.getProperty().$ContainsTarget === true) {
			aParts = oMetaModel.getMetaPath(sPath).split("/").filter(Boolean);
			if (aParts.length) {
				for (let i = aParts.length - 1; i >= 0; i--) {
					oParentEntitySetContext = oMetaModel.getMetaContext(oMetaModel.getMetaPath(`/${aParts[i]}`));
					if (oParentEntitySetContext.getObject("$kind") === "EntitySet") {
						sTargetEntitySet = this.getTargetEntitySet(oParentEntitySetContext);
						break;
					}
				}
			}
		} else {
			sTargetEntitySet = this.getTargetEntitySet(oMetaContext);
		}
		const oEntityContext = oMetaModel.getMetaContext(sTargetEntitySet);
		if (
			oEntityContext.getObject("@com.sap.vocabularies.Common.v1.DraftRoot") ||
			oEntityContext.getObject("@com.sap.vocabularies.Common.v1.DraftNode")
		) {
			return true;
		}
		return false;
	},

	/**
	 * Checks if draft is supported for the data model object path.
	 *
	 * @param dataModelObjectPath
	 * @returns `true` if it is supported
	 */
	isObjectPathDraftSupported: function (dataModelObjectPath: DataModelObjectPath): boolean {
		const currentEntitySet = dataModelObjectPath.targetEntitySet as EntitySet;
		const bIsDraftRoot = ModelHelper.isDraftRoot(currentEntitySet);
		const bIsDraftNode = ModelHelper.isDraftNode(currentEntitySet);
		const bIsDraftParentEntityForContainment =
			dataModelObjectPath.targetObject?.containsTarget &&
			((dataModelObjectPath.startingEntitySet as EntitySet)?.annotations?.Common?.DraftRoot ||
				(dataModelObjectPath.startingEntitySet as EntitySet)?.annotations?.Common?.DraftNode)
				? true
				: false;

		return bIsDraftRoot || bIsDraftNode || (!currentEntitySet && bIsDraftParentEntityForContainment);
	},

	/**
	 * Method to determine if the service, supports collaboration draft.
	 *
	 * @function
	 * @name isCollaborationDraftSupported
	 * @param metaObject MetaObject to be used for determination
	 * @param templateInterface API provided by UI5 templating if used
	 * @returns Returns true if the service supports collaboration draft, else false
	 */
	isCollaborationDraftSupported: function (metaObject: any, templateInterface?: any) {
		const oMetaModel = (templateInterface?.context?.getModel() || metaObject) as ODataMetaModel;
		const oEntityContainer = oMetaModel.getObject("/");
		for (const sEntitySet in oEntityContainer) {
			if (
				oEntityContainer[sEntitySet].$kind === "EntitySet" &&
				oMetaModel.getObject(`/${sEntitySet}@com.sap.vocabularies.Common.v1.DraftRoot/ShareAction`)
			) {
				return true;
			}
		}
		return false;
	},

	/**
	 * Method to get the path of the DraftRoot path according to the provided context.
	 *
	 * @function
	 * @name getDraftRootPath
	 * @param oContext OdataModel context
	 * @returns Returns the path of the draftRoot entity, or undefined if no draftRoot is found
	 */
	getDraftRootPath: function (oContext: V4Context): string | undefined {
		const oMetaModel = oContext.getModel().getMetaModel();
		const getRootPath = function (sPath: string, model: ODataModelEx, firstIteration = true): string | undefined {
			const sIterationPath = firstIteration ? sPath : new RegExp(/.*(?=\/)/).exec(sPath)?.[0]; // *Regex to get the ancestor
			if (sIterationPath && sIterationPath !== "/") {
				const sEntityPath = oMetaModel.getMetaPath(sIterationPath);
				const mDataModel = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.getContext(sEntityPath));
				if ((mDataModel.targetEntitySet as EntitySet)?.annotations.Common?.DraftRoot) {
					return sIterationPath;
				}
				return getRootPath(sIterationPath, model, false);
			}
			return undefined;
		};
		return getRootPath(oContext.getPath(), oContext.getModel());
	},

	/**
	 * Returns path to the target entity set via using navigation property binding.
	 *
	 * @function
	 * @name getTargetEntitySet
	 * @param oContext Context for which the target entity set shall be determined
	 * @returns Returns path to the target entity set
	 */
	getTargetEntitySet: function (oContext: Context) {
		const sPath = oContext.getPath();
		if (
			oContext.getObject("$kind") === "EntitySet" ||
			oContext.getObject("$kind") === "Action" ||
			oContext.getObject("0/$kind") === "Action"
		) {
			return sPath;
		}
		const sEntitySetPath = ModelHelper.getEntitySetPath(sPath);
		return `/${oContext.getObject(sEntitySetPath)}`;
	},

	/**
	 * Returns complete path to the entity set via using navigation property binding. Note: To be used only after the metamodel has loaded.
	 *
	 * @function
	 * @name getEntitySetPath
	 * @param path Path for which complete entitySet path needs to be determined from entityType path
	 * @param metaModel Metamodel to be used.(Optional in normal scenarios, but needed for parameterized service scenarios)
	 * @returns Returns complete path to the entity set
	 */
	getEntitySetPath: function (path: string, metaModel?: ODataMetaModel) {
		let entitySetPath: string = "";
		if (!metaModel) {
			// Previous implementation for getting entitySetPath from entityTypePath
			entitySetPath = `/${path.split("/").filter(ModelHelper.filterOutNavPropBinding).join("/$NavigationPropertyBinding/")}`;
		} else {
			// Calculating the entitySetPath from MetaModel.
			const pathParts = path.split("/").filter(ModelHelper.filterOutNavPropBinding);
			if (pathParts.length > 1) {
				const initialPathObject = {
					growingPath: "/",
					pendingNavPropBinding: ""
				};

				const pathObject = pathParts.reduce((pathUnderConstruction: any, pathPart: string, idx: number) => {
					const delimiter = (!!idx && "/$NavigationPropertyBinding/") || "";
					let { growingPath, pendingNavPropBinding } = pathUnderConstruction;
					const tempPath = growingPath + delimiter;
					const navPropBindings = metaModel.getObject(tempPath);
					const navPropBindingToCheck = pendingNavPropBinding ? `${pendingNavPropBinding}/${pathPart}` : pathPart;
					if (
						navPropBindings &&
						Object.keys(navPropBindings).length > 0 &&
						navPropBindings.hasOwnProperty(navPropBindingToCheck)
					) {
						growingPath = tempPath + navPropBindingToCheck.replace("/", "%2F");
						pendingNavPropBinding = "";
					} else {
						pendingNavPropBinding += pendingNavPropBinding ? `/${pathPart}` : pathPart;
					}
					return { growingPath, pendingNavPropBinding };
				}, initialPathObject as any);

				entitySetPath = pathObject.growingPath;
			} else {
				entitySetPath = `/${pathParts[0]}`;
			}
		}

		return entitySetPath;
	},

	/**
	 * Gets the path for the items property of MultiValueField parameters.
	 *
	 * @function
	 * @name getActionParameterItemsModelPath
	 * @param oParameter Action Parameter
	 * @returns Returns the complete model path for the items property of MultiValueField parameters
	 */
	getActionParameterItemsModelPath: function (oParameter: any) {
		return oParameter && oParameter.$Name ? `{path: 'mvfview>/${oParameter.$Name}'}` : undefined;
	},

	filterOutNavPropBinding: function (sPathPart: any) {
		return sPathPart !== "" && sPathPart !== "$NavigationPropertyBinding";
	},

	/**
	 * Adds a setProperty to the created binding contexts of the internal JSON model.
	 *
	 * @function
	 * @name enhanceInternalJSONModel
	 * @param {sap.ui.model.json.JSONModel} Internal JSON Model which is enhanced
	 */

	enhanceInternalJSONModel: function (oInternalModel: any) {
		const fnBindContext = oInternalModel.bindContext;
		oInternalModel.bindContext = function (sPath: any, oContext: any, mParameters: any, ...args: any[]) {
			oContext = fnBindContext.apply(this, [sPath, oContext, mParameters, ...args]);
			const fnGetBoundContext = oContext.getBoundContext;

			oContext.getBoundContext = function (...subArgs: any[]) {
				const oBoundContext = fnGetBoundContext.apply(this, ...subArgs);
				if (oBoundContext && !oBoundContext.setProperty) {
					oBoundContext.setProperty = function (sSetPropPath: any, value: any) {
						if (this.getObject() === undefined) {
							// initialize
							this.getModel().setProperty(this.getPath(), {});
						}
						this.getModel().setProperty(sSetPropPath, value, this);
					};
				}
				return oBoundContext;
			};
			return oContext;
		};
	},

	/**
	 * Adds an handler on propertyChange.
	 * The property "/editMode" is changed according to property '/isEditable' when this last one is set
	 * in order to be compliant with former versions where building blocks use the property "/editMode"
	 *
	 * @function
	 * @name enhanceUiJSONModel
	 * @param {sap.ui.model.json.JSONModel} uiModel JSON Model which is enhanced
	 * @param {object} library Core library of SAP Fiori elements
	 */

	enhanceUiJSONModel: function (uiModel: JSONModel, library: any) {
		const fnSetProperty = uiModel.setProperty as any;
		uiModel.setProperty = function (...args: any[]) {
			const value = args[1];
			if (args[0] === "/isEditable") {
				uiModel.setProperty("/editMode", value ? library.EditMode.Editable : library.EditMode.Display, args[2], args[3]);
			}
			return fnSetProperty.apply(this, [...args]);
		};
	},
	/**
	 * Returns whether filtering on the table is case sensitive.
	 *
	 * @param oMetaModel The instance of the meta model
	 * @returns Returns 'false' if FilterFunctions annotation supports 'tolower', else 'true'
	 */
	isFilteringCaseSensitive: function (oMetaModel: any) {
		if (!oMetaModel) {
			return undefined;
		}
		const aFilterFunctions = oMetaModel.getObject("/@Org.OData.Capabilities.V1.FilterFunctions");
		// Get filter functions defined at EntityContainer and check for existence of 'tolower'
		return aFilterFunctions ? aFilterFunctions.indexOf("tolower") === -1 : true;
	},

	/**
	 * Get MetaPath for the context.
	 *
	 * @param oContext Context to be used
	 * @returns Returns meta path for the context.
	 */
	getMetaPathForContext: function (oContext: any) {
		const oModel = oContext.getModel(),
			oMetaModel = oModel.getMetaModel(),
			sPath = oContext.getPath();
		return oMetaModel && sPath && oMetaModel.getMetaPath(sPath);
	},

	/**
	 * Get MetaPath for the listbinding.
	 *
	 * @param oView View of the control using listBinding
	 * @param vListBinding ODataListBinding object or the binding path for a temporary list binding
	 * @returns Returns meta path for the listbinding.
	 */
	getAbsoluteMetaPathForListBinding: function (oView: View, vListBinding: ODataListBinding | string) {
		const oMetaModel = oView.getModel().getMetaModel() as ODataMetaModel;
		let sMetaPath;

		if (typeof vListBinding === "string") {
			if (vListBinding.startsWith("/")) {
				// absolute path
				sMetaPath = oMetaModel.getMetaPath(vListBinding);
			} else {
				// relative path
				const oBindingContext = oView.getBindingContext();
				const sRootContextPath = oBindingContext!.getPath();
				sMetaPath = oMetaModel.getMetaPath(`${sRootContextPath}/${vListBinding}`);
			}
		} else {
			// we already get a list binding use this one
			const oBinding = vListBinding;
			const oRootBinding = oBinding.getRootBinding();
			if (oBinding === oRootBinding) {
				// absolute path
				sMetaPath = oMetaModel.getMetaPath(oBinding.getPath());
			} else {
				// relative path
				const sRootBindingPath = oRootBinding!.getPath();
				const sRelativePath = oBinding.getPath();
				sMetaPath = oMetaModel.getMetaPath(`${sRootBindingPath}/${sRelativePath}`);
			}
		}
		return sMetaPath;
	},

	/**
	 * Method to determine if the draft root is supported or not.
	 *
	 * @function
	 * @name isSingleton
	 * @param entitySet EntitySet | Singleton | undefined
	 * @returns True if entity type is singleton
	 */
	isSingleton: function (entitySet: EntitySet | Singleton | undefined): boolean {
		if (entitySet?._type === TypeOfEntity.TypeSingleton) {
			return true;
		}
		return false;
	},
	/**
	 * Method to determine if the draft root is supported or not.
	 *
	 * @function
	 * @name isDraftRoot
	 * @param entitySet EntitySet | Singleton | undefined
	 * @returns True if draft root is present
	 */
	isDraftRoot: function (entitySet: EntitySet | Singleton | undefined): boolean {
		if (ModelHelper.isSingleton(entitySet)) {
			return false;
		}
		return entitySet && (entitySet as EntitySet).annotations.Common?.DraftRoot ? true : false;
	},
	/**
	 * Method to determine if the draft root is supported or not.
	 *
	 * @function
	 * @name isDraftNode
	 * @param entitySet EntitySet | Singleton | undefined
	 * @returns True if draft root is present
	 */
	isDraftNode: function (entitySet: EntitySet | Singleton | undefined): boolean {
		if (ModelHelper.isSingleton(entitySet)) {
			return false;
		}
		return entitySet && (entitySet as EntitySet).annotations.Common?.DraftNode ? true : false;
	},
	/**
	 * Method to determine if the draft root is supported or not.
	 *
	 * @function
	 * @name isSticky
	 * @param entitySet EntitySet | Singleton | undefined
	 * @returns True if sticky is supported else false
	 */
	isSticky: function (entitySet: EntitySet | Singleton | undefined): boolean {
		if (ModelHelper.isSingleton(entitySet)) {
			return false;
		}
		return entitySet && (entitySet as EntitySet).annotations.Session?.StickySessionSupported ? true : false;
	},
	/**
	 * Method to determine if entity is updatable or not.
	 *
	 * @function
	 * @name isUpdateHidden
	 * @param entitySet EntitySet | Singleton | undefined
	 * @param entityType EntityType
	 * @returns True if updatable else false
	 */
	isUpdateHidden: function (entitySet: EntitySet | Singleton | undefined, entityType: EntityType): PropertyAnnotationValue<boolean> {
		if (ModelHelper.isSingleton(entitySet)) {
			return false;
		}
		return (
			(entitySet as EntitySet)?.annotations.UI?.UpdateHidden?.valueOf() !== undefined
				? (entitySet as EntitySet)?.annotations.UI?.UpdateHidden
				: entityType?.annotations.UI?.UpdateHidden
		) as PropertyAnnotationValue<boolean>;
	},
	/**
	 * Method to get draft root.
	 *
	 * @function
	 * @name getDraftRoot
	 * @param entitySet EntitySet | Singleton | undefined
	 * @returns DraftRoot
	 */
	getDraftRoot: function (entitySet: EntitySet | Singleton | undefined): DraftRoot | undefined {
		if (ModelHelper.isSingleton(entitySet)) {
			return undefined;
		}
		return entitySet && (entitySet as EntitySet).annotations.Common?.DraftRoot;
	},
	/**
	 * Method to get draft root.
	 *
	 * @function
	 * @name getDraftNode
	 * @param entitySet EntitySet | Singleton | undefined
	 * @returns DraftRoot
	 */
	getDraftNode: function (entitySet: EntitySet | Singleton | undefined): DraftNode | undefined {
		if (ModelHelper.isSingleton(entitySet)) {
			return undefined;
		}
		return entitySet && (entitySet as EntitySet).annotations.Common?.DraftNode;
	},
	/**
	 * Helper method to get sticky session.
	 *
	 * @function
	 * @name getStickySession
	 * @param entitySet EntitySet | Singleton | undefined
	 * @returns Session StickySessionSupported
	 */
	getStickySession: function (entitySet: EntitySet | Singleton | undefined): StickySessionSupported | undefined {
		if (ModelHelper.isSingleton(entitySet)) {
			return undefined;
		}
		return entitySet && (entitySet as EntitySet).annotations?.Session?.StickySessionSupported;
	},
	/**
	 * Method to get the visibility state of delete button.
	 *
	 * @function
	 * @name getDeleteHidden
	 * @param entitySet EntitySet | Singleton | undefined
	 * @param entityType EntityType
	 * @returns True if delete button is hidden
	 */
	getDeleteHidden: function (entitySet: EntitySet | Singleton | undefined, entityType: EntityType): DeleteHidden | Boolean | undefined {
		if (ModelHelper.isSingleton(entitySet)) {
			return false;
		}
		return (entitySet as EntitySet)?.annotations.UI?.DeleteHidden?.valueOf() !== undefined
			? (entitySet as EntitySet)?.annotations.UI?.DeleteHidden
			: entityType?.annotations.UI?.DeleteHidden;
	}
};

export type InternalModelContext = BaseContext & {
	setProperty(sPath: string, vValue: any): void;
};

export default ModelHelper;
