/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/macros/CommonHelper", "sap/fe/macros/internal/helpers/ActionHelper", "sap/fe/macros/ODataMetaModelUtil", "sap/ui/model/json/JSONModel", "sap/ui/model/odata/v4/AnnotationHelper"], function (Log, DataVisualization, CommonHelper, ActionHelper, ODataMetaModelUtil, JSONModel, ODataModelAnnotationHelper) {
  "use strict";

  var getUiControl = DataVisualization.getUiControl;
  function formatJSONToString(oCrit) {
    if (!oCrit) {
      return undefined;
    }
    var sCriticality = JSON.stringify(oCrit);
    sCriticality = sCriticality.replace(new RegExp("{", "g"), "\\{");
    sCriticality = sCriticality.replace(new RegExp("}", "g"), "\\}");
    return sCriticality;
  }
  function getEntitySetPath(oAnnotationContext) {
    var sAnnoPath = oAnnotationContext.getPath(),
      sPathEntitySetPath = sAnnoPath.replace(/@com.sap.vocabularies.UI.v1.(Chart|PresentationVariant).*/, "");
    return sPathEntitySetPath;
  }
  var mChartType = {
    "com.sap.vocabularies.UI.v1.ChartType/Column": "column",
    "com.sap.vocabularies.UI.v1.ChartType/ColumnStacked": "stacked_column",
    "com.sap.vocabularies.UI.v1.ChartType/ColumnDual": "dual_column",
    "com.sap.vocabularies.UI.v1.ChartType/ColumnStackedDual": "dual_stacked_column",
    "com.sap.vocabularies.UI.v1.ChartType/ColumnStacked100": "100_stacked_column",
    "com.sap.vocabularies.UI.v1.ChartType/ColumnStackedDual100": "100_dual_stacked_column",
    "com.sap.vocabularies.UI.v1.ChartType/Bar": "bar",
    "com.sap.vocabularies.UI.v1.ChartType/BarStacked": "stacked_bar",
    "com.sap.vocabularies.UI.v1.ChartType/BarDual": "dual_bar",
    "com.sap.vocabularies.UI.v1.ChartType/BarStackedDual": "dual_stacked_bar",
    "com.sap.vocabularies.UI.v1.ChartType/BarStacked100": "100_stacked_bar",
    "com.sap.vocabularies.UI.v1.ChartType/BarStackedDual100": "100_dual_stacked_bar",
    "com.sap.vocabularies.UI.v1.ChartType/Area": "area",
    "com.sap.vocabularies.UI.v1.ChartType/AreaStacked": "stacked_column",
    "com.sap.vocabularies.UI.v1.ChartType/AreaStacked100": "100_stacked_column",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalArea": "bar",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked": "stacked_bar",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalAreaStacked100": "100_stacked_bar",
    "com.sap.vocabularies.UI.v1.ChartType/Line": "line",
    "com.sap.vocabularies.UI.v1.ChartType/LineDual": "dual_line",
    "com.sap.vocabularies.UI.v1.ChartType/Combination": "combination",
    "com.sap.vocabularies.UI.v1.ChartType/CombinationStacked": "stacked_combination",
    "com.sap.vocabularies.UI.v1.ChartType/CombinationDual": "dual_combination",
    "com.sap.vocabularies.UI.v1.ChartType/CombinationStackedDual": "dual_stacked_combination",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationStacked": "horizontal_stacked_combination",
    "com.sap.vocabularies.UI.v1.ChartType/Pie": "pie",
    "com.sap.vocabularies.UI.v1.ChartType/Donut": "donut",
    "com.sap.vocabularies.UI.v1.ChartType/Scatter": "scatter",
    "com.sap.vocabularies.UI.v1.ChartType/Bubble": "bubble",
    "com.sap.vocabularies.UI.v1.ChartType/Radar": "line",
    "com.sap.vocabularies.UI.v1.ChartType/HeatMap": "heatmap",
    "com.sap.vocabularies.UI.v1.ChartType/TreeMap": "treemap",
    "com.sap.vocabularies.UI.v1.ChartType/Waterfall": "waterfall",
    "com.sap.vocabularies.UI.v1.ChartType/Bullet": "bullet",
    "com.sap.vocabularies.UI.v1.ChartType/VerticalBullet": "vertical_bullet",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalWaterfall": "horizontal_waterfall",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationDual": "dual_horizontal_combination",
    "com.sap.vocabularies.UI.v1.ChartType/HorizontalCombinationStackedDual": "dual_horizontal_stacked_combination"
  };
  var mDimensionRole = {
    "com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category": "category",
    "com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Series": "series",
    "com.sap.vocabularies.UI.v1.ChartDimensionRoleType/Category2": "category2"
  };
  /**
   * Helper class for sap.fe.macros Chart phantom control for prepecosseing.
   * <h3><b>Note:</b></h3>
   * The class is experimental and the API/behaviour is not finalised
   * and hence this should not be used for productive usage.
   * Especially this class is not intended to be used for the FE scenario,
   * here we shall use sap.fe.macros.ChartHelper that is especially tailored for V4
   * meta model
   *
   * @author SAP SE
   * @private
   * @experimental
   * @since 1.62
   * @alias sap.fe.macros.ChartHelper
   */
  var ChartHelper = {
    getP13nMode: function (oViewData) {
      var aPersonalization = [],
        bVariantManagement = oViewData.variantManagement && (oViewData.variantManagement === "Page" || oViewData.variantManagement === "Control"),
        personalization = true; // by default enabled
      if (bVariantManagement && personalization) {
        if (personalization) {
          // full personalization scope
          return "Sort,Type,Item";
        } else if (typeof personalization === "object") {
          if (personalization.type) {
            aPersonalization.push("Type");
          }
          if (personalization.sort) {
            aPersonalization.push("Sort");
          }
          return aPersonalization.join(",");
        }
      }
    },
    formatChartType: function (oChartType) {
      return mChartType[oChartType.$EnumMember];
    },
    formatDimensions: function (oAnnotationContext) {
      var oAnnotation = oAnnotationContext.getObject("./"),
        oMetaModel = oAnnotationContext.getModel(),
        sEntitySetPath = getEntitySetPath(oAnnotationContext),
        aDimensions = [];
      var i, j;
      var bIsNavigationText = false;

      //perhaps there are no dimension attributes
      oAnnotation.DimensionAttributes = oAnnotation.DimensionAttributes || [];
      for (i = 0; i < oAnnotation.Dimensions.length; i++) {
        var sKey = oAnnotation.Dimensions[i].$PropertyPath;
        var oText = oMetaModel.getObject("".concat(sEntitySetPath + sKey, "@com.sap.vocabularies.Common.v1.Text")) || {};
        if (sKey.indexOf("/") > -1) {
          Log.error("$expand is not yet supported. Dimension: ".concat(sKey, " from an association cannot be used"));
        }
        if (oText.$Path && oText.$Path.indexOf("/") > -1) {
          Log.error("$expand is not yet supported. Text Property: ".concat(oText.$Path, " from an association cannot be used for the dimension ").concat(sKey));
          bIsNavigationText = true;
        }
        var oDimension = {
          key: sKey,
          textPath: !bIsNavigationText ? oText.$Path : undefined,
          label: oMetaModel.getObject("".concat(sEntitySetPath + sKey, "@com.sap.vocabularies.Common.v1.Label")),
          role: "category"
        };
        for (j = 0; j < oAnnotation.DimensionAttributes.length; j++) {
          var oAttribute = oAnnotation.DimensionAttributes[j];
          if (oDimension.key === oAttribute.Dimension.$PropertyPath) {
            oDimension.role = mDimensionRole[oAttribute.Role.$EnumMember] || oDimension.role;
            break;
          }
        }
        oDimension.criticality = ODataMetaModelUtil.fetchCriticality(oMetaModel, oMetaModel.createBindingContext(sEntitySetPath + sKey)).then(formatJSONToString);
        aDimensions.push(oDimension);
      }
      var oDimensionModel = new JSONModel(aDimensions);
      oDimensionModel.$$valueAsPromise = true;
      return oDimensionModel.createBindingContext("/");
    },
    formatMeasures: function (oAnnotationContext) {
      return oAnnotationContext.getModel().getObject().measures;
    },
    getUiChart: function (oPresentationContext) {
      return getUiControl(oPresentationContext, "@com.sap.vocabularies.UI.v1.Chart");
    },
    getOperationAvailableMap: function (oChartContext, oContext) {
      var aChartCollection = oChartContext.Actions || [];
      return JSON.stringify(ActionHelper.getOperationAvailableMap(aChartCollection, "chart", oContext));
    },
    /**
     * Returns a stringified JSON object containing Presentation Variant sort conditions.
     *
     * @param oContext
     * @param oPresentationVariant Presentation Variant annotation
     * @param sPresentationVariantPath
     * @param oApplySupported
     * @returns Stringified JSON object
     */
    getSortConditions: function (oContext, oPresentationVariant, sPresentationVariantPath, oApplySupported) {
      if (oPresentationVariant && CommonHelper._isPresentationVariantAnnotation(sPresentationVariantPath) && oPresentationVariant.SortOrder) {
        var aSortConditions = {
          sorters: []
        };
        var sEntityPath = oContext.getPath(0).split("@")[0];
        oPresentationVariant.SortOrder.forEach(function () {
          var oCondition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          var oSortProperty = "";
          var oSorter = {};
          if (oCondition.DynamicProperty) {
            var _oContext$getModel$ge;
            oSortProperty = "_fe_aggregatable_" + ((_oContext$getModel$ge = oContext.getModel(0).getObject(sEntityPath + oCondition.DynamicProperty.$AnnotationPath)) === null || _oContext$getModel$ge === void 0 ? void 0 : _oContext$getModel$ge.Name);
          } else if (oCondition.Property) {
            var aGroupableProperties = oApplySupported.GroupableProperties;
            if (aGroupableProperties && aGroupableProperties.length) {
              for (var i = 0; i < aGroupableProperties.length; i++) {
                if (aGroupableProperties[i].$PropertyPath === oCondition.Property.$PropertyPath) {
                  oSortProperty = "_fe_groupable_" + oCondition.Property.$PropertyPath;
                  break;
                }
                if (!oSortProperty) {
                  oSortProperty = "_fe_aggregatable_" + oCondition.Property.$PropertyPath;
                }
              }
            } else if (oContext.getModel(0).getObject(sEntityPath + oCondition.Property.$PropertyPath + "@Org.OData.Aggregation.V1.Groupable")) {
              oSortProperty = "_fe_groupable_" + oCondition.Property.$PropertyPath;
            } else {
              oSortProperty = "_fe_aggregatable_" + oCondition.Property.$PropertyPath;
            }
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
    getBindingData: function (sTargetCollection, oContext, aActions) {
      var aOperationAvailablePath = [];
      var sSelect;
      for (var i in aActions) {
        if (aActions[i].$Type === "com.sap.vocabularies.UI.v1.DataFieldForAction") {
          var sActionName = aActions[i].Action;
          var oActionOperationAvailable = CommonHelper.getActionPath(oContext, false, sActionName, true);
          if (oActionOperationAvailable && oActionOperationAvailable.$Path) {
            aOperationAvailablePath.push("'".concat(oActionOperationAvailable.$Path, "'"));
          } else if (oActionOperationAvailable === null) {
            // We disabled action advertisement but kept it in the code for the time being
            //aOperationAvailablePath.push(sActionName);
          }
        }
      }
      if (aOperationAvailablePath.length > 0) {
        //TODO: request fails with $select. check this with odata v4 model
        sSelect = " $select: '" + aOperationAvailablePath.join() + "'";
      }
      return "'{path: '" + (oContext.getObject("$kind") === "EntitySet" ? "/" : "") + oContext.getObject("@sapui.name") + "'" + (sSelect ? ",parameters:{" + sSelect + "}" : "") + "}'";
    },
    _getModel: function (oCollection, oInterface) {
      return oInterface.context;
    },
    // TODO: combine this one with the one from the table
    isDataFieldForActionButtonEnabled: function (bIsBound, sAction, oCollection, sOperationAvailableMap, sEnableSelectOn) {
      if (bIsBound !== true) {
        return "true";
      }
      var oModel = oCollection.getModel();
      var sNavPath = oCollection.getPath();
      var sPartner = oModel.getObject(sNavPath).$Partner;
      var oOperationAvailableMap = sOperationAvailableMap && JSON.parse(sOperationAvailableMap);
      var aPath = oOperationAvailableMap && oOperationAvailableMap[sAction] && oOperationAvailableMap[sAction].split("/");
      var sNumberOfSelectedContexts = ActionHelper.getNumberOfContextsExpression(sEnableSelectOn);
      if (aPath && aPath[0] === sPartner) {
        var sPath = oOperationAvailableMap[sAction].replace(sPartner + "/", "");
        return "{= ${" + sNumberOfSelectedContexts + " && ${" + sPath + "}}";
      } else {
        return "{= ${" + sNumberOfSelectedContexts + "}";
      }
    },
    getHiddenPathExpressionForTableActionsAndIBN: function (sHiddenPath, oDetails) {
      var oContext = oDetails.context,
        sPropertyPath = oContext.getPath(),
        sEntitySetPath = ODataModelAnnotationHelper.getNavigationPath(sPropertyPath);
      if (sHiddenPath.indexOf("/") > 0) {
        var aSplitHiddenPath = sHiddenPath.split("/");
        var sNavigationPath = aSplitHiddenPath[0];
        // supports visiblity based on the property from the partner association
        if (oContext.getObject(sEntitySetPath + "/$Partner") === sNavigationPath) {
          return "{= !%{" + aSplitHiddenPath.slice(1).join("/") + "} }";
        }
        // any other association will be ignored and the button will be made visible
      }

      return true;
    },
    /**
     * Method to get press event for DataFieldForActionButton.
     *
     * @function
     * @name getPressEventForDataFieldForActionButton
     * @param sId Id of the current control
     * @param oAction Action model
     * @param sOperationAvailableMap OperationAvailableMap Stringified JSON object
     * @returns A binding expression for press property of DataFieldForActionButton
     */
    getPressEventForDataFieldForActionButton: function (sId, oAction, sOperationAvailableMap) {
      var oParams = {
        contexts: "${internal>selectedContexts}"
      };
      return ActionHelper.getPressEventDataFieldForActionButton(sId, oAction, oParams, sOperationAvailableMap);
    },
    /**
     * @function
     * @name getActionType
     * @param oAction Action model
     * @returns A Boolean value depending on the action type
     */
    getActionType: function (oAction) {
      return (oAction["$Type"].indexOf("com.sap.vocabularies.UI.v1.DataFieldForIntentBasedNavigation") > -1 || oAction["$Type"].indexOf("com.sap.vocabularies.UI.v1.DataFieldForAction") > -1) && oAction["Inline"];
    },
    getCollectionName: function (sCollection) {
      return sCollection.split("/")[sCollection.split("/").length - 1];
    }
  };
  ChartHelper.getSortConditions.requiresIContext = true;
  return ChartHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJmb3JtYXRKU09OVG9TdHJpbmciLCJvQ3JpdCIsInVuZGVmaW5lZCIsInNDcml0aWNhbGl0eSIsIkpTT04iLCJzdHJpbmdpZnkiLCJyZXBsYWNlIiwiUmVnRXhwIiwiZ2V0RW50aXR5U2V0UGF0aCIsIm9Bbm5vdGF0aW9uQ29udGV4dCIsInNBbm5vUGF0aCIsImdldFBhdGgiLCJzUGF0aEVudGl0eVNldFBhdGgiLCJtQ2hhcnRUeXBlIiwibURpbWVuc2lvblJvbGUiLCJDaGFydEhlbHBlciIsImdldFAxM25Nb2RlIiwib1ZpZXdEYXRhIiwiYVBlcnNvbmFsaXphdGlvbiIsImJWYXJpYW50TWFuYWdlbWVudCIsInZhcmlhbnRNYW5hZ2VtZW50IiwicGVyc29uYWxpemF0aW9uIiwidHlwZSIsInB1c2giLCJzb3J0Iiwiam9pbiIsImZvcm1hdENoYXJ0VHlwZSIsIm9DaGFydFR5cGUiLCIkRW51bU1lbWJlciIsImZvcm1hdERpbWVuc2lvbnMiLCJvQW5ub3RhdGlvbiIsImdldE9iamVjdCIsIm9NZXRhTW9kZWwiLCJnZXRNb2RlbCIsInNFbnRpdHlTZXRQYXRoIiwiYURpbWVuc2lvbnMiLCJpIiwiaiIsImJJc05hdmlnYXRpb25UZXh0IiwiRGltZW5zaW9uQXR0cmlidXRlcyIsIkRpbWVuc2lvbnMiLCJsZW5ndGgiLCJzS2V5IiwiJFByb3BlcnR5UGF0aCIsIm9UZXh0IiwiaW5kZXhPZiIsIkxvZyIsImVycm9yIiwiJFBhdGgiLCJvRGltZW5zaW9uIiwia2V5IiwidGV4dFBhdGgiLCJsYWJlbCIsInJvbGUiLCJvQXR0cmlidXRlIiwiRGltZW5zaW9uIiwiUm9sZSIsImNyaXRpY2FsaXR5IiwiT0RhdGFNZXRhTW9kZWxVdGlsIiwiZmV0Y2hDcml0aWNhbGl0eSIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwidGhlbiIsIm9EaW1lbnNpb25Nb2RlbCIsIkpTT05Nb2RlbCIsIiQkdmFsdWVBc1Byb21pc2UiLCJmb3JtYXRNZWFzdXJlcyIsIm1lYXN1cmVzIiwiZ2V0VWlDaGFydCIsIm9QcmVzZW50YXRpb25Db250ZXh0IiwiZ2V0VWlDb250cm9sIiwiZ2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwib0NoYXJ0Q29udGV4dCIsIm9Db250ZXh0IiwiYUNoYXJ0Q29sbGVjdGlvbiIsIkFjdGlvbnMiLCJBY3Rpb25IZWxwZXIiLCJnZXRTb3J0Q29uZGl0aW9ucyIsIm9QcmVzZW50YXRpb25WYXJpYW50Iiwic1ByZXNlbnRhdGlvblZhcmlhbnRQYXRoIiwib0FwcGx5U3VwcG9ydGVkIiwiQ29tbW9uSGVscGVyIiwiX2lzUHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24iLCJTb3J0T3JkZXIiLCJhU29ydENvbmRpdGlvbnMiLCJzb3J0ZXJzIiwic0VudGl0eVBhdGgiLCJzcGxpdCIsImZvckVhY2giLCJvQ29uZGl0aW9uIiwib1NvcnRQcm9wZXJ0eSIsIm9Tb3J0ZXIiLCJEeW5hbWljUHJvcGVydHkiLCIkQW5ub3RhdGlvblBhdGgiLCJOYW1lIiwiUHJvcGVydHkiLCJhR3JvdXBhYmxlUHJvcGVydGllcyIsIkdyb3VwYWJsZVByb3BlcnRpZXMiLCJuYW1lIiwiZGVzY2VuZGluZyIsIkRlc2NlbmRpbmciLCJFcnJvciIsImdldEJpbmRpbmdEYXRhIiwic1RhcmdldENvbGxlY3Rpb24iLCJhQWN0aW9ucyIsImFPcGVyYXRpb25BdmFpbGFibGVQYXRoIiwic1NlbGVjdCIsIiRUeXBlIiwic0FjdGlvbk5hbWUiLCJBY3Rpb24iLCJvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlIiwiZ2V0QWN0aW9uUGF0aCIsIl9nZXRNb2RlbCIsIm9Db2xsZWN0aW9uIiwib0ludGVyZmFjZSIsImNvbnRleHQiLCJpc0RhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbkVuYWJsZWQiLCJiSXNCb3VuZCIsInNBY3Rpb24iLCJzT3BlcmF0aW9uQXZhaWxhYmxlTWFwIiwic0VuYWJsZVNlbGVjdE9uIiwib01vZGVsIiwic05hdlBhdGgiLCJzUGFydG5lciIsIiRQYXJ0bmVyIiwib09wZXJhdGlvbkF2YWlsYWJsZU1hcCIsInBhcnNlIiwiYVBhdGgiLCJzTnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzIiwiZ2V0TnVtYmVyT2ZDb250ZXh0c0V4cHJlc3Npb24iLCJzUGF0aCIsImdldEhpZGRlblBhdGhFeHByZXNzaW9uRm9yVGFibGVBY3Rpb25zQW5kSUJOIiwic0hpZGRlblBhdGgiLCJvRGV0YWlscyIsInNQcm9wZXJ0eVBhdGgiLCJPRGF0YU1vZGVsQW5ub3RhdGlvbkhlbHBlciIsImdldE5hdmlnYXRpb25QYXRoIiwiYVNwbGl0SGlkZGVuUGF0aCIsInNOYXZpZ2F0aW9uUGF0aCIsInNsaWNlIiwiZ2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbiIsInNJZCIsIm9BY3Rpb24iLCJvUGFyYW1zIiwiY29udGV4dHMiLCJnZXRQcmVzc0V2ZW50RGF0YUZpZWxkRm9yQWN0aW9uQnV0dG9uIiwiZ2V0QWN0aW9uVHlwZSIsImdldENvbGxlY3Rpb25OYW1lIiwic0NvbGxlY3Rpb24iLCJyZXF1aXJlc0lDb250ZXh0Il0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDaGFydEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB7IGdldFVpQ29udHJvbCB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2NvbnRyb2xzL0NvbW1vbi9EYXRhVmlzdWFsaXphdGlvblwiO1xuaW1wb3J0IENvbW1vbkhlbHBlciBmcm9tIFwic2FwL2ZlL21hY3Jvcy9Db21tb25IZWxwZXJcIjtcbmltcG9ydCBBY3Rpb25IZWxwZXIgZnJvbSBcInNhcC9mZS9tYWNyb3MvaW50ZXJuYWwvaGVscGVycy9BY3Rpb25IZWxwZXJcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbFV0aWwgZnJvbSBcInNhcC9mZS9tYWNyb3MvT0RhdGFNZXRhTW9kZWxVdGlsXCI7XG5pbXBvcnQgdHlwZSBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvQ29udGV4dFwiO1xuaW1wb3J0IEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgT0RhdGFNb2RlbEFubm90YXRpb25IZWxwZXIgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Bbm5vdGF0aW9uSGVscGVyXCI7XG5mdW5jdGlvbiBmb3JtYXRKU09OVG9TdHJpbmcob0NyaXQ6IGFueSkge1xuXHRpZiAoIW9Dcml0KSB7XG5cdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0fVxuXG5cdGxldCBzQ3JpdGljYWxpdHkgPSBKU09OLnN0cmluZ2lmeShvQ3JpdCk7XG5cdHNDcml0aWNhbGl0eSA9IHNDcml0aWNhbGl0eS5yZXBsYWNlKG5ldyBSZWdFeHAoXCJ7XCIsIFwiZ1wiKSwgXCJcXFxce1wiKTtcblx0c0NyaXRpY2FsaXR5ID0gc0NyaXRpY2FsaXR5LnJlcGxhY2UobmV3IFJlZ0V4cChcIn1cIiwgXCJnXCIpLCBcIlxcXFx9XCIpO1xuXHRyZXR1cm4gc0NyaXRpY2FsaXR5O1xufVxuZnVuY3Rpb24gZ2V0RW50aXR5U2V0UGF0aChvQW5ub3RhdGlvbkNvbnRleHQ6IGFueSkge1xuXHRjb25zdCBzQW5ub1BhdGggPSBvQW5ub3RhdGlvbkNvbnRleHQuZ2V0UGF0aCgpLFxuXHRcdHNQYXRoRW50aXR5U2V0UGF0aCA9IHNBbm5vUGF0aC5yZXBsYWNlKC9AY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuKENoYXJ0fFByZXNlbnRhdGlvblZhcmlhbnQpLiovLCBcIlwiKTtcblxuXHRyZXR1cm4gc1BhdGhFbnRpdHlTZXRQYXRoO1xufVxuXG5jb25zdCBtQ2hhcnRUeXBlID0ge1xuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Db2x1bW5cIjogXCJjb2x1bW5cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQ29sdW1uU3RhY2tlZFwiOiBcInN0YWNrZWRfY29sdW1uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0NvbHVtbkR1YWxcIjogXCJkdWFsX2NvbHVtblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Db2x1bW5TdGFja2VkRHVhbFwiOiBcImR1YWxfc3RhY2tlZF9jb2x1bW5cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQ29sdW1uU3RhY2tlZDEwMFwiOiBcIjEwMF9zdGFja2VkX2NvbHVtblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Db2x1bW5TdGFja2VkRHVhbDEwMFwiOiBcIjEwMF9kdWFsX3N0YWNrZWRfY29sdW1uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0JhclwiOiBcImJhclwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9CYXJTdGFja2VkXCI6IFwic3RhY2tlZF9iYXJcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQmFyRHVhbFwiOiBcImR1YWxfYmFyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0JhclN0YWNrZWREdWFsXCI6IFwiZHVhbF9zdGFja2VkX2JhclwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9CYXJTdGFja2VkMTAwXCI6IFwiMTAwX3N0YWNrZWRfYmFyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0JhclN0YWNrZWREdWFsMTAwXCI6IFwiMTAwX2R1YWxfc3RhY2tlZF9iYXJcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQXJlYVwiOiBcImFyZWFcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQXJlYVN0YWNrZWRcIjogXCJzdGFja2VkX2NvbHVtblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9BcmVhU3RhY2tlZDEwMFwiOiBcIjEwMF9zdGFja2VkX2NvbHVtblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Ib3Jpem9udGFsQXJlYVwiOiBcImJhclwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Ib3Jpem9udGFsQXJlYVN0YWNrZWRcIjogXCJzdGFja2VkX2JhclwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Ib3Jpem9udGFsQXJlYVN0YWNrZWQxMDBcIjogXCIxMDBfc3RhY2tlZF9iYXJcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvTGluZVwiOiBcImxpbmVcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvTGluZUR1YWxcIjogXCJkdWFsX2xpbmVcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQ29tYmluYXRpb25cIjogXCJjb21iaW5hdGlvblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Db21iaW5hdGlvblN0YWNrZWRcIjogXCJzdGFja2VkX2NvbWJpbmF0aW9uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0NvbWJpbmF0aW9uRHVhbFwiOiBcImR1YWxfY29tYmluYXRpb25cIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvQ29tYmluYXRpb25TdGFja2VkRHVhbFwiOiBcImR1YWxfc3RhY2tlZF9jb21iaW5hdGlvblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Ib3Jpem9udGFsQ29tYmluYXRpb25TdGFja2VkXCI6IFwiaG9yaXpvbnRhbF9zdGFja2VkX2NvbWJpbmF0aW9uXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL1BpZVwiOiBcInBpZVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Eb251dFwiOiBcImRvbnV0XCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL1NjYXR0ZXJcIjogXCJzY2F0dGVyXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0J1YmJsZVwiOiBcImJ1YmJsZVwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9SYWRhclwiOiBcImxpbmVcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvSGVhdE1hcFwiOiBcImhlYXRtYXBcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvVHJlZU1hcFwiOiBcInRyZWVtYXBcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvV2F0ZXJmYWxsXCI6IFwid2F0ZXJmYWxsXCIsXG5cdFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuQ2hhcnRUeXBlL0J1bGxldFwiOiBcImJ1bGxldFwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9WZXJ0aWNhbEJ1bGxldFwiOiBcInZlcnRpY2FsX2J1bGxldFwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Ib3Jpem9udGFsV2F0ZXJmYWxsXCI6IFwiaG9yaXpvbnRhbF93YXRlcmZhbGxcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFR5cGUvSG9yaXpvbnRhbENvbWJpbmF0aW9uRHVhbFwiOiBcImR1YWxfaG9yaXpvbnRhbF9jb21iaW5hdGlvblwiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0VHlwZS9Ib3Jpem9udGFsQ29tYmluYXRpb25TdGFja2VkRHVhbFwiOiBcImR1YWxfaG9yaXpvbnRhbF9zdGFja2VkX2NvbWJpbmF0aW9uXCJcbn07XG5jb25zdCBtRGltZW5zaW9uUm9sZSA9IHtcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydERpbWVuc2lvblJvbGVUeXBlL0NhdGVnb3J5XCI6IFwiY2F0ZWdvcnlcIixcblx0XCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydERpbWVuc2lvblJvbGVUeXBlL1Nlcmllc1wiOiBcInNlcmllc1wiLFxuXHRcImNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkNoYXJ0RGltZW5zaW9uUm9sZVR5cGUvQ2F0ZWdvcnkyXCI6IFwiY2F0ZWdvcnkyXCJcbn07XG4vKipcbiAqIEhlbHBlciBjbGFzcyBmb3Igc2FwLmZlLm1hY3JvcyBDaGFydCBwaGFudG9tIGNvbnRyb2wgZm9yIHByZXBlY29zc2VpbmcuXG4gKiA8aDM+PGI+Tm90ZTo8L2I+PC9oMz5cbiAqIFRoZSBjbGFzcyBpcyBleHBlcmltZW50YWwgYW5kIHRoZSBBUEkvYmVoYXZpb3VyIGlzIG5vdCBmaW5hbGlzZWRcbiAqIGFuZCBoZW5jZSB0aGlzIHNob3VsZCBub3QgYmUgdXNlZCBmb3IgcHJvZHVjdGl2ZSB1c2FnZS5cbiAqIEVzcGVjaWFsbHkgdGhpcyBjbGFzcyBpcyBub3QgaW50ZW5kZWQgdG8gYmUgdXNlZCBmb3IgdGhlIEZFIHNjZW5hcmlvLFxuICogaGVyZSB3ZSBzaGFsbCB1c2Ugc2FwLmZlLm1hY3Jvcy5DaGFydEhlbHBlciB0aGF0IGlzIGVzcGVjaWFsbHkgdGFpbG9yZWQgZm9yIFY0XG4gKiBtZXRhIG1vZGVsXG4gKlxuICogQGF1dGhvciBTQVAgU0VcbiAqIEBwcml2YXRlXG4gKiBAZXhwZXJpbWVudGFsXG4gKiBAc2luY2UgMS42MlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuQ2hhcnRIZWxwZXJcbiAqL1xuY29uc3QgQ2hhcnRIZWxwZXIgPSB7XG5cdGdldFAxM25Nb2RlKG9WaWV3RGF0YTogYW55KSB7XG5cdFx0Y29uc3QgYVBlcnNvbmFsaXphdGlvbiA9IFtdLFxuXHRcdFx0YlZhcmlhbnRNYW5hZ2VtZW50ID1cblx0XHRcdFx0b1ZpZXdEYXRhLnZhcmlhbnRNYW5hZ2VtZW50ICYmIChvVmlld0RhdGEudmFyaWFudE1hbmFnZW1lbnQgPT09IFwiUGFnZVwiIHx8IG9WaWV3RGF0YS52YXJpYW50TWFuYWdlbWVudCA9PT0gXCJDb250cm9sXCIpLFxuXHRcdFx0cGVyc29uYWxpemF0aW9uID0gdHJ1ZTsgLy8gYnkgZGVmYXVsdCBlbmFibGVkXG5cdFx0aWYgKGJWYXJpYW50TWFuYWdlbWVudCAmJiBwZXJzb25hbGl6YXRpb24pIHtcblx0XHRcdGlmIChwZXJzb25hbGl6YXRpb24pIHtcblx0XHRcdFx0Ly8gZnVsbCBwZXJzb25hbGl6YXRpb24gc2NvcGVcblx0XHRcdFx0cmV0dXJuIFwiU29ydCxUeXBlLEl0ZW1cIjtcblx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIHBlcnNvbmFsaXphdGlvbiA9PT0gXCJvYmplY3RcIikge1xuXHRcdFx0XHRpZiAoKHBlcnNvbmFsaXphdGlvbiBhcyBhbnkpLnR5cGUpIHtcblx0XHRcdFx0XHRhUGVyc29uYWxpemF0aW9uLnB1c2goXCJUeXBlXCIpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGlmICgocGVyc29uYWxpemF0aW9uIGFzIGFueSkuc29ydCkge1xuXHRcdFx0XHRcdGFQZXJzb25hbGl6YXRpb24ucHVzaChcIlNvcnRcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIGFQZXJzb25hbGl6YXRpb24uam9pbihcIixcIik7XG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRmb3JtYXRDaGFydFR5cGUob0NoYXJ0VHlwZTogYW55KSB7XG5cdFx0cmV0dXJuIChtQ2hhcnRUeXBlIGFzIGFueSlbb0NoYXJ0VHlwZS4kRW51bU1lbWJlcl07XG5cdH0sXG5cdGZvcm1hdERpbWVuc2lvbnMob0Fubm90YXRpb25Db250ZXh0OiBhbnkpIHtcblx0XHRjb25zdCBvQW5ub3RhdGlvbiA9IG9Bbm5vdGF0aW9uQ29udGV4dC5nZXRPYmplY3QoXCIuL1wiKSxcblx0XHRcdG9NZXRhTW9kZWwgPSBvQW5ub3RhdGlvbkNvbnRleHQuZ2V0TW9kZWwoKSxcblx0XHRcdHNFbnRpdHlTZXRQYXRoID0gZ2V0RW50aXR5U2V0UGF0aChvQW5ub3RhdGlvbkNvbnRleHQpLFxuXHRcdFx0YURpbWVuc2lvbnMgPSBbXTtcblx0XHRsZXQgaSwgajtcblx0XHRsZXQgYklzTmF2aWdhdGlvblRleHQgPSBmYWxzZTtcblxuXHRcdC8vcGVyaGFwcyB0aGVyZSBhcmUgbm8gZGltZW5zaW9uIGF0dHJpYnV0ZXNcblx0XHRvQW5ub3RhdGlvbi5EaW1lbnNpb25BdHRyaWJ1dGVzID0gb0Fubm90YXRpb24uRGltZW5zaW9uQXR0cmlidXRlcyB8fCBbXTtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCBvQW5ub3RhdGlvbi5EaW1lbnNpb25zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRjb25zdCBzS2V5ID0gb0Fubm90YXRpb24uRGltZW5zaW9uc1tpXS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0Y29uc3Qgb1RleHQgPSBvTWV0YU1vZGVsLmdldE9iamVjdChgJHtzRW50aXR5U2V0UGF0aCArIHNLZXl9QGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0YCkgfHwge307XG5cdFx0XHRpZiAoc0tleS5pbmRleE9mKFwiL1wiKSA+IC0xKSB7XG5cdFx0XHRcdExvZy5lcnJvcihgJGV4cGFuZCBpcyBub3QgeWV0IHN1cHBvcnRlZC4gRGltZW5zaW9uOiAke3NLZXl9IGZyb20gYW4gYXNzb2NpYXRpb24gY2Fubm90IGJlIHVzZWRgKTtcblx0XHRcdH1cblx0XHRcdGlmIChvVGV4dC4kUGF0aCAmJiBvVGV4dC4kUGF0aC5pbmRleE9mKFwiL1wiKSA+IC0xKSB7XG5cdFx0XHRcdExvZy5lcnJvcihcblx0XHRcdFx0XHRgJGV4cGFuZCBpcyBub3QgeWV0IHN1cHBvcnRlZC4gVGV4dCBQcm9wZXJ0eTogJHtvVGV4dC4kUGF0aH0gZnJvbSBhbiBhc3NvY2lhdGlvbiBjYW5ub3QgYmUgdXNlZCBmb3IgdGhlIGRpbWVuc2lvbiAke3NLZXl9YFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRiSXNOYXZpZ2F0aW9uVGV4dCA9IHRydWU7XG5cdFx0XHR9XG5cdFx0XHRjb25zdCBvRGltZW5zaW9uOiBhbnkgPSB7XG5cdFx0XHRcdGtleTogc0tleSxcblx0XHRcdFx0dGV4dFBhdGg6ICFiSXNOYXZpZ2F0aW9uVGV4dCA/IG9UZXh0LiRQYXRoIDogdW5kZWZpbmVkLFxuXHRcdFx0XHRsYWJlbDogb01ldGFNb2RlbC5nZXRPYmplY3QoYCR7c0VudGl0eVNldFBhdGggKyBzS2V5fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxgKSxcblx0XHRcdFx0cm9sZTogXCJjYXRlZ29yeVwiXG5cdFx0XHR9O1xuXG5cdFx0XHRmb3IgKGogPSAwOyBqIDwgb0Fubm90YXRpb24uRGltZW5zaW9uQXR0cmlidXRlcy5sZW5ndGg7IGorKykge1xuXHRcdFx0XHRjb25zdCBvQXR0cmlidXRlID0gb0Fubm90YXRpb24uRGltZW5zaW9uQXR0cmlidXRlc1tqXTtcblxuXHRcdFx0XHRpZiAob0RpbWVuc2lvbi5rZXkgPT09IG9BdHRyaWJ1dGUuRGltZW5zaW9uLiRQcm9wZXJ0eVBhdGgpIHtcblx0XHRcdFx0XHRvRGltZW5zaW9uLnJvbGUgPSBtRGltZW5zaW9uUm9sZVtvQXR0cmlidXRlLlJvbGUuJEVudW1NZW1iZXIgYXMga2V5b2YgdHlwZW9mIG1EaW1lbnNpb25Sb2xlXSB8fCBvRGltZW5zaW9uLnJvbGU7XG5cdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0b0RpbWVuc2lvbi5jcml0aWNhbGl0eSA9IE9EYXRhTWV0YU1vZGVsVXRpbC5mZXRjaENyaXRpY2FsaXR5KFxuXHRcdFx0XHRvTWV0YU1vZGVsLFxuXHRcdFx0XHRvTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KHNFbnRpdHlTZXRQYXRoICsgc0tleSlcblx0XHRcdCkudGhlbihmb3JtYXRKU09OVG9TdHJpbmcpO1xuXG5cdFx0XHRhRGltZW5zaW9ucy5wdXNoKG9EaW1lbnNpb24pO1xuXHRcdH1cblxuXHRcdGNvbnN0IG9EaW1lbnNpb25Nb2RlbCA9IG5ldyBKU09OTW9kZWwoYURpbWVuc2lvbnMpO1xuXHRcdChvRGltZW5zaW9uTW9kZWwgYXMgYW55KS4kJHZhbHVlQXNQcm9taXNlID0gdHJ1ZTtcblx0XHRyZXR1cm4gb0RpbWVuc2lvbk1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KFwiL1wiKTtcblx0fSxcblxuXHRmb3JtYXRNZWFzdXJlcyhvQW5ub3RhdGlvbkNvbnRleHQ6IGFueSkge1xuXHRcdHJldHVybiBvQW5ub3RhdGlvbkNvbnRleHQuZ2V0TW9kZWwoKS5nZXRPYmplY3QoKS5tZWFzdXJlcztcblx0fSxcblxuXHRnZXRVaUNoYXJ0KG9QcmVzZW50YXRpb25Db250ZXh0OiBhbnkpIHtcblx0XHRyZXR1cm4gZ2V0VWlDb250cm9sKG9QcmVzZW50YXRpb25Db250ZXh0LCBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5DaGFydFwiKTtcblx0fSxcblx0Z2V0T3BlcmF0aW9uQXZhaWxhYmxlTWFwKG9DaGFydENvbnRleHQ6IGFueSwgb0NvbnRleHQ6IGFueSkge1xuXHRcdGNvbnN0IGFDaGFydENvbGxlY3Rpb24gPSBvQ2hhcnRDb250ZXh0LkFjdGlvbnMgfHwgW107XG5cdFx0cmV0dXJuIEpTT04uc3RyaW5naWZ5KEFjdGlvbkhlbHBlci5nZXRPcGVyYXRpb25BdmFpbGFibGVNYXAoYUNoYXJ0Q29sbGVjdGlvbiwgXCJjaGFydFwiLCBvQ29udGV4dCkpO1xuXHR9LFxuXHQvKipcblx0ICogUmV0dXJucyBhIHN0cmluZ2lmaWVkIEpTT04gb2JqZWN0IGNvbnRhaW5pbmcgUHJlc2VudGF0aW9uIFZhcmlhbnQgc29ydCBjb25kaXRpb25zLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHRcblx0ICogQHBhcmFtIG9QcmVzZW50YXRpb25WYXJpYW50IFByZXNlbnRhdGlvbiBWYXJpYW50IGFubm90YXRpb25cblx0ICogQHBhcmFtIHNQcmVzZW50YXRpb25WYXJpYW50UGF0aFxuXHQgKiBAcGFyYW0gb0FwcGx5U3VwcG9ydGVkXG5cdCAqIEByZXR1cm5zIFN0cmluZ2lmaWVkIEpTT04gb2JqZWN0XG5cdCAqL1xuXHRnZXRTb3J0Q29uZGl0aW9uczogZnVuY3Rpb24gKG9Db250ZXh0OiBhbnksIG9QcmVzZW50YXRpb25WYXJpYW50OiBhbnksIHNQcmVzZW50YXRpb25WYXJpYW50UGF0aDogc3RyaW5nLCBvQXBwbHlTdXBwb3J0ZWQ6IGFueSkge1xuXHRcdGlmIChcblx0XHRcdG9QcmVzZW50YXRpb25WYXJpYW50ICYmXG5cdFx0XHRDb21tb25IZWxwZXIuX2lzUHJlc2VudGF0aW9uVmFyaWFudEFubm90YXRpb24oc1ByZXNlbnRhdGlvblZhcmlhbnRQYXRoKSAmJlxuXHRcdFx0b1ByZXNlbnRhdGlvblZhcmlhbnQuU29ydE9yZGVyXG5cdFx0KSB7XG5cdFx0XHRjb25zdCBhU29ydENvbmRpdGlvbnM6IGFueSA9IHtcblx0XHRcdFx0c29ydGVyczogW11cblx0XHRcdH07XG5cdFx0XHRjb25zdCBzRW50aXR5UGF0aCA9IG9Db250ZXh0LmdldFBhdGgoMCkuc3BsaXQoXCJAXCIpWzBdO1xuXHRcdFx0b1ByZXNlbnRhdGlvblZhcmlhbnQuU29ydE9yZGVyLmZvckVhY2goZnVuY3Rpb24gKG9Db25kaXRpb246IGFueSA9IHt9KSB7XG5cdFx0XHRcdGxldCBvU29ydFByb3BlcnR5OiBhbnkgPSBcIlwiO1xuXHRcdFx0XHRjb25zdCBvU29ydGVyOiBhbnkgPSB7fTtcblx0XHRcdFx0aWYgKG9Db25kaXRpb24uRHluYW1pY1Byb3BlcnR5KSB7XG5cdFx0XHRcdFx0b1NvcnRQcm9wZXJ0eSA9XG5cdFx0XHRcdFx0XHRcIl9mZV9hZ2dyZWdhdGFibGVfXCIgK1xuXHRcdFx0XHRcdFx0b0NvbnRleHQuZ2V0TW9kZWwoMCkuZ2V0T2JqZWN0KHNFbnRpdHlQYXRoICsgb0NvbmRpdGlvbi5EeW5hbWljUHJvcGVydHkuJEFubm90YXRpb25QYXRoKT8uTmFtZTtcblx0XHRcdFx0fSBlbHNlIGlmIChvQ29uZGl0aW9uLlByb3BlcnR5KSB7XG5cdFx0XHRcdFx0Y29uc3QgYUdyb3VwYWJsZVByb3BlcnRpZXMgPSBvQXBwbHlTdXBwb3J0ZWQuR3JvdXBhYmxlUHJvcGVydGllcztcblx0XHRcdFx0XHRpZiAoYUdyb3VwYWJsZVByb3BlcnRpZXMgJiYgYUdyb3VwYWJsZVByb3BlcnRpZXMubGVuZ3RoKSB7XG5cdFx0XHRcdFx0XHRmb3IgKGxldCBpID0gMDsgaSA8IGFHcm91cGFibGVQcm9wZXJ0aWVzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChhR3JvdXBhYmxlUHJvcGVydGllc1tpXS4kUHJvcGVydHlQYXRoID09PSBvQ29uZGl0aW9uLlByb3BlcnR5LiRQcm9wZXJ0eVBhdGgpIHtcblx0XHRcdFx0XHRcdFx0XHRvU29ydFByb3BlcnR5ID0gXCJfZmVfZ3JvdXBhYmxlX1wiICsgb0NvbmRpdGlvbi5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGlmICghb1NvcnRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdG9Tb3J0UHJvcGVydHkgPSBcIl9mZV9hZ2dyZWdhdGFibGVfXCIgKyBvQ29uZGl0aW9uLlByb3BlcnR5LiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2UgaWYgKFxuXHRcdFx0XHRcdFx0b0NvbnRleHRcblx0XHRcdFx0XHRcdFx0LmdldE1vZGVsKDApXG5cdFx0XHRcdFx0XHRcdC5nZXRPYmplY3Qoc0VudGl0eVBhdGggKyBvQ29uZGl0aW9uLlByb3BlcnR5LiRQcm9wZXJ0eVBhdGggKyBcIkBPcmcuT0RhdGEuQWdncmVnYXRpb24uVjEuR3JvdXBhYmxlXCIpXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHRvU29ydFByb3BlcnR5ID0gXCJfZmVfZ3JvdXBhYmxlX1wiICsgb0NvbmRpdGlvbi5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRvU29ydFByb3BlcnR5ID0gXCJfZmVfYWdncmVnYXRhYmxlX1wiICsgb0NvbmRpdGlvbi5Qcm9wZXJ0eS4kUHJvcGVydHlQYXRoO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRpZiAob1NvcnRQcm9wZXJ0eSkge1xuXHRcdFx0XHRcdG9Tb3J0ZXIubmFtZSA9IG9Tb3J0UHJvcGVydHk7XG5cdFx0XHRcdFx0b1NvcnRlci5kZXNjZW5kaW5nID0gISFvQ29uZGl0aW9uLkRlc2NlbmRpbmc7XG5cdFx0XHRcdFx0YVNvcnRDb25kaXRpb25zLnNvcnRlcnMucHVzaChvU29ydGVyKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJQbGVhc2UgZGVmaW5lIHRoZSByaWdodCBwYXRoIHRvIHRoZSBzb3J0IHByb3BlcnR5XCIpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBKU09OLnN0cmluZ2lmeShhU29ydENvbmRpdGlvbnMpO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9LFxuXHRnZXRCaW5kaW5nRGF0YShzVGFyZ2V0Q29sbGVjdGlvbjogYW55LCBvQ29udGV4dDogYW55LCBhQWN0aW9uczogYW55KSB7XG5cdFx0Y29uc3QgYU9wZXJhdGlvbkF2YWlsYWJsZVBhdGggPSBbXTtcblx0XHRsZXQgc1NlbGVjdDtcblx0XHRmb3IgKGNvbnN0IGkgaW4gYUFjdGlvbnMpIHtcblx0XHRcdGlmIChhQWN0aW9uc1tpXS4kVHlwZSA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIikge1xuXHRcdFx0XHRjb25zdCBzQWN0aW9uTmFtZSA9IGFBY3Rpb25zW2ldLkFjdGlvbjtcblx0XHRcdFx0Y29uc3Qgb0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSA9IENvbW1vbkhlbHBlci5nZXRBY3Rpb25QYXRoKG9Db250ZXh0LCBmYWxzZSwgc0FjdGlvbk5hbWUsIHRydWUpO1xuXHRcdFx0XHRpZiAob0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSAmJiBvQWN0aW9uT3BlcmF0aW9uQXZhaWxhYmxlLiRQYXRoKSB7XG5cdFx0XHRcdFx0YU9wZXJhdGlvbkF2YWlsYWJsZVBhdGgucHVzaChgJyR7b0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZS4kUGF0aH0nYCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAob0FjdGlvbk9wZXJhdGlvbkF2YWlsYWJsZSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdC8vIFdlIGRpc2FibGVkIGFjdGlvbiBhZHZlcnRpc2VtZW50IGJ1dCBrZXB0IGl0IGluIHRoZSBjb2RlIGZvciB0aGUgdGltZSBiZWluZ1xuXHRcdFx0XHRcdC8vYU9wZXJhdGlvbkF2YWlsYWJsZVBhdGgucHVzaChzQWN0aW9uTmFtZSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdFx0aWYgKGFPcGVyYXRpb25BdmFpbGFibGVQYXRoLmxlbmd0aCA+IDApIHtcblx0XHRcdC8vVE9ETzogcmVxdWVzdCBmYWlscyB3aXRoICRzZWxlY3QuIGNoZWNrIHRoaXMgd2l0aCBvZGF0YSB2NCBtb2RlbFxuXHRcdFx0c1NlbGVjdCA9IFwiICRzZWxlY3Q6ICdcIiArIGFPcGVyYXRpb25BdmFpbGFibGVQYXRoLmpvaW4oKSArIFwiJ1wiO1xuXHRcdH1cblx0XHRyZXR1cm4gKFxuXHRcdFx0XCIne3BhdGg6ICdcIiArXG5cdFx0XHQob0NvbnRleHQuZ2V0T2JqZWN0KFwiJGtpbmRcIikgPT09IFwiRW50aXR5U2V0XCIgPyBcIi9cIiA6IFwiXCIpICtcblx0XHRcdG9Db250ZXh0LmdldE9iamVjdChcIkBzYXB1aS5uYW1lXCIpICtcblx0XHRcdFwiJ1wiICtcblx0XHRcdChzU2VsZWN0ID8gXCIscGFyYW1ldGVyczp7XCIgKyBzU2VsZWN0ICsgXCJ9XCIgOiBcIlwiKSArXG5cdFx0XHRcIn0nXCJcblx0XHQpO1xuXHR9LFxuXHRfZ2V0TW9kZWwob0NvbGxlY3Rpb246IGFueSwgb0ludGVyZmFjZTogYW55KSB7XG5cdFx0cmV0dXJuIG9JbnRlcmZhY2UuY29udGV4dDtcblx0fSxcblx0Ly8gVE9ETzogY29tYmluZSB0aGlzIG9uZSB3aXRoIHRoZSBvbmUgZnJvbSB0aGUgdGFibGVcblx0aXNEYXRhRmllbGRGb3JBY3Rpb25CdXR0b25FbmFibGVkKFxuXHRcdGJJc0JvdW5kOiBib29sZWFuLFxuXHRcdHNBY3Rpb246IHN0cmluZyxcblx0XHRvQ29sbGVjdGlvbjogQ29udGV4dCxcblx0XHRzT3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBzdHJpbmcsXG5cdFx0c0VuYWJsZVNlbGVjdE9uOiBzdHJpbmdcblx0KSB7XG5cdFx0aWYgKGJJc0JvdW5kICE9PSB0cnVlKSB7XG5cdFx0XHRyZXR1cm4gXCJ0cnVlXCI7XG5cdFx0fVxuXHRcdGNvbnN0IG9Nb2RlbCA9IG9Db2xsZWN0aW9uLmdldE1vZGVsKCk7XG5cdFx0Y29uc3Qgc05hdlBhdGggPSBvQ29sbGVjdGlvbi5nZXRQYXRoKCk7XG5cdFx0Y29uc3Qgc1BhcnRuZXIgPSBvTW9kZWwuZ2V0T2JqZWN0KHNOYXZQYXRoKS4kUGFydG5lcjtcblx0XHRjb25zdCBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwID0gc09wZXJhdGlvbkF2YWlsYWJsZU1hcCAmJiBKU09OLnBhcnNlKHNPcGVyYXRpb25BdmFpbGFibGVNYXApO1xuXHRcdGNvbnN0IGFQYXRoID0gb09wZXJhdGlvbkF2YWlsYWJsZU1hcCAmJiBvT3BlcmF0aW9uQXZhaWxhYmxlTWFwW3NBY3Rpb25dICYmIG9PcGVyYXRpb25BdmFpbGFibGVNYXBbc0FjdGlvbl0uc3BsaXQoXCIvXCIpO1xuXHRcdGNvbnN0IHNOdW1iZXJPZlNlbGVjdGVkQ29udGV4dHMgPSBBY3Rpb25IZWxwZXIuZ2V0TnVtYmVyT2ZDb250ZXh0c0V4cHJlc3Npb24oc0VuYWJsZVNlbGVjdE9uKTtcblx0XHRpZiAoYVBhdGggJiYgYVBhdGhbMF0gPT09IHNQYXJ0bmVyKSB7XG5cdFx0XHRjb25zdCBzUGF0aCA9IG9PcGVyYXRpb25BdmFpbGFibGVNYXBbc0FjdGlvbl0ucmVwbGFjZShzUGFydG5lciArIFwiL1wiLCBcIlwiKTtcblx0XHRcdHJldHVybiBcIns9ICR7XCIgKyBzTnVtYmVyT2ZTZWxlY3RlZENvbnRleHRzICsgXCIgJiYgJHtcIiArIHNQYXRoICsgXCJ9fVwiO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJ7PSAke1wiICsgc051bWJlck9mU2VsZWN0ZWRDb250ZXh0cyArIFwifVwiO1xuXHRcdH1cblx0fSxcblx0Z2V0SGlkZGVuUGF0aEV4cHJlc3Npb25Gb3JUYWJsZUFjdGlvbnNBbmRJQk4oc0hpZGRlblBhdGg6IGFueSwgb0RldGFpbHM6IGFueSkge1xuXHRcdGNvbnN0IG9Db250ZXh0ID0gb0RldGFpbHMuY29udGV4dCxcblx0XHRcdHNQcm9wZXJ0eVBhdGggPSBvQ29udGV4dC5nZXRQYXRoKCksXG5cdFx0XHRzRW50aXR5U2V0UGF0aCA9IE9EYXRhTW9kZWxBbm5vdGF0aW9uSGVscGVyLmdldE5hdmlnYXRpb25QYXRoKHNQcm9wZXJ0eVBhdGgpO1xuXHRcdGlmIChzSGlkZGVuUGF0aC5pbmRleE9mKFwiL1wiKSA+IDApIHtcblx0XHRcdGNvbnN0IGFTcGxpdEhpZGRlblBhdGggPSBzSGlkZGVuUGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRjb25zdCBzTmF2aWdhdGlvblBhdGggPSBhU3BsaXRIaWRkZW5QYXRoWzBdO1xuXHRcdFx0Ly8gc3VwcG9ydHMgdmlzaWJsaXR5IGJhc2VkIG9uIHRoZSBwcm9wZXJ0eSBmcm9tIHRoZSBwYXJ0bmVyIGFzc29jaWF0aW9uXG5cdFx0XHRpZiAob0NvbnRleHQuZ2V0T2JqZWN0KHNFbnRpdHlTZXRQYXRoICsgXCIvJFBhcnRuZXJcIikgPT09IHNOYXZpZ2F0aW9uUGF0aCkge1xuXHRcdFx0XHRyZXR1cm4gXCJ7PSAhJXtcIiArIGFTcGxpdEhpZGRlblBhdGguc2xpY2UoMSkuam9pbihcIi9cIikgKyBcIn0gfVwiO1xuXHRcdFx0fVxuXHRcdFx0Ly8gYW55IG90aGVyIGFzc29jaWF0aW9uIHdpbGwgYmUgaWdub3JlZCBhbmQgdGhlIGJ1dHRvbiB3aWxsIGJlIG1hZGUgdmlzaWJsZVxuXHRcdH1cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSxcblx0LyoqXG5cdCAqIE1ldGhvZCB0byBnZXQgcHJlc3MgZXZlbnQgZm9yIERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbi5cblx0ICpcblx0ICogQGZ1bmN0aW9uXG5cdCAqIEBuYW1lIGdldFByZXNzRXZlbnRGb3JEYXRhRmllbGRGb3JBY3Rpb25CdXR0b25cblx0ICogQHBhcmFtIHNJZCBJZCBvZiB0aGUgY3VycmVudCBjb250cm9sXG5cdCAqIEBwYXJhbSBvQWN0aW9uIEFjdGlvbiBtb2RlbFxuXHQgKiBAcGFyYW0gc09wZXJhdGlvbkF2YWlsYWJsZU1hcCBPcGVyYXRpb25BdmFpbGFibGVNYXAgU3RyaW5naWZpZWQgSlNPTiBvYmplY3Rcblx0ICogQHJldHVybnMgQSBiaW5kaW5nIGV4cHJlc3Npb24gZm9yIHByZXNzIHByb3BlcnR5IG9mIERhdGFGaWVsZEZvckFjdGlvbkJ1dHRvblxuXHQgKi9cblx0Z2V0UHJlc3NFdmVudEZvckRhdGFGaWVsZEZvckFjdGlvbkJ1dHRvbihzSWQ6IHN0cmluZywgb0FjdGlvbjogYW55LCBzT3BlcmF0aW9uQXZhaWxhYmxlTWFwOiBzdHJpbmcpIHtcblx0XHRjb25zdCBvUGFyYW1zID0ge1xuXHRcdFx0Y29udGV4dHM6IFwiJHtpbnRlcm5hbD5zZWxlY3RlZENvbnRleHRzfVwiXG5cdFx0fTtcblx0XHRyZXR1cm4gQWN0aW9uSGVscGVyLmdldFByZXNzRXZlbnREYXRhRmllbGRGb3JBY3Rpb25CdXR0b24oc0lkLCBvQWN0aW9uLCBvUGFyYW1zLCBzT3BlcmF0aW9uQXZhaWxhYmxlTWFwKTtcblx0fSxcblx0LyoqXG5cdCAqIEBmdW5jdGlvblxuXHQgKiBAbmFtZSBnZXRBY3Rpb25UeXBlXG5cdCAqIEBwYXJhbSBvQWN0aW9uIEFjdGlvbiBtb2RlbFxuXHQgKiBAcmV0dXJucyBBIEJvb2xlYW4gdmFsdWUgZGVwZW5kaW5nIG9uIHRoZSBhY3Rpb24gdHlwZVxuXHQgKi9cblx0Z2V0QWN0aW9uVHlwZShvQWN0aW9uOiBhbnkpIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0KG9BY3Rpb25bXCIkVHlwZVwiXS5pbmRleE9mKFwiY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuRGF0YUZpZWxkRm9ySW50ZW50QmFzZWROYXZpZ2F0aW9uXCIpID4gLTEgfHxcblx0XHRcdFx0b0FjdGlvbltcIiRUeXBlXCJdLmluZGV4T2YoXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5EYXRhRmllbGRGb3JBY3Rpb25cIikgPiAtMSkgJiZcblx0XHRcdG9BY3Rpb25bXCJJbmxpbmVcIl1cblx0XHQpO1xuXHR9LFxuXHRnZXRDb2xsZWN0aW9uTmFtZShzQ29sbGVjdGlvbjogYW55KSB7XG5cdFx0cmV0dXJuIHNDb2xsZWN0aW9uLnNwbGl0KFwiL1wiKVtzQ29sbGVjdGlvbi5zcGxpdChcIi9cIikubGVuZ3RoIC0gMV07XG5cdH1cbn07XG4oQ2hhcnRIZWxwZXIuZ2V0U29ydENvbmRpdGlvbnMgYXMgYW55KS5yZXF1aXJlc0lDb250ZXh0ID0gdHJ1ZTtcblxuZXhwb3J0IGRlZmF1bHQgQ2hhcnRIZWxwZXI7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7O0VBUUEsU0FBU0Esa0JBQWtCLENBQUNDLEtBQVUsRUFBRTtJQUN2QyxJQUFJLENBQUNBLEtBQUssRUFBRTtNQUNYLE9BQU9DLFNBQVM7SUFDakI7SUFFQSxJQUFJQyxZQUFZLEdBQUdDLElBQUksQ0FBQ0MsU0FBUyxDQUFDSixLQUFLLENBQUM7SUFDeENFLFlBQVks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