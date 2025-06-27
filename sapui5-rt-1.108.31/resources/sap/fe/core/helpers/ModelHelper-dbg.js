/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/MetaModelConverter"], function (MetaModelConverter) {
  "use strict";

  var _exports = {};
  var TypeOfEntity;
  (function (TypeOfEntity) {
    TypeOfEntity["TypeSingleton"] = "Singleton";
    TypeOfEntity["TypeEntity"] = "EntitySet";
  })(TypeOfEntity || (TypeOfEntity = {}));
  _exports.TypeOfEntity = TypeOfEntity;
  var ModelHelper = {
    /**
     * Method to determine if the programming model is sticky.
     *
     * @function
     * @name isStickySessionSupported
     * @param oMetaModel ODataModelMetaModel to check for sticky enabled entity
     * @returns Returns true if sticky, else false
     */
    isStickySessionSupported: function (oMetaModel) {
      var oEntityContainer = oMetaModel.getObject("/");
      for (var sEntitySet in oEntityContainer) {
        if (oEntityContainer[sEntitySet].$kind === "EntitySet" && oMetaModel.getObject("/".concat(sEntitySet, "@com.sap.vocabularies.Session.v1.StickySessionSupported"))) {
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
    isDraftSupported: function (oMetaModel, sPath) {
      var oMetaContext = oMetaModel.getMetaContext(sPath);
      var sTargetEntitySet = this.getTargetEntitySet(oMetaContext),
        oParentEntitySetContext,
        aParts;
      if (oMetaContext.getProperty && oMetaContext.getProperty() && oMetaContext.getProperty().$ContainsTarget === true) {
        aParts = oMetaModel.getMetaPath(sPath).split("/").filter(Boolean);
        if (aParts.length) {
          for (var i = aParts.length - 1; i >= 0; i--) {
            oParentEntitySetContext = oMetaModel.getMetaContext(oMetaModel.getMetaPath("/".concat(aParts[i])));
            if (oParentEntitySetContext.getObject("$kind") === "EntitySet") {
              sTargetEntitySet = this.getTargetEntitySet(oParentEntitySetContext);
              break;
            }
          }
        }
      } else {
        sTargetEntitySet = this.getTargetEntitySet(oMetaContext);
      }
      var oEntityContext = oMetaModel.getMetaContext(sTargetEntitySet);
      if (oEntityContext.getObject("@com.sap.vocabularies.Common.v1.DraftRoot") || oEntityContext.getObject("@com.sap.vocabularies.Common.v1.DraftNode")) {
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
    isObjectPathDraftSupported: function (dataModelObjectPath) {
      var _dataModelObjectPath$, _dataModelObjectPath$2, _dataModelObjectPath$3, _dataModelObjectPath$4, _dataModelObjectPath$5, _dataModelObjectPath$6, _dataModelObjectPath$7;
      var currentEntitySet = dataModelObjectPath.targetEntitySet;
      var bIsDraftRoot = ModelHelper.isDraftRoot(currentEntitySet);
      var bIsDraftNode = ModelHelper.isDraftNode(currentEntitySet);
      var bIsDraftParentEntityForContainment = (_dataModelObjectPath$ = dataModelObjectPath.targetObject) !== null && _dataModelObjectPath$ !== void 0 && _dataModelObjectPath$.containsTarget && ((_dataModelObjectPath$2 = dataModelObjectPath.startingEntitySet) !== null && _dataModelObjectPath$2 !== void 0 && (_dataModelObjectPath$3 = _dataModelObjectPath$2.annotations) !== null && _dataModelObjectPath$3 !== void 0 && (_dataModelObjectPath$4 = _dataModelObjectPath$3.Common) !== null && _dataModelObjectPath$4 !== void 0 && _dataModelObjectPath$4.DraftRoot || (_dataModelObjectPath$5 = dataModelObjectPath.startingEntitySet) !== null && _dataModelObjectPath$5 !== void 0 && (_dataModelObjectPath$6 = _dataModelObjectPath$5.annotations) !== null && _dataModelObjectPath$6 !== void 0 && (_dataModelObjectPath$7 = _dataModelObjectPath$6.Common) !== null && _dataModelObjectPath$7 !== void 0 && _dataModelObjectPath$7.DraftNode) ? true : false;
      return bIsDraftRoot || bIsDraftNode || !currentEntitySet && bIsDraftParentEntityForContainment;
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
    isCollaborationDraftSupported: function (metaObject, templateInterface) {
      var _templateInterface$co;
      var oMetaModel = (templateInterface === null || templateInterface === void 0 ? void 0 : (_templateInterface$co = templateInterface.context) === null || _templateInterface$co === void 0 ? void 0 : _templateInterface$co.getModel()) || metaObject;
      var oEntityContainer = oMetaModel.getObject("/");
      for (var sEntitySet in oEntityContainer) {
        if (oEntityContainer[sEntitySet].$kind === "EntitySet" && oMetaModel.getObject("/".concat(sEntitySet, "@com.sap.vocabularies.Common.v1.DraftRoot/ShareAction"))) {
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
    getDraftRootPath: function (oContext) {
      var oMetaModel = oContext.getModel().getMetaModel();
      var getRootPath = function (sPath, model) {
        var _RegExp$exec;
        var firstIteration = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
        var sIterationPath = firstIteration ? sPath : (_RegExp$exec = new RegExp(/.*(?=\/)/).exec(sPath)) === null || _RegExp$exec === void 0 ? void 0 : _RegExp$exec[0]; // *Regex to get the ancestor
        if (sIterationPath && sIterationPath !== "/") {
          var _mDataModel$targetEnt, _mDataModel$targetEnt2;
          var sEntityPath = oMetaModel.getMetaPath(sIterationPath);
          var mDataModel = MetaModelConverter.getInvolvedDataModelObjects(oMetaModel.getContext(sEntityPath));
          if ((_mDataModel$targetEnt = mDataModel.targetEntitySet) !== null && _mDataModel$targetEnt !== void 0 && (_mDataModel$targetEnt2 = _mDataModel$targetEnt.annotations.Common) !== null && _mDataModel$targetEnt2 !== void 0 && _mDataModel$targetEnt2.DraftRoot) {
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
    getTargetEntitySet: function (oContext) {
      var sPath = oContext.getPath();
      if (oContext.getObject("$kind") === "EntitySet" || oContext.getObject("$kind") === "Action" || oContext.getObject("0/$kind") === "Action") {
        return sPath;
      }
      var sEntitySetPath = ModelHelper.getEntitySetPath(sPath);
      return "/".concat(oContext.getObject(sEntitySetPath));
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
    getEntitySetPath: function (path, metaModel) {
      var entitySetPath = "";
      if (!metaModel) {
        // Previous implementation for getting entitySetPath from entityTypePath
        entitySetPath = "/".concat(path.split("/").filter(ModelHelper.filterOutNavPropBinding).join("/$NavigationPropertyBinding/"));
      } else {
        // Calculating the entitySetPath from MetaModel.
        var pathParts = path.split("/").filter(ModelHelper.filterOutNavPropBinding);
        if (pathParts.length > 1) {
          var initialPathObject = {
            growingPath: "/",
            pendingNavPropBinding: ""
          };
          var pathObject = pathParts.reduce(function (pathUnderConstruction, pathPart, idx) {
            var delimiter = !!idx && "/$NavigationPropertyBinding/" || "";
            var growingPath = pathUnderConstruction.growingPath,
              pendingNavPropBinding = pathUnderConstruction.pendingNavPropBinding;
            var tempPath = growingPath + delimiter;
            var navPropBindings = metaModel.getObject(tempPath);
            var navPropBindingToCheck = pendingNavPropBinding ? "".concat(pendingNavPropBinding, "/").concat(pathPart) : pathPart;
            if (navPropBindings && Object.keys(navPropBindings).length > 0 && navPropBindings.hasOwnProperty(navPropBindingToCheck)) {
              growingPath = tempPath + navPropBindingToCheck.replace("/", "%2F");
              pendingNavPropBinding = "";
            } else {
              pendingNavPropBinding += pendingNavPropBinding ? "/".concat(pathPart) : pathPart;
            }
            return {
              growingPath: growingPath,
              pendingNavPropBinding: pendingNavPropBinding
            };
          }, initialPathObject);
          entitySetPath = pathObject.growingPath;
        } else {
          entitySetPath = "/".concat(pathParts[0]);
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
    getActionParameterItemsModelPath: function (oParameter) {
      return oParameter && oParameter.$Name ? "{path: 'mvfview>/".concat(oParameter.$Name, "'}") : undefined;
    },
    filterOutNavPropBinding: function (sPathPart) {
      return sPathPart !== "" && sPathPart !== "$NavigationPropertyBinding";
    },
    /**
     * Adds a setProperty to the created binding contexts of the internal JSON model.
     *
     * @function
     * @name enhanceInternalJSONModel
     * @param {sap.ui.model.json.JSONModel} Internal JSON Model which is enhanced
     */

    enhanceInternalJSONModel: function (oInternalModel) {
      var fnBindContext = oInternalModel.bindContext;
      oInternalModel.bindContext = function (sPath, oContext, mParameters) {
        for (var _len = arguments.length, args = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
          args[_key - 3] = arguments[_key];
        }
        oContext = fnBindContext.apply(this, [sPath, oContext, mParameters].concat(args));
        var fnGetBoundContext = oContext.getBoundContext;
        oContext.getBoundContext = function () {
          for (var _len2 = arguments.length, subArgs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            subArgs[_key2] = arguments[_key2];
          }
          var oBoundContext = fnGetBoundContext.apply.apply(fnGetBoundContext, [this].concat(subArgs));
          if (oBoundContext && !oBoundContext.setProperty) {
            oBoundContext.setProperty = function (sSetPropPath, value) {
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

    enhanceUiJSONModel: function (uiModel, library) {
      var fnSetProperty = uiModel.setProperty;
      uiModel.setProperty = function () {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        var value = args[1];
        if (args[0] === "/isEditable") {
          uiModel.setProperty("/editMode", value ? library.EditMode.Editable : library.EditMode.Display, args[2], args[3]);
        }
        return fnSetProperty.apply(this, [].concat(args));
      };
    },
    /**
     * Returns whether filtering on the table is case sensitive.
     *
     * @param oMetaModel The instance of the meta model
     * @returns Returns 'false' if FilterFunctions annotation supports 'tolower', else 'true'
     */
    isFilteringCaseSensitive: function (oMetaModel) {
      if (!oMetaModel) {
        return undefined;
      }
      var aFilterFunctions = oMetaModel.getObject("/@Org.OData.Capabilities.V1.FilterFunctions");
      // Get filter functions defined at EntityContainer and check for existence of 'tolower'
      return aFilterFunctions ? aFilterFunctions.indexOf("tolower") === -1 : true;
    },
    /**
     * Get MetaPath for the context.
     *
     * @param oContext Context to be used
     * @returns Returns meta path for the context.
     */
    getMetaPathForContext: function (oContext) {
      var oModel = oContext.getModel(),
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
    getAbsoluteMetaPathForListBinding: function (oView, vListBinding) {
      var oMetaModel = oView.getModel().getMetaModel();
      var sMetaPath;
      if (typeof vListBinding === "string") {
        if (vListBinding.startsWith("/")) {
          // absolute path
          sMetaPath = oMetaModel.getMetaPath(vListBinding);
        } else {
          // relative path
          var oBindingContext = oView.getBindingContext();
          var sRootContextPath = oBindingContext.getPath();
          sMetaPath = oMetaModel.getMetaPath("".concat(sRootContextPath, "/").concat(vListBinding));
        }
      } else {
        // we already get a list binding use this one
        var oBinding = vListBinding;
        var oRootBinding = oBinding.getRootBinding();
        if (oBinding === oRootBinding) {
          // absolute path
          sMetaPath = oMetaModel.getMetaPath(oBinding.getPath());
        } else {
          // relative path
          var sRootBindingPath = oRootBinding.getPath();
          var sRelativePath = oBinding.getPath();
          sMetaPath = oMetaModel.getMetaPath("".concat(sRootBindingPath, "/").concat(sRelativePath));
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
    isSingleton: function (entitySet) {
      if ((entitySet === null || entitySet === void 0 ? void 0 : entitySet._type) === TypeOfEntity.TypeSingleton) {
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
    isDraftRoot: function (entitySet) {
      var _annotations$Common;
      if (ModelHelper.isSingleton(entitySet)) {
        return false;
      }
      return entitySet && (_annotations$Common = entitySet.annotations.Common) !== null && _annotations$Common !== void 0 && _annotations$Common.DraftRoot ? true : false;
    },
    /**
     * Method to determine if the draft root is supported or not.
     *
     * @function
     * @name isDraftNode
     * @param entitySet EntitySet | Singleton | undefined
     * @returns True if draft root is present
     */
    isDraftNode: function (entitySet) {
      var _annotations$Common2;
      if (ModelHelper.isSingleton(entitySet)) {
        return false;
      }
      return entitySet && (_annotations$Common2 = entitySet.annotations.Common) !== null && _annotations$Common2 !== void 0 && _annotations$Common2.DraftNode ? true : false;
    },
    /**
     * Method to determine if the draft root is supported or not.
     *
     * @function
     * @name isSticky
     * @param entitySet EntitySet | Singleton | undefined
     * @returns True if sticky is supported else false
     */
    isSticky: function (entitySet) {
      var _annotations$Session;
      if (ModelHelper.isSingleton(entitySet)) {
        return false;
      }
      return entitySet && (_annotations$Session = entitySet.annotations.Session) !== null && _annotations$Session !== void 0 && _annotations$Session.StickySessionSupported ? true : false;
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
    isUpdateHidden: function (entitySet, entityType) {
      var _annotations$UI, _annotations$UI$Updat, _annotations$UI2, _entityType$annotatio;
      if (ModelHelper.isSingleton(entitySet)) {
        return false;
      }
      return (entitySet === null || entitySet === void 0 ? void 0 : (_annotations$UI = entitySet.annotations.UI) === null || _annotations$UI === void 0 ? void 0 : (_annotations$UI$Updat = _annotations$UI.UpdateHidden) === null || _annotations$UI$Updat === void 0 ? void 0 : _annotations$UI$Updat.valueOf()) !== undefined ? entitySet === null || entitySet === void 0 ? void 0 : (_annotations$UI2 = entitySet.annotations.UI) === null || _annotations$UI2 === void 0 ? void 0 : _annotations$UI2.UpdateHidden : entityType === null || entityType === void 0 ? void 0 : (_entityType$annotatio = entityType.annotations.UI) === null || _entityType$annotatio === void 0 ? void 0 : _entityType$annotatio.UpdateHidden;
    },
    /**
     * Method to get draft root.
     *
     * @function
     * @name getDraftRoot
     * @param entitySet EntitySet | Singleton | undefined
     * @returns DraftRoot
     */
    getDraftRoot: function (entitySet) {
      var _annotations$Common3;
      if (ModelHelper.isSingleton(entitySet)) {
        return undefined;
      }
      return entitySet && ((_annotations$Common3 = entitySet.annotations.Common) === null || _annotations$Common3 === void 0 ? void 0 : _annotations$Common3.DraftRoot);
    },
    /**
     * Method to get draft root.
     *
     * @function
     * @name getDraftNode
     * @param entitySet EntitySet | Singleton | undefined
     * @returns DraftRoot
     */
    getDraftNode: function (entitySet) {
      var _annotations$Common4;
      if (ModelHelper.isSingleton(entitySet)) {
        return undefined;
      }
      return entitySet && ((_annotations$Common4 = entitySet.annotations.Common) === null || _annotations$Common4 === void 0 ? void 0 : _annotations$Common4.DraftNode);
    },
    /**
     * Helper method to get sticky session.
     *
     * @function
     * @name getStickySession
     * @param entitySet EntitySet | Singleton | undefined
     * @returns Session StickySessionSupported
     */
    getStickySession: function (entitySet) {
      var _annotations, _annotations$Session2;
      if (ModelHelper.isSingleton(entitySet)) {
        return undefined;
      }
      return entitySet && ((_annotations = entitySet.annotations) === null || _annotations === void 0 ? void 0 : (_annotations$Session2 = _annotations.Session) === null || _annotations$Session2 === void 0 ? void 0 : _annotations$Session2.StickySessionSupported);
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
    getDeleteHidden: function (entitySet, entityType) {
      var _annotations$UI3, _annotations$UI3$Dele, _annotations$UI4, _entityType$annotatio2;
      if (ModelHelper.isSingleton(entitySet)) {
        return false;
      }
      return (entitySet === null || entitySet === void 0 ? void 0 : (_annotations$UI3 = entitySet.annotations.UI) === null || _annotations$UI3 === void 0 ? void 0 : (_annotations$UI3$Dele = _annotations$UI3.DeleteHidden) === null || _annotations$UI3$Dele === void 0 ? void 0 : _annotations$UI3$Dele.valueOf()) !== undefined ? entitySet === null || entitySet === void 0 ? void 0 : (_annotations$UI4 = entitySet.annotations.UI) === null || _annotations$UI4 === void 0 ? void 0 : _annotations$UI4.DeleteHidden : entityType === null || entityType === void 0 ? void 0 : (_entityType$annotatio2 = entityType.annotations.UI) === null || _entityType$annotatio2 === void 0 ? void 0 : _entityType$annotatio2.DeleteHidden;
    }
  };
  return ModelHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUeXBlT2ZFbnRpdHkiLCJNb2RlbEhlbHBlciIsImlzU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsIm9NZXRhTW9kZWwiLCJvRW50aXR5Q29udGFpbmVyIiwiZ2V0T2JqZWN0Iiwic0VudGl0eVNldCIsIiRraW5kIiwiaXNEcmFmdFN1cHBvcnRlZCIsInNQYXRoIiwib01ldGFDb250ZXh0IiwiZ2V0TWV0YUNvbnRleHQiLCJzVGFyZ2V0RW50aXR5U2V0IiwiZ2V0VGFyZ2V0RW50aXR5U2V0Iiwib1BhcmVudEVudGl0eVNldENvbnRleHQiLCJhUGFydHMiLCJnZXRQcm9wZXJ0eSIsIiRDb250YWluc1RhcmdldCIsImdldE1ldGFQYXRoIiwic3BsaXQiLCJmaWx0ZXIiLCJCb29sZWFuIiwibGVuZ3RoIiwiaSIsIm9FbnRpdHlDb250ZXh0IiwiaXNPYmplY3RQYXRoRHJhZnRTdXBwb3J0ZWQiLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwiY3VycmVudEVudGl0eVNldCIsInRhcmdldEVudGl0eVNldCIsImJJc0RyYWZ0Um9vdCIsImlzRHJhZnRSb290IiwiYklzRHJhZnROb2RlIiwiaXNEcmFmdE5vZGUiLCJiSXNEcmFmdFBhcmVudEVudGl0eUZvckNvbnRhaW5tZW50IiwidGFyZ2V0T2JqZWN0IiwiY29udGFpbnNUYXJnZXQiLCJzdGFydGluZ0VudGl0eVNldCIsImFubm90YXRpb25zIiwiQ29tbW9uIiwiRHJhZnRSb290IiwiRHJhZnROb2RlIiwiaXNDb2xsYWJvcmF0aW9uRHJhZnRTdXBwb3J0ZWQiLCJtZXRhT2JqZWN0IiwidGVtcGxhdGVJbnRlcmZhY2UiLCJjb250ZXh0IiwiZ2V0TW9kZWwiLCJnZXREcmFmdFJvb3RQYXRoIiwib0NvbnRleHQiLCJnZXRNZXRhTW9kZWwiLCJnZXRSb290UGF0aCIsIm1vZGVsIiwiZmlyc3RJdGVyYXRpb24iLCJzSXRlcmF0aW9uUGF0aCIsIlJlZ0V4cCIsImV4ZWMiLCJzRW50aXR5UGF0aCIsIm1EYXRhTW9kZWwiLCJNZXRhTW9kZWxDb252ZXJ0ZXIiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJnZXRDb250ZXh0IiwidW5kZWZpbmVkIiwiZ2V0UGF0aCIsInNFbnRpdHlTZXRQYXRoIiwiZ2V0RW50aXR5U2V0UGF0aCIsInBhdGgiLCJtZXRhTW9kZWwiLCJlbnRpdHlTZXRQYXRoIiwiZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmciLCJqb2luIiwicGF0aFBhcnRzIiwiaW5pdGlhbFBhdGhPYmplY3QiLCJncm93aW5nUGF0aCIsInBlbmRpbmdOYXZQcm9wQmluZGluZyIsInBhdGhPYmplY3QiLCJyZWR1Y2UiLCJwYXRoVW5kZXJDb25zdHJ1Y3Rpb24iLCJwYXRoUGFydCIsImlkeCIsImRlbGltaXRlciIsInRlbXBQYXRoIiwibmF2UHJvcEJpbmRpbmdzIiwibmF2UHJvcEJpbmRpbmdUb0NoZWNrIiwiT2JqZWN0Iiwia2V5cyIsImhhc093blByb3BlcnR5IiwicmVwbGFjZSIsImdldEFjdGlvblBhcmFtZXRlckl0ZW1zTW9kZWxQYXRoIiwib1BhcmFtZXRlciIsIiROYW1lIiwic1BhdGhQYXJ0IiwiZW5oYW5jZUludGVybmFsSlNPTk1vZGVsIiwib0ludGVybmFsTW9kZWwiLCJmbkJpbmRDb250ZXh0IiwiYmluZENvbnRleHQiLCJtUGFyYW1ldGVycyIsImFyZ3MiLCJhcHBseSIsImZuR2V0Qm91bmRDb250ZXh0IiwiZ2V0Qm91bmRDb250ZXh0Iiwic3ViQXJncyIsIm9Cb3VuZENvbnRleHQiLCJzZXRQcm9wZXJ0eSIsInNTZXRQcm9wUGF0aCIsInZhbHVlIiwiZW5oYW5jZVVpSlNPTk1vZGVsIiwidWlNb2RlbCIsImxpYnJhcnkiLCJmblNldFByb3BlcnR5IiwiRWRpdE1vZGUiLCJFZGl0YWJsZSIsIkRpc3BsYXkiLCJpc0ZpbHRlcmluZ0Nhc2VTZW5zaXRpdmUiLCJhRmlsdGVyRnVuY3Rpb25zIiwiaW5kZXhPZiIsImdldE1ldGFQYXRoRm9yQ29udGV4dCIsIm9Nb2RlbCIsImdldEFic29sdXRlTWV0YVBhdGhGb3JMaXN0QmluZGluZyIsIm9WaWV3Iiwidkxpc3RCaW5kaW5nIiwic01ldGFQYXRoIiwic3RhcnRzV2l0aCIsIm9CaW5kaW5nQ29udGV4dCIsImdldEJpbmRpbmdDb250ZXh0Iiwic1Jvb3RDb250ZXh0UGF0aCIsIm9CaW5kaW5nIiwib1Jvb3RCaW5kaW5nIiwiZ2V0Um9vdEJpbmRpbmciLCJzUm9vdEJpbmRpbmdQYXRoIiwic1JlbGF0aXZlUGF0aCIsImlzU2luZ2xldG9uIiwiZW50aXR5U2V0IiwiX3R5cGUiLCJUeXBlU2luZ2xldG9uIiwiaXNTdGlja3kiLCJTZXNzaW9uIiwiU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCIsImlzVXBkYXRlSGlkZGVuIiwiZW50aXR5VHlwZSIsIlVJIiwiVXBkYXRlSGlkZGVuIiwidmFsdWVPZiIsImdldERyYWZ0Um9vdCIsImdldERyYWZ0Tm9kZSIsImdldFN0aWNreVNlc3Npb24iLCJnZXREZWxldGVIaWRkZW4iLCJEZWxldGVIaWRkZW4iXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIk1vZGVsSGVscGVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qIFRoaXMgY2xhc3MgY29udGFpbnMgaGVscGVycyB0byBiZSB1c2VkIGF0IHJ1bnRpbWUgdG8gcmV0cmlldmUgZnVydGhlciBpbmZvcm1hdGlvbiBvbiB0aGUgbW9kZWwgKi9cbmltcG9ydCB7IEVudGl0eVNldCwgRW50aXR5VHlwZSwgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWUsIFNpbmdsZXRvbiB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlc1wiO1xuaW1wb3J0IHsgRHJhZnROb2RlLCBEcmFmdFJvb3QgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0NvbW1vblwiO1xuaW1wb3J0IHsgU3RpY2t5U2Vzc2lvblN1cHBvcnRlZCB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvU2Vzc2lvblwiO1xuaW1wb3J0IHsgRGVsZXRlSGlkZGVuIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9VSVwiO1xuaW1wb3J0ICogYXMgTWV0YU1vZGVsQ29udmVydGVyIGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01ldGFNb2RlbENvbnZlcnRlclwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIEJhc2VDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IHR5cGUgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YUxpc3RCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFMaXN0QmluZGluZ1wiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuaW1wb3J0IHsgT0RhdGFNb2RlbEV4LCBWNENvbnRleHQgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5pbXBvcnQgeyBEYXRhTW9kZWxPYmplY3RQYXRoIH0gZnJvbSBcIi4uL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuXG5leHBvcnQgY29uc3QgZW51bSBUeXBlT2ZFbnRpdHkge1xuXHRUeXBlU2luZ2xldG9uID0gXCJTaW5nbGV0b25cIixcblx0VHlwZUVudGl0eSA9IFwiRW50aXR5U2V0XCJcbn1cbmNvbnN0IE1vZGVsSGVscGVyID0ge1xuXHQvKipcblx0ICogTWV0aG9kIHRvIGRldGVybWluZSBpZiB0aGUgcHJvZ3JhbW1pbmcgbW9kZWwgaXMgc3RpY2t5LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNTdGlja3lTZXNzaW9uU3VwcG9ydGVkXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsIE9EYXRhTW9kZWxNZXRhTW9kZWwgdG8gY2hlY2sgZm9yIHN0aWNreSBlbmFibGVkIGVudGl0eVxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgc3RpY2t5LCBlbHNlIGZhbHNlXG5cdCAqL1xuXHRpc1N0aWNreVNlc3Npb25TdXBwb3J0ZWQ6IGZ1bmN0aW9uIChvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCkge1xuXHRcdGNvbnN0IG9FbnRpdHlDb250YWluZXIgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcIi9cIik7XG5cdFx0Zm9yIChjb25zdCBzRW50aXR5U2V0IGluIG9FbnRpdHlDb250YWluZXIpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0b0VudGl0eUNvbnRhaW5lcltzRW50aXR5U2V0XS4ka2luZCA9PT0gXCJFbnRpdHlTZXRcIiAmJlxuXHRcdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7c0VudGl0eVNldH1AY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MS5TdGlja3lTZXNzaW9uU3VwcG9ydGVkYClcblx0XHRcdCkge1xuXHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGV0ZXJtaW5lIGlmIHRoZSBwcm9ncmFtbWluZyBtb2RlbCBpcyBkcmFmdC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzRHJhZnRTdXBwb3J0ZWRcblx0ICogQHBhcmFtIG9NZXRhTW9kZWwgT0RhdGFNb2RlbE1ldGFNb2RlbCBvZiB0aGUgY29udGV4dCBmb3Igd2hpY2ggZHJhZnQgc3VwcG9ydCBzaGFsbCBiZSBjaGVja2VkXG5cdCAqIEBwYXJhbSBzUGF0aCBQYXRoIGZvciB3aGljaCBkcmFmdCBzdXBwb3J0IHNoYWxsIGJlIGNoZWNrZWRcblx0ICogQHJldHVybnMgUmV0dXJucyB0cnVlIGlmIGRyYWZ0LCBlbHNlIGZhbHNlXG5cdCAqL1xuXHRpc0RyYWZ0U3VwcG9ydGVkOiBmdW5jdGlvbiAob01ldGFNb2RlbDogYW55LCBzUGF0aDogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb01ldGFDb250ZXh0ID0gb01ldGFNb2RlbC5nZXRNZXRhQ29udGV4dChzUGF0aCk7XG5cdFx0bGV0IHNUYXJnZXRFbnRpdHlTZXQgPSB0aGlzLmdldFRhcmdldEVudGl0eVNldChvTWV0YUNvbnRleHQpLFxuXHRcdFx0b1BhcmVudEVudGl0eVNldENvbnRleHQsXG5cdFx0XHRhUGFydHM7XG5cblx0XHRpZiAob01ldGFDb250ZXh0LmdldFByb3BlcnR5ICYmIG9NZXRhQ29udGV4dC5nZXRQcm9wZXJ0eSgpICYmIG9NZXRhQ29udGV4dC5nZXRQcm9wZXJ0eSgpLiRDb250YWluc1RhcmdldCA9PT0gdHJ1ZSkge1xuXHRcdFx0YVBhcnRzID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChzUGF0aCkuc3BsaXQoXCIvXCIpLmZpbHRlcihCb29sZWFuKTtcblx0XHRcdGlmIChhUGFydHMubGVuZ3RoKSB7XG5cdFx0XHRcdGZvciAobGV0IGkgPSBhUGFydHMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdFx0XHRvUGFyZW50RW50aXR5U2V0Q29udGV4dCA9IG9NZXRhTW9kZWwuZ2V0TWV0YUNvbnRleHQob01ldGFNb2RlbC5nZXRNZXRhUGF0aChgLyR7YVBhcnRzW2ldfWApKTtcblx0XHRcdFx0XHRpZiAob1BhcmVudEVudGl0eVNldENvbnRleHQuZ2V0T2JqZWN0KFwiJGtpbmRcIikgPT09IFwiRW50aXR5U2V0XCIpIHtcblx0XHRcdFx0XHRcdHNUYXJnZXRFbnRpdHlTZXQgPSB0aGlzLmdldFRhcmdldEVudGl0eVNldChvUGFyZW50RW50aXR5U2V0Q29udGV4dCk7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0c1RhcmdldEVudGl0eVNldCA9IHRoaXMuZ2V0VGFyZ2V0RW50aXR5U2V0KG9NZXRhQ29udGV4dCk7XG5cdFx0fVxuXHRcdGNvbnN0IG9FbnRpdHlDb250ZXh0ID0gb01ldGFNb2RlbC5nZXRNZXRhQ29udGV4dChzVGFyZ2V0RW50aXR5U2V0KTtcblx0XHRpZiAoXG5cdFx0XHRvRW50aXR5Q29udGV4dC5nZXRPYmplY3QoXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdFwiKSB8fFxuXHRcdFx0b0VudGl0eUNvbnRleHQuZ2V0T2JqZWN0KFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVcIilcblx0XHQpIHtcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH1cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBkcmFmdCBpcyBzdXBwb3J0ZWQgZm9yIHRoZSBkYXRhIG1vZGVsIG9iamVjdCBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YU1vZGVsT2JqZWN0UGF0aFxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQgaXMgc3VwcG9ydGVkXG5cdCAqL1xuXHRpc09iamVjdFBhdGhEcmFmdFN1cHBvcnRlZDogZnVuY3Rpb24gKGRhdGFNb2RlbE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgpOiBib29sZWFuIHtcblx0XHRjb25zdCBjdXJyZW50RW50aXR5U2V0ID0gZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRFbnRpdHlTZXQgYXMgRW50aXR5U2V0O1xuXHRcdGNvbnN0IGJJc0RyYWZ0Um9vdCA9IE1vZGVsSGVscGVyLmlzRHJhZnRSb290KGN1cnJlbnRFbnRpdHlTZXQpO1xuXHRcdGNvbnN0IGJJc0RyYWZ0Tm9kZSA9IE1vZGVsSGVscGVyLmlzRHJhZnROb2RlKGN1cnJlbnRFbnRpdHlTZXQpO1xuXHRcdGNvbnN0IGJJc0RyYWZ0UGFyZW50RW50aXR5Rm9yQ29udGFpbm1lbnQgPVxuXHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aC50YXJnZXRPYmplY3Q/LmNvbnRhaW5zVGFyZ2V0ICYmXG5cdFx0XHQoKGRhdGFNb2RlbE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnM/LkNvbW1vbj8uRHJhZnRSb290IHx8XG5cdFx0XHRcdChkYXRhTW9kZWxPYmplY3RQYXRoLnN0YXJ0aW5nRW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zPy5Db21tb24/LkRyYWZ0Tm9kZSlcblx0XHRcdFx0PyB0cnVlXG5cdFx0XHRcdDogZmFsc2U7XG5cblx0XHRyZXR1cm4gYklzRHJhZnRSb290IHx8IGJJc0RyYWZ0Tm9kZSB8fCAoIWN1cnJlbnRFbnRpdHlTZXQgJiYgYklzRHJhZnRQYXJlbnRFbnRpdHlGb3JDb250YWlubWVudCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgaWYgdGhlIHNlcnZpY2UsIHN1cHBvcnRzIGNvbGxhYm9yYXRpb24gZHJhZnQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZFxuXHQgKiBAcGFyYW0gbWV0YU9iamVjdCBNZXRhT2JqZWN0IHRvIGJlIHVzZWQgZm9yIGRldGVybWluYXRpb25cblx0ICogQHBhcmFtIHRlbXBsYXRlSW50ZXJmYWNlIEFQSSBwcm92aWRlZCBieSBVSTUgdGVtcGxhdGluZyBpZiB1c2VkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgdHJ1ZSBpZiB0aGUgc2VydmljZSBzdXBwb3J0cyBjb2xsYWJvcmF0aW9uIGRyYWZ0LCBlbHNlIGZhbHNlXG5cdCAqL1xuXHRpc0NvbGxhYm9yYXRpb25EcmFmdFN1cHBvcnRlZDogZnVuY3Rpb24gKG1ldGFPYmplY3Q6IGFueSwgdGVtcGxhdGVJbnRlcmZhY2U/OiBhbnkpIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gKHRlbXBsYXRlSW50ZXJmYWNlPy5jb250ZXh0Py5nZXRNb2RlbCgpIHx8IG1ldGFPYmplY3QpIGFzIE9EYXRhTWV0YU1vZGVsO1xuXHRcdGNvbnN0IG9FbnRpdHlDb250YWluZXIgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcIi9cIik7XG5cdFx0Zm9yIChjb25zdCBzRW50aXR5U2V0IGluIG9FbnRpdHlDb250YWluZXIpIHtcblx0XHRcdGlmIChcblx0XHRcdFx0b0VudGl0eUNvbnRhaW5lcltzRW50aXR5U2V0XS4ka2luZCA9PT0gXCJFbnRpdHlTZXRcIiAmJlxuXHRcdFx0XHRvTWV0YU1vZGVsLmdldE9iamVjdChgLyR7c0VudGl0eVNldH1AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdC9TaGFyZUFjdGlvbmApXG5cdFx0XHQpIHtcblx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBmYWxzZTtcblx0fSxcblxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCB0aGUgcGF0aCBvZiB0aGUgRHJhZnRSb290IHBhdGggYWNjb3JkaW5nIHRvIHRoZSBwcm92aWRlZCBjb250ZXh0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0RHJhZnRSb290UGF0aFxuXHQgKiBAcGFyYW0gb0NvbnRleHQgT2RhdGFNb2RlbCBjb250ZXh0XG5cdCAqIEByZXR1cm5zIFJldHVybnMgdGhlIHBhdGggb2YgdGhlIGRyYWZ0Um9vdCBlbnRpdHksIG9yIHVuZGVmaW5lZCBpZiBubyBkcmFmdFJvb3QgaXMgZm91bmRcblx0ICovXG5cdGdldERyYWZ0Um9vdFBhdGg6IGZ1bmN0aW9uIChvQ29udGV4dDogVjRDb250ZXh0KTogc3RyaW5nIHwgdW5kZWZpbmVkIHtcblx0XHRjb25zdCBvTWV0YU1vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKTtcblx0XHRjb25zdCBnZXRSb290UGF0aCA9IGZ1bmN0aW9uIChzUGF0aDogc3RyaW5nLCBtb2RlbDogT0RhdGFNb2RlbEV4LCBmaXJzdEl0ZXJhdGlvbiA9IHRydWUpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuXHRcdFx0Y29uc3Qgc0l0ZXJhdGlvblBhdGggPSBmaXJzdEl0ZXJhdGlvbiA/IHNQYXRoIDogbmV3IFJlZ0V4cCgvLiooPz1cXC8pLykuZXhlYyhzUGF0aCk/LlswXTsgLy8gKlJlZ2V4IHRvIGdldCB0aGUgYW5jZXN0b3Jcblx0XHRcdGlmIChzSXRlcmF0aW9uUGF0aCAmJiBzSXRlcmF0aW9uUGF0aCAhPT0gXCIvXCIpIHtcblx0XHRcdFx0Y29uc3Qgc0VudGl0eVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNJdGVyYXRpb25QYXRoKTtcblx0XHRcdFx0Y29uc3QgbURhdGFNb2RlbCA9IE1ldGFNb2RlbENvbnZlcnRlci5nZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob01ldGFNb2RlbC5nZXRDb250ZXh0KHNFbnRpdHlQYXRoKSk7XG5cdFx0XHRcdGlmICgobURhdGFNb2RlbC50YXJnZXRFbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdFJvb3QpIHtcblx0XHRcdFx0XHRyZXR1cm4gc0l0ZXJhdGlvblBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGdldFJvb3RQYXRoKHNJdGVyYXRpb25QYXRoLCBtb2RlbCwgZmFsc2UpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9O1xuXHRcdHJldHVybiBnZXRSb290UGF0aChvQ29udGV4dC5nZXRQYXRoKCksIG9Db250ZXh0LmdldE1vZGVsKCkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHBhdGggdG8gdGhlIHRhcmdldCBlbnRpdHkgc2V0IHZpYSB1c2luZyBuYXZpZ2F0aW9uIHByb3BlcnR5IGJpbmRpbmcuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRUYXJnZXRFbnRpdHlTZXRcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgZm9yIHdoaWNoIHRoZSB0YXJnZXQgZW50aXR5IHNldCBzaGFsbCBiZSBkZXRlcm1pbmVkXG5cdCAqIEByZXR1cm5zIFJldHVybnMgcGF0aCB0byB0aGUgdGFyZ2V0IGVudGl0eSBzZXRcblx0ICovXG5cdGdldFRhcmdldEVudGl0eVNldDogZnVuY3Rpb24gKG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3Qgc1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0aWYgKFxuXHRcdFx0b0NvbnRleHQuZ2V0T2JqZWN0KFwiJGtpbmRcIikgPT09IFwiRW50aXR5U2V0XCIgfHxcblx0XHRcdG9Db250ZXh0LmdldE9iamVjdChcIiRraW5kXCIpID09PSBcIkFjdGlvblwiIHx8XG5cdFx0XHRvQ29udGV4dC5nZXRPYmplY3QoXCIwLyRraW5kXCIpID09PSBcIkFjdGlvblwiXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gc1BhdGg7XG5cdFx0fVxuXHRcdGNvbnN0IHNFbnRpdHlTZXRQYXRoID0gTW9kZWxIZWxwZXIuZ2V0RW50aXR5U2V0UGF0aChzUGF0aCk7XG5cdFx0cmV0dXJuIGAvJHtvQ29udGV4dC5nZXRPYmplY3Qoc0VudGl0eVNldFBhdGgpfWA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgY29tcGxldGUgcGF0aCB0byB0aGUgZW50aXR5IHNldCB2aWEgdXNpbmcgbmF2aWdhdGlvbiBwcm9wZXJ0eSBiaW5kaW5nLiBOb3RlOiBUbyBiZSB1c2VkIG9ubHkgYWZ0ZXIgdGhlIG1ldGFtb2RlbCBoYXMgbG9hZGVkLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0RW50aXR5U2V0UGF0aFxuXHQgKiBAcGFyYW0gcGF0aCBQYXRoIGZvciB3aGljaCBjb21wbGV0ZSBlbnRpdHlTZXQgcGF0aCBuZWVkcyB0byBiZSBkZXRlcm1pbmVkIGZyb20gZW50aXR5VHlwZSBwYXRoXG5cdCAqIEBwYXJhbSBtZXRhTW9kZWwgTWV0YW1vZGVsIHRvIGJlIHVzZWQuKE9wdGlvbmFsIGluIG5vcm1hbCBzY2VuYXJpb3MsIGJ1dCBuZWVkZWQgZm9yIHBhcmFtZXRlcml6ZWQgc2VydmljZSBzY2VuYXJpb3MpXG5cdCAqIEByZXR1cm5zIFJldHVybnMgY29tcGxldGUgcGF0aCB0byB0aGUgZW50aXR5IHNldFxuXHQgKi9cblx0Z2V0RW50aXR5U2V0UGF0aDogZnVuY3Rpb24gKHBhdGg6IHN0cmluZywgbWV0YU1vZGVsPzogT0RhdGFNZXRhTW9kZWwpIHtcblx0XHRsZXQgZW50aXR5U2V0UGF0aDogc3RyaW5nID0gXCJcIjtcblx0XHRpZiAoIW1ldGFNb2RlbCkge1xuXHRcdFx0Ly8gUHJldmlvdXMgaW1wbGVtZW50YXRpb24gZm9yIGdldHRpbmcgZW50aXR5U2V0UGF0aCBmcm9tIGVudGl0eVR5cGVQYXRoXG5cdFx0XHRlbnRpdHlTZXRQYXRoID0gYC8ke3BhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihNb2RlbEhlbHBlci5maWx0ZXJPdXROYXZQcm9wQmluZGluZykuam9pbihcIi8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZy9cIil9YDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gQ2FsY3VsYXRpbmcgdGhlIGVudGl0eVNldFBhdGggZnJvbSBNZXRhTW9kZWwuXG5cdFx0XHRjb25zdCBwYXRoUGFydHMgPSBwYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoTW9kZWxIZWxwZXIuZmlsdGVyT3V0TmF2UHJvcEJpbmRpbmcpO1xuXHRcdFx0aWYgKHBhdGhQYXJ0cy5sZW5ndGggPiAxKSB7XG5cdFx0XHRcdGNvbnN0IGluaXRpYWxQYXRoT2JqZWN0ID0ge1xuXHRcdFx0XHRcdGdyb3dpbmdQYXRoOiBcIi9cIixcblx0XHRcdFx0XHRwZW5kaW5nTmF2UHJvcEJpbmRpbmc6IFwiXCJcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRjb25zdCBwYXRoT2JqZWN0ID0gcGF0aFBhcnRzLnJlZHVjZSgocGF0aFVuZGVyQ29uc3RydWN0aW9uOiBhbnksIHBhdGhQYXJ0OiBzdHJpbmcsIGlkeDogbnVtYmVyKSA9PiB7XG5cdFx0XHRcdFx0Y29uc3QgZGVsaW1pdGVyID0gKCEhaWR4ICYmIFwiLyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nL1wiKSB8fCBcIlwiO1xuXHRcdFx0XHRcdGxldCB7IGdyb3dpbmdQYXRoLCBwZW5kaW5nTmF2UHJvcEJpbmRpbmcgfSA9IHBhdGhVbmRlckNvbnN0cnVjdGlvbjtcblx0XHRcdFx0XHRjb25zdCB0ZW1wUGF0aCA9IGdyb3dpbmdQYXRoICsgZGVsaW1pdGVyO1xuXHRcdFx0XHRcdGNvbnN0IG5hdlByb3BCaW5kaW5ncyA9IG1ldGFNb2RlbC5nZXRPYmplY3QodGVtcFBhdGgpO1xuXHRcdFx0XHRcdGNvbnN0IG5hdlByb3BCaW5kaW5nVG9DaGVjayA9IHBlbmRpbmdOYXZQcm9wQmluZGluZyA/IGAke3BlbmRpbmdOYXZQcm9wQmluZGluZ30vJHtwYXRoUGFydH1gIDogcGF0aFBhcnQ7XG5cdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0bmF2UHJvcEJpbmRpbmdzICYmXG5cdFx0XHRcdFx0XHRPYmplY3Qua2V5cyhuYXZQcm9wQmluZGluZ3MpLmxlbmd0aCA+IDAgJiZcblx0XHRcdFx0XHRcdG5hdlByb3BCaW5kaW5ncy5oYXNPd25Qcm9wZXJ0eShuYXZQcm9wQmluZGluZ1RvQ2hlY2spXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRncm93aW5nUGF0aCA9IHRlbXBQYXRoICsgbmF2UHJvcEJpbmRpbmdUb0NoZWNrLnJlcGxhY2UoXCIvXCIsIFwiJTJGXCIpO1xuXHRcdFx0XHRcdFx0cGVuZGluZ05hdlByb3BCaW5kaW5nID0gXCJcIjtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cGVuZGluZ05hdlByb3BCaW5kaW5nICs9IHBlbmRpbmdOYXZQcm9wQmluZGluZyA/IGAvJHtwYXRoUGFydH1gIDogcGF0aFBhcnQ7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiB7IGdyb3dpbmdQYXRoLCBwZW5kaW5nTmF2UHJvcEJpbmRpbmcgfTtcblx0XHRcdFx0fSwgaW5pdGlhbFBhdGhPYmplY3QgYXMgYW55KTtcblxuXHRcdFx0XHRlbnRpdHlTZXRQYXRoID0gcGF0aE9iamVjdC5ncm93aW5nUGF0aDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGVudGl0eVNldFBhdGggPSBgLyR7cGF0aFBhcnRzWzBdfWA7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGVudGl0eVNldFBhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIHBhdGggZm9yIHRoZSBpdGVtcyBwcm9wZXJ0eSBvZiBNdWx0aVZhbHVlRmllbGQgcGFyYW1ldGVycy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldEFjdGlvblBhcmFtZXRlckl0ZW1zTW9kZWxQYXRoXG5cdCAqIEBwYXJhbSBvUGFyYW1ldGVyIEFjdGlvbiBQYXJhbWV0ZXJcblx0ICogQHJldHVybnMgUmV0dXJucyB0aGUgY29tcGxldGUgbW9kZWwgcGF0aCBmb3IgdGhlIGl0ZW1zIHByb3BlcnR5IG9mIE11bHRpVmFsdWVGaWVsZCBwYXJhbWV0ZXJzXG5cdCAqL1xuXHRnZXRBY3Rpb25QYXJhbWV0ZXJJdGVtc01vZGVsUGF0aDogZnVuY3Rpb24gKG9QYXJhbWV0ZXI6IGFueSkge1xuXHRcdHJldHVybiBvUGFyYW1ldGVyICYmIG9QYXJhbWV0ZXIuJE5hbWUgPyBge3BhdGg6ICdtdmZ2aWV3Pi8ke29QYXJhbWV0ZXIuJE5hbWV9J31gIDogdW5kZWZpbmVkO1xuXHR9LFxuXG5cdGZpbHRlck91dE5hdlByb3BCaW5kaW5nOiBmdW5jdGlvbiAoc1BhdGhQYXJ0OiBhbnkpIHtcblx0XHRyZXR1cm4gc1BhdGhQYXJ0ICE9PSBcIlwiICYmIHNQYXRoUGFydCAhPT0gXCIkTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgc2V0UHJvcGVydHkgdG8gdGhlIGNyZWF0ZWQgYmluZGluZyBjb250ZXh0cyBvZiB0aGUgaW50ZXJuYWwgSlNPTiBtb2RlbC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGVuaGFuY2VJbnRlcm5hbEpTT05Nb2RlbFxuXHQgKiBAcGFyYW0ge3NhcC51aS5tb2RlbC5qc29uLkpTT05Nb2RlbH0gSW50ZXJuYWwgSlNPTiBNb2RlbCB3aGljaCBpcyBlbmhhbmNlZFxuXHQgKi9cblxuXHRlbmhhbmNlSW50ZXJuYWxKU09OTW9kZWw6IGZ1bmN0aW9uIChvSW50ZXJuYWxNb2RlbDogYW55KSB7XG5cdFx0Y29uc3QgZm5CaW5kQ29udGV4dCA9IG9JbnRlcm5hbE1vZGVsLmJpbmRDb250ZXh0O1xuXHRcdG9JbnRlcm5hbE1vZGVsLmJpbmRDb250ZXh0ID0gZnVuY3Rpb24gKHNQYXRoOiBhbnksIG9Db250ZXh0OiBhbnksIG1QYXJhbWV0ZXJzOiBhbnksIC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0XHRvQ29udGV4dCA9IGZuQmluZENvbnRleHQuYXBwbHkodGhpcywgW3NQYXRoLCBvQ29udGV4dCwgbVBhcmFtZXRlcnMsIC4uLmFyZ3NdKTtcblx0XHRcdGNvbnN0IGZuR2V0Qm91bmRDb250ZXh0ID0gb0NvbnRleHQuZ2V0Qm91bmRDb250ZXh0O1xuXG5cdFx0XHRvQ29udGV4dC5nZXRCb3VuZENvbnRleHQgPSBmdW5jdGlvbiAoLi4uc3ViQXJnczogYW55W10pIHtcblx0XHRcdFx0Y29uc3Qgb0JvdW5kQ29udGV4dCA9IGZuR2V0Qm91bmRDb250ZXh0LmFwcGx5KHRoaXMsIC4uLnN1YkFyZ3MpO1xuXHRcdFx0XHRpZiAob0JvdW5kQ29udGV4dCAmJiAhb0JvdW5kQ29udGV4dC5zZXRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdG9Cb3VuZENvbnRleHQuc2V0UHJvcGVydHkgPSBmdW5jdGlvbiAoc1NldFByb3BQYXRoOiBhbnksIHZhbHVlOiBhbnkpIHtcblx0XHRcdFx0XHRcdGlmICh0aGlzLmdldE9iamVjdCgpID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0Ly8gaW5pdGlhbGl6ZVxuXHRcdFx0XHRcdFx0XHR0aGlzLmdldE1vZGVsKCkuc2V0UHJvcGVydHkodGhpcy5nZXRQYXRoKCksIHt9KTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHRoaXMuZ2V0TW9kZWwoKS5zZXRQcm9wZXJ0eShzU2V0UHJvcFBhdGgsIHZhbHVlLCB0aGlzKTtcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBvQm91bmRDb250ZXh0O1xuXHRcdFx0fTtcblx0XHRcdHJldHVybiBvQ29udGV4dDtcblx0XHR9O1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBBZGRzIGFuIGhhbmRsZXIgb24gcHJvcGVydHlDaGFuZ2UuXG5cdCAqIFRoZSBwcm9wZXJ0eSBcIi9lZGl0TW9kZVwiIGlzIGNoYW5nZWQgYWNjb3JkaW5nIHRvIHByb3BlcnR5ICcvaXNFZGl0YWJsZScgd2hlbiB0aGlzIGxhc3Qgb25lIGlzIHNldFxuXHQgKiBpbiBvcmRlciB0byBiZSBjb21wbGlhbnQgd2l0aCBmb3JtZXIgdmVyc2lvbnMgd2hlcmUgYnVpbGRpbmcgYmxvY2tzIHVzZSB0aGUgcHJvcGVydHkgXCIvZWRpdE1vZGVcIlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZW5oYW5jZVVpSlNPTk1vZGVsXG5cdCAqIEBwYXJhbSB7c2FwLnVpLm1vZGVsLmpzb24uSlNPTk1vZGVsfSB1aU1vZGVsIEpTT04gTW9kZWwgd2hpY2ggaXMgZW5oYW5jZWRcblx0ICogQHBhcmFtIHtvYmplY3R9IGxpYnJhcnkgQ29yZSBsaWJyYXJ5IG9mIFNBUCBGaW9yaSBlbGVtZW50c1xuXHQgKi9cblxuXHRlbmhhbmNlVWlKU09OTW9kZWw6IGZ1bmN0aW9uICh1aU1vZGVsOiBKU09OTW9kZWwsIGxpYnJhcnk6IGFueSkge1xuXHRcdGNvbnN0IGZuU2V0UHJvcGVydHkgPSB1aU1vZGVsLnNldFByb3BlcnR5IGFzIGFueTtcblx0XHR1aU1vZGVsLnNldFByb3BlcnR5ID0gZnVuY3Rpb24gKC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0XHRjb25zdCB2YWx1ZSA9IGFyZ3NbMV07XG5cdFx0XHRpZiAoYXJnc1swXSA9PT0gXCIvaXNFZGl0YWJsZVwiKSB7XG5cdFx0XHRcdHVpTW9kZWwuc2V0UHJvcGVydHkoXCIvZWRpdE1vZGVcIiwgdmFsdWUgPyBsaWJyYXJ5LkVkaXRNb2RlLkVkaXRhYmxlIDogbGlicmFyeS5FZGl0TW9kZS5EaXNwbGF5LCBhcmdzWzJdLCBhcmdzWzNdKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmblNldFByb3BlcnR5LmFwcGx5KHRoaXMsIFsuLi5hcmdzXSk7XG5cdFx0fTtcblx0fSxcblx0LyoqXG5cdCAqIFJldHVybnMgd2hldGhlciBmaWx0ZXJpbmcgb24gdGhlIHRhYmxlIGlzIGNhc2Ugc2Vuc2l0aXZlLlxuXHQgKlxuXHQgKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgaW5zdGFuY2Ugb2YgdGhlIG1ldGEgbW9kZWxcblx0ICogQHJldHVybnMgUmV0dXJucyAnZmFsc2UnIGlmIEZpbHRlckZ1bmN0aW9ucyBhbm5vdGF0aW9uIHN1cHBvcnRzICd0b2xvd2VyJywgZWxzZSAndHJ1ZSdcblx0ICovXG5cdGlzRmlsdGVyaW5nQ2FzZVNlbnNpdGl2ZTogZnVuY3Rpb24gKG9NZXRhTW9kZWw6IGFueSkge1xuXHRcdGlmICghb01ldGFNb2RlbCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0Y29uc3QgYUZpbHRlckZ1bmN0aW9ucyA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFwiL0BPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlckZ1bmN0aW9uc1wiKTtcblx0XHQvLyBHZXQgZmlsdGVyIGZ1bmN0aW9ucyBkZWZpbmVkIGF0IEVudGl0eUNvbnRhaW5lciBhbmQgY2hlY2sgZm9yIGV4aXN0ZW5jZSBvZiAndG9sb3dlcidcblx0XHRyZXR1cm4gYUZpbHRlckZ1bmN0aW9ucyA/IGFGaWx0ZXJGdW5jdGlvbnMuaW5kZXhPZihcInRvbG93ZXJcIikgPT09IC0xIDogdHJ1ZTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IE1ldGFQYXRoIGZvciB0aGUgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gYmUgdXNlZFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIG1ldGEgcGF0aCBmb3IgdGhlIGNvbnRleHQuXG5cdCAqL1xuXHRnZXRNZXRhUGF0aEZvckNvbnRleHQ6IGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0NvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdG9NZXRhTW9kZWwgPSBvTW9kZWwuZ2V0TWV0YU1vZGVsKCksXG5cdFx0XHRzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRyZXR1cm4gb01ldGFNb2RlbCAmJiBzUGF0aCAmJiBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKTtcblx0fSxcblxuXHQvKipcblx0ICogR2V0IE1ldGFQYXRoIGZvciB0aGUgbGlzdGJpbmRpbmcuXG5cdCAqXG5cdCAqIEBwYXJhbSBvVmlldyBWaWV3IG9mIHRoZSBjb250cm9sIHVzaW5nIGxpc3RCaW5kaW5nXG5cdCAqIEBwYXJhbSB2TGlzdEJpbmRpbmcgT0RhdGFMaXN0QmluZGluZyBvYmplY3Qgb3IgdGhlIGJpbmRpbmcgcGF0aCBmb3IgYSB0ZW1wb3JhcnkgbGlzdCBiaW5kaW5nXG5cdCAqIEByZXR1cm5zIFJldHVybnMgbWV0YSBwYXRoIGZvciB0aGUgbGlzdGJpbmRpbmcuXG5cdCAqL1xuXHRnZXRBYnNvbHV0ZU1ldGFQYXRoRm9yTGlzdEJpbmRpbmc6IGZ1bmN0aW9uIChvVmlldzogVmlldywgdkxpc3RCaW5kaW5nOiBPRGF0YUxpc3RCaW5kaW5nIHwgc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9WaWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWw7XG5cdFx0bGV0IHNNZXRhUGF0aDtcblxuXHRcdGlmICh0eXBlb2Ygdkxpc3RCaW5kaW5nID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRpZiAodkxpc3RCaW5kaW5nLnN0YXJ0c1dpdGgoXCIvXCIpKSB7XG5cdFx0XHRcdC8vIGFic29sdXRlIHBhdGhcblx0XHRcdFx0c01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aCh2TGlzdEJpbmRpbmcpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gcmVsYXRpdmUgcGF0aFxuXHRcdFx0XHRjb25zdCBvQmluZGluZ0NvbnRleHQgPSBvVmlldy5nZXRCaW5kaW5nQ29udGV4dCgpO1xuXHRcdFx0XHRjb25zdCBzUm9vdENvbnRleHRQYXRoID0gb0JpbmRpbmdDb250ZXh0IS5nZXRQYXRoKCk7XG5cdFx0XHRcdHNNZXRhUGF0aCA9IG9NZXRhTW9kZWwuZ2V0TWV0YVBhdGgoYCR7c1Jvb3RDb250ZXh0UGF0aH0vJHt2TGlzdEJpbmRpbmd9YCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHdlIGFscmVhZHkgZ2V0IGEgbGlzdCBiaW5kaW5nIHVzZSB0aGlzIG9uZVxuXHRcdFx0Y29uc3Qgb0JpbmRpbmcgPSB2TGlzdEJpbmRpbmc7XG5cdFx0XHRjb25zdCBvUm9vdEJpbmRpbmcgPSBvQmluZGluZy5nZXRSb290QmluZGluZygpO1xuXHRcdFx0aWYgKG9CaW5kaW5nID09PSBvUm9vdEJpbmRpbmcpIHtcblx0XHRcdFx0Ly8gYWJzb2x1dGUgcGF0aFxuXHRcdFx0XHRzTWV0YVBhdGggPSBvTWV0YU1vZGVsLmdldE1ldGFQYXRoKG9CaW5kaW5nLmdldFBhdGgoKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQvLyByZWxhdGl2ZSBwYXRoXG5cdFx0XHRcdGNvbnN0IHNSb290QmluZGluZ1BhdGggPSBvUm9vdEJpbmRpbmchLmdldFBhdGgoKTtcblx0XHRcdFx0Y29uc3Qgc1JlbGF0aXZlUGF0aCA9IG9CaW5kaW5nLmdldFBhdGgoKTtcblx0XHRcdFx0c01ldGFQYXRoID0gb01ldGFNb2RlbC5nZXRNZXRhUGF0aChgJHtzUm9vdEJpbmRpbmdQYXRofS8ke3NSZWxhdGl2ZVBhdGh9YCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBzTWV0YVBhdGg7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgaWYgdGhlIGRyYWZ0IHJvb3QgaXMgc3VwcG9ydGVkIG9yIG5vdC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzU2luZ2xldG9uXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgZW50aXR5IHR5cGUgaXMgc2luZ2xldG9uXG5cdCAqL1xuXHRpc1NpbmdsZXRvbjogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkKTogYm9vbGVhbiB7XG5cdFx0aWYgKGVudGl0eVNldD8uX3R5cGUgPT09IFR5cGVPZkVudGl0eS5UeXBlU2luZ2xldG9uKSB7XG5cdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHR9XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGRldGVybWluZSBpZiB0aGUgZHJhZnQgcm9vdCBpcyBzdXBwb3J0ZWQgb3Igbm90LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNEcmFmdFJvb3Rcblx0ICogQHBhcmFtIGVudGl0eVNldCBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWRcblx0ICogQHJldHVybnMgVHJ1ZSBpZiBkcmFmdCByb290IGlzIHByZXNlbnRcblx0ICovXG5cdGlzRHJhZnRSb290OiBmdW5jdGlvbiAoZW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWQpOiBib29sZWFuIHtcblx0XHRpZiAoTW9kZWxIZWxwZXIuaXNTaW5nbGV0b24oZW50aXR5U2V0KSkge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0XHRyZXR1cm4gZW50aXR5U2V0ICYmIChlbnRpdHlTZXQgYXMgRW50aXR5U2V0KS5hbm5vdGF0aW9ucy5Db21tb24/LkRyYWZ0Um9vdCA/IHRydWUgOiBmYWxzZTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgaWYgdGhlIGRyYWZ0IHJvb3QgaXMgc3VwcG9ydGVkIG9yIG5vdC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGlzRHJhZnROb2RlXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgZHJhZnQgcm9vdCBpcyBwcmVzZW50XG5cdCAqL1xuXHRpc0RyYWZ0Tm9kZTogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkKTogYm9vbGVhbiB7XG5cdFx0aWYgKE1vZGVsSGVscGVyLmlzU2luZ2xldG9uKGVudGl0eVNldCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIGVudGl0eVNldCAmJiAoZW50aXR5U2V0IGFzIEVudGl0eVNldCkuYW5ub3RhdGlvbnMuQ29tbW9uPy5EcmFmdE5vZGUgPyB0cnVlIDogZmFsc2U7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGV0ZXJtaW5lIGlmIHRoZSBkcmFmdCByb290IGlzIHN1cHBvcnRlZCBvciBub3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBpc1N0aWNreVxuXHQgKiBAcGFyYW0gZW50aXR5U2V0IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZFxuXHQgKiBAcmV0dXJucyBUcnVlIGlmIHN0aWNreSBpcyBzdXBwb3J0ZWQgZWxzZSBmYWxzZVxuXHQgKi9cblx0aXNTdGlja3k6IGZ1bmN0aW9uIChlbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCk6IGJvb2xlYW4ge1xuXHRcdGlmIChNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihlbnRpdHlTZXQpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiBlbnRpdHlTZXQgJiYgKGVudGl0eVNldCBhcyBFbnRpdHlTZXQpLmFubm90YXRpb25zLlNlc3Npb24/LlN0aWNreVNlc3Npb25TdXBwb3J0ZWQgPyB0cnVlIDogZmFsc2U7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZGV0ZXJtaW5lIGlmIGVudGl0eSBpcyB1cGRhdGFibGUgb3Igbm90LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNVcGRhdGVIaWRkZW5cblx0ICogQHBhcmFtIGVudGl0eVNldCBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWRcblx0ICogQHBhcmFtIGVudGl0eVR5cGUgRW50aXR5VHlwZVxuXHQgKiBAcmV0dXJucyBUcnVlIGlmIHVwZGF0YWJsZSBlbHNlIGZhbHNlXG5cdCAqL1xuXHRpc1VwZGF0ZUhpZGRlbjogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkLCBlbnRpdHlUeXBlOiBFbnRpdHlUeXBlKTogUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8Ym9vbGVhbj4ge1xuXHRcdGlmIChNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihlbnRpdHlTZXQpKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiAoXG5cdFx0XHQoZW50aXR5U2V0IGFzIEVudGl0eVNldCk/LmFubm90YXRpb25zLlVJPy5VcGRhdGVIaWRkZW4/LnZhbHVlT2YoKSAhPT0gdW5kZWZpbmVkXG5cdFx0XHRcdD8gKGVudGl0eVNldCBhcyBFbnRpdHlTZXQpPy5hbm5vdGF0aW9ucy5VST8uVXBkYXRlSGlkZGVuXG5cdFx0XHRcdDogZW50aXR5VHlwZT8uYW5ub3RhdGlvbnMuVUk/LlVwZGF0ZUhpZGRlblxuXHRcdCkgYXMgUHJvcGVydHlBbm5vdGF0aW9uVmFsdWU8Ym9vbGVhbj47XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZ2V0IGRyYWZ0IHJvb3QuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXREcmFmdFJvb3Rcblx0ICogQHBhcmFtIGVudGl0eVNldCBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWRcblx0ICogQHJldHVybnMgRHJhZnRSb290XG5cdCAqL1xuXHRnZXREcmFmdFJvb3Q6IGZ1bmN0aW9uIChlbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCk6IERyYWZ0Um9vdCB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKE1vZGVsSGVscGVyLmlzU2luZ2xldG9uKGVudGl0eVNldCkpIHtcblx0XHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdFx0fVxuXHRcdHJldHVybiBlbnRpdHlTZXQgJiYgKGVudGl0eVNldCBhcyBFbnRpdHlTZXQpLmFubm90YXRpb25zLkNvbW1vbj8uRHJhZnRSb290O1xuXHR9LFxuXHQvKipcblx0ICogTWV0aG9kIHRvIGdldCBkcmFmdCByb290LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0RHJhZnROb2RlXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkXG5cdCAqIEByZXR1cm5zIERyYWZ0Um9vdFxuXHQgKi9cblx0Z2V0RHJhZnROb2RlOiBmdW5jdGlvbiAoZW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWQpOiBEcmFmdE5vZGUgfCB1bmRlZmluZWQge1xuXHRcdGlmIChNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihlbnRpdHlTZXQpKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRyZXR1cm4gZW50aXR5U2V0ICYmIChlbnRpdHlTZXQgYXMgRW50aXR5U2V0KS5hbm5vdGF0aW9ucy5Db21tb24/LkRyYWZ0Tm9kZTtcblx0fSxcblx0LyoqXG5cdCAqIEhlbHBlciBtZXRob2QgdG8gZ2V0IHN0aWNreSBzZXNzaW9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgZ2V0U3RpY2t5U2Vzc2lvblxuXHQgKiBAcGFyYW0gZW50aXR5U2V0IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZFxuXHQgKiBAcmV0dXJucyBTZXNzaW9uIFN0aWNreVNlc3Npb25TdXBwb3J0ZWRcblx0ICovXG5cdGdldFN0aWNreVNlc3Npb246IGZ1bmN0aW9uIChlbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCk6IFN0aWNreVNlc3Npb25TdXBwb3J0ZWQgfCB1bmRlZmluZWQge1xuXHRcdGlmIChNb2RlbEhlbHBlci5pc1NpbmdsZXRvbihlbnRpdHlTZXQpKSB7XG5cdFx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHRcdH1cblx0XHRyZXR1cm4gZW50aXR5U2V0ICYmIChlbnRpdHlTZXQgYXMgRW50aXR5U2V0KS5hbm5vdGF0aW9ucz8uU2Vzc2lvbj8uU3RpY2t5U2Vzc2lvblN1cHBvcnRlZDtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgdGhlIHZpc2liaWxpdHkgc3RhdGUgb2YgZGVsZXRlIGJ1dHRvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldERlbGV0ZUhpZGRlblxuXHQgKiBAcGFyYW0gZW50aXR5U2V0IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZFxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZSBFbnRpdHlUeXBlXG5cdCAqIEByZXR1cm5zIFRydWUgaWYgZGVsZXRlIGJ1dHRvbiBpcyBoaWRkZW5cblx0ICovXG5cdGdldERlbGV0ZUhpZGRlbjogZnVuY3Rpb24gKGVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkLCBlbnRpdHlUeXBlOiBFbnRpdHlUeXBlKTogRGVsZXRlSGlkZGVuIHwgQm9vbGVhbiB8IHVuZGVmaW5lZCB7XG5cdFx0aWYgKE1vZGVsSGVscGVyLmlzU2luZ2xldG9uKGVudGl0eVNldCkpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cdFx0cmV0dXJuIChlbnRpdHlTZXQgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnMuVUk/LkRlbGV0ZUhpZGRlbj8udmFsdWVPZigpICE9PSB1bmRlZmluZWRcblx0XHRcdD8gKGVudGl0eVNldCBhcyBFbnRpdHlTZXQpPy5hbm5vdGF0aW9ucy5VST8uRGVsZXRlSGlkZGVuXG5cdFx0XHQ6IGVudGl0eVR5cGU/LmFubm90YXRpb25zLlVJPy5EZWxldGVIaWRkZW47XG5cdH1cbn07XG5cbmV4cG9ydCB0eXBlIEludGVybmFsTW9kZWxDb250ZXh0ID0gQmFzZUNvbnRleHQgJiB7XG5cdHNldFByb3BlcnR5KHNQYXRoOiBzdHJpbmcsIHZWYWx1ZTogYW55KTogdm9pZDtcbn07XG5cbmV4cG9ydCBkZWZhdWx0IE1vZGVsSGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztNQWVrQkEsWUFBWTtFQUFBLFdBQVpBLFlBQVk7SUFBWkEsWUFBWTtJQUFaQSxZQUFZO0VBQUEsR0FBWkEsWUFBWSxLQUFaQSxZQUFZO0VBQUE7RUFJOUIsSUFBTUMsV0FBVyxHQUFHO0lBQ25CO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0Msd0JBQXdCLEVBQUUsVUFBVUMsVUFBMEIsRUFBRTtNQUMvRCxJQUFNQyxnQkFBZ0IsR0FBR0QsVUFBVSxDQUFDRSxTQUFTLENBQUMsR0FBRyxDQUFDO01BQ2xELEtBQUssSUFBTUMsVUFBVSxJQUFJRixnQkFBZ0IsRUFBRTtRQUMxQyxJQUNDQSxnQkFBZ0IsQ0FBQ0UsVUFBVSxDQUFDLENBQUNDLEtBQUssS0FBSyxXQUFXLElBQ2xESixVQUFVLENBQUNFLFNBQVMsWUFBS0MsVUFBVSw2REFBMEQsRUFDNUY7VUFDRCxPQUFPLElBQUk7UUFDWjtNQUNEO01BQ0EsT0FBTyxLQUFLO0lBQ2IsQ0FBQztJQUVEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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