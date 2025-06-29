/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

/*
 * IMPORTANT: This is a private module, it must not be listed as a direct module dependency,
 *            nor must it be required by code outside this package.
 */

/*global QUnit, sinon, */

sap.ui.define([
	"sap/base/util/UriParameters",
	"./_utils"
], function(UriParameters, utils) {
	"use strict";

	// shortcut for Object.prototype.hasOwnProperty.call(obj, prop)
	var has = Function.prototype.call.bind(Object.prototype.hasOwnProperty);

	function makeArray(arg) {
		return Array.isArray(arg) ? arg : [arg];
	}

	function requireP(deps) {
		return new Promise(function(resolve, reject) {
			sap.ui.require(makeArray(deps), function() {
				resolve(Array.prototype.slice.call(arguments));
			}, reject);
		});
	}

	function copyFiltered(target, source, filter) {
		if ( source ) {
			for ( var key in source ) {
				if ( has(filter, key) ) {
					target[key] = source[key];
				}
			}
		}
		return target;
	}

	function ensureDOM() {
		function insertDIV(id) {
			if ( document.body.querySelector("#" + id) == null ) {
				var elem = document.createElement("div");
				elem.id = id;
				document.body.insertBefore(elem, document.body.firstChild);
			}
		}

		return utils.whenDOMReady().then(function() {
			/* Prepare body: Add QUnit DOM if missing, add CSS, ... */
			insertDIV("qunit");
			insertDIV("qunit-fixture");
		});
	}

	function onCSPViolation(e) {
		var location = e.sourceFile + ":" + e.lineNumber + ":" + e.columnNumber,
			msg = "Security policy violation: directive '" + e.violatedDirective + "'";
		if ( e.blockedURI ) {
			msg += " violated by '" + String(e.blockedURI).slice(0, 20) + "'";
		}

		if ( QUnit.config.current ) {
			QUnit.pushFailure(msg, location);
		} else {
			// should be caught and reported by QUnit's global error handler
			// if not, it will only fail the current task for the securityviolationevent
			throw new Error(msg + " at " + location);
		}
	}

	/*
	 * @const
	 */
	var QUNIT_KNOWN_OPTIONS = {
		altertitle: 1,
		collapse: 1,
		filter: 1,
		fixture: 1,
		hidepassed: 1,
		maxDepth: 1,
		module: 1,
		moduleId: 1,
		notrycatch: 1,
		noglobals: 1,
		seed: 1,
		reorder: 1,
		requireExpects: 1,
		testId: 1,
		testTimeout: 1,
		scrolltop: 1
	};

	/*
	 * Retrieves information about the active version of an external component (e.g. qunit or sinon).
	 *
	 * The <code>config.version</code> property determines, which version of the component should be used.
	 * It can have one of the following values
	 * <ul>
	 * <li>an object value is assumed to contain the component info and is returned "as is"</li>
	 * <li>a falsy value (false, 0, null or "") disables the component and <code>null</code> is returned</li>
	 * <li>any other value must be the name of an entry in the <code>config.versions</code> map</li>
	 * </ul>
	 *
	 * If an entry in the <code>config.versions</code> map is not an object, it is assumed to be the name
	 * of another entry (aliasing). E.g. version "edge" usually will point to a concrete version like "2".
	 *
	 * <b>Note:</b> Aliasing can create infinite loops. No measure are taken to prevent or detect this.
	 *
	 * @param {object} config Configuration for all versions of the component
	 * @param {Object<string,object>} config.versions Map of configurations keyed by a version string
	 * @param {string|boolean|number|object} config.version Config to be used or version to be used or an alias or a boolean (enabled flag)
	 * @param {string} name Name of the external component (for error reporting only)
	 * @returns object|null Configuration t use or null if component is disabled
	 * @throws {TypeError}
	 */
	function getActiveVersion(componentConfig, componentName) {
		var versionsMap = componentConfig.versions;
		var version = componentConfig.version || null;

		while ( typeof version !== "object" ) {
			if ( !has(versionsMap, version) ) {
				throw new TypeError("unsupported " + componentName + " version " + componentConfig.version);
			}
			version = versionsMap[version];
		}
		return version;
	}

	function initTestModule(oConfig) {
		var pAfterLoader, pQUnit, pSinon, pSinonQUnitBridge, pSinonConfig, pCoverage, pTestEnv,
			oQUnitConfig, aJUnitDoneCallbacks;

		document.title = oConfig.title;

		// first configure the loader if needed
		if ( oConfig.loader ) {
			sap.ui.loader.config(oConfig.loader);
		}

		if ( oConfig.runAfterLoader ) {
			pAfterLoader = requireP( oConfig.runAfterLoader );
		} else {
			pAfterLoader = Promise.resolve();
		}

		oQUnitConfig = getActiveVersion(oConfig.qunit, "qunit");
		if ( oQUnitConfig != null ) {
			// QUnit configuration can be set in advance, we always disable the autostart
			window.QUnit = window.QUnit || {};
			QUnit.config = QUnit.config || {};
			if ( oConfig.qunit != null && typeof oConfig.qunit === 'object' ) {
				copyFiltered(QUnit.config, oConfig.qunit, QUNIT_KNOWN_OPTIONS);
			}
			QUnit.config.autostart = false;

			// now load qunitPause, QUnit, its CSS + the reporter bridge
			pQUnit = pAfterLoader.then(function () {
				return requireP("sap/ui/test/qunitPause");
			}).then(function () {
				utils.addStylesheet(oQUnitConfig.css);
				return requireP(oQUnitConfig.module);
			}).then(function() {

				// install a mock version of the qunit-reporter-junit API to collect jUnitDone callbacks
				aJUnitDoneCallbacks = [];
				QUnit.jUnitDone = function(cb) {
					aJUnitDoneCallbacks.push(cb);
				};
				return requireP("sap/ui/qunit/qunit-junit");
			}).then(function() {
				delete QUnit.jUnitDone;
				return requireP("sap/ui/thirdparty/qunit-reporter-junit");
			}).then(function() {
				// now register the collected callbacks with the real qunit-reporter-junit API
				aJUnitDoneCallbacks.forEach(function(cb) {
					QUnit.jUnitDone(cb);
				});
				aJUnitDoneCallbacks = undefined;
			});
		}

		var oSinonConfig = getActiveVersion(oConfig.sinon, "sinon");
		if ( oSinonConfig != null ) {
			pSinon = pAfterLoader.then(function() {
				return requireP(oSinonConfig.module);
			});

			if ( oConfig.sinon.qunitBridge && pQUnit ) {
				pSinonQUnitBridge = Promise.all([
					pQUnit,
					pSinon
				]).then(function() {
					return requireP(oSinonConfig.bridge);
				});
			}

			// sinon configuration must be applied only after sinon AND bridge have been loaded,
			// they both set their own defaults
			if ( oConfig.sinon != null && typeof oConfig.sinon === 'object' ) {
				pSinonConfig = Promise.all([
					pSinon,
					pSinonQUnitBridge
				]).then(function() {
					// copy only settings that are listed in sinon.defaultConfig
					sinon.config = copyFiltered(sinon.config || {}, oConfig.sinon, sinon.defaultConfig);
					return arguments;
				});
			}

		} else if ( oQUnitConfig != null ) {
			// shim dependencies for the bridges, based on the selected QUnit version
			// might be needed if tests load the bridge on their own
			sap.ui.loader.config({
				shim: {
					"sap/ui/thirdparty/sinon-qunit": {
						deps: [oQUnitConfig.module, "sap/ui/thirdparty/sinon"]
					},
					"sap/ui/qunit/sinon-qunit-bridge": {
						deps: [oQUnitConfig.module, "sap/ui/thirdparty/sinon-4"]
					}
				}
			});
		}

		pCoverage = pQUnit.then(function() {
			if ( QUnit.urlParams.coverage ) {
				// when coverage has been activated in a QUnit page via checkbox,
				// then load blanket, configure it, then load the QUnit plugin
				return requireP("sap/ui/thirdparty/blanket").then(function() {
					if ( oConfig.coverage && window.blanket ) {
						if (oConfig.coverage.only != null) {
							window.blanket.options("sap-ui-cover-only", oConfig.coverage.only);
						}
						if (oConfig.coverage.never != null) {
							window.blanket.options("sap-ui-cover-never", oConfig.coverage.never);
						}
						if (oConfig.coverage.branchTracking) {
							window.blanket.options("branchTracking", true);
						}
					}
					return requireP("sap/ui/qunit/qunit-coverage");
				}).then(function() {
					// when coverage is active, qunit-coverage sets autostart to true again
					QUnit.config.autostart = false;
				});
			} else {
				// otherwise load only the QUnit plugin
				return requireP(["sap/ui/qunit/qunit-coverage"]);
			}
		}).then(function() {
			// QUnit option CSP
			if ( QUnit.urlParams["sap-ui-xx-csp-policy"] ) {
				document.addEventListener("securitypolicyviolation", onCSPViolation);
				QUnit.done(function() {
					document.removeEventListener("securitypolicyviolation", onCSPViolation);
				});
			}
			QUnit.config.urlConfig.push({
				id: "sap-ui-xx-csp-policy",
				label: "CSP",
				value: {
					"sap-target-level-1:report-only": "Level 1",
					"sap-target-level-2:report-only": "Level 2"
				},
				tooltip: "What Content-Security-Policy should the server send"
			});
			// QUnit option repeat-to-failure
			if ( QUnit.urlParams["rtf"] || QUnit.urlParams["repeat-to-failure"]) {
				QUnit.done(function(results) {
					if (results.failed === 0) {
						setTimeout(function() {
							location.reload();
						}, 100);
					}
				});
			}
			QUnit.config.urlConfig.push({
				id: "repeat-to-failure",
				label: "Repeat",
				value: false,
				tooltip: "Whether this test should auto-repeat until it fails"
			});
		});

		pTestEnv = Promise.all([
			pAfterLoader,
			pQUnit,
			pSinon,
			pSinonQUnitBridge,
			pSinonConfig,
			pCoverage
		]);

		if ( oConfig.beforeBootstrap ) {
			pTestEnv = pTestEnv.then(function() {
				return requireP(oConfig.beforeBootstrap);
			});
		}

		// copy UI5 configuration
		window["sap-ui-config"] = oConfig.ui5 || {};
		if ( Array.isArray(window["sap-ui-config"].libs) ) {
			window["sap-ui-config"].libs = window["sap-ui-config"].libs.join(",");
		}

		// write test config to window
		// can be read by specific tests, e.g. tests in the generic test collection
		window["sap-ui-test-config"] = oConfig.testConfig || {};

		if ( oConfig.bootCore ) {
			pTestEnv = pTestEnv.then(function() {
				return new Promise(function(resolve, reject) {
					sap.ui.require(["sap/ui/core/Core"], function(core) {
						core.boot();
						core.attachInit(resolve);
					}, reject);
				});
			});
		}

		return pTestEnv.then(function() {
			if (oConfig.autostart) {
				// first load the tests, then ensure DOM then start tests
				return requireP( oConfig.module ). // Note: accepts single module or array
					then(function(aTestModules) {
						return Promise.all(aTestModules);
					}).then(function() {
						return ensureDOM();
					}).then(function() {
						// When using xx-waitForTheme=init the test starter also
						// takes care of waiting for additional stylesheets e.g. caused by
						// implicit loading of libs via test module dependencies.
						// Note: config option is internally converted to lowercase
						if (oConfig.ui5["xx-waitfortheme"] === "init") {
							return new Promise(function(resolve, reject) {
								sap.ui.require(["sap/ui/qunit/utils/waitForThemeApplied"], resolve, reject);
							}).then(function(waitForThemeApplied) {
								return waitForThemeApplied();
							});
						}
					}).then(function() {
						QUnit.start();
					});
			} else {
				// first ensure the DOM then load tests as tests will start QUnit already
				return ensureDOM().then(function() {
					return requireP( oConfig.module ). // Note: accepts single module or array
						then(function(aTestModules) {
							return Promise.all(aTestModules);
						});
				});
			}
		});

	}

	var oParams = UriParameters.fromQuery(window.location.search),
		sSuiteName = utils.getAttribute('data-sap-ui-testsuite') || oParams.get("testsuite"),
		sTestName = utils.getAttribute('data-sap-ui-test') || oParams.get("test");

	utils.getSuiteConfig(sSuiteName).then(function(oSuiteConfig) {
		var oTestConfig = oSuiteConfig.tests[sTestName];
		if (!oTestConfig) {
			throw new TypeError("Invalid test name");
		}

		return initTestModule(oTestConfig);
	}).catch(function(oErr) {
		console.error(oErr.stack || oErr); // eslint-disable-line no-console
		if ( typeof QUnit !== "undefined" ) {
			QUnit.test("Test Starter", function() {
				throw oErr;
			});
			QUnit.start();
		} else {
			utils.whenDOMReady().then(function() {
				document.body.style.color = "red";
				document.body.innerHTML = "<pre>" + utils.encode(oErr.stack || oErr.message || String(oErr)) + "</pre>";
			});
		}
	});

});
