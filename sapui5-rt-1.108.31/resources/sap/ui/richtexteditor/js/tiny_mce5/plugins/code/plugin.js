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

    var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var setContent = function (editor, html) {
      editor.focus();
      editor.undoManager.transact(function () {
        editor.setContent(html);
      });
      editor.selection.setCursorLocation();
      editor.nodeChanged();
    };
    var getContent = function (editor) {
      return editor.getContent({ source_view: true });
    };

    var open = function (editor) {
      var editorContent = getContent(editor);
      editor.windowManager.open({
        title: 'Source Code',
        size: 'large',
        body: {
          type: 'panel',
          items: [{
              type: 'textarea',
              name: 'code'
            }]
        },
        buttons: [
          {
            type: 'cancel',
            name: 'cancel',
            text: 'Cancel'
          },
          {
            type: 'submit',
            name: 'save',
            text: 'Save',
            primary: true
          }
        ],
        initialData: { code: editorContent },
        onSubmit: function (api) {
          setContent(editor, api.getData().code);
          api.close();
        }
      });
    };

    var register$1 = function (editor) {
      editor.addCommand('mceCodeEditor', function () {
        open(editor);
      });
    };

    var register = function (editor) {
      var onAction = function () {
        return editor.execCommand('mceCodeEditor');
      };
      editor.ui.registry.addButton('code', {
        icon: 'sourcecode',
        tooltip: 'Source code',
        onAction: onAction
      });
      editor.ui.registry.addMenuItem('code', {
        icon: 'sourcecode',
        text: 'Source code',
        onAction: onAction
      });
    };

    function Plugin () {
      global.add('code', function (editor) {
        register$1(editor);
        register(editor);
        return {};
      });
    }

    Plugin();

}());
