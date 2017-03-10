define(['react', 'jquery', 'jquery.ui'], function (React, $) {

  var LogItems = React.createClass({
    render: function() {
      var logData = this.props.data;

      function createLogItems(item) {
        return <li key={item.key}>{item.time}  {item.resource.userName} {item.text} {item.resource.name} {item.resource.resourceType}</li>
      }

      var logItems = logData.map(createLogItems);

      return (
        <ul className="LogList">
          {logItems}
        </ul>
      );
    }
  });

  var ProjectLog = React.createClass({
    getInitialState: function() {
      return {
        items: []
      };
    },
    componentWillMount() {
      PubSub.subscribe("LogEvent", this.addItem);
    },
    addItem: function(msg, data) {
      console.log('*** ProjectLog addItem ***');
      console.log('data : ' + data);
      var itemArray = this.state.items;

      itemArray.push(data);

      this.setState({
       items: itemArray
      });
    },
    render: function() {
      return (
        <div className="LogContainer">
          <ul>
            <LogItems data={this.state.items}/>
          </ul>
        </div>
      );
    }
  });
  return ProjectLog;
});
