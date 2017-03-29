define([
    'jquery',
    'PubSub'
], function ($, PubSub) {

    class EditorManager {

        constructor() {
            this.openedEditors = [];
            this.activeEditor = null;
        }

        init() {
            this.listenToFileClickEvent();
        }

        listenToFileClickEvent() {
            PubSub.subscribe("FileClickEvent", handleFileOpen);
        }

        handleFileOpen(msg, file) {
            var editor = findEditor(file);
            if (editor === activeEditor) {
                return;
            }

            if (editor) {
                editor.open();
                // sort editor array
                return;
            }
            switch (file.type) {
                case 'js':
                    editor = new MonacoEditor(file);
                    this.openedEditors.push(editor);
                    editor.open();
                    this.activeEditor = editor;
                    break;
                case 'dt':
                    editor = new DecisionTableEditor(file);
                    this.openedEditors.push(editor);
                    this.activeEditor = editor;
                    break;
                default:
                    // consider default editor
            }

        }


        handleFileClose(msg, file) {
            var editor = findEditor(file);
            // remove from the editor array
            editor.close(); //close or hide?
            if (editor === this.activeEditor) {
                // get latest opened editor from the array and open it
            }
        }


        findEditor(file) {
            // from openedEditors
        }

    }

    return EditorManager;
});