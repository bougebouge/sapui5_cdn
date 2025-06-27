/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/converters/common/AnnotationConverter", "../helpers/StableIdHelper"], function (AnnotationConverter, StableIdHelper) {
  "use strict";

  var _exports = {};
  var generate = StableIdHelper.generate;
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }
  function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  function _iterableToArrayLimit(arr, i) { var _i = null == arr ? null : "undefined" != typeof Symbol && arr[Symbol.iterator] || arr["@@iterator"]; if (null != _i) { var _s, _e, _x, _r, _arr = [], _n = !0, _d = !1; try { if (_x = (_i = _i.call(arr)).next, 0 === i) { if (Object(_i) !== _i) return; _n = !1; } else for (; !(_n = (_s = _x.call(_i)).done) && (_arr.push(_s.value), _arr.length !== i); _n = !0) { ; } } catch (err) { _d = !0, _e = err; } finally { try { if (!_n && null != _i.return && (_r = _i.return(), Object(_r) !== _r)) return; } finally { if (_d) throw _e; } } return _arr; } }
  function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }
  var VOCABULARY_ALIAS = {
    "Org.OData.Capabilities.V1": "Capabilities",
    "Org.OData.Core.V1": "Core",
    "Org.OData.Measures.V1": "Measures",
    "com.sap.vocabularies.Common.v1": "Common",
    "com.sap.vocabularies.UI.v1": "UI",
    "com.sap.vocabularies.Session.v1": "Session",
    "com.sap.vocabularies.Analytics.v1": "Analytics",
    "com.sap.vocabularies.PersonalData.v1": "PersonalData",
    "com.sap.vocabularies.Communication.v1": "Communication"
  };
  var DefaultEnvironmentCapabilities = {
    Chart: true,
    MicroChart: true,
    UShell: true,
    IntentBasedNavigation: true,
    AppState: true
  };
  _exports.DefaultEnvironmentCapabilities = DefaultEnvironmentCapabilities;
  function parsePropertyValue(annotationObject, propertyKey, currentTarget, annotationsLists, oCapabilities) {
    var value;
    var currentPropertyTarget = "".concat(currentTarget, "/").concat(propertyKey);
    var typeOfAnnotation = typeof annotationObject;
    if (annotationObject === null) {
      value = {
        type: "Null",
        Null: null
      };
    } else if (typeOfAnnotation === "string") {
      value = {
        type: "String",
        String: annotationObject
      };
    } else if (typeOfAnnotation === "boolean") {
      value = {
        type: "Bool",
        Bool: annotationObject
      };
    } else if (typeOfAnnotation === "number") {
      value = {
        type: "Int",
        Int: annotationObject
      };
    } else if (Array.isArray(annotationObject)) {
      value = {
        type: "Collection",
        Collection: annotationObject.map(function (subAnnotationObject, subAnnotationObjectIndex) {
          return parseAnnotationObject(subAnnotationObject, "".concat(currentPropertyTarget, "/").concat(subAnnotationObjectIndex), annotationsLists, oCapabilities);
        })
      };
      if (annotationObject.length > 0) {
        if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
          value.Collection.type = "PropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$Path")) {
          value.Collection.type = "Path";
        } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
          value.Collection.type = "NavigationPropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
          value.Collection.type = "AnnotationPath";
        } else if (annotationObject[0].hasOwnProperty("$Type")) {
          value.Collection.type = "Record";
        } else if (annotationObject[0].hasOwnProperty("$If")) {
          value.Collection.type = "If";
        } else if (annotationObject[0].hasOwnProperty("$Or")) {
          value.Collection.type = "Or";
        } else if (annotationObject[0].hasOwnProperty("$And")) {
          value.Collection.type = "And";
        } else if (annotationObject[0].hasOwnProperty("$Eq")) {
          value.Collection.type = "Eq";
        } else if (annotationObject[0].hasOwnProperty("$Ne")) {
          value.Collection.type = "Ne";
        } else if (annotationObject[0].hasOwnProperty("$Not")) {
          value.Collection.type = "Not";
        } else if (annotationObject[0].hasOwnProperty("$Gt")) {
          value.Collection.type = "Gt";
        } else if (annotationObject[0].hasOwnProperty("$Ge")) {
          value.Collection.type = "Ge";
        } else if (annotationObject[0].hasOwnProperty("$Lt")) {
          value.Collection.type = "Lt";
        } else if (annotationObject[0].hasOwnProperty("$Le")) {
          value.Collection.type = "Le";
        } else if (annotationObject[0].hasOwnProperty("$Apply")) {
          value.Collection.type = "Apply";
        } else if (typeof annotationObject[0] === "object") {
          // $Type is optional...
          value.Collection.type = "Record";
        } else {
          value.Collection.type = "String";
        }
      }
    } else if (annotationObject.$Path !== undefined) {
      value = {
        type: "Path",
        Path: annotationObject.$Path
      };
    } else if (annotationObject.$Decimal !== undefined) {
      value = {
        type: "Decimal",
        Decimal: parseFloat(annotationObject.$Decimal)
      };
    } else if (annotationObject.$PropertyPath !== undefined) {
      value = {
        type: "PropertyPath",
        PropertyPath: annotationObject.$PropertyPath
      };
    } else if (annotationObject.$NavigationPropertyPath !== undefined) {
      value = {
        type: "NavigationPropertyPath",
        NavigationPropertyPath: annotationObject.$NavigationPropertyPath
      };
    } else if (annotationObject.$If !== undefined) {
      value = {
        type: "If",
        If: annotationObject.$If
      };
    } else if (annotationObject.$And !== undefined) {
      value = {
        type: "And",
        And: annotationObject.$And
      };
    } else if (annotationObject.$Or !== undefined) {
      value = {
        type: "Or",
        Or: annotationObject.$Or
      };
    } else if (annotationObject.$Not !== undefined) {
      value = {
        type: "Not",
        Not: annotationObject.$Not
      };
    } else if (annotationObject.$Eq !== undefined) {
      value = {
        type: "Eq",
        Eq: annotationObject.$Eq
      };
    } else if (annotationObject.$Ne !== undefined) {
      value = {
        type: "Ne",
        Ne: annotationObject.$Ne
      };
    } else if (annotationObject.$Gt !== undefined) {
      value = {
        type: "Gt",
        Gt: annotationObject.$Gt
      };
    } else if (annotationObject.$Ge !== undefined) {
      value = {
        type: "Ge",
        Ge: annotationObject.$Ge
      };
    } else if (annotationObject.$Lt !== undefined) {
      value = {
        type: "Lt",
        Lt: annotationObject.$Lt
      };
    } else if (annotationObject.$Le !== undefined) {
      value = {
        type: "Le",
        Le: annotationObject.$Le
      };
    } else if (annotationObject.$Apply !== undefined) {
      value = {
        type: "Apply",
        Apply: annotationObject.$Apply,
        Function: annotationObject.$Function
      };
    } else if (annotationObject.$AnnotationPath !== undefined) {
      value = {
        type: "AnnotationPath",
        AnnotationPath: annotationObject.$AnnotationPath
      };
    } else if (annotationObject.$EnumMember !== undefined) {
      value = {
        type: "EnumMember",
        EnumMember: "".concat(mapNameToAlias(annotationObject.$EnumMember.split("/")[0]), "/").concat(annotationObject.$EnumMember.split("/")[1])
      };
    } else if (annotationObject.$Type) {
      value = {
        type: "Record",
        Record: parseAnnotationObject(annotationObject, currentTarget, annotationsLists, oCapabilities)
      };
    } else {
      value = {
        type: "Record",
        Record: parseAnnotationObject(annotationObject, currentTarget, annotationsLists, oCapabilities)
      };
    }
    return {
      name: propertyKey,
      value: value
    };
  }
  function mapNameToAlias(annotationName) {
    var _annotationName$split = annotationName.split("@"),
      _annotationName$split2 = _slicedToArray(_annotationName$split, 2),
      pathPart = _annotationName$split2[0],
      annoPart = _annotationName$split2[1];
    if (!annoPart) {
      annoPart = pathPart;
      pathPart = "";
    } else {
      pathPart += "@";
    }
    var lastDot = annoPart.lastIndexOf(".");
    return "".concat(pathPart + VOCABULARY_ALIAS[annoPart.substr(0, lastDot)], ".").concat(annoPart.substr(lastDot + 1));
  }
  function parseAnnotationObject(annotationObject, currentObjectTarget, annotationsLists, oCapabilities) {
    var parsedAnnotationObject = {};
    var typeOfObject = typeof annotationObject;
    if (annotationObject === null) {
      parsedAnnotationObject = {
        type: "Null",
        Null: null
      };
    } else if (typeOfObject === "string") {
      parsedAnnotationObject = {
        type: "String",
        String: annotationObject
      };
    } else if (typeOfObject === "boolean") {
      parsedAnnotationObject = {
        type: "Bool",
        Bool: annotationObject
      };
    } else if (typeOfObject === "number") {
      parsedAnnotationObject = {
        type: "Int",
        Int: annotationObject
      };
    } else if (annotationObject.$AnnotationPath !== undefined) {
      parsedAnnotationObject = {
        type: "AnnotationPath",
        AnnotationPath: annotationObject.$AnnotationPath
      };
    } else if (annotationObject.$Path !== undefined) {
      parsedAnnotationObject = {
        type: "Path",
        Path: annotationObject.$Path
      };
    } else if (annotationObject.$Decimal !== undefined) {
      parsedAnnotationObject = {
        type: "Decimal",
        Decimal: parseFloat(annotationObject.$Decimal)
      };
    } else if (annotationObject.$PropertyPath !== undefined) {
      parsedAnnotationObject = {
        type: "PropertyPath",
        PropertyPath: annotationObject.$PropertyPath
      };
    } else if (annotationObject.$If !== undefined) {
      parsedAnnotationObject = {
        type: "If",
        If: annotationObject.$If
      };
    } else if (annotationObject.$And !== undefined) {
      parsedAnnotationObject = {
        type: "And",
        And: annotationObject.$And
      };
    } else if (annotationObject.$Or !== undefined) {
      parsedAnnotationObject = {
        type: "Or",
        Or: annotationObject.$Or
      };
    } else if (annotationObject.$Not !== undefined) {
      parsedAnnotationObject = {
        type: "Not",
        Not: annotationObject.$Not
      };
    } else if (annotationObject.$Eq !== undefined) {
      parsedAnnotationObject = {
        type: "Eq",
        Eq: annotationObject.$Eq
      };
    } else if (annotationObject.$Ne !== undefined) {
      parsedAnnotationObject = {
        type: "Ne",
        Ne: annotationObject.$Ne
      };
    } else if (annotationObject.$Gt !== undefined) {
      parsedAnnotationObject = {
        type: "Gt",
        Gt: annotationObject.$Gt
      };
    } else if (annotationObject.$Ge !== undefined) {
      parsedAnnotationObject = {
        type: "Ge",
        Ge: annotationObject.$Ge
      };
    } else if (annotationObject.$Lt !== undefined) {
      parsedAnnotationObject = {
        type: "Lt",
        Lt: annotationObject.$Lt
      };
    } else if (annotationObject.$Le !== undefined) {
      parsedAnnotationObject = {
        type: "Le",
        Le: annotationObject.$Le
      };
    } else if (annotationObject.$Apply !== undefined) {
      parsedAnnotationObject = {
        type: "Apply",
        Apply: annotationObject.$Apply,
        Function: annotationObject.$Function
      };
    } else if (annotationObject.$NavigationPropertyPath !== undefined) {
      parsedAnnotationObject = {
        type: "NavigationPropertyPath",
        NavigationPropertyPath: annotationObject.$NavigationPropertyPath
      };
    } else if (annotationObject.$EnumMember !== undefined) {
      parsedAnnotationObject = {
        type: "EnumMember",
        EnumMember: "".concat(mapNameToAlias(annotationObject.$EnumMember.split("/")[0]), "/").concat(annotationObject.$EnumMember.split("/")[1])
      };
    } else if (Array.isArray(annotationObject)) {
      var parsedAnnotationCollection = parsedAnnotationObject;
      parsedAnnotationCollection.collection = annotationObject.map(function (subAnnotationObject, subAnnotationIndex) {
        return parseAnnotationObject(subAnnotationObject, "".concat(currentObjectTarget, "/").concat(subAnnotationIndex), annotationsLists, oCapabilities);
      });
      if (annotationObject.length > 0) {
        if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
          parsedAnnotationCollection.collection.type = "PropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$Path")) {
          parsedAnnotationCollection.collection.type = "Path";
        } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
          parsedAnnotationCollection.collection.type = "NavigationPropertyPath";
        } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
          parsedAnnotationCollection.collection.type = "AnnotationPath";
        } else if (annotationObject[0].hasOwnProperty("$Type")) {
          parsedAnnotationCollection.collection.type = "Record";
        } else if (annotationObject[0].hasOwnProperty("$If")) {
          parsedAnnotationCollection.collection.type = "If";
        } else if (annotationObject[0].hasOwnProperty("$And")) {
          parsedAnnotationCollection.collection.type = "And";
        } else if (annotationObject[0].hasOwnProperty("$Or")) {
          parsedAnnotationCollection.collection.type = "Or";
        } else if (annotationObject[0].hasOwnProperty("$Eq")) {
          parsedAnnotationCollection.collection.type = "Eq";
        } else if (annotationObject[0].hasOwnProperty("$Ne")) {
          parsedAnnotationCollection.collection.type = "Ne";
        } else if (annotationObject[0].hasOwnProperty("$Not")) {
          parsedAnnotationCollection.collection.type = "Not";
        } else if (annotationObject[0].hasOwnProperty("$Gt")) {
          parsedAnnotationCollection.collection.type = "Gt";
        } else if (annotationObject[0].hasOwnProperty("$Ge")) {
          parsedAnnotationCollection.collection.type = "Ge";
        } else if (annotationObject[0].hasOwnProperty("$Lt")) {
          parsedAnnotationCollection.collection.type = "Lt";
        } else if (annotationObject[0].hasOwnProperty("$Le")) {
          parsedAnnotationCollection.collection.type = "Le";
        } else if (annotationObject[0].hasOwnProperty("$Apply")) {
          parsedAnnotationCollection.collection.type = "Apply";
        } else if (typeof annotationObject[0] === "object") {
          parsedAnnotationCollection.collection.type = "Record";
        } else {
          parsedAnnotationCollection.collection.type = "String";
        }
      }
    } else {
      if (annotationObject.$Type) {
        var typeValue = annotationObject.$Type;
        parsedAnnotationObject.type = typeValue; //`${typeAlias}.${typeTerm}`;
      }

      var propertyValues = [];
      Object.keys(annotationObject).forEach(function (propertyKey) {
        if (propertyKey !== "$Type" && propertyKey !== "$If" && propertyKey !== "$Apply" && propertyKey !== "$And" && propertyKey !== "$Or" && propertyKey !== "$Ne" && propertyKey !== "$Gt" && propertyKey !== "$Ge" && propertyKey !== "$Lt" && propertyKey !== "$Le" && propertyKey !== "$Not" && propertyKey !== "$Eq" && !propertyKey.startsWith("@")) {
          propertyValues.push(parsePropertyValue(annotationObject[propertyKey], propertyKey, currentObjectTarget, annotationsLists, oCapabilities));
        } else if (propertyKey.startsWith("@")) {
          // Annotation of annotation
          createAnnotationLists(_defineProperty({}, propertyKey, annotationObject[propertyKey]), currentObjectTarget, annotationsLists, oCapabilities);
        }
      });
      parsedAnnotationObject.propertyValues = propertyValues;
    }
    return parsedAnnotationObject;
  }
  function getOrCreateAnnotationList(target, annotationsLists) {
    if (!annotationsLists.hasOwnProperty(target)) {
      annotationsLists[target] = {
        target: target,
        annotations: []
      };
    }
    return annotationsLists[target];
  }
  function removeChartAnnotations(annotationObject) {
    return annotationObject.filter(function (oRecord) {
      if (oRecord.Target && oRecord.Target.$AnnotationPath) {
        return oRecord.Target.$AnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.Chart") === -1;
      } else {
        return true;
      }
    });
  }
  function removeIBNAnnotations(annotationObject) {
    return annotationObject.filter(function (oRecord) {
      return oRecord.$Type !== "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation";
    });
  }
  function handlePresentationVariant(annotationObject) {
    return annotationObject.filter(function (oRecord) {
      return oRecord.$AnnotationPath !== "@com.sap.vocabularies.UI.v1.Chart";
    });
  }
  function createAnnotationLists(annotationObjects, annotationTarget, annotationLists, oCapabilities) {
    if (Object.keys(annotationObjects).length === 0) {
      return;
    }
    var outAnnotationObject = getOrCreateAnnotationList(annotationTarget, annotationLists);
    if (!oCapabilities.MicroChart) {
      delete annotationObjects["@com.sap.vocabularies.UI.v1.Chart"];
    }
    var _loop = function (_annotationKey) {
      var annotationObject = annotationObjects[_annotationKey];
      switch (_annotationKey) {
        case "@com.sap.vocabularies.UI.v1.HeaderFacets":
          if (!oCapabilities.MicroChart) {
            annotationObject = removeChartAnnotations(annotationObject);
            annotationObjects[_annotationKey] = annotationObject;
          }
          break;
        case "@com.sap.vocabularies.UI.v1.Identification":
          if (!oCapabilities.IntentBasedNavigation) {
            annotationObject = removeIBNAnnotations(annotationObject);
            annotationObjects[_annotationKey] = annotationObject;
          }
          break;
        case "@com.sap.vocabularies.UI.v1.LineItem":
          if (!oCapabilities.IntentBasedNavigation) {
            annotationObject = removeIBNAnnotations(annotationObject);
            annotationObjects[_annotationKey] = annotationObject;
          }
          if (!oCapabilities.MicroChart) {
            annotationObject = removeChartAnnotations(annotationObject);
            annotationObjects[_annotationKey] = annotationObject;
          }
          break;
        case "@com.sap.vocabularies.UI.v1.FieldGroup":
          if (!oCapabilities.IntentBasedNavigation) {
            annotationObject.Data = removeIBNAnnotations(annotationObject.Data);
            annotationObjects[_annotationKey] = annotationObject;
          }
          if (!oCapabilities.MicroChart) {
            annotationObject.Data = removeChartAnnotations(annotationObject.Data);
            annotationObjects[_annotationKey] = annotationObject;
          }
          break;
        case "@com.sap.vocabularies.UI.v1.PresentationVariant":
          if (!oCapabilities.Chart && annotationObject.Visualizations) {
            annotationObject.Visualizations = handlePresentationVariant(annotationObject.Visualizations);
            annotationObjects[_annotationKey] = annotationObject;
          }
          break;
        default:
          break;
      }
      var currentOutAnnotationObject = outAnnotationObject;

      // Check for annotation of annotation
      var annotationOfAnnotationSplit = _annotationKey.split("@");
      if (annotationOfAnnotationSplit.length > 2) {
        currentOutAnnotationObject = getOrCreateAnnotationList("".concat(annotationTarget, "@").concat(annotationOfAnnotationSplit[1]), annotationLists);
        _annotationKey = annotationOfAnnotationSplit[2];
      } else {
        _annotationKey = annotationOfAnnotationSplit[1];
      }
      var annotationQualifierSplit = _annotationKey.split("#");
      var qualifier = annotationQualifierSplit[1];
      _annotationKey = annotationQualifierSplit[0];
      var parsedAnnotationObject = {
        term: "".concat(_annotationKey),
        qualifier: qualifier
      };
      var currentAnnotationTarget = "".concat(annotationTarget, "@").concat(parsedAnnotationObject.term);
      if (qualifier) {
        currentAnnotationTarget += "#".concat(qualifier);
      }
      var isCollection = false;
      var typeofAnnotation = typeof annotationObject;
      if (annotationObject === null) {
        parsedAnnotationObject.value = {
          type: "Bool",
          Bool: annotationObject
        };
      } else if (typeofAnnotation === "string") {
        parsedAnnotationObject.value = {
          type: "String",
          String: annotationObject
        };
      } else if (typeofAnnotation === "boolean") {
        parsedAnnotationObject.value = {
          type: "Bool",
          Bool: annotationObject
        };
      } else if (typeofAnnotation === "number") {
        parsedAnnotationObject.value = {
          type: "Int",
          Int: annotationObject
        };
      } else if (annotationObject.$If !== undefined) {
        parsedAnnotationObject.value = {
          type: "If",
          If: annotationObject.$If
        };
      } else if (annotationObject.$And !== undefined) {
        parsedAnnotationObject.value = {
          type: "And",
          And: annotationObject.$And
        };
      } else if (annotationObject.$Or !== undefined) {
        parsedAnnotationObject.value = {
          type: "Or",
          Or: annotationObject.$Or
        };
      } else if (annotationObject.$Not !== undefined) {
        parsedAnnotationObject.value = {
          type: "Not",
          Not: annotationObject.$Not
        };
      } else if (annotationObject.$Eq !== undefined) {
        parsedAnnotationObject.value = {
          type: "Eq",
          Eq: annotationObject.$Eq
        };
      } else if (annotationObject.$Ne !== undefined) {
        parsedAnnotationObject.value = {
          type: "Ne",
          Ne: annotationObject.$Ne
        };
      } else if (annotationObject.$Gt !== undefined) {
        parsedAnnotationObject.value = {
          type: "Gt",
          Gt: annotationObject.$Gt
        };
      } else if (annotationObject.$Ge !== undefined) {
        parsedAnnotationObject.value = {
          type: "Ge",
          Ge: annotationObject.$Ge
        };
      } else if (annotationObject.$Lt !== undefined) {
        parsedAnnotationObject.value = {
          type: "Lt",
          Lt: annotationObject.$Lt
        };
      } else if (annotationObject.$Le !== undefined) {
        parsedAnnotationObject.value = {
          type: "Le",
          Le: annotationObject.$Le
        };
      } else if (annotationObject.$Apply !== undefined) {
        parsedAnnotationObject.value = {
          type: "Apply",
          Apply: annotationObject.$Apply,
          Function: annotationObject.$Function
        };
      } else if (annotationObject.$Path !== undefined) {
        parsedAnnotationObject.value = {
          type: "Path",
          Path: annotationObject.$Path
        };
      } else if (annotationObject.$AnnotationPath !== undefined) {
        parsedAnnotationObject.value = {
          type: "AnnotationPath",
          AnnotationPath: annotationObject.$AnnotationPath
        };
      } else if (annotationObject.$Decimal !== undefined) {
        parsedAnnotationObject.value = {
          type: "Decimal",
          Decimal: parseFloat(annotationObject.$Decimal)
        };
      } else if (annotationObject.$EnumMember !== undefined) {
        parsedAnnotationObject.value = {
          type: "EnumMember",
          EnumMember: "".concat(mapNameToAlias(annotationObject.$EnumMember.split("/")[0]), "/").concat(annotationObject.$EnumMember.split("/")[1])
        };
      } else if (Array.isArray(annotationObject)) {
        isCollection = true;
        parsedAnnotationObject.collection = annotationObject.map(function (subAnnotationObject, subAnnotationIndex) {
          return parseAnnotationObject(subAnnotationObject, "".concat(currentAnnotationTarget, "/").concat(subAnnotationIndex), annotationLists, oCapabilities);
        });
        if (annotationObject.length > 0) {
          if (annotationObject[0].hasOwnProperty("$PropertyPath")) {
            parsedAnnotationObject.collection.type = "PropertyPath";
          } else if (annotationObject[0].hasOwnProperty("$Path")) {
            parsedAnnotationObject.collection.type = "Path";
          } else if (annotationObject[0].hasOwnProperty("$NavigationPropertyPath")) {
            parsedAnnotationObject.collection.type = "NavigationPropertyPath";
          } else if (annotationObject[0].hasOwnProperty("$AnnotationPath")) {
            parsedAnnotationObject.collection.type = "AnnotationPath";
          } else if (annotationObject[0].hasOwnProperty("$Type")) {
            parsedAnnotationObject.collection.type = "Record";
          } else if (annotationObject[0].hasOwnProperty("$If")) {
            parsedAnnotationObject.collection.type = "If";
          } else if (annotationObject[0].hasOwnProperty("$Or")) {
            parsedAnnotationObject.collection.type = "Or";
          } else if (annotationObject[0].hasOwnProperty("$Eq")) {
            parsedAnnotationObject.collection.type = "Eq";
          } else if (annotationObject[0].hasOwnProperty("$Ne")) {
            parsedAnnotationObject.collection.type = "Ne";
          } else if (annotationObject[0].hasOwnProperty("$Not")) {
            parsedAnnotationObject.collection.type = "Not";
          } else if (annotationObject[0].hasOwnProperty("$Gt")) {
            parsedAnnotationObject.collection.type = "Gt";
          } else if (annotationObject[0].hasOwnProperty("$Ge")) {
            parsedAnnotationObject.collection.type = "Ge";
          } else if (annotationObject[0].hasOwnProperty("$Lt")) {
            parsedAnnotationObject.collection.type = "Lt";
          } else if (annotationObject[0].hasOwnProperty("$Le")) {
            parsedAnnotationObject.collection.type = "Le";
          } else if (annotationObject[0].hasOwnProperty("$And")) {
            parsedAnnotationObject.collection.type = "And";
          } else if (annotationObject[0].hasOwnProperty("$Apply")) {
            parsedAnnotationObject.collection.type = "Apply";
          } else if (typeof annotationObject[0] === "object") {
            parsedAnnotationObject.collection.type = "Record";
          } else {
            parsedAnnotationObject.collection.type = "String";
          }
        }
      } else {
        var record = {
          propertyValues: []
        };
        if (annotationObject.$Type) {
          var typeValue = annotationObject.$Type;
          record.type = "".concat(typeValue);
        }
        var propertyValues = [];
        for (var propertyKey in annotationObject) {
          if (propertyKey !== "$Type" && !propertyKey.startsWith("@")) {
            propertyValues.push(parsePropertyValue(annotationObject[propertyKey], propertyKey, currentAnnotationTarget, annotationLists, oCapabilities));
          } else if (propertyKey.startsWith("@")) {
            // Annotation of record
            createAnnotationLists(_defineProperty({}, propertyKey, annotationObject[propertyKey]), currentAnnotationTarget, annotationLists, oCapabilities);
          }
        }
        record.propertyValues = propertyValues;
        parsedAnnotationObject.record = record;
      }
      parsedAnnotationObject.isCollection = isCollection;
      currentOutAnnotationObject.annotations.push(parsedAnnotationObject);
      annotationKey = _annotationKey;
    };
    for (var annotationKey in annotationObjects) {
      _loop(annotationKey);
    }
  }
  function prepareProperty(propertyDefinition, entityTypeObject, propertyName) {
    var propertyObject = {
      _type: "Property",
      name: propertyName,
      fullyQualifiedName: "".concat(entityTypeObject.fullyQualifiedName, "/").concat(propertyName),
      type: propertyDefinition.$Type,
      maxLength: propertyDefinition.$MaxLength,
      precision: propertyDefinition.$Precision,
      scale: propertyDefinition.$Scale,
      nullable: propertyDefinition.$Nullable
    };
    return propertyObject;
  }
  function prepareNavigationProperty(navPropertyDefinition, entityTypeObject, navPropertyName) {
    var referentialConstraint = [];
    if (navPropertyDefinition.$ReferentialConstraint) {
      referentialConstraint = Object.keys(navPropertyDefinition.$ReferentialConstraint).map(function (sourcePropertyName) {
        return {
          sourceTypeName: entityTypeObject.name,
          sourceProperty: sourcePropertyName,
          targetTypeName: navPropertyDefinition.$Type,
          targetProperty: navPropertyDefinition.$ReferentialConstraint[sourcePropertyName]
        };
      });
    }
    var navigationProperty = {
      _type: "NavigationProperty",
      name: navPropertyName,
      fullyQualifiedName: "".concat(entityTypeObject.fullyQualifiedName, "/").concat(navPropertyName),
      partner: navPropertyDefinition.$Partner,
      isCollection: navPropertyDefinition.$isCollection ? navPropertyDefinition.$isCollection : false,
      containsTarget: navPropertyDefinition.$ContainsTarget,
      targetTypeName: navPropertyDefinition.$Type,
      referentialConstraint: referentialConstraint
    };
    return navigationProperty;
  }
  function prepareEntitySet(entitySetDefinition, entitySetName, entityContainerName) {
    var entitySetObject = {
      _type: "EntitySet",
      name: entitySetName,
      navigationPropertyBinding: {},
      entityTypeName: entitySetDefinition.$Type,
      fullyQualifiedName: "".concat(entityContainerName, "/").concat(entitySetName)
    };
    return entitySetObject;
  }
  function prepareSingleton(singletonDefinition, singletonName, entityContainerName) {
    return {
      _type: "Singleton",
      name: singletonName,
      navigationPropertyBinding: {},
      entityTypeName: singletonDefinition.$Type,
      fullyQualifiedName: "".concat(entityContainerName, "/").concat(singletonName),
      nullable: true
    };
  }
  function prepareTypeDefinition(typeDefinition, typeName, namespace) {
    var typeObject = {
      _type: "TypeDefinition",
      name: typeName.replace("".concat(namespace, "."), ""),
      fullyQualifiedName: typeName,
      underlyingType: typeDefinition.$UnderlyingType
    };
    return typeObject;
  }
  function prepareComplexType(complexTypeDefinition, complexTypeName, namespace) {
    var complexTypeObject = {
      _type: "ComplexType",
      name: complexTypeName.replace("".concat(namespace, "."), ""),
      fullyQualifiedName: complexTypeName,
      properties: [],
      navigationProperties: []
    };
    var complexTypeProperties = Object.keys(complexTypeDefinition).filter(function (propertyNameOrNot) {
      if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
        return complexTypeDefinition[propertyNameOrNot].$kind === "Property";
      }
    }).sort(function (a, b) {
      return a > b ? 1 : -1;
    }).map(function (propertyName) {
      return prepareProperty(complexTypeDefinition[propertyName], complexTypeObject, propertyName);
    });
    complexTypeObject.properties = complexTypeProperties;
    var complexTypeNavigationProperties = Object.keys(complexTypeDefinition).filter(function (propertyNameOrNot) {
      if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
        return complexTypeDefinition[propertyNameOrNot].$kind === "NavigationProperty";
      }
    }).sort(function (a, b) {
      return a > b ? 1 : -1;
    }).map(function (navPropertyName) {
      return prepareNavigationProperty(complexTypeDefinition[navPropertyName], complexTypeObject, navPropertyName);
    });
    complexTypeObject.navigationProperties = complexTypeNavigationProperties;
    return complexTypeObject;
  }
  function prepareEntityKeys(entityTypeDefinition, oMetaModelData) {
    if (!entityTypeDefinition.$Key && entityTypeDefinition.$BaseType) {
      return prepareEntityKeys(oMetaModelData["".concat(entityTypeDefinition.$BaseType)], oMetaModelData);
    }
    return entityTypeDefinition.$Key || []; //handling of entity types without key as well as basetype
  }

  function prepareEntityType(entityTypeDefinition, entityTypeName, namespace, metaModelData) {
    var entityKeys = prepareEntityKeys(entityTypeDefinition, metaModelData);
    var entityTypeObject = {
      _type: "EntityType",
      name: entityTypeName.replace("".concat(namespace, "."), ""),
      fullyQualifiedName: entityTypeName,
      keys: [],
      entityProperties: [],
      navigationProperties: [],
      actions: {}
    };
    var entityProperties = Object.keys(entityTypeDefinition).filter(function (propertyNameOrNot) {
      if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
        return entityTypeDefinition[propertyNameOrNot].$kind === "Property";
      }
    }).map(function (propertyName) {
      return prepareProperty(entityTypeDefinition[propertyName], entityTypeObject, propertyName);
    });
    var navigationProperties = Object.keys(entityTypeDefinition).filter(function (propertyNameOrNot) {
      if (propertyNameOrNot != "$Key" && propertyNameOrNot != "$kind") {
        return entityTypeDefinition[propertyNameOrNot].$kind === "NavigationProperty";
      }
    }).map(function (navPropertyName) {
      return prepareNavigationProperty(entityTypeDefinition[navPropertyName], entityTypeObject, navPropertyName);
    });
    entityTypeObject.keys = entityKeys.map(function (entityKey) {
      return entityProperties.find(function (property) {
        return property.name === entityKey;
      });
    }).filter(function (property) {
      return property !== undefined;
    });
    entityTypeObject.entityProperties = entityProperties;
    entityTypeObject.navigationProperties = navigationProperties;
    return entityTypeObject;
  }
  function prepareAction(actionName, actionRawData, namespace, entityContainerName) {
    var actionEntityType = "";
    var actionFQN = "".concat(actionName);
    var actionShortName = actionName.substr(namespace.length + 1);
    if (actionRawData.$IsBound) {
      var bindingParameter = actionRawData.$Parameter[0];
      actionEntityType = bindingParameter.$Type;
      if (bindingParameter.$isCollection === true) {
        actionFQN = "".concat(actionName, "(Collection(").concat(actionEntityType, "))");
      } else {
        actionFQN = "".concat(actionName, "(").concat(actionEntityType, ")");
      }
    } else {
      actionFQN = "".concat(entityContainerName, "/").concat(actionShortName);
    }
    var parameters = actionRawData.$Parameter || [];
    return {
      _type: "Action",
      name: actionShortName,
      fullyQualifiedName: actionFQN,
      isBound: actionRawData.$IsBound,
      isFunction: false,
      sourceType: actionEntityType,
      returnType: actionRawData.$ReturnType ? actionRawData.$ReturnType.$Type : "",
      parameters: parameters.map(function (param) {
        var _param$$isCollection;
        return {
          _type: "ActionParameter",
          fullyQualifiedName: "".concat(actionFQN, "/").concat(param.$Name),
          isCollection: (_param$$isCollection = param.$isCollection) !== null && _param$$isCollection !== void 0 ? _param$$isCollection : false,
          name: param.$Name,
          type: param.$Type
        };
      })
    };
  }
  function prepareEntityTypes(oMetaModel) {
    var oCapabilities = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DefaultEnvironmentCapabilities;
    var oMetaModelData = oMetaModel.getObject("/$");
    var annotationLists = {};
    var entityTypes = [];
    var entitySets = [];
    var singletons = [];
    var complexTypes = [];
    var typeDefinitions = [];
    var entityContainerName = oMetaModelData.$EntityContainer;
    var namespace = "";
    var schemaKeys = Object.keys(oMetaModelData).filter(function (metamodelKey) {
      return oMetaModelData[metamodelKey].$kind === "Schema";
    });
    if (schemaKeys && schemaKeys.length > 0) {
      namespace = schemaKeys[0].substr(0, schemaKeys[0].length - 1);
    } else if (entityTypes && entityTypes.length) {
      namespace = entityTypes[0].fullyQualifiedName.replace(entityTypes[0].name, "");
      namespace = namespace.substr(0, namespace.length - 1);
    }
    Object.keys(oMetaModelData).forEach(function (sObjectName) {
      if (sObjectName !== "$kind") {
        switch (oMetaModelData[sObjectName].$kind) {
          case "EntityType":
            var entityType = prepareEntityType(oMetaModelData[sObjectName], sObjectName, namespace, oMetaModelData);
            // Check if there are filter facets defined for the entityType and if yes, check if all of them have an ID
            // The ID is optional, but it is internally taken for grouping filter fields and if it's not present
            // a fallback ID needs to be generated here.
            if (oMetaModelData.$Annotations[entityType.fullyQualifiedName] && oMetaModelData.$Annotations[entityType.fullyQualifiedName]["@com.sap.vocabularies.UI.v1.FilterFacets"]) {
              oMetaModelData.$Annotations[entityType.fullyQualifiedName]["@com.sap.vocabularies.UI.v1.FilterFacets"].forEach(function (filterFacetAnnotation) {
                filterFacetAnnotation.ID = filterFacetAnnotation.ID || generate([{
                  Facet: filterFacetAnnotation
                }]);
              });
            }
            entityType.entityProperties.forEach(function (entityProperty) {
              if (!oMetaModelData.$Annotations[entityProperty.fullyQualifiedName]) {
                oMetaModelData.$Annotations[entityProperty.fullyQualifiedName] = {};
              }
              if (!oMetaModelData.$Annotations[entityProperty.fullyQualifiedName]["@com.sap.vocabularies.UI.v1.DataFieldDefault"]) {
                oMetaModelData.$Annotations[entityProperty.fullyQualifiedName]["@com.sap.vocabularies.UI.v1.DataFieldDefault"] = {
                  $Type: "com.sap.vocabularies.UI.v1.DataField",
                  Value: {
                    $Path: entityProperty.name
                  }
                };
              }
            });
            entityTypes.push(entityType);
            break;
          case "ComplexType":
            var complexType = prepareComplexType(oMetaModelData[sObjectName], sObjectName, namespace);
            complexTypes.push(complexType);
            break;
          case "TypeDefinition":
            var typeDefinition = prepareTypeDefinition(oMetaModelData[sObjectName], sObjectName, namespace);
            typeDefinitions.push(typeDefinition);
            break;
        }
      }
    });
    var oEntityContainer = oMetaModelData[entityContainerName];
    Object.keys(oEntityContainer).forEach(function (sObjectName) {
      if (sObjectName !== "$kind") {
        switch (oEntityContainer[sObjectName].$kind) {
          case "EntitySet":
            var entitySet = prepareEntitySet(oEntityContainer[sObjectName], sObjectName, entityContainerName);
            entitySets.push(entitySet);
            break;
          case "Singleton":
            var singleton = prepareSingleton(oEntityContainer[sObjectName], sObjectName, entityContainerName);
            singletons.push(singleton);
            break;
        }
      }
    });
    var entityContainer = {
      _type: "EntityContainer",
      name: "",
      fullyQualifiedName: ""
    };
    if (entityContainerName) {
      entityContainer = {
        _type: "EntityContainer",
        name: entityContainerName.replace("".concat(namespace, "."), ""),
        fullyQualifiedName: entityContainerName
      };
    }
    entitySets.forEach(function (entitySet) {
      var navPropertyBindings = oEntityContainer[entitySet.name].$NavigationPropertyBinding;
      if (navPropertyBindings) {
        Object.keys(navPropertyBindings).forEach(function (navPropName) {
          var targetEntitySet = entitySets.find(function (entitySetName) {
            return entitySetName.name === navPropertyBindings[navPropName];
          });
          if (targetEntitySet) {
            entitySet.navigationPropertyBinding[navPropName] = targetEntitySet;
          }
        });
      }
    });
    var actions = Object.keys(oMetaModelData).filter(function (key) {
      return Array.isArray(oMetaModelData[key]) && oMetaModelData[key].length > 0 && oMetaModelData[key][0].$kind === "Action";
    }).reduce(function (outActions, actionName) {
      var innerActions = oMetaModelData[actionName];
      innerActions.forEach(function (action) {
        outActions.push(prepareAction(actionName, action, namespace, entityContainerName));
      });
      return outActions;
    }, []);
    for (var target in oMetaModelData.$Annotations) {
      createAnnotationLists(oMetaModelData.$Annotations[target], target, annotationLists, oCapabilities);
    }

    // Sort by target length
    var outAnnotationLists = Object.keys(annotationLists).sort(function (a, b) {
      return a.length >= b.length ? 1 : -1;
    }).map(function (sAnnotationName) {
      return annotationLists[sAnnotationName];
    });
    var references = [];
    return {
      identification: "metamodelResult",
      version: "4.0",
      schema: {
        entityContainer: entityContainer,
        entitySets: entitySets,
        entityTypes: entityTypes,
        complexTypes: complexTypes,
        typeDefinitions: typeDefinitions,
        singletons: singletons,
        associations: [],
        associationSets: [],
        actions: actions,
        namespace: namespace,
        annotations: {
          "metamodelResult": outAnnotationLists
        }
      },
      references: references
    };
  }
  _exports.prepareEntityTypes = prepareEntityTypes;
  var mMetaModelMap = {};

  /**
   * Convert the ODataMetaModel into another format that allow for easy manipulation of the annotations.
   *
   * @param oMetaModel The ODataMetaModel
   * @param oCapabilities The current capabilities
   * @returns An object containing object-like annotations
   */
  function convertTypes(oMetaModel, oCapabilities) {
    var sMetaModelId = oMetaModel.id;
    if (!mMetaModelMap.hasOwnProperty(sMetaModelId)) {
      var parsedOutput = prepareEntityTypes(oMetaModel, oCapabilities);
      try {
        mMetaModelMap[sMetaModelId] = AnnotationConverter.convert(parsedOutput);
      } catch (oError) {
        throw new Error(oError);
      }
    }
    return mMetaModelMap[sMetaModelId];
  }
  _exports.convertTypes = convertTypes;
  function getConvertedTypes(oContext) {
    var oMetaModel = oContext.getModel();
    if (!oMetaModel.isA("sap.ui.model.odata.v4.ODataMetaModel")) {
      throw new Error("This should only be called on a ODataMetaModel");
    }
    return convertTypes(oMetaModel);
  }
  _exports.getConvertedTypes = getConvertedTypes;
  function deleteModelCacheData(oMetaModel) {
    delete mMetaModelMap[oMetaModel.id];
  }
  _exports.deleteModelCacheData = deleteModelCacheData;
  function convertMetaModelContext(oMetaModelContext) {
    var bIncludeVisitedObjects = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
    var oConvertedMetadata = convertTypes(oMetaModelContext.getModel());
    var sPath = oMetaModelContext.getPath();
    var aPathSplit = sPath.split("/");
    var firstPart = aPathSplit[1];
    var beginIndex = 2;
    if (oConvertedMetadata.entityContainer.fullyQualifiedName === firstPart) {
      firstPart = aPathSplit[2];
      beginIndex++;
    }
    var targetEntitySet = oConvertedMetadata.entitySets.find(function (entitySet) {
      return entitySet.name === firstPart;
    });
    if (!targetEntitySet) {
      targetEntitySet = oConvertedMetadata.singletons.find(function (singleton) {
        return singleton.name === firstPart;
      });
    }
    var relativePath = aPathSplit.slice(beginIndex).join("/");
    var localObjects = [targetEntitySet];
    while (relativePath && relativePath.length > 0 && relativePath.startsWith("$NavigationPropertyBinding")) {
      var _sNavPropToCheck;
      var relativeSplit = relativePath.split("/");
      var idx = 0;
      var currentEntitySet = void 0,
        sNavPropToCheck = void 0;
      relativeSplit = relativeSplit.slice(1); // Removing "$NavigationPropertyBinding"
      while (!currentEntitySet && relativeSplit.length > idx) {
        if (relativeSplit[idx] !== "$NavigationPropertyBinding") {
          // Finding the correct entitySet for the navigaiton property binding example: "Set/_SalesOrder"
          sNavPropToCheck = relativeSplit.slice(0, idx + 1).join("/").replace("/$NavigationPropertyBinding", "");
          currentEntitySet = targetEntitySet && targetEntitySet.navigationPropertyBinding[sNavPropToCheck];
        }
        idx++;
      }
      if (!currentEntitySet) {
        // Fall back to Single nav prop if entitySet is not found.
        sNavPropToCheck = relativeSplit[0];
      }
      var aNavProps = ((_sNavPropToCheck = sNavPropToCheck) === null || _sNavPropToCheck === void 0 ? void 0 : _sNavPropToCheck.split("/")) || [];
      var targetEntityType = targetEntitySet && targetEntitySet.entityType;
      var _iterator = _createForOfIteratorHelper(aNavProps),
        _step;
      try {
        var _loop2 = function () {
          var sNavProp = _step.value;
          // Pushing all nav props to the visited objects. example: "Set", "_SalesOrder" for "Set/_SalesOrder"(in NavigationPropertyBinding)
          var targetNavProp = targetEntityType && targetEntityType.navigationProperties.find(function (navProp) {
            return navProp.name === sNavProp;
          });
          if (targetNavProp) {
            localObjects.push(targetNavProp);
            targetEntityType = targetNavProp.targetType;
          } else {
            return "break";
          }
        };
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _ret = _loop2();
          if (_ret === "break") break;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      targetEntitySet = targetEntitySet && currentEntitySet || targetEntitySet && targetEntitySet.navigationPropertyBinding[relativeSplit[0]];
      if (targetEntitySet) {
        // Pushing the target entitySet to visited objects
        localObjects.push(targetEntitySet);
      }
      // Re-calculating the relative path
      // As each navigation name is enclosed between '$NavigationPropertyBinding' and '$' (to be able to access the entityset easily in the metamodel)
      // we need to remove the closing '$' to be able to switch to the next navigation
      relativeSplit = relativeSplit.slice(aNavProps.length || 1);
      if (relativeSplit.length && relativeSplit[0] === "$") {
        relativeSplit.shift();
      }
      relativePath = relativeSplit.join("/");
    }
    if (relativePath.startsWith("$Type")) {
      // As $Type@ is allowed as well
      if (relativePath.startsWith("$Type@")) {
        relativePath = relativePath.replace("$Type", "");
      } else {
        // We're anyway going to look on the entityType...
        relativePath = aPathSplit.slice(3).join("/");
      }
    }
    if (targetEntitySet && relativePath.length) {
      var oTarget = targetEntitySet.entityType.resolvePath(relativePath, bIncludeVisitedObjects);
      if (oTarget) {
        if (bIncludeVisitedObjects) {
          oTarget.visitedObjects = localObjects.concat(oTarget.visitedObjects);
        }
      } else if (targetEntitySet.entityType && targetEntitySet.entityType.actions) {
        // if target is an action or an action parameter
        var actions = targetEntitySet.entityType && targetEntitySet.entityType.actions;
        var _relativeSplit = relativePath.split("/");
        if (actions[_relativeSplit[0]]) {
          var action = actions[_relativeSplit[0]];
          if (_relativeSplit[1] && action.parameters) {
            var parameterName = _relativeSplit[1];
            return action.parameters.find(function (parameter) {
              return parameter.fullyQualifiedName.endsWith("/".concat(parameterName));
            });
          } else if (relativePath.length === 1) {
            return action;
          }
        }
      }
      return oTarget;
    } else {
      if (bIncludeVisitedObjects) {
        return {
          target: targetEntitySet,
          visitedObjects: localObjects
        };
      }
      return targetEntitySet;
    }
  }
  _exports.convertMetaModelContext = convertMetaModelContext;
  function getInvolvedDataModelObjects(oMetaModelContext, oEntitySetMetaModelContext) {
    var oConvertedMetadata = convertTypes(oMetaModelContext.getModel());
    var metaModelContext = convertMetaModelContext(oMetaModelContext, true);
    var targetEntitySetLocation;
    if (oEntitySetMetaModelContext && oEntitySetMetaModelContext.getPath() !== "/") {
      targetEntitySetLocation = getInvolvedDataModelObjects(oEntitySetMetaModelContext);
    }
    return getInvolvedDataModelObjectFromPath(metaModelContext, oConvertedMetadata, targetEntitySetLocation);
  }
  _exports.getInvolvedDataModelObjects = getInvolvedDataModelObjects;
  function getInvolvedDataModelObjectFromPath(metaModelContext, convertedTypes, targetEntitySetLocation, onlyServiceObjects) {
    var _outDataModelPath$tar;
    var dataModelObjects = metaModelContext.visitedObjects.filter(function (visitedObject) {
      return visitedObject && visitedObject.hasOwnProperty("_type") && visitedObject._type !== "EntityType" && visitedObject._type !== "EntityContainer";
    });
    if (metaModelContext.target && metaModelContext.target.hasOwnProperty("_type") && metaModelContext.target._type !== "EntityType" && dataModelObjects[dataModelObjects.length - 1] !== metaModelContext.target && !onlyServiceObjects) {
      dataModelObjects.push(metaModelContext.target);
    }
    var navigationProperties = [];
    var rootEntitySet = dataModelObjects[0];
    var currentEntitySet = rootEntitySet;
    var currentEntityType = rootEntitySet.entityType;
    var currentObject;
    var navigatedPath = [];
    for (var i = 1; i < dataModelObjects.length; i++) {
      currentObject = dataModelObjects[i];
      if (currentObject._type === "NavigationProperty") {
        var _currentEntitySet;
        navigatedPath.push(currentObject.name);
        navigationProperties.push(currentObject);
        currentEntityType = currentObject.targetType;
        var boundEntitySet = (_currentEntitySet = currentEntitySet) === null || _currentEntitySet === void 0 ? void 0 : _currentEntitySet.navigationPropertyBinding[navigatedPath.join("/")];
        if (boundEntitySet) {
          currentEntitySet = boundEntitySet;
          navigatedPath = [];
        }
      }
      if (currentObject._type === "EntitySet" || currentObject._type === "Singleton") {
        currentEntitySet = currentObject;
        currentEntityType = currentEntitySet.entityType;
      }
    }
    if (navigatedPath.length > 0) {
      // Path without NavigationPropertyBinding --> no target entity set
      currentEntitySet = undefined;
    }
    if (targetEntitySetLocation && targetEntitySetLocation.startingEntitySet !== rootEntitySet) {
      // In case the entityset is not starting from the same location it may mean that we are doing too much work earlier for some reason
      // As such we need to redefine the context source for the targetEntitySetLocation
      var startingIndex = dataModelObjects.indexOf(targetEntitySetLocation.startingEntitySet);
      if (startingIndex !== -1) {
        // If it's not found I don't know what we can do (probably nothing)
        var requiredDataModelObjects = dataModelObjects.slice(0, startingIndex);
        targetEntitySetLocation.startingEntitySet = rootEntitySet;
        targetEntitySetLocation.navigationProperties = requiredDataModelObjects.filter(function (object) {
          return object._type === "NavigationProperty";
        }).concat(targetEntitySetLocation.navigationProperties);
      }
    }
    var outDataModelPath = {
      startingEntitySet: rootEntitySet,
      targetEntitySet: currentEntitySet,
      targetEntityType: currentEntityType,
      targetObject: metaModelContext.target,
      navigationProperties: navigationProperties,
      contextLocation: targetEntitySetLocation,
      convertedTypes: convertedTypes
    };
    if (!((_outDataModelPath$tar = outDataModelPath.targetObject) !== null && _outDataModelPath$tar !== void 0 && _outDataModelPath$tar.hasOwnProperty("_type")) && onlyServiceObjects) {
      outDataModelPath.targetObject = currentObject;
    }
    if (!outDataModelPath.contextLocation) {
      outDataModelPath.contextLocation = outDataModelPath;
    }
    return outDataModelPath;
  }
  _exports.getInvolvedDataModelObjectFromPath = getInvolvedDataModelObjectFromPath;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWT0NBQlVMQVJZX0FMSUFTIiwiRGVmYXVsdEVudmlyb25tZW50Q2FwYWJpbGl0aWVzIiwiQ2hhcnQiLCJNaWNyb0NoYXJ0IiwiVVNoZWxsIiwiSW50ZW50QmFzZWROYXZpZ2F0aW9uIiwiQXBwU3RhdGUiLCJwYXJzZVByb3BlcnR5VmFsdWUiLCJhbm5vdGF0aW9uT2JqZWN0IiwicHJvcGVydHlLZXkiLCJjdXJyZW50VGFyZ2V0IiwiYW5ub3RhdGlvbnNMaXN0cyIsIm9DYXBhYmlsaXRpZXMiLCJ2YWx1ZSIsImN1cnJlbnRQcm9wZXJ0eVRhcmdldCIsInR5cGVPZkFubm90YXRpb24iLCJ0eXBlIiwiTnVsbCIsIlN0cmluZyIsIkJvb2wiLCJJbnQiLCJBcnJheSIsImlzQXJyYXkiLCJDb2xsZWN0aW9uIiwibWFwIiwic3ViQW5ub3RhdGlvbk9iamVjdCIsInN1YkFubm90YXRpb25PYmplY3RJbmRleCIsInBhcnNlQW5ub3RhdGlvbk9iamVjdCIsImxlbmd0aCIsImhhc093blByb3BlcnR5IiwiJFBhdGgiLCJ1bmRlZmluZWQiLCJQYXRoIiwiJERlY2ltYWwiLCJEZWNpbWFsIiwicGFyc2VGbG9hdCIsIiRQcm9wZXJ0eVBhdGgiLCJQcm9wZXJ0eVBhdGgiLCIkTmF2aWdhdGlvblByb3BlcnR5UGF0aCIsIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGgiLCIkSWYiLCJJZiIsIiRBbmQiLCJBbmQiLCIkT3IiLCJPciIsIiROb3QiLCJOb3QiLCIkRXEiLCJFcSIsIiROZSIsIk5lIiwiJEd0IiwiR3QiLCIkR2UiLCJHZSIsIiRMdCIsIkx0IiwiJExlIiwiTGUiLCIkQXBwbHkiLCJBcHBseSIsIkZ1bmN0aW9uIiwiJEZ1bmN0aW9uIiwiJEFubm90YXRpb25QYXRoIiwiQW5ub3RhdGlvblBhdGgiLCIkRW51bU1lbWJlciIsIkVudW1NZW1iZXIiLCJtYXBOYW1lVG9BbGlhcyIsInNwbGl0IiwiJFR5cGUiLCJSZWNvcmQiLCJuYW1lIiwiYW5ub3RhdGlvbk5hbWUiLCJwYXRoUGFydCIsImFubm9QYXJ0IiwibGFzdERvdCIsImxhc3RJbmRleE9mIiwic3Vic3RyIiwiY3VycmVudE9iamVjdFRhcmdldCIsInBhcnNlZEFubm90YXRpb25PYmplY3QiLCJ0eXBlT2ZPYmplY3QiLCJwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbiIsImNvbGxlY3Rpb24iLCJzdWJBbm5vdGF0aW9uSW5kZXgiLCJ0eXBlVmFsdWUiLCJwcm9wZXJ0eVZhbHVlcyIsIk9iamVjdCIsImtleXMiLCJmb3JFYWNoIiwic3RhcnRzV2l0aCIsInB1c2giLCJjcmVhdGVBbm5vdGF0aW9uTGlzdHMiLCJnZXRPckNyZWF0ZUFubm90YXRpb25MaXN0IiwidGFyZ2V0IiwiYW5ub3RhdGlvbnMiLCJyZW1vdmVDaGFydEFubm90YXRpb25zIiwiZmlsdGVyIiwib1JlY29yZCIsIlRhcmdldCIsImluZGV4T2YiLCJyZW1vdmVJQk5Bbm5vdGF0aW9ucyIsImhhbmRsZVByZXNlbnRhdGlvblZhcmlhbnQiLCJhbm5vdGF0aW9uT2JqZWN0cyIsImFubm90YXRpb25UYXJnZXQiLCJhbm5vdGF0aW9uTGlzdHMiLCJvdXRBbm5vdGF0aW9uT2JqZWN0IiwiYW5ub3RhdGlvbktleSIsIkRhdGEiLCJWaXN1YWxpemF0aW9ucyIsImN1cnJlbnRPdXRBbm5vdGF0aW9uT2JqZWN0IiwiYW5ub3RhdGlvbk9mQW5ub3RhdGlvblNwbGl0IiwiYW5ub3RhdGlvblF1YWxpZmllclNwbGl0IiwicXVhbGlmaWVyIiwidGVybSIsImN1cnJlbnRBbm5vdGF0aW9uVGFyZ2V0IiwiaXNDb2xsZWN0aW9uIiwidHlwZW9mQW5ub3RhdGlvbiIsInJlY29yZCIsInByZXBhcmVQcm9wZXJ0eSIsInByb3BlcnR5RGVmaW5pdGlvbiIsImVudGl0eVR5cGVPYmplY3QiLCJwcm9wZXJ0eU5hbWUiLCJwcm9wZXJ0eU9iamVjdCIsIl90eXBlIiwiZnVsbHlRdWFsaWZpZWROYW1lIiwibWF4TGVuZ3RoIiwiJE1heExlbmd0aCIsInByZWNpc2lvbiIsIiRQcmVjaXNpb24iLCJzY2FsZSIsIiRTY2FsZSIsIm51bGxhYmxlIiwiJE51bGxhYmxlIiwicHJlcGFyZU5hdmlnYXRpb25Qcm9wZXJ0eSIsIm5hdlByb3BlcnR5RGVmaW5pdGlvbiIsIm5hdlByb3BlcnR5TmFtZSIsInJlZmVyZW50aWFsQ29uc3RyYWludCIsIiRSZWZlcmVudGlhbENvbnN0cmFpbnQiLCJzb3VyY2VQcm9wZXJ0eU5hbWUiLCJzb3VyY2VUeXBlTmFtZSIsInNvdXJjZVByb3BlcnR5IiwidGFyZ2V0VHlwZU5hbWUiLCJ0YXJnZXRQcm9wZXJ0eSIsIm5hdmlnYXRpb25Qcm9wZXJ0eSIsInBhcnRuZXIiLCIkUGFydG5lciIsIiRpc0NvbGxlY3Rpb24iLCJjb250YWluc1RhcmdldCIsIiRDb250YWluc1RhcmdldCIsInByZXBhcmVFbnRpdHlTZXQiLCJlbnRpdHlTZXREZWZpbml0aW9uIiwiZW50aXR5U2V0TmFtZSIsImVudGl0eUNvbnRhaW5lck5hbWUiLCJlbnRpdHlTZXRPYmplY3QiLCJuYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nIiwiZW50aXR5VHlwZU5hbWUiLCJwcmVwYXJlU2luZ2xldG9uIiwic2luZ2xldG9uRGVmaW5pdGlvbiIsInNpbmdsZXRvbk5hbWUiLCJwcmVwYXJlVHlwZURlZmluaXRpb24iLCJ0eXBlRGVmaW5pdGlvbiIsInR5cGVOYW1lIiwibmFtZXNwYWNlIiwidHlwZU9iamVjdCIsInJlcGxhY2UiLCJ1bmRlcmx5aW5nVHlwZSIsIiRVbmRlcmx5aW5nVHlwZSIsInByZXBhcmVDb21wbGV4VHlwZSIsImNvbXBsZXhUeXBlRGVmaW5pdGlvbiIsImNvbXBsZXhUeXBlTmFtZSIsImNvbXBsZXhUeXBlT2JqZWN0IiwicHJvcGVydGllcyIsIm5hdmlnYXRpb25Qcm9wZXJ0aWVzIiwiY29tcGxleFR5cGVQcm9wZXJ0aWVzIiwicHJvcGVydHlOYW1lT3JOb3QiLCIka2luZCIsInNvcnQiLCJhIiwiYiIsImNvbXBsZXhUeXBlTmF2aWdhdGlvblByb3BlcnRpZXMiLCJwcmVwYXJlRW50aXR5S2V5cyIsImVudGl0eVR5cGVEZWZpbml0aW9uIiwib01ldGFNb2RlbERhdGEiLCIkS2V5IiwiJEJhc2VUeXBlIiwicHJlcGFyZUVudGl0eVR5cGUiLCJtZXRhTW9kZWxEYXRhIiwiZW50aXR5S2V5cyIsImVudGl0eVByb3BlcnRpZXMiLCJhY3Rpb25zIiwiZW50aXR5S2V5IiwiZmluZCIsInByb3BlcnR5IiwicHJlcGFyZUFjdGlvbiIsImFjdGlvbk5hbWUiLCJhY3Rpb25SYXdEYXRhIiwiYWN0aW9uRW50aXR5VHlwZSIsImFjdGlvbkZRTiIsImFjdGlvblNob3J0TmFtZSIsIiRJc0JvdW5kIiwiYmluZGluZ1BhcmFtZXRlciIsIiRQYXJhbWV0ZXIiLCJwYXJhbWV0ZXJzIiwiaXNCb3VuZCIsImlzRnVuY3Rpb24iLCJzb3VyY2VUeXBlIiwicmV0dXJuVHlwZSIsIiRSZXR1cm5UeXBlIiwicGFyYW0iLCIkTmFtZSIsInByZXBhcmVFbnRpdHlUeXBlcyIsIm9NZXRhTW9kZWwiLCJnZXRPYmplY3QiLCJlbnRpdHlUeXBlcyIsImVudGl0eVNldHMiLCJzaW5nbGV0b25zIiwiY29tcGxleFR5cGVzIiwidHlwZURlZmluaXRpb25zIiwiJEVudGl0eUNvbnRhaW5lciIsInNjaGVtYUtleXMiLCJtZXRhbW9kZWxLZXkiLCJzT2JqZWN0TmFtZSIsImVudGl0eVR5cGUiLCIkQW5ub3RhdGlvbnMiLCJmaWx0ZXJGYWNldEFubm90YXRpb24iLCJJRCIsImdlbmVyYXRlIiwiRmFjZXQiLCJlbnRpdHlQcm9wZXJ0eSIsIlZhbHVlIiwiY29tcGxleFR5cGUiLCJvRW50aXR5Q29udGFpbmVyIiwiZW50aXR5U2V0Iiwic2luZ2xldG9uIiwiZW50aXR5Q29udGFpbmVyIiwibmF2UHJvcGVydHlCaW5kaW5ncyIsIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nIiwibmF2UHJvcE5hbWUiLCJ0YXJnZXRFbnRpdHlTZXQiLCJrZXkiLCJyZWR1Y2UiLCJvdXRBY3Rpb25zIiwiaW5uZXJBY3Rpb25zIiwiYWN0aW9uIiwib3V0QW5ub3RhdGlvbkxpc3RzIiwic0Fubm90YXRpb25OYW1lIiwicmVmZXJlbmNlcyIsImlkZW50aWZpY2F0aW9uIiwidmVyc2lvbiIsInNjaGVtYSIsImFzc29jaWF0aW9ucyIsImFzc29jaWF0aW9uU2V0cyIsIm1NZXRhTW9kZWxNYXAiLCJjb252ZXJ0VHlwZXMiLCJzTWV0YU1vZGVsSWQiLCJpZCIsInBhcnNlZE91dHB1dCIsIkFubm90YXRpb25Db252ZXJ0ZXIiLCJjb252ZXJ0Iiwib0Vycm9yIiwiRXJyb3IiLCJnZXRDb252ZXJ0ZWRUeXBlcyIsIm9Db250ZXh0IiwiZ2V0TW9kZWwiLCJpc0EiLCJkZWxldGVNb2RlbENhY2hlRGF0YSIsImNvbnZlcnRNZXRhTW9kZWxDb250ZXh0Iiwib01ldGFNb2RlbENvbnRleHQiLCJiSW5jbHVkZVZpc2l0ZWRPYmplY3RzIiwib0NvbnZlcnRlZE1ldGFkYXRhIiwic1BhdGgiLCJnZXRQYXRoIiwiYVBhdGhTcGxpdCIsImZpcnN0UGFydCIsImJlZ2luSW5kZXgiLCJyZWxhdGl2ZVBhdGgiLCJzbGljZSIsImpvaW4iLCJsb2NhbE9iamVjdHMiLCJyZWxhdGl2ZVNwbGl0IiwiaWR4IiwiY3VycmVudEVudGl0eVNldCIsInNOYXZQcm9wVG9DaGVjayIsImFOYXZQcm9wcyIsInRhcmdldEVudGl0eVR5cGUiLCJzTmF2UHJvcCIsInRhcmdldE5hdlByb3AiLCJuYXZQcm9wIiwidGFyZ2V0VHlwZSIsInNoaWZ0Iiwib1RhcmdldCIsInJlc29sdmVQYXRoIiwidmlzaXRlZE9iamVjdHMiLCJjb25jYXQiLCJwYXJhbWV0ZXJOYW1lIiwicGFyYW1ldGVyIiwiZW5kc1dpdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJvRW50aXR5U2V0TWV0YU1vZGVsQ29udGV4dCIsIm1ldGFNb2RlbENvbnRleHQiLCJ0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbiIsImdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0RnJvbVBhdGgiLCJjb252ZXJ0ZWRUeXBlcyIsIm9ubHlTZXJ2aWNlT2JqZWN0cyIsImRhdGFNb2RlbE9iamVjdHMiLCJ2aXNpdGVkT2JqZWN0Iiwicm9vdEVudGl0eVNldCIsImN1cnJlbnRFbnRpdHlUeXBlIiwiY3VycmVudE9iamVjdCIsIm5hdmlnYXRlZFBhdGgiLCJpIiwiYm91bmRFbnRpdHlTZXQiLCJzdGFydGluZ0VudGl0eVNldCIsInN0YXJ0aW5nSW5kZXgiLCJyZXF1aXJlZERhdGFNb2RlbE9iamVjdHMiLCJvYmplY3QiLCJvdXREYXRhTW9kZWxQYXRoIiwidGFyZ2V0T2JqZWN0IiwiY29udGV4dExvY2F0aW9uIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJNZXRhTW9kZWxDb252ZXJ0ZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gVGhpcyBmaWxlIGlzIHJldHJpZXZlZCBmcm9tIEBzYXAtdXgvYW5ub3RhdGlvbi1jb252ZXJ0ZXIsIHNoYXJlZCBjb2RlIHdpdGggdG9vbCBzdWl0ZVxuXG5pbXBvcnQgdHlwZSB7XG5cdEFubm90YXRpb24sXG5cdEFubm90YXRpb25MaXN0LFxuXHRBbm5vdGF0aW9uUmVjb3JkLFxuXHRDb252ZXJ0ZWRNZXRhZGF0YSxcblx0RW50aXR5U2V0LFxuXHRFbnRpdHlUeXBlLFxuXHRFeHByZXNzaW9uLFxuXHROYXZpZ2F0aW9uUHJvcGVydHksXG5cdFByb3BlcnR5LFxuXHRSYXdBY3Rpb24sXG5cdFJhd0NvbXBsZXhUeXBlLFxuXHRSYXdFbnRpdHlDb250YWluZXIsXG5cdFJhd0VudGl0eVNldCxcblx0UmF3RW50aXR5VHlwZSxcblx0UmF3TWV0YWRhdGEsXG5cdFJhd1Byb3BlcnR5LFxuXHRSYXdTaW5nbGV0b24sXG5cdFJhd1R5cGVEZWZpbml0aW9uLFxuXHRSYXdWNE5hdmlnYXRpb25Qcm9wZXJ0eSxcblx0UmVmZXJlbmNlLFxuXHRSZWZlcmVudGlhbENvbnN0cmFpbnQsXG5cdFNlcnZpY2VPYmplY3QsXG5cdFNpbmdsZXRvblxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXNcIjtcbmltcG9ydCB7IEFubm90YXRpb25Db252ZXJ0ZXIgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb21tb25cIjtcbmltcG9ydCB0eXBlIHsgRGF0YU1vZGVsT2JqZWN0UGF0aCB9IGZyb20gXCJzYXAvZmUvY29yZS90ZW1wbGF0aW5nL0RhdGFNb2RlbFBhdGhIZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCIuLi9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5cbmNvbnN0IFZPQ0FCVUxBUllfQUxJQVM6IGFueSA9IHtcblx0XCJPcmcuT0RhdGEuQ2FwYWJpbGl0aWVzLlYxXCI6IFwiQ2FwYWJpbGl0aWVzXCIsXG5cdFwiT3JnLk9EYXRhLkNvcmUuVjFcIjogXCJDb3JlXCIsXG5cdFwiT3JnLk9EYXRhLk1lYXN1cmVzLlYxXCI6IFwiTWVhc3VyZXNcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjFcIjogXCJDb21tb25cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MVwiOiBcIlVJXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuU2Vzc2lvbi52MVwiOiBcIlNlc3Npb25cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjFcIjogXCJBbmFseXRpY3NcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5QZXJzb25hbERhdGEudjFcIjogXCJQZXJzb25hbERhdGFcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tdW5pY2F0aW9uLnYxXCI6IFwiQ29tbXVuaWNhdGlvblwiXG59O1xuXG5leHBvcnQgdHlwZSBFbnZpcm9ubWVudENhcGFiaWxpdGllcyA9IHtcblx0Q2hhcnQ6IGJvb2xlYW47XG5cdE1pY3JvQ2hhcnQ6IGJvb2xlYW47XG5cdFVTaGVsbDogYm9vbGVhbjtcblx0SW50ZW50QmFzZWROYXZpZ2F0aW9uOiBib29sZWFuO1xuXHRBcHBTdGF0ZTogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCBjb25zdCBEZWZhdWx0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXMgPSB7XG5cdENoYXJ0OiB0cnVlLFxuXHRNaWNyb0NoYXJ0OiB0cnVlLFxuXHRVU2hlbGw6IHRydWUsXG5cdEludGVudEJhc2VkTmF2aWdhdGlvbjogdHJ1ZSxcblx0QXBwU3RhdGU6IHRydWVcbn07XG5cbnR5cGUgTWV0YU1vZGVsQWN0aW9uID0ge1xuXHQka2luZDogXCJBY3Rpb25cIjtcblx0JElzQm91bmQ6IGJvb2xlYW47XG5cdCRFbnRpdHlTZXRQYXRoOiBzdHJpbmc7XG5cdCRQYXJhbWV0ZXI6IHtcblx0XHQkVHlwZTogc3RyaW5nO1xuXHRcdCROYW1lOiBzdHJpbmc7XG5cdFx0JE51bGxhYmxlPzogYm9vbGVhbjtcblx0XHQkTWF4TGVuZ3RoPzogbnVtYmVyO1xuXHRcdCRQcmVjaXNpb24/OiBudW1iZXI7XG5cdFx0JFNjYWxlPzogbnVtYmVyO1xuXHRcdCRpc0NvbGxlY3Rpb24/OiBib29sZWFuO1xuXHR9W107XG5cdCRSZXR1cm5UeXBlOiB7XG5cdFx0JFR5cGU6IHN0cmluZztcblx0fTtcbn07XG5cbmZ1bmN0aW9uIHBhcnNlUHJvcGVydHlWYWx1ZShcblx0YW5ub3RhdGlvbk9iamVjdDogYW55LFxuXHRwcm9wZXJ0eUtleTogc3RyaW5nLFxuXHRjdXJyZW50VGFyZ2V0OiBzdHJpbmcsXG5cdGFubm90YXRpb25zTGlzdHM6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25MaXN0Pixcblx0b0NhcGFiaWxpdGllczogRW52aXJvbm1lbnRDYXBhYmlsaXRpZXNcbik6IGFueSB7XG5cdGxldCB2YWx1ZTtcblx0Y29uc3QgY3VycmVudFByb3BlcnR5VGFyZ2V0OiBzdHJpbmcgPSBgJHtjdXJyZW50VGFyZ2V0fS8ke3Byb3BlcnR5S2V5fWA7XG5cdGNvbnN0IHR5cGVPZkFubm90YXRpb24gPSB0eXBlb2YgYW5ub3RhdGlvbk9iamVjdDtcblx0aWYgKGFubm90YXRpb25PYmplY3QgPT09IG51bGwpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJOdWxsXCIsIE51bGw6IG51bGwgfTtcblx0fSBlbHNlIGlmICh0eXBlT2ZBbm5vdGF0aW9uID09PSBcInN0cmluZ1wiKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiU3RyaW5nXCIsIFN0cmluZzogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHR9IGVsc2UgaWYgKHR5cGVPZkFubm90YXRpb24gPT09IFwiYm9vbGVhblwiKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiQm9vbFwiLCBCb29sOiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdH0gZWxzZSBpZiAodHlwZU9mQW5ub3RhdGlvbiA9PT0gXCJudW1iZXJcIikge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkludFwiLCBJbnQ6IGFubm90YXRpb25PYmplY3QgfTtcblx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFubm90YXRpb25PYmplY3QpKSB7XG5cdFx0dmFsdWUgPSB7XG5cdFx0XHR0eXBlOiBcIkNvbGxlY3Rpb25cIixcblx0XHRcdENvbGxlY3Rpb246IGFubm90YXRpb25PYmplY3QubWFwKChzdWJBbm5vdGF0aW9uT2JqZWN0LCBzdWJBbm5vdGF0aW9uT2JqZWN0SW5kZXgpID0+XG5cdFx0XHRcdHBhcnNlQW5ub3RhdGlvbk9iamVjdChcblx0XHRcdFx0XHRzdWJBbm5vdGF0aW9uT2JqZWN0LFxuXHRcdFx0XHRcdGAke2N1cnJlbnRQcm9wZXJ0eVRhcmdldH0vJHtzdWJBbm5vdGF0aW9uT2JqZWN0SW5kZXh9YCxcblx0XHRcdFx0XHRhbm5vdGF0aW9uc0xpc3RzLFxuXHRcdFx0XHRcdG9DYXBhYmlsaXRpZXNcblx0XHRcdFx0KVxuXHRcdFx0KVxuXHRcdH07XG5cdFx0aWYgKGFubm90YXRpb25PYmplY3QubGVuZ3RoID4gMCkge1xuXHRcdFx0aWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkUHJvcGVydHlQYXRoXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiUHJvcGVydHlQYXRoXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkUGF0aFwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlBhdGhcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiTmF2aWdhdGlvblByb3BlcnR5UGF0aFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEFubm90YXRpb25QYXRoXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiQW5ub3RhdGlvblBhdGhcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRUeXBlXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiUmVjb3JkXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkSWZcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJJZlwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE9yXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiT3JcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRBbmRcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJBbmRcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRFcVwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkVxXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTmVcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJOZVwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE5vdFwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIk5vdFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEd0XCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiR3RcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRHZVwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkdlXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTHRcIikpIHtcblx0XHRcdFx0KHZhbHVlLkNvbGxlY3Rpb24gYXMgYW55KS50eXBlID0gXCJMdFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJExlXCIpKSB7XG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiTGVcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRBcHBseVwiKSkge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIkFwcGx5XCI7XG5cdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBhbm5vdGF0aW9uT2JqZWN0WzBdID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdC8vICRUeXBlIGlzIG9wdGlvbmFsLi4uXG5cdFx0XHRcdCh2YWx1ZS5Db2xsZWN0aW9uIGFzIGFueSkudHlwZSA9IFwiUmVjb3JkXCI7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHQodmFsdWUuQ29sbGVjdGlvbiBhcyBhbnkpLnR5cGUgPSBcIlN0cmluZ1wiO1xuXHRcdFx0fVxuXHRcdH1cblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRQYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJQYXRoXCIsIFBhdGg6IGFubm90YXRpb25PYmplY3QuJFBhdGggfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiREZWNpbWFsICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJEZWNpbWFsXCIsIERlY2ltYWw6IHBhcnNlRmxvYXQoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCkgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRQcm9wZXJ0eVBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIlByb3BlcnR5UGF0aFwiLCBQcm9wZXJ0eVBhdGg6IGFubm90YXRpb25PYmplY3QuJFByb3BlcnR5UGF0aCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0ge1xuXHRcdFx0dHlwZTogXCJOYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCIsXG5cdFx0XHROYXZpZ2F0aW9uUHJvcGVydHlQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoXG5cdFx0fTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRJZiAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiSWZcIiwgSWY6IGFubm90YXRpb25PYmplY3QuJElmIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kQW5kICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJBbmRcIiwgQW5kOiBhbm5vdGF0aW9uT2JqZWN0LiRBbmQgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRPciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiT3JcIiwgT3I6IGFubm90YXRpb25PYmplY3QuJE9yIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTm90ICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJOb3RcIiwgTm90OiBhbm5vdGF0aW9uT2JqZWN0LiROb3QgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRFcSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiRXFcIiwgRXE6IGFubm90YXRpb25PYmplY3QuJEVxIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTmUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIk5lXCIsIE5lOiBhbm5vdGF0aW9uT2JqZWN0LiROZSB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEd0ICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJHdFwiLCBHdDogYW5ub3RhdGlvbk9iamVjdC4kR3QgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRHZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiR2VcIiwgR2U6IGFubm90YXRpb25PYmplY3QuJEdlIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTHQgIT09IHVuZGVmaW5lZCkge1xuXHRcdHZhbHVlID0geyB0eXBlOiBcIkx0XCIsIEx0OiBhbm5vdGF0aW9uT2JqZWN0LiRMdCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJExlICE9PSB1bmRlZmluZWQpIHtcblx0XHR2YWx1ZSA9IHsgdHlwZTogXCJMZVwiLCBMZTogYW5ub3RhdGlvbk9iamVjdC4kTGUgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBcHBseSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiQXBwbHlcIiwgQXBwbHk6IGFubm90YXRpb25PYmplY3QuJEFwcGx5LCBGdW5jdGlvbjogYW5ub3RhdGlvbk9iamVjdC4kRnVuY3Rpb24gfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7IHR5cGU6IFwiQW5ub3RhdGlvblBhdGhcIiwgQW5ub3RhdGlvblBhdGg6IGFubm90YXRpb25PYmplY3QuJEFubm90YXRpb25QYXRoIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRW51bU1lbWJlciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0dmFsdWUgPSB7XG5cdFx0XHR0eXBlOiBcIkVudW1NZW1iZXJcIixcblx0XHRcdEVudW1NZW1iZXI6IGAke21hcE5hbWVUb0FsaWFzKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIuc3BsaXQoXCIvXCIpWzBdKX0vJHthbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyLnNwbGl0KFwiL1wiKVsxXX1gXG5cdFx0fTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRUeXBlKSB7XG5cdFx0dmFsdWUgPSB7XG5cdFx0XHR0eXBlOiBcIlJlY29yZFwiLFxuXHRcdFx0UmVjb3JkOiBwYXJzZUFubm90YXRpb25PYmplY3QoYW5ub3RhdGlvbk9iamVjdCwgY3VycmVudFRhcmdldCwgYW5ub3RhdGlvbnNMaXN0cywgb0NhcGFiaWxpdGllcylcblx0XHR9O1xuXHR9IGVsc2Uge1xuXHRcdHZhbHVlID0ge1xuXHRcdFx0dHlwZTogXCJSZWNvcmRcIixcblx0XHRcdFJlY29yZDogcGFyc2VBbm5vdGF0aW9uT2JqZWN0KGFubm90YXRpb25PYmplY3QsIGN1cnJlbnRUYXJnZXQsIGFubm90YXRpb25zTGlzdHMsIG9DYXBhYmlsaXRpZXMpXG5cdFx0fTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0bmFtZTogcHJvcGVydHlLZXksXG5cdFx0dmFsdWVcblx0fTtcbn1cbmZ1bmN0aW9uIG1hcE5hbWVUb0FsaWFzKGFubm90YXRpb25OYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuXHRsZXQgW3BhdGhQYXJ0LCBhbm5vUGFydF0gPSBhbm5vdGF0aW9uTmFtZS5zcGxpdChcIkBcIik7XG5cdGlmICghYW5ub1BhcnQpIHtcblx0XHRhbm5vUGFydCA9IHBhdGhQYXJ0O1xuXHRcdHBhdGhQYXJ0ID0gXCJcIjtcblx0fSBlbHNlIHtcblx0XHRwYXRoUGFydCArPSBcIkBcIjtcblx0fVxuXHRjb25zdCBsYXN0RG90ID0gYW5ub1BhcnQubGFzdEluZGV4T2YoXCIuXCIpO1xuXHRyZXR1cm4gYCR7cGF0aFBhcnQgKyBWT0NBQlVMQVJZX0FMSUFTW2Fubm9QYXJ0LnN1YnN0cigwLCBsYXN0RG90KV19LiR7YW5ub1BhcnQuc3Vic3RyKGxhc3REb3QgKyAxKX1gO1xufVxuZnVuY3Rpb24gcGFyc2VBbm5vdGF0aW9uT2JqZWN0KFxuXHRhbm5vdGF0aW9uT2JqZWN0OiBhbnksXG5cdGN1cnJlbnRPYmplY3RUYXJnZXQ6IHN0cmluZyxcblx0YW5ub3RhdGlvbnNMaXN0czogUmVjb3JkPHN0cmluZywgQW5ub3RhdGlvbkxpc3Q+LFxuXHRvQ2FwYWJpbGl0aWVzOiBFbnZpcm9ubWVudENhcGFiaWxpdGllc1xuKTogRXhwcmVzc2lvbiB8IEFubm90YXRpb25SZWNvcmQgfCBBbm5vdGF0aW9uIHtcblx0bGV0IHBhcnNlZEFubm90YXRpb25PYmplY3Q6IGFueSA9IHt9O1xuXHRjb25zdCB0eXBlT2ZPYmplY3QgPSB0eXBlb2YgYW5ub3RhdGlvbk9iamVjdDtcblx0aWYgKGFubm90YXRpb25PYmplY3QgPT09IG51bGwpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIk51bGxcIiwgTnVsbDogbnVsbCB9O1xuXHR9IGVsc2UgaWYgKHR5cGVPZk9iamVjdCA9PT0gXCJzdHJpbmdcIikge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiU3RyaW5nXCIsIFN0cmluZzogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHR9IGVsc2UgaWYgKHR5cGVPZk9iamVjdCA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkJvb2xcIiwgQm9vbDogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHR9IGVsc2UgaWYgKHR5cGVPZk9iamVjdCA9PT0gXCJudW1iZXJcIikge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiSW50XCIsIEludDogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEFubm90YXRpb25QYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkFubm90YXRpb25QYXRoXCIsIEFubm90YXRpb25QYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRBbm5vdGF0aW9uUGF0aCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJFBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiUGF0aFwiLCBQYXRoOiBhbm5vdGF0aW9uT2JqZWN0LiRQYXRoIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJEZWNpbWFsXCIsIERlY2ltYWw6IHBhcnNlRmxvYXQoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCkgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRQcm9wZXJ0eVBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiUHJvcGVydHlQYXRoXCIsIFByb3BlcnR5UGF0aDogYW5ub3RhdGlvbk9iamVjdC4kUHJvcGVydHlQYXRoIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kSWYgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7IHR5cGU6IFwiSWZcIiwgSWY6IGFubm90YXRpb25PYmplY3QuJElmIH07XG5cdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kQW5kICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIkFuZFwiLCBBbmQ6IGFubm90YXRpb25PYmplY3QuJEFuZCB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE9yICE9PSB1bmRlZmluZWQpIHtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0ID0geyB0eXBlOiBcIk9yXCIsIE9yOiBhbm5vdGF0aW9uT2JqZWN0LiRPciB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE5vdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJOb3RcIiwgTm90OiBhbm5vdGF0aW9uT2JqZWN0LiROb3QgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRFcSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJFcVwiLCBFcTogYW5ub3RhdGlvbk9iamVjdC4kRXEgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiROZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJOZVwiLCBOZTogYW5ub3RhdGlvbk9iamVjdC4kTmUgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRHdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJHdFwiLCBHdDogYW5ub3RhdGlvbk9iamVjdC4kR3QgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRHZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJHZVwiLCBHZTogYW5ub3RhdGlvbk9iamVjdC4kR2UgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRMdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJMdFwiLCBMdDogYW5ub3RhdGlvbk9iamVjdC4kTHQgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRMZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJMZVwiLCBMZTogYW5ub3RhdGlvbk9iamVjdC4kTGUgfTtcblx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBcHBseSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdCA9IHsgdHlwZTogXCJBcHBseVwiLCBBcHBseTogYW5ub3RhdGlvbk9iamVjdC4kQXBwbHksIEZ1bmN0aW9uOiBhbm5vdGF0aW9uT2JqZWN0LiRGdW5jdGlvbiB9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7XG5cdFx0XHR0eXBlOiBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIixcblx0XHRcdE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGg6IGFubm90YXRpb25PYmplY3QuJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcblx0XHR9O1xuXHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIgIT09IHVuZGVmaW5lZCkge1xuXHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QgPSB7XG5cdFx0XHR0eXBlOiBcIkVudW1NZW1iZXJcIixcblx0XHRcdEVudW1NZW1iZXI6IGAke21hcE5hbWVUb0FsaWFzKGFubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIuc3BsaXQoXCIvXCIpWzBdKX0vJHthbm5vdGF0aW9uT2JqZWN0LiRFbnVtTWVtYmVyLnNwbGl0KFwiL1wiKVsxXX1gXG5cdFx0fTtcblx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFubm90YXRpb25PYmplY3QpKSB7XG5cdFx0Y29uc3QgcGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24gPSBwYXJzZWRBbm5vdGF0aW9uT2JqZWN0O1xuXHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24gPSBhbm5vdGF0aW9uT2JqZWN0Lm1hcCgoc3ViQW5ub3RhdGlvbk9iamVjdCwgc3ViQW5ub3RhdGlvbkluZGV4KSA9PlxuXHRcdFx0cGFyc2VBbm5vdGF0aW9uT2JqZWN0KHN1YkFubm90YXRpb25PYmplY3QsIGAke2N1cnJlbnRPYmplY3RUYXJnZXR9LyR7c3ViQW5ub3RhdGlvbkluZGV4fWAsIGFubm90YXRpb25zTGlzdHMsIG9DYXBhYmlsaXRpZXMpXG5cdFx0KTtcblx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdC5sZW5ndGggPiAwKSB7XG5cdFx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRQcm9wZXJ0eVBhdGhcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJQcm9wZXJ0eVBhdGhcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRQYXRoXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiUGF0aFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJOYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQW5ub3RhdGlvblBhdGhcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJBbm5vdGF0aW9uUGF0aFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJFR5cGVcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRJZlwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIklmXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkQW5kXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiQW5kXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkT3JcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJPclwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEVxXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiRXFcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiROZVwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIk5lXCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTm90XCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiTm90XCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkR3RcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJHdFwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEdlXCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiR2VcIjtcblx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRMdFwiKSkge1xuXHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uQ29sbGVjdGlvbi5jb2xsZWN0aW9uLnR5cGUgPSBcIkx0XCI7XG5cdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTGVcIikpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJMZVwiO1xuXHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEFwcGx5XCIpKSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiQXBwbHlcIjtcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGFubm90YXRpb25PYmplY3RbMF0gPT09IFwib2JqZWN0XCIpIHtcblx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbkNvbGxlY3Rpb24uY29sbGVjdGlvbi50eXBlID0gXCJSZWNvcmRcIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBhcnNlZEFubm90YXRpb25Db2xsZWN0aW9uLmNvbGxlY3Rpb24udHlwZSA9IFwiU3RyaW5nXCI7XG5cdFx0XHR9XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0LiRUeXBlKSB7XG5cdFx0XHRjb25zdCB0eXBlVmFsdWUgPSBhbm5vdGF0aW9uT2JqZWN0LiRUeXBlO1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC50eXBlID0gdHlwZVZhbHVlOyAvL2Ake3R5cGVBbGlhc30uJHt0eXBlVGVybX1gO1xuXHRcdH1cblx0XHRjb25zdCBwcm9wZXJ0eVZhbHVlczogYW55ID0gW107XG5cdFx0T2JqZWN0LmtleXMoYW5ub3RhdGlvbk9iamVjdCkuZm9yRWFjaCgocHJvcGVydHlLZXkpID0+IHtcblx0XHRcdGlmIChcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJFR5cGVcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkSWZcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkQXBwbHlcIiAmJlxuXHRcdFx0XHRwcm9wZXJ0eUtleSAhPT0gXCIkQW5kXCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJE9yXCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJE5lXCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJEd0XCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJEdlXCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJEx0XCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJExlXCIgJiZcblx0XHRcdFx0cHJvcGVydHlLZXkgIT09IFwiJE5vdFwiICYmXG5cdFx0XHRcdHByb3BlcnR5S2V5ICE9PSBcIiRFcVwiICYmXG5cdFx0XHRcdCFwcm9wZXJ0eUtleS5zdGFydHNXaXRoKFwiQFwiKVxuXHRcdFx0KSB7XG5cdFx0XHRcdHByb3BlcnR5VmFsdWVzLnB1c2goXG5cdFx0XHRcdFx0cGFyc2VQcm9wZXJ0eVZhbHVlKGFubm90YXRpb25PYmplY3RbcHJvcGVydHlLZXldLCBwcm9wZXJ0eUtleSwgY3VycmVudE9iamVjdFRhcmdldCwgYW5ub3RhdGlvbnNMaXN0cywgb0NhcGFiaWxpdGllcylcblx0XHRcdFx0KTtcblx0XHRcdH0gZWxzZSBpZiAocHJvcGVydHlLZXkuc3RhcnRzV2l0aChcIkBcIikpIHtcblx0XHRcdFx0Ly8gQW5ub3RhdGlvbiBvZiBhbm5vdGF0aW9uXG5cdFx0XHRcdGNyZWF0ZUFubm90YXRpb25MaXN0cyhcblx0XHRcdFx0XHR7IFtwcm9wZXJ0eUtleV06IGFubm90YXRpb25PYmplY3RbcHJvcGVydHlLZXldIH0sXG5cdFx0XHRcdFx0Y3VycmVudE9iamVjdFRhcmdldCxcblx0XHRcdFx0XHRhbm5vdGF0aW9uc0xpc3RzLFxuXHRcdFx0XHRcdG9DYXBhYmlsaXRpZXNcblx0XHRcdFx0KTtcblx0XHRcdH1cblx0XHR9KTtcblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnByb3BlcnR5VmFsdWVzID0gcHJvcGVydHlWYWx1ZXM7XG5cdH1cblx0cmV0dXJuIHBhcnNlZEFubm90YXRpb25PYmplY3Q7XG59XG5mdW5jdGlvbiBnZXRPckNyZWF0ZUFubm90YXRpb25MaXN0KHRhcmdldDogc3RyaW5nLCBhbm5vdGF0aW9uc0xpc3RzOiBSZWNvcmQ8c3RyaW5nLCBBbm5vdGF0aW9uTGlzdD4pOiBBbm5vdGF0aW9uTGlzdCB7XG5cdGlmICghYW5ub3RhdGlvbnNMaXN0cy5oYXNPd25Qcm9wZXJ0eSh0YXJnZXQpKSB7XG5cdFx0YW5ub3RhdGlvbnNMaXN0c1t0YXJnZXRdID0ge1xuXHRcdFx0dGFyZ2V0OiB0YXJnZXQsXG5cdFx0XHRhbm5vdGF0aW9uczogW11cblx0XHR9O1xuXHR9XG5cdHJldHVybiBhbm5vdGF0aW9uc0xpc3RzW3RhcmdldF07XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNoYXJ0QW5ub3RhdGlvbnMoYW5ub3RhdGlvbk9iamVjdDogYW55KSB7XG5cdHJldHVybiBhbm5vdGF0aW9uT2JqZWN0LmZpbHRlcigob1JlY29yZDogYW55KSA9PiB7XG5cdFx0aWYgKG9SZWNvcmQuVGFyZ2V0ICYmIG9SZWNvcmQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aCkge1xuXHRcdFx0cmV0dXJuIG9SZWNvcmQuVGFyZ2V0LiRBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0XCIpID09PSAtMTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0fVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gcmVtb3ZlSUJOQW5ub3RhdGlvbnMoYW5ub3RhdGlvbk9iamVjdDogYW55KSB7XG5cdHJldHVybiBhbm5vdGF0aW9uT2JqZWN0LmZpbHRlcigob1JlY29yZDogYW55KSA9PiB7XG5cdFx0cmV0dXJuIG9SZWNvcmQuJFR5cGUgIT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCI7XG5cdH0pO1xufVxuXG5mdW5jdGlvbiBoYW5kbGVQcmVzZW50YXRpb25WYXJpYW50KGFubm90YXRpb25PYmplY3Q6IGFueSkge1xuXHRyZXR1cm4gYW5ub3RhdGlvbk9iamVjdC5maWx0ZXIoKG9SZWNvcmQ6IGFueSkgPT4ge1xuXHRcdHJldHVybiBvUmVjb3JkLiRBbm5vdGF0aW9uUGF0aCAhPT0gXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRcIjtcblx0fSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUFubm90YXRpb25MaXN0cyhcblx0YW5ub3RhdGlvbk9iamVjdHM6IGFueSxcblx0YW5ub3RhdGlvblRhcmdldDogc3RyaW5nLFxuXHRhbm5vdGF0aW9uTGlzdHM6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25MaXN0Pixcblx0b0NhcGFiaWxpdGllczogRW52aXJvbm1lbnRDYXBhYmlsaXRpZXNcbikge1xuXHRpZiAoT2JqZWN0LmtleXMoYW5ub3RhdGlvbk9iamVjdHMpLmxlbmd0aCA9PT0gMCkge1xuXHRcdHJldHVybjtcblx0fVxuXHRjb25zdCBvdXRBbm5vdGF0aW9uT2JqZWN0ID0gZ2V0T3JDcmVhdGVBbm5vdGF0aW9uTGlzdChhbm5vdGF0aW9uVGFyZ2V0LCBhbm5vdGF0aW9uTGlzdHMpO1xuXHRpZiAoIW9DYXBhYmlsaXRpZXMuTWljcm9DaGFydCkge1xuXHRcdGRlbGV0ZSBhbm5vdGF0aW9uT2JqZWN0c1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFwiXTtcblx0fVxuXG5cdGZvciAobGV0IGFubm90YXRpb25LZXkgaW4gYW5ub3RhdGlvbk9iamVjdHMpIHtcblx0XHRsZXQgYW5ub3RhdGlvbk9iamVjdCA9IGFubm90YXRpb25PYmplY3RzW2Fubm90YXRpb25LZXldO1xuXHRcdHN3aXRjaCAoYW5ub3RhdGlvbktleSkge1xuXHRcdFx0Y2FzZSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IZWFkZXJGYWNldHNcIjpcblx0XHRcdFx0aWYgKCFvQ2FwYWJpbGl0aWVzLk1pY3JvQ2hhcnQpIHtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0ID0gcmVtb3ZlQ2hhcnRBbm5vdGF0aW9ucyhhbm5vdGF0aW9uT2JqZWN0KTtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1thbm5vdGF0aW9uS2V5XSA9IGFubm90YXRpb25PYmplY3Q7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLklkZW50aWZpY2F0aW9uXCI6XG5cdFx0XHRcdGlmICghb0NhcGFiaWxpdGllcy5JbnRlbnRCYXNlZE5hdmlnYXRpb24pIHtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0ID0gcmVtb3ZlSUJOQW5ub3RhdGlvbnMoYW5ub3RhdGlvbk9iamVjdCk7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdHNbYW5ub3RhdGlvbktleV0gPSBhbm5vdGF0aW9uT2JqZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5MaW5lSXRlbVwiOlxuXHRcdFx0XHRpZiAoIW9DYXBhYmlsaXRpZXMuSW50ZW50QmFzZWROYXZpZ2F0aW9uKSB7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdCA9IHJlbW92ZUlCTkFubm90YXRpb25zKGFubm90YXRpb25PYmplY3QpO1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3RzW2Fubm90YXRpb25LZXldID0gYW5ub3RhdGlvbk9iamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoIW9DYXBhYmlsaXRpZXMuTWljcm9DaGFydCkge1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3QgPSByZW1vdmVDaGFydEFubm90YXRpb25zKGFubm90YXRpb25PYmplY3QpO1xuXHRcdFx0XHRcdGFubm90YXRpb25PYmplY3RzW2Fubm90YXRpb25LZXldID0gYW5ub3RhdGlvbk9iamVjdDtcblx0XHRcdFx0fVxuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmllbGRHcm91cFwiOlxuXHRcdFx0XHRpZiAoIW9DYXBhYmlsaXRpZXMuSW50ZW50QmFzZWROYXZpZ2F0aW9uKSB7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdC5EYXRhID0gcmVtb3ZlSUJOQW5ub3RhdGlvbnMoYW5ub3RhdGlvbk9iamVjdC5EYXRhKTtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0c1thbm5vdGF0aW9uS2V5XSA9IGFubm90YXRpb25PYmplY3Q7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKCFvQ2FwYWJpbGl0aWVzLk1pY3JvQ2hhcnQpIHtcblx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0LkRhdGEgPSByZW1vdmVDaGFydEFubm90YXRpb25zKGFubm90YXRpb25PYmplY3QuRGF0YSk7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdHNbYW5ub3RhdGlvbktleV0gPSBhbm5vdGF0aW9uT2JqZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5QcmVzZW50YXRpb25WYXJpYW50XCI6XG5cdFx0XHRcdGlmICghb0NhcGFiaWxpdGllcy5DaGFydCAmJiBhbm5vdGF0aW9uT2JqZWN0LlZpc3VhbGl6YXRpb25zKSB7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdC5WaXN1YWxpemF0aW9ucyA9IGhhbmRsZVByZXNlbnRhdGlvblZhcmlhbnQoYW5ub3RhdGlvbk9iamVjdC5WaXN1YWxpemF0aW9ucyk7XG5cdFx0XHRcdFx0YW5ub3RhdGlvbk9iamVjdHNbYW5ub3RhdGlvbktleV0gPSBhbm5vdGF0aW9uT2JqZWN0O1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0YnJlYWs7XG5cdFx0fVxuXG5cdFx0bGV0IGN1cnJlbnRPdXRBbm5vdGF0aW9uT2JqZWN0ID0gb3V0QW5ub3RhdGlvbk9iamVjdDtcblxuXHRcdC8vIENoZWNrIGZvciBhbm5vdGF0aW9uIG9mIGFubm90YXRpb25cblx0XHRjb25zdCBhbm5vdGF0aW9uT2ZBbm5vdGF0aW9uU3BsaXQgPSBhbm5vdGF0aW9uS2V5LnNwbGl0KFwiQFwiKTtcblx0XHRpZiAoYW5ub3RhdGlvbk9mQW5ub3RhdGlvblNwbGl0Lmxlbmd0aCA+IDIpIHtcblx0XHRcdGN1cnJlbnRPdXRBbm5vdGF0aW9uT2JqZWN0ID0gZ2V0T3JDcmVhdGVBbm5vdGF0aW9uTGlzdChcblx0XHRcdFx0YCR7YW5ub3RhdGlvblRhcmdldH1AJHthbm5vdGF0aW9uT2ZBbm5vdGF0aW9uU3BsaXRbMV19YCxcblx0XHRcdFx0YW5ub3RhdGlvbkxpc3RzXG5cdFx0XHQpO1xuXHRcdFx0YW5ub3RhdGlvbktleSA9IGFubm90YXRpb25PZkFubm90YXRpb25TcGxpdFsyXTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0YW5ub3RhdGlvbktleSA9IGFubm90YXRpb25PZkFubm90YXRpb25TcGxpdFsxXTtcblx0XHR9XG5cblx0XHRjb25zdCBhbm5vdGF0aW9uUXVhbGlmaWVyU3BsaXQgPSBhbm5vdGF0aW9uS2V5LnNwbGl0KFwiI1wiKTtcblx0XHRjb25zdCBxdWFsaWZpZXIgPSBhbm5vdGF0aW9uUXVhbGlmaWVyU3BsaXRbMV07XG5cdFx0YW5ub3RhdGlvbktleSA9IGFubm90YXRpb25RdWFsaWZpZXJTcGxpdFswXTtcblxuXHRcdGNvbnN0IHBhcnNlZEFubm90YXRpb25PYmplY3Q6IGFueSA9IHtcblx0XHRcdHRlcm06IGAke2Fubm90YXRpb25LZXl9YCxcblx0XHRcdHF1YWxpZmllcjogcXVhbGlmaWVyXG5cdFx0fTtcblx0XHRsZXQgY3VycmVudEFubm90YXRpb25UYXJnZXQgPSBgJHthbm5vdGF0aW9uVGFyZ2V0fUAke3BhcnNlZEFubm90YXRpb25PYmplY3QudGVybX1gO1xuXHRcdGlmIChxdWFsaWZpZXIpIHtcblx0XHRcdGN1cnJlbnRBbm5vdGF0aW9uVGFyZ2V0ICs9IGAjJHtxdWFsaWZpZXJ9YDtcblx0XHR9XG5cdFx0bGV0IGlzQ29sbGVjdGlvbiA9IGZhbHNlO1xuXHRcdGNvbnN0IHR5cGVvZkFubm90YXRpb24gPSB0eXBlb2YgYW5ub3RhdGlvbk9iamVjdDtcblx0XHRpZiAoYW5ub3RhdGlvbk9iamVjdCA9PT0gbnVsbCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJCb29sXCIsIEJvb2w6IGFubm90YXRpb25PYmplY3QgfTtcblx0XHR9IGVsc2UgaWYgKHR5cGVvZkFubm90YXRpb24gPT09IFwic3RyaW5nXCIpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiU3RyaW5nXCIsIFN0cmluZzogYW5ub3RhdGlvbk9iamVjdCB9O1xuXHRcdH0gZWxzZSBpZiAodHlwZW9mQW5ub3RhdGlvbiA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiQm9vbFwiLCBCb29sOiBhbm5vdGF0aW9uT2JqZWN0IH07XG5cdFx0fSBlbHNlIGlmICh0eXBlb2ZBbm5vdGF0aW9uID09PSBcIm51bWJlclwiKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkludFwiLCBJbnQ6IGFubm90YXRpb25PYmplY3QgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJElmICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiSWZcIiwgSWY6IGFubm90YXRpb25PYmplY3QuJElmIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRBbmQgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJBbmRcIiwgQW5kOiBhbm5vdGF0aW9uT2JqZWN0LiRBbmQgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJE9yICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiT3JcIiwgT3I6IGFubm90YXRpb25PYmplY3QuJE9yIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiROb3QgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJOb3RcIiwgTm90OiBhbm5vdGF0aW9uT2JqZWN0LiROb3QgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEVxICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiRXFcIiwgRXE6IGFubm90YXRpb25PYmplY3QuJEVxIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiROZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIk5lXCIsIE5lOiBhbm5vdGF0aW9uT2JqZWN0LiROZSB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kR3QgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJHdFwiLCBHdDogYW5ub3RhdGlvbk9iamVjdC4kR3QgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEdlICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiR2VcIiwgR2U6IGFubm90YXRpb25PYmplY3QuJEdlIH07XG5cdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0LiRMdCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkx0XCIsIEx0OiBhbm5vdGF0aW9uT2JqZWN0LiRMdCB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kTGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJMZVwiLCBMZTogYW5ub3RhdGlvbk9iamVjdC4kTGUgfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEFwcGx5ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7IHR5cGU6IFwiQXBwbHlcIiwgQXBwbHk6IGFubm90YXRpb25PYmplY3QuJEFwcGx5LCBGdW5jdGlvbjogYW5ub3RhdGlvbk9iamVjdC4kRnVuY3Rpb24gfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJFBhdGggIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC52YWx1ZSA9IHsgdHlwZTogXCJQYXRoXCIsIFBhdGg6IGFubm90YXRpb25PYmplY3QuJFBhdGggfTtcblx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3QuJEFubm90YXRpb25QYXRoICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QudmFsdWUgPSB7XG5cdFx0XHRcdHR5cGU6IFwiQW5ub3RhdGlvblBhdGhcIixcblx0XHRcdFx0QW5ub3RhdGlvblBhdGg6IGFubm90YXRpb25PYmplY3QuJEFubm90YXRpb25QYXRoXG5cdFx0XHR9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRGVjaW1hbCAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0geyB0eXBlOiBcIkRlY2ltYWxcIiwgRGVjaW1hbDogcGFyc2VGbG9hdChhbm5vdGF0aW9uT2JqZWN0LiREZWNpbWFsKSB9O1xuXHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdC4kRW51bU1lbWJlciAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LnZhbHVlID0ge1xuXHRcdFx0XHR0eXBlOiBcIkVudW1NZW1iZXJcIixcblx0XHRcdFx0RW51bU1lbWJlcjogYCR7bWFwTmFtZVRvQWxpYXMoYW5ub3RhdGlvbk9iamVjdC4kRW51bU1lbWJlci5zcGxpdChcIi9cIilbMF0pfS8ke2Fubm90YXRpb25PYmplY3QuJEVudW1NZW1iZXIuc3BsaXQoXCIvXCIpWzFdfWBcblx0XHRcdH07XG5cdFx0fSBlbHNlIGlmIChBcnJheS5pc0FycmF5KGFubm90YXRpb25PYmplY3QpKSB7XG5cdFx0XHRpc0NvbGxlY3Rpb24gPSB0cnVlO1xuXHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uID0gYW5ub3RhdGlvbk9iamVjdC5tYXAoKHN1YkFubm90YXRpb25PYmplY3QsIHN1YkFubm90YXRpb25JbmRleCkgPT5cblx0XHRcdFx0cGFyc2VBbm5vdGF0aW9uT2JqZWN0KFxuXHRcdFx0XHRcdHN1YkFubm90YXRpb25PYmplY3QsXG5cdFx0XHRcdFx0YCR7Y3VycmVudEFubm90YXRpb25UYXJnZXR9LyR7c3ViQW5ub3RhdGlvbkluZGV4fWAsXG5cdFx0XHRcdFx0YW5ub3RhdGlvbkxpc3RzLFxuXHRcdFx0XHRcdG9DYXBhYmlsaXRpZXNcblx0XHRcdFx0KVxuXHRcdFx0KTtcblx0XHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0Lmxlbmd0aCA+IDApIHtcblx0XHRcdFx0aWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkUHJvcGVydHlQYXRoXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIlByb3BlcnR5UGF0aFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkUGF0aFwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJQYXRoXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiROYXZpZ2F0aW9uUHJvcGVydHlQYXRoXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVBhdGhcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEFubm90YXRpb25QYXRoXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIkFubm90YXRpb25QYXRoXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRUeXBlXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIlJlY29yZFwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkSWZcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiSWZcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE9yXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIk9yXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRFcVwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJFcVwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTmVcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiTmVcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJE5vdFwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJOb3RcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJEd0XCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIkd0XCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRHZVwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJHZVwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKGFubm90YXRpb25PYmplY3RbMF0uaGFzT3duUHJvcGVydHkoXCIkTHRcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiTHRcIjtcblx0XHRcdFx0fSBlbHNlIGlmIChhbm5vdGF0aW9uT2JqZWN0WzBdLmhhc093blByb3BlcnR5KFwiJExlXCIpKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIkxlXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRBbmRcIikpIHtcblx0XHRcdFx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmNvbGxlY3Rpb24udHlwZSA9IFwiQW5kXCI7XG5cdFx0XHRcdH0gZWxzZSBpZiAoYW5ub3RhdGlvbk9iamVjdFswXS5oYXNPd25Qcm9wZXJ0eShcIiRBcHBseVwiKSkge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJBcHBseVwiO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHR5cGVvZiBhbm5vdGF0aW9uT2JqZWN0WzBdID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdFx0cGFyc2VkQW5ub3RhdGlvbk9iamVjdC5jb2xsZWN0aW9uLnR5cGUgPSBcIlJlY29yZFwiO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QuY29sbGVjdGlvbi50eXBlID0gXCJTdHJpbmdcIjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHRjb25zdCByZWNvcmQ6IEFubm90YXRpb25SZWNvcmQgPSB7XG5cdFx0XHRcdHByb3BlcnR5VmFsdWVzOiBbXVxuXHRcdFx0fTtcblx0XHRcdGlmIChhbm5vdGF0aW9uT2JqZWN0LiRUeXBlKSB7XG5cdFx0XHRcdGNvbnN0IHR5cGVWYWx1ZSA9IGFubm90YXRpb25PYmplY3QuJFR5cGU7XG5cdFx0XHRcdHJlY29yZC50eXBlID0gYCR7dHlwZVZhbHVlfWA7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBwcm9wZXJ0eVZhbHVlczogYW55W10gPSBbXTtcblx0XHRcdGZvciAoY29uc3QgcHJvcGVydHlLZXkgaW4gYW5ub3RhdGlvbk9iamVjdCkge1xuXHRcdFx0XHRpZiAocHJvcGVydHlLZXkgIT09IFwiJFR5cGVcIiAmJiAhcHJvcGVydHlLZXkuc3RhcnRzV2l0aChcIkBcIikpIHtcblx0XHRcdFx0XHRwcm9wZXJ0eVZhbHVlcy5wdXNoKFxuXHRcdFx0XHRcdFx0cGFyc2VQcm9wZXJ0eVZhbHVlKFxuXHRcdFx0XHRcdFx0XHRhbm5vdGF0aW9uT2JqZWN0W3Byb3BlcnR5S2V5XSxcblx0XHRcdFx0XHRcdFx0cHJvcGVydHlLZXksXG5cdFx0XHRcdFx0XHRcdGN1cnJlbnRBbm5vdGF0aW9uVGFyZ2V0LFxuXHRcdFx0XHRcdFx0XHRhbm5vdGF0aW9uTGlzdHMsXG5cdFx0XHRcdFx0XHRcdG9DYXBhYmlsaXRpZXNcblx0XHRcdFx0XHRcdClcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHByb3BlcnR5S2V5LnN0YXJ0c1dpdGgoXCJAXCIpKSB7XG5cdFx0XHRcdFx0Ly8gQW5ub3RhdGlvbiBvZiByZWNvcmRcblx0XHRcdFx0XHRjcmVhdGVBbm5vdGF0aW9uTGlzdHMoXG5cdFx0XHRcdFx0XHR7IFtwcm9wZXJ0eUtleV06IGFubm90YXRpb25PYmplY3RbcHJvcGVydHlLZXldIH0sXG5cdFx0XHRcdFx0XHRjdXJyZW50QW5ub3RhdGlvblRhcmdldCxcblx0XHRcdFx0XHRcdGFubm90YXRpb25MaXN0cyxcblx0XHRcdFx0XHRcdG9DYXBhYmlsaXRpZXNcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRyZWNvcmQucHJvcGVydHlWYWx1ZXMgPSBwcm9wZXJ0eVZhbHVlcztcblx0XHRcdHBhcnNlZEFubm90YXRpb25PYmplY3QucmVjb3JkID0gcmVjb3JkO1xuXHRcdH1cblx0XHRwYXJzZWRBbm5vdGF0aW9uT2JqZWN0LmlzQ29sbGVjdGlvbiA9IGlzQ29sbGVjdGlvbjtcblx0XHRjdXJyZW50T3V0QW5ub3RhdGlvbk9iamVjdC5hbm5vdGF0aW9ucy5wdXNoKHBhcnNlZEFubm90YXRpb25PYmplY3QpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVQcm9wZXJ0eShwcm9wZXJ0eURlZmluaXRpb246IGFueSwgZW50aXR5VHlwZU9iamVjdDogUmF3RW50aXR5VHlwZSB8IFJhd0NvbXBsZXhUeXBlLCBwcm9wZXJ0eU5hbWU6IHN0cmluZyk6IFJhd1Byb3BlcnR5IHtcblx0Y29uc3QgcHJvcGVydHlPYmplY3Q6IFJhd1Byb3BlcnR5ID0ge1xuXHRcdF90eXBlOiBcIlByb3BlcnR5XCIsXG5cdFx0bmFtZTogcHJvcGVydHlOYW1lLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5VHlwZU9iamVjdC5mdWxseVF1YWxpZmllZE5hbWV9LyR7cHJvcGVydHlOYW1lfWAsXG5cdFx0dHlwZTogcHJvcGVydHlEZWZpbml0aW9uLiRUeXBlLFxuXHRcdG1heExlbmd0aDogcHJvcGVydHlEZWZpbml0aW9uLiRNYXhMZW5ndGgsXG5cdFx0cHJlY2lzaW9uOiBwcm9wZXJ0eURlZmluaXRpb24uJFByZWNpc2lvbixcblx0XHRzY2FsZTogcHJvcGVydHlEZWZpbml0aW9uLiRTY2FsZSxcblx0XHRudWxsYWJsZTogcHJvcGVydHlEZWZpbml0aW9uLiROdWxsYWJsZVxuXHR9O1xuXHRyZXR1cm4gcHJvcGVydHlPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVOYXZpZ2F0aW9uUHJvcGVydHkoXG5cdG5hdlByb3BlcnR5RGVmaW5pdGlvbjogYW55LFxuXHRlbnRpdHlUeXBlT2JqZWN0OiBSYXdFbnRpdHlUeXBlIHwgUmF3Q29tcGxleFR5cGUsXG5cdG5hdlByb3BlcnR5TmFtZTogc3RyaW5nXG4pOiBSYXdWNE5hdmlnYXRpb25Qcm9wZXJ0eSB7XG5cdGxldCByZWZlcmVudGlhbENvbnN0cmFpbnQ6IFJlZmVyZW50aWFsQ29uc3RyYWludFtdID0gW107XG5cdGlmIChuYXZQcm9wZXJ0eURlZmluaXRpb24uJFJlZmVyZW50aWFsQ29uc3RyYWludCkge1xuXHRcdHJlZmVyZW50aWFsQ29uc3RyYWludCA9IE9iamVjdC5rZXlzKG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kUmVmZXJlbnRpYWxDb25zdHJhaW50KS5tYXAoKHNvdXJjZVByb3BlcnR5TmFtZSkgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0c291cmNlVHlwZU5hbWU6IGVudGl0eVR5cGVPYmplY3QubmFtZSxcblx0XHRcdFx0c291cmNlUHJvcGVydHk6IHNvdXJjZVByb3BlcnR5TmFtZSxcblx0XHRcdFx0dGFyZ2V0VHlwZU5hbWU6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kVHlwZSxcblx0XHRcdFx0dGFyZ2V0UHJvcGVydHk6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kUmVmZXJlbnRpYWxDb25zdHJhaW50W3NvdXJjZVByb3BlcnR5TmFtZV1cblx0XHRcdH07XG5cdFx0fSk7XG5cdH1cblx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnR5OiBSYXdWNE5hdmlnYXRpb25Qcm9wZXJ0eSA9IHtcblx0XHRfdHlwZTogXCJOYXZpZ2F0aW9uUHJvcGVydHlcIixcblx0XHRuYW1lOiBuYXZQcm9wZXJ0eU5hbWUsXG5cdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBgJHtlbnRpdHlUeXBlT2JqZWN0LmZ1bGx5UXVhbGlmaWVkTmFtZX0vJHtuYXZQcm9wZXJ0eU5hbWV9YCxcblx0XHRwYXJ0bmVyOiBuYXZQcm9wZXJ0eURlZmluaXRpb24uJFBhcnRuZXIsXG5cdFx0aXNDb2xsZWN0aW9uOiBuYXZQcm9wZXJ0eURlZmluaXRpb24uJGlzQ29sbGVjdGlvbiA/IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kaXNDb2xsZWN0aW9uIDogZmFsc2UsXG5cdFx0Y29udGFpbnNUYXJnZXQ6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kQ29udGFpbnNUYXJnZXQsXG5cdFx0dGFyZ2V0VHlwZU5hbWU6IG5hdlByb3BlcnR5RGVmaW5pdGlvbi4kVHlwZSxcblx0XHRyZWZlcmVudGlhbENvbnN0cmFpbnRcblx0fTtcblxuXHRyZXR1cm4gbmF2aWdhdGlvblByb3BlcnR5O1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlRW50aXR5U2V0KGVudGl0eVNldERlZmluaXRpb246IGFueSwgZW50aXR5U2V0TmFtZTogc3RyaW5nLCBlbnRpdHlDb250YWluZXJOYW1lOiBzdHJpbmcpOiBSYXdFbnRpdHlTZXQge1xuXHRjb25zdCBlbnRpdHlTZXRPYmplY3Q6IFJhd0VudGl0eVNldCA9IHtcblx0XHRfdHlwZTogXCJFbnRpdHlTZXRcIixcblx0XHRuYW1lOiBlbnRpdHlTZXROYW1lLFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmc6IHt9LFxuXHRcdGVudGl0eVR5cGVOYW1lOiBlbnRpdHlTZXREZWZpbml0aW9uLiRUeXBlLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5Q29udGFpbmVyTmFtZX0vJHtlbnRpdHlTZXROYW1lfWBcblx0fTtcblx0cmV0dXJuIGVudGl0eVNldE9iamVjdDtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZVNpbmdsZXRvbihzaW5nbGV0b25EZWZpbml0aW9uOiBhbnksIHNpbmdsZXRvbk5hbWU6IHN0cmluZywgZW50aXR5Q29udGFpbmVyTmFtZTogc3RyaW5nKTogUmF3U2luZ2xldG9uIHtcblx0cmV0dXJuIHtcblx0XHRfdHlwZTogXCJTaW5nbGV0b25cIixcblx0XHRuYW1lOiBzaW5nbGV0b25OYW1lLFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmc6IHt9LFxuXHRcdGVudGl0eVR5cGVOYW1lOiBzaW5nbGV0b25EZWZpbml0aW9uLiRUeXBlLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7ZW50aXR5Q29udGFpbmVyTmFtZX0vJHtzaW5nbGV0b25OYW1lfWAsXG5cdFx0bnVsbGFibGU6IHRydWVcblx0fTtcbn1cblxuZnVuY3Rpb24gcHJlcGFyZVR5cGVEZWZpbml0aW9uKHR5cGVEZWZpbml0aW9uOiBhbnksIHR5cGVOYW1lOiBzdHJpbmcsIG5hbWVzcGFjZTogc3RyaW5nKTogUmF3VHlwZURlZmluaXRpb24ge1xuXHRjb25zdCB0eXBlT2JqZWN0OiBSYXdUeXBlRGVmaW5pdGlvbiA9IHtcblx0XHRfdHlwZTogXCJUeXBlRGVmaW5pdGlvblwiLFxuXHRcdG5hbWU6IHR5cGVOYW1lLnJlcGxhY2UoYCR7bmFtZXNwYWNlfS5gLCBcIlwiKSxcblx0XHRmdWxseVF1YWxpZmllZE5hbWU6IHR5cGVOYW1lLFxuXHRcdHVuZGVybHlpbmdUeXBlOiB0eXBlRGVmaW5pdGlvbi4kVW5kZXJseWluZ1R5cGVcblx0fTtcblx0cmV0dXJuIHR5cGVPYmplY3Q7XG59XG5cbmZ1bmN0aW9uIHByZXBhcmVDb21wbGV4VHlwZShjb21wbGV4VHlwZURlZmluaXRpb246IGFueSwgY29tcGxleFR5cGVOYW1lOiBzdHJpbmcsIG5hbWVzcGFjZTogc3RyaW5nKTogUmF3Q29tcGxleFR5cGUge1xuXHRjb25zdCBjb21wbGV4VHlwZU9iamVjdDogUmF3Q29tcGxleFR5cGUgPSB7XG5cdFx0X3R5cGU6IFwiQ29tcGxleFR5cGVcIixcblx0XHRuYW1lOiBjb21wbGV4VHlwZU5hbWUucmVwbGFjZShgJHtuYW1lc3BhY2V9LmAsIFwiXCIpLFxuXHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogY29tcGxleFR5cGVOYW1lLFxuXHRcdHByb3BlcnRpZXM6IFtdLFxuXHRcdG5hdmlnYXRpb25Qcm9wZXJ0aWVzOiBbXVxuXHR9O1xuXG5cdGNvbnN0IGNvbXBsZXhUeXBlUHJvcGVydGllcyA9IE9iamVjdC5rZXlzKGNvbXBsZXhUeXBlRGVmaW5pdGlvbilcblx0XHQuZmlsdGVyKChwcm9wZXJ0eU5hbWVPck5vdCkgPT4ge1xuXHRcdFx0aWYgKHByb3BlcnR5TmFtZU9yTm90ICE9IFwiJEtleVwiICYmIHByb3BlcnR5TmFtZU9yTm90ICE9IFwiJGtpbmRcIikge1xuXHRcdFx0XHRyZXR1cm4gY29tcGxleFR5cGVEZWZpbml0aW9uW3Byb3BlcnR5TmFtZU9yTm90XS4ka2luZCA9PT0gXCJQcm9wZXJ0eVwiO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LnNvcnQoKGEsIGIpID0+IChhID4gYiA/IDEgOiAtMSkpXG5cdFx0Lm1hcCgocHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRyZXR1cm4gcHJlcGFyZVByb3BlcnR5KGNvbXBsZXhUeXBlRGVmaW5pdGlvbltwcm9wZXJ0eU5hbWVdLCBjb21wbGV4VHlwZU9iamVjdCwgcHJvcGVydHlOYW1lKTtcblx0XHR9KTtcblxuXHRjb21wbGV4VHlwZU9iamVjdC5wcm9wZXJ0aWVzID0gY29tcGxleFR5cGVQcm9wZXJ0aWVzO1xuXHRjb25zdCBjb21wbGV4VHlwZU5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMoY29tcGxleFR5cGVEZWZpbml0aW9uKVxuXHRcdC5maWx0ZXIoKHByb3BlcnR5TmFtZU9yTm90KSA9PiB7XG5cdFx0XHRpZiAocHJvcGVydHlOYW1lT3JOb3QgIT0gXCIkS2V5XCIgJiYgcHJvcGVydHlOYW1lT3JOb3QgIT0gXCIka2luZFwiKSB7XG5cdFx0XHRcdHJldHVybiBjb21wbGV4VHlwZURlZmluaXRpb25bcHJvcGVydHlOYW1lT3JOb3RdLiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0LnNvcnQoKGEsIGIpID0+IChhID4gYiA/IDEgOiAtMSkpXG5cdFx0Lm1hcCgobmF2UHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRyZXR1cm4gcHJlcGFyZU5hdmlnYXRpb25Qcm9wZXJ0eShjb21wbGV4VHlwZURlZmluaXRpb25bbmF2UHJvcGVydHlOYW1lXSwgY29tcGxleFR5cGVPYmplY3QsIG5hdlByb3BlcnR5TmFtZSk7XG5cdFx0fSk7XG5cdGNvbXBsZXhUeXBlT2JqZWN0Lm5hdmlnYXRpb25Qcm9wZXJ0aWVzID0gY29tcGxleFR5cGVOYXZpZ2F0aW9uUHJvcGVydGllcztcblx0cmV0dXJuIGNvbXBsZXhUeXBlT2JqZWN0O1xufVxuXG5mdW5jdGlvbiBwcmVwYXJlRW50aXR5S2V5cyhlbnRpdHlUeXBlRGVmaW5pdGlvbjogYW55LCBvTWV0YU1vZGVsRGF0YTogYW55KTogYW55IHtcblx0aWYgKCFlbnRpdHlUeXBlRGVmaW5pdGlvbi4kS2V5ICYmIGVudGl0eVR5cGVEZWZpbml0aW9uLiRCYXNlVHlwZSkge1xuXHRcdHJldHVybiBwcmVwYXJlRW50aXR5S2V5cyhvTWV0YU1vZGVsRGF0YVtgJHtlbnRpdHlUeXBlRGVmaW5pdGlvbi4kQmFzZVR5cGV9YF0sIG9NZXRhTW9kZWxEYXRhKTtcblx0fVxuXHRyZXR1cm4gZW50aXR5VHlwZURlZmluaXRpb24uJEtleSB8fCBbXTsgLy9oYW5kbGluZyBvZiBlbnRpdHkgdHlwZXMgd2l0aG91dCBrZXkgYXMgd2VsbCBhcyBiYXNldHlwZVxufVxuXG5mdW5jdGlvbiBwcmVwYXJlRW50aXR5VHlwZShlbnRpdHlUeXBlRGVmaW5pdGlvbjogYW55LCBlbnRpdHlUeXBlTmFtZTogc3RyaW5nLCBuYW1lc3BhY2U6IHN0cmluZywgbWV0YU1vZGVsRGF0YTogYW55KTogUmF3RW50aXR5VHlwZSB7XG5cdGNvbnN0IGVudGl0eUtleXM6IGFueSA9IHByZXBhcmVFbnRpdHlLZXlzKGVudGl0eVR5cGVEZWZpbml0aW9uLCBtZXRhTW9kZWxEYXRhKTtcblxuXHRjb25zdCBlbnRpdHlUeXBlT2JqZWN0OiBSYXdFbnRpdHlUeXBlID0ge1xuXHRcdF90eXBlOiBcIkVudGl0eVR5cGVcIixcblx0XHRuYW1lOiBlbnRpdHlUeXBlTmFtZS5yZXBsYWNlKGAke25hbWVzcGFjZX0uYCwgXCJcIiksXG5cdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBlbnRpdHlUeXBlTmFtZSxcblx0XHRrZXlzOiBbXSxcblx0XHRlbnRpdHlQcm9wZXJ0aWVzOiBbXSxcblx0XHRuYXZpZ2F0aW9uUHJvcGVydGllczogW10sXG5cdFx0YWN0aW9uczoge31cblx0fTtcblxuXHRjb25zdCBlbnRpdHlQcm9wZXJ0aWVzID0gT2JqZWN0LmtleXMoZW50aXR5VHlwZURlZmluaXRpb24pXG5cdFx0LmZpbHRlcigocHJvcGVydHlOYW1lT3JOb3QpID0+IHtcblx0XHRcdGlmIChwcm9wZXJ0eU5hbWVPck5vdCAhPSBcIiRLZXlcIiAmJiBwcm9wZXJ0eU5hbWVPck5vdCAhPSBcIiRraW5kXCIpIHtcblx0XHRcdFx0cmV0dXJuIGVudGl0eVR5cGVEZWZpbml0aW9uW3Byb3BlcnR5TmFtZU9yTm90XS4ka2luZCA9PT0gXCJQcm9wZXJ0eVwiO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0Lm1hcCgocHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRyZXR1cm4gcHJlcGFyZVByb3BlcnR5KGVudGl0eVR5cGVEZWZpbml0aW9uW3Byb3BlcnR5TmFtZV0sIGVudGl0eVR5cGVPYmplY3QsIHByb3BlcnR5TmFtZSk7XG5cdFx0fSk7XG5cblx0Y29uc3QgbmF2aWdhdGlvblByb3BlcnRpZXMgPSBPYmplY3Qua2V5cyhlbnRpdHlUeXBlRGVmaW5pdGlvbilcblx0XHQuZmlsdGVyKChwcm9wZXJ0eU5hbWVPck5vdCkgPT4ge1xuXHRcdFx0aWYgKHByb3BlcnR5TmFtZU9yTm90ICE9IFwiJEtleVwiICYmIHByb3BlcnR5TmFtZU9yTm90ICE9IFwiJGtpbmRcIikge1xuXHRcdFx0XHRyZXR1cm4gZW50aXR5VHlwZURlZmluaXRpb25bcHJvcGVydHlOYW1lT3JOb3RdLiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiO1xuXHRcdFx0fVxuXHRcdH0pXG5cdFx0Lm1hcCgobmF2UHJvcGVydHlOYW1lKSA9PiB7XG5cdFx0XHRyZXR1cm4gcHJlcGFyZU5hdmlnYXRpb25Qcm9wZXJ0eShlbnRpdHlUeXBlRGVmaW5pdGlvbltuYXZQcm9wZXJ0eU5hbWVdLCBlbnRpdHlUeXBlT2JqZWN0LCBuYXZQcm9wZXJ0eU5hbWUpO1xuXHRcdH0pO1xuXG5cdGVudGl0eVR5cGVPYmplY3Qua2V5cyA9IGVudGl0eUtleXNcblx0XHQubWFwKChlbnRpdHlLZXk6IHN0cmluZykgPT4gZW50aXR5UHJvcGVydGllcy5maW5kKChwcm9wZXJ0eTogUmF3UHJvcGVydHkpID0+IHByb3BlcnR5Lm5hbWUgPT09IGVudGl0eUtleSkpXG5cdFx0LmZpbHRlcigocHJvcGVydHk6IFByb3BlcnR5KSA9PiBwcm9wZXJ0eSAhPT0gdW5kZWZpbmVkKTtcblx0ZW50aXR5VHlwZU9iamVjdC5lbnRpdHlQcm9wZXJ0aWVzID0gZW50aXR5UHJvcGVydGllcztcblx0ZW50aXR5VHlwZU9iamVjdC5uYXZpZ2F0aW9uUHJvcGVydGllcyA9IG5hdmlnYXRpb25Qcm9wZXJ0aWVzO1xuXG5cdHJldHVybiBlbnRpdHlUeXBlT2JqZWN0O1xufVxuZnVuY3Rpb24gcHJlcGFyZUFjdGlvbihhY3Rpb25OYW1lOiBzdHJpbmcsIGFjdGlvblJhd0RhdGE6IE1ldGFNb2RlbEFjdGlvbiwgbmFtZXNwYWNlOiBzdHJpbmcsIGVudGl0eUNvbnRhaW5lck5hbWU6IHN0cmluZyk6IFJhd0FjdGlvbiB7XG5cdGxldCBhY3Rpb25FbnRpdHlUeXBlOiBzdHJpbmcgPSBcIlwiO1xuXHRsZXQgYWN0aW9uRlFOID0gYCR7YWN0aW9uTmFtZX1gO1xuXHRjb25zdCBhY3Rpb25TaG9ydE5hbWUgPSBhY3Rpb25OYW1lLnN1YnN0cihuYW1lc3BhY2UubGVuZ3RoICsgMSk7XG5cdGlmIChhY3Rpb25SYXdEYXRhLiRJc0JvdW5kKSB7XG5cdFx0Y29uc3QgYmluZGluZ1BhcmFtZXRlciA9IGFjdGlvblJhd0RhdGEuJFBhcmFtZXRlclswXTtcblx0XHRhY3Rpb25FbnRpdHlUeXBlID0gYmluZGluZ1BhcmFtZXRlci4kVHlwZTtcblx0XHRpZiAoYmluZGluZ1BhcmFtZXRlci4kaXNDb2xsZWN0aW9uID09PSB0cnVlKSB7XG5cdFx0XHRhY3Rpb25GUU4gPSBgJHthY3Rpb25OYW1lfShDb2xsZWN0aW9uKCR7YWN0aW9uRW50aXR5VHlwZX0pKWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGFjdGlvbkZRTiA9IGAke2FjdGlvbk5hbWV9KCR7YWN0aW9uRW50aXR5VHlwZX0pYDtcblx0XHR9XG5cdH0gZWxzZSB7XG5cdFx0YWN0aW9uRlFOID0gYCR7ZW50aXR5Q29udGFpbmVyTmFtZX0vJHthY3Rpb25TaG9ydE5hbWV9YDtcblx0fVxuXHRjb25zdCBwYXJhbWV0ZXJzID0gYWN0aW9uUmF3RGF0YS4kUGFyYW1ldGVyIHx8IFtdO1xuXHRyZXR1cm4ge1xuXHRcdF90eXBlOiBcIkFjdGlvblwiLFxuXHRcdG5hbWU6IGFjdGlvblNob3J0TmFtZSxcblx0XHRmdWxseVF1YWxpZmllZE5hbWU6IGFjdGlvbkZRTixcblx0XHRpc0JvdW5kOiBhY3Rpb25SYXdEYXRhLiRJc0JvdW5kLFxuXHRcdGlzRnVuY3Rpb246IGZhbHNlLFxuXHRcdHNvdXJjZVR5cGU6IGFjdGlvbkVudGl0eVR5cGUsXG5cdFx0cmV0dXJuVHlwZTogYWN0aW9uUmF3RGF0YS4kUmV0dXJuVHlwZSA/IGFjdGlvblJhd0RhdGEuJFJldHVyblR5cGUuJFR5cGUgOiBcIlwiLFxuXHRcdHBhcmFtZXRlcnM6IHBhcmFtZXRlcnMubWFwKChwYXJhbSkgPT4ge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0X3R5cGU6IFwiQWN0aW9uUGFyYW1ldGVyXCIsXG5cdFx0XHRcdGZ1bGx5UXVhbGlmaWVkTmFtZTogYCR7YWN0aW9uRlFOfS8ke3BhcmFtLiROYW1lfWAsXG5cdFx0XHRcdGlzQ29sbGVjdGlvbjogcGFyYW0uJGlzQ29sbGVjdGlvbiA/PyBmYWxzZSxcblx0XHRcdFx0bmFtZTogcGFyYW0uJE5hbWUsXG5cdFx0XHRcdHR5cGU6IHBhcmFtLiRUeXBlXG5cdFx0XHR9O1xuXHRcdH0pXG5cdH07XG59XG5leHBvcnQgZnVuY3Rpb24gcHJlcGFyZUVudGl0eVR5cGVzKFxuXHRvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCxcblx0b0NhcGFiaWxpdGllczogRW52aXJvbm1lbnRDYXBhYmlsaXRpZXMgPSBEZWZhdWx0RW52aXJvbm1lbnRDYXBhYmlsaXRpZXNcbik6IFJhd01ldGFkYXRhIHtcblx0Y29uc3Qgb01ldGFNb2RlbERhdGEgPSBvTWV0YU1vZGVsLmdldE9iamVjdChcIi8kXCIpO1xuXHRjb25zdCBhbm5vdGF0aW9uTGlzdHM6IFJlY29yZDxzdHJpbmcsIEFubm90YXRpb25MaXN0PiA9IHt9O1xuXHRjb25zdCBlbnRpdHlUeXBlczogUmF3RW50aXR5VHlwZVtdID0gW107XG5cdGNvbnN0IGVudGl0eVNldHM6IFJhd0VudGl0eVNldFtdID0gW107XG5cdGNvbnN0IHNpbmdsZXRvbnM6IFJhd1NpbmdsZXRvbltdID0gW107XG5cdGNvbnN0IGNvbXBsZXhUeXBlczogUmF3Q29tcGxleFR5cGVbXSA9IFtdO1xuXHRjb25zdCB0eXBlRGVmaW5pdGlvbnM6IFJhd1R5cGVEZWZpbml0aW9uW10gPSBbXTtcblx0Y29uc3QgZW50aXR5Q29udGFpbmVyTmFtZSA9IG9NZXRhTW9kZWxEYXRhLiRFbnRpdHlDb250YWluZXI7XG5cdGxldCBuYW1lc3BhY2UgPSBcIlwiO1xuXHRjb25zdCBzY2hlbWFLZXlzID0gT2JqZWN0LmtleXMob01ldGFNb2RlbERhdGEpLmZpbHRlcigobWV0YW1vZGVsS2V5KSA9PiBvTWV0YU1vZGVsRGF0YVttZXRhbW9kZWxLZXldLiRraW5kID09PSBcIlNjaGVtYVwiKTtcblx0aWYgKHNjaGVtYUtleXMgJiYgc2NoZW1hS2V5cy5sZW5ndGggPiAwKSB7XG5cdFx0bmFtZXNwYWNlID0gc2NoZW1hS2V5c1swXS5zdWJzdHIoMCwgc2NoZW1hS2V5c1swXS5sZW5ndGggLSAxKTtcblx0fSBlbHNlIGlmIChlbnRpdHlUeXBlcyAmJiBlbnRpdHlUeXBlcy5sZW5ndGgpIHtcblx0XHRuYW1lc3BhY2UgPSBlbnRpdHlUeXBlc1swXS5mdWxseVF1YWxpZmllZE5hbWUucmVwbGFjZShlbnRpdHlUeXBlc1swXS5uYW1lLCBcIlwiKTtcblx0XHRuYW1lc3BhY2UgPSBuYW1lc3BhY2Uuc3Vic3RyKDAsIG5hbWVzcGFjZS5sZW5ndGggLSAxKTtcblx0fVxuXHRPYmplY3Qua2V5cyhvTWV0YU1vZGVsRGF0YSkuZm9yRWFjaCgoc09iamVjdE5hbWUpID0+IHtcblx0XHRpZiAoc09iamVjdE5hbWUgIT09IFwiJGtpbmRcIikge1xuXHRcdFx0c3dpdGNoIChvTWV0YU1vZGVsRGF0YVtzT2JqZWN0TmFtZV0uJGtpbmQpIHtcblx0XHRcdFx0Y2FzZSBcIkVudGl0eVR5cGVcIjpcblx0XHRcdFx0XHRjb25zdCBlbnRpdHlUeXBlID0gcHJlcGFyZUVudGl0eVR5cGUob01ldGFNb2RlbERhdGFbc09iamVjdE5hbWVdLCBzT2JqZWN0TmFtZSwgbmFtZXNwYWNlLCBvTWV0YU1vZGVsRGF0YSk7XG5cdFx0XHRcdFx0Ly8gQ2hlY2sgaWYgdGhlcmUgYXJlIGZpbHRlciBmYWNldHMgZGVmaW5lZCBmb3IgdGhlIGVudGl0eVR5cGUgYW5kIGlmIHllcywgY2hlY2sgaWYgYWxsIG9mIHRoZW0gaGF2ZSBhbiBJRFxuXHRcdFx0XHRcdC8vIFRoZSBJRCBpcyBvcHRpb25hbCwgYnV0IGl0IGlzIGludGVybmFsbHkgdGFrZW4gZm9yIGdyb3VwaW5nIGZpbHRlciBmaWVsZHMgYW5kIGlmIGl0J3Mgbm90IHByZXNlbnRcblx0XHRcdFx0XHQvLyBhIGZhbGxiYWNrIElEIG5lZWRzIHRvIGJlIGdlbmVyYXRlZCBoZXJlLlxuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdG9NZXRhTW9kZWxEYXRhLiRBbm5vdGF0aW9uc1tlbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZV0gJiZcblx0XHRcdFx0XHRcdG9NZXRhTW9kZWxEYXRhLiRBbm5vdGF0aW9uc1tlbnRpdHlUeXBlLmZ1bGx5UXVhbGlmaWVkTmFtZV1bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRmlsdGVyRmFjZXRzXCJdXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRvTWV0YU1vZGVsRGF0YS4kQW5ub3RhdGlvbnNbZW50aXR5VHlwZS5mdWxseVF1YWxpZmllZE5hbWVdW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkZpbHRlckZhY2V0c1wiXS5mb3JFYWNoKFxuXHRcdFx0XHRcdFx0XHQoZmlsdGVyRmFjZXRBbm5vdGF0aW9uOiBhbnkpID0+IHtcblx0XHRcdFx0XHRcdFx0XHRmaWx0ZXJGYWNldEFubm90YXRpb24uSUQgPSBmaWx0ZXJGYWNldEFubm90YXRpb24uSUQgfHwgZ2VuZXJhdGUoW3sgRmFjZXQ6IGZpbHRlckZhY2V0QW5ub3RhdGlvbiB9XSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGVudGl0eVR5cGUuZW50aXR5UHJvcGVydGllcy5mb3JFYWNoKChlbnRpdHlQcm9wZXJ0eSkgPT4ge1xuXHRcdFx0XHRcdFx0aWYgKCFvTWV0YU1vZGVsRGF0YS4kQW5ub3RhdGlvbnNbZW50aXR5UHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lXSkge1xuXHRcdFx0XHRcdFx0XHRvTWV0YU1vZGVsRGF0YS4kQW5ub3RhdGlvbnNbZW50aXR5UHJvcGVydHkuZnVsbHlRdWFsaWZpZWROYW1lXSA9IHt9O1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0aWYgKFxuXHRcdFx0XHRcdFx0XHQhb01ldGFNb2RlbERhdGEuJEFubm90YXRpb25zW2VudGl0eVByb3BlcnR5LmZ1bGx5UXVhbGlmaWVkTmFtZV1bXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRGVmYXVsdFwiXVxuXHRcdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRcdG9NZXRhTW9kZWxEYXRhLiRBbm5vdGF0aW9uc1tlbnRpdHlQcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWVdW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZERlZmF1bHRcIl0gPVxuXHRcdFx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XHRcdCRUeXBlOiBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkRhdGFGaWVsZFwiLFxuXHRcdFx0XHRcdFx0XHRcdFx0VmFsdWU6IHsgJFBhdGg6IGVudGl0eVByb3BlcnR5Lm5hbWUgfVxuXHRcdFx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0ZW50aXR5VHlwZXMucHVzaChlbnRpdHlUeXBlKTtcblx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0Y2FzZSBcIkNvbXBsZXhUeXBlXCI6XG5cdFx0XHRcdFx0Y29uc3QgY29tcGxleFR5cGUgPSBwcmVwYXJlQ29tcGxleFR5cGUob01ldGFNb2RlbERhdGFbc09iamVjdE5hbWVdLCBzT2JqZWN0TmFtZSwgbmFtZXNwYWNlKTtcblx0XHRcdFx0XHRjb21wbGV4VHlwZXMucHVzaChjb21wbGV4VHlwZSk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJUeXBlRGVmaW5pdGlvblwiOlxuXHRcdFx0XHRcdGNvbnN0IHR5cGVEZWZpbml0aW9uID0gcHJlcGFyZVR5cGVEZWZpbml0aW9uKG9NZXRhTW9kZWxEYXRhW3NPYmplY3ROYW1lXSwgc09iamVjdE5hbWUsIG5hbWVzcGFjZSk7XG5cdFx0XHRcdFx0dHlwZURlZmluaXRpb25zLnB1c2godHlwZURlZmluaXRpb24pO1xuXHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG5cblx0Y29uc3Qgb0VudGl0eUNvbnRhaW5lciA9IG9NZXRhTW9kZWxEYXRhW2VudGl0eUNvbnRhaW5lck5hbWVdO1xuXHRPYmplY3Qua2V5cyhvRW50aXR5Q29udGFpbmVyKS5mb3JFYWNoKChzT2JqZWN0TmFtZSkgPT4ge1xuXHRcdGlmIChzT2JqZWN0TmFtZSAhPT0gXCIka2luZFwiKSB7XG5cdFx0XHRzd2l0Y2ggKG9FbnRpdHlDb250YWluZXJbc09iamVjdE5hbWVdLiRraW5kKSB7XG5cdFx0XHRcdGNhc2UgXCJFbnRpdHlTZXRcIjpcblx0XHRcdFx0XHRjb25zdCBlbnRpdHlTZXQgPSBwcmVwYXJlRW50aXR5U2V0KG9FbnRpdHlDb250YWluZXJbc09iamVjdE5hbWVdLCBzT2JqZWN0TmFtZSwgZW50aXR5Q29udGFpbmVyTmFtZSk7XG5cdFx0XHRcdFx0ZW50aXR5U2V0cy5wdXNoKGVudGl0eVNldCk7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdGNhc2UgXCJTaW5nbGV0b25cIjpcblx0XHRcdFx0XHRjb25zdCBzaW5nbGV0b24gPSBwcmVwYXJlU2luZ2xldG9uKG9FbnRpdHlDb250YWluZXJbc09iamVjdE5hbWVdLCBzT2JqZWN0TmFtZSwgZW50aXR5Q29udGFpbmVyTmFtZSk7XG5cdFx0XHRcdFx0c2luZ2xldG9ucy5wdXNoKHNpbmdsZXRvbik7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHR9XG5cdFx0fVxuXHR9KTtcblxuXHRsZXQgZW50aXR5Q29udGFpbmVyOiBSYXdFbnRpdHlDb250YWluZXIgPSB7XG5cdFx0X3R5cGU6IFwiRW50aXR5Q29udGFpbmVyXCIsXG5cdFx0bmFtZTogXCJcIixcblx0XHRmdWxseVF1YWxpZmllZE5hbWU6IFwiXCJcblx0fTtcblx0aWYgKGVudGl0eUNvbnRhaW5lck5hbWUpIHtcblx0XHRlbnRpdHlDb250YWluZXIgPSB7XG5cdFx0XHRfdHlwZTogXCJFbnRpdHlDb250YWluZXJcIixcblx0XHRcdG5hbWU6IGVudGl0eUNvbnRhaW5lck5hbWUucmVwbGFjZShgJHtuYW1lc3BhY2V9LmAsIFwiXCIpLFxuXHRcdFx0ZnVsbHlRdWFsaWZpZWROYW1lOiBlbnRpdHlDb250YWluZXJOYW1lXG5cdFx0fTtcblx0fVxuXHRlbnRpdHlTZXRzLmZvckVhY2goKGVudGl0eVNldCkgPT4ge1xuXHRcdGNvbnN0IG5hdlByb3BlcnR5QmluZGluZ3MgPSBvRW50aXR5Q29udGFpbmVyW2VudGl0eVNldC5uYW1lXS4kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZztcblx0XHRpZiAobmF2UHJvcGVydHlCaW5kaW5ncykge1xuXHRcdFx0T2JqZWN0LmtleXMobmF2UHJvcGVydHlCaW5kaW5ncykuZm9yRWFjaCgobmF2UHJvcE5hbWUpID0+IHtcblx0XHRcdFx0Y29uc3QgdGFyZ2V0RW50aXR5U2V0ID0gZW50aXR5U2V0cy5maW5kKChlbnRpdHlTZXROYW1lKSA9PiBlbnRpdHlTZXROYW1lLm5hbWUgPT09IG5hdlByb3BlcnR5QmluZGluZ3NbbmF2UHJvcE5hbWVdKTtcblx0XHRcdFx0aWYgKHRhcmdldEVudGl0eVNldCkge1xuXHRcdFx0XHRcdGVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW25hdlByb3BOYW1lXSA9IHRhcmdldEVudGl0eVNldDtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9KTtcblxuXHRjb25zdCBhY3Rpb25zOiBSYXdBY3Rpb25bXSA9IE9iamVjdC5rZXlzKG9NZXRhTW9kZWxEYXRhKVxuXHRcdC5maWx0ZXIoKGtleSkgPT4ge1xuXHRcdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkob01ldGFNb2RlbERhdGFba2V5XSkgJiYgb01ldGFNb2RlbERhdGFba2V5XS5sZW5ndGggPiAwICYmIG9NZXRhTW9kZWxEYXRhW2tleV1bMF0uJGtpbmQgPT09IFwiQWN0aW9uXCI7XG5cdFx0fSlcblx0XHQucmVkdWNlKChvdXRBY3Rpb25zOiBSYXdBY3Rpb25bXSwgYWN0aW9uTmFtZSkgPT4ge1xuXHRcdFx0Y29uc3QgaW5uZXJBY3Rpb25zID0gb01ldGFNb2RlbERhdGFbYWN0aW9uTmFtZV07XG5cdFx0XHRpbm5lckFjdGlvbnMuZm9yRWFjaCgoYWN0aW9uOiBNZXRhTW9kZWxBY3Rpb24pID0+IHtcblx0XHRcdFx0b3V0QWN0aW9ucy5wdXNoKHByZXBhcmVBY3Rpb24oYWN0aW9uTmFtZSwgYWN0aW9uLCBuYW1lc3BhY2UsIGVudGl0eUNvbnRhaW5lck5hbWUpKTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIG91dEFjdGlvbnM7XG5cdFx0fSwgW10pO1xuXG5cdGZvciAoY29uc3QgdGFyZ2V0IGluIG9NZXRhTW9kZWxEYXRhLiRBbm5vdGF0aW9ucykge1xuXHRcdGNyZWF0ZUFubm90YXRpb25MaXN0cyhvTWV0YU1vZGVsRGF0YS4kQW5ub3RhdGlvbnNbdGFyZ2V0XSwgdGFyZ2V0LCBhbm5vdGF0aW9uTGlzdHMsIG9DYXBhYmlsaXRpZXMpO1xuXHR9XG5cblx0Ly8gU29ydCBieSB0YXJnZXQgbGVuZ3RoXG5cdGNvbnN0IG91dEFubm90YXRpb25MaXN0cyA9IE9iamVjdC5rZXlzKGFubm90YXRpb25MaXN0cylcblx0XHQuc29ydCgoYSwgYikgPT4gKGEubGVuZ3RoID49IGIubGVuZ3RoID8gMSA6IC0xKSlcblx0XHQubWFwKChzQW5ub3RhdGlvbk5hbWUpID0+IGFubm90YXRpb25MaXN0c1tzQW5ub3RhdGlvbk5hbWVdKTtcblx0Y29uc3QgcmVmZXJlbmNlczogUmVmZXJlbmNlW10gPSBbXTtcblx0cmV0dXJuIHtcblx0XHRpZGVudGlmaWNhdGlvbjogXCJtZXRhbW9kZWxSZXN1bHRcIixcblx0XHR2ZXJzaW9uOiBcIjQuMFwiLFxuXHRcdHNjaGVtYToge1xuXHRcdFx0ZW50aXR5Q29udGFpbmVyLFxuXHRcdFx0ZW50aXR5U2V0cyxcblx0XHRcdGVudGl0eVR5cGVzLFxuXHRcdFx0Y29tcGxleFR5cGVzLFxuXHRcdFx0dHlwZURlZmluaXRpb25zLFxuXHRcdFx0c2luZ2xldG9ucyxcblx0XHRcdGFzc29jaWF0aW9uczogW10sXG5cdFx0XHRhc3NvY2lhdGlvblNldHM6IFtdLFxuXHRcdFx0YWN0aW9ucyxcblx0XHRcdG5hbWVzcGFjZSxcblx0XHRcdGFubm90YXRpb25zOiB7XG5cdFx0XHRcdFwibWV0YW1vZGVsUmVzdWx0XCI6IG91dEFubm90YXRpb25MaXN0c1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0cmVmZXJlbmNlczogcmVmZXJlbmNlc1xuXHR9O1xufVxuXG5jb25zdCBtTWV0YU1vZGVsTWFwOiBSZWNvcmQ8c3RyaW5nLCBDb252ZXJ0ZWRNZXRhZGF0YT4gPSB7fTtcblxuLyoqXG4gKiBDb252ZXJ0IHRoZSBPRGF0YU1ldGFNb2RlbCBpbnRvIGFub3RoZXIgZm9ybWF0IHRoYXQgYWxsb3cgZm9yIGVhc3kgbWFuaXB1bGF0aW9uIG9mIHRoZSBhbm5vdGF0aW9ucy5cbiAqXG4gKiBAcGFyYW0gb01ldGFNb2RlbCBUaGUgT0RhdGFNZXRhTW9kZWxcbiAqIEBwYXJhbSBvQ2FwYWJpbGl0aWVzIFRoZSBjdXJyZW50IGNhcGFiaWxpdGllc1xuICogQHJldHVybnMgQW4gb2JqZWN0IGNvbnRhaW5pbmcgb2JqZWN0LWxpa2UgYW5ub3RhdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRUeXBlcyhvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgb0NhcGFiaWxpdGllcz86IEVudmlyb25tZW50Q2FwYWJpbGl0aWVzKTogQ29udmVydGVkTWV0YWRhdGEge1xuXHRjb25zdCBzTWV0YU1vZGVsSWQgPSAob01ldGFNb2RlbCBhcyBhbnkpLmlkO1xuXHRpZiAoIW1NZXRhTW9kZWxNYXAuaGFzT3duUHJvcGVydHkoc01ldGFNb2RlbElkKSkge1xuXHRcdGNvbnN0IHBhcnNlZE91dHB1dCA9IHByZXBhcmVFbnRpdHlUeXBlcyhvTWV0YU1vZGVsLCBvQ2FwYWJpbGl0aWVzKTtcblx0XHR0cnkge1xuXHRcdFx0bU1ldGFNb2RlbE1hcFtzTWV0YU1vZGVsSWRdID0gQW5ub3RhdGlvbkNvbnZlcnRlci5jb252ZXJ0KHBhcnNlZE91dHB1dCk7XG5cdFx0fSBjYXRjaCAob0Vycm9yKSB7XG5cdFx0XHR0aHJvdyBuZXcgRXJyb3Iob0Vycm9yIGFzIGFueSk7XG5cdFx0fVxuXHR9XG5cdHJldHVybiBtTWV0YU1vZGVsTWFwW3NNZXRhTW9kZWxJZF0gYXMgYW55IGFzIENvbnZlcnRlZE1ldGFkYXRhO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q29udmVydGVkVHlwZXMob0NvbnRleHQ6IENvbnRleHQpIHtcblx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkgYXMgdW5rbm93biBhcyBPRGF0YU1ldGFNb2RlbDtcblx0aWYgKCFvTWV0YU1vZGVsLmlzQShcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YU1ldGFNb2RlbFwiKSkge1xuXHRcdHRocm93IG5ldyBFcnJvcihcIlRoaXMgc2hvdWxkIG9ubHkgYmUgY2FsbGVkIG9uIGEgT0RhdGFNZXRhTW9kZWxcIik7XG5cdH1cblx0cmV0dXJuIGNvbnZlcnRUeXBlcyhvTWV0YU1vZGVsKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRlbGV0ZU1vZGVsQ2FjaGVEYXRhKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdGRlbGV0ZSBtTWV0YU1vZGVsTWFwWyhvTWV0YU1vZGVsIGFzIGFueSkuaWRdO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY29udmVydE1ldGFNb2RlbENvbnRleHQob01ldGFNb2RlbENvbnRleHQ6IENvbnRleHQsIGJJbmNsdWRlVmlzaXRlZE9iamVjdHM6IGJvb2xlYW4gPSBmYWxzZSk6IGFueSB7XG5cdGNvbnN0IG9Db252ZXJ0ZWRNZXRhZGF0YSA9IGNvbnZlcnRUeXBlcyhvTWV0YU1vZGVsQ29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsKTtcblx0Y29uc3Qgc1BhdGggPSBvTWV0YU1vZGVsQ29udGV4dC5nZXRQYXRoKCk7XG5cblx0Y29uc3QgYVBhdGhTcGxpdCA9IHNQYXRoLnNwbGl0KFwiL1wiKTtcblx0bGV0IGZpcnN0UGFydCA9IGFQYXRoU3BsaXRbMV07XG5cdGxldCBiZWdpbkluZGV4ID0gMjtcblx0aWYgKG9Db252ZXJ0ZWRNZXRhZGF0YS5lbnRpdHlDb250YWluZXIuZnVsbHlRdWFsaWZpZWROYW1lID09PSBmaXJzdFBhcnQpIHtcblx0XHRmaXJzdFBhcnQgPSBhUGF0aFNwbGl0WzJdO1xuXHRcdGJlZ2luSW5kZXgrKztcblx0fVxuXHRsZXQgdGFyZ2V0RW50aXR5U2V0OiBFbnRpdHlTZXQgfCBTaW5nbGV0b24gPSBvQ29udmVydGVkTWV0YWRhdGEuZW50aXR5U2V0cy5maW5kKFxuXHRcdChlbnRpdHlTZXQpID0+IGVudGl0eVNldC5uYW1lID09PSBmaXJzdFBhcnRcblx0KSBhcyBFbnRpdHlTZXQ7XG5cdGlmICghdGFyZ2V0RW50aXR5U2V0KSB7XG5cdFx0dGFyZ2V0RW50aXR5U2V0ID0gb0NvbnZlcnRlZE1ldGFkYXRhLnNpbmdsZXRvbnMuZmluZCgoc2luZ2xldG9uKSA9PiBzaW5nbGV0b24ubmFtZSA9PT0gZmlyc3RQYXJ0KSBhcyBTaW5nbGV0b247XG5cdH1cblx0bGV0IHJlbGF0aXZlUGF0aCA9IGFQYXRoU3BsaXQuc2xpY2UoYmVnaW5JbmRleCkuam9pbihcIi9cIik7XG5cblx0Y29uc3QgbG9jYWxPYmplY3RzOiBhbnlbXSA9IFt0YXJnZXRFbnRpdHlTZXRdO1xuXHR3aGlsZSAocmVsYXRpdmVQYXRoICYmIHJlbGF0aXZlUGF0aC5sZW5ndGggPiAwICYmIHJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKFwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdcIikpIHtcblx0XHRsZXQgcmVsYXRpdmVTcGxpdCA9IHJlbGF0aXZlUGF0aC5zcGxpdChcIi9cIik7XG5cdFx0bGV0IGlkeCA9IDA7XG5cdFx0bGV0IGN1cnJlbnRFbnRpdHlTZXQsIHNOYXZQcm9wVG9DaGVjaztcblxuXHRcdHJlbGF0aXZlU3BsaXQgPSByZWxhdGl2ZVNwbGl0LnNsaWNlKDEpOyAvLyBSZW1vdmluZyBcIiROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nXCJcblx0XHR3aGlsZSAoIWN1cnJlbnRFbnRpdHlTZXQgJiYgcmVsYXRpdmVTcGxpdC5sZW5ndGggPiBpZHgpIHtcblx0XHRcdGlmIChyZWxhdGl2ZVNwbGl0W2lkeF0gIT09IFwiJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmdcIikge1xuXHRcdFx0XHQvLyBGaW5kaW5nIHRoZSBjb3JyZWN0IGVudGl0eVNldCBmb3IgdGhlIG5hdmlnYWl0b24gcHJvcGVydHkgYmluZGluZyBleGFtcGxlOiBcIlNldC9fU2FsZXNPcmRlclwiXG5cdFx0XHRcdHNOYXZQcm9wVG9DaGVjayA9IHJlbGF0aXZlU3BsaXRcblx0XHRcdFx0XHQuc2xpY2UoMCwgaWR4ICsgMSlcblx0XHRcdFx0XHQuam9pbihcIi9cIilcblx0XHRcdFx0XHQucmVwbGFjZShcIi8kTmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1wiLCBcIlwiKTtcblx0XHRcdFx0Y3VycmVudEVudGl0eVNldCA9IHRhcmdldEVudGl0eVNldCAmJiB0YXJnZXRFbnRpdHlTZXQubmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1tzTmF2UHJvcFRvQ2hlY2tdO1xuXHRcdFx0fVxuXHRcdFx0aWR4Kys7XG5cdFx0fVxuXHRcdGlmICghY3VycmVudEVudGl0eVNldCkge1xuXHRcdFx0Ly8gRmFsbCBiYWNrIHRvIFNpbmdsZSBuYXYgcHJvcCBpZiBlbnRpdHlTZXQgaXMgbm90IGZvdW5kLlxuXHRcdFx0c05hdlByb3BUb0NoZWNrID0gcmVsYXRpdmVTcGxpdFswXTtcblx0XHR9XG5cdFx0Y29uc3QgYU5hdlByb3BzID0gc05hdlByb3BUb0NoZWNrPy5zcGxpdChcIi9cIikgfHwgW107XG5cdFx0bGV0IHRhcmdldEVudGl0eVR5cGUgPSB0YXJnZXRFbnRpdHlTZXQgJiYgdGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGU7XG5cdFx0Zm9yIChjb25zdCBzTmF2UHJvcCBvZiBhTmF2UHJvcHMpIHtcblx0XHRcdC8vIFB1c2hpbmcgYWxsIG5hdiBwcm9wcyB0byB0aGUgdmlzaXRlZCBvYmplY3RzLiBleGFtcGxlOiBcIlNldFwiLCBcIl9TYWxlc09yZGVyXCIgZm9yIFwiU2V0L19TYWxlc09yZGVyXCIoaW4gTmF2aWdhdGlvblByb3BlcnR5QmluZGluZylcblx0XHRcdGNvbnN0IHRhcmdldE5hdlByb3AgPSB0YXJnZXRFbnRpdHlUeXBlICYmIHRhcmdldEVudGl0eVR5cGUubmF2aWdhdGlvblByb3BlcnRpZXMuZmluZCgobmF2UHJvcCkgPT4gbmF2UHJvcC5uYW1lID09PSBzTmF2UHJvcCk7XG5cdFx0XHRpZiAodGFyZ2V0TmF2UHJvcCkge1xuXHRcdFx0XHRsb2NhbE9iamVjdHMucHVzaCh0YXJnZXROYXZQcm9wKTtcblx0XHRcdFx0dGFyZ2V0RW50aXR5VHlwZSA9IHRhcmdldE5hdlByb3AudGFyZ2V0VHlwZTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0fVxuXHRcdH1cblx0XHR0YXJnZXRFbnRpdHlTZXQgPVxuXHRcdFx0KHRhcmdldEVudGl0eVNldCAmJiBjdXJyZW50RW50aXR5U2V0KSB8fCAodGFyZ2V0RW50aXR5U2V0ICYmIHRhcmdldEVudGl0eVNldC5uYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nW3JlbGF0aXZlU3BsaXRbMF1dKTtcblx0XHRpZiAodGFyZ2V0RW50aXR5U2V0KSB7XG5cdFx0XHQvLyBQdXNoaW5nIHRoZSB0YXJnZXQgZW50aXR5U2V0IHRvIHZpc2l0ZWQgb2JqZWN0c1xuXHRcdFx0bG9jYWxPYmplY3RzLnB1c2godGFyZ2V0RW50aXR5U2V0KTtcblx0XHR9XG5cdFx0Ly8gUmUtY2FsY3VsYXRpbmcgdGhlIHJlbGF0aXZlIHBhdGhcblx0XHQvLyBBcyBlYWNoIG5hdmlnYXRpb24gbmFtZSBpcyBlbmNsb3NlZCBiZXR3ZWVuICckTmF2aWdhdGlvblByb3BlcnR5QmluZGluZycgYW5kICckJyAodG8gYmUgYWJsZSB0byBhY2Nlc3MgdGhlIGVudGl0eXNldCBlYXNpbHkgaW4gdGhlIG1ldGFtb2RlbClcblx0XHQvLyB3ZSBuZWVkIHRvIHJlbW92ZSB0aGUgY2xvc2luZyAnJCcgdG8gYmUgYWJsZSB0byBzd2l0Y2ggdG8gdGhlIG5leHQgbmF2aWdhdGlvblxuXHRcdHJlbGF0aXZlU3BsaXQgPSByZWxhdGl2ZVNwbGl0LnNsaWNlKGFOYXZQcm9wcy5sZW5ndGggfHwgMSk7XG5cdFx0aWYgKHJlbGF0aXZlU3BsaXQubGVuZ3RoICYmIHJlbGF0aXZlU3BsaXRbMF0gPT09IFwiJFwiKSB7XG5cdFx0XHRyZWxhdGl2ZVNwbGl0LnNoaWZ0KCk7XG5cdFx0fVxuXHRcdHJlbGF0aXZlUGF0aCA9IHJlbGF0aXZlU3BsaXQuam9pbihcIi9cIik7XG5cdH1cblx0aWYgKHJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKFwiJFR5cGVcIikpIHtcblx0XHQvLyBBcyAkVHlwZUAgaXMgYWxsb3dlZCBhcyB3ZWxsXG5cdFx0aWYgKHJlbGF0aXZlUGF0aC5zdGFydHNXaXRoKFwiJFR5cGVAXCIpKSB7XG5cdFx0XHRyZWxhdGl2ZVBhdGggPSByZWxhdGl2ZVBhdGgucmVwbGFjZShcIiRUeXBlXCIsIFwiXCIpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBXZSdyZSBhbnl3YXkgZ29pbmcgdG8gbG9vayBvbiB0aGUgZW50aXR5VHlwZS4uLlxuXHRcdFx0cmVsYXRpdmVQYXRoID0gYVBhdGhTcGxpdC5zbGljZSgzKS5qb2luKFwiL1wiKTtcblx0XHR9XG5cdH1cblx0aWYgKHRhcmdldEVudGl0eVNldCAmJiByZWxhdGl2ZVBhdGgubGVuZ3RoKSB7XG5cdFx0Y29uc3Qgb1RhcmdldCA9IHRhcmdldEVudGl0eVNldC5lbnRpdHlUeXBlLnJlc29sdmVQYXRoKHJlbGF0aXZlUGF0aCwgYkluY2x1ZGVWaXNpdGVkT2JqZWN0cyk7XG5cdFx0aWYgKG9UYXJnZXQpIHtcblx0XHRcdGlmIChiSW5jbHVkZVZpc2l0ZWRPYmplY3RzKSB7XG5cdFx0XHRcdG9UYXJnZXQudmlzaXRlZE9iamVjdHMgPSBsb2NhbE9iamVjdHMuY29uY2F0KG9UYXJnZXQudmlzaXRlZE9iamVjdHMpO1xuXHRcdFx0fVxuXHRcdH0gZWxzZSBpZiAodGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGUgJiYgdGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGUuYWN0aW9ucykge1xuXHRcdFx0Ly8gaWYgdGFyZ2V0IGlzIGFuIGFjdGlvbiBvciBhbiBhY3Rpb24gcGFyYW1ldGVyXG5cdFx0XHRjb25zdCBhY3Rpb25zID0gdGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGUgJiYgdGFyZ2V0RW50aXR5U2V0LmVudGl0eVR5cGUuYWN0aW9ucztcblx0XHRcdGNvbnN0IHJlbGF0aXZlU3BsaXQgPSByZWxhdGl2ZVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0aWYgKGFjdGlvbnNbcmVsYXRpdmVTcGxpdFswXV0pIHtcblx0XHRcdFx0Y29uc3QgYWN0aW9uID0gYWN0aW9uc1tyZWxhdGl2ZVNwbGl0WzBdXTtcblx0XHRcdFx0aWYgKHJlbGF0aXZlU3BsaXRbMV0gJiYgYWN0aW9uLnBhcmFtZXRlcnMpIHtcblx0XHRcdFx0XHRjb25zdCBwYXJhbWV0ZXJOYW1lID0gcmVsYXRpdmVTcGxpdFsxXTtcblx0XHRcdFx0XHRyZXR1cm4gYWN0aW9uLnBhcmFtZXRlcnMuZmluZCgocGFyYW1ldGVyKSA9PiB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gcGFyYW1ldGVyLmZ1bGx5UXVhbGlmaWVkTmFtZS5lbmRzV2l0aChgLyR7cGFyYW1ldGVyTmFtZX1gKTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIGlmIChyZWxhdGl2ZVBhdGgubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGFjdGlvbjtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gb1RhcmdldDtcblx0fSBlbHNlIHtcblx0XHRpZiAoYkluY2x1ZGVWaXNpdGVkT2JqZWN0cykge1xuXHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0dGFyZ2V0OiB0YXJnZXRFbnRpdHlTZXQsXG5cdFx0XHRcdHZpc2l0ZWRPYmplY3RzOiBsb2NhbE9iamVjdHNcblx0XHRcdH07XG5cdFx0fVxuXHRcdHJldHVybiB0YXJnZXRFbnRpdHlTZXQ7XG5cdH1cbn1cblxuZXhwb3J0IHR5cGUgUmVzb2x2ZWRUYXJnZXQgPSB7XG5cdHRhcmdldD86IFNlcnZpY2VPYmplY3Q7XG5cdHZpc2l0ZWRPYmplY3RzOiAoU2VydmljZU9iamVjdCB8IFNpbmdsZXRvbilbXTtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob01ldGFNb2RlbENvbnRleHQ6IENvbnRleHQsIG9FbnRpdHlTZXRNZXRhTW9kZWxDb250ZXh0PzogQ29udGV4dCk6IERhdGFNb2RlbE9iamVjdFBhdGgge1xuXHRjb25zdCBvQ29udmVydGVkTWV0YWRhdGEgPSBjb252ZXJ0VHlwZXMob01ldGFNb2RlbENvbnRleHQuZ2V0TW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCk7XG5cdGNvbnN0IG1ldGFNb2RlbENvbnRleHQgPSBjb252ZXJ0TWV0YU1vZGVsQ29udGV4dChvTWV0YU1vZGVsQ29udGV4dCwgdHJ1ZSk7XG5cdGxldCB0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbjtcblx0aWYgKG9FbnRpdHlTZXRNZXRhTW9kZWxDb250ZXh0ICYmIG9FbnRpdHlTZXRNZXRhTW9kZWxDb250ZXh0LmdldFBhdGgoKSAhPT0gXCIvXCIpIHtcblx0XHR0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbiA9IGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0cyhvRW50aXR5U2V0TWV0YU1vZGVsQ29udGV4dCk7XG5cdH1cblx0cmV0dXJuIGdldEludm9sdmVkRGF0YU1vZGVsT2JqZWN0RnJvbVBhdGgobWV0YU1vZGVsQ29udGV4dCwgb0NvbnZlcnRlZE1ldGFkYXRhLCB0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdEZyb21QYXRoKFxuXHRtZXRhTW9kZWxDb250ZXh0OiBSZXNvbHZlZFRhcmdldCxcblx0Y29udmVydGVkVHlwZXM6IENvbnZlcnRlZE1ldGFkYXRhLFxuXHR0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbj86IERhdGFNb2RlbE9iamVjdFBhdGgsXG5cdG9ubHlTZXJ2aWNlT2JqZWN0cz86IGJvb2xlYW5cbik6IERhdGFNb2RlbE9iamVjdFBhdGgge1xuXHRjb25zdCBkYXRhTW9kZWxPYmplY3RzID0gbWV0YU1vZGVsQ29udGV4dC52aXNpdGVkT2JqZWN0cy5maWx0ZXIoXG5cdFx0KHZpc2l0ZWRPYmplY3Q6IGFueSkgPT5cblx0XHRcdHZpc2l0ZWRPYmplY3QgJiZcblx0XHRcdHZpc2l0ZWRPYmplY3QuaGFzT3duUHJvcGVydHkoXCJfdHlwZVwiKSAmJlxuXHRcdFx0dmlzaXRlZE9iamVjdC5fdHlwZSAhPT0gXCJFbnRpdHlUeXBlXCIgJiZcblx0XHRcdHZpc2l0ZWRPYmplY3QuX3R5cGUgIT09IFwiRW50aXR5Q29udGFpbmVyXCJcblx0KTtcblx0aWYgKFxuXHRcdG1ldGFNb2RlbENvbnRleHQudGFyZ2V0ICYmXG5cdFx0bWV0YU1vZGVsQ29udGV4dC50YXJnZXQuaGFzT3duUHJvcGVydHkoXCJfdHlwZVwiKSAmJlxuXHRcdG1ldGFNb2RlbENvbnRleHQudGFyZ2V0Ll90eXBlICE9PSBcIkVudGl0eVR5cGVcIiAmJlxuXHRcdGRhdGFNb2RlbE9iamVjdHNbZGF0YU1vZGVsT2JqZWN0cy5sZW5ndGggLSAxXSAhPT0gbWV0YU1vZGVsQ29udGV4dC50YXJnZXQgJiZcblx0XHQhb25seVNlcnZpY2VPYmplY3RzXG5cdCkge1xuXHRcdGRhdGFNb2RlbE9iamVjdHMucHVzaChtZXRhTW9kZWxDb250ZXh0LnRhcmdldCk7XG5cdH1cblxuXHRjb25zdCBuYXZpZ2F0aW9uUHJvcGVydGllczogTmF2aWdhdGlvblByb3BlcnR5W10gPSBbXTtcblx0Y29uc3Qgcm9vdEVudGl0eVNldDogRW50aXR5U2V0ID0gZGF0YU1vZGVsT2JqZWN0c1swXSBhcyBFbnRpdHlTZXQ7XG5cblx0bGV0IGN1cnJlbnRFbnRpdHlTZXQ6IEVudGl0eVNldCB8IFNpbmdsZXRvbiB8IHVuZGVmaW5lZCA9IHJvb3RFbnRpdHlTZXQ7XG5cdGxldCBjdXJyZW50RW50aXR5VHlwZTogRW50aXR5VHlwZSA9IHJvb3RFbnRpdHlTZXQuZW50aXR5VHlwZTtcblx0bGV0IGN1cnJlbnRPYmplY3Q6IFNlcnZpY2VPYmplY3QgfCB1bmRlZmluZWQ7XG5cdGxldCBuYXZpZ2F0ZWRQYXRoID0gW107XG5cblx0Zm9yIChsZXQgaSA9IDE7IGkgPCBkYXRhTW9kZWxPYmplY3RzLmxlbmd0aDsgaSsrKSB7XG5cdFx0Y3VycmVudE9iamVjdCA9IGRhdGFNb2RlbE9iamVjdHNbaV07XG5cblx0XHRpZiAoY3VycmVudE9iamVjdC5fdHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIikge1xuXHRcdFx0bmF2aWdhdGVkUGF0aC5wdXNoKGN1cnJlbnRPYmplY3QubmFtZSk7XG5cdFx0XHRuYXZpZ2F0aW9uUHJvcGVydGllcy5wdXNoKGN1cnJlbnRPYmplY3QpO1xuXHRcdFx0Y3VycmVudEVudGl0eVR5cGUgPSBjdXJyZW50T2JqZWN0LnRhcmdldFR5cGU7XG5cdFx0XHRjb25zdCBib3VuZEVudGl0eVNldDogRW50aXR5U2V0IHwgU2luZ2xldG9uIHwgdW5kZWZpbmVkID0gY3VycmVudEVudGl0eVNldD8ubmF2aWdhdGlvblByb3BlcnR5QmluZGluZ1tuYXZpZ2F0ZWRQYXRoLmpvaW4oXCIvXCIpXTtcblx0XHRcdGlmIChib3VuZEVudGl0eVNldCkge1xuXHRcdFx0XHRjdXJyZW50RW50aXR5U2V0ID0gYm91bmRFbnRpdHlTZXQ7XG5cdFx0XHRcdG5hdmlnYXRlZFBhdGggPSBbXTtcblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGN1cnJlbnRPYmplY3QuX3R5cGUgPT09IFwiRW50aXR5U2V0XCIgfHwgY3VycmVudE9iamVjdC5fdHlwZSA9PT0gXCJTaW5nbGV0b25cIikge1xuXHRcdFx0Y3VycmVudEVudGl0eVNldCA9IGN1cnJlbnRPYmplY3Q7XG5cdFx0XHRjdXJyZW50RW50aXR5VHlwZSA9IGN1cnJlbnRFbnRpdHlTZXQuZW50aXR5VHlwZTtcblx0XHR9XG5cdH1cblxuXHRpZiAobmF2aWdhdGVkUGF0aC5sZW5ndGggPiAwKSB7XG5cdFx0Ly8gUGF0aCB3aXRob3V0IE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcgLS0+IG5vIHRhcmdldCBlbnRpdHkgc2V0XG5cdFx0Y3VycmVudEVudGl0eVNldCA9IHVuZGVmaW5lZDtcblx0fVxuXG5cdGlmICh0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbiAmJiB0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbi5zdGFydGluZ0VudGl0eVNldCAhPT0gcm9vdEVudGl0eVNldCkge1xuXHRcdC8vIEluIGNhc2UgdGhlIGVudGl0eXNldCBpcyBub3Qgc3RhcnRpbmcgZnJvbSB0aGUgc2FtZSBsb2NhdGlvbiBpdCBtYXkgbWVhbiB0aGF0IHdlIGFyZSBkb2luZyB0b28gbXVjaCB3b3JrIGVhcmxpZXIgZm9yIHNvbWUgcmVhc29uXG5cdFx0Ly8gQXMgc3VjaCB3ZSBuZWVkIHRvIHJlZGVmaW5lIHRoZSBjb250ZXh0IHNvdXJjZSBmb3IgdGhlIHRhcmdldEVudGl0eVNldExvY2F0aW9uXG5cdFx0Y29uc3Qgc3RhcnRpbmdJbmRleCA9IGRhdGFNb2RlbE9iamVjdHMuaW5kZXhPZih0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbi5zdGFydGluZ0VudGl0eVNldCk7XG5cdFx0aWYgKHN0YXJ0aW5nSW5kZXggIT09IC0xKSB7XG5cdFx0XHQvLyBJZiBpdCdzIG5vdCBmb3VuZCBJIGRvbid0IGtub3cgd2hhdCB3ZSBjYW4gZG8gKHByb2JhYmx5IG5vdGhpbmcpXG5cdFx0XHRjb25zdCByZXF1aXJlZERhdGFNb2RlbE9iamVjdHMgPSBkYXRhTW9kZWxPYmplY3RzLnNsaWNlKDAsIHN0YXJ0aW5nSW5kZXgpO1xuXHRcdFx0dGFyZ2V0RW50aXR5U2V0TG9jYXRpb24uc3RhcnRpbmdFbnRpdHlTZXQgPSByb290RW50aXR5U2V0O1xuXHRcdFx0dGFyZ2V0RW50aXR5U2V0TG9jYXRpb24ubmF2aWdhdGlvblByb3BlcnRpZXMgPSByZXF1aXJlZERhdGFNb2RlbE9iamVjdHNcblx0XHRcdFx0LmZpbHRlcigob2JqZWN0OiBhbnkpID0+IG9iamVjdC5fdHlwZSA9PT0gXCJOYXZpZ2F0aW9uUHJvcGVydHlcIilcblx0XHRcdFx0LmNvbmNhdCh0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbi5uYXZpZ2F0aW9uUHJvcGVydGllcykgYXMgTmF2aWdhdGlvblByb3BlcnR5W107XG5cdFx0fVxuXHR9XG5cdGNvbnN0IG91dERhdGFNb2RlbFBhdGggPSB7XG5cdFx0c3RhcnRpbmdFbnRpdHlTZXQ6IHJvb3RFbnRpdHlTZXQsXG5cdFx0dGFyZ2V0RW50aXR5U2V0OiBjdXJyZW50RW50aXR5U2V0LFxuXHRcdHRhcmdldEVudGl0eVR5cGU6IGN1cnJlbnRFbnRpdHlUeXBlLFxuXHRcdHRhcmdldE9iamVjdDogbWV0YU1vZGVsQ29udGV4dC50YXJnZXQsXG5cdFx0bmF2aWdhdGlvblByb3BlcnRpZXMsXG5cdFx0Y29udGV4dExvY2F0aW9uOiB0YXJnZXRFbnRpdHlTZXRMb2NhdGlvbixcblx0XHRjb252ZXJ0ZWRUeXBlczogY29udmVydGVkVHlwZXNcblx0fTtcblx0aWYgKCFvdXREYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdD8uaGFzT3duUHJvcGVydHkoXCJfdHlwZVwiKSAmJiBvbmx5U2VydmljZU9iamVjdHMpIHtcblx0XHRvdXREYXRhTW9kZWxQYXRoLnRhcmdldE9iamVjdCA9IGN1cnJlbnRPYmplY3Q7XG5cdH1cblx0aWYgKCFvdXREYXRhTW9kZWxQYXRoLmNvbnRleHRMb2NhdGlvbikge1xuXHRcdG91dERhdGFNb2RlbFBhdGguY29udGV4dExvY2F0aW9uID0gb3V0RGF0YU1vZGVsUGF0aDtcblx0fVxuXHRyZXR1cm4gb3V0RGF0YU1vZGVsUGF0aDtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQWlDQSxJQUFNQSxnQkFBcUIsR0FBRztJQUM3QiwyQkFBMkIsRUFBRSxjQUFjO0lBQzNDLG1CQUFtQixFQUFFLE1BQU07SUFDM0IsdUJBQXVCLEVBQUUsVUFBVTtJQUNuQyxnQ0FBZ0MsRUFBRSxRQUFRO0lBQzFDLDRCQUE0QixFQUFFLElBQUk7SUFDbEMsaUNBQWlDLEVBQUUsU0FBUztJQUM1QyxtQ0FBbUMsRUFBRSxXQUFXO0lBQ2hELHNDQUFzQyxFQUFFLGNBQWM7SUFDdEQsdUNBQXVDLEVBQUU7RUFDMUMsQ0FBQztFQVVNLElBQU1DLDhCQUE4QixHQUFHO0lBQzdDQyxLQUFLLEVBQUUsSUFBSTtJQUNYQyxVQUFVLEVBQUUsSUFBSTtJQUNoQkMsTUFBTSxFQUFFLElBQUk7SUFDWkMscUJBQXFCLEVBQUUsSUFBSTtJQUMzQkMsUUFBUSxFQUFFO0VBQ1gsQ0FBQztFQUFDO0VBb0JGLFNBQVNDLGtCQUFrQixDQUMxQkMsZ0JBQXFCLEVBQ3JCQyxXQUFtQixFQUNuQkMsYUFBcUIsRUFDckJDLGdCQUFnRCxFQUNoREMsYUFBc0MsRUFDaEM7SUFDTixJQUFJQyxLQUFLO0lBQ1QsSUFBTUMscUJBQTZCLGFBQU1KLGFBQWEsY0FBSUQsV0FBVyxDQUFFO0lBQ3ZFLElBQU1NLGdCQUFnQixHQUFHLE9BQU9QLGdCQUFnQjtJQUNoRCxJQUFJQSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7TUFDOUJLLEtBQUssR0FBRztRQUFF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