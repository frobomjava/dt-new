define([
    'vs/editor/editor.main',
    'jquery',
    'PubSub'
], function (MonacoEditorMain, $, PubSub) {
    class MonacoEditor {
        /*constructor(props) {
            super(props);
            this.state = {
              codeData: app.fileDataMap.get(props.fileId),
              fileId: props.fileId
            }
        };
 
        componentDidMount() {
          console.log("this.state.codeData " + JSON.stringify(this.state.codeData));
            var editor = monaco.editor.create(document.getElementById('monaco-editor'), {
             value: [this.state.codeData].join('\n'),
             language: 'javascript'
         });
        }
 
        render() {
            const divStyle = {
                width:'800px',
                height:'600px'
            };
            return(
                <div style={divStyle} id='monaco-editor'/>
            );
        }*/

        constructor(file) {
            this.model = file;
            thi.div = "monaco-editor";
            this.editorId = "monaco-editor";
            this.fileExtension = "js";
        }

        init() {
            // should be called only once;
            this.editor = monaco.editor.create(document.getElementById('monaco-editor'), {
                value: '',
                language: 'javascript'
            });
        }

        open() {
            // show this.div
            // update editor model
        }

        close() {

        }

        hide() {
            // hide this.div
        }

        dispose() {

        }
    }

    return MonacoEditor;
});
