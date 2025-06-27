/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/ModelHelper", "sap/m/library", "sap/ui/Device", "sap/ui/mdc/enum/EditMode", "sap/ui/model/Context", "sap/ui/model/odata/v4/AnnotationHelper"], function (Log, CommonUtils, BindingToolkit, ModelHelper, mLibrary, Device, EditMode, Context, ODataModelAnnotationHelper) {
  "use strict";

  var system = Device.system;
  var ref = BindingToolkit.ref;
  var fn = BindingToolkit.fn;
  var compileExpression = BindingToolkit.compileExpression;
  var ValueColor = mLibrary.ValueColor;
  var CommonHelper = {
    useFieldValueHelp: function () {
      // Switch from (new) mdc:ValueHelp to (old) mdcField:FieldValueHelp
      return location.href.indexOf("sap-fe-oldFieldValueHelp=true") > -1;
    },
    getPathToKey: function (oCtx) {
      return oCtx.getObject();
    },
    /**
     * Determines if a field is visible.
     *
     * @param target Target instance
     * @param oInterface Interface instance
     * @returns Returns true, false, or expression with path
     */
    isVisible: function (target, oInterface) {
      var oModel = oInterface.context.getModel(),
        sPropertyPath = oInterface.context.getPath(),
        oAnnotations = oModel.getObject("".concat(sPropertyPath, "@")),
        hidden = oAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
      return typeof hidden === "object" ? "{= !${" + hidden.$Path + "} }" : !hidden;
    },
    /**
     * Determine if the action opens up a dialog.
     *
     * @param oActionContext
     * @param oInterface
     * @returns `true` if a dialog is needed
     */
    isDialog: function (oActionContext, oInterface) {
      var oModel = oInterface.context.getModel(),
        sPropertyPath = oInterface.context.getPath(),
        isCritical = oModel.getObject("".concat(sPropertyPath, "/@$ui5.overload@com.sap.vocabularies.Common.v1.IsActionCritical"));
      if (isCritical) {
        return "Dialog";
      } else if (oActionContext) {
        var oAction = Array.isArray(oActionContext) ? oActionContext[0] : oActionContext;
        if (oAction.$Parameter && oAction.$Parameter.length > 1) {
          return "Dialog";
        } else {
          return "None";
        }
      }
    },
    /**
     * Determine if field is editable.
     *
     * @param target Target instance
     * @param oInterface Interface instance
     * @returns A Binding Expression to determine if a field should be editable or not.
     */
    getParameterEditMode: function (target, oInterface) {
      var oModel = oInterface.context.getModel(),
        sPropertyPath = oInterface.context.getPath(),
        oAnnotations = oModel.getObject("".concat(sPropertyPath, "@")),
        fieldControl = oAnnotations["@com.sap.vocabularies.Common.v1.FieldControl"],
        immutable = oAnnotations["@Org.OData.Core.V1.Immutable"],
        computed = oAnnotations["@Org.OData.Core.V1.Computed"];
      var sEditMode = EditMode.Editable;
      if (immutable || computed) {
        sEditMode = EditMode.ReadOnly;
      } else if (fieldControl) {
        if (fieldControl.$EnumMember) {
          if (fieldControl.$EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/ReadOnly") {
            sEditMode = EditMode.ReadOnly;
          }
          if (fieldControl.$EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Inapplicable" || fieldControl.$EnumMember === "com.sap.vocabularies.Common.v1.FieldControlType/Hidden") {
            sEditMode = EditMode.Disabled;
          }
        }
        if (fieldControl.$Path) {
          sEditMode = "{= %{" + fieldControl.$Path + "} < 3 ? (%{" + fieldControl.$Path + "} === 0 ? '" + EditMode.Disabled + "' : '" + EditMode.ReadOnly + "') : '" + EditMode.Editable + "'}";
        }
      }
      return sEditMode;
    },
    /**
     * Get the complete metapath to the target.
     *
     * @param target
     * @param oInterface
     * @returns The metapath
     */
    getMetaPath: function (target, oInterface) {
      return oInterface && oInterface.context && oInterface.context.getPath() || undefined;
    },
    isDesktop: function () {
      return system.desktop === true;
    },
    getTargetCollection: function (oContext, navCollection) {
      var sPath = oContext.getPath();
      if (oContext.getMetadata().getName() === "sap.ui.model.Context" && (oContext.getObject("$kind") === "EntitySet" || oContext.getObject("$ContainsTarget") === true)) {
        return sPath;
      }
      if (oContext.getModel) {
        sPath = oContext.getModel().getMetaPath && oContext.getModel().getMetaPath(sPath) || oContext.getModel().getMetaModel().getMetaPath(sPath);
      }
      //Supporting sPath of any format, either '/<entitySet>/<navigationCollection>' <OR> '/<entitySet>/$Type/<navigationCollection>'
      var aParts = sPath.split("/").filter(function (sPart) {
        return sPart && sPart != "$Type";
      }); //filter out empty strings and parts referring to '$Type'
      var entitySet = "/".concat(aParts[0]);
      if (aParts.length === 1) {
        return entitySet;
      }
      var navigationCollection = navCollection === undefined ? aParts.slice(1).join("/$NavigationPropertyBinding/") : navCollection;
      return "".concat(entitySet, "/$NavigationPropertyBinding/").concat(navigationCollection); // used in gotoTargetEntitySet method in the same file
    },

    isPropertyFilterable: function (property, oInterface, oDataField) {
      var oModel = oInterface.context.getModel(),
        sPropertyPath = oInterface.context.getPath(),
        // LoacationPath would be the prefix of sPropertyPath, example: sPropertyPath = '/Customer/Set/Name' -> sPropertyLocationPath = '/Customer/Set'
        sPropertyLocationPath = CommonHelper.getLocationForPropertyPath(oModel, sPropertyPath),
        sProperty = sPropertyPath.replace("".concat(sPropertyLocationPath, "/"), "");
      if (oDataField && (oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction" || oDataField.$Type === "com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation")) {
        return false;
      }
      return CommonUtils.isPropertyFilterable(oModel, sPropertyLocationPath, sProperty);
    },
    getLocationForPropertyPath: function (oModel, sPropertyPath) {
      var iLength;
      var sCollectionPath = sPropertyPath.slice(0, sPropertyPath.lastIndexOf("/"));
      if (oModel.getObject("".concat(sCollectionPath, "/$kind")) === "EntityContainer") {
        iLength = sCollectionPath.length + 1;
        sCollectionPath = sPropertyPath.slice(iLength, sPropertyPath.indexOf("/", iLength));
      }
      return sCollectionPath;
    },
    gotoActionParameter: function (oContext) {
      var sPath = oContext.getPath(),
        sPropertyName = oContext.getObject("".concat(sPath, "/$Name"));
      return CommonUtils.getParameterPath(sPath, sPropertyName);
    },
    /**
     * Returns the entity set name from the entity type name.
     *
     * @param oMetaModel OData v4 metamodel instance
     * @param sEntityType EntityType of the actiom
     * @returns The EntitySet of the bound action
     * @private
     * @ui5-restricted
     */
    getEntitySetName: function (oMetaModel, sEntityType) {
      var oEntityContainer = oMetaModel.getObject("/");
      for (var key in oEntityContainer) {
        if (typeof oEntityContainer[key] === "object" && oEntityContainer[key].$Type === sEntityType) {
          return key;
        }
      }
    },
    /**
     * Returns the metamodel path correctly for bound actions if used with bReturnOnlyPath as true,
     * else returns an object which has 3 properties related to the action. They are the entity set name,
     * the $Path value of the OperationAvailable annotation and the binding parameter name. If
     * bCheckStaticValue is true, returns the static value of OperationAvailable annotation, if present.
     * e.g. for bound action someNameSpace.SomeBoundAction
     * of entity set SomeEntitySet, the string "/SomeEntitySet/someNameSpace.SomeBoundAction" is returned.
     *
     * @param oAction The context object of the action
     * @param bReturnOnlyPath If false, additional info is returned along with metamodel path to the bound action
     * @param sActionName The name of the bound action of the form someNameSpace.SomeBoundAction
     * @param bCheckStaticValue If true, the static value of OperationAvailable is returned, if present
     * @returns The string or object as specified by bReturnOnlyPath
     * @private
     * @ui5-restricted
     */
    getActionPath: function (oAction, bReturnOnlyPath, sActionName, bCheckStaticValue) {
      var sContextPath = oAction.getPath().split("/@")[0];
      sActionName = !sActionName ? oAction.getObject(oAction.getPath()) : sActionName;
      if (sActionName && sActionName.indexOf("(") > -1) {
        // action bound to another entity type
        sActionName = sActionName.split("(")[0];
      } else if (oAction.getObject(sContextPath)) {
        // TODO: this logic sounds wrong, to be corrected
        var sEntityTypeName = oAction.getObject(sContextPath).$Type;
        var sEntityName = this.getEntitySetName(oAction.getModel(), sEntityTypeName);
        if (sEntityName) {
          sContextPath = "/".concat(sEntityName);
        }
      } else {
        return sContextPath;
      }
      if (bCheckStaticValue) {
        return oAction.getObject("".concat(sContextPath, "/").concat(sActionName, "@Org.OData.Core.V1.OperationAvailable"));
      }
      if (bReturnOnlyPath) {
        return "".concat(sContextPath, "/").concat(sActionName);
      } else {
        return {
          sContextPath: sContextPath,
          sProperty: oAction.getObject("".concat(sContextPath, "/").concat(sActionName, "@Org.OData.Core.V1.OperationAvailable/$Path")),
          sBindingParameter: oAction.getObject("".concat(sContextPath, "/").concat(sActionName, "/@$ui5.overload/0/$Parameter/0/$Name"))
        };
      }
    },
    getNavigationContext: function (oContext) {
      return ODataModelAnnotationHelper.getNavigationPath(oContext.getPath());
    },
    /**
     * Returns the path without the entity type (potentially first) and property (last) part (optional).
     * The result can be an empty string if it is a simple direct property.
     *
     * If and only if the given property path starts with a slash (/), it is considered that the entity type
     * is part of the path and will be stripped away.
     *
     * @param sPropertyPath
     * @param bKeepProperty
     * @returns The navigation path
     */
    getNavigationPath: function (sPropertyPath, bKeepProperty) {
      var bStartsWithEntityType = sPropertyPath.startsWith("/");
      var aParts = sPropertyPath.split("/").filter(function (part) {
        return !!part;
      });
      if (bStartsWithEntityType) {
        aParts.shift();
      }
      if (!bKeepProperty) {
        aParts.pop();
      }
      return aParts.join("/");
    },
    /**
     * Returns the correct metamodel path for bound actions.
     *
     * Since this method is called irrespective of the action type, this will be applied to unbound actions.
     * In such a case, if an incorrect path is returned, it is ignored during templating.
     *
     * Example: for the bound action someNameSpace.SomeBoundAction of entity set SomeEntitySet,
     * the string "/SomeEntitySet/someNameSpace.SomeBoundAction" is returned.
     *
     * @function
     * @static
     * @name sap.fe.macros.CommonHelper.getActionContext
     * @memberof sap.fe.macros.CommonHelper
     * @param oAction Context object for the action
     * @returns Correct metamodel path for bound and incorrect path for unbound actions
     * @private
     * @ui5-restricted
     */
    getActionContext: function (oAction) {
      return CommonHelper.getActionPath(oAction, true);
    },
    /**
     * Returns the metamodel path correctly for overloaded bound actions. For unbound actions,
     * the incorrect path is returned, but ignored during templating.
     * e.g. for bound action someNameSpace.SomeBoundAction of entity set SomeEntitySet,
     * the string "/SomeEntitySet/someNameSpace.SomeBoundAction/@$ui5.overload/0" is returned.
     *
     * @function
     * @static
     * @name sap.fe.macros.CommonHelper.getPathToBoundActionOverload
     * @memberof sap.fe.macros.CommonHelper
     * @param oAction The context object for the action
     * @returns The correct metamodel path for bound action overload and incorrect path for unbound actions
     * @private
     * @ui5-restricted
     */
    getPathToBoundActionOverload: function (oAction) {
      var sPath = CommonHelper.getActionPath(oAction, true);
      return "".concat(sPath, "/@$ui5.overload/0");
    },
    /**
     * Returns the string with single quotes.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sValue Some string that needs to be converted into single quotes
     * @param [bEscape] Should the string be escaped beforehand
     * @returns - String with single quotes
     */
    addSingleQuotes: function (sValue, bEscape) {
      if (bEscape && sValue) {
        sValue = this.escapeSingleQuotes(sValue);
      }
      return "'".concat(sValue, "'");
    },
    /**
     * Returns the string with escaped single quotes.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sValue Some string that needs escaping of single quotes
     * @returns - String with escaped single quotes
     */
    escapeSingleQuotes: function (sValue) {
      return sValue.replace(/[']/g, "\\'");
    },
    /**
     * Returns the function string
     * The first argument of generateFunction is name of the generated function string.
     * Remaining arguments of generateFunction are arguments of the newly generated function string.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sFuncName Some string for the function name
     * @param args The remaining arguments
     * @returns - Function string depends on arguments passed
     */
    generateFunction: function (sFuncName) {
      var sParams = "";
      for (var i = 0; i < (arguments.length <= 1 ? 0 : arguments.length - 1); i++) {
        sParams += i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];
        if (i < (arguments.length <= 1 ? 0 : arguments.length - 1) - 1) {
          sParams += ", ";
        }
      }
      var sFunction = "".concat(sFuncName, "()");
      if (sParams) {
        sFunction = "".concat(sFuncName, "(").concat(sParams, ")");
      }
      return sFunction;
    },
    /*
     * Returns the visibility expression for datapoint title/link
     *
     * @function
     * @param {string} [sPath] annotation path of data point or Microchart
     * @param {boolean} [bLink] true if link visibility is being determined, false if title visibility is being determined
     * @param {boolean} [bFieldVisibility] true if field is vsiible, false otherwise
     * @returns  {string} sVisibilityExp Used to get the  visibility binding for DataPoints title in the Header.
     *
     */

    getHeaderDataPointLinkVisibility: function (sPath, bLink, bFieldVisibility) {
      var sVisibilityExp;
      if (bFieldVisibility) {
        sVisibilityExp = bLink ? "{= ${internal>isHeaderDPLinkVisible/" + sPath + "} === true && " + bFieldVisibility + "}" : "{= ${internal>isHeaderDPLinkVisible/" + sPath + "} !== true && " + bFieldVisibility + "}";
      } else {
        sVisibilityExp = bLink ? "{= ${internal>isHeaderDPLinkVisible/" + sPath + "} === true}" : "{= ${internal>isHeaderDPLinkVisible/" + sPath + "} !== true}";
      }
      return sVisibilityExp;
    },
    /**
     * Converts object to string(different from JSON.stringify or.toString).
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param oParams Some object
     * @returns - Object string
     */
    objectToString: function (oParams) {
      var iNumberOfKeys = Object.keys(oParams).length,
        sParams = "";
      for (var sKey in oParams) {
        var sValue = oParams[sKey];
        if (sValue && typeof sValue === "object") {
          sValue = this.objectToString(sValue);
        }
        sParams += "".concat(sKey, ": ").concat(sValue);
        if (iNumberOfKeys > 1) {
          --iNumberOfKeys;
          sParams += ", ";
        }
      }
      return "{ ".concat(sParams, "}");
    },
    /**
     * Removes escape characters (\) from an expression.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sExpression An expression with escape characters
     * @returns Expression string without escape characters or undefined
     */
    removeEscapeCharacters: function (sExpression) {
      return sExpression ? sExpression.replace(/\\?\\([{}])/g, "$1") : undefined;
    },
    /**
     * Makes updates to a stringified object so that it works properly in a template by adding ui5Object:true.
     *
     * @param sStringified
     * @returns The updated string representation of the object
     */
    stringifyObject: function (sStringified) {
      if (!sStringified) {
        return undefined;
      } else {
        var oObject = JSON.parse(sStringified);
        if (typeof oObject === "object" && !Array.isArray(oObject)) {
          var oUI5Object = {
            ui5object: true
          };
          Object.assign(oUI5Object, oObject);
          return JSON.stringify(oUI5Object);
        } else {
          var sType = Array.isArray(oObject) ? "Array" : typeof oObject;
          Log.error("Unexpected object type in stringifyObject (".concat(sType, ") - only works with object"));
          throw new Error("stringifyObject only works with objects!");
        }
      }
    },
    /**
     * Create a string representation of the given data, taking care that it is not treated as a binding expression.
     *
     * @param vData The data to stringify
     * @returns The string representation of the data.
     */
    stringifyCustomData: function (vData) {
      var oObject = {
        ui5object: true
      };
      oObject["customData"] = vData instanceof Context ? vData.getObject() : vData;
      return JSON.stringify(oObject);
    },
    /**
     * Parses the given data, potentially unwraps the data.
     *
     * @param vData The data to parse
     * @returns The result of the data parsing
     */
    parseCustomData: function (vData) {
      vData = typeof vData === "string" ? JSON.parse(vData) : vData;
      if (vData && vData.hasOwnProperty("customData")) {
        return vData["customData"];
      }
      return vData;
    },
    /**
     * @function
     * @name _getDraftAdministrativeDataType
     * @param oMetaModel
     * @param sEntityType The EntityType name
     * @returns The DraftAdministrativeData
     */
    _getDraftAdministrativeDataType: function (oMetaModel, sEntityType) {
      return oMetaModel.requestObject("/".concat(sEntityType, "/DraftAdministrativeData/"));
    },
    /**
     * @function
     * @name getPopoverText
     * @param iContext
     * @param sEntityType The EntityType name
     * @returns The Binding Expression for the draft popover
     */
    getPopoverText: function (iContext, sEntityType) {
      return CommonHelper._getDraftAdministrativeDataType(iContext.getModel(), sEntityType).then(function (oDADEntityType) {
        var sBinding = "{parts: [{path: 'HasDraftEntity', targetType: 'any'}, " +
        //"{path: 'DraftAdministrativeData/LastChangeDateTime'}, " +
        "{path: 'DraftAdministrativeData/InProcessByUser'}, " + "{path: 'DraftAdministrativeData/LastChangedByUser'} ";
        if (oDADEntityType.InProcessByUserDescription) {
          sBinding += " ,{path: 'DraftAdministrativeData/InProcessByUserDescription'}";
        }
        if (oDADEntityType.LastChangedByUserDescription) {
          sBinding += ", {path: 'DraftAdministrativeData/LastChangedByUserDescription'}";
        }
        sBinding += "], formatter: 'sap.fe.macros.field.FieldRuntime.formatDraftOwnerTextInPopover'}";
        return sBinding;
      });
    },
    getContextPath: function (oValue, oInterface) {
      var sPath = oInterface && oInterface.context && oInterface.context.getPath();
      return sPath[sPath.length - 1] === "/" ? sPath.slice(0, -1) : sPath;
    },
    /**
     * Returns a stringified JSON object containing  Presentation Variant sort conditions.
     *
     * @param oContext
     * @param oPresentationVariant Presentation variant Annotation
     * @param sPresentationVariantPath
     * @returns Stringified JSON object
     */
    getSortConditions: function (oContext, oPresentationVariant, sPresentationVariantPath) {
      if (oPresentationVariant && CommonHelper._isPresentationVariantAnnotation(sPresentationVariantPath) && oPresentationVariant.SortOrder) {
        var aSortConditions = {
          sorters: []
        };
        var sEntityPath = oContext.getPath(0).split("@")[0];
        oPresentationVariant.SortOrder.forEach(function () {
          var oCondition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var oSortProperty = {};
          var oSorter = {};
          if (oCondition.DynamicProperty) {
            var _oContext$getModel$ge;
            oSortProperty = (_oContext$getModel$ge = oContext.getModel(0).getObject(sEntityPath + oCondition.DynamicProperty.$AnnotationPath)) === null || _oContext$getModel$ge === void 0 ? void 0 : _oContext$getModel$ge.Name;
          } else if (oCondition.Property) {
            oSortProperty = oCondition.Property.$PropertyPath;
          }
          if (oSortProperty) {
            oSorter.name = oSortProperty;
            oSorter.descending = !!oCondition.Descending;
            aSortConditions.sorters.push(oSorter);
          } else {
            throw new Error("Please define the right path to the sort property");
          }
        });
        return JSON.stringify(aSortConditions);
      }
      return undefined;
    },
    _isPresentationVariantAnnotation: function (sAnnotationPath) {
      return sAnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.PresentationVariant") > -1 || sAnnotationPath.indexOf("@com.sap.vocabularies.UI.v1.SelectionPresentationVariant") > -1;
    },
    createPresentationPathContext: function (oPresentationContext) {
      var aPaths = oPresentationContext.sPath.split("@") || [];
      var oModel = oPresentationContext.getModel();
      if (aPaths.length && aPaths[aPaths.length - 1].indexOf("com.sap.vocabularies.UI.v1.SelectionPresentationVariant") > -1) {
        var sPath = oPresentationContext.sPath.split("/PresentationVariant")[0];
        return oModel.createBindingContext("".concat(sPath, "@sapui.name"));
      }
      return oModel.createBindingContext("".concat(oPresentationContext.sPath, "@sapui.name"));
    },
    getPressHandlerForDataFieldForIBN: function (oDataField, sContext, bNavigateWithConfirmationDialog) {
      var mNavigationParameters = {
        navigationContexts: sContext ? sContext : "${$source>/}.getBindingContext()"
      };
      if (oDataField.RequiresContext && !oDataField.Inline && bNavigateWithConfirmationDialog) {
        mNavigationParameters.applicableContexts = "${internal>ibn/" + oDataField.SemanticObject + "-" + oDataField.Action + "/aApplicable/}";
        mNavigationParameters.notApplicableContexts = "${internal>ibn/" + oDataField.SemanticObject + "-" + oDataField.Action + "/aNotApplicable/}";
        mNavigationParameters.label = this.addSingleQuotes(oDataField.Label, true);
      }
      if (oDataField.Mapping) {
        mNavigationParameters.semanticObjectMapping = this.addSingleQuotes(JSON.stringify(oDataField.Mapping));
      }
      return this.generateFunction(bNavigateWithConfirmationDialog ? "._intentBasedNavigation.navigateWithConfirmationDialog" : "._intentBasedNavigation.navigate", this.addSingleQuotes(oDataField.SemanticObject), this.addSingleQuotes(oDataField.Action), this.objectToString(mNavigationParameters));
    },
    getEntitySet: function (oContext) {
      var sPath = oContext.getPath();
      return ModelHelper.getEntitySetPath(sPath);
    },
    /**
     * Handles the visibility of form menu actions both in path based and static value scenarios.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param sVisibleValue Either static boolean values or Array of path expressions for visibility of menu button.
     * @returns The binding expression determining the visibility of menu actions.
     */
    handleVisibilityOfMenuActions: function (sVisibleValue) {
      var combinedConditions = [];
      if (Array.isArray(sVisibleValue)) {
        for (var i = 0; i < sVisibleValue.length; i++) {
          if (sVisibleValue[i].indexOf("{") > -1 && sVisibleValue[i].indexOf("{=") === -1) {
            sVisibleValue[i] = "{=" + sVisibleValue[i] + "}";
          }
          if (sVisibleValue[i].split("{=").length > 0) {
            sVisibleValue[i] = sVisibleValue[i].split("{=")[1].slice(0, -1);
          }
          combinedConditions.push("(".concat(sVisibleValue[i], ")"));
        }
      }
      return combinedConditions.length > 0 ? "{= ".concat(combinedConditions.join(" || "), "}") : sVisibleValue;
    },
    /**
     * Method to do the calculation of criticality in case CriticalityCalculation present in the annotation
     *
     * The calculation is done by comparing a value to the threshold values relevant for the specified improvement direction.
     * For improvement direction Target, the criticality is calculated using both low and high threshold values. It will be
     *
     * - Positive if the value is greater than or equal to AcceptanceRangeLowValue and lower than or equal to AcceptanceRangeHighValue
     * - Neutral if the value is greater than or equal to ToleranceRangeLowValue and lower than AcceptanceRangeLowValue OR greater than AcceptanceRangeHighValue and lower than or equal to ToleranceRangeHighValue
     * - Critical if the value is greater than or equal to DeviationRangeLowValue and lower than ToleranceRangeLowValue OR greater than ToleranceRangeHighValue and lower than or equal to DeviationRangeHighValue
     * - Negative if the value is lower than DeviationRangeLowValue or greater than DeviationRangeHighValue
     *
     * For improvement direction Minimize, the criticality is calculated using the high threshold values. It is
     * - Positive if the value is lower than or equal to AcceptanceRangeHighValue
     * - Neutral if the value is greater than AcceptanceRangeHighValue and lower than or equal to ToleranceRangeHighValue
     * - Critical if the value is greater than ToleranceRangeHighValue and lower than or equal to DeviationRangeHighValue
     * - Negative if the value is greater than DeviationRangeHighValue
     *
     * For improvement direction Maximize, the criticality is calculated using the low threshold values. It is
     *
     * - Positive if the value is greater than or equal to AcceptanceRangeLowValue
     * - Neutral if the value is less than AcceptanceRangeLowValue and greater than or equal to ToleranceRangeLowValue
     * - Critical if the value is lower than ToleranceRangeLowValue and greater than or equal to DeviationRangeLowValue
     * - Negative if the value is lower than DeviationRangeLowValue
     *
     * Thresholds are optional. For unassigned values, defaults are determined in this order:
     *
     * - For DeviationRange, an omitted LowValue translates into the smallest possible number (-INF), an omitted HighValue translates into the largest possible number (+INF)
     * - For ToleranceRange, an omitted LowValue will be initialized with DeviationRangeLowValue, an omitted HighValue will be initialized with DeviationRangeHighValue
     * - For AcceptanceRange, an omitted LowValue will be initialized with ToleranceRangeLowValue, an omitted HighValue will be initialized with ToleranceRangeHighValue.
     *
     * @param sImprovementDirection ImprovementDirection to be used for creating the criticality binding
     * @param sValue Value from Datapoint to be measured
     * @param sDeviationLow ExpressionBinding for Lower Deviation level
     * @param sToleranceLow ExpressionBinding for Lower Tolerance level
     * @param sAcceptanceLow ExpressionBinding for Lower Acceptance level
     * @param sAcceptanceHigh ExpressionBinding for Higher Acceptance level
     * @param sToleranceHigh ExpressionBinding for Higher Tolerance level
     * @param sDeviationHigh ExpressionBinding for Higher Deviation level
     * @returns Returns criticality calculation as expression binding
     */
    getCriticalityCalculationBinding: function (sImprovementDirection, sValue, sDeviationLow, sToleranceLow, sAcceptanceLow, sAcceptanceHigh, sToleranceHigh, sDeviationHigh) {
      var sCriticalityExpression = ValueColor.Neutral; // Default Criticality State

      sValue = "%".concat(sValue);

      // Setting Unassigned Values
      sDeviationLow = sDeviationLow || -Infinity;
      sToleranceLow = sToleranceLow || sDeviationLow;
      sAcceptanceLow = sAcceptanceLow || sToleranceLow;
      sDeviationHigh = sDeviationHigh || Infinity;
      sToleranceHigh = sToleranceHigh || sDeviationHigh;
      sAcceptanceHigh = sAcceptanceHigh || sToleranceHigh;

      // Dealing with Decimal and Path based bingdings
      sDeviationLow = sDeviationLow && (+sDeviationLow ? +sDeviationLow : "%".concat(sDeviationLow));
      sToleranceLow = sToleranceLow && (+sToleranceLow ? +sToleranceLow : "%".concat(sToleranceLow));
      sAcceptanceLow = sAcceptanceLow && (+sAcceptanceLow ? +sAcceptanceLow : "%".concat(sAcceptanceLow));
      sAcceptanceHigh = sAcceptanceHigh && (+sAcceptanceHigh ? +sAcceptanceHigh : "%".concat(sAcceptanceHigh));
      sToleranceHigh = sToleranceHigh && (+sToleranceHigh ? +sToleranceHigh : "%".concat(sToleranceHigh));
      sDeviationHigh = sDeviationHigh && (+sDeviationHigh ? +sDeviationHigh : "%".concat(sDeviationHigh));

      // Creating runtime expression binding from criticality calculation for Criticality State
      if (sImprovementDirection.indexOf("Minimize") > -1) {
        sCriticalityExpression = "{= " + sValue + " <= " + sAcceptanceHigh + " ? '" + ValueColor.Good + "' : " + sValue + " <= " + sToleranceHigh + " ? '" + ValueColor.Neutral + "' : " + "(" + sDeviationHigh + " && " + sValue + " <= " + sDeviationHigh + ") ? '" + ValueColor.Critical + "' : '" + ValueColor.Error + "' }";
      } else if (sImprovementDirection.indexOf("Maximize") > -1) {
        sCriticalityExpression = "{= " + sValue + " >= " + sAcceptanceLow + " ? '" + ValueColor.Good + "' : " + sValue + " >= " + sToleranceLow + " ? '" + ValueColor.Neutral + "' : " + "(" + sDeviationLow + " && " + sValue + " >= " + sDeviationLow + ") ? '" + ValueColor.Critical + "' : '" + ValueColor.Error + "' }";
      } else if (sImprovementDirection.indexOf("Target") > -1) {
        sCriticalityExpression = "{= (" + sValue + " <= " + sAcceptanceHigh + " && " + sValue + " >= " + sAcceptanceLow + ") ? '" + ValueColor.Good + "' : " + "((" + sValue + " >= " + sToleranceLow + " && " + sValue + " < " + sAcceptanceLow + ") || (" + sValue + " > " + sAcceptanceHigh + " && " + sValue + " <= " + sToleranceHigh + ")) ? '" + ValueColor.Neutral + "' : " + "((" + sDeviationLow + " && (" + sValue + " >= " + sDeviationLow + ") && (" + sValue + " < " + sToleranceLow + ")) || ((" + sValue + " > " + sToleranceHigh + ") && " + sDeviationHigh + " && (" + sValue + " <= " + sDeviationHigh + "))) ? '" + ValueColor.Critical + "' : '" + ValueColor.Error + "' }";
      } else {
        Log.warning("Case not supported, returning the default Value Neutral");
      }
      return sCriticalityExpression;
    },
    /**
     * This function returns the criticality indicator from annotations if criticality is EnumMember.
     *
     * @param sCriticality Criticality provided in the annotations
     * @returns Return the indicator for criticality
     * @private
     */
    _getCriticalityFromEnum: function (sCriticality) {
      var sIndicator;
      if (sCriticality === "com.sap.vocabularies.UI.v1.CriticalityType/Negative") {
        sIndicator = ValueColor.Error;
      } else if (sCriticality === "com.sap.vocabularies.UI.v1.CriticalityType/Positive") {
        sIndicator = ValueColor.Good;
      } else if (sCriticality === "com.sap.vocabularies.UI.v1.CriticalityType/Critical") {
        sIndicator = ValueColor.Critical;
      } else {
        sIndicator = ValueColor.Neutral;
      }
      return sIndicator;
    },
    getValueCriticality: function (sDimension, aValueCriticality) {
      var sResult;
      var aValues = [];
      if (aValueCriticality && aValueCriticality.length > 0) {
        aValueCriticality.forEach(function (oVC) {
          if (oVC.Value && oVC.Criticality.$EnumMember) {
            var sValue = "${" + sDimension + "} === '" + oVC.Value + "' ? '" + CommonHelper._getCriticalityFromEnum(oVC.Criticality.$EnumMember) + "'";
            aValues.push(sValue);
          }
        });
        sResult = aValues.length > 0 && aValues.join(" : ") + " : undefined";
      }
      return sResult ? "{= " + sResult + " }" : undefined;
    },
    /**
     * To fetch measure attribute index.
     *
     * @param iMeasure Chart Annotations
     * @param oChartAnnotations Chart Annotations
     * @returns MeasureAttribute index.
     * @private
     */
    getMeasureAttributeIndex: function (iMeasure, oChartAnnotations) {
      var _oChartAnnotations$Me, _oChartAnnotations$Dy;
      var aMeasures, sMeasurePropertyPath;
      if ((oChartAnnotations === null || oChartAnnotations === void 0 ? void 0 : (_oChartAnnotations$Me = oChartAnnotations.Measures) === null || _oChartAnnotations$Me === void 0 ? void 0 : _oChartAnnotations$Me.length) > 0) {
        aMeasures = oChartAnnotations.Measures;
        sMeasurePropertyPath = aMeasures[iMeasure].$PropertyPath;
      } else if ((oChartAnnotations === null || oChartAnnotations === void 0 ? void 0 : (_oChartAnnotations$Dy = oChartAnnotations.DynamicMeasures) === null || _oChartAnnotations$Dy === void 0 ? void 0 : _oChartAnnotations$Dy.length) > 0) {
        aMeasures = oChartAnnotations.DynamicMeasures;
        sMeasurePropertyPath = aMeasures[iMeasure].$AnnotationPath;
      }
      var bMeasureAttributeExists;
      var aMeasureAttributes = oChartAnnotations.MeasureAttributes;
      var iMeasureAttribute = -1;
      var fnCheckMeasure = function (sMeasurePath, oMeasureAttribute, index) {
        if (oMeasureAttribute) {
          if (oMeasureAttribute.Measure && oMeasureAttribute.Measure.$PropertyPath === sMeasurePath) {
            iMeasureAttribute = index;
            return true;
          } else if (oMeasureAttribute.DynamicMeasure && oMeasureAttribute.DynamicMeasure.$AnnotationPath === sMeasurePath) {
            iMeasureAttribute = index;
            return true;
          }
        }
      };
      if (aMeasureAttributes) {
        bMeasureAttributeExists = aMeasureAttributes.some(fnCheckMeasure.bind(null, sMeasurePropertyPath));
      }
      return bMeasureAttributeExists && iMeasureAttribute > -1 && iMeasureAttribute;
    },
    getMeasureAttribute: function (oContext) {
      var oMetaModel = oContext.getModel(),
        sChartAnnotationPath = oContext.getPath();
      return oMetaModel.requestObject(sChartAnnotationPath).then(function (oChartAnnotations) {
        var aMeasureAttributes = oChartAnnotations.MeasureAttributes,
          iMeasureAttribute = CommonHelper.getMeasureAttributeIndex(0, oChartAnnotations);
        var sMeasureAttributePath = iMeasureAttribute > -1 && aMeasureAttributes[iMeasureAttribute] && aMeasureAttributes[iMeasureAttribute].DataPoint ? "".concat(sChartAnnotationPath, "MeasureAttributes/").concat(iMeasureAttribute, "/") : undefined;
        if (sMeasureAttributePath === undefined) {
          Log.warning("DataPoint missing for the measure");
        }
        return sMeasureAttributePath ? "".concat(sMeasureAttributePath, "DataPoint/$AnnotationPath/") : sMeasureAttributePath;
      });
    },
    /**
     * This function returns the measureAttribute for the measure.
     *
     * @param oContext Context to the measure annotation
     * @returns Path to the measureAttribute of the measure
     */
    getMeasureAttributeForMeasure: function (oContext) {
      var oMetaModel = oContext.getModel(),
        sMeasurePath = oContext.getPath(),
        sChartAnnotationPath = sMeasurePath.substring(0, sMeasurePath.lastIndexOf("Measure")),
        iMeasure = sMeasurePath.replace(/.*\//, "");
      return oMetaModel.requestObject(sChartAnnotationPath).then(function (oChartAnnotations) {
        var aMeasureAttributes = oChartAnnotations.MeasureAttributes,
          iMeasureAttribute = CommonHelper.getMeasureAttributeIndex(iMeasure, oChartAnnotations);
        var sMeasureAttributePath = iMeasureAttribute > -1 && aMeasureAttributes[iMeasureAttribute] && aMeasureAttributes[iMeasureAttribute].DataPoint ? "".concat(sChartAnnotationPath, "MeasureAttributes/").concat(iMeasureAttribute, "/") : undefined;
        if (sMeasureAttributePath === undefined) {
          Log.warning("DataPoint missing for the measure");
        }
        return sMeasureAttributePath ? "".concat(sMeasureAttributePath, "DataPoint/$AnnotationPath/") : sMeasureAttributePath;
      });
    },
    /**
     * Method to determine if the contained navigation property has a draft root/node parent entitySet.
     *
     * @function
     * @name isDraftParentEntityForContainment
     * @param oTargetCollectionContainsTarget Target collection has ContainsTarget property
     * @param oTableMetadata Table metadata for which draft support shall be checked
     * @returns Returns true if draft
     */
    isDraftParentEntityForContainment: function (oTargetCollectionContainsTarget, oTableMetadata) {
      if (oTargetCollectionContainsTarget) {
        if (oTableMetadata && oTableMetadata.parentEntitySet && oTableMetadata.parentEntitySet.sPath) {
          var sParentEntitySetPath = oTableMetadata.parentEntitySet.sPath;
          var oDraftRoot = oTableMetadata.parentEntitySet.oModel.getObject("".concat(sParentEntitySetPath, "@com.sap.vocabularies.Common.v1.DraftRoot"));
          var oDraftNode = oTableMetadata.parentEntitySet.oModel.getObject("".concat(sParentEntitySetPath, "@com.sap.vocabularies.Common.v1.DraftNode"));
          if (oDraftRoot || oDraftNode) {
            return true;
          } else {
            return false;
          }
        }
      } else {
        return false;
      }
    },
    /**
     * Ensures the data is processed as defined in the template.
     * Since the property Data is of the type 'object', it may not be in the same order as required by the template.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param dataElement The data that is currently being processed.
     * @returns The correct path according to the template.
     */
    getDataFromTemplate: function (dataElement) {
      var splitPath = dataElement.getPath().split("/");
      var dataKey = splitPath[splitPath.length - 1];
      var connectedDataPath = "/".concat(splitPath.slice(1, -2).join("/"), "/@");
      var connectedObject = dataElement.getObject(connectedDataPath);
      var template = connectedObject.Template;
      var splitTemp = template.split("}");
      var tempArray = [];
      for (var i = 0; i < splitTemp.length - 1; i++) {
        var key = splitTemp[i].split("{")[1].trim();
        tempArray.push(key);
      }
      Object.keys(connectedObject.Data).forEach(function (sKey) {
        if (sKey.startsWith("$")) {
          delete connectedObject.Data[sKey];
        }
      });
      var index = Object.keys(connectedObject.Data).indexOf(dataKey);
      return "/".concat(splitPath.slice(1, -2).join("/"), "/Data/").concat(tempArray[index]);
    },
    /**
     * Checks if the end of the template has been reached.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param target The target of the connected fields.
     * @param element The element that is currently being processed.
     * @returns True or False (depending on the template index).
     */
    notLastIndex: function (target, element) {
      var template = target.Template;
      var splitTemp = template.split("}");
      var tempArray = [];
      var isLastIndex = false;
      for (var i = 0; i < splitTemp.length - 1; i++) {
        var dataKey = splitTemp[i].split("{")[1].trim();
        tempArray.push(dataKey);
      }
      tempArray.forEach(function (templateInfo) {
        if (target.Data[templateInfo] === element && tempArray.indexOf(templateInfo) !== tempArray.length - 1) {
          isLastIndex = true;
        }
      });
      return isLastIndex;
    },
    /**
     * Determines the delimiter from the template.
     *
     * @function
     * @memberof sap.fe.macros.CommonHelper
     * @param template The template string.
     * @returns The delimiter in the template string.
     */
    getDelimiter: function (template) {
      return template.split("}")[1].split("{")[0].trim();
    },
    oMetaModel: undefined,
    setMetaModel: function (oMetaModel) {
      this.oMetaModel = oMetaModel;
    },
    getMetaModel: function (oContext, oInterface) {
      if (oContext) {
        return oInterface.context.getModel();
      }
      return this.oMetaModel;
    },
    getParameters: function (oContext, oInterface) {
      if (oContext) {
        var oMetaModel = oInterface.context.getModel();
        var sPath = oInterface.context.getPath();
        var oParameterInfo = CommonUtils.getParameterInfo(oMetaModel, sPath);
        if (oParameterInfo.parameterProperties) {
          return Object.keys(oParameterInfo.parameterProperties);
        }
      }
      return [];
    },
    /**
     * Build an expression calling an action handler via the FPM helper's actionWrapper function
     *
     * This function assumes that the 'FPM.actionWrapper()' function is available at runtime.
     *
     * @param oAction Action metadata
     * @param oAction.handlerModule Module containing the action handler method
     * @param oAction.handlerMethod Action handler method name
     * @param [oThis] `this` (if the function is called from a macro)
     * @param oThis.id The table's ID
     * @returns The action wrapper binding	expression
     */
    buildActionWrapper: function (oAction, oThis) {
      var aParams = [ref("$event"), oAction.handlerModule, oAction.handlerMethod];
      if (oThis && oThis.id) {
        var oAdditionalParams = {
          contexts: ref("${internal>selectedContexts}")
        };
        aParams.push(oAdditionalParams);
      }
      return compileExpression(fn("FPM.actionWrapper", aParams));
    },
    /**
     * Returns the value whether or not the element should be visible depending on the Hidden annotation.
     * It is inverted as the UI elements have a visible property instead of an hidden one.
     *
     * @param dataFieldAnnotations The dataField Object
     * @returns A path or a boolean
     */
    getHiddenPathExpression: function (dataFieldAnnotations) {
      if (dataFieldAnnotations["@com.sap.vocabularies.UI.v1.Hidden"] !== null) {
        var hidden = dataFieldAnnotations["@com.sap.vocabularies.UI.v1.Hidden"];
        return typeof hidden === "object" ? "{= !${" + hidden.$Path + "} }" : !hidden;
      }
      return true;
    }
  };
  CommonHelper.isPropertyFilterable.requiresIContext = true;
  CommonHelper.getPopoverText.requiresIContext = true;
  CommonHelper.getSortConditions.requiresIContext = true;
  return CommonHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJWYWx1ZUNvbG9yIiwibUxpYnJhcnkiLCJDb21tb25IZWxwZXIiLCJ1c2VGaWVsZFZhbHVlSGVscCIsImxvY2F0aW9uIiwiaHJlZiIsImluZGV4T2YiLCJnZXRQYXRoVG9LZXkiLCJvQ3R4IiwiZ2V0T2JqZWN0IiwiaXNWaXNpYmxlIiwidGFyZ2V0Iiwib0ludGVyZmFjZSIsIm9Nb2RlbCIsImNvbnRleHQiLCJnZXRNb2RlbCIsInNQcm9wZXJ0eVBhdGgiLCJnZXRQYXRoIiwib0Fubm90YXRpb25zIiwiaGlkZGVuIiwiJFBhdGgiLCJpc0RpYWxvZyIsIm9BY3Rpb25Db250ZXh0IiwiaXNDcml0aWNhbCIsIm9BY3Rpb24iLCJBcnJheSIsImlzQXJyYXkiLCIkUGFyYW1ldGVyIiwibGVuZ3RoIiwiZ2V0UGFyYW1ldGVyRWRpdE1vZGUiLCJmaWVsZENvbnRyb2wiLCJpbW11dGFibGUiLCJjb21wdXRlZCIsInNFZGl0TW9kZSIsIkVkaXRNb2RlIiwiRWRpdGFibGUiLCJSZWFkT25seSIsIiRFbnVtTWVtYmVyIiwiRGlzYWJsZWQiLCJnZXRNZXRhUGF0aCIsInVuZGVmaW5lZCIsImlzRGVza3RvcCIsInN5c3RlbSIsImRlc2t0b3AiLCJnZXRUYXJnZXRDb2xsZWN0aW9uIiwib0NvbnRleHQiLCJuYXZDb2xsZWN0aW9uIiwic1BhdGgiLCJnZXRNZXRhZGF0YSIsImdldE5hbWUiLCJnZXRNZXRhTW9kZWwiLCJhUGFydHMiLCJzcGxpdCIsImZpbHRlciIsInNQYXJ0IiwiZW50aXR5U2V0IiwibmF2aWdhdGlvbkNvbGxlY3Rpb24iLCJzbGljZSIsImpvaW4iLCJpc1Byb3BlcnR5RmlsdGVyYWJsZSIsInByb3BlcnR5Iiwib0RhdGFGaWVsZCIsInNQcm9wZXJ0eUxvY2F0aW9uUGF0aCIsImdldExvY2F0aW9uRm9yUHJvcGVydHlQYXRoIiwic1Byb3BlcnR5IiwicmVwbGFjZSIsIiRUeXBlIiwiQ29tbW9uVXRpbHMiLCJpTGVuZ3RoIiwic0NvbGxlY3Rpb25QYXRoIiwibGFzdEluZGV4T2YiLCJnb3RvQWN0aW9uUGFyYW1ldGVyIiwic1Byb3BlcnR5TmFtZSIsImdldFBhcmFtZXRlclBhdGgiLCJnZXRFbnRpdHlTZXROYW1lIiwib01ldGFNb2RlbCIsInNFbnRpdHlUeXBlIiwib0VudGl0eUNvbnRhaW5lciIsImtleSIsImdldEFjdGlvblBhdGgiLCJiUmV0dXJuT25seVBhdGgiLCJzQWN0aW9uTmFtZSIsImJDaGVja1N0YXRpY1ZhbHVlIiwic0NvbnRleHRQYXRoIiwic0VudGl0eVR5cGVOYW1lIiwic0VudGl0eU5hbWUiLCJzQmluZGluZ1BhcmFtZXRlciIsImdldE5hdmlnYXRpb25Db250ZXh0IiwiT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIiLCJnZXROYXZpZ2F0aW9uUGF0aCIsImJLZWVwUHJvcGVydHkiLCJiU3RhcnRzV2l0aEVudGl0eVR5cGUiLCJzdGFydHNXaXRoIiwicGFydCIsInNoaWZ0IiwicG9wIiwiZ2V0QWN0aW9uQ29udGV4dCIsImdldFBhdGhUb0JvdW5kQWN0aW9uT3ZlcmxvYWQiLCJhZGRTaW5nbGVRdW90ZXMiLCJzVmFsdWUiLCJiRXNjYXBlIiwiZXNjYXBlU2luZ2xlUXVvdGVzIiwiZ2VuZXJhdGVGdW5jdGlvbiIsInNGdW5jTmFtZSIsInNQYXJhbXMiLCJpIiwic0Z1bmN0aW9uIiwiZ2V0SGVhZGVyRGF0YVBvaW50TGlua1Zpc2liaWxpdHkiLCJiTGluayIsImJGaWVsZFZpc2liaWxpdHkiLCJzVmlzaWJpbGl0eUV4cCIsIm9iamVjdFRvU3RyaW5nIiwib1BhcmFtcyIsImlOdW1iZXJPZktleXMiLCJPYmplY3QiLCJrZXlzIiwic0tleSIsInJlbW92ZUVzY2FwZUNoYXJhY3RlcnMiLCJzRXhwcmVzc2lvbiIsInN0cmluZ2lmeU9iamVjdCIsInNTdHJpbmdpZmllZCIsIm9PYmplY3QiLCJKU09OIiwicGFyc2UiLCJvVUk1T2JqZWN0IiwidWk1b2JqZWN0IiwiYXNzaWduIiwic3RyaW5naWZ5Iiwic1R5cGUiLCJMb2ciLCJlcnJvciIsIkVycm9yIiwic3RyaW5naWZ5Q3VzdG9tRGF0YSIsInZEYXRhIiwiQ29udGV4dCIsInBhcnNlQ3VzdG9tRGF0YSIsImhhc093blByb3BlcnR5IiwiX2dldERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhVHlwZSIsInJlcXVlc3RPYmplY3QiLCJnZXRQb3BvdmVyVGV4dCIsImlDb250ZXh0IiwidGhlbiIsIm9EQURFbnRpdHlUeXBlIiwic0JpbmRpbmciLCJJblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvbiIsIkxhc3RDaGFuZ2VkQnlVc2VyRGVzY3JpcHRpb24iLCJnZXRDb250ZXh0UGF0aCIsIm9WYWx1ZSIsImdldFNvcnRDb25kaXRpb25zIiwib1ByZXNlbnRhdGlvblZhcmlhbnQiLCJzUHJlc2VudGF0aW9uVmFyaWFudFBhdGgiLCJfaXNQcmVzZW50YXRpb25WYXJpYW50QW5ub3RhdGlvbiIsIlNvcnRPcmRlciIsImFTb3J0Q29uZGl0aW9ucyIsInNvcnRlcnMiLCJzRW50aXR5UGF0aCIsImZvckVhY2giLCJvQ29uZGl0aW9uIiwib1NvcnRQcm9wZXJ0eSIsIm9Tb3J0ZXIiLCJEeW5hbWljUHJvcGVydHkiLCIkQW5ub3RhdGlvblBhdGgiLCJOYW1lIiwiUHJvcGVydHkiLCIkUHJvcGVydHlQYXRoIiwibmFtZSIsImRlc2NlbmRpbmciLCJEZXNjZW5kaW5nIiwicHVzaCIsInNBbm5vdGF0aW9uUGF0aCIsImNyZWF0ZVByZXNlbnRhdGlvblBhdGhDb250ZXh0Iiwib1ByZXNlbnRhdGlvbkNvbnRleHQiLCJhUGF0aHMiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTiIsInNDb250ZXh0IiwiYk5hdmlnYXRlV2l0aENvbmZpcm1hdGlvbkRpYWxvZyIsIm1OYXZpZ2F0aW9uUGFyYW1ldGVycyIsIm5hdmlnYXRpb25Db250ZXh0cyIsIlJlcXVpcmVzQ29udGV4dCIsIklubGluZSIsImFwcGxpY2FibGVDb250ZXh0cyIsIlNlbWFudGljT2JqZWN0IiwiQWN0aW9uIiwibm90QXBwbGljYWJsZUNvbnRleHRzIiwibGFiZWwiLCJMYWJlbCIsIk1hcHBpbmciLCJzZW1hbnRpY09iamVjdE1hcHBpbmciLCJnZXRFbnRpdHlTZXQiLCJNb2RlbEhlbHBlciIsImdldEVudGl0eVNldFBhdGgiLCJoYW5kbGVWaXNpYmlsaXR5T2ZNZW51QWN0aW9ucyIsInNWaXNpYmxlVmFsdWUiLCJjb21iaW5lZENvbmRpdGlvbnMiLCJnZXRDcml0aWNhbGl0eUNhbGN1bGF0aW9uQmluZGluZyIsInNJbXByb3ZlbWVudERpcmVjdGlvbiIsInNEZXZpYXRpb25Mb3ciLCJzVG9sZXJhbmNlTG93Iiwic0FjY2VwdGFuY2VMb3ciLCJzQWNjZXB0YW5jZUhpZ2giLCJzVG9sZXJhbmNlSGlnaCIsInNEZXZpYXRpb25IaWdoIiwic0NyaXRpY2FsaXR5RXhwcmVzc2lvbiIsIk5ldXRyYWwiLCJJbmZpbml0eSIsIkdvb2QiLCJDcml0aWNhbCIsIndhcm5pbmciLCJfZ2V0Q3JpdGljYWxpdHlGcm9tRW51bSIsInNDcml0aWNhbGl0eSIsInNJbmRpY2F0b3IiLCJnZXRWYWx1ZUNyaXRpY2FsaXR5Iiwic0RpbWVuc2lvbiIsImFWYWx1ZUNyaXRpY2FsaXR5Iiwic1Jlc3VsdCIsImFWYWx1ZXMiLCJvVkMiLCJWYWx1ZSIsIkNyaXRpY2FsaXR5IiwiZ2V0TWVhc3VyZUF0dHJpYnV0ZUluZGV4IiwiaU1lYXN1cmUiLCJvQ2hhcnRBbm5vdGF0aW9ucyIsImFNZWFzdXJlcyIsInNNZWFzdXJlUHJvcGVydHlQYXRoIiwiTWVhc3VyZXMiLCJEeW5hbWljTWVhc3VyZXMiLCJiTWVhc3VyZUF0dHJpYnV0ZUV4aXN0cyIsImFNZWFzdXJlQXR0cmlidXRlcyIsIk1lYXN1cmVBdHRyaWJ1dGVzIiwiaU1lYXN1cmVBdHRyaWJ1dGUiLCJmbkNoZWNrTWVhc3VyZSIsInNNZWFzdXJlUGF0aCIsIm9NZWFzdXJlQXR0cmlidXRlIiwiaW5kZXgiLCJNZWFzdXJlIiwiRHluYW1pY01lYXN1cmUiLCJzb21lIiwiYmluZCIsImdldE1lYXN1cmVBdHRyaWJ1dGUiLCJzQ2hhcnRBbm5vdGF0aW9uUGF0aCIsInNNZWFzdXJlQXR0cmlidXRlUGF0aCIsIkRhdGFQb2ludCIsImdldE1lYXN1cmVBdHRyaWJ1dGVGb3JNZWFzdXJlIiwic3Vic3RyaW5nIiwiaXNEcmFmdFBhcmVudEVudGl0eUZvckNvbnRhaW5tZW50Iiwib1RhcmdldENvbGxlY3Rpb25Db250YWluc1RhcmdldCIsIm9UYWJsZU1ldGFkYXRhIiwicGFyZW50RW50aXR5U2V0Iiwic1BhcmVudEVudGl0eVNldFBhdGgiLCJvRHJhZnRSb290Iiwib0RyYWZ0Tm9kZSIsImdldERhdGFGcm9tVGVtcGxhdGUiLCJkYXRhRWxlbWVudCIsInNwbGl0UGF0aCIsImRhdGFLZXkiLCJjb25uZWN0ZWREYXRhUGF0aCIsImNvbm5lY3RlZE9iamVjdCIsInRlbXBsYXRlIiwiVGVtcGxhdGUiLCJzcGxpdFRlbXAiLCJ0ZW1wQXJyYXkiLCJ0cmltIiwiRGF0YSIsIm5vdExhc3RJbmRleCIsImVsZW1lbnQiLCJpc0xhc3RJbmRleCIsInRlbXBsYXRlSW5mbyIsImdldERlbGltaXRlciIsInNldE1ldGFNb2RlbCIsImdldFBhcmFtZXRlcnMiLCJvUGFyYW1ldGVySW5mbyIsImdldFBhcmFtZXRlckluZm8iLCJwYXJhbWV0ZXJQcm9wZXJ0aWVzIiwiYnVpbGRBY3Rpb25XcmFwcGVyIiwib1RoaXMiLCJhUGFyYW1zIiwicmVmIiwiaGFuZGxlck1vZHVsZSIsImhhbmRsZXJNZXRob2QiLCJpZCIsIm9BZGRpdGlvbmFsUGFyYW1zIiwiY29udGV4dHMiLCJjb21waWxlRXhwcmVzc2lvbiIsImZuIiwiZ2V0SGlkZGVuUGF0aEV4cHJlc3Npb24iLCJkYXRhRmllbGRBbm5vdGF0aW9ucyIsInJlcXVpcmVzSUNvbnRleHQiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkNvbW1vbkhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCBDb21tb25VdGlscyBmcm9tIFwic2FwL2ZlL2NvcmUvQ29tbW9uVXRpbHNcIjtcbmltcG9ydCB7IGNvbXBpbGVFeHByZXNzaW9uLCBmbiwgcmVmIH0gZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvQmluZGluZ1Rvb2xraXRcIjtcbmltcG9ydCBNb2RlbEhlbHBlciBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9Nb2RlbEhlbHBlclwiO1xuaW1wb3J0IG1MaWJyYXJ5IGZyb20gXCJzYXAvbS9saWJyYXJ5XCI7XG5pbXBvcnQgeyBzeXN0ZW0gfSBmcm9tIFwic2FwL3VpL0RldmljZVwiO1xuaW1wb3J0IEVkaXRNb2RlIGZyb20gXCJzYXAvdWkvbWRjL2VudW0vRWRpdE1vZGVcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhTW9kZWxBbm5vdGF0aW9uSGVscGVyIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQW5ub3RhdGlvbkhlbHBlclwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuXG5jb25zdCBWYWx1ZUNvbG9yID0gbUxpYnJhcnkuVmFsdWVDb2xvcjtcbmNvbnN0IENvbW1vbkhlbHBlciA9IHtcblx0dXNlRmllbGRWYWx1ZUhlbHA6IGZ1bmN0aW9uICgpIHtcblx0XHQvLyBTd2l0Y2ggZnJvbSAobmV3KSBtZGM6VmFsdWVIZWxwIHRvIChvbGQpIG1kY0ZpZWxkOkZpZWxkVmFsdWVIZWxwXG5cdFx0cmV0dXJuIGxvY2F0aW9uLmhyZWYuaW5kZXhPZihcInNhcC1mZS1vbGRGaWVsZFZhbHVlSGVscD10cnVlXCIpID4gLTE7XG5cdH0sXG5cblx0Z2V0UGF0aFRvS2V5OiBmdW5jdGlvbiAob0N0eDogYW55KSB7XG5cdFx0cmV0dXJuIG9DdHguZ2V0T2JqZWN0KCk7XG5cdH0sXG5cblx0LyoqXG5cdCAqIERldGVybWluZXMgaWYgYSBmaWVsZCBpcyB2aXNpYmxlLlxuXHQgKlxuXHQgKiBAcGFyYW0gdGFyZ2V0IFRhcmdldCBpbnN0YW5jZVxuXHQgKiBAcGFyYW0gb0ludGVyZmFjZSBJbnRlcmZhY2UgaW5zdGFuY2Vcblx0ICogQHJldHVybnMgUmV0dXJucyB0cnVlLCBmYWxzZSwgb3IgZXhwcmVzc2lvbiB3aXRoIHBhdGhcblx0ICovXG5cdGlzVmlzaWJsZTogZnVuY3Rpb24gKHRhcmdldDogb2JqZWN0LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHRjb25zdCBvTW9kZWwgPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdHNQcm9wZXJ0eVBhdGggPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0UGF0aCgpLFxuXHRcdFx0b0Fubm90YXRpb25zID0gb01vZGVsLmdldE9iamVjdChgJHtzUHJvcGVydHlQYXRofUBgKSxcblx0XHRcdGhpZGRlbiA9IG9Bbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl07XG5cblx0XHRyZXR1cm4gdHlwZW9mIGhpZGRlbiA9PT0gXCJvYmplY3RcIiA/IFwiez0gISR7XCIgKyBoaWRkZW4uJFBhdGggKyBcIn0gfVwiIDogIWhpZGRlbjtcblx0fSxcblxuXHQvKipcblx0ICogRGV0ZXJtaW5lIGlmIHRoZSBhY3Rpb24gb3BlbnMgdXAgYSBkaWFsb2cuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQWN0aW9uQ29udGV4dFxuXHQgKiBAcGFyYW0gb0ludGVyZmFjZVxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYSBkaWFsb2cgaXMgbmVlZGVkXG5cdCAqL1xuXHRpc0RpYWxvZzogZnVuY3Rpb24gKG9BY3Rpb25Db250ZXh0OiBhbnksIG9JbnRlcmZhY2U6IGFueSkge1xuXHRcdGNvbnN0IG9Nb2RlbCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRNb2RlbCgpLFxuXHRcdFx0c1Byb3BlcnR5UGF0aCA9IG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRpc0NyaXRpY2FsID0gb01vZGVsLmdldE9iamVjdChgJHtzUHJvcGVydHlQYXRofS9AJHVpNS5vdmVybG9hZEBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuSXNBY3Rpb25Dcml0aWNhbGApO1xuXHRcdGlmIChpc0NyaXRpY2FsKSB7XG5cdFx0XHRyZXR1cm4gXCJEaWFsb2dcIjtcblx0XHR9IGVsc2UgaWYgKG9BY3Rpb25Db250ZXh0KSB7XG5cdFx0XHRjb25zdCBvQWN0aW9uID0gQXJyYXkuaXNBcnJheShvQWN0aW9uQ29udGV4dCkgPyBvQWN0aW9uQ29udGV4dFswXSA6IG9BY3Rpb25Db250ZXh0O1xuXHRcdFx0aWYgKG9BY3Rpb24uJFBhcmFtZXRlciAmJiBvQWN0aW9uLiRQYXJhbWV0ZXIubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRyZXR1cm4gXCJEaWFsb2dcIjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHJldHVybiBcIk5vbmVcIjtcblx0XHRcdH1cblx0XHR9XG5cdH0sXG5cdC8qKlxuXHQgKiBEZXRlcm1pbmUgaWYgZmllbGQgaXMgZWRpdGFibGUuXG5cdCAqXG5cdCAqIEBwYXJhbSB0YXJnZXQgVGFyZ2V0IGluc3RhbmNlXG5cdCAqIEBwYXJhbSBvSW50ZXJmYWNlIEludGVyZmFjZSBpbnN0YW5jZVxuXHQgKiBAcmV0dXJucyBBIEJpbmRpbmcgRXhwcmVzc2lvbiB0byBkZXRlcm1pbmUgaWYgYSBmaWVsZCBzaG91bGQgYmUgZWRpdGFibGUgb3Igbm90LlxuXHQgKi9cblx0Z2V0UGFyYW1ldGVyRWRpdE1vZGU6IGZ1bmN0aW9uICh0YXJnZXQ6IG9iamVjdCwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0ludGVyZmFjZS5jb250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRzUHJvcGVydHlQYXRoID0gb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKSxcblx0XHRcdG9Bbm5vdGF0aW9ucyA9IG9Nb2RlbC5nZXRPYmplY3QoYCR7c1Byb3BlcnR5UGF0aH1AYCksXG5cdFx0XHRmaWVsZENvbnRyb2wgPSBvQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLkZpZWxkQ29udHJvbFwiXSxcblx0XHRcdGltbXV0YWJsZSA9IG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5JbW11dGFibGVcIl0sXG5cdFx0XHRjb21wdXRlZCA9IG9Bbm5vdGF0aW9uc1tcIkBPcmcuT0RhdGEuQ29yZS5WMS5Db21wdXRlZFwiXTtcblxuXHRcdGxldCBzRWRpdE1vZGU6IEVkaXRNb2RlIHwgc3RyaW5nID0gRWRpdE1vZGUuRWRpdGFibGU7XG5cblx0XHRpZiAoaW1tdXRhYmxlIHx8IGNvbXB1dGVkKSB7XG5cdFx0XHRzRWRpdE1vZGUgPSBFZGl0TW9kZS5SZWFkT25seTtcblx0XHR9IGVsc2UgaWYgKGZpZWxkQ29udHJvbCkge1xuXHRcdFx0aWYgKGZpZWxkQ29udHJvbC4kRW51bU1lbWJlcikge1xuXHRcdFx0XHRpZiAoZmllbGRDb250cm9sLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xUeXBlL1JlYWRPbmx5XCIpIHtcblx0XHRcdFx0XHRzRWRpdE1vZGUgPSBFZGl0TW9kZS5SZWFkT25seTtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0ZmllbGRDb250cm9sLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xUeXBlL0luYXBwbGljYWJsZVwiIHx8XG5cdFx0XHRcdFx0ZmllbGRDb250cm9sLiRFbnVtTWVtYmVyID09PSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5GaWVsZENvbnRyb2xUeXBlL0hpZGRlblwiXG5cdFx0XHRcdCkge1xuXHRcdFx0XHRcdHNFZGl0TW9kZSA9IEVkaXRNb2RlLkRpc2FibGVkO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0XHRpZiAoZmllbGRDb250cm9sLiRQYXRoKSB7XG5cdFx0XHRcdHNFZGl0TW9kZSA9XG5cdFx0XHRcdFx0XCJ7PSAle1wiICtcblx0XHRcdFx0XHRmaWVsZENvbnRyb2wuJFBhdGggK1xuXHRcdFx0XHRcdFwifSA8IDMgPyAoJXtcIiArXG5cdFx0XHRcdFx0ZmllbGRDb250cm9sLiRQYXRoICtcblx0XHRcdFx0XHRcIn0gPT09IDAgPyAnXCIgK1xuXHRcdFx0XHRcdEVkaXRNb2RlLkRpc2FibGVkICtcblx0XHRcdFx0XHRcIicgOiAnXCIgK1xuXHRcdFx0XHRcdEVkaXRNb2RlLlJlYWRPbmx5ICtcblx0XHRcdFx0XHRcIicpIDogJ1wiICtcblx0XHRcdFx0XHRFZGl0TW9kZS5FZGl0YWJsZSArXG5cdFx0XHRcdFx0XCInfVwiO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBzRWRpdE1vZGU7XG5cdH0sXG5cdC8qKlxuXHQgKiBHZXQgdGhlIGNvbXBsZXRlIG1ldGFwYXRoIHRvIHRoZSB0YXJnZXQuXG5cdCAqXG5cdCAqIEBwYXJhbSB0YXJnZXRcblx0ICogQHBhcmFtIG9JbnRlcmZhY2Vcblx0ICogQHJldHVybnMgVGhlIG1ldGFwYXRoXG5cdCAqL1xuXHRnZXRNZXRhUGF0aDogZnVuY3Rpb24gKHRhcmdldDogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHRyZXR1cm4gKG9JbnRlcmZhY2UgJiYgb0ludGVyZmFjZS5jb250ZXh0ICYmIG9JbnRlcmZhY2UuY29udGV4dC5nZXRQYXRoKCkpIHx8IHVuZGVmaW5lZDtcblx0fSxcblx0aXNEZXNrdG9wOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIHN5c3RlbS5kZXNrdG9wID09PSB0cnVlO1xuXHR9LFxuXHRnZXRUYXJnZXRDb2xsZWN0aW9uOiBmdW5jdGlvbiAob0NvbnRleHQ6IGFueSwgbmF2Q29sbGVjdGlvbj86IGFueSkge1xuXHRcdGxldCBzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHRpZiAoXG5cdFx0XHRvQ29udGV4dC5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSA9PT0gXCJzYXAudWkubW9kZWwuQ29udGV4dFwiICYmXG5cdFx0XHQob0NvbnRleHQuZ2V0T2JqZWN0KFwiJGtpbmRcIikgPT09IFwiRW50aXR5U2V0XCIgfHwgb0NvbnRleHQuZ2V0T2JqZWN0KFwiJENvbnRhaW5zVGFyZ2V0XCIpID09PSB0cnVlKVxuXHRcdCkge1xuXHRcdFx0cmV0dXJuIHNQYXRoO1xuXHRcdH1cblx0XHRpZiAob0NvbnRleHQuZ2V0TW9kZWwpIHtcblx0XHRcdHNQYXRoID1cblx0XHRcdFx0KG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YVBhdGggJiYgb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRNZXRhUGF0aChzUGF0aCkpIHx8XG5cdFx0XHRcdG9Db250ZXh0LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkuZ2V0TWV0YVBhdGgoc1BhdGgpO1xuXHRcdH1cblx0XHQvL1N1cHBvcnRpbmcgc1BhdGggb2YgYW55IGZvcm1hdCwgZWl0aGVyICcvPGVudGl0eVNldD4vPG5hdmlnYXRpb25Db2xsZWN0aW9uPicgPE9SPiAnLzxlbnRpdHlTZXQ+LyRUeXBlLzxuYXZpZ2F0aW9uQ29sbGVjdGlvbj4nXG5cdFx0Y29uc3QgYVBhcnRzID0gc1BhdGguc3BsaXQoXCIvXCIpLmZpbHRlcihmdW5jdGlvbiAoc1BhcnQ6IGFueSkge1xuXHRcdFx0cmV0dXJuIHNQYXJ0ICYmIHNQYXJ0ICE9IFwiJFR5cGVcIjtcblx0XHR9KTsgLy9maWx0ZXIgb3V0IGVtcHR5IHN0cmluZ3MgYW5kIHBhcnRzIHJlZmVycmluZyB0byAnJFR5cGUnXG5cdFx0Y29uc3QgZW50aXR5U2V0ID0gYC8ke2FQYXJ0c1swXX1gO1xuXHRcdGlmIChhUGFydHMubGVuZ3RoID09PSAxKSB7XG5cdFx0XHRyZXR1cm4gZW50aXR5U2V0O1xuXHRcdH1cblx0XHRjb25zdCBuYXZpZ2F0aW9uQ29sbGVjdGlvbiA9IG5hdkNvbGxlY3Rpb24gPT09IHVuZGVmaW5lZCA/IGFQYXJ0cy5zbGljZSgxKS5qb2luKFwiLyROYXZpZ2F0aW9uUHJvcGVydHlCaW5kaW5nL1wiKSA6IG5hdkNvbGxlY3Rpb247XG5cdFx0cmV0dXJuIGAke2VudGl0eVNldH0vJE5hdmlnYXRpb25Qcm9wZXJ0eUJpbmRpbmcvJHtuYXZpZ2F0aW9uQ29sbGVjdGlvbn1gOyAvLyB1c2VkIGluIGdvdG9UYXJnZXRFbnRpdHlTZXQgbWV0aG9kIGluIHRoZSBzYW1lIGZpbGVcblx0fSxcblxuXHRpc1Byb3BlcnR5RmlsdGVyYWJsZTogZnVuY3Rpb24gKHByb3BlcnR5OiBhbnksIG9JbnRlcmZhY2U6IGFueSwgb0RhdGFGaWVsZDogYW55KSB7XG5cdFx0Y29uc3Qgb01vZGVsID0gb0ludGVyZmFjZS5jb250ZXh0LmdldE1vZGVsKCksXG5cdFx0XHRzUHJvcGVydHlQYXRoID0gb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKSxcblx0XHRcdC8vIExvYWNhdGlvblBhdGggd291bGQgYmUgdGhlIHByZWZpeCBvZiBzUHJvcGVydHlQYXRoLCBleGFtcGxlOiBzUHJvcGVydHlQYXRoID0gJy9DdXN0b21lci9TZXQvTmFtZScgLT4gc1Byb3BlcnR5TG9jYXRpb25QYXRoID0gJy9DdXN0b21lci9TZXQnXG5cdFx0XHRzUHJvcGVydHlMb2NhdGlvblBhdGggPSBDb21tb25IZWxwZXIuZ2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGgob01vZGVsLCBzUHJvcGVydHlQYXRoKSxcblx0XHRcdHNQcm9wZXJ0eSA9IHNQcm9wZXJ0eVBhdGgucmVwbGFjZShgJHtzUHJvcGVydHlMb2NhdGlvblBhdGh9L2AsIFwiXCIpO1xuXG5cdFx0aWYgKFxuXHRcdFx0b0RhdGFGaWVsZCAmJlxuXHRcdFx0KG9EYXRhRmllbGQuJFR5cGUgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9yQWN0aW9uXCIgfHxcblx0XHRcdFx0b0RhdGFGaWVsZC4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JJbnRlbnRCYXNlZE5hdmlnYXRpb25cIilcblx0XHQpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gQ29tbW9uVXRpbHMuaXNQcm9wZXJ0eUZpbHRlcmFibGUob01vZGVsLCBzUHJvcGVydHlMb2NhdGlvblBhdGgsIHNQcm9wZXJ0eSk7XG5cdH0sXG5cblx0Z2V0TG9jYXRpb25Gb3JQcm9wZXJ0eVBhdGg6IGZ1bmN0aW9uIChvTW9kZWw6IGFueSwgc1Byb3BlcnR5UGF0aDogYW55KSB7XG5cdFx0bGV0IGlMZW5ndGg7XG5cdFx0bGV0IHNDb2xsZWN0aW9uUGF0aCA9IHNQcm9wZXJ0eVBhdGguc2xpY2UoMCwgc1Byb3BlcnR5UGF0aC5sYXN0SW5kZXhPZihcIi9cIikpO1xuXHRcdGlmIChvTW9kZWwuZ2V0T2JqZWN0KGAke3NDb2xsZWN0aW9uUGF0aH0vJGtpbmRgKSA9PT0gXCJFbnRpdHlDb250YWluZXJcIikge1xuXHRcdFx0aUxlbmd0aCA9IHNDb2xsZWN0aW9uUGF0aC5sZW5ndGggKyAxO1xuXHRcdFx0c0NvbGxlY3Rpb25QYXRoID0gc1Byb3BlcnR5UGF0aC5zbGljZShpTGVuZ3RoLCBzUHJvcGVydHlQYXRoLmluZGV4T2YoXCIvXCIsIGlMZW5ndGgpKTtcblx0XHR9XG5cdFx0cmV0dXJuIHNDb2xsZWN0aW9uUGF0aDtcblx0fSxcblx0Z290b0FjdGlvblBhcmFtZXRlcjogZnVuY3Rpb24gKG9Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBzUGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKSxcblx0XHRcdHNQcm9wZXJ0eU5hbWUgPSBvQ29udGV4dC5nZXRPYmplY3QoYCR7c1BhdGh9LyROYW1lYCk7XG5cblx0XHRyZXR1cm4gQ29tbW9uVXRpbHMuZ2V0UGFyYW1ldGVyUGF0aChzUGF0aCwgc1Byb3BlcnR5TmFtZSk7XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBlbnRpdHkgc2V0IG5hbWUgZnJvbSB0aGUgZW50aXR5IHR5cGUgbmFtZS5cblx0ICpcblx0ICogQHBhcmFtIG9NZXRhTW9kZWwgT0RhdGEgdjQgbWV0YW1vZGVsIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBzRW50aXR5VHlwZSBFbnRpdHlUeXBlIG9mIHRoZSBhY3Rpb21cblx0ICogQHJldHVybnMgVGhlIEVudGl0eVNldCBvZiB0aGUgYm91bmQgYWN0aW9uXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0Z2V0RW50aXR5U2V0TmFtZTogZnVuY3Rpb24gKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBzRW50aXR5VHlwZTogc3RyaW5nKSB7XG5cdFx0Y29uc3Qgb0VudGl0eUNvbnRhaW5lciA9IG9NZXRhTW9kZWwuZ2V0T2JqZWN0KFwiL1wiKTtcblx0XHRmb3IgKGNvbnN0IGtleSBpbiBvRW50aXR5Q29udGFpbmVyKSB7XG5cdFx0XHRpZiAodHlwZW9mIG9FbnRpdHlDb250YWluZXJba2V5XSA9PT0gXCJvYmplY3RcIiAmJiBvRW50aXR5Q29udGFpbmVyW2tleV0uJFR5cGUgPT09IHNFbnRpdHlUeXBlKSB7XG5cdFx0XHRcdHJldHVybiBrZXk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbWV0YW1vZGVsIHBhdGggY29ycmVjdGx5IGZvciBib3VuZCBhY3Rpb25zIGlmIHVzZWQgd2l0aCBiUmV0dXJuT25seVBhdGggYXMgdHJ1ZSxcblx0ICogZWxzZSByZXR1cm5zIGFuIG9iamVjdCB3aGljaCBoYXMgMyBwcm9wZXJ0aWVzIHJlbGF0ZWQgdG8gdGhlIGFjdGlvbi4gVGhleSBhcmUgdGhlIGVudGl0eSBzZXQgbmFtZSxcblx0ICogdGhlICRQYXRoIHZhbHVlIG9mIHRoZSBPcGVyYXRpb25BdmFpbGFibGUgYW5ub3RhdGlvbiBhbmQgdGhlIGJpbmRpbmcgcGFyYW1ldGVyIG5hbWUuIElmXG5cdCAqIGJDaGVja1N0YXRpY1ZhbHVlIGlzIHRydWUsIHJldHVybnMgdGhlIHN0YXRpYyB2YWx1ZSBvZiBPcGVyYXRpb25BdmFpbGFibGUgYW5ub3RhdGlvbiwgaWYgcHJlc2VudC5cblx0ICogZS5nLiBmb3IgYm91bmQgYWN0aW9uIHNvbWVOYW1lU3BhY2UuU29tZUJvdW5kQWN0aW9uXG5cdCAqIG9mIGVudGl0eSBzZXQgU29tZUVudGl0eVNldCwgdGhlIHN0cmluZyBcIi9Tb21lRW50aXR5U2V0L3NvbWVOYW1lU3BhY2UuU29tZUJvdW5kQWN0aW9uXCIgaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBwYXJhbSBvQWN0aW9uIFRoZSBjb250ZXh0IG9iamVjdCBvZiB0aGUgYWN0aW9uXG5cdCAqIEBwYXJhbSBiUmV0dXJuT25seVBhdGggSWYgZmFsc2UsIGFkZGl0aW9uYWwgaW5mbyBpcyByZXR1cm5lZCBhbG9uZyB3aXRoIG1ldGFtb2RlbCBwYXRoIHRvIHRoZSBib3VuZCBhY3Rpb25cblx0ICogQHBhcmFtIHNBY3Rpb25OYW1lIFRoZSBuYW1lIG9mIHRoZSBib3VuZCBhY3Rpb24gb2YgdGhlIGZvcm0gc29tZU5hbWVTcGFjZS5Tb21lQm91bmRBY3Rpb25cblx0ICogQHBhcmFtIGJDaGVja1N0YXRpY1ZhbHVlIElmIHRydWUsIHRoZSBzdGF0aWMgdmFsdWUgb2YgT3BlcmF0aW9uQXZhaWxhYmxlIGlzIHJldHVybmVkLCBpZiBwcmVzZW50XG5cdCAqIEByZXR1cm5zIFRoZSBzdHJpbmcgb3Igb2JqZWN0IGFzIHNwZWNpZmllZCBieSBiUmV0dXJuT25seVBhdGhcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRnZXRBY3Rpb25QYXRoOiBmdW5jdGlvbiAob0FjdGlvbjogYW55LCBiUmV0dXJuT25seVBhdGg6IGJvb2xlYW4sIHNBY3Rpb25OYW1lPzogc3RyaW5nLCBiQ2hlY2tTdGF0aWNWYWx1ZT86IGJvb2xlYW4pIHtcblx0XHRsZXQgc0NvbnRleHRQYXRoID0gb0FjdGlvbi5nZXRQYXRoKCkuc3BsaXQoXCIvQFwiKVswXTtcblxuXHRcdHNBY3Rpb25OYW1lID0gIXNBY3Rpb25OYW1lID8gb0FjdGlvbi5nZXRPYmplY3Qob0FjdGlvbi5nZXRQYXRoKCkpIDogc0FjdGlvbk5hbWU7XG5cblx0XHRpZiAoc0FjdGlvbk5hbWUgJiYgc0FjdGlvbk5hbWUuaW5kZXhPZihcIihcIikgPiAtMSkge1xuXHRcdFx0Ly8gYWN0aW9uIGJvdW5kIHRvIGFub3RoZXIgZW50aXR5IHR5cGVcblx0XHRcdHNBY3Rpb25OYW1lID0gc0FjdGlvbk5hbWUuc3BsaXQoXCIoXCIpWzBdO1xuXHRcdH0gZWxzZSBpZiAob0FjdGlvbi5nZXRPYmplY3Qoc0NvbnRleHRQYXRoKSkge1xuXHRcdFx0Ly8gVE9ETzogdGhpcyBsb2dpYyBzb3VuZHMgd3JvbmcsIHRvIGJlIGNvcnJlY3RlZFxuXHRcdFx0Y29uc3Qgc0VudGl0eVR5cGVOYW1lID0gb0FjdGlvbi5nZXRPYmplY3Qoc0NvbnRleHRQYXRoKS4kVHlwZTtcblx0XHRcdGNvbnN0IHNFbnRpdHlOYW1lID0gdGhpcy5nZXRFbnRpdHlTZXROYW1lKG9BY3Rpb24uZ2V0TW9kZWwoKSwgc0VudGl0eVR5cGVOYW1lKTtcblx0XHRcdGlmIChzRW50aXR5TmFtZSkge1xuXHRcdFx0XHRzQ29udGV4dFBhdGggPSBgLyR7c0VudGl0eU5hbWV9YDtcblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIHNDb250ZXh0UGF0aDtcblx0XHR9XG5cblx0XHRpZiAoYkNoZWNrU3RhdGljVmFsdWUpIHtcblx0XHRcdHJldHVybiBvQWN0aW9uLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9LyR7c0FjdGlvbk5hbWV9QE9yZy5PRGF0YS5Db3JlLlYxLk9wZXJhdGlvbkF2YWlsYWJsZWApO1xuXHRcdH1cblx0XHRpZiAoYlJldHVybk9ubHlQYXRoKSB7XG5cdFx0XHRyZXR1cm4gYCR7c0NvbnRleHRQYXRofS8ke3NBY3Rpb25OYW1lfWA7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiB7XG5cdFx0XHRcdHNDb250ZXh0UGF0aDogc0NvbnRleHRQYXRoLFxuXHRcdFx0XHRzUHJvcGVydHk6IG9BY3Rpb24uZ2V0T2JqZWN0KGAke3NDb250ZXh0UGF0aH0vJHtzQWN0aW9uTmFtZX1AT3JnLk9EYXRhLkNvcmUuVjEuT3BlcmF0aW9uQXZhaWxhYmxlLyRQYXRoYCksXG5cdFx0XHRcdHNCaW5kaW5nUGFyYW1ldGVyOiBvQWN0aW9uLmdldE9iamVjdChgJHtzQ29udGV4dFBhdGh9LyR7c0FjdGlvbk5hbWV9L0AkdWk1Lm92ZXJsb2FkLzAvJFBhcmFtZXRlci8wLyROYW1lYClcblx0XHRcdH07XG5cdFx0fVxuXHR9LFxuXG5cdGdldE5hdmlnYXRpb25Db250ZXh0OiBmdW5jdGlvbiAob0NvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiBPRGF0YU1vZGVsQW5ub3RhdGlvbkhlbHBlci5nZXROYXZpZ2F0aW9uUGF0aChvQ29udGV4dC5nZXRQYXRoKCkpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBwYXRoIHdpdGhvdXQgdGhlIGVudGl0eSB0eXBlIChwb3RlbnRpYWxseSBmaXJzdCkgYW5kIHByb3BlcnR5IChsYXN0KSBwYXJ0IChvcHRpb25hbCkuXG5cdCAqIFRoZSByZXN1bHQgY2FuIGJlIGFuIGVtcHR5IHN0cmluZyBpZiBpdCBpcyBhIHNpbXBsZSBkaXJlY3QgcHJvcGVydHkuXG5cdCAqXG5cdCAqIElmIGFuZCBvbmx5IGlmIHRoZSBnaXZlbiBwcm9wZXJ0eSBwYXRoIHN0YXJ0cyB3aXRoIGEgc2xhc2ggKC8pLCBpdCBpcyBjb25zaWRlcmVkIHRoYXQgdGhlIGVudGl0eSB0eXBlXG5cdCAqIGlzIHBhcnQgb2YgdGhlIHBhdGggYW5kIHdpbGwgYmUgc3RyaXBwZWQgYXdheS5cblx0ICpcblx0ICogQHBhcmFtIHNQcm9wZXJ0eVBhdGhcblx0ICogQHBhcmFtIGJLZWVwUHJvcGVydHlcblx0ICogQHJldHVybnMgVGhlIG5hdmlnYXRpb24gcGF0aFxuXHQgKi9cblx0Z2V0TmF2aWdhdGlvblBhdGg6IGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBhbnksIGJLZWVwUHJvcGVydHk/OiBib29sZWFuKSB7XG5cdFx0Y29uc3QgYlN0YXJ0c1dpdGhFbnRpdHlUeXBlID0gc1Byb3BlcnR5UGF0aC5zdGFydHNXaXRoKFwiL1wiKTtcblx0XHRjb25zdCBhUGFydHMgPSBzUHJvcGVydHlQYXRoLnNwbGl0KFwiL1wiKS5maWx0ZXIoZnVuY3Rpb24gKHBhcnQ6IGFueSkge1xuXHRcdFx0cmV0dXJuICEhcGFydDtcblx0XHR9KTtcblx0XHRpZiAoYlN0YXJ0c1dpdGhFbnRpdHlUeXBlKSB7XG5cdFx0XHRhUGFydHMuc2hpZnQoKTtcblx0XHR9XG5cdFx0aWYgKCFiS2VlcFByb3BlcnR5KSB7XG5cdFx0XHRhUGFydHMucG9wKCk7XG5cdFx0fVxuXHRcdHJldHVybiBhUGFydHMuam9pbihcIi9cIik7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIGNvcnJlY3QgbWV0YW1vZGVsIHBhdGggZm9yIGJvdW5kIGFjdGlvbnMuXG5cdCAqXG5cdCAqIFNpbmNlIHRoaXMgbWV0aG9kIGlzIGNhbGxlZCBpcnJlc3BlY3RpdmUgb2YgdGhlIGFjdGlvbiB0eXBlLCB0aGlzIHdpbGwgYmUgYXBwbGllZCB0byB1bmJvdW5kIGFjdGlvbnMuXG5cdCAqIEluIHN1Y2ggYSBjYXNlLCBpZiBhbiBpbmNvcnJlY3QgcGF0aCBpcyByZXR1cm5lZCwgaXQgaXMgaWdub3JlZCBkdXJpbmcgdGVtcGxhdGluZy5cblx0ICpcblx0ICogRXhhbXBsZTogZm9yIHRoZSBib3VuZCBhY3Rpb24gc29tZU5hbWVTcGFjZS5Tb21lQm91bmRBY3Rpb24gb2YgZW50aXR5IHNldCBTb21lRW50aXR5U2V0LFxuXHQgKiB0aGUgc3RyaW5nIFwiL1NvbWVFbnRpdHlTZXQvc29tZU5hbWVTcGFjZS5Tb21lQm91bmRBY3Rpb25cIiBpcyByZXR1cm5lZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBzdGF0aWNcblx0ICogQG5hbWUgc2FwLmZlLm1hY3Jvcy5Db21tb25IZWxwZXIuZ2V0QWN0aW9uQ29udGV4dFxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5Db21tb25IZWxwZXJcblx0ICogQHBhcmFtIG9BY3Rpb24gQ29udGV4dCBvYmplY3QgZm9yIHRoZSBhY3Rpb25cblx0ICogQHJldHVybnMgQ29ycmVjdCBtZXRhbW9kZWwgcGF0aCBmb3IgYm91bmQgYW5kIGluY29ycmVjdCBwYXRoIGZvciB1bmJvdW5kIGFjdGlvbnNcblx0ICogQHByaXZhdGVcblx0ICogQHVpNS1yZXN0cmljdGVkXG5cdCAqL1xuXHRnZXRBY3Rpb25Db250ZXh0OiBmdW5jdGlvbiAob0FjdGlvbjogb2JqZWN0KSB7XG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5nZXRBY3Rpb25QYXRoKG9BY3Rpb24sIHRydWUpO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgbWV0YW1vZGVsIHBhdGggY29ycmVjdGx5IGZvciBvdmVybG9hZGVkIGJvdW5kIGFjdGlvbnMuIEZvciB1bmJvdW5kIGFjdGlvbnMsXG5cdCAqIHRoZSBpbmNvcnJlY3QgcGF0aCBpcyByZXR1cm5lZCwgYnV0IGlnbm9yZWQgZHVyaW5nIHRlbXBsYXRpbmcuXG5cdCAqIGUuZy4gZm9yIGJvdW5kIGFjdGlvbiBzb21lTmFtZVNwYWNlLlNvbWVCb3VuZEFjdGlvbiBvZiBlbnRpdHkgc2V0IFNvbWVFbnRpdHlTZXQsXG5cdCAqIHRoZSBzdHJpbmcgXCIvU29tZUVudGl0eVNldC9zb21lTmFtZVNwYWNlLlNvbWVCb3VuZEFjdGlvbi9AJHVpNS5vdmVybG9hZC8wXCIgaXMgcmV0dXJuZWQuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAc3RhdGljXG5cdCAqIEBuYW1lIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyLmdldFBhdGhUb0JvdW5kQWN0aW9uT3ZlcmxvYWRcblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSBvQWN0aW9uIFRoZSBjb250ZXh0IG9iamVjdCBmb3IgdGhlIGFjdGlvblxuXHQgKiBAcmV0dXJucyBUaGUgY29ycmVjdCBtZXRhbW9kZWwgcGF0aCBmb3IgYm91bmQgYWN0aW9uIG92ZXJsb2FkIGFuZCBpbmNvcnJlY3QgcGF0aCBmb3IgdW5ib3VuZCBhY3Rpb25zXG5cdCAqIEBwcml2YXRlXG5cdCAqIEB1aTUtcmVzdHJpY3RlZFxuXHQgKi9cblx0Z2V0UGF0aFRvQm91bmRBY3Rpb25PdmVybG9hZDogZnVuY3Rpb24gKG9BY3Rpb246IG9iamVjdCkge1xuXHRcdGNvbnN0IHNQYXRoID0gQ29tbW9uSGVscGVyLmdldEFjdGlvblBhdGgob0FjdGlvbiwgdHJ1ZSk7XG5cdFx0cmV0dXJuIGAke3NQYXRofS9AJHVpNS5vdmVybG9hZC8wYDtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgc3RyaW5nIHdpdGggc2luZ2xlIHF1b3Rlcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLkNvbW1vbkhlbHBlclxuXHQgKiBAcGFyYW0gc1ZhbHVlIFNvbWUgc3RyaW5nIHRoYXQgbmVlZHMgdG8gYmUgY29udmVydGVkIGludG8gc2luZ2xlIHF1b3Rlc1xuXHQgKiBAcGFyYW0gW2JFc2NhcGVdIFNob3VsZCB0aGUgc3RyaW5nIGJlIGVzY2FwZWQgYmVmb3JlaGFuZFxuXHQgKiBAcmV0dXJucyAtIFN0cmluZyB3aXRoIHNpbmdsZSBxdW90ZXNcblx0ICovXG5cdGFkZFNpbmdsZVF1b3RlczogZnVuY3Rpb24gKHNWYWx1ZTogc3RyaW5nLCBiRXNjYXBlPzogYm9vbGVhbikge1xuXHRcdGlmIChiRXNjYXBlICYmIHNWYWx1ZSkge1xuXHRcdFx0c1ZhbHVlID0gdGhpcy5lc2NhcGVTaW5nbGVRdW90ZXMoc1ZhbHVlKTtcblx0XHR9XG5cdFx0cmV0dXJuIGAnJHtzVmFsdWV9J2A7XG5cdH0sXG5cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIHN0cmluZyB3aXRoIGVzY2FwZWQgc2luZ2xlIHF1b3Rlcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLkNvbW1vbkhlbHBlclxuXHQgKiBAcGFyYW0gc1ZhbHVlIFNvbWUgc3RyaW5nIHRoYXQgbmVlZHMgZXNjYXBpbmcgb2Ygc2luZ2xlIHF1b3Rlc1xuXHQgKiBAcmV0dXJucyAtIFN0cmluZyB3aXRoIGVzY2FwZWQgc2luZ2xlIHF1b3Rlc1xuXHQgKi9cblx0ZXNjYXBlU2luZ2xlUXVvdGVzOiBmdW5jdGlvbiAoc1ZhbHVlOiBzdHJpbmcpIHtcblx0XHRyZXR1cm4gc1ZhbHVlLnJlcGxhY2UoL1snXS9nLCBcIlxcXFwnXCIpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBmdW5jdGlvbiBzdHJpbmdcblx0ICogVGhlIGZpcnN0IGFyZ3VtZW50IG9mIGdlbmVyYXRlRnVuY3Rpb24gaXMgbmFtZSBvZiB0aGUgZ2VuZXJhdGVkIGZ1bmN0aW9uIHN0cmluZy5cblx0ICogUmVtYWluaW5nIGFyZ3VtZW50cyBvZiBnZW5lcmF0ZUZ1bmN0aW9uIGFyZSBhcmd1bWVudHMgb2YgdGhlIG5ld2x5IGdlbmVyYXRlZCBmdW5jdGlvbiBzdHJpbmcuXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbWVtYmVyb2Ygc2FwLmZlLm1hY3Jvcy5Db21tb25IZWxwZXJcblx0ICogQHBhcmFtIHNGdW5jTmFtZSBTb21lIHN0cmluZyBmb3IgdGhlIGZ1bmN0aW9uIG5hbWVcblx0ICogQHBhcmFtIGFyZ3MgVGhlIHJlbWFpbmluZyBhcmd1bWVudHNcblx0ICogQHJldHVybnMgLSBGdW5jdGlvbiBzdHJpbmcgZGVwZW5kcyBvbiBhcmd1bWVudHMgcGFzc2VkXG5cdCAqL1xuXHRnZW5lcmF0ZUZ1bmN0aW9uOiBmdW5jdGlvbiAoc0Z1bmNOYW1lOiBzdHJpbmcsIC4uLmFyZ3M6IHN0cmluZ1tdKSB7XG5cdFx0bGV0IHNQYXJhbXMgPSBcIlwiO1xuXHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuXHRcdFx0c1BhcmFtcyArPSBhcmdzW2ldO1xuXHRcdFx0aWYgKGkgPCBhcmdzLmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0c1BhcmFtcyArPSBcIiwgXCI7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0bGV0IHNGdW5jdGlvbiA9IGAke3NGdW5jTmFtZX0oKWA7XG5cdFx0aWYgKHNQYXJhbXMpIHtcblx0XHRcdHNGdW5jdGlvbiA9IGAke3NGdW5jTmFtZX0oJHtzUGFyYW1zfSlgO1xuXHRcdH1cblx0XHRyZXR1cm4gc0Z1bmN0aW9uO1xuXHR9LFxuXHQvKlxuXHQgKiBSZXR1cm5zIHRoZSB2aXNpYmlsaXR5IGV4cHJlc3Npb24gZm9yIGRhdGFwb2ludCB0aXRsZS9saW5rXG5cdCAqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAcGFyYW0ge3N0cmluZ30gW3NQYXRoXSBhbm5vdGF0aW9uIHBhdGggb2YgZGF0YSBwb2ludCBvciBNaWNyb2NoYXJ0XG5cdCAqIEBwYXJhbSB7Ym9vbGVhbn0gW2JMaW5rXSB0cnVlIGlmIGxpbmsgdmlzaWJpbGl0eSBpcyBiZWluZyBkZXRlcm1pbmVkLCBmYWxzZSBpZiB0aXRsZSB2aXNpYmlsaXR5IGlzIGJlaW5nIGRldGVybWluZWRcblx0ICogQHBhcmFtIHtib29sZWFufSBbYkZpZWxkVmlzaWJpbGl0eV0gdHJ1ZSBpZiBmaWVsZCBpcyB2c2lpYmxlLCBmYWxzZSBvdGhlcndpc2Vcblx0ICogQHJldHVybnMgIHtzdHJpbmd9IHNWaXNpYmlsaXR5RXhwIFVzZWQgdG8gZ2V0IHRoZSAgdmlzaWJpbGl0eSBiaW5kaW5nIGZvciBEYXRhUG9pbnRzIHRpdGxlIGluIHRoZSBIZWFkZXIuXG5cdCAqXG5cdCAqL1xuXG5cdGdldEhlYWRlckRhdGFQb2ludExpbmtWaXNpYmlsaXR5OiBmdW5jdGlvbiAoc1BhdGg6IGFueSwgYkxpbms6IGFueSwgYkZpZWxkVmlzaWJpbGl0eTogYW55KSB7XG5cdFx0bGV0IHNWaXNpYmlsaXR5RXhwO1xuXHRcdGlmIChiRmllbGRWaXNpYmlsaXR5KSB7XG5cdFx0XHRzVmlzaWJpbGl0eUV4cCA9IGJMaW5rXG5cdFx0XHRcdD8gXCJ7PSAke2ludGVybmFsPmlzSGVhZGVyRFBMaW5rVmlzaWJsZS9cIiArIHNQYXRoICsgXCJ9ID09PSB0cnVlICYmIFwiICsgYkZpZWxkVmlzaWJpbGl0eSArIFwifVwiXG5cdFx0XHRcdDogXCJ7PSAke2ludGVybmFsPmlzSGVhZGVyRFBMaW5rVmlzaWJsZS9cIiArIHNQYXRoICsgXCJ9ICE9PSB0cnVlICYmIFwiICsgYkZpZWxkVmlzaWJpbGl0eSArIFwifVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzVmlzaWJpbGl0eUV4cCA9IGJMaW5rXG5cdFx0XHRcdD8gXCJ7PSAke2ludGVybmFsPmlzSGVhZGVyRFBMaW5rVmlzaWJsZS9cIiArIHNQYXRoICsgXCJ9ID09PSB0cnVlfVwiXG5cdFx0XHRcdDogXCJ7PSAke2ludGVybmFsPmlzSGVhZGVyRFBMaW5rVmlzaWJsZS9cIiArIHNQYXRoICsgXCJ9ICE9PSB0cnVlfVwiO1xuXHRcdH1cblx0XHRyZXR1cm4gc1Zpc2liaWxpdHlFeHA7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENvbnZlcnRzIG9iamVjdCB0byBzdHJpbmcoZGlmZmVyZW50IGZyb20gSlNPTi5zdHJpbmdpZnkgb3IudG9TdHJpbmcpLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSBvUGFyYW1zIFNvbWUgb2JqZWN0XG5cdCAqIEByZXR1cm5zIC0gT2JqZWN0IHN0cmluZ1xuXHQgKi9cblx0b2JqZWN0VG9TdHJpbmc6IGZ1bmN0aW9uIChvUGFyYW1zOiBhbnkpIHtcblx0XHRsZXQgaU51bWJlck9mS2V5cyA9IE9iamVjdC5rZXlzKG9QYXJhbXMpLmxlbmd0aCxcblx0XHRcdHNQYXJhbXMgPSBcIlwiO1xuXG5cdFx0Zm9yIChjb25zdCBzS2V5IGluIG9QYXJhbXMpIHtcblx0XHRcdGxldCBzVmFsdWUgPSBvUGFyYW1zW3NLZXldO1xuXHRcdFx0aWYgKHNWYWx1ZSAmJiB0eXBlb2Ygc1ZhbHVlID09PSBcIm9iamVjdFwiKSB7XG5cdFx0XHRcdHNWYWx1ZSA9IHRoaXMub2JqZWN0VG9TdHJpbmcoc1ZhbHVlKTtcblx0XHRcdH1cblx0XHRcdHNQYXJhbXMgKz0gYCR7c0tleX06ICR7c1ZhbHVlfWA7XG5cdFx0XHRpZiAoaU51bWJlck9mS2V5cyA+IDEpIHtcblx0XHRcdFx0LS1pTnVtYmVyT2ZLZXlzO1xuXHRcdFx0XHRzUGFyYW1zICs9IFwiLCBcIjtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gYHsgJHtzUGFyYW1zfX1gO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZW1vdmVzIGVzY2FwZSBjaGFyYWN0ZXJzIChcXCkgZnJvbSBhbiBleHByZXNzaW9uLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSBzRXhwcmVzc2lvbiBBbiBleHByZXNzaW9uIHdpdGggZXNjYXBlIGNoYXJhY3RlcnNcblx0ICogQHJldHVybnMgRXhwcmVzc2lvbiBzdHJpbmcgd2l0aG91dCBlc2NhcGUgY2hhcmFjdGVycyBvciB1bmRlZmluZWRcblx0ICovXG5cdHJlbW92ZUVzY2FwZUNoYXJhY3RlcnM6IGZ1bmN0aW9uIChzRXhwcmVzc2lvbjogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHNFeHByZXNzaW9uID8gc0V4cHJlc3Npb24ucmVwbGFjZSgvXFxcXD9cXFxcKFt7fV0pL2csIFwiJDFcIikgOiB1bmRlZmluZWQ7XG5cdH0sXG5cblx0LyoqXG5cdCAqIE1ha2VzIHVwZGF0ZXMgdG8gYSBzdHJpbmdpZmllZCBvYmplY3Qgc28gdGhhdCBpdCB3b3JrcyBwcm9wZXJseSBpbiBhIHRlbXBsYXRlIGJ5IGFkZGluZyB1aTVPYmplY3Q6dHJ1ZS5cblx0ICpcblx0ICogQHBhcmFtIHNTdHJpbmdpZmllZFxuXHQgKiBAcmV0dXJucyBUaGUgdXBkYXRlZCBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG9iamVjdFxuXHQgKi9cblx0c3RyaW5naWZ5T2JqZWN0OiBmdW5jdGlvbiAoc1N0cmluZ2lmaWVkOiBzdHJpbmcpIHtcblx0XHRpZiAoIXNTdHJpbmdpZmllZCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Y29uc3Qgb09iamVjdCA9IEpTT04ucGFyc2Uoc1N0cmluZ2lmaWVkKTtcblx0XHRcdGlmICh0eXBlb2Ygb09iamVjdCA9PT0gXCJvYmplY3RcIiAmJiAhQXJyYXkuaXNBcnJheShvT2JqZWN0KSkge1xuXHRcdFx0XHRjb25zdCBvVUk1T2JqZWN0ID0ge1xuXHRcdFx0XHRcdHVpNW9iamVjdDogdHJ1ZVxuXHRcdFx0XHR9O1xuXHRcdFx0XHRPYmplY3QuYXNzaWduKG9VSTVPYmplY3QsIG9PYmplY3QpO1xuXHRcdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkob1VJNU9iamVjdCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjb25zdCBzVHlwZSA9IEFycmF5LmlzQXJyYXkob09iamVjdCkgPyBcIkFycmF5XCIgOiB0eXBlb2Ygb09iamVjdDtcblx0XHRcdFx0TG9nLmVycm9yKGBVbmV4cGVjdGVkIG9iamVjdCB0eXBlIGluIHN0cmluZ2lmeU9iamVjdCAoJHtzVHlwZX0pIC0gb25seSB3b3JrcyB3aXRoIG9iamVjdGApO1xuXHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJzdHJpbmdpZnlPYmplY3Qgb25seSB3b3JrcyB3aXRoIG9iamVjdHMhXCIpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogQ3JlYXRlIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBnaXZlbiBkYXRhLCB0YWtpbmcgY2FyZSB0aGF0IGl0IGlzIG5vdCB0cmVhdGVkIGFzIGEgYmluZGluZyBleHByZXNzaW9uLlxuXHQgKlxuXHQgKiBAcGFyYW0gdkRhdGEgVGhlIGRhdGEgdG8gc3RyaW5naWZ5XG5cdCAqIEByZXR1cm5zIFRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIGRhdGEuXG5cdCAqL1xuXHRzdHJpbmdpZnlDdXN0b21EYXRhOiBmdW5jdGlvbiAodkRhdGE6IG9iamVjdCkge1xuXHRcdGNvbnN0IG9PYmplY3Q6IGFueSA9IHtcblx0XHRcdHVpNW9iamVjdDogdHJ1ZVxuXHRcdH07XG5cdFx0b09iamVjdFtcImN1c3RvbURhdGFcIl0gPSB2RGF0YSBpbnN0YW5jZW9mIENvbnRleHQgPyB2RGF0YS5nZXRPYmplY3QoKSA6IHZEYXRhO1xuXHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShvT2JqZWN0KTtcblx0fSxcblxuXHQvKipcblx0ICogUGFyc2VzIHRoZSBnaXZlbiBkYXRhLCBwb3RlbnRpYWxseSB1bndyYXBzIHRoZSBkYXRhLlxuXHQgKlxuXHQgKiBAcGFyYW0gdkRhdGEgVGhlIGRhdGEgdG8gcGFyc2Vcblx0ICogQHJldHVybnMgVGhlIHJlc3VsdCBvZiB0aGUgZGF0YSBwYXJzaW5nXG5cdCAqL1xuXHRwYXJzZUN1c3RvbURhdGE6IGZ1bmN0aW9uICh2RGF0YTogYW55KSB7XG5cdFx0dkRhdGEgPSB0eXBlb2YgdkRhdGEgPT09IFwic3RyaW5nXCIgPyBKU09OLnBhcnNlKHZEYXRhKSA6IHZEYXRhO1xuXHRcdGlmICh2RGF0YSAmJiB2RGF0YS5oYXNPd25Qcm9wZXJ0eShcImN1c3RvbURhdGFcIikpIHtcblx0XHRcdHJldHVybiB2RGF0YVtcImN1c3RvbURhdGFcIl07XG5cdFx0fVxuXHRcdHJldHVybiB2RGF0YTtcblx0fSxcblx0LyoqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBfZ2V0RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFUeXBlXG5cdCAqIEBwYXJhbSBvTWV0YU1vZGVsXG5cdCAqIEBwYXJhbSBzRW50aXR5VHlwZSBUaGUgRW50aXR5VHlwZSBuYW1lXG5cdCAqIEByZXR1cm5zIFRoZSBEcmFmdEFkbWluaXN0cmF0aXZlRGF0YVxuXHQgKi9cblx0X2dldERyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhVHlwZTogZnVuY3Rpb24gKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsLCBzRW50aXR5VHlwZTogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChgLyR7c0VudGl0eVR5cGV9L0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL2ApO1xuXHR9LFxuXHQvKipcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFBvcG92ZXJUZXh0XG5cdCAqIEBwYXJhbSBpQ29udGV4dFxuXHQgKiBAcGFyYW0gc0VudGl0eVR5cGUgVGhlIEVudGl0eVR5cGUgbmFtZVxuXHQgKiBAcmV0dXJucyBUaGUgQmluZGluZyBFeHByZXNzaW9uIGZvciB0aGUgZHJhZnQgcG9wb3ZlclxuXHQgKi9cblx0Z2V0UG9wb3ZlclRleHQ6IGZ1bmN0aW9uIChpQ29udGV4dDogYW55LCBzRW50aXR5VHlwZTogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIENvbW1vbkhlbHBlci5fZ2V0RHJhZnRBZG1pbmlzdHJhdGl2ZURhdGFUeXBlKGlDb250ZXh0LmdldE1vZGVsKCksIHNFbnRpdHlUeXBlKS50aGVuKGZ1bmN0aW9uIChvREFERW50aXR5VHlwZSkge1xuXHRcdFx0bGV0IHNCaW5kaW5nID1cblx0XHRcdFx0XCJ7cGFydHM6IFt7cGF0aDogJ0hhc0RyYWZ0RW50aXR5JywgdGFyZ2V0VHlwZTogJ2FueSd9LCBcIiArXG5cdFx0XHRcdC8vXCJ7cGF0aDogJ0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0xhc3RDaGFuZ2VEYXRlVGltZSd9LCBcIiArXG5cdFx0XHRcdFwie3BhdGg6ICdEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9JblByb2Nlc3NCeVVzZXInfSwgXCIgK1xuXHRcdFx0XHRcIntwYXRoOiAnRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvTGFzdENoYW5nZWRCeVVzZXInfSBcIjtcblx0XHRcdGlmIChvREFERW50aXR5VHlwZS5JblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvbikge1xuXHRcdFx0XHRzQmluZGluZyArPSBcIiAse3BhdGg6ICdEcmFmdEFkbWluaXN0cmF0aXZlRGF0YS9JblByb2Nlc3NCeVVzZXJEZXNjcmlwdGlvbid9XCI7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChvREFERW50aXR5VHlwZS5MYXN0Q2hhbmdlZEJ5VXNlckRlc2NyaXB0aW9uKSB7XG5cdFx0XHRcdHNCaW5kaW5nICs9IFwiLCB7cGF0aDogJ0RyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0xhc3RDaGFuZ2VkQnlVc2VyRGVzY3JpcHRpb24nfVwiO1xuXHRcdFx0fVxuXHRcdFx0c0JpbmRpbmcgKz0gXCJdLCBmb3JtYXR0ZXI6ICdzYXAuZmUubWFjcm9zLmZpZWxkLkZpZWxkUnVudGltZS5mb3JtYXREcmFmdE93bmVyVGV4dEluUG9wb3Zlcid9XCI7XG5cdFx0XHRyZXR1cm4gc0JpbmRpbmc7XG5cdFx0fSk7XG5cdH0sXG5cdGdldENvbnRleHRQYXRoOiBmdW5jdGlvbiAob1ZhbHVlOiBhbnksIG9JbnRlcmZhY2U6IGFueSkge1xuXHRcdGNvbnN0IHNQYXRoID0gb0ludGVyZmFjZSAmJiBvSW50ZXJmYWNlLmNvbnRleHQgJiYgb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKTtcblx0XHRyZXR1cm4gc1BhdGhbc1BhdGgubGVuZ3RoIC0gMV0gPT09IFwiL1wiID8gc1BhdGguc2xpY2UoMCwgLTEpIDogc1BhdGg7XG5cdH0sXG5cdC8qKlxuXHQgKiBSZXR1cm5zIGEgc3RyaW5naWZpZWQgSlNPTiBvYmplY3QgY29udGFpbmluZyAgUHJlc2VudGF0aW9uIFZhcmlhbnQgc29ydCBjb25kaXRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHRcblx0ICogQHBhcmFtIG9QcmVzZW50YXRpb25WYXJpYW50IFByZXNlbnRhdGlvbiB2YXJpYW50IEFubm90YXRpb25cblx0ICogQHBhcmFtIHNQcmVzZW50YXRpb25WYXJpYW50UGF0aFxuXHQgKiBAcmV0dXJucyBTdHJpbmdpZmllZCBKU09OIG9iamVjdFxuXHQgKi9cblx0Z2V0U29ydENvbmRpdGlvbnM6IGZ1bmN0aW9uIChvQ29udGV4dDogYW55LCBvUHJlc2VudGF0aW9uVmFyaWFudDogYW55LCBzUHJlc2VudGF0aW9uVmFyaWFudFBhdGg6IHN0cmluZykge1xuXHRcdGlmIChcblx0XHRcdG9QcmVzZW50YXRpb25WYXJpYW50ICYmXG5cdFx0XHRDb21tb25IZWxwZXIuX2lzUHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24oc1ByZXNlbnRhdGlvblZhcmlhbnRQYXRoKSAmJlxuXHRcdFx0b1ByZXNlbnRhdGlvblZhcmlhbnQuU29ydE9yZGVyXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBhU29ydENvbmRpdGlvbnM6IGFueSA9IHtcblx0XHRcdFx0c29ydGVyczogW11cblx0XHRcdH07XG5cblx0XHRcdGNvbnN0IHNFbnRpdHlQYXRoID0gb0NvbnRleHQuZ2V0UGF0aCgwKS5zcGxpdChcIkBcIilbMF07XG5cdFx0XHRvUHJlc2VudGF0aW9uVmFyaWFudC5Tb3J0T3JkZXIuZm9yRWFjaChmdW5jdGlvbiAob0NvbmRpdGlvbjogYW55ID0ge30pIHtcblx0XHRcdFx0bGV0IG9Tb3J0UHJvcGVydHk6IGFueSA9IHt9O1xuXHRcdFx0XHRjb25zdCBvU29ydGVyOiBhbnkgPSB7fTtcblx0XHRcdFx0aWYgKG9Db25kaXRpb24uRHluYW1pY1Byb3BlcnR5KSB7XG5cdFx0XHRcdFx0b1NvcnRQcm9wZXJ0eSA9IG9Db250ZXh0LmdldE1vZGVsKDApLmdldE9iamVjdChzRW50aXR5UGF0aCArIG9Db25kaXRpb24uRHluYW1pY1Byb3BlcnR5LiRBbm5vdGF0aW9uUGF0aCk/Lk5hbWU7XG5cdFx0XHRcdH0gZWxzZSBpZiAob0NvbmRpdGlvbi5Qcm9wZXJ0eSkge1xuXHRcdFx0XHRcdG9Tb3J0UHJvcGVydHkgPSBvQ29uZGl0aW9uLlByb3BlcnR5LiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdH1cblx0XHRcdFx0aWYgKG9Tb3J0UHJvcGVydHkpIHtcblx0XHRcdFx0XHRvU29ydGVyLm5hbWUgPSBvU29ydFByb3BlcnR5O1xuXHRcdFx0XHRcdG9Tb3J0ZXIuZGVzY2VuZGluZyA9ICEhb0NvbmRpdGlvbi5EZXNjZW5kaW5nO1xuXHRcdFx0XHRcdGFTb3J0Q29uZGl0aW9ucy5zb3J0ZXJzLnB1c2gob1NvcnRlcik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dGhyb3cgbmV3IEVycm9yKFwiUGxlYXNlIGRlZmluZSB0aGUgcmlnaHQgcGF0aCB0byB0aGUgc29ydCBwcm9wZXJ0eVwiKTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0XHRyZXR1cm4gSlNPTi5zdHJpbmdpZnkoYVNvcnRDb25kaXRpb25zKTtcblx0XHR9XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fSxcblx0X2lzUHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb246IGZ1bmN0aW9uIChzQW5ub3RhdGlvblBhdGg6IHN0cmluZykge1xuXHRcdHJldHVybiAoXG5cdFx0XHRzQW5ub3RhdGlvblBhdGguaW5kZXhPZihcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5QcmVzZW50YXRpb25WYXJpYW50XCIpID4gLTEgfHxcblx0XHRcdHNBbm5vdGF0aW9uUGF0aC5pbmRleE9mKFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRcIikgPiAtMVxuXHRcdCk7XG5cdH0sXG5cdGNyZWF0ZVByZXNlbnRhdGlvblBhdGhDb250ZXh0OiBmdW5jdGlvbiAob1ByZXNlbnRhdGlvbkNvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IGFQYXRocyA9IG9QcmVzZW50YXRpb25Db250ZXh0LnNQYXRoLnNwbGl0KFwiQFwiKSB8fCBbXTtcblx0XHRjb25zdCBvTW9kZWwgPSBvUHJlc2VudGF0aW9uQ29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdGlmIChhUGF0aHMubGVuZ3RoICYmIGFQYXRoc1thUGF0aHMubGVuZ3RoIC0gMV0uaW5kZXhPZihcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvblByZXNlbnRhdGlvblZhcmlhbnRcIikgPiAtMSkge1xuXHRcdFx0Y29uc3Qgc1BhdGggPSBvUHJlc2VudGF0aW9uQ29udGV4dC5zUGF0aC5zcGxpdChcIi9QcmVzZW50YXRpb25WYXJpYW50XCIpWzBdO1xuXHRcdFx0cmV0dXJuIG9Nb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChgJHtzUGF0aH1Ac2FwdWkubmFtZWApO1xuXHRcdH1cblx0XHRyZXR1cm4gb01vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGAke29QcmVzZW50YXRpb25Db250ZXh0LnNQYXRofUBzYXB1aS5uYW1lYCk7XG5cdH0sXG5cdGdldFByZXNzSGFuZGxlckZvckRhdGFGaWVsZEZvcklCTjogZnVuY3Rpb24gKG9EYXRhRmllbGQ6IGFueSwgc0NvbnRleHQ6IHN0cmluZywgYk5hdmlnYXRlV2l0aENvbmZpcm1hdGlvbkRpYWxvZzogYm9vbGVhbikge1xuXHRcdGNvbnN0IG1OYXZpZ2F0aW9uUGFyYW1ldGVyczogYW55ID0ge1xuXHRcdFx0bmF2aWdhdGlvbkNvbnRleHRzOiBzQ29udGV4dCA/IHNDb250ZXh0IDogXCIkeyRzb3VyY2U+L30uZ2V0QmluZGluZ0NvbnRleHQoKVwiXG5cdFx0fTtcblx0XHRpZiAob0RhdGFGaWVsZC5SZXF1aXJlc0NvbnRleHQgJiYgIW9EYXRhRmllbGQuSW5saW5lICYmIGJOYXZpZ2F0ZVdpdGhDb25maXJtYXRpb25EaWFsb2cpIHtcblx0XHRcdG1OYXZpZ2F0aW9uUGFyYW1ldGVycy5hcHBsaWNhYmxlQ29udGV4dHMgPVxuXHRcdFx0XHRcIiR7aW50ZXJuYWw+aWJuL1wiICsgb0RhdGFGaWVsZC5TZW1hbnRpY09iamVjdCArIFwiLVwiICsgb0RhdGFGaWVsZC5BY3Rpb24gKyBcIi9hQXBwbGljYWJsZS99XCI7XG5cdFx0XHRtTmF2aWdhdGlvblBhcmFtZXRlcnMubm90QXBwbGljYWJsZUNvbnRleHRzID1cblx0XHRcdFx0XCIke2ludGVybmFsPmlibi9cIiArIG9EYXRhRmllbGQuU2VtYW50aWNPYmplY3QgKyBcIi1cIiArIG9EYXRhRmllbGQuQWN0aW9uICsgXCIvYU5vdEFwcGxpY2FibGUvfVwiO1xuXHRcdFx0bU5hdmlnYXRpb25QYXJhbWV0ZXJzLmxhYmVsID0gdGhpcy5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZC5MYWJlbCwgdHJ1ZSk7XG5cdFx0fVxuXHRcdGlmIChvRGF0YUZpZWxkLk1hcHBpbmcpIHtcblx0XHRcdG1OYXZpZ2F0aW9uUGFyYW1ldGVycy5zZW1hbnRpY09iamVjdE1hcHBpbmcgPSB0aGlzLmFkZFNpbmdsZVF1b3RlcyhKU09OLnN0cmluZ2lmeShvRGF0YUZpZWxkLk1hcHBpbmcpKTtcblx0XHR9XG5cdFx0cmV0dXJuIHRoaXMuZ2VuZXJhdGVGdW5jdGlvbihcblx0XHRcdGJOYXZpZ2F0ZVdpdGhDb25maXJtYXRpb25EaWFsb2cgPyBcIi5faW50ZW50QmFzZWROYXZpZ2F0aW9uLm5hdmlnYXRlV2l0aENvbmZpcm1hdGlvbkRpYWxvZ1wiIDogXCIuX2ludGVudEJhc2VkTmF2aWdhdGlvbi5uYXZpZ2F0ZVwiLFxuXHRcdFx0dGhpcy5hZGRTaW5nbGVRdW90ZXMob0RhdGFGaWVsZC5TZW1hbnRpY09iamVjdCksXG5cdFx0XHR0aGlzLmFkZFNpbmdsZVF1b3RlcyhvRGF0YUZpZWxkLkFjdGlvbiksXG5cdFx0XHR0aGlzLm9iamVjdFRvU3RyaW5nKG1OYXZpZ2F0aW9uUGFyYW1ldGVycylcblx0XHQpO1xuXHR9LFxuXHRnZXRFbnRpdHlTZXQ6IGZ1bmN0aW9uIChvQ29udGV4dDogYW55KSB7XG5cdFx0Y29uc3Qgc1BhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0cmV0dXJuIE1vZGVsSGVscGVyLmdldEVudGl0eVNldFBhdGgoc1BhdGgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBIYW5kbGVzIHRoZSB2aXNpYmlsaXR5IG9mIGZvcm0gbWVudSBhY3Rpb25zIGJvdGggaW4gcGF0aCBiYXNlZCBhbmQgc3RhdGljIHZhbHVlIHNjZW5hcmlvcy5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLkNvbW1vbkhlbHBlclxuXHQgKiBAcGFyYW0gc1Zpc2libGVWYWx1ZSBFaXRoZXIgc3RhdGljIGJvb2xlYW4gdmFsdWVzIG9yIEFycmF5IG9mIHBhdGggZXhwcmVzc2lvbnMgZm9yIHZpc2liaWxpdHkgb2YgbWVudSBidXR0b24uXG5cdCAqIEByZXR1cm5zIFRoZSBiaW5kaW5nIGV4cHJlc3Npb24gZGV0ZXJtaW5pbmcgdGhlIHZpc2liaWxpdHkgb2YgbWVudSBhY3Rpb25zLlxuXHQgKi9cblx0aGFuZGxlVmlzaWJpbGl0eU9mTWVudUFjdGlvbnM6IGZ1bmN0aW9uIChzVmlzaWJsZVZhbHVlOiBhbnkpIHtcblx0XHRjb25zdCBjb21iaW5lZENvbmRpdGlvbnMgPSBbXTtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShzVmlzaWJsZVZhbHVlKSkge1xuXHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBzVmlzaWJsZVZhbHVlLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChzVmlzaWJsZVZhbHVlW2ldLmluZGV4T2YoXCJ7XCIpID4gLTEgJiYgc1Zpc2libGVWYWx1ZVtpXS5pbmRleE9mKFwiez1cIikgPT09IC0xKSB7XG5cdFx0XHRcdFx0c1Zpc2libGVWYWx1ZVtpXSA9IFwiez1cIiArIHNWaXNpYmxlVmFsdWVbaV0gKyBcIn1cIjtcblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAoc1Zpc2libGVWYWx1ZVtpXS5zcGxpdChcIns9XCIpLmxlbmd0aCA+IDApIHtcblx0XHRcdFx0XHRzVmlzaWJsZVZhbHVlW2ldID0gc1Zpc2libGVWYWx1ZVtpXS5zcGxpdChcIns9XCIpWzFdLnNsaWNlKDAsIC0xKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb21iaW5lZENvbmRpdGlvbnMucHVzaChgKCR7c1Zpc2libGVWYWx1ZVtpXX0pYCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBjb21iaW5lZENvbmRpdGlvbnMubGVuZ3RoID4gMCA/IGB7PSAke2NvbWJpbmVkQ29uZGl0aW9ucy5qb2luKFwiIHx8IFwiKX19YCA6IHNWaXNpYmxlVmFsdWU7XG5cdH0sXG5cdC8qKlxuXHQgKiBNZXRob2QgdG8gZG8gdGhlIGNhbGN1bGF0aW9uIG9mIGNyaXRpY2FsaXR5IGluIGNhc2UgQ3JpdGljYWxpdHlDYWxjdWxhdGlvbiBwcmVzZW50IGluIHRoZSBhbm5vdGF0aW9uXG5cdCAqXG5cdCAqIFRoZSBjYWxjdWxhdGlvbiBpcyBkb25lIGJ5IGNvbXBhcmluZyBhIHZhbHVlIHRvIHRoZSB0aHJlc2hvbGQgdmFsdWVzIHJlbGV2YW50IGZvciB0aGUgc3BlY2lmaWVkIGltcHJvdmVtZW50IGRpcmVjdGlvbi5cblx0ICogRm9yIGltcHJvdmVtZW50IGRpcmVjdGlvbiBUYXJnZXQsIHRoZSBjcml0aWNhbGl0eSBpcyBjYWxjdWxhdGVkIHVzaW5nIGJvdGggbG93IGFuZCBoaWdoIHRocmVzaG9sZCB2YWx1ZXMuIEl0IHdpbGwgYmVcblx0ICpcblx0ICogLSBQb3NpdGl2ZSBpZiB0aGUgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIEFjY2VwdGFuY2VSYW5nZUxvd1ZhbHVlIGFuZCBsb3dlciB0aGFuIG9yIGVxdWFsIHRvIEFjY2VwdGFuY2VSYW5nZUhpZ2hWYWx1ZVxuXHQgKiAtIE5ldXRyYWwgaWYgdGhlIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBUb2xlcmFuY2VSYW5nZUxvd1ZhbHVlIGFuZCBsb3dlciB0aGFuIEFjY2VwdGFuY2VSYW5nZUxvd1ZhbHVlIE9SIGdyZWF0ZXIgdGhhbiBBY2NlcHRhbmNlUmFuZ2VIaWdoVmFsdWUgYW5kIGxvd2VyIHRoYW4gb3IgZXF1YWwgdG8gVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWVcblx0ICogLSBDcml0aWNhbCBpZiB0aGUgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIERldmlhdGlvblJhbmdlTG93VmFsdWUgYW5kIGxvd2VyIHRoYW4gVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZSBPUiBncmVhdGVyIHRoYW4gVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWUgYW5kIGxvd2VyIHRoYW4gb3IgZXF1YWwgdG8gRGV2aWF0aW9uUmFuZ2VIaWdoVmFsdWVcblx0ICogLSBOZWdhdGl2ZSBpZiB0aGUgdmFsdWUgaXMgbG93ZXIgdGhhbiBEZXZpYXRpb25SYW5nZUxvd1ZhbHVlIG9yIGdyZWF0ZXIgdGhhbiBEZXZpYXRpb25SYW5nZUhpZ2hWYWx1ZVxuXHQgKlxuXHQgKiBGb3IgaW1wcm92ZW1lbnQgZGlyZWN0aW9uIE1pbmltaXplLCB0aGUgY3JpdGljYWxpdHkgaXMgY2FsY3VsYXRlZCB1c2luZyB0aGUgaGlnaCB0aHJlc2hvbGQgdmFsdWVzLiBJdCBpc1xuXHQgKiAtIFBvc2l0aXZlIGlmIHRoZSB2YWx1ZSBpcyBsb3dlciB0aGFuIG9yIGVxdWFsIHRvIEFjY2VwdGFuY2VSYW5nZUhpZ2hWYWx1ZVxuXHQgKiAtIE5ldXRyYWwgaWYgdGhlIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBBY2NlcHRhbmNlUmFuZ2VIaWdoVmFsdWUgYW5kIGxvd2VyIHRoYW4gb3IgZXF1YWwgdG8gVG9sZXJhbmNlUmFuZ2VIaWdoVmFsdWVcblx0ICogLSBDcml0aWNhbCBpZiB0aGUgdmFsdWUgaXMgZ3JlYXRlciB0aGFuIFRvbGVyYW5jZVJhbmdlSGlnaFZhbHVlIGFuZCBsb3dlciB0aGFuIG9yIGVxdWFsIHRvIERldmlhdGlvblJhbmdlSGlnaFZhbHVlXG5cdCAqIC0gTmVnYXRpdmUgaWYgdGhlIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBEZXZpYXRpb25SYW5nZUhpZ2hWYWx1ZVxuXHQgKlxuXHQgKiBGb3IgaW1wcm92ZW1lbnQgZGlyZWN0aW9uIE1heGltaXplLCB0aGUgY3JpdGljYWxpdHkgaXMgY2FsY3VsYXRlZCB1c2luZyB0aGUgbG93IHRocmVzaG9sZCB2YWx1ZXMuIEl0IGlzXG5cdCAqXG5cdCAqIC0gUG9zaXRpdmUgaWYgdGhlIHZhbHVlIGlzIGdyZWF0ZXIgdGhhbiBvciBlcXVhbCB0byBBY2NlcHRhbmNlUmFuZ2VMb3dWYWx1ZVxuXHQgKiAtIE5ldXRyYWwgaWYgdGhlIHZhbHVlIGlzIGxlc3MgdGhhbiBBY2NlcHRhbmNlUmFuZ2VMb3dWYWx1ZSBhbmQgZ3JlYXRlciB0aGFuIG9yIGVxdWFsIHRvIFRvbGVyYW5jZVJhbmdlTG93VmFsdWVcblx0ICogLSBDcml0aWNhbCBpZiB0aGUgdmFsdWUgaXMgbG93ZXIgdGhhbiBUb2xlcmFuY2VSYW5nZUxvd1ZhbHVlIGFuZCBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gRGV2aWF0aW9uUmFuZ2VMb3dWYWx1ZVxuXHQgKiAtIE5lZ2F0aXZlIGlmIHRoZSB2YWx1ZSBpcyBsb3dlciB0aGFuIERldmlhdGlvblJhbmdlTG93VmFsdWVcblx0ICpcblx0ICogVGhyZXNob2xkcyBhcmUgb3B0aW9uYWwuIEZvciB1bmFzc2lnbmVkIHZhbHVlcywgZGVmYXVsdHMgYXJlIGRldGVybWluZWQgaW4gdGhpcyBvcmRlcjpcblx0ICpcblx0ICogLSBGb3IgRGV2aWF0aW9uUmFuZ2UsIGFuIG9taXR0ZWQgTG93VmFsdWUgdHJhbnNsYXRlcyBpbnRvIHRoZSBzbWFsbGVzdCBwb3NzaWJsZSBudW1iZXIgKC1JTkYpLCBhbiBvbWl0dGVkIEhpZ2hWYWx1ZSB0cmFuc2xhdGVzIGludG8gdGhlIGxhcmdlc3QgcG9zc2libGUgbnVtYmVyICgrSU5GKVxuXHQgKiAtIEZvciBUb2xlcmFuY2VSYW5nZSwgYW4gb21pdHRlZCBMb3dWYWx1ZSB3aWxsIGJlIGluaXRpYWxpemVkIHdpdGggRGV2aWF0aW9uUmFuZ2VMb3dWYWx1ZSwgYW4gb21pdHRlZCBIaWdoVmFsdWUgd2lsbCBiZSBpbml0aWFsaXplZCB3aXRoIERldmlhdGlvblJhbmdlSGlnaFZhbHVlXG5cdCAqIC0gRm9yIEFjY2VwdGFuY2VSYW5nZSwgYW4gb21pdHRlZCBMb3dWYWx1ZSB3aWxsIGJlIGluaXRpYWxpemVkIHdpdGggVG9sZXJhbmNlUmFuZ2VMb3dWYWx1ZSwgYW4gb21pdHRlZCBIaWdoVmFsdWUgd2lsbCBiZSBpbml0aWFsaXplZCB3aXRoIFRvbGVyYW5jZVJhbmdlSGlnaFZhbHVlLlxuXHQgKlxuXHQgKiBAcGFyYW0gc0ltcHJvdmVtZW50RGlyZWN0aW9uIEltcHJvdmVtZW50RGlyZWN0aW9uIHRvIGJlIHVzZWQgZm9yIGNyZWF0aW5nIHRoZSBjcml0aWNhbGl0eSBiaW5kaW5nXG5cdCAqIEBwYXJhbSBzVmFsdWUgVmFsdWUgZnJvbSBEYXRhcG9pbnQgdG8gYmUgbWVhc3VyZWRcblx0ICogQHBhcmFtIHNEZXZpYXRpb25Mb3cgRXhwcmVzc2lvbkJpbmRpbmcgZm9yIExvd2VyIERldmlhdGlvbiBsZXZlbFxuXHQgKiBAcGFyYW0gc1RvbGVyYW5jZUxvdyBFeHByZXNzaW9uQmluZGluZyBmb3IgTG93ZXIgVG9sZXJhbmNlIGxldmVsXG5cdCAqIEBwYXJhbSBzQWNjZXB0YW5jZUxvdyBFeHByZXNzaW9uQmluZGluZyBmb3IgTG93ZXIgQWNjZXB0YW5jZSBsZXZlbFxuXHQgKiBAcGFyYW0gc0FjY2VwdGFuY2VIaWdoIEV4cHJlc3Npb25CaW5kaW5nIGZvciBIaWdoZXIgQWNjZXB0YW5jZSBsZXZlbFxuXHQgKiBAcGFyYW0gc1RvbGVyYW5jZUhpZ2ggRXhwcmVzc2lvbkJpbmRpbmcgZm9yIEhpZ2hlciBUb2xlcmFuY2UgbGV2ZWxcblx0ICogQHBhcmFtIHNEZXZpYXRpb25IaWdoIEV4cHJlc3Npb25CaW5kaW5nIGZvciBIaWdoZXIgRGV2aWF0aW9uIGxldmVsXG5cdCAqIEByZXR1cm5zIFJldHVybnMgY3JpdGljYWxpdHkgY2FsY3VsYXRpb24gYXMgZXhwcmVzc2lvbiBiaW5kaW5nXG5cdCAqL1xuXHRnZXRDcml0aWNhbGl0eUNhbGN1bGF0aW9uQmluZGluZzogZnVuY3Rpb24gKFxuXHRcdHNJbXByb3ZlbWVudERpcmVjdGlvbjogc3RyaW5nLFxuXHRcdHNWYWx1ZTogc3RyaW5nLFxuXHRcdHNEZXZpYXRpb25Mb3c6IHN0cmluZyB8IG51bWJlcixcblx0XHRzVG9sZXJhbmNlTG93OiBzdHJpbmcgfCBudW1iZXIsXG5cdFx0c0FjY2VwdGFuY2VMb3c6IHN0cmluZyB8IG51bWJlcixcblx0XHRzQWNjZXB0YW5jZUhpZ2g6IHN0cmluZyB8IG51bWJlcixcblx0XHRzVG9sZXJhbmNlSGlnaDogc3RyaW5nIHwgbnVtYmVyLFxuXHRcdHNEZXZpYXRpb25IaWdoOiBzdHJpbmcgfCBudW1iZXJcblx0KSB7XG5cdFx0bGV0IHNDcml0aWNhbGl0eUV4cHJlc3Npb246IHR5cGVvZiBWYWx1ZUNvbG9yIHwgc3RyaW5nID0gVmFsdWVDb2xvci5OZXV0cmFsOyAvLyBEZWZhdWx0IENyaXRpY2FsaXR5IFN0YXRlXG5cblx0XHRzVmFsdWUgPSBgJSR7c1ZhbHVlfWA7XG5cblx0XHQvLyBTZXR0aW5nIFVuYXNzaWduZWQgVmFsdWVzXG5cdFx0c0RldmlhdGlvbkxvdyA9IHNEZXZpYXRpb25Mb3cgfHwgLUluZmluaXR5O1xuXHRcdHNUb2xlcmFuY2VMb3cgPSBzVG9sZXJhbmNlTG93IHx8IHNEZXZpYXRpb25Mb3c7XG5cdFx0c0FjY2VwdGFuY2VMb3cgPSBzQWNjZXB0YW5jZUxvdyB8fCBzVG9sZXJhbmNlTG93O1xuXHRcdHNEZXZpYXRpb25IaWdoID0gc0RldmlhdGlvbkhpZ2ggfHwgSW5maW5pdHk7XG5cdFx0c1RvbGVyYW5jZUhpZ2ggPSBzVG9sZXJhbmNlSGlnaCB8fCBzRGV2aWF0aW9uSGlnaDtcblx0XHRzQWNjZXB0YW5jZUhpZ2ggPSBzQWNjZXB0YW5jZUhpZ2ggfHwgc1RvbGVyYW5jZUhpZ2g7XG5cblx0XHQvLyBEZWFsaW5nIHdpdGggRGVjaW1hbCBhbmQgUGF0aCBiYXNlZCBiaW5nZGluZ3Ncblx0XHRzRGV2aWF0aW9uTG93ID0gc0RldmlhdGlvbkxvdyAmJiAoK3NEZXZpYXRpb25Mb3cgPyArc0RldmlhdGlvbkxvdyA6IGAlJHtzRGV2aWF0aW9uTG93fWApO1xuXHRcdHNUb2xlcmFuY2VMb3cgPSBzVG9sZXJhbmNlTG93ICYmICgrc1RvbGVyYW5jZUxvdyA/ICtzVG9sZXJhbmNlTG93IDogYCUke3NUb2xlcmFuY2VMb3d9YCk7XG5cdFx0c0FjY2VwdGFuY2VMb3cgPSBzQWNjZXB0YW5jZUxvdyAmJiAoK3NBY2NlcHRhbmNlTG93ID8gK3NBY2NlcHRhbmNlTG93IDogYCUke3NBY2NlcHRhbmNlTG93fWApO1xuXHRcdHNBY2NlcHRhbmNlSGlnaCA9IHNBY2NlcHRhbmNlSGlnaCAmJiAoK3NBY2NlcHRhbmNlSGlnaCA/ICtzQWNjZXB0YW5jZUhpZ2ggOiBgJSR7c0FjY2VwdGFuY2VIaWdofWApO1xuXHRcdHNUb2xlcmFuY2VIaWdoID0gc1RvbGVyYW5jZUhpZ2ggJiYgKCtzVG9sZXJhbmNlSGlnaCA/ICtzVG9sZXJhbmNlSGlnaCA6IGAlJHtzVG9sZXJhbmNlSGlnaH1gKTtcblx0XHRzRGV2aWF0aW9uSGlnaCA9IHNEZXZpYXRpb25IaWdoICYmICgrc0RldmlhdGlvbkhpZ2ggPyArc0RldmlhdGlvbkhpZ2ggOiBgJSR7c0RldmlhdGlvbkhpZ2h9YCk7XG5cblx0XHQvLyBDcmVhdGluZyBydW50aW1lIGV4cHJlc3Npb24gYmluZGluZyBmcm9tIGNyaXRpY2FsaXR5IGNhbGN1bGF0aW9uIGZvciBDcml0aWNhbGl0eSBTdGF0ZVxuXHRcdGlmIChzSW1wcm92ZW1lbnREaXJlY3Rpb24uaW5kZXhPZihcIk1pbmltaXplXCIpID4gLTEpIHtcblx0XHRcdHNDcml0aWNhbGl0eUV4cHJlc3Npb24gPVxuXHRcdFx0XHRcIns9IFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPD0gXCIgK1xuXHRcdFx0XHRzQWNjZXB0YW5jZUhpZ2ggK1xuXHRcdFx0XHRcIiA/ICdcIiArXG5cdFx0XHRcdFZhbHVlQ29sb3IuR29vZCArXG5cdFx0XHRcdFwiJyA6IFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPD0gXCIgK1xuXHRcdFx0XHRzVG9sZXJhbmNlSGlnaCArXG5cdFx0XHRcdFwiID8gJ1wiICtcblx0XHRcdFx0VmFsdWVDb2xvci5OZXV0cmFsICtcblx0XHRcdFx0XCInIDogXCIgK1xuXHRcdFx0XHRcIihcIiArXG5cdFx0XHRcdHNEZXZpYXRpb25IaWdoICtcblx0XHRcdFx0XCIgJiYgXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA8PSBcIiArXG5cdFx0XHRcdHNEZXZpYXRpb25IaWdoICtcblx0XHRcdFx0XCIpID8gJ1wiICtcblx0XHRcdFx0VmFsdWVDb2xvci5Dcml0aWNhbCArXG5cdFx0XHRcdFwiJyA6ICdcIiArXG5cdFx0XHRcdFZhbHVlQ29sb3IuRXJyb3IgK1xuXHRcdFx0XHRcIicgfVwiO1xuXHRcdH0gZWxzZSBpZiAoc0ltcHJvdmVtZW50RGlyZWN0aW9uLmluZGV4T2YoXCJNYXhpbWl6ZVwiKSA+IC0xKSB7XG5cdFx0XHRzQ3JpdGljYWxpdHlFeHByZXNzaW9uID1cblx0XHRcdFx0XCJ7PSBcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID49IFwiICtcblx0XHRcdFx0c0FjY2VwdGFuY2VMb3cgK1xuXHRcdFx0XHRcIiA/ICdcIiArXG5cdFx0XHRcdFZhbHVlQ29sb3IuR29vZCArXG5cdFx0XHRcdFwiJyA6IFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPj0gXCIgK1xuXHRcdFx0XHRzVG9sZXJhbmNlTG93ICtcblx0XHRcdFx0XCIgPyAnXCIgK1xuXHRcdFx0XHRWYWx1ZUNvbG9yLk5ldXRyYWwgK1xuXHRcdFx0XHRcIicgOiBcIiArXG5cdFx0XHRcdFwiKFwiICtcblx0XHRcdFx0c0RldmlhdGlvbkxvdyArXG5cdFx0XHRcdFwiICYmIFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPj0gXCIgK1xuXHRcdFx0XHRzRGV2aWF0aW9uTG93ICtcblx0XHRcdFx0XCIpID8gJ1wiICtcblx0XHRcdFx0VmFsdWVDb2xvci5Dcml0aWNhbCArXG5cdFx0XHRcdFwiJyA6ICdcIiArXG5cdFx0XHRcdFZhbHVlQ29sb3IuRXJyb3IgK1xuXHRcdFx0XHRcIicgfVwiO1xuXHRcdH0gZWxzZSBpZiAoc0ltcHJvdmVtZW50RGlyZWN0aW9uLmluZGV4T2YoXCJUYXJnZXRcIikgPiAtMSkge1xuXHRcdFx0c0NyaXRpY2FsaXR5RXhwcmVzc2lvbiA9XG5cdFx0XHRcdFwiez0gKFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPD0gXCIgK1xuXHRcdFx0XHRzQWNjZXB0YW5jZUhpZ2ggK1xuXHRcdFx0XHRcIiAmJiBcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID49IFwiICtcblx0XHRcdFx0c0FjY2VwdGFuY2VMb3cgK1xuXHRcdFx0XHRcIikgPyAnXCIgK1xuXHRcdFx0XHRWYWx1ZUNvbG9yLkdvb2QgK1xuXHRcdFx0XHRcIicgOiBcIiArXG5cdFx0XHRcdFwiKChcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID49IFwiICtcblx0XHRcdFx0c1RvbGVyYW5jZUxvdyArXG5cdFx0XHRcdFwiICYmIFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPCBcIiArXG5cdFx0XHRcdHNBY2NlcHRhbmNlTG93ICtcblx0XHRcdFx0XCIpIHx8IChcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiID4gXCIgK1xuXHRcdFx0XHRzQWNjZXB0YW5jZUhpZ2ggK1xuXHRcdFx0XHRcIiAmJiBcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiIDw9IFwiICtcblx0XHRcdFx0c1RvbGVyYW5jZUhpZ2ggK1xuXHRcdFx0XHRcIikpID8gJ1wiICtcblx0XHRcdFx0VmFsdWVDb2xvci5OZXV0cmFsICtcblx0XHRcdFx0XCInIDogXCIgK1xuXHRcdFx0XHRcIigoXCIgK1xuXHRcdFx0XHRzRGV2aWF0aW9uTG93ICtcblx0XHRcdFx0XCIgJiYgKFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPj0gXCIgK1xuXHRcdFx0XHRzRGV2aWF0aW9uTG93ICtcblx0XHRcdFx0XCIpICYmIChcIiArXG5cdFx0XHRcdHNWYWx1ZSArXG5cdFx0XHRcdFwiIDwgXCIgK1xuXHRcdFx0XHRzVG9sZXJhbmNlTG93ICtcblx0XHRcdFx0XCIpKSB8fCAoKFwiICtcblx0XHRcdFx0c1ZhbHVlICtcblx0XHRcdFx0XCIgPiBcIiArXG5cdFx0XHRcdHNUb2xlcmFuY2VIaWdoICtcblx0XHRcdFx0XCIpICYmIFwiICtcblx0XHRcdFx0c0RldmlhdGlvbkhpZ2ggK1xuXHRcdFx0XHRcIiAmJiAoXCIgK1xuXHRcdFx0XHRzVmFsdWUgK1xuXHRcdFx0XHRcIiA8PSBcIiArXG5cdFx0XHRcdHNEZXZpYXRpb25IaWdoICtcblx0XHRcdFx0XCIpKSkgPyAnXCIgK1xuXHRcdFx0XHRWYWx1ZUNvbG9yLkNyaXRpY2FsICtcblx0XHRcdFx0XCInIDogJ1wiICtcblx0XHRcdFx0VmFsdWVDb2xvci5FcnJvciArXG5cdFx0XHRcdFwiJyB9XCI7XG5cdFx0fSBlbHNlIHtcblx0XHRcdExvZy53YXJuaW5nKFwiQ2FzZSBub3Qgc3VwcG9ydGVkLCByZXR1cm5pbmcgdGhlIGRlZmF1bHQgVmFsdWUgTmV1dHJhbFwiKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gc0NyaXRpY2FsaXR5RXhwcmVzc2lvbjtcblx0fSxcblx0LyoqXG5cdCAqIFRoaXMgZnVuY3Rpb24gcmV0dXJucyB0aGUgY3JpdGljYWxpdHkgaW5kaWNhdG9yIGZyb20gYW5ub3RhdGlvbnMgaWYgY3JpdGljYWxpdHkgaXMgRW51bU1lbWJlci5cblx0ICpcblx0ICogQHBhcmFtIHNDcml0aWNhbGl0eSBDcml0aWNhbGl0eSBwcm92aWRlZCBpbiB0aGUgYW5ub3RhdGlvbnNcblx0ICogQHJldHVybnMgUmV0dXJuIHRoZSBpbmRpY2F0b3IgZm9yIGNyaXRpY2FsaXR5XG5cdCAqIEBwcml2YXRlXG5cdCAqL1xuXHRfZ2V0Q3JpdGljYWxpdHlGcm9tRW51bTogZnVuY3Rpb24gKHNDcml0aWNhbGl0eTogc3RyaW5nKSB7XG5cdFx0bGV0IHNJbmRpY2F0b3I7XG5cdFx0aWYgKHNDcml0aWNhbGl0eSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5Dcml0aWNhbGl0eVR5cGUvTmVnYXRpdmVcIikge1xuXHRcdFx0c0luZGljYXRvciA9IFZhbHVlQ29sb3IuRXJyb3I7XG5cdFx0fSBlbHNlIGlmIChzQ3JpdGljYWxpdHkgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JpdGljYWxpdHlUeXBlL1Bvc2l0aXZlXCIpIHtcblx0XHRcdHNJbmRpY2F0b3IgPSBWYWx1ZUNvbG9yLkdvb2Q7XG5cdFx0fSBlbHNlIGlmIChzQ3JpdGljYWxpdHkgPT09IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ3JpdGljYWxpdHlUeXBlL0NyaXRpY2FsXCIpIHtcblx0XHRcdHNJbmRpY2F0b3IgPSBWYWx1ZUNvbG9yLkNyaXRpY2FsO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRzSW5kaWNhdG9yID0gVmFsdWVDb2xvci5OZXV0cmFsO1xuXHRcdH1cblx0XHRyZXR1cm4gc0luZGljYXRvcjtcblx0fSxcblx0Z2V0VmFsdWVDcml0aWNhbGl0eTogZnVuY3Rpb24gKHNEaW1lbnNpb246IGFueSwgYVZhbHVlQ3JpdGljYWxpdHk6IGFueSkge1xuXHRcdGxldCBzUmVzdWx0O1xuXHRcdGNvbnN0IGFWYWx1ZXM6IGFueVtdID0gW107XG5cdFx0aWYgKGFWYWx1ZUNyaXRpY2FsaXR5ICYmIGFWYWx1ZUNyaXRpY2FsaXR5Lmxlbmd0aCA+IDApIHtcblx0XHRcdGFWYWx1ZUNyaXRpY2FsaXR5LmZvckVhY2goZnVuY3Rpb24gKG9WQzogYW55KSB7XG5cdFx0XHRcdGlmIChvVkMuVmFsdWUgJiYgb1ZDLkNyaXRpY2FsaXR5LiRFbnVtTWVtYmVyKSB7XG5cdFx0XHRcdFx0Y29uc3Qgc1ZhbHVlID1cblx0XHRcdFx0XHRcdFwiJHtcIiArXG5cdFx0XHRcdFx0XHRzRGltZW5zaW9uICtcblx0XHRcdFx0XHRcdFwifSA9PT0gJ1wiICtcblx0XHRcdFx0XHRcdG9WQy5WYWx1ZSArXG5cdFx0XHRcdFx0XHRcIicgPyAnXCIgK1xuXHRcdFx0XHRcdFx0Q29tbW9uSGVscGVyLl9nZXRDcml0aWNhbGl0eUZyb21FbnVtKG9WQy5Dcml0aWNhbGl0eS4kRW51bU1lbWJlcikgK1xuXHRcdFx0XHRcdFx0XCInXCI7XG5cdFx0XHRcdFx0YVZhbHVlcy5wdXNoKHNWYWx1ZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0c1Jlc3VsdCA9IGFWYWx1ZXMubGVuZ3RoID4gMCAmJiBhVmFsdWVzLmpvaW4oXCIgOiBcIikgKyBcIiA6IHVuZGVmaW5lZFwiO1xuXHRcdH1cblx0XHRyZXR1cm4gc1Jlc3VsdCA/IFwiez0gXCIgKyBzUmVzdWx0ICsgXCIgfVwiIDogdW5kZWZpbmVkO1xuXHR9LFxuXHQvKipcblx0ICogVG8gZmV0Y2ggbWVhc3VyZSBhdHRyaWJ1dGUgaW5kZXguXG5cdCAqXG5cdCAqIEBwYXJhbSBpTWVhc3VyZSBDaGFydCBBbm5vdGF0aW9uc1xuXHQgKiBAcGFyYW0gb0NoYXJ0QW5ub3RhdGlvbnMgQ2hhcnQgQW5ub3RhdGlvbnNcblx0ICogQHJldHVybnMgTWVhc3VyZUF0dHJpYnV0ZSBpbmRleC5cblx0ICogQHByaXZhdGVcblx0ICovXG5cdGdldE1lYXN1cmVBdHRyaWJ1dGVJbmRleDogZnVuY3Rpb24gKGlNZWFzdXJlOiBhbnksIG9DaGFydEFubm90YXRpb25zOiBhbnkpIHtcblx0XHRsZXQgYU1lYXN1cmVzLCBzTWVhc3VyZVByb3BlcnR5UGF0aDtcblx0XHRpZiAob0NoYXJ0QW5ub3RhdGlvbnM/Lk1lYXN1cmVzPy5sZW5ndGggPiAwKSB7XG5cdFx0XHRhTWVhc3VyZXMgPSBvQ2hhcnRBbm5vdGF0aW9ucy5NZWFzdXJlcztcblx0XHRcdHNNZWFzdXJlUHJvcGVydHlQYXRoID0gYU1lYXN1cmVzW2lNZWFzdXJlXS4kUHJvcGVydHlQYXRoO1xuXHRcdH0gZWxzZSBpZiAob0NoYXJ0QW5ub3RhdGlvbnM/LkR5bmFtaWNNZWFzdXJlcz8ubGVuZ3RoID4gMCkge1xuXHRcdFx0YU1lYXN1cmVzID0gb0NoYXJ0QW5ub3RhdGlvbnMuRHluYW1pY01lYXN1cmVzO1xuXHRcdFx0c01lYXN1cmVQcm9wZXJ0eVBhdGggPSBhTWVhc3VyZXNbaU1lYXN1cmVdLiRBbm5vdGF0aW9uUGF0aDtcblx0XHR9XG5cdFx0bGV0IGJNZWFzdXJlQXR0cmlidXRlRXhpc3RzO1xuXHRcdGNvbnN0IGFNZWFzdXJlQXR0cmlidXRlcyA9IG9DaGFydEFubm90YXRpb25zLk1lYXN1cmVBdHRyaWJ1dGVzO1xuXHRcdGxldCBpTWVhc3VyZUF0dHJpYnV0ZSA9IC0xO1xuXHRcdGNvbnN0IGZuQ2hlY2tNZWFzdXJlID0gZnVuY3Rpb24gKHNNZWFzdXJlUGF0aDogYW55LCBvTWVhc3VyZUF0dHJpYnV0ZTogYW55LCBpbmRleDogYW55KSB7XG5cdFx0XHRpZiAob01lYXN1cmVBdHRyaWJ1dGUpIHtcblx0XHRcdFx0aWYgKG9NZWFzdXJlQXR0cmlidXRlLk1lYXN1cmUgJiYgb01lYXN1cmVBdHRyaWJ1dGUuTWVhc3VyZS4kUHJvcGVydHlQYXRoID09PSBzTWVhc3VyZVBhdGgpIHtcblx0XHRcdFx0XHRpTWVhc3VyZUF0dHJpYnV0ZSA9IGluZGV4O1xuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9IGVsc2UgaWYgKG9NZWFzdXJlQXR0cmlidXRlLkR5bmFtaWNNZWFzdXJlICYmIG9NZWFzdXJlQXR0cmlidXRlLkR5bmFtaWNNZWFzdXJlLiRBbm5vdGF0aW9uUGF0aCA9PT0gc01lYXN1cmVQYXRoKSB7XG5cdFx0XHRcdFx0aU1lYXN1cmVBdHRyaWJ1dGUgPSBpbmRleDtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cdFx0aWYgKGFNZWFzdXJlQXR0cmlidXRlcykge1xuXHRcdFx0Yk1lYXN1cmVBdHRyaWJ1dGVFeGlzdHMgPSBhTWVhc3VyZUF0dHJpYnV0ZXMuc29tZShmbkNoZWNrTWVhc3VyZS5iaW5kKG51bGwsIHNNZWFzdXJlUHJvcGVydHlQYXRoKSk7XG5cdFx0fVxuXHRcdHJldHVybiBiTWVhc3VyZUF0dHJpYnV0ZUV4aXN0cyAmJiBpTWVhc3VyZUF0dHJpYnV0ZSA+IC0xICYmIGlNZWFzdXJlQXR0cmlidXRlO1xuXHR9LFxuXG5cdGdldE1lYXN1cmVBdHRyaWJ1dGU6IGZ1bmN0aW9uIChvQ29udGV4dDogQ29udGV4dCkge1xuXHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsLFxuXHRcdFx0c0NoYXJ0QW5ub3RhdGlvblBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCk7XG5cdFx0cmV0dXJuIG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChzQ2hhcnRBbm5vdGF0aW9uUGF0aCkudGhlbihmdW5jdGlvbiAob0NoYXJ0QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdFx0Y29uc3QgYU1lYXN1cmVBdHRyaWJ1dGVzID0gb0NoYXJ0QW5ub3RhdGlvbnMuTWVhc3VyZUF0dHJpYnV0ZXMsXG5cdFx0XHRcdGlNZWFzdXJlQXR0cmlidXRlID0gQ29tbW9uSGVscGVyLmdldE1lYXN1cmVBdHRyaWJ1dGVJbmRleCgwLCBvQ2hhcnRBbm5vdGF0aW9ucyk7XG5cdFx0XHRjb25zdCBzTWVhc3VyZUF0dHJpYnV0ZVBhdGggPVxuXHRcdFx0XHRpTWVhc3VyZUF0dHJpYnV0ZSA+IC0xICYmIGFNZWFzdXJlQXR0cmlidXRlc1tpTWVhc3VyZUF0dHJpYnV0ZV0gJiYgYU1lYXN1cmVBdHRyaWJ1dGVzW2lNZWFzdXJlQXR0cmlidXRlXS5EYXRhUG9pbnRcblx0XHRcdFx0XHQ/IGAke3NDaGFydEFubm90YXRpb25QYXRofU1lYXN1cmVBdHRyaWJ1dGVzLyR7aU1lYXN1cmVBdHRyaWJ1dGV9L2Bcblx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblx0XHRcdGlmIChzTWVhc3VyZUF0dHJpYnV0ZVBhdGggPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRMb2cud2FybmluZyhcIkRhdGFQb2ludCBtaXNzaW5nIGZvciB0aGUgbWVhc3VyZVwiKTtcblx0XHRcdH1cblx0XHRcdHJldHVybiBzTWVhc3VyZUF0dHJpYnV0ZVBhdGggPyBgJHtzTWVhc3VyZUF0dHJpYnV0ZVBhdGh9RGF0YVBvaW50LyRBbm5vdGF0aW9uUGF0aC9gIDogc01lYXN1cmVBdHRyaWJ1dGVQYXRoO1xuXHRcdH0pO1xuXHR9LFxuXHQvKipcblx0ICogVGhpcyBmdW5jdGlvbiByZXR1cm5zIHRoZSBtZWFzdXJlQXR0cmlidXRlIGZvciB0aGUgbWVhc3VyZS5cblx0ICpcblx0ICogQHBhcmFtIG9Db250ZXh0IENvbnRleHQgdG8gdGhlIG1lYXN1cmUgYW5ub3RhdGlvblxuXHQgKiBAcmV0dXJucyBQYXRoIHRvIHRoZSBtZWFzdXJlQXR0cmlidXRlIG9mIHRoZSBtZWFzdXJlXG5cdCAqL1xuXHRnZXRNZWFzdXJlQXR0cmlidXRlRm9yTWVhc3VyZTogZnVuY3Rpb24gKG9Db250ZXh0OiBDb250ZXh0KSB7XG5cdFx0Y29uc3Qgb01ldGFNb2RlbCA9IG9Db250ZXh0LmdldE1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwsXG5cdFx0XHRzTWVhc3VyZVBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRzQ2hhcnRBbm5vdGF0aW9uUGF0aCA9IHNNZWFzdXJlUGF0aC5zdWJzdHJpbmcoMCwgc01lYXN1cmVQYXRoLmxhc3RJbmRleE9mKFwiTWVhc3VyZVwiKSksXG5cdFx0XHRpTWVhc3VyZSA9IHNNZWFzdXJlUGF0aC5yZXBsYWNlKC8uKlxcLy8sIFwiXCIpO1xuXG5cdFx0cmV0dXJuIG9NZXRhTW9kZWwucmVxdWVzdE9iamVjdChzQ2hhcnRBbm5vdGF0aW9uUGF0aCkudGhlbihmdW5jdGlvbiAob0NoYXJ0QW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdFx0Y29uc3QgYU1lYXN1cmVBdHRyaWJ1dGVzID0gb0NoYXJ0QW5ub3RhdGlvbnMuTWVhc3VyZUF0dHJpYnV0ZXMsXG5cdFx0XHRcdGlNZWFzdXJlQXR0cmlidXRlID0gQ29tbW9uSGVscGVyLmdldE1lYXN1cmVBdHRyaWJ1dGVJbmRleChpTWVhc3VyZSwgb0NoYXJ0QW5ub3RhdGlvbnMpO1xuXHRcdFx0Y29uc3Qgc01lYXN1cmVBdHRyaWJ1dGVQYXRoID1cblx0XHRcdFx0aU1lYXN1cmVBdHRyaWJ1dGUgPiAtMSAmJiBhTWVhc3VyZUF0dHJpYnV0ZXNbaU1lYXN1cmVBdHRyaWJ1dGVdICYmIGFNZWFzdXJlQXR0cmlidXRlc1tpTWVhc3VyZUF0dHJpYnV0ZV0uRGF0YVBvaW50XG5cdFx0XHRcdFx0PyBgJHtzQ2hhcnRBbm5vdGF0aW9uUGF0aH1NZWFzdXJlQXR0cmlidXRlcy8ke2lNZWFzdXJlQXR0cmlidXRlfS9gXG5cdFx0XHRcdFx0OiB1bmRlZmluZWQ7XG5cdFx0XHRpZiAoc01lYXN1cmVBdHRyaWJ1dGVQYXRoID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0TG9nLndhcm5pbmcoXCJEYXRhUG9pbnQgbWlzc2luZyBmb3IgdGhlIG1lYXN1cmVcIik7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gc01lYXN1cmVBdHRyaWJ1dGVQYXRoID8gYCR7c01lYXN1cmVBdHRyaWJ1dGVQYXRofURhdGFQb2ludC8kQW5ub3RhdGlvblBhdGgvYCA6IHNNZWFzdXJlQXR0cmlidXRlUGF0aDtcblx0XHR9KTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBkZXRlcm1pbmUgaWYgdGhlIGNvbnRhaW5lZCBuYXZpZ2F0aW9uIHByb3BlcnR5IGhhcyBhIGRyYWZ0IHJvb3Qvbm9kZSBwYXJlbnQgZW50aXR5U2V0LlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG5hbWUgaXNEcmFmdFBhcmVudEVudGl0eUZvckNvbnRhaW5tZW50XG5cdCAqIEBwYXJhbSBvVGFyZ2V0Q29sbGVjdGlvbkNvbnRhaW5zVGFyZ2V0IFRhcmdldCBjb2xsZWN0aW9uIGhhcyBDb250YWluc1RhcmdldCBwcm9wZXJ0eVxuXHQgKiBAcGFyYW0gb1RhYmxlTWV0YWRhdGEgVGFibGUgbWV0YWRhdGEgZm9yIHdoaWNoIGRyYWZ0IHN1cHBvcnQgc2hhbGwgYmUgY2hlY2tlZFxuXHQgKiBAcmV0dXJucyBSZXR1cm5zIHRydWUgaWYgZHJhZnRcblx0ICovXG5cdGlzRHJhZnRQYXJlbnRFbnRpdHlGb3JDb250YWlubWVudDogZnVuY3Rpb24gKG9UYXJnZXRDb2xsZWN0aW9uQ29udGFpbnNUYXJnZXQ6IG9iamVjdCwgb1RhYmxlTWV0YWRhdGE6IGFueSkge1xuXHRcdGlmIChvVGFyZ2V0Q29sbGVjdGlvbkNvbnRhaW5zVGFyZ2V0KSB7XG5cdFx0XHRpZiAob1RhYmxlTWV0YWRhdGEgJiYgb1RhYmxlTWV0YWRhdGEucGFyZW50RW50aXR5U2V0ICYmIG9UYWJsZU1ldGFkYXRhLnBhcmVudEVudGl0eVNldC5zUGF0aCkge1xuXHRcdFx0XHRjb25zdCBzUGFyZW50RW50aXR5U2V0UGF0aCA9IG9UYWJsZU1ldGFkYXRhLnBhcmVudEVudGl0eVNldC5zUGF0aDtcblx0XHRcdFx0Y29uc3Qgb0RyYWZ0Um9vdCA9IG9UYWJsZU1ldGFkYXRhLnBhcmVudEVudGl0eVNldC5vTW9kZWwuZ2V0T2JqZWN0KFxuXHRcdFx0XHRcdGAke3NQYXJlbnRFbnRpdHlTZXRQYXRofUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290YFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRjb25zdCBvRHJhZnROb2RlID0gb1RhYmxlTWV0YWRhdGEucGFyZW50RW50aXR5U2V0Lm9Nb2RlbC5nZXRPYmplY3QoXG5cdFx0XHRcdFx0YCR7c1BhcmVudEVudGl0eVNldFBhdGh9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5EcmFmdE5vZGVgXG5cdFx0XHRcdCk7XG5cdFx0XHRcdGlmIChvRHJhZnRSb290IHx8IG9EcmFmdE5vZGUpIHtcblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogRW5zdXJlcyB0aGUgZGF0YSBpcyBwcm9jZXNzZWQgYXMgZGVmaW5lZCBpbiB0aGUgdGVtcGxhdGUuXG5cdCAqIFNpbmNlIHRoZSBwcm9wZXJ0eSBEYXRhIGlzIG9mIHRoZSB0eXBlICdvYmplY3QnLCBpdCBtYXkgbm90IGJlIGluIHRoZSBzYW1lIG9yZGVyIGFzIHJlcXVpcmVkIGJ5IHRoZSB0ZW1wbGF0ZS5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLkNvbW1vbkhlbHBlclxuXHQgKiBAcGFyYW0gZGF0YUVsZW1lbnQgVGhlIGRhdGEgdGhhdCBpcyBjdXJyZW50bHkgYmVpbmcgcHJvY2Vzc2VkLlxuXHQgKiBAcmV0dXJucyBUaGUgY29ycmVjdCBwYXRoIGFjY29yZGluZyB0byB0aGUgdGVtcGxhdGUuXG5cdCAqL1xuXHRnZXREYXRhRnJvbVRlbXBsYXRlOiBmdW5jdGlvbiAoZGF0YUVsZW1lbnQ6IENvbnRleHQpIHtcblx0XHRjb25zdCBzcGxpdFBhdGggPSBkYXRhRWxlbWVudC5nZXRQYXRoKCkuc3BsaXQoXCIvXCIpO1xuXHRcdGNvbnN0IGRhdGFLZXkgPSBzcGxpdFBhdGhbc3BsaXRQYXRoLmxlbmd0aCAtIDFdO1xuXHRcdGNvbnN0IGNvbm5lY3RlZERhdGFQYXRoID0gYC8ke3NwbGl0UGF0aC5zbGljZSgxLCAtMikuam9pbihcIi9cIil9L0BgO1xuXHRcdGNvbnN0IGNvbm5lY3RlZE9iamVjdCA9IGRhdGFFbGVtZW50LmdldE9iamVjdChjb25uZWN0ZWREYXRhUGF0aCkgYXMgYW55O1xuXHRcdGNvbnN0IHRlbXBsYXRlID0gY29ubmVjdGVkT2JqZWN0LlRlbXBsYXRlO1xuXHRcdGNvbnN0IHNwbGl0VGVtcCA9IHRlbXBsYXRlLnNwbGl0KFwifVwiKTtcblx0XHRjb25zdCB0ZW1wQXJyYXkgPSBbXTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNwbGl0VGVtcC5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdGNvbnN0IGtleSA9IHNwbGl0VGVtcFtpXS5zcGxpdChcIntcIilbMV0udHJpbSgpO1xuXHRcdFx0dGVtcEFycmF5LnB1c2goa2V5KTtcblx0XHR9XG5cdFx0T2JqZWN0LmtleXMoY29ubmVjdGVkT2JqZWN0LkRhdGEpLmZvckVhY2goZnVuY3Rpb24gKHNLZXk6IHN0cmluZykge1xuXHRcdFx0aWYgKHNLZXkuc3RhcnRzV2l0aChcIiRcIikpIHtcblx0XHRcdFx0ZGVsZXRlIGNvbm5lY3RlZE9iamVjdC5EYXRhW3NLZXldO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdGNvbnN0IGluZGV4ID0gT2JqZWN0LmtleXMoY29ubmVjdGVkT2JqZWN0LkRhdGEpLmluZGV4T2YoZGF0YUtleSk7XG5cdFx0cmV0dXJuIGAvJHtzcGxpdFBhdGguc2xpY2UoMSwgLTIpLmpvaW4oXCIvXCIpfS9EYXRhLyR7dGVtcEFycmF5W2luZGV4XX1gO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDaGVja3MgaWYgdGhlIGVuZCBvZiB0aGUgdGVtcGxhdGUgaGFzIGJlZW4gcmVhY2hlZC5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBtZW1iZXJvZiBzYXAuZmUubWFjcm9zLkNvbW1vbkhlbHBlclxuXHQgKiBAcGFyYW0gdGFyZ2V0IFRoZSB0YXJnZXQgb2YgdGhlIGNvbm5lY3RlZCBmaWVsZHMuXG5cdCAqIEBwYXJhbSBlbGVtZW50IFRoZSBlbGVtZW50IHRoYXQgaXMgY3VycmVudGx5IGJlaW5nIHByb2Nlc3NlZC5cblx0ICogQHJldHVybnMgVHJ1ZSBvciBGYWxzZSAoZGVwZW5kaW5nIG9uIHRoZSB0ZW1wbGF0ZSBpbmRleCkuXG5cdCAqL1xuXHRub3RMYXN0SW5kZXg6IGZ1bmN0aW9uICh0YXJnZXQ6IGFueSwgZWxlbWVudDogb2JqZWN0KSB7XG5cdFx0Y29uc3QgdGVtcGxhdGUgPSB0YXJnZXQuVGVtcGxhdGU7XG5cdFx0Y29uc3Qgc3BsaXRUZW1wID0gdGVtcGxhdGUuc3BsaXQoXCJ9XCIpO1xuXHRcdGNvbnN0IHRlbXBBcnJheTogYW55W10gPSBbXTtcblx0XHRsZXQgaXNMYXN0SW5kZXggPSBmYWxzZTtcblx0XHRmb3IgKGxldCBpID0gMDsgaSA8IHNwbGl0VGVtcC5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdGNvbnN0IGRhdGFLZXkgPSBzcGxpdFRlbXBbaV0uc3BsaXQoXCJ7XCIpWzFdLnRyaW0oKTtcblx0XHRcdHRlbXBBcnJheS5wdXNoKGRhdGFLZXkpO1xuXHRcdH1cblxuXHRcdHRlbXBBcnJheS5mb3JFYWNoKGZ1bmN0aW9uICh0ZW1wbGF0ZUluZm86IGFueSkge1xuXHRcdFx0aWYgKHRhcmdldC5EYXRhW3RlbXBsYXRlSW5mb10gPT09IGVsZW1lbnQgJiYgdGVtcEFycmF5LmluZGV4T2YodGVtcGxhdGVJbmZvKSAhPT0gdGVtcEFycmF5Lmxlbmd0aCAtIDEpIHtcblx0XHRcdFx0aXNMYXN0SW5kZXggPSB0cnVlO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHRcdHJldHVybiBpc0xhc3RJbmRleDtcblx0fSxcblxuXHQvKipcblx0ICogRGV0ZXJtaW5lcyB0aGUgZGVsaW1pdGVyIGZyb20gdGhlIHRlbXBsYXRlLlxuXHQgKlxuXHQgKiBAZnVuY3Rpb25cblx0ICogQG1lbWJlcm9mIHNhcC5mZS5tYWNyb3MuQ29tbW9uSGVscGVyXG5cdCAqIEBwYXJhbSB0ZW1wbGF0ZSBUaGUgdGVtcGxhdGUgc3RyaW5nLlxuXHQgKiBAcmV0dXJucyBUaGUgZGVsaW1pdGVyIGluIHRoZSB0ZW1wbGF0ZSBzdHJpbmcuXG5cdCAqL1xuXHRnZXREZWxpbWl0ZXI6IGZ1bmN0aW9uICh0ZW1wbGF0ZTogc3RyaW5nKSB7XG5cdFx0cmV0dXJuIHRlbXBsYXRlLnNwbGl0KFwifVwiKVsxXS5zcGxpdChcIntcIilbMF0udHJpbSgpO1xuXHR9LFxuXG5cdG9NZXRhTW9kZWw6IHVuZGVmaW5lZCBhcyBhbnksXG5cdHNldE1ldGFNb2RlbDogZnVuY3Rpb24gKG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdFx0dGhpcy5vTWV0YU1vZGVsID0gb01ldGFNb2RlbDtcblx0fSxcblxuXHRnZXRNZXRhTW9kZWw6IGZ1bmN0aW9uIChvQ29udGV4dD86IGFueSwgb0ludGVyZmFjZT86IGFueSkge1xuXHRcdGlmIChvQ29udGV4dCkge1xuXHRcdFx0cmV0dXJuIG9JbnRlcmZhY2UuY29udGV4dC5nZXRNb2RlbCgpO1xuXHRcdH1cblx0XHRyZXR1cm4gdGhpcy5vTWV0YU1vZGVsO1xuXHR9LFxuXG5cdGdldFBhcmFtZXRlcnM6IGZ1bmN0aW9uIChvQ29udGV4dDogYW55LCBvSW50ZXJmYWNlOiBhbnkpIHtcblx0XHRpZiAob0NvbnRleHQpIHtcblx0XHRcdGNvbnN0IG9NZXRhTW9kZWwgPSBvSW50ZXJmYWNlLmNvbnRleHQuZ2V0TW9kZWwoKTtcblx0XHRcdGNvbnN0IHNQYXRoID0gb0ludGVyZmFjZS5jb250ZXh0LmdldFBhdGgoKTtcblx0XHRcdGNvbnN0IG9QYXJhbWV0ZXJJbmZvID0gQ29tbW9uVXRpbHMuZ2V0UGFyYW1ldGVySW5mbyhvTWV0YU1vZGVsLCBzUGF0aCk7XG5cdFx0XHRpZiAob1BhcmFtZXRlckluZm8ucGFyYW1ldGVyUHJvcGVydGllcykge1xuXHRcdFx0XHRyZXR1cm4gT2JqZWN0LmtleXMob1BhcmFtZXRlckluZm8ucGFyYW1ldGVyUHJvcGVydGllcyk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdHJldHVybiBbXTtcblx0fSxcblxuXHQvKipcblx0ICogQnVpbGQgYW4gZXhwcmVzc2lvbiBjYWxsaW5nIGFuIGFjdGlvbiBoYW5kbGVyIHZpYSB0aGUgRlBNIGhlbHBlcidzIGFjdGlvbldyYXBwZXIgZnVuY3Rpb25cblx0ICpcblx0ICogVGhpcyBmdW5jdGlvbiBhc3N1bWVzIHRoYXQgdGhlICdGUE0uYWN0aW9uV3JhcHBlcigpJyBmdW5jdGlvbiBpcyBhdmFpbGFibGUgYXQgcnVudGltZS5cblx0ICpcblx0ICogQHBhcmFtIG9BY3Rpb24gQWN0aW9uIG1ldGFkYXRhXG5cdCAqIEBwYXJhbSBvQWN0aW9uLmhhbmRsZXJNb2R1bGUgTW9kdWxlIGNvbnRhaW5pbmcgdGhlIGFjdGlvbiBoYW5kbGVyIG1ldGhvZFxuXHQgKiBAcGFyYW0gb0FjdGlvbi5oYW5kbGVyTWV0aG9kIEFjdGlvbiBoYW5kbGVyIG1ldGhvZCBuYW1lXG5cdCAqIEBwYXJhbSBbb1RoaXNdIGB0aGlzYCAoaWYgdGhlIGZ1bmN0aW9uIGlzIGNhbGxlZCBmcm9tIGEgbWFjcm8pXG5cdCAqIEBwYXJhbSBvVGhpcy5pZCBUaGUgdGFibGUncyBJRFxuXHQgKiBAcmV0dXJucyBUaGUgYWN0aW9uIHdyYXBwZXIgYmluZGluZ1x0ZXhwcmVzc2lvblxuXHQgKi9cblx0YnVpbGRBY3Rpb25XcmFwcGVyOiBmdW5jdGlvbiAob0FjdGlvbjogeyBoYW5kbGVyTW9kdWxlOiBzdHJpbmc7IGhhbmRsZXJNZXRob2Q6IHN0cmluZyB9LCBvVGhpczogeyBpZDogc3RyaW5nIH0gfCB1bmRlZmluZWQpIHtcblx0XHRjb25zdCBhUGFyYW1zOiBhbnlbXSA9IFtyZWYoXCIkZXZlbnRcIiksIG9BY3Rpb24uaGFuZGxlck1vZHVsZSwgb0FjdGlvbi5oYW5kbGVyTWV0aG9kXTtcblxuXHRcdGlmIChvVGhpcyAmJiBvVGhpcy5pZCkge1xuXHRcdFx0Y29uc3Qgb0FkZGl0aW9uYWxQYXJhbXMgPSB7XG5cdFx0XHRcdGNvbnRleHRzOiByZWYoXCIke2ludGVybmFsPnNlbGVjdGVkQ29udGV4dHN9XCIpXG5cdFx0XHR9O1xuXHRcdFx0YVBhcmFtcy5wdXNoKG9BZGRpdGlvbmFsUGFyYW1zKTtcblx0XHR9XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGZuKFwiRlBNLmFjdGlvbldyYXBwZXJcIiwgYVBhcmFtcykpO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgdmFsdWUgd2hldGhlciBvciBub3QgdGhlIGVsZW1lbnQgc2hvdWxkIGJlIHZpc2libGUgZGVwZW5kaW5nIG9uIHRoZSBIaWRkZW4gYW5ub3RhdGlvbi5cblx0ICogSXQgaXMgaW52ZXJ0ZWQgYXMgdGhlIFVJIGVsZW1lbnRzIGhhdmUgYSB2aXNpYmxlIHByb3BlcnR5IGluc3RlYWQgb2YgYW4gaGlkZGVuIG9uZS5cblx0ICpcblx0ICogQHBhcmFtIGRhdGFGaWVsZEFubm90YXRpb25zIFRoZSBkYXRhRmllbGQgT2JqZWN0XG5cdCAqIEByZXR1cm5zIEEgcGF0aCBvciBhIGJvb2xlYW5cblx0ICovXG5cdGdldEhpZGRlblBhdGhFeHByZXNzaW9uOiBmdW5jdGlvbiAoZGF0YUZpZWxkQW5ub3RhdGlvbnM6IGFueSkge1xuXHRcdGlmIChkYXRhRmllbGRBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5IaWRkZW5cIl0gIT09IG51bGwpIHtcblx0XHRcdGNvbnN0IGhpZGRlbiA9IGRhdGFGaWVsZEFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlblwiXTtcblx0XHRcdHJldHVybiB0eXBlb2YgaGlkZGVuID09PSBcIm9iamVjdFwiID8gXCJ7PSAhJHtcIiArIGhpZGRlbi4kUGF0aCArIFwifSB9XCIgOiAhaGlkZGVuO1xuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fVxufTtcbihDb21tb25IZWxwZXIuaXNQcm9wZXJ0eUZpbHRlcmFibGUgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihDb21tb25IZWxwZXIuZ2V0UG9wb3ZlclRleHQgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcbihDb21tb25IZWxwZXIuZ2V0U29ydENvbmRpdGlvbnMgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcblxuZXhwb3J0IGRlZmF1bHQgQ29tbW9uSGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztFQVdBLElBQU1BLFVBQVUsR0FBR0MsUUFBUSxDQUFDRCxVQUFVO0VBQ3RDLElBQU1FLFlBQVksR0FBRztJQUNwQkMsaUJBQWlCLEVBQUUsWUFBWTtNQUM5QjtNQUNBLE9BQU9DLFFBQVEsQ0FBQ0MsSUFBSSxDQUFDQyxPQUFPLENBQUMsK0JBQStCLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDbkUsQ0FBQztJQUVEQyxZQUFZLEVBQUUsVUFBVUMsSUFBUyxFQUFFO01BQ2xDLE9BQU9BLElBQUksQ0FBQ0MsU0FBUyxFQUFFO0lBQ3hCLENB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