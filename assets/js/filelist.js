
var FileList = React.createClass({
	getInitialState: function(){
		return ({
			files: [],
			projectName: projectName,
			myMap: myMap
		});
	},

	componentWillMount: function() {
		var self = this;
		var prjName = this.state.projectName;
		var url = '/project/in/'+prjName+'/files'
		$.getJSON(url, function (data) {
			console.log('ok, got data');
			//console.log("data is = " + JSON.stringify(data));
			self.setState({
				files: data
			});
		});

		$('#file-create').on('click',function(event) {
			console.log("---file create handler---");
			event.preventDefault();
			var fileName = prompt("Please enter file name", "");
			var url = '/project/in/'+projectName+'/file/new';
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

handleClick: function(event) {
	console.log("---handlerClick---");
	event.preventDefault();
	var self = this;
	var fileName = event.target.getAttribute('name');
	var fileId = event.target.getAttribute('value');
	var index = event.target.getAttribute('id');
	var url = "/project/in/"+this.state.projectName+"/file/data/"+fileId;
	console.log("---url--- " + url);
	if(self.state.myMap.has(fileId)){
		var dtData = self.state.myMap.get(fileId);
		console.log("---map has key-value--- " + dtData);
		PubSub.publish('ClickFileEvent',dtData);
		console.log(JSON.stringify(dtData));
	} else {
		console.log("---no key---");
		$.getJSON(url, function (data) {
			console.log('ok, got data');
			console.log(JSON.stringify(data));
			console.log("data printed");
			self.state.myMap.set(fileId,data);
			var dtData = self.state.myMap.get(fileId);
			PubSub.publish('ClickFileEvent',dtData);
		});
	}
},

render: function() {
	var self = this;
	return (
		<ul>
		{this.state.files.map(function (file, index) {
			return(
				<li onClick={self.handleClick} id={index} value={file.id} name={file.fileName}>
				{file.fileName}
				</li>
			)
		})}
		</ul>
	);
}
});
ReactDOM.render(<FileList/>, document.getElementById('file-list-container'));
