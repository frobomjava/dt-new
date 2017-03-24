define([
    'PubSub',
    'react',
    'app/DecisionTable'

], function (PubSub, React, DecisionTable) {

    class EditorArea extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                fileId: null
            };
        }

        componentDidMount() {
            var self = this;
            console.log("EditorArea ClickFileEvent handle");
            PubSub.subscribe('ClickFileEvent', function (msg, data) {
                console.log("<<<<<<ClickFileHandler in EditorArea>>>>>>>");
                self.setState({
                    fileId: data.fileId
                });
                self.forceUpdate();
            });
        }

        render() {
            if (this.state.fileId === null) {
                console.log("fileId is null ****Editor Area");
                return (<div key={this.state.fileId}/>);
            }

            return (
                <div key={this.state.fileId}>
                   <DecisionTable fileId={this.state.fileId}/>
                </div>
            );
        }
    }

    return EditorArea;

});