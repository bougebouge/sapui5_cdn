/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/core/Core"], function (Core) {
  "use strict";

  var oRB = Core.getLibraryResourceBundle("sap.ui.mdc");
  var ContactHelper = {
    // emails: first preferred, then work
    // phones : first work, then cell, then fax, then preferred
    // address : first preferred, then work
    formatUri: function (itemType, value) {
      switch (itemType) {
        case "phone":
          return "tel:".concat(value);
        case "mail":
          return "mailto:".concat(value);
        default:
          return value;
      }
    },
    formatAddress: function (street, code, locality, region, country) {
      var textToWrite = [];
      if (street) {
        textToWrite.push(street);
      }
      if (code && locality) {
        textToWrite.push("".concat(code, " ").concat(locality));
      } else {
        if (code) {
          textToWrite.push(code);
        }
        if (locality) {
          textToWrite.push(locality);
        }
      }
      if (region) {
        textToWrite.push(region);
      }
      if (country) {
        textToWrite.push(country);
      }
      return textToWrite.join(", ");
    },
    computeLabel: function (itemType, subType) {
      switch (itemType) {
        case "role":
          return oRB.getText("info.POPOVER_CONTACT_SECTION_ROLE");
        case "title":
          return oRB.getText("info.POPOVER_CONTACT_SECTION_JOBTITLE");
        case "org":
          return oRB.getText("info.POPOVER_CONTACT_SECTION_DEPARTMENT");
        case "phone":
          if (subType.indexOf("fax") > -1) {
            return oRB.getText("info.POPOVER_CONTACT_SECTION_FAX");
          } else if (subType.indexOf("work") > -1) {
            return oRB.getText("info.POPOVER_CONTACT_SECTION_PHONE");
          } else if (subType.indexOf("cell") > -1) {
            return oRB.getText("info.POPOVER_CONTACT_SECTION_MOBILE");
          } else if (subType.indexOf("preferred") > -1) {
            return oRB.getText("info.POPOVER_CONTACT_SECTION_PHONE");
          }
          break;
        case "mail":
          return oRB.getText("info.POPOVER_CONTACT_SECTION_EMAIL");
        case "address":
          return oRB.getText("info.POPOVER_CONTACT_SECTION_ADR");
        default:
          return "contactItem";
      }
    },
    getContactTitle: function () {
      return oRB.getText("info.POPOVER_CONTACT_SECTION_TITLE");
    },
    getAvatarInitials: function (oInitials) {
      return oInitials ? oInitials : "";
    }
  };
  return ContactHelper;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJvUkIiLCJDb3JlIiwiZ2V0TGlicmFyeVJlc291cmNlQnVuZGxlIiwiQ29udGFjdEhlbHBlciIsImZvcm1hdFVyaSIsIml0ZW1UeXBlIiwidmFsdWUiLCJmb3JtYXRBZGRyZXNzIiwic3RyZWV0IiwiY29kZSIsImxvY2FsaXR5IiwicmVnaW9uIiwiY291bnRyeSIsInRleHRUb1dyaXRlIiwicHVzaCIsImpvaW4iLCJjb21wdXRlTGFiZWwiLCJzdWJUeXBlIiwiZ2V0VGV4dCIsImluZGV4T2YiLCJnZXRDb250YWN0VGl0bGUiLCJnZXRBdmF0YXJJbml0aWFscyIsIm9Jbml0aWFscyJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQ29udGFjdEhlbHBlci50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgQ29yZSBmcm9tIFwic2FwL3VpL2NvcmUvQ29yZVwiO1xuXG5jb25zdCBvUkIgPSBDb3JlLmdldExpYnJhcnlSZXNvdXJjZUJ1bmRsZShcInNhcC51aS5tZGNcIik7XG5jb25zdCBDb250YWN0SGVscGVyID0ge1xuXHQvLyBlbWFpbHM6IGZpcnN0IHByZWZlcnJlZCwgdGhlbiB3b3JrXG5cdC8vIHBob25lcyA6IGZpcnN0IHdvcmssIHRoZW4gY2VsbCwgdGhlbiBmYXgsIHRoZW4gcHJlZmVycmVkXG5cdC8vIGFkZHJlc3MgOiBmaXJzdCBwcmVmZXJyZWQsIHRoZW4gd29ya1xuXHRmb3JtYXRVcmk6IGZ1bmN0aW9uIChpdGVtVHlwZTogYW55LCB2YWx1ZTogYW55KSB7XG5cdFx0c3dpdGNoIChpdGVtVHlwZSkge1xuXHRcdFx0Y2FzZSBcInBob25lXCI6XG5cdFx0XHRcdHJldHVybiBgdGVsOiR7dmFsdWV9YDtcblx0XHRcdGNhc2UgXCJtYWlsXCI6XG5cdFx0XHRcdHJldHVybiBgbWFpbHRvOiR7dmFsdWV9YDtcblx0XHRcdGRlZmF1bHQ6XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHR9XG5cdH0sXG5cdGZvcm1hdEFkZHJlc3M6IGZ1bmN0aW9uIChzdHJlZXQ6IGFueSwgY29kZTogYW55LCBsb2NhbGl0eTogYW55LCByZWdpb246IGFueSwgY291bnRyeTogYW55KSB7XG5cdFx0Y29uc3QgdGV4dFRvV3JpdGUgPSBbXTtcblx0XHRpZiAoc3RyZWV0KSB7XG5cdFx0XHR0ZXh0VG9Xcml0ZS5wdXNoKHN0cmVldCk7XG5cdFx0fVxuXHRcdGlmIChjb2RlICYmIGxvY2FsaXR5KSB7XG5cdFx0XHR0ZXh0VG9Xcml0ZS5wdXNoKGAke2NvZGV9ICR7bG9jYWxpdHl9YCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGlmIChjb2RlKSB7XG5cdFx0XHRcdHRleHRUb1dyaXRlLnB1c2goY29kZSk7XG5cdFx0XHR9XG5cdFx0XHRpZiAobG9jYWxpdHkpIHtcblx0XHRcdFx0dGV4dFRvV3JpdGUucHVzaChsb2NhbGl0eSk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdGlmIChyZWdpb24pIHtcblx0XHRcdHRleHRUb1dyaXRlLnB1c2gocmVnaW9uKTtcblx0XHR9XG5cdFx0aWYgKGNvdW50cnkpIHtcblx0XHRcdHRleHRUb1dyaXRlLnB1c2goY291bnRyeSk7XG5cdFx0fVxuXHRcdHJldHVybiB0ZXh0VG9Xcml0ZS5qb2luKFwiLCBcIik7XG5cdH0sXG5cdGNvbXB1dGVMYWJlbDogZnVuY3Rpb24gKGl0ZW1UeXBlOiBhbnksIHN1YlR5cGU6IGFueSkge1xuXHRcdHN3aXRjaCAoaXRlbVR5cGUpIHtcblx0XHRcdGNhc2UgXCJyb2xlXCI6XG5cdFx0XHRcdHJldHVybiBvUkIuZ2V0VGV4dChcImluZm8uUE9QT1ZFUl9DT05UQUNUX1NFQ1RJT05fUk9MRVwiKTtcblx0XHRcdGNhc2UgXCJ0aXRsZVwiOlxuXHRcdFx0XHRyZXR1cm4gb1JCLmdldFRleHQoXCJpbmZvLlBPUE9WRVJfQ09OVEFDVF9TRUNUSU9OX0pPQlRJVExFXCIpO1xuXHRcdFx0Y2FzZSBcIm9yZ1wiOlxuXHRcdFx0XHRyZXR1cm4gb1JCLmdldFRleHQoXCJpbmZvLlBPUE9WRVJfQ09OVEFDVF9TRUNUSU9OX0RFUEFSVE1FTlRcIik7XG5cdFx0XHRjYXNlIFwicGhvbmVcIjpcblx0XHRcdFx0aWYgKHN1YlR5cGUuaW5kZXhPZihcImZheFwiKSA+IC0xKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9SQi5nZXRUZXh0KFwiaW5mby5QT1BPVkVSX0NPTlRBQ1RfU0VDVElPTl9GQVhcIik7XG5cdFx0XHRcdH0gZWxzZSBpZiAoc3ViVHlwZS5pbmRleE9mKFwid29ya1wiKSA+IC0xKSB7XG5cdFx0XHRcdFx0cmV0dXJuIG9SQi5nZXRUZXh0KFwiaW5mby5QT1BPVkVSX0NPTlRBQ1RfU0VDVElPTl9QSE9ORVwiKTtcblx0XHRcdFx0fSBlbHNlIGlmIChzdWJUeXBlLmluZGV4T2YoXCJjZWxsXCIpID4gLTEpIHtcblx0XHRcdFx0XHRyZXR1cm4gb1JCLmdldFRleHQoXCJpbmZvLlBPUE9WRVJfQ09OVEFDVF9TRUNUSU9OX01PQklMRVwiKTtcblx0XHRcdFx0fSBlbHNlIGlmIChzdWJUeXBlLmluZGV4T2YoXCJwcmVmZXJyZWRcIikgPiAtMSkge1xuXHRcdFx0XHRcdHJldHVybiBvUkIuZ2V0VGV4dChcImluZm8uUE9QT1ZFUl9DT05UQUNUX1NFQ1RJT05fUEhPTkVcIik7XG5cdFx0XHRcdH1cblx0XHRcdFx0YnJlYWs7XG5cdFx0XHRjYXNlIFwibWFpbFwiOlxuXHRcdFx0XHRyZXR1cm4gb1JCLmdldFRleHQoXCJpbmZvLlBPUE9WRVJfQ09OVEFDVF9TRUNUSU9OX0VNQUlMXCIpO1xuXHRcdFx0Y2FzZSBcImFkZHJlc3NcIjpcblx0XHRcdFx0cmV0dXJuIG9SQi5nZXRUZXh0KFwiaW5mby5QT1BPVkVSX0NPTlRBQ1RfU0VDVElPTl9BRFJcIik7XG5cdFx0XHRkZWZhdWx0OlxuXHRcdFx0XHRyZXR1cm4gXCJjb250YWN0SXRlbVwiO1xuXHRcdH1cblx0fSxcblx0Z2V0Q29udGFjdFRpdGxlOiBmdW5jdGlvbiAoKSB7XG5cdFx0cmV0dXJuIG9SQi5nZXRUZXh0KFwiaW5mby5QT1BPVkVSX0NPTlRBQ1RfU0VDVElPTl9USVRMRVwiKTtcblx0fSxcblx0Z2V0QXZhdGFySW5pdGlhbHM6IGZ1bmN0aW9uIChvSW5pdGlhbHM6IGFueSkge1xuXHRcdHJldHVybiBvSW5pdGlhbHMgPyBvSW5pdGlhbHMgOiBcIlwiO1xuXHR9XG59O1xuXG5leHBvcnQgZGVmYXVsdCBDb250YWN0SGVscGVyO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7O0VBRUEsSUFBTUEsR0FBRyxHQUFHQyxJQUFJLENBQUNDLHdCQUF3QixDQUFDLFlBQVksQ0FBQztFQUN2RCxJQUFNQyxhQUFhLEdBQUc7SUFDckI7SUFDQTtJQUNBO0lBQ0FDLFNBQVMsRUFBRSxVQUFVQyxRQUFhLEVBQUVDLEtBQVUsRUFBRTtNQUMvQyxRQUFRRCxRQUFRO1FBQ2YsS0FBSyxPQUFPO1VBQ1gscUJBQWNDLEtBQUs7UUFDcEIsS0FBSyxNQUFNO1VBQ1Ysd0JBQWlCQSxLQUFLO1FBQ3ZCO1VBQ0MsT0FBT0EsS0FBSztNQUFDO0lBRWhCLENBQUM7SUFDREMsYUFBYSxFQUFFLFVBQVVDLE1BQVcsRUFBRUMsSUFBUyxFQUFFQyxRQUFhLEVBQUVDLE1BQVcsRUFBRUMsT0FBWSxFQUFFO01BQzFGLElBQU1DLFdBQVcsR0FBRyxFQUFFO01BQ3RCLElBQUlMLE1BQU0sRUFBRTtRQUNYSyxXQUFXLENBQUNDLElBQUksQ0FBQ04sTUFBTSxDQUFDO01BQ3pCO01BQ0EsSUFBSUMsSUFBSSxJQUFJQyxRQUFRLEVBQUU7UUFDckJHLFdBQVcsQ0FBQ0MsSUFBSSxXQUFJTCxJQUFJLGNBQUlDLFFBQVEsRUFBRztNQUN4QyxDQUFDLE1BQU07UUFDTixJQUFJRCxJQUFJLEVBQUU7VUFDVEksV0FBVyxDQUFDQyxJQUFJLENBQUNMLElBQUksQ0FBQztRQUN2QjtRQUNBLElBQUlDLFFBQVEsRUFBRTtVQUNiRyxXQUFXLENBQUNDLElBQUksQ0FBQ0osUUFBUSxDQUFDO1FBQzNCO01BQ0Q7TUFDQSxJQUFJQyxNQUFNLEVBQUU7UUFDWEUsV0FBVyxDQUFDQyxJQUFJLENBQUNILE1BQU0sQ0FBQztNQUN6QjtNQUNBLElBQUlDLE9BQU8sRUFBRTtRQUNaQyxXQUFXLENBQUNDLElBQUksQ0FBQ0YsT0FBTyxDQUFDO01BQzFCO01BQ0EsT0FBT0MsV0FBVyxDQUFDRSxJQUFJLENBQUMsSUFBSSxDQUFDO0lBQzlCLENBQUM7SUFDREMsWUFBWSxFQUFFLFVBQVVYLFFBQWEsRUFBRVksT0FBWSxFQUFFO01BQ3BELFFBQVFaLFFBQVE7UUFDZixLQUFLLE1BQU07VUFDVixPQUFPTCxHQUFHLENBQUNrQixPQUFPLENBQUMsbUNBQW1DLENBQUM7UUFDeEQsS0FBSyxPQUFPO1VBQ1gsT0FBT2xCLEdBQUcsQ0FBQ2tCLE9BQU8sQ0FBQyx1Q0FBdUMsQ0FBQztRQUM1RCxLQUFLLEtBQUs7VUFDVCxPQUFPbEIsR0FBRyxDQUFDa0IsT0FBTyxDQUFDLHlDQUF5QyxDQUFDO1FBQzlELEtBQUssT0FBTztVQUNYLElBQUlELE9BQU8sQ0FBQ0UsT0FBTyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQ2hDLE9BQU9uQixHQUFHLENBQUNrQixPQUFPLENBQUMsa0NBQWtDLENBQUM7VUFDdkQsQ0FBQyxNQUFNLElBQUlELE9BQU8sQ0FBQ0UsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQ3hDLE9BQU9uQixHQUFHLENBQUNrQixPQUFPLENBQUMsb0NBQW9DLENBQUM7VUFDekQsQ0FBQyxNQUFNLElBQUlELE9BQU8sQ0FBQ0UsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQ3hDLE9BQU9uQixHQUFHLENBQUNrQixPQUFPLENBQUMscUNBQXFDLENBQUM7VUFDMUQsQ0FBQyxNQUFNLElBQUlELE9BQU8sQ0FBQ0UsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1lBQzdDLE9BQU9uQixHQUFHLENBQUNrQixPQUFPLENBQUMsb0NBQW9DLENBQUM7VUFDekQ7VUFDQTtRQUNELEtBQUssTUFBTTtVQUNWLE9BQU9sQixHQUFHLENBQUNrQixPQUFPLENBQUMsb0NBQW9DLENBQUM7UUFDekQsS0FBSyxTQUFTO1VBQ2IsT0FBT2xCLEdBQUcsQ0FBQ2tCLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQztRQUN2RDtVQUNDLE9BQU8sYUFBYTtNQUFDO0lBRXhCLENBQUM7SUFDREUsZUFBZSxFQUFFLFlBQVk7TUFDNUIsT0FBT3BCLEdBQUcsQ0FBQ2tCLE9BQU8sQ0FBQyxvQ0FBb0MsQ0FBQztJQUN6RCxDQUFDO0lBQ0RHLGlCQUFpQixFQUFFLFVBQVVDLFNBQWMsRUFBRTtNQUM1QyxPQUFPQSxTQUFTLEdBQUdBLFNBQVMsR0FBRyxFQUFFO0lBQ2xDO0VBQ0QsQ0FBQztFQUFDLE9BRWFuQixhQUFhO0FBQUEifQ==