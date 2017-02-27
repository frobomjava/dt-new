define(['classnames', 'react', 'jquery', 'jquery.ui', 'bootstrap', 'PubSub'], function (classnames, React, $) {
  var preDiv = null;
  var ProjectExplorer = React.createClass({
    getInitialState: function () {
      return ({
        myMap: myMap,
        undoDataMap: undoDataMap,
        redoDataMap: redoDataMap,
        data: {
          name: projectName,
          resourceType: 'project',
          level: 0,
          children: []
        },
        resourceType: "",
        trigger: "",
        nodeID: ""
      });
    },

    handleClick: function (event) {
      event.preventDefault();
      var self = this;
      projName = this.state.projectName;
      filesUpdated = this.state.files.slice();
      fileName = event.target.getAttribute('name');
      fileId = event.target.getAttribute('value');
      index = event.target.getAttribute('id');

      if (preDiv) {
        preDiv.style.backgroundColor = "#f1f1f1";
      }
      event.target.style.backgroundColor = "#D1D0CE";
      preDiv = event.target;

      if (self.state.myMap.has(fileId)) {
        var dtData = self.state.myMap.get(fileId);
        var undoStack = self.state.undoDataMap.get(fileId);
        var redoStack = self.state.redoDataMap.get(fileId);
        PubSub.publish('ClickFileEvent', { fileId: fileId, dtData: dtData, undoStack: undoStack, redoStack: redoStack });
      } else {
        console.log("---no key---");
        url = "/project/in/" + projectName + "/resource/data/" + nodeID;
        $.getJSON(url, function (data) {
          console.log('ok, got data');
          self.state.myMap.set(fileId, data);
          self.state.undoDataMap.set(fileId, []);
          self.state.redoDataMap.set(fileId, []);
          var undoStack = self.state.undoDataMap.get(fileId);
          var redoStack = self.state.redoDataMap.get(fileId);
          var dtData = self.state.myMap.get(fileId);
          PubSub.publish('ClickFileEvent', { fileId: fileId, dtData: dtData, undoStack: undoStack, redoStack: redoStack });
        });
      }

      $(function ($) {
        $.contextMenu({
          selector: '.file-context-menu-one',
          callback: function (key, options) {
            deleteHandler();
          },
          items: {
            "Delete": { name: "delete", icon: "delete" }
          }
        });

        function deleteHandler() {
          var url = '/project/in/' + projName + '/file/delete/' + fileId;
          console.log('===delete url=== ' + url);
          var getting = $.get(url);
          getting.done(function () {
            filesUpdated.splice(index, 1);
            self.setState({ files: filesUpdated });
            PubSub.publish('DeleteFileEvent');
          });
        }
      });
    },

    componentWillMount: function () {
      var self = this;
      var url = '/project/in/' + projectId + '/resource/tree';

      $.getJSON(url, function (project) {
        console.log("Resource Tree");
        console.log(JSON.stringify(project));
        //var projectData = JSON.parse(project);
        project.children = project.resources;
        self.setState({ data: project, resourceType: "", trigger: "", nodeID: "" });
        //console.log(JSON.stringify(projectData));
        console.log("state has been set");
      });
      console.log("new component will mount");
    },

    findParentResource: function (parentId, resources, callback) {
      var self = this;
      resources.forEach(function (resource) {
        if (resource.id == parentId) {
          return callback(resource);
        } else if (resource.children && resource.children.length > 0) {
          return self.findParentResource(parentId, resource.children, callback);
        }
      });
    },

    onSelect: function (event, node, trigger, nodeID) {
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
        if (preDiv) {
          preDiv.style.backgroundColor = "#f1f1f1";
        }
        event.target.style.backgroundColor = "#D1D0CE";
        preDiv = event.target;

        if (self.state.myMap.has(nodeID)) {
          var dtData = self.state.myMap.get(nodeID);
          var undoStack = self.state.undoDataMap.get(nodeID);
          var redoStack = self.state.redoDataMap.get(nodeID);
          PubSub.publish('ClickFileEvent', { fileId: nodeID, dtData: dtData, undoStack: undoStack, redoStack: redoStack });
        } else {
          console.log("---no key---");
          url = "/project/in/" + projectName + "/resource/data/" + nodeID;
          $.getJSON(url, function (data) {
            console.log('ok, got data');
            self.state.myMap.set(nodeID, data);
            self.state.undoDataMap.set(nodeID, []);
            self.state.redoDataMap.set(nodeID, []);
            var undoStack = self.state.undoDataMap.get(nodeID);
            var redoStack = self.state.redoDataMap.get(nodeID);
            var dtData = self.state.myMap.get(nodeID);
            PubSub.publish('ClickFileEvent', { fileId: nodeID, dtData: dtData, undoStack: undoStack, redoStack: redoStack });
          });
        }

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

          var url = '/project/in/' + projectId + '/resource/new';
          var posting = $.post(url, { resourceName: resourceName, resourceType: resourceType, nodeID: nodeID });
          posting.done(function (data) {
            if (data.parent) {
              var newChildData = {
                id: data.id,
                name: data.name,
                resourceType: data.resourceType,
                children: []
              };
              // recursively tracing tree nodes to find the parent node
              // if found the parent node, push to the received data to is children,
              // update react component state
              var updatedData = self.state.data;
              self.findParentResource(data.parent, updatedData.children, function (resource) {
                resource.children.push(newChildData);
                self.setState({ data: updatedData });
                console.log("data updated 222*****");
                self.forceUpdate();
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
        this.props.onCategorySelect(event, this, trigger, nodeID);
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
