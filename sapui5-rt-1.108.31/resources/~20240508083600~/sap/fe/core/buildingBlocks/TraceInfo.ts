import Log from "sap/base/Log";
import ManagedObject from "sap/ui/base/ManagedObject";
import XMLPreprocessor from "sap/ui/core/util/XMLPreprocessor";
//Trace information
const aTraceInfo: any[] = [
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
const traceNamespace = "http://schemas.sap.com/sapui5/extension/sap.fe.info/1",
	xmlns = "http://www.w3.org/2000/xmlns/",
	/**
	 * Switch is currently based on url parameter
	 */
	traceIsOn = location.search.indexOf("sap-ui-xx-feTraceInfo=true") > -1,
	/**
	 * Specify all namespaces that shall be traced during templating
	 */
	aNamespaces = [
		"sap.m",
		"sap.uxap",
		"sap.ui.unified",
		"sap.f",
		"sap.ui.table",
		"sap.suite.ui.microchart",
		"sap.ui.layout.form",
		"sap.ui.mdc",
		"sap.ui.mdc.link",
		"sap.ui.mdc.field",
		"sap.fe.fpm"
	],
	oCallbacks: any = {};

function fnClone(oObject: object) {
	return JSON.parse(JSON.stringify(oObject));
}
function collectContextInfo(sValue: any, oContexts: any, oVisitor: any, oNode: any) {
	let aContexts;
	const aPromises: any[] = [];
	try {
		aContexts = (ManagedObject as any).bindingParser(sValue, undefined, false, true) || [];
	} catch (e) {
		aContexts = [];
	}
	aContexts = Array.isArray(aContexts) ? aContexts : [aContexts];
	aContexts
		.filter(function (oContext: any) {
			return oContext.path || oContext.parts;
		})
		.forEach(function (oContext: any) {
			const aParts = oContext.parts || [oContext];
			aParts
				.filter(function (oPartContext: any) {
					return oPartContext.path;
				})
				.forEach(function (oPartContext: any) {
					const oModel = (oContexts[oPartContext.model] = oContexts[oPartContext.model] || {});
					const sSimplePath =
						oPartContext.path.indexOf(">") < 0
							? (oPartContext.model && `${oPartContext.model}>`) + oPartContext.path
							: oPartContext.path;
					let oRealContext: any;
					let aInnerParts;

					if (typeof oPartContext.model === "undefined" && sSimplePath.indexOf(">") > -1) {
						aInnerParts = sSimplePath.split(">");
						oPartContext.model = aInnerParts[0];
						oPartContext.path = aInnerParts[1];
					}
					try {
						oRealContext = oVisitor.getContext(sSimplePath);
						aPromises.push(
							oVisitor
								.getResult(`{${sSimplePath}}`, oNode)
								.then(function (oResult: any) {
									if (oRealContext.getModel().getMetadata().getName() === "sap.ui.model.json.JSONModel") {
										if (!oResult.oModel) {
											oModel[oPartContext.path] = oResult; //oRealContext.getObject(oContext.path);
										} else {
											oModel[oPartContext.path] = `Context from ${oResult.getPath()}`;
										}
									} else {
										oModel[oPartContext.path] = {
											path: oRealContext.getPath(),
											data: typeof oResult === "object" ? "[ctrl/cmd-click] on path to see data" : oResult
										};
									}
								})
								.catch(function () {
									oModel[oPartContext.path] = {
										bindingFor: "Runtime"
									};
								})
						);
					} catch (exc) {
						oModel[oPartContext.path] = {
							bindingFor: "Runtime"
						};
					}
				});
		});
	return Promise.all(aPromises);
}
function fillAttributes(oResults: any, oAttributes: any, sName: any, sValue: any) {
	return oResults
		.then(function (result: any) {
			oAttributes[sName] =
				sValue !== result
					? {
							originalValue: sValue,
							resolvedValue: result
					  }
					: sValue;
		})
		.catch(function (e: any) {
			oAttributes[sName] = {
				originalValue: sValue,
				error: (e.stack && e.stack.toString()) || e
			};
		});
}
function collectInfo(oNode: any, oVisitor: any) {
	const oAttributes = {};
	const aPromises = [];
	const oContexts = {};
	let oResults;
	for (let i = oNode.attributes.length >>> 0; i--; ) {
		const oAttribute = oNode.attributes[i],
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
		return { properties: oAttributes, contexts: oContexts };
	});
}
function resolve(oNode: any, oVisitor: any) {
	try {
		const sControlName = oNode.nodeName.split(":")[1] || oNode.nodeName,
			bIsControl = /^[A-Z]/.test(sControlName),
			oTraceMetadataContext: any = {
				control: `${oNode.namespaceURI}.${oNode.nodeName.split(":")[1] || oNode.nodeName}`
			};

		if (bIsControl) {
			const firstChild = [...oNode.ownerDocument.children].find((node) => !node.nodeName.startsWith("#"));
			if (firstChild && !firstChild.getAttribute("xmlns:trace")) {
				firstChild.setAttributeNS(xmlns, "xmlns:trace", traceNamespace);
				firstChild.setAttributeNS(traceNamespace, "trace:is", "on");
			}
			return collectInfo(oNode, oVisitor)
				.then(function (result: { properties: {}; contexts: {} }) {
					const bRelevant = Object.keys(result.contexts).length > 0; //If no context was used it is not relevant so we ignore Object.keys(result.properties).length
					if (bRelevant) {
						Object.assign(oTraceMetadataContext, result);
						oTraceMetadataContext.viewInfo = oVisitor.getViewInfo();
						oTraceMetadataContext.macroInfo = oVisitor.getSettings()["_macroInfo"];
						oTraceMetadataContext.traceID = aTraceInfo.length;
						oNode.setAttributeNS(traceNamespace, "trace:traceID", oTraceMetadataContext.traceID);
						aTraceInfo.push(oTraceMetadataContext);
					}
					return oVisitor.visitAttributes(oNode);
				})
				.then(function () {
					return oVisitor.visitChildNodes(oNode);
				})
				.catch(function (exc: any) {
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
	} catch (exc: any) {
		Log.error(`Error while tracing '${oNode?.nodeName}': ${exc.message}`, "TraceInfo");
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
	aNamespaces.forEach(function (namespace: string) {
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
function traceMacroCalls(sName: string, oMetadata: any, mContexts: any, oNode: any, oVisitor: any) {
	try {
		let aMetadataContextKeys = (oMetadata.metadataContexts && Object.keys(oMetadata.metadataContexts)) || [];
		const aProperties = (oMetadata.properties && Object.keys(oMetadata.properties)) || [];
		const macroInfo = fnClone(oVisitor.getSettings()["_macroInfo"] || {});
		const oTraceMetadataContext: any = {
			macro: sName,
			metaDataContexts: [] as any[],
			properties: {}
		};

		if (aMetadataContextKeys.length === 0) {
			//In case the macro has not metadata.js we take all metadataContexts except this
			aMetadataContextKeys = Object.keys(mContexts).filter(function (name: string) {
				return name !== "this";
			});
		}

		if (!oNode.getAttribute("xmlns:trace")) {
			oNode.setAttributeNS(xmlns, "xmlns:trace", traceNamespace);
		}

		if (aMetadataContextKeys.length > 0) {
			aMetadataContextKeys.forEach(function (sKey: any) {
				const oContext = mContexts[sKey],
					oMetaDataContext: any = oContext && {
						name: sKey,
						path: oContext.getPath()
						//data: JSON.stringify(oContext.getObject(),null,2)
					};

				if (oMetaDataContext) {
					oTraceMetadataContext.metaDataContexts.push(oMetaDataContext);
				}
			});

			aProperties.forEach(function (sKey: any) {
				const //oPropertySettings = oMetadata.properties[sKey],
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
		return {
			isError: true,
			error: exc,
			name: sName,
			node: new XMLSerializer().serializeToString(oNode),
			contextPath: oVisitor?.getContext()?.getPath()
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
function getTraceInfo(id: number) {
	if (id) {
		return aTraceInfo[id];
	}
	const aErrors = aTraceInfo.filter(function (traceInfo: any) {
		return traceInfo.error;
	});
	return (aErrors.length > 0 && aErrors) || aTraceInfo;
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
export default {
	isTraceInfoActive: isTraceInfoActive,
	traceMacroCalls: traceMacroCalls,
	getTraceInfo: getTraceInfo
};
