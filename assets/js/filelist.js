var FileList = React.createClass({
	componentWillMount: function() {
		var projectName = projectName;
		$.getJSON('/project/in/{projectName}/files', function (data) {
			console.log('ok, got data');
			console.log("data is = " + JSON.stringify(data));
			self.setState({
				projects: data
			});
		});

	},
	getInitialState: function(){
		return { files: [] }
	},
	updateFileList: function(file) {
		console.log('new file\'s name : ' + file.fileName);
		var updatedFiles = this.state.files.slice();
		updatedFiles.push(file);
		this.setState({
			files: updatedFiles
		});
	},
	handleClick: function(e) {
		e.preventDefault();
		console.log(e.currentTarget.style.backgroundColor);

		if (e.currentTarget.style.backgroundColor === 'blue') {
			console.log('if == blue');
			e.currentTarget.style.backgroundColor = 'white';
		}
		else {
			console.log('else ');
			e.currentTarget.style.backgroundColor = 'blue';
		}

	},
	render: function() {
		var self = this;
		var files = this.state.files.map(function (file, index) {
			return(
				<li onClick={self.handleClick} key={file.id}>
				{file.name}
				</li>
			)
		});

		return (
			<ul>
			{files}
			</ul>
		);
	}
});
ReactDOM.render(<FileList/>, document.getElementById('file-list-container'));
