define(['react', 'jquery', 'jquery.ui', 'bootstrap'], function (React, $) {
  var ProjectList=React.createClass( {
    getInitialState: function() {
      return ( {
        projects: [],
        memberProjects: [],
        userName: ""
      }
    );
  },

  componentWillMount: function() {
    var self=this;
    $.getJSON('/projects', function (data) {
      console.log('ok, got data');
      console.log("data is = " + JSON.stringify(data));
      self.setState( { projects: data.projects,
        memberProjects: data.memberProjects,
        userName: data.userName
       } );
    });

  $('#project-create-form').submit(function(event) {
    console.log("post handler");
    event.preventDefault();
    var url='/project/new';
    var posting=$.post(url, {
      projectName: $('#projectName').val()
    }
  );
  posting.done(function(data) {
    if (data.projectName) {
      $('#projectName').val('');
      $('#error').text(data.projectName + ' is created..');
      $(".alert").css( {
        "background-color": "#80CBC4", "display": "block"
      }
    );
    console.log(data.projectName);
    var projectsUpdated=self.state.projects.slice();
    projectsUpdated.push(data);
    self.setState( {
      projects: projectsUpdated
    }
  );
}
else {
  console.log("data.error " + data.error);
  $('#error').text(data.error);
  $(".alert").css( {
    "background-color": "#FA5858", "display": "block"
  }
);
}
}
);
}
);
},

deleteHandler: function(event) {
  console.log("delete handler");
  event.preventDefault();
  var self=this;
  var projectName=event.target.getAttribute('name');
  var index=event.target.getAttribute('id');
  var url='/project/delete/'+projectName;
  var getting=$.get(url);
  getting.done(function() {
    var projectsUpdated=self.state.projects.slice();
    projectsUpdated.splice(index, 1);
    self.setState( {
      projects: projectsUpdated
    }
  );
}
);
},

settingHandler: function(event) {
  console.log("setting handler");
  event.preventDefault();
  var self=this;
  var projectName=event.target.getAttribute('name');
  var index=event.target.getAttribute('id');
  var url='/project/setting/'+projectName;
  var getting=$.get(url);
  getting.done(function() {
    var projectsUpdated=self.state.projects.slice();
    projectsUpdated.splice(index, 1);
    self.setState( {
      projects: projectsUpdated
    }
  );
}
);
},

render: function() {
  var self=this;
  var index=0;
  var userName = userName;
  console.log('userName '+ userName);
  return (
    <div>
    <div className="panel panel-primary">
      <div className="panel-heading"><strong>{self.state.userName}&#39;s Projects...</strong></div>
      <div className="panel-body">
        <ul className="content-list"> {
            this.state.projects.map(function(project) {
              var url='/project/in/'+ project.id;
              var settingurl='/project/setting/' + project.id;
              return ( <li key={project.id}><strong><a href= {
                url
              }
              > {
                project.projectName
              }
              </a></strong> &nbsp;
              <span className="control"><a href={settingurl} id= {
                index++
              }
              name= {
                project.projectName
              }
              >Setting</a></span> </li>);
            }
          )
        }
        </ul>
      </div>
    </div>
    <br/><br/>
    <div className="panel panel-info">
      <div className="panel-heading"><strong>Member Projects...</strong></div>
      <div className="panel-body">
        <ul className="content-list"> {
            this.state.memberProjects.map(function(project) {
              var url='/project/in/'+ project.id;
              return (
                <li key={project.id}>
                  <strong><a href={url}> {project.projectName} </a></strong>
                </li>
              );
            }
          )
        }
        </ul>
      </div>
    </div>
    </div>
);
}
}
);
return ProjectList;
}

); //define
