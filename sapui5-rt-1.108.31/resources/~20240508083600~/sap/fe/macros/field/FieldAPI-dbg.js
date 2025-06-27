/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *      (c) Copyright 2009-2021 SAP SE. All rights reserved
 */
sap.ui.define(["sap/fe/core/helpers/ClassSupport", "sap/ui/core/message/Message", "../MacroAPI"], function (ClassSupport, Message, MacroAPI) {
  "use strict";

  var _dec, _dec2, _dec3, _dec4, _dec5, _dec6, _dec7, _dec8, _dec9, _dec10, _dec11, _dec12, _class, _class2, _descriptor, _descriptor2, _descriptor3, _descriptor4, _descriptor5, _descriptor6, _descriptor7, _descriptor8, _descriptor9, _descriptor10;
  var xmlEventHandler = ClassSupport.xmlEventHandler;
  var property = ClassSupport.property;
  var event = ClassSupport.event;
  var defineUI5Class = ClassSupport.defineUI5Class;
  var association = ClassSupport.association;
  function _initializerDefineProperty(target, property, descriptor, context) { if (!descriptor) return; Object.defineProperty(target, property, { enumerable: descriptor.enumerable, configurable: descriptor.configurable, writable: descriptor.writable, value: descriptor.initializer ? descriptor.initializer.call(context) : void 0 }); }
  function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }
  function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; _setPrototypeOf(subClass, superClass); }
  function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }
  function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) { var desc = {}; Object.keys(descriptor).forEach(function (key) { desc[key] = descriptor[key]; }); desc.enumerable = !!desc.enumerable; desc.configurable = !!desc.configurable; if ('value' in desc || desc.initializer) { desc.writable = true; } desc = decorators.slice().reverse().reduce(function (desc, decorator) { return decorator(target, property, desc) || desc; }, desc); if (context && desc.initializer !== void 0) { desc.value = desc.initializer ? desc.initializer.call(context) : void 0; desc.initializer = undefined; } if (desc.initializer === void 0) { Object.defineProperty(target, property, desc); desc = null; } return desc; }
  function _initializerWarningHelper(descriptor, context) { throw new Error('Decorating class property failed. Please ensure that ' + 'proposal-class-properties is enabled and runs after the decorators transform.'); }
  /**
   * Returns first visible control in FieldWrapper.
   *
   * @param oControl FieldWrapper
   * @returns The first visible control
   */
  function getControlInFieldWrapper(oControl) {
    if (oControl.isA("sap.fe.core.controls.FieldWrapper")) {
      var oFieldWrapper = oControl;
      var aControls = oFieldWrapper.getEditMode() === "Display" ? [oFieldWrapper.getContentDisplay()] : oFieldWrapper.getContentEdit();
      if (aControls.length >= 1) {
        return aControls.length ? aControls[0] : undefined;
      }
    } else {
      return oControl;
    }
  }

  /**
   * Building block for creating a field based on the metadata provided by OData V4.
   * <br>
   * Usually, a DataField or DataPoint annotation is expected, but the field can also be used to display a property from the entity type.
   *
   *
   * Usage example:
   * <pre>
   * &lt;macro:Field id="MyField" metaPath="MyProperty" /&gt;
   * </pre>
   *
   * @alias sap.fe.macros.Field
   * @public
   */
  var FieldAPI = (_dec = defineUI5Class("sap.fe.macros.field.FieldAPI"), _dec2 = property({
    type: "boolean"
  }), _dec3 = property({
    type: "boolean"
  }), _dec4 = property({
    type: "string"
  }), _dec5 = property({
    type: "string",
    expectedAnnotations: [],
    expectedTypes: ["EntitySet", "EntityType", "Singleton", "NavigationProperty", "Property"]
  }), _dec6 = event(), _dec7 = association({
    type: "sap.ui.core.Control",
    multiple: true,
    singularName: "ariaLabelledBy"
  }), _dec8 = property({
    type: "boolean"
  }), _dec9 = property({
    type: "sap.fe.macros.FieldFormatOptions"
  }), _dec10 = property({
    type: "string"
  }), _dec11 = property({
    type: "boolean"
  }), _dec12 = xmlEventHandler(), _dec(_class = (_class2 = /*#__PURE__*/function (_MacroAPI) {
    _inheritsLoose(FieldAPI, _MacroAPI);
    function FieldAPI() {
      var _this;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      _this = _MacroAPI.call.apply(_MacroAPI, [this].concat(args)) || this;
      _initializerDefineProperty(_this, "editable", _descriptor, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "readOnly", _descriptor2, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "id", _descriptor3, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "metaPath", _descriptor4, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "change", _descriptor5, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "ariaLabelledBy", _descriptor6, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "required", _descriptor7, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "formatOptions", _descriptor8, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "semanticObject", _descriptor9, _assertThisInitialized(_this));
      _initializerDefineProperty(_this, "collaborationEnabled", _descriptor10, _assertThisInitialized(_this));
      return _this;
    }
    var _proto = FieldAPI.prototype;
    _proto.handleChange = function handleChange(oEvent) {
      this.fireChange({
        value: this.getValue(),
        isValid: oEvent.getParameter("valid")
      });
    };
    _proto.onBeforeRendering = function onBeforeRendering() {
      var oContent = this.getContent();
      if (oContent && oContent.addAriaLabelledBy) {
        var aAriaLabelledBy = this.getAriaLabelledBy();
        for (var i = 0; i < aAriaLabelledBy.length; i++) {
          var sId = aAriaLabelledBy[i];
          var aAriaLabelledBys = oContent.getAriaLabelledBy() || [];
          if (aAriaLabelledBys.indexOf(sId) === -1) {
            oContent.addAriaLabelledBy(sId);
          }
        }
      }
    };
    _proto.enhanceAccessibilityState = function enhanceAccessibilityState(_oElement, mAriaProps) {
      var oParent = this.getParent();
      if (oParent && oParent.enhanceAccessibilityState) {
        // use FieldWrapper as control, but aria properties of rendered inner control.
        oParent.enhanceAccessibilityState(this, mAriaProps);
      }
      return mAriaProps;
    };
    _proto.getAccessibilityInfo = function getAccessibilityInfo() {
      var oContent = this.content;
      return oContent && oContent.getAccessibilityInfo ? oContent.getAccessibilityInfo() : {};
    }
    /**
     * Returns the DOMNode ID to be used for the "labelFor" attribute.
     *
     * We forward the call of this method to the content control.
     *
     * @returns ID to be used for the <code>labelFor</code>
     */;
    _proto.getIdForLabel = function getIdForLabel() {
      var oContent = this.content;
      return oContent.getIdForLabel();
    }
    /**
     * Retrieves the current value of the field.
     *
     * @public
     * @returns The current value of the field
     */;
    _proto.getValue = function getValue() {
      var _oControl, _oControl2, _oControl3, _oControl4;
      var oControl = getControlInFieldWrapper(this.content);
      if (this.collaborationEnabled && (_oControl = oControl) !== null && _oControl !== void 0 && _oControl.isA("sap.m.HBox")) {
        oControl = oControl.getItems()[0];
      }
      if ((_oControl2 = oControl) !== null && _oControl2 !== void 0 && _oControl2.isA("sap.m.CheckBox")) {
        return oControl.getSelected();
      } else if ((_oControl3 = oControl) !== null && _oControl3 !== void 0 && _oControl3.isA("sap.m.InputBase")) {
        return oControl.getValue();
      } else if ((_oControl4 = oControl) !== null && _oControl4 !== void 0 && _oControl4.isA("sap.ui.mdc.Field")) {
        return oControl.getValue(); // FieldWrapper
      } else {
        throw "getting value not yet implemented for this field type";
      }
    }

    /**
     * Adds a message to the field.
     *
     * @param [parameters] The parameters to create message
     * @param parameters.type Type of the message
     * @param parameters.message Message text
     * @param parameters.description Message description
     * @param parameters.persistent True if the message is persistent
     * @returns The id of the message
     * @public
     */;
    _proto.addMessage = function addMessage(parameters) {
      var msgManager = this.getMessageManager();
      var oControl = getControlInFieldWrapper(this.content);
      var path; //target for oMessage
      if (oControl !== null && oControl !== void 0 && oControl.isA("sap.m.CheckBox")) {
        path = oControl.getBinding("selected").getResolvedPath();
      } else if (oControl !== null && oControl !== void 0 && oControl.isA("sap.m.InputBase")) {
        path = oControl.getBinding("value").getResolvedPath();
      } else if (oControl !== null && oControl !== void 0 && oControl.isA("sap.ui.mdc.Field")) {
        path = oControl.getBinding("value").getResolvedPath();
      }
      var oMessage = new Message({
        target: path,
        type: parameters.type,
        message: parameters.message,
        processor: oControl === null || oControl === void 0 ? void 0 : oControl.getModel(),
        description: parameters.description,
        persistent: parameters.persistent
      });
      msgManager.addMessages(oMessage);
      return oMessage.getId();
    }

    /**
     * Removes a message from the field.
     *
     * @param id The id of the message
     * @public
     */;
    _proto.removeMessage = function removeMessage(id) {
      var msgManager = this.getMessageManager();
      var arr = msgManager.getMessageModel().getData();
      var result = arr.find(function (e) {
        return e.id === id;
      });
      if (result) {
        msgManager.removeMessages(result);
      }
    };
    _proto.getMessageManager = function getMessageManager() {
      return sap.ui.getCore().getMessageManager();
    };
    return FieldAPI;
  }(MacroAPI), (_descriptor = _applyDecoratedDescriptor(_class2.prototype, "editable", [_dec2], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor2 = _applyDecoratedDescriptor(_class2.prototype, "readOnly", [_dec3], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor3 = _applyDecoratedDescriptor(_class2.prototype, "id", [_dec4], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor4 = _applyDecoratedDescriptor(_class2.prototype, "metaPath", [_dec5], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor5 = _applyDecoratedDescriptor(_class2.prototype, "change", [_dec6], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor6 = _applyDecoratedDescriptor(_class2.prototype, "ariaLabelledBy", [_dec7], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor7 = _applyDecoratedDescriptor(_class2.prototype, "required", [_dec8], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor8 = _applyDecoratedDescriptor(_class2.prototype, "formatOptions", [_dec9], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor9 = _applyDecoratedDescriptor(_class2.prototype, "semanticObject", [_dec10], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _descriptor10 = _applyDecoratedDescriptor(_class2.prototype, "collaborationEnabled", [_dec11], {
    configurable: true,
    enumerable: true,
    writable: true,
    initializer: null
  }), _applyDecoratedDescriptor(_class2.prototype, "handleChange", [_dec12], Object.getOwnPropertyDescriptor(_class2.prototype, "handleChange"), _class2.prototype)), _class2)) || _class);
  return FieldAPI;
}, false);
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJnZXRDb250cm9sSW5GaWVsZFdyYXBwZXIiLCJvQ29udHJvbCIsImlzQSIsIm9GaWVsZFdyYXBwZXIiLCJhQ29udHJvbHMiLCJnZXRFZGl0TW9kZSIsImdldENvbnRlbnREaXNwbGF5IiwiZ2V0Q29udGVudEVkaXQiLCJsZW5ndGgiLCJ1bmRlZmluZWQiLCJGaWVsZEFQSSIsImRlZmluZVVJNUNsYXNzIiwicHJvcGVydHkiLCJ0eXBlIiwiZXhwZWN0ZWRBbm5vdGF0aW9ucyIsImV4cGVjdGVkVHlwZXMiLCJldmVudCIsImFzc29jaWF0aW9uIiwibXVsdGlwbGUiLCJzaW5ndWxhck5hbWUiLCJ4bWxFdmVudEhhbmRsZXIiLCJoYW5kbGVDaGFuZ2UiLCJvRXZlbnQiLCJmaXJlQ2hhbmdlIiwidmFsdWUiLCJnZXRWYWx1ZSIsImlzVmFsaWQiLCJnZXRQYXJhbWV0ZXIiLCJvbkJlZm9yZVJlbmRlcmluZyIsIm9Db250ZW50IiwiZ2V0Q29udGVudCIsImFkZEFyaWFMYWJlbGxlZEJ5IiwiYUFyaWFMYWJlbGxlZEJ5IiwiZ2V0QXJpYUxhYmVsbGVkQnkiLCJpIiwic0lkIiwiYUFyaWFMYWJlbGxlZEJ5cyIsImluZGV4T2YiLCJlbmhhbmNlQWNjZXNzaWJpbGl0eVN0YXRlIiwiX29FbGVtZW50IiwibUFyaWFQcm9wcyIsIm9QYXJlbnQiLCJnZXRQYXJlbnQiLCJnZXRBY2Nlc3NpYmlsaXR5SW5mbyIsImNvbnRlbnQiLCJnZXRJZEZvckxhYmVsIiwiY29sbGFib3JhdGlvbkVuYWJsZWQiLCJnZXRJdGVtcyIsImdldFNlbGVjdGVkIiwiYWRkTWVzc2FnZSIsInBhcmFtZXRlcnMiLCJtc2dNYW5hZ2VyIiwiZ2V0TWVzc2FnZU1hbmFnZXIiLCJwYXRoIiwiZ2V0QmluZGluZyIsImdldFJlc29sdmVkUGF0aCIsIm9NZXNzYWdlIiwiTWVzc2FnZSIsInRhcmdldCIsIm1lc3NhZ2UiLCJwcm9jZXNzb3IiLCJnZXRNb2RlbCIsImRlc2NyaXB0aW9uIiwicGVyc2lzdGVudCIsImFkZE1lc3NhZ2VzIiwiZ2V0SWQiLCJyZW1vdmVNZXNzYWdlIiwiaWQiLCJhcnIiLCJnZXRNZXNzYWdlTW9kZWwiLCJnZXREYXRhIiwicmVzdWx0IiwiZmluZCIsImUiLCJyZW1vdmVNZXNzYWdlcyIsInNhcCIsInVpIiwiZ2V0Q29yZSIsIk1hY3JvQVBJIl0sInNvdXJjZVJvb3QiOiIuIiwic291cmNlcyI6WyJGaWVsZEFQSS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgdHlwZSBGaWVsZFdyYXBwZXIgZnJvbSBcInNhcC9mZS9jb3JlL2NvbnRyb2xzL0ZpZWxkV3JhcHBlclwiO1xuaW1wb3J0IHR5cGUgeyBFbmhhbmNlV2l0aFVJNSB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHsgYXNzb2NpYXRpb24sIGRlZmluZVVJNUNsYXNzLCBldmVudCwgcHJvcGVydHksIHhtbEV2ZW50SGFuZGxlciB9IGZyb20gXCJzYXAvZmUvY29yZS9oZWxwZXJzL0NsYXNzU3VwcG9ydFwiO1xuaW1wb3J0IHR5cGUgQ2hlY2tCb3ggZnJvbSBcInNhcC9tL0NoZWNrQm94XCI7XG5pbXBvcnQgdHlwZSBIQm94IGZyb20gXCJzYXAvbS9IQm94XCI7XG5pbXBvcnQgdHlwZSBJbnB1dEJhc2UgZnJvbSBcInNhcC9tL0lucHV0QmFzZVwiO1xuaW1wb3J0IHR5cGUgVUk1RXZlbnQgZnJvbSBcInNhcC91aS9iYXNlL0V2ZW50XCI7XG5pbXBvcnQgdHlwZSBDb250cm9sIGZyb20gXCJzYXAvdWkvY29yZS9Db250cm9sXCI7XG5pbXBvcnQgdHlwZSB7IE1lc3NhZ2VUeXBlIH0gZnJvbSBcInNhcC91aS9jb3JlL2xpYnJhcnlcIjtcbmltcG9ydCBNZXNzYWdlIGZyb20gXCJzYXAvdWkvY29yZS9tZXNzYWdlL01lc3NhZ2VcIjtcbmltcG9ydCBNYWNyb0FQSSBmcm9tIFwiLi4vTWFjcm9BUElcIjtcblxuLyoqXG4gKiBBZGRpdGlvbmFsIGZvcm1hdCBvcHRpb25zIGZvciB0aGUgZmllbGQuXG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuRmllbGRGb3JtYXRPcHRpb25zXG4gKiBAcHVibGljXG4gKi9cbmV4cG9ydCB0eXBlIEZpZWxkRm9ybWF0T3B0aW9ucyA9IHtcblx0LyoqXG5cdCAqICBEZWZpbmVzIGhvdyB0aGUgZmllbGQgdmFsdWUgYW5kIGFzc29jaWF0ZWQgdGV4dCB3aWxsIGJlIGRpc3BsYXllZCB0b2dldGhlci48YnIvPlxuXHQgKlxuXHQgKiAgQWxsb3dlZCB2YWx1ZXMgYXJlIFwiVmFsdWVcIiwgXCJEZXNjcmlwdGlvblwiLCBcIlZhbHVlRGVzY3JpcHRpb25cIiBhbmQgXCJEZXNjcmlwdGlvblZhbHVlXCJcblx0ICpcblx0ICogIEBwdWJsaWNcblx0ICovXG5cdGRpc3BsYXlNb2RlOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIGlmIGFuZCBob3cgdGhlIGZpZWxkIG1lYXN1cmUgd2lsbCBiZSBkaXNwbGF5ZWQuPGJyLz5cblx0ICpcblx0ICogQWxsb3dlZCB2YWx1ZXMgYXJlIFwiSGlkZGVuXCIgYW5kIFwiUmVhZE9ubHlcIlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0bWVhc3VyZURpc3BsYXlNb2RlOiBzdHJpbmc7XG5cdC8qKlxuXHQgKiBNYXhpbXVtIG51bWJlciBvZiBsaW5lcyBmb3IgbXVsdGlsaW5lIHRleHRzIGluIGVkaXQgbW9kZS48YnIvPlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0dGV4dExpbmVzRWRpdDogbnVtYmVyO1xuXHQvKipcblx0ICogTWF4aW11bSBudW1iZXIgb2YgbGluZXMgdGhhdCBtdWx0aWxpbmUgdGV4dHMgaW4gZWRpdCBtb2RlIGNhbiBncm93IHRvLjxici8+XG5cdCAqXG5cdCAqICBAcHVibGljXG5cdCAqL1xuXHR0ZXh0TWF4TGluZXM6IG51bWJlcjtcblx0LyoqXG5cdCAqIE1heGltdW0gbnVtYmVyIG9mIGNoYXJhY3RlcnMgZnJvbSB0aGUgYmVnaW5uaW5nIG9mIHRoZSB0ZXh0IGZpZWxkIHRoYXQgYXJlIHNob3duIGluaXRpYWxseS48YnIvPlxuXHQgKlxuXHQgKiAgQHB1YmxpY1xuXHQgKi9cblx0dGV4dE1heENoYXJhY3RlcnNEaXNwbGF5OiBudW1iZXI7XG5cdC8qKlxuXHQgKiBEZWZpbmVzIGhvdyB0aGUgZnVsbCB0ZXh0IHdpbGwgYmUgZGlzcGxheWVkLjxici8+XG5cdCAqXG5cdCAqIEFsbG93ZWQgdmFsdWVzIGFyZSBcIkluUGxhY2VcIiBhbmQgXCJQb3BvdmVyXCJcblx0ICpcblx0ICogIEBwdWJsaWNcblx0ICovXG5cdHRleHRFeHBhbmRCZWhhdmlvckRpc3BsYXk6IHN0cmluZztcbn07XG5cbi8qKlxuICogUmV0dXJucyBmaXJzdCB2aXNpYmxlIGNvbnRyb2wgaW4gRmllbGRXcmFwcGVyLlxuICpcbiAqIEBwYXJhbSBvQ29udHJvbCBGaWVsZFdyYXBwZXJcbiAqIEByZXR1cm5zIFRoZSBmaXJzdCB2aXNpYmxlIGNvbnRyb2xcbiAqL1xuZnVuY3Rpb24gZ2V0Q29udHJvbEluRmllbGRXcmFwcGVyKG9Db250cm9sOiBDb250cm9sKTogQ29udHJvbCB8IHVuZGVmaW5lZCB7XG5cdGlmIChvQ29udHJvbC5pc0EoXCJzYXAuZmUuY29yZS5jb250cm9scy5GaWVsZFdyYXBwZXJcIikpIHtcblx0XHRjb25zdCBvRmllbGRXcmFwcGVyID0gb0NvbnRyb2wgYXMgRW5oYW5jZVdpdGhVSTU8RmllbGRXcmFwcGVyPjtcblx0XHRjb25zdCBhQ29udHJvbHMgPSBvRmllbGRXcmFwcGVyLmdldEVkaXRNb2RlKCkgPT09IFwiRGlzcGxheVwiID8gW29GaWVsZFdyYXBwZXIuZ2V0Q29udGVudERpc3BsYXkoKV0gOiBvRmllbGRXcmFwcGVyLmdldENvbnRlbnRFZGl0KCk7XG5cdFx0aWYgKGFDb250cm9scy5sZW5ndGggPj0gMSkge1xuXHRcdFx0cmV0dXJuIGFDb250cm9scy5sZW5ndGggPyBhQ29udHJvbHNbMF0gOiB1bmRlZmluZWQ7XG5cdFx0fVxuXHR9IGVsc2Uge1xuXHRcdHJldHVybiBvQ29udHJvbDtcblx0fVxufVxuXG4vKipcbiAqIEJ1aWxkaW5nIGJsb2NrIGZvciBjcmVhdGluZyBhIGZpZWxkIGJhc2VkIG9uIHRoZSBtZXRhZGF0YSBwcm92aWRlZCBieSBPRGF0YSBWNC5cbiAqIDxicj5cbiAqIFVzdWFsbHksIGEgRGF0YUZpZWxkIG9yIERhdGFQb2ludCBhbm5vdGF0aW9uIGlzIGV4cGVjdGVkLCBidXQgdGhlIGZpZWxkIGNhbiBhbHNvIGJlIHVzZWQgdG8gZGlzcGxheSBhIHByb3BlcnR5IGZyb20gdGhlIGVudGl0eSB0eXBlLlxuICpcbiAqXG4gKiBVc2FnZSBleGFtcGxlOlxuICogPHByZT5cbiAqICZsdDttYWNybzpGaWVsZCBpZD1cIk15RmllbGRcIiBtZXRhUGF0aD1cIk15UHJvcGVydHlcIiAvJmd0O1xuICogPC9wcmU+XG4gKlxuICogQGFsaWFzIHNhcC5mZS5tYWNyb3MuRmllbGRcbiAqIEBwdWJsaWNcbiAqL1xuQGRlZmluZVVJNUNsYXNzKFwic2FwLmZlLm1hY3Jvcy5maWVsZC5GaWVsZEFQSVwiKVxuY2xhc3MgRmllbGRBUEkgZXh0ZW5kcyBNYWNyb0FQSSB7XG5cdC8qKlxuXHQgKiBBbiBleHByZXNzaW9uIHRoYXQgYWxsb3dzIHlvdSB0byBjb250cm9sIHRoZSBlZGl0YWJsZSBzdGF0ZSBvZiB0aGUgZmllbGQuXG5cdCAqXG5cdCAqIElmIHlvdSBkbyBub3Qgc2V0IGFueSBleHByZXNzaW9uLCBTQVAgRmlvcmkgZWxlbWVudHMgaG9va3MgaW50byB0aGUgc3RhbmRhcmQgbGlmZWN5Y2xlIHRvIGRldGVybWluZSBpZiB0aGUgcGFnZSBpcyBjdXJyZW50bHkgZWRpdGFibGUuXG5cdCAqIFBsZWFzZSBub3RlIHRoYXQgeW91IGNhbm5vdCBzZXQgYSBmaWVsZCB0byBlZGl0YWJsZSBpZiBpdCBoYXMgYmVlbiBkZWZpbmVkIGluIHRoZSBhbm5vdGF0aW9uIGFzIG5vdCBlZGl0YWJsZS5cblx0ICpcblx0ICogQHByaXZhdGVcblx0ICogQGRlcHJlY2F0ZWRcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwiYm9vbGVhblwiIH0pXG5cdGVkaXRhYmxlITogYm9vbGVhbjtcblxuXHQvKipcblx0ICogQW4gZXhwcmVzc2lvbiB0aGF0IGFsbG93cyB5b3UgdG8gY29udHJvbCB0aGUgcmVhZC1vbmx5IHN0YXRlIG9mIHRoZSBmaWVsZC5cblx0ICpcblx0ICogSWYgeW91IGRvIG5vdCBzZXQgYW55IGV4cHJlc3Npb24sIFNBUCBGaW9yaSBlbGVtZW50cyBob29rcyBpbnRvIHRoZSBzdGFuZGFyZCBsaWZlY3ljbGUgdG8gZGV0ZXJtaW5lIHRoZSBjdXJyZW50IHN0YXRlLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcImJvb2xlYW5cIiB9KVxuXHRyZWFkT25seSE6IGJvb2xlYW47XG5cblx0LyoqXG5cdCAqIFRoZSBpZGVudGlmaWVyIG9mIHRoZSBGaWVsZCBjb250cm9sLlxuXHQgKlxuXHQgKiBAcHVibGljXG5cdCAqL1xuXHRAcHJvcGVydHkoeyB0eXBlOiBcInN0cmluZ1wiIH0pXG5cdGlkITogc3RyaW5nO1xuXG5cdC8qKlxuXHQgKiBEZWZpbmVzIHRoZSByZWxhdGl2ZSBwYXRoIG9mIHRoZSBwcm9wZXJ0eSBpbiB0aGUgbWV0YW1vZGVsLCBiYXNlZCBvbiB0aGUgY3VycmVudCBjb250ZXh0UGF0aC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QHByb3BlcnR5KHtcblx0XHR0eXBlOiBcInN0cmluZ1wiLFxuXHRcdGV4cGVjdGVkQW5ub3RhdGlvbnM6IFtdLFxuXHRcdGV4cGVjdGVkVHlwZXM6IFtcIkVudGl0eVNldFwiLCBcIkVudGl0eVR5cGVcIiwgXCJTaW5nbGV0b25cIiwgXCJOYXZpZ2F0aW9uUHJvcGVydHlcIiwgXCJQcm9wZXJ0eVwiXVxuXHR9KVxuXHRtZXRhUGF0aCE6IHN0cmluZztcblxuXHQvKipcblx0ICogQW4gZXZlbnQgY29udGFpbmluZyBkZXRhaWxzIGlzIHRyaWdnZXJlZCB3aGVuIHRoZSB2YWx1ZSBvZiB0aGUgZmllbGQgaXMgY2hhbmdlZC5cblx0ICpcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0QGV2ZW50KClcblx0Y2hhbmdlITogRnVuY3Rpb247XG5cblx0QGFzc29jaWF0aW9uKHsgdHlwZTogXCJzYXAudWkuY29yZS5Db250cm9sXCIsIG11bHRpcGxlOiB0cnVlLCBzaW5ndWxhck5hbWU6IFwiYXJpYUxhYmVsbGVkQnlcIiB9KVxuXHRhcmlhTGFiZWxsZWRCeSE6IENvbnRyb2w7XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0cmVxdWlyZWQhOiBib29sZWFuO1xuXG5cdC8qKlxuXHQgKiBBIHNldCBvZiBvcHRpb25zIHRoYXQgY2FuIGJlIGNvbmZpZ3VyZWQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic2FwLmZlLm1hY3Jvcy5GaWVsZEZvcm1hdE9wdGlvbnNcIiB9KVxuXHRmb3JtYXRPcHRpb25zITogRmllbGRGb3JtYXRPcHRpb25zO1xuXG5cdC8qKlxuXHQgKiBPcHRpb24gdG8gYWRkIHNlbWFudGljIG9iamVjdHMgdG8gYSBmaWVsZC5cblx0ICogVmFsaWQgb3B0aW9ucyBhcmUgZWl0aGVyIGEgc2luZ2xlIHNlbWFudGljIG9iamVjdCwgYSBzdHJpbmdpZmllZCBhcnJheSBvZiBzZW1hbnRpYyBvYmplY3RzXG5cdCAqIG9yIGEgc2luZ2xlIGJpbmRpbmcgZXhwcmVzc2lvbiByZXR1cm5pbmcgZWl0aGVyIGEgc2luZ2xlIHNlbWFudGljIG9iamVjdCBvciBhbiBhcnJheSBvZiBzZW1hbnRpYyBvYmplY3RzXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdEBwcm9wZXJ0eSh7IHR5cGU6IFwic3RyaW5nXCIgfSlcblx0c2VtYW50aWNPYmplY3QhOiBzdHJpbmc7XG5cblx0QHByb3BlcnR5KHsgdHlwZTogXCJib29sZWFuXCIgfSlcblx0Y29sbGFib3JhdGlvbkVuYWJsZWQhOiBib29sZWFuO1xuXG5cdEB4bWxFdmVudEhhbmRsZXIoKVxuXHRoYW5kbGVDaGFuZ2Uob0V2ZW50OiBVSTVFdmVudCkge1xuXHRcdCh0aGlzIGFzIGFueSkuZmlyZUNoYW5nZSh7IHZhbHVlOiB0aGlzLmdldFZhbHVlKCksIGlzVmFsaWQ6IG9FdmVudC5nZXRQYXJhbWV0ZXIoXCJ2YWxpZFwiKSB9KTtcblx0fVxuXG5cdG9uQmVmb3JlUmVuZGVyaW5nKCkge1xuXHRcdGNvbnN0IG9Db250ZW50ID0gKHRoaXMgYXMgYW55KS5nZXRDb250ZW50KCk7XG5cdFx0aWYgKG9Db250ZW50ICYmIG9Db250ZW50LmFkZEFyaWFMYWJlbGxlZEJ5KSB7XG5cdFx0XHRjb25zdCBhQXJpYUxhYmVsbGVkQnkgPSAodGhpcyBhcyBhbnkpLmdldEFyaWFMYWJlbGxlZEJ5KCk7XG5cblx0XHRcdGZvciAobGV0IGkgPSAwOyBpIDwgYUFyaWFMYWJlbGxlZEJ5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGNvbnN0IHNJZCA9IGFBcmlhTGFiZWxsZWRCeVtpXTtcblx0XHRcdFx0Y29uc3QgYUFyaWFMYWJlbGxlZEJ5cyA9IG9Db250ZW50LmdldEFyaWFMYWJlbGxlZEJ5KCkgfHwgW107XG5cdFx0XHRcdGlmIChhQXJpYUxhYmVsbGVkQnlzLmluZGV4T2Yoc0lkKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRvQ29udGVudC5hZGRBcmlhTGFiZWxsZWRCeShzSWQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0ZW5oYW5jZUFjY2Vzc2liaWxpdHlTdGF0ZShfb0VsZW1lbnQ6IG9iamVjdCwgbUFyaWFQcm9wczogb2JqZWN0KTogb2JqZWN0IHtcblx0XHRjb25zdCBvUGFyZW50ID0gdGhpcy5nZXRQYXJlbnQoKTtcblxuXHRcdGlmIChvUGFyZW50ICYmIChvUGFyZW50IGFzIGFueSkuZW5oYW5jZUFjY2Vzc2liaWxpdHlTdGF0ZSkge1xuXHRcdFx0Ly8gdXNlIEZpZWxkV3JhcHBlciBhcyBjb250cm9sLCBidXQgYXJpYSBwcm9wZXJ0aWVzIG9mIHJlbmRlcmVkIGlubmVyIGNvbnRyb2wuXG5cdFx0XHQob1BhcmVudCBhcyBhbnkpLmVuaGFuY2VBY2Nlc3NpYmlsaXR5U3RhdGUodGhpcywgbUFyaWFQcm9wcyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG1BcmlhUHJvcHM7XG5cdH1cblx0Z2V0QWNjZXNzaWJpbGl0eUluZm8oKTogT2JqZWN0IHtcblx0XHRjb25zdCBvQ29udGVudCA9IHRoaXMuY29udGVudDtcblx0XHRyZXR1cm4gb0NvbnRlbnQgJiYgb0NvbnRlbnQuZ2V0QWNjZXNzaWJpbGl0eUluZm8gPyBvQ29udGVudC5nZXRBY2Nlc3NpYmlsaXR5SW5mbygpIDoge307XG5cdH1cblx0LyoqXG5cdCAqIFJldHVybnMgdGhlIERPTU5vZGUgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIFwibGFiZWxGb3JcIiBhdHRyaWJ1dGUuXG5cdCAqXG5cdCAqIFdlIGZvcndhcmQgdGhlIGNhbGwgb2YgdGhpcyBtZXRob2QgdG8gdGhlIGNvbnRlbnQgY29udHJvbC5cblx0ICpcblx0ICogQHJldHVybnMgSUQgdG8gYmUgdXNlZCBmb3IgdGhlIDxjb2RlPmxhYmVsRm9yPC9jb2RlPlxuXHQgKi9cblx0Z2V0SWRGb3JMYWJlbCgpOiBzdHJpbmcge1xuXHRcdGNvbnN0IG9Db250ZW50ID0gdGhpcy5jb250ZW50O1xuXHRcdHJldHVybiBvQ29udGVudC5nZXRJZEZvckxhYmVsKCk7XG5cdH1cblx0LyoqXG5cdCAqIFJldHJpZXZlcyB0aGUgY3VycmVudCB2YWx1ZSBvZiB0aGUgZmllbGQuXG5cdCAqXG5cdCAqIEBwdWJsaWNcblx0ICogQHJldHVybnMgVGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGZpZWxkXG5cdCAqL1xuXHRnZXRWYWx1ZSgpOiBib29sZWFuIHwgc3RyaW5nIHtcblx0XHRsZXQgb0NvbnRyb2wgPSBnZXRDb250cm9sSW5GaWVsZFdyYXBwZXIodGhpcy5jb250ZW50KTtcblx0XHRpZiAodGhpcy5jb2xsYWJvcmF0aW9uRW5hYmxlZCAmJiBvQ29udHJvbD8uaXNBKFwic2FwLm0uSEJveFwiKSkge1xuXHRcdFx0b0NvbnRyb2wgPSAob0NvbnRyb2wgYXMgSEJveCkuZ2V0SXRlbXMoKVswXTtcblx0XHR9XG5cdFx0aWYgKG9Db250cm9sPy5pc0EoXCJzYXAubS5DaGVja0JveFwiKSkge1xuXHRcdFx0cmV0dXJuIChvQ29udHJvbCBhcyBDaGVja0JveCkuZ2V0U2VsZWN0ZWQoKTtcblx0XHR9IGVsc2UgaWYgKG9Db250cm9sPy5pc0EoXCJzYXAubS5JbnB1dEJhc2VcIikpIHtcblx0XHRcdHJldHVybiAob0NvbnRyb2wgYXMgSW5wdXRCYXNlKS5nZXRWYWx1ZSgpO1xuXHRcdH0gZWxzZSBpZiAob0NvbnRyb2w/LmlzQShcInNhcC51aS5tZGMuRmllbGRcIikpIHtcblx0XHRcdHJldHVybiAob0NvbnRyb2wgYXMgYW55KS5nZXRWYWx1ZSgpOyAvLyBGaWVsZFdyYXBwZXJcblx0XHR9IGVsc2Uge1xuXHRcdFx0dGhyb3cgXCJnZXR0aW5nIHZhbHVlIG5vdCB5ZXQgaW1wbGVtZW50ZWQgZm9yIHRoaXMgZmllbGQgdHlwZVwiO1xuXHRcdH1cblx0fVxuXG5cdC8qKlxuXHQgKiBBZGRzIGEgbWVzc2FnZSB0byB0aGUgZmllbGQuXG5cdCAqXG5cdCAqIEBwYXJhbSBbcGFyYW1ldGVyc10gVGhlIHBhcmFtZXRlcnMgdG8gY3JlYXRlIG1lc3NhZ2Vcblx0ICogQHBhcmFtIHBhcmFtZXRlcnMudHlwZSBUeXBlIG9mIHRoZSBtZXNzYWdlXG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzLm1lc3NhZ2UgTWVzc2FnZSB0ZXh0XG5cdCAqIEBwYXJhbSBwYXJhbWV0ZXJzLmRlc2NyaXB0aW9uIE1lc3NhZ2UgZGVzY3JpcHRpb25cblx0ICogQHBhcmFtIHBhcmFtZXRlcnMucGVyc2lzdGVudCBUcnVlIGlmIHRoZSBtZXNzYWdlIGlzIHBlcnNpc3RlbnRcblx0ICogQHJldHVybnMgVGhlIGlkIG9mIHRoZSBtZXNzYWdlXG5cdCAqIEBwdWJsaWNcblx0ICovXG5cdGFkZE1lc3NhZ2UocGFyYW1ldGVyczogeyB0eXBlPzogTWVzc2FnZVR5cGU7IG1lc3NhZ2U/OiBzdHJpbmc7IGRlc2NyaXB0aW9uPzogc3RyaW5nOyBwZXJzaXN0ZW50PzogYm9vbGVhbiB9KSB7XG5cdFx0Y29uc3QgbXNnTWFuYWdlciA9IHRoaXMuZ2V0TWVzc2FnZU1hbmFnZXIoKTtcblx0XHRjb25zdCBvQ29udHJvbCA9IGdldENvbnRyb2xJbkZpZWxkV3JhcHBlcih0aGlzLmNvbnRlbnQpO1xuXG5cdFx0bGV0IHBhdGg7IC8vdGFyZ2V0IGZvciBvTWVzc2FnZVxuXHRcdGlmIChvQ29udHJvbD8uaXNBKFwic2FwLm0uQ2hlY2tCb3hcIikpIHtcblx0XHRcdHBhdGggPSAob0NvbnRyb2wgYXMgQ2hlY2tCb3gpLmdldEJpbmRpbmcoXCJzZWxlY3RlZFwiKS5nZXRSZXNvbHZlZFBhdGgoKTtcblx0XHR9IGVsc2UgaWYgKG9Db250cm9sPy5pc0EoXCJzYXAubS5JbnB1dEJhc2VcIikpIHtcblx0XHRcdHBhdGggPSAob0NvbnRyb2wgYXMgSW5wdXRCYXNlKS5nZXRCaW5kaW5nKFwidmFsdWVcIikuZ2V0UmVzb2x2ZWRQYXRoKCk7XG5cdFx0fSBlbHNlIGlmIChvQ29udHJvbD8uaXNBKFwic2FwLnVpLm1kYy5GaWVsZFwiKSkge1xuXHRcdFx0cGF0aCA9IChvQ29udHJvbCBhcyBhbnkpLmdldEJpbmRpbmcoXCJ2YWx1ZVwiKS5nZXRSZXNvbHZlZFBhdGgoKTtcblx0XHR9XG5cblx0XHRjb25zdCBvTWVzc2FnZSA9IG5ldyBNZXNzYWdlKHtcblx0XHRcdHRhcmdldDogcGF0aCxcblx0XHRcdHR5cGU6IHBhcmFtZXRlcnMudHlwZSxcblx0XHRcdG1lc3NhZ2U6IHBhcmFtZXRlcnMubWVzc2FnZSxcblx0XHRcdHByb2Nlc3Nvcjogb0NvbnRyb2w/LmdldE1vZGVsKCksXG5cdFx0XHRkZXNjcmlwdGlvbjogcGFyYW1ldGVycy5kZXNjcmlwdGlvbixcblx0XHRcdHBlcnNpc3RlbnQ6IHBhcmFtZXRlcnMucGVyc2lzdGVudFxuXHRcdH0pO1xuXG5cdFx0bXNnTWFuYWdlci5hZGRNZXNzYWdlcyhvTWVzc2FnZSk7XG5cdFx0cmV0dXJuIG9NZXNzYWdlLmdldElkKCk7XG5cdH1cblxuXHQvKipcblx0ICogUmVtb3ZlcyBhIG1lc3NhZ2UgZnJvbSB0aGUgZmllbGQuXG5cdCAqXG5cdCAqIEBwYXJhbSBpZCBUaGUgaWQgb2YgdGhlIG1lc3NhZ2Vcblx0ICogQHB1YmxpY1xuXHQgKi9cblx0cmVtb3ZlTWVzc2FnZShpZDogc3RyaW5nKSB7XG5cdFx0Y29uc3QgbXNnTWFuYWdlciA9IHRoaXMuZ2V0TWVzc2FnZU1hbmFnZXIoKTtcblx0XHRjb25zdCBhcnIgPSBtc2dNYW5hZ2VyLmdldE1lc3NhZ2VNb2RlbCgpLmdldERhdGEoKTtcblx0XHRjb25zdCByZXN1bHQgPSBhcnIuZmluZCgoZTogYW55KSA9PiBlLmlkID09PSBpZCk7XG5cdFx0aWYgKHJlc3VsdCkge1xuXHRcdFx0bXNnTWFuYWdlci5yZW1vdmVNZXNzYWdlcyhyZXN1bHQpO1xuXHRcdH1cblx0fVxuXG5cdGdldE1lc3NhZ2VNYW5hZ2VyKCkge1xuXHRcdHJldHVybiBzYXAudWkuZ2V0Q29yZSgpLmdldE1lc3NhZ2VNYW5hZ2VyKCk7XG5cdH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRmllbGRBUEk7XG4iXSwibWFwcGluZ3MiOiI7QUFBQTtBQUFBO0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7RUErREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0VBQ0EsU0FBU0Esd0JBQXdCLENBQUNDLFFBQWlCLEVBQXVCO0lBQ3pFLElBQUlBLFFBQVEsQ0FBQ0MsR0FBRyxDQUFDLG1DQUFtQyxDQUFDLEVBQUU7TUFDdEQsSUFBTUMsYUFBYSxHQUFHRixRQUF3QztNQUM5RCxJQUFNRyxTQUFTLEdBQUdELGFBQWEsQ0FBQ0UsV0FBVyxFQUFFLEtBQUssU0FBUyxHQUFHLENBQUNGLGFBQWEsQ0FBQ0csaUJBQWlCLEVBQUUsQ0FBQyxHQUFHSCxhQUFhLENBQUNJLGNBQWMsRUFBRTtNQUNsSSxJ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