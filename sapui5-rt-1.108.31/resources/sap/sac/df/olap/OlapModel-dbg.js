/*
 * SAPUI5
    (c) Copyright 2009-2021 SAP SE. All rights reserved
  
 */
/*global sap, Promise */
sap.ui.define(
  "sap/sac/df/olap/OlapModel",
  [
    "sap/base/Log",
    "sap/sac/df/utils/Utilities",
    "sap/ui/model/Model",
    "sap/ui/model/Context",
    "sap/sac/df/types/ValueType",
    "sap/sac/df/olap/SystemLandscape",
    "sap/sac/df/utils/SyncActionHelper",
    "sap/sac/df/utils/ResultSetHelper",
    "sap/sac/df/utils/ListHelper",
    "sap/sac/df/utils/ApplicationHelper",
    "sap/sac/df/olap/OlapListBinding",
    "sap/sac/df/olap/OlapListGridBinding",
    "sap/sac/df/olap/OlapPropertyBinding",
    "sap/sac/df/olap/DataProvider",
    "sap/sac/df/utils/ResourceBundle",
    "sap/sac/df/thirdparty/lodash",
    "sap/sac/df/firefly/library"
  ], /* eslint-disable max-params */
  function (
    Log, Utilities, Model, Context, ValueType, SystemLandscape, SyncActionHelper, ResultSetHelper, ListHelper, ApplicationHelper, OlapListBinding, OlapListGridBinding,
    OlapPropertyBinding,
    DataProvider,ResourceBundle, _
  )
  /* eslint-enable max-params */
  {
    "use strict";
    var rS2D = new RegExp("/", "g");
    /**
     * Constructor for a new OlapMode.
     *
     * The Olap Model allows to access and change data from servers providing the InA Protocol.
     *
     * @class
     * Model implementation for InA provider
     *
     * The OlapModel can populate it's exposed data via Binding to Controls. The structure of
     * the exposed data is as follows:
     *  <b>Structure of Exposed Data</b>
     *
     * <ul>
     * <li>FlatVariables: The list of all input ready variables collected from all aggregated <code>DataProvider</code></li>
     * <li>DataProvider: The associative array of all <code>DataProvider</code> aggregated by the <OlapModel> </li>
     * <li>semanticStyles: The associative array of all <code>SemanticStyle</code> for the <code>OlapModel</code>
     * <li>Messages: The list of all messages posted by the Analytical Engine
     * </ul>
     *
     * @param {object} [mSettings] the settings for the new Olap Model.
     *   <ul>
     *     <li>systemLandscape: The list of addressable Analytic Engines
     *     <li>dataProvider: The associative array of all <code>DataProvider</code> aggregated by the <OlapModel>
     *  </ul>
     * @extends sap.ui.model.Model
     * @author SAP SE
     * @version 1.108.15
     * @public
     * @experimental
     * @alias sap.sac.df.olap.OlapModel
     */
    var OlapModel = Model.extend(
      "sap.sac.df.olap.OlapModel", {
        constructor: function (mSettings) {
          var that = this;
          Model.apply(that);
          var mSett = _.clone(mSettings || {});
          mSett.systemLandscape = mSett.systemLandscape || SystemLandscape;
          mSett.masterSystem = mSett.masterSystem || "localAbapAnalyticEngine";
          var oApplication = null;
          var oFireflyReady = Promise.resolve(null).then(function () {
            return ApplicationHelper.createApplication(mSett.systemLandscape, mSett.masterSystem);
          }
          ).then(function (o) {
            oApplication = o;
            oApplication.getSession().setXVersion(sap.firefly.XVersion.V190_METADATA_CUBE_RESPONSE_SUPPRESS_PROPERTIES );
            oApplication.getSession().deactivateFeatureToggle(sap.firefly.FeatureToggleOlap.FUSION_SERVICE);
            sap.firefly.XStream.of(sap.firefly.FeatureToggleOlap.getAllFeatureToggles()).forEach(function(toggle) {
              var xVersion = toggle.getXVersion();
              if(xVersion > sap.firefly.FeatureToggleOlap.FUSION_SERVICE.getXVersion() && xVersion <= sap.firefly.XVersion.MAX){
                oApplication.getSession().activateFeatureToggle(toggle);
              }
            });
            oApplication.getSession().activateFeatureToggle(sap.firefly.FeatureToggleOlap.METADATA_CACHING);
            sap.firefly.UiLocalizationCenter.setExternalLocalizationProvider(
              {
                getText: function (sID) {
                  return ResourceBundle.getText(sID.substring(3)); //Remove prefix FF_
                },
                getTextWithPlaceholder: function (sID, sPlaceHolder) {
                  return ResourceBundle.getText(sID.substring(3), sPlaceHolder); //Remove prefix FF_
                },
                getTextWithPlaceholder2: function (sID, sPlaceHolder, sPlaceHolder2) {
                  return ResourceBundle.getText(sID.substring(3), [sPlaceHolder, sPlaceHolder2]); //Remove prefix FF_
                }
              }
            );
            sap.firefly.UiLocalizationCenter.getCenter().getLocalizationProviderByName(sap.firefly.OuDimensionDialog2.DEFAULT_PROGRAM_NAME).m_isProductive=true;
          }
          ).then(function () {
            setData({
              HasUndo: false,
              systems: _.map(
                ListHelper.arrayFromList( oApplication.getSystemLandscape().getSystemNames() ),
                function (systemName) {
                  var connectionPool = oApplication.getConnectionPool();
                  var systemDescription = connectionPool.getSystemLandscape().getSystemDescription( systemName );
                  if(systemDescription.getSystemType().isTypeOf(sap.firefly.SystemType.BW)||systemDescription.getSystemType().isTypeOf(sap.firefly.SystemType.BPCS))
                  {
                    connectionPool.setMaximumSharedConnections( systemName, mSett.numberOfConnections || 6 );
                  }
                  return {
                    name: systemName
                  };
                }
              ),
              colLimit: -1,
              rowLimit: 125,
              dataProvider: {},
              variables: {},
              semanticStyles: {},
              messages: [],
              Functions: []
            });
          }
          );
          var oModelData = null;
          var oBindings = {};

          function setData(oData) {
            oModelData = oData;
            that.checkUpdate();
          }

          function updateUndo(b) {
            if (oModelData.HasUndo !== b) {
              oModelData.HasUndo = b;
              that.checkUpdate();
            }
          }
          that.setDataAccessLanguage = function(lang){
            var systemLandscape = oApplication.getSystemLandscape();
            var systemNames = systemLandscape.getSystemNames();
            for (var snk = 0; snk < systemNames.size(); snk++) {
              systemLandscape.getSystemDescription(systemNames.get(snk)).setLanguage(lang);
            }
          };
          that.bindProperty = function (sPath, oContext, mParameters) {
            var oBinding = new OlapPropertyBinding(that, sPath, oContext, mParameters);
            oBindings[oBinding.getId()] = oBinding;
            return oBinding;
          };
          that.bindList = function (sPath, oContext, aSorters, aFilters, mParameters) {
            if (sPath.match(/^(\/)?dataProvider\/(.)*\/Grid\/renderGrid/)) {
              return new OlapListGridBinding(that, sPath, oContext, aSorters, aFilters, mParameters);
            } else {
              return new OlapListBinding(that, sPath, oContext, aSorters, aFilters, mParameters);
            }
          };

          function _getObject(sPath, oContext) {
            var oNode = oContext instanceof Context ? _getObject(oContext.getPath()) : oModelData;
            if (sPath) {
              var subPath = sPath.replace(rS2D, ".");
              if (subPath.startsWith(".")) {
                subPath = subPath.replace(".", "");
              }
              return _.get(oNode, subPath);
            } else {
              return oNode;
            }
          }

          that.isList = function (sPath, oContext) {
            return Array.isArray(_getObject(that.resolve(sPath, oContext)));
          };
          that.getLimit = function () {
            return {
              rowLimit: oModelData.rowLimit,
              colLimit: oModelData.colLimit
            };
          };
          that.getProperty = function (sPath, oContext) {
            return _getObject(sPath, oContext);
          };
          that.setProperty = function (sPath, sValue) {
            var bRes = false;
            var a = sPath.split("/");
            if (a[a.length - 1] === "visibleWithPrio") {
              var oV = oModelData.FlatVariables[parseInt(a[2], 10)];
              oV.visibleWithPrio = sValue;
            } else {
              var aPath = _.filter(
                sPath.split("/"), _.identity
              );
              try {
                var sLast = aPath.pop();
                var sP1 = aPath.join(".");
                var m1 = _.get(oModelData, sP1);
                if (sLast !== "vizProperties" || sValue) {
                  if (m1) {
                    m1[sLast] = sValue;
                  } else {
                    Log.warning("Failed to set " + sValue + " on: " + sPath);
                  }
                }
                that.checkUpdate();
                bRes = true;
              } catch (oError) {
                Log.error(oError);
              }
            }
            return bRes;
          };
          that.undo = function () {
            return oFireflyReady.then(
              function () {
                var fResolve;
                var fReject;
                if (!oModelData.HasUndo) {
                  return Promise.resolve(that);
                }

                function handle(resolve, reject) {
                  fResolve = resolve;
                  fReject = reject;
                }

                var oProm = new Promise(handle);
                oApplication.getUndoManager().processUndo(
                  sap.firefly.SyncType.NON_BLOCKING, {
                    undoRedoActionFinished: function (oRes) {
                      if (oRes.hasErrors()) {
                        fReject(oRes.getErrors());
                      } else {
                        fResolve(oRes);
                      }
                    }
                  }
                );
                return oProm.then(function () {
                  var getRSPromises = [];
                  _.forEach(oModelData.dataProvider, function (oDP) {
                    getRSPromises.push(oDP.getResultSet(true));
                  });
                  return Promise.all( getRSPromises );
                }).then(function () {
                  return that;
                });
              }
            );
          };
          that.redo = function () {
            return oFireflyReady.then(
              function () {
                var fResolve;
                var fReject;

                function handle(resolve, reject) {
                  fResolve = resolve;
                  fReject = reject;
                }

                var oProm = new Promise(handle);
                oApplication.getUndoManager().processRedo(
                  sap.firefly.SyncType.NON_BLOCKING, {
                    undoRedoActionFinished: function (oRes) {
                      if (oRes.hasErrors()) {
                        fReject(oRes.getErrors());
                      } else {
                        fResolve(oRes);
                      }
                    }
                  }
                );
                return oProm.then(function () {
                  var getRSPromises = [];
                  _.forEach(oModelData.dataProvider, function (oDP) {
                    getRSPromises.push(oDP.getResultSet(true));
                  });
                  return Promise.all( getRSPromises );
                });
              }
            );
          };
          that.setSemanticStyles = function (o) {
            oModelData.semanticStyles = _.clone(o);
          };
          that.getSemanticStyles = function () {
            return oModelData.semanticStyles;
          };
          that.addMessages = function (aMsg) {
            oModelData.messages = _.map(_.groupBy(_.concat(oModelData.messages, aMsg), "Text"), function (o) {
              return o[0];
            });
            return that.checkUpdate();
          };
          that.clearMessages = function (bUpdateBindings) {
            oModelData.messages = [];
            return bUpdateBindings ? that.checkUpdate() : that;
          };
          that.checkUpdate = function (bForceUpdate) {
            _.forEach(
              oBindings,
              function (oBinding, sKey) {
                if (oBinding) {
                  oBinding.checkUpdate(bForceUpdate);
                } else {
                  delete oBindings[sKey];
                }
              }, false
            );
            return that;
          };
          that.checkMessages = function () {
            _.forEach(
              oBindings,
              function (oBinding) {
                return oBinding.checkDataState ? oBinding.checkDataState() : null;
              }
            );
          };
          that.addBinding = function (oBinding) {
            oBindings[oBinding.getId()] = oBinding;
            return that;
          };
          that.removeBinding = function (oBinding) {
            delete oBindings[oBinding.getId()];
          };
          that.getSystemId = function () {
            return that.getProperty(
              "/serverInfo/SystemId"
            );
          };
          that.getDataProvider = function (sName) {
            return oModelData.dataProvider[sName];
          };

          function updateVariables() {
            var aFlatVar = _.map(
              ListHelper.arrayFromList( oApplication.getOlapEnvironment().getVariableProcessor().getVariables() ),
              ResultSetHelper.transformVariable
            ).filter(function (oV) {
              return oV.InputEnabled;
            });
            oModelData.variables = _.reduce(
              aFlatVar,
              function (oVariables, oVar) {
                var oH = oVariables[oVar.Name];
                if (oH) {
                  oVariables[oVar.Name].visibleWithPrio = oH.visibleWithPrio;
                }
                oVariables[oVar.Name] = oVar;
                return oVariables;
              }, oModelData.variables);
            oModelData.FlatVariables = _.filter(
              oModelData.variables,
              function (oV) {
                return oV.InputEnabled;
              });
          }

          that.addQuery = function (sDataProviderName, sQueryName, sSystem, sPackage, sSchema, sType) {
            return ensurePlanningService( sSystem ).then( function(){
              var dataProvider = oModelData.dataProvider[sDataProviderName];
              if(!dataProvider)
                return;
              return dataProvider.logoff();
            }).then( function () {
              var oQueryConfigService = sap.firefly.QueryServiceConfig.createWithDataSourceName(oApplication, null, sQueryName);
              oQueryConfigService.setMode(sap.firefly.QueryManagerMode.DEFAULT);
              oQueryConfigService.setProviderType(sap.firefly.ProviderType.ANALYTICS);
              oQueryConfigService.setSupportsDimensionLazyLoad(true);
              // Data source name format : $[][][MY_DATA_AREA]/query:[][][QueryName]
              var sDataSourceName = [
                "$[][][MY_DATA_AREA]/",
                (sType || "query"), ":",
                "[", (sSchema ? sSchema : ""), "]",
                "[", ((sSchema || sPackage) ?  sPackage : ""), "]",
                "[", sQueryName, "]"
              ].join("");
              oQueryConfigService.setDataSourceByName(sDataSourceName);
              if (sSystem) {
                oQueryConfigService.setSystemName(sSystem);
              }
              return SyncActionHelper.syncActionToPromise( oQueryConfigService.processQueryManagerCreation, oQueryConfigService, []);
            }).then( function (oQueryManager) {
              oModelData.dataProvider[sDataProviderName] = new DataProvider( that, updateUndo, oApplication, oQueryManager, sDataProviderName );
              updateVariables();
            });
          };
          that.setVariableValue = function (sVariable, aRange) {
            var updateVariablePromises = [];
            _(oModelData.dataProvider).filter( function(oDataProvider){
              return oDataProvider.isVariableInputEnabled(sVariable);
            }).forEach(function (dp) {
              updateVariablePromises.push(dp.setVariableValue(sVariable, aRange));
            });
            return  Promise.all(updateVariablePromises).then(function () {
              updateVariables();
              return that.checkUpdate();
            });
          };
          that.deserialize = function (o) {
            oModelData.dataProvider = oModelData.dataProvider || {};
            oModelData.semanticStyles = o.semanticStyles || [];
            oModelData.Functions = o.Functions || [];
            return oFireflyReady.then( function () {
              var createDPPromises = [];
              _.forEach( o.DataProvider, function (sDef, sName) {
                var dataProvider = oModelData.dataProvider[sName];
                if (!dataProvider) {
                  var oQueryConfigService = sap.firefly.QueryServiceConfig.createByDefinition(
                    oApplication, null, sap.firefly.XContent.createStringContent(sap.firefly.QModelFormat.INA_REPOSITORY, sDef)
                  );
                  createDPPromises.push(SyncActionHelper.syncActionToPromise( oQueryConfigService.processQueryManagerCreation, oQueryConfigService,[]).then(function (oQueryManager) {
                    oModelData.dataProvider[sName] = new DataProvider( that, updateUndo, oApplication, oQueryManager, sName);
                  }));
                } else {
                  createDPPromises.push(dataProvider.deserialize(sDef));
                }
              });
              return Promise.all(createDPPromises);
            }).then( function () {
              updateVariables();
              return that.checkUpdate();
            });
          };
          that.serialize = function () {
            return {
              DataProvider: _.reduce(
                oModelData.dataProvider,
                function (oC, o) {
                  oC[o.Name] = o.serialize();
                  return oC;
                }, {}
              ),
              semanticStyles: that.getSemanticStyles(),
              Functions: oModelData.Functions
            };
          };
          that.openVariableSelector = function (sVar) {
            return Promise.resolve(null).then(function () {
              var oDP = _.find(
                oModelData.dataProvider,
                function (o) {
                  return o.hasVariableValueHelp(oModelData.variables[sVar].TechName);
                });
              if (!oDP) {
                throw new Error("Invalid Variable: " + sVar);
              }
              return oDP.openVariableSelector(sVar).then(function (aSelection) {
                if (!aSelection) {
                  return false;
                }
                var applySelectionPromises = [];
                _.forEach(oModelData.dataProvider, function (oDP) {
                  applySelectionPromises.push(oDP.applySelectionToVariable(sVar, aSelection));
                });
                return Promise.all(applySelectionPromises).then( function(){
                  updateVariables();
                  that.checkUpdate();
                  return true;
                });
              });
            });
          };
          that.submitVariables = function () {
            var submitVariablePromises = _.invokeMap( oModelData.dataProvider, "submitVariables");
            return Promise.all(submitVariablePromises).then( function () {
              updateVariables();
              that.checkUpdate();
            });
          };
          that.logoff = function () {
            return Promise.all( _.invokeMap(oModelData.dataProvider, "logoff") );
          };

          var oPlanningService;
          function ensurePlanningService(sSystem, sDataAreaName) {
            return oFireflyReady.then(
              function () {
                if (oPlanningService) {
                  return oPlanningService;
                }
                if (sSystem) {
                  return null;
                }
                var oPlanningDataSource = sap.firefly.QDataSource.create();
                oPlanningDataSource.setDataArea(sDataAreaName || "MY_DATA_AREA");
                var oPlanningServiceConfig = sap.firefly.OlapApiModule.SERVICE_TYPE_PLANNING.createServiceConfig(oApplication);
                oPlanningServiceConfig.setDataSource(oPlanningDataSource);
                oPlanningServiceConfig.setSystemName(sSystem || mSett.masterSystem);
                return SyncActionHelper.syncActionToPromise( oPlanningServiceConfig.processServiceCreation, oPlanningServiceConfig, []).then( function (oExtResult) {
                  oPlanningService = oExtResult.getData();
                  return oPlanningService;
                });
              }
            );
          }

          that.synchronize = function (aDPNames) {
            var aTargets = aDPNames ? (function () {
              var oTarget = _.reduce(
                aDPNames,
                function (o, s) {
                  o[s] = true;
                  return o;
                },
                {}
              );
              return _.filter(
                oModelData.dataProvider,
                function (o, s) {
                  return oTarget[s] === true;
                });
            }()) : oModelData.dataProvider;
            var getRSPromises = _.invokeMap(aTargets, "getResultSet");
            return Promise.all(getRSPromises).then(
              function () {
                return that.checkUpdate();
              }
            );
          };

          that.getPlanningService = function () {
            return oPlanningService;
          };
          (function () {
            var oProm = oFireflyReady.then(
              function () {
                if (mSettings && mSettings.SemanticStyles) {
                  that.setSemanticStyles(mSettings.SemanticStyles);
                }
                var syncPromises = [];
                _.forEach( mSett.dataProvider || [],
                  function (oDataProviderDef, sName) {
                    var oRes = that.addQuery(sName, oDataProviderDef.dataSourceName, oDataProviderDef.systemName, oDataProviderDef.packageName, oDataProviderDef.schemaName, oDataProviderDef.dataSourceType);
                    syncPromises.push(oDataProviderDef.synchronize ? oRes.then(function () {
                      return that.getDataProvider(sName).synchronize();
                    }) : oRes);
                  }
                );
                return Promise.all(syncPromises);
              }
            );
            that.resetModel = function () {
              var resetPromises = [];
              _.forEach(
                oModelData.dataProvider,
                function (oDP) {
                  resetPromises.push(oDP.resetToDefault());
                });
              return Promise.all(resetPromises).then(function(){
                updateVariables();
              });
            };
            that.dataLoaded = _.constant(oProm);
            that.loaded = that.dataLoaded;
            that.metadataLoaded = that.dataLoaded;
            that.annotationsLoaded = that.dataLoaded;
            that.getMetaModel = _.constant(that);
            that.attachMetadataFailed = _.constant(null);
            that.fireMetadataFailed = _.constant(null);
            that.getODataEntityContainer = _.constant(null);
            that.getODataEntityType = _.constant(that);
            that.createBindingContext = _.constant(null);
            that.getODataEntitySet = _.constant(that);
          }()
          );
        },
        metadata: {
          publicMethods: [
            "openVariableSelector",
            "submitVariables",
            "synchronize",
            "addQuery",
            "serialize",
            "deserialize",
            "getDataProvider"
          ],
          events: {
            metadataFailed: {}
          }
        }
      }
    );
    /**
     * Let the user choose a value for a variable in a dialog
     * @param {string} sVar the name of the variable
     * @return {Promise<string>} the selected value
     * @public
     */
    OlapModel.prototype.openVariableSelector = function () {
    };
    /**
     * Replace all input enabled variables with their entered values for all data providers
     * @return {Promise<this>}the OlapModel, to allow chaining
     * @public
     */
    OlapModel.prototype.submitVariables = function () {
    };
    /**
     * snychronize all aggregated dataproviders
     * if the user does not choose an Analytic Query, then the promise is rejected
     * @param {string[]} aDataProviderNames List of data provider that are to be synchronized (all if not supplied)
     * @return {Promise<sap.sac.df.olap.OlapModel>} the OlapModel, to allow chaining
     * @public
     */
    OlapModel.prototype.synchronize = function () {
    };

    /**
     * @return {object} the limit of the rows and columns that are exposed for bindings
     */
    OlapModel.prototype.getLimit = function () {
    };
    /**
     * serialize the Model with all aggregated <code>DataProvider</code>
     * The <code>OlapModel</code> to be deserialized from an equivalent such Object.
     * @return {object} a javascript object which represents the <code>OlapModel</code>.
     * @public
     */
    OlapModel.prototype.serialize = function () {
    };
    /**
     * deserialize the Model with all aggregated <code>DataProvider</code>
     * The <code>OlapModel</code> be be deserialized from an equivalent such Object.
     * @return {object} a javascript object which represents the <code>OlapModel</code> and which can be JSON stringified.
     * @public
     */
    OlapModel.prototype.deserialize = function () {
    };
   
    /**
     * adds a new query as a new <code>DataProvider</code> .
     * The query is supposed to be defined as an analytical annotated
     *  <a href="https://help.sap.com/viewer/cc0c305d2fab47bd808adcad3ca7ee9d/LATEST/en-US/c2dd92fb83784c4a87e16e66abeeacbd.html targte="_blank">CDS View </a>
     * the name of the query is the name of the DDIC view, prefixed by "2C"
     * @param {string} sDataProviderName  the name of the new <code>DataProvider</code>.
     * @param {string} sQueryName the name of the query which the <code>DataProvider</code> is supposed to expose.
     * @param {string} [sSystem] the name of the system in the landscape
     * @param {string} [sPackage] the name of the package
     * @param {string} [sSchema] the name of the schema
     * @param {string} [sType] the name of the type of the datasource
     * @public
     * @returns {Promise<sap.sac.df.olap.DataProvider>} the Data Provider that was created
     */
    OlapModel.prototype.addQuery = function () {
    };
    /**
     * undoes the last navigation step.
     * @returns {Promise<this>} the Olap Model
     * @public
     */
    OlapModel.prototype.undo = function () {
    };
    /**
     * retrieves a <code>DataProvider</code> aggregated by the <code>OlapModel</code>.
     *  sQueryName, sSystem
     * @param {string} sDataProviderName the name of the <code>DataProvider</code>.
     * @returns {sap.sac.df.olap.DataProvider} the Data Provider that was requested
     * @public
     */
    OlapModel.prototype.getDataProvider = function () {
    };

    /**
     *  Reset the Olap Model to the default query
     *  @public
     */
    OlapModel.prototype.resetModel = function () {};
    /**
     * @param {string} Language code to be used in the subsequent data access calls
     */
    OlapModel.prototype.setDataAccessLanguage = function () {};
    return OlapModel;
  }
);
