define(['react', 'jquery', 'jquery.ui', 'bootstrap'], function (React, $) {
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
        fileId: ""
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
    };

    handleFileClick(msg, data) {
      console.log("handleFileClick....");
      this.setState({ dtData: data.dtData });
      this.setState({ fileId: data.fileId });
      console.log("this.state.dtData = " + JSON.stringify(this.state.dtData));
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
      $('#saveID').on('click', function (event) {
        event.preventDefault();
        var url = '/project/in/' + self.state.projectName + '/file/save';
        console.log("===url=== " + url);
        var updatedDtData = self.state.dtData;
        var fileId = self.state.fileId;
        var posting = $.post(url, { dtData: updatedDtData, fileId: fileId });
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
      var numberOfRules = this.state.dtData.rules.length;
      if (numberOfRules > 1) {
        dtData.rules.splice(activeRuleIndex, 1);
      }
      this.setState({ dtData: dtData });
    }

    deleteRow() {
      var index = this.state.activeCellInfo.modelIndex;
      var activeCellType = this.state.activeCellInfo.cellType;
      var numberOfRules = this.state.dtData;
      var dtData = this.state.dtData;
      if (activeCellType === 'condition' || activeCellType === 'ruleCondition') {
        dtData.names.conditions.splice(index, 1);
        for (var i = 0; i < numberOfRules; i++) {
          dtDatas.rules[i].conditions.splice(index, 1);
        }
      }
      else if (activeCellType === 'action' || activeCellType === 'ruleAction') {
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
      this.forceUpdate();
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
