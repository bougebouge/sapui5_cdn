/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/CommonUtils", "sap/fe/macros/internal/valuehelp/ValueListHelper", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "sap/ui/core/XMLTemplateProcessor", "sap/ui/Device", "sap/ui/dom/units/Rem", "sap/ui/mdc/valuehelp/content/Conditions", "sap/ui/mdc/valuehelp/content/MDCTable", "sap/ui/mdc/valuehelp/content/MTable", "sap/ui/model/json/JSONModel"], function (Log, CommonUtils, ValueListHelperCommon, Fragment, XMLPreprocessor, XMLTemplateProcessor, Device, Rem, Conditions, MDCTable, MTable, JSONModel) {
  "use strict";

  var system = Device.system;
  var Level = Log.Level;
  function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function () {}; return { s: F, n: function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function (e) { throw e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function () { it = it.call(o); }, n: function () { var step = it.next(); normalCompletion = step.done; return step; }, e: function (e) { didErr = true; err = e; }, f: function () { try { if (!normalCompletion && it.return != null) it.return(); } finally { if (didErr) throw err; } } }; }
  function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }
  function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
  function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }
  function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter); }
  function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }
  function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }
  function _catch(body, recover) {
    try {
      var result = body();
    } catch (e) {
      return recover(e);
    }
    if (result && result.then) {
      return result.then(void 0, recover);
    }
    return result;
  }
  //was in helpers.d.ts:
  //declare module "sap/ui/dom/units/Rem" {
  //	function fromPx(vPx: string | float): float;
  //}

  var AnnotationLabel = "@com.sap.vocabularies.Common.v1.Label",
    AnnotationText = "@com.sap.vocabularies.Common.v1.Text",
    AnnotationTextUITextArrangement = "@com.sap.vocabularies.Common.v1.Text@com.sap.vocabularies.UI.v1.TextArrangement",
    AnnotationValueListParameterIn = "com.sap.vocabularies.Common.v1.ValueListParameterIn",
    AnnotationValueListParameterConstant = "com.sap.vocabularies.Common.v1.ValueListParameterConstant",
    AnnotationValueListParameterOut = "com.sap.vocabularies.Common.v1.ValueListParameterOut",
    AnnotationValueListParameterInOut = "com.sap.vocabularies.Common.v1.ValueListParameterInOut",
    AnnotationValueListWithFixedValues = "@com.sap.vocabularies.Common.v1.ValueListWithFixedValues";
  var ValueListHelper = {
    entityIsSearchable: function (propertyAnnotations, collectionAnnotations) {
      var _propertyAnnotations$, _collectionAnnotation;
      var searchSupported = (_propertyAnnotations$ = propertyAnnotations["@com.sap.vocabularies.Common.v1.ValueList"]) === null || _propertyAnnotations$ === void 0 ? void 0 : _propertyAnnotations$.SearchSupported,
        searchable = (_collectionAnnotation = collectionAnnotations["@Org.OData.Capabilities.V1.SearchRestrictions"]) === null || _collectionAnnotation === void 0 ? void 0 : _collectionAnnotation.Searchable;
      if (searchable === undefined && searchSupported === false || searchable === true && searchSupported === false || searchable === false) {
        return false;
      }
      return true;
    },
    /**
     * Returns the condition path required for the condition model.
     * For e.g. <1:N-PropertyName>*\/<1:1-PropertyName>/<PropertyName>.
     *
     * @param metaModel The metamodel instance
     * @param entitySet The entity set path
     * @param propertyPath The property path
     * @returns The formatted condition path
     * @private
     */
    _getConditionPath: function (metaModel, entitySet, propertyPath) {
      // (see also: sap/fe/core/converters/controls/ListReport/FilterBar.ts)
      var parts = propertyPath.split("/");
      var conditionPath = "",
        partialPath;
      while (parts.length) {
        var part = parts.shift();
        partialPath = partialPath ? "".concat(partialPath, "/").concat(part) : part;
        var property = metaModel.getObject("".concat(entitySet, "/").concat(partialPath));
        if (property && property.$kind === "NavigationProperty" && property.$isCollection) {
          part += "*";
        }
        conditionPath = conditionPath ? "".concat(conditionPath, "/").concat(part) : part;
      }
      return conditionPath;
    },
    /**
     * Returns array of column definitions corresponding to properties defined as Selection Fields on the CollectionPath entity set in a ValueHelp.
     *
     * @param metaModel The metamodel instance
     * @param entitySet The entity set path
     * @returns Array of column definitions
     * @private
     */
    _getColumnDefinitionFromSelectionFields: function (metaModel, entitySet) {
      var columnDefs = [],
        //selectionFields = metaModel.getObject(entitySet + "/@com.sap.vocabularies.UI.v1.SelectionFields") as SelectionField[] | undefined;
        entityTypeAnnotations = metaModel.getObject("".concat(entitySet, "/@")),
        selectionFields = entityTypeAnnotations["@com.sap.vocabularies.UI.v1.SelectionFields"];
      if (selectionFields) {
        selectionFields.forEach(function (selectionField) {
          var selectionFieldPath = "".concat(entitySet, "/").concat(selectionField.$PropertyPath),
            conditionPath = ValueListHelper._getConditionPath(metaModel, entitySet, selectionField.$PropertyPath),
            propertyAnnotations = metaModel.getObject("".concat(selectionFieldPath, "@")),
            columnDef = {
              path: conditionPath,
              label: propertyAnnotations[AnnotationLabel] || selectionFieldPath,
              sortable: true,
              filterable: CommonUtils.isPropertyFilterable(metaModel, entitySet, selectionField.$PropertyPath, false),
              $Type: metaModel.getObject(selectionFieldPath).$Type
            };
          columnDefs.push(columnDef);
        });
      }
      return columnDefs;
    },
    _mergeColumnDefinitionsFromProperties: function (columnDefs, valueListInfo, valueListProperty, property, propertyAnnotations) {
      var _propertyAnnotations$2;
      var columnPath = valueListProperty,
        columnPropertyType = property.$Type;
      var label = propertyAnnotations[AnnotationLabel] || columnPath,
        textAnnotation = propertyAnnotations[AnnotationText];
      if (textAnnotation && ((_propertyAnnotations$2 = propertyAnnotations[AnnotationTextUITextArrangement]) === null || _propertyAnnotations$2 === void 0 ? void 0 : _propertyAnnotations$2.$EnumMember) === "com.sap.vocabularies.UI.v1.TextArrangementType/TextOnly") {
        // the column property is the one coming from the text annotation
        columnPath = textAnnotation.$Path;
        var textPropertyPath = "/".concat(valueListInfo.CollectionPath, "/").concat(columnPath);
        columnPropertyType = valueListInfo.$model.getMetaModel().getObject(textPropertyPath).$Type;
      }
      var columnNotAlreadyDefined = columnDefs.findIndex(function (col) {
        return col.path === columnPath;
      }) === -1;
      if (columnNotAlreadyDefined) {
        var columnDef = {
          path: columnPath,
          label: label,
          sortable: true,
          filterable: !propertyAnnotations["@com.sap.vocabularies.UI.v1.HiddenFilter"],
          $Type: columnPropertyType
        };
        columnDefs.push(columnDef);
      }
    },
    filterInOutParameters: function (vhParameters, typeFilter) {
      return vhParameters.filter(function (parameter) {
        return typeFilter.indexOf(parameter.parmeterType) > -1;
      });
    },
    getInParameters: function (vhParameters) {
      return ValueListHelper.filterInOutParameters(vhParameters, [AnnotationValueListParameterIn, AnnotationValueListParameterConstant, AnnotationValueListParameterInOut]);
    },
    getOutParameters: function (vhParameters) {
      return ValueListHelper.filterInOutParameters(vhParameters, [AnnotationValueListParameterOut, AnnotationValueListParameterInOut]);
    },
    createVHUIModel: function (valueHelp, propertyPath, metaModel) {
      // setting the _VHUI model evaluated in the ValueListTable fragment
      var vhUIModel = new JSONModel({}),
        propertyAnnotations = metaModel.getObject("".concat(propertyPath, "@"));
      valueHelp.setModel(vhUIModel, "_VHUI");
      // Identifies the "ContextDependent-Scenario"
      vhUIModel.setProperty("/hasValueListRelevantQualifiers", !!propertyAnnotations["@com.sap.vocabularies.Common.v1.ValueListRelevantQualifiers"]);
      return vhUIModel;
    },
    destroyVHContent: function (valueHelp) {
      if (valueHelp.getDialog()) {
        valueHelp.getDialog().destroyContent();
      }
      if (valueHelp.getTypeahead()) {
        valueHelp.getTypeahead().destroyContent();
      }
    },
    putDefaultQualifierFirst: function (qualifiers) {
      var indexDefaultVH = qualifiers.indexOf("");

      // default ValueHelp without qualifier should be the first
      if (indexDefaultVH > 0) {
        qualifiers.unshift(qualifiers[indexDefaultVH]);
        qualifiers.splice(indexDefaultVH + 1, 1);
      }
      return qualifiers;
    },
    getValueListInfo: function (valueHelp, propertyPath, payload) {
      try {
        var _this2 = this;
        var bindingContext = valueHelp.getBindingContext(),
          conditionModel = payload.conditionModel,
          vhMetaModel = valueHelp.getModel().getMetaModel(),
          valueListInfos = [];
        var _temp2 = _catch(function () {
          return Promise.resolve(vhMetaModel.requestValueListInfo(propertyPath, true, bindingContext)).then(function (_vhMetaModel$requestV) {
            var valueListByQualifier = _vhMetaModel$requestV;
            var valueHelpQualifiers = _this2.putDefaultQualifierFirst(Object.keys(valueListByQualifier)),
              propertyName = propertyPath.split("/").pop();
            var contextPrefix = "";
            if (payload.useMultiValueField && bindingContext && bindingContext.getPath()) {
              var aBindigContextParts = bindingContext.getPath().split("/");
              var aPropertyBindingParts = propertyPath.split("/");
              if (aPropertyBindingParts.length - aBindigContextParts.length > 1) {
                var aContextPrefixParts = [];
                for (var i = aBindigContextParts.length; i < aPropertyBindingParts.length - 1; i++) {
                  aContextPrefixParts.push(aPropertyBindingParts[i]);
                }
                contextPrefix = "".concat(aContextPrefixParts.join("/"), "/");
              }
            }
            valueHelpQualifiers.forEach(function (valueHelpQualifier) {
              var _metaModel$getObject;
              // Add column definitions for properties defined as Selection fields on the CollectionPath entity set.
              var annotationValueListType = valueListByQualifier[valueHelpQualifier],
                metaModel = annotationValueListType.$model.getMetaModel(),
                entitySetPath = "/".concat(annotationValueListType.CollectionPath),
                columnDefs = ValueListHelper._getColumnDefinitionFromSelectionFields(metaModel, entitySetPath),
                vhParameters = [],
                vhKeys = (_metaModel$getObject = metaModel.getObject(entitySetPath + "/")) !== null && _metaModel$getObject !== void 0 && _metaModel$getObject.$Key ? _toConsumableArray(metaModel.getObject(entitySetPath + "/").$Key) : [];
              var fieldPropertyPath = "",
                descriptionPath = "",
                key = "";
              annotationValueListType.Parameters.forEach(function (parameter) {
                //All String fields are allowed for filter
                var propertyPath2 = "/".concat(annotationValueListType.CollectionPath, "/").concat(parameter.ValueListProperty),
                  property = metaModel.getObject(propertyPath2),
                  propertyAnnotations = metaModel.getObject("".concat(propertyPath2, "@")) || {};

                // If property is undefined, then the property coming for the entry isn't defined in
                // the metamodel, therefore we don't need to add it in the in/out parameters
                if (property) {
                  // Search for the *out Parameter mapped to the local property
                  if (!key && (parameter.$Type === AnnotationValueListParameterOut || parameter.$Type === AnnotationValueListParameterInOut) && parameter.LocalDataProperty.$PropertyPath === propertyName) {
                    var _propertyAnnotations$3;
                    fieldPropertyPath = propertyPath2;
                    key = parameter.ValueListProperty;

                    //Only the text annotation of the key can specify the description
                    descriptionPath = ((_propertyAnnotations$3 = propertyAnnotations[AnnotationText]) === null || _propertyAnnotations$3 === void 0 ? void 0 : _propertyAnnotations$3.$Path) || "";
                  }
                  var valueListProperty = parameter.ValueListProperty;
                  ValueListHelper._mergeColumnDefinitionsFromProperties(columnDefs, annotationValueListType, valueListProperty, property, propertyAnnotations);
                }

                //In and InOut
                if ((parameter.$Type === AnnotationValueListParameterIn || parameter.$Type === AnnotationValueListParameterInOut || parameter.$Type === AnnotationValueListParameterOut) && parameter.LocalDataProperty.$PropertyPath !== propertyName) {
                  var valuePath = "";
                  if (conditionModel && conditionModel.length > 0) {
                    if (valueHelp.getParent().isA("sap.ui.mdc.Table") && valueHelp.getBindingContext() && (parameter.$Type === AnnotationValueListParameterIn || parameter.$Type === AnnotationValueListParameterInOut)) {
                      // Special handling for value help used in filter dialog
                      var parts = parameter.LocalDataProperty.$PropertyPath.split("/");
                      if (parts.length > 1) {
                        var firstNavigationProperty = parts[0];
                        var oBoundEntity = vhMetaModel.getMetaContext(bindingContext.getPath());
                        var sPathOfTable = valueHelp.getParent().getRowBinding().getPath(); //TODO
                        if (oBoundEntity.getObject("".concat(sPathOfTable, "/$Partner")) === firstNavigationProperty) {
                          // Using the condition model doesn't make any sense in case an in-parameter uses a navigation property
                          // referring to the partner. Therefore reducing the path and using the FVH context instead of the condition model
                          valuePath = parameter.LocalDataProperty.$PropertyPath.replace(firstNavigationProperty + "/", "");
                        }
                      }
                    }
                    if (!valuePath) {
                      valuePath = conditionModel + ">/conditions/" + parameter.LocalDataProperty.$PropertyPath;
                    }
                  } else {
                    valuePath = contextPrefix + parameter.LocalDataProperty.$PropertyPath;
                  }
                  vhParameters.push({
                    parmeterType: parameter.$Type,
                    source: valuePath,
                    helpPath: parameter.ValueListProperty,
                    constantValue: parameter.Constant,
                    initialValueFilterEmpty: parameter.InitialValueIsSignificant
                  });
                }

                //Constant as InParamter for filtering
                if (parameter.$Type === AnnotationValueListParameterConstant) {
                  vhParameters.push({
                    parmeterType: parameter.$Type,
                    source: parameter.ValueListProperty,
                    helpPath: parameter.ValueListProperty,
                    constantValue: parameter.Constant,
                    initialValueFilterEmpty: parameter.InitialValueIsSignificant
                  });
                }
                // Enrich keys with out-parameters
                if ((parameter.$Type === AnnotationValueListParameterInOut || parameter.$Type === AnnotationValueListParameterOut) && !vhKeys.includes(parameter.ValueListProperty)) {
                  vhKeys.push(parameter.ValueListProperty);
                }
              });
              /* Ensure that vhKeys are part of the columnDefs, otherwise it is not considered in $select (BCP 2270141154) */
              var _iterator = _createForOfIteratorHelper(vhKeys),
                _step;
              try {
                var _loop = function () {
                  var vhKey = _step.value;
                  if (columnDefs.findIndex(function (column) {
                    return column.path === vhKey;
                  }) === -1) {
                    var columnDef = {
                      path: vhKey,
                      $Type: metaModel.getObject("/".concat(annotationValueListType.CollectionPath, "/").concat(key)).$Type,
                      label: "",
                      sortable: false,
                      filterable: undefined
                    };
                    columnDefs.push(columnDef);
                  }
                };
                for (_iterator.s(); !(_step = _iterator.n()).done;) {
                  _loop();
                }
              } catch (err) {
                _iterator.e(err);
              } finally {
                _iterator.f();
              }
              var valueListInfo = {
                keyValue: key,
                descriptionValue: descriptionPath,
                fieldPropertyPath: fieldPropertyPath,
                vhKeys: vhKeys,
                vhParameters: vhParameters,
                valueListInfo: annotationValueListType,
                columnDefs: columnDefs,
                valueHelpQualifier: valueHelpQualifier
              };
              valueListInfos.push(valueListInfo);
            });
          });
        }, function (err) {
          var errStatus = err.status,
            msg = errStatus && errStatus === 404 ? "Metadata not found (".concat(errStatus, ") for value help of property ").concat(propertyPath) : err.message;
          Log.error(msg);
          ValueListHelper.destroyVHContent(valueHelp);
        });
        return Promise.resolve(_temp2 && _temp2.then ? _temp2.then(function () {
          return valueListInfos;
        }) : valueListInfos);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    ALLFRAGMENTS: undefined,
    logFragment: undefined,
    _logTemplatedFragments: function (propertyPath, fragmentName, fragmentDefinition) {
      var logInfo = {
        path: propertyPath,
        fragmentName: fragmentName,
        fragment: fragmentDefinition
      };
      if (Log.getLevel() === Level.DEBUG) {
        //In debug mode we log all generated fragments
        ValueListHelper.ALLFRAGMENTS = ValueListHelper.ALLFRAGMENTS || [];
        ValueListHelper.ALLFRAGMENTS.push(logInfo);
      }
      if (ValueListHelper.logFragment) {
        //One Tool Subscriber allowed
        setTimeout(function () {
          ValueListHelper.logFragment(logInfo);
        }, 0);
      }
    },
    _templateFragment: function (fragmentName, valueListInfo, sourceModel, propertyPath, additionalViewData) {
      try {
        var mValueListInfo = valueListInfo.valueListInfo,
          valueListModel = new JSONModel(mValueListInfo),
          valueListServiceMetaModel = mValueListInfo.$model.getMetaModel(),
          viewData = new JSONModel(Object.assign({
            converterType: "ListReport",
            columns: valueListInfo.columnDefs || null
          }, additionalViewData));
        return Promise.resolve(Promise.resolve(XMLPreprocessor.process(XMLTemplateProcessor.loadTemplate(fragmentName, "fragment"), {
          name: fragmentName
        }, {
          bindingContexts: {
            valueList: valueListModel.createBindingContext("/"),
            contextPath: valueListServiceMetaModel.createBindingContext("/".concat(mValueListInfo.CollectionPath, "/")),
            source: sourceModel.createBindingContext("/")
          },
          models: {
            valueList: valueListModel,
            contextPath: valueListServiceMetaModel,
            source: sourceModel,
            metaModel: valueListServiceMetaModel,
            viewData: viewData
          }
        }))).then(function (fragmentDefinition) {
          ValueListHelper._logTemplatedFragments(propertyPath, fragmentName, fragmentDefinition);
          return Promise.resolve(Fragment.load({
            definition: fragmentDefinition
          }));
        });
      } catch (e) {
        return Promise.reject(e);
      }
    },
    _getContentId: function (valueHelpId, valueHelpQualifier, isTypeahead) {
      var contentType = isTypeahead ? "Popover" : "Dialog";
      return "".concat(valueHelpId, "::").concat(contentType, "::qualifier::").concat(valueHelpQualifier);
    },
    _addInOutParametersToPayload: function (payload, valueListInfo) {
      var valueHelpQualifier = valueListInfo.valueHelpQualifier;
      if (!payload.qualifiers) {
        payload.qualifiers = {};
      }
      if (!payload.qualifiers[valueHelpQualifier]) {
        payload.qualifiers[valueHelpQualifier] = {
          vhKeys: valueListInfo.vhKeys,
          vhParameters: valueListInfo.vhParameters
        };
      }
    },
    _getValueHelpColumnDisplayFormat: function (propertyAnnotations, isValueHelpWithFixedValues) {
      var displayMode = CommonUtils.computeDisplayMode(propertyAnnotations, undefined),
        textAnnotation = propertyAnnotations && propertyAnnotations[AnnotationText],
        textArrangementAnnotation = textAnnotation && propertyAnnotations[AnnotationTextUITextArrangement];
      if (isValueHelpWithFixedValues) {
        return textAnnotation && typeof textAnnotation !== "string" && textAnnotation.$Path ? displayMode : "Value";
      } else {
        // Only explicit defined TextArrangements in a Value Help with Dialog are considered
        return textArrangementAnnotation ? displayMode : "Value";
      }
    },
    _getWidthInRem: function (control, isUnitValueHelp) {
      var width = control.$().width(); // JQuery
      if (isUnitValueHelp && width) {
        width = 0.3 * width;
      }
      var floatWidth = width ? parseFloat(String(Rem.fromPx(width))) : 0;
      return isNaN(floatWidth) ? 0 : floatWidth;
    },
    getTableWidth: function (table, minWidth) {
      var width;
      var columns = table.getColumns(),
        visibleColumns = columns && columns.filter(function (column) {
          return column && column.getVisible && column.getVisible();
        }) || [],
        sumWidth = visibleColumns.reduce(function (sum, column) {
          width = column.getWidth();
          if (width && width.endsWith("px")) {
            width = String(Rem.fromPx(width));
          }
          var floatWidth = parseFloat(width);
          return sum + (isNaN(floatWidth) ? 9 : floatWidth);
        }, visibleColumns.length);
      return "".concat(Math.max(sumWidth, minWidth), "em");
    },
    createValueHelpTypeahead: function (propertyPath, valueHelp, content, valueListInfo, payload) {
      var contentId = content.getId(),
        propertyAnnotations = valueHelp.getModel().getMetaModel().getObject("".concat(propertyPath, "@")),
        valueHelpWithFixedValues = propertyAnnotations[AnnotationValueListWithFixedValues] || false,
        isDialogTable = false,
        columnInfo = ValueListHelperCommon.getColumnVisibilityInfo(valueListInfo.valueListInfo, propertyPath, valueHelpWithFixedValues, isDialogTable),
        sourceModel = new JSONModel({
          id: contentId,
          groupId: payload.requestGroupId || undefined,
          bSuggestion: true,
          propertyPath: propertyPath,
          columnInfo: columnInfo,
          valueHelpWithFixedValues: valueHelpWithFixedValues
        });
      content.setKeyPath(valueListInfo.keyValue);
      content.setDescriptionPath(valueListInfo.descriptionValue);
      payload.isValueListWithFixedValues = valueHelpWithFixedValues;
      var collectionAnnotations = valueListInfo.valueListInfo.$model.getMetaModel().getObject("/".concat(valueListInfo.valueListInfo.CollectionPath, "@")) || {};
      content.setFilterFields(ValueListHelper.entityIsSearchable(propertyAnnotations, collectionAnnotations) ? "$search" : "");
      var tableOrPromise = content.getTable() || ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListTable", valueListInfo, sourceModel, propertyPath);
      return Promise.all([tableOrPromise]).then(function (controls) {
        var table = controls[0];
        table.setModel(valueListInfo.valueListInfo.$model);
        Log.info("Value List- suggest Table XML content created [".concat(propertyPath, "]"), table.getMetadata().getName(), "MDC Templating");
        content.setTable(table);
        var field = valueHelp.getControl();
        if (field && (field.isA("sap.ui.mdc.FilterField") || field.isA("sap.ui.mdc.Field") || field.isA("sap.ui.mdc.MultiValueField"))) {
          //Can the filterfield be something else that we need the .isA() check?
          var reduceWidthForUnitValueHelp = Boolean(payload.isUnitValueHelp);
          var tableWidth = ValueListHelper.getTableWidth(table, ValueListHelper._getWidthInRem(field, reduceWidthForUnitValueHelp));
          table.setWidth(tableWidth);
          if (valueHelpWithFixedValues) {
            table.setMode(field.getMaxConditions() === 1 ? "SingleSelectMaster" : "MultiSelect");
          } else {
            table.setMode("SingleSelectMaster");
          }
        }
      });
    },
    createValueHelpDialog: function (propertyPath, valueHelp, content, valueListInfo, payload) {
      var propertyAnnotations = valueHelp.getModel().getMetaModel().getObject("".concat(propertyPath, "@")),
        isDropDownListe = false,
        isDialogTable = true,
        columnInfo = ValueListHelperCommon.getColumnVisibilityInfo(valueListInfo.valueListInfo, propertyPath, isDropDownListe, isDialogTable),
        sourceModel = new JSONModel({
          id: content.getId(),
          groupId: payload.requestGroupId || undefined,
          bSuggestion: false,
          columnInfo: columnInfo,
          valueHelpWithFixedValues: isDropDownListe
        });
      content.setKeyPath(valueListInfo.keyValue);
      content.setDescriptionPath(valueListInfo.descriptionValue);
      var collectionAnnotations = valueListInfo.valueListInfo.$model.getMetaModel().getObject("/".concat(valueListInfo.valueListInfo.CollectionPath, "@")) || {};
      content.setFilterFields(ValueListHelper.entityIsSearchable(propertyAnnotations, collectionAnnotations) ? "$search" : "");
      var tableOrPromise = content.getTable() || ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListDialogTable", valueListInfo, sourceModel, propertyPath, {
        enableAutoColumnWidth: !system.phone
      });
      var filterBarOrPromise = content.getFilterBar() || ValueListHelper._templateFragment("sap.fe.macros.internal.valuehelp.ValueListFilterBar", valueListInfo, sourceModel, propertyPath);
      return Promise.all([tableOrPromise, filterBarOrPromise]).then(function (controls) {
        var table = controls[0],
          filterBar = controls[1];
        table.setModel(valueListInfo.valueListInfo.$model);
        filterBar.setModel(valueListInfo.valueListInfo.$model);
        content.setFilterBar(filterBar);
        content.setTable(table);
        table.setFilter(filterBar.getId());
        table.initialized();
        var field = valueHelp.getControl();
        if (field) {
          table.setSelectionMode(field.getMaxConditions() === 1 ? "Single" : "Multi");
        }
        table.setWidth("100%");

        //This is a temporary workarround - provided by MDC (see FIORITECHP1-24002)
        var mdcTable = table;
        mdcTable._setShowP13nButton(false);
      });
    },
    _getContentById: function (contentList, contentId) {
      return contentList.find(function (item) {
        return item.getId() === contentId;
      });
    },
    _createPopoverContent: function (contentId, caseSensitive) {
      return new MTable({
        id: contentId,
        group: "group1",
        caseSensitive: caseSensitive
      }); //as $MTableSettings
    },

    _createDialogContent: function (contentId, caseSensitive, forceBind) {
      return new MDCTable({
        id: contentId,
        group: "group1",
        caseSensitive: caseSensitive,
        forceBind: forceBind
      }); //as $MDCTableSettings
    },

    showValueList: function (payload, container, selectedContentId) {
      var valueHelp = container.getParent(),
        isTypeahead = container.isTypeahead(),
        propertyPath = payload.propertyPath,
        metaModel = valueHelp.getModel().getMetaModel(),
        vhUIModel = valueHelp.getModel("_VHUI") || ValueListHelper.createVHUIModel(valueHelp, propertyPath, metaModel),
        showConditionPanel = valueHelp.data("showConditionPanel") && valueHelp.data("showConditionPanel") !== "false";
      if (!payload.qualifiers) {
        payload.qualifiers = {};
      }
      vhUIModel.setProperty("/isSuggestion", isTypeahead);
      vhUIModel.setProperty("/minScreenWidth", !isTypeahead ? "418px" : undefined);
      return ValueListHelper.getValueListInfo(valueHelp, propertyPath, payload).then(function (valueListInfos) {
        var caseSensitive = valueHelp.getTypeahead().getContent()[0].getCaseSensitive(); // take caseSensitive from first Typeahead content
        var contentList = container.getContent();
        if (isTypeahead) {
          var qualifierForTypeahead = valueHelp.data("valuelistForValidation") || ""; // can also be null
          if (qualifierForTypeahead === " ") {
            qualifierForTypeahead = "";
          }
          var valueListInfo = qualifierForTypeahead ? valueListInfos.filter(function (subValueListInfo) {
            return subValueListInfo.valueHelpQualifier === qualifierForTypeahead;
          })[0] : valueListInfos[0];
          ValueListHelper._addInOutParametersToPayload(payload, valueListInfo);
          var contentId = ValueListHelper._getContentId(valueHelp.getId(), valueListInfo.valueHelpQualifier, isTypeahead);
          var content = ValueListHelper._getContentById(contentList, contentId);
          if (!content) {
            content = ValueListHelper._createPopoverContent(contentId, caseSensitive);
            container.insertContent(content, 0); // insert content as first content
            contentList = container.getContent();
          } else if (contentId !== contentList[0].getId()) {
            // content already available but not as first content?
            container.removeContent(content);
            container.insertContent(content, 0); // move content to first position
            contentList = container.getContent();
          }
          payload.valueHelpQualifier = valueListInfo.valueHelpQualifier;
          content.setTitle(valueListInfo.valueListInfo.Label);
          return ValueListHelper.createValueHelpTypeahead(propertyPath, valueHelp, content, valueListInfo, payload);
        } else {
          // Dialog

          // set all contents to invisible
          for (var i = 0; i < contentList.length; i += 1) {
            contentList[i].setVisible(false);
          }
          if (showConditionPanel) {
            var conditionsContent = contentList.length && contentList[contentList.length - 1].getMetadata().getName() === "sap.ui.mdc.valuehelp.content.Conditions" ? contentList[contentList.length - 1] : undefined;
            if (conditionsContent) {
              conditionsContent.setVisible(true);
            } else {
              conditionsContent = new Conditions();
              container.addContent(conditionsContent);
              contentList = container.getContent();
            }
          }
          var selectedInfo, selectedContent;

          // Create or reuse contents for the current context
          for (var _i = 0; _i < valueListInfos.length; _i += 1) {
            var _valueListInfo = valueListInfos[_i],
              valueHelpQualifier = _valueListInfo.valueHelpQualifier;
            ValueListHelper._addInOutParametersToPayload(payload, _valueListInfo);
            var _contentId = ValueListHelper._getContentId(valueHelp.getId(), valueHelpQualifier, isTypeahead);
            var _content = ValueListHelper._getContentById(contentList, _contentId);
            if (!_content) {
              var forceBind = _valueListInfo.valueListInfo.FetchValues == 2 ? false : true;
              _content = ValueListHelper._createDialogContent(_contentId, caseSensitive, forceBind);
              if (!showConditionPanel) {
                container.addContent(_content);
              } else {
                container.insertContent(_content, contentList.length - 1); // insert content before conditions content
              }

              contentList = container.getContent();
            } else {
              _content.setVisible(true);
            }
            _content.setTitle(_valueListInfo.valueListInfo.Label);
            if (!selectedContent || selectedContentId && selectedContentId === _contentId) {
              selectedContent = _content;
              selectedInfo = _valueListInfo;
            }
          }
          if (!selectedInfo || !selectedContent) {
            throw new Error("selectedInfo or selectedContent undefined");
          }
          payload.valueHelpQualifier = selectedInfo.valueHelpQualifier;
          container.setTitle(selectedInfo.valueListInfo.Label);
          return ValueListHelper.createValueHelpDialog(propertyPath, valueHelp, selectedContent, selectedInfo, payload);
        }
      }).catch(function (err) {
        var errStatus = err.status,
          msg = errStatus && errStatus === 404 ? "Metadata not found (".concat(errStatus, ") for value help of property ").concat(propertyPath) : err.message;
        Log.error(msg);
        ValueListHelper.destroyVHContent(valueHelp);
      });
    }
  };
  return ValueListHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiQW5ub3RhdGlvbkxhYmVsIiwiQW5ub3RhdGlvblRleHQiLCJBbm5vdGF0aW9uVGV4dFVJVGV4dEFycmFuZ2VtZW50IiwiQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckluIiwiQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckNvbnN0YW50IiwiQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlck91dCIsIkFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJJbk91dCIsIkFubm90YXRpb25WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMiLCJWYWx1ZUxpc3RIZWxwZXIiLCJlbnRpdHlJc1NlYXJjaGFibGUiLCJwcm9wZXJ0eUFubm90YXRpb25zIiwiY29sbGVjdGlvbkFubm90YXRpb25zIiwic2VhcmNoU3VwcG9ydGVkIiwiU2VhcmNoU3VwcG9ydGVkIiwic2VhcmNoYWJsZSIsIlNlYXJjaGFibGUiLCJ1bmRlZmluZWQiLCJfZ2V0Q29uZGl0aW9uUGF0aCIsIm1ldGFNb2RlbCIsImVudGl0eVNldCIsInByb3BlcnR5UGF0aCIsInBhcnRzIiwic3BsaXQiLCJjb25kaXRpb25QYXRoIiwicGFydGlhbFBhdGgiLCJsZW5ndGgiLCJwYXJ0Iiwic2hpZnQiLCJwcm9wZXJ0eSIsImdldE9iamVjdCIsIiRraW5kIiwiJGlzQ29sbGVjdGlvbiIsIl9nZXRDb2x1bW5EZWZpbml0aW9uRnJvbVNlbGVjdGlvbkZpZWxkcyIsImNvbHVtbkRlZnMiLCJlbnRpdHlUeXBlQW5ub3RhdGlvbnMiLCJzZWxlY3Rpb25GaWVsZHMiLCJmb3JFYWNoIiwic2VsZWN0aW9uRmllbGQiLCJzZWxlY3Rpb25GaWVsZFBhdGgiLCIkUHJvcGVydHlQYXRoIiwiY29sdW1uRGVmIiwicGF0aCIsImxhYmVsIiwic29ydGFibGUiLCJmaWx0ZXJhYmxlIiwiQ29tbW9uVXRpbHMiLCJpc1Byb3BlcnR5RmlsdGVyYWJsZSIsIiRUeXBlIiwicHVzaCIsIl9tZXJnZUNvbHVtbkRlZmluaXRpb25zRnJvbVByb3BlcnRpZXMiLCJ2YWx1ZUxpc3RJbmZvIiwidmFsdWVMaXN0UHJvcGVydHkiLCJjb2x1bW5QYXRoIiwiY29sdW1uUHJvcGVydHlUeXBlIiwidGV4dEFubm90YXRpb24iLCIkRW51bU1lbWJlciIsIiRQYXRoIiwidGV4dFByb3BlcnR5UGF0aCIsIkNvbGxlY3Rpb25QYXRoIiwiJG1vZGVsIiwiZ2V0TWV0YU1vZGVsIiwiY29sdW1uTm90QWxyZWFkeURlZmluZWQiLCJmaW5kSW5kZXgiLCJjb2wiLCJmaWx0ZXJJbk91dFBhcmFtZXRlcnMiLCJ2aFBhcmFtZXRlcnMiLCJ0eXBlRmlsdGVyIiwiZmlsdGVyIiwicGFyYW1ldGVyIiwiaW5kZXhPZiIsInBhcm1ldGVyVHlwZSIsImdldEluUGFyYW1ldGVycyIsImdldE91dFBhcmFtZXRlcnMiLCJjcmVhdGVWSFVJTW9kZWwiLCJ2YWx1ZUhlbHAiLCJ2aFVJTW9kZWwiLCJKU09OTW9kZWwiLCJzZXRNb2RlbCIsInNldFByb3BlcnR5IiwiZGVzdHJveVZIQ29udGVudCIsImdldERpYWxvZyIsImRlc3Ryb3lDb250ZW50IiwiZ2V0VHlwZWFoZWFkIiwicHV0RGVmYXVsdFF1YWxpZmllckZpcnN0IiwicXVhbGlmaWVycyIsImluZGV4RGVmYXVsdFZIIiwidW5zaGlmdCIsInNwbGljZSIsImdldFZhbHVlTGlzdEluZm8iLCJwYXlsb2FkIiwiYmluZGluZ0NvbnRleHQiLCJnZXRCaW5kaW5nQ29udGV4dCIsImNvbmRpdGlvbk1vZGVsIiwidmhNZXRhTW9kZWwiLCJnZXRNb2RlbCIsInZhbHVlTGlzdEluZm9zIiwicmVxdWVzdFZhbHVlTGlzdEluZm8iLCJ2YWx1ZUxpc3RCeVF1YWxpZmllciIsInZhbHVlSGVscFF1YWxpZmllcnMiLCJPYmplY3QiLCJrZXlzIiwicHJvcGVydHlOYW1lIiwicG9wIiwiY29udGV4dFByZWZpeCIsInVzZU11bHRpVmFsdWVGaWVsZCIsImdldFBhdGgiLCJhQmluZGlnQ29udGV4dFBhcnRzIiwiYVByb3BlcnR5QmluZGluZ1BhcnRzIiwiYUNvbnRleHRQcmVmaXhQYXJ0cyIsImkiLCJqb2luIiwidmFsdWVIZWxwUXVhbGlmaWVyIiwiYW5ub3RhdGlvblZhbHVlTGlzdFR5cGUiLCJlbnRpdHlTZXRQYXRoIiwidmhLZXlzIiwiJEtleSIsImZpZWxkUHJvcGVydHlQYXRoIiwiZGVzY3JpcHRpb25QYXRoIiwia2V5IiwiUGFyYW1ldGVycyIsInByb3BlcnR5UGF0aDIiLCJWYWx1ZUxpc3RQcm9wZXJ0eSIsIkxvY2FsRGF0YVByb3BlcnR5IiwidmFsdWVQYXRoIiwiZ2V0UGFyZW50IiwiaXNBIiwiZmlyc3ROYXZpZ2F0aW9uUHJvcGVydHkiLCJvQm91bmRFbnRpdHkiLCJnZXRNZXRhQ29udGV4dCIsInNQYXRoT2ZUYWJsZSIsImdldFJvd0JpbmRpbmciLCJyZXBsYWNlIiwic291cmNlIiwiaGVscFBhdGgiLCJjb25zdGFudFZhbHVlIiwiQ29uc3RhbnQiLCJpbml0aWFsVmFsdWVGaWx0ZXJFbXB0eSIsIkluaXRpYWxWYWx1ZUlzU2lnbmlmaWNhbnQiLCJpbmNsdWRlcyIsInZoS2V5IiwiY29sdW1uIiwia2V5VmFsdWUiLCJkZXNjcmlwdGlvblZhbHVlIiwiZXJyIiwiZXJyU3RhdHVzIiwic3RhdHVzIiwibXNnIiwibWVzc2FnZSIsIkxvZyIsImVycm9yIiwiQUxMRlJBR01FTlRTIiwibG9nRnJhZ21lbnQiLCJfbG9nVGVtcGxhdGVkRnJhZ21lbnRzIiwiZnJhZ21lbnROYW1lIiwiZnJhZ21lbnREZWZpbml0aW9uIiwibG9nSW5mbyIsImZyYWdtZW50IiwiZ2V0TGV2ZWwiLCJMZXZlbCIsIkRFQlVHIiwic2V0VGltZW91dCIsIl90ZW1wbGF0ZUZyYWdtZW50Iiwic291cmNlTW9kZWwiLCJhZGRpdGlvbmFsVmlld0RhdGEiLCJtVmFsdWVMaXN0SW5mbyIsInZhbHVlTGlzdE1vZGVsIiwidmFsdWVMaXN0U2VydmljZU1ldGFNb2RlbCIsInZpZXdEYXRhIiwiYXNzaWduIiwiY29udmVydGVyVHlwZSIsImNvbHVtbnMiLCJQcm9taXNlIiwicmVzb2x2ZSIsIlhNTFByZXByb2Nlc3NvciIsInByb2Nlc3MiLCJYTUxUZW1wbGF0ZVByb2Nlc3NvciIsImxvYWRUZW1wbGF0ZSIsIm5hbWUiLCJiaW5kaW5nQ29udGV4dHMiLCJ2YWx1ZUxpc3QiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImNvbnRleHRQYXRoIiwibW9kZWxzIiwiRnJhZ21lbnQiLCJsb2FkIiwiZGVmaW5pdGlvbiIsIl9nZXRDb250ZW50SWQiLCJ2YWx1ZUhlbHBJZCIsImlzVHlwZWFoZWFkIiwiY29udGVudFR5cGUiLCJfYWRkSW5PdXRQYXJhbWV0ZXJzVG9QYXlsb2FkIiwiX2dldFZhbHVlSGVscENvbHVtbkRpc3BsYXlGb3JtYXQiLCJpc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcyIsImRpc3BsYXlNb2RlIiwiY29tcHV0ZURpc3BsYXlNb2RlIiwidGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiIsIl9nZXRXaWR0aEluUmVtIiwiY29udHJvbCIsImlzVW5pdFZhbHVlSGVscCIsIndpZHRoIiwiJCIsImZsb2F0V2lkdGgiLCJwYXJzZUZsb2F0IiwiU3RyaW5nIiwiUmVtIiwiZnJvbVB4IiwiaXNOYU4iLCJnZXRUYWJsZVdpZHRoIiwidGFibGUiLCJtaW5XaWR0aCIsImdldENvbHVtbnMiLCJ2aXNpYmxlQ29sdW1ucyIsImdldFZpc2libGUiLCJzdW1XaWR0aCIsInJlZHVjZSIsInN1bSIsImdldFdpZHRoIiwiZW5kc1dpdGgiLCJNYXRoIiwibWF4IiwiY3JlYXRlVmFsdWVIZWxwVHlwZWFoZWFkIiwiY29udGVudCIsImNvbnRlbnRJZCIsImdldElkIiwidmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzIiwiaXNEaWFsb2dUYWJsZSIsImNvbHVtbkluZm8iLCJWYWx1ZUxpc3RIZWxwZXJDb21tb24iLCJnZXRDb2x1bW5WaXNpYmlsaXR5SW5mbyIsImlkIiwiZ3JvdXBJZCIsInJlcXVlc3RHcm91cElkIiwiYlN1Z2dlc3Rpb24iLCJzZXRLZXlQYXRoIiwic2V0RGVzY3JpcHRpb25QYXRoIiwiaXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMiLCJzZXRGaWx0ZXJGaWVsZHMiLCJ0YWJsZU9yUHJvbWlzZSIsImdldFRhYmxlIiwiYWxsIiwiY29udHJvbHMiLCJpbmZvIiwiZ2V0TWV0YWRhdGEiLCJnZXROYW1lIiwic2V0VGFibGUiLCJmaWVsZCIsImdldENvbnRyb2wiLCJyZWR1Y2VXaWR0aEZvclVuaXRWYWx1ZUhlbHAiLCJCb29sZWFuIiwidGFibGVXaWR0aCIsInNldFdpZHRoIiwic2V0TW9kZSIsImdldE1heENvbmRpdGlvbnMiLCJjcmVhdGVWYWx1ZUhlbHBEaWFsb2ciLCJpc0Ryb3BEb3duTGlzdGUiLCJlbmFibGVBdXRvQ29sdW1uV2lkdGgiLCJzeXN0ZW0iLCJwaG9uZSIsImZpbHRlckJhck9yUHJvbWlzZSIsImdldEZpbHRlckJhciIsImZpbHRlckJhciIsInNldEZpbHRlckJhciIsInNldEZpbHRlciIsImluaXRpYWxpemVkIiwic2V0U2VsZWN0aW9uTW9kZSIsIm1kY1RhYmxlIiwiX3NldFNob3dQMTNuQnV0dG9uIiwiX2dldENvbnRlbnRCeUlkIiwiY29udGVudExpc3QiLCJmaW5kIiwiaXRlbSIsIl9jcmVhdGVQb3BvdmVyQ29udGVudCIsImNhc2VTZW5zaXRpdmUiLCJNVGFibGUiLCJncm91cCIsIl9jcmVhdGVEaWFsb2dDb250ZW50IiwiZm9yY2VCaW5kIiwiTURDVGFibGUiLCJzaG93VmFsdWVMaXN0IiwiY29udGFpbmVyIiwic2VsZWN0ZWRDb250ZW50SWQiLCJzaG93Q29uZGl0aW9uUGFuZWwiLCJkYXRhIiwiZ2V0Q29udGVudCIsImdldENhc2VTZW5zaXRpdmUiLCJxdWFsaWZpZXJGb3JUeXBlYWhlYWQiLCJzdWJWYWx1ZUxpc3RJbmZvIiwiaW5zZXJ0Q29udGVudCIsInJlbW92ZUNvbnRlbnQiLCJzZXRUaXRsZSIsIkxhYmVsIiwic2V0VmlzaWJsZSIsImNvbmRpdGlvbnNDb250ZW50IiwiQ29uZGl0aW9ucyIsImFkZENvbnRlbnQiLCJzZWxlY3RlZEluZm8iLCJzZWxlY3RlZENvbnRlbnQiLCJGZXRjaFZhbHVlcyIsIkVycm9yIiwiY2F0Y2giXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlZhbHVlTGlzdEhlbHBlck5ldy50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgTG9nLCB7IExldmVsIH0gZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHR5cGUgeyBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgVmFsdWVMaXN0SGVscGVyQ29tbW9uIGZyb20gXCJzYXAvZmUvbWFjcm9zL2ludGVybmFsL3ZhbHVlaGVscC9WYWx1ZUxpc3RIZWxwZXJcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvbS9UYWJsZVwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IEZyYWdtZW50IGZyb20gXCJzYXAvdWkvY29yZS9GcmFnbWVudFwiO1xuaW1wb3J0IFhNTFByZXByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvdXRpbC9YTUxQcmVwcm9jZXNzb3JcIjtcbmltcG9ydCBYTUxUZW1wbGF0ZVByb2Nlc3NvciBmcm9tIFwic2FwL3VpL2NvcmUvWE1MVGVtcGxhdGVQcm9jZXNzb3JcIjtcbmltcG9ydCB7IHN5c3RlbSB9IGZyb20gXCJzYXAvdWkvRGV2aWNlXCI7XG5pbXBvcnQgUmVtIGZyb20gXCJzYXAvdWkvZG9tL3VuaXRzL1JlbVwiO1xuaW1wb3J0IHR5cGUgRmllbGRCYXNlIGZyb20gXCJzYXAvdWkvbWRjL2ZpZWxkL0ZpZWxkQmFzZVwiO1xuaW1wb3J0IHR5cGUgVmFsdWVIZWxwIGZyb20gXCJzYXAvdWkvbWRjL1ZhbHVlSGVscFwiO1xuaW1wb3J0IHR5cGUgQ29udGFpbmVyIGZyb20gXCJzYXAvdWkvbWRjL3ZhbHVlaGVscC9iYXNlL0NvbnRhaW5lclwiO1xuaW1wb3J0IHR5cGUgQ29udGVudCBmcm9tIFwic2FwL3VpL21kYy92YWx1ZWhlbHAvYmFzZS9Db250ZW50XCI7XG5pbXBvcnQgQ29uZGl0aW9ucyBmcm9tIFwic2FwL3VpL21kYy92YWx1ZWhlbHAvY29udGVudC9Db25kaXRpb25zXCI7XG5pbXBvcnQgTURDVGFibGUgZnJvbSBcInNhcC91aS9tZGMvdmFsdWVoZWxwL2NvbnRlbnQvTURDVGFibGVcIjtcbmltcG9ydCBNVGFibGUgZnJvbSBcInNhcC91aS9tZGMvdmFsdWVoZWxwL2NvbnRlbnQvTVRhYmxlXCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIENvbnRleHQgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9Db250ZXh0XCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvT0RhdGFNb2RlbFwiO1xuXG4vL3dhcyBpbiBoZWxwZXJzLmQudHM6XG4vL2RlY2xhcmUgbW9kdWxlIFwic2FwL3VpL2RvbS91bml0cy9SZW1cIiB7XG4vL1x0ZnVuY3Rpb24gZnJvbVB4KHZQeDogc3RyaW5nIHwgZmxvYXQpOiBmbG9hdDtcbi8vfVxuXG5jb25zdCBBbm5vdGF0aW9uTGFiZWwgPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxcIixcblx0QW5ub3RhdGlvblRleHQgPSBcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dFwiLFxuXHRBbm5vdGF0aW9uVGV4dFVJVGV4dEFycmFuZ2VtZW50ID0gXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlRleHRAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuVGV4dEFycmFuZ2VtZW50XCIsXG5cdEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJJbiA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlckluXCIsXG5cdEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJDb25zdGFudCA9IFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFBhcmFtZXRlckNvbnN0YW50XCIsXG5cdEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJPdXQgPSBcImNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RQYXJhbWV0ZXJPdXRcIixcblx0QW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckluT3V0ID0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UGFyYW1ldGVySW5PdXRcIixcblx0QW5ub3RhdGlvblZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlcyA9IFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXNcIjtcblxudHlwZSBBbm5vdGF0aW9uc0ZvckNvbGxlY3Rpb24gPSB7XG5cdFwiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VhcmNoUmVzdHJpY3Rpb25zXCI/OiB7XG5cdFx0U2VhcmNoYWJsZT86IGJvb2xlYW47XG5cdH07XG59O1xuXG50eXBlIEFubm90YXRpb25zRm9yUHJvcGVydHkgPSB7XG5cdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RcIj86IHtcblx0XHRTZWFyY2hTdXBwb3J0ZWQ/OiBib29sZWFuO1xuXHR9O1xuXHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuTGFiZWxcIj86IHN0cmluZzsgLy8gQW5ub3RhdGlvbkxhYmVsXG5cdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5UZXh0XCI/OiB7XG5cdFx0Ly8gQW5ub3RhdGlvblRleHRcblx0XHQkUGF0aDogc3RyaW5nO1xuXHR9O1xuXHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVGV4dEBjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRcIj86IHtcblx0XHQvLyBBbm5vdGF0aW9uVGV4dFVJVGV4dEFycmFuZ2VtZW50XG5cdFx0JEVudW1NZW1iZXI/OiBzdHJpbmc7XG5cdH07XG5cdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbkZpbHRlclwiPzogYm9vbGVhbjtcblx0XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLlZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlc1wiPzogYm9vbGVhbjsgLy8gQW5ub3RhdGlvblZhbHVlTGlzdFdpdGhGaXhlZFZhbHVlc1xuXHRcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0UmVsZXZhbnRRdWFsaWZpZXJzXCI/OiBzdHJpbmdbXTtcblx0XCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuSGlkZGVuXCI/OiBzdHJpbmc7XG59O1xuXG50eXBlIEFubm90YXRpb25TZWxlY3Rpb25GaWVsZCA9IHtcblx0JFByb3BlcnR5UGF0aDogc3RyaW5nO1xufTtcblxudHlwZSBBbm5vdGF0aW9uc0ZvckVudGl0eVR5cGUgPSB7XG5cdFwiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc1wiPzogQW5ub3RhdGlvblNlbGVjdGlvbkZpZWxkW107XG59O1xuXG5leHBvcnQgdHlwZSBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVyID0ge1xuXHQkVHlwZTogc3RyaW5nO1xuXHRWYWx1ZUxpc3RQcm9wZXJ0eTogc3RyaW5nO1xuXHRMb2NhbERhdGFQcm9wZXJ0eToge1xuXHRcdCRQcm9wZXJ0eVBhdGg6IHN0cmluZztcblx0fTtcblx0Q29uc3RhbnQ6IHN0cmluZztcblx0SW5pdGlhbFZhbHVlSXNTaWduaWZpY2FudDogYm9vbGVhbjtcbn07XG5cbi8vIGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RUeXBlXG50eXBlIEFubm90YXRpb25WYWx1ZUxpc3RUeXBlID0ge1xuXHRMYWJlbDogc3RyaW5nO1xuXHRDb2xsZWN0aW9uUGF0aDogc3RyaW5nO1xuXHRDb2xsZWN0aW9uUm9vdDogc3RyaW5nO1xuXHREaXN0aW5jdFZhbHVlc1N1cHBvcnRlZDogYm9vbGVhbjtcblx0U2VhcmNoU3VwcG9ydGVkOiBib29sZWFuO1xuXHRGZXRjaFZhbHVlczogbnVtYmVyO1xuXHRQcmVzZW50YXRpb25WYXJpYW50UXVhbGlmaWVyOiBzdHJpbmc7XG5cdFNlbGVjdGlvblZhcmlhbnRRdWFsaWZpZXI6IHN0cmluZztcblx0UGFyYW1ldGVyczogW0Fubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJdO1xuXHQkbW9kZWw6IE9EYXRhTW9kZWw7XG59O1xuXG50eXBlIEFubm90YXRpb25WYWx1ZUxpc3RUeXBlQnlRdWFsaWZpZXIgPSB7IFtxdWFsaWZpZXIgaW4gc3RyaW5nXTogQW5ub3RhdGlvblZhbHVlTGlzdFR5cGUgfTtcblxudHlwZSBQcm9wZXJ0eSA9IHtcblx0JFR5cGU6IHN0cmluZztcblx0JGtpbmQ6IHN0cmluZztcblx0JGlzQ29sbGVjdGlvbjogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEluT3V0UGFyYW1ldGVyID0ge1xuXHRwYXJtZXRlclR5cGU6IHN0cmluZztcblx0c291cmNlOiBzdHJpbmc7XG5cdGhlbHBQYXRoOiBzdHJpbmc7XG5cdGluaXRpYWxWYWx1ZUZpbHRlckVtcHR5OiBib29sZWFuO1xuXHRjb25zdGFudFZhbHVlPzogc3RyaW5nIHwgYm9vbGVhbjtcbn07XG5cbnR5cGUgVmFsdWVIZWxwUGF5bG9hZEluZm8gPSB7XG5cdHZoS2V5cz86IHN0cmluZ1tdO1xuXHR2aFBhcmFtZXRlcnM/OiBJbk91dFBhcmFtZXRlcltdO1xufTtcblxudHlwZSBWYWx1ZUhlbHBRdWFsaWZpZXJNYXAgPSBSZWNvcmQ8c3RyaW5nLCBWYWx1ZUhlbHBQYXlsb2FkSW5mbz47XG5cbmV4cG9ydCB0eXBlIFZhbHVlSGVscFBheWxvYWQgPSB7XG5cdHByb3BlcnR5UGF0aDogc3RyaW5nO1xuXHRxdWFsaWZpZXJzOiBWYWx1ZUhlbHBRdWFsaWZpZXJNYXA7XG5cdHZhbHVlSGVscFF1YWxpZmllcjogc3RyaW5nO1xuXHRjb25kaXRpb25Nb2RlbD86IGFueTtcblx0aXNBY3Rpb25QYXJhbWV0ZXJEaWFsb2c/OiBib29sZWFuO1xuXHRpc1VuaXRWYWx1ZUhlbHA/OiBib29sZWFuO1xuXHRyZXF1ZXN0R3JvdXBJZD86IHN0cmluZztcblx0dXNlTXVsdGlWYWx1ZUZpZWxkPzogYm9vbGVhbjtcblx0aXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXM/OiBib29sZWFuO1xufTtcblxudHlwZSBDb2x1bW5EZWYgPSB7XG5cdHBhdGg6IHN0cmluZztcblx0bGFiZWw6IHN0cmluZztcblx0c29ydGFibGU6IGJvb2xlYW47XG5cdGZpbHRlcmFibGU6IGJvb2xlYW4gfCBDb21waWxlZEJpbmRpbmdUb29sa2l0RXhwcmVzc2lvbjtcblx0JFR5cGU6IHN0cmluZztcbn07XG5cbmV4cG9ydCB0eXBlIFZhbHVlTGlzdEluZm8gPSB7XG5cdGtleVZhbHVlOiBzdHJpbmc7XG5cdGRlc2NyaXB0aW9uVmFsdWU6IHN0cmluZztcblx0ZmllbGRQcm9wZXJ0eVBhdGg6IHN0cmluZztcblx0dmhLZXlzOiBzdHJpbmdbXTtcblx0dmhQYXJhbWV0ZXJzOiBJbk91dFBhcmFtZXRlcltdO1xuXHR2YWx1ZUxpc3RJbmZvOiBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZTtcblx0Y29sdW1uRGVmczogQ29sdW1uRGVmW107XG5cdHZhbHVlSGVscFF1YWxpZmllcjogc3RyaW5nO1xufTtcblxudHlwZSBEaXNwbGF5Rm9ybWF0ID0gXCJEZXNjcmlwdGlvblwiIHwgXCJWYWx1ZURlc2NyaXB0aW9uXCIgfCBcIlZhbHVlXCIgfCBcIkRlc2NyaXB0aW9uVmFsdWVcIjtcblxudHlwZSBBZGRpdGlvbmFsVmlld0RhdGEgPSB7XG5cdGVuYWJsZUF1dG9Db2x1bW5XaWR0aD86IGJvb2xlYW47XG59O1xuXG5jb25zdCBWYWx1ZUxpc3RIZWxwZXIgPSB7XG5cdGVudGl0eUlzU2VhcmNoYWJsZTogZnVuY3Rpb24gKHByb3BlcnR5QW5ub3RhdGlvbnM6IEFubm90YXRpb25zRm9yUHJvcGVydHksIGNvbGxlY3Rpb25Bbm5vdGF0aW9uczogQW5ub3RhdGlvbnNGb3JDb2xsZWN0aW9uKTogYm9vbGVhbiB7XG5cdFx0Y29uc3Qgc2VhcmNoU3VwcG9ydGVkID0gcHJvcGVydHlBbm5vdGF0aW9uc1tcIkBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuVmFsdWVMaXN0XCJdPy5TZWFyY2hTdXBwb3J0ZWQsXG5cdFx0XHRzZWFyY2hhYmxlID0gY29sbGVjdGlvbkFubm90YXRpb25zW1wiQE9yZy5PRGF0YS5DYXBhYmlsaXRpZXMuVjEuU2VhcmNoUmVzdHJpY3Rpb25zXCJdPy5TZWFyY2hhYmxlO1xuXG5cdFx0aWYgKFxuXHRcdFx0KHNlYXJjaGFibGUgPT09IHVuZGVmaW5lZCAmJiBzZWFyY2hTdXBwb3J0ZWQgPT09IGZhbHNlKSB8fFxuXHRcdFx0KHNlYXJjaGFibGUgPT09IHRydWUgJiYgc2VhcmNoU3VwcG9ydGVkID09PSBmYWxzZSkgfHxcblx0XHRcdHNlYXJjaGFibGUgPT09IGZhbHNlXG5cdFx0KSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXHRcdHJldHVybiB0cnVlO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBjb25kaXRpb24gcGF0aCByZXF1aXJlZCBmb3IgdGhlIGNvbmRpdGlvbiBtb2RlbC5cblx0ICogRm9yIGUuZy4gPDE6Ti1Qcm9wZXJ0eU5hbWU+KlxcLzwxOjEtUHJvcGVydHlOYW1lPi88UHJvcGVydHlOYW1lPi5cblx0ICpcblx0ICogQHBhcmFtIG1ldGFNb2RlbCBUaGUgbWV0YW1vZGVsIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgVGhlIGVudGl0eSBzZXQgcGF0aFxuXHQgKiBAcGFyYW0gcHJvcGVydHlQYXRoIFRoZSBwcm9wZXJ0eSBwYXRoXG5cdCAqIEByZXR1cm5zIFRoZSBmb3JtYXR0ZWQgY29uZGl0aW9uIHBhdGhcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRDb25kaXRpb25QYXRoOiBmdW5jdGlvbiAobWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCwgZW50aXR5U2V0OiBzdHJpbmcsIHByb3BlcnR5UGF0aDogc3RyaW5nKTogc3RyaW5nIHtcblx0XHQvLyAoc2VlIGFsc286IHNhcC9mZS9jb3JlL2NvbnZlcnRlcnMvY29udHJvbHMvTGlzdFJlcG9ydC9GaWx0ZXJCYXIudHMpXG5cdFx0Y29uc3QgcGFydHMgPSBwcm9wZXJ0eVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdGxldCBjb25kaXRpb25QYXRoID0gXCJcIixcblx0XHRcdHBhcnRpYWxQYXRoOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG5cblx0XHR3aGlsZSAocGFydHMubGVuZ3RoKSB7XG5cdFx0XHRsZXQgcGFydCA9IHBhcnRzLnNoaWZ0KCkgYXMgc3RyaW5nO1xuXHRcdFx0cGFydGlhbFBhdGggPSBwYXJ0aWFsUGF0aCA/IGAke3BhcnRpYWxQYXRofS8ke3BhcnR9YCA6IHBhcnQ7XG5cdFx0XHRjb25zdCBwcm9wZXJ0eSA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0fS8ke3BhcnRpYWxQYXRofWApIGFzIFByb3BlcnR5O1xuXHRcdFx0aWYgKHByb3BlcnR5ICYmIHByb3BlcnR5LiRraW5kID09PSBcIk5hdmlnYXRpb25Qcm9wZXJ0eVwiICYmIHByb3BlcnR5LiRpc0NvbGxlY3Rpb24pIHtcblx0XHRcdFx0cGFydCArPSBcIipcIjtcblx0XHRcdH1cblx0XHRcdGNvbmRpdGlvblBhdGggPSBjb25kaXRpb25QYXRoID8gYCR7Y29uZGl0aW9uUGF0aH0vJHtwYXJ0fWAgOiBwYXJ0O1xuXHRcdH1cblx0XHRyZXR1cm4gY29uZGl0aW9uUGF0aDtcblx0fSxcblxuXHQvKipcblx0ICogUmV0dXJucyBhcnJheSBvZiBjb2x1bW4gZGVmaW5pdGlvbnMgY29ycmVzcG9uZGluZyB0byBwcm9wZXJ0aWVzIGRlZmluZWQgYXMgU2VsZWN0aW9uIEZpZWxkcyBvbiB0aGUgQ29sbGVjdGlvblBhdGggZW50aXR5IHNldCBpbiBhIFZhbHVlSGVscC5cblx0ICpcblx0ICogQHBhcmFtIG1ldGFNb2RlbCBUaGUgbWV0YW1vZGVsIGluc3RhbmNlXG5cdCAqIEBwYXJhbSBlbnRpdHlTZXQgVGhlIGVudGl0eSBzZXQgcGF0aFxuXHQgKiBAcmV0dXJucyBBcnJheSBvZiBjb2x1bW4gZGVmaW5pdGlvbnNcblx0ICogQHByaXZhdGVcblx0ICovXG5cdF9nZXRDb2x1bW5EZWZpbml0aW9uRnJvbVNlbGVjdGlvbkZpZWxkczogZnVuY3Rpb24gKG1ldGFNb2RlbDogT0RhdGFNZXRhTW9kZWwsIGVudGl0eVNldDogc3RyaW5nKTogQ29sdW1uRGVmW10ge1xuXHRcdGNvbnN0IGNvbHVtbkRlZnM6IENvbHVtbkRlZltdID0gW10sXG5cdFx0XHQvL3NlbGVjdGlvbkZpZWxkcyA9IG1ldGFNb2RlbC5nZXRPYmplY3QoZW50aXR5U2V0ICsgXCIvQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLlNlbGVjdGlvbkZpZWxkc1wiKSBhcyBTZWxlY3Rpb25GaWVsZFtdIHwgdW5kZWZpbmVkO1xuXHRcdFx0ZW50aXR5VHlwZUFubm90YXRpb25zID0gbWV0YU1vZGVsLmdldE9iamVjdChgJHtlbnRpdHlTZXR9L0BgKSBhcyBBbm5vdGF0aW9uc0ZvckVudGl0eVR5cGUsXG5cdFx0XHRzZWxlY3Rpb25GaWVsZHMgPSBlbnRpdHlUeXBlQW5ub3RhdGlvbnNbXCJAY29tLnNhcC52b2NhYnVsYXJpZXMuVUkudjEuU2VsZWN0aW9uRmllbGRzXCJdO1xuXG5cdFx0aWYgKHNlbGVjdGlvbkZpZWxkcykge1xuXHRcdFx0c2VsZWN0aW9uRmllbGRzLmZvckVhY2goZnVuY3Rpb24gKHNlbGVjdGlvbkZpZWxkKSB7XG5cdFx0XHRcdGNvbnN0IHNlbGVjdGlvbkZpZWxkUGF0aCA9IGAke2VudGl0eVNldH0vJHtzZWxlY3Rpb25GaWVsZC4kUHJvcGVydHlQYXRofWAsXG5cdFx0XHRcdFx0Y29uZGl0aW9uUGF0aCA9IFZhbHVlTGlzdEhlbHBlci5fZ2V0Q29uZGl0aW9uUGF0aChtZXRhTW9kZWwsIGVudGl0eVNldCwgc2VsZWN0aW9uRmllbGQuJFByb3BlcnR5UGF0aCksXG5cdFx0XHRcdFx0cHJvcGVydHlBbm5vdGF0aW9ucyA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7c2VsZWN0aW9uRmllbGRQYXRofUBgKSBhcyBBbm5vdGF0aW9uc0ZvclByb3BlcnR5LFxuXHRcdFx0XHRcdGNvbHVtbkRlZiA9IHtcblx0XHRcdFx0XHRcdHBhdGg6IGNvbmRpdGlvblBhdGgsXG5cdFx0XHRcdFx0XHRsYWJlbDogcHJvcGVydHlBbm5vdGF0aW9uc1tBbm5vdGF0aW9uTGFiZWxdIHx8IHNlbGVjdGlvbkZpZWxkUGF0aCxcblx0XHRcdFx0XHRcdHNvcnRhYmxlOiB0cnVlLFxuXHRcdFx0XHRcdFx0ZmlsdGVyYWJsZTogQ29tbW9uVXRpbHMuaXNQcm9wZXJ0eUZpbHRlcmFibGUobWV0YU1vZGVsLCBlbnRpdHlTZXQsIHNlbGVjdGlvbkZpZWxkLiRQcm9wZXJ0eVBhdGgsIGZhbHNlKSxcblx0XHRcdFx0XHRcdCRUeXBlOiBtZXRhTW9kZWwuZ2V0T2JqZWN0KHNlbGVjdGlvbkZpZWxkUGF0aCkuJFR5cGVcblx0XHRcdFx0XHR9O1xuXHRcdFx0XHRjb2x1bW5EZWZzLnB1c2goY29sdW1uRGVmKTtcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBjb2x1bW5EZWZzO1xuXHR9LFxuXG5cdF9tZXJnZUNvbHVtbkRlZmluaXRpb25zRnJvbVByb3BlcnRpZXM6IGZ1bmN0aW9uIChcblx0XHRjb2x1bW5EZWZzOiBDb2x1bW5EZWZbXSxcblx0XHR2YWx1ZUxpc3RJbmZvOiBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSxcblx0XHR2YWx1ZUxpc3RQcm9wZXJ0eTogc3RyaW5nLFxuXHRcdHByb3BlcnR5OiBQcm9wZXJ0eSxcblx0XHRwcm9wZXJ0eUFubm90YXRpb25zOiBBbm5vdGF0aW9uc0ZvclByb3BlcnR5XG5cdCk6IHZvaWQge1xuXHRcdGxldCBjb2x1bW5QYXRoID0gdmFsdWVMaXN0UHJvcGVydHksXG5cdFx0XHRjb2x1bW5Qcm9wZXJ0eVR5cGUgPSBwcm9wZXJ0eS4kVHlwZTtcblx0XHRjb25zdCBsYWJlbCA9IHByb3BlcnR5QW5ub3RhdGlvbnNbQW5ub3RhdGlvbkxhYmVsXSB8fCBjb2x1bW5QYXRoLFxuXHRcdFx0dGV4dEFubm90YXRpb24gPSBwcm9wZXJ0eUFubm90YXRpb25zW0Fubm90YXRpb25UZXh0XTtcblxuXHRcdGlmIChcblx0XHRcdHRleHRBbm5vdGF0aW9uICYmXG5cdFx0XHRwcm9wZXJ0eUFubm90YXRpb25zW0Fubm90YXRpb25UZXh0VUlUZXh0QXJyYW5nZW1lbnRdPy4kRW51bU1lbWJlciA9PT0gXCJjb20uc2FwLnZvY2FidWxhcmllcy5VSS52MS5UZXh0QXJyYW5nZW1lbnRUeXBlL1RleHRPbmx5XCJcblx0XHQpIHtcblx0XHRcdC8vIHRoZSBjb2x1bW4gcHJvcGVydHkgaXMgdGhlIG9uZSBjb21pbmcgZnJvbSB0aGUgdGV4dCBhbm5vdGF0aW9uXG5cdFx0XHRjb2x1bW5QYXRoID0gdGV4dEFubm90YXRpb24uJFBhdGg7XG5cdFx0XHRjb25zdCB0ZXh0UHJvcGVydHlQYXRoID0gYC8ke3ZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9LyR7Y29sdW1uUGF0aH1gO1xuXHRcdFx0Y29sdW1uUHJvcGVydHlUeXBlID0gdmFsdWVMaXN0SW5mby4kbW9kZWwuZ2V0TWV0YU1vZGVsKCkuZ2V0T2JqZWN0KHRleHRQcm9wZXJ0eVBhdGgpLiRUeXBlIGFzIHN0cmluZztcblx0XHR9XG5cblx0XHRjb25zdCBjb2x1bW5Ob3RBbHJlYWR5RGVmaW5lZCA9XG5cdFx0XHRjb2x1bW5EZWZzLmZpbmRJbmRleChmdW5jdGlvbiAoY29sKSB7XG5cdFx0XHRcdHJldHVybiBjb2wucGF0aCA9PT0gY29sdW1uUGF0aDtcblx0XHRcdH0pID09PSAtMTtcblxuXHRcdGlmIChjb2x1bW5Ob3RBbHJlYWR5RGVmaW5lZCkge1xuXHRcdFx0Y29uc3QgY29sdW1uRGVmOiBDb2x1bW5EZWYgPSB7XG5cdFx0XHRcdHBhdGg6IGNvbHVtblBhdGgsXG5cdFx0XHRcdGxhYmVsOiBsYWJlbCxcblx0XHRcdFx0c29ydGFibGU6IHRydWUsXG5cdFx0XHRcdGZpbHRlcmFibGU6ICFwcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLlVJLnYxLkhpZGRlbkZpbHRlclwiXSxcblx0XHRcdFx0JFR5cGU6IGNvbHVtblByb3BlcnR5VHlwZVxuXHRcdFx0fTtcblx0XHRcdGNvbHVtbkRlZnMucHVzaChjb2x1bW5EZWYpO1xuXHRcdH1cblx0fSxcblxuXHRmaWx0ZXJJbk91dFBhcmFtZXRlcnM6IGZ1bmN0aW9uICh2aFBhcmFtZXRlcnM6IEluT3V0UGFyYW1ldGVyW10sIHR5cGVGaWx0ZXI6IHN0cmluZ1tdKSB7XG5cdFx0cmV0dXJuIHZoUGFyYW1ldGVycy5maWx0ZXIoZnVuY3Rpb24gKHBhcmFtZXRlcikge1xuXHRcdFx0cmV0dXJuIHR5cGVGaWx0ZXIuaW5kZXhPZihwYXJhbWV0ZXIucGFybWV0ZXJUeXBlKSA+IC0xO1xuXHRcdH0pO1xuXHR9LFxuXG5cdGdldEluUGFyYW1ldGVyczogZnVuY3Rpb24gKHZoUGFyYW1ldGVyczogSW5PdXRQYXJhbWV0ZXJbXSkge1xuXHRcdHJldHVybiBWYWx1ZUxpc3RIZWxwZXIuZmlsdGVySW5PdXRQYXJhbWV0ZXJzKHZoUGFyYW1ldGVycywgW1xuXHRcdFx0QW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckluLFxuXHRcdFx0QW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckNvbnN0YW50LFxuXHRcdFx0QW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckluT3V0XG5cdFx0XSk7XG5cdH0sXG5cblx0Z2V0T3V0UGFyYW1ldGVyczogZnVuY3Rpb24gKHZoUGFyYW1ldGVyczogSW5PdXRQYXJhbWV0ZXJbXSkge1xuXHRcdHJldHVybiBWYWx1ZUxpc3RIZWxwZXIuZmlsdGVySW5PdXRQYXJhbWV0ZXJzKHZoUGFyYW1ldGVycywgW0Fubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJPdXQsIEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJJbk91dF0pO1xuXHR9LFxuXG5cdGNyZWF0ZVZIVUlNb2RlbDogZnVuY3Rpb24gKHZhbHVlSGVscDogVmFsdWVIZWxwLCBwcm9wZXJ0eVBhdGg6IHN0cmluZywgbWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbCk6IEpTT05Nb2RlbCB7XG5cdFx0Ly8gc2V0dGluZyB0aGUgX1ZIVUkgbW9kZWwgZXZhbHVhdGVkIGluIHRoZSBWYWx1ZUxpc3RUYWJsZSBmcmFnbWVudFxuXHRcdGNvbnN0IHZoVUlNb2RlbCA9IG5ldyBKU09OTW9kZWwoe30pLFxuXHRcdFx0cHJvcGVydHlBbm5vdGF0aW9ucyA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7cHJvcGVydHlQYXRofUBgKSBhcyBBbm5vdGF0aW9uc0ZvclByb3BlcnR5O1xuXG5cdFx0dmFsdWVIZWxwLnNldE1vZGVsKHZoVUlNb2RlbCwgXCJfVkhVSVwiKTtcblx0XHQvLyBJZGVudGlmaWVzIHRoZSBcIkNvbnRleHREZXBlbmRlbnQtU2NlbmFyaW9cIlxuXHRcdHZoVUlNb2RlbC5zZXRQcm9wZXJ0eShcblx0XHRcdFwiL2hhc1ZhbHVlTGlzdFJlbGV2YW50UXVhbGlmaWVyc1wiLFxuXHRcdFx0ISFwcm9wZXJ0eUFubm90YXRpb25zW1wiQGNvbS5zYXAudm9jYWJ1bGFyaWVzLkNvbW1vbi52MS5WYWx1ZUxpc3RSZWxldmFudFF1YWxpZmllcnNcIl1cblx0XHQpO1xuXHRcdHJldHVybiB2aFVJTW9kZWw7XG5cdH0sXG5cblx0ZGVzdHJveVZIQ29udGVudDogZnVuY3Rpb24gKHZhbHVlSGVscDogVmFsdWVIZWxwKTogdm9pZCB7XG5cdFx0aWYgKHZhbHVlSGVscC5nZXREaWFsb2coKSkge1xuXHRcdFx0dmFsdWVIZWxwLmdldERpYWxvZygpLmRlc3Ryb3lDb250ZW50KCk7XG5cdFx0fVxuXHRcdGlmICh2YWx1ZUhlbHAuZ2V0VHlwZWFoZWFkKCkpIHtcblx0XHRcdHZhbHVlSGVscC5nZXRUeXBlYWhlYWQoKS5kZXN0cm95Q29udGVudCgpO1xuXHRcdH1cblx0fSxcblxuXHRwdXREZWZhdWx0UXVhbGlmaWVyRmlyc3Q6IGZ1bmN0aW9uIChxdWFsaWZpZXJzOiBzdHJpbmdbXSkge1xuXHRcdGNvbnN0IGluZGV4RGVmYXVsdFZIID0gcXVhbGlmaWVycy5pbmRleE9mKFwiXCIpO1xuXG5cdFx0Ly8gZGVmYXVsdCBWYWx1ZUhlbHAgd2l0aG91dCBxdWFsaWZpZXIgc2hvdWxkIGJlIHRoZSBmaXJzdFxuXHRcdGlmIChpbmRleERlZmF1bHRWSCA+IDApIHtcblx0XHRcdHF1YWxpZmllcnMudW5zaGlmdChxdWFsaWZpZXJzW2luZGV4RGVmYXVsdFZIXSk7XG5cdFx0XHRxdWFsaWZpZXJzLnNwbGljZShpbmRleERlZmF1bHRWSCArIDEsIDEpO1xuXHRcdH1cblx0XHRyZXR1cm4gcXVhbGlmaWVycztcblx0fSxcblxuXHRnZXRWYWx1ZUxpc3RJbmZvOiBhc3luYyBmdW5jdGlvbiAodmFsdWVIZWxwOiBWYWx1ZUhlbHAsIHByb3BlcnR5UGF0aDogc3RyaW5nLCBwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkKTogUHJvbWlzZTxWYWx1ZUxpc3RJbmZvW10+IHtcblx0XHRjb25zdCBiaW5kaW5nQ29udGV4dCA9IHZhbHVlSGVscC5nZXRCaW5kaW5nQ29udGV4dCgpIGFzIENvbnRleHQsXG5cdFx0XHRjb25kaXRpb25Nb2RlbCA9IHBheWxvYWQuY29uZGl0aW9uTW9kZWwsXG5cdFx0XHR2aE1ldGFNb2RlbCA9IHZhbHVlSGVscC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpIGFzIE9EYXRhTWV0YU1vZGVsLFxuXHRcdFx0dmFsdWVMaXN0SW5mb3M6IFZhbHVlTGlzdEluZm9bXSA9IFtdO1xuXG5cdFx0dHJ5IHtcblx0XHRcdGNvbnN0IHZhbHVlTGlzdEJ5UXVhbGlmaWVyID0gKGF3YWl0IHZoTWV0YU1vZGVsLnJlcXVlc3RWYWx1ZUxpc3RJbmZvKFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdHRydWUsXG5cdFx0XHRcdGJpbmRpbmdDb250ZXh0XG5cdFx0XHQpKSBhcyBBbm5vdGF0aW9uVmFsdWVMaXN0VHlwZUJ5UXVhbGlmaWVyO1xuXHRcdFx0Y29uc3QgdmFsdWVIZWxwUXVhbGlmaWVycyA9IHRoaXMucHV0RGVmYXVsdFF1YWxpZmllckZpcnN0KE9iamVjdC5rZXlzKHZhbHVlTGlzdEJ5UXVhbGlmaWVyKSksXG5cdFx0XHRcdHByb3BlcnR5TmFtZSA9IHByb3BlcnR5UGF0aC5zcGxpdChcIi9cIikucG9wKCk7XG5cblx0XHRcdGxldCBjb250ZXh0UHJlZml4ID0gXCJcIjtcblxuXHRcdFx0aWYgKHBheWxvYWQudXNlTXVsdGlWYWx1ZUZpZWxkICYmIGJpbmRpbmdDb250ZXh0ICYmIGJpbmRpbmdDb250ZXh0LmdldFBhdGgoKSkge1xuXHRcdFx0XHRjb25zdCBhQmluZGlnQ29udGV4dFBhcnRzID0gYmluZGluZ0NvbnRleHQuZ2V0UGF0aCgpLnNwbGl0KFwiL1wiKTtcblx0XHRcdFx0Y29uc3QgYVByb3BlcnR5QmluZGluZ1BhcnRzID0gcHJvcGVydHlQYXRoLnNwbGl0KFwiL1wiKTtcblx0XHRcdFx0aWYgKGFQcm9wZXJ0eUJpbmRpbmdQYXJ0cy5sZW5ndGggLSBhQmluZGlnQ29udGV4dFBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRjb25zdCBhQ29udGV4dFByZWZpeFBhcnRzID0gW107XG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IGFCaW5kaWdDb250ZXh0UGFydHMubGVuZ3RoOyBpIDwgYVByb3BlcnR5QmluZGluZ1BhcnRzLmxlbmd0aCAtIDE7IGkrKykge1xuXHRcdFx0XHRcdFx0YUNvbnRleHRQcmVmaXhQYXJ0cy5wdXNoKGFQcm9wZXJ0eUJpbmRpbmdQYXJ0c1tpXSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnRleHRQcmVmaXggPSBgJHthQ29udGV4dFByZWZpeFBhcnRzLmpvaW4oXCIvXCIpfS9gO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdHZhbHVlSGVscFF1YWxpZmllcnMuZm9yRWFjaChmdW5jdGlvbiAodmFsdWVIZWxwUXVhbGlmaWVyKSB7XG5cdFx0XHRcdC8vIEFkZCBjb2x1bW4gZGVmaW5pdGlvbnMgZm9yIHByb3BlcnRpZXMgZGVmaW5lZCBhcyBTZWxlY3Rpb24gZmllbGRzIG9uIHRoZSBDb2xsZWN0aW9uUGF0aCBlbnRpdHkgc2V0LlxuXHRcdFx0XHRjb25zdCBhbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSA9IHZhbHVlTGlzdEJ5UXVhbGlmaWVyW3ZhbHVlSGVscFF1YWxpZmllcl0sXG5cdFx0XHRcdFx0bWV0YU1vZGVsID0gYW5ub3RhdGlvblZhbHVlTGlzdFR5cGUuJG1vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0XHRcdGVudGl0eVNldFBhdGggPSBgLyR7YW5ub3RhdGlvblZhbHVlTGlzdFR5cGUuQ29sbGVjdGlvblBhdGh9YCxcblx0XHRcdFx0XHRjb2x1bW5EZWZzID0gVmFsdWVMaXN0SGVscGVyLl9nZXRDb2x1bW5EZWZpbml0aW9uRnJvbVNlbGVjdGlvbkZpZWxkcyhtZXRhTW9kZWwsIGVudGl0eVNldFBhdGgpLFxuXHRcdFx0XHRcdHZoUGFyYW1ldGVyczogSW5PdXRQYXJhbWV0ZXJbXSA9IFtdLFxuXHRcdFx0XHRcdHZoS2V5czogc3RyaW5nW10gPSBtZXRhTW9kZWwuZ2V0T2JqZWN0KGVudGl0eVNldFBhdGggKyBgL2ApPy4kS2V5XG5cdFx0XHRcdFx0XHQ/IFsuLi5tZXRhTW9kZWwuZ2V0T2JqZWN0KGVudGl0eVNldFBhdGggKyBgL2ApLiRLZXldXG5cdFx0XHRcdFx0XHQ6IFtdO1xuXHRcdFx0XHRsZXQgZmllbGRQcm9wZXJ0eVBhdGggPSBcIlwiLFxuXHRcdFx0XHRcdGRlc2NyaXB0aW9uUGF0aCA9IFwiXCIsXG5cdFx0XHRcdFx0a2V5ID0gXCJcIjtcblxuXHRcdFx0XHRhbm5vdGF0aW9uVmFsdWVMaXN0VHlwZS5QYXJhbWV0ZXJzLmZvckVhY2goZnVuY3Rpb24gKHBhcmFtZXRlcikge1xuXHRcdFx0XHRcdC8vQWxsIFN0cmluZyBmaWVsZHMgYXJlIGFsbG93ZWQgZm9yIGZpbHRlclxuXHRcdFx0XHRcdGNvbnN0IHByb3BlcnR5UGF0aDIgPSBgLyR7YW5ub3RhdGlvblZhbHVlTGlzdFR5cGUuQ29sbGVjdGlvblBhdGh9LyR7cGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5fWAsXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eSA9IG1ldGFNb2RlbC5nZXRPYmplY3QocHJvcGVydHlQYXRoMiksXG5cdFx0XHRcdFx0XHRwcm9wZXJ0eUFubm90YXRpb25zID0gKG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7cHJvcGVydHlQYXRoMn1AYCkgfHwge30pIGFzIEFubm90YXRpb25zRm9yUHJvcGVydHk7XG5cblx0XHRcdFx0XHQvLyBJZiBwcm9wZXJ0eSBpcyB1bmRlZmluZWQsIHRoZW4gdGhlIHByb3BlcnR5IGNvbWluZyBmb3IgdGhlIGVudHJ5IGlzbid0IGRlZmluZWQgaW5cblx0XHRcdFx0XHQvLyB0aGUgbWV0YW1vZGVsLCB0aGVyZWZvcmUgd2UgZG9uJ3QgbmVlZCB0byBhZGQgaXQgaW4gdGhlIGluL291dCBwYXJhbWV0ZXJzXG5cdFx0XHRcdFx0aWYgKHByb3BlcnR5KSB7XG5cdFx0XHRcdFx0XHQvLyBTZWFyY2ggZm9yIHRoZSAqb3V0IFBhcmFtZXRlciBtYXBwZWQgdG8gdGhlIGxvY2FsIHByb3BlcnR5XG5cdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdCFrZXkgJiZcblx0XHRcdFx0XHRcdFx0KHBhcmFtZXRlci4kVHlwZSA9PT0gQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlck91dCB8fFxuXHRcdFx0XHRcdFx0XHRcdHBhcmFtZXRlci4kVHlwZSA9PT0gQW5ub3RhdGlvblZhbHVlTGlzdFBhcmFtZXRlckluT3V0KSAmJlxuXHRcdFx0XHRcdFx0XHRwYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHkuJFByb3BlcnR5UGF0aCA9PT0gcHJvcGVydHlOYW1lXG5cdFx0XHRcdFx0XHQpIHtcblx0XHRcdFx0XHRcdFx0ZmllbGRQcm9wZXJ0eVBhdGggPSBwcm9wZXJ0eVBhdGgyO1xuXHRcdFx0XHRcdFx0XHRrZXkgPSBwYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHk7XG5cblx0XHRcdFx0XHRcdFx0Ly9Pbmx5IHRoZSB0ZXh0IGFubm90YXRpb24gb2YgdGhlIGtleSBjYW4gc3BlY2lmeSB0aGUgZGVzY3JpcHRpb25cblx0XHRcdFx0XHRcdFx0ZGVzY3JpcHRpb25QYXRoID0gcHJvcGVydHlBbm5vdGF0aW9uc1tBbm5vdGF0aW9uVGV4dF0/LiRQYXRoIHx8IFwiXCI7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGNvbnN0IHZhbHVlTGlzdFByb3BlcnR5ID0gcGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5O1xuXHRcdFx0XHRcdFx0VmFsdWVMaXN0SGVscGVyLl9tZXJnZUNvbHVtbkRlZmluaXRpb25zRnJvbVByb3BlcnRpZXMoXG5cdFx0XHRcdFx0XHRcdGNvbHVtbkRlZnMsXG5cdFx0XHRcdFx0XHRcdGFubm90YXRpb25WYWx1ZUxpc3RUeXBlLFxuXHRcdFx0XHRcdFx0XHR2YWx1ZUxpc3RQcm9wZXJ0eSxcblx0XHRcdFx0XHRcdFx0cHJvcGVydHksXG5cdFx0XHRcdFx0XHRcdHByb3BlcnR5QW5ub3RhdGlvbnNcblx0XHRcdFx0XHRcdCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly9JbiBhbmQgSW5PdXRcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHQocGFyYW1ldGVyLiRUeXBlID09PSBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVySW4gfHxcblx0XHRcdFx0XHRcdFx0cGFyYW1ldGVyLiRUeXBlID09PSBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVySW5PdXQgfHxcblx0XHRcdFx0XHRcdFx0cGFyYW1ldGVyLiRUeXBlID09PSBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVyT3V0KSAmJlxuXHRcdFx0XHRcdFx0cGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5LiRQcm9wZXJ0eVBhdGggIT09IHByb3BlcnR5TmFtZVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0bGV0IHZhbHVlUGF0aCA9IFwiXCI7XG5cdFx0XHRcdFx0XHRpZiAoY29uZGl0aW9uTW9kZWwgJiYgY29uZGl0aW9uTW9kZWwubGVuZ3RoID4gMCkge1xuXHRcdFx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHRcdFx0dmFsdWVIZWxwLmdldFBhcmVudCgpLmlzQShcInNhcC51aS5tZGMuVGFibGVcIikgJiZcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZUhlbHAuZ2V0QmluZGluZ0NvbnRleHQoKSAmJlxuXHRcdFx0XHRcdFx0XHRcdChwYXJhbWV0ZXIuJFR5cGUgPT09IEFubm90YXRpb25WYWx1ZUxpc3RQYXJhbWV0ZXJJbiB8fFxuXHRcdFx0XHRcdFx0XHRcdFx0cGFyYW1ldGVyLiRUeXBlID09PSBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVySW5PdXQpXG5cdFx0XHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0XHRcdC8vIFNwZWNpYWwgaGFuZGxpbmcgZm9yIHZhbHVlIGhlbHAgdXNlZCBpbiBmaWx0ZXIgZGlhbG9nXG5cdFx0XHRcdFx0XHRcdFx0Y29uc3QgcGFydHMgPSBwYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHkuJFByb3BlcnR5UGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNvbnN0IGZpcnN0TmF2aWdhdGlvblByb3BlcnR5ID0gcGFydHNbMF07XG5cdFx0XHRcdFx0XHRcdFx0XHRjb25zdCBvQm91bmRFbnRpdHkgPSB2aE1ldGFNb2RlbC5nZXRNZXRhQ29udGV4dChiaW5kaW5nQ29udGV4dC5nZXRQYXRoKCkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0Y29uc3Qgc1BhdGhPZlRhYmxlID0gKHZhbHVlSGVscC5nZXRQYXJlbnQoKSBhcyBhbnkpLmdldFJvd0JpbmRpbmcoKS5nZXRQYXRoKCk7IC8vVE9ET1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKChvQm91bmRFbnRpdHkuZ2V0T2JqZWN0KGAke3NQYXRoT2ZUYWJsZX0vJFBhcnRuZXJgKSBhcyBhbnkpID09PSBmaXJzdE5hdmlnYXRpb25Qcm9wZXJ0eSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvLyBVc2luZyB0aGUgY29uZGl0aW9uIG1vZGVsIGRvZXNuJ3QgbWFrZSBhbnkgc2Vuc2UgaW4gY2FzZSBhbiBpbi1wYXJhbWV0ZXIgdXNlcyBhIG5hdmlnYXRpb24gcHJvcGVydHlcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly8gcmVmZXJyaW5nIHRvIHRoZSBwYXJ0bmVyLiBUaGVyZWZvcmUgcmVkdWNpbmcgdGhlIHBhdGggYW5kIHVzaW5nIHRoZSBGVkggY29udGV4dCBpbnN0ZWFkIG9mIHRoZSBjb25kaXRpb24gbW9kZWxcblx0XHRcdFx0XHRcdFx0XHRcdFx0dmFsdWVQYXRoID0gcGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5LiRQcm9wZXJ0eVBhdGgucmVwbGFjZShmaXJzdE5hdmlnYXRpb25Qcm9wZXJ0eSArIFwiL1wiLCBcIlwiKTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0aWYgKCF2YWx1ZVBhdGgpIHtcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZVBhdGggPSBjb25kaXRpb25Nb2RlbCArIFwiPi9jb25kaXRpb25zL1wiICsgcGFyYW1ldGVyLkxvY2FsRGF0YVByb3BlcnR5LiRQcm9wZXJ0eVBhdGg7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHZhbHVlUGF0aCA9IGNvbnRleHRQcmVmaXggKyBwYXJhbWV0ZXIuTG9jYWxEYXRhUHJvcGVydHkuJFByb3BlcnR5UGF0aDtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdHZoUGFyYW1ldGVycy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0cGFybWV0ZXJUeXBlOiBwYXJhbWV0ZXIuJFR5cGUsXG5cdFx0XHRcdFx0XHRcdHNvdXJjZTogdmFsdWVQYXRoLFxuXHRcdFx0XHRcdFx0XHRoZWxwUGF0aDogcGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRjb25zdGFudFZhbHVlOiBwYXJhbWV0ZXIuQ29uc3RhbnQsXG5cdFx0XHRcdFx0XHRcdGluaXRpYWxWYWx1ZUZpbHRlckVtcHR5OiBwYXJhbWV0ZXIuSW5pdGlhbFZhbHVlSXNTaWduaWZpY2FudFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly9Db25zdGFudCBhcyBJblBhcmFtdGVyIGZvciBmaWx0ZXJpbmdcblx0XHRcdFx0XHRpZiAocGFyYW1ldGVyLiRUeXBlID09PSBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVyQ29uc3RhbnQpIHtcblx0XHRcdFx0XHRcdHZoUGFyYW1ldGVycy5wdXNoKHtcblx0XHRcdFx0XHRcdFx0cGFybWV0ZXJUeXBlOiBwYXJhbWV0ZXIuJFR5cGUsXG5cdFx0XHRcdFx0XHRcdHNvdXJjZTogcGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRoZWxwUGF0aDogcGFyYW1ldGVyLlZhbHVlTGlzdFByb3BlcnR5LFxuXHRcdFx0XHRcdFx0XHRjb25zdGFudFZhbHVlOiBwYXJhbWV0ZXIuQ29uc3RhbnQsXG5cdFx0XHRcdFx0XHRcdGluaXRpYWxWYWx1ZUZpbHRlckVtcHR5OiBwYXJhbWV0ZXIuSW5pdGlhbFZhbHVlSXNTaWduaWZpY2FudFxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdC8vIEVucmljaCBrZXlzIHdpdGggb3V0LXBhcmFtZXRlcnNcblx0XHRcdFx0XHRpZiAoXG5cdFx0XHRcdFx0XHQocGFyYW1ldGVyLiRUeXBlID09PSBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVySW5PdXQgfHwgcGFyYW1ldGVyLiRUeXBlID09PSBBbm5vdGF0aW9uVmFsdWVMaXN0UGFyYW1ldGVyT3V0KSAmJlxuXHRcdFx0XHRcdFx0IXZoS2V5cy5pbmNsdWRlcyhwYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHkpXG5cdFx0XHRcdFx0KSB7XG5cdFx0XHRcdFx0XHR2aEtleXMucHVzaChwYXJhbWV0ZXIuVmFsdWVMaXN0UHJvcGVydHkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHRcdC8qIEVuc3VyZSB0aGF0IHZoS2V5cyBhcmUgcGFydCBvZiB0aGUgY29sdW1uRGVmcywgb3RoZXJ3aXNlIGl0IGlzIG5vdCBjb25zaWRlcmVkIGluICRzZWxlY3QgKEJDUCAyMjcwMTQxMTU0KSAqL1xuXHRcdFx0XHRmb3IgKGNvbnN0IHZoS2V5IG9mIHZoS2V5cykge1xuXHRcdFx0XHRcdGlmIChcblx0XHRcdFx0XHRcdGNvbHVtbkRlZnMuZmluZEluZGV4KGZ1bmN0aW9uIChjb2x1bW4pIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGNvbHVtbi5wYXRoID09PSB2aEtleTtcblx0XHRcdFx0XHRcdH0pID09PSAtMVxuXHRcdFx0XHRcdCkge1xuXHRcdFx0XHRcdFx0Y29uc3QgY29sdW1uRGVmOiBDb2x1bW5EZWYgPSB7XG5cdFx0XHRcdFx0XHRcdHBhdGg6IHZoS2V5LFxuXHRcdFx0XHRcdFx0XHQkVHlwZTogbWV0YU1vZGVsLmdldE9iamVjdChgLyR7YW5ub3RhdGlvblZhbHVlTGlzdFR5cGUuQ29sbGVjdGlvblBhdGh9LyR7a2V5fWApLiRUeXBlLFxuXHRcdFx0XHRcdFx0XHRsYWJlbDogXCJcIixcblx0XHRcdFx0XHRcdFx0c29ydGFibGU6IGZhbHNlLFxuXHRcdFx0XHRcdFx0XHRmaWx0ZXJhYmxlOiB1bmRlZmluZWRcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0XHRjb2x1bW5EZWZzLnB1c2goY29sdW1uRGVmKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRjb25zdCB2YWx1ZUxpc3RJbmZvOiBWYWx1ZUxpc3RJbmZvID0ge1xuXHRcdFx0XHRcdGtleVZhbHVlOiBrZXksXG5cdFx0XHRcdFx0ZGVzY3JpcHRpb25WYWx1ZTogZGVzY3JpcHRpb25QYXRoLFxuXHRcdFx0XHRcdGZpZWxkUHJvcGVydHlQYXRoOiBmaWVsZFByb3BlcnR5UGF0aCxcblx0XHRcdFx0XHR2aEtleXM6IHZoS2V5cyxcblx0XHRcdFx0XHR2aFBhcmFtZXRlcnM6IHZoUGFyYW1ldGVycyxcblx0XHRcdFx0XHR2YWx1ZUxpc3RJbmZvOiBhbm5vdGF0aW9uVmFsdWVMaXN0VHlwZSxcblx0XHRcdFx0XHRjb2x1bW5EZWZzOiBjb2x1bW5EZWZzLFxuXHRcdFx0XHRcdHZhbHVlSGVscFF1YWxpZmllcjogdmFsdWVIZWxwUXVhbGlmaWVyXG5cdFx0XHRcdH07XG5cdFx0XHRcdHZhbHVlTGlzdEluZm9zLnB1c2godmFsdWVMaXN0SW5mbyk7XG5cdFx0XHR9KTtcblx0XHR9IGNhdGNoIChlcnI6IGFueSkge1xuXHRcdFx0Y29uc3QgZXJyU3RhdHVzID0gZXJyLnN0YXR1cyxcblx0XHRcdFx0bXNnID1cblx0XHRcdFx0XHRlcnJTdGF0dXMgJiYgZXJyU3RhdHVzID09PSA0MDRcblx0XHRcdFx0XHRcdD8gYE1ldGFkYXRhIG5vdCBmb3VuZCAoJHtlcnJTdGF0dXN9KSBmb3IgdmFsdWUgaGVscCBvZiBwcm9wZXJ0eSAke3Byb3BlcnR5UGF0aH1gXG5cdFx0XHRcdFx0XHQ6IGVyci5tZXNzYWdlO1xuXHRcdFx0TG9nLmVycm9yKG1zZyk7XG5cdFx0XHRWYWx1ZUxpc3RIZWxwZXIuZGVzdHJveVZIQ29udGVudCh2YWx1ZUhlbHApO1xuXHRcdH1cblx0XHRyZXR1cm4gdmFsdWVMaXN0SW5mb3M7XG5cdH0sXG5cblx0QUxMRlJBR01FTlRTOiB1bmRlZmluZWQgYXMgYW55LFxuXHRsb2dGcmFnbWVudDogdW5kZWZpbmVkIGFzIGFueSxcblxuXHRfbG9nVGVtcGxhdGVkRnJhZ21lbnRzOiBmdW5jdGlvbiAocHJvcGVydHlQYXRoOiBzdHJpbmcsIGZyYWdtZW50TmFtZTogc3RyaW5nLCBmcmFnbWVudERlZmluaXRpb246IGFueSk6IHZvaWQge1xuXHRcdGNvbnN0IGxvZ0luZm8gPSB7XG5cdFx0XHRwYXRoOiBwcm9wZXJ0eVBhdGgsXG5cdFx0XHRmcmFnbWVudE5hbWU6IGZyYWdtZW50TmFtZSxcblx0XHRcdGZyYWdtZW50OiBmcmFnbWVudERlZmluaXRpb25cblx0XHR9O1xuXHRcdGlmIChMb2cuZ2V0TGV2ZWwoKSA9PT0gTGV2ZWwuREVCVUcpIHtcblx0XHRcdC8vSW4gZGVidWcgbW9kZSB3ZSBsb2cgYWxsIGdlbmVyYXRlZCBmcmFnbWVudHNcblx0XHRcdFZhbHVlTGlzdEhlbHBlci5BTExGUkFHTUVOVFMgPSBWYWx1ZUxpc3RIZWxwZXIuQUxMRlJBR01FTlRTIHx8IFtdO1xuXHRcdFx0VmFsdWVMaXN0SGVscGVyLkFMTEZSQUdNRU5UUy5wdXNoKGxvZ0luZm8pO1xuXHRcdH1cblx0XHRpZiAoVmFsdWVMaXN0SGVscGVyLmxvZ0ZyYWdtZW50KSB7XG5cdFx0XHQvL09uZSBUb29sIFN1YnNjcmliZXIgYWxsb3dlZFxuXHRcdFx0c2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5sb2dGcmFnbWVudChsb2dJbmZvKTtcblx0XHRcdH0sIDApO1xuXHRcdH1cblx0fSxcblxuXHRfdGVtcGxhdGVGcmFnbWVudDogYXN5bmMgZnVuY3Rpb24gKFxuXHRcdGZyYWdtZW50TmFtZTogc3RyaW5nLFxuXHRcdHZhbHVlTGlzdEluZm86IFZhbHVlTGlzdEluZm8sXG5cdFx0c291cmNlTW9kZWw6IEpTT05Nb2RlbCxcblx0XHRwcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0XHRhZGRpdGlvbmFsVmlld0RhdGE/OiBBZGRpdGlvbmFsVmlld0RhdGFcblx0KTogUHJvbWlzZTxvYmplY3Q+IHtcblx0XHRjb25zdCBtVmFsdWVMaXN0SW5mbyA9IHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mbyxcblx0XHRcdHZhbHVlTGlzdE1vZGVsID0gbmV3IEpTT05Nb2RlbChtVmFsdWVMaXN0SW5mbyksXG5cdFx0XHR2YWx1ZUxpc3RTZXJ2aWNlTWV0YU1vZGVsID0gbVZhbHVlTGlzdEluZm8uJG1vZGVsLmdldE1ldGFNb2RlbCgpLFxuXHRcdFx0dmlld0RhdGEgPSBuZXcgSlNPTk1vZGVsKFxuXHRcdFx0XHRPYmplY3QuYXNzaWduKFxuXHRcdFx0XHRcdHtcblx0XHRcdFx0XHRcdGNvbnZlcnRlclR5cGU6IFwiTGlzdFJlcG9ydFwiLFxuXHRcdFx0XHRcdFx0Y29sdW1uczogdmFsdWVMaXN0SW5mby5jb2x1bW5EZWZzIHx8IG51bGxcblx0XHRcdFx0XHR9LFxuXHRcdFx0XHRcdGFkZGl0aW9uYWxWaWV3RGF0YVxuXHRcdFx0XHQpXG5cdFx0XHQpO1xuXG5cdFx0Y29uc3QgZnJhZ21lbnREZWZpbml0aW9uID0gYXdhaXQgUHJvbWlzZS5yZXNvbHZlKFxuXHRcdFx0WE1MUHJlcHJvY2Vzc29yLnByb2Nlc3MoXG5cdFx0XHRcdFhNTFRlbXBsYXRlUHJvY2Vzc29yLmxvYWRUZW1wbGF0ZShmcmFnbWVudE5hbWUsIFwiZnJhZ21lbnRcIiksXG5cdFx0XHRcdHsgbmFtZTogZnJhZ21lbnROYW1lIH0sXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRiaW5kaW5nQ29udGV4dHM6IHtcblx0XHRcdFx0XHRcdHZhbHVlTGlzdDogdmFsdWVMaXN0TW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpLFxuXHRcdFx0XHRcdFx0Y29udGV4dFBhdGg6IHZhbHVlTGlzdFNlcnZpY2VNZXRhTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoYC8ke21WYWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofS9gKSxcblx0XHRcdFx0XHRcdHNvdXJjZTogc291cmNlTW9kZWwuY3JlYXRlQmluZGluZ0NvbnRleHQoXCIvXCIpXG5cdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRtb2RlbHM6IHtcblx0XHRcdFx0XHRcdHZhbHVlTGlzdDogdmFsdWVMaXN0TW9kZWwsXG5cdFx0XHRcdFx0XHRjb250ZXh0UGF0aDogdmFsdWVMaXN0U2VydmljZU1ldGFNb2RlbCxcblx0XHRcdFx0XHRcdHNvdXJjZTogc291cmNlTW9kZWwsXG5cdFx0XHRcdFx0XHRtZXRhTW9kZWw6IHZhbHVlTGlzdFNlcnZpY2VNZXRhTW9kZWwsXG5cdFx0XHRcdFx0XHR2aWV3RGF0YTogdmlld0RhdGFcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdClcblx0XHQpO1xuXHRcdFZhbHVlTGlzdEhlbHBlci5fbG9nVGVtcGxhdGVkRnJhZ21lbnRzKHByb3BlcnR5UGF0aCwgZnJhZ21lbnROYW1lLCBmcmFnbWVudERlZmluaXRpb24pO1xuXHRcdHJldHVybiBhd2FpdCBGcmFnbWVudC5sb2FkKHsgZGVmaW5pdGlvbjogZnJhZ21lbnREZWZpbml0aW9uIH0pO1xuXHR9LFxuXG5cdF9nZXRDb250ZW50SWQ6IGZ1bmN0aW9uICh2YWx1ZUhlbHBJZDogc3RyaW5nLCB2YWx1ZUhlbHBRdWFsaWZpZXI6IHN0cmluZywgaXNUeXBlYWhlYWQ6IGJvb2xlYW4pOiBzdHJpbmcge1xuXHRcdGNvbnN0IGNvbnRlbnRUeXBlID0gaXNUeXBlYWhlYWQgPyBcIlBvcG92ZXJcIiA6IFwiRGlhbG9nXCI7XG5cblx0XHRyZXR1cm4gYCR7dmFsdWVIZWxwSWR9Ojoke2NvbnRlbnRUeXBlfTo6cXVhbGlmaWVyOjoke3ZhbHVlSGVscFF1YWxpZmllcn1gO1xuXHR9LFxuXG5cdF9hZGRJbk91dFBhcmFtZXRlcnNUb1BheWxvYWQ6IGZ1bmN0aW9uIChwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLCB2YWx1ZUxpc3RJbmZvOiBWYWx1ZUxpc3RJbmZvKTogdm9pZCB7XG5cdFx0Y29uc3QgdmFsdWVIZWxwUXVhbGlmaWVyID0gdmFsdWVMaXN0SW5mby52YWx1ZUhlbHBRdWFsaWZpZXI7XG5cblx0XHRpZiAoIXBheWxvYWQucXVhbGlmaWVycykge1xuXHRcdFx0cGF5bG9hZC5xdWFsaWZpZXJzID0ge307XG5cdFx0fVxuXG5cdFx0aWYgKCFwYXlsb2FkLnF1YWxpZmllcnNbdmFsdWVIZWxwUXVhbGlmaWVyXSkge1xuXHRcdFx0cGF5bG9hZC5xdWFsaWZpZXJzW3ZhbHVlSGVscFF1YWxpZmllcl0gPSB7XG5cdFx0XHRcdHZoS2V5czogdmFsdWVMaXN0SW5mby52aEtleXMsXG5cdFx0XHRcdHZoUGFyYW1ldGVyczogdmFsdWVMaXN0SW5mby52aFBhcmFtZXRlcnNcblx0XHRcdH07XG5cdFx0fVxuXHR9LFxuXG5cdF9nZXRWYWx1ZUhlbHBDb2x1bW5EaXNwbGF5Rm9ybWF0OiBmdW5jdGlvbiAoXG5cdFx0cHJvcGVydHlBbm5vdGF0aW9uczogQW5ub3RhdGlvbnNGb3JQcm9wZXJ0eSxcblx0XHRpc1ZhbHVlSGVscFdpdGhGaXhlZFZhbHVlczogYm9vbGVhblxuXHQpOiBEaXNwbGF5Rm9ybWF0IHtcblx0XHRjb25zdCBkaXNwbGF5TW9kZSA9IENvbW1vblV0aWxzLmNvbXB1dGVEaXNwbGF5TW9kZShwcm9wZXJ0eUFubm90YXRpb25zLCB1bmRlZmluZWQpLFxuXHRcdFx0dGV4dEFubm90YXRpb24gPSBwcm9wZXJ0eUFubm90YXRpb25zICYmIHByb3BlcnR5QW5ub3RhdGlvbnNbQW5ub3RhdGlvblRleHRdLFxuXHRcdFx0dGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA9IHRleHRBbm5vdGF0aW9uICYmIHByb3BlcnR5QW5ub3RhdGlvbnNbQW5ub3RhdGlvblRleHRVSVRleHRBcnJhbmdlbWVudF07XG5cblx0XHRpZiAoaXNWYWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMpIHtcblx0XHRcdHJldHVybiB0ZXh0QW5ub3RhdGlvbiAmJiB0eXBlb2YgdGV4dEFubm90YXRpb24gIT09IFwic3RyaW5nXCIgJiYgdGV4dEFubm90YXRpb24uJFBhdGggPyBkaXNwbGF5TW9kZSA6IFwiVmFsdWVcIjtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gT25seSBleHBsaWNpdCBkZWZpbmVkIFRleHRBcnJhbmdlbWVudHMgaW4gYSBWYWx1ZSBIZWxwIHdpdGggRGlhbG9nIGFyZSBjb25zaWRlcmVkXG5cdFx0XHRyZXR1cm4gdGV4dEFycmFuZ2VtZW50QW5ub3RhdGlvbiA/IGRpc3BsYXlNb2RlIDogXCJWYWx1ZVwiO1xuXHRcdH1cblx0fSxcblxuXHRfZ2V0V2lkdGhJblJlbTogZnVuY3Rpb24gKGNvbnRyb2w6IENvbnRyb2wsIGlzVW5pdFZhbHVlSGVscDogYm9vbGVhbik6IG51bWJlciB7XG5cdFx0bGV0IHdpZHRoID0gY29udHJvbC4kKCkud2lkdGgoKTsgLy8gSlF1ZXJ5XG5cdFx0aWYgKGlzVW5pdFZhbHVlSGVscCAmJiB3aWR0aCkge1xuXHRcdFx0d2lkdGggPSAwLjMgKiB3aWR0aDtcblx0XHR9XG5cdFx0Y29uc3QgZmxvYXRXaWR0aCA9IHdpZHRoID8gcGFyc2VGbG9hdChTdHJpbmcoUmVtLmZyb21QeCh3aWR0aCkpKSA6IDA7XG5cblx0XHRyZXR1cm4gaXNOYU4oZmxvYXRXaWR0aCkgPyAwIDogZmxvYXRXaWR0aDtcblx0fSxcblxuXHRnZXRUYWJsZVdpZHRoOiBmdW5jdGlvbiAodGFibGU6IFRhYmxlLCBtaW5XaWR0aDogbnVtYmVyKTogc3RyaW5nIHtcblx0XHRsZXQgd2lkdGg6IHN0cmluZztcblx0XHRjb25zdCBjb2x1bW5zID0gdGFibGUuZ2V0Q29sdW1ucygpLFxuXHRcdFx0dmlzaWJsZUNvbHVtbnMgPVxuXHRcdFx0XHQoY29sdW1ucyAmJlxuXHRcdFx0XHRcdGNvbHVtbnMuZmlsdGVyKGZ1bmN0aW9uIChjb2x1bW4pIHtcblx0XHRcdFx0XHRcdHJldHVybiBjb2x1bW4gJiYgY29sdW1uLmdldFZpc2libGUgJiYgY29sdW1uLmdldFZpc2libGUoKTtcblx0XHRcdFx0XHR9KSkgfHxcblx0XHRcdFx0W10sXG5cdFx0XHRzdW1XaWR0aCA9IHZpc2libGVDb2x1bW5zLnJlZHVjZShmdW5jdGlvbiAoc3VtLCBjb2x1bW4pIHtcblx0XHRcdFx0d2lkdGggPSBjb2x1bW4uZ2V0V2lkdGgoKTtcblx0XHRcdFx0aWYgKHdpZHRoICYmIHdpZHRoLmVuZHNXaXRoKFwicHhcIikpIHtcblx0XHRcdFx0XHR3aWR0aCA9IFN0cmluZyhSZW0uZnJvbVB4KHdpZHRoKSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y29uc3QgZmxvYXRXaWR0aCA9IHBhcnNlRmxvYXQod2lkdGgpO1xuXG5cdFx0XHRcdHJldHVybiBzdW0gKyAoaXNOYU4oZmxvYXRXaWR0aCkgPyA5IDogZmxvYXRXaWR0aCk7XG5cdFx0XHR9LCB2aXNpYmxlQ29sdW1ucy5sZW5ndGgpO1xuXHRcdHJldHVybiBgJHtNYXRoLm1heChzdW1XaWR0aCwgbWluV2lkdGgpfWVtYDtcblx0fSxcblxuXHRjcmVhdGVWYWx1ZUhlbHBUeXBlYWhlYWQ6IGZ1bmN0aW9uIChcblx0XHRwcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0XHR2YWx1ZUhlbHA6IFZhbHVlSGVscCxcblx0XHRjb250ZW50OiBNVGFibGUsXG5cdFx0dmFsdWVMaXN0SW5mbzogVmFsdWVMaXN0SW5mbyxcblx0XHRwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkXG5cdCk6IFByb21pc2U8YW55PiB7XG5cdFx0Y29uc3QgY29udGVudElkID0gY29udGVudC5nZXRJZCgpLFxuXHRcdFx0cHJvcGVydHlBbm5vdGF0aW9ucyA9IHZhbHVlSGVscC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChgJHtwcm9wZXJ0eVBhdGh9QGApIGFzIEFubm90YXRpb25zRm9yUHJvcGVydHksXG5cdFx0XHR2YWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMgPSBwcm9wZXJ0eUFubm90YXRpb25zW0Fubm90YXRpb25WYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXNdIHx8IGZhbHNlLFxuXHRcdFx0aXNEaWFsb2dUYWJsZSA9IGZhbHNlLFxuXHRcdFx0Y29sdW1uSW5mbyA9IFZhbHVlTGlzdEhlbHBlckNvbW1vbi5nZXRDb2x1bW5WaXNpYmlsaXR5SW5mbyhcblx0XHRcdFx0dmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvLFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdHZhbHVlSGVscFdpdGhGaXhlZFZhbHVlcyxcblx0XHRcdFx0aXNEaWFsb2dUYWJsZVxuXHRcdFx0KSxcblx0XHRcdHNvdXJjZU1vZGVsID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdGlkOiBjb250ZW50SWQsXG5cdFx0XHRcdGdyb3VwSWQ6IHBheWxvYWQucmVxdWVzdEdyb3VwSWQgfHwgdW5kZWZpbmVkLFxuXHRcdFx0XHRiU3VnZ2VzdGlvbjogdHJ1ZSxcblx0XHRcdFx0cHJvcGVydHlQYXRoOiBwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdGNvbHVtbkluZm86IGNvbHVtbkluZm8sXG5cdFx0XHRcdHZhbHVlSGVscFdpdGhGaXhlZFZhbHVlczogdmFsdWVIZWxwV2l0aEZpeGVkVmFsdWVzXG5cdFx0XHR9KTtcblxuXHRcdGNvbnRlbnQuc2V0S2V5UGF0aCh2YWx1ZUxpc3RJbmZvLmtleVZhbHVlKTtcblx0XHRjb250ZW50LnNldERlc2NyaXB0aW9uUGF0aCh2YWx1ZUxpc3RJbmZvLmRlc2NyaXB0aW9uVmFsdWUpO1xuXHRcdHBheWxvYWQuaXNWYWx1ZUxpc3RXaXRoRml4ZWRWYWx1ZXMgPSB2YWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXM7XG5cblx0XHRjb25zdCBjb2xsZWN0aW9uQW5ub3RhdGlvbnMgPSAodmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvLiRtb2RlbFxuXHRcdFx0LmdldE1ldGFNb2RlbCgpXG5cdFx0XHQuZ2V0T2JqZWN0KGAvJHt2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uQ29sbGVjdGlvblBhdGh9QGApIHx8IHt9KSBhcyBBbm5vdGF0aW9uc0ZvckNvbGxlY3Rpb247XG5cblx0XHRjb250ZW50LnNldEZpbHRlckZpZWxkcyhWYWx1ZUxpc3RIZWxwZXIuZW50aXR5SXNTZWFyY2hhYmxlKHByb3BlcnR5QW5ub3RhdGlvbnMsIGNvbGxlY3Rpb25Bbm5vdGF0aW9ucykgPyBcIiRzZWFyY2hcIiA6IFwiXCIpO1xuXG5cdFx0Y29uc3QgdGFibGVPclByb21pc2UgPVxuXHRcdFx0Y29udGVudC5nZXRUYWJsZSgpIHx8XG5cdFx0XHRWYWx1ZUxpc3RIZWxwZXIuX3RlbXBsYXRlRnJhZ21lbnQoXCJzYXAuZmUubWFjcm9zLmludGVybmFsLnZhbHVlaGVscC5WYWx1ZUxpc3RUYWJsZVwiLCB2YWx1ZUxpc3RJbmZvLCBzb3VyY2VNb2RlbCwgcHJvcGVydHlQYXRoKTtcblxuXHRcdHJldHVybiBQcm9taXNlLmFsbChbdGFibGVPclByb21pc2VdKS50aGVuKGZ1bmN0aW9uIChjb250cm9scykge1xuXHRcdFx0Y29uc3QgdGFibGUgPSBjb250cm9sc1swXTtcblxuXHRcdFx0dGFibGUuc2V0TW9kZWwodmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvLiRtb2RlbCk7XG5cblx0XHRcdExvZy5pbmZvKGBWYWx1ZSBMaXN0LSBzdWdnZXN0IFRhYmxlIFhNTCBjb250ZW50IGNyZWF0ZWQgWyR7cHJvcGVydHlQYXRofV1gLCB0YWJsZS5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSwgXCJNREMgVGVtcGxhdGluZ1wiKTtcblxuXHRcdFx0Y29udGVudC5zZXRUYWJsZSh0YWJsZSk7XG5cblx0XHRcdGNvbnN0IGZpZWxkID0gdmFsdWVIZWxwLmdldENvbnRyb2woKTtcblx0XHRcdGlmIChcblx0XHRcdFx0ZmllbGQgJiZcblx0XHRcdFx0KGZpZWxkLmlzQShcInNhcC51aS5tZGMuRmlsdGVyRmllbGRcIikgfHwgZmllbGQuaXNBKFwic2FwLnVpLm1kYy5GaWVsZFwiKSB8fCBmaWVsZC5pc0EoXCJzYXAudWkubWRjLk11bHRpVmFsdWVGaWVsZFwiKSlcblx0XHRcdCkge1xuXHRcdFx0XHQvL0NhbiB0aGUgZmlsdGVyZmllbGQgYmUgc29tZXRoaW5nIGVsc2UgdGhhdCB3ZSBuZWVkIHRoZSAuaXNBKCkgY2hlY2s/XG5cdFx0XHRcdGNvbnN0IHJlZHVjZVdpZHRoRm9yVW5pdFZhbHVlSGVscCA9IEJvb2xlYW4ocGF5bG9hZC5pc1VuaXRWYWx1ZUhlbHApO1xuXHRcdFx0XHRjb25zdCB0YWJsZVdpZHRoID0gVmFsdWVMaXN0SGVscGVyLmdldFRhYmxlV2lkdGgodGFibGUsIFZhbHVlTGlzdEhlbHBlci5fZ2V0V2lkdGhJblJlbShmaWVsZCwgcmVkdWNlV2lkdGhGb3JVbml0VmFsdWVIZWxwKSk7XG5cdFx0XHRcdHRhYmxlLnNldFdpZHRoKHRhYmxlV2lkdGgpO1xuXG5cdFx0XHRcdGlmICh2YWx1ZUhlbHBXaXRoRml4ZWRWYWx1ZXMpIHtcblx0XHRcdFx0XHR0YWJsZS5zZXRNb2RlKChmaWVsZCBhcyBGaWVsZEJhc2UpLmdldE1heENvbmRpdGlvbnMoKSA9PT0gMSA/IFwiU2luZ2xlU2VsZWN0TWFzdGVyXCIgOiBcIk11bHRpU2VsZWN0XCIpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdHRhYmxlLnNldE1vZGUoXCJTaW5nbGVTZWxlY3RNYXN0ZXJcIik7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9KTtcblx0fSxcblxuXHRjcmVhdGVWYWx1ZUhlbHBEaWFsb2c6IGZ1bmN0aW9uIChcblx0XHRwcm9wZXJ0eVBhdGg6IHN0cmluZyxcblx0XHR2YWx1ZUhlbHA6IFZhbHVlSGVscCxcblx0XHRjb250ZW50OiBNRENUYWJsZSxcblx0XHR2YWx1ZUxpc3RJbmZvOiBWYWx1ZUxpc3RJbmZvLFxuXHRcdHBheWxvYWQ6IFZhbHVlSGVscFBheWxvYWRcblx0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0Y29uc3QgcHJvcGVydHlBbm5vdGF0aW9ucyA9IHZhbHVlSGVscC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChgJHtwcm9wZXJ0eVBhdGh9QGApIGFzIEFubm90YXRpb25zRm9yUHJvcGVydHksXG5cdFx0XHRpc0Ryb3BEb3duTGlzdGUgPSBmYWxzZSxcblx0XHRcdGlzRGlhbG9nVGFibGUgPSB0cnVlLFxuXHRcdFx0Y29sdW1uSW5mbyA9IFZhbHVlTGlzdEhlbHBlckNvbW1vbi5nZXRDb2x1bW5WaXNpYmlsaXR5SW5mbyhcblx0XHRcdFx0dmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvLFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdGlzRHJvcERvd25MaXN0ZSxcblx0XHRcdFx0aXNEaWFsb2dUYWJsZVxuXHRcdFx0KSxcblx0XHRcdHNvdXJjZU1vZGVsID0gbmV3IEpTT05Nb2RlbCh7XG5cdFx0XHRcdGlkOiBjb250ZW50LmdldElkKCksXG5cdFx0XHRcdGdyb3VwSWQ6IHBheWxvYWQucmVxdWVzdEdyb3VwSWQgfHwgdW5kZWZpbmVkLFxuXHRcdFx0XHRiU3VnZ2VzdGlvbjogZmFsc2UsXG5cdFx0XHRcdGNvbHVtbkluZm86IGNvbHVtbkluZm8sXG5cdFx0XHRcdHZhbHVlSGVscFdpdGhGaXhlZFZhbHVlczogaXNEcm9wRG93bkxpc3RlXG5cdFx0XHR9KTtcblxuXHRcdGNvbnRlbnQuc2V0S2V5UGF0aCh2YWx1ZUxpc3RJbmZvLmtleVZhbHVlKTtcblx0XHRjb250ZW50LnNldERlc2NyaXB0aW9uUGF0aCh2YWx1ZUxpc3RJbmZvLmRlc2NyaXB0aW9uVmFsdWUpO1xuXG5cdFx0Y29uc3QgY29sbGVjdGlvbkFubm90YXRpb25zID0gKHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby4kbW9kZWxcblx0XHRcdC5nZXRNZXRhTW9kZWwoKVxuXHRcdFx0LmdldE9iamVjdChgLyR7dmFsdWVMaXN0SW5mby52YWx1ZUxpc3RJbmZvLkNvbGxlY3Rpb25QYXRofUBgKSB8fCB7fSkgYXMgQW5ub3RhdGlvbnNGb3JDb2xsZWN0aW9uO1xuXG5cdFx0Y29udGVudC5zZXRGaWx0ZXJGaWVsZHMoVmFsdWVMaXN0SGVscGVyLmVudGl0eUlzU2VhcmNoYWJsZShwcm9wZXJ0eUFubm90YXRpb25zLCBjb2xsZWN0aW9uQW5ub3RhdGlvbnMpID8gXCIkc2VhcmNoXCIgOiBcIlwiKTtcblxuXHRcdGNvbnN0IHRhYmxlT3JQcm9taXNlID1cblx0XHRcdGNvbnRlbnQuZ2V0VGFibGUoKSB8fFxuXHRcdFx0VmFsdWVMaXN0SGVscGVyLl90ZW1wbGF0ZUZyYWdtZW50KFxuXHRcdFx0XHRcInNhcC5mZS5tYWNyb3MuaW50ZXJuYWwudmFsdWVoZWxwLlZhbHVlTGlzdERpYWxvZ1RhYmxlXCIsXG5cdFx0XHRcdHZhbHVlTGlzdEluZm8sXG5cdFx0XHRcdHNvdXJjZU1vZGVsLFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGgsXG5cdFx0XHRcdHtcblx0XHRcdFx0XHRlbmFibGVBdXRvQ29sdW1uV2lkdGg6ICFzeXN0ZW0ucGhvbmVcblx0XHRcdFx0fVxuXHRcdFx0KTtcblxuXHRcdGNvbnN0IGZpbHRlckJhck9yUHJvbWlzZSA9XG5cdFx0XHRjb250ZW50LmdldEZpbHRlckJhcigpIHx8XG5cdFx0XHRWYWx1ZUxpc3RIZWxwZXIuX3RlbXBsYXRlRnJhZ21lbnQoXG5cdFx0XHRcdFwic2FwLmZlLm1hY3Jvcy5pbnRlcm5hbC52YWx1ZWhlbHAuVmFsdWVMaXN0RmlsdGVyQmFyXCIsXG5cdFx0XHRcdHZhbHVlTGlzdEluZm8sXG5cdFx0XHRcdHNvdXJjZU1vZGVsLFxuXHRcdFx0XHRwcm9wZXJ0eVBhdGhcblx0XHRcdCk7XG5cblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoW3RhYmxlT3JQcm9taXNlLCBmaWx0ZXJCYXJPclByb21pc2VdKS50aGVuKGZ1bmN0aW9uIChjb250cm9scykge1xuXHRcdFx0Y29uc3QgdGFibGUgPSBjb250cm9sc1swXSxcblx0XHRcdFx0ZmlsdGVyQmFyID0gY29udHJvbHNbMV07XG5cblx0XHRcdHRhYmxlLnNldE1vZGVsKHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby4kbW9kZWwpO1xuXHRcdFx0ZmlsdGVyQmFyLnNldE1vZGVsKHZhbHVlTGlzdEluZm8udmFsdWVMaXN0SW5mby4kbW9kZWwpO1xuXG5cdFx0XHRjb250ZW50LnNldEZpbHRlckJhcihmaWx0ZXJCYXIpO1xuXHRcdFx0Y29udGVudC5zZXRUYWJsZSh0YWJsZSk7XG5cblx0XHRcdHRhYmxlLnNldEZpbHRlcihmaWx0ZXJCYXIuZ2V0SWQoKSk7XG5cdFx0XHR0YWJsZS5pbml0aWFsaXplZCgpO1xuXG5cdFx0XHRjb25zdCBmaWVsZCA9IHZhbHVlSGVscC5nZXRDb250cm9sKCk7XG5cdFx0XHRpZiAoZmllbGQpIHtcblx0XHRcdFx0dGFibGUuc2V0U2VsZWN0aW9uTW9kZSgoZmllbGQgYXMgRmllbGRCYXNlKS5nZXRNYXhDb25kaXRpb25zKCkgPT09IDEgPyBcIlNpbmdsZVwiIDogXCJNdWx0aVwiKTtcblx0XHRcdH1cblx0XHRcdHRhYmxlLnNldFdpZHRoKFwiMTAwJVwiKTtcblxuXHRcdFx0Ly9UaGlzIGlzIGEgdGVtcG9yYXJ5IHdvcmthcnJvdW5kIC0gcHJvdmlkZWQgYnkgTURDIChzZWUgRklPUklURUNIUDEtMjQwMDIpXG5cdFx0XHRjb25zdCBtZGNUYWJsZSA9IHRhYmxlIGFzIGFueTtcblx0XHRcdG1kY1RhYmxlLl9zZXRTaG93UDEzbkJ1dHRvbihmYWxzZSk7XG5cdFx0fSk7XG5cdH0sXG5cblx0X2dldENvbnRlbnRCeUlkOiBmdW5jdGlvbiAoY29udGVudExpc3Q6IENvbnRlbnRbXSwgY29udGVudElkOiBzdHJpbmcpOiBDb250ZW50IHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gY29udGVudExpc3QuZmluZChmdW5jdGlvbiAoaXRlbSkge1xuXHRcdFx0cmV0dXJuIGl0ZW0uZ2V0SWQoKSA9PT0gY29udGVudElkO1xuXHRcdH0pO1xuXHR9LFxuXG5cdF9jcmVhdGVQb3BvdmVyQ29udGVudDogZnVuY3Rpb24gKGNvbnRlbnRJZDogc3RyaW5nLCBjYXNlU2Vuc2l0aXZlOiBib29sZWFuKSB7XG5cdFx0cmV0dXJuIG5ldyBNVGFibGUoe1xuXHRcdFx0aWQ6IGNvbnRlbnRJZCxcblx0XHRcdGdyb3VwOiBcImdyb3VwMVwiLFxuXHRcdFx0Y2FzZVNlbnNpdGl2ZTogY2FzZVNlbnNpdGl2ZVxuXHRcdH0gYXMgYW55KTsgLy9hcyAkTVRhYmxlU2V0dGluZ3Ncblx0fSxcblxuXHRfY3JlYXRlRGlhbG9nQ29udGVudDogZnVuY3Rpb24gKGNvbnRlbnRJZDogc3RyaW5nLCBjYXNlU2Vuc2l0aXZlOiBib29sZWFuLCBmb3JjZUJpbmQ6IGJvb2xlYW4pIHtcblx0XHRyZXR1cm4gbmV3IE1EQ1RhYmxlKHtcblx0XHRcdGlkOiBjb250ZW50SWQsXG5cdFx0XHRncm91cDogXCJncm91cDFcIixcblx0XHRcdGNhc2VTZW5zaXRpdmU6IGNhc2VTZW5zaXRpdmUsXG5cdFx0XHRmb3JjZUJpbmQ6IGZvcmNlQmluZFxuXHRcdH0gYXMgYW55KTsgLy9hcyAkTURDVGFibGVTZXR0aW5nc1xuXHR9LFxuXG5cdHNob3dWYWx1ZUxpc3Q6IGZ1bmN0aW9uIChwYXlsb2FkOiBWYWx1ZUhlbHBQYXlsb2FkLCBjb250YWluZXI6IENvbnRhaW5lciwgc2VsZWN0ZWRDb250ZW50SWQ6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuXHRcdGNvbnN0IHZhbHVlSGVscCA9IGNvbnRhaW5lci5nZXRQYXJlbnQoKSBhcyBWYWx1ZUhlbHAsXG5cdFx0XHRpc1R5cGVhaGVhZCA9IGNvbnRhaW5lci5pc1R5cGVhaGVhZCgpLFxuXHRcdFx0cHJvcGVydHlQYXRoID0gcGF5bG9hZC5wcm9wZXJ0eVBhdGgsXG5cdFx0XHRtZXRhTW9kZWwgPSB2YWx1ZUhlbHAuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCxcblx0XHRcdHZoVUlNb2RlbCA9ICh2YWx1ZUhlbHAuZ2V0TW9kZWwoXCJfVkhVSVwiKSBhcyBKU09OTW9kZWwpIHx8IFZhbHVlTGlzdEhlbHBlci5jcmVhdGVWSFVJTW9kZWwodmFsdWVIZWxwLCBwcm9wZXJ0eVBhdGgsIG1ldGFNb2RlbCksXG5cdFx0XHRzaG93Q29uZGl0aW9uUGFuZWwgPSB2YWx1ZUhlbHAuZGF0YShcInNob3dDb25kaXRpb25QYW5lbFwiKSAmJiB2YWx1ZUhlbHAuZGF0YShcInNob3dDb25kaXRpb25QYW5lbFwiKSAhPT0gXCJmYWxzZVwiO1xuXG5cdFx0aWYgKCFwYXlsb2FkLnF1YWxpZmllcnMpIHtcblx0XHRcdHBheWxvYWQucXVhbGlmaWVycyA9IHt9O1xuXHRcdH1cblxuXHRcdHZoVUlNb2RlbC5zZXRQcm9wZXJ0eShcIi9pc1N1Z2dlc3Rpb25cIiwgaXNUeXBlYWhlYWQpO1xuXHRcdHZoVUlNb2RlbC5zZXRQcm9wZXJ0eShcIi9taW5TY3JlZW5XaWR0aFwiLCAhaXNUeXBlYWhlYWQgPyBcIjQxOHB4XCIgOiB1bmRlZmluZWQpO1xuXG5cdFx0cmV0dXJuIFZhbHVlTGlzdEhlbHBlci5nZXRWYWx1ZUxpc3RJbmZvKHZhbHVlSGVscCwgcHJvcGVydHlQYXRoLCBwYXlsb2FkKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHZhbHVlTGlzdEluZm9zKSB7XG5cdFx0XHRcdGNvbnN0IGNhc2VTZW5zaXRpdmUgPSB2YWx1ZUhlbHAuZ2V0VHlwZWFoZWFkKCkuZ2V0Q29udGVudCgpWzBdLmdldENhc2VTZW5zaXRpdmUoKTsgLy8gdGFrZSBjYXNlU2Vuc2l0aXZlIGZyb20gZmlyc3QgVHlwZWFoZWFkIGNvbnRlbnRcblx0XHRcdFx0bGV0IGNvbnRlbnRMaXN0ID0gY29udGFpbmVyLmdldENvbnRlbnQoKTtcblxuXHRcdFx0XHRpZiAoaXNUeXBlYWhlYWQpIHtcblx0XHRcdFx0XHRsZXQgcXVhbGlmaWVyRm9yVHlwZWFoZWFkID0gdmFsdWVIZWxwLmRhdGEoXCJ2YWx1ZWxpc3RGb3JWYWxpZGF0aW9uXCIpIHx8IFwiXCI7IC8vIGNhbiBhbHNvIGJlIG51bGxcblx0XHRcdFx0XHRpZiAocXVhbGlmaWVyRm9yVHlwZWFoZWFkID09PSBcIiBcIikge1xuXHRcdFx0XHRcdFx0cXVhbGlmaWVyRm9yVHlwZWFoZWFkID0gXCJcIjtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29uc3QgdmFsdWVMaXN0SW5mbyA9IHF1YWxpZmllckZvclR5cGVhaGVhZFxuXHRcdFx0XHRcdFx0PyB2YWx1ZUxpc3RJbmZvcy5maWx0ZXIoZnVuY3Rpb24gKHN1YlZhbHVlTGlzdEluZm8pIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gc3ViVmFsdWVMaXN0SW5mby52YWx1ZUhlbHBRdWFsaWZpZXIgPT09IHF1YWxpZmllckZvclR5cGVhaGVhZDtcblx0XHRcdFx0XHRcdCAgfSlbMF1cblx0XHRcdFx0XHRcdDogdmFsdWVMaXN0SW5mb3NbMF07XG5cblx0XHRcdFx0XHRWYWx1ZUxpc3RIZWxwZXIuX2FkZEluT3V0UGFyYW1ldGVyc1RvUGF5bG9hZChwYXlsb2FkLCB2YWx1ZUxpc3RJbmZvKTtcblxuXHRcdFx0XHRcdGNvbnN0IGNvbnRlbnRJZCA9IFZhbHVlTGlzdEhlbHBlci5fZ2V0Q29udGVudElkKHZhbHVlSGVscC5nZXRJZCgpLCB2YWx1ZUxpc3RJbmZvLnZhbHVlSGVscFF1YWxpZmllciwgaXNUeXBlYWhlYWQpO1xuXHRcdFx0XHRcdGxldCBjb250ZW50ID0gVmFsdWVMaXN0SGVscGVyLl9nZXRDb250ZW50QnlJZChjb250ZW50TGlzdCwgY29udGVudElkKTtcblxuXHRcdFx0XHRcdGlmICghY29udGVudCkge1xuXHRcdFx0XHRcdFx0Y29udGVudCA9IFZhbHVlTGlzdEhlbHBlci5fY3JlYXRlUG9wb3ZlckNvbnRlbnQoY29udGVudElkLCBjYXNlU2Vuc2l0aXZlKTtcblxuXHRcdFx0XHRcdFx0Y29udGFpbmVyLmluc2VydENvbnRlbnQoY29udGVudCwgMCk7IC8vIGluc2VydCBjb250ZW50IGFzIGZpcnN0IGNvbnRlbnRcblx0XHRcdFx0XHRcdGNvbnRlbnRMaXN0ID0gY29udGFpbmVyLmdldENvbnRlbnQoKTtcblx0XHRcdFx0XHR9IGVsc2UgaWYgKGNvbnRlbnRJZCAhPT0gY29udGVudExpc3RbMF0uZ2V0SWQoKSkge1xuXHRcdFx0XHRcdFx0Ly8gY29udGVudCBhbHJlYWR5IGF2YWlsYWJsZSBidXQgbm90IGFzIGZpcnN0IGNvbnRlbnQ/XG5cdFx0XHRcdFx0XHRjb250YWluZXIucmVtb3ZlQ29udGVudChjb250ZW50KTtcblx0XHRcdFx0XHRcdGNvbnRhaW5lci5pbnNlcnRDb250ZW50KGNvbnRlbnQsIDApOyAvLyBtb3ZlIGNvbnRlbnQgdG8gZmlyc3QgcG9zaXRpb25cblx0XHRcdFx0XHRcdGNvbnRlbnRMaXN0ID0gY29udGFpbmVyLmdldENvbnRlbnQoKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRwYXlsb2FkLnZhbHVlSGVscFF1YWxpZmllciA9IHZhbHVlTGlzdEluZm8udmFsdWVIZWxwUXVhbGlmaWVyO1xuXG5cdFx0XHRcdFx0Y29udGVudC5zZXRUaXRsZSh2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uTGFiZWwpO1xuXG5cdFx0XHRcdFx0cmV0dXJuIFZhbHVlTGlzdEhlbHBlci5jcmVhdGVWYWx1ZUhlbHBUeXBlYWhlYWQocHJvcGVydHlQYXRoLCB2YWx1ZUhlbHAsIGNvbnRlbnQgYXMgTVRhYmxlLCB2YWx1ZUxpc3RJbmZvLCBwYXlsb2FkKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQvLyBEaWFsb2dcblxuXHRcdFx0XHRcdC8vIHNldCBhbGwgY29udGVudHMgdG8gaW52aXNpYmxlXG5cdFx0XHRcdFx0Zm9yIChsZXQgaSA9IDA7IGkgPCBjb250ZW50TGlzdC5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdFx0Y29udGVudExpc3RbaV0uc2V0VmlzaWJsZShmYWxzZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGlmIChzaG93Q29uZGl0aW9uUGFuZWwpIHtcblx0XHRcdFx0XHRcdGxldCBjb25kaXRpb25zQ29udGVudCA9XG5cdFx0XHRcdFx0XHRcdGNvbnRlbnRMaXN0Lmxlbmd0aCAmJlxuXHRcdFx0XHRcdFx0XHRjb250ZW50TGlzdFtjb250ZW50TGlzdC5sZW5ndGggLSAxXS5nZXRNZXRhZGF0YSgpLmdldE5hbWUoKSA9PT0gXCJzYXAudWkubWRjLnZhbHVlaGVscC5jb250ZW50LkNvbmRpdGlvbnNcIlxuXHRcdFx0XHRcdFx0XHRcdD8gY29udGVudExpc3RbY29udGVudExpc3QubGVuZ3RoIC0gMV1cblx0XHRcdFx0XHRcdFx0XHQ6IHVuZGVmaW5lZDtcblxuXHRcdFx0XHRcdFx0aWYgKGNvbmRpdGlvbnNDb250ZW50KSB7XG5cdFx0XHRcdFx0XHRcdGNvbmRpdGlvbnNDb250ZW50LnNldFZpc2libGUodHJ1ZSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjb25kaXRpb25zQ29udGVudCA9IG5ldyBDb25kaXRpb25zKCk7XG5cdFx0XHRcdFx0XHRcdGNvbnRhaW5lci5hZGRDb250ZW50KGNvbmRpdGlvbnNDb250ZW50KTtcblx0XHRcdFx0XHRcdFx0Y29udGVudExpc3QgPSBjb250YWluZXIuZ2V0Q29udGVudCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGxldCBzZWxlY3RlZEluZm86IFZhbHVlTGlzdEluZm8gfCB1bmRlZmluZWQsIHNlbGVjdGVkQ29udGVudDogQ29udGVudCB8IHVuZGVmaW5lZDtcblxuXHRcdFx0XHRcdC8vIENyZWF0ZSBvciByZXVzZSBjb250ZW50cyBmb3IgdGhlIGN1cnJlbnQgY29udGV4dFxuXHRcdFx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgdmFsdWVMaXN0SW5mb3MubGVuZ3RoOyBpICs9IDEpIHtcblx0XHRcdFx0XHRcdGNvbnN0IHZhbHVlTGlzdEluZm8gPSB2YWx1ZUxpc3RJbmZvc1tpXSxcblx0XHRcdFx0XHRcdFx0dmFsdWVIZWxwUXVhbGlmaWVyID0gdmFsdWVMaXN0SW5mby52YWx1ZUhlbHBRdWFsaWZpZXI7XG5cblx0XHRcdFx0XHRcdFZhbHVlTGlzdEhlbHBlci5fYWRkSW5PdXRQYXJhbWV0ZXJzVG9QYXlsb2FkKHBheWxvYWQsIHZhbHVlTGlzdEluZm8pO1xuXG5cdFx0XHRcdFx0XHRjb25zdCBjb250ZW50SWQgPSBWYWx1ZUxpc3RIZWxwZXIuX2dldENvbnRlbnRJZCh2YWx1ZUhlbHAuZ2V0SWQoKSwgdmFsdWVIZWxwUXVhbGlmaWVyLCBpc1R5cGVhaGVhZCk7XG5cdFx0XHRcdFx0XHRsZXQgY29udGVudCA9IFZhbHVlTGlzdEhlbHBlci5fZ2V0Q29udGVudEJ5SWQoY29udGVudExpc3QsIGNvbnRlbnRJZCk7XG5cblx0XHRcdFx0XHRcdGlmICghY29udGVudCkge1xuXHRcdFx0XHRcdFx0XHRjb25zdCBmb3JjZUJpbmQgPSB2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uRmV0Y2hWYWx1ZXMgPT0gMiA/IGZhbHNlIDogdHJ1ZTtcblxuXHRcdFx0XHRcdFx0XHRjb250ZW50ID0gVmFsdWVMaXN0SGVscGVyLl9jcmVhdGVEaWFsb2dDb250ZW50KGNvbnRlbnRJZCwgY2FzZVNlbnNpdGl2ZSwgZm9yY2VCaW5kKTtcblxuXHRcdFx0XHRcdFx0XHRpZiAoIXNob3dDb25kaXRpb25QYW5lbCkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnRhaW5lci5hZGRDb250ZW50KGNvbnRlbnQpO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGNvbnRhaW5lci5pbnNlcnRDb250ZW50KGNvbnRlbnQsIGNvbnRlbnRMaXN0Lmxlbmd0aCAtIDEpOyAvLyBpbnNlcnQgY29udGVudCBiZWZvcmUgY29uZGl0aW9ucyBjb250ZW50XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Y29udGVudExpc3QgPSBjb250YWluZXIuZ2V0Q29udGVudCgpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29udGVudC5zZXRWaXNpYmxlKHRydWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0Y29udGVudC5zZXRUaXRsZSh2YWx1ZUxpc3RJbmZvLnZhbHVlTGlzdEluZm8uTGFiZWwpO1xuXG5cdFx0XHRcdFx0XHRpZiAoIXNlbGVjdGVkQ29udGVudCB8fCAoc2VsZWN0ZWRDb250ZW50SWQgJiYgc2VsZWN0ZWRDb250ZW50SWQgPT09IGNvbnRlbnRJZCkpIHtcblx0XHRcdFx0XHRcdFx0c2VsZWN0ZWRDb250ZW50ID0gY29udGVudDtcblx0XHRcdFx0XHRcdFx0c2VsZWN0ZWRJbmZvID0gdmFsdWVMaXN0SW5mbztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRpZiAoIXNlbGVjdGVkSW5mbyB8fCAhc2VsZWN0ZWRDb250ZW50KSB7XG5cdFx0XHRcdFx0XHR0aHJvdyBuZXcgRXJyb3IoXCJzZWxlY3RlZEluZm8gb3Igc2VsZWN0ZWRDb250ZW50IHVuZGVmaW5lZFwiKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRwYXlsb2FkLnZhbHVlSGVscFF1YWxpZmllciA9IHNlbGVjdGVkSW5mby52YWx1ZUhlbHBRdWFsaWZpZXI7XG5cdFx0XHRcdFx0Y29udGFpbmVyLnNldFRpdGxlKHNlbGVjdGVkSW5mby52YWx1ZUxpc3RJbmZvLkxhYmVsKTtcblxuXHRcdFx0XHRcdHJldHVybiBWYWx1ZUxpc3RIZWxwZXIuY3JlYXRlVmFsdWVIZWxwRGlhbG9nKFxuXHRcdFx0XHRcdFx0cHJvcGVydHlQYXRoLFxuXHRcdFx0XHRcdFx0dmFsdWVIZWxwLFxuXHRcdFx0XHRcdFx0c2VsZWN0ZWRDb250ZW50IGFzIE1EQ1RhYmxlLFxuXHRcdFx0XHRcdFx0c2VsZWN0ZWRJbmZvLFxuXHRcdFx0XHRcdFx0cGF5bG9hZFxuXHRcdFx0XHRcdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycjogRXJyb3IpIHtcblx0XHRcdFx0Y29uc3QgZXJyU3RhdHVzID0gKGVyciBhcyBhbnkpLnN0YXR1cyxcblx0XHRcdFx0XHRtc2cgPVxuXHRcdFx0XHRcdFx0ZXJyU3RhdHVzICYmIGVyclN0YXR1cyA9PT0gNDA0XG5cdFx0XHRcdFx0XHRcdD8gYE1ldGFkYXRhIG5vdCBmb3VuZCAoJHtlcnJTdGF0dXN9KSBmb3IgdmFsdWUgaGVscCBvZiBwcm9wZXJ0eSAke3Byb3BlcnR5UGF0aH1gXG5cdFx0XHRcdFx0XHRcdDogZXJyLm1lc3NhZ2U7XG5cdFx0XHRcdExvZy5lcnJvcihtc2cpO1xuXHRcdFx0XHRWYWx1ZUxpc3RIZWxwZXIuZGVzdHJveVZIQ29udGVudCh2YWx1ZUhlbHApO1xuXHRcdFx0fSk7XG5cdH1cbn07XG5cbmV4cG9ydCBkZWZhdWx0IFZhbHVlTGlzdEhlbHBlcjtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7OztFQWtqQk8sZ0JBQWdCQSxJQUFJLEVBQUVDLE9BQU8sRUFBRTtJQUNyQyxJQUFJO01BQ0gsSUFBSUMsTUFBTSxHQUFHRixJQUFJLEVBQUU7SUFDcEIsQ0FBQyxDQUFDLE9BQU1HLENBQUMsRUFBRTtNQUNWLE9BQU9GLE9BQU8sQ0FBQ0UsQ0FBQyxDQUFDO0lBQ2xCO0lBQ0EsSUFBSUQsTUFBTSxJQUFJQSxNQUFNLENBQUNFLElBQUksRUFBRTtNQUMxQixPQUFPRixNQUFNLENBQUNFLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRUgsT0FBTyxDQUFDO0lBQ3BDO0lBQ0EsT0FBT0MsTUFBTTtFQUNkO0VBcmlCQTtFQUNBO0VBQ0E7RUFDQTs7RUFFQSxJQUFNRyxlQUFlLEdBQUcsdUNBQXVDO0lBQzlEQyxjQUFjLEdBQUcsc0NBQXNDO0lBQ3ZEQywrQkFBK0IsR0FBRyxpRkFBaUY7SUFDbkhDLDhCQUE4QixHQUFHLHFEQUFxRDtJQUN0RkMsb0NBQW9DLEdBQUcsMkRBQTJEO0lBQ2xHQywrQkFBK0IsR0FBRyxzREFBc0Q7SUFDeEZDLGlDQUFpQyxHQUFHLHdEQUF3RDtJQUM1RkMsa0NBQWtDLEdBQUcsMERBQTBEO0VBdUhoRyxJQUFNQyxlQUFlLEdBQUc7SUFDdkJDLGtCQUFrQixFQUFFLFVBQVVDLG1CQUEyQyxFQUFFQyxxQkFBK0MsRUFBVztNQUFBO01BQ3BJLElBQU1DLGVBQWUsNEJBQUdGLG1CQUFtQixDQUFDLDJDQUEyQyxDQUFDLDBEQUFoRSxzQkFBa0VHLGVBQWU7UUFDeEdDLFVBQVUsNEJBQUdILHFCQUFxQixDQUFDLCtDQUErQyxDQUFDLDBEQUF0RSxzQkFBd0VJLFVBQVU7TUFFaEcsSUFDRUQsVUFBVSxLQUFLRSxTQUFTLElBQUlKLGVBQWUsS0FBSyxLQUFLLElBQ3JERSxVQUFVLEtBQUssSUFBSSxJQUFJRixlQUFlLEtBQUssS0FBTSxJQUNsREUsVUFBVSxLQUFLLEtBQUssRUFDbkI7UUFDRCxPQUFPLEtBQUs7TUFDYjtNQUNBLE9BQU8sSUFBSTtJQUNaLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUNDRyxpQkFBaUIsRUFBRSxVQUFVQyxTQUF5QixFQUFFQyxTQUFpQixFQUFFQyxZQUFvQixFQUFVO01BQ3hHO01BQ0EsSUFBTUMsS0FBSyxHQUFHRCxZQUFZLENBQUNFLEtBQUssQ0FBQyxHQUFHLENBQUM7TUFDckMsSUFBSUMsYUFBYSxHQUFHLEVBQUU7UUFDckJDLFdBQStCO01BRWhDLE9BQU9ILEtBQUssQ0FBQ0ksTUFBTSxFQUFFO1FBQ3BCLElBQUlDLElBQUksR0FBR0wsS0FBSyxDQUFDTSxLQUFLLEVBQVk7UUFDbENILFdBQVcsR0FBR0EsV0FBVyxhQUFNQSxXQUFXLGNBQUlFLElBQUksSUFBS0EsSUFBSTtRQUMzRCxJQUFNRSxRQUFRLEdBQUdWLFNBQVMsQ0FBQ1csU0FBUyxXQUFJVixTQUFTLGNBQUlLLFdBQVcsRUFBZTtRQUMvRSxJQUFJSSxRQUFRLElBQUlBLFFBQVEsQ0FBQ0UsS0FBSyxLQUFLLG9CQUFvQixJQUFJRixRQUFRLENBQUNHLGFBQWEsRUFBRTtVQUNsRkwsSUFBSSxJQUFJLEdBQUc7UUFDWjtRQUNBSCxhQUFhLEdBQUdBLGFBQWEsYUFBTUEsYUFBYSxjQUFJRyxJQUFJLElBQUtBLElBQUk7TUFDbEU7TUFDQSxPQUFPSCxhQUFhO0lBQ3JCLENBQUM7SUFFRDtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0lBQ0NTLHVDQUF1QyxFQUFFLFVBQVVkLFNBQXlCLEVBQUVDLFNBQWlCLEVBQWU7TUFDN0csSUFBTWMsVUFBdUIsR0FBRyxFQUFFO1FBQ2pDO1FBQ0FDLHFCQUFxQixHQUFHaEIsU0FBUyxDQUFDVyxTQUFTLFdBQUlWLFNBQVMsUUFBaUM7UUFDekZnQixlQUFlLEdBQUdELHFCQUFxQixDQUFDLDZDQUE2QyxDQUFDO01BRXZGLElBQUlDLGVBQWUsRUFBRTtRQUNwQkEsZUFBZSxDQUFDQyxPQUFPLENBQUMsVUFBVUMsY0FBYyxFQUFFO1VBQ2pELElBQU1DLGtCQUFrQixhQUFNbkIsU0FBUyxjQUFJa0IsY0FBYyxDQUFDRSxhQUFhLENBQUU7WUFDeEVoQixhQUFhLEdBQUdmLGVBQWUsQ0FBQ1MsaUJBQWlCLENBQUNDLFNBQVMsRUFBRUMsU0FBUyxFQUFFa0IsY0FBYyxDQUFDRSxhQUFhLENBQUM7WUFDckc3QixtQkFBbUIsR0FBR1EsU0FBUyxDQUFDVyxTQUFTLFdBQUlTLGtCQUFrQixPQUE4QjtZQUM3RkUsU0FBUyxHQUFHO2NBQ1hDLElBQUksRUFBRWxCLGFBQWE7Y0FDbkJtQixLQUFLLEVBQUVoQyxtQkFBbUIsQ0FBQ1YsZUFBZSxDQUFDLElBQUlzQyxrQkFBa0I7Y0FDakVLLFFBQVEsRUFBRSxJQUFJO2NBQ2RDLFVBQVUsRUFBRUMsV0FBVyxDQUFDQyxvQkFBb0IsQ0FBQzVCLFNBQVMsRUFBRUMsU0FBUyxFQUFFa0IsY0FBYyxDQUFDRSxhQUFhLEVBQUUsS0FBSyxDQUFDO2NBQ3ZHUSxLQUFLLEVBQUU3QixTQUFTLENBQUNXLFNBQVMsQ0FBQ1Msa0JBQWtCLENBQUMsQ0FBQ1M7WUFDaEQsQ0FBQztVQUNGZCxVQUFVLENBQUNlLElBQUksQ0FBQ1IsU0FBUyxDQUFDO1FBQzNCLENBQUMsQ0FBQztNQUNIO01BRUEsT0FBT1AsVUFBVTtJQUNsQixDQUFDO0lBRURnQixxQ0FBcUMsRUFBRSxVQUN0Q2hCLFVBQXVCLEVBQ3ZCaUIsYUFBc0MsRUFDdENDLGlCQUF5QixFQUN6QnZCLFFBQWtCLEVBQ2xCbEIsbUJBQTJDLEVBQ3BDO01BQUE7TUFDUCxJQUFJMEMsVUFBVSxHQUFHRCxpQkFBaUI7UUFDakNFLGtCQUFrQixHQUFHekIsUUFBUSxDQUFDbUIsS0FBSztNQUNwQyxJQUFNTCxLQUFLLEdBQUdoQyxtQkFBbUIsQ0FBQ1YsZUFBZSxDQUFDLElBQUlvRCxVQUFVO1FBQy9ERSxjQUFjLEdBQUc1QyxtQkFBbUIsQ0FBQ1QsY0FBYyxDQUFDO01BRXJELElBQ0NxRCxjQUFjLElBQ2QsMkJBQUE1QyxtQkFBbUIsQ0FBQ1IsK0JBQStCLENBQUMsMkRBQXBELHVCQUFzRHFELFdBQVcsTUFBSyx5REFBeUQsRUFDOUg7UUFDRDtRQUNBSCxVQUFVLEdBQUdFLGNBQWMsQ0FBQ0UsS0FBSztRQUNqQyxJQUFNQyxnQkFBZ0IsY0FBT1AsYUFBYSxDQUFDUSxjQUFjLGNBQUlOLFVBQVUsQ0FBRTtRQUN6RUMsa0JBQWtCLEdBQUdILGFBQWEsQ0FBQ1MsTUFBTSxDQUFDQyxZQUFZLEVBQUUsQ0FBQy9CLFNBQVMsQ0FBQzRCLGdCQUFnQixDQUFDLENBQUNWLEtBQWU7TUFDckc7TUFFQSxJQUFNYyx1QkFBdUIsR0FDNUI1QixVQUFVLENBQUM2QixTQUFTLENBQUMsVUFBVUMsR0FBRyxFQUFFO1FBQ25DLE9BQU9BLEdBQUcsQ0FBQ3RCLElBQUksS0FBS1csVUFBVTtNQUMvQixDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7TUFFVixJQUFJUyx1QkFBdUIsRUFBRTtRQUM1QixJQUFNckIsU0FBb0IsR0FBRztVQUM1QkMsSUFBSSxFQUFFVyxVQUFVO1VBQ2hCVixLQUFLLEVBQUVBLEtBQUs7VUFDWkMsUUFBUSxFQUFFLElBQUk7VUFDZEMsVUFBVSxFQUFFLENBQUNsQyxtQkFBbUIsQ0FBQywwQ0FBMEMsQ0FBQztVQUM1RXFDLEtBQUssRUFBRU07UUFDUixDQUFDO1FBQ0RwQixVQUFVLENBQUNlLElBQUksQ0FBQ1IsU0FBUyxDQUFDO01BQzNCO0lBQ0QsQ0FBQztJQUVEd0IscUJBQXFCLEVBQUUsVUFBVUMsWUFBOEIsRUFBRUMsVUFBb0IsRUFBRTtNQUN0RixPQUFPRCxZQUFZLENBQUNFLE1BQU0sQ0FBQyxVQUFVQyxTQUFTLEVBQUU7UUFDL0MsT0FBT0YsVUFBVSxDQUFDRyxPQUFPLENBQUNELFNBQVMsQ0FBQ0UsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO01BQ3ZELENBQUMsQ0FBQztJQUNILENBQUM7SUFFREMsZUFBZSxFQUFFLFVBQVVOLFlBQThCLEVBQUU7TUFDMUQsT0FBT3pELGVBQWUsQ0FBQ3dELHFCQUFxQixDQUFDQyxZQUFZLEVBQUUsQ0FDMUQ5RCw4QkFBOEIsRUFDOUJDLG9DQUFvQyxFQUNwQ0UsaUNBQWlDLENBQ2pDLENBQUM7SUFDSCxDQUFDO0lBRURrRSxnQkFBZ0IsRUFBRSxVQUFVUCxZQUE4QixFQUFFO01BQzNELE9BQU96RCxlQUFlLENBQUN3RCxxQkFBcUIsQ0FBQ0MsWUFBWSxFQUFFLENBQUM1RCwrQkFBK0IsRUFBRUMsaUNBQWlDLENBQUMsQ0FBQztJQUNqSSxDQUFDO0lBRURtRSxlQUFlLEVBQUUsVUFBVUMsU0FBb0IsRUFBRXRELFlBQW9CLEVBQUVGLFNBQXlCLEVBQWE7TUFDNUc7TUFDQSxJQUFNeUQsU0FBUyxHQUFHLElBQUlDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUNsQ2xFLG1CQUFtQixHQUFHUSxTQUFTLENBQUNXLFNBQVMsV0FBSVQsWUFBWSxPQUE4QjtNQUV4RnNELFNBQVMsQ0FBQ0csUUFBUSxDQUFDRixTQUFTLEVBQUUsT0FBTyxDQUFDO01BQ3RDO01BQ0FBLFNBQVMsQ0FBQ0csV0FBVyxDQUNwQixpQ0FBaUMsRUFDakMsQ0FBQyxDQUFDcEUsbUJBQW1CLENBQUMsNkRBQTZELENBQUMsQ0FDcEY7TUFDRCxPQUFPaUUsU0FBUztJQUNqQixDQUFDO0lBRURJLGdCQUFnQixFQUFFLFVBQVVMLFNBQW9CLEVBQVE7TUFDdkQsSUFBSUEsU0FBUyxDQUFDTSxTQUFTLEVBQUUsRUFBRTtRQUMxQk4sU0FBUyxDQUFDTSxTQUFTLEVBQUUsQ0FBQ0MsY0FBYyxFQUFFO01BQ3ZDO01BQ0EsSUFBSVAsU0FBUyxDQUFDUSxZQUFZLEVBQUUsRUFBRTtRQUM3QlIsU0FBUyxDQUFDUSxZQUFZLEVBQUUsQ0FBQ0QsY0FBYyxFQUFFO01BQzFDO0lBQ0QsQ0FBQztJQUVERSx3QkFBd0IsRUFBRSxVQUFVQyxVQUFvQixFQUFFO01BQ3pELElBQU1DLGNBQWMsR0FBR0QsVUFBVSxDQUFDZixPQUFPLENBQUMsRUFBRSxDQUFDOztNQUU3QztNQUNBLElBQUlnQixjQUFjLEdBQUcsQ0FBQyxFQUFFO1FBQ3ZCRCxVQUFVLENBQUNFLE9BQU8sQ0FBQ0YsVUFBVSxDQUFDQyxjQUFjLENBQUMsQ0FBQztRQUM5Q0QsVUFBVSxDQUFDRyxNQUFNLENBQUNGLGNBQWMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDO01BQ3pDO01BQ0EsT0FBT0QsVUFBVTtJQUNsQixDQUFDO0lBRURJLGdCQUFnQixZQUFrQmQsU0FBb0IsRUFBRXRELFlBQW9CLEVBQUVxRSxPQUF5QjtNQUFBLElBQTRCO1FBQUEsYUFZckcsSUFBSTtRQVhqQyxJQUFNQyxjQUFjLEdBQUdoQixTQUFTLENBQUNpQixpQkFBaUIsRUFBYTtVQUM5REMsY0FBYyxHQUFHSCxPQUFPLENBQUNHLGNBQWM7VUFDdkNDLFdBQVcsR0FBR25CLFNBQVMsQ0FBQ29CLFFBQVEsRUFBRSxDQUFDbEMsWUFBWSxFQUFvQjtVQUNuRW1DLGNBQStCLEdBQUcsRUFBRTtRQUFDLGdDQUVsQztVQUFBLHVCQUNpQ0YsV0FBVyxDQUFDRyxvQkFBb0IsQ0FDbkU1RSxZQUFZLEVBQ1osSUFBSSxFQUNKc0UsY0FBYyxDQUNkO1lBSkQsSUFBTU8sb0JBQW9CLHdCQUljO1lBQ3hDLElBQU1DLG1CQUFtQixHQUFHLE9BQUtmLHdCQUF3QixDQUFDZ0IsTUFBTSxDQUFDQyxJQUFJLENBQUNILG9CQUFvQixDQUFDLENBQUM7Y0FDM0ZJLFlBQVksR0FBR2pGLFlBQVksQ0FBQ0UsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDZ0YsR0FBRyxFQUFFO1lBRTdDLElBQUlDLGFBQWEsR0FBRyxFQUFFO1lBRXRCLElBQUlkLE9BQU8sQ0FBQ2Usa0JBQWtCLElBQUlkLGNBQWMsSUFBSUEsY0FBYyxDQUFDZSxPQUFPLEVBQUUsRUFBRTtjQUM3RSxJQUFNQyxtQkFBbUIsR0FBR2hCLGNBQWMsQ0FBQ2UsT0FBTyxFQUFFLENBQUNuRixLQUFLLENBQUMsR0FBRyxDQUFDO2NBQy9ELElBQU1xRixxQkFBcUIsR0FBR3ZGLFlBQVksQ0FBQ0UsS0FBSyxDQUFDLEdBQUcsQ0FBQztjQUNyRCxJQUFJcUYscUJBQXFCLENBQUNsRixNQUFNLEdBQUdpRixtQkFBbUIsQ0FBQ2pGLE1BQU0sR0FBRyxDQUFDLEVBQUU7Z0JBQ2xFLElBQU1tRixtQkFBbUIsR0FBRyxFQUFFO2dCQUM5QixLQUFLLElBQUlDLENBQUMsR0FBR0gsbUJBQW1CLENBQUNqRixNQUFNLEVBQUVvRixDQUFDLEdBQUdGLHFCQUFxQixDQUFDbEYsTUFBTSxHQUFHLENBQUMsRUFBRW9GLENBQUMsRUFBRSxFQUFFO2tCQUNuRkQsbUJBQW1CLENBQUM1RCxJQUFJLENBQUMyRCxxQkFBcUIsQ0FBQ0UsQ0FBQyxDQUFDLENBQUM7Z0JBQ25EO2dCQUNBTixhQUFhLGFBQU1LLG1CQUFtQixDQUFDRSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQUc7Y0FDcEQ7WUFDRDtZQUVBWixtQkFBbUIsQ0FBQzlELE9BQU8sQ0FBQyxVQUFVMkUsa0JBQWtCLEVBQUU7Y0FBQTtjQUN6RDtjQUNBLElBQU1DLHVCQUF1QixHQUFHZixvQkFBb0IsQ0FBQ2Msa0JBQWtCLENBQUM7Z0JBQ3ZFN0YsU0FBUyxHQUFHOEYsdUJBQXVCLENBQUNyRCxNQUFNLENBQUNDLFlBQVksRUFBRTtnQkFDekRxRCxhQUFhLGNBQU9ELHVCQUF1QixDQUFDdEQsY0FBYyxDQUFFO2dCQUM1RHpCLFVBQVUsR0FBR3pCLGVBQWUsQ0FBQ3dCLHVDQUF1QyxDQUFDZCxTQUFTLEVBQUUrRixhQUFhLENBQUM7Z0JBQzlGaEQsWUFBOEIsR0FBRyxFQUFFO2dCQUNuQ2lELE1BQWdCLEdBQUcsd0JBQUFoRyxTQUFTLENBQUNXLFNBQVMsQ0FBQ29GLGFBQWEsTUFBTSxDQUFDLGlEQUF4QyxxQkFBMENFLElBQUksc0JBQzFEakcsU0FBUyxDQUFDVyxTQUFTLENBQUNvRixhQUFhLE1BQU0sQ0FBQyxDQUFDRSxJQUFJLElBQ2pELEVBQUU7Y0FDTixJQUFJQyxpQkFBaUIsR0FBRyxFQUFFO2dCQUN6QkMsZUFBZSxHQUFHLEVBQUU7Z0JBQ3BCQyxHQUFHLEdBQUcsRUFBRTtjQUVUTix1QkFBdUIsQ0FBQ08sVUFBVSxDQUFDbkYsT0FBTyxDQUFDLFVBQVVnQyxTQUFTLEVBQUU7Z0JBQy9EO2dCQUNBLElBQU1vRCxhQUFhLGNBQU9SLHVCQUF1QixDQUFDdEQsY0FBYyxjQUFJVSxTQUFTLENBQUNxRCxpQkFBaUIsQ0FBRTtrQkFDaEc3RixRQUFRLEdBQUdWLFNBQVMsQ0FBQ1csU0FBUyxDQUFDMkYsYUFBYSxDQUFDO2tCQUM3QzlHLG1CQUFtQixHQUFJUSxTQUFTLENBQUNXLFNBQVMsV0FBSTJGLGFBQWEsT0FBSSxJQUFJLENBQUMsQ0FBNEI7O2dCQUVqRztnQkFDQTtnQkFDQSxJQUFJNUYsUUFBUSxFQUFFO2tCQUNiO2tCQUNBLElBQ0MsQ0FBQzBGLEdBQUcsS0FDSGxELFNBQVMsQ0FBQ3JCLEtBQUssS0FBSzFDLCtCQUErQixJQUNuRCtELFNBQVMsQ0FBQ3JCLEtBQUssS0FBS3pDLGlDQUFpQyxDQUFDLElBQ3ZEOEQsU0FBUyxDQUFDc0QsaUJBQWlCLENBQUNuRixhQUFhLEtBQUs4RCxZQUFZLEVBQ3pEO29CQUFBO29CQUNEZSxpQkFBaUIsR0FBR0ksYUFBYTtvQkFDakNGLEdBQUcsR0FBR2xELFNBQVMsQ0FBQ3FELGlCQUFpQjs7b0JBRWpDO29CQUNBSixlQUFlLEdBQUcsMkJBQUEzRyxtQkFBbUIsQ0FBQ1QsY0FBYyxDQUFDLDJEQUFuQyx1QkFBcUN1RCxLQUFLLEtBQUksRUFBRTtrQkFDbkU7a0JBRUEsSUFBTUwsaUJBQWlCLEdBQUdpQixTQUFTLENBQUNxRCxpQkFBaUI7a0JBQ3JEakgsZUFBZSxDQUFDeUMscUNBQXFDLENBQ3BEaEIsVUFBVSxFQUNWK0UsdUJBQXVCLEVBQ3ZCN0QsaUJBQWlCLEVBQ2pCdkIsUUFBUSxFQUNSbEIsbUJBQW1CLENBQ25CO2dCQUNGOztnQkFFQTtnQkFDQSxJQUNDLENBQUMwRCxTQUFTLENBQUNyQixLQUFLLEtBQUs1Qyw4QkFBOEIsSUFDbERpRSxTQUFTLENBQUNyQixLQUFLLEtBQUt6QyxpQ0FBaUMsSUFDckQ4RCxTQUFTLENBQUNyQixLQUFLLEtBQUsxQywrQkFBK0IsS0FDcEQrRCxTQUFTLENBQUNzRCxpQkFBaUIsQ0FBQ25GLGFBQWEsS0FBSzhELFlBQVksRUFDekQ7a0JBQ0QsSUFBSXNCLFNBQVMsR0FBRyxFQUFFO2tCQUNsQixJQUFJL0IsY0FBYyxJQUFJQSxjQUFjLENBQUNuRSxNQUFNLEdBQUcsQ0FBQyxFQUFFO29CQUNoRCxJQUNDaUQsU0FBUyxDQUFDa0QsU0FBUyxFQUFFLENBQUNDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUM3Q25ELFNBQVMsQ0FBQ2lCLGlCQUFpQixFQUFFLEtBQzVCdkIsU0FBUyxDQUFDckIsS0FBSyxLQUFLNUMsOEJBQThCLElBQ2xEaUUsU0FBUyxDQUFDckIsS0FBSyxLQUFLekMsaUNBQWlDLENBQUMsRUFDdEQ7c0JBQ0Q7c0JBQ0EsSUFBTWUsS0FBSyxHQUFHK0MsU0FBUyxDQUFDc0QsaUJBQWlCLENBQUNuRixhQUFhLENBQUNqQixLQUFLLENBQUMsR0FBRyxDQUFDO3NCQUNsRSxJQUFJRCxLQUFLLENBQUNJLE1BQU0sR0FBRyxDQUFDLEVBQUU7d0JBQ3JCLElBQU1xRyx1QkFBdUIsR0FBR3pHLEtBQUssQ0FBQyxDQUFDLENBQUM7d0JBQ3hDLElBQU0wRyxZQUFZLEdBQUdsQyxXQUFXLENBQUNtQyxjQUFjLENBQUN0QyxjQUFjLENBQUNlLE9BQU8sRUFBRSxDQUFDO3dCQUN6RSxJQUFNd0IsWUFBWSxHQUFJdkQsU0FBUyxDQUFDa0QsU0FBUyxFQUFFLENBQVNNLGFBQWEsRUFBRSxDQUFDekIsT0FBTyxFQUFFLENBQUMsQ0FBQzt3QkFDL0UsSUFBS3NCLFlBQVksQ0FBQ2xHLFNBQVMsV0FBSW9HLFlBQVksZUFBWSxLQUFhSCx1QkFBdUIsRUFBRTswQkFDNUY7MEJBQ0E7MEJBQ0FILFNBQVMsR0FBR3ZELFNBQVMsQ0FBQ3NELGlCQUFpQixDQUFDbkYsYUFBYSxDQUFDNEYsT0FBTyxDQUFDTCx1QkFBdUIsR0FBRyxHQUFHLEVBQUUsRUFBRSxDQUFDO3dCQUNqRztzQkFDRDtvQkFDRDtvQkFDQSxJQUFJLENBQUNILFNBQVMsRUFBRTtzQkFDZkEsU0FBUyxHQUFHL0IsY0FBYyxHQUFHLGVBQWUsR0FBR3hCLFNBQVMsQ0FBQ3NELGlCQUFpQixDQUFDbkYsYUFBYTtvQkFDekY7a0JBQ0QsQ0FBQyxNQUFNO29CQUNOb0YsU0FBUyxHQUFHcEIsYUFBYSxHQUFHbkMsU0FBUyxDQUFDc0QsaUJBQWlCLENBQUNuRixhQUFhO2tCQUN0RTtrQkFDQTBCLFlBQVksQ0FBQ2pCLElBQUksQ0FBQztvQkFDakJzQixZQUFZLEVBQUVGLFNBQVMsQ0FBQ3JCLEtBQUs7b0JBQzdCcUYsTUFBTSxFQUFFVCxTQUFTO29CQUNqQlUsUUFBUSxFQUFFakUsU0FBUyxDQUFDcUQsaUJBQWlCO29CQUNyQ2EsYUFBYSxFQUFFbEUsU0FBUyxDQUFDbUUsUUFBUTtvQkFDakNDLHVCQUF1QixFQUFFcEUsU0FBUyxDQUFDcUU7a0JBQ3BDLENBQUMsQ0FBQztnQkFDSDs7Z0JBRUE7Z0JBQ0EsSUFBSXJFLFNBQVMsQ0FBQ3JCLEtBQUssS0FBSzNDLG9DQUFvQyxFQUFFO2tCQUM3RDZELFlBQVksQ0FBQ2pCLElBQUksQ0FBQztvQkFDakJzQixZQUFZLEVBQUVGLFNBQVMsQ0FBQ3JCLEtBQUs7b0JBQzdCcUYsTUFBTSxFQUFFaEUsU0FBUyxDQUFDcUQsaUJBQWlCO29CQUNuQ1ksUUFBUSxFQUFFakUsU0FBUyxDQUFDcUQsaUJBQWlCO29CQUNyQ2EsYUFBYSxFQUFFbEUsU0FBUyxDQUFDbUUsUUFBUTtvQkFDakNDLHVCQUF1QixFQUFFcEUsU0FBUyxDQUFDcUU7a0JBQ3BDLENBQUMsQ0FBQztnQkFDSDtnQkFDQTtnQkFDQSxJQUNDLENBQUNyRSxTQUFTLENBQUNyQixLQUFLLEtBQUt6QyxpQ0FBaUMsSUFBSThELFNBQVMsQ0FBQ3JCLEtBQUssS0FBSzFDLCtCQUErQixLQUM3RyxDQUFDNkcsTUFBTSxDQUFDd0IsUUFBUSxDQUFDdEUsU0FBUyxDQUFDcUQsaUJBQWlCLENBQUMsRUFDNUM7a0JBQ0RQLE1BQU0sQ0FBQ2xFLElBQUksQ0FBQ29CLFNBQVMsQ0FBQ3FELGlCQUFpQixDQUFDO2dCQUN6QztjQUNELENBQUMsQ0FBQztjQUNGO2NBQUEsMkNBQ29CUCxNQUFNO2dCQUFBO2NBQUE7Z0JBQUE7a0JBQUEsSUFBZnlCLEtBQUs7a0JBQ2YsSUFDQzFHLFVBQVUsQ0FBQzZCLFNBQVMsQ0FBQyxVQUFVOEUsTUFBTSxFQUFFO29CQUN0QyxPQUFPQSxNQUFNLENBQUNuRyxJQUFJLEtBQUtrRyxLQUFLO2tCQUM3QixDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsRUFDUjtvQkFDRCxJQUFNbkcsU0FBb0IsR0FBRztzQkFDNUJDLElBQUksRUFBRWtHLEtBQUs7c0JBQ1g1RixLQUFLLEVBQUU3QixTQUFTLENBQUNXLFNBQVMsWUFBS21GLHVCQUF1QixDQUFDdEQsY0FBYyxjQUFJNEQsR0FBRyxFQUFHLENBQUN2RSxLQUFLO3NCQUNyRkwsS0FBSyxFQUFFLEVBQUU7c0JBQ1RDLFFBQVEsRUFBRSxLQUFLO3NCQUNmQyxVQUFVLEVBQUU1QjtvQkFDYixDQUFDO29CQUNEaUIsVUFBVSxDQUFDZSxJQUFJLENBQUNSLFNBQVMsQ0FBQztrQkFDM0I7Z0JBQUM7Z0JBZEYsb0RBQTRCO2tCQUFBO2dCQWU1QjtjQUFDO2dCQUFBO2NBQUE7Z0JBQUE7Y0FBQTtjQUVELElBQU1VLGFBQTRCLEdBQUc7Z0JBQ3BDMkYsUUFBUSxFQUFFdkIsR0FBRztnQkFDYndCLGdCQUFnQixFQUFFekIsZUFBZTtnQkFDakNELGlCQUFpQixFQUFFQSxpQkFBaUI7Z0JBQ3BDRixNQUFNLEVBQUVBLE1BQU07Z0JBQ2RqRCxZQUFZLEVBQUVBLFlBQVk7Z0JBQzFCZixhQUFhLEVBQUU4RCx1QkFBdUI7Z0JBQ3RDL0UsVUFBVSxFQUFFQSxVQUFVO2dCQUN0QjhFLGtCQUFrQixFQUFFQTtjQUNyQixDQUFDO2NBQ0RoQixjQUFjLENBQUMvQyxJQUFJLENBQUNFLGFBQWEsQ0FBQztZQUNuQyxDQUFDLENBQUM7VUFBQztRQUNKLENBQUMsWUFBUTZGLEdBQVEsRUFBRTtVQUNsQixJQUFNQyxTQUFTLEdBQUdELEdBQUcsQ0FBQ0UsTUFBTTtZQUMzQkMsR0FBRyxHQUNGRixTQUFTLElBQUlBLFNBQVMsS0FBSyxHQUFHLGlDQUNKQSxTQUFTLDBDQUFnQzVILFlBQVksSUFDNUUySCxHQUFHLENBQUNJLE9BQU87VUFDaEJDLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDSCxHQUFHLENBQUM7VUFDZDFJLGVBQWUsQ0FBQ3VFLGdCQUFnQixDQUFDTCxTQUFTLENBQUM7UUFDNUMsQ0FBQztRQUFBO1VBQ0QsT0FBT3FCLGNBQWM7UUFBQyxLQUFmQSxjQUFjO01BQ3RCLENBQUM7UUFBQTtNQUFBO0lBQUE7SUFFRHVELFlBQVksRUFBRXRJLFNBQWdCO0lBQzlCdUksV0FBVyxFQUFFdkksU0FBZ0I7SUFFN0J3SSxzQkFBc0IsRUFBRSxVQUFVcEksWUFBb0IsRUFBRXFJLFlBQW9CLEVBQUVDLGtCQUF1QixFQUFRO01BQzVHLElBQU1DLE9BQU8sR0FBRztRQUNmbEgsSUFBSSxFQUFFckIsWUFBWTtRQUNsQnFJLFlBQVksRUFBRUEsWUFBWTtRQUMxQkcsUUFBUSxFQUFFRjtNQUNYLENBQUM7TUFDRCxJQUFJTixHQUFHLENBQUNTLFFBQVEsRUFBRSxLQUFLQyxLQUFLLENBQUNDLEtBQUssRUFBRTtRQUNuQztRQUNBdkosZUFBZSxDQUFDOEksWUFBWSxHQUFHOUksZUFBZSxDQUFDOEksWUFBWSxJQUFJLEVBQUU7UUFDakU5SSxlQUFlLENBQUM4SSxZQUFZLENBQUN0RyxJQUFJLENBQUMyRyxPQUFPLENBQUM7TUFDM0M7TUFDQSxJQUFJbkosZUFBZSxDQUFDK0ksV0FBVyxFQUFFO1FBQ2hDO1FBQ0FTLFVBQVUsQ0FBQyxZQUFZO1VBQ3RCeEosZUFBZSxDQUFDK0ksV0FBVyxDQUFDSSxPQUFPLENBQUM7UUFDckMsQ0FBQyxFQUFFLENBQUMsQ0FBQztNQUNOO0lBQ0QsQ0FBQztJQUVETSxpQkFBaUIsWUFDaEJSLFlBQW9CLEVBQ3BCdkcsYUFBNEIsRUFDNUJnSCxXQUFzQixFQUN0QjlJLFlBQW9CLEVBQ3BCK0ksa0JBQXVDO01BQUEsSUFDckI7UUFDbEIsSUFBTUMsY0FBYyxHQUFHbEgsYUFBYSxDQUFDQSxhQUFhO1VBQ2pEbUgsY0FBYyxHQUFHLElBQUl6RixTQUFTLENBQUN3RixjQUFjLENBQUM7VUFDOUNFLHlCQUF5QixHQUFHRixjQUFjLENBQUN6RyxNQUFNLENBQUNDLFlBQVksRUFBRTtVQUNoRTJHLFFBQVEsR0FBRyxJQUFJM0YsU0FBUyxDQUN2QnVCLE1BQU0sQ0FBQ3FFLE1BQU0sQ0FDWjtZQUNDQyxhQUFhLEVBQUUsWUFBWTtZQUMzQkMsT0FBTyxFQUFFeEgsYUFBYSxDQUFDakIsVUFBVSxJQUFJO1VBQ3RDLENBQUMsRUFDRGtJLGtCQUFrQixDQUNsQixDQUNEO1FBQUMsdUJBRThCUSxPQUFPLENBQUNDLE9BQU8sQ0FDL0NDLGVBQWUsQ0FBQ0MsT0FBTyxDQUN0QkMsb0JBQW9CLENBQUNDLFlBQVksQ0FBQ3ZCLFlBQVksRUFBRSxVQUFVLENBQUMsRUFDM0Q7VUFBRXdCLElBQUksRUFBRXhCO1FBQWEsQ0FBQyxFQUN0QjtVQUNDeUIsZUFBZSxFQUFFO1lBQ2hCQyxTQUFTLEVBQUVkLGNBQWMsQ0FBQ2Usb0JBQW9CLENBQUMsR0FBRyxDQUFDO1lBQ25EQyxXQUFXLEVBQUVmLHlCQUF5QixDQUFDYyxvQkFBb0IsWUFBS2hCLGNBQWMsQ0FBQzFHLGNBQWMsT0FBSTtZQUNqRzBFLE1BQU0sRUFBRThCLFdBQVcsQ0FBQ2tCLG9CQUFvQixDQUFDLEdBQUc7VUFDN0MsQ0FBQztVQUNERSxNQUFNLEVBQUU7WUFDUEgsU0FBUyxFQUFFZCxjQUFjO1lBQ3pCZ0IsV0FBVyxFQUFFZix5QkFBeUI7WUFDdENsQyxNQUFNLEVBQUU4QixXQUFXO1lBQ25CaEosU0FBUyxFQUFFb0oseUJBQXlCO1lBQ3BDQyxRQUFRLEVBQUVBO1VBQ1g7UUFDRCxDQUFDLENBQ0QsQ0FDRCxpQkFuQktiLGtCQUFrQjtVQW9CeEJsSixlQUFlLENBQUNnSixzQkFBc0IsQ0FBQ3BJLFlBQVksRUFBRXFJLFlBQVksRUFBRUMsa0JBQWtCLENBQUM7VUFBQyx1QkFDMUU2QixRQUFRLENBQUNDLElBQUksQ0FBQztZQUFFQyxVQUFVLEVBQUUvQjtVQUFtQixDQUFDLENBQUM7UUFBQTtNQUMvRCxDQUFDO1FBQUE7TUFBQTtJQUFBO0lBRURnQyxhQUFhLEVBQUUsVUFBVUMsV0FBbUIsRUFBRTVFLGtCQUEwQixFQUFFNkUsV0FBb0IsRUFBVTtNQUN2RyxJQUFNQyxXQUFXLEdBQUdELFdBQVcsR0FBRyxTQUFTLEdBQUcsUUFBUTtNQUV0RCxpQkFBVUQsV0FBVyxlQUFLRSxXQUFXLDBCQUFnQjlFLGtCQUFrQjtJQUN4RSxDQUFDO0lBRUQrRSw0QkFBNEIsRUFBRSxVQUFVckcsT0FBeUIsRUFBRXZDLGFBQTRCLEVBQVE7TUFDdEcsSUFBTTZELGtCQUFrQixHQUFHN0QsYUFBYSxDQUFDNkQsa0JBQWtCO01BRTNELElBQUksQ0FBQ3RCLE9BQU8sQ0FBQ0wsVUFBVSxFQUFFO1FBQ3hCSyxPQUFPLENBQUNMLFVBQVUsR0FBRyxDQUFDLENBQUM7TUFDeEI7TUFFQSxJQUFJLENBQUNLLE9BQU8sQ0FBQ0wsVUFBVSxDQUFDMkIsa0JBQWtCLENBQUMsRUFBRTtRQUM1Q3RCLE9BQU8sQ0FBQ0wsVUFBVSxDQUFDMkIsa0JBQWtCLENBQUMsR0FBRztVQUN4Q0csTUFBTSxFQUFFaEUsYUFBYSxDQUFDZ0UsTUFBTTtVQUM1QmpELFlBQVksRUFBRWYsYUFBYSxDQUFDZTtRQUM3QixDQUFDO01BQ0Y7SUFDRCxDQUFDO0lBRUQ4SCxnQ0FBZ0MsRUFBRSxVQUNqQ3JMLG1CQUEyQyxFQUMzQ3NMLDBCQUFtQyxFQUNuQjtNQUNoQixJQUFNQyxXQUFXLEdBQUdwSixXQUFXLENBQUNxSixrQkFBa0IsQ0FBQ3hMLG1CQUFtQixFQUFFTSxTQUFTLENBQUM7UUFDakZzQyxjQUFjLEdBQUc1QyxtQkFBbUIsSUFBSUEsbUJBQW1CLENBQUNULGNBQWMsQ0FBQztRQUMzRWtNLHlCQUF5QixHQUFHN0ksY0FBYyxJQUFJNUMsbUJBQW1CLENBQUNSLCtCQUErQixDQUFDO01BRW5HLElBQUk4TCwwQkFBMEIsRUFBRTtRQUMvQixPQUFPMUksY0FBYyxJQUFJLE9BQU9BLGNBQWMsS0FBSyxRQUFRLElBQUlBLGNBQWMsQ0FBQ0UsS0FBSyxHQUFHeUksV0FBVyxHQUFHLE9BQU87TUFDNUcsQ0FBQyxNQUFNO1FBQ047UUFDQSxPQUFPRSx5QkFBeUIsR0FBR0YsV0FBVyxHQUFHLE9BQU87TUFDekQ7SUFDRCxDQUFDO0lBRURHLGNBQWMsRUFBRSxVQUFVQyxPQUFnQixFQUFFQyxlQUF3QixFQUFVO01BQzdFLElBQUlDLEtBQUssR0FBR0YsT0FBTyxDQUFDRyxDQUFDLEVBQUUsQ0FBQ0QsS0FBSyxFQUFFLENBQUMsQ0FBQztNQUNqQyxJQUFJRCxlQUFlLElBQUlDLEtBQUssRUFBRTtRQUM3QkEsS0FBSyxHQUFHLEdBQUcsR0FBR0EsS0FBSztNQUNwQjtNQUNBLElBQU1FLFVBQVUsR0FBR0YsS0FBSyxHQUFHRyxVQUFVLENBQUNDLE1BQU0sQ0FBQ0MsR0FBRyxDQUFDQyxNQUFNLENBQUNOLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDO01BRXBFLE9BQU9PLEtBQUssQ0FBQ0wsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHQSxVQUFVO0lBQzFDLENBQUM7SUFFRE0sYUFBYSxFQUFFLFVBQVVDLEtBQVksRUFBRUMsUUFBZ0IsRUFBVTtNQUNoRSxJQUFJVixLQUFhO01BQ2pCLElBQU03QixPQUFPLEdBQUdzQyxLQUFLLENBQUNFLFVBQVUsRUFBRTtRQUNqQ0MsY0FBYyxHQUNaekMsT0FBTyxJQUNQQSxPQUFPLENBQUN2RyxNQUFNLENBQUMsVUFBVXlFLE1BQU0sRUFBRTtVQUNoQyxPQUFPQSxNQUFNLElBQUlBLE1BQU0sQ0FBQ3dFLFVBQVUsSUFBSXhFLE1BQU0sQ0FBQ3dFLFVBQVUsRUFBRTtRQUMxRCxDQUFDLENBQUMsSUFDSCxFQUFFO1FBQ0hDLFFBQVEsR0FBR0YsY0FBYyxDQUFDRyxNQUFNLENBQUMsVUFBVUMsR0FBRyxFQUFFM0UsTUFBTSxFQUFFO1VBQ3ZEMkQsS0FBSyxHQUFHM0QsTUFBTSxDQUFDNEUsUUFBUSxFQUFFO1VBQ3pCLElBQUlqQixLQUFLLElBQUlBLEtBQUssQ0FBQ2tCLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUNsQ2xCLEtBQUssR0FBR0ksTUFBTSxDQUFDQyxHQUFHLENBQUNDLE1BQU0sQ0FBQ04sS0FBSyxDQUFDLENBQUM7VUFDbEM7VUFDQSxJQUFNRSxVQUFVLEdBQUdDLFVBQVUsQ0FBQ0gsS0FBSyxDQUFDO1VBRXBDLE9BQU9nQixHQUFHLElBQUlULEtBQUssQ0FBQ0wsVUFBVSxDQUFDLEdBQUcsQ0FBQyxHQUFHQSxVQUFVLENBQUM7UUFDbEQsQ0FBQyxFQUFFVSxjQUFjLENBQUMxTCxNQUFNLENBQUM7TUFDMUIsaUJBQVVpTSxJQUFJLENBQUNDLEdBQUcsQ0FBQ04sUUFBUSxFQUFFSixRQUFRLENBQUM7SUFDdkMsQ0FBQztJQUVEVyx3QkFBd0IsRUFBRSxVQUN6QnhNLFlBQW9CLEVBQ3BCc0QsU0FBb0IsRUFDcEJtSixPQUFlLEVBQ2YzSyxhQUE0QixFQUM1QnVDLE9BQXlCLEVBQ1Y7TUFDZixJQUFNcUksU0FBUyxHQUFHRCxPQUFPLENBQUNFLEtBQUssRUFBRTtRQUNoQ3JOLG1CQUFtQixHQUFHZ0UsU0FBUyxDQUFDb0IsUUFBUSxFQUFFLENBQUNsQyxZQUFZLEVBQUUsQ0FBQy9CLFNBQVMsV0FBSVQsWUFBWSxPQUE4QjtRQUNqSDRNLHdCQUF3QixHQUFHdE4sbUJBQW1CLENBQUNILGtDQUFrQyxDQUFDLElBQUksS0FBSztRQUMzRjBOLGFBQWEsR0FBRyxLQUFLO1FBQ3JCQyxVQUFVLEdBQUdDLHFCQUFxQixDQUFDQyx1QkFBdUIsQ0FDekRsTCxhQUFhLENBQUNBLGFBQWEsRUFDM0I5QixZQUFZLEVBQ1o0TSx3QkFBd0IsRUFDeEJDLGFBQWEsQ0FDYjtRQUNEL0QsV0FBVyxHQUFHLElBQUl0RixTQUFTLENBQUM7VUFDM0J5SixFQUFFLEVBQUVQLFNBQVM7VUFDYlEsT0FBTyxFQUFFN0ksT0FBTyxDQUFDOEksY0FBYyxJQUFJdk4sU0FBUztVQUM1Q3dOLFdBQVcsRUFBRSxJQUFJO1VBQ2pCcE4sWUFBWSxFQUFFQSxZQUFZO1VBQzFCOE0sVUFBVSxFQUFFQSxVQUFVO1VBQ3RCRix3QkFBd0IsRUFBRUE7UUFDM0IsQ0FBQyxDQUFDO01BRUhILE9BQU8sQ0FBQ1ksVUFBVSxDQUFDdkwsYUFBYSxDQUFDMkYsUUFBUSxDQUFDO01BQzFDZ0YsT0FBTyxDQUFDYSxrQkFBa0IsQ0FBQ3hMLGFBQWEsQ0FBQzRGLGdCQUFnQixDQUFDO01BQzFEckQsT0FBTyxDQUFDa0osMEJBQTBCLEdBQUdYLHdCQUF3QjtNQUU3RCxJQUFNck4scUJBQXFCLEdBQUl1QyxhQUFhLENBQUNBLGFBQWEsQ0FBQ1MsTUFBTSxDQUMvREMsWUFBWSxFQUFFLENBQ2QvQixTQUFTLFlBQUtxQixhQUFhLENBQUNBLGFBQWEsQ0FBQ1EsY0FBYyxPQUFJLElBQUksQ0FBQyxDQUE4QjtNQUVqR21LLE9BQU8sQ0FBQ2UsZUFBZSxDQUFDcE8sZUFBZSxDQUFDQyxrQkFBa0IsQ0FBQ0MsbUJBQW1CLEVBQUVDLHFCQUFxQixDQUFDLEdBQUcsU0FBUyxHQUFHLEVBQUUsQ0FBQztNQUV4SCxJQUFNa08sY0FBYyxHQUNuQmhCLE9BQU8sQ0FBQ2lCLFFBQVEsRUFBRSxJQUNsQnRPLGVBQWUsQ0FBQ3lKLGlCQUFpQixDQUFDLGlEQUFpRCxFQUFFL0csYUFBYSxFQUFFZ0gsV0FBVyxFQUFFOUksWUFBWSxDQUFDO01BRS9ILE9BQU91SixPQUFPLENBQUNvRSxHQUFHLENBQUMsQ0FBQ0YsY0FBYyxDQUFDLENBQUMsQ0FBQzlPLElBQUksQ0FBQyxVQUFVaVAsUUFBUSxFQUFFO1FBQzdELElBQU1oQyxLQUFLLEdBQUdnQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBRXpCaEMsS0FBSyxDQUFDbkksUUFBUSxDQUFDM0IsYUFBYSxDQUFDQSxhQUFhLENBQUNTLE1BQU0sQ0FBQztRQUVsRHlGLEdBQUcsQ0FBQzZGLElBQUksMERBQW1EN04sWUFBWSxRQUFLNEwsS0FBSyxDQUFDa0MsV0FBVyxFQUFFLENBQUNDLE9BQU8sRUFBRSxFQUFFLGdCQUFnQixDQUFDO1FBRTVIdEIsT0FBTyxDQUFDdUIsUUFBUSxDQUFDcEMsS0FBSyxDQUFDO1FBRXZCLElBQU1xQyxLQUFLLEdBQUczSyxTQUFTLENBQUM0SyxVQUFVLEVBQUU7UUFDcEMsSUFDQ0QsS0FBSyxLQUNKQSxLQUFLLENBQUN4SCxHQUFHLENBQUMsd0JBQXdCLENBQUMsSUFBSXdILEtBQUssQ0FBQ3hILEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJd0gsS0FBSyxDQUFDeEgsR0FBRyxDQUFDLDRCQUE0QixDQUFDLENBQUMsRUFDaEg7VUFDRDtVQUNBLElBQU0wSCwyQkFBMkIsR0FBR0MsT0FBTyxDQUFDL0osT0FBTyxDQUFDNkcsZUFBZSxDQUFDO1VBQ3BFLElBQU1tRCxVQUFVLEdBQUdqUCxlQUFlLENBQUN1TSxhQUFhLENBQUNDLEtBQUssRUFBRXhNLGVBQWUsQ0FBQzRMLGNBQWMsQ0FBQ2lELEtBQUssRUFBRUUsMkJBQTJCLENBQUMsQ0FBQztVQUMzSHZDLEtBQUssQ0FBQzBDLFFBQVEsQ0FBQ0QsVUFBVSxDQUFDO1VBRTFCLElBQUl6Qix3QkFBd0IsRUFBRTtZQUM3QmhCLEtBQUssQ0FBQzJDLE9BQU8sQ0FBRU4sS0FBSyxDQUFlTyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsR0FBRyxvQkFBb0IsR0FBRyxhQUFhLENBQUM7VUFDcEcsQ0FBQyxNQUFNO1lBQ041QyxLQUFLLENBQUMyQyxPQUFPLENBQUMsb0JBQW9CLENBQUM7VUFDcEM7UUFDRDtNQUNELENBQUMsQ0FBQztJQUNILENBQUM7SUFFREUscUJBQXFCLEVBQUUsVUFDdEJ6TyxZQUFvQixFQUNwQnNELFNBQW9CLEVBQ3BCbUosT0FBaUIsRUFDakIzSyxhQUE0QixFQUM1QnVDLE9BQXlCLEVBQ1Q7TUFDaEIsSUFBTS9FLG1CQUFtQixHQUFHZ0UsU0FBUyxDQUFDb0IsUUFBUSxFQUFFLENBQUNsQyxZQUFZLEVBQUUsQ0FBQy9CLFNBQVMsV0FBSVQsWUFBWSxPQUE4QjtRQUN0SDBPLGVBQWUsR0FBRyxLQUFLO1FBQ3ZCN0IsYUFBYSxHQUFHLElBQUk7UUFDcEJDLFVBQVUsR0FBR0MscUJBQXFCLENBQUNDLHVCQUF1QixDQUN6RGxMLGFBQWEsQ0FBQ0EsYUFBYSxFQUMzQjlCLFlBQVksRUFDWjBPLGVBQWUsRUFDZjdCLGFBQWEsQ0FDYjtRQUNEL0QsV0FBVyxHQUFHLElBQUl0RixTQUFTLENBQUM7VUFDM0J5SixFQUFFLEVBQUVSLE9BQU8sQ0FBQ0UsS0FBSyxFQUFFO1VBQ25CTyxPQUFPLEVBQUU3SSxPQUFPLENBQUM4SSxjQUFjLElBQUl2TixTQUFTO1VBQzVDd04sV0FBVyxFQUFFLEtBQUs7VUFDbEJOLFVBQVUsRUFBRUEsVUFBVTtVQUN0QkYsd0JBQXdCLEVBQUU4QjtRQUMzQixDQUFDLENBQUM7TUFFSGpDLE9BQU8sQ0FBQ1ksVUFBVSxDQUFDdkwsYUFBYSxDQUFDMkYsUUFBUSxDQUFDO01BQzFDZ0YsT0FBTyxDQUFDYSxrQkFBa0IsQ0FBQ3hMLGFBQWEsQ0FBQzRGLGdCQUFnQixDQUFDO01BRTFELElBQU1uSSxxQkFBcUIsR0FBSXVDLGFBQWEsQ0FBQ0EsYUFBYSxDQUFDUyxNQUFNLENBQy9EQyxZQUFZLEVBQUUsQ0FDZC9CLFNBQVMsWUFBS3FCLGFBQWEsQ0FBQ0EsYUFBYSxDQUFDUSxjQUFjLE9BQUksSUFBSSxDQUFDLENBQThCO01BRWpHbUssT0FBTyxDQUFDZSxlQUFlLENBQUNwTyxlQUFlLENBQUNDLGtCQUFrQixDQUFDQyxtQkFBbUIsRUFBRUMscUJBQXFCLENBQUMsR0FBRyxTQUFTLEdBQUcsRUFBRSxDQUFDO01BRXhILElBQU1rTyxjQUFjLEdBQ25CaEIsT0FBTyxDQUFDaUIsUUFBUSxFQUFFLElBQ2xCdE8sZUFBZSxDQUFDeUosaUJBQWlCLENBQ2hDLHVEQUF1RCxFQUN2RC9HLGFBQWEsRUFDYmdILFdBQVcsRUFDWDlJLFlBQVksRUFDWjtRQUNDMk8scUJBQXFCLEVBQUUsQ0FBQ0MsTUFBTSxDQUFDQztNQUNoQyxDQUFDLENBQ0Q7TUFFRixJQUFNQyxrQkFBa0IsR0FDdkJyQyxPQUFPLENBQUNzQyxZQUFZLEVBQUUsSUFDdEIzUCxlQUFlLENBQUN5SixpQkFBaUIsQ0FDaEMscURBQXFELEVBQ3JEL0csYUFBYSxFQUNiZ0gsV0FBVyxFQUNYOUksWUFBWSxDQUNaO01BRUYsT0FBT3VKLE9BQU8sQ0FBQ29FLEdBQUcsQ0FBQyxDQUFDRixjQUFjLEVBQUVxQixrQkFBa0IsQ0FBQyxDQUFDLENBQUNuUSxJQUFJLENBQUMsVUFBVWlQLFFBQVEsRUFBRTtRQUNqRixJQUFNaEMsS0FBSyxHQUFHZ0MsUUFBUSxDQUFDLENBQUMsQ0FBQztVQUN4Qm9CLFNBQVMsR0FBR3BCLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFFeEJoQyxLQUFLLENBQUNuSSxRQUFRLENBQUMzQixhQUFhLENBQUNBLGFBQWEsQ0FBQ1MsTUFBTSxDQUFDO1FBQ2xEeU0sU0FBUyxDQUFDdkwsUUFBUSxDQUFDM0IsYUFBYSxDQUFDQSxhQUFhLENBQUNTLE1BQU0sQ0FBQztRQUV0RGtLLE9BQU8sQ0FBQ3dDLFlBQVksQ0FBQ0QsU0FBUyxDQUFDO1FBQy9CdkMsT0FBTyxDQUFDdUIsUUFBUSxDQUFDcEMsS0FBSyxDQUFDO1FBRXZCQSxLQUFLLENBQUNzRCxTQUFTLENBQUNGLFNBQVMsQ0FBQ3JDLEtBQUssRUFBRSxDQUFDO1FBQ2xDZixLQUFLLENBQUN1RCxXQUFXLEVBQUU7UUFFbkIsSUFBTWxCLEtBQUssR0FBRzNLLFNBQVMsQ0FBQzRLLFVBQVUsRUFBRTtRQUNwQyxJQUFJRCxLQUFLLEVBQUU7VUFDVnJDLEtBQUssQ0FBQ3dELGdCQUFnQixDQUFFbkIsS0FBSyxDQUFlTyxnQkFBZ0IsRUFBRSxLQUFLLENBQUMsR0FBRyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBQzNGO1FBQ0E1QyxLQUFLLENBQUMwQyxRQUFRLENBQUMsTUFBTSxDQUFDOztRQUV0QjtRQUNBLElBQU1lLFFBQVEsR0FBR3pELEtBQVk7UUFDN0J5RCxRQUFRLENBQUNDLGtCQUFrQixDQUFDLEtBQUssQ0FBQztNQUNuQyxDQUFDLENBQUM7SUFDSCxDQUFDO0lBRURDLGVBQWUsRUFBRSxVQUFVQyxXQUFzQixFQUFFOUMsU0FBaUIsRUFBdUI7TUFDMUYsT0FBTzhDLFdBQVcsQ0FBQ0MsSUFBSSxDQUFDLFVBQVVDLElBQUksRUFBRTtRQUN2QyxPQUFPQSxJQUFJLENBQUMvQyxLQUFLLEVBQUUsS0FBS0QsU0FBUztNQUNsQyxDQUFDLENBQUM7SUFDSCxDQUFDO0lBRURpRCxxQkFBcUIsRUFBRSxVQUFVakQsU0FBaUIsRUFBRWtELGFBQXNCLEVBQUU7TUFDM0UsT0FBTyxJQUFJQyxNQUFNLENBQUM7UUFDakI1QyxFQUFFLEVBQUVQLFNBQVM7UUFDYm9ELEtBQUssRUFBRSxRQUFRO1FBQ2ZGLGFBQWEsRUFBRUE7TUFDaEIsQ0FBQyxDQUFRLENBQUMsQ0FBQztJQUNaLENBQUM7O0lBRURHLG9CQUFvQixFQUFFLFVBQVVyRCxTQUFpQixFQUFFa0QsYUFBc0IsRUFBRUksU0FBa0IsRUFBRTtNQUM5RixPQUFPLElBQUlDLFFBQVEsQ0FBQztRQUNuQmhELEVBQUUsRUFBRVAsU0FBUztRQUNib0QsS0FBSyxFQUFFLFFBQVE7UUFDZkYsYUFBYSxFQUFFQSxhQUFhO1FBQzVCSSxTQUFTLEVBQUVBO01BQ1osQ0FBQyxDQUFRLENBQUMsQ0FBQztJQUNaLENBQUM7O0lBRURFLGFBQWEsRUFBRSxVQUFVN0wsT0FBeUIsRUFBRThMLFNBQW9CLEVBQUVDLGlCQUF5QixFQUFpQjtNQUNuSCxJQUFNOU0sU0FBUyxHQUFHNk0sU0FBUyxDQUFDM0osU0FBUyxFQUFlO1FBQ25EZ0UsV0FBVyxHQUFHMkYsU0FBUyxDQUFDM0YsV0FBVyxFQUFFO1FBQ3JDeEssWUFBWSxHQUFHcUUsT0FBTyxDQUFDckUsWUFBWTtRQUNuQ0YsU0FBUyxHQUFHd0QsU0FBUyxDQUFDb0IsUUFBUSxFQUFFLENBQUNsQyxZQUFZLEVBQW9CO1FBQ2pFZSxTQUFTLEdBQUlELFNBQVMsQ0FBQ29CLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBa0J0RixlQUFlLENBQUNpRSxlQUFlLENBQUNDLFNBQVMsRUFBRXRELFlBQVksRUFBRUYsU0FBUyxDQUFDO1FBQzdIdVEsa0JBQWtCLEdBQUcvTSxTQUFTLENBQUNnTixJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSWhOLFNBQVMsQ0FBQ2dOLElBQUksQ0FBQyxvQkFBb0IsQ0FBQyxLQUFLLE9BQU87TUFFOUcsSUFBSSxDQUFDak0sT0FBTyxDQUFDTCxVQUFVLEVBQUU7UUFDeEJLLE9BQU8sQ0FBQ0wsVUFBVSxHQUFHLENBQUMsQ0FBQztNQUN4QjtNQUVBVCxTQUFTLENBQUNHLFdBQVcsQ0FBQyxlQUFlLEVBQUU4RyxXQUFXLENBQUM7TUFDbkRqSCxTQUFTLENBQUNHLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDOEcsV0FBVyxHQUFHLE9BQU8sR0FBRzVLLFNBQVMsQ0FBQztNQUU1RSxPQUFPUixlQUFlLENBQUNnRixnQkFBZ0IsQ0FBQ2QsU0FBUyxFQUFFdEQsWUFBWSxFQUFFcUUsT0FBTyxDQUFDLENBQ3ZFMUYsSUFBSSxDQUFDLFVBQVVnRyxjQUFjLEVBQUU7UUFDL0IsSUFBTWlMLGFBQWEsR0FBR3RNLFNBQVMsQ0FBQ1EsWUFBWSxFQUFFLENBQUN5TSxVQUFVLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQ0MsZ0JBQWdCLEVBQUUsQ0FBQyxDQUFDO1FBQ25GLElBQUloQixXQUFXLEdBQUdXLFNBQVMsQ0FBQ0ksVUFBVSxFQUFFO1FBRXhDLElBQUkvRixXQUFXLEVBQUU7VUFDaEIsSUFBSWlHLHFCQUFxQixHQUFHbk4sU0FBUyxDQUFDZ04sSUFBSSxDQUFDLHdCQUF3QixDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7VUFDNUUsSUFBSUcscUJBQXFCLEtBQUssR0FBRyxFQUFFO1lBQ2xDQSxxQkFBcUIsR0FBRyxFQUFFO1VBQzNCO1VBQ0EsSUFBTTNPLGFBQWEsR0FBRzJPLHFCQUFxQixHQUN4QzlMLGNBQWMsQ0FBQzVCLE1BQU0sQ0FBQyxVQUFVMk4sZ0JBQWdCLEVBQUU7WUFDbEQsT0FBT0EsZ0JBQWdCLENBQUMvSyxrQkFBa0IsS0FBSzhLLHFCQUFxQjtVQUNwRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FDTDlMLGNBQWMsQ0FBQyxDQUFDLENBQUM7VUFFcEJ2RixlQUFlLENBQUNzTCw0QkFBNEIsQ0FBQ3JHLE9BQU8sRUFBRXZDLGFBQWEsQ0FBQztVQUVwRSxJQUFNNEssU0FBUyxHQUFHdE4sZUFBZSxDQUFDa0wsYUFBYSxDQUFDaEgsU0FBUyxDQUFDcUosS0FBSyxFQUFFLEVBQUU3SyxhQUFhLENBQUM2RCxrQkFBa0IsRUFBRTZFLFdBQVcsQ0FBQztVQUNqSCxJQUFJaUMsT0FBTyxHQUFHck4sZUFBZSxDQUFDbVEsZUFBZSxDQUFDQyxXQUFXLEVBQUU5QyxTQUFTLENBQUM7VUFFckUsSUFBSSxDQUFDRCxPQUFPLEVBQUU7WUFDYkEsT0FBTyxHQUFHck4sZUFBZSxDQUFDdVEscUJBQXFCLENBQUNqRCxTQUFTLEVBQUVrRCxhQUFhLENBQUM7WUFFekVPLFNBQVMsQ0FBQ1EsYUFBYSxDQUFDbEUsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDckMrQyxXQUFXLEdBQUdXLFNBQVMsQ0FBQ0ksVUFBVSxFQUFFO1VBQ3JDLENBQUMsTUFBTSxJQUFJN0QsU0FBUyxLQUFLOEMsV0FBVyxDQUFDLENBQUMsQ0FBQyxDQUFDN0MsS0FBSyxFQUFFLEVBQUU7WUFDaEQ7WUFDQXdELFNBQVMsQ0FBQ1MsYUFBYSxDQUFDbkUsT0FBTyxDQUFDO1lBQ2hDMEQsU0FBUyxDQUFDUSxhQUFhLENBQUNsRSxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQytDLFdBQVcsR0FBR1csU0FBUyxDQUFDSSxVQUFVLEVBQUU7VUFDckM7VUFFQWxNLE9BQU8sQ0FBQ3NCLGtCQUFrQixHQUFHN0QsYUFBYSxDQUFDNkQsa0JBQWtCO1VBRTdEOEcsT0FBTyxDQUFDb0UsUUFBUSxDQUFDL08sYUFBYSxDQUFDQSxhQUFhLENBQUNnUCxLQUFLLENBQUM7VUFFbkQsT0FBTzFSLGVBQWUsQ0FBQ29OLHdCQUF3QixDQUFDeE0sWUFBWSxFQUFFc0QsU0FBUyxFQUFFbUosT0FBTyxFQUFZM0ssYUFBYSxFQUFFdUMsT0FBTyxDQUFDO1FBQ3BILENBQUMsTUFBTTtVQUNOOztVQUVBO1VBQ0EsS0FBSyxJQUFJb0IsQ0FBQyxHQUFHLENBQUMsRUFBRUEsQ0FBQyxHQUFHK0osV0FBVyxDQUFDblAsTUFBTSxFQUFFb0YsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUMvQytKLFdBQVcsQ0FBQy9KLENBQUMsQ0FBQyxDQUFDc0wsVUFBVSxDQUFDLEtBQUssQ0FBQztVQUNqQztVQUNBLElBQUlWLGtCQUFrQixFQUFFO1lBQ3ZCLElBQUlXLGlCQUFpQixHQUNwQnhCLFdBQVcsQ0FBQ25QLE1BQU0sSUFDbEJtUCxXQUFXLENBQUNBLFdBQVcsQ0FBQ25QLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQ3lOLFdBQVcsRUFBRSxDQUFDQyxPQUFPLEVBQUUsS0FBSyx5Q0FBeUMsR0FDdEd5QixXQUFXLENBQUNBLFdBQVcsQ0FBQ25QLE1BQU0sR0FBRyxDQUFDLENBQUMsR0FDbkNULFNBQVM7WUFFYixJQUFJb1IsaUJBQWlCLEVBQUU7Y0FDdEJBLGlCQUFpQixDQUFDRCxVQUFVLENBQUMsSUFBSSxDQUFDO1lBQ25DLENBQUMsTUFBTTtjQUNOQyxpQkFBaUIsR0FBRyxJQUFJQyxVQUFVLEVBQUU7Y0FDcENkLFNBQVMsQ0FBQ2UsVUFBVSxDQUFDRixpQkFBaUIsQ0FBQztjQUN2Q3hCLFdBQVcsR0FBR1csU0FBUyxDQUFDSSxVQUFVLEVBQUU7WUFDckM7VUFDRDtVQUVBLElBQUlZLFlBQXVDLEVBQUVDLGVBQW9DOztVQUVqRjtVQUNBLEtBQUssSUFBSTNMLEVBQUMsR0FBRyxDQUFDLEVBQUVBLEVBQUMsR0FBR2QsY0FBYyxDQUFDdEUsTUFBTSxFQUFFb0YsRUFBQyxJQUFJLENBQUMsRUFBRTtZQUNsRCxJQUFNM0QsY0FBYSxHQUFHNkMsY0FBYyxDQUFDYyxFQUFDLENBQUM7Y0FDdENFLGtCQUFrQixHQUFHN0QsY0FBYSxDQUFDNkQsa0JBQWtCO1lBRXREdkcsZUFBZSxDQUFDc0wsNEJBQTRCLENBQUNyRyxPQUFPLEVBQUV2QyxjQUFhLENBQUM7WUFFcEUsSUFBTTRLLFVBQVMsR0FBR3ROLGVBQWUsQ0FBQ2tMLGFBQWEsQ0FBQ2hILFNBQVMsQ0FBQ3FKLEtBQUssRUFBRSxFQUFFaEgsa0JBQWtCLEVBQUU2RSxXQUFXLENBQUM7WUFDbkcsSUFBSWlDLFFBQU8sR0FBR3JOLGVBQWUsQ0FBQ21RLGVBQWUsQ0FBQ0MsV0FBVyxFQUFFOUMsVUFBUyxDQUFDO1lBRXJFLElBQUksQ0FBQ0QsUUFBTyxFQUFFO2NBQ2IsSUFBTXVELFNBQVMsR0FBR2xPLGNBQWEsQ0FBQ0EsYUFBYSxDQUFDdVAsV0FBVyxJQUFJLENBQUMsR0FBRyxLQUFLLEdBQUcsSUFBSTtjQUU3RTVFLFFBQU8sR0FBR3JOLGVBQWUsQ0FBQzJRLG9CQUFvQixDQUFDckQsVUFBUyxFQUFFa0QsYUFBYSxFQUFFSSxTQUFTLENBQUM7Y0FFbkYsSUFBSSxDQUFDSyxrQkFBa0IsRUFBRTtnQkFDeEJGLFNBQVMsQ0FBQ2UsVUFBVSxDQUFDekUsUUFBTyxDQUFDO2NBQzlCLENBQUMsTUFBTTtnQkFDTjBELFNBQVMsQ0FBQ1EsYUFBYSxDQUFDbEUsUUFBTyxFQUFFK0MsV0FBVyxDQUFDblAsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7Y0FDM0Q7O2NBQ0FtUCxXQUFXLEdBQUdXLFNBQVMsQ0FBQ0ksVUFBVSxFQUFFO1lBQ3JDLENBQUMsTUFBTTtjQUNOOUQsUUFBTyxDQUFDc0UsVUFBVSxDQUFDLElBQUksQ0FBQztZQUN6QjtZQUNBdEUsUUFBTyxDQUFDb0UsUUFBUSxDQUFDL08sY0FBYSxDQUFDQSxhQUFhLENBQUNnUCxLQUFLLENBQUM7WUFFbkQsSUFBSSxDQUFDTSxlQUFlLElBQUtoQixpQkFBaUIsSUFBSUEsaUJBQWlCLEtBQUsxRCxVQUFVLEVBQUU7Y0FDL0UwRSxlQUFlLEdBQUczRSxRQUFPO2NBQ3pCMEUsWUFBWSxHQUFHclAsY0FBYTtZQUM3QjtVQUNEO1VBRUEsSUFBSSxDQUFDcVAsWUFBWSxJQUFJLENBQUNDLGVBQWUsRUFBRTtZQUN0QyxNQUFNLElBQUlFLEtBQUssQ0FBQywyQ0FBMkMsQ0FBQztVQUM3RDtVQUVBak4sT0FBTyxDQUFDc0Isa0JBQWtCLEdBQUd3TCxZQUFZLENBQUN4TCxrQkFBa0I7VUFDNUR3SyxTQUFTLENBQUNVLFFBQVEsQ0FBQ00sWUFBWSxDQUFDclAsYUFBYSxDQUFDZ1AsS0FBSyxDQUFDO1VBRXBELE9BQU8xUixlQUFlLENBQUNxUCxxQkFBcUIsQ0FDM0N6TyxZQUFZLEVBQ1pzRCxTQUFTLEVBQ1Q4TixlQUFlLEVBQ2ZELFlBQVksRUFDWjlNLE9BQU8sQ0FDUDtRQUNGO01BQ0QsQ0FBQyxDQUFDLENBQ0RrTixLQUFLLENBQUMsVUFBVTVKLEdBQVUsRUFBRTtRQUM1QixJQUFNQyxTQUFTLEdBQUlELEdBQUcsQ0FBU0UsTUFBTTtVQUNwQ0MsR0FBRyxHQUNGRixTQUFTLElBQUlBLFNBQVMsS0FBSyxHQUFHLGlDQUNKQSxTQUFTLDBDQUFnQzVILFlBQVksSUFDNUUySCxHQUFHLENBQUNJLE9BQU87UUFDaEJDLEdBQUcsQ0FBQ0MsS0FBSyxDQUFDSCxHQUFHLENBQUM7UUFDZDFJLGVBQWUsQ0FBQ3VFLGdCQUFnQixDQUFDTCxTQUFTLENBQUM7TUFDNUMsQ0FBQyxDQUFDO0lBQ0o7RUFDRCxDQUFDO0VBQUMsT0FFYWxFLGVBQWU7QUFBQSJ9