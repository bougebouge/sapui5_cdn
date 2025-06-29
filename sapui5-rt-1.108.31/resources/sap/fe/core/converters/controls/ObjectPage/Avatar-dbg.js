/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/BindingToolkit"], function (BindingToolkit) {
  "use strict";

  var _exports = {};
  var getExpressionFromAnnotation = BindingToolkit.getExpressionFromAnnotation;
  var compileExpression = BindingToolkit.compileExpression;
  var AvatarShape;
  (function (AvatarShape) {
    AvatarShape["Circle"] = "Circle";
    AvatarShape["Square"] = "Square";
  })(AvatarShape || (AvatarShape = {}));
  var isNaturalPerson = function (converterContext) {
    var _converterContext$get, _converterContext$get2;
    return ((_converterContext$get = converterContext.getEntityType().annotations.Common) === null || _converterContext$get === void 0 ? void 0 : (_converterContext$get2 = _converterContext$get.IsNaturalPerson) === null || _converterContext$get2 === void 0 ? void 0 : _converterContext$get2.valueOf()) === true;
  };
  var getFallBackIcon = function (converterContext) {
    var _converterContext$get3, _converterContext$get4;
    var headerInfo = (_converterContext$get3 = converterContext.getEntityType().annotations) === null || _converterContext$get3 === void 0 ? void 0 : (_converterContext$get4 = _converterContext$get3.UI) === null || _converterContext$get4 === void 0 ? void 0 : _converterContext$get4.HeaderInfo;
    if (!headerInfo || headerInfo && !headerInfo.ImageUrl && !headerInfo.TypeImageUrl) {
      return undefined;
    }
    if (headerInfo.ImageUrl && headerInfo.TypeImageUrl) {
      return compileExpression(getExpressionFromAnnotation(headerInfo.TypeImageUrl));
    }
    return compileExpression(isNaturalPerson(converterContext) ? "sap-icon://person-placeholder" : "sap-icon://product");
  };
  var getSource = function (converterContext) {
    var _converterContext$get5, _converterContext$get6;
    var headerInfo = (_converterContext$get5 = converterContext.getEntityType().annotations) === null || _converterContext$get5 === void 0 ? void 0 : (_converterContext$get6 = _converterContext$get5.UI) === null || _converterContext$get6 === void 0 ? void 0 : _converterContext$get6.HeaderInfo;
    if (!headerInfo || !(headerInfo.ImageUrl || headerInfo.TypeImageUrl)) {
      return undefined;
    }
    return compileExpression(getExpressionFromAnnotation(headerInfo.ImageUrl || headerInfo.TypeImageUrl));
  };
  var getAvatar = function (converterContext) {
    var _converterContext$get7, _converterContext$get8;
    var headerInfo = (_converterContext$get7 = converterContext.getEntityType().annotations) === null || _converterContext$get7 === void 0 ? void 0 : (_converterContext$get8 = _converterContext$get7.UI) === null || _converterContext$get8 === void 0 ? void 0 : _converterContext$get8.HeaderInfo;
    var oSource = headerInfo && (headerInfo.ImageUrl || headerInfo.TypeImageUrl || headerInfo.Initials);
    if (!oSource) {
      return undefined;
    }
    return {
      src: getSource(converterContext),
      initials: compileExpression(getExpressionFromAnnotation((headerInfo === null || headerInfo === void 0 ? void 0 : headerInfo.Initials) || "")),
      fallbackIcon: getFallBackIcon(converterContext),
      displayShape: compileExpression(isNaturalPerson(converterContext) ? AvatarShape.Circle : AvatarShape.Square)
    };
  };
  _exports.getAvatar = getAvatar;
  return _exports;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJBdmF0YXJTaGFwZSIsImlzTmF0dXJhbFBlcnNvbiIsImNvbnZlcnRlckNvbnRleHQiLCJnZXRFbnRpdHlUeXBlIiwiYW5ub3RhdGlvbnMiLCJDb21tb24iLCJJc05hdHVyYWxQZXJzb24iLCJ2YWx1ZU9mIiwiZ2V0RmFsbEJhY2tJY29uIiwiaGVhZGVySW5mbyIsIlVJIiwiSGVhZGVySW5mbyIsIkltYWdlVXJsIiwiVHlwZUltYWdlVXJsIiwidW5kZWZpbmVkIiwiY29tcGlsZUV4cHJlc3Npb24iLCJnZXRFeHByZXNzaW9uRnJvbUFubm90YXRpb24iLCJnZXRTb3VyY2UiLCJnZXRBdmF0YXIiLCJvU291cmNlIiwiSW5pdGlhbHMiLCJzcmMiLCJpbml0aWFscyIsImZhbGxiYWNrSWNvbiIsImRpc3BsYXlTaGFwZSIsIkNpcmNsZSIsIlNxdWFyZSJdLCJzb3VyY2VSb290IjoiLiIsInNvdXJjZXMiOlsiQXZhdGFyLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB0eXBlIHsgQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfSBmcm9tIFwic2FwL2ZlL2NvcmUvaGVscGVycy9CaW5kaW5nVG9vbGtpdFwiO1xuaW1wb3J0IHsgY29tcGlsZUV4cHJlc3Npb24sIGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbiB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0JpbmRpbmdUb29sa2l0XCI7XG5pbXBvcnQgdHlwZSBDb252ZXJ0ZXJDb250ZXh0IGZyb20gXCIuLi8uLi9Db252ZXJ0ZXJDb250ZXh0XCI7XG5lbnVtIEF2YXRhclNoYXBlIHtcblx0Q2lyY2xlID0gXCJDaXJjbGVcIixcblx0U3F1YXJlID0gXCJTcXVhcmVcIlxufVxuXG5leHBvcnQgdHlwZSBBdmF0YXIgPSB7XG5cdHNyYz86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRpbml0aWFsczogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb247XG5cdGZhbGxiYWNrSWNvbj86IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xuXHRkaXNwbGF5U2hhcGU6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uO1xufTtcblxuY29uc3QgaXNOYXR1cmFsUGVyc29uID0gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBCb29sZWFuID0+IHtcblx0cmV0dXJuIGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLmFubm90YXRpb25zLkNvbW1vbj8uSXNOYXR1cmFsUGVyc29uPy52YWx1ZU9mKCkgPT09IHRydWU7XG59O1xuXG5jb25zdCBnZXRGYWxsQmFja0ljb24gPSAoY29udmVydGVyQ29udGV4dDogQ29udmVydGVyQ29udGV4dCk6IENvbXBpbGVkQmluZGluZ1Rvb2xraXRFeHByZXNzaW9uIHwgdW5kZWZpbmVkID0+IHtcblx0Y29uc3QgaGVhZGVySW5mbyA9IGNvbnZlcnRlckNvbnRleHQuZ2V0RW50aXR5VHlwZSgpLmFubm90YXRpb25zPy5VST8uSGVhZGVySW5mbztcblx0aWYgKCFoZWFkZXJJbmZvIHx8IChoZWFkZXJJbmZvICYmICFoZWFkZXJJbmZvLkltYWdlVXJsICYmICFoZWFkZXJJbmZvLlR5cGVJbWFnZVVybCkpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdGlmIChoZWFkZXJJbmZvLkltYWdlVXJsICYmIGhlYWRlckluZm8uVHlwZUltYWdlVXJsKSB7XG5cdFx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihoZWFkZXJJbmZvLlR5cGVJbWFnZVVybCkpO1xuXHR9XG5cdHJldHVybiBjb21waWxlRXhwcmVzc2lvbihpc05hdHVyYWxQZXJzb24oY29udmVydGVyQ29udGV4dCkgPyBcInNhcC1pY29uOi8vcGVyc29uLXBsYWNlaG9sZGVyXCIgOiBcInNhcC1pY29uOi8vcHJvZHVjdFwiKTtcbn07XG5cbmNvbnN0IGdldFNvdXJjZSA9IChjb252ZXJ0ZXJDb250ZXh0OiBDb252ZXJ0ZXJDb250ZXh0KTogQ29tcGlsZWRCaW5kaW5nVG9vbGtpdEV4cHJlc3Npb24gfCB1bmRlZmluZWQgPT4ge1xuXHRjb25zdCBoZWFkZXJJbmZvID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkuYW5ub3RhdGlvbnM/LlVJPy5IZWFkZXJJbmZvO1xuXHRpZiAoIWhlYWRlckluZm8gfHwgIShoZWFkZXJJbmZvLkltYWdlVXJsIHx8IGhlYWRlckluZm8uVHlwZUltYWdlVXJsKSkge1xuXHRcdHJldHVybiB1bmRlZmluZWQ7XG5cdH1cblx0cmV0dXJuIGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihoZWFkZXJJbmZvLkltYWdlVXJsIHx8IGhlYWRlckluZm8uVHlwZUltYWdlVXJsKSk7XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0QXZhdGFyID0gKGNvbnZlcnRlckNvbnRleHQ6IENvbnZlcnRlckNvbnRleHQpOiBBdmF0YXIgfCB1bmRlZmluZWQgPT4ge1xuXHRjb25zdCBoZWFkZXJJbmZvID0gY29udmVydGVyQ29udGV4dC5nZXRFbnRpdHlUeXBlKCkuYW5ub3RhdGlvbnM/LlVJPy5IZWFkZXJJbmZvO1xuXHRjb25zdCBvU291cmNlOiBhbnkgPSBoZWFkZXJJbmZvICYmIChoZWFkZXJJbmZvLkltYWdlVXJsIHx8IGhlYWRlckluZm8uVHlwZUltYWdlVXJsIHx8IGhlYWRlckluZm8uSW5pdGlhbHMpO1xuXHRpZiAoIW9Tb3VyY2UpIHtcblx0XHRyZXR1cm4gdW5kZWZpbmVkO1xuXHR9XG5cdHJldHVybiB7XG5cdFx0c3JjOiBnZXRTb3VyY2UoY29udmVydGVyQ29udGV4dCksXG5cdFx0aW5pdGlhbHM6IGNvbXBpbGVFeHByZXNzaW9uKGdldEV4cHJlc3Npb25Gcm9tQW5ub3RhdGlvbihoZWFkZXJJbmZvPy5Jbml0aWFscyB8fCBcIlwiKSksXG5cdFx0ZmFsbGJhY2tJY29uOiBnZXRGYWxsQmFja0ljb24oY29udmVydGVyQ29udGV4dCksXG5cdFx0ZGlzcGxheVNoYXBlOiBjb21waWxlRXhwcmVzc2lvbihpc05hdHVyYWxQZXJzb24oY29udmVydGVyQ29udGV4dCkgPyBBdmF0YXJTaGFwZS5DaXJjbGUgOiBBdmF0YXJTaGFwZS5TcXVhcmUpXG5cdH07XG59O1xuIl0sIm1hcHBpbmdzIjoiO0FBQUE7QUFBQTtBQUFBOzs7Ozs7O01BR0tBLFdBQVc7RUFBQSxXQUFYQSxXQUFXO0lBQVhBLFdBQVc7SUFBWEEsV0FBVztFQUFBLEdBQVhBLFdBQVcsS0FBWEEsV0FBVztFQVloQixJQUFNQyxlQUFlLEdBQUcsVUFBQ0MsZ0JBQWtDLEVBQWM7SUFBQTtJQUN4RSxPQUFPLDBCQUFBQSxnQkFBZ0IsQ0FBQ0MsYUFBYSxFQUFFLENBQUNDLFdBQVcsQ0FBQ0MsTUFBTSxvRkFBbkQsc0JBQXFEQyxlQUFlLDJEQUFwRSx1QkFBc0VDLE9BQU8sRUFBRSxNQUFLLElBQUk7RUFDaEcsQ0FBQztFQUVELElBQU1DLGVBQWUsR0FBRyxVQUFDTixnQkFBa0MsRUFBbUQ7SUFBQTtJQUM3RyxJQUFNTyxVQUFVLDZCQUFHUCxnQkFBZ0IsQ0FBQ0MsYUFBYSxFQUFFLENBQUNDLFdBQVcscUZBQTVDLHVCQUE4Q00sRUFBRSwyREFBaEQsdUJBQWtEQyxVQUFVO0lBQy9FLElBQUksQ0FBQ0YsVUFBVSxJQUFLQSxVQUFVLElBQUksQ0FBQ0EsVUFBVSxDQUFDRyxRQUFRLElBQUksQ0FBQ0gsVUFBVSxDQUFDSSxZQUFhLEVBQUU7TUFDcEYsT0FBT0MsU0FBUztJQUNqQjtJQUNBLElBQUlMLFVBQVUsQ0FBQ0csUUFBUSxJQUFJSCxVQUFVLENBQUNJLFlBQVksRUFBRTtNQUNuRCxPQUFPRSxpQkFBaUIsQ0FBQ0MsMkJBQTJCLENBQUNQLFVBQVUsQ0FBQ0ksWUFBWSxDQUFDLENBQUM7SUFDL0U7SUFDQSxPQUFPRSxpQkFBaUIsQ0FBQ2QsZUFBZSxDQUFDQyxnQkFBZ0IsQ0FBQyxHQUFHLCtCQUErQixHQUFHLG9CQUFvQixDQUFDO0VBQ3JILENBQUM7RUFFRCxJQUFNZSxTQUFTLEdBQUcsVUFBQ2YsZ0JBQWtDLEVBQW1EO0lBQUE7SUFDdkcsSUFBTU8sVUFBVSw2QkFBR1AsZ0JBQWdCLENBQUNDLGFBQWEsRUFBRSxDQUFDQyxXQUFXLHFGQUE1Qyx1QkFBOENNLEVBQUUsMkRBQWhELHVCQUFrREMsVUFBVTtJQUMvRSxJQUFJLENBQUNGLFVBQVUsSUFBSSxFQUFFQSxVQUFVLENBQUNHLFFBQVEsSUFBSUgsVUFBVSxDQUFDSSxZQUFZLENBQUMsRUFBRTtNQUNyRSxPQUFPQyxTQUFTO0lBQ2pCO0lBQ0EsT0FBT0MsaUJBQWlCLENBQUNDLDJCQUEyQixDQUFDUCxVQUFVLENBQUNHLFFBQVEsSUFBSUgsVUFBVSxDQUFDSSxZQUFZLENBQUMsQ0FBQztFQUN0RyxDQUFDO0VBRU0sSUFBTUssU0FBUyxHQUFHLFVBQUNoQixnQkFBa0MsRUFBeUI7SUFBQTtJQUNwRixJQUFNTyxVQUFVLDZCQUFHUCxnQkFBZ0IsQ0FBQ0MsYUFBYSxFQUFFLENBQUNDLFdBQVcscUZBQTVDLHVCQUE4Q00sRUFBRSwyREFBaEQsdUJBQWtEQyxVQUFVO0lBQy9FLElBQU1RLE9BQVksR0FBR1YsVUFBVSxLQUFLQSxVQUFVLENBQUNHLFFBQVEsSUFBSUgsVUFBVSxDQUFDSSxZQUFZLElBQUlKLFVBQVUsQ0FBQ1csUUFBUSxDQUFDO0lBQzFHLElBQUksQ0FBQ0QsT0FBTyxFQUFFO01BQ2IsT0FBT0wsU0FBUztJQUNqQjtJQUNBLE9BQU87TUFDTk8sR0FBRyxFQUFFSixTQUFTLENBQUNmLGdCQUFnQixDQUFDO01BQ2hDb0IsUUFBUSxFQUFFUCxpQkFBaUIsQ0FBQ0MsMkJBQTJCLENBQUMsQ0FBQVAsVUFBVSxhQUFWQSxVQUFVLHVCQUFWQSxVQUFVLENBQUVXLFFBQVEsS0FBSSxFQUFFLENBQUMsQ0FBQztNQUNwRkcsWUFBWSxFQUFFZixlQUFlLENBQUNOLGdCQUFnQixDQUFDO01BQy9Dc0IsWUFBWSxFQUFFVCxpQkFBaUIsQ0FBQ2QsZUFBZSxDQUFDQyxnQkFBZ0IsQ0FBQyxHQUFHRixXQUFXLENBQUN5QixNQUFNLEdBQUd6QixXQUFXLENBQUMwQixNQUFNO0lBQzVHLENBQUM7RUFDRixDQUFDO0VBQUM7RUFBQTtBQUFBIn0=