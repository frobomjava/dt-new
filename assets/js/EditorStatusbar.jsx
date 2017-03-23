define(['react', 'PubSub'], function (React, PubSub) {
  var EditorStatusBar = React.createClass({
    getInitialState: function () {
        return ({
          tabList: [],
          tabContentList: [],
          currentID: ""
        });
    },

    componentDidMount: function () {
      PubSub.subscribe("ClickFileOpenEvent", this.handleFileClick);
      PubSub.subscribe("DeleteTab", this.handleTabDelete);
    },

    handleTabDelete: function(msg, resourceId){
      console.log(" ");
      console.log("handleFileDelete editor bar");
      console.log("resourceId = " + resourceId);
      var updatedTabList = this.state.tabList.slice();
      var updatedTabContentList = this.state.tabContentList.slice();
      for(var i=0; i<updatedTabList.length; i++){
        var tabID = updatedTabList[i].id;
        if(tabID == resourceId){
          updatedTabList.splice(i, 1);
          updatedTabContentList.splice(i, 1);
          this.setState({ tabList: updatedTabList });
          this.setState({ tabContentList: updatedTabContentList});
          PubSub.publish('DeleteFileEvent');
          console.log("End of Tab and Content Delete");

          var tabCount = updatedTabList.length;
          var tabIndex = i;
          if(tabCount != 0){
            this.refreshContentComponent(tabIndex);
          }
        }
      }
    },

    refreshContentComponent: function(tabIndex){
      console.log(" ");
      console.log("refreshContentComponent");
      var tab = this.state.tabList.slice();
      var index;
      var tabID;
      if (tabIndex > 0) {
        index = --tabIndex;
        tabID = tab[index].id;
        this.handleTabClick(index, tabID);
      } else {
        index = tabIndex;
        tabID = tab[index].id;
        this.handleTabClick(index, tabID);
      }
    },

    handleFileClick(msg, data) {
      var isExists = false;
      var updatedTabList = this.state.tabList.slice();
      var updatedTabContentList = this.state.tabContentList.slice();
      this.setState({currentID: data.currentID});
      if (!updatedTabList.length) {
        updatedTabList.push({ 'id': data.currentID, 'title': data.title });
        updatedTabContentList.push({'content': data.content, 'undoStack': data.undoStack, 'redoStack': data.redoStack});
        this.setState({ tabList: updatedTabList});
        this.setState({ tabContentList: updatedTabContentList});
      } else {
        updatedTabList.some( function(tab) {
          if( tab.id === data.currentID ) {
            isExists = true;
            return true;
          }
        });
        if(!isExists) {
          updatedTabList.push({ 'id': data.currentID, 'title': data.title });
          updatedTabContentList.push({'content': data.content, 'undoStack': data.undoStack, 'redoStack': data.redoStack});
        }
        this.setState({ tabList: updatedTabList});
        this.setState({ tabContentList: updatedTabContentList});
      }
    },

    handleTabClick: function (index, id) {
      console.log("Handle Tab Click");
      var dtData = this.state.tabContentList[index].content;
      var undoStack = this.state.tabContentList[index].undoStack;
      var redoStack = this.state.tabContentList[index].redoStack;
      this.setState({currentID: id});
      PubSub.publish("ClickTabEvent", { fileId: id, dtData: dtData, undoStack: undoStack, redoStack: redoStack });
      PubSub.publish("SelectTabEvent", {resourceId: id});
    },

    render: function () {
      return(
        <TabTitle tab={this.state.tabList} currentID={this.state.currentID} onClick={this.handleTabClick} />
      );
    }
  });

  var TabTitle = React.createClass({
    onTabClick: function (event) {
      event.preventDefault();
      console.log("*****onTabClick *****");
      var tabIndex = event.target.getAttribute('id');
      var tabID = event.target.getAttribute('data-id');
      this.props.onClick(tabIndex,tabID);
    },

    render: function () {
      var self = this;
        if (!this.props.tab.length && !this.props.currentID) {
          return(
            <div id="tabBar">
            </div>
          );
        }
        else {
          return(
            <div id="tabBar">
            {
              self.props.tab.map(function(tab,i) {
                var activeClass;
                if( tab.id === self.props.currentID){
                  activeClass = 'active';
                } else {
                  activeClass = '';
                }
              return(<a onClick={self.onTabClick} id={i} className={activeClass} data-id={tab.id}>{tab.title}</a>)
              })
            }
            </div>
          );
       }
    }
  });
  return EditorStatusBar;
});
