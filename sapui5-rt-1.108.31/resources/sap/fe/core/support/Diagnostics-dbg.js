/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define([], function () {
  "use strict";

  var Diagnostics = /*#__PURE__*/function () {
    function Diagnostics() {
      this._issues = [];
    }
    var _proto = Diagnostics.prototype;
    _proto.addIssue = function addIssue(issueCategory, issueSeverity, details, issueCategoryType, subCategory) {
      var checkIfIssueExists = this.checkIfIssueExists(issueCategory, issueSeverity, details, issueCategoryType, subCategory);
      if (!checkIfIssueExists) {
        this._issues.push({
          category: issueCategory,
          severity: issueSeverity,
          details: details,
          subCategory: subCategory
        });
      }
    };
    _proto.getIssues = function getIssues() {
      return this._issues;
    };
    _proto.getIssuesByCategory = function getIssuesByCategory(inCategory, subCategory) {
      if (subCategory) {
        return this._issues.filter(function (issue) {
          return issue.category === inCategory && issue.subCategory === subCategory;
        });
      } else {
        return this._issues.filter(function (issue) {
          return issue.category === inCategory;
        });
      }
    };
    _proto.checkIfIssueExists = function checkIfIssueExists(inCategory, severity, details, issueCategoryType, issueSubCategory) {
      if (issueCategoryType && issueCategoryType[inCategory] && issueSubCategory) {
        return this._issues.some(function (issue) {
          return issue.category === inCategory && issue.severity === severity && issue.details.replace(/\n/g, "") === details.replace(/\n/g, "") && issue.subCategory === issueSubCategory;
        });
      }
      return this._issues.some(function (issue) {
        return issue.category === inCategory && issue.severity === severity && issue.details.replace(/\n/g, "") === details.replace(/\n/g, "");
      });
    };
    return Diagnostics;
  }();
  return Diagnostics;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJEaWFnbm9zdGljcyIsIl9pc3N1ZXMiLCJhZGRJc3N1ZSIsImlzc3VlQ2F0ZWdvcnkiLCJpc3N1ZVNldmVyaXR5IiwiZGV0YWlscyIsImlzc3VlQ2F0ZWdvcnlUeXBlIiwic3ViQ2F0ZWdvcnkiLCJjaGVja0lmSXNzdWVFeGlzdHMiLCJwdXNoIiwiY2F0ZWdvcnkiLCJzZXZlcml0eSIsImdldElzc3VlcyIsImdldElzc3Vlc0J5Q2F0ZWdvcnkiLCJpbkNhdGVnb3J5IiwiZmlsdGVyIiwiaXNzdWUiLCJpc3N1ZVN1YkNhdGVnb3J5Iiwic29tZSIsInJlcGxhY2UiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIkRpYWdub3N0aWNzLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgSXNzdWVDYXRlZ29yeSwgSXNzdWVTZXZlcml0eSB9IGZyb20gXCJzYXAvZmUvY29yZS9jb252ZXJ0ZXJzL2hlbHBlcnMvSXNzdWVNYW5hZ2VyXCI7XG5cbmV4cG9ydCB0eXBlIElzc3VlRGVmaW5pdGlvbiA9IHtcblx0Y2F0ZWdvcnk6IElzc3VlQ2F0ZWdvcnk7XG5cdHNldmVyaXR5OiBJc3N1ZVNldmVyaXR5O1xuXHRkZXRhaWxzOiBzdHJpbmc7XG5cdHN1YkNhdGVnb3J5Pzogc3RyaW5nIHwgdW5kZWZpbmVkO1xufTtcbmNsYXNzIERpYWdub3N0aWNzIHtcblx0X2lzc3VlczogSXNzdWVEZWZpbml0aW9uW107XG5cdGNvbnN0cnVjdG9yKCkge1xuXHRcdHRoaXMuX2lzc3VlcyA9IFtdO1xuXHR9XG5cdGFkZElzc3VlKFxuXHRcdGlzc3VlQ2F0ZWdvcnk6IElzc3VlQ2F0ZWdvcnksXG5cdFx0aXNzdWVTZXZlcml0eTogSXNzdWVTZXZlcml0eSxcblx0XHRkZXRhaWxzOiBzdHJpbmcsXG5cdFx0aXNzdWVDYXRlZ29yeVR5cGU/OiBhbnkgfCB1bmRlZmluZWQsXG5cdFx0c3ViQ2F0ZWdvcnk/OiBzdHJpbmcgfCB1bmRlZmluZWRcblx0KTogdm9pZCB7XG5cdFx0Y29uc3QgY2hlY2tJZklzc3VlRXhpc3RzID0gdGhpcy5jaGVja0lmSXNzdWVFeGlzdHMoaXNzdWVDYXRlZ29yeSwgaXNzdWVTZXZlcml0eSwgZGV0YWlscywgaXNzdWVDYXRlZ29yeVR5cGUsIHN1YkNhdGVnb3J5KTtcblx0XHRpZiAoIWNoZWNrSWZJc3N1ZUV4aXN0cykge1xuXHRcdFx0dGhpcy5faXNzdWVzLnB1c2goe1xuXHRcdFx0XHRjYXRlZ29yeTogaXNzdWVDYXRlZ29yeSxcblx0XHRcdFx0c2V2ZXJpdHk6IGlzc3VlU2V2ZXJpdHksXG5cdFx0XHRcdGRldGFpbHM6IGRldGFpbHMsXG5cdFx0XHRcdHN1YkNhdGVnb3J5OiBzdWJDYXRlZ29yeVxuXHRcdFx0fSk7XG5cdFx0fVxuXHR9XG5cdGdldElzc3VlcygpOiBJc3N1ZURlZmluaXRpb25bXSB7XG5cdFx0cmV0dXJuIHRoaXMuX2lzc3Vlcztcblx0fVxuXHRnZXRJc3N1ZXNCeUNhdGVnb3J5KGluQ2F0ZWdvcnk6IElzc3VlQ2F0ZWdvcnksIHN1YkNhdGVnb3J5Pzogc3RyaW5nKTogSXNzdWVEZWZpbml0aW9uW10ge1xuXHRcdGlmIChzdWJDYXRlZ29yeSkge1xuXHRcdFx0cmV0dXJuIHRoaXMuX2lzc3Vlcy5maWx0ZXIoKGlzc3VlKSA9PiBpc3N1ZS5jYXRlZ29yeSA9PT0gaW5DYXRlZ29yeSAmJiBpc3N1ZS5zdWJDYXRlZ29yeSA9PT0gc3ViQ2F0ZWdvcnkpO1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5faXNzdWVzLmZpbHRlcigoaXNzdWUpID0+IGlzc3VlLmNhdGVnb3J5ID09PSBpbkNhdGVnb3J5KTtcblx0XHR9XG5cdH1cblx0Y2hlY2tJZklzc3VlRXhpc3RzKFxuXHRcdGluQ2F0ZWdvcnk6IElzc3VlQ2F0ZWdvcnksXG5cdFx0c2V2ZXJpdHk6IElzc3VlU2V2ZXJpdHksXG5cdFx0ZGV0YWlsczogc3RyaW5nLFxuXHRcdGlzc3VlQ2F0ZWdvcnlUeXBlPzogYW55LFxuXHRcdGlzc3VlU3ViQ2F0ZWdvcnk/OiBzdHJpbmdcblx0KTogYm9vbGVhbiB7XG5cdFx0aWYgKGlzc3VlQ2F0ZWdvcnlUeXBlICYmIGlzc3VlQ2F0ZWdvcnlUeXBlW2luQ2F0ZWdvcnldICYmIGlzc3VlU3ViQ2F0ZWdvcnkpIHtcblx0XHRcdHJldHVybiB0aGlzLl9pc3N1ZXMuc29tZShcblx0XHRcdFx0KGlzc3VlKSA9PlxuXHRcdFx0XHRcdGlzc3VlLmNhdGVnb3J5ID09PSBpbkNhdGVnb3J5ICYmXG5cdFx0XHRcdFx0aXNzdWUuc2V2ZXJpdHkgPT09IHNldmVyaXR5ICYmXG5cdFx0XHRcdFx0aXNzdWUuZGV0YWlscy5yZXBsYWNlKC9cXG4vZywgXCJcIikgPT09IGRldGFpbHMucmVwbGFjZSgvXFxuL2csIFwiXCIpICYmXG5cdFx0XHRcdFx0aXNzdWUuc3ViQ2F0ZWdvcnkgPT09IGlzc3VlU3ViQ2F0ZWdvcnlcblx0XHRcdCk7XG5cdFx0fVxuXHRcdHJldHVybiB0aGlzLl9pc3N1ZXMuc29tZShcblx0XHRcdChpc3N1ZSkgPT5cblx0XHRcdFx0aXNzdWUuY2F0ZWdvcnkgPT09IGluQ2F0ZWdvcnkgJiZcblx0XHRcdFx0aXNzdWUuc2V2ZXJpdHkgPT09IHNldmVyaXR5ICYmXG5cdFx0XHRcdGlzc3VlLmRldGFpbHMucmVwbGFjZSgvXFxuL2csIFwiXCIpID09PSBkZXRhaWxzLnJlcGxhY2UoL1xcbi9nLCBcIlwiKVxuXHRcdCk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRGlhZ25vc3RpY3M7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7TUFRTUEsV0FBVztJQUVoQix1QkFBYztNQUNiLElBQUksQ0FBQ0MsT0FBTyxHQUFHLEVBQUU7SUFDbEI7SUFBQztJQUFBLE9BQ0RDLFFBQVEsR0FBUixrQkFDQ0MsYUFBNEIsRUFDNUJDLGFBQTRCLEVBQzVCQyxPQUFlLEVBQ2ZDLGlCQUFtQyxFQUNuQ0MsV0FBZ0MsRUFDekI7TUFDUCxJQUFNQyxrQkFBa0IsR0FBRyxJQUFJLENBQUNBLGtCQUFrQixDQUFDTCxhQUFhLEVBQUVDLGFBQWEsRUFBRUMsT0FBTyxFQUFFQyxpQkFBaUIsRUFBRUMsV0FBVyxDQUFDO01BQ3pILElBQUksQ0FBQ0Msa0JBQWtCLEVBQUU7UUFDeEIsSUFBSSxDQUFDUCxPQUFPLENBQUNRLElBQUksQ0FBQztVQUNqQkMsUUFBUSxFQUFFUCxhQUFhO1VBQ3ZCUSxRQUFRLEVBQUVQLGFBQWE7VUFDdkJDLE9BQU8sRUFBRUEsT0FBTztVQUNoQkUsV0FBVyxFQUFFQTtRQUNkLENBQUMsQ0FBQztNQUNIO0lBQ0QsQ0FBQztJQUFBLE9BQ0RLLFNBQVMsR0FBVCxxQkFBK0I7TUFDOUIsT0FBTyxJQUFJLENBQUNYLE9BQU87SUFDcEIsQ0FBQztJQUFBLE9BQ0RZLG1CQUFtQixHQUFuQiw2QkFBb0JDLFVBQXlCLEVBQUVQLFdBQW9CLEVBQXFCO01BQ3ZGLElBQUlBLFdBQVcsRUFBRTtRQUNoQixPQUFPLElBQUksQ0FBQ04sT0FBTyxDQUFDYyxNQUFNLENBQUMsVUFBQ0MsS0FBSztVQUFBLE9BQUtBLEtBQUssQ0FBQ04sUUFBUSxLQUFLSSxVQUFVLElBQUlFLEtBQUssQ0FBQ1QsV0FBVyxLQUFLQSxXQUFXO1FBQUEsRUFBQztNQUMxRyxDQUFDLE1BQU07UUFDTixPQUFPLElBQUksQ0FBQ04sT0FBTyxDQUFDYyxNQUFNLENBQUMsVUFBQ0MsS0FBSztVQUFBLE9BQUtBLEtBQUssQ0FBQ04sUUFBUSxLQUFLSSxVQUFVO1FBQUEsRUFBQztNQUNyRTtJQUNELENBQUM7SUFBQSxPQUNETixrQkFBa0IsR0FBbEIsNEJBQ0NNLFVBQXlCLEVBQ3pCSCxRQUF1QixFQUN2Qk4sT0FBZSxFQUNmQyxpQkFBdUIsRUFDdkJXLGdCQUF5QixFQUNmO01BQ1YsSUFBSVgsaUJBQWlCLElBQUlBLGlCQUFpQixDQUFDUSxVQUFVLENBQUMsSUFBSUcsZ0JBQWdCLEVBQUU7UUFDM0UsT0FBTyxJQUFJLENBQUNoQixPQUFPLENBQUNpQixJQUFJLENBQ3ZCLFVBQUNGLEtBQUs7VUFBQSxPQUNMQSxLQUFLLENBQUNOLFFBQVEsS0FBS0ksVUFBVSxJQUM3QkUsS0FBSyxDQUFDTCxRQUFRLEtBQUtBLFFBQVEsSUFDM0JLLEtBQUssQ0FBQ1gsT0FBTyxDQUFDYyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxLQUFLZCxPQUFPLENBQUNjLE9BQU8sQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQy9ESCxLQUFLLENBQUNULFdBQVcsS0FBS1UsZ0JBQWdCO1FBQUEsRUFDdkM7TUFDRjtNQUNBLE9BQU8sSUFBSSxDQUFDaEIsT0FBTyxDQUFDaUIsSUFBSSxDQUN2QixVQUFDRixLQUFLO1FBQUEsT0FDTEEsS0FBSyxDQUFDTixRQUFRLEtBQUtJLFVBQVUsSUFDN0JFLEtBQUssQ0FBQ0wsUUFBUSxLQUFLQSxRQUFRLElBQzNCSyxLQUFLLENBQUNYLE9BQU8sQ0FBQ2MsT0FBTyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsS0FBS2QsT0FBTyxDQUFDYyxPQUFPLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQztNQUFBLEVBQ2hFO0lBQ0YsQ0FBQztJQUFBO0VBQUE7RUFBQSxPQUdhbkIsV0FBVztBQUFBIn0=