var ProjectList = React.createClass({
	componentWillMount: function() {

	    // io.socket.get('/project/socket/join', function (resData) {
	    // 	console.log("... client socket join to server socket...");
	    //    	console.log('resData ' + resData);
	    // });
			//
	    // var self = this;
			//
	    // io.socket.on('newProject', function(project) {
	    //   console.log("new project " + project.name + ' arrive...');
	    //   console.log(JSON.stringify(project));
	    //
	    //   self.updateProjectList(project);
	    // });

	},
	getInitialState: function(){
	    return { projects: prjList }
    },
    updateProjectList: function(project) {
    	console.log('new project\'s name : ' + project.name);
    	var projects = this.state.projects.slice(0);
    	projects.push(project);
    	this.setState({
	      projects: projects
	    });
	    document.getElementById('txtProject').value = "";
    },
	render: function() {
		//var userName = this.state.userName;
      	var projects = this.state.projects.map(function (project, index) {
      		var url = '/project/in/'+ project.name + '/files';
      		return(
      			<li key={project.id}>
      				<a href={url}>{project.name}</a>
      			</li>
      		)
      	});

      	return (
	        <ol className="projectList">
	        {projects}
	        </ol>
	    );
    }
});
ReactDOM.render(<ProjectList/>, document.getElementById('project-list-container'));
