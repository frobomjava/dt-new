
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

		function addDtFile() {
			var valid = true;
			var fileName = $('#fileID').val();
			if (valid && fileName) {
				console.log("---file create handler---");
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
			dialog.dialog( "close" );
			return valid;
		} else {
			dialog.dialog( "close" );
		}
	}

	var dialog = $( "#dialog-form" ).dialog({
		autoOpen: false,
		height: 250,
		width: 300,
		modal: true,
		buttons: {
			"Create": addDtFile,
			Cancel: function() {
				dialog.dialog( "close" );
			}
		},
		close: function() {
			form[ 0 ].reset();
		}
	});

	var form = dialog.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
		addDtFile();
	});

	$( "#file-create" ).button().on( "click", function() {
		dialog.dialog( "open" );
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
		PubSub.publish('ClickFileEvent',{fileId: fileId, dtData: dtData});
		console.log(JSON.stringify(dtData));
	} else {
		console.log("---no key---");
		$.getJSON(url, function (data) {
			console.log('ok, got data');
			console.log(JSON.stringify(data));
			console.log("===data printed===");
			self.state.myMap.set(fileId,data);
			var dtData = self.state.myMap.get(fileId);
			PubSub.publish('ClickFileEvent',{fileId: fileId, dtData: dtData});
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
