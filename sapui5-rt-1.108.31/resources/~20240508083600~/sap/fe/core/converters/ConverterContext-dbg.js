/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/ManifestWrapper", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/templating/DataModelPathHelper"], function (ManifestWrapper, MetaModelConverter, DataModelPathHelper) {
  "use strict";

  var getTargetObjectPath = DataModelPathHelper.getTargetObjectPath;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var enhanceDataModelPath = DataModelPathHelper.enhanceDataModelPath;
  var getInvolvedDataModelObjectFromPath = MetaModelConverter.getInvolvedDataModelObjectFromPath;
  var convertTypes = MetaModelConverter.convertTypes;
  /**
   * Checks whether an object is an annotation term.
   *
   * @param vAnnotationPath
   * @returns `true` if it's an annotation term
   */
  var isAnnotationTerm = function (vAnnotationPath) {
    return typeof vAnnotationPath === "object";
  };
  function isServiceObject(objectPart) {
    return objectPart && objectPart.hasOwnProperty("_type");
  }
  var getDataModelPathForEntitySet = function (resolvedMetaPath, convertedTypes) {
    var rootEntitySet;
    var currentEntitySet;
    var previousEntitySet;
    var currentEntityType;
    var navigatedPaths = [];
    var navigationProperties = [];
    resolvedMetaPath.objectPath.forEach(function (objectPart) {
      var _currentEntitySet;
      if (isServiceObject(objectPart)) {
        switch (objectPart._type) {
          case "NavigationProperty":
            navigatedPaths.push(objectPart.name);
            navigationProperties.push(objectPart);
            currentEntityType = objectPart.targetType;
            if (previousEntitySet && previousEntitySet.navigationPropertyBinding.hasOwnProperty(navigatedPaths.join("/"))) {
              currentEntitySet = previousEntitySet.navigationPropertyBinding[navigatedPaths.join("/")];
              previousEntitySet = currentEntitySet;
              navigatedPaths = [];
            } else {
              currentEntitySet = undefined;
            }
            break;
          case "EntitySet":
            if (rootEntitySet === undefined) {
              rootEntitySet = objectPart;
            }
            currentEntitySet = objectPart;
            previousEntitySet = currentEntitySet;
            currentEntityType = (_currentEntitySet = currentEntitySet) === null || _currentEntitySet === void 0 ? void 0 : _currentEntitySet.entityType;
            break;
          default:
            break;
        }
      }
    });
    var dataModelPath = {
      startingEntitySet: rootEntitySet,
      targetEntityType: currentEntityType,
      targetEntitySet: currentEntitySet,
      navigationProperties: navigationProperties,
      contextLocation: undefined,
      targetObject: resolvedMetaPath.target,
      convertedTypes: convertedTypes
    };
    dataModelPath.contextLocation = dataModelPath;
    return dataModelPath;
  };

  /**
   * Create a ConverterContext object that will be used within the converters.
   *
   * @param {ConvertedMetadata} oConvertedTypes The converted annotation and service types
   * @param {BaseManifestSettings} oManifestSettings The manifestSettings that applies to this page
   * @param {TemplateType} templateType The type of template we're looking at right now
   * @param {IDiagnostics} diagnostics The diagnostics shim
   * @param {Function} mergeFn The function to be used to perfom some deep merges between object
   * @param {DataModelObjectPath} targetDataModelPath The global path to reach the entitySet
   * @returns {ConverterContext} A converter context for the converters
   */
  var ConverterContext = /*#__PURE__*/function () {
    function ConverterContext(convertedTypes, manifestSettings, diagnostics, mergeFn, targetDataModelPath) {
      this.convertedTypes = convertedTypes;
      this.manifestSettings = manifestSettings;
      this.diagnostics = diagnostics;
      this.mergeFn = mergeFn;
      this.targetDataModelPath = targetDataModelPath;
      this.manifestWrapper = new ManifestWrapper(this.manifestSettings, mergeFn);
      this.baseContextPath = getTargetObjectPath(this.targetDataModelPath);
    }
    var _proto = ConverterContext.prototype;
    _proto._getEntityTypeFromFullyQualifiedName = function _getEntityTypeFromFullyQualifiedName(fullyQualifiedName) {
      return this.convertedTypes.entityTypes.find(function (entityType) {
        if (fullyQualifiedName.startsWith(entityType.fullyQualifiedName)) {
          var replaceAnnotation = fullyQualifiedName.replace(entityType.fullyQualifiedName, "");
          return replaceAnnotation.startsWith("/") || replaceAnnotation.startsWith("@");
        }
        return false;
      });
    }

    /**
     * Retrieve the entityType associated with an annotation object.
     *
     * @param annotation The annotation object for which we want to find the entityType
     * @returns The EntityType the annotation refers to
     */;
    _proto.getAnnotationEntityType = function getAnnotationEntityType(annotation) {
      if (annotation) {
        var annotationPath = annotation.fullyQualifiedName;
        var targetEntityType = this._getEntityTypeFromFullyQualifiedName(annotationPath);
        if (!targetEntityType) {
          throw new Error("Cannot find Entity Type for ".concat(annotation.fullyQualifiedName));
        }
        return targetEntityType;
      } else {
        return this.targetDataModelPath.targetEntityType;
      }
    }

    /**
     * Retrieve the manifest settings defined for a specific control within controlConfiguration.
     *
     * @param vAnnotationPath The annotation path or object to evaluate
     * @returns The control configuration for that specific annotation path if it exists
     */;
    _proto.getManifestControlConfiguration = function getManifestControlConfiguration(vAnnotationPath) {
      if (isAnnotationTerm(vAnnotationPath)) {
        return this.manifestWrapper.getControlConfiguration(vAnnotationPath.fullyQualifiedName.replace(this.targetDataModelPath.targetEntityType.fullyQualifiedName, ""));
      }
      // Checking if there are multiple entity set in the manifest, and comparing the entity set of the ControlConfiguration with the one from the annotation.
      var sAnnotationPath = this.manifestWrapper.hasMultipleEntitySets() && this.baseContextPath !== "/".concat(this.manifestWrapper.getEntitySet()) ? "".concat(this.baseContextPath, "/").concat(vAnnotationPath) : vAnnotationPath;
      return this.manifestWrapper.getControlConfiguration(sAnnotationPath);
    }

    /**
     * Create an absolute annotation path based on the current meta model context.
     *
     * @param sAnnotationPath The relative annotation path
     * @returns The correct annotation path based on the current context
     */;
    _proto.getAbsoluteAnnotationPath = function getAbsoluteAnnotationPath(sAnnotationPath) {
      if (!sAnnotationPath) {
        return sAnnotationPath;
      }
      if (sAnnotationPath[0] === "/") {
        return sAnnotationPath;
      }
      return "".concat(this.baseContextPath, "/").concat(sAnnotationPath);
    }

    /**
     * Retrieve the current entitySet.
     *
     * @returns The current EntitySet if it exists.
     */;
    _proto.getEntitySet = function getEntitySet() {
      return this.targetDataModelPath.targetEntitySet;
    }

    /**
     * Retrieve the context path.
     *
     * @returns The context path of the converter.
     */;
    _proto.getContextPath = function getContextPath() {
      return this.baseContextPath;
    }

    /**
     * Retrieve the current data model object path.
     *
     * @returns The current data model object path
     */;
    _proto.getDataModelObjectPath = function getDataModelObjectPath() {
      return this.targetDataModelPath;
    }

    /**
     * Get the EntityContainer.
     *
     * @returns The current service EntityContainer
     */;
    _proto.getEntityContainer = function getEntityContainer() {
      return this.convertedTypes.entityContainer;
    }

    /**
     * Get the EntityType based on the fully qualified name.
     *
     * @returns The current EntityType.
     */;
    _proto.getEntityType = function getEntityType() {
      return this.targetDataModelPath.targetEntityType;
    }

    /**
     * Gets the entity type of the parameter in case of a parameterized service.
     *
     * @returns The entity type of the parameter
     */;
    _proto.getParameterEntityType = function getParameterEntityType() {
      var _parameterEntityType$, _parameterEntityType$2;
      var parameterEntityType = this.targetDataModelPath.startingEntitySet.entityType;
      var isParameterized = !!((_parameterEntityType$ = parameterEntityType.annotations) !== null && _parameterEntityType$ !== void 0 && (_parameterEntityType$2 = _parameterEntityType$.Common) !== null && _parameterEntityType$2 !== void 0 && _parameterEntityType$2.ResultContext);
      return isParameterized && parameterEntityType;
    }

    /**
     * Retrieves an annotation from an entity type based on annotation path.
     *
     * @param annotationPath The annotation path to be evaluated
     * @returns The target annotation path as well as a converter context to go with it
     */;
    _proto.getEntityTypeAnnotation = function getEntityTypeAnnotation(annotationPath) {
      if (!annotationPath.includes("@")) {
        throw new Error("Not an annotation path: '".concat(annotationPath, "'"));
      }
      var isAbsolute = annotationPath.startsWith("/");
      var path;
      if (isAbsolute) {
        // path can be used as-is
        path = annotationPath;
      } else {
        // build an absolute path based on the entity type (this function works on the type!)
        var base = this.getContextPath().split("@", 1)[0];
        path = base.endsWith("/") ? base + annotationPath : "".concat(base, "/").concat(annotationPath);
      }
      var target = this.resolveAbsolutePath(path);
      var dataModelObjectPath = getInvolvedDataModelObjectFromPath({
        target: target.target,
        visitedObjects: target.objectPath
      }, this.convertedTypes, isAbsolute ? undefined : this.targetDataModelPath.contextLocation, true);
      return {
        annotation: target.target,
        converterContext: new ConverterContext(this.convertedTypes, this.manifestSettings, this.diagnostics, this.mergeFn, dataModelObjectPath)
      };
    }

    /**
     * Retrieve the type of template we're working on (e.g. ListReport / ObjectPage / ...).
     *
     * @returns The current tenplate type
     */;
    _proto.getTemplateType = function getTemplateType() {
      return this.manifestWrapper.getTemplateType();
    }

    /**
     * Retrieve the converted types.
     *
     * @returns The current converted types
     */;
    _proto.getConvertedTypes = function getConvertedTypes() {
      return this.convertedTypes;
    }

    /**
     * Retrieve a relative annotation path between an annotation path and an entity type.
     *
     * @param annotationPath
     * @param entityType
     * @returns The relative anntotation path.
     */;
    _proto.getRelativeAnnotationPath = function getRelativeAnnotationPath(annotationPath, entityType) {
      return annotationPath.replace(entityType.fullyQualifiedName, "");
    }

    /**
     * Transform an entityType based path to an entitySet based one (ui5 templating generally expect an entitySetBasedPath).
     *
     * @param annotationPath
     * @returns The EntitySet based annotation path
     */;
    _proto.getEntitySetBasedAnnotationPath = function getEntitySetBasedAnnotationPath(annotationPath) {
      if (!annotationPath) {
        return annotationPath;
      }
      var entityTypeFQN = this.targetDataModelPath.targetEntityType.fullyQualifiedName;
      if (this.targetDataModelPath.targetEntitySet || (this.baseContextPath.startsWith("/") && this.baseContextPath.match(/\//g) || []).length > 1) {
        var replacedAnnotationPath = annotationPath.replace(entityTypeFQN, "/");
        if (replacedAnnotationPath.length > 2 && replacedAnnotationPath[0] === "/" && replacedAnnotationPath[1] === "/") {
          replacedAnnotationPath = replacedAnnotationPath.substr(1);
        }
        return this.baseContextPath + (replacedAnnotationPath.startsWith("/") ? replacedAnnotationPath : "/".concat(replacedAnnotationPath));
      } else {
        return "/".concat(annotationPath);
      }
    }

    /**
     * Retrieve the manifest wrapper for the current context.
     *
     * @returns The current manifest wrapper
     */;
    _proto.getManifestWrapper = function getManifestWrapper() {
      return this.manifestWrapper;
    };
    _proto.getDiagnostics = function getDiagnostics() {
      return this.diagnostics;
    }

    /**
     * Retrieve the target from an absolute path.
     *
     * @param path The path we want to get the target
     * @returns The absolute path
     */;
    _proto.resolveAbsolutePath = function resolveAbsolutePath(path) {
      return this.convertedTypes.resolvePath(path);
    }

    /**
     * Retrieve a new converter context, scoped for a different context path.
     *
     * @param contextPath The path we want to orchestrate the converter context around
     * @returns The converted context for the sub path
     */;
    _proto.getConverterContextFor = function getConverterContextFor(contextPath) {
      var resolvedMetaPath = this.convertedTypes.resolvePath(contextPath);
      var targetPath = getDataModelPathForEntitySet(resolvedMetaPath, this.convertedTypes);
      return new ConverterContext(this.convertedTypes, this.manifestSettings, this.diagnostics, this.mergeFn, targetPath);
    }

    /**
     * Get all annotations of a given term and vocabulary on an entity type
     * (or on the current entity type if entityType isn't specified).
     *
     * @param vocabularyName
     * @param annotationTerm
     * @param [annotationSources]
     * @returns All the annotation for a specific term and vocabulary from an entity type
     */;
    _proto.getAnnotationsByTerm = function getAnnotationsByTerm(vocabularyName, annotationTerm) {
      var annotationSources = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [this.getEntityType()];
      var outAnnotations = [];
      annotationSources.forEach(function (annotationSource) {
        if (annotationSource) {
          var annotations = (annotationSource === null || annotationSource === void 0 ? void 0 : annotationSource.annotations[vocabularyName]) || {};
          if (annotations) {
            outAnnotations = Object.keys(annotations).filter(function (annotation) {
              return annotations[annotation].term === annotationTerm;
            }).reduce(function (previousValue, key) {
              previousValue.push(annotations[key]);
              return previousValue;
            }, outAnnotations);
          }
        }
      });
      return outAnnotations;
    }

    /**
     * Retrieves the relative model path based on the current context path.
     *
     * @returns The relative model path or undefined if the path is not resolveable
     */;
    _proto.getRelativeModelPathFunction = function getRelativeModelPathFunction() {
      var targetDataModelPath = this.targetDataModelPath;
      return function (sPath) {
        var enhancedPath = enhanceDataModelPath(targetDataModelPath, sPath);
        return getContextRelativeTargetObjectPath(enhancedPath, true);
      };
    }

    /**
     * Create the converter context necessary for a macro based on a metamodel context.
     *
     * @param sEntitySetName
     * @param oMetaModelContext
     * @param diagnostics
     * @param mergeFn
     * @param targetDataModelPath
     * @param manifestSettings
     * @returns The current converter context
     */;
    ConverterContext.createConverterContextForMacro = function createConverterContextForMacro(sEntitySetName, oMetaModelContext, diagnostics, mergeFn, targetDataModelPath) {
      var manifestSettings = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : {};
      var oMetaModel = oMetaModelContext.isA("sap.ui.model.odata.v4.ODataMetaModel") ? oMetaModelContext : oMetaModelContext.getModel();
      var oConvertedMetadata = convertTypes(oMetaModel);
      var targetEntitySet = oConvertedMetadata.entitySets.find(function (entitySet) {
        return entitySet.name === sEntitySetName;
      });
      if (!targetEntitySet) {
        targetEntitySet = oConvertedMetadata.singletons.find(function (entitySet) {
          return entitySet.name === sEntitySetName;
        });
      }
      if (!targetDataModelPath || targetEntitySet !== targetDataModelPath.startingEntitySet) {
        targetDataModelPath = {
          startingEntitySet: targetEntitySet,
          navigationProperties: [],
          targetEntitySet: targetEntitySet,
          targetEntityType: targetEntitySet.entityType,
          targetObject: targetEntitySet,
          convertedTypes: oConvertedMetadata
        };
      }
      return new ConverterContext(oConvertedMetadata, manifestSettings, diagnostics, mergeFn, targetDataModelPath);
    };
    return ConverterContext;
  }();
  return ConverterContext;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJpc0Fubm90YXRpb25UZXJtIiwidkFubm90YXRpb25QYXRoIiwiaXNTZXJ2aWNlT2JqZWN0Iiwib2JqZWN0UGFydCIsImhhc093blByb3BlcnR5IiwiZ2V0RGF0YU1vZGVsUGF0aEZvckVudGl0eVNldCIsInJlc29sdmVkTWV0YVBhdGgiLCJjb252ZXJ0ZWRUeXBlcyIsInJvb3RFbnRpdHlTZXQiLCJjdXJyZW50RW50aXR5U2V0IiwicHJldmlvdXNFbnRpdHlTZXQiLCJjdXJyZW50RW50aXR5VHlwZSIsIm5hdmlnYXRlZFBhdGhzIiwibmF2aWdhdGlvblByb3BlcnRpZXMiLCJvYmplY3RQYXRoIiwiZm9yRWFjaCIsIl90eXBlIiwicHVzaCIsIm5hbWUiLCJ0YXJnZXRUeXBlIiwibmF2aWdhdGlvblByb3BlcnR5QmluZGluZyIsImpvaW4iLCJ1bmRlZmluZWQiLCJlbnRpdHlUeXBlIiwiZGF0YU1vZGVsUGF0aCIsInN0YXJ0aW5nRW50aXR5U2V0IiwidGFyZ2V0RW50aXR5VHlwZSIsInRhcmdldEVudGl0eVNldCIsImNvbnRleHRMb2NhdGlvbiIsInRhcmdldE9iamVjdCIsInRhcmdldCIsIkNvbnZlcnRlckNvbnRleHQiLCJtYW5pZmVzdFNldHRpbmdzIiwiZGlhZ25vc3RpY3MiLCJtZXJnZUZuIiwidGFyZ2V0RGF0YU1vZGVsUGF0aCIsIm1hbmlmZXN0V3JhcHBlciIsIk1hbmlmZXN0V3JhcHBlciIsImJhc2VDb250ZXh0UGF0aCIsImdldFRhcmdldE9iamVjdFBhdGgiLCJfZ2V0RW50aXR5VHlwZUZyb21GdWxseVF1YWxpZmllZE5hbWUiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJlbnRpdHlUeXBlcyIsImZpbmQiLCJzdGFydHNXaXRoIiwicmVwbGFjZUFubm90YXRpb24iLCJyZXBsYWNlIiwiZ2V0QW5ub3RhdGlvbkVudGl0eVR5cGUiLCJhbm5vdGF0aW9uIiwiYW5ub3RhdGlvblBhdGgiLCJFcnJvciIsImdldE1hbmlmZXN0Q29udHJvbENvbmZpZ3VyYXRpb24iLCJnZXRDb250cm9sQ29uZmlndXJhdGlvbiIsInNBbm5vdGF0aW9uUGF0aCIsImhhc011bHRpcGxlRW50aXR5U2V0cyIsImdldEVudGl0eVNldCIsImdldEFic29sdXRlQW5ub3RhdGlvblBhdGgiLCJnZXRDb250ZXh0UGF0aCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJnZXRFbnRpdHlDb250YWluZXIiLCJlbnRpdHlDb250YWluZXIiLCJnZXRFbnRpdHlUeXBlIiwiZ2V0UGFyYW1ldGVyRW50aXR5VHlwZSIsInBhcmFtZXRlckVudGl0eVR5cGUiLCJpc1BhcmFtZXRlcml6ZWQiLCJhbm5vdGF0aW9ucyIsIkNvbW1vbiIsIlJlc3VsdENvbnRleHQiLCJnZXRFbnRpdHlUeXBlQW5ub3RhdGlvbiIsImluY2x1ZGVzIiwiaXNBYnNvbHV0ZSIsInBhdGgiLCJiYXNlIiwic3BsaXQiLCJlbmRzV2l0aCIsInJlc29sdmVBYnNvbHV0ZVBhdGgiLCJkYXRhTW9kZWxPYmplY3RQYXRoIiwiZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RGcm9tUGF0aCIsInZpc2l0ZWRPYmplY3RzIiwiY29udmVydGVyQ29udGV4dCIsImdldFRlbXBsYXRlVHlwZSIsImdldENvbnZlcnRlZFR5cGVzIiwiZ2V0UmVsYXRpdmVBbm5vdGF0aW9uUGF0aCIsImdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgiLCJlbnRpdHlUeXBlRlFOIiwibWF0Y2giLCJsZW5ndGgiLCJyZXBsYWNlZEFubm90YXRpb25QYXRoIiwic3Vic3RyIiwiZ2V0TWFuaWZlc3RXcmFwcGVyIiwiZ2V0RGlhZ25vc3RpY3MiLCJyZXNvbHZlUGF0aCIsImdldENvbnZlcnRlckNvbnRleHRGb3IiLCJjb250ZXh0UGF0aCIsInRhcmdldFBhdGgiLCJnZXRBbm5vdGF0aW9uc0J5VGVybSIsInZvY2FidWxhcnlOYW1lIiwiYW5ub3RhdGlvblRlcm0iLCJhbm5vdGF0aW9uU291cmNlcyIsIm91dEFubm90YXRpb25zIiwiYW5ub3RhdGlvblNvdXJjZSIsIk9iamVjdCIsImtleXMiLCJmaWx0ZXIiLCJ0ZXJtIiwicmVkdWNlIiwicHJldmlvdXNWYWx1ZSIsImtleSIsImdldFJlbGF0aXZlTW9kZWxQYXRoRnVuY3Rpb24iLCJzUGF0aCIsImVuaGFuY2VkUGF0aCIsImVuaGFuY2VEYXRhTW9kZWxQYXRoIiwiZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aCIsImNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyIsInNFbnRpdHlTZXROYW1lIiwib01ldGFNb2RlbENvbnRleHQiLCJvTWV0YU1vZGVsIiwiaXNBIiwiZ2V0TW9kZWwiLCJvQ29udmVydGVkTWV0YWRhdGEiLCJjb252ZXJ0VHlwZXMiLCJlbnRpdHlTZXRzIiwiZW50aXR5U2V0Iiwic2luZ2xldG9ucyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ29udmVydGVyQ29udGV4dC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSB7XG5cdEFubm90YXRpb25UZXJtLFxuXHRDb252ZXJ0ZWRNZXRhZGF0YSxcblx0RW50aXR5Q29udGFpbmVyLFxuXHRFbnRpdHlTZXQsXG5cdEVudGl0eVR5cGUsXG5cdE5hdmlnYXRpb25Qcm9wZXJ0eSxcblx0UmVzb2x1dGlvblRhcmdldCxcblx0U2VydmljZU9iamVjdCxcblx0U2VydmljZU9iamVjdEFuZEFubm90YXRpb24sXG5cdFNpbmdsZXRvblxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgRW50aXR5VHlwZUFubm90YXRpb25zIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzL3ZvY2FidWxhcmllcy9FZG1fVHlwZXNcIjtcbmltcG9ydCB0eXBlIHsgQmFzZU1hbmlmZXN0U2V0dGluZ3MsIFRlbXBsYXRlVHlwZSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL01hbmlmZXN0U2V0dGluZ3NcIjtcbmltcG9ydCBNYW5pZmVzdFdyYXBwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWFuaWZlc3RXcmFwcGVyXCI7XG5pbXBvcnQgeyBjb252ZXJ0VHlwZXMsIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0RnJvbVBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9NZXRhTW9kZWxDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgSURpYWdub3N0aWNzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvVGVtcGxhdGVDb252ZXJ0ZXJcIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB7IGVuaGFuY2VEYXRhTW9kZWxQYXRoLCBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoLCBnZXRUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHR5cGUgQ29udGV4dCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L0NvbnRleHRcIjtcbmltcG9ydCB0eXBlIE9EYXRhTWV0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNZXRhTW9kZWxcIjtcblxuZXhwb3J0IHR5cGUgUmVzb2x2ZWRBbm5vdGF0aW9uQ29udGV4dCA9IHtcblx0YW5ub3RhdGlvbjogQW5ub3RhdGlvblRlcm08YW55Pjtcblx0Y29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dDtcbn07XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYW4gb2JqZWN0IGlzIGFuIGFubm90YXRpb24gdGVybS5cbiAqXG4gKiBAcGFyYW0gdkFubm90YXRpb25QYXRoXG4gKiBAcmV0dXJucyBgdHJ1ZWAgaWYgaXQncyBhbiBhbm5vdGF0aW9uIHRlcm1cbiAqL1xuY29uc3QgaXNBbm5vdGF0aW9uVGVybSA9IGZ1bmN0aW9uICh2QW5ub3RhdGlvblBhdGg6IHN0cmluZyB8IEFubm90YXRpb25UZXJtPGFueT4pOiB2QW5ub3RhdGlvblBhdGggaXMgQW5ub3RhdGlvblRlcm08YW55PiB7XG5cdHJldHVybiB0eXBlb2YgdkFubm90YXRpb25QYXRoID09PSBcIm9iamVjdFwiO1xufTtcblxuZnVuY3Rpb24gaXNTZXJ2aWNlT2JqZWN0KG9iamVjdFBhcnQ6IFNlcnZpY2VPYmplY3RBbmRBbm5vdGF0aW9uKTogb2JqZWN0UGFydCBpcyBTZXJ2aWNlT2JqZWN0IHtcblx0cmV0dXJuIG9iamVjdFBhcnQgJiYgb2JqZWN0UGFydC5oYXNPd25Qcm9wZXJ0eShcIl90eXBlXCIpO1xufVxuXG5jb25zdCBnZXREYXRhTW9kZWxQYXRoRm9yRW50aXR5U2V0ID0gZnVuY3Rpb24gKFxuXHRyZXNvbHZlZE1ldGFQYXRoOiBSZXNvbHV0aW9uVGFyZ2V0PGFueT4sXG5cdGNvbnZlcnRlZFR5cGVzOiBDb252ZXJ0ZWRNZXRhZGF0YVxuKTogRGF0YU1vZGVsT2JqZWN0UGF0aCB7XG5cdGxldCByb290RW50aXR5U2V0OiBFbnRpdHlTZXQgfCB1bmRlZmluZWQ7XG5cdGxldCBjdXJyZW50RW50aXR5U2V0OiBFbnRpdHlTZXQgfCB1bmRlZmluZWQ7XG5cdGxldCBwcmV2aW91c0VudGl0eVNldDogRW50aXR5U2V0IHwgdW5kZWZpbmVkO1xuXHRsZXQgY3VycmVudEVudGl0eVR5cGU6IEVudGl0eVR5cGUgfCB1bmRlZmluZWQ7XG5cdGxldCBuYXZpZ2F0ZWRQYXRoczogc3RyaW5nW10gPSBbXTtcblx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnRpZXM6IE5hdmlnYXRpb25Qcm9wZXJ0eVtdID0gW107XG5cdHJlc29sdmVkTWV0YVBhdGgub2JqZWN0UGF0aC5mb3JFYWNoKChvYmplY3RQYXJ0OiBTZXJ2aWNlT2JqZWN0QW5kQW5ub3RhdGlvbikgPT4ge1xuXHRcdGlmIChpc1NlcnZpY2VPYmplY3Qob2JqZWN0UGFydCkpIHtcblx0XHRcdHN3aXRjaCAob2JqZWN0UGFydC5fdHlwZSkge1xuXHRcdFx0XHRjYXNlIFwiTmF2aWdhdGlvblByb3BlcnR5XCI6XG5cdFx0XHRcdFx0bmF2aWdhdGVkUGF0aHMucHVzaChvYmplY3RQYXJ0Lm5hbWUpO1xuXHRcdFx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzLnB1c2gob2JqZWN0UGFydCk7XG5cdFx0XHRcdFx0Y3VycmVudEVudGl0eVR5cGUgPSBvYmplY3RQYXJ0LnRhcmdldFR5cGU7XG5cdFx0XHRcdFx0aWYgKHByZXZpb3VzRW50aXR5U2V0ICYmIHByZXZpb3VzRW50aXR5U2V0Lm5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcuaGFzT3duUHJvcGVydHkobmF2aWdhdGVkUGF0aHMuam9pbihcIi9cIikpKSB7XG5cdFx0XHRcdFx0XHRjdXJyZW50RW50aXR5U2V0ID0gcHJldmlvdXNFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1tuYXZpZ2F0ZWRQYXRocy5qb2luKFwiL1wiKV0gYXMgRW50aXR5U2V0O1xuXHRcdFx0XHRcdFx0cHJldmlvdXNFbnRpdHlTZXQgPSBjdXJyZW50RW50aXR5U2V0O1xuXHRcdFx0XHRcdFx0bmF2aWdhdGVkUGF0aHMgPSBbXTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Y3VycmVudEVudGl0eVNldCA9IHVuZGVmaW5lZDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJFbnRpdHlTZXRcIjpcblx0XHRcdFx0XHRpZiAocm9vdEVudGl0eVNldCA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRyb290RW50aXR5U2V0ID0gb2JqZWN0UGFydDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y3VycmVudEVudGl0eVNldCA9IG9iamVjdFBhcnQ7XG5cdFx0XHRcdFx0cHJldmlvdXNFbnRpdHlTZXQgPSBjdXJyZW50RW50aXR5U2V0O1xuXHRcdFx0XHRcdGN1cnJlbnRFbnRpdHlUeXBlID0gY3VycmVudEVudGl0eVNldD8uZW50aXR5VHlwZTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdH1cblx0XHR9XG5cdH0pO1xuXHRjb25zdCBkYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoID0ge1xuXHRcdHN0YXJ0aW5nRW50aXR5U2V0OiByb290RW50aXR5U2V0IGFzIEVudGl0eVNldCxcblx0XHR0YXJnZXRFbnRpdHlUeXBlOiBjdXJyZW50RW50aXR5VHlwZSBhcyBFbnRpdHlUeXBlLFxuXHRcdHRhcmdldEVudGl0eVNldDogY3VycmVudEVudGl0eVNldCxcblx0XHRuYXZpZ2F0aW9uUHJvcGVydGllczogbmF2aWdhdGlvblByb3BlcnRpZXMsXG5cdFx0Y29udGV4dExvY2F0aW9uOiB1bmRlZmluZWQsXG5cdFx0dGFyZ2V0T2JqZWN0OiByZXNvbHZlZE1ldGFQYXRoLnRhcmdldCxcblx0XHRjb252ZXJ0ZWRUeXBlczogY29udmVydGVkVHlwZXNcblx0fTtcblx0ZGF0YU1vZGVsUGF0aC5jb250ZXh0TG9jYXRpb24gPSBkYXRhTW9kZWxQYXRoO1xuXHRyZXR1cm4gZGF0YU1vZGVsUGF0aDtcbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgQ29udmVydGVyQ29udGV4dCBvYmplY3QgdGhhdCB3aWxsIGJlIHVzZWQgd2l0aGluIHRoZSBjb252ZXJ0ZXJzLlxuICpcbiAqIEBwYXJhbSB7Q29udmVydGVkTWV0YWRhdGF9IG9Db252ZXJ0ZWRUeXBlcyBUaGUgY29udmVydGVkIGFubm90YXRpb24gYW5kIHNlcnZpY2UgdHlwZXNcbiAqIEBwYXJhbSB7QmFzZU1hbmlmZXN0U2V0dGluZ3N9IG9NYW5pZmVzdFNldHRpbmdzIFRoZSBtYW5pZmVzdFNldHRpbmdzIHRoYXQgYXBwbGllcyB0byB0aGlzIHBhZ2VcbiAqIEBwYXJhbSB7VGVtcGxhdGVUeXBlfSB0ZW1wbGF0ZVR5cGUgVGhlIHR5cGUgb2YgdGVtcGxhdGUgd2UncmUgbG9va2luZyBhdCByaWdodCBub3dcbiAqIEBwYXJhbSB7SURpYWdub3N0aWNzfSBkaWFnbm9zdGljcyBUaGUgZGlhZ25vc3RpY3Mgc2hpbVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWVyZ2VGbiBUaGUgZnVuY3Rpb24gdG8gYmUgdXNlZCB0byBwZXJmb20gc29tZSBkZWVwIG1lcmdlcyBiZXR3ZWVuIG9iamVjdFxuICogQHBhcmFtIHtEYXRhTW9kZWxPYmplY3RQYXRofSB0YXJnZXREYXRhTW9kZWxQYXRoIFRoZSBnbG9iYWwgcGF0aCB0byByZWFjaCB0aGUgZW50aXR5U2V0XG4gKiBAcmV0dXJucyB7Q29udmVydGVyQ29udGV4dH0gQSBjb252ZXJ0ZXIgY29udGV4dCBmb3IgdGhlIGNvbnZlcnRlcnNcbiAqL1xuY2xhc3MgQ29udmVydGVyQ29udGV4dCB7XG5cdHByaXZhdGUgbWFuaWZlc3RXcmFwcGVyOiBNYW5pZmVzdFdyYXBwZXI7XG5cdHByaXZhdGUgYmFzZUNvbnRleHRQYXRoOiBzdHJpbmc7XG5cblx0Y29uc3RydWN0b3IoXG5cdFx0cHJpdmF0ZSBjb252ZXJ0ZWRUeXBlczogQ29udmVydGVkTWV0YWRhdGEsXG5cdFx0cHJpdmF0ZSBtYW5pZmVzdFNldHRpbmdzOiBCYXNlTWFuaWZlc3RTZXR0aW5ncyxcblx0XHRwcml2YXRlIGRpYWdub3N0aWNzOiBJRGlhZ25vc3RpY3MsXG5cdFx0cHJpdmF0ZSBtZXJnZUZuOiBGdW5jdGlvbixcblx0XHRwcml2YXRlIHRhcmdldERhdGFNb2RlbFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGhcblx0KSB7XG5cdFx0dGhpcy5tYW5pZmVzdFdyYXBwZXIgPSBuZXcgTWFuaWZlc3RXcmFwcGVyKHRoaXMubWFuaWZlc3RTZXR0aW5ncywgbWVyZ2VGbik7XG5cdFx0dGhpcy5iYXNlQ29udGV4dFBhdGggPSBnZXRUYXJnZXRPYmplY3RQYXRoKHRoaXMudGFyZ2V0RGF0YU1vZGVsUGF0aCk7XG5cdH1cblxuXHRwcml2YXRlIF9nZXRFbnRpdHlUeXBlRnJvbUZ1bGx5UXVhbGlmaWVkTmFtZShmdWxseVF1YWxpZmllZE5hbWU6IHN0cmluZyk6IEVudGl0eVR5cGUgfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLmNvbnZlcnRlZFR5cGVzLmVudGl0eVR5cGVzLmZpbmQoKGVudGl0eVR5cGUpID0+IHtcblx0XHRcdGlmIChmdWxseVF1YWxpZmllZE5hbWUuc3RhcnRzV2l0aChlbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZSkpIHtcblx0XHRcdFx0Y29uc3QgcmVwbGFjZUFubm90YXRpb24gPSBmdWxseVF1YWxpZmllZE5hbWUucmVwbGFjZShlbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZSwgXCJcIik7XG5cdFx0XHRcdHJldHVybiByZXBsYWNlQW5ub3RhdGlvbi5zdGFydHNXaXRoKFwiL1wiKSB8fCByZXBsYWNlQW5ub3RhdGlvbi5zdGFydHNXaXRoKFwiQFwiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSB0aGUgZW50aXR5VHlwZSBhc3NvY2lhdGVkIHdpdGggYW4gYW5ub3RhdGlvbiBvYmplY3QuXG5cdCAqXG5cdCAqIEBwYXJhbSBhbm5vdGF0aW9uIFRoZSBhbm5vdGF0aW9uIG9iamVjdCBmb3Igd2hpY2ggd2Ugd2FudCB0byBmaW5kIHRoZSBlbnRpdHlUeXBlXG5cdCAqIEByZXR1cm5zIFRoZSBFbnRpdHlUeXBlIHRoZSBhbm5vdGF0aW9uIHJlZmVycyB0b1xuXHQgKi9cblx0Z2V0QW5ub3RhdGlvbkVudGl0eVR5cGUoYW5ub3RhdGlvbj86IEFubm90YXRpb25UZXJtPGFueT4pOiBFbnRpdHlUeXBlIHtcblx0XHRpZiAoYW5ub3RhdGlvbikge1xuXHRcdFx0Y29uc3QgYW5ub3RhdGlvblBhdGggPSBhbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZTtcblx0XHRcdGNvbnN0IHRhcmdldEVudGl0eVR5cGUgPSB0aGlzLl9nZXRFbnRpdHlUeXBlRnJvbUZ1bGx5UXVhbGlmaWVkTmFtZShhbm5vdGF0aW9uUGF0aCk7XG5cdFx0XHRpZiAoIXRhcmdldEVudGl0eVR5cGUpIHtcblx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgZmluZCBFbnRpdHkgVHlwZSBmb3IgJHthbm5vdGF0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZX1gKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0YXJnZXRFbnRpdHlUeXBlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy50YXJnZXREYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVR5cGU7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIHRoZSBtYW5pZmVzdCBzZXR0aW5ncyBkZWZpbmVkIGZvciBhIHNwZWNpZmljIGNvbnRyb2wgd2l0aGluIGNvbnRyb2xDb25maWd1cmF0aW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gdkFubm90YXRpb25QYXRoIFRoZSBhbm5vdGF0aW9uIHBhdGggb3Igb2JqZWN0IHRvIGV2YWx1YXRlXG5cdCAqIEByZXR1cm5zIFRoZSBjb250cm9sIGNvbmZpZ3VyYXRpb24gZm9yIHRoYXQgc3BlY2lmaWMgYW5ub3RhdGlvbiBwYXRoIGlmIGl0IGV4aXN0c1xuXHQgKi9cblx0Z2V0TWFuaWZlc3RDb250cm9sQ29uZmlndXJhdGlvbih2QW5ub3RhdGlvblBhdGg6IHN0cmluZyB8IEFubm90YXRpb25UZXJtPGFueT4pOiBhbnkge1xuXHRcdGlmIChpc0Fubm90YXRpb25UZXJtKHZBbm5vdGF0aW9uUGF0aCkpIHtcblx0XHRcdHJldHVybiB0aGlzLm1hbmlmZXN0V3JhcHBlci5nZXRDb250cm9sQ29uZmlndXJhdGlvbihcblx0XHRcdFx0dkFubm90YXRpb25QYXRoLmZ1bGx5UXVhbGlmaWVkTmFtZS5yZXBsYWNlKHRoaXMudGFyZ2V0RGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZSwgXCJcIilcblx0XHRcdCk7XG5cdFx0fVxuXHRcdC8vIENoZWNraW5nIGlmIHRoZXJlIGFyZSBtdWx0aXBsZSBlbnRpdHkgc2V0IGluIHRoZSBtYW5pZmVzdCwgYW5kIGNvbXBhcmluZyB0aGUgZW50aXR5IHNldCBvZiB0aGUgQ29udHJvbENvbmZpZ3VyYXRpb24gd2l0aCB0aGUgb25lIGZyb20gdGhlIGFubm90YXRpb24uXG5cdFx0Y29uc3Qgc0Fubm90YXRpb25QYXRoID1cblx0XHRcdHRoaXMubWFuaWZlc3RXcmFwcGVyLmhhc011bHRpcGxlRW50aXR5U2V0cygpICYmIHRoaXMuYmFzZUNvbnRleHRQYXRoICE9PSBgLyR7dGhpcy5tYW5pZmVzdFdyYXBwZXIuZ2V0RW50aXR5U2V0KCl9YFxuXHRcdFx0XHQ/IGAke3RoaXMuYmFzZUNvbnRleHRQYXRofS8ke3ZBbm5vdGF0aW9uUGF0aH1gXG5cdFx0XHRcdDogdkFubm90YXRpb25QYXRoO1xuXHRcdHJldHVybiB0aGlzLm1hbmlmZXN0V3JhcHBlci5nZXRDb250cm9sQ29uZmlndXJhdGlvbihzQW5ub3RhdGlvblBhdGgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIENyZWF0ZSBhbiBhYnNvbHV0ZSBhbm5vdGF0aW9uIHBhdGggYmFzZWQgb24gdGhlIGN1cnJlbnQgbWV0YSBtb2RlbCBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc0Fubm90YXRpb25QYXRoIFRoZSByZWxhdGl2ZSBhbm5vdGF0aW9uIHBhdGhcblx0ICogQHJldHVybnMgVGhlIGNvcnJlY3QgYW5ub3RhdGlvbiBwYXRoIGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbnRleHRcblx0ICovXG5cdGdldEFic29sdXRlQW5ub3RhdGlvblBhdGgoc0Fubm90YXRpb25QYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRcdGlmICghc0Fubm90YXRpb25QYXRoKSB7XG5cdFx0XHRyZXR1cm4gc0Fubm90YXRpb25QYXRoO1xuXHRcdH1cblx0XHRpZiAoc0Fubm90YXRpb25QYXRoWzBdID09PSBcIi9cIikge1xuXHRcdFx0cmV0dXJuIHNBbm5vdGF0aW9uUGF0aDtcblx0XHR9XG5cdFx0cmV0dXJuIGAke3RoaXMuYmFzZUNvbnRleHRQYXRofS8ke3NBbm5vdGF0aW9uUGF0aH1gO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIHRoZSBjdXJyZW50IGVudGl0eVNldC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGN1cnJlbnQgRW50aXR5U2V0IGlmIGl0IGV4aXN0cy5cblx0ICovXG5cdGdldEVudGl0eVNldCgpOiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gfCB1bmRlZmluZWQge1xuXHRcdHJldHVybiB0aGlzLnRhcmdldERhdGFNb2RlbFBhdGgudGFyZ2V0RW50aXR5U2V0IGFzIEVudGl0eVNldCB8IFNpbmdsZXRvbjtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSB0aGUgY29udGV4dCBwYXRoLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY29udGV4dCBwYXRoIG9mIHRoZSBjb252ZXJ0ZXIuXG5cdCAqL1xuXHRnZXRDb250ZXh0UGF0aCgpOiBzdHJpbmcge1xuXHRcdHJldHVybiB0aGlzLmJhc2VDb250ZXh0UGF0aDtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSB0aGUgY3VycmVudCBkYXRhIG1vZGVsIG9iamVjdCBwYXRoLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCBkYXRhIG1vZGVsIG9iamVjdCBwYXRoXG5cdCAqL1xuXHRnZXREYXRhTW9kZWxPYmplY3RQYXRoKCk6IERhdGFNb2RlbE9iamVjdFBhdGgge1xuXHRcdHJldHVybiB0aGlzLnRhcmdldERhdGFNb2RlbFBhdGg7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBFbnRpdHlDb250YWluZXIuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHNlcnZpY2UgRW50aXR5Q29udGFpbmVyXG5cdCAqL1xuXHRnZXRFbnRpdHlDb250YWluZXIoKTogRW50aXR5Q29udGFpbmVyIHtcblx0XHRyZXR1cm4gdGhpcy5jb252ZXJ0ZWRUeXBlcy5lbnRpdHlDb250YWluZXI7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IHRoZSBFbnRpdHlUeXBlIGJhc2VkIG9uIHRoZSBmdWxseSBxdWFsaWZpZWQgbmFtZS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGN1cnJlbnQgRW50aXR5VHlwZS5cblx0ICovXG5cdGdldEVudGl0eVR5cGUoKTogRW50aXR5VHlwZSB7XG5cdFx0cmV0dXJuIHRoaXMudGFyZ2V0RGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlUeXBlO1xuXHR9XG5cblx0LyoqXG5cdCAqIEdldHMgdGhlIGVudGl0eSB0eXBlIG9mIHRoZSBwYXJhbWV0ZXIgaW4gY2FzZSBvZiBhIHBhcmFtZXRlcml6ZWQgc2VydmljZS5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIGVudGl0eSB0eXBlIG9mIHRoZSBwYXJhbWV0ZXJcblx0ICovXG5cdGdldFBhcmFtZXRlckVudGl0eVR5cGUoKTogRW50aXR5VHlwZSB7XG5cdFx0Y29uc3QgcGFyYW1ldGVyRW50aXR5VHlwZSA9IHRoaXMudGFyZ2V0RGF0YU1vZGVsUGF0aC5zdGFydGluZ0VudGl0eVNldC5lbnRpdHlUeXBlO1xuXHRcdGNvbnN0IGlzUGFyYW1ldGVyaXplZCA9ICEhcGFyYW1ldGVyRW50aXR5VHlwZS5hbm5vdGF0aW9ucz8uQ29tbW9uPy5SZXN1bHRDb250ZXh0O1xuXHRcdHJldHVybiAoaXNQYXJhbWV0ZXJpemVkICYmIHBhcmFtZXRlckVudGl0eVR5cGUpIGFzIEVudGl0eVR5cGU7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIGFuIGFubm90YXRpb24gZnJvbSBhbiBlbnRpdHkgdHlwZSBiYXNlZCBvbiBhbm5vdGF0aW9uIHBhdGguXG5cdCAqXG5cdCAqIEBwYXJhbSBhbm5vdGF0aW9uUGF0aCBUaGUgYW5ub3RhdGlvbiBwYXRoIHRvIGJlIGV2YWx1YXRlZFxuXHQgKiBAcmV0dXJucyBUaGUgdGFyZ2V0IGFubm90YXRpb24gcGF0aCBhcyB3ZWxsIGFzIGEgY29udmVydGVyIGNvbnRleHQgdG8gZ28gd2l0aCBpdFxuXHQgKi9cblx0Z2V0RW50aXR5VHlwZUFubm90YXRpb24oYW5ub3RhdGlvblBhdGg6IHN0cmluZyk6IFJlc29sdmVkQW5ub3RhdGlvbkNvbnRleHQge1xuXHRcdGlmICghYW5ub3RhdGlvblBhdGguaW5jbHVkZXMoXCJAXCIpKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3IoYE5vdCBhbiBhbm5vdGF0aW9uIHBhdGg6ICcke2Fubm90YXRpb25QYXRofSdgKTtcblx0XHR9XG5cblx0XHRjb25zdCBpc0Fic29sdXRlID0gYW5ub3RhdGlvblBhdGguc3RhcnRzV2l0aChcIi9cIik7XG5cdFx0bGV0IHBhdGg6IHN0cmluZztcblxuXHRcdGlmIChpc0Fic29sdXRlKSB7XG5cdFx0XHQvLyBwYXRoIGNhbiBiZSB1c2VkIGFzLWlzXG5cdFx0XHRwYXRoID0gYW5ub3RhdGlvblBhdGg7XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIGJ1aWxkIGFuIGFic29sdXRlIHBhdGggYmFzZWQgb24gdGhlIGVudGl0eSB0eXBlICh0aGlzIGZ1bmN0aW9uIHdvcmtzIG9uIHRoZSB0eXBlISlcblx0XHRcdGNvbnN0IGJhc2UgPSB0aGlzLmdldENvbnRleHRQYXRoKCkuc3BsaXQoXCJAXCIsIDEpWzBdO1xuXHRcdFx0cGF0aCA9IGJhc2UuZW5kc1dpdGgoXCIvXCIpID8gYmFzZSArIGFubm90YXRpb25QYXRoIDogYCR7YmFzZX0vJHthbm5vdGF0aW9uUGF0aH1gO1xuXHRcdH1cblxuXHRcdGNvbnN0IHRhcmdldDogUmVzb2x1dGlvblRhcmdldDxhbnk+ID0gdGhpcy5yZXNvbHZlQWJzb2x1dGVQYXRoKHBhdGgpO1xuXG5cdFx0Y29uc3QgZGF0YU1vZGVsT2JqZWN0UGF0aCA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0RnJvbVBhdGgoXG5cdFx0XHR7IHRhcmdldDogdGFyZ2V0LnRhcmdldCwgdmlzaXRlZE9iamVjdHM6IHRhcmdldC5vYmplY3RQYXRoIGFzIFNlcnZpY2VPYmplY3RbXSB9LFxuXHRcdFx0dGhpcy5jb252ZXJ0ZWRUeXBlcyxcblx0XHRcdGlzQWJzb2x1dGUgPyB1bmRlZmluZWQgOiB0aGlzLnRhcmdldERhdGFNb2RlbFBhdGguY29udGV4dExvY2F0aW9uLFxuXHRcdFx0dHJ1ZVxuXHRcdCk7XG5cblx0XHRyZXR1cm4ge1xuXHRcdFx0YW5ub3RhdGlvbjogdGFyZ2V0LnRhcmdldCxcblx0XHRcdGNvbnZlcnRlckNvbnRleHQ6IG5ldyBDb252ZXJ0ZXJDb250ZXh0KFxuXHRcdFx0XHR0aGlzLmNvbnZlcnRlZFR5cGVzLFxuXHRcdFx0XHR0aGlzLm1hbmlmZXN0U2V0dGluZ3MsXG5cdFx0XHRcdHRoaXMuZGlhZ25vc3RpY3MsXG5cdFx0XHRcdHRoaXMubWVyZ2VGbixcblx0XHRcdFx0ZGF0YU1vZGVsT2JqZWN0UGF0aFxuXHRcdFx0KVxuXHRcdH07XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmUgdGhlIHR5cGUgb2YgdGVtcGxhdGUgd2UncmUgd29ya2luZyBvbiAoZS5nLiBMaXN0UmVwb3J0IC8gT2JqZWN0UGFnZSAvIC4uLikuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBjdXJyZW50IHRlbnBsYXRlIHR5cGVcblx0ICovXG5cdGdldFRlbXBsYXRlVHlwZSgpOiBUZW1wbGF0ZVR5cGUge1xuXHRcdHJldHVybiB0aGlzLm1hbmlmZXN0V3JhcHBlci5nZXRUZW1wbGF0ZVR5cGUoKTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSB0aGUgY29udmVydGVkIHR5cGVzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCBjb252ZXJ0ZWQgdHlwZXNcblx0ICovXG5cdGdldENvbnZlcnRlZFR5cGVzKCk6IENvbnZlcnRlZE1ldGFkYXRhIHtcblx0XHRyZXR1cm4gdGhpcy5jb252ZXJ0ZWRUeXBlcztcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXRyaWV2ZSBhIHJlbGF0aXZlIGFubm90YXRpb24gcGF0aCBiZXR3ZWVuIGFuIGFubm90YXRpb24gcGF0aCBhbmQgYW4gZW50aXR5IHR5cGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBhbm5vdGF0aW9uUGF0aFxuXHQgKiBAcGFyYW0gZW50aXR5VHlwZVxuXHQgKiBAcmV0dXJucyBUaGUgcmVsYXRpdmUgYW5udG90YXRpb24gcGF0aC5cblx0ICovXG5cdGdldFJlbGF0aXZlQW5ub3RhdGlvblBhdGgoYW5ub3RhdGlvblBhdGg6IHN0cmluZywgZW50aXR5VHlwZTogRW50aXR5VHlwZSk6IHN0cmluZyB7XG5cdFx0cmV0dXJuIGFubm90YXRpb25QYXRoLnJlcGxhY2UoZW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWUsIFwiXCIpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFRyYW5zZm9ybSBhbiBlbnRpdHlUeXBlIGJhc2VkIHBhdGggdG8gYW4gZW50aXR5U2V0IGJhc2VkIG9uZSAodWk1IHRlbXBsYXRpbmcgZ2VuZXJhbGx5IGV4cGVjdCBhbiBlbnRpdHlTZXRCYXNlZFBhdGgpLlxuXHQgKlxuXHQgKiBAcGFyYW0gYW5ub3RhdGlvblBhdGhcblx0ICogQHJldHVybnMgVGhlIEVudGl0eVNldCBiYXNlZCBhbm5vdGF0aW9uIHBhdGhcblx0ICovXG5cdGdldEVudGl0eVNldEJhc2VkQW5ub3RhdGlvblBhdGgoYW5ub3RhdGlvblBhdGg6IHN0cmluZyk6IHN0cmluZyB7XG5cdFx0aWYgKCFhbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0cmV0dXJuIGFubm90YXRpb25QYXRoO1xuXHRcdH1cblx0XHRjb25zdCBlbnRpdHlUeXBlRlFOID0gdGhpcy50YXJnZXREYXRhTW9kZWxQYXRoLnRhcmdldEVudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lO1xuXHRcdGlmIChcblx0XHRcdHRoaXMudGFyZ2V0RGF0YU1vZGVsUGF0aC50YXJnZXRFbnRpdHlTZXQgfHxcblx0XHRcdCgodGhpcy5iYXNlQ29udGV4dFBhdGguc3RhcnRzV2l0aChcIi9cIikgJiYgdGhpcy5iYXNlQ29udGV4dFBhdGgubWF0Y2goL1xcLy9nKSkgfHwgW10pLmxlbmd0aCA+IDFcblx0XHQpIHtcblx0XHRcdGxldCByZXBsYWNlZEFubm90YXRpb25QYXRoID0gYW5ub3RhdGlvblBhdGgucmVwbGFjZShlbnRpdHlUeXBlRlFOLCBcIi9cIik7XG5cdFx0XHRpZiAocmVwbGFjZWRBbm5vdGF0aW9uUGF0aC5sZW5ndGggPiAyICYmIHJlcGxhY2VkQW5ub3RhdGlvblBhdGhbMF0gPT09IFwiL1wiICYmIHJlcGxhY2VkQW5ub3RhdGlvblBhdGhbMV0gPT09IFwiL1wiKSB7XG5cdFx0XHRcdHJlcGxhY2VkQW5ub3RhdGlvblBhdGggPSByZXBsYWNlZEFubm90YXRpb25QYXRoLnN1YnN0cigxKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiB0aGlzLmJhc2VDb250ZXh0UGF0aCArIChyZXBsYWNlZEFubm90YXRpb25QYXRoLnN0YXJ0c1dpdGgoXCIvXCIpID8gcmVwbGFjZWRBbm5vdGF0aW9uUGF0aCA6IGAvJHtyZXBsYWNlZEFubm90YXRpb25QYXRofWApO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gYC8ke2Fubm90YXRpb25QYXRofWA7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIHRoZSBtYW5pZmVzdCB3cmFwcGVyIGZvciB0aGUgY3VycmVudCBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCBtYW5pZmVzdCB3cmFwcGVyXG5cdCAqL1xuXHRnZXRNYW5pZmVzdFdyYXBwZXIoKTogTWFuaWZlc3RXcmFwcGVyIHtcblx0XHRyZXR1cm4gdGhpcy5tYW5pZmVzdFdyYXBwZXI7XG5cdH1cblxuXHRnZXREaWFnbm9zdGljcygpOiBJRGlhZ25vc3RpY3Mge1xuXHRcdHJldHVybiB0aGlzLmRpYWdub3N0aWNzO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIHRoZSB0YXJnZXQgZnJvbSBhbiBhYnNvbHV0ZSBwYXRoLlxuXHQgKlxuXHQgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCB3ZSB3YW50IHRvIGdldCB0aGUgdGFyZ2V0XG5cdCAqIEByZXR1cm5zIFRoZSBhYnNvbHV0ZSBwYXRoXG5cdCAqL1xuXHRyZXNvbHZlQWJzb2x1dGVQYXRoPFQ+KHBhdGg6IHN0cmluZyk6IFJlc29sdXRpb25UYXJnZXQ8VD4ge1xuXHRcdHJldHVybiB0aGlzLmNvbnZlcnRlZFR5cGVzLnJlc29sdmVQYXRoKHBhdGgpO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHJpZXZlIGEgbmV3IGNvbnZlcnRlciBjb250ZXh0LCBzY29wZWQgZm9yIGEgZGlmZmVyZW50IGNvbnRleHQgcGF0aC5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRQYXRoIFRoZSBwYXRoIHdlIHdhbnQgdG8gb3JjaGVzdHJhdGUgdGhlIGNvbnZlcnRlciBjb250ZXh0IGFyb3VuZFxuXHQgKiBAcmV0dXJucyBUaGUgY29udmVydGVkIGNvbnRleHQgZm9yIHRoZSBzdWIgcGF0aFxuXHQgKi9cblx0Z2V0Q29udmVydGVyQ29udGV4dEZvcjxUPihjb250ZXh0UGF0aDogc3RyaW5nKTogQ29udmVydGVyQ29udGV4dCB7XG5cdFx0Y29uc3QgcmVzb2x2ZWRNZXRhUGF0aDogUmVzb2x1dGlvblRhcmdldDxUPiA9IHRoaXMuY29udmVydGVkVHlwZXMucmVzb2x2ZVBhdGgoY29udGV4dFBhdGgpO1xuXHRcdGNvbnN0IHRhcmdldFBhdGggPSBnZXREYXRhTW9kZWxQYXRoRm9yRW50aXR5U2V0KHJlc29sdmVkTWV0YVBhdGgsIHRoaXMuY29udmVydGVkVHlwZXMpO1xuXHRcdHJldHVybiBuZXcgQ29udmVydGVyQ29udGV4dCh0aGlzLmNvbnZlcnRlZFR5cGVzLCB0aGlzLm1hbmlmZXN0U2V0dGluZ3MsIHRoaXMuZGlhZ25vc3RpY3MsIHRoaXMubWVyZ2VGbiwgdGFyZ2V0UGF0aCk7XG5cdH1cblxuXHQvKipcblx0ICogR2V0IGFsbCBhbm5vdGF0aW9ucyBvZiBhIGdpdmVuIHRlcm0gYW5kIHZvY2FidWxhcnkgb24gYW4gZW50aXR5IHR5cGVcblx0ICogKG9yIG9uIHRoZSBjdXJyZW50IGVudGl0eSB0eXBlIGlmIGVudGl0eVR5cGUgaXNuJ3Qgc3BlY2lmaWVkKS5cblx0ICpcblx0ICogQHBhcmFtIHZvY2FidWxhcnlOYW1lXG5cdCAqIEBwYXJhbSBhbm5vdGF0aW9uVGVybVxuXHQgKiBAcGFyYW0gW2Fubm90YXRpb25Tb3VyY2VzXVxuXHQgKiBAcmV0dXJucyBBbGwgdGhlIGFubm90YXRpb24gZm9yIGEgc3BlY2lmaWMgdGVybSBhbmQgdm9jYWJ1bGFyeSBmcm9tIGFuIGVudGl0eSB0eXBlXG5cdCAqL1xuXHRnZXRBbm5vdGF0aW9uc0J5VGVybShcblx0XHR2b2NhYnVsYXJ5TmFtZToga2V5b2YgRW50aXR5VHlwZUFubm90YXRpb25zLFxuXHRcdGFubm90YXRpb25UZXJtOiBzdHJpbmcsXG5cdFx0YW5ub3RhdGlvblNvdXJjZXM6IChTZXJ2aWNlT2JqZWN0IHwgdW5kZWZpbmVkKVtdID0gW3RoaXMuZ2V0RW50aXR5VHlwZSgpXVxuXHQpOiBBbm5vdGF0aW9uVGVybTxhbnk+W10ge1xuXHRcdGxldCBvdXRBbm5vdGF0aW9uczogQW5ub3RhdGlvblRlcm08YW55PltdID0gW107XG5cdFx0YW5ub3RhdGlvblNvdXJjZXMuZm9yRWFjaCgoYW5ub3RhdGlvblNvdXJjZSkgPT4ge1xuXHRcdFx0aWYgKGFubm90YXRpb25Tb3VyY2UpIHtcblx0XHRcdFx0Y29uc3QgYW5ub3RhdGlvbnM6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25UZXJtPGFueT4+ID0gYW5ub3RhdGlvblNvdXJjZT8uYW5ub3RhdGlvbnNbdm9jYWJ1bGFyeU5hbWVdIHx8IHt9O1xuXHRcdFx0XHRpZiAoYW5ub3RhdGlvbnMpIHtcblx0XHRcdFx0XHRvdXRBbm5vdGF0aW9ucyA9IE9iamVjdC5rZXlzKGFubm90YXRpb25zKVxuXHRcdFx0XHRcdFx0LmZpbHRlcigoYW5ub3RhdGlvbikgPT4gYW5ub3RhdGlvbnNbYW5ub3RhdGlvbl0udGVybSA9PT0gYW5ub3RhdGlvblRlcm0pXG5cdFx0XHRcdFx0XHQucmVkdWNlKChwcmV2aW91c1ZhbHVlOiBBbm5vdGF0aW9uVGVybTxhbnk+W10sIGtleTogc3RyaW5nKSA9PiB7XG5cdFx0XHRcdFx0XHRcdHByZXZpb3VzVmFsdWUucHVzaChhbm5vdGF0aW9uc1trZXldKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHByZXZpb3VzVmFsdWU7XG5cdFx0XHRcdFx0XHR9LCBvdXRBbm5vdGF0aW9ucyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0XHRyZXR1cm4gb3V0QW5ub3RhdGlvbnM7XG5cdH1cblxuXHQvKipcblx0ICogUmV0cmlldmVzIHRoZSByZWxhdGl2ZSBtb2RlbCBwYXRoIGJhc2VkIG9uIHRoZSBjdXJyZW50IGNvbnRleHQgcGF0aC5cblx0ICpcblx0ICogQHJldHVybnMgVGhlIHJlbGF0aXZlIG1vZGVsIHBhdGggb3IgdW5kZWZpbmVkIGlmIHRoZSBwYXRoIGlzIG5vdCByZXNvbHZlYWJsZVxuXHQgKi9cblx0Z2V0UmVsYXRpdmVNb2RlbFBhdGhGdW5jdGlvbigpOiBGdW5jdGlvbiB7XG5cdFx0Y29uc3QgdGFyZ2V0RGF0YU1vZGVsUGF0aCA9IHRoaXMudGFyZ2V0RGF0YU1vZGVsUGF0aDtcblx0XHRyZXR1cm4gZnVuY3Rpb24gKHNQYXRoOiBzdHJpbmcpIHtcblx0XHRcdGNvbnN0IGVuaGFuY2VkUGF0aCA9IGVuaGFuY2VEYXRhTW9kZWxQYXRoKHRhcmdldERhdGFNb2RlbFBhdGgsIHNQYXRoKTtcblx0XHRcdHJldHVybiBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoKGVuaGFuY2VkUGF0aCwgdHJ1ZSk7XG5cdFx0fTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDcmVhdGUgdGhlIGNvbnZlcnRlciBjb250ZXh0IG5lY2Vzc2FyeSBmb3IgYSBtYWNybyBiYXNlZCBvbiBhIG1ldGFtb2RlbCBjb250ZXh0LlxuXHQgKlxuXHQgKiBAcGFyYW0gc0VudGl0eVNldE5hbWVcblx0ICogQHBhcmFtIG9NZXRhTW9kZWxDb250ZXh0XG5cdCAqIEBwYXJhbSBkaWFnbm9zdGljc1xuXHQgKiBAcGFyYW0gbWVyZ2VGblxuXHQgKiBAcGFyYW0gdGFyZ2V0RGF0YU1vZGVsUGF0aFxuXHQgKiBAcGFyYW0gbWFuaWZlc3RTZXR0aW5nc1xuXHQgKiBAcmV0dXJucyBUaGUgY3VycmVudCBjb252ZXJ0ZXIgY29udGV4dFxuXHQgKi9cblx0c3RhdGljIGNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyhcblx0XHRzRW50aXR5U2V0TmFtZTogc3RyaW5nLFxuXHRcdG9NZXRhTW9kZWxDb250ZXh0OiBDb250ZXh0IHwgT0RhdGFNZXRhTW9kZWwsXG5cdFx0ZGlhZ25vc3RpY3M6IElEaWFnbm9zdGljcyxcblx0XHRtZXJnZUZuOiBGdW5jdGlvbixcblx0XHR0YXJnZXREYXRhTW9kZWxQYXRoOiBEYXRhTW9kZWxPYmplY3RQYXRoIHwgdW5kZWZpbmVkLFxuXHRcdG1hbmlmZXN0U2V0dGluZ3M6IEJhc2VNYW5pZmVzdFNldHRpbmdzID0ge30gYXMgQmFzZU1hbmlmZXN0U2V0dGluZ3Ncblx0KTogQ29udmVydGVyQ29udGV4dCB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwgPSBvTWV0YU1vZGVsQ29udGV4dC5pc0EoXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFNZXRhTW9kZWxcIilcblx0XHRcdD8gKG9NZXRhTW9kZWxDb250ZXh0IGFzIE9EYXRhTWV0YU1vZGVsKVxuXHRcdFx0OiAoKG9NZXRhTW9kZWxDb250ZXh0IGFzIENvbnRleHQpLmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwpO1xuXHRcdGNvbnN0IG9Db252ZXJ0ZWRNZXRhZGF0YSA9IGNvbnZlcnRUeXBlcyhvTWV0YU1vZGVsKTtcblx0XHRsZXQgdGFyZ2V0RW50aXR5U2V0OiBTaW5nbGV0b24gfCBFbnRpdHlTZXQgPSBvQ29udmVydGVkTWV0YWRhdGEuZW50aXR5U2V0cy5maW5kKFxuXHRcdFx0KGVudGl0eVNldCkgPT4gZW50aXR5U2V0Lm5hbWUgPT09IHNFbnRpdHlTZXROYW1lXG5cdFx0KSBhcyBFbnRpdHlTZXQ7XG5cdFx0aWYgKCF0YXJnZXRFbnRpdHlTZXQpIHtcblx0XHRcdHRhcmdldEVudGl0eVNldCA9IG9Db252ZXJ0ZWRNZXRhZGF0YS5zaW5nbGV0b25zLmZpbmQoKGVudGl0eVNldCkgPT4gZW50aXR5U2V0Lm5hbWUgPT09IHNFbnRpdHlTZXROYW1lKSBhcyBTaW5nbGV0b247XG5cdFx0fVxuXHRcdGlmICghdGFyZ2V0RGF0YU1vZGVsUGF0aCB8fCB0YXJnZXRFbnRpdHlTZXQgIT09IHRhcmdldERhdGFNb2RlbFBhdGguc3RhcnRpbmdFbnRpdHlTZXQpIHtcblx0XHRcdHRhcmdldERhdGFNb2RlbFBhdGggPSB7XG5cdFx0XHRcdHN0YXJ0aW5nRW50aXR5U2V0OiB0YXJnZXRFbnRpdHlTZXQsXG5cdFx0XHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzOiBbXSxcblx0XHRcdFx0dGFyZ2V0RW50aXR5U2V0OiB0YXJnZXRFbnRpdHlTZXQsXG5cdFx0XHRcdHRhcmdldEVudGl0eVR5cGU6IHRhcmdldEVudGl0eVNldC5lbnRpdHlUeXBlLFxuXHRcdFx0XHR0YXJnZXRPYmplY3Q6IHRhcmdldEVudGl0eVNldCxcblx0XHRcdFx0Y29udmVydGVkVHlwZXM6IG9Db252ZXJ0ZWRNZXRhZGF0YVxuXHRcdFx0fTtcblx0XHR9XG5cdFx0cmV0dXJuIG5ldyBDb252ZXJ0ZXJDb250ZXh0KG9Db252ZXJ0ZWRNZXRhZGF0YSwgbWFuaWZlc3RTZXR0aW5ncywgZGlhZ25vc3RpY3MsIG1lcmdlRm4sIHRhcmdldERhdGFNb2RlbFBhdGgpO1xuXHR9XG59XG5cbmV4cG9ydCBkZWZhdWx0IENvbnZlcnRlckNvbnRleHQ7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7OztFQTJCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDQSxJQUFNQSxnQkFBZ0IsR0FBRyxVQUFVQyxlQUE2QyxFQUEwQztJQUN6SCxPQUFPLE9BQU9BLGVBQWUsS0FBSyxRQUFRO0VBQzNDLENBQUM7RUFFRCxTQUFTQyxlQUFlLENBQUNDLFVBQXNDLEVBQStCO0lBQzdGLE9BQU9BLFVB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