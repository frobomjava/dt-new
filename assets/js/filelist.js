var FileList = React.createClass({
	componentWillMount: function() {

	    io.socket.get('/dtfile/socket/join', function (resData) {
	    	console.log("... dtfile client socket join to server socket...");
	       	console.log('resData ' + resData);
	    });

	    var self = this;

	    io.socket.on('newFile', function(file) {
	      console.log("new file " + file.name + ' arrive...');
	      console.log(JSON.stringify(e));
	      
	      self.updateFileList(file);
	    });
	    
	},
	getInitialState: function(){
	    return { files: filesList, userName: userName }
    },
    updateFileList: function(file) {
    	console.log('new file\'s name : ' + file.name);
    	var files = this.state.files.slice(0);
    	files.push(file);
    	this.setState({
	      files: files
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
		var userName = this.state.userName;
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