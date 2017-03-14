define(['react', 'jquery', 'jquery.ui'], function (React, $) {

  var LogItems = React.createClass({
    render: function() {
      var logData = this.props.data;

      function createLogItems(item) {
        return <li key={item.key}>{item.time}  {item.userName} {item.text} {item.name} {item.resourceType}</li>
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
    // componentWillMount() {
    //   PubSub.subscribe("LogEvent", this.addItem);
    // },
    addItem: function(data) {
      console.log('*** ProjectLog addItem ***');
      data.key = new Date();
      console.log('data : ' + JSON.stringify(data));

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
    },
    componentDidMount: function() {
      var self = this;
      io.socket.on('new-resource', function (data) {
        console.log('+++++ ProjectLog new-resource socket.on +++++');
        var time = new Date(new Date().getTime()).toLocaleTimeString();
        data.time = time;
        data.text = 'created ';
        self.addItem(data);
      });

      io.socket.on('delete-resource', function (data) {
        console.log("DeleteSocketBroadCast");
        console.log(JSON.stringify(data));
        var time = new Date(new Date().getTime()).toLocaleTimeString();
        data.time = time;
        data.text = 'deleted ';
        self.addItem(data);
      });

      io.socket.on('changed-resource', function (data) {
        console.log('>>>>> ProjectLog changed-resource >>>>>');
        console.log('got data : ' + JSON.stringify(data));
        var time = new Date(new Date().getTime()).toLocaleTimeString();
        data.time = time;
        data.text = 'updated ';
        self.addItem(data);
      });
    }
  });
  return ProjectLog;
});
