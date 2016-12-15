var FileList = React.createClass({
	getInitialState: function(){
		return ({
			files: [],
			projectName: projectName
		});
	},

	componentWillMount: function() {
		var self = this;
		var prjName = this.state.projectName;
		console.log("--prjName-- " +prjName);
		var url = '/project/in/'+prjName+'/files'
		console.log("---url--- " + url);
		$.getJSON(url, function (data) {
			console.log('ok, got data');
			console.log("data is = " + JSON.stringify(data));
			self.setState({
				files: data
			});
		});

		$('#file-create').on('click',function(event) {
			console.log("---file create handler---");
			event.preventDefault();
			var fileName = prompt("Please enter file name", "");
			var url = '/project/in/'+projectName+'/file/new';
			console.log('file create url' + url);
			var posting = $.post(url,{fileName: fileName});
			posting.done(function(data) {
				if (data.fileName) {
					console.log(data.fileName);
					var filesUpdated = self.state.files.slice();
					filesUpdated.push(data);
					self.setState({
						files: filesUpdated
					}
				);
			}
		});
	});

},

// updateFileList: function(file) {
// 	console.log('new file\'s name : ' + file.fileName);
// 	var updatedFiles = this.state.files.slice();
// 	updatedFiles.push(file);
// 	this.setState({
// 		files: updatedFiles
// 	});
// },
handleClick: function(event) {
	event.preventDefault();
	console.log("---handlerClick---");

	var self = this;
	var fileName = event.target.getAttribute('name');
	console.log("---fileName--- " + fileName);
	var index = event.target.getAttribute('index');
	console.log("---index--- " + index);
	//var url = "/project/in/"+:projectName+"/file/data/"+:fileId;

	// if (e.currentTarget.style.backgroundColor === 'blue') {
	// 	console.log('if == blue');
	// 	e.currentTarget.style.backgroundColor = 'white';
	// }
	// else {
	// 	console.log('else ');
	// 	e.currentTarget.style.backgroundColor = 'blue';
	// }

},
render: function() {
	var self = this;
	var files = this.state.files.map(function (file, index) {
		return(
			<li onClick={self.handleClick} key={file.id} index={index} name={file.fileName}>
			{file.fileName}
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
