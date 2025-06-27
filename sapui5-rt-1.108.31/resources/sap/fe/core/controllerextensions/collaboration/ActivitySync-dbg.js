/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/CommonUtils", "sap/fe/core/controllerextensions/collaboration/ActivityBase", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/m/MessageBox"], function (CommonUtils, ActivityBase, CollaborationCommon, MessageBox) {
  "use strict";

  var _exports = {};
  var CollaborationUtils = CollaborationCommon.CollaborationUtils;
  var Activity = CollaborationCommon.Activity;
  var isCollaborationConnected = ActivityBase.isCollaborationConnected;
  var initializeCollaboration = ActivityBase.initializeCollaboration;
  var endCollaboration = ActivityBase.endCollaboration;
  var broadcastCollaborationMessage = ActivityBase.broadcastCollaborationMessage;
  function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
  function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
  function _defineProperty(obj, key, value) { key = _toPropertyKey(key); if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }
  function _toPropertyKey(arg) { var key = _toPrimitive(arg, "string"); return typeof key === "symbol" ? key : String(key); }
  function _toPrimitive(input, hint) { if (typeof input !== "object" || input === null) return input; var prim = input[Symbol.toPrimitive]; if (prim !== undefined) { var res = prim.call(input, hint || "default"); if (typeof res !== "object") return res; throw new TypeError("@@toPrimitive must return a primitive value."); } return (hint === "string" ? String : Number)(input); }
  var MYACTIVITY = "/collaboration/myActivity";
  var ACTIVEUSERS = "/collaboration/activeUsers";
  var ACTIVITIES = "/collaboration/activities";
  var isConnected = function (control) {
    var internalModel = control.getModel("internal");
    return isCollaborationConnected(internalModel);
  };
  _exports.isConnected = isConnected;
  var send = function (control, action, content) {
    if (isConnected(control)) {
      var internalModel = control.getModel("internal");
      var clientContent = Array.isArray(content) ? content.join("|") : content;
      if (action === Activity.LiveChange) {
        // To avoid unnecessary traffic we keep track of live changes and send it only once
        var myActivity = internalModel.getProperty(MYACTIVITY);
        if (myActivity === clientContent) {
          return;
        } else {
          internalModel.setProperty(MYACTIVITY, clientContent);
        }
      } else {
        // user finished the activity
        internalModel.setProperty(MYACTIVITY, null);
      }
      broadcastCollaborationMessage(action, clientContent, internalModel);
    }
  };
  _exports.send = send;
  var getWebSocketBaseURL = function (bindingContext) {
    return bindingContext.getModel().getMetaModel().getObject("/@com.sap.vocabularies.Common.v1.WebSocketBaseURL");
  };
  var isCollaborationEnabled = function (view) {
    var bindingContext = (view === null || view === void 0 ? void 0 : view.getBindingContext) && view.getBindingContext();
    return !!(bindingContext && getWebSocketBaseURL(bindingContext));
  };
  _exports.isCollaborationEnabled = isCollaborationEnabled;
  var connect = function (view) {
    try {
      var internalModel = view.getModel("internal");
      var me = CollaborationUtils.getMe(view);

      // Retrieving ME from shell service
      if (!me) {
        // no me = no shell = not sure what to do
        return Promise.resolve();
      }
      var bindingContext = view.getBindingContext();
      var webSocketBaseURL = getWebSocketBaseURL(bindingContext);
      var serviceUrl = bindingContext.getModel().getServiceUrl();
      if (!webSocketBaseURL) {
        return Promise.resolve();
      }
      return Promise.resolve(bindingContext.requestProperty("DraftAdministrativeData/DraftUUID")).then(function (sDraftUUID) {
        if (!sDraftUUID) {
          return;
        }
        initializeCollaboration(me, webSocketBaseURL, sDraftUUID, serviceUrl, internalModel, function (message) {
          messageReceive(message, view);
        });
      });
    } catch (e) {
      return Promise.reject(e);
    }
  };
  _exports.connect = connect;
  var disconnect = function (control) {
    var internalModel = control.getModel("internal");
    endCollaboration(internalModel);
  };
  _exports.disconnect = disconnect;
  function messageReceive(message, view) {
    var _message$clientConten, _activities;
    var internalModel = view.getModel("internal");
    var activeUsers = internalModel.getProperty(ACTIVEUSERS);
    var activities;
    var activityKey;
    var metaPath = message.clientContent && view.getModel().getMetaModel().getMetaPath(message.clientContent);
    message.userAction = message.userAction || message.clientAction;
    var sender = {
      id: message.userID,
      name: message.userDescription,
      initials: CollaborationUtils.formatInitials(message.userDescription),
      color: CollaborationUtils.getUserColor(message.userID, activeUsers, [])
    };
    var mactivity = sender;

    // eslint-disable-next-line default-case
    switch (message.userAction) {
      case Activity.Join:
      case Activity.JoinEcho:
        if (activeUsers.findIndex(function (user) {
          return user.id === sender.id;
        }) === -1) {
          activeUsers.unshift(sender);
          internalModel.setProperty(ACTIVEUSERS, activeUsers);
        }
        if (message.userAction === Activity.Join) {
          // we echo our existence to the newly entered user and also send the current activity if there is any
          broadcastCollaborationMessage(Activity.JoinEcho, internalModel.getProperty(MYACTIVITY), internalModel);
        }
        if (message.userAction === Activity.JoinEcho) {
          if (message.clientContent) {
            // another user was already typing therefore I want to see his activity immediately. Calling me again as a live change
            message.userAction = Activity.LiveChange;
            messageReceive(message, view);
          }
        }
        break;
      case Activity.Leave:
        // Removing the active user. Not removing "me" if I had the screen open in another session
        activeUsers = activeUsers.filter(function (user) {
          return user.id !== sender.id || user.me;
        });
        internalModel.setProperty(ACTIVEUSERS, activeUsers);
        var allActivities = internalModel.getProperty(ACTIVITIES) || {};
        var removeUserActivities = function (bag) {
          if (Array.isArray(bag)) {
            return bag.filter(function (activity) {
              return activity.id !== sender.id;
            });
          } else {
            for (var p in bag) {
              bag[p] = removeUserActivities(bag[p]);
            }
            return bag;
          }
        };
        removeUserActivities(allActivities);
        internalModel.setProperty(ACTIVITIES, allActivities);
        break;
      case Activity.Change:
        var metaPaths = message === null || message === void 0 ? void 0 : (_message$clientConten = message.clientContent) === null || _message$clientConten === void 0 ? void 0 : _message$clientConten.split("|").map(function (path) {
          return view.getModel().getMetaModel().getMetaPath(path);
        });
        metaPaths.forEach(function (currentMetaPath, i) {
          var _message$clientConten2, _currentActivities;
          var nesteedMessage = _objectSpread(_objectSpread({}, message), {}, {
            clientContent: message === null || message === void 0 ? void 0 : (_message$clientConten2 = message.clientContent) === null || _message$clientConten2 === void 0 ? void 0 : _message$clientConten2.split("|")[i]
          });
          var currentActivities = internalModel.getProperty(ACTIVITIES + currentMetaPath) || [];
          activityKey = getActivityKey(nesteedMessage.clientContent);
          currentActivities = ((_currentActivities = currentActivities) === null || _currentActivities === void 0 ? void 0 : _currentActivities.filter) && currentActivities.filter(function (activity) {
            return activity.key !== activityKey;
          });
          if (currentActivities) {
            internalModel.setProperty(ACTIVITIES + currentMetaPath, currentActivities);
            update(view, nesteedMessage, currentMetaPath, Activity.Change);
          }
        });
        break;
      case Activity.Create:
        // For create we actually just need to refresh the table
        update(view, message, metaPath, Activity.Create);
        break;
      case Activity.Delete:
        // For now also refresh the page but in case of deletion we need to inform the user
        update(view, message, metaPath, Activity.Delete);
        break;
      case Activity.Activate:
        disconnect(view);
        MessageBox.information(CollaborationUtils.getText("C_COLLABORATIONDRAFT_ACTIVATE", sender.name));
        navigate(message.clientContent, view);
        break;
      case Activity.Discard:
        disconnect(view);
        MessageBox.information(CollaborationUtils.getText("C_COLLABORATIONDRAFT_DISCARD", sender.name));
        navigate(message.clientContent, view);
        break;
      /*
      // TODO: Action to be implemented
      case Activity.Action:
      	// Just for test reasons show a toast - to be checked with UX
      	MessageToast.show("User " + sender.name + " has executed action " + metaPath.split("|")[0]);
      	//update(view, message, metaPath, Activity.Delete);
      	break;
       */
      case Activity.LiveChange:
        mactivity = sender;
        mactivity.key = getActivityKey(message.clientContent);

        // stupid JSON model...
        var initJSONModel = "";
        var parts = metaPath.split("/");
        for (var i = 1; i < parts.length - 1; i++) {
          initJSONModel += "/".concat(parts[i]);
          if (!internalModel.getProperty(ACTIVITIES + initJSONModel)) {
            internalModel.setProperty(ACTIVITIES + initJSONModel, {});
          }
        }
        activities = internalModel.getProperty(ACTIVITIES + metaPath);
        activities = (_activities = activities) !== null && _activities !== void 0 && _activities.slice ? activities.slice() : [];
        activities.push(mactivity);
        internalModel.setProperty(ACTIVITIES + metaPath, activities);
        break;
      case Activity.Undo:
        // The user did a change but reverted it, therefore unblock the control
        activities = internalModel.getProperty(ACTIVITIES + metaPath);
        activityKey = getActivityKey(message.clientContent);
        internalModel.setProperty(ACTIVITIES + metaPath, activities.filter(function (a) {
          return a.key !== activityKey;
        }));
        break;
    }
  }
  function update(view, message, metaPath, action) {
    var appComponent = CollaborationUtils.getAppComponent(view);
    var metaModel = view.getModel().getMetaModel();
    var currentPage = getCurrentPage(view);
    var sideEffectsService = appComponent.getSideEffectsService();
    var currentContext = currentPage.getBindingContext();
    var currentPath = currentContext.getPath();
    var currentMetaPath = metaModel.getMetaPath(currentPath);
    var changedDocument = message.clientContent;
    if (action === Activity.Delete) {
      // check if user currently displays one deleted object
      var deletedObjects = message.clientContent.split("|");
      var parentDeletedIndex = deletedObjects.findIndex(function (deletedObject) {
        return currentPath.startsWith(deletedObject);
      });
      if (parentDeletedIndex > -1) {
        // any other user deleted the object I'm currently looking at. Inform the user we will navigate to root now
        MessageBox.information(CollaborationUtils.getText("C_COLLABORATIONDRAFT_DELETE", message.userDescription), {
          onClose: function () {
            var targetContext = view.getModel().bindContext(deletedObjects[parentDeletedIndex]).getBoundContext();
            currentPage.getController()._routing.navigateBackFromContext(targetContext);
          }
        });
      }
      // TODO: For now just take the first object to get the meta path and do a full refresh of the table
      changedDocument = deletedObjects[0];
    }
    if (changedDocument.startsWith(currentPath)) {
      // Execute SideEffects (TODO for Meet there should be one central method)
      var activityPath = metaPath.replace(currentMetaPath, "").slice(1);
      if (activityPath) {
        (function () {
          // Request also the property itself
          var sideEffects = [{
            $PropertyPath: activityPath
          }];
          var entityType = sideEffectsService.getEntityTypeFromContext(currentContext);
          var entityTypeSideEffects = sideEffectsService.getODataEntitySideEffects(entityType);
          // Poor man solution without checking source targets, just for POC, this is throw-way coding only
          var object = Object; // just to overcome TS issues, will be anyway replaced
          var relevantSideEffects = object.fromEntries(object.entries(entityTypeSideEffects).filter(function (x) {
            var _x$1$SourceProperties;
            return ((_x$1$SourceProperties = x[1].SourceProperties) === null || _x$1$SourceProperties === void 0 ? void 0 : _x$1$SourceProperties.findIndex(function (source) {
              return source.value === activityPath;
            })) > -1;
          }));
          for (var p in relevantSideEffects) {
            relevantSideEffects[p].TargetProperties.forEach(function (targetProperty) {
              sideEffects.push({
                $PropertyPath: targetProperty
              });
            });
          }
          sideEffectsService.requestSideEffects(sideEffects, currentContext, "$auto");
        })();
      }
    }

    // Simulate any change so the edit flow shows the draft indicator and sets the page to dirty
    currentPage.getController().editFlow.updateDocument(currentContext, Promise.resolve());
  }
  function navigate(path, view) {
    // TODO: routing.navigate doesn't consider semantic bookmarking
    var currentPage = getCurrentPage(view);
    var targetContext = view.getModel().bindContext(path).getBoundContext();
    currentPage.getController().routing.navigate(targetContext);
  }
  function getCurrentPage(view) {
    var appComponent = CollaborationUtils.getAppComponent(view);
    return CommonUtils.getCurrentPageView(appComponent);
  }
  function getActivityKey(x) {
    return x.substring(x.lastIndexOf("(") + 1, x.lastIndexOf(")"));
  }
  return {
    connect: connect,
    disconnect: disconnect,
    isConnected: isConnected,
    isCollaborationEnabled: isCollaborationEnabled,
    send: send
  };
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJNWUFDVElWSVRZIiwiQUNUSVZFVVNFUlMiLCJBQ1RJVklUSUVTIiwiaXNDb25uZWN0ZWQiLCJjb250cm9sIiwiaW50ZXJuYWxNb2RlbCIsImdldE1vZGVsIiwiaXNDb2xsYWJvcmF0aW9uQ29ubmVjdGVkIiwic2VuZCIsImFjdGlvbiIsImNvbnRlbnQiLCJjbGllbnRDb250ZW50IiwiQXJyYXkiLCJpc0FycmF5Iiwiam9pbiIsIkFjdGl2aXR5IiwiTGl2ZUNoYW5nZSIsIm15QWN0aXZpdHkiLCJnZXRQcm9wZXJ0eSIsInNldFByb3BlcnR5IiwiYnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UiLCJnZXRXZWJTb2NrZXRCYXNlVVJMIiwiYmluZGluZ0NvbnRleHQiLCJnZXRNZXRhTW9kZWwiLCJnZXRPYmplY3QiLCJpc0NvbGxhYm9yYXRpb25FbmFibGVkIiwidmlldyIsImdldEJpbmRpbmdDb250ZXh0IiwiY29ubmVjdCIsIm1lIiwiQ29sbGFib3JhdGlvblV0aWxzIiwiZ2V0TWUiLCJ3ZWJTb2NrZXRCYXNlVVJMIiwic2VydmljZVVybCIsImdldFNlcnZpY2VVcmwiLCJyZXF1ZXN0UHJvcGVydHkiLCJzRHJhZnRVVUlEIiwiaW5pdGlhbGl6ZUNvbGxhYm9yYXRpb24iLCJtZXNzYWdlIiwibWVzc2FnZVJlY2VpdmUiLCJkaXNjb25uZWN0IiwiZW5kQ29sbGFib3JhdGlvbiIsImFjdGl2ZVVzZXJzIiwiYWN0aXZpdGllcyIsImFjdGl2aXR5S2V5IiwibWV0YVBhdGgiLCJnZXRNZXRhUGF0aCIsInVzZXJBY3Rpb24iLCJjbGllbnRBY3Rpb24iLCJzZW5kZXIiLCJpZCIsInVzZXJJRCIsIm5hbWUiLCJ1c2VyRGVzY3JpcHRpb24iLCJpbml0aWFscyIsImZvcm1hdEluaXRpYWxzIiwiY29sb3IiLCJnZXRVc2VyQ29sb3IiLCJtYWN0aXZpdHkiLCJKb2luIiwiSm9pbkVjaG8iLCJmaW5kSW5kZXgiLCJ1c2VyIiwidW5zaGlmdCIsIkxlYXZlIiwiZmlsdGVyIiwiYWxsQWN0aXZpdGllcyIsInJlbW92ZVVzZXJBY3Rpdml0aWVzIiwiYmFnIiwiYWN0aXZpdHkiLCJwIiwiQ2hhbmdlIiwibWV0YVBhdGhzIiwic3BsaXQiLCJtYXAiLCJwYXRoIiwiZm9yRWFjaCIsImN1cnJlbnRNZXRhUGF0aCIsImkiLCJuZXN0ZWVkTWVzc2FnZSIsImN1cnJlbnRBY3Rpdml0aWVzIiwiZ2V0QWN0aXZpdHlLZXkiLCJrZXkiLCJ1cGRhdGUiLCJDcmVhdGUiLCJEZWxldGUiLCJBY3RpdmF0ZSIsIk1lc3NhZ2VCb3giLCJpbmZvcm1hdGlvbiIsImdldFRleHQiLCJuYXZpZ2F0ZSIsIkRpc2NhcmQiLCJpbml0SlNPTk1vZGVsIiwicGFydHMiLCJsZW5ndGgiLCJzbGljZSIsInB1c2giLCJVbmRvIiwiYSIsImFwcENvbXBvbmVudCIsImdldEFwcENvbXBvbmVudCIsIm1ldGFNb2RlbCIsImN1cnJlbnRQYWdlIiwiZ2V0Q3VycmVudFBhZ2UiLCJzaWRlRWZmZWN0c1NlcnZpY2UiLCJnZXRTaWRlRWZmZWN0c1NlcnZpY2UiLCJjdXJyZW50Q29udGV4dCIsImN1cnJlbnRQYXRoIiwiZ2V0UGF0aCIsImNoYW5nZWREb2N1bWVudCIsImRlbGV0ZWRPYmplY3RzIiwicGFyZW50RGVsZXRlZEluZGV4IiwiZGVsZXRlZE9iamVjdCIsInN0YXJ0c1dpdGgiLCJvbkNsb3NlIiwidGFyZ2V0Q29udGV4dCIsImJpbmRDb250ZXh0IiwiZ2V0Qm91bmRDb250ZXh0IiwiZ2V0Q29udHJvbGxlciIsIl9yb3V0aW5nIiwibmF2aWdhdGVCYWNrRnJvbUNvbnRleHQiLCJhY3Rpdml0eVBhdGgiLCJyZXBsYWNlIiwic2lkZUVmZmVjdHMiLCIkUHJvcGVydHlQYXRoIiwiZW50aXR5VHlwZSIsImdldEVudGl0eVR5cGVGcm9tQ29udGV4dCIsImVudGl0eVR5cGVTaWRlRWZmZWN0cyIsImdldE9EYXRhRW50aXR5U2lkZUVmZmVjdHMiLCJvYmplY3QiLCJPYmplY3QiLCJyZWxldmFudFNpZGVFZmZlY3RzIiwiZnJvbUVudHJpZXMiLCJlbnRyaWVzIiwieCIsIlNvdXJjZVByb3BlcnRpZXMiLCJzb3VyY2UiLCJ2YWx1ZSIsIlRhcmdldFByb3BlcnRpZXMiLCJ0YXJnZXRQcm9wZXJ0eSIsInJlcXVlc3RTaWRlRWZmZWN0cyIsImVkaXRGbG93IiwidXBkYXRlRG9jdW1lbnQiLCJQcm9taXNlIiwicmVzb2x2ZSIsInJvdXRpbmciLCJDb21tb25VdGlscyIsImdldEN1cnJlbnRQYWdlVmlldyIsInN1YnN0cmluZyIsImxhc3RJbmRleE9mIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJBY3Rpdml0eVN5bmMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IENvbW1vblV0aWxzIGZyb20gXCJzYXAvZmUvY29yZS9Db21tb25VdGlsc1wiO1xuaW1wb3J0IHtcblx0YnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UsXG5cdGVuZENvbGxhYm9yYXRpb24sXG5cdGluaXRpYWxpemVDb2xsYWJvcmF0aW9uLFxuXHRpc0NvbGxhYm9yYXRpb25Db25uZWN0ZWRcbn0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQWN0aXZpdHlCYXNlXCI7XG5pbXBvcnQgdHlwZSB7IE1lc3NhZ2UsIFVzZXIsIFVzZXJBY3Rpdml0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0NvbGxhYm9yYXRpb25Db21tb25cIjtcbmltcG9ydCB7IEFjdGl2aXR5LCBDb2xsYWJvcmF0aW9uVXRpbHMgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uQ29tbW9uXCI7XG5pbXBvcnQgTWVzc2FnZUJveCBmcm9tIFwic2FwL20vTWVzc2FnZUJveFwiO1xuaW1wb3J0IHR5cGUgQ29udHJvbCBmcm9tIFwic2FwL3VpL2NvcmUvQ29udHJvbFwiO1xuaW1wb3J0IHR5cGUgVmlldyBmcm9tIFwic2FwL3VpL2NvcmUvbXZjL1ZpZXdcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5pbXBvcnQgdHlwZSBPRGF0YU1ldGFNb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL29kYXRhL3Y0L09EYXRhTWV0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxuY29uc3QgTVlBQ1RJVklUWSA9IFwiL2NvbGxhYm9yYXRpb24vbXlBY3Rpdml0eVwiO1xuY29uc3QgQUNUSVZFVVNFUlMgPSBcIi9jb2xsYWJvcmF0aW9uL2FjdGl2ZVVzZXJzXCI7XG5jb25zdCBBQ1RJVklUSUVTID0gXCIvY29sbGFib3JhdGlvbi9hY3Rpdml0aWVzXCI7XG5cbmV4cG9ydCBjb25zdCBpc0Nvbm5lY3RlZCA9IGZ1bmN0aW9uIChjb250cm9sOiBDb250cm9sKTogYm9vbGVhbiB7XG5cdGNvbnN0IGludGVybmFsTW9kZWwgPSBjb250cm9sLmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsO1xuXHRyZXR1cm4gaXNDb2xsYWJvcmF0aW9uQ29ubmVjdGVkKGludGVybmFsTW9kZWwpO1xufTtcblxuZXhwb3J0IGNvbnN0IHNlbmQgPSBmdW5jdGlvbiAoY29udHJvbDogQ29udHJvbCwgYWN0aW9uOiBBY3Rpdml0eSwgY29udGVudDogc3RyaW5nIHwgc3RyaW5nW10gfCB1bmRlZmluZWQpIHtcblx0aWYgKGlzQ29ubmVjdGVkKGNvbnRyb2wpKSB7XG5cdFx0Y29uc3QgaW50ZXJuYWxNb2RlbCA9IGNvbnRyb2wuZ2V0TW9kZWwoXCJpbnRlcm5hbFwiKSBhcyBKU09OTW9kZWw7XG5cdFx0Y29uc3QgY2xpZW50Q29udGVudCA9IEFycmF5LmlzQXJyYXkoY29udGVudCkgPyBjb250ZW50LmpvaW4oXCJ8XCIpIDogY29udGVudDtcblxuXHRcdGlmIChhY3Rpb24gPT09IEFjdGl2aXR5LkxpdmVDaGFuZ2UpIHtcblx0XHRcdC8vIFRvIGF2b2lkIHVubmVjZXNzYXJ5IHRyYWZmaWMgd2Uga2VlcCB0cmFjayBvZiBsaXZlIGNoYW5nZXMgYW5kIHNlbmQgaXQgb25seSBvbmNlXG5cdFx0XHRjb25zdCBteUFjdGl2aXR5ID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShNWUFDVElWSVRZKTtcblx0XHRcdGlmIChteUFjdGl2aXR5ID09PSBjbGllbnRDb250ZW50KSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoTVlBQ1RJVklUWSwgY2xpZW50Q29udGVudCk7XG5cdFx0XHR9XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIHVzZXIgZmluaXNoZWQgdGhlIGFjdGl2aXR5XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KE1ZQUNUSVZJVFksIG51bGwpO1xuXHRcdH1cblxuXHRcdGJyb2FkY2FzdENvbGxhYm9yYXRpb25NZXNzYWdlKGFjdGlvbiwgY2xpZW50Q29udGVudCwgaW50ZXJuYWxNb2RlbCk7XG5cdH1cbn07XG5cbmNvbnN0IGdldFdlYlNvY2tldEJhc2VVUkwgPSBmdW5jdGlvbiAoYmluZGluZ0NvbnRleHQ6IFY0Q29udGV4dCk6IHN0cmluZyB7XG5cdHJldHVybiBiaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChcIi9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLldlYlNvY2tldEJhc2VVUkxcIik7XG59O1xuXG5leHBvcnQgY29uc3QgaXNDb2xsYWJvcmF0aW9uRW5hYmxlZCA9IGZ1bmN0aW9uICh2aWV3OiBWaWV3KTogYm9vbGVhbiB7XG5cdGNvbnN0IGJpbmRpbmdDb250ZXh0ID0gdmlldz8uZ2V0QmluZGluZ0NvbnRleHQgJiYgKHZpZXcuZ2V0QmluZGluZ0NvbnRleHQoKSBhcyBWNENvbnRleHQpO1xuXHRyZXR1cm4gISEoYmluZGluZ0NvbnRleHQgJiYgZ2V0V2ViU29ja2V0QmFzZVVSTChiaW5kaW5nQ29udGV4dCkpO1xufTtcblxuZXhwb3J0IGNvbnN0IGNvbm5lY3QgPSBhc3luYyBmdW5jdGlvbiAodmlldzogVmlldykge1xuXHRjb25zdCBpbnRlcm5hbE1vZGVsID0gdmlldy5nZXRNb2RlbChcImludGVybmFsXCIpIGFzIEpTT05Nb2RlbDtcblx0Y29uc3QgbWUgPSBDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0TWUodmlldyk7XG5cblx0Ly8gUmV0cmlldmluZyBNRSBmcm9tIHNoZWxsIHNlcnZpY2Vcblx0aWYgKCFtZSkge1xuXHRcdC8vIG5vIG1lID0gbm8gc2hlbGwgPSBub3Qgc3VyZSB3aGF0IHRvIGRvXG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0Y29uc3QgYmluZGluZ0NvbnRleHQgPSB2aWV3LmdldEJpbmRpbmdDb250ZXh0KCkgYXMgVjRDb250ZXh0O1xuXHRjb25zdCB3ZWJTb2NrZXRCYXNlVVJMID0gZ2V0V2ViU29ja2V0QmFzZVVSTChiaW5kaW5nQ29udGV4dCk7XG5cdGNvbnN0IHNlcnZpY2VVcmwgPSBiaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpLmdldFNlcnZpY2VVcmwoKTtcblxuXHRpZiAoIXdlYlNvY2tldEJhc2VVUkwpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRjb25zdCBzRHJhZnRVVUlEID0gYXdhaXQgYmluZGluZ0NvbnRleHQucmVxdWVzdFByb3BlcnR5KFwiRHJhZnRBZG1pbmlzdHJhdGl2ZURhdGEvRHJhZnRVVUlEXCIpO1xuXHRpZiAoIXNEcmFmdFVVSUQpIHtcblx0XHRyZXR1cm47XG5cdH1cblxuXHRpbml0aWFsaXplQ29sbGFib3JhdGlvbihtZSwgd2ViU29ja2V0QmFzZVVSTCwgc0RyYWZ0VVVJRCwgc2VydmljZVVybCwgaW50ZXJuYWxNb2RlbCwgKG1lc3NhZ2U6IE1lc3NhZ2UpID0+IHtcblx0XHRtZXNzYWdlUmVjZWl2ZShtZXNzYWdlLCB2aWV3KTtcblx0fSk7XG59O1xuXG5leHBvcnQgY29uc3QgZGlzY29ubmVjdCA9IGZ1bmN0aW9uIChjb250cm9sOiBDb250cm9sKSB7XG5cdGNvbnN0IGludGVybmFsTW9kZWwgPSBjb250cm9sLmdldE1vZGVsKFwiaW50ZXJuYWxcIikgYXMgSlNPTk1vZGVsO1xuXHRlbmRDb2xsYWJvcmF0aW9uKGludGVybmFsTW9kZWwpO1xufTtcblxuZnVuY3Rpb24gbWVzc2FnZVJlY2VpdmUobWVzc2FnZTogTWVzc2FnZSwgdmlldzogVmlldykge1xuXHRjb25zdCBpbnRlcm5hbE1vZGVsOiBhbnkgPSB2aWV3LmdldE1vZGVsKFwiaW50ZXJuYWxcIik7XG5cdGxldCBhY3RpdmVVc2VyczogVXNlcltdID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShBQ1RJVkVVU0VSUyk7XG5cdGxldCBhY3Rpdml0aWVzOiBVc2VyQWN0aXZpdHlbXTtcblx0bGV0IGFjdGl2aXR5S2V5OiBzdHJpbmc7XG5cdGNvbnN0IG1ldGFQYXRoOiBzdHJpbmcgPSBtZXNzYWdlLmNsaWVudENvbnRlbnQgJiYgKHZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbCkuZ2V0TWV0YVBhdGgobWVzc2FnZS5jbGllbnRDb250ZW50KTtcblx0bWVzc2FnZS51c2VyQWN0aW9uID0gbWVzc2FnZS51c2VyQWN0aW9uIHx8IG1lc3NhZ2UuY2xpZW50QWN0aW9uO1xuXG5cdGNvbnN0IHNlbmRlcjogVXNlciA9IHtcblx0XHRpZDogbWVzc2FnZS51c2VySUQsXG5cdFx0bmFtZTogbWVzc2FnZS51c2VyRGVzY3JpcHRpb24sXG5cdFx0aW5pdGlhbHM6IENvbGxhYm9yYXRpb25VdGlscy5mb3JtYXRJbml0aWFscyhtZXNzYWdlLnVzZXJEZXNjcmlwdGlvbiksXG5cdFx0Y29sb3I6IENvbGxhYm9yYXRpb25VdGlscy5nZXRVc2VyQ29sb3IobWVzc2FnZS51c2VySUQsIGFjdGl2ZVVzZXJzLCBbXSlcblx0fTtcblxuXHRsZXQgbWFjdGl2aXR5OiBVc2VyQWN0aXZpdHkgPSBzZW5kZXI7XG5cblx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIGRlZmF1bHQtY2FzZVxuXHRzd2l0Y2ggKG1lc3NhZ2UudXNlckFjdGlvbikge1xuXHRcdGNhc2UgQWN0aXZpdHkuSm9pbjpcblx0XHRjYXNlIEFjdGl2aXR5LkpvaW5FY2hvOlxuXHRcdFx0aWYgKGFjdGl2ZVVzZXJzLmZpbmRJbmRleCgodXNlcikgPT4gdXNlci5pZCA9PT0gc2VuZGVyLmlkKSA9PT0gLTEpIHtcblx0XHRcdFx0YWN0aXZlVXNlcnMudW5zaGlmdChzZW5kZXIpO1xuXHRcdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KEFDVElWRVVTRVJTLCBhY3RpdmVVc2Vycyk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChtZXNzYWdlLnVzZXJBY3Rpb24gPT09IEFjdGl2aXR5LkpvaW4pIHtcblx0XHRcdFx0Ly8gd2UgZWNobyBvdXIgZXhpc3RlbmNlIHRvIHRoZSBuZXdseSBlbnRlcmVkIHVzZXIgYW5kIGFsc28gc2VuZCB0aGUgY3VycmVudCBhY3Rpdml0eSBpZiB0aGVyZSBpcyBhbnlcblx0XHRcdFx0YnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UoQWN0aXZpdHkuSm9pbkVjaG8sIGludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoTVlBQ1RJVklUWSksIGludGVybmFsTW9kZWwpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAobWVzc2FnZS51c2VyQWN0aW9uID09PSBBY3Rpdml0eS5Kb2luRWNobykge1xuXHRcdFx0XHRpZiAobWVzc2FnZS5jbGllbnRDb250ZW50KSB7XG5cdFx0XHRcdFx0Ly8gYW5vdGhlciB1c2VyIHdhcyBhbHJlYWR5IHR5cGluZyB0aGVyZWZvcmUgSSB3YW50IHRvIHNlZSBoaXMgYWN0aXZpdHkgaW1tZWRpYXRlbHkuIENhbGxpbmcgbWUgYWdhaW4gYXMgYSBsaXZlIGNoYW5nZVxuXHRcdFx0XHRcdG1lc3NhZ2UudXNlckFjdGlvbiA9IEFjdGl2aXR5LkxpdmVDaGFuZ2U7XG5cdFx0XHRcdFx0bWVzc2FnZVJlY2VpdmUobWVzc2FnZSwgdmlldyk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBBY3Rpdml0eS5MZWF2ZTpcblx0XHRcdC8vIFJlbW92aW5nIHRoZSBhY3RpdmUgdXNlci4gTm90IHJlbW92aW5nIFwibWVcIiBpZiBJIGhhZCB0aGUgc2NyZWVuIG9wZW4gaW4gYW5vdGhlciBzZXNzaW9uXG5cdFx0XHRhY3RpdmVVc2VycyA9IGFjdGl2ZVVzZXJzLmZpbHRlcigodXNlcikgPT4gdXNlci5pZCAhPT0gc2VuZGVyLmlkIHx8IHVzZXIubWUpO1xuXHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShBQ1RJVkVVU0VSUywgYWN0aXZlVXNlcnMpO1xuXHRcdFx0Y29uc3QgYWxsQWN0aXZpdGllcyA9IGludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoQUNUSVZJVElFUykgfHwge307XG5cdFx0XHRjb25zdCByZW1vdmVVc2VyQWN0aXZpdGllcyA9IGZ1bmN0aW9uIChiYWc6IGFueSkge1xuXHRcdFx0XHRpZiAoQXJyYXkuaXNBcnJheShiYWcpKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGJhZy5maWx0ZXIoKGFjdGl2aXR5KSA9PiBhY3Rpdml0eS5pZCAhPT0gc2VuZGVyLmlkKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRmb3IgKGNvbnN0IHAgaW4gYmFnKSB7XG5cdFx0XHRcdFx0XHRiYWdbcF0gPSByZW1vdmVVc2VyQWN0aXZpdGllcyhiYWdbcF0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gYmFnO1xuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXHRcdFx0cmVtb3ZlVXNlckFjdGl2aXRpZXMoYWxsQWN0aXZpdGllcyk7XG5cdFx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KEFDVElWSVRJRVMsIGFsbEFjdGl2aXRpZXMpO1xuXHRcdFx0YnJlYWs7XG5cblx0XHRjYXNlIEFjdGl2aXR5LkNoYW5nZTpcblx0XHRcdGNvbnN0IG1ldGFQYXRocyA9IG1lc3NhZ2U/LmNsaWVudENvbnRlbnQ/LnNwbGl0KFwifFwiKS5tYXAoKHBhdGgpID0+IHtcblx0XHRcdFx0cmV0dXJuICh2aWV3LmdldE1vZGVsKCkuZ2V0TWV0YU1vZGVsKCkgYXMgT0RhdGFNZXRhTW9kZWwpLmdldE1ldGFQYXRoKHBhdGgpO1xuXHRcdFx0fSk7XG5cblx0XHRcdG1ldGFQYXRocy5mb3JFYWNoKChjdXJyZW50TWV0YVBhdGgsIGkpID0+IHtcblx0XHRcdFx0Y29uc3QgbmVzdGVlZE1lc3NhZ2UgPSB7XG5cdFx0XHRcdFx0Li4ubWVzc2FnZSxcblx0XHRcdFx0XHRjbGllbnRDb250ZW50OiBtZXNzYWdlPy5jbGllbnRDb250ZW50Py5zcGxpdChcInxcIilbaV1cblx0XHRcdFx0fTtcblx0XHRcdFx0bGV0IGN1cnJlbnRBY3Rpdml0aWVzOiBhbnlbXSA9IGludGVybmFsTW9kZWwuZ2V0UHJvcGVydHkoQUNUSVZJVElFUyArIGN1cnJlbnRNZXRhUGF0aCkgfHwgW107XG5cdFx0XHRcdGFjdGl2aXR5S2V5ID0gZ2V0QWN0aXZpdHlLZXkobmVzdGVlZE1lc3NhZ2UuY2xpZW50Q29udGVudCk7XG5cdFx0XHRcdGN1cnJlbnRBY3Rpdml0aWVzID0gY3VycmVudEFjdGl2aXRpZXM/LmZpbHRlciAmJiBjdXJyZW50QWN0aXZpdGllcy5maWx0ZXIoKGFjdGl2aXR5KSA9PiBhY3Rpdml0eS5rZXkgIT09IGFjdGl2aXR5S2V5KTtcblx0XHRcdFx0aWYgKGN1cnJlbnRBY3Rpdml0aWVzKSB7XG5cdFx0XHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShBQ1RJVklUSUVTICsgY3VycmVudE1ldGFQYXRoLCBjdXJyZW50QWN0aXZpdGllcyk7XG5cdFx0XHRcdFx0dXBkYXRlKHZpZXcsIG5lc3RlZWRNZXNzYWdlLCBjdXJyZW50TWV0YVBhdGgsIEFjdGl2aXR5LkNoYW5nZSk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBBY3Rpdml0eS5DcmVhdGU6XG5cdFx0XHQvLyBGb3IgY3JlYXRlIHdlIGFjdHVhbGx5IGp1c3QgbmVlZCB0byByZWZyZXNoIHRoZSB0YWJsZVxuXHRcdFx0dXBkYXRlKHZpZXcsIG1lc3NhZ2UsIG1ldGFQYXRoLCBBY3Rpdml0eS5DcmVhdGUpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBBY3Rpdml0eS5EZWxldGU6XG5cdFx0XHQvLyBGb3Igbm93IGFsc28gcmVmcmVzaCB0aGUgcGFnZSBidXQgaW4gY2FzZSBvZiBkZWxldGlvbiB3ZSBuZWVkIHRvIGluZm9ybSB0aGUgdXNlclxuXHRcdFx0dXBkYXRlKHZpZXcsIG1lc3NhZ2UsIG1ldGFQYXRoLCBBY3Rpdml0eS5EZWxldGUpO1xuXHRcdFx0YnJlYWs7XG5cdFx0Y2FzZSBBY3Rpdml0eS5BY3RpdmF0ZTpcblx0XHRcdGRpc2Nvbm5lY3Qodmlldyk7XG5cdFx0XHRNZXNzYWdlQm94LmluZm9ybWF0aW9uKENvbGxhYm9yYXRpb25VdGlscy5nZXRUZXh0KFwiQ19DT0xMQUJPUkFUSU9ORFJBRlRfQUNUSVZBVEVcIiwgc2VuZGVyLm5hbWUpKTtcblx0XHRcdG5hdmlnYXRlKG1lc3NhZ2UuY2xpZW50Q29udGVudCwgdmlldyk7XG5cdFx0XHRicmVhaztcblx0XHRjYXNlIEFjdGl2aXR5LkRpc2NhcmQ6XG5cdFx0XHRkaXNjb25uZWN0KHZpZXcpO1xuXHRcdFx0TWVzc2FnZUJveC5pbmZvcm1hdGlvbihDb2xsYWJvcmF0aW9uVXRpbHMuZ2V0VGV4dChcIkNfQ09MTEFCT1JBVElPTkRSQUZUX0RJU0NBUkRcIiwgc2VuZGVyLm5hbWUpKTtcblx0XHRcdG5hdmlnYXRlKG1lc3NhZ2UuY2xpZW50Q29udGVudCwgdmlldyk7XG5cdFx0XHRicmVhaztcblx0XHQvKlxuXHRcdC8vIFRPRE86IEFjdGlvbiB0byBiZSBpbXBsZW1lbnRlZFxuXHRcdGNhc2UgQWN0aXZpdHkuQWN0aW9uOlxuXHRcdFx0Ly8gSnVzdCBmb3IgdGVzdCByZWFzb25zIHNob3cgYSB0b2FzdCAtIHRvIGJlIGNoZWNrZWQgd2l0aCBVWFxuXHRcdFx0TWVzc2FnZVRvYXN0LnNob3coXCJVc2VyIFwiICsgc2VuZGVyLm5hbWUgKyBcIiBoYXMgZXhlY3V0ZWQgYWN0aW9uIFwiICsgbWV0YVBhdGguc3BsaXQoXCJ8XCIpWzBdKTtcblx0XHRcdC8vdXBkYXRlKHZpZXcsIG1lc3NhZ2UsIG1ldGFQYXRoLCBBY3Rpdml0eS5EZWxldGUpO1xuXHRcdFx0YnJlYWs7XG5cdFx0ICovXG5cdFx0Y2FzZSBBY3Rpdml0eS5MaXZlQ2hhbmdlOlxuXHRcdFx0bWFjdGl2aXR5ID0gc2VuZGVyO1xuXHRcdFx0bWFjdGl2aXR5LmtleSA9IGdldEFjdGl2aXR5S2V5KG1lc3NhZ2UuY2xpZW50Q29udGVudCk7XG5cblx0XHRcdC8vIHN0dXBpZCBKU09OIG1vZGVsLi4uXG5cdFx0XHRsZXQgaW5pdEpTT05Nb2RlbDogc3RyaW5nID0gXCJcIjtcblx0XHRcdGNvbnN0IHBhcnRzID0gbWV0YVBhdGguc3BsaXQoXCIvXCIpO1xuXHRcdFx0Zm9yIChsZXQgaSA9IDE7IGkgPCBwYXJ0cy5sZW5ndGggLSAxOyBpKyspIHtcblx0XHRcdFx0aW5pdEpTT05Nb2RlbCArPSBgLyR7cGFydHNbaV19YDtcblx0XHRcdFx0aWYgKCFpbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KEFDVElWSVRJRVMgKyBpbml0SlNPTk1vZGVsKSkge1xuXHRcdFx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQUNUSVZJVElFUyArIGluaXRKU09OTW9kZWwsIHt9KTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRhY3Rpdml0aWVzID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShBQ1RJVklUSUVTICsgbWV0YVBhdGgpO1xuXHRcdFx0YWN0aXZpdGllcyA9IGFjdGl2aXRpZXM/LnNsaWNlID8gYWN0aXZpdGllcy5zbGljZSgpIDogW107XG5cdFx0XHRhY3Rpdml0aWVzLnB1c2gobWFjdGl2aXR5KTtcblx0XHRcdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQUNUSVZJVElFUyArIG1ldGFQYXRoLCBhY3Rpdml0aWVzKTtcblx0XHRcdGJyZWFrO1xuXHRcdGNhc2UgQWN0aXZpdHkuVW5kbzpcblx0XHRcdC8vIFRoZSB1c2VyIGRpZCBhIGNoYW5nZSBidXQgcmV2ZXJ0ZWQgaXQsIHRoZXJlZm9yZSB1bmJsb2NrIHRoZSBjb250cm9sXG5cdFx0XHRhY3Rpdml0aWVzID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShBQ1RJVklUSUVTICsgbWV0YVBhdGgpO1xuXHRcdFx0YWN0aXZpdHlLZXkgPSBnZXRBY3Rpdml0eUtleShtZXNzYWdlLmNsaWVudENvbnRlbnQpO1xuXHRcdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShcblx0XHRcdFx0QUNUSVZJVElFUyArIG1ldGFQYXRoLFxuXHRcdFx0XHRhY3Rpdml0aWVzLmZpbHRlcigoYSkgPT4gYS5rZXkgIT09IGFjdGl2aXR5S2V5KVxuXHRcdFx0KTtcblx0XHRcdGJyZWFrO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHVwZGF0ZSh2aWV3OiBWaWV3LCBtZXNzYWdlOiBNZXNzYWdlLCBtZXRhUGF0aDogc3RyaW5nLCBhY3Rpb246IEFjdGl2aXR5KSB7XG5cdGNvbnN0IGFwcENvbXBvbmVudCA9IENvbGxhYm9yYXRpb25VdGlscy5nZXRBcHBDb21wb25lbnQodmlldyk7XG5cdGNvbnN0IG1ldGFNb2RlbCA9IHZpZXcuZ2V0TW9kZWwoKS5nZXRNZXRhTW9kZWwoKSBhcyBPRGF0YU1ldGFNb2RlbDtcblx0Y29uc3QgY3VycmVudFBhZ2UgPSBnZXRDdXJyZW50UGFnZSh2aWV3KTtcblx0Y29uc3Qgc2lkZUVmZmVjdHNTZXJ2aWNlID0gYXBwQ29tcG9uZW50LmdldFNpZGVFZmZlY3RzU2VydmljZSgpO1xuXHRjb25zdCBjdXJyZW50Q29udGV4dCA9IGN1cnJlbnRQYWdlLmdldEJpbmRpbmdDb250ZXh0KCk7XG5cdGNvbnN0IGN1cnJlbnRQYXRoID0gY3VycmVudENvbnRleHQuZ2V0UGF0aCgpO1xuXHRjb25zdCBjdXJyZW50TWV0YVBhdGggPSBtZXRhTW9kZWwuZ2V0TWV0YVBhdGgoY3VycmVudFBhdGgpO1xuXHRsZXQgY2hhbmdlZERvY3VtZW50ID0gbWVzc2FnZS5jbGllbnRDb250ZW50O1xuXG5cdGlmIChhY3Rpb24gPT09IEFjdGl2aXR5LkRlbGV0ZSkge1xuXHRcdC8vIGNoZWNrIGlmIHVzZXIgY3VycmVudGx5IGRpc3BsYXlzIG9uZSBkZWxldGVkIG9iamVjdFxuXHRcdGNvbnN0IGRlbGV0ZWRPYmplY3RzID0gbWVzc2FnZS5jbGllbnRDb250ZW50LnNwbGl0KFwifFwiKTtcblx0XHRjb25zdCBwYXJlbnREZWxldGVkSW5kZXggPSBkZWxldGVkT2JqZWN0cy5maW5kSW5kZXgoKGRlbGV0ZWRPYmplY3QpID0+IGN1cnJlbnRQYXRoLnN0YXJ0c1dpdGgoZGVsZXRlZE9iamVjdCkpO1xuXHRcdGlmIChwYXJlbnREZWxldGVkSW5kZXggPiAtMSkge1xuXHRcdFx0Ly8gYW55IG90aGVyIHVzZXIgZGVsZXRlZCB0aGUgb2JqZWN0IEknbSBjdXJyZW50bHkgbG9va2luZyBhdC4gSW5mb3JtIHRoZSB1c2VyIHdlIHdpbGwgbmF2aWdhdGUgdG8gcm9vdCBub3dcblx0XHRcdE1lc3NhZ2VCb3guaW5mb3JtYXRpb24oQ29sbGFib3JhdGlvblV0aWxzLmdldFRleHQoXCJDX0NPTExBQk9SQVRJT05EUkFGVF9ERUxFVEVcIiwgbWVzc2FnZS51c2VyRGVzY3JpcHRpb24pLCB7XG5cdFx0XHRcdG9uQ2xvc2U6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRjb25zdCB0YXJnZXRDb250ZXh0ID0gdmlldy5nZXRNb2RlbCgpLmJpbmRDb250ZXh0KGRlbGV0ZWRPYmplY3RzW3BhcmVudERlbGV0ZWRJbmRleF0pLmdldEJvdW5kQ29udGV4dCgpO1xuXHRcdFx0XHRcdGN1cnJlbnRQYWdlLmdldENvbnRyb2xsZXIoKS5fcm91dGluZy5uYXZpZ2F0ZUJhY2tGcm9tQ29udGV4dCh0YXJnZXRDb250ZXh0KTtcblx0XHRcdFx0fVxuXHRcdFx0fSk7XG5cdFx0fVxuXHRcdC8vIFRPRE86IEZvciBub3cganVzdCB0YWtlIHRoZSBmaXJzdCBvYmplY3QgdG8gZ2V0IHRoZSBtZXRhIHBhdGggYW5kIGRvIGEgZnVsbCByZWZyZXNoIG9mIHRoZSB0YWJsZVxuXHRcdGNoYW5nZWREb2N1bWVudCA9IGRlbGV0ZWRPYmplY3RzWzBdO1xuXHR9XG5cblx0aWYgKGNoYW5nZWREb2N1bWVudC5zdGFydHNXaXRoKGN1cnJlbnRQYXRoKSkge1xuXHRcdC8vIEV4ZWN1dGUgU2lkZUVmZmVjdHMgKFRPRE8gZm9yIE1lZXQgdGhlcmUgc2hvdWxkIGJlIG9uZSBjZW50cmFsIG1ldGhvZClcblx0XHRjb25zdCBhY3Rpdml0eVBhdGggPSBtZXRhUGF0aC5yZXBsYWNlKGN1cnJlbnRNZXRhUGF0aCwgXCJcIikuc2xpY2UoMSk7XG5cdFx0aWYgKGFjdGl2aXR5UGF0aCkge1xuXHRcdFx0Ly8gUmVxdWVzdCBhbHNvIHRoZSBwcm9wZXJ0eSBpdHNlbGZcblx0XHRcdGNvbnN0IHNpZGVFZmZlY3RzOiBhbnlbXSA9IFtcblx0XHRcdFx0e1xuXHRcdFx0XHRcdCRQcm9wZXJ0eVBhdGg6IGFjdGl2aXR5UGF0aFxuXHRcdFx0XHR9XG5cdFx0XHRdO1xuXHRcdFx0Y29uc3QgZW50aXR5VHlwZSA9IHNpZGVFZmZlY3RzU2VydmljZS5nZXRFbnRpdHlUeXBlRnJvbUNvbnRleHQoY3VycmVudENvbnRleHQpO1xuXHRcdFx0Y29uc3QgZW50aXR5VHlwZVNpZGVFZmZlY3RzID0gc2lkZUVmZmVjdHNTZXJ2aWNlLmdldE9EYXRhRW50aXR5U2lkZUVmZmVjdHMoZW50aXR5VHlwZSEpO1xuXHRcdFx0Ly8gUG9vciBtYW4gc29sdXRpb24gd2l0aG91dCBjaGVja2luZyBzb3VyY2UgdGFyZ2V0cywganVzdCBmb3IgUE9DLCB0aGlzIGlzIHRocm93LXdheSBjb2Rpbmcgb25seVxuXHRcdFx0Y29uc3Qgb2JqZWN0OiBhbnkgPSBPYmplY3Q7IC8vIGp1c3QgdG8gb3ZlcmNvbWUgVFMgaXNzdWVzLCB3aWxsIGJlIGFueXdheSByZXBsYWNlZFxuXHRcdFx0Y29uc3QgcmVsZXZhbnRTaWRlRWZmZWN0cyA9IG9iamVjdC5mcm9tRW50cmllcyhcblx0XHRcdFx0b2JqZWN0XG5cdFx0XHRcdFx0LmVudHJpZXMoZW50aXR5VHlwZVNpZGVFZmZlY3RzKVxuXHRcdFx0XHRcdC5maWx0ZXIoKHg6IGFueVtdKSA9PiB4WzFdLlNvdXJjZVByb3BlcnRpZXM/LmZpbmRJbmRleCgoc291cmNlOiBhbnkpID0+IHNvdXJjZS52YWx1ZSA9PT0gYWN0aXZpdHlQYXRoKSA+IC0xKVxuXHRcdFx0KTtcblx0XHRcdGZvciAoY29uc3QgcCBpbiByZWxldmFudFNpZGVFZmZlY3RzKSB7XG5cdFx0XHRcdHJlbGV2YW50U2lkZUVmZmVjdHNbcF0uVGFyZ2V0UHJvcGVydGllcy5mb3JFYWNoKGZ1bmN0aW9uICh0YXJnZXRQcm9wZXJ0eTogYW55KSB7XG5cdFx0XHRcdFx0c2lkZUVmZmVjdHMucHVzaCh7XG5cdFx0XHRcdFx0XHQkUHJvcGVydHlQYXRoOiB0YXJnZXRQcm9wZXJ0eVxuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KTtcblx0XHRcdH1cblx0XHRcdHNpZGVFZmZlY3RzU2VydmljZS5yZXF1ZXN0U2lkZUVmZmVjdHMoc2lkZUVmZmVjdHMsIGN1cnJlbnRDb250ZXh0LCBcIiRhdXRvXCIpO1xuXHRcdH1cblx0fVxuXG5cdC8vIFNpbXVsYXRlIGFueSBjaGFuZ2Ugc28gdGhlIGVkaXQgZmxvdyBzaG93cyB0aGUgZHJhZnQgaW5kaWNhdG9yIGFuZCBzZXRzIHRoZSBwYWdlIHRvIGRpcnR5XG5cdGN1cnJlbnRQYWdlLmdldENvbnRyb2xsZXIoKS5lZGl0Rmxvdy51cGRhdGVEb2N1bWVudChjdXJyZW50Q29udGV4dCwgUHJvbWlzZS5yZXNvbHZlKCkpO1xufVxuXG5mdW5jdGlvbiBuYXZpZ2F0ZShwYXRoOiBzdHJpbmcsIHZpZXc6IFZpZXcpIHtcblx0Ly8gVE9ETzogcm91dGluZy5uYXZpZ2F0ZSBkb2Vzbid0IGNvbnNpZGVyIHNlbWFudGljIGJvb2ttYXJraW5nXG5cdGNvbnN0IGN1cnJlbnRQYWdlID0gZ2V0Q3VycmVudFBhZ2Uodmlldyk7XG5cdGNvbnN0IHRhcmdldENvbnRleHQgPSB2aWV3LmdldE1vZGVsKCkuYmluZENvbnRleHQocGF0aCkuZ2V0Qm91bmRDb250ZXh0KCk7XG5cdGN1cnJlbnRQYWdlLmdldENvbnRyb2xsZXIoKS5yb3V0aW5nLm5hdmlnYXRlKHRhcmdldENvbnRleHQpO1xufVxuXG5mdW5jdGlvbiBnZXRDdXJyZW50UGFnZSh2aWV3OiBWaWV3KSB7XG5cdGNvbnN0IGFwcENvbXBvbmVudCA9IENvbGxhYm9yYXRpb25VdGlscy5nZXRBcHBDb21wb25lbnQodmlldyk7XG5cdHJldHVybiBDb21tb25VdGlscy5nZXRDdXJyZW50UGFnZVZpZXcoYXBwQ29tcG9uZW50KTtcbn1cblxuZnVuY3Rpb24gZ2V0QWN0aXZpdHlLZXkoeDogc3RyaW5nKTogc3RyaW5nIHtcblx0cmV0dXJuIHguc3Vic3RyaW5nKHgubGFzdEluZGV4T2YoXCIoXCIpICsgMSwgeC5sYXN0SW5kZXhPZihcIilcIikpO1xufVxuXG5leHBvcnQgZGVmYXVsdCB7XG5cdGNvbm5lY3Q6IGNvbm5lY3QsXG5cdGRpc2Nvbm5lY3Q6IGRpc2Nvbm5lY3QsXG5cdGlzQ29ubmVjdGVkOiBpc0Nvbm5lY3RlZCxcblx0aXNDb2xsYWJvcmF0aW9uRW5hYmxlZDogaXNDb2xsYWJvcmF0aW9uRW5hYmxlZCxcblx0c2VuZDogc2VuZFxufTtcbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7Ozs7Ozs7Ozs7OztFQWdCQSxJQUFNQSxVQUFVLEdBQUcsMkJBQTJCO0VBQzlDLElBQU1DLFdBQVcsR0FBRyw0QkFBNEI7RUFDaEQsSUFBTUMsVUFBVSxHQUFHLDJCQUEyQjtFQUV2QyxJQUFNQyxXQUFXLEdBQUcsVUFBVUMsT0FBZ0IsRUFBVztJQUMvRCxJQUFNQyxhQUFhLEdBQUdELE9BQU8sQ0FBQ0UsUUFBUSxDQUFDLFVBQVUsQ0FBYztJQUMvRCxP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