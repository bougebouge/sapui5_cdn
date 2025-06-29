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

    var global$1 = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var global = tinymce.util.Tools.resolve('tinymce.Env');

    var register$1 = function (editor) {
      editor.addCommand('mcePrint', function () {
        if (global.browser.isIE()) {
          editor.getDoc().execCommand('print', false, null);
        } else {
          editor.getWin().print();
        }
      });
    };

    var register = function (editor) {
      var onAction = function () {
        return editor.execCommand('mcePrint');
      };
      editor.ui.registry.addButton('print', {
        icon: 'print',
        tooltip: 'Print',
        onAction: onAction
      });
      editor.ui.registry.addMenuItem('print', {
        text: 'Print...',
        icon: 'print',
        onAction: onAction
      });
    };

    function Plugin () {
      global$1.add('print', function (editor) {
        register$1(editor);
        register(editor);
        editor.addShortcut('Meta+P', '', 'mcePrint');
      });
    }

    Plugin();

}());
