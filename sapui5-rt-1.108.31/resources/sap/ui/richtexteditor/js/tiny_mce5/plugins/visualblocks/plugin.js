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

    var Cell = function (initial) {
      var value = initial;
      var get = function () {
        return value;
      };
      var set = function (v) {
        value = v;
      };
      return {
        get: get,
        set: set
      };
    };

    var global = tinymce.util.Tools.resolve('tinymce.PluginManager');

    var fireVisualBlocks = function (editor, state) {
      editor.fire('VisualBlocks', { state: state });
    };

    var toggleVisualBlocks = function (editor, pluginUrl, enabledState) {
      var dom = editor.dom;
      dom.toggleClass(editor.getBody(), 'mce-visualblocks');
      enabledState.set(!enabledState.get());
      fireVisualBlocks(editor, enabledState.get());
    };

    var register$1 = function (editor, pluginUrl, enabledState) {
      editor.addCommand('mceVisualBlocks', function () {
        toggleVisualBlocks(editor, pluginUrl, enabledState);
      });
    };

    var isEnabledByDefault = function (editor) {
      return editor.getParam('visualblocks_default_state', false, 'boolean');
    };

    var setup = function (editor, pluginUrl, enabledState) {
      editor.on('PreviewFormats AfterPreviewFormats', function (e) {
        if (enabledState.get()) {
          editor.dom.toggleClass(editor.getBody(), 'mce-visualblocks', e.type === 'afterpreviewformats');
        }
      });
      editor.on('init', function () {
        if (isEnabledByDefault(editor)) {
          toggleVisualBlocks(editor, pluginUrl, enabledState);
        }
      });
    };

    var toggleActiveState = function (editor, enabledState) {
      return function (api) {
        api.setActive(enabledState.get());
        var editorEventCallback = function (e) {
          return api.setActive(e.state);
        };
        editor.on('VisualBlocks', editorEventCallback);
        return function () {
          return editor.off('VisualBlocks', editorEventCallback);
        };
      };
    };
    var register = function (editor, enabledState) {
      var onAction = function () {
        return editor.execCommand('mceVisualBlocks');
      };
      editor.ui.registry.addToggleButton('visualblocks', {
        icon: 'visualblocks',
        tooltip: 'Show blocks',
        onAction: onAction,
        onSetup: toggleActiveState(editor, enabledState)
      });
      editor.ui.registry.addToggleMenuItem('visualblocks', {
        text: 'Show blocks',
        icon: 'visualblocks',
        onAction: onAction,
        onSetup: toggleActiveState(editor, enabledState)
      });
    };

    function Plugin () {
      global.add('visualblocks', function (editor, pluginUrl) {
        var enabledState = Cell(false);
        register$1(editor, pluginUrl, enabledState);
        register(editor, enabledState);
        setup(editor, pluginUrl, enabledState);
      });
    }

    Plugin();

}());
