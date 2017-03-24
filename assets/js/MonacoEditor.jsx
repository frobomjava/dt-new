define([
    'vs/editor/editor.main',
    'react'
], function(MonacoEditorMain, React) {
    class MonacoEditor extends React.Component {
       constructor(props) {
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
       }
    }

    return MonacoEditor;
});
