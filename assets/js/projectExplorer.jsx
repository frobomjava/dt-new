define(['classnames','react', 'jquery', 'jquery.ui', 'bootstrap', 'PubSub', ], function (classnames,React, $) {

  var data = {
    // id: 1,
    name: projectName,
    resourceType: 'project',
    level: 0,
    resourceData:[
      {
        id: 1,
        name: 'folder1',
        resourceType: 'folder',
        level: 1,
        resourceData: [
          {
            id: 1,
            name: 'file11',
            resourceType: 'file',
            level: 2
          },
          {
            id: 2,
            name: 'file12',
            resourceType: 'file',
            level: 2
          }
        ]
      },
      {
        id: 2,
        name: 'folder2',
        resourceType: 'folder',
        level: 1,
        resourceData: [
          {
            id: 3,
            name: 'file21',
            resourceType: 'file',
            level: 2
          },
          {
            id: 4,
            name: 'file22',
            resourceType: 'file',
            level: 2
          }
        ]
      },
      {
        id: 3,
        name: 'folder3',
        resourceType: 'folder',
        level: 1,
        resourceData: [
          {
            id: 4,
            name: 'subFolder4',
            resourceType: 'folder',
            level: 2,
            resourceData: [
              {
                id: 7,
                name: 'subFile41',
                resourceType: 'file',
                level: 4
              }
            ]
          },
          {
            id: 5,
            name: 'file31',
            resourceType: 'file',
            level: 2
          },
          {
            id: 6,
            name: 'file32',
            resourceType: 'file',
            level: 2
          }
        ]
      }
    ]
  }

  var ProjectExplorer = React.createClass({
    getInitialState: function() {
      return {data: data};
    },
    componentWillMount: function() {
      this.setState({data: data});
    },
    onSelect: function (node) {
      if (this.state.selected && this.state.selected.isMounted()) {
        this.state.selected.setState({selected: false});
      }
      this.setState({selected: node});
      node.setState({selected: true});
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
      event.preventDefault();
      event.stopPropagation();

      $.contextMenu( 'destroy', '.file-context-menu-one' );

      var trigger = this.props.data.resourceType;
      var level = this.props.data.level;

      if (this.props.onCategorySelect) {
        this.props.onCategorySelect(this);
      }

      console.log("===this.props.data.level=== " + level);

      if (trigger == "file"){
        console.log("===file=== ");
        $(function($){
          $.contextMenu({
            selector: '.file-context-menu-one',
            callback: function(key, options) {
              handeler(key);
            },
            items: {
              "delete": {name: "Delete", icon: "delete"},
              "sep1": "---------",
              "quit": {name: "Quit", icon: function($element, key, item){ return 'context-menu-icon context-menu-icon-quit'; }}
            }
          });
        });

      } else if (trigger == "folder") {
        console.log("===folder=== ");
        $(function($){
          $.contextMenu({
            selector: '.file-context-menu-one',
            callback: function(key, options) {
              handeler(key);
            },
            items: {
              "file": {name: "Create File", icon: "add"},
              "delete": {name: "Delete", icon: "delete"},
              "sep1": "---------",
              "quit": {name: "Quit", icon: function($element, key, item){ return 'context-menu-icon context-menu-icon-quit'; }}
            }
          });
        });
      } else {
        console.log("===project=== ");
        var resourceType;
        $(function($){
          $.contextMenu({
            selector: '.file-context-menu-one',
            callback: function(key, options) {
              resourceType = key;
              addFunction(key);
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

        function addFunction(key){
          if(key=="folder"){
            console.log("===equal===");
            dialog.dialog( "open" );
          }
        }

        function add() {
          var resourceName = $('#resourceID').val();
          if (resourceName) {
            console.log("---Resource handler---");
            var url = '/project/in/'+projectName+'/resource/new';
            var posting = $.post(url,{resourceName: resourceName, resourceType: resourceType, level: ++level});
            // posting.done(function(data) {
            //   if (data.fileName) {
            //     console.log(data.fileName);
            //     var filesUpdated = self.state.files.slice();
            //     filesUpdated.push(data);
            //     self.setState({files: filesUpdated});
            //   }
            // });
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
      }
    },

    onChildDisplayToggle: function (ev) {
      if (this.props.data.resourceData) {
        if (this.state.resourceData && this.state.resourceData.length) {
          this.setState({resourceData: null});
        } else {
          this.setState({resourceData: this.props.data.resourceData});
        }
      }
      ev.preventDefault();
      ev.stopPropagation();
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
        <a onClick={this.onCategorySelect} id={this.props.data.id} className="file-context-menu-one">{this.props.data.name}</a>
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
