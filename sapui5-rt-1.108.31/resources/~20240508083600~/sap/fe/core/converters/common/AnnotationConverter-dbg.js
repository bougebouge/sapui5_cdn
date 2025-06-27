/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
 sap.ui.define([], function() {
    /*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
"use strict";

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableRest(); }
function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
var AnnotationConverter;
/******/
(function () {
  // webpackBootstrap
  /******/
  "use strict";

  /******/
  var __webpack_modules__ = {
    /***/830: /***/function (__unused_webpack_module, exports, __webpack_require__) {
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.convert = void 0;
      var utils_1 = __webpack_require__(716);
      /**
       *
       */
      var Path =
      /**
       * @param pathExpression
       * @param targetName
       * @param annotationsTerm
       * @param term
       */
      function Path(pathExpression, targetName, annotationsTerm, term) {
        this.path = pathExpression.Path;
        this.type = 'Path';
        this.$target = targetName;
        this.term = term;
        this.annotationsTerm = annotationsTerm;
      };
      /**
       * Creates a Map based on the fullyQualifiedName of each object part of the metadata.
       *
       * @param rawMetadata the rawMetadata we're working against
       * @returns the objectmap for easy access to the different object of the metadata
       */
      function buildObjectMap(rawMetadata) {
        var _a;
        var objectMap = {};
        if ((_a = rawMetadata.schema.entityContainer) === null || _a === void 0 ? void 0 : _a.fullyQualifiedName) {
          objectMap[rawMetadata.schema.entityContainer.fullyQualifiedName] = rawMetadata.schema.entityContainer;
        }
        rawMetadata.schema.entitySets.forEach(function (entitySet) {
          objectMap[entitySet.fullyQualifiedName] = entitySet;
        });
        rawMetadata.schema.singletons.forEach(function (singleton) {
          objectMap[singleton.fullyQualifiedName] = singleton;
        });
        rawMetadata.schema.actions.forEach(function (action) {
          objectMap[action.fullyQualifiedName] = action;
          if (action.isBound) {
            var unBoundActionName = action.fullyQualifiedName.split('(')[0];
            if (!objectMap[unBoundActionName]) {
              objectMap[unBoundActionName] = {
                _type: 'UnboundGenericAction',
                actions: []
              };
            }
            objectMap[unBoundActionName].actions.push(action);
            var actionSplit = action.fullyQualifiedName.split('(');
            objectMap["".concat(actionSplit[1].split(')')[0], "/").concat(actionSplit[0])] = action;
          }
          action.parameters.forEach(function (parameter) {
            objectMap[parameter.fullyQualifiedName] = parameter;
          });
        });
        rawMetadata.schema.complexTypes.forEach(function (complexType) {
          objectMap[complexType.fullyQualifiedName] = complexType;
          complexType.properties.forEach(function (property) {
            objectMap[property.fullyQualifiedName] = property;
          });
        });
        rawMetadata.schema.typeDefinitions.forEach(function (typeDefinition) {
          objectMap[typeDefinition.fullyQualifiedName] = typeDefinition;
        });
        rawMetadata.schema.entityTypes.forEach(function (entityType) {
          entityType.annotations = {}; // 'annotations' property is mandatory
          objectMap[entityType.fullyQualifiedName] = entityType;
          objectMap["Collection(".concat(entityType.fullyQualifiedName, ")")] = entityType;
          entityType.entityProperties.forEach(function (property) {
            objectMap[property.fullyQualifiedName] = property;
            // Handle complex types
            var complexTypeDefinition = objectMap[property.type];
            if ((0, utils_1.isComplexTypeDefinition)(complexTypeDefinition)) {
              complexTypeDefinition.properties.forEach(function (complexTypeProp) {
                var complexTypePropTarget = Object.assign(complexTypeProp, {
                  _type: 'Property',
                  fullyQualifiedName: property.fullyQualifiedName + '/' + complexTypeProp.name
                });
                objectMap[complexTypePropTarget.fullyQualifiedName] = complexTypePropTarget;
              });
            }
          });
          entityType.navigationProperties.forEach(function (navProperty) {
            objectMap[navProperty.fullyQualifiedName] = navProperty;
          });
        });
        Object.keys(rawMetadata.schema.annotations).forEach(function (annotationSource) {
          rawMetadata.schema.annotations[annotationSource].forEach(function (annotationList) {
            var currentTargetName = (0, utils_1.unalias)(rawMetadata.references, annotationList.target);
            annotationList.annotations.forEach(function (annotation) {
              var annotationFQN = "".concat(currentTargetName, "@").concat((0, utils_1.unalias)(rawMetadata.references, annotation.term));
              if (annotation.qualifier) {
                annotationFQN += "#".concat(annotation.qualifier);
              }
              objectMap[annotationFQN] = annotation;
              annotation.fullyQualifiedName = annotationFQN;
            });
          });
        });
        return objectMap;
      }
      /**
       * Combine two strings representing path in the metamodel while ensuring their specificities (annotation...) are respected.
       *
       * @param currentTarget the current path
       * @param path the part we want to append
       * @returns the complete path including the extension.
       */
      function combinePath(currentTarget, path) {
        if (path.startsWith('@')) {
          return currentTarget + (0, utils_1.unalias)(utils_1.defaultReferences, path);
        } else {
          return currentTarget + '/' + path;
        }
      }
      var ALL_ANNOTATION_ERRORS = {};
      var ANNOTATION_ERRORS = [];
      /**
       * @param path
       * @param oErrorMsg
       */
      function addAnnotationErrorMessage(path, oErrorMsg) {
        if (!ALL_ANNOTATION_ERRORS[path]) {
          ALL_ANNOTATION_ERRORS[path] = [oErrorMsg];
        } else {
          ALL_ANNOTATION_ERRORS[path].push(oErrorMsg);
        }
      }
      /**
       * Resolves a specific path based on the objectMap.
       *
       * @param objectMap
       * @param currentTarget
       * @param path
       * @param pathOnly
       * @param includeVisitedObjects
       * @param annotationsTerm
       * @returns the resolved object
       */
      function _resolveTarget(objectMap, currentTarget, path) {
        var pathOnly = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
        var includeVisitedObjects = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
        var annotationsTerm = arguments.length > 5 ? arguments[5] : undefined;
        var oErrorMsg;
        if (!path) {
          return undefined;
        }
        var aVisitedObjects = [];
        if (currentTarget && currentTarget._type === 'Property') {
          currentTarget = objectMap[currentTarget.fullyQualifiedName.split('/')[0]];
        }
        path = combinePath(currentTarget.fullyQualifiedName, path);
        var pathSplit = path.split('/');
        var targetPathSplit = [];
        pathSplit.forEach(function (pathPart) {
          // Separate out the annotation
          if (pathPart.indexOf('@') !== -1) {
            var _pathPart$split = pathPart.split('@'),
              _pathPart$split2 = _slicedToArray(_pathPart$split, 2),
              splittedPath = _pathPart$split2[0],
              annotationPath = _pathPart$split2[1];
            targetPathSplit.push(splittedPath);
            targetPathSplit.push("@".concat(annotationPath));
          } else {
            targetPathSplit.push(pathPart);
          }
        });
        var currentPath = path;
        var currentContext = currentTarget;
        var target = targetPathSplit.reduce(function (currentValue, pathPart) {
          if (pathPart === '$Type' && currentValue._type === 'EntityType') {
            return currentValue;
          }
          if (pathPart === '$' && currentValue._type === 'EntitySet') {
            return currentValue;
          }
          if ((pathPart === '@$ui5.overload' || pathPart === '0') && currentValue._type === 'Action') {
            return currentValue;
          }
          if (pathPart.length === 0) {
            // Empty Path after an entitySet means entityType
            if (currentValue && (currentValue._type === 'EntitySet' || currentValue._type === 'Singleton') && currentValue.entityType) {
              if (includeVisitedObjects) {
                aVisitedObjects.push(currentValue);
              }
              currentValue = currentValue.entityType;
            }
            if (currentValue && currentValue._type === 'NavigationProperty' && currentValue.targetType) {
              if (includeVisitedObjects) {
                aVisitedObjects.push(currentValue);
              }
              currentValue = currentValue.targetType;
            }
            return currentValue;
          }
          if (includeVisitedObjects && currentValue !== null && currentValue !== undefined) {
            aVisitedObjects.push(currentValue);
          }
          if (!currentValue) {
            currentPath = pathPart;
          } else if ((currentValue._type === 'EntitySet' || currentValue._type === 'Singleton') && pathPart === '$Type') {
            currentValue = currentValue.targetType;
            return currentValue;
          } else if ((currentValue._type === 'EntitySet' || currentValue._type === 'Singleton') && pathPart === '$NavigationPropertyBinding') {
            currentValue = currentValue.navigationPropertyBinding;
            return currentValue;
          } else if ((currentValue._type === 'EntitySet' || currentValue._type === 'Singleton') && currentValue.entityType) {
            currentPath = combinePath(currentValue.entityTypeName, pathPart);
          } else if (currentValue._type === 'NavigationProperty') {
            currentPath = combinePath(currentValue.fullyQualifiedName, pathPart);
            if (!objectMap[currentPath]) {
              // Fallback log error
              currentPath = combinePath(currentValue.targetTypeName, pathPart);
            }
          } else if (currentValue._type === 'Property') {
            // ComplexType or Property
            if (currentValue.targetType) {
              currentPath = combinePath(currentValue.targetType.fullyQualifiedName, pathPart);
            } else {
              currentPath = combinePath(currentValue.fullyQualifiedName, pathPart);
            }
          } else if (currentValue._type === 'Action' && currentValue.isBound) {
            currentPath = combinePath(currentValue.fullyQualifiedName, pathPart);
            if (pathPart === '$Parameter') {
              return currentValue.parameters;
            }
            if (!objectMap[currentPath]) {
              currentPath = combinePath(currentValue.sourceType, pathPart);
            }
          } else if (currentValue._type === 'ActionParameter') {
            currentPath = combinePath(currentTarget.fullyQualifiedName.substring(0, currentTarget.fullyQualifiedName.lastIndexOf('/')), pathPart);
            if (!objectMap[currentPath]) {
              var lastIdx = currentTarget.fullyQualifiedName.lastIndexOf('/');
              if (lastIdx === -1) {
                lastIdx = currentTarget.fullyQualifiedName.length;
              }
              currentPath = combinePath(objectMap[currentTarget.fullyQualifiedName.substring(0, lastIdx)].sourceType, pathPart);
            }
          } else {
            currentPath = combinePath(currentValue.fullyQualifiedName, pathPart);
            if (pathPart !== 'name' && currentValue[pathPart] !== undefined) {
              return currentValue[pathPart];
            } else if (pathPart === '$AnnotationPath' && currentValue.$target) {
              var contextToResolve = objectMap[currentValue.fullyQualifiedName.split('@')[0]];
              var subTarget = _resolveTarget(objectMap, contextToResolve, currentValue.value, false, true);
              subTarget.visitedObjects.forEach(function (visitedSubObject) {
                if (aVisitedObjects.indexOf(visitedSubObject) === -1) {
                  aVisitedObjects.push(visitedSubObject);
                }
              });
              return subTarget.target;
            } else if (pathPart === '$Path' && currentValue.$target) {
              currentContext = aVisitedObjects.concat().reverse().find(function (obj) {
                return obj._type === 'EntityType' || obj._type === 'EntitySet' || obj._type === 'Singleton' || obj._type === 'NavigationProperty';
              });
              if (currentContext) {
                var _subTarget = _resolveTarget(objectMap, currentContext, currentValue.path, false, true);
                _subTarget.visitedObjects.forEach(function (visitedSubObject) {
                  if (aVisitedObjects.indexOf(visitedSubObject) === -1) {
                    aVisitedObjects.push(visitedSubObject);
                  }
                });
                return _subTarget.target;
              }
              return currentValue.$target;
            } else if (pathPart.startsWith('$Path') && currentValue.$target) {
              var intermediateTarget = currentValue.$target;
              currentPath = combinePath(intermediateTarget.fullyQualifiedName, pathPart.substring(5));
            } else if (currentValue.hasOwnProperty('$Type') && !objectMap[currentPath]) {
              // This is now an annotation value
              var entityType = objectMap[currentValue.fullyQualifiedName.split('@')[0]];
              if (entityType) {
                currentPath = combinePath(entityType.fullyQualifiedName, pathPart);
              }
            }
          }
          return objectMap[currentPath];
        }, null);
        if (!target) {
          if (annotationsTerm) {
            var annotationType = inferTypeFromTerm(annotationsTerm, currentTarget);
            oErrorMsg = {
              message: 'Unable to resolve the path expression: ' + '\n' + path + '\n' + '\n' + 'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' + '<Annotation Term = ' + annotationsTerm + '>' + '\n' + '<Record Type = ' + annotationType + '>' + '\n' + '<AnnotationPath = ' + path + '>'
            };
            addAnnotationErrorMessage(path, oErrorMsg);
          } else {
            oErrorMsg = {
              message: 'Unable to resolve the path expression: ' + path + '\n' + '\n' + 'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' + '<Annotation Term = ' + pathSplit[0] + '>' + '\n' + '<PropertyValue  Path= ' + pathSplit[1] + '>'
            };
            addAnnotationErrorMessage(path, oErrorMsg);
          }
        }
        if (pathOnly) {
          return currentPath;
        }
        if (includeVisitedObjects) {
          return {
            visitedObjects: aVisitedObjects,
            target: target
          };
        }
        return target;
      }
      /**
       * Typeguard to check if the path contains an annotation.
       *
       * @param pathStr the path to evaluate
       * @returns true if there is an annotation in the path.
       */
      function isAnnotationPath(pathStr) {
        return pathStr.indexOf('@') !== -1;
      }
      function parseValue(propertyValue, valueFQN, objectMap, context) {
        if (propertyValue === undefined) {
          return undefined;
        }
        switch (propertyValue.type) {
          case 'String':
            return propertyValue.String;
          case 'Int':
            return propertyValue.Int;
          case 'Bool':
            return propertyValue.Bool;
          case 'Decimal':
            return (0, utils_1.Decimal)(propertyValue.Decimal);
          case 'Date':
            return propertyValue.Date;
          case 'EnumMember':
            return (0, utils_1.alias)(context.rawMetadata.references, propertyValue.EnumMember);
          case 'PropertyPath':
            return {
              type: 'PropertyPath',
              value: propertyValue.PropertyPath,
              fullyQualifiedName: valueFQN,
              $target: _resolveTarget(objectMap, context.currentTarget, propertyValue.PropertyPath, false, false, context.currentTerm)
            };
          case 'NavigationPropertyPath':
            return {
              type: 'NavigationPropertyPath',
              value: propertyValue.NavigationPropertyPath,
              fullyQualifiedName: valueFQN,
              $target: _resolveTarget(objectMap, context.currentTarget, propertyValue.NavigationPropertyPath, false, false, context.currentTerm)
            };
          case 'AnnotationPath':
            var annotationTarget = _resolveTarget(objectMap, context.currentTarget, (0, utils_1.unalias)(context.rawMetadata.references, propertyValue.AnnotationPath), true, false, context.currentTerm);
            var annotationPath = {
              type: 'AnnotationPath',
              value: propertyValue.AnnotationPath,
              fullyQualifiedName: valueFQN,
              $target: annotationTarget,
              annotationsTerm: context.currentTerm,
              term: '',
              path: ''
            };
            context.unresolvedAnnotations.push({
              inline: false,
              toResolve: annotationPath
            });
            return annotationPath;
          case 'Path':
            var $target = _resolveTarget(objectMap, context.currentTarget, propertyValue.Path, true, false, context.currentTerm);
            var path = new Path(propertyValue, $target, context.currentTerm, '');
            context.unresolvedAnnotations.push({
              inline: isAnnotationPath(propertyValue.Path),
              toResolve: path
            });
            return path;
          case 'Record':
            return parseRecord(propertyValue.Record, valueFQN, objectMap, context);
          case 'Collection':
            return parseCollection(propertyValue.Collection, valueFQN, objectMap, context);
          case 'Apply':
          case 'Null':
          case 'Not':
          case 'Eq':
          case 'Ne':
          case 'Gt':
          case 'Ge':
          case 'Lt':
          case 'Le':
          case 'If':
          case 'And':
          case 'Or':
          default:
            return propertyValue;
        }
      }
      /**
       * Infer the type of a term based on its type.
       *
       * @param annotationsTerm The annotation term
       * @param annotationTarget the annotation target
       * @returns the inferred type.
       */
      function inferTypeFromTerm(annotationsTerm, annotationTarget) {
        var targetType = utils_1.TermToTypes[annotationsTerm];
        var oErrorMsg = {
          isError: false,
          message: "The type of the record used within the term ".concat(annotationsTerm, " was not defined and was inferred as ").concat(targetType, ".\nHint: If possible, try to maintain the Type property for each Record.\n<Annotations Target=\"").concat(annotationTarget, "\">\n\t<Annotation Term=\"").concat(annotationsTerm, "\">\n\t\t<Record>...</Record>\n\t</Annotation>\n</Annotations>")
        };
        addAnnotationErrorMessage(annotationTarget + '/' + annotationsTerm, oErrorMsg);
        return targetType;
      }
      function isDataFieldWithForAction(annotationContent, annotationTerm) {
        return annotationContent.hasOwnProperty('Action') && (annotationTerm.$Type === 'com.sap.vocabularies.UI.v1.DataFieldForAction' || annotationTerm.$Type === 'com.sap.vocabularies.UI.v1.DataFieldWithAction');
      }
      function parseRecordType(recordDefinition, context) {
        var targetType;
        if (!recordDefinition.type && context.currentTerm) {
          targetType = inferTypeFromTerm(context.currentTerm, context.currentTarget.fullyQualifiedName);
        } else {
          targetType = (0, utils_1.unalias)(context.rawMetadata.references, recordDefinition.type);
        }
        return targetType;
      }
      function parseRecord(recordDefinition, currentFQN, objectMap, context) {
        var targetType = parseRecordType(recordDefinition, context);
        var annotationTerm = {
          $Type: targetType,
          fullyQualifiedName: currentFQN,
          annotations: {}
        };
        var annotationContent = {};
        if (Array.isArray(recordDefinition.annotations)) {
          var subAnnotationList = {
            target: currentFQN,
            annotations: recordDefinition.annotations,
            __source: context.currentSource
          };
          context.additionalAnnotations.push(subAnnotationList);
        }
        if (recordDefinition.propertyValues) {
          recordDefinition.propertyValues.forEach(function (propertyValue) {
            annotationContent[propertyValue.name] = parseValue(propertyValue.value, "".concat(currentFQN, "/").concat(propertyValue.name), objectMap, context);
            if (Array.isArray(propertyValue.annotations)) {
              var _subAnnotationList = {
                target: "".concat(currentFQN, "/").concat(propertyValue.name),
                annotations: propertyValue.annotations,
                __source: context.currentSource
              };
              context.additionalAnnotations.push(_subAnnotationList);
            }
            if (isDataFieldWithForAction(annotationContent, annotationTerm)) {
              annotationContent.ActionTarget = context.currentTarget.actions && context.currentTarget.actions[annotationContent.Action] || objectMap[annotationContent.Action];
              if (!annotationContent.ActionTarget) {
                // Add to diagnostics debugger;
                ANNOTATION_ERRORS.push({
                  message: 'Unable to resolve the action ' + annotationContent.Action + ' defined for ' + annotationTerm.fullyQualifiedName
                });
              }
            }
          });
        }
        return Object.assign(annotationTerm, annotationContent);
      }
      /**
       * Retrieve or infer the collection type based on its content.
       *
       * @param collectionDefinition
       * @returns the type of the collection
       */
      function getOrInferCollectionType(collectionDefinition) {
        var type = collectionDefinition.type;
        if (type === undefined && collectionDefinition.length > 0) {
          var firstColItem = collectionDefinition[0];
          if (firstColItem.hasOwnProperty('PropertyPath')) {
            type = 'PropertyPath';
          } else if (firstColItem.hasOwnProperty('Path')) {
            type = 'Path';
          } else if (firstColItem.hasOwnProperty('AnnotationPath')) {
            type = 'AnnotationPath';
          } else if (firstColItem.hasOwnProperty('NavigationPropertyPath')) {
            type = 'NavigationPropertyPath';
          } else if (typeof firstColItem === 'object' && (firstColItem.hasOwnProperty('type') || firstColItem.hasOwnProperty('propertyValues'))) {
            type = 'Record';
          } else if (typeof firstColItem === 'string') {
            type = 'String';
          }
        } else if (type === undefined) {
          type = 'EmptyCollection';
        }
        return type;
      }
      function parseCollection(collectionDefinition, parentFQN, objectMap, context) {
        var collectionDefinitionType = getOrInferCollectionType(collectionDefinition);
        switch (collectionDefinitionType) {
          case 'PropertyPath':
            return collectionDefinition.map(function (propertyPath, propertyIdx) {
              return {
                type: 'PropertyPath',
                value: propertyPath.PropertyPath,
                fullyQualifiedName: "".concat(parentFQN, "/").concat(propertyIdx),
                $target: _resolveTarget(objectMap, context.currentTarget, propertyPath.PropertyPath, false, false, context.currentTerm)
              };
            });
          case 'Path':
            return collectionDefinition.map(function (pathValue) {
              var $target = _resolveTarget(objectMap, context.currentTarget, pathValue.Path, true, false, context.currentTerm);
              var path = new Path(pathValue, $target, context.currentTerm, '');
              context.unresolvedAnnotations.push({
                inline: isAnnotationPath(pathValue.Path),
                toResolve: path
              });
              return path;
            });
          case 'AnnotationPath':
            return collectionDefinition.map(function (annotationPath, annotationIdx) {
              var annotationTarget = _resolveTarget(objectMap, context.currentTarget, annotationPath.AnnotationPath, true, false, context.currentTerm);
              var annotationCollectionElement = {
                type: 'AnnotationPath',
                value: annotationPath.AnnotationPath,
                fullyQualifiedName: "".concat(parentFQN, "/").concat(annotationIdx),
                $target: annotationTarget,
                annotationsTerm: context.currentTerm,
                term: '',
                path: ''
              };
              context.unresolvedAnnotations.push({
                inline: false,
                toResolve: annotationCollectionElement
              });
              return annotationCollectionElement;
            });
          case 'NavigationPropertyPath':
            return collectionDefinition.map(function (navPropertyPath, navPropIdx) {
              return {
                type: 'NavigationPropertyPath',
                value: navPropertyPath.NavigationPropertyPath,
                fullyQualifiedName: "".concat(parentFQN, "/").concat(navPropIdx),
                $target: _resolveTarget(objectMap, context.currentTarget, navPropertyPath.NavigationPropertyPath, false, false, context.currentTerm)
              };
            });
          case 'Record':
            return collectionDefinition.map(function (recordDefinition, recordIdx) {
              return parseRecord(recordDefinition, "".concat(parentFQN, "/").concat(recordIdx), objectMap, context);
            });
          case 'Apply':
          case 'Null':
          case 'If':
          case 'Eq':
          case 'Ne':
          case 'Lt':
          case 'Gt':
          case 'Le':
          case 'Ge':
          case 'Not':
          case 'And':
          case 'Or':
            return collectionDefinition.map(function (ifValue) {
              return ifValue;
            });
          case 'String':
            return collectionDefinition.map(function (stringValue) {
              if (typeof stringValue === 'string') {
                return stringValue;
              } else if (stringValue === undefined) {
                return stringValue;
              } else {
                return stringValue.String;
              }
            });
          default:
            if (collectionDefinition.length === 0) {
              return [];
            }
            throw new Error('Unsupported case');
        }
      }
      function convertAnnotation(annotation, objectMap, context) {
        if (annotation.record) {
          return parseRecord(annotation.record, annotation.fullyQualifiedName, objectMap, context);
        } else if (annotation.collection === undefined) {
          if (annotation.value) {
            return parseValue(annotation.value, annotation.fullyQualifiedName, objectMap, context);
          } else {
            return true;
          }
        } else if (annotation.collection) {
          var collection = parseCollection(annotation.collection, annotation.fullyQualifiedName, objectMap, context);
          collection.fullyQualifiedName = annotation.fullyQualifiedName;
          return collection;
        } else {
          throw new Error('Unsupported case');
        }
      }
      /**
       * Creates a resolvePath function for a given entityType.
       *
       * @param entityType The entityType for which the function should be created
       * @param objectMap The current objectMap
       * @returns the resolvePath function that starts at the entityType
       */
      function createResolvePathFn(entityType, objectMap) {
        return function (relativePath, includeVisitedObjects) {
          var annotationTerm = '';
          return _resolveTarget(objectMap, entityType, relativePath, false, includeVisitedObjects, annotationTerm);
        };
      }
      function resolveV2NavigationProperty(navProp, associations, objectMap, outNavProp) {
        var targetAssociation = associations.find(function (association) {
          return association.fullyQualifiedName === navProp.relationship;
        });
        if (targetAssociation) {
          var associationEnd = targetAssociation.associationEnd.find(function (end) {
            return end.role === navProp.toRole;
          });
          if (associationEnd) {
            outNavProp.targetType = objectMap[associationEnd.type];
            outNavProp.isCollection = associationEnd.multiplicity === '*';
          }
        }
        outNavProp.referentialConstraint = navProp.referentialConstraint || [];
      }
      function resolveV4NavigationProperty(navProp, objectMap, outNavProp) {
        outNavProp.targetType = objectMap[navProp.targetTypeName];
        outNavProp.partner = navProp.partner;
        outNavProp.isCollection = navProp.isCollection;
        outNavProp.containsTarget = navProp.containsTarget;
        outNavProp.referentialConstraint = navProp.referentialConstraint;
      }
      function isV4NavigationProperty(navProp) {
        return !!navProp.targetTypeName;
      }
      function prepareNavigationProperties(navigationProperties, associations, objectMap) {
        return navigationProperties.map(function (navProp) {
          var outNavProp = {
            _type: 'NavigationProperty',
            name: navProp.name,
            fullyQualifiedName: navProp.fullyQualifiedName,
            isCollection: false,
            containsTarget: false,
            referentialConstraint: [],
            annotations: {},
            partner: '',
            targetType: undefined,
            targetTypeName: ''
          };
          if (isV4NavigationProperty(navProp)) {
            resolveV4NavigationProperty(navProp, objectMap, outNavProp);
          } else {
            resolveV2NavigationProperty(navProp, associations, objectMap, outNavProp);
          }
          if (outNavProp.targetType) {
            outNavProp.targetTypeName = outNavProp.targetType.fullyQualifiedName;
          }
          objectMap[outNavProp.fullyQualifiedName] = outNavProp;
          return outNavProp;
        });
      }
      /**
       * @param entityTypes
       * @param associations
       * @param objectMap
       */
      function resolveNavigationProperties(entityTypes, associations, objectMap) {
        entityTypes.forEach(function (entityType) {
          entityType.navigationProperties = prepareNavigationProperties(entityType.navigationProperties, associations, objectMap);
          entityType.resolvePath = createResolvePathFn(entityType, objectMap);
        });
      }
      /**
       * @param namespace
       * @param actions
       * @param objectMap
       */
      function linkActionsToEntityType(namespace, actions, objectMap) {
        actions.forEach(function (action) {
          if (!action.annotations) {
            action.annotations = {};
          }
          if (action.isBound) {
            var sourceEntityType = objectMap[action.sourceType];
            action.sourceEntityType = sourceEntityType;
            if (sourceEntityType) {
              if (!sourceEntityType.actions) {
                sourceEntityType.actions = {};
              }
              sourceEntityType.actions[action.name] = action;
              sourceEntityType.actions["".concat(namespace, ".").concat(action.name)] = action;
            }
            action.returnEntityType = objectMap[action.returnType];
          }
        });
      }
      /**
       * @param entitySets
       * @param objectMap
       * @param references
       */
      function linkEntityTypeToEntitySet(entitySets, objectMap, references) {
        entitySets.forEach(function (entitySet) {
          entitySet.entityType = objectMap[entitySet.entityTypeName];
          if (!entitySet.entityType) {
            entitySet.entityType = objectMap[(0, utils_1.unalias)(references, entitySet.entityTypeName)];
          }
          if (!entitySet.annotations) {
            entitySet.annotations = {};
          }
          if (!entitySet.entityType.annotations) {
            entitySet.entityType.annotations = {};
          }
          entitySet.entityType.keys.forEach(function (keyProp) {
            keyProp.isKey = true;
          });
        });
      }
      /**
       * @param singletons
       * @param objectMap
       * @param references
       */
      function linkEntityTypeToSingleton(singletons, objectMap, references) {
        singletons.forEach(function (singleton) {
          singleton.entityType = objectMap[singleton.entityTypeName];
          if (!singleton.entityType) {
            singleton.entityType = objectMap[(0, utils_1.unalias)(references, singleton.entityTypeName)];
          }
          if (!singleton.annotations) {
            singleton.annotations = {};
          }
          if (!singleton.entityType.annotations) {
            singleton.entityType.annotations = {};
          }
          singleton.entityType.keys.forEach(function (keyProp) {
            keyProp.isKey = true;
          });
        });
      }
      /**
       * @param entityTypes
       * @param objectMap
       */
      function linkPropertiesToComplexTypes(entityTypes, objectMap) {
        /**
         * @param property
         */
        function link(property) {
          if (!property.annotations) {
            property.annotations = {};
          }
          try {
            if (property.type.indexOf('Edm') !== 0) {
              var complexType;
              if (property.type.startsWith('Collection')) {
                var complexTypeName = property.type.substring(11, property.type.length - 1);
                complexType = objectMap[complexTypeName];
              } else {
                complexType = objectMap[property.type];
              }
              if (complexType) {
                property.targetType = complexType;
                if (complexType.properties) {
                  complexType.properties.forEach(link);
                }
              }
            }
          } catch (sError) {
            throw new Error('Property Type is not defined');
          }
        }
        entityTypes.forEach(function (entityType) {
          entityType.entityProperties.forEach(link);
        });
      }
      /**
       * @param complexTypes
       * @param associations
       * @param objectMap
       */
      function prepareComplexTypes(complexTypes, associations, objectMap) {
        complexTypes.forEach(function (complexType) {
          complexType.annotations = {};
          complexType.properties.forEach(function (property) {
            if (!property.annotations) {
              property.annotations = {};
            }
          });
          complexType.navigationProperties = prepareNavigationProperties(complexType.navigationProperties, associations, objectMap);
        });
      }
      /**
       * Split the alias from the term value.
       *
       * @param references the current set of references
       * @param termValue the value of the term
       * @returns the term alias and the actual term value
       */
      function splitTerm(references, termValue) {
        var aliasedTerm = (0, utils_1.alias)(references, termValue);
        var lastDot = aliasedTerm.lastIndexOf('.');
        var termAlias = aliasedTerm.substring(0, lastDot);
        var term = aliasedTerm.substring(lastDot + 1);
        return [termAlias, term];
      }
      /**
       * Creates the function that will resolve a specific path.
       *
       * @param convertedOutput
       * @param objectMap
       * @returns the function that will allow to resolve element globally.
       */
      function createGlobalResolve(convertedOutput, objectMap) {
        return function resolvePath(sPath) {
          var resolveDirectly = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
          if (resolveDirectly) {
            var targetPath = sPath;
            if (!sPath.startsWith('/')) {
              targetPath = "/".concat(sPath);
            }
            var targetResolution = _resolveTarget(objectMap, convertedOutput, targetPath, false, true);
            if (targetResolution.target) {
              targetResolution.visitedObjects.push(targetResolution.target);
            }
            return {
              target: targetResolution.target,
              objectPath: targetResolution.visitedObjects
            };
          }
          var aPathSplit = sPath.split('/');
          if (aPathSplit.shift() !== '') {
            throw new Error('Cannot deal with relative path');
          }
          var entitySetName = aPathSplit.shift();
          var entitySet = convertedOutput.entitySets.find(function (et) {
            return et.name === entitySetName;
          });
          var singleton = convertedOutput.singletons.find(function (et) {
            return et.name === entitySetName;
          });
          if (!entitySet && !singleton) {
            return {
              target: convertedOutput.entityContainer,
              objectPath: [convertedOutput.entityContainer]
            };
          }
          if (aPathSplit.length === 0) {
            return {
              target: entitySet || singleton,
              objectPath: [convertedOutput.entityContainer, entitySet || singleton]
            };
          } else {
            var _targetResolution = _resolveTarget(objectMap, entitySet || singleton, '/' + aPathSplit.join('/'), false, true);
            if (_targetResolution.target) {
              _targetResolution.visitedObjects.push(_targetResolution.target);
            }
            return {
              target: _targetResolution.target,
              objectPath: _targetResolution.visitedObjects
            };
          }
        };
      }
      function ensureAnnotations(currentTarget, vocAlias) {
        if (!currentTarget.annotations) {
          currentTarget.annotations = {};
        }
        if (!currentTarget.annotations[vocAlias]) {
          currentTarget.annotations[vocAlias] = {};
        }
        if (!currentTarget.annotations._annotations) {
          currentTarget.annotations._annotations = {};
        }
      }
      function processAnnotations(currentContext, annotationList, objectMap, bOverrideExisting) {
        var currentTarget = currentContext.currentTarget;
        var currentTargetName = currentTarget.fullyQualifiedName;
        annotationList.annotations.forEach(function (annotation) {
          var _a, _b;
          currentContext.currentSource = annotation.__source || annotationList.__source;
          var _splitTerm = splitTerm(utils_1.defaultReferences, annotation.term),
            _splitTerm2 = _slicedToArray(_splitTerm, 2),
            vocAlias = _splitTerm2[0],
            vocTerm = _splitTerm2[1];
          ensureAnnotations(currentTarget, vocAlias);
          var vocTermWithQualifier = "".concat(vocTerm).concat(annotation.qualifier ? '#' + annotation.qualifier : '');
          if (!bOverrideExisting && ((_b = (_a = currentTarget.annotations) === null || _a === void 0 ? void 0 : _a[vocAlias]) === null || _b === void 0 ? void 0 : _b[vocTermWithQualifier]) !== undefined) {
            return;
          }
          currentContext.currentTerm = annotation.term;
          currentTarget.annotations[vocAlias][vocTermWithQualifier] = convertAnnotation(annotation, objectMap, currentContext);
          switch (typeof currentTarget.annotations[vocAlias][vocTermWithQualifier]) {
            case 'string':
              // eslint-disable-next-line no-new-wrappers
              currentTarget.annotations[vocAlias][vocTermWithQualifier] = new String(currentTarget.annotations[vocAlias][vocTermWithQualifier]);
              break;
            case 'boolean':
              // eslint-disable-next-line no-new-wrappers
              currentTarget.annotations[vocAlias][vocTermWithQualifier] = new Boolean(currentTarget.annotations[vocAlias][vocTermWithQualifier]);
              break;
            default:
              // do nothing
              break;
          }
          if (currentTarget.annotations[vocAlias][vocTermWithQualifier] !== null && typeof currentTarget.annotations[vocAlias][vocTermWithQualifier] === 'object' && !currentTarget.annotations[vocAlias][vocTermWithQualifier].annotations) {
            currentTarget.annotations[vocAlias][vocTermWithQualifier].annotations = {};
          }
          if (currentTarget.annotations[vocAlias][vocTermWithQualifier] !== null && typeof currentTarget.annotations[vocAlias][vocTermWithQualifier] === 'object') {
            currentTarget.annotations[vocAlias][vocTermWithQualifier].term = (0, utils_1.unalias)(utils_1.defaultReferences, "".concat(vocAlias, ".").concat(vocTerm));
            currentTarget.annotations[vocAlias][vocTermWithQualifier].qualifier = annotation.qualifier;
            currentTarget.annotations[vocAlias][vocTermWithQualifier].__source = currentContext.currentSource;
          }
          var annotationTarget = "".concat(currentTargetName, "@").concat((0, utils_1.unalias)(utils_1.defaultReferences, vocAlias + '.' + vocTermWithQualifier));
          if (Array.isArray(annotation.annotations)) {
            var subAnnotationList = {
              target: annotationTarget,
              annotations: annotation.annotations,
              __source: currentContext.currentSource
            };
            currentContext.additionalAnnotations.push(subAnnotationList);
          } else if (annotation.annotations && !currentTarget.annotations[vocAlias][vocTermWithQualifier].annotations) {
            currentTarget.annotations[vocAlias][vocTermWithQualifier].annotations = annotation.annotations;
          }
          currentTarget.annotations._annotations["".concat(vocAlias, ".").concat(vocTermWithQualifier)] = currentTarget.annotations._annotations[(0, utils_1.unalias)(utils_1.defaultReferences, "".concat(vocAlias, ".").concat(vocTermWithQualifier))] = currentTarget.annotations[vocAlias][vocTermWithQualifier];
          objectMap[annotationTarget] = currentTarget.annotations[vocAlias][vocTermWithQualifier];
        });
      }
      /**
       * Process all the unresolved targets so far to try and see if they are resolveable in the end.
       *
       * @param unresolvedTargets
       * @param objectMap
       */
      function processUnresolvedTargets(unresolvedTargets, objectMap) {
        unresolvedTargets.forEach(function (resolvable) {
          var targetToResolve = resolvable.toResolve;
          var targetStr = targetToResolve.$target;
          var resolvedTarget = objectMap[targetStr];
          var annotationsTerm = targetToResolve.annotationsTerm,
            annotationType = targetToResolve.annotationType;
          delete targetToResolve.annotationType;
          delete targetToResolve.annotationsTerm;
          if (resolvable.inline && !(resolvedTarget instanceof String)) {
            // inline the resolved target
            var keys;
            for (keys in targetToResolve) {
              delete targetToResolve[keys];
            }
            Object.assign(targetToResolve, resolvedTarget);
          } else {
            // assign the resolved target
            targetToResolve.$target = resolvedTarget;
          }
          if (!resolvedTarget) {
            targetToResolve.targetString = targetStr;
            if (annotationsTerm && annotationType) {
              var oErrorMsg = {
                message: 'Unable to resolve the path expression: ' + targetStr + '\n' + '\n' + 'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' + '<Annotation Term = ' + annotationsTerm + '>' + '\n' + '<Record Type = ' + annotationType + '>' + '\n' + '<AnnotationPath = ' + targetStr + '>'
              };
              addAnnotationErrorMessage(targetStr, oErrorMsg);
            } else {
              var property = targetToResolve.term;
              var path = targetToResolve.path;
              var termInfo = targetStr ? targetStr.split('/')[0] : targetStr;
              var _oErrorMsg = {
                message: 'Unable to resolve the path expression: ' + targetStr + '\n' + '\n' + 'Hint: Check and correct the path values under the following structure in the metadata (annotation.xml file or CDS annotations for the application): \n\n' + '<Annotation Term = ' + termInfo + '>' + '\n' + '<PropertyValue Property = ' + property + '        Path= ' + path + '>'
              };
              addAnnotationErrorMessage(targetStr, _oErrorMsg);
            }
          }
        });
      }
      /**
       * Merge annotation from different source together by overwriting at the term level.
       *
       * @param rawMetadata
       * @returns the resulting merged annotations
       */
      function mergeAnnotations(rawMetadata) {
        var annotationListPerTarget = {};
        Object.keys(rawMetadata.schema.annotations).forEach(function (annotationSource) {
          rawMetadata.schema.annotations[annotationSource].forEach(function (annotationList) {
            var currentTargetName = (0, utils_1.unalias)(rawMetadata.references, annotationList.target);
            annotationList.__source = annotationSource;
            if (!annotationListPerTarget[currentTargetName]) {
              annotationListPerTarget[currentTargetName] = {
                annotations: annotationList.annotations.concat(),
                target: currentTargetName
              };
              annotationListPerTarget[currentTargetName].__source = annotationSource;
            } else {
              annotationList.annotations.forEach(function (annotation) {
                var findIndex = annotationListPerTarget[currentTargetName].annotations.findIndex(function (referenceAnnotation) {
                  return referenceAnnotation.term === annotation.term && referenceAnnotation.qualifier === annotation.qualifier;
                });
                annotation.__source = annotationSource;
                if (findIndex !== -1) {
                  annotationListPerTarget[currentTargetName].annotations.splice(findIndex, 1, annotation);
                } else {
                  annotationListPerTarget[currentTargetName].annotations.push(annotation);
                }
              });
            }
          });
        });
        return annotationListPerTarget;
      }
      /**
       * Convert a RawMetadata into an object representation to be used to easily navigate a metadata object and its annotation.
       *
       * @param rawMetadata
       * @returns the converted representation of the metadata.
       */
      function convert(rawMetadata) {
        ANNOTATION_ERRORS = [];
        var objectMap = buildObjectMap(rawMetadata);
        resolveNavigationProperties(rawMetadata.schema.entityTypes, rawMetadata.schema.associations, objectMap);
        rawMetadata.schema.entityContainer.annotations = {};
        linkActionsToEntityType(rawMetadata.schema.namespace, rawMetadata.schema.actions, objectMap);
        linkEntityTypeToEntitySet(rawMetadata.schema.entitySets, objectMap, rawMetadata.references);
        linkEntityTypeToSingleton(rawMetadata.schema.singletons, objectMap, rawMetadata.references);
        linkPropertiesToComplexTypes(rawMetadata.schema.entityTypes, objectMap);
        prepareComplexTypes(rawMetadata.schema.complexTypes, rawMetadata.schema.associations, objectMap);
        var unresolvedTargets = [];
        var unresolvedAnnotations = [];
        var annotationListPerTarget = mergeAnnotations(rawMetadata);
        Object.keys(annotationListPerTarget).forEach(function (currentTargetName) {
          var annotationList = annotationListPerTarget[currentTargetName];
          var objectMapElement = objectMap[currentTargetName];
          if (!objectMapElement && (currentTargetName === null || currentTargetName === void 0 ? void 0 : currentTargetName.indexOf('@')) > 0) {
            unresolvedAnnotations.push(annotationList);
          } else if (objectMapElement) {
            var allTargets = [objectMapElement];
            var bOverrideExisting = true;
            if (objectMapElement._type === 'UnboundGenericAction') {
              allTargets = objectMapElement.actions;
              bOverrideExisting = false;
            }
            allTargets.forEach(function (currentTarget) {
              var currentContext = {
                additionalAnnotations: unresolvedAnnotations,
                currentSource: annotationList.__source,
                currentTarget: currentTarget,
                currentTerm: '',
                rawMetadata: rawMetadata,
                unresolvedAnnotations: unresolvedTargets
              };
              processAnnotations(currentContext, annotationList, objectMap, bOverrideExisting);
            });
          }
        });
        var extraUnresolvedAnnotations = [];
        unresolvedAnnotations.forEach(function (annotationList) {
          var currentTargetName = (0, utils_1.unalias)(rawMetadata.references, annotationList.target);
          var _currentTargetName$sp = currentTargetName.split('@'),
            _currentTargetName$sp2 = _slicedToArray(_currentTargetName$sp, 2),
            baseObj = _currentTargetName$sp2[0],
            annotationPart = _currentTargetName$sp2[1];
          var targetSplit = annotationPart.split('/');
          baseObj = baseObj + '@' + targetSplit[0];
          var currentTarget = targetSplit.slice(1).reduce(function (currentObj, path) {
            return currentObj === null || currentObj === void 0 ? void 0 : currentObj[path];
          }, objectMap[baseObj]);
          if (!currentTarget || typeof currentTarget !== 'object') {
            ANNOTATION_ERRORS.push({
              message: 'The following annotation target was not found on the service ' + currentTargetName
            });
          } else {
            var currentContext = {
              additionalAnnotations: extraUnresolvedAnnotations,
              currentSource: annotationList.__source,
              currentTarget: currentTarget,
              currentTerm: '',
              rawMetadata: rawMetadata,
              unresolvedAnnotations: unresolvedTargets
            };
            processAnnotations(currentContext, annotationList, objectMap, false);
          }
        });
        processUnresolvedTargets(unresolvedTargets, objectMap);
        for (var property in ALL_ANNOTATION_ERRORS) {
          ANNOTATION_ERRORS.push(ALL_ANNOTATION_ERRORS[property][0]);
        }
        rawMetadata.entitySets = rawMetadata.schema.entitySets;
        var extraReferences = rawMetadata.references.filter(function (reference) {
          return utils_1.defaultReferences.find(function (defaultRef) {
            return defaultRef.namespace === reference.namespace;
          }) === undefined;
        });
        var convertedOutput = {
          version: rawMetadata.version,
          annotations: rawMetadata.schema.annotations,
          namespace: rawMetadata.schema.namespace,
          entityContainer: rawMetadata.schema.entityContainer,
          actions: rawMetadata.schema.actions,
          entitySets: rawMetadata.schema.entitySets,
          singletons: rawMetadata.schema.singletons,
          entityTypes: rawMetadata.schema.entityTypes,
          complexTypes: rawMetadata.schema.complexTypes,
          typeDefinitions: rawMetadata.schema.typeDefinitions,
          references: utils_1.defaultReferences.concat(extraReferences),
          diagnostics: ANNOTATION_ERRORS.concat()
        };
        convertedOutput.resolvePath = createGlobalResolve(convertedOutput, objectMap);
        return convertedOutput;
      }
      exports.convert = convert;

      /***/
    },

    /***/349: /***/function (__unused_webpack_module, exports, __webpack_require__) {
      var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            }
          };
        }
        Object.defineProperty(o, k2, desc);
      } : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
      var __exportStar = this && this.__exportStar || function (m, exports) {
        for (var p in m) {
          if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
        }
      };
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      __exportStar(__webpack_require__(830), exports);
      __exportStar(__webpack_require__(364), exports);
      __exportStar(__webpack_require__(716), exports);

      /***/
    },

    /***/716: /***/function (__unused_webpack_module, exports) {
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.Decimal = exports.isComplexTypeDefinition = exports.TermToTypes = exports.unalias = exports.alias = exports.defaultReferences = void 0;
      exports.defaultReferences = [{
        alias: 'Capabilities',
        namespace: 'Org.OData.Capabilities.V1',
        uri: ''
      }, {
        alias: 'Aggregation',
        namespace: 'Org.OData.Aggregation.V1',
        uri: ''
      }, {
        alias: 'Validation',
        namespace: 'Org.OData.Validation.V1',
        uri: ''
      }, {
        namespace: 'Org.OData.Core.V1',
        alias: 'Core',
        uri: ''
      }, {
        namespace: 'Org.OData.Measures.V1',
        alias: 'Measures',
        uri: ''
      }, {
        namespace: 'com.sap.vocabularies.Common.v1',
        alias: 'Common',
        uri: ''
      }, {
        namespace: 'com.sap.vocabularies.UI.v1',
        alias: 'UI',
        uri: ''
      }, {
        namespace: 'com.sap.vocabularies.Session.v1',
        alias: 'Session',
        uri: ''
      }, {
        namespace: 'com.sap.vocabularies.Analytics.v1',
        alias: 'Analytics',
        uri: ''
      }, {
        namespace: 'com.sap.vocabularies.CodeList.v1',
        alias: 'CodeList',
        uri: ''
      }, {
        namespace: 'com.sap.vocabularies.PersonalData.v1',
        alias: 'PersonalData',
        uri: ''
      }, {
        namespace: 'com.sap.vocabularies.Communication.v1',
        alias: 'Communication',
        uri: ''
      }, {
        namespace: 'com.sap.vocabularies.HTML5.v1',
        alias: 'HTML5',
        uri: ''
      }];
      /**
       * Transform an unaliased string representation annotation to the aliased version.
       *
       * @param references currentReferences for the project
       * @param unaliasedValue the unaliased value
       * @returns the aliased string representing the same
       */
      function alias(references, unaliasedValue) {
        if (!references.reverseReferenceMap) {
          references.reverseReferenceMap = references.reduce(function (map, ref) {
            map[ref.namespace] = ref;
            return map;
          }, {});
        }
        if (!unaliasedValue) {
          return unaliasedValue;
        }
        var lastDotIndex = unaliasedValue.lastIndexOf('.');
        var namespace = unaliasedValue.substring(0, lastDotIndex);
        var value = unaliasedValue.substring(lastDotIndex + 1);
        var reference = references.reverseReferenceMap[namespace];
        if (reference) {
          return "".concat(reference.alias, ".").concat(value);
        } else if (unaliasedValue.indexOf('@') !== -1) {
          // Try to see if it's an annotation Path like to_SalesOrder/@UI.LineItem
          var _unaliasedValue$split = unaliasedValue.split('@'),
            _unaliasedValue$split2 = _toArray(_unaliasedValue$split),
            preAlias = _unaliasedValue$split2[0],
            postAlias = _unaliasedValue$split2.slice(1);
          return "".concat(preAlias, "@").concat(alias(references, postAlias.join('@')));
        } else {
          return unaliasedValue;
        }
      }
      exports.alias = alias;
      /**
       * Transform an aliased string representation annotation to the unaliased version.
       *
       * @param references currentReferences for the project
       * @param aliasedValue the aliased value
       * @returns the unaliased string representing the same
       */
      function unalias(references, aliasedValue) {
        if (!references.referenceMap) {
          references.referenceMap = references.reduce(function (map, ref) {
            map[ref.alias] = ref;
            return map;
          }, {});
        }
        if (!aliasedValue) {
          return aliasedValue;
        }
        var _aliasedValue$split = aliasedValue.split('.'),
          _aliasedValue$split2 = _toArray(_aliasedValue$split),
          vocAlias = _aliasedValue$split2[0],
          value = _aliasedValue$split2.slice(1);
        var reference = references.referenceMap[vocAlias];
        if (reference) {
          return "".concat(reference.namespace, ".").concat(value.join('.'));
        } else if (aliasedValue.indexOf('@') !== -1) {
          // Try to see if it's an annotation Path like to_SalesOrder/@UI.LineItem
          var _aliasedValue$split3 = aliasedValue.split('@'),
            _aliasedValue$split4 = _toArray(_aliasedValue$split3),
            preAlias = _aliasedValue$split4[0],
            postAlias = _aliasedValue$split4.slice(1);
          return "".concat(preAlias, "@").concat(unalias(references, postAlias.join('@')));
        } else {
          return aliasedValue;
        }
      }
      exports.unalias = unalias;
      var TermToTypes;
      (function (TermToTypes) {
        TermToTypes["Org.OData.Authorization.V1.SecuritySchemes"] = "Org.OData.Authorization.V1.SecurityScheme";
        TermToTypes["Org.OData.Authorization.V1.Authorizations"] = "Org.OData.Authorization.V1.Authorization";
        TermToTypes["Org.OData.Core.V1.Revisions"] = "Org.OData.Core.V1.RevisionType";
        TermToTypes["Org.OData.Core.V1.Links"] = "Org.OData.Core.V1.Link";
        TermToTypes["Org.OData.Core.V1.Example"] = "Org.OData.Core.V1.ExampleValue";
        TermToTypes["Org.OData.Core.V1.Messages"] = "Org.OData.Core.V1.MessageType";
        TermToTypes["Org.OData.Core.V1.ValueException"] = "Org.OData.Core.V1.ValueExceptionType";
        TermToTypes["Org.OData.Core.V1.ResourceException"] = "Org.OData.Core.V1.ResourceExceptionType";
        TermToTypes["Org.OData.Core.V1.DataModificationException"] = "Org.OData.Core.V1.DataModificationExceptionType";
        TermToTypes["Org.OData.Core.V1.IsLanguageDependent"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.DereferenceableIDs"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.ConventionalIDs"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.Permissions"] = "Org.OData.Core.V1.Permission";
        TermToTypes["Org.OData.Core.V1.DefaultNamespace"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.Immutable"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.Computed"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.ComputedDefaultValue"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.IsURL"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.IsMediaType"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.ContentDisposition"] = "Org.OData.Core.V1.ContentDispositionType";
        TermToTypes["Org.OData.Core.V1.OptimisticConcurrency"] = "Edm.PropertyPath";
        TermToTypes["Org.OData.Core.V1.AdditionalProperties"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.AutoExpand"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.AutoExpandReferences"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.MayImplement"] = "Org.OData.Core.V1.QualifiedTypeName";
        TermToTypes["Org.OData.Core.V1.Ordered"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.PositionalInsert"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Core.V1.AlternateKeys"] = "Org.OData.Core.V1.AlternateKey";
        TermToTypes["Org.OData.Core.V1.OptionalParameter"] = "Org.OData.Core.V1.OptionalParameterType";
        TermToTypes["Org.OData.Core.V1.OperationAvailable"] = "Edm.Boolean";
        TermToTypes["Org.OData.Core.V1.SymbolicName"] = "Org.OData.Core.V1.SimpleIdentifier";
        TermToTypes["Org.OData.Capabilities.V1.ConformanceLevel"] = "Org.OData.Capabilities.V1.ConformanceLevelType";
        TermToTypes["Org.OData.Capabilities.V1.AsynchronousRequestsSupported"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Capabilities.V1.BatchContinueOnErrorSupported"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Capabilities.V1.IsolationSupported"] = "Org.OData.Capabilities.V1.IsolationLevel";
        TermToTypes["Org.OData.Capabilities.V1.CrossJoinSupported"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Capabilities.V1.CallbackSupported"] = "Org.OData.Capabilities.V1.CallbackType";
        TermToTypes["Org.OData.Capabilities.V1.ChangeTracking"] = "Org.OData.Capabilities.V1.ChangeTrackingType";
        TermToTypes["Org.OData.Capabilities.V1.CountRestrictions"] = "Org.OData.Capabilities.V1.CountRestrictionsType";
        TermToTypes["Org.OData.Capabilities.V1.NavigationRestrictions"] = "Org.OData.Capabilities.V1.NavigationRestrictionsType";
        TermToTypes["Org.OData.Capabilities.V1.IndexableByKey"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Capabilities.V1.TopSupported"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Capabilities.V1.SkipSupported"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Capabilities.V1.ComputeSupported"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Capabilities.V1.SelectSupport"] = "Org.OData.Capabilities.V1.SelectSupportType";
        TermToTypes["Org.OData.Capabilities.V1.BatchSupported"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Capabilities.V1.BatchSupport"] = "Org.OData.Capabilities.V1.BatchSupportType";
        TermToTypes["Org.OData.Capabilities.V1.FilterRestrictions"] = "Org.OData.Capabilities.V1.FilterRestrictionsType";
        TermToTypes["Org.OData.Capabilities.V1.SortRestrictions"] = "Org.OData.Capabilities.V1.SortRestrictionsType";
        TermToTypes["Org.OData.Capabilities.V1.ExpandRestrictions"] = "Org.OData.Capabilities.V1.ExpandRestrictionsType";
        TermToTypes["Org.OData.Capabilities.V1.SearchRestrictions"] = "Org.OData.Capabilities.V1.SearchRestrictionsType";
        TermToTypes["Org.OData.Capabilities.V1.KeyAsSegmentSupported"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Capabilities.V1.QuerySegmentSupported"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Capabilities.V1.InsertRestrictions"] = "Org.OData.Capabilities.V1.InsertRestrictionsType";
        TermToTypes["Org.OData.Capabilities.V1.DeepInsertSupport"] = "Org.OData.Capabilities.V1.DeepInsertSupportType";
        TermToTypes["Org.OData.Capabilities.V1.UpdateRestrictions"] = "Org.OData.Capabilities.V1.UpdateRestrictionsType";
        TermToTypes["Org.OData.Capabilities.V1.DeepUpdateSupport"] = "Org.OData.Capabilities.V1.DeepUpdateSupportType";
        TermToTypes["Org.OData.Capabilities.V1.DeleteRestrictions"] = "Org.OData.Capabilities.V1.DeleteRestrictionsType";
        TermToTypes["Org.OData.Capabilities.V1.CollectionPropertyRestrictions"] = "Org.OData.Capabilities.V1.CollectionPropertyRestrictionsType";
        TermToTypes["Org.OData.Capabilities.V1.OperationRestrictions"] = "Org.OData.Capabilities.V1.OperationRestrictionsType";
        TermToTypes["Org.OData.Capabilities.V1.AnnotationValuesInQuerySupported"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Capabilities.V1.ModificationQueryOptions"] = "Org.OData.Capabilities.V1.ModificationQueryOptionsType";
        TermToTypes["Org.OData.Capabilities.V1.ReadRestrictions"] = "Org.OData.Capabilities.V1.ReadRestrictionsType";
        TermToTypes["Org.OData.Capabilities.V1.CustomHeaders"] = "Org.OData.Capabilities.V1.CustomParameter";
        TermToTypes["Org.OData.Capabilities.V1.CustomQueryOptions"] = "Org.OData.Capabilities.V1.CustomParameter";
        TermToTypes["Org.OData.Capabilities.V1.MediaLocationUpdateSupported"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Aggregation.V1.ApplySupported"] = "Org.OData.Aggregation.V1.ApplySupportedType";
        TermToTypes["Org.OData.Aggregation.V1.Groupable"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Aggregation.V1.Aggregatable"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Aggregation.V1.ContextDefiningProperties"] = "Edm.PropertyPath";
        TermToTypes["Org.OData.Aggregation.V1.LeveledHierarchy"] = "Edm.PropertyPath";
        TermToTypes["Org.OData.Aggregation.V1.RecursiveHierarchy"] = "Org.OData.Aggregation.V1.RecursiveHierarchyType";
        TermToTypes["Org.OData.Aggregation.V1.AvailableOnAggregates"] = "Org.OData.Aggregation.V1.AvailableOnAggregatesType";
        TermToTypes["Org.OData.Validation.V1.Minimum"] = "Edm.PrimitiveType";
        TermToTypes["Org.OData.Validation.V1.Maximum"] = "Edm.PrimitiveType";
        TermToTypes["Org.OData.Validation.V1.Exclusive"] = "Org.OData.Core.V1.Tag";
        TermToTypes["Org.OData.Validation.V1.AllowedValues"] = "Org.OData.Validation.V1.AllowedValue";
        TermToTypes["Org.OData.Validation.V1.MultipleOf"] = "Edm.Decimal";
        TermToTypes["Org.OData.Validation.V1.Constraint"] = "Org.OData.Validation.V1.ConstraintType";
        TermToTypes["Org.OData.Validation.V1.ItemsOf"] = "Org.OData.Validation.V1.ItemsOfType";
        TermToTypes["Org.OData.Validation.V1.OpenPropertyTypeConstraint"] = "Org.OData.Core.V1.QualifiedTypeName";
        TermToTypes["Org.OData.Validation.V1.DerivedTypeConstraint"] = "Org.OData.Core.V1.QualifiedTypeName";
        TermToTypes["Org.OData.Validation.V1.AllowedTerms"] = "Org.OData.Core.V1.QualifiedTermName";
        TermToTypes["Org.OData.Validation.V1.ApplicableTerms"] = "Org.OData.Core.V1.QualifiedTermName";
        TermToTypes["Org.OData.Validation.V1.MaxItems"] = "Edm.Int64";
        TermToTypes["Org.OData.Validation.V1.MinItems"] = "Edm.Int64";
        TermToTypes["Org.OData.Measures.V1.Scale"] = "Edm.Byte";
        TermToTypes["Org.OData.Measures.V1.DurationGranularity"] = "Org.OData.Measures.V1.DurationGranularityType";
        TermToTypes["com.sap.vocabularies.Analytics.v1.Dimension"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Analytics.v1.Measure"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Analytics.v1.AccumulativeMeasure"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Analytics.v1.RolledUpPropertyCount"] = "Edm.Int16";
        TermToTypes["com.sap.vocabularies.Analytics.v1.PlanningAction"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Analytics.v1.AggregatedProperties"] = "com.sap.vocabularies.Analytics.v1.AggregatedPropertyType";
        TermToTypes["com.sap.vocabularies.Common.v1.ServiceVersion"] = "Edm.Int32";
        TermToTypes["com.sap.vocabularies.Common.v1.ServiceSchemaVersion"] = "Edm.Int32";
        TermToTypes["com.sap.vocabularies.Common.v1.TextFor"] = "Edm.PropertyPath";
        TermToTypes["com.sap.vocabularies.Common.v1.IsLanguageIdentifier"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.TextFormat"] = "com.sap.vocabularies.Common.v1.TextFormatType";
        TermToTypes["com.sap.vocabularies.Common.v1.IsDigitSequence"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsUpperCase"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsCurrency"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsUnit"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.UnitSpecificScale"] = "Edm.PrimitiveType";
        TermToTypes["com.sap.vocabularies.Common.v1.UnitSpecificPrecision"] = "Edm.PrimitiveType";
        TermToTypes["com.sap.vocabularies.Common.v1.SecondaryKey"] = "Edm.PropertyPath";
        TermToTypes["com.sap.vocabularies.Common.v1.MinOccurs"] = "Edm.Int64";
        TermToTypes["com.sap.vocabularies.Common.v1.MaxOccurs"] = "Edm.Int64";
        TermToTypes["com.sap.vocabularies.Common.v1.AssociationEntity"] = "Edm.NavigationPropertyPath";
        TermToTypes["com.sap.vocabularies.Common.v1.DerivedNavigation"] = "Edm.NavigationPropertyPath";
        TermToTypes["com.sap.vocabularies.Common.v1.Masked"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.MaskedAlways"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.SemanticObjectMapping"] = "com.sap.vocabularies.Common.v1.SemanticObjectMappingType";
        TermToTypes["com.sap.vocabularies.Common.v1.IsInstanceAnnotation"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.FilterExpressionRestrictions"] = "com.sap.vocabularies.Common.v1.FilterExpressionRestrictionType";
        TermToTypes["com.sap.vocabularies.Common.v1.FieldControl"] = "com.sap.vocabularies.Common.v1.FieldControlType";
        TermToTypes["com.sap.vocabularies.Common.v1.Application"] = "com.sap.vocabularies.Common.v1.ApplicationType";
        TermToTypes["com.sap.vocabularies.Common.v1.Timestamp"] = "Edm.DateTimeOffset";
        TermToTypes["com.sap.vocabularies.Common.v1.ErrorResolution"] = "com.sap.vocabularies.Common.v1.ErrorResolutionType";
        TermToTypes["com.sap.vocabularies.Common.v1.Messages"] = "Edm.ComplexType";
        TermToTypes["com.sap.vocabularies.Common.v1.numericSeverity"] = "com.sap.vocabularies.Common.v1.NumericMessageSeverityType";
        TermToTypes["com.sap.vocabularies.Common.v1.MaximumNumericMessageSeverity"] = "com.sap.vocabularies.Common.v1.NumericMessageSeverityType";
        TermToTypes["com.sap.vocabularies.Common.v1.IsActionCritical"] = "Edm.Boolean";
        TermToTypes["com.sap.vocabularies.Common.v1.Attributes"] = "Edm.PropertyPath";
        TermToTypes["com.sap.vocabularies.Common.v1.RelatedRecursiveHierarchy"] = "Edm.AnnotationPath";
        TermToTypes["com.sap.vocabularies.Common.v1.Interval"] = "com.sap.vocabularies.Common.v1.IntervalType";
        TermToTypes["com.sap.vocabularies.Common.v1.ResultContext"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.WeakReferentialConstraint"] = "com.sap.vocabularies.Common.v1.WeakReferentialConstraintType";
        TermToTypes["com.sap.vocabularies.Common.v1.IsNaturalPerson"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.ValueList"] = "com.sap.vocabularies.Common.v1.ValueListType";
        TermToTypes["com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"] = "com.sap.vocabularies.Common.v1.SimpleIdentifier";
        TermToTypes["com.sap.vocabularies.Common.v1.ValueListWithFixedValues"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.ValueListMapping"] = "com.sap.vocabularies.Common.v1.ValueListMappingType";
        TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYear"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarHalfyear"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarQuarter"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarMonth"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarWeek"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfCalendarMonth"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfCalendarYear"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearHalfyear"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearQuarter"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearMonth"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarYearWeek"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsCalendarDate"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYear"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalPeriod"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearPeriod"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalQuarter"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearQuarter"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalWeek"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearWeek"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsDayOfFiscalYear"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.IsFiscalYearVariant"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.MutuallyExclusiveTerm"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Common.v1.DraftRoot"] = "com.sap.vocabularies.Common.v1.DraftRootType";
        TermToTypes["com.sap.vocabularies.Common.v1.DraftNode"] = "com.sap.vocabularies.Common.v1.DraftNodeType";
        TermToTypes["com.sap.vocabularies.Common.v1.DraftActivationVia"] = "com.sap.vocabularies.Common.v1.SimpleIdentifier";
        TermToTypes["com.sap.vocabularies.Common.v1.EditableFieldFor"] = "Edm.PropertyPath";
        TermToTypes["com.sap.vocabularies.Common.v1.SemanticKey"] = "Edm.PropertyPath";
        TermToTypes["com.sap.vocabularies.Common.v1.SideEffects"] = "com.sap.vocabularies.Common.v1.SideEffectsType";
        TermToTypes["com.sap.vocabularies.Common.v1.DefaultValuesFunction"] = "com.sap.vocabularies.Common.v1.QualifiedName";
        TermToTypes["com.sap.vocabularies.Common.v1.FilterDefaultValue"] = "Edm.PrimitiveType";
        TermToTypes["com.sap.vocabularies.Common.v1.FilterDefaultValueHigh"] = "Edm.PrimitiveType";
        TermToTypes["com.sap.vocabularies.Common.v1.SortOrder"] = "com.sap.vocabularies.Common.v1.SortOrderType";
        TermToTypes["com.sap.vocabularies.Common.v1.RecursiveHierarchy"] = "com.sap.vocabularies.Common.v1.RecursiveHierarchyType";
        TermToTypes["com.sap.vocabularies.Common.v1.CreatedAt"] = "Edm.DateTimeOffset";
        TermToTypes["com.sap.vocabularies.Common.v1.CreatedBy"] = "com.sap.vocabularies.Common.v1.UserID";
        TermToTypes["com.sap.vocabularies.Common.v1.ChangedAt"] = "Edm.DateTimeOffset";
        TermToTypes["com.sap.vocabularies.Common.v1.ChangedBy"] = "com.sap.vocabularies.Common.v1.UserID";
        TermToTypes["com.sap.vocabularies.Common.v1.ApplyMultiUnitBehaviorForSortingAndFiltering"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.CodeList.v1.CurrencyCodes"] = "com.sap.vocabularies.CodeList.v1.CodeListSource";
        TermToTypes["com.sap.vocabularies.CodeList.v1.UnitsOfMeasure"] = "com.sap.vocabularies.CodeList.v1.CodeListSource";
        TermToTypes["com.sap.vocabularies.CodeList.v1.StandardCode"] = "Edm.PropertyPath";
        TermToTypes["com.sap.vocabularies.CodeList.v1.ExternalCode"] = "Edm.PropertyPath";
        TermToTypes["com.sap.vocabularies.CodeList.v1.IsConfigurationDeprecationCode"] = "Edm.Boolean";
        TermToTypes["com.sap.vocabularies.Communication.v1.Contact"] = "com.sap.vocabularies.Communication.v1.ContactType";
        TermToTypes["com.sap.vocabularies.Communication.v1.Address"] = "com.sap.vocabularies.Communication.v1.AddressType";
        TermToTypes["com.sap.vocabularies.Communication.v1.IsEmailAddress"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Communication.v1.IsPhoneNumber"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Communication.v1.Event"] = "com.sap.vocabularies.Communication.v1.EventData";
        TermToTypes["com.sap.vocabularies.Communication.v1.Task"] = "com.sap.vocabularies.Communication.v1.TaskData";
        TermToTypes["com.sap.vocabularies.Communication.v1.Message"] = "com.sap.vocabularies.Communication.v1.MessageData";
        TermToTypes["com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchy"] = "com.sap.vocabularies.Hierarchy.v1.RecursiveHierarchyType";
        TermToTypes["com.sap.vocabularies.PersonalData.v1.EntitySemantics"] = "com.sap.vocabularies.PersonalData.v1.EntitySemanticsType";
        TermToTypes["com.sap.vocabularies.PersonalData.v1.FieldSemantics"] = "com.sap.vocabularies.PersonalData.v1.FieldSemanticsType";
        TermToTypes["com.sap.vocabularies.PersonalData.v1.IsPotentiallyPersonal"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.PersonalData.v1.IsPotentiallySensitive"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.Session.v1.StickySessionSupported"] = "com.sap.vocabularies.Session.v1.StickySessionSupportedType";
        TermToTypes["com.sap.vocabularies.UI.v1.HeaderInfo"] = "com.sap.vocabularies.UI.v1.HeaderInfoType";
        TermToTypes["com.sap.vocabularies.UI.v1.Identification"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
        TermToTypes["com.sap.vocabularies.UI.v1.Badge"] = "com.sap.vocabularies.UI.v1.BadgeType";
        TermToTypes["com.sap.vocabularies.UI.v1.LineItem"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
        TermToTypes["com.sap.vocabularies.UI.v1.StatusInfo"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
        TermToTypes["com.sap.vocabularies.UI.v1.FieldGroup"] = "com.sap.vocabularies.UI.v1.FieldGroupType";
        TermToTypes["com.sap.vocabularies.UI.v1.ConnectedFields"] = "com.sap.vocabularies.UI.v1.ConnectedFieldsType";
        TermToTypes["com.sap.vocabularies.UI.v1.GeoLocations"] = "com.sap.vocabularies.UI.v1.GeoLocationType";
        TermToTypes["com.sap.vocabularies.UI.v1.GeoLocation"] = "com.sap.vocabularies.UI.v1.GeoLocationType";
        TermToTypes["com.sap.vocabularies.UI.v1.Contacts"] = "Edm.AnnotationPath";
        TermToTypes["com.sap.vocabularies.UI.v1.MediaResource"] = "com.sap.vocabularies.UI.v1.MediaResourceType";
        TermToTypes["com.sap.vocabularies.UI.v1.DataPoint"] = "com.sap.vocabularies.UI.v1.DataPointType";
        TermToTypes["com.sap.vocabularies.UI.v1.KPI"] = "com.sap.vocabularies.UI.v1.KPIType";
        TermToTypes["com.sap.vocabularies.UI.v1.Chart"] = "com.sap.vocabularies.UI.v1.ChartDefinitionType";
        TermToTypes["com.sap.vocabularies.UI.v1.ValueCriticality"] = "com.sap.vocabularies.UI.v1.ValueCriticalityType";
        TermToTypes["com.sap.vocabularies.UI.v1.CriticalityLabels"] = "com.sap.vocabularies.UI.v1.CriticalityLabelType";
        TermToTypes["com.sap.vocabularies.UI.v1.SelectionFields"] = "Edm.PropertyPath";
        TermToTypes["com.sap.vocabularies.UI.v1.Facets"] = "com.sap.vocabularies.UI.v1.Facet";
        TermToTypes["com.sap.vocabularies.UI.v1.HeaderFacets"] = "com.sap.vocabularies.UI.v1.Facet";
        TermToTypes["com.sap.vocabularies.UI.v1.QuickViewFacets"] = "com.sap.vocabularies.UI.v1.Facet";
        TermToTypes["com.sap.vocabularies.UI.v1.QuickCreateFacets"] = "com.sap.vocabularies.UI.v1.Facet";
        TermToTypes["com.sap.vocabularies.UI.v1.FilterFacets"] = "com.sap.vocabularies.UI.v1.ReferenceFacet";
        TermToTypes["com.sap.vocabularies.UI.v1.SelectionPresentationVariant"] = "com.sap.vocabularies.UI.v1.SelectionPresentationVariantType";
        TermToTypes["com.sap.vocabularies.UI.v1.PresentationVariant"] = "com.sap.vocabularies.UI.v1.PresentationVariantType";
        TermToTypes["com.sap.vocabularies.UI.v1.SelectionVariant"] = "com.sap.vocabularies.UI.v1.SelectionVariantType";
        TermToTypes["com.sap.vocabularies.UI.v1.ThingPerspective"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.IsSummary"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.PartOfPreview"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.Map"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.Gallery"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.IsImageURL"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.IsImage"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.MultiLineText"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.TextArrangement"] = "com.sap.vocabularies.UI.v1.TextArrangementType";
        TermToTypes["com.sap.vocabularies.UI.v1.Importance"] = "com.sap.vocabularies.UI.v1.ImportanceType";
        TermToTypes["com.sap.vocabularies.UI.v1.Hidden"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.CreateHidden"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.UpdateHidden"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.DeleteHidden"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.HiddenFilter"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.DataFieldDefault"] = "com.sap.vocabularies.UI.v1.DataFieldAbstract";
        TermToTypes["com.sap.vocabularies.UI.v1.Criticality"] = "com.sap.vocabularies.UI.v1.CriticalityType";
        TermToTypes["com.sap.vocabularies.UI.v1.CriticalityCalculation"] = "com.sap.vocabularies.UI.v1.CriticalityCalculationType";
        TermToTypes["com.sap.vocabularies.UI.v1.Emphasized"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.UI.v1.OrderBy"] = "Edm.PropertyPath";
        TermToTypes["com.sap.vocabularies.UI.v1.ParameterDefaultValue"] = "Edm.PrimitiveType";
        TermToTypes["com.sap.vocabularies.UI.v1.RecommendationState"] = "com.sap.vocabularies.UI.v1.RecommendationStateType";
        TermToTypes["com.sap.vocabularies.UI.v1.RecommendationList"] = "com.sap.vocabularies.UI.v1.RecommendationListType";
        TermToTypes["com.sap.vocabularies.UI.v1.ExcludeFromNavigationContext"] = "Org.OData.Core.V1.Tag";
        TermToTypes["com.sap.vocabularies.HTML5.v1.CssDefaults"] = "com.sap.vocabularies.HTML5.v1.CssDefaultsType";
      })(TermToTypes = exports.TermToTypes || (exports.TermToTypes = {}));
      /**
       * Differentiate between a ComplexType and a TypeDefinition.
       * @param complexTypeDefinition
       * @returns true if the value is a complex type
       */
      function isComplexTypeDefinition(complexTypeDefinition) {
        return !!complexTypeDefinition && complexTypeDefinition._type === 'ComplexType' && !!complexTypeDefinition.properties;
      }
      exports.isComplexTypeDefinition = isComplexTypeDefinition;
      function Decimal(value) {
        return {
          isDecimal: function () {
            return true;
          },
          valueOf: function () {
            return value;
          },
          toString: function () {
            return value.toString();
          }
        };
      }
      exports.Decimal = Decimal;

      /***/
    },

    /***/364: /***/function (__unused_webpack_module, exports, __webpack_require__) {
      Object.defineProperty(exports, "__esModule", {
        value: true
      });
      exports.revertTermToGenericType = void 0;
      var utils_1 = __webpack_require__(716);
      /**
       * Revert an object to its raw type equivalent.
       *
       * @param references the current reference
       * @param value the value to revert
       * @returns the raw value
       */
      function revertObjectToRawType(references, value) {
        var _a, _b;
        var result;
        if (Array.isArray(value)) {
          result = {
            type: 'Collection',
            Collection: value.map(function (anno) {
              return revertCollectionItemToRawType(references, anno);
            })
          };
        } else if ((_a = value.isDecimal) === null || _a === void 0 ? void 0 : _a.call(value)) {
          result = {
            type: 'Decimal',
            Decimal: value.valueOf()
          };
        } else if ((_b = value.isString) === null || _b === void 0 ? void 0 : _b.call(value)) {
          var valueMatches = value.split('.');
          if (valueMatches.length > 1 && references.find(function (ref) {
            return ref.alias === valueMatches[0];
          })) {
            result = {
              type: 'EnumMember',
              EnumMember: value.valueOf()
            };
          } else {
            result = {
              type: 'String',
              String: value.valueOf()
            };
          }
        } else if (value.type === 'Path') {
          result = {
            type: 'Path',
            Path: value.path
          };
        } else if (value.type === 'AnnotationPath') {
          result = {
            type: 'AnnotationPath',
            AnnotationPath: value.value
          };
        } else if (value.type === 'Apply') {
          result = {
            type: 'Apply',
            Apply: value.Apply
          };
        } else if (value.type === 'Null') {
          result = {
            type: 'Null'
          };
        } else if (value.type === 'PropertyPath') {
          result = {
            type: 'PropertyPath',
            PropertyPath: value.value
          };
        } else if (value.type === 'NavigationPropertyPath') {
          result = {
            type: 'NavigationPropertyPath',
            NavigationPropertyPath: value.value
          };
        } else if (Object.prototype.hasOwnProperty.call(value, '$Type')) {
          result = {
            type: 'Record',
            Record: revertCollectionItemToRawType(references, value)
          };
        }
        return result;
      }
      /**
       * Revert a value to its raw value depending on its type.
       *
       * @param references the current set of reference
       * @param value the value to revert
       * @returns the raw expression
       */
      function revertValueToRawType(references, value) {
        var result;
        var valueConstructor = value === null || value === void 0 ? void 0 : value.constructor.name;
        switch (valueConstructor) {
          case 'String':
          case 'string':
            var valueMatches = value.toString().split('.');
            if (valueMatches.length > 1 && references.find(function (ref) {
              return ref.alias === valueMatches[0];
            })) {
              result = {
                type: 'EnumMember',
                EnumMember: value.toString()
              };
            } else {
              result = {
                type: 'String',
                String: value.toString()
              };
            }
            break;
          case 'Boolean':
          case 'boolean':
            result = {
              type: 'Bool',
              Bool: value.valueOf()
            };
            break;
          case 'Number':
          case 'number':
            if (value.toString() === value.toFixed()) {
              result = {
                type: 'Int',
                Int: value.valueOf()
              };
            } else {
              result = {
                type: 'Decimal',
                Decimal: value.valueOf()
              };
            }
            break;
          case 'object':
          default:
            result = revertObjectToRawType(references, value);
            break;
        }
        return result;
      }
      var restrictedKeys = ['$Type', 'term', '__source', 'qualifier', 'ActionTarget', 'fullyQualifiedName', 'annotations'];
      /**
       * Revert the current embedded annotations to their raw type.
       *
       * @param references the current set of reference
       * @param currentAnnotations the collection item to evaluate
       * @param targetAnnotations the place where we need to add the annotation
       */
      function revertAnnotationsToRawType(references, currentAnnotations, targetAnnotations) {
        Object.keys(currentAnnotations).filter(function (key) {
          return key !== '_annotations';
        }).forEach(function (key) {
          Object.keys(currentAnnotations[key]).forEach(function (term) {
            var parsedAnnotation = revertTermToGenericType(references, currentAnnotations[key][term]);
            if (!parsedAnnotation.term) {
              var unaliasedTerm = (0, utils_1.unalias)(references, "".concat(key, ".").concat(term));
              if (unaliasedTerm) {
                var qualifiedSplit = unaliasedTerm.split('#');
                parsedAnnotation.term = qualifiedSplit[0];
                if (qualifiedSplit.length > 1) {
                  // Sub Annotation with a qualifier, not sure when that can happen in real scenarios
                  parsedAnnotation.qualifier = qualifiedSplit[1];
                }
              }
            }
            targetAnnotations.push(parsedAnnotation);
          });
        });
      }
      /**
       * Revert the current collection item to the corresponding raw annotation.
       *
       * @param references the current set of reference
       * @param collectionItem the collection item to evaluate
       * @returns the raw type equivalent
       */
      function revertCollectionItemToRawType(references, collectionItem) {
        if (typeof collectionItem === 'string') {
          return collectionItem;
        } else if (typeof collectionItem === 'object') {
          if (collectionItem.hasOwnProperty('$Type')) {
            // Annotation Record
            var outItem = {
              type: collectionItem.$Type,
              propertyValues: []
            };
            // Could validate keys and type based on $Type
            Object.keys(collectionItem).forEach(function (collectionKey) {
              if (restrictedKeys.indexOf(collectionKey) === -1) {
                var value = collectionItem[collectionKey];
                outItem.propertyValues.push({
                  name: collectionKey,
                  value: revertValueToRawType(references, value)
                });
              } else if (collectionKey === 'annotations' && Object.keys(collectionItem[collectionKey]).length > 0) {
                outItem.annotations = [];
                revertAnnotationsToRawType(references, collectionItem[collectionKey], outItem.annotations);
              }
            });
            return outItem;
          } else if (collectionItem.type === 'PropertyPath') {
            return {
              type: 'PropertyPath',
              PropertyPath: collectionItem.value
            };
          } else if (collectionItem.type === 'AnnotationPath') {
            return {
              type: 'AnnotationPath',
              AnnotationPath: collectionItem.value
            };
          } else if (collectionItem.type === 'NavigationPropertyPath') {
            return {
              type: 'NavigationPropertyPath',
              NavigationPropertyPath: collectionItem.value
            };
          }
        }
      }
      /**
       * Revert an annotation term to it's generic or raw equivalent.
       *
       * @param references the reference of the current context
       * @param annotation the annotation term to revert
       * @returns the raw annotation
       */
      function revertTermToGenericType(references, annotation) {
        var baseAnnotation = {
          term: annotation.term,
          qualifier: annotation.qualifier
        };
        if (Array.isArray(annotation)) {
          // Collection
          if (annotation.hasOwnProperty('annotations') && Object.keys(annotation.annotations).length > 0) {
            // Annotation on a collection itself, not sure when that happens if at all
            baseAnnotation.annotations = [];
            revertAnnotationsToRawType(references, annotation.annotations, baseAnnotation.annotations);
          }
          return _objectSpread(_objectSpread({}, baseAnnotation), {}, {
            collection: annotation.map(function (anno) {
              return revertCollectionItemToRawType(references, anno);
            })
          });
        } else if (annotation.hasOwnProperty('$Type')) {
          return _objectSpread(_objectSpread({}, baseAnnotation), {}, {
            record: revertCollectionItemToRawType(references, annotation)
          });
        } else {
          return _objectSpread(_objectSpread({}, baseAnnotation), {}, {
            value: revertValueToRawType(references, annotation)
          });
        }
      }
      exports.revertTermToGenericType = revertTermToGenericType;

      /***/
    }

    /******/
  };
  /************************************************************************/
  /******/ // The module cache
  /******/
  var __webpack_module_cache__ = {};
  /******/
  /******/ // The require function
  /******/
  function __webpack_require__(moduleId) {
    /******/ // Check if module is in cache
    /******/var cachedModule = __webpack_module_cache__[moduleId];
    /******/
    if (cachedModule !== undefined) {
      /******/return cachedModule.exports;
      /******/
    }
    /******/ // Create a new module (and put it into the cache)
    /******/
    var module = __webpack_module_cache__[moduleId] = {
      /******/ // no module.id needed
      /******/ // no module.loaded needed
      /******/exports: {}
      /******/
    };
    /******/
    /******/ // Execute the module function
    /******/
    __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    /******/
    /******/ // Return the exports of the module
    /******/
    return module.exports;
    /******/
  }
  /******/
  /************************************************************************/
  /******/
  /******/ // startup
  /******/ // Load entry module and return exports
  /******/ // This entry module is referenced by other modules so it can't be inlined
  /******/
  var __webpack_exports__ = __webpack_require__(349);
  /******/
  AnnotationConverter = __webpack_exports__;
  /******/
  /******/
})();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBbm5vdGF0aW9uQ29udmVydGVyIiwiX193ZWJwYWNrX21vZHVsZXNfXyIsIl9fdW51c2VkX3dlYnBhY2tfbW9kdWxlIiwiZXhwb3J0cyIsIl9fd2VicGFja19yZXF1aXJlX18iLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsInZhbHVlIiwiY29udmVydCIsInV0aWxzXzEiLCJQYXRoIiwicGF0aEV4cHJlc3Npb24iLCJ0YXJnZXROYW1lIiwiYW5ub3RhdGlvbnNUZXJtIiwidGVybSIsInBhdGgiLCJ0eXBlIiwiJHRhcmdldCIsImJ1aWxkT2JqZWN0TWFwIiwicmF3TWV0YWRhdGEiLCJfYSIsIm9iamVjdE1hcCIsInNjaGVtYSIsImVudGl0eUNvbnRhaW5lciIsImZ1bGx5UXVhbGlmaWVkTmFtZSIsImVudGl0eVNldHMiLCJmb3JFYWNoIiwiZW50aXR5U2V0Iiwic2luZ2xldG9ucyIsInNpbmdsZXRvbiIsImFjdGlvbnMiLCJhY3Rpb24iLCJpc0JvdW5kIiwidW5Cb3VuZEFjdGlvbk5hbWUiLCJzcGxpdCIsIl90eXBlIiwicHVzaCIsImFjdGlvblNwbGl0IiwicGFyYW1ldGVycyIsInBhcmFtZXRlciIsImNvbXBsZXhUeXBlcyIsImNvbXBsZXhUeXBlIiwicHJvcGVydGllcyIsInByb3BlcnR5IiwidHlwZURlZmluaXRpb25zIiwidHlwZURlZmluaXRpb24iLCJlbnRpdHlUeXBlcyIsImVudGl0eVR5cGUiLCJhbm5vdGF0aW9ucyIsImVudGl0eVByb3BlcnRpZXMiLCJjb21wbGV4VHlwZURlZmluaXRpb24iLCJpc0NvbXBsZXhUeXBlRGVmaW5pdGlvbiIsImNvbXBsZXhUeXBlUHJvcCIsImNvbXBsZXhUeXBlUHJvcFRhcmdldCIsImFzc2lnbiIsIm5hbWUiLCJuYXZpZ2F0aW9uUHJvcGVydGllcyIsIm5hdlByb3BlcnR5Iiwia2V5cyIsImFubm90YXRpb25Tb3VyY2UiLCJhbm5vdGF0aW9uTGlzdCIsImN1cnJlbnRUYXJnZXROYW1lIiwidW5hbGlhcyIsInJlZmVyZW5jZXMiLCJ0YXJnZXQiLCJhbm5vdGF0aW9uIiwiYW5ub3RhdGlvbkZRTiIsInF1YWxpZmllciIsImNvbWJpbmVQYXRoIiwiY3VycmVudFRhcmdldCIsInN0YXJ0c1dpdGgiLCJkZWZhdWx0UmVmZXJlbmNlcyIsIkFMTF9BTk5PVEFUSU9OX0VSUk9SUyIsIkFOTk9UQVRJT05fRVJST1JTIiwiYWRkQW5ub3RhdGlvbkVycm9yTWVzc2FnZSIsIm9FcnJvck1zZyIsIl9yZXNvbHZlVGFyZ2V0IiwicGF0aE9ubHkiLCJpbmNsdWRlVmlzaXRlZE9iamVjdHMiLCJ1bmRlZmluZWQiLCJhVmlzaXRlZE9iamVjdHMiLCJwYXRoU3BsaXQiLCJ0YXJnZXRQYXRoU3BsaXQiLCJwYXRoUGFydCIsImluZGV4T2YiLCJzcGxpdHRlZFBhdGgiLCJhbm5vdGF0aW9uUGF0aCIsImN1cnJlbnRQYXRoIiwiY3VycmVudENvbnRleHQiLCJyZWR1Y2UiLCJjdXJyZW50VmFsdWUiLCJsZW5ndGgiLCJ0YXJnZXRUeXBlIiwibmF2aWdhdGlvblByb3BlcnR5QmluZGluZyIsImVudGl0eVR5cGVOYW1lIiwidGFyZ2V0VHlwZU5hbWUiLCJzb3VyY2VUeXBlIiwic3Vic3RyaW5nIiwibGFzdEluZGV4T2YiLCJsYXN0SWR4IiwiY29udGV4dFRvUmVzb2x2ZSIsInN1YlRhcmdldCIsInZpc2l0ZWRPYmplY3RzIiwidmlzaXRlZFN1Yk9iamVjdCIsImNvbmNhdCIsInJldmVyc2UiLCJmaW5kIiwib2JqIiwiaW50ZXJtZWRpYXRlVGFyZ2V0IiwiaGFzT3duUHJvcGVydHkiLCJhbm5vdGF0aW9uVHlwZSIsImluZmVyVHlwZUZyb21UZXJtIiwibWVzc2FnZSIsImlzQW5ub3RhdGlvblBhdGgiLCJwYXRoU3RyIiwicGFyc2VWYWx1ZSIsInByb3BlcnR5VmFsdWUiLCJ2YWx1ZUZRTiIsImNvbnRleHQiLCJTdHJpbmciLCJJbnQiLCJCb29sIiwiRGVjaW1hbCIsIkRhdGUiLCJhbGlhcyIsIkVudW1NZW1iZXIiLCJQcm9wZXJ0eVBhdGgiLCJjdXJyZW50VGVybSIsIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCJhbm5vdGF0aW9uVGFyZ2V0IiwiQW5ub3RhdGlvblBhdGgiLCJ1bnJlc29sdmVkQW5ub3RhdGlvbnMiLCJpbmxpbmUiLCJ0b1Jlc29sdmUiLCJwYXJzZVJlY29yZCIsIlJlY29yZCIsInBhcnNlQ29sbGVjdGlvbiIsIkNvbGxlY3Rpb24iLCJUZXJtVG9UeXBlcyIsImlzRXJyb3IiLCJpc0RhdGFGaWVsZFdpdGhGb3JBY3Rpb24iLCJhbm5vdGF0aW9uQ29udGVudCIsImFubm90YXRpb25UZXJtIiwiJFR5cGUiLCJwYXJzZVJlY29yZFR5cGUiLCJyZWNvcmREZWZpbml0aW9uIiwiY3VycmVudEZRTiIsIkFycmF5IiwiaXNBcnJheSIsInN1YkFubm90YXRpb25MaXN0IiwiX19zb3VyY2UiLCJjdXJyZW50U291cmNlIiwiYWRkaXRpb25hbEFubm90YXRpb25zIiwicHJvcGVydHlWYWx1ZXMiLCJBY3Rpb25UYXJnZXQiLCJBY3Rpb24iLCJnZXRPckluZmVyQ29sbGVjdGlvblR5cGUiLCJjb2xsZWN0aW9uRGVmaW5pdGlvbiIsImZpcnN0Q29sSXRlbSIsInBhcmVudEZRTiIsImNvbGxlY3Rpb25EZWZpbml0aW9uVHlwZSIsIm1hcCIsInByb3BlcnR5UGF0aCIsInByb3BlcnR5SWR4IiwicGF0aFZhbHVlIiwiYW5ub3RhdGlvbklkeCIsImFubm90YXRpb25Db2xsZWN0aW9uRWxlbWVudCIsIm5hdlByb3BlcnR5UGF0aCIsIm5hdlByb3BJZHgiLCJyZWNvcmRJZHgiLCJpZlZhbHVlIiwic3RyaW5nVmFsdWUiLCJFcnJvciIsImNvbnZlcnRBbm5vdGF0aW9uIiwicmVjb3JkIiwiY29sbGVjdGlvbiIsImNyZWF0ZVJlc29sdmVQYXRoRm4iLCJyZWxhdGl2ZVBhdGgiLCJyZXNvbHZlVjJOYXZpZ2F0aW9uUHJvcGVydHkiLCJuYXZQcm9wIiwiYXNzb2NpYXRpb25zIiwib3V0TmF2UHJvcCIsInRhcmdldEFzc29jaWF0aW9uIiwiYXNzb2NpYXRpb24iLCJyZWxhdGlvbnNoaXAiLCJhc3NvY2lhdGlvbkVuZCIsImVuZCIsInJvbGUiLCJ0b1JvbGUiLCJpc0NvbGxlY3Rpb24iLCJtdWx0aXBsaWNpdHkiLCJyZWZlcmVudGlhbENvbnN0cmFpbnQiLCJyZXNvbHZlVjROYXZpZ2F0aW9uUHJvcGVydHkiLCJwYXJ0bmVyIiwiY29udGFpbnNUYXJnZXQiLCJpc1Y0TmF2aWdhdGlvblByb3BlcnR5IiwicHJlcGFyZU5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwicmVzb2x2ZU5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwicmVzb2x2ZVBhdGgiLCJsaW5rQWN0aW9uc1RvRW50aXR5VHlwZSIsIm5hbWVzcGFjZSIsInNvdXJjZUVudGl0eVR5cGUiLCJyZXR1cm5FbnRpdHlUeXBlIiwicmV0dXJuVHlwZSIsImxpbmtFbnRpdHlUeXBlVG9FbnRpdHlTZXQiLCJrZXlQcm9wIiwiaXNLZXkiLCJsaW5rRW50aXR5VHlwZVRvU2luZ2xldG9uIiwibGlua1Byb3BlcnRpZXNUb0NvbXBsZXhUeXBlcyIsImxpbmsiLCJjb21wbGV4VHlwZU5hbWUiLCJzRXJyb3IiLCJwcmVwYXJlQ29tcGxleFR5cGVzIiwic3BsaXRUZXJtIiwidGVybVZhbHVlIiwiYWxpYXNlZFRlcm0iLCJsYXN0RG90IiwidGVybUFsaWFzIiwiY3JlYXRlR2xvYmFsUmVzb2x2ZSIsImNvbnZlcnRlZE91dHB1dCIsInNQYXRoIiwicmVzb2x2ZURpcmVjdGx5IiwidGFyZ2V0UGF0aCIsInRhcmdldFJlc29sdXRpb24iLCJvYmplY3RQYXRoIiwiYVBhdGhTcGxpdCIsInNoaWZ0IiwiZW50aXR5U2V0TmFtZSIsImV0Iiwiam9pbiIsImVuc3VyZUFubm90YXRpb25zIiwidm9jQWxpYXMiLCJfYW5ub3RhdGlvbnMiLCJwcm9jZXNzQW5ub3RhdGlvbnMiLCJiT3ZlcnJpZGVFeGlzdGluZyIsIl9iIiwidm9jVGVybSIsInZvY1Rlcm1XaXRoUXVhbGlmaWVyIiwiQm9vbGVhbiIsInByb2Nlc3NVbnJlc29sdmVkVGFyZ2V0cyIsInVucmVzb2x2ZWRUYXJnZXRzIiwicmVzb2x2YWJsZSIsInRhcmdldFRvUmVzb2x2ZSIsInRhcmdldFN0ciIsInJlc29sdmVkVGFyZ2V0IiwidGFyZ2V0U3RyaW5nIiwidGVybUluZm8iLCJtZXJnZUFubm90YXRpb25zIiwiYW5ub3RhdGlvbkxpc3RQZXJUYXJnZXQiLCJmaW5kSW5kZXgiLCJyZWZlcmVuY2VBbm5vdGF0aW9uIiwic3BsaWNlIiwib2JqZWN0TWFwRWxlbWVudCIsImFsbFRhcmdldHMiLCJleHRyYVVucmVzb2x2ZWRBbm5vdGF0aW9ucyIsImJhc2VPYmoiLCJhbm5vdGF0aW9uUGFydCIsInRhcmdldFNwbGl0Iiwic2xpY2UiLCJjdXJyZW50T2JqIiwiZXh0cmFSZWZlcmVuY2VzIiwiZmlsdGVyIiwicmVmZXJlbmNlIiwiZGVmYXVsdFJlZiIsInZlcnNpb24iLCJkaWFnbm9zdGljcyIsIl9fY3JlYXRlQmluZGluZyIsImNyZWF0ZSIsIm8iLCJtIiwiayIsImsyIiwiZGVzYyIsImdldE93blByb3BlcnR5RGVzY3JpcHRvciIsIl9fZXNNb2R1bGUiLCJ3cml0YWJsZSIsImNvbmZpZ3VyYWJsZSIsImVudW1lcmFibGUiLCJnZXQiLCJfX2V4cG9ydFN0YXIiLCJwIiwicHJvdG90eXBlIiwiY2FsbCIsInVyaSIsInVuYWxpYXNlZFZhbHVlIiwicmV2ZXJzZVJlZmVyZW5jZU1hcCIsInJlZiIsImxhc3REb3RJbmRleCIsInByZUFsaWFzIiwicG9zdEFsaWFzIiwiYWxpYXNlZFZhbHVlIiwicmVmZXJlbmNlTWFwIiwiaXNEZWNpbWFsIiwidmFsdWVPZiIsInRvU3RyaW5nIiwicmV2ZXJ0VGVybVRvR2VuZXJpY1R5cGUiLCJyZXZlcnRPYmplY3RUb1Jhd1R5cGUiLCJyZXN1bHQiLCJhbm5vIiwicmV2ZXJ0Q29sbGVjdGlvbkl0ZW1Ub1Jhd1R5cGUiLCJpc1N0cmluZyIsInZhbHVlTWF0Y2hlcyIsIkFwcGx5IiwicmV2ZXJ0VmFsdWVUb1Jhd1R5cGUiLCJ2YWx1ZUNvbnN0cnVjdG9yIiwiY29uc3RydWN0b3IiLCJ0b0ZpeGVkIiwicmVzdHJpY3RlZEtleXMiLCJyZXZlcnRBbm5vdGF0aW9uc1RvUmF3VHlwZSIsImN1cnJlbnRBbm5vdGF0aW9ucyIsInRhcmdldEFubm90YXRpb25zIiwia2V5IiwicGFyc2VkQW5ub3RhdGlvbiIsInVuYWxpYXNlZFRlcm0iLCJxdWFsaWZpZWRTcGxpdCIsImNvbGxlY3Rpb25JdGVtIiwib3V0SXRlbSIsImNvbGxlY3Rpb25LZXkiLCJiYXNlQW5ub3RhdGlvbiIsIl9fd2VicGFja19tb2R1bGVfY2FjaGVfXyIsIm1vZHVsZUlkIiwiY2FjaGVkTW9kdWxlIiwibW9kdWxlIiwiX193ZWJwYWNrX2V4cG9ydHNfXyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiLi4vZGlzdC9Bbm5vdGF0aW9uQ29udmVydGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbInZhciBBbm5vdGF0aW9uQ29udmVydGVyO1xuLyoqKioqKi8gKGZ1bmN0aW9uKCkgeyAvLyB3ZWJwYWNrQm9vdHN0cmFwXG4vKioqKioqLyBcdFwidXNlIHN0cmljdFwiO1xuLyoqKioqKi8gXHR2YXIgX193ZWJwYWNrX21vZHVsZXNfXyA9ICh7XG5cbi8qKiovIDgzMDpcbi8qKiovIChmdW5jdGlvbihfX3VudXNlZF93ZWJwYWNrX21vZHVsZSwgZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXykge1xuXG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgKHsgdmFsdWU6IHRydWUgfSkpO1xuZXhwb3J0cy5jb252ZXJ0ID0gdm9pZCAwO1xuY29uc3QgdXRpbHNfMSA9IF9fd2VicGFja19yZXF1aXJlX18oNzE2KTtcbi8qKlxuICpcbiAqL1xuY2xhc3MgUGF0aCB7XG4gICAgLyoqXG4gICAgICogQHBhcmFtIHBhdGhFeHByZXNzaW9uXG4gICAgICogQHBhcmFtIHRhcmdldE5hbWVcbiAgICAgKiBAcGFyYW0gYW5ub3RhdGlvbnNUZXJtXG4gICAgICogQHBhcmFtIHRlcm1cbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihwYXRoRXhwcmVzc2lvbiwgdGFyZ2V0TmFtZSwgYW5ub3RhdGlvbnNUZXJtLCB0ZXJtKSB7XG4gICAgICAgIHRoaXMucGF0aCA9IHBhdGhFeHByZXNzaW9uLlBhdGg7XG4gICAgICAgIHRoaXMudHlwZSA9ICdQYXRoJztcbiAgICAgICAgdGhpcy4kdGFyZ2V0ID0gdGFyZ2V0TmFtZTtcbiAgICAgICAgdGhpcy50ZXJtID0gdGVybTtcbiAgICAgICAgdGhpcy5hbm5vdGF0aW9uc1Rlcm0gPSBhbm5vdGF0aW9uc1Rlcm07XG4gICAgfVxufVxuLyoqXG4gKiBDcmVhdGVzIGEgTWFwIGJhc2VkIG9uIHRoZSBmdWxseVF1YWxpZmllZE5hbWUgb2YgZWFjaCBvYmplY3QgcGFydCBvZiB0aGUgbWV0YWRhdGEuXG4gKlxuICogQHBhcmFtIHJhd01ldGFkYXRhIHRoZSByYXdNZXRhZGF0YSB3ZSdyZSB3b3JraW5nIGFnYWluc3RcbiAqIEByZXR1cm5zIHRoZSBvYmplY3RtYXAgZm9yIGVhc3kgYWNjZXNzIHRvIHRoZSBkaWZmZXJlbnQgb2JqZWN0IG9mIHRoZSBtZXRhZGF0YVxuICovXG5mdW5jdGlvbiBidWlsZE9iamVjdE1hcChyYXdNZXRhZGF0YSkge1xuICAgIHZhciBfYTtcbiAgICBjb25zdCBvYmplY3RNYXAgPSB7fTtcbiAgICBpZiAoKF9hID0gcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eUNvbnRhaW5lcikgPT09IG51bGwgfHwgX2EgPT09IHZvaWQgMCA/IHZvaWQgMCA6IF9hLmZ1bGx5UXVhbGlmaWVkTmFtZSkge1xuICAgICAgICBvYmplY3RNYXBbcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eUNvbnRhaW5lci5mdWxseVF1YWxpZmllZE5hbWVdID0gcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eUNvbnRhaW5lcjtcbiAgICB9XG4gICAgcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eVNldHMuZm9yRWFjaCgoZW50aXR5U2V0KSA9PiB7XG4gICAgICAgIG9iamVjdE1hcFtlbnRpdHlTZXQuZnVsbHlRdWFsaWZpZWROYW1lXSA9IGVudGl0eVNldDtcbiAgICB9KTtcbiAgICByYXdNZXRhZGF0YS5zY2hlbWEuc2luZ2xldG9ucy5mb3JFYWNoKChzaW5nbGV0b24pID0+IHtcbiAgICAgICAgb2JqZWN0TWFwW3NpbmdsZXRvbi5mdWxseVF1YWxpZmllZE5hbWVdID0gc2luZ2xldG9uO1xuICAgIH0pO1xuICAgIHJhd01ldGFkYXRhLnNjaGVtYS5hY3Rpb25zLmZvckVhY2goKGFjdGlvbikgPT4ge1xuICAgICAgICBvYmplY3RNYXBbYWN0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBhY3Rpb247XG4gICAgICAgIGlmIChhY3Rpb24uaXNCb3VuZCkge1xuICAgICAgICAgICAgY29uc3QgdW5Cb3VuZEFjdGlvbk5hbWUgPSBhY3Rpb24uZnVsbHlRdWFsaWZpZWROYW1lLnNwbGl0KCcoJylbMF07XG4gICAgICAgICAgICBpZiAoIW9iamVjdE1hcFt1bkJvdW5kQWN0aW9uTmFtZV0pIHtcbiAgICAgICAgICAgICAgICBvYmplY3RNYXBbdW5Cb3VuZEFjdGlvbk5hbWVdID0ge1xuICAgICAgICAgICAgICAgICAgICBfdHlwZTogJ1VuYm91bmRHZW5lcmljQWN0aW9uJyxcbiAgICAgICAgICAgICAgICAgICAgYWN0aW9uczogW11cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb2JqZWN0TWFwW3VuQm91bmRBY3Rpb25OYW1lXS5hY3Rpb25zLnB1c2goYWN0aW9uKTtcbiAgICAgICAgICAgIGNvbnN0IGFjdGlvblNwbGl0ID0gYWN0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdCgnKCcpO1xuICAgICAgICAgICAgb2JqZWN0TWFwW2Ake2FjdGlvblNwbGl0WzFdLnNwbGl0KCcpJylbMF19LyR7YWN0aW9uU3BsaXRbMF19YF0gPSBhY3Rpb247XG4gICAgICAgIH1cbiAgICAgICAgYWN0aW9uLnBhcmFtZXRlcnMuZm9yRWFjaCgocGFyYW1ldGVyKSA9PiB7XG4gICAgICAgICAgICBvYmplY3RNYXBbcGFyYW1ldGVyLmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBwYXJhbWV0ZXI7XG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIHJhd01ldGFkYXRhLnNjaGVtYS5jb21wbGV4VHlwZXMuZm9yRWFjaCgoY29tcGxleFR5cGUpID0+IHtcbiAgICAgICAgb2JqZWN0TWFwW2NvbXBsZXhUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBjb21wbGV4VHlwZTtcbiAgICAgICAgY29tcGxleFR5cGUucHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgb2JqZWN0TWFwW3Byb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBwcm9wZXJ0eTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmF3TWV0YWRhdGEuc2NoZW1hLnR5cGVEZWZpbml0aW9ucy5mb3JFYWNoKCh0eXBlRGVmaW5pdGlvbikgPT4ge1xuICAgICAgICBvYmplY3RNYXBbdHlwZURlZmluaXRpb24uZnVsbHlRdWFsaWZpZWROYW1lXSA9IHR5cGVEZWZpbml0aW9uO1xuICAgIH0pO1xuICAgIHJhd01ldGFkYXRhLnNjaGVtYS5lbnRpdHlUeXBlcy5mb3JFYWNoKChlbnRpdHlUeXBlKSA9PiB7XG4gICAgICAgIGVudGl0eVR5cGUuYW5ub3RhdGlvbnMgPSB7fTsgLy8gJ2Fubm90YXRpb25zJyBwcm9wZXJ0eSBpcyBtYW5kYXRvcnlcbiAgICAgICAgb2JqZWN0TWFwW2VudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lXSA9IGVudGl0eVR5cGU7XG4gICAgICAgIG9iamVjdE1hcFtgQ29sbGVjdGlvbigke2VudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lfSlgXSA9IGVudGl0eVR5cGU7XG4gICAgICAgIGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgb2JqZWN0TWFwW3Byb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBwcm9wZXJ0eTtcbiAgICAgICAgICAgIC8vIEhhbmRsZSBjb21wbGV4IHR5cGVzXG4gICAgICAgICAgICBjb25zdCBjb21wbGV4VHlwZURlZmluaXRpb24gPSBvYmplY3RNYXBbcHJvcGVydHkudHlwZV07XG4gICAgICAgICAgICBpZiAoKDAsIHV0aWxzXzEuaXNDb21wbGV4VHlwZURlZmluaXRpb24pKGNvbXBsZXhUeXBlRGVmaW5pdGlvbikpIHtcbiAgICAgICAgICAgICAgICBjb21wbGV4VHlwZURlZmluaXRpb24ucHJvcGVydGllcy5mb3JFYWNoKChjb21wbGV4VHlwZVByb3ApID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgY29tcGxleFR5cGVQcm9wVGFyZ2V0ID0gT2JqZWN0LmFzc2lnbihjb21wbGV4VHlwZVByb3AsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90eXBlOiAnUHJvcGVydHknLFxuICAgICAgICAgICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiBwcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWUgKyAnLycgKyBjb21wbGV4VHlwZVByb3AubmFtZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgb2JqZWN0TWFwW2NvbXBsZXhUeXBlUHJvcFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWVdID0gY29tcGxleFR5cGVQcm9wVGFyZ2V0O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgZW50aXR5VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcy5mb3JFYWNoKChuYXZQcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgb2JqZWN0TWFwW25hdlByb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBuYXZQcm9wZXJ0eTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgT2JqZWN0LmtleXMocmF3TWV0YWRhdGEuc2NoZW1hLmFubm90YXRpb25zKS5mb3JFYWNoKChhbm5vdGF0aW9uU291cmNlKSA9PiB7XG4gICAgICAgIHJhd01ldGFkYXRhLnNjaGVtYS5hbm5vdGF0aW9uc1thbm5vdGF0aW9uU291cmNlXS5mb3JFYWNoKChhbm5vdGF0aW9uTGlzdCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgY3VycmVudFRhcmdldE5hbWUgPSAoMCwgdXRpbHNfMS51bmFsaWFzKShyYXdNZXRhZGF0YS5yZWZlcmVuY2VzLCBhbm5vdGF0aW9uTGlzdC50YXJnZXQpO1xuICAgICAgICAgICAgYW5ub3RhdGlvbkxpc3QuYW5ub3RhdGlvbnMuZm9yRWFjaCgoYW5ub3RhdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgIGxldCBhbm5vdGF0aW9uRlFOID0gYCR7Y3VycmVudFRhcmdldE5hbWV9QCR7KDAsIHV0aWxzXzEudW5hbGlhcykocmF3TWV0YWRhdGEucmVmZXJlbmNlcywgYW5ub3RhdGlvbi50ZXJtKX1gO1xuICAgICAgICAgICAgICAgIGlmIChhbm5vdGF0aW9uLnF1YWxpZmllcikge1xuICAgICAgICAgICAgICAgICAgICBhbm5vdGF0aW9uRlFOICs9IGAjJHthbm5vdGF0aW9uLnF1YWxpZmllcn1gO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBvYmplY3RNYXBbYW5ub3RhdGlvbkZRTl0gPSBhbm5vdGF0aW9uO1xuICAgICAgICAgICAgICAgIGFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lID0gYW5ub3RhdGlvbkZRTjtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gb2JqZWN0TWFwO1xufVxuLyoqXG4gKiBDb21iaW5lIHR3byBzdHJpbmdzIHJlcHJlc2VudGluZyBwYXRoIGluIHRoZSBtZXRhbW9kZWwgd2hpbGUgZW5zdXJpbmcgdGhlaXIgc3BlY2lmaWNpdGllcyAoYW5ub3RhdGlvbi4uLikgYXJlIHJlc3BlY3RlZC5cbiAqXG4gKiBAcGFyYW0gY3VycmVudFRhcmdldCB0aGUgY3VycmVudCBwYXRoXG4gKiBAcGFyYW0gcGF0aCB0aGUgcGFydCB3ZSB3YW50IHRvIGFwcGVuZFxuICogQHJldHVybnMgdGhlIGNvbXBsZXRlIHBhdGggaW5jbHVkaW5nIHRoZSBleHRlbnNpb24uXG4gKi9cbmZ1bmN0aW9uIGNvbWJpbmVQYXRoKGN1cnJlbnRUYXJnZXQsIHBhdGgpIHtcbiAgICBpZiAocGF0aC5zdGFydHNXaXRoKCdAJykpIHtcbiAgICAgICAgcmV0dXJuIGN1cnJlbnRUYXJnZXQgKyAoMCwgdXRpbHNfMS51bmFsaWFzKSh1dGlsc18xLmRlZmF1bHRSZWZlcmVuY2VzLCBwYXRoKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50VGFyZ2V0ICsgJy8nICsgcGF0aDtcbiAgICB9XG59XG5jb25zdCBBTExfQU5OT1RBVElPTl9FUlJPUlMgPSB7fTtcbmxldCBBTk5PVEFUSU9OX0VSUk9SUyA9IFtdO1xuLyoqXG4gKiBAcGFyYW0gcGF0aFxuICogQHBhcmFtIG9FcnJvck1zZ1xuICovXG5mdW5jdGlvbiBhZGRBbm5vdGF0aW9uRXJyb3JNZXNzYWdlKHBhdGgsIG9FcnJvck1zZykge1xuICAgIGlmICghQUxMX0FOTk9UQVRJT05fRVJST1JTW3BhdGhdKSB7XG4gICAgICAgIEFMTF9BTk5PVEFUSU9OX0VSUk9SU1twYXRoXSA9IFtvRXJyb3JNc2ddO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgQUxMX0FOTk9UQVRJT05fRVJST1JTW3BhdGhdLnB1c2gob0Vycm9yTXNnKTtcbiAgICB9XG59XG4vKipcbiAqIFJlc29sdmVzIGEgc3BlY2lmaWMgcGF0aCBiYXNlZCBvbiB0aGUgb2JqZWN0TWFwLlxuICpcbiAqIEBwYXJhbSBvYmplY3RNYXBcbiAqIEBwYXJhbSBjdXJyZW50VGFyZ2V0XG4gKiBAcGFyYW0gcGF0aFxuICogQHBhcmFtIHBhdGhPbmx5XG4gKiBAcGFyYW0gaW5jbHVkZVZpc2l0ZWRPYmplY3RzXG4gKiBAcGFyYW0gYW5ub3RhdGlvbnNUZXJtXG4gKiBAcmV0dXJucyB0aGUgcmVzb2x2ZWQgb2JqZWN0XG4gKi9cbmZ1bmN0aW9uIF9yZXNvbHZlVGFyZ2V0KG9iamVjdE1hcCwgY3VycmVudFRhcmdldCwgcGF0aCwgcGF0aE9ubHkgPSBmYWxzZSwgaW5jbHVkZVZpc2l0ZWRPYmplY3RzID0gZmFsc2UsIGFubm90YXRpb25zVGVybSkge1xuICAgIGxldCBvRXJyb3JNc2c7XG4gICAgaWYgKCFwYXRoKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIGNvbnN0IGFWaXNpdGVkT2JqZWN0cyA9IFtdO1xuICAgIGlmIChjdXJyZW50VGFyZ2V0ICYmIGN1cnJlbnRUYXJnZXQuX3R5cGUgPT09ICdQcm9wZXJ0eScpIHtcbiAgICAgICAgY3VycmVudFRhcmdldCA9IG9iamVjdE1hcFtjdXJyZW50VGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdCgnLycpWzBdXTtcbiAgICB9XG4gICAgcGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lLCBwYXRoKTtcbiAgICBjb25zdCBwYXRoU3BsaXQgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgY29uc3QgdGFyZ2V0UGF0aFNwbGl0ID0gW107XG4gICAgcGF0aFNwbGl0LmZvckVhY2goKHBhdGhQYXJ0KSA9PiB7XG4gICAgICAgIC8vIFNlcGFyYXRlIG91dCB0aGUgYW5ub3RhdGlvblxuICAgICAgICBpZiAocGF0aFBhcnQuaW5kZXhPZignQCcpICE9PSAtMSkge1xuICAgICAgICAgICAgY29uc3QgW3NwbGl0dGVkUGF0aCwgYW5ub3RhdGlvblBhdGhdID0gcGF0aFBhcnQuc3BsaXQoJ0AnKTtcbiAgICAgICAgICAgIHRhcmdldFBhdGhTcGxpdC5wdXNoKHNwbGl0dGVkUGF0aCk7XG4gICAgICAgICAgICB0YXJnZXRQYXRoU3BsaXQucHVzaChgQCR7YW5ub3RhdGlvblBhdGh9YCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXRQYXRoU3BsaXQucHVzaChwYXRoUGFydCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBsZXQgY3VycmVudFBhdGggPSBwYXRoO1xuICAgIGxldCBjdXJyZW50Q29udGV4dCA9IGN1cnJlbnRUYXJnZXQ7XG4gICAgY29uc3QgdGFyZ2V0ID0gdGFyZ2V0UGF0aFNwbGl0LnJlZHVjZSgoY3VycmVudFZhbHVlLCBwYXRoUGFydCkgPT4ge1xuICAgICAgICBpZiAocGF0aFBhcnQgPT09ICckVHlwZScgJiYgY3VycmVudFZhbHVlLl90eXBlID09PSAnRW50aXR5VHlwZScpIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhdGhQYXJ0ID09PSAnJCcgJiYgY3VycmVudFZhbHVlLl90eXBlID09PSAnRW50aXR5U2V0Jykge1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoKHBhdGhQYXJ0ID09PSAnQCR1aTUub3ZlcmxvYWQnIHx8IHBhdGhQYXJ0ID09PSAnMCcpICYmIGN1cnJlbnRWYWx1ZS5fdHlwZSA9PT0gJ0FjdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhdGhQYXJ0Lmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgLy8gRW1wdHkgUGF0aCBhZnRlciBhbiBlbnRpdHlTZXQgbWVhbnMgZW50aXR5VHlwZVxuICAgICAgICAgICAgaWYgKGN1cnJlbnRWYWx1ZSAmJlxuICAgICAgICAgICAgICAgIChjdXJyZW50VmFsdWUuX3R5cGUgPT09ICdFbnRpdHlTZXQnIHx8IGN1cnJlbnRWYWx1ZS5fdHlwZSA9PT0gJ1NpbmdsZXRvbicpICYmXG4gICAgICAgICAgICAgICAgY3VycmVudFZhbHVlLmVudGl0eVR5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoaW5jbHVkZVZpc2l0ZWRPYmplY3RzKSB7XG4gICAgICAgICAgICAgICAgICAgIGFWaXNpdGVkT2JqZWN0cy5wdXNoKGN1cnJlbnRWYWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IGN1cnJlbnRWYWx1ZS5lbnRpdHlUeXBlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGN1cnJlbnRWYWx1ZSAmJiBjdXJyZW50VmFsdWUuX3R5cGUgPT09ICdOYXZpZ2F0aW9uUHJvcGVydHknICYmIGN1cnJlbnRWYWx1ZS50YXJnZXRUeXBlKSB7XG4gICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVWaXNpdGVkT2JqZWN0cykge1xuICAgICAgICAgICAgICAgICAgICBhVmlzaXRlZE9iamVjdHMucHVzaChjdXJyZW50VmFsdWUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdXJyZW50VmFsdWUgPSBjdXJyZW50VmFsdWUudGFyZ2V0VHlwZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBjdXJyZW50VmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluY2x1ZGVWaXNpdGVkT2JqZWN0cyAmJiBjdXJyZW50VmFsdWUgIT09IG51bGwgJiYgY3VycmVudFZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGFWaXNpdGVkT2JqZWN0cy5wdXNoKGN1cnJlbnRWYWx1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjdXJyZW50VmFsdWUpIHtcbiAgICAgICAgICAgIGN1cnJlbnRQYXRoID0gcGF0aFBhcnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoKGN1cnJlbnRWYWx1ZS5fdHlwZSA9PT0gJ0VudGl0eVNldCcgfHwgY3VycmVudFZhbHVlLl90eXBlID09PSAnU2luZ2xldG9uJykgJiYgcGF0aFBhcnQgPT09ICckVHlwZScpIHtcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IGN1cnJlbnRWYWx1ZS50YXJnZXRUeXBlO1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICgoY3VycmVudFZhbHVlLl90eXBlID09PSAnRW50aXR5U2V0JyB8fCBjdXJyZW50VmFsdWUuX3R5cGUgPT09ICdTaW5nbGV0b24nKSAmJlxuICAgICAgICAgICAgcGF0aFBhcnQgPT09ICckTmF2aWdhdGlvblByb3BlcnR5QmluZGluZycpIHtcbiAgICAgICAgICAgIGN1cnJlbnRWYWx1ZSA9IGN1cnJlbnRWYWx1ZS5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nO1xuICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICgoY3VycmVudFZhbHVlLl90eXBlID09PSAnRW50aXR5U2V0JyB8fCBjdXJyZW50VmFsdWUuX3R5cGUgPT09ICdTaW5nbGV0b24nKSAmJlxuICAgICAgICAgICAgY3VycmVudFZhbHVlLmVudGl0eVR5cGUpIHtcbiAgICAgICAgICAgIGN1cnJlbnRQYXRoID0gY29tYmluZVBhdGgoY3VycmVudFZhbHVlLmVudGl0eVR5cGVOYW1lLCBwYXRoUGFydCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY3VycmVudFZhbHVlLl90eXBlID09PSAnTmF2aWdhdGlvblByb3BlcnR5Jykge1xuICAgICAgICAgICAgY3VycmVudFBhdGggPSBjb21iaW5lUGF0aChjdXJyZW50VmFsdWUuZnVsbHlRdWFsaWZpZWROYW1lLCBwYXRoUGFydCk7XG4gICAgICAgICAgICBpZiAoIW9iamVjdE1hcFtjdXJyZW50UGF0aF0pIHtcbiAgICAgICAgICAgICAgICAvLyBGYWxsYmFjayBsb2cgZXJyb3JcbiAgICAgICAgICAgICAgICBjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRWYWx1ZS50YXJnZXRUeXBlTmFtZSwgcGF0aFBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGN1cnJlbnRWYWx1ZS5fdHlwZSA9PT0gJ1Byb3BlcnR5Jykge1xuICAgICAgICAgICAgLy8gQ29tcGxleFR5cGUgb3IgUHJvcGVydHlcbiAgICAgICAgICAgIGlmIChjdXJyZW50VmFsdWUudGFyZ2V0VHlwZSkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRQYXRoID0gY29tYmluZVBhdGgoY3VycmVudFZhbHVlLnRhcmdldFR5cGUuZnVsbHlRdWFsaWZpZWROYW1lLCBwYXRoUGFydCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRWYWx1ZS5mdWxseVF1YWxpZmllZE5hbWUsIHBhdGhQYXJ0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjdXJyZW50VmFsdWUuX3R5cGUgPT09ICdBY3Rpb24nICYmIGN1cnJlbnRWYWx1ZS5pc0JvdW5kKSB7XG4gICAgICAgICAgICBjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGN1cnJlbnRWYWx1ZS5mdWxseVF1YWxpZmllZE5hbWUsIHBhdGhQYXJ0KTtcbiAgICAgICAgICAgIGlmIChwYXRoUGFydCA9PT0gJyRQYXJhbWV0ZXInKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGN1cnJlbnRWYWx1ZS5wYXJhbWV0ZXJzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFvYmplY3RNYXBbY3VycmVudFBhdGhdKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudFBhdGggPSBjb21iaW5lUGF0aChjdXJyZW50VmFsdWUuc291cmNlVHlwZSwgcGF0aFBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGN1cnJlbnRWYWx1ZS5fdHlwZSA9PT0gJ0FjdGlvblBhcmFtZXRlcicpIHtcbiAgICAgICAgICAgIGN1cnJlbnRQYXRoID0gY29tYmluZVBhdGgoY3VycmVudFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUuc3Vic3RyaW5nKDAsIGN1cnJlbnRUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lLmxhc3RJbmRleE9mKCcvJykpLCBwYXRoUGFydCk7XG4gICAgICAgICAgICBpZiAoIW9iamVjdE1hcFtjdXJyZW50UGF0aF0pIHtcbiAgICAgICAgICAgICAgICBsZXQgbGFzdElkeCA9IGN1cnJlbnRUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lLmxhc3RJbmRleE9mKCcvJyk7XG4gICAgICAgICAgICAgICAgaWYgKGxhc3RJZHggPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGxhc3RJZHggPSBjdXJyZW50VGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZS5sZW5ndGg7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGN1cnJlbnRQYXRoID0gY29tYmluZVBhdGgob2JqZWN0TWFwW2N1cnJlbnRUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lLnN1YnN0cmluZygwLCBsYXN0SWR4KV0uc291cmNlVHlwZSwgcGF0aFBhcnQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY3VycmVudFBhdGggPSBjb21iaW5lUGF0aChjdXJyZW50VmFsdWUuZnVsbHlRdWFsaWZpZWROYW1lLCBwYXRoUGFydCk7XG4gICAgICAgICAgICBpZiAocGF0aFBhcnQgIT09ICduYW1lJyAmJiBjdXJyZW50VmFsdWVbcGF0aFBhcnRdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlW3BhdGhQYXJ0XTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHBhdGhQYXJ0ID09PSAnJEFubm90YXRpb25QYXRoJyAmJiBjdXJyZW50VmFsdWUuJHRhcmdldCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGNvbnRleHRUb1Jlc29sdmUgPSBvYmplY3RNYXBbY3VycmVudFZhbHVlLmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdCgnQCcpWzBdXTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdWJUYXJnZXQgPSBfcmVzb2x2ZVRhcmdldChvYmplY3RNYXAsIGNvbnRleHRUb1Jlc29sdmUsIGN1cnJlbnRWYWx1ZS52YWx1ZSwgZmFsc2UsIHRydWUpO1xuICAgICAgICAgICAgICAgIHN1YlRhcmdldC52aXNpdGVkT2JqZWN0cy5mb3JFYWNoKCh2aXNpdGVkU3ViT2JqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhVmlzaXRlZE9iamVjdHMuaW5kZXhPZih2aXNpdGVkU3ViT2JqZWN0KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFWaXNpdGVkT2JqZWN0cy5wdXNoKHZpc2l0ZWRTdWJPYmplY3QpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1YlRhcmdldC50YXJnZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChwYXRoUGFydCA9PT0gJyRQYXRoJyAmJiBjdXJyZW50VmFsdWUuJHRhcmdldCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnRDb250ZXh0ID0gYVZpc2l0ZWRPYmplY3RzXG4gICAgICAgICAgICAgICAgICAgIC5jb25jYXQoKVxuICAgICAgICAgICAgICAgICAgICAucmV2ZXJzZSgpXG4gICAgICAgICAgICAgICAgICAgIC5maW5kKChvYmopID0+IG9iai5fdHlwZSA9PT0gJ0VudGl0eVR5cGUnIHx8XG4gICAgICAgICAgICAgICAgICAgIG9iai5fdHlwZSA9PT0gJ0VudGl0eVNldCcgfHxcbiAgICAgICAgICAgICAgICAgICAgb2JqLl90eXBlID09PSAnU2luZ2xldG9uJyB8fFxuICAgICAgICAgICAgICAgICAgICBvYmouX3R5cGUgPT09ICdOYXZpZ2F0aW9uUHJvcGVydHknKTtcbiAgICAgICAgICAgICAgICBpZiAoY3VycmVudENvbnRleHQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViVGFyZ2V0ID0gX3Jlc29sdmVUYXJnZXQob2JqZWN0TWFwLCBjdXJyZW50Q29udGV4dCwgY3VycmVudFZhbHVlLnBhdGgsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgc3ViVGFyZ2V0LnZpc2l0ZWRPYmplY3RzLmZvckVhY2goKHZpc2l0ZWRTdWJPYmplY3QpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhVmlzaXRlZE9iamVjdHMuaW5kZXhPZih2aXNpdGVkU3ViT2JqZWN0KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBhVmlzaXRlZE9iamVjdHMucHVzaCh2aXNpdGVkU3ViT2JqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdWJUYXJnZXQudGFyZ2V0O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gY3VycmVudFZhbHVlLiR0YXJnZXQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChwYXRoUGFydC5zdGFydHNXaXRoKCckUGF0aCcpICYmIGN1cnJlbnRWYWx1ZS4kdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgY29uc3QgaW50ZXJtZWRpYXRlVGFyZ2V0ID0gY3VycmVudFZhbHVlLiR0YXJnZXQ7XG4gICAgICAgICAgICAgICAgY3VycmVudFBhdGggPSBjb21iaW5lUGF0aChpbnRlcm1lZGlhdGVUYXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lLCBwYXRoUGFydC5zdWJzdHJpbmcoNSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAoY3VycmVudFZhbHVlLmhhc093blByb3BlcnR5KCckVHlwZScpICYmICFvYmplY3RNYXBbY3VycmVudFBhdGhdKSB7XG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBub3cgYW4gYW5ub3RhdGlvbiB2YWx1ZVxuICAgICAgICAgICAgICAgIGNvbnN0IGVudGl0eVR5cGUgPSBvYmplY3RNYXBbY3VycmVudFZhbHVlLmZ1bGx5UXVhbGlmaWVkTmFtZS5zcGxpdCgnQCcpWzBdXTtcbiAgICAgICAgICAgICAgICBpZiAoZW50aXR5VHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBjdXJyZW50UGF0aCA9IGNvbWJpbmVQYXRoKGVudGl0eVR5cGUuZnVsbHlRdWFsaWZpZWROYW1lLCBwYXRoUGFydCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvYmplY3RNYXBbY3VycmVudFBhdGhdO1xuICAgIH0sIG51bGwpO1xuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIGlmIChhbm5vdGF0aW9uc1Rlcm0pIHtcbiAgICAgICAgICAgIGNvbnN0IGFubm90YXRpb25UeXBlID0gaW5mZXJUeXBlRnJvbVRlcm0oYW5ub3RhdGlvbnNUZXJtLCBjdXJyZW50VGFyZ2V0KTtcbiAgICAgICAgICAgIG9FcnJvck1zZyA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVW5hYmxlIHRvIHJlc29sdmUgdGhlIHBhdGggZXhwcmVzc2lvbjogJyArXG4gICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgcGF0aCArXG4gICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgJ1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAnSGludDogQ2hlY2sgYW5kIGNvcnJlY3QgdGhlIHBhdGggdmFsdWVzIHVuZGVyIHRoZSBmb2xsb3dpbmcgc3RydWN0dXJlIGluIHRoZSBtZXRhZGF0YSAoYW5ub3RhdGlvbi54bWwgZmlsZSBvciBDRFMgYW5ub3RhdGlvbnMgZm9yIHRoZSBhcHBsaWNhdGlvbik6IFxcblxcbicgK1xuICAgICAgICAgICAgICAgICAgICAnPEFubm90YXRpb24gVGVybSA9ICcgK1xuICAgICAgICAgICAgICAgICAgICBhbm5vdGF0aW9uc1Rlcm0gK1xuICAgICAgICAgICAgICAgICAgICAnPicgK1xuICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICc8UmVjb3JkIFR5cGUgPSAnICtcbiAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvblR5cGUgK1xuICAgICAgICAgICAgICAgICAgICAnPicgK1xuICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICc8QW5ub3RhdGlvblBhdGggPSAnICtcbiAgICAgICAgICAgICAgICAgICAgcGF0aCArXG4gICAgICAgICAgICAgICAgICAgICc+J1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGFkZEFubm90YXRpb25FcnJvck1lc3NhZ2UocGF0aCwgb0Vycm9yTXNnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIG9FcnJvck1zZyA9IHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVW5hYmxlIHRvIHJlc29sdmUgdGhlIHBhdGggZXhwcmVzc2lvbjogJyArXG4gICAgICAgICAgICAgICAgICAgIHBhdGggK1xuICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgJ0hpbnQ6IENoZWNrIGFuZCBjb3JyZWN0IHRoZSBwYXRoIHZhbHVlcyB1bmRlciB0aGUgZm9sbG93aW5nIHN0cnVjdHVyZSBpbiB0aGUgbWV0YWRhdGEgKGFubm90YXRpb24ueG1sIGZpbGUgb3IgQ0RTIGFubm90YXRpb25zIGZvciB0aGUgYXBwbGljYXRpb24pOiBcXG5cXG4nICtcbiAgICAgICAgICAgICAgICAgICAgJzxBbm5vdGF0aW9uIFRlcm0gPSAnICtcbiAgICAgICAgICAgICAgICAgICAgcGF0aFNwbGl0WzBdICtcbiAgICAgICAgICAgICAgICAgICAgJz4nICtcbiAgICAgICAgICAgICAgICAgICAgJ1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAnPFByb3BlcnR5VmFsdWUgIFBhdGg9ICcgK1xuICAgICAgICAgICAgICAgICAgICBwYXRoU3BsaXRbMV0gK1xuICAgICAgICAgICAgICAgICAgICAnPidcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBhZGRBbm5vdGF0aW9uRXJyb3JNZXNzYWdlKHBhdGgsIG9FcnJvck1zZyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKHBhdGhPbmx5KSB7XG4gICAgICAgIHJldHVybiBjdXJyZW50UGF0aDtcbiAgICB9XG4gICAgaWYgKGluY2x1ZGVWaXNpdGVkT2JqZWN0cykge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgdmlzaXRlZE9iamVjdHM6IGFWaXNpdGVkT2JqZWN0cyxcbiAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0XG4gICAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiB0YXJnZXQ7XG59XG4vKipcbiAqIFR5cGVndWFyZCB0byBjaGVjayBpZiB0aGUgcGF0aCBjb250YWlucyBhbiBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSBwYXRoU3RyIHRoZSBwYXRoIHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyB0cnVlIGlmIHRoZXJlIGlzIGFuIGFubm90YXRpb24gaW4gdGhlIHBhdGguXG4gKi9cbmZ1bmN0aW9uIGlzQW5ub3RhdGlvblBhdGgocGF0aFN0cikge1xuICAgIHJldHVybiBwYXRoU3RyLmluZGV4T2YoJ0AnKSAhPT0gLTE7XG59XG5mdW5jdGlvbiBwYXJzZVZhbHVlKHByb3BlcnR5VmFsdWUsIHZhbHVlRlFOLCBvYmplY3RNYXAsIGNvbnRleHQpIHtcbiAgICBpZiAocHJvcGVydHlWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHN3aXRjaCAocHJvcGVydHlWYWx1ZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ1N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHlWYWx1ZS5TdHJpbmc7XG4gICAgICAgIGNhc2UgJ0ludCc6XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHlWYWx1ZS5JbnQ7XG4gICAgICAgIGNhc2UgJ0Jvb2wnOlxuICAgICAgICAgICAgcmV0dXJuIHByb3BlcnR5VmFsdWUuQm9vbDtcbiAgICAgICAgY2FzZSAnRGVjaW1hbCc6XG4gICAgICAgICAgICByZXR1cm4gKDAsIHV0aWxzXzEuRGVjaW1hbCkocHJvcGVydHlWYWx1ZS5EZWNpbWFsKTtcbiAgICAgICAgY2FzZSAnRGF0ZSc6XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHlWYWx1ZS5EYXRlO1xuICAgICAgICBjYXNlICdFbnVtTWVtYmVyJzpcbiAgICAgICAgICAgIHJldHVybiAoMCwgdXRpbHNfMS5hbGlhcykoY29udGV4dC5yYXdNZXRhZGF0YS5yZWZlcmVuY2VzLCBwcm9wZXJ0eVZhbHVlLkVudW1NZW1iZXIpO1xuICAgICAgICBjYXNlICdQcm9wZXJ0eVBhdGgnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnUHJvcGVydHlQYXRoJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcGVydHlWYWx1ZS5Qcm9wZXJ0eVBhdGgsXG4gICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiB2YWx1ZUZRTixcbiAgICAgICAgICAgICAgICAkdGFyZ2V0OiBfcmVzb2x2ZVRhcmdldChvYmplY3RNYXAsIGNvbnRleHQuY3VycmVudFRhcmdldCwgcHJvcGVydHlWYWx1ZS5Qcm9wZXJ0eVBhdGgsIGZhbHNlLCBmYWxzZSwgY29udGV4dC5jdXJyZW50VGVybSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnOlxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHByb3BlcnR5VmFsdWUuTmF2aWdhdGlvblByb3BlcnR5UGF0aCxcbiAgICAgICAgICAgICAgICBmdWxseVF1YWxpZmllZE5hbWU6IHZhbHVlRlFOLFxuICAgICAgICAgICAgICAgICR0YXJnZXQ6IF9yZXNvbHZlVGFyZ2V0KG9iamVjdE1hcCwgY29udGV4dC5jdXJyZW50VGFyZ2V0LCBwcm9wZXJ0eVZhbHVlLk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsIGZhbHNlLCBmYWxzZSwgY29udGV4dC5jdXJyZW50VGVybSlcbiAgICAgICAgICAgIH07XG4gICAgICAgIGNhc2UgJ0Fubm90YXRpb25QYXRoJzpcbiAgICAgICAgICAgIGNvbnN0IGFubm90YXRpb25UYXJnZXQgPSBfcmVzb2x2ZVRhcmdldChvYmplY3RNYXAsIGNvbnRleHQuY3VycmVudFRhcmdldCwgKDAsIHV0aWxzXzEudW5hbGlhcykoY29udGV4dC5yYXdNZXRhZGF0YS5yZWZlcmVuY2VzLCBwcm9wZXJ0eVZhbHVlLkFubm90YXRpb25QYXRoKSwgdHJ1ZSwgZmFsc2UsIGNvbnRleHQuY3VycmVudFRlcm0pO1xuICAgICAgICAgICAgY29uc3QgYW5ub3RhdGlvblBhdGggPSB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ0Fubm90YXRpb25QYXRoJyxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcGVydHlWYWx1ZS5Bbm5vdGF0aW9uUGF0aCxcbiAgICAgICAgICAgICAgICBmdWxseVF1YWxpZmllZE5hbWU6IHZhbHVlRlFOLFxuICAgICAgICAgICAgICAgICR0YXJnZXQ6IGFubm90YXRpb25UYXJnZXQsXG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbnNUZXJtOiBjb250ZXh0LmN1cnJlbnRUZXJtLFxuICAgICAgICAgICAgICAgIHRlcm06ICcnLFxuICAgICAgICAgICAgICAgIHBhdGg6ICcnXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29udGV4dC51bnJlc29sdmVkQW5ub3RhdGlvbnMucHVzaCh7IGlubGluZTogZmFsc2UsIHRvUmVzb2x2ZTogYW5ub3RhdGlvblBhdGggfSk7XG4gICAgICAgICAgICByZXR1cm4gYW5ub3RhdGlvblBhdGg7XG4gICAgICAgIGNhc2UgJ1BhdGgnOlxuICAgICAgICAgICAgY29uc3QgJHRhcmdldCA9IF9yZXNvbHZlVGFyZ2V0KG9iamVjdE1hcCwgY29udGV4dC5jdXJyZW50VGFyZ2V0LCBwcm9wZXJ0eVZhbHVlLlBhdGgsIHRydWUsIGZhbHNlLCBjb250ZXh0LmN1cnJlbnRUZXJtKTtcbiAgICAgICAgICAgIGNvbnN0IHBhdGggPSBuZXcgUGF0aChwcm9wZXJ0eVZhbHVlLCAkdGFyZ2V0LCBjb250ZXh0LmN1cnJlbnRUZXJtLCAnJyk7XG4gICAgICAgICAgICBjb250ZXh0LnVucmVzb2x2ZWRBbm5vdGF0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICBpbmxpbmU6IGlzQW5ub3RhdGlvblBhdGgocHJvcGVydHlWYWx1ZS5QYXRoKSxcbiAgICAgICAgICAgICAgICB0b1Jlc29sdmU6IHBhdGhcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICAgIGNhc2UgJ1JlY29yZCc6XG4gICAgICAgICAgICByZXR1cm4gcGFyc2VSZWNvcmQocHJvcGVydHlWYWx1ZS5SZWNvcmQsIHZhbHVlRlFOLCBvYmplY3RNYXAsIGNvbnRleHQpO1xuICAgICAgICBjYXNlICdDb2xsZWN0aW9uJzpcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUNvbGxlY3Rpb24ocHJvcGVydHlWYWx1ZS5Db2xsZWN0aW9uLCB2YWx1ZUZRTiwgb2JqZWN0TWFwLCBjb250ZXh0KTtcbiAgICAgICAgY2FzZSAnQXBwbHknOlxuICAgICAgICBjYXNlICdOdWxsJzpcbiAgICAgICAgY2FzZSAnTm90JzpcbiAgICAgICAgY2FzZSAnRXEnOlxuICAgICAgICBjYXNlICdOZSc6XG4gICAgICAgIGNhc2UgJ0d0JzpcbiAgICAgICAgY2FzZSAnR2UnOlxuICAgICAgICBjYXNlICdMdCc6XG4gICAgICAgIGNhc2UgJ0xlJzpcbiAgICAgICAgY2FzZSAnSWYnOlxuICAgICAgICBjYXNlICdBbmQnOlxuICAgICAgICBjYXNlICdPcic6XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICByZXR1cm4gcHJvcGVydHlWYWx1ZTtcbiAgICB9XG59XG4vKipcbiAqIEluZmVyIHRoZSB0eXBlIG9mIGEgdGVybSBiYXNlZCBvbiBpdHMgdHlwZS5cbiAqXG4gKiBAcGFyYW0gYW5ub3RhdGlvbnNUZXJtIFRoZSBhbm5vdGF0aW9uIHRlcm1cbiAqIEBwYXJhbSBhbm5vdGF0aW9uVGFyZ2V0IHRoZSBhbm5vdGF0aW9uIHRhcmdldFxuICogQHJldHVybnMgdGhlIGluZmVycmVkIHR5cGUuXG4gKi9cbmZ1bmN0aW9uIGluZmVyVHlwZUZyb21UZXJtKGFubm90YXRpb25zVGVybSwgYW5ub3RhdGlvblRhcmdldCkge1xuICAgIGNvbnN0IHRhcmdldFR5cGUgPSB1dGlsc18xLlRlcm1Ub1R5cGVzW2Fubm90YXRpb25zVGVybV07XG4gICAgY29uc3Qgb0Vycm9yTXNnID0ge1xuICAgICAgICBpc0Vycm9yOiBmYWxzZSxcbiAgICAgICAgbWVzc2FnZTogYFRoZSB0eXBlIG9mIHRoZSByZWNvcmQgdXNlZCB3aXRoaW4gdGhlIHRlcm0gJHthbm5vdGF0aW9uc1Rlcm19IHdhcyBub3QgZGVmaW5lZCBhbmQgd2FzIGluZmVycmVkIGFzICR7dGFyZ2V0VHlwZX0uXG5IaW50OiBJZiBwb3NzaWJsZSwgdHJ5IHRvIG1haW50YWluIHRoZSBUeXBlIHByb3BlcnR5IGZvciBlYWNoIFJlY29yZC5cbjxBbm5vdGF0aW9ucyBUYXJnZXQ9XCIke2Fubm90YXRpb25UYXJnZXR9XCI+XG5cdDxBbm5vdGF0aW9uIFRlcm09XCIke2Fubm90YXRpb25zVGVybX1cIj5cblx0XHQ8UmVjb3JkPi4uLjwvUmVjb3JkPlxuXHQ8L0Fubm90YXRpb24+XG48L0Fubm90YXRpb25zPmBcbiAgICB9O1xuICAgIGFkZEFubm90YXRpb25FcnJvck1lc3NhZ2UoYW5ub3RhdGlvblRhcmdldCArICcvJyArIGFubm90YXRpb25zVGVybSwgb0Vycm9yTXNnKTtcbiAgICByZXR1cm4gdGFyZ2V0VHlwZTtcbn1cbmZ1bmN0aW9uIGlzRGF0YUZpZWxkV2l0aEZvckFjdGlvbihhbm5vdGF0aW9uQ29udGVudCwgYW5ub3RhdGlvblRlcm0pIHtcbiAgICByZXR1cm4gKGFubm90YXRpb25Db250ZW50Lmhhc093blByb3BlcnR5KCdBY3Rpb24nKSAmJlxuICAgICAgICAoYW5ub3RhdGlvblRlcm0uJFR5cGUgPT09ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb24nIHx8XG4gICAgICAgICAgICBhbm5vdGF0aW9uVGVybS4kVHlwZSA9PT0gJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFdpdGhBY3Rpb24nKSk7XG59XG5mdW5jdGlvbiBwYXJzZVJlY29yZFR5cGUocmVjb3JkRGVmaW5pdGlvbiwgY29udGV4dCkge1xuICAgIGxldCB0YXJnZXRUeXBlO1xuICAgIGlmICghcmVjb3JkRGVmaW5pdGlvbi50eXBlICYmIGNvbnRleHQuY3VycmVudFRlcm0pIHtcbiAgICAgICAgdGFyZ2V0VHlwZSA9IGluZmVyVHlwZUZyb21UZXJtKGNvbnRleHQuY3VycmVudFRlcm0sIGNvbnRleHQuY3VycmVudFRhcmdldC5mdWxseVF1YWxpZmllZE5hbWUpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGFyZ2V0VHlwZSA9ICgwLCB1dGlsc18xLnVuYWxpYXMpKGNvbnRleHQucmF3TWV0YWRhdGEucmVmZXJlbmNlcywgcmVjb3JkRGVmaW5pdGlvbi50eXBlKTtcbiAgICB9XG4gICAgcmV0dXJuIHRhcmdldFR5cGU7XG59XG5mdW5jdGlvbiBwYXJzZVJlY29yZChyZWNvcmREZWZpbml0aW9uLCBjdXJyZW50RlFOLCBvYmplY3RNYXAsIGNvbnRleHQpIHtcbiAgICBjb25zdCB0YXJnZXRUeXBlID0gcGFyc2VSZWNvcmRUeXBlKHJlY29yZERlZmluaXRpb24sIGNvbnRleHQpO1xuICAgIGNvbnN0IGFubm90YXRpb25UZXJtID0ge1xuICAgICAgICAkVHlwZTogdGFyZ2V0VHlwZSxcbiAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiBjdXJyZW50RlFOLFxuICAgICAgICBhbm5vdGF0aW9uczoge31cbiAgICB9O1xuICAgIGNvbnN0IGFubm90YXRpb25Db250ZW50ID0ge307XG4gICAgaWYgKEFycmF5LmlzQXJyYXkocmVjb3JkRGVmaW5pdGlvbi5hbm5vdGF0aW9ucykpIHtcbiAgICAgICAgY29uc3Qgc3ViQW5ub3RhdGlvbkxpc3QgPSB7XG4gICAgICAgICAgICB0YXJnZXQ6IGN1cnJlbnRGUU4sXG4gICAgICAgICAgICBhbm5vdGF0aW9uczogcmVjb3JkRGVmaW5pdGlvbi5hbm5vdGF0aW9ucyxcbiAgICAgICAgICAgIF9fc291cmNlOiBjb250ZXh0LmN1cnJlbnRTb3VyY2VcbiAgICAgICAgfTtcbiAgICAgICAgY29udGV4dC5hZGRpdGlvbmFsQW5ub3RhdGlvbnMucHVzaChzdWJBbm5vdGF0aW9uTGlzdCk7XG4gICAgfVxuICAgIGlmIChyZWNvcmREZWZpbml0aW9uLnByb3BlcnR5VmFsdWVzKSB7XG4gICAgICAgIHJlY29yZERlZmluaXRpb24ucHJvcGVydHlWYWx1ZXMuZm9yRWFjaCgocHJvcGVydHlWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgYW5ub3RhdGlvbkNvbnRlbnRbcHJvcGVydHlWYWx1ZS5uYW1lXSA9IHBhcnNlVmFsdWUocHJvcGVydHlWYWx1ZS52YWx1ZSwgYCR7Y3VycmVudEZRTn0vJHtwcm9wZXJ0eVZhbHVlLm5hbWV9YCwgb2JqZWN0TWFwLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHByb3BlcnR5VmFsdWUuYW5ub3RhdGlvbnMpKSB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViQW5ub3RhdGlvbkxpc3QgPSB7XG4gICAgICAgICAgICAgICAgICAgIHRhcmdldDogYCR7Y3VycmVudEZRTn0vJHtwcm9wZXJ0eVZhbHVlLm5hbWV9YCxcbiAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IHByb3BlcnR5VmFsdWUuYW5ub3RhdGlvbnMsXG4gICAgICAgICAgICAgICAgICAgIF9fc291cmNlOiBjb250ZXh0LmN1cnJlbnRTb3VyY2VcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnRleHQuYWRkaXRpb25hbEFubm90YXRpb25zLnB1c2goc3ViQW5ub3RhdGlvbkxpc3QpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGlzRGF0YUZpZWxkV2l0aEZvckFjdGlvbihhbm5vdGF0aW9uQ29udGVudCwgYW5ub3RhdGlvblRlcm0pKSB7XG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbkNvbnRlbnQuQWN0aW9uVGFyZ2V0ID1cbiAgICAgICAgICAgICAgICAgICAgKGNvbnRleHQuY3VycmVudFRhcmdldC5hY3Rpb25zICYmIGNvbnRleHQuY3VycmVudFRhcmdldC5hY3Rpb25zW2Fubm90YXRpb25Db250ZW50LkFjdGlvbl0pIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmplY3RNYXBbYW5ub3RhdGlvbkNvbnRlbnQuQWN0aW9uXTtcbiAgICAgICAgICAgICAgICBpZiAoIWFubm90YXRpb25Db250ZW50LkFjdGlvblRhcmdldCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBBZGQgdG8gZGlhZ25vc3RpY3MgZGVidWdnZXI7XG4gICAgICAgICAgICAgICAgICAgIEFOTk9UQVRJT05fRVJST1JTLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1VuYWJsZSB0byByZXNvbHZlIHRoZSBhY3Rpb24gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbkNvbnRlbnQuQWN0aW9uICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnIGRlZmluZWQgZm9yICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFubm90YXRpb25UZXJtLmZ1bGx5UXVhbGlmaWVkTmFtZVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gT2JqZWN0LmFzc2lnbihhbm5vdGF0aW9uVGVybSwgYW5ub3RhdGlvbkNvbnRlbnQpO1xufVxuLyoqXG4gKiBSZXRyaWV2ZSBvciBpbmZlciB0aGUgY29sbGVjdGlvbiB0eXBlIGJhc2VkIG9uIGl0cyBjb250ZW50LlxuICpcbiAqIEBwYXJhbSBjb2xsZWN0aW9uRGVmaW5pdGlvblxuICogQHJldHVybnMgdGhlIHR5cGUgb2YgdGhlIGNvbGxlY3Rpb25cbiAqL1xuZnVuY3Rpb24gZ2V0T3JJbmZlckNvbGxlY3Rpb25UeXBlKGNvbGxlY3Rpb25EZWZpbml0aW9uKSB7XG4gICAgbGV0IHR5cGUgPSBjb2xsZWN0aW9uRGVmaW5pdGlvbi50eXBlO1xuICAgIGlmICh0eXBlID09PSB1bmRlZmluZWQgJiYgY29sbGVjdGlvbkRlZmluaXRpb24ubGVuZ3RoID4gMCkge1xuICAgICAgICBjb25zdCBmaXJzdENvbEl0ZW0gPSBjb2xsZWN0aW9uRGVmaW5pdGlvblswXTtcbiAgICAgICAgaWYgKGZpcnN0Q29sSXRlbS5oYXNPd25Qcm9wZXJ0eSgnUHJvcGVydHlQYXRoJykpIHtcbiAgICAgICAgICAgIHR5cGUgPSAnUHJvcGVydHlQYXRoJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmaXJzdENvbEl0ZW0uaGFzT3duUHJvcGVydHkoJ1BhdGgnKSkge1xuICAgICAgICAgICAgdHlwZSA9ICdQYXRoJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChmaXJzdENvbEl0ZW0uaGFzT3duUHJvcGVydHkoJ0Fubm90YXRpb25QYXRoJykpIHtcbiAgICAgICAgICAgIHR5cGUgPSAnQW5ub3RhdGlvblBhdGgnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGZpcnN0Q29sSXRlbS5oYXNPd25Qcm9wZXJ0eSgnTmF2aWdhdGlvblByb3BlcnR5UGF0aCcpKSB7XG4gICAgICAgICAgICB0eXBlID0gJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBmaXJzdENvbEl0ZW0gPT09ICdvYmplY3QnICYmXG4gICAgICAgICAgICAoZmlyc3RDb2xJdGVtLmhhc093blByb3BlcnR5KCd0eXBlJykgfHwgZmlyc3RDb2xJdGVtLmhhc093blByb3BlcnR5KCdwcm9wZXJ0eVZhbHVlcycpKSkge1xuICAgICAgICAgICAgdHlwZSA9ICdSZWNvcmQnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZiBmaXJzdENvbEl0ZW0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0eXBlID0gJ1N0cmluZyc7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHR5cGUgPSAnRW1wdHlDb2xsZWN0aW9uJztcbiAgICB9XG4gICAgcmV0dXJuIHR5cGU7XG59XG5mdW5jdGlvbiBwYXJzZUNvbGxlY3Rpb24oY29sbGVjdGlvbkRlZmluaXRpb24sIHBhcmVudEZRTiwgb2JqZWN0TWFwLCBjb250ZXh0KSB7XG4gICAgY29uc3QgY29sbGVjdGlvbkRlZmluaXRpb25UeXBlID0gZ2V0T3JJbmZlckNvbGxlY3Rpb25UeXBlKGNvbGxlY3Rpb25EZWZpbml0aW9uKTtcbiAgICBzd2l0Y2ggKGNvbGxlY3Rpb25EZWZpbml0aW9uVHlwZSkge1xuICAgICAgICBjYXNlICdQcm9wZXJ0eVBhdGgnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgocHJvcGVydHlQYXRoLCBwcm9wZXJ0eUlkeCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQcm9wZXJ0eVBhdGgnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJvcGVydHlQYXRoLlByb3BlcnR5UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtwYXJlbnRGUU59LyR7cHJvcGVydHlJZHh9YCxcbiAgICAgICAgICAgICAgICAgICAgJHRhcmdldDogX3Jlc29sdmVUYXJnZXQob2JqZWN0TWFwLCBjb250ZXh0LmN1cnJlbnRUYXJnZXQsIHByb3BlcnR5UGF0aC5Qcm9wZXJ0eVBhdGgsIGZhbHNlLCBmYWxzZSwgY29udGV4dC5jdXJyZW50VGVybSlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgJ1BhdGgnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgocGF0aFZhbHVlKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgJHRhcmdldCA9IF9yZXNvbHZlVGFyZ2V0KG9iamVjdE1hcCwgY29udGV4dC5jdXJyZW50VGFyZ2V0LCBwYXRoVmFsdWUuUGF0aCwgdHJ1ZSwgZmFsc2UsIGNvbnRleHQuY3VycmVudFRlcm0pO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGggPSBuZXcgUGF0aChwYXRoVmFsdWUsICR0YXJnZXQsIGNvbnRleHQuY3VycmVudFRlcm0sICcnKTtcbiAgICAgICAgICAgICAgICBjb250ZXh0LnVucmVzb2x2ZWRBbm5vdGF0aW9ucy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgaW5saW5lOiBpc0Fubm90YXRpb25QYXRoKHBhdGhWYWx1ZS5QYXRoKSxcbiAgICAgICAgICAgICAgICAgICAgdG9SZXNvbHZlOiBwYXRoXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhdGg7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgY2FzZSAnQW5ub3RhdGlvblBhdGgnOlxuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgoYW5ub3RhdGlvblBhdGgsIGFubm90YXRpb25JZHgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBhbm5vdGF0aW9uVGFyZ2V0ID0gX3Jlc29sdmVUYXJnZXQob2JqZWN0TWFwLCBjb250ZXh0LmN1cnJlbnRUYXJnZXQsIGFubm90YXRpb25QYXRoLkFubm90YXRpb25QYXRoLCB0cnVlLCBmYWxzZSwgY29udGV4dC5jdXJyZW50VGVybSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYW5ub3RhdGlvbkNvbGxlY3Rpb25FbGVtZW50ID0ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnQW5ub3RhdGlvblBhdGgnLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogYW5ub3RhdGlvblBhdGguQW5ub3RhdGlvblBhdGgsXG4gICAgICAgICAgICAgICAgICAgIGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7cGFyZW50RlFOfS8ke2Fubm90YXRpb25JZHh9YCxcbiAgICAgICAgICAgICAgICAgICAgJHRhcmdldDogYW5ub3RhdGlvblRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnNUZXJtOiBjb250ZXh0LmN1cnJlbnRUZXJtLFxuICAgICAgICAgICAgICAgICAgICB0ZXJtOiAnJyxcbiAgICAgICAgICAgICAgICAgICAgcGF0aDogJydcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGNvbnRleHQudW5yZXNvbHZlZEFubm90YXRpb25zLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBpbmxpbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICB0b1Jlc29sdmU6IGFubm90YXRpb25Db2xsZWN0aW9uRWxlbWVudFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHJldHVybiBhbm5vdGF0aW9uQ29sbGVjdGlvbkVsZW1lbnQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgY2FzZSAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCc6XG4gICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbkRlZmluaXRpb24ubWFwKChuYXZQcm9wZXJ0eVBhdGgsIG5hdlByb3BJZHgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCcsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBuYXZQcm9wZXJ0eVBhdGguTmF2aWdhdGlvblByb3BlcnR5UGF0aCxcbiAgICAgICAgICAgICAgICAgICAgZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtwYXJlbnRGUU59LyR7bmF2UHJvcElkeH1gLFxuICAgICAgICAgICAgICAgICAgICAkdGFyZ2V0OiBfcmVzb2x2ZVRhcmdldChvYmplY3RNYXAsIGNvbnRleHQuY3VycmVudFRhcmdldCwgbmF2UHJvcGVydHlQYXRoLk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgsIGZhbHNlLCBmYWxzZSwgY29udGV4dC5jdXJyZW50VGVybSlcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgJ1JlY29yZCc6XG4gICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbkRlZmluaXRpb24ubWFwKChyZWNvcmREZWZpbml0aW9uLCByZWNvcmRJZHgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyc2VSZWNvcmQocmVjb3JkRGVmaW5pdGlvbiwgYCR7cGFyZW50RlFOfS8ke3JlY29yZElkeH1gLCBvYmplY3RNYXAsIGNvbnRleHQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgJ0FwcGx5JzpcbiAgICAgICAgY2FzZSAnTnVsbCc6XG4gICAgICAgIGNhc2UgJ0lmJzpcbiAgICAgICAgY2FzZSAnRXEnOlxuICAgICAgICBjYXNlICdOZSc6XG4gICAgICAgIGNhc2UgJ0x0JzpcbiAgICAgICAgY2FzZSAnR3QnOlxuICAgICAgICBjYXNlICdMZSc6XG4gICAgICAgIGNhc2UgJ0dlJzpcbiAgICAgICAgY2FzZSAnTm90JzpcbiAgICAgICAgY2FzZSAnQW5kJzpcbiAgICAgICAgY2FzZSAnT3InOlxuICAgICAgICAgICAgcmV0dXJuIGNvbGxlY3Rpb25EZWZpbml0aW9uLm1hcCgoaWZWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBpZlZhbHVlO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIGNhc2UgJ1N0cmluZyc6XG4gICAgICAgICAgICByZXR1cm4gY29sbGVjdGlvbkRlZmluaXRpb24ubWFwKChzdHJpbmdWYWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygc3RyaW5nVmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzdHJpbmdWYWx1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoc3RyaW5nVmFsdWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nVmFsdWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3RyaW5nVmFsdWUuU3RyaW5nO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgaWYgKGNvbGxlY3Rpb25EZWZpbml0aW9uLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgY2FzZScpO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNvbnZlcnRBbm5vdGF0aW9uKGFubm90YXRpb24sIG9iamVjdE1hcCwgY29udGV4dCkge1xuICAgIGlmIChhbm5vdGF0aW9uLnJlY29yZCkge1xuICAgICAgICByZXR1cm4gcGFyc2VSZWNvcmQoYW5ub3RhdGlvbi5yZWNvcmQsIGFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lLCBvYmplY3RNYXAsIGNvbnRleHQpO1xuICAgIH1cbiAgICBlbHNlIGlmIChhbm5vdGF0aW9uLmNvbGxlY3Rpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpZiAoYW5ub3RhdGlvbi52YWx1ZSkge1xuICAgICAgICAgICAgcmV0dXJuIHBhcnNlVmFsdWUoYW5ub3RhdGlvbi52YWx1ZSwgYW5ub3RhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUsIG9iamVjdE1hcCwgY29udGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIGlmIChhbm5vdGF0aW9uLmNvbGxlY3Rpb24pIHtcbiAgICAgICAgY29uc3QgY29sbGVjdGlvbiA9IHBhcnNlQ29sbGVjdGlvbihhbm5vdGF0aW9uLmNvbGxlY3Rpb24sIGFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lLCBvYmplY3RNYXAsIGNvbnRleHQpO1xuICAgICAgICBjb2xsZWN0aW9uLmZ1bGx5UXVhbGlmaWVkTmFtZSA9IGFubm90YXRpb24uZnVsbHlRdWFsaWZpZWROYW1lO1xuICAgICAgICByZXR1cm4gY29sbGVjdGlvbjtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5zdXBwb3J0ZWQgY2FzZScpO1xuICAgIH1cbn1cbi8qKlxuICogQ3JlYXRlcyBhIHJlc29sdmVQYXRoIGZ1bmN0aW9uIGZvciBhIGdpdmVuIGVudGl0eVR5cGUuXG4gKlxuICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIGVudGl0eVR5cGUgZm9yIHdoaWNoIHRoZSBmdW5jdGlvbiBzaG91bGQgYmUgY3JlYXRlZFxuICogQHBhcmFtIG9iamVjdE1hcCBUaGUgY3VycmVudCBvYmplY3RNYXBcbiAqIEByZXR1cm5zIHRoZSByZXNvbHZlUGF0aCBmdW5jdGlvbiB0aGF0IHN0YXJ0cyBhdCB0aGUgZW50aXR5VHlwZVxuICovXG5mdW5jdGlvbiBjcmVhdGVSZXNvbHZlUGF0aEZuKGVudGl0eVR5cGUsIG9iamVjdE1hcCkge1xuICAgIHJldHVybiBmdW5jdGlvbiAocmVsYXRpdmVQYXRoLCBpbmNsdWRlVmlzaXRlZE9iamVjdHMpIHtcbiAgICAgICAgY29uc3QgYW5ub3RhdGlvblRlcm0gPSAnJztcbiAgICAgICAgcmV0dXJuIF9yZXNvbHZlVGFyZ2V0KG9iamVjdE1hcCwgZW50aXR5VHlwZSwgcmVsYXRpdmVQYXRoLCBmYWxzZSwgaW5jbHVkZVZpc2l0ZWRPYmplY3RzLCBhbm5vdGF0aW9uVGVybSk7XG4gICAgfTtcbn1cbmZ1bmN0aW9uIHJlc29sdmVWMk5hdmlnYXRpb25Qcm9wZXJ0eShuYXZQcm9wLCBhc3NvY2lhdGlvbnMsIG9iamVjdE1hcCwgb3V0TmF2UHJvcCkge1xuICAgIGNvbnN0IHRhcmdldEFzc29jaWF0aW9uID0gYXNzb2NpYXRpb25zLmZpbmQoKGFzc29jaWF0aW9uKSA9PiBhc3NvY2lhdGlvbi5mdWxseVF1YWxpZmllZE5hbWUgPT09IG5hdlByb3AucmVsYXRpb25zaGlwKTtcbiAgICBpZiAodGFyZ2V0QXNzb2NpYXRpb24pIHtcbiAgICAgICAgY29uc3QgYXNzb2NpYXRpb25FbmQgPSB0YXJnZXRBc3NvY2lhdGlvbi5hc3NvY2lhdGlvbkVuZC5maW5kKChlbmQpID0+IGVuZC5yb2xlID09PSBuYXZQcm9wLnRvUm9sZSk7XG4gICAgICAgIGlmIChhc3NvY2lhdGlvbkVuZCkge1xuICAgICAgICAgICAgb3V0TmF2UHJvcC50YXJnZXRUeXBlID0gb2JqZWN0TWFwW2Fzc29jaWF0aW9uRW5kLnR5cGVdO1xuICAgICAgICAgICAgb3V0TmF2UHJvcC5pc0NvbGxlY3Rpb24gPSBhc3NvY2lhdGlvbkVuZC5tdWx0aXBsaWNpdHkgPT09ICcqJztcbiAgICAgICAgfVxuICAgIH1cbiAgICBvdXROYXZQcm9wLnJlZmVyZW50aWFsQ29uc3RyYWludCA9IG5hdlByb3AucmVmZXJlbnRpYWxDb25zdHJhaW50IHx8IFtdO1xufVxuZnVuY3Rpb24gcmVzb2x2ZVY0TmF2aWdhdGlvblByb3BlcnR5KG5hdlByb3AsIG9iamVjdE1hcCwgb3V0TmF2UHJvcCkge1xuICAgIG91dE5hdlByb3AudGFyZ2V0VHlwZSA9IG9iamVjdE1hcFtuYXZQcm9wLnRhcmdldFR5cGVOYW1lXTtcbiAgICBvdXROYXZQcm9wLnBhcnRuZXIgPSBuYXZQcm9wLnBhcnRuZXI7XG4gICAgb3V0TmF2UHJvcC5pc0NvbGxlY3Rpb24gPSBuYXZQcm9wLmlzQ29sbGVjdGlvbjtcbiAgICBvdXROYXZQcm9wLmNvbnRhaW5zVGFyZ2V0ID0gbmF2UHJvcC5jb250YWluc1RhcmdldDtcbiAgICBvdXROYXZQcm9wLnJlZmVyZW50aWFsQ29uc3RyYWludCA9IG5hdlByb3AucmVmZXJlbnRpYWxDb25zdHJhaW50O1xufVxuZnVuY3Rpb24gaXNWNE5hdmlnYXRpb25Qcm9wZXJ0eShuYXZQcm9wKSB7XG4gICAgcmV0dXJuICEhbmF2UHJvcC50YXJnZXRUeXBlTmFtZTtcbn1cbmZ1bmN0aW9uIHByZXBhcmVOYXZpZ2F0aW9uUHJvcGVydGllcyhuYXZpZ2F0aW9uUHJvcGVydGllcywgYXNzb2NpYXRpb25zLCBvYmplY3RNYXApIHtcbiAgICByZXR1cm4gbmF2aWdhdGlvblByb3BlcnRpZXMubWFwKChuYXZQcm9wKSA9PiB7XG4gICAgICAgIGNvbnN0IG91dE5hdlByb3AgPSB7XG4gICAgICAgICAgICBfdHlwZTogJ05hdmlnYXRpb25Qcm9wZXJ0eScsXG4gICAgICAgICAgICBuYW1lOiBuYXZQcm9wLm5hbWUsXG4gICAgICAgICAgICBmdWxseVF1YWxpZmllZE5hbWU6IG5hdlByb3AuZnVsbHlRdWFsaWZpZWROYW1lLFxuICAgICAgICAgICAgaXNDb2xsZWN0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbnRhaW5zVGFyZ2V0OiBmYWxzZSxcbiAgICAgICAgICAgIHJlZmVyZW50aWFsQ29uc3RyYWludDogW10sXG4gICAgICAgICAgICBhbm5vdGF0aW9uczoge30sXG4gICAgICAgICAgICBwYXJ0bmVyOiAnJyxcbiAgICAgICAgICAgIHRhcmdldFR5cGU6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgIHRhcmdldFR5cGVOYW1lOiAnJ1xuICAgICAgICB9O1xuICAgICAgICBpZiAoaXNWNE5hdmlnYXRpb25Qcm9wZXJ0eShuYXZQcm9wKSkge1xuICAgICAgICAgICAgcmVzb2x2ZVY0TmF2aWdhdGlvblByb3BlcnR5KG5hdlByb3AsIG9iamVjdE1hcCwgb3V0TmF2UHJvcCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXNvbHZlVjJOYXZpZ2F0aW9uUHJvcGVydHkobmF2UHJvcCwgYXNzb2NpYXRpb25zLCBvYmplY3RNYXAsIG91dE5hdlByb3ApO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvdXROYXZQcm9wLnRhcmdldFR5cGUpIHtcbiAgICAgICAgICAgIG91dE5hdlByb3AudGFyZ2V0VHlwZU5hbWUgPSBvdXROYXZQcm9wLnRhcmdldFR5cGUuZnVsbHlRdWFsaWZpZWROYW1lO1xuICAgICAgICB9XG4gICAgICAgIG9iamVjdE1hcFtvdXROYXZQcm9wLmZ1bGx5UXVhbGlmaWVkTmFtZV0gPSBvdXROYXZQcm9wO1xuICAgICAgICByZXR1cm4gb3V0TmF2UHJvcDtcbiAgICB9KTtcbn1cbi8qKlxuICogQHBhcmFtIGVudGl0eVR5cGVzXG4gKiBAcGFyYW0gYXNzb2NpYXRpb25zXG4gKiBAcGFyYW0gb2JqZWN0TWFwXG4gKi9cbmZ1bmN0aW9uIHJlc29sdmVOYXZpZ2F0aW9uUHJvcGVydGllcyhlbnRpdHlUeXBlcywgYXNzb2NpYXRpb25zLCBvYmplY3RNYXApIHtcbiAgICBlbnRpdHlUeXBlcy5mb3JFYWNoKChlbnRpdHlUeXBlKSA9PiB7XG4gICAgICAgIGVudGl0eVR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMgPSBwcmVwYXJlTmF2aWdhdGlvblByb3BlcnRpZXMoZW50aXR5VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcywgYXNzb2NpYXRpb25zLCBvYmplY3RNYXApO1xuICAgICAgICBlbnRpdHlUeXBlLnJlc29sdmVQYXRoID0gY3JlYXRlUmVzb2x2ZVBhdGhGbihlbnRpdHlUeXBlLCBvYmplY3RNYXApO1xuICAgIH0pO1xufVxuLyoqXG4gKiBAcGFyYW0gbmFtZXNwYWNlXG4gKiBAcGFyYW0gYWN0aW9uc1xuICogQHBhcmFtIG9iamVjdE1hcFxuICovXG5mdW5jdGlvbiBsaW5rQWN0aW9uc1RvRW50aXR5VHlwZShuYW1lc3BhY2UsIGFjdGlvbnMsIG9iamVjdE1hcCkge1xuICAgIGFjdGlvbnMuZm9yRWFjaCgoYWN0aW9uKSA9PiB7XG4gICAgICAgIGlmICghYWN0aW9uLmFubm90YXRpb25zKSB7XG4gICAgICAgICAgICBhY3Rpb24uYW5ub3RhdGlvbnMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYWN0aW9uLmlzQm91bmQpIHtcbiAgICAgICAgICAgIGNvbnN0IHNvdXJjZUVudGl0eVR5cGUgPSBvYmplY3RNYXBbYWN0aW9uLnNvdXJjZVR5cGVdO1xuICAgICAgICAgICAgYWN0aW9uLnNvdXJjZUVudGl0eVR5cGUgPSBzb3VyY2VFbnRpdHlUeXBlO1xuICAgICAgICAgICAgaWYgKHNvdXJjZUVudGl0eVR5cGUpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNvdXJjZUVudGl0eVR5cGUuYWN0aW9ucykge1xuICAgICAgICAgICAgICAgICAgICBzb3VyY2VFbnRpdHlUeXBlLmFjdGlvbnMgPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc291cmNlRW50aXR5VHlwZS5hY3Rpb25zW2FjdGlvbi5uYW1lXSA9IGFjdGlvbjtcbiAgICAgICAgICAgICAgICBzb3VyY2VFbnRpdHlUeXBlLmFjdGlvbnNbYCR7bmFtZXNwYWNlfS4ke2FjdGlvbi5uYW1lfWBdID0gYWN0aW9uO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWN0aW9uLnJldHVybkVudGl0eVR5cGUgPSBvYmplY3RNYXBbYWN0aW9uLnJldHVyblR5cGVdO1xuICAgICAgICB9XG4gICAgfSk7XG59XG4vKipcbiAqIEBwYXJhbSBlbnRpdHlTZXRzXG4gKiBAcGFyYW0gb2JqZWN0TWFwXG4gKiBAcGFyYW0gcmVmZXJlbmNlc1xuICovXG5mdW5jdGlvbiBsaW5rRW50aXR5VHlwZVRvRW50aXR5U2V0KGVudGl0eVNldHMsIG9iamVjdE1hcCwgcmVmZXJlbmNlcykge1xuICAgIGVudGl0eVNldHMuZm9yRWFjaCgoZW50aXR5U2V0KSA9PiB7XG4gICAgICAgIGVudGl0eVNldC5lbnRpdHlUeXBlID0gb2JqZWN0TWFwW2VudGl0eVNldC5lbnRpdHlUeXBlTmFtZV07XG4gICAgICAgIGlmICghZW50aXR5U2V0LmVudGl0eVR5cGUpIHtcbiAgICAgICAgICAgIGVudGl0eVNldC5lbnRpdHlUeXBlID0gb2JqZWN0TWFwWygwLCB1dGlsc18xLnVuYWxpYXMpKHJlZmVyZW5jZXMsIGVudGl0eVNldC5lbnRpdHlUeXBlTmFtZSldO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZW50aXR5U2V0LmFubm90YXRpb25zKSB7XG4gICAgICAgICAgICBlbnRpdHlTZXQuYW5ub3RhdGlvbnMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWVudGl0eVNldC5lbnRpdHlUeXBlLmFubm90YXRpb25zKSB7XG4gICAgICAgICAgICBlbnRpdHlTZXQuZW50aXR5VHlwZS5hbm5vdGF0aW9ucyA9IHt9O1xuICAgICAgICB9XG4gICAgICAgIGVudGl0eVNldC5lbnRpdHlUeXBlLmtleXMuZm9yRWFjaCgoa2V5UHJvcCkgPT4ge1xuICAgICAgICAgICAga2V5UHJvcC5pc0tleSA9IHRydWU7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuLyoqXG4gKiBAcGFyYW0gc2luZ2xldG9uc1xuICogQHBhcmFtIG9iamVjdE1hcFxuICogQHBhcmFtIHJlZmVyZW5jZXNcbiAqL1xuZnVuY3Rpb24gbGlua0VudGl0eVR5cGVUb1NpbmdsZXRvbihzaW5nbGV0b25zLCBvYmplY3RNYXAsIHJlZmVyZW5jZXMpIHtcbiAgICBzaW5nbGV0b25zLmZvckVhY2goKHNpbmdsZXRvbikgPT4ge1xuICAgICAgICBzaW5nbGV0b24uZW50aXR5VHlwZSA9IG9iamVjdE1hcFtzaW5nbGV0b24uZW50aXR5VHlwZU5hbWVdO1xuICAgICAgICBpZiAoIXNpbmdsZXRvbi5lbnRpdHlUeXBlKSB7XG4gICAgICAgICAgICBzaW5nbGV0b24uZW50aXR5VHlwZSA9IG9iamVjdE1hcFsoMCwgdXRpbHNfMS51bmFsaWFzKShyZWZlcmVuY2VzLCBzaW5nbGV0b24uZW50aXR5VHlwZU5hbWUpXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXNpbmdsZXRvbi5hbm5vdGF0aW9ucykge1xuICAgICAgICAgICAgc2luZ2xldG9uLmFubm90YXRpb25zID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFzaW5nbGV0b24uZW50aXR5VHlwZS5hbm5vdGF0aW9ucykge1xuICAgICAgICAgICAgc2luZ2xldG9uLmVudGl0eVR5cGUuYW5ub3RhdGlvbnMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICBzaW5nbGV0b24uZW50aXR5VHlwZS5rZXlzLmZvckVhY2goKGtleVByb3ApID0+IHtcbiAgICAgICAgICAgIGtleVByb3AuaXNLZXkgPSB0cnVlO1xuICAgICAgICB9KTtcbiAgICB9KTtcbn1cbi8qKlxuICogQHBhcmFtIGVudGl0eVR5cGVzXG4gKiBAcGFyYW0gb2JqZWN0TWFwXG4gKi9cbmZ1bmN0aW9uIGxpbmtQcm9wZXJ0aWVzVG9Db21wbGV4VHlwZXMoZW50aXR5VHlwZXMsIG9iamVjdE1hcCkge1xuICAgIC8qKlxuICAgICAqIEBwYXJhbSBwcm9wZXJ0eVxuICAgICAqL1xuICAgIGZ1bmN0aW9uIGxpbmsocHJvcGVydHkpIHtcbiAgICAgICAgaWYgKCFwcm9wZXJ0eS5hbm5vdGF0aW9ucykge1xuICAgICAgICAgICAgcHJvcGVydHkuYW5ub3RhdGlvbnMgPSB7fTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHByb3BlcnR5LnR5cGUuaW5kZXhPZignRWRtJykgIT09IDApIHtcbiAgICAgICAgICAgICAgICBsZXQgY29tcGxleFR5cGU7XG4gICAgICAgICAgICAgICAgaWYgKHByb3BlcnR5LnR5cGUuc3RhcnRzV2l0aCgnQ29sbGVjdGlvbicpKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGNvbXBsZXhUeXBlTmFtZSA9IHByb3BlcnR5LnR5cGUuc3Vic3RyaW5nKDExLCBwcm9wZXJ0eS50eXBlLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgICAgICBjb21wbGV4VHlwZSA9IG9iamVjdE1hcFtjb21wbGV4VHlwZU5hbWVdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY29tcGxleFR5cGUgPSBvYmplY3RNYXBbcHJvcGVydHkudHlwZV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmIChjb21wbGV4VHlwZSkge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eS50YXJnZXRUeXBlID0gY29tcGxleFR5cGU7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb21wbGV4VHlwZS5wcm9wZXJ0aWVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21wbGV4VHlwZS5wcm9wZXJ0aWVzLmZvckVhY2gobGluayk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKHNFcnJvcikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQcm9wZXJ0eSBUeXBlIGlzIG5vdCBkZWZpbmVkJyk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZW50aXR5VHlwZXMuZm9yRWFjaCgoZW50aXR5VHlwZSkgPT4ge1xuICAgICAgICBlbnRpdHlUeXBlLmVudGl0eVByb3BlcnRpZXMuZm9yRWFjaChsaW5rKTtcbiAgICB9KTtcbn1cbi8qKlxuICogQHBhcmFtIGNvbXBsZXhUeXBlc1xuICogQHBhcmFtIGFzc29jaWF0aW9uc1xuICogQHBhcmFtIG9iamVjdE1hcFxuICovXG5mdW5jdGlvbiBwcmVwYXJlQ29tcGxleFR5cGVzKGNvbXBsZXhUeXBlcywgYXNzb2NpYXRpb25zLCBvYmplY3RNYXApIHtcbiAgICBjb21wbGV4VHlwZXMuZm9yRWFjaCgoY29tcGxleFR5cGUpID0+IHtcbiAgICAgICAgY29tcGxleFR5cGUuYW5ub3RhdGlvbnMgPSB7fTtcbiAgICAgICAgY29tcGxleFR5cGUucHJvcGVydGllcy5mb3JFYWNoKChwcm9wZXJ0eSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFwcm9wZXJ0eS5hbm5vdGF0aW9ucykge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5LmFubm90YXRpb25zID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBjb21wbGV4VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcyA9IHByZXBhcmVOYXZpZ2F0aW9uUHJvcGVydGllcyhjb21wbGV4VHlwZS5uYXZpZ2F0aW9uUHJvcGVydGllcywgYXNzb2NpYXRpb25zLCBvYmplY3RNYXApO1xuICAgIH0pO1xufVxuLyoqXG4gKiBTcGxpdCB0aGUgYWxpYXMgZnJvbSB0aGUgdGVybSB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyB0aGUgY3VycmVudCBzZXQgb2YgcmVmZXJlbmNlc1xuICogQHBhcmFtIHRlcm1WYWx1ZSB0aGUgdmFsdWUgb2YgdGhlIHRlcm1cbiAqIEByZXR1cm5zIHRoZSB0ZXJtIGFsaWFzIGFuZCB0aGUgYWN0dWFsIHRlcm0gdmFsdWVcbiAqL1xuZnVuY3Rpb24gc3BsaXRUZXJtKHJlZmVyZW5jZXMsIHRlcm1WYWx1ZSkge1xuICAgIGNvbnN0IGFsaWFzZWRUZXJtID0gKDAsIHV0aWxzXzEuYWxpYXMpKHJlZmVyZW5jZXMsIHRlcm1WYWx1ZSk7XG4gICAgY29uc3QgbGFzdERvdCA9IGFsaWFzZWRUZXJtLmxhc3RJbmRleE9mKCcuJyk7XG4gICAgY29uc3QgdGVybUFsaWFzID0gYWxpYXNlZFRlcm0uc3Vic3RyaW5nKDAsIGxhc3REb3QpO1xuICAgIGNvbnN0IHRlcm0gPSBhbGlhc2VkVGVybS5zdWJzdHJpbmcobGFzdERvdCArIDEpO1xuICAgIHJldHVybiBbdGVybUFsaWFzLCB0ZXJtXTtcbn1cbi8qKlxuICogQ3JlYXRlcyB0aGUgZnVuY3Rpb24gdGhhdCB3aWxsIHJlc29sdmUgYSBzcGVjaWZpYyBwYXRoLlxuICpcbiAqIEBwYXJhbSBjb252ZXJ0ZWRPdXRwdXRcbiAqIEBwYXJhbSBvYmplY3RNYXBcbiAqIEByZXR1cm5zIHRoZSBmdW5jdGlvbiB0aGF0IHdpbGwgYWxsb3cgdG8gcmVzb2x2ZSBlbGVtZW50IGdsb2JhbGx5LlxuICovXG5mdW5jdGlvbiBjcmVhdGVHbG9iYWxSZXNvbHZlKGNvbnZlcnRlZE91dHB1dCwgb2JqZWN0TWFwKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIHJlc29sdmVQYXRoKHNQYXRoLCByZXNvbHZlRGlyZWN0bHkgPSBmYWxzZSkge1xuICAgICAgICBpZiAocmVzb2x2ZURpcmVjdGx5KSB7XG4gICAgICAgICAgICBsZXQgdGFyZ2V0UGF0aCA9IHNQYXRoO1xuICAgICAgICAgICAgaWYgKCFzUGF0aC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRQYXRoID0gYC8ke3NQYXRofWA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0YXJnZXRSZXNvbHV0aW9uID0gX3Jlc29sdmVUYXJnZXQob2JqZWN0TWFwLCBjb252ZXJ0ZWRPdXRwdXQsIHRhcmdldFBhdGgsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgIGlmICh0YXJnZXRSZXNvbHV0aW9uLnRhcmdldCkge1xuICAgICAgICAgICAgICAgIHRhcmdldFJlc29sdXRpb24udmlzaXRlZE9iamVjdHMucHVzaCh0YXJnZXRSZXNvbHV0aW9uLnRhcmdldCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHRhcmdldDogdGFyZ2V0UmVzb2x1dGlvbi50YXJnZXQsXG4gICAgICAgICAgICAgICAgb2JqZWN0UGF0aDogdGFyZ2V0UmVzb2x1dGlvbi52aXNpdGVkT2JqZWN0c1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBhUGF0aFNwbGl0ID0gc1BhdGguc3BsaXQoJy8nKTtcbiAgICAgICAgaWYgKGFQYXRoU3BsaXQuc2hpZnQoKSAhPT0gJycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IGRlYWwgd2l0aCByZWxhdGl2ZSBwYXRoJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZW50aXR5U2V0TmFtZSA9IGFQYXRoU3BsaXQuc2hpZnQoKTtcbiAgICAgICAgY29uc3QgZW50aXR5U2V0ID0gY29udmVydGVkT3V0cHV0LmVudGl0eVNldHMuZmluZCgoZXQpID0+IGV0Lm5hbWUgPT09IGVudGl0eVNldE5hbWUpO1xuICAgICAgICBjb25zdCBzaW5nbGV0b24gPSBjb252ZXJ0ZWRPdXRwdXQuc2luZ2xldG9ucy5maW5kKChldCkgPT4gZXQubmFtZSA9PT0gZW50aXR5U2V0TmFtZSk7XG4gICAgICAgIGlmICghZW50aXR5U2V0ICYmICFzaW5nbGV0b24pIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBjb252ZXJ0ZWRPdXRwdXQuZW50aXR5Q29udGFpbmVyLFxuICAgICAgICAgICAgICAgIG9iamVjdFBhdGg6IFtjb252ZXJ0ZWRPdXRwdXQuZW50aXR5Q29udGFpbmVyXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYVBhdGhTcGxpdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdGFyZ2V0OiBlbnRpdHlTZXQgfHwgc2luZ2xldG9uLFxuICAgICAgICAgICAgICAgIG9iamVjdFBhdGg6IFtjb252ZXJ0ZWRPdXRwdXQuZW50aXR5Q29udGFpbmVyLCBlbnRpdHlTZXQgfHwgc2luZ2xldG9uXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IHRhcmdldFJlc29sdXRpb24gPSBfcmVzb2x2ZVRhcmdldChvYmplY3RNYXAsIGVudGl0eVNldCB8fCBzaW5nbGV0b24sICcvJyArIGFQYXRoU3BsaXQuam9pbignLycpLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgICAgICBpZiAodGFyZ2V0UmVzb2x1dGlvbi50YXJnZXQpIHtcbiAgICAgICAgICAgICAgICB0YXJnZXRSZXNvbHV0aW9uLnZpc2l0ZWRPYmplY3RzLnB1c2godGFyZ2V0UmVzb2x1dGlvbi50YXJnZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IHRhcmdldFJlc29sdXRpb24udGFyZ2V0LFxuICAgICAgICAgICAgICAgIG9iamVjdFBhdGg6IHRhcmdldFJlc29sdXRpb24udmlzaXRlZE9iamVjdHNcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9O1xufVxuZnVuY3Rpb24gZW5zdXJlQW5ub3RhdGlvbnMoY3VycmVudFRhcmdldCwgdm9jQWxpYXMpIHtcbiAgICBpZiAoIWN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMpIHtcbiAgICAgICAgY3VycmVudFRhcmdldC5hbm5vdGF0aW9ucyA9IHt9O1xuICAgIH1cbiAgICBpZiAoIWN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdKSB7XG4gICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdID0ge307XG4gICAgfVxuICAgIGlmICghY3VycmVudFRhcmdldC5hbm5vdGF0aW9ucy5fYW5ub3RhdGlvbnMpIHtcbiAgICAgICAgY3VycmVudFRhcmdldC5hbm5vdGF0aW9ucy5fYW5ub3RhdGlvbnMgPSB7fTtcbiAgICB9XG59XG5mdW5jdGlvbiBwcm9jZXNzQW5ub3RhdGlvbnMoY3VycmVudENvbnRleHQsIGFubm90YXRpb25MaXN0LCBvYmplY3RNYXAsIGJPdmVycmlkZUV4aXN0aW5nKSB7XG4gICAgY29uc3QgY3VycmVudFRhcmdldCA9IGN1cnJlbnRDb250ZXh0LmN1cnJlbnRUYXJnZXQ7XG4gICAgY29uc3QgY3VycmVudFRhcmdldE5hbWUgPSBjdXJyZW50VGFyZ2V0LmZ1bGx5UXVhbGlmaWVkTmFtZTtcbiAgICBhbm5vdGF0aW9uTGlzdC5hbm5vdGF0aW9ucy5mb3JFYWNoKChhbm5vdGF0aW9uKSA9PiB7XG4gICAgICAgIHZhciBfYSwgX2I7XG4gICAgICAgIGN1cnJlbnRDb250ZXh0LmN1cnJlbnRTb3VyY2UgPSBhbm5vdGF0aW9uLl9fc291cmNlIHx8IGFubm90YXRpb25MaXN0Ll9fc291cmNlO1xuICAgICAgICBjb25zdCBbdm9jQWxpYXMsIHZvY1Rlcm1dID0gc3BsaXRUZXJtKHV0aWxzXzEuZGVmYXVsdFJlZmVyZW5jZXMsIGFubm90YXRpb24udGVybSk7XG4gICAgICAgIGVuc3VyZUFubm90YXRpb25zKGN1cnJlbnRUYXJnZXQsIHZvY0FsaWFzKTtcbiAgICAgICAgY29uc3Qgdm9jVGVybVdpdGhRdWFsaWZpZXIgPSBgJHt2b2NUZXJtfSR7YW5ub3RhdGlvbi5xdWFsaWZpZXIgPyAnIycgKyBhbm5vdGF0aW9uLnF1YWxpZmllciA6ICcnfWA7XG4gICAgICAgIGlmICghYk92ZXJyaWRlRXhpc3RpbmcgJiYgKChfYiA9IChfYSA9IGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYVt2b2NBbGlhc10pID09PSBudWxsIHx8IF9iID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYlt2b2NUZXJtV2l0aFF1YWxpZmllcl0pICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjdXJyZW50Q29udGV4dC5jdXJyZW50VGVybSA9IGFubm90YXRpb24udGVybTtcbiAgICAgICAgY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdID0gY29udmVydEFubm90YXRpb24oYW5ub3RhdGlvbiwgb2JqZWN0TWFwLCBjdXJyZW50Q29udGV4dCk7XG4gICAgICAgIHN3aXRjaCAodHlwZW9mIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXSkge1xuICAgICAgICAgICAgY2FzZSAnc3RyaW5nJzpcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tbmV3LXdyYXBwZXJzXG4gICAgICAgICAgICAgICAgY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdID0gbmV3IFN0cmluZyhjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl0pO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSAnYm9vbGVhbic6XG4gICAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLW5ldy13cmFwcGVyc1xuICAgICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXSA9IG5ldyBCb29sZWFuKGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIC8vIGRvIG5vdGhpbmdcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpZiAoY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdICE9PSBudWxsICYmXG4gICAgICAgICAgICB0eXBlb2YgY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdID09PSAnb2JqZWN0JyAmJlxuICAgICAgICAgICAgIWN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXS5hbm5vdGF0aW9ucykge1xuICAgICAgICAgICAgY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdLmFubm90YXRpb25zID0ge307XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXSAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgdHlwZW9mIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXS50ZXJtID0gKDAsIHV0aWxzXzEudW5hbGlhcykodXRpbHNfMS5kZWZhdWx0UmVmZXJlbmNlcywgYCR7dm9jQWxpYXN9LiR7dm9jVGVybX1gKTtcbiAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXS5xdWFsaWZpZXIgPSBhbm5vdGF0aW9uLnF1YWxpZmllcjtcbiAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnNbdm9jQWxpYXNdW3ZvY1Rlcm1XaXRoUXVhbGlmaWVyXS5fX3NvdXJjZSA9IGN1cnJlbnRDb250ZXh0LmN1cnJlbnRTb3VyY2U7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYW5ub3RhdGlvblRhcmdldCA9IGAke2N1cnJlbnRUYXJnZXROYW1lfUAkeygwLCB1dGlsc18xLnVuYWxpYXMpKHV0aWxzXzEuZGVmYXVsdFJlZmVyZW5jZXMsIHZvY0FsaWFzICsgJy4nICsgdm9jVGVybVdpdGhRdWFsaWZpZXIpfWA7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGFubm90YXRpb24uYW5ub3RhdGlvbnMpKSB7XG4gICAgICAgICAgICBjb25zdCBzdWJBbm5vdGF0aW9uTGlzdCA9IHtcbiAgICAgICAgICAgICAgICB0YXJnZXQ6IGFubm90YXRpb25UYXJnZXQsXG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IGFubm90YXRpb24uYW5ub3RhdGlvbnMsXG4gICAgICAgICAgICAgICAgX19zb3VyY2U6IGN1cnJlbnRDb250ZXh0LmN1cnJlbnRTb3VyY2VcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjdXJyZW50Q29udGV4dC5hZGRpdGlvbmFsQW5ub3RhdGlvbnMucHVzaChzdWJBbm5vdGF0aW9uTGlzdCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoYW5ub3RhdGlvbi5hbm5vdGF0aW9ucyAmJiAhY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdLmFubm90YXRpb25zKSB7XG4gICAgICAgICAgICBjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl0uYW5ub3RhdGlvbnMgPSBhbm5vdGF0aW9uLmFubm90YXRpb25zO1xuICAgICAgICB9XG4gICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMuX2Fubm90YXRpb25zW2Ake3ZvY0FsaWFzfS4ke3ZvY1Rlcm1XaXRoUXVhbGlmaWVyfWBdID1cbiAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQuYW5ub3RhdGlvbnMuX2Fubm90YXRpb25zWygwLCB1dGlsc18xLnVuYWxpYXMpKHV0aWxzXzEuZGVmYXVsdFJlZmVyZW5jZXMsIGAke3ZvY0FsaWFzfS4ke3ZvY1Rlcm1XaXRoUXVhbGlmaWVyfWApXSA9XG4gICAgICAgICAgICAgICAgY3VycmVudFRhcmdldC5hbm5vdGF0aW9uc1t2b2NBbGlhc11bdm9jVGVybVdpdGhRdWFsaWZpZXJdO1xuICAgICAgICBvYmplY3RNYXBbYW5ub3RhdGlvblRhcmdldF0gPSBjdXJyZW50VGFyZ2V0LmFubm90YXRpb25zW3ZvY0FsaWFzXVt2b2NUZXJtV2l0aFF1YWxpZmllcl07XG4gICAgfSk7XG59XG4vKipcbiAqIFByb2Nlc3MgYWxsIHRoZSB1bnJlc29sdmVkIHRhcmdldHMgc28gZmFyIHRvIHRyeSBhbmQgc2VlIGlmIHRoZXkgYXJlIHJlc29sdmVhYmxlIGluIHRoZSBlbmQuXG4gKlxuICogQHBhcmFtIHVucmVzb2x2ZWRUYXJnZXRzXG4gKiBAcGFyYW0gb2JqZWN0TWFwXG4gKi9cbmZ1bmN0aW9uIHByb2Nlc3NVbnJlc29sdmVkVGFyZ2V0cyh1bnJlc29sdmVkVGFyZ2V0cywgb2JqZWN0TWFwKSB7XG4gICAgdW5yZXNvbHZlZFRhcmdldHMuZm9yRWFjaCgocmVzb2x2YWJsZSkgPT4ge1xuICAgICAgICBjb25zdCB0YXJnZXRUb1Jlc29sdmUgPSByZXNvbHZhYmxlLnRvUmVzb2x2ZTtcbiAgICAgICAgY29uc3QgdGFyZ2V0U3RyID0gdGFyZ2V0VG9SZXNvbHZlLiR0YXJnZXQ7XG4gICAgICAgIGNvbnN0IHJlc29sdmVkVGFyZ2V0ID0gb2JqZWN0TWFwW3RhcmdldFN0cl07XG4gICAgICAgIGNvbnN0IHsgYW5ub3RhdGlvbnNUZXJtLCBhbm5vdGF0aW9uVHlwZSB9ID0gdGFyZ2V0VG9SZXNvbHZlO1xuICAgICAgICBkZWxldGUgdGFyZ2V0VG9SZXNvbHZlLmFubm90YXRpb25UeXBlO1xuICAgICAgICBkZWxldGUgdGFyZ2V0VG9SZXNvbHZlLmFubm90YXRpb25zVGVybTtcbiAgICAgICAgaWYgKHJlc29sdmFibGUuaW5saW5lICYmICEocmVzb2x2ZWRUYXJnZXQgaW5zdGFuY2VvZiBTdHJpbmcpKSB7XG4gICAgICAgICAgICAvLyBpbmxpbmUgdGhlIHJlc29sdmVkIHRhcmdldFxuICAgICAgICAgICAgbGV0IGtleXM7XG4gICAgICAgICAgICBmb3IgKGtleXMgaW4gdGFyZ2V0VG9SZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIHRhcmdldFRvUmVzb2x2ZVtrZXlzXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIE9iamVjdC5hc3NpZ24odGFyZ2V0VG9SZXNvbHZlLCByZXNvbHZlZFRhcmdldCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAvLyBhc3NpZ24gdGhlIHJlc29sdmVkIHRhcmdldFxuICAgICAgICAgICAgdGFyZ2V0VG9SZXNvbHZlLiR0YXJnZXQgPSByZXNvbHZlZFRhcmdldDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXJlc29sdmVkVGFyZ2V0KSB7XG4gICAgICAgICAgICB0YXJnZXRUb1Jlc29sdmUudGFyZ2V0U3RyaW5nID0gdGFyZ2V0U3RyO1xuICAgICAgICAgICAgaWYgKGFubm90YXRpb25zVGVybSAmJiBhbm5vdGF0aW9uVHlwZSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IG9FcnJvck1zZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1VuYWJsZSB0byByZXNvbHZlIHRoZSBwYXRoIGV4cHJlc3Npb246ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U3RyICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdIaW50OiBDaGVjayBhbmQgY29ycmVjdCB0aGUgcGF0aCB2YWx1ZXMgdW5kZXIgdGhlIGZvbGxvd2luZyBzdHJ1Y3R1cmUgaW4gdGhlIG1ldGFkYXRhIChhbm5vdGF0aW9uLnhtbCBmaWxlIG9yIENEUyBhbm5vdGF0aW9ucyBmb3IgdGhlIGFwcGxpY2F0aW9uKTogXFxuXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPEFubm90YXRpb24gVGVybSA9ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnNUZXJtICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc+JyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPFJlY29yZCBUeXBlID0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICBhbm5vdGF0aW9uVHlwZSArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1xcbicgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJzxBbm5vdGF0aW9uUGF0aCA9ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U3RyICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc+J1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYWRkQW5ub3RhdGlvbkVycm9yTWVzc2FnZSh0YXJnZXRTdHIsIG9FcnJvck1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcm9wZXJ0eSA9IHRhcmdldFRvUmVzb2x2ZS50ZXJtO1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhdGggPSB0YXJnZXRUb1Jlc29sdmUucGF0aDtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXJtSW5mbyA9IHRhcmdldFN0ciA/IHRhcmdldFN0ci5zcGxpdCgnLycpWzBdIDogdGFyZ2V0U3RyO1xuICAgICAgICAgICAgICAgIGNvbnN0IG9FcnJvck1zZyA9IHtcbiAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ1VuYWJsZSB0byByZXNvbHZlIHRoZSBwYXRoIGV4cHJlc3Npb246ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFyZ2V0U3RyICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdIaW50OiBDaGVjayBhbmQgY29ycmVjdCB0aGUgcGF0aCB2YWx1ZXMgdW5kZXIgdGhlIGZvbGxvd2luZyBzdHJ1Y3R1cmUgaW4gdGhlIG1ldGFkYXRhIChhbm5vdGF0aW9uLnhtbCBmaWxlIG9yIENEUyBhbm5vdGF0aW9ucyBmb3IgdGhlIGFwcGxpY2F0aW9uKTogXFxuXFxuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAnPEFubm90YXRpb24gVGVybSA9ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgdGVybUluZm8gK1xuICAgICAgICAgICAgICAgICAgICAgICAgJz4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICdcXG4nICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc8UHJvcGVydHlWYWx1ZSBQcm9wZXJ0eSA9ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHkgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJyAgICAgICAgUGF0aD0gJyArXG4gICAgICAgICAgICAgICAgICAgICAgICBwYXRoICtcbiAgICAgICAgICAgICAgICAgICAgICAgICc+J1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgYWRkQW5ub3RhdGlvbkVycm9yTWVzc2FnZSh0YXJnZXRTdHIsIG9FcnJvck1zZyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbi8qKlxuICogTWVyZ2UgYW5ub3RhdGlvbiBmcm9tIGRpZmZlcmVudCBzb3VyY2UgdG9nZXRoZXIgYnkgb3ZlcndyaXRpbmcgYXQgdGhlIHRlcm0gbGV2ZWwuXG4gKlxuICogQHBhcmFtIHJhd01ldGFkYXRhXG4gKiBAcmV0dXJucyB0aGUgcmVzdWx0aW5nIG1lcmdlZCBhbm5vdGF0aW9uc1xuICovXG5mdW5jdGlvbiBtZXJnZUFubm90YXRpb25zKHJhd01ldGFkYXRhKSB7XG4gICAgY29uc3QgYW5ub3RhdGlvbkxpc3RQZXJUYXJnZXQgPSB7fTtcbiAgICBPYmplY3Qua2V5cyhyYXdNZXRhZGF0YS5zY2hlbWEuYW5ub3RhdGlvbnMpLmZvckVhY2goKGFubm90YXRpb25Tb3VyY2UpID0+IHtcbiAgICAgICAgcmF3TWV0YWRhdGEuc2NoZW1hLmFubm90YXRpb25zW2Fubm90YXRpb25Tb3VyY2VdLmZvckVhY2goKGFubm90YXRpb25MaXN0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50VGFyZ2V0TmFtZSA9ICgwLCB1dGlsc18xLnVuYWxpYXMpKHJhd01ldGFkYXRhLnJlZmVyZW5jZXMsIGFubm90YXRpb25MaXN0LnRhcmdldCk7XG4gICAgICAgICAgICBhbm5vdGF0aW9uTGlzdC5fX3NvdXJjZSA9IGFubm90YXRpb25Tb3VyY2U7XG4gICAgICAgICAgICBpZiAoIWFubm90YXRpb25MaXN0UGVyVGFyZ2V0W2N1cnJlbnRUYXJnZXROYW1lXSkge1xuICAgICAgICAgICAgICAgIGFubm90YXRpb25MaXN0UGVyVGFyZ2V0W2N1cnJlbnRUYXJnZXROYW1lXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbnM6IGFubm90YXRpb25MaXN0LmFubm90YXRpb25zLmNvbmNhdCgpLFxuICAgICAgICAgICAgICAgICAgICB0YXJnZXQ6IGN1cnJlbnRUYXJnZXROYW1lXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBhbm5vdGF0aW9uTGlzdFBlclRhcmdldFtjdXJyZW50VGFyZ2V0TmFtZV0uX19zb3VyY2UgPSBhbm5vdGF0aW9uU291cmNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYW5ub3RhdGlvbkxpc3QuYW5ub3RhdGlvbnMuZm9yRWFjaCgoYW5ub3RhdGlvbikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBmaW5kSW5kZXggPSBhbm5vdGF0aW9uTGlzdFBlclRhcmdldFtjdXJyZW50VGFyZ2V0TmFtZV0uYW5ub3RhdGlvbnMuZmluZEluZGV4KChyZWZlcmVuY2VBbm5vdGF0aW9uKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gKHJlZmVyZW5jZUFubm90YXRpb24udGVybSA9PT0gYW5ub3RhdGlvbi50ZXJtICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVmZXJlbmNlQW5ub3RhdGlvbi5xdWFsaWZpZXIgPT09IGFubm90YXRpb24ucXVhbGlmaWVyKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGFubm90YXRpb24uX19zb3VyY2UgPSBhbm5vdGF0aW9uU291cmNlO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmluZEluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbkxpc3RQZXJUYXJnZXRbY3VycmVudFRhcmdldE5hbWVdLmFubm90YXRpb25zLnNwbGljZShmaW5kSW5kZXgsIDEsIGFubm90YXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYW5ub3RhdGlvbkxpc3RQZXJUYXJnZXRbY3VycmVudFRhcmdldE5hbWVdLmFubm90YXRpb25zLnB1c2goYW5ub3RhdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIGFubm90YXRpb25MaXN0UGVyVGFyZ2V0O1xufVxuLyoqXG4gKiBDb252ZXJ0IGEgUmF3TWV0YWRhdGEgaW50byBhbiBvYmplY3QgcmVwcmVzZW50YXRpb24gdG8gYmUgdXNlZCB0byBlYXNpbHkgbmF2aWdhdGUgYSBtZXRhZGF0YSBvYmplY3QgYW5kIGl0cyBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSByYXdNZXRhZGF0YVxuICogQHJldHVybnMgdGhlIGNvbnZlcnRlZCByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWV0YWRhdGEuXG4gKi9cbmZ1bmN0aW9uIGNvbnZlcnQocmF3TWV0YWRhdGEpIHtcbiAgICBBTk5PVEFUSU9OX0VSUk9SUyA9IFtdO1xuICAgIGNvbnN0IG9iamVjdE1hcCA9IGJ1aWxkT2JqZWN0TWFwKHJhd01ldGFkYXRhKTtcbiAgICByZXNvbHZlTmF2aWdhdGlvblByb3BlcnRpZXMocmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eVR5cGVzLCByYXdNZXRhZGF0YS5zY2hlbWEuYXNzb2NpYXRpb25zLCBvYmplY3RNYXApO1xuICAgIHJhd01ldGFkYXRhLnNjaGVtYS5lbnRpdHlDb250YWluZXIuYW5ub3RhdGlvbnMgPSB7fTtcbiAgICBsaW5rQWN0aW9uc1RvRW50aXR5VHlwZShyYXdNZXRhZGF0YS5zY2hlbWEubmFtZXNwYWNlLCByYXdNZXRhZGF0YS5zY2hlbWEuYWN0aW9ucywgb2JqZWN0TWFwKTtcbiAgICBsaW5rRW50aXR5VHlwZVRvRW50aXR5U2V0KHJhd01ldGFkYXRhLnNjaGVtYS5lbnRpdHlTZXRzLCBvYmplY3RNYXAsIHJhd01ldGFkYXRhLnJlZmVyZW5jZXMpO1xuICAgIGxpbmtFbnRpdHlUeXBlVG9TaW5nbGV0b24ocmF3TWV0YWRhdGEuc2NoZW1hLnNpbmdsZXRvbnMsIG9iamVjdE1hcCwgcmF3TWV0YWRhdGEucmVmZXJlbmNlcyk7XG4gICAgbGlua1Byb3BlcnRpZXNUb0NvbXBsZXhUeXBlcyhyYXdNZXRhZGF0YS5zY2hlbWEuZW50aXR5VHlwZXMsIG9iamVjdE1hcCk7XG4gICAgcHJlcGFyZUNvbXBsZXhUeXBlcyhyYXdNZXRhZGF0YS5zY2hlbWEuY29tcGxleFR5cGVzLCByYXdNZXRhZGF0YS5zY2hlbWEuYXNzb2NpYXRpb25zLCBvYmplY3RNYXApO1xuICAgIGNvbnN0IHVucmVzb2x2ZWRUYXJnZXRzID0gW107XG4gICAgY29uc3QgdW5yZXNvbHZlZEFubm90YXRpb25zID0gW107XG4gICAgY29uc3QgYW5ub3RhdGlvbkxpc3RQZXJUYXJnZXQgPSBtZXJnZUFubm90YXRpb25zKHJhd01ldGFkYXRhKTtcbiAgICBPYmplY3Qua2V5cyhhbm5vdGF0aW9uTGlzdFBlclRhcmdldCkuZm9yRWFjaCgoY3VycmVudFRhcmdldE5hbWUpID0+IHtcbiAgICAgICAgY29uc3QgYW5ub3RhdGlvbkxpc3QgPSBhbm5vdGF0aW9uTGlzdFBlclRhcmdldFtjdXJyZW50VGFyZ2V0TmFtZV07XG4gICAgICAgIGNvbnN0IG9iamVjdE1hcEVsZW1lbnQgPSBvYmplY3RNYXBbY3VycmVudFRhcmdldE5hbWVdO1xuICAgICAgICBpZiAoIW9iamVjdE1hcEVsZW1lbnQgJiYgKGN1cnJlbnRUYXJnZXROYW1lID09PSBudWxsIHx8IGN1cnJlbnRUYXJnZXROYW1lID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjdXJyZW50VGFyZ2V0TmFtZS5pbmRleE9mKCdAJykpID4gMCkge1xuICAgICAgICAgICAgdW5yZXNvbHZlZEFubm90YXRpb25zLnB1c2goYW5ub3RhdGlvbkxpc3QpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKG9iamVjdE1hcEVsZW1lbnQpIHtcbiAgICAgICAgICAgIGxldCBhbGxUYXJnZXRzID0gW29iamVjdE1hcEVsZW1lbnRdO1xuICAgICAgICAgICAgbGV0IGJPdmVycmlkZUV4aXN0aW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmIChvYmplY3RNYXBFbGVtZW50Ll90eXBlID09PSAnVW5ib3VuZEdlbmVyaWNBY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgYWxsVGFyZ2V0cyA9IG9iamVjdE1hcEVsZW1lbnQuYWN0aW9ucztcbiAgICAgICAgICAgICAgICBiT3ZlcnJpZGVFeGlzdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYWxsVGFyZ2V0cy5mb3JFYWNoKChjdXJyZW50VGFyZ2V0KSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3QgY3VycmVudENvbnRleHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZGl0aW9uYWxBbm5vdGF0aW9uczogdW5yZXNvbHZlZEFubm90YXRpb25zLFxuICAgICAgICAgICAgICAgICAgICBjdXJyZW50U291cmNlOiBhbm5vdGF0aW9uTGlzdC5fX3NvdXJjZSxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRhcmdldDogY3VycmVudFRhcmdldCxcbiAgICAgICAgICAgICAgICAgICAgY3VycmVudFRlcm06ICcnLFxuICAgICAgICAgICAgICAgICAgICByYXdNZXRhZGF0YTogcmF3TWV0YWRhdGEsXG4gICAgICAgICAgICAgICAgICAgIHVucmVzb2x2ZWRBbm5vdGF0aW9uczogdW5yZXNvbHZlZFRhcmdldHNcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIHByb2Nlc3NBbm5vdGF0aW9ucyhjdXJyZW50Q29udGV4dCwgYW5ub3RhdGlvbkxpc3QsIG9iamVjdE1hcCwgYk92ZXJyaWRlRXhpc3RpbmcpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBjb25zdCBleHRyYVVucmVzb2x2ZWRBbm5vdGF0aW9ucyA9IFtdO1xuICAgIHVucmVzb2x2ZWRBbm5vdGF0aW9ucy5mb3JFYWNoKChhbm5vdGF0aW9uTGlzdCkgPT4ge1xuICAgICAgICBjb25zdCBjdXJyZW50VGFyZ2V0TmFtZSA9ICgwLCB1dGlsc18xLnVuYWxpYXMpKHJhd01ldGFkYXRhLnJlZmVyZW5jZXMsIGFubm90YXRpb25MaXN0LnRhcmdldCk7XG4gICAgICAgIGxldCBbYmFzZU9iaiwgYW5ub3RhdGlvblBhcnRdID0gY3VycmVudFRhcmdldE5hbWUuc3BsaXQoJ0AnKTtcbiAgICAgICAgY29uc3QgdGFyZ2V0U3BsaXQgPSBhbm5vdGF0aW9uUGFydC5zcGxpdCgnLycpO1xuICAgICAgICBiYXNlT2JqID0gYmFzZU9iaiArICdAJyArIHRhcmdldFNwbGl0WzBdO1xuICAgICAgICBjb25zdCBjdXJyZW50VGFyZ2V0ID0gdGFyZ2V0U3BsaXQuc2xpY2UoMSkucmVkdWNlKChjdXJyZW50T2JqLCBwYXRoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gY3VycmVudE9iaiA9PT0gbnVsbCB8fCBjdXJyZW50T2JqID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjdXJyZW50T2JqW3BhdGhdO1xuICAgICAgICB9LCBvYmplY3RNYXBbYmFzZU9ial0pO1xuICAgICAgICBpZiAoIWN1cnJlbnRUYXJnZXQgfHwgdHlwZW9mIGN1cnJlbnRUYXJnZXQgIT09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICBBTk5PVEFUSU9OX0VSUk9SUy5wdXNoKHtcbiAgICAgICAgICAgICAgICBtZXNzYWdlOiAnVGhlIGZvbGxvd2luZyBhbm5vdGF0aW9uIHRhcmdldCB3YXMgbm90IGZvdW5kIG9uIHRoZSBzZXJ2aWNlICcgKyBjdXJyZW50VGFyZ2V0TmFtZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50Q29udGV4dCA9IHtcbiAgICAgICAgICAgICAgICBhZGRpdGlvbmFsQW5ub3RhdGlvbnM6IGV4dHJhVW5yZXNvbHZlZEFubm90YXRpb25zLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRTb3VyY2U6IGFubm90YXRpb25MaXN0Ll9fc291cmNlLFxuICAgICAgICAgICAgICAgIGN1cnJlbnRUYXJnZXQ6IGN1cnJlbnRUYXJnZXQsXG4gICAgICAgICAgICAgICAgY3VycmVudFRlcm06ICcnLFxuICAgICAgICAgICAgICAgIHJhd01ldGFkYXRhOiByYXdNZXRhZGF0YSxcbiAgICAgICAgICAgICAgICB1bnJlc29sdmVkQW5ub3RhdGlvbnM6IHVucmVzb2x2ZWRUYXJnZXRzXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcHJvY2Vzc0Fubm90YXRpb25zKGN1cnJlbnRDb250ZXh0LCBhbm5vdGF0aW9uTGlzdCwgb2JqZWN0TWFwLCBmYWxzZSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBwcm9jZXNzVW5yZXNvbHZlZFRhcmdldHModW5yZXNvbHZlZFRhcmdldHMsIG9iamVjdE1hcCk7XG4gICAgZm9yIChjb25zdCBwcm9wZXJ0eSBpbiBBTExfQU5OT1RBVElPTl9FUlJPUlMpIHtcbiAgICAgICAgQU5OT1RBVElPTl9FUlJPUlMucHVzaChBTExfQU5OT1RBVElPTl9FUlJPUlNbcHJvcGVydHldWzBdKTtcbiAgICB9XG4gICAgcmF3TWV0YWRhdGEuZW50aXR5U2V0cyA9IHJhd01ldGFkYXRhLnNjaGVtYS5lbnRpdHlTZXRzO1xuICAgIGNvbnN0IGV4dHJhUmVmZXJlbmNlcyA9IHJhd01ldGFkYXRhLnJlZmVyZW5jZXMuZmlsdGVyKChyZWZlcmVuY2UpID0+IHtcbiAgICAgICAgcmV0dXJuIHV0aWxzXzEuZGVmYXVsdFJlZmVyZW5jZXMuZmluZCgoZGVmYXVsdFJlZikgPT4gZGVmYXVsdFJlZi5uYW1lc3BhY2UgPT09IHJlZmVyZW5jZS5uYW1lc3BhY2UpID09PSB1bmRlZmluZWQ7XG4gICAgfSk7XG4gICAgY29uc3QgY29udmVydGVkT3V0cHV0ID0ge1xuICAgICAgICB2ZXJzaW9uOiByYXdNZXRhZGF0YS52ZXJzaW9uLFxuICAgICAgICBhbm5vdGF0aW9uczogcmF3TWV0YWRhdGEuc2NoZW1hLmFubm90YXRpb25zLFxuICAgICAgICBuYW1lc3BhY2U6IHJhd01ldGFkYXRhLnNjaGVtYS5uYW1lc3BhY2UsXG4gICAgICAgIGVudGl0eUNvbnRhaW5lcjogcmF3TWV0YWRhdGEuc2NoZW1hLmVudGl0eUNvbnRhaW5lcixcbiAgICAgICAgYWN0aW9uczogcmF3TWV0YWRhdGEuc2NoZW1hLmFjdGlvbnMsXG4gICAgICAgIGVudGl0eVNldHM6IHJhd01ldGFkYXRhLnNjaGVtYS5lbnRpdHlTZXRzLFxuICAgICAgICBzaW5nbGV0b25zOiByYXdNZXRhZGF0YS5zY2hlbWEuc2luZ2xldG9ucyxcbiAgICAgICAgZW50aXR5VHlwZXM6IHJhd01ldGFkYXRhLnNjaGVtYS5lbnRpdHlUeXBlcyxcbiAgICAgICAgY29tcGxleFR5cGVzOiByYXdNZXRhZGF0YS5zY2hlbWEuY29tcGxleFR5cGVzLFxuICAgICAgICB0eXBlRGVmaW5pdGlvbnM6IHJhd01ldGFkYXRhLnNjaGVtYS50eXBlRGVmaW5pdGlvbnMsXG4gICAgICAgIHJlZmVyZW5jZXM6IHV0aWxzXzEuZGVmYXVsdFJlZmVyZW5jZXMuY29uY2F0KGV4dHJhUmVmZXJlbmNlcyksXG4gICAgICAgIGRpYWdub3N0aWNzOiBBTk5PVEFUSU9OX0VSUk9SUy5jb25jYXQoKVxuICAgIH07XG4gICAgY29udmVydGVkT3V0cHV0LnJlc29sdmVQYXRoID0gY3JlYXRlR2xvYmFsUmVzb2x2ZShjb252ZXJ0ZWRPdXRwdXQsIG9iamVjdE1hcCk7XG4gICAgcmV0dXJuIGNvbnZlcnRlZE91dHB1dDtcbn1cbmV4cG9ydHMuY29udmVydCA9IGNvbnZlcnQ7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1jb252ZXJ0ZXIuanMubWFwXG5cbi8qKiovIH0pLFxuXG4vKioqLyAzNDk6XG4vKioqLyAoZnVuY3Rpb24oX191bnVzZWRfd2VicGFja19tb2R1bGUsIGV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pIHtcblxuXG52YXIgX19jcmVhdGVCaW5kaW5nID0gKHRoaXMgJiYgdGhpcy5fX2NyZWF0ZUJpbmRpbmcpIHx8IChPYmplY3QuY3JlYXRlID8gKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XG4gICAgaWYgKGsyID09PSB1bmRlZmluZWQpIGsyID0gaztcbiAgICB2YXIgZGVzYyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3IobSwgayk7XG4gICAgaWYgKCFkZXNjIHx8IChcImdldFwiIGluIGRlc2MgPyAhbS5fX2VzTW9kdWxlIDogZGVzYy53cml0YWJsZSB8fCBkZXNjLmNvbmZpZ3VyYWJsZSkpIHtcbiAgICAgIGRlc2MgPSB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZnVuY3Rpb24oKSB7IHJldHVybiBtW2tdOyB9IH07XG4gICAgfVxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvLCBrMiwgZGVzYyk7XG59KSA6IChmdW5jdGlvbihvLCBtLCBrLCBrMikge1xuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XG4gICAgb1trMl0gPSBtW2tdO1xufSkpO1xudmFyIF9fZXhwb3J0U3RhciA9ICh0aGlzICYmIHRoaXMuX19leHBvcnRTdGFyKSB8fCBmdW5jdGlvbihtLCBleHBvcnRzKSB7XG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChleHBvcnRzLCBwKSkgX19jcmVhdGVCaW5kaW5nKGV4cG9ydHMsIG0sIHApO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgKHsgdmFsdWU6IHRydWUgfSkpO1xuX19leHBvcnRTdGFyKF9fd2VicGFja19yZXF1aXJlX18oODMwKSwgZXhwb3J0cyk7XG5fX2V4cG9ydFN0YXIoX193ZWJwYWNrX3JlcXVpcmVfXygzNjQpLCBleHBvcnRzKTtcbl9fZXhwb3J0U3RhcihfX3dlYnBhY2tfcmVxdWlyZV9fKDcxNiksIGV4cG9ydHMpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwXG5cbi8qKiovIH0pLFxuXG4vKioqLyA3MTY6XG4vKioqLyAoZnVuY3Rpb24oX191bnVzZWRfd2VicGFja19tb2R1bGUsIGV4cG9ydHMpIHtcblxuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsICh7IHZhbHVlOiB0cnVlIH0pKTtcbmV4cG9ydHMuRGVjaW1hbCA9IGV4cG9ydHMuaXNDb21wbGV4VHlwZURlZmluaXRpb24gPSBleHBvcnRzLlRlcm1Ub1R5cGVzID0gZXhwb3J0cy51bmFsaWFzID0gZXhwb3J0cy5hbGlhcyA9IGV4cG9ydHMuZGVmYXVsdFJlZmVyZW5jZXMgPSB2b2lkIDA7XG5leHBvcnRzLmRlZmF1bHRSZWZlcmVuY2VzID0gW1xuICAgIHsgYWxpYXM6ICdDYXBhYmlsaXRpZXMnLCBuYW1lc3BhY2U6ICdPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxJywgdXJpOiAnJyB9LFxuICAgIHsgYWxpYXM6ICdBZ2dyZWdhdGlvbicsIG5hbWVzcGFjZTogJ09yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMScsIHVyaTogJycgfSxcbiAgICB7IGFsaWFzOiAnVmFsaWRhdGlvbicsIG5hbWVzcGFjZTogJ09yZy5PRGF0YS5WYWxpZGF0aW9uLlYxJywgdXJpOiAnJyB9LFxuICAgIHsgbmFtZXNwYWNlOiAnT3JnLk9EYXRhLkNvcmUuVjEnLCBhbGlhczogJ0NvcmUnLCB1cmk6ICcnIH0sXG4gICAgeyBuYW1lc3BhY2U6ICdPcmcuT0RhdGEuTWVhc3VyZXMuVjEnLCBhbGlhczogJ01lYXN1cmVzJywgdXJpOiAnJyB9LFxuICAgIHsgbmFtZXNwYWNlOiAnY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxJywgYWxpYXM6ICdDb21tb24nLCB1cmk6ICcnIH0sXG4gICAgeyBuYW1lc3BhY2U6ICdjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MScsIGFsaWFzOiAnVUknLCB1cmk6ICcnIH0sXG4gICAgeyBuYW1lc3BhY2U6ICdjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxJywgYWxpYXM6ICdTZXNzaW9uJywgdXJpOiAnJyB9LFxuICAgIHsgbmFtZXNwYWNlOiAnY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxJywgYWxpYXM6ICdBbmFseXRpY3MnLCB1cmk6ICcnIH0sXG4gICAgeyBuYW1lc3BhY2U6ICdjb20uc2FwLnZvY2FidWxhcmllcy5Db2RlTGlzdC52MScsIGFsaWFzOiAnQ29kZUxpc3QnLCB1cmk6ICcnIH0sXG4gICAgeyBuYW1lc3BhY2U6ICdjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEnLCBhbGlhczogJ1BlcnNvbmFsRGF0YScsIHVyaTogJycgfSxcbiAgICB7IG5hbWVzcGFjZTogJ2NvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEnLCBhbGlhczogJ0NvbW11bmljYXRpb24nLCB1cmk6ICcnIH0sXG4gICAgeyBuYW1lc3BhY2U6ICdjb20uc2FwLnZvY2FidWxhcmllcy5IVE1MNS52MScsIGFsaWFzOiAnSFRNTDUnLCB1cmk6ICcnIH1cbl07XG4vKipcbiAqIFRyYW5zZm9ybSBhbiB1bmFsaWFzZWQgc3RyaW5nIHJlcHJlc2VudGF0aW9uIGFubm90YXRpb24gdG8gdGhlIGFsaWFzZWQgdmVyc2lvbi5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyBjdXJyZW50UmVmZXJlbmNlcyBmb3IgdGhlIHByb2plY3RcbiAqIEBwYXJhbSB1bmFsaWFzZWRWYWx1ZSB0aGUgdW5hbGlhc2VkIHZhbHVlXG4gKiBAcmV0dXJucyB0aGUgYWxpYXNlZCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBzYW1lXG4gKi9cbmZ1bmN0aW9uIGFsaWFzKHJlZmVyZW5jZXMsIHVuYWxpYXNlZFZhbHVlKSB7XG4gICAgaWYgKCFyZWZlcmVuY2VzLnJldmVyc2VSZWZlcmVuY2VNYXApIHtcbiAgICAgICAgcmVmZXJlbmNlcy5yZXZlcnNlUmVmZXJlbmNlTWFwID0gcmVmZXJlbmNlcy5yZWR1Y2UoKG1hcCwgcmVmKSA9PiB7XG4gICAgICAgICAgICBtYXBbcmVmLm5hbWVzcGFjZV0gPSByZWY7XG4gICAgICAgICAgICByZXR1cm4gbWFwO1xuICAgICAgICB9LCB7fSk7XG4gICAgfVxuICAgIGlmICghdW5hbGlhc2VkVmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHVuYWxpYXNlZFZhbHVlO1xuICAgIH1cbiAgICBjb25zdCBsYXN0RG90SW5kZXggPSB1bmFsaWFzZWRWYWx1ZS5sYXN0SW5kZXhPZignLicpO1xuICAgIGNvbnN0IG5hbWVzcGFjZSA9IHVuYWxpYXNlZFZhbHVlLnN1YnN0cmluZygwLCBsYXN0RG90SW5kZXgpO1xuICAgIGNvbnN0IHZhbHVlID0gdW5hbGlhc2VkVmFsdWUuc3Vic3RyaW5nKGxhc3REb3RJbmRleCArIDEpO1xuICAgIGNvbnN0IHJlZmVyZW5jZSA9IHJlZmVyZW5jZXMucmV2ZXJzZVJlZmVyZW5jZU1hcFtuYW1lc3BhY2VdO1xuICAgIGlmIChyZWZlcmVuY2UpIHtcbiAgICAgICAgcmV0dXJuIGAke3JlZmVyZW5jZS5hbGlhc30uJHt2YWx1ZX1gO1xuICAgIH1cbiAgICBlbHNlIGlmICh1bmFsaWFzZWRWYWx1ZS5pbmRleE9mKCdAJykgIT09IC0xKSB7XG4gICAgICAgIC8vIFRyeSB0byBzZWUgaWYgaXQncyBhbiBhbm5vdGF0aW9uIFBhdGggbGlrZSB0b19TYWxlc09yZGVyL0BVSS5MaW5lSXRlbVxuICAgICAgICBjb25zdCBbcHJlQWxpYXMsIC4uLnBvc3RBbGlhc10gPSB1bmFsaWFzZWRWYWx1ZS5zcGxpdCgnQCcpO1xuICAgICAgICByZXR1cm4gYCR7cHJlQWxpYXN9QCR7YWxpYXMocmVmZXJlbmNlcywgcG9zdEFsaWFzLmpvaW4oJ0AnKSl9YDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiB1bmFsaWFzZWRWYWx1ZTtcbiAgICB9XG59XG5leHBvcnRzLmFsaWFzID0gYWxpYXM7XG4vKipcbiAqIFRyYW5zZm9ybSBhbiBhbGlhc2VkIHN0cmluZyByZXByZXNlbnRhdGlvbiBhbm5vdGF0aW9uIHRvIHRoZSB1bmFsaWFzZWQgdmVyc2lvbi5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyBjdXJyZW50UmVmZXJlbmNlcyBmb3IgdGhlIHByb2plY3RcbiAqIEBwYXJhbSBhbGlhc2VkVmFsdWUgdGhlIGFsaWFzZWQgdmFsdWVcbiAqIEByZXR1cm5zIHRoZSB1bmFsaWFzZWQgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgc2FtZVxuICovXG5mdW5jdGlvbiB1bmFsaWFzKHJlZmVyZW5jZXMsIGFsaWFzZWRWYWx1ZSkge1xuICAgIGlmICghcmVmZXJlbmNlcy5yZWZlcmVuY2VNYXApIHtcbiAgICAgICAgcmVmZXJlbmNlcy5yZWZlcmVuY2VNYXAgPSByZWZlcmVuY2VzLnJlZHVjZSgobWFwLCByZWYpID0+IHtcbiAgICAgICAgICAgIG1hcFtyZWYuYWxpYXNdID0gcmVmO1xuICAgICAgICAgICAgcmV0dXJuIG1hcDtcbiAgICAgICAgfSwge30pO1xuICAgIH1cbiAgICBpZiAoIWFsaWFzZWRWYWx1ZSkge1xuICAgICAgICByZXR1cm4gYWxpYXNlZFZhbHVlO1xuICAgIH1cbiAgICBjb25zdCBbdm9jQWxpYXMsIC4uLnZhbHVlXSA9IGFsaWFzZWRWYWx1ZS5zcGxpdCgnLicpO1xuICAgIGNvbnN0IHJlZmVyZW5jZSA9IHJlZmVyZW5jZXMucmVmZXJlbmNlTWFwW3ZvY0FsaWFzXTtcbiAgICBpZiAocmVmZXJlbmNlKSB7XG4gICAgICAgIHJldHVybiBgJHtyZWZlcmVuY2UubmFtZXNwYWNlfS4ke3ZhbHVlLmpvaW4oJy4nKX1gO1xuICAgIH1cbiAgICBlbHNlIGlmIChhbGlhc2VkVmFsdWUuaW5kZXhPZignQCcpICE9PSAtMSkge1xuICAgICAgICAvLyBUcnkgdG8gc2VlIGlmIGl0J3MgYW4gYW5ub3RhdGlvbiBQYXRoIGxpa2UgdG9fU2FsZXNPcmRlci9AVUkuTGluZUl0ZW1cbiAgICAgICAgY29uc3QgW3ByZUFsaWFzLCAuLi5wb3N0QWxpYXNdID0gYWxpYXNlZFZhbHVlLnNwbGl0KCdAJyk7XG4gICAgICAgIHJldHVybiBgJHtwcmVBbGlhc31AJHt1bmFsaWFzKHJlZmVyZW5jZXMsIHBvc3RBbGlhcy5qb2luKCdAJykpfWA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gYWxpYXNlZFZhbHVlO1xuICAgIH1cbn1cbmV4cG9ydHMudW5hbGlhcyA9IHVuYWxpYXM7XG52YXIgVGVybVRvVHlwZXM7XG4oZnVuY3Rpb24gKFRlcm1Ub1R5cGVzKSB7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQXV0aG9yaXphdGlvbi5WMS5TZWN1cml0eVNjaGVtZXNcIl0gPSBcIk9yZy5PRGF0YS5BdXRob3JpemF0aW9uLlYxLlNlY3VyaXR5U2NoZW1lXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQXV0aG9yaXphdGlvbi5WMS5BdXRob3JpemF0aW9uc1wiXSA9IFwiT3JnLk9EYXRhLkF1dGhvcml6YXRpb24uVjEuQXV0aG9yaXphdGlvblwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuUmV2aXNpb25zXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5SZXZpc2lvblR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLkxpbmtzXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5MaW5rXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5FeGFtcGxlXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5FeGFtcGxlVmFsdWVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLk1lc3NhZ2VzXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5NZXNzYWdlVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuVmFsdWVFeGNlcHRpb25cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlZhbHVlRXhjZXB0aW9uVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuUmVzb3VyY2VFeGNlcHRpb25cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlJlc291cmNlRXhjZXB0aW9uVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuRGF0YU1vZGlmaWNhdGlvbkV4Y2VwdGlvblwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuRGF0YU1vZGlmaWNhdGlvbkV4Y2VwdGlvblR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLklzTGFuZ3VhZ2VEZXBlbmRlbnRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuRGVyZWZlcmVuY2VhYmxlSURzXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLkNvbnZlbnRpb25hbElEc1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5QZXJtaXNzaW9uc1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuUGVybWlzc2lvblwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuRGVmYXVsdE5hbWVzcGFjZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5JbW11dGFibGVcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuQ29tcHV0ZWREZWZhdWx0VmFsdWVcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuSXNVUkxcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuSXNNZWRpYVR5cGVcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuQ29udGVudERpc3Bvc2l0aW9uXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5Db250ZW50RGlzcG9zaXRpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5PcHRpbWlzdGljQ29uY3VycmVuY3lcIl0gPSBcIkVkbS5Qcm9wZXJ0eVBhdGhcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLkFkZGl0aW9uYWxQcm9wZXJ0aWVzXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLkF1dG9FeHBhbmRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuQXV0b0V4cGFuZFJlZmVyZW5jZXNcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuTWF5SW1wbGVtZW50XCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5RdWFsaWZpZWRUeXBlTmFtZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuT3JkZXJlZFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ29yZS5WMS5Qb3NpdGlvbmFsSW5zZXJ0XCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5Db3JlLlYxLkFsdGVybmF0ZUtleXNcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLkFsdGVybmF0ZUtleVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuT3B0aW9uYWxQYXJhbWV0ZXJcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLk9wdGlvbmFsUGFyYW1ldGVyVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuT3BlcmF0aW9uQXZhaWxhYmxlXCJdID0gXCJFZG0uQm9vbGVhblwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNvcmUuVjEuU3ltYm9saWNOYW1lXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5TaW1wbGVJZGVudGlmaWVyXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvbmZvcm1hbmNlTGV2ZWxcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ29uZm9ybWFuY2VMZXZlbFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQXN5bmNocm9ub3VzUmVxdWVzdHNTdXBwb3J0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5CYXRjaENvbnRpbnVlT25FcnJvclN1cHBvcnRlZFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLklzb2xhdGlvblN1cHBvcnRlZFwiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Jc29sYXRpb25MZXZlbFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Dcm9zc0pvaW5TdXBwb3J0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5DYWxsYmFja1N1cHBvcnRlZFwiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5DYWxsYmFja1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ2hhbmdlVHJhY2tpbmdcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ2hhbmdlVHJhY2tpbmdUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvdW50UmVzdHJpY3Rpb25zXCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvdW50UmVzdHJpY3Rpb25zVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5OYXZpZ2F0aW9uUmVzdHJpY3Rpb25zXCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk5hdmlnYXRpb25SZXN0cmljdGlvbnNUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkluZGV4YWJsZUJ5S2V5XCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuVG9wU3VwcG9ydGVkXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2tpcFN1cHBvcnRlZFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvbXB1dGVTdXBwb3J0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5TZWxlY3RTdXBwb3J0XCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlNlbGVjdFN1cHBvcnRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkJhdGNoU3VwcG9ydGVkXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQmF0Y2hTdXBwb3J0XCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkJhdGNoU3VwcG9ydFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRmlsdGVyUmVzdHJpY3Rpb25zXCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkZpbHRlclJlc3RyaWN0aW9uc1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU29ydFJlc3RyaWN0aW9uc1wiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Tb3J0UmVzdHJpY3Rpb25zVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5FeHBhbmRSZXN0cmljdGlvbnNcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRXhwYW5kUmVzdHJpY3Rpb25zVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5TZWFyY2hSZXN0cmljdGlvbnNcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VhcmNoUmVzdHJpY3Rpb25zVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5LZXlBc1NlZ21lbnRTdXBwb3J0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5RdWVyeVNlZ21lbnRTdXBwb3J0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5JbnNlcnRSZXN0cmljdGlvbnNcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuSW5zZXJ0UmVzdHJpY3Rpb25zVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWVwSW5zZXJ0U3VwcG9ydFwiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWVwSW5zZXJ0U3VwcG9ydFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuVXBkYXRlUmVzdHJpY3Rpb25zXCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLlVwZGF0ZVJlc3RyaWN0aW9uc1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRGVlcFVwZGF0ZVN1cHBvcnRcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuRGVlcFVwZGF0ZVN1cHBvcnRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkRlbGV0ZVJlc3RyaWN0aW9uc1wiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5EZWxldGVSZXN0cmljdGlvbnNUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkNvbGxlY3Rpb25Qcm9wZXJ0eVJlc3RyaWN0aW9uc1wiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5Db2xsZWN0aW9uUHJvcGVydHlSZXN0cmljdGlvbnNUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk9wZXJhdGlvblJlc3RyaWN0aW9uc1wiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5PcGVyYXRpb25SZXN0cmljdGlvbnNUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkFubm90YXRpb25WYWx1ZXNJblF1ZXJ5U3VwcG9ydGVkXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuTW9kaWZpY2F0aW9uUXVlcnlPcHRpb25zXCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk1vZGlmaWNhdGlvblF1ZXJ5T3B0aW9uc1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuUmVhZFJlc3RyaWN0aW9uc1wiXSA9IFwiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5SZWFkUmVzdHJpY3Rpb25zVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5DdXN0b21IZWFkZXJzXCJdID0gXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLkN1c3RvbVBhcmFtZXRlclwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkNhcGFiaWxpdGllcy5WMS5DdXN0b21RdWVyeU9wdGlvbnNcIl0gPSBcIk9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuQ3VzdG9tUGFyYW1ldGVyXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxLk1lZGlhTG9jYXRpb25VcGRhdGVTdXBwb3J0ZWRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkFwcGx5U3VwcG9ydGVkXCJdID0gXCJPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuQXBwbHlTdXBwb3J0ZWRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuR3JvdXBhYmxlXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5BZ2dyZWdhdGFibGVcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkNvbnRleHREZWZpbmluZ1Byb3BlcnRpZXNcIl0gPSBcIkVkbS5Qcm9wZXJ0eVBhdGhcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5BZ2dyZWdhdGlvbi5WMS5MZXZlbGVkSGllcmFyY2h5XCJdID0gXCJFZG0uUHJvcGVydHlQYXRoXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuUmVjdXJzaXZlSGllcmFyY2h5XCJdID0gXCJPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuUmVjdXJzaXZlSGllcmFyY2h5VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkF2YWlsYWJsZU9uQWdncmVnYXRlc1wiXSA9IFwiT3JnLk9EYXRhLkFnZ3JlZ2F0aW9uLlYxLkF2YWlsYWJsZU9uQWdncmVnYXRlc1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLk1pbmltdW1cIl0gPSBcIkVkbS5QcmltaXRpdmVUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NYXhpbXVtXCJdID0gXCJFZG0uUHJpbWl0aXZlVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuRXhjbHVzaXZlXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkFsbG93ZWRWYWx1ZXNcIl0gPSBcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkFsbG93ZWRWYWx1ZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuTXVsdGlwbGVPZlwiXSA9IFwiRWRtLkRlY2ltYWxcIjtcbiAgICBUZXJtVG9UeXBlc1tcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkNvbnN0cmFpbnRcIl0gPSBcIk9yZy5PRGF0YS5WYWxpZGF0aW9uLlYxLkNvbnN0cmFpbnRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5JdGVtc09mXCJdID0gXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5JdGVtc09mVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiT3JnLk9EYXRhLlZhbGlkYXRpb24uVjEuT3BlblByb3BlcnR5VHlwZUNvbnN0cmFpbnRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlF1YWxpZmllZFR5cGVOYW1lXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5EZXJpdmVkVHlwZUNvbnN0cmFpbnRcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlF1YWxpZmllZFR5cGVOYW1lXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5BbGxvd2VkVGVybXNcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlF1YWxpZmllZFRlcm1OYW1lXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5BcHBsaWNhYmxlVGVybXNcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlF1YWxpZmllZFRlcm1OYW1lXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NYXhJdGVtc1wiXSA9IFwiRWRtLkludDY0XCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuVmFsaWRhdGlvbi5WMS5NaW5JdGVtc1wiXSA9IFwiRWRtLkludDY0XCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuTWVhc3VyZXMuVjEuU2NhbGVcIl0gPSBcIkVkbS5CeXRlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJPcmcuT0RhdGEuTWVhc3VyZXMuVjEuRHVyYXRpb25HcmFudWxhcml0eVwiXSA9IFwiT3JnLk9EYXRhLk1lYXN1cmVzLlYxLkR1cmF0aW9uR3JhbnVsYXJpdHlUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuRGltZW5zaW9uXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5NZWFzdXJlXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5BY2N1bXVsYXRpdmVNZWFzdXJlXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5Sb2xsZWRVcFByb3BlcnR5Q291bnRcIl0gPSBcIkVkbS5JbnQxNlwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLlBsYW5uaW5nQWN0aW9uXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkFuYWx5dGljcy52MS5BZ2dyZWdhdGVkUHJvcGVydGllc1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFnZ3JlZ2F0ZWRQcm9wZXJ0eVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZXJ2aWNlVmVyc2lvblwiXSA9IFwiRWRtLkludDMyXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2VydmljZVNjaGVtYVZlcnNpb25cIl0gPSBcIkVkbS5JbnQzMlwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRGb3JcIl0gPSBcIkVkbS5Qcm9wZXJ0eVBhdGhcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0xhbmd1YWdlSWRlbnRpZmllclwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEZvcm1hdFwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRGb3JtYXRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNEaWdpdFNlcXVlbmNlXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc1VwcGVyQ2FzZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDdXJyZW5jeVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNVbml0XCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Vbml0U3BlY2lmaWNTY2FsZVwiXSA9IFwiRWRtLlByaW1pdGl2ZVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Vbml0U3BlY2lmaWNQcmVjaXNpb25cIl0gPSBcIkVkbS5QcmltaXRpdmVUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2Vjb25kYXJ5S2V5XCJdID0gXCJFZG0uUHJvcGVydHlQYXRoXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWluT2NjdXJzXCJdID0gXCJFZG0uSW50NjRcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NYXhPY2N1cnNcIl0gPSBcIkVkbS5JbnQ2NFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkFzc29jaWF0aW9uRW50aXR5XCJdID0gXCJFZG0uTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRlcml2ZWROYXZpZ2F0aW9uXCJdID0gXCJFZG0uTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk1hc2tlZFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWFza2VkQWx3YXlzXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdE1hcHBpbmdcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY09iamVjdE1hcHBpbmdUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNJbnN0YW5jZUFubm90YXRpb25cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpbHRlckV4cHJlc3Npb25SZXN0cmljdGlvbnNcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWx0ZXJFeHByZXNzaW9uUmVzdHJpY3Rpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRmllbGRDb250cm9sVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkFwcGxpY2F0aW9uXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQXBwbGljYXRpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGltZXN0YW1wXCJdID0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5FcnJvclJlc29sdXRpb25cIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5FcnJvclJlc29sdXRpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWVzc2FnZXNcIl0gPSBcIkVkbS5Db21wbGV4VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLm51bWVyaWNTZXZlcml0eVwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLk51bWVyaWNNZXNzYWdlU2V2ZXJpdHlUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTWF4aW11bU51bWVyaWNNZXNzYWdlU2V2ZXJpdHlcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5OdW1lcmljTWVzc2FnZVNldmVyaXR5VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQWN0aW9uQ3JpdGljYWxcIl0gPSBcIkVkbS5Cb29sZWFuXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQXR0cmlidXRlc1wiXSA9IFwiRWRtLlByb3BlcnR5UGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlJlbGF0ZWRSZWN1cnNpdmVIaWVyYXJjaHlcIl0gPSBcIkVkbS5Bbm5vdGF0aW9uUGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkludGVydmFsXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSW50ZXJ2YWxUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUmVzdWx0Q29udGV4dFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuV2Vha1JlZmVyZW50aWFsQ29uc3RyYWludFwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLldlYWtSZWZlcmVudGlhbENvbnN0cmFpbnRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNOYXR1cmFsUGVyc29uXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UmVsZXZhbnRRdWFsaWZpZXJzXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2ltcGxlSWRlbnRpZmllclwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlc1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0TWFwcGluZ1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdE1hcHBpbmdUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhclllYXJcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJIYWxmeWVhclwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhclF1YXJ0ZXJcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJNb250aFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhcldlZWtcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRGF5T2ZDYWxlbmRhck1vbnRoXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0RheU9mQ2FsZW5kYXJZZWFyXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyWWVhckhhbGZ5ZWFyXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0NhbGVuZGFyWWVhclF1YXJ0ZXJcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJZZWFyTW9udGhcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzQ2FsZW5kYXJZZWFyV2Vla1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNDYWxlbmRhckRhdGVcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsWWVhclwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNGaXNjYWxQZXJpb2RcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsWWVhclBlcmlvZFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNGaXNjYWxRdWFydGVyXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0Zpc2NhbFllYXJRdWFydGVyXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0Zpc2NhbFdlZWtcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRmlzY2FsWWVhcldlZWtcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLklzRGF5T2ZGaXNjYWxZZWFyXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Jc0Zpc2NhbFllYXJWYXJpYW50XCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5NdXR1YWxseUV4Y2x1c2l2ZVRlcm1cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdFwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkRyYWZ0Um9vdFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRBY3RpdmF0aW9uVmlhXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2ltcGxlSWRlbnRpZmllclwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkVkaXRhYmxlRmllbGRGb3JcIl0gPSBcIkVkbS5Qcm9wZXJ0eVBhdGhcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5TZW1hbnRpY0tleVwiXSA9IFwiRWRtLlByb3BlcnR5UGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNpZGVFZmZlY3RzXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuU2lkZUVmZmVjdHNUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRGVmYXVsdFZhbHVlc0Z1bmN0aW9uXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuUXVhbGlmaWVkTmFtZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpbHRlckRlZmF1bHRWYWx1ZVwiXSA9IFwiRWRtLlByaW1pdGl2ZVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWx0ZXJEZWZhdWx0VmFsdWVIaWdoXCJdID0gXCJFZG0uUHJpbWl0aXZlVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNvcnRPcmRlclwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlNvcnRPcmRlclR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZWN1cnNpdmVIaWVyYXJjaHlcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5SZWN1cnNpdmVIaWVyYXJjaHlUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuQ3JlYXRlZEF0XCJdID0gXCJFZG0uRGF0ZVRpbWVPZmZzZXRcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5DcmVhdGVkQnlcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5Vc2VySURcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5DaGFuZ2VkQXRcIl0gPSBcIkVkbS5EYXRlVGltZU9mZnNldFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkNoYW5nZWRCeVwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlVzZXJJRFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkFwcGx5TXVsdGlVbml0QmVoYXZpb3JGb3JTb3J0aW5nQW5kRmlsdGVyaW5nXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLkN1cnJlbmN5Q29kZXNcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLkNvZGVMaXN0U291cmNlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db2RlTGlzdC52MS5Vbml0c09mTWVhc3VyZVwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29kZUxpc3QudjEuQ29kZUxpc3RTb3VyY2VcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvZGVMaXN0LnYxLlN0YW5kYXJkQ29kZVwiXSA9IFwiRWRtLlByb3BlcnR5UGF0aFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29kZUxpc3QudjEuRXh0ZXJuYWxDb2RlXCJdID0gXCJFZG0uUHJvcGVydHlQYXRoXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db2RlTGlzdC52MS5Jc0NvbmZpZ3VyYXRpb25EZXByZWNhdGlvbkNvZGVcIl0gPSBcIkVkbS5Cb29sZWFuXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLkNvbnRhY3RcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQ29udGFjdFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuQWRkcmVzc1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5BZGRyZXNzVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5Jc0VtYWlsQWRkcmVzc1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLklzUGhvbmVOdW1iZXJcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5FdmVudFwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5FdmVudERhdGFcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW11bmljYXRpb24udjEuVGFza1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5UYXNrRGF0YVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbXVuaWNhdGlvbi52MS5NZXNzYWdlXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxLk1lc3NhZ2VEYXRhXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5IaWVyYXJjaHkudjEuUmVjdXJzaXZlSGllcmFyY2h5XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5IaWVyYXJjaHkudjEuUmVjdXJzaXZlSGllcmFyY2h5VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLkVudGl0eVNlbWFudGljc1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLkVudGl0eVNlbWFudGljc1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlBlcnNvbmFsRGF0YS52MS5GaWVsZFNlbWFudGljc1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLkZpZWxkU2VtYW50aWNzVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuUGVyc29uYWxEYXRhLnYxLklzUG90ZW50aWFsbHlQZXJzb25hbFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjEuSXNQb3RlbnRpYWxseVNlbnNpdGl2ZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5TZXNzaW9uLnYxLlN0aWNreVNlc3Npb25TdXBwb3J0ZWRcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlNlc3Npb24udjEuU3RpY2t5U2Vzc2lvblN1cHBvcnRlZFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm9cIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckluZm9UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5JZGVudGlmaWNhdGlvblwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkQWJzdHJhY3RcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkJhZGdlXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5CYWRnZVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkxpbmVJdGVtXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRBYnN0cmFjdFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU3RhdHVzSW5mb1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkQWJzdHJhY3RcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXBcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpZWxkR3JvdXBUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db25uZWN0ZWRGaWVsZHNcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNvbm5lY3RlZEZpZWxkc1R5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkdlb0xvY2F0aW9uc1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuR2VvTG9jYXRpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5HZW9Mb2NhdGlvblwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuR2VvTG9jYXRpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Db250YWN0c1wiXSA9IFwiRWRtLkFubm90YXRpb25QYXRoXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5NZWRpYVJlc291cmNlXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5NZWRpYVJlc291cmNlVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YVBvaW50XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhUG9pbnRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5LUElcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLktQSVR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydERlZmluaXRpb25UeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WYWx1ZUNyaXRpY2FsaXR5XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5WYWx1ZUNyaXRpY2FsaXR5VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JpdGljYWxpdHlMYWJlbHNcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNyaXRpY2FsaXR5TGFiZWxUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25GaWVsZHNcIl0gPSBcIkVkbS5Qcm9wZXJ0eVBhdGhcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZhY2V0c1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmFjZXRcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhlYWRlckZhY2V0c1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmFjZXRcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlF1aWNrVmlld0ZhY2V0c1wiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmFjZXRcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlF1aWNrQ3JlYXRlRmFjZXRzXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5GYWNldFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmlsdGVyRmFjZXRzXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWZlcmVuY2VGYWNldFwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlByZXNlbnRhdGlvblZhcmlhbnRcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlByZXNlbnRhdGlvblZhcmlhbnRUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25WYXJpYW50XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5TZWxlY3Rpb25WYXJpYW50VHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGhpbmdQZXJzcGVjdGl2ZVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc1N1bW1hcnlcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUGFydE9mUHJldmlld1wiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5NYXBcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuR2FsbGVyeVwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Jc0ltYWdlVVJMXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLklzSW1hZ2VcIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuTXVsdGlMaW5lVGV4dFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlRleHRBcnJhbmdlbWVudFR5cGVcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkltcG9ydGFuY2VcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkltcG9ydGFuY2VUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JlYXRlSGlkZGVuXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlVwZGF0ZUhpZGRlblwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EZWxldGVIaWRkZW5cIl0gPSBcIk9yZy5PRGF0YS5Db3JlLlYxLlRhZ1wiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuRmlsdGVyXCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZERlZmF1bHRcIl0gPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZEFic3RyYWN0XCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVwiXSA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JpdGljYWxpdHlUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eUNhbGN1bGF0aW9uVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRW1waGFzaXplZFwiXSA9IFwiT3JnLk9EYXRhLkNvcmUuVjEuVGFnXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5PcmRlckJ5XCJdID0gXCJFZG0uUHJvcGVydHlQYXRoXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5QYXJhbWV0ZXJEZWZhdWx0VmFsdWVcIl0gPSBcIkVkbS5QcmltaXRpdmVUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWNvbW1lbmRhdGlvblN0YXRlXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWNvbW1lbmRhdGlvblN0YXRlVHlwZVwiO1xuICAgIFRlcm1Ub1R5cGVzW1wiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuUmVjb21tZW5kYXRpb25MaXN0XCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5SZWNvbW1lbmRhdGlvbkxpc3RUeXBlXCI7XG4gICAgVGVybVRvVHlwZXNbXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5FeGNsdWRlRnJvbU5hdmlnYXRpb25Db250ZXh0XCJdID0gXCJPcmcuT0RhdGEuQ29yZS5WMS5UYWdcIjtcbiAgICBUZXJtVG9UeXBlc1tcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkhUTUw1LnYxLkNzc0RlZmF1bHRzXCJdID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5IVE1MNS52MS5Dc3NEZWZhdWx0c1R5cGVcIjtcbn0pKFRlcm1Ub1R5cGVzID0gZXhwb3J0cy5UZXJtVG9UeXBlcyB8fCAoZXhwb3J0cy5UZXJtVG9UeXBlcyA9IHt9KSk7XG4vKipcbiAqIERpZmZlcmVudGlhdGUgYmV0d2VlbiBhIENvbXBsZXhUeXBlIGFuZCBhIFR5cGVEZWZpbml0aW9uLlxuICogQHBhcmFtIGNvbXBsZXhUeXBlRGVmaW5pdGlvblxuICogQHJldHVybnMgdHJ1ZSBpZiB0aGUgdmFsdWUgaXMgYSBjb21wbGV4IHR5cGVcbiAqL1xuZnVuY3Rpb24gaXNDb21wbGV4VHlwZURlZmluaXRpb24oY29tcGxleFR5cGVEZWZpbml0aW9uKSB7XG4gICAgcmV0dXJuICghIWNvbXBsZXhUeXBlRGVmaW5pdGlvbiAmJiBjb21wbGV4VHlwZURlZmluaXRpb24uX3R5cGUgPT09ICdDb21wbGV4VHlwZScgJiYgISFjb21wbGV4VHlwZURlZmluaXRpb24ucHJvcGVydGllcyk7XG59XG5leHBvcnRzLmlzQ29tcGxleFR5cGVEZWZpbml0aW9uID0gaXNDb21wbGV4VHlwZURlZmluaXRpb247XG5mdW5jdGlvbiBEZWNpbWFsKHZhbHVlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaXNEZWNpbWFsKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIHZhbHVlT2YoKSB7XG4gICAgICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgICAgIH0sXG4gICAgICAgIHRvU3RyaW5nKCkge1xuICAgICAgICAgICAgcmV0dXJuIHZhbHVlLnRvU3RyaW5nKCk7XG4gICAgICAgIH1cbiAgICB9O1xufVxuZXhwb3J0cy5EZWNpbWFsID0gRGVjaW1hbDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPXV0aWxzLmpzLm1hcFxuXG4vKioqLyB9KSxcblxuLyoqKi8gMzY0OlxuLyoqKi8gKGZ1bmN0aW9uKF9fdW51c2VkX3dlYnBhY2tfbW9kdWxlLCBleHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKSB7XG5cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCAoeyB2YWx1ZTogdHJ1ZSB9KSk7XG5leHBvcnRzLnJldmVydFRlcm1Ub0dlbmVyaWNUeXBlID0gdm9pZCAwO1xuY29uc3QgdXRpbHNfMSA9IF9fd2VicGFja19yZXF1aXJlX18oNzE2KTtcbi8qKlxuICogUmV2ZXJ0IGFuIG9iamVjdCB0byBpdHMgcmF3IHR5cGUgZXF1aXZhbGVudC5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyB0aGUgY3VycmVudCByZWZlcmVuY2VcbiAqIEBwYXJhbSB2YWx1ZSB0aGUgdmFsdWUgdG8gcmV2ZXJ0XG4gKiBAcmV0dXJucyB0aGUgcmF3IHZhbHVlXG4gKi9cbmZ1bmN0aW9uIHJldmVydE9iamVjdFRvUmF3VHlwZShyZWZlcmVuY2VzLCB2YWx1ZSkge1xuICAgIHZhciBfYSwgX2I7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ0NvbGxlY3Rpb24nLFxuICAgICAgICAgICAgQ29sbGVjdGlvbjogdmFsdWUubWFwKChhbm5vKSA9PiByZXZlcnRDb2xsZWN0aW9uSXRlbVRvUmF3VHlwZShyZWZlcmVuY2VzLCBhbm5vKSlcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAoKF9hID0gdmFsdWUuaXNEZWNpbWFsKSA9PT0gbnVsbCB8fCBfYSA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2EuY2FsbCh2YWx1ZSkpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ0RlY2ltYWwnLFxuICAgICAgICAgICAgRGVjaW1hbDogdmFsdWUudmFsdWVPZigpXG4gICAgICAgIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKChfYiA9IHZhbHVlLmlzU3RyaW5nKSA9PT0gbnVsbCB8fCBfYiA9PT0gdm9pZCAwID8gdm9pZCAwIDogX2IuY2FsbCh2YWx1ZSkpIHtcbiAgICAgICAgY29uc3QgdmFsdWVNYXRjaGVzID0gdmFsdWUuc3BsaXQoJy4nKTtcbiAgICAgICAgaWYgKHZhbHVlTWF0Y2hlcy5sZW5ndGggPiAxICYmIHJlZmVyZW5jZXMuZmluZCgocmVmKSA9PiByZWYuYWxpYXMgPT09IHZhbHVlTWF0Y2hlc1swXSkpIHtcbiAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnRW51bU1lbWJlcicsXG4gICAgICAgICAgICAgICAgRW51bU1lbWJlcjogdmFsdWUudmFsdWVPZigpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdTdHJpbmcnLFxuICAgICAgICAgICAgICAgIFN0cmluZzogdmFsdWUudmFsdWVPZigpXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlLnR5cGUgPT09ICdQYXRoJykge1xuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnUGF0aCcsXG4gICAgICAgICAgICBQYXRoOiB2YWx1ZS5wYXRoXG4gICAgICAgIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlLnR5cGUgPT09ICdBbm5vdGF0aW9uUGF0aCcpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ0Fubm90YXRpb25QYXRoJyxcbiAgICAgICAgICAgIEFubm90YXRpb25QYXRoOiB2YWx1ZS52YWx1ZVxuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZS50eXBlID09PSAnQXBwbHknKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdBcHBseScsXG4gICAgICAgICAgICBBcHBseTogdmFsdWUuQXBwbHlcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWUudHlwZSA9PT0gJ051bGwnKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdOdWxsJ1xuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmICh2YWx1ZS50eXBlID09PSAnUHJvcGVydHlQYXRoJykge1xuICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICB0eXBlOiAnUHJvcGVydHlQYXRoJyxcbiAgICAgICAgICAgIFByb3BlcnR5UGF0aDogdmFsdWUudmFsdWVcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWUudHlwZSA9PT0gJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnKSB7XG4gICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgIHR5cGU6ICdOYXZpZ2F0aW9uUHJvcGVydHlQYXRoJyxcbiAgICAgICAgICAgIE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IHZhbHVlLnZhbHVlXG4gICAgICAgIH07XG4gICAgfVxuICAgIGVsc2UgaWYgKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh2YWx1ZSwgJyRUeXBlJykpIHtcbiAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgdHlwZTogJ1JlY29yZCcsXG4gICAgICAgICAgICBSZWNvcmQ6IHJldmVydENvbGxlY3Rpb25JdGVtVG9SYXdUeXBlKHJlZmVyZW5jZXMsIHZhbHVlKVxuICAgICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuLyoqXG4gKiBSZXZlcnQgYSB2YWx1ZSB0byBpdHMgcmF3IHZhbHVlIGRlcGVuZGluZyBvbiBpdHMgdHlwZS5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyB0aGUgY3VycmVudCBzZXQgb2YgcmVmZXJlbmNlXG4gKiBAcGFyYW0gdmFsdWUgdGhlIHZhbHVlIHRvIHJldmVydFxuICogQHJldHVybnMgdGhlIHJhdyBleHByZXNzaW9uXG4gKi9cbmZ1bmN0aW9uIHJldmVydFZhbHVlVG9SYXdUeXBlKHJlZmVyZW5jZXMsIHZhbHVlKSB7XG4gICAgbGV0IHJlc3VsdDtcbiAgICBjb25zdCB2YWx1ZUNvbnN0cnVjdG9yID0gdmFsdWUgPT09IG51bGwgfHwgdmFsdWUgPT09IHZvaWQgMCA/IHZvaWQgMCA6IHZhbHVlLmNvbnN0cnVjdG9yLm5hbWU7XG4gICAgc3dpdGNoICh2YWx1ZUNvbnN0cnVjdG9yKSB7XG4gICAgICAgIGNhc2UgJ1N0cmluZyc6XG4gICAgICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICAgICAgICBjb25zdCB2YWx1ZU1hdGNoZXMgPSB2YWx1ZS50b1N0cmluZygpLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICBpZiAodmFsdWVNYXRjaGVzLmxlbmd0aCA+IDEgJiYgcmVmZXJlbmNlcy5maW5kKChyZWYpID0+IHJlZi5hbGlhcyA9PT0gdmFsdWVNYXRjaGVzWzBdKSkge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0VudW1NZW1iZXInLFxuICAgICAgICAgICAgICAgICAgICBFbnVtTWVtYmVyOiB2YWx1ZS50b1N0cmluZygpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlc3VsdCA9IHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgIFN0cmluZzogdmFsdWUudG9TdHJpbmcoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnQm9vbGVhbic6XG4gICAgICAgIGNhc2UgJ2Jvb2xlYW4nOlxuICAgICAgICAgICAgcmVzdWx0ID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdCb29sJyxcbiAgICAgICAgICAgICAgICBCb29sOiB2YWx1ZS52YWx1ZU9mKClcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnTnVtYmVyJzpcbiAgICAgICAgY2FzZSAnbnVtYmVyJzpcbiAgICAgICAgICAgIGlmICh2YWx1ZS50b1N0cmluZygpID09PSB2YWx1ZS50b0ZpeGVkKCkpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdJbnQnLFxuICAgICAgICAgICAgICAgICAgICBJbnQ6IHZhbHVlLnZhbHVlT2YoKVxuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXN1bHQgPSB7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdEZWNpbWFsJyxcbiAgICAgICAgICAgICAgICAgICAgRGVjaW1hbDogdmFsdWUudmFsdWVPZigpXG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdvYmplY3QnOlxuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmVzdWx0ID0gcmV2ZXJ0T2JqZWN0VG9SYXdUeXBlKHJlZmVyZW5jZXMsIHZhbHVlKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufVxuY29uc3QgcmVzdHJpY3RlZEtleXMgPSBbJyRUeXBlJywgJ3Rlcm0nLCAnX19zb3VyY2UnLCAncXVhbGlmaWVyJywgJ0FjdGlvblRhcmdldCcsICdmdWxseVF1YWxpZmllZE5hbWUnLCAnYW5ub3RhdGlvbnMnXTtcbi8qKlxuICogUmV2ZXJ0IHRoZSBjdXJyZW50IGVtYmVkZGVkIGFubm90YXRpb25zIHRvIHRoZWlyIHJhdyB0eXBlLlxuICpcbiAqIEBwYXJhbSByZWZlcmVuY2VzIHRoZSBjdXJyZW50IHNldCBvZiByZWZlcmVuY2VcbiAqIEBwYXJhbSBjdXJyZW50QW5ub3RhdGlvbnMgdGhlIGNvbGxlY3Rpb24gaXRlbSB0byBldmFsdWF0ZVxuICogQHBhcmFtIHRhcmdldEFubm90YXRpb25zIHRoZSBwbGFjZSB3aGVyZSB3ZSBuZWVkIHRvIGFkZCB0aGUgYW5ub3RhdGlvblxuICovXG5mdW5jdGlvbiByZXZlcnRBbm5vdGF0aW9uc1RvUmF3VHlwZShyZWZlcmVuY2VzLCBjdXJyZW50QW5ub3RhdGlvbnMsIHRhcmdldEFubm90YXRpb25zKSB7XG4gICAgT2JqZWN0LmtleXMoY3VycmVudEFubm90YXRpb25zKVxuICAgICAgICAuZmlsdGVyKChrZXkpID0+IGtleSAhPT0gJ19hbm5vdGF0aW9ucycpXG4gICAgICAgIC5mb3JFYWNoKChrZXkpID0+IHtcbiAgICAgICAgT2JqZWN0LmtleXMoY3VycmVudEFubm90YXRpb25zW2tleV0pLmZvckVhY2goKHRlcm0pID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHBhcnNlZEFubm90YXRpb24gPSByZXZlcnRUZXJtVG9HZW5lcmljVHlwZShyZWZlcmVuY2VzLCBjdXJyZW50QW5ub3RhdGlvbnNba2V5XVt0ZXJtXSk7XG4gICAgICAgICAgICBpZiAoIXBhcnNlZEFubm90YXRpb24udGVybSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHVuYWxpYXNlZFRlcm0gPSAoMCwgdXRpbHNfMS51bmFsaWFzKShyZWZlcmVuY2VzLCBgJHtrZXl9LiR7dGVybX1gKTtcbiAgICAgICAgICAgICAgICBpZiAodW5hbGlhc2VkVGVybSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBxdWFsaWZpZWRTcGxpdCA9IHVuYWxpYXNlZFRlcm0uc3BsaXQoJyMnKTtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VkQW5ub3RhdGlvbi50ZXJtID0gcXVhbGlmaWVkU3BsaXRbMF07XG4gICAgICAgICAgICAgICAgICAgIGlmIChxdWFsaWZpZWRTcGxpdC5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBTdWIgQW5ub3RhdGlvbiB3aXRoIGEgcXVhbGlmaWVyLCBub3Qgc3VyZSB3aGVuIHRoYXQgY2FuIGhhcHBlbiBpbiByZWFsIHNjZW5hcmlvc1xuICAgICAgICAgICAgICAgICAgICAgICAgcGFyc2VkQW5ub3RhdGlvbi5xdWFsaWZpZXIgPSBxdWFsaWZpZWRTcGxpdFsxXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRhcmdldEFubm90YXRpb25zLnB1c2gocGFyc2VkQW5ub3RhdGlvbik7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuLyoqXG4gKiBSZXZlcnQgdGhlIGN1cnJlbnQgY29sbGVjdGlvbiBpdGVtIHRvIHRoZSBjb3JyZXNwb25kaW5nIHJhdyBhbm5vdGF0aW9uLlxuICpcbiAqIEBwYXJhbSByZWZlcmVuY2VzIHRoZSBjdXJyZW50IHNldCBvZiByZWZlcmVuY2VcbiAqIEBwYXJhbSBjb2xsZWN0aW9uSXRlbSB0aGUgY29sbGVjdGlvbiBpdGVtIHRvIGV2YWx1YXRlXG4gKiBAcmV0dXJucyB0aGUgcmF3IHR5cGUgZXF1aXZhbGVudFxuICovXG5mdW5jdGlvbiByZXZlcnRDb2xsZWN0aW9uSXRlbVRvUmF3VHlwZShyZWZlcmVuY2VzLCBjb2xsZWN0aW9uSXRlbSkge1xuICAgIGlmICh0eXBlb2YgY29sbGVjdGlvbkl0ZW0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBjb2xsZWN0aW9uSXRlbTtcbiAgICB9XG4gICAgZWxzZSBpZiAodHlwZW9mIGNvbGxlY3Rpb25JdGVtID09PSAnb2JqZWN0Jykge1xuICAgICAgICBpZiAoY29sbGVjdGlvbkl0ZW0uaGFzT3duUHJvcGVydHkoJyRUeXBlJykpIHtcbiAgICAgICAgICAgIC8vIEFubm90YXRpb24gUmVjb3JkXG4gICAgICAgICAgICBjb25zdCBvdXRJdGVtID0ge1xuICAgICAgICAgICAgICAgIHR5cGU6IGNvbGxlY3Rpb25JdGVtLiRUeXBlLFxuICAgICAgICAgICAgICAgIHByb3BlcnR5VmFsdWVzOiBbXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIENvdWxkIHZhbGlkYXRlIGtleXMgYW5kIHR5cGUgYmFzZWQgb24gJFR5cGVcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGNvbGxlY3Rpb25JdGVtKS5mb3JFYWNoKChjb2xsZWN0aW9uS2V5KSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKHJlc3RyaWN0ZWRLZXlzLmluZGV4T2YoY29sbGVjdGlvbktleSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlID0gY29sbGVjdGlvbkl0ZW1bY29sbGVjdGlvbktleV07XG4gICAgICAgICAgICAgICAgICAgIG91dEl0ZW0ucHJvcGVydHlWYWx1ZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBuYW1lOiBjb2xsZWN0aW9uS2V5LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHJldmVydFZhbHVlVG9SYXdUeXBlKHJlZmVyZW5jZXMsIHZhbHVlKVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoY29sbGVjdGlvbktleSA9PT0gJ2Fubm90YXRpb25zJyAmJiBPYmplY3Qua2V5cyhjb2xsZWN0aW9uSXRlbVtjb2xsZWN0aW9uS2V5XSkubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICBvdXRJdGVtLmFubm90YXRpb25zID0gW107XG4gICAgICAgICAgICAgICAgICAgIHJldmVydEFubm90YXRpb25zVG9SYXdUeXBlKHJlZmVyZW5jZXMsIGNvbGxlY3Rpb25JdGVtW2NvbGxlY3Rpb25LZXldLCBvdXRJdGVtLmFubm90YXRpb25zKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHJldHVybiBvdXRJdGVtO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNvbGxlY3Rpb25JdGVtLnR5cGUgPT09ICdQcm9wZXJ0eVBhdGgnKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHR5cGU6ICdQcm9wZXJ0eVBhdGgnLFxuICAgICAgICAgICAgICAgIFByb3BlcnR5UGF0aDogY29sbGVjdGlvbkl0ZW0udmFsdWVcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoY29sbGVjdGlvbkl0ZW0udHlwZSA9PT0gJ0Fubm90YXRpb25QYXRoJykge1xuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICB0eXBlOiAnQW5ub3RhdGlvblBhdGgnLFxuICAgICAgICAgICAgICAgIEFubm90YXRpb25QYXRoOiBjb2xsZWN0aW9uSXRlbS52YWx1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChjb2xsZWN0aW9uSXRlbS50eXBlID09PSAnTmF2aWdhdGlvblByb3BlcnR5UGF0aCcpIHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgdHlwZTogJ05hdmlnYXRpb25Qcm9wZXJ0eVBhdGgnLFxuICAgICAgICAgICAgICAgIE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IGNvbGxlY3Rpb25JdGVtLnZhbHVlXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxufVxuLyoqXG4gKiBSZXZlcnQgYW4gYW5ub3RhdGlvbiB0ZXJtIHRvIGl0J3MgZ2VuZXJpYyBvciByYXcgZXF1aXZhbGVudC5cbiAqXG4gKiBAcGFyYW0gcmVmZXJlbmNlcyB0aGUgcmVmZXJlbmNlIG9mIHRoZSBjdXJyZW50IGNvbnRleHRcbiAqIEBwYXJhbSBhbm5vdGF0aW9uIHRoZSBhbm5vdGF0aW9uIHRlcm0gdG8gcmV2ZXJ0XG4gKiBAcmV0dXJucyB0aGUgcmF3IGFubm90YXRpb25cbiAqL1xuZnVuY3Rpb24gcmV2ZXJ0VGVybVRvR2VuZXJpY1R5cGUocmVmZXJlbmNlcywgYW5ub3RhdGlvbikge1xuICAgIGNvbnN0IGJhc2VBbm5vdGF0aW9uID0ge1xuICAgICAgICB0ZXJtOiBhbm5vdGF0aW9uLnRlcm0sXG4gICAgICAgIHF1YWxpZmllcjogYW5ub3RhdGlvbi5xdWFsaWZpZXJcbiAgICB9O1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFubm90YXRpb24pKSB7XG4gICAgICAgIC8vIENvbGxlY3Rpb25cbiAgICAgICAgaWYgKGFubm90YXRpb24uaGFzT3duUHJvcGVydHkoJ2Fubm90YXRpb25zJykgJiYgT2JqZWN0LmtleXMoYW5ub3RhdGlvbi5hbm5vdGF0aW9ucykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgLy8gQW5ub3RhdGlvbiBvbiBhIGNvbGxlY3Rpb24gaXRzZWxmLCBub3Qgc3VyZSB3aGVuIHRoYXQgaGFwcGVucyBpZiBhdCBhbGxcbiAgICAgICAgICAgIGJhc2VBbm5vdGF0aW9uLmFubm90YXRpb25zID0gW107XG4gICAgICAgICAgICByZXZlcnRBbm5vdGF0aW9uc1RvUmF3VHlwZShyZWZlcmVuY2VzLCBhbm5vdGF0aW9uLmFubm90YXRpb25zLCBiYXNlQW5ub3RhdGlvbi5hbm5vdGF0aW9ucyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIC4uLmJhc2VBbm5vdGF0aW9uLFxuICAgICAgICAgICAgY29sbGVjdGlvbjogYW5ub3RhdGlvbi5tYXAoKGFubm8pID0+IHJldmVydENvbGxlY3Rpb25JdGVtVG9SYXdUeXBlKHJlZmVyZW5jZXMsIGFubm8pKVxuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIGlmIChhbm5vdGF0aW9uLmhhc093blByb3BlcnR5KCckVHlwZScpKSB7XG4gICAgICAgIHJldHVybiB7IC4uLmJhc2VBbm5vdGF0aW9uLCByZWNvcmQ6IHJldmVydENvbGxlY3Rpb25JdGVtVG9SYXdUeXBlKHJlZmVyZW5jZXMsIGFubm90YXRpb24pIH07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4geyAuLi5iYXNlQW5ub3RhdGlvbiwgdmFsdWU6IHJldmVydFZhbHVlVG9SYXdUeXBlKHJlZmVyZW5jZXMsIGFubm90YXRpb24pIH07XG4gICAgfVxufVxuZXhwb3J0cy5yZXZlcnRUZXJtVG9HZW5lcmljVHlwZSA9IHJldmVydFRlcm1Ub0dlbmVyaWNUeXBlO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9d3JpdGViYWNrLmpzLm1hcFxuXG4vKioqLyB9KVxuXG4vKioqKioqLyBcdH0pO1xuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cbi8qKioqKiovIFx0Ly8gVGhlIG1vZHVsZSBjYWNoZVxuLyoqKioqKi8gXHR2YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG4vKioqKioqLyBcdFxuLyoqKioqKi8gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuLyoqKioqKi8gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG4vKioqKioqLyBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4vKioqKioqLyBcdFx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG4vKioqKioqLyBcdFx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4vKioqKioqLyBcdFx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdFx0fVxuLyoqKioqKi8gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4vKioqKioqLyBcdFx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG4vKioqKioqLyBcdFx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG4vKioqKioqLyBcdFx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuLyoqKioqKi8gXHRcdFx0ZXhwb3J0czoge31cbi8qKioqKiovIFx0XHR9O1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0XHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cbi8qKioqKiovIFx0XHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcbi8qKioqKiovIFx0XG4vKioqKioqLyBcdFx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcbi8qKioqKiovIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4vKioqKioqLyBcdH1cbi8qKioqKiovIFx0XG4vKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuLyoqKioqKi8gXHRcbi8qKioqKiovIFx0Ly8gc3RhcnR1cFxuLyoqKioqKi8gXHQvLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8qKioqKiovIFx0Ly8gVGhpcyBlbnRyeSBtb2R1bGUgaXMgcmVmZXJlbmNlZCBieSBvdGhlciBtb2R1bGVzIHNvIGl0IGNhbid0IGJlIGlubGluZWRcbi8qKioqKiovIFx0dmFyIF9fd2VicGFja19leHBvcnRzX18gPSBfX3dlYnBhY2tfcmVxdWlyZV9fKDM0OSk7XG4vKioqKioqLyBcdEFubm90YXRpb25Db252ZXJ0ZXIgPSBfX3dlYnBhY2tfZXhwb3J0c19fO1xuLyoqKioqKi8gXHRcbi8qKioqKiovIH0pKClcbjsiXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQUFJQSxtQkFBbUI7QUFDdkI7QUFBUyxDQUFDLFlBQVc7RUFBRTtFQUN2QjtFQUFVLFlBQVk7O0VBQ3RCO0VBQVUsSUFBSUMsbUJBQW1CLEdBQUk7SUFFckMsS0FBTSxHQUFHLEVBQ1QsS0FBTyxVQUFTQyx1QkFBdUIsRUFBRUMsT0FBTyxFQUFFQyxtQkFBbUIsRUFBRTtNQUd2RUMsTUFBTSxDQUFDQyxjQUFjLENBQUNILE9BQU8sRUFBRSxZQUFZLEVBQUc7UUFBRUksS0FBSyxFQUFFO01BQUssQ0FBQyxDQUFFO01BQy9ESixPQUFPLENBQUNLLE9BQU8sR0FBRyxLQUFLLENBQUM7TUFDeEIsSUFBTUMsT0FBTyxHQUFHTCxtQkFBbUIsQ0FBQyxHQUFHLENBQUM7TUFDeEM7QUFDQTtBQUNBO01BRkEsSUFHTU0sSUFBSTtNQUNOO0FBQ0o7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
    return AnnotationConverter;
    },true);
