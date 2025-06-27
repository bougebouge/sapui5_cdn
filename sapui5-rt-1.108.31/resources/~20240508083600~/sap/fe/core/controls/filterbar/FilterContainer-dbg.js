/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/ui/mdc/filterbar/aligned/FilterContainer", "sap/fe/core/helpers/ClassSupport"], function (MdcFilterContainer, ClassSupport) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  /**
   * Constructor for a new FE filter container.
   *
   * @extends sap.ui.mdc.filterbar.aligned.FilterContainer
   * @class
   * @private
   * @alias sap.fe.core.controls.filterbar.FilterContainer
   */
  var FilterContainer = (_dec = defineUI5Class("sap.fe.core.controls.filterbar.FilterContainer"), _dec(_class = /*#__PURE__*/function (_MdcFilterContainer) {
    _inheritsLoose(FilterContainer, _MdcFilterContainer);
    function FilterContainer() {
      return _MdcFilterContainer.apply(this, arguments) || this;
    }
    var _proto = FilterContainer.prototype;
    _proto.init = function init() {
      var _MdcFilterContainer$p;
      this.aAllFilterFields = [];
      this.aAllVisualFilters = {};
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      (_MdcFilterContainer$p = _MdcFilterContainer.prototype.init).call.apply(_MdcFilterContainer$p, [this].concat(args));
    };
    _proto.exit = function exit() {
      var _MdcFilterContainer$p2,
        _this = this;
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }
      // destroy layout
      (_MdcFilterContainer$p2 = _MdcFilterContainer.prototype.exit).call.apply(_MdcFilterContainer$p2, [this].concat(args));
      // destroy all filter fields which are not in the layout
      this.aAllFilterFields.forEach(function (oFilterField) {
        oFilterField.destroy();
      });
      Object.keys(this.aAllVisualFilters).forEach(function (sKey) {
        _this.aAllVisualFilters[sKey].destroy();
      });
    };
    _proto.insertFilterField = function insertFilterField(oControl, iIndex) {
      var _this2 = this;
      var oFilterItemLayoutEventDelegate = {
        onBeforeRendering: function () {
          // For compact filters the item layout needs to render both label and filter field.
          // hence use the original getContent of the FilterItemLayout
          if (oControl._fnGetContentCopy) {
            oControl.getContent = oControl._fnGetContentCopy;
          }
          oControl.removeEventDelegate(oFilterItemLayoutEventDelegate);
        }
      };
      oControl.addEventDelegate(oFilterItemLayoutEventDelegate);

      // In this layout there is no need to render visual filter
      // hence find the filter field from the layout and remove it's content aggregation
      oControl.getContent().forEach(function (oInnerControl) {
        var oContent = oInnerControl.getContent && oInnerControl.getContent();
        if (oInnerControl.isA("sap.ui.mdc.FilterField") && oContent && oContent.isA("sap.fe.core.controls.filterbar.VisualFilter")) {
          // store the visual filter for later use.
          var oVFId = oInnerControl.getId();
          _this2.aAllVisualFilters[oVFId] = oContent;
          // remove the content aggregation to render internal content of the field
          oInnerControl.setContent(null);
        }
      });

      // store filter fields to refer to when switching between layout
      this.aAllFilterFields.push(oControl);
      _MdcFilterContainer.prototype.insertFilterField.call(this, oControl, iIndex);
    };
    _proto.removeFilterField = function removeFilterField(oControl) {
      var _this3 = this;
      var oFilterFieldIndex = this.aAllFilterFields.findIndex(function (oFilterField) {
        return oFilterField.getId() === oControl.getId();
      });

      // Setting VF content for Fillterfield before removing
      oControl.getContent().forEach(function (oInnerControl) {
        if (oInnerControl.isA("sap.ui.mdc.FilterField") && !oInnerControl.getContent()) {
          var oVFId = oInnerControl.getId();
          if (_this3.aAllVisualFilters[oVFId]) {
            oInnerControl.setContent(_this3.aAllVisualFilters[oVFId]);
          }
        }
      });
      this.aAllFilterFields.splice(oFilterFieldIndex, 1);
      _MdcFilterContainer.prototype.removeFilterField.call(this, oControl);
    };
    _proto.removeAllFilterFields = function removeAllFilterFields() {
      this.aAllFilterFields = [];
      this.aAllVisualFilters = {};
      this.oLayout.removeAllContent();
    };
    _proto.getAllButtons = function getAllButtons() {
      return this.oLayout.getEndContent();
    };
    _proto.removeButton = function removeButton(oControl) {
      this.oLayout.removeEndContent(oControl);
    };
    _proto.getAllFilterFields = function getAllFilterFields() {
      return this.aAllFilterFields.slice();
    };
    _proto.getAllVisualFilterFields = function getAllVisualFilterFields() {
      return this.aAllVisualFilters;
    };
    _proto.setAllFilterFields = function setAllFilterFields(aFilterFields) {
      this.aAllFilterFields = aFilterFields;
    };
    return FilterContainer;
  }(MdcFilterContainer)) || _class);
  return FilterContainer;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJGaWx0ZXJDb250YWluZXIiLCJkZWZpbmVVSTVDbGFzcyIsImluaXQiLCJhQWxsRmlsdGVyRmllbGRzIiwiYUFsbFZpc3VhbEZpbHRlcnMiLCJhcmdzIiwiZXhpdCIsImZvckVhY2giLCJvRmlsdGVyRmllbGQiLCJkZXN0cm95IiwiT2JqZWN0Iiwia2V5cyIsInNLZXkiLCJpbnNlcnRGaWx0ZXJGaWVsZCIsIm9Db250cm9sIiwiaUluZGV4Iiwib0ZpbHRlckl0ZW1MYXlvdXRFdmVudERlbGVnYXRlIiwib25CZWZvcmVSZW5kZXJpbmciLCJfZm5HZXRDb250ZW50Q29weSIsImdldENvbnRlbnQiLCJyZW1vdmVFdmVudERlbGVnYXRlIiwiYWRkRXZlbnREZWxlZ2F0ZSIsIm9Jbm5lckNvbnRyb2wiLCJvQ29udGVudCIsImlzQSIsIm9WRklkIiwiZ2V0SWQiLCJzZXRDb250ZW50IiwicHVzaCIsInJlbW92ZUZpbHRlckZpZWxkIiwib0ZpbHRlckZpZWxkSW5kZXgiLCJmaW5kSW5kZXgiLCJzcGxpY2UiLCJyZW1vdmVBbGxGaWx0ZXJGaWVsZHMiLCJvTGF5b3V0IiwicmVtb3ZlQWxsQ29udGVudCIsImdldEFsbEJ1dHRvbnMiLCJnZXRFbmRDb250ZW50IiwicmVtb3ZlQnV0dG9uIiwicmVtb3ZlRW5kQ29udGVudCIsImdldEFsbEZpbHRlckZpZWxkcyIsInNsaWNlIiwiZ2V0QWxsVmlzdWFsRmlsdGVyRmllbGRzIiwic2V0QWxsRmlsdGVyRmllbGRzIiwiYUZpbHRlckZpZWxkcyIsIk1kY0ZpbHRlckNvbnRhaW5lciJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiRmlsdGVyQ29udGFpbmVyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBNZGNGaWx0ZXJDb250YWluZXIgZnJvbSBcInNhcC91aS9tZGMvZmlsdGVyYmFyL2FsaWduZWQvRmlsdGVyQ29udGFpbmVyXCI7XG5pbXBvcnQgeyBkZWZpbmVVSTVDbGFzcyB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuXG4vKipcbiAqIENvbnN0cnVjdG9yIGZvciBhIG5ldyBGRSBmaWx0ZXIgY29udGFpbmVyLlxuICpcbiAqIEBleHRlbmRzIHNhcC51aS5tZGMuZmlsdGVyYmFyLmFsaWduZWQuRmlsdGVyQ29udGFpbmVyXG4gKiBAY2xhc3NcbiAqIEBwcml2YXRlXG4gKiBAYWxpYXMgc2FwLmZlLmNvcmUuY29udHJvbHMuZmlsdGVyYmFyLkZpbHRlckNvbnRhaW5lclxuICovXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5jb250cm9scy5maWx0ZXJiYXIuRmlsdGVyQ29udGFpbmVyXCIpXG5jbGFzcyBGaWx0ZXJDb250YWluZXIgZXh0ZW5kcyBNZGNGaWx0ZXJDb250YWluZXIge1xuXHRpbml0KC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0dGhpcy5hQWxsRmlsdGVyRmllbGRzID0gW107XG5cdFx0dGhpcy5hQWxsVmlzdWFsRmlsdGVycyA9IHt9O1xuXHRcdHN1cGVyLmluaXQoLi4uYXJncyk7XG5cdH1cblxuXHRleGl0KC4uLmFyZ3M6IGFueVtdKSB7XG5cdFx0Ly8gZGVzdHJveSBsYXlvdXRcblx0XHRzdXBlci5leGl0KC4uLmFyZ3MpO1xuXHRcdC8vIGRlc3Ryb3kgYWxsIGZpbHRlciBmaWVsZHMgd2hpY2ggYXJlIG5vdCBpbiB0aGUgbGF5b3V0XG5cdFx0dGhpcy5hQWxsRmlsdGVyRmllbGRzLmZvckVhY2goZnVuY3Rpb24ob0ZpbHRlckZpZWxkOiBhbnkpIHtcblx0XHRcdG9GaWx0ZXJGaWVsZC5kZXN0cm95KCk7XG5cdFx0fSk7XG5cdFx0T2JqZWN0LmtleXModGhpcy5hQWxsVmlzdWFsRmlsdGVycykuZm9yRWFjaCgoc0tleTogc3RyaW5nKSA9PiB7XG5cdFx0XHR0aGlzLmFBbGxWaXN1YWxGaWx0ZXJzW3NLZXldLmRlc3Ryb3koKTtcblx0XHR9KTtcblx0fVxuXG5cdGluc2VydEZpbHRlckZpZWxkKG9Db250cm9sOiBhbnksIGlJbmRleDogbnVtYmVyKSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckl0ZW1MYXlvdXRFdmVudERlbGVnYXRlID0ge1xuXHRcdFx0b25CZWZvcmVSZW5kZXJpbmc6IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHQvLyBGb3IgY29tcGFjdCBmaWx0ZXJzIHRoZSBpdGVtIGxheW91dCBuZWVkcyB0byByZW5kZXIgYm90aCBsYWJlbCBhbmQgZmlsdGVyIGZpZWxkLlxuXHRcdFx0XHQvLyBoZW5jZSB1c2UgdGhlIG9yaWdpbmFsIGdldENvbnRlbnQgb2YgdGhlIEZpbHRlckl0ZW1MYXlvdXRcblx0XHRcdFx0aWYgKG9Db250cm9sLl9mbkdldENvbnRlbnRDb3B5KSB7XG5cdFx0XHRcdFx0b0NvbnRyb2wuZ2V0Q29udGVudCA9IG9Db250cm9sLl9mbkdldENvbnRlbnRDb3B5O1xuXHRcdFx0XHR9XG5cdFx0XHRcdG9Db250cm9sLnJlbW92ZUV2ZW50RGVsZWdhdGUob0ZpbHRlckl0ZW1MYXlvdXRFdmVudERlbGVnYXRlKTtcblx0XHRcdH1cblx0XHR9O1xuXHRcdG9Db250cm9sLmFkZEV2ZW50RGVsZWdhdGUob0ZpbHRlckl0ZW1MYXlvdXRFdmVudERlbGVnYXRlKTtcblxuXHRcdC8vIEluIHRoaXMgbGF5b3V0IHRoZXJlIGlzIG5vIG5lZWQgdG8gcmVuZGVyIHZpc3VhbCBmaWx0ZXJcblx0XHQvLyBoZW5jZSBmaW5kIHRoZSBmaWx0ZXIgZmllbGQgZnJvbSB0aGUgbGF5b3V0IGFuZCByZW1vdmUgaXQncyBjb250ZW50IGFnZ3JlZ2F0aW9uXG5cdFx0b0NvbnRyb2wuZ2V0Q29udGVudCgpLmZvckVhY2goKG9Jbm5lckNvbnRyb2w6IGFueSkgPT4ge1xuXHRcdFx0Y29uc3Qgb0NvbnRlbnQgPSBvSW5uZXJDb250cm9sLmdldENvbnRlbnQgJiYgb0lubmVyQ29udHJvbC5nZXRDb250ZW50KCk7XG5cdFx0XHRpZiAob0lubmVyQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpICYmIG9Db250ZW50ICYmIG9Db250ZW50LmlzQShcInNhcC5mZS5jb3JlLmNvbnRyb2xzLmZpbHRlcmJhci5WaXN1YWxGaWx0ZXJcIikpIHtcblx0XHRcdFx0Ly8gc3RvcmUgdGhlIHZpc3VhbCBmaWx0ZXIgZm9yIGxhdGVyIHVzZS5cblx0XHRcdFx0Y29uc3Qgb1ZGSWQgPSBvSW5uZXJDb250cm9sLmdldElkKCk7XG5cdFx0XHRcdHRoaXMuYUFsbFZpc3VhbEZpbHRlcnNbb1ZGSWRdID0gb0NvbnRlbnQ7XG5cdFx0XHRcdC8vIHJlbW92ZSB0aGUgY29udGVudCBhZ2dyZWdhdGlvbiB0byByZW5kZXIgaW50ZXJuYWwgY29udGVudCBvZiB0aGUgZmllbGRcblx0XHRcdFx0b0lubmVyQ29udHJvbC5zZXRDb250ZW50KG51bGwpO1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0Ly8gc3RvcmUgZmlsdGVyIGZpZWxkcyB0byByZWZlciB0byB3aGVuIHN3aXRjaGluZyBiZXR3ZWVuIGxheW91dFxuXHRcdHRoaXMuYUFsbEZpbHRlckZpZWxkcy5wdXNoKG9Db250cm9sKTtcblx0XHRzdXBlci5pbnNlcnRGaWx0ZXJGaWVsZChvQ29udHJvbCwgaUluZGV4KTtcblx0fVxuXHRyZW1vdmVGaWx0ZXJGaWVsZChvQ29udHJvbDogYW55KSB7XG5cdFx0Y29uc3Qgb0ZpbHRlckZpZWxkSW5kZXggPSB0aGlzLmFBbGxGaWx0ZXJGaWVsZHMuZmluZEluZGV4KGZ1bmN0aW9uKG9GaWx0ZXJGaWVsZDogYW55KSB7XG5cdFx0XHRyZXR1cm4gb0ZpbHRlckZpZWxkLmdldElkKCkgPT09IG9Db250cm9sLmdldElkKCk7XG5cdFx0fSk7XG5cblx0XHQvLyBTZXR0aW5nIFZGIGNvbnRlbnQgZm9yIEZpbGx0ZXJmaWVsZCBiZWZvcmUgcmVtb3Zpbmdcblx0XHRvQ29udHJvbC5nZXRDb250ZW50KCkuZm9yRWFjaCgob0lubmVyQ29udHJvbDogYW55KSA9PiB7XG5cdFx0XHRpZiAob0lubmVyQ29udHJvbC5pc0EoXCJzYXAudWkubWRjLkZpbHRlckZpZWxkXCIpICYmICFvSW5uZXJDb250cm9sLmdldENvbnRlbnQoKSkge1xuXHRcdFx0XHRjb25zdCBvVkZJZCA9IG9Jbm5lckNvbnRyb2wuZ2V0SWQoKTtcblx0XHRcdFx0aWYgKHRoaXMuYUFsbFZpc3VhbEZpbHRlcnNbb1ZGSWRdKSB7XG5cdFx0XHRcdFx0b0lubmVyQ29udHJvbC5zZXRDb250ZW50KHRoaXMuYUFsbFZpc3VhbEZpbHRlcnNbb1ZGSWRdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dGhpcy5hQWxsRmlsdGVyRmllbGRzLnNwbGljZShvRmlsdGVyRmllbGRJbmRleCwgMSk7XG5cblx0XHRzdXBlci5yZW1vdmVGaWx0ZXJGaWVsZChvQ29udHJvbCk7XG5cdH1cblx0cmVtb3ZlQWxsRmlsdGVyRmllbGRzKCkge1xuXHRcdHRoaXMuYUFsbEZpbHRlckZpZWxkcyA9IFtdO1xuXHRcdHRoaXMuYUFsbFZpc3VhbEZpbHRlcnMgPSB7fTtcblx0XHR0aGlzLm9MYXlvdXQucmVtb3ZlQWxsQ29udGVudCgpO1xuXHR9XG5cdGdldEFsbEJ1dHRvbnMoKSB7XG5cdFx0cmV0dXJuIHRoaXMub0xheW91dC5nZXRFbmRDb250ZW50KCk7XG5cdH1cblx0cmVtb3ZlQnV0dG9uKG9Db250cm9sOiBhbnkpIHtcblx0XHR0aGlzLm9MYXlvdXQucmVtb3ZlRW5kQ29udGVudChvQ29udHJvbCk7XG5cdH1cblx0Z2V0QWxsRmlsdGVyRmllbGRzKCkge1xuXHRcdHJldHVybiB0aGlzLmFBbGxGaWx0ZXJGaWVsZHMuc2xpY2UoKTtcblx0fVxuXHRnZXRBbGxWaXN1YWxGaWx0ZXJGaWVsZHMoKSB7XG5cdFx0cmV0dXJuIHRoaXMuYUFsbFZpc3VhbEZpbHRlcnM7XG5cdH1cblx0c2V0QWxsRmlsdGVyRmllbGRzKGFGaWx0ZXJGaWVsZHM6IGFueSkge1xuXHRcdHRoaXMuYUFsbEZpbHRlckZpZWxkcyA9IGFGaWx0ZXJGaWVsZHM7XG5cdH1cbn1cbmV4cG9ydCBkZWZhdWx0IEZpbHRlckNvbnRhaW5lcjtcbiJdLCJtYXBwaW5ncyI6IjtB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