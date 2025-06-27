/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/base/Object", "sap/ui/model/json/JSONModel"], function (ClassSupport, BaseObject, JSONModel) {
  "use strict";

  var _dec, _class;
  var defineUI5Class = ClassSupport.defineUI5Class;
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  var TemplateModel = (_dec = defineUI5Class("sap.fe.core.TemplateModel"), _dec(_class = /*#__PURE__*/function (_BaseObject) {
    _inheritsLoose(TemplateModel, _BaseObject);
    function TemplateModel(pageConfig, oMetaModel) {
      var _this;
      _this = _BaseObject.call(this) || this;
      _this.oMetaModel = oMetaModel;
      _this.oConfigModel = new JSONModel();
      // don't limit aggregation bindings
      _this.oConfigModel.setSizeLimit(Number.MAX_VALUE);
      _this.bConfigLoaded = false;
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      var that = _assertThisInitialized(_this);
      if (typeof pageConfig === "function") {
        var fnGetObject = _this.oConfigModel._getObject.bind(_this.oConfigModel);
        _this.oConfigModel._getObject = function (sPath, oContext) {
          if (!that.bConfigLoaded) {
            this.setData(pageConfig());
          }
          return fnGetObject(sPath, oContext);
        };
      } else {
        _this.oConfigModel.setData(pageConfig);
      }
      _this.fnCreateMetaBindingContext = _this.oMetaModel.createBindingContext.bind(_this.oMetaModel);
      _this.fnCreateConfigBindingContext = _this.oConfigModel.createBindingContext.bind(_this.oConfigModel);
      _this.fnSetData = _this.oConfigModel.setData.bind(_this.oConfigModel);
      _this.oConfigModel.createBindingContext = _this.createBindingContext.bind(_assertThisInitialized(_this));
      _this.oConfigModel.setData = _this.setData.bind(_assertThisInitialized(_this));
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return _this.oConfigModel || _assertThisInitialized(_this);
    }

    /**
     * Overwrite the standard setData to keep track whether the external configuration has been loaded or not.
     *
     * @param dataToSet The data to set to the json model containing the configuration
     */
    var _proto = TemplateModel.prototype;
    _proto.setData = function setData(dataToSet) {
      this.fnSetData(dataToSet);
      this.bConfigLoaded = true;
    };
    _proto.createBindingContext = function createBindingContext(sPath, oContext, mParameters, fnCallBack) {
      var _oBindingContext;
      var oBindingContext;
      var bNoResolve = mParameters && mParameters.noResolve;
      oBindingContext = this.fnCreateConfigBindingContext(sPath, oContext, mParameters, fnCallBack);
      var sResolvedPath = !bNoResolve && ((_oBindingContext = oBindingContext) === null || _oBindingContext === void 0 ? void 0 : _oBindingContext.getObject());
      if (sResolvedPath && typeof sResolvedPath === "string") {
        oBindingContext = this.fnCreateMetaBindingContext(sResolvedPath, oContext, mParameters, fnCallBack);
      }
      return oBindingContext;
    };
    _proto.destroy = function destroy() {
      this.oConfigModel.destroy();
      JSONModel.prototype.destroy.apply(this);
    };
    return TemplateModel;
  }(BaseObject)) || _class);
  return TemplateModel;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJUZW1wbGF0ZU1vZGVsIiwiZGVmaW5lVUk1Q2xhc3MiLCJwYWdlQ29uZmlnIiwib01ldGFNb2RlbCIsIm9Db25maWdNb2RlbCIsIkpTT05Nb2RlbCIsInNldFNpemVMaW1pdCIsIk51bWJlciIsIk1BWF9WQUxVRSIsImJDb25maWdMb2FkZWQiLCJ0aGF0IiwiZm5HZXRPYmplY3QiLCJfZ2V0T2JqZWN0IiwiYmluZCIsInNQYXRoIiwib0NvbnRleHQiLCJzZXREYXRhIiwiZm5DcmVhdGVNZXRhQmluZGluZ0NvbnRleHQiLCJjcmVhdGVCaW5kaW5nQ29udGV4dCIsImZuQ3JlYXRlQ29uZmlnQmluZGluZ0NvbnRleHQiLCJmblNldERhdGEiLCJkYXRhVG9TZXQiLCJtUGFyYW1ldGVycyIsImZuQ2FsbEJhY2siLCJvQmluZGluZ0NvbnRleHQiLCJiTm9SZXNvbHZlIiwibm9SZXNvbHZlIiwic1Jlc29sdmVkUGF0aCIsImdldE9iamVjdCIsImRlc3Ryb3kiLCJwcm90b3R5cGUiLCJhcHBseSIsIkJhc2VPYmplY3QiXSwic291cmNlUm9vdCI6Ii4iLCJzb3VyY2VzIjpbIlRlbXBsYXRlTW9kZWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgZGVmaW5lVUk1Q2xhc3MgfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9DbGFzc1N1cHBvcnRcIjtcbmltcG9ydCBCYXNlT2JqZWN0IGZyb20gXCJzYXAvdWkvYmFzZS9PYmplY3RcIjtcbmltcG9ydCBKU09OTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9qc29uL0pTT05Nb2RlbFwiO1xuaW1wb3J0IHR5cGUgT0RhdGFNZXRhTW9kZWwgZnJvbSBcInNhcC91aS9tb2RlbC9vZGF0YS92NC9PRGF0YU1ldGFNb2RlbFwiO1xuXG5AZGVmaW5lVUk1Q2xhc3MoXCJzYXAuZmUuY29yZS5UZW1wbGF0ZU1vZGVsXCIpXG5jbGFzcyBUZW1wbGF0ZU1vZGVsIGV4dGVuZHMgQmFzZU9iamVjdCB7XG5cdHB1YmxpYyBvTWV0YU1vZGVsOiBPRGF0YU1ldGFNb2RlbDtcblx0cHVibGljIG9Db25maWdNb2RlbDogYW55O1xuXHRwdWJsaWMgYkNvbmZpZ0xvYWRlZDogYm9vbGVhbjtcblx0cHVibGljIGZuQ3JlYXRlTWV0YUJpbmRpbmdDb250ZXh0OiBGdW5jdGlvbjtcblx0cHVibGljIGZuQ3JlYXRlQ29uZmlnQmluZGluZ0NvbnRleHQ6IEZ1bmN0aW9uO1xuXHRwdWJsaWMgZm5TZXREYXRhOiBGdW5jdGlvbjtcblxuXHRjb25zdHJ1Y3RvcihwYWdlQ29uZmlnOiBhbnksIG9NZXRhTW9kZWw6IE9EYXRhTWV0YU1vZGVsKSB7XG5cdFx0c3VwZXIoKTtcblx0XHR0aGlzLm9NZXRhTW9kZWwgPSBvTWV0YU1vZGVsO1xuXHRcdHRoaXMub0NvbmZpZ01vZGVsID0gbmV3IEpTT05Nb2RlbCgpO1xuXHRcdC8vIGRvbid0IGxpbWl0IGFnZ3JlZ2F0aW9uIGJpbmRpbmdzXG5cdFx0dGhpcy5vQ29uZmlnTW9kZWwuc2V0U2l6ZUxpbWl0KE51bWJlci5NQVhfVkFMVUUpO1xuXHRcdHRoaXMuYkNvbmZpZ0xvYWRlZCA9IGZhbHNlO1xuXHRcdC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhc1xuXHRcdGNvbnN0IHRoYXQgPSB0aGlzO1xuXG5cdFx0aWYgKHR5cGVvZiBwYWdlQ29uZmlnID09PSBcImZ1bmN0aW9uXCIpIHtcblx0XHRcdGNvbnN0IGZuR2V0T2JqZWN0ID0gdGhpcy5vQ29uZmlnTW9kZWwuX2dldE9iamVjdC5iaW5kKHRoaXMub0NvbmZpZ01vZGVsKTtcblx0XHRcdHRoaXMub0NvbmZpZ01vZGVsLl9nZXRPYmplY3QgPSBmdW5jdGlvbiAoc1BhdGg6IGFueSwgb0NvbnRleHQ6IGFueSkge1xuXHRcdFx0XHRpZiAoIXRoYXQuYkNvbmZpZ0xvYWRlZCkge1xuXHRcdFx0XHRcdHRoaXMuc2V0RGF0YShwYWdlQ29uZmlnKCkpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBmbkdldE9iamVjdChzUGF0aCwgb0NvbnRleHQpO1xuXHRcdFx0fTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhpcy5vQ29uZmlnTW9kZWwuc2V0RGF0YShwYWdlQ29uZmlnKTtcblx0XHR9XG5cblx0XHR0aGlzLmZuQ3JlYXRlTWV0YUJpbmRpbmdDb250ZXh0ID0gdGhpcy5vTWV0YU1vZGVsLmNyZWF0ZUJpbmRpbmdDb250ZXh0LmJpbmQodGhpcy5vTWV0YU1vZGVsKTtcblx0XHR0aGlzLmZuQ3JlYXRlQ29uZmlnQmluZGluZ0NvbnRleHQgPSB0aGlzLm9Db25maWdNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dC5iaW5kKHRoaXMub0NvbmZpZ01vZGVsKTtcblx0XHR0aGlzLmZuU2V0RGF0YSA9IHRoaXMub0NvbmZpZ01vZGVsLnNldERhdGEuYmluZCh0aGlzLm9Db25maWdNb2RlbCk7XG5cblx0XHR0aGlzLm9Db25maWdNb2RlbC5jcmVhdGVCaW5kaW5nQ29udGV4dCA9IHRoaXMuY3JlYXRlQmluZGluZ0NvbnRleHQuYmluZCh0aGlzKTtcblx0XHR0aGlzLm9Db25maWdNb2RlbC5zZXREYXRhID0gdGhpcy5zZXREYXRhLmJpbmQodGhpcyk7XG5cdFx0Ly8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9iYW4tdHMtY29tbWVudFxuXHRcdC8vIEB0cy1pZ25vcmVcblx0XHRyZXR1cm4gdGhpcy5vQ29uZmlnTW9kZWw7XG5cdH1cblxuXHQvKipcblx0ICogT3ZlcndyaXRlIHRoZSBzdGFuZGFyZCBzZXREYXRhIHRvIGtlZXAgdHJhY2sgd2hldGhlciB0aGUgZXh0ZXJuYWwgY29uZmlndXJhdGlvbiBoYXMgYmVlbiBsb2FkZWQgb3Igbm90LlxuXHQgKlxuXHQgKiBAcGFyYW0gZGF0YVRvU2V0IFRoZSBkYXRhIHRvIHNldCB0byB0aGUganNvbiBtb2RlbCBjb250YWluaW5nIHRoZSBjb25maWd1cmF0aW9uXG5cdCAqL1xuXHRzZXREYXRhKGRhdGFUb1NldDogb2JqZWN0KSB7XG5cdFx0dGhpcy5mblNldERhdGEoZGF0YVRvU2V0KTtcblx0XHR0aGlzLmJDb25maWdMb2FkZWQgPSB0cnVlO1xuXHR9XG5cblx0Y3JlYXRlQmluZGluZ0NvbnRleHQoc1BhdGg6IGFueSwgb0NvbnRleHQ/OiBhbnksIG1QYXJhbWV0ZXJzPzogYW55LCBmbkNhbGxCYWNrPzogYW55KSB7XG5cdFx0bGV0IG9CaW5kaW5nQ29udGV4dDtcblx0XHRjb25zdCBiTm9SZXNvbHZlID0gbVBhcmFtZXRlcnMgJiYgbVBhcmFtZXRlcnMubm9SZXNvbHZlO1xuXG5cdFx0b0JpbmRpbmdDb250ZXh0ID0gdGhpcy5mbkNyZWF0ZUNvbmZpZ0JpbmRpbmdDb250ZXh0KHNQYXRoLCBvQ29udGV4dCwgbVBhcmFtZXRlcnMsIGZuQ2FsbEJhY2spO1xuXHRcdGNvbnN0IHNSZXNvbHZlZFBhdGggPSAhYk5vUmVzb2x2ZSAmJiBvQmluZGluZ0NvbnRleHQ/LmdldE9iamVjdCgpO1xuXHRcdGlmIChzUmVzb2x2ZWRQYXRoICYmIHR5cGVvZiBzUmVzb2x2ZWRQYXRoID09PSBcInN0cmluZ1wiKSB7XG5cdFx0XHRvQmluZGluZ0NvbnRleHQgPSB0aGlzLmZuQ3JlYXRlTWV0YUJpbmRpbmdDb250ZXh0KHNSZXNvbHZlZFBhdGgsIG9Db250ZXh0LCBtUGFyYW1ldGVycywgZm5DYWxsQmFjayk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG9CaW5kaW5nQ29udGV4dDtcblx0fVxuXG5cdGRlc3Ryb3koKSB7XG5cdFx0dGhpcy5vQ29uZmlnTW9kZWwuZGVzdHJveSgpO1xuXHRcdEpTT05Nb2RlbC5wcm90b3R5cGUuZGVzdHJveS5hcHBseSh0aGlzKTtcblx0fVxufVxuXG5leHBvcnQgZGVmYXVsdCBUZW1wbGF0ZU1vZGVsO1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7TUFNTUEsYUFBYSxXQURsQkMsY0FBYyxDQUFDLDJCQUEyQixDQUFDO0lBQUE7SUFTM0MsdUJBQVlDLFVBQWUsRUFBRUMsVUFBMEIsRUFBRTtNQUFBO01BQ3hELDhCQUFPO01BQ1AsTUFBS0EsVUFBVSxHQUFHQSxVQUFVO01BQzVCLE1BQUtDLFlBQVksR0FBRyxJQUFJQyxTQUFTLEVBQUU7TUFDbkM7TUFDQSxNQUFLRCxZQUFZLENBQUNFLFlBQVksQ0FBQ0MsTUFBTSxDQUFDQyxTQUFTLENBQUM7TUFDaEQsTUFBS0MsYUFBYSxHQUFHLEtBQUs7TUFDMUI7TUFDQSxJQUFNQyxJQUFJLGdDQUFPO01BRWpCLElBQUksT0FBT1IsVUFBVSxLQUFLLFVBQVUsRUFBRTtRQUNyQyxJQUFNUyxXQUFXLEdBQUcsTUFBS1AsWUFBWSxDQUFDUSxVQUFVLENBQUNDLElBQUksQ0FBQyxNQUFLVCxZQUFZLENBQUM7UUFDeEUsTUFBS0EsWUFBWSxDQUFDUSxVQUFVLEdBQUcsVUFBVUUsS0FBVSxFQUFFQyxRQUFhLEVBQUU7VUFDbkUsSUFBSSxDQUFDTCxJQUFJLENBQUNELGFBQWEsRUFBRTtZQUN4QixJQUFJLENBQUNPLE9BQU8sQ0FBQ2QsVUFBVSxFQUFFLENBQUM7VUFDM0I7VUFDQSxPQUFPUyxXQUFXLENBQUNHLEtBQUssRUFBRUMsUUFBUSxDQUFDO1FBQ3BDLENBQUM7TUFDRixDQUFDLE1BQU07UUFDTixNQUFLWCxZQUFZLENBQUNZLE9BQU8sQ0FBQ2QsVUFBVSxDQUFDO01BQ3RDO01BRUEsTUFBS2UsMEJBQTBCLEdBQUcsTUFBS2QsVUFBVSxDQUFDZSxvQkFBb0IsQ0FBQ0wsSUFBSSxDQUFDLE1BQUtWLFVBQVUsQ0FBQztNQUM1RixNQUFLZ0IsNEJBQTRCLEdBQUcsTUFBS2YsWUFBWSxDQUFDYyxvQkFBb0IsQ0FBQ0wsSUFBSSxDQUFDLE1BQUtULFlBQVksQ0FBQztNQUNsRyxNQUFLZ0IsU0FBUyxHQUFHLE1BQUtoQixZQUFZLENBQUNZLE9BQU8sQ0FBQ0gsSUFBSSxDQUFDLE1BQUtULFlBQVksQ0FBQztNQUVsRSxNQUFLQSxZQUFZLENBQUNjLG9CQUFvQixHQUFHLE1BQUtBLG9CQUFvQixDQUFDTCxJQUFJLCtCQUFNO01BQzdFLE1BQUtULFlBQVksQ0FBQ1ksT0FBTyxHQUFHLE1BQUtBLE9BQU8sQ0FBQ0gsSUFBSSwrQkFBTTtNQUNuRDtNQUNBO01BQ0EsT0FBTyxNQUFLVCxZQUFZO0lBQ3pCOztJQUVBO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7SUFKQztJQUFBLE9BS0FZLE9BQU8sR0FBUCxpQkFBUUssU0FBaUIsRUFBRTtNQUMxQixJQUFJLENBQUNELFNBQVMsQ0FBQ0MsU0FBUyxDQUFDO01BQ3pCLElBQUksQ0FBQ1osYUFBYSxHQUFHLElBQUk7SUFDMUIsQ0FBQztJQUFBLE9BRURTLG9CQUFvQixHQUFwQiw4QkFBcUJKLEtBQVUsRUFBRUMsUUFBYyxFQUFFTyxXQUFpQixFQUFFQyxVQUFnQixFQUFFO01BQUE7TUFDckYsSUFBSUMsZUFBZTtNQUNuQixJQUFNQyxVQUFVLEdBQUdILFdBQVcsSUFBSUEsV0FBVyxDQUFDSSxTQUFTO01BRXZERixlQUFlLEdBQUcsSUFBSSxDQUFDTCw0QkFBNEIsQ0FBQ0wsS0FBSyxFQUFFQyxRQUFRLEVBQUVPLFdBQVcsRUFBRUMsVUFBVSxDQUFDO01BQzdGLElBQU1JLGFBQWEsR0FBRyxDQUFDRixVQUFVLHlCQUFJRCxlQUFlLHFEQUFmLGlCQUFpQkksU0FBUyxFQUFFO01BQ2pFLElBQUlELGFBQWEsSUFBSSxPQUFPQSxhQUFhLEtBQUssUUFBUSxFQUFFO1FBQ3ZESCxlQUFlLEdBQUcsSUFBSSxDQUFDUCwwQkFBMEIsQ0FBQ1UsYUFBYSxFQUFFWixRQUFRLEVBQUVPLFdBQVcsRUFBRUMsVUFBVSxDQUFDO01BQ3BHO01BRUEsT0FBT0MsZUFBZTtJQUN2QixDQUFDO0lBQUEsT0FFREssT0FBTyxHQUFQLG1CQUFVO01BQ1QsSUFBSSxDQUFDekIsWUFBWSxDQUFDeUIsT0FBTyxFQUFFO01BQzNCeEIsU0FBUyxDQUFDeUIsU0FBUyxDQUFDRCxPQUFPLENBQUNFLEtBQUssQ0FBQyxJQUFJLENBQUM7SUFDeEMsQ0FBQztJQUFBO0VBQUEsRUFuRTBCQyxVQUFVO0VBQUEsT0FzRXZCaEMsYUFBYTtBQUFBIn0=