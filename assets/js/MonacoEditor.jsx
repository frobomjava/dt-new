define([
    'vs/editor/editor.main',
    'react'
], function(MonacoEditorMain, React) {
    class MonacoEditor extends React.Component {
       constructor(props) {
           super(props);
       }

       componentDidMount() {
           var editor = monaco.editor.create(document.getElementById('monaco-editor'), {
			value: [
				'function x() {',
				'\tconsole.log("Hello world!");',
				'}'
			].join('\n'),
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