/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/base/Log", "sap/base/util/UriParameters", "sap/fe/core/controllerextensions/collaboration/CollaborationCommon", "sap/ui/core/ws/SapPcpWebSocket"], function (Log, UriParameters, CollaborationCommon, SapPcpWebSocket) {
  "use strict";

  var _exports = {};
  var SUPPORTED_PROTOCOLS = SapPcpWebSocket.SUPPORTED_PROTOCOLS;
  var Activity = CollaborationCommon.Activity;
  var COLLABORATION = "/collaboration";
  var CONNECTED = "/collaboration/connected";
  var CONNECTION = "/collaboration/connection";
  var CURRENTDRAFTID = "/collaboration/DraftID";
  function isCollaborationConnected(internalModel) {
    return !!internalModel.getProperty(CONNECTED);
  }
  _exports.isCollaborationConnected = isCollaborationConnected;
  function initializeCollaboration(user, webSocketBaseURL, draftUUID, serviceUrl, internalModel, receiveCallback) {
    var sendUserInfo = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
    if (internalModel.getProperty(CONNECTION)) {
      // A connection is already established
      if (internalModel.getProperty(CURRENTDRAFTID) === draftUUID) {
        // Connection corresponds to the same draft -> nothing to do
        return;
      } else {
        // There was a connection to another draft -> we close it before creating a new one
        // This can happen e.g. when switching between items in FCL
        endCollaboration(internalModel);
      }
    }
    var activeUsers = [user];
    internalModel.setProperty(COLLABORATION, {
      activeUsers: activeUsers,
      activities: {}
    });
    sendUserInfo = sendUserInfo || UriParameters.fromQuery(window.location.search).get("useFLPUser") === "true";
    var webSocket = createWebSocket(user, webSocketBaseURL, draftUUID, serviceUrl, sendUserInfo);
    internalModel.setProperty(CONNECTION, webSocket);
    internalModel.setProperty(CURRENTDRAFTID, draftUUID);
    webSocket.attachMessage(function (event) {
      var message = event.getParameter("pcpFields");
      receiveCallback(message);
    });
    webSocket.attachOpen(function () {
      internalModel.setProperty(CONNECTED, true);
    });
    webSocket.attachError(function () {
      Log.error("The connection to the websocket channel ".concat(webSocketBaseURL, " could not be established"));
      internalModel.setProperty(CONNECTED, false);
    });
    webSocket.attachClose(function () {
      internalModel.setProperty(CONNECTED, false);
    });
  }
  _exports.initializeCollaboration = initializeCollaboration;
  function broadcastCollaborationMessage(action, content, internalModel) {
    if (isCollaborationConnected(internalModel)) {
      var webSocket = internalModel.getProperty(CONNECTION);
      webSocket.send("", {
        clientAction: action,
        clientContent: content
      });
      if (action === Activity.Activate || action === Activity.Discard) {
        endCollaboration(internalModel);
      }
    }
  }
  _exports.broadcastCollaborationMessage = broadcastCollaborationMessage;
  function endCollaboration(internalModel) {
    var webSocket = internalModel.getProperty(CONNECTION);
    webSocket === null || webSocket === void 0 ? void 0 : webSocket.close();
    internalModel.setProperty(CONNECTION, null);
    internalModel.setProperty(CURRENTDRAFTID, undefined);
  }
  _exports.endCollaboration = endCollaboration;
  function createWebSocket(user, socketBaseURL, draftUUID, serviceUrl) {
    var sendUserInfo = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : false;
    var hostLocation = window.location;
    var socketURI;

    // Support useBackendUrl for local testing
    var useBackendUrl = UriParameters.fromQuery(window.location.search).get("useBackendUrl");
    if (useBackendUrl) {
      socketURI = useBackendUrl.replace("https", "wss");
    } else {
      socketURI = hostLocation.protocol === "https:" ? "wss:" : "ws:";
      socketURI += "//".concat(hostLocation.host);
    }
    socketURI += "".concat((socketBaseURL.startsWith("/") ? "" : "/") + socketBaseURL, "?draft=").concat(draftUUID, "&relatedService=").concat(serviceUrl);
    if (sendUserInfo) {
      socketURI += "&userID=".concat(encodeURI(user.id), "&userName=").concat(encodeURI(user.initialName || ""));
    }
    return new SapPcpWebSocket(socketURI, [SUPPORTED_PROTOCOLS.v10]);
  }
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJDT0xMQUJPUkFUSU9OIiwiQ09OTkVDVEVEIiwiQ09OTkVDVElPTiIsIkNVUlJFTlREUkFGVElEIiwiaXNDb2xsYWJvcmF0aW9uQ29ubmVjdGVkIiwiaW50ZXJuYWxNb2RlbCIsImdldFByb3BlcnR5IiwiaW5pdGlhbGl6ZUNvbGxhYm9yYXRpb24iLCJ1c2VyIiwid2ViU29ja2V0QmFzZVVSTCIsImRyYWZ0VVVJRCIsInNlcnZpY2VVcmwiLCJyZWNlaXZlQ2FsbGJhY2siLCJzZW5kVXNlckluZm8iLCJlbmRDb2xsYWJvcmF0aW9uIiwiYWN0aXZlVXNlcnMiLCJzZXRQcm9wZXJ0eSIsImFjdGl2aXRpZXMiLCJVcmlQYXJhbWV0ZXJzIiwiZnJvbVF1ZXJ5Iiwid2luZG93IiwibG9jYXRpb24iLCJzZWFyY2giLCJnZXQiLCJ3ZWJTb2NrZXQiLCJjcmVhdGVXZWJTb2NrZXQiLCJhdHRhY2hNZXNzYWdlIiwiZXZlbnQiLCJtZXNzYWdlIiwiZ2V0UGFyYW1ldGVyIiwiYXR0YWNoT3BlbiIsImF0dGFjaEVycm9yIiwiTG9nIiwiZXJyb3IiLCJhdHRhY2hDbG9zZSIsImJyb2FkY2FzdENvbGxhYm9yYXRpb25NZXNzYWdlIiwiYWN0aW9uIiwiY29udGVudCIsInNlbmQiLCJjbGllbnRBY3Rpb24iLCJjbGllbnRDb250ZW50IiwiQWN0aXZpdHkiLCJBY3RpdmF0ZSIsIkRpc2NhcmQiLCJjbG9zZSIsInVuZGVmaW5lZCIsInNvY2tldEJhc2VVUkwiLCJob3N0TG9jYXRpb24iLCJzb2NrZXRVUkkiLCJ1c2VCYWNrZW5kVXJsIiwicmVwbGFjZSIsInByb3RvY29sIiwiaG9zdCIsInN0YXJ0c1dpdGgiLCJlbmNvZGVVUkkiLCJpZCIsImluaXRpYWxOYW1lIiwiU2FwUGNwV2ViU29ja2V0IiwiU1VQUE9SVEVEX1BST1RPQ09MUyIsInYxMCJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQWN0aXZpdHlCYXNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBMb2cgZnJvbSBcInNhcC9iYXNlL0xvZ1wiO1xuaW1wb3J0IFVyaVBhcmFtZXRlcnMgZnJvbSBcInNhcC9iYXNlL3V0aWwvVXJpUGFyYW1ldGVyc1wiO1xuaW1wb3J0IHR5cGUgeyBNZXNzYWdlLCBVc2VyIH0gZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xsZXJleHRlbnNpb25zL2NvbGxhYm9yYXRpb24vQ29sbGFib3JhdGlvbkNvbW1vblwiO1xuaW1wb3J0IHsgQWN0aXZpdHkgfSBmcm9tIFwic2FwL2ZlL2NvcmUvY29udHJvbGxlcmV4dGVuc2lvbnMvY29sbGFib3JhdGlvbi9Db2xsYWJvcmF0aW9uQ29tbW9uXCI7XG5pbXBvcnQgdHlwZSBFdmVudCBmcm9tIFwic2FwL3VpL2Jhc2UvRXZlbnRcIjtcbmltcG9ydCBTYXBQY3BXZWJTb2NrZXQsIHsgU1VQUE9SVEVEX1BST1RPQ09MUyB9IGZyb20gXCJzYXAvdWkvY29yZS93cy9TYXBQY3BXZWJTb2NrZXRcIjtcbmltcG9ydCB0eXBlIEpTT05Nb2RlbCBmcm9tIFwic2FwL3VpL21vZGVsL2pzb24vSlNPTk1vZGVsXCI7XG5cbmNvbnN0IENPTExBQk9SQVRJT04gPSBcIi9jb2xsYWJvcmF0aW9uXCI7XG5jb25zdCBDT05ORUNURUQgPSBcIi9jb2xsYWJvcmF0aW9uL2Nvbm5lY3RlZFwiO1xuY29uc3QgQ09OTkVDVElPTiA9IFwiL2NvbGxhYm9yYXRpb24vY29ubmVjdGlvblwiO1xuY29uc3QgQ1VSUkVOVERSQUZUSUQgPSBcIi9jb2xsYWJvcmF0aW9uL0RyYWZ0SURcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGlzQ29sbGFib3JhdGlvbkNvbm5lY3RlZChpbnRlcm5hbE1vZGVsOiBKU09OTW9kZWwpOiBib29sZWFuIHtcblx0cmV0dXJuICEhaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShDT05ORUNURUQpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5pdGlhbGl6ZUNvbGxhYm9yYXRpb24oXG5cdHVzZXI6IFVzZXIsXG5cdHdlYlNvY2tldEJhc2VVUkw6IHN0cmluZyxcblx0ZHJhZnRVVUlEOiBzdHJpbmcsXG5cdHNlcnZpY2VVcmw6IHN0cmluZyxcblx0aW50ZXJuYWxNb2RlbDogSlNPTk1vZGVsLFxuXHRyZWNlaXZlQ2FsbGJhY2s6IChfOiBNZXNzYWdlKSA9PiB2b2lkLFxuXHRzZW5kVXNlckluZm8gPSBmYWxzZVxuKSB7XG5cdGlmIChpbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KENPTk5FQ1RJT04pKSB7XG5cdFx0Ly8gQSBjb25uZWN0aW9uIGlzIGFscmVhZHkgZXN0YWJsaXNoZWRcblx0XHRpZiAoaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShDVVJSRU5URFJBRlRJRCkgPT09IGRyYWZ0VVVJRCkge1xuXHRcdFx0Ly8gQ29ubmVjdGlvbiBjb3JyZXNwb25kcyB0byB0aGUgc2FtZSBkcmFmdCAtPiBub3RoaW5nIHRvIGRvXG5cdFx0XHRyZXR1cm47XG5cdFx0fSBlbHNlIHtcblx0XHRcdC8vIFRoZXJlIHdhcyBhIGNvbm5lY3Rpb24gdG8gYW5vdGhlciBkcmFmdCAtPiB3ZSBjbG9zZSBpdCBiZWZvcmUgY3JlYXRpbmcgYSBuZXcgb25lXG5cdFx0XHQvLyBUaGlzIGNhbiBoYXBwZW4gZS5nLiB3aGVuIHN3aXRjaGluZyBiZXR3ZWVuIGl0ZW1zIGluIEZDTFxuXHRcdFx0ZW5kQ29sbGFib3JhdGlvbihpbnRlcm5hbE1vZGVsKTtcblx0XHR9XG5cdH1cblxuXHRjb25zdCBhY3RpdmVVc2VyczogVXNlcltdID0gW3VzZXJdO1xuXHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KENPTExBQk9SQVRJT04sIHsgYWN0aXZlVXNlcnM6IGFjdGl2ZVVzZXJzLCBhY3Rpdml0aWVzOiB7fSB9KTtcblxuXHRzZW5kVXNlckluZm8gPSBzZW5kVXNlckluZm8gfHwgVXJpUGFyYW1ldGVycy5mcm9tUXVlcnkod2luZG93LmxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwidXNlRkxQVXNlclwiKSA9PT0gXCJ0cnVlXCI7XG5cblx0Y29uc3Qgd2ViU29ja2V0ID0gY3JlYXRlV2ViU29ja2V0KHVzZXIsIHdlYlNvY2tldEJhc2VVUkwsIGRyYWZ0VVVJRCwgc2VydmljZVVybCwgc2VuZFVzZXJJbmZvKTtcblxuXHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KENPTk5FQ1RJT04sIHdlYlNvY2tldCk7XG5cdGludGVybmFsTW9kZWwuc2V0UHJvcGVydHkoQ1VSUkVOVERSQUZUSUQsIGRyYWZ0VVVJRCk7XG5cblx0d2ViU29ja2V0LmF0dGFjaE1lc3NhZ2UoZnVuY3Rpb24gKGV2ZW50OiBFdmVudCkge1xuXHRcdGNvbnN0IG1lc3NhZ2U6IE1lc3NhZ2UgPSBldmVudC5nZXRQYXJhbWV0ZXIoXCJwY3BGaWVsZHNcIik7XG5cdFx0cmVjZWl2ZUNhbGxiYWNrKG1lc3NhZ2UpO1xuXHR9KTtcblxuXHR3ZWJTb2NrZXQuYXR0YWNoT3BlbihmdW5jdGlvbiAoKSB7XG5cdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShDT05ORUNURUQsIHRydWUpO1xuXHR9KTtcblxuXHR3ZWJTb2NrZXQuYXR0YWNoRXJyb3IoZnVuY3Rpb24gKCkge1xuXHRcdExvZy5lcnJvcihgVGhlIGNvbm5lY3Rpb24gdG8gdGhlIHdlYnNvY2tldCBjaGFubmVsICR7d2ViU29ja2V0QmFzZVVSTH0gY291bGQgbm90IGJlIGVzdGFibGlzaGVkYCk7XG5cdFx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShDT05ORUNURUQsIGZhbHNlKTtcblx0fSk7XG5cblx0d2ViU29ja2V0LmF0dGFjaENsb3NlKGZ1bmN0aW9uICgpIHtcblx0XHRpbnRlcm5hbE1vZGVsLnNldFByb3BlcnR5KENPTk5FQ1RFRCwgZmFsc2UpO1xuXHR9KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJyb2FkY2FzdENvbGxhYm9yYXRpb25NZXNzYWdlKGFjdGlvbjogQWN0aXZpdHksIGNvbnRlbnQ6IHN0cmluZyB8IHVuZGVmaW5lZCwgaW50ZXJuYWxNb2RlbDogSlNPTk1vZGVsKSB7XG5cdGlmIChpc0NvbGxhYm9yYXRpb25Db25uZWN0ZWQoaW50ZXJuYWxNb2RlbCkpIHtcblx0XHRjb25zdCB3ZWJTb2NrZXQgPSBpbnRlcm5hbE1vZGVsLmdldFByb3BlcnR5KENPTk5FQ1RJT04pIGFzIFNhcFBjcFdlYlNvY2tldDtcblxuXHRcdHdlYlNvY2tldC5zZW5kKFwiXCIsIHtcblx0XHRcdGNsaWVudEFjdGlvbjogYWN0aW9uLFxuXHRcdFx0Y2xpZW50Q29udGVudDogY29udGVudFxuXHRcdH0pO1xuXG5cdFx0aWYgKGFjdGlvbiA9PT0gQWN0aXZpdHkuQWN0aXZhdGUgfHwgYWN0aW9uID09PSBBY3Rpdml0eS5EaXNjYXJkKSB7XG5cdFx0XHRlbmRDb2xsYWJvcmF0aW9uKGludGVybmFsTW9kZWwpO1xuXHRcdH1cblx0fVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW5kQ29sbGFib3JhdGlvbihpbnRlcm5hbE1vZGVsOiBKU09OTW9kZWwpIHtcblx0Y29uc3Qgd2ViU29ja2V0ID0gaW50ZXJuYWxNb2RlbC5nZXRQcm9wZXJ0eShDT05ORUNUSU9OKSBhcyBTYXBQY3BXZWJTb2NrZXQ7XG5cdHdlYlNvY2tldD8uY2xvc2UoKTtcblx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShDT05ORUNUSU9OLCBudWxsKTtcblx0aW50ZXJuYWxNb2RlbC5zZXRQcm9wZXJ0eShDVVJSRU5URFJBRlRJRCwgdW5kZWZpbmVkKTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlV2ViU29ja2V0KHVzZXI6IFVzZXIsIHNvY2tldEJhc2VVUkw6IHN0cmluZywgZHJhZnRVVUlEOiBzdHJpbmcsIHNlcnZpY2VVcmw6IHN0cmluZywgc2VuZFVzZXJJbmZvID0gZmFsc2UpIHtcblx0Y29uc3QgaG9zdExvY2F0aW9uID0gd2luZG93LmxvY2F0aW9uO1xuXHRsZXQgc29ja2V0VVJJO1xuXG5cdC8vIFN1cHBvcnQgdXNlQmFja2VuZFVybCBmb3IgbG9jYWwgdGVzdGluZ1xuXHRjb25zdCB1c2VCYWNrZW5kVXJsID0gVXJpUGFyYW1ldGVycy5mcm9tUXVlcnkod2luZG93LmxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwidXNlQmFja2VuZFVybFwiKTtcblx0aWYgKHVzZUJhY2tlbmRVcmwpIHtcblx0XHRzb2NrZXRVUkkgPSB1c2VCYWNrZW5kVXJsLnJlcGxhY2UoXCJodHRwc1wiLCBcIndzc1wiKTtcblx0fSBlbHNlIHtcblx0XHRzb2NrZXRVUkkgPSBob3N0TG9jYXRpb24ucHJvdG9jb2wgPT09IFwiaHR0cHM6XCIgPyBcIndzczpcIiA6IFwid3M6XCI7XG5cdFx0c29ja2V0VVJJICs9IGAvLyR7aG9zdExvY2F0aW9uLmhvc3R9YDtcblx0fVxuXG5cdHNvY2tldFVSSSArPSBgJHsoc29ja2V0QmFzZVVSTC5zdGFydHNXaXRoKFwiL1wiKSA/IFwiXCIgOiBcIi9cIikgKyBzb2NrZXRCYXNlVVJMfT9kcmFmdD0ke2RyYWZ0VVVJRH0mcmVsYXRlZFNlcnZpY2U9JHtzZXJ2aWNlVXJsfWA7XG5cblx0aWYgKHNlbmRVc2VySW5mbykge1xuXHRcdHNvY2tldFVSSSArPSBgJnVzZXJJRD0ke2VuY29kZVVSSSh1c2VyLmlkKX0mdXNlck5hbWU9JHtlbmNvZGVVUkkodXNlci5pbml0aWFsTmFtZSB8fCBcIlwiKX1gO1xuXHR9XG5cblx0cmV0dXJuIG5ldyBTYXBQY3BXZWJTb2NrZXQoc29ja2V0VVJJLCBbU1VQUE9SVEVEX1BST1RPQ09MUy52MTBdKTtcbn1cbiJdLCJtYXBwaW5ncyI6IjtBQUFBO0FBQUE7QUFBQTs7Ozs7OztFQVFBLElBQU1BLGFBQWEsR0FBRyxnQkFBZ0I7RUFDdEMsSUFBTUMsU0FBUyxHQUFHLDBCQUEwQjtFQUM1QyxJQUFNQyxVQUFVLEdBQUcsMkJBQTJCO0VBQzlDLElBQU1DLGNBQWMsR0FBRyx3QkFBd0I7RUFFeEMsU0FBU0Msd0JBQXdCLENBQUNDLGFBQXdCLEVBQVc7SUFDM0UsT0FBTyxDQUFDLENBQUNBLGFBQWEsQ0FBQ0MsV0FBVyxDQUFDTCxTQUFTLENBQUM7RUFDOUM7RUFBQztFQUVNLFNBQVNNLHVCQUF1QixDQUN0Q0MsSUFBVSxFQUNWQyxnQkFBd0IsRUFDeEJDLFNBQWlCLEVBQ2pC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