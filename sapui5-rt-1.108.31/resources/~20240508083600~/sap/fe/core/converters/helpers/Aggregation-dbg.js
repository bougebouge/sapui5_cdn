/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ModelHelper"], function (ModelHelper) {
  "use strict";

  var _exports = {};
  /**
   * helper class for Aggregation annotations.
   */
  var AggregationHelper = /*#__PURE__*/function () {
    /**
     * Creates a helper for a specific entity type and a converter context.
     *
     * @param entityType The EntityType
     * @param converterContext The ConverterContext
     */
    function AggregationHelper(entityType, converterContext) {
      var _this$_oAggregationAn, _this$_oAggregationAn4, _this$_oAggregationAn7, _this$oTargetAggregat;
      this._entityType = entityType;
      this._converterContext = converterContext;
      this._oAggregationAnnotationTarget = this._determineAggregationAnnotationTarget();
      if (((_this$_oAggregationAn = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn === void 0 ? void 0 : _this$_oAggregationAn._type) === "NavigationProperty") {
        var _this$_oAggregationAn2, _this$_oAggregationAn3;
        this.oTargetAggregationAnnotations = (_this$_oAggregationAn2 = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn2 === void 0 ? void 0 : (_this$_oAggregationAn3 = _this$_oAggregationAn2.annotations) === null || _this$_oAggregationAn3 === void 0 ? void 0 : _this$_oAggregationAn3.Aggregation;
      } else if (((_this$_oAggregationAn4 = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn4 === void 0 ? void 0 : _this$_oAggregationAn4._type) === "EntityType") {
        var _this$_oAggregationAn5, _this$_oAggregationAn6;
        this.oTargetAggregationAnnotations = (_this$_oAggregationAn5 = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn5 === void 0 ? void 0 : (_this$_oAggregationAn6 = _this$_oAggregationAn5.annotations) === null || _this$_oAggregationAn6 === void 0 ? void 0 : _this$_oAggregationAn6.Aggregation;
      } else if (((_this$_oAggregationAn7 = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn7 === void 0 ? void 0 : _this$_oAggregationAn7._type) === "EntitySet") {
        var _this$_oAggregationAn8, _this$_oAggregationAn9;
        this.oTargetAggregationAnnotations = (_this$_oAggregationAn8 = this._oAggregationAnnotationTarget) === null || _this$_oAggregationAn8 === void 0 ? void 0 : (_this$_oAggregationAn9 = _this$_oAggregationAn8.annotations) === null || _this$_oAggregationAn9 === void 0 ? void 0 : _this$_oAggregationAn9.Aggregation;
      }
      this._bApplySupported = (_this$oTargetAggregat = this.oTargetAggregationAnnotations) !== null && _this$oTargetAggregat !== void 0 && _this$oTargetAggregat.ApplySupported ? true : false;
      if (this._bApplySupported) {
        var _this$oTargetAggregat2, _this$oTargetAggregat3, _this$oTargetAggregat4, _this$oTargetAggregat5;
        this._aGroupableProperties = (_this$oTargetAggregat2 = this.oTargetAggregationAnnotations) === null || _this$oTargetAggregat2 === void 0 ? void 0 : (_this$oTargetAggregat3 = _this$oTargetAggregat2.ApplySupported) === null || _this$oTargetAggregat3 === void 0 ? void 0 : _this$oTargetAggregat3.GroupableProperties;
        this._aAggregatableProperties = (_this$oTargetAggregat4 = this.oTargetAggregationAnnotations) === null || _this$oTargetAggregat4 === void 0 ? void 0 : (_this$oTargetAggregat5 = _this$oTargetAggregat4.ApplySupported) === null || _this$oTargetAggregat5 === void 0 ? void 0 : _this$oTargetAggregat5.AggregatableProperties;
        this.oContainerAggregationAnnotation = converterContext.getEntityContainer().annotations.Aggregation;
      }
    }
    /**
     * Determines the most appropriate target for the aggregation annotations.
     *
     * @returns  EntityType, EntitySet or NavigationProperty where aggregation annotations should be read from.
     */
    _exports.AggregationHelper = AggregationHelper;
    var _proto = AggregationHelper.prototype;
    _proto._determineAggregationAnnotationTarget = function _determineAggregationAnnotationTarget() {
      var _this$_converterConte, _this$_converterConte2, _this$_converterConte3, _this$_converterConte4, _this$_converterConte5;
      var bIsParameterized = (_this$_converterConte = this._converterContext.getDataModelObjectPath()) !== null && _this$_converterConte !== void 0 && (_this$_converterConte2 = _this$_converterConte.targetEntitySet) !== null && _this$_converterConte2 !== void 0 && (_this$_converterConte3 = _this$_converterConte2.entityType) !== null && _this$_converterConte3 !== void 0 && (_this$_converterConte4 = _this$_converterConte3.annotations) !== null && _this$_converterConte4 !== void 0 && (_this$_converterConte5 = _this$_converterConte4.Common) !== null && _this$_converterConte5 !== void 0 && _this$_converterConte5.ResultContext ? true : false;
      var oAggregationAnnotationSource;

      // find ApplySupported
      if (bIsParameterized) {
        var _oNavigationPropertyO, _oNavigationPropertyO2, _oEntityTypeObject$an, _oEntityTypeObject$an2;
        // if this is a parameterized view then applysupported can be found at either the navProp pointing to the result set or entityType.
        // If applySupported is present at both the navProp and the entityType then navProp is more specific so take annotations from there
        // targetObject in the converter context for a parameterized view is the navigation property pointing to th result set
        var oDataModelObjectPath = this._converterContext.getDataModelObjectPath();
        var oNavigationPropertyObject = oDataModelObjectPath === null || oDataModelObjectPath === void 0 ? void 0 : oDataModelObjectPath.targetObject;
        var oEntityTypeObject = oDataModelObjectPath === null || oDataModelObjectPath === void 0 ? void 0 : oDataModelObjectPath.targetEntityType;
        if (oNavigationPropertyObject !== null && oNavigationPropertyObject !== void 0 && (_oNavigationPropertyO = oNavigationPropertyObject.annotations) !== null && _oNavigationPropertyO !== void 0 && (_oNavigationPropertyO2 = _oNavigationPropertyO.Aggregation) !== null && _oNavigationPropertyO2 !== void 0 && _oNavigationPropertyO2.ApplySupported) {
          oAggregationAnnotationSource = oNavigationPropertyObject;
        } else if (oEntityTypeObject !== null && oEntityTypeObject !== void 0 && (_oEntityTypeObject$an = oEntityTypeObject.annotations) !== null && _oEntityTypeObject$an !== void 0 && (_oEntityTypeObject$an2 = _oEntityTypeObject$an.Aggregation) !== null && _oEntityTypeObject$an2 !== void 0 && _oEntityTypeObject$an2.ApplySupported) {
          oAggregationAnnotationSource = oEntityTypeObject;
        }
      } else {
        var _annotations, _annotations$Aggregat;
        // For the time being, we ignore annotations at the container level, until the vocabulary is stabilized
        var oEntitySetObject = this._converterContext.getEntitySet();
        if (!ModelHelper.isSingleton(oEntitySetObject) && oEntitySetObject !== null && oEntitySetObject !== void 0 && (_annotations = oEntitySetObject.annotations) !== null && _annotations !== void 0 && (_annotations$Aggregat = _annotations.Aggregation) !== null && _annotations$Aggregat !== void 0 && _annotations$Aggregat.ApplySupported) {
          oAggregationAnnotationSource = oEntitySetObject;
        } else {
          oAggregationAnnotationSource = this._converterContext.getEntityType();
        }
      }
      return oAggregationAnnotationSource;
    }

    /**
     * Checks if the entity supports analytical queries.
     *
     * @returns `true` if analytical queries are supported, false otherwise.
     */;
    _proto.isAnalyticsSupported = function isAnalyticsSupported() {
      return this._bApplySupported;
    }

    /**
     * Checks if a property is groupable.
     *
     * @param property The property to check
     * @returns `undefined` if the entity doesn't support analytical queries, true or false otherwise
     */;
    _proto.isPropertyGroupable = function isPropertyGroupable(property) {
      if (!this._bApplySupported) {
        return undefined;
      } else if (!this._aGroupableProperties || this._aGroupableProperties.length === 0) {
        // No groupableProperties --> all properties are groupable
        return true;
      } else {
        return this._aGroupableProperties.findIndex(function (path) {
          return path.$target.fullyQualifiedName === property.fullyQualifiedName;
        }) >= 0;
      }
    }

    /**
     * Checks if a property is aggregatable.
     *
     * @param property The property to check
     * @returns `undefined` if the entity doesn't support analytical queries, true or false otherwise
     */;
    _proto.isPropertyAggregatable = function isPropertyAggregatable(property) {
      if (!this._bApplySupported) {
        return undefined;
      } else {
        // Get the custom aggregates
        var aCustomAggregateAnnotations = this._converterContext.getAnnotationsByTerm("Aggregation", "Org.OData.Aggregation.V1.CustomAggregate", [this._oAggregationAnnotationTarget]);

        // Check if a custom aggregate has a qualifier that corresponds to the property name
        return aCustomAggregateAnnotations.some(function (annotation) {
          return property.name === annotation.qualifier;
        });
      }
    };
    _proto.getGroupableProperties = function getGroupableProperties() {
      return this._aGroupableProperties;
    };
    _proto.getAggregatableProperties = function getAggregatableProperties() {
      return this._aAggregatableProperties;
    };
    _proto.getEntityType = function getEntityType() {
      return this._entityType;
    }

    /**
     * Returns AggregatedProperties or AggregatedProperty based on param Term.
     * The Term here indicates if the AggregatedProperty should be retrieved or the deprecated AggregatedProperties.
     *
     * @param Term The Annotation Term
     * @returns Annotations The appropriate annotations based on the given Term.
     */;
    _proto.getAggregatedProperties = function getAggregatedProperties(Term) {
      if (Term === "AggregatedProperties") {
        return this._converterContext.getAnnotationsByTerm("Analytics", "com.sap.vocabularies.Analytics.v1.AggregatedProperties", [this._converterContext.getEntityContainer(), this._converterContext.getEntityType()]);
      }
      return this._converterContext.getAnnotationsByTerm("Analytics", "com.sap.vocabularies.Analytics.v1.AggregatedProperty", [this._converterContext.getEntityContainer(), this._converterContext.getEntityType()]);
    }
    // retirve all transformation aggregates by prioritizing AggregatedProperty over AggregatedProperties objects
    ;
    _proto.getTransAggregations = function getTransAggregations() {
      var _aAggregatedPropertyO,
        _this = this;
      var aAggregatedPropertyObjects = this.getAggregatedProperties("AggregatedProperty");
      if (!aAggregatedPropertyObjects || aAggregatedPropertyObjects.length === 0) {
        aAggregatedPropertyObjects = this.getAggregatedProperties("AggregatedProperties")[0];
      }
      return (_aAggregatedPropertyO = aAggregatedPropertyObjects) === null || _aAggregatedPropertyO === void 0 ? void 0 : _aAggregatedPropertyO.filter(function (aggregatedProperty) {
        if (_this._getAggregatableAggregates(aggregatedProperty.AggregatableProperty)) {
          return aggregatedProperty;
        }
      });
    }

    /**
     * check if each transformation/custom aggregate is aggregatable.
     *
     * @param property The property to check
     * @returns 'aggregatedProperty'
     */;
    _proto._getAggregatableAggregates = function _getAggregatableAggregates(property) {
      var aAggregatableProperties = this.getAggregatableProperties() || [];
      return aAggregatableProperties.find(function (obj) {
        return obj.Property.value === (property.qualifier ? property.qualifier : property.$target.name);
      });
    }

    /**
     * Returns the list of custom aggregate definitions for the entity type.
     *
     * @returns A map (propertyName --> array of context-defining property names) for each custom aggregate corresponding to a property. The array of
     * context-defining property names is empty if the custom aggregate doesn't have any context-defining property.
     */;
    _proto.getCustomAggregateDefinitions = function getCustomAggregateDefinitions() {
      var _this2 = this;
      // Get the custom aggregates
      var aCustomAggregateAnnotations = this._converterContext.getAnnotationsByTerm("Aggregation", "Org.OData.Aggregation.V1.CustomAggregate", [this._oAggregationAnnotationTarget]);
      return aCustomAggregateAnnotations.filter(function (customAggregate) {
        if (_this2._getAggregatableAggregates(customAggregate)) {
          return customAggregate;
        }
      });
    }

    /**
     * Returns the list of allowed transformations in the $apply.
     * First look at the current EntitySet, then look at the default values provided at the container level.
     *
     * @returns The list of transformations, or undefined if no list is found
     */;
    _proto.getAllowedTransformations = function getAllowedTransformations() {
      var _this$oTargetAggregat6, _this$oTargetAggregat7, _this$oContainerAggre, _this$oContainerAggre2;
      return ((_this$oTargetAggregat6 = this.oTargetAggregationAnnotations) === null || _this$oTargetAggregat6 === void 0 ? void 0 : (_this$oTargetAggregat7 = _this$oTargetAggregat6.ApplySupported) === null || _this$oTargetAggregat7 === void 0 ? void 0 : _this$oTargetAggregat7.Transformations) || ((_this$oContainerAggre = this.oContainerAggregationAnnotation) === null || _this$oContainerAggre === void 0 ? void 0 : (_this$oContainerAggre2 = _this$oContainerAggre.ApplySupportedDefaults) === null || _this$oContainerAggre2 === void 0 ? void 0 : _this$oContainerAggre2.Transformations);
    };
    return AggregationHelper;
  }();
  _exports.AggregationHelper = AggregationHelper;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBZ2dyZWdhdGlvbkhlbHBlciIsImVudGl0eVR5cGUiLCJjb252ZXJ0ZXJDb250ZXh0IiwiX2VudGl0eVR5cGUiLCJfY29udmVydGVyQ29udGV4dCIsIl9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0IiwiX2RldGVybWluZUFnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldCIsIl90eXBlIiwib1RhcmdldEFnZ3JlZ2F0aW9uQW5ub3RhdGlvbnMiLCJhbm5vdGF0aW9ucyIsIkFnZ3JlZ2F0aW9uIiwiX2JBcHBseVN1cHBvcnRlZCIsIkFwcGx5U3VwcG9ydGVkIiwiX2FHcm91cGFibGVQcm9wZXJ0aWVzIiwiR3JvdXBhYmxlUHJvcGVydGllcyIsIl9hQWdncmVnYXRhYmxlUHJvcGVydGllcyIsIkFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMiLCJvQ29udGFpbmVyQWdncmVnYXRpb25Bbm5vdGF0aW9uIiwiZ2V0RW50aXR5Q29udGFpbmVyIiwiYklzUGFyYW1ldGVyaXplZCIsImdldERhdGFNb2RlbE9iamVjdFBhdGgiLCJ0YXJnZXRFbnRpdHlTZXQiLCJDb21tb24iLCJSZXN1bHRDb250ZXh0Iiwib0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblNvdXJjZSIsIm9EYXRhTW9kZWxPYmplY3RQYXRoIiwib05hdmlnYXRpb25Qcm9wZXJ0eU9iamVjdCIsInRhcmdldE9iamVjdCIsIm9FbnRpdHlUeXBlT2JqZWN0IiwidGFyZ2V0RW50aXR5VHlwZSIsIm9FbnRpdHlTZXRPYmplY3QiLCJnZXRFbnRpdHlTZXQiLCJNb2RlbEhlbHBlciIsImlzU2luZ2xldG9uIiwiZ2V0RW50aXR5VHlwZSIsImlzQW5hbHl0aWNzU3VwcG9ydGVkIiwiaXNQcm9wZXJ0eUdyb3VwYWJsZSIsInByb3BlcnR5IiwidW5kZWZpbmVkIiwibGVuZ3RoIiwiZmluZEluZGV4IiwicGF0aCIsIiR0YXJnZXQiLCJmdWxseVF1YWxpZmllZE5hbWUiLCJpc1Byb3BlcnR5QWdncmVnYXRhYmxlIiwiYUN1c3RvbUFnZ3JlZ2F0ZUFubm90YXRpb25zIiwiZ2V0QW5ub3RhdGlvbnNCeVRlcm0iLCJzb21lIiwiYW5ub3RhdGlvbiIsIm5hbWUiLCJxdWFsaWZpZXIiLCJnZXRHcm91cGFibGVQcm9wZXJ0aWVzIiwiZ2V0QWdncmVnYXRhYmxlUHJvcGVydGllcyIsImdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzIiwiVGVybSIsImdldFRyYW5zQWdncmVnYXRpb25zIiwiYUFnZ3JlZ2F0ZWRQcm9wZXJ0eU9iamVjdHMiLCJmaWx0ZXIiLCJhZ2dyZWdhdGVkUHJvcGVydHkiLCJfZ2V0QWdncmVnYXRhYmxlQWdncmVnYXRlcyIsIkFnZ3JlZ2F0YWJsZVByb3BlcnR5IiwiYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXMiLCJmaW5kIiwib2JqIiwiUHJvcGVydHkiLCJ2YWx1ZSIsImdldEN1c3RvbUFnZ3JlZ2F0ZURlZmluaXRpb25zIiwiY3VzdG9tQWdncmVnYXRlIiwiZ2V0QWxsb3dlZFRyYW5zZm9ybWF0aW9ucyIsIlRyYW5zZm9ybWF0aW9ucyIsIkFwcGx5U3VwcG9ydGVkRGVmYXVsdHMiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkFnZ3JlZ2F0aW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQW5ub3RhdGlvblRlcm0sIEVudGl0eVNldCwgRW50aXR5VHlwZSwgTmF2aWdhdGlvblByb3BlcnR5LCBQcm9wZXJ0eSwgUHJvcGVydHlQYXRoIH0gZnJvbSBcIkBzYXAtdXgvdm9jYWJ1bGFyaWVzLXR5cGVzXCI7XG5pbXBvcnQgdHlwZSB7IEFnZ3JlZ2F0YWJsZVByb3BlcnR5VHlwZSwgQXBwbHlTdXBwb3J0ZWRUeXBlLCBDdXN0b21BZ2dyZWdhdGUgfSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0FnZ3JlZ2F0aW9uXCI7XG5pbXBvcnQgeyBBZ2dyZWdhdGlvbkFubm90YXRpb25UZXJtcyB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQWdncmVnYXRpb25cIjtcbmltcG9ydCB0eXBlIHtcblx0Q29sbGVjdGlvbkFubm90YXRpb25zX0FnZ3JlZ2F0aW9uLFxuXHRFbnRpdHlDb250YWluZXJBbm5vdGF0aW9uc19BZ2dyZWdhdGlvbixcblx0RW50aXR5U2V0QW5ub3RhdGlvbnNfQWdncmVnYXRpb24sXG5cdEVudGl0eVR5cGVBbm5vdGF0aW9uc19BZ2dyZWdhdGlvblxufSBmcm9tIFwiQHNhcC11eC92b2NhYnVsYXJpZXMtdHlwZXMvdm9jYWJ1bGFyaWVzL0FnZ3JlZ2F0aW9uX0VkbVwiO1xuaW1wb3J0IHsgQWdncmVnYXRlZFByb3BlcnR5VHlwZSB9IGZyb20gXCJAc2FwLXV4L3ZvY2FidWxhcmllcy10eXBlcy92b2NhYnVsYXJpZXMvQW5hbHl0aWNzXCI7XG5pbXBvcnQgTW9kZWxIZWxwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2hlbHBlcnMvTW9kZWxIZWxwZXJcIjtcbmltcG9ydCB0eXBlIENvbnZlcnRlckNvbnRleHQgZnJvbSBcIi4uL0NvbnZlcnRlckNvbnRleHRcIjtcblxuLyoqXG4gKiBoZWxwZXIgY2xhc3MgZm9yIEFnZ3JlZ2F0aW9uIGFubm90YXRpb25zLlxuICovXG5leHBvcnQgY2xhc3MgQWdncmVnYXRpb25IZWxwZXIge1xuXHRfZW50aXR5VHlwZTogRW50aXR5VHlwZTtcblx0X2NvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQ7XG5cdF9iQXBwbHlTdXBwb3J0ZWQ6IGJvb2xlYW47XG5cdF9hR3JvdXBhYmxlUHJvcGVydGllcz86IFByb3BlcnR5UGF0aFtdO1xuXHRfYUFnZ3JlZ2F0YWJsZVByb3BlcnRpZXM/O1xuXHRfb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldDogRW50aXR5VHlwZSB8IEVudGl0eVNldCB8IE5hdmlnYXRpb25Qcm9wZXJ0eTtcblx0b1RhcmdldEFnZ3JlZ2F0aW9uQW5ub3RhdGlvbnM/OlxuXHRcdHwgQ29sbGVjdGlvbkFubm90YXRpb25zX0FnZ3JlZ2F0aW9uXG5cdFx0fCBFbnRpdHlUeXBlQW5ub3RhdGlvbnNfQWdncmVnYXRpb25cblx0XHR8IEVudGl0eVNldEFubm90YXRpb25zX0FnZ3JlZ2F0aW9uO1xuXG5cdG9Db250YWluZXJBZ2dyZWdhdGlvbkFubm90YXRpb24/OiBFbnRpdHlDb250YWluZXJBbm5vdGF0aW9uc19BZ2dyZWdhdGlvbjtcblxuXHQvKipcblx0ICogQ3JlYXRlcyBhIGhlbHBlciBmb3IgYSBzcGVjaWZpYyBlbnRpdHkgdHlwZSBhbmQgYSBjb252ZXJ0ZXIgY29udGV4dC5cblx0ICpcblx0ICogQHBhcmFtIGVudGl0eVR5cGUgVGhlIEVudGl0eVR5cGVcblx0ICogQHBhcmFtIGNvbnZlcnRlckNvbnRleHQgVGhlIENvbnZlcnRlckNvbnRleHRcblx0ICovXG5cdGNvbnN0cnVjdG9yKGVudGl0eVR5cGU6IEVudGl0eVR5cGUsIGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpIHtcblx0XHR0aGlzLl9lbnRpdHlUeXBlID0gZW50aXR5VHlwZTtcblx0XHR0aGlzLl9jb252ZXJ0ZXJDb250ZXh0ID0gY29udmVydGVyQ29udGV4dDtcblxuXHRcdHRoaXMuX29BZ2dyZWdhdGlvbkFubm90YXRpb25UYXJnZXQgPSB0aGlzLl9kZXRlcm1pbmVBZ2dyZWdhdGlvbkFubm90YXRpb25UYXJnZXQoKTtcblx0XHRpZiAodGhpcy5fb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldD8uX3R5cGUgPT09IFwiTmF2aWdhdGlvblByb3BlcnR5XCIpIHtcblx0XHRcdHRoaXMub1RhcmdldEFnZ3JlZ2F0aW9uQW5ub3RhdGlvbnMgPSB0aGlzLl9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0Py5hbm5vdGF0aW9uc1xuXHRcdFx0XHQ/LkFnZ3JlZ2F0aW9uIGFzIENvbGxlY3Rpb25Bbm5vdGF0aW9uc19BZ2dyZWdhdGlvbjtcblx0XHR9IGVsc2UgaWYgKHRoaXMuX29BZ2dyZWdhdGlvbkFubm90YXRpb25UYXJnZXQ/Ll90eXBlID09PSBcIkVudGl0eVR5cGVcIikge1xuXHRcdFx0dGhpcy5vVGFyZ2V0QWdncmVnYXRpb25Bbm5vdGF0aW9ucyA9IHRoaXMuX29BZ2dyZWdhdGlvbkFubm90YXRpb25UYXJnZXQ/LmFubm90YXRpb25zXG5cdFx0XHRcdD8uQWdncmVnYXRpb24gYXMgRW50aXR5VHlwZUFubm90YXRpb25zX0FnZ3JlZ2F0aW9uO1xuXHRcdH0gZWxzZSBpZiAodGhpcy5fb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldD8uX3R5cGUgPT09IFwiRW50aXR5U2V0XCIpIHtcblx0XHRcdHRoaXMub1RhcmdldEFnZ3JlZ2F0aW9uQW5ub3RhdGlvbnMgPSB0aGlzLl9vQWdncmVnYXRpb25Bbm5vdGF0aW9uVGFyZ2V0Py5hbm5vdGF0aW9uc1xuXHRcdFx0XHQ/LkFnZ3JlZ2F0aW9uIGFzIEVudGl0eVNldEFubm90YXRpb25zX0FnZ3JlZ2F0aW9uO1xuXHRcdH1cblx0XHR0aGlzLl9iQXBwbHlTdXBwb3J0ZWQgPSB0aGlzLm9UYXJnZXRBZ2dyZWdhdGlvbkFubm90YXRpb25zPy5BcHBseVN1cHBvcnRlZCA/IHRydWUgOiBmYWxzZTtcblxuXHRcdGlmICh0aGlzLl9iQXBwbHlTdXBwb3J0ZWQpIHtcblx0XHRcdHRoaXMuX2FHcm91cGFibGVQcm9wZXJ0aWVzID0gdGhpcy5vVGFyZ2V0QWdncmVnYXRpb25Bbm5vdGF0aW9ucz8uQXBwbHlTdXBwb3J0ZWQ/Lkdyb3VwYWJsZVByb3BlcnRpZXMgYXMgUHJvcGVydHlQYXRoW107XG5cdFx0XHR0aGlzLl9hQWdncmVnYXRhYmxlUHJvcGVydGllcyA9IHRoaXMub1RhcmdldEFnZ3JlZ2F0aW9uQW5ub3RhdGlvbnM/LkFwcGx5U3VwcG9ydGVkPy5BZ2dyZWdhdGFibGVQcm9wZXJ0aWVzO1xuXG5cdFx0XHR0aGlzLm9Db250YWluZXJBZ2dyZWdhdGlvbkFubm90YXRpb24gPSBjb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eUNvbnRhaW5lcigpLmFubm90YXRpb25zXG5cdFx0XHRcdC5BZ2dyZWdhdGlvbiBhcyBFbnRpdHlDb250YWluZXJBbm5vdGF0aW9uc19BZ2dyZWdhdGlvbjtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqIERldGVybWluZXMgdGhlIG1vc3QgYXBwcm9wcmlhdGUgdGFyZ2V0IGZvciB0aGUgYWdncmVnYXRpb24gYW5ub3RhdGlvbnMuXG5cdCAqXG5cdCAqIEByZXR1cm5zICBFbnRpdHlUeXBlLCBFbnRpdHlTZXQgb3IgTmF2aWdhdGlvblByb3BlcnR5IHdoZXJlIGFnZ3JlZ2F0aW9uIGFubm90YXRpb25zIHNob3VsZCBiZSByZWFkIGZyb20uXG5cdCAqL1xuXHRwcml2YXRlIF9kZXRlcm1pbmVBZ2dyZWdhdGlvbkFubm90YXRpb25UYXJnZXQoKTogRW50aXR5VHlwZSB8IEVudGl0eVNldCB8IE5hdmlnYXRpb25Qcm9wZXJ0eSB7XG5cdFx0Y29uc3QgYklzUGFyYW1ldGVyaXplZCA9IHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0RGF0YU1vZGVsT2JqZWN0UGF0aCgpPy50YXJnZXRFbnRpdHlTZXQ/LmVudGl0eVR5cGU/LmFubm90YXRpb25zPy5Db21tb25cblx0XHRcdD8uUmVzdWx0Q29udGV4dFxuXHRcdFx0PyB0cnVlXG5cdFx0XHQ6IGZhbHNlO1xuXHRcdGxldCBvQWdncmVnYXRpb25Bbm5vdGF0aW9uU291cmNlO1xuXG5cdFx0Ly8gZmluZCBBcHBseVN1cHBvcnRlZFxuXHRcdGlmIChiSXNQYXJhbWV0ZXJpemVkKSB7XG5cdFx0XHQvLyBpZiB0aGlzIGlzIGEgcGFyYW1ldGVyaXplZCB2aWV3IHRoZW4gYXBwbHlzdXBwb3J0ZWQgY2FuIGJlIGZvdW5kIGF0IGVpdGhlciB0aGUgbmF2UHJvcCBwb2ludGluZyB0byB0aGUgcmVzdWx0IHNldCBvciBlbnRpdHlUeXBlLlxuXHRcdFx0Ly8gSWYgYXBwbHlTdXBwb3J0ZWQgaXMgcHJlc2VudCBhdCBib3RoIHRoZSBuYXZQcm9wIGFuZCB0aGUgZW50aXR5VHlwZSB0aGVuIG5hdlByb3AgaXMgbW9yZSBzcGVjaWZpYyBzbyB0YWtlIGFubm90YXRpb25zIGZyb20gdGhlcmVcblx0XHRcdC8vIHRhcmdldE9iamVjdCBpbiB0aGUgY29udmVydGVyIGNvbnRleHQgZm9yIGEgcGFyYW1ldGVyaXplZCB2aWV3IGlzIHRoZSBuYXZpZ2F0aW9uIHByb3BlcnR5IHBvaW50aW5nIHRvIHRoIHJlc3VsdCBzZXRcblx0XHRcdGNvbnN0IG9EYXRhTW9kZWxPYmplY3RQYXRoID0gdGhpcy5fY29udmVydGVyQ29udGV4dC5nZXREYXRhTW9kZWxPYmplY3RQYXRoKCk7XG5cdFx0XHRjb25zdCBvTmF2aWdhdGlvblByb3BlcnR5T2JqZWN0ID0gb0RhdGFNb2RlbE9iamVjdFBhdGg/LnRhcmdldE9iamVjdDtcblx0XHRcdGNvbnN0IG9FbnRpdHlUeXBlT2JqZWN0ID0gb0RhdGFNb2RlbE9iamVjdFBhdGg/LnRhcmdldEVudGl0eVR5cGU7XG5cdFx0XHRpZiAob05hdmlnYXRpb25Qcm9wZXJ0eU9iamVjdD8uYW5ub3RhdGlvbnM/LkFnZ3JlZ2F0aW9uPy5BcHBseVN1cHBvcnRlZCkge1xuXHRcdFx0XHRvQWdncmVnYXRpb25Bbm5vdGF0aW9uU291cmNlID0gb05hdmlnYXRpb25Qcm9wZXJ0eU9iamVjdDtcblx0XHRcdH0gZWxzZSBpZiAob0VudGl0eVR5cGVPYmplY3Q/LmFubm90YXRpb25zPy5BZ2dyZWdhdGlvbj8uQXBwbHlTdXBwb3J0ZWQpIHtcblx0XHRcdFx0b0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblNvdXJjZSA9IG9FbnRpdHlUeXBlT2JqZWN0O1xuXHRcdFx0fVxuXHRcdH0gZWxzZSB7XG5cdFx0XHQvLyBGb3IgdGhlIHRpbWUgYmVpbmcsIHdlIGlnbm9yZSBhbm5vdGF0aW9ucyBhdCB0aGUgY29udGFpbmVyIGxldmVsLCB1bnRpbCB0aGUgdm9jYWJ1bGFyeSBpcyBzdGFiaWxpemVkXG5cdFx0XHRjb25zdCBvRW50aXR5U2V0T2JqZWN0ID0gdGhpcy5fY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlTZXQoKTtcblx0XHRcdGlmICghTW9kZWxIZWxwZXIuaXNTaW5nbGV0b24ob0VudGl0eVNldE9iamVjdCkgJiYgKG9FbnRpdHlTZXRPYmplY3QgYXMgRW50aXR5U2V0KT8uYW5ub3RhdGlvbnM/LkFnZ3JlZ2F0aW9uPy5BcHBseVN1cHBvcnRlZCkge1xuXHRcdFx0XHRvQWdncmVnYXRpb25Bbm5vdGF0aW9uU291cmNlID0gb0VudGl0eVNldE9iamVjdDtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdG9BZ2dyZWdhdGlvbkFubm90YXRpb25Tb3VyY2UgPSB0aGlzLl9jb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIG9BZ2dyZWdhdGlvbkFubm90YXRpb25Tb3VyY2U7XG5cdH1cblxuXHQvKipcblx0ICogQ2hlY2tzIGlmIHRoZSBlbnRpdHkgc3VwcG9ydHMgYW5hbHl0aWNhbCBxdWVyaWVzLlxuXHQgKlxuXHQgKiBAcmV0dXJucyBgdHJ1ZWAgaWYgYW5hbHl0aWNhbCBxdWVyaWVzIGFyZSBzdXBwb3J0ZWQsIGZhbHNlIG90aGVyd2lzZS5cblx0ICovXG5cdHB1YmxpYyBpc0FuYWx5dGljc1N1cHBvcnRlZCgpOiBib29sZWFuIHtcblx0XHRyZXR1cm4gdGhpcy5fYkFwcGx5U3VwcG9ydGVkO1xuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIHByb3BlcnR5IGlzIGdyb3VwYWJsZS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5IFRoZSBwcm9wZXJ0eSB0byBjaGVja1xuXHQgKiBAcmV0dXJucyBgdW5kZWZpbmVkYCBpZiB0aGUgZW50aXR5IGRvZXNuJ3Qgc3VwcG9ydCBhbmFseXRpY2FsIHF1ZXJpZXMsIHRydWUgb3IgZmFsc2Ugb3RoZXJ3aXNlXG5cdCAqL1xuXHRwdWJsaWMgaXNQcm9wZXJ0eUdyb3VwYWJsZShwcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAoIXRoaXMuX2JBcHBseVN1cHBvcnRlZCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9IGVsc2UgaWYgKCF0aGlzLl9hR3JvdXBhYmxlUHJvcGVydGllcyB8fCB0aGlzLl9hR3JvdXBhYmxlUHJvcGVydGllcy5sZW5ndGggPT09IDApIHtcblx0XHRcdC8vIE5vIGdyb3VwYWJsZVByb3BlcnRpZXMgLS0+IGFsbCBwcm9wZXJ0aWVzIGFyZSBncm91cGFibGVcblx0XHRcdHJldHVybiB0cnVlO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5fYUdyb3VwYWJsZVByb3BlcnRpZXMuZmluZEluZGV4KChwYXRoKSA9PiBwYXRoLiR0YXJnZXQuZnVsbHlRdWFsaWZpZWROYW1lID09PSBwcm9wZXJ0eS5mdWxseVF1YWxpZmllZE5hbWUpID49IDA7XG5cdFx0fVxuXHR9XG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiBhIHByb3BlcnR5IGlzIGFnZ3JlZ2F0YWJsZS5cblx0ICpcblx0ICogQHBhcmFtIHByb3BlcnR5IFRoZSBwcm9wZXJ0eSB0byBjaGVja1xuXHQgKiBAcmV0dXJucyBgdW5kZWZpbmVkYCBpZiB0aGUgZW50aXR5IGRvZXNuJ3Qgc3VwcG9ydCBhbmFseXRpY2FsIHF1ZXJpZXMsIHRydWUgb3IgZmFsc2Ugb3RoZXJ3aXNlXG5cdCAqL1xuXHRwdWJsaWMgaXNQcm9wZXJ0eUFnZ3JlZ2F0YWJsZShwcm9wZXJ0eTogUHJvcGVydHkpOiBib29sZWFuIHwgdW5kZWZpbmVkIHtcblx0XHRpZiAoIXRoaXMuX2JBcHBseVN1cHBvcnRlZCkge1xuXHRcdFx0cmV0dXJuIHVuZGVmaW5lZDtcblx0XHR9IGVsc2Uge1xuXHRcdFx0Ly8gR2V0IHRoZSBjdXN0b20gYWdncmVnYXRlc1xuXHRcdFx0Y29uc3QgYUN1c3RvbUFnZ3JlZ2F0ZUFubm90YXRpb25zOiBDdXN0b21BZ2dyZWdhdGVbXSA9IHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbnNCeVRlcm0oXG5cdFx0XHRcdFwiQWdncmVnYXRpb25cIixcblx0XHRcdFx0QWdncmVnYXRpb25Bbm5vdGF0aW9uVGVybXMuQ3VzdG9tQWdncmVnYXRlLFxuXHRcdFx0XHRbdGhpcy5fb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldF1cblx0XHRcdCk7XG5cblx0XHRcdC8vIENoZWNrIGlmIGEgY3VzdG9tIGFnZ3JlZ2F0ZSBoYXMgYSBxdWFsaWZpZXIgdGhhdCBjb3JyZXNwb25kcyB0byB0aGUgcHJvcGVydHkgbmFtZVxuXHRcdFx0cmV0dXJuIGFDdXN0b21BZ2dyZWdhdGVBbm5vdGF0aW9ucy5zb21lKChhbm5vdGF0aW9uKSA9PiB7XG5cdFx0XHRcdHJldHVybiBwcm9wZXJ0eS5uYW1lID09PSBhbm5vdGF0aW9uLnF1YWxpZmllcjtcblx0XHRcdH0pO1xuXHRcdH1cblx0fVxuXG5cdHB1YmxpYyBnZXRHcm91cGFibGVQcm9wZXJ0aWVzKCkge1xuXHRcdHJldHVybiB0aGlzLl9hR3JvdXBhYmxlUHJvcGVydGllcztcblx0fVxuXG5cdHB1YmxpYyBnZXRBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzKCkge1xuXHRcdHJldHVybiB0aGlzLl9hQWdncmVnYXRhYmxlUHJvcGVydGllcztcblx0fVxuXG5cdHB1YmxpYyBnZXRFbnRpdHlUeXBlKCkge1xuXHRcdHJldHVybiB0aGlzLl9lbnRpdHlUeXBlO1xuXHR9XG5cblx0LyoqXG5cdCAqIFJldHVybnMgQWdncmVnYXRlZFByb3BlcnRpZXMgb3IgQWdncmVnYXRlZFByb3BlcnR5IGJhc2VkIG9uIHBhcmFtIFRlcm0uXG5cdCAqIFRoZSBUZXJtIGhlcmUgaW5kaWNhdGVzIGlmIHRoZSBBZ2dyZWdhdGVkUHJvcGVydHkgc2hvdWxkIGJlIHJldHJpZXZlZCBvciB0aGUgZGVwcmVjYXRlZCBBZ2dyZWdhdGVkUHJvcGVydGllcy5cblx0ICpcblx0ICogQHBhcmFtIFRlcm0gVGhlIEFubm90YXRpb24gVGVybVxuXHQgKiBAcmV0dXJucyBBbm5vdGF0aW9ucyBUaGUgYXBwcm9wcmlhdGUgYW5ub3RhdGlvbnMgYmFzZWQgb24gdGhlIGdpdmVuIFRlcm0uXG5cdCAqL1xuXHRwdWJsaWMgZ2V0QWdncmVnYXRlZFByb3BlcnRpZXMoVGVybTogU3RyaW5nKSB7XG5cdFx0aWYgKFRlcm0gPT09IFwiQWdncmVnYXRlZFByb3BlcnRpZXNcIikge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbnNCeVRlcm0oXCJBbmFseXRpY3NcIiwgXCJjb20uc2FwLnZvY2FidWxhcmllcy5BbmFseXRpY3MudjEuQWdncmVnYXRlZFByb3BlcnRpZXNcIiwgW1xuXHRcdFx0XHR0aGlzLl9jb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eUNvbnRhaW5lcigpLFxuXHRcdFx0XHR0aGlzLl9jb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eVR5cGUoKVxuXHRcdFx0XSk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9jb252ZXJ0ZXJDb250ZXh0LmdldEFubm90YXRpb25zQnlUZXJtKFwiQW5hbHl0aWNzXCIsIFwiY29tLnNhcC52b2NhYnVsYXJpZXMuQW5hbHl0aWNzLnYxLkFnZ3JlZ2F0ZWRQcm9wZXJ0eVwiLCBbXG5cdFx0XHR0aGlzLl9jb252ZXJ0ZXJDb250ZXh0LmdldEVudGl0eUNvbnRhaW5lcigpLFxuXHRcdFx0dGhpcy5fY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKClcblx0XHRdKTtcblx0fVxuXHQvLyByZXRpcnZlIGFsbCB0cmFuc2Zvcm1hdGlvbiBhZ2dyZWdhdGVzIGJ5IHByaW9yaXRpemluZyBBZ2dyZWdhdGVkUHJvcGVydHkgb3ZlciBBZ2dyZWdhdGVkUHJvcGVydGllcyBvYmplY3RzXG5cdHB1YmxpYyBnZXRUcmFuc0FnZ3JlZ2F0aW9ucygpIHtcblx0XHRsZXQgYUFnZ3JlZ2F0ZWRQcm9wZXJ0eU9iamVjdHMgPSB0aGlzLmdldEFnZ3JlZ2F0ZWRQcm9wZXJ0aWVzKFwiQWdncmVnYXRlZFByb3BlcnR5XCIpO1xuXHRcdGlmICghYUFnZ3JlZ2F0ZWRQcm9wZXJ0eU9iamVjdHMgfHwgYUFnZ3JlZ2F0ZWRQcm9wZXJ0eU9iamVjdHMubGVuZ3RoID09PSAwKSB7XG5cdFx0XHRhQWdncmVnYXRlZFByb3BlcnR5T2JqZWN0cyA9IHRoaXMuZ2V0QWdncmVnYXRlZFByb3BlcnRpZXMoXCJBZ2dyZWdhdGVkUHJvcGVydGllc1wiKVswXTtcblx0XHR9XG5cdFx0cmV0dXJuIGFBZ2dyZWdhdGVkUHJvcGVydHlPYmplY3RzPy5maWx0ZXIoKGFnZ3JlZ2F0ZWRQcm9wZXJ0eTogQWdncmVnYXRlZFByb3BlcnR5VHlwZSkgPT4ge1xuXHRcdFx0aWYgKHRoaXMuX2dldEFnZ3JlZ2F0YWJsZUFnZ3JlZ2F0ZXMoYWdncmVnYXRlZFByb3BlcnR5LkFnZ3JlZ2F0YWJsZVByb3BlcnR5KSkge1xuXHRcdFx0XHRyZXR1cm4gYWdncmVnYXRlZFByb3BlcnR5O1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9XG5cblx0LyoqXG5cdCAqIGNoZWNrIGlmIGVhY2ggdHJhbnNmb3JtYXRpb24vY3VzdG9tIGFnZ3JlZ2F0ZSBpcyBhZ2dyZWdhdGFibGUuXG5cdCAqXG5cdCAqIEBwYXJhbSBwcm9wZXJ0eSBUaGUgcHJvcGVydHkgdG8gY2hlY2tcblx0ICogQHJldHVybnMgJ2FnZ3JlZ2F0ZWRQcm9wZXJ0eSdcblx0ICovXG5cblx0cHJpdmF0ZSBfZ2V0QWdncmVnYXRhYmxlQWdncmVnYXRlcyhwcm9wZXJ0eTogUHJvcGVydHlQYXRoIHwgQW5ub3RhdGlvblRlcm08Q3VzdG9tQWdncmVnYXRlPikge1xuXHRcdGNvbnN0IGFBZ2dyZWdhdGFibGVQcm9wZXJ0aWVzID0gKHRoaXMuZ2V0QWdncmVnYXRhYmxlUHJvcGVydGllcygpIGFzIEFwcGx5U3VwcG9ydGVkVHlwZVtcIkFnZ3JlZ2F0YWJsZVByb3BlcnRpZXNcIl0pIHx8IFtdO1xuXHRcdHJldHVybiBhQWdncmVnYXRhYmxlUHJvcGVydGllcy5maW5kKGZ1bmN0aW9uIChvYmo6IEFnZ3JlZ2F0YWJsZVByb3BlcnR5VHlwZSkge1xuXHRcdFx0cmV0dXJuIChcblx0XHRcdFx0b2JqLlByb3BlcnR5LnZhbHVlID09PVxuXHRcdFx0XHQoKHByb3BlcnR5IGFzIEFubm90YXRpb25UZXJtPEN1c3RvbUFnZ3JlZ2F0ZT4pLnF1YWxpZmllclxuXHRcdFx0XHRcdD8gKHByb3BlcnR5IGFzIEFubm90YXRpb25UZXJtPEN1c3RvbUFnZ3JlZ2F0ZT4pLnF1YWxpZmllclxuXHRcdFx0XHRcdDogKHByb3BlcnR5IGFzIFByb3BlcnR5UGF0aCkuJHRhcmdldC5uYW1lKVxuXHRcdFx0KTtcblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBsaXN0IG9mIGN1c3RvbSBhZ2dyZWdhdGUgZGVmaW5pdGlvbnMgZm9yIHRoZSBlbnRpdHkgdHlwZS5cblx0ICpcblx0ICogQHJldHVybnMgQSBtYXAgKHByb3BlcnR5TmFtZSAtLT4gYXJyYXkgb2YgY29udGV4dC1kZWZpbmluZyBwcm9wZXJ0eSBuYW1lcykgZm9yIGVhY2ggY3VzdG9tIGFnZ3JlZ2F0ZSBjb3JyZXNwb25kaW5nIHRvIGEgcHJvcGVydHkuIFRoZSBhcnJheSBvZlxuXHQgKiBjb250ZXh0LWRlZmluaW5nIHByb3BlcnR5IG5hbWVzIGlzIGVtcHR5IGlmIHRoZSBjdXN0b20gYWdncmVnYXRlIGRvZXNuJ3QgaGF2ZSBhbnkgY29udGV4dC1kZWZpbmluZyBwcm9wZXJ0eS5cblx0ICovXG5cdHB1YmxpYyBnZXRDdXN0b21BZ2dyZWdhdGVEZWZpbml0aW9ucygpIHtcblx0XHQvLyBHZXQgdGhlIGN1c3RvbSBhZ2dyZWdhdGVzXG5cdFx0Y29uc3QgYUN1c3RvbUFnZ3JlZ2F0ZUFubm90YXRpb25zOiBDdXN0b21BZ2dyZWdhdGVbXSA9IHRoaXMuX2NvbnZlcnRlckNvbnRleHQuZ2V0QW5ub3RhdGlvbnNCeVRlcm0oXG5cdFx0XHRcIkFnZ3JlZ2F0aW9uXCIsXG5cdFx0XHRBZ2dyZWdhdGlvbkFubm90YXRpb25UZXJtcy5DdXN0b21BZ2dyZWdhdGUsXG5cdFx0XHRbdGhpcy5fb0FnZ3JlZ2F0aW9uQW5ub3RhdGlvblRhcmdldF1cblx0XHQpO1xuXHRcdHJldHVybiBhQ3VzdG9tQWdncmVnYXRlQW5ub3RhdGlvbnMuZmlsdGVyKChjdXN0b21BZ2dyZWdhdGU6IEFubm90YXRpb25UZXJtPEN1c3RvbUFnZ3JlZ2F0ZT4pID0+IHtcblx0XHRcdGlmICh0aGlzLl9nZXRBZ2dyZWdhdGFibGVBZ2dyZWdhdGVzKGN1c3RvbUFnZ3JlZ2F0ZSkpIHtcblx0XHRcdFx0cmV0dXJuIGN1c3RvbUFnZ3JlZ2F0ZTtcblx0XHRcdH1cblx0XHR9KTtcblx0fVxuXG5cdC8qKlxuXHQgKiBSZXR1cm5zIHRoZSBsaXN0IG9mIGFsbG93ZWQgdHJhbnNmb3JtYXRpb25zIGluIHRoZSAkYXBwbHkuXG5cdCAqIEZpcnN0IGxvb2sgYXQgdGhlIGN1cnJlbnQgRW50aXR5U2V0LCB0aGVuIGxvb2sgYXQgdGhlIGRlZmF1bHQgdmFsdWVzIHByb3ZpZGVkIGF0IHRoZSBjb250YWluZXIgbGV2ZWwuXG5cdCAqXG5cdCAqIEByZXR1cm5zIFRoZSBsaXN0IG9mIHRyYW5zZm9ybWF0aW9ucywgb3IgdW5kZWZpbmVkIGlmIG5vIGxpc3QgaXMgZm91bmRcblx0ICovXG5cdHB1YmxpYyBnZXRBbGxvd2VkVHJhbnNmb3JtYXRpb25zKCk6IFN0cmluZ1tdIHwgdW5kZWZpbmVkIHtcblx0XHRyZXR1cm4gKFxuXHRcdFx0KHRoaXMub1RhcmdldEFnZ3JlZ2F0aW9uQW5ub3RhdGlvbnM/LkFwcGx5U3VwcG9ydGVkPy5UcmFuc2Zvcm1hdGlvbnMgYXMgU3RyaW5nW10pIHx8XG5cdFx0XHQodGhpcy5vQ29udGFpbmVyQWdncmVnYXRpb25Bbm5vdGF0aW9uPy5BcHBseVN1cHBvcnRlZERlZmF1bHRzPy5UcmFuc2Zvcm1hdGlvbnMgYXMgU3RyaW5nW10pXG5cdFx0KTtcblx0fVxufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztFQWFBO0FBQ0E7QUFDQTtFQUZBLElBR2FBLGlCQUFpQjtJQWM3QjtBQUNEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQywyQkFBWUMsVUFBc0IsRUFBRUMsZ0JBQWtDLEVBQUU7TUFBQTtNQUN2RSxJQUFJLENBQUNDLFdB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