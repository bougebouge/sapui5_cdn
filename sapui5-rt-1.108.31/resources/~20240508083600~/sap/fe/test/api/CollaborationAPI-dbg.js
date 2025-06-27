/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/fe/core/controllerextensions/collaboration/ActivityBase", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/fe/core/controllerextensions/editFlow/draft", "sap/ui/model/json/JSONModel"], function (Log, ActivityBase, CollaborationCommon, draft, JSONModel) {
  "use strict";

  var Activity = CollaborationCommon.Activity;
  var initializeCollaboration = ActivityBase.initializeCollaboration;
  var endCollaboration = ActivityBase.endCollaboration;
  var broadcastCollaborationMessage = ActivityBase.broadcastCollaborationMessage;
  var CollaborationAPI = {
    _lastReceivedMessage: undefined,
    _rootPath: "",
    _oModel: undefined,
    _lockedPropertyPath: "",
    _internalModel: undefined,
    /**
     * Open an existing collaborative draft with a new user, and creates a 'ghost client' for this user.
     *
     * @param oContext The context of the collaborative draft
     * @param userID The ID of the user
     * @param userName The name of the user
     */
    enterDraft: function (oContext, userID, userName) {
      var webSocketBaseURL = oContext.getModel().getMetaModel().getObject("/@com.sap.vocabularies.Common.v1.WebSocketBaseURL");
      if (!webSocketBaseURL) {
        Log.error("Cannot find WebSocketBaseURL annotation");
        return;
      }
      var sDraftUUID = oContext.getProperty("DraftAdministrativeData/DraftUUID");
      this._internalModel = new JSONModel({});
      var serviceUrl = oContext.getModel().getServiceUrl();
      initializeCollaboration({
        id: userID,
        name: userName,
        initialName: userName
      }, webSocketBaseURL, sDraftUUID, serviceUrl, this._internalModel, this._onMessageReceived.bind(this), true);
      this._rootPath = oContext.getPath();
      this._oModel = oContext.getModel();
    },
    /**
     * Checks if the ghost client has revieved a given message.
     *
     * @param message The message content to be looked for
     * @returns True if the last recieved message matches the content
     */
    checkReceived: function (message) {
      if (!this._lastReceivedMessage) {
        return false;
      }
      var found = (!message.userID || message.userID === this._lastReceivedMessage.userID) && (!message.userAction || message.userAction === this._lastReceivedMessage.userAction) && (!message.clientContent || message.clientContent === this._lastReceivedMessage.clientContent);
      this._lastReceivedMessage = undefined; // reset history to avoid finding the same message twice

      return found;
    },
    /**
     * Closes the ghost client and removes the user from the collaborative draft.
     */
    leaveDraft: function () {
      if (this._internalModel) {
        endCollaboration(this._internalModel);
        this._internalModel.destroy();
        this._internalModel = undefined;
      }
    },
    /**
     * Simulates that the user starts typing in an input (live change).
     *
     * @param sPropertyPath The path of the property being modified
     */
    startLiveChange: function (sPropertyPath) {
      if (this._internalModel) {
        if (this._lockedPropertyPath) {
          // Unlock previous property path
          this.undoChange();
        }
        this._lockedPropertyPath = sPropertyPath;
        broadcastCollaborationMessage(Activity.LiveChange, "".concat(this._rootPath, "/").concat(sPropertyPath), this._internalModel);
      }
    },
    /**
     * Simulates that the user has modified a property.
     *
     * @param sPropertyPath The path of the property being modified
     * @param value The new value of the property being modified
     */
    updatePropertyValue: function (sPropertyPath, value) {
      var _this = this;
      if (this._internalModel) {
        if (this._lockedPropertyPath !== sPropertyPath) {
          this.startLiveChange(sPropertyPath);
        }
        var oContextBinding = this._oModel.bindContext(this._rootPath, undefined, {
          $$patchWithoutSideEffects: true,
          $$groupId: "$auto",
          $$updateGroupId: "$auto"
        });
        var oPropertyBinding = this._oModel.bindProperty(sPropertyPath, oContextBinding.getBoundContext());
        oPropertyBinding.requestValue().then(function () {
          oPropertyBinding.setValue(value);
          oContextBinding.attachEventOnce("patchCompleted", function () {
            broadcastCollaborationMessage(Activity.Change, "".concat(_this._rootPath, "/").concat(sPropertyPath), _this._internalModel);
            _this._lockedPropertyPath = "";
          });
        }).catch(function (err) {
          Log.error(err);
        });
      }
    },
    /**
     * Simulates that the user did an 'undo' (to be called after startLiveChange).
     */
    undoChange: function () {
      if (this._lockedPropertyPath) {
        broadcastCollaborationMessage(Activity.Undo, "".concat(this._rootPath, "/").concat(this._lockedPropertyPath), this._internalModel);
        this._lockedPropertyPath = "";
      }
    },
    /**
     * Simulates that the user has discarded the draft.
     */
    discardDraft: function () {
      var _this2 = this;
      if (this._internalModel) {
        var draftContext = this._getDraftContext();
        draftContext.requestProperty("IsActiveEntity").then(function () {
          draft.deleteDraft(draftContext);
        }).then(function () {
          broadcastCollaborationMessage(Activity.Discard, _this2._rootPath.replace("IsActiveEntity=false", "IsActiveEntity=true"), _this2._internalModel);
          _this2._internalModel.destroy();
          _this2._internalModel = undefined;
        }).catch(function (err) {
          Log.error(err);
        });
      }
    },
    /**
     * Simulates that the user has deleted the draft.
     */
    deleteDraft: function () {
      var _this3 = this;
      if (this._internalModel) {
        var draftContext = this._getDraftContext();
        var activeContext;
        draftContext.requestProperty("IsActiveEntity").then(function () {
          return draftContext.getModel().bindContext("".concat(_this3._rootPath, "/SiblingEntity")).getBoundContext();
        }).then(function (context) {
          activeContext = context;
          return context.requestCanonicalPath();
        }).then(function () {
          return draft.deleteDraft(draftContext);
        }).then(function () {
          activeContext.delete();
          broadcastCollaborationMessage(Activity.Delete, _this3._rootPath, _this3._internalModel);
          _this3._internalModel.destroy();
          _this3._internalModel = undefined;
        }).catch(function (err) {
          Log.error(err);
        });
      }
    },
    // /////////////////////////////
    // Private methods

    _getDraftContext: function () {
      return this._oModel.bindContext(this._rootPath, undefined, {
        $$patchWithoutSideEffects: true,
        $$groupId: "$auto",
        $$updateGroupId: "$auto"
      }).getBoundContext();
    },
    /**
     * Callback of the ghost client when receiving a message on the web socket.
     *
     * @param oMessage The message
     */
    _onMessageReceived: function (oMessage) {
      oMessage.userAction = oMessage.userAction || oMessage.clientAction;
      this._lastReceivedMessage = oMessage;
      if (oMessage.userAction === Activity.Join) {
        broadcastCollaborationMessage(Activity.JoinEcho, this._lockedPropertyPath ? "".concat(this._rootPath, "/").concat(this._lockedPropertyPath) : undefined, this._internalModel);
      }
    }
  };
  return CollaborationAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDb2xsYWJvcmF0aW9uQVBJIiwiX2xhc3RSZWNlaXZlZE1lc3NhZ2UiLCJ1bmRlZmluZWQiLCJfcm9vdFBhdGgiLCJfb01vZGVsIiwiX2xvY2tlZFByb3BlcnR5UGF0aCIsIl9pbnRlcm5hbE1vZGVsIiwiZW50ZXJEcmFmdCIsIm9Db250ZXh0IiwidXNlcklEIiwidXNlck5hbWUiLCJ3ZWJTb2NrZXRCYXNlVVJMIiwiZ2V0TW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJnZXRPYmplY3QiLCJMb2ciLCJlcnJvciIsInNEcmFmdFVVSUQiLCJnZXRQcm9wZXJ0eSIsIkpTT05Nb2RlbCIsInNlcnZpY2VVcmwiLCJnZXRTZXJ2aWNlVXJsIiwiaW5pdGlhbGl6ZUNvbGxhYm9yYXRpb24iLCJpZCIsIm5hbWUiLCJpbml0aWFsTmFtZSIsIl9vbk1lc3NhZ2VSZWNlaXZlZCIsImJpbmQiLCJnZXRQYXRoIiwiY2hlY2tSZWNlaXZlZCIsIm1lc3NhZ2UiLCJmb3VuZCIsInVzZXJBY3Rpb24iLCJjbGllbnRDb250ZW50IiwibGVhdmVEcmFmdCIsImVuZENvbGxhYm9yYXRpb24iLCJkZXN0cm95Iiwic3RhcnRMaXZlQ2hhbmdlIiwic1Byb3BlcnR5UGF0aCIsInVuZG9DaGFuZ2UiLCJicm9hZGNhc3RDb2xsYWJvcmF0aW9uTWVzc2FnZSIsIkFjdGl2aXR5IiwiTGl2ZUNoYW5nZSIsInVwZGF0ZVByb3BlcnR5VmFsdWUiLCJ2YWx1ZSIsIm9Db250ZXh0QmluZGluZyIsImJpbmRDb250ZXh0IiwiJCRwYXRjaFdpdGhvdXRTaWRlRWZmZWN0cyIsIiQkZ3JvdXBJZCIsIiQkdXBkYXRlR3JvdXBJZCIsIm9Qcm9wZXJ0eUJpbmRpbmciLCJiaW5kUHJvcGVydHkiLCJnZXRCb3VuZENvbnRleHQiLCJyZXF1ZXN0VmFsdWUiLCJ0aGVuIiwic2V0VmFsdWUiLCJhdHRhY2hFdmVudE9uY2UiLCJDaGFuZ2UiLCJjYXRjaCIsImVyciIsIlVuZG8iLCJkaXNjYXJkRHJhZnQiLCJkcmFmdENvbnRleHQiLCJfZ2V0RHJhZnRDb250ZXh0IiwicmVxdWVzdFByb3BlcnR5IiwiZHJhZnQiLCJkZWxldGVEcmFmdCIsIkRpc2NhcmQiLCJyZXBsYWNlIiwiYWN0aXZlQ29udGV4dCIsImNvbnRleHQiLCJyZXF1ZXN0Q2Fub25pY2FsUGF0aCIsImRlbGV0ZSIsIkRlbGV0ZSIsIm9NZXNzYWdlIiwiY2xpZW50QWN0aW9uIiwiSm9pbiIsIkpvaW5FY2hvIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb2xsYWJvcmF0aW9uQVBJLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IHtcblx0YnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UsXG5cdGVuZENvbGxhYm9yYXRpb24sXG5cdGluaXRpYWxpemVDb2xsYWJvcmF0aW9uXG59IGZyb20gXCJzYXAvZmUvY29yZS9jb250cm9sbGVyZXh0ZW5zaW9ucy9jb2xsYWJvcmF0aW9uL0FjdGl2aXR5QmFzZVwiO1xuaW1wb3J0IHR5cGUgeyBNZXNzYWdlIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQ29sbGFib3JhdGlvbkNvbW1vblwiO1xuaW1wb3J0IHsgQWN0aXZpdHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uQ29tbW9uXCI7XG5pbXBvcnQgZHJhZnQgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2VkaXRGbG93L2RyYWZ0XCI7XG5pbXBvcnQgSlNPTk1vZGVsIGZyb20gXCJzYXAvdWkvbW9kZWwvanNvbi9KU09OTW9kZWxcIjtcbmltcG9ydCB0eXBlIE9EYXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1vZGVsXCI7XG5pbXBvcnQgdHlwZSB7IFY0Q29udGV4dCB9IGZyb20gXCJ0eXBlcy9leHRlbnNpb25fdHlwZXNcIjtcblxuY29uc3QgQ29sbGFib3JhdGlvbkFQSSA9IHtcblx0X2xhc3RSZWNlaXZlZE1lc3NhZ2U6IHVuZGVmaW5lZCBhcyBNZXNzYWdlIHwgdW5kZWZpbmVkLFxuXHRfcm9vdFBhdGg6IFwiXCIsXG5cdF9vTW9kZWw6IHVuZGVmaW5lZCBhcyBPRGF0YU1vZGVsIHwgdW5kZWZpbmVkLFxuXHRfbG9ja2VkUHJvcGVydHlQYXRoOiBcIlwiLFxuXHRfaW50ZXJuYWxNb2RlbDogdW5kZWZpbmVkIGFzIEpTT05Nb2RlbCB8IHVuZGVmaW5lZCxcblxuXHQvKipcblx0ICogT3BlbiBhbiBleGlzdGluZyBjb2xsYWJvcmF0aXZlIGRyYWZ0IHdpdGggYSBuZXcgdXNlciwgYW5kIGNyZWF0ZXMgYSAnZ2hvc3QgY2xpZW50JyBmb3IgdGhpcyB1c2VyLlxuXHQgKlxuXHQgKiBAcGFyYW0gb0NvbnRleHQgVGhlIGNvbnRleHQgb2YgdGhlIGNvbGxhYm9yYXRpdmUgZHJhZnRcblx0ICogQHBhcmFtIHVzZXJJRCBUaGUgSUQgb2YgdGhlIHVzZXJcblx0ICogQHBhcmFtIHVzZXJOYW1lIFRoZSBuYW1lIG9mIHRoZSB1c2VyXG5cdCAqL1xuXHRlbnRlckRyYWZ0OiBmdW5jdGlvbiAob0NvbnRleHQ6IFY0Q29udGV4dCwgdXNlcklEOiBzdHJpbmcsIHVzZXJOYW1lOiBzdHJpbmcpIHtcblx0XHRjb25zdCB3ZWJTb2NrZXRCYXNlVVJMOiBzdHJpbmcgPSBvQ29udGV4dC5nZXRNb2RlbCgpLmdldE1ldGFNb2RlbCgpLmdldE9iamVjdChcIi9AY29tLnNhcC52b2NhYnVsYXJpZXMuQ29tbW9uLnYxLldlYlNvY2tldEJhc2VVUkxcIik7XG5cblx0XHRpZiAoIXdlYlNvY2tldEJhc2VVUkwpIHtcblx0XHRcdExvZy5lcnJvcihcIkNhbm5vdCBmaW5kIFdlYlNvY2tldEJhc2VVUkwgYW5ub3RhdGlvblwiKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRjb25zdCBzRHJhZnRVVUlEOiBzdHJpbmcgPSBvQ29udGV4dC5nZXRQcm9wZXJ0eShcIkRyYWZ0QWRtaW5pc3RyYXRpdmVEYXRhL0RyYWZ0VVVJRFwiKTtcblx0XHR0aGlzLl9pbnRlcm5hbE1vZGVsID0gbmV3IEpTT05Nb2RlbCh7fSk7XG5cblx0XHRjb25zdCBzZXJ2aWNlVXJsID0gb0NvbnRleHQuZ2V0TW9kZWwoKS5nZXRTZXJ2aWNlVXJsKCk7XG5cblx0XHRpbml0aWFsaXplQ29sbGFib3JhdGlvbihcblx0XHRcdHtcblx0XHRcdFx0aWQ6IHVzZXJJRCxcblx0XHRcdFx0bmFtZTogdXNlck5hbWUsXG5cdFx0XHRcdGluaXRpYWxOYW1lOiB1c2VyTmFtZVxuXHRcdFx0fSxcblx0XHRcdHdlYlNvY2tldEJhc2VVUkwsXG5cdFx0XHRzRHJhZnRVVUlELFxuXHRcdFx0c2VydmljZVVybCxcblx0XHRcdHRoaXMuX2ludGVybmFsTW9kZWwsXG5cdFx0XHR0aGlzLl9vbk1lc3NhZ2VSZWNlaXZlZC5iaW5kKHRoaXMpLFxuXHRcdFx0dHJ1ZVxuXHRcdCk7XG5cblx0XHR0aGlzLl9yb290UGF0aCA9IG9Db250ZXh0LmdldFBhdGgoKTtcblx0XHR0aGlzLl9vTW9kZWwgPSBvQ29udGV4dC5nZXRNb2RlbCgpIGFzIE9EYXRhTW9kZWw7XG5cdH0sXG5cblx0LyoqXG5cdCAqIENoZWNrcyBpZiB0aGUgZ2hvc3QgY2xpZW50IGhhcyByZXZpZXZlZCBhIGdpdmVuIG1lc3NhZ2UuXG5cdCAqXG5cdCAqIEBwYXJhbSBtZXNzYWdlIFRoZSBtZXNzYWdlIGNvbnRlbnQgdG8gYmUgbG9va2VkIGZvclxuXHQgKiBAcmV0dXJucyBUcnVlIGlmIHRoZSBsYXN0IHJlY2lldmVkIG1lc3NhZ2UgbWF0Y2hlcyB0aGUgY29udGVudFxuXHQgKi9cblx0Y2hlY2tSZWNlaXZlZDogZnVuY3Rpb24gKG1lc3NhZ2U6IFBhcnRpYWw8TWVzc2FnZT4pOiBib29sZWFuIHtcblx0XHRpZiAoIXRoaXMuX2xhc3RSZWNlaXZlZE1lc3NhZ2UpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRjb25zdCBmb3VuZCA9XG5cdFx0XHQoIW1lc3NhZ2UudXNlcklEIHx8IG1lc3NhZ2UudXNlcklEID09PSB0aGlzLl9sYXN0UmVjZWl2ZWRNZXNzYWdlLnVzZXJJRCkgJiZcblx0XHRcdCghbWVzc2FnZS51c2VyQWN0aW9uIHx8IG1lc3NhZ2UudXNlckFjdGlvbiA9PT0gdGhpcy5fbGFzdFJlY2VpdmVkTWVzc2FnZS51c2VyQWN0aW9uKSAmJlxuXHRcdFx0KCFtZXNzYWdlLmNsaWVudENvbnRlbnQgfHwgbWVzc2FnZS5jbGllbnRDb250ZW50ID09PSB0aGlzLl9sYXN0UmVjZWl2ZWRNZXNzYWdlLmNsaWVudENvbnRlbnQpO1xuXG5cdFx0dGhpcy5fbGFzdFJlY2VpdmVkTWVzc2FnZSA9IHVuZGVmaW5lZDsgLy8gcmVzZXQgaGlzdG9yeSB0byBhdm9pZCBmaW5kaW5nIHRoZSBzYW1lIG1lc3NhZ2UgdHdpY2VcblxuXHRcdHJldHVybiBmb3VuZDtcblx0fSxcblxuXHQvKipcblx0ICogQ2xvc2VzIHRoZSBnaG9zdCBjbGllbnQgYW5kIHJlbW92ZXMgdGhlIHVzZXIgZnJvbSB0aGUgY29sbGFib3JhdGl2ZSBkcmFmdC5cblx0ICovXG5cdGxlYXZlRHJhZnQ6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5faW50ZXJuYWxNb2RlbCkge1xuXHRcdFx0ZW5kQ29sbGFib3JhdGlvbih0aGlzLl9pbnRlcm5hbE1vZGVsKTtcblx0XHRcdHRoaXMuX2ludGVybmFsTW9kZWwuZGVzdHJveSgpO1xuXHRcdFx0dGhpcy5faW50ZXJuYWxNb2RlbCA9IHVuZGVmaW5lZDtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNpbXVsYXRlcyB0aGF0IHRoZSB1c2VyIHN0YXJ0cyB0eXBpbmcgaW4gYW4gaW5wdXQgKGxpdmUgY2hhbmdlKS5cblx0ICpcblx0ICogQHBhcmFtIHNQcm9wZXJ0eVBhdGggVGhlIHBhdGggb2YgdGhlIHByb3BlcnR5IGJlaW5nIG1vZGlmaWVkXG5cdCAqL1xuXHRzdGFydExpdmVDaGFuZ2U6IGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBzdHJpbmcpIHtcblx0XHRpZiAodGhpcy5faW50ZXJuYWxNb2RlbCkge1xuXHRcdFx0aWYgKHRoaXMuX2xvY2tlZFByb3BlcnR5UGF0aCkge1xuXHRcdFx0XHQvLyBVbmxvY2sgcHJldmlvdXMgcHJvcGVydHkgcGF0aFxuXHRcdFx0XHR0aGlzLnVuZG9DaGFuZ2UoKTtcblx0XHRcdH1cblx0XHRcdHRoaXMuX2xvY2tlZFByb3BlcnR5UGF0aCA9IHNQcm9wZXJ0eVBhdGg7XG5cdFx0XHRicm9hZGNhc3RDb2xsYWJvcmF0aW9uTWVzc2FnZShBY3Rpdml0eS5MaXZlQ2hhbmdlLCBgJHt0aGlzLl9yb290UGF0aH0vJHtzUHJvcGVydHlQYXRofWAsIHRoaXMuX2ludGVybmFsTW9kZWwpO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogU2ltdWxhdGVzIHRoYXQgdGhlIHVzZXIgaGFzIG1vZGlmaWVkIGEgcHJvcGVydHkuXG5cdCAqXG5cdCAqIEBwYXJhbSBzUHJvcGVydHlQYXRoIFRoZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSBiZWluZyBtb2RpZmllZFxuXHQgKiBAcGFyYW0gdmFsdWUgVGhlIG5ldyB2YWx1ZSBvZiB0aGUgcHJvcGVydHkgYmVpbmcgbW9kaWZpZWRcblx0ICovXG5cdHVwZGF0ZVByb3BlcnR5VmFsdWU6IGZ1bmN0aW9uIChzUHJvcGVydHlQYXRoOiBzdHJpbmcsIHZhbHVlOiBhbnkpIHtcblx0XHRpZiAodGhpcy5faW50ZXJuYWxNb2RlbCkge1xuXHRcdFx0aWYgKHRoaXMuX2xvY2tlZFByb3BlcnR5UGF0aCAhPT0gc1Byb3BlcnR5UGF0aCkge1xuXHRcdFx0XHR0aGlzLnN0YXJ0TGl2ZUNoYW5nZShzUHJvcGVydHlQYXRoKTtcblx0XHRcdH1cblxuXHRcdFx0Y29uc3Qgb0NvbnRleHRCaW5kaW5nID0gdGhpcy5fb01vZGVsIS5iaW5kQ29udGV4dCh0aGlzLl9yb290UGF0aCwgdW5kZWZpbmVkLCB7XG5cdFx0XHRcdCQkcGF0Y2hXaXRob3V0U2lkZUVmZmVjdHM6IHRydWUsXG5cdFx0XHRcdCQkZ3JvdXBJZDogXCIkYXV0b1wiLFxuXHRcdFx0XHQkJHVwZGF0ZUdyb3VwSWQ6IFwiJGF1dG9cIlxuXHRcdFx0fSk7XG5cblx0XHRcdGNvbnN0IG9Qcm9wZXJ0eUJpbmRpbmcgPSB0aGlzLl9vTW9kZWwhLmJpbmRQcm9wZXJ0eShzUHJvcGVydHlQYXRoLCBvQ29udGV4dEJpbmRpbmcuZ2V0Qm91bmRDb250ZXh0KCkpO1xuXG5cdFx0XHRvUHJvcGVydHlCaW5kaW5nXG5cdFx0XHRcdC5yZXF1ZXN0VmFsdWUoKVxuXHRcdFx0XHQudGhlbigoKSA9PiB7XG5cdFx0XHRcdFx0b1Byb3BlcnR5QmluZGluZy5zZXRWYWx1ZSh2YWx1ZSk7XG5cdFx0XHRcdFx0b0NvbnRleHRCaW5kaW5nLmF0dGFjaEV2ZW50T25jZShcInBhdGNoQ29tcGxldGVkXCIsICgpID0+IHtcblx0XHRcdFx0XHRcdGJyb2FkY2FzdENvbGxhYm9yYXRpb25NZXNzYWdlKEFjdGl2aXR5LkNoYW5nZSwgYCR7dGhpcy5fcm9vdFBhdGh9LyR7c1Byb3BlcnR5UGF0aH1gLCB0aGlzLl9pbnRlcm5hbE1vZGVsISk7XG5cdFx0XHRcdFx0XHR0aGlzLl9sb2NrZWRQcm9wZXJ0eVBhdGggPSBcIlwiO1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycikge1xuXHRcdFx0XHRcdExvZy5lcnJvcihlcnIpO1xuXHRcdFx0XHR9KTtcblx0XHR9XG5cdH0sXG5cblx0LyoqXG5cdCAqIFNpbXVsYXRlcyB0aGF0IHRoZSB1c2VyIGRpZCBhbiAndW5kbycgKHRvIGJlIGNhbGxlZCBhZnRlciBzdGFydExpdmVDaGFuZ2UpLlxuXHQgKi9cblx0dW5kb0NoYW5nZTogZnVuY3Rpb24gKCkge1xuXHRcdGlmICh0aGlzLl9sb2NrZWRQcm9wZXJ0eVBhdGgpIHtcblx0XHRcdGJyb2FkY2FzdENvbGxhYm9yYXRpb25NZXNzYWdlKEFjdGl2aXR5LlVuZG8sIGAke3RoaXMuX3Jvb3RQYXRofS8ke3RoaXMuX2xvY2tlZFByb3BlcnR5UGF0aH1gLCB0aGlzLl9pbnRlcm5hbE1vZGVsISk7XG5cdFx0XHR0aGlzLl9sb2NrZWRQcm9wZXJ0eVBhdGggPSBcIlwiO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogU2ltdWxhdGVzIHRoYXQgdGhlIHVzZXIgaGFzIGRpc2NhcmRlZCB0aGUgZHJhZnQuXG5cdCAqL1xuXHRkaXNjYXJkRHJhZnQ6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5faW50ZXJuYWxNb2RlbCkge1xuXHRcdFx0Y29uc3QgZHJhZnRDb250ZXh0ID0gdGhpcy5fZ2V0RHJhZnRDb250ZXh0KCk7XG5cblx0XHRcdGRyYWZ0Q29udGV4dFxuXHRcdFx0XHQucmVxdWVzdFByb3BlcnR5KFwiSXNBY3RpdmVFbnRpdHlcIilcblx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdGRyYWZ0LmRlbGV0ZURyYWZ0KGRyYWZ0Q29udGV4dCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRicm9hZGNhc3RDb2xsYWJvcmF0aW9uTWVzc2FnZShcblx0XHRcdFx0XHRcdEFjdGl2aXR5LkRpc2NhcmQsXG5cdFx0XHRcdFx0XHR0aGlzLl9yb290UGF0aC5yZXBsYWNlKFwiSXNBY3RpdmVFbnRpdHk9ZmFsc2VcIiwgXCJJc0FjdGl2ZUVudGl0eT10cnVlXCIpLFxuXHRcdFx0XHRcdFx0dGhpcy5faW50ZXJuYWxNb2RlbCFcblx0XHRcdFx0XHQpO1xuXHRcdFx0XHRcdHRoaXMuX2ludGVybmFsTW9kZWwhLmRlc3Ryb3koKTtcblx0XHRcdFx0XHR0aGlzLl9pbnRlcm5hbE1vZGVsID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKGVycik7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHQvKipcblx0ICogU2ltdWxhdGVzIHRoYXQgdGhlIHVzZXIgaGFzIGRlbGV0ZWQgdGhlIGRyYWZ0LlxuXHQgKi9cblx0ZGVsZXRlRHJhZnQ6IGZ1bmN0aW9uICgpIHtcblx0XHRpZiAodGhpcy5faW50ZXJuYWxNb2RlbCkge1xuXHRcdFx0Y29uc3QgZHJhZnRDb250ZXh0ID0gdGhpcy5fZ2V0RHJhZnRDb250ZXh0KCk7XG5cdFx0XHRsZXQgYWN0aXZlQ29udGV4dDogVjRDb250ZXh0O1xuXG5cdFx0XHRkcmFmdENvbnRleHRcblx0XHRcdFx0LnJlcXVlc3RQcm9wZXJ0eShcIklzQWN0aXZlRW50aXR5XCIpXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gZHJhZnRDb250ZXh0LmdldE1vZGVsKCkuYmluZENvbnRleHQoYCR7dGhpcy5fcm9vdFBhdGh9L1NpYmxpbmdFbnRpdHlgKS5nZXRCb3VuZENvbnRleHQoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKGNvbnRleHQ6IGFueSkgPT4ge1xuXHRcdFx0XHRcdGFjdGl2ZUNvbnRleHQgPSBjb250ZXh0O1xuXHRcdFx0XHRcdHJldHVybiBjb250ZXh0LnJlcXVlc3RDYW5vbmljYWxQYXRoKCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKCgpID0+IHtcblx0XHRcdFx0XHRyZXR1cm4gZHJhZnQuZGVsZXRlRHJhZnQoZHJhZnRDb250ZXh0KTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4oKCkgPT4ge1xuXHRcdFx0XHRcdChhY3RpdmVDb250ZXh0IGFzIGFueSkuZGVsZXRlKCk7XG5cdFx0XHRcdFx0YnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UoQWN0aXZpdHkuRGVsZXRlLCB0aGlzLl9yb290UGF0aCwgdGhpcy5faW50ZXJuYWxNb2RlbCEpO1xuXHRcdFx0XHRcdHRoaXMuX2ludGVybmFsTW9kZWwhLmRlc3Ryb3koKTtcblx0XHRcdFx0XHR0aGlzLl9pbnRlcm5hbE1vZGVsID0gdW5kZWZpbmVkO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQuY2F0Y2goZnVuY3Rpb24gKGVycjogYW55KSB7XG5cdFx0XHRcdFx0TG9nLmVycm9yKGVycik7XG5cdFx0XHRcdH0pO1xuXHRcdH1cblx0fSxcblxuXHQvLyAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXHQvLyBQcml2YXRlIG1ldGhvZHNcblxuXHRfZ2V0RHJhZnRDb250ZXh0OiBmdW5jdGlvbiAoKTogYW55IHtcblx0XHRyZXR1cm4gdGhpcy5fb01vZGVsIS5iaW5kQ29udGV4dCh0aGlzLl9yb290UGF0aCwgdW5kZWZpbmVkLCB7XG5cdFx0XHQkJHBhdGNoV2l0aG91dFNpZGVFZmZlY3RzOiB0cnVlLFxuXHRcdFx0JCRncm91cElkOiBcIiRhdXRvXCIsXG5cdFx0XHQkJHVwZGF0ZUdyb3VwSWQ6IFwiJGF1dG9cIlxuXHRcdH0pLmdldEJvdW5kQ29udGV4dCgpO1xuXHR9LFxuXG5cdC8qKlxuXHQgKiBDYWxsYmFjayBvZiB0aGUgZ2hvc3QgY2xpZW50IHdoZW4gcmVjZWl2aW5nIGEgbWVzc2FnZSBvbiB0aGUgd2ViIHNvY2tldC5cblx0ICpcblx0ICogQHBhcmFtIG9NZXNzYWdlIFRoZSBtZXNzYWdlXG5cdCAqL1xuXHRfb25NZXNzYWdlUmVjZWl2ZWQ6IGZ1bmN0aW9uIChvTWVzc2FnZTogTWVzc2FnZSkge1xuXHRcdG9NZXNzYWdlLnVzZXJBY3Rpb24gPSBvTWVzc2FnZS51c2VyQWN0aW9uIHx8IG9NZXNzYWdlLmNsaWVudEFjdGlvbjtcblx0XHR0aGlzLl9sYXN0UmVjZWl2ZWRNZXNzYWdlID0gb01lc3NhZ2U7XG5cblx0XHRpZiAob01lc3NhZ2UudXNlckFjdGlvbiA9PT0gQWN0aXZpdHkuSm9pbikge1xuXHRcdFx0YnJvYWRjYXN0Q29sbGFib3JhdGlvbk1lc3NhZ2UoXG5cdFx0XHRcdEFjdGl2aXR5LkpvaW5FY2hvLFxuXHRcdFx0XHR0aGlzLl9sb2NrZWRQcm9wZXJ0eVBhdGggPyBgJHt0aGlzLl9yb290UGF0aH0vJHt0aGlzLl9sb2NrZWRQcm9wZXJ0eVBhdGh9YCA6IHVuZGVmaW5lZCxcblx0XHRcdFx0dGhpcy5faW50ZXJuYWxNb2RlbCFcblx0XHRcdCk7XG5cdFx0fVxuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb2xsYWJvcmF0aW9uQVBJO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7OztFQWFBLElBQU1BLGdCQUFnQixHQUFHO0lBQ3hCQyxvQkFBb0IsRUFBRUMsU0FBZ0M7SUFDdERDLFNBQVMsRUFBRSxFQUFFO0lBQ2JDLE9BQU8sRUFBRUYsU0FBbUM7SUFDNUNHLG1CQUFtQixFQUFFLEVBQUU7SUFDdkJDLGNBQWMsRUFBRUosU0FBa0M7SUFFbEQ7QUFDRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7SUFDQ0ssVUFBVSxFQUFFLFVBQVVDLFFBQW1CLEVBQUVDLE1BQWMsRUFBRUMsUUFBZ0IsRUFBRTtNQUM1RSxJQUFNQyxnQkFBd0IsR0FBR0gsUUFBUSxDQUFDSSxRQUFRLEVBQUUsQ0FBQ0MsWUFBWSxFQUFFLENBQUNDLFNBQVMsQ0FBQyxtREFBbUQsQ0FBQztNQUVsSSxJQUFJLENBQUNILGdCQUFnQixFQUFFO1FBQ3RCSSxHQUFHLENBQUNDLEtBQUssQ0FBQyx5Q0FBeUMsQ0FBQztRQUNwRDtNQUNEO01BRUEsSUFBTUMsVUFBa0IsR0FBR1QsUUFBUSxDQUFDVSxXQUFXLENBQUMsbUNBQW1DLENBQUM7TUFDcEYsSUFBSSxDQUFDWixjQUFjLEdBQUcsSUFBSWEsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO01BRXZDLElBQU1DLFVBQVUsR0FBR1osUUFBUSxDQUFDSSxRQUFRLEVBQUUsQ0FBQ1MsYUFBYSxFQUFFO01BRXREQyx1QkFBdUIsQ0FDdEI7UUFDQ0MsRUFBRSxFQUFFZCxNQUFNO1FBQ1ZlLElBQUksRUFBRWQsUUFBUTtRQUNkZSxXQUFXLEVBQUVmO01BQ2QsQ0FBQyxFQUNEQyxnQkFBZ0IsRUFDaEJNLFVBQVUsRUFDVkcsVUFBVSxFQUNWLElBQUksQ0FBQ2QsY0FBYyxFQUNuQixJQUFJLENBQUNvQixrQkFBa0IsQ0FBQ0Ms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