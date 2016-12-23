var preDiv = null;
var fileName, fileId, index, url, projName, filesUpdated;

define(['react', 'jquery', 'jquery.ui', 'bootstrap', 'PubSub'], function (React, $) {
  var DTFileList = React.createClass({
    getInitialState: function(){
      return ({
        files: [],
        projectName: projectName,
        myMap: myMap
      });
    },

    componentWillMount: function() {
      var self = this;
      var projectName = this.state.projectName;
      var url = '/project/in/'+projectName+'/files'

      $.getJSON(url, function (data) {
        console.log('ok, got data');
        self.setState({files: data});
      });

      function addDtFile() {
        var fileName = $('#fileID').val();
        if (fileName) {
          console.log("---file create handler---");
          var url = '/project/in/'+projectName+'/file/new';
          var posting = $.post(url,{fileName: fileName});
          posting.done(function(data) {
            if (data.fileName) {
              console.log(data.fileName);
              var filesUpdated = self.state.files.slice();
              filesUpdated.push(data);
              self.setState({files: filesUpdated});
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
          "Create": addDtFile,
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
        addDtFile();
      });

      $( "#file-create" ).button().on( "click", function() {
        dialog.dialog( "open" );
      });
    },

    handleClick: function(event) {
      event.preventDefault();
      var self = this;
      projName = this.state.projectName;
      filesUpdated = this.state.files.slice();
      fileName = event.target.getAttribute('name');
      fileId = event.target.getAttribute('value');
      index = event.target.getAttribute('id');

      if(preDiv) {
        preDiv.style.backgroundColor = "white";
      }
      event.target.style.backgroundColor = "#87CEEB";
      preDiv = event.target;

      if(self.state.myMap.has(fileId)){
        var dtData = self.state.myMap.get(fileId);
        console.log("---map has key-value--- " + JSON.stringify(dtData));
        PubSub.publish('ClickFileEvent',{fileId: fileId, dtData: dtData});
      } else {
        console.log("---no key---");
        url = "/project/in/"+projName+"/file/data/"+fileId;
        $.getJSON(url, function (data) {
          console.log('ok, got data');
          self.state.myMap.set(fileId,data);
          var dtData = self.state.myMap.get(fileId);
          PubSub.publish('ClickFileEvent',{fileId: fileId, dtData: dtData});
        });
      }

      $(function($){
        $.contextMenu({
          selector: '.file-context-menu-one',
          callback: function(key, options) {
            deleteHandler();
          },
          items: {
            "Delete": {name: "delete", icon: "delete"}
          }
        });

        function deleteHandler(){
          var url = '/project/in/'+projName+'/file/delete/'+fileId;
          console.log('===delete url=== ' + url);
          var getting = $.get(url);
          getting.done(function() {
            filesUpdated.splice(index, 1);
            self.setState({files: filesUpdated});
            PubSub.publish('DeleteFileEvent');
          });
        }
      });
    },

    render: function() {
      var self = this;
      return (
        <ul>
        {this.state.files.map(function (file, index) {
          return(
            <li key={index} className="file-context-menu-one" onClick={self.handleClick} id={index} value={file.id} name={file.fileName}>
            {file.fileName}
            </li>
          )
        })}
        </ul>
      );
    }
  });
  return DTFileList;
}
);
