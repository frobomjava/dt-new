requirejs.config({
  paths: {
    'react': '/bower_components/react/react-with-addons',
    'reactdom': '/bower_components/react/react-dom',
    'jquery': '/bower_components/jquery/dist/jquery',
    'jquery.ui': '/bower_components/jquery-ui/jquery-ui',
    'bootstrap': '/bower_components/bootstrap/dist/js/bootstrap',
    'PubSub': '/bower_components/PubSubJS/src/pubsub',
    'jquery-contextMenu': '/bower_components/jQuery-contextMenu/src/jquery.contextMenu',
    'app': '/js'
  },

  shim: {
    'jquery.ui': ["jquery"],
    'bootstrap': ["jquery"],
  }

});

require(['jquery', 'react', 'reactdom','PubSub', 'jquery-contextMenu'],
function ($, React, ReactDOM, PubSub, contextmenu) {

  var MemberList = React.createClass({
    getInitialState: function(){
      return ({
        members: []
      });
    },
    checkMemberExist: function(updateMember, memberName) {
      return (updateMember.filter(function(member){ return member.userName === memberName }).length) > 0;
    },

    componentWillMount: function() {
      var self = this;
      var url = "/project/setting/" + projectName + "/users";

      $.getJSON(url, function(data) {
        console.log('ok, got data');
        console.log('data : ' + JSON.stringify(data));
        self.setState({members: data});
      });

      $('#btnAdd').click(function() {
        console.log('btnAdd click : ');
        var updateMember = self.state.members;

        if (!self.checkMemberExist(updateMember, memberName)) {
          console.log('if');
          $.ajax({
            method: "POST",
            url: "/project/setting/" + projectName + "/user/add/" + memberName
          })
          .done(function( user ) {
            console.log( "Data Saved: " + user );
            updateMember.push(user);
            self.setState({members: updateMember});
            $('.typeahead').val('');
          });
        }
      });
    },

    removeMember: function(event) {
      event.preventDefault();
      console.log(event.target);

      var self = this;
      var userId = event.target.getAttribute('value');
      console.log('userId : ' + userId);
      var url = '/project/setting/' + projectName + '/user/remove/' + userId;
      $.getJSON(url, function (data) {
        console.log('ok, got data after remove');
        console.log('data : ' + JSON.stringify(data));
        self.setState({members: data});
      });
    },

    render: function() {
      var self = this;
      return (
        <div className="list-group member-list">
        {self.state.members.map(function (member, index) {
          console.log('member.id : ' + member.id);
          return(
            <div key={index} className="list-group-item">
              <i className="fa fa-user fa-lg" aria-hidden="true"></i>&nbsp;&nbsp;
              {member.userName}

              <div className="member-delete">
                <a href="#">
                <i className="fa fa-close fa-lg" value={member.id} onClick={self.removeMember}></i></a>
              </div>
            </div>
          );
        })}
        </div>
      );
    }
  });

  ReactDOM.render( <
    MemberList / >,
    document.getElementById('memberlist')
  );

  console.log("updated memberlist.js");

}); //require
