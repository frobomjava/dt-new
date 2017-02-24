var ProjectUtil = require('../utils/ProjectUtil.js');
module.exports = function(req, res, next) {

  console.log('req.projectId in projectAuth : ' + req.param('projectId'));
  console.log('signed in user id :' + req.user.id);
  var foundProject = {};
  async.series(
    [
      function checkUserIsProjectOwner(callback) {
        var options = {
          id: req.param('projectId'),
          owner: req.user.id
        };
        ProjectUtil.findProjectByOwnerUser(options, function (err, project) {
          if (err) {
            return callback();
          }
          if (project) {
            return next();
          }
        });
      },
      function findProject(callback) {
        ProjectUtil.findProjectByPopulatingMembers(req.param('projectId'), function (err, project) {
          if (err) {
            return callback(err);
          }
          foundProject = project;
          return callback();
        });
      },
      function checkUserIsProjectMember(callback) {
        var result = foundProject.members.filter(function (member) {
          return member.id == req.user.id;
        });

        if (result.length) {
          return next();
        }
        return callback();
      }

    ],
    function done(err) {
      return res.view('403');
    }
  );
};
