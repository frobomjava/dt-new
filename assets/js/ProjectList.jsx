define(['react', 'jquery', 'jquery.ui', 'bootstrap'], function (React, $) {
  var ProjectList=React.createClass( {
    getInitialState: function() {
      return ( {
        projects: []
      }
      );
    }, 
    
    componentWillMount: function() {
      var self=this;
      $.getJSON('/projects', function (data) {
        console.log('ok, got data');
        //console.log("data is = " + JSON.stringify(data));
        self.setState( {
          projects: data
        }
        );
      }
      );
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
              "background-color": "#80CBC4", "opacity": 1
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
            console.log(data.error);
            $('#error').text(data.error);
            $(".alert").css( {
              "background-color": "#FA5858", "opacity": 1
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
    
    render: function() {
      var self=this;
      var index=0;
      return (<ul className="content-list"> {
        this.state.projects.map(function(project) {
          var url='/project/in/'+ project.projectName;
          return ( <li><strong><a href= {
            url
          }
          > {
            project.projectName
          }
          </a></strong> &nbsp;
          <span className="control"><a href="#" id= {
            index++
          }
          name= {
            project.projectName
          }
          onClick= {
            self.deleteHandler
          }
          >Delete</a></span> </li>);
        }
        )
      }
      </ul>);
    }
  }
  );
  return ProjectList;
}

); //define
