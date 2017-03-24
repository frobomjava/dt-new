define(['react', 'jquery', 'jquery.ui'], function (React, $) {

  var LogItems = React.createClass({
    render: function() {
      var logData = this.props.data;

      function createLogItems(item) {
        return <li key={item.id} >
                <div className="activity">
                  <b>{item.user.userName}</b> {item.action} {item.resourceUrl}&nbsp;
                  {item.resourceType} <br/> <time dateTime={item.date}>{item.date}</time>
                </div>
              </li>
      }

      var activityItems = logData.map(createLogItems);

      return (
        <ul className="LogList">
          {activityItems}
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
      var self = this;

      var url = '/project/in/' + projectId + '/get/activities';

      $.getJSON(url, function (activities) {
        console.log("Got JSON Data");
        console.log(JSON.stringify(activities));
        self.setState({ items: activities });
        console.log("ProjectLog state has been set");
      });

      console.log("new component will mount");
    },

    addItem: function(data) {
      console.log('*** ProjectLog addItem ***');
      //data.key = new Date();
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
          <div className="title">
            <h4>Activity</h4>
          </div>
          <div id="LogItemContainer">
            <LogItems data={this.state.items}/>
          </div>
        </div>
      );
    },
    componentDidMount: function() {
      var self = this;

      io.socket.on('new-activity', function (data) {
        console.log('+++++ ProjectLog new-activity socket.on +++++');
        console.log('data in new-activity : ' + JSON.stringify(data));
        self.addItem(data);
      });

    }
  });
  return ProjectLog;
});
