/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["@sap-ux/jest-mock-ui5/dist/generic", "sap/fe/core/controllerextensions/EditFlow", "sap/fe/core/controllerextensions/InternalEditFlow", "sap/fe/core/controllerextensions/InternalRouting", "sap/fe/core/controllerextensions/Share", "sap/fe/core/controllerextensions/SideEffects", "sap/ui/base/Event", "sap/ui/core/mvc/Controller", "sap/ui/core/mvc/View", "sap/ui/model/CompositeBinding", "sap/ui/model/odata/v4/Context", "sap/ui/model/odata/v4/ODataContextBinding", "sap/ui/model/odata/v4/ODataListBinding", "sap/ui/model/odata/v4/ODataMetaModel", "sap/ui/model/odata/v4/ODataModel", "sap/ui/model/odata/v4/ODataPropertyBinding"], function (generic, EditFlow, InternalEditFlow, InternalRouting, Share, SideEffects, Event, Controller, View, CompositeBinding, Context, ODataContextBinding, ODataListBinding, ODataMetaModel, ODataModel, ODataPropertyBinding) {
  "use strict";

  var _exports = {};
  var mock = generic.mock;
  /**
   * Factory function to create a new MockContext.
   *
   * @param oContextData A map of the different properties of the context. The value for the key '$path' will be returned by the 'getPath' method
   * @param oBinding The binding of the context
   * @param isInactive Is the context iniactive or not
   * @returns A new MockContext
   */
  function createMockContext(oContextData, oBinding, isInactive) {
    // Ugly workaround to get a proper mock pbject, as Context isn't properly exported from UI5
    var mocked = mock(Object.getPrototypeOf(Context.createNewContext(null, null, "/e")));
    mocked._isKeptAlive = false;
    mocked._contextData = oContextData || {};
    mocked._oBinding = oBinding;
    mocked._isInactive = !!isInactive;

    // Default behavior
    mocked.mock.isA.mockImplementation(function (sClassName) {
      return sClassName === "sap.ui.model.odata.v4.Context";
    });
    mocked.mock.getProperty.mockImplementation(function (key) {
      return mocked._contextData[key];
    });
    mocked.mock.requestProperty.mockImplementation(function (keyOrKeys) {
      if (Array.isArray(keyOrKeys)) {
        return Promise.resolve(keyOrKeys.map(function (key) {
          return mocked._contextData[key];
        }));
      }
      return Promise.resolve(mocked._contextData[keyOrKeys]);
    });
    mocked.mock.requestObject.mockImplementation(function (key) {
      return Promise.resolve(mocked._contextData[key]);
    });
    mocked.mock.setProperty.mockImplementation(function (key, value) {
      mocked._contextData[key] = value;
      return mocked._contextData[key];
    });
    mocked.mock.getObject.mockImplementation(function (path) {
      var result = path ? mocked._contextData[path] : mocked._contextData;
      if (!result && path && path.indexOf("/") > -1) {
        var parts = path.split("/");
        result = parts.reduce(function (sum, part) {
          sum = part ? sum[part] : sum;
          return sum;
        }, mocked._contextData);
      }
      return result;
    });
    mocked.mock.getPath.mockImplementation(function () {
      return mocked._contextData["$path"];
    });
    mocked.mock.getBinding.mockImplementation(function () {
      return mocked._oBinding;
    });
    mocked.mock.getModel.mockImplementation(function () {
      var _mocked$_oBinding;
      return (_mocked$_oBinding = mocked._oBinding) === null || _mocked$_oBinding === void 0 ? void 0 : _mocked$_oBinding.getModel();
    });
    mocked.mock.setKeepAlive.mockImplementation(function (bool, _fnOnBeforeDestroy, _bRequestMessages) {
      mocked._isKeptAlive = bool;
    });
    mocked.mock.isKeepAlive.mockImplementation(function () {
      return mocked._isKeptAlive;
    });
    mocked.mock.isInactive.mockImplementation(function () {
      return mocked._isInactive;
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockContext instead.
   */
  _exports.createMockContext = createMockContext;
  var MockContext = createMockContext;

  /**
   * Utility type to mock a sap.ui.base.Event
   */
  _exports.MockContext = MockContext;
  /**
   * Factory function to create a new MockEvent.
   *
   * @param params The parameters of the event
   * @returns A new MockEvent
   */
  function createMockEvent(params) {
    var mocked = mock(Event);
    mocked._params = params || {};

    // Default behavior
    mocked.mock.getParameter.mockImplementation(function (name) {
      return mocked._params[name];
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockEvent instead.
   */
  _exports.createMockEvent = createMockEvent;
  var MockEvent = createMockEvent;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataListBinding
   */
  _exports.MockEvent = MockEvent;
  /**
   * Factory function to create a new MockListBinding.
   *
   * @param aContextData An array of objects holding the different properties of the contexts referenced by the ListBinding
   * @param oMockModel The model of the ListBinding
   * @returns A new MockListBinding
   */
  function createMockListBinding(aContextData, oMockModel) {
    var mocked = mock(ODataListBinding);
    aContextData = aContextData || [];
    mocked._aMockContexts = aContextData.map(function (contextData) {
      return createMockContext(contextData, mocked);
    });
    mocked._mockModel = oMockModel;

    // Utility API
    mocked.setModel = function (model) {
      mocked._mockModel = model;
    };

    // Default behavior
    mocked.mock.isA.mockImplementation(function (sClassName) {
      return sClassName === "sap.ui.model.odata.v4.ODataListBinding";
    });
    mocked.mock.requestContexts.mockImplementation(function () {
      return Promise.resolve(mocked._aMockContexts);
    });
    mocked.mock.getCurrentContexts.mockImplementation(function () {
      return mocked._aMockContexts;
    });
    mocked.mock.getAllCurrentContexts.mockImplementation(function () {
      return mocked._aMockContexts;
    });
    mocked.mock.getModel.mockImplementation(function () {
      return mocked._mockModel;
    });
    mocked.mock.getUpdateGroupId.mockReturnValue("auto");
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockListBinding instead.
   */
  _exports.createMockListBinding = createMockListBinding;
  var MockListBinding = createMockListBinding;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataPropertyBinding
   */
  _exports.MockListBinding = MockListBinding;
  /**
   * Factory function to create a new MockPropertyBinding.
   *
   * @param value The value returnd by the PropertyBinding
   * @param path The path of the PropertyBinding
   * @param oMockModel The model of the PropertyBinding
   * @returns A new MockPropertyBinding
   */
  function createMockPropertyBinding(value, path, oMockModel) {
    var mocked = mock(ODataPropertyBinding);
    mocked._mockModel = oMockModel;
    mocked._value = value;
    mocked._path = path;

    // Default behavior
    mocked.mock.isA.mockImplementation(function (sClassName) {
      return sClassName === "sap.ui.model.odata.v4.ODataPropertyBinding";
    });
    mocked.mock.getModel.mockImplementation(function () {
      return mocked._mockModel;
    });
    mocked.mock.getValue.mockImplementation(function () {
      return mocked._value;
    });
    mocked.mock.getPath.mockImplementation(function () {
      return mocked._path;
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockPropertyBinding instead.
   */
  _exports.createMockPropertyBinding = createMockPropertyBinding;
  var MockPropertyBinding = createMockPropertyBinding;

  /**
   * Utility type to mock a sap.ui.model.CompositeBinding
   */
  _exports.MockPropertyBinding = MockPropertyBinding;
  /**
   * Factory function to create a new MockCompositeBinding.
   *
   * @param aBindings The bindings of the CompositeBinding
   * @returns A new MockCompositeBinding
   */
  function createMockCompositeBinding(aBindings) {
    var mocked = mock(CompositeBinding);
    mocked._aBindings = aBindings;

    // Default behavior
    mocked.mock.isA.mockImplementation(function (sClassName) {
      return sClassName === "sap.ui.model.CompositeBinding";
    });
    mocked.mock.getBindings.mockImplementation(function () {
      return mocked._aBindings;
    });
    mocked.mock.getValue.mockImplementation(function () {
      return mocked._aBindings.map(function (binding) {
        return binding.getValue();
      });
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockCompositeBinding instead.
   */
  _exports.createMockCompositeBinding = createMockCompositeBinding;
  var MockCompositeBinding = createMockCompositeBinding;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataContextBinding
   */
  _exports.MockCompositeBinding = MockCompositeBinding;
  /**
   * Factory function to create a new MockContextBinding.
   *
   * @param oContext The context of the ContextBinding
   * @param oMockModel The model of the ContextBinding
   * @returns A new MockContextBinding
   */
  function createMockContextBinding(oContext, oMockModel) {
    var mocked = mock(ODataContextBinding);
    mocked.mockModel = oMockModel;
    mocked.oMockContext = createMockContext(oContext || {}, mocked);

    // Utility API
    mocked.getInternalMockContext = function () {
      return mocked.oMockContext;
    };
    mocked.setModel = function (oModel) {
      mocked.mockModel = oModel;
    };

    // Default behavior
    mocked.mock.isA.mockImplementation(function (sClassName) {
      return sClassName === "sap.ui.model.odata.v4.ODataContextBinding";
    });
    mocked.mock.getBoundContext.mockImplementation(function () {
      return mocked.oMockContext;
    });
    mocked.mock.getModel.mockImplementation(function () {
      return mocked.mockModel;
    });
    mocked.mock.execute.mockResolvedValue(true);
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockContextBinding instead.
   */
  _exports.createMockContextBinding = createMockContextBinding;
  var MockContextBinding = createMockContextBinding;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataMetaModel
   */
  _exports.MockContextBinding = MockContextBinding;
  /**
   * Factory function to create a new MockMetaModel.
   *
   * @param oMetaData A map of the different metadata properties of the MetaModel (path -> value).
   * @returns A new MockMetaModel
   */
  function createMockMetaModel(oMetaData) {
    var mocked = mock(ODataMetaModel);
    mocked.oMetaContext = createMockContext(oMetaData || {});

    // Default behavior
    mocked.mock.getMetaContext.mockImplementation(function (sPath) {
      return createMockContext({
        $path: sPath
      });
    });
    mocked.mock.getObject.mockImplementation(function (sPath) {
      return mocked.oMetaContext.getProperty(sPath);
    });
    mocked.mock.createBindingContext.mockImplementation(function (sPath) {
      return createMockContext({
        $path: sPath
      });
    });
    mocked.mock.getMetaPath.mockImplementation(function (sPath) {
      var metamodel = new ODataMetaModel();
      return sPath ? metamodel.getMetaPath(sPath) : sPath;
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockMetaModel instead.
   */
  _exports.createMockMetaModel = createMockMetaModel;
  var MockMetaModel = createMockMetaModel;

  /**
   * Utility type to mock a sap.ui.model.odata.v4.ODataModel
   */
  _exports.MockMetaModel = MockMetaModel;
  /**
   * Factory function to create a new MockModel.
   *
   * @param oMockListBinding A list binding that will be returned when calling bindList.
   * @param oMockContextBinding A context binding that will be returned when calling bindContext.
   * @returns A new MockModel
   */
  function createMockModel(oMockListBinding, oMockContextBinding) {
    var mocked = mock(ODataModel);
    mocked.mockListBinding = oMockListBinding;
    mocked.mockContextBinding = oMockContextBinding;
    if (oMockListBinding) {
      oMockListBinding.setModel(mocked);
    }
    if (oMockContextBinding) {
      oMockContextBinding.setModel(mocked);
    }

    // Utility API
    mocked.setMetaModel = function (oMetaModel) {
      mocked.oMetaModel = oMetaModel;
    };

    // Default behavior
    mocked.mock.bindList.mockImplementation(function () {
      return mocked.mockListBinding;
    });
    mocked.mock.bindContext.mockImplementation(function () {
      return mocked.mockContextBinding;
    });
    mocked.mock.getMetaModel.mockImplementation(function () {
      return mocked.oMetaModel;
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockModel instead.
   */
  _exports.createMockModel = createMockModel;
  var MockModel = createMockModel;
  /**
   * Factory function to create a new MockModel used with a listBinding.
   *
   * @param oMockListBinding A list binding that will be returned when calling bindList.
   * @returns A new MockModel
   */
  _exports.MockModel = MockModel;
  function createMockModelFromListBinding(oMockListBinding) {
    return createMockModel(oMockListBinding);
  }
  /**
   *  Factory function to create a new MockModel used with a contextBinding.
   *
   * @param oMockContextBinding A context binding that will be returned when calling bindContext.
   * @returns A new MockModel
   */
  _exports.createMockModelFromListBinding = createMockModelFromListBinding;
  function createMockModelFromContextBinding(oMockContextBinding) {
    return createMockModel(undefined, oMockContextBinding);
  }

  /**
   * Utility type to mock a sap.ui.core.mvc.View
   */
  _exports.createMockModelFromContextBinding = createMockModelFromContextBinding;
  /**
   * Factory function to create a new MockView.
   *
   * @returns A new MockView
   */
  function createMockView() {
    var mocked = mock(View);

    // Default behavior
    mocked.mock.isA.mockImplementation(function (sClassName) {
      return sClassName === "sap.ui.core.mvc.View";
    });
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function createMockView instead.
   */
  _exports.createMockView = createMockView;
  var MockView = createMockView;

  /**
   * Utility type to mock a sap.fe.core.PageController
   */
  _exports.MockView = MockView;
  /**
   * Factory function to create a new MockController.
   *
   * @returns A new MockController
   */
  function createMockController() {
    var mocked = mock(Controller);
    mocked._routing = mock(InternalRouting);
    mocked._editFlow = mock(InternalEditFlow);
    mocked._sideEffects = mock(SideEffects);
    mocked.editFlow = mock(EditFlow);
    mocked.share = mock(Share);

    // Default Behavior
    mocked.mock.getView.mockReturnValue(createMockView());
    mocked.mock.isA.mockReturnValue(false);
    return mocked;
  }
  /**
   * For compatibility reasons, we keep a new operator. Use the factory function mockController instead.
   */
  _exports.createMockController = createMockController;
  var MockController = createMockController;
  _exports.MockController = MockController;
  /**
   * Generate model, view and controller mocks that refer to each other.
   *
   * @param existing Optional existing mocked instances that should be used
   * @returns Mocked model, view and controller instances
   */
  function mockMVC(existing) {
    var model = (existing === null || existing === void 0 ? void 0 : existing.model) || createMockModel();
    var view = (existing === null || existing === void 0 ? void 0 : existing.view) || createMockView();
    var controller = (existing === null || existing === void 0 ? void 0 : existing.controller) || createMockController();
    view.mock.getController.mockReturnValue(controller);
    view.mock.getModel.mockReturnValue(model);
    controller.mock.getView.mockReturnValue(view);
    return {
      model: model,
      view: view,
      controller: controller
    };
  }
  _exports.mockMVC = mockMVC;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJjcmVhdGVNb2NrQ29udGV4dCIsIm9Db250ZXh0RGF0YSIsIm9CaW5kaW5nIiwiaXNJbmFjdGl2ZSIsIm1vY2tlZCIsIm1vY2siLCJPYmplY3QiLCJnZXRQcm90b3R5cGVPZiIsIkNvbnRleHQiLCJjcmVhdGVOZXdDb250ZXh0IiwiX2lzS2VwdEFsaXZlIiwiX2NvbnRleHREYXRhIiwiX29CaW5kaW5nIiwiX2lzSW5hY3RpdmUiLCJpc0EiLCJtb2NrSW1wbGVtZW50YXRpb24iLCJzQ2xhc3NOYW1lIiwiZ2V0UHJvcGVydHkiLCJrZXkiLCJyZXF1ZXN0UHJvcGVydHkiLCJrZXlPcktleXMiLCJBcnJheSIsImlzQXJyYXkiLCJQcm9taXNlIiwicmVzb2x2ZSIsIm1hcCIsInJlcXVlc3RPYmplY3QiLCJzZXRQcm9wZXJ0eSIsInZhbHVlIiwiZ2V0T2JqZWN0IiwicGF0aCIsInJlc3VsdCIsImluZGV4T2YiLCJwYXJ0cyIsInNwbGl0IiwicmVkdWNlIiwic3VtIiwicGFydCIsImdldFBhdGgiLCJnZXRCaW5kaW5nIiwiZ2V0TW9kZWwiLCJzZXRLZWVwQWxpdmUiLCJib29sIiwiX2ZuT25CZWZvcmVEZXN0cm95IiwiX2JSZXF1ZXN0TWVzc2FnZXMiLCJpc0tlZXBBbGl2ZSIsIk1vY2tDb250ZXh0IiwiY3JlYXRlTW9ja0V2ZW50IiwicGFyYW1zIiwiRXZlbnQiLCJfcGFyYW1zIiwiZ2V0UGFyYW1ldGVyIiwibmFtZSIsIk1vY2tFdmVudCIsImNyZWF0ZU1vY2tMaXN0QmluZGluZyIsImFDb250ZXh0RGF0YSIsIm9Nb2NrTW9kZWwiLCJPRGF0YUxpc3RCaW5kaW5nIiwiX2FNb2NrQ29udGV4dHMiLCJjb250ZXh0RGF0YSIsIl9tb2NrTW9kZWwiLCJzZXRNb2RlbCIsIm1vZGVsIiwicmVxdWVzdENvbnRleHRzIiwiZ2V0Q3VycmVudENvbnRleHRzIiwiZ2V0QWxsQ3VycmVudENvbnRleHRzIiwiZ2V0VXBkYXRlR3JvdXBJZCIsIm1vY2tSZXR1cm5WYWx1ZSIsIk1vY2tMaXN0QmluZGluZyIsImNyZWF0ZU1vY2tQcm9wZXJ0eUJpbmRpbmciLCJPRGF0YVByb3BlcnR5QmluZGluZyIsIl92YWx1ZSIsIl9wYXRoIiwiZ2V0VmFsdWUiLCJNb2NrUHJvcGVydHlCaW5kaW5nIiwiY3JlYXRlTW9ja0NvbXBvc2l0ZUJpbmRpbmciLCJhQmluZGluZ3MiLCJDb21wb3NpdGVCaW5kaW5nIiwiX2FCaW5kaW5ncyIsImdldEJpbmRpbmdzIiwiYmluZGluZyIsIk1vY2tDb21wb3NpdGVCaW5kaW5nIiwiY3JlYXRlTW9ja0NvbnRleHRCaW5kaW5nIiwib0NvbnRleHQiLCJPRGF0YUNvbnRleHRCaW5kaW5nIiwibW9ja01vZGVsIiwib01vY2tDb250ZXh0IiwiZ2V0SW50ZXJuYWxNb2NrQ29udGV4dCIsIm9Nb2RlbCIsImdldEJvdW5kQ29udGV4dCIsImV4ZWN1dGUiLCJtb2NrUmVzb2x2ZWRWYWx1ZSIsIk1vY2tDb250ZXh0QmluZGluZyIsImNyZWF0ZU1vY2tNZXRhTW9kZWwiLCJvTWV0YURhdGEiLCJPRGF0YU1ldGFNb2RlbCIsIm9NZXRhQ29udGV4dCIsImdldE1ldGFDb250ZXh0Iiwic1BhdGgiLCIkcGF0aCIsImNyZWF0ZUJpbmRpbmdDb250ZXh0IiwiZ2V0TWV0YVBhdGgiLCJtZXRhbW9kZWwiLCJNb2NrTWV0YU1vZGVsIiwiY3JlYXRlTW9ja01vZGVsIiwib01vY2tMaXN0QmluZGluZyIsIm9Nb2NrQ29udGV4dEJpbmRpbmciLCJPRGF0YU1vZGVsIiwibW9ja0xpc3RCaW5kaW5nIiwibW9ja0NvbnRleHRCaW5kaW5nIiwic2V0TWV0YU1vZGVsIiwib01ldGFNb2RlbCIsImJpbmRMaXN0IiwiYmluZENvbnRleHQiLCJnZXRNZXRhTW9kZWwiLCJNb2NrTW9kZWwiLCJjcmVhdGVNb2NrTW9kZWxGcm9tTGlzdEJpbmRpbmciLCJjcmVhdGVNb2NrTW9kZWxGcm9tQ29udGV4dEJpbmRpbmciLCJ1bmRlZmluZWQiLCJjcmVhdGVNb2NrVmlldyIsIlZpZXciLCJNb2NrVmlldyIsImNyZWF0ZU1vY2tDb250cm9sbGVyIiwiQ29udHJvbGxlciIsIl9yb3V0aW5nIiwiSW50ZXJuYWxSb3V0aW5nIiwiX2VkaXRGbG93IiwiSW50ZXJuYWxFZGl0RmxvdyIsIl9zaWRlRWZmZWN0cyIsIlNpZGVFZmZlY3RzIiwiZWRpdEZsb3ciLCJFZGl0RmxvdyIsInNoYXJlIiwiU2hhcmUiLCJnZXRWaWV3IiwiTW9ja0NvbnRyb2xsZXIiLCJtb2NrTVZDIiwiZXhpc3RpbmciLCJ2aWV3IiwiY29udHJvbGxlciIsImdldENvbnRyb2xsZXIiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlVJNU1vY2tIZWxwZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgeyBXaXRoTW9jayB9IGZyb20gXCJAc2FwLXV4L2plc3QtbW9jay11aTUvZGlzdC9nZW5lcmljXCI7XG5pbXBvcnQgeyBtb2NrIH0gZnJvbSBcIkBzYXAtdXgvamVzdC1tb2NrLXVpNS9kaXN0L2dlbmVyaWNcIjtcbmltcG9ydCBFZGl0RmxvdyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvRWRpdEZsb3dcIjtcbmltcG9ydCBJbnRlcm5hbEVkaXRGbG93IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbEVkaXRGbG93XCI7XG5pbXBvcnQgSW50ZXJuYWxSb3V0aW5nIGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9JbnRlcm5hbFJvdXRpbmdcIjtcbmltcG9ydCBTaGFyZSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2hhcmVcIjtcbmltcG9ydCBTaWRlRWZmZWN0cyBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvU2lkZUVmZmVjdHNcIjtcbmltcG9ydCBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBDb250cm9sbGVyIGZyb20gXCJzYXAvdWkvY29yZS9tdmMvQ29udHJvbGxlclwiO1xuaW1wb3J0IFZpZXcgZnJvbSBcInNhcC91aS9jb3JlL212Yy9WaWV3XCI7XG5pbXBvcnQgQ29tcG9zaXRlQmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL0NvbXBvc2l0ZUJpbmRpbmdcIjtcbmltcG9ydCBDb250ZXh0IGZyb20gXCJzYXAvdWkvbW9kZWwvb2RhdGEvdjQvQ29udGV4dFwiO1xuaW1wb3J0IE9EYXRhQ29udGV4dEJpbmRpbmcgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YUNvbnRleHRCaW5kaW5nXCI7XG5pbXBvcnQgT0RhdGFMaXN0QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTGlzdEJpbmRpbmdcIjtcbmltcG9ydCBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgT0RhdGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTW9kZWxcIjtcbmltcG9ydCBPRGF0YVByb3BlcnR5QmluZGluZyBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhUHJvcGVydHlCaW5kaW5nXCI7XG5cbi8qKlxuICogVXRpbGl0eSB0eXBlIHRvIG1vY2sgYSBzYXAudWkubW9kZWwub2RhdGEudjQuQ29udGV4dFxuICovXG5leHBvcnQgdHlwZSBNb2NrQ29udGV4dCA9IFdpdGhNb2NrPENvbnRleHQ+ICYge1xuXHRfaXNLZXB0QWxpdmU6IGJvb2xlYW47XG5cdF9jb250ZXh0RGF0YTogYW55O1xuXHRfb0JpbmRpbmc6IGFueTtcblx0X2lzSW5hY3RpdmU6IGJvb2xlYW47XG59O1xuLyoqXG4gKiBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5ldyBNb2NrQ29udGV4dC5cbiAqXG4gKiBAcGFyYW0gb0NvbnRleHREYXRhIEEgbWFwIG9mIHRoZSBkaWZmZXJlbnQgcHJvcGVydGllcyBvZiB0aGUgY29udGV4dC4gVGhlIHZhbHVlIGZvciB0aGUga2V5ICckcGF0aCcgd2lsbCBiZSByZXR1cm5lZCBieSB0aGUgJ2dldFBhdGgnIG1ldGhvZFxuICogQHBhcmFtIG9CaW5kaW5nIFRoZSBiaW5kaW5nIG9mIHRoZSBjb250ZXh0XG4gKiBAcGFyYW0gaXNJbmFjdGl2ZSBJcyB0aGUgY29udGV4dCBpbmlhY3RpdmUgb3Igbm90XG4gKiBAcmV0dXJucyBBIG5ldyBNb2NrQ29udGV4dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW9ja0NvbnRleHQob0NvbnRleHREYXRhPzogYW55LCBvQmluZGluZz86IGFueSwgaXNJbmFjdGl2ZT86IGJvb2xlYW4pOiBNb2NrQ29udGV4dCB7XG5cdC8vIFVnbHkgd29ya2Fyb3VuZCB0byBnZXQgYSBwcm9wZXIgbW9jayBwYmplY3QsIGFzIENvbnRleHQgaXNuJ3QgcHJvcGVybHkgZXhwb3J0ZWQgZnJvbSBVSTVcblx0Y29uc3QgbW9ja2VkID0gbW9jayhPYmplY3QuZ2V0UHJvdG90eXBlT2YoKENvbnRleHQgYXMgYW55KS5jcmVhdGVOZXdDb250ZXh0KG51bGwsIG51bGwsIFwiL2VcIikpKSBhcyBNb2NrQ29udGV4dDtcblx0bW9ja2VkLl9pc0tlcHRBbGl2ZSA9IGZhbHNlO1xuXHRtb2NrZWQuX2NvbnRleHREYXRhID0gb0NvbnRleHREYXRhIHx8IHt9O1xuXHRtb2NrZWQuX29CaW5kaW5nID0gb0JpbmRpbmc7XG5cdG1vY2tlZC5faXNJbmFjdGl2ZSA9ICEhaXNJbmFjdGl2ZTtcblxuXHQvLyBEZWZhdWx0IGJlaGF2aW9yXG5cdG1vY2tlZC5tb2NrLmlzQS5tb2NrSW1wbGVtZW50YXRpb24oKHNDbGFzc05hbWU6IHN0cmluZykgPT4ge1xuXHRcdHJldHVybiBzQ2xhc3NOYW1lID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS52NC5Db250ZXh0XCI7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5nZXRQcm9wZXJ0eS5tb2NrSW1wbGVtZW50YXRpb24oKGtleTogc3RyaW5nKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5fY29udGV4dERhdGFba2V5XTtcblx0fSk7XG5cdG1vY2tlZC5tb2NrLnJlcXVlc3RQcm9wZXJ0eS5tb2NrSW1wbGVtZW50YXRpb24oKGtleU9yS2V5czogc3RyaW5nIHwgc3RyaW5nW10pID0+IHtcblx0XHRpZiAoQXJyYXkuaXNBcnJheShrZXlPcktleXMpKSB7XG5cdFx0XHRyZXR1cm4gUHJvbWlzZS5yZXNvbHZlKGtleU9yS2V5cy5tYXAoKGtleSkgPT4gbW9ja2VkLl9jb250ZXh0RGF0YVtrZXldKSk7XG5cdFx0fVxuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobW9ja2VkLl9jb250ZXh0RGF0YVtrZXlPcktleXNdKTtcblx0fSk7XG5cdG1vY2tlZC5tb2NrLnJlcXVlc3RPYmplY3QubW9ja0ltcGxlbWVudGF0aW9uKChrZXk6IHN0cmluZykgPT4ge1xuXHRcdHJldHVybiBQcm9taXNlLnJlc29sdmUobW9ja2VkLl9jb250ZXh0RGF0YVtrZXldKTtcblx0fSk7XG5cdG1vY2tlZC5tb2NrLnNldFByb3BlcnR5Lm1vY2tJbXBsZW1lbnRhdGlvbigoa2V5OiBzdHJpbmcsIHZhbHVlOiBhbnkpID0+IHtcblx0XHRtb2NrZWQuX2NvbnRleHREYXRhW2tleV0gPSB2YWx1ZTtcblx0XHRyZXR1cm4gbW9ja2VkLl9jb250ZXh0RGF0YVtrZXldO1xuXHR9KTtcblxuXHRtb2NrZWQubW9jay5nZXRPYmplY3QubW9ja0ltcGxlbWVudGF0aW9uKChwYXRoOiBzdHJpbmcpID0+IHtcblx0XHRsZXQgcmVzdWx0ID0gcGF0aCA/IG1vY2tlZC5fY29udGV4dERhdGFbcGF0aF0gOiBtb2NrZWQuX2NvbnRleHREYXRhO1xuXG5cdFx0aWYgKCFyZXN1bHQgJiYgcGF0aCAmJiBwYXRoLmluZGV4T2YoXCIvXCIpID4gLTEpIHtcblx0XHRcdGNvbnN0IHBhcnRzID0gcGF0aC5zcGxpdChcIi9cIik7XG5cdFx0XHRyZXN1bHQgPSBwYXJ0cy5yZWR1Y2UoKHN1bSwgcGFydDogYW55KSA9PiB7XG5cdFx0XHRcdHN1bSA9IHBhcnQgPyBzdW1bcGFydF0gOiBzdW07XG5cdFx0XHRcdHJldHVybiBzdW07XG5cdFx0XHR9LCBtb2NrZWQuX2NvbnRleHREYXRhKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcmVzdWx0O1xuXHR9KTtcblxuXHRtb2NrZWQubW9jay5nZXRQYXRoLm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiBtb2NrZWQuX2NvbnRleHREYXRhW1wiJHBhdGhcIl0pO1xuXHRtb2NrZWQubW9jay5nZXRCaW5kaW5nLm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiBtb2NrZWQuX29CaW5kaW5nKTtcblx0bW9ja2VkLm1vY2suZ2V0TW9kZWwubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IG1vY2tlZC5fb0JpbmRpbmc/LmdldE1vZGVsKCkpO1xuXHRtb2NrZWQubW9jay5zZXRLZWVwQWxpdmUubW9ja0ltcGxlbWVudGF0aW9uKChib29sOiBib29sZWFuLCBfZm5PbkJlZm9yZURlc3Ryb3k/OiBhbnksIF9iUmVxdWVzdE1lc3NhZ2VzPzogYm9vbGVhbikgPT4ge1xuXHRcdG1vY2tlZC5faXNLZXB0QWxpdmUgPSBib29sO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suaXNLZWVwQWxpdmUubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IG1vY2tlZC5faXNLZXB0QWxpdmUpO1xuXHRtb2NrZWQubW9jay5pc0luYWN0aXZlLm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiBtb2NrZWQuX2lzSW5hY3RpdmUpO1xuXG5cdHJldHVybiBtb2NrZWQ7XG59XG4vKipcbiAqIEZvciBjb21wYXRpYmlsaXR5IHJlYXNvbnMsIHdlIGtlZXAgYSBuZXcgb3BlcmF0b3IuIFVzZSB0aGUgZmFjdG9yeSBmdW5jdGlvbiBjcmVhdGVNb2NrQ29udGV4dCBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgTW9ja0NvbnRleHQ6IG5ldyAob1ZhbHVlcz86IGFueSwgb0JpbmRpbmc/OiBhbnksIGlzSW5hY3RpdmU/OiBib29sZWFuKSA9PiBNb2NrQ29udGV4dCA9IGNyZWF0ZU1vY2tDb250ZXh0IGFzIGFueTtcblxuLyoqXG4gKiBVdGlsaXR5IHR5cGUgdG8gbW9jayBhIHNhcC51aS5iYXNlLkV2ZW50XG4gKi9cbmV4cG9ydCB0eXBlIE1vY2tFdmVudCA9IFdpdGhNb2NrPEV2ZW50PiAmIHtcblx0X3BhcmFtczogeyBba2V5OiBzdHJpbmddOiBhbnkgfTtcbn07XG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IE1vY2tFdmVudC5cbiAqXG4gKiBAcGFyYW0gcGFyYW1zIFRoZSBwYXJhbWV0ZXJzIG9mIHRoZSBldmVudFxuICogQHJldHVybnMgQSBuZXcgTW9ja0V2ZW50XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb2NrRXZlbnQocGFyYW1zPzogeyBba2V5OiBzdHJpbmddOiBhbnkgfSk6IE1vY2tFdmVudCB7XG5cdGNvbnN0IG1vY2tlZCA9IG1vY2soRXZlbnQpIGFzIE1vY2tFdmVudDtcblx0bW9ja2VkLl9wYXJhbXMgPSBwYXJhbXMgfHwge307XG5cblx0Ly8gRGVmYXVsdCBiZWhhdmlvclxuXHRtb2NrZWQubW9jay5nZXRQYXJhbWV0ZXIubW9ja0ltcGxlbWVudGF0aW9uKChuYW1lKSA9PiBtb2NrZWQuX3BhcmFtc1tuYW1lXSk7XG5cblx0cmV0dXJuIG1vY2tlZDtcbn1cbi8qKlxuICogRm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucywgd2Uga2VlcCBhIG5ldyBvcGVyYXRvci4gVXNlIHRoZSBmYWN0b3J5IGZ1bmN0aW9uIGNyZWF0ZU1vY2tFdmVudCBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgTW9ja0V2ZW50OiBuZXcgKHBhcmFtcz86IHsgW2tleTogc3RyaW5nXTogYW55IH0pID0+IE1vY2tFdmVudCA9IGNyZWF0ZU1vY2tFdmVudCBhcyBhbnk7XG5cbi8qKlxuICogVXRpbGl0eSB0eXBlIHRvIG1vY2sgYSBzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1xuICovXG5leHBvcnQgdHlwZSBNb2NrTGlzdEJpbmRpbmcgPSBXaXRoTW9jazxPRGF0YUxpc3RCaW5kaW5nPiAmIHtcblx0X2FNb2NrQ29udGV4dHM6IE1vY2tDb250ZXh0W107XG5cdF9tb2NrTW9kZWw/OiBNb2NrTW9kZWw7XG5cblx0LyoqXG5cdCAqIFV0aWxpdHkgbWV0aG9kIHRvIHNldCB0aGUgbW9kZWwgb2YgdGhlIExpc3RCaW5kaW5nXG5cdCAqL1xuXHRzZXRNb2RlbDogKG1vZGVsOiBNb2NrTW9kZWwpID0+IHZvaWQ7XG59O1xuLyoqXG4gKiBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5ldyBNb2NrTGlzdEJpbmRpbmcuXG4gKlxuICogQHBhcmFtIGFDb250ZXh0RGF0YSBBbiBhcnJheSBvZiBvYmplY3RzIGhvbGRpbmcgdGhlIGRpZmZlcmVudCBwcm9wZXJ0aWVzIG9mIHRoZSBjb250ZXh0cyByZWZlcmVuY2VkIGJ5IHRoZSBMaXN0QmluZGluZ1xuICogQHBhcmFtIG9Nb2NrTW9kZWwgVGhlIG1vZGVsIG9mIHRoZSBMaXN0QmluZGluZ1xuICogQHJldHVybnMgQSBuZXcgTW9ja0xpc3RCaW5kaW5nXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb2NrTGlzdEJpbmRpbmcoYUNvbnRleHREYXRhPzogYW55W10sIG9Nb2NrTW9kZWw/OiBNb2NrTW9kZWwpOiBNb2NrTGlzdEJpbmRpbmcge1xuXHRjb25zdCBtb2NrZWQgPSBtb2NrKE9EYXRhTGlzdEJpbmRpbmcpIGFzIE1vY2tMaXN0QmluZGluZztcblx0YUNvbnRleHREYXRhID0gYUNvbnRleHREYXRhIHx8IFtdO1xuXHRtb2NrZWQuX2FNb2NrQ29udGV4dHMgPSBhQ29udGV4dERhdGEubWFwKChjb250ZXh0RGF0YSkgPT4ge1xuXHRcdHJldHVybiBjcmVhdGVNb2NrQ29udGV4dChjb250ZXh0RGF0YSwgbW9ja2VkKTtcblx0fSk7XG5cdG1vY2tlZC5fbW9ja01vZGVsID0gb01vY2tNb2RlbDtcblxuXHQvLyBVdGlsaXR5IEFQSVxuXHRtb2NrZWQuc2V0TW9kZWwgPSAobW9kZWw6IE1vY2tNb2RlbCkgPT4ge1xuXHRcdG1vY2tlZC5fbW9ja01vZGVsID0gbW9kZWw7XG5cdH07XG5cblx0Ly8gRGVmYXVsdCBiZWhhdmlvclxuXHRtb2NrZWQubW9jay5pc0EubW9ja0ltcGxlbWVudGF0aW9uKChzQ2xhc3NOYW1lOiBzdHJpbmcpID0+IHtcblx0XHRyZXR1cm4gc0NsYXNzTmFtZSA9PT0gXCJzYXAudWkubW9kZWwub2RhdGEudjQuT0RhdGFMaXN0QmluZGluZ1wiO1xuXHR9KTtcblx0bW9ja2VkLm1vY2sucmVxdWVzdENvbnRleHRzLm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiB7XG5cdFx0cmV0dXJuIFByb21pc2UucmVzb2x2ZShtb2NrZWQuX2FNb2NrQ29udGV4dHMpO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suZ2V0Q3VycmVudENvbnRleHRzLm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5fYU1vY2tDb250ZXh0cztcblx0fSk7XG5cdG1vY2tlZC5tb2NrLmdldEFsbEN1cnJlbnRDb250ZXh0cy5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge1xuXHRcdHJldHVybiBtb2NrZWQuX2FNb2NrQ29udGV4dHM7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5nZXRNb2RlbC5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge1xuXHRcdHJldHVybiBtb2NrZWQuX21vY2tNb2RlbDtcblx0fSk7XG5cdG1vY2tlZC5tb2NrLmdldFVwZGF0ZUdyb3VwSWQubW9ja1JldHVyblZhbHVlKFwiYXV0b1wiKTtcblxuXHRyZXR1cm4gbW9ja2VkO1xufVxuLyoqXG4gKiBGb3IgY29tcGF0aWJpbGl0eSByZWFzb25zLCB3ZSBrZWVwIGEgbmV3IG9wZXJhdG9yLiBVc2UgdGhlIGZhY3RvcnkgZnVuY3Rpb24gY3JlYXRlTW9ja0xpc3RCaW5kaW5nIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBNb2NrTGlzdEJpbmRpbmc6IG5ldyAoYUNvbnRleHRzPzogYW55W10sIG1vY2tNb2RlbD86IE1vY2tNb2RlbCkgPT4gTW9ja0xpc3RCaW5kaW5nID0gY3JlYXRlTW9ja0xpc3RCaW5kaW5nIGFzIGFueTtcblxuLyoqXG4gKiBVdGlsaXR5IHR5cGUgdG8gbW9jayBhIHNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YVByb3BlcnR5QmluZGluZ1xuICovXG5leHBvcnQgdHlwZSBNb2NrUHJvcGVydHlCaW5kaW5nID0gV2l0aE1vY2s8T0RhdGFQcm9wZXJ0eUJpbmRpbmc+ICYge1xuXHRfdmFsdWU/OiBhbnk7XG5cdF9wYXRoPzogc3RyaW5nO1xuXHRfbW9ja01vZGVsPzogTW9ja01vZGVsO1xufTtcbi8qKlxuICogRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgTW9ja1Byb3BlcnR5QmluZGluZy5cbiAqXG4gKiBAcGFyYW0gdmFsdWUgVGhlIHZhbHVlIHJldHVybmQgYnkgdGhlIFByb3BlcnR5QmluZGluZ1xuICogQHBhcmFtIHBhdGggVGhlIHBhdGggb2YgdGhlIFByb3BlcnR5QmluZGluZ1xuICogQHBhcmFtIG9Nb2NrTW9kZWwgVGhlIG1vZGVsIG9mIHRoZSBQcm9wZXJ0eUJpbmRpbmdcbiAqIEByZXR1cm5zIEEgbmV3IE1vY2tQcm9wZXJ0eUJpbmRpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vY2tQcm9wZXJ0eUJpbmRpbmcodmFsdWU6IGFueSwgcGF0aD86IHN0cmluZywgb01vY2tNb2RlbD86IE1vY2tNb2RlbCk6IE1vY2tQcm9wZXJ0eUJpbmRpbmcge1xuXHRjb25zdCBtb2NrZWQgPSBtb2NrKE9EYXRhUHJvcGVydHlCaW5kaW5nKSBhcyBNb2NrUHJvcGVydHlCaW5kaW5nO1xuXHRtb2NrZWQuX21vY2tNb2RlbCA9IG9Nb2NrTW9kZWw7XG5cdG1vY2tlZC5fdmFsdWUgPSB2YWx1ZTtcblx0bW9ja2VkLl9wYXRoID0gcGF0aDtcblxuXHQvLyBEZWZhdWx0IGJlaGF2aW9yXG5cdG1vY2tlZC5tb2NrLmlzQS5tb2NrSW1wbGVtZW50YXRpb24oKHNDbGFzc05hbWU6IHN0cmluZykgPT4ge1xuXHRcdHJldHVybiBzQ2xhc3NOYW1lID09PSBcInNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YVByb3BlcnR5QmluZGluZ1wiO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suZ2V0TW9kZWwubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IHtcblx0XHRyZXR1cm4gbW9ja2VkLl9tb2NrTW9kZWw7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5nZXRWYWx1ZS5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge1xuXHRcdHJldHVybiBtb2NrZWQuX3ZhbHVlO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suZ2V0UGF0aC5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge1xuXHRcdHJldHVybiBtb2NrZWQuX3BhdGg7XG5cdH0pO1xuXG5cdHJldHVybiBtb2NrZWQ7XG59XG4vKipcbiAqIEZvciBjb21wYXRpYmlsaXR5IHJlYXNvbnMsIHdlIGtlZXAgYSBuZXcgb3BlcmF0b3IuIFVzZSB0aGUgZmFjdG9yeSBmdW5jdGlvbiBjcmVhdGVNb2NrUHJvcGVydHlCaW5kaW5nIGluc3RlYWQuXG4gKi9cbmV4cG9ydCBjb25zdCBNb2NrUHJvcGVydHlCaW5kaW5nOiBuZXcgKHZhbHVlOiBhbnksIG9Nb2NrTW9kZWw/OiBNb2NrTW9kZWwpID0+IE1vY2tQcm9wZXJ0eUJpbmRpbmcgPSBjcmVhdGVNb2NrUHJvcGVydHlCaW5kaW5nIGFzIGFueTtcblxuLyoqXG4gKiBVdGlsaXR5IHR5cGUgdG8gbW9jayBhIHNhcC51aS5tb2RlbC5Db21wb3NpdGVCaW5kaW5nXG4gKi9cbmV4cG9ydCB0eXBlIE1vY2tDb21wb3NpdGVCaW5kaW5nID0gV2l0aE1vY2s8Q29tcG9zaXRlQmluZGluZz4gJiB7XG5cdF9hQmluZGluZ3M6IE1vY2tQcm9wZXJ0eUJpbmRpbmdbXTtcbn07XG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IE1vY2tDb21wb3NpdGVCaW5kaW5nLlxuICpcbiAqIEBwYXJhbSBhQmluZGluZ3MgVGhlIGJpbmRpbmdzIG9mIHRoZSBDb21wb3NpdGVCaW5kaW5nXG4gKiBAcmV0dXJucyBBIG5ldyBNb2NrQ29tcG9zaXRlQmluZGluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW9ja0NvbXBvc2l0ZUJpbmRpbmcoYUJpbmRpbmdzOiBNb2NrUHJvcGVydHlCaW5kaW5nW10pOiBNb2NrQ29tcG9zaXRlQmluZGluZyB7XG5cdGNvbnN0IG1vY2tlZCA9IG1vY2soQ29tcG9zaXRlQmluZGluZykgYXMgTW9ja0NvbXBvc2l0ZUJpbmRpbmc7XG5cdG1vY2tlZC5fYUJpbmRpbmdzID0gYUJpbmRpbmdzO1xuXG5cdC8vIERlZmF1bHQgYmVoYXZpb3Jcblx0bW9ja2VkLm1vY2suaXNBLm1vY2tJbXBsZW1lbnRhdGlvbigoc0NsYXNzTmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0cmV0dXJuIHNDbGFzc05hbWUgPT09IFwic2FwLnVpLm1vZGVsLkNvbXBvc2l0ZUJpbmRpbmdcIjtcblx0fSk7XG5cdG1vY2tlZC5tb2NrLmdldEJpbmRpbmdzLm1vY2tJbXBsZW1lbnRhdGlvbigoKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5fYUJpbmRpbmdzO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suZ2V0VmFsdWUubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IHtcblx0XHRyZXR1cm4gbW9ja2VkLl9hQmluZGluZ3MubWFwKChiaW5kaW5nKSA9PiBiaW5kaW5nLmdldFZhbHVlKCkpO1xuXHR9KTtcblxuXHRyZXR1cm4gbW9ja2VkO1xufVxuLyoqXG4gKiBGb3IgY29tcGF0aWJpbGl0eSByZWFzb25zLCB3ZSBrZWVwIGEgbmV3IG9wZXJhdG9yLiBVc2UgdGhlIGZhY3RvcnkgZnVuY3Rpb24gY3JlYXRlTW9ja0NvbXBvc2l0ZUJpbmRpbmcgaW5zdGVhZC5cbiAqL1xuZXhwb3J0IGNvbnN0IE1vY2tDb21wb3NpdGVCaW5kaW5nOiBuZXcgKGFCaW5kaW5nczogTW9ja1Byb3BlcnR5QmluZGluZ1tdKSA9PiBNb2NrQ29tcG9zaXRlQmluZGluZyA9IGNyZWF0ZU1vY2tDb21wb3NpdGVCaW5kaW5nIGFzIGFueTtcblxuLyoqXG4gKiBVdGlsaXR5IHR5cGUgdG8gbW9jayBhIHNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YUNvbnRleHRCaW5kaW5nXG4gKi9cbmV4cG9ydCB0eXBlIE1vY2tDb250ZXh0QmluZGluZyA9IFdpdGhNb2NrPE9EYXRhQ29udGV4dEJpbmRpbmc+ICYge1xuXHRvTW9ja0NvbnRleHQ6IE1vY2tDb250ZXh0O1xuXHRpc0tlcHRBbGl2ZTogYm9vbGVhbjtcblx0bW9ja01vZGVsPzogTW9ja01vZGVsO1xuXG5cdC8qKlxuXHQgKiBVdGlsaXR5IG1ldGhvZCB0byBhY2Nlc3MgdGhlIGludGVybmFsIE1vY2tDb250ZXh0IG9mIHRoZSBDb250ZXh0QmluZGluZ1xuXHQgKi9cblx0Z2V0SW50ZXJuYWxNb2NrQ29udGV4dDogKCkgPT4gTW9ja0NvbnRleHQ7XG5cdC8qKlxuXHQgKiBVdGlsaXR5IG1ldGhvZCB0byBzZXQgdGhlIG1vZGVsIG9mIHRoZSBDb250ZXh0QmluZGluZ1xuXHQgKi9cblx0c2V0TW9kZWw6IChvTW9kZWw6IE1vY2tNb2RlbCkgPT4gdm9pZDtcbn07XG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IE1vY2tDb250ZXh0QmluZGluZy5cbiAqXG4gKiBAcGFyYW0gb0NvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIENvbnRleHRCaW5kaW5nXG4gKiBAcGFyYW0gb01vY2tNb2RlbCBUaGUgbW9kZWwgb2YgdGhlIENvbnRleHRCaW5kaW5nXG4gKiBAcmV0dXJucyBBIG5ldyBNb2NrQ29udGV4dEJpbmRpbmdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vY2tDb250ZXh0QmluZGluZyhvQ29udGV4dD86IGFueSwgb01vY2tNb2RlbD86IE1vY2tNb2RlbCk6IE1vY2tDb250ZXh0QmluZGluZyB7XG5cdGNvbnN0IG1vY2tlZCA9IG1vY2soT0RhdGFDb250ZXh0QmluZGluZykgYXMgTW9ja0NvbnRleHRCaW5kaW5nO1xuXHRtb2NrZWQubW9ja01vZGVsID0gb01vY2tNb2RlbDtcblx0bW9ja2VkLm9Nb2NrQ29udGV4dCA9IGNyZWF0ZU1vY2tDb250ZXh0KG9Db250ZXh0IHx8IHt9LCBtb2NrZWQpO1xuXG5cdC8vIFV0aWxpdHkgQVBJXG5cdG1vY2tlZC5nZXRJbnRlcm5hbE1vY2tDb250ZXh0ID0gKCkgPT4ge1xuXHRcdHJldHVybiBtb2NrZWQub01vY2tDb250ZXh0O1xuXHR9O1xuXHRtb2NrZWQuc2V0TW9kZWwgPSAob01vZGVsOiBNb2NrTW9kZWwpID0+IHtcblx0XHRtb2NrZWQubW9ja01vZGVsID0gb01vZGVsO1xuXHR9O1xuXG5cdC8vIERlZmF1bHQgYmVoYXZpb3Jcblx0bW9ja2VkLm1vY2suaXNBLm1vY2tJbXBsZW1lbnRhdGlvbigoc0NsYXNzTmFtZTogc3RyaW5nKSA9PiB7XG5cdFx0cmV0dXJuIHNDbGFzc05hbWUgPT09IFwic2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhQ29udGV4dEJpbmRpbmdcIjtcblx0fSk7XG5cdG1vY2tlZC5tb2NrLmdldEJvdW5kQ29udGV4dC5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge1xuXHRcdHJldHVybiBtb2NrZWQub01vY2tDb250ZXh0O1xuXHR9KTtcblx0bW9ja2VkLm1vY2suZ2V0TW9kZWwubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IHtcblx0XHRyZXR1cm4gbW9ja2VkLm1vY2tNb2RlbDtcblx0fSk7XG5cdG1vY2tlZC5tb2NrLmV4ZWN1dGUubW9ja1Jlc29sdmVkVmFsdWUodHJ1ZSk7XG5cblx0cmV0dXJuIG1vY2tlZDtcbn1cbi8qKlxuICogRm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucywgd2Uga2VlcCBhIG5ldyBvcGVyYXRvci4gVXNlIHRoZSBmYWN0b3J5IGZ1bmN0aW9uIGNyZWF0ZU1vY2tDb250ZXh0QmluZGluZyBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgTW9ja0NvbnRleHRCaW5kaW5nOiBuZXcgKG9Db250ZXh0PzogYW55LCBvTW9ja01vZGVsPzogTW9ja01vZGVsKSA9PiBNb2NrQ29udGV4dEJpbmRpbmcgPSBjcmVhdGVNb2NrQ29udGV4dEJpbmRpbmcgYXMgYW55O1xuXG4vKipcbiAqIFV0aWxpdHkgdHlwZSB0byBtb2NrIGEgc2FwLnVpLm1vZGVsLm9kYXRhLnY0Lk9EYXRhTWV0YU1vZGVsXG4gKi9cbmV4cG9ydCB0eXBlIE1vY2tNZXRhTW9kZWwgPSBXaXRoTW9jazxPRGF0YU1ldGFNb2RlbD4gJiB7XG5cdG9NZXRhQ29udGV4dDogTW9ja0NvbnRleHQ7XG59O1xuLyoqXG4gKiBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5ldyBNb2NrTWV0YU1vZGVsLlxuICpcbiAqIEBwYXJhbSBvTWV0YURhdGEgQSBtYXAgb2YgdGhlIGRpZmZlcmVudCBtZXRhZGF0YSBwcm9wZXJ0aWVzIG9mIHRoZSBNZXRhTW9kZWwgKHBhdGggLT4gdmFsdWUpLlxuICogQHJldHVybnMgQSBuZXcgTW9ja01ldGFNb2RlbFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlTW9ja01ldGFNb2RlbChvTWV0YURhdGE/OiBhbnkpOiBNb2NrTWV0YU1vZGVsIHtcblx0Y29uc3QgbW9ja2VkID0gbW9jayhPRGF0YU1ldGFNb2RlbCkgYXMgTW9ja01ldGFNb2RlbDtcblx0bW9ja2VkLm9NZXRhQ29udGV4dCA9IGNyZWF0ZU1vY2tDb250ZXh0KG9NZXRhRGF0YSB8fCB7fSk7XG5cblx0Ly8gRGVmYXVsdCBiZWhhdmlvclxuXHRtb2NrZWQubW9jay5nZXRNZXRhQ29udGV4dC5tb2NrSW1wbGVtZW50YXRpb24oKHNQYXRoOiBzdHJpbmcpID0+IHtcblx0XHRyZXR1cm4gY3JlYXRlTW9ja0NvbnRleHQoeyAkcGF0aDogc1BhdGggfSk7XG5cdH0pO1xuXHRtb2NrZWQubW9jay5nZXRPYmplY3QubW9ja0ltcGxlbWVudGF0aW9uKChzUGF0aDogc3RyaW5nKSA9PiB7XG5cdFx0cmV0dXJuIG1vY2tlZC5vTWV0YUNvbnRleHQuZ2V0UHJvcGVydHkoc1BhdGgpO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suY3JlYXRlQmluZGluZ0NvbnRleHQubW9ja0ltcGxlbWVudGF0aW9uKChzUGF0aDogc3RyaW5nKSA9PiB7XG5cdFx0cmV0dXJuIGNyZWF0ZU1vY2tDb250ZXh0KHsgJHBhdGg6IHNQYXRoIH0pO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suZ2V0TWV0YVBhdGgubW9ja0ltcGxlbWVudGF0aW9uKChzUGF0aDogc3RyaW5nKSA9PiB7XG5cdFx0Y29uc3QgbWV0YW1vZGVsID0gbmV3IE9EYXRhTWV0YU1vZGVsKCk7XG5cdFx0cmV0dXJuIHNQYXRoID8gbWV0YW1vZGVsLmdldE1ldGFQYXRoKHNQYXRoKSA6IHNQYXRoO1xuXHR9KTtcblxuXHRyZXR1cm4gbW9ja2VkO1xufVxuLyoqXG4gKiBGb3IgY29tcGF0aWJpbGl0eSByZWFzb25zLCB3ZSBrZWVwIGEgbmV3IG9wZXJhdG9yLiBVc2UgdGhlIGZhY3RvcnkgZnVuY3Rpb24gY3JlYXRlTW9ja01ldGFNb2RlbCBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgTW9ja01ldGFNb2RlbDogbmV3IChvTWV0YURhdGE/OiBhbnkpID0+IE1vY2tNZXRhTW9kZWwgPSBjcmVhdGVNb2NrTWV0YU1vZGVsIGFzIGFueTtcblxuLyoqXG4gKiBVdGlsaXR5IHR5cGUgdG8gbW9jayBhIHNhcC51aS5tb2RlbC5vZGF0YS52NC5PRGF0YU1vZGVsXG4gKi9cbmV4cG9ydCB0eXBlIE1vY2tNb2RlbCA9IFdpdGhNb2NrPE9EYXRhTW9kZWw+ICYge1xuXHRvTWV0YU1vZGVsPzogTW9ja01ldGFNb2RlbDtcblx0bW9ja0xpc3RCaW5kaW5nPzogTW9ja0xpc3RCaW5kaW5nO1xuXHRtb2NrQ29udGV4dEJpbmRpbmc/OiBNb2NrQ29udGV4dEJpbmRpbmc7XG5cblx0LyoqXG5cdCAqIFV0aWxpdHkgbWV0aG9kIHRvIHNldCB0aGUgbWV0YW1vZGVsIG9mIHRoZSBNb2NrTW9kZWxcblx0ICovXG5cdHNldE1ldGFNb2RlbDogKG9NZXRhTW9kZWw6IE1vY2tNZXRhTW9kZWwpID0+IHZvaWQ7XG59O1xuLyoqXG4gKiBGYWN0b3J5IGZ1bmN0aW9uIHRvIGNyZWF0ZSBhIG5ldyBNb2NrTW9kZWwuXG4gKlxuICogQHBhcmFtIG9Nb2NrTGlzdEJpbmRpbmcgQSBsaXN0IGJpbmRpbmcgdGhhdCB3aWxsIGJlIHJldHVybmVkIHdoZW4gY2FsbGluZyBiaW5kTGlzdC5cbiAqIEBwYXJhbSBvTW9ja0NvbnRleHRCaW5kaW5nIEEgY29udGV4dCBiaW5kaW5nIHRoYXQgd2lsbCBiZSByZXR1cm5lZCB3aGVuIGNhbGxpbmcgYmluZENvbnRleHQuXG4gKiBAcmV0dXJucyBBIG5ldyBNb2NrTW9kZWxcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vY2tNb2RlbChvTW9ja0xpc3RCaW5kaW5nPzogTW9ja0xpc3RCaW5kaW5nLCBvTW9ja0NvbnRleHRCaW5kaW5nPzogTW9ja0NvbnRleHRCaW5kaW5nKTogTW9ja01vZGVsIHtcblx0Y29uc3QgbW9ja2VkID0gbW9jayhPRGF0YU1vZGVsKSBhcyBNb2NrTW9kZWw7XG5cdG1vY2tlZC5tb2NrTGlzdEJpbmRpbmcgPSBvTW9ja0xpc3RCaW5kaW5nO1xuXHRtb2NrZWQubW9ja0NvbnRleHRCaW5kaW5nID0gb01vY2tDb250ZXh0QmluZGluZztcblx0aWYgKG9Nb2NrTGlzdEJpbmRpbmcpIHtcblx0XHRvTW9ja0xpc3RCaW5kaW5nLnNldE1vZGVsKG1vY2tlZCk7XG5cdH1cblx0aWYgKG9Nb2NrQ29udGV4dEJpbmRpbmcpIHtcblx0XHRvTW9ja0NvbnRleHRCaW5kaW5nLnNldE1vZGVsKG1vY2tlZCk7XG5cdH1cblxuXHQvLyBVdGlsaXR5IEFQSVxuXHRtb2NrZWQuc2V0TWV0YU1vZGVsID0gKG9NZXRhTW9kZWw6IE1vY2tNZXRhTW9kZWwpID0+IHtcblx0XHRtb2NrZWQub01ldGFNb2RlbCA9IG9NZXRhTW9kZWw7XG5cdH07XG5cblx0Ly8gRGVmYXVsdCBiZWhhdmlvclxuXHRtb2NrZWQubW9jay5iaW5kTGlzdC5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge1xuXHRcdHJldHVybiBtb2NrZWQubW9ja0xpc3RCaW5kaW5nO1xuXHR9KTtcblx0bW9ja2VkLm1vY2suYmluZENvbnRleHQubW9ja0ltcGxlbWVudGF0aW9uKCgpID0+IHtcblx0XHRyZXR1cm4gbW9ja2VkLm1vY2tDb250ZXh0QmluZGluZztcblx0fSk7XG5cdG1vY2tlZC5tb2NrLmdldE1ldGFNb2RlbC5tb2NrSW1wbGVtZW50YXRpb24oKCkgPT4ge1xuXHRcdHJldHVybiBtb2NrZWQub01ldGFNb2RlbDtcblx0fSk7XG5cblx0cmV0dXJuIG1vY2tlZDtcbn1cbi8qKlxuICogRm9yIGNvbXBhdGliaWxpdHkgcmVhc29ucywgd2Uga2VlcCBhIG5ldyBvcGVyYXRvci4gVXNlIHRoZSBmYWN0b3J5IGZ1bmN0aW9uIGNyZWF0ZU1vY2tNb2RlbCBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgTW9ja01vZGVsOiBuZXcgKG9Nb2NrTGlzdEJpbmRpbmc/OiBNb2NrTGlzdEJpbmRpbmcsIG9Nb2NrQ29udGV4dEJpbmRpbmc/OiBNb2NrQ29udGV4dEJpbmRpbmcpID0+IE1vY2tNb2RlbCA9XG5cdGNyZWF0ZU1vY2tNb2RlbCBhcyBhbnk7XG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IE1vY2tNb2RlbCB1c2VkIHdpdGggYSBsaXN0QmluZGluZy5cbiAqXG4gKiBAcGFyYW0gb01vY2tMaXN0QmluZGluZyBBIGxpc3QgYmluZGluZyB0aGF0IHdpbGwgYmUgcmV0dXJuZWQgd2hlbiBjYWxsaW5nIGJpbmRMaXN0LlxuICogQHJldHVybnMgQSBuZXcgTW9ja01vZGVsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb2NrTW9kZWxGcm9tTGlzdEJpbmRpbmcob01vY2tMaXN0QmluZGluZzogTW9ja0xpc3RCaW5kaW5nKTogTW9ja01vZGVsIHtcblx0cmV0dXJuIGNyZWF0ZU1vY2tNb2RlbChvTW9ja0xpc3RCaW5kaW5nKTtcbn1cbi8qKlxuICogIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IE1vY2tNb2RlbCB1c2VkIHdpdGggYSBjb250ZXh0QmluZGluZy5cbiAqXG4gKiBAcGFyYW0gb01vY2tDb250ZXh0QmluZGluZyBBIGNvbnRleHQgYmluZGluZyB0aGF0IHdpbGwgYmUgcmV0dXJuZWQgd2hlbiBjYWxsaW5nIGJpbmRDb250ZXh0LlxuICogQHJldHVybnMgQSBuZXcgTW9ja01vZGVsXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb2NrTW9kZWxGcm9tQ29udGV4dEJpbmRpbmcob01vY2tDb250ZXh0QmluZGluZzogTW9ja0NvbnRleHRCaW5kaW5nKTogTW9ja01vZGVsIHtcblx0cmV0dXJuIGNyZWF0ZU1vY2tNb2RlbCh1bmRlZmluZWQsIG9Nb2NrQ29udGV4dEJpbmRpbmcpO1xufVxuXG4vKipcbiAqIFV0aWxpdHkgdHlwZSB0byBtb2NrIGEgc2FwLnVpLmNvcmUubXZjLlZpZXdcbiAqL1xuZXhwb3J0IHR5cGUgTW9ja1ZpZXcgPSBXaXRoTW9jazxWaWV3Pjtcbi8qKlxuICogRmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgYSBuZXcgTW9ja1ZpZXcuXG4gKlxuICogQHJldHVybnMgQSBuZXcgTW9ja1ZpZXdcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZU1vY2tWaWV3KCk6IE1vY2tWaWV3IHtcblx0Y29uc3QgbW9ja2VkID0gbW9jayhWaWV3KTtcblxuXHQvLyBEZWZhdWx0IGJlaGF2aW9yXG5cdG1vY2tlZC5tb2NrLmlzQS5tb2NrSW1wbGVtZW50YXRpb24oKHNDbGFzc05hbWU6IHN0cmluZykgPT4ge1xuXHRcdHJldHVybiBzQ2xhc3NOYW1lID09PSBcInNhcC51aS5jb3JlLm12Yy5WaWV3XCI7XG5cdH0pO1xuXG5cdHJldHVybiBtb2NrZWQ7XG59XG4vKipcbiAqIEZvciBjb21wYXRpYmlsaXR5IHJlYXNvbnMsIHdlIGtlZXAgYSBuZXcgb3BlcmF0b3IuIFVzZSB0aGUgZmFjdG9yeSBmdW5jdGlvbiBjcmVhdGVNb2NrVmlldyBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgTW9ja1ZpZXc6IG5ldyAoKSA9PiBNb2NrVmlldyA9IGNyZWF0ZU1vY2tWaWV3IGFzIGFueTtcblxuLyoqXG4gKiBVdGlsaXR5IHR5cGUgdG8gbW9jayBhIHNhcC5mZS5jb3JlLlBhZ2VDb250cm9sbGVyXG4gKi9cbmV4cG9ydCB0eXBlIE1vY2tDb250cm9sbGVyID0gV2l0aE1vY2s8Q29udHJvbGxlcj4gJiB7XG5cdF9yb3V0aW5nOiBXaXRoTW9jazxJbnRlcm5hbFJvdXRpbmc+O1xuXHRfZWRpdEZsb3c6IFdpdGhNb2NrPEludGVybmFsRWRpdEZsb3c+O1xuXHRfc2lkZUVmZmVjdHM6IFdpdGhNb2NrPFNpZGVFZmZlY3RzPjtcblx0ZWRpdEZsb3c6IFdpdGhNb2NrPEVkaXRGbG93Pjtcblx0c2hhcmU6IFdpdGhNb2NrPFNoYXJlPjtcbn07XG4vKipcbiAqIEZhY3RvcnkgZnVuY3Rpb24gdG8gY3JlYXRlIGEgbmV3IE1vY2tDb250cm9sbGVyLlxuICpcbiAqIEByZXR1cm5zIEEgbmV3IE1vY2tDb250cm9sbGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVNb2NrQ29udHJvbGxlcigpOiBNb2NrQ29udHJvbGxlciB7XG5cdGNvbnN0IG1vY2tlZCA9IG1vY2soQ29udHJvbGxlcikgYXMgTW9ja0NvbnRyb2xsZXI7XG5cdG1vY2tlZC5fcm91dGluZyA9IG1vY2soSW50ZXJuYWxSb3V0aW5nKTtcblx0bW9ja2VkLl9lZGl0RmxvdyA9IG1vY2soSW50ZXJuYWxFZGl0Rmxvdyk7XG5cdG1vY2tlZC5fc2lkZUVmZmVjdHMgPSBtb2NrKFNpZGVFZmZlY3RzKTtcblx0bW9ja2VkLmVkaXRGbG93ID0gbW9jayhFZGl0Rmxvdyk7XG5cdG1vY2tlZC5zaGFyZSA9IG1vY2soU2hhcmUpO1xuXG5cdC8vIERlZmF1bHQgQmVoYXZpb3Jcblx0bW9ja2VkLm1vY2suZ2V0Vmlldy5tb2NrUmV0dXJuVmFsdWUoY3JlYXRlTW9ja1ZpZXcoKSk7XG5cdG1vY2tlZC5tb2NrLmlzQS5tb2NrUmV0dXJuVmFsdWUoZmFsc2UpO1xuXG5cdHJldHVybiBtb2NrZWQ7XG59XG4vKipcbiAqIEZvciBjb21wYXRpYmlsaXR5IHJlYXNvbnMsIHdlIGtlZXAgYSBuZXcgb3BlcmF0b3IuIFVzZSB0aGUgZmFjdG9yeSBmdW5jdGlvbiBtb2NrQ29udHJvbGxlciBpbnN0ZWFkLlxuICovXG5leHBvcnQgY29uc3QgTW9ja0NvbnRyb2xsZXI6IG5ldyAoKSA9PiBNb2NrQ29udHJvbGxlciA9IGNyZWF0ZU1vY2tDb250cm9sbGVyIGFzIGFueTtcblxuZXhwb3J0IGludGVyZmFjZSBNVkNNb2NrIHtcblx0bW9kZWw6IE1vY2tNb2RlbDtcblx0dmlldzogTW9ja1ZpZXc7XG5cdGNvbnRyb2xsZXI6IE1vY2tDb250cm9sbGVyO1xufVxuLyoqXG4gKiBHZW5lcmF0ZSBtb2RlbCwgdmlldyBhbmQgY29udHJvbGxlciBtb2NrcyB0aGF0IHJlZmVyIHRvIGVhY2ggb3RoZXIuXG4gKlxuICogQHBhcmFtIGV4aXN0aW5nIE9wdGlvbmFsIGV4aXN0aW5nIG1vY2tlZCBpbnN0YW5jZXMgdGhhdCBzaG91bGQgYmUgdXNlZFxuICogQHJldHVybnMgTW9ja2VkIG1vZGVsLCB2aWV3IGFuZCBjb250cm9sbGVyIGluc3RhbmNlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gbW9ja01WQyhleGlzdGluZz86IFBhcnRpYWw8TVZDTW9jaz4pOiBNVkNNb2NrIHtcblx0Y29uc3QgbW9kZWwgPSBleGlzdGluZz8ubW9kZWwgfHwgY3JlYXRlTW9ja01vZGVsKCk7XG5cdGNvbnN0IHZpZXcgPSBleGlzdGluZz8udmlldyB8fCBjcmVhdGVNb2NrVmlldygpO1xuXHRjb25zdCBjb250cm9sbGVyID0gZXhpc3Rpbmc/LmNvbnRyb2xsZXIgfHwgY3JlYXRlTW9ja0NvbnRyb2xsZXIoKTtcblxuXHR2aWV3Lm1vY2suZ2V0Q29udHJvbGxlci5tb2NrUmV0dXJuVmFsdWUoY29udHJvbGxlcik7XG5cdHZpZXcubW9jay5nZXRNb2RlbC5tb2NrUmV0dXJuVmFsdWUobW9kZWwpO1xuXHRjb250cm9sbGVyLm1vY2suZ2V0Vmlldy5tb2NrUmV0dXJuVmFsdWUodmlldyk7XG5cblx0cmV0dXJuIHsgbW9kZWwsIHZpZXcsIGNvbnRyb2xsZXIgfTtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7O0VBMkJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7RUFDTyxTQUFTQSxpQkFBaUIsQ0FBQ0MsWUFBa0IsRUFBRUMsUUFBYyxFQUFFQyxVQUFvQixFQUFlO0lBQ3hHO0lBQ0EsSUFBTUMsTUFBTSxHQUFHQyxJQUFJLENBQUNDLE1BQU0sQ0FBQ0MsY0FBYyxDQUFFQyxPQUFPLENBQVNDLGdCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBZ0I7SUFDOUdMLE1BQU0sQ0FBQ00sWUFBWSxHQUFHLEtBQUs7SUFDM0JOLE1BQU0sQ0FBQ08sWUFBWSxHQUFHVixZQUFZLElBQUksQ0FBQyxDQUFDO0lBQ3hDRyxNQUFNLENBQUNRLFNBQVMsR0FBR1YsUUFBUTtJQUMzQkUsTUFBTSxDQUFDUyxXQUFXLEdBQUcsQ0FBQyxDQUFDVixVQUFVOztJQUVqQztJQUNBQyxNQUFNLENBQUNDLElBQUksQ0FBQ1MsR0FBRyxDQUFDQyxrQkFBa0IsQ0FBQyxVQUFDQyxVQUFrQixFQUFLO01BQzFELE9BQU9BLFVBQVUsS0FBSywrQkFBK0I7SUFDdEQsQ0FBQyxDQUFDO0lBQ0ZaLE1BQU0sQ0FBQ0MsSUFBSSxDQUFDWSxXQUFXLENBQUNGLGtCQUFrQixDQUFDLFVBQUNHLEdBQVcsRUFBSztNQUMzRCxPQUFPZCxNQUFNLENBQUNPLFlBQVksQ0FBQ08sR0FBRyxDQUFDO0lBQ2hDLENBQUMsQ0FBQztJQUNGZCxNQUFNLENBQUNDLElBQUksQ0FBQ2MsZUFBZSxDQUFDSixrQkFBa0IsQ0FBQyxVQUFDSyxTQUE0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