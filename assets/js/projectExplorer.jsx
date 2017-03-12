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
          children: [],
          treeNodeExpanded: false
        },
        resourceType: "",
        trigger: "",
        nodeID: ""
      });
    },

    componentWillMount: function () {
      var self = this;
      var url = '/project/in/' + projectId + '/resource/tree';

      $.getJSON(url, function (project) {
        console.log("Resource Tree");
        console.log(JSON.stringify(project));
        project.children = project.resources;
        self.setState({ data: project, resourceType: "", trigger: "", nodeID: "", resourceFetched: true });
        console.log("state has been set");
      });
      console.log("new component will mount");
    },

    componentDidMount: function () {
      var self = this;
      var socketUrl = '/project/socket/' + projectId;
      io.socket.get(socketUrl, function (responseData) {
        console.log("**** respondData ****" + responseData);
      });

      io.socket.on('new-resource', function (data) {
        PubSub.publish("AddFile", data);
      });

      io.socket.on('delete-resource', function (data) {
        console.log("DeleteSocketBroadCast");
        console.log(JSON.stringify(data));
        PubSub.publish('DeleteFileEvent');
        PubSub.publish("DeleteResource", data);
      });

      io.socket.on('changed-resource', function (data) {
        var resourceId = data;
        $('#' + resourceId).css("color", "#FFBF00");
      });

      $('#refreshID').on('click', function (event) {
        event.preventDefault();
        var updatedDtData = self.state.dtData;
        var fileId = self.state.fileId;
        url = "/project/in/" + projectName + "/resource/data/" + nodeID;
        console.log("refresh url = " + url);
        console.log("*** nodeID *** " + nodeID);

        $.getJSON(url, function (data) {
          console.log('ok, got data from refresh');
          self.state.myMap.set(nodeID, data);
          self.state.undoDataMap.set(nodeID, []);
          self.state.redoDataMap.set(nodeID, []);
          var undoStack = self.state.undoDataMap.get(nodeID);
          var redoStack = self.state.redoDataMap.get(nodeID);
          var dtData = self.state.myMap.get(nodeID);
          PubSub.publish('ClickFileEvent', { fileId: nodeID, dtData: dtData, undoStack: undoStack, redoStack: redoStack });
          $('#' + nodeID).css("color", "#000");
        });
      });
    },

    onSelect: function (event, node, trigger, nodeID, resourceName) {
      var self = this;
      var projectName = this.state.data.name;
      $.contextMenu('destroy', '.file-context-menu-one');

      console.log("trigger = " + trigger);

      this.setState({ nodeID: nodeID });

      if (this.state.selected && this.state.selected.isMounted()) {
        this.state.selected.setState({ selected: false });
      }

      this.setState({ selected: node });
      node.setState({ selected: true });

      if (preDiv) {
        preDiv.style.backgroundColor = "#D1D0CE"; //backgroundColor
        event.target.style.backgroundColor = "#A9A9A9"; //selectedColor
      }
      preDiv = event.target;

      if (trigger == "file") {
        if (self.state.myMap.has(nodeID)) {
          console.log("Key is exists");
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
            preDiv.style.color = "#000";
          });
        }

        console.log("===file clicked=== ");
        $(function ($) {
          $.contextMenu({
            selector: '.file-context-menu-one',
            callback: function (key, options) {
              self.setState({ resourceType: trigger });
              var resourceId = self.state.nodeID;
              if (key == "delete") {
                deleteFile(resourceId);
              } else if (key == "download") {
                downloadFile(resourceId);
              } else if (key == "generate-code") {
                generateCode(resourceId);
              }
            },
            items: {
              "delete": { name: "Delete", icon: "delete" },
              "download": { name: "Download", icon: "fa-download" },
              "generate-code": { name: "Generate Code", icon: "fa-file-code-o" },
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
              var resourceId = self.state.nodeID;
              if (key == "file" || key == "folder") {
                addFunction();
              } else if (key == "delete") {
                deleteFile(resourceId);
              }
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
            PubSub.publish("AddFile", data);
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

      function deleteFile(resourceId) {
        var datasUpdated = self.state.data;
        var url = '/project/in/' + projectId + '/resource/delete/' + resourceId;
        var getting = $.get(url);
        getting.done(function (data) {
          console.log("DeleteResource publishing");
          PubSub.publish("DeleteResource", data);
        });
      }

      function downloadFile(resourceId) {
        var url = '/project/in/' + projectId + '/resource/download/' + resourceId;
        var getting = $.get(url);
        getting.done(function (data) {
          $("<a />", {
            "download": resourceName + ".json",
            "href": "data:application/json," + encodeURIComponent(JSON.stringify(data))
          }).appendTo("body")
            .click(function () {
            })[0].click()
        });
      }

      function generateCode(resourceId) {
        var url = '/project/in/' + projectId + '/resource/code/generate/' + resourceId;
        var getting = $.get(url);
        getting.done(function (data) {
          if (data) {
            console.log('*** got data after code generate ***');
            console.log('data : ' + JSON.stringify(data));
            PubSub.publish("AddFile", data);
          }

        });
      }
    },

    render: function () {

      return (
        <div>
          <ul className="resource-tree">
            <TreeNode key={this.state.data.id} data={this.state.data} onResourceSelect={this.onSelect} />
          </ul>
        </div>
      );
    }
  });

  var TreeNode = React.createClass({
    getInitialState: function () {
      return {
        children: [],
        displayingChildren: [],
        treeNodeExpanded: false,
        resourceFetched: false
      };
    },
    onResourceSelect: function (event) {
      if (this.props.onResourceSelect) {
        trigger = event.target.getAttribute('value');
        nodeID = event.target.getAttribute('id');
        resourceName = this.props.data.name;
        this.props.onResourceSelect(event, this, trigger, nodeID, resourceName);
      }
      event.preventDefault();
      event.stopPropagation();
    },

    onChildDisplayToggle: function (event) {
      var children = [];
      var self = this;
      if (this.props.data.resourceType == 'project') {
        children = this.props.data.children;
      } else {
        children = this.state.children;
      }
      var displayingChildren = this.state.displayingChildren;
      var resourceFetched = this.state.resourceFetched;
      var treeNodeExpanded = this.state.treeNodeExpanded;
      if (this.props.data.resourceType != 'project' && !resourceFetched) {
        //fetch data
        var url = '/project/in/' + projectId + '/resource/children/' + this.props.data.id;
        $.getJSON(url, function (data) {
          children = data;
          resourceFetched = true;
          console.log("resource fetched");
          console.log(JSON.stringify(children));
          treeNodeExpanded = !treeNodeExpanded;
          if (treeNodeExpanded) {
            console.log("tree node expanded");
            displayingChildren = children;
            console.log(JSON.stringify(displayingChildren));
          }
          else {
            console.log("tree node not expanded");
            displayingChildren = [];
          }

          console.log('resource fetched: ' + resourceFetched);
          self.setState({
            children: children,
            displayingChildren: displayingChildren,
            resourceFetched: resourceFetched,
            treeNodeExpanded: treeNodeExpanded
          });
        });
      } else {
        treeNodeExpanded = !treeNodeExpanded;
        if (treeNodeExpanded) {
          console.log("tree node expanded");
          displayingChildren = children;
          console.log(JSON.stringify(displayingChildren));
        }
        else {
          console.log("tree node not expanded");
          displayingChildren = [];
        }

        console.log('resource fetched: ' + resourceFetched);
        this.setState({
          children: children,
          displayingChildren: displayingChildren,
          resourceFetched: resourceFetched,
          treeNodeExpanded: treeNodeExpanded
        });
      }

      event.preventDefault();
      event.stopPropagation();
    },

    removeChildFile: function (msg, file) {
      console.log("remove child file");
      if (this.props.data.resourceType == 'file') {
        return;
      }

      if (file.parent != this.props.data.id) {
        return;
      }

      var children = this.state.children.slice();

      for (var i = 0; i < children.length; i++) {
        console.log("children id is " + children[i].id);
        console.log("file id is " + file.id);
        if (children[i].id == file.id) {
          children.splice(i, 1);
        }
      }

      var displayingChildren = this.state.displayingChildren.slice();
      if (this.state.treeNodeExpanded) {
        var displayingChildren = children;
      }
      this.setState({
        children: children,
        displayingChildren: displayingChildren
      });
      console.log("End of Deleted Resource");
      this.forceUpdate();
    },

    addChildFile: function (msg, file) {
      console.log("Add Child File");
      console.log("file parent is " + file.parent);
      console.log("this.props.data.id is " + this.props.data.id);
      if (this.props.data.resource == 'file') {
        return;
      }
      if (file.parent != this.props.data.id) {
        return;
      }
      var children = this.state.children.slice();
      var displayingChildren = this.state.displayingChildren.slice();
      children.push(file);
      if (this.state.treeNodeExpanded) {
        displayingChildren = children;
      }
      this.setState({
        children: children,
        displayingChildren: displayingChildren
      });
      console.log("End of Add Child File");
    },

    componentDidMount: function() {
     PubSub.subscribe("AddFile", this.addChildFile);
     PubSub.subscribe("DeleteResource", this.removeChildFile);
    },

    render: function () {
      var self = this;
      var resourceIcon;
      if (!this.state.children) this.state.children = [];
      if (!this.state.displayingChildren) this.state.displayingChildren = [];

      var classes = classnames({
        'has-children': (this.props.data.resourceType != 'file' ? true : false),
        'open': (this.state.displayingChildren.length ? true : false),
        'closed': (this.state.displayingChildren ? false : true),
        'selected': (this.state.selected ? true : false)
      });

      if (this.props.data.resourceType == "file") {
        resourceIcon = <i className="fa fa-file-text-o" aria-hidden="true"></i>;
      } else if (this.props.data.resourceType == "folder") {
        resourceIcon = <i className="fa fa-folder-o" aria-hidden="true"></i>;
      }
      return (
        <li ref="node" className={classes} onClick={this.onChildDisplayToggle}>
          <a onClick={this.onResourceSelect} value={this.props.data.resourceType} id={this.props.data.id} className="file-context-menu-one"> {resourceIcon}&nbsp; {this.props.data.name}</a>
          <ul>
            {this.state.displayingChildren.map(function (child, index) {
              return (<TreeNode key={child.id} data={child} onResourceSelect={self.props.onResourceSelect} />)
            })}
          </ul>
        </li>
      );
    }
  });
  return ProjectExplorer;
});
