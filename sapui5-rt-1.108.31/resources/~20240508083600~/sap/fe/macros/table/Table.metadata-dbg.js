/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/converters/controls/Common/DataVisualization", "sap/fe/core/converters/MetaModelConverter", "sap/fe/core/helpers/StableIdHelper", "sap/fe/core/templating/DataModelPathHelper", "sap/fe/macros/internal/helpers/TableTemplating", "sap/fe/macros/MacroMetadata"], function (Log, DataVisualization, MetaModelConverter, StableIdHelper, DataModelPathHelper, TableTemplating, MacroMetadata) {
  "use strict";

  var buildExpressionForHeaderVisible = TableTemplating.buildExpressionForHeaderVisible;
  var getContextRelativeTargetObjectPath = DataModelPathHelper.getContextRelativeTargetObjectPath;
  var generate = StableIdHelper.generate;
  var getInvolvedDataModelObjects = MetaModelConverter.getInvolvedDataModelObjects;
  var getVisualizationsFromPresentationVariant = DataVisualization.getVisualizationsFromPresentationVariant;
  var getDataVisualizationConfiguration = DataVisualization.getDataVisualizationConfiguration;
  /**
   * @classdesc
   * Building block used to create a table based on the metadata provided by OData V4.
   *
   * Usage example:
   * <pre>
   * &lt;macro:Table
   *   id="someID"
   *   type="ResponsiveTable"
   *   collection="collection",
   *   presentation="presentation"
   *   selectionMode="Multi"
   *   requestGroupId="$auto.test"
   *   displayMode="false"
   *   personalization="Column,Sort"
   * /&gt;
   * </pre>
   * @class sap.fe.macros.Table
   * @hideconstructor
   * @private
   * @experimental
   */
  var Table = MacroMetadata.extend("sap.fe.macros.table.Table", {
    /**
     * Name of the macro control.
     */
    name: "Table",
    /**
     * Namespace of the macro control
     */
    namespace: "sap.fe.macros.internal",
    publicNamespace: "sap.fe.macros",
    /**
     * Fragment source of the macro (optional) - if not set, fragment is generated from namespace and name
     */
    fragment: "sap.fe.macros.table.Table",
    /**
     * The metadata describing the macro control.
     */
    metadata: {
      /**
       * Define macro stereotype for documentation
       */
      stereotype: "xmlmacro",
      /**
       * Properties.
       */
      properties: {
        tableDefinition: {
          type: "sap.ui.model.Context"
        },
        metaPath: {
          type: "sap.ui.model.Context",
          isPublic: true
        },
        contextPath: {
          type: "sap.ui.model.Context",
          isPublic: true
        },
        /**
         * metadataContext:collection Mandatory context to a collection (entitySet or 1:n navigation)
         */
        collection: {
          type: "sap.ui.model.Context",
          required: true,
          $kind: ["EntitySet", "NavigationProperty", "Singleton"]
        },
        /**
         * Parent EntitySet for the present collection
         */
        parentEntitySet: {
          type: "sap.ui.model.Context"
        },
        /**
         * ID of the table
         */
        id: {
          type: "string",
          isPublic: true
        },
        _apiId: {
          type: "string"
        },
        /**
         * Used for binding the table to a navigation path. Only the path is used for binding rows.
         */
        navigationPath: {
          type: "string"
        },
        /**
         * Specifies whether the table should be read-only or not.
         */
        readOnly: {
          type: "boolean",
          isPublic: true
        },
        fieldMode: {
          type: "string",
          defaultValue: "",
          allowedValues: ["", "nowrapper"]
        },
        /**
         * Specifies whether the button is hidden when no data has been entered yet in the row (true/false). The default setting is `false`.
         */
        disableAddRowButtonForEmptyData: {
          type: "boolean"
        },
        /**
         * Specifies the full path and function name of a custom validation function.
         */
        customValidationFunction: {
          type: "string"
        },
        /**
         * Specifies whether the table is displayed with condensed layout (true/false). The default setting is `false`.
         */
        useCondensedTableLayout: {
          type: "boolean"
        },
        /**
         * Specifies the possible actions available on the table row (Navigation,null). The default setting is `undefined`
         */
        rowAction: {
          type: "string",
          defaultValue: undefined
        },
        /**
         * Specifies the selection mode (None,Single,Multi,Auto)
         */
        selectionMode: {
          type: "string",
          isPublic: true
        },
        /**
         * The `busy` mode of table
         */
        busy: {
          type: "boolean",
          isPublic: true
        },
        /**
         * Parameter used to show the fullScreen button on the table.
         */
        enableFullScreen: {
          type: "boolean",
          isPublic: true
        },
        /**
         * Specifies header text that is shown in table.
         */
        header: {
          type: "string",
          isPublic: true
        },
        /**
         * Controls if the header text should be shown or not
         */
        headerVisible: {
          type: "boolean",
          isPublic: true
        },
        /**
         * Defines the "aria-level" of the table header
         */
        headerLevel: {
          type: "sap.ui.core.TitleLevel",
          defaultValue: "Auto",
          isPublic: true
        },
        /**
         * Parameter which sets the noDataText for the mdc table
         */
        noDataText: {
          type: "string"
        },
        /**
         * Creation Mode to be passed to the onCreate hanlder. Values: ["Inline", "NewPage"]
         */
        creationMode: {
          type: "string"
        },
        /**
         * Setting to determine if the new row should be created at the end or beginning
         */
        createAtEnd: {
          type: "boolean"
        },
        createOutbound: {
          type: "string"
        },
        createOutboundDetail: {
          type: "string"
        },
        createNewAction: {
          type: "string"
        },
        /**
         * Personalization Mode
         */
        personalization: {
          type: "string|boolean",
          isPublic: true
        },
        isSearchable: {
          type: "boolean",
          isPublic: true
        },
        /**
         * Allows to choose the Table type. Allowed values are `ResponsiveTable` or `GridTable`.
         */
        type: {
          type: "string",
          isPublic: true
        },
        tableType: {
          type: "string"
        },
        /**
         * Enable export to file
         */
        enableExport: {
          type: "boolean",
          isPublic: true
        },
        /**
         * Enable export to file
         */
        enablePaste: {
          type: "boolean",
          isPublic: true
        },
        /**
         * ONLY FOR GRID TABLE: Number of indices which can be selected in a range. If set to 0, the selection limit is disabled, and the Select All checkbox appears instead of the Deselect All button.
         */
        selectionLimit: {
          type: "string"
        },
        /**
         * ONLY FOR RESPONSIVE TABLE: Setting to define the checkbox in the column header: Allowed values are `Default` or `ClearAll`. If set to `Default`, the sap.m.Table control renders the Select All checkbox, otherwise the Deselect All button is rendered.
         */
        multiSelectMode: {
          type: "string"
        },
        /**
         * The control ID of the FilterBar that is used to filter the rows of the table.
         */
        filterBar: {
          type: "string",
          isPublic: true
        },
        /**
         * The control ID of the FilterBar that is used internally to filter the rows of the table.
         */
        filterBarId: {
          type: "string"
        },
        tableDelegate: {
          type: "string"
        },
        enableAutoScroll: {
          type: "boolean"
        },
        visible: {
          type: "string"
        },
        isAlp: {
          type: "boolean",
          defaultValue: false
        },
        variantManagement: {
          type: "string",
          isPublic: true
        },
        columnEditMode: {
          type: "string",
          computed: true
        },
        tabTitle: {
          type: "string",
          defaultValue: ""
        },
        enableAutoColumnWidth: {
          type: "boolean"
        },
        dataStateIndicatorFilter: {
          type: "string"
        },
        isCompactType: {
          type: "boolean"
        }
      },
      events: {
        variantSaved: {
          type: "function"
        },
        variantSelected: {
          type: "function"
        },
        /**
         * Event handler for change event
         */
        onChange: {
          type: "function"
        },
        /**
         * Event handler to react when the user chooses a row
         */
        rowPress: {
          type: "function",
          isPublic: true
        },
        /**
         * Event handler to react to the contextChange event of the table.
         */
        onContextChange: {
          type: "function"
        },
        /**
         * Event handler called when the user chooses an option of the segmented button in the ALP View
         */
        onSegmentedButtonPressed: {
          type: "function"
        },
        /**
         * Event handler to react to the stateChange event of the table.
         */
        stateChange: {
          type: "function"
        },
        /**
         * Event handler to react when the table selection changes
         */
        selectionChange: {
          type: "function",
          isPublic: true
        }
      },
      aggregations: {
        actions: {
          type: "sap.fe.macros.internal.table.Action | sap.fe.macros.internal.table.ActionGroup",
          isPublic: true
        },
        columns: {
          type: "sap.fe.macros.internal.table.Column",
          isPublic: true
        }
      }
    },
    create: function (oProps, oControlConfiguration, mSettings, oAggregations) {
      var oTableDefinition;
      var oContextObjectPath = getInvolvedDataModelObjects(oProps.metaPath, oProps.contextPath);
      if (!oProps.tableDefinition) {
        var initialConverterContext = this.getConverterContext(oContextObjectPath, oProps.contextPath, mSettings);
        var sVisualizationPath = this._getVisualizationPath(oContextObjectPath, initialConverterContext);
        var sPresentationPath = this._getPresentationPath(oContextObjectPath);

        //Check if we have ActionGroup and add nested actions
        var oExtraActions = this._buildActions(oAggregations.actions);
        var oExtraColumns = this.parseAggregation(oAggregations.columns, function (childColumn, columnChildIdx) {
          var _childColumn$children;
          var columnKey = childColumn.getAttribute("key") || "InlineXMLColumn_" + columnChildIdx;
          oAggregations[columnKey] = childColumn;
          return {
            // Defaults are to be defined in Table.ts
            key: columnKey,
            type: "Slot",
            width: childColumn.getAttribute("width"),
            importance: childColumn.getAttribute("importance"),
            horizontalAlign: childColumn.getAttribute("horizontalAlign"),
            availability: childColumn.getAttribute("availability"),
            header: childColumn.getAttribute("header"),
            template: ((_childColumn$children = childColumn.children[0]) === null || _childColumn$children === void 0 ? void 0 : _childColumn$children.outerHTML) || "",
            properties: childColumn.getAttribute("properties") ? childColumn.getAttribute("properties").split(",") : undefined,
            position: {
              placement: childColumn.getAttribute("positionPlacement"),
              anchor: childColumn.getAttribute("positionAnchor")
            }
          };
        });
        var oExtraParams = {};
        var mTableSettings = {
          enableExport: oProps.enableExport,
          enableFullScreen: oProps.enableFullScreen,
          enablePaste: oProps.enablePaste,
          selectionMode: oProps.selectionMode,
          type: oProps.type
        };
        //removes undefined values from mTableSettings
        mTableSettings = JSON.parse(JSON.stringify(mTableSettings));
        oExtraParams[sVisualizationPath] = {
          actions: oExtraActions,
          columns: oExtraColumns,
          tableSettings: mTableSettings
        };
        var oConverterContext = this.getConverterContext(oContextObjectPath, oProps.contextPath, mSettings, oExtraParams);
        var oVisualizationDefinition = getDataVisualizationConfiguration(sVisualizationPath, oProps.useCondensedLayout, oConverterContext, undefined, undefined, sPresentationPath);
        oTableDefinition = oVisualizationDefinition.visualizations[0];
        oProps.tableDefinition = this.createBindingContext(oTableDefinition, mSettings);
      } else {
        oTableDefinition = oProps.tableDefinition.getObject();
      }
      oTableDefinition.path = "{_pageModel>" + oProps.tableDefinition.getPath() + "}";
      // public properties processed by converter context
      this.setDefaultValue(oProps, "selectionMode", oTableDefinition.annotation.selectionMode, true);
      this.setDefaultValue(oProps, "enableFullScreen", oTableDefinition.control.enableFullScreen, true);
      this.setDefaultValue(oProps, "enableExport", oTableDefinition.control.enableExport, true);
      this.setDefaultValue(oProps, "enablePaste", oTableDefinition.annotation.standardActions.actions.paste.enabled, true);
      this.setDefaultValue(oProps, "updatablePropertyPath", oTableDefinition.annotation.standardActions.updatablePropertyPath, true);
      this.setDefaultValue(oProps, "type", oTableDefinition.control.type, true);
      this.setDefaultValue(oProps, "useCondensedTableLayout", oTableDefinition.control.useCondensedTableLayout);
      this.setDefaultValue(oProps, "disableAddRowButtonForEmptyData", oTableDefinition.control.disableAddRowButtonForEmptyData);
      this.setDefaultValue(oProps, "customValidationFunction", oTableDefinition.control.customValidationFunction);
      this.setDefaultValue(oProps, "headerVisible", oTableDefinition.control.headerVisible);
      this.setDefaultValue(oProps, "searchable", oTableDefinition.annotation.searchable);
      this.setDefaultValue(oProps, "showRowCount", oTableDefinition.control.showRowCount);
      this.setDefaultValue(oProps, "inlineCreationRowCount", oTableDefinition.control.inlineCreationRowCount);
      this.setDefaultValue(oProps, "header", oTableDefinition.annotation.title);
      this.setDefaultValue(oProps, "selectionLimit", oTableDefinition.control.selectionLimit);
      this.setDefaultValue(oProps, "isCompactType", oTableDefinition.control.isCompactType);
      if (oProps.id) {
        // The given ID shall be assigned to the TableAPI and not to the MDC Table
        oProps._apiId = oProps.id;
        oProps.id = this.getContentId(oProps.id);
      } else {
        // We generate the ID. Due to compatibility reasons we keep it on the MDC Table but provide assign
        // the ID with a ::Table suffix to the TableAPI
        this.setDefaultValue(oProps, "id", oTableDefinition.annotation.id);
        oProps._apiId = oTableDefinition.annotation.id + "::Table";
      }
      this.setDefaultValue(oProps, "creationMode", oTableDefinition.annotation.create.mode);
      this.setDefaultValue(oProps, "createAtEnd", oTableDefinition.annotation.create.append);
      this.setDefaultValue(oProps, "createOutbound", oTableDefinition.annotation.create.outbound);
      this.setDefaultValue(oProps, "createNewAction", oTableDefinition.annotation.create.newAction);
      this.setDefaultValue(oProps, "createOutboundDetail", oTableDefinition.annotation.create.outboundDetail);
      this.setDefaultValue(oProps, "personalization", oTableDefinition.annotation.p13nMode);
      this.setDefaultValue(oProps, "variantManagement", oTableDefinition.annotation.variantManagement);
      this.setDefaultValue(oProps, "enableAutoColumnWidth", oTableDefinition.control.enableAutoColumnWidth);
      this.setDefaultValue(oProps, "dataStateIndicatorFilter", oTableDefinition.control.dataStateIndicatorFilter);
      // Special code for readOnly
      // readonly = false -> Force editable
      // readonly = true -> Force display mode
      // readonly = undefined -> Bound to edit flow

      switch (oProps.readOnly) {
        case "false":
          oProps.readOnly = false;
          break;
        case "true":
          oProps.readOnly = true;
          break;
        default:
      }
      if (oProps.readOnly === undefined && oTableDefinition.annotation.displayMode === true) {
        oProps.readOnly = true;
      }
      if (oProps.rowPress) {
        oProps.rowAction = "Navigation";
      }
      this.setDefaultValue(oProps, "rowPress", oTableDefinition.annotation.row.press);
      this.setDefaultValue(oProps, "rowAction", oTableDefinition.annotation.row.action);
      if (oProps.personalization === "false") {
        oProps.personalization = undefined;
      } else if (oProps.personalization === "true") {
        oProps.personalization = "Sort,Column,Filter";
      }
      switch (oProps.personalization) {
        case "false":
          oProps.personalization = undefined;
          break;
        case "true":
          oProps.personalization = "Sort,Column,Filter";
          break;
        default:
      }
      if (oProps.isSearchable === "false") {
        oProps.searchable = false;
      } else {
        oProps.searchable = oTableDefinition.annotation.searchable;
      }
      var useBasicSearch = false;

      // Note for the 'filterBar' property:
      // 1. ID relative to the view of the Table.
      // 2. Absolute ID.
      // 3. ID would be considered in association to TableAPI's ID.
      if (!oProps.filterBar && !oProps.filterBarId && oProps.searchable) {
        // filterBar: Public property for building blocks
        // filterBarId: Only used as Internal private property for FE templates
        oProps.filterBarId = generate([oProps.id, "StandardAction", "BasicSearch"]);
        useBasicSearch = true;
      }
      // Internal properties
      oProps.useBasicSearch = useBasicSearch;
      oProps.tableType = oProps.type;
      oProps.showCreate = oTableDefinition.annotation.standardActions.actions.create.visible || true;
      oProps.autoBindOnInit = oTableDefinition.annotation.autoBindOnInit;

      // Internal that I want to remove in the end
      oProps.navigationPath = oTableDefinition.annotation.navigationPath; // oTableDefinition.annotation.collection; //DataModelPathHelper.getContextRelativeTargetObjectPath(oContextObjectPath); //
      if (oTableDefinition.annotation.collection.startsWith("/") && oContextObjectPath.startingEntitySet._type === "Singleton") {
        oTableDefinition.annotation.collection = oProps.navigationPath;
      }
      oProps.parentEntitySet = mSettings.models.metaModel.createBindingContext("/" + (oContextObjectPath.contextLocation.targetEntitySet ? oContextObjectPath.contextLocation.targetEntitySet.name : oContextObjectPath.startingEntitySet.name));
      oProps.collection = mSettings.models.metaModel.createBindingContext(oTableDefinition.annotation.collection);
      switch (oProps.readOnly) {
        case true:
          oProps.columnEditMode = "Display";
          break;
        case false:
          oProps.columnEditMode = "Editable";
          break;
        default:
          oProps.columnEditMode = undefined;
      }
      // Regarding the remaining ones that I think we could review
      // selectedContextsModel -> potentially hardcoded or internal only
      // onContextChange -> Autoscroll ... might need revision
      // onChange -> Just proxied down to the Field may need to see if needed or not
      // variantSelected / variantSaved -> Variant Management standard helpers ?
      // tableDelegate  -> used externally for ALP ... might need to see if relevant still
      // onSegmentedButtonPressed -> ALP specific, should be a dedicated control for the contentViewSwitcher
      // visible -> related to this ALP contentViewSwitcher... maybe an outer control would make more sense ?

      oProps.headerBindingExpression = buildExpressionForHeaderVisible(oProps);
      return oProps;
    },
    /**
     * Build actions and action groups for table visualisation.
     *
     * @param oActions XML node corresponding to actions
     * @returns Prepared actions
     */
    _buildActions: function (oActions) {
      var oExtraActions = {};
      if (oActions && oActions.children.length > 0) {
        var actions = Array.prototype.slice.apply(oActions.children);
        var actionIdx = 0;
        actions.forEach(function (act) {
          actionIdx++;
          var menuActions = [];
          if (act.children.length && act.localName === "ActionGroup" && act.namespaceURI === "sap.fe.macros") {
            var actionsToAdd = Array.prototype.slice.apply(act.children);
            actionsToAdd.forEach(function (actToAdd) {
              var actionKeyAdd = actToAdd.getAttribute("key") || "InlineXMLAction_" + actionIdx;
              var curOutObject = {
                key: actionKeyAdd,
                text: actToAdd.getAttribute("text"),
                __noWrap: true,
                press: actToAdd.getAttribute("press"),
                requiresSelection: actToAdd.getAttribute("requiresSelection") === "true",
                enabled: actToAdd.getAttribute("enabled") === null ? true : actToAdd.getAttribute("enabled")
              };
              oExtraActions[curOutObject.key] = curOutObject;
              actionIdx++;
            });
            menuActions = Object.values(oExtraActions).slice(-act.children.length).map(function (menuItem) {
              return menuItem.key;
            });
          }
          var actionKey = act.getAttribute("key") || "InlineXMLAction_" + actionIdx;
          var actObject = {
            key: actionKey,
            text: act.getAttribute("text"),
            position: {
              placement: act.getAttribute("placement"),
              anchor: act.getAttribute("anchor")
            },
            __noWrap: true,
            press: act.getAttribute("press"),
            requiresSelection: act.getAttribute("requiresSelection") === "true",
            enabled: act.getAttribute("enabled") === null ? true : act.getAttribute("enabled"),
            menu: menuActions.length ? menuActions : null
          };
          oExtraActions[actObject.key] = actObject;
        });
      }
      return oExtraActions;
    },
    /**
     * Returns the annotation path pointing to the visualization annotation (LineItem).
     *
     * @param contextObjectPath The datamodel object path for the table
     * @param converterContext The converter context
     * @returns The annotation path
     */
    _getVisualizationPath: function (contextObjectPath, converterContext) {
      var metaPath = getContextRelativeTargetObjectPath(contextObjectPath);
      if (contextObjectPath.targetObject.term === "com.sap.vocabularies.UI.v1.LineItem") {
        return metaPath; // MetaPath is already pointing to a LineItem
      }
      //Need to switch to the context related the PV or SPV
      var resolvedTarget = converterContext.getEntityTypeAnnotation(metaPath);
      var visualizations = [];
      switch (contextObjectPath.targetObject.term) {
        case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
          if (contextObjectPath.targetObject.PresentationVariant) {
            visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject.PresentationVariant, metaPath, resolvedTarget.converterContext);
          }
          break;
        case "com.sap.vocabularies.UI.v1.PresentationVariant":
          visualizations = getVisualizationsFromPresentationVariant(contextObjectPath.targetObject, metaPath, resolvedTarget.converterContext);
          break;
        default:
          Log.error("Bad metapath parameter for table : ".concat(contextObjectPath.targetObject.term));
      }
      var lineItemViz = visualizations.find(function (viz) {
        return viz.visualization.term === "com.sap.vocabularies.UI.v1.LineItem";
      });
      if (lineItemViz) {
        return lineItemViz.annotationPath;
      } else {
        return metaPath; // Fallback
      }
    },

    _getPresentationPath: function (oContextObjectPath) {
      var presentationPath;
      switch (oContextObjectPath.targetObject.term) {
        case "com.sap.vocabularies.UI.v1.PresentationVariant":
          presentationPath = getContextRelativeTargetObjectPath(oContextObjectPath);
          break;
        case "com.sap.vocabularies.UI.v1.SelectionPresentationVariant":
          presentationPath = getContextRelativeTargetObjectPath(oContextObjectPath) + "/PresentationVariant";
          break;
        default:
          presentationPath = null;
      }
      return presentationPath;
    }
  });
  return Table;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUYWJsZSIsIk1hY3JvTWV0YWRhdGEiLCJleHRlbmQiLCJuYW1lIiwibmFtZXNwYWNlIiwicHVibGljTmFtZXNwYWNlIiwiZnJhZ21lbnQiLCJtZXRhZGF0YSIsInN0ZXJlb3R5cGUiLCJwcm9wZXJ0aWVzIiwidGFibGVEZWZpbml0aW9uIiwidHlwZSIsIm1ldGFQYXRoIiwiaXNQdWJsaWMiLCJjb250ZXh0UGF0aCIsImNvbGxlY3Rpb24iLCJyZXF1aXJlZCIsIiRraW5kIiwicGFyZW50RW50aXR5U2V0IiwiaWQiLCJfYXBpSWQiLCJuYXZpZ2F0aW9uUGF0aCIsInJlYWRPbmx5IiwiZmllbGRNb2RlIiwiZGVmYXVsdFZhbHVlIiwiYWxsb3dlZFZhbHVlcyIsImRpc2FibGVBZGRSb3dCdXR0b25Gb3JFbXB0eURhdGEiLCJjdXN0b21WYWxpZGF0aW9uRnVuY3Rpb24iLCJ1c2VDb25kZW5zZWRUYWJsZUxheW91dCIsInJvd0FjdGlvbiIsInVuZGVmaW5lZCIsInNlbGVjdGlvbk1vZGUiLCJidXN5IiwiZW5hYmxlRnVsbFNjcmVlbiIsImhlYWRlciIsImhlYWRlclZpc2libGUiLCJoZWFkZXJMZXZlbCIsIm5vRGF0YVRleHQiLCJjcmVhdGlvbk1vZGUiLCJjcmVhdGVBdEVuZCIsImNyZWF0ZU91dGJvdW5kIiwiY3JlYXRlT3V0Ym91bmREZXRhaWwiLCJjcmVhdGVOZXdBY3Rpb24iLCJwZXJzb25hbGl6YXRpb24iLCJpc1NlYXJjaGFibGUiLCJ0YWJsZVR5cGUiLCJlbmFibGVFeHBvcnQiLCJlbmFibGVQYXN0ZSIsInNlbGVjdGlvbkxpbWl0IiwibXVsdGlTZWxlY3RNb2RlIiwiZmlsdGVyQmFyIiwiZmlsdGVyQmFySWQiLCJ0YWJsZURlbGVnYXRlIiwiZW5hYmxlQXV0b1Njcm9sbCIsInZpc2libGUiLCJpc0FscCIsInZhcmlhbnRNYW5hZ2VtZW50IiwiY29sdW1uRWRpdE1vZGUiLCJjb21wdXRlZCIsInRhYlRpdGxlIiwiZW5hYmxlQXV0b0NvbHVtbldpZHRoIiwiZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyIiwiaXNDb21wYWN0VHlwZSIsImV2ZW50cyIsInZhcmlhbnRTYXZlZCIsInZhcmlhbnRTZWxlY3RlZCIsIm9uQ2hhbmdlIiwicm93UHJlc3MiLCJvbkNvbnRleHRDaGFuZ2UiLCJvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQiLCJzdGF0ZUNoYW5nZSIsInNlbGVjdGlvbkNoYW5nZSIsImFnZ3JlZ2F0aW9ucyIsImFjdGlvbnMiLCJjb2x1bW5zIiwiY3JlYXRlIiwib1Byb3BzIiwib0NvbnRyb2xDb25maWd1cmF0aW9uIiwibVNldHRpbmdzIiwib0FnZ3JlZ2F0aW9ucyIsIm9UYWJsZURlZmluaXRpb24iLCJvQ29udGV4dE9iamVjdFBhdGgiLCJnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMiLCJpbml0aWFsQ29udmVydGVyQ29udGV4dCIsImdldENvbnZlcnRlckNvbnRleHQiLCJzVmlzdWFsaXphdGlvblBhdGgiLCJfZ2V0VmlzdWFsaXphdGlvblBhdGgiLCJzUHJlc2VudGF0aW9uUGF0aCIsIl9nZXRQcmVzZW50YXRpb25QYXRoIiwib0V4dHJhQWN0aW9ucyIsIl9idWlsZEFjdGlvbnMiLCJvRXh0cmFDb2x1bW5zIiwicGFyc2VBZ2dyZWdhdGlvbiIsImNoaWxkQ29sdW1uIiwiY29sdW1uQ2hpbGRJZHgiLCJjb2x1bW5LZXkiLCJnZXRBdHRyaWJ1dGUiLCJrZXkiLCJ3aWR0aCIsImltcG9ydGFuY2UiLCJob3Jpem9udGFsQWxpZ24iLCJhdmFpbGFiaWxpdHkiLCJ0ZW1wbGF0ZSIsImNoaWxkcmVuIiwib3V0ZXJIVE1MIiwic3BsaXQiLCJwb3NpdGlvbiIsInBsYWNlbWVudCIsImFuY2hvciIsIm9FeHRyYVBhcmFtcyIsIm1UYWJsZVNldHRpbmdzIiwiSlNPTiIsInBhcnNlIiwic3RyaW5naWZ5IiwidGFibGVTZXR0aW5ncyIsIm9Db252ZXJ0ZXJDb250ZXh0Iiwib1Zpc3VhbGl6YXRpb25EZWZpbml0aW9uIiwiZ2V0RGF0YVZpc3VhbGl6YXRpb25Db25maWd1cmF0aW9uIiwidXNlQ29uZGVuc2VkTGF5b3V0IiwidmlzdWFsaXphdGlvbnMiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImdldE9iamVjdCIsInBhdGgiLCJnZXRQYXRoIiwic2V0RGVmYXVsdFZhbHVlIiwiYW5ub3RhdGlvbiIsImNvbnRyb2wiLCJzdGFuZGFyZEFjdGlvbnMiLCJwYXN0ZSIsImVuYWJsZWQiLCJ1cGRhdGFibGVQcm9wZXJ0eVBhdGgiLCJzZWFyY2hhYmxlIiwic2hvd1Jvd0NvdW50IiwiaW5saW5lQ3JlYXRpb25Sb3dDb3VudCIsInRpdGxlIiwiZ2V0Q29udGVudElkIiwibW9kZSIsImFwcGVuZCIsIm91dGJvdW5kIiwibmV3QWN0aW9uIiwib3V0Ym91bmREZXRhaWwiLCJwMTNuTW9kZSIsImRpc3BsYXlNb2RlIiwicm93IiwicHJlc3MiLCJhY3Rpb24iLCJ1c2VCYXNpY1NlYXJjaCIsImdlbmVyYXRlIiwic2hvd0NyZWF0ZSIsImF1dG9CaW5kT25Jbml0Iiwic3RhcnRzV2l0aCIsInN0YXJ0aW5nRW50aXR5U2V0IiwiX3R5cGUiLCJtb2RlbHMiLCJtZXRhTW9kZWwiLCJjb250ZXh0TG9jYXRpb24iLCJ0YXJnZXRFbnRpdHlTZXQiLCJoZWFkZXJCaW5kaW5nRXhwcmVzc2lvbiIsImJ1aWxkRXhwcmVzc2lvbkZvckhlYWRlclZpc2libGUiLCJvQWN0aW9ucyIsImxlbmd0aCIsIkFycmF5IiwicHJvdG90eXBlIiwic2xpY2UiLCJhcHBseSIsImFjdGlvbklkeCIsImZvckVhY2giLCJhY3QiLCJtZW51QWN0aW9ucyIsImxvY2FsTmFtZSIsIm5hbWVzcGFjZVVSSSIsImFjdGlvbnNUb0FkZCIsImFjdFRvQWRkIiwiYWN0aW9uS2V5QWRkIiwiY3VyT3V0T2JqZWN0IiwidGV4dCIsIl9fbm9XcmFwIiwicmVxdWlyZXNTZWxlY3Rpb24iLCJPYmplY3QiLCJ2YWx1ZXMiLCJtYXAiLCJtZW51SXRlbSIsImFjdGlvbktleSIsImFjdE9iamVjdCIsIm1lbnUiLCJjb250ZXh0T2JqZWN0UGF0aCIsImNvbnZlcnRlckNvbnRleHQiLCJnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIiwidGFyZ2V0T2JqZWN0IiwidGVybSIsInJlc29sdmVkVGFyZ2V0IiwiZ2V0RW50aXR5VHlwZUFubm90YXRpb24iLCJQcmVzZW50YXRpb25WYXJpYW50IiwiZ2V0VmlzdWFsaXphdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudCIsIkxvZyIsImVycm9yIiwibGluZUl0ZW1WaXoiLCJmaW5kIiwidml6IiwidmlzdWFsaXphdGlvbiIsImFubm90YXRpb25QYXRoIiwicHJlc2VudGF0aW9uUGF0aCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiVGFibGUubWV0YWRhdGEudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgVUlBbm5vdGF0aW9uVGVybXMgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL1VJXCI7XG5pbXBvcnQgTG9nIGZyb20gXCJzYXAvYmFzZS9Mb2dcIjtcbmltcG9ydCB0eXBlIHsgVmlzdWFsaXphdGlvbkFuZFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB7XG5cdGdldERhdGFWaXN1YWxpemF0aW9uQ29uZmlndXJhdGlvbixcblx0Z2V0VmlzdWFsaXphdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudFxufSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udmVydGVycy9jb250cm9scy9Db21tb24vRGF0YVZpc3VhbGl6YXRpb25cIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvQ29udmVydGVyQ29udGV4dFwiO1xuaW1wb3J0IHsgZ2V0SW52b2x2ZWREYXRhTW9kZWxPYmplY3RzIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvTWV0YU1vZGVsQ29udmVydGVyXCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgdHlwZSB7IERhdGFNb2RlbE9iamVjdFBhdGggfSBmcm9tIFwic2FwL2ZlL2NvcmUvdGVtcGxhdGluZy9EYXRhTW9kZWxQYXRoSGVscGVyXCI7XG5pbXBvcnQgeyBnZXRDb250ZXh0UmVsYXRpdmVUYXJnZXRPYmplY3RQYXRoIH0gZnJvbSBcInNhcC9mZS9jb3JlL3RlbXBsYXRpbmcvRGF0YU1vZGVsUGF0aEhlbHBlclwiO1xuaW1wb3J0IHsgYnVpbGRFeHByZXNzaW9uRm9ySGVhZGVyVmlzaWJsZSB9IGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL2hlbHBlcnMvVGFibGVUZW1wbGF0aW5nXCI7XG5pbXBvcnQgTWFjcm9NZXRhZGF0YSBmcm9tIFwic2FwL2ZlL21hY3Jvcy9NYWNyb01ldGFkYXRhXCI7XG5cbi8qKlxuICogQGNsYXNzZGVzY1xuICogQnVpbGRpbmcgYmxvY2sgdXNlZCB0byBjcmVhdGUgYSB0YWJsZSBiYXNlZCBvbiB0aGUgbWV0YWRhdGEgcHJvdmlkZWQgYnkgT0RhdGEgVjQuXG4gKlxuICogVXNhZ2UgZXhhbXBsZTpcbiAqIDxwcmU+XG4gKiAmbHQ7bWFjcm86VGFibGVcbiAqICAgaWQ9XCJzb21lSURcIlxuICogICB0eXBlPVwiUmVzcG9uc2l2ZVRhYmxlXCJcbiAqICAgY29sbGVjdGlvbj1cImNvbGxlY3Rpb25cIixcbiAqICAgcHJlc2VudGF0aW9uPVwicHJlc2VudGF0aW9uXCJcbiAqICAgc2VsZWN0aW9uTW9kZT1cIk11bHRpXCJcbiAqICAgcmVxdWVzdEdyb3VwSWQ9XCIkYXV0by50ZXN0XCJcbiAqICAgZGlzcGxheU1vZGU9XCJmYWxzZVwiXG4gKiAgIHBlcnNvbmFsaXphdGlvbj1cIkNvbHVtbixTb3J0XCJcbiAqIC8mZ3Q7XG4gKiA8L3ByZT5cbiAqIEBjbGFzcyBzYXAuZmUubWFjcm9zLlRhYmxlXG4gKiBAaGlkZWNvbnN0cnVjdG9yXG4gKiBAcHJpdmF0ZVxuICogQGV4cGVyaW1lbnRhbFxuICovXG5jb25zdCBUYWJsZSA9IE1hY3JvTWV0YWRhdGEuZXh0ZW5kKFwic2FwLmZlLm1hY3Jvcy50YWJsZS5UYWJsZVwiLCB7XG5cdC8qKlxuXHQgKiBOYW1lIG9mIHRoZSBtYWNybyBjb250cm9sLlxuXHQgKi9cblx0bmFtZTogXCJUYWJsZVwiLFxuXHQvKipcblx0ICogTmFtZXNwYWNlIG9mIHRoZSBtYWNybyBjb250cm9sXG5cdCAqL1xuXHRuYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbFwiLFxuXHRwdWJsaWNOYW1lc3BhY2U6IFwic2FwLmZlLm1hY3Jvc1wiLFxuXHQvKipcblx0ICogRnJhZ21lbnQgc291cmNlIG9mIHRoZSBtYWNybyAob3B0aW9uYWwpIC0gaWYgbm90IHNldCwgZnJhZ21lbnQgaXMgZ2VuZXJhdGVkIGZyb20gbmFtZXNwYWNlIGFuZCBuYW1lXG5cdCAqL1xuXHRmcmFnbWVudDogXCJzYXAuZmUubWFjcm9zLnRhYmxlLlRhYmxlXCIsXG5cdC8qKlxuXHQgKiBUaGUgbWV0YWRhdGEgZGVzY3JpYmluZyB0aGUgbWFjcm8gY29udHJvbC5cblx0ICovXG5cdG1ldGFkYXRhOiB7XG5cdFx0LyoqXG5cdFx0ICogRGVmaW5lIG1hY3JvIHN0ZXJlb3R5cGUgZm9yIGRvY3VtZW50YXRpb25cblx0XHQgKi9cblx0XHRzdGVyZW90eXBlOiBcInhtbG1hY3JvXCIsXG5cdFx0LyoqXG5cdFx0ICogUHJvcGVydGllcy5cblx0XHQgKi9cblx0XHRwcm9wZXJ0aWVzOiB7XG5cdFx0XHR0YWJsZURlZmluaXRpb246IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdFx0XHR9LFxuXHRcdFx0bWV0YVBhdGg6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdGNvbnRleHRQYXRoOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLm1vZGVsLkNvbnRleHRcIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cblx0XHRcdC8qKlxuXHRcdFx0ICogbWV0YWRhdGFDb250ZXh0OmNvbGxlY3Rpb24gTWFuZGF0b3J5IGNvbnRleHQgdG8gYSBjb2xsZWN0aW9uIChlbnRpdHlTZXQgb3IgMTpuIG5hdmlnYXRpb24pXG5cdFx0XHQgKi9cblx0XHRcdGNvbGxlY3Rpb246IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiLFxuXHRcdFx0XHRyZXF1aXJlZDogdHJ1ZSxcblx0XHRcdFx0JGtpbmQ6IFtcIkVudGl0eVNldFwiLCBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiLCBcIlNpbmdsZXRvblwiXVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogUGFyZW50IEVudGl0eVNldCBmb3IgdGhlIHByZXNlbnQgY29sbGVjdGlvblxuXHRcdFx0ICovXG5cdFx0XHRwYXJlbnRFbnRpdHlTZXQ6IHtcblx0XHRcdFx0dHlwZTogXCJzYXAudWkubW9kZWwuQ29udGV4dFwiXG5cdFx0XHR9LFxuXG5cdFx0XHQvKipcblx0XHRcdCAqIElEIG9mIHRoZSB0YWJsZVxuXHRcdFx0ICovXG5cdFx0XHRpZDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdF9hcGlJZDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBVc2VkIGZvciBiaW5kaW5nIHRoZSB0YWJsZSB0byBhIG5hdmlnYXRpb24gcGF0aC4gT25seSB0aGUgcGF0aCBpcyB1c2VkIGZvciBiaW5kaW5nIHJvd3MuXG5cdFx0XHQgKi9cblx0XHRcdG5hdmlnYXRpb25QYXRoOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFNwZWNpZmllcyB3aGV0aGVyIHRoZSB0YWJsZSBzaG91bGQgYmUgcmVhZC1vbmx5IG9yIG5vdC5cblx0XHRcdCAqL1xuXHRcdFx0cmVhZE9ubHk6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0ZmllbGRNb2RlOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGRlZmF1bHRWYWx1ZTogXCJcIixcblx0XHRcdFx0YWxsb3dlZFZhbHVlczogW1wiXCIsIFwibm93cmFwcGVyXCJdXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTcGVjaWZpZXMgd2hldGhlciB0aGUgYnV0dG9uIGlzIGhpZGRlbiB3aGVuIG5vIGRhdGEgaGFzIGJlZW4gZW50ZXJlZCB5ZXQgaW4gdGhlIHJvdyAodHJ1ZS9mYWxzZSkuIFRoZSBkZWZhdWx0IHNldHRpbmcgaXMgYGZhbHNlYC5cblx0XHRcdCAqL1xuXHRcdFx0ZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YToge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU3BlY2lmaWVzIHRoZSBmdWxsIHBhdGggYW5kIGZ1bmN0aW9uIG5hbWUgb2YgYSBjdXN0b20gdmFsaWRhdGlvbiBmdW5jdGlvbi5cblx0XHRcdCAqL1xuXHRcdFx0Y3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFNwZWNpZmllcyB3aGV0aGVyIHRoZSB0YWJsZSBpcyBkaXNwbGF5ZWQgd2l0aCBjb25kZW5zZWQgbGF5b3V0ICh0cnVlL2ZhbHNlKS4gVGhlIGRlZmF1bHQgc2V0dGluZyBpcyBgZmFsc2VgLlxuXHRcdFx0ICovXG5cdFx0XHR1c2VDb25kZW5zZWRUYWJsZUxheW91dDoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU3BlY2lmaWVzIHRoZSBwb3NzaWJsZSBhY3Rpb25zIGF2YWlsYWJsZSBvbiB0aGUgdGFibGUgcm93IChOYXZpZ2F0aW9uLG51bGwpLiBUaGUgZGVmYXVsdCBzZXR0aW5nIGlzIGB1bmRlZmluZWRgXG5cdFx0XHQgKi9cblx0XHRcdHJvd0FjdGlvbjoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IHVuZGVmaW5lZFxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogU3BlY2lmaWVzIHRoZSBzZWxlY3Rpb24gbW9kZSAoTm9uZSxTaW5nbGUsTXVsdGksQXV0bylcblx0XHRcdCAqL1xuXHRcdFx0c2VsZWN0aW9uTW9kZToge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUaGUgYGJ1c3lgIG1vZGUgb2YgdGFibGVcblx0XHRcdCAqL1xuXHRcdFx0YnVzeToge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFBhcmFtZXRlciB1c2VkIHRvIHNob3cgdGhlIGZ1bGxTY3JlZW4gYnV0dG9uIG9uIHRoZSB0YWJsZS5cblx0XHRcdCAqL1xuXHRcdFx0ZW5hYmxlRnVsbFNjcmVlbjoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFNwZWNpZmllcyBoZWFkZXIgdGV4dCB0aGF0IGlzIHNob3duIGluIHRhYmxlLlxuXHRcdFx0ICovXG5cdFx0XHRoZWFkZXI6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIENvbnRyb2xzIGlmIHRoZSBoZWFkZXIgdGV4dCBzaG91bGQgYmUgc2hvd24gb3Igbm90XG5cdFx0XHQgKi9cblx0XHRcdGhlYWRlclZpc2libGU6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBEZWZpbmVzIHRoZSBcImFyaWEtbGV2ZWxcIiBvZiB0aGUgdGFibGUgaGVhZGVyXG5cdFx0XHQgKi9cblx0XHRcdGhlYWRlckxldmVsOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLnVpLmNvcmUuVGl0bGVMZXZlbFwiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IFwiQXV0b1wiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogUGFyYW1ldGVyIHdoaWNoIHNldHMgdGhlIG5vRGF0YVRleHQgZm9yIHRoZSBtZGMgdGFibGVcblx0XHRcdCAqL1xuXHRcdFx0bm9EYXRhVGV4dDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDcmVhdGlvbiBNb2RlIHRvIGJlIHBhc3NlZCB0byB0aGUgb25DcmVhdGUgaGFubGRlci4gVmFsdWVzOiBbXCJJbmxpbmVcIiwgXCJOZXdQYWdlXCJdXG5cdFx0XHQgKi9cblx0XHRcdGNyZWF0aW9uTW9kZToge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBTZXR0aW5nIHRvIGRldGVybWluZSBpZiB0aGUgbmV3IHJvdyBzaG91bGQgYmUgY3JlYXRlZCBhdCB0aGUgZW5kIG9yIGJlZ2lubmluZ1xuXHRcdFx0ICovXG5cdFx0XHRjcmVhdGVBdEVuZDoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIlxuXHRcdFx0fSxcblx0XHRcdGNyZWF0ZU91dGJvdW5kOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHRjcmVhdGVPdXRib3VuZERldGFpbDoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0Y3JlYXRlTmV3QWN0aW9uOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFBlcnNvbmFsaXphdGlvbiBNb2RlXG5cdFx0XHQgKi9cblx0XHRcdHBlcnNvbmFsaXphdGlvbjoge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ3xib29sZWFuXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0aXNTZWFyY2hhYmxlOiB7XG5cdFx0XHRcdHR5cGU6IFwiYm9vbGVhblwiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogQWxsb3dzIHRvIGNob29zZSB0aGUgVGFibGUgdHlwZS4gQWxsb3dlZCB2YWx1ZXMgYXJlIGBSZXNwb25zaXZlVGFibGVgIG9yIGBHcmlkVGFibGVgLlxuXHRcdFx0ICovXG5cdFx0XHR0eXBlOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0dGFibGVUeXBlOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEVuYWJsZSBleHBvcnQgdG8gZmlsZVxuXHRcdFx0ICovXG5cdFx0XHRlbmFibGVFeHBvcnQ6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFbmFibGUgZXhwb3J0IHRvIGZpbGVcblx0XHRcdCAqL1xuXHRcdFx0ZW5hYmxlUGFzdGU6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBPTkxZIEZPUiBHUklEIFRBQkxFOiBOdW1iZXIgb2YgaW5kaWNlcyB3aGljaCBjYW4gYmUgc2VsZWN0ZWQgaW4gYSByYW5nZS4gSWYgc2V0IHRvIDAsIHRoZSBzZWxlY3Rpb24gbGltaXQgaXMgZGlzYWJsZWQsIGFuZCB0aGUgU2VsZWN0IEFsbCBjaGVja2JveCBhcHBlYXJzIGluc3RlYWQgb2YgdGhlIERlc2VsZWN0IEFsbCBidXR0b24uXG5cdFx0XHQgKi9cblx0XHRcdHNlbGVjdGlvbkxpbWl0OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIE9OTFkgRk9SIFJFU1BPTlNJVkUgVEFCTEU6IFNldHRpbmcgdG8gZGVmaW5lIHRoZSBjaGVja2JveCBpbiB0aGUgY29sdW1uIGhlYWRlcjogQWxsb3dlZCB2YWx1ZXMgYXJlIGBEZWZhdWx0YCBvciBgQ2xlYXJBbGxgLiBJZiBzZXQgdG8gYERlZmF1bHRgLCB0aGUgc2FwLm0uVGFibGUgY29udHJvbCByZW5kZXJzIHRoZSBTZWxlY3QgQWxsIGNoZWNrYm94LCBvdGhlcndpc2UgdGhlIERlc2VsZWN0IEFsbCBidXR0b24gaXMgcmVuZGVyZWQuXG5cdFx0XHQgKi9cblx0XHRcdG11bHRpU2VsZWN0TW9kZToge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUaGUgY29udHJvbCBJRCBvZiB0aGUgRmlsdGVyQmFyIHRoYXQgaXMgdXNlZCB0byBmaWx0ZXIgdGhlIHJvd3Mgb2YgdGhlIHRhYmxlLlxuXHRcdFx0ICovXG5cdFx0XHRmaWx0ZXJCYXI6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIFRoZSBjb250cm9sIElEIG9mIHRoZSBGaWx0ZXJCYXIgdGhhdCBpcyB1c2VkIGludGVybmFsbHkgdG8gZmlsdGVyIHRoZSByb3dzIG9mIHRoZSB0YWJsZS5cblx0XHRcdCAqL1xuXHRcdFx0ZmlsdGVyQmFySWQ6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdHRhYmxlRGVsZWdhdGU6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdGVuYWJsZUF1dG9TY3JvbGw6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCJcblx0XHRcdH0sXG5cdFx0XHR2aXNpYmxlOiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCJcblx0XHRcdH0sXG5cdFx0XHRpc0FscDoge1xuXHRcdFx0XHR0eXBlOiBcImJvb2xlYW5cIixcblx0XHRcdFx0ZGVmYXVsdFZhbHVlOiBmYWxzZVxuXHRcdFx0fSxcblx0XHRcdHZhcmlhbnRNYW5hZ2VtZW50OiB7XG5cdFx0XHRcdHR5cGU6IFwic3RyaW5nXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0Y29sdW1uRWRpdE1vZGU6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIixcblx0XHRcdFx0Y29tcHV0ZWQ6IHRydWVcblx0XHRcdH0sXG5cdFx0XHR0YWJUaXRsZToge1xuXHRcdFx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdFx0XHRkZWZhdWx0VmFsdWU6IFwiXCJcblx0XHRcdH0sXG5cdFx0XHRlbmFibGVBdXRvQ29sdW1uV2lkdGg6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCJcblx0XHRcdH0sXG5cdFx0XHRkYXRhU3RhdGVJbmRpY2F0b3JGaWx0ZXI6IHtcblx0XHRcdFx0dHlwZTogXCJzdHJpbmdcIlxuXHRcdFx0fSxcblx0XHRcdGlzQ29tcGFjdFR5cGU6IHtcblx0XHRcdFx0dHlwZTogXCJib29sZWFuXCJcblx0XHRcdH1cblx0XHR9LFxuXHRcdGV2ZW50czoge1xuXHRcdFx0dmFyaWFudFNhdmVkOiB7XG5cdFx0XHRcdHR5cGU6IFwiZnVuY3Rpb25cIlxuXHRcdFx0fSxcblx0XHRcdHZhcmlhbnRTZWxlY3RlZDoge1xuXHRcdFx0XHR0eXBlOiBcImZ1bmN0aW9uXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEV2ZW50IGhhbmRsZXIgZm9yIGNoYW5nZSBldmVudFxuXHRcdFx0ICovXG5cdFx0XHRvbkNoYW5nZToge1xuXHRcdFx0XHR0eXBlOiBcImZ1bmN0aW9uXCJcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3Qgd2hlbiB0aGUgdXNlciBjaG9vc2VzIGEgcm93XG5cdFx0XHQgKi9cblx0XHRcdHJvd1ByZXNzOiB7XG5cdFx0XHRcdHR5cGU6IFwiZnVuY3Rpb25cIixcblx0XHRcdFx0aXNQdWJsaWM6IHRydWVcblx0XHRcdH0sXG5cdFx0XHQvKipcblx0XHRcdCAqIEV2ZW50IGhhbmRsZXIgdG8gcmVhY3QgdG8gdGhlIGNvbnRleHRDaGFuZ2UgZXZlbnQgb2YgdGhlIHRhYmxlLlxuXHRcdFx0ICovXG5cdFx0XHRvbkNvbnRleHRDaGFuZ2U6IHtcblx0XHRcdFx0dHlwZTogXCJmdW5jdGlvblwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFdmVudCBoYW5kbGVyIGNhbGxlZCB3aGVuIHRoZSB1c2VyIGNob29zZXMgYW4gb3B0aW9uIG9mIHRoZSBzZWdtZW50ZWQgYnV0dG9uIGluIHRoZSBBTFAgVmlld1xuXHRcdFx0ICovXG5cdFx0XHRvblNlZ21lbnRlZEJ1dHRvblByZXNzZWQ6IHtcblx0XHRcdFx0dHlwZTogXCJmdW5jdGlvblwiXG5cdFx0XHR9LFxuXHRcdFx0LyoqXG5cdFx0XHQgKiBFdmVudCBoYW5kbGVyIHRvIHJlYWN0IHRvIHRoZSBzdGF0ZUNoYW5nZSBldmVudCBvZiB0aGUgdGFibGUuXG5cdFx0XHQgKi9cblx0XHRcdHN0YXRlQ2hhbmdlOiB7XG5cdFx0XHRcdHR5cGU6IFwiZnVuY3Rpb25cIlxuXHRcdFx0fSxcblx0XHRcdC8qKlxuXHRcdFx0ICogRXZlbnQgaGFuZGxlciB0byByZWFjdCB3aGVuIHRoZSB0YWJsZSBzZWxlY3Rpb24gY2hhbmdlc1xuXHRcdFx0ICovXG5cdFx0XHRzZWxlY3Rpb25DaGFuZ2U6IHtcblx0XHRcdFx0dHlwZTogXCJmdW5jdGlvblwiLFxuXHRcdFx0XHRpc1B1YmxpYzogdHJ1ZVxuXHRcdFx0fVxuXHRcdH0sXG5cdFx0YWdncmVnYXRpb25zOiB7XG5cdFx0XHRhY3Rpb25zOiB7XG5cdFx0XHRcdHR5cGU6IFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC50YWJsZS5BY3Rpb24gfCBzYXAuZmUubWFjcm9zLmludGVybmFsLnRhYmxlLkFjdGlvbkdyb3VwXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9LFxuXHRcdFx0Y29sdW1uczoge1xuXHRcdFx0XHR0eXBlOiBcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwudGFibGUuQ29sdW1uXCIsXG5cdFx0XHRcdGlzUHVibGljOiB0cnVlXG5cdFx0XHR9XG5cdFx0fVxuXHR9LFxuXHRjcmVhdGU6IGZ1bmN0aW9uIChvUHJvcHM6IGFueSwgb0NvbnRyb2xDb25maWd1cmF0aW9uOiBhbnksIG1TZXR0aW5nczogYW55LCBvQWdncmVnYXRpb25zOiBhbnkpIHtcblx0XHRsZXQgb1RhYmxlRGVmaW5pdGlvbjtcblx0XHRjb25zdCBvQ29udGV4dE9iamVjdFBhdGggPSBnZXRJbnZvbHZlZERhdGFNb2RlbE9iamVjdHMob1Byb3BzLm1ldGFQYXRoLCBvUHJvcHMuY29udGV4dFBhdGgpO1xuXG5cdFx0aWYgKCFvUHJvcHMudGFibGVEZWZpbml0aW9uKSB7XG5cdFx0XHRjb25zdCBpbml0aWFsQ29udmVydGVyQ29udGV4dCA9IHRoaXMuZ2V0Q29udmVydGVyQ29udGV4dChvQ29udGV4dE9iamVjdFBhdGgsIG9Qcm9wcy5jb250ZXh0UGF0aCwgbVNldHRpbmdzKTtcblx0XHRcdGNvbnN0IHNWaXN1YWxpemF0aW9uUGF0aCA9IHRoaXMuX2dldFZpc3VhbGl6YXRpb25QYXRoKG9Db250ZXh0T2JqZWN0UGF0aCwgaW5pdGlhbENvbnZlcnRlckNvbnRleHQpO1xuXHRcdFx0Y29uc3Qgc1ByZXNlbnRhdGlvblBhdGggPSB0aGlzLl9nZXRQcmVzZW50YXRpb25QYXRoKG9Db250ZXh0T2JqZWN0UGF0aCk7XG5cblx0XHRcdC8vQ2hlY2sgaWYgd2UgaGF2ZSBBY3Rpb25Hcm91cCBhbmQgYWRkIG5lc3RlZCBhY3Rpb25zXG5cdFx0XHRjb25zdCBvRXh0cmFBY3Rpb25zID0gdGhpcy5fYnVpbGRBY3Rpb25zKG9BZ2dyZWdhdGlvbnMuYWN0aW9ucyk7XG5cblx0XHRcdGNvbnN0IG9FeHRyYUNvbHVtbnMgPSB0aGlzLnBhcnNlQWdncmVnYXRpb24ob0FnZ3JlZ2F0aW9ucy5jb2x1bW5zLCBmdW5jdGlvbiAoY2hpbGRDb2x1bW46IGFueSwgY29sdW1uQ2hpbGRJZHg6IG51bWJlcikge1xuXHRcdFx0XHRjb25zdCBjb2x1bW5LZXkgPSBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJrZXlcIikgfHwgXCJJbmxpbmVYTUxDb2x1bW5fXCIgKyBjb2x1bW5DaGlsZElkeDtcblx0XHRcdFx0b0FnZ3JlZ2F0aW9uc1tjb2x1bW5LZXldID0gY2hpbGRDb2x1bW47XG5cdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0Ly8gRGVmYXVsdHMgYXJlIHRvIGJlIGRlZmluZWQgaW4gVGFibGUudHNcblx0XHRcdFx0XHRrZXk6IGNvbHVtbktleSxcblx0XHRcdFx0XHR0eXBlOiBcIlNsb3RcIixcblx0XHRcdFx0XHR3aWR0aDogY2hpbGRDb2x1bW4uZ2V0QXR0cmlidXRlKFwid2lkdGhcIiksXG5cdFx0XHRcdFx0aW1wb3J0YW5jZTogY2hpbGRDb2x1bW4uZ2V0QXR0cmlidXRlKFwiaW1wb3J0YW5jZVwiKSxcblx0XHRcdFx0XHRob3Jpem9udGFsQWxpZ246IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcImhvcml6b250YWxBbGlnblwiKSxcblx0XHRcdFx0XHRhdmFpbGFiaWxpdHk6IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcImF2YWlsYWJpbGl0eVwiKSxcblx0XHRcdFx0XHRoZWFkZXI6IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcImhlYWRlclwiKSxcblx0XHRcdFx0XHR0ZW1wbGF0ZTogY2hpbGRDb2x1bW4uY2hpbGRyZW5bMF0/Lm91dGVySFRNTCB8fCBcIlwiLFxuXHRcdFx0XHRcdHByb3BlcnRpZXM6IGNoaWxkQ29sdW1uLmdldEF0dHJpYnV0ZShcInByb3BlcnRpZXNcIikgPyBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJwcm9wZXJ0aWVzXCIpLnNwbGl0KFwiLFwiKSA6IHVuZGVmaW5lZCxcblx0XHRcdFx0XHRwb3NpdGlvbjoge1xuXHRcdFx0XHRcdFx0cGxhY2VtZW50OiBjaGlsZENvbHVtbi5nZXRBdHRyaWJ1dGUoXCJwb3NpdGlvblBsYWNlbWVudFwiKSxcblx0XHRcdFx0XHRcdGFuY2hvcjogY2hpbGRDb2x1bW4uZ2V0QXR0cmlidXRlKFwicG9zaXRpb25BbmNob3JcIilcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH07XG5cdFx0XHR9KTtcblx0XHRcdGNvbnN0IG9FeHRyYVBhcmFtczogYW55ID0ge307XG5cdFx0XHRsZXQgbVRhYmxlU2V0dGluZ3MgPSB7XG5cdFx0XHRcdGVuYWJsZUV4cG9ydDogb1Byb3BzLmVuYWJsZUV4cG9ydCxcblx0XHRcdFx0ZW5hYmxlRnVsbFNjcmVlbjogb1Byb3BzLmVuYWJsZUZ1bGxTY3JlZW4sXG5cdFx0XHRcdGVuYWJsZVBhc3RlOiBvUHJvcHMuZW5hYmxlUGFzdGUsXG5cdFx0XHRcdHNlbGVjdGlvbk1vZGU6IG9Qcm9wcy5zZWxlY3Rpb25Nb2RlLFxuXHRcdFx0XHR0eXBlOiBvUHJvcHMudHlwZVxuXHRcdFx0fTtcblx0XHRcdC8vcmVtb3ZlcyB1bmRlZmluZWQgdmFsdWVzIGZyb20gbVRhYmxlU2V0dGluZ3Ncblx0XHRcdG1UYWJsZVNldHRpbmdzID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShtVGFibGVTZXR0aW5ncykpO1xuXG5cdFx0XHRvRXh0cmFQYXJhbXNbc1Zpc3VhbGl6YXRpb25QYXRoXSA9IHtcblx0XHRcdFx0YWN0aW9uczogb0V4dHJhQWN0aW9ucyxcblx0XHRcdFx0Y29sdW1uczogb0V4dHJhQ29sdW1ucyxcblx0XHRcdFx0dGFibGVTZXR0aW5nczogbVRhYmxlU2V0dGluZ3Ncblx0XHRcdH07XG5cdFx0XHRjb25zdCBvQ29udmVydGVyQ29udGV4dCA9IHRoaXMuZ2V0Q29udmVydGVyQ29udGV4dChvQ29udGV4dE9iamVjdFBhdGgsIG9Qcm9wcy5jb250ZXh0UGF0aCwgbVNldHRpbmdzLCBvRXh0cmFQYXJhbXMpO1xuXG5cdFx0XHRjb25zdCBvVmlzdWFsaXphdGlvbkRlZmluaXRpb24gPSBnZXREYXRhVmlzdWFsaXphdGlvbkNvbmZpZ3VyYXRpb24oXG5cdFx0XHRcdHNWaXN1YWxpemF0aW9uUGF0aCxcblx0XHRcdFx0b1Byb3BzLnVzZUNvbmRlbnNlZExheW91dCxcblx0XHRcdFx0b0NvbnZlcnRlckNvbnRleHQsXG5cdFx0XHRcdHVuZGVmaW5lZCxcblx0XHRcdFx0dW5kZWZpbmVkLFxuXHRcdFx0XHRzUHJlc2VudGF0aW9uUGF0aFxuXHRcdFx0KTtcblx0XHRcdG9UYWJsZURlZmluaXRpb24gPSBvVmlzdWFsaXphdGlvbkRlZmluaXRpb24udmlzdWFsaXphdGlvbnNbMF07XG5cblx0XHRcdG9Qcm9wcy50YWJsZURlZmluaXRpb24gPSB0aGlzLmNyZWF0ZUJpbmRpbmdDb250ZXh0KG9UYWJsZURlZmluaXRpb24sIG1TZXR0aW5ncyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdG9UYWJsZURlZmluaXRpb24gPSBvUHJvcHMudGFibGVEZWZpbml0aW9uLmdldE9iamVjdCgpO1xuXHRcdH1cblx0XHRvVGFibGVEZWZpbml0aW9uLnBhdGggPSBcIntfcGFnZU1vZGVsPlwiICsgb1Byb3BzLnRhYmxlRGVmaW5pdGlvbi5nZXRQYXRoKCkgKyBcIn1cIjtcblx0XHQvLyBwdWJsaWMgcHJvcGVydGllcyBwcm9jZXNzZWQgYnkgY29udmVydGVyIGNvbnRleHRcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwic2VsZWN0aW9uTW9kZVwiLCBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uc2VsZWN0aW9uTW9kZSwgdHJ1ZSk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImVuYWJsZUZ1bGxTY3JlZW5cIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLmVuYWJsZUZ1bGxTY3JlZW4sIHRydWUpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJlbmFibGVFeHBvcnRcIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLmVuYWJsZUV4cG9ydCwgdHJ1ZSk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImVuYWJsZVBhc3RlXCIsIG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMuYWN0aW9ucy5wYXN0ZS5lbmFibGVkLCB0cnVlKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwidXBkYXRhYmxlUHJvcGVydHlQYXRoXCIsIG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zdGFuZGFyZEFjdGlvbnMudXBkYXRhYmxlUHJvcGVydHlQYXRoLCB0cnVlKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwidHlwZVwiLCBvVGFibGVEZWZpbml0aW9uLmNvbnRyb2wudHlwZSwgdHJ1ZSk7XG5cblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwidXNlQ29uZGVuc2VkVGFibGVMYXlvdXRcIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLnVzZUNvbmRlbnNlZFRhYmxlTGF5b3V0KTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YVwiLCBvVGFibGVEZWZpbml0aW9uLmNvbnRyb2wuZGlzYWJsZUFkZFJvd0J1dHRvbkZvckVtcHR5RGF0YSk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImN1c3RvbVZhbGlkYXRpb25GdW5jdGlvblwiLCBvVGFibGVEZWZpbml0aW9uLmNvbnRyb2wuY3VzdG9tVmFsaWRhdGlvbkZ1bmN0aW9uKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiaGVhZGVyVmlzaWJsZVwiLCBvVGFibGVEZWZpbml0aW9uLmNvbnRyb2wuaGVhZGVyVmlzaWJsZSk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcInNlYXJjaGFibGVcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnNlYXJjaGFibGUpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJzaG93Um93Q291bnRcIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLnNob3dSb3dDb3VudCk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImlubGluZUNyZWF0aW9uUm93Q291bnRcIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLmlubGluZUNyZWF0aW9uUm93Q291bnQpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJoZWFkZXJcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnRpdGxlKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwic2VsZWN0aW9uTGltaXRcIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLnNlbGVjdGlvbkxpbWl0KTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiaXNDb21wYWN0VHlwZVwiLCBvVGFibGVEZWZpbml0aW9uLmNvbnRyb2wuaXNDb21wYWN0VHlwZSk7XG5cdFx0aWYgKG9Qcm9wcy5pZCkge1xuXHRcdFx0Ly8gVGhlIGdpdmVuIElEIHNoYWxsIGJlIGFzc2lnbmVkIHRvIHRoZSBUYWJsZUFQSSBhbmQgbm90IHRvIHRoZSBNREMgVGFibGVcblx0XHRcdG9Qcm9wcy5fYXBpSWQgPSBvUHJvcHMuaWQ7XG5cdFx0XHRvUHJvcHMuaWQgPSB0aGlzLmdldENvbnRlbnRJZChvUHJvcHMuaWQpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBXZSBnZW5lcmF0ZSB0aGUgSUQuIER1ZSB0byBjb21wYXRpYmlsaXR5IHJlYXNvbnMgd2Uga2VlcCBpdCBvbiB0aGUgTURDIFRhYmxlIGJ1dCBwcm92aWRlIGFzc2lnblxuXHRcdFx0Ly8gdGhlIElEIHdpdGggYSA6OlRhYmxlIHN1ZmZpeCB0byB0aGUgVGFibGVBUElcblx0XHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJpZFwiLCBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uaWQpO1xuXHRcdFx0b1Byb3BzLl9hcGlJZCA9IG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5pZCArIFwiOjpUYWJsZVwiO1xuXHRcdH1cblxuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJjcmVhdGlvbk1vZGVcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmNyZWF0ZS5tb2RlKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiY3JlYXRlQXRFbmRcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmNyZWF0ZS5hcHBlbmQpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJjcmVhdGVPdXRib3VuZFwiLCBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uY3JlYXRlLm91dGJvdW5kKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiY3JlYXRlTmV3QWN0aW9uXCIsIG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jcmVhdGUubmV3QWN0aW9uKTtcblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwiY3JlYXRlT3V0Ym91bmREZXRhaWxcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmNyZWF0ZS5vdXRib3VuZERldGFpbCk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcInBlcnNvbmFsaXphdGlvblwiLCBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24ucDEzbk1vZGUpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJ2YXJpYW50TWFuYWdlbWVudFwiLCBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24udmFyaWFudE1hbmFnZW1lbnQpO1xuXHRcdHRoaXMuc2V0RGVmYXVsdFZhbHVlKG9Qcm9wcywgXCJlbmFibGVBdXRvQ29sdW1uV2lkdGhcIiwgb1RhYmxlRGVmaW5pdGlvbi5jb250cm9sLmVuYWJsZUF1dG9Db2x1bW5XaWR0aCk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcImRhdGFTdGF0ZUluZGljYXRvckZpbHRlclwiLCBvVGFibGVEZWZpbml0aW9uLmNvbnRyb2wuZGF0YVN0YXRlSW5kaWNhdG9yRmlsdGVyKTtcblx0XHQvLyBTcGVjaWFsIGNvZGUgZm9yIHJlYWRPbmx5XG5cdFx0Ly8gcmVhZG9ubHkgPSBmYWxzZSAtPiBGb3JjZSBlZGl0YWJsZVxuXHRcdC8vIHJlYWRvbmx5ID0gdHJ1ZSAtPiBGb3JjZSBkaXNwbGF5IG1vZGVcblx0XHQvLyByZWFkb25seSA9IHVuZGVmaW5lZCAtPiBCb3VuZCB0byBlZGl0IGZsb3dcblxuXHRcdHN3aXRjaCAob1Byb3BzLnJlYWRPbmx5KSB7XG5cdFx0XHRjYXNlIFwiZmFsc2VcIjpcblx0XHRcdFx0b1Byb3BzLnJlYWRPbmx5ID0gZmFsc2U7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInRydWVcIjpcblx0XHRcdFx0b1Byb3BzLnJlYWRPbmx5ID0gdHJ1ZTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdH1cblxuXHRcdGlmIChvUHJvcHMucmVhZE9ubHkgPT09IHVuZGVmaW5lZCAmJiBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uZGlzcGxheU1vZGUgPT09IHRydWUpIHtcblx0XHRcdG9Qcm9wcy5yZWFkT25seSA9IHRydWU7XG5cdFx0fVxuXG5cdFx0aWYgKG9Qcm9wcy5yb3dQcmVzcykge1xuXHRcdFx0b1Byb3BzLnJvd0FjdGlvbiA9IFwiTmF2aWdhdGlvblwiO1xuXHRcdH1cblx0XHR0aGlzLnNldERlZmF1bHRWYWx1ZShvUHJvcHMsIFwicm93UHJlc3NcIiwgb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnJvdy5wcmVzcyk7XG5cdFx0dGhpcy5zZXREZWZhdWx0VmFsdWUob1Byb3BzLCBcInJvd0FjdGlvblwiLCBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24ucm93LmFjdGlvbik7XG5cblx0XHRpZiAob1Byb3BzLnBlcnNvbmFsaXphdGlvbiA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHRvUHJvcHMucGVyc29uYWxpemF0aW9uID0gdW5kZWZpbmVkO1xuXHRcdH0gZWxzZSBpZiAob1Byb3BzLnBlcnNvbmFsaXphdGlvbiA9PT0gXCJ0cnVlXCIpIHtcblx0XHRcdG9Qcm9wcy5wZXJzb25hbGl6YXRpb24gPSBcIlNvcnQsQ29sdW1uLEZpbHRlclwiO1xuXHRcdH1cblxuXHRcdHN3aXRjaCAob1Byb3BzLnBlcnNvbmFsaXphdGlvbikge1xuXHRcdFx0Y2FzZSBcImZhbHNlXCI6XG5cdFx0XHRcdG9Qcm9wcy5wZXJzb25hbGl6YXRpb24gPSB1bmRlZmluZWQ7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBcInRydWVcIjpcblx0XHRcdFx0b1Byb3BzLnBlcnNvbmFsaXphdGlvbiA9IFwiU29ydCxDb2x1bW4sRmlsdGVyXCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0ZGVmYXVsdDpcblx0XHR9XG5cblx0XHRpZiAob1Byb3BzLmlzU2VhcmNoYWJsZSA9PT0gXCJmYWxzZVwiKSB7XG5cdFx0XHRvUHJvcHMuc2VhcmNoYWJsZSA9IGZhbHNlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRvUHJvcHMuc2VhcmNoYWJsZSA9IG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5zZWFyY2hhYmxlO1xuXHRcdH1cblxuXHRcdGxldCB1c2VCYXNpY1NlYXJjaCA9IGZhbHNlO1xuXG5cdFx0Ly8gTm90ZSBmb3IgdGhlICdmaWx0ZXJCYXInIHByb3BlcnR5OlxuXHRcdC8vIDEuIElEIHJlbGF0aXZlIHRvIHRoZSB2aWV3IG9mIHRoZSBUYWJsZS5cblx0XHQvLyAyLiBBYnNvbHV0ZSBJRC5cblx0XHQvLyAzLiBJRCB3b3VsZCBiZSBjb25zaWRlcmVkIGluIGFzc29jaWF0aW9uIHRvIFRhYmxlQVBJJ3MgSUQuXG5cdFx0aWYgKCFvUHJvcHMuZmlsdGVyQmFyICYmICFvUHJvcHMuZmlsdGVyQmFySWQgJiYgb1Byb3BzLnNlYXJjaGFibGUpIHtcblx0XHRcdC8vIGZpbHRlckJhcjogUHVibGljIHByb3BlcnR5IGZvciBidWlsZGluZyBibG9ja3Ncblx0XHRcdC8vIGZpbHRlckJhcklkOiBPbmx5IHVzZWQgYXMgSW50ZXJuYWwgcHJpdmF0ZSBwcm9wZXJ0eSBmb3IgRkUgdGVtcGxhdGVzXG5cdFx0XHRvUHJvcHMuZmlsdGVyQmFySWQgPSBnZW5lcmF0ZShbb1Byb3BzLmlkLCBcIlN0YW5kYXJkQWN0aW9uXCIsIFwiQmFzaWNTZWFyY2hcIl0pO1xuXHRcdFx0dXNlQmFzaWNTZWFyY2ggPSB0cnVlO1xuXHRcdH1cblx0XHQvLyBJbnRlcm5hbCBwcm9wZXJ0aWVzXG5cdFx0b1Byb3BzLnVzZUJhc2ljU2VhcmNoID0gdXNlQmFzaWNTZWFyY2g7XG5cdFx0b1Byb3BzLnRhYmxlVHlwZSA9IG9Qcm9wcy50eXBlO1xuXHRcdG9Qcm9wcy5zaG93Q3JlYXRlID0gb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLnN0YW5kYXJkQWN0aW9ucy5hY3Rpb25zLmNyZWF0ZS52aXNpYmxlIHx8IHRydWU7XG5cdFx0b1Byb3BzLmF1dG9CaW5kT25Jbml0ID0gb1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmF1dG9CaW5kT25Jbml0O1xuXG5cdFx0Ly8gSW50ZXJuYWwgdGhhdCBJIHdhbnQgdG8gcmVtb3ZlIGluIHRoZSBlbmRcblx0XHRvUHJvcHMubmF2aWdhdGlvblBhdGggPSBvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24ubmF2aWdhdGlvblBhdGg7IC8vIG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jb2xsZWN0aW9uOyAvL0RhdGFNb2RlbFBhdGhIZWxwZXIuZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChvQ29udGV4dE9iamVjdFBhdGgpOyAvL1xuXHRcdGlmIChvVGFibGVEZWZpbml0aW9uLmFubm90YXRpb24uY29sbGVjdGlvbi5zdGFydHNXaXRoKFwiL1wiKSAmJiBvQ29udGV4dE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQuX3R5cGUgPT09IFwiU2luZ2xldG9uXCIpIHtcblx0XHRcdG9UYWJsZURlZmluaXRpb24uYW5ub3RhdGlvbi5jb2xsZWN0aW9uID0gb1Byb3BzLm5hdmlnYXRpb25QYXRoO1xuXHRcdH1cblx0XHRvUHJvcHMucGFyZW50RW50aXR5U2V0ID0gbVNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXG5cdFx0XHRcIi9cIiArXG5cdFx0XHRcdChvQ29udGV4dE9iamVjdFBhdGguY29udGV4dExvY2F0aW9uIS50YXJnZXRFbnRpdHlTZXRcblx0XHRcdFx0XHQ/IG9Db250ZXh0T2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24hLnRhcmdldEVudGl0eVNldC5uYW1lXG5cdFx0XHRcdFx0OiBvQ29udGV4dE9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQubmFtZSlcblx0XHQpO1xuXHRcdG9Qcm9wcy5jb2xsZWN0aW9uID0gbVNldHRpbmdzLm1vZGVscy5tZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQob1RhYmxlRGVmaW5pdGlvbi5hbm5vdGF0aW9uLmNvbGxlY3Rpb24pO1xuXG5cdFx0c3dpdGNoIChvUHJvcHMucmVhZE9ubHkpIHtcblx0XHRcdGNhc2UgdHJ1ZTpcblx0XHRcdFx0b1Byb3BzLmNvbHVtbkVkaXRNb2RlID0gXCJEaXNwbGF5XCI7XG5cdFx0XHRcdGJyZWFrO1xuXHRcdFx0Y2FzZSBmYWxzZTpcblx0XHRcdFx0b1Byb3BzLmNvbHVtbkVkaXRNb2RlID0gXCJFZGl0YWJsZVwiO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdG9Qcm9wcy5jb2x1bW5FZGl0TW9kZSA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdFx0Ly8gUmVnYXJkaW5nIHRoZSByZW1haW5pbmcgb25lcyB0aGF0IEkgdGhpbmsgd2UgY291bGQgcmV2aWV3XG5cdFx0Ly8gc2VsZWN0ZWRDb250ZXh0c01vZGVsIC0+IHBvdGVudGlhbGx5IGhhcmRjb2RlZCBvciBpbnRlcm5hbCBvbmx5XG5cdFx0Ly8gb25Db250ZXh0Q2hhbmdlIC0+IEF1dG9zY3JvbGwgLi4uIG1pZ2h0IG5lZWQgcmV2aXNpb25cblx0XHQvLyBvbkNoYW5nZSAtPiBKdXN0IHByb3hpZWQgZG93biB0byB0aGUgRmllbGQgbWF5IG5lZWQgdG8gc2VlIGlmIG5lZWRlZCBvciBub3Rcblx0XHQvLyB2YXJpYW50U2VsZWN0ZWQgLyB2YXJpYW50U2F2ZWQgLT4gVmFyaWFudCBNYW5hZ2VtZW50IHN0YW5kYXJkIGhlbHBlcnMgP1xuXHRcdC8vIHRhYmxlRGVsZWdhdGUgIC0+IHVzZWQgZXh0ZXJuYWxseSBmb3IgQUxQIC4uLiBtaWdodCBuZWVkIHRvIHNlZSBpZiByZWxldmFudCBzdGlsbFxuXHRcdC8vIG9uU2VnbWVudGVkQnV0dG9uUHJlc3NlZCAtPiBBTFAgc3BlY2lmaWMsIHNob3VsZCBiZSBhIGRlZGljYXRlZCBjb250cm9sIGZvciB0aGUgY29udGVudFZpZXdTd2l0Y2hlclxuXHRcdC8vIHZpc2libGUgLT4gcmVsYXRlZCB0byB0aGlzIEFMUCBjb250ZW50Vmlld1N3aXRjaGVyLi4uIG1heWJlIGFuIG91dGVyIGNvbnRyb2wgd291bGQgbWFrZSBtb3JlIHNlbnNlID9cblxuXHRcdG9Qcm9wcy5oZWFkZXJCaW5kaW5nRXhwcmVzc2lvbiA9IGJ1aWxkRXhwcmVzc2lvbkZvckhlYWRlclZpc2libGUob1Byb3BzKTtcblx0XHRyZXR1cm4gb1Byb3BzO1xuXHR9LFxuXHQvKipcblx0ICogQnVpbGQgYWN0aW9ucyBhbmQgYWN0aW9uIGdyb3VwcyBmb3IgdGFibGUgdmlzdWFsaXNhdGlvbi5cblx0ICpcblx0ICogQHBhcmFtIG9BY3Rpb25zIFhNTCBub2RlIGNvcnJlc3BvbmRpbmcgdG8gYWN0aW9uc1xuXHQgKiBAcmV0dXJucyBQcmVwYXJlZCBhY3Rpb25zXG5cdCAqL1xuXHRfYnVpbGRBY3Rpb25zOiBmdW5jdGlvbiAob0FjdGlvbnM6IGFueSkge1xuXHRcdGNvbnN0IG9FeHRyYUFjdGlvbnM6IGFueSA9IHt9O1xuXHRcdGlmIChvQWN0aW9ucyAmJiBvQWN0aW9ucy5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG5cdFx0XHRjb25zdCBhY3Rpb25zID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KG9BY3Rpb25zLmNoaWxkcmVuKTtcblx0XHRcdGxldCBhY3Rpb25JZHggPSAwO1xuXHRcdFx0YWN0aW9ucy5mb3JFYWNoKGZ1bmN0aW9uIChhY3QpIHtcblx0XHRcdFx0YWN0aW9uSWR4Kys7XG5cdFx0XHRcdGxldCBtZW51QWN0aW9uczogYW55W10gPSBbXTtcblx0XHRcdFx0aWYgKGFjdC5jaGlsZHJlbi5sZW5ndGggJiYgYWN0LmxvY2FsTmFtZSA9PT0gXCJBY3Rpb25Hcm91cFwiICYmIGFjdC5uYW1lc3BhY2VVUkkgPT09IFwic2FwLmZlLm1hY3Jvc1wiKSB7XG5cdFx0XHRcdFx0Y29uc3QgYWN0aW9uc1RvQWRkID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmFwcGx5KGFjdC5jaGlsZHJlbik7XG5cdFx0XHRcdFx0YWN0aW9uc1RvQWRkLmZvckVhY2goZnVuY3Rpb24gKGFjdFRvQWRkKSB7XG5cdFx0XHRcdFx0XHRjb25zdCBhY3Rpb25LZXlBZGQgPSBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJrZXlcIikgfHwgXCJJbmxpbmVYTUxBY3Rpb25fXCIgKyBhY3Rpb25JZHg7XG5cdFx0XHRcdFx0XHRjb25zdCBjdXJPdXRPYmplY3QgPSB7XG5cdFx0XHRcdFx0XHRcdGtleTogYWN0aW9uS2V5QWRkLFxuXHRcdFx0XHRcdFx0XHR0ZXh0OiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJ0ZXh0XCIpLFxuXHRcdFx0XHRcdFx0XHRfX25vV3JhcDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0cHJlc3M6IGFjdFRvQWRkLmdldEF0dHJpYnV0ZShcInByZXNzXCIpLFxuXHRcdFx0XHRcdFx0XHRyZXF1aXJlc1NlbGVjdGlvbjogYWN0VG9BZGQuZ2V0QXR0cmlidXRlKFwicmVxdWlyZXNTZWxlY3Rpb25cIikgPT09IFwidHJ1ZVwiLFxuXHRcdFx0XHRcdFx0XHRlbmFibGVkOiBhY3RUb0FkZC5nZXRBdHRyaWJ1dGUoXCJlbmFibGVkXCIpID09PSBudWxsID8gdHJ1ZSA6IGFjdFRvQWRkLmdldEF0dHJpYnV0ZShcImVuYWJsZWRcIilcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRvRXh0cmFBY3Rpb25zW2N1ck91dE9iamVjdC5rZXldID0gY3VyT3V0T2JqZWN0O1xuXHRcdFx0XHRcdFx0YWN0aW9uSWR4Kys7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0bWVudUFjdGlvbnMgPSBPYmplY3QudmFsdWVzKG9FeHRyYUFjdGlvbnMpXG5cdFx0XHRcdFx0XHQuc2xpY2UoLWFjdC5jaGlsZHJlbi5sZW5ndGgpXG5cdFx0XHRcdFx0XHQubWFwKGZ1bmN0aW9uIChtZW51SXRlbTogYW55KSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBtZW51SXRlbS5rZXk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjb25zdCBhY3Rpb25LZXkgPSBhY3QuZ2V0QXR0cmlidXRlKFwia2V5XCIpIHx8IFwiSW5saW5lWE1MQWN0aW9uX1wiICsgYWN0aW9uSWR4O1xuXHRcdFx0XHRjb25zdCBhY3RPYmplY3QgPSB7XG5cdFx0XHRcdFx0a2V5OiBhY3Rpb25LZXksXG5cdFx0XHRcdFx0dGV4dDogYWN0LmdldEF0dHJpYnV0ZShcInRleHRcIiksXG5cdFx0XHRcdFx0cG9zaXRpb246IHtcblx0XHRcdFx0XHRcdHBsYWNlbWVudDogYWN0LmdldEF0dHJpYnV0ZShcInBsYWNlbWVudFwiKSxcblx0XHRcdFx0XHRcdGFuY2hvcjogYWN0LmdldEF0dHJpYnV0ZShcImFuY2hvclwiKVxuXHRcdFx0XHRcdH0sXG5cdFx0XHRcdFx0X19ub1dyYXA6IHRydWUsXG5cdFx0XHRcdFx0cHJlc3M6IGFjdC5nZXRBdHRyaWJ1dGUoXCJwcmVzc1wiKSxcblx0XHRcdFx0XHRyZXF1aXJlc1NlbGVjdGlvbjogYWN0LmdldEF0dHJpYnV0ZShcInJlcXVpcmVzU2VsZWN0aW9uXCIpID09PSBcInRydWVcIixcblx0XHRcdFx0XHRlbmFibGVkOiBhY3QuZ2V0QXR0cmlidXRlKFwiZW5hYmxlZFwiKSA9PT0gbnVsbCA/IHRydWUgOiBhY3QuZ2V0QXR0cmlidXRlKFwiZW5hYmxlZFwiKSxcblx0XHRcdFx0XHRtZW51OiBtZW51QWN0aW9ucy5sZW5ndGggPyBtZW51QWN0aW9ucyA6IG51bGxcblx0XHRcdFx0fTtcblx0XHRcdFx0b0V4dHJhQWN0aW9uc1thY3RPYmplY3Qua2V5XSA9IGFjdE9iamVjdDtcblx0XHRcdH0pO1xuXHRcdH1cblx0XHRyZXR1cm4gb0V4dHJhQWN0aW9ucztcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyB0aGUgYW5ub3RhdGlvbiBwYXRoIHBvaW50aW5nIHRvIHRoZSB2aXN1YWxpemF0aW9uIGFubm90YXRpb24gKExpbmVJdGVtKS5cblx0ICpcblx0ICogQHBhcmFtIGNvbnRleHRPYmplY3RQYXRoIFRoZSBkYXRhbW9kZWwgb2JqZWN0IHBhdGggZm9yIHRoZSB0YWJsZVxuXHQgKiBAcGFyYW0gY29udmVydGVyQ29udGV4dCBUaGUgY29udmVydGVyIGNvbnRleHRcblx0ICogQHJldHVybnMgVGhlIGFubm90YXRpb24gcGF0aFxuXHQgKi9cblx0X2dldFZpc3VhbGl6YXRpb25QYXRoOiBmdW5jdGlvbiAoY29udGV4dE9iamVjdFBhdGg6IERhdGFNb2RlbE9iamVjdFBhdGgsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBzdHJpbmcge1xuXHRcdGNvbnN0IG1ldGFQYXRoID0gZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChjb250ZXh0T2JqZWN0UGF0aCkgYXMgc3RyaW5nO1xuXHRcdGlmIChjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybSA9PT0gVUlBbm5vdGF0aW9uVGVybXMuTGluZUl0ZW0pIHtcblx0XHRcdHJldHVybiBtZXRhUGF0aDsgLy8gTWV0YVBhdGggaXMgYWxyZWFkeSBwb2ludGluZyB0byBhIExpbmVJdGVtXG5cdFx0fVxuXHRcdC8vTmVlZCB0byBzd2l0Y2ggdG8gdGhlIGNvbnRleHQgcmVsYXRlZCB0aGUgUFYgb3IgU1BWXG5cdFx0Y29uc3QgcmVzb2x2ZWRUYXJnZXQgPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGVBbm5vdGF0aW9uKG1ldGFQYXRoKTtcblxuXHRcdGxldCB2aXN1YWxpemF0aW9uczogVmlzdWFsaXphdGlvbkFuZFBhdGhbXSA9IFtdO1xuXHRcdHN3aXRjaCAoY29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnRlcm0pIHtcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudDpcblx0XHRcdFx0aWYgKGNvbnRleHRPYmplY3RQYXRoLnRhcmdldE9iamVjdC5QcmVzZW50YXRpb25WYXJpYW50KSB7XG5cdFx0XHRcdFx0dmlzdWFsaXphdGlvbnMgPSBnZXRWaXN1YWxpemF0aW9uc0Zyb21QcmVzZW50YXRpb25WYXJpYW50KFxuXHRcdFx0XHRcdFx0Y29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LlByZXNlbnRhdGlvblZhcmlhbnQsXG5cdFx0XHRcdFx0XHRtZXRhUGF0aCxcblx0XHRcdFx0XHRcdHJlc29sdmVkVGFyZ2V0LmNvbnZlcnRlckNvbnRleHRcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdGJyZWFrO1xuXG5cdFx0XHRjYXNlIFVJQW5ub3RhdGlvblRlcm1zLlByZXNlbnRhdGlvblZhcmlhbnQ6XG5cdFx0XHRcdHZpc3VhbGl6YXRpb25zID0gZ2V0VmlzdWFsaXphdGlvbnNGcm9tUHJlc2VudGF0aW9uVmFyaWFudChcblx0XHRcdFx0XHRjb250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QsXG5cdFx0XHRcdFx0bWV0YVBhdGgsXG5cdFx0XHRcdFx0cmVzb2x2ZWRUYXJnZXQuY29udmVydGVyQ29udGV4dFxuXHRcdFx0XHQpO1xuXHRcdFx0XHRicmVhaztcblxuXHRcdFx0ZGVmYXVsdDpcblx0XHRcdFx0TG9nLmVycm9yKGBCYWQgbWV0YXBhdGggcGFyYW1ldGVyIGZvciB0YWJsZSA6ICR7Y29udGV4dE9iamVjdFBhdGgudGFyZ2V0T2JqZWN0LnRlcm19YCk7XG5cdFx0fVxuXG5cdFx0Y29uc3QgbGluZUl0ZW1WaXogPSB2aXN1YWxpemF0aW9ucy5maW5kKCh2aXopID0+IHtcblx0XHRcdHJldHVybiB2aXoudmlzdWFsaXphdGlvbi50ZXJtID09PSBVSUFubm90YXRpb25UZXJtcy5MaW5lSXRlbTtcblx0XHR9KTtcblxuXHRcdGlmIChsaW5lSXRlbVZpeikge1xuXHRcdFx0cmV0dXJuIGxpbmVJdGVtVml6LmFubm90YXRpb25QYXRoO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gbWV0YVBhdGg7IC8vIEZhbGxiYWNrXG5cdFx0fVxuXHR9LFxuXG5cdF9nZXRQcmVzZW50YXRpb25QYXRoOiBmdW5jdGlvbiAob0NvbnRleHRPYmplY3RQYXRoOiBhbnkpIHtcblx0XHRsZXQgcHJlc2VudGF0aW9uUGF0aDtcblx0XHRzd2l0Y2ggKG9Db250ZXh0T2JqZWN0UGF0aC50YXJnZXRPYmplY3QudGVybSkge1xuXHRcdFx0Y2FzZSBVSUFubm90YXRpb25UZXJtcy5QcmVzZW50YXRpb25WYXJpYW50OlxuXHRcdFx0XHRwcmVzZW50YXRpb25QYXRoID0gZ2V0Q29udGV4dFJlbGF0aXZlVGFyZ2V0T2JqZWN0UGF0aChvQ29udGV4dE9iamVjdFBhdGgpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgVUlBbm5vdGF0aW9uVGVybXMuU2VsZWN0aW9uUHJlc2VudGF0aW9uVmFyaWFudDpcblx0XHRcdFx0cHJlc2VudGF0aW9uUGF0aCA9IGdldENvbnRleHRSZWxhdGl2ZVRhcmdldE9iamVjdFBhdGgob0NvbnRleHRPYmplY3RQYXRoKSArIFwiL1ByZXNlbnRhdGlvblZhcmlhbnRcIjtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRwcmVzZW50YXRpb25QYXRoID0gbnVsbDtcblx0XHR9XG5cdFx0cmV0dXJuIHByZXNlbnRhdGlvblBhdGg7XG5cdH1cbn0pO1xuZXhwb3J0IGRlZmF1bHQgVGFibGU7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7RUFlQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUNBLElBQU1BLEtBQUssR0FBR0MsYUFBYSxDQUFDQyxNQUFNLENBQUMsMkJBQTJCLEVBQUU7SUFDL0Q7QUFDRDtBQUNBO0lBQ0NDLElBQUksRUFBRSxPQUFPO0lBQ2I7QUFDRDtBQUNBO0lBQ0NDLFNBQVMsRUFBRSx3QkFBd0I7SUFDbkNDLGVBQWUsRUFBRSxlQUFlO0lBQ2hDO0FBQ0Q7QUFDQTtJQUNDQyxRQUFRLEVBQUUsMkJBQTJCO0lBQ3JDO0FBQ0Q7QUFDQTtJQUNDQyxRQUFRLEVBQUU7TUFDVDtBQUNGO0FBQ0E7TUFDRUMsVUFBVSxFQUFFLFVBQVU7TUFDdEI7QUFDRjtBQUNBO01BQ0VDLFVBQVUsRUFBRTtRQUNYQyxlQUFlLEVBQUU7VUFDaEJDLElBQUksRUFBRTtRQUNQLENBQUM7UUFDREMsUUFB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