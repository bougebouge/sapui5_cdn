/*!
 * OpenUI5
 * (c) Copyright 2009-2024 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */

//Provides class sap.ui.model.odata.v4.ODataContextBinding
sap.ui.define([
	"./Context",
	"./ODataParentBinding",
	"./lib/_Cache",
	"./lib/_GroupLock",
	"./lib/_Helper",
	"sap/ui/base/SyncPromise",
	"sap/ui/model/Binding",
	"sap/ui/model/ChangeReason",
	"sap/ui/model/ContextBinding"
], function (Context, asODataParentBinding, _Cache, _GroupLock, _Helper, SyncPromise, Binding,
		ChangeReason, ContextBinding) {
	"use strict";

	var sClassName = "sap.ui.model.odata.v4.ODataContextBinding",
		mSupportedEvents = {
			AggregatedDataStateChange : true,
			change : true,
			dataReceived : true,
			dataRequested : true,
			DataStateChange : true,
			patchCompleted : true,
			patchSent : true
		},
		/**
		 * @alias sap.ui.model.odata.v4.ODataContextBinding
		 * @author SAP SE
		 * @class Context binding for an OData V4 model.
		 *   An event handler can only be attached to this binding for the following events:
		 *   'AggregatedDataStateChange', 'change', 'dataReceived', 'dataRequested',
		 *   'DataStateChange', 'patchCompleted', and 'patchSent'. For other events, an error is
		 *   thrown.
		 *
		 *   A context binding can also be used as an <i>operation binding</i> to support bound
		 *   actions, action imports, bound functions and function imports. If you want to control
		 *   the execution time of an operation, for example a function import named
		 *   "GetNumberOfAvailableItems", create a context binding for the path
		 *   "/GetNumberOfAvailableItems(...)" (as specified here, including the three dots). Such
		 *   an operation binding is <i>deferred</i>, meaning that it does not request
		 *   automatically, but only when you call {@link #execute}. {@link #refresh} is always
		 *   ignored for actions and action imports. For bound functions and function imports, it is
		 *   ignored if {@link #execute} has not yet been called. Afterwards it results in another
		 *   call of the function with the parameter values of the last execute.
		 *
		 *   The binding parameter for bound actions or bound functions may be given in the binding
		 *   path, for example "/SalesOrderList('42')/name.space.SalesOrder_Confirm". This can be
		 *   used if the exact entity for the binding parameter is known in advance. If you use a
		 *   relative binding instead, the operation path is a concatenation of the parent context's
		 *   canonical path and the deferred binding's path.
		 *
		 *   <b>Example</b>: You have a table with a list binding to "/SalesOrderList". In
		 *   each row you have a button to confirm the sales order, with the relative binding
		 *   "name.space.SalesOrder_Confirm(...)". Then the parent context for such a button
		 *   refers to an entity in "SalesOrderList", so its canonical path is
		 *   "/SalesOrderList('<i>SalesOrderID</i>')" and the resulting path for the action
		 *   is "/SalesOrderList('<i>SalesOrderID</i>')/name.space.SalesOrder_Confirm".
		 *
		 *   This also works if the relative path of the deferred operation binding starts with a
		 *   navigation property. Then this navigation property will be part of the operation's
		 *   resource path, which is still valid.
		 *
		 *   A deferred operation binding is not allowed to have another deferred operation binding
		 *   as parent.
		 *
		 * @extends sap.ui.model.ContextBinding
		 * @hideconstructor
		 * @mixes sap.ui.model.odata.v4.ODataParentBinding
		 * @public
		 * @since 1.37.0
		 * @version 1.108.28
		 *
		 * @borrows sap.ui.model.odata.v4.ODataBinding#getGroupId as #getGroupId
		 * @borrows sap.ui.model.odata.v4.ODataBinding#getRootBinding as #getRootBinding
		 * @borrows sap.ui.model.odata.v4.ODataBinding#getUpdateGroupId as #getUpdateGroupId
		 * @borrows sap.ui.model.odata.v4.ODataBinding#hasPendingChanges as #hasPendingChanges
		 * @borrows sap.ui.model.odata.v4.ODataBinding#isInitial as #isInitial
		 * @borrows sap.ui.model.odata.v4.ODataBinding#refresh as #refresh
		 * @borrows sap.ui.model.odata.v4.ODataBinding#requestRefresh as #requestRefresh
		 * @borrows sap.ui.model.odata.v4.ODataBinding#resetChanges as #resetChanges
		 * @borrows sap.ui.model.odata.v4.ODataBinding#toString as #toString
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#attachPatchCompleted as
		 *   #attachPatchCompleted
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#attachPatchSent as #attachPatchSent
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#changeParameters as #changeParameters
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#detachPatchCompleted as
		 *   #detachPatchCompleted
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#detachPatchSent as #detachPatchSent
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#resume as #resume
		 * @borrows sap.ui.model.odata.v4.ODataParentBinding#suspend as #suspend
		 */
		ODataContextBinding = ContextBinding.extend("sap.ui.model.odata.v4.ODataContextBinding", {
				constructor : constructor
			});

	/**
	 * Returns the path for the return value context. Supports bound operations on an entity or a
	 * collection.
	 *
	 * @param {string} sPath
	 *   The bindings's path; either a resolved model path or a resource path; for example:
	 *   "Artists(ArtistID='42',IsActiveEntity=true)/special.cases.EditAction(...)" or
	 *   "/Artists(ArtistID='42',IsActiveEntity=true)/special.cases.EditAction(...)" or
	 *   "Artists/special.cases.Create(...)" or "/Artists/special.cases.Create(...)"
	 * @param {string} sResponsePredicate The key predicate of the response entity
	 * @returns {string} The path for the return value context.
	 */
	function getReturnValueContextPath(sPath, sResponsePredicate) {
		var sBoundParameterPath = sPath.slice(0, sPath.lastIndexOf("/")),
			i = sBoundParameterPath.indexOf("(");

		return (i < 0 ? sBoundParameterPath : sPath.slice(0, i)) + sResponsePredicate;
	}

	//*********************************************************************************************
	// ODataContextBinding
	//*********************************************************************************************

	/**
	 * Do <strong>NOT</strong> call this private constructor, but rather use
	 * {@link sap.ui.model.odata.v4.ODataModel#bindContext} instead!
	 *
	 * @param {sap.ui.model.odata.v4.ODataModel} oModel
	 *   The OData V4 model
	 * @param {string} sPath
	 *   The binding path in the model; must not end with a slash
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @param {object} [mParameters]
	 *   Map of binding parameters
	 * @throws {Error}
	 *   If disallowed binding parameters are provided
	 */
	function constructor(oModel, sPath, oContext, mParameters) {
		var iPos = sPath.indexOf("(...)"),
			that = this;

		ContextBinding.call(this, oModel, sPath);
		// initialize mixin members
		asODataParentBinding.call(this);

		if (sPath.endsWith("/")) {
			throw new Error("Invalid path: " + sPath);
		}
		this.oOperation = undefined;
		this.oParameterContext = null;
		this.oReturnValueContext = null;
		if (iPos >= 0) { // deferred operation binding
			if (iPos !== this.sPath.length - /*"(...)".length*/5) {
				throw new Error(
					"The path must not continue after a deferred operation: " + this.sPath);
			}

			this.oOperation = {
				bAction : undefined,
				mChangeListeners : {}, // map from path to an array of change listeners
				mParameters : {},
				sResourcePath : undefined
			};
			if (!this.bRelative) {
				this.oParameterContext = Context.create(this.oModel, this,
					this.sPath + "/$Parameter");
			}
		}

		mParameters = _Helper.clone(mParameters) || {};
		// Note: needs this.oOperation
		this.checkBindingParameters(mParameters, ["$$canonicalPath", "$$groupId",
			"$$inheritExpandSelect", "$$ownRequest", "$$patchWithoutSideEffects",
			"$$updateGroupId"]);
		this.sGroupId = mParameters.$$groupId;
		this.bInheritExpandSelect = mParameters.$$inheritExpandSelect;
		this.sUpdateGroupId = mParameters.$$updateGroupId;

		this.applyParameters(mParameters);
		this.oElementContext = this.bRelative
			? null
			: Context.createNewContext(this.oModel, this, sPath);
		if (!this.oOperation
			&& (!this.bRelative || oContext && !oContext.fetchValue)) { // @see #isRoot
			// do this before #setContext fires an event!
			this.createReadGroupLock(this.getGroupId(), true);
		}
		this.setContext(oContext);
		oModel.bindingCreated(this);

		Promise.resolve().then(function () {
			// bInitial must be true initially, but false later. Then suspend on a just
			// created binding causes a change event on resume; otherwise further changes
			// on the suspended binding are required (see doSuspend)
			that.bInitial = false;
		});
	}

	asODataParentBinding(ODataContextBinding.prototype);

	/**
	 * Deletes the entity in <code>this.oElementContext</code>, identified by the edit URL.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} [oGroupLock]
	 *   A lock for the group ID to be used for the DELETE request; w/o a lock, no DELETE is sent.
	 *   For a transient entity, the lock is ignored (use NULL)!
	 * @param {string} sEditUrl
	 *   The entity's edit URL to be used for the DELETE request; w/o a lock, this is mostly
	 *   ignored.
	 * @param {sap.ui.model.odata.v4.Context} _oContext - ignored
	 * @param {object} [_oETagEntity] - ignored
	 * @param {boolean} [bDoNotRequestCount]
	 *   Whether not to request the new count from the server; useful in case of
	 *   {@link sap.ui.model.odata.v4.Context#replaceWith} where it is known that the count remains
	 *   unchanged; w/o a lock this should be true
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise which is resolved without a result in case of success, or rejected with an
	 *   instance of <code>Error</code> in case of failure.
	 * @throws {Error}
	 *   If the cache promise for this binding is not yet fulfilled, or if the cache is shared
	 *
	 * @private
	 */
	ODataContextBinding.prototype._delete = function (oGroupLock, sEditUrl, _oContext, _oETagEntity,
			bDoNotRequestCount) {
		// In case the context binding has an empty path, the respective context in the parent
		// needs to be removed as well. As there could be more levels of bindings pointing to the
		// same entity, first go up the binding hierarchy and find the context pointing to the same
		// entity in the highest level binding.
		// In case that top binding is a list binding, perform the deletion from there but use the
		// ETag of this binding.
		// In case the top binding is a context binding, perform the deletion from here but destroy
		// the context(s) in that uppermost binding. Note that no data may be available in the
		// uppermost context binding and hence the deletion would not work there, BCP 1980308439.
		var oEmptyPathParentContext = this._findEmptyPathParentContext(this.oElementContext),
			oEmptyPathParentBinding = oEmptyPathParentContext.getBinding(),
			oDeleteParentContext = oEmptyPathParentBinding.getContext(),
			oReturnValueContext = oEmptyPathParentBinding.oReturnValueContext,
			that = this;

		// In case the uppermost parent reached with empty paths is a list binding, delete there.
		if (!oEmptyPathParentBinding.execute) {
			return this.fetchValue("", undefined, true).then(function (oEntity) {
				// In the Cache, the request is generated with a reference to the entity data
				// first. So, hand over the complete entity to have the ETag of the correct binding
				// in the request.
				return oEmptyPathParentContext._delete(oGroupLock, oEntity, bDoNotRequestCount);
			});
			// fetchValue will fail if the entity has not been read. The same happens with the
			// deleteFromCache call below. In Context#delete the error is reported.
		}

		oEmptyPathParentBinding.oElementContext = null;
		if (oReturnValueContext) {
			oEmptyPathParentBinding.oReturnValueContext = null;
		}
		this._fireChange({reason : ChangeReason.Remove});
		return this.deleteFromCache(oGroupLock, sEditUrl, "", null).then(function () {
			oEmptyPathParentContext.destroy();
			if (oReturnValueContext) {
				oReturnValueContext.destroy();
			}
		}, function (oError) {
			if (!oEmptyPathParentBinding.isRelative()
					|| oDeleteParentContext === oEmptyPathParentBinding.getContext()) {
				oEmptyPathParentBinding.oElementContext = oEmptyPathParentContext;
				if (oReturnValueContext) {
					oEmptyPathParentBinding.oReturnValueContext = oReturnValueContext;
				}
				that._fireChange({reason : ChangeReason.Add});
			}
			throw oError;
		});
	};

	/**
	 * Calls the OData operation that corresponds to this operation binding.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID to be used for the request
	 * @param {map} mParameters
	 *   The parameter map at the time of the execute
	 * @param {boolean} [bIgnoreETag]
	 *   Whether the entity's ETag should be actively ignored (If-Match:*); supported for bound
	 *   actions only
	 * @param {function} [fnOnStrictHandlingFailed]
	 *   Callback for strict handling; supported for actions only
	 * @param {boolean} [bReplaceWithRVC]
	 *   Whether this operation binding's parent context, which must belong to a list binding, is
	 *   replaced with the operation's return value context (see below) and that new list context is
	 *   returned instead. Since 1.97.0.
	 * @returns {Promise}
	 *   A promise that is resolved without data or with a return value context when the operation
	 *   call succeeded, or rejected with an <code>Error</code> instance <code>oError</code> in case
	 *   of failure.
	 *
	 * @private
	 * @see #execute for details
	 */
	ODataContextBinding.prototype._execute = function (oGroupLock, mParameters, bIgnoreETag,
			fnOnStrictHandlingFailed, bReplaceWithRVC) {
		var oMetaModel = this.oModel.getMetaModel(),
			oOperationMetadata,
			oPromise,
			sResolvedPath = this.getResolvedPathWithReplacedTransientPredicates(),
			sResolvedMetaPath = _Helper.getMetaPath(sResolvedPath),
			that = this;

		/*
		 * Fires a "change" event and refreshes dependent bindings.
		 * @returns {sap.ui.base.SyncPromise} A promise resolving when the refresh is finished
		 */
		function fireChangeAndRefreshDependentBindings() {
			that._fireChange({reason : ChangeReason.Change});
			return that.refreshDependentBindings("", oGroupLock.getGroupId(), true);
		}

		oPromise = oMetaModel.fetchObject(sResolvedMetaPath + "/@$ui5.overload")
			.then(function (aOperationMetadata) {
				var fnGetEntity, iIndex, sPath;

				if (!aOperationMetadata) {
					oOperationMetadata = oMetaModel.getObject(sResolvedMetaPath);
					if (!oOperationMetadata || oOperationMetadata.$kind !== "NavigationProperty"
							|| !bReplaceWithRVC) {
						throw new Error("Unknown operation: " + sResolvedPath);
					}
				} else if (aOperationMetadata.length !== 1) {
					throw new Error("Expected a single overload, but found "
						+ aOperationMetadata.length + " for " + sResolvedPath);
				} else {
					oOperationMetadata = aOperationMetadata[0];
				}
				if (that.bRelative && that.oContext.getBinding) {
					iIndex = that.sPath.lastIndexOf("/");
					sPath = iIndex >= 0 ? that.sPath.slice(0, iIndex) : "";
					fnGetEntity = that.oContext.getValue.bind(that.oContext, sPath);
				}
				return that.createCacheAndRequest(oGroupLock, sResolvedPath, oOperationMetadata,
					mParameters, fnGetEntity, bIgnoreETag, fnOnStrictHandlingFailed);
			}).then(function (oResponseEntity) {
				return fireChangeAndRefreshDependentBindings().then(function () {
					var sContextPredicate, oOldValue, sResponsePredicate, oResult;

					if (that.isReturnValueLikeBindingParameter(oOperationMetadata)) {
						oOldValue = that.oContext.getValue();
						// Note: sContextPredicate missing e.g. when collection-bound
						sContextPredicate = oOldValue
							&& _Helper.getPrivateAnnotation(oOldValue, "predicate");
						sResponsePredicate = _Helper.getPrivateAnnotation(
							oResponseEntity, "predicate");

						if (sResponsePredicate) {
							if (sContextPredicate === sResponsePredicate) {
								// this is sync, because the entity to be patched is available in
								// the context (we already read its predicate)
								that.oContext.patch(oResponseEntity);
							}
							if (that.hasReturnValueContext()) {
								if (bReplaceWithRVC) {
									that.oCache = null;
									that.oCachePromise = SyncPromise.resolve(null);
									oResult = that.oContext.getBinding()
										.doReplaceWith(that.oContext, oResponseEntity,
											sResponsePredicate);
									oResult.setNewGeneration();

									return oResult;
								}

								that.oReturnValueContext = Context.createNewContext(that.oModel,
									that,
									getReturnValueContextPath(sResolvedPath, sResponsePredicate));
								// set the resource path for late property requests
								that.oCache.setResourcePath(
									that.oReturnValueContext.getPath().slice(1));

								return that.oReturnValueContext;
							}
						}
					}

					if (bReplaceWithRVC) {
						throw new Error("Cannot replace w/o return value context");
					}
				});
			}, function (oError) {
				// Note: operation metadata is only needed to handle server messages, it is
				// available if oError.error exists! If not nothing to do here.
				_Helper.adjustTargetsInError(oError, oOperationMetadata,
					that.oParameterContext.getPath(),
					that.bRelative ? that.oContext.getPath() : undefined);

				// Note: this must be done after the targets have been normalized, because otherwise
				// a child reports the messages from the error response with wrong targets
				return fireChangeAndRefreshDependentBindings().then(function () {
					throw oError;
				});
			}).catch(function (oError) {
				oGroupLock.unlock(true);
				that.oModel.reportError("Failed to execute " + sResolvedPath, sClassName, oError);
				throw oError;
			});

		return Promise.resolve(oPromise);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#adjustPredicate
	 */
	ODataContextBinding.prototype.adjustPredicate = function (sTransientPredicate, sPredicate) {
		asODataParentBinding.prototype.adjustPredicate.apply(this, arguments);
		if (this.mCacheQueryOptions) {
			// Note: this.oCache === null because of special case in #createAndSetCache
			this.fetchCache(this.oContext, true);
		}
		if (this.oElementContext) {
			this.oElementContext.adjustPredicate(sTransientPredicate, sPredicate);
		}
		// this.oReturnValueContext cannot have the transient predicate; it results from #execute
		// which is not possible with a transient predicate
	};

	/**
	 * Applies the given map of parameters to this binding's parameters.
	 *
	 * @param {object} mParameters
	 *   Map of binding parameters, {@link sap.ui.model.odata.v4.ODataModel#constructor}
	 * @param {sap.ui.model.ChangeReason} [sChangeReason]
	 *   A change reason (either <code>undefined</code> or <code>ChangeReason.Change</code>), only
	 *   used to distinguish calls by {@link #constructor} from calls by
	 *   {@link sap.ui.model.odata.v4.ODataParentBinding#changeParameters}
	 *
	 * @private
	 */
	ODataContextBinding.prototype.applyParameters = function (mParameters, sChangeReason) {
		this.mQueryOptions = this.oModel.buildQueryOptions(mParameters, true);
		this.mParameters = mParameters; // store mParameters at binding after validation

		if (this.isRootBindingSuspended()) {
			if (!this.oOperation) {
				this.sResumeChangeReason = ChangeReason.Change;
			}
		} else if (!this.oOperation) {
			this.fetchCache(this.oContext);
			if (sChangeReason) {
				this.refreshInternal("", undefined, true).catch(this.oModel.getReporter());
			}
		} else if (this.oOperation.bAction === false) {
			this.execute().catch(this.oModel.getReporter());
		}
	};

	/**
	 * The 'change' event is fired when the binding is initialized or its parent context is changed.
	 * It is to be used by controls to get notified about changes to the bound context of this
	 * context binding.
	 * Registered event handlers are called with the change reason as parameter.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {object} oEvent.getParameters()
	 * @param {sap.ui.model.ChangeReason} oEvent.getParameters().reason
	 *   The reason for the 'change' event could be
	 *   <ul>
	 *     <li> {@link sap.ui.model.ChangeReason.Change Change} when the binding is initialized,
	 *       when an operation has been processed (see {@link #execute}), or in {@link #resume} when
	 *       the binding has been modified while suspended,
	 *     <li> {@link sap.ui.model.ChangeReason.Refresh Refresh} when the binding is refreshed,
	 *     <li> {@link sap.ui.model.ChangeReason.Context Context} when the parent context is
	 *       changed,
	 *     <li> {@link sap.ui.model.ChangeReason.Remove Remove} when the element context has been
	 *       deleted (see {@link sap.ui.model.odata.v4.Context#delete}).
	 *   </ul>
	 *
	 * @event sap.ui.model.odata.v4.ODataContextBinding#change
	 * @public
	 * @since 1.37.0
	 */

	/**
	 * The 'dataReceived' event is fired after the back-end data has been processed. It is only
	 * fired for GET requests. The 'dataReceived' event is to be used by applications, for example
	 * to switch off a busy indicator or to process an error. In case of a deferred operation
	 * binding, 'dataReceived' is not fired: Whatever should happen in the event handler attached
	 * to that event, can instead be done once the <code>oPromise</code> returned by
	 * {@link #execute} fulfills or rejects (using <code>oPromise.then(function () {...}, function
	 * () {...})</code>).
	 *
	 * If back-end requests are successful, the event has almost no parameters. For compatibility
	 * with {@link sap.ui.model.Binding#event:dataReceived}, an event parameter
	 * <code>data : {}</code> is provided: "In error cases it will be undefined", but otherwise it
	 * is not. Use the binding's bound context via
	 * {@link #getBoundContext oEvent.getSource().getBoundContext()} to access the response data.
	 * Note that controls bound to this data may not yet have been updated, meaning it is not safe
	 * for registered event handlers to access data via control APIs.
	 *
	 * If a back-end request fails, the 'dataReceived' event provides an <code>Error</code> in the
	 * 'error' event parameter.
	 *
	 * Since 1.106 this event is bubbled up to the model, unless a listener calls
	 * {@link sap.ui.base.Event#cancelBubble oEvent.cancelBubble()}.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {function} oEvent.cancelBubble
	 *   A callback function to prevent that the event is bubbled up to the model
	 * @param {object} oEvent.getParameters()
	 * @param {object} [oEvent.getParameters().data]
	 *   An empty data object if a back-end request succeeds
	 * @param {Error} [oEvent.getParameters().error] The error object if a back-end request failed.
	 *   If there are multiple failed back-end requests, the error of the first one is provided.
	 *
	 * @event sap.ui.model.odata.v4.ODataContextBinding#dataReceived
	 * @public
	 * @see sap.ui.model.odata.v4.ODataModel#event:dataReceived
	 * @since 1.37.0
	 */

	/**
	 * The 'dataRequested' event is fired directly after data has been requested from a back end.
	 * It is only fired for GET requests. The 'dataRequested' event is to be used by
	 * applications, for example to switch on a busy indicator. Registered event handlers are
	 * called without parameters. In case of a deferred operation binding, 'dataRequested' is not
	 * fired: Whatever should happen in the event handler attached to that event, can instead be
	 * done before calling {@link #execute}.
	 *
	 * Since 1.106 this event is bubbled up to the model, unless a listener calls
	 * {@link sap.ui.base.Event#cancelBubble oEvent.cancelBubble()}.
	 *
	 * @param {sap.ui.base.Event} oEvent
	 * @param {function} oEvent.cancelBubble
	 *   A callback function to prevent that the event is bubbled up to the model
	 *
	 * @event sap.ui.model.odata.v4.ODataContextBinding#dataRequested
	 * @public
	 * @see sap.ui.model.odata.v4.ODataModel#event:dataRequested
	 * @since 1.37.0
	 */

	/**
	 * The 'patchCompleted' event is fired when the back end has responded to the last PATCH
	 * request for this binding. If there is more than one PATCH request in a $batch, the event is
	 * fired only once. Only bindings using an own data service request fire a 'patchCompleted'
	 * event. For each 'patchSent' event, a 'patchCompleted' event is fired.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataContextBinding} oEvent.getSource() This binding
	 * @param {object} oEvent.getParameters() Object containing all event parameters
	 * @param {boolean} oEvent.getParameters().success
	 *   Whether all PATCHes are successfully processed
	 *
	 * @event sap.ui.model.odata.v4.ODataContextBinding#patchCompleted
	 * @public
	 * @since 1.59.0
	 */

	/**
	 * The 'patchSent' event is fired when the first PATCH request for this binding is sent to the
	 * back end. If there is more than one PATCH request in a $batch, the event is fired only once.
	 * Only bindings using an own data service request fire a 'patchSent' event. For each
	 * 'patchSent' event, a 'patchCompleted' event is fired.
	 *
	 * @param {sap.ui.base.Event} oEvent The event object
	 * @param {sap.ui.model.odata.v4.ODataContextBinding} oEvent.getSource() This binding
	 *
	 * @event sap.ui.model.odata.v4.ODataContextBinding#patchSent
	 * @public
	 * @since 1.59.0
	 */

	/**
	 * See {@link sap.ui.base.EventProvider#attachEvent}
	 *
	 * @param {string} sEventId The identifier of the event to listen for
	 * @param {object} [_oData]
	 * @param {function} [_fnFunction]
	 * @param {object} [_oListener]
	 * @returns {this} <code>this</code> to allow method chaining
	 *
	 * @public
	 * @see sap.ui.base.EventProvider#attachEvent
	 * @since 1.37.0
	 */
	// @override sap.ui.base.EventProvider#attachEvent
	ODataContextBinding.prototype.attachEvent = function (sEventId, _oData, _fnFunction,
			_oListener) {
		if (!(sEventId in mSupportedEvents)) {
			throw new Error("Unsupported event '" + sEventId
				+ "': v4.ODataContextBinding#attachEvent");
		}
		return ContextBinding.prototype.attachEvent.apply(this, arguments);
	};

	/**
	 * Returns this operation binding's cache query options.
	 *
	 * @returns {object} The query options
	 *
	 * @private
	 */
	ODataContextBinding.prototype.computeOperationQueryOptions = function () {
		return Object.assign({}, this.oModel.mUriParameters, this.getQueryOptionsFromParameters());
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#checkKeepAlive
	 */
	ODataContextBinding.prototype.checkKeepAlive = function () {
		throw new Error("Unsupported " + this);
	};

	/**
	 * Creates a single cache for an operation and sends a GET/POST request.
	 *
	 * @param {sap.ui.model.odata.v4.lib._GroupLock} oGroupLock
	 *   A lock for the group ID to be used for the request
	 * @param {string} sPath
	 *   The absolute binding path to the bound operation or operation import, e.g.
	 *   "/Entity('0815')/bound.Operation(...)" or "/OperationImport(...)"
	 * @param {object} oOperationMetadata
	 *   The operation's metadata
	 * @param {map} mParameters
	 *   The parameter map at the time of the execute
	 * @param {function} [fnGetEntity]
	 *   An optional function which may be called to access the existing entity data (if already
	 *   loaded) in case of a bound operation
	 * @param {boolean} [bIgnoreETag]
	 *   Whether the entity's ETag should be actively ignored (If-Match:*); supported for bound
	 *   actions only
	 * @param {function} [fnOnStrictHandlingFailed]
	 *   Callback for strict handling; supported for actions only
	 * @returns {SyncPromise}
	 *   The request promise
	 * @throws {Error} If
	 *   <ul>
	 *    <li> the given metadata is neither an "Action" nor a "Function" nor a
	 *      "NavigationProperty",
	 *    <li> a collection-valued parameter for an operation other than a V4 action is encountered,
	 *    <li> <code>bIgnoreETag</code> is used for an operation other than a bound action,
	 *    <li> <code>fnOnStrictHandlingFailed</code> is given but the given metadata is not an
	 *         "Action",
	 *    <li> a navigation property is used with operation parameters
	 *   </ul>
	 *
	 * @private
	 */
	ODataContextBinding.prototype.createCacheAndRequest = function (oGroupLock, sPath,
		oOperationMetadata, mParameters, fnGetEntity, bIgnoreETag, fnOnStrictHandlingFailed) {
		var bAction = oOperationMetadata.$kind === "Action",
			oCache,
			vEntity = fnGetEntity,
			oModel = this.oModel,
			sMetaPath = _Helper.getMetaPath(sPath),
			sOriginalResourcePath = sPath.slice(1),
			oRequestor = oModel.oRequestor,
			that = this;

		/*
		 * Returns the original resource path to be used for bound messages.
		 *
		 * @param {object} The response entity
		 * @returns {string} The original resource path
		 */
		function getOriginalResourcePath(oResponseEntity) {
			if (that.isReturnValueLikeBindingParameter(oOperationMetadata)) {
				if (that.hasReturnValueContext()) {
					return getReturnValueContextPath(sOriginalResourcePath,
						_Helper.getPrivateAnnotation(oResponseEntity, "predicate"));
				}
				if (_Helper.getPrivateAnnotation(vEntity, "predicate")
						=== _Helper.getPrivateAnnotation(oResponseEntity, "predicate")) {
					// return value is *same* as binding parameter: attach messages to the latter
					return sOriginalResourcePath.slice(0, sOriginalResourcePath.lastIndexOf("/"));
				}
			}

			return sOriginalResourcePath;
		}

		/*
		 * Calls back into the application with the messages whether to repeat the action.
		 * @param {Error} oError The error from the failed request
		 * @returns {Promise} A promise resolving with a boolean
		 * @throws {Error} If <code>fnOnStrictHandlingFailed</code> does not return a promise
		 */
		function onStrictHandling(oError) {
			var oResult;

			_Helper.adjustTargetsInError(oError, oOperationMetadata,
				that.oParameterContext.getPath(),
				that.bRelative ? that.oContext.getPath() : undefined);
			oError.error.$ignoreTopLevel = true;

			oResult = fnOnStrictHandlingFailed(
				_Helper.extractMessages(oError).map(function (oRawMessage) {
					return that.oModel.createUI5Message(oRawMessage);
				})
			);

			if (!(oResult instanceof Promise)) {
				throw new Error("Not a promise: " + oResult);
			}
			return oResult;
		}

		if (fnOnStrictHandlingFailed && oOperationMetadata.$kind !== "Action") {
			throw new Error("Not an action: " + sPath);
		}
		if (!bAction && oOperationMetadata.$kind !== "Function"
				&& oOperationMetadata.$kind !== "NavigationProperty") {
			throw new Error("Not an operation: " + sPath);
		}
		if (bAction && fnGetEntity) {
			vEntity = fnGetEntity();
		}
		if (bIgnoreETag && !(bAction && oOperationMetadata.$IsBound && vEntity)) {
			throw new Error("Not a bound action: " + sPath);
		}
		if (this.bInheritExpandSelect
			&& !this.isReturnValueLikeBindingParameter(oOperationMetadata)) {
			throw new Error("Must not set parameter $$inheritExpandSelect on this binding");
		}
		if (oOperationMetadata.$kind !== "NavigationProperty") {
			sMetaPath += "/@$ui5.overload/0/$ReturnType";
			if (oOperationMetadata.$ReturnType
					&& !oOperationMetadata.$ReturnType.$Type.startsWith("Edm.")) {
				sMetaPath += "/$Type";
			}
		} else if (!_Helper.isEmptyObject(mParameters)) {
			throw new Error("Unsupported parameters for navigation property");
		}

		if (that.oReturnValueContext) {
			that.oReturnValueContext.destroy();
			that.oReturnValueContext = null;
		}
		this.oOperation.bAction = bAction;
		this.oOperation.mRefreshParameters = mParameters;
		mParameters = Object.assign({}, mParameters);
		this.mCacheQueryOptions = this.computeOperationQueryOptions();
		// Note: in case of NavigationProperty, this just removes "(...)"
		sPath = oRequestor.getPathAndAddQueryOptions(sPath, oOperationMetadata, mParameters,
			this.mCacheQueryOptions, vEntity);
		oCache = _Cache.createSingle(oRequestor, sPath, this.mCacheQueryOptions,
			oModel.bAutoExpandSelect, oModel.bSharedRequests, getOriginalResourcePath, bAction,
			sMetaPath);
		this.oCache = oCache;
		this.oCachePromise = SyncPromise.resolve(oCache);

		return bAction
			? oCache.post(oGroupLock, mParameters, vEntity, bIgnoreETag,
				fnOnStrictHandlingFailed && onStrictHandling)
			: oCache.fetchValue(oGroupLock);
	};

	/**
	 * Destroys the object. The object must not be used anymore after this function was called.
	 *
	 * @public
	 * @see sap.ui.model.Binding#destroy
	 * @since 1.40.1
	 */
	// @override sap.ui.model.Binding#destroy
	ODataContextBinding.prototype.destroy = function () {
		if (this.oElementContext) {
			this.oElementContext.destroy();
			this.oElementContext = undefined;
		}
		if (this.oParameterContext) {
			this.oParameterContext.destroy();
			this.oParameterContext = undefined;
		}
		if (this.oReturnValueContext) {
			this.oReturnValueContext.destroy();
			this.oReturnValueContext = undefined;
		}
		this.oModel.bindingDestroyed(this);
		this.oOperation = undefined;
		this.mParameters = undefined;
		this.mQueryOptions = undefined;

		asODataParentBinding.prototype.destroy.call(this);
		ContextBinding.prototype.destroy.call(this);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#doCreateCache
	 */
	ODataContextBinding.prototype.doCreateCache = function (sResourcePath, mQueryOptions, _oContext,
			sDeepResourcePath) {
		return _Cache.createSingle(this.oModel.oRequestor, sResourcePath, mQueryOptions,
			this.oModel.bAutoExpandSelect, this.oModel.bSharedRequests, sDeepResourcePath);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#doDeregisterChangeListener
	 */
	ODataContextBinding.prototype.doDeregisterChangeListener = function (sPath, oListener) {
        var sRelativePath;

		if (this.oOperation) {
			sRelativePath = _Helper.getRelativePath(sPath, this.oParameterContext.getPath());
			if (sRelativePath !== undefined) {
				_Helper.removeByPath(this.oOperation.mChangeListeners, sRelativePath, oListener);
				return;
			}
		}
		asODataParentBinding.prototype.doDeregisterChangeListener.apply(this, arguments);
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#doFetchOrGetQueryOptions
	 */
	ODataContextBinding.prototype.doFetchOrGetQueryOptions = function (oContext) {
		return this.fetchResolvedQueryOptions(oContext);
	};

	/**
	 * Handles setting a parameter property in case of a deferred operation binding, otherwise it
	 * returns <code>undefined</code>.
	 */
	// @override sap.ui.model.odata.v4.ODataParentBinding#doSetProperty
	ODataContextBinding.prototype.doSetProperty = function (sPath, vValue, oGroupLock) {
		if (this.oOperation && (sPath === "$Parameter" || sPath.startsWith("$Parameter/"))) {
			_Helper.updateAll(this.oOperation.mChangeListeners, "", this.oOperation.mParameters,
				_Cache.makeUpdateData(sPath.split("/").slice(1), vValue));
			this.oOperation.bAction = undefined; // "not yet executed"
			if (oGroupLock) {
				oGroupLock.unlock();
			}
			return SyncPromise.resolve();
		}
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#doSuspend
	 */
	ODataContextBinding.prototype.doSuspend = function () {
		if (this.bInitial && !this.oOperation) {
			// if the binding is still initial, it must fire an event in resume
			this.sResumeChangeReason = ChangeReason.Change;
		}
	};

	/**
	 * Calls the OData operation that corresponds to this operation binding.
	 *
	 * Parameters for the operation must be set via {@link #setParameter} beforehand.
	 *
	 * The value of this binding is the result of the operation. To access a result of primitive
	 * type, bind a control to the path "value", for example
	 * <code>&lt;Text text="{value}"/></code>. If the result has a complex or entity type, you
	 * can bind properties as usual, for example <code>&lt;Text text="{street}"/></code>.
	 *
	 * Since 1.98.0, a single-valued navigation property can be treated like a function if
	 * <ul>
	 *   <li> it has the same type as the operation binding's parent context,
	 *   <li> that parent context is in a list binding for a top-level entity set,
	 *   <li> there is a navigation property binding which points to that same entity set,
	 *   <li> no operation parameters have been set,
	 *   <li> the <code>bReplaceWithRVC</code> parameter is used.
	 * </ul>
	 *
	 * @param {string} [sGroupId]
	 *   The group ID to be used for the request; if not specified, the group ID for this binding is
	 *   used, see {@link sap.ui.model.odata.v4.ODataContextBinding#constructor} and
	 *   {@link #getGroupId}. To use the update group ID, see {@link #getUpdateGroupId}, it needs to
	 *   be specified explicitly.
	 *   Valid values are <code>undefined</code>, '$auto', '$auto.*', '$direct' or application group
	 *   IDs as specified in {@link sap.ui.model.odata.v4.ODataModel}.
	 * @param {boolean} [bIgnoreETag]
	 *   Whether the entity's ETag should be actively ignored (If-Match:*); supported for bound
	 *   actions only, since 1.90.0. Ignored if there is no ETag (since 1.93.0).
	 * @param {function} [fnOnStrictHandlingFailed]
	 *   If this callback is given for an action, the preference "handling=strict" is applied. If
	 *   the service responds with the HTTP status code 412 and a
	 *   "Preference-applied: handling=strict" header, the details from the OData error response are
	 *   extracted and passed to the callback as an array of {@link sap.ui.core.message.Message}
	 *   items. The callback has to return a <code>Promise</code> resolving with a
	 *   <code>boolean</code> value in order to indicate whether the bound action should either be
	 *   repeated <b>without</b> applying the preference or rejected with an <code>Error</code>
	 *   instance <code>oError</code> where <code>oError.canceled === true</code>.
	 *   Since 1.92.0.
	 * @param {boolean} [bReplaceWithRVC]
	 *   Whether this operation binding's parent context, which must belong to a list binding, is
	 *   replaced with the operation's return value context (see below) and that list context is
	 *   returned instead. That list context may be a newly created context or an existing context.
	 *   A newly created context has the same <code>keepAlive</code> attribute and
	 *   <code>fnOnBeforeDestroy</code> function as the parent context, see
	 *   {@link sap.ui.model.odata.v4.Context#setKeepAlive}; <code>fnOnBeforeDestroy</code> will be
	 *   called with the new context instance as the only argument in this case. An existing context
	 *   does not change its <code>keepAlive</code> attribute. In any case, the resulting context
	 *   takes the place (index, position) of the parent context (see
	 *   {@link sap.ui.model.odata.v4.Context#getIndex}), which need not be in the collection
	 *   currently if it is {@link sap.ui.model.odata.v4.Context#isKeepAlive kept alive}. If the
	 *   parent context has requested messages when it was kept alive, they will be inherited if the
	 *   $$inheritExpandSelect binding parameter is set to <code>true</code>. Since 1.97.0.
	 * @returns {Promise}
	 *   A promise that is resolved without data or with a return value context when the operation
	 *   call succeeded, or rejected with an <code>Error</code> instance <code>oError</code> in case
	 *   of failure, for instance if the operation metadata is not found, if overloading is not
	 *   supported, if a collection-valued function parameter is encountered, or if
	 *   <code>bIgnoreETag</code> is used for an operation other than a bound action. It is also
	 *   rejected if <code>fnOnStrictHandlingFailed</code> is supplied and
	 *   <ul>
	 *    <li> is used for an operation other than an action,
	 *    <li> another request that applies the preference "handling=strict" exists in a different
	 *      change set of the same $batch request,
	 *    <li> it does not return a <code>Promise</code>,
	 *    <li> returns a <code>Promise</code> that resolves with <code>false</code>. In this case
	 *      <code>oError.canceled === true</code>.
	 *   </ul>
	 *   It is also rejected if <code>bReplaceWithRVC</code> is supplied, and there is no return
	 *   value context at all or the existing context as described above is currently part of the
	 *   list's collection (that is, has an index).<br>
	 *   A return value context is a {@link sap.ui.model.odata.v4.Context} which represents a bound
	 *   operation response. It is created only if the operation is bound and has a single entity
	 *   return value from the same entity set as the operation's binding parameter and has a
	 *   parent context which is a {@link sap.ui.model.odata.v4.Context} and points to an entity
	 *   from an entity set. It is destroyed the next time this operation binding is executed again!
	 *   <br>
	 *   If a return value context is created, it must be used instead of
	 *   <code>this.getBoundContext()</code>. All bound messages will be related to the return value
	 *   context only. Such a message can only be connected to a corresponding control if the
	 *   control's property bindings use the return value context as binding context.
	 * @throws {Error} If
	 *   <ul>
	 *     <li> the binding's root binding is suspended,
	 *     <li> the given group ID is invalid,
	 *     <li> the binding is not a deferred operation binding (see
	 *       {@link sap.ui.model.odata.v4.ODataContextBinding}),
	 *     <li> the binding is unresolved (see
	 *       {@link sap.ui.model.Binding#isResolved})
	 *     <li> the binding is relative to a transient context (see
	 *       {@link sap.ui.model.odata.v4.Context#isTransient}),
	 *     <li> deferred operation bindings are nested,
	 *     <li> the OData resource path for a deferred operation binding's context cannot be
	 *       determined,
	 *     <li> <code>bReplaceWithRVC</code> is given, but this operation binding is not relative to
	 *       a row context of a list binding which uses the <code>$$ownRequest</code> parameter (see
	 *       {@link sap.ui.model.odata.v4.ODataModel#bindList}) and no data aggregation (see
	 *       {@link sap.ui.model.odata.v4.ODataListBinding#setAggregation}).
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataContextBinding.prototype.execute = function (sGroupId, bIgnoreETag,
			fnOnStrictHandlingFailed, bReplaceWithRVC) {
		var sResolvedPath = this.getResolvedPath();

		this.checkSuspended();
		_Helper.checkGroupId(sGroupId);
		if (!this.oOperation) {
			throw new Error("The binding must be deferred: " + this.sPath);
		}
		if (this.bRelative) {
			if (!sResolvedPath) {
				throw new Error("Unresolved binding: " + this.sPath);
			}
			if (this.oContext.isTransient && this.oContext.isTransient()) {
				throw new Error("Execute for transient context not allowed: " + sResolvedPath);
			}
			if (this.oContext.getPath().includes("(...)")) {
				throw new Error("Nested deferred operation bindings not supported: "
					+ sResolvedPath);
			}
			if (bReplaceWithRVC) {
				if (!this.oContext.getBinding) {
					throw new Error("Cannot replace this parent context: " + this.oContext);
				} // Note: parent context need not have a key predicate!
				this.oContext.getBinding().checkKeepAlive(this.oContext);
			}
		} else if (bReplaceWithRVC) {
			throw new Error("Cannot replace when operation is not relative");
		}

		return this._execute(this.lockGroup(sGroupId, true),
			_Helper.publicClone(this.oOperation.mParameters, true), bIgnoreETag,
				fnOnStrictHandlingFailed, bReplaceWithRVC);
	};

	/**
	 * Requests the value for the given path; the value is requested from this binding's
	 * cache or from its context in case it has no cache. For a suspended binding, requesting the
	 * value is canceled by throwing a "canceled" error.
	 *
	 * @param {string} sPath
	 *   Some absolute path
	 * @param {sap.ui.model.odata.v4.ODataPropertyBinding} [oListener]
	 *   A property binding which registers itself as listener at the cache
	 * @param {boolean} [bCached]
	 *   Whether to return cached values only and not trigger a request
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise on the outcome of the cache's <code>fetchValue</code> call; it is rejected in
	 *   case cached values are asked for, but not found, or if the cache is no longer the active
	 *   cache when the response arrives
	 * @throws {Error} If the binding's root binding is suspended, a "canceled" error is thrown
	 *
	 * @private
	 */
	ODataContextBinding.prototype.fetchValue = function (sPath, oListener, bCached) {
		var oCachePromise = bCached && this.oCache !== undefined
				? SyncPromise.resolve(this.oCache)
				: this.oCachePromise,
			oError,
			oRootBinding = this.getRootBinding(),
			that = this;

		// dependent binding will update its value when the suspended binding is resumed
		if (oRootBinding && oRootBinding.isSuspended()) {
			oError = new Error("Suspended binding provides no value");
			oError.canceled = "noDebugLog";
			throw oError;
		}
		return oCachePromise.then(function (oCache) {
			var bPreventBubbling,
				bDataRequested = false,
				oGroupLock,
				sResolvedPath = that.getResolvedPath(),
				sRelativePath = oCache || that.oOperation
					? that.getRelativePath(sPath)
					: undefined,
				aSegments,
				vValue;

			if (that.oOperation) {
				if (sRelativePath === undefined) {
					// a reduced path to a property of the binding parameter
					return that.oContext.fetchValue(sPath, oListener, bCached);
				}
				aSegments = sRelativePath.split("/");
				if (aSegments[0] === "$Parameter") {
					if (aSegments.length === 1) {
						return undefined;
					}
					_Helper.addByPath(that.oOperation.mChangeListeners,
						sRelativePath.slice(/*"$Parameter/".length*/11), oListener);

					vValue = _Helper.drillDown(that.oOperation.mParameters, aSegments.slice(1));

					return vValue === undefined ? null : vValue;
				}
			}

			if (oCache && sRelativePath !== undefined) {
				if (bCached) {
					oGroupLock = _GroupLock.$cached;
				} else {
					oGroupLock = that.oReadGroupLock || that.lockGroup();
					that.oReadGroupLock = undefined;
				}
				bPreventBubbling = that.isRefreshWithoutBubbling();

				return that.resolveRefreshPromise(
					oCache.fetchValue(oGroupLock, sRelativePath, function () {
						bDataRequested = true;
						that.fireDataRequested(bPreventBubbling);
					}, oListener)
				).then(function (vValue) {
					that.assertSameCache(oCache);

					return vValue;
				}).then(function (vValue) {
					if (bDataRequested) {
						that.fireDataReceived({data : {}}, bPreventBubbling);
					}
					return vValue;
				}, function (oError) {
					oGroupLock.unlock(true);
					if (bDataRequested) {
						that.oModel.reportError("Failed to read path " + sResolvedPath, sClassName,
							oError);
						that.fireDataReceived(oError.canceled ? {data : {}} : {error : oError},
							bPreventBubbling);
					}
					throw oError;
				});
			}

			if (!that.oOperation && that.oContext) {
				return that.oContext.fetchValue(sPath, oListener, bCached);
			}
		});
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#findContextForCanonicalPath
	 */
	ODataContextBinding.prototype.findContextForCanonicalPath = function (sCanonicalPath) {
		var oContext = this.oOperation ? this.oReturnValueContext : this.oElementContext,
			oEntity,
			oPromise;

		if (oContext) {
			oEntity = oContext.getValue();

			// avoid problems in fetchCanonicalPath (leading to an ODM#reportError)
			if (oEntity && _Helper.hasPrivateAnnotation(oEntity, "predicate")) {
				oPromise = oContext.fetchCanonicalPath();
				oPromise.caught();
				if (oPromise.getResult() === sCanonicalPath) {
					return oContext;
				}
			}
		}
	};

	/**
	 * Returns the bound context.
	 *
	 * @returns {sap.ui.model.odata.v4.Context}
	 *   The bound context
	 *
	 * @function
	 * @name sap.ui.model.odata.v4.ODataContextBinding#getBoundContext
	 * @public
	 * @since 1.39.0
	 */

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#getDependentBindings
	 */
	ODataContextBinding.prototype.getDependentBindings = function () {
		return this.oModel.getDependentBindings(this);
	};

	/**
	 * Returns the context pointing to the parameters of a deferred operation binding.
	 *
	 * @returns {sap.ui.model.odata.v4.Context}
	 *   The parameter context
	 * @throws {Error}
	 *   If the binding is not a deferred operation binding (see
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding})
	 *
	 * @public
	 * @since 1.73.0
	 */
	ODataContextBinding.prototype.getParameterContext = function () {
		if (!this.oOperation) {
			throw new Error("Not a deferred operation binding: " + this);
		}
		return this.oParameterContext;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#getQueryOptionsFromParameters
	 */
	ODataContextBinding.prototype.getQueryOptionsFromParameters = function () {
		var mInheritableQueryOptions,
			mQueryOptions = this.mQueryOptions;

		if (this.bInheritExpandSelect) {
			mInheritableQueryOptions = this.oContext.getBinding().getInheritableQueryOptions();
			mQueryOptions = Object.assign({}, mQueryOptions);
			// keep $select before $expand
			if ("$select" in mInheritableQueryOptions) {
				// avoid that this.mQueryOptions.$select is modified
				mQueryOptions.$select = mQueryOptions.$select && mQueryOptions.$select.slice();
				_Helper.addToSelect(mQueryOptions, mInheritableQueryOptions.$select);
			}
			if ("$expand" in mInheritableQueryOptions) {
				mQueryOptions.$expand = mInheritableQueryOptions.$expand;
			}
		}

		return mQueryOptions;
	};

	/**
	 * Returns the resolved path, replacing all occurrences of transient predicates with the
	 * corresponding key predicates.
	 *
	 * @returns {string}
	 *   The resolved path with replaced transient predicates
	 * @throws {Error}
	 *   If an entity related to a segment with a transient predicate does not have a key predicate
	 *
	 * @private
	 */
	ODataContextBinding.prototype.getResolvedPathWithReplacedTransientPredicates = function () {
		var sPath = "",
			sResolvedPath = this.getResolvedPath(),
			aSegments,
			that = this;

		if (sResolvedPath && sResolvedPath.includes("($uid=")) {
			aSegments = sResolvedPath.slice(1).split("/");
			sResolvedPath = "";
			aSegments.forEach(function (sSegment) {
				var oEntity, sPredicate, iTransientPredicate;

				sPath += "/" + sSegment;
				iTransientPredicate = sSegment.indexOf("($uid=");
				if (iTransientPredicate >= 0) {
					oEntity = that.oContext.getValue(sPath);
					sPredicate = oEntity && _Helper.getPrivateAnnotation(oEntity, "predicate");
					if (!sPredicate) {
						throw new Error("No key predicate known at " + sPath);
					}
					sResolvedPath += "/" + sSegment.slice(0, iTransientPredicate) + sPredicate;
				} else {
					sResolvedPath += "/" + sSegment;
				}
			});
		}
		return sResolvedPath;
	};

	/**
	 * Determines whether an operation binding creates a return value context on {@link #execute}.
	 * The following conditions must hold for a return value context to be created:
	 * 1. Operation is bound.
	 * 2. Operation has single entity return value. Note: existence of EntitySetPath
	 *    implies the return value is an entity or a collection thereof;
	 *    see OData V4 spec part 3, 12.1.3. It thus ensures the "entity" in this condition.
	 * 3. EntitySetPath of operation is the binding parameter.
	 * 4. Operation binding has
	 *    (a) a V4 parent context which
	 *    (b) points to an entity from an entity set w/o navigation properties.
	 *
	 * BEWARE: It is the caller's duty to check 1. through 4.(a) via
	 * {@link #isReturnValueLikeBindingParameter}!
	 *
	 * @returns {boolean} Whether a return value context is created
	 *
	 * @private
	 */
	ODataContextBinding.prototype.hasReturnValueContext = function () {
		var aMetaSegments = _Helper.getMetaPath(this.getResolvedPath()).split("/");

		// case 4b
		return aMetaSegments.length === 3
			&& this.oModel.getMetaModel().getObject("/" + aMetaSegments[1]).$kind === "EntitySet";
	};

	/**
	 * Initializes the OData context binding: Fires a 'change' event in case the binding has a
	 * resolved path and its root binding is not suspended.
	 *
	 * @protected
	 * @see #getRootBinding
	 * @since 1.37.0
	 */
	// @override sap.ui.model.Binding#initialize
	ODataContextBinding.prototype.initialize = function () {
		this.bInitial = false;
		// Here no other code but the event for the ManagedObject is expected. The binding should be
		// useable for controller code without calling initialize.
		if (this.isResolved() && !this.getRootBinding().isSuspended()) {
			this._fireChange({reason : ChangeReason.Change});
		}
	};

	/**
	 * Determines whether an operation's return value is like its binding parameter in the following
	 * sense:
	 * 1. Operation is bound.
	 * 2. Operation has single entity return value. Note: existence of EntitySetPath
	 *    implies the return value is an entity or a collection thereof;
	 *    see OData V4 spec part 3, 12.1.3. It thus ensures the "entity" in this condition.
	 * 3. EntitySetPath of operation is the binding parameter.
	 * 4. Operation binding has
	 *    (a) a V4 parent context.
	 *
	 * For a navigation property, the criteria are intentionally similar.
	 *
	 * @param {object} oMetadata The operation metadata
	 * @returns {boolean} Whether operation's return value is like its binding parameter
	 *
	 * @private
	 * @see #hasReturnValueContext
	 */
	ODataContextBinding.prototype.isReturnValueLikeBindingParameter = function (oMetadata) {
		var oParentMetaData, sParentMetaPath;

		if (!(this.bRelative && this.oContext && this.oContext.getBinding)) { // case 4a
			return false;
		}

		if (oMetadata.$kind === "NavigationProperty") {
			if (oMetadata.$isCollection || this.sPath.includes("/")) {
				return false;
			}

			sParentMetaPath = _Helper.getMetaPath(this.oContext.getPath());
			if (sParentMetaPath.lastIndexOf("/") > 0) {
				return false;
			}

			oParentMetaData = this.oModel.getMetaModel().getObject(sParentMetaPath);

			return oParentMetaData.$kind === "EntitySet"
				&& oParentMetaData.$Type === oMetadata.$Type
				&& oParentMetaData.$NavigationPropertyBinding
				&& oParentMetaData.$NavigationPropertyBinding[this.sPath.slice(0, /*"(...)"*/-5)]
					=== sParentMetaPath.slice(1);
		}

		return oMetadata.$IsBound // case 1
			&& oMetadata.$ReturnType && !oMetadata.$ReturnType.$isCollection
				&& oMetadata.$EntitySetPath // case 2
			&& !oMetadata.$EntitySetPath.includes("/"); // case 3
	};

	/**
	 * Refreshes all dependent bindings with the given parameters and waits for them to have
	 * finished.
	 *
	 * @param {string} sResourcePathPrefix
	 *   The resource path prefix which is used to delete the dependent caches and corresponding
	 *   messages; may be "" but not <code>undefined</code>
	 * @param {string} [sGroupId]
	 *   The group ID to be used for refresh
	 * @param {boolean} [bCheckUpdate]
	 *   If <code>true</code>, a property binding is expected to check for updates
	 * @param {boolean} [bKeepCacheOnError]
	 *   If <code>true</code>, the binding data remains unchanged if the refresh fails
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving when all dependent bindings are refreshed; it is rejected
	 *   when the refresh fails; the promise is resolved immediately on a suspended binding
	 * @throws {Error}
	 *   If the binding's root binding is suspended and a group ID different from the binding's
	 *   group ID is given
	 *
	 * @private
	 */
	ODataContextBinding.prototype.refreshDependentBindings = function (sResourcePathPrefix,
			sGroupId, bCheckUpdate, bKeepCacheOnError) {
		return SyncPromise.all(this.getDependentBindings().map(function (oDependentBinding) {
			return oDependentBinding.refreshInternal(sResourcePathPrefix, sGroupId, bCheckUpdate,
				bKeepCacheOnError);
		}));
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataBinding#refreshInternal
	 */
	ODataContextBinding.prototype.refreshInternal = function (sResourcePathPrefix, sGroupId,
			bCheckUpdate, bKeepCacheOnError) {
		var that = this;

		if (this.oOperation && this.oOperation.bAction !== false) {
			return SyncPromise.resolve();
		}

		if (this.isRootBindingSuspended()) {
			this.refreshSuspended(sGroupId);
			return this.refreshDependentBindings(sResourcePathPrefix, sGroupId, bCheckUpdate,
				bKeepCacheOnError);
		}

		this.createReadGroupLock(sGroupId, this.isRoot());
		return this.oCachePromise.then(function (oCache) {
			var bHasChangeListeners,
				oPromise = that.oRefreshPromise,
				oReadGroupLock = that.oReadGroupLock;

			if (!that.oElementContext) { // refresh after delete
				that.oElementContext = Context.create(that.oModel, that, that.getResolvedPath());
				if (!oCache) { // make sure event IS fired
					that._fireChange({reason : ChangeReason.Refresh});
				}
			}
			if (that.oOperation) {
				that.oReadGroupLock = undefined;
				return that._execute(oReadGroupLock, that.oOperation.mRefreshParameters);
			}
			if (oCache && !oPromise) { // do not refresh twice
				// check here because fetchCache deactivates the cache which removes the listeners
				bHasChangeListeners = oCache.hasChangeListeners();
				// remove all cached Caches before fetching a new one
				that.removeCachesAndMessages(sResourcePathPrefix);
				that.fetchCache(that.oContext, false, /*bKeepQueryOptions*/false,
					bKeepCacheOnError ? sGroupId : undefined);
				// Do not fire a change event, or else ManagedObject destroys and recreates the
				// binding hierarchy causing a flood of events.
				oPromise = bHasChangeListeners
					? that.createRefreshPromise(/*bPreventBubbling*/bKeepCacheOnError)
					: undefined;
				if (bKeepCacheOnError && oPromise) {
					oPromise = oPromise.catch(function (oError) {
						return that.fetchResourcePath(that.oContext).then(function (sResourcePath) {
							if (!that.bRelative || oCache.getResourcePath() === sResourcePath) {
								that.oCache = oCache;
								that.oCachePromise = SyncPromise.resolve(oCache);
								oCache.setActive(true);
								return that.checkUpdateInternal();
							}
						}).then(function () {
							throw oError;
						});
					});
				}
				if (!bCheckUpdate) {
					// If bCheckUpdate is unset, dependent bindings do not call fetchValue, and we
					// have to call it here.
					// Note: this resets that.oRefreshPromise
					that.fetchValue("").catch(that.oModel.getReporter());
				}
			}
			return SyncPromise.all([
				oPromise,
				that.refreshDependentBindings(sResourcePathPrefix, sGroupId, bCheckUpdate,
					bKeepCacheOnError)
			]);
		});
	};

	/**
	 * Refreshes the given context if it is this binding's return value context.
	 *
	 * @param {sap.ui.model.odata.v4.Context} oContext
	 *   The context to refresh
	 * @param {string} sGroupId
	 *   The group ID for the refresh
	 * @param {boolean} [bKeepCacheOnError]
	 *   If <code>true</code>, the binding data remains unchanged if the refresh fails
	 * @returns {sap.ui.base.SyncPromise}
	 *   A promise resolving without a defined result when the refresh is finished if the context is
	 *   this binding's return value context; <code>null</code> otherwise
	 *
	 * @private
	 */
	ODataContextBinding.prototype.refreshReturnValueContext = function (oContext, sGroupId,
			bKeepCacheOnError) {
		var oCache = this.oCache,
			mCacheQueryOptions = this.mCacheQueryOptions,
			oModel = this.oModel,
			oPromise,
			that = this;

		if (this.oReturnValueContext !== oContext) {
			return null;
		}

		this.mCacheQueryOptions = this.computeOperationQueryOptions();
		if (this.mLateQueryOptions) {
			_Helper.aggregateExpandSelect(this.mCacheQueryOptions, this.mLateQueryOptions);
		}
		this.oCache = _Cache.createSingle(oModel.oRequestor, oContext.getPath().slice(1),
			this.mCacheQueryOptions, true, oModel.bSharedRequests);
		this.oCachePromise = SyncPromise.resolve(this.oCache);
		this.createReadGroupLock(sGroupId, true);
		oPromise = oContext.refreshDependentBindings("", sGroupId, true, bKeepCacheOnError);
		if (bKeepCacheOnError) {
			oPromise = oPromise.catch(function (oError) {
				that.oCache = oCache;
				that.oCachePromise = SyncPromise.resolve(oCache);
				that.mCacheQueryOptions = mCacheQueryOptions;
				oCache.setActive(true);

				return oContext.checkUpdateInternal().then(function () {
					throw oError;
				});
			});
		}

		return oPromise;
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#requestSideEffects
	 */
	ODataContextBinding.prototype.requestSideEffects = function (sGroupId, aPaths, oContext) {
		var oModel = this.oModel,
			aPromises = [],
			that = this;

		/*
		 * Adds an error handler to the given promise which reports errors to the model and ignores
		 * cancellations.
		 *
		 * @param {Promise} oPromise - A promise
		 * @returns {Promise} A promise including an error handler
		 */
		function reportError(oPromise) {
			return oPromise.catch(function (oError) {
				oModel.reportError("Failed to request side effects", sClassName, oError);
				if (!oError.canceled) {
					throw oError;
				}
			});
		}

		if (aPaths.indexOf("") < 0) {
			try {
				aPromises.push(
					this.oCache.requestSideEffects(this.lockGroup(sGroupId), aPaths,
						oContext && oContext.getPath().slice(1)));

				this.visitSideEffects(sGroupId, aPaths, oContext, aPromises);

				return SyncPromise.all(aPromises.map(reportError)).then(function () {
					return that.refreshDependentListBindingsWithoutCache();
				});
			} catch (e) {
				if (!e.message.startsWith("Unsupported collection-valued navigation property ")) {
					throw e;
				}
			}
		}
		return oContext
			&& this.refreshReturnValueContext(oContext, sGroupId, /*bKeepCacheOnError*/true)
			|| this.refreshInternal("", sGroupId, true, true);
	};

	/**
	 * Returns a promise on the value for the given path relative to this binding. The function
	 * allows access to the complete data the binding points to (if <code>sPath</code> is "") or
	 * any part thereof. The data is a JSON structure as described in <a href=
	 * "https://docs.oasis-open.org/odata/odata-json-format/v4.0/odata-json-format-v4.0.html"
	 * >"OData JSON Format Version 4.0"</a>.
	 * Note that the function clones the result. Modify values via
	 * {@link sap.ui.model.odata.v4.Context#setProperty}.
	 *
	 * If you want {@link #requestObject} to read fresh data, call
	 * <code>oBinding.refresh()</code> first.
	 *
	 * @param {string} [sPath=""]
	 *   A path relative to this context binding
	 * @returns {Promise<any|undefined>}
	 *   A promise on the requested value; in case there is no bound context this promise resolves
	 *   with <code>undefined</code>
	 * @throws {Error}
	 *   If the context's root binding is suspended
	 *
	 * @public
	 * @see sap.ui.model.odata.v4.Context#requestObject
	 * @since 1.69.0
	 */
	ODataContextBinding.prototype.requestObject = function (sPath) {
		return this.oElementContext
			? this.oElementContext.requestObject(sPath)
			: Promise.resolve();
	};

	/**
	 * @override
	 * @see sap.ui.model.odata.v4.ODataParentBinding#resumeInternal
	 */
	ODataContextBinding.prototype.resumeInternal = function (bCheckUpdate, bParentHasChanges) {
		var sResumeChangeReason = this.sResumeChangeReason,
			that = this;

		function resumeDependents() {
			that.getDependentBindings().forEach(function (oDependentBinding) {
				oDependentBinding.resumeInternal(bCheckUpdate, !!sResumeChangeReason);
			});
		}

		this.sResumeChangeReason = undefined;

		if (this.oOperation) {
			resumeDependents();
			return;
		}

		if (bParentHasChanges || sResumeChangeReason) {
			this.mAggregatedQueryOptions = {};
			this.bAggregatedQueryOptionsInitial = true;
			this.mCanUseCachePromiseByChildPath = {};
			this.removeCachesAndMessages("");
			this.fetchCache(this.oContext);
		}
		resumeDependents();
		if (sResumeChangeReason) {
			this._fireChange({reason : sResumeChangeReason});
		}
	};

	/**
	 * Sets the (base) context which is used when the binding path is relative.
	 * Fires a change event if the bound context is changed.
	 *
	 * @param {sap.ui.model.Context} [oContext]
	 *   The context which is required as base for a relative path
	 * @throws {Error}
	 *   If the binding's root binding is suspended
	 *
	 * @private
	 */
	// @override sap.ui.model.Binding#setContext
	ODataContextBinding.prototype.setContext = function (oContext) {
		if (this.oContext !== oContext) {
			if (this.bRelative && (this.oContext || oContext)) {
				this.checkSuspended(true);
				if (this.oElementContext) {
					this.oElementContext.destroy();
					this.oElementContext = null;
				}
				if (this.oReturnValueContext) {
					this.oReturnValueContext.destroy();
					this.oReturnValueContext = null;
				}
				if (this.oParameterContext) {
					this.oParameterContext.destroy();
					this.oParameterContext = null;
				}
				this.fetchCache(oContext);
				if (oContext) {
					this.oElementContext = Context.create(this.oModel, this,
						this.oModel.resolve(this.sPath, oContext));
					if (this.oOperation) {
						this.oParameterContext = Context.create(this.oModel, this,
							this.oModel.resolve(this.sPath + "/$Parameter", oContext));
					}
				}
				// call Binding#setContext because of data state etc.; fires "change"
				Binding.prototype.setContext.call(this, oContext);
			} else {
				// remember context even if no "change" fired
				this.oContext = oContext;
			}
		}
	};

	/**
	 * Sets a parameter for an operation call.
	 *
	 * @param {string} sParameterName
	 *   The parameter name
	 * @param {any} vValue
	 *   The parameter value
	 * @returns {this}
	 *   <code>this</code> to enable method chaining
	 * @throws {Error} If the binding is not a deferred operation binding (see
	 *   {@link sap.ui.model.odata.v4.ODataContextBinding}) or if the value is missing
	 *
	 * @public
	 * @since 1.37.0
	 */
	ODataContextBinding.prototype.setParameter = function (sParameterName, vValue) {
		var vOldValue;

		if (!this.oOperation) {
			throw new Error("The binding must be deferred: " + this.sPath);
		}
		if (!sParameterName) {
			throw new Error("Missing parameter name");
		}
		if (vValue === undefined) {
			throw new Error("Missing value for parameter: " + sParameterName);
		}

		vOldValue = this.oOperation.mParameters[sParameterName];
		this.oOperation.mParameters[sParameterName] = vValue;
		_Helper.informAll(this.oOperation.mChangeListeners, sParameterName, vOldValue, vValue);

		this.oOperation.bAction = undefined; // "not yet executed"

		return this;
	};

	return ODataContextBinding;
});
