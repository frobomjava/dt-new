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
                console.log("<<<<<<ClickFileHandler in EditorArea402>>>>>>>");
                console.log("File id is " + data.fileId);
                console.log(JSON.stringify(app.fileInfoMap.get(parseInt(data.fileId))));
                self.setState({
                    fileId: data.fileId
                });
                self.forceUpdate();
            });
        }

        render() {

            if (this.state.fileId === null) {
                console.log("fileId is null ****Editor Area");
                return (<div key={this.state.fileId} />);
            }

            var fileName = app.fileInfoMap.get(parseInt(this.state.fileId));
            console.log(fileName);
            console.log(fileName.endsWith('.js'));
            if (fileName.endsWith('.js')) {
                return (
                    <div key={this.state.fileId}>
                        This is js file.<br /> Editor for js file has not been implemented yet.
                    </div>
                );
            }

            return (
                <div key={this.state.fileId}>
                    <DecisionTable fileId={this.state.fileId} />
                </div>
            );
        }
    }

    return EditorArea;

});