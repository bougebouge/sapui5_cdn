/*!
 * TinyMCE
 *
 * Copyright (c) 2023 Ephox Corporation DBA Tiny Technologies, Inc.
 * Licensed under the Tiny commercial license. See https://www.tiny.cloud/legal/
 *
 * Version: 5.10.9
 */
(function () {
    'use strict';

    var global$2 = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var global$1 = tinymce.util.Tools.resolve('tinymce.dom.DOMUtils');

    var global = tinymce.util.Tools.resolve('tinymce.util.Tools');

    var enableWhenDirty = function (editor) {
      return editor.getParam('save_enablewhendirty', true);
    };
    var hasOnSaveCallback = function (editor) {
      return !!editor.getParam('save_onsavecallback');
    };
    var hasOnCancelCallback = function (editor) {
      return !!editor.getParam('save_oncancelcallback');
    };

    var displayErrorMessage = function (editor, message) {
      editor.notificationManager.open({
        text: message,
        type: 'error'
      });
    };
    var save = function (editor) {
      var formObj = global$1.DOM.getParent(editor.id, 'form');
      if (enableWhenDirty(editor) && !editor.isDirty()) {
        return;
      }
      editor.save();
      if (hasOnSaveCallback(editor)) {
        editor.execCallback('save_onsavecallback', editor);
        editor.nodeChanged();
        return;
      }
      if (formObj) {
        editor.setDirty(false);
        if (!formObj.onsubmit || formObj.onsubmit()) {
          if (typeof formObj.submit === 'function') {
            formObj.submit();
          } else {
            displayErrorMessage(editor, 'Error: Form submit field collision.');
          }
        }
        editor.nodeChanged();
      } else {
        displayErrorMessage(editor, 'Error: No form element found.');
      }
    };
    var cancel = function (editor) {
      var h = global.trim(editor.startContent);
      if (hasOnCancelCallback(editor)) {
        editor.execCallback('save_oncancelcallback', editor);
        return;
      }
      editor.resetContent(h);
    };

    var register$1 = function (editor) {
      editor.addCommand('mceSave', function () {
        save(editor);
      });
      editor.addCommand('mceCancel', function () {
        cancel(editor);
      });
    };

    var stateToggle = function (editor) {
      return function (api) {
        var handler = function () {
          api.setDisabled(enableWhenDirty(editor) && !editor.isDirty());
        };
        handler();
        editor.on('NodeChange dirty', handler);
        return function () {
          return editor.off('NodeChange dirty', handler);
        };
      };
    };
    var register = function (editor) {
      editor.ui.registry.addButton('save', {
        icon: 'save',
        tooltip: 'Save',
        disabled: true,
        onAction: function () {
          return editor.execCommand('mceSave');
        },
        onSetup: stateToggle(editor)
      });
      editor.ui.registry.addButton('cancel', {
        icon: 'cancel',
        tooltip: 'Cancel',
        disabled: true,
        onAction: function () {
          return editor.execCommand('mceCancel');
        },
        onSetup: stateToggle(editor)
      });
      editor.addShortcut('Meta+S', '', 'mceSave');
    };

    function Plugin () {
      global$2.add('save', function (editor) {
        register(editor);
        register$1(editor);
      });
    }

    Plugin();

}());
