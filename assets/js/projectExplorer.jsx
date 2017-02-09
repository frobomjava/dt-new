define(['classnames', 'react', 'jquery', 'jquery.ui', 'bootstrap', 'PubSub'], function (classnames, React, $) {
  var ProjectExplorer = React.createClass({
    getInitialState: function () {
      return ({
        data: {
          name: projectName,
          resourceType: 'project',
          level: 0,
          children: [
            {
              id: 1,
              name: 'folder1',
              resourceType: 'folder',
              level: 1,
              children: [
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
              children: [
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
              children: [
                {
                  id: 4,
                  name: 'subFolder4',
                  resourceType: 'folder',
                  level: 2,
                  children: [
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
        },
        resourceType: "",
        trigger: "",
        nodeID: ""
      });
    },

    componentWillMount: function () {
      var self = this;
      var url = '/project/in/' + projectName + '/resource/tree';

      $.getJSON(url, function (project) {
        console.log("Resource Tree");
        console.log(JSON.stringify(project));
        //var projectData = JSON.parse(project);
        project.children = project.resources;
        self.setState({data : project });
        //console.log(JSON.stringify(projectData));
        console.log("state has been set");
      });
      console.log("new componet will mount");
    },

    onSelect: function (node, trigger, nodeID) {
      var self = this;
      var projectName = this.state.data.name;
      $.contextMenu('destroy', '.file-context-menu-one');

      console.log("trigger = " + trigger);

      //  this.setState({trigger: trigger});
      this.setState({ nodeID: nodeID });

      if (this.state.selected && this.state.selected.isMounted()) {
        this.state.selected.setState({ selected: false });
      }
      this.setState({ selected: node });
      node.setState({ selected: true });

      //console.log("state.trigger = " + this.state.trigger);

      if (trigger == "file") {
        console.log("===file clicked=== ");
        $(function ($) {
          $.contextMenu({
            selector: '.file-context-menu-one',
            callback: function (key, options) {
              self.setState({ resourceType: key });
              addFunction();
            },
            items: {
              "delete": { name: "Delete", icon: "delete" },
              "sep1": "---------",
              "quit": { name: "Quit", icon: function ($element, key, item) { return 'context-menu-icon context-menu-icon-quit'; } }
            }
          });
        });
      } else {
        console.log("===project or folder clicked=== ");
        $(function ($) {
          $.contextMenu({
            selector: '.file-context-menu-one',
            callback: function (key, options) {
              self.setState({ resourceType: key });
              addFunction();
            },
            items: {
              "folder": { name: "Create Folder", icon: "add" },
              "file": { name: "Create File", icon: "add" },
              "delete": { name: "Delete", icon: "delete" },
              "sep1": "---------",
              "quit": { name: "Quit", icon: function ($element, key, item) { return 'context-menu-icon context-menu-icon-quit'; } }
            }
          });
        });
      }

      function add() {
        var resourceName = $('#resourceID').val();

        if (resourceName) {
          var resourceType = self.state.resourceType;
          var nodeID = self.state.nodeID;

          var url = '/project/in/' + projectName + '/resource/new';
          var posting = $.post(url, { resourceName: resourceName, resourceType: resourceType, nodeID: nodeID });
          posting.done(function (data) {
            if (data.parent) {
              var newChildData = {
                id: data.id,
                name: data.name,
                resourceType: data.resourceType,
                children: []
              };
              //Not yet finished this code
              self.state.data.children.map(function (resData, index) {
                if (data.parent == resData.id) {
                  console.log("ParentID is = " + data.parent + " & res id = " + resData.id);
                  var datasUpdated = self.state.data;
                  datasUpdated.children[index].children.push(newChildData);
                  self.setState({ data: datasUpdated });
                  console.log("new resData is = " + JSON.stringify(self.state.data));
                }
              });
            } else {
              if (data.resourceType == 'file') {
                console.log("Parent is not exist. file create");
                var datasUpdated = self.state.data;
                datasUpdated.children.push({ 'id': data.id, 'name': data.name, 'resourceType': data.resourceType });
                self.setState({ data: datasUpdated });
                console.log("==updated data=== " + JSON.stringify(self.state.data));
              } else {
                console.log("Parent is not exist.");
                var datasUpdated = self.state.data;
                datasUpdated.children.push({ 'id': data.id, 'name': data.name, 'resourceType': data.resourceType, 'children': [] });
                self.setState({ data: datasUpdated });
                console.log("==updated data=== " + JSON.stringify(self.state.data));
              }

            }
          });
          dialog.dialog("close");
        } else {
          dialog.dialog("close");
        }
      }

      var dialog = $("#dialog-form").dialog({
        autoOpen: false,
        height: 250,
        width: 300,
        modal: true,
        buttons: {
          "Create": add,
          Cancel: function () {
            dialog.dialog("close");
          }
        },
        close: function () {
          form[0].reset();
        }
      });

      var form = dialog.find("form").on("submit", function (event) {
        event.preventDefault();
        event.stopPropagation();
        add();
      });

      function addFunction(nodeID, trigger, esourceType) {
        dialog.dialog("open");
      }
    },
    render: function () {
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
    getInitialState: function () {
      return { children: [] };
    },
    onCategorySelect: function (event) {
      if (this.props.onCategorySelect) {
        trigger = event.target.getAttribute('value');
        nodeID = event.target.getAttribute('id');
        this.props.onCategorySelect(this, trigger, nodeID);
      }
      event.preventDefault();
      event.stopPropagation();
    },

    onChildDisplayToggle: function (event) {
      if (this.props.data.children) {
        if (this.state.children && this.state.children.length) {
          this.setState({ children: null });
        } else {
          this.setState({ children: this.props.data.children });
        }
      }
      event.preventDefault();
      event.stopPropagation();
    },

    render: function () {
      var self = this;
      var resourceIcon;
      if (!this.state.children) this.state.children = [];
      var classes = classnames({
        'has-children': (this.props.data.children ? true : false),
        'open': (this.state.children.length ? true : false),
        'closed': (this.state.children ? false : true),
        'selected': (this.state.selected ? true : false)
      });

      if (this.props.data.resourceType == "file") {
        resourceIcon = <i className="fa fa-file-text-o" aria-hidden="true"></i>;
      } else if (this.props.data.resourceType == "folder") {
        resourceIcon = <i className="fa fa-folder-o" aria-hidden="true"></i>;
      }
      return (
        <li ref="node" className={classes} onClick={this.onChildDisplayToggle}>
          {resourceIcon}&nbsp;
        <a onClick={this.onCategorySelect} value={this.props.data.resourceType} id={this.props.data.id} className="file-context-menu-one">{this.props.data.name}</a>
          <ul>
            {this.state.children.map(function (child, index) {
              return (<TreeNode key={child.id} data={child} onCategorySelect={self.props.onCategorySelect} />)
            })}
          </ul>
        </li>
      );
    }
  });
  return ProjectExplorer;
});
