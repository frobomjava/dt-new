define(['classnames','react', 'jquery', 'jquery.ui', 'bootstrap', 'PubSub', ], function (classnames,React, $) {

  var data = {
    // id: 1,
    name: projectName,
    resourceType: 'project',
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

      if (this.props.onCategorySelect) {
        this.props.onCategorySelect(this);
      }
      console.log("===this.props.data.resourceType=== " + this.props.data.resourceType);
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
            items: { "create file": {name: "Create File", icon: "add"},
            "delete": {name: "Delete", icon: "delete"},
            "sep1": "---------",
            "quit": {name: "Quit", icon: function($element, key, item){ return 'context-menu-icon context-menu-icon-quit'; }}
          }
        });
      });
    } else {
      console.log("===project=== ");
      $(function($){
        $.contextMenu({
          selector: '.file-context-menu-one',
          callback: function(key, options) {
            handeler(key);
          },
          items: {
            "create folder": {name: "Create Folder", icon: "add"},
            "create file": {name: "Create File", icon: "add"},
            "delete": {name: "Delete", icon: "delete"},
            "sep1": "---------",
            "quit": {name: "Quit", icon: function($element, key, item){ return 'context-menu-icon context-menu-icon-quit'; }}
          }
        });
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
