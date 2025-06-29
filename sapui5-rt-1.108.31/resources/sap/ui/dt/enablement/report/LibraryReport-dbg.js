/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

sap.ui.define([
	"sap/ui/dt/enablement/Test",
	"sap/ui/dt/enablement/ElementEnablementTest"
], function (
	Test,
	ElementEnablementTest
) {
	"use strict";

	/**
	 * Constructor for a LibraryReport.
	 *
	 * @param {string} [sId] id for the new object, generated automatically if no id is given
	 * @param {object} [mSettings] initial settings for the new object
	 *
	 * @class
	 * The LibraryReport class allows to create a design time test
	 * which tests a given library on compatibility with the sap.ui.dt.DesignTime.
	 * @extends sap.ui.dt.enablement.Test
	 *
	 * @author SAP SE
	 * @version 1.108.28
	 *
	 * @constructor
	 * @private
	 * @since 1.38
	 * @alias sap.ui.dt.enablement.report.LibraryReport
	 * @experimental Since 1.38. This class is experimental and provides only limited functionality. Also the API might be changed in future.
	 */
	var LibraryReport = Test.extend("sap.ui.dt.enablement.report.LibraryReport", /** @lends sap.ui.dt.enablement.report.LibraryReport.prototype */ {
		metadata: {
			// ---- object ----

			// ---- control specific ----
			library: "sap.ui.dt",
			properties: {
				libraryName: {
					type: "string"
				},
				testData: {
					type: "object"
				}
			}
		}
	});


	/**
	 * @return {Promise} A promise providing the test results.
	 * @override
	 */
	LibraryReport.prototype.run = function() {
		this._aResult = [];
		var oTestData = this.getTestData() || {};
		var sLibraryName = this.getLibraryName();
		var aElementEnablementTest = [];
		var oLib = sap.ui.getCore().getLoadedLibraries()[sLibraryName];
		if (oLib) {
			var aLibraryControls = oLib.controls;
			aLibraryControls.forEach(function(sType) {
				var oElementTestData = oTestData[sType];
				if (!oElementTestData && oElementTestData !== false) {
					oElementTestData = {};
				}

				if (oElementTestData !== false) {
					oElementTestData.type = sType;

					var oElementTestDataWithoutCreate = null;
					if (oElementTestData.create) {
						oElementTestDataWithoutCreate = Object.assign({}, oElementTestData);
						delete oElementTestDataWithoutCreate.create;
						oElementTestData.groupPostfix = "with create method";
					}

					aElementEnablementTest.push(new ElementEnablementTest(oElementTestData));

					if (oElementTestDataWithoutCreate) {
						aElementEnablementTest.push(new ElementEnablementTest(oElementTestDataWithoutCreate));
					}
				}
			});
		}

		var aResults = [];
		var fnIterate = function(mResult) {
			if (mResult) {
				aResults.push(mResult);
			}
			var oElementEnablementTest = aElementEnablementTest.shift();
			if (oElementEnablementTest) {
				return oElementEnablementTest.run().then(function (mResult) {
					oElementEnablementTest.destroy();
					return fnIterate(mResult);
				});
			}

			return Promise.resolve(aResults);
		};


		return fnIterate().then(function(aResults) {
			var mResult = this.createSuite("Library Enablement Test");

			aResults.forEach(function(mElementTestResult) {
				var mChild = mElementTestResult.children[0];
				var mPreviousChild = mResult.children[mResult.children.length - 1];

				if (mPreviousChild && mChild.name === mPreviousChild.name) {
					mPreviousChild.children = mPreviousChild.children.concat(mChild.children);
				} else {
					mResult.children.push(mChild);
				}
			});

			mResult = this.aggregate(mResult);

			return mResult;
		}.bind(this));
	};

	return LibraryReport;
});