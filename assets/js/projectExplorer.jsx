define(['classnames','react', 'jquery', 'jquery.ui', 'bootstrap', 'PubSub' ], function (classnames,React, $) {
  var ProjectExplorer = React.createClass({
    getInitialState: function() {
      return ({
        data: {
          name: projectName,
          resourceType: 'project',
          resourceData:[]
        },
        resourceType: "",
        trigger: "",
        nodeID: ""
      });
    },

    componentWillMount: function() {
      this.setState({data: this.state.data});
    },

    onSelect: function (node,trigger,nodeID) {
      var self = this;
      var projectName = this.state.data.name;
      $.contextMenu( 'destroy', '.file-context-menu-one' );

      this.setState({trigger: trigger});
      this.setState({nodeID: nodeID});

      if (this.state.selected && this.state.selected.isMounted()) {
        this.state.selected.setState({selected: false});
      }
      this.setState({selected: node});
      node.setState({selected: true});


      if (this.state.trigger == "file"){
        console.log("===file clicked=== ");
        $(function($){
          $.contextMenu({
            selector: '.file-context-menu-one',
            callback: function(key, options) {
              self.setState({resourceType: key});
              addFunction();
            },
            items: {
              "delete": {name: "Delete", icon: "delete"},
              "sep1": "---------",
              "quit": {name: "Quit", icon: function($element, key, item){ return 'context-menu-icon context-menu-icon-quit'; }}
            }
          });
        });
      } else {
        console.log("===project or folder clicked=== ");
        $(function($){
          $.contextMenu({
            selector: '.file-context-menu-one',
            callback: function(key, options) {
              self.setState({resourceType: key});
              addFunction();
            },
            items: {
              "folder": {name: "Create Folder", icon: "add"},
              "file": {name: "Create File", icon: "add"},
              "delete": {name: "Delete", icon: "delete"},
              "sep1": "---------",
              "quit": {name: "Quit", icon: function($element, key, item){ return 'context-menu-icon context-menu-icon-quit'; }}
            }
          });
        });
      }

      function add() {
        var resourceName = $('#resourceID').val();

        if (resourceName) {
          var resourceType = self.state.resourceType;
          var nodeID = self.state.nodeID;

          var url = '/project/in/'+projectName+'/resource/new';
          var posting = $.post(url,{resourceName: resourceName, resourceType: resourceType, nodeID: nodeID});
          posting.done(function(data) {
            if (data.parent) {
              var newChildData = {
                id: data.id,
                name: data.name,
                resourceType: data.resourceType,
                resourceData: []
              };
              //Not yet finished this code
              self.state.data.resourceData.map(function(resData,index){
                if(data.parent == resData.id){
                  console.log("ParentID is = " + data.parent + " & res id = " + resData.id);
                  var datasUpdated = self.state.data;
                  datasUpdated.resourceData[index].resourceData.push(newChildData);
                  self.setState({data: datasUpdated});
                  console.log("new resData is = " + JSON.stringify(self.state.data));
                }
              });
            } else {
              if(data.resourceType == 'file'){
                console.log("Parent is not exist. file create");
                var datasUpdated = self.state.data;
                datasUpdated.resourceData.push({'id': data.id,'name': data.name,'resourceType': data.resourceType});
                self.setState({data: datasUpdated});
                console.log("==updated data=== " + JSON.stringify(self.state.data));
              } else {
                console.log("Parent is not exist.");
                var datasUpdated = self.state.data;
                datasUpdated.resourceData.push({'id': data.id,'name': data.name,'resourceType': data.resourceType,'resourceData':[]});
                self.setState({data: datasUpdated});
                console.log("==updated data=== " + JSON.stringify(self.state.data));
              }

            }
          });
          dialog.dialog( "close" );
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
          "Create": add,
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
        add();
      });

      function addFunction(nodeID, trigger, esourceType){
        dialog.dialog( "open" );
      }
    },
    render: function() {
      return (
        <div>
        <ul className="category-tree">
        <TreeNode key={this.state.data.id} data={this.state.data} onCategorySelect={this.onSelect} />
        </ul>
        </div>
      );
    }
  });

  var TreeNode = React.createClass({
    getInitialState: function() {
      return {resourceData: []};
    },
    onCategorySelect: function (event) {
      if (this.props.onCategorySelect) {
        trigger = event.target.getAttribute('value');
        nodeID = event.target.getAttribute('id');
        this.props.onCategorySelect(this,trigger,nodeID);
      }
      event.preventDefault();
      event.stopPropagation();
    },

    onChildDisplayToggle: function (event) {
      if (this.props.data.resourceData) {
        if (this.state.resourceData && this.state.resourceData.length) {
          this.setState({resourceData: null});
        } else {
          this.setState({resourceData: this.props.data.resourceData});
        }
      }
      event.preventDefault();
      event.stopPropagation();
    },

    render: function () {
      var self = this;
      var fileIcon;
      if (!this.state.resourceData) this.state.resourceData = [];
      var classes = classnames({
        'has-children': (this.props.data.resourceData ? true : false),
        'open': (this.state.resourceData.length ? true : false),
        'closed': (this.state.resourceData ? false : true),
        'selected': (this.state.selected ? true : false)
      });

      if(this.props.data.resourceType == "file"){
        fileIcon = <i className="fa fa-file-text-o" aria-hidden="true"></i>;
      } else if (this.props.data.resourceType == "folder") {
        fileIcon = <i className="fa fa-folder-o" aria-hidden="true"></i>;
      }
      return (
        <li ref="node" className={classes} onClick={this.onChildDisplayToggle}>
        {fileIcon}&nbsp;
        <a onClick={this.onCategorySelect} value={this.props.data.resourceType} id={this.props.data.id} className="file-context-menu-one">{this.props.data.name}</a>
        <ul>
        {this.state.resourceData.map(function(child,index){
          return (<TreeNode key={child.id} data={child} onCategorySelect={self.props.onCategorySelect} />)
        })}
        </ul>
        </li>
      );
    }
  });
  return ProjectExplorer;
});
