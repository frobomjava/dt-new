define(['PubSub','classnames', 'react', 'jquery', 'jquery.ui','jquery-contextMenu', 'bootstrap'], function (PubSub, classnames, React, $) {
  var preDiv = null;
  var dialog = $("#dialog-form").dialog({
    autoOpen: false,
    height: 250,
    width: 300,
    modal: true,
    buttons: {
      "Create": function (){form.submit()},
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
    PubSub.publish("ResourceNewFormSubmit");
  });

  function requestDeleteFile(resourceId) {
    console.log('=== requestDeleteFile ===');
     var url = '/project/in/' + projectId + '/resource/delete/' + resourceId;
    // var getting = $.get(url);
    // getting.done(function (data) {
    //   console.log("DeleteResource publishing");
    //   PubSub.publish("DeleteResource", data);
    // });
    io.socket.get(url, function (resData, jwres){
      console.log("DeleteResource publishing");
      PubSub.publish("DeleteResource", resData);
      PubSub.publish('DeleteFileEvent');
      PubSub.publish('DeleteTab', resData.id);
      var data = {resource: resData, action: 'deleted'};
      PubSub.publish("addNewActivity", data);
    });
  }

  function requestDownloadFile(resourceId) {
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

  function requestGenerateCode(resourceId) {
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

  function requestCreateActivity(msg, data) {
    var url = '/project/in/' + projectId + '/activity/new';
    console.log('==== requestCreateActivity ====');
    console.log('data.action : ' + JSON.stringify(data.action));

    var activityData = {
      project: projectId,
      user: userId,
      action: data.action,
      resourceUrl: data.resource.url,
      resourceType: data.resource.resourceType,
      date: new Date()
    };
    // var posting = $.post(url, { data: activityData });
    // posting.done(function (data) {
    //   console.log('##### in ProjectExplorer post activity/new #####');
    // });
    io.socket.post(url, { data: activityData }, function (resData, jwres){
      console.log('##### in ProjectExplorer post activity/new #####');
    });
  }

  var ProjectExplorer = React.createClass({
    getInitialState: function () {
      return ({
        //myMap: myMap,
        //undoDataMap: undoDataMap,
        //redoDataMap: redoDataMap,
        //tabTitleMap: tabTitleMap,
        data: {
          name: projectName,
          resourceType: 'project',
          level: 0,
          children: [],
          treeNodeExpanded: false
        },
        resourceType: "",
        trigger: "",
        resourceID: ""
      });
    },

    componentWillMount: function () {
      var self = this;
      var url = '/project/in/' + projectId + '/resource/tree';

      $.getJSON(url, function (project) {
        console.log("Resource Tree");
        console.log(JSON.stringify(project));
        project.children = project.resources;
        self.setState({ data: project, resourceType: "", trigger: "", resourceID: "", resourceFetched: true });
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
        console.log('>>>>> projectExplorer new-resource socket.on >>>>>');
        PubSub.publish("AddFile", data);
      });

      io.socket.on('delete-resource', function (data) {
        console.log("DeleteSocketBroadCast");
        console.log(JSON.stringify(data));
        // PubSub.publish('DeleteFileEvent');
        PubSub.publish('DeleteTab', data.id);
        PubSub.publish("DeleteResource", data);
      });

      io.socket.on('changed-resource', function (data) {
        PubSub.publish("updatedResource", data.id);
      });

      $('#refreshID').on('click', function (event) {
        event.preventDefault();
        var updatedDtData = self.state.dtData;
        var fileId = self.state.fileId;
        url = "/project/in/" + projectName + "/resource/data/" + resourceID;
        console.log("refresh url = " + url);
        console.log("*** resourceID *** " + resourceID);

        $.getJSON(url, function (data) {
          console.log('ok, got data from refresh');
          //self.state.myMap.set(resourceID, data);
          //self.state.undoDataMap.set(resourceID, []);
          //self.state.redoDataMap.set(resourceID, []);
          //var undoStack = self.state.undoDataMap.get(resourceID);
          //var redoStack = self.state.redoDataMap.get(resourceID);
          //var dtData = self.state.myMap.get(resourceID);
          app.fileDataMap.set(resourceID, data);
          app.undoDataMap.set(resourceID, []);
          app.redoDataMap.set(resourceID, []);
          PubSub.publish('ClickFileEvent', { fileId: resourceID});
          PubSub.publish("refreshedResource", resourceID);
        });
      });

      $.contextMenu({
        selector: '.context-menu-file',
        callback: function (key, options) {
          //self.setState({ resourceType: trigger });
          var resourceId = self.state.resourceID;
          if (key == "delete") {
            requestDeleteFile(resourceId);
          } else if (key == "download") {
            requestDownloadFile(resourceId);
          } else if (key == "generate-code") {
            requestGenerateCode(resourceId);
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

      $.contextMenu({
        selector: '.context-menu-parent',
        callback: function (key, options) {
          self.setState({ resourceType: key });
          var resourceId = self.state.resourceID;
          if (key == "file" || key == "folder") {
            dialog.dialog("open");
          } else if (key == "delete") {
            requestDeleteFile(resourceId);
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

      PubSub.subscribe("ResourceNewFormSubmit", function() {
       self.submitResourceAddForm();
      });

      PubSub.subscribe("addNewActivity", requestCreateActivity);

    },

    onSelect: function (node, resourceID, resourceName) {
      var self = this;
      var projectName = this.state.data.name;

      this.setState({ resourceID: resourceID });

      if (this.state.selected && this.state.selected.isMounted()) {
        this.state.selected.setState({ selected: false });
      }

      this.setState({ selected: node });
      node.setState({ selected: true });

      // if (preDiv) {
      //   preDiv.style.backgroundColor = "#D1D0CE"; //backgroundColor
      //   event.target.style.backgroundColor = "#A9A9A9"; //selectedColor
      //   }
      // preDiv = event.target;

      if (app.fileDataMap.has(resourceID)) {
          console.log("Key is exists");
          //var dtData = self.state.myMap.get(resourceID);
          //var undoStack = self.state.undoDataMap.get(resourceID);
          //var redoStack = self.state.redoDataMap.get(resourceID);
          var tabTitle = app.tabTitleMap.get(resourceID);
          PubSub.publish("ClickFileOpenEvent", {title: tabTitle, currentID: resourceID});
          PubSub.publish('ClickFileEvent', { fileId: resourceID});
        } else {
          console.log("---no key---");
          url = "/project/in/" + projectName + "/resource/data/" + resourceID;
          $.getJSON(url, function (data) {
            console.log('ok, got data');
            app.fileDataMap.set(resourceID, data);
            app.undoDataMap.set(resourceID, []);
            app.redoDataMap.set(resourceID, []);
            app.tabTitleMap.set(resourceID, resourceName);
            var tabTitle = app.tabTitleMap.get(resourceID);
            PubSub.publish("ClickFileOpenEvent", {title: tabTitle, currentID: resourceID});
            PubSub.publish('ClickFileEvent', { fileId: resourceID});
            PubSub.publish("refreshedResource", resourceID);
          });
        }
        console.log("===file clicked=== ");
    },

    submitResourceAddForm: function () {
      var resourceName = $('#resourceID').val();
      if (resourceName) {
        var resourceType = this.state.resourceType;
        var resourceID = this.state.resourceID;
        console.log("submitResourceAddForm resourceID = " + resourceID);
        var url = '/project/in/' + projectId + '/resource/new';
        // var posting = $.post(url, { resourceName: resourceName, resourceType: resourceType, nodeID: resourceID });
        // posting.done(function (data) {
        //   console.log('##### in projectExplorer post resource/new #####');
        //   PubSub.publish("AddFile", data);
        // });
        var data = { resourceName: resourceName, resourceType: resourceType, nodeID: resourceID, userId: userId };
        io.socket.post(url, data, function (resData, jwres){
          console.log('##### in projectExplorer post resource/new #####');
          console.log('data : ' + JSON.stringify(resData));
          PubSub.publish("AddFile", resData);
          var data = {resource: resData, action: 'created'};
          PubSub.publish("addNewActivity", data);
        });
      }
      dialog.dialog("close");
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
        resourceFetched: false,
        updated: false,
        selected: false
      };
    },

    onResourceSelect: function (event) {
      console.log("onResourceSelect*****");
      var fileId = this.props.data.id;
      var fileName = this.props.data.name;
      console.log(this.props.data.name.endsWith('.js'));
      app.fileInfoMap.set(parseInt(fileId), fileName);
      console.log("End of onResourceSelect*****");
      if (this.props.onResourceSelect) {
        resourceID = event.target.getAttribute('id');
        resourceName = this.props.data.name;
        this.props.onResourceSelect(this, resourceID, resourceName);
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
      if (this.props.data.resourceType == 'file') {
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
      console.log('children : ' + JSON.stringify(children));
      console.log("End of Add Child File");
    },

    changeSelectedFile: function(msg, data) {
      console.log(" changeSelectedFile ");
      if(data.resourceId == this.props.data.id) {
      this.setState({selected: true});
      } else {
      this.setState({selected: false});
      }
    },

    changeUpdatedState: function(msg, resourceId) {
      console.log(" ");
      console.log("changeUpdatedState");
      if(resourceId == this.props.data.id){
        this.setState({updated: true});
      }
      // else {
      //   this.setState({updated: false});
      // }
    },

    resetUpdatedState: function(msg, resourceId) {
      console.log(" ");
      console.log("resetUpdatedState");
      if(resourceId == this.props.data.id){
        this.setState({updated: false});
      }
    },

    componentDidMount: function () {
      PubSub.subscribe("AddFile", this.addChildFile);
      PubSub.subscribe("DeleteResource", this.removeChildFile);
      PubSub.subscribe("SelectTabEvent", this.changeSelectedFile);
      PubSub.subscribe("refreshedResource", this.resetUpdatedState);
      PubSub.subscribe("updatedResource", this.changeUpdatedState);
    },

    render: function () {
      var self = this;
      var resourceIcon;
      if (!this.state.children) this.state.children = [];
      if (!this.state.displayingChildren) this.state.displayingChildren = [];

      var classes = classnames({
        'has-children': (this.props.data.resourceType != 'file' ? true : false),
        'open': (this.state.displayingChildren.length ? true : false),
        'closed': (this.state.displayingChildren ? false : true)
      });

      var classes1 = classnames({
      'selected': (this.state.selected ? true : false),
      'updated' : (this.state.updated ? true : false),
      'context-menu-file' : (this.props.data.resourceType == 'file'),
      'context-menu-parent' : (this.props.data.resourceType !== 'file')
      })
      //
      // var contextMenuClassName;
      // if (this.props.data.resourceType == 'file') {
      //   contextMenuClassName = "context-menu-file";
      // }
      // else {
      //   contextMenuClassName = "context-menu-parent";
      // }

      if (this.props.data.resourceType == "file") {
        resourceIcon = <i className="fa fa-file-text-o" aria-hidden="true"></i>;
      } else if (this.props.data.resourceType == "folder") {
        resourceIcon = <i className="fa fa-folder-o" aria-hidden="true"></i>;
      }
      return (
        <li ref="node" className={classes} onClick={this.onChildDisplayToggle}>
          <a onClick={this.onResourceSelect} id={this.props.data.id} className={classes1}> {resourceIcon}&nbsp; {this.props.data.name}</a>
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
