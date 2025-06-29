/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

// Provides class sap.ui.core.Rendering
sap.ui.define([
	"sap/base/Log",
	"sap/ui/base/EventProvider",
	"sap/ui/performance/trace/Interaction",
	"sap/ui/performance/Measurement"
], function(
	Log,
	EventProvider,
	Interaction,
	Measurement
) {
	"use strict";

	/**
	 * A private logger instance used for 'debugRendering' logging.
	 *
	 * It can be activated by setting the URL parameter sap-ui-xx-debugRerendering to true.
	 * If activated, stack traces of invalidate() calls will be recorded and if new
	 * invalidations occur during rendering, they will be logged to the console together
	 * with the causing stack traces.
	 *
	 * @private
	 */
	var oRenderLog = Log.getLogger("sap.ui.Rendering",
			(
				// Note that the sap-ui-config option still is expected in camel case.
				// Lower case is only accepted here because of the config normalization which will be removed in future
				(window["sap-ui-config"] && (window["sap-ui-config"]["xx-debugRendering"] || window["sap-ui-config"]["xx-debugrendering"]) )
				|| /sap-ui-xx-debug(R|-r)endering=(true|x|X)/.test(document.location.search)
			) ? Log.Level.DEBUG : Math.min(Log.Level.INFO, Log.getLevel())
		);

	var MAX_RENDERING_ITERATIONS = 20;

	/**
	 * The ID of a timer that will execute the next rendering.
	 *
	 * A non-falsy value indicates that a timer exists already, or at least that no
	 * new timer needs to be created as. During the boot phase, this member is set
	 * to the special value <code>this</code> which is non-falsy and which should never
	 * represent a valid timer ID (no chance of misinterpretation).
	 */
	var _sRerenderTimer = this; //eslint-disable-line consistent-this

	var mUIAreas = {};

	/**
	 * Tasks that are called just before the rendering starts.
	 * @private
	 */
	var aPrerenderingTasks = [];

	var _oEventProvider = new EventProvider();

	var _bRendering = false;

	function _renderPendingUIUpdates(sCaller) {
		// start performance measurement
		Measurement.start("renderPendingUIUpdates","Render pending UI updates in all UIAreas");

		oRenderLog.debug("Render pending UI updates: start (" + (sCaller || "by timer" ) + ")");

		var bUIUpdated = false,
			bLooped = MAX_RENDERING_ITERATIONS > 0,
			iLoopCount = 0;

		_bRendering = true;

		do {

			if ( bLooped ) {
				// try to detect long running ('endless') rendering loops
				iLoopCount++;
				// if we run another iteration despite the tracking mode, we complain ourselves
				if ( iLoopCount > MAX_RENDERING_ITERATIONS ) {
					_bRendering = false;
					throw new Error("Rendering has been re-started too many times (" + iLoopCount + "). Add URL parameter sap-ui-xx-debugRendering=true for a detailed analysis.");
				}

				if ( iLoopCount > 1 ) {
					oRenderLog.debug("Render pending UI updates: iteration " + iLoopCount);
				}
			}

			// clear a pending timer so that the next call to re-render will create a new timer
			if (_sRerenderTimer) {
				if ( _sRerenderTimer !== this ) { // 'this' is used as a marker for a delayed initial rendering, no timer to cleanup then
					clearTimeout(_sRerenderTimer); // explicitly stop the timer, as this call might be a synchronous call (applyChanges) while still a timer is running
				}
				_sRerenderTimer = undefined;
				if (Rendering.aFnDone.length > 0) {
					Rendering.aFnDone.pop()();
				}
			}

			runPrerenderingTasks();

			var mUIAreasSnapshot = mUIAreas;
			mUIAreas = {};
			for (var sId in mUIAreasSnapshot) {
				bUIUpdated = mUIAreasSnapshot[sId].rerender() || bUIUpdated;
			}

		// eslint-disable-next-line no-unmodified-loop-condition
		} while ( bLooped && _sRerenderTimer ); // iterate if there are new rendering tasks

		_bRendering = false;

		// TODO: Provide information on what actually was re-rendered...
		if (bUIUpdated) {
			Rendering.fireUIUpdated();
		}

		oRenderLog.debug("Render pending UI updates: finished");

		// end performance measurement
		Measurement.end("renderPendingUIUpdates");
	}

	var Rendering = {
		// to protect against nested rendering we use an array of Steps instead of a single one
		aFnDone: [],

		/**
		 * Notify async Interaction step.
		 *
		 * @private
		 * @ui5-restricted sap.ui.core.Core
		 */
		notifyInteractionStep: function () {
			Rendering.aFnDone.push(Interaction.notifyAsyncStep());
		},

		/**
		 * Adds a task that is guaranteed to run once, just before the next rendering. A rendering
		 * request is not triggered.
		 *
		 * @param {function} fnPrerenderingTask
		 *   A function that is called before the rendering
		 * @param {boolean} [bFirst=false]
		 *   Whether the task should become the first one, not the last one
		 * @private
		 */
		addPrerenderingTask: function (fnPrerenderingTask, bFirst) {
			if (bFirst) {
				aPrerenderingTasks.unshift(fnPrerenderingTask);
			} else {
				aPrerenderingTasks.push(fnPrerenderingTask);
			}
		},
		/**
		 * Asks all UIAreas to execute any pending rendering tasks.
		 *
		 * The execution of rendering tasks might require multiple iterations
		 * until either no more rendering tasks are produced or until
		 * MAX_RENDERING_ITERATIONS are reached.
		 *
		 * With a value of MAX_RENDERING_ITERATIONS=0 the loop can be avoided
		 * and the remaining tasks are executed after another timeout.
		 *
		 * @param {string} sCaller The Caller id
		 * @private
		 */
		renderPendingUIUpdates: function(sCaller, iTimeout) {
			if (iTimeout !== undefined) {
				_sRerenderTimer = setTimeout(_renderPendingUIUpdates.bind(null, sCaller), iTimeout);
			} else {
				Rendering.aFnDone.push(Interaction.notifyAsyncStep());
				_renderPendingUIUpdates(sCaller);
			}
		},
		/**
		 * Returns <code>true</code> if there are any pending rendering tasks or when
		 * such rendering tasks are currently being executed.
		 *
		 * @return {boolean} true if there are pending (or executing) rendering tasks.
		 * @private
		 */
		getUIDirty: function() {
			return !!(_sRerenderTimer || _bRendering);
		},

		/**
		 * @name sap.ui.core.Core#UIUpdated
		 * @event
		 * @private
		 * @function
		 */

		attachUIUpdated: function(fnFunction, oListener) {
			_oEventProvider.attachEvent("UIUpdated", fnFunction, oListener);
		},

		detachUIUpdated: function(fnFunction, oListener) {
			_oEventProvider.detachEvent("UIUpdated", fnFunction, oListener);
		},

		fireUIUpdated: function(mParameters) {
			_oEventProvider.fireEvent("UIUpdated", mParameters);
		},

		/**
		 * Returns the internal rendering Logger.
		 *
		 * @returns {sap.base.Log} The Rendering logger
		 * @private
		 */
		getLogger: function() {
			return oRenderLog;
		},

		/**
		 * Registers an invalidated UIArea for rerendering.
		 *
		 * @param {sap.ui.core.UIArea} oUIArea The invalidated UIArea
		 * @private
		 */
		invalidateUIArea: function(oUIArea) {
			mUIAreas[oUIArea.getId()] = oUIArea;
			if ( !_sRerenderTimer ) {
				// TODO: we should handle xx-waitForTheme here...
				oRenderLog.debug("Registering timer for delayed re-rendering");
				// start async interaction step
				Rendering.aFnDone.push(Interaction.notifyAsyncStep());
				Rendering.renderPendingUIUpdates('invalidated UIArea', 0); // decoupled for collecting several invalidations into one redraw
			}
		}
	};

	/**
	 * Runs all prerendering tasks and resets the list.
	 * @private
	 */
	function runPrerenderingTasks() {
		var aTasks = aPrerenderingTasks.slice();

		aPrerenderingTasks = [];
		aTasks.forEach(function (fnPrerenderingTask) {
			fnPrerenderingTask();
		});
	}

	return Rendering;
});
