/*!
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */

/*global sap*/
sap.ui.define(["sap/sac/df/firefly/ff2700.export"], function (oFF) {
  "use strict";

  var DataExport = oFF.ExportLib && new oFF.ExportLib.DataExport();
  oFF.NativeExportHandler = {
    exportCsv: function exportCsv(model) {
      DataExport.exportCsv(model.asStructure().convertToNative());
    },
    exportXlsx: function exportXlsx(model) {
      DataExport.exportXlsx(model.asStructure().convertToNative());
    },
    exportPdf: function exportPdf(model) {
      DataExport.exportPdf(model.asStructure().convertToNative());
    }
  };

  oFF.NativeExportHandlerFactory = function () {
    oFF.ExportHandlerFactory.call(this);
    this._ff_c = "NativeExportHandlerFactory";
  };

  oFF.NativeExportHandlerFactory.prototype = new oFF.ExportHandlerFactory();

  oFF.NativeExportHandlerFactory.staticSetup = function () {
    var factory = new oFF.NativeExportHandlerFactory();
    oFF.ExportHandlerFactory.registerFactory(factory);
  };

  oFF.NativeExportHandlerFactory.prototype.newExportHandler = function () {
    return oFF.NativeExportHandler;
  };

  oFF.ExportNativeModule = function () {
    oFF.DfModule.call(this);
    this._ff_c = "ExportNativeModule";
  };

  oFF.ExportNativeModule.prototype = new oFF.DfModule();
  oFF.ExportNativeModule.s_module = null;

  oFF.ExportNativeModule.getInstance = function () {
    if (oFF.ExportNativeModule.s_module === null) {
      if (oFF.ExportModule.getInstance() === null) {
        throw new Error("Initialization Exception");
      }

      oFF.ExportNativeModule.s_module = oFF.DfModule.startExt(new oFF.ExportNativeModule());
      oFF.NativeExportHandlerFactory.staticSetup();
      oFF.DfModule.stopExt(oFF.ExportNativeModule.s_module);
    }

    return oFF.ExportNativeModule.s_module;
  };

  oFF.ExportNativeModule.prototype.getName = function () {
    return "ff2710.export.native";
  };

  oFF.ExportNativeModule.getInstance();
  return sap.firefly;
});