/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Component", "sap/ui/core/Core"], function (Component, Core) {
  "use strict";

  var _exports = {};
  var UserStatus;
  (function (UserStatus) {
    UserStatus[UserStatus["NotYetInvited"] = 0] = "NotYetInvited";
    UserStatus[UserStatus["NoChangesMade"] = 1] = "NoChangesMade";
    UserStatus[UserStatus["ChangesMade"] = 2] = "ChangesMade";
    UserStatus[UserStatus["CurrentlyEditing"] = 3] = "CurrentlyEditing";
  })(UserStatus || (UserStatus = {}));
  _exports.UserStatus = UserStatus;
  var UserEditingState;
  (function (UserEditingState) {
    UserEditingState["NoChanges"] = "N";
    UserEditingState["InProgress"] = "P";
  })(UserEditingState || (UserEditingState = {}));
  _exports.UserEditingState = UserEditingState;
  var Activity;
  (function (Activity) {
    Activity["Join"] = "JOIN";
    Activity["JoinEcho"] = "JOINECHO";
    Activity["Leave"] = "LEAVE";
    Activity["Change"] = "CHANGE";
    Activity["Create"] = "CREATE";
    Activity["Delete"] = "DELETE";
    Activity["Action"] = "ACTION";
    Activity["LiveChange"] = "LIVECHANGE";
    Activity["Activate"] = "ACTIVATE";
    Activity["Discard"] = "DISCARD";
    Activity["Undo"] = "UNDO";
  })(Activity || (Activity = {}));
  _exports.Activity = Activity;
  function formatInitials(fullName) {
    // remove titles - those are the ones from S/4 to be checked if there are others
    var academicTitles = ["Dr.", "Prof.", "Prof. Dr.", "B.A.", "MBA", "Ph.D."];
    academicTitles.forEach(function (academicTitle) {
      fullName = fullName.replace(academicTitle, "");
    });
    var initials;
    var parts = fullName.trimStart().split(" ");
    if (parts.length > 1) {
      var _parts$shift, _parts$pop;
      initials = ((parts === null || parts === void 0 ? void 0 : (_parts$shift = parts.shift()) === null || _parts$shift === void 0 ? void 0 : _parts$shift.charAt(0)) || "") + ((_parts$pop = parts.pop()) === null || _parts$pop === void 0 ? void 0 : _parts$pop.charAt(0));
    } else {
      initials = fullName.substring(0, 2);
    }
    return initials.toUpperCase();
  }
  function getUserColor(UserID, activeUsers, invitedUsers) {
    // search if user is known
    var user = activeUsers.find(function (u) {
      return u.id === UserID;
    });
    if (user) {
      return user.color;
    } else {
      var _loop = function (i) {
        if (activeUsers.findIndex(function (u) {
          return u.color === i;
        }) === -1 && invitedUsers.findIndex(function (u) {
          return u.color === i;
        }) === -1) {
          return {
            v: i
          };
        }
      };
      // search for next free color
      for (var i = 1; i <= 10; i++) {
        var _ret = _loop(i);
        if (typeof _ret === "object") return _ret.v;
      }
      // this seems to be a popular object :) for now just return 10 for all.
      // for invited we should start from 1 again so the colors are different
      return 10;
    }
  }

  // copied from CommonUtils. Due to a cycle dependency I can't use CommonUtils here.
  // That's to be fixed. the discard popover thingy shouldn't be in the common utils at all
  function getAppComponent(oControl) {
    if (oControl.isA("sap.fe.core.AppComponent")) {
      return oControl;
    }
    var oOwner = Component.getOwnerComponentFor(oControl);
    if (!oOwner) {
      return oControl;
    } else {
      return getAppComponent(oOwner);
    }
  }
  function getMe(view) {
    var shellServiceHelper = getAppComponent(view).getShellServices();
    if (!shellServiceHelper || !shellServiceHelper.hasUShell()) {
      throw "No Shell... No User";
    }
    return {
      initials: shellServiceHelper.getUser().getInitials(),
      id: shellServiceHelper.getUser().getId(),
      name: "".concat(shellServiceHelper.getUser().getFullName(), " (").concat(getText("C_COLLABORATIONDRAFT_YOU"), ")"),
      initialName: shellServiceHelper.getUser().getFullName(),
      color: 6,
      //  same color as FLP...
      me: true,
      status: UserStatus.CurrentlyEditing
    };
  }
  function getText(textId) {
    var oResourceModel = Core.getLibraryResourceBundle("sap.fe.core");
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    return oResourceModel.getText(textId, args);
  }
  _exports.getText = getText;
  var CollaborationUtils = {
    formatInitials: formatInitials,
    getUserColor: getUserColor,
    getMe: getMe,
    getAppComponent: getAppComponent,
    getText: getText
  };
  _exports.CollaborationUtils = CollaborationUtils;
  function shareObject(bindingContext) {
    var users = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
    var model = bindingContext.getModel();
    var metaModel = model.getMetaModel();
    var entitySet = metaModel.getMetaPath(bindingContext);
    var shareActionName = metaModel.getObject("".concat(entitySet, "@com.sap.vocabularies.Common.v1.DraftRoot/ShareAction"));
    var shareAction = model.bindContext("".concat(shareActionName, "(...)"), bindingContext);
    shareAction.setParameter("Users", users);
    shareAction.setParameter("ShareAll", true);
    return shareAction.execute();
  }
  _exports.shareObject = shareObject;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJVc2VyU3RhdHVzIiwiVXNlckVkaXRpbmdTdGF0ZSIsIkFjdGl2aXR5IiwiZm9ybWF0SW5pdGlhbHMiLCJmdWxsTmFtZSIsImFjYWRlbWljVGl0bGVzIiwiZm9yRWFjaCIsImFjYWRlbWljVGl0bGUiLCJyZXBsYWNlIiwiaW5pdGlhbHMiLCJwYXJ0cyIsInRyaW1TdGFydCIsInNwbGl0IiwibGVuZ3RoIiwic2hpZnQiLCJjaGFyQXQiLCJwb3AiLCJzdWJzdHJpbmciLCJ0b1VwcGVyQ2FzZSIsImdldFVzZXJDb2xvciIsIlVzZXJJRCIsImFjdGl2ZVVzZXJzIiwiaW52aXRlZFVzZXJzIiwidXNlciIsImZpbmQiLCJ1IiwiaWQiLCJjb2xvciIsImkiLCJmaW5kSW5kZXgiLCJnZXRBcHBDb21wb25lbnQiLCJvQ29udHJvbCIsImlzQSIsIm9Pd25lciIsIkNvbXBvbmVudCIsImdldE93bmVyQ29tcG9uZW50Rm9yIiwiZ2V0TWUiLCJ2aWV3Iiwic2hlbGxTZXJ2aWNlSGVscGVyIiwiZ2V0U2hlbGxTZXJ2aWNlcyIsImhhc1VTaGVsbCIsImdldFVzZXIiLCJnZXRJbml0aWFscyIsImdldElkIiwibmFtZSIsImdldEZ1bGxOYW1lIiwiZ2V0VGV4dCIsImluaXRpYWxOYW1lIiwibWUiLCJzdGF0dXMiLCJDdXJyZW50bHlFZGl0aW5nIiwidGV4dElkIiwib1Jlc291cmNlTW9kZWwiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiYXJncyIsIkNvbGxhYm9yYXRpb25VdGlscyIsInNoYXJlT2JqZWN0IiwiYmluZGluZ0NvbnRleHQiLCJ1c2VycyIsIm1vZGVsIiwiZ2V0TW9kZWwiLCJtZXRhTW9kZWwiLCJnZXRNZXRhTW9kZWwiLCJlbnRpdHlTZXQiLCJnZXRNZXRhUGF0aCIsInNoYXJlQWN0aW9uTmFtZSIsImdldE9iamVjdCIsInNoYXJlQWN0aW9uIiwiYmluZENvbnRleHQiLCJzZXRQYXJhbWV0ZXIiLCJleGVjdXRlIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJDb2xsYWJvcmF0aW9uQ29tbW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIEFwcENvbXBvbmVudCBmcm9tIFwic2FwL2ZlL2NvcmUvQXBwQ29tcG9uZW50XCI7XG5pbXBvcnQgQ29tcG9uZW50IGZyb20gXCJzYXAvdWkvY29yZS9Db21wb25lbnRcIjtcbmltcG9ydCBDb3JlIGZyb20gXCJzYXAvdWkvY29yZS9Db3JlXCI7XG5pbXBvcnQgdHlwZSBWaWV3IGZyb20gXCJzYXAvdWkvY29yZS9tdmMvVmlld1wiO1xuaW1wb3J0IHR5cGUgeyBWNENvbnRleHQgfSBmcm9tIFwidHlwZXMvZXh0ZW5zaW9uX3R5cGVzXCI7XG5cbmV4cG9ydCBlbnVtIFVzZXJTdGF0dXMge1xuXHROb3RZZXRJbnZpdGVkID0gMCxcblx0Tm9DaGFuZ2VzTWFkZSA9IDEsXG5cdENoYW5nZXNNYWRlID0gMixcblx0Q3VycmVudGx5RWRpdGluZyA9IDNcbn1cblxuZXhwb3J0IGVudW0gVXNlckVkaXRpbmdTdGF0ZSB7XG5cdE5vQ2hhbmdlcyA9IFwiTlwiLFxuXHRJblByb2dyZXNzID0gXCJQXCJcbn1cblxuZXhwb3J0IHR5cGUgVXNlciA9IHtcblx0aWQ6IHN0cmluZztcblx0aW5pdGlhbHM/OiBzdHJpbmc7XG5cdG5hbWU6IHN0cmluZztcblx0Y29sb3I/OiBudW1iZXI7XG5cdHRyYW5zaWVudD86IGJvb2xlYW47XG5cdHN0YXR1cz86IFVzZXJTdGF0dXM7XG5cdG1lPzogYm9vbGVhbjtcblx0aW5pdGlhbE5hbWU/OiBzdHJpbmc7XG59O1xuXG4vLyBiYWNrZW5kIHJlcHJlc2VudGF0aW9uIG9mIGEgdXNlciBhY2NvcmRpbmcgdG8gY29sbGFib3JhdGlvbiBkcmFmdCBzcGVjXG5leHBvcnQgdHlwZSBCYWNrZW5kVXNlciA9IHtcblx0VXNlcklEOiBzdHJpbmc7XG5cdFVzZXJBY2Nlc3NSb2xlOiBzdHJpbmc7XG5cdFVzZXJFZGl0aW5nU3RhdGU/OiBVc2VyRWRpdGluZ1N0YXRlO1xuXHRVc2VyRGVzY3JpcHRpb24/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBVc2VyQWN0aXZpdHkgPSBVc2VyICYge1xuXHRrZXk/OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgZW51bSBBY3Rpdml0eSB7XG5cdEpvaW4gPSBcIkpPSU5cIixcblx0Sm9pbkVjaG8gPSBcIkpPSU5FQ0hPXCIsXG5cdExlYXZlID0gXCJMRUFWRVwiLFxuXHRDaGFuZ2UgPSBcIkNIQU5HRVwiLFxuXHRDcmVhdGUgPSBcIkNSRUFURVwiLFxuXHREZWxldGUgPSBcIkRFTEVURVwiLFxuXHRBY3Rpb24gPSBcIkFDVElPTlwiLFxuXHRMaXZlQ2hhbmdlID0gXCJMSVZFQ0hBTkdFXCIsXG5cdEFjdGl2YXRlID0gXCJBQ1RJVkFURVwiLFxuXHREaXNjYXJkID0gXCJESVNDQVJEXCIsXG5cdFVuZG8gPSBcIlVORE9cIlxufVxuXG5leHBvcnQgdHlwZSBNZXNzYWdlID0ge1xuXHR1c2VyRGVzY3JpcHRpb246IHN0cmluZztcblx0dXNlcklEOiBzdHJpbmc7XG5cdHVzZXJBY3Rpb246IHN0cmluZztcblx0Y2xpZW50QWN0aW9uOiBzdHJpbmc7XG5cdGNsaWVudENvbnRlbnQ6IHN0cmluZztcbn07XG5cbmZ1bmN0aW9uIGZvcm1hdEluaXRpYWxzKGZ1bGxOYW1lOiBzdHJpbmcpOiBzdHJpbmcge1xuXHQvLyByZW1vdmUgdGl0bGVzIC0gdGhvc2UgYXJlIHRoZSBvbmVzIGZyb20gUy80IHRvIGJlIGNoZWNrZWQgaWYgdGhlcmUgYXJlIG90aGVyc1xuXHRjb25zdCBhY2FkZW1pY1RpdGxlcyA9IFtcIkRyLlwiLCBcIlByb2YuXCIsIFwiUHJvZi4gRHIuXCIsIFwiQi5BLlwiLCBcIk1CQVwiLCBcIlBoLkQuXCJdO1xuXHRhY2FkZW1pY1RpdGxlcy5mb3JFYWNoKGZ1bmN0aW9uIChhY2FkZW1pY1RpdGxlKSB7XG5cdFx0ZnVsbE5hbWUgPSBmdWxsTmFtZS5yZXBsYWNlKGFjYWRlbWljVGl0bGUsIFwiXCIpO1xuXHR9KTtcblxuXHRsZXQgaW5pdGlhbHM6IHN0cmluZztcblx0Y29uc3QgcGFydHMgPSBmdWxsTmFtZS50cmltU3RhcnQoKS5zcGxpdChcIiBcIik7XG5cblx0aWYgKHBhcnRzLmxlbmd0aCA+IDEpIHtcblx0XHRpbml0aWFscyA9IChwYXJ0cz8uc2hpZnQoKT8uY2hhckF0KDApIHx8IFwiXCIpICsgcGFydHMucG9wKCk/LmNoYXJBdCgwKTtcblx0fSBlbHNlIHtcblx0XHRpbml0aWFscyA9IGZ1bGxOYW1lLnN1YnN0cmluZygwLCAyKTtcblx0fVxuXG5cdHJldHVybiBpbml0aWFscy50b1VwcGVyQ2FzZSgpO1xufVxuXG5mdW5jdGlvbiBnZXRVc2VyQ29sb3IoVXNlcklEOiBzdHJpbmcsIGFjdGl2ZVVzZXJzOiBVc2VyW10sIGludml0ZWRVc2VyczogVXNlcltdKSB7XG5cdC8vIHNlYXJjaCBpZiB1c2VyIGlzIGtub3duXG5cdGNvbnN0IHVzZXIgPSBhY3RpdmVVc2Vycy5maW5kKCh1KSA9PiB1LmlkID09PSBVc2VySUQpO1xuXHRpZiAodXNlcikge1xuXHRcdHJldHVybiB1c2VyLmNvbG9yO1xuXHR9IGVsc2Uge1xuXHRcdC8vIHNlYXJjaCBmb3IgbmV4dCBmcmVlIGNvbG9yXG5cdFx0Zm9yIChsZXQgaSA9IDE7IGkgPD0gMTA7IGkrKykge1xuXHRcdFx0aWYgKGFjdGl2ZVVzZXJzLmZpbmRJbmRleCgodSkgPT4gdS5jb2xvciA9PT0gaSkgPT09IC0xICYmIGludml0ZWRVc2Vycy5maW5kSW5kZXgoKHUpID0+IHUuY29sb3IgPT09IGkpID09PSAtMSkge1xuXHRcdFx0XHRyZXR1cm4gaTtcblx0XHRcdH1cblx0XHR9XG5cdFx0Ly8gdGhpcyBzZWVtcyB0byBiZSBhIHBvcHVsYXIgb2JqZWN0IDopIGZvciBub3cganVzdCByZXR1cm4gMTAgZm9yIGFsbC5cblx0XHQvLyBmb3IgaW52aXRlZCB3ZSBzaG91bGQgc3RhcnQgZnJvbSAxIGFnYWluIHNvIHRoZSBjb2xvcnMgYXJlIGRpZmZlcmVudFxuXHRcdHJldHVybiAxMDtcblx0fVxufVxuXG4vLyBjb3BpZWQgZnJvbSBDb21tb25VdGlscy4gRHVlIHRvIGEgY3ljbGUgZGVwZW5kZW5jeSBJIGNhbid0IHVzZSBDb21tb25VdGlscyBoZXJlLlxuLy8gVGhhdCdzIHRvIGJlIGZpeGVkLiB0aGUgZGlzY2FyZCBwb3BvdmVyIHRoaW5neSBzaG91bGRuJ3QgYmUgaW4gdGhlIGNvbW1vbiB1dGlscyBhdCBhbGxcbmZ1bmN0aW9uIGdldEFwcENvbXBvbmVudChvQ29udHJvbDogYW55KTogQXBwQ29tcG9uZW50IHtcblx0aWYgKG9Db250cm9sLmlzQShcInNhcC5mZS5jb3JlLkFwcENvbXBvbmVudFwiKSkge1xuXHRcdHJldHVybiBvQ29udHJvbDtcblx0fVxuXHRjb25zdCBvT3duZXIgPSBDb21wb25lbnQuZ2V0T3duZXJDb21wb25lbnRGb3Iob0NvbnRyb2wpO1xuXHRpZiAoIW9Pd25lcikge1xuXHRcdHJldHVybiBvQ29udHJvbDtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gZ2V0QXBwQ29tcG9uZW50KG9Pd25lcik7XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0TWUodmlldzogVmlldyk6IFVzZXIge1xuXHRjb25zdCBzaGVsbFNlcnZpY2VIZWxwZXIgPSBnZXRBcHBDb21wb25lbnQodmlldykuZ2V0U2hlbGxTZXJ2aWNlcygpO1xuXHRpZiAoIXNoZWxsU2VydmljZUhlbHBlciB8fCAhc2hlbGxTZXJ2aWNlSGVscGVyLmhhc1VTaGVsbCgpKSB7XG5cdFx0dGhyb3cgXCJObyBTaGVsbC4uLiBObyBVc2VyXCI7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRpbml0aWFsczogc2hlbGxTZXJ2aWNlSGVscGVyLmdldFVzZXIoKS5nZXRJbml0aWFscygpLFxuXHRcdGlkOiBzaGVsbFNlcnZpY2VIZWxwZXIuZ2V0VXNlcigpLmdldElkKCksXG5cdFx0bmFtZTogYCR7c2hlbGxTZXJ2aWNlSGVscGVyLmdldFVzZXIoKS5nZXRGdWxsTmFtZSgpfSAoJHtnZXRUZXh0KFwiQ19DT0xMQUJPUkFUSU9ORFJBRlRfWU9VXCIpfSlgLFxuXHRcdGluaXRpYWxOYW1lOiBzaGVsbFNlcnZpY2VIZWxwZXIuZ2V0VXNlcigpLmdldEZ1bGxOYW1lKCksXG5cdFx0Y29sb3I6IDYsIC8vICBzYW1lIGNvbG9yIGFzIEZMUC4uLlxuXHRcdG1lOiB0cnVlLFxuXHRcdHN0YXR1czogVXNlclN0YXR1cy5DdXJyZW50bHlFZGl0aW5nXG5cdH07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRUZXh0KHRleHRJZDogc3RyaW5nLCAuLi5hcmdzOiBzdHJpbmdbXSk6IHN0cmluZyB7XG5cdGNvbnN0IG9SZXNvdXJjZU1vZGVsID0gQ29yZS5nZXRMaWJyYXJ5UmVzb3VyY2VCdW5kbGUoXCJzYXAuZmUuY29yZVwiKTtcblx0cmV0dXJuIG9SZXNvdXJjZU1vZGVsLmdldFRleHQodGV4dElkLCBhcmdzKTtcbn1cblxuZXhwb3J0IGNvbnN0IENvbGxhYm9yYXRpb25VdGlscyA9IHtcblx0Zm9ybWF0SW5pdGlhbHM6IGZvcm1hdEluaXRpYWxzLFxuXHRnZXRVc2VyQ29sb3I6IGdldFVzZXJDb2xvcixcblx0Z2V0TWU6IGdldE1lLFxuXHRnZXRBcHBDb21wb25lbnQ6IGdldEFwcENvbXBvbmVudCxcblx0Z2V0VGV4dDogZ2V0VGV4dFxufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHNoYXJlT2JqZWN0KGJpbmRpbmdDb250ZXh0OiBWNENvbnRleHQsIHVzZXJzOiBCYWNrZW5kVXNlcltdID0gW10pOiBQcm9taXNlPHZvaWQ+IHtcblx0Y29uc3QgbW9kZWwgPSBiaW5kaW5nQ29udGV4dC5nZXRNb2RlbCgpO1xuXHRjb25zdCBtZXRhTW9kZWwgPSBtb2RlbC5nZXRNZXRhTW9kZWwoKTtcblx0Y29uc3QgZW50aXR5U2V0ID0gbWV0YU1vZGVsLmdldE1ldGFQYXRoKGJpbmRpbmdDb250ZXh0IGFzIGFueSk7XG5cdGNvbnN0IHNoYXJlQWN0aW9uTmFtZSA9IG1ldGFNb2RlbC5nZXRPYmplY3QoYCR7ZW50aXR5U2V0fUBjb20uc2FwLnZvY2FidWxhcmllcy5Db21tb24udjEuRHJhZnRSb290L1NoYXJlQWN0aW9uYCk7XG5cdGNvbnN0IHNoYXJlQWN0aW9uID0gbW9kZWwuYmluZENvbnRleHQoYCR7c2hhcmVBY3Rpb25OYW1lfSguLi4pYCwgYmluZGluZ0NvbnRleHQpO1xuXHRzaGFyZUFjdGlvbi5zZXRQYXJhbWV0ZXIoXCJVc2Vyc1wiLCB1c2Vycyk7XG5cdHNoYXJlQWN0aW9uLnNldFBhcmFtZXRlcihcIlNoYXJlQWxsXCIsIHRydWUpO1xuXHRyZXR1cm4gc2hhcmVBY3Rpb24uZXhlY3V0ZSgpO1xufVxuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7OztNQU1ZQSxVQUFVO0VBQUEsV0FBVkEsVUFBVTtJQUFWQSxVQUFVLENBQVZBLFVBQVU7SUFBVkEsVUFBVSxDQUFWQSxVQUFVO0lBQVZBLFVBQVUsQ0FBVkEsVUFBVTtJQUFWQSxVQUFVLENBQVZBLFVBQVU7RUFBQSxHQUFWQSxVQUFVLEtBQVZBLFVBQVU7RUFBQTtFQUFBLElBT1ZDLGdCQUFnQjtFQUFBLFdBQWhCQSxnQkFBZ0I7SUFBaEJBLGdCQUFnQjtJQUFoQkEsZ0JBQWdCO0VBQUEsR0FBaEJBLGdCQUFnQixLQUFoQkEsZ0JBQWdCO0VBQUE7RUFBQSxJQTRCaEJDLFFBQVE7RUFBQSxXQUFSQSxRQUFRO0lBQVJBLFFBQVE7SUFBUkEsUUFBUTtJQUFSQSxRQUFRO0lBQVJBLFFBQVE7SUFBUkEsUUFBUTtJQUFSQSxRQUFRO0lBQVJBLFFBQVE7SUFBUkEsUUFBUTtJQUFSQSxRQUFRO0lBQVJBLFFBQVE7SUFBUkEsUUFBUTtFQUFBLEdBQVJBLFFBQVEsS0FBUkEsUUFBUTtFQUFBO0VBc0JwQixTQUFTQyxjQUFjLENBQUNDLFFBQWdCLEVBQVU7SUFDakQ7SUFDQSxJQUFNQyxjQUFjLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQztJQUM1RUEsY0FBYyxDQUFDQyxPQUFPLENBQUMsVUFBVUMsYUFBYSxFQUFFO01BQy9DSCxR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