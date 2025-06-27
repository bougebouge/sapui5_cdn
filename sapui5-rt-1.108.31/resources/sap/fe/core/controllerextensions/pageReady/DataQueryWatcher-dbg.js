/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/macros/table/Utils"], function (Log, Utils) {
  "use strict";

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
  var DataQueryWatcher = /*#__PURE__*/function () {
    function DataQueryWatcher(_oEventProvider, _fnOnFinished) {
      this._aBindingRegistrations = [];
      this._aOtherEventSources = [];
      this._isSearchPending = false;
      this._aMDCTables = [];
      this._aMDCCharts = [];
      this._oEventProvider = _oEventProvider;
      this._fnOnFinished = _fnOnFinished;
    }
    // Accessors
    var _proto = DataQueryWatcher.prototype;
    _proto.isSearchPending = function isSearchPending() {
      return this._isSearchPending;
    };
    _proto.isDataReceived = function isDataReceived() {
      return this._isDataReceived;
    };
    _proto.resetDataReceived = function resetDataReceived() {
      this._isDataReceived = undefined;
    }
    /**
     * Reset the state: unsubscribe to all data events and remove all registered objects.
     */;
    _proto.reset = function reset() {
      var _this = this;
      // Remove all remaining callbacks
      this._aBindingRegistrations.forEach(function (reg) {
        reg.binding.detachEvent("dataRequested", _this.onDataRequested, _this);
        reg.binding.detachEvent("dataReceived", _this.onDataReceived, _this);
      });
      this._aOtherEventSources.forEach(function (oElement) {
        oElement.detachEvent("search", _this.onSearch, _this);
        oElement.detachEvent("bindingUpdated", _this.register, _this);
      });
      this._aBindingRegistrations = [];
      this._aOtherEventSources = [];
      this._aMDCTables = [];
      this._aMDCCharts = [];
      this._isSearchPending = false;
      this._isDataReceived = undefined;
    }
    // //////////////////////////////////////////////////
    // Callback when data is received on a binding.
    ;
    _proto.onDataReceived = function onDataReceived(oEvent, params) {
      // Look for the corresponding binding registration
      var binding = oEvent.getSource();
      var bindingRegistration = this._aBindingRegistrations.find(function (reg) {
        return reg.binding === binding;
      });
      if (!bindingRegistration) {
        Log.error("PageReady - data received on an unregistered binding");
        return;
      }
      switch (binding.getGroupId()) {
        case "$auto.Workers":
          this._oEventProvider.fireEvent("workersBatchReceived");
          break;
        case "$auto.Heroes":
          this._oEventProvider.fireEvent("heroesBatchReceived");
          break;
        default:
      }
      bindingRegistration.receivedCount++;
      if (bindingRegistration.receivedCount < bindingRegistration.requestedCount) {
        // There are other request pending --> resubscribe to wait until they return
        binding.attachEventOnce("dataReceived", {
          triggeredBySearch: params.triggeredBySearch
        }, this.onDataReceived, this);
        return;
      }
      // Check if at least one binding has requested data, and all bindings that have requested data have received it
      var bAllDone = this._aBindingRegistrations.some(function (reg) {
        return reg.requestedCount !== 0;
      }) && this._aBindingRegistrations.every(function (reg) {
        return reg.requestedCount === 0 || reg.receivedCount >= reg.requestedCount;
      });
      if (params.triggeredBySearch || bindingRegistration.receivedCount >= bindingRegistration.requestedCount) {
        this._isSearchPending = false;
      }
      if (bAllDone) {
        this._isDataReceived = true;
        this._fnOnFinished();
      }
    }
    // //////////////////////////////////////////////////
    // Callback when data is requested on a binding.
    ;
    _proto.onDataRequested = function onDataRequested(oEvent, params) {
      // Look for the corresponding binding registration
      var binding = oEvent.getSource();
      var bindingRegistration = this._aBindingRegistrations.find(function (reg) {
        return reg.binding === binding;
      });
      if (!bindingRegistration) {
        Log.error("PageReady - data requested on an unregistered binding");
        return;
      }
      bindingRegistration.requestedCount++;
      this._isDataReceived = false;
      if (bindingRegistration.requestedCount - bindingRegistration.receivedCount === 1) {
        // Listen to dataReceived only if there's no other request pending
        // Otherwise the 'dataReceived' handler would be called several times when the first query returns
        // and we wouldn't wait for all queries to be finished
        // (we will resubscribe to the dataReceived event in onDataReceived if necessary)
        binding.attachEventOnce("dataReceived", {
          triggeredBySearch: params.triggeredBySearch
        }, this.onDataReceived, this);
      }
    }
    // //////////////////////////////////////////////////
    // Callback when a search is triggered from a filterbar
    ;
    _proto.onSearch = function onSearch(oEvent) {
      var _this3 = this;
      var _this2 = this;
      var aMDCTableLinkedToFilterBar = this._aMDCTables.filter(function (oTable) {
        var _oTable$getParent;
        return oEvent.getSource().sId === oTable.getFilter() && oTable.getVisible() && !((_oTable$getParent = oTable.getParent()) !== null && _oTable$getParent !== void 0 && _oTable$getParent.getProperty("bindingSuspended"));
      });
      var aMDCChartsLinkedToFilterBar = this._aMDCCharts.filter(function (oChart) {
        return oEvent.getSource().sId === oChart.getFilter() && oChart.getVisible();
      });
      if (aMDCTableLinkedToFilterBar.length > 0 || aMDCChartsLinkedToFilterBar.length > 0) {
        this._isSearchPending = true;
      }
      aMDCTableLinkedToFilterBar.forEach(function (oTable) {
        _this2.registerTable(oTable, true);
      });
      aMDCChartsLinkedToFilterBar.forEach(function (oChart) {
        try {
          var _temp4 = _catch(function () {
            function _temp2() {
              _this3.registerChart(oChart, true);
            }
            var _temp = function () {
              if (oChart.innerChartBoundPromise) {
                return Promise.resolve(oChart.innerChartBoundPromise).then(function () {});
              }
            }();
            return _temp && _temp.then ? _temp.then(_temp2) : _temp2(_temp);
          }, function (oError) {
            Log.error("Cannot find a inner bound chart", oError);
          });
          return Promise.resolve(_temp4 && _temp4.then ? _temp4.then(function () {}) : void 0);
        } catch (e) {
          return Promise.reject(e);
        }
      });
    }
    // //////////////////////////////////////////////////
    // Register a binding (with an optional table/chart)
    // and attach callbacks on dateRequested/dataReceived events
    ;
    _proto.register = function register(_event, data) {
      var _data$table, _data$chart;
      var binding = data.binding || ((_data$table = data.table) === null || _data$table === void 0 ? void 0 : _data$table.getRowBinding()) || ((_data$chart = data.chart) === null || _data$chart === void 0 ? void 0 : _data$chart.getControlDelegate().getInnerChart(data.chart).getBinding("data"));
      var boundControl = data.table || data.chart;
      if (!binding) {
        return;
      }
      // Check if the binding is already registered
      var bindingRegistration = this._aBindingRegistrations.find(function (reg) {
        return reg.binding === binding;
      });
      if (bindingRegistration) {
        if (boundControl) {
          // The binding was already registerd without boundControl information --> update boundControl
          bindingRegistration.boundControl = boundControl;
        }
        // This binding has already requested data, but we're registering it again (on search) --> attach to dataRequested again
        if (bindingRegistration.requestedCount > 0) {
          binding.detachEvent("dataRequested", this.onDataRequested, this);
          binding.attachEventOnce("dataRequested", {
            triggeredBySearch: data.triggeredBySearch
          }, this.onDataRequested, this);
        }
        return;
      }
      if (boundControl) {
        // Check if there's a different binding registered for the bound control
        bindingRegistration = this._aBindingRegistrations.find(function (reg) {
          return reg.boundControl === boundControl;
        });
        if (bindingRegistration && bindingRegistration.binding !== binding) {
          // The control had a different binding. This can happen in case of MDC charts who recreated their binding after search
          // The previous binding is destroyed, we can replace it with the new and reset counters
          bindingRegistration.binding = binding;
          bindingRegistration.requestedCount = 0;
          bindingRegistration.receivedCount = 0;
        }
      }
      if (!bindingRegistration) {
        bindingRegistration = {
          binding: binding,
          boundControl: boundControl,
          requestedCount: 0,
          receivedCount: 0
        };
        this._aBindingRegistrations.push(bindingRegistration);
      }
      binding.detachEvent("dataRequested", this.onDataRequested, this);
      binding.attachEventOnce("dataRequested", {
        triggeredBySearch: data.triggeredBySearch
      }, this.onDataRequested, this);
    }
    /**
     * Registers a binding for watching its data events (dataRequested and dataReceived).
     *
     * @param binding The binding
     */;
    _proto.registerBinding = function registerBinding(binding) {
      this.register(null, {
        binding: binding,
        triggeredBySearch: false
      });
    }
    /**
     * Registers an MDCTable for watching the data events on its row binding (dataRequested and dataReceived).
     *
     * @param table The table
     * @param triggeredBySearch True if this registration is triggered by a filterBar search
     */;
    _proto.registerTable = function registerTable(table) {
      var triggeredBySearch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (this._aMDCTables.indexOf(table) < 0) {
        this._aMDCTables.push(table);
      }
      var oRowBinding = table.getRowBinding();
      if (oRowBinding) {
        this.register(null, {
          table: table,
          triggeredBySearch: triggeredBySearch
        });
      }
      if (this._aOtherEventSources.indexOf(table) === -1) {
        table.attachEvent("bindingUpdated", {
          table: table,
          triggeredBySearch: triggeredBySearch
        }, this.register, this);
        this._aOtherEventSources.push(table);
      }
    }
    /**
     * Registers an MDCChart for watching the data events on its inner data binding (dataRequested and dataReceived).
     *
     * @param chart The chart
     * @param triggeredBySearch True if this registration is triggered by a filterBar search
     */;
    _proto.registerChart = function registerChart(chart) {
      var triggeredBySearch = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
      if (this._aMDCCharts.indexOf(chart) < 0) {
        this._aMDCCharts.push(chart);
      }
      var oInnerChart = chart.getControlDelegate().getInnerChart(chart);
      var binding = oInnerChart === null || oInnerChart === void 0 ? void 0 : oInnerChart.getBinding("data");
      if (binding) {
        this.register(null, {
          chart: chart,
          triggeredBySearch: triggeredBySearch
        });
      }
      if (this._aOtherEventSources.indexOf(chart) === -1) {
        chart.attachEvent("bindingUpdated", {
          chart: chart,
          triggeredBySearch: triggeredBySearch
        }, this.register, this);
        this._aOtherEventSources.push(chart);
      }
    }
    /**
     * Registers an MDCTable or MDCChart for watching the data events on its inner data binding (dataRequested and dataReceived).
     *
     * @param element  The table or chart
     */;
    _proto.registerTableOrChart = function registerTableOrChart(element) {
      try {
        var _this5 = this;
        if (!element.isA("sap.ui.mdc.Table") && !element.isA("sap.ui.mdc.Chart")) {
          return Promise.resolve();
        }
        var _temp8 = _catch(function () {
          return Promise.resolve(element.initialized()).then(function () {
            var _temp6 = function () {
              if (element.isA("sap.ui.mdc.Table")) {
                _this5.registerTable(element);
                //If the autoBindOnInit is enabled, the table will be rebound
                //Then we need to wait for this rebind to occur to ensure the pageReady will also wait for the data to be received
                var _temp9 = function () {
                  if (element.getAutoBindOnInit() && element.getDomRef()) {
                    return Promise.resolve(Utils.whenBound(element)).then(function () {});
                  }
                }();
                if (_temp9 && _temp9.then) return _temp9.then(function () {});
              } else {
                _this5.registerChart(element);
              }
            }();
            if (_temp6 && _temp6.then) return _temp6.then(function () {});
          }); // access binding only after table/chart is bound
        }, function (oError) {
          Log.error("PageReady - Cannot register a table or a chart", oError);
        });
        return Promise.resolve(_temp8 && _temp8.then ? _temp8.then(function () {}) : void 0);
      } catch (e) {
        return Promise.reject(e);
      }
    }
    /**
     * Registers an MDCFilterBar for watching its search event.
     *
     * @param filterBar The filter bar
     */
    ;
    _proto.registerFilterBar = function registerFilterBar(filterBar) {
      filterBar.attachEvent("search", this.onSearch, this);
      this._aOtherEventSources.push(filterBar);
    };
    return DataQueryWatcher;
  }();
  return DataQueryWatcher;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJib2R5IiwicmVjb3ZlciIsInJlc3VsdCIsImUiLCJ0aGVuIiwiRGF0YVF1ZXJ5V2F0Y2hlciIsIl9vRXZlbnRQcm92aWRlciIsIl9mbk9uRmluaXNoZWQiLCJfYUJpbmRpbmdSZWdpc3RyYXRpb25zIiwiX2FPdGhlckV2ZW50U291cmNlcyIsIl9pc1NlYXJjaFBlbmRpbmciLCJfYU1EQ1RhYmxlcyIsIl9hTURDQ2hhcnRzIiwiaXNTZWFyY2hQZW5kaW5nIiwiaXNEYXRhUmVjZWl2ZWQiLCJfaXNEYXRhUmVjZWl2ZWQiLCJyZXNldERhdGFSZWNlaXZlZCIsInVuZGVmaW5lZCIsInJlc2V0IiwiZm9yRWFjaCIsInJlZyIsImJpbmRpbmciLCJkZXRhY2hFdmVudCIsIm9uRGF0YVJlcXVlc3RlZCIsIm9uRGF0YVJlY2VpdmVkIiwib0VsZW1lbnQiLCJvblNlYXJjaCIsInJlZ2lzdGVyIiwib0V2ZW50IiwicGFyYW1zIiwiZ2V0U291cmNlIiwiYmluZGluZ1JlZ2lzdHJhdGlvbiIsImZpbmQiLCJMb2ciLCJlcnJvciIsImdldEdyb3VwSWQiLCJmaXJlRXZlbnQiLCJyZWNlaXZlZENvdW50IiwicmVxdWVzdGVkQ291bnQiLCJhdHRhY2hFdmVudE9uY2UiLCJ0cmlnZ2VyZWRCeVNlYXJjaCIsImJBbGxEb25lIiwic29tZSIsImV2ZXJ5IiwiYU1EQ1RhYmxlTGlua2VkVG9GaWx0ZXJCYXIiLCJmaWx0ZXIiLCJvVGFibGUiLCJzSWQiLCJnZXRGaWx0ZXIiLCJnZXRWaXNpYmxlIiwiZ2V0UGFyZW50IiwiZ2V0UHJvcGVydHkiLCJhTURDQ2hhcnRzTGlua2VkVG9GaWx0ZXJCYXIiLCJvQ2hhcnQiLCJsZW5ndGgiLCJyZWdpc3RlclRhYmxlIiwicmVnaXN0ZXJDaGFydCIsImlubmVyQ2hhcnRCb3VuZFByb21pc2UiLCJvRXJyb3IiLCJfZXZlbnQiLCJkYXRhIiwidGFibGUiLCJnZXRSb3dCaW5kaW5nIiwiY2hhcnQiLCJnZXRDb250cm9sRGVsZWdhdGUiLCJnZXRJbm5lckNoYXJ0IiwiZ2V0QmluZGluZyIsImJvdW5kQ29udHJvbCIsInB1c2giLCJyZWdpc3RlckJpbmRpbmciLCJpbmRleE9mIiwib1Jvd0JpbmRpbmciLCJhdHRhY2hFdmVudCIsIm9Jbm5lckNoYXJ0IiwicmVnaXN0ZXJUYWJsZU9yQ2hhcnQiLCJlbGVtZW50IiwiaXNBIiwiaW5pdGlhbGl6ZWQiLCJnZXRBdXRvQmluZE9uSW5pdCIsImdldERvbVJlZiIsIlV0aWxzIiwid2hlbkJvdW5kIiwicmVnaXN0ZXJGaWx0ZXJCYXIiLCJmaWx0ZXJCYXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkRhdGFRdWVyeVdhdGNoZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IExvZyBmcm9tIFwic2FwL2Jhc2UvTG9nXCI7XG5pbXBvcnQgVXRpbHMgZnJvbSBcInNhcC9mZS9tYWNyb3MvdGFibGUvVXRpbHNcIjtcbmltcG9ydCB0eXBlIEV2ZW50IGZyb20gXCJzYXAvdWkvYmFzZS9FdmVudFwiO1xuaW1wb3J0IHR5cGUgRXZlbnRQcm92aWRlciBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRQcm92aWRlclwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgQ2hhcnQgZnJvbSBcInNhcC91aS9tZGMvQ2hhcnRcIjtcbmltcG9ydCB0eXBlIEZpbHRlckJhciBmcm9tIFwic2FwL3VpL21kYy9GaWx0ZXJCYXJcIjtcbmltcG9ydCB0eXBlIFRhYmxlIGZyb20gXCJzYXAvdWkvbWRjL1RhYmxlXCI7XG5pbXBvcnQgdHlwZSBCaW5kaW5nIGZyb20gXCJzYXAvdWkvbW9kZWwvQmluZGluZ1wiO1xuXG5jbGFzcyBEYXRhUXVlcnlXYXRjaGVyIHtcblx0cHJvdGVjdGVkIF9hQmluZGluZ1JlZ2lzdHJhdGlvbnM6IHsgYmluZGluZzogQmluZGluZzsgYm91bmRDb250cm9sPzogQ29udHJvbDsgcmVxdWVzdGVkQ291bnQ6IG51bWJlcjsgcmVjZWl2ZWRDb3VudDogbnVtYmVyIH1bXSA9IFtdO1xuXHRwcm90ZWN0ZWQgX2FPdGhlckV2ZW50U291cmNlczogRXZlbnRQcm92aWRlcltdID0gW107XG5cdHByb3RlY3RlZCBfaXNTZWFyY2hQZW5kaW5nID0gZmFsc2U7XG5cdHByb3RlY3RlZCBfaXNEYXRhUmVjZWl2ZWQ/OiBib29sZWFuO1xuXHRwcm90ZWN0ZWQgX2FNRENUYWJsZXM6IFRhYmxlW10gPSBbXTtcblx0cHJvdGVjdGVkIF9hTURDQ2hhcnRzOiBDaGFydFtdID0gW107XG5cdHB1YmxpYyBjb25zdHJ1Y3Rvcihwcm90ZWN0ZWQgX29FdmVudFByb3ZpZGVyOiBFdmVudFByb3ZpZGVyLCBwcm90ZWN0ZWQgX2ZuT25GaW5pc2hlZDogKCkgPT4gdm9pZCkge31cblx0Ly8gQWNjZXNzb3JzXG5cdHB1YmxpYyBpc1NlYXJjaFBlbmRpbmcoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2lzU2VhcmNoUGVuZGluZztcblx0fVxuXHRwdWJsaWMgaXNEYXRhUmVjZWl2ZWQoKSB7XG5cdFx0cmV0dXJuIHRoaXMuX2lzRGF0YVJlY2VpdmVkO1xuXHR9XG5cdHB1YmxpYyByZXNldERhdGFSZWNlaXZlZCgpIHtcblx0XHR0aGlzLl9pc0RhdGFSZWNlaXZlZCA9IHVuZGVmaW5lZDtcblx0fVxuXHQvKipcblx0ICogUmVzZXQgdGhlIHN0YXRlOiB1bnN1YnNjcmliZSB0byBhbGwgZGF0YSBldmVudHMgYW5kIHJlbW92ZSBhbGwgcmVnaXN0ZXJlZCBvYmplY3RzLlxuXHQgKi9cblx0cHVibGljIHJlc2V0KCk6IHZvaWQge1xuXHRcdC8vIFJlbW92ZSBhbGwgcmVtYWluaW5nIGNhbGxiYWNrc1xuXHRcdHRoaXMuX2FCaW5kaW5nUmVnaXN0cmF0aW9ucy5mb3JFYWNoKChyZWcpID0+IHtcblx0XHRcdHJlZy5iaW5kaW5nLmRldGFjaEV2ZW50KFwiZGF0YVJlcXVlc3RlZFwiLCB0aGlzLm9uRGF0YVJlcXVlc3RlZCwgdGhpcyk7XG5cdFx0XHRyZWcuYmluZGluZy5kZXRhY2hFdmVudChcImRhdGFSZWNlaXZlZFwiLCB0aGlzLm9uRGF0YVJlY2VpdmVkLCB0aGlzKTtcblx0XHR9KTtcblx0XHR0aGlzLl9hT3RoZXJFdmVudFNvdXJjZXMuZm9yRWFjaCgob0VsZW1lbnQ6IGFueSkgPT4ge1xuXHRcdFx0b0VsZW1lbnQuZGV0YWNoRXZlbnQoXCJzZWFyY2hcIiwgdGhpcy5vblNlYXJjaCwgdGhpcyk7XG5cdFx0XHRvRWxlbWVudC5kZXRhY2hFdmVudChcImJpbmRpbmdVcGRhdGVkXCIsIHRoaXMucmVnaXN0ZXIsIHRoaXMpO1xuXHRcdH0pO1xuXHRcdHRoaXMuX2FCaW5kaW5nUmVnaXN0cmF0aW9ucyA9IFtdO1xuXHRcdHRoaXMuX2FPdGhlckV2ZW50U291cmNlcyA9IFtdO1xuXHRcdHRoaXMuX2FNRENUYWJsZXMgPSBbXTtcblx0XHR0aGlzLl9hTURDQ2hhcnRzID0gW107XG5cdFx0dGhpcy5faXNTZWFyY2hQZW5kaW5nID0gZmFsc2U7XG5cdFx0dGhpcy5faXNEYXRhUmVjZWl2ZWQgPSB1bmRlZmluZWQ7XG5cdH1cblx0Ly8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0Ly8gQ2FsbGJhY2sgd2hlbiBkYXRhIGlzIHJlY2VpdmVkIG9uIGEgYmluZGluZy5cblx0cHJvdGVjdGVkIG9uRGF0YVJlY2VpdmVkKG9FdmVudDogRXZlbnQsIHBhcmFtczogeyB0cmlnZ2VyZWRCeVNlYXJjaDogYm9vbGVhbiB9KTogdm9pZCB7XG5cdFx0Ly8gTG9vayBmb3IgdGhlIGNvcnJlc3BvbmRpbmcgYmluZGluZyByZWdpc3RyYXRpb25cblx0XHRjb25zdCBiaW5kaW5nID0gb0V2ZW50LmdldFNvdXJjZSgpIGFzIEJpbmRpbmc7XG5cdFx0Y29uc3QgYmluZGluZ1JlZ2lzdHJhdGlvbiA9IHRoaXMuX2FCaW5kaW5nUmVnaXN0cmF0aW9ucy5maW5kKChyZWcpID0+IHtcblx0XHRcdHJldHVybiByZWcuYmluZGluZyA9PT0gYmluZGluZztcblx0XHR9KTtcblx0XHRpZiAoIWJpbmRpbmdSZWdpc3RyYXRpb24pIHtcblx0XHRcdExvZy5lcnJvcihcIlBhZ2VSZWFkeSAtIGRhdGEgcmVjZWl2ZWQgb24gYW4gdW5yZWdpc3RlcmVkIGJpbmRpbmdcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdHN3aXRjaCAoKGJpbmRpbmcgYXMgYW55KS5nZXRHcm91cElkKCkpIHtcblx0XHRcdGNhc2UgXCIkYXV0by5Xb3JrZXJzXCI6XG5cdFx0XHRcdHRoaXMuX29FdmVudFByb3ZpZGVyLmZpcmVFdmVudChcIndvcmtlcnNCYXRjaFJlY2VpdmVkXCIpO1xuXHRcdFx0XHRicmVhaztcblx0XHRcdGNhc2UgXCIkYXV0by5IZXJvZXNcIjpcblx0XHRcdFx0dGhpcy5fb0V2ZW50UHJvdmlkZXIuZmlyZUV2ZW50KFwiaGVyb2VzQmF0Y2hSZWNlaXZlZFwiKTtcblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdH1cblx0XHRiaW5kaW5nUmVnaXN0cmF0aW9uLnJlY2VpdmVkQ291bnQrKztcblx0XHRpZiAoYmluZGluZ1JlZ2lzdHJhdGlvbi5yZWNlaXZlZENvdW50IDwgYmluZGluZ1JlZ2lzdHJhdGlvbi5yZXF1ZXN0ZWRDb3VudCkge1xuXHRcdFx0Ly8gVGhlcmUgYXJlIG90aGVyIHJlcXVlc3QgcGVuZGluZyAtLT4gcmVzdWJzY3JpYmUgdG8gd2FpdCB1bnRpbCB0aGV5IHJldHVyblxuXHRcdFx0YmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgeyB0cmlnZ2VyZWRCeVNlYXJjaDogcGFyYW1zLnRyaWdnZXJlZEJ5U2VhcmNoIH0sIHRoaXMub25EYXRhUmVjZWl2ZWQsIHRoaXMpO1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvLyBDaGVjayBpZiBhdCBsZWFzdCBvbmUgYmluZGluZyBoYXMgcmVxdWVzdGVkIGRhdGEsIGFuZCBhbGwgYmluZGluZ3MgdGhhdCBoYXZlIHJlcXVlc3RlZCBkYXRhIGhhdmUgcmVjZWl2ZWQgaXRcblx0XHRjb25zdCBiQWxsRG9uZSA9XG5cdFx0XHR0aGlzLl9hQmluZGluZ1JlZ2lzdHJhdGlvbnMuc29tZSgocmVnKSA9PiB7XG5cdFx0XHRcdHJldHVybiByZWcucmVxdWVzdGVkQ291bnQgIT09IDA7XG5cdFx0XHR9KSAmJlxuXHRcdFx0dGhpcy5fYUJpbmRpbmdSZWdpc3RyYXRpb25zLmV2ZXJ5KChyZWcpID0+IHtcblx0XHRcdFx0cmV0dXJuIHJlZy5yZXF1ZXN0ZWRDb3VudCA9PT0gMCB8fCByZWcucmVjZWl2ZWRDb3VudCA+PSByZWcucmVxdWVzdGVkQ291bnQ7XG5cdFx0XHR9KTtcblx0XHRpZiAocGFyYW1zLnRyaWdnZXJlZEJ5U2VhcmNoIHx8IGJpbmRpbmdSZWdpc3RyYXRpb24ucmVjZWl2ZWRDb3VudCA+PSBiaW5kaW5nUmVnaXN0cmF0aW9uLnJlcXVlc3RlZENvdW50KSB7XG5cdFx0XHR0aGlzLl9pc1NlYXJjaFBlbmRpbmcgPSBmYWxzZTtcblx0XHR9XG5cdFx0aWYgKGJBbGxEb25lKSB7XG5cdFx0XHR0aGlzLl9pc0RhdGFSZWNlaXZlZCA9IHRydWU7XG5cdFx0XHR0aGlzLl9mbk9uRmluaXNoZWQoKTtcblx0XHR9XG5cdH1cblx0Ly8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0Ly8gQ2FsbGJhY2sgd2hlbiBkYXRhIGlzIHJlcXVlc3RlZCBvbiBhIGJpbmRpbmcuXG5cdHByb3RlY3RlZCBvbkRhdGFSZXF1ZXN0ZWQob0V2ZW50OiBFdmVudCwgcGFyYW1zOiB7IHRyaWdnZXJlZEJ5U2VhcmNoOiBib29sZWFuIH0pOiB2b2lkIHtcblx0XHQvLyBMb29rIGZvciB0aGUgY29ycmVzcG9uZGluZyBiaW5kaW5nIHJlZ2lzdHJhdGlvblxuXHRcdGNvbnN0IGJpbmRpbmcgPSBvRXZlbnQuZ2V0U291cmNlKCkgYXMgQmluZGluZztcblx0XHRjb25zdCBiaW5kaW5nUmVnaXN0cmF0aW9uID0gdGhpcy5fYUJpbmRpbmdSZWdpc3RyYXRpb25zLmZpbmQoKHJlZykgPT4ge1xuXHRcdFx0cmV0dXJuIHJlZy5iaW5kaW5nID09PSBiaW5kaW5nO1xuXHRcdH0pO1xuXHRcdGlmICghYmluZGluZ1JlZ2lzdHJhdGlvbikge1xuXHRcdFx0TG9nLmVycm9yKFwiUGFnZVJlYWR5IC0gZGF0YSByZXF1ZXN0ZWQgb24gYW4gdW5yZWdpc3RlcmVkIGJpbmRpbmdcIik7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXHRcdGJpbmRpbmdSZWdpc3RyYXRpb24ucmVxdWVzdGVkQ291bnQrKztcblx0XHR0aGlzLl9pc0RhdGFSZWNlaXZlZCA9IGZhbHNlO1xuXHRcdGlmIChiaW5kaW5nUmVnaXN0cmF0aW9uLnJlcXVlc3RlZENvdW50IC0gYmluZGluZ1JlZ2lzdHJhdGlvbi5yZWNlaXZlZENvdW50ID09PSAxKSB7XG5cdFx0XHQvLyBMaXN0ZW4gdG8gZGF0YVJlY2VpdmVkIG9ubHkgaWYgdGhlcmUncyBubyBvdGhlciByZXF1ZXN0IHBlbmRpbmdcblx0XHRcdC8vIE90aGVyd2lzZSB0aGUgJ2RhdGFSZWNlaXZlZCcgaGFuZGxlciB3b3VsZCBiZSBjYWxsZWQgc2V2ZXJhbCB0aW1lcyB3aGVuIHRoZSBmaXJzdCBxdWVyeSByZXR1cm5zXG5cdFx0XHQvLyBhbmQgd2Ugd291bGRuJ3Qgd2FpdCBmb3IgYWxsIHF1ZXJpZXMgdG8gYmUgZmluaXNoZWRcblx0XHRcdC8vICh3ZSB3aWxsIHJlc3Vic2NyaWJlIHRvIHRoZSBkYXRhUmVjZWl2ZWQgZXZlbnQgaW4gb25EYXRhUmVjZWl2ZWQgaWYgbmVjZXNzYXJ5KVxuXHRcdFx0YmluZGluZy5hdHRhY2hFdmVudE9uY2UoXCJkYXRhUmVjZWl2ZWRcIiwgeyB0cmlnZ2VyZWRCeVNlYXJjaDogcGFyYW1zLnRyaWdnZXJlZEJ5U2VhcmNoIH0sIHRoaXMub25EYXRhUmVjZWl2ZWQsIHRoaXMpO1xuXHRcdH1cblx0fVxuXHQvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLyBDYWxsYmFjayB3aGVuIGEgc2VhcmNoIGlzIHRyaWdnZXJlZCBmcm9tIGEgZmlsdGVyYmFyXG5cdHByb3RlY3RlZCBvblNlYXJjaChvRXZlbnQ6IEV2ZW50KTogdm9pZCB7XG5cdFx0Y29uc3QgYU1EQ1RhYmxlTGlua2VkVG9GaWx0ZXJCYXIgPSB0aGlzLl9hTURDVGFibGVzLmZpbHRlcigob1RhYmxlKSA9PiB7XG5cdFx0XHRyZXR1cm4gKFxuXHRcdFx0XHQob0V2ZW50LmdldFNvdXJjZSgpIGFzIGFueSkuc0lkID09PSBvVGFibGUuZ2V0RmlsdGVyKCkgJiZcblx0XHRcdFx0b1RhYmxlLmdldFZpc2libGUoKSAmJlxuXHRcdFx0XHQhb1RhYmxlLmdldFBhcmVudCgpPy5nZXRQcm9wZXJ0eShcImJpbmRpbmdTdXNwZW5kZWRcIilcblx0XHRcdCk7XG5cdFx0fSk7XG5cdFx0Y29uc3QgYU1EQ0NoYXJ0c0xpbmtlZFRvRmlsdGVyQmFyID0gdGhpcy5fYU1EQ0NoYXJ0cy5maWx0ZXIoKG9DaGFydCkgPT4ge1xuXHRcdFx0cmV0dXJuIChvRXZlbnQuZ2V0U291cmNlKCkgYXMgYW55KS5zSWQgPT09IG9DaGFydC5nZXRGaWx0ZXIoKSAmJiBvQ2hhcnQuZ2V0VmlzaWJsZSgpO1xuXHRcdH0pO1xuXHRcdGlmIChhTURDVGFibGVMaW5rZWRUb0ZpbHRlckJhci5sZW5ndGggPiAwIHx8IGFNRENDaGFydHNMaW5rZWRUb0ZpbHRlckJhci5sZW5ndGggPiAwKSB7XG5cdFx0XHR0aGlzLl9pc1NlYXJjaFBlbmRpbmcgPSB0cnVlO1xuXHRcdH1cblx0XHRhTURDVGFibGVMaW5rZWRUb0ZpbHRlckJhci5mb3JFYWNoKChvVGFibGUpID0+IHtcblx0XHRcdHRoaXMucmVnaXN0ZXJUYWJsZShvVGFibGUsIHRydWUpO1xuXHRcdH0pO1xuXHRcdGFNRENDaGFydHNMaW5rZWRUb0ZpbHRlckJhci5mb3JFYWNoKGFzeW5jIChvQ2hhcnQ6IGFueSkgPT4ge1xuXHRcdFx0dHJ5IHtcblx0XHRcdFx0aWYgKG9DaGFydC5pbm5lckNoYXJ0Qm91bmRQcm9taXNlKSB7XG5cdFx0XHRcdFx0YXdhaXQgb0NoYXJ0LmlubmVyQ2hhcnRCb3VuZFByb21pc2U7XG5cdFx0XHRcdH1cblx0XHRcdFx0dGhpcy5yZWdpc3RlckNoYXJ0KG9DaGFydCwgdHJ1ZSk7XG5cdFx0XHR9IGNhdGNoIChvRXJyb3I6IGFueSkge1xuXHRcdFx0XHRMb2cuZXJyb3IoXCJDYW5ub3QgZmluZCBhIGlubmVyIGJvdW5kIGNoYXJ0XCIsIG9FcnJvcik7XG5cdFx0XHR9XG5cdFx0fSk7XG5cdH1cblx0Ly8gLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblx0Ly8gUmVnaXN0ZXIgYSBiaW5kaW5nICh3aXRoIGFuIG9wdGlvbmFsIHRhYmxlL2NoYXJ0KVxuXHQvLyBhbmQgYXR0YWNoIGNhbGxiYWNrcyBvbiBkYXRlUmVxdWVzdGVkL2RhdGFSZWNlaXZlZCBldmVudHNcblx0cHVibGljIHJlZ2lzdGVyKF9ldmVudDogRXZlbnQgfCBudWxsLCBkYXRhOiB7IGJpbmRpbmc/OiBCaW5kaW5nOyB0YWJsZT86IFRhYmxlOyBjaGFydD86IENoYXJ0OyB0cmlnZ2VyZWRCeVNlYXJjaDogYm9vbGVhbiB9KTogdm9pZCB7XG5cdFx0Y29uc3QgYmluZGluZzogQmluZGluZyB8IHVuZGVmaW5lZCA9XG5cdFx0XHRkYXRhLmJpbmRpbmcgfHxcblx0XHRcdGRhdGEudGFibGU/LmdldFJvd0JpbmRpbmcoKSB8fFxuXHRcdFx0KGRhdGEuY2hhcnQgYXMgYW55KT8uZ2V0Q29udHJvbERlbGVnYXRlKCkuZ2V0SW5uZXJDaGFydChkYXRhLmNoYXJ0KS5nZXRCaW5kaW5nKFwiZGF0YVwiKTtcblx0XHRjb25zdCBib3VuZENvbnRyb2wgPSAoZGF0YS50YWJsZSB8fCBkYXRhLmNoYXJ0KSBhcyBDb250cm9sIHwgdW5kZWZpbmVkO1xuXHRcdGlmICghYmluZGluZykge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHQvLyBDaGVjayBpZiB0aGUgYmluZGluZyBpcyBhbHJlYWR5IHJlZ2lzdGVyZWRcblx0XHRsZXQgYmluZGluZ1JlZ2lzdHJhdGlvbiA9IHRoaXMuX2FCaW5kaW5nUmVnaXN0cmF0aW9ucy5maW5kKChyZWcpID0+IHtcblx0XHRcdHJldHVybiByZWcuYmluZGluZyA9PT0gYmluZGluZztcblx0XHR9KTtcblx0XHRpZiAoYmluZGluZ1JlZ2lzdHJhdGlvbikge1xuXHRcdFx0aWYgKGJvdW5kQ29udHJvbCkge1xuXHRcdFx0XHQvLyBUaGUgYmluZGluZyB3YXMgYWxyZWFkeSByZWdpc3RlcmQgd2l0aG91dCBib3VuZENvbnRyb2wgaW5mb3JtYXRpb24gLS0+IHVwZGF0ZSBib3VuZENvbnRyb2xcblx0XHRcdFx0YmluZGluZ1JlZ2lzdHJhdGlvbi5ib3VuZENvbnRyb2wgPSBib3VuZENvbnRyb2w7XG5cdFx0XHR9XG5cdFx0XHQvLyBUaGlzIGJpbmRpbmcgaGFzIGFscmVhZHkgcmVxdWVzdGVkIGRhdGEsIGJ1dCB3ZSdyZSByZWdpc3RlcmluZyBpdCBhZ2FpbiAob24gc2VhcmNoKSAtLT4gYXR0YWNoIHRvIGRhdGFSZXF1ZXN0ZWQgYWdhaW5cblx0XHRcdGlmIChiaW5kaW5nUmVnaXN0cmF0aW9uLnJlcXVlc3RlZENvdW50ID4gMCkge1xuXHRcdFx0XHRiaW5kaW5nLmRldGFjaEV2ZW50KFwiZGF0YVJlcXVlc3RlZFwiLCB0aGlzLm9uRGF0YVJlcXVlc3RlZCwgdGhpcyk7XG5cdFx0XHRcdGJpbmRpbmcuYXR0YWNoRXZlbnRPbmNlKFwiZGF0YVJlcXVlc3RlZFwiLCB7IHRyaWdnZXJlZEJ5U2VhcmNoOiBkYXRhLnRyaWdnZXJlZEJ5U2VhcmNoIH0sIHRoaXMub25EYXRhUmVxdWVzdGVkLCB0aGlzKTtcblx0XHRcdH1cblx0XHRcdHJldHVybjtcblx0XHR9XG5cdFx0aWYgKGJvdW5kQ29udHJvbCkge1xuXHRcdFx0Ly8gQ2hlY2sgaWYgdGhlcmUncyBhIGRpZmZlcmVudCBiaW5kaW5nIHJlZ2lzdGVyZWQgZm9yIHRoZSBib3VuZCBjb250cm9sXG5cdFx0XHRiaW5kaW5nUmVnaXN0cmF0aW9uID0gdGhpcy5fYUJpbmRpbmdSZWdpc3RyYXRpb25zLmZpbmQoKHJlZykgPT4ge1xuXHRcdFx0XHRyZXR1cm4gcmVnLmJvdW5kQ29udHJvbCA9PT0gYm91bmRDb250cm9sO1xuXHRcdFx0fSk7XG5cdFx0XHRpZiAoYmluZGluZ1JlZ2lzdHJhdGlvbiAmJiBiaW5kaW5nUmVnaXN0cmF0aW9uLmJpbmRpbmcgIT09IGJpbmRpbmcpIHtcblx0XHRcdFx0Ly8gVGhlIGNvbnRyb2wgaGFkIGEgZGlmZmVyZW50IGJpbmRpbmcuIFRoaXMgY2FuIGhhcHBlbiBpbiBjYXNlIG9mIE1EQyBjaGFydHMgd2hvIHJlY3JlYXRlZCB0aGVpciBiaW5kaW5nIGFmdGVyIHNlYXJjaFxuXHRcdFx0XHQvLyBUaGUgcHJldmlvdXMgYmluZGluZyBpcyBkZXN0cm95ZWQsIHdlIGNhbiByZXBsYWNlIGl0IHdpdGggdGhlIG5ldyBhbmQgcmVzZXQgY291bnRlcnNcblx0XHRcdFx0YmluZGluZ1JlZ2lzdHJhdGlvbi5iaW5kaW5nID0gYmluZGluZztcblx0XHRcdFx0YmluZGluZ1JlZ2lzdHJhdGlvbi5yZXF1ZXN0ZWRDb3VudCA9IDA7XG5cdFx0XHRcdGJpbmRpbmdSZWdpc3RyYXRpb24ucmVjZWl2ZWRDb3VudCA9IDA7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmICghYmluZGluZ1JlZ2lzdHJhdGlvbikge1xuXHRcdFx0YmluZGluZ1JlZ2lzdHJhdGlvbiA9IHtcblx0XHRcdFx0YmluZGluZzogYmluZGluZyxcblx0XHRcdFx0Ym91bmRDb250cm9sOiBib3VuZENvbnRyb2wsXG5cdFx0XHRcdHJlcXVlc3RlZENvdW50OiAwLFxuXHRcdFx0XHRyZWNlaXZlZENvdW50OiAwXG5cdFx0XHR9O1xuXHRcdFx0dGhpcy5fYUJpbmRpbmdSZWdpc3RyYXRpb25zLnB1c2goYmluZGluZ1JlZ2lzdHJhdGlvbik7XG5cdFx0fVxuXHRcdGJpbmRpbmcuZGV0YWNoRXZlbnQoXCJkYXRhUmVxdWVzdGVkXCIsIHRoaXMub25EYXRhUmVxdWVzdGVkLCB0aGlzKTtcblx0XHRiaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcImRhdGFSZXF1ZXN0ZWRcIiwgeyB0cmlnZ2VyZWRCeVNlYXJjaDogZGF0YS50cmlnZ2VyZWRCeVNlYXJjaCB9LCB0aGlzLm9uRGF0YVJlcXVlc3RlZCwgdGhpcyk7XG5cdH1cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhIGJpbmRpbmcgZm9yIHdhdGNoaW5nIGl0cyBkYXRhIGV2ZW50cyAoZGF0YVJlcXVlc3RlZCBhbmQgZGF0YVJlY2VpdmVkKS5cblx0ICpcblx0ICogQHBhcmFtIGJpbmRpbmcgVGhlIGJpbmRpbmdcblx0ICovXG5cdHB1YmxpYyByZWdpc3RlckJpbmRpbmcoYmluZGluZzogQmluZGluZykge1xuXHRcdHRoaXMucmVnaXN0ZXIobnVsbCwgeyBiaW5kaW5nLCB0cmlnZ2VyZWRCeVNlYXJjaDogZmFsc2UgfSk7XG5cdH1cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhbiBNRENUYWJsZSBmb3Igd2F0Y2hpbmcgdGhlIGRhdGEgZXZlbnRzIG9uIGl0cyByb3cgYmluZGluZyAoZGF0YVJlcXVlc3RlZCBhbmQgZGF0YVJlY2VpdmVkKS5cblx0ICpcblx0ICogQHBhcmFtIHRhYmxlIFRoZSB0YWJsZVxuXHQgKiBAcGFyYW0gdHJpZ2dlcmVkQnlTZWFyY2ggVHJ1ZSBpZiB0aGlzIHJlZ2lzdHJhdGlvbiBpcyB0cmlnZ2VyZWQgYnkgYSBmaWx0ZXJCYXIgc2VhcmNoXG5cdCAqL1xuXHRwcm90ZWN0ZWQgcmVnaXN0ZXJUYWJsZSh0YWJsZTogVGFibGUsIHRyaWdnZXJlZEJ5U2VhcmNoID0gZmFsc2UpIHtcblx0XHRpZiAodGhpcy5fYU1EQ1RhYmxlcy5pbmRleE9mKHRhYmxlKSA8IDApIHtcblx0XHRcdHRoaXMuX2FNRENUYWJsZXMucHVzaCh0YWJsZSk7XG5cdFx0fVxuXHRcdGNvbnN0IG9Sb3dCaW5kaW5nID0gdGFibGUuZ2V0Um93QmluZGluZygpO1xuXHRcdGlmIChvUm93QmluZGluZykge1xuXHRcdFx0dGhpcy5yZWdpc3RlcihudWxsLCB7IHRhYmxlLCB0cmlnZ2VyZWRCeVNlYXJjaCB9KTtcblx0XHR9XG5cdFx0aWYgKHRoaXMuX2FPdGhlckV2ZW50U291cmNlcy5pbmRleE9mKHRhYmxlKSA9PT0gLTEpIHtcblx0XHRcdHRhYmxlLmF0dGFjaEV2ZW50KFwiYmluZGluZ1VwZGF0ZWRcIiwgeyB0YWJsZSwgdHJpZ2dlcmVkQnlTZWFyY2ggfSwgdGhpcy5yZWdpc3RlciwgdGhpcyk7XG5cdFx0XHR0aGlzLl9hT3RoZXJFdmVudFNvdXJjZXMucHVzaCh0YWJsZSk7XG5cdFx0fVxuXHR9XG5cdC8qKlxuXHQgKiBSZWdpc3RlcnMgYW4gTURDQ2hhcnQgZm9yIHdhdGNoaW5nIHRoZSBkYXRhIGV2ZW50cyBvbiBpdHMgaW5uZXIgZGF0YSBiaW5kaW5nIChkYXRhUmVxdWVzdGVkIGFuZCBkYXRhUmVjZWl2ZWQpLlxuXHQgKlxuXHQgKiBAcGFyYW0gY2hhcnQgVGhlIGNoYXJ0XG5cdCAqIEBwYXJhbSB0cmlnZ2VyZWRCeVNlYXJjaCBUcnVlIGlmIHRoaXMgcmVnaXN0cmF0aW9uIGlzIHRyaWdnZXJlZCBieSBhIGZpbHRlckJhciBzZWFyY2hcblx0ICovXG5cdHByb3RlY3RlZCByZWdpc3RlckNoYXJ0KGNoYXJ0OiBDaGFydCwgdHJpZ2dlcmVkQnlTZWFyY2ggPSBmYWxzZSkge1xuXHRcdGlmICh0aGlzLl9hTURDQ2hhcnRzLmluZGV4T2YoY2hhcnQpIDwgMCkge1xuXHRcdFx0dGhpcy5fYU1EQ0NoYXJ0cy5wdXNoKGNoYXJ0KTtcblx0XHR9XG5cdFx0Y29uc3Qgb0lubmVyQ2hhcnQgPSAoY2hhcnQgYXMgYW55KS5nZXRDb250cm9sRGVsZWdhdGUoKS5nZXRJbm5lckNoYXJ0KGNoYXJ0KTtcblx0XHRjb25zdCBiaW5kaW5nID0gb0lubmVyQ2hhcnQ/LmdldEJpbmRpbmcoXCJkYXRhXCIpO1xuXHRcdGlmIChiaW5kaW5nKSB7XG5cdFx0XHR0aGlzLnJlZ2lzdGVyKG51bGwsIHsgY2hhcnQsIHRyaWdnZXJlZEJ5U2VhcmNoIH0pO1xuXHRcdH1cblx0XHRpZiAodGhpcy5fYU90aGVyRXZlbnRTb3VyY2VzLmluZGV4T2YoY2hhcnQpID09PSAtMSkge1xuXHRcdFx0Y2hhcnQuYXR0YWNoRXZlbnQoXCJiaW5kaW5nVXBkYXRlZFwiLCB7IGNoYXJ0LCB0cmlnZ2VyZWRCeVNlYXJjaCB9LCB0aGlzLnJlZ2lzdGVyLCB0aGlzKTtcblx0XHRcdHRoaXMuX2FPdGhlckV2ZW50U291cmNlcy5wdXNoKGNoYXJ0KTtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhbiBNRENUYWJsZSBvciBNRENDaGFydCBmb3Igd2F0Y2hpbmcgdGhlIGRhdGEgZXZlbnRzIG9uIGl0cyBpbm5lciBkYXRhIGJpbmRpbmcgKGRhdGFSZXF1ZXN0ZWQgYW5kIGRhdGFSZWNlaXZlZCkuXG5cdCAqXG5cdCAqIEBwYXJhbSBlbGVtZW50ICBUaGUgdGFibGUgb3IgY2hhcnRcblx0ICovXG5cdHB1YmxpYyBhc3luYyByZWdpc3RlclRhYmxlT3JDaGFydChlbGVtZW50OiBUYWJsZSB8IENoYXJ0KTogUHJvbWlzZTx2b2lkPiB7XG5cdFx0aWYgKCFlbGVtZW50LmlzQShcInNhcC51aS5tZGMuVGFibGVcIikgJiYgIWVsZW1lbnQuaXNBKFwic2FwLnVpLm1kYy5DaGFydFwiKSkge1xuXHRcdFx0cmV0dXJuO1xuXHRcdH1cblx0XHR0cnkge1xuXHRcdFx0YXdhaXQgZWxlbWVudC5pbml0aWFsaXplZCgpOyAvLyBhY2Nlc3MgYmluZGluZyBvbmx5IGFmdGVyIHRhYmxlL2NoYXJ0IGlzIGJvdW5kXG5cdFx0XHRpZiAoZWxlbWVudC5pc0EoXCJzYXAudWkubWRjLlRhYmxlXCIpKSB7XG5cdFx0XHRcdHRoaXMucmVnaXN0ZXJUYWJsZShlbGVtZW50IGFzIFRhYmxlKTtcblx0XHRcdFx0Ly9JZiB0aGUgYXV0b0JpbmRPbkluaXQgaXMgZW5hYmxlZCwgdGhlIHRhYmxlIHdpbGwgYmUgcmVib3VuZFxuXHRcdFx0XHQvL1RoZW4gd2UgbmVlZCB0byB3YWl0IGZvciB0aGlzIHJlYmluZCB0byBvY2N1ciB0byBlbnN1cmUgdGhlIHBhZ2VSZWFkeSB3aWxsIGFsc28gd2FpdCBmb3IgdGhlIGRhdGEgdG8gYmUgcmVjZWl2ZWRcblx0XHRcdFx0aWYgKGVsZW1lbnQuZ2V0QXV0b0JpbmRPbkluaXQoKSAmJiBlbGVtZW50LmdldERvbVJlZigpKSB7XG5cdFx0XHRcdFx0YXdhaXQgVXRpbHMud2hlbkJvdW5kKGVsZW1lbnQgYXMgVGFibGUpO1xuXHRcdFx0XHR9XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLnJlZ2lzdGVyQ2hhcnQoZWxlbWVudCBhcyBDaGFydCk7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAob0Vycm9yOiBhbnkpIHtcblx0XHRcdExvZy5lcnJvcihcIlBhZ2VSZWFkeSAtIENhbm5vdCByZWdpc3RlciBhIHRhYmxlIG9yIGEgY2hhcnRcIiwgb0Vycm9yKTtcblx0XHR9XG5cdH1cblx0LyoqXG5cdCAqIFJlZ2lzdGVycyBhbiBNRENGaWx0ZXJCYXIgZm9yIHdhdGNoaW5nIGl0cyBzZWFyY2ggZXZlbnQuXG5cdCAqXG5cdCAqIEBwYXJhbSBmaWx0ZXJCYXIgVGhlIGZpbHRlciBiYXJcblx0ICovXG5cdHB1YmxpYyByZWdpc3RlckZpbHRlckJhcihmaWx0ZXJCYXI6IEZpbHRlckJhcikge1xuXHRcdGZpbHRlckJhci5hdHRhY2hFdmVudChcInNlYXJjaFwiLCB0aGlzLm9uU2VhcmNoLCB0aGlzKTtcblx0XHR0aGlzLl9hT3RoZXJFdmVudFNvdXJjZXMucHVzaChmaWx0ZXJCYXIpO1xuXHR9XG59XG5leHBvcnQgZGVmYXVsdCBEYXRhUXVlcnlXYXRjaGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBa2pCTyxnQkFBZ0JBLElBQUksRUFBRUMsT0FBTyxFQUFFO0lBQ3JDLElBQUk7TUFDSCxJQUFJQyxNQUFNLEdBQUdGLElBQUksRUFBRTtJQUNwQixDQUFDLENBQUMsT0FBTUcsQ0FBQyxFQUFFO01BQ1YsT0FBT0Ys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