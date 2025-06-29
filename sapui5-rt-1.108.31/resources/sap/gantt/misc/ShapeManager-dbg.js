/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)

		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */

// Provides class sap.ui.model.SelectionModel
sap.ui.define([
	"sap/ui/thirdparty/jquery",
	"sap/base/Log",
	"sap/base/util/ObjectPath",
	"sap/ui/base/EventProvider",
	"./Utility",
	"sap/gantt/shape/ResizeShadowShape",
	"sap/gantt/shape/ext/rls/SelectedRelationship",
	"sap/gantt/shape/SelectedShape",
	"sap/gantt/shape/Group",
	"sap/gantt/shape/Text"
],function(jQuery, Log, ObjectPath, EventProvider, Utility) {
	"use strict";

	/**
	 * Constructs an instance of a sap.gantt.misc.ShapeManager.
	 *
	 * @class
	 * @extends sap.ui.base.EventProvider
	 *
	 * @author SAP SE
	 * @version 1.108.10
	 *
	 * @param {int} oGantt <code>sap.gantt.GanttChartBase</code>
	 *
	 * @constructor
	 * @private
	 * @alias sap.ui.model.SelectionModel
	 */
	var ShapeManager = EventProvider.extend("sap.gantt.misc.ShapeManager", /** @lends sap.gantt.misc.ShapeManager.prototype */ {

		constructor : function(oGantt) {
			EventProvider.apply(this);

			this.mShapeElementIds = {};

			this.mShapeConfig = {};

			// {shapeKey: shapeInstance}
			this.mShapeInstance = {};
			// [shapeInstance1, shapeInstance2]
			this.aShapeInstance = [];

			this.oGantt = oGantt;
		}

	});

	/**
	 *
	 * @param aShapes
	 * @returns {Promise}
	 * @private
	 */
	ShapeManager.prototype.instantiateShapes = function(aShapes) {
		this.mShapeConfig = {};

		for (var i = 0; i < aShapes.length; i++) {
			this.mShapeConfig[aShapes[i].getKey()] = aShapes[i];
		}

		return this.recursiveInstantiateShapes(this.mShapeConfig).then(function (aShapeInstance) {
			this.aShapeInstance = aShapeInstance;
			jQuery.each(this.aShapeInstance, function (iKey, oShapeInstance) {
				this.mShapeInstance[oShapeInstance.mShapeConfig.getKey()] = oShapeInstance;
			}.bind(this));
		}.bind(this));
	};

	ShapeManager.prototype.getAllShapeInstances = function() {
		return this.aShapeInstance;
	};

	/**
	 *
	 * @param oShapeConfig
	 * @param oShapeInstance
	 * @returns {Promise}
	 * @private
	 */
	ShapeManager.prototype.getSelectedShapeInstance = function(oShapeConfig, oShapeInstance) {
		if (this.bDestroyed) {
			return Promise.reject();
		}
		var category = oShapeInstance.getCategory(null, this.oGantt.getAxisTime(), this.oGantt.getAxisOrdinal());

		var sSelectedShapeClassName = oShapeConfig.getSelectedClassName();
		if (!sSelectedShapeClassName) {
			if (category === sap.gantt.shape.ShapeCategory.Relationship) {
				sSelectedShapeClassName = "sap.gantt.shape.ext.rls.SelectedRelationship";
			}else {
				sSelectedShapeClassName = "sap.gantt.shape.SelectedShape";
			}
		}
		return this.instantiateShapeClass(sSelectedShapeClassName);
	};

	/**
	 *
	 * @param mShapeConfig
	 * @param sParentShapeKey
	 * @returns {Promise}
	 * @private
	 */
	ShapeManager.prototype.recursiveInstantiateShapes = function (mShapeConfig, sParentShapeKey) { //TODO: fix callers
		var fnHandleShape = function (sKey) {
				var oShapeInst;
				var sShapeKey = sParentShapeKey ? sParentShapeKey : sKey;
				var sIdentifier = sParentShapeKey ? sParentShapeKey + "_" + sKey : sKey;

				var oShapeConfig = mShapeConfig[sKey];
				var sShapeClassName = oShapeConfig.getShapeClassName();
				if (sShapeClassName) {
					// create shape instance
					return this.instantiateShapeClass(sShapeClassName).then(function(oShapei) {
						oShapeInst = oShapei;
						this.setSpecialProperty(oShapeInst, oShapeConfig);
						this.setShapeElementId(sIdentifier, sShapeKey, oShapeInst.getId());

						// create selected shape instance for top shape only
						var oPromise;
						if (!sParentShapeKey) {
							oPromise = this.getSelectedShapeInstance(oShapeConfig, oShapeInst).then(function (oSelectedShapeInst) {
								this.setSpecialProperty(oSelectedShapeInst, oShapeConfig);
								oShapeInst.setAggregation("selectedShape", oSelectedShapeInst);

								sIdentifier = sShapeKey + "_selected" + sShapeKey;
								this.setShapeElementId(sIdentifier, undefined, oSelectedShapeInst.getId());

								// create shadow shape instance for resizing
								return this._createResizeShadowShape(oShapeConfig, oShapeInst, sShapeKey + "_resizeShadow" + sShapeKey);
							}.bind(this));
						} else {
							oPromise = Promise.resolve();
						}
						oPromise = oPromise.then(function () {
							var aShapeGroup = oShapeConfig.getGroupAggregation();
							if (aShapeGroup && aShapeGroup instanceof Array) {
								// create aggregation classes for group
								return this.recursiveInstantiateShapes(aShapeGroup, sShapeKey).then(function (aAggregation) {
									aAggregation.forEach(oShapeInst.addShape, oShapeInst);
								});
							}
						}.bind(this)).then(function () {
							var aShapeClipPath = oShapeConfig.getClippathAggregation();
							if (aShapeClipPath && aShapeClipPath instanceof Array) {
								// create aggregation classes for clip-path
								return this.recursiveInstantiateShapes(aShapeClipPath, sShapeKey).then(function (aPath) {
									aPath.forEach(oShapeInst.addPath, oShapeInst);
								});
							}
							return oShapeInst;
						}.bind(this));

						return oPromise;
					}.bind(this));
				} else {
					return Promise.resolve(null);
				}
			}.bind(this);

		return Promise.all(Object.keys(mShapeConfig).map(fnHandleShape)).then(function (aInstances) {
			aInstances = aInstances.filter(function (oInst) {
				return !!oInst;
			});
			if (!sParentShapeKey){
				this.sortByShapeLevelAccendingly(aInstances);
			}
			return aInstances;
		}.bind(this));
	};

	/**
	 * Set mShapeConfig and mChartInstance to Shape Instance for further process.
	 * Shape Instance requires those when drawing SVG
	 *
	 * @param {object} oShapeInstance Shape Element Instance
	 * @param {object} oShapeConfig <code>sap.gantt.config.Shape</code> instance
	 * @private
	 */
	ShapeManager.prototype.setSpecialProperty = function(oShapeInstance, oShapeConfig) {
		oShapeInstance.mShapeConfig = oShapeConfig;
		oShapeInstance.mChartInstance = this.oGantt;
		oShapeInstance.dataSet = [];
	};

	ShapeManager.prototype.sortByShapeLevelAccendingly = function(aInstances) {
		aInstances.sort(function (oShape1, oShape2) {
			var sLevel1 = oShape1.mShapeConfig.getLevel(),
				sLevel2 = oShape2.mShapeConfig.getLevel();
			var level1 = jQuery.isNumeric(sLevel1) ? sLevel1 : 99;
			var level2 = jQuery.isNumeric(sLevel2) ? sLevel2 : 99;
			return level2 - level1;
		});
	};

	/**
	 *
	 * @param sShapeClassName
	 * @returns {Promise}
	 * @private
	 */
	ShapeManager.prototype.loadClass = function (sShapeClassName) {
		return new Promise(function (resolve) {
			var ShapeClass = ObjectPath.get(sShapeClassName);
			if (ShapeClass) {
				resolve(ShapeClass);
			} else {
				sap.ui.require([sShapeClassName.replace(/\./g, "/")], function (ShapeClass) {
					resolve(ShapeClass);
				});
			}
		});
	};

	/**
	 *
	 * @param sShapeClassName
	 * @returns {Promise}
	 * @private
	 */
	ShapeManager.prototype.instantiateShapeClass = function (sShapeClassName) {
		return this.loadClass(sShapeClassName).then(function (ShapeClass) {
			var oShapeInstance = new ShapeClass();
			if (!oShapeInstance) {
				Log.error("shapeClassName:" + sShapeClassName + " can't be instantiated");
				Log.warning("shapeClassName:" + sShapeClassName + " fallback to sap.gantt.shape.Shape");
				oShapeInstance = new sap.gantt.shape.Shape();
			}
			return oShapeInstance;
		});
	};

	/**
	 * Check if the shape whether selection is enabled or not
	 *
	 * @param {object} oShapeData binded Shape data
	 * @param {string} sElementId shape DOM ID
	 * @return {boolean} true: selectable, false: non-selectable
	 * @private
	 */
	ShapeManager.prototype.isShapeSelectable = function (oShapeData, sElementId) {
		return this.getShapePropertyValue("enableSelection", oShapeData, sElementId);
	};

	/**
	 * Indicates whether the shape can be resized by calling getEnableResize method of the related shape instance
	 * (or a top shape if the shape is in a group)
	 *
	 * @param {object} oShapeData binded Shape data
	 * @param {string} sElementId shape DOM ID
	 * @return {boolean} true: resizable, false: non-resizable
	 * @private
	 */
	ShapeManager.prototype.isShapeResizable = function (oShapeData, sElementId) {
		return this.getShapePropertyValue("enableResize", oShapeData, sElementId);
	};

	/**
	 * Indicates whether or not the shape has duration time.
	 *
	 * @param {object} oShapeData binded Shape data
	 * @param {string} sElementId shape DOM ID
	 * @return {boolean} true: duration, false: non-duration
	 * @private
	 */
	ShapeManager.prototype.isShapeDuration = function (oShapeData, sElementId) {
		return this.getShapePropertyValue("isDuration", oShapeData, sElementId);
	};

	/**
	 * Indicates whether or not the shape can fire mouse enter and leave event.
	 *
	 * @param {object} oShapeData binded Shape data
	 * @param {string} sElementId shape DOM ID
	 * @return {boolean} true: can fire event, false: can't fire event
	 * @private
	 */
	ShapeManager.prototype.isShapeHoverable = function (oShapeData, sElementId) {
		return this.getShapePropertyValue("enableHover", oShapeData, sElementId);
	};

	/**
	 * Get property value from shape instance dynamically.
	 *
	 * @param {string} sProperty property name
	 * @param {object} oShapeData binded shape data
	 * @param {string} sElementId Shape (modeled via sap.ui.core.Element) instance id
	 * @return {any} property value
	 * @private
	 */
	ShapeManager.prototype.getShapePropertyValue = function(sProperty, oShapeData, sElementId) {
		var oInstance, vValue;
		if (oShapeData) {
			oInstance = this.getShapeInstance(oShapeData, sElementId) || sap.ui.getCore().byId(sElementId);
			var sMethod = "get" + sProperty.substr(0,1).toUpperCase() + sProperty.substr(1);
			vValue = (oInstance && oInstance[sMethod]) ? oInstance[sMethod](oShapeData) : vValue;
		}
		return vValue;
	};

	/**
	 * Check if the shape can be drag & drop by call getEnableDnD method of related shape instance
	 * (or top shape when shape in a group)
	 *
	 * @param {object} oShapeData binded Shape data
	 * @param {string} sElementId shape DOM ID
	 * @return {boolean} true: draggable, false: non-draggable
	 * @private
	 */
	ShapeManager.prototype.isShapeDraggable = function (oShapeData, sElementId) {
		return this.getShapePropertyValue("enableDnD", oShapeData, sElementId);
	};

	/**
	 *
	 * @param {string} sIdentifier Hash MAP key
	 * @param {string} sShapeKey Shape key property from Shape configuration
	 * @param {string} sShapeElementId Shape instance id
	 * @private
	 */
	ShapeManager.prototype.setShapeElementId = function (sIdentifier, sShapeKey, sShapeElementId) {

		this.mShapeElementIds[sIdentifier] = {
			"shapeElementId": sShapeElementId,
			"shapeKey": sShapeKey
		};
	};

	/**
	 * Get Shape Instance based on the binded shape data or element ID directly.
	 *
	 * @private
	 *
	 * @param {object} oShapeData binded shape data
	 * @param {string} sShapeElementId Element sId
	 * @return {object} Shape Instance
	 */
	ShapeManager.prototype.getShapeInstance = function(oShapeData, sShapeElementId) {
		var oConfig = {};
		if (sShapeElementId) {
			oConfig = this._getShapeElementConfig(sShapeElementId);
		} else {
			var sShapeDataName = Utility.getShapeDataNameByUid(oShapeData.uid);
			for (var sShapeKey in this.mShapeInstance) {
				var sShapeName = this.mShapeInstance[sShapeKey].mShapeConfig.getShapeDataName();
				if (sShapeDataName === sShapeName){
					oConfig = this.mShapeElementIds[sShapeKey];
					break;
				}
			}
		}
		return this.mShapeInstance[oConfig ? oConfig.shapeKey : null];
	};

	ShapeManager.prototype._getShapeElementConfig = function (sShapeElementId) {

		for (var sShapeKey in this.mShapeElementIds) {
			var oConfig = this.mShapeElementIds[sShapeKey];
			if (oConfig.shapeElementId === sShapeElementId) {
				return oConfig;
			}
		}
		return null;
	};

	//collect selected shape data and put them into data-set of related shape instance
	ShapeManager.prototype.collectDataForSelectedShapes = function (oSelection, mObjectTypeConfig, mChartSchemeConfig) {
		var mShapeInstanceWithKeys = this.mShapeInstance;

		for (var sShapeKey in mShapeInstanceWithKeys) {
			var oShapeInstance = mShapeInstanceWithKeys[sShapeKey];
			// If sShapeDataName is undefiend, the selectedShape will use row data to draw selection frame.

			var sShapeDataName = oShapeInstance.mShapeConfig.getShapeDataName();
			var oSelectedClassIns = oShapeInstance.getAggregation("selectedShape");
			var sCategory = oSelectedClassIns.getCategory(null, this.oGantt.getAxisTime(), this.oGantt._oAxisOrdinal);
			//collect shape data for every selectedClass instance according to current selection
			oSelectedClassIns.dataSet = [];

			if (sCategory === sap.gantt.shape.ShapeCategory.Relationship) {
				var aSelectedRelationships = oSelection.getSelectedRelationships();
				oSelectedClassIns.dataSet.push({
					"shapeData": aSelectedRelationships
				});
			} else {
				var aSelectedShapes = oSelection.getSelectedShapeDatum();

				for (var iIndex = 0; iIndex < aSelectedShapes.length; iIndex++) {
					var oSelectedShapeData = aSelectedShapes[iIndex];
					if (Utility.getShapeDataNameByUid(oSelectedShapeData.uid) !== sShapeDataName) {
						continue;
					}

					var oRowDatum = Utility.getRowDatumByShapeUid(oSelectedShapeData.uid, this.oGantt.getId());
					// selected shape might not visible in gantt chart, for instance, been collapsed
					// So much check if selected shape is currently visible
					var bVisible = oSelection.isSelectedShapeVisible(oSelectedShapeData.uid, this.oGantt.getId());
					if (oRowDatum && bVisible && this.isShapeSelectable(oSelectedShapeData, oShapeInstance.getId()) &&
							this.isShapeDisplayableInRow(oRowDatum, sShapeKey, mObjectTypeConfig, mChartSchemeConfig)){
						oSelectedClassIns.dataSet.push({
							"objectInfoRef": oRowDatum,
							"shapeData": [oSelectedShapeData]
						});
					}
				}
			}
		}
	};

	/**
	 * This method collect data according to current row's configuration/objectType/shape/chart scheme/mode.
	 * this._aFilteredRowData contains the data for all different shapes so here we need to pick up by sShapeName
	 * once is function finished execution, each instance of shape classes will have 'dataset' attribute
	 * and it is an array of the data picked up from this._aFilteredRowData for drawing that shape.
	 *
	 * @private
	 *
	 * @param {array} aRowData an array of filtered data from table rows
	 * @param {object} mObjectTypeConfig a key value pair of <code>sap.gantt.config.ObjectType</code>
	 * @param {object} mChartSchemeConfig a key value pair of <code>sap.gantt.config.ChartScheme</code>
	 */
	ShapeManager.prototype.collectDataForAllShapeInstances = function(aRowData, mObjectTypeConfig, mChartSchemeConfig) {
		var bJSONTreeBinding = true;

		var mShapeInstanceWithKeys = this.mShapeInstance;
		for (var sShapeKey in mShapeInstanceWithKeys) {
			var oShapeInstance = mShapeInstanceWithKeys[sShapeKey];
			var oShapeData;
			var sBindingName = oShapeInstance.mShapeConfig.getShapeDataName();

			// clear the existing dataset before collecting for next drawing cycle
			oShapeInstance.dataSet = [];
			if (oShapeInstance._attributeNameBindingMap) {
				oShapeInstance._attributeNameBindingMap = undefined;
			}

			for (var i = 0; i < aRowData.length; i++) {
				//this._aFilteredRowData contains the data for all different shapes so here we need to pick up by sShapeName
				var oRowData = aRowData[i];

				if (!sBindingName) {
					//if user doesn't configure the shape with 'shapeDataName', add all row data to the shape
					oShapeInstance.dataSet.push({
						"objectInfoRef": oRowData,
						"shapeData": oRowData.data
					});
					continue;
				}

				var bDisplayable = this.isShapeDisplayableInRow(oRowData, sShapeKey, mObjectTypeConfig, mChartSchemeConfig);
				if (!bDisplayable) {
					continue;
				}

				if (bJSONTreeBinding){
					oShapeData = oRowData.data[sBindingName];
				} else if (sBindingName === oRowData.shapeName) {
					oShapeData = oRowData.shapeData;
				} else {
					continue;
				}
				if (oShapeData){
					oShapeInstance.dataSet.push({
						"objectInfoRef": oRowData,
						"shapeData": oShapeData
					});
				}
			}
		}
	};

	//the display of shapes can be influenced by Mode
	ShapeManager.prototype.isShapeDisplayableInRow = function (oRowData, sShapeKey, mObjectTypeConfig, mChartSchemeConfig) {
		var sChartScheme;
		if (oRowData.chartScheme) {
			sChartScheme = oRowData.chartScheme;
		} else {
			sChartScheme = mObjectTypeConfig[oRowData.type] ? mObjectTypeConfig[oRowData.type].getMainChartSchemeKey() :
					sap.gantt.config.DEFAULT_CHART_SCHEME_KEY;
		}
		var oChartScheme = mChartSchemeConfig[sChartScheme];
		if (oChartScheme === undefined) {
			return false;
		}
		var aShapeIdsInChartScheme = oChartScheme.getShapeKeys();
		/*
		 * determine mode. if mode is coded against chart scheme, it over-write current mode in chart
		 */
		var sMode = oChartScheme.getModeKey() !== sap.gantt.config.DEFAULT_MODE_KEY ?
				oChartScheme.getModeKey() :
				this.oGantt.getMode();
		//sMode = oChartScheme.getModeKey() ? oChartScheme.getModeKey() : this.getMode();
		/*
		 * check if shape should appear in current chart scheme and mode
		 */
		var mShapeConfig = this.mShapeConfig;
		if ((sChartScheme !== sap.gantt.config.DEFAULT_CHART_SCHEME_KEY && aShapeIdsInChartScheme.indexOf(sShapeKey) === -1 )
				|| (sMode !== sap.gantt.config.DEFAULT_MODE_KEY
					&& mShapeConfig[sShapeKey].getModeKeys()
					&& mShapeConfig[sShapeKey].getModeKeys().length > 0
					&& mShapeConfig[sShapeKey].getModeKeys().indexOf(sMode) < 0 )
				|| !oRowData.data) {
			return false;
		}
		return true;
	};

	//Check if Relationship can be display in current Mode
	ShapeManager.prototype.isRelationshipDisplayable = function (oShapeInstance) {

		var mShapeConfig = this.mShapeConfig;
		var sShapeConfigKey = oShapeInstance.mShapeConfig.getKey();
		var aShapeMode = mShapeConfig[sShapeConfigKey] ? mShapeConfig[sShapeConfigKey].getModeKeys() : [];
		if (jQuery.inArray(this.oGantt.getMode(), aShapeMode) === -1 && this.oGantt.getMode() !== sap.gantt.config.DEFAULT_MODE_KEY) {
			return false;
		}

		return true;
	};

	/**
	 *
	 * @param oShapeConfig
	 * @param oShapeInstance
	 * @returns {Promise}
	 * @private
	 */
	ShapeManager.prototype.getResizeShadowShapeInstance = function(oShapeConfig, oShapeInstance) {
		if (this.bDestroyed) {
			return Promise.reject();
		}
		var category = oShapeInstance.getCategory(null, this.oGantt.getAxisTime(), this.oGantt.getAxisOrdinal());

		var sResizeShadowShapeClassName = oShapeConfig.getResizeShadowClassName();
		if (!sResizeShadowShapeClassName || sResizeShadowShapeClassName === "") {
			if (category === sap.gantt.shape.ShapeCategory.InRowShape) {
				sResizeShadowShapeClassName = "sap.gantt.shape.ResizeShadowShape";
			} else {
				return Promise.resolve(null);//return null as relationship don't need resizing for now
			}
		}
		return this.instantiateShapeClass(sResizeShadowShapeClassName);
	};

	/**
	 *
	 * @param oShapeConfig
	 * @param oShapeInst
	 * @param sResizeShadowIdentifier
	 * @returns {Promise}
	 * @private
	 */
	ShapeManager.prototype._createResizeShadowShape = function (oShapeConfig, oShapeInst, sResizeShadowIdentifier) {
		return this.getResizeShadowShapeInstance(oShapeConfig, oShapeInst).then(function (oResizeShadowShapeInst) {
			if (this.bDestroyed) {
				return;
			}
			if (oResizeShadowShapeInst) {
				this.setSpecialProperty(oResizeShadowShapeInst, oShapeConfig);
				oShapeInst.setAggregation("resizeShadowShape", oResizeShadowShapeInst);
				this.setShapeElementId(sResizeShadowIdentifier, undefined, oResizeShadowShapeInst.getId());
			}
		}.bind(this));
	};

	ShapeManager.prototype.destroy = function () {
		this.bDestroyed = true;
	};

	/** SYNC API **/

	ShapeManager.prototype._createResizeShadowShapeSync = function (oShapeConfig, oShapeInst, sResizeShadowIdentifier) {
		var oResizeShadowShapeInst = this.getResizeShadowShapeInstanceSync(oShapeConfig, oShapeInst);

		if (oResizeShadowShapeInst) {
			this.setSpecialProperty(oResizeShadowShapeInst, oShapeConfig);
			oShapeInst.setAggregation("resizeShadowShape", oResizeShadowShapeInst);
			this.setShapeElementId(sResizeShadowIdentifier, undefined, oResizeShadowShapeInst.getId());
		}
	};

	ShapeManager.prototype.getResizeShadowShapeInstanceSync = function(oShapeConfig, oShapeInstance) {
		var oResizeShadowShapeInst = null;

		var category = oShapeInstance.getCategory(null, this.oGantt.getAxisTime(), this.oGantt.getAxisOrdinal());

		var sResizeShadowShapeClassName = oShapeConfig.getResizeShadowClassName();
		if (!sResizeShadowShapeClassName || sResizeShadowShapeClassName === "") {
			if (category === sap.gantt.shape.ShapeCategory.InRowShape) {
				sResizeShadowShapeClassName = "sap.gantt.shape.ResizeShadowShape";
			} else {
				return null;//return null as relationship don't need resizing for now
			}
		}
		oResizeShadowShapeInst = this.instantiateShapeClassSync(sResizeShadowShapeClassName);
		return oResizeShadowShapeInst;
	};

	ShapeManager.prototype.instantiateShapeClassSync = function (sShapeClassName) {
		var CustomerClass = ObjectPath.get(sShapeClassName);
		if (!CustomerClass) {
			throw new Error("Class " + sShapeClassName + " not preloaded. Please add it to require of your" +
				" controller to ensure that it's initialized before this point or use Gantt 2.0.");
		}
		var oShapeInstance = new CustomerClass();
		if (!oShapeInstance) {
			Log.error("shapeClassName:" + sShapeClassName + " can't be instantiated");
			Log.warning("shapeClassName:" + sShapeClassName + " fallback to sap.gantt.shape.Shape");
			oShapeInstance = new sap.gantt.shape.Shape();
		}
		return oShapeInstance;
	};

	ShapeManager.prototype.recursiveInstantiateShapesSync = function (mShapeConfig, sParentShapeKey) {
		var aInstances = [],
			oShapeInst;

		for (var sKey in mShapeConfig) {
			var sShapeKey = sParentShapeKey ? sParentShapeKey : sKey;
			var sIdentifier = sParentShapeKey ? sParentShapeKey + "_" + sKey : sKey;

			var oShapeConfig = mShapeConfig[sKey];
			var sShapeClassName = oShapeConfig.getShapeClassName();
			if (sShapeClassName) {
				// create shape instance
				oShapeInst = this.instantiateShapeClassSync(sShapeClassName);
				this.setSpecialProperty(oShapeInst, oShapeConfig);

				this.setShapeElementId(sIdentifier, sShapeKey, oShapeInst.getId());

				// create selected shape instance for top shape only
				if (!sParentShapeKey){
					var oSelectedShapeInst = this.getSelectedShapeInstanceSync(oShapeConfig, oShapeInst);

					this.setSpecialProperty(oSelectedShapeInst, oShapeConfig);

					oShapeInst.setAggregation("selectedShape", oSelectedShapeInst);

					sIdentifier = sShapeKey + "_selected" + sShapeKey;
					this.setShapeElementId(sIdentifier, undefined, oSelectedShapeInst.getId());

					// create shadow shape instance for resizing
					this._createResizeShadowShapeSync(oShapeConfig, oShapeInst, sShapeKey + "_resizeShadow" + sShapeKey);
				}
				// create aggregations
				var aShapeGroup = oShapeConfig.getGroupAggregation();
				if (aShapeGroup && aShapeGroup instanceof Array) {
					// create aggregation classes for group
					var aAggregation = this.recursiveInstantiateShapesSync(aShapeGroup, sShapeKey);
					for (var k = 0; k < aAggregation.length; k++) {
						oShapeInst.addShape(aAggregation[k]);
					}
				}
				var aShapeClipPath = oShapeConfig.getClippathAggregation();
				if (aShapeClipPath && aShapeClipPath instanceof Array) {
					// create aggregation classes for clip-path
					var aPath = this.recursiveInstantiateShapesSync(aShapeClipPath, sShapeKey);
					for (var j = 0; j < aPath.length; j++) {
						oShapeInst.addPath(aPath[j]);
					}
				}
			}

			aInstances.push(oShapeInst);
		}

		// sort top shape instances and create map by shape id
		if (!sParentShapeKey){
			this.sortByShapeLevelAccendingly(aInstances);
		}

		return aInstances;
	};

	ShapeManager.prototype.getSelectedShapeInstanceSync = function(oShapeConfig, oShapeInstance) {
		var oSelectedShapeInst = null;

		var category = oShapeInstance.getCategory(null, this.oGantt.getAxisTime(), this.oGantt.getAxisOrdinal());

		var sSelectedShapeClassName = oShapeConfig.getSelectedClassName();
		if (!sSelectedShapeClassName) {
			if (category === sap.gantt.shape.ShapeCategory.Relationship) {
				sSelectedShapeClassName = "sap.gantt.shape.ext.rls.SelectedRelationship";
			}else {
				sSelectedShapeClassName = "sap.gantt.shape.SelectedShape";
			}
		}
		oSelectedShapeInst = this.instantiateShapeClassSync(sSelectedShapeClassName);

		return oSelectedShapeInst;
	};

	ShapeManager.prototype.instantiateShapesSync = function(aShapes) {
		this.mShapeConfig = {};

		for (var i = 0; i < aShapes.length; i++) {
			this.mShapeConfig[aShapes[i].getKey()] = aShapes[i];
		}

		this.aShapeInstance = this.recursiveInstantiateShapesSync(this.mShapeConfig);

		jQuery.each(this.aShapeInstance, function (iKey, oShapeInstance) {
			this.mShapeInstance[oShapeInstance.mShapeConfig.getKey()] = oShapeInstance;
		}.bind(this));
	};

	return ShapeManager;

});
