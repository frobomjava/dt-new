define(['react', 'jquery', 'jquery.ui', 'bootstrap'], function (React, $) {
  var undoCount = 0;
  var redoCount = 0;

  class CellInfo {
    constructor(cellType, modelIndex, value) {
      this.cellType = cellType;
      this.modelIndex = modelIndex; // Condition or action index
    }
  }

  class Theader extends React.Component {
    render() {
      var ruleHeaders = [];
      for (var i = 0; i < this.props.numberOfRules; i++) {
        ruleHeaders.push(<th key={i}>{i + 1}</th>);
      }
      console.log('25 New DecisionTable');
      return (
        <thead>
          <tr>
            <th></th>
            <th></th>
            {ruleHeaders}
          </tr>
        </thead>
      );
    }
  }

  class ConditionCells extends React.Component {
    constructor(props) {
      super(props);
    }
    render() {
      return (
        <tbody>
          {
            this.props.conditions.map((conData, conIndex) => {
              return (
                <tr key={conIndex}>
                  <th>{conIndex + 1}</th>

                  <Cell cellInfo={new CellInfo("condition", conIndex)}
                    value={conData} handleCellValueChange={this.props.handleCellValueChange} handleCellFocusChange={this.props.handleCellFocusChange} />
                  {
                    this.props.rules.map((ruleConData, ruleIndex) => {
                      return (
                        <Cell key={ruleIndex} cellInfo={new CellInfo("ruleCondition", conIndex)} ruleIndex={ruleIndex}
                          value={ruleConData.conditions[conIndex]} handleCellValueChange={this.props.handleCellValueChange} handleCellFocusChange={this.props.handleCellFocusChange} />
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
  }

  class ActionCells extends React.Component {
    constructor(props) {
      super(props);
    }
    render() {
      return (
        <tbody>
          {
            this.props.actions.map((actionData, actionIndex) => {
              return (
                <tr key={actionIndex}>
                  <th>{actionIndex + 1}</th>
                  <Cell cellType="action" cellInfo={new CellInfo("action", actionIndex)} index={actionIndex}
                    value={actionData} handleCellValueChange={this.props.handleCellValueChange} handleCellFocusChange={this.props.handleCellFocusChange} />

                  {
                    this.props.rules.map((ruleActionData, ruleIndex) => {
                      return (
                        <Cell key={ruleIndex} cellInfo={new CellInfo("ruleAction", actionIndex)} ruleIndex={ruleIndex}
                          value={ruleActionData.actions[actionIndex]} handleCellValueChange={this.props.handleCellValueChange} handleCellFocusChange={this.props.handleCellFocusChange} />
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
  }

  class Cell extends React.Component {
    constructor(props) {
      super(props);
      this.handleValueChanged = this.handleValueChanged.bind(this);
      this.handleFocusChanged = this.handleFocusChanged.bind(this);
    }
    render() {
      return (
        <td><input className="context-menu-one" type="text" value={this.props.value} onChange={this.handleValueChanged} onFocus={this.handleFocusChanged} /></td>
      );
    }

    handleValueChanged(event) {
      this.props.handleCellValueChange(event.target.value);
    }

    handleFocusChanged(event) {
      this.props.handleCellFocusChange(this.props.cellInfo, this.props.ruleIndex);
    }

  }

  class DecisionTable extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        dtData: {
          names: {
            conditions: [],
            actions: []
          },

          rules: [
            {
              conditions: [],
              actions: []
            },
          ]
        },

        activeRuleIndex: '',
        activeCellInfo: null,
        projectName: projectName,
        fileId: "",
        undoStack: [],
        redoStack: []
      }
      this.handleFileClick = this.handleFileClick.bind(this);
      this.handleFileDelete = this.handleFileDelete.bind(this);
      this.handleDtCommand = this.handleDtCommand.bind(this);
      this.handleCellValueChange = this.handleCellValueChange.bind(this);
      this.handleCellFocusChange = this.handleCellFocusChange.bind(this);
      this.createNewRule = this.createNewRule.bind(this);
    };

    componentWillMount() {
      PubSub.subscribe("ClickFileEvent", this.handleFileClick);
      PubSub.subscribe("DeleteFileEvent", this.handleFileDelete);
      PubSub.subscribe("dtCommand", this.handleDtCommand);
      PubSub.subscribe("ClickTabEvent", this.handleFileClick);
    };

    handleFileClick(msg, data) {
      console.log("handleFileClick....");
      console.log("file id is " + data.fileId);
      this.setState({ dtData: data.dtData });
      this.setState({ fileId: data.fileId });
      this.setState({ undoStack: data.undoStack });
      this.setState({ redoStack: data.redoStack });
      undoCount = this.state.undoStack.length;
      redoCount = this.state.redoStack.length;
    };

    handleFileDelete(msg, data) {
      console.log("===delete file handler msg=== " + msg);
      var resetData = {
        names: {
          conditions: [],
          actions: []
        },

        rules: [
          {
            conditions: [],
            actions: []
          },
        ]
      }
      this.setState({ dtData: resetData });
    }

    componentDidMount() {
      var self = this;
      console.log('DecisionTable.jsx userName : ' + userName);
      $('#saveID').on('click', function (event) {
        event.preventDefault();
        var updatedDtData = self.state.dtData;
        var fileId = self.state.fileId;
        var url = '/project/in/' + projectId + '/resource/save/' + fileId;
        //var posting = $.post(url, { data: updatedDtData });
        console.log('userName : ' + userName);
        io.socket.post(url, { data: updatedDtData, userName: userName }, function (resData, jwres){});
      });

      $('#undoID').on('click', function (event){
        event.preventDefault();
        var updatedDtData = self.state.dtData;
        var popedDtData;
        if(undoCount > 0) {
          popedDtData = self.state.undoStack.pop();
          undoCount--;

          var updateRedoStack = self.state.redoStack;
          updateRedoStack.push(updatedDtData);
          self.setState({redoStack: updateRedoStack});
          redoCount = self.state.redoStack.length;

          updatedDtData = popedDtData;
          self.setState({dtData: updatedDtData});
          myMap.set(self.state.fileId, updatedDtData);
        }
      });

      $('#redoID').on('click', function (event){
        event.preventDefault();
        var updatedDtData = self.state.dtData;
        var popedDtData;
        if(redoCount > 0 ) {
          popedDtData = self.state.redoStack.pop();
          redoCount--;

          var updateUndoStack = self.state.undoStack;
          updateUndoStack.push(updatedDtData);
          self.setState({undoStack: updateUndoStack});
          undoCount = self.state.undoStack.length;

          updatedDtData = popedDtData;
          self.setState({dtData: updatedDtData});
          myMap.set(self.state.fileId, updatedDtData);
        }
      });

      $(function ($) {
        $.contextMenu({
          selector: '.context-menu-one',
          callback: function (key, options) {
            var m = "clicked: " + key;
            console.log(m);
            PubSub.publish('dtCommand', key);
          },
          items: {
            "add-column-right": { name: "Add Column Right", icon: "add" },
            "add-column-left": { name: "Add Column Left", icon: "add" },
            "delete-column": { name: "Delete Column", icon: "delete" },
            "sep1": "---------",
            "add-row-above": { name: "Add Row Above", icon: "add" },
            "add-row-below": { name: "Add Row Below", icon: "add" },
            "delete-row": { name: "Delete Row", icon: "delete" },
            "sep2": "---------",
            "quit": {
              name: "Quit", icon: function () {
                return 'context-menu-icon context-menu-icon-quit';
              }
            }
          }
        });
      });
    };

    handleDtCommand(msg, command) {
      switch (command) {
        case "add-column-right": this.addColumnRightToActiveCell();
          break;
        case "add-column-left": this.addColumnLeftToActiveCell();
          break;
        case "delete-column": this.deleteColumn();
          break;
        case "add-row-above": this.addRowAboveActiveCell();
          break;
        case "add-row-below": this.addRowBelowActiveCell();
          break;
        case "delete-row": this.deleteRow();
      }
    };

    addColumnRightToActiveCell() {
      var activeRuleIndex = this.state.activeRuleIndex;
      var dtData = this.state.dtData;
      var dtDatas = JSON.parse(JSON.stringify(dtData));
      this.createUndoStack(dtDatas);
      dtData.rules.splice(++activeRuleIndex, 0, this.createNewRule());
      this.setState({ dtData: dtData });
    }

    addColumnLeftToActiveCell() {
      var activeCellType = this.state.activeCellInfo.cellType;
      if (activeCellType === 'condition' || activeCellType === 'action') {
        alert('Cannot add column Left here..');
        return;
      }
      var dtData = this.state.dtData;
      var dtDatas = JSON.parse(JSON.stringify(dtData));
      this.createUndoStack(dtDatas);
      dtData.rules.splice(this.state.activeRuleIndex, 0, this.createNewRule());
      this.setState({ dtData: dtData });
    }

    addRowAboveActiveCell() {
      var index = this.state.activeCellInfo.modelIndex;
      this.addRow(index);
    }

    addRowBelowActiveCell() {
      var index = this.state.activeCellInfo.modelIndex;
      index++;
      this.addRow(index);
    }

    addRow(index) {
      var dtData = this.state.dtData;
      var numberOfRules = this.state.dtData.rules.length;
      var activeCellType = this.state.activeCellInfo.cellType;
      var dtDatas = JSON.parse(JSON.stringify(dtData));
      this.createUndoStack(dtDatas);
      if (activeCellType === 'condition' || activeCellType === 'ruleCondition') {
        dtData.names.conditions.splice(index, 0, "");
        for (var i = 0; i < numberOfRules; i++) {
          dtData.rules[i].conditions.splice(index, 0, "");
        }
      }
      else if (activeCellType === 'action' || activeCellType === 'ruleAction') {
        dtData.names.actions.splice(index, 0, "");
        for (var i = 0; i < numberOfRules; i++) {
          dtData.rules[i].actions.splice(index, 0, "");
        }
      }
      this.setState({ dtData: dtData });
    }

    deleteColumn() {
      console.log("delete column");
      var activeRuleIndex = this.state.activeRuleIndex;
      var dtData = this.state.dtData;
      var dtDatas = JSON.parse(JSON.stringify(dtData));
      this.createUndoStack(dtDatas);
      var numberOfRules = this.state.dtData.rules.length;
      if (numberOfRules > 1) {
        dtData.rules.splice(activeRuleIndex, 1);
      }
      this.setState({ dtData: dtData });
    }

    deleteRow() {
      var index = this.state.activeCellInfo.modelIndex;
      var activeCellType = this.state.activeCellInfo.cellType;
      var numberOfRules = this.state.dtData.rules.length;
      var numberOfConditions = this.state.dtData.names.conditions.length;
      var numberOfActions = this.state.dtData.names.actions.length;
      var dtData = this.state.dtData;
      var dtDatas = JSON.parse(JSON.stringify(dtData));
      this.createUndoStack(dtDatas);
      if (numberOfConditions > 1 && (activeCellType === 'condition' || activeCellType === 'ruleCondition')) {
        dtData.names.conditions.splice(index, 1);
        for (var i = 0; i < numberOfRules; i++) {
          dtData.rules[i].conditions.splice(index, 1);
        }
      }
      else if (numberOfActions > 1 && (activeCellType === 'action' || activeCellType === 'ruleAction')) {
        dtData.names.actions.splice(index, 1);
        for (var i = 0; i < numberOfRules; i++) {
          dtData.rules[i].actions.splice(index, 1);
        }
      }
      this.setState({ dtData: dtData });
    }

    createNewRule() {
      var newRule = {
        conditions: [],
        actions: []
      };

      for (var con = 0; con < this.state.dtData.names.conditions.length; con++) {
        newRule.conditions.splice(con, 0, "");
      }
      for (var act = 0; act < this.state.dtData.names.actions.length; act++) {
        newRule.actions.splice(act, 0, "");
      }
      return newRule;
    }

    handleCellFocusChange(cellInfo, ruleIndex) {
      this.setState({ activeCellInfo: cellInfo });
      this.setState({ activeRuleIndex: ruleIndex });
    }

    handleCellValueChange(cellValue) {
      var dtDatas = this.state.dtData;
      var index = this.state.activeCellInfo.modelIndex;
      var ruleIndex = this.state.activeRuleIndex;
      var cellType = this.state.activeCellInfo.cellType;
      var dtData = JSON.parse(JSON.stringify(dtDatas));
      this.createUndoStack(dtData);
      switch (cellType) {
        case 'condition': dtDatas.names.conditions[index] = cellValue;
          break;

        case 'action': dtDatas.names.actions[index] = cellValue;
          break;

        case 'ruleCondition': dtDatas.rules[ruleIndex].conditions[index] = cellValue;
          break;

        case 'ruleAction': dtDatas.rules[ruleIndex].actions[index] = cellValue;
          break;
      }
      this.setState({ dtData: dtDatas });
      myMap.set(this.state.fileId, dtDatas);
      this.forceUpdate();
    }

    createUndoStack(dtData) {
      var updateUndoStack = this.state.undoStack;
      updateUndoStack.push(dtData);
      this.setState({undoStack: updateUndoStack});
      undoCount = this.state.undoStack.length;
    }

    render() {
      if (this.state.dtData.names.conditions.length == 0) {
        return (
          <div />
        );
      } else {
        return (
          <table>
            <Theader numberOfRules={this.state.dtData.rules.length} />
            <ConditionCells conditions={this.state.dtData.names.conditions} rules={this.state.dtData.rules} handleCellValueChange={this.handleCellValueChange} handleCellFocusChange={this.handleCellFocusChange} />
            <ActionCells actions={this.state.dtData.names.actions} rules={this.state.dtData.rules} handleCellValueChange={this.handleCellValueChange} handleCellFocusChange={this.handleCellFocusChange} />
          </table>
        );
      }
    }
  }

  return DecisionTable;
}
);
