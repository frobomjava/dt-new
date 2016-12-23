define(['react', 'jquery', 'jquery.ui', 'bootstrap'], function (React, $) {
  var DecTable = class DtTableComponent extends React.Component{
    constructor(props){
      super(props);
      this.state = {
        dtData:{
          names:{
            conditions : [],
            actions : []
          },

          rules:[
            {
              conditions : [],
              actions : []
            },
          ]
        },

        currentIndex:{
          cellType:"",
          rowIndex:"",
          colIndex:""
        },

        projectName: projectName,
        fileId: ""
      }

      this.clickFileHandler = this.clickFileHandler.bind(this);
      this.deleteFileHandler = this.deleteFileHandler.bind(this);
      this.handler = this.handler.bind(this);
      this.addSubscribe = this.addSubscribe.bind(this);
      this.addRowColumn = this.addRowColumn.bind(this);
    };

    componentWillMount(){
      PubSub.subscribe( "ClickFileEvent", this.clickFileHandler );
      PubSub.subscribe( "DeleteFileEvent", this.deleteFileHandler );
      PubSub.subscribe( "contextMenuEvent", this.addSubscribe );
    };

    clickFileHandler(msg, data){
      this.setState({dtData: data.dtData});
      this.setState({fileId: data.fileId});
      console.log("this.state.dtData = " + JSON.stringify(this.state.dtData));
    };

    deleteFileHandler(msg,data){
      console.log("===delete file handler msg=== " + msg);
      var resetData = {
        names:{
          conditions : [],
          actions : []
        },

        rules:[
          {
            conditions : [],
            actions : []
          },
        ]
      }
      this.setState({dtData:resetData});
    }

    componentDidMount(){
      var self = this;
      $('#saveID').on('click',function(event){
        event.preventDefault();
        var url = '/project/in/'+self.state.projectName+'/file/save';
        console.log("===url=== " + url);
        var updatedDtData = self.state.dtData;
        var fileId = self.state.fileId;
        var posting = $.post(url,{dtData: updatedDtData , fileId: fileId});
      })

    };

    addSubscribe(msg,data){
      var cellType = this.state.currentIndex.cellType;
      var columnIndex = this.state.currentIndex.colIndex;
      var rowIndex = this.state.currentIndex.rowIndex;
      this.addRowColumn(rowIndex,columnIndex,cellType,data);
    };

    handler(cellType,index,value,ruleIndex) {

      var dtDatas = this.state.dtData;
      var currentIndex = this.state.currentIndex;

      currentIndex.cellType = cellType;
      currentIndex.rowIndex = index;
      currentIndex.colIndex = ruleIndex;

      switch (cellType)
      {
        case 'condition' : dtDatas.names.conditions[index] = value;
        break;

        case 'action' : dtDatas.names.actions[index] = value;
        break;

        case 'ruleCondition' : dtDatas.rules[ruleIndex].conditions[index] = value;
        break;

        case 'ruleAction' : dtDatas.rules[ruleIndex].actions[index] = value;
        break;
      }

      this.setState({dtData:dtDatas});
      this.setState({currentIndex : currentIndex});
    }

    addRowColumn(rowIndex,columnIndex,cellType,data){

      var dtDatas = this.state.dtData;
      var columnLength = this.state.dtData.rules.length;
      var conditionsLength = this.state.dtData.names.conditions.length;
      var actionsLength = this.state.dtData.names.actions.length;

      var newRule = {
        conditions :[] ,
        actions : []
      };

      for(var con = 0; con < conditionsLength; con++){
        newRule.conditions.splice(con,0,"");
      }
      for(var act = 0; act < actionsLength; act++){
        newRule.actions.splice(act,0,"");
      }

      if(data == "Add Column Right"){
        columnIndex++;
        dtDatas.rules.splice(columnIndex, 0, newRule);

      }else if(data == "Add Column Left"){
        console.log("===Add Column Left===");
        if (cellType === 'condition' || cellType === 'action') {
          alert('Cannot add column Left here..');
          return;
        }
        dtDatas.rules.splice(columnIndex, 0, newRule);

      }else if(data == "Delete Column" && columnLength != 1){
        dtDatas.rules.splice(columnIndex, 1);
      }else if(data == "Add Row Above" && (cellType == "condition" || cellType == "ruleCondition")){

        dtDatas.names.conditions.splice(rowIndex,0,"");
        for(var i=0; i< columnLength; i++){
          dtDatas.rules[i].conditions.splice(rowIndex,0,"");
        }

      }else if(data == "Add Row Below" && (cellType == "condition" || cellType == "ruleCondition")){

        rowIndex++;
        dtDatas.names.conditions.splice(rowIndex,0,"");
        for(var i=0; i< columnLength; i++){
          dtDatas.rules[i].conditions.splice(rowIndex,0,"");
        }

      }else if(data == "Add Row Above" && (cellType == "action" || cellType == "ruleAction")){

        dtDatas.names.actions.splice(rowIndex,0,"");
        for(var i=0; i< columnLength; i++){
          dtDatas.rules[i].actions.splice(rowIndex,0,"");
        }

      }else if(data == "Add Row Below" && (cellType == "action" || cellType == "ruleAction")){

        rowIndex++;
        dtDatas.names.actions.splice(rowIndex,0,"");
        for(var i=0; i< columnLength; i++){
          dtDatas.rules[i].actions.splice(rowIndex,0,"");
        }

      }else if(data == "Delete Row" && (cellType == "condition" || cellType == "ruleCondition") && conditionsLength != 1){

        dtDatas.names.conditions.splice(rowIndex,1);
        for(var i=0; i< columnLength; i++){
          dtDatas.rules[i].conditions.splice(rowIndex,1);
        }

      }else if(data == "Delete Row" && (cellType == "action" || cellType == "ruleAction") && actionsLength != 1){

        dtDatas.names.actions.splice(rowIndex,1);
        for(var i=0; i< columnLength; i++){
          dtDatas.rules[i].actions.splice(rowIndex,1);
        }

      }
      this.setState({dtData:dtDatas});
      console.log(JSON.stringify(this.state.dtData));

    }

    render(){
      if (this.state.dtData.names.conditions.length == 0) {
        return(
          <div/>
        );
      } else {
        return(
        <table>
        <Theader myRuleIndex={this.state.dtData.rules}/>
        <Condition myCondition={this.state.dtData.names.conditions} myConRule={this.state.dtData.rules} callbackParent={this.handler}/>
        <Action myAction={this.state.dtData.names.actions} myActionRule={this.state.dtData.rules} callbackParent={this.handler}/>
        </table>
      );
      }
     
    }
  }

  class Theader extends React.Component{
    render(){
      return(
        <thead>
        <tr>
        <th></th>
        <th></th>
        {this.props.myRuleIndex.map((rule,index) => {
          return(
            <th>{index+1}</th>
          );
        })}
        </tr>
        </thead>
      );
    }
  }

  class Condition extends React.Component{
    constructor(props){
      super(props);
      this.conditionHandler = this.conditionHandler.bind(this);
    }
    render(){
      return(
        <tbody>
        {
          this.props.myCondition.map((conData, conIndex) => {
            return (
              <tr key={conIndex}>
              <th>{conIndex+1}</th>

              <Cell cellType="condition" index={conIndex} value={conData} callbackChild={this.conditionHandler}/>
              {
                this.props.myConRule.map((ruleConData, ruleIndex) => {
                  return(
                    <Cell cellType="ruleCondition" index={conIndex} ruleIndex={ruleIndex} value={ruleConData.conditions[conIndex]} callbackChild={this.conditionHandler}/>
                  );
                })
              }
              </tr>
            );
          })
        }
        </tbody>
      );
    }
    conditionHandler(cellType,index,value,ruleIndex){
      this.props.callbackParent(cellType,index,value,ruleIndex);
    }
  }

  class Action extends React.Component{
    constructor(props){
      super(props);
      this.actionHandler = this.actionHandler.bind(this);
    }
    render(){
      return(
        <tbody>
        {
          this.props.myAction.map((actionData, actionIndex) => {
            return (
              <tr key={actionIndex}>
              <th>{actionIndex+1}</th>
              <Cell cellType="action" index={actionIndex} value={actionData} callbackChild={this.actionHandler}/>

              {
                this.props.myActionRule.map((ruleActionData, ruleIndex) => {
                  return(
                    <Cell cellType="ruleAction" index={actionIndex} ruleIndex={ruleIndex} value={ruleActionData.actions[actionIndex]} callbackChild={this.actionHandler}/>
                  );
                })
              }
              </tr>
            );
          })
        }
        </tbody>
      );
    }

    actionHandler(cellType,index,value,ruleIndex){
      this.props.callbackParent(cellType,index,value,ruleIndex);
    }
  }

  class Cell extends React.Component{
    constructor(props){
      super(props);
      this.cellHandler = this.cellHandler.bind(this);
    }
    render(){
      return(
        <td><input className="context-menu-one" type="text" value={this.props.value} onChange={this.cellHandler} onFocus={this.cellHandler}/></td>
      );
    }
    cellHandler(event){
      var cellType = this.props.cellType;
      var index = this.props.index;
      var value = event.target.value;
      var ruleIndex = this.props.ruleIndex;
      this.props.callbackChild(cellType,index,value,ruleIndex);

      $(function($){
        $.contextMenu({
          selector: '.context-menu-one',
          callback: function(key, options) {
            var m = "clicked: " + key;
            //window.console && console.log(m) || alert(m);
            PubSub.publish( 'contextMenuEvent',key);
          },
          items: {
            "Add Column Right": {name: "Add Column Right", icon: "add"},
            "Add Column Left": {name: "Add Column Left", icon: "add"},
            "Delete Column": {name: "Delete Column", icon: "delete"},
            "sep1": "---------",
            "Add Row Above": {name: "Add Row Above", icon: "add"},
            "Add Row Below": {name: "Add Row Below", icon: "add"},
            "Delete Row": {name: "Delete Row", icon: "delete"},
            "sep2": "---------",
            "quit": {name: "Quit", icon: function(){
              return 'context-menu-icon context-menu-icon-quit';
            }}
          }
        });
      });
    }
  }
  return DecTable;
}
);
