/**
 * ProjectController
 *
 * @description :: Server-side actions for handling incoming requests.
 * @help        :: See http://sailsjs.com/docs/concepts/controllers
 */
var ProjectUtil = require('../utils/ProjectUtil.js');
module.exports = {

  create: function (req, res) {
    console.log("projectName : " + req.param('projectName'));

    var projectData = {
      projectName: req.param('projectName'),
      owner: req.user.id,
      url: process.cwd() + '/projects' + '/' + req.user.userName + '/' + req.param('projectName')
    };

    var createdProject = null;

    async.series([
        function validate(callback) {
          ProjectUtil.validateProjectCreation(projectData, function (err) {
            if (err) {
              return callback(err);
            }
            console.log("Validation passed!");
            return callback();
          });
        },
        function createProject(callback) {
          ProjectUtil.createProject(projectData, function (err, project) {
            if (err) {
              return callback(err);
            }
            createdProject = project;
            return callback();
          });
        },
        function createProjectDirectory(callback) {
          ProjectUtil.createProjectDirectory(projectData.url, function (err) {
            if (err) {
              return callback(err);
            }
            return callback();
          });
        }
      ],
      function done(err) {
        if (err) {
          return res.json(err);
        }
        return res.json(createdProject);
      });
  },

  getAll: function (req, res) {
    var data = {
      projects: [],
      memberProjects: [],
      userName: req.user.userName
    };
    async.series(
      [
        function getOwnProjects(callback) {
          var options = {
            owner: req.user.id
          };
          ProjectUtil.findProjectsByOwnerUser(options, function (err, projects) {
            if (err) {
              return callback(err);
            }
            data.projects = projects;
            return callback();
          });
        },
        function getMemberProjects(callback) {
          ProjectUtil.findProjectsByMemberUser(req.user.id, function (err, projects) {
            if (err) {
              return callback(err);
            }
            data.memberProjects = projects;
            return callback();
          });
        }
      ],
      function (err) {
        if (err) {
          return res.json(err);
        }
        return res.json(data);
      }
    );

  },

  delete: function (req, res) {
    var projectId = req.param('projectId');
    Project.destroy({
      id: projectId
    }).exec(function (err) {
      if (err) {
        console.log(JSON.stringify(err));
        return res.json(err);
      }
      res.ok();
    });

  },

  update: function (req, res) {

  },

  enter: function (req, res) {
    console.log("---enter workspace---");
    return res.view('workspace', {
      layout: null,
      projectId: req.param('projectId')
    });
  },

  setting: function (req, res) {
    console.log("---enter setting---");
    return res.view('setting', {
      layout: null,
      projectId: req.param('projectId'),
      projectName: 'To do here'
    });
  },

  addMember: function (req, res) {
    var userName = req.param('userName');
    var projectId = req.param('projectId');
    ProjectUtil.addMemberToProject(userName, projectId, function(err, addedUser) {
      if (err) {
        console.log("To log here == addMember function");
        res.serverError(err);
      }
      console.log("New addMember function");
      res.json(addedUser);
    });
  },

  getMembers: function (req, res) {
    console.log('---getMember New---');
    Project.findOne({
        id: req.param('projectId')
      })
      .populate('members', {
        sort: 'userName ASC'
      })
      .exec(function (err, project) {
        if (err) {
          return res.json(err);
        }
        return res.json(project.members);
      });
  },

  removeMember: function (req, res) {
    console.log("new removeMember function");
    var userId = req.param('userId');
    var projectId = req.param('projectId');
    ProjectUtil.removeMemberFromProject(userId, projectId, function(err, updatedMembers) {
      if (err) {
        return res.json(err);
      }
      return res.json(updatedMembers);
    });
  },

  resourceTree: function (req, res) {
    var projectId = req.param('projectId');
    console.log("Resource Tree Action");

    var data = {};
    async.series(
      [
        function (callback) {
          Project.findOne({
            id: projectId
          }).populate('resources').exec(function (err, project) {
            if (err) {
              return res.serverError(err);
            }
            data.project = project;
            if (project) {
              callback();
              console.log(JSON.stringify(project));
            }
          });
        },

        function success(callback) {
          //console.log("Printing data ***********");
          data.project.resources.forEach(function (resource) {
            //console.log("Printing each resource");
            console.log(JSON.stringify(resource, ['name', 'children']));
            //console.log("Now will print children");
            //console.log(JSON.stringify(resource.children));
            resource.children.forEach(function (child) {
              //console.log(child.name);
            });
          });

          //console.log("Printing json data *********************");
          delete data.project.updatedAt;
          delete data.project.createdAt;
          delete data.project.id;
          delete data.project.createdBy;
          data.project.name = data.project.projectName;
          data.project.resourceType = 'project';
         // console.log(JSON.stringify(data.project));
          res.json(data.project);
        },

        function (err) {
          return res.json(err);
        }
      ]
    );

  },


  joinSocket: function (req, res) {
    console.log("join socket entered");
    if (!req.isSocket) {
      return res.badRequest();
    }

    sails.sockets.join(req, req.param('projectId'), function (err) {
      if (err) {
        return res.serverError(err);
      }
    });
    res.json("join success");
  }

};
