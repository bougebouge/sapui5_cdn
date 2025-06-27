/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/ui/base/ManagedObject", "sap/ui/core/util/XMLPreprocessor"], function (Log, ManagedObject, XMLPreprocessor) {
  "use strict";

  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  //Trace information
  var aTraceInfo = [
    /* Structure for a macro
    		{
    			macro: '', //name of macro
    			metaDataContexts: [ //Properties of type sap.ui.model.Context
    				{
    					name: '', //context property name / key
    					path: '', //from oContext.getPath()
    				}
    			],
    			properties: { // Other properties which become part of {this>}
    				property1: value,
    				property2: value
    			}
    			viewInfo: {
    				viewInfo: {} // As specified in view or fragement creation
    			},
    			traceID: this.index, //ID for this trace information,
    			macroInfo: {
    				macroID: index, // traceID of this macro (redundant for macros)
    				parentMacroID, index // traceID of the parent macro (if it has a parent)
    			}
    		}
    		// Structure for a control
    		{
    			control: '', //control class
    			properties: { // Other properties which become part of {this>}
    				property1: {
    					originalValue: '', //Value before templating
    					resolvedValue: '' //Value after templating
    				}
    			}
    			contexts: { //Models and Contexts used during templating
    				// Model or context name used for this control
    				modelName1: { // For ODataMetaModel
    					path1: {
    						path: '', //absolut path within metamodel
    						data: '', //data of path unless type Object
    					}
    				modelName2: {
    					// for other model types
    					{
    						property1: value,
    						property2: value
    					}
    					// In case binding cannot be resolved -> mark as runtime binding
    					// This is not always true, e.g. in case the path is metamodelpath
    					{
    						"bindingFor": "Runtime"
    					}
    				}
    			},
    			viewInfo: {
    				viewInfo: {} // As specified in view or fragement creation
    			},
    			macroInfo: {
    				macroID: index, // traceID of the macro that created this control
    				parentMacroID, index // traceID of the macro's parent macro
    			},
    			traceID: this.index //ID for this trace information
    		}
    		*/
  ];
  var traceNamespace = "http://schemas.sap.com/sapui5/extension/sap.fe.info/1",
    xmlns = "http://www.w3.org/2000/xmlns/",
    /**
     * Switch is currently based on url parameter
     */
    traceIsOn = location.search.indexOf("sap-ui-xx-feTraceInfo=true") > -1,
    /**
     * Specify all namespaces that shall be traced during templating
     */
    aNamespaces = ["sap.m", "sap.uxap", "sap.ui.unified", "sap.f", "sap.ui.table", "sap.suite.ui.microchart", "sap.ui.layout.form", "sap.ui.mdc", "sap.ui.mdc.link", "sap.ui.mdc.field", "sap.fe.fpm"],
    oCallbacks = {};
  function fnClone(oObject) {
    return JSON.parse(JSON.stringify(oObject));
  }
  function collectContextInfo(sValue, oContexts, oVisitor, oNode) {
    var aContexts;
    var aPromises = [];
    try {
      aContexts = ManagedObject.bindingParser(sValue, undefined, false, true) || [];
    } catch (e) {
      aContexts = [];
    }
    aContexts = Array.isArray(aContexts) ? aContexts : [aContexts];
    aContexts.filter(function (oContext) {
      return oContext.path || oContext.parts;
    }).forEach(function (oContext) {
      var aParts = oContext.parts || [oContext];
      aParts.filter(function (oPartContext) {
        return oPartContext.path;
      }).forEach(function (oPartContext) {
        var oModel = oContexts[oPartContext.model] = oContexts[oPartContext.model] || {};
        var sSimplePath = oPartContext.path.indexOf(">") < 0 ? (oPartContext.model && "".concat(oPartContext.model, ">")) + oPartContext.path : oPartContext.path;
        var oRealContext;
        var aInnerParts;
        if (typeof oPartContext.model === "undefined" && sSimplePath.indexOf(">") > -1) {
          aInnerParts = sSimplePath.split(">");
          oPartContext.model = aInnerParts[0];
          oPartContext.path = aInnerParts[1];
        }
        try {
          oRealContext = oVisitor.getContext(sSimplePath);
          aPromises.push(oVisitor.getResult("{".concat(sSimplePath, "}"), oNode).then(function (oResult) {
            if (oRealContext.getModel().getMetadata().getName() === "sap.ui.model.json.JSONModel") {
              if (!oResult.oModel) {
                oModel[oPartContext.path] = oResult; //oRealContext.getObject(oContext.path);
              } else {
                oModel[oPartContext.path] = "Context from ".concat(oResult.getPath());
              }
            } else {
              oModel[oPartContext.path] = {
                path: oRealContext.getPath(),
                data: typeof oResult === "object" ? "[ctrl/cmd-click] on path to see data" : oResult
              };
            }
          }).catch(function () {
            oModel[oPartContext.path] = {
              bindingFor: "Runtime"
            };
          }));
        } catch (exc) {
          oModel[oPartContext.path] = {
            bindingFor: "Runtime"
          };
        }
      });
    });
    return Promise.all(aPromises);
  }
  function fillAttributes(oResults, oAttributes, sName, sValue) {
    return oResults.then(function (result) {
      oAttributes[sName] = sValue !== result ? {
        originalValue: sValue,
        resolvedValue: result
      } : sValue;
    }).catch(function (e) {
      oAttributes[sName] = {
        originalValue: sValue,
        error: e.stack && e.stack.toString() || e
      };
    });
  }
  function collectInfo(oNode, oVisitor) {
    var oAttributes = {};
    var aPromises = [];
    var oContexts = {};
    var oResults;
    for (var i = oNode.attributes.length >>> 0; i--;) {
      var oAttribute = oNode.attributes[i],
        sName = oAttribute.nodeName,
        sValue = oNode.getAttribute(sName);
      if (!["core:require"].includes(sName)) {
        aPromises.push(collectContextInfo(sValue, oContexts, oVisitor, oNode));
        oResults = oVisitor.getResult(sValue, oNode);
        if (oResults) {
          aPromises.push(fillAttributes(oResults, oAttributes, sName, sValue));
        } else {
          //What
        }
      }
    }
    return Promise.all(aPromises).then(function () {
      return {
        properties: oAttributes,
        contexts: oContexts
      };
    });
  }
  function resolve(oNode, oVisitor) {
    try {
      var sControlName = oNode.nodeName.split(":")[1] || oNode.nodeName,
        bIsControl = /^[A-Z]/.test(sControlName),
        oTraceMetadataContext = {
          control: "".concat(oNode.namespaceURI, ".").concat(oNode.nodeName.split(":")[1] || oNode.nodeName)
        };
      if (bIsControl) {
        var firstChild = _toConsumableArray(oNode.ownerDocument.children).find(function (node) {
          return !node.nodeName.startsWith("#");
        });
        if (firstChild && !firstChild.getAttribute("xmlns:trace")) {
          firstChild.setAttributeNS(xmlns, "xmlns:trace", traceNamespace);
          firstChild.setAttributeNS(traceNamespace, "trace:is", "on");
        }
        return collectInfo(oNode, oVisitor).then(function (result) {
          var bRelevant = Object.keys(result.contexts).length > 0; //If no context was used it is not relevant so we ignore Object.keys(result.properties).length
          if (bRelevant) {
            Object.assign(oTraceMetadataContext, result);
            oTraceMetadataContext.viewInfo = oVisitor.getViewInfo();
            oTraceMetadataContext.macroInfo = oVisitor.getSettings()["_macroInfo"];
            oTraceMetadataContext.traceID = aTraceInfo.length;
            oNode.setAttributeNS(traceNamespace, "trace:traceID", oTraceMetadataContext.traceID);
            aTraceInfo.push(oTraceMetadataContext);
          }
          return oVisitor.visitAttributes(oNode);
        }).then(function () {
          return oVisitor.visitChildNodes(oNode);
        }).catch(function (exc) {
          oTraceMetadataContext.error = {
            exception: exc,
            node: new XMLSerializer().serializeToString(oNode)
          };
        });
      } else {
        return oVisitor.visitAttributes(oNode).then(function () {
          return oVisitor.visitChildNodes(oNode);
        });
      }
    } catch (exc) {
      Log.error("Error while tracing '".concat(oNode === null || oNode === void 0 ? void 0 : oNode.nodeName, "': ").concat(exc.message), "TraceInfo");
      return oVisitor.visitAttributes(oNode).then(function () {
        return oVisitor.visitChildNodes(oNode);
      });
    }
  }
  /**
   * Register path-through XMLPreprocessor plugin for all namespaces
   * given above in aNamespaces
   */
  if (traceIsOn) {
    aNamespaces.forEach(function (namespace) {
      oCallbacks[namespace] = XMLPreprocessor.plugIn(resolve.bind(namespace), namespace);
    });
  }
  /**
   * Adds information about the processing of one macro to the collection.
   *
   * @name sap.fe.macros.TraceInfo.traceMacroCalls
   * @param sName Macro class name
   * @param oMetadata Definition from (macro).metadata.js
   * @param mContexts Available named contexts
   * @param oNode
   * @param oVisitor
   * @returns The traced metadata context
   * @private
   * @ui5-restricted
   * @static
   */
  function traceMacroCalls(sName, oMetadata, mContexts, oNode, oVisitor) {
    try {
      var aMetadataContextKeys = oMetadata.metadataContexts && Object.keys(oMetadata.metadataContexts) || [];
      var aProperties = oMetadata.properties && Object.keys(oMetadata.properties) || [];
      var macroInfo = fnClone(oVisitor.getSettings()["_macroInfo"] || {});
      var oTraceMetadataContext = {
        macro: sName,
        metaDataContexts: [],
        properties: {}
      };
      if (aMetadataContextKeys.length === 0) {
        //In case the macro has not metadata.js we take all metadataContexts except this
        aMetadataContextKeys = Object.keys(mContexts).filter(function (name) {
          return name !== "this";
        });
      }
      if (!oNode.getAttribute("xmlns:trace")) {
        oNode.setAttributeNS(xmlns, "xmlns:trace", traceNamespace);
      }
      if (aMetadataContextKeys.length > 0) {
        aMetadataContextKeys.forEach(function (sKey) {
          var oContext = mContexts[sKey],
            oMetaDataContext = oContext && {
              name: sKey,
              path: oContext.getPath()
              //data: JSON.stringify(oContext.getObject(),null,2)
            };

          if (oMetaDataContext) {
            oTraceMetadataContext.metaDataContexts.push(oMetaDataContext);
          }
        });
        aProperties.forEach(function (sKey) {
          var
          //oPropertySettings = oMetadata.properties[sKey],
          oProperty = mContexts.this.getObject(sKey);
          // (oNode.hasAttribute(sKey) && oNode.getAttribute(sKey)) ||
          // (oPropertySettings.hasOwnProperty("defaultValue") && oPropertySettings.define) ||
          // false;

          if (oProperty) {
            oTraceMetadataContext.properties[sKey] = oProperty;
          }
        });
        oTraceMetadataContext.viewInfo = oVisitor.getViewInfo();
        oTraceMetadataContext.traceID = aTraceInfo.length;
        macroInfo.parentMacroID = macroInfo.macroID;
        macroInfo.macroID = oTraceMetadataContext.traceID;
        oTraceMetadataContext.macroInfo = macroInfo;
        oNode.setAttributeNS(traceNamespace, "trace:macroID", oTraceMetadataContext.traceID);
        aTraceInfo.push(oTraceMetadataContext);
        return oTraceMetadataContext;
      }
    } catch (exc) {
      var _oVisitor$getContext;
      return {
        isError: true,
        error: exc,
        name: sName,
        node: new XMLSerializer().serializeToString(oNode),
        contextPath: oVisitor === null || oVisitor === void 0 ? void 0 : (_oVisitor$getContext = oVisitor.getContext()) === null || _oVisitor$getContext === void 0 ? void 0 : _oVisitor$getContext.getPath()
      };
    }
  }
  /**
   * Returns the globally stored trace information for the macro or
   * control marked with the given id.
   *
   * Returns all trace information if no id is specified
   *
   *
  <pre>Structure for a macro
  {
  	macro: '', //name of macro
  	metaDataContexts: [ //Properties of type sap.ui.model.Context
  		{
  			name: '', //context property name / key
  			path: '', //from oContext.getPath()
  		}
  	],
  	properties: { // Other properties which become part of {this>}
  		property1: value,
  		property2: value
  	}
  	viewInfo: {
  		viewInfo: {} // As specified in view or fragement creation
  	},
  	traceID: this.index, //ID for this trace information,
  	macroInfo: {
  		macroID: index, // traceID of this macro (redundant for macros)
  		parentMacroID, index // traceID of the parent macro (if it has a parent)
  	}
  }
  Structure for a control
  {
  	control: '', //control class
  	properties: { // Other properties which become part of {this>}
  		property1: {
  			originalValue: '', //Value before templating
  			resolvedValue: '' //Value after templating
  		}
  	}
  	contexts: { //Models and Contexts used during templating
  		// Model or context name used for this control
  		modelName1: { // For ODataMetaModel
  			path1: {
  				path: '', //absolut path within metamodel
  				data: '', //data of path unless type Object
  			}
  		modelName2: {
  			// for other model types
  			{
  				property1: value,
  				property2: value
  			}
  			// In case binding cannot be resolved -> mark as runtime binding
  			// This is not always true, e.g. in case the path is metamodelpath
  			{
  				"bindingFor": "Runtime"
  			}
  		}
  	},
  	viewInfo: {
  		viewInfo: {} // As specified in view or fragement creation
  	},
  	macroInfo: {
  		macroID: index, // traceID of the macro that created this control
  		parentMacroID, index // traceID of the macro's parent macro
  	},
  	traceID: this.index //ID for this trace information
  }</pre>.
   *
   * @function
   * @name sap.fe.macros.TraceInfo.getTraceInfo
   * @param id TraceInfo id
   * @returns Object / Array for TraceInfo
   * @private
   * @static
   */
  function getTraceInfo(id) {
    if (id) {
      return aTraceInfo[id];
    }
    var aErrors = aTraceInfo.filter(function (traceInfo) {
      return traceInfo.error;
    });
    return aErrors.length > 0 && aErrors || aTraceInfo;
  }
  /**
   * Returns true if TraceInfo is active.
   *
   * @function
   * @name sap.fe.macros.TraceInfo.isTraceInfoActive
   * @returns `true` when active
   * @private
   * @static
   */
  function isTraceInfoActive() {
    return traceIsOn;
  }
  /**
   * @typedef sap.fe.macros.TraceInfo
   * TraceInfo for SAP Fiori elements
   *
   * Once traces is switched, information about macros and controls
   * that are processed during xml preprocessing ( @see {@link sap.ui.core.util.XMLPreprocessor})
   * will be collected within this singleton
   * @namespace
   * @private
   * @global
   * @experimental This module is only for experimental use! <br/><b>This is only a POC and maybe deleted</b>
   * @since 1.74.0
   */
  return {
    isTraceInfoActive: isTraceInfoActive,
    traceMacroCalls: traceMacroCalls,
    getTraceInfo: getTraceInfo
  };
}, true);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJhVHJhY2VJbmZvIiwidHJhY2VOYW1lc3BhY2UiLCJ4bWxucyIsInRyYWNlSXNPbiIsImxvY2F0aW9uIiwic2VhcmNoIiwiaW5kZXhPZiIsImFOYW1lc3BhY2VzIiwib0NhbGxiYWNrcyIsImZuQ2xvbmUiLCJvT2JqZWN0IiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5IiwiY29sbGVjdENvbnRleHRJbmZvIiwic1ZhbHVlIiwib0NvbnRleHRzIiwib1Zpc2l0b3IiLCJvTm9kZSIsImFDb250ZXh0cyIsImFQcm9taXNlcyIsIk1hbmFnZWRPYmplY3QiLCJiaW5kaW5nUGFyc2VyIiwidW5kZWZpbmVkIiwiZSIsIkFycmF5IiwiaXNBcnJheSIsImZpbHRlciIsIm9Db250ZXh0IiwicGF0aCIsInBhcnRzIiwiZm9yRWFjaCIsImFQYXJ0cyIsIm9QYXJ0Q29udGV4dCIsIm9Nb2RlbCIsIm1vZGVsIiwic1NpbXBsZVBhdGgiLCJvUmVhbENvbnRleHQiLCJhSW5uZXJQYXJ0cyIsInNwbGl0IiwiZ2V0Q29udGV4dCIsInB1c2giLCJnZXRSZXN1bHQiLCJ0aGVuIiwib1Jlc3VsdCIsImdldE1vZGVsIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwiZ2V0UGF0aCIsImRhdGEiLCJjYXRjaCIsImJpbmRpbmdGb3IiLCJleGMiLCJQcm9taXNlIiwiYWxsIiwiZmlsbEF0dHJpYnV0ZXMiLCJvUmVzdWx0cyIsIm9BdHRyaWJ1dGVzIiwic05hbWUiLCJyZXN1bHQiLCJvcmlnaW5hbFZhbHVlIiwicmVzb2x2ZWRWYWx1ZSIsImVycm9yIiwic3RhY2siLCJ0b1N0cmluZyIsImNvbGxlY3RJbmZvIiwiaSIsImF0dHJpYnV0ZXMiLCJsZW5ndGgiLCJvQXR0cmlidXRlIiwibm9kZU5hbWUiLCJnZXRBdHRyaWJ1dGUiLCJpbmNsdWRlcyIsInByb3BlcnRpZXMiLCJjb250ZXh0cyIsInJlc29sdmUiLCJzQ29udHJvbE5hbWUiLCJiSXNDb250cm9sIiwidGVzdCIsIm9UcmFjZU1ldGFkYXRhQ29udGV4dCIsImNvbnRyb2wiLCJuYW1lc3BhY2VVUkkiLCJmaXJzdENoaWxkIiwib3duZXJEb2N1bWVudCIsImNoaWxkcmVuIiwiZmluZCIsIm5vZGUiLCJzdGFydHNXaXRoIiwic2V0QXR0cmlidXRlTlMiLCJiUmVsZXZhbnQiLCJPYmplY3QiLCJrZXlzIiwiYXNzaWduIiwidmlld0luZm8iLCJnZXRWaWV3SW5mbyIsIm1hY3JvSW5mbyIsImdldFNldHRpbmdzIiwidHJhY2VJRCIsInZpc2l0QXR0cmlidXRlcyIsInZpc2l0Q2hpbGROb2RlcyIsImV4Y2VwdGlvbiIsIlhNTFNlcmlhbGl6ZXIiLCJzZXJpYWxpemVUb1N0cmluZyIsIkxvZyIsIm1lc3NhZ2UiLCJuYW1lc3BhY2UiLCJYTUxQcmVwcm9jZXNzb3IiLCJwbHVnSW4iLCJiaW5kIiwidHJhY2VNYWNyb0NhbGxzIiwib01ldGFkYXRhIiwibUNvbnRleHRzIiwiYU1ldGFkYXRhQ29udGV4dEtleXMiLCJtZXRhZGF0YUNvbnRleHRzIiwiYVByb3BlcnRpZXMiLCJtYWNybyIsIm1ldGFEYXRhQ29udGV4dHMiLCJuYW1lIiwic0tleSIsIm9NZXRhRGF0YUNvbnRleHQiLCJvUHJvcGVydHkiLCJ0aGlzIiwiZ2V0T2JqZWN0IiwicGFyZW50TWFjcm9JRCIsIm1hY3JvSUQiLCJpc0Vycm9yIiwiY29udGV4dFBhdGgiLCJnZXRUcmFjZUluZm8iLCJpZCIsImFFcnJvcnMiLCJ0cmFjZUluZm8iLCJpc1RyYWNlSW5mb0FjdGl2ZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVHJhY2VJbmZvLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IE1hbmFnZWRPYmplY3QgZnJvbSBcInNhcC91aS9iYXNlL01hbmFnZWRPYmplY3RcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG4vL1RyYWNlIGluZm9ybWF0aW9uXG5jb25zdCBhVHJhY2VJbmZvOiBhbnlbXSA9IFtcblx0LyogU3RydWN0dXJlIGZvciBhIG1hY3JvXG5cdFx0XHR7XG5cdFx0XHRcdG1hY3JvOiAnJywgLy9uYW1lIG9mIG1hY3JvXG5cdFx0XHRcdG1ldGFEYXRhQ29udGV4dHM6IFsgLy9Qcm9wZXJ0aWVzIG9mIHR5cGUgc2FwLnVpLm1vZGVsLkNvbnRleHRcblx0XHRcdFx0XHR7XG5cdFx0XHRcdFx0XHRuYW1lOiAnJywgLy9jb250ZXh0IHByb3BlcnR5IG5hbWUgLyBrZXlcblx0XHRcdFx0XHRcdHBhdGg6ICcnLCAvL2Zyb20gb0NvbnRleHQuZ2V0UGF0aCgpXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRdLFxuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7IC8vIE90aGVyIHByb3BlcnRpZXMgd2hpY2ggYmVjb21lIHBhcnQgb2Yge3RoaXM+fVxuXHRcdFx0XHRcdHByb3BlcnR5MTogdmFsdWUsXG5cdFx0XHRcdFx0cHJvcGVydHkyOiB2YWx1ZVxuXHRcdFx0XHR9XG5cdFx0XHRcdHZpZXdJbmZvOiB7XG5cdFx0XHRcdFx0dmlld0luZm86IHt9IC8vIEFzIHNwZWNpZmllZCBpbiB2aWV3IG9yIGZyYWdlbWVudCBjcmVhdGlvblxuXHRcdFx0XHR9LFxuXHRcdFx0XHR0cmFjZUlEOiB0aGlzLmluZGV4LCAvL0lEIGZvciB0aGlzIHRyYWNlIGluZm9ybWF0aW9uLFxuXHRcdFx0XHRtYWNyb0luZm86IHtcblx0XHRcdFx0XHRtYWNyb0lEOiBpbmRleCwgLy8gdHJhY2VJRCBvZiB0aGlzIG1hY3JvIChyZWR1bmRhbnQgZm9yIG1hY3Jvcylcblx0XHRcdFx0XHRwYXJlbnRNYWNyb0lELCBpbmRleCAvLyB0cmFjZUlEIG9mIHRoZSBwYXJlbnQgbWFjcm8gKGlmIGl0IGhhcyBhIHBhcmVudClcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdFx0Ly8gU3RydWN0dXJlIGZvciBhIGNvbnRyb2xcblx0XHRcdHtcblx0XHRcdFx0Y29udHJvbDogJycsIC8vY29udHJvbCBjbGFzc1xuXHRcdFx0XHRwcm9wZXJ0aWVzOiB7IC8vIE90aGVyIHByb3BlcnRpZXMgd2hpY2ggYmVjb21lIHBhcnQgb2Yge3RoaXM+fVxuXHRcdFx0XHRcdHByb3BlcnR5MToge1xuXHRcdFx0XHRcdFx0b3JpZ2luYWxWYWx1ZTogJycsIC8vVmFsdWUgYmVmb3JlIHRlbXBsYXRpbmdcblx0XHRcdFx0XHRcdHJlc29sdmVkVmFsdWU6ICcnIC8vVmFsdWUgYWZ0ZXIgdGVtcGxhdGluZ1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRjb250ZXh0czogeyAvL01vZGVscyBhbmQgQ29udGV4dHMgdXNlZCBkdXJpbmcgdGVtcGxhdGluZ1xuXHRcdFx0XHRcdC8vIE1vZGVsIG9yIGNvbnRleHQgbmFtZSB1c2VkIGZvciB0aGlzIGNvbnRyb2xcblx0XHRcdFx0XHRtb2RlbE5hbWUxOiB7IC8vIEZvciBPRGF0YU1ldGFNb2RlbFxuXHRcdFx0XHRcdFx0cGF0aDE6IHtcblx0XHRcdFx0XHRcdFx0cGF0aDogJycsIC8vYWJzb2x1dCBwYXRoIHdpdGhpbiBtZXRhbW9kZWxcblx0XHRcdFx0XHRcdFx0ZGF0YTogJycsIC8vZGF0YSBvZiBwYXRoIHVubGVzcyB0eXBlIE9iamVjdFxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdG1vZGVsTmFtZTI6IHtcblx0XHRcdFx0XHRcdC8vIGZvciBvdGhlciBtb2RlbCB0eXBlc1xuXHRcdFx0XHRcdFx0e1xuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0eTE6IHZhbHVlLFxuXHRcdFx0XHRcdFx0XHRwcm9wZXJ0eTI6IHZhbHVlXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHQvLyBJbiBjYXNlIGJpbmRpbmcgY2Fubm90IGJlIHJlc29sdmVkIC0+IG1hcmsgYXMgcnVudGltZSBiaW5kaW5nXG5cdFx0XHRcdFx0XHQvLyBUaGlzIGlzIG5vdCBhbHdheXMgdHJ1ZSwgZS5nLiBpbiBjYXNlIHRoZSBwYXRoIGlzIG1ldGFtb2RlbHBhdGhcblx0XHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdFx0XCJiaW5kaW5nRm9yXCI6IFwiUnVudGltZVwiXG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHR2aWV3SW5mbzoge1xuXHRcdFx0XHRcdHZpZXdJbmZvOiB7fSAvLyBBcyBzcGVjaWZpZWQgaW4gdmlldyBvciBmcmFnZW1lbnQgY3JlYXRpb25cblx0XHRcdFx0fSxcblx0XHRcdFx0bWFjcm9JbmZvOiB7XG5cdFx0XHRcdFx0bWFjcm9JRDogaW5kZXgsIC8vIHRyYWNlSUQgb2YgdGhlIG1hY3JvIHRoYXQgY3JlYXRlZCB0aGlzIGNvbnRyb2xcblx0XHRcdFx0XHRwYXJlbnRNYWNyb0lELCBpbmRleCAvLyB0cmFjZUlEIG9mIHRoZSBtYWNybydzIHBhcmVudCBtYWNyb1xuXHRcdFx0XHR9LFxuXHRcdFx0XHR0cmFjZUlEOiB0aGlzLmluZGV4IC8vSUQgZm9yIHRoaXMgdHJhY2UgaW5mb3JtYXRpb25cblx0XHRcdH1cblx0XHRcdCovXG5dO1xuY29uc3QgdHJhY2VOYW1lc3BhY2UgPSBcImh0dHA6Ly9zY2hlbWFzLnNhcC5jb20vc2FwdWk1L2V4dGVuc2lvbi9zYXAuZmUuaW5mby8xXCIsXG5cdHhtbG5zID0gXCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3htbG5zL1wiLFxuXHQvKipcblx0ICogU3dpdGNoIGlzIGN1cnJlbnRseSBiYXNlZCBvbiB1cmwgcGFyYW1ldGVyXG5cdCAqL1xuXHR0cmFjZUlzT24gPSBsb2NhdGlvbi5zZWFyY2guaW5kZXhPZihcInNhcC11aS14eC1mZVRyYWNlSW5mbz10cnVlXCIpID4gLTEsXG5cdC8qKlxuXHQgKiBTcGVjaWZ5IGFsbCBuYW1lc3BhY2VzIHRoYXQgc2hhbGwgYmUgdHJhY2VkIGR1cmluZyB0ZW1wbGF0aW5nXG5cdCAqL1xuXHRhTmFtZXNwYWNlcyA9IFtcblx0XHRcInNhcC5tXCIsXG5cdFx0XCJzYXAudXhhcFwiLFxuXHRcdFwic2FwLnVpLnVuaWZpZWRcIixcblx0XHRcInNhcC5mXCIsXG5cdFx0XCJzYXAudWkudGFibGVcIixcblx0XHRcInNhcC5zdWl0ZS51aS5taWNyb2NoYXJ0XCIsXG5cdFx0XCJzYXAudWkubGF5b3V0LmZvcm1cIixcblx0XHRcInNhcC51aS5tZGNcIixcblx0XHRcInNhcC51aS5tZGMubGlua1wiLFxuXHRcdFwic2FwLnVpLm1kYy5maWVsZFwiLFxuXHRcdFwic2FwLmZlLmZwbVwiXG5cdF0sXG5cdG9DYWxsYmFja3M6IGFueSA9IHt9O1xuXG5mdW5jdGlvbiBmbkNsb25lKG9PYmplY3Q6IG9iamVjdCkge1xuXHRyZXR1cm4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvT2JqZWN0KSk7XG59XG5mdW5jdGlvbiBjb2xsZWN0Q29udGV4dEluZm8oc1ZhbHVlOiBhbnksIG9Db250ZXh0czogYW55LCBvVmlzaXRvcjogYW55LCBvTm9kZTogYW55KSB7XG5cdGxldCBhQ29udGV4dHM7XG5cdGNvbnN0IGFQcm9taXNlczogYW55W10gPSBbXTtcblx0dHJ5IHtcblx0XHRhQ29udGV4dHMgPSAoTWFuYWdlZE9iamVjdCBhcyBhbnkpLmJpbmRpbmdQYXJzZXIoc1ZhbHVlLCB1bmRlZmluZWQsIGZhbHNlLCB0cnVlKSB8fCBbXTtcblx0fSBjYXRjaCAoZSkge1xuXHRcdGFDb250ZXh0cyA9IFtdO1xuXHR9XG5cdGFDb250ZXh0cyA9IEFycmF5LmlzQXJyYXkoYUNvbnRleHRzKSA/IGFDb250ZXh0cyA6IFthQ29udGV4dHNdO1xuXHRhQ29udGV4dHNcblx0XHQuZmlsdGVyKGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0XHRyZXR1cm4gb0NvbnRleHQucGF0aCB8fCBvQ29udGV4dC5wYXJ0cztcblx0XHR9KVxuXHRcdC5mb3JFYWNoKGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0XHRjb25zdCBhUGFydHMgPSBvQ29udGV4dC5wYXJ0cyB8fCBbb0NvbnRleHRdO1xuXHRcdFx0YVBhcnRzXG5cdFx0XHRcdC5maWx0ZXIoZnVuY3Rpb24gKG9QYXJ0Q29udGV4dDogYW55KSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9QYXJ0Q29udGV4dC5wYXRoO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuZm9yRWFjaChmdW5jdGlvbiAob1BhcnRDb250ZXh0OiBhbnkpIHtcblx0XHRcdFx0XHRjb25zdCBvTW9kZWwgPSAob0NvbnRleHRzW29QYXJ0Q29udGV4dC5tb2RlbF0gPSBvQ29udGV4dHNbb1BhcnRDb250ZXh0Lm1vZGVsXSB8fCB7fSk7XG5cdFx0XHRcdFx0Y29uc3Qgc1NpbXBsZVBhdGggPVxuXHRcdFx0XHRcdFx0b1BhcnRDb250ZXh0LnBhdGguaW5kZXhPZihcIj5cIikgPCAwXG5cdFx0XHRcdFx0XHRcdD8gKG9QYXJ0Q29udGV4dC5tb2RlbCAmJiBgJHtvUGFydENvbnRleHQubW9kZWx9PmApICsgb1BhcnRDb250ZXh0LnBhdGhcblx0XHRcdFx0XHRcdFx0OiBvUGFydENvbnRleHQucGF0aDtcblx0XHRcdFx0XHRsZXQgb1JlYWxDb250ZXh0OiBhbnk7XG5cdFx0XHRcdFx0bGV0IGFJbm5lclBhcnRzO1xuXG5cdFx0XHRcdFx0aWYgKHR5cGVvZiBvUGFydENvbnRleHQubW9kZWwgPT09IFwidW5kZWZpbmVkXCIgJiYgc1NpbXBsZVBhdGguaW5kZXhPZihcIj5cIikgPiAtMSkge1xuXHRcdFx0XHRcdFx0YUlubmVyUGFydHMgPSBzU2ltcGxlUGF0aC5zcGxpdChcIj5cIik7XG5cdFx0XHRcdFx0XHRvUGFydENvbnRleHQubW9kZWwgPSBhSW5uZXJQYXJ0c1swXTtcblx0XHRcdFx0XHRcdG9QYXJ0Q29udGV4dC5wYXRoID0gYUlubmVyUGFydHNbMV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRvUmVhbENvbnRleHQgPSBvVmlzaXRvci5nZXRDb250ZXh0KHNTaW1wbGVQYXRoKTtcblx0XHRcdFx0XHRcdGFQcm9taXNlcy5wdXNoKFxuXHRcdFx0XHRcdFx0XHRvVmlzaXRvclxuXHRcdFx0XHRcdFx0XHRcdC5nZXRSZXN1bHQoYHske3NTaW1wbGVQYXRofX1gLCBvTm9kZSlcblx0XHRcdFx0XHRcdFx0XHQudGhlbihmdW5jdGlvbiAob1Jlc3VsdDogYW55KSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAob1JlYWxDb250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YWRhdGEoKS5nZXROYW1lKCkgPT09IFwic2FwLnVpLm1vZGVsLmpzb24uSlNPTk1vZGVsXCIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWYgKCFvUmVzdWx0Lm9Nb2RlbCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdG9Nb2RlbFtvUGFydENvbnRleHQucGF0aF0gPSBvUmVzdWx0OyAvL29SZWFsQ29udGV4dC5nZXRPYmplY3Qob0NvbnRleHQucGF0aCk7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0b01vZGVsW29QYXJ0Q29udGV4dC5wYXRoXSA9IGBDb250ZXh0IGZyb20gJHtvUmVzdWx0LmdldFBhdGgoKX1gO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRvTW9kZWxbb1BhcnRDb250ZXh0LnBhdGhdID0ge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdHBhdGg6IG9SZWFsQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0ZGF0YTogdHlwZW9mIG9SZXN1bHQgPT09IFwib2JqZWN0XCIgPyBcIltjdHJsL2NtZC1jbGlja10gb24gcGF0aCB0byBzZWUgZGF0YVwiIDogb1Jlc3VsdFxuXHRcdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG9Nb2RlbFtvUGFydENvbnRleHQucGF0aF0gPSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGJpbmRpbmdGb3I6IFwiUnVudGltZVwiXG5cdFx0XHRcdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0XHRcdH0pXG5cdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdH0gY2F0Y2ggKGV4Yykge1xuXHRcdFx0XHRcdFx0b01vZGVsW29QYXJ0Q29udGV4dC5wYXRoXSA9IHtcblx0XHRcdFx0XHRcdFx0YmluZGluZ0ZvcjogXCJSdW50aW1lXCJcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9KTtcblx0XHR9KTtcblx0cmV0dXJuIFByb21pc2UuYWxsKGFQcm9taXNlcyk7XG59XG5mdW5jdGlvbiBmaWxsQXR0cmlidXRlcyhvUmVzdWx0czogYW55LCBvQXR0cmlidXRlczogYW55LCBzTmFtZTogYW55LCBzVmFsdWU6IGFueSkge1xuXHRyZXR1cm4gb1Jlc3VsdHNcblx0XHQudGhlbihmdW5jdGlvbiAocmVzdWx0OiBhbnkpIHtcblx0XHRcdG9BdHRyaWJ1dGVzW3NOYW1lXSA9XG5cdFx0XHRcdHNWYWx1ZSAhPT0gcmVzdWx0XG5cdFx0XHRcdFx0PyB7XG5cdFx0XHRcdFx0XHRcdG9yaWdpbmFsVmFsdWU6IHNWYWx1ZSxcblx0XHRcdFx0XHRcdFx0cmVzb2x2ZWRWYWx1ZTogcmVzdWx0XG5cdFx0XHRcdFx0ICB9XG5cdFx0XHRcdFx0OiBzVmFsdWU7XG5cdFx0fSlcblx0XHQuY2F0Y2goZnVuY3Rpb24gKGU6IGFueSkge1xuXHRcdFx0b0F0dHJpYnV0ZXNbc05hbWVdID0ge1xuXHRcdFx0XHRvcmlnaW5hbFZhbHVlOiBzVmFsdWUsXG5cdFx0XHRcdGVycm9yOiAoZS5zdGFjayAmJiBlLnN0YWNrLnRvU3RyaW5nKCkpIHx8IGVcblx0XHRcdH07XG5cdFx0fSk7XG59XG5mdW5jdGlvbiBjb2xsZWN0SW5mbyhvTm9kZTogYW55LCBvVmlzaXRvcjogYW55KSB7XG5cdGNvbnN0IG9BdHRyaWJ1dGVzID0ge307XG5cdGNvbnN0IGFQcm9taXNlcyA9IFtdO1xuXHRjb25zdCBvQ29udGV4dHMgPSB7fTtcblx0bGV0IG9SZXN1bHRzO1xuXHRmb3IgKGxldCBpID0gb05vZGUuYXR0cmlidXRlcy5sZW5ndGggPj4+IDA7IGktLTsgKSB7XG5cdFx0Y29uc3Qgb0F0dHJpYnV0ZSA9IG9Ob2RlLmF0dHJpYnV0ZXNbaV0sXG5cdFx0XHRzTmFtZSA9IG9BdHRyaWJ1dGUubm9kZU5hbWUsXG5cdFx0XHRzVmFsdWUgPSBvTm9kZS5nZXRBdHRyaWJ1dGUoc05hbWUpO1xuXHRcdGlmICghW1wiY29yZTpyZXF1aXJlXCJdLmluY2x1ZGVzKHNOYW1lKSkge1xuXHRcdFx0YVByb21pc2VzLnB1c2goY29sbGVjdENvbnRleHRJbmZvKHNWYWx1ZSwgb0NvbnRleHRzLCBvVmlzaXRvciwgb05vZGUpKTtcblx0XHRcdG9SZXN1bHRzID0gb1Zpc2l0b3IuZ2V0UmVzdWx0KHNWYWx1ZSwgb05vZGUpO1xuXHRcdFx0aWYgKG9SZXN1bHRzKSB7XG5cdFx0XHRcdGFQcm9taXNlcy5wdXNoKGZpbGxBdHRyaWJ1dGVzKG9SZXN1bHRzLCBvQXR0cmlidXRlcywgc05hbWUsIHNWYWx1ZSkpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly9XaGF0XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cdHJldHVybiBQcm9taXNlLmFsbChhUHJvbWlzZXMpLnRoZW4oZnVuY3Rpb24gKCkge1xuXHRcdHJldHVybiB7IHByb3BlcnRpZXM6IG9BdHRyaWJ1dGVzLCBjb250ZXh0czogb0NvbnRleHRzIH07XG5cdH0pO1xufVxuZnVuY3Rpb24gcmVzb2x2ZShvTm9kZTogYW55LCBvVmlzaXRvcjogYW55KSB7XG5cdHRyeSB7XG5cdFx0Y29uc3Qgc0NvbnRyb2xOYW1lID0gb05vZGUubm9kZU5hbWUuc3BsaXQoXCI6XCIpWzFdIHx8IG9Ob2RlLm5vZGVOYW1lLFxuXHRcdFx0YklzQ29udHJvbCA9IC9eW0EtWl0vLnRlc3Qoc0NvbnRyb2xOYW1lKSxcblx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dDogYW55ID0ge1xuXHRcdFx0XHRjb250cm9sOiBgJHtvTm9kZS5uYW1lc3BhY2VVUkl9LiR7b05vZGUubm9kZU5hbWUuc3BsaXQoXCI6XCIpWzFdIHx8IG9Ob2RlLm5vZGVOYW1lfWBcblx0XHRcdH07XG5cblx0XHRpZiAoYklzQ29udHJvbCkge1xuXHRcdFx0Y29uc3QgZmlyc3RDaGlsZCA9IFsuLi5vTm9kZS5vd25lckRvY3VtZW50LmNoaWxkcmVuXS5maW5kKChub2RlKSA9PiAhbm9kZS5ub2RlTmFtZS5zdGFydHNXaXRoKFwiI1wiKSk7XG5cdFx0XHRpZiAoZmlyc3RDaGlsZCAmJiAhZmlyc3RDaGlsZC5nZXRBdHRyaWJ1dGUoXCJ4bWxuczp0cmFjZVwiKSkge1xuXHRcdFx0XHRmaXJzdENoaWxkLnNldEF0dHJpYnV0ZU5TKHhtbG5zLCBcInhtbG5zOnRyYWNlXCIsIHRyYWNlTmFtZXNwYWNlKTtcblx0XHRcdFx0Zmlyc3RDaGlsZC5zZXRBdHRyaWJ1dGVOUyh0cmFjZU5hbWVzcGFjZSwgXCJ0cmFjZTppc1wiLCBcIm9uXCIpO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIGNvbGxlY3RJbmZvKG9Ob2RlLCBvVmlzaXRvcilcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3VsdDogeyBwcm9wZXJ0aWVzOiB7fTsgY29udGV4dHM6IHt9IH0pIHtcblx0XHRcdFx0XHRjb25zdCBiUmVsZXZhbnQgPSBPYmplY3Qua2V5cyhyZXN1bHQuY29udGV4dHMpLmxlbmd0aCA+IDA7IC8vSWYgbm8gY29udGV4dCB3YXMgdXNlZCBpdCBpcyBub3QgcmVsZXZhbnQgc28gd2UgaWdub3JlIE9iamVjdC5rZXlzKHJlc3VsdC5wcm9wZXJ0aWVzKS5sZW5ndGhcblx0XHRcdFx0XHRpZiAoYlJlbGV2YW50KSB7XG5cdFx0XHRcdFx0XHRPYmplY3QuYXNzaWduKG9UcmFjZU1ldGFkYXRhQ29udGV4dCwgcmVzdWx0KTtcblx0XHRcdFx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dC52aWV3SW5mbyA9IG9WaXNpdG9yLmdldFZpZXdJbmZvKCk7XG5cdFx0XHRcdFx0XHRvVHJhY2VNZXRhZGF0YUNvbnRleHQubWFjcm9JbmZvID0gb1Zpc2l0b3IuZ2V0U2V0dGluZ3MoKVtcIl9tYWNyb0luZm9cIl07XG5cdFx0XHRcdFx0XHRvVHJhY2VNZXRhZGF0YUNvbnRleHQudHJhY2VJRCA9IGFUcmFjZUluZm8ubGVuZ3RoO1xuXHRcdFx0XHRcdFx0b05vZGUuc2V0QXR0cmlidXRlTlModHJhY2VOYW1lc3BhY2UsIFwidHJhY2U6dHJhY2VJRFwiLCBvVHJhY2VNZXRhZGF0YUNvbnRleHQudHJhY2VJRCk7XG5cdFx0XHRcdFx0XHRhVHJhY2VJbmZvLnB1c2gob1RyYWNlTWV0YWRhdGFDb250ZXh0KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0cmV0dXJuIG9WaXNpdG9yLnZpc2l0QXR0cmlidXRlcyhvTm9kZSk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRyZXR1cm4gb1Zpc2l0b3IudmlzaXRDaGlsZE5vZGVzKG9Ob2RlKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKGZ1bmN0aW9uIChleGM6IGFueSkge1xuXHRcdFx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dC5lcnJvciA9IHtcblx0XHRcdFx0XHRcdGV4Y2VwdGlvbjogZXhjLFxuXHRcdFx0XHRcdFx0bm9kZTogbmV3IFhNTFNlcmlhbGl6ZXIoKS5zZXJpYWxpemVUb1N0cmluZyhvTm9kZSlcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIG9WaXNpdG9yLnZpc2l0QXR0cmlidXRlcyhvTm9kZSkudGhlbihmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBvVmlzaXRvci52aXNpdENoaWxkTm9kZXMob05vZGUpO1xuXHRcdFx0fSk7XG5cdFx0fVxuXHR9IGNhdGNoIChleGM6IGFueSkge1xuXHRcdExvZy5lcnJvcihgRXJyb3Igd2hpbGUgdHJhY2luZyAnJHtvTm9kZT8ubm9kZU5hbWV9JzogJHtleGMubWVzc2FnZX1gLCBcIlRyYWNlSW5mb1wiKTtcblx0XHRyZXR1cm4gb1Zpc2l0b3IudmlzaXRBdHRyaWJ1dGVzKG9Ob2RlKS50aGVuKGZ1bmN0aW9uICgpIHtcblx0XHRcdHJldHVybiBvVmlzaXRvci52aXNpdENoaWxkTm9kZXMob05vZGUpO1xuXHRcdH0pO1xuXHR9XG59XG4vKipcbiAqIFJlZ2lzdGVyIHBhdGgtdGhyb3VnaCBYTUxQcmVwcm9jZXNzb3IgcGx1Z2luIGZvciBhbGwgbmFtZXNwYWNlc1xuICogZ2l2ZW4gYWJvdmUgaW4gYU5hbWVzcGFjZXNcbiAqL1xuaWYgKHRyYWNlSXNPbikge1xuXHRhTmFtZXNwYWNlcy5mb3JFYWNoKGZ1bmN0aW9uIChuYW1lc3BhY2U6IHN0cmluZykge1xuXHRcdG9DYWxsYmFja3NbbmFtZXNwYWNlXSA9IFhNTFByZXByb2Nlc3Nvci5wbHVnSW4ocmVzb2x2ZS5iaW5kKG5hbWVzcGFjZSksIG5hbWVzcGFjZSk7XG5cdH0pO1xufVxuLyoqXG4gKiBBZGRzIGluZm9ybWF0aW9uIGFib3V0IHRoZSBwcm9jZXNzaW5nIG9mIG9uZSBtYWNybyB0byB0aGUgY29sbGVjdGlvbi5cbiAqXG4gKiBAbmFtZSBzYXAuZmUubWFjcm9zLlRyYWNlSW5mby50cmFjZU1hY3JvQ2FsbHNcbiAqIEBwYXJhbSBzTmFtZSBNYWNybyBjbGFzcyBuYW1lXG4gKiBAcGFyYW0gb01ldGFkYXRhIERlZmluaXRpb24gZnJvbSAobWFjcm8pLm1ldGFkYXRhLmpzXG4gKiBAcGFyYW0gbUNvbnRleHRzIEF2YWlsYWJsZSBuYW1lZCBjb250ZXh0c1xuICogQHBhcmFtIG9Ob2RlXG4gKiBAcGFyYW0gb1Zpc2l0b3JcbiAqIEByZXR1cm5zIFRoZSB0cmFjZWQgbWV0YWRhdGEgY29udGV4dFxuICogQHByaXZhdGVcbiAqIEB1aTUtcmVzdHJpY3RlZFxuICogQHN0YXRpY1xuICovXG5mdW5jdGlvbiB0cmFjZU1hY3JvQ2FsbHMoc05hbWU6IHN0cmluZywgb01ldGFkYXRhOiBhbnksIG1Db250ZXh0czogYW55LCBvTm9kZTogYW55LCBvVmlzaXRvcjogYW55KSB7XG5cdHRyeSB7XG5cdFx0bGV0IGFNZXRhZGF0YUNvbnRleHRLZXlzID0gKG9NZXRhZGF0YS5tZXRhZGF0YUNvbnRleHRzICYmIE9iamVjdC5rZXlzKG9NZXRhZGF0YS5tZXRhZGF0YUNvbnRleHRzKSkgfHwgW107XG5cdFx0Y29uc3QgYVByb3BlcnRpZXMgPSAob01ldGFkYXRhLnByb3BlcnRpZXMgJiYgT2JqZWN0LmtleXMob01ldGFkYXRhLnByb3BlcnRpZXMpKSB8fCBbXTtcblx0XHRjb25zdCBtYWNyb0luZm8gPSBmbkNsb25lKG9WaXNpdG9yLmdldFNldHRpbmdzKClbXCJfbWFjcm9JbmZvXCJdIHx8IHt9KTtcblx0XHRjb25zdCBvVHJhY2VNZXRhZGF0YUNvbnRleHQ6IGFueSA9IHtcblx0XHRcdG1hY3JvOiBzTmFtZSxcblx0XHRcdG1ldGFEYXRhQ29udGV4dHM6IFtdIGFzIGFueVtdLFxuXHRcdFx0cHJvcGVydGllczoge31cblx0XHR9O1xuXG5cdFx0aWYgKGFNZXRhZGF0YUNvbnRleHRLZXlzLmxlbmd0aCA9PT0gMCkge1xuXHRcdFx0Ly9JbiBjYXNlIHRoZSBtYWNybyBoYXMgbm90IG1ldGFkYXRhLmpzIHdlIHRha2UgYWxsIG1ldGFkYXRhQ29udGV4dHMgZXhjZXB0IHRoaXNcblx0XHRcdGFNZXRhZGF0YUNvbnRleHRLZXlzID0gT2JqZWN0LmtleXMobUNvbnRleHRzKS5maWx0ZXIoZnVuY3Rpb24gKG5hbWU6IHN0cmluZykge1xuXHRcdFx0XHRyZXR1cm4gbmFtZSAhPT0gXCJ0aGlzXCI7XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRpZiAoIW9Ob2RlLmdldEF0dHJpYnV0ZShcInhtbG5zOnRyYWNlXCIpKSB7XG5cdFx0XHRvTm9kZS5zZXRBdHRyaWJ1dGVOUyh4bWxucywgXCJ4bWxuczp0cmFjZVwiLCB0cmFjZU5hbWVzcGFjZSk7XG5cdFx0fVxuXG5cdFx0aWYgKGFNZXRhZGF0YUNvbnRleHRLZXlzLmxlbmd0aCA+IDApIHtcblx0XHRcdGFNZXRhZGF0YUNvbnRleHRLZXlzLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IGFueSkge1xuXHRcdFx0XHRjb25zdCBvQ29udGV4dCA9IG1Db250ZXh0c1tzS2V5XSxcblx0XHRcdFx0XHRvTWV0YURhdGFDb250ZXh0OiBhbnkgPSBvQ29udGV4dCAmJiB7XG5cdFx0XHRcdFx0XHRuYW1lOiBzS2V5LFxuXHRcdFx0XHRcdFx0cGF0aDogb0NvbnRleHQuZ2V0UGF0aCgpXG5cdFx0XHRcdFx0XHQvL2RhdGE6IEpTT04uc3RyaW5naWZ5KG9Db250ZXh0LmdldE9iamVjdCgpLG51bGwsMilcblx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdGlmIChvTWV0YURhdGFDb250ZXh0KSB7XG5cdFx0XHRcdFx0b1RyYWNlTWV0YWRhdGFDb250ZXh0Lm1ldGFEYXRhQ29udGV4dHMucHVzaChvTWV0YURhdGFDb250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cblx0XHRcdGFQcm9wZXJ0aWVzLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IGFueSkge1xuXHRcdFx0XHRjb25zdCAvL29Qcm9wZXJ0eVNldHRpbmdzID0gb01ldGFkYXRhLnByb3BlcnRpZXNbc0tleV0sXG5cdFx0XHRcdFx0b1Byb3BlcnR5ID0gbUNvbnRleHRzLnRoaXMuZ2V0T2JqZWN0KHNLZXkpO1xuXHRcdFx0XHQvLyAob05vZGUuaGFzQXR0cmlidXRlKHNLZXkpICYmIG9Ob2RlLmdldEF0dHJpYnV0ZShzS2V5KSkgfHxcblx0XHRcdFx0Ly8gKG9Qcm9wZXJ0eVNldHRpbmdzLmhhc093blByb3BlcnR5KFwiZGVmYXVsdFZhbHVlXCIpICYmIG9Qcm9wZXJ0eVNldHRpbmdzLmRlZmluZSkgfHxcblx0XHRcdFx0Ly8gZmFsc2U7XG5cblx0XHRcdFx0aWYgKG9Qcm9wZXJ0eSkge1xuXHRcdFx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dC5wcm9wZXJ0aWVzW3NLZXldID0gb1Byb3BlcnR5O1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdG9UcmFjZU1ldGFkYXRhQ29udGV4dC52aWV3SW5mbyA9IG9WaXNpdG9yLmdldFZpZXdJbmZvKCk7XG5cdFx0XHRvVHJhY2VNZXRhZGF0YUNvbnRleHQudHJhY2VJRCA9IGFUcmFjZUluZm8ubGVuZ3RoO1xuXHRcdFx0bWFjcm9JbmZvLnBhcmVudE1hY3JvSUQgPSBtYWNyb0luZm8ubWFjcm9JRDtcblx0XHRcdG1hY3JvSW5mby5tYWNyb0lEID0gb1RyYWNlTWV0YWRhdGFDb250ZXh0LnRyYWNlSUQ7XG5cdFx0XHRvVHJhY2VNZXRhZGF0YUNvbnRleHQubWFjcm9JbmZvID0gbWFjcm9JbmZvO1xuXHRcdFx0b05vZGUuc2V0QXR0cmlidXRlTlModHJhY2VOYW1lc3BhY2UsIFwidHJhY2U6bWFjcm9JRFwiLCBvVHJhY2VNZXRhZGF0YUNvbnRleHQudHJhY2VJRCk7XG5cdFx0XHRhVHJhY2VJbmZvLnB1c2gob1RyYWNlTWV0YWRhdGFDb250ZXh0KTtcblx0XHRcdHJldHVybiBvVHJhY2VNZXRhZGF0YUNvbnRleHQ7XG5cdFx0fVxuXHR9IGNhdGNoIChleGMpIHtcblx0XHRyZXR1cm4ge1xuXHRcdFx0aXNFcnJvcjogdHJ1ZSxcblx0XHRcdGVycm9yOiBleGMsXG5cdFx0XHRuYW1lOiBzTmFtZSxcblx0XHRcdG5vZGU6IG5ldyBYTUxTZXJpYWxpemVyKCkuc2VyaWFsaXplVG9TdHJpbmcob05vZGUpLFxuXHRcdFx0Y29udGV4dFBhdGg6IG9WaXNpdG9yPy5nZXRDb250ZXh0KCk/LmdldFBhdGgoKVxuXHRcdH07XG5cdH1cbn1cbi8qKlxuICogUmV0dXJucyB0aGUgZ2xvYmFsbHkgc3RvcmVkIHRyYWNlIGluZm9ybWF0aW9uIGZvciB0aGUgbWFjcm8gb3JcbiAqIGNvbnRyb2wgbWFya2VkIHdpdGggdGhlIGdpdmVuIGlkLlxuICpcbiAqIFJldHVybnMgYWxsIHRyYWNlIGluZm9ybWF0aW9uIGlmIG5vIGlkIGlzIHNwZWNpZmllZFxuICpcbiAqXG48cHJlPlN0cnVjdHVyZSBmb3IgYSBtYWNyb1xue1xuXHRtYWNybzogJycsIC8vbmFtZSBvZiBtYWNyb1xuXHRtZXRhRGF0YUNvbnRleHRzOiBbIC8vUHJvcGVydGllcyBvZiB0eXBlIHNhcC51aS5tb2RlbC5Db250ZXh0XG5cdFx0e1xuXHRcdFx0bmFtZTogJycsIC8vY29udGV4dCBwcm9wZXJ0eSBuYW1lIC8ga2V5XG5cdFx0XHRwYXRoOiAnJywgLy9mcm9tIG9Db250ZXh0LmdldFBhdGgoKVxuXHRcdH1cblx0XSxcblx0cHJvcGVydGllczogeyAvLyBPdGhlciBwcm9wZXJ0aWVzIHdoaWNoIGJlY29tZSBwYXJ0IG9mIHt0aGlzPn1cblx0XHRwcm9wZXJ0eTE6IHZhbHVlLFxuXHRcdHByb3BlcnR5MjogdmFsdWVcblx0fVxuXHR2aWV3SW5mbzoge1xuXHRcdHZpZXdJbmZvOiB7fSAvLyBBcyBzcGVjaWZpZWQgaW4gdmlldyBvciBmcmFnZW1lbnQgY3JlYXRpb25cblx0fSxcblx0dHJhY2VJRDogdGhpcy5pbmRleCwgLy9JRCBmb3IgdGhpcyB0cmFjZSBpbmZvcm1hdGlvbixcblx0bWFjcm9JbmZvOiB7XG5cdFx0bWFjcm9JRDogaW5kZXgsIC8vIHRyYWNlSUQgb2YgdGhpcyBtYWNybyAocmVkdW5kYW50IGZvciBtYWNyb3MpXG5cdFx0cGFyZW50TWFjcm9JRCwgaW5kZXggLy8gdHJhY2VJRCBvZiB0aGUgcGFyZW50IG1hY3JvIChpZiBpdCBoYXMgYSBwYXJlbnQpXG5cdH1cbn1cblN0cnVjdHVyZSBmb3IgYSBjb250cm9sXG57XG5cdGNvbnRyb2w6ICcnLCAvL2NvbnRyb2wgY2xhc3Ncblx0cHJvcGVydGllczogeyAvLyBPdGhlciBwcm9wZXJ0aWVzIHdoaWNoIGJlY29tZSBwYXJ0IG9mIHt0aGlzPn1cblx0XHRwcm9wZXJ0eTE6IHtcblx0XHRcdG9yaWdpbmFsVmFsdWU6ICcnLCAvL1ZhbHVlIGJlZm9yZSB0ZW1wbGF0aW5nXG5cdFx0XHRyZXNvbHZlZFZhbHVlOiAnJyAvL1ZhbHVlIGFmdGVyIHRlbXBsYXRpbmdcblx0XHR9XG5cdH1cblx0Y29udGV4dHM6IHsgLy9Nb2RlbHMgYW5kIENvbnRleHRzIHVzZWQgZHVyaW5nIHRlbXBsYXRpbmdcblx0XHQvLyBNb2RlbCBvciBjb250ZXh0IG5hbWUgdXNlZCBmb3IgdGhpcyBjb250cm9sXG5cdFx0bW9kZWxOYW1lMTogeyAvLyBGb3IgT0RhdGFNZXRhTW9kZWxcblx0XHRcdHBhdGgxOiB7XG5cdFx0XHRcdHBhdGg6ICcnLCAvL2Fic29sdXQgcGF0aCB3aXRoaW4gbWV0YW1vZGVsXG5cdFx0XHRcdGRhdGE6ICcnLCAvL2RhdGEgb2YgcGF0aCB1bmxlc3MgdHlwZSBPYmplY3Rcblx0XHRcdH1cblx0XHRtb2RlbE5hbWUyOiB7XG5cdFx0XHQvLyBmb3Igb3RoZXIgbW9kZWwgdHlwZXNcblx0XHRcdHtcblx0XHRcdFx0cHJvcGVydHkxOiB2YWx1ZSxcblx0XHRcdFx0cHJvcGVydHkyOiB2YWx1ZVxuXHRcdFx0fVxuXHRcdFx0Ly8gSW4gY2FzZSBiaW5kaW5nIGNhbm5vdCBiZSByZXNvbHZlZCAtPiBtYXJrIGFzIHJ1bnRpbWUgYmluZGluZ1xuXHRcdFx0Ly8gVGhpcyBpcyBub3QgYWx3YXlzIHRydWUsIGUuZy4gaW4gY2FzZSB0aGUgcGF0aCBpcyBtZXRhbW9kZWxwYXRoXG5cdFx0XHR7XG5cdFx0XHRcdFwiYmluZGluZ0ZvclwiOiBcIlJ1bnRpbWVcIlxuXHRcdFx0fVxuXHRcdH1cblx0fSxcblx0dmlld0luZm86IHtcblx0XHR2aWV3SW5mbzoge30gLy8gQXMgc3BlY2lmaWVkIGluIHZpZXcgb3IgZnJhZ2VtZW50IGNyZWF0aW9uXG5cdH0sXG5cdG1hY3JvSW5mbzoge1xuXHRcdG1hY3JvSUQ6IGluZGV4LCAvLyB0cmFjZUlEIG9mIHRoZSBtYWNybyB0aGF0IGNyZWF0ZWQgdGhpcyBjb250cm9sXG5cdFx0cGFyZW50TWFjcm9JRCwgaW5kZXggLy8gdHJhY2VJRCBvZiB0aGUgbWFjcm8ncyBwYXJlbnQgbWFjcm9cblx0fSxcblx0dHJhY2VJRDogdGhpcy5pbmRleCAvL0lEIGZvciB0aGlzIHRyYWNlIGluZm9ybWF0aW9uXG59PC9wcmU+LlxuICpcbiAqIEBmdW5jdGlvblxuICogQG5hbWUgc2FwLmZlLm1hY3Jvcy5UcmFjZUluZm8uZ2V0VHJhY2VJbmZvXG4gKiBAcGFyYW0gaWQgVHJhY2VJbmZvIGlkXG4gKiBAcmV0dXJucyBPYmplY3QgLyBBcnJheSBmb3IgVHJhY2VJbmZvXG4gKiBAcHJpdmF0ZVxuICogQHN0YXRpY1xuICovXG5mdW5jdGlvbiBnZXRUcmFjZUluZm8oaWQ6IG51bWJlcikge1xuXHRpZiAoaWQpIHtcblx0XHRyZXR1cm4gYVRyYWNlSW5mb1tpZF07XG5cdH1cblx0Y29uc3QgYUVycm9ycyA9IGFUcmFjZUluZm8uZmlsdGVyKGZ1bmN0aW9uICh0cmFjZUluZm86IGFueSkge1xuXHRcdHJldHVybiB0cmFjZUluZm8uZXJyb3I7XG5cdH0pO1xuXHRyZXR1cm4gKGFFcnJvcnMubGVuZ3RoID4gMCAmJiBhRXJyb3JzKSB8fCBhVHJhY2VJbmZvO1xufVxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgVHJhY2VJbmZvIGlzIGFjdGl2ZS5cbiAqXG4gKiBAZnVuY3Rpb25cbiAqIEBuYW1lIHNhcC5mZS5tYWNyb3MuVHJhY2VJbmZvLmlzVHJhY2VJbmZvQWN0aXZlXG4gKiBAcmV0dXJucyBgdHJ1ZWAgd2hlbiBhY3RpdmVcbiAqIEBwcml2YXRlXG4gKiBAc3RhdGljXG4gKi9cbmZ1bmN0aW9uIGlzVHJhY2VJbmZvQWN0aXZlKCkge1xuXHRyZXR1cm4gdHJhY2VJc09uO1xufVxuLyoqXG4gKiBAdHlwZWRlZiBzYXAuZmUubWFjcm9zLlRyYWNlSW5mb1xuICogVHJhY2VJbmZvIGZvciBTQVAgRmlvcmkgZWxlbWVudHNcbiAqXG4gKiBPbmNlIHRyYWNlcyBpcyBzd2l0Y2hlZCwgaW5mb3JtYXRpb24gYWJvdXQgbWFjcm9zIGFuZCBjb250cm9sc1xuICogdGhhdCBhcmUgcHJvY2Vzc2VkIGR1cmluZyB4bWwgcHJlcHJvY2Vzc2luZyAoIEBzZWUge0BsaW5rIHNhcC51aS5jb3JlLnV0aWwuWE1MUHJlcHJvY2Vzc29yfSlcbiAqIHdpbGwgYmUgY29sbGVjdGVkIHdpdGhpbiB0aGlzIHNpbmdsZXRvblxuICogQG5hbWVzcGFjZVxuICogQHByaXZhdGVcbiAqIEBnbG9iYWxcbiAqIEBleHBlcmltZW50YWwgVGhpcyBtb2R1bGUgaXMgb25seSBmb3IgZXhwZXJpbWVudGFsIHVzZSEgPGJyLz48Yj5UaGlzIGlzIG9ubHkgYSBQT0MgYW5kIG1heWJlIGRlbGV0ZWQ8L2I+XG4gKiBAc2luY2UgMS43NC4wXG4gKi9cbmV4cG9ydCBkZWZhdWx0IHtcblx0aXNUcmFjZUluZm9BY3RpdmU6IGlzVHJhY2VJbmZvQWN0aXZlLFxuXHR0cmFjZU1hY3JvQ2FsbHM6IHRyYWNlTWFjcm9DYWxscyxcblx0Z2V0VHJhY2VJbmZvOiBnZXRUcmFjZUluZm9cbn07XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7RUFHQTtFQUNBLElBQU1BLFVBQWlCLEdBQUc7SUFDekI7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUE1REMsQ0E2REE7RUFDRCxJQUFNQyxjQUFjLEdBQUcsdURBQXVEO0lBQzdFQyxLQUFLLEdBQUcsK0JBQStCO0lBQ3ZDO0FBQ0Q7QUFDQTtJQUNDQyxTQUFTLEdBQUdDLFFBQVEsQ0FBQ0MsTUFBTSxDQUFDQyxPQUFPLENBQUMsNEJBQTRCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDdEU7QUFDRDtBQUNBO0lBQ0NDLFdBQVcsR0FBRyxDQUNiLE9BQU8sRUFDUCxV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