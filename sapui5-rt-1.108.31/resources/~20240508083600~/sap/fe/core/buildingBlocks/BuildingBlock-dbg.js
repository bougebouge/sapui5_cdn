/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/util/deepClone", "sap/base/util/merge", "sap/base/util/ObjectPath", "sap/fe/core/buildingBlocks/BuildingBlockRuntime", "sap/fe/core/CommonUtils", "sap/fe/core/helpers/BindingToolkit", "sap/fe/core/helpers/StableIdHelper", "sap/ui/base/ManagedObject", "sap/ui/core/Component", "sap/ui/core/Fragment", "sap/ui/core/util/XMLPreprocessor", "../converters/ConverterContext"], function (deepClone, merge, ObjectPath, BuildingBlockRuntime, CommonUtils, BindingToolkit, StableIdHelper, ManagedObject, Component, Fragment, XMLPreprocessor, ConverterContext) {
  "use strict";

  var _templateObject, _templateObject2, _templateObject3;
  var _exports = {};
  var generate = StableIdHelper.generate;
  var resolveBindingString = BindingToolkit.resolveBindingString;
  var xml = BuildingBlockRuntime.xml;
  var registerBuildingBlock = BuildingBlockRuntime.registerBuildingBlock;
  var escapeXMLAttributeValue = BuildingBlockRuntime.escapeXMLAttributeValue;
  function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }
  /**
   * Base class for Building Block
   */
  var BuildingBlockBase = /*#__PURE__*/function () {
    function BuildingBlockBase(oProps, _oControlConfig, _oSettings) {
      var _this = this;
      this.isPublic = false;
      this.getConverterContext = function (oVisualizationObjectPath, contextPath, mSettings, mExtraParams) {
        var oAppComponent = mSettings.appComponent;
        var originalViewData = mSettings.models.viewData && mSettings.models.viewData.getData();
        var viewData = Object.assign({}, originalViewData);
        delete viewData.resourceBundle;
        viewData = deepClone(viewData);
        viewData.controlConfiguration = merge(viewData.controlConfiguration, mExtraParams);
        return ConverterContext.createConverterContextForMacro(oVisualizationObjectPath.startingEntitySet.name, mSettings.models.metaModel, oAppComponent && oAppComponent.getDiagnostics(), merge, oVisualizationObjectPath.contextLocation, viewData);
      };
      Object.keys(oProps).forEach(function (propName) {
        // This needs to be casted as any since we are assigning the properties to the instance without knowing their type
        _this[propName] = oProps[propName];
      });
    }

    /**
     * Convert the given local element ID to a globally unique ID by prefixing with the Building Block ID.
     *
     * @param stringParts
     * @returns Either the global ID or undefined if the Building Block doesn't have an ID
     */
    _exports.BuildingBlockBase = BuildingBlockBase;
    var _proto = BuildingBlockBase.prototype;
    _proto.createId = function createId() {
      // If the child instance has an ID property use it otherwise return undefined
      if (this.id) {
        for (var _len = arguments.length, stringParts = new Array(_len), _key = 0; _key < _len; _key++) {
          stringParts[_key] = arguments[_key];
        }
        return generate([this.id].concat(stringParts));
      }
      return undefined;
    }
    // This block is commented out because I am not using them for now / need to change this but still want to keep them around
    ;
    _proto.getProperties = function getProperties() {
      var allProperties = {};
      for (var oInstanceKey in this) {
        if (this.hasOwnProperty(oInstanceKey)) {
          allProperties[oInstanceKey] = this[oInstanceKey];
        }
      }
      return allProperties;
    };
    BuildingBlockBase.register = function register() {
      // To be overriden
    };
    BuildingBlockBase.unregister = function unregister() {
      // To be overriden
    };
    _proto.addConditionally = function addConditionally() {
      var condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var partToAdd = arguments.length > 1 ? arguments[1] : undefined;
      if (condition) {
        return partToAdd;
      } else {
        return "";
      }
    };
    _proto.attr = function attr(attributeName, value) {
      if (value !== undefined) {
        return function () {
          return "".concat(attributeName, "=\"").concat(escapeXMLAttributeValue(value), "\"");
        };
      } else {
        return function () {
          return "";
        };
      }
    };
    return BuildingBlockBase;
  }();
  /**
   * Base class for runtime building blocks
   */
  _exports.BuildingBlockBase = BuildingBlockBase;
  var ensureMetadata = function (target) {
    if (!target.hasOwnProperty("metadata")) {
      target.metadata = deepClone(target.metadata || {
        properties: {},
        aggregations: {},
        events: {}
      });
    }
    return target.metadata;
  };

  /**
   * Indicates that the property shall be declared as an xml attribute that can be used from the outside of the building block.
   *
   * If defining a runtime Building Block, please make sure to use the correct typings: Depending on its metadata,
   * a property can either be a {@link sap.ui.model.Context} (<code>type: 'sap.ui.model.Context'</code>),
   * a constant (<code>bindable: false</code>), or a {@link BindingToolkitExpression} (<code>bindable: true</code>).
   *
   * @param attributeDefinition
   * @returns The decorated property
   */
  function xmlAttribute(attributeDefinition) {
    return function (target, propertyKey, propertyDescriptor) {
      var metadata = ensureMetadata(target.constructor);
      if (attributeDefinition.defaultValue === undefined) {
        var _propertyDescriptor$i;
        // If there is no defaultValue we can take the value from the initializer (natural way of defining defaults)
        attributeDefinition.defaultValue = (_propertyDescriptor$i = propertyDescriptor.initializer) === null || _propertyDescriptor$i === void 0 ? void 0 : _propertyDescriptor$i.call(propertyDescriptor);
      }
      delete propertyDescriptor.initializer;
      if (metadata.properties[propertyKey.toString()] === undefined) {
        metadata.properties[propertyKey.toString()] = attributeDefinition;
      }
      return propertyDescriptor;
    }; // Needed to make TS happy with those decorators;
  }
  _exports.xmlAttribute = xmlAttribute;
  function blockAttribute(attributeDefinition) {
    return xmlAttribute(attributeDefinition);
  }
  _exports.blockAttribute = blockAttribute;
  function xmlEvent() {
    return function (target, propertyKey, propertyDescriptor) {
      var metadata = ensureMetadata(target.constructor);
      delete propertyDescriptor.initializer;
      if (metadata.events[propertyKey.toString()] === undefined) {
        metadata.events[propertyKey.toString()] = {
          type: "Function"
        };
      }
      return propertyDescriptor;
    }; // Needed to make TS happy with those decorators;
  }
  _exports.xmlEvent = xmlEvent;
  function blockEvent() {
    return xmlEvent();
  }
  /**
   * Indicates that the property shall be declared as an xml aggregation that can be used from the outside of the building block.
   *
   * @param aggregationDefinition
   * @returns The decorated property
   */
  _exports.blockEvent = blockEvent;
  function xmlAggregation(aggregationDefinition) {
    return function (target, propertyKey, propertyDescriptor) {
      var metadata = ensureMetadata(target.constructor);
      delete propertyDescriptor.initializer;
      if (metadata.aggregations[propertyKey] === undefined) {
        metadata.aggregations[propertyKey] = aggregationDefinition;
      }
      return propertyDescriptor;
    };
  }
  _exports.xmlAggregation = xmlAggregation;
  function blockAggregation(aggregationDefinition) {
    return xmlAggregation(aggregationDefinition);
  }
  _exports.blockAggregation = blockAggregation;
  var RUNTIME_BLOCKS = {};
  function defineBuildingBlock(oBuildingBlockDefinition) {
    return function (classDefinition) {
      ensureMetadata(classDefinition);
      classDefinition.xmlTag = oBuildingBlockDefinition.name;
      classDefinition.namespace = oBuildingBlockDefinition.namespace;
      classDefinition.publicNamespace = oBuildingBlockDefinition.publicNamespace;
      classDefinition.fragment = oBuildingBlockDefinition.fragment;
      classDefinition.isOpen = oBuildingBlockDefinition.isOpen;
      classDefinition.isRuntime = oBuildingBlockDefinition.isRuntime;
      classDefinition.apiVersion = 2;
      if (classDefinition.isRuntime === true) {
        classDefinition.prototype.getTemplate = function () {
          var className = "".concat(oBuildingBlockDefinition.namespace, ".").concat(oBuildingBlockDefinition.name);
          var extraProps = [];
          for (var propertiesKey in classDefinition.metadata.properties) {
            var propertyValue = this[propertiesKey];
            if (propertyValue !== undefined && propertyValue !== null) {
              var _propertyValue, _propertyValue$isA, _propertyValue2;
              if (((_propertyValue = propertyValue) === null || _propertyValue === void 0 ? void 0 : (_propertyValue$isA = (_propertyValue2 = _propertyValue).isA) === null || _propertyValue$isA === void 0 ? void 0 : _propertyValue$isA.call(_propertyValue2, "sap.ui.model.Context")) === true) {
                propertyValue = propertyValue.getPath();
              }
              extraProps.push(xml(_templateObject || (_templateObject = _taggedTemplateLiteral(["feBB:", "=\"", "\""])), propertiesKey, propertyValue));
            }
          }
          for (var eventsKey in classDefinition.metadata.events) {
            var eventsValue = this[eventsKey];
            if (eventsValue !== undefined) {
              extraProps.push(xml(_templateObject2 || (_templateObject2 = _taggedTemplateLiteral(["feBB:", "=\"", "\""])), eventsKey, eventsValue));
            }
          }
          return xml(_templateObject3 || (_templateObject3 = _taggedTemplateLiteral(["<core:Fragment\n\t\t\t\t\txmlns:core=\"sap.ui.core\"\n\t\t\t\t\txmlns:feBB=\"sap.fe.core.buildingBlocks\"\n\t\t\t\t\tfragmentName=\"", "\"\n\t\t\t\t\tid=\"{this>id}\"\n\t\t\t\t\ttype=\"FE_COMPONENTS\"\n\t\t\t\t\t", "\n\t\t\t\t>\n\t\t\t\t</core:Fragment>"])), className, extraProps);
        };
      }
      classDefinition.register = function () {
        registerBuildingBlock(classDefinition);
        if (classDefinition.isRuntime === true) {
          RUNTIME_BLOCKS["".concat(oBuildingBlockDefinition.namespace, ".").concat(oBuildingBlockDefinition.name)] = classDefinition;
        }
      };
      classDefinition.unregister = function () {
        XMLPreprocessor.plugIn(null, classDefinition.namespace, classDefinition.name);
        XMLPreprocessor.plugIn(null, classDefinition.publicNamespace, classDefinition.name);
      };
    };
  }
  _exports.defineBuildingBlock = defineBuildingBlock;
  Fragment.registerType("FE_COMPONENTS", {
    load: function (mSettings) {
      try {
        return Promise.resolve(RUNTIME_BLOCKS[mSettings.fragmentName]);
      } catch (e) {
        return Promise.reject(e);
      }
    },
    init: function (mSettings) {
      try {
        var _mSettings$customData, _mSettings$customData2, _mSettings$customData3, _mSettings$customData4;
        var _this3 = this;
        var MyClass = mSettings.fragmentContent;
        if (!MyClass) {
          // In some case we might have been called here synchronously (unstash case for instance), which means we didn't go through the load function
          MyClass = RUNTIME_BLOCKS[mSettings.fragmentName];
        }
        var classSettings = {};
        var feCustomData = (mSettings === null || mSettings === void 0 ? void 0 : (_mSettings$customData = mSettings.customData) === null || _mSettings$customData === void 0 ? void 0 : (_mSettings$customData2 = _mSettings$customData[0]) === null || _mSettings$customData2 === void 0 ? void 0 : (_mSettings$customData3 = _mSettings$customData2.mProperties) === null || _mSettings$customData3 === void 0 ? void 0 : (_mSettings$customData4 = _mSettings$customData3.value) === null || _mSettings$customData4 === void 0 ? void 0 : _mSettings$customData4["sap.fe.core.buildingBlocks"]) || {};
        delete mSettings.customData;
        var pageComponent = Component.getOwnerComponentFor(mSettings.containingView);
        var _appComponent = CommonUtils.getAppComponent(mSettings.containingView);
        var metaModel = _appComponent.getMetaModel();
        var pageModel = pageComponent.getModel("_pageModel");
        for (var propertyName in MyClass.metadata.properties) {
          var propertyMetadata = MyClass.metadata.properties[propertyName];
          var pageModelContext = pageModel.createBindingContext(feCustomData[propertyName]);
          if (pageModelContext === null) {
            // value cannot be resolved, so it is either a runtime binding or a constant
            var vValue = feCustomData[propertyName];
            if (typeof vValue === "string") {
              if (propertyMetadata.bindable !== true) {
                // runtime bindings are not allowed, so convert strings into actual primitive types
                switch (propertyMetadata.type) {
                  case "boolean":
                    vValue = vValue === "true";
                    break;
                  case "number":
                    vValue = Number(vValue);
                    break;
                }
              } else {
                // runtime bindings are allowed, so resolve the values as BindingToolkit expressions
                vValue = resolveBindingString(vValue, propertyMetadata.type);
              }
            }
            classSettings[propertyName] = vValue;
          } else if (pageModelContext.getObject() !== undefined) {
            // get value from page model
            classSettings[propertyName] = pageModelContext.getObject();
          } else {
            // bind to metamodel
            classSettings[propertyName] = metaModel.createBindingContext(feCustomData[propertyName]);
          }
        }
        for (var eventName in MyClass.metadata.events) {
          if (feCustomData[eventName] !== undefined && feCustomData[eventName].startsWith(".")) {
            classSettings[eventName] = ObjectPath.get(feCustomData[eventName].substring(1), mSettings.containingView.getController());
          } else {
            classSettings[eventName] = ""; // For now, might need to resolve more stuff
          }
        }

        return Promise.resolve(ManagedObject.runWithPreprocessors(function () {
          var renderedControl = new MyClass(classSettings, {}, {
            isRuntimeInstantiation: true,
            isPublic: false,
            appComponent: _appComponent
          }).render(mSettings.containingView, _appComponent);
          if (!_this3._bAsync) {
            _this3._aContent = renderedControl;
          }
          return renderedControl;
        }, {
          id: function (sId) {
            return mSettings.containingView.createId(sId);
          },
          settings: function (controlSettings) {
            var allAssociations = this.getMetadata().getAssociations();
            for (var _i = 0, _Object$keys = Object.keys(allAssociations); _i < _Object$keys.length; _i++) {
              var associationDetailName = _Object$keys[_i];
              if (controlSettings.hasOwnProperty(associationDetailName)) {
                controlSettings[associationDetailName] = mSettings.containingView.createId(controlSettings[associationDetailName]);
              }
            }
            return controlSettings;
          }
        }));
      } catch (e) {
        return Promise.reject(e);
      }
    }
  });
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJCdWlsZGluZ0Jsb2NrQmFzZSIsIm9Qcm9wcyIsIl9vQ29udHJvbENvbmZpZyIsIl9vU2V0dGluZ3MiLCJpc1B1YmxpYyIsImdldENvbnZlcnRlckNvbnRleHQiLCJvVmlzdWFsaXphdGlvbk9iamVjdFBhdGgiLCJjb250ZXh0UGF0aCIsIm1TZXR0aW5ncyIsIm1FeHRyYVBhcmFtcyIsIm9BcHBDb21wb25lbnQiLCJhcHBDb21wb25lbnQiLCJvcmlnaW5hbFZpZXdEYXRhIiwibW9kZWxzIiwidmlld0RhdGEiLCJnZXREYXRhIiwiT2JqZWN0IiwiYXNzaWduIiwicmVzb3VyY2VCdW5kbGUiLCJkZWVwQ2xvbmUiLCJjb250cm9sQ29uZmlndXJhdGlvbiIsIm1lcmdlIiwiQ29udmVydGVyQ29udGV4dCIsImNyZWF0ZUNvbnZlcnRlckNvbnRleHRGb3JNYWNybyIsInN0YXJ0aW5nRW50aXR5U2V0IiwibmFtZSIsIm1ldGFNb2RlbCIsImdldERpYWdub3N0aWNzIiwiY29udGV4dExvY2F0aW9uIiwia2V5cyIsImZvckVhY2giLCJwcm9wTmFtZSIsImNyZWF0ZUlkIiwiaWQiLCJzdHJpbmdQYXJ0cyIsImdlbmVyYXRlIiwidW5kZWZpbmVkIiwiZ2V0UHJvcGVydGllcyIsImFsbFByb3BlcnRpZXMiLCJvSW5zdGFuY2VLZXkiLCJoYXNPd25Qcm9wZXJ0eSIsInJlZ2lzdGVyIiwidW5yZWdpc3RlciIsImFkZENvbmRpdGlvbmFsbHkiLCJjb25kaXRpb24iLCJwYXJ0VG9BZGQiLCJhdHRyIiwiYXR0cmlidXRlTmFtZSIsInZhbHVlIiwiZXNjYXBlWE1MQXR0cmlidXRlVmFsdWUiLCJlbnN1cmVNZXRhZGF0YSIsInRhcmdldCIsIm1ldGFkYXRhIiwicHJvcGVydGllcyIsImFnZ3JlZ2F0aW9ucyIsImV2ZW50cyIsInhtbEF0dHJpYnV0ZSIsImF0dHJpYnV0ZURlZmluaXRpb24iLCJwcm9wZXJ0eUtleSIsInByb3BlcnR5RGVzY3JpcHRvciIsImNvbnN0cnVjdG9yIiwiZGVmYXVsdFZhbHVlIiwiaW5pdGlhbGl6ZXIiLCJ0b1N0cmluZyIsImJsb2NrQXR0cmlidXRlIiwieG1sRXZlbnQiLCJ0eXBlIiwiYmxvY2tFdmVudCIsInhtbEFnZ3JlZ2F0aW9uIiwiYWdncmVnYXRpb25EZWZpbml0aW9uIiwiYmxvY2tBZ2dyZWdhdGlvbiIsIlJVTlRJTUVfQkxPQ0tTIiwiZGVmaW5lQnVpbGRpbmdCbG9jayIsIm9CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbiIsImNsYXNzRGVmaW5pdGlvbiIsInhtbFRhZyIsIm5hbWVzcGFjZSIsInB1YmxpY05hbWVzcGFjZSIsImZyYWdtZW50IiwiaXNPcGVuIiwiaXNSdW50aW1lIiwiYXBpVmVyc2lvbiIsInByb3RvdHlwZSIsImdldFRlbXBsYXRlIiwiY2xhc3NOYW1lIiwiZXh0cmFQcm9wcyIsInByb3BlcnRpZXNLZXkiLCJwcm9wZXJ0eVZhbHVlIiwiaXNBIiwiZ2V0UGF0aCIsInB1c2giLCJ4bWwiLCJldmVudHNLZXkiLCJldmVudHNWYWx1ZSIsInJlZ2lzdGVyQnVpbGRpbmdCbG9jayIsIlhNTFByZXByb2Nlc3NvciIsInBsdWdJbiIsIkZyYWdtZW50IiwicmVnaXN0ZXJUeXBlIiwibG9hZCIsImZyYWdtZW50TmFtZSIsImluaXQiLCJNeUNsYXNzIiwiZnJhZ21lbnRDb250ZW50IiwiY2xhc3NTZXR0aW5ncyIsImZlQ3VzdG9tRGF0YSIsImN1c3RvbURhdGEiLCJtUHJvcGVydGllcyIsInBhZ2VDb21wb25lbnQiLCJDb21wb25lbnQiLCJnZXRPd25lckNvbXBvbmVudEZvciIsImNvbnRhaW5pbmdWaWV3IiwiQ29tbW9uVXRpbHMiLCJnZXRBcHBDb21wb25lbnQiLCJnZXRNZXRhTW9kZWwiLCJwYWdlTW9kZWwiLCJnZXRNb2RlbCIsInByb3BlcnR5TmFtZSIsInByb3BlcnR5TWV0YWRhdGEiLCJwYWdlTW9kZWxDb250ZXh0IiwiY3JlYXRlQmluZGluZ0NvbnRleHQiLCJ2VmFsdWUiLCJiaW5kYWJsZSIsIk51bWJlciIsInJlc29sdmVCaW5kaW5nU3RyaW5nIiwiZ2V0T2JqZWN0IiwiZXZlbnROYW1lIiwic3RhcnRzV2l0aCIsIk9iamVjdFBhdGgiLCJnZXQiLCJzdWJzdHJpbmciLCJnZXRDb250cm9sbGVyIiwiTWFuYWdlZE9iamVjdCIsInJ1bldpdGhQcmVwcm9jZXNzb3JzIiwicmVuZGVyZWRDb250cm9sIiwiaXNSdW50aW1lSW5zdGFudGlhdGlvbiIsInJlbmRlciIsIl9iQXN5bmMiLCJfYUNvbnRlbnQiLCJzSWQiLCJzZXR0aW5ncyIsImNvbnRyb2xTZXR0aW5ncyIsImFsbEFzc29jaWF0aW9ucyIsImdldE1ldGFkYXRhIiwiZ2V0QXNzb2NpYXRpb25zIiwiYXNzb2NpYXRpb25EZXRhaWxOYW1lIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJCdWlsZGluZ0Jsb2NrLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBkZWVwQ2xvbmUgZnJvbSBcInNhcC9iYXNlL3V0aWwvZGVlcENsb25lXCI7XG5pbXBvcnQgbWVyZ2UgZnJvbSBcInNhcC9iYXNlL3V0aWwvbWVyZ2VcIjtcbmltcG9ydCBPYmplY3RQYXRoIGZyb20gXCJzYXAvYmFzZS91dGlsL09iamVjdFBhdGhcIjtcbmltcG9ydCBBcHBDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL0FwcENvbXBvbmVudFwiO1xuaW1wb3J0IHsgZXNjYXBlWE1MQXR0cmlidXRlVmFsdWUsIHJlZ2lzdGVyQnVpbGRpbmdCbG9jaywgeG1sIH0gZnJvbSBcInNhcC9mZS9jb3JlL2J1aWxkaW5nQmxvY2tzL0J1aWxkaW5nQmxvY2tSdW50aW1lXCI7XG5pbXBvcnQgQ29tbW9uVXRpbHMgZnJvbSBcInNhcC9mZS9jb3JlL0NvbW1vblV0aWxzXCI7XG5pbXBvcnQgeyByZXNvbHZlQmluZGluZ1N0cmluZyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgeyBnZW5lcmF0ZSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL1N0YWJsZUlkSGVscGVyXCI7XG5pbXBvcnQgVGVtcGxhdGVDb21wb25lbnQgZnJvbSBcInNhcC9mZS9jb3JlL1RlbXBsYXRlQ29tcG9uZW50XCI7XG5pbXBvcnQgTWFuYWdlZE9iamVjdCBmcm9tIFwic2FwL3VpL2Jhc2UvTWFuYWdlZE9iamVjdFwiO1xuaW1wb3J0IENvbXBvbmVudCBmcm9tIFwic2FwL3VpL2NvcmUvQ29tcG9uZW50XCI7XG5pbXBvcnQgRnJhZ21lbnQgZnJvbSBcInNhcC91aS9jb3JlL0ZyYWdtZW50XCI7XG5pbXBvcnQgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCBYTUxQcmVwcm9jZXNzb3IgZnJvbSBcInNhcC91aS9jb3JlL3V0aWwvWE1MUHJlcHJvY2Vzc29yXCI7XG5pbXBvcnQgQ29udHJvbCBmcm9tIFwic2FwL3VpL21kYy9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSB7IE1hbmFnZWRPYmplY3RFeCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcbmltcG9ydCBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCIuLi9jb252ZXJ0ZXJzL0NvbnZlcnRlckNvbnRleHRcIjtcblxuLy8gVHlwZSBmb3IgdGhlIGFjY2Vzc29yIGRlY29yYXRvciB0aGF0IHdlIGVuZCB1cCB3aXRoIGluIGJhYmVsLlxudHlwZSBBY2Nlc3NvckRlc2NyaXB0b3I8VD4gPSBUeXBlZFByb3BlcnR5RGVzY3JpcHRvcjxUPiAmIHsgaW5pdGlhbGl6ZXI/OiAoKSA9PiBUIH07XG5leHBvcnQgdHlwZSBCdWlsZGluZ0Jsb2NrRXh0cmFTZXR0aW5ncyA9IHtcblx0aXNQdWJsaWM6IGJvb2xlYW47XG5cdGlzUnVudGltZUluc3RhbnRpYXRpb24/OiBib29sZWFuO1xuXHRhcHBDb21wb25lbnQ6IEFwcENvbXBvbmVudDtcbn07XG5cbi8qKlxuICogQmFzZSBjbGFzcyBmb3IgQnVpbGRpbmcgQmxvY2tcbiAqL1xuZXhwb3J0IGNsYXNzIEJ1aWxkaW5nQmxvY2tCYXNlIHtcblx0cHJvdGVjdGVkIGlzUHVibGljID0gZmFsc2U7XG5cdHByb3RlY3RlZCBpZCE6IHN0cmluZztcblx0Y29uc3RydWN0b3Iob1Byb3BzOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgX29Db250cm9sQ29uZmlnPzogYW55LCBfb1NldHRpbmdzPzogQnVpbGRpbmdCbG9ja0V4dHJhU2V0dGluZ3MpIHtcblx0XHRPYmplY3Qua2V5cyhvUHJvcHMpLmZvckVhY2goKHByb3BOYW1lKSA9PiB7XG5cdFx0XHQvLyBUaGlzIG5lZWRzIHRvIGJlIGNhc3RlZCBhcyBhbnkgc2luY2Ugd2UgYXJlIGFzc2lnbmluZyB0aGUgcHJvcGVydGllcyB0byB0aGUgaW5zdGFuY2Ugd2l0aG91dCBrbm93aW5nIHRoZWlyIHR5cGVcblx0XHRcdHRoaXNbcHJvcE5hbWUgYXMga2V5b2YgdGhpc10gPSBvUHJvcHNbcHJvcE5hbWVdIGFzIGFueTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBDb252ZXJ0IHRoZSBnaXZlbiBsb2NhbCBlbGVtZW50IElEIHRvIGEgZ2xvYmFsbHkgdW5pcXVlIElEIGJ5IHByZWZpeGluZyB3aXRoIHRoZSBCdWlsZGluZyBCbG9jayBJRC5cblx0ICpcblx0ICogQHBhcmFtIHN0cmluZ1BhcnRzXG5cdCAqIEByZXR1cm5zIEVpdGhlciB0aGUgZ2xvYmFsIElEIG9yIHVuZGVmaW5lZCBpZiB0aGUgQnVpbGRpbmcgQmxvY2sgZG9lc24ndCBoYXZlIGFuIElEXG5cdCAqL1xuXHRwdWJsaWMgY3JlYXRlSWQoLi4uc3RyaW5nUGFydHM6IHN0cmluZ1tdKSB7XG5cdFx0Ly8gSWYgdGhlIGNoaWxkIGluc3RhbmNlIGhhcyBhbiBJRCBwcm9wZXJ0eSB1c2UgaXQgb3RoZXJ3aXNlIHJldHVybiB1bmRlZmluZWRcblx0XHRpZiAodGhpcy5pZCkge1xuXHRcdFx0cmV0dXJuIGdlbmVyYXRlKFsodGhpcyBhcyBhbnkpLmlkLCAuLi5zdHJpbmdQYXJ0c10pO1xuXHRcdH1cblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdC8vIFRoaXMgYmxvY2sgaXMgY29tbWVudGVkIG91dCBiZWNhdXNlIEkgYW0gbm90IHVzaW5nIHRoZW0gZm9yIG5vdyAvIG5lZWQgdG8gY2hhbmdlIHRoaXMgYnV0IHN0aWxsIHdhbnQgdG8ga2VlcCB0aGVtIGFyb3VuZFxuXHRwcm90ZWN0ZWQgZ2V0Q29udmVydGVyQ29udGV4dCA9IGZ1bmN0aW9uIChvVmlzdWFsaXphdGlvbk9iamVjdFBhdGg6IGFueSwgY29udGV4dFBhdGg6IGFueSwgbVNldHRpbmdzOiBhbnksIG1FeHRyYVBhcmFtcz86IGFueSkge1xuXHRcdGNvbnN0IG9BcHBDb21wb25lbnQgPSBtU2V0dGluZ3MuYXBwQ29tcG9uZW50O1xuXHRcdGNvbnN0IG9yaWdpbmFsVmlld0RhdGEgPSBtU2V0dGluZ3MubW9kZWxzLnZpZXdEYXRhICYmIG1TZXR0aW5ncy5tb2RlbHMudmlld0RhdGEuZ2V0RGF0YSgpO1xuXHRcdGxldCB2aWV3RGF0YSA9IE9iamVjdC5hc3NpZ24oe30sIG9yaWdpbmFsVmlld0RhdGEpO1xuXHRcdGRlbGV0ZSB2aWV3RGF0YS5yZXNvdXJjZUJ1bmRsZTtcblx0XHR2aWV3RGF0YSA9IGRlZXBDbG9uZSh2aWV3RGF0YSk7XG5cdFx0dmlld0RhdGEuY29udHJvbENvbmZpZ3VyYXRpb24gPSBtZXJnZSh2aWV3RGF0YS5jb250cm9sQ29uZmlndXJhdGlvbiwgbUV4dHJhUGFyYW1zKTtcblx0XHRyZXR1cm4gQ29udmVydGVyQ29udGV4dC5jcmVhdGVDb252ZXJ0ZXJDb250ZXh0Rm9yTWFjcm8oXG5cdFx0XHRvVmlzdWFsaXphdGlvbk9iamVjdFBhdGguc3RhcnRpbmdFbnRpdHlTZXQubmFtZSxcblx0XHRcdG1TZXR0aW5ncy5tb2RlbHMubWV0YU1vZGVsLFxuXHRcdFx0b0FwcENvbXBvbmVudCAmJiBvQXBwQ29tcG9uZW50LmdldERpYWdub3N0aWNzKCksXG5cdFx0XHRtZXJnZSxcblx0XHRcdG9WaXN1YWxpemF0aW9uT2JqZWN0UGF0aC5jb250ZXh0TG9jYXRpb24sXG5cdFx0XHR2aWV3RGF0YVxuXHRcdCk7XG5cdH07XG5cdHB1YmxpYyBnZXRQcm9wZXJ0aWVzKCkge1xuXHRcdGNvbnN0IGFsbFByb3BlcnRpZXM6IFJlY29yZDxzdHJpbmcsIGFueT4gPSB7fTtcblx0XHRmb3IgKGNvbnN0IG9JbnN0YW5jZUtleSBpbiB0aGlzKSB7XG5cdFx0XHRpZiAodGhpcy5oYXNPd25Qcm9wZXJ0eShvSW5zdGFuY2VLZXkpKSB7XG5cdFx0XHRcdGFsbFByb3BlcnRpZXNbb0luc3RhbmNlS2V5XSA9IHRoaXNbb0luc3RhbmNlS2V5XTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIGFsbFByb3BlcnRpZXM7XG5cdH1cblx0c3RhdGljIHJlZ2lzdGVyKCkge1xuXHRcdC8vIFRvIGJlIG92ZXJyaWRlblxuXHR9XG5cdHN0YXRpYyB1bnJlZ2lzdGVyKCkge1xuXHRcdC8vIFRvIGJlIG92ZXJyaWRlblxuXHR9XG5cdHB1YmxpYyBhZGRDb25kaXRpb25hbGx5KGNvbmRpdGlvbiA9IGZhbHNlLCBwYXJ0VG9BZGQ/OiBhbnkpIHtcblx0XHRpZiAoY29uZGl0aW9uKSB7XG5cdFx0XHRyZXR1cm4gcGFydFRvQWRkO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gXCJcIjtcblx0XHR9XG5cdH1cblx0cHJvdGVjdGVkIGF0dHIoYXR0cmlidXRlTmFtZTogc3RyaW5nLCB2YWx1ZTogYW55KTogKCkgPT4gc3RyaW5nIHtcblx0XHRpZiAodmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0cmV0dXJuICgpID0+IGAke2F0dHJpYnV0ZU5hbWV9PVwiJHtlc2NhcGVYTUxBdHRyaWJ1dGVWYWx1ZSh2YWx1ZSl9XCJgO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gKCkgPT4gXCJcIjtcblx0XHR9XG5cdH1cbn1cblxuLyoqXG4gKiBCYXNlIGNsYXNzIGZvciBydW50aW1lIGJ1aWxkaW5nIGJsb2Nrc1xuICovXG5leHBvcnQgaW50ZXJmYWNlIFJ1bnRpbWVCdWlsZGluZ0Jsb2NrIGV4dGVuZHMgQnVpbGRpbmdCbG9ja0Jhc2Uge1xuXHRyZW5kZXIoY29udGFpbmluZ1ZpZXc6IFZpZXcsIGFwcENvbXBvbmVudDogQXBwQ29tcG9uZW50KTogQ29udHJvbDtcbn1cblxuZXhwb3J0IHR5cGUgQnVpbGRpbmdCbG9ja1Byb3BlcnR5RGVmaW5pdGlvbiA9IHtcblx0dHlwZTogc3RyaW5nO1xuXHRpc1B1YmxpYz86IGJvb2xlYW47XG5cdGRlZmF1bHRWYWx1ZT86IGFueTtcblx0Y29tcHV0ZWQ/OiBib29sZWFuO1xuXHRyZXF1aXJlZD86IGJvb2xlYW47XG5cdGJpbmRhYmxlPzogYm9vbGVhbjsgLy8gb25seSBjb25zaWRlcmVkIGZvciBydW50aW1lIGJ1aWxkaW5nIGJsb2Nrc1xuXHQka2luZD86IHN0cmluZ1tdO1xufTtcbmV4cG9ydCB0eXBlIEJ1aWxkaW5nQmxvY2tNZXRhZGF0YUNvbnRleHREZWZpbml0aW9uID0ge1xuXHR0eXBlOiBzdHJpbmc7XG5cdGlzUHVibGljPzogYm9vbGVhbjtcblx0cmVxdWlyZWQ/OiBib29sZWFuO1xuXHRjb21wdXRlZD86IGJvb2xlYW47XG5cdCRUeXBlPzogc3RyaW5nW107XG5cdCRraW5kPzogc3RyaW5nW107XG59O1xuZXhwb3J0IHR5cGUgQnVpbGRpbmdCbG9ja0V2ZW50ID0ge307XG5leHBvcnQgdHlwZSBCdWlsZGluZ0Jsb2NrQWdncmVnYXRpb25EZWZpbml0aW9uID0ge1xuXHRpc1B1YmxpYz86IGJvb2xlYW47XG5cdHR5cGU6IHN0cmluZztcblx0c2xvdD86IHN0cmluZztcblx0aXNEZWZhdWx0PzogYm9vbGVhbjtcbn07XG50eXBlIENvbW1vbkJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uID0ge1xuXHRuYW1lc3BhY2U6IHN0cmluZztcblx0bmFtZTogc3RyaW5nO1xuXHR4bWxUYWc/OiBzdHJpbmc7XG5cdGZyYWdtZW50Pzogc3RyaW5nO1xuXHRwdWJsaWNOYW1lc3BhY2U/OiBzdHJpbmc7XG5cblx0aXNSdW50aW1lPzogYm9vbGVhbjtcblx0aXNPcGVuPzogYm9vbGVhbjtcbn07XG5leHBvcnQgdHlwZSBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvblYyID0gQ29tbW9uQnVpbGRpbmdCbG9ja0RlZmluaXRpb24gJlxuXHR0eXBlb2YgQnVpbGRpbmdCbG9ja0Jhc2UgJiB7XG5cdFx0YXBpVmVyc2lvbjogMjtcblx0XHRtZXRhZGF0YTogQnVpbGRpbmdCbG9ja01ldGFkYXRhO1xuXHR9O1xuXG5leHBvcnQgdHlwZSBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvblYxID0gQ29tbW9uQnVpbGRpbmdCbG9ja0RlZmluaXRpb24gJiB7XG5cdG5hbWU6IHN0cmluZztcblx0YXBpVmVyc2lvbj86IDE7XG5cdGNyZWF0ZT86IEZ1bmN0aW9uO1xuXHRnZXRUZW1wbGF0ZT86IEZ1bmN0aW9uO1xuXHRtZXRhZGF0YTogQnVpbGRpbmdCbG9ja01ldGFkYXRhO1xufTtcbmV4cG9ydCB0eXBlIEJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uID0gQnVpbGRpbmdCbG9ja0RlZmluaXRpb25WMiB8IEJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uVjE7XG5leHBvcnQgdHlwZSBCdWlsZGluZ0Jsb2NrTWV0YWRhdGEgPSB7XG5cdGV2ZW50czogUmVjb3JkPHN0cmluZywgQnVpbGRpbmdCbG9ja0V2ZW50Pjtcblx0cHJvcGVydGllczogUmVjb3JkPHN0cmluZywgQnVpbGRpbmdCbG9ja1Byb3BlcnR5RGVmaW5pdGlvbj47XG5cdGFnZ3JlZ2F0aW9uczogUmVjb3JkPHN0cmluZywgQnVpbGRpbmdCbG9ja0FnZ3JlZ2F0aW9uRGVmaW5pdGlvbj47XG59O1xuXG5jb25zdCBlbnN1cmVNZXRhZGF0YSA9IGZ1bmN0aW9uICh0YXJnZXQ6IFBhcnRpYWw8QnVpbGRpbmdCbG9ja0RlZmluaXRpb25WMj4pOiBCdWlsZGluZ0Jsb2NrTWV0YWRhdGEge1xuXHRpZiAoIXRhcmdldC5oYXNPd25Qcm9wZXJ0eShcIm1ldGFkYXRhXCIpKSB7XG5cdFx0dGFyZ2V0Lm1ldGFkYXRhID0gZGVlcENsb25lKFxuXHRcdFx0dGFyZ2V0Lm1ldGFkYXRhIHx8IHtcblx0XHRcdFx0cHJvcGVydGllczoge30sXG5cdFx0XHRcdGFnZ3JlZ2F0aW9uczoge30sXG5cdFx0XHRcdGV2ZW50czoge31cblx0XHRcdH1cblx0XHQpO1xuXHR9XG5cdHJldHVybiB0YXJnZXQubWV0YWRhdGEgYXMgQnVpbGRpbmdCbG9ja01ldGFkYXRhO1xufTtcblxuLyoqXG4gKiBJbmRpY2F0ZXMgdGhhdCB0aGUgcHJvcGVydHkgc2hhbGwgYmUgZGVjbGFyZWQgYXMgYW4geG1sIGF0dHJpYnV0ZSB0aGF0IGNhbiBiZSB1c2VkIGZyb20gdGhlIG91dHNpZGUgb2YgdGhlIGJ1aWxkaW5nIGJsb2NrLlxuICpcbiAqIElmIGRlZmluaW5nIGEgcnVudGltZSBCdWlsZGluZyBCbG9jaywgcGxlYXNlIG1ha2Ugc3VyZSB0byB1c2UgdGhlIGNvcnJlY3QgdHlwaW5nczogRGVwZW5kaW5nIG9uIGl0cyBtZXRhZGF0YSxcbiAqIGEgcHJvcGVydHkgY2FuIGVpdGhlciBiZSBhIHtAbGluayBzYXAudWkubW9kZWwuQ29udGV4dH0gKDxjb2RlPnR5cGU6ICdzYXAudWkubW9kZWwuQ29udGV4dCc8L2NvZGU+KSxcbiAqIGEgY29uc3RhbnQgKDxjb2RlPmJpbmRhYmxlOiBmYWxzZTwvY29kZT4pLCBvciBhIHtAbGluayBCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb259ICg8Y29kZT5iaW5kYWJsZTogdHJ1ZTwvY29kZT4pLlxuICpcbiAqIEBwYXJhbSBhdHRyaWJ1dGVEZWZpbml0aW9uXG4gKiBAcmV0dXJucyBUaGUgZGVjb3JhdGVkIHByb3BlcnR5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB4bWxBdHRyaWJ1dGUoYXR0cmlidXRlRGVmaW5pdGlvbjogQnVpbGRpbmdCbG9ja1Byb3BlcnR5RGVmaW5pdGlvbik6IFByb3BlcnR5RGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IEJ1aWxkaW5nQmxvY2tCYXNlLCBwcm9wZXJ0eUtleTogc3RyaW5nIHwgU3ltYm9sLCBwcm9wZXJ0eURlc2NyaXB0b3I6IEFjY2Vzc29yRGVzY3JpcHRvcjxhbnk+KSB7XG5cdFx0Y29uc3QgbWV0YWRhdGEgPSBlbnN1cmVNZXRhZGF0YSh0YXJnZXQuY29uc3RydWN0b3IpO1xuXHRcdGlmIChhdHRyaWJ1dGVEZWZpbml0aW9uLmRlZmF1bHRWYWx1ZSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHQvLyBJZiB0aGVyZSBpcyBubyBkZWZhdWx0VmFsdWUgd2UgY2FuIHRha2UgdGhlIHZhbHVlIGZyb20gdGhlIGluaXRpYWxpemVyIChuYXR1cmFsIHdheSBvZiBkZWZpbmluZyBkZWZhdWx0cylcblx0XHRcdGF0dHJpYnV0ZURlZmluaXRpb24uZGVmYXVsdFZhbHVlID0gcHJvcGVydHlEZXNjcmlwdG9yLmluaXRpYWxpemVyPy4oKTtcblx0XHR9XG5cdFx0ZGVsZXRlIHByb3BlcnR5RGVzY3JpcHRvci5pbml0aWFsaXplcjtcblx0XHRpZiAobWV0YWRhdGEucHJvcGVydGllc1twcm9wZXJ0eUtleS50b1N0cmluZygpXSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRtZXRhZGF0YS5wcm9wZXJ0aWVzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldID0gYXR0cmlidXRlRGVmaW5pdGlvbjtcblx0XHR9XG5cblx0XHRyZXR1cm4gcHJvcGVydHlEZXNjcmlwdG9yO1xuXHR9IGFzIGFueTsgLy8gTmVlZGVkIHRvIG1ha2UgVFMgaGFwcHkgd2l0aCB0aG9zZSBkZWNvcmF0b3JzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrQXR0cmlidXRlKGF0dHJpYnV0ZURlZmluaXRpb246IEJ1aWxkaW5nQmxvY2tQcm9wZXJ0eURlZmluaXRpb24pOiBQcm9wZXJ0eURlY29yYXRvciB7XG5cdHJldHVybiB4bWxBdHRyaWJ1dGUoYXR0cmlidXRlRGVmaW5pdGlvbik7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB4bWxFdmVudCgpOiBQcm9wZXJ0eURlY29yYXRvciB7XG5cdHJldHVybiBmdW5jdGlvbiAodGFyZ2V0OiBCdWlsZGluZ0Jsb2NrQmFzZSwgcHJvcGVydHlLZXk6IHN0cmluZyB8IFN5bWJvbCwgcHJvcGVydHlEZXNjcmlwdG9yOiBBY2Nlc3NvckRlc2NyaXB0b3I8YW55Pikge1xuXHRcdGNvbnN0IG1ldGFkYXRhID0gZW5zdXJlTWV0YWRhdGEodGFyZ2V0LmNvbnN0cnVjdG9yKTtcblx0XHRkZWxldGUgcHJvcGVydHlEZXNjcmlwdG9yLmluaXRpYWxpemVyO1xuXHRcdGlmIChtZXRhZGF0YS5ldmVudHNbcHJvcGVydHlLZXkudG9TdHJpbmcoKV0gPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0bWV0YWRhdGEuZXZlbnRzW3Byb3BlcnR5S2V5LnRvU3RyaW5nKCldID0geyB0eXBlOiBcIkZ1bmN0aW9uXCIgfTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcHJvcGVydHlEZXNjcmlwdG9yO1xuXHR9IGFzIGFueTsgLy8gTmVlZGVkIHRvIG1ha2UgVFMgaGFwcHkgd2l0aCB0aG9zZSBkZWNvcmF0b3JzO1xufVxuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrRXZlbnQoKTogUHJvcGVydHlEZWNvcmF0b3Ige1xuXHRyZXR1cm4geG1sRXZlbnQoKTtcbn1cbi8qKlxuICogSW5kaWNhdGVzIHRoYXQgdGhlIHByb3BlcnR5IHNoYWxsIGJlIGRlY2xhcmVkIGFzIGFuIHhtbCBhZ2dyZWdhdGlvbiB0aGF0IGNhbiBiZSB1c2VkIGZyb20gdGhlIG91dHNpZGUgb2YgdGhlIGJ1aWxkaW5nIGJsb2NrLlxuICpcbiAqIEBwYXJhbSBhZ2dyZWdhdGlvbkRlZmluaXRpb25cbiAqIEByZXR1cm5zIFRoZSBkZWNvcmF0ZWQgcHJvcGVydHlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHhtbEFnZ3JlZ2F0aW9uKGFnZ3JlZ2F0aW9uRGVmaW5pdGlvbjogQnVpbGRpbmdCbG9ja0FnZ3JlZ2F0aW9uRGVmaW5pdGlvbik6IFByb3BlcnR5RGVjb3JhdG9yIHtcblx0cmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQ6IEJ1aWxkaW5nQmxvY2tCYXNlLCBwcm9wZXJ0eUtleTogc3RyaW5nLCBwcm9wZXJ0eURlc2NyaXB0b3I6IFR5cGVkUHJvcGVydHlEZXNjcmlwdG9yPGFueT4pIHtcblx0XHRjb25zdCBtZXRhZGF0YSA9IGVuc3VyZU1ldGFkYXRhKHRhcmdldC5jb25zdHJ1Y3Rvcik7XG5cdFx0ZGVsZXRlIChwcm9wZXJ0eURlc2NyaXB0b3IgYXMgYW55KS5pbml0aWFsaXplcjtcblx0XHRpZiAobWV0YWRhdGEuYWdncmVnYXRpb25zW3Byb3BlcnR5S2V5XSA9PT0gdW5kZWZpbmVkKSB7XG5cdFx0XHRtZXRhZGF0YS5hZ2dyZWdhdGlvbnNbcHJvcGVydHlLZXldID0gYWdncmVnYXRpb25EZWZpbml0aW9uO1xuXHRcdH1cblxuXHRcdHJldHVybiBwcm9wZXJ0eURlc2NyaXB0b3I7XG5cdH0gYXMgYW55O1xufVxuZXhwb3J0IGZ1bmN0aW9uIGJsb2NrQWdncmVnYXRpb24oYWdncmVnYXRpb25EZWZpbml0aW9uOiBCdWlsZGluZ0Jsb2NrQWdncmVnYXRpb25EZWZpbml0aW9uKTogUHJvcGVydHlEZWNvcmF0b3Ige1xuXHRyZXR1cm4geG1sQWdncmVnYXRpb24oYWdncmVnYXRpb25EZWZpbml0aW9uKTtcbn1cbmNvbnN0IFJVTlRJTUVfQkxPQ0tTOiBSZWNvcmQ8c3RyaW5nLCBSdW50aW1lQnVpbGRpbmdCbG9jayAmIEJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uVjI+ID0ge307XG5leHBvcnQgZnVuY3Rpb24gZGVmaW5lQnVpbGRpbmdCbG9jayhvQnVpbGRpbmdCbG9ja0RlZmluaXRpb246IENvbW1vbkJ1aWxkaW5nQmxvY2tEZWZpbml0aW9uKTogQ2xhc3NEZWNvcmF0b3Ige1xuXHRyZXR1cm4gZnVuY3Rpb24gKGNsYXNzRGVmaW5pdGlvbjogYW55KSB7XG5cdFx0ZW5zdXJlTWV0YWRhdGEoY2xhc3NEZWZpbml0aW9uKTtcblx0XHRjbGFzc0RlZmluaXRpb24ueG1sVGFnID0gb0J1aWxkaW5nQmxvY2tEZWZpbml0aW9uLm5hbWU7XG5cdFx0Y2xhc3NEZWZpbml0aW9uLm5hbWVzcGFjZSA9IG9CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5uYW1lc3BhY2U7XG5cdFx0Y2xhc3NEZWZpbml0aW9uLnB1YmxpY05hbWVzcGFjZSA9IG9CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5wdWJsaWNOYW1lc3BhY2U7XG5cdFx0Y2xhc3NEZWZpbml0aW9uLmZyYWdtZW50ID0gb0J1aWxkaW5nQmxvY2tEZWZpbml0aW9uLmZyYWdtZW50O1xuXHRcdGNsYXNzRGVmaW5pdGlvbi5pc09wZW4gPSBvQnVpbGRpbmdCbG9ja0RlZmluaXRpb24uaXNPcGVuO1xuXHRcdGNsYXNzRGVmaW5pdGlvbi5pc1J1bnRpbWUgPSBvQnVpbGRpbmdCbG9ja0RlZmluaXRpb24uaXNSdW50aW1lO1xuXHRcdGNsYXNzRGVmaW5pdGlvbi5hcGlWZXJzaW9uID0gMjtcblx0XHRpZiAoY2xhc3NEZWZpbml0aW9uLmlzUnVudGltZSA9PT0gdHJ1ZSkge1xuXHRcdFx0Y2xhc3NEZWZpbml0aW9uLnByb3RvdHlwZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0Y29uc3QgY2xhc3NOYW1lID0gYCR7b0J1aWxkaW5nQmxvY2tEZWZpbml0aW9uLm5hbWVzcGFjZX0uJHtvQnVpbGRpbmdCbG9ja0RlZmluaXRpb24ubmFtZX1gO1xuXHRcdFx0XHRjb25zdCBleHRyYVByb3BzID0gW107XG5cdFx0XHRcdGZvciAoY29uc3QgcHJvcGVydGllc0tleSBpbiBjbGFzc0RlZmluaXRpb24ubWV0YWRhdGEucHJvcGVydGllcykge1xuXHRcdFx0XHRcdGxldCBwcm9wZXJ0eVZhbHVlID0gdGhpc1twcm9wZXJ0aWVzS2V5XTtcblx0XHRcdFx0XHRpZiAocHJvcGVydHlWYWx1ZSAhPT0gdW5kZWZpbmVkICYmIHByb3BlcnR5VmFsdWUgIT09IG51bGwpIHtcblx0XHRcdFx0XHRcdGlmIChwcm9wZXJ0eVZhbHVlPy5pc0E/LihcInNhcC51aS5tb2RlbC5Db250ZXh0XCIpID09PSB0cnVlKSB7XG5cdFx0XHRcdFx0XHRcdHByb3BlcnR5VmFsdWUgPSBwcm9wZXJ0eVZhbHVlLmdldFBhdGgoKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdGV4dHJhUHJvcHMucHVzaCh4bWxgZmVCQjoke3Byb3BlcnRpZXNLZXl9PVwiJHtwcm9wZXJ0eVZhbHVlfVwiYCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGZvciAoY29uc3QgZXZlbnRzS2V5IGluIGNsYXNzRGVmaW5pdGlvbi5tZXRhZGF0YS5ldmVudHMpIHtcblx0XHRcdFx0XHRjb25zdCBldmVudHNWYWx1ZSA9IHRoaXNbZXZlbnRzS2V5XTtcblx0XHRcdFx0XHRpZiAoZXZlbnRzVmFsdWUgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0ZXh0cmFQcm9wcy5wdXNoKHhtbGBmZUJCOiR7ZXZlbnRzS2V5fT1cIiR7ZXZlbnRzVmFsdWV9XCJgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdFx0cmV0dXJuIHhtbGA8Y29yZTpGcmFnbWVudFxuXHRcdFx0XHRcdHhtbG5zOmNvcmU9XCJzYXAudWkuY29yZVwiXG5cdFx0XHRcdFx0eG1sbnM6ZmVCQj1cInNhcC5mZS5jb3JlLmJ1aWxkaW5nQmxvY2tzXCJcblx0XHRcdFx0XHRmcmFnbWVudE5hbWU9XCIke2NsYXNzTmFtZX1cIlxuXHRcdFx0XHRcdGlkPVwie3RoaXM+aWR9XCJcblx0XHRcdFx0XHR0eXBlPVwiRkVfQ09NUE9ORU5UU1wiXG5cdFx0XHRcdFx0JHtleHRyYVByb3BzfVxuXHRcdFx0XHQ+XG5cdFx0XHRcdDwvY29yZTpGcmFnbWVudD5gO1xuXHRcdFx0fTtcblx0XHR9XG5cblx0XHRjbGFzc0RlZmluaXRpb24ucmVnaXN0ZXIgPSBmdW5jdGlvbiAoKSB7XG5cdFx0XHRyZWdpc3RlckJ1aWxkaW5nQmxvY2soY2xhc3NEZWZpbml0aW9uKTtcblx0XHRcdGlmIChjbGFzc0RlZmluaXRpb24uaXNSdW50aW1lID09PSB0cnVlKSB7XG5cdFx0XHRcdFJVTlRJTUVfQkxPQ0tTW2Ake29CdWlsZGluZ0Jsb2NrRGVmaW5pdGlvbi5uYW1lc3BhY2V9LiR7b0J1aWxkaW5nQmxvY2tEZWZpbml0aW9uLm5hbWV9YF0gPSBjbGFzc0RlZmluaXRpb247XG5cdFx0XHR9XG5cdFx0fTtcblx0XHRjbGFzc0RlZmluaXRpb24udW5yZWdpc3RlciA9IGZ1bmN0aW9uICgpIHtcblx0XHRcdFhNTFByZXByb2Nlc3Nvci5wbHVnSW4obnVsbCwgY2xhc3NEZWZpbml0aW9uLm5hbWVzcGFjZSwgY2xhc3NEZWZpbml0aW9uLm5hbWUpO1xuXHRcdFx0WE1MUHJlcHJvY2Vzc29yLnBsdWdJbihudWxsLCBjbGFzc0RlZmluaXRpb24ucHVibGljTmFtZXNwYWNlLCBjbGFzc0RlZmluaXRpb24ubmFtZSk7XG5cdFx0fTtcblx0fTtcbn1cblxuRnJhZ21lbnQucmVnaXN0ZXJUeXBlKFwiRkVfQ09NUE9ORU5UU1wiLCB7XG5cdGxvYWQ6IGFzeW5jIGZ1bmN0aW9uIChtU2V0dGluZ3M6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcblx0XHRyZXR1cm4gUlVOVElNRV9CTE9DS1NbbVNldHRpbmdzLmZyYWdtZW50TmFtZV07XG5cdH0sXG5cdGluaXQ6IGFzeW5jIGZ1bmN0aW9uIChtU2V0dGluZ3M6IFJlY29yZDxzdHJpbmcsIGFueT4pIHtcblx0XHRsZXQgTXlDbGFzczogUnVudGltZUJ1aWxkaW5nQmxvY2sgJiBCdWlsZGluZ0Jsb2NrRGVmaW5pdGlvblYyID0gbVNldHRpbmdzLmZyYWdtZW50Q29udGVudDtcblx0XHRpZiAoIU15Q2xhc3MpIHtcblx0XHRcdC8vIEluIHNvbWUgY2FzZSB3ZSBtaWdodCBoYXZlIGJlZW4gY2FsbGVkIGhlcmUgc3luY2hyb25vdXNseSAodW5zdGFzaCBjYXNlIGZvciBpbnN0YW5jZSksIHdoaWNoIG1lYW5zIHdlIGRpZG4ndCBnbyB0aHJvdWdoIHRoZSBsb2FkIGZ1bmN0aW9uXG5cdFx0XHRNeUNsYXNzID0gUlVOVElNRV9CTE9DS1NbbVNldHRpbmdzLmZyYWdtZW50TmFtZV07XG5cdFx0fVxuXHRcdGNvbnN0IGNsYXNzU2V0dGluZ3M6IGFueSA9IHt9O1xuXHRcdGNvbnN0IGZlQ3VzdG9tRGF0YTogUmVjb3JkPHN0cmluZywgYW55PiA9IG1TZXR0aW5ncz8uY3VzdG9tRGF0YT8uWzBdPy5tUHJvcGVydGllcz8udmFsdWU/LltcInNhcC5mZS5jb3JlLmJ1aWxkaW5nQmxvY2tzXCJdIHx8IHt9O1xuXHRcdGRlbGV0ZSBtU2V0dGluZ3MuY3VzdG9tRGF0YTtcblx0XHRjb25zdCBwYWdlQ29tcG9uZW50ID0gQ29tcG9uZW50LmdldE93bmVyQ29tcG9uZW50Rm9yKG1TZXR0aW5ncy5jb250YWluaW5nVmlldykgYXMgVGVtcGxhdGVDb21wb25lbnQ7XG5cdFx0Y29uc3QgYXBwQ29tcG9uZW50ID0gQ29tbW9uVXRpbHMuZ2V0QXBwQ29tcG9uZW50KG1TZXR0aW5ncy5jb250YWluaW5nVmlldyk7XG5cdFx0Y29uc3QgbWV0YU1vZGVsID0gYXBwQ29tcG9uZW50LmdldE1ldGFNb2RlbCgpO1xuXHRcdGNvbnN0IHBhZ2VNb2RlbCA9IHBhZ2VDb21wb25lbnQuZ2V0TW9kZWwoXCJfcGFnZU1vZGVsXCIpO1xuXHRcdGZvciAoY29uc3QgcHJvcGVydHlOYW1lIGluIE15Q2xhc3MubWV0YWRhdGEucHJvcGVydGllcykge1xuXHRcdFx0Y29uc3QgcHJvcGVydHlNZXRhZGF0YSA9IE15Q2xhc3MubWV0YWRhdGEucHJvcGVydGllc1twcm9wZXJ0eU5hbWVdO1xuXHRcdFx0Y29uc3QgcGFnZU1vZGVsQ29udGV4dCA9IHBhZ2VNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dChmZUN1c3RvbURhdGFbcHJvcGVydHlOYW1lXSk7XG5cblx0XHRcdGlmIChwYWdlTW9kZWxDb250ZXh0ID09PSBudWxsKSB7XG5cdFx0XHRcdC8vIHZhbHVlIGNhbm5vdCBiZSByZXNvbHZlZCwgc28gaXQgaXMgZWl0aGVyIGEgcnVudGltZSBiaW5kaW5nIG9yIGEgY29uc3RhbnRcblx0XHRcdFx0bGV0IHZWYWx1ZSA9IGZlQ3VzdG9tRGF0YVtwcm9wZXJ0eU5hbWVdO1xuXG5cdFx0XHRcdGlmICh0eXBlb2YgdlZhbHVlID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRcdFx0aWYgKHByb3BlcnR5TWV0YWRhdGEuYmluZGFibGUgIT09IHRydWUpIHtcblx0XHRcdFx0XHRcdC8vIHJ1bnRpbWUgYmluZGluZ3MgYXJlIG5vdCBhbGxvd2VkLCBzbyBjb252ZXJ0IHN0cmluZ3MgaW50byBhY3R1YWwgcHJpbWl0aXZlIHR5cGVzXG5cdFx0XHRcdFx0XHRzd2l0Y2ggKHByb3BlcnR5TWV0YWRhdGEudHlwZSkge1xuXHRcdFx0XHRcdFx0XHRjYXNlIFwiYm9vbGVhblwiOlxuXHRcdFx0XHRcdFx0XHRcdHZWYWx1ZSA9IHZWYWx1ZSA9PT0gXCJ0cnVlXCI7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdGNhc2UgXCJudW1iZXJcIjpcblx0XHRcdFx0XHRcdFx0XHR2VmFsdWUgPSBOdW1iZXIodlZhbHVlKTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly8gcnVudGltZSBiaW5kaW5ncyBhcmUgYWxsb3dlZCwgc28gcmVzb2x2ZSB0aGUgdmFsdWVzIGFzIEJpbmRpbmdUb29sa2l0IGV4cHJlc3Npb25zXG5cdFx0XHRcdFx0XHR2VmFsdWUgPSByZXNvbHZlQmluZGluZ1N0cmluZyh2VmFsdWUsIHByb3BlcnR5TWV0YWRhdGEudHlwZSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y2xhc3NTZXR0aW5nc1twcm9wZXJ0eU5hbWVdID0gdlZhbHVlO1xuXHRcdFx0fSBlbHNlIGlmIChwYWdlTW9kZWxDb250ZXh0LmdldE9iamVjdCgpICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0Ly8gZ2V0IHZhbHVlIGZyb20gcGFnZSBtb2RlbFxuXHRcdFx0XHRjbGFzc1NldHRpbmdzW3Byb3BlcnR5TmFtZV0gPSBwYWdlTW9kZWxDb250ZXh0LmdldE9iamVjdCgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Ly8gYmluZCB0byBtZXRhbW9kZWxcblx0XHRcdFx0Y2xhc3NTZXR0aW5nc1twcm9wZXJ0eU5hbWVdID0gbWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0KGZlQ3VzdG9tRGF0YVtwcm9wZXJ0eU5hbWVdKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Zm9yIChjb25zdCBldmVudE5hbWUgaW4gTXlDbGFzcy5tZXRhZGF0YS5ldmVudHMpIHtcblx0XHRcdGlmIChmZUN1c3RvbURhdGFbZXZlbnROYW1lXSAhPT0gdW5kZWZpbmVkICYmIChmZUN1c3RvbURhdGFbZXZlbnROYW1lXSBhcyBzdHJpbmcpLnN0YXJ0c1dpdGgoXCIuXCIpKSB7XG5cdFx0XHRcdGNsYXNzU2V0dGluZ3NbZXZlbnROYW1lXSA9IE9iamVjdFBhdGguZ2V0KGZlQ3VzdG9tRGF0YVtldmVudE5hbWVdLnN1YnN0cmluZygxKSwgbVNldHRpbmdzLmNvbnRhaW5pbmdWaWV3LmdldENvbnRyb2xsZXIoKSk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRjbGFzc1NldHRpbmdzW2V2ZW50TmFtZV0gPSBcIlwiOyAvLyBGb3Igbm93LCBtaWdodCBuZWVkIHRvIHJlc29sdmUgbW9yZSBzdHVmZlxuXHRcdFx0fVxuXHRcdH1cblx0XHRyZXR1cm4gKE1hbmFnZWRPYmplY3QgYXMgdW5rbm93biBhcyBNYW5hZ2VkT2JqZWN0RXgpLnJ1bldpdGhQcmVwcm9jZXNzb3JzKFxuXHRcdFx0KCkgPT4ge1xuXHRcdFx0XHRjb25zdCByZW5kZXJlZENvbnRyb2wgPSAoXG5cdFx0XHRcdFx0bmV3IE15Q2xhc3MoXG5cdFx0XHRcdFx0XHRjbGFzc1NldHRpbmdzLFxuXHRcdFx0XHRcdFx0e30sXG5cdFx0XHRcdFx0XHR7IGlzUnVudGltZUluc3RhbnRpYXRpb246IHRydWUsIGlzUHVibGljOiBmYWxzZSwgYXBwQ29tcG9uZW50OiBhcHBDb21wb25lbnQgfVxuXHRcdFx0XHRcdCkgYXMgUnVudGltZUJ1aWxkaW5nQmxvY2tcblx0XHRcdFx0KS5yZW5kZXIobVNldHRpbmdzLmNvbnRhaW5pbmdWaWV3LCBhcHBDb21wb25lbnQpO1xuXHRcdFx0XHRpZiAoISh0aGlzIGFzIGFueSkuX2JBc3luYykge1xuXHRcdFx0XHRcdCh0aGlzIGFzIGFueSkuX2FDb250ZW50ID0gcmVuZGVyZWRDb250cm9sO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiByZW5kZXJlZENvbnRyb2w7XG5cdFx0XHR9LFxuXHRcdFx0e1xuXHRcdFx0XHRpZDogZnVuY3Rpb24gKHNJZDogc3RyaW5nKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG1TZXR0aW5ncy5jb250YWluaW5nVmlldy5jcmVhdGVJZChzSWQpO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRzZXR0aW5nczogZnVuY3Rpb24gKGNvbnRyb2xTZXR0aW5nczogYW55KSB7XG5cdFx0XHRcdFx0Y29uc3QgYWxsQXNzb2NpYXRpb25zID0gdGhpcy5nZXRNZXRhZGF0YSgpLmdldEFzc29jaWF0aW9ucygpO1xuXHRcdFx0XHRcdGZvciAoY29uc3QgYXNzb2NpYXRpb25EZXRhaWxOYW1lIG9mIE9iamVjdC5rZXlzKGFsbEFzc29jaWF0aW9ucykpIHtcblx0XHRcdFx0XHRcdGlmIChjb250cm9sU2V0dGluZ3MuaGFzT3duUHJvcGVydHkoYXNzb2NpYXRpb25EZXRhaWxOYW1lKSkge1xuXHRcdFx0XHRcdFx0XHRjb250cm9sU2V0dGluZ3NbYXNzb2NpYXRpb25EZXRhaWxOYW1lXSA9IG1TZXR0aW5ncy5jb250YWluaW5nVmlldy5jcmVhdGVJZChcblx0XHRcdFx0XHRcdFx0XHRjb250cm9sU2V0dGluZ3NbYXNzb2NpYXRpb25EZXRhaWxOYW1lXVxuXHRcdFx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gY29udHJvbFNldHRpbmdzO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0KTtcblx0fVxufSk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7OztFQTBCQTtBQUNBO0FBQ0E7RUFGQSxJQUdhQSxpQkFBaUI7SUFHN0IsMkJBQVlDLE1BQStCLEVBQUVDLGVBQXFCLEVBQUVDLFVBQXVDLEVBQUU7TUFBQTtNQUFBLEtBRm5HQyxRQUFRLEdBQUcsS0FBSztNQUFBLEtBdUJoQkMsbUJBQW1CLEdBQUcsVUFBVUMsd0JBQTZCLEVBQUVDLFdBQWdCLEVBQUVDLFNBQWMsRUFBRUMsWUFBa0IsRUFBRTtRQUM5SCxJQUFNQyxhQUFhLEdBQUdGLFNBQVMsQ0FBQ0csWUFBWTtRQUM1QyxJQUFNQyxnQkFBZ0IsR0FBR0osU0FBUyxDQUFDSyxNQUFNLENBQUNDLFFBQVEsSUFBSU4sU0FBUyxDQUFDSyxNQUFNLENBQUNDLFFBQVEsQ0FBQ0MsT0FBTyxFQUFFO1FBQ3pGLElBQUlELFFBQVEsR0FBR0UsTUFBTSxDQUFDQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUVMLGdCQUFnQixDQUFDO1FBQ2xELE9BQU9FLFFBQVEsQ0FBQ0ksY0FBYztRQUM5QkosUUFBUSxHQUFHSyxTQUFTLENBQUNMLFFBQVEsQ0FBQztRQUM5QkEsUUFBUSxDQUFDTSxvQkFBb0IsR0FBR0MsS0FBSyxDQUFDUCxRQUFRLENBQUNNLG9CQUFvQixFQUFFWCxZQUFZLENBQUM7UUFDbEYsT0FBT2EsZ0JBQWdCLENBQUNDLDhCQUE4QixDQUNyRGpCLHdCQUF3QixDQUFDa0IsaUJBQWlCLENBQUNDLElBQUksRUFDL0NqQixTQUFTLENBQUNLLE1BQU0sQ0FBQ2EsU0FBUyxFQUMxQmhCLGFBQWEsSUFBSUEsYUFBYSxDQUFDaUIsY0FBYyxFQUFFLEVBQy9DTixLQUFLLEVBQ0xmLHdCQUF3QixDQUFDc0IsZUFBZSxFQUN4Q2QsUUFBUSxDQUNSO01BQ0YsQ0FBQztNQW5DQUUsTUFBTSxDQUFDYSxJQUFJLENBQUM1QixNQUFNLENBQUMsQ0FBQzZCLE9BQU8sQ0FBQyxVQUFDQyxRQUFRLEVBQUs7UUFDekM7UUFDQSxLQUFJLENBQUNBLFFBQVEsQ0FBZSxHQUFHOUIsTUFBTSxDQUFDOEIsUUFBUSxDQUFRO01BQ3ZELENBQUMsQ0FBQztJQUNIOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtJQUxDO0lBQUE7SUFBQSxPQU1PQyxRQUFRLEdBQWYsb0JBQTBDO01BQ3pDO01BQ0EsSUFBSSxJQUFJLENBQUNDLEVBQUUsRUFBRTtRQUFBLGtDQUZLQyxXQUFXO1VBQVhBLFdBQVc7UUFBQTtRQUc1QixPQUFPQyxRQUFRLEVBQUcsSUFBSSxDQUFTRixFQUFFLFNBQUtDLFdBQVcsRUFBRTtNQUNwRDtNQUNBLE9BQU9FLFNBQVM7SUFDakI7SUFDQTtJQUFBO0lBQUEsT0FpQk9DLGFBQWEsR0FBcEIseUJBQXVCO01BQ3RCLElBQU1DLGFBQWtDLEdBQUcsQ0FBQyxDQUFDO01BQzdDLEtBQUssSUFBTUMsWUFBWSxJQUFJLElBQUksRUFBRTtRQUNoQyxJQUFJLElBQUksQ0FBQ0MsY0FBYyxDQUFDRCxZQUFZLENBQUMsRUFBRTtVQUN0Q0QsYUFBYSxDQUFDQyxZQUFZLENBQUMsR0FBRyxJQUFJLENBQUNBLFlBQVksQ0FBQztRQUNqRDtNQUNEO01BQ0EsT0FBT0QsYUFBYTtJQUNyQixDQUFDO0lBQUEsa0JBQ01HLFFBQVEsR0FBZixvQkFBa0I7TUFDakI7SUFBQSxDQUNBO0lBQUEsa0JBQ01DLFVBQVUsR0FBakIsc0JBQW9CO01BQ25CO0lBQUEsQ0FDQTtJQUFBLE9BQ01DLGdCQUFnQixHQUF2Qiw0QkFBNEQ7TUFBQSxJQUFwQ0MsU0FBUyx1RUFBRyxLQUFLO01BQUEsSUFBRUMsU0FBZTtNQUN6RCxJQUFJRCxTQUFTLEVBQUU7UUFDZCxPQUFPQyxTQUFTO01BQ2pCLENBQUMsTUFBTTtRQUNOLE9BQU8sRUFBRTtNQUNWO0lBQ0QsQ0FBQztJQUFBLE9BQ1NDLElBQUksR0FBZCxjQUFlQyxhQUFxQixFQUFFQyxLQUFVLEVBQWdCO01BQy9ELElBQUlBLEtBQUssS0FBS1osU0FBUyxFQUFFO1FBQ3hCLE9BQU87VUFBQSxpQkFBU1csYUFBYSxnQkFBS0UsdUJBQXVCLENBQUNELEtBQUssQ0FBQztRQUFBLENBQUc7TUFDcEUsQ0FBQyxNQUFNO1FBQ04sT0FBTztVQUFBLE9BQU0sRUFBRTtRQUFBO01BQ2hCO0lBQ0QsQ0FBQztJQUFBO0VBQUE7RUFHRjtBQUNBO0FBQ0E7RUFGQTtFQTZEQSxJQUFNRSxjQUFjLEdBQUcsVUFBVUMsTUFBMEMsRUFBeUI7SUFDbkcsSUFBSSxDQUFDQSxNQUFNLENBQUNYLGNBQWMsQ0FBQyxVQUFVLENBQUMsRUFBRTtNQUN2Q1csTUFBTSxDQUFDQyxRQUFRLEdBQUdqQyxTQUFTLENBQzFCZ0MsTUFBTSxDQUFDQyxRQUFRLElBQUk7UUFDbEJDLFVBQVUsRUFBRSxDQUFDLENBQUM7UUFDZEMsWUFBWSxFQUFFLENBQUMsQ0FBQztRQUNoQkMsTUFBTSxFQUFFLENBQUM7TUFDVixDQUFDLENBQ0Q7SUFDRjtJQUNBLE9BQU9KLE1BQU0sQ0FBQ0MsUUFBUTtFQUN2QixDQUFDOztFQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ08sU0FBU0ksWUFBWSxDQUFDQyxtQkFBb0QsRUFBcUI7SUFDckcsT0FBTyxVQUFVTixNQUF5QixFQUFFTyxXQUE0QixFQUFFQyxrQkFBMkMsRUFBRTtNQUN0SCxJQUFNUCxRQUFRLEdBQUdGLGNBQWMsQ0FBQ0MsTUFBTSxDQUFDUyxXQUFXLENBQUM7TUFDbkQsSUFBSUgsbUJBQW1CLENBQUNJLFlBQVksS0FBS3pCLFNBQVMsRUFBRTtRQUFBO1FBQ25EO1FBQ0FxQixtQkFBbUIsQ0FBQ0ksWUFBWSw0QkFBR0Ysa0JBQWtCLENBQUNHLFdBQVcsMERBQTlCLDJCQUFBSCxrQkFBa0IsQ0FBZ0I7TUFDdEU7TUFDQSxPQUFPQSxrQkFBa0IsQ0FBQ0csV0FBVztNQUNyQyxJQUFJVixRQUFRLENBQUNDLFVBQVUsQ0FBQ0ssV0FBVyxDQUFDSyxRQUFRLEVBQUUsQ0FBQyxLQUFLM0IsU0FBUyxFQUFFO1FBQzlEZ0IsUUFBUSxDQUFDQyxVQUFVLENBQUNLLFdBQVcsQ0FBQ0ssUUFBUSxFQUFFLENBQUMsR0FBR04sbUJBQW1CO01BQ2xFO01BRUEsT0FBT0Usa0JBQWtCO0lBQzFCLENBQUMsQ0FBUSxDQUFDO0VBQ1g7RUFBQztFQUNNLFNBQVNLLGNBQWMsQ0FBQ1AsbUJBQW9ELEVBQXFCO0lBQ3ZHLE9BQU9ELFlBQVksQ0FBQ0MsbUJBQW1CLENBQUM7RUFDekM7RUFBQztFQUVNLFNBQVNRLFFBQVEsR0FBc0I7SUFDN0MsT0FBTyxVQUFVZCxNQUF5QixFQUFFTyxXQUE0QixFQUFFQyxrQkFBMkMsRUFBRTtNQUN0SCxJQUFNUCxRQUFRLEdBQUdGLGNBQWMsQ0FBQ0MsTUFBTSxDQUFDUyxXQUFXLENBQUM7TUFDbkQsT0FBT0Qsa0JBQWtCLENBQUNHLFdBQVc7TUFDckMsSUFBSVYsUUFBUSxDQUFDRyxNQUFNLENBQUNHLFdBQVcsQ0FBQ0ssUUFBUSxFQUFFLENBQUMsS0FBSzNCLFNBQVMsRUFBRTtRQUMxRGdCLFFBQVEsQ0FBQ0csTUFBTSxDQUFDRyxXQUFXLENBQUNLLFFBQVEsRUFBRSxDQUFDLEdBQUc7VUFBRUcsSUFBSSxFQUFFO1FBQVcsQ0FBQztNQUMvRDtNQUVBLE9BQU9QLGtCQUFrQjtJQUMxQixDQUFDLENBQVEsQ0FBQztFQUNYO0VBQUM7RUFDTSxTQUFTUSxVQUFVLEdBQXNCO0lBQy9DLE9BQU9GLFFBQVEsRUFBRTtFQUNsQjtFQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtFQUxBO0VBTU8sU0FBU0csY0FBYyxDQUFDQyxxQkFBeUQsRUFBcUI7SUFDNUcsT0FBTyxVQUFVbEIsTUFBeUIsRUFBRU8sV0FBbUIsRUFBRUMsa0JBQWdELEVBQUU7TUFDbEgsSUFBTVAsUUFBUSxHQUFHRixjQUFjLENBQUNDLE1BQU0sQ0FBQ1MsV0FBVyxDQUFDO01BQ25ELE9BQVFELGtCQUFrQixDQUFTRyxXQUFXO01BQzlDLElBQUlWLFFBQVEsQ0FBQ0UsWUFBWSxDQUFDSSxXQUFXLENBQUMsS0FBS3RCLFNBQVMsRUFBRTtRQUNyRGdCLFFBQVEsQ0FBQ0UsWUFBWSxDQUFDSSxXQUFXLENBQUMsR0FBR1cscUJBQXFCO01BQzNEO01BRUEsT0FBT1Ysa0JBQWtCO0lBQzFCLENBQUM7RUFDRjtFQUFDO0VBQ00sU0FBU1csZ0JBQWdCLENBQUNELHFCQUF5RCxFQUFxQjtJQUM5RyxPQUFPRCxjQUFjLENBQUNDLHFCQUFxQixDQUFDO0VBQzdDO0VBQUM7RUFDRCxJQUFNRSxjQUFnRixHQUFHLENBQUMsQ0FBQztFQUNwRixTQUFTQyxtQkFBbUIsQ0FBQ0Msd0JBQXVELEVBQWtCO0lBQzVHLE9BQU8sVUFBVUMsZUFBb0IsRUFBRTtNQUN0Q3hCLGNBQWMsQ0FBQ3dCLGVBQWUsQ0FBQztNQUMvQkEsZUFBZSxDQUFDQyxNQUFNLEdBQUdGLHdCQUF3QixDQUFDaEQsSUFBSTtNQUN0RGlELGVBQWUsQ0FBQ0UsU0FBUyxHQUFHSCx3QkFBd0IsQ0FBQ0csU0FBUztNQUM5REYsZUFBZSxDQUFDRyxlQUFlLEdBQUdKLHdCQUF3QixDQUFDSSxlQUFlO01BQzFFSCxlQUFlLENBQUNJLFFBQVEsR0FBR0wsd0JBQXdCLENBQUNLLFFBQVE7TUFDNURKLGVBQWUsQ0FBQ0ssTUFBTSxHQUFHTix3QkFBd0IsQ0FBQ00sTUFBTTtNQUN4REwsZUFBZSxDQUFDTSxTQUFTLEdBQUdQLHdCQUF3QixDQUFDTyxTQUFTO01BQzlETixlQUFlLENBQUNPLFVBQVUsR0FBRyxDQUFDO01BQzlCLElBQUlQLGVBQWUsQ0FBQ00sU0FBUyxLQUFLLElBQUksRUFBRTtRQUN2Q04sZUFBZSxDQUFDUSxTQUFTLENBQUNDLFdBQVcsR0FBRyxZQUFZO1VBQ25ELElBQU1DLFNBQVMsYUFBTVgsd0JBQXdCLENBQUNHLFNBQVMsY0FBSUgsd0JBQXdCLENBQUNoRCxJQUFJLENBQUU7VUFDMUYsSUFBTTRELFVBQVUsR0FBRyxFQUFFO1VBQ3JCLEtBQUssSUFBTUMsYUFBYSxJQUFJWixlQUFlLENBQUN0QixRQUFRLENBQUNDLFVBQVUsRUFBRTtZQUNoRSxJQUFJa0MsYUFBYSxHQUFHLElBQUksQ0FBQ0QsYUFBYSxDQUFDO1lBQ3ZDLElBQUlDLGFBQWEsS0FBS25ELFNBQVMsSUFBSW1ELGFBQWEsS0FBSyxJQUFJLEVBQUU7Y0FBQTtjQUMxRCxJQUFJLG1CQUFBQSxhQUFhLHlFQUFiLG1DQUFlQyxHQUFHLHVEQUFsQix5Q0FBcUIsc0JBQXNCLENBQUMsTUFBSyxJQUFJLEVBQUU7Z0JBQzFERCxhQUFhLEdBQUdBLGFBQWEsQ0FBQ0UsT0FBTyxFQUFFO2NBQ3hDO2NBQ0FKLFVBQVUsQ0FBQ0ssSUFBSSxDQUFDQyxHQUFHLHdGQUFRTCxhQUFhLEVBQUtDLGFBQWEsRUFBSTtZQUMvRDtVQUNEO1VBQ0EsS0FBSyxJQUFNSyxTQUFTLElBQUlsQixlQUFlLENBQUN0QixRQUFRLENBQUNHLE1BQU0sRUFBRTtZQUN4RCxJQUFNc0MsV0FBVyxHQUFHLElBQUksQ0FBQ0QsU0FBUyxDQUFDO1lBQ25DLElBQUlDLFdBQVcsS0FBS3pELFNBQVMsRUFBRTtjQUM5QmlELFVBQVUsQ0FBQ0ssSUFBSSxDQUFDQyxHQUFHLDBGQUFRQyxTQUFTLEVBQUtDLFdBQVcsRUFBSTtZQUN6RDtVQUNEO1VBQ0EsT0FBT0YsR0FBRyxxVUFHT1AsU0FBUyxFQUd2QkMsVUFBVTtRQUdkLENBQUM7TUFDRjtNQUVBWCxlQUFlLENBQUNqQyxRQUFRLEdBQUcsWUFBWTtRQUN0Q3FELHFCQUFxQixDQUFDcEIsZUFBZSxDQUFDO1FBQ3RDLElBQUlBLGVBQWUsQ0FBQ00sU0FBUyxLQUFLLElBQUksRUFBRTtVQUN2Q1QsY0FBYyxXQUFJRSx3QkFBd0IsQ0FBQ0csU0FBUyxjQUFJSCx3QkFBd0IsQ0FBQ2hELElBQUksRUFBRyxHQUFHaUQsZUFBZTtRQUMzRztNQUNELENBQUM7TUFDREEsZUFBZSxDQUFDaEMsVUFBVSxHQUFHLFlBQVk7UUFDeENxRCxlQUFlLENBQUNDLE1BQU0sQ0FBQyxJQUFJLEVBQUV0QixlQUFlLENBQUNFLFNBQVMsRUFBRUYsZUFBZSxDQUFDakQsSUFBSSxDQUFDO1FBQzdFc0UsZUFBZSxDQUFDQyxNQUFNLENBQUMsSUFBSSxFQUFFdEIsZUFBZSxDQUFDRyxlQUFlLEVBQUVILGVBQWUsQ0FBQ2pELElBQUksQ0FBQztNQUNwRixDQUFDO0lBQ0YsQ0FBQztFQUNGO0VBQUM7RUFFRHdFLFFBQVEsQ0FBQ0MsWUFBWSxDQUFDLGVBQWUsRUFBRTtJQUN0Q0MsSUFBSSxZQUFrQjNGLFNBQThCO01BQUEsSUFBRTtRQUNyRCx1QkFBTytELGNBQWMsQ0FBQy9ELFNBQVMsQ0FBQzRGLFlBQVksQ0FBQztNQUM5QyxDQUFDO1FBQUE7TUFBQTtJQUFBO0lBQ0RDLElBQUksWUFBa0I3RixTQUE4QjtNQUFBLElBQUU7UUFBQTtRQUFBLGFBK0Q3QyxJQUFJO1FBOURaLElBQUk4RixPQUF5RCxHQUFHOUYsU0FBUyxDQUFDK0YsZUFBZTtRQUN6RixJQUFJLENBQUNELE9BQU8sRUFBRTtVQUNiO1VBQ0FBLE9BQU8sR0FBRy9CLGNBQWMsQ0FBQy9ELFNBQVMsQ0FBQzRGLFlBQVksQ0FBQztRQUNqRDtRQUNBLElBQU1JLGFBQWtCLEdBQUcsQ0FBQyxDQUFDO1FBQzdCLElBQU1DLFlBQWlDLEdBQUcsQ0FBQWpHLFNBQVMsYUFBVEEsU0FBUyxnREFBVEEsU0FBUyxDQUFFa0csVUFBVSxvRkFBckIsc0JBQXdCLENBQUMsQ0FBQyxxRkFBMUIsdUJBQTRCQyxXQUFXLHFGQUF2Qyx1QkFBeUMzRCxLQUFLLDJEQUE5Qyx1QkFBaUQsNEJBQTRCLENBQUMsS0FBSSxDQUFDLENBQUM7UUFDOUgsT0FBT3hDLFNBQVMsQ0FBQ2tHLFVBQVU7UUFDM0IsSUFBTUUsYUFBYSxHQUFHQyxTQUFTLENBQUNDLG9CQUFvQixDQUFDdEcsU0FBUyxDQUFDdUcsY0FBYyxDQUFzQjtRQUNuRyxJQUFNcEcsYUFBWSxHQUFHcUcsV0FBVyxDQUFDQyxlQUFlLENBQUN6RyxTQUFTLENBQUN1RyxjQUFjLENBQUM7UUFDMUUsSUFBTXJGLFNBQVMsR0FBR2YsYUFBWSxDQUFDdUcsWUFBWSxFQUFFO1FBQzdDLElBQU1DLFNBQVMsR0FBR1AsYUFBYSxDQUFDUSxRQUFRLENBQUMsWUFBWSxDQUFDO1FBQ3RELEtBQUssSUFBTUMsWUFBWSxJQUFJZixPQUFPLENBQUNsRCxRQUFRLENBQUNDLFVBQVUsRUFBRTtVQUN2RCxJQUFNaUUsZ0JBQWdCLEdBQUdoQixPQUFPLENBQUNsRCxRQUFRLENBQUNDLFVBQVUsQ0FBQ2dFLFlBQVksQ0FBQztVQUNsRSxJQUFNRSxnQkFBZ0IsR0FBR0osU0FBUyxDQUFDSyxvQkFBb0IsQ0FBQ2YsWUFBWSxDQUFDWSxZQUFZLENBQUMsQ0FBQztVQUVuRixJQUFJRSxnQkFBZ0IsS0FBSyxJQUFJLEVBQUU7WUFDOUI7WUFDQSxJQUFJRSxNQUFNLEdBQUdoQixZQUFZLENBQUNZLFlBQVksQ0FBQztZQUV2QyxJQUFJLE9BQU9JLE1BQU0sS0FBSyxRQUFRLEVBQUU7Y0FDL0IsSUFBSUgsZ0JBQWdCLENBQUNJLFFBQVEsS0FBSyxJQUFJLEVBQUU7Z0JBQ3ZDO2dCQUNBLFFBQVFKLGdCQUFnQixDQUFDcEQsSUFBSTtrQkFDNUIsS0FBSyxTQUFTO29CQUNidUQsTUFBTSxHQUFHQSxNQUFNLEtBQUssTUFBTTtvQkFDMUI7a0JBQ0QsS0FBSyxRQUFRO29CQUNaQSxNQUFNLEdBQUdFLE1BQU0sQ0FBQ0YsTUFBTSxDQUFDO29CQUN2QjtnQkFBTTtjQUVULENBQUMsTUFBTTtnQkFDTjtnQkFDQUEsTUFBTSxHQUFHRyxvQkFBb0IsQ0FBQ0gsTUFBTSxFQUFFSCxnQkFBZ0IsQ0FBQ3BELElBQUksQ0FBQztjQUM3RDtZQUNEO1lBRUFzQyxhQUFhLENBQUNhLFlBQVksQ0FBQyxHQUFHSSxNQUFNO1VBQ3JDLENBQUMsTUFBTSxJQUFJRixnQkFBZ0IsQ0FBQ00sU0FBUyxFQUFFLEtBQUt6RixTQUFTLEVBQUU7WUFDdEQ7WUFDQW9FLGFBQWEsQ0FBQ2EsWUFBWSxDQUFDLEdBQUdFLGdCQUFnQixDQUFDTSxTQUFTLEVBQUU7VUFDM0QsQ0FBQyxNQUFNO1lBQ047WUFDQXJCLGFBQWEsQ0FBQ2EsWUFBWSxDQUFDLEdBQUczRixTQUFTLENBQUM4RixvQkFBb0IsQ0FBQ2YsWUFBWSxDQUFDWSxZQUFZLENBQUMsQ0FBQztVQUN6RjtRQUNEO1FBQ0EsS0FBSyxJQUFNUyxTQUFTLElBQUl4QixPQUFPLENBQUNsRCxRQUFRLENBQUNHLE1BQU0sRUFBRTtVQUNoRCxJQUFJa0QsWUFBWSxDQUFDcUIsU0FBUyxDQUFDLEtBQUsxRixTQUFTLElBQUtxRSxZQUFZLENBQUNxQixTQUFTLENBQUMsQ0FBWUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2pHdkIsYUFBYSxDQUFDc0IsU0FBUyxDQUFDLEdBQUdFLFVBQVUsQ0FBQ0MsR0FBRyxDQUFDeEIsWUFBWSxDQUFDcUIsU0FBUyxDQUFDLENBQUNJLFNBQVMsQ0FBQyxDQUFDLENBQUMsRUFBRTFILFNBQVMsQ0FBQ3VHLGNBQWMsQ0FBQ29CLGFBQWEsRUFBRSxDQUFDO1VBQzFILENBQUMsTUFBTTtZQUNOM0IsYUFBYSxDQUFDc0IsU0FBUyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7VUFDaEM7UUFDRDs7UUFDQSx1QkFBUU0sYUFBYSxDQUFnQ0Msb0JBQW9CLENBQ3hFLFlBQU07VUFDTCxJQUFNQyxlQUFlLEdBQ3BCLElBQUloQyxPQUFPLENBQ1ZFLGFBQWEsRUFDYixDQUFDLENBQUMsRUFDRjtZQUFFK0Isc0JBQXNCLEVBQUUsSUFBSTtZQUFFbkksUUFBUSxFQUFFLEtBQUs7WUFBRU8sWUFBWSxFQUFFQTtVQUFhLENBQUMsQ0FDN0UsQ0FDQTZILE1BQU0sQ0FBQ2hJLFNBQVMsQ0FBQ3VHLGNBQWMsRUFBRXBHLGFBQVksQ0FBQztVQUNoRCxJQUFJLENBQUMsT0FBYzhILE9BQU8sRUFBRTtZQUMzQixPQUFjQyxTQUFTLEdBQUdKLGVBQWU7VUFDMUM7VUFDQSxPQUFPQSxlQUFlO1FBQ3ZCLENBQUMsRUFDRDtVQUNDckcsRUFBRSxFQUFFLFVBQVUwRyxHQUFXLEVBQUU7WUFDMUIsT0FBT25JLFNBQVMsQ0FBQ3VHLGNBQWMsQ0FBQy9FLFFBQVEsQ0FBQzJHLEdBQUcsQ0FBQztVQUM5QyxDQUFDO1VBQ0RDLFFBQVEsRUFBRSxVQUFVQyxlQUFvQixFQUFFO1lBQ3pDLElBQU1DLGVBQWUsR0FBRyxJQUFJLENBQUNDLFdBQVcsRUFBRSxDQUFDQyxlQUFlLEVBQUU7WUFDNUQsZ0NBQW9DaEksTUFBTSxDQUFDYSxJQUFJLENBQUNpSCxlQUFlLENBQUMsa0NBQUU7Y0FBN0QsSUFBTUcscUJBQXFCO2NBQy9CLElBQUlKLGVBQWUsQ0FBQ3JHLGNBQWMsQ0FBQ3lHLHFCQUFxQixDQUFDLEVBQUU7Z0JBQzFESixlQUFlLENBQUNJLHFCQUFxQixDQUFDLEdBQUd6SSxTQUFTLENBQUN1RyxjQUFjLENBQUMvRSxRQUFRLENBQ3pFNkcsZUFBZSxDQUFDSSxxQkFBcUIsQ0FBQyxDQUN0QztjQUNGO1lBQ0Q7WUFDQSxPQUFPSixlQUFlO1VBQ3ZCO1FBQ0QsQ0FBQyxDQUNEO01BQ0YsQ0FBQztRQUFBO01BQUE7SUFBQTtFQUNGLENBQUMsQ0FBQztFQUFDO0FBQUEifQ==