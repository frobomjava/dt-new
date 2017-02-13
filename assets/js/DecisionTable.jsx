define(['react', 'jquery', 'jquery.ui', 'bootstrap'], function (React, $) {
  class CellInfo {
    constructor(cellType, modelIndex, value) {
      this.cellType = cellType;
      this.modelIndex = modelIndex; // Condition or action index
    }
  }

  class Theader extends React.Component {
    render() {
      console.log('23 New DecisionTable');
      return (
        <thead>
          <tr>
            <th></th>
            <th></th>
            {this.props.myRuleIndex.map((rule, index) => {
              return (
                <th>{index + 1}</th>
              );
            })}
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
                   value={conData} handleCellValueChanged={this.props.handleCellValueChanged} handleCellFocusChanged={this.props.handleCellFocusChanged} />
                  {
                    this.props.rules.map((ruleConData, ruleIndex) => {
                      return (
                        <Cell cellInfo={new CellInfo("ruleCondition", conIndex)} ruleIndex={ruleIndex} 
                        value={ruleConData.conditions[conIndex]} handleCellValueChanged={this.props.handleCellValueChanged} handleCellFocusChanged={this.props.handleCellFocusChanged} />
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
                  value={actionData} handleCellValueChanged={this.props.handleCellValueChanged} handleCellFocusChanged={this.props.handleCellFocusChanged}/>

                  {
                    this.props.rules.map((ruleActionData, ruleIndex) => {
                      return (
                        <Cell cellInfo={new CellInfo("ruleAction", actionIndex)} ruleIndex={ruleIndex} 
                        value={ruleActionData.actions[actionIndex]} handleCellValueChanged={this.props.handleCellValueChanged} handleCellFocusChanged={this.props.handleCellFocusChanged} />
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
      this.props.handleCellValueChanged(event.target.value);
    }

    handleFocusChanged(event) {
      this.props.handleCellFocusChanged(this.props.cellInfo, this.props.ruleIndex);
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

      this.handleFileClicked = this.handleFileClicked.bind(this);
      this.handleFileDeleted = this.handleFileDeleted.bind(this);
      this.handleDtCommand = this.handleDtCommand.bind(this);
      this.handleCellValueChanged = this.handleCellValueChanged.bind(this);
      this.handleCellFocusChanged = this.handleCellFocusChanged.bind(this);
      this.createNewRule = this.createNewRule.bind(this);
    };

    componentWillMount() {
      PubSub.subscribe("ClickFileEvent", this.handleFileClicked);
      PubSub.subscribe("DeleteFileEvent", this.handleFileDeleted);
      PubSub.subscribe("dtCommand", this.handleDtCommand);
    };

    handleFileClicked(msg, data) {
      console.log("handleFileClicked....");
      this.setState({ dtData: data.dtData });
      this.setState({ fileId: data.fileId });
      console.log("this.state.dtData = " + JSON.stringify(this.state.dtData));
    };

    handleFileDeleted(msg, data) {
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
            "Add Column Right": { name: "Add Column Right", icon: "add" },
            "Add Column Left": { name: "Add Column Left", icon: "add" },
            "Delete Column": { name: "Delete Column", icon: "delete" },
            "sep1": "---------",
            "Add Row Above": { name: "Add Row Above", icon: "add" },
            "Add Row Below": { name: "Add Row Below", icon: "add" },
            "Delete Row": { name: "Delete Row", icon: "delete" },
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
      var cellType = this.state.activeCellInfo.cellType;
      var ruleIndex = this.state.activeRuleIndex;
      var modelIndex = this.state.activeCellInfo.modelIndex;
      var dtDatas = this.state.dtData;
      var numberOfRules = this.state.dtData.rules.length;
      var numberOfConditions = this.state.dtData.names.conditions.length;
      var numberOfActions = this.state.dtData.names.actions.length;

      if (command == "Add Column Right") {
        ruleIndex++;
        dtDatas.rules.splice(ruleIndex, 0, this.createNewRule());
      } else if (command == "Add Column Left") {
        if (cellType === 'condition' || cellType === 'action') {
          alert('Cannot add column Left here..');
          return;
        }
        dtDatas.rules.splice(ruleIndex, 0, this.createNewRule());
      } else if (command == "Delete Column" && numberOfRules != 1) {
        dtDatas.rules.splice(ruleIndex, 1);
      } else if (command == "Add Row Above" && (cellType == "condition" || cellType == "ruleCondition")) {
        dtDatas.names.conditions.splice(modelIndex, 0, "");
        for (var i = 0; i < numberOfRules; i++) {
          dtDatas.rules[i].conditions.splice(modelIndex, 0, "");
        }
      } else if (command == "Add Row Below" && (cellType == "condition" || cellType == "ruleCondition")) {
        modelIndex++;
        dtDatas.names.conditions.splice(modelIndex, 0, "");
        for (var i = 0; i < numberOfRules; i++) {
          dtDatas.rules[i].conditions.splice(modelIndex, 0, "");
        }
      } else if (command == "Add Row Above" && (cellType == "action" || cellType == "ruleAction")) {
        dtDatas.names.actions.splice(modelIndex, 0, "");
        for (var i = 0; i < numberOfRules; i++) {
          dtDatas.rules[i].actions.splice(modelIndex, 0, "");
        }
      } else if (command == "Add Row Below" && (cellType == "action" || cellType == "ruleAction")) {
        modelIndex++;
        dtDatas.names.actions.splice(modelIndex, 0, "");
        for (var i = 0; i < numberOfRules; i++) {
          dtDatas.rules[i].actions.splice(modelIndex, 0, "");
        }
      } else if (command == "Delete Row" && (cellType == "condition" || cellType == "ruleCondition") && numberOfConditions != 1) {
        dtDatas.names.conditions.splice(modelIndex, 1);
        for (var i = 0; i < numberOfRules; i++) {
          dtDatas.rules[i].conditions.splice(modelIndex, 1);
        }
      } else if (command == "Delete Row" && (cellType == "action" || cellType == "ruleAction") && numberOfActions != 1) {
        dtDatas.names.actions.splice(modelIndex, 1);
        for (var i = 0; i < numberOfRules; i++) {
          dtDatas.rules[i].actions.splice(modelIndex, 1);
        }
      }
      this.setState({ dtData: dtDatas });
      console.log(JSON.stringify(this.state.dtData));
    };
    
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

    handleCellFocusChanged(cellInfo, ruleIndex) {
      this.setState({ activeCellInfo: cellInfo });
      this.setState({activeRuleIndex: ruleIndex});
    }

    handleCellValueChanged(cellValue) {
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
            <Theader myRuleIndex={this.state.dtData.rules} />
            <ConditionCells conditions={this.state.dtData.names.conditions} rules={this.state.dtData.rules} handleCellValueChanged={this.handleCellValueChanged} handleCellFocusChanged={this.handleCellFocusChanged}/>
            <ActionCells actions={this.state.dtData.names.actions} rules={this.state.dtData.rules} handleCellValueChanged={this.handleCellValueChanged} handleCellFocusChanged={this.handleCellFocusChanged}/>
          </table>
        );
      }

    }
  }

  return DecisionTable;
}
);
