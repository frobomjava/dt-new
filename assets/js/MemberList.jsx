define(['react', 'jquery'], function (React, $) {

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
      var url = "/project/setting/" + projectId + "/users";

      $.getJSON(url, function(data) {
        console.log('ok, got data');
        console.log('data : ' + JSON.stringify(data));
        self.setState({members: data});
      });

      $('#btnAdd').click(function() {
        console.log('btnAdd click : ');
        var updateMember = self.state.members;
        var memberName = $('#txtMember').val();

        var url = "/project/setting/" + projectId + "/user/add/" + memberName;
        console.log("url : " + url);

        if (!self.checkMemberExist(updateMember, memberName)) {
          $.post(url, function(data) {
            console.log('ok, got data');
            console.log('data : ' + JSON.stringify(data));
            updateMember.push(data);
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
      var url = '/project/setting/' + projectId + '/user/remove/' + userId;
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

  return MemberList;

}); //define
