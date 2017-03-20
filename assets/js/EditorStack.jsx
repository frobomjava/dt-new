define([
    'react',
    'app/DecisionTable',
    'jquery',
    'jquery.ui',
    'bootstrap'
], function (React, DecisionTable, $) {
    class EditorStack extends React.Component {
        constructor(props) {
            super(props);
            this.state = {
                currentFileId: null,
                openedFiles: []
            };
        }

        render() {
            if (this.state.currentFileId === null) {
                return (
                    <div>
                    </div>
                );
            }
            fileData = app.fileDataMap.get(this.state.currentFileId);
            scrollData = app.scrollDataMap.get(this.state.currentFileId);
            if (fileData.extension === 'js') {
                return (
                    <div id={this.state.currentFileId}>
                        {fileData.data};</div>
                );
            }
            else if (fileData.extension === 'js') {
                return (
                    <div id={this.state.currentFileId} onScroll={this.handleScroll(this)} scrollTop={scrollData.scrollTop} scrollLeft={scrollData.scrollLeft}>
                        <DecisionTable fileId={this.state.currentFileId} />
                    </div>
                );
            }
        }

        componentDidMount() {

        }

        handleScroll(element) {
            scrollData = app.scrollDataMap.get(this.state.currentFileId);
            scrollData.scrollTop = element.scrollTop;
            scrollData.scrollLeft = element.scrollLeft;
        }

        handleFileClick() {

        }
    }

    return EditorStack;
});